import React, { useState } from 'react';

function CreateIndexForm() {
  const [tableName, setTableName] = useState('');
  const [indexName, setIndexName] = useState('');
  const [columns, setColumns] = useState('');

  // Get the selected database name from session storage
  const dbName = sessionStorage.getItem('selectedDatabase');

  const handleCreateIndex = async () => {
    if (tableName && indexName && columns) {
      try {
        console.log(dbName);
        const response = await fetch('http://localhost:5000/index/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dbName,
            tableName,
            indexName,
            columns: columns.split(',').map((column) => column.trim()),
          }),
        });

        if (response.ok) {
          console.log('Index created successfully');
          // Optionally, you can display a success message to the user.
        } else {
          console.error('Index creation failed');
          // Optionally, you can handle the error and provide user feedback.
        }
      } catch (error) {
        console.error('An error occurred while creating the index:', error);
        // Handle any unexpected errors here.
      }

      setTableName('');
      setIndexName('');
      setColumns('');
    }
  }

  return (
    <div>
      <h2>Create Index</h2>
      <p>Database: {dbName}</p>
      <input
        type="text"
        placeholder="Table Name"
        value={tableName}
        onChange={(e) => setTableName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Index Name"
        value={indexName}
        onChange={(e) => setIndexName(e.target.value)}
      />
      <input
        type="text"
        placeholder="Columns (comma-separated)"
        value={columns}
        onChange={(e) => setColumns(e.target.value)}
      />
      <button onClick={handleCreateIndex}>Create Index</button>
    </div>
  );
}

export default CreateIndexForm;
