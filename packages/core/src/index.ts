import { getHooks, hook, initHooks } from "./hooks";

import {
  getConf,
  getData,
  getKeys,
  getMessage,
  getYml,
  getContractByContractName,
  getContractFromPath,
  isForEachPresent,
  isErrorResult,
  isChainLastBlock,
} from "./utils";
import { zencode_exec } from "zenroom";
import {
  addKeysToContext,
  addDataToContext,
  addNextToContext,
  addConfToContext,
  addZenFileToContext,
  createGlobalContext,
  updateGlobalContext,
  createDebugEnabledGlobalContext,
  updateGlobalContextOutput,
} from "./context";
import { NextFunction, Request, Response } from "express";
import * as yaml from "js-yaml";
import { RestroomResult } from "./restroom-result";
import { BlockOutput } from "./block-output";
import { SingleInstanceOutput } from "./single-instance-output"
import { BlockContext } from "./block-context";
import { CHAIN_EXTENSION } from "@restroom-mw/utils";
import { BlockInput } from "./block-input";
import { RestroomInput } from "./restroom-input";
import { validateForEach, 
  validateIterable, 
  validateNextBlock, 
  validateStartBlock, 
  validateZenFile,
  validatePathsInYml,  
  validateNoLoopInChain,
} from "./validations";
import { ChainInput } from "./chain-input";
const functionHooks = initHooks;

const DEBUG_MODE = 'debug';
const DOT = ".";
const EMPTY_OBJECT_STRING = "{}";
const EMPTY_STRING = "";
const FOREACH_INDEX_DEFAULT_VALUE = "myTempElement";

