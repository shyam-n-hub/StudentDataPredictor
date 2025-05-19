import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Form from "./Form";
import CSVUploader from "./CSVUploader";
import './App.css'; // Make sure to import the CSS

function App() {
  return (
    <Router>
      <div className="app-container">
        <nav className="sidebar">
          <Link to="/" className="nav-link">📋 Form</Link>
          <Link to="/CSVUploader" className="nav-link">📂 File Upload</Link>
        </nav>

        <div className="main-content">
          <Routes>
            <Route path="/" element={<Form />} />
            <Route path="/CSVUploader" element={<CSVUploader />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
