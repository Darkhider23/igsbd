import React, { useState } from 'react';
import TableColumnInput from './TableColumnInput';

function CreateTableForm() {
  const [tableName, setTableName] = useState('');
  const [tableColumns, setTableColumns] = useState([]);

  const handleCreateTable = async () => {
    if (tableName && tableColumns.length > 0) {
      // Get the selected database name from the session storage
      const dbName = sessionStorage.getItem('selectedDatabase');

      if (!dbName) {
        console.error('No database selected. Please select a database.');
        return;
      }

      try {
        const response = await fetch('http://192.168.1.130:5000/table/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dbName,
            tableName,
            tableStructure: tableColumns,
          }),
        });

        if (response.ok) {
          console.log('Table created successfully');
          // Optionally, you can display a success message to the user.
        } else {
          console.error('Table creation failed');
          // Optionally, you can handle the error and provide user feedback.
        }
      } catch (error) {
        console.error('An error occurred while creating the table:', error);
        // Handle any unexpected errors here.
      }

      setTableName('');
      setTableColumns([]);
    }
  }

  const addColumn = (column) => {
    setTableColumns([...tableColumns, column]);
  };

  return (
    <div>
      <h2>Create Table</h2>
      <input
        type="text"
        placeholder="Table Name"
        value={tableName}
        onChange={(e) => setTableName(e.target.value)}
      />
      <button onClick={handleCreateTable}>Create Table</button>
      {tableColumns.map((column, index) => (
        <div key={index}>
          Column Name: {column.name}, Type: {column.type}
        </div>
      ))}
      <TableColumnInput onAddColumn={addColumn} />
    </div>
  );
}

export default CreateTableForm;
