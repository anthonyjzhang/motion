import requests
import json
import openai
# Load data from the JSON file
# with open('example_input_data.json', 'r') as file:
#     data = json.load(file)

# # Define the endpoint URL
# url = "http://127.0.0.1:5000/getInference"

# # Make a POST request
# response = requests.post(url, json=data)

# # Print the response (index of classified pose)
# print(response.json())

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

print(generate_message("cobra", "lower body beneath hips moving up as well"))


#Tree -- hands moving up and down too fast, foot too low, unbalanced and wobbling
#Warrior -- hands too wide, legs too wide
#Dog -- Butt too low, legs not straight
#Chair -- arms too out, not up, leg angle too wide
#Cobra -- up and down too fast, lower body moving up as well