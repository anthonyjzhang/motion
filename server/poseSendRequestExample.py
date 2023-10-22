import requests
import pandas as pd
import numpy as np
import os
import json

def test_correct_preds():
    directory_path = '../model_training/exercise_correctness_data/warrior/incorrect_legswide/output_chunk_57.csv'
    pred = fetch(parse_csv(directory_path))
    print(pred)

    # Get list of files in the directory
    # file_list = os.listdir(directory_path)

    # Iterate through the files
    # for filename in file_list:
    #     if not filename.startswith('.'):
    #         file_path = os.path.join(directory_path, filename)
    #         pred = fetch(parse_csv(file_path))
    #         print(pred)

def fetch(json_str):
    # Load data from the JSON
    data = json.loads(json_str)

    # Define the endpoint URL
    url = "http://127.0.0.1:5000/getInference"

    # Make a POST request
    response = requests.post(url, json=data)

    # return the response (index of classified pose)
    return(response.json())

def parse_csv(csv_path):
    df = pd.read_csv(csv_path)
    json_array = []

    for _, row in df.iterrows():
        for i in range(0, len(df.columns), 3):
            part_name = df.columns[i][:-2]
            part_data = {
                "x": row[df.columns[i]],
                "y": row[df.columns[i+1]],
                "name": part_name,
                "score": row[df.columns[i+2]],
            }
            json_array.append(part_data)

    json_str = json.dumps(json_array, indent=4)
    return json_str

test_correct_preds()