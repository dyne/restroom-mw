import bodyParser from "body-parser";
import express from "express";
import supertest, { SuperTest, Test } from "supertest";
import anyTest, { TestFn } from "ava";
import sqlite3 from "sqlite3";

const test = anyTest as TestFn<{ app: SuperTest<Test> }>;

process.env.ZENCODE_DIR = "./test/db";
const db = require("../src/index").default;
const zencode = require("../../core/src/index").default;

test.before(async (t) => {
  const app = express();
  app.use(bodyParser.json());
  app.use(db);
  app.use("/*", zencode);
  t.context = { app: supertest(app) };
});

test("Db should execute raw queries", async (t) => {
  const { app } = t.context;
  const create_table = `CREATE TABLE
  IF NOT EXISTS member (
    name VARCHAR(255),
    date DATETIME DEFAULT CURRENT_TIMESTAMP
  );`;
  const db = new sqlite3.Database('./test/db/test.db', sqlite3.OPEN_URI | sqlite3.OPEN_SHAREDCACHE | sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
      console.log(`Error Occured - ${err.message}`);
    } else {
      console.log('DataBase Connected');
    }
  });
  db.run(create_table, (err) => {
    if (err) {
      console.log('Some Error Occured');
    } else {
      console.log('Table Created');
    }
  });

  const res = await app.post("/raw_query");
  t.is(res.status, 200, res.text);

  const results = Object.keys(res.body);
  t.deepEqual(results,
    ['result_1', 'result_2', 'result_3', 'result_4', 'result_5', 'result_6']);
  t.true(res.body.result_1.lastID > 1);
  t.true(res.body.result_2.lastID > 1);
  t.deepEqual(res.body.result_3, []);
  t.deepEqual(Object.keys(res.body.result_4[0]), ['date', 'name']);
  t.true(res.body.result_5.lastID > 1);
  t.true(res.body.result_6.lastID > 1);
});
