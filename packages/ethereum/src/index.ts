import { Restroom } from "@restroom-mw/core";
import { ObjectLiteral } from "@restroom-mw/types";
import { UTF8_DECODER, zencodeNamedParamsOf } from '@restroom-mw/utils';

import { NextFunction, Request, Response } from "express";
import {
  CONNECT,
  NONCE,
  GAS_PRICE,
  RETRIEVE,
  ERC20_0,
  ERC20_0_NAMED,
  ERC20_1,
  ERC20_1_NAMED,
  READ_HEAD,
  READ_PREVIOUS,
  BROADCAST,
} from "./actions";
import Web3 from 'web3';
// import * as ERC20_ABI from './erc20_abi.json'

require("dotenv").config();

const ERC20_ABI = require('./erc20_abi.json');

let web3: Web3 = null;
let input: ObjectLiteral = null;

const BLOCKCHAIN = "ethereum"

const validateWeb3 = () => {
  if(web3 == null) throw Error("No connection to a client")
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

      if(zencode.match(NONCE)) {
        validateWeb3();
        const [ address_input ] = namedParamsOf(NONCE);
        const address = input[address_input] || address_input;
        const nonce = await web3.eth.getTransactionCount(address);
        data['ethereum_nonce'] = nonce.toString();
      }

      if(zencode.match(GAS_PRICE)) {
        validateWeb3();
        const gasPrice = await web3.eth.getGasPrice();
        data['gas_price'] = gasPrice.toString();
      }

      if(zencode.match(RETRIEVE)) {
        const params = zencode.paramsOf(RETRIEVE);
        for (var i = 0; i < params.length; i += 3) {
          const storage = params[i];
          const tag = input[params[i + 1]];
          const variable = params[i + 2];
          if(storage.toLowerCase() == BLOCKCHAIN) {
            validateWeb3();
            const receipt = await web3.eth.getTransactionReceipt("0x" + tag)
            if(receipt.status) {
              const dataABI = receipt.logs[0].data;
              const resultBytes = web3.eth.abi.decodeParameters(["bytes"], dataABI)[0];
              const currentData = UTF8_DECODER.decode(Buffer.from(resultBytes.substring(2), 'hex'));
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

      if(zencode.match(READ_HEAD)) {
        const params = zencode.paramsOf(READ_HEAD);
        for(var i = 0; i < params.length; i += 4) {
          const storage = params[i];
          const variableName = params[i+1];
          if(storage.toLowerCase() == BLOCKCHAIN) {
            validateWeb3();
            const result = await web3.eth.getBlock("latest");
            data[variableName] = result.hash;
          }
        }
      }
      if(zencode.match(READ_PREVIOUS)) {
        const params = zencode.paramsOf(READ_PREVIOUS);
        for(var i = 0; i < params.length; i += 4) {
          const storage = params[i];
          const blockHash = input[params[i+1]] || params[i+1];
          const variableName = params[i+2];
          if(storage.toLowerCase() == BLOCKCHAIN) {
            validateWeb3();
            const result = await web3.eth.getBlock(blockHash);
            data[variableName] = result.parentHash;
          }
        }
      }
    });

    rr.onSuccess(async (params) => {
      const { zencode, result } = params;
      if(zencode.match(BROADCAST)) {
        validateWeb3();
        const params = zencode.paramsOf(BROADCAST);
        for (var i = 0; i < params.length; i += 3) {
          const rawtx = result[params[i]];
          const tag = params[i + 1];
          if(rawtx && tag) {
            const receipt = await web3.eth.sendSignedTransaction('0x' + rawtx);
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
