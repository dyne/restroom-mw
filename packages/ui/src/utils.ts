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
    const entries = await readdirp.promise(root, { fileFilter: ["*.zen", "*.yml", "*.keys", "*.data"] });
    entries.map((e) => {
      const { path, fullPath } = e;
      const name = path.split(".")[0];
      const type = path.split(".")[1];
      const hasKeys = entries.find((e)=>e.fullPath === fullPath.split(".")[0] + '.keys')
      const hasData = entries.find((e)=>e.fullPath === fullPath.split(".")[0] + '.data')
      contracts[name] = (type ==='zen'||type ==='yml')&&{
                fullPath: fullPath,
                type: type,
                hasKeys:hasKeys,
                hasData: hasData
            };
    });
  } catch (e) {
    throw e;
  }
  return contracts;
};

export const nl2br = (str: string) => str.replace(/(?:\r\n|\r|\n)/g, "  \n");

export const preserveTabs = (str: string) => str.replace(/ /g,'&nbsp;');
