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

  models[modelName] = YourModel;
  return YourModel;
};

router.post("/create", async (req, res) => {
  try {
    const { dbName, tableName, conditions } = req.body;
    let PKValues;
    const client = await getDbClient();
    const db = client.db(dbName);
    const collection = db.collection(tableName);

    const tableinfo = getTableInfo(dbName, tableName);

    for (const index of tableinfo.indexes) {
      const indexColumns = index.columns;

      const indexCollection = db.collection(index.name);
      const documents = await indexCollection.find({}).toArray();
      const decomposedColumns = documents.map((entry) => entry._id.split("$"));

      const result = decomposedColumns
        .map((decomposedValues, res) => {
          let allConditionsMet = true;

          const conditionsAreMet = conditions.every((condition, i) => {
            if (!allConditionsMet) {
              return false;
            }

            let decomposedValue = decomposedValues[i];
            let conditionValue = condition.value;
            if (
              getColumnType(dbName, tableName, condition.column) === "Number"
            ) {
              decomposedValue = parseFloat(decomposedValue);
              conditionValue = parseFloat(conditionValue);
            }

            console.log(typeof decomposedValue);
            console.log(typeof conditionValue);

            switch (condition.operator) {
              case "=":
                allConditionsMet =
                  allConditionsMet && decomposedValue == conditionValue;
                break;
              case ">":
                allConditionsMet =
                  allConditionsMet && decomposedValue > conditionValue;
                break;
              case "<":
                allConditionsMet =
                  allConditionsMet && decomposedValue < conditionValue;
                break;
              default:
                allConditionsMet = false;
            }

            return allConditionsMet;
          });

          return { conditionsAreMet, res };
        })
        .find((result) => result.conditionsAreMet);

      if (result && result.conditionsAreMet) {
        // Retrieve the complete document from the target collection
        const primaryKeys = await indexCollection.findOne({
          _id: decomposedColumns[result.res].join("$"),
        });
        const primaryKeyValue = primaryKeys.value;
        if (primaryKeyValue) {
          PKValues = primaryKeyValue.split("$");
          console.log(PKValues);
        }
      }
    }
    if (!PKValues) {
      console.error(
        "Error in select API:",
        "No matching index found for conditions"
      );
      res.status(400).json({ error: "No matching index found for conditions" });
    }
  } catch (error) {
    console.error("Error in select API:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

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

function getColumnType(databaseName, tableName, columnName) {
  const tableInfo = getTableInfo(databaseName, tableName);

  if (tableInfo) {
    const columnInfo = tableInfo.structure.find(
      (col) => col.name === columnName
    );

    if (columnInfo) {
      return columnInfo.type;
    } else {
      console.log(`Column '${columnName}' not found in table '${tableName}'.`);
    }
  } else {
    console.log(`Table '${tableName}' not found in the metadata.`);
  }

  // Return null or any default value if the column or table is not found
  return null;
}

module.exports = router;
