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

test("Middleware should read from sawtooth correctly", async (t) => {
  const { app } = t.context;
  const res = await app.post("/sawroom_read");
  t.is(res.status, 200);
  const result = res.body.sawroom[0].result;
  t.true(result.includes("keypair"));
  t.true(result.includes("public_key"));
  t.true(result.includes("private_key"));
});

test("Middleware should execute on sawtooth correctly", async (t) => {
  const { app } = t.context;
  const res = await app.post("/sawroom_execute");
  t.is(res.status, 200);
  t.true(Array.isArray(res.body));
  t.is(typeof res.body[0].sawroom_link, "string");
  t.is(typeof res.body[0].batch_id, "string");
  t.is(res.body[0].batch_id.length, 128);
});
