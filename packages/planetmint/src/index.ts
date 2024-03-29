import { Restroom } from "@restroom-mw/core";
import { ObjectLiteral } from "@restroom-mw/types";
import { zencodeNamedParamsOf } from '@restroom-mw/utils';

import { TransactionOperations, TransactionUnspentOutput,
  TransactionCommon } from "@planetmint/driver"
import { Connection, Transaction } from '@planetmint/driver'
import { Ed25519Sha256 } from 'crypto-conditions'
import { NextFunction, Request, Response } from "express";
import base58 from 'bs58';
import { sha3_256 } from 'js-sha3'
import {
  CONNECT,
  ASSET,
  ASSET_METADATA,
  ASSET_AMOUNT,
  ASSET_AMOUNT_METADATA,
  TRANSFER,
  TRANSFER_AMOUNT,
  SIGNATURE,
  BROADCAST,
  RETRIEVE,
} from "./actions";
import * as IPFS from 'ipfs-core'
import all from 'it-all'
import { concat as uint8ArrayConcat } from 'uint8arrays/concat'
import { fromString as uint8ArrayFromString } from 'uint8arrays/from-string'
import { toString as uint8ArrayToString } from 'uint8arrays/to-string'

interface TransactionRetrieved {
  asset: Record<string, any>;
  metadata?: Record<string, any>;
}

require("dotenv").config();

var ipfs: any = null
const storeIPFS = async (data: any) => {
  const { cid } = await ipfs.add(uint8ArrayFromString(JSON.stringify(data)))
  return cid.toString()
}
const readIPFS = async (cid: string) => {
  const data = uint8ArrayConcat(await all(ipfs.cat(cid)))
  return JSON.parse(uint8ArrayToString(data))
}

