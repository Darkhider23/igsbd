import React, { useState } from "react";

const IndexEntriesDeleter = () => {
  const [indexName, setIndexName] = useState("");
  const [indexKey, setIndexKey] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleDeleteEntries = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/delete-entries/${indexName}/${indexKey}`,
        {
          method: "POST",
        }
      );

      if (response.ok) {
        const result = await response.json();
        setMessage(result.message);
        setError("");
      } else {
        const errorResult = await response.json();
        setMessage("");
        setError(errorResult.error);
      }
    } catch (error) {
      setMessage("");
      setError("An error occurred while processing your request.");
    }
  };

  return (
    <div>
      <h2>Index Entries Deleter</h2>
      <div>
        <label htmlFor="indexName">Index Name:</label>
        <input
          type="text"
          id="indexName"
          value={indexName}
          onChange={(e) => setIndexName(e.target.value)}
        />
      </div>
      <div>
        <label htmlFor="indexKey">Index Key:</label>
        <input
          type="text"
          id="indexKey"
          value={indexKey}
          onChange={(e) => setIndexKey(e.target.value)}
        />
      </div>
      <button onClick={handleDeleteEntries}>Delete Entries</button>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default IndexEntriesDeleter;
