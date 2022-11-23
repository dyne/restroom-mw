import { Restroom } from "@restroom-mw/core";
import { ObjectLiteral } from "@restroom-mw/types";
import { zencodeNamedParamsOf } from '@restroom-mw/utils';

import { Ed25519Keypair, Connection, Transaction } from "bigchaindb-driver";
import { TransactionOperations, TransactionUnspentOutput,
         TransactionCommon }
  from "bigchaindb-driver/types/transaction"
import { NextFunction, Request, Response } from "express";
import {
  GENERATEKEY,
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

interface TransactionRetrieved {
  asset: Record<string, any>;
  metadata?: Record<string, any>;
}

require("dotenv").config();

const utf8ToB64 = ( str: string ) => {
  return Buffer.from( str, 'utf-8').toString( 'base64' );
}

const b64ToUtf8 = ( str: string ) => {
  return Buffer.from( str, 'base64').toString( 'utf-8' );
}

export default async (req: Request, res: Response, next: NextFunction) => {
  let connection: Connection = null;
  let input: ObjectLiteral = null;
  let rrData: ObjectLiteral = null;
  const rr = new Restroom(req, res);

  try {
    rr.onBefore(async (params) => {
      const { zencode, keys, data } = params;
      input = rr.combineDataKeys(data, keys);
      const namedParamsOf = zencodeNamedParamsOf(zencode, input);

      if(zencode.match(GENERATEKEY)) {
        // keypair is in base58 format
        const { privateKey, publicKey } = new Ed25519Keypair();
        data.ed25519_keypair = { private_key: privateKey, public_key: publicKey };
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
          const txResult: TransactionRetrieved = { 'asset': receipt.asset };
          if(receipt.metadata) {
            txResult.metadata = receipt.metadata;
          }
          data[ out ]= txResult;
        } catch (e) {
          throw new Error(`Transaction not found: ${id}`);
        }
      }

      rrData = data;
    });

    rr.onSuccess(async (params) => {
      const { zencode, result } = params;

      const storeAsset = ( asset: Record<string, any>, metadata: Record<string, any>,
          amount: string = "1" ) => {
        const ed25519Keypair = result.ed25519_keypair
          || rrData.ed25519_keypair || input.ed25519_keypair;
        if( !ed25519Keypair || !ed25519Keypair.public_key ) {
          throw new Error("Public key not found");
        }
        const tx = Transaction.makeCreateTransaction(
          asset,
          metadata,
          [ Transaction.makeOutput(
            Transaction.makeEd25519Condition(
              ed25519Keypair.public_key ),
            amount)
          ],
          ed25519Keypair.public_key
        );
        result.planetmint_transaction = utf8ToB64(JSON.stringify(tx));
      }

      if(zencode.match(ASSET)) {
        const [ asset ] = zencode.paramsOf(ASSET);
        const metadata: Record<string, any> = null;
        if( !result[ asset ] ) {
          throw new Error("Asset not found");
        }
        storeAsset( result[ asset ], metadata, "1" );
      }

      if(zencode.match(ASSET_METADATA)) {
        const [ asset, metadata ] = zencode.paramsOf(ASSET_METADATA);
        if( !result[asset] ) {
          throw new Error("Asset not found");
        }
        if( !result[metadata] ) {
          throw new Error("Metadata not found");
        }
        storeAsset( result[ asset ], result[ metadata ], "1" );
      }

      if(zencode.match(ASSET_AMOUNT)) {
        const [ asset, amount ] = zencode.paramsOf(ASSET_AMOUNT);
        const metadata: Record<string, any> = null;
        if( !result[asset] ) {
          throw new Error("Asset not found");
        }
        if( !result[amount] ) {
          throw new Error("Amount not found");
        }
        storeAsset( result[ asset ], metadata, result[ amount ] );
      }

      if(zencode.match(ASSET_AMOUNT_METADATA)) {
        const [ asset, amount, metadata ] = zencode.paramsOf(ASSET_AMOUNT_METADATA);
        if( !result[asset] ) {
          throw new Error("Asset not found");
        }
        if( !result[metadata] ) {
          throw new Error("Metadata not found");
        }
        if( !result[amount] ) {
          throw new Error("Amount not found");
        }
        storeAsset( result[ asset ], result[ metadata ], result[ amount ] );
      }

      if(zencode.match(TRANSFER)) {
        const [ txidName, recipientName ] = zencode.paramsOf(TRANSFER);
        const txid = result[txidName] || input[txidName];
        const recipient = result[recipientName] || input[recipientName];
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
        result.planetmint_transaction = utf8ToB64(JSON.stringify(tx));
      }

      if(zencode.match(TRANSFER_AMOUNT)) {
        const [ amountName, txidName, recipientName ]
          = zencode.paramsOf(TRANSFER_AMOUNT);
        const amountStr = result[amountName] || input[amountName];
        const txid = result[txidName] || input[txidName];
        const recipient = result[recipientName] || input[recipientName];
        if( !amountStr ) {
          throw new Error("Amount not found");
        }
        if( !txid ) {
          throw new Error("Transaction id not found");
        }
        if( !recipient ) {
          throw new Error("Recipient public key not found");
        }
        const ed25519Keypair = result.ed25519_keypair
          || rrData.ed25519_keypair || input.ed25519_keypair;
        const amount = BigInt(amountStr)

        // Read UTXO
        const txs = await
          connection.listOutputs(result.ed25519_keypair.public_key, false)

        // Filter UTXO that refer to the current COIN (asset txid)
        let txsUsed = []
        let currentAmount = BigInt(0)
        for(const txOld of txs) {
          const txDict = await
            connection.getTransaction
              <TransactionOperations.TRANSFER>(txOld.transaction_id)

          const assetId = txDict.asset.id ? txDict.asset.id : txDict.id;
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
                ed25519Keypair.public_key), (currentAmount-amount).toString(10)),
            Transaction.makeOutput(
              Transaction.makeEd25519Condition(
                recipient), amountStr)
          ],
          null
        );
        result.planetmint_transaction = utf8ToB64(JSON.stringify(tx));
      }

      if(zencode.match(SIGNATURE)) {
        const [ txB64 ] = zencode.paramsOf(SIGNATURE);
        if( !result[ txB64 ] ) {
          throw new Error("Planetmint transaction not found");
        }
        const ed25519Keypair = result.ed25519_keypair
          || rrData.ed25519_keypair || input.ed25519_keypair;
        if( !ed25519Keypair || !ed25519Keypair.private_key ) {
          throw new Error("Private key not found");
        }
        const tx = JSON.parse(b64ToUtf8(result[ txB64 ]));
        const privateKeys = Array(tx.inputs.length)
            .fill( ed25519Keypair.private_key )
        const signedTx = Transaction.signTransaction(
          tx,
          ...privateKeys);
        result.signed_planetmint_transaction = utf8ToB64(JSON.stringify(signedTx));
      }

      if(zencode.match(BROADCAST)) {
        const [ signedTxB64 ] = zencode.paramsOf(BROADCAST);
        if( !result[signedTxB64] ) {
          throw new Error("Signed planetmint transaction not found");
        }
        if( !connection ) {
          throw new Error("Connection not defined");
        }
        const signedTx = JSON.parse(b64ToUtf8(result[signedTxB64]));
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
