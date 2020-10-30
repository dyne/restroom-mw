import fs from 'fs';
import axios from 'axios';
import { Restroom }  from "@restroom-mw/core";

const ACTIONS = {
  EXTERNAL_CONNECTION: "that I have an endpoint named {}",
  EXTERNAL_OUTPUT: "I connect to {} and save the output",
  PASS_OUTPUT: "pass the output to {}"
};

const parse = (o) => {
  try {
    return JSON.parse(o)
  } catch(e) {
    return o
  }
}

export default (req, res, next) => {
  const rr = new Restroom(req, res);
  const outputName = 'output';
  let keysContent;
  let dataContent;
  let externalSourceKeys = [];

  rr.onBefore(async (params) => {
    const { zencode, keys, data } = params;
    keysContent = parse(keys);
    dataContent = parse(data);

    if (zencode.match(ACTIONS.EXTERNAL_CONNECTION)) {
      externalSourceKeys = zencode.paramsOf(ACTIONS.EXTERNAL_CONNECTION);
    }

    if (zencode.match(ACTIONS.EXTERNAL_OUTPUT)) {
      if (externalSourceKeys.length > 0) {
        let ouputKeyValue;
        let outputDataValue;
        for (const key of externalSourceKeys) {
          const url = (keysContent || dataContent)[key];
          if (url) {
            try {
              // make the api call with the keys key value url
              const response = await axios.get(url);
              ouputKeyValue = response.data;
            } catch (error) {
              ouputKeyValue = null;
            }
            rr.setData(outputName, ouputKeyValue);
          }
        }
      }
    }
  });

  rr.onSuccess((args) => {
    const { result, zencode } = args;
    if (zencode.match(ACTIONS.PASS_OUTPUT)) {
      const outputNames = zencode.paramsOf(ACTIONS.PASS_OUTPUT);

      if (outputNames.length > 0) {

        for (const key of outputNames) {
          const url = keysContent[key] || dataContent[key];
          if (url) {
            try {
              axios.post(url, JSON.parse(result));
            } catch (error) {
              //could not send the result
            }
          }
        };
      }
    }
  });

  next();
};

