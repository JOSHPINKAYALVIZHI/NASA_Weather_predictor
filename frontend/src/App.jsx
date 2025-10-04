import { useState } from "react";
import axios from "axios";

function App() {
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("2025-10-04");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchWeather = async () => {
    if (!location) {
      setError("Please enter a location.");
      return;
    }
    setLoading(true);
    setData(null);
    setError("");
    try {
      const res = await axios.get(`http://127.0.0.1:5000/weather?location=${location}&date=${date}`);
      setData(res.data);
    } catch (err) {
      setError("Failed to fetch weather data. Is the backend server running?");
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div style={{ textAlign: "center", padding: "50px", backgroundColor: "#e0f2fe", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "2rem", color: "#0369a1" }}>🌦️ NASA Weather Predictor</h1>

      <input
        type="text"
        placeholder="Enter location"
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        style={{ padding: "10px", borderRadius: "8px", border: "1px solid #0369a1", marginTop: "20px", width: "200px" }}
      />
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        style={{ padding: "10px", borderRadius: "8px", border: "1px solid #0369a1", marginTop: "10px", marginLeft: "10px" }}
      />
      <br />
      <button
        onClick={fetchWeather}
        style={{ marginTop: "15px", backgroundColor: "#0284c7", color: "white", padding: "10px 20px", borderRadius: "8px", border: "none", cursor: "pointer" }}
        disabled={loading}
      >
        {loading ? "Loading..." : "Get Weather"}
      </button>

      {error && <p style={{ color: "red", marginTop: "20px" }}>{error}</p>}

      {data && (
        <div
          style={{
            marginTop: "30px",
            backgroundColor: "white",
            display: "inline-block",
            padding: "25px",
            borderRadius: "15px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            textAlign: "left",
            minWidth: "250px"
          }}
        >
          <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
            {data.location}
            <br/>
            <span style={{ fontSize: "0.9rem", color: "#555" }}>{data.date}</span>
          </h2>
          <p>🌡️ Temperature: {data.temperature}°C</p>
          <p>💧 Humidity: {data.humidity}%</p>
          <p>🌧️ Rainfall: {data.rainfall} mm</p>
          <p>💨 Wind Speed: {data.wind_speed} km/h</p>
          <p style={{ marginTop: "15px", fontWeight: "bold", textAlign: "center" }}>
            Condition: {data.condition}
          </p>
        </div>
      )}
    </div>
  );
}

export default App;