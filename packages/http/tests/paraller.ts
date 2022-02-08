import bodyParser from "body-parser";
import express from "express";
import supertest, { SuperTest, Test } from "supertest";
import anyTest, { TestFn } from "ava";

const test = anyTest as TestFn<{ app: SuperTest<Test> }>;

process.env.ZENCODE_DIR = "./test/http";
const httpmw = require("../src/index");
const rr = require("@restroom-mw/core");

test.before(async (t) => {
  const app = express();
  app.use(bodyParser.json());
  app.use(httpmw.default);
  app.use("/*", rr.default);
  t.context = { app: supertest(app) };
});

test.serial("http executes parallel requests", async (t) => {
  const { app } = t.context;
  const res = await app.post("/parallel");
  t.is(res.status, 200);
  const result = res.body.timestamps;
  t.true(result.hasOwnProperty("one"));
  t.true(result.hasOwnProperty("two"));
  t.true(result.hasOwnProperty("three"));
  t.true(result.hasOwnProperty("four"));
  t.is(result.one, result.two);
  t.is(result.three, result.four);
  t.is(result.one, result.three);
});
