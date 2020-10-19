import test from "ava";
import request from "supertest";
import express from "express";
import bodyParser from "body-parser";

process.env.ZENCODE_DIR = "./test/not_existent";
const zencode = require("../dist").default;

test("getMessages show custom message", async (t) => {
  const app = express();
  app.use(bodyParser.json());
  app.use("/*", zencode);

  const res = await request(app).post("/non-existent-endpoint");
  t.is(res.text, "<h2>404: This contract does not exists</h2>");
});
