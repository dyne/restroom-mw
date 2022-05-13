import * as redis from "redis";
import { Restroom } from "@restroom-mw/core";
import { NextFunction, Request, Response } from "express";
import { zencodeNamedParamsOf } from "@restroom-mw/utils";

/**
 * **CONNECT** `have a redis connection on {}`
 *
 * **WRITE_WITH_KEY** `write data into redis under the key {}`
 *
 * **READ** `read from redis the data under the key {} and save the output into {}";`
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
  let client: any = null;
  let getRedisClient: () => any;

  rr.onBefore(async (params: any) => {
    let { zencode, data } = params;
    const namedParamsOf = zencodeNamedParamsOf(zencode, data);

    if (zencode.match(actions.CONNECT)) {
      const [url] = zencode.paramsOf(actions.CONNECT);
      getRedisClient = (() => {
        const getRedisClientFromUrl = async () => {
          if (client === null) {
            client = await redis.createClient(url);
            await client.connect();
          }
          return client;
        }
        return getRedisClientFromUrl;
      })()
    }

    if (zencode.match(actions.READ)) {
      client = client || await getRedisClient();
      const [key, outputVariable] = namedParamsOf(actions.READ);
      await client.sendCommand(['SETNX', key, '{}']);
      data[outputVariable] = JSON.parse((await client.get(key)) ?? {});
    }
  });

  rr.onSuccess(async (args: { result: any; zencode: any }) => {
    const { result, zencode } = args;

    if (zencode.match(actions.WRITE_WITH_KEY)) {
      client = client || await getRedisClient();
      const [key] = zencode.paramsOf(actions.WRITE_WITH_KEY);
      await client.set(key, JSON.stringify(result));
    }
  });

  next();
};
