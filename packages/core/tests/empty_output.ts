import bodyParser from "body-parser";
import express from "express";
import supertest, { SuperTest, Test } from "supertest";
import anyTest, { TestFn } from "ava";
import * as sinon from 'sinon';


const test = anyTest as TestFn<{ app: SuperTest<Test>, log: any }>;

process.env.ZENCODE_DIR = "./test/fixtures";
import core, { Restroom } from "../src/index";

test.before(async (t) => {
  const s = sinon.spy(console, 'log');
  const app = express();
  app.use(bodyParser.json());
  app.use((req, res, next) => {
    const rr = new Restroom(req, res);
    rr.onSuccess(async () => {
      t.log("success!");
      console.log("success!");
    })
    next();
  });
  app.use("/*", core);
  t.context = { app: supertest(app), log: s };
});

test.afterEach(t => {
  t.context.log.restore();
});

test.serial("OnSuccess is always executed on empty result", async (t) => {
  const { app, log } = t.context;
  const res = await app.post("/empty");
  t.true(log.calledOnce);
  t.true(log.calledWith("success!"));
  t.is(res.status, 200);
  t.deepEqual(res.body, []);
});
