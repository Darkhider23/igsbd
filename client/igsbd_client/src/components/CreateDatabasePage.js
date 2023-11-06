import React, { useState } from 'react';
import CreateDatabaseForm from './CreateDatabaseForm';
import CreateTableForm from './CreateTableForm';
import DropDatabaseForm from './DropDatabaseForm';
import UseDatabase from './UseDatabase';
import DropTableForm from './DropTableForm';
import CreateIndexForm from './CreateIndexForm';

function CreateDatabasePage() {
  return (
    <div>
      <h1>Create Database and Table</h1>
      <CreateDatabaseForm />
      <UseDatabase/>
      <DropDatabaseForm/>
      <CreateTableForm />
      <DropTableForm/>
      <CreateIndexForm/>
    </div>
  );
}

export default CreateDatabasePage;
