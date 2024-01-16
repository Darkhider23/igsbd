import React from "react";
import {Routes,Route} from "react-router-dom";
import CreateDatabasePage from "./components/lab1/CreateDatabasePage";
import InsertDeletePage from "./components/lab2/InsertDeletePage";
import Navbar from "./components/Navbar";
import Select from './components/lab4/Select'

import IndexList from "./components/lab3/IndexList";

function App() {
  return (
  <>
    <Navbar/>

    <Routes>
      {<Route path="/" element={<CreateDatabasePage />} />}
      {<Route path="/lab2" element={<InsertDeletePage />} />}
      {<Route path="/lab3" element={<IndexList />} />}
      {<Route path="/lab4" element={<Select />} />}
    </Routes>
    </>
  );
}

export default App;
