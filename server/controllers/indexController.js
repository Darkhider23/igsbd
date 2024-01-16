const express = require("express");
const router = express.Router();

const { table } = require("console");
const fs = require("fs");
const path = require("path");

const databaseDir = "./database/";

router.post("/create", (req, res) => {
  const { dbName, tableName, indexName, columns } = req.body;
  const dbPath = path.join(databaseDir, `${dbName}.json`);

  try {
    const database = JSON.parse(fs.readFileSync(dbPath, "utf8"));
    const table = database.tables.find((table) => table.name === tableName);

    if (table) {
      if (!table.indexes) {
        table.indexes = [];
      }

      // Check if the index with the same name already exists
      const existingIndex = table.indexes.find(
        (index) => index.name === indexName
      );

      if (existingIndex) {
        console.log(`Index '${indexName}' already exists. Skipping creation.`);
        return res.json({ message: "Index already exists" });
      }

      const uniqueIndex = columns.some((columnName) => {
        const column = table.structure.find((col) => col.name === columnName);
        return column && column.isUnique;
      });

      table.indexes.push({ name: indexName, columns });

      fs.writeFileSync(dbPath, JSON.stringify(database));

      // Update the metadata with the new index information
      const metadataPath = path.join(databaseDir, `${dbName}.json`);
      const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
      const tableMetadata = metadata.tables.find(
        (metaTable) => metaTable.name === tableName
      );

      if (tableMetadata) {
        if (!tableMetadata.indexes) {
          tableMetadata.indexes = [];
        }

        // Check if the index with the same name already exists in metadata
        const existingMetadataIndex = tableMetadata.indexes.find(
          (index) => index.name === indexName
        );

        if (!existingMetadataIndex) {
          tableMetadata.indexes.push({ name: indexName, columns });
          fs.writeFileSync(metadataPath, JSON.stringify(metadata));
        } else {
          console.log(
            `Index '${indexName}' already exists in metadata. Skipping addition.`
          );
        }
      }

      const indexPath = path.join(databaseDir, `${indexName}.json`);
      fs.writeFileSync(
        indexPath,
        JSON.stringify({ isUnique: uniqueIndex, fields: [] })
      );

      res.json({ message: "Index created successfully" });
    } else {
      res.status(404).json({ error: "Table not found" });
    }
  } catch (error) {
    console.error("An error occurred while creating the index:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
router.post("/delete/:dbName/:tableName/:indexName", (req, res) => {
  const { dbName, tableName, indexName } = req.params;
  const dbPath = path.join(databaseDir, `${dbName}.json`);

  try {
    const database = JSON.parse(fs.readFileSync(dbPath, "utf8"));
    const table = database.tables.find((table) => table.name === tableName);

    if (table) {
      if (!table.indexes) {
        table.indexes = [];
      }

      // Find the index by name
      const indexToDeleteIndex = table.indexes.findIndex(
        (index) => index.name === indexName
      );

      if (indexToDeleteIndex !== -1) {
        // Remove the index from the table's indexes array
        table.indexes.splice(indexToDeleteIndex, 1);

        fs.writeFileSync(dbPath, JSON.stringify(database));

        // Update the metadata to remove the index
        const metadataPath = path.join(databaseDir, `${dbName}.json`);
        console.log(metadataPath);
        const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
        const tableMetadata = metadata.tables.find(
          (metaTable) => metaTable.name === tableName
        );

        if (tableMetadata) {
          const metadataIndexToDeleteIndex = tableMetadata.indexes.findIndex(
            (index) => index.name === indexName
          );

          if (metadataIndexToDeleteIndex !== -1) {
            // Remove the index from the metadata's indexes array
            tableMetadata.indexes.splice(metadataIndexToDeleteIndex, 1);
            fs.writeFileSync(metadataPath, JSON.stringify(metadata));
          }
        }

        // Delete the index file (optional)
        const indexPath = path.join(databaseDir, `${indexName}.txt`);
        if (fs.existsSync(indexPath)) {
          fs.unlinkSync(indexPath);
        }

        res.json({ message: `Index '${indexName}' deleted successfully` });
      } else {
        res.status(404).json({
          error: `Index '${indexName}' not found for the table '${tableName}'`,
        });
      }
    } else {
      res.status(404).json({ error: "Table not found" });
    }
  } catch (error) {
    console.error("An error occurred while deleting the index:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
