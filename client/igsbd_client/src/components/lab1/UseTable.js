import React, { useState } from 'react';

function UseTable() {
  const [selectedTable, setSelectedTable] = useState('');

  const handleSelectTable = () => {
    // Set the selected table as a session variable
    if (selectedTable) {
      sessionStorage.setItem('selectedTable', selectedTable);
      console.log(`Selected table: ${selectedTable}`);
      // You can also redirect to another page or perform other actions as needed.
    }
  };

  return (
    <div>
      <h2>Use Table</h2>
      <input
        type="text"
        placeholder="Table Name"
        value={selectedTable}
        onChange={(e) => setSelectedTable(e.target.value)}
      />
      <button onClick={handleSelectTable}>Select Table</button>
    </div>
  );
}

export default UseTable;
