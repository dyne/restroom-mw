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

export const getContracts = async (baseUrl) => {
  const contracts = [];
  for await (const file of readdirp(ZENCODE_DIR, { fileFilter: "*.zen" })) {
    contracts.push(baseUrl + file.path.slice(0, -4));
  }
  return contracts;
};

export const contractName = (req) => req.params[0];

export const baseUrl = (req) => req.originalUrl.replace(req.params[0], "");

export const getFuzzyContractMessage = (contractName, choices, baseUrl) => {
  const fuzzy = fuzzball.extract(contractName, choices, {
    limit: 1,
    cutoff: 60,
  });
  if (fuzzy.length) {
    return `<p>Maybe you were looking for <strong><a href="${baseUrl}${fuzzy[0][0]}">${fuzzy[0][0]}</a></strong></p>`;
  }
  return "";
};

export const getEndpointsMessage = (choices, baseUrl) => {
  if (!choices.length) return "";
  const listEndpoint = choices
    .map((e) => `<a href="${baseUrl}${e}">${e}</a>`)
    .join("<br/>");
  return `<h4>Other contract's endpoints are </h4><ul>${listEndpoint}</ul>`;
};

export const getMessage = async (req) => {
  if (CUSTOM_404_MESSAGE) {
    return CUSTOM_404_MESSAGE;
  }
  const contract = contractName(req);
  const message = "<h2>404: This contract does not exists</h2>";
  const url = baseUrl(req);
  const choices = await getContracts(url);
  message.concat(getFuzzyContractMessage(contract, choices, url));
  message.concat(getEndpointsMessage(choices, url));
  return message;
};
