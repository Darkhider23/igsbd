import React, { useState } from 'react';

function TableColumnInput({ onAddColumn }) {
  const [columnName, setColumnName] = useState('');
  const [columnType, setColumnType] = useState('string');

  const handleAddColumn = () => {
    if (columnName) {
      onAddColumn({ name: columnName, type: columnType });
      setColumnName('');
    }
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Column Name"
        value={columnName}
        onChange={(e) => setColumnName(e.target.value)}
      />
      <select onChange={(e) => setColumnType(e.target.value)} value={columnType}>
        <option value="string">String</option>
        <option value="number">Number</option>
        <option value="date">Date</option>
        <option value="boolean">Boolean</option>
      </select>
      <button onClick={handleAddColumn}>Add Column</button>
    </div>
  );
}

export default TableColumnInput;
