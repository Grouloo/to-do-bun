import { Database } from "bun:sqlite"; 

const db = new Database("database.sqlite");

db.run(`
  DROP TABLE IF EXISTS tasks;
  CREATE TABLE tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    priority TEXT NOT NULL,
    status TEXT NOT NULL,
    createdAt TEXT NOT NULL
  );
`);

// console.log("Database successfully initialized");
