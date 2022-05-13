import anyTest, { TestFn } from "ava";
import bodyParser from "body-parser";
import express from "express";
import { createClient } from "redis";
import supertest, { SuperTest, Test } from "supertest";

const test = anyTest as TestFn<{ app: SuperTest<Test>, c: any }>;


process.env.ZENCODE_DIR = "./test/redis";
const redismw = require("../src/index");
const zencode = require("../../core/src/index");

test.before(async (t) => {
  const c = createClient();
  await c.connect();
  const app = express();
  app.use(bodyParser.json());
  app.use(redismw.default);
  app.use("/*", zencode.default);
  t.context = { app: supertest(app), c };
});

test.serial("Middleware should read non existent key from redis correctly", async (t) => {
  const { app, c } = t.context;
  const res = await app.post("/get_non_existent");
  t.is(res.status, 200, res.text);
  const result = res.body;
  const saved = await c.get("myHashkeyThatDoesNotExist");
  t.true(Object.keys(result).includes("redisResult"));
  t.deepEqual(JSON.parse(saved), {});
});

test.serial("Middleware should write on redis correctly with named param", async (t) => {
  const { app, c } = t.context;
  const res = await app.post("/set_named");
  t.is(res.status, 200, res.text);
  const result = res.body;
  t.truthy(result.random_object);
  const saved = await c.get("L1-eth-lastSavedBlock");
  t.is(saved, JSON.stringify(result));
});

test.serial("Middleware should read from redis correctly with named param", async (t) => {
  const { app, c } = t.context;
  const res = await app.post("/get_named");
  t.is(res.status, 200, res.text);
  const result = res.body;
  const saved = await c.get("L1-eth-lastSavedBlock");
  t.true(Object.keys(result).includes("redisResult"));
  t.true(Object.keys(result.redisResult).includes("random_object"));
  t.is(result.redisResult.random_object, JSON.parse(saved).random_object);
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


