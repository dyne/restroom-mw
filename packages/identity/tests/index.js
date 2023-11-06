import test from "ava";
import request from "supertest";
import express from "express";
import bodyParser from "body-parser";

process.env.ZENCODE_DIR = "./test/identity";
const identity = require("..").default;
const zencode = require("../../core").default;

test("Resolve did",
  async (t) => {
    const app = express();
    app.use(bodyParser.json());
    app.use(identity);
    app.use("/*", zencode);
    const res = await request(app).post("/resolve-did");
    t.true(
      Object.keys(res.body).includes("myOutput"),
      'could not find "myOutput " in response'
    );
    let output = res.body.myOutput;
    t.true(
      Object.keys(output).includes("didDocument"),
      'could not find "didDocument" in myOutput'
    );
    t.true(
      Object.keys(output).includes("didDocumentMetadata"),
      'could not find "didDocumentMetadata" in myOutput'
    );
    t.true(
      Object.keys(output).includes("@context"),
      'could not find "@context" in myOutput'
    );
    t.true(
      Object.keys(res.body).includes("myOutput2"),
      'could not find "myOutput2 " in response'
    );
    output = res.body.myOutput2;
    t.true(
      Object.keys(output).includes("didDocument"),
      'could not find "didDocument" in myOutput2'
    );
    t.true(
      Object.keys(output).includes("didDocumentMetadata"),
      'could not find "didDocumentMetadata" in myOutput2'
    );
    t.true(
      Object.keys(output).includes("@context"),
      'could not find "@context" in myOutput2'
    );
    t.is(res.status, 200);
  });
