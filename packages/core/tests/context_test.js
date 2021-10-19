import test from "ava"
process.env.ZENCODE_DIR = "./test/fixtures";

const {
  iterateAndEvaluateExpressions,
  updateContext,
  addDataToContext,
  addKeysToContext,
  updateContextUsingYamlFields
} = require("../dist/context");

test("iterateAndEvaluateExpressions works correctly", (t) => {

  const singleBlockObject = { result: 'context.get("something").output'};
  const context = new Map;
  context.set("something", {output: "myoutput"});

  iterateAndEvaluateExpressions(singleBlockObject, context);
  t.is(singleBlockObject.result, context.get('something').output);
});

test("iterateAndEvaluateExpressions throws exception", (t) => {

  const error = t.throws(() => {
    const singleBlockObject = { result: 'context.get("something").output'};
    const context = new Map;
    context.set("somethin", {output: "myoutput"});

    iterateAndEvaluateExpressions(singleBlockObject, context);
  });

  t.is(error.message, 'Cannot read property \'output\' of undefined')
});


test("updateContext works correctly", (t) => {

  const singleBlockContext = new Map;
  singleBlockContext.set({output: "myoutput"});

  const globalContext = new Map;
  const blockName = "blockName";

  updateContext(singleBlockContext, globalContext, blockName);
  t.is(globalContext.get('blockName'), singleBlockContext);
});

test("updateContext works correctly with more than one contract", (t) => {

  const globalContext = new Map;
  const firstSingleBlockContext = new Map;
  firstSingleBlockContext.set({output: "myoutput"});
  
  const firstBlockName = "firstBlockName";

  updateContext(firstSingleBlockContext, globalContext, firstBlockName);

  const secondSingleBlockContext = new Map;
  secondSingleBlockContext.set({output: "output", next:"next"});
  
  const secondBlockName = "secondBlockName";

  updateContext(secondSingleBlockContext, globalContext, secondBlockName);

  t.is(globalContext.get('firstBlockName'), firstSingleBlockContext);
  t.is(globalContext.get('secondBlockName'), secondSingleBlockContext);
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

test("updateContextUsingYamlFields works correctly", (t) => {

  const singleBlockContext = {keys: {"changeme":"iwillbechanged"}, data: {}};
  const ymlContent = {
    zenchain: "1.0",
    name: "sample",
    blocks: {
      "first-contract":{
        type: "input",
        data:{
          userData:"pippo"
        },
        next:"second-contract"
      },
      "second-contract":{
        type: "zenroom-contract",
        keys: {
          changeme: "context.get('first-contract').data.userData"
        }
      }
    }
  }
  const globalContext = new Map;

  updateContextUsingYamlFields(singleBlockContext, "first-contract", ymlContent, globalContext);
  updateContextUsingYamlFields(singleBlockContext, "second-contract", ymlContent, globalContext);
  t.deepEqual(singleBlockContext.keys, {"changeme":"context.get(\'first-contract\').data.userData"});
});
/*
test("getContracts works correctly", async (t) => {
  const contracts = await getContracts("/");
  t.log(contracts);
  t.deepEqual(contracts, [
    '/broken.chain',
    '/broken',
    '/contract_keys',
    '/create-keypair',
    '/create-pbkdf',
    '/database',
    '/database_table',
    '/execute_and_save',
    '/execute_with_data',
    '/http-output',
    '/http-test',
    '/keygen',
    '/random',
    '/sawroom-read-secret-message',
    '/sawroom-save-data',
    '/sawroom-store-secret-message',
    '/sawroom_ask_balance',
    '/sawroom_context_id',
    '/sawroom_deposit',
    '/sawroom_execute',
    '/sawroom_login',
    '/sawroom_object',
    '/sawroom_random',
    '/sawroom_read',
    '/sawroom_retrieve',
    '/sawroom_store',
    '/sawroom_store_output',
    '/single-random',
    '/verify-keypair',
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
*/
