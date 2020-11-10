import test from "ava";
import request from "supertest";
import express from "express";
import { QueryTypes, Sequelize } from "sequelize";
import bodyParser from "body-parser";
import fs from "fs";

process.env.ZENCODE_DIR = "./test/fixtures";
const db = require("..").default;
const zencode = require("../../core").default;

test("Middleware db should exists", (t) => {
  t.truthy(typeof db, "object");
});

test("Middleware db should correctly work and save data", async (t) => {
  try {
    const app = express();
    app.use(bodyParser.json());
    app.use(db);
    app.use("/*", zencode);
    const data = { data: { sqlite: "sqlite://./test/database.test" } };
    const res = await request(app)
      .post("/database")
      .send(data)
      .catch((e) => {
        throw e;
      });

    t.is(res.status, 200);
    t.true(Array.isArray(res.body.array));
    t.is(res.body.array.length, 5);
    const sequelize = new Sequelize(data.data.sqlite);
    const saved_result = await sequelize.query("select result from results", {
      type: QueryTypes.SELECT,
    });
    t.deepEqual(res.body, JSON.parse(saved_result[0].result));
    t.teardown(() => {
      fs.unlinkSync("./test/database.test");
    });
  } catch (e) {
    throw e;
  }
});

test("Middleware db should correctly work and save data with given tablename", async (t) => {
  const app = express();
  app.use(bodyParser.json());
  app.use(db);
  app.use("/*", zencode);

  const data = {
    data: {
      sqlite: "sqlite://./test/database_tablename.test",
      tablename: "tablename",
    },
  };
  const sequelize = new Sequelize(data.data.sqlite);
  const sql =
    "CREATE TABLE IF NOT EXISTS `tablename` (`id` INTEGER PRIMARY KEY AUTOINCREMENT, `result` TEXT, `createdAt` DATETIME NOT NULL, `updatedAt` DATETIME NOT NULL);";
  await sequelize.query(sql);
  try {
    const res = await request(app).post("/database_table").send(data);
    const saved_result = await sequelize.query("select result from tablename", {
      type: QueryTypes.SELECT,
    });
    t.is(res.status, 200);
    t.true(Array.isArray(res.body.array));
    t.is(res.body.array.length, 5);
    t.teardown(() => {
      fs.unlinkSync("./test/database_tablename.test");
    });
  } catch (e) {
    throw e;
  }
});
