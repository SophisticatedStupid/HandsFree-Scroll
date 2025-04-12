// Initialize popup UI
document.addEventListener('DOMContentLoaded', function() {
  // Load saved settings
  loadSettings();
  
  // Set up event listeners for controls
  setupEventListeners();
  
  // Set up layout controls
  setupLayoutControls();
  
  // Set up theme controls
  setupThemeControls();
});

// Load saved settings
function loadSettings() {
  chrome.storage.sync.get(['enabled', 'voiceEnabled', 'scrollSpeed', 'layoutMode', 'controlLayout', 'theme'], function(result) {
    // Set toggle states
    if (document.getElementById('enableToggle')) {
      document.getElementById('enableToggle').checked = result.enabled || false;
    }
    
    if (document.getElementById('voiceToggle')) {
      document.getElementById('voiceToggle').checked = result.voiceEnabled || false;
    }
    
    // Set speed slider
    if (document.getElementById('speedSlider')) {
      document.getElementById('speedSlider').value = result.scrollSpeed || 20;
      
      // Update speed display
      if (document.getElementById('speedValue')) {
        document.getElementById('speedValue').textContent = result.scrollSpeed || 20;
      }
    }
    
    // Set layout
    const container = document.getElementById('controlsContainer');
    if (container && result.layoutMode) {
      container.className = `${result.layoutMode}-layout`;
      
      if (result.layoutMode === 'custom' && result.controlLayout) {
        // Reorder controls based on saved layout
        const controls = Array.from(container.children);
        controls.sort((a, b) => {
          return result.controlLayout.indexOf(a.id) - result.controlLayout.indexOf(b.id);
        });
        
        controls.forEach(control => container.appendChild(control));
        setupDraggableUI();
      }
    }
    
    // Set theme
    const theme = result.theme || 'system';
    applyTheme(theme);
    
    // Highlight active theme button
    const themeButtons = document.querySelectorAll('.theme-toggle button');
    themeButtons.forEach(button => button.classList.remove('active'));
    
    if (theme === 'light') {
      document.getElementById('lightModeBtn').classList.add('active');
    } else if (theme === 'dark') {
      document.getElementById('darkModeBtn').classList.add('active');
    } else {
      document.getElementById('systemModeBtn').classList.add('active');
    }
  });
}

// Set up event listeners
function setupEventListeners() {
  // Extension toggle
  if (document.getElementById('enableToggle')) {
    document.getElementById('enableToggle').addEventListener('change', function() {
      const enabled = this.checked;
      chrome.storage.sync.set({ enabled: enabled });
      
      // Notify content script
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, { 
            action: "toggleExtension", 
            enabled: enabled 
          });
        }
      });
    });
  }
  
  // Voice toggle
  if (document.getElementById('voiceToggle')) {
    document.getElementById('voiceToggle').addEventListener('change', function() {
      const enabled = this.checked;
      chrome.storage.sync.set({ voiceEnabled: enabled });
      
      // Notify background script
      chrome.runtime.sendMessage({ 
        action: "toggleVoice", 
        enabled: enabled 
      });
    });
  }
  
  // Speed slider
  if (document.getElementById('speedSlider')) {
    document.getElementById('speedSlider').addEventListener('input', function() {
      const speedValue = parseInt(this.value);
      
      // Store speed value and notify content script
      chrome.storage.sync.set({ scrollSpeed: speedValue });
      
      chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, { 
            action: "updateScrollSpeed", 
            speed: speedValue 
          });
        }
      });
      
      // Update speed display
      if (document.getElementById('speedValue')) {
        document.getElementById('speedValue').textContent = speedValue;
      }
    });
  }
  
  // GitHub link
  if (document.getElementById('authorLink')) {
    document.getElementById('authorLink').addEventListener('click', function(e) {
      e.preventDefault();
      chrome.tabs.create({ url: this.href });
    });
  }
}

