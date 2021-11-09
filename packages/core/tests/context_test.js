import test from "ava"
process.env.ZENCODE_DIR = "./test/fixtures";

const {
  addDataToContext,
  addKeysToContext,
  addNextToContext,
  addConfToContext,
} = require("../dist/context");

test("addConfToContext works correctly", (t) => {

  const ymlContent =  {"confKeys": 'not-exists'};

  const singleBlockContext = {data: {"inputData":"iwillbechanged", "otherStuff": "other"}};

  addConfToContext(singleBlockContext, ymlContent);
  t.deepEqual(singleBlockContext.conf, "color=0");
});

test("addNextToContext works correctly", (t) => {

  const ymlContent =  {"next": 'next-contract'};

  const singleBlockContext = {data: {"inputData":"iwillbechanged", "otherStuff": "other"}};

  addNextToContext(singleBlockContext, ymlContent);
  t.deepEqual(singleBlockContext.next, 'next-contract');
});

test("addDataToContext works correctly", (t) => {

  const endpointData =  {"first_contract": {"inputData":"override"}};

  const singleBlockContext = {data: {"inputData":"iwillbechanged", "otherStuff": "other"}};

  addDataToContext(singleBlockContext, endpointData["first_contract"]);
  t.deepEqual(singleBlockContext.data, {"inputData":"override", "otherStuff": "other"});
});

test("addKeysToContext works correctly", (t) => {

  const singleBlockContext = {keys: {"userChallenges":"iwillbechanged", "username": "iwillbechanged", "key_derivation": "iwillbechanged" }};

  addKeysToContext(singleBlockContext, "create-keypair");
  t.not(singleBlockContext.keys, {"userChallenges":"iwillbechanged", "username": "iwillbechanged", "key_derivation": "iwillbechanged" });
});

test("addKeysToContext works correctly if .dkeys not found", (t) => {

  const singleBlockContext = {keys: {"userChallenges":"iwillbechanged", "username": "iwillbechanged", "key_derivation": "iwillbechanged" }};

  addKeysToContext(singleBlockContext, "not-existing-dkeys");
  t.deepEqual(singleBlockContext.keys, {"userChallenges":"iwillbechanged", "username": "iwillbechanged", "key_derivation": "iwillbechanged" });
});
