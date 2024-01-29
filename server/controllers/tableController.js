const express = require("express");
const router = express.Router();
const fs = require("fs");
const databaseDir = "./database/";

router.post("/create", (req, res) => {
  const { dbName, tableName, tableStructure, foreignKeys, uniqueKeys } =
    req.body;
  console.log(dbName, tableName, tableStructure, foreignKeys, uniqueKeys);
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

    // Check if the target tables of foreign keys exist
    for (const foreignKey of foreignKeys) {
      const targetTableExists = database.tables.some(
        (table) => table.name === foreignKey.targetTable
      );

      if (!targetTableExists) {
        res.status(400).json({
          error: `Target table '${foreignKey.targetTable}' does not exist for foreign key '${foreignKey.columnName}'`,
        });
        return;
      }

      // Set the hasForeignKey attribute for the parent table
      const parentTable = database.tables.find(
        (table) => table.name === foreignKey.targetTable
      );
      if (parentTable) {
        if (!parentTable.hasForeignKey) {
          parentTable.hasForeignKey = [];
        }
        parentTable.hasForeignKey.push(tableName);
      }
    }

    // Add the new table to the database
    const newTable = {
      name: tableName,
      structure: tableStructure,
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
  console.log(dbName, tableName);
  const dbPath = `${databaseDir}${dbName}.json`;
  const database = JSON.parse(fs.readFileSync(dbPath, "utf8"));
  const tableIndex = database.tables.findIndex(
    (table) => table.name === tableName
  );

  if (tableIndex !== -1) {
    const table = database.tables[tableIndex];

    const hasForeignKeyReference = database.tables.some((otherTable) =>
      otherTable.foreignKeys.some(
        (foreignKey) => foreignKey.targetTable === tableName
      )
    );

    if (hasForeignKeyReference) {
      return res.status(400).json({
        error: "Cannot drop table with existing foreign key references",
      });
    }
    for (const foreignKey of table.foreignKeys) {
      const targetTable = database.tables.find(
        (otherTable) => otherTable.name === foreignKey.targetTable
      );
      if (targetTable) {
        targetTable.hasForeignKey = targetTable.hasForeignKey.filter(
          (refTable) => refTable !== tableName
        );
      }
    }
    // Remove the table from the database
    database.tables.splice(tableIndex, 1);
    fs.writeFileSync(dbPath, JSON.stringify(database));
    res.json({ message: "Table dropped successfully" });
  } else {
    res.status(404).json({ error: "Table not found" });
  }
});

module.exports = router;
