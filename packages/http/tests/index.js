import test from "ava";
import request from "supertest";
import express from "express";
import bodyParser from "body-parser";
import fs from "fs";

process.env.ZENCODE_DIR = "./test/fixtures";
const http = require("..").default;
const zencode = require("../../core").default;

test("Middleware db should exists", (t) => {
  t.truthy(typeof http, "object");
});

test("Check that the middleware works", async (t) => {
  const _data = {
    data: { api: "https://jsonplaceholder.typicode.com/todos/1",}
  };
  const app = express();
  app.use(bodyParser.json());
  app.use(http);
  app.use("/*", zencode);
  const res = await request(app).post("/http-test").send(_data);
  t.is(res.body.array.length, 5);
  t.is(res.status, 200);
});

