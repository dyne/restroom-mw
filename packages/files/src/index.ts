import { Restroom } from "@restroom-mw/core";
import axios from "axios";
import { NextFunction, Request, Response } from "express";
import fs from 'fs'
import extract from 'extract-zip';
import path from 'path';

/**
 * `download the 'myUrl' and extract it into 'myFolder'`
 *
 * Download a zip file located at the url `myUrl` and extract it at the path
 * `myFolder` on the server.
 */
import { DOWNLOAD } from "./actions";
/**
 * `store 'myVariable' in the file 'myFolder'`
 *
 * Store the content of the variable `myVariable` in the filesystem at the path
 * `myFolder` on the server
 */

import { STORE_RESULT } from "./actions";

export default (req: Request, res: Response, next: NextFunction) => {
  const rr = new Restroom(req, res);

  rr.onSuccess(async (params) => {
    const { result, zencode } = params;
    if (zencode.match(DOWNLOAD)) {
      const allPassOutputs = zencode.paramsOf(DOWNLOAD);
      for (let i = 0; i < allPassOutputs.length; i += 2) {
        const file = result[allPassOutputs[i]]
        const folder = result[allPassOutputs[i + 1]]

        if (file && folder) {
          try {
            const absoluteFolder = path.resolve(folder);
            const response = await axios.get(file, {
              responseType: 'arraybuffer'
            });
            const tempdir = fs.mkdtempSync("/tmp/restroom");
            const tempfile = tempdir + "/downloaded";
            fs.writeFileSync(tempfile, response.data);
            await extract(tempfile, { dir: absoluteFolder });
            fs.unlinkSync(tempfile);
            fs.rmdirSync(tempdir);
          } catch (e) {
            next(e);
            throw new Error(`[FILES] Error sending the result to "${file}": ${e}`);
          }
        }
        else {
          throw new Error(`[FILES] url or destination folder not defined`);
        }
      }
    }
    if (zencode.match(STORE_RESULT)) {
      const allPassOutputs = zencode.paramsOf(STORE_RESULT);
      for (let i = 0; i < allPassOutputs.length; i += 2) {
        const variable = result[allPassOutputs[i]]
        const file = result[allPassOutputs[i + 1]]

        if (variable && file) {
          const variableJson = JSON.stringify(variable)
          try {
            const absoluteFile = path.resolve(file);

            const absoluteFolder = path.dirname(absoluteFile);
            fs.mkdirSync(absoluteFolder, { recursive: true });

            fs.writeFileSync(absoluteFile, variableJson);
          } catch (e) {
            next(e);
            throw new Error(`[FILES] Error saving the result to "${file}": ${e}`);
          }
        }
        else {
          throw new Error(`[FILES] variable or destination folder not defined`);
        }
      }
    }
  });

  next();
};
