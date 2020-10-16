import test from "ava";

process.env.ZENCODE_DIR = "./test/fixtures";

const { getKeys, getConf } = require("../src/utils");

test("getKeys works correctly", (t) => {
  const keys = getKeys("contract_keys");
  t.is(keys, "{}\n");
});

test("getConf works correctly", (t) => {
  const conf = getConf("contract_keys");
  t.is(conf, "CONF");
});
