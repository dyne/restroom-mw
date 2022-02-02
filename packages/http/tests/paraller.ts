import bodyParser from "body-parser";
import express from "express";
import supertest, { SuperTest, Test } from "supertest";
import axios from "axios";
import anyTest, { TestFn } from "ava";

const test = anyTest as TestFn<{ app: SuperTest<Test> }>;

process.env.ZENCODE_DIR = "./test/http";
const httpmw = require("../src/index");
const rr = require("@restroom-mw/core");

test.before(async (t) => {
  const app = express();
  app.use(bodyParser.json());
  app.use(httpmw.default);
  app.use("/*", rr.default);
  t.context = { app: supertest(app) };
});

test.serial("http executes parallel requests", async (t) => {
  const { app } = t.context;
  const res = await app.post("/parallel");
  t.is(res.status, 200);
  const result = res.body;
  t.is(result.posts, {
    id: 101,
    title: "foo",
    body: "bar",
    userId: 1,
  });
  t.true(result.includes("posts"));
  t.true(result.includes("todo"));
  t.is(result.todo.userId, 1);
});
