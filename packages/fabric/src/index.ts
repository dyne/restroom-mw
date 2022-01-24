import { Restroom } from "@restroom-mw/core";
import { ObjectLiteral } from "@restroom-mw/core/src/types";
import * as crypto from 'crypto';
// How to include this?
// import { combineDataKeys } from "@restroom-mw/sawroom/src/lib";
import { Gateway, connect, Contract, Identity, Signer, signers,
         Network }
   from '@hyperledger/fabric-gateway';
import { Client, credentials } from '@grpc/grpc-js';
import axios from "axios";
import { NextFunction, Request, Response } from "express";
import {
  FABRIC_ADDRESS,
  FABRIC_CONNECT,
  FABRIC_CHANNEL,
  FABRIC_CONTRACT,
  FABRIC_SEND_TRANSACTION,
} from "./actions";
import { TextDecoder } from 'util';

let fabricAddress: string = null;
let client: Client = null;
let tlsCertificate;
let input: ObjectLiteral = {};
let gateway: Gateway = null;
let network: Network = null;
let contract: Contract = null;

const utf8Decoder = new TextDecoder();

// Copied from sawroom lib
export const combineDataKeys = (data: ObjectLiteral, keys: string) => {
  try {
    return { ...data, ...JSON.parse(keys) };
  } catch (e) {
    throw new Error("Keys or data in wrong format");
  }
};

export default async (req: Request, res: Response, next: NextFunction) => {
  const rr = new Restroom(req, res);

  try {
    rr.onBefore(async (params) => {
      const { zencode, keys, data } = params;
      input = combineDataKeys(data, keys);

      const namedParamsOf = (sid: string): string[] => {
        if (!zencode.match(sid)) return [];
        const params = zencode.paramsOf(sid);
        return params.reduce((acc: string[], p: string) => {
          acc.push(input[p] || p);
          return acc;
        }, []);
      };
      if(zencode.match(FABRIC_ADDRESS)) {
	[fabricAddress, tlsCertificate] = namedParamsOf(FABRIC_ADDRESS);
	tlsCertificate = Buffer.from(tlsCertificate, 'utf-8')
	const tlsCredentials = credentials.createSsl(tlsCertificate);
	client = new Client(fabricAddress, tlsCredentials, {});
      }

      if(zencode.match(FABRIC_CONNECT)) {
	const [mspId, certificate, privateKeyPem] = namedParamsOf(FABRIC_CONNECT);
	// identity
	const certificateBuf = Buffer.from(certificate, 'utf-8');
	const identity: Identity = {mspId: mspId, credentials: certificateBuf};
	console.log(identity)
	// signer
	const privateKey = crypto.createPrivateKey(privateKeyPem);
	const signer: Signer = signers.newPrivateKeySigner(privateKey);
	
	gateway = connect({
          client,
          identity,
          signer,
          // Default timeouts for different gRPC calls
          evaluateOptions: () => {
            return { deadline: Date.now() + 5000 }; // 5 seconds
          },
          endorseOptions: () => {
            return { deadline: Date.now() + 15000 }; // 15 seconds
          },
          submitOptions: () => {
            return { deadline: Date.now() + 5000 }; // 5 seconds
          },
          commitStatusOptions: () => {
            return { deadline: Date.now() + 60000 }; // 1 minute
          },
	});
      }

      if(zencode.match(FABRIC_CHANNEL)) {
	const [channelName] = namedParamsOf(FABRIC_CHANNEL)
	network = gateway.getNetwork(channelName);
	console.log(network.getName());
      }
      
      if(zencode.match(FABRIC_CONTRACT)) {
	const [contractName] = namedParamsOf(FABRIC_CONTRACT)
	contract = network.getContract(contractName);
	console.log(contract.getChaincodeName());
      }

      if(zencode.match(FABRIC_SEND_TRANSACTION)) {
	const params = zencode.paramsOf(FABRIC_SEND_TRANSACTION);
	for (var i = 0; i < params.length; i += 2) {
	  try {
	    if(params[i] == 'evaluate') {
	      const resultBytes = await contract.evaluateTransaction(params[i+1]);
	      const resultJson = utf8Decoder.decode(resultBytes);
	      const result = JSON.parse(resultJson);
	      console.log(result);
	    } else {
	      console.log(await contract.submitTransaction(params[i+1]))
	    }
	  } catch(e) {
	    console.debug(e)
	  }
	}
      }
    });

    rr.onSuccess(async (params) => {
      gateway.close()
    });
    next();
  } catch (e) {
    next(e);
  }
};

