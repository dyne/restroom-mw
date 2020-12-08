import test from "ava";
import request from "supertest";
import express from "express";
import { Sequelize } from "sequelize";
import bodyParser from "body-parser";
import fs from "fs";

process.env.ZENCODE_DIR = "./test/db";
const db = require("..").default;
const zencode = require("../../core").default;

const dbPath1 = "sqlite://./test/db/db1.db";
const dbPath2 = "sqlite://./test/db/db2.db";

test.afterEach((t) => {
  try {
    fs.unlinkSync("./test/db/db1.db");
  } catch {}
  try {
    fs.unlinkSync("./test/db/db2.db");
  } catch {}
});

test.beforeEach(async (t) => {
  const sequelize = new Sequelize(dbPath1);
  const Table = sequelize.define(
    "firstTable",
    {
      result: {
        type: Sequelize.STRING,
      },
    },
    {
      freezeTableName: true,
    }
  );
  await Table.sync();
  try {
    const results = Array(5).fill(JSON.stringify({ testkey: "test value" }));
    for (const result of results) {
      await Table.create({ result });
    }
  } catch (e) {
    throw e;
  }
  sequelize.close();
});

test.afterEach((t) => {
  try {
    fs.unlinkSync("./test/db/db1.db");
  } catch {}
  try {
    fs.unlinkSync("./test/db/db2.db");
  } catch {}
});

test("Middleware db should exist", (t) => {
  t.truthy(typeof db, "object");
});

test.serial(
  "Middleware db should work and response includes variable for db",
  async (t) => {
    try {
      const app = express();
      app.use(bodyParser.json());
      app.use(db);
      app.use("/*", zencode);
      const res = await request(app).post("/db-test-complex");
      t.is(res.status, 200, res.text);
      t.true(
        Object.keys(res.body).includes("keypair"),
        'could not find "keypair " in response'
      );
      t.true(
        Object.keys(res.body).includes("myZenroomStringDictionary"),
        'could not find "myZenroomStringDictionary" in response'
      );
    } catch (e) {
      throw e;
    }
  }
);

test.serial("Middleware db should save the result in db1", async (t) => {
  try {
    const app = express();
    app.use(bodyParser.json());
    app.use(db);
    app.use("/*", zencode);
    const res = await request(app)
      .post("/db-test-complex")
      .catch((e) => {
        throw e;
      });
    const sequelize1 = new Sequelize(dbPath1);
    const Result1 = sequelize1.define(
      "firstTable",
      {
        result: {
          type: Sequelize.STRING,
        },
      },
      {
        freezeTableName: true,
      }
    );
    await Result1.sync();
    let result;
    try {
      let query = await Result1.findByPk(6);
      query = query.get({ plain: true });
      result = JSON.parse(query["result"]);
    } catch (e) {
      result = null;
    }
    sequelize1.close();
    t.is(res.status, 200);
    t.deepEqual(
      res.body,
      result,
      "The value stored in the database should be the same as the value in the response body"
    );
  } catch (e) {
    throw e;
  }
});

test.serial(
  "Middleware db should save the result of variable given in zencode to db2",
  async (t) => {
    try {
      const app = express();
      app.use(bodyParser.json());
      app.use(db);
      app.use("/*", zencode);
      const res = await request(app)
        .post("/db-test-complex")
        .catch((e) => {
          throw e;
        });
      const sequelize2 = new Sequelize(dbPath2);
      const Result2 = sequelize2.define(
        "firstCache",
        {
          result: {
            type: Sequelize.STRING,
          },
        },
        {
          freezeTableName: true,
        }
      );
      await Result2.sync();
      let result;
      try {
        let query = await Result2.findByPk(1);
        query = query.get({ plain: true });
        result = JSON.parse(query["result"]);
      } catch (e) {
        result = null;
      }
      sequelize2.close();
      t.is(res.status, 200);
      t.deepEqual(
        res.body.keypair,
        result.keypair,
        "The value stored in the database should be the same as the value in the response body"
      );
    } catch (e) {
      throw e;
    }
  }
);
