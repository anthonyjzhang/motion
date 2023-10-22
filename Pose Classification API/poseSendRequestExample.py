import requests
import json

# Load data from the JSON file
with open('example_input_data.json', 'r') as file:
    data = json.load(file)

# Define the endpoint URL
url = "http://127.0.0.1:5000/getInference"

# Make a POST request
response = requests.post(url, json=data)

# Print the response (index of classified pose)
print(response.json())