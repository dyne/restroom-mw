import redis from "redis";
import { Restroom } from "@restroom-mw/core";

/**
 * **CONNECT** `I have a valid redis connection on {}`
 *
 * **WRITE** `write all data as a hash into redis`
 *
 * **WRITE_WITH_KEY** `write all data into redis under the key {}`
 *
 * @constant
 * @default
 */
const actions = {
  CONNECT: "I have a valid redis connection on {}",
  WRITE: "write all data as a hash into redis",
  WRITE_WITH_KEY: "write all data into redis under the key {}",
};

export default (req, res, next) => {
  const rr = new Restroom(req, res);
  let client;

  rr.onBefore((zencode) => {
    if (zencode.match(actions.CONNECT)) {
      const [url] = zencode.paramsOf(actions.CONNECT);
      client = redis.createClient(url);
    }
  });

  rr.onAfter((args) => {
    const { result, zencode } = args;
    if (zencode.match(actions.WRITE)) {
      client.hmset(result);
    }

    if (zencode.match(actions.WRITE_WITH_KEY)) {
      const [key] = zencode.paramsOf(actions.WRITE_WITH_KEY);
      client.set(key, JSON.stringify(result));
    }
  });

  next();
};
