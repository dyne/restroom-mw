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
 * @returns {globalContext} Returns a fresh created global context
 */
 export function createGlobalContext() {
  const globalContext: any = {
    debugEnabled: false
  };
  return globalContext;
}

/**
 * This function is responsible to create a global context with debugEnabled mode 
 * @returns {globalContext} Returns a fresh created global context with debugEnabled true
 */
 export function createDebugEnabledGlobalContext() {
  const globalContext: any = {
    debugEnabled: true
  };
  return globalContext;
}

/**
 * This function is responsible to update global context used for debug purposes 
 * @param {singleBlockContext} object context of a single block
 * @param {globalContext} object previous global context
 * @returns {globalContext} Returns updated global context
 */
 export function updateGlobalContext(singleBlockContext: any, globalContext:any) {
  const block: string = singleBlockContext.currentBlock;
  globalContext.currentBlock = block;
  globalContext[block] = {};
  globalContext[block].keys = singleBlockContext.keys ? singleBlockContext.keys : undefined;
  globalContext[block].data = singleBlockContext.data ? singleBlockContext.data : undefined;
  return globalContext;
}

/**
 * This function is responsible to update a global context output used for debug purposes 
 * @param {singleBlockContext} object context of a single block
 * @param {globalContext} object previous global context
 * @returns {globalContext} Returns updated global context output
 */
 export function updateGlobalContextOutput(singleBlockContext: any, globalContext:any, output:any) {
  const block: string = singleBlockContext.currentBlock;
  globalContext[block].output = output;
  return globalContext;
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
