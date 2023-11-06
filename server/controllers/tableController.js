const fs = require("fs");
const databaseDir = "./database/";

module.exports = {
  createTable: (req, res) => {
    const { dbName, tableName, tableStructure } = req.body;
    const dbPath = `${databaseDir}${dbName}.json`;
    const database = JSON.parse(fs.readFileSync(dbPath, "utf8"));
    database.tables.push({ name: tableName, structure: tableStructure });
    fs.writeFileSync(dbPath, JSON.stringify(database));
    res.json({ message: "Table created successfully" });
  },
  dropTable: (req, res) => {
    const { dbName, tableName } = req.body;
    console.log(dbName);
    const dbPath = `${databaseDir}${dbName}.json`;
    const database = JSON.parse(fs.readFileSync(dbPath, "utf8"));
    const tableIndex = database.tables.findIndex(
      (table) => table.name === tableName
    );
    if (tableIndex !== -1) {
      database.tables.splice(tableIndex, 1);
      fs.writeFileSync(dbPath, JSON.stringify(database));
      res.json({ message: "Table dropped successfully" });
    } else {
      res.status(404).json({ error: "Table not found" });
    }
  },
  insertRecord: (req, res) => {
    const { dbName, tableName, primaryKey, attributes } = req.body;
    const dbPath = `${databaseDir}${dbName}.json`;

    try {
      // Read the existing data from the database file
      const database = JSON.parse(fs.readFileSync(dbPath, "utf8"));

      // Check if the specified table exists in the database
      if (!database.tables) {
        res.status(404).json({ error: "No tables found in the database" });
        return;
      }

      const targetTable = database.tables.find(
        (table) => table.name === tableName
      );

      if (!targetTable) {
        res.status(404).json({ error: "Table not found" });
        return;
      }

      // Create a new record by concatenating attributes
      const record = `${primaryKey}:${attributes}`;

      // Initialize a new key-value store for the table if it doesn't exist
      if (!targetTable.keyValueStore) {
        targetTable.keyValueStore = {};
      }

      // Insert the record into the key-value store of the table
      targetTable.keyValueStore[primaryKey] = record;

      // Write the updated database back to the file
      fs.writeFileSync(dbPath, JSON.stringify(database));

      res.json({ message: "Record inserted successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ error: "An error occurred while inserting the record" });
    }
  },
  deleteRecord: (req, res) => {
    const { dbName, tableName, primaryKey } = req.body;
    const dbPath = `${databaseDir}${dbName}.json`;
    console.log(dbName,tableName,primaryKey);

    try {
      // Read the existing data from the database file
      const database = JSON.parse(fs.readFileSync(dbPath, "utf8"));

      // Check if the specified table exists in the database
      if (!database.tables) {
        res.status(404).json({ error: "No tables found in the database" });
        return;
      }

      const targetTable = database.tables.find(
        (table) => table.name === tableName
      );

      if (!targetTable) {
        res.status(404).json({ error: "Table not found" });
        return;
      }

      // Check if the record with the specified primaryKey exists in the keyValueStore
      if (
        !targetTable.keyValueStore ||
        !targetTable.keyValueStore[primaryKey]
      ) {
        res.status(404).json({ error: "Record not found in the table" });
        return;
      }

      // Delete the record from the keyValueStore of the table
      delete targetTable.keyValueStore[primaryKey];

      // Write the updated database back to the file
      fs.writeFileSync(dbPath, JSON.stringify(database));

      res.json({ message: "Record deleted successfully" });
    } catch (error) {
      res
        .status(500)
        .json({ error: "An error occurred while deleting the record" });
    }
  },
};
