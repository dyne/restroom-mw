import test from "ava";
import request from "supertest";
import express from "express";
process.env.ZENCODE_DIR = "./test/fixtures";
const core = require("../../core").default;

test("Check that the middleware handle wrong identation in yaml", async (t) => {
  const app = express();
  app.use("/api/*", core);
  const res = await request(app).post("/api/bad-identation-chain.chain");

  t.true(res.body.exception.includes("bad indentation of a mapping entry"));
  t.is(res.status, 500);
});

test("Check that the middleware handle missing start in yaml", async (t) => {
  const app = express();
  app.use("/api/*", core);
  const res = await request(app).post("/api/missing-start.chain");

  t.true(res.body.exception.includes("Yml is incomplete. Start (start:) first level definition is missing!"));
  t.is(res.status, 500);
});

test("Check that the middleware detects a loop in yaml", async (t) => {
  const app = express();
  app.use("/api/*", core);
  const res = await request(app).post("/api/detect-loop.chain");

  t.true(res.body.exception.includes("Loop detected. Execution is aborted"));
  t.is(res.status, 500);
});
