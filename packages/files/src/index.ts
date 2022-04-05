import {Restroom} from "@restroom-mw/core";
import axios from "axios";
import {NextFunction, Request, Response} from "express";
import fs from 'fs'
import os from 'os'
import extract from 'extract-zip';
import path from 'path';
import {ObjectLiteral} from "@restroom-mw/types";

require("dotenv").config();
/**
 * `download the 'myUrl' and extract it into 'myFolder'`
 *
 * Download a zip file located at the url `myUrl` and extract it at the path
 * `myFolder` on the server.
 */
import {DOWNLOAD} from "./actions";
/**
 * `store 'myVariable' in the file 'myFolder'`
 *
 * Store the content of the variable `myVariable` in the filesystem at the path
 * `myFolder` on the server
 */

import {STORE_RESULT} from "./actions";


/**
 *  Base dir to store data for the user
 *  @constant
 *  @type {string}
 */
export const FILES_DIR = process.env.FILES_DIR;

let input: ObjectLiteral = {};

// save path must be subdirs of FILES_DIR
const validatePath = (p: string) => {
  if (!FILES_DIR)
    throw new Error(`FILES_DIR is not defined`);

  if (FILES_DIR != "/") {
    const relative = path.relative(FILES_DIR, p);
    const isSubdir = relative && !relative.startsWith('..') && !path.isAbsolute(relative);
    if (!isSubdir) {
      throw new Error(`Result path outside ${FILES_DIR}`)
    }
  }
}

export default (req: Request, res: Response, next: NextFunction) => {
  const rr = new Restroom(req, res);


  rr.onBefore(async (params) => {
    const { zencode, keys, data } = params;
    input = rr.combineDataKeys(data, keys);
  });

  rr.onSuccess(async (params) => {
    const {result, zencode} = params;
    if (zencode.match(DOWNLOAD)) {
      const allPassOutputs = zencode.paramsOf(DOWNLOAD);
      for (let i = 0; i < allPassOutputs.length; i += 2) {
        const file = result[allPassOutputs[i]]
        const folder = input[allPassOutputs[i + 1]];

        if(!file) {
          throw new Error(`[FILES] url not defined`);
        }
        if(!folder) {
          throw new Error(`[FILES] destination folder not defined ${Object.keys(input)}`);
        }

        try {
          const absoluteFolder = path.resolve(path.join(FILES_DIR, folder));
          validatePath(absoluteFolder);

          const response = await axios.get(file, {
            responseType: 'arraybuffer'
          });
          const tempdir = fs.mkdtempSync(path.join(os.tmpdir(), 'restroom-'));
          const tempfile = path.join(tempdir, "downloaded");
          fs.writeFileSync(tempfile, response.data);
          await extract(tempfile, { dir: absoluteFolder });
          fs.unlinkSync(tempfile);
          fs.rmdirSync(tempdir);
        } catch (e) {
          next(e);
          throw new Error(`[FILES] Error sending the result to "${file}": ${e}`);
        }
      }
    }
    if (zencode.match(STORE_RESULT)) {
      const allPassOutputs = zencode.paramsOf(STORE_RESULT);
      for (let i = 0; i < allPassOutputs.length; i += 2) {
        const variable = result[allPassOutputs[i]]
        const file = input[allPassOutputs[i + 1]]

        if(!variable) {
          throw new Error(`[FILES] variable not defined`);
        }
        if(!file) {
          throw new Error(`[FILES] destination file not defined`);
        }

        const variableJson = JSON.stringify(variable)
        try {
          const absoluteFile = path.resolve(path.join(FILES_DIR, file));
          validatePath(absoluteFile);

          const absoluteFolder = path.dirname(absoluteFile);
          fs.mkdirSync(absoluteFolder, { recursive: true });

          fs.writeFileSync(absoluteFile, variableJson);
        } catch (e) {
          next(e);
          throw new Error(`[FILES] Error saving the result to "${file}": ${e}`);
        }
      }
    }
  });

  next();
};
