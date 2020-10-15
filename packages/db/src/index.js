import { Sequelize } from "sequelize";
import { Restroom } from "@restroom-mw/core";

/**
 * **CONNECT** `I have a database connection uri at {}`
 *
 * **SELECT** `I select {} from {} where {}`
 *
 * **SAVE** `save the result into the database`
 * @constant
 * @default
 */
const ACTIONS = {
  CONNECT: "I have a database connection named {}",
  SAVE: "save the result into the database",
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
  });
  next();
};
