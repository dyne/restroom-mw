import test from "ava";
import request from "supertest";
import express from "express";
import bodyParser from "body-parser";
import fs from 'fs';
import supertest, { SuperTest, Test } from "supertest";

process.env.ZENCODE_DIR = "./test/fixtures";
const zencode = require("../../core");
const files = require("../src/index");

test.before(async (t) => {
  const app = express();
  app.use(bodyParser.json());
  app.use(files.default);
  app.use("/*", zencode.default);
  t.context.app = supertest(app);
});

test("Download zip and extract", async (t) => {
  const { app } = t.context;
  var res = await app.post("/unzip_directory");
  t.is(res.status, 200, res.text);
  const files = fs.readdirSync('/tmp/extract/here/the/directory');
  t.is(files.length, 3);
});
