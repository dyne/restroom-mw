import fs from "fs";
import { ZENCODE_DIR } from "@restroom-mw/utils";

/**
 * Reads the directory and list all the files
 * into an object with the full path
 * @returns {object}
 */
export const ls = () => {
  const items = fs.readdirSync(ZENCODE_DIR);
  const files = {};
  for (const item of items) {
    const p = item.split(".")[0];
    files[`${p}`] = `${ZENCODE_DIR}/${item}`;
  }
  return files;
};
