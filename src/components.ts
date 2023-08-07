

import * as fs from "fs";
import { createConnection, createTable } from "./db";
import sqlite3 from "sqlite3";

let db: sqlite3.Database;

interface SQLiteMasterRow {
  count: number;
}

export const loadJson = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      const jsonData = fs.readFileSync("db_proxy.json", "utf8");
      const jsonObject = JSON.parse(jsonData);
      Object.keys(jsonObject.Tables).forEach((tableName) => {
        const table = jsonObject.Tables[tableName];
        const TableName = Object.keys(table)[0];
        const TableData = Object.values(table)[0];
        try {
          createTable(TableName, TableData);
        } catch (error) {
          reject(`Error creating table:${TableName}`);
          console.error("Error creating table:", TableName);
        }
      });
      resolve;
    });
  };

  export const getColumnNamesFromRequest = async (
    tableValues: Object
  ): Promise<string[]> => {
    return new Promise<string[]>((resolve, reject) => {
      let myStringArray: string[] = [];
      const updateValues = Object.entries(tableValues).map(([key, value]) => [
        key,
        value,
      ]);
      updateValues.map(([key]) => myStringArray.push(key));
      resolve(myStringArray);
    });
  };
  
  export const getColumnNames = async (tableName: string): Promise<string[]> => {
    return new Promise<string[]>((resolve, reject) => {
      let myStringArray: string[] = [];
      const db = new sqlite3.Database("./db/database.db", async (err) => {
        if (err) {
          console.error("Error opening database:", err.message);
        } else {
          console.log("Database connected successfully");
          const query = `PRAGMA table_info(${tableName})`;
          await db.all(query, [], (err: any, rows: Object[]) => {
            if (err) {
              console.error("Error fetching data:", err.message);
            } else {
              rows.forEach((row) => {
                const obj = row as {
                  cid: number;
                  name: string;
                  type: string;
                  notnull: number;
                  dflt_value: number;
                  pk: number;
                };
                myStringArray.push(obj["name"]);
              });
              resolve(myStringArray);
            }
          });
        }
        db.close()
      });
    });
  };
  
  export async function checkIfTableExists(tableName: string): Promise<boolean> {
    const query = `SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name=?`;
    return new Promise(async (resolve, reject) => {
      const db = await createConnection();
      db.exec("BEGIN")
      db.all(query, [tableName], async (err: any, row: [SQLiteMasterRow]) => {
        if (err) {
          reject(err);
        } else {
          const countValue = row[0]?.count ?? 0;
          const tableExists = countValue > 0;
          db.exec("COMMIT")
          await db.close();
          resolve(tableExists);
        }
      });
    });
  }
  
  export async function compareArraysinTable(
    tableColumns: string[],
    requestColumns: string[]
  ): Promise<string[]> {
    tableColumns.forEach((value, index) => {
      tableColumns[index] = value.toLowerCase();
    });
    requestColumns.forEach((value, index) => {
      requestColumns[index] = value.toLowerCase();
    });
  
    const missingValues: string[] = [];
  
    requestColumns.forEach((value) => {
      if (!tableColumns.includes(value)) {
        missingValues.push(value);
      }
    });
  
    return missingValues;
  }
  

  interface SQLiteMasterValue {
    exists: number;
  }
  
  export async function checkIfValueExists(
    tableName: string,
    idValue: string
  ): Promise<boolean> {
    const existsQuery = `
    SELECT EXISTS (SELECT 1 FROM ${tableName} WHERE id = ?) AS "exists"
  `;
  
    return new Promise(async (resolve, reject) => {
      const db = createConnection();
      (await db).all(
        existsQuery,
        [idValue],
        (err: any, row: [SQLiteMasterValue]) => {
          if (err) {
            reject(err);
          } else {
            const countValue = row[0]?.exists ?? 0;
            const tableExists = countValue > 0;
            resolve(tableExists);
          }
        }
      );
    });
  }