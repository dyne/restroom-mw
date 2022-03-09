import { isObject } from "./utils";

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

export const validateIfIterable = (forEachObject: any, forEachObjectName:string, block:string) => {
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
}