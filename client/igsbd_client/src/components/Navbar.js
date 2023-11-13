import React, { Component } from "react";
import "./Navbar.css";
import { Link, useLocation } from 'react-router-dom';
const Navbar = () => {
    const location = useLocation();
    const path = location.pathname;
  
    const renderLeftButton = () => {
      if (path === '/lab2') {
        return <Link to="/">Lab1</Link>;
      } else if (path === '/lab3') {
        return <Link to="/lab2">Lab2</Link>;
      } else {
        return null;
      }
    };
  
    const renderRightButton = () => {
      if (path === '/') {
        return <Link to="/lab2">Lab2</Link>;
      } else if (path === '/lab1') {
        return <Link to="/lab3">Lab3</Link>;
      } else if( path ==='/lab3') {
        return null;
      }else{
        return <Link to ='/lab3'>Lab3</Link>
      }
    };
  
    return (
      <div className="navbar">
        <div className="left">{renderLeftButton()}</div>
        <div className="right">{renderRightButton()}</div>
      </div>
    );
  };
export default Navbar;
