import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate, useLocation } from "react-router-dom";
import Form from "./Form";
import CSVUploader from "./CSVUploader";
import Login from "./Login";
import Signup from "./Signup";
import { auth } from "./firebase";
import { signOut } from "firebase/auth";
import './App.css'; // Make sure to import the CSS

// Protected route component with redirect handling
const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

// Logout confirmation modal
function LogoutConfirmation({ onConfirm, onCancel }) {
  return (
    <div className="logout-modal">
      <div className="logout-modal-content">
        <h3>Confirm Logout</h3>
        <p>Are you sure you want to logout?</p>
        <div className="logout-buttons">
          <button onClick={onConfirm} className="confirm-btn">Logout</button>
          <button onClick={onCancel} className="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>
  );
}

// Main navigation with authentication - only shown for logged in users
function Navigation({ onLogout, isSidebarOpen, closeSidebar }) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  
  const handleLogoutClick = () => {
    setShowLogoutConfirm(true);
  };
  
  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    onLogout();
  };
  
  const cancelLogout = () => {
    setShowLogoutConfirm(false);
  };
  
  return (
    <>
      <nav className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <Link to="/form" className="nav-link" onClick={closeSidebar}>📋 Form</Link>
        <Link to="/csvuploader" className="nav-link" onClick={closeSidebar}>📂 File Upload</Link>
        <button className="logout-button nav-link" onClick={handleLogoutClick}>🚪 Logout</button>
      </nav>
      
      {showLogoutConfirm && (
        <LogoutConfirmation 
          onConfirm={confirmLogout} 
          onCancel={cancelLogout} 
        />
      )}
    </>
  );
}

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [redirectToLogin, setRedirectToLogin] = useState(false);

  // Check login status on app load
  useEffect(() => {
    const checkLoginStatus = () => {
      const loggedIn = localStorage.getItem("isLoggedIn") === "true";
      setIsLoggedIn(loggedIn);
      setIsLoading(false);
    };
    
    checkLoginStatus();
    
    // Listen for authentication state changes
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };
  
  const handleLogout = async () => {
    try {
      await signOut(auth);
      // Clear local storage
      localStorage.removeItem("isLoggedIn");
      localStorage.removeItem("uid");
      localStorage.removeItem("authToken");
      localStorage.removeItem("userData");
      localStorage.removeItem("firebaseAuthUser");
      
      setIsLoggedIn(false);
      closeSidebar();
      setRedirectToLogin(true);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };
  
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setRedirectToLogin(false);
  };

  if (isLoading) {
    return <div className="loading-container">Loading...</div>;
  }

  // If redirectToLogin is true, we should redirect to the login page
  if (redirectToLogin) {
    return <Navigate to="/" replace />;
  }

  return (
    <Router>
      <div className="app-container">
        {isLoggedIn && (
          <button 
            className="mobile-toggle" 
            onClick={toggleSidebar}
            aria-label="Toggle navigation menu"
          >
            {isSidebarOpen ? "✕" : "☰"}
          </button>
        )}
        
        {isLoggedIn && (
          <Navigation 
            onLogout={handleLogout} 
            isSidebarOpen={isSidebarOpen} 
            closeSidebar={closeSidebar} 
          />
        )}
        
        <div className="main-content">
          <Routes>
            <Route path="/" element={isLoggedIn ? <Navigate to="/form" replace /> : <Login onLogin={handleLoginSuccess} />} />
            <Route path="/signup" element={isLoggedIn ? <Navigate to="/form" replace /> : <Signup onSignup={handleLoginSuccess} />} />
            <Route path="/form" element={
              <ProtectedRoute>
                <Form />
              </ProtectedRoute>
            } />
            <Route path="/csvuploader" element={
              <ProtectedRoute>
                <CSVUploader />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;