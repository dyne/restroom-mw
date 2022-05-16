import * as redis from "redis";
import { Restroom } from "@restroom-mw/core";
import { NextFunction, Request, Response } from "express";
import { zencodeNamedParamsOf } from "@restroom-mw/utils";

enum Action {
  CONNECT = "have a redis connection on {}",
  SET = "write data into redis under the key {}",
  GET = `read from redis the data under the key {} and save the output into {}`,
  SET_NAMED = "write data into redis under the key named {}",
  GET_NAMED = `read from redis the data under the key named {} and save the output into {}`,
}

export default (req: Request, res: Response, next: NextFunction) => {
  const rr = new Restroom(req, res);
  let client: any = null;
  let getRedisClient: () => any;
  let namedSet: string = null;

  rr.onBefore(async (params: any) => {
    let { zencode, data, keys } = params;
    let content = rr.combineDataKeys(data, keys);
    const namedParamsOf = zencodeNamedParamsOf(zencode, content);

    if (zencode.match(Action.CONNECT)) {
      const [url] = zencode.paramsOf(Action.CONNECT);
      getRedisClient = (() => {
        const getRedisClientFromUrl = async () => {
          if (client === null) {
            client = await redis.createClient(url);
            await client.connect();
          }
          return client;
        };
        return getRedisClientFromUrl;
      })();
    }

    const getFromRedis = async (action: string) => {
      client = client || (await getRedisClient());
      const [key, outputVariable] = namedParamsOf(action);
      console.log(key, outputVariable);
      await client.sendCommand(["SETNX", key, "{}"]);
      data[outputVariable] = JSON.parse((await client.get(key)) ?? {});
    };

    if (zencode.match(Action.GET)) await getFromRedis(Action.GET);
    if (zencode.match(Action.GET_NAMED)) await getFromRedis(Action.GET_NAMED);
    if (zencode.match(Action.SET_NAMED)) {
      const [outputVariable] = namedParamsOf(Action.SET_NAMED);
      namedSet = outputVariable;
    }
  });

  rr.onSuccess(async (args: { result: any; zencode: any }) => {
    const { result, zencode } = args;

    if (zencode.match(Action.SET)) {
      client = client || (await getRedisClient());
      const [key] = zencode.paramsOf(Action.SET);
      await client.set(key, JSON.stringify(result));
    }

    if (zencode.match(Action.SET_NAMED)) {
      client = client || (await getRedisClient());
      await client.set(namedSet, JSON.stringify(result));
    }
  });

  next();
};
