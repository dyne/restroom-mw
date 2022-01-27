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
  ADDRESS,
  CONNECT,
  CHANNEL,
  CONTRACT,
  QUERY,
  SUBMIT
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


// The steps in FabricInterop are all required (in this order...)
enum FabricInterop {
  Address = 0,
  Connect,
  Channel,
  Contract
}
let current: FabricInterop = FabricInterop.Address;

const validateStep = (requested: FabricInterop) => {
  if(requested > current) {
    throw new Error(
`One step is missing
1. Set endpoint address
2. Connect organization
3. Set channel
4. Set contract (chaincode)`)
  }
}

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
      if(zencode.match(ADDRESS)) {
	validateStep(FabricInterop.Address);
	[fabricAddress, tlsCertificate] = namedParamsOf(ADDRESS);
	tlsCertificate = Buffer.from(tlsCertificate, 'utf-8')
	const tlsCredentials = credentials.createSsl(tlsCertificate);
	client = new Client(fabricAddress, tlsCredentials, {});
	current = FabricInterop.Connect;
      }

      if(zencode.match(CONNECT)) {
	validateStep(FabricInterop.Connect);
	const [mspId, certificate, privateKeyPem] = namedParamsOf(CONNECT);
	// identity
	const certificateBuf = Buffer.from(certificate, 'utf-8');
	const identity: Identity = {mspId: mspId, credentials: certificateBuf};
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
	current = FabricInterop.Channel;
      }

      if(zencode.match(CHANNEL)) {
	validateStep(FabricInterop.Channel);
	const [channelName] = namedParamsOf(CHANNEL)
	network = gateway.getNetwork(channelName);
	current = FabricInterop.Contract;
      }
      
      if(zencode.match(CONTRACT)) {
	validateStep(FabricInterop.Contract);
	const [contractName] = namedParamsOf(CONTRACT)
	contract = network.getContract(contractName);
      }

      if(zencode.match(QUERY)) {
	validateStep(FabricInterop.Contract); // The user must have set a contract
	const params = zencode.paramsOf(QUERY);
	for (var i = 0; i < params.length; i += 2) {
	  try {
	    const functionData = input[params[i]]
	    const resultBytes = await contract.evaluateTransaction.apply(contract, functionData);
	    const resultJson = utf8Decoder.decode(resultBytes);
	    const result = JSON.parse(resultJson);
	    data[params[i+1]] = result;
	  } catch(e) {
	    throw new Error("Could not evaluate transaction")
	  }
	}
      }
    });

    rr.onSuccess(async (params) => {
      validateStep(FabricInterop.Contract); // The user must have set a contract
      const { zencode, result } = params;
      if(zencode.match(SUBMIT)) {
	const params = zencode.paramsOf(SUBMIT);
	for (var i = 0; i < params.length; i += 2) {
	  try {
	    const functionData = input[params[i]]
	    await contract.submitTransaction.apply(contract, functionData);
	  } catch(e) {
	    throw new Error("Could not submit transaction")
	  }
	}
      }
      gateway.close()
    });
    next();
  } catch (e) {
    next(e);
  }
};

