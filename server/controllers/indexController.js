const express = require("express");
const router = express.Router();
const { connectToDatabase, getDbClient } = require("../connection");
const { getTableInfo } = require("../controllers/lab2");
const { ListCollectionsCursor } = require("mongodb");

router.post("/create", async (req, res) => {
  try {
    const { dbName, tableName, indexName, columns } = req.body;

    // Use getDbClient to get the existing client or connect to the database
    const client = await getDbClient();
    const db = client.db(dbName);
    const collection = db.collection(tableName);

    // Fetch table information
    const tableInfo = getTableInfo(dbName, tableName);

    const validColumns = columns.filter((col) =>
      tableInfo.structure.some((tableCol) => tableCol.name === col && tableCol.isUnique)
    );
    const isAnyFieldUnique = validColumns.length > 0;
    // Set options based on uniqueness
    const options = {
      name: indexName,
      unique: isAnyFieldUnique,
    };

    // Using MongoDB's createIndex function
    await collection.createIndex(columns, options);

    res.status(201).json({ message: "Index created successfully" });
  } catch (error) {
    console.error("Error creating index:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
router.post("/delete/:dbName/:tableName/:indexName", async (req, res) => {
  try {
    const { dbURI, dbName, collectionName, indexName } = req.body;

    // Use getDbClient to get the existing client or connect to the database
    const client = await getDbClient();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    // Using MongoDB's dropIndex function
    await collection.dropIndex(indexName);

    res.json({ message: "Index deleted successfully" });
  } catch (error) {
    console.error("Error deleting index:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
