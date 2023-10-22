import io
import random
from flask import Flask, request, jsonify, Response
import pandas as pd
import tensorflow as tf
from tensorflow import keras
from keras.models import load_model
import numpy as np

app = Flask(__name__)


def reshape_data(df_chunk):
    reshaped_dict = {}
    for _, row in df_chunk.iterrows():
        reshaped_dict[row['body_part'] + '_x'] = row['x']
        reshaped_dict[row['body_part'] + '_y'] = row['y']
        reshaped_dict[row['body_part'] + '_score'] = random.randrange(0, 1, 14)  # NOTE: randomly generated score, unused value

    return reshaped_dict


@app.route('/getInference', methods=['POST'])
@app.route('/getInference', methods=['POST'])
def get_inference():
    # Get the data from the POST request
    data = request.json
    df = pd.DataFrame(data)

    # Split the DataFrame into 10 chunks of 17 rows each
    chunks = [df.iloc[i:i+17] for i in range(0, df.shape[0], 17)]

    # Reshape each chunk and collect in a list
    reshaped_data_list = [reshape_data(chunk) for chunk in chunks]

    # Convert the list of dictionaries to a DataFrame
    reshaped_df = pd.DataFrame(reshaped_data_list)

    # Load the model
    model = load_model('poses_model.hdf5')

    # Convert the first row of the reshaped DataFrame to CSV format (without header)
    first_row_csv = reshaped_df.iloc[0].to_csv(index=False, header=False).strip()

    # Convert the CSV formatted string back to a DataFrame for prediction
    first_row_df = pd.read_csv(io.StringIO(first_row_csv), header=None).transpose()

    # Predicts yoga pose
    prediction = model.predict(first_row_df)

    maxValue = max(prediction[0])
    indexOfClassification = np.where(prediction[0] == maxValue)

    # Create a response object that returns the index of the max confidence
    response = Response(str(indexOfClassification[0]))
    response.content_type = 'text/plain'
    return response


if __name__ == '__main__':
    app.run(debug=True)