import React, { useState } from 'react';

function Delete() {
  const [primaryKeyToDelete, setPrimaryKeyToDelete] = useState('');

  const handleDelete = async () => {
    const selectedTable = sessionStorage.getItem('selectedTable');
    const dbname = sessionStorage.getItem('selectedDatabase');

    if (!selectedTable) {
      console.error('No table selected');
      // Handle the case where no table is selected
      return;
    }

    // Send a request to the backend to delete the record from the selected table
    try {
      
      const response = await fetch('http://192.168.1.130:5000/data/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ dbName: dbname, tableName: selectedTable, primaryKey: primaryKeyToDelete }),
      });

      if (response.ok) {
        console.log('Record deleted successfully');
        // Optionally, provide user feedback here
      } else {
        console.error('Delete operation failed');
        // Handle the error and provide user feedback
      }
    } catch (error) {
      console.error('An error occurred while deleting the record:', error);
      // Handle unexpected errors here
    }

    // Reset input field
    setPrimaryKeyToDelete('');
  };

  return (
    <div>
      <h2>Delete Record</h2>
      <input
        type="text"
        placeholder="Primary Key to Delete"
        value={primaryKeyToDelete}
        onChange={(e) => setPrimaryKeyToDelete(e.target.value)}
      />
      <button onClick={handleDelete}>Delete</button>
    </div>
  );
}

export default Delete;
