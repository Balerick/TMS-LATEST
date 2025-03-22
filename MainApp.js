import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import App from '../App'; // Corrected import path

function MainApp() {
  return (
    <Router>
      <App />
    </Router>
  );
}

export default MainApp;