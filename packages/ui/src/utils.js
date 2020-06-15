import { ZENCODE_DIR } from "@restroom-mw/utils";
import { promises as fs } from 'fs';
import { parse, relative, resolve } from 'path';

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

function forAwait(asyncIter, f) {
  asyncIter.next().then(({ done, value }) => {
    if (done) return;
    f(value);
    forAwait(asyncIter, f);
  });
}

/**
 * Reads the directory and list all the files
 * into an object with the full path
 * @returns {object}
 */
export const ls = (async () => {
  const files = {};
  forAwait(getFiles(ZENCODE_DIR), item => {
    const p = relative(ZENCODE_DIR, item).split(".")[0]
    files[`${p}`] = item;
  })
  return files;
})();
