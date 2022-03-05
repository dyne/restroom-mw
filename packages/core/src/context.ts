import { getFile } from "./utils";

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
 * This function is responsible to create a global context used for debug purposes 
 */
 export function createGlobalContext() {
  const globalContext: any = {
    debugEnabled: false
  };
  return globalContext;
}

/**
 * This function is responsible to create a global context with debugEnabled mode 
 */
 export function enableDebugInGlobalContext() {
  const globalContext: any = {
    debugEnabled: true
  };
  return globalContext;
}

/**
 * This function is responsible to create a global context used for debug purposes 
 * @param {singleBlockContext} object context of a single block
 * @param {globalContext} object previous global context
 */
 export function updateGlobalContext(singleBlockContext: any, globalContext:any) {
  let updatedGlobalContext: any = {};
  const block: string = singleBlockContext.currentBlock;
  updatedGlobalContext.debugEnabled = globalContext.debugEnabled;
  updatedGlobalContext.currentBlock = block;
  updatedGlobalContext[block] = {};
  updatedGlobalContext[block].keys = singleBlockContext.keys ? singleBlockContext.keys : undefined;
  updatedGlobalContext[block].data = singleBlockContext.data ? singleBlockContext.data : undefined;
  updatedGlobalContext[block].output = singleBlockContext.output ? singleBlockContext.output : undefined;
  return updatedGlobalContext;
}


/**
 * This function is responsible to add keys into single block context from selected .keys file
 * @param {singleBlockContext} object context of a single block
 * @param {blockName} string block name
 */
export function addKeysToContext(singleBlockContext: any, ymlContent:any) {
  const extractedKeys = getFile(ymlContent?.keysFile) || null;
  if(extractedKeys){
    const keys = JSON.parse(extractedKeys);
    singleBlockContext.keys = {};
    Object.keys(keys).forEach((key: string) => {
      singleBlockContext.keys[key] = keys[key];
    });
    singleBlockContext.keys = JSON.stringify(singleBlockContext.keys);
  }
}

/**
 * This function is responsible to add keys into single block context from selected .keys file
 * @param {singleBlockContext} object context of a single block
 * @param {blockName} string block name
 */
 export function addConfToContext(singleBlockContext: any, ymlContent:any) {
  const conf = getFile(ymlContent?.confFile) || "";
  singleBlockContext.conf = conf;
}

/**
 * This function is responsible to add next into single block context from yaml flow
 * @param {singleBlockContext} object context of a single block
 * @param {ymlContent} object yaml content
 */
 export function addNextToContext(singleBlockContext: any, ymlContent:any) {
  singleBlockContext.next = ymlContent?.next;
}

/**
 * This function is responsible to add zenFile into single block context from yaml flow
 * @param {singleBlockContext} object context of a single block
 * @param {ymlContent} object yaml content
 */
 export function addZenFileToContext(singleBlockContext: any, ymlContent:any) {
  singleBlockContext.zenFile = ymlContent?.zenFile;
}
