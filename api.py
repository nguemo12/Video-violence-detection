from flask import Flask, request, jsonify
from tensorflow.keras.models import load_model
import cv2
import numpy as np

app = Flask(__name__)

# Load the trained model
model = load_model("modelnew.h5")

# Function to preprocess a single frame
def preprocess_frame(frame):
    # Perform any required preprocessing (e.g., resizing, normalization)
    # Resize the frame to IMG_SIZE
    IMG_SIZE = 128
    resized_frame = cv2.resize(frame, (IMG_SIZE, IMG_SIZE))
    # Normalize pixel values
    normalized_frame = resized_frame / 255.0
    return normalized_frame

# Function to preprocess a video and make predictions
def predict_violence(video_path):
    # Extract frames from the video
    vidcap = cv2.VideoCapture(video_path)
    frames = []
    success, image = vidcap.read()
    while success:
        frame = preprocess_frame(image)
        frames.append(frame)
        success, image = vidcap.read()
    vidcap.release()
    
    # Convert frames to numpy array
    input_data = np.array(frames)
    
    # Make predictions using the loaded model
    predictions = model.predict(input_data)
    
    # Calculate the average prediction score
    avg_prediction = np.mean(predictions)
    
    # Define a threshold for classifying the video as violent
    threshold = 0.5  # You can adjust this threshold as needed
    
    # Determine if the video is violent or not based on the average prediction score
    if avg_prediction >= threshold:
        return "Violent"
    else:
        return "Non-violent"

# Define a Flask route to receive video paths and make predictions
@app.route("/predict", methods=["POST"])
def predict():
    # Check if a JSON payload is included in the request body
    if not request.is_json:
        return jsonify({"error": "JSON payload required"}), 400
    
    # Get the JSON payload from the request body
    data = request.get_json()
    
    # Check if the "path" key exists in the JSON payload
    if "path" not in data:
        return jsonify({"error": "Video path not provided"}), 400
    
    # Get the video path from the JSON payload
    video_path = data["path"]
    
    # Make predictions on the video
    prediction = predict_violence(video_path)
    
    # Return the prediction result
    return jsonify({"prediction": prediction})

if __name__ == "__main__":
    app.run(debug=True)
