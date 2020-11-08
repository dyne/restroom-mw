import readdirp from "readdirp";

/**
 * Reads the directory and list all the files
 * into an object with the full path
 * @param {string} path for where to look at folders
 * @returns {object}
 */
export const ls = async (root) => {
  const contracts = {};
  try {
    for await (const contract of readdirp(root, { fileFilter: "*.zen" })) {
      const { path, fullPath } = contract;
      const name = path.split(".")[0];
      contracts[name] = fullPath;
    }
  } catch (e) {
    throw e;
  }
  return contracts;
};

export const nl2br = (str) => str.replace(/(?:\r\n|\r|\n)/g, "  \n");
