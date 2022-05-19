import { Restroom } from "@restroom-mw/core";
import { ObjectLiteral } from "@restroom-mw/types";
import { zencodeNamedParamsOf } from '@restroom-mw/utils';

import { Ed25519Keypair, Connection, Transaction } from "bigchaindb-driver";
import { NextFunction, Request, Response } from "express";
import {
  GENERATEKEY,
  CONNECT,
  ASSET,
  ASSET_METADATA,
  SIGNATURE,
  BROADCAST,
  RETRIEVE,
} from "./actions";

interface TransactionRetrieved {
  asset: Record<string, any>;
  metadata?: Record<string, any>;
}

require("dotenv").config();
let connection: Connection = null;
let input: ObjectLiteral = null;

const BLOCKCHAIN = "planetmint"

const utf8_to_b64 = ( str: string ) => {
  return Buffer.from( str, 'utf-8').toString( 'base64' );
}

const b64_to_utf8 = ( str: string ) => {
  return Buffer.from( str, 'base64').toString( 'utf-8' );
}

export default async (req: Request, res: Response, next: NextFunction) => {
  const rr = new Restroom(req, res);

  try {
    rr.onBefore(async (params) => {
      const { zencode, keys, data } = params;
      input = rr.combineDataKeys(data, keys);
      const namedParamsOf = zencodeNamedParamsOf(zencode, input);

      if(zencode.match(GENERATEKEY)) {
	// keypair is in base58 format
	const { privateKey, publicKey } = new Ed25519Keypair();
	data[ 'ed25519_keypair' ] = { private_key: privateKey, public_key: publicKey };
      }

      if(zencode.match(CONNECT)) {
        const [ endpoint ] = namedParamsOf(CONNECT);
        // does not perform any http request
        connection = new Connection(endpoint);
      }

      if(zencode.match(RETRIEVE)) {
const [ id, out ] =  namedParamsOf(RETRIEVE);
	try {
	  const receipt = await connection.getTransaction(id);
	  let res: TransactionRetrieved = { 'asset': receipt.asset };
	  if(receipt.metadata) {
	    res.metadata = receipt.metadata;
	  }
	  data[ 'out' ] = res;
	} catch (e) {
	  throw new Error("Transaction not found");
	}
      }
    });

    rr.onSuccess(async (params) => {
      const { zencode, result } = params;

      const store_asset = ( asset: Record<string, any>, metadata: Record<string, any> ) => {
	if( !result.ed25519_keypair || !result.ed25519_keypair.public_key ) {
	  throw new Error("Public key not found");
	}
	const tx = Transaction.makeCreateTransaction(
	  asset,
	  metadata,
	  [ Transaction.makeOutput(
	    Transaction.makeEd25519Condition(
	      result.ed25519_keypair.public_key ))
	  ],
	  result.ed25519_keypair.public_key
	);
	result[ 'planetmint_transaction' ] = utf8_to_b64(JSON.stringify(tx));
      }

      if(zencode.match(ASSET)) {
        const [ asset ] = zencode.paramsOf(ASSET);
        const metadata: Record<string, any> = null;
        if( !result[ asset ] ) {
          throw new Error("Asset not found");
        }
        store_asset( result[ asset ], metadata );
      }

      if(zencode.match(ASSET_METADATA)) {
        const [ asset, metadata ] = zencode.paramsOf(ASSET_METADATA);
        if( !result[asset] ) {
          throw new Error("Asset not found");
        }
        if( !result[metadata] ) {
          throw new Error("Metadata not found");
        }
        store_asset( result[ asset ], result[ metadata ] );
      }

      if(zencode.match(SIGNATURE)) {
	const [ tx_b64 ] = zencode.paramsOf(SIGNATURE);
	if( !result[ tx_b64 ] ) {
	  throw new Error("Planetmint transaction not found");
	}
	if( !result.ed25519_keypair || !result.ed25519_keypair.private_key ) {
	  throw new Error("Private key not found");
	}
	const tx = JSON.parse(b64_to_utf8(result[ tx_b64 ]));
	const signed_tx = Transaction.signTransaction(
	  tx,
	  result.ed25519_keypair.private_key );
	result[ 'signed_planetmint_transaction' ] = utf8_to_b64(JSON.stringify(signed_tx));
      }

      if(zencode.match(BROADCAST)) {
        const [ signed_tx_b64 ] = zencode.paramsOf(BROADCAST);
        if( !result[signed_tx_b64] ) {
          throw new Error("Signed planetmint transaction not found");
        }
        if( !connection ) {
          throw new Error("Connection not defined");
        }
        const signed_tx = JSON.parse(b64_to_utf8(result[signed_tx_b64]));
        try {
          const res = await connection.postTransactionCommit(signed_tx)
          result[ 'txId' ] = res.id;
        } catch(e) {
          throw new Error(`Connection to the node failed: ${e}`);
        }
      }

    });
    next();
  } catch (e) {
    next(e);
  }
};
