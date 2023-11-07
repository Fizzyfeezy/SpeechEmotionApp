import os
import warnings
from flask import Flask, request, jsonify, render_template
from werkzeug.utils import secure_filename
import numpy as np
import tensorflow as tf
import python_speech_features as psf
from scipy.io import wavfile
from scipy.io.wavfile import WavFileWarning 

app = Flask(__name__, template_folder='templates')

# Define the path to your TensorFlow.js model
model_path = '/Users/oyelamiabdulhafeez/desktop/big data analytics/projects/assignment/dissertation/cnns_model'

# Load your TensorFlow.js model
model = tf.keras.models.load_model(model_path)

# Define the target input shape expected by the model
target_input_shape = (2700, 13)

# Define a function to preprocess audio data by calculating MFCCs
def preprocess_audio(audio_path):
    try:
        # Suppress the WavFileWarning
        warnings.filterwarnings("ignore", category=WavFileWarning)

        # Read the WAV audio data
        sample_rate, audio_data = wavfile.read(audio_path)
        
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
    except Exception as e:
        print('Error preprocessing audio:', str(e))
        return None

@app.route('/')
def index():
    return render_template('index.html')

# Define an endpoint for emotion recognition
@app.route('/recognize-emotion', methods=['POST'])
def recognize_emotion():
    try:
        # Check if the 'audio' file is included in the request
        if 'audio' not in request.files:
            return jsonify({'error': 'Audio file not found'}), 400
        
        audio_file = request.files['audio']
        
        # Ensure the file has a supported extension (e.g., .wav)
        if not audio_file.filename.endswith(('.wav', '.mp3')):
            return jsonify({'error': 'Unsupported file format'}), 400
        
        # Save the uploaded audio file temporarily
        temp_audio_path = 'temp_audio.wav'
        audio_file.save(temp_audio_path)
        
        # Preprocess the audio data
        mfcc_data = preprocess_audio(temp_audio_path)
        
        if mfcc_data is None:
            return jsonify({'error': 'Error preprocessing audio'}), 500
        
        # Use the loaded model for making predictions
        predictions = model.predict(mfcc_data)
        print(mfcc_data)
        
        # Process predictions and format the response as needed
        predicted_emotion = process_predictions(predictions)
        
        # Delete the temporary audio file
        os.remove(temp_audio_path)
        
        # Respond with the prediction
        return jsonify({'emotion': predicted_emotion}), 200
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
    app.run(debug=True)  # You can set debug=False for production use
