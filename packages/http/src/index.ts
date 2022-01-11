import axios from "axios";
import https from "https";
import { Restroom } from "@restroom-mw/core";
import { Request, Response, NextFunction } from "express";

const ACTIONS = {
  EXTERNAL_CONNECTION: "have a endpoint named {}",
  EXTERNAL_OUTPUT: "connect to {} and save the output into {}",
  PASS_OUTPUT: "pass the output to {}",
};

const parse = (o: string) => {
  try {
    return JSON.parse(o);
  } catch (e) {
    throw new Error(`[HTTP]
      Error in JSON format "${o}"`);
  }
};

interface ObjectLiteral {
  [key: string]: any;
}

export default (req: Request, res: Response, next: NextFunction) => {
  const rr = new Restroom(req, res);
  let keysContent;
  let dataContent;
  let content: ObjectLiteral = {};
  let contentKeys: string[];
  let externalSourceKeys: string[] = [];

  rr.onBefore(async (params: { zencode: any; keys: any; data: any }) => {
    let { zencode, keys, data } = params;

    keysContent =
      typeof keys === "undefined"
        ? {}
        : keys && typeof keys === "object"
        ? keys
        : parse(keys);
    dataContent =
      typeof data === "undefined"
        ? {}
        : data && typeof data === "object"
        ? data
        : parse(data);
    content = { ...dataContent, ...keysContent };
    contentKeys = Object.keys(content);

    if (zencode.match(ACTIONS.EXTERNAL_CONNECTION)) {
      externalSourceKeys = zencode.paramsOf(ACTIONS.EXTERNAL_CONNECTION);
      //Check for duplicates
      const duplicateFound =
        new Set(externalSourceKeys).size !== externalSourceKeys.length;
      if (duplicateFound) {
        throw new Error(`[HTTP]
          Found a duplicate. Please ensure there are no duplicates
          when defining endpoints in "${ACTIONS.EXTERNAL_CONNECTION}"`);
      }
    }

    if (zencode.match(ACTIONS.EXTERNAL_OUTPUT)) {
      const allExternalOutputs = zencode.paramsOf(ACTIONS.EXTERNAL_OUTPUT);

      if (!externalSourceKeys.length)
        throw new Error(`[HTTP]
            Endpoints are missing, please define them with the
            following zencode sentence "${ACTIONS.EXTERNAL_CONNECTION}"`);

      //join the two values in each EXTERNAL_OUTPUT
      let externalOutputs = [];
      for (var i = 0; i < allExternalOutputs.length; i += 2) {
        externalOutputs.push({
          urlKey: allExternalOutputs[i],
          outputName: allExternalOutputs[i + 1],
        });
      }

      // Check that endpoints have been defined in zencode, keys, or data
      runChecks(externalOutputs, externalSourceKeys, contentKeys);

      for (const output of externalOutputs) {
        try {
          const url = content[output.urlKey];
          const agent = new https.Agent({
            rejectUnauthorized: false,
          });
          // make the api call with the keys key value url
          const response = await axios.get(url, { httpsAgent: agent });
          //Check that response object does not contain boolean values
          typeof response.data === "object" &&
            checkForNestedBoolean(response.data);
          data[output.outputName] = response.data;
        } catch (e) {
          throw new Error(`Error when getting from endpoint "${
            content[output.urlKey]
          }":
                  ${e}`);
        }
      }
    }

    if (zencode.match(ACTIONS.PASS_OUTPUT)) {
      // run checks ACTION PASS_OUTPUT endpoints have been defined in zencode, keys, or data
      const allPassOutputs = zencode
        .paramsOf(ACTIONS.PASS_OUTPUT)
        .map((urlKey: any) => {
          return { urlKey };
        });
      runChecks(allPassOutputs, externalSourceKeys, contentKeys);
    }
  });

  rr.onSuccess(async (params) => {
    const { result, zencode } = params;
    if (zencode.match(ACTIONS.PASS_OUTPUT)) {
      const allPassOutputs = zencode.paramsOf(ACTIONS.PASS_OUTPUT);
      for (const output of allPassOutputs) {
        try {
          const url = content[output];
          const r = typeof result === "object" ? result : JSON.parse(result);
          if (url && r) {
            const response = await axios.post(url, r);
          }
        } catch (e) {
          next(e);
          throw new Error(`[HTTP]
                  Error sending the result to "${output.urlKey}":
                  ${e}`);
        }
      }
    }
  });

  next();
};

const runChecks = (
  endpoints: any[],
  externalSourceKeys: string | any[],
  contentKeys: string | any[]
) => {
  endpoints.forEach((endpoint: { urlKey: string }) => {
    //Check that all enpoints (urlKeys) have been defined using statement EXTERNAL_CONNECTION
    if (externalSourceKeys.includes(endpoint.urlKey) === false) {
      console.log(
        "FAILED CHECK: endpoint has not been defined in zencode: " +
          endpoint.urlKey
      );
      throw new Error(`[HTTP]
              Endpoint "${endpoint.urlKey}" has not been defined in zencode, please define it with
              the following zencode sentence "${ACTIONS.EXTERNAL_CONNECTION}"`);
    }

    // check that all endpoints (urlKeys) are properties in either data or keys
    if (contentKeys) {
      if (contentKeys.includes(endpoint.urlKey) === false) {
        console.log(
          "FAILED CHECK: not defined in keys or files. Throwing error for files: " +
            endpoint.urlKey
        );
        throw new Error(`[HTTP]
                Endpoint "${endpoint.urlKey}" has not been defined in keys or data.`);
      }
    }
  });
};

const checkForNestedBoolean = (obj: any) => {
  const res = {};
  function recurse(obj: { [x: string]: any }, current: string) {
    for (const key in obj) {
      let value = obj[key];
      if (value != undefined) {
        if (value && typeof value === "object") {
          recurse(value, key);
        } else {
          if (typeof value === "boolean") {
            throw new Error(`[HTTP]
                      Boolean values are not permitted. Response JSON has property "${key}" with a boolean value.
                      Please use, for example, 0 and 1`);
          }
        }
      }
    }
  }
  recurse(obj, null);
};
