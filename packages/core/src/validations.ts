<<<<<<< HEAD
import { isObject, isString } from "./utils";
const SLASH = "/";
=======
import { isObject } from "./utils";
>>>>>>> f00d768 (refactoring)

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

<<<<<<< HEAD
export const validateIterable = (forEachObject: any, forEachObjectName:string, block:string) => {
=======
export const validateIfIterable = (forEachObject: any, forEachObjectName:string, block:string) => {
>>>>>>> f00d768 (refactoring)
  if(!isObject(forEachObject) && !Array.isArray(forEachObject)){
   throw new Error(`For each object with name:${forEachObjectName} defined for the block: ${block} is not an iterable object`);
  }
}

export const validateForEach = (forEachObject: any, forEachObjectName:string, block:string) => {
  if(!forEachObject){
   throw new Error(`For each object with name:${forEachObjectName} defined for the block: ${block} is null or undefined`);
  }
}

export const validateZenFile = (singleContext: any, block: string) => {
  if (!singleContext.zenFile) {
    throw new Error(`Zen file is missing for block id: ${block}`);
  }
<<<<<<< HEAD
}

/**
 * Function responsible to check if paths in the yml containing same folder
 * @param {ymlContent} object yml object
 */
export const validatePathsInYml = (ymlContent: any) => {
  let allFolders: string[] = [];
  if (ymlContent?.blocks) {
    Object.keys(ymlContent?.blocks).forEach(path=>{
      if (ymlContent?.blocks[path]){
        Object.keys(ymlContent?.blocks[path]).forEach(prop=>{
          let value = ymlContent?.blocks[path][prop];
          if (isString(value) && value.includes(SLASH)){
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
=======
>>>>>>> f00d768 (refactoring)
}