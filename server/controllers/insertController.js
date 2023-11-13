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
    "mongodb+srv://Farchi:Masterzabest20mongodb@mydatabase.enc6jmy.mongodb.net/?retryWrites=true&w=majority",
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
// Create mongoose model based on metadata
const createModel = (databaseName, tableName) => {
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

  // Pass tableMetadata along with the model
  return {
    YourModel: mongoose.model(tableName, new mongoose.Schema(schema)),
    tableMetadata,
  };
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
      console.log(databaseName, tableName);
      const { YourModel, tableMetadata } = createModel(databaseName, tableName);

      const record = req.body;
      // Validate record based on metadata
      validateRecord(record, YourModel, tableMetadata);

      // Insert record into MongoDB
      console.log(record);
      const result = await YourModel.create(record);
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  // Delete API endpoint
  deleteRecord: async (req, res) => {
    try {
      const { databaseName, tableName, primaryKey } = req.params;
      console.log(databaseName,tableName,primaryKey);
      const { YourModel, tableMetadata } = createModel(databaseName, tableName);

      // Delete record from MongoDB
      const result = await YourModel.deleteOne({
        [tableMetadata.primaryKeys[0]]: primaryKey,
      });
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },

  getMetadata: (req, res) => {
    try {
      const { databaseName } = req.params;
      const metadataPath = `./database/${databaseName}.json`;
      const metadata = JSON.parse(fs.readFileSync(metadataPath, "utf8"));
      res.json(metadata);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};
