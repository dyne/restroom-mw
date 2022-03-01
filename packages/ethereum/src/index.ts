import { Restroom } from "@restroom-mw/core";
import { ObjectLiteral } from "@restroom-mw/core/src/types";

import { NextFunction, Request, Response } from "express";
import {
  CONNECT,
  SET_SK,
  STORE,
  RETRIEVE,
} from "./actions";
import { zencodeNamedParamsOf } from '@restroom-mw/utils';
import Web3 from 'web3'
import { Account } from 'web3-core/types'
//import * as STORE_ABI from './store_abi.json'
const GAS_LIMIT = 100000
const STORE_ADDRESS = "0xf0562148463aD4D3A8aB59222E2e390332Fc4a0d"
const STORE_ABI = JSON.parse(`[
  {
    "inputs": [
      {
        "internaltype": "uint256",
        "name": "_maxlen",
        "type": "uint256"
      }
    ],
    "statemutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internaltype": "string",
        "name": "",
        "type": "string"
      }
    ],
    "name": "hashsaved",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internaltype": "string",
        "name": "message",
        "type": "string"
      }
    ],
    "name": "store",
    "outputs": [],
    "statemutability": "nonpayable",
    "type": "function"
  }
]`)
let web3: Web3 = null;
let account: Account  = null;
let input: ObjectLiteral = null;

const validateWeb3 = () => {
  if(web3 == null) throw Error("No connection to a client")
}
const validateAccountCanSign = () => {
  if(!account ||  !account.privateKey) throw Error("Account cannot sign a transaction")
}

export default async (req: Request, res: Response, next: NextFunction) => {
  const rr = new Restroom(req, res);

  try {
    rr.onBefore(async (params) => {
      const { zencode, keys, data } = params;
      input = rr.combineDataKeys(data, keys);
      const namedParamsOf = zencodeNamedParamsOf(zencode, input);

      if(zencode.match(CONNECT)) {
        const [ endpoint ] = namedParamsOf(CONNECT)
        web3 = new Web3(endpoint);
      }

      if(zencode.match(SET_SK)) {
        validateWeb3();
        const [ sk ] = namedParamsOf(SET_SK);
        account = web3.eth.accounts.privateKeyToAccount(sk);
      }

      if(zencode.match(RETRIEVE)) {
        validateWeb3();
        const params = zencode.paramsOf(RETRIEVE);
        for (var i = 0; i < params.length; i += 3) {
          const storage = params[i];
          const tag = input[params[i + 1]];
          const variable = params[i + 2];
          if(storage == 'ethereum') {
            const receipt = await web3.eth.getTransactionReceipt("0x" + tag)
            if(receipt.status) {
              const dataABI = receipt.logs[0].data;
              const dataJSON = web3.eth.abi.decodeParameters(["string"], dataABI)[0];
              const currentData = JSON.parse(dataJSON);
              data[variable] = currentData;
            } else {
              throw new Error("Failed transaction");
            }
          }
        }
      }
    });

    rr.onSuccess(async (params) => {
      const { zencode, result } = params;
      if(zencode.match(STORE)) {
        validateAccountCanSign();
        const params = zencode.paramsOf(STORE);
        const storeContract = new web3.eth.Contract(STORE_ABI, STORE_ADDRESS);
        for (var i = 0; i < params.length; i += 3) {
          const storage = params[i];
          const data = result[params[i + 1]];
          const tag = params[i + 2];
          if(storage == 'ethereum') {
            const dataJson = JSON.stringify(data);
            const dataABI = storeContract.methods.store(dataJson).encodeABI();
            const tx = {
              to: STORE_ADDRESS,
              data: dataABI,
              gas: GAS_LIMIT
            }
            const signedTx = await web3.eth.accounts.signTransaction(tx, account.privateKey);
            const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
            if(receipt.status) {
              result[tag] = receipt.transactionHash.substring(2); // Remove 0x
            } else {
              console.log(receipt);
              throw new Error("Transaction failed");
            }
          }
        }
      }
    });
    next();
  } catch (e) {
    next(e);
  }
};

