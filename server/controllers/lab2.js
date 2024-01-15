const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const bodyParser = require("body-parser");
const fs = require("fs");
const { table } = require("console");
const app = express();
const port = 3000;
const models = {};
const path = require("path");

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

    return {
      primaryKeys: tableInfo.primaryKeys,
    };
  } catch (error) {
    console.error("Error reading metadata:", error.message);
    throw new Error("Failed to read metadata.");
  }
}

const createModel = (databaseName, tableName) => {
  const modelName = `${databaseName}_${tableName}`;

  // Check if the model already exists
  if (models[modelName]) {
    return models[modelName];
  }

  // Define the schema with 'id' and 'values' fields
  const schema = {
    key: {
      type: String,
      required: true,
      unique: true,
    },
    values: {
      type: String,
      required: true,
    },
  };

  // Create and store the Mongoose model using the defined schema
  const model = {
    YourModel: mongoose.model(modelName, new mongoose.Schema(schema)),
  };

  models[modelName] = model; // Store the model in the models object
  return model;
};

app.use(bodyParser.json());

router.post("/insert/:databaseName/:tableName", async (req, res) => {
  try {
    const { databaseName, tableName } = req.params;
    const { YourModel } = createModel(databaseName, tableName);

    const record = req.body;

    // Extract the primary key columns from the table structure
    const tableInfo = getTableInfo(databaseName, tableName); // Replace with your actual function to get table information
    const primaryKeyColumns = tableInfo.primaryKeys;

    // Extract primary key values from the record and concatenate into 'key'
    const key = primaryKeyColumns.map((column) => record[column]).join(",");

    // Remove the primary key fields from the record
    primaryKeyColumns.forEach((column) => delete record[column]);

    // Generate the concatenated string of values from the remaining fields
    const values = Object.values(record).join(",");

    // Create a new record using the 'key' and 'values' fields
    const result = await YourModel.create({ key, values });
    res.json(result);
  } catch (error) {
    if (error.code === 11000 && error.keyPattern && error.keyPattern.id === 1) {
      // Duplicate key error for primary key
      console.error(
        "Error in insertRecord:",
        "This primary key combination already exists"
      );
      res
        .status(400)
        .json({ error: "This primary key combination already exists" });
    } else {
      console.error("Error in insertRecord:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
});

// Delete API endpoint
router.post(
  "/delete/:databaseName/:tableName/:primaryKey",
  async (req, res) => {
    try {
      const { databaseName, tableName, primaryKey } = req.params;
      const { YourModel } = createModel(databaseName, tableName);
      console.log(req.params);
      // Use primaryKeyToDelete instead of id
      const result = await YourModel.deleteOne({ id: primaryKey });

      // Check if a record was deleted
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Record not found" });
      }

      res.json({ message: "Record deleted successfully" });
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

module.exports = router;
