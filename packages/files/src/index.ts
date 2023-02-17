import {Restroom} from "@restroom-mw/core";
import axios from "axios";
import {NextFunction, Request, Response} from "express";
import fs from 'fs'
import { readdir, stat } from 'node:fs/promises';
import os from 'os'
import extract from 'extract-zip';
import path from 'path';
import {ObjectLiteral} from "@restroom-mw/types";
import {validateSubdir} from "@restroom-mw/utils"

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

import {READ, READ_AND_SAVE, LS} from "./actions";


/**
 *  Base dir to store data for the user
 *  @constant
 *  @type {string}
 */
export const FILES_DIR = process.env.FILES_DIR;

let input: ObjectLiteral = {};

// save path must be subdirs of FILES_DIR
const validatePath = validateSubdir(FILES_DIR);

export default (req: Request, res: Response, next: NextFunction) => {
  const rr = new Restroom(req, res, [READ, DOWNLOAD, STORE_RESULT]);

  rr.onBefore(async (params) => {
    const { zencode, keys, data } = params;
    input = rr.combineDataKeys(data, keys);

    const readFromFile = ( file: string ) => {
      let content
      const f = input[file] || file;
      const absoluteFile = path.resolve(path.join(FILES_DIR, f));
      validatePath(absoluteFile);
      try {
        content = fs.readFileSync(absoluteFile, 'utf8');
      } catch(e) {
        // TODO: add not-fatal (warning) log in restroom
        //throw new Error(`[FILES] error while reading the file ${absoluteFile}`);
        content = "{}";
      }
      return JSON.parse(content);
    }

    if (zencode.match(READ)) {
      const params = zencode.paramsOf(READ);
      for(const f of params) {
        Object.assign(data, readFromFile(f));
      }
    };
    if (zencode.match(READ_AND_SAVE)) {
      const chkParams = zencode.chunkedParamsOf(READ_AND_SAVE, 2);
      for(const [f, outputVariable] of chkParams) {
        data[ outputVariable ] = readFromFile(f);
      }
    };
    if (zencode.match(LS)) {
      const params = zencode.chunkedParamsOf(LS, 2);
      const fileStats: Record<string, any> = {}
      const allLs = (await Promise.all(params.map(
        async ([p, name]: string[]) => {
          const f = input[p] || p;
          validatePath(f);
          try {
            const content = await readdir(f)
            // I am not checking if `name` is used multiple times
            fileStats[name] = []
            return content.map((current) => [name, f, current]);
          } catch(e) {
            throw new Error(`[FILES] error while reading the file ${f}`);
          }
        }))).flat()
      // list with all files I want to see the stats of
      const allStats = await Promise.all(allLs.map(async ([name, p, current]) => {
        const currentFile = path.join(p, current)
        const fileStat = await stat(currentFile)
        return [name, current, fileStat]
      }))
      for(const [name, current, currentStat] of allStats) {
        // see https://unix.stackexchange.com/questions/317855/file-mode-on-macosx#317907
        // for the meaning of the mode field
        fileStats[name].push({
          'name': current,
          'mode': currentStat.mode.toString(8),
          'dev': currentStat.dev,
          'nlink': currentStat.nlink,
          'uid': currentStat.uid,
          'gid': currentStat.gid,
          'size': currentStat.size,
          'blksize': currentStat.blksize,
          'blocks': currentStat.blocks,
          'atime': currentStat.atime.toISOString(),
          'mtime': currentStat.mtime.toISOString(),
          'ctime': currentStat.ctime.toISOString(),
          'birthtime': currentStat.birthtime.toISOString(),
        })
      }
      Object.assign(data, fileStats)

    }
    input = rr.combineDataKeys(data, keys);
  });

  rr.onSuccess(async (params) => {
    const {result, zencode} = params;
    if (zencode.match(DOWNLOAD)) {
      const allPassOutputs = zencode.paramsOf(DOWNLOAD);
      for (let i = 0; i < allPassOutputs.length; i += 2) {
        const file = result[allPassOutputs[i]] ||
          input[allPassOutputs[i]];
        const folder = result[allPassOutputs[i + 1]] ||
          input[allPassOutputs[i + 1]];

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
        const variable = result[allPassOutputs[i]] ||
          input[allPassOutputs[i]];
        const file = result[allPassOutputs[i + 1]] ||
          input[allPassOutputs[i + 1]];

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
