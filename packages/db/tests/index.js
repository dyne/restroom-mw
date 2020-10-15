import test from "ava";
import request from "supertest";
import express from "express";
import bodyParser from "body-parser";

process.env.ZENCODE_DIR = "./test/fixtures";
const db = require("..").default;
const zencode = require("../../core").default;

test("Middleware db should exists", (t) => {
  t.truthy(typeof db, "object");
});

test("Middleware db should correctly work and save data", async (t) => {
  const app = express();
  app.use(bodyParser.json());
  app.use(db);
  app.use("/*", zencode);

  const res = await request(app)
    .post("/database")
    .send({ data: { sqlite: "sqlite://./database.test" } });

  t.is(res.status, 200);
  t.true(Array.isArray(res.body.array));
  t.is(res.body.array.length, 5);
});
