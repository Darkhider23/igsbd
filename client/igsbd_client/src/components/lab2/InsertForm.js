// InsertForm.js
import React, { useState } from "react";
import "./InsertDeletePage.css";
import axios from "axios";

const InsertForm = ({ metadata, onInsert }) => {
  const [record, setRecord] = useState({});
  const [primaryKeyToDelete, setPrimaryKeyToDelete] = useState("");
  const databaseName = sessionStorage.getItem("databaseName");
  const tableName = sessionStorage.getItem("tableName");
  const handleInputChange = (e, column) => {
    const { name, value } = e.target;
    const processedValue = column.type === "number" ? parseFloat(value) : value;
    setRecord({ ...record, [name]: processedValue });
  };

  const handlePK = (e) => {
    const { name, value } = e.target;
    setPrimaryKeyToDelete(value);
  };

  const handleInsert = async () => {
    try {
      const response = await axios.post(
        `http://localhost:5000/insert/${databaseName}/${tableName}`,
        record
      );
      console.log(response.data);
      if (onInsert) {
        onInsert(response.data);
      }
    } catch (error) {
      alert(error.response.data.error);
    }
  };

  const handleDelete = async () => {
    console.log(primaryKeyToDelete);
    try {
      const response = await axios.post(
        `http://localhost:5000/delete/${databaseName}/${tableName}/${primaryKeyToDelete}`
      );
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      {/* Input fields for insert */}
      {metadata && metadata.structure.map((column) => (
        <div key={column.name}>
          <label>{column.name}:</label>
          <input
            type={column.type === "number" ? "number" : "text"}
            name={column.name}
            onChange={(e) => handleInputChange(e, column)}
          />
        </div>
      ))}

      {/* Insert button */}
      <button onClick={handleInsert}>Insert</button>

      {/* Input field for delete */}
      <div>
        <label>Delete by Primary Key (Id):</label>
        <input
          type="text"
          name="primaryKeyToDelete"
          onChange={handlePK}
        />
        <button onClick={handleDelete}>Delete</button>
      </div>
    </div>
  );
};

export default InsertForm;
