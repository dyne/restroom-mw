import anyTest, { TestFn } from "ava";
import bodyParser from "body-parser";
import express from "express";
import supertest, { SuperTest, Test } from "supertest";

const test = anyTest as TestFn<{ app: SuperTest<Test> }>;

process.env.ZENCODE_DIR = "./test/fixtures";
const zencode = require("../../core/src/index");
const ethereum = require("../src/index");

test.before(async (t) => {
  const app = express();
  app.use(bodyParser.json());
  app.use(ethereum.default);
  app.use("/*", zencode.default);
  t.context.app = supertest(app);
});

test.serial("Store a zenroom object", async (t) => {
  const { app } = t.context;
  const res = await app.post("/ethereum_store");
  t.is(res.status, 200, res.text);
  t.is(typeof res.body.txid, "string");
  t.is(res.body.txid.length, 64);
  console.log(`{ 'txid': ${res.body.txid} }`)
});

test("Retrieve a zenroom object", async (t) => {
  const poem = "Nel mezzo del cammin di nostra vita\nmi ritrovai per una selva oscura,\nché la diritta via era smarrita."
  const { app } = t.context;
  const res = await app.post("/ethereum_retrieve");
  t.is(res.status, 200, res.text);
  t.is(res.body.poem, poem);
});

test("Retrieve object that doesn't exist", async (t) => {
  const { app } = t.context;
  const res = await app.post("/ethereum_retrieve_no_exist");
  t.is(res.status, 500, res.text);
});


test("Call ERC20 methods", async (t) => {
  const { app } = t.context;
  const res = await app.post("/ethereum_erc20");
  t.is(res.status, 200, res.text);
  t.is(res.body.my_decimals, "18");
  t.is(res.body.my_name, "Non movable token");
  t.is(res.body.my_symbol, "NMT");
  t.is(res.body.my_total_supply, "1000");
  t.is(res.body.my_balance, "1000");
  t.is(res.body.decimals, "18");
  t.is(res.body.name, "Non movable token");
  t.is(res.body.symbol, "NMT");
  t.is(res.body.total_supply, "1000");
  t.is(res.body.balance, "0");
});

test.skip("Read head and previous", async (t) => {
  const { app } = t.context;
  const res = await app.post("/ethereum_blocks");
  t.is(res.status, 200, res.text);
  t.is(typeof res.body.my_hash, "string")
  t.is(res.body.my_hash.length, 64)
  t.is(typeof res.body.previous_hash, "string")
  t.is(res.body.previous_hash.length, 64)
  t.is(res.body.previous_old_hash, "e17d622a0fe17893d88905c04ecc22f28cceed3ad4c062e3485fa8629cc024a0")
});

test("Read the address balance", async (t) => {
  const { app } = t.context;
  const res = await app.post("/ethereum_balance");
  t.is(res.status, 200, res.text);
  t.is(typeof res.body.ethereum_balance, "string");
  t.is(res.body.ethereum_balance, "1000000000000000000000");
});

test("Read the balance of an array of addresses", async (t) => {
  const { app } = t.context;
  const res = await app.post("/ethereum_balance_array");
  t.is(res.status, 200, res.text);
  t.is(res.body.ethereum_balances.length, 3)
  for (const v of res.body.ethereum_balances)
    t.is(typeof v.wei_value, "string")
});

test.skip("Read the token id for a nft created in a transaction", async (t) => {
  const { app } = t.context;
  const res = await app.post("/ethereum_read_token_id");
  t.is(res.status, 200, res.text);
  t.is(res.body.erc721_id, 13);
  t.is(res.body.owner, "dC51204D6ceB8aE21cD2e826A07D5406809aA389".toLowerCase())
  t.is(res.body.asset, '{"ciao": "mondo"}')
});
