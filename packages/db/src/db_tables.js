import { Sequelize } from "sequelize";
import { Restroom } from "@restroom-mw/core";


const ACTIONS = {
  GET_URI: "I have a database uri named {}",
  GET_TABLE: "I have a database table named {}",
  SAVE: "save the result into the database {} into the table {}",
};

const parse = (o) => {
  try {
    return JSON.parse(o)
  } catch {
    return o
  }
}

export default async (req, res, next) => {
  const rr = new Restroom(req, res);

  let keysContent;
  let dataContent;
  let dbUris = [];
  let dbTables = [];
  let dbSaves = [];

  rr.onBefore(async (params) => {
    const { zencode, keys, data } = params;
    keysContent = parse(keys);
    dataContent = parse(data);

    if (zencode.match(ACTIONS.GET_URI)) {
      dbUris = zencode.paramsOf(ACTIONS.GET_URI);
    }

    if (zencode.match(ACTIONS.GET_TABLE)) {
      dbTables = zencode.paramsOf(ACTIONS.GET_TABLE);
    }

    if (zencode.match(ACTIONS.SAVE)) {
      dbSaves = zencode.paramsOf(ACTIONS.SAVE);
    }
  });

  rr.onSuccess(async (args) => {
    const { result, zencode } = args;

    for (let i = 0; i < dbSaves.length; i += 2) {
      let dbKey = dbSaves[i];
      let tableKey = dbSaves[i + 1];

      let isDbDefined = dbUris.includes(dbKey);
      let isTableDefined = dbTables.includes(tableKey);

      if (isDbDefined && isTableDefined) {
        //Search for the key in keys and data files
        let dbValue = keysContent[dbKey] || dataContent[dbKey];
        let tableValue = keysContent[tableKey] || dataContent[tableKey];

        if (dbValue && tableValue) {
          try {
            const db = new Sequelize(dbValue);
            const resultTable = db.define(tableValue, { result: Sequelize.TEXT });
            await db.sync();
            await resultTable.create({ result: result });
          } catch {
            // Error handling
          }
        }
      }

    }
  });

  next();
};