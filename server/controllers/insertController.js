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
  const modelName = `${databaseName}_${tableName}`;

  // Check if the model already exists
  if (models[modelName]) {
    return models[modelName];
  }

  // Define the schema with 'id' and 'values' fields
  const schema = {
    id: {
      type: Number,
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

module.exports = {
  // Insert API endpoint
  insertRecord: async (req, res) => {
    try {
      const { databaseName, tableName } = req.params;
      const { YourModel } = createModel(databaseName, tableName);

      const record = req.body;

      // Extract the 'id' field from the record
      const id = record.id;

      // Remove the 'id' field from the record
      delete record.id;

      // Generate the concatenated string of values from the remaining fields
      const values = Object.values(record).join(", ");

      // Create a new record using the 'values' field for the concatenated string of values
      const result = await YourModel.create({ id, values });
      res.json(result);
    } catch (error) {
      if (
        error.code === 11000 &&
        error.keyPattern &&
        error.keyPattern.id === 1
      ) {
        // Duplicate key error for 'id'
        console.error("Error in insertRecord:", "This id already exists");
        res.status(400).json({ error: "This id already exists" });
      } else {
        console.error("Error in insertRecord:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    }
  },

  // Delete API endpoint
  deleteRecord: async (req, res) => {
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
