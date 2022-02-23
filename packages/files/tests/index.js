import test from "ava";
import request from "supertest";
import express from "express";
import bodyParser from "body-parser";

process.env.ZENCODE_DIR = "./test/files";
const http = require("..").default;
const zencode = require("../../core").default;

