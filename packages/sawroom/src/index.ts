import { Restroom } from "@restroom-mw/core";
import { Request, Response, NextFunction } from "express";
import axios from "axios";
import cbor from "cbor";
import qs from "qs";
import url from "url";

const SAWROOM_ADDRESS = "have a sawroom endpoint named {}";
const TOKEN = "have a sawroom username named {} and a password named {}";
const TID = "have an id for a sawroom context named {}";
const SAVE = "ask sawroom to save the data with the context id {}";
const READ =
  "connect the sawroom endpoint {} and read the batch with id {} and save the output into {}";
const EXECUTE =
  "ask sawroom to execute the smart contract {} with the data {} and save the output with the context id {}";
const SAVE_PETITION = "ask sawroom to create the petition named {}";

interface ObjectLiteral {
  [key: string]: any;
}

let tid = null;
let username = null;
let password = null;
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
      input = { ...data, ...JSON.parse(keys) };
      const getFromData = (sid: string) => {
        const params = zencode.paramsOf(sid);
        return input[params];
      };
      [];

      sawroomAddress = getFromData(SAWROOM_ADDRESS);
      // const [username, password] = getFromData(TOKEN);
      // tid = getFromData(TID);
      // [remoteZencode, remoteData] = getFromData(EXECUTE);
      // [tid, inputData] = getFromData(SAVE_DATA);
      // [sawroom_address, tid, outputResult] = getFromData(READ);
      // [tid] = getFromData(SAVE_PETITION);
      if (zencode.match(READ)) {
        const [endpoint, bid, outputVariable] = zencode.paramsOf(READ);
        data[outputVariable] = await getState(input[endpoint], input[bid]);
      }
    });

    rr.onSuccess(async (params) => {
      let { zencode, result } = params;
      if (zencode.match(EXECUTE)) {
        const [_c, _d, _u] = zencode.paramsOf(EXECUTE);
        const address = `${sawroomAddress}:8008/batches`;
        const contract = input[_c];
        const data = input[_d];
        const uid = input[_u];
        const endpoint = `${sawroomAddress}:9009/petitions/zencode_exec`;

        const response = await axios.post(
          endpoint,
          {
            data: data,
            contract: contract,
            keys: {},
          },
          {
            params: {
              address: address,
              uid: uid,
            },
          }
        );
        const sawroomResult = {
          sawroom_link: response.data.link,
          batch_id: qs.parse(url.parse(response.data.link).query).id,
        };

        if (Array.isArray(result)) result.push(sawroomResult);
        if (typeof result === "object") Object.assign(result, sawroomResult);
      }
    });
    next();
  } catch (e) {
    next(e);
  }
};

const getState = async (endpoint: string, batchId: string) => {
  const batch_response = await axios.get(`${endpoint}:8008/batches/${batchId}`);
  const tids = batch_response.data.data.header.transaction_ids;
  const states: ObjectLiteral[] = [];

  for (const t of tids) {
    const receipt_response = await axios.get(`${endpoint}:8008/receipts`, {
      params: { id: t },
    });
    for (const d of receipt_response.data.data) {
      const v = d.state_changes[0].value;
      const value = await cbor.decodeAll(Buffer.from(v, "base64"));
      states.push(...value);
    }
  }
  return states;
};
