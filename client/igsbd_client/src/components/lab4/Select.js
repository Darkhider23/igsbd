import React, { useState } from "react";
import axios from "axios";
const SelectForm = ({ onSubmit }) => {
  const [dbName, setDbName] = useState("");
  const [tableName, setTableName] = useState("");
  const [conditions, setConditions] = useState([
    { column: "", operator: "", value: "" },
  ]);
  const [selectResponse, setSelectResponse] = useState(null);

  const handleConditionChange = (index, key, value) => {
    const updatedConditions = [...conditions];
    updatedConditions[index][key] = value;
    setConditions(updatedConditions);
  };

  const handleAddCondition = () => {
    setConditions([...conditions, { column: "", operator: "", value: "" }]);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    try {
      // Extract column names from conditions
      const conditionColumns = conditions.map((condition) => condition.column);

      // Create a unique index name
      const indexName = `${tableName}_${conditionColumns.join("and")}`;

      // Step 1: Create Index
      // const createIndexResponse = await axios.post(
      //   "http://localhost:5000/index/create",
      //   {
      //     dbName,
      //     tableName,
      //     indexName,
      //     columns: conditionColumns,
      //   }
      // );

      // console.log("Create Index API Response:", createIndexResponse.data);

      // Step 2: Perform Select
      const selectResponse = await axios.post(
        "http://localhost:5000/select/create",
        {
          dbName,
          tableName,
          conditions,
        }
      );
      setSelectResponse(selectResponse.data);
      console.log("Select API Response:", selectResponse.data);
    } catch (error) {
      console.error("API Request Failed:", error.message);
    }
  };

  return (
    <div>
      <form onSubmit={handleFormSubmit}>
        <div>
          <label htmlFor="dbName">Database Name:</label>
          <input
            type="text"
            id="dbName"
            value={dbName}
            onChange={(e) => setDbName(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="tableName">Table Name:</label>
          <input
            type="text"
            id="tableName"
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
          />
        </div>
        {conditions.map((condition, index) => (
          <div key={index}>
            <input
              type="text"
              placeholder="Column"
              value={condition.column}
              onChange={(e) =>
                handleConditionChange(index, "column", e.target.value)
              }
            />
            <input
              type="text"
              placeholder="Operator"
              value={condition.operator}
              onChange={(e) =>
                handleConditionChange(index, "operator", e.target.value)
              }
            />
            <input
              type="text"
              placeholder="Value"
              value={condition.value}
              onChange={(e) =>
                handleConditionChange(index, "value", e.target.value)
              }
            />
          </div>
        ))}
        <button type="button" onClick={handleAddCondition}>
          Add Condition
        </button>
        <button type="submit">Submit</button>
      </form>
      {selectResponse && (
        <div>
          <h2>Select API Response:</h2>
          <ul>
            {selectResponse.results.map((result, index) => (
              <li key={index}>{result}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SelectForm;
