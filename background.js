// Ultra-simple background script to avoid any errors
console.log('CleanClip background script loaded');

// Handle extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log('CleanClip extension installed successfully');
});

// Handle action click to open side panel
chrome.action.onClicked.addListener(async (tab) => {
  console.log('CleanClip action clicked for tab:', tab.id);
  
  try {
    if (chrome.sidePanel && chrome.sidePanel.open) {
      await chrome.sidePanel.open({ tabId: tab.id });
      console.log('Side panel opened successfully');
    } else {
      console.error('sidePanel API not available');
    }
  } catch (error) {
    console.error('Error opening side panel:', error);
  }
});