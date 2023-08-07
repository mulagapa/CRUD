import { Router, Request, Response } from "express";
import bodyParser from "body-parser";

import {
  addValueToTable,
  addValuesTable,
  deleteTableValue,
  getValueFromTable,
} from "./db";
import express from "express";
import { checkIfTableExists, checkIfValueExists } from "./components";

const router: Router = Router();

router.use(express.json());

//Inserting data into table and adding columns to table if required
router.post("/:data", async (req: Request, res: Response) => {
  const table_name = req.params.data;
  const table_values = req.body;
  if (!table_values || Object.keys(table_values).length === 0) {
    return res.status(500).json({ error: 'Request body is empty cannot create table on empty body' });
  }

  await addValuesTable(table_name, table_values)
    .then((id_value) => {
      res.json({ message: `Values have been added to '${table_name}' with id ${id_value}` });
    })
    .catch((error) => {
      console.error("Error adding values to table:", error);
      res.status(500)
        .json({ message: `Error adding values to table:${table_name}` });
    });
});


//Getting table value based on the table name and id value
router.get("/:data/:id", async (req: Request, res: Response) => {
  const table_name = req.params.data;
  const id = req.params.id;
  if (!(await checkIfTableExists(table_name))) {
    res.status(500).json({ message: `Table ${table_name} doesn't exists` });
  } else if (!(await checkIfValueExists(table_name, id))) {
    res.status(500).json({ message: `Id ${id} doesn't exist` });
  } else {
    getValueFromTable(table_name, id)
      .then((value) => {
        console.log(value);
        res.send(value);
      })
      .catch((error) => {
        console.error("Error getting table:", error);
        res.status(500).json({ message: "Error getting table." });
      });
  }
});

//Updating a particular Id value into the table
router.put("/:data/:id", (req: Request, res: Response) => {
  const table_name = req.params.data;
  const id = req.params.id;
  const updatedItem = req.body;
  if (!updatedItem || Object.keys(updatedItem).length === 0) {
    return res.status(500).json({ error: 'Request body is empty cannot update value' });
  }
  addValueToTable(table_name, id, updatedItem)
    .then(() => {
      res.json({ message: `${id} has been updated to '${table_name}'` });
    })
    .catch((error) => {
      console.error("Error getting table:", error);
      res.status(500).json({ message: "id or table doesn't getting table." });
    });
});

//deleting a id from table
router.delete("/:data/:id", (req: Request, res: Response) => {
  const table_name = req.params.data;
  const table_values = req.params.id;
  deleteTableValue(table_name, table_values)
    .then((didDelete) => {
      if (didDelete)
        res.json({ message: `id '${table_values}' deleted successfully.` });
    })
    .catch((error) => {
      console.error("Error creating table:", error);
      res.status(500).json({ message: "id or table does not exist" });
    });
});

export default router;
