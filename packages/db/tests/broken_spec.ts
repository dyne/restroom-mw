import bodyParser from "body-parser";
import express from "express";
import supertest, { SuperTest, Test } from "supertest";
import anyTest, { TestFn } from "ava";

const test = anyTest as TestFn<{ app: SuperTest<Test> }>;

process.env.ZENCODE_DIR = "./test/db";
const db = require("../src/index").default;
const zencode = require("../../core/src/index").default;

test.before(async (t) => {
  const app = express();
  app.use(bodyParser.json());
  app.use(db);
  app.use("/*", zencode);
  t.context = { app: supertest(app) };
});

test("Db should broke on missing uri", async (t) => {
  const { app } = t.context;
  const error_message = `Error: "myDb1" has not been defined in zencode, please define it with`;
  const res = await app.post("/db-broken-no-uri");
  t.is(res.status, 500);
  t.true(JSON.parse(res.text).exception.includes(error_message));
});
