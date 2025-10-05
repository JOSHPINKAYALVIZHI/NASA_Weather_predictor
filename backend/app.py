from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import random
from datetime import datetime, time
import json

app = Flask(__name__)
CORS(app)

def get_weather_data(lat, lon, start_date, end_date):
    """
    Fetch weather data from NASA POWER API

    Parameters:
    - lat: Latitude
    - lon: Longitude
    - start_date: Start date in YYYYMMDD format
    - end_date: End date in YYYYMMDD format

    Returns:
    - Dictionary with weather data or None if error
    """
    # NASA POWER API endpoint
    api_url = (
        f"https://power.larc.nasa.gov/api/temporal/daily/point?"
        f"parameters=T2M,PRECTOTCORR,WS10M,RH2M"
        f"&start={start_date}&end={end_date}"
        f"&latitude={lat}&longitude={lon}"
        f"&community=RE&format=JSON"
    )

    try:
        # Make API request
        response = requests.get(api_url, timeout=10)
        response.raise_for_status()

        # Parse JSON response
        data = response.json()

        # Extract the most recent day's data
        if 'properties' in data and 'parameter' in data['properties']:
            params = data['properties']['parameter']

            # Check if we have the required parameters
            if not all(key in params for key in ['T2M', 'PRECTOTCORR', 'WS10M', 'RH2M']):
                return None

            # Get the last available date (most recent data)
            dates = list(params.get('T2M', {}).keys())
            if not dates:
                return None

            latest_date = dates[-1]

            # Extract values and check for valid data (-999 often indicates missing data)
            temperature_kelvin = params['T2M'][latest_date]
            precipitation = params['PRECTOTCORR'][latest_date]
            wind_speed = params['WS10M'][latest_date]
            humidity = params['RH2M'][latest_date]

            # Check for invalid/missing data (NASA uses -999 for missing values)
            if (temperature_kelvin <= -999 or precipitation <= -999 or
                wind_speed <= -999 or humidity <= -999):
                return None

            # Convert temperature from Kelvin to Celsius
            temperature_celsius = temperature_kelvin - 273.15

            # Validate temperature range (reasonable Earth temperatures)
            if not (-50 <= temperature_celsius <= 60):
                return None

            # Validate other parameters
            if not (0 <= humidity <= 100):
                return None

            if wind_speed < 0:
                return None

            return {
                'temperature': round(temperature_celsius, 1),
                'humidity': round(humidity, 1),
                'rainfall': round(precipitation, 1),
                'wind_speed': round(wind_speed, 1),
                'date': latest_date
            }

        return None

    except requests.exceptions.RequestException as e:
        print(f"API request error: {e}")
        return None
    except (KeyError, ValueError, TypeError) as e:
        print(f"Data parsing error: {e}")
        return None

@app.route("/weather", methods=["GET"])
def get_weather():
    # Get parameters from request
    lat = request.args.get("lat")
    lng = request.args.get("lng")
    location = request.args.get("location", "Unknown Location")
    date_param = request.args.get("date", datetime.now().strftime("%Y-%m-%d"))
    time_param = request.args.get("time", "12:00")

    # If coordinates are provided, use them to determine location
    if lat and lng:
        try:
            lat_float = float(lat)
            lng_float = float(lng)
            # Here you would typically use reverse geocoding to get location name
            # For now, we'll create a simple location identifier
            location = f"Lat: {lat_float:.4f}, Lng: {lng_float:.4f}"
        except ValueError:
            return jsonify({"error": "Invalid coordinates provided"}), 400

    # Validate date format
    try:
        input_date = datetime.strptime(date_param, "%Y-%m-%d")
    except ValueError:
        return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400

    # Validate time format
    try:
        datetime.strptime(time_param, "%H:%M")
    except ValueError:
        return jsonify({"error": "Invalid time format. Use HH:MM"}), 400

    # Use coordinates if available, otherwise we'll need location-based API call
    if lat and lng:
        # Convert date to YYYYMMDD format for NASA API
        start_date = input_date.strftime("%Y%m%d")
        end_date = start_date  # Single day request

        # Try to get real NASA data
        nasa_data = get_weather_data(lat, lng, start_date, end_date)

        if nasa_data:
            # Use real NASA data
            temperature = nasa_data['temperature']
            humidity = nasa_data['humidity']
            rainfall = nasa_data['rainfall']
            wind_speed = nasa_data['wind_speed']
            print(f"Using NASA API data for {lat_float:.4f}, {lng_float:.4f}")
        else:
            # Fallback to simulated data if NASA API fails
            print(f"NASA API failed, using simulated data for {lat_float:.4f}, {lng_float:.4f}")
            temperature = 25.0 + (abs(lat_float) - 23.5) * 0.5
            temperature = round(temperature + random.uniform(-5, 5), 1)
            humidity = random.randint(40, 90)
            rainfall = round(random.uniform(0, 10), 1)
            wind_speed = round(random.uniform(5, 25), 1)
    else:
        # No coordinates provided, use simulated data for default location
        lat_float = 20.5937  # Default to India center
        lng_float = 78.9629
        temperature = 25.0
        humidity = random.randint(40, 90)
        rainfall = round(random.uniform(0, 10), 1)
        wind_speed = round(random.uniform(5, 25), 1)

    # Determine weather condition based on data
    if rainfall > 5:
        condition = "Rainy"
    elif humidity > 80:
        condition = "Cloudy"
    elif temperature > 30:
        condition = "Hot and Sunny"
    else:
        condition = "Clear"

    # Create response data
    data = {
        "location": location,
        "coordinates": {
            "lat": float(lat) if lat else None,
            "lng": float(lng) if lng else None
        },
        "date": date_param,
        "time": time_param,
        "temperature": temperature,
        "humidity": humidity,
        "rainfall": rainfall,
        "wind_speed": wind_speed,
        "condition": condition,
        "data_source": "NASA POWER API" if (lat and lng and nasa_data) else "Simulated Data"
    }

    return jsonify(data)

if __name__ == "__main__":
    app.run(debug=True)
