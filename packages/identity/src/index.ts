import { Restroom } from "@restroom-mw/core";
import { ObjectLiteral } from "@restroom-mw/types";
import { Zencode } from "@restroom-mw/zencode";
import { NextFunction, Request, Response } from "express";
import axios from "axios";
import { Action } from "./actions";

export default (req: Request, res: Response, next: NextFunction) => {
  const rr = new Restroom(req, res);
  let content: ObjectLiteral = {};
  let promises: Promise<any>[] = [];
  let outputs: string[] = [];

  rr.onBefore(
    async (params: {
      zencode: Zencode;
      keys: ObjectLiteral;
      data: ObjectLiteral;
    }) => {
      let { zencode, keys, data } = params;
      content = rr.combineDataKeys(data, keys);

      if (zencode.match(Action.RESOLVE_DID)) {
        for (let [did, urlName, o] of zencode.chunkedParamsOf(Action.RESOLVE_DID, 3)) {
          let check_url : URL;
          let url_resolver : URL;
          try {
            check_url = new URL(content[urlName]);
          } catch (err) {
            throw new Error("The string " + content[urlName] + " is an invalid URL");
          }
          try{
            url_resolver = new URL(check_url.toString() + "/" + content[did]);
          } catch(err){
            throw new Error("The string " + content[did] + " is an invalid URL");
          }
          promises.push(axios.get(url_resolver.toString()));
          outputs.push(o);
        }
      }
      if(promises.length){
        const result = await Promise.all(promises);
        result.map((r, i) => {
          const out = outputs[i];
          data[out] = r.data;
        });
      }
    }
  )
  next();
}
