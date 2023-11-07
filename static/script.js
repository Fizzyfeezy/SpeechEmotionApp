const startButton = document.getElementById('startButton');
const speechResult = document.getElementById('speechResult');
const emotionResult = document.getElementById('emotionResult');
let recognizing = false;
let recognition = new webkitSpeechRecognition();

recognition.continuous = true;
recognition.interimResults = true;
recognition.lang = 'en-US';

startButton.addEventListener('click', () => {
    if (recognizing) {
        recognition.stop();
        recognizing = false;
        startButton.innerText = 'Start Recognition';
    } else {
        recognition.start();
        recognizing = true;
        startButton.innerText = 'Stop Recognition';
        speechResult.innerText = 'Listening...';
        emotionResult.innerText = '';
    }
});

recognition.onresult = (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript;
    speechResult.innerText = `You said: ${transcript}`;
    
    // Send the transcript to the server for emotion recognition
    fetch('/realtime-recognize-emotion', {
        method: 'POST',
        body: JSON.stringify({ transcript }),
        headers: {
            'Content-Type': 'application/json',
        },
    })
    .then(response => response.json())
    .then(data => {
        emotionResult.innerText = `Predicted Emotion: ${data.emotion}`;
    })
    .catch(error => {
        console.error(error);
        emotionResult.innerText = 'Error recognizing emotion.';
    });
};

recognition.onend = () => {
    recognizing = false;
    startButton.innerText = 'Start Recognition';
    speechResult.innerText = 'Recognition ended.';
};