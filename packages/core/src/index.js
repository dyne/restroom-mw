import { Zencode } from "@restroom-mw/zencode";
import { ZENCODE_DIR } from "@restroom-mw/utils";
import { getHooks, hook, initHooks } from "./hooks";
import { getConf, getData, getKeys, getMessage } from "./utils";
import { zencode_exec } from "zenroom";
const functionHooks = initHooks;

export default async (req, res, next) => {
  if (req.url === "/favicon.ico") {
    return;
  }

  const getContractOrFail = async (name) => {
    try {
      return Zencode.byName(name, ZENCODE_DIR);
    } catch (err) {
      if (err.code === "ENOENT") {
        const message = await getMessage(req);
        res.status(404).send(message);
        next(err);
      }
    }
  };

  const runHook = (hook, args) => {
    try {
      return getHooks(hook, res, args);
    } catch (e) {
      sendError(`[EXCEPTION IN REGISTERED HOOK ${hook}]`, e);
    }
  };

  const sendError = (subject, e = null) => {
    const exception = e ? e.stack || e.message : "";
    const message = `${subject}\n\n${zenroom_errors}\n\n${zenroom_errors}`;

    if (!res.headersSent) {
      res.status(500);
      const error = new Error();
      error.name = subject;
      error.stack = exception;
      error.message = zenroom_errors;
      next(error);
    }
  };

  let zenroom_result, json, zenroom_errors;
  zenroom_result = zenroom_errors = json = "";
  const contractName = req.params["0"];
  let conf = getConf(contractName);
  let data = getData(req, res);
  let keys = getKeys(contractName);

  try {
    await runHook(hook.INIT, {});
    let zencode = await getContractOrFail(contractName);
    if (!zencode) return;
    res.set("x-powered-by", "RESTroom by Dyne.org");
    await runHook(hook.BEFORE, { zencode, conf, data, keys });
    zencode_exec(zencode.content, {
      data: JSON.stringify(data),
      keys: keys,
      conf: conf,
    })
      .then(async ({ result, logs }) => {
        zenroom_result = result;
        zenroom_errors = logs;
        await runHook(hook.SUCCESS, { result, zencode, zenroom_errors });
        res.status(200).json(JSON.parse(result));
      })
      .then(async (json) => {
        await runHook(hook.AFTER, { json, zencode });
        next();
      })
      .catch(async (e) => {
        zenroom_errors = e.result;
        zenroom_errors = e.logs;
        await runHook(hook.ERROR, { zenroom_errors, zencode });
        sendError("[ZENROOM EXECUTION ERROR]");
      })
      .finally(async () => {
        await runHook(hook.FINISH, res);
        next();
      });
  } catch (e) {
    await runHook(hook.EXCEPTION, res);
    sendError("[UNEXPECTED EXCEPTION]", e);
    next(e);
  }
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
