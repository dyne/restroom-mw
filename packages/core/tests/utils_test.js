import test from "ava";
import request from "supertest";
import express from "express";
import bodyParser from "body-parser";

process.env.ZENCODE_DIR = "./test/fixtures";
const zencode = require("../../core").default;

const {
  getKeys,
  getConf,
  getContracts,
  getMessage,
  getFuzzyContractMessage,
  getEndpointsMessage,
} = require("../src/utils");

test("getKeys works correctly", (t) => {
  const keys = getKeys("contract_keys");
  t.is(keys, "{}\n");
});

test("getConf works correctly", (t) => {
  const conf = getConf("contract_keys");
  t.is(conf, "CONF");
});

test("getContracts works correctly", async (t) => {
  const contracts = await getContracts("/");
  t.deepEqual(contracts, [
    "/broken",
    "/contract_keys",
    "/database",
    "/database_table",
    "/random",
  ]);
});

test("getMessages work correctly", async (t) => {
  const app = express();
  app.use(bodyParser.json());
  app.use("/*", zencode);

  const res = await request(app).post("/non-existent-endpoint");
  t.true(res.text.includes("404: This contract does not exists"));
  t.is(
    res.text,
    '<h2>404: This contract does not exists</h2><h4>Other contract\'s endpoints are </h4><ul><a href="/broken">/broken</a><br/><a href="/contract_keys">/contract_keys</a><br/><a href="/database">/database</a><br/><a href="/database_table">/database_table</a><br/><a href="/random">/random</a></ul>'
  );
});

test("Fuzzy contracts are found", (t) => {
  const result_empty = getFuzzyContractMessage("contract", [], "/");
  t.is(result_empty, "");
  const result = getFuzzyContractMessage("contract", ["contracts"], "/");
  t.is(
    result,
    '<p>Maybe you were looking for <strong><a href="/contracts">contracts</a></strong></p>'
  );
});

test("Endpoint messages are shown", (t) => {
  t.is("", getEndpointsMessage([], "/"));
  const result = getEndpointsMessage(["foo", "bar"], "/");
  t.is(
    result,
    '<h4>Other contract\'s endpoints are </h4><ul><a href="/foo">foo</a><br/><a href="/bar">bar</a></ul>'
  );
});

test("Complete message", async (t) => {
  const req = {
    params: ["/contract"],
    originalUrl: "/api/contract",
  };

  const result = await getMessage(req);
  t.is("<h2>404: This contract does not exists</h2>", result);
});
