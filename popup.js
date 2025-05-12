document.addEventListener('DOMContentLoaded', () => {
  const speedSlider = document.getElementById('speedSlider');
  const speedValue = document.getElementById('speedValue');
  const startStopBtn = document.getElementById('startStopBtn');
  const voiceControlBtn = document.getElementById('voiceControlBtn');
  const voiceStatus = document.getElementById('voiceStatus');
  const slowBtn = document.getElementById('slowBtn');
  const mediumBtn = document.getElementById('mediumBtn');
  const fastBtn = document.getElementById('fastBtn');
  
  let isScrolling = false;
  let voiceControlEnabled = false;
  
  // Update speed value display when slider changes
  speedSlider.addEventListener('input', () => {
    const speed = speedSlider.value;
    speedValue.textContent = speed;
    
    // Update speed if already scrolling
    if (isScrolling) {
      sendMessageToActiveTab({
        action: "updateSpeed",
        speed: parseInt(speed)
      });
    }
  });
  
  // Start/Stop button
  startStopBtn.addEventListener('click', () => {
    isScrolling = !isScrolling;
    
    if (isScrolling) {
      startStopBtn.textContent = "Stop Scrolling";
      sendMessageToActiveTab({
        action: "startScrolling",
        speed: parseInt(speedSlider.value)
      });
    } else {
      startStopBtn.textContent = "Start Scrolling";
      sendMessageToActiveTab({
        action: "stopScrolling"
      });
    }
  });
  
  // Voice control toggle
  voiceControlBtn.addEventListener('click', () => {
    voiceControlEnabled = !voiceControlEnabled;
    
    if (voiceControlEnabled) {
      voiceControlBtn.textContent = "Disable Voice Control";
      voiceStatus.textContent = "Voice control is enabled";
    } else {
      voiceControlBtn.textContent = "Enable Voice Control";
      voiceStatus.textContent = "Voice control is disabled";
    }
    
    sendMessageToActiveTab({
      action: "toggleVoiceControl",
      enabled: voiceControlEnabled
    });
  });
  
  // Preset speed buttons
  slowBtn.addEventListener('click', () => {
    updateSpeed(3);
  });
  
  mediumBtn.addEventListener('click', () => {
    updateSpeed(8);
  });
  
  fastBtn.addEventListener('click', () => {
    updateSpeed(15);
  });
  
  function updateSpeed(speed) {
    speedSlider.value = speed;
    speedValue.textContent = speed;
    
    sendMessageToActiveTab({
      action: "updateSpeed",
      speed: speed
    });
    
    if (!isScrolling) {
      isScrolling = true;
      startStopBtn.textContent = "Stop Scrolling";
      sendMessageToActiveTab({
        action: "startScrolling",
        speed: speed
      });
    }
  }
  
  function sendMessageToActiveTab(message) {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, message);
      }
    });
  }
});