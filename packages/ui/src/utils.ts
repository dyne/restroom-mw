import readdirp from "readdirp";

/**
 * Reads the directory and list all the files
 * into an object with the full path
 * @param {string} path for where to look at folders
 * @returns {object}
 */
export const ls = async (root: string) => {
  const contracts: { [key: string]: any } = {};
  try {
    const entries = await readdirp.promise(root, { fileFilter: ["*.zen", "*.yml"] });
    entries.map((e) => {
      const { path, fullPath } = e;
      const name = path.split(".")[0];
      const type = path.split(".")[1];
      contracts[name] = {fullPath: fullPath, type: type};
    });
  } catch (e) {
    throw e;
  }
  return contracts;
};

export const nl2br = (str: string) => str.replace(/(?:\r\n|\r|\n)/g, "  \n");
