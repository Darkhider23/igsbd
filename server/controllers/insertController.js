// server.js
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const fs = require("fs");
const { table } = require("console");
const app = express();
const port = 3000; // Change the port if needed

// Connect to MongoDB
mongoose.connect(
  "mongodb+srv://Farchi:Masterzabest20@mydatabase.enc6jmy.mongodb.net/?retryWrites=true&w=majority",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    // useCreateIndex: true,
  }
);

// Access the default connection
const db = mongoose.connection;

// Event handlers for successful connection and error
db.once("open", () => {
  console.log("MongoDB connected successfully");
});

db.on("error", (error) => {
  console.error("MongoDB connection error:", error.message);
  // Handle the error as needed (e.g., exit the application or perform other actions)
});
const models = {}; // Store created models to avoid re-creating them

const createModel = (databaseName, tableName) => {
  const modelKey = `${databaseName}_${tableName}`;

  // Check if the model already exists
  if (models[modelKey]) {
    return models[modelKey];
  }

  const metadataPath = `./database/${databaseName}.json`;
  const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
  const tableMetadata = metadata.tables.find(
    (table) => table.name === tableName
  );

  const schema = {};
  tableMetadata.structure.forEach((column) => {
    schema[column.name] = { type: column.type, required: !column.isPrimaryKey };
  });

  // Include primary key field dynamically
  if (tableMetadata.primaryKeys.length === 1) {
    schema[tableMetadata.primaryKeys[0]] = {
      type: tableMetadata.structure.find(
        (col) => col.name === tableMetadata.primaryKeys[0]
      ).type,
      required: true,
      unique: true,
    };
  }

  // Create and store the model
  const YourModel = mongoose.model(tableName, new mongoose.Schema(schema));
  models[modelKey] = { YourModel, tableMetadata };

  return models[modelKey];
};

app.use(bodyParser.json());

// Validation function
const validateRecord = async (record, YourModel, tableMetadata) => {
  // Validate each attribute based on the metadata
  for (const [key, value] of Object.entries(record)) {
    const columnMetadata = tableMetadata.structure.find(
      (col) => col.name === key
    );

    if (!columnMetadata) {
      throw new Error(
        `Column ${key} not found in metadata for table ${tableMetadata.name}`
      );
    }

    // Check if the type matches
    if (typeof value !== columnMetadata.type.toLowerCase()) {
      throw new Error(
        `Invalid type for column ${key}. Expected ${columnMetadata.type.toLowerCase()}, got ${typeof value}`
      );
    }
  }

  // Check if primary key is unique
  const existingRecord = await YourModel.findOne({
    [tableMetadata.primaryKeys[0]]: record[tableMetadata.primaryKeys[0]],
  });
  if (existingRecord) {
    throw new Error(
      `Record with primary key ${
        record[tableMetadata.primaryKeys[0]]
      } already exists in table ${tableMetadata.name}`
    );
  }
};

module.exports = {
  // Insert API endpoint
  insertRecord: async (req, res) => {
    try {
      const { databaseName, tableName } = req.params;
      const { YourModel, tableMetadata } = createModel(databaseName, tableName);

      const record = req.body;
      await validateRecord(record, YourModel, tableMetadata);

      const result = await YourModel.create(record);
      res.json(result);
    } catch (error) {
      console.error("Error in insertRecord:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  // Delete API endpoint
  deleteRecord: async (req, res) => {
    try {
      const { databaseName, tableName, primaryKey } = req.params;
      const { YourModel, tableMetadata } = createModel(databaseName, tableName);

      const result = await YourModel.deleteOne({
        [tableMetadata.primaryKeys[0]]: primaryKey,
      });
      res.json(result);
    } catch (error) {
      console.error("Error in deleteRecord:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  // Get Metadata API endpoint
  getMetadata: (req, res) => {
    try {
      const { databaseName } = req.params;
      const metadataPath = `./database/${databaseName}.json`;
      const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
      res.json(metadata);
    } catch (error) {
      console.error("Error in getMetadata:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};
