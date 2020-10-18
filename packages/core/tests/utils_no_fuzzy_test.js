import test from "ava";
import request from "supertest";
import express from "express";
import bodyParser from "body-parser";

process.env.ZENCODE_DIR = "./test/fixtures";
process.env.CUSTOM_404_MESSAGE = "NOT FOUND";
const zencode = require("../dist").default;

test("getMessages show custom message", async (t) => {
  const app = express();
  app.use(bodyParser.json());
  app.use("/*", zencode);

  const res = await request(app).post("/non-existent-endpoint");
  t.is(res.text, "NOT FOUND");
});
