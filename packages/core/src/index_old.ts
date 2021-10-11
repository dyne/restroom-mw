import { Zencode } from "@restroom-mw/zencode";
import { ZENCODE_DIR } from "@restroom-mw/utils";
import { getHooks, hook, initHooks } from "./hooks";
import { getConf, getData, getKeys, getMessage, getYml } from "./utils";
import { addKeysToContext, storeContext, iterateAndEvaluateExpressions, updateContext, BLOCK_TYPE } from "./zenchain";
import { zencode_exec } from "zenroom";
import { NextFunction, Request, Response } from "express";
import * as yaml from "js-yaml";
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

  async function executeChain(ymlFile: string, data: any): Promise<any> {

    const fileContents = getYml(ymlFile);
    const ymlContent: any = yaml.load(fileContents);
  
    const context: Map<string, any> = new Map<string, any>();
    const firstBlock: string = ymlContent.first;
  
    return await evaluateBlock(firstBlock, context, ymlContent, data);
  }

  async function evaluateBlock(
    block: string,
    context: Map<string, any>,
    ymlContent: any,
    data: any
  ): Promise<any> {
    console.log("Current block is " + block);
    const singleContext: any = { keys: {}, data: data};
  
    addKeysToContext(singleContext, block);
    storeContext(singleContext, block, ymlContent, context);
    iterateAndEvaluateExpressions(context.get(block), context);
  
    if (ymlContent.blocks[block].type === BLOCK_TYPE.ZENROOM) {
      let conf = getConf(block);
      const zenroomResult: any = await callZenroom2(block, singleContext);
      singleContext.output = JSON.parse(zenroomResult.result);
      updateContext(singleContext, context, block);
    } else if (ymlContent.blocks[block].type === BLOCK_TYPE.OUTPUT) {
      console.log("HERE");
      //return new Promise((resolve) => {
        res.status(200).json(singleContext.output);
        //resolve(singleContext.output);
      //});
    }
    return await evaluateBlock(singleContext.next, context, ymlContent, data);
  }

  async function callZenroom2(block: string, singleContext: any) {

    let zencode = await getContractOrFail(block);
  
    const zenroomResult: any = await zencode_exec(zencode.content, {
      data: JSON.stringify(singleContext.data),
      keys: JSON.stringify(singleContext.keys),
    });
    return zenroomResult;
  }

  async function callZenroom(contractName: string, conf: any, data: any, keys: any) {
    let zenroom_result: string, json: string, zenroom_errors: string;
    zenroom_result = zenroom_errors = json = "";

    try {
      await runHook(hook.INIT, {});
      let zencode = await getContractOrFail(contractName);
      res.set("x-powered-by", "RESTroom by Dyne.org");
      await runHook(hook.BEFORE, { zencode, conf, data, keys });
      zencode_exec(zencode.content, {
        data: data,
        keys: keys
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
          console.log(e);
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
    return zenroom_result;
  }

  let zenroom_result: string, json: string, zenroom_errors: string;
  zenroom_result = zenroom_errors = json = "";
  const contractName = req.params["0"];
  const isChain = contractName.split(".")[1] == 'chain' ? true : false;
  let conf = getConf(contractName);
  let data = getData(req, res);
  let keys = getKeys(contractName);

  if (isChain){
    const ymlName = contractName.split(".")[0];
    await executeChain(ymlName, data);
  } else {
    await callZenroom(contractName, conf, data, keys);
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
