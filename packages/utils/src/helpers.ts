import { ObjectLiteral } from "@restroom-mw/types";
import { Zencode } from "@restroom-mw/zencode";

export const combineDataKeys = (data: ObjectLiteral, keys: string) => {
  try {
    return { ...data, ...JSON.parse(keys) };
  } catch (e) {
    throw new Error("Keys or data in wrong format");
  }
}

export const zencodeNamedParamsOf = (zencode: Zencode, input: ObjectLiteral) =>
  (sid: string): string[] => {
    if (!zencode.match(sid)) return [];
    const params = zencode.paramsOf(sid);
    return params.reduce((acc: string[], p: string) => {
      acc.push(input[p] || p);
      return acc;
    }, []);
  };

