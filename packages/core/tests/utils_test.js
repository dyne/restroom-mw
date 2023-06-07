import test from "ava";
import bodyParser from "body-parser";
import express from "express";
import request from "supertest";
import { getHooks, initHooks } from "../dist/hooks";

process.env.ZENCODE_DIR = "./test/fixtures";
const zencode = require("../dist").default;

const {
  getYml,
  getKeys,
  getFile,
  getConf,
  getData,
  getContracts,
  getContractByContractName,
  getContractFromPath,
  getMessage,
  getFuzzyContractMessage,
  getEndpointsMessage,
} = require("../dist/utils");

test("getKeys works correctly", (t) => {
  const keys = getKeys("contract_keys");
  t.is(keys, "{}");
  const fakeKeys = getKeys("non existend contract");
  t.is(fakeKeys, null);
});

test("getKeys works correctly also with yaml", (t) => {
  const keys = getKeys("contract_yaml_keys");
  t.is(
    keys,
    '{"pippo":2,"some":{"inner":3},"multiline":"hello\\n\\nworld\\n"}'
  );
});

test("getFile works correctly", (t) => {
  const keys = getFile("contract_keys.keys");
  t.is(keys, "{}\n");
  const fakeKeys = getFile("non existend keys file");
  t.is(fakeKeys, null);
});

test("getYml works correctly", (t) => {
  const yml = getYml("keypair-chain");
  t.is(
    yml,
    `zenchain: 1.0
name: correct-keypair
start: create-pbkdf.zen
blocks:
  create-pbkdf.zen:
    zenFile: create-pbkdf.zen
    next: create-keypair.zen
    keysFile: create-pbkdf-input.keys
  create-keypair.zen:
    zenFile: create-keypair.zen
    next: verify-keypair.zen
    confFile: create-keypair-configuration.conf
    keysFile: create-keypair-input.keys
  verify-keypair.zen:
    zenFile: verify-keypair.zen
    keysFile: verify-keypair-input.keys`
  );
  t.throws(() => {
    getYml("non existend zen file");
  });
});

test("getContractByContractName works correctly", (t) => {
  const zencode = getContractByContractName("broken");
  t.is(
    zencode.content,
    `Scenario 'ecdh': Encrypt a message with the password
Given that I have a 'string' named 'password'
Given that I have a 'string' named 'header'
Given that I have a 'string' named 'message'
When I encrypt the secret message 'message' with 'password'
Then print the 'secret message'
`
  );
  t.throws(() => {
    getContractByContractName("non existend zen file");
  });
});

test("getContractFromPath works correctly", (t) => {
  const zencode = getContractFromPath("broken.zen");
  t.is(
    zencode.content,
    `Scenario 'ecdh': Encrypt a message with the password
Given that I have a 'string' named 'password'
Given that I have a 'string' named 'header'
Given that I have a 'string' named 'message'
When I encrypt the secret message 'message' with 'password'
Then print the 'secret message'
`
  );
  t.throws(() => {
    getContractFromPath("non existend zen file");
  });
});

test("getConf works correctly", (t) => {
  const conf = getConf("contract_keys");
  t.is(conf, "CONF");
  const fakeConf = getConf("non existend contract");
  t.is(fakeConf, ``);
});

test("getContracts works correctly", async (t) => {
  const contracts = await getContracts("/");
  t.log(contracts);
  t.deepEqual(contracts, [
    "/a_test_data",
    "/broken",
    "/contract_keys",
    "/contract_yaml_keys",
    "/create-keypair",
    "/create-pbkdf",
    "/database",
    "/database_table",
    "/empty",
    "/ethereum_balance",
    "/ethereum_balance_array",
    "/ethereum_blocks",
    "/ethereum_erc20",
    "/ethereum_read_token_id",
    "/ethereum_retrieve",
    "/ethereum_retrieve_no_exist",
    "/ethereum_store",
    "/execute_and_save",
    "/execute_with_data",
    "/fabric_init",
    "/fabric_missing_step",
    "/fabric_no_step",
    "/fabric_read_write",
    "/fabric_retrieve",
    "/fabric_store",
    "/files_ls",
    "/files_no_dest",
    "/files_no_url",
    "/files_read_file",
    "/files_save_result",
    "/files_url_do_not_exist",
    "/hash-test",
    "/http-output",
    "/http-test",
    "/influxdb_read",
    "/keygen",
    "/logger_append",
    "/planetmint_retrieve",
    "/planetmint_retrieve_no_exist",
    "/planetmint_store_asset",
    "/planetmint_store_asset_amount",
    "/planetmint_store_asset_metadata",
    "/planetmint_transfer",
    "/planetmint_transfer_token",
    "/planetmint_transfer_token2",
    "/random",
    "/sawroom-read-secret-message-foreach",
    "/sawroom-read-secret-message",
    "/sawroom-save-data",
    "/sawroom-store-secret-message-foreach",
    "/sawroom-store-secret-message",
    "/sawroom_ask_balance",
    "/sawroom_context_id",
    "/sawroom_deposit",
    "/sawroom_execute",
    "/sawroom_login",
    "/sawroom_object",
    "/sawroom_random",
    "/sawroom_read",
    "/sawroom_retrieve",
    "/sawroom_store",
    "/sawroom_store_output",
    "/single-random-foreach",
    "/single-random",
    "/unzip_directory",
    "/verify-keypair",
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
  const req = { method: "POST", body: { data: 42 } };
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
