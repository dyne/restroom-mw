import fs from 'fs';
import axios from 'axios';
import RestroomCore from "@restroom-mw/core";
const { Restroom } = RestroomCore;

const ACTIONS = {
  EXTERNAL_CONNECTION: "that I have an endpoint named {}",
  EXTERNAL_OUTPUT: "I connect to {} and save the output",
  PASS_OUTPUT: "pass the output to {}"
};

export default (req, res, next) => {
  const rr = new Restroom(req, res);
  let externalSourceKeys = [];
  let externalSourceValue = [];

  let outputName = 'output';
  let outputValue;

  //get the api call from restroom that contains username and contract name
  const originalUrl = rr._req.originalUrl;
  const userContractDir = originalUrl.split('/api/')[1];

  //Get the directories for keys and data
  const completeDir = process.cwd() + '/contracts/' + userContractDir;
  const keyFile = completeDir + '.keys';
  const dataFile = completeDir + '.data';

  rr.onBefore(async (params) => {

    const { zencode, data } = params;

    if (zencode.match(ACTIONS.EXTERNAL_CONNECTION)) {
      externalSourceKeys = zencode.paramsOf(ACTIONS.EXTERNAL_CONNECTION);
    }

    if (zencode.match(ACTIONS.EXTERNAL_OUTPUT)) {

      if (externalSourceKeys.length > 0) {

        //if exists get the value for the external source in the keys or data files that have the externalSourceKey key
        if (fs.existsSync(keyFile)) {
          const keyFileContent = JSON.parse(fs.readFileSync(keyFile).toString());
          for (const key of externalSourceKeys) {
            // use function getValueForKey to recursively search the json for the key and get the value
            const value = getValueForKey(keyFileContent, key);
            if (value) {
              try {
                // make the api call with url in value
                const response = await axios.get(value);
                outputValue = response.data;
              } catch (error) {
                outputValue = null;
              }
              rr.setData(outputName, outputValue);
            }
          };
        }


        if (fs.existsSync(dataFile)) {
          const dataFileContent = JSON.parse(fs.readFileSync(dataFile).toString());
          for (const key of externalSourceKeys) {
            const value = getValueForKey(dataFileContent, key);
            if (value) {
              try {
                const response = await axios.get(value);
                outputValue = response.data;
              } catch (error) {
                outputValue = null;
              }
              rr.setData(outputName, outputValue);
            }
          };
        }

      }

    }

  });

  rr.onSuccess((args) => {
    const { result, zencode } = args;

    if (zencode.match(ACTIONS.PASS_OUTPUT)) {
      const outputNames = zencode.paramsOf(ACTIONS.PASS_OUTPUT);
      if (outputNames.length > 0) {

        //if exists get the value for the external source in the keys or data files with the externalSourceKey key
        if (fs.existsSync(keyFile)) {
          const keyFileContent = JSON.parse(fs.readFileSync(keyFile).toString());
          for (const key of outputNames) {
            // use function getValueForKey to recursively search the json for the key and get the value
            const value = getValueForKey(keyFileContent, key);
            if (value) {
              try {
                const response = axios.post(value, JSON.parse(result));
              } catch (error) {
                console.log('An error occurred');
              }
            }
          };
        }


        if (fs.existsSync(dataFile)) {
          const dataFileContent = JSON.parse(fs.readFileSync(dataFile).toString());
          for (const key of outputNames) {
            const value = getValueForKey(dataFileContent, key);
            if (value) {
              try {
                const response = axios.post(value, JSON.parse(result));
              } catch (error) {
                console.log('An error occurred');
              }
            }
          };
        }

      }
    }
  });

  next();
};

// https://stackoverflow.com/questions/15523514/find-by-key-deep-in-a-nested-array
function getValueForKey(theObject, theKey) {
  var result = null;
  if (theObject instanceof Array) {
    for (var i = 0; i < theObject.length; i++) {
      result = getKey(theObject[i]);
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
        result = getKey(theObject[prop]);
        if (result) {
          break;
        }
      }
    }
  }
  return result;
}

