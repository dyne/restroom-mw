import test from "ava";
process.env.ZENCODE_DIR = "./test/fixtures";

const {
  addDataToContext,
  addKeysToContext,
  addNextToContext,
  addConfToContext,
  createGlobalContext,
  createDebugEnabledGlobalContext,
  updateGlobalContext,
  updateGlobalContextOutput,
} = require("../dist/context");

test("addConfToContext works correctly", (t) => {
  const ymlContent = { confFile: "not-exists" };

  const singleBlockContext = {
    data: { inputData: "iwillbechanged", otherStuff: "other" },
  };

  addConfToContext(singleBlockContext, ymlContent);
  t.deepEqual(singleBlockContext.conf, "");
});

test("addConfToContext works with a file", (t) => {
  const ymlContent = { confFile: "create-keypair-configuration.conf" };

  const singleBlockContext = {
    data: { inputData: "iwillbechanged", otherStuff: "other" },
  };

  addConfToContext(singleBlockContext, ymlContent);
  t.deepEqual(singleBlockContext.conf, "color=3");
});

test("addNextToContext works correctly", (t) => {
  const ymlContent = { next: "next-contract" };

  const singleBlockContext = {
    data: { inputData: "iwillbechanged", otherStuff: "other" },
  };

  addNextToContext(singleBlockContext, ymlContent);
  t.deepEqual(singleBlockContext.next, "next-contract");
});

test("addDataToContext works correctly", (t) => {
  const endpointData = { first_contract: { inputData: "override" } };

  const singleBlockContext = {
    data: { inputData: "iwillbechanged", otherStuff: "other" },
  };

  addDataToContext(singleBlockContext, endpointData["first_contract"]);
  t.deepEqual(singleBlockContext.data, {
    inputData: "override",
    otherStuff: "other",
  });
});

test("addKeysToContext works correctly", (t) => {
  const singleBlockContext = {
    keys: {
      userChallenges: "iwillbechanged",
      username: "iwillbechanged",
      key_derivation: "iwillbechanged",
    },
  };

  addKeysToContext(singleBlockContext, "create-keypair");
  t.not(singleBlockContext.keys, {
    userChallenges: "iwillbechanged",
    username: "iwillbechanged",
    key_derivation: "iwillbechanged",
  });
});

test("addKeysToContext works correctly if keys not found", (t) => {
  const singleBlockContext = {
    keys: {
      userChallenges: "iwillbechanged",
      username: "iwillbechanged",
      key_derivation: "iwillbechanged",
    },
  };

  addKeysToContext(singleBlockContext, "not-existing-dkeys");
  t.deepEqual(singleBlockContext.keys, {
    userChallenges: "iwillbechanged",
    username: "iwillbechanged",
    key_derivation: "iwillbechanged",
  });
});

test("createGlobalContext works correctly", (t) => {
  const globalContext = createGlobalContext();
  t.deepEqual(globalContext, {
    debugEnabled: false,
  });
});

test("createDebugEnabledGlobalContext works correctly", (t) => {
  const globalContext = createDebugEnabledGlobalContext();
  t.deepEqual(globalContext, {
    debugEnabled: true,
  });
});

test("updateGlobalContext works correctly with empty keys and data", (t) => {
  let globalContext = {
    debugEnabled: false,
  };
  const singleBlockContext = {
    currentBlock: "id-0",
  };

  updateGlobalContext(singleBlockContext, globalContext);
  t.deepEqual(globalContext, {
    debugEnabled: false,
    currentBlock: "id-0",
    "id-0": {
      data: undefined,
      keys: undefined,
    },
  });
});

test("updateGlobalContext works correctly with empty keys", (t) => {
  let globalContext = {
    debugEnabled: false,
  };
  const singleBlockContext = {
    currentBlock: "id-0",
    data: {
      pippo: "pippo",
    },
  };

  updateGlobalContext(singleBlockContext, globalContext);
  t.deepEqual(globalContext, {
    debugEnabled: false,
    currentBlock: "id-0",
    "id-0": {
      data: {
        pippo: "pippo",
      },
      keys: undefined,
    },
  });
});

test("updateGlobalContext works correctly with empty data", (t) => {
  let globalContext = {
    debugEnabled: false,
  };
  const singleBlockContext = {
    currentBlock: "id-0",
    keys: {
      pippo: "pippo",
    },
  };

  updateGlobalContext(singleBlockContext, globalContext);
  t.deepEqual(globalContext, {
    debugEnabled: false,
    currentBlock: "id-0",
    "id-0": {
      keys: {
        pippo: "pippo",
      },
      data: undefined,
    },
  });
});

test("updateGlobalContext works correctly with data and keys", (t) => {
  let globalContext = {
    debugEnabled: false,
  };
  const singleBlockContext = {
    currentBlock: "id-0",
    keys: {
      pippo: "pippo",
    },
    data: {
      pluto: "pluto",
    },
  };

  updateGlobalContext(singleBlockContext, globalContext);
  t.deepEqual(globalContext, {
    debugEnabled: false,
    currentBlock: "id-0",
    "id-0": {
      keys: {
        pippo: "pippo",
      },
      data: {
        pluto: "pluto",
      },
    },
  });
});

test("updateGlobalContextOutput works correctly with output", (t) => {
  let globalContext = {
    currentBlock: "id-0",
    debugEnabled: false,
    "id-0": {},
  };
  const singleBlockContext = {
    currentBlock: "id-0",
  };

  updateGlobalContextOutput("id-0", globalContext, { res: "true" });
  t.deepEqual(globalContext, {
    currentBlock: "id-0",
    debugEnabled: false,
    "id-0": {
      output: { res: "true" },
    },
  });
});
