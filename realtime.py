import os
import warnings
from flask import Flask, request, jsonify, render_template
from werkzeug.utils import secure_filename
import numpy as np
import tensorflow as tf
import python_speech_features as psf
from scipy.io import wavfile
from scipy.io.wavfile import WavFileWarning
import speech_recognition as sr
from flask_cors import CORS

app = Flask(__name__, template_folder='templates')
CORS(app)  # Allow all origins (be cautious in production)

# Load your TensorFlow.js model
model_path = '/Users/oyelamiabdulhafeez/desktop/big data analytics/projects/assignment/dissertation/cnns_model'
model = tf.keras.models.load_model(model_path)

# Define the target input shape expected by the model
target_input_shape = (1116, 13)

# Define a function to preprocess audio data by calculating MFCCs
def preprocess_audio(audio_data, sample_rate):
    # Calculate MFCCs using the 'mfcc' library
    mfcc_data = psf.mfcc(audio_data, samplerate=sample_rate, winlen=0.040, winstep=0.015, numcep=13, nfilt=26, nfft=2048)

    # Pad or truncate the data to match the target input shape
    if mfcc_data.shape[0] < target_input_shape[0]:
        padding = target_input_shape[0] - mfcc_data.shape[0]
        mfcc_data = np.pad(mfcc_data, ((0, padding), (0, 0)), mode='constant')
    elif mfcc_data.shape[0] > target_input_shape[0]:
        mfcc_data = mfcc_data[:target_input_shape[0], :]

    if mfcc_data.shape[1] < target_input_shape[1]:
        padding = target_input_shape[1] - mfcc_data.shape[1]
        mfcc_data = np.pad(mfcc_data, ((0, 0), (0, padding)), mode='constant')
    elif mfcc_data.shape[1] > target_input_shape[1]:
        mfcc_data = mfcc_data[:, :target_input_shape[1]]

    # Reshape the data to match the input shape expected by the model
    mfcc_data = np.expand_dims(mfcc_data, axis=0)

    return mfcc_data

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload')
def upload_emotions():
    return render_template('upload.html')

# Define an endpoint for real-time emotion recognition
@app.route('/realtime-recognize-emotion', methods=['POST'])
def realtime_recognize_emotion():
    try:
        recognizer = sr.Recognizer()
        microphone = sr.Microphone()

        with microphone as source:
            print("Listening...")
            audio = recognizer.listen(source)

        # Convert the speech input to text
        transcript = recognizer.recognize_google(audio)
        print("You said:", transcript)

        # Preprocess the audio data
        audio_data = audio.frame_data
        sample_rate = audio.sample_rate
        mfcc_data = preprocess_audio(audio_data, sample_rate)

        if mfcc_data is None:
            return jsonify({'error': 'Error preprocessing audio'}), 500

        # Use the loaded model for making predictions
        predictions = model.predict(mfcc_data)

        # Process predictions and format the response as needed
        predicted_emotion = process_predictions(predictions)

        return jsonify({'transcript': transcript, 'emotion': predicted_emotion}), 200
    except Exception as e:
        print('Error recognizing emotion:', str(e))
        return jsonify({'error': 'Something went wrong'}), 500

# Define a function to process model predictions
def process_predictions(predictions):
    # Assuming 'predictions' is an array of numerical values representing class probabilities
    # Example: [0.1, 0.7, 0.2, 0.05, 0.02, 0.01] where each value corresponds to an emotion class

    # Define the emotion labels corresponding to the classes
    # emotion_labels = ["sadness", "happiness", "fear", "neutral", "boredom", "disgust"]
    emotion_labels = ['anger', 'boredom', 'breath', 'disgust', 'excitement', 'fear', 'happiness', 'neutral', 'sadness', 'surprise']

    # Get the index of the class with the highest probability (argmax)
    max_probability_index = np.argmax(predictions)

    # Get the emotion label associated with the predicted class
    predicted_emotion = emotion_labels[max_probability_index]

    return predicted_emotion

if __name__ == '__main__':
    app.run(debug=True)