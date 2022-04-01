import test from "ava";
import request from "supertest";
import express from "express";
import bodyParser from "body-parser";
import fs from 'fs';
import supertest, { SuperTest, Test } from "supertest";

process.env.ZENCODE_DIR = "./test/fixtures";
process.env.FILES_DIR = ".";
const zencode = require("../../core");
const files = require("../src/index");

test.before(async (t) => {
  const app = express();
  app.use(bodyParser.json());
  app.use(files.default);
  app.use("/*", zencode.default);
  t.context.app = supertest(app);
});

test.serial("Download zip and extract", async (t) => {
  const { app } = t.context;
  var res = await app.post("/unzip_directory");
  t.is(res.status, 200, res.text);
  const files = fs.readdirSync('./tmp/extract/here/the/directory');
  t.is(files.length, 3);
});

test.serial("Do not specify url", async (t) => {
  const { app } = t.context;
  var res = await app.post("/files_no_url");
  t.is(res.status, 500, res.text);
});

test.serial("Do not specify destination", async (t) => {
  const { app } = t.context;
  var res = await app.post("/files_no_dest");
  t.is(res.status, 500, res.text);
});

test.serial("Url doesn't exist", async (t) => {
  const { app } = t.context;
  var res = await app.post("/files_url_do_not_exist");
  t.is(res.status, 500, res.text);
});

test.serial("Save result to file", async (t) => {
  const { app } = t.context;

  // Delete file if it already exist (this way I know if the next step creates it again)
  if(fs.statSync("./tmp/saveresult/myBeautifulFile.json", { throwIfNoEntry: false })) {
    fs.unlinkSync("./tmp/saveresult/myBeautifulFile.json");
  }
  var res = await app.post("/files_save_result");
  t.is(res.status, 200, res.text);
  t.is(typeof fs.statSync("./tmp/saveresult/myBeautifulFile.json", { throwIfNoEntry: false }), 'object')

  // Save again and overwrite
  var res = await app.post("/files_save_result");
  t.is(res.status, 200, res.text);
  t.is(typeof fs.statSync("./tmp/saveresult/myBeautifulFile.json", { throwIfNoEntry: false }), 'object')
});

