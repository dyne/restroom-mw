import { DataTypes, Model, Sequelize } from "sequelize";
import { Restroom } from "@restroom-mw/core";
import { Request, Response, NextFunction } from "express";
import { ObjectLiteral } from "@restroom-mw/types";
import { QueryGetRecord, QuerySaveOutput, QuerySaveVar } from "./interfaces";
import { Zencode } from "@restroom-mw/zencode";

class Result extends Model {
  public result: string;
}


/**
 * Available actions for the @restroom-mw/db  database middleware
 *
 * @enum {number}
 */
const enum ACTIONS {
  /**
   * Given I have a database uri named {}
   * @param {string} uri the key of the connection string
   * @example
   *   SQLITE: sqlite://:memory:/ or sqlite:///path/to/database.sqlite
   *   MSSQL: Server=localhost\MSSQLSERVER01;Database=master;Trusted_Connection=True
   *   MYSQL: mysql://root:root@localhost:3306/test
   *   POSTGRES: postgres://postgres:postgres@localhost:5432/test
   *   MARIADB: mariadb://root:root@localhost:3306/test
   *   REDSHIFT: postgres://root:root@localhost:5432/test
   *   SNOWFLAKE: snowflake://root:root@localhost:5432/test
   */
  GET_URI_KEYS = "have a database uri named {}",
  /**
   * Given I have a database table named {}
   * @param {string} key of the table in data/keys
   */
  GET_TABLE_KEYS = "have a database table named {}",
  /**
   * Given I read the record {} of the table {} of the database {} and save the result into {}
   * @param {string} record name of the field (row)
   * @param {string} table keyName of the table
   * @param {string} database keyName of the database
   * @param {string} output the variable to save the output
   */
  GET_RECORD = "read the record {} of the table {} of the database {} and save the result into {}",
  /**
   * Given I execute the SQL statement named {} on the database named {} and save the result into {}
   *
   * @param {string} statement name of the SQL statement
   * @param {string} database keyName of the database
   * @param {string} output the variable to save the output
   */
  EXECUTE_SQL = "execute the SQL statement named {} on the database named {} and save the result into {}",

  /**
   * **TBD**
   * Given I execute the SQL statement named {} pass the parameters named {} on the database named {} and save the result into {}
   *
   * @param {string} statement name of the SQL statement
   * @param {string} parameters name of the parameters
   * @param {string} database keyName of the database
   * @param {string} output the variable to save the output
   */
  EXECUTE_SQL_WITH_PARAMS = "execute the SQL statement named {} pass the parameters named {} on the database named {} and save the result into {}",
  /**
   * Then save the output into the database {} into the table {}
   *
   *
   * @param {string} database keyName of the database
   * @param {string} table keyName of the table
   */
  SAVE_OUTPUT = "save the output into the database {} into the table {}",
  /**
   * Then save the {} into the database {} into the table {}
   *
   * @param {string} output the variable to save the output
   * @param {string} database keyName of the database
   * @param {string} table keyName of the table
   */
  SAVE_VAR = "save the {} into the database {} into the table {}",
};

