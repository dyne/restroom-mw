import test from "ava";
import bodyParser from "body-parser";
import express from "express";
import supertest from "supertest";
import axios from "axios";
import retry from "async-retry";


process.env.ZENCODE_DIR = "./test/fixtures";
const sawroom = require("../dist");
const zencode = require("../../core");

test.before(async (t) => {
  const app = express();
  app.use(bodyParser.json());
  app.use(sawroom.default);
  app.use("/*", zencode.default);
  t.context.app = supertest(app);
});

test.serial("Middleware should read from sawtooth correctly", async (t) => {
  const { app } = t.context;
  const res = await app.post("/sawroom_read");
  t.is(res.status, 200, res.text);
  const result = res.body.sawroom[0];
  t.true(result.includes("keypair"));
  t.true(result.includes("public_key"));
  t.true(result.includes("private_key"));
});

test.serial("Middleware should execute on sawtooth correctly", async (t) => {
  const { app } = t.context;
  const res = await app.post("/sawroom_execute");
  t.is(res.status, 200, res.text);
  t.true(Array.isArray(res.body));
  t.is(typeof res.body[0].sawroom.test.sawroom_link, "string");
  t.is(typeof res.body[0].sawroom.test.batch_id, "string");
  t.is(res.body[0].sawroom.test.batch_id.length, 128);
});

test.serial("getToken works correctly", async (t) => {
  const { app } = t.context;
  const res = await app.post("/sawroom_login");
  t.is(res.status, 200, res.text);
  t.is(res.body.token.length, 173);
});

test.serial("Setup the context id", async (t) => {
  const { app } = t.context;
  const res = await app.post("/sawroom_context_id");
  t.is(res.status, 200, res.text);
});

test.serial("Save data on sawroom works correctly", async (t) => {
  const { app } = t.context;
  const res = await app.post("/sawroom-save-data");
  const cid1 = "0Uu+Ldk04+JSw9V0TQW2ufZuxe1v3K8jffunxxLLI0o=";
  const cid2 = "LCsmEBZblccKjrWCJi7tvg==";
  t.is(res.status, 200, res.text);
  t.is(typeof res.body.sawroom[cid1].sawroom_link, "string");
  t.is(typeof res.body.sawroom[cid1].batch_id, "string");
  t.is(res.body.sawroom[cid1].batch_id.length, 128);
  t.is(typeof res.body.sawroom[cid2].sawroom_link, "string");
  t.is(typeof res.body.sawroom[cid2].batch_id, "string");
  t.is(res.body.sawroom[cid2].batch_id.length, 128);
});

test.serial("Store on rust TP works correctly", async (t) => {
  const { app } = t.context;
  const res = await app.post("/sawroom_store");
  t.is(res.status, 200, res.text);
  t.is(typeof res.body["my128Tag"], "string");
});

test.serial("Store OUTPUT on rust TP works correctly", async (t) => {
  const { app } = t.context;
  const res = await app.post("/sawroom_store_output");
  t.is(res.status, 200, res.text);
  t.log(res.text);
  t.is(typeof res.body["my128Tag"], "string");
});

test.serial("Retrieve on rust TP works correctly", async (t) => {
  const { app } = t.context;
  const res = await app.post("/sawroom_retrieve");
  t.is(res.status, 200, res.text);
  t.log(res.body);
  t.is(res.body["myResult"], "u0cAuigKpEaiP1xljKiWkg==");
});

const is_transaction_valid = async (link) => {
  var res = await retry(async () => {
    var batchResult = await axios.get(link);
    if (batchResult == undefined) throw new Error("Waiting fro batch");
    if (batchResult.data.data == undefined) throw new Error("Waiting for Data");
    if (batchResult.data.data[0].status == "PENDING") throw new Error;
    return batchResult;
  }, { retries: 5 });
  return (res.data.data[0].status);
};

test.serial("Deposit on wallet TP work correctly", async (t) => {
  const { app } = t.context;
  var res = await app.post("/sawroom_ask_balance");
  const oldBalance = res.body["myBalance"];
  res = await app.post("/sawroom_deposit");
  t.is(res.status, 200, res.text);
  t.is(typeof res.body["myOutput"], "string");
  const status = await is_transaction_valid(res.body["myOutput"]);
  t.is(status, "COMMITTED");
  var res = await app.post("/sawroom_ask_balance");
  const newBalance = res.body["myBalance"];
  t.is(newBalance - oldBalance, 3);
});

test.serial("Asking the balance on wallet TP work correctly", async (t) => {
  const { app } = t.context;
  const res = await app.post("/sawroom_ask_balance");
  t.is(res.status, 200, res.text);
  t.is(typeof res.body["myBalance"], "number");
});

