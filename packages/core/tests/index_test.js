import test from "ava";
import request from "supertest";
import express from "express";
process.env.ZENCODE_DIR = "./test/fixtures";
const core = require("../../core").default;

test("Check that the middleware handle wrong identation in yaml", async (t) => {
  const app = express();
  app.use("/api/*", core);
  const res = await request(app).post("/api/bad-identation-chain.chain");

  t.true(
    Object.keys(res.body).includes("exception"),
    "CHAIN YML EXECUTION ERROR"
  );
  t.is(res.status, 500);
});