// Set up layout controls
function setupLayoutControls() {
  if (document.getElementById('verticalLayoutBtn')) {
    document.getElementById('verticalLayoutBtn').addEventListener('click', function() {
      const container = document.getElementById('controlsContainer');
      if (container) {
        container.className = 'vertical-layout';
        chrome.storage.sync.set({ layoutMode: 'vertical' });
      }
    });
  }
  
  if (document.getElementById('horizontalLayoutBtn')) {
    document.getElementById('horizontalLayoutBtn').addEventListener('click', function() {
      const container = document.getElementById('controlsContainer');
      if (container) {
        container.className = 'horizontal-layout';
        chrome.storage.sync.set({ layoutMode: 'horizontal' });
      }
    });
  }
  
  if (document.getElementById('customLayoutBtn')) {
    document.getElementById('customLayoutBtn').addEventListener('click', function() {
      const container = document.getElementById('controlsContainer');
      if (container) {
        container.className = 'custom-layout';
        chrome.storage.sync.set({ layoutMode: 'custom' });
        setupDraggableUI();
      }
    });
  }
}

// Setup theme controls
function setupThemeControls() {
  // Light mode
  document.getElementById('lightModeBtn').addEventListener('click', function() {
    applyTheme('light');
    chrome.storage.sync.set({ theme: 'light' });
    
    // Update active state
    const themeButtons = document.querySelectorAll('.theme-toggle button');
    themeButtons.forEach(button => button.classList.remove('active'));
    this.classList.add('active');
  });
  
  // Dark mode
  document.getElementById('darkModeBtn').addEventListener('click', function() {
    applyTheme('dark');
    chrome.storage.sync.set({ theme: 'dark' });
    
    // Update active state
    const themeButtons = document.querySelectorAll('.theme-toggle button');
    themeButtons.forEach(button => button.classList.remove('active'));
    this.classList.add('active');
  });
  
  // System mode
  document.getElementById('systemModeBtn').addEventListener('click', function() {
    applyTheme('system');
    chrome.storage.sync.set({ theme: 'system' });
    
    // Update active state
    const themeButtons = document.querySelectorAll('.theme-toggle button');
    themeButtons.forEach(button => button.classList.remove('active'));
    this.classList.add('active');
  });
}

// Apply theme
function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else if (theme === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    // System theme
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
    }
    
    // Add listener for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
      if (event.matches) {
        document.documentElement.setAttribute('data-theme', 'dark');
      } else {
        document.documentElement.setAttribute('data-theme', 'light');
      }
    });
  }
}

// Setup draggable UI elements
function setupDraggableUI() {
  const controlsContainer = document.getElementById('controlsContainer');
  if (!controlsContainer) return;
  
  const controls = controlsContainer.querySelectorAll('.control-item');
  
  controls.forEach(control => {
    control.setAttribute('draggable', 'true');
    
    control.addEventListener('dragstart', function(e) {
      e.dataTransfer.setData('text/plain', this.id);
      this.classList.add('dragging');
    });
    
    control.addEventListener('dragend', function() {
      this.classList.remove('dragging');
    });
  });
  
  controlsContainer.addEventListener('dragover', function(e) {
    e.preventDefault();
    const draggable = document.querySelector('.dragging');
    if (!draggable) return;
    
    const afterElement = getDragAfterElement(controlsContainer, e.clientY, e.clientX);
    
    if (afterElement == null) {
      controlsContainer.appendChild(draggable);
    } else {
      controlsContainer.insertBefore(draggable, afterElement);
    }
  });
  
  // Save layout whenever it changes
  const observer = new MutationObserver(function() {
    const layout = Array.from(controlsContainer.children).map(child => child.id);
    chrome.storage.sync.set({ controlLayout: layout });
  });
  
  observer.observe(controlsContainer, { childList: true });
}

// Helper function for draggable UI
function getDragAfterElement(container, y, x) {
  const draggableElements = [...container.querySelectorAll('.control-item:not(.dragging)')];
  
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = container.classList.contains('horizontal-layout') 
      ? x - box.left - box.width / 2
      : y - box.top - box.height / 2;
    
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}