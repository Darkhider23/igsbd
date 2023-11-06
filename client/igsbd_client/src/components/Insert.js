import React, { useState } from 'react';

function Insert() {
  const [primaryKey, setPrimaryKey] = useState('');
  const [attributes, setAttributes] = useState('');

  const handleInsert = async () => {
    const selectedTable = sessionStorage.getItem('selectedTable');
    const dbname = sessionStorage.getItem('selectedDatabase')

    if (!selectedTable) {
      console.error('No table selected');
      // Handle the case where no table is selected
      return;
    }

    // Create a new record by concatenating attributes
    const record = `${primaryKey}:${attributes}`;
    
    // Send a request to the backend to insert the record into the selected table
    try {
        console.log()
      const response = await fetch('http://192.168.1.130:5000/data/insert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dbName: dbname, tableName: selectedTable, primaryKey, attributes }),
      });

      if (response.ok) {
        console.log('Record inserted successfully');
        // Optionally, provide user feedback here
      } else {
        console.error('Insert operation failed');
        // Handle the error and provide user feedback
      }
    } catch (error) {
      console.error('An error occurred while inserting the record:', error);
      // Handle unexpected errors here
    }

    // Reset input fields
    setPrimaryKey('');
    setAttributes('');
  };

  return (
    <div>
      <h2>Insert Record</h2>
      <input
        type="text"
        placeholder="Primary Key"
        value={primaryKey}
        onChange={(e) => setPrimaryKey(e.target.value)}
      />
      <input
        type="text"
        placeholder="Attributes (comma-separated)"
        value={attributes}
        onChange={(e) => setAttributes(e.target.value)}
      />
      <button onClick={handleInsert}>Insert</button>
    </div>
  );
}

export default Insert;
