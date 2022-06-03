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
  READ_BALANCE,
  BROADCAST,
} from "./actions";
import Web3 from 'web3';
// import * as ERC20_ABI from './erc20_abi.json'

require("dotenv").config();

const ERC20_ABI = require('./erc20_abi.json');

let web3: Web3 = null;

const BLOCKCHAIN = "ethereum"

const validateWeb3 = () => {
  if(web3 == null) throw Error("No connection to a client")
}

export default async (req: Request, res: Response, next: NextFunction) => {
  const rr = new Restroom(req, res);

  try {
    rr.onBefore(async (params) => {
      const { zencode, keys, data } = params;
      const input = rr.combineDataKeys(data, keys);
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
        const chkParams = zencode.chunkedParamsOf(RETRIEVE, 2);
        for (const params of chkParams) {
          const tag = input[params[0]];
          const variable = params[1];
          const receipt = await web3.eth.getTransactionReceipt("0x" + tag)
          if(!receipt) {
            throw new Error("Transaction id doesn't exist")
          }
          if(!receipt.status) {
            throw new Error("Failed transaction");
          }
          try {
            const dataRead = receipt.logs[0].data.slice(2);
            data[variable] = dataRead;
          } catch(e) {
            throw new Error("Empty transaction")
          }
        }
      }

      if(zencode.match(ERC20_0_NAMED)) {
        validateWeb3();
        const chkParams = zencode.chunkedParamsOf(ERC20_0_NAMED, 3);
        for(const params of chkParams) {
          const command = params[0];
          const contractAddress = input[params[1]] || params[1];
          const variableName = params[2];
          await call_erc20(command, contractAddress, variableName, []);
        }
      }

      if(zencode.match(ERC20_0)) {
        validateWeb3();
        const chkParams = zencode.chunkedParamsOf(ERC20_0, 2);
        for(const params of chkParams) {
          const command = params[0];
          const contractAddress = input[params[1]] || params[1];
          await call_erc20(command, contractAddress, command.replace(" ", "_"), []);
        }
      }

      if(zencode.match(ERC20_1)) {
        validateWeb3();
        const chkParams = zencode.chunkedParamsOf(ERC20_1, 3);
        for(const params of chkParams) {
          const command = params[0];
          const arg = input[params[1]] || params[1];
          const contractAddress = input[params[2]] || params[2];
          await call_erc20(command, contractAddress, command.replace(" ", "_"),
                           [ '0x' + arg ]);
        }
      }

      if(zencode.match(ERC20_1_NAMED)) {
        validateWeb3();
        const chkParams = zencode.chunkedParamsOf(ERC20_1_NAMED, 4);
        for(const params of chkParams) {
          const command = params[0];
          const arg = input[params[1]] || params[1];
          const contractAddress = input[params[2]] || params[2];
          const variableName = params[3];
          await call_erc20(command, contractAddress, variableName,
                           [ '0x' + arg ]);
        }
      }

      if(zencode.match(READ_HEAD)) {
        const chkParams = zencode.chunkedParamsOf(READ_HEAD, 2);
        for(const params of chkParams) {
          const storage = params[0];
          const variableName = params[1];
          if(storage.toLowerCase() == BLOCKCHAIN) {
            const result = await web3.eth.getBlock("latest");
            data[variableName] = result.hash.slice(2);
          }
        }
      }
      if(zencode.match(READ_PREVIOUS)) {
        const chkParams = zencode.chunkedParamsOf(READ_PREVIOUS, 3);
        for(const params of chkParams) {
          const storage = params[0];
          const blockHash = input[params[1]] || data[params[1]]
                            || params[1];
          const variableName = params[2];
          if(storage.toLowerCase() == BLOCKCHAIN) {
            validateWeb3();
            const result = await web3.eth.getBlock('0x' + blockHash);
            data[variableName] = result.parentHash.slice(2);
          }
        }
      }

      if(zencode.match(READ_BALANCE)) {
        validateWeb3();
        const [ address_input ] = namedParamsOf(READ_BALANCE);
        const address = input[address_input] || address_input;
        const balance = await web3.eth.getBalance(address);
        data['ethereum_balance'] = balance.toString();
      }
    });

    rr.onSuccess(async (params) => {
      const { zencode, result } = params;
      if(zencode.match(BROADCAST)) {
        validateWeb3();
        const chkParams = zencode.chunkedParamsOf(BROADCAST, 2);
        for(const params of chkParams) {
          const rawtx = result[params[0]];
          const tag = params[1];
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
