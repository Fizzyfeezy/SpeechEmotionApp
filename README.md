# Speech Emotion Recognition Web Application

This repository contains the source code for a web application that performs Speech Emotion Recognition. The application uses a machine learning model to analyze speech and predict
the emotional content of the input.


## File Structure

`app.py`: Main Python file containing the Flask web application.
`templates/`: Folder containing HTML templates.
`index.html`: The main HTML file for the web application.
`static/`: Folder containing static assets such as images and stylesheets.
`images/`: Folder for storing images used in the web application.
`custom.js`: Custom JavaScript file for client-side functionality.
`upload.css`: Cascading Style Sheets (CSS) file for styling file upload components.
`model/`: Folder containing the saved machine learning model.
`requirements.txt`: File specifying the Python dependencies for the project.


## Running the Web Application

To run the Speech Emotion Recognition Web Application locally, follow these steps:

1. Clone the repository:
   git clone https://github.com/your-username/speech-emotion-recognition-web-app.git

2. Navigate to the project directory:
   cd SpeechEmotionApp

3. Create a virtual environment (optional but recommended):
   python -m venv venv

   Activate the virtual environment:

   On Windows: venv\Scripts\activate
   On Unix or MacOS: source venv/bin/activate

4. Install dependencies:

   pip install -r requirements.txt

5. Run the Flask application:

   python app.py

6. Access the application:

   The web application will be accessible at `http://127.0.0.1:5000/` or `http://localhost:5000/` in your web browser.


## Usage

1. Navigate to the web application in your browser.

2. Click on "Browse Audio" or drag and drop to upload an audio file containing speech.

3. Click on the "Analyze Audio" button to predict the speech and display the predicted emotion.


## Contributing

Feel free to contribute to the development of this project. If you encounter any issues or have suggestions, please open an issue or submit a pull request.
