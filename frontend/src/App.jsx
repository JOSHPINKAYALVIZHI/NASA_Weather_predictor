import { useState } from "react";
import axios from "axios";
import InteractiveMap from "./components/InteractiveMap";

function App() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationInput, setLocationInput] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState("12:00");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchWeather = async () => {
    if (!selectedLocation && !locationInput) {
      setError("Please select a location on the map or enter a location name.");
      return;
    }
    setLoading(true);
    setData(null);
    setError("");
    try {
      const params = new URLSearchParams();

      // Add coordinates if available
      if (selectedLocation) {
        params.append("lat", selectedLocation.lat);
        params.append("lng", selectedLocation.lng);
      }

      // Add location name if provided
      if (locationInput.trim()) {
        params.append("location", locationInput.trim());
      }

      params.append("date", date);
      params.append("time", time);

      const res = await axios.get(`http://127.0.0.1:5000/weather?${params}`);
      setData(res.data);
    } catch (err) {
      setError("Failed to fetch weather data. Is the backend server running?");
      console.error(err);
    }
    setLoading(false);
  };

  const handleLocationSelect = (coords) => {
    setSelectedLocation(coords);
    setError(""); // Clear any previous errors
  };

  return (
    <div style={{ textAlign: "center", padding: "20px", backgroundColor: "#e0f2fe", minHeight: "100vh" }}>
      <h1 style={{ fontSize: "2.5rem", color: "#0369a1", marginBottom: "30px", fontWeight: "bold" }}>🌦️ NASA Weather Predictor</h1>

      {/* Map Section */}
      <div style={{
        maxWidth: "1000px",
        margin: "0 auto 40px auto",
        backgroundColor: "white",
        padding: "30px",
        borderRadius: "20px",
        boxShadow: "0 15px 35px rgba(0,0,0,0.15)"
      }}>
        <InteractiveMap onLocationSelect={handleLocationSelect} height="500px" />
      </div>

      {/* Weather Controls Section */}
      <div style={{
        maxWidth: "800px",
        margin: "0 auto 30px auto",
        backgroundColor: "white",
        padding: "30px",
        borderRadius: "20px",
        boxShadow: "0 15px 35px rgba(0,0,0,0.15)"
      }}>
        <h3 style={{ marginBottom: "25px", color: "#0369a1", fontSize: "1.3rem", fontWeight: "bold" }}>⚙️ Weather Settings</h3>

        <div style={{
          display: "flex",
          gap: "25px",
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "wrap",
          marginBottom: "25px"
        }}>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#374151" }}>📅 Date:</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                padding: "12px",
                borderRadius: "10px",
                border: "2px solid #0369a1",
                fontSize: "1rem",
                width: "160px"
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold", color: "#374151" }}>🕐 Time:</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              style={{
                padding: "12px",
                borderRadius: "10px",
                border: "2px solid #0369a1",
                fontSize: "1rem",
                width: "160px"
              }}
            />
          </div>
        </div>

        <button
          onClick={fetchWeather}
          style={{
            backgroundColor: "#0284c7",
            color: "white",
            padding: "15px 35px",
            borderRadius: "12px",
            border: "none",
            cursor: "pointer",
            fontSize: "1.1rem",
            fontWeight: "bold",
            marginBottom: "20px",
            transition: "all 0.3s ease"
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = "#0369a1"}
          onMouseOut={(e) => e.target.style.backgroundColor = "#0284c7"}
          disabled={loading}
        >
          {loading ? "🔄 Getting Weather..." : "🌤️ Get Weather"}
        </button>

        {/* Alternative Location Search */}
        <div style={{
          marginTop: "25px",
          paddingTop: "25px",
          borderTop: "2px solid #e0e0e0"
        }}>
          <h4 style={{ marginBottom: "20px", color: "#0369a1", fontSize: "1.1rem" }}>🔍 Or search by location name:</h4>
          <div style={{
            display: "flex",
            gap: "12px",
            justifyContent: "center",
            alignItems: "center",
            maxWidth: "500px",
            margin: "0 auto"
          }}>
            <input
              type="text"
              placeholder="Enter city name (e.g., Mumbai, Delhi)"
              value={locationInput}
              onChange={(e) => setLocationInput(e.target.value)}
              style={{
                flex: 1,
                padding: "12px",
                borderRadius: "10px",
                border: "2px solid #0369a1",
                fontSize: "1rem"
              }}
            />
            <button
              onClick={fetchWeather}
              style={{
                backgroundColor: "#059669",
                color: "white",
                padding: "12px 25px",
                borderRadius: "10px",
                border: "none",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: "bold",
                transition: "all 0.3s ease"
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = "#047857"}
              onMouseOut={(e) => e.target.style.backgroundColor = "#059669"}
              disabled={loading}
            >
              Search
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div style={{
          maxWidth: "600px",
          margin: "20px auto",
          padding: "15px",
          backgroundColor: "#fee2e2",
          border: "1px solid #f87171",
          borderRadius: "10px",
          color: "#dc2626"
        }}>
          {error}
        </div>
      )}

      {data && (
        <div
          style={{
            marginTop: "30px",
            backgroundColor: "white",
            display: "inline-block",
            padding: "30px",
            borderRadius: "15px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            textAlign: "left",
            minWidth: "300px",
            maxWidth: "600px"
          }}
        >
          <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#0369a1" }}>
            {data.location}
            <br/>
            <span style={{ fontSize: "0.9rem", color: "#555" }}>{data.date} at {data.time}</span>
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "15px" }}>
            <div style={{ padding: "15px", backgroundColor: "#f8fafc", borderRadius: "8px" }}>
              <p style={{ margin: "5px 0", fontSize: "0.9rem", color: "#64748b" }}>🌡️ Temperature</p>
              <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#dc2626" }}>{data.temperature}°C</p>
            </div>
            <div style={{ padding: "15px", backgroundColor: "#f8fafc", borderRadius: "8px" }}>
              <p style={{ margin: "5px 0", fontSize: "0.9rem", color: "#64748b" }}>💧 Humidity</p>
              <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#2563eb" }}>{data.humidity}%</p>
            </div>
            <div style={{ padding: "15px", backgroundColor: "#f8fafc", borderRadius: "8px" }}>
              <p style={{ margin: "5px 0", fontSize: "0.9rem", color: "#64748b" }}>🌧️ Rainfall</p>
              <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#059669" }}>{data.rainfall} mm</p>
            </div>
            <div style={{ padding: "15px", backgroundColor: "#f8fafc", borderRadius: "8px" }}>
              <p style={{ margin: "5px 0", fontSize: "0.9rem", color: "#64748b" }}>💨 Wind Speed</p>
              <p style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#7c3aed" }}>{data.wind_speed} km/h</p>
            </div>
          </div>
          <p style={{ marginTop: "20px", fontWeight: "bold", textAlign: "center", fontSize: "1.2rem", color: "#0369a1" }}>
            Condition: {data.condition}
          </p>
        </div>
      )}
    </div>
  );
}

export default App;