import anyTest, { TestFn } from "ava";
import bodyParser from "body-parser";
import express from "express";
import supertest, { SuperTest, Test } from "supertest";

const test = anyTest as TestFn<{ app: SuperTest<Test>}>;

process.env.ZENCODE_DIR = "./test/fixtures";
const zencode = require("../../core/src/index");
const influx = require("../src/index");

test.before(async (t) => {
  const app = express();
  app.use(bodyParser.json());
  app.use(influx.default);
  app.use("/*", zencode.default);
  t.context = { app: supertest(app) };
});

test.serial("Middleware should perform a query to influxDB", async (t) => {
  const { app } = t.context;
  const res = await app.post("/influxdb_read");
  const result = res.body;
  t.is(res.status, 200, res.text);
  t.true(Object.keys(result).includes("result"));
  t.true(Object.keys(result.result[0]).includes("_field"));
  t.true(Object.keys(result.result[0]).includes("_measurement"));
  t.true(Object.keys(result.result[0]).includes("_start"));
  t.true(Object.keys(result.result[0]).includes("_stop"));
  t.true(Object.keys(result.result[0]).includes("_value"));
  t.true(Object.keys(result.result[0]).includes("result"));
  t.true(Object.keys(result.result[0]).includes("sensor_id"));
  t.true(Object.keys(result.result[0]).includes("table"));
  t.is(result.result[0]._value, 0.476194);
});


test.serial("Middleware should perform an array of query to influxDB", async (t) => {
  const { app } = t.context;
  const res = await app.post("/influxdb_read_array");
  const result = res.body;
  t.is(res.status, 200, res.text);
  t.true(Object.keys(result).includes("result"));
  t.is(result.result.length, 8)
  for( let r of result.result ) {
    t.true(Object.keys(r).includes("_field"));
    t.true(Object.keys(r).includes("_measurement"));
    t.true(Object.keys(r).includes("_start"));
    t.true(Object.keys(r).includes("_stop"));
    t.true(Object.keys(r).includes("_value"));
    t.true(Object.keys(r).includes("result"));
    t.true(Object.keys(r).includes("sensor_id"));
    t.true(Object.keys(r).includes("table"));
  };
});

