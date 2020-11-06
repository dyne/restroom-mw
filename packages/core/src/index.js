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
      }
    }
  };

  const runHook = (hook, args) => {
    const hooks = getHooks(hook, res, args);
    hooks
      .then((r) => {
        return r;
      })
      .catch((e) => {
        sendError(`Exception in hook ${hook}:`, e);
      });
  };

  const sendError = (subject, e = null) => {
    const exception = e ? e.stack || e.message : "";
    const message = subject + "\n\n\n" + exception;
    if (!res.headersSent) {
      res.status(500).json({
        zenroom_errors: zenroom_errors,
        result: result,
        exception: message,
      });
      if (e) next(e);
    }
  };

  process.on("unhandledRejection", (e) => {
    sendError(`[Inside 'uncaughtException' event]`, e);
  });

  process.on("uncaughtException", (e) => {
    sendError(`[Inside 'uncaughtException' event]`, e);
  });

  runHook(hook.INIT, {});
  res.set("x-powered-by", "RESTroom by Dyne.org");
  let result, json, zenroom_errors;
  result = zenroom_errors = json = "";
  const contractName = req.params["0"];
  let zencode = await getContractOrFail(contractName);
  let conf = getConf(contractName);
  let data = getData(req, res);
  let keys = getKeys(contractName);

  runHook(hook.BEFORE, { zencode, conf, data, keys });
  try {
    zencode_exec(zencode.content, { data: data, keys: keys, conf: conf })
      .then((r) => {
        runHook(hook.SUCCESS, { result, zencode, zenroom_errors });
        res.status(200).json(JSON.parse(r));
        return r;
      })
      .then((r) => {
        result = r;
        return JSON.parse(r);
      })
      .then((json) => {
        runHook(hook.AFTER, { json, zencode });
        next();
      })
      .catch((e) => {
        zenroom_errors = e;
        runHook(hook.ERROR, { zenroom_errors, zencode });
        sendError("[ZENROOM EXECUTION ERROR]");
      })
      .finally(() => {
        runHook(hook.FINISH, res);
        next();
      });
  } catch (e) {
    runHook(hook.EXCEPTION, res);
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
