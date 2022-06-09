import readdirp from "readdirp";
/**
 * Reads the directory and list all the files
 * into an object with the full path
 * @param {string} path for where to look at folders
 * @returns {object}
 */
export const ls = async (root: string, isDataPublic:boolean) => {
  const contracts: { [key: string]: any } = {};
  try {
    const YML_EXTENSION = process.env.YML_EXT? `*.${process.env.YML_EXT}` : "*.yml";
    const filters:Array<string> = isDataPublic? ["*.zen", YML_EXTENSION, "*.data"] : ["*.zen", YML_EXTENSION]
    const entries = await readdirp.promise(root, { fileFilter: filters });
    entries.map((e) => {
      const { path, fullPath } = e;
      const name = path.split(".")[0];
      const type = path.split(".")[1];
      const hasData = entries.some((e)=>e.fullPath === fullPath.split(".")[0] + '.data')
      contracts[name] = (type ==='zen'||type ==='yml')&&{
                fullPath: fullPath,
                type: type,
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
