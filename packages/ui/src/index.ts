import swaggerUi from "swagger-ui-express";
import { MiddlewareUIOption, OpenAPI } from "./interfaces";
import { generate } from "./openapi";
import { Request, Response, NextFunction } from "express";
import { HTTP_PORT, HTTPS_PORT } from "@restroom-mw/utils";

const options = {
  customCss: `.swagger-ui .topbar a img {
    content: url(https://dev.zenroom.org/_media/images/zenroom_logo.png);
 } .swagger-ui .topbar { background-color: #dedede }`,
};

export default (options: MiddlewareUIOption) => {
  const rootPath = options.path;
  return [
    async (
      req: { hostname: any; swaggerDoc: OpenAPI },
      res: Response,
      next: NextFunction
    ) => {
      try {
        const swaggerDoc = await generate(rootPath);
        swaggerDoc.servers[0].variables.host = { default: req.hostname };
        // The port of the server could have changed
        const httpPort = parseInt(process.env.HTTP_PORT) || HTTP_PORT
        const httpsPort = parseInt(process.env.HTTPS_PORT) || HTTPS_PORT
        swaggerDoc.servers[0].variables.port.enum = [httpPort, httpsPort];
        swaggerDoc.servers[0].variables.port.default = httpPort;
        req.swaggerDoc = swaggerDoc;
        next();
      } catch (e) {
        next(e);
      }
    },
    swaggerUi.serve,
    swaggerUi.setup(null, options),
  ];
};
