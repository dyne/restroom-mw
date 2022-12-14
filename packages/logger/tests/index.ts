import anyTest, { TestFn } from "ava";
import bodyParser from "body-parser";
import express from "express";
import fs from 'fs';
import supertest, { SuperTest, Test } from "supertest";
import os from 'os';
import path from 'path';
const test = anyTest as TestFn<{ app: SuperTest<Test> }>;

process.env.ZENCODE_DIR = "./test/fixtures";
process.env.LOGGER_DIR = ".";
const logger = require("../src/index");
const zencode = require("../../core/src/index");

test.before(async (t) => {
  const app = express();
  app.use(bodyParser.json());
  app.use(logger.default);
  app.use("/*", zencode.default);
  t.context = { app: supertest(app) };
});

test("Log to file", async (t) => {
  const { app } = t.context;
  if(fs.existsSync('testlog')) {
    fs.unlinkSync('testlog');
  }
  const res = await app.post("/logger_append").send(
    {keys: {}, data: { path: "testlog" }}
  );
  t.is(res.status, 200, res.text);
  let count = 0;
  fs.createReadStream('testlog')
    .on('data', (chunk) => {
      for (const c of chunk)
        if (c === '\n') count++;
    })
    .on('end', () =>
      t.is(count, 4)
    );
});

