process.env.ZENCODE_DIR = "./test/fixtures";
import express from "express";
import bodyParser from "body-parser";
const core = require("../../packages/core/src").default;
const ui = require("../../packages/ui/src").default;
const db = require("../../packages/db/src").default;
const httpmw = require("../../packages/http/src").default;
import http from "http";
import morgan from "morgan";
import errorhandler from "errorhandler";

const app = express();
app.use(morgan("combined"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.set("json spaces", 2);
app.use(httpmw);
app.use(db);
app.use("/api/*", core);
app.use("/docs", ui({ path: process.env.ZENCODE_DIR }));
app.use(errorhandler);

const httpServer = http.createServer(app);
httpServer.listen(3000, "0.0.0.0");
