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
  CONNECT: "I have a database connection uri at {}",
  SELECT: "I select {} from {} where {}",
  SAVE: "save the result into the database",
};

export default (req, res, next) => {
  const rr = new Restroom(req, res);
  let dbUrl;

  rr.onBefore((zencode) => {
    if (zencode.match(ACTIONS.CONNECT)) {
      [dbUrl] = zencode.paramsOf(ACTIONS.CONNECT);
    }

    if (zencode.match(ACTIONS.SELECT)) {
      const [selected_value] = zencode.paramsOf(ACTIONS.SELECT);
      rr.setData("selected_value", selected_value);
    }
  });

  rr.onSuccess((args) => {
    const { result, zencode } = args;

    if (zencode.match(ACTIONS.SAVE)) {
      const db = new Sequelize(dbUrl);
      const resultTable = db.define("results", { result: Sequelize.TEXT });
      db.sync().then(() => {
        resultTable.create({ result: result });
      });
    }
  });
  next();
};
