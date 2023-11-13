import React from 'react';

function DropDatabaseForm() {
  const handleDropDatabase = async () => {
    // Get the selected database name from the session storage
    const databaseName = sessionStorage.getItem('selectedDatabase');

    if (databaseName) {
      try {
        const response = await fetch('http://192.168.1.130:5000/database/drop', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ dbName: databaseName }),
        });

        if (response.ok) {
          console.log('Database dropped successfully');
          // Optionally, you can display a success message to the user.
        } else {
          console.error('Database drop failed');
          // Optionally, you can handle the error and provide user feedback.
        }
      } catch (error) {
        console.error('An error occurred while dropping the database:', error);
        // Handle any unexpected errors here.
      }

      // Optionally, you can clear the session variable after dropping the database
      sessionStorage.removeItem('selectedDatabase');
    }
  };

  return (
    <div>
      <h2>Drop Database</h2>
      <button onClick={handleDropDatabase}>Drop Database</button>
    </div>
  );
}

export default DropDatabaseForm;
