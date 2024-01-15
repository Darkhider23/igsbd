const express = require("express");
const router = express.Router();
const fs = require("fs");
const databaseDir = "./database/";

router.post("/create", (req, res) => {
  const {
    dbName,
    tableName,
    tableStructure,
    primaryKeys,
    foreignKeys,
    uniqueKeys,
  } = req.body;
  console.log(
    dbName,
    tableName,
    tableStructure,
    primaryKeys,
    foreignKeys,
    uniqueKeys,
  );
  const dbPath = `${databaseDir}${dbName}.json`;

  try {
    // Read the existing data from the database file
    const database = JSON.parse(fs.readFileSync(dbPath, "utf8"));

    // Check if the specified table already exists
    const existingTable = database.tables.find(
      (table) => table.name === tableName
    );
    if (existingTable) {
      res
        .status(400)
        .json({ error: "Table with the same name already exists" });
      return;
    }

    // Add the new table to the database
    const newTable = {
      name: tableName,
      structure: tableStructure,
      primaryKeys,
      foreignKeys,
      uniqueKeys,
    };
    database.tables.push(newTable);

    // Write the updated database back to the file
    fs.writeFileSync(dbPath, JSON.stringify(database));

    res.json({ message: "Table created successfully", table: newTable });
  } catch (error) {
    res
      .status(500)
      .json({ error: "An error occurred while creating the table" });
  }
});

router.post("/drop", (req, res) => {
  const { dbName, tableName } = req.body;
  console.log(dbName,tableName);
  const dbPath = `${databaseDir}${dbName}.json`;
  const database = JSON.parse(fs.readFileSync(dbPath, "utf8"));
  const tableIndex = database.tables.find(
    (table) => table.name === tableName
  );
  if (tableIndex !== -1) {
    database.tables.splice(tableIndex, 1);
    fs.writeFileSync(dbPath, JSON.stringify(database));
    res.json({ message: "Table dropped successfully" });
  } else {
    res.status(404).json({ error: "Table not found" });
  }
});

module.exports = router;
