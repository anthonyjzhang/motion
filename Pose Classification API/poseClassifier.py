import io
import random
from flask import Flask, request, Response
import pandas as pd
from keras.models import load_model
import numpy as np
import openai

app = Flask(__name__)


# Example usage for incorrect pose: generate_GPT_message("moving too fast")
# reason should be left blank if the pose is correct

def generate_GPT_message(reason=None):
    #GPT4 much more preferable for good answers, may take too long however.
    if reason is None:
        gptInput = "I have created a machine learning model that identifies what yoga position someone is doing and if they're doing it correctly, or if they're not doing it correctly, we identify what they did wrong. Please generate a 30 word message for the user politely stating that they are doing the pose correctly and supporting them. Do not say anything else besides this message to the user, and do not add quotation marks."
    else:
        gptInput = "I have created a machine learning model that identifies what yoga position someone is doing and if they're doing it correctly, or if they're not doing it correctly, we identify what they did wrong. Please generate a 30 word message for the user politely stating that they are doing the pose wrong because " + reason + "and supporting them. Do not say anything else besides this message to the user, and do not add quotation marks."

    openai.api_key = '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'

    # Sends a prompt to ChatGPT
    response = openai.Completion.create(
        engine="text-davinci-002",  # Can change if needed
        prompt=gptInput,
        max_tokens=30  # This controls the maximum length of the response
    )

    # Print the response
    return response.choices[0].text.strip()

def generate_message(exercise, failure_type):
    pose =  exercise[0].upper() + exercise[1:] + " Pose"    

    if exercise is None:
        return "Cannot identify exercise. Please make sure the exercise is in our database."
    else:
        if failure_type is None:
            ret = "Amazing " + exercise + " pose! Maintain this form."
            return pose, ret
        message_content = "The user is doing a " + exercise + " yoga pose. However, the user is failing because of this failure type for the " +  exercise + " pose:" + failure_type + " Based on this failure type, give the user some short advice on how to fix their form."

    openai.api_key = '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'
    response = openai.ChatCompletion.create(
        model="gpt-4",  # Change to an appropriate chat model you want to use
        messages=[
            {"role": "system", "content": "You are an assistant that gives very short feedback for yoga, physical therapy, and workout exercises given a specific exercise and a potential failure type. Respond in phrases that must be complete. Your response must be below 15 words. End every phrase with a period"},
            {"role": "user", "content": message_content}
        ],
        max_tokens=20,
        temperature = 0.2
    )
    feedback = response['choices'][0]['message']['content']
    #print(feedback)
    filtered_feedback = feedback.rsplit('.', 1)[0] + '.'
    return pose, filtered_feedback

print(generate_message("cobra", "too fast"))

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

    # Finds max confidence value
    maxValue = max(prediction[0])
    if maxValue < 0.83: # Checks if the model prediction is confident enough with its answer
        indexOfClassification = -1 # Indicates too low confidence (needs therapy)
    else:
        indexOfClassification = np.where(prediction[0] == maxValue) # Finds index for pose with max confidence

    # Create a response object that returns the index of the max confidence
    response = Response(str(indexOfClassification[0]))
    response.content_type = 'text/plain'
    return response


if __name__ == '__main__':
    app.run(debug=True)