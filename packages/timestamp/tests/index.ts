import bodyParser from "body-parser";
import express from "express";
import supertest, { SuperTest, Test } from "supertest";
import anyTest, { TestFn } from "ava";

const test = anyTest as TestFn<{ app: SuperTest<Test> }>;

process.env.ZENCODE_DIR = "./test/timestamp";
const timestampmw = require("../src/index");
const zencode = require("../../core/src/index");

test.before(async (t) => {
  const app = express();
  app.use(bodyParser.json());
  app.use(timestampmw.default);
  app.use("/*", zencode.default);
  t.context = { app: supertest(app) };
});

test.serial("Middleware should write on timestamp correctly", async (t) => {
  const { app } = t.context;
  const res = await app.post("/ts");
  t.is(res.status, 200, res.text);
  const result = res.body;
  t.is("date", JSON.stringify(result));
});
