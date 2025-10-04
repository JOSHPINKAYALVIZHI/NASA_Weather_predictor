import { useState } from "react";
import axios from "axios";

function App() {
  const [location, setLocation] = useState("");
  const [data, setData] = useState(null);

  const fetchWeather = async () => {
    const res = await axios.get(`http://127.0.0.1:5000/weather?location=${location}`);
    setData(res.data);
  };

  return (
    <div style={{ textAlign: "center", padding: "50px", backgroundColor: "#e0f2fe", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "2rem", color: "#0369a1" }}>🌦️ NASA Weather Predictor</h1>

      <input
        type="text"
        placeholder="Enter location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        style={{
          padding: "10px",
          borderRadius: "8px",
          border: "1px solid #0369a1",
          marginTop: "20px",
          width: "200px",
        }}
      />
      <br />
      <button
        onClick={fetchWeather}
        style={{
          marginTop: "15px",
          backgroundColor: "#0284c7",
          color: "white",
          padding: "10px 20px",
          borderRadius: "8px",
          border: "none",
          cursor: "pointer",
        }}
      >
        Get Weather
      </button>

      {data && (
        <div
          style={{
            marginTop: "30px",
            backgroundColor: "white",
            display: "inline-block",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
          }}
        >
          <h2>{data.location}</h2>
          <p>🌡️ Temperature: {data.temperature}°C</p>
          <p>💧 Humidity: {data.humidity}%</p>
          <p>🌧️ Rainfall: {data.rainfall} mm</p>
        </div>
      )}
    </div>
  );
}

export default App;
