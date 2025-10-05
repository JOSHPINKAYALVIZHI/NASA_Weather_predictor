import React, { useState, useEffect, useRef } from 'react';

const InteractiveMap = ({ onLocationSelect, height = "500px" }) => {
  const [mounted, setMounted] = useState(false);
  const [leafletLoaded, setLeafletLoaded] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState({ lat: '', lng: '' });
  const [locationName, setLocationName] = useState('');
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const mapRef = useRef(null);

  useEffect(() => {
    setMounted(true);

    if (typeof window !== 'undefined') {
      const loadLeaflet = async () => {
        try {
          if (!document.querySelector('link[href*="leaflet"]')) {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);
          }

          const L = await import('leaflet');
          window.L = L;

          setLeafletLoaded(true);
          setTimeout(() => {
            initializeMap();
          }, 200);
        } catch (error) {
          console.warn('Leaflet not available, using fallback interface');
          setShowFallback(true);
        }
      };

      loadLeaflet();
    }
  }, []);

  const initializeMap = () => {
    if (mapInitialized || !window.L) return;

    const L = window.L;
    const mapContainer = document.getElementById('map');

    if (!mapContainer || mapRef.current) return;

    try {
      mapContainer.innerHTML = '';

      const map = L.map('map').setView([20.5937, 78.9629], 5);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      map.on('click', async (e) => {
        const { lat, lng } = e.latlng;
        console.log('Map clicked:', lat, lng);

        setSelectedCoords({ lat: lat.toFixed(6), lng: lng.toFixed(6) });
        await getLocationName(lat, lng);
        onLocationSelect({ lat, lng });

        if (window.currentMarker) {
          map.removeLayer(window.currentMarker);
        }

        window.currentMarker = L.marker([lat, lng]).addTo(map);
      });

      window.mapInstance = map;
      mapRef.current = map;
      setMapInitialized(true);
      console.log('Map initialized successfully');
    } catch (error) {
      console.error('Error initializing map:', error);
      setShowFallback(true);
    }
  };

  const getLocationName = async (lat, lng) => {
    setIsLoadingLocation(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'NASA-Weather-Predictor/1.0'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data && data.display_name) {
          setLocationName(data.display_name);
        } else {
          setLocationName(`Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`);
        }
      } else {
        setLocationName(`Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`);
      }
    } catch (error) {
      console.warn('Reverse geocoding failed:', error);
      setLocationName(`Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`);
    }
    setIsLoadingLocation(false);
  };

  const searchLocation = async (query) => {
    if (!query.trim()) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=in`,
        {
          headers: {
            'User-Agent': 'NASA-Weather-Predictor/1.0'
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);

        if (data.length > 0) {
          const firstResult = data[0];
          const lat = parseFloat(firstResult.lat);
          const lng = parseFloat(firstResult.lon);

          setSelectedCoords({ lat: lat.toFixed(6), lng: lng.toFixed(6) });
          setLocationName(firstResult.display_name);

          if (window.mapInstance) {
            window.mapInstance.setView([lat, lng], 10);

            if (window.currentMarker) {
              window.mapInstance.removeLayer(window.currentMarker);
            }

            window.currentMarker = window.L.marker([lat, lng]).addTo(window.mapInstance);
          }

          onLocationSelect({ lat, lng });
        }
      }
    } catch (error) {
      console.warn('Location search failed:', error);
    }
  };

  if (!mounted) {
    return (
      <div style={{ height, backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading map...</p>
      </div>
    );
  }

  if (showFallback) {
    return (
      <div style={{ height, marginBottom: '20px' }}>
        <h3 style={{ marginBottom: '10px', textAlign: 'center' }}>
          Location Selection
        </h3>
        <div style={{
          height: '100%',
          backgroundColor: '#f8f9fa',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '8px',
          border: '2px dashed #dee2e6',
          padding: '20px'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h4 style={{ color: '#495057', marginBottom: '10px' }}>📍 Manual Location Input</h4>
            <p style={{ color: '#6c757d', fontSize: '0.9rem' }}>
              Enter coordinates or use the location name field below
            </p>
          </div>

          <div style={{ display: 'flex', gap: '15px', marginBottom: '15px' }}>
            <div style={{ textAlign: 'center' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px', fontWeight: 'bold' }}>
                Latitude
              </label>
              <input
                id="latInput"
                type="number"
                step="any"
                placeholder="28.6139"
                min="-90"
                max="90"
                style={{
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ced4da',
                  width: '120px',
                  fontSize: '0.9rem'
                }}
              />
            </div>
            <div style={{ textAlign: 'center' }}>
              <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px', fontWeight: 'bold' }}>
                Longitude
              </label>
              <input
                id="lngInput"
                type="number"
                step="any"
                placeholder="77.2090"
                min="-180"
                max="180"
                style={{
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ced4da',
                  width: '120px',
                  fontSize: '0.9rem'
                }}
              />
            </div>
          </div>

          <button
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '5px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 'bold'
            }}
            onClick={() => {
              const latInput = document.getElementById('latInput');
              const lngInput = document.getElementById('lngInput');
              const lat = parseFloat(latInput.value);
              const lng = parseFloat(lngInput.value);

              if (!isNaN(lat) && !isNaN(lng) &&
                  lat >= -90 && lat <= 90 &&
                  lng >= -180 && lng <= 180) {
                onLocationSelect({ lat, lng });
              } else {
                alert('Please enter valid coordinates (Latitude: -90 to 90, Longitude: -180 to 180)');
              }
            }}
          >
            Set Location
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: 'auto', marginBottom: '20px' }}>
      <h3 style={{ marginBottom: '15px', textAlign: 'center', color: '#0369a1' }}>
        🗺️ Select Location on Map
      </h3>

      {/* Search Box */}
      <div style={{
        marginBottom: '15px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="🔍 Search for a city (e.g., Mumbai, Delhi)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                searchLocation(e.target.value);
              }
            }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '6px',
              border: '1px solid #ced4da',
              fontSize: '0.9rem'
            }}
          />
          <button
            style={{
              backgroundColor: '#28a745',
              color: 'white',
              padding: '10px 15px',
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
              fontSize: '0.9rem'
            }}
            onClick={() => searchLocation(searchQuery)}
          >
            Search
          </button>
        </div>

        {searchResults.length > 0 && (
          <div style={{
            marginTop: '10px',
            maxHeight: '150px',
            overflowY: 'auto',
            border: '1px solid #dee2e6',
            borderRadius: '4px'
          }}>
            {searchResults.map((result, index) => (
              <div
                key={index}
                style={{
                  padding: '8px 12px',
                  borderBottom: index < searchResults.length - 1 ? '1px solid #eee' : 'none',
                  cursor: 'pointer',
                  backgroundColor: 'white'
                }}
                onClick={() => {
                  const lat = parseFloat(result.lat);
                  const lng = parseFloat(result.lon);
                  setSelectedCoords({ lat: lat.toFixed(6), lng: lng.toFixed(6) });
                  setLocationName(result.display_name);

                  if (window.mapInstance) {
                    window.mapInstance.setView([lat, lng], 10);

                    if (window.currentMarker) {
                      window.mapInstance.removeLayer(window.currentMarker);
                    }

                    window.currentMarker = window.L.marker([lat, lng]).addTo(window.mapInstance);
                  }

                  onLocationSelect({ lat, lng });
                  setSearchResults([]);
                }}
              >
                {result.display_name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Coordinate Display */}
      <div style={{
        marginBottom: '15px',
        padding: '15px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <div style={{ display: 'flex', gap: '15px', marginBottom: '10px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px', fontWeight: 'bold' }}>
              Latitude
            </label>
            <input
              type="text"
              value={selectedCoords.lat}
              readOnly
              placeholder="Click on map..."
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ced4da',
                backgroundColor: '#fff',
                fontSize: '0.9rem'
              }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px', fontWeight: 'bold' }}>
              Longitude
            </label>
            <input
              type="text"
              value={selectedCoords.lng}
              readOnly
              placeholder="Click on map..."
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: '4px',
                border: '1px solid #ced4da',
                backgroundColor: '#fff',
                fontSize: '0.9rem'
              }}
            />
          </div>
        </div>

        <div style={{ marginTop: '10px' }}>
          <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px', fontWeight: 'bold' }}>
            Location Name
          </label>
          <div style={{
            padding: '8px',
            borderRadius: '4px',
            border: '1px solid #ced4da',
            backgroundColor: '#fff',
            fontSize: '0.9rem',
            minHeight: '20px',
            display: 'flex',
            alignItems: 'center'
          }}>
            {isLoadingLocation ? (
              <span style={{ color: '#6c757d' }}>Getting location name...</span>
            ) : (
              <span>{locationName || 'Click on map to get location name'}</span>
            )}
          </div>
        </div>
      </div>

      <div
        id="map"
        style={{
          height: '450px',
          width: '100%',
          borderRadius: '8px',
          backgroundColor: '#e9ecef',
          border: '2px solid #dee2e6'
        }}
      >
        {!leafletLoaded && (
          <div style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            color: '#6c757d'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🗺️</div>
            <p style={{ fontSize: '1.1rem', marginBottom: '10px' }}>Loading interactive map...</p>
            <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>This may take a few seconds</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveMap;
