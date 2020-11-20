import { DataTypes, Model, Sequelize } from "sequelize";
import { Restroom } from "@restroom-mw/core";
import { Request, Response, NextFunction } from "express";

class Result extends Model {
  public result: string;
}

/**
 * **CONNECT** `I have a database connection named {}`
 *
 * **SAVE** `save the result into the database`
 *
 * **SAVE_WITH_TABLENAME**: `save the result into the database within the table {}`
 * @constant
 * @default
 */
const ACTIONS = {
  CONNECT: "I have a database connection named {}",
  SAVE: "save the result into the database",
  SAVE_WITH_TABLENAME: "save the result into the database within the table {}",
};

export default (req: Request, res: Response, next: NextFunction) => {
  try {
    const rr = new Restroom(req, res);
    let dbUrl: string;

    rr.onBefore(async (params) => {
      const { zencode, data } = params;
      if (zencode.match(ACTIONS.CONNECT)) {
        const [connection_name] = zencode.paramsOf(ACTIONS.CONNECT);
        dbUrl = data[connection_name];
      }
    });

    rr.onSuccess(async (args) => {
      const { result, zencode } = args;

      if (zencode.match(ACTIONS.SAVE)) {
        try {
          const db = new Sequelize(dbUrl);
          Result.init(
            { result: DataTypes.TEXT },
            { tableName: "results", sequelize: db }
          );
          await Result.sync();
          await Result.create({ result: result });
        } catch (e) {
          throw e;
        }
      }

      if (zencode.match(ACTIONS.SAVE_WITH_TABLENAME)) {
        try {
          const db = new Sequelize(dbUrl);
          const [table_name] = zencode.paramsOf(ACTIONS.SAVE_WITH_TABLENAME);
          Result.init(
            { result: DataTypes.TEXT },
            { tableName: table_name, freezeTableName: true, sequelize: db }
          );
          await Result.create({ result });
        } catch (e) {
          throw e;
        }
      }
    });
    next();
  } catch (e) {
    next(e);
  }
};
