import { Zencode } from "@restroom-mw/zencode";
import { ZENCODE_DIR, getYml } from "@restroom-mw/utils";
import { getHooks, hook, initHooks } from "./hooks";
import { getConf, getData, getKeys, getMessage } from "./utils";
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
  /**
   * Centralized api error handling
   * @param {subject} string subject 
   * @param {e} NodeJS.ErrnoException error
   */
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
  async function executeChain(ymlFile: string, data: any, keys:any): Promise<any> {

    const fileContents = getYml(ymlFile);
    const ymlContent: any = yaml.load(fileContents);
  
    const context: Map<string, any> = new Map<string, any>();
    const firstBlock: string = ymlContent.first;
  
    return await evaluateBlock(firstBlock, context, ymlContent, data, keys);
  }

  /**
   * Function that checks that block type is in the defined enum
   * @param {blockName} string containing restroom result 
   */
  const getBlockTypeOrFail = (blockName:any) : string =>{
    if (Object.values(BLOCK_TYPE).includes(blockName?.type)) {
      return blockName.type;
    } else {
      throw new TypeError(`[EXCEPTION: ${blockName?.type} is not a valid block type]`);
    }
  }

  const getRestroomResult = async (contractName:string, data:any, keys:any) : Promise<RestroomResult> => {
    const isChain = contractName.split(".")[1] === 'chain' || false;
    return isChain ? await executeChain(contractName.split(".")[0], data, keys) : await callRestroom(data, keys, contractName)
  }

  async function evaluateBlock(
    block: string,
    context: Map<string, any>,
    ymlContent: any,
    endpointData: any,
    fileKeys:any
  ): Promise<RestroomResult> {
    console.log("Current block is " + block);
    const singleContext: any = { keys: fileKeys || {}, data: {}};
    
    try {
      console.log(context);
      updateContextUsingYamlFields(singleContext, block, ymlContent, context);
      addKeysToContext(singleContext, block);
      addDataToContext(singleContext, endpointData[block]);
      console.log(context);
      iterateAndEvaluateExpressions(context.get(block), context);
      const blockType = getBlockTypeOrFail(ymlContent.blocks[block]);
      if (BLOCK_TYPE.ZENROOM === blockType) {
        const restroomResult: any = await callRestroom(singleContext.data, JSON.stringify(singleContext.keys), block);
        if (restroomResult?.error) {
          return await resolveRestroomResult(restroomResult);
        }
        singleContext.output = restroomResult.result;
        updateContext(singleContext, context, block);
      } else if (BLOCK_TYPE.OUTPUT === blockType) {
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
    return await evaluateBlock(singleContext.next, context, ymlContent, data, keys);
  }

  async function callRestroom(data: string, keys: string, contractName:string): Promise<RestroomResult>{
    
    let conf = getConf(contractName);
    let restroomResult: RestroomResult = {};

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
          await runHook(hook.SUCCESS, { result, zencode, zenroom_errors, outcome: restroomResult });
          restroomResult.result = result;
          restroomResult.status = 200;
        })
        .then(async (json) => {
          await runHook(hook.AFTER, { json, zencode, outcome: restroomResult });
          next();
        })
        .catch(async (e) => {
          zenroom_errors = e;
          await runHook(hook.ERROR, { zenroom_errors, zencode, outcome: restroomResult });
          restroomResult.error = e;
          restroomResult.errorMessage = `[ZENROOM EXECUTION ERROR FOR CONTRACT ${contractName}]`;
          next(e);
          //return outcome;
        })
        .finally(async () => {
          await runHook(hook.FINISH, { res, outcome: restroomResult });
          next();
        });
    } catch (e) {
      await runHook(hook.EXCEPTION, res);
      restroomResult.errorMessage = `[UNEXPECTED EXCEPTION FOR CONTRACT ${contractName}]`;
      restroomResult.error = e;
      //next(e);
      //return outcome;
    }
    return restroomResult;
  }

  let zenroom_result: string, json: string, zenroom_errors: string;
  zenroom_result = zenroom_errors = json = "";
  const contractName = req.params["0"];
  let data = getData(req, res);
  let keys = getKeys(contractName);
  
  res.set("x-powered-by", "RESTroom by Dyne.org");
  buildEndpointResponse(await getRestroomResult(contractName, data, keys), res);
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