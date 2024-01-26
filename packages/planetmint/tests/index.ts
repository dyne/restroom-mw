import anyTest, { TestFn } from "ava";
import bodyParser from "body-parser";
import express from "express";
import supertest, { SuperTest, Test } from "supertest";

import { CID } from 'multiformats'
const test = anyTest as TestFn<{ app: SuperTest<Test> }>;

process.env.ZENCODE_DIR = "./test/fixtures";
const zencode = require("../../core/src/index");
const planetmint = require("../src/index");

test.before(async (t) => {
  const app = express();
  app.use(bodyParser.json());
  app.use(planetmint.default);
  app.use("/*", zencode.default);
  t.context.app = supertest(app);
});

test.skip("Store the signed tx of an asset", async (t) => {
  const { app } = t.context;
  const asset = {timestamp: new Date().getTime(), city: "Berlin", temperature: "22"};
  const res = await app.post("/planetmint_store_asset")
    .send({keys: {}, data: {asset}});
  t.is(res.status, 200, res.text);
  t.is(typeof res.body.txid, "string");
  t.is(res.body.txid.length, 64);
  console.log(`{ 'txid': ${res.body.txid} }`);
  const resRetrieve = await app.post("/planetmint_retrieve")
    .send({keys: {}, data: {"txid": res.body.txid}});
  t.is(res.body.hash, resRetrieve.body.hash);
});

test.skip("Store the signed tx of an asset with metadata", async (t) => {
  const { app } = t.context;
  const metadata = {timestamp: new Date().getTime().toString()};
  const res = await app.post("/planetmint_store_asset_metadata")
    .send({keys: {}, data: {metadata}});
  t.is(res.status, 200, res.text);
  t.is(typeof res.body.txid, "string");
  t.is(res.body.txid.length, 64);
  console.log(`{ 'txid': ${res.body.txid} }`);
});

// Test network looks not persisten, we can only read
// what we store, joined with the "store test"
test.skip("Retrieve a zenroom object", async (t) => {
  const hash = "X3Ngi92hcL98N9SelgXAVu1SM8SXI18KZhFKTq4oyzo="
  const { app } = t.context;
  const res = await app.post("/planetmint_retrieve");
  t.is(res.status, 200, res.text);
  t.is(res.body.hash, hash);
});

test.skip("Retrieve object that doesn't exist", async (t) => {
  const { app } = t.context;
  const res = await app.post("/planetmint_retrieve_no_exist");
  t.is(res.status, 500, res.text);
});

test.skip("Create asset, transfer it and then trasnfer it back", async (t) => {
  const bob = {
    private_key: "J9tV35oDozNe9S7esxi4p4zkkefmrPp2ez63PjKwqfRz",
    public_key: "2umg6yiPZV5QqnaLBy1cwszFiAUSNTVAaXjekwqXL8NW"
  };
  const { app } = t.context;
  const asset = {timestamp: new Date().getTime(), to_be_transfered: true};
  const resCreate = await app.post("/planetmint_store_asset")
    .send({keys: {}, data: {asset}});
  t.is(resCreate.status, 200, resCreate.text);
  const resTransfer1 = await app.post("/planetmint_transfer")
    .send({keys: {}, data: {
      txid: resCreate.body.txid,
      keyring: {
        eddsa: resCreate.body.keyring.eddsa,
      },
      eddsa_public_key: resCreate.body.eddsa_public_key,
      recipient_public_key: bob.public_key,
    }});
  t.is(resTransfer1.status, 200, resTransfer1.text);
  const resTransfer2 = await app.post("/planetmint_transfer")
    .send({keys: {}, data: {
      txid: resTransfer1.body.txid,
      keyring: {
        eddsa: bob.private_key,
      },
      eddsa_public_key: bob.public_key,
      recipient_public_key: resCreate.body.eddsa_public_key,
    }});
  t.is(resTransfer2.status, 200, resTransfer2.text);
});

test.skip("Create a token and transfer it", async (t) => {
  const bob = {
    private_key: "J9tV35oDozNe9S7esxi4p4zkkefmrPp2ez63PjKwqfRz",
    public_key: "2umg6yiPZV5QqnaLBy1cwszFiAUSNTVAaXjekwqXL8NW"
  };
  const { app } = t.context;
  const asset = {timestamp: new Date().getTime(), name: "MY SUPER COIN 💣️"};
  const resCreate = await app.post("/planetmint_store_asset_amount")
    .send({keys: {}, data: {asset}});
  t.is(resCreate.status, 200, resCreate.text);
  console.log(`{ 'txid': ${resCreate.body.txid} }`);
  const resTransfer1 = await app.post("/planetmint_transfer_token")
    .send({keys: {}, data: {
      txid: resCreate.body.txid,
      keyring: {
        eddsa: resCreate.body.keyring.eddsa,
      },
      eddsa_public_key: resCreate.body.eddsa_public_key,
      public_key: bob.public_key
    }});
  t.is(resTransfer1.status, 200, resTransfer1.text);
  const resTransfer2 = await app.post("/planetmint_transfer_token2")
    .send({keys: {}, data: {
      txid: resCreate.body.txid,
      keyring: {
        eddsa: bob.private_key,
      },
      eddsa_public_key: bob.public_key,
      receiver: resCreate.body.eddsa_public_key,
      amount: "40000000000000000"
    }});
  t.is(resTransfer2.status, 200, resTransfer2.text);
  const resTransfer3 = await app.post("/planetmint_transfer_token2")
    .send({keys: {}, data: {
      txid: resCreate.body.txid,
      keyring: {
        eddsa: resCreate.body.keyring.eddsa,
      },
      eddsa_public_key: resCreate.body.eddsa_public_key,
      receiver: bob.public_key,
      amount: "50000000000000000"
    }});
  t.is(resTransfer3.status, 200, resTransfer3.text);
});
