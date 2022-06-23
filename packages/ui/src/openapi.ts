import { HTTP_PORT, HTTPS_PORT, HOST } from "@restroom-mw/utils";
import { ls, nl2br, preserveTabs } from "./utils";
import { Zencode } from "@restroom-mw/zencode";
import { OpenAPI } from "./interfaces";
import { CHAIN_EXTENSION } from "@restroom-mw/utils";

let openapi: OpenAPI = {
  openapi: "3.0.3",
  info: {
    title: "Restroom",
    version: "1.0.0",
    description: `This is a simple API autogenerated from a folder within your server.

To add new endpoints you should add new zencode contracts in the directory.

**NB** The files should be in form of \`endpoint.zen\` then your contract will run on \`/endpoint\`
    `,
    termsOfService: "https://zenroom.org/privacy",
    contact: {
      email: "dev@dyne.org",
    },
    license: {
      name: "GNU Affero General Public License v3.0 or later",
      url: "https://www.gnu.org/licenses/agpl-3.0",
    },
  },
  servers: [
    {
      description: "development local server",
      url: "{protocol}://{host}:{port}/{basePath}",
      variables: {
        port: {
          enum: [HTTP_PORT, HTTPS_PORT],
          default: HTTP_PORT,
        },
        protocol: { enum: ["http", "https"], default: "http" },
        host: { default: HOST },
        basePath: { default: "api" },
      },
    },
  ],
  schemes: ["http"],
  paths: {},
  components:{
    schemas: {}
  },
};

/**
 * Generates an openapi definition out of the contracts in `ZENCODE_DIR`
 * @param {string} rootPath root folder directory to look for the swagger generation
 * @see {@link http://spec.openapis.org/oas/v3.0.3|Openapi Specs}
 */
export const generate = async (rootPath: string, isDataPublic:boolean, rootPrefix:string) => {
  const paths = await ls(rootPath, isDataPublic);
  const mime = ["application/json"];
  const responses = {
    200: {
      description: "Successful Response",
      content: {
        "application/json": {
          schema: {},
        },
      },
    },
    500: {
      description: "Error Response",
      content: {
        "text/plain; charset=utf-8": {
          schema: {},
        },
      },
    },
  };

  openapi.paths = {};
  for (const path in paths) {

    const requestBody = (dataExample:string)=> ({
        content: {
            "application/json": {
                schema: {
                properties: {
                    data: {
                        description: "DATA field",
                        type: "object",
                        example: dataExample
                    },
                    keys: {
                        description: "KEYS field",
                        type: "object",
                    },
                },
                },
            },
        },
    });

    const contract = Zencode.fromPath(paths[path].fullPath);
    const dataExample:string = paths[path].hasData? nl2br(Zencode.fromPath(paths[path].fullPath.split(".")[0] + '.data').content) : '{}';
    const isChain = paths[path].type == 'yml' ? true : false;
    const description = isChain ? nl2br(preserveTabs(contract.content)) : nl2br(contract.content);
    const tag = isChain ? '⛓️ chain of contracts' : `🔖 ${contract.tag}`;
    const exposedPath = isChain ? `${path}.${CHAIN_EXTENSION}` : `${path}`;

    let endpoint = {
      post: {
        summary: contract.summary,
        description: description,
        tags: [`${tag}`],
        consumes: mime,
        produces: mime,
        operationId: `_function_${rootPrefix + exposedPath}_post`,
        requestBody: requestBody(dataExample),
        responses,
      },
    };

    openapi.paths[`/${rootPrefix + exposedPath}`] = endpoint;

  }

  return openapi;
};
