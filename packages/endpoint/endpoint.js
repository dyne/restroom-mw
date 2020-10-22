import fs from 'fs';
import axios from 'axios';
import { Restroom } from "@restroom-mw/core";

const ACTIONS = {
  EXTERNAL_CONNECTION: "that I have an endpoint named {}",
  EXTERNAL_OUTPUT: "I connect to {} and save the output",
  PASS_OUTPUT: "pass the output to {}"
};

export default (req, res, next) => {
  const rr = new Restroom(req, res);
  const outputName = 'output';
  let keysContent;
  let dataContent;
  let externalSourceKeys = [];

  rr.onBefore(async (params) => {
    const { zencode, data, keys } = params;
    //used in rr.onSuccess
    keysContent = keys;
    dataContent = data;

    if (zencode.match(ACTIONS.EXTERNAL_CONNECTION)) {
      externalSourceKeys = zencode.paramsOf(ACTIONS.EXTERNAL_CONNECTION);
    }

    if (zencode.match(ACTIONS.EXTERNAL_OUTPUT)) {
      if (externalSourceKeys.length > 0) {
        let ouputKeyValue;
        let outputDataValue;

        for (const key of externalSourceKeys) {
          // use function getKey to recursively search for the key to get its value
          const keyValue = getKey(keys, key);
          const dataValue = getKey(data, key);

          if (keyValue) {
            try {
              // make the api call with the keys key value url
              ouputKeyValue = await axios.get(keyValue).data;
            } catch (error) {
              ouputKeyValue = null;
            }
            rr.setData(outputName, ouputKeyValue);
          }

          if (dataValue) {
            try {
              // make the api call with the data key value url
              outputDataValue = await axios.get(dataValue).data;
            } catch (error) {
              outputDataValue = null;
            }
            rr.setData(outputName, outputDataValue);
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
          const keyValue = getKey(keysContent, key);
          const dataValue = getKey(dataContent, key);

          if (keyValue) {
            try {
              axios.post(keyValue, JSON.parse(result));
            } catch (error) {
              //could not send the result
            }
          }

          if (dataValue) {
            try {
              axios.post(dataValue, JSON.parse(result));
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


function getKey(obj, theKey, running) {
  if (!obj || !theKey)
    return null;

  let result = null;
  let theObject = null;
  if (!running) {
    try {
      theObject = JSON.parse(obj.toString());
    } catch (error) {
      //something went wrong with JSON parsing obj
    }
  }

  if (!theObject)
    return null;

  if (theObject instanceof Array) {
    for (var i = 0; i < theObject.length; i++) {
      result = getKey(theObject[i], theKey, true);
      if (result) {
        break;
      }
    }
  }
  else {
    for (var prop in theObject) {

      if (prop === theKey) {
        return theObject[prop]
      }

      if (theObject[prop] instanceof Object || theObject[prop] instanceof Array) {
        result = getKey(theObject[prop], theKey, true);
        if (result) {
          break;
        }
      }

    }
  }
  return result;
}

