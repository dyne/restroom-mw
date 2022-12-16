import anyTest, { TestFn } from "ava";
import bodyParser from "body-parser";
import express from "express";
import { createClient } from "redis";
import supertest, { SuperTest, Test } from "supertest";
import os from 'os'
import path from 'path'
import fs from 'fs'

const test = anyTest as TestFn<{ app: SuperTest<Test> }>;

const DIR = path.join(os.tmpdir(), "restroom-test")

process.env.FILES_DIR = DIR;
process.env.ZENCODE_DIR = "./test/git";

const gitmw = require("../src/index");
const files = require("../../files/src/index");
const zencode = require("../../core/src/index");

test.before(async (t) => {
  const app = express();
  app.use(bodyParser.json());
  app.use(files.default);
  app.use(gitmw.default);
  app.use("/*", zencode.default);
  t.context = { app: supertest(app) };
  if(fs.existsSync(DIR)) {
    fs.rmSync(DIR, { recursive: true, force: true });
    fs.mkdirSync(DIR)
  }
});

test.serial("It is not a git repo", async (t) => {
  const { app } = t.context;
  const res = await app.post("/verify_path")
  t.is(res.status, 500, res.text);
  t.true(res.body.exception.includes("not a git repository"))
});

test.serial("Clone a git repository", async (t) => {
  const { app } = t.context;
  const res = await app.post("/clone_repo")
  t.is(res.status, 200, res.text);
});

test.serial("Add a file that don't exist", async (t) => {
  const { app } = t.context;
  const res = await app.post("/add_file_not_exist")
  t.is(res.status, 500, res.text);
  t.true(res.body.exception.includes("Could not find"))
});

test.serial("Commit passing wrong argument", async (t) => {
  const { app } = t.context;
  const res = await app.post("/wrong_argument")
  t.is(res.status, 500, res.text);
  t.true(res.body.exception.includes("No name was provided for"))
});
