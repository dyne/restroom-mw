import test from "ava";
import request from "supertest";
import express from "express";
import bodyParser from "body-parser";

process.env.ZENCODE_DIR = "./test/fixtures";
const zencode = require("..").default;

test("Should correctly fail", async (t) => {
  const app = express();
  app.use(bodyParser.json());
  app.use("/*", zencode);
  const res = await request(app).post("/broken").send({ data: {} });
  t.is(res.status, 500);
});
