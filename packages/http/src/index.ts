import { Restroom } from "@restroom-mw/core";
import { ObjectLiteral } from "@restroom-mw/types";
import { Zencode } from "@restroom-mw/zencode";
import axios from "axios";
import { NextFunction, Request, Response } from "express";
import https from "https";
import {
  EXTERNAL_CONNECTION,
  EXTERNAL_OUTPUT,
  PARALLEL_GET,
  PARALLEL_GET_ARRAY,
  PARALLEL_POST,
  PARALLEL_POST_ARRAY_WITHIN,
  PARALLEL_POST_ARRAY,
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
  const rr = new Restroom(req, res, [EXTERNAL_CONNECTION,
    EXTERNAL_OUTPUT,
    PARALLEL_GET,
    PARALLEL_GET_ARRAY,
    PARALLEL_POST,
    PARALLEL_POST_ARRAY_WITHIN,
    PARALLEL_POST_ARRAY,
    PASS_OUTPUT,
    POST_AND_SAVE_TO_VARIABLE]);
  let content: ObjectLiteral = {};
  let externalSourceKeys: string[] = [];
  let parallel_params: { output: string; index: [string , number]}[] = [];
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

      if (zencode.match(PARALLEL_GET_ARRAY)) {
        for (const [urlsName, i, o] of chunks(zencode.paramsOf(PARALLEL_GET_ARRAY), 3)) {
          const urls = content[urlsName]
          for(let j = 0; j < urls.length; j++) {
            parallel_promises.push(axios.get(urls[j], { validateStatus: () => true }));
            parallel_params.push({
              output: o,
              index: [i, j],
            });
          }
        }
      }

      if (zencode.match(PARALLEL_GET)) {
        for (const [url, i, o] of chunks(zencode.paramsOf(PARALLEL_GET), 3)) {
          parallel_promises.push(axios.get(content[url], { validateStatus: () => true }));
          parallel_params.push({
            output: o,
            index: [i, -1],
          });
        }
      }

      if (zencode.match(PARALLEL_POST_ARRAY_WITHIN)) {
        for (const [d, urlsName, i, o] of chunks(zencode.paramsOf(PARALLEL_POST_ARRAY_WITHIN), 4)) {
          const urls = content[urlsName]
          for(let j = 0; j < urls.length; j++) {
            parallel_promises.push(axios.post(urls[j], content[d], { validateStatus: () => true }));
            parallel_params.push({
              output: o,
              index: [i, j],
            });
          }
        }
      }

      if (zencode.match(PARALLEL_POST_ARRAY)) {
        for (const [d, urlsName, i] of chunks(zencode.paramsOf(PARALLEL_POST_ARRAY), 3)) {
          const urls = content[urlsName]
          for(let j = 0; j < urls.length; j++) {
            parallel_promises.push(axios.post(urls[j], content[d], { validateStatus: () => true }))
            parallel_params.push({
              output: null,
              index: [i, j],
            });
          }
        }
      }

      if (zencode.match(PARALLEL_POST)) {
        for (const [d, url, i, o] of chunks(
          zencode.paramsOf(PARALLEL_POST),
          4
        )) {
          parallel_promises.push(axios.post(content[url], content[d]));
          parallel_params.push({
            output: o,
            index: [i, -1],
          });
        }
      }

      if (parallel_promises.length) {
        let errors: { [key: number]: any} = {};
        const parallel_with_catch = parallel_promises.map((v, i) => v.catch(
          (e) => errors[i] = e
        ))
        const parallel_results = await axios.all(parallel_with_catch)
        parallel_results.map((r, i) => {
          const { output, index } = parallel_params[i];
          if (output && !data.hasOwnProperty(output)) {
            data[output] = {};
          }
          const outputData = output ? data[output] : data;
          const zenResult = errors[i]
            ? { "status": errors[i].code, "result": "" }
            : { "status": r.status, "result": r.data || ""}
          if(index[1] < 0) {
            outputData[index[0]] = zenResult;
          } else {
            if(!outputData[index[0]])
              outputData[index[0]] = []
            outputData[index[0]][index[1]] = zenResult
          }
        });
      }

      if (zencode.match(POST_AND_SAVE_TO_VARIABLE)) {
        for (const [url, postData, variable] of chunks(
          zencode.paramsOf(POST_AND_SAVE_TO_VARIABLE),
          3
        )) {
          let error: any = null;
          const r = await axios.post(content[url], content[postData], {
            httpsAgent: new https.Agent({ rejectUnauthorized: false }),
            validateStatus: () => true
          }).catch((e) => error = e);
          const zenResult = error
            ? { "status": error.code, "result": "" }
            : { "status": r.status, "result": r.data || "" }
          data[variable] = zenResult;
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
            let error: any = null;
            const url = content[output.urlKey];
            const agent = new https.Agent({
              rejectUnauthorized: false,
            });
            // make the api call with the keys key value url
            const response = await axios.get(url, { httpsAgent: agent, validateStatus: () => true })
              .catch( (e) => error = e);
            //Check that response object does not contain boolean values
            typeof response.data === "object" &&
              checkForNestedBoolean(response.data);
            const zenResult = error
              ? { "status": error.code, "result": "" }
              : { "status": response.status, "result": response.data || "" }
            data[output.outputName] = zenResult;
          } catch (e) {
            throw new Error(
              `Error when getting from endpoint "${
                content[output.urlKey]
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
            await axios.post(url, r);
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
