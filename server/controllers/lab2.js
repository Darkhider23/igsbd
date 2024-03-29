const { MongoClient } = require("mongodb");
const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const fs = require("fs");
const app = express();
const path = require("path");
const fsPromises = require("fs").promises;
const { getDbClient } = require("../connection");

const models = {};

function getTableInfo(databaseName, tableName) {
  currfolder = __dirname;

  const parentfolder = path.join(currfolder, "..");
  databaseName = databaseName + ".json";
  const metadataFilePath = path.join(parentfolder, "/database/", databaseName);
  console.log(metadataFilePath);

  try {
    const metadata = JSON.parse(fs.readFileSync(metadataFilePath, "utf8"));

    const tableInfo = metadata.tables.find((table) => table.name === tableName);

    if (!tableInfo) {
      throw new Error(`Table '${tableName}' not found in the metadata.`);
    }

    return tableInfo;
  } catch (error) {
    console.error("Error reading metadata:", error.message);
    throw new Error("Failed to read metadata.");
  }
}

const createModel = (database, tableName) => {
  const modelName = `${tableName}`;

  // Check if the model already exists
  if (models[modelName]) {
    return models[modelName];
  }

  // Create a collection with the specified name
  const YourModel = database.collection(modelName);

  models[modelName] = YourModel; // Corrected this line to store the model
  return YourModel;
};

router.post("/insert/:databaseName/:tableName", async (req, res) => {
  try {
    const { databaseName, tableName } = req.params;

    const dbClient = await getDbClient();

    const targetDb = dbClient.db(databaseName);

    const YourModel = createModel(targetDb, tableName);

    const record = req.body;

    const tableInfo = getTableInfo(databaseName, tableName);
    const recordKeys = Object.keys(record);
    const primaryKey = recordKeys[0];
    const primaryKeyValue = record[primaryKey];

    const document = {
      _id: primaryKeyValue,
      values: recordKeys
        .slice(1)
        .map((key) => record[key])
        .join(","),
    };

    const existingRecord = await YourModel.findOne({ _id: primaryKeyValue });

    if (existingRecord) {
      console.error(
        "Error in insertRecord:",
        "This primary key combination already exists"
      );
      res
        .status(400)
        .json({ error: "This primary key combination already exists" });
      return;
    }

    const result = await YourModel.insertOne(document);

    const tableMetadata = getTableInfo(databaseName, tableName);

    for (const index of tableMetadata.indexes || []) {
      const indexName = index.name;
      const indexColumns = index.columns;

      // Create a collection for each index if it doesn't exist
      const indexCollection = createModel(targetDb, indexName);

      // Construct the key for the index collection
      const indexKey = indexColumns
        .map((columnName) => record[columnName])
        .join("$");

      // Check if the index is unique
      const isUnique = index.unique;

      // Check if the value already exists in the index collection
      const existingRecord = await indexCollection.findOne({ _id: indexKey }); // Use 'id' instead of 'key'

      // Handle based on uniqueness

      if (existingRecord) {
        if (isUnique) {
          console.log(
            "Error in insertRecord:",
            "This unique index combination already exists"
          );
        } else {
          // If it's not unique, concatenate the old value with the new one
          const oldValue = existingRecord.value;
          const newValue = primaryKeyValue;
          const updatedValue = `${oldValue}$${newValue}`;

          // Update the existing entry with the concatenated value
          await indexCollection.updateOne(
            { _id: indexKey },
            { $set: { value: updatedValue } }
          );
        }
      } else {
        await indexCollection.insertOne({
          _id: indexKey, 
          value: primaryKeyValue,
        });
      }
    }

    res.json(result);
  } catch (error) {
    console.error("Error in insertRecord:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// Delete API endpoint
router.post(
  "/delete/:databaseName/:tableName/:primaryKey",
  async (req, res) => {
    try {
      const { databaseName, tableName, primaryKey } = req.params;
      const dbClient = getDbClient();
      const targetDb = dbClient.db(databaseName);
      const YourModel = createModel(targetDb, tableName);

      // Find the record to be deleted
      const recordToDelete = await YourModel.findOne({ _id: primaryKey });

      // Check if the record exists
      if (!recordToDelete) {
        return res.status(404).json({ error: "Record not found" });
      }

      // Delete the record
      const result = await YourModel.deleteOne({ _id: primaryKey });

      // Check if the record was deleted
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Record not found" });
      }

      res.json({
        message: "Record deleted successfully",
      });
    } catch (error) {
      console.error("Error in deleteRecord:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

// Get Metadata API endpoint
router.get("/metadata/:databaseName/:tableName", (req, res) => {
  try {
    const { databaseName, tableName } = req.params;
    const metadataPath = `./database/${databaseName}.json`;

    // Read metadata from the file
    const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));

    // Find the specified table in the metadata
    console.log(metadata);
    const tableInfo = metadata.tables.find((table) => table.name === tableName);

    if (!tableInfo) {
      console.error(
        `Table '${tableName}' not found in the metadata of '${databaseName}'.`
      );
      res
        .status(404)
        .json({ error: `Table '${tableName}' not found in the metadata.` });
      return;
    }

    res.json(tableInfo);
  } catch (error) {
    console.error("Error in getMetadata:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

router.post("/delete-entries/:indexName/:indexKey", async (req, res) => {
  const { indexName, indexKey } = req.params;
  currfolder = __dirname;

  const parentfolder = path.join(currfolder, "..");
  try {
    // Read the index file
    const indexPath = path.join(parentfolder, `/database/${indexName}.json`);
    console.log(indexPath);
    const indexData = await fsPromises.readFile(indexPath, "utf8");
    const { isUnique, fields } = JSON.parse(indexData);

    // Find and remove the entry with the provided key
    const updatedFields = fields.filter((entry) => entry.key !== indexKey);

    // Update the index file with the modified entries
    await fsPromises.writeFile(
      indexPath,
      JSON.stringify({ isUnique, fields: updatedFields }),
      "utf8"
    );

    res.json({ message: "Index entries deleted successfully" });
  } catch (error) {
    console.error("Error deleting index entries:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = { router, getTableInfo };
