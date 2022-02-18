import chalk from "chalk";
import fs from "fs";
import mustache from "mustache";
import { oraPromise } from 'ora';
import os from "os";
import path from "path";
import { box } from "./helpers/box";
import { install } from "./helpers/install";
import { interactive_mws } from "./helpers/interactive-mws";
import { isFolderEmpty } from "./helpers/is-folder-empty";
import { isWriteable } from "./helpers/is-writeable";
import { makeDir } from "./helpers/make-dir";
import { mws_deps } from "./helpers/mws";
import { template } from "./templates/restroom";


export async function create({ appPath, mws, debug = false, zencodeDir = 'contracts' }: { appPath: string, mws: (string | undefined)[] | null, debug: boolean, zencodeDir: string }): Promise<void> {
  const root = path.resolve(appPath);
  if (!(await isWriteable(path.dirname(root)))) {
    console.error(
      "The application path is not writable, please check folder permissions and try again."
    );
    console.error(
      "It is likely you do not have write permissions for this folder."
    );
    process.exit(1);
  }

  const appName = path.basename(root);
  const middleware_deps = mws ?? await interactive_mws();

  await makeDir(root);
  if (!isFolderEmpty(root, appName)) {
    process.exit(1);
  }

  const normalizedZenDir = zencodeDir == 'contracts' ? zencodeDir : path.join(path.dirname(root), zencodeDir);
  if (zencodeDir == normalizedZenDir)
    await makeDir(path.join(root, zencodeDir));

  const originalDirectory = process.cwd();
  const displayedCommand = "yarn";
  box(`Cooking 🍳
a new ${chalk.bold("restroom")} app
in ${chalk.green(root)}.`);

  process.chdir(root);

  const packageJson = {
    name: appName,
    version: "0.1.0",
    private: true,
    scripts: {
      start: `ZENCODE_DIR=${normalizedZenDir} node restroom.mjs`,
    },
  };

  fs.writeFileSync(
    path.join(root, "package.json"),
    JSON.stringify(packageJson, null, 2) + os.EOL
  );

  const view = middleware_deps.reduce((acc: any, curr: any) => (acc[curr.replace('@next', '')] = true, acc), {})

  fs.writeFileSync(
    path.join(root, "restroom.mjs"),
    mustache.render(template, view) + os.EOL
  );

  const deps_of_deps = middleware_deps.map((d: string) => mws_deps[d.replace('@next', '')] ?? []).flat();

  const dependencies = [
    "zenroom@next",
    "@restroom-mw/core@next",
    "@restroom-mw/zencode@next",
    "@restroom-mw/utils@next",
    "express",
    "dotenv",
    ...middleware_deps,
    ...deps_of_deps,
  ];

  const devDependencies = [
    "morgan",
    "chalk",
    "dotenv",
    "readdirp",
  ];


  if (debug) {
    for (const dependency of dependencies) {
      console.log(`- ${chalk.cyan(dependency)}`);
    }
    await install(root, dependencies, false, true);
  } else {
    await oraPromise(install(root, dependencies), "📦 Installing dependencies can take a while...");
  }
  if (debug) {
    for (const dependency of devDependencies) {
      console.log(`- ${chalk.cyan(dependency)}`);
    }
    await install(root, devDependencies, true, true);
  } else {
    await oraPromise(install(root, devDependencies, true, debug), "⚒️ Installing devDependencies");
  }
  console.log();

  let cdpath: string;
  if (path.join(originalDirectory, appName) === appPath) {
    cdpath = appName;
  } else {
    cdpath = appPath;
  }

  box(`🍕 ${chalk.green("Success!")}

Your custom ${chalk.bold(`restroom`)} ${chalk.redBright(appName)} is
freshly baked at ${chalk.blue(appPath)}


We suggest that you begin by typing:

${chalk.cyan("  cd")} ${cdpath}
${chalk.cyan(`${displayedCommand} start`)}
  `);
}
