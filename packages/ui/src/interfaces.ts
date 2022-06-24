import { SwaggerUiOptions } from "swagger-ui-express";

export interface OpenAPI {
  paths: { [key: string]: any };
  openapi: string;
  info: {
    title: string;
    version: string;
    description: string;
    termsOfService: string;
    contact: {
      email: string;
    };
    license: {
      name: string;
      url: string;
    };
  };
  servers: [
    {
      description: string;
      url: string;
      variables: {
        port: {
          enum: number[];
          default: number;
        };
        protocol: { enum: string[]; default: string };
        host: { default: string };
        basePath: { default: string };
      };
    }
  ];
  schemes: string[];
  components: any;
}

export interface MiddlewareUIOption extends SwaggerUiOptions {
  path: string;
  isDataPublic?: boolean;
  defaultPort?:number;
  withOutPort?:boolean;
  defaultProtocol?:"http"|"https";
}
