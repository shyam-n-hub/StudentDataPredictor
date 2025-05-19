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
  const [fileName, setFileName] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [bulkResult, setBulkResult] = useState([]);
  const [chartData, setChartData] = useState([]);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
      setFileName(e.target.files[0].name);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setFileName(e.dataTransfer.files[0].name);
    }
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
      
      <div className={`file-input-container ${isDragOver ? 'drag-over' : ''} ${fileName ? 'file-selected' : ''}`}
           onDragOver={handleDragOver}
           onDragLeave={handleDragLeave}
           onDrop={handleDrop}>
        <div className="file-input-wrapper">
          <input 
            type="file" 
            accept=".csv, .xlsx" 
            onChange={handleFileChange} 
          />
          <div className="file-input-button">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            {fileName ? "Change File" : "Choose CSV or Excel File"}
          </div>
        </div>
        {fileName && (
          <div className="file-name-display">
            {fileName}
          </div>
        )}
      </div>

      <button 
        className="predict-button" 
        onClick={handleUpload}
        disabled={!file}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
          <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083l6-15Zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471-.47 1.178Z"/>
        </svg>
        Click to Predict
      </button>

      {bulkResult.length > 0 && (
        <div className="bulk-result">
          <h4>📋 Prediction Result</h4>
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