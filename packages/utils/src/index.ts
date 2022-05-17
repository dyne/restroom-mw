import { TextDecoder } from "util";
import { Zencode } from "@restroom-mw/zencode";
import { ObjectLiteral } from "@restroom-mw/types";

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

/**
 *  Chain extension
 *  @constant
 *  @type {string}
 */
export const CHAIN_EXTENSION = process.env.CHAIN_EXT || "chain";

/**
 *  YML extension
 *  @constant
 *  @type {string}
 */
export const YML_EXTENSION = process.env.YML_EXT || "yml";

export const UTF8_DECODER = new TextDecoder();

export const combineDataKeys = (data: ObjectLiteral, keys: string) => {
  try {
    return { ...data, ...JSON.parse(keys) };
  } catch (e) {
    throw new Error("Keys or data in wrong format");
  }
};

/**
 * Retrieve the named params content from the input (usually the combination of data and keys).
 * This is for the sentences that do not directly have a params in them but instead
 * a reference of the params are in the data and keys object.
 * It is safe to be used also on sentences with plain params, as it does fallback
 * to the Zencode.paramsOf function if not found in the input.
 *
 * Like: `Given I have a sawroom endpoint named 'mySawroomAddressDefinedInsideData'`
 *
 *
 * @param zencode
 * @param input
 * @returns
 */
export const zencodeNamedParamsOf =
  (zencode: Zencode, input: ObjectLiteral) =>
    (sid: string): string[] => {
      if (!zencode.match(sid)) return [];
      const params = zencode.paramsOf(sid);
      return params.reduce((acc: string[], p: string) => {
        acc.push(input[p] || p);
        return acc;
      }, []);
    };
