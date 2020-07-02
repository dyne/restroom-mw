import { ZENCODE_DIR } from "@restroom-mw/utils";
import { promises as fs } from "fs";
import { parse, relative, resolve } from "path";

// https://qwtel.com/posts/software/async-generators-in-the-wild/
async function* getFiles(rootPath) {
  const fileNames = await fs.readdir(rootPath);
  for (const fileName of fileNames) {
    const path = resolve(rootPath, fileName);
    if ((await fs.stat(path)).isDirectory()) {
      yield* getFiles(path);
    } else {
      yield path;
    }
  }
}

/**
 * Reads the directory and list all the files
 * into an object with the full path
 * @param {string} path for where to look at folders
 * @returns {object}
 */
export const ls = async (path) => {
  let files = {};
  for await (const item of getFiles(path)) {
    const p = relative(ZENCODE_DIR, item).split(".")[0];
    files[p] = item;
  }
  return files;
};

export const nl2br = (str) => str.replace(/(?:\r\n|\r|\n)/g, "  \n");
