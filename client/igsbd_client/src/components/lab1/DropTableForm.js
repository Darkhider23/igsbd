import React, { useState } from 'react';

function DropTableForm() {
  const [tableName, setTableName] = useState('');

  const handleDropTable = async () => {
    // Get the selected database name from the session storage
    const dbName = sessionStorage.getItem('selectedDatabase');

    if (!dbName) {
      console.error('No database selected. Please select a database.');
      return;
    }

    if (tableName) {
      try {
        const response = await fetch('http://localhost:5000/table/drop', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            dbName,
            tableName,
          }),
        });

        if (response.ok) {
          console.log('Table dropped successfully');
          // Optionally, you can display a success message to the user.
        } else {
          console.error('Table drop failed');
          // Optionally, you can handle the error and provide user feedback.
        }
      } catch (error) {
        console.error('An error occurred while dropping the table:', error);
        // Handle any unexpected errors here.
      }

      setTableName('');
    }
  };

  return (
    <div>
      <h2>Drop Table</h2>
      <input
        type="text"
        placeholder="Table Name"
        value={tableName}
        onChange={(e) => setTableName(e.target.value)}
      />
      <button onClick={handleDropTable}>Drop Table</button>
    </div>
  );
}

export default DropTableForm;
