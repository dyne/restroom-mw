import { Zencode } from "@restroom-mw/zencode";
import { ZENCODE_DIR } from "@restroom-mw/utils";
import { getHooks, hook, initHooks } from "./hooks";
import { getConf, getData, getKeys, getMessage } from "./utils";
import { zencode_exec } from "zenroom";
import { NextFunction, Request, Response } from "express";
const functionHooks = initHooks;

export default async (req: Request, res: Response, next: NextFunction) => {
  if (req.url === "/favicon.ico") {
    return;
  }

  const getContractOrFail = async (name: string) => {
    try {
      return Zencode.byName(name, ZENCODE_DIR);
    } catch (err) {
      if (err.code === "ENOENT") {
        const message = await getMessage(req);
        res.status(404).send(message);
      }
    }
  };

  const runHook = (hook: string, args: any) => {
    try {
      return getHooks(hook, res, args);
    } catch (e) {
      sendError(`[EXCEPTION IN REGISTERED HOOK ${hook}]`, e);
    }
  };

  const sendError = (subject: string, e: Error = null) => {
    const exception = e ? e.stack || e.message : "";
    const message = subject + "\n\n\n" + exception;
    if (!res.headersSent) {
      res.status(500).json({
        zenroom_errors: zenroom_errors,
        result: zenroom_result,
        exception: message,
      });
      if (e) next(e);
    }
  };

  let zenroom_result: string, json: string, zenroom_errors: string;
  zenroom_result = zenroom_errors = json = "";
  const contractName = req.params["0"];
  let conf = getConf(contractName);
  let data = getData(req, res);
  let keys = getKeys(contractName);

  try {
    await runHook(hook.INIT, {});
    let zencode = await getContractOrFail(contractName);
    res.set("x-powered-by", "RESTroom by Dyne.org");
    await runHook(hook.BEFORE, { zencode, conf, data, keys });
    zencode_exec(zencode.content, {
      data: Object.keys(data).length ? JSON.stringify(data) : undefined,
      keys: keys,
      conf: conf,
    })
      .then(async ({ result, logs }) => {
        zenroom_result = result;
        result = JSON.parse(result);
        await runHook(hook.SUCCESS, { result, zencode, zenroom_errors });
        res.status(200).json(result);
      })
      .then(async (json) => {
        await runHook(hook.AFTER, { json, zencode });
        next();
      })
      .catch(async (e) => {
        zenroom_errors = e;
        await runHook(hook.ERROR, { zenroom_errors, zencode });
        sendError("[ZENROOM EXECUTION ERROR]", e);
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
