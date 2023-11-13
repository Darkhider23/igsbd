import React, { useState, useEffect } from "react";
import axios from "axios";
import InsertForm from "./InsertForm";

const DatabaseSelector = () => {
    const [selectedDatabase, setSelectedDatabase] = useState('');
    const [metadata, setMetadata] = useState(null);
    const [recordInserted, setRecordInserted] = useState(null);
    const [selectedTableName, setSelectedTableName] = useState('');

    const handleDatabaseChange = (event) => {
        const { value } = event.target;
        setSelectedDatabase(value);
        const databaseName = sessionStorage.setItem('databaseName', value);
    };

    const handleTableNameChange = (event) => {
        const { value } = event.target;
        setSelectedTableName(value);
        const tableName = sessionStorage.setItem('tableName', value);
    };

    const handleSubmit = async () => {
        try {
            if (selectedDatabase && selectedTableName) {
                const response = await axios.get(`http://localhost:5000/api/metadata/${selectedDatabase}`);
                setMetadata(response.data);
            }
        } catch (error) {
            console.error('Error fetching metadata:', error);
        }
    };

    const handleInsert = (insertedRecord) => {
        setRecordInserted(insertedRecord);
    };

    useEffect(() => {
        // Assume you have a way to retrieve the table name from the session
        const savedTableName = sessionStorage.getItem('tableName');
        if (savedTableName) {
            setSelectedTableName(savedTableName);
        }
    }, []); // Run only once on component mount

    const handleSaveTableName = () => {
        // Assume you have a way to save the table name to the session
        sessionStorage.setItem('tableName', selectedTableName);
    };

    return (
        <div>
            <label>Enter Database Name:</label>
            <input
                type="text"
                value={selectedDatabase}
                onChange={handleDatabaseChange}
                placeholder="Type database name"
            />

            <label>Enter Table Name:</label>
            <input
                type="text"
                value={selectedTableName}
                onChange={handleTableNameChange}
                placeholder="Type table name"
            />

            <button onClick={handleSubmit}>Submit</button>

            <button onClick={() => setMetadata(null)}>Clear Metadata</button>

            {metadata && <InsertForm metadata={metadata} tableName={selectedTableName} onInsert={handleInsert} />}

            {recordInserted && (
                <div>
                    <p>Last Inserted Record:</p>
                    <pre>{JSON.stringify(recordInserted, null, 2)}</pre>
                </div>
            )}

        </div>
    );
};

export default DatabaseSelector;
