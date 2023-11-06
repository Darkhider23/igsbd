import React, { useState } from 'react';
import axios from 'axios';

function CreateDatabase() {
  const [dbName, setDbName] = useState('');

  const handleCreateDatabase = () => {
    axios.post('/api/database/create', { dbName })
      .then(response => {
        // Handle success
        console.log(response.data);
      })
      .catch(error => {
        // Handle error
        console.error(error);
      });
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Database Name"
        value={dbName}
        onChange={(e) => setDbName(e.target.value)}
      />
      <button onClick={handleCreateDatabase}>Create Database</button>
    </div>
  );
}

export default CreateDatabase;
