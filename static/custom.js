document.addEventListener('DOMContentLoaded', function () {
  const fileInput = document.getElementById('fileInput');
  const browseButton = document.getElementById('browseButton');
  const innerText = document.getElementById('innerText');
  const completedText = document.querySelector('.completed-text');
  const secondRectangle = document.querySelector('.second-rectangle');
  const imageContainer = document.querySelector('.image-container');
  const borderLine = document.querySelector('.border-line');
  const analyzeButton = document.querySelector('.analyze-button');
  const clearContent = document.getElementById('clearContent');
  const predictedEmotionText = document.querySelector('.predicted-emotion-text');
  const predictedEmotionImage = document.querySelector('.predicted-emotion-image');
  const predictionResult = document.getElementById('predictionResult');
  const emotionImageId = document.getElementById('emotionImage');
  const dropArea = document.getElementById('dragText');
  var playAudio = document.getElementById("playAudio");
  var selectedAudio = document.getElementById("selectedAudio");
  const playAudioOverlay = document.getElementById("playAudioOverlay");


  const blueImage = "speaker.svg";
  const grayImage = "speaker-gray.svg";

  // Initialize the interval variable
  let interval;

  let selectedFile;

  // Hide the second rectangle, image container, and border line initially
  secondRectangle.style.display = 'none';
  imageContainer.style.display = 'none';
  borderLine.style.width = '0';

  // Function to reset the upload progress and clear the second rectangle
  function resetUpload() {
    clearInterval(interval);
    secondRectangle.style.display = 'none';
    innerText.textContent = '';
    borderLine.style.width = '0';
    completedText.style.display = 'none';
    imageContainer.style.display = 'none';
    analyzeButton.style.display = 'none';
    analyzeButton.classList.remove('animate');
    fileInput.value = '';
    playAudio.style.filter = "brightness(100%)"
  }

  function clearPredictedEmotionElements() {
    predictedEmotionText.style.display = 'none';
    predictedEmotionImage.style.display = 'none';
    predictionResult.style.display = 'none';
  }
  

  // Add a click event listener to the image container
  clearContent.addEventListener('click', () => {
    resetUpload();
  });

  // Handle file selection when chosen from the file input
  fileInput.addEventListener('change', () => {
    const files = fileInput.files;
    if (files.length > 0) {
      selectedFile = files[0];
      const fileName = selectedFile.name;

      // Truncate the filename to 10 characters with '...' if it's longer
      const truncatedFileName =
        fileName.length > 10
          ? fileName.slice(0, 10) + '...' + fileName.slice(-6, -4) + fileName.slice(-4)
          : fileName;

      // Reset the upload progress and clear the second rectangle
      resetUpload();

      // Update the "Selected Audio" text with the truncated filename and (0%)
      innerText.textContent = `${truncatedFileName} (0%)`;

      // Show the second rectangle and border line immediately when audio is selected
      secondRectangle.style.display = 'block';

      // Simulate an upload progress from 0% to 100%
      let progress = 0;
      interval = setInterval(() => {
        if (progress < 100) {
          progress += 1; // Update the progress quickly
          innerText.textContent = `${truncatedFileName} (${progress}%)`;
          borderLine.style.width = (progress / 100) * 337 + 'px'; // Adjust the border line width based on progress
        } else {
          clearInterval(interval);
          completedText.style.display = 'block'; // Show 'Completed' when progress reaches 100%
          imageContainer.style.display = 'block'; // Show the image container at 100%
          analyzeButton.style.display = 'block'; // Show the button
          analyzeButton.style.left = '0'; // Start sliding the button from right to left
          analyzeButton.classList.add('animate');
        }
      }, 20); // Adjust the interval timing for a faster update
    }
  });

  // Add a click event listener to the Browse Audio button
  browseButton.addEventListener('click', () => {
    browseButton.classList.add('vibrate');
    setTimeout(() => {
      browseButton.classList.remove('vibrate');
    }, 500);

    resetUpload();
    clearPredictedEmotionElements();
    fileInput.click();
  });

  function playSelectedAudio() {
    if (selectedFile) {
      const objectURL = URL.createObjectURL(selectedFile);
      selectedAudio.src = objectURL;
      selectedAudio.load();
      selectedAudio.play();
    }
  }

  playAudioOverlay.addEventListener("click", () => {
    playSelectedAudio();
  });

  // Add a click event listener to the "playAudio" image
  playAudio.addEventListener("click", () => {
    playSelectedAudio();
    playAudio.src = `/static/img/${grayImage}`;
  });

  selectedAudio.addEventListener("ended", () => {
    playAudio.src = `/static/img/${blueImage}`;
  });

  // Function to reset the content when clearing
  function clearUploadContent() {
      fileInput.value = '';
      predictionResult.textContent = '';
      secondRectangle.style.display = 'none';
      analyzeButton.style.display = 'block';
  }

  // Add event listeners to prevent the default behavior for drag-and-drop events
  document.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropArea.classList.add('drag-over');
  });

  document.addEventListener('dragenter', (e) => {
      e.preventDefault();
      dropArea.classList.add('drag-over');
  });

  document.addEventListener('dragleave', () => {
      dropArea.classList.remove('drag-over');
  });

  document.addEventListener('drop', (e) => {
      e.preventDefault();
      dropArea.classList.remove('drag-over');

      // Handle the dropped files here
      const files = e.dataTransfer.files;
      if (files.length > 0) {
          selectedFile = files[0];
          const fileName = selectedFile.name;

          // Reset the upload progress and predicted Emotion
          resetUpload();
          clearPredictedEmotionElements();

          // Update the "Selected Audio" text with the filename and (0%)
          innerText.textContent = `${fileName} (0%)`;

          // Show the second rectangle and border line immediately when audio is selected
          secondRectangle.style.display = 'block';

          // Simulate an upload progress from 0% to 100%
          let progress = 0;
          interval = setInterval(() => {
              if (progress < 100) {
                  progress += 1;
                  innerText.textContent = `${fileName} (${progress}%)`;
                  borderLine.style.width = (progress / 100) * 337 + 'px';
              } else {
                  clearInterval(interval);
                  completedText.style.display = 'block';
                  imageContainer.style.display = 'block';
                  analyzeButton.style.display = 'block';
                  analyzeButton.style.left = '0';
                  analyzeButton.classList.add('animate');
              }
          }, 20);
      }
  });

  // Handle the click event for the "Analyze Audio" button
  analyzeButton.addEventListener('click', async () => {
    predictedEmotionText.style.display = 'block';
    if (!selectedFile) {
        predictionResult.textContent = 'Please select an audio file.';
        return;
    }

    const formData = new FormData();
    formData.append('audio', selectedFile);

    try {
        const response = await fetch('/recognize-emotion', {
            method: 'POST',
            body: formData,
        });
        predictedEmotionImage.style.display = 'block';
        predictionResult.style.display = 'block';

        const data = await response.json();
        predictionResult.textContent = `${data.emotion}`;

        const imageFilename = `${data.emotion}.svg`;
        // Update the image source
        emotionImageId.src = `/static/img/${imageFilename}`;
    } catch (error) {
        console.error(error);
        predictionResult.textContent = 'An error occurred.';
    }
  });

  // Handle the click event for clearing the content
  clearContent.addEventListener('click', clearUploadContent);

});