import React, { useState } from 'react';
import CreateDatabaseForm from './CreateDatabaseForm';
import CreateTableForm from './CreateTableForm';
import DropDatabaseForm from './DropDatabaseForm';
import UseDatabase from './UseDatabase';
import DropTableForm from './DropTableForm';
import CreateIndexForm from './CreateIndexForm';
import Insert from './Insert';
import Delete from './Delete';
import UseTable from './UseTable';

function CreateDatabasePage() {
  return (
    <div>
      <h1>Create Database and Table</h1>
      <CreateDatabaseForm />
      <UseDatabase/>
      <DropDatabaseForm/>
      <CreateTableForm />
      <DropTableForm/>
      <UseTable/>
      <CreateIndexForm/>
      <Insert/>
      <Delete/>
    </div>
  );
}

export default CreateDatabasePage;
