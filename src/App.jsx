import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Form from "./Form";
import CSVUploader from "./CSVUploader";
import './App.css'; // Make sure to import the CSS

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <Router>
      <div className="app-container">
        <button 
          className="mobile-toggle" 
          onClick={toggleSidebar}
          aria-label="Toggle navigation menu"
        >
          {isSidebarOpen ? "✕" : "☰"}
        </button>
        
        <nav className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
          <Link to="/" className="nav-link" onClick={closeSidebar}>📋 Form</Link>
          <Link to="/CSVUploader" className="nav-link" onClick={closeSidebar}>📂 File Upload</Link>
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