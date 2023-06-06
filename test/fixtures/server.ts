process.env.ZENCODE_DIR = "./test/fixtures";
import express from "express";
import bodyParser from "body-parser";
const core = require("../../packages/core/src/index").default;
const ui = require("../../packages/ui/src/index").default;
const db = require("../../packages/db/src/index").default;
const httpmw = require("../../packages/http/src/index").default;
const nflx = require("../../packages/influxdb/src/index").default;
import http from "http";

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set("json spaces", 2);
app.use(httpmw);
app.use(db);
app.use(nflx);
app.use("/api/*", core);
app.use("/docs", ui({
  path: process.env.ZENCODE_DIR,
  isDataPublic: true,
  defaultProtocol: 'http',
  defaultPort: 3000
}));

const httpServer = http.createServer(app);
httpServer.listen(3000, "0.0.0.0");
