const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

router.post("/create", (req, res) => {
  const { dbName, tableName, conditions } = req.body;
  const currfolder = __dirname;
  const parentfolder = path.join(currfolder, "..");
  const dbPath = path.join(parentfolder, "database", `${dbName}.json`);
  const database = JSON.parse(fs.readFileSync(dbPath, "utf8"));

  // Create indexes for each column mentioned in conditions
  createIndexesForConditions(database, tableName, conditions);

  // Compare conditions with index files
  const results = compareConditionsWithIndex(database, tableName, conditions);

  res.json({ results });
});

function createIndexesForConditions(database, tableName, conditions) {
  const table = database.tables.find((table) => table.name === tableName);

  if (table && table.indexes && conditions) {
    conditions.forEach((condition) => {
      const columnName = condition.column;
      const column = table.structure.find((col) => col.name === columnName);
      currfolder = __dirname;
      parfolder = path.join(currfolder, "..");
      if (column) {
        const indexName = `${tableName}_${columnName}`;
        const indexPath = path.join(parfolder, "database", `${indexName}.json`);
        console.log(indexName);
        if (!fs.existsSync(indexPath)) {
          fs.writeFileSync(
            indexPath,
            JSON.stringify({ isUnique: column.isUnique, fields: [] })
          );
        }
      }
    });
  }
}

function compareConditionsWithIndex(database, tableName, conditions) {
  const table = database.tables.find((table) => table.name === tableName);
  let results = [];

  if (table && table.indexes && conditions) {
    conditions.forEach((condition) => {
      const columnName = condition.column;
      const indexName = `${tableName}_${columnName}`;
      const indexPath = path.join(__dirname, "databases", `${indexName}.json`);

      if (fs.existsSync(indexPath)) {
        const indexData = JSON.parse(fs.readFileSync(indexPath, "utf8"));

        indexData.fields.forEach((field) => {
          const fieldKeyValues = field.key.split("$");
          const primaryKeyValues = fieldKeyValues.map((key) => {
            const conditionForField = conditions.find(
              (cond) => cond.column == key
            );
            return conditionForField ? conditionForField.value : null;
          });

          // Instead of pushing the whole entry, push the primary keys
          results.push(primaryKeyValues);
        });
      }
    });
  }

  return results;
}

module.exports = router;
