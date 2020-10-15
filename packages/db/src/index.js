import { Sequelize } from "sequelize";
import { Restroom } from "@restroom-mw/core";

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

export default (req, res, next) => {
  const rr = new Restroom(req, res);
  let dbUrl;

  rr.onBefore((params) => {
    const { zencode, data } = params;
    if (zencode.match(ACTIONS.CONNECT)) {
      const [connection_name] = zencode.paramsOf(ACTIONS.CONNECT);
      dbUrl = data[connection_name];
    }
  });

  rr.onSuccess(async (args) => {
    const { result, zencode } = args;

    if (zencode.match(ACTIONS.SAVE)) {
      const db = new Sequelize(dbUrl);
      const resultTable = db.define("results", { result: Sequelize.TEXT });
      await db.sync();
      await resultTable.create({ result });
    }

    if (zencode.match(ACTIONS.SAVE_WITH_TABLENAME)) {
      const db = new Sequelize(dbUrl);
      const [table_name] = zencode.paramsOf(ACTIONS.SAVE_WITH_TABLENAME);
      const resultTable = db.define(
        table_name,
        { result: Sequelize.TEXT },
        { freezeTableName: true }
      );
      await resultTable.create({ result });
    }
  });
  next();
};
