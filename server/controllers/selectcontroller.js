const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();
const { getDbClient } = require("../connection");

const models = {};

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

router.post("/create", async (req, res) => {
  try {
    const { dbName, tableName, conditions } = req.body;

    // Use getDbClient to get the existing client or connect to the database
    const client = await getDbClient();
    const db = client.db(dbName);
    const collection = db.collection(tableName);

    const indexes = await db.collection(tableName).listIndexes().toArray();

    // Find an index that matches all conditions
    for (const index of indexes) {
      const indexColumns = Object.keys(index.key);

      // Create a collection for the index
      // const indexCollection = createModel(db, index.name);

      const indexCollection = db.collection(index.name);
      const documents = await indexCollection.find({}).toArray();
      const decomposedColumns = documents.map((entry) => entry.key.split("$"));

      // Check conditions on the decomposed columns
      if (
        conditions.every((condition, index) => {
          const decomposedValue = decomposedColumns[index][index];
          const conditionValue = condition.value;
          console.log(typeof decomposedValue);
          console.log(typeof conditionValue);

          switch (condition.operator) {
            case "=":
              return decomposedValue == conditionValue;
            case ">":
              return decomposedValue > conditionValue;
            case "<":
              return decomposedValue < conditionValue;
            default:
              return false;
          }
        })
      ) {
        // Retrieve the complete document from the target collection
        const primaryKeys = await indexCollection.findOne({
          key: decomposedColumns[0].join("$"),
        });
        const primaryKeyValue = primaryKeys.value;
        if (primaryKeyValue) {
          const PKValues = primaryKeyValue.split("$");

          // Assuming primaryKeyValues is an array of values corresponding to each part of the composite key
          const query = {};
          PKValues.forEach((value, index) => {
            query[`key${index + 1}`] = value; // Replace `field${index + 1}` with the actual field name
          });

          const result = await collection.find({
            key: { $in: ['4','8'] },
          });
          for await (const doc of result){
            console.log(doc);
          }

          // Send the complete document as the response
          // return res.json(result);
        }
      }
    }

    // No matching index found for conditions
    console.error(
      "Error in select API:",
      "No matching index found for conditions"
    );
    res.status(400).json({ error: "No matching index found for conditions" });
  } catch (error) {
    console.error("Error in select API:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

function getColumnType(database, tableName, columnName) {
  const table = database.tables.find((table) => table.name === tableName);

  if (table) {
    const column = table.structure.find((col) => col.name === columnName);

    if (column) {
      return column.type;
    } else {
      console.log(`Column '${columnName}' not found in table '${tableName}'.`);
    }
  } else {
    console.log(`Table '${tableName}' not found in the database.`);
  }

  // Return null or any default value if the column or table is not found
  return null;
}

module.exports = router;
