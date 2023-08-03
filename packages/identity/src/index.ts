import { Restroom } from "@restroom-mw/core";
import { ObjectLiteral } from "@restroom-mw/types";
import { Zencode } from "@restroom-mw/zencode";
import { NextFunction, Request, Response } from "express";
import axios from "axios";
import { Action } from "./actions";
import { url } from "inspector";

export default (req: Request, res: Response, next: NextFunction) => {
  const rr = new Restroom(req, res);
  let content: ObjectLiteral = {};

  rr.onBefore(
    async (params: {
      zencode: Zencode;
      keys: ObjectLiteral;
      data: ObjectLiteral;
    }) => {
      let { zencode, keys, data } = params;
      content = rr.combineDataKeys(data, keys);

      if (zencode.match(Action.RESOLVE_DID)) {
        let [did, urlName, o] = zencode.paramsOf(Action.RESOLVE_DID);
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
        const response = await axios.get(url_resolver.toString());
        data[o] = response.data;
      }
    }
  )
  next();
}
