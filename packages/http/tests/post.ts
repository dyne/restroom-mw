import bodyParser from "body-parser";
import express from "express";
import supertest, { SuperTest, Test } from "supertest";
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
  app.listen(3030, () => {
    t.log(`Server started on port 3030`);
  });
  t.context = { app: supertest(app) };
});

test.serial("http post to restroom endpoint correctly", async (t) => {
  const { app } = t.context;
  const res = await app.post("/post-restroom");
  t.is(res.status, 200, res.text);
  const expected = {
    Kenshiro: {
      baseUrl: "http://192.168.0.100:3030",
      ip: "192.168.0.100",
      public_key:
        "BGiQeHz55rNc/k/iy7wLzR1jNcq/MOy8IyS6NBZ0kY3Z4sExlyFXcILcdmWDJZp8FyrILOC6eukLkRNt7Q5tzWU=",
      timeServer: "http://localhost:3312",
      uid: "Kenshiro",
      version: "1",
    },
  };
  t.deepEqual(res.body.output, expected);
});
