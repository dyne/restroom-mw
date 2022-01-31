import test from "ava";
import bodyParser from "body-parser";
import express from "express";
import supertest from "supertest";

process.env.ZENCODE_DIR = "./test/redis";
const redismw = require("../dist");
const zencode = require("../../core");

test.before(async (t) => {
  const app = express();
  app.use(bodyParser.json());
  app.use(redismw.default);
  app.use("/*", zencode.default);
  t.context.app = supertest(app);
});

test.serial("Middleware should write on redis correctly", async (t) => {
  const { app } = t.context;
  const res = await app.post("/set");
  t.is(res.status, 200, res.text);
  const result = res.body;
  t.truthy(result.random_object);
});

test.serial("Middleware should read from redis correctly", async (t) => {
  const { app } = t.context;
  const res = await app.post("/get");
  t.is(res.status, 200, res.text);
  const result = res.body;
  t.true(Object.keys(result).includes("redisResult"));
  t.true(Object.keys(JSON.parse(result.redisResult)).includes("random_object"));
});
