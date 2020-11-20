import test from "ava";
import request from "supertest";
import express from "express";
import bodyParser from "body-parser";
import { getHooks, initHooks } from "../dist/hooks";

process.env.ZENCODE_DIR = "./test/fixtures";
const zencode = require("../dist").default;

const {
  getKeys,
  getConf,
  getData,
  getContracts,
  getMessage,
  getFuzzyContractMessage,
  getEndpointsMessage,
} = require("../dist/utils");

test("getKeys works correctly", (t) => {
  const keys = getKeys("contract_keys");
  t.is(keys, "{}\n");
  const fakeKeys = getKeys("non existend contract");
  t.is(fakeKeys, null);
});

test("getConf works correctly", (t) => {
  const conf = getConf("contract_keys");
  t.is(conf, "CONF");
  const fakeConf = getConf("non existend contract");
  t.is(fakeConf, `color=0`);
});

test("getContracts works correctly", async (t) => {
  const contracts = await getContracts("/");
  t.deepEqual(contracts, [
    "/broken",
    "/contract_keys",
    "/database",
    "/database_table",
    "/http-output",
    "/http-test",
    "/keygen",
    "/random",
  ]);
});

test("getMessages work correctly", async (t) => {
  const app = express();
  app.use(bodyParser.json());
  app.use("/*", zencode);

  const res = await request(app).post("/non-existent-endpoint");
  t.true(res.text.includes("404: This contract does not exists"));
  t.is(res.text, "<h2>404: This contract does not exists</h2>");
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

test("getData works correctly", (t) => {
  const req = { body: { data: null } };
  const res = { locals: { zenroom_data: null } };
  t.deepEqual(getData(req, res), {});
});

test("getData with empty request", (t) => {
  const req = { body: { data: null } };
  const res = { locals: { zenroom_data: 42 } };

  t.is(42, res.locals.zenroom_data || req.body.data || {});
  t.is(getData({ body: { data: null } }, { locals: { zenroom_data: 42 } }), 42);
});

test("getData with empty response", (t) => {
  const req = { body: { data: 42 } };
  const res = { locals: { zenroom_data: null } };
  t.is(getData(req, res), 42);
});

test("getHooks works correctly", async (t) => {
  let result = 2;
  const promiseGen = (p) => {
    return new Promise((resolve) => {
      result += 2;
      resolve();
    });
  };
  const res = {
    locals: { hookname: [promiseGen] },
  };

  await getHooks("hookname", res, 2);
  t.deepEqual(result, 4);
});

test("hook populate should correctly work", (t) => {
  const res = { locals: [] };
  const hookNames = [
    "onSuccess",
    "onInit",
    "onBefore",
    "onAfter",
    "onSuccess",
    "onError",
    "onException",
    "onFinish",
  ];
  for (const h of hookNames) {
    t.is(res.locals[h], undefined);
  }

  const {
    onInit,
    onBefore,
    onAfter,
    onSuccess,
    onError,
    onException,
    onFinish,
  } = initHooks();
  t.is(typeof onInit, "function");
  t.is(typeof onBefore, "function");
  t.is(typeof onAfter, "function");
  t.is(typeof onSuccess, "function");
  t.is(typeof onError, "function");
  t.is(typeof onException, "function");
  t.is(typeof onFinish, "function");

  for (const h of hookNames) {
    eval(`${h}(res, () => "${h}")`);
    t.is(res.locals[h][0](), h);
  }

  // onInit(1);
  // onBefore(2);
  // onAfter(3);
  // onSuccess(4);
  // onError(5);
  // onException(6);
  // onFinish(7);
  // let i = 0;
  // for (const h of hookNames) {
  //   t.is(res.locals[h], ++i);
  // }
});
