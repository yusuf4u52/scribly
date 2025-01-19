import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css"; // Import CSS file for styling

const API_URL = process.env.REACT_APP_API_URL;

function App() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ username: "", password: "" });
  const [message, setMessage] = useState("");

  // Fetch user data from protected route
  const fetchUser = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const { data } = await axios.get(`${API_URL}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(data.user);
      setMessage("");
    } catch (error) {
      setUser(null);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const register = async () => {
    try {
      await axios.post(`${API_URL}/register`, form);
      setMessage("Registered successfully! Please log in.");
    } catch (error) {
      setMessage("Registration failed.");
    }
  };

  const login = async () => {
    try {
      const { data } = await axios.post(`${API_URL}/login`, form);
      // Store the JWT token in localStorage
      localStorage.setItem("authToken", data.token);
      fetchUser();
    } catch (error) {
      setMessage("Login failed. Check your credentials.");
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem("authToken");
      setUser(null);
      setMessage("Logged out successfully.");
    } catch (error) {
      setMessage("Logout failed.");
    }
  };

  return (
    <div className="app">
      <div className="container">
        <h1 className="title">
          {user ? `Welcome, ${user.username}` : "Authentication"}
        </h1>

        {message && <p className="message">{message}</p>}

        {!user ? (
          <div className="form">
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={form.username}
              onChange={handleInputChange}
              className="input"
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleInputChange}
              className="input"
            />
            <div className="buttons">
              <button onClick={register} className="button">
                Sign Up
              </button>
              <button onClick={login} className="button">
                Login
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="welcome">
              You are logged in as <strong>{user.username}</strong>.
            </p>
            <button onClick={logout} className="button logout">
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
