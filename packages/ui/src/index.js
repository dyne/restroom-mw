import swaggerUi from "swagger-ui-express";
import { generate } from "./openapi";

const options = {
  customCss: `.swagger-ui .topbar a img {
    content: url(https://dev.zenroom.org/_media/images/zenroom_logo.png);
 } .swagger-ui .topbar { background-color: #dedede }`,
};

export default [
  (req, res, next) => {
    const swaggerDoc = generate();
    swaggerDoc.servers[0].variables.host = { default: req.hostname };
    req.swaggerDoc = swaggerDoc;
    next();
  },
  swaggerUi.serve,
  swaggerUi.setup(null, options),
];
