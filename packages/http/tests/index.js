import test from "ava";
import request from "supertest";
import express from "express";
import bodyParser from "body-parser";

process.env.ZENCODE_DIR = "./test/fixtures";
const http = require("..").default;
const zencode = require("../../core").default;

test("Middleware db should exists", (t) => {
  t.truthy(typeof http, "object");
});

test("Check that the middleware works", async (t) => {
  const _data = {
    data: { api: "https://jsonplaceholder.typicode.com/todos/1" },
  };
  const app = express();
  app.use(bodyParser.json());
  app.use(http);
  app.use("/*", zencode);
  const res = await request(app).post("/http-test").send(_data);
  t.is(res.body.array.length, 5);
  t.is(res.status, 200);
});

test("Check that the middleware writes output correctly", async (t) => {
  const _data = {
    data: { endpoint: "https://apiroom.net/api/dyneorg/Create-a-keypair" },
  };
  const app = express();
  app.use(bodyParser.json());
  app.use(http);
  app.use("/*", zencode);
  const res = await request(app).post("/http-output").send(_data);
  t.is(typeof res.body.output.Alice.keypair, "object");
  "private_key public_key".split(" ").map((k) => {
    t.true(res.body.output.Alice.keypair.hasOwnProperty(k));
  });
  t.is(res.status, 200);
});
