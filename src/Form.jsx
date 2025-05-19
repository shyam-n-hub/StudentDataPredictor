import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Form.css";
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, BarElement, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale);

function Form() {
  const [formData, setFormData] = useState({
    gender: "0",
    study_time: "",
    attendance: "",
    previous_marks: "",
    behavior_score: "",
    internet_usage: "1"
  });

  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState("");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem("predictionHistory")) || [];
    setHistory(savedHistory);
  }, []);

  useEffect(() => {
    localStorage.setItem("predictionHistory", JSON.stringify(history));
  }, [history]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setPrediction(null);
    setError("");

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/predict`, formData);
      const result = response.data.performance;
      setPrediction(result);

      const newEntry = { ...formData, prediction: result };
      setHistory([newEntry, ...history]);
    } catch (err) {
      setError("Something went wrong. Make sure the backend is running.");
    }
  };

  return (
    <div className="App">
      <h1>🎓 Student Performance Analyzer</h1>
      <form onSubmit={handleSubmit}>
        <label>Gender:
          <select name="gender" onChange={handleChange} value={formData.gender}>
            <option value="0">Male</option>
            <option value="1">Female</option>
          </select>
        </label>

        <label>Study Time (hours/day):
          <input type="number" name="study_time" value={formData.study_time} onChange={handleChange} required />
        </label>

        <label>Attendance (%):
          <input type="number" name="attendance" value={formData.attendance} onChange={handleChange} required />
        </label>

        <label>Previous Marks:
          <input type="number" name="previous_marks" value={formData.previous_marks} onChange={handleChange} required />
        </label>

        <label>Behavior Score (1 to 5):
          <input type="number" name="behavior_score" value={formData.behavior_score} onChange={handleChange} required />
        </label>

        <label>Internet Usage:
          <select name="internet_usage" onChange={handleChange} value={formData.internet_usage}>
            <option value="0">Low</option>
            <option value="1">High</option>
          </select>
        </label>

        <button type="submit">Predict Performance</button>
      </form>

      {prediction && (
        <div className="result">
          <h2>📊 Prediction: <span>{prediction}</span></h2>
        </div>
      )}

      {error && <p style={{ color: "red" }}>{error}</p>}

      {history.length > 0 && (
        <div className="history">
          <h3>📚 Prediction History</h3>
          <table>
            <thead>
              <tr>
                <th>Gender</th>
                <th>Study Time</th>
                <th>Attendance</th>
                <th>Marks</th>
                <th>Behavior</th>
                <th>Internet</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry, index) => (
                <tr key={index}>
                  <td>{entry.gender === "0" ? "Male" : "Female"}</td>
                  <td>{entry.study_time}</td>
                  <td>{entry.attendance}</td>
                  <td>{entry.previous_marks}</td>
                  <td>{entry.behavior_score}</td>
                  <td>{entry.internet_usage === "1" ? "High" : "Low"}</td>
                  <td>{entry.prediction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {history.length > 0 && (
        <div className="chart-container">
          <h3>📈 Prediction Summary Chart</h3>
          <Bar
            data={{
              labels: ["Excellent", "Average", "Poor"],
              datasets: [{
                label: "Number of Students",
                data: [
                  history.filter(h => h.prediction === "Excellent").length,
                  history.filter(h => h.prediction === "Average").length,
                  history.filter(h => h.prediction === "Poor").length
                ],
                backgroundColor: ["green", "orange", "red"]
              }]
            }}
            options={{
              responsive: true,
              scales: {
                y: { beginAtZero: true }
              }
            }}
          />
        </div>
      )}
    </div>
  );
}

export default Form;
