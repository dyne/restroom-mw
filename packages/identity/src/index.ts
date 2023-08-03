import { Restroom } from "@restroom-mw/core";
import { ObjectLiteral } from "@restroom-mw/types";
import { Zencode } from "@restroom-mw/zencode";
import { NextFunction, Request, Response } from "express";
import axios from "axios";
import { Action } from "./actions";

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
        let url = content[urlName]
        if( url[-1] !== "/") {
          url = url + "/";
        }
        const url_resolver = url + content[did];
        const response = await axios.get(url_resolver);
        data[o] = response.data;
      }
    }
  )
  next();
}
