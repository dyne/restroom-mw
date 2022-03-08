import { ObjectLiteral } from "@restroom-mw/types";
import { Zencode } from "@restroom-mw/zencode";
import axios from "axios";
import cbor from "cbor";
import qs from "qs";
import url from "url";
import { EXECUTE } from "./actions";

export const executeOnSawroom = async (
  sawroomAddress: string,
  zencode: Zencode,
  input: ObjectLiteral
) => {
  const [_c, _d, _u] = zencode.paramsOf(EXECUTE);
  const contract = input[_c];
  const data = input[_d];
  const uid = input[_u];
  const result = await sendToSawroom(sawroomAddress, contract, data, {}, uid);
  return [result, uid];
};

export const sendToSawroom = async (
  sawroomAddress: string,
  contract: string,
  data: ObjectLiteral,
  keys: ObjectLiteral,
  uid: string
) => {
  const address = `${sawroomAddress}:8008/batches`;
  const endpoint = `${sawroomAddress}:9009/petitions/zencode_exec`;
  const response = await axios.post(
    endpoint,
    {
      data: data,
      contract: contract,
      keys: keys,
    },
    {
      params: {
        address: address,
        uid: uid,
      },
    }
  );
  return {
    sawroom_link: response.data.link,
    batch_id: qs.parse(url.parse(response.data.link).query).id,
  };
};

export const getState = async (endpoint: string, batchId: string) => {
  const batch_response = await axios.get(`${endpoint}:8008/batches/${batchId}`);
  const tids = batch_response.data.data.header.transaction_ids;
  const states: ObjectLiteral[] = [];

  for (const t of tids) {
    const receipt_response = await axios.get(`${endpoint}:8008/receipts`, {
      params: { id: t },
    });
    for (const d of receipt_response.data.data) {
      const v = d.state_changes[0].value;
      const [result] = await cbor.decodeAll(Buffer.from(v, "base64"));
      try {
        states.push(JSON.parse(JSON.parse(result.result).result));
      } catch (e) {
        states.push(result.result);
      }
    }
  }
  return states;
};
