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

test("Store a zenroom object", async (t) => {
  const { app } = t.context;
  var res = await app.post("/ethereum_store");
  t.is(res.status, 200, res.text);
  t.is(typeof res.body.txid, "string");
  t.is(res.body.txid.length, 64);
  console.log(`{ 'txid': ${res.body.txid} }`)
});

test("Retrieve a zenroom object", async (t) => {
  const poem = "Nel mezzo del cammin di nostra vita\nmi ritrovai per una selva oscura,\nché la diritta via era smarrita."
  const { app } = t.context;
  var res = await app.post("/ethereum_retrieve");
  t.is(res.status, 200, res.text);
  t.is(res.body.poem, poem);
});

test("Retrieve object that doesn't exist", async (t) => {
  const { app } = t.context;
  var res = await app.post("/ethereum_retrieve_no_exist");
  t.is(res.status, 500, res.text);
});


test("Call ERC20 methods", async (t) => {
  const { app } = t.context;
  var res = await app.post("/ethereum_erc20");
  t.is(res.status, 200, res.text);
  t.is(res.body.my_decimals, "42");
  t.is(res.body.my_name, "Non movable tokens");
  t.is(res.body.my_symbol, "NON");
  t.is(res.body.my_total_supply, "42");
  t.is(res.body.my_balance, "42");
  t.is(res.body.decimals, "42");
  t.is(res.body.name, "Non movable tokens");
  t.is(res.body.symbol, "NON");
  t.is(res.body.total_supply, "42");
  t.is(res.body.balance, "0");
});
