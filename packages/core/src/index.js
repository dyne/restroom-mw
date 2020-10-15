import { Zencode } from "@restroom-mw/zencode";
import { ZENCODE_DIR } from "@restroom-mw/utils";
import { callHook, hook, initHooks } from "./hooks";
import { getConf, getData, getKeys, getMessage } from "./utils";
const zenroom = require("zenroom");
const capcon = require("capture-console");

const functionHooks = initHooks;

export default async (req, res, next) => {
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
      res.status(404).send(await getMessage(req));
      return;
    }
  }
  try {
    var stderr = capcon.captureStderr(function scope() {
      callHook(hook.BEFORE, res, zencode);
      zenroom
        .script(zencode.content)
        .conf(getConf(contractName))
        .data(getData(res, req))
        .keys(getKeys(contractName))
        .print_err((text) => errors.push(text))
        .print((text) => {
          result = result.concat(text);
        })
        .error(() => {
          callHook(hook.ERROR, res, { errors, zencode });
          res.set("Content-Type", "text/plain");
          res.status(500);
        })
        .success(() => {
          callHook(hook.SUCCESS, res, { result, zencode });
          res.status(200);
          res.json(JSON.parse(result));
        })
        .zencode_exec();
    });
    callHook(hook.AFTER, res, { result, zencode });
  } catch (e) {
    console.error(e, stderr);
    res.set("Content-Type", "text/plain");
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
