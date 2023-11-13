import React, { useState } from 'react';

function UseDatabase() {
  const [selectedDatabase, setSelectedDatabase] = useState('');
  
  const handleSelectDatabase = () => {
    // Set the selected database as a session variable
    if (selectedDatabase) {
      sessionStorage.setItem('selectedDatabase', selectedDatabase);
      console.log(`Selected database: ${selectedDatabase}`);
      // You can also redirect to another page or perform other actions as needed.
    }
  };

  return (
    <div>
      <h2>Use Database</h2>
      <input
        type="text"
        placeholder="Database Name"
        value={selectedDatabase}
        onChange={(e) => setSelectedDatabase(e.target.value)}
      />
      <button onClick={handleSelectDatabase}>Select Database</button>
    </div>
  );
}

export default UseDatabase;
