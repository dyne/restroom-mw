import { Zencode } from "@restroom-mw/zencode";
import { ZENCODE_DIR } from "@restroom-mw/utils";
import { getHooks, hook, initHooks } from "./hooks";
import { getConf, getData, getKeys, getMessage, getYml } from "./utils";
import { zencode_exec } from "zenroom";
import { addKeysToContext, storeContext, iterateAndEvaluateExpressions, updateContext, BLOCK_TYPE } from "./zenchain";
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
    endpointData: any
  ): Promise<any> {
    console.log("Current block is " + block);
    //take it from endpointData using proper contract key!
    const singleContext: any = { keys: {}, data: {}};
    addKeysToContext(singleContext, block);
    storeContext(singleContext, block, ymlContent, context);
    iterateAndEvaluateExpressions(context.get(block), context);
  
    if (ymlContent.blocks[block].type === BLOCK_TYPE.ZENROOM) {
      let conf = getConf(block);
      let zencode = await getContractOrFail(block);

      const restroomResult: any = await callRestroom(zencode, conf, singleContext.data, JSON.stringify(singleContext.keys), block);
      if (restroomResult?.error) {
        return new Promise((resolve) => {
          resolve(restroomResult);
        });
      }
      singleContext.output = restroomResult.result;
      updateContext(singleContext, context, block);
    } else if (ymlContent.blocks[block].type === BLOCK_TYPE.OUTPUT) {

      return new Promise((resolve) => {
        let outcome : any = {
          result: null,
          status: 0,
          error: null,
          errorMessage: null
        };
        outcome.result = singleContext.output;
        outcome.status = 200;
        resolve(outcome);
      });
    }
    return await evaluateBlock(singleContext.next, context, ymlContent, data);
  }

  async function callRestroom(zencode: Zencode, conf: string, data: string, keys: string, contractName:string): Promise<any>{
    
    let outcome : any = {
      result: null,
      status: 0,
      error: null,
      errorMessage: null
    };

    try {
      await runHook(hook.INIT, {});
      await runHook(hook.BEFORE, { zencode, conf, data, keys });
      await zencode_exec(zencode.content, {
        data: Object.keys(data).length ? JSON.stringify(data) : undefined,
        keys: keys,
        conf: conf,
      })
        .then(async ({ result }) => {
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
          outcome.error = e;
          outcome.errorMessage = `[ZENROOM EXECUTION ERROR FOR CONTRACT ${contractName}]`;
          next(e);
          return outcome;
        })
        .finally(async () => {
          await runHook(hook.FINISH, { res, outcome });
          next();
        });
    } catch (e) {
      await runHook(hook.EXCEPTION, res);
      outcome.errorMessage = `[UNEXPECTED EXCEPTION FOR CONTRACT ${contractName}]`;
      outcome.error = e;
      next(e);
      return outcome;
    }
    return outcome;
  }

  let zenroom_result: string, json: string, zenroom_errors: string;
  zenroom_result = zenroom_errors = json = "";
  const contractName = req.params["0"];
  let conf = getConf(contractName);
  let data = getData(req, res);
  let keys = getKeys(contractName);
  
  const isChain = contractName.split(".")[1] === 'chain' || false;

  let outcomeRes: any = null;
  if (isChain){
    const ymlName = contractName.split(".")[0];
    outcomeRes = await executeChain(ymlName, data);
  } else {
    let zencode = await getContractOrFail(contractName);
    outcomeRes = await callRestroom(zencode, conf, data, keys, contractName);
  }  

  res.set("x-powered-by", "RESTroom by Dyne.org");
  if (outcomeRes?.error) {
    sendError(outcomeRes.errorMessage, outcomeRes.error);
  } else {
    res.status(outcomeRes.status).json(outcomeRes?.result);
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