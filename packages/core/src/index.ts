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

  async function callZenroom (zencode: Zencode, conf: string, data: string, keys: string): Promise<any>{
    
    let outcome : any = {
      result: null,
      status: 0,
      error: null,
      errorMessage: null
    };
    console.log(1);
    try {
      await runHook(hook.INIT, {});
      await runHook(hook.BEFORE, { zencode, conf, data, keys });
      zencode_exec(zencode.content, {
        data: Object.keys(data).length ? JSON.stringify(data) : undefined,
        keys: keys,
        conf: conf,
      })
        .then(async ({ result, logs }) => {
          console.log(result);
          zenroom_result = result;
          result = JSON.parse(result);
          await runHook(hook.SUCCESS, { result, zencode, zenroom_errors, outcome });
          outcome.result = result;
          outcome.status = 200;
        })
        .then(async (json) => {
          await runHook(hook.AFTER, { json, zencode, outcome });
          next();
        })
        .catch(async (e) => {
          zenroom_errors = e;
          await runHook(hook.ERROR, { zenroom_errors, zencode, outcome });
          //sendError("[ZENROOM EXECUTION ERROR]", e);
          outcome.error = e;
          outcome.errorMessage = "[ZENROOM EXECUTION ERROR]";
        })
        .finally(async () => {
          await runHook(hook.FINISH, { res, outcome });
          console.log("outcome is" + outcome);
          next();
          return Promise.resolve(outcome);
        });
    } catch (e) {
      await runHook(hook.EXCEPTION, res);
      //sendError("[UNEXPECTED EXCEPTION]", e);
      outcome.errorMessage = "[ZENROOM EXECUTION ERROR]";
      outcome.error = e;
      next(e);
    }
  }

  let zenroom_result: string, json: string, zenroom_errors: string;
  zenroom_result = zenroom_errors = json = "";
  const contractName = req.params["0"];
  let conf = getConf(contractName);
  let data = getData(req, res);
  let keys = getKeys(contractName);
  let zencode = await getContractOrFail(contractName);

  const outcome = await callZenroom(zencode, conf, data, keys);
  res.set("x-powered-by", "RESTroom by Dyne.org");

  console.log(outcome);
  if (outcome.error) {
    sendError(outcome.errorMessage, outcome.error);
  } else {
    res.status(200).json(outcome.result);
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