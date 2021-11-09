import { getHooks, hook, initHooks } from "./hooks";
import { getConf, getData, getKeys, getMessage, getYml, getContractByContractName, getContractFromPath } from "./utils";
import { zencode_exec } from "zenroom";
import { addKeysToContext, addDataToContext, addNextToContext, addConfToContext } from "./context";
import { NextFunction, Request, Response } from "express";
import * as yaml from "js-yaml";
import { RestroomResult } from "./restroom-result";
import { Zencode } from "@restroom-mw/zencode";
import { BlockContext } from "./block-context";
const functionHooks = initHooks;

export default async (req: Request, res: Response, next: NextFunction) => {

  if (req.url === "/favicon.ico") {
    return;
  }

  const runHook = (hook: string, args: any) => {
    try {
      return getHooks(hook, res, args);
    } catch (e) {
      sendError(`[EXCEPTION IN REGISTERED HOOK ${hook}]`, e);
    }
  };
  /**
   * Centralized api error handling
   * @param {subject} string subject 
   * @param {e} NodeJS.ErrnoException error
   */
  const sendError = (subject: string, e: NodeJS.ErrnoException = null) => {
    const exception = e ? e.stack || e.message : "";
    const message = subject + "\n\n\n" + exception;
    if (e.code === "ENOENT") {
      getMessage(req).then( (mes)=>{
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

  /**
   * Centralized api response handling
   * @param {restroomResult} RestroomResult containing restroom result 
   * @param {res} Response endpoint response
   */
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

  /**
   * Function responsible to execute the chain
   * @param {ymlFile} string containing restroom result 
   * @param {data} object data object coming from endpoint 
   * @param {keys} object keys object coming from file 
   */
  async function executeChain(fileContents: string, data: any): Promise<any> {
    const ymlContent: any = yaml.load(fileContents);
    const startBlock: string = ymlContent.start;
  
    return await evaluateBlock(startBlock, ymlContent, data);
  }

  const getRestroomResult = async (contractName:string, data:any) : Promise<RestroomResult> => {
    const isChain = contractName.split(".")[1] === 'chain' || false;
    const keys = isChain ? "{}" : getKeys(contractName);
    try {
      return isChain ? executeChain(getYml(contractName.split(".")[0]), data) : callRestroom(data, keys, getConf(contractName), getContractByContractName(contractName), contractName);
    } catch (err){
      return await resolveRestroomResult({
        error: err
      });
    }
  }

  async function evaluateBlock(
    block: string,
    ymlContent: any,
    data: any
  ): Promise<RestroomResult> {
    console.log("Current block is " + block);

    const singleContext: BlockContext = { keys: {}, data: {}, next: null, conf: "", output:{}};
    try {

      addKeysToContext(singleContext, ymlContent.blocks[block]);
      addDataToContext(singleContext, data);
      addConfToContext(singleContext, ymlContent.blocks[block]);
      addNextToContext(singleContext, ymlContent.blocks[block]);
      const zencode = getContractFromPath(block);

      const restroomResult: any = await callRestroom(singleContext.data, JSON.stringify(singleContext.keys), singleContext.conf, zencode, block);
      if (restroomResult?.error) {
        return await resolveRestroomResult(restroomResult);
      }
      Object.assign(singleContext.output, restroomResult.result);

      await new Promise(resolve => {
        setTimeout(resolve, singleContext?.delay || 0)
      });

      if(!singleContext?.next){
        return await resolveRestroomResult({
          result: singleContext?.output,
          status: 200,
        });
      }
    } catch (err){
      return await resolveRestroomResult({
        error: err,
        errorMessage: `[CHAIN EXECUTION ERROR FOR CONTRACT ${block}]`
      });
    }
    return await evaluateBlock(singleContext.next, ymlContent, singleContext.output);
  }

  async function callRestroom(data: string, keys: string, conf:string, zencode:Zencode, contractPath:string): Promise<RestroomResult>{
    
    let restroomResult: RestroomResult = {};
    if (keys==='{}'){
      keys = null;
    }

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
          await runHook(hook.SUCCESS, { result, zencode, zenroom_errors, outcome: restroomResult });
          restroomResult.result = result;
          restroomResult.status = 200;
        })
        .then(async (json) => {
          await runHook(hook.AFTER, { json, zencode, outcome: restroomResult });
        })
        .catch(async (e) => {
          zenroom_errors = e;
          await runHook(hook.ERROR, { zenroom_errors, zencode, outcome: restroomResult });
          restroomResult.error = e;
          restroomResult.errorMessage = `[ZENROOM EXECUTION ERROR FOR CONTRACT ${contractPath}]`;
        })
        .finally(async () => {
          await runHook(hook.FINISH, { res, outcome: restroomResult });
        });
    } catch (e) {
      await runHook(hook.EXCEPTION, res);
      restroomResult.errorMessage = `[UNEXPECTED EXCEPTION FOR CONTRACT ${contractPath}]`;
      restroomResult.error = e;
    }
    return restroomResult;
  }

  let zenroom_result: string, json: string, zenroom_errors: string;
  zenroom_result = zenroom_errors = json = "";
  const contractName = req.params["0"];
  let data = getData(req, res);
  
  res.set("x-powered-by", "RESTroom by Dyne.org");
  buildEndpointResponse(await getRestroomResult(contractName, data), res);
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