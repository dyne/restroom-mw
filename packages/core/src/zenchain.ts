import { getDinamicKeys } from "./utils";

const CONTEXT_PLACEHOLDER = "context.get(";

export enum BLOCK_TYPE {
  ZENROOM = "zenroom-contract",
  INPUT = "input",
  OUTPUT = "output",
}

export const iterateAndEvaluateExpressions = (obj: any, context: Map<string, any>) => {
  try {
    Object.keys(obj).forEach((key: string) => {
      if (typeof obj[key] === "string") {
        if (obj[key].includes(CONTEXT_PLACEHOLDER)) {
          const evaluate = new Function("obj", "context", "return " + obj[key]);
          obj[key] = evaluate(obj[key], context);
        }
      } else if (typeof obj[key] === "object") {
        iterateAndEvaluateExpressions(obj[key], context);
      }
    });
  } catch (e) {
    console.error(e);
  }
};

export function updateContext(
  singleContext: any,
  context: Map<string, any>,
  block: string
) {
  context.set(block, singleContext);
}

export function addKeysToContext(singleContext: any, block: string) {
  const extractedKeys = getDinamicKeys(block) ? getDinamicKeys(block) : '{}';
  const keys = JSON.parse(extractedKeys);
  Object.keys(keys).forEach((key: string) => {
    singleContext.keys[key] = keys[key];
  });
}

export function storeContext(
  singleContext: any,
  block: string,
  ymlContent: any,
  context: Map<string, any>
) {
  Object.keys(ymlContent.blocks[block]).forEach((key: string) => {
    singleContext[key] = ymlContent.blocks[block][key];
  });

  updateContext(singleContext, context, block);
}
