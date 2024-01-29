const express = require("express");
const router = express.Router();
const { connectToDatabase, getDbClient } = require("../connection");
const { getTableInfo } = require("../controllers/lab2");
const { ListCollectionsCursor } = require("mongodb");
const path = require("path");
const fs = require("fs");

router.post("/create", async (req, res) => {
  try {
    const { dbName, tableName, indexName, columns } = req.body;
    // Fetch table information
    const tableInfo = getTableInfo(dbName, tableName);

    const validColumns = columns.filter((col) =>
      tableInfo.structure.some(
        (tableCol) => tableCol.name === col && tableCol.isUnique
      )
    );
    const isAnyFieldUnique = validColumns.length > 0;

    // Update table information with the new index information
    const updatedTableInfo = {
      ...tableInfo,
      indexes: [
        ...(tableInfo.indexes || []), // Add existing indexes
        {
          name: indexName,
          columns: columns,
          unique: isAnyFieldUnique,
        },
      ],
    };

    // Update the table information in the metadata
    updateTableInfo(dbName, tableName, updatedTableInfo);

    res.status(201).json({ message: "Index created successfully" });
  } catch (error) {
    console.error("Error creating index:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.post("/delete/:dbName/:tableName/:indexName", async (req, res) => {
  try {
    const { dbName, tableName, indexName } = req.params;
    // Fetch table information
    const tableInfo = getTableInfo(dbName, tableName);

    // Remove the specified index information from the table's metadata
    const updatedTableInfo = {
      ...tableInfo,
      indexes: (tableInfo.indexes || []).filter(
        (index) => index.name !== indexName
      ),
    };

    // Update the table information in the metadata
    updateTableInfo(dbName, tableName, updatedTableInfo);

    res.json({ message: "Index deleted successfully" });
  } catch (error) {
    console.error("Error deleting index:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

function updateTableInfo(dbName, tableName, updatedTableInfo) {
  currdir = __dirname;
  pardir = path.join(currdir, "..");
  dbpath = dbName + ".json";
  filePath = path.join(pardir, "database", dbpath);

  const fileData = fs.readFileSync(filePath, "utf8");
  const metadata = JSON.parse(fileData);

  // Update the specific table information
  metadata.tables = metadata.tables.map((table) => {
    if (table.name === tableName) {
      return updatedTableInfo;
    }
    return table;
  });

  // Write the updated metadata back to the file
  fs.writeFileSync(filePath, JSON.stringify(metadata, null, 2), "utf8");
}

module.exports = router;
