// Track voice state globally
let voiceEnabled = false;

// Handle messages from popup and content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle voice toggle
  if (message.action === "toggleVoice") {
    voiceEnabled = message.enabled;
    
    // Broadcast voice state to all tabs and popup
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, { 
          action: "voiceStateChanged", 
          enabled: voiceEnabled 
        });
      });
    });
    
    // Also inform popup if it's open
    chrome.runtime.sendMessage({ 
      action: "voiceStateChanged", 
      enabled: voiceEnabled 
    });
  }
  
  // Handle scroll actions and provide feedback
  if (message.action === "scroll") {
    // Show feedback notification (if voice is on)
    if (voiceEnabled) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, { 
            action: "showScrollNotification", 
            direction: message.direction 
          });
        }
      });
    }
  }
});