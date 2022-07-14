import { Zencode } from "@restroom-mw/zencode";
import readdirp from "readdirp";
import fuzzball from "fuzzball";
import {
  CUSTOM_404_MESSAGE,
  ZENCODE_DIR,
  YML_EXTENSION,
  KEYS_DIR,
} from "@restroom-mw/utils";
import { Request, Response } from "express";
import fs from "fs";
import * as yaml from "js-yaml";
import { SingleInstanceOutput } from "./single-instance-output";

const STRING = "string";
const OBJECT = "object";

export const getKeys = (contractName: string) => {
  try {
    const keysContent = fs.readFileSync(
      `${KEYS_DIR}/${contractName}.keys`,
      "utf8"
    );
    return JSON.stringify(yaml.load(keysContent));
  } catch (e) {
    try {
      const keysContent = fs.readFileSync(
        `${KEYS_DIR}/${contractName}.keys`,
        "utf8"
      );
      return JSON.stringify(JSON.parse(keysContent));
    } catch (e) {
      return null;
    }
  }
};

export const getFile = (fileWithExtension: string) => {
  try {
    return (
      fs
        .readFileSync(`${ZENCODE_DIR}/${fileWithExtension}`, "utf8")
        .toString() || null
    );
  } catch (e) {
    return null;
  }
};

/**
 *  Returns zencode from a contract name
 *  @param contractName
 *  @returns {Zencode}
 */
export const getContractByContractName = (contractName: string): Zencode => {
  return Zencode.byName(contractName, ZENCODE_DIR);
};

/**
 *  Returns zencode from a partial path
 *  @param path
 *  @returns {Zencode}
 */
export const getContractFromPath = (path: string): Zencode => {
  return Zencode.fromPath(`${ZENCODE_DIR}/${path}`);
};

/**
 *  Returns string representing a .yml file
 *  @param ymlName
 *  @returns {string}
 */
export const getYml = (ymlName: string) => {
  return (
    fs.readFileSync(`${ZENCODE_DIR}/${ymlName}.${YML_EXTENSION}`).toString() ||
    null
  );
};

export const getConf = (contractName: string) => {
  try {
    return (
      fs.readFileSync(`${ZENCODE_DIR}/${contractName}.conf`).toString() || null
    );
  } catch (e) {
    return "";
  }
};

export const getContracts = async (baseUrl: string) => {
  const contracts = [];
  for await (const file of readdirp(ZENCODE_DIR, { fileFilter: "*.zen" })) {
    contracts.push(baseUrl + file.path.slice(0, -4));
  }
  return contracts;
};

export const contractName = (req: Request) => req.params[0];

export const baseUrl = (req: Request) =>
  req.originalUrl.replace(req.params[0], "");

export const getFuzzyContractMessage = (
  contractName: string,
  choices: string[],
  baseUrl: string
) => {
  const fuzzy = fuzzball.extract(contractName, choices, {
    limit: 1,
    cutoff: 60,
  });
  if (fuzzy.length) {
    return `<p>Maybe you were looking for <strong><a href="${baseUrl}${fuzzy[0][0]}">${fuzzy[0][0]}</a></strong></p>`;
  }
  return "";
};

export const getEndpointsMessage = (choices: string[], baseUrl: string) => {
  if (!choices.length) return "";
  const listEndpoint = choices
    .map((e) => `<a href="${baseUrl}${e}">${e}</a>`)
    .join("<br/>");
  return `<h4>Other contract's endpoints are </h4><ul>${listEndpoint}</ul>`;
};

export const getMessage = async (req: Request) => {
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

export const getData = (req: Request, res: Response) => {
  let params = {};
  if (req.method === "GET") params = JSON.parse(req.query?.data as string);

  if (req.method === "POST") params = req.body?.data;

  return res.locals?.zenroom_data || params;
};

export const isChainLastBlock = (internalResult: SingleInstanceOutput) => {
  return !internalResult.singleContext?.next;
};

export const isErrorResult = (internalResult: SingleInstanceOutput) => {
  return internalResult.restroomResult?.error;
};

export const isForEachPresent = (ymlContent: any, block: string) => {
  return ymlContent.blocks[block].forEach;
};

export const isObject = (item: any) => {
  return typeof item === OBJECT;
};

export const isString = (item: unknown) => {
  return typeof item === STRING;
};
