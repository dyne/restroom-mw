import swaggerUi, { SwaggerUiOptions } from "swagger-ui-express";
import { MiddlewareUIOption, OpenAPI } from "./interfaces";
import { generate } from "./openapi";
import { Request, Response, NextFunction } from "express";
import { HTTP_PORT, HTTPS_PORT } from "@restroom-mw/utils";

export default (options: MiddlewareUIOption) => {
  options.customCss = `
    .swagger-ui .topbar a img {
      content: url(https://dev.zenroom.org/_media/images/zenroom_logo.png);
   }
   .swagger-ui .topbar { background-color: #dedede }
   .swagger-ui h1 {
      font-size: 1.0em;
      margin: 0.67em 0;
      font-style: italic;
      color: gray;
      font-weight: 100;
    }
  `
  return [
    async (
      req: Request & {swaggerDoc: OpenAPI},
      res: Response,
      next: NextFunction
    ) => {
      try {
        options.path = req.params.root? options.path :  `${options.path}${req.params.root}/`
        const swaggerDoc = await generate(options.path, options.isDataPublic);
        swaggerDoc.servers[0].variables.host = { default: req.hostname };
        // The port of the server could have changed
        const httpPort = parseInt(process.env.HTTP_PORT) || HTTP_PORT
        const httpsPort = parseInt(process.env.HTTPS_PORT) || HTTPS_PORT
        swaggerDoc.servers[0].variables.port.enum = [httpPort, httpsPort];
        swaggerDoc.servers[0].variables.port.default = options.defaultPort || httpPort;
        swaggerDoc.servers[0].variables.protocol.default = options.defaultProtocol || 'https';
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
