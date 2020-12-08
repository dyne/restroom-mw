import { DataTypes, Model, Sequelize } from "sequelize";
import { Restroom } from "@restroom-mw/core";
import { Request, Response, NextFunction } from "express";

class Result extends Model {
  public result: string;
}

const ACTIONS = {
  GET_URI_KEYS: "have a database uri named {}",
  GET_TABLE_KEYS: "have a database table named {}",
  GET_RECORD:
    "read the record {} of the table {} of the database {} and save the result into {}", //done
  SAVE_OUTPUT: "save the output into the database {} into the table {}",
  SAVE_VAR: "save the {} into the database {} into the table {}",
};

const parse = (o: string) => {
  try {
    return JSON.parse(o);
  } catch (e) {
    throw new Error(`[DATABASE]
      Error in JSON format "${o}"`);
  }
};

interface ObjectLiteral {
  [key: string]: any;
}

interface QueryGetRecord {
  id: string;
  table: string;
  database: string;
  varName: string;
}

interface QuerySaveOutput {
  table: string;
  database: string;
}

interface QuerySaveVar {
  varName: string;
  database: string;
  table: string;
}

export default (req: Request, res: Response, next: NextFunction) => {
  try {
    const rr = new Restroom(req, res);

    let keysContent;
    let dataContent;
    let content: ObjectLiteral = {};
    let contentKeys: string[];
    let dbUriKeys: string[] = [];
    let tableKeys: string[] = [];

    rr.onBefore(async (params) => {
      const { zencode, keys, data } = params;

      if (zencode.match(ACTIONS.GET_URI_KEYS)) {
        dbUriKeys = zencode.paramsOf(ACTIONS.GET_URI_KEYS);
      }

      if (zencode.match(ACTIONS.GET_TABLE_KEYS)) {
        tableKeys = zencode.paramsOf(ACTIONS.GET_TABLE_KEYS);
      }

      if (zencode.match(ACTIONS.GET_RECORD)) {
        const dbAllRecordData: string[] = zencode.paramsOf(ACTIONS.GET_RECORD);
        keysContent =
          typeof keys === "undefined"
            ? {}
            : keys && typeof keys === "object"
            ? keys
            : parse(keys);
        dataContent =
          typeof data === "undefined"
            ? {}
            : data && typeof data === "object"
            ? data
            : parse(data);
        content = { ...dataContent, ...keysContent };
        contentKeys = Object.keys(content);
        //create object(s) with the FOUR values of each GET_RECORD
        const dbQueries: QueryGetRecord[] = [];
        for (var i = 0; i < dbAllRecordData.length; i += 4) {
          dbQueries.push({
            id: dbAllRecordData[i],
            table: dbAllRecordData[i + 1],
            database: dbAllRecordData[i + 2],
            varName: dbAllRecordData[i + 3],
          });
        }
        runChecks(dbQueries, dbUriKeys, contentKeys, "database");
        runChecks(dbQueries, tableKeys, contentKeys, "table");
        try {
          for (const query of dbQueries) {
            const db = new Sequelize(content[query.database]);
            Result.init(
              { result: DataTypes.TEXT },
              {
                tableName: content[query.table],
                freezeTableName: true,
                sequelize: db,
              }
            );
            await Result.sync();
            try {
              let result = await Result.findByPk(query.id);
              if (result) {
                result = result.get({ plain: true });
                // column name is result
                const resultData =
                  typeof result["result"] === "object"
                    ? result["result"]
                    : parse(result["result"]);
                checkForNestedBoolean(resultData);
                data[query.varName] = resultData;
              } else {
                throw new Error(`[DATABASE]
                      Returned null for id "${query.id}" in table "${query.table}" in db "${query.database}".`);
              }
            } catch (e) {
              throw new Error(`[DATABASE]
                      Something went wrong for id "${query.id}" in table "${query.table}" in db "${query.database}".`);
            }
            db.close();
          }
        } catch (e) {
          throw new Error(`[DATABASE]
          Databse error: ${e}`);
        }
      }
    });

    rr.onSuccess(async (args: { result: any; zencode: any }) => {
      const { result, zencode } = args;

      if (zencode.match(ACTIONS.SAVE_OUTPUT)) {
        const dbAllSaveOutput: string[] = zencode.paramsOf(ACTIONS.SAVE_OUTPUT);
        const dbQueries: QuerySaveOutput[] = [];
        //create object(s) with the TWO values in each GET_RECORD
        for (var i = 0; i < dbAllSaveOutput.length; i += 2) {
          dbQueries.push({
            database: dbAllSaveOutput[i],
            table: dbAllSaveOutput[i + 1],
          });
        }
        //check that table and db are defined in keys or data, and in zencode
        runChecks(dbQueries, dbUriKeys, contentKeys, "database");
        runChecks(dbQueries, tableKeys, contentKeys, "table");
        try {
          for (const query of dbQueries) {
            const db = new Sequelize(content[query.database]);
            Result.init(
              { result: DataTypes.TEXT },
              {
                tableName: content[query.table],
                freezeTableName: true,
                sequelize: db,
              }
            );
            await Result.sync();
            try {
              //column name must be result
              await Result.create({ result: JSON.stringify(result) });
            } catch (e) {
              throw new Error(`[DATABASE]
                    Error in table "${query.table}" in db "${query.database}": ${e}`);
            }
            db.close();
          }
        } catch (e) {
          throw new Error(`[DATABASE]
            Databse error: ${e}`);
        }
      }

      if (zencode.match(ACTIONS.SAVE_VAR)) {
        const resultObj: any =
          typeof result === "object" ? result : parse(result);
        const dbAllSaveVar: string[] = zencode.paramsOf(ACTIONS.SAVE_VAR);
        const dbQueries: QuerySaveVar[] = [];
        //create object(s) with the THREE values in each GET_RECORD
        for (var i = 0; i < dbAllSaveVar.length; i += 3) {
          dbQueries.push({
            varName: dbAllSaveVar[i],
            database: dbAllSaveVar[i + 1],
            table: dbAllSaveVar[i + 2],
          });
        }
        //check that table and db are defined in keys or data and in zencode
        runChecks(dbQueries, dbUriKeys, contentKeys, "database");
        runChecks(dbQueries, tableKeys, contentKeys, "table");
        try {
          for (const query of dbQueries) {
            if (!resultObj[query.varName])
              throw new Error(`[DATABASE]
                    Saving Error: Couldn't find variable "${query.varName}" in result.`);

            const db = new Sequelize(content[query.database]);
            Result.init(
              { result: DataTypes.TEXT },
              {
                tableName: content[query.table],
                freezeTableName: true,
                sequelize: db,
              }
            );
            await Result.sync();
            try {
              //column name must be result
              await Result.create({
                result: JSON.stringify({
                  [query.varName]: resultObj[query.varName],
                }),
              });
            } catch (e) {
              throw new Error(`[DATABASE]
                    Error in table "${query.table}" in db "${query.database}": ${e}`);
            }
            db.close();
          }
        } catch (e) {
          throw new Error(`[DATABASE]
            Databse error: ${e}`);
        }
      }
    });
    next();
  } catch (e) {
    next(e);
  }
};

