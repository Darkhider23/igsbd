import React, { useState, useEffect } from "react";
import axios from "axios";
import DeleteIndexButton from "./DeleteIndex";

const IndexList = () => {
  const [indexes, setIndexes] = useState([]);
  const dbName = sessionStorage.getItem("databaseName");
  const tableName = sessionStorage.getItem("tableName");
  
  useEffect(() => {
    const fetchIndexes = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/metadata/${dbName}/${tableName}`
        );
        setIndexes(response.data.indexes || []);
      } catch (error) {
        console.error(error);
        // Handle errors here
      }
    };

    fetchIndexes();
  }, [dbName, tableName]);

  const handleDeleteIndex = (deletedIndexName) => {
    setIndexes((prevIndexes) =>
      prevIndexes.filter((index) => index.name !== deletedIndexName)
    );
  };

  return (
    <div>
      <h2>Indexes for {tableName}</h2>
      <ul>
        {indexes.map((index) => (
          <li key={index.name}>
            {index.name} - {index.columns.join(", ")}
            <DeleteIndexButton
              dbName={dbName}
              tableName={tableName}
              indexName={index.name}
              onDelete={handleDeleteIndex}
            />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default IndexList;
