import { Restroom } from "@restroom-mw/core";
import { NextFunction, Request, Response } from "express";
import { ObjectLiteral } from "@restroom-mw/types";
import { Zencode } from "@restroom-mw/zencode";
import { InfluxDB } from "@influxdata/influxdb-client";
import { FLUX_CONNECT, FLUX_QUERY, FLUX_QUERY_ARRAY } from "./actions";
import { zencodeNamedParamsOf } from "@restroom-mw/utils";

export default (req: Request, res: Response, next: NextFunction) => {
  const rr = new Restroom(req, res);
  let content: ObjectLiteral = null;
  let client: any = null;

  rr.onBefore(
    async (params: {
      zencode: Zencode;
      keys: ObjectLiteral;
      data: ObjectLiteral;
    }) => {
      let { zencode, keys, data } = params;
      content = rr.combineDataKeys(data, keys);
      const namedParams = zencodeNamedParamsOf(zencode, content);

      if (zencode.match(FLUX_CONNECT)) {
        const connection_string: any = namedParams(FLUX_CONNECT)[0];
        const { url, token } = connection_string;
        client = new InfluxDB({
          url,
          token,
          transportOptions: { rejectUnauthorized: false },
        }).getQueryApi(connection_string.org);
      }

      if (zencode.match(FLUX_QUERY)) {
        if (!client)
          throw new Error("Can't connect to the influxdb address provided");
        const chunks = zencode.chunkedParamsOf(FLUX_QUERY, 2);
        for (let [query, output] of chunks) {
          const q = content[query as string];
          const res: any[] = []
          for await (const {values, tableMeta} of client.iterateRows(q)) {
            res.push(tableMeta.toObject(values));
          }
          data[output as string ] = res;
        }
      }

      if (zencode.match(FLUX_QUERY_ARRAY)) {
        if (!client)
          throw new Error("Can't connect to the influxdb address provided");
        const chunks = zencode.chunkedParamsOf(FLUX_QUERY_ARRAY, 2);
        for (let [queryName, output] of chunks) {
          const queryArray = content[queryName as string];
          const res: any[] = [];
          for (let query of queryArray) {
            for await (const {values, tableMeta} of client.iterateRows(query)) {
              res.push(tableMeta.toObject(values));
            }
          }
          data[output as string ] = res;
        }
      }
    }
  );

  next();
};
