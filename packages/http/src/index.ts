import { Restroom } from "@restroom-mw/core";
import { ObjectLiteral } from "@restroom-mw/core/src/types";
import { Zencode } from "@restroom-mw/zencode";
import axios from "axios";
import { NextFunction, Request, Response } from "express";
import https from "https";
import {
  EXTERNAL_CONNECTION,
  EXTERNAL_OUTPUT,
  PARALLEL_GET,
  PARALLEL_POST,
  PASS_OUTPUT,
  POST_AND_SAVE_TO_VARIABLE,
} from "./actions";
import {
  checkEndpointDefined,
  checkForDuplicates,
  checkForNestedBoolean,
  chunks,
  runChecks,
} from "./utils";

export default (req: Request, res: Response, next: NextFunction) => {
  const rr = new Restroom(req, res);
  let content: ObjectLiteral = {};
  let externalSourceKeys: string[] = [];
  let parallel_params: { output: string, index: string }[] = [];
  let parallel_promises: Promise<any>[] = [];

  rr.onBefore(
    async (params: {
      zencode: Zencode;
      keys: ObjectLiteral;
      data: ObjectLiteral;
    }) => {
      let { zencode, keys, data } = params;
      content = rr.combineDataKeys(data, keys);

      if (zencode.match(EXTERNAL_CONNECTION)) {
        externalSourceKeys = zencode.paramsOf(EXTERNAL_CONNECTION);
        checkForDuplicates(externalSourceKeys);
      }

      if (zencode.match(PARALLEL_GET)) {
        for (const [url, i, o] of chunks(zencode.paramsOf(PARALLEL_GET), 3)) {
          parallel_promises.push(axios.get(content[url]));
          parallel_params.push({
            output: o,
            index: i
          });
        }
      }

      if (zencode.match(PARALLEL_POST)) {
        for (const [d, url, i, o] of chunks(zencode.paramsOf(PARALLEL_POST), 4)) {
          parallel_promises.push(axios.post(content[url], content[d]));
          parallel_params.push({
            output: o,
            index: i,
          });
        }
      }

      if (parallel_promises.length) {
        const parallel_results = await axios.all(parallel_promises);
        parallel_results.map((r, i) => {
          const { output, index } = parallel_params[i];
          if (!data.hasOwnProperty(output)) {
            data[output] = {};
          }
          data[output][index] = r.data;
        })
      }


      if (zencode.match(POST_AND_SAVE_TO_VARIABLE)) {
        for (const [url, postData, variable] of chunks(
          zencode.paramsOf(POST_AND_SAVE_TO_VARIABLE),
          3
        )) {
          try {
            const r = await axios.post(content[url], content[postData], {
              httpsAgent: new https.Agent({ rejectUnauthorized: false }),
            });
            data[variable] = r.data;
          } catch (e) {
            throw new Error(
              `[HTTP] Error when getting from endpoint "${content[url]}": ${e}`
            );
          }
        }
      }

      if (zencode.match(EXTERNAL_OUTPUT)) {
        const allExternalOutputs = zencode.paramsOf(EXTERNAL_OUTPUT);
        checkEndpointDefined(externalSourceKeys);

        //join the two values in each EXTERNAL_OUTPUT
        let externalOutputs = [];
        for (var i = 0; i < allExternalOutputs.length; i += 2) {
          externalOutputs.push({
            urlKey: allExternalOutputs[i],
            outputName: allExternalOutputs[i + 1],
          });
        }

        // Check that endpoints have been defined in zencode, keys, or data
        runChecks(externalOutputs, externalSourceKeys, content);

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
            throw new Error(
              `Error when getting from endpoint "${content[output.urlKey]
              }": ${e}`
            );
          }
        }
      }

      if (zencode.match(PASS_OUTPUT)) {
        // run checks ACTION PASS_OUTPUT endpoints have been defined in zencode, keys, or data
        const allPassOutputs = zencode
          .paramsOf(PASS_OUTPUT)
          .map((urlKey: string) => {
            return { urlKey };
          });
        runChecks(allPassOutputs, externalSourceKeys, content);
      }
    }
  );

  rr.onSuccess(async (params) => {
    const { result, zencode } = params;
    if (zencode.match(PASS_OUTPUT)) {
      const allPassOutputs = zencode.paramsOf(PASS_OUTPUT);
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
