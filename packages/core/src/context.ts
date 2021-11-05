import { getKeys } from "./utils";

const CONTEXT_PLACEHOLDER = "context.get(";

export enum BLOCK_TYPE {
  ZENCODE = "zencode",
  WAIT = "wait",
}


/**
 * This function is responsible for evaluating and replacing all the context placeholder 
 * @param {singleBlockObject} object containing the placeholders
 * @param {context} object to resolve the references
 * @param {outputFilter} boolean indicates if output should be resolved
 */
export const iterateAndEvaluateExpressions = (singleBlockObject: any, context: Map<string, any>) => {
  Object.keys(singleBlockObject).filter(key => key !=="output").forEach((key: string) => {
    if (typeof singleBlockObject[key] === "string") {
      if (singleBlockObject[key].includes(CONTEXT_PLACEHOLDER)) {
        const evaluate = new Function("obj", "context", "return " + singleBlockObject[key]);
        singleBlockObject[key] = evaluate(singleBlockObject[key], context);
      }
    } else if (typeof singleBlockObject[key] === "object") {
      iterateAndEvaluateExpressions(singleBlockObject[key], context);
    }
  });
};

/**
 * This function is responsible to set the global context 
 * @param {singleBlockObject} object context of a single block
 * @param {globalContext} object global context
 * @param {blockName} string block name
 */
export function updateContext(
  singleBlockContext: any,
  globalContext: Map<string, any>,
  blockName: string
) {
  globalContext.set(blockName, singleBlockContext);
}

/**
 * This function is responsible to add data into single block context 
 * @param {singleBlockContext} object context of a single block
 * @param {data} object data for the contract
 */
export function addDataToContext(singleBlockContext: any, data:any) {
  if(data){
    Object.keys(data).forEach((key: string) => {
      singleBlockContext.data[key] = data[key];
    });
  }
}

/**
 * This function is responsible to add keys into single block context from selected .keys file
 * @param {singleBlockContext} object context of a single block
 * @param {blockName} string block name
 */
export function addKeysToContext(singleBlockContext: any) {
  const extractedKeys = getKeys(singleBlockContext?.fileKeys) || '{}';
  const keys = JSON.parse(extractedKeys);
  Object.keys(keys).forEach((key: string) => {
    singleBlockContext.keys[key] = keys[key];
  });
}

/**
 * This function is responsible to add data into single block context 
 * @param {singleBlockContext} object context of a single block
 * @param {blockName} string block name
 * @param {ymlContent} object containing yml informations 
 * @param {globalContext} object global context
 */
export function updateContextUsingYamlFields(
  singleBlockContext: any,
  blockName: string,
  ymlContent: any,
  globalContext: Map<string, any>
) {
  Object.keys(ymlContent.blocks[blockName]).forEach((key: string) => {
    if((key === 'keys' || key === 'data' || key === 'output') && typeof ymlContent.blocks[blockName][key] === "object" ){
      Object.keys(ymlContent.blocks[blockName][key]).forEach((keysInObject: string) => {
        singleBlockContext[key][keysInObject] = ymlContent.blocks[blockName][key][keysInObject];
      })
    } else {
      singleBlockContext[key] = ymlContent.blocks[blockName][key];
    }
  });

  updateContext(singleBlockContext, globalContext, blockName);
}
