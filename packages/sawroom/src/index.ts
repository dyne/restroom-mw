import { Restroom } from "@restroom-mw/core";
import axios from "axios";
import { NextFunction, Request, Response } from "express";
import { EXECUTE, READ, SAWROOM_ADDRESS, TOKEN } from "./actions";
import { combineDataKeys, executeOnSawroom, getState } from "./lib";

let tid = null;
let username;
let password;
let token;
let inputData = null;
let remoteData = null;
let outputResult = null;
let remoteZencode = null;
let sawroomAddress: string = null;

// const readFromSawtooth = async (endpoint: string) => {};
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
        if (!sawroomAddress) {
          throw new Error(
            `Missing sawroom address add the following sentence to your contract: '${SAWROOM_ADDRESS}'`
          );
        }
        const response = await axios.post(
          `${sawroomAddress}:9009/token`,
          `username=${username}&password=${password}`
        );
        token = response.data.access_token;
        data["token"] = token;
      }
      // const [username, password] = getFromData(TOKEN);
      // tid = getFromData(TID);
      // [remoteZencode, remoteData] = getFromData(EXECUTE);
      // [tid, inputData] = getFromData(SAVE_DATA);
      // [sawroom_address, tid, outputResult] = getFromData(READ);
      // [tid] = getFromData(SAVE_PETITION);

      if (zencode.match(READ)) {
        const [endpoint, bid, outputVariable] = namedParamsOf(READ);
        data[outputVariable] = await getState(endpoint, bid);
      }
    });

    rr.onSuccess(async (params) => {
      let { zencode, result } = params;

      if (zencode.match(EXECUTE)) {
        const sawroomResult = await executeOnSawroom(
          sawroomAddress,
          zencode,
          input
        );
        if (Array.isArray(result)) result.push(sawroomResult);
        if (typeof result === "object") Object.assign(result, sawroomResult);
      }
    });
    next();
  } catch (e) {
    next(e);
  }
};
