import { ZENCODE_DIR } from "@restroom-mw/utils";
import { promises as fs } from "fs";
import { parse, relative, resolve } from "path";
import readdirp from "readdirp";

/**
 * Reads the directory and list all the files
 * into an object with the full path
 * @param {string} path for where to look at folders
 * @returns {object}
 */
export const ls = async (root) => {
  const contracts = {};
  for await (const contract of readdirp(root, { fileFilter: "*.zen" })) {
    const { path, fullPath } = contract;
    const name = path.split(".")[0];
    contracts[name] = fullPath;
  }
  return contracts;
};

export const nl2br = (str) => str.replace(/(?:\r\n|\r|\n)/g, "  \n");
