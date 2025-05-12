let scrollInterval;
let scrollSpeed = 5;
let isScrolling = false;
let voiceControlEnabled = false;

// Listen for messages from popup or background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "startScrolling") {
    startScrolling(request.speed);
  } else if (request.action === "stopScrolling") {
    stopScrolling();
  } else if (request.action === "updateSpeed") {
    updateScrollSpeed(request.speed);
  } else if (request.action === "toggleVoiceControl") {
    toggleVoiceControl(request.enabled);
  }
  
  sendResponse({success: true});
  return true;
});

function startScrolling(speed) {
  stopScrolling(); // Clear any existing interval
  scrollSpeed = speed || scrollSpeed;
  isScrolling = true;
  
  scrollInterval = setInterval(() => {
    window.scrollBy(0, scrollSpeed);
  }, 50);
}

function stopScrolling() {
  isScrolling = false;
  clearInterval(scrollInterval);
}

function updateScrollSpeed(speed) {
  scrollSpeed = speed;
  if (isScrolling) {
    startScrolling(speed); // Restart with new speed
  }
}

function toggleVoiceControl(enabled) {
  voiceControlEnabled = enabled;
  
  if (enabled) {
    initVoiceRecognition();
  } else {
    // Stop voice recognition if it's running
    if (window.recognition) {
      window.recognition.stop();
    }
  }
}

function initVoiceRecognition() {
  if (!('webkitSpeechRecognition' in window)) {
    alert("Your browser doesn't support speech recognition. Try Chrome.");
    return;
  }
  
  const recognition = new webkitSpeechRecognition();
  window.recognition = recognition;
  
  recognition.continuous = true;
  recognition.interimResults = false;
  
  recognition.onresult = (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
    
    if (transcript.includes("start scrolling")) {
      startScrolling();
    } else if (transcript.includes("stop scrolling")) {
      stopScrolling();
    } else if (transcript.includes("scroll faster")) {
      updateScrollSpeed(scrollSpeed + 2);
    } else if (transcript.includes("scroll slower")) {
      updateScrollSpeed(Math.max(1, scrollSpeed - 2));
    }
  };
  
  recognition.onend = () => {
    // Restart if still enabled
    if (voiceControlEnabled) {
      recognition.start();
    }
  };
  
  recognition.start();
}