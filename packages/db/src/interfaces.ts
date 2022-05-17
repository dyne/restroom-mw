export interface QueryGetRecord {
  id: string;
  table: string;
  database: string;
  varName: string;
}

export interface QuerySaveOutput {
  table: string;
  database: string;
}

export interface QuerySaveVar {
  varName: string;
  database: string;
  table: string;
}
