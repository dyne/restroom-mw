import swaggerUi from "swagger-ui-express";
import { MiddlewareUIOption, OpenAPI } from "./interfaces";
import { generate } from "./openapi";
import { Request, Response, NextFunction } from "express";

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