export default async (req: Request, res: Response, next: NextFunction) => {
  if(ipfs == null) {
    ipfs = await IPFS.create()
  }
  let connection: Connection = null;
  let input: ObjectLiteral = null;
  let rrData: ObjectLiteral = null;
  const rr = new Restroom(req, res);

  try {
    rr.onBefore(async (params) => {
      const { zencode, keys, data } = params;
      input = rr.combineDataKeys(data, keys);
      const namedParamsOf = zencodeNamedParamsOf(zencode, input);

      if(zencode.match(CONNECT)) {
        const [ endpoint ] = namedParamsOf(CONNECT);
        // does not perform any http request
        connection = new Connection(endpoint);
      }

      if(zencode.match(RETRIEVE)) {
        const [ id, out ] =  namedParamsOf(RETRIEVE);
        try {
          const receipt = await connection.getTransaction(id)
          const assetTx = receipt.assets[0]
          let asset: Record<string, any> = null

          if(receipt.operation === "CREATE") {
            const cid = (assetTx as {data: string}).data;
            asset = await readIPFS(cid)
          } else {
            asset = assetTx
          }

          const txResult: TransactionRetrieved = { 'asset': asset };
          /*if(receipt.metadata) {
            txResult.metadata = receipt.metadata;
          }*/
          data[ out ]= txResult;
        } catch (e) {
          throw new Error(`Transaction not found: ${id}`);
        }
      }

      const storeAsset = async ( publicKey: string, assetCID: string,
          metadataCID: string, amount: string = "1" ) => {
        const eddsaPublicKey = input[publicKey];
        if(!eddsaPublicKey) {
          throw new Error("Public key not found");
        }
        const tx = Transaction.makeCreateTransaction(
          [ assetCID ],
          metadataCID,
          [ Transaction.makeOutput(
            Transaction.makeEd25519Condition(
              eddsaPublicKey),
            amount)
          ],
          eddsaPublicKey
        );
        data.planetmint_transaction =
          Transaction.serializeTransactionIntoCanonicalString(tx)
      }

      if(zencode.match(ASSET)) {
        const [ asset, publicKey ] = zencode.paramsOf(ASSET);
        if( !input[ asset ] ) {
          throw new Error("Asset not found");
        }
        const assetCID = await storeIPFS(input[asset]);
        storeAsset(publicKey, assetCID.toString(), null, "1" );
      }

      if(zencode.match(ASSET_METADATA)) {
        const [ asset, metadata, publicKey ] = zencode.paramsOf(ASSET_METADATA);
        if( !input[asset] ) {
          throw new Error("Asset not found");
        }
        if( !input[metadata] ) {
          throw new Error("Metadata not found");
        }
        const assetCID = await storeIPFS(input[asset]);
        const metadataCID = await storeIPFS(input[metadata]);
        storeAsset(publicKey, assetCID, metadataCID, "1" );
      }

      if(zencode.match(ASSET_AMOUNT)) {
        const [ amount, asset, publicKey ] = zencode.paramsOf(ASSET_AMOUNT);
        if( !input[asset] ) {
          throw new Error("Asset not found");
        }
        if( !input[amount] ) {
          throw new Error("Amount not found");
        }
        const assetCID = await storeIPFS(input[asset]);
        storeAsset(publicKey, assetCID, null, input[ amount ]);
      }

      if(zencode.match(ASSET_AMOUNT_METADATA)) {
        const [ amount, asset, metadata, publicKey ] =
          zencode.paramsOf(ASSET_AMOUNT_METADATA);
        if( !input[asset] ) {
          throw new Error("Asset not found");
        }
        if( !input[metadata] ) {
          throw new Error("Metadata not found");
        }
        if( !input[amount] ) {
          throw new Error("Amount not found");
        }
        storeAsset(publicKey, input[ asset ], input[ metadata ], input[ amount ]);
      }

      if(zencode.match(TRANSFER)) {
        const [ txidName, recipientName ] = zencode.paramsOf(TRANSFER);
        const txid = input[txidName];
        const recipient = input[recipientName];
        if( !txid ) {
          throw new Error("Transaction id not found");
        }
        if( !recipient ) {
          throw new Error("Recipient public key not found");
        }
        const txIn = await connection.getTransaction(txid)
        if( !txIn ) {
          throw new Error(`Transaction with id ${txid} not found`);
        }
        const tx = Transaction.makeTransferTransaction(
          [ { tx: txIn, output_index: 0 } ],
          [ Transaction.makeOutput(
            Transaction.makeEd25519Condition(
              recipient ))
          ],
          null
        );
        data.planetmint_transaction =
          Transaction.serializeTransactionIntoCanonicalString(tx)
      }

      if(zencode.match(TRANSFER_AMOUNT)) {
        const [ amountName, txidName, senderName, recipientName ]
          = zencode.paramsOf(TRANSFER_AMOUNT);
        const amountStr = input[amountName];
        const txid = input[txidName];
        const senderPublicKey = input[senderName];
        const recipientPublicKey = input[recipientName];
        if( !amountStr ) {
          throw new Error("Amount not found");
        }
        if( !txid ) {
          throw new Error("Transaction id not found");
        }
        if( !senderPublicKey ) {
          throw new Error("Sender public key not found");
        }
        if( !recipientPublicKey ) {
          throw new Error("Recipient public key not found");
        }
        const amount = BigInt(amountStr)

        // Read UTXO
        const txs = await
        connection.listOutputs(senderPublicKey, false)

        // Filter UTXO that refer to the current COIN (asset txid)
        const txsUsed = []
        let currentAmount = BigInt(0)
        const txsResolved = await Promise.all(txs.map(async (txOld) => {
          return {
            txOld,
            txDict: await connection.getTransaction
            <TransactionOperations.TRANSFER>(txOld.transaction_id)}
        }))

        for(const {txOld, txDict} of txsResolved) {
          const asset = txDict.assets[0] as {id: string}
          const assetId = asset.id ? asset.id : txDict.id;
          if(assetId === txid) {
            // Refer to the current coin, we will use it!
            txsUsed.push({
              tx: txDict as TransactionCommon<TransactionOperations>,
              output_index: txOld.output_index
            } as TransactionUnspentOutput)
            currentAmount += BigInt(txDict.outputs[txOld.output_index].amount)
          }

          // The amount is more than what we want to transfer
          if(currentAmount > amount) {
            break;
          }
        }

        // Create the transfer transaction
        const tx = Transaction.makeTransferTransaction(
          txsUsed,
          [ Transaction.makeOutput(
            Transaction.makeEd25519Condition(
              senderPublicKey), (currentAmount-amount).toString(10)),
            Transaction.makeOutput(
              Transaction.makeEd25519Condition(
                recipientPublicKey), amountStr)
          ],
          null
        );
        data.planetmint_transaction =
          Transaction.serializeTransactionIntoCanonicalString(tx)
      }
      rrData = data;
    });

    rr.onSuccess(async (params) => {
      const { zencode, result } = params;

      if(zencode.match(SIGNATURE)) {
        const [ planetmintTransactionName, publicKeyName ] = zencode.paramsOf(SIGNATURE);
        const planetmintTransaction = result[planetmintTransactionName]
          || input[planetmintTransactionName];
        if( !planetmintTransaction ) {
          throw new Error("Planetmint transaction not found");
        }
        if( !result.planetmint_signatures ) {
          throw new Error("planetmint_signatures not found");
        }

        const publicKeyBS58 = result[publicKeyName] || input[publicKeyName]

        if( !publicKeyBS58 ) {
          throw new Error("EdDSA public key not provided");
        }
        const publicKey = base58.decode(publicKeyBS58)
        const tx = JSON.parse(planetmintTransaction) as
        TransactionCommon<TransactionOperations>;
        tx.inputs.forEach((txInput, index) => {
          const ed25519Fulfillment = new Ed25519Sha256()
          ed25519Fulfillment.setPublicKey(Buffer.from(publicKey))
          ed25519Fulfillment.setSignature(
            Buffer.from(result.planetmint_signatures[index], 'hex'))
          txInput.fulfillment = ed25519Fulfillment.serializeUri()
        });

        const serializedSignedTransaction =
          Transaction.serializeTransactionIntoCanonicalString(tx)
        tx.id = sha3_256(serializedSignedTransaction);
        result.signed_planetmint_transaction =
          Transaction.serializeTransactionIntoCanonicalString(tx)
      }

      if(zencode.match(BROADCAST)) {
        const [ serializedSignedTx ] = zencode.paramsOf(BROADCAST);
        if( !result[serializedSignedTx] ) {
          throw new Error("Signed planetmint transaction not found");
        }
        if( !connection ) {
          throw new Error("Connection not defined");
        }
        const signedTx = JSON.parse(result[serializedSignedTx]);
        try {
          const txResult = await connection.postTransactionCommit(signedTx)
          result.txid = txResult.id;
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
