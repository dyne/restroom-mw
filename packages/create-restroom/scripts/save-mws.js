const fs = require("fs");
const path = require("path");
const stdin = process.openStdin();
const os = require("os");

var data = "";

stdin.on("data", function (chunk) {
  data += chunk;
});

stdin.on("end", function () {
  const to_be_removed = [
    "@restroom-mw/core",
    "create-restroom",
    "@restroom-mw/utils",
    "@restroom-mw/zencode",
  ];
  const p = JSON.parse(data);
  const packages = Object.keys(JSON.parse(p)).filter((v) => {
    if (!to_be_removed.includes(v)) return v;
  });
  const mws_export = `export const mws = ${JSON.stringify(packages)};`;
  const package_dependencies = {};

  for (const d of packages) {
    const def = path.join(
      __dirname,
      "..",
      "..",
      d.replace("@restroom-mw/", ""),
      "package.json"
    );

    const deps = JSON.parse(fs.readFileSync(def).toString()).dependencies;
    if (deps) {
      const inner = Object.keys(deps).map((dep) => `${dep}@${deps[dep]}`);
      package_dependencies[d] = inner;
    }
  }

  const mws_deps_export = `export const mws_deps: any = ${JSON.stringify(
    package_dependencies
  )};`;

  fs.writeFileSync(
    path.join("helpers", "mws.ts"),
    `${mws_export}${os.EOL}${mws_deps_export}` + os.EOL
  );
});
