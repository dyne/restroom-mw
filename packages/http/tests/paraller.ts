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
  t.is(result.one.status, 200)
  t.is(result.two.status, 200)
  t.is(result.three.status, 200)
  t.is(result.four.status, 200)
  t.true(Math.abs(Number(result.one.result) - Number(result.two.result)) < 30);
  t.true(Math.abs(Number(result.three.result) - Number(result.four.result)) < 30);
  t.true(Math.abs(Number(result.one.result) - Number(result.three.result)) < 30);
});
