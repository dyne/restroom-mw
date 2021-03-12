import { Restroom } from "@restroom-mw/core";
import axios from "axios";
import { NextFunction, Request, Response } from "express";
import {
  EXECUTE,
  READ,
  SAVE,
  SAWROOM_ADDRESS,
  TOKEN,
  STORE,
  RETRIEVE,
} from "./actions";
import { store, retrieve } from "@dyne/sawroom-client";
import {
  combineDataKeys,
  executeOnSawroom,
  getState,
  sendToSawroom,
} from "./lib";

let username;
let password;
let token;
let sawroomAddress: string = null;

let input: ObjectLiteral = {};

export default async (req: Request, res: Response, next: NextFunction) => {
  const rr = new Restroom(req, res);
  try {
    rr.onBefore(async (params) => {
      let { zencode, keys, data } = params;
      input = combineDataKeys(data, keys);

      const namedParamsOf = (sid: string) => {
        if (!zencode.match(sid)) return [];
        const params = zencode.paramsOf(sid);
        return params.reduce((acc: string[], p: string) => {
          acc.push(input[p] || p);
          return acc;
        }, []);
      };

      [sawroomAddress] = namedParamsOf(SAWROOM_ADDRESS);

      if (zencode.match(TOKEN)) {
        [username, password] = namedParamsOf(TOKEN);
        validateAddress();
        const response = await axios.post(
          `${sawroomAddress}:9009/token`,
          `username=${username}&password=${password}`
        );
        token = response.data.access_token;
        data["token"] = token;
      }

      if (zencode.match(READ)) {
        const [endpoint, bid, outputVariable] = namedParamsOf(READ);
        data[outputVariable] = await getState(endpoint, bid);
      }

      if (zencode.match(RETRIEVE)) {
        const [tag, outputVariable] = namedParamsOf(RETRIEVE);
        validateAddress();
        data[outputVariable] = JSON.parse(await retrieve(tag, sawroomAddress));
      }
    });

    rr.onSuccess(async (params) => {
      let { zencode, result } = params;

      if (zencode.match(EXECUTE)) {
        const [sawroomResult, uid] = await executeOnSawroom(
          sawroomAddress,
          zencode,
          input
        );

        saveToResult(sawroomResult, uid, result);
      }

      if (zencode.match(STORE)) {
        validateAddress();
        const params = zencode.paramsOf(STORE);
        for (var i = 0; i < params.length; i += 2) {
          const toStore = result[params[i]];
          const tagId = params[i + 1];
          const tag = await store(toStore, sawroomAddress);
          Object.assign(result, { [tagId]: tag });
        }
      }

      if (zencode.match(SAVE)) {
        validateAddress();
        const params = zencode.paramsOf(SAVE);
        for (var i = 0; i < params.length; i += 2) {
          const dataResult = JSON.stringify(result[params[i]]);
          const contextId = input[params[i + 1]];
          const contract = `Given nothing
                            When I write string '${dataResult}' in 'result'
                            Then print data`;
          const sawroomResult = await sendToSawroom(
            sawroomAddress,
            contract,
            {},
            {},
            contextId
          );
          saveToResult(sawroomResult, contextId, result);
        }
      }
    });
    next();
  } catch (e) {
    next(e);
  }
};

const saveToResult = (sawroomResult: unknown, uid: string, result: any) => {
  let toSave: ObjectLiteral = { sawroom: {} };
  toSave.sawroom[uid] = sawroomResult;
  if (Array.isArray(result)) result.push(toSave);
  if (typeof result === "object") {
    if (result.hasOwnProperty("sawroom")) {
      result.sawroom[uid] = sawroomResult;
    } else {
      Object.assign(result, toSave);
    }
  }
};

const validateAddress = () => {
  if (!sawroomAddress) {
    throw new Error(
      `Missing sawroom address add the following sentence to your contract: '${SAWROOM_ADDRESS}'`
    );
  }
};
