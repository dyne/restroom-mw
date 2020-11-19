import axios from "axios";
import https from 'https';
import { Restroom } from "@restroom-mw/core";

const ACTIONS = {
  EXTERNAL_CONNECTION: "that I have an endpoint named {}",
  EXTERNAL_OUTPUT: "I connect to {} and save the output into {}",
  PASS_OUTPUT: "pass the output to {}",
};

const parse = (o) => {
  try {
    return JSON.parse(o);
  } catch (e) {
    throw new Error(`[HTTP]
      Error in JSON format "${o}"`);
  }
};

export default (req, res, next) => {
  const rr = new Restroom(req, res);
  let keysContent;
  let dataContent;
  let content = {};
  let contentKeys;
  let externalSourceKeys = [];

  rr.onBefore(async (params) => {
    let { zencode, keys, data } = params;

    if (zencode.match(ACTIONS.EXTERNAL_CONNECTION)) {
      externalSourceKeys = zencode.paramsOf(ACTIONS.EXTERNAL_CONNECTION);
      //Check for duplicates
      const duplicateFound = new Set(externalSourceKeys).size !== externalSourceKeys.length;
      if (duplicateFound) {
        throw new Error(`[HTTP]
          Found a duplicate. Please ensure there are no duplicates 
          when defining endpoints in "${ACTIONS.EXTERNAL_CONNECTION}"`);
      }
    }

    if (zencode.match(ACTIONS.EXTERNAL_OUTPUT)) {
      const allExternalOutputs = zencode.paramsOf(ACTIONS.EXTERNAL_OUTPUT);

      keysContent = (keys && typeof keys === 'object') ? keys : parse(keys);
      dataContent = (data && typeof data === 'object') ? data : parse(data);
      content = { ...dataContent, ...keysContent };
      contentKeys = Object.keys(content);

      if (!externalSourceKeys.length)
        throw new Error(`[HTTP]
            Endpoints are missing, please define them with the 
            following zencode sentence "${ACTIONS.EXTERNAL_CONNECTION}"`);

      //join the two values in each EXTERNAL_OUTPUT
      let externalOutputs = [];
      for (var i = 0; i < allExternalOutputs.length; i += 2) {
        externalOutputs.push({
          urlKey: allExternalOutputs[i],
          outputName: allExternalOutputs[i + 1]
        });
      }

      // Check that endpoints have been defined in zencode, keys, or data
      runChecks(externalOutputs, externalSourceKeys, contentKeys);

      for (const output of externalOutputs) {
        try {
          const url = content[output.urlKey];
          const agent = new https.Agent({
            rejectUnauthorized: false
          })
          // make the api call with the keys key value url
          const response = await axios.get(url, { httpsAgent: agent });
          //Check that response object does not contain boolean values
          (typeof response.data === 'object') && checkForNestedBoolean(response.data);
          data[output.outputName] = response.data;
        } catch (e) {
          throw new Error(`Error when getting from endpoint "${content[output.urlKey]}": 
                  ${e}`);
        }
      }
    }

    if (zencode.match(ACTIONS.PASS_OUTPUT)) {
      // run checks ACTION PASS_OUTPUT endpoints have been defined in zencode, keys, or data
      const allPassOutputs = zencode.paramsOf(ACTIONS.PASS_OUTPUT).map(urlKey => { return { urlKey } });
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
          const response = await axios.post(url, JSON.parse(result));
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

const runChecks = (endpoints, externalSourceKeys, contentKeys) => {
  endpoints.forEach(endpoint => {
    //Check that all enpoints (urlKeys) have been defined using statement EXTERNAL_CONNECTION
    if (externalSourceKeys.includes(endpoint.urlKey) === false) {
      console.log('FAILED CHECK: endpoint has not been defined in zencode: ' + endpoint.urlKey);
      throw new Error(`[HTTP]
              Endpoint "${endpoint.urlKey}" has not been defined in zencode, please define it with
              the following zencode sentence "${ACTIONS.EXTERNAL_CONNECTION}"`);
    }

    // check that all endpoints (urlKeys) are properties in either data or keys
    if (contentKeys.includes(endpoint.urlKey) === false) {
      console.log('FAILED CHECK: not defined in keys or files. Throwing error for files: ' + endpoint.urlKey);
      throw new Error(`[HTTP]
              Endpoint "${endpoint.urlKey}" has not been defined in keys or data.`);
    }
  });
}

const checkForNestedBoolean = (obj) => {
  const res = {};
  function recurse(obj, current) {
    for (const key in obj) {
      let value = obj[key];
      if (value != undefined) {
        if (value && typeof value === 'object') {
          recurse(value, key);
        } else {
          if (typeof value === 'boolean') {
            throw new Error(`[HTTP]
                      Boolean values are not permitted. Response JSON has property "${key}" with a boolean value. 
                      Please use, for example, 0 and 1`);
          }
        }
      }
    }
  }
  recurse(obj);
}