export default async (req: Request, res: Response, next: NextFunction) => {
  if (req.url === "/favicon.ico") {
    return;
  }

  const runHook = (hook: string, args: any) => {
    try {
      return getHooks(hook, res, args);
    } catch (e) {
      sendError({
        error: e,
        errorMessage: `[EXCEPTION IN REGISTERED HOOK ${hook}]`,
      });
    }
  };

  /**
   * Centralized api error handling
   * @param {subject} string subject
   * @param {e} NodeJS.ErrnoException error
   */
  const sendError = (restroomResult: any) => {
    const subject: string = restroomResult?.errorMessage;
    const e: NodeJS.ErrnoException = restroomResult?.error;
    const exception = e ? e.stack || e.message : EMPTY_STRING;
    const exceptionMessage = !exception ? " Please check zenroom_errors logs": exception;
    const message = subject + "\n\n\n" + exceptionMessage;
    if (e?.code === "ENOENT") {
      getMessage(req).then((mes) => {
        res.status(404).send(mes);
      });
    } else {
      if (!res.headersSent) {
        const errorOutput : any = {
          zenroom_errors: zenroom_errors,
          result: zenroom_result,
          exception: message,
        }
        if(restroomResult?.context?.debugEnabled){
          errorOutput.context = restroomResult?.context;
        }
        res.status(500).json(errorOutput);
        if (e) next(e);
      }
    }
  };

  /**
   * Centralized api response handling
   * @param {restroomResult} RestroomResult containing restroom result
   * @param {res} Response endpoint response
   */
  const buildEndpointResponse = (
    restroomResult: RestroomResult,
    res: Response
  ) => {
    if (restroomResult?.error) {
      sendError(restroomResult);
    } else {
      if(restroomResult?.context?.debugEnabled){
        const output: any = {};
        Object.assign(output, restroomResult?.result);
        output.context = restroomResult?.context;
        res.status(restroomResult.status).json(output);
      } else {
        res.status(restroomResult.status).json(restroomResult?.result);
      }
    }
  };

  async function resolveRestroomResult(
    restroomResult: RestroomResult,
    globalContext: any
  ): Promise<RestroomResult> {
    return new Promise((resolve) => {
      if (globalContext?.debugEnabled){
        restroomResult.context = globalContext;
      }
      resolve(restroomResult);
    });
  }

  /**
   * Function responsible to execute the chain
   * @param {ymlFile} string containing restroom result
   * @param {data} object data object coming from endpoint
   */
  async function executeChain(
    input: ChainInput,
  ): Promise<RestroomResult> {
    let globalContext = input.globalContext;
    const data = input.data;
    try {
      const ymlContent: any = yaml.load(input.ymlContent);
      const startBlock: string = ymlContent?.start;
      globalContext = ymlContent?.mode === DEBUG_MODE ? createDebugEnabledGlobalContext() : globalContext;

      validateStartBlock(startBlock, ymlContent);
      validateNoLoopInChain(startBlock, ymlContent);
      validatePathsInYml(ymlContent);

      return await handleBlockResult({
        block: startBlock, 
        ymlContent: ymlContent, 
        data: data, 
        globalContext: globalContext}
      );
    } catch (err) {
      return await resolveRestroomResult({
        error: err,
        errorMessage: `[CHAIN YML EXECUTION ERROR]`,
      }, globalContext);
    }
  }

  /**
   * Function responsible to dispatch chain or single contract restroom call
   * @param {contractName} string name of the contract
   * @param {data} any input data object
   * @returns {RestroomResult} Returns the restroom result.
   */
  const restroomDispatch = async (
    contractName: string,
    data: any
  ): Promise<RestroomResult> => {
    const isChain = contractName.split(DOT)[1] === CHAIN_EXTENSION || false;
    const keys = isChain ? EMPTY_OBJECT_STRING : getKeys(contractName);
    const globalContext = createGlobalContext();
    try {
      return isChain
        ? executeChain({
          ymlContent: getYml(contractName.split(DOT)[0]), 
          data, 
          globalContext
        })
        : callRestroom({
            data: data,
            keys: keys,
            conf: getConf(contractName),
            zencode: getContractByContractName(contractName),
            contractPath: contractName
        });
    } catch (err) {
      return await resolveRestroomResult({
        error: err,
        errorMessage: `[RESTROOM EXECUTION ERROR]`,
      }, globalContext);
    }
  };

  /**
   * Function responsible to evaluate a single block instance
   * @param {input} BlockInput input object for the block
   * @returns {SingleInstanceOutput} Returns the output of this single instance of the block.
   */
  async function evaluateSingleInstance(
    input: BlockInput
  ): Promise<SingleInstanceOutput> {

    const singleContext = input.singleContext;
    const block = input.block;
    const ymlContent = input.ymlContent;
    let globalContext = input.globalContext;
    const data = input.data;

    addKeysToContext(singleContext, ymlContent.blocks[block]);
    addDataToContext(singleContext, data);
    addConfToContext(singleContext, ymlContent.blocks[block]);
    addNextToContext(singleContext, ymlContent.blocks[block]);
    addZenFileToContext(singleContext, ymlContent.blocks[block]);
    globalContext = updateGlobalContext(singleContext, globalContext);

    validateZenFile(singleContext, block);

    const zencode = getContractFromPath(singleContext.zenFile);
    const restroomResult: RestroomResult = await callRestroom({
      data: singleContext.data,
      keys: singleContext.keys,
      conf: singleContext.conf,
      zencode: zencode,
      contractPath: singleContext.zenFile
    });
    Object.assign(singleContext.output, restroomResult.result);
    globalContext = updateGlobalContext(singleContext, globalContext);
    return {restroomResult: restroomResult, singleContext: singleContext, globalContext: globalContext};
  }

  /**
   * Function responsible to evaluate for each of all instances in the block
   * @param {input} BlockInput input object for the block
   * @returns {BlockOutput} Returns the combined output of all instances of the block.
   */
  async function evaluateMultipleInstances(
      input: BlockInput
  ): Promise<BlockOutput> {

    const singleContext = input.singleContext;
    const block = input.block;
    const ymlContent = input.ymlContent;
    const data = input.data;
    let globalContext = input.globalContext;

    let internalResult: SingleInstanceOutput = {};
    let output: any;
    const forEachObjectName = ymlContent.blocks[block].forEach;
    const forEachIndex = ymlContent.blocks[block].index ? ymlContent.blocks[block].index : FOREACH_INDEX_DEFAULT_VALUE;

    const forEachObject = data[forEachObjectName];
    const forEachResult: any = {};
    const forEachResultAsArray: any = {};
    forEachResult[forEachObjectName] = {};
    forEachResultAsArray[forEachObjectName] = [];

    validateForEach(forEachObject, forEachObjectName, block);
    validateIterable(forEachObject, forEachObjectName, block);
    for(let index in Object.keys(forEachObject)){
      const name = Array.isArray(forEachObject) ? index : Object.keys(forEachObject)[index];
      data[forEachIndex] = forEachObject[name];
      internalResult = await evaluateSingleInstance({
        block: block,
        ymlContent: ymlContent,
        data: data,
        globalContext: globalContext,
        singleContext: singleContext
      });
      forEachResult[forEachObjectName][name] = internalResult?.restroomResult.result;
      forEachResultAsArray[forEachObjectName].push(internalResult?.restroomResult.result);
    }
    output = Array.isArray(forEachObject) ? forEachResultAsArray : forEachResult;
    return {output: output, lastInstanceResult:internalResult};
  }

  /**
   * Function responsible to evaluate the block result
   * @param {input} BlockInput input object for the block
   * @returns {BlockOutput} Returns the block result
   */
  async function evaluateBlockResult(
    input: BlockInput
  ): Promise<BlockOutput> {
    const ymlContent = input.ymlContent;
    const block = input.block;
    const globalContext = input.globalContext;
    const singleContext = input.singleContext;
    const data = input.data;

    let internalResult: SingleInstanceOutput = {};
    let output: any;

    if(isForEachPresent(ymlContent, block)){
      const multipleInstancesResult = await evaluateMultipleInstances({
        block: block,
        ymlContent: ymlContent,
        data: data,
        globalContext: globalContext,
        singleContext: singleContext
      });
      internalResult = multipleInstancesResult.lastInstanceResult;
      output = multipleInstancesResult.output;
    } else {
      internalResult = await evaluateSingleInstance({
        block: block,
        ymlContent: ymlContent,
        data: data,
        globalContext: globalContext,
        singleContext: singleContext
      });
      output = internalResult.singleContext.output
    }
    return {
      lastInstanceResult: internalResult,
      output: output
    };
  }

  /**
   * Function responsible to handle the block result
   * @param {input} BlockInput input object for the block
   * @returns {RestroomResult} Returns the restroom result for this block
   */
  async function handleBlockResult(
    input: BlockInput
  ): Promise<RestroomResult> {

    const block = input.block;
    let globalContext = input.globalContext;
    const ymlContent = input.ymlContent;
    const data = input.data;
    const singleContext: BlockContext = initializeSingleContext(block);
    let result: SingleInstanceOutput = {};
    let output: any;
    
    try {
      const blockResult: BlockOutput = await evaluateBlockResult({
        singleContext: singleContext,
        block: block,
        data: data,
        globalContext: globalContext,
        ymlContent: ymlContent
      });
      result = blockResult.lastInstanceResult;
      output = blockResult.output;
      globalContext = updateGlobalContextOutput(result.singleContext, result.globalContext, output);
      if (isErrorResult(result)) {
        return await resolveRestroomResult(result.restroomResult, result.globalContext);
      }
      if (isChainLastBlock(result)) {
        return await resolveRestroomResult({
          result: output,
          status: 200,
        }, result.globalContext);
      }
    } catch (err) {
      return await resolveRestroomResult({
        error: err,
        errorMessage: `[CHAIN EXECUTION ERROR FOR CONTRACT ${block}]`,
      }, globalContext);
    }
    validateNextBlock(result.singleContext.next, result.globalContext.currentBlock, ymlContent)
    return await handleBlockResult({
      block: result.singleContext.next,
      ymlContent: ymlContent,
      data: output,
      globalContext: result.globalContext
    });
  }

  /**
   * Function responsible to call restroom
   * @param {input} RestroomInput input object for restroom call
   * @returns {RestroomResult} Returns the restroom result
   */
  async function callRestroom(
    input: RestroomInput
  ): Promise<RestroomResult> {
    let restroomResult: RestroomResult = {};

    const data = input.data;
    const keys = input.keys;
    const conf = input.conf;
    const zencode = input.zencode;
    const contractPath = input.contractPath;

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
          await runHook(hook.SUCCESS, {
            result,
            zencode,
            zenroom_errors,
            outcome: restroomResult,
          });
          restroomResult.result = result;
          restroomResult.status = 200;
        })
        .then(async (json) => {
          await runHook(hook.AFTER, { json, zencode, outcome: restroomResult });
        })
        .catch(async (e) => {
          zenroom_errors = e;
          await runHook(hook.ERROR, {
            zenroom_errors,
            zencode,
            outcome: restroomResult,
          });
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
  zenroom_result = zenroom_errors = json = EMPTY_STRING;
  const contractName = req.params["0"];
  let data = getData(req, res);

  res.set("x-powered-by", "RESTroom by Dyne.org");
  buildEndpointResponse(await restroomDispatch(contractName, data), res);
};

function initializeSingleContext(block:string):BlockContext{
  return {
    keys: null,
    data: {},
    next: null,
    conf: EMPTY_STRING,
    output: {},
    zenFile: null,
    currentBlock: block
  };
}

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

