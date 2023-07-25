import { Restroom } from "@restroom-mw/core";
import { ObjectLiteral } from "@restroom-mw/types";
import { Zencode } from "@restroom-mw/zencode";
import axios, { AxiosRequestConfig } from "axios";
import { NextFunction, Request, Response } from "express";
import https from "https";
import { Action } from "./actions";
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
  let parallel_params: { output: string; index: [string , number]}[] = [];
  let parallel_promises: Promise<any>[] = [];

  // function genericGet(url: string, ind: [string, number], o: string, headers?: Record<string, string>){
  //   let opts: AxiosRequestConfig = { validateStatus: () => true }
  //   if(headers){
  //     opts.headers = headers
  //   }
  //   parallel_promises.push(axios.get(url, opts));
  //   parallel_params.push({
  //     output: o,
  //     index: ind,
  //   });
  // }

  function genericGet(url: string, ind: [string, number], o: string, headers?: Record<string, string>){
    genericRequest(ind, o, {url, method: "get"}, headers);
  }

  function genericPost(url: string, ind: [string, number], o: string, data: any, headers?: Record<string, string>){
    genericRequest(ind, o, {url, data, method: "post"}, headers);
  }

  function genericRequest(ind: [string, number], o: string, req: Record<string, string>, headers?: Record<string, string>){
    let opts: AxiosRequestConfig = { validateStatus: () => true };
    if(headers){
      opts.headers = headers;
    }
    parallel_promises.push(axios({...req, ...opts}));
    parallel_params.push({
      output: o,
      index: ind,
    });
  }

  rr.onBefore(
    async (params: {
      zencode: Zencode;
      keys: ObjectLiteral;
      data: ObjectLiteral;
    }) => {
      let { zencode, keys, data } = params;
      content = rr.combineDataKeys(data, keys);

      if (zencode.match(Action.READ_REQUEST)) {
        const httpRequest = {
          base_url: req.baseUrl,
          http_version: req.httpVersion,
          headers: req.headers,
          path: req.path,
          method: req.method,
          protocol: req.protocol,
          socket: {
            local_port: req.socket.localPort,
            local_address: req.socket.localAddress,
            remote_port: req.socket.remotePort,
            remote_family: req.socket.remoteFamily,
            remote_address: req.socket.remoteAddress,
          },
        }

        data.http_request = httpRequest;
      }

      if (zencode.match(Action.EXTERNAL_CONNECTION)) {
        externalSourceKeys = zencode.paramsOf(Action.EXTERNAL_CONNECTION);
        checkForDuplicates(externalSourceKeys);
      }

      if (zencode.match(Action.PARALLEL_GET_ARRAY)) {
        for (const [urlsName, i, o] of chunks(zencode.paramsOf(Action.PARALLEL_GET_ARRAY), 3)) {
          const urls = content[urlsName]
          for(let j = 0; j < urls.length; j++) {
            genericGet(urls[j], [i, j], o);
          }
        }
      }
      if (zencode.match(Action.PARALLEL_GET_ARRAY_HEADER)) {
        for (const [urlsName, i, o, headerName] of chunks(zencode.paramsOf(Action.PARALLEL_GET_ARRAY_HEADER), 4)) {
          const urls = content[urlsName];
          const header = content[headerName];
          if(Array.isArray(header)) {
            if(urls.length === header.length){
              for(let j = 0; j < urls.length; j++) {
                genericGet(urls[j], [i, j], o, header[j]);
              }
            } else {
              throw new Error(`[HTTP] different length of arrays ${urlsName} and ${headerName}`);
            }
          } else if (header.constructor === Object){
            for(let j = 0; j < urls.length; j++) {
              genericGet(urls[j], [i, j], o, header);
            }
          } else{
            throw new Error(`[HTTP] unrecognised instance of ${headerName}`);
          }
        }
      }

      if (zencode.match(Action.PARALLEL_GET)) {
        for (const [url, i, o] of chunks(zencode.paramsOf(Action.PARALLEL_GET), 3)) {
          genericGet(content[url], [i, -1], o);
        }
      }

      if (zencode.match(Action.PARALLEL_GET_HEADER)) {
        for (const [url, i, o, header] of chunks(zencode.paramsOf(Action.PARALLEL_GET_HEADER), 4)) {
          genericGet(content[url], [i, -1], o, content[header]);
        }
      }

      if (zencode.match(Action.PARALLEL_POST_ARRAY_WITHIN)) {
        for (const [d, urlsName, i, o] of chunks(zencode.paramsOf(Action.PARALLEL_POST_ARRAY_WITHIN), 4)) {
          const urls = content[urlsName]
          for(let j = 0; j < urls.length; j++) {
            genericPost(urls[j], [i,j], o, content[d]);
          }
        }
      }

      if (zencode.match(Action.PARALLEL_POST_ARRAY_WITHIN_HEADER)) {
        for (const [d, urlsName, i, o, headerName] of chunks(zencode.paramsOf(Action.PARALLEL_POST_ARRAY_WITHIN_HEADER), 5)) {
          const urls = content[urlsName]
          const header = content[headerName]
          for(let j = 0; j < urls.length; j++) {
            if(Array.isArray(header)) {
              if(urls.length === header.length){
                for(let j = 0; j < urls.length; j++) {
                  genericPost(urls[j], [i,j], o, content[d], header[j]);
                }
              } else {
                throw new Error(`[HTTP] different length of arrays ${urlsName} and ${headerName}`);
              }
            } else if (header.constructor === Object){
              for(let j = 0; j < urls.length; j++) {
                genericPost(urls[j], [i,j], o, content[d], header);
              }
            } else{
              throw new Error(`[HTTP] unrecognised instance of ${headerName}`);
            }
          }
        }
      }

      if (zencode.match(Action.PARALLEL_POST_ARRAY)) {
        for (const [d, urlsName, i] of chunks(zencode.paramsOf(Action.PARALLEL_POST_ARRAY), 3)) {
          const urls = content[urlsName]
          for(let j = 0; j < urls.length; j++) {
            genericPost(urls[j], [i,j], null, content[d]);
          }
        }
      }

      if (zencode.match(Action.PARALLEL_POST_ARRAY_HEADER)) {
        for (const [d, urlsName, i, headerName] of chunks(zencode.paramsOf(Action.PARALLEL_POST_ARRAY_HEADER), 4)) {
          const urls = content[urlsName]
          const header = content[headerName]
          for(let j = 0; j < urls.length; j++) {
            if(Array.isArray(header)) {
              if(urls.length === header.length){
                for(let j = 0; j < urls.length; j++) {
                  genericPost(urls[j], [i,j], null, content[d], header[j]);
                }
              } else {
                throw new Error(`[HTTP] different length of arrays ${urlsName} and ${headerName}`);
              }
            } else if (header.constructor === Object){
              for(let j = 0; j < urls.length; j++) {
                genericPost(urls[j], [i,j], null, content[d], header);
              }
            } else{
              throw new Error(`[HTTP] unrecognised instance of ${headerName}`);
            }
          }
        }
      }

      if (zencode.match(Action.PARALLEL_POST_ARRAY_DIFFERENT_DATA)) {
        for (const [dataName, urlsName, i] of chunks(zencode.paramsOf(Action.PARALLEL_POST_ARRAY_DIFFERENT_DATA), 3)) {
          const urls = content[urlsName];
          const data = content[dataName];
          for(let j = 0; j < urls.length; j++) {
            genericPost(urls[j], [i,j], null, data[j]);
          }
        }
      }

      if (zencode.match(Action.PARALLEL_POST_ARRAY_DIFFERENT_DATA_HEADER)) {
        for (const [dataName, urlsName, i, headerName] of chunks(zencode.paramsOf(Action.PARALLEL_POST_ARRAY_DIFFERENT_DATA_HEADER), 4)) {
          const urls = content[urlsName];
          const data = content[dataName];
          const header = content[headerName];
          for(let j = 0; j < urls.length; j++) {
            if(Array.isArray(header)) {
              if(urls.length === header.length){
                for(let j = 0; j < urls.length; j++) {
                  genericPost(urls[j], [i,j], null, data[j], header[j]);
                }
              } else {
                throw new Error(`[HTTP] different length of arrays ${urlsName} and ${headerName}`);
              }
            } else if (header.constructor === Object){
              for(let j = 0; j < urls.length; j++) {
                genericPost(urls[j], [i,j], null, data[j], header);
              }
            } else{
              throw new Error(`[HTTP] unrecognised instance of ${headerName}`);
            }
          }
        }
      }

      if (zencode.match(Action.PARALLEL_POST_HEADER)) {
        for (const [d, url, i, o, header] of chunks(zencode.paramsOf(Action.PARALLEL_POST_HEADER), 5)) {
          genericPost(content[url], [i,-1], o, d, content[header]);
        }
      }

      if (zencode.match(Action.PARALLEL_POST)) {
        for (const [d, url, i, o] of chunks(zencode.paramsOf(Action.PARALLEL_POST), 4)) {
          genericPost(url, [i,-1], o, d);
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

      if (zencode.match(Action.POST_AND_SAVE_TO_VARIABLE)) {
        for (const [url, postData, variable] of chunks(
          zencode.paramsOf(Action.POST_AND_SAVE_TO_VARIABLE),
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

      if (zencode.match(Action.EXTERNAL_OUTPUT)) {
        const allExternalOutputs = zencode.paramsOf(Action.EXTERNAL_OUTPUT);
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

      if (zencode.match(Action.PASS_OUTPUT)) {
        // run checks ACTION PASS_OUTPUT endpoints have been defined in zencode, keys, or data
        const allPassOutputs = zencode
          .paramsOf(Action.PASS_OUTPUT)
          .map((urlKey: string) => {
            return { urlKey };
          });
        runChecks(allPassOutputs, externalSourceKeys, content);
      }
    }
  );

  rr.onSuccess(async (params) => {
    const { result, zencode } = params;
    if (zencode.match(Action.PASS_OUTPUT)) {
      const allPassOutputs = zencode.paramsOf(Action.PASS_OUTPUT);
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
