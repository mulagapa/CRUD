import { promises } from "dns";
import { Json } from "sequelize/types/utils";
import sqlite3 from "sqlite3";
import {
  checkIfTableExists,
  checkIfValueExists,
  compareArraysinTable,
  getColumnNames,
  getColumnNamesFromRequest,
} from "./components";
import { RunResult } from "sqlite3";

const db_path = "./db/database.db";

let db: sqlite3.Database;
let data: sqlite3.Database;

interface SQLiteMasterRow {
  count: number;
}

export const createConnection = async () => {
  const db = await new sqlite3.Database(db_path, (err) => {
    if (err) {
      console.error("Error connecting to the database:", err.message);
    } else {
      console.log("Connected to the database.");
    }
  });

  return db;
};

export const createTable = (
  tableName: string,
  tableValues: any
): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    const db = await createConnection();
    let columns = "id INTEGER PRIMARY KEY AUTOINCREMENT,";
    let temp = Object.entries(tableValues)
      .map(([key, value]) => `${key} TEXT`)
      .join(", ");
    columns = columns + temp;
    const createTableQuery = `CREATE TABLE IF NOT EXISTS ${tableName} (${columns})`;

    db.run(createTableQuery, [], async function (err) {
      if (err) {
        console.log("Error creating table", err.message);
        reject(err);
      } else {
        await db.close();
        resolve();
      }
    });
  });
};

export const addValuesTable = async (
  tableName: string,
  tableValues: Object,
): Promise<number> => {
  return new Promise(async (resolve, reject) => {
    if (await checkIfTableExists(tableName)) {
      let tableColumnNames = await getColumnNames(tableName);
      let requestColumnNames = await getColumnNamesFromRequest(tableValues);
      let addingColumns = await compareArraysinTable(
        tableColumnNames,
        requestColumnNames
      );
      if (addingColumns.length > 0) {
        await alterTables(tableName, addingColumns);
      }
      tableColumnNames = await getColumnNames(tableName);
      await setTimeout(() => {},5000)
      const updateValues = Object.entries(tableValues).map(([key, value]) => [
        key,
        value,
      ]);
      const columns = updateValues.map(([key]) => key).join(", ");
      const placeholders = updateValues.map(() => "?").join(", ");
      const values = updateValues.map(([, value]) => value);
      data = await createConnection();
      const insertQuery = `
      INSERT INTO ${tableName} (${columns})
      VALUES (${placeholders})
    `;
      try {
        await data.run(insertQuery, [...values], async function (err) {
          if (err) {
            reject(err);
          } else {
            const insertedId = this.lastID; 
            await data.close();
            console.log("Inserted successfully with ID:", insertedId);
            resolve(insertedId);
          }
        });
      }
      catch(err){
        console.log(err)
      }
    }
    else{
      await setTimeout(() => {},5000)
      await createTable(tableName,tableValues);
      await setTimeout(() => {},5000)
      const updateValues = Object.entries(tableValues).map(([key, value]) => [
        key,
        value,
      ]);
      const columns = updateValues.map(([key]) => key).join(", ");
      const placeholders = updateValues.map(() => "?").join(", ");
      const values = updateValues.map(([, value]) => value);
      data = await createConnection();
      const insertQuery = `
      INSERT INTO ${tableName} (${columns})
      VALUES (${placeholders})
    `;
    try {
      await data.run(insertQuery, [...values], async function (err) {
        if (err) {
          reject(err);
        } else {
          const insertedId = this.lastID; 
          await data.close();
          console.log("Inserted successfully with ID:", insertedId);
          resolve(insertedId);
        }
      });
    }
    catch(err){
      console.log(err)
    }
    }
  });
};

export const alterTables = async (
  tableName: string,
  table_values: string[]
): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    table_values.forEach(async (value) => {
      const db = await new sqlite3.Database("./db/database.db", async (err) => {
        if (err) {
          console.error("Error opening database:", err.message);
        } else {
          const addColumnsQuery = `ALTER TABLE ${tableName} ADD COLUMN ${value} TEXT`;
          try {
            await db.exec(addColumnsQuery, function (err) {
              if (err) {
                reject(err);
              }
            });
          } catch (err) {
            console.log("Error Altering the table");
          }
          await db.close();
        }
      });
    });
    resolve(true);
  });
};

export const getValueFromTable = (
  tableName: string,
  idValue: string
): Promise<Object | null> => {
  return new Promise(async (resolve, reject) => {
    console.log(tableName, idValue);
    const db = await createConnection();
    const getQuery = `SELECT * FROM ${tableName} WHERE id = ${idValue}`;
    db.all(getQuery, [], function (err: any, value: [Object]) {
      if (err) {
        console.log("Error inserting into table", err.message);
        reject(err);
      } else {
        console.log("values have been inserted into table");
        const resp = value[0] ? value[0] : null;
        resolve(resp);
      }
    });
    db.close();
  });
};

export const addValueToTable = (
  tableName: string,
  idValue: string,
  updateItems: Object
): Promise<void> => {
  return new Promise(async (resolve, reject) => {
    console.log(tableName, idValue);
    const updateValues = Object.entries(updateItems).map(([key, value]) => [
      key,
      value,
    ]);
    let tableColumnNames = await getColumnNames(tableName);
    let requestColumnNames = await getColumnNamesFromRequest(updateItems);
    let addingColumns = await compareArraysinTable(
      tableColumnNames,
      requestColumnNames
    );
    if (addingColumns.length > 0) {
      await alterTables(tableName, addingColumns);
    }
    tableColumnNames = await getColumnNames(tableName);
    await setTimeout(() => {},5000)
    const columns = updateValues.map(([key]) => key).join(", ");
    const placeholders = updateValues.map(() => "?").join(", ");
    const values = updateValues.map(([, value]) => value);
    if (await checkIfTableExists(tableName)) {
      if (await checkIfValueExists(tableName, idValue)) {
        const setExpressions = updateValues
          .map(([key]) => `${key} = ?`)
          .join(", ");
        const updateQuery = `
          UPDATE ${tableName}
          SET ${setExpressions}
          WHERE id = ?
        `;
        const db = await createConnection();
        try {
          await db.run(updateQuery, [...values, idValue]);
        } catch (err) {
          console.log("Error updating the table", err);
          reject(err);
        }
        db.close();
        resolve();
      } else {
        await setTimeout(() => {},5000)
        const db = await createConnection();
        const insertQuery = `
      INSERT INTO ${tableName} (${columns}, id)
      VALUES (${placeholders}, ?)
    `;

        try {
          await db.run(insertQuery, [...values, idValue]);
        } catch (err) {
          console.log("Error inserting into table", err);
          reject(err);
        }
        console.log("values have been inserted into table");
        db.close();
        resolve();
      }
    }
    reject("The table doesn't exist");
  });
};

export const deleteTableValue = (
  tableName: string,
  idValue: string
): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    const db = await createConnection();
    if (
      (await checkIfTableExists(tableName)) &&
      (await checkIfValueExists(tableName, idValue))
    ) {
      const deleteQuery = `DELETE FROM ${tableName} WHERE id = ${idValue}`;
      db.all(deleteQuery, [], function (err: any) {
        if (err) {
          console.log("Error deleting from table", err.message);
          reject(err);
        } else {
          console.log("values have been deleted from table");
          resolve(true);
        }
      });
    } else {
      reject();
    }
    db.close();
  });
};
