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
 * This function is responsible to add keys into single block context from selected .keys file
 * @param {singleBlockContext} object context of a single block
 * @param {blockName} string block name
 */
export function addKeysToContext(singleBlockContext: any, ymlContent:any) {
  const extractedKeys = getFile(ymlContent?.fileKeys) || '{}';
  const keys = JSON.parse(extractedKeys);
  Object.keys(keys).forEach((key: string) => {
    singleBlockContext.keys[key] = keys[key];
  });
}

/**
 * This function is responsible to add next into single block context from yaml flow
 * @param {singleBlockContext} object context of a single block
 * @param {ymlContent} object yaml content
 */
 export function addNextToContext(singleBlockContext: any, ymlContent:any) {
  singleBlockContext.next = ymlContent?.next;
}
