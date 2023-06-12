import { Restroom } from "@restroom-mw/core";
import { NextFunction, Request, Response } from "express";

/**
 * **TIMESTAMP** `fetch the local timestamp and store it into {}`
 *
 * @constant
 * @default
 */
const actions = {
  TIMESTAMP: "fetch the local timestamp and store it into {}",
};

export default (req: Request, res: Response, next: NextFunction) => {
  const rr = new Restroom(req, res, Object.values(actions));

  rr.onBefore(async (params: any) => {
    let { data, zencode } = params;

    if (zencode.match(actions.TIMESTAMP)) {
      const [out] = zencode.paramsOf(actions.TIMESTAMP);
      data[out] = new Date().getTime().toString();
    }
  });

  next();
};
