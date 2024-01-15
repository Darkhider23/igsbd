import React, { useState } from "react";
import axios from "axios";

const DeleteIndexButton = ({ dbName, tableName, indexName, onDelete }) => {
  const handleDelete = async () => {
    try {
      const response = await axios.post(
        `http://localhost:5000/index/delete/${dbName}/${tableName}/${indexName}`
      );

      if (onDelete) {
        onDelete(indexName);
      }

      console.log(response.data);
    } catch (error) {
      console.error(error);
      // Handle errors here
    }
  };

  return <button onClick={handleDelete}>Delete Index</button>;
};

export default DeleteIndexButton;
