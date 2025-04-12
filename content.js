// Global variables
let currentScrollSpeed = 20; // Default speed
let lastProcessTime = 0;
const PROCESS_INTERVAL = 100; // milliseconds
let scrollIndicator = null;

// Listen for messages from background and popup
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  // Update scroll speed when slider changes
  if (message.action === "updateScrollSpeed") {
    currentScrollSpeed = message.speed;
  }
  
  // Show scroll notification when requested
  if (message.action === "showScrollNotification") {
    showScrollFeedback(message.direction);
  }
});

// Process video frames for head tracking
function processFrame() {
  const now = Date.now();
  
  // Only process at set intervals to reduce CPU usage
  if (now - lastProcessTime >= PROCESS_INTERVAL) {
    trackHeadMovement();
    lastProcessTime = now;
  }
  
  // Request next frame with higher priority
  requestAnimationFrame(processFrame);
}

// Track head movement and trigger scrolling
function trackHeadMovement() {
  // Get head rotation data from Face API or similar
  // This is a placeholder - your actual implementation will vary
  if (faceData && faceData.angle) {
    const headAngle = faceData.angle;
    
    // Use a lower threshold for movement detection
    const movementThreshold = 2.5; // degrees
    
    // Create scroll indicator if needed
    if (!scrollIndicator) {
      scrollIndicator = document.createElement('div');
      scrollIndicator.className = 'hands-free-scroll-indicator';
      scrollIndicator.style.position = 'fixed';
      scrollIndicator.style.bottom = '20px';
      scrollIndicator.style.left = '50%';
      scrollIndicator.style.transform = 'translateX(-50%)';
      scrollIndicator.style.padding = '8px 16px';
      scrollIndicator.style.background = 'rgba(0, 0, 0, 0.7)';
      scrollIndicator.style.color = 'white';
      scrollIndicator.style.borderRadius = '4px';
      scrollIndicator.style.zIndex = '9999';
      scrollIndicator.style.display = 'none';
      document.body.appendChild(scrollIndicator);
    }
    
    // Trigger scrolling based on head angle
    if (headAngle > movementThreshold) {
      performScroll("down");
      showScrollFeedback("down");
    } else if (headAngle < -movementThreshold) {
      performScroll("up");
      showScrollFeedback("up");
    }
    
    // Add other gestures as needed (for top/bottom)
    // For example, sharp nod might trigger "top" command
  }
}

// Perform scrolling based on direction
function performScroll(direction) {
  // Special handling for YouTube Shorts
  if (detectYouTubeShorts()) {
    if (navigateYouTubeShorts(direction)) {
      return; // Exit if YouTube-specific navigation succeeded
    }
  }
  
  // Regular scrolling for other sites or fallback
  switch(direction) {
    case "down":
      window.scrollBy({
        top: currentScrollSpeed,
        behavior: "smooth"
      });
      break;
    case "up":
      window.scrollBy({
        top: -currentScrollSpeed,
        behavior: "smooth"
      });
      break;
    case "top":
      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
      break;
    case "bottom":
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth"
      });
      break;
  }
}

// Show feedback for scroll actions
function showScrollFeedback(direction) {
  if (!scrollIndicator) return;
  
  // Set text based on direction
  switch(direction) {
    case "down":
      scrollIndicator.textContent = "Scrolling Down";
      break;
    case "up":
      scrollIndicator.textContent = "Scrolling Up";
      break;
    case "top":
      scrollIndicator.textContent = "Going to Top";
      break;
    case "bottom":
      scrollIndicator.textContent = "Going to Bottom";
      break;
  }
  
  // Show indicator
  scrollIndicator.style.display = 'block';
  
  // Hide after short delay
  clearTimeout(this.feedbackTimeout);
  this.feedbackTimeout = setTimeout(() => {
    scrollIndicator.style.display = 'none';
  }, 1000);
}

// Detect if current page is YouTube Shorts
function detectYouTubeShorts() {
  return window.location.href.includes("youtube.com/shorts");
}

// Navigate YouTube Shorts
function navigateYouTubeShorts(direction) {
  if (direction === "down") {
    // Try finding the "next" button first
    const nextButtons = document.querySelectorAll('button[aria-label="Next video"]');
    if (nextButtons.length > 0) {
      nextButtons[0].click();
      return true;
    }
    
    // Alternative: try to find the shorts container and simulate a swipe
    const shortsContainer = document.querySelector('ytd-shorts');
    if (shortsContainer) {
      // Simulate swipe up through synthetic events
      const rect = shortsContainer.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const startY = rect.top + rect.height * 0.7;
      const endY = rect.top + rect.height * 0.3;
      
      shortsContainer.dispatchEvent(new MouseEvent('mousedown', {
        bubbles: true,
        cancelable: true,
        clientX: centerX,
        clientY: startY
      }));
      
      shortsContainer.dispatchEvent(new MouseEvent('mouseup', {
        bubbles: true,
        cancelable: true,
        clientX: centerX,
        clientY: endY
      }));
      
      return true;
    }
  } else if (direction === "up") {
    // Look for previous video button
    const prevButtons = document.querySelectorAll('button[aria-label="Previous video"]');
    if (prevButtons.length > 0) {
      prevButtons[0].click();
      return true;
    }
  }
  
  return false; // Fall back to normal scrolling
}

// Start head tracking when extension is activated
function initializeHeadTracking() {
  // Initialize Face API or similar
  // Then start frame processing
  requestAnimationFrame(processFrame);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  // Check if extension is enabled
  chrome.storage.sync.get(['enabled'], function(result) {
    if (result.enabled) {
      initializeHeadTracking();
    }
  });
});