from flask import Flask, request, jsonify
from flask_cors import CORS
from cost_calculator import CostCalculator
import json

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Create an instance of the CostCalculator class
cost_calculator = CostCalculator()

@app.route('/calculate', methods=['POST'])
def calculate():
    # Load the JSON data from a file
    with open('data.json', 'r') as file:
        data = json.load(file)

    # Call the calculate_cost function from CostCalculator class
    costs = cost_calculator.calculate_cost(data)

    return jsonify(costs)

@app.route('/add', methods=['POST'])
def add():
    # Extract JSON payload from the request
    data = request.get_json()

    # Call the calculate_cost function from CostCalculator class
    costs = cost_calculator.calculate_cost(data)

    return jsonify(costs)

if __name__ == '__main__':
    app.run(debug=True)