const runChecks = (
  keys: any[],
  actionKeys: string | any[],
  contentKeys: string | any[],
  keyName: string
) => {
  keys.forEach((key: any) => {
    //Check that all enpoints (urlKeys) have been defined using statement EXTERNAL_CONNECTION
    if (actionKeys.includes(key[keyName]) === false) {
      throw new Error(`[DATABASE]
              Error: "${key[keyName]}" has not been defined in zencode, please define it with
              the following zencode sentence "${ACTIONS.GET_URI_KEYS}" or "${ACTIONS.GET_TABLE_KEYS}" `);
    }

    // check that all endpoints (urlKeys) are properties in either data or keys
    if (contentKeys.includes(key[keyName]) === false) {
      throw new Error(`[DATABASE]
              Endpoint "${key[keyName]}" has not been defined in keys or data.`);
    }
  });
};

const checkForNestedBoolean = (obj: any) => {
  const res = {};
  function recurse(obj: { [x: string]: any }, current: string) {
    for (const key in obj) {
      let value = obj[key];
      if (value != undefined) {
        if (value && typeof value === "object") {
          recurse(value, key);
        } else {
          if (typeof value === "boolean") {
            throw new Error(`[HTTP]
                      Boolean values are not permitted. Response JSON has property "${key}" with a boolean value. 
                      Please use, for example, 0 and 1`);
          }
        }
      }
    }
  }
  recurse(obj, null);
};
