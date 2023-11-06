import React, { useState } from 'react';

function CreateDatabaseForm() {
  const [databaseName, setDatabaseName] = useState('');

  const handleCreateDatabase = async () => {
    if (databaseName) {
      try {
        const response = await fetch('http://192.168.1.130:5000/database/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ dbName: databaseName }),
        });

        if (response.ok) {
          console.log('Database created successfully');
          // Optionally, you can display a success message to the user.
        } else {
          console.error('Database creation failed');
          // Optionally, you can handle the error and provide user feedback.
        }
      } catch (error) {
        console.error('An error occurred while creating the database:', error);
        // Handle any unexpected errors here.
      }

      setDatabaseName('');
    }
  };

  return (
    <div>
      <h2>Create Database</h2>
      <input
        type="text"
        placeholder="Database Name"
        value={databaseName}
        onChange={(e) => setDatabaseName(e.target.value)}
      />
      <button onClick={handleCreateDatabase}>Create Database</button>
    </div>
  );
}

export default CreateDatabaseForm;
