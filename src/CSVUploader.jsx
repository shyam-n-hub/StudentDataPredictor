import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from "recharts";
import './CSVUploader.css';


const COLORS = {
  Poor: "#FF6B6B",
  Average: "#FFD93D",
  Excellent: "#6BCB77"
};

function CSVUploader() {
  const [file, setFile] = useState(null);
  const [bulkResult, setBulkResult] = useState([]);
  const [chartData, setChartData] = useState([]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
const response = await axios.post(`${import.meta.env.VITE_API_BASE_URL}/predict-bulk`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setBulkResult(response.data);
    } catch (err) {
      console.error("Error uploading file", err);
    }
  };

  useEffect(() => {
    if (bulkResult.length > 0) {
      const counts = { Poor: 0, Average: 0, Excellent: 0 };
      bulkResult.forEach(row => {
        counts[row["Predicted Performance"]] += 1;
      });

      const chartReady = Object.keys(counts).map(key => ({
        name: key,
        value: counts[key],
        color: COLORS[key]
      }));

      setChartData(chartReady);
    }
  }, [bulkResult]);

  return (
    <div className="csv-upload">
      <h3>Upload File for Bulk Prediction</h3>
<input type="file" accept=".csv, .xlsx" onChange={handleFileChange} />
      <button onClick={handleUpload}>Click to Predict</button>

      {bulkResult.length > 0 && (
        <div className="bulk-result">
          <h4>📋Prediction Result</h4>
          <table>
            <thead>
              <tr>
                <th>Gender</th>
                <th>Study Time</th>
                <th>Attendance</th>
                <th>Previous Marks</th>
                <th>Behavior</th>
                <th>Internet</th>
                <th>Prediction</th>
              </tr>
            </thead>
            <tbody>
              {bulkResult.map((row, i) => (
                <tr key={i}>
                  <td>{row.gender === 0 ? "Male" : "Female"}</td>
                  <td>{row.study_time}</td>
                  <td>{row.attendance}</td>
                  <td>{row.previous_marks}</td>
                  <td>{row.behavior_score}</td>
                  <td>{row.internet_usage === 1 ? "High" : "Low"}</td>
                  <td>{row["Predicted Performance"]}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: "40px" }}>
            <h4>📈 Chart: Prediction Summary</h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Count" fill="#8884d8">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default CSVUploader;
