import { Link, useNavigate } from "react-router-dom";
import "./Signup.css";
import React, { useState, useEffect } from "react";
import { auth, database } from "./firebase";
import {
  createUserWithEmailAndPassword,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged
} from "firebase/auth";
import { ref, set } from "firebase/database";

function Signup({ onSignup }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  const adminEmails = ["shyamnagarajan325@gmail.com", "ramsab3565@gmail.com", "admin3@example.com", "admin4@example.com"];

  // Check if user is already logged in on component mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is already signed in, redirect appropriately
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('uid', user.uid);
        
        if (adminEmails.includes(user.email)) {
          navigate("/Form");
        }
      } else {
        // Clear login status if no user is found
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('uid');
      }
      setCheckingAuth(false);
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [navigate, adminEmails]);

  // Check if the entered email is in the admin list
  useEffect(() => {
    setIsAdmin(adminEmails.includes(email));
  }, [email, adminEmails]);

  const handleSignup = async (e) => {
    e.preventDefault();
    
    // Check if the email is in the admin list
    if (!adminEmails.includes(email)) {
      setMessage("Only admin users can create an account.");
      setTimeout(() => setMessage(""), 4000);
      return;
    }
    
    setIsProcessing(true);
  
    try {
      // First set persistence to ensure login survives page refreshes
      await setPersistence(auth, browserLocalPersistence);
      
      // Create user account
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Prepare user data
      const userData = {
        name: name,
        email: email,
        createdAt: new Date().toISOString(),
        isAdmin: true
      };
       
      // Store user data in Firebase Realtime Database
      await set(ref(database, `users/${user.uid}`), userData);
      
      // Store the authentication token in localStorage for extra persistence
      const token = await user.getIdToken();
      localStorage.setItem('authToken', token);
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('uid', user.uid);
      
      // Store user data in localStorage for quick access on page refresh
      localStorage.setItem('userData', JSON.stringify(userData));
      localStorage.setItem('firebaseAuthUser', JSON.stringify(userData));
      
      setMessage("Account Created Successfully! Redirecting...");
      
      setTimeout(() => {
        if (onSignup) onSignup();
        navigate("/Form");
      }, 2000);
    } catch (error) {
      console.error("Signup error:", error);
      if (error.code === 'auth/email-already-in-use') {
        setMessage("Email already in use. Please use a different email or log in.");
      } else {
        setMessage("Failed to create account. Please try again.");
      }
      setTimeout(() => setMessage(""), 4000);
    } finally {
      setIsProcessing(false);
    }
  };
  
  if (checkingAuth) {
    return <div className="loading-container">Checking authentication status...</div>;
  }

  return (
    <div className="signupbox">
      <form className="signupbox1" onSubmit={handleSignup}>
        <h1 className="signuph1">Signup</h1>
        
        {/* Admin-only notice */}
        {/* <div className="admin-notice">
          <p>Only admin users can create and access accounts.</p>
          <p>Admin users can view and analyze records.</p>
        </div> */}
        
        <input
          className="signupinput"
          type="text"
          placeholder="Enter Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={{ textTransform: "uppercase" }}
          disabled={isProcessing}
        />
        <input
          className="signupinput"
          type="email"
          placeholder="Enter Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isProcessing}
        />
        <div className="password-container">
          <input
            className="signupinput-password"
            type={showPassword ? "text" : "password"}
            placeholder="Create Your Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isProcessing}
          />
        </div>
        <div className="signup-show">
          <label className="signup-show-password">
            <input
              type="checkbox"
              checked={showPassword}
              onChange={(e) => setShowPassword(e.target.checked)}
              disabled={isProcessing}
            />
            Show Password
          </label>
        </div>
        <button 
          type="submit" 
          className="signupbutton" 
          disabled={isProcessing}
        >
          {isProcessing ? "Processing..." : "Sign Up"}
        </button>
        {message && (
          <div className={`signupmessage ${message.includes("Successful") ? "success" : "error"}`}>
            {message}
          </div>
        )}
        <p className="login-link">
          Already have an account? <Link to="/">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default Signup;