import fs from "fs";
import readdirp from "readdirp";
import fuzzball from "fuzzball";
import { CUSTOM_404_MESSAGE, ZENCODE_DIR } from "@restroom-mw/utils";

export const getKeys = (contractName) => {
  try {
    return (
      fs.readFileSync(`${ZENCODE_DIR}/${contractName}.keys`).toString() || null
    );
  } catch (e) {
    return null;
  }
};

export const getConf = (contractName) => {
  try {
    return (
      fs.readFileSync(`${ZENCODE_DIR}/${contractName}.conf`).toString() || null
    );
  } catch (e) {
    return null;
  }
};

export const getMessage = async (req) => {
  if (CUSTOM_404_MESSAGE) {
    return CUSTOM_404_MESSAGE;
  }
  const contractName = req.params["0"];
  let message = "<h2>404: This contract does not exists</h2>";
  let choices = [];
  const baseUrl = req.originalUrl.replace(contractName, "");
  for await (const file of readdirp(ZENCODE_DIR, { fileFilter: "*.zen" })) {
    choices.push(baseUrl + file.path.slice(0, -4));
  }
  const fuzzy = fuzzball.extract(contractName, choices, {
    limit: 1,
    cutoff: 60,
  });
  if (fuzzy.length) {
    message += `<p>Maybe you were looking for <strong><a href="${baseUrl}${fuzzy[0][0]}">${fuzzy[0][0]}</a></strong></p>`;
  }
  if (choices.length) {
    const listEndpoint = choices.map((e) => `<a href="${e}">${e}</a>`);
    message += `<h4>Other contract's endpoints are </h4><ul>${listEndpoint.join(
      "<br/>"
    )}</ul>`;
  }
  return message;
};
