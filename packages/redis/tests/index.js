import test from "ava";
import bodyParser from "body-parser";
import express from "express";
import supertest from "supertest";
import { createClient } from "redis";

process.env.ZENCODE_DIR = "./test/redis";
const redismw = require("../dist");
const zencode = require("../../core");

test.before(async (t) => {
  const c = createClient();
  await c.connect();
  const app = express();
  app.use(bodyParser.json());
  app.use(redismw.default);
  app.use("/*", zencode.default);
  t.context.app = supertest(app);
  t.context.c = c;
});

test.serial("Middleware should write on redis correctly", async (t) => {
  const { app, c } = t.context;
  const res = await app.post("/set");
  t.is(res.status, 200, res.text);
  const result = res.body;
  t.truthy(result.random_object);
  const saved = await c.get("myHashkey");
  t.is(saved, JSON.stringify(result));
});

test.serial("Middleware should read from redis correctly", async (t) => {
  const { app, c } = t.context;
  const res = await app.post("/get");
  t.is(res.status, 200, res.text);
  const result = res.body;
  const saved = await c.get("myHashkey");
  t.true(Object.keys(result).includes("redisResult"));
  t.true(Object.keys(result.redisResult).includes("random_object"));
  t.is(result.redisResult.random_object, JSON.parse(saved).random_object);
});
