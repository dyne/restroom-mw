import anyTest, { TestFn } from "ava";
import bodyParser from "body-parser";
import express from "express";
import fs from 'fs';
import supertest, { SuperTest, Test } from "supertest";
import os from 'os';
import path from 'path';
process.env.LOGGER_DIR = ".";
process.env.ZENCODE_DIR = "./test/fixtures";
process.env.FILES_DIR = ".";
process.env.USE_HTTP = "y";
process.env.USE_LOGGER = "y";
const zencode = require("../../core/src/index");
const test = anyTest as TestFn<{ app: SuperTest<Test> }>;

test.before(async (t) => {
  const app = express();
  app.use(bodyParser.json());
  await zencode.addMiddlewares("", app);
  t.context = { app: supertest(app) };
});

test("Log to file", async (t) => {
  const { app } = t.context;
  if(fs.existsSync('testlog')) {
    fs.unlinkSync('testlog');
  }
  fs.writeFileSync('testlog', '');
  const res = await app.post("/logger_append").send(
    {keys: {}, data: { path: "testlog" }}
  );
  t.is(res.status, 200, res.text);
  let count = 0;
  const dati = fs.readFileSync('testlog').toString();
  for (const c of dati)
    if (c === '\n') count++;
  t.is(count, 4)
});

