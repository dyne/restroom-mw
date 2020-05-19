require("dotenv").config();

if (process.env.ZENCODE_DIR === undefined)
  throw "You must define `ZENCODE_DIR` before proceding";

/**
 *  The port on which the restroom middlewares can refer to listen for
 *  @constant
 *  @type {string}
 *  @default 3000
 */
export const PORT = parseInt(process.env.PORT || "3000", 10);

/**
 *  The hostname on which the restroom middleware can refer to listen for
 *  @constant
 *  @type {string}
 *  @default 0.0.0.0
 */
export const HOST = process.env.HOST || "0.0.0.0";

/**
 *  The absolut path of the directory containing the smart contracts
 *  @constant
 *  @type {string}
 */
export const ZENCODE_DIR = process.env.ZENCODE_DIR;
