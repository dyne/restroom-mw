import test from "ava";
import bodyParser from "body-parser";
import express from "express";
import supertest from "supertest";
import axios from "axios";
import retry from "async-retry";


process.env.ZENCODE_DIR = "./test/fixtures";
const fabric = require("../dist");
const zencode = require("../../core");

test.before(async (t) => {
  const app = express();
  app.use(bodyParser.json());
  app.use(fabric.default);
  app.use("/*", zencode.default);
  t.context.app = supertest(app);
});


test.serial("Missing step", async (t) => {
  const { app } = t.context;
  var res = await app.post("/fabric_missing_step");
  t.is(res.status, 500, res.text);
  t.is(typeof res.body.exception, 'string');
  t.is(res.body.exception.includes("One step is missing"), true);
});

test.serial("Init ledger", async (t) => {
  const { app } = t.context;
  var res = await app.post("/fabric_init");
  t.is(res.status, 200, res.text);
  t.is(res.body.exception, undefined);
  t.is(res.body.length, 0);
});

test.serial("Read data and change it", async (t) => {
  const { app } = t.context;
  var res = await app.post("/fabric_read_write");
  t.is(res.status, 200, res.text);
  t.is(res.body.hash,"waS8LuZEWge+Y7k+zsG3cd58iw/o+vNKGS52U+fxeP0=")
});

test.serial("Read data (again)", async (t) => {
  const { app } = t.context;
  var res = await app.post("/fabric_read_write");
  t.is(res.status, 200, res.text);
  t.is(res.body.hash,"PDHNX7wMa1zl8A9jBqSsEtMqxpPNVZqoEpTl28+odfg=")
});
