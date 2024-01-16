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
const fsPromises = require("fs").promises;

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

  const model = {
    YourModel: mongoose.model(modelName, new mongoose.Schema(schema)),
  };

  models[modelName] = model;
  return model;
};

app.use(bodyParser.json());

router.post("/insert/:databaseName/:tableName", async (req, res) => {
  try {
    const { databaseName, tableName } = req.params;
    const { YourModel } = createModel(databaseName, tableName);

    const record = req.body;

    const tableInfo = getTableInfo(databaseName, tableName);
    const primaryKeyColumns = tableInfo.primaryKeys;

    const indexColumns = tableInfo.indexes || [];

    // Create composite primary key
    const compositePrimaryKeyValues = primaryKeyColumns.map(
      (column) => record[column]
    );
    const primaryKeyIndex = compositePrimaryKeyValues.join("$");
    // Check if the composite primary key combination already exists
    const existingRecord = await YourModel.findOne({
      key: compositePrimaryKeyValues,
    });

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
    let primaryKeyValuesRecord = { ...record };

    // Extract primary key values
    let primaryKeyValues = primaryKeyColumns.map((column) => {
      let value = primaryKeyValuesRecord[column];
      // Remove the primary key field from the temporary object
      delete primaryKeyValuesRecord[column];
      return value;
    });

    // Create values from the remaining fields in the temporary object
    let values = Object.values(primaryKeyValuesRecord).join(",");

    // Create result with composite primary key
    const result = await YourModel.create({
      key: primaryKeyValues.join(","),
      values,
    });

    const currfolder = __dirname;
    const parentfolder = path.join(currfolder, "..");

    for (const indexColumn of indexColumns) {
      const indexFilePath = path.join(
        parentfolder,
        `/database/${indexColumn.name}.json`
      );

      const indexKey = indexColumn.columns
        .map((column) => record[column])
        .join("$");

      try {
        const indexContent = fs.readFileSync(indexFilePath, "utf8");
        const indexData = JSON.parse(indexContent);

        const isUnique = indexData.isUniqueFile;
        console.log(isUnique);
        if (isUnique) {
          // If the index is unique, check if the index key already exists
          const existingIndex = indexData.fields.find((entry) => {
            return entry.key === indexKey;
          });

          if (existingIndex) {
            console.error(
              "Error in insertRecord:",
              "This unique index key combination already exists"
            );
            res.status(400).json({
              error: "This unique index key combination already exists",
            });
            return;
          }
        } else {
          // If the index is not unique, find and update the existing entry
          const existingIndex = indexData.fields.find((entry) => {
            return entry.key === indexKey;
          });

          if (existingIndex) {
            // Update the existing entry with the new value
            existingIndex.value = `${existingIndex.value}#${primaryKeyIndex}`;
          } else {
            // If the entry doesn't exist, add a new one
            indexData.fields.push({ key: indexKey, value: primaryKeyIndex });
          }
        }

        fs.writeFileSync(indexFilePath, JSON.stringify(indexData, null, 2));
      } catch (error) {
        // If the file doesn't exist, create it
        const indexData = {
          isUniqueFile: indexColumn.isUnique,
          fields: [{ key: indexKey, value: primaryKeyIndex }],
        };
        fs.writeFileSync(indexFilePath, JSON.stringify(indexData, null, 2));
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
      const { YourModel } = createModel(databaseName, tableName);

      // Find the record to be deleted
      const recordToDelete = await YourModel.findOne({ key: primaryKey });

      // Check if the record exists
      if (!recordToDelete) {
        return res.status(404).json({ error: "Record not found" });
      }

      // Delete the record
      const result = await YourModel.deleteOne({ key: primaryKey });

      // Check if the record was deleted
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Record not found" });
      }

      // Check and delete the corresponding index entries
      const currfolder = __dirname;
      const parentfolder = path.join(currfolder, "..");
      const tableInfo = getTableInfo(databaseName, tableName);
      const indexColumns = tableInfo.indexes || [];

      for (const indexColumn of indexColumns) {
        const indexFilePath = path.join(
          parentfolder,
          `/database/${indexColumn.name}.json`
        );

        try {
          // Read the index file
          const indexContent = fs.readFileSync(indexFilePath, "utf8");
          const indexData = JSON.parse(indexContent);

          // Find and remove the entries with the provided primary key
          const updatedFields = indexData.fields.filter(
            (entry) => !entry.value.includes(primaryKey)
          );

          // Update the index file with the modified entries
          await fsPromises.writeFile(
            indexFilePath,
            JSON.stringify({
              isUnique: indexData.isUnique,
              fields: updatedFields,
            }),
            "utf8"
          );
        } catch (error) {
          console.error("Error deleting index entries:", error);
          res.status(500).json({ error: "Internal Server Error" });
        }
      }

      res.json({
        message: "Record and associated index entries deleted successfully",
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

module.exports = router;
