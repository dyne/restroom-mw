import { isObject, isString, SLASH } from "./utils";

export const validateStartBlock = (startBlock: string, ymlContent:any) => {
  if (!startBlock) {
    throw new Error(`Yml is incomplete. Start (start:) first level definition is missing!`);
  }
  if(!ymlContent.blocks[startBlock]){
    throw new Error(`Please check your yml. Start (start:) is pointing nowhere!`);
  }
}

export const validateNextBlock = (nextBlock: string, currentBlock:string, ymlContent:any) => {
  if(!ymlContent.blocks[nextBlock]){
    throw new Error(`Please check your yml. Next (next:) is pointing nowhere for current block ${currentBlock}!`);
  }
}

export const validateIterable = (forEachObject: any, forEachObjectName:string, block:string) => {
  if(!isObject(forEachObject) && !Array.isArray(forEachObject)){
   throw new Error(`For each object with name:${forEachObjectName} defined for the block: ${block} is not an iterable object`);
  }
}

export const validateForEach = (forEachObject: any, forEachObjectName:string, block:string) => {
  if(!forEachObject){
   throw new Error(`For each object with name:${forEachObjectName} defined for the block: ${block} is null or undefined`);
  }
}

export const validateZen = (singleContext: any, block: string) => {
  let errorMessage = null
  if(singleContext.zenFile && singleContext.zenContent) {
    errorMessage = "Cannot declare both zenContent and zenFile";
  } else if(!singleContext.zenFile && !singleContext.zenContent) {
    errorMessage = "Neither zenFile nor zenContent are declared";
  }
  if (errorMessage) {
    throw new Error(`${errorMessage} for block id: ${block}`);
  }
}

const excludeProps = ["zenContent"]

/**
 * Function responsible to check if paths in the yml containing same folder
 * @param {ymlContent} object yml object
 */
export const validatePathsInYml = (ymlContent: any, user: string | null) => {
  let allFolders: string[] = [];
  if (ymlContent?.blocks) {
    Object.keys(ymlContent?.blocks).forEach(path=>{
      if (ymlContent?.blocks[path]){
        Object.keys(ymlContent?.blocks[path]).forEach(prop=>{
          let value = ymlContent?.blocks[path][prop];
          if (isString(value) && !excludeProps.includes(prop) &&
              value.includes(SLASH)){
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
  const contentUser = (allFolders.length > 1) ? allFolders[0] : null
  if (contentUser !== user){
    throw new Error(`Permission Denied. The path of the chain is different from the one in the yml`);
  }
}

/**
 * Function responsible to detect if the chain has an infinite loop
 * @param {nextStep} string containing next step to follow in the chain
 * @param {ymlContent} object yml object
 */
export const validateNoLoopInChain = (nextStep: string, ymlContent: any) => {
  let counter: number = 0;
  const contractNumbers: number = Object.keys(ymlContent?.blocks).length;

  while(nextStep){
    counter++;
    nextStep = ymlContent?.blocks[nextStep]?.next;
    if(counter>contractNumbers){
      throw new Error(`Loop detected in chain. Execution is aborted!`);
    }
  }
}
