import { getHooks, hook, initHooks } from "./hooks";

import {
  getConf,
  getData,
  getKeys,
  getMessage,
  getYml,
  getContractByContractName,
  getContractFromPath,
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
  updateGlobalContextOutput
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
const functionHooks = initHooks;

const DEBUG_MODE = 'debug';
const STRING = 'string';
const SLASH = "/";
const DOT = ".";
const EMPTY_OBJECT_STRING = "{}";
const EMPTY_STRING = "";

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
    const exception = e ? e.stack || e.message : "";
    const exceptionMessage = !exception ? " Please check zenroom error logs": exception;
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
    fileContents: string,
    data: any,
    globalContext: any
  ): Promise<RestroomResult> {
    try {
      const ymlContent: any = yaml.load(fileContents);
      const startBlock: string = ymlContent?.start;
      globalContext = ymlContent?.mode === DEBUG_MODE ? createDebugEnabledGlobalContext() : globalContext;

      checkStartBlock(startBlock, ymlContent);
      detectLoop(startBlock, ymlContent);
      checkAlwaysSamePathInYml(ymlContent);

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
   * Function responsible to detect if the chain has an infinite loop
   * @param {nextStep} string containing next step to follow in the chain
   * @param {ymlContent} object yml object
   */
  function detectLoop(
    nextStep: string,
    ymlContent: any
  ) {
    let counter: number = 0;
    const contractNumbers: number = Object.keys(ymlContent?.blocks).length;

    while(nextStep){
      counter++;
      nextStep = ymlContent?.blocks[nextStep]?.next;
      if(counter>contractNumbers){
        throw new Error(`Loop detected. Execution is aborted!`);
      }
    }
  }

  /**
   * Function responsible to check if paths in the yml containing same folder
   * @param {ymlContent} object yml object
   */
  function checkAlwaysSamePathInYml(
    ymlContent: any
  ) {
    let allFolders: string[] = [];
    if (ymlContent?.blocks) {
      Object.keys(ymlContent?.blocks)
      .forEach(path=>{
        if (ymlContent?.blocks[path]){
          Object.keys(ymlContent?.blocks[path]).forEach(prop=>{
            let value = ymlContent?.blocks[path][prop];
            if (typeof value === STRING && value.includes(SLASH)){
              let folder = value.substring(0, value.lastIndexOf(SLASH));
              allFolders.push(folder);
            }
          });
        }
      });
    }
    if (allFolders.length > 1 && !allFolders.every((val, i, arr) => val === arr[0])){
      throw new Error(`Permission Denied. The paths in the yml cannot be different`);
    }
  }

  /**
   * Function responsible to dispatch chain or single contract restroom call
   * @param {contractName} string name of the contract
   * @param {data} any input data object
   * @returns {RestroomResult} Returns the restroom result.
   */
  const restroomEntryPoint = async (
    contractName: string,
    data: any
  ): Promise<RestroomResult> => {
    const isChain = contractName.split(DOT)[1] === CHAIN_EXTENSION || false;
    const keys = isChain ? EMPTY_OBJECT_STRING : getKeys(contractName);
    const globalContext = createGlobalContext();
    try {
      return isChain
        ? executeChain(getYml(contractName.split(DOT)[0]), data, globalContext)
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
    const forEachIndex = ymlContent.blocks[block].index;

    const forEachObject = data[forEachObjectName];
    const forEachResult: any = {};
    const forEachResultAsArray: any = {};
    forEachResult[forEachObjectName] = {};
    forEachResultAsArray[forEachObjectName] = [];

    checkIfPresent(forEachObject, forEachObjectName, block);
    checkIfIterable(forEachObject, forEachObjectName, block);
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
    const globalContext = input.globalContext
    const singleContext = input.singleContext;
    const data = input.data;

    let internalResult: SingleInstanceOutput = {};
    let output: any;

    if(forEachIsPresent(ymlContent, block)){
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
      })
      result = blockResult.lastInstanceResult;
      output = blockResult.output;
      globalContext = updateGlobalContextOutput(result.singleContext, result.globalContext, output);
      if (ifErrorResult(result)) {
        return await resolveRestroomResult(result.restroomResult, result.globalContext);
      }
      if (ifChainLastBlock(result)) {
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
    checkNextBlock(result.singleContext.next, result.globalContext.currentBlock, ymlContent)
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
  zenroom_result = zenroom_errors = json = "";
  const contractName = req.params["0"];
  let data = getData(req, res);

  res.set("x-powered-by", "RESTroom by Dyne.org");
  buildEndpointResponse(await restroomEntryPoint(contractName, data), res);
};

function checkStartBlock(startBlock: string, ymlContent:any) {
  if (!startBlock) {
    throw new Error(`Yml is incomplete. Start (start:) first level definition is missing!`);
  }
  if(!ymlContent.blocks[startBlock]){
    throw new Error(`Please check your yml. Start (start:) is pointing nowhere!`);
  }
}

function checkNextBlock(nextBlock: string, currentBlock:string, ymlContent:any){
  if(!ymlContent.blocks[nextBlock]){
    throw new Error(`Please check your yml. Next (next:) is pointing nowhere for current block ${currentBlock}!`);
  }
}

function ifChainLastBlock(internalResult: SingleInstanceOutput) {
  return !internalResult.singleContext?.next;
}

function ifErrorResult(internalResult: SingleInstanceOutput) {
  return internalResult.restroomResult?.error;
}

function forEachIsPresent(ymlContent: any, block: string) {
  return ymlContent.blocks[block].forEach;
}

function checkIfPresent(forEachObject: any, forEachObjectName:string, block:string) {
  if(!forEachObject){
   throw new Error(`For each object with name:${forEachObjectName} defined for the block: ${block} is null or undefined`);
  }
}

function isObject(item:any){
  return typeof item === 'object';
}

function checkIfIterable(forEachObject: any, forEachObjectName:string, block:string) {
   if(!isObject(forEachObject) && !Array.isArray(forEachObject)){
    throw new Error(`For each object with name:${forEachObjectName} defined for the block: ${block} is not an iterable object`);
   }
}

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

function validateZenFile(singleContext: any, block: string) {
  if (!singleContext.zenFile) {
    throw new Error(`Zen file is missing for block id: ${block}`);
  }
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

