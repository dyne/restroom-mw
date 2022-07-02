import swaggerUi from "swagger-ui-express";
import { MiddlewareUIOption, OpenAPI } from "./interfaces";
import { generate } from "./openapi";
import { Request, Response, NextFunction } from "express";
import { HTTP_PORT, HTTPS_PORT, HOST } from "@restroom-mw/utils";

export default (options: MiddlewareUIOption) => {
  options.customCss = `
    .swagger-ui .topbar a img {
      content: url(https://dev.zenroom.org/_media/images/zenroom_logo.png);
   }
   .swagger-ui .topbar { background-color: #dedede }
   .swagger-ui h1:before { content: "# " }
   .swagger-ui h1 {
      font-size: 14px;
      margin: 0 0;
      font-style: italic;
      color: #444;
      font-weight: 100;
    }
    .swagger-ui .renderedMarkdown p { margin: 10px 0px; font-weight: 400 }
  `;
  return [
    async (
      req: Request & { swaggerDoc: OpenAPI },
      res: Response,
      next: NextFunction
    ) => {
      try {
        const rootPath = req.params.root
          ? `${options.path}${req.params.root}/`
          : options.path;
        const rootPrefix = req.params.root ? `${req.params.root}/` : "";
        const swaggerDoc = await generate(
          rootPath,
          options.isDataPublic,
          rootPrefix,
          options.withOutPort
        );
        // The port of the server could have changed
        const httpPort = parseInt(process.env.HTTP_PORT, 10) || HTTP_PORT;
        const httpsPort = parseInt(process.env.HTTPS_PORT, 10) || HTTPS_PORT;
        swaggerDoc.servers[0].variables.port.enum = [httpPort, httpsPort];
        swaggerDoc.servers[0].variables.port.default =
          options.defaultPort || httpsPort;
        swaggerDoc.servers[0].variables.protocol.default =
          options.defaultProtocol || "https";
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
