import test from "ava";
import supertest from "supertest";
import express from "express";
import bodyParser from "body-parser";

process.env.ZENCODE_DIR = "./test/fixtures";
const sawroom = require("../dist");
const zencode = require("../../core");

test.before(async (t) => {
  const app = express();
  app.use(bodyParser.json());
  app.use(sawroom.default);
  app.use("/*", zencode.default);
  t.context.app = supertest(app);
});

test.serial("Middleware should read from sawtooth correctly", async (t) => {
  const { app } = t.context;
  const res = await app.post("/sawroom_read");
  t.is(res.status, 200, res.text);
  const result = res.body.sawroom[0].result;
  t.true(result.includes("keypair"));
  t.true(result.includes("public_key"));
  t.true(result.includes("private_key"));
});

test.serial("Middleware should execute on sawtooth correctly", async (t) => {
  const { app } = t.context;
  const res = await app.post("/sawroom_execute");
  t.is(res.status, 200, res.text);
  t.true(Array.isArray(res.body));
  t.is(typeof res.body[0].sawroom_link, "string");
  t.is(typeof res.body[0].batch_id, "string");
  t.is(res.body[0].batch_id.length, 128);
});

test.serial("getToken works correctly", async (t) => {
  const { app } = t.context;
  const res = await app.post("/sawroom_login");
  t.is(res.status, 200, res.text);
  t.is(res.body.token.length, 173);
});

test.serial("Setup the context id", async (t) => {
  const { app } = t.context;
  const res = await app.post("/sawroom_context_id");
  t.is(res.status, 200, res.text);
});

test.serial("Save data on sawroom works correctly", async (t) => {
  const { app } = t.context;
  const res = await app.post("/sawroom-save-data");
  t.is(res.status, 200, res.text);
  t.log(res.body);
  t.is(typeof res.body.sawroom_link, "string");
  t.is(typeof res.body.batch_id, "string");
  t.is(res.body.batch_id.length, 128);
});