import { Restroom } from "@restroom-mw/core";
import { ObjectLiteral } from "@restroom-mw/core/src/types";

import { NextFunction, Request, Response } from "express";
import {
  CONNECT,
  SET_SK,
  STORE,
  RETRIEVE,
  ERC20_0,
  ERC20_0_NAMED,
  ERC20_1,
  ERC20_1_NAMED,
} from "./actions";
import { zencodeNamedParamsOf } from '@restroom-mw/utils';
import Web3 from 'web3'
import { Account } from 'web3-core/types'
// import * as STORE_ABI from './store_abi.json'
// import * as ERC20_ABI from './erc20_abi.json'

require("dotenv").config();

const STORE_ABI = require('./store_abi.json');
const ERC20_ABI = require('./erc20_abi.json');

const GAS_LIMIT = process.env.GAS_LIMIT || 100000;
const STORE_ADDRESS = process.env.STORE_ADDRESS || "0xf0562148463aD4D3A8aB59222E2e390332Fc4a0d";
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

      const call_erc20 = async (command: string, contractAddress: string,
                            variableName: string, args: string[]) => {
        if(!web3.utils.isAddress(contractAddress)) {
          throw new Error(`Not an ethereum address ${contractAddress}`);
        }
        const erc20 = new web3.eth.Contract(ERC20_ABI, contractAddress);

        const fz = (() => {
          switch(command) {
            case "decimals": return erc20.methods.decimals;
            case "name": return erc20.methods.name;
            case "symbol": return erc20.methods.symbol;
            case "total supply": return erc20.methods.totalSupply;
            case "balance": return erc20.methods.balanceOf;
            default: return null;
          }
        })();

        if(!fz) {
          throw new Error(`Unknown function name ${command}`);
        }

        const result = await fz(...args).call();


        data[variableName] = result;
      }

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

      if(zencode.match(ERC20_0_NAMED)) {
        validateWeb3();
        const params = zencode.paramsOf(ERC20_0_NAMED);
        for(var i = 0; i < params.length; i += 3) {
          const command = params[i];
          const contractAddress = input[params[i+1]] || params[i+1];
          const variableName = params[i+2];
          await call_erc20(command, contractAddress, variableName, []);
        }
      }

      if(zencode.match(ERC20_0)) {
        validateWeb3();
        const params = zencode.paramsOf(ERC20_0);
        for(var i = 0; i < params.length; i += 2) {
          const command = params[i];
          const contractAddress = input[params[i+1]] || params[i+1];
          await call_erc20(command, contractAddress, command.replace(" ", "_"), []);
        }
      }

      if(zencode.match(ERC20_1)) {
        validateWeb3();
        const params = zencode.paramsOf(ERC20_1);
        for(var i = 0; i < params.length; i += 3) {
          const command = params[i];
          const arg = input[params[i+1]] || params[i+1];
          const contractAddress = input[params[i+2]] || params[i+2];
          await call_erc20(command, contractAddress, command.replace(" ", "_"), [ arg ]);
        }
      }

      if(zencode.match(ERC20_1_NAMED)) {
        validateWeb3();
        const params = zencode.paramsOf(ERC20_1_NAMED);
        for(var i = 0; i < params.length; i += 4) {
          const command = params[i];
          const arg = input[params[i+1]] || params[i+1];
          const contractAddress = input[params[i+2]] || params[i+2];
          const variableName = params[i+3];
          await call_erc20(command, contractAddress, variableName, [ arg ]);
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

