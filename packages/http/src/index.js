import axios from "axios";
import { Restroom } from "@restroom-mw/core";

const ACTIONS = {
  EXTERNAL_CONNECTION: "that I have an endpoint named {}",
  EXTERNAL_OUTPUT: "I connect to {} and save the output",
  PASS_OUTPUT: "pass the output to {}",
};

const parse = (o) => {
  try {
    return JSON.parse(o);
  } catch (e) {
    return o;
  }
};

export default (req, res, next) => {
  const rr = new Restroom(req, res);
  let keysContent;
  let dataContent;
  let content = {};
  let externalSourceKeys = [];

  rr.onBefore(async (params) => {
    let { zencode, keys, data } = params;
    keysContent = parse(keys);
    dataContent = parse(data);
    content = { ...dataContent, ...keysContent };

    if (zencode.match(ACTIONS.EXTERNAL_CONNECTION)) {
      externalSourceKeys = zencode.paramsOf(ACTIONS.EXTERNAL_CONNECTION);
    }

    if (zencode.match(ACTIONS.EXTERNAL_OUTPUT)) {
      if (!externalSourceKeys.length)
        throw new Error(`[HTTP]
              Endpoints are missing, please define them with the 
              following zencode sentence "${ACTIONS.EXTERNAL_CONNECTION}"`);

      try {
        for (const key of externalSourceKeys) {
          const url = content[key];
          // make the api call with the keys key value url
          const response = await axios.get(url);
          data["output"] = response.data;
        }
      } catch (e) {
        throw e;
      }
    }
  });

  rr.onSuccess(async (params) => {
    const { result, zencode } = params;
    if (zencode.match(ACTIONS.PASS_OUTPUT)) {
      const outputNames = zencode.paramsOf(ACTIONS.PASS_OUTPUT);
      if (!outputNames.length)
        throw new Error(`[HTTP] no output endpoints defined`);

      for (const key of outputNames) {
        try {
          const url = content[key];
          await axios.post(url, JSON.parse(result));
        } catch (e) {
          throw e;
        }
      }
    }
  });

  next();
};
