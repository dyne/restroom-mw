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
} from "./context";
import { NextFunction, Request, Response } from "express";
import * as yaml from "js-yaml";
import { RestroomResult } from "./restroom-result";
import { Zencode } from "@restroom-mw/zencode";
import { BlockContext } from "./block-context";
import { CHAIN_EXTENSION } from "@restroom-mw/utils";
const functionHooks = initHooks;

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
    const message = subject + "\n\n\n" + exception;
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
      const output:any = {};
      Object.assign(output, restroomResult?.result);
      if(restroomResult?.context?.debugEnabled){
        output.context = restroomResult?.context;
      }
      res.status(restroomResult.status).json(output);
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
      globalContext.debugEnabled = ymlContent?.debug === 'on' ? true : false;

      if(!startBlock){
        throw new Error(`Yml is incomplete. Start (start:) first level definition is missing!`);
      }

      detectLoop(startBlock, ymlContent);
      checkAlwaysSamePathInYml(ymlContent);

      return await evaluateBlock(startBlock, ymlContent, data, globalContext);
    } catch (err) {
      return await resolveRestroomResult({
        error: err,
        errorMessage: `[CHAIN YML EXECUTION ERROR]`,
      }, globalContext);
    }
  }

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
            if (typeof value === 'string' && value.includes("/")){
              let folder = value.substring(0, value.lastIndexOf("/"));
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

  const getRestroomResult = async (
    contractName: string,
    data: any
  ): Promise<RestroomResult> => {
    const isChain = contractName.split(".")[1] === CHAIN_EXTENSION || false;
    const keys = isChain ? "{}" : getKeys(contractName);
    const globalContext: any = {
      debugEnabled: false
    };
    try {
      return isChain
        ? executeChain(getYml(contractName.split(".")[0]), data, globalContext)
        : callRestroom(
            data,
            keys,
            getConf(contractName),
            getContractByContractName(contractName),
            contractName
          );
    } catch (err) {
      return await resolveRestroomResult({
        error: err,
        errorMessage: `[RESTROOM EXECUTION ERROR]`,
      }, globalContext);
    }
  };

  async function evaluateBlock(
    block: string,
    ymlContent: any,
    data: any,
    globalContext: any
  ): Promise<RestroomResult> {
    console.debug("Current block is " + block);

    const singleContext: BlockContext = {
      keys: null,
      data: {},
      next: null,
      conf: "",
      output: {},
      zenFile: null
    };
    try {
      addKeysToContext(singleContext, ymlContent.blocks[block]);
      addDataToContext(singleContext, data);
      addConfToContext(singleContext, ymlContent.blocks[block]);
      addNextToContext(singleContext, ymlContent.blocks[block]);
      addZenFileToContext(singleContext, ymlContent.blocks[block]);
      globalContext[block] = {};
      globalContext[block].keys = singleContext?.keys;
      globalContext[block].data = singleContext?.data;

      if(!singleContext.zenFile){
        throw new Error(`Zen file is missing for block id: ${block}`);
      }

      const zencode = getContractFromPath(singleContext.zenFile);
      const restroomResult: RestroomResult = await callRestroom(
        singleContext.data,
        singleContext.keys,
        singleContext.conf,
        zencode,
        singleContext.zenFile
      );

      if (restroomResult?.error) {
        return await resolveRestroomResult(restroomResult, globalContext);
      }
      Object.assign(singleContext.output, restroomResult.result);
      globalContext[block].output = singleContext?.output;

      if (!singleContext?.next) {
        return await resolveRestroomResult({
          result: singleContext?.output,
          status: 200,
        }, globalContext);
      }
    } catch (err) {
      return await resolveRestroomResult({
        error: err,
        errorMessage: `[CHAIN EXECUTION ERROR FOR CONTRACT ${block}]`,
      }, globalContext);
    }
    return await evaluateBlock(
      singleContext.next,
      ymlContent,
      singleContext.output,
      globalContext
    );
  }

  async function callRestroom(
    data: string,
    keys: string,
    conf: string,
    zencode: Zencode,
    contractPath: string
  ): Promise<RestroomResult> {
    let restroomResult: RestroomResult = {};

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
