require("dotenv").config();

if (process.env.ZENCODE_DIR === undefined)
  throw new Error("You must define `ZENCODE_DIR` before proceding");

export * from "./configurations";
export * from "./helpers";



