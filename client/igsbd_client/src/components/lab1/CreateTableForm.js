import React, { useState } from "react";

function CreateTable() {
  const selectedDatabase = sessionStorage.getItem("selectedDatabase");

  const [tableName, setTableName] = useState("");
  const [column, setColumn] = useState("");
  const [columnType, setColumnType] = useState("string");

  const [isForeignKey, setIsForeignKey] = useState(false);
  const [targetTable, setTargetTable] = useState("");
  const [targetColumn, setTargetColumn] = useState("");

  const [foreignKeys, setForeignKeys] = useState([]);
  const [uniqueKeys, setUniqueKeys] = useState([]);
  const [tableStructure, setTableStructure] = useState([]);
  const [isUnique, setIsUnique] = useState(false);

  const handleAddColumn = () => {
    if (column && columnType) {
      const newColumn = {
        name: column,
        type: columnType,
        isForeignKey,
        isUnique,
        targetTable: isForeignKey ? targetTable : null,
        targetColumn: isForeignKey ? targetColumn : null,
      };

      setTableStructure([...tableStructure, newColumn]);

      if (isUnique) {
        setUniqueKeys([...uniqueKeys, newColumn.name]);
      }
      if (isForeignKey) {
        setForeignKeys([
          ...foreignKeys,
          { columnName: newColumn.name, targetTable, targetColumn },
        ]);
      }

      setColumn("");
      setColumnType("string");

      setIsForeignKey(false);
      setIsUnique(false);
      setTargetTable("");
      setTargetColumn("");
    }
  };

  const handleCreateTable = async () => {
    // Send a request to the backend to create the table
    try {
      const response = await fetch("http://localhost:5000/table/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dbName: selectedDatabase,
          tableName,
          tableStructure,
       
          foreignKeys,
          uniqueKeys,
        }),
      });

      if (response.ok) {
        console.log("Table created successfully");
      } else {
        console.error("Table creation failed");
      }
    } catch (error) {
      console.error("An error occurred while creating the table:", error);
    }

    setTableName("");
    setColumn("");
    setColumnType("string");

    setIsForeignKey(false);
    setTargetTable("");
    setTargetColumn("");
  
    setForeignKeys([]);
    setTableStructure([]);
    setUniqueKeys([]);
    setIsUnique(false);
  };

  return (
    <div>
      <h2>Create Table</h2>
      <p>Selected Database: {selectedDatabase}</p>
      <label>
        Table Name:
        <input
          type="text"
          value={tableName}
          onChange={(e) => setTableName(e.target.value)}
        />
      </label>
      <br />
      <label>
        Column Name:
        <input
          type="text"
          value={column}
          onChange={(e) => setColumn(e.target.value)}
        />
      </label>
      <label>
        Column Type:
        <select
          value={columnType}
          onChange={(e) => setColumnType(e.target.value)}
        >
          <option value="string">String</option>
          <option value="number">Number</option>
          {/* Add more types as needed */}
        </select>
      </label>
      <label>
        Is Unique:
        <input
          type="checkbox"
          checked={isUnique}
          onChange={() => setIsUnique(!isUnique)}
        />
      </label>
      <label>
        Is Foreign Key:
        <input
          type="checkbox"
          checked={isForeignKey}
          onChange={() => setIsForeignKey(!isForeignKey)}
        />
      </label>
      {isForeignKey && (
        <>
          <label>
            Target Table:
            <input
              type="text"
              value={targetTable}
              onChange={(e) => setTargetTable(e.target.value)}
            />
          </label>
          <label>
            Target Column:
            <input
              type="text"
              value={targetColumn}
              onChange={(e) => setTargetColumn(e.target.value)}
            />
          </label>
        </>
      )}
      <button onClick={handleAddColumn}>Add Column</button>
      <br />
      <h3>Table Structure:</h3>
      <ul>
        {tableStructure.map((column, index) => (
          <li key={index}>
            {`${column.name}: ${column.type}  ${
              column.isForeignKey
                ? `(Foreign Key: ${column.targetTable}.${column.targetColumn})`
                : ""
            }`}
          </li>
        ))}
      </ul>
      <br />
      <button onClick={handleCreateTable}>Create Table</button>
    </div>
  );
}

export default CreateTable;
