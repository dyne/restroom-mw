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

  const singleBlockObject = { result: 'contract.get("something").output'};
  const context = new Map;
  context.set("something", {output: "myoutput"});

  iterateAndEvaluateExpressions(singleBlockObject, context);
  t.is(singleBlockObject.result, contract.get('something').output);
});

test("iterateAndEvaluateExpressions throws exception", (t) => {

  const error = t.throws(() => {
    const singleBlockObject = { result: 'contract.get("something").output'};
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
  t.is(globalcontract.get('blockName'), singleBlockContext);
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

  t.is(globalcontract.get('firstBlockName'), firstSingleBlockContext);
  t.is(globalcontract.get('secondBlockName'), secondSingleBlockContext);
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
        type: "zencode",
        keys: {
          changeme: "contract.get('first-contract').data.userData"
        }
      }
    }
  };
  const globalContext = new Map();

  updateContextUsingYamlFields(singleBlockContext, "first-contract", ymlContent, globalContext);
  updateContextUsingYamlFields(singleBlockContext, "second-contract", ymlContent, globalContext);
  t.deepEqual(singleBlockContext.keys, {"changeme":"contract.get(\'first-contract\').data.userData"});
});
