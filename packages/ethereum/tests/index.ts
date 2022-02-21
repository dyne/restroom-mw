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
  t.is(typeof res.body.myTag, "string");
  t.is(res.body.myTag.length, 64);
  t.is(typeof res.body.anotherTag, "string");
  t.is(res.body.anotherTag.length, 64);
});

test("Retrieve a zenroom object", async (t) => {
  const { app } = t.context;
  var res = await app.post("/ethereum_retrieve");
  t.is(res.status, 200, res.text);
  t.is(res.body.myHash, "wIJBPxYwsawLFLdQl7uCj+maqMd/wGsT4h7NcyuI580=");
  t.is(res.body.anotherHash, "IBlr1RYYtjWc7Nj8EGIUrCfJSHd+8OrVvN5pc6LylsI=");
});
