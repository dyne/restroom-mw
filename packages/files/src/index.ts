import { Restroom } from "@restroom-mw/core";
import { ObjectLiteral } from "@restroom-mw/core/src/types";
import { Zencode } from "@restroom-mw/zencode";
import axios from "axios";
import { NextFunction, Request, Response } from "express";
import fs from 'fs'
import extract from 'extract-zip';

/**
 * `download the 'myUrl' and extract it into 'myFolder'`
 *
 * Download a zip file located at the url `myUrl` and extract it at the path 
 * `myFolder` on the server.
 */
import { DOWNLOAD } from "./actions";

export default (req: Request, res: Response, next: NextFunction) => {
  const rr = new Restroom(req, res);
  let content: ObjectLiteral = {};

  rr.onSuccess(async (params) => {
    const { result, zencode } = params;
    if (zencode.match(DOWNLOAD)) {
      const allPassOutputs = zencode.paramsOf(DOWNLOAD);
      for (let i = 0; i < allPassOutputs.length; i += 2) {
        const file = result[allPassOutputs[i]]
        const folder = result[allPassOutputs[i+1]]

        if (file) {
          try {
            const response = await axios.get(file, {
              responseType: 'arraybuffer'
            }); 
            const tempdir = fs.mkdtempSync("/tmp/restroom");
            const tempfile = tempdir + "/downloaded";
            fs.writeFileSync(tempfile, response.data);
            await extract(tempfile, { dir: folder });
            fs.unlinkSync(tempfile);
            fs.rmdirSync(tempdir);
          } catch (e) {
            next(e);
            throw new Error(`[FILES]
                    Error sending the result to "${file}":
                    ${e}`);
          }
        }
      }
    }
  });

  next();
};
