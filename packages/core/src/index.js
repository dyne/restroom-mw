import fs from "fs";
import readdirp from "readdirp";
import fuzzball from "fuzzball";
import { Zencode } from "@restroom-mw/zencode";
import { ZENCODE_DIR, CUSTOM_404_MESSAGE } from "@restroom-mw/utils";
const zenroom = require("zenroom");
const capcon = require("capture-console");

export const getData = function (res, req) {
  return res.locals?.zenroom_data || req.body.data || {};
};

export const getKeys = () => {
  return res.locals?.zenroom_keys || req.body.keys || {};
};

const hook = {
  INIT: "onInit",
  BEFORE: "onBefore",
  AFTER: "onAfter",
  SUCCESS: "onSuccess",
  ERROR: "onError",
  EXCEPTION: "onException",
  FINISH: "onFinish",
};

const callHook = (hook, res, ...args) => {
  const hooks = res.locals[hook] || [];
  for (const fn of hooks) {
    fn(...args);
  }
};

const functionHooks = {};

for (const h of Object.values(hook)) {
  functionHooks[h] = (res, fn) => {
    let locals = res.locals[h] || [];
    locals.push(fn);
    res.locals[h] = locals;
  };
}

export default (req, res, next) => {
  if (req.url === "/favicon.ico") {
    return;
  }
  callHook(hook.INIT, res);
  res.append("x-powered-by", " RESTROOM by Dyne.org");
  let result = "";
  const errors = [];
  const contractName = req.params["0"];
  let zencode = null;
  try {
    zencode = Zencode.byName(contractName, ZENCODE_DIR);
  } catch (err) {
    if (err.code === "ENOENT") {
      if (CUSTOM_404_MESSAGE) {
        res.status(404).send(CUSTOM_404_MESSAGE);
        return;
      }
      let message = "<h2>404: This contract does not exists</h2>";
      let choices = [];
      const baseUrl = req.originalUrl.replace(contractName, "");
      readdirp(ZENCODE_DIR, { fileFilter: "*.zen" })
        .on("data", (file) => {
          choices.push(baseUrl + file.path.slice(0, -4));
        })
        .on("end", () => {
          const fuzzy = fuzzball.extract(contractName, choices, {
            limit: 1,
            cutoff: 60,
          });
          if (fuzzy.length) {
            message += `<p>Maybe you were looking for <strong><a href="${baseUrl}${fuzzy[0][0]}">${fuzzy[0][0]}</a></strong></p>`;
          }
          if (choices.length) {
            const listEndpoint = choices.map((e) => `<a href="${e}">${e}</a>`);
            message += `<h4>Other contract's endpoints are </h4><ul>${listEndpoint.join(
              "<br/>"
            )}</ul>`;
          }
          res.status(404).send(message);
        });
      return;
    }
  }
  let _conf,
    _keys = null;
  try {
    _conf =
      fs.readFileSync(`${ZENCODE_DIR}/${contractName}.conf`).toString() || null;
    _keys =
      fs.readFileSync(`${ZENCODE_DIR}/${contractName}.keys`).toString() || null;
  } catch (err) {}
  var stderr = capcon.captureStderr(function scope() {
    callHook(hook.BEFORE, res, zencode);
    zenroom
      .script(zencode.content)
      .conf(_conf)
      .data(getData(res, req))
      .keys(_keys)
      .print_err((text) => errors.push(text))
      .print((text) => {
        result = result.concat(text);
      })
      .error(() => {
        callHook(hook.ERROR, res, { errors, zencode });
        res.status(500);
      })
      .success(() => {
        callHook(hook.SUCCESS, res, { result, zencode });
      })
      .zencode_exec();
  });
  try {
    callHook(hook.AFTER, res, { result, zencode });
    res.json(JSON.parse(result));
  } catch (e) {
    console.error(e, stderr);
    res.status(500).send(stderr);
    callHook(hook.EXCEPTION, res, { stderr });
  }
  callHook(hook.FINISH, res);
};

export const {
  onInit,
  onBefore,
  onAfter,
  onSuccess,
  onError,
  onException,
  onFinish,
} = functionHooks;

export { Restroom } from "./restroom";
