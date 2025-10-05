from flask import Flask, request, jsonify
from flask_cors import CORS
import random
from datetime import datetime

app = Flask(__name__)
CORS(app)

def generate_historical_data(location, date_str):
    historical_data = []
    # Generate 30 years of dummy data
    for i in range(30):
        year = datetime.now().year - i
        # Make the data slightly different each year
        temp = 25 + (len(location) % 5) + random.uniform(-5, 5) - (i / 10) # Simulate a slight cooling trend for fun
        precip = 5 + (len(location) % 10) + random.uniform(-4, 4)
        
        historical_data.append({
            "year": year,
            "temperature": round(temp, 1),
            "precipitation": round(precip, 1) if precip > 0 else 0
        })
    return sorted(historical_data, key=lambda x: x['year'])

@app.route("/weather", methods=["GET"])
def get_weather():
    location = request.args.get("location", "Coimbatore")
    date_str = request.args.get("date", "2025-10-04")
    
    # Get the generated list of historical data
    history = generate_historical_data(location, date_str)
    
    # The "current" prediction can be the last item in our history
    latest_data = history[-1]

    # The final JSON payload for the frontend
    data = {
        "location": location.capitalize(),
        "date": date_str,
        "temperature": latest_data['temperature'],
        "humidity": int(random.uniform(60, 85)), # Keep humidity random for now
        "rainfall": latest_data['precipitation'],
        "wind_speed": round(random.uniform(5, 20), 1),
        "condition": "Very Wet" if latest_data['precipitation'] > 10 else "Comfortable",
        "historicalData": history # This is the new array for our chart
    }

    return jsonify(data)

if __name__ == "__main__":
    app.run(debug=True)