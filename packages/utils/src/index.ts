require("dotenv").config();

if (process.env.ZENCODE_DIR === undefined)
  throw new Error("You must define `ZENCODE_DIR` before proceding");

/**
 *  The port on which the restroom middlewares can refer to listen for
 *  @constant
 *  @type {string}
 *  @default 3000
 */
export const HTTP_PORT = parseInt(process.env.HTTP_PORT || "3000", 10);

/**
 *  The **secure port** on which the restroom middlewares can refer to listen for
 *  @constant
 *  @type {string}
 *  @default 8443
 */
export const HTTPS_PORT = parseInt(process.env.HTTPS_PORT || "8443", 10);

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

/**
 *  Custom error message to show when hit a non existent contract
 *  @constant
 *  @type {string}
 */
export const CUSTOM_404_MESSAGE = process.env.CUSTOM_404_MESSAGE;
