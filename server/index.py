import io
import random
from flask import Flask, request, jsonify, Response
import pandas as pd
import tensorflow as tf
from tensorflow import keras
from keras.models import load_model
import numpy as np
import torch
from pose_classifier import PoseClassifier

app = Flask(__name__)

CLASSIFIER_MODEL_PATH = "models/exercise_classifier/exercise.best.hdf5"
CHAIR_CLASSIFIER_PATH = "models/chair_classifier/chair_classifier.pt"
COBRA_CLASSIFIER_PATH = "models/cobra_classifier/cobra_classifier.pt"
DOG_CLASSIFIER_PATH = "models/dog_classifier/dog_classifier.pt"
TREE_CLASSIFIER_PATH = "models/tree_classifier/tree_classifier.pt"
WARRIOR_CLASSIFIER_PATH = "models/warrior_classifier/warrior_classifier.pt"

chair_classifier = PoseClassifier()
chair_classifier.load_state_dict(torch.load(CHAIR_CLASSIFIER_PATH))
chair_classifier.eval()

cobra_classifier = PoseClassifier()
cobra_classifier.load_state_dict(torch.load(COBRA_CLASSIFIER_PATH))
cobra_classifier.eval()

dog_classifier = PoseClassifier()
dog_classifier.load_state_dict(torch.load(DOG_CLASSIFIER_PATH))
dog_classifier.eval()

tree_classifier = PoseClassifier()
tree_classifier.load_state_dict(torch.load(TREE_CLASSIFIER_PATH))
tree_classifier.eval()

warrior_classifier = PoseClassifier()
warrior_classifier.load_state_dict(torch.load(WARRIOR_CLASSIFIER_PATH))
warrior_classifier.eval()

exercise_classes = {
    0: "chair",
    1: "cobra",
    2: "dog",
    3: "tree",
    4: "warrior"
}

chair_index = {
    0: "arms too out, not up",
    1: "correct",
    2: "leg angle too wide"
}

cobra_index = {
    0: "up and down too fast",
    1: "correct",
    2: "lower body moving up as well"
}

dog_index = {
    0: "legs not straight",
    1: "butt too low",
    2: "correct"
}

tree_index = {
    0: "hands moving up and down too fast",
    1: "correct",
    2: "unbalanced and wobbling"
}

warrior_index = {
    0: "correct",
    1: "hands too wide",
    2: "legs too wide"
}

def reshape_data(df_chunk):
    reshaped_dict = {}
    for _, row in df_chunk.iterrows():
        reshaped_dict[row["name"] + "_x"] = row["x"]
        reshaped_dict[row["name"] + "_y"] = row["y"]
        reshaped_dict[row["name"] + "_score"] = row["score"]

    return reshaped_dict

def identify_exercise(df):
    # Split the DataFrame into 10 chunks of 17 rows each
    chunks = [df.iloc[i : i + 17] for i in range(0, df.shape[0], 17)]

    # Reshape each chunk and collect in a list
    reshaped_data_list = [reshape_data(chunk) for chunk in chunks]

    # Convert the list of dictionaries to a DataFrame
    reshaped_df = pd.DataFrame(reshaped_data_list)

    # Load the model
    model = load_model(CLASSIFIER_MODEL_PATH)

    # Grab the first row of dataframe for exercise classificationc
    first_row_df = reshaped_df.iloc[0].to_frame().transpose()

    # Predicts yoga pose
    prediction = model.predict(first_row_df)

    # Identify predicted class
    return prediction[0].argmax()

def predict_status(exercise_idx, df):
    # Split the DataFrame into 10 chunks of 17 rows each
    chunks = [df.iloc[i : i + 17] for i in range(0, df.shape[0], 17)]

    # Reshape each chunk and collect in a list
    reshaped_data_list = [reshape_data(chunk) for chunk in chunks]

    # Convert the list of dictionaries to a DataFrame
    reshaped_df = pd.DataFrame(reshaped_data_list)
    tensor = torch.tensor(reshaped_df.values, dtype=torch.float32).unsqueeze(0)
    # print(tensor.shape)

    if exercise_idx == 0:
        prediction = chair_classifier(tensor)
        pred_status_idx = torch.argmax(prediction).item()
        return chair_index[pred_status_idx]
    elif exercise_idx == 1:
        prediction = cobra_classifier(tensor)
        pred_status_idx = torch.argmax(prediction).item()
        return cobra_index[pred_status_idx]
    elif exercise_idx == 2:
        prediction = dog_classifier(tensor)
        pred_status_idx = torch.argmax(prediction).item()
        return dog_index[pred_status_idx]
    elif exercise_idx == 3:
        prediction = tree_classifier(tensor)
        pred_status_idx = torch.argmax(prediction).item()
        return tree_index[pred_status_idx]
    elif exercise_idx == 4:
        prediction = warrior_classifier(tensor)
        pred_status_idx = torch.argmax(prediction).item()
        return warrior_index[pred_status_idx]
    else:
        return "unknown"

@app.route("/getInference", methods=["POST"])
def get_inference():
    # Get the data from the POST request
    data = request.json
    df = pd.DataFrame(data)

    # Identify exercise
    pred_exercise_idx = identify_exercise(df)
    pred_exercise = exercise_classes[pred_exercise_idx]

    # Identify status of exercise
    pred_status = predict_status(pred_exercise_idx, df)

    # Create a response object that returns the index of the max confidence
    response = {}
    response["Exercise"] = pred_exercise
    response["Status"] = pred_status
    return response

if __name__ == "__main__":
    app.run(debug=True)