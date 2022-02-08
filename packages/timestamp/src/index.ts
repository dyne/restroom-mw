import { Restroom } from "@restroom-mw/core";
import { NextFunction, Request, Response } from "express";
import { Zencode } from "@restroom-mw/zencode";

/**
 * **TIMESTAMP** `fetch the local timestamp and store it into {}`
 *
 * @constant
 * @default
 */
const actions = {
  TIMESTAMP: "have a redis connection on {}",
};

export default (req: Request, res: Response, next: NextFunction) => {
  const rr = new Restroom(req, res);

  rr.onBefore(async (params: any) => {
    const { data, zencode } = params;

    if (zencode.match(actions.TIMESTAMP)) {
      const [out] = zencode.paramsOf(actions.TIMESTAMP);
      data[out] = new Date().getTime();
    }
  });

  next();
};
