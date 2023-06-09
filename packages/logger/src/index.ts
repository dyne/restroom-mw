import {Restroom} from "@restroom-mw/core";
import {NextFunction, Request, Response} from "express";
import fs from 'fs'
import path from 'path';
import {ObjectLiteral} from "@restroom-mw/types";
import {validateSubdir} from "@restroom-mw/utils";

require("dotenv").config();

/**
 * Given I append the string 'log' to the logfile in 'log_path'
 * @param {string} log - It can be the name of the variable that contains the log string
 *        or the log string itself
 * @param {string} log_path - Path to the log file under the `FILES_DIR` directory
 */
import { APPEND } from "./actions";
/**
 * Given I append the string 'log' to the logfile named by 'log_name'
 * @param {string} log - It can be the name of the variable that contains the log string
 *        or the log string itself
 * @param {string} log_name - Name of the variable the contains the path to log file under
 *         the `FILES_DIR` directory
 */
import { APPEND_NAMED } from "./actions"
/**
 * Given I append the array of strings 'log_array' to the logfile named by 'log_name'
 * @param {string} log - The name of the variable that contains the array of log strings
 * @param {string} log_name - Name of the variable the contains the path to log file under
 *         the `FILES_DIR` directory
 */
import { APPEND_ARRAY } from "./actions"

export const LOGGER_DIR = process.env.LOGGER_DIR;

const validatePath = validateSubdir(LOGGER_DIR);

let input: ObjectLiteral = {};

export default (req: Request, res: Response, next: NextFunction) => {
  const rr = new Restroom(req, res);

  rr.onBefore(async (params) => {
    const { zencode, keys, data } = params;
    input = rr.combineDataKeys(data, keys);
  });

  rr.onSuccess(async (params) => {
    const {result, zencode} = params;

    const addLog = (sentences: string[], where: string) => {
      const absolutePath = path.resolve(path.join(LOGGER_DIR, where));
      validatePath(absolutePath);
      const ws = fs.createWriteStream(absolutePath, {flags: "a"});
      ws.on('error',  (error) => {
        throw new Error(
          `[LOGGER] An error occurred while writing to ${where}\n${error}`)
      });
      sentences.forEach( (v) => ws.write(`${v}\n`) )
    }

    if (zencode.match(APPEND)) {
      const params = zencode.chunkedParamsOf(APPEND, 2);
      for(const [ sentence, where ] of params) {
        addLog([ result[sentence] || input[sentence] || sentence ], where);
      }
    }
    if (zencode.match(APPEND_NAMED)) {
      const params = zencode.chunkedParamsOf(APPEND_NAMED, 2);
      for(const [ sentence, pathName ] of params) {
        const logPath = result[pathName] || input[pathName];
        if(!logPath) {
          throw new Error(
            `[LOGGER] Could not find path to log ${pathName}`)
        }
        addLog([ result[sentence] || input[sentence] || sentence ], logPath);
      }
    }
    if (zencode.match(APPEND_ARRAY)) {
      const params = zencode.chunkedParamsOf(APPEND_ARRAY, 2);
      for(const [arrayName, where] of params) {
        const sentences = input[arrayName] || result[arrayName];
        if(!sentences || !Array.isArray(sentences)) {
          throw new Error(
            `[LOGGER] Could not find sentences array to log ${arrayName}`)
        }
        addLog(sentences,
          result[where] || input[where] || where);
      }
    }
  });

  next();
};
