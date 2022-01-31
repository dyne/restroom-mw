import * as redis from 'redis'
import { Restroom } from "@restroom-mw/core";
import { NextFunction, Request, Response } from "express";
import { Zencode } from "@restroom-mw/zencode";

/**
 * **CONNECT** `have a redis connection on {}`
 *
 * **WRITE_WITH_KEY** `write data into redis under the key {}`
 *
 * **READ_WITH_KEY** `read from redis the data under the key {} and save the output into {}";`
 *
 * @constant
 * @default
 */
const actions = {
  CONNECT: "have a redis connection on {}",
  WRITE_WITH_KEY: "write data into redis under the key {}",
  READ: `read from redis the data under the key {} and save the output into {}`,
};

export default (req: Request, res: Response, next: NextFunction) => {
  const rr = new Restroom(req, res);
  let client: any;

  rr.onBefore(async (params: any) => {
    let { zencode, data } = params;

    const namedParamsOf = (sid: string) => {
      if (!zencode.match(sid)) return [];
      const params = zencode.paramsOf(sid);
      return params.reduce((acc: string[], p: string) => {
        acc.push(data[p] || p);
        return acc;
      }, []);
    };

    if (zencode.match(actions.CONNECT)) {
      const [url] = zencode.paramsOf(actions.CONNECT);
      client = await redis.createClient(url);
      await client.connect();
    }

    if (zencode.match(actions.READ)) {
      const [key, outputVariable] = namedParamsOf(actions.READ);
      data[outputVariable] = await client.get(key);
    }
  });

  rr.onSuccess(async (args: { result: any; zencode: any; }) => {
    const { result, zencode } = args;

    if (zencode.match(actions.WRITE_WITH_KEY)) {
      const [key] = zencode.paramsOf(actions.WRITE_WITH_KEY);
      await client.set(key, JSON.stringify(result));
    }
  });

  rr.onFinish(async (params: any) => {
    if (client) {
      await client.quit();
    }
  })

  next();
};