export default (req: Request, res: Response, next: NextFunction) => {
  try {
    const rr = new Restroom(req, res);
    const parse = (o: string) => rr.safeJSONParse(o, `[DATABASE] Error in JSON format "${o}"`)
    let content: ObjectLiteral = {};
    let contentKeys: string[];
    let dbUriKeys: string[] = [];
    let tableKeys: string[] = [];

    const validate = (queries: any[]) => {
      runChecks(queries, dbUriKeys, contentKeys, "database");
      runChecks(queries, tableKeys, contentKeys, "table");
    }

    rr.onBefore(async (params: { zencode: Zencode, keys: string, data: ObjectLiteral }) => {
      let { zencode, keys, data } = params;
      if (!data) data = {}
      content = rr.combineDataKeys({ ...data }, keys);
      contentKeys = Object.keys(content);

      if (zencode.match(ACTIONS.GET_URI_KEYS)) {
        dbUriKeys = zencode.paramsOf(ACTIONS.GET_URI_KEYS);
      }

      if (zencode.match(ACTIONS.GET_TABLE_KEYS)) {
        tableKeys = zencode.paramsOf(ACTIONS.GET_TABLE_KEYS);
      }

      if (zencode.match(ACTIONS.EXECUTE_SQL)) {
        const promises = zencode.chunkedParamsOf(ACTIONS.EXECUTE_SQL, 3).map(async ([statement, database, output]: [content: string, database: string, output: string]) => {
          const db = new Sequelize(content[database]);
          const t = await db.transaction();
          const [o, m] = await db.query(content[statement], { transaction: t });
          await t.commit();
          data[output] = o ? o : m
        })
        await Promise.all(promises)
      }

      if (zencode.match(ACTIONS.GET_RECORD)) {
        const dbAllRecordData: string[] = zencode.paramsOf(ACTIONS.GET_RECORD);

        // create object(s) with the FOUR values of each GET_RECORD
        const dbQueries: QueryGetRecord[] = [];
        for (let i = 0; i < dbAllRecordData.length; i += 4) {
          dbQueries.push({
            id: dbAllRecordData[i],
            table: dbAllRecordData[i + 1],
            database: dbAllRecordData[i + 2],
            varName: dbAllRecordData[i + 3],
          });
        }
        validate(dbQueries);
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
                const resultData = parse(result.result);
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
          throw new Error(`[DATABASE] Database error: ${e}`);
        }
      }
    });

    rr.onSuccess(async (args: { result: any; zencode: Zencode }) => {
      const { result, zencode } = args;

      if (zencode.match(ACTIONS.SAVE_OUTPUT)) {
        const dbAllSaveOutput: string[] = zencode.paramsOf(ACTIONS.SAVE_OUTPUT);
        const dbQueries: QuerySaveOutput[] = [];
        // create object(s) with the TWO values in each GET_RECORD
        for (let j = 0; j < dbAllSaveOutput.length; j += 2) {
          dbQueries.push({
            database: dbAllSaveOutput[j],
            table: dbAllSaveOutput[j + 1],
          });
        }
        // check that table and db are defined in keys or data, and in zencode
        validate(dbQueries);
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
              // column name must be result
              await Result.create({ result: JSON.stringify(result) });
            } catch (e) {
              throw new Error(`[DATABASE]
                    Error in table "${query.table}" in db "${query.database}": ${e}`);
            }
            db.close();
          }
        } catch (e) {
          throw new Error(`[DATABASE] Database error: ${e}`);
        }
      }

      if (zencode.match(ACTIONS.SAVE_VAR)) {
        const resultObj: any =
          typeof result === "object" ? result : parse(result);
        const dbAllSaveVar: string[] = zencode.paramsOf(ACTIONS.SAVE_VAR);
        const dbQueries: QuerySaveVar[] = [];
        // create object(s) with the THREE values in each GET_RECORD
        for (let i = 0; i < dbAllSaveVar.length; i += 3) {
          dbQueries.push({
            varName: dbAllSaveVar[i],
            database: dbAllSaveVar[i + 1],
            table: dbAllSaveVar[i + 2],
          });
        }
        // check that table and db are defined in keys or data and in zencode
        validate(dbQueries);
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
              // column name must be result
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
          throw new Error(`[DATABASE] Database error: ${e}`);
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
    // Check that all enpoints (urlKeys) have been defined using statement EXTERNAL_CONNECTION
    if (actionKeys.includes(key[keyName]) === false) {
      throw new Error(`[DATABASE]
              Error: "${key[keyName]}" has not been defined in zencode, please define it with
              the following zencode sentence "${ACTIONS.GET_URI_KEYS}" or "${ACTIONS.GET_TABLE_KEYS}" `);
    }

    // check that all endpoints (urlKeys) are properties in either data or keys
    if (contentKeys) {
      if (contentKeys.includes(key[keyName]) === false) {
        throw new Error(`[DATABASE]
                Endpoint "${key[keyName]}" has not been defined in keys or data.`);
      }
    }
  });
};
