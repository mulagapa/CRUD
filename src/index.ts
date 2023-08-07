import express, { Application, NextFunction, Request, Response } from "express";
import { createConnection, createTable } from "./db";
import routes from "./routes";
import * as fs from "fs";
import { Server } from "http";
import { loadJson } from "./components";

const app: Application = express();
const port = 7889;
let server: Server

app.use("/", routes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something broke!" });
});

try {
  server = app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
    loadJson()
      .then(() => {
        console.log("Tables from db_proxy have been created successfully");
      })
      .catch(() => {
        console.error("Error in creating tables from db_proxy");
      });
  });
} catch (error) {
  console.error("Error starting the server:", error);
}


process.on("SIGINT", () => {
  console.log("SIGINT signal received. Closing the server...");
  server.close(() => {
    console.log("Server is closed.");
    process.exit(0);
  });
})

export default app;
