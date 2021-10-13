import { Zencode } from "@restroom-mw/zencode";
import { ZENCODE_DIR } from "@restroom-mw/utils";
import { getHooks, hook, initHooks } from "./hooks";
import { getConf, getData, getKeys, getMessage, getYml } from "./utils";
import { zencode_exec } from "zenroom";
import { addKeysToContext, addDataToContext, updateContextUsingYamlFields, iterateAndEvaluateExpressions, updateContext, BLOCK_TYPE } from "./context";
import { NextFunction, Request, Response } from "express";
import * as yaml from "js-yaml";
import { RestroomResult } from "./restroom-result";
const functionHooks = initHooks;

export default async (req: Request, res: Response, next: NextFunction) => {

  if (req.url === "/favicon.ico") {
    return;
  }

  const getContract = (name: string) : Zencode => {
    return Zencode.byName(name, ZENCODE_DIR);
  };

  const runHook = (hook: string, args: any) => {
    try {
      return getHooks(hook, res, args);
    } catch (e) {
      sendError(`[EXCEPTION IN REGISTERED HOOK ${hook}]`, e);
    }
  };

  const sendError = (subject: string, e: NodeJS.ErrnoException = null) => {
    const exception = e ? e.stack || e.message : "";
    const message = subject + "\n\n\n" + exception;
    if (e.code === "ENOENT") {
      getMessage(req).then((mes)=>{
        res.status(404).send(mes);
      });
    } else{
      if (!res.headersSent) {
        res.status(500).json({
          zenroom_errors: zenroom_errors,
          result: zenroom_result,
          exception: message,
        });
        if (e) next(e);
      }
    }
  };

  const buildEndpointResponse = (restroomResult: RestroomResult, res: Response) => {
    if (restroomResult?.error) {
      sendError(restroomResult.errorMessage, restroomResult.error);
    } else {
      res.status(restroomResult.status).json(restroomResult?.result);
    }
  };

  async function resolveRestroomResult(restroomResult: RestroomResult): Promise<RestroomResult> {
    return new Promise((resolve) => {
      resolve(restroomResult);
    });
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
  ): Promise<RestroomResult> {
    console.log("Current block is " + block);
    const singleContext: any = { keys: {}, data: {}};
    
    updateContextUsingYamlFields(singleContext, block, ymlContent, context);
    addKeysToContext(singleContext, block);
    addDataToContext(singleContext, endpointData[block]);
    iterateAndEvaluateExpressions(context.get(block), context);
  
    if (ymlContent.blocks[block].type === BLOCK_TYPE.ZENROOM) {
      const restroomResult: any = await callRestroom(singleContext.data, JSON.stringify(singleContext.keys), block);
      if (restroomResult?.error) {
        return await resolveRestroomResult(restroomResult);
      }
      singleContext.output = restroomResult.result;
      updateContext(singleContext, context, block);
    } else if (ymlContent.blocks[block].type === BLOCK_TYPE.OUTPUT) {
      return await resolveRestroomResult({
        result: singleContext.output,
        status: 200,
      });
    }
    return await evaluateBlock(singleContext.next, context, ymlContent, data);
  }

  async function callRestroom(data: string, keys: string, contractName:string): Promise<RestroomResult>{
    
    let conf = getConf(contractName);
    let outcome: RestroomResult = {};

    try {
      await runHook(hook.INIT, {});
      const zencode = getContract(contractName);
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
          //return outcome;
        })
        .finally(async () => {
          await runHook(hook.FINISH, { res, outcome });
          next();
        });
    } catch (e) {
      await runHook(hook.EXCEPTION, res);
      outcome.errorMessage = `[UNEXPECTED EXCEPTION FOR CONTRACT ${contractName}]`;
      outcome.error = e;
      //next(e);
      //return outcome;
    }
    return outcome;
  }

  let zenroom_result: string, json: string, zenroom_errors: string;
  zenroom_result = zenroom_errors = json = "";
  const contractName = req.params["0"];
  let data = getData(req, res);
  let keys = getKeys(contractName);
  
  res.set("x-powered-by", "RESTroom by Dyne.org");
  const isChain = contractName.split(".")[1] === 'chain' || false;

  let restroomResult: RestroomResult;
  if (isChain){
    const ymlName = contractName.split(".")[0];
    restroomResult = await executeChain(ymlName, data);
  } else {
    restroomResult = await callRestroom(data, keys, contractName);
  }  

  buildEndpointResponse(restroomResult, res);
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