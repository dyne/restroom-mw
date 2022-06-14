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


test.serial("Middlware should read data under multiple keys", async (t) => {
  const { app, c } = t.context;
  c.set("pattern:123aaa456", `{"data": "first"}`)
  c.set("pattern:987aab321", `{"data": "second"}`)
  c.set("pattern:987aaa321", `{"data": "third"}`)
  const res = await app.post("/pattern");
  t.is(res.status, 200, res.text);
  t.is(typeof res.body.my_data, "object")
  t.is(res.body.my_data.length, 2)
  t.is(typeof res.body.my_data[0], 'object')
  t.is(typeof res.body.my_data[1], 'object')
});

test.serial("Middlware store object named", async (t) => {
  const { app, c } = t.context;
  const res = await app.post("/store_object_named");
  t.is(res.status, 200, res.text);
  const saved = JSON.parse(await c.get('store-named:greeting'))
  const saved2 = JSON.parse(await c.get('store-named:hex'))
  t.true(Object.keys(saved).includes('it'))
  t.true(Object.keys(saved).includes('en'))
  t.is(typeof saved2, 'string')
});
test.serial("Middlware store object named that doesn't exist", async (t) => {
  const { app, c } = t.context;
  const res = await app.post("/store_object_not_defined");
  t.is(res.status, 500, res.text);
  t.true(res.body.exception.includes("data not defined"))
});
test.serial("Middlware inits a counter and increments it", async (t) => {
  const { app, c } = t.context;
  const res = await app.post("/initialize");
  t.is(res.status, 200, res.text);
  const res1 = await app.post("/increment")
    .send({keys: {}, data: {key: "atomic-counter"}});
  t.is(res1.status, 200, res1.text);
  t.is(typeof res1.body.incremented, 'number');
  t.is(res1.body.incremented, 42);
  t.is(res1.body.succ, 43);
  const res2 = await app.post("/increment")
    .send({keys: {}, data: {key: "atomic-counter"}});
  t.is(res2.status, 200, res2.text);
  t.is(typeof res2.body.incremented, 'number');
  t.is(res2.body.incremented, 44);
  t.is(res2.body.succ, 45);
});
test.serial("Middlware increments not a number", async (t) => {
  const { app, c } = t.context;
  c.set('test:not-number', 'casa')
  const res = await app.post("/increment")
    .send({keys: {}, data: {key: "test:not-number"}});
  t.is(res.status, 500, res.text);
  t.true(res.body.exception.includes("not an integer"))
});
test.serial("Middlware remove key from redis", async (t) => {
  const { app, c } = t.context;
  c.set('pippo', 'pippo value')
  c.set('mimmo', 'mimmo value')
  const res = await app.post("/delete-key");
  t.is(res.status, 200, res.text);
  t.is(await c.get('pippo'), null);
  t.is(await c.get('mimmo'), null);
});
