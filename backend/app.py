from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/weather", methods=["GET"])
def get_weather():
    location = request.args.get("location", "Chennai")
    date = request.args.get("date", "2025-10-04")

    # Dummy NASA data (replace later with real API)
    data = {
        "location": location,
        "date": date,
        "temperature": 31.5,
        "humidity": 70,
        "rainfall": 2.3
    }

    return jsonify(data)

if __name__ == "__main__":
    app.run(debug=True)

