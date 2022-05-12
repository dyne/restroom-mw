import { ObjectLiteral } from "@restroom-mw/types";
import { EXTERNAL_CONNECTION } from "./actions";

const checkForNestedBoolean = (obj: any) => {
  function recurse(obj: ObjectLiteral, current: string) {
    for (const key in obj) {
      let value = obj[key];
      if (value != undefined) {
        if (value && typeof value === "object") {
          recurse(value, key);
        }
        /*else {
          if (typeof value === "boolean") {
            throw new Error(`[HTTP]
                      Boolean values are not permitted. Response JSON has property "${key}" with a boolean value.
                      Please use, for example, 0 and 1`);
          }
        }*/
      }
    }
  }
  recurse(obj, null);
};


const runChecks = (
  endpoints: any[],
  externalSourceKeys: string | any[],
  content: ObjectLiteral
) => {
  const contentKeys = Object.keys(content);
  endpoints.forEach((endpoint: { urlKey: string }) => {
    //Check that all endpoints (urlKeys) have been defined using statement EXTERNAL_CONNECTION
    if (externalSourceKeys.includes(endpoint.urlKey) === false) {
      console.log(
        "FAILED CHECK: endpoint has not been defined in zencode: " +
        endpoint.urlKey
      );
      throw new Error(`[HTTP]
              Endpoint "${endpoint.urlKey}" has not been defined in zencode, please define it with
              the following zencode sentence "${EXTERNAL_CONNECTION}"`);
    }

    // check that all endpoints (urlKeys) are properties in either data or keys
    if (contentKeys) {
      if (contentKeys.includes(endpoint.urlKey) === false) {
        console.log(
          "FAILED CHECK: not defined in keys or files. Throwing error for files: " +
          endpoint.urlKey
        );
        throw new Error(`[HTTP]
                Endpoint "${endpoint.urlKey}" has not been defined in keys or data.`);
      }
    }
  });
};

const checkForDuplicates = (externalSourceKeys: string[]) => {
  const duplicateFound =
    new Set(externalSourceKeys).size !== externalSourceKeys.length;
  if (duplicateFound) {
    throw new Error(`[HTTP]
          Found a duplicate. Please ensure there are no duplicates
          when defining endpoints in "${EXTERNAL_CONNECTION}"`);
  }
}

const checkEndpointDefined = (externalSourceKeys: string[]) => {
  if (!externalSourceKeys.length)
    throw new Error(`[HTTP]
            Endpoints are missing, please define them with the
            following zencode sentence "${EXTERNAL_CONNECTION}"`);
}

function* chunks(arr: string[], n: number) {
  for (let i = 0; i < arr.length; i += n) {
    yield arr.slice(i, i + n);
  }
}

export { checkForNestedBoolean, runChecks, checkForDuplicates, checkEndpointDefined, chunks };
