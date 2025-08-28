// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('CleanClip extension installed');
});

// Handle icon click - now using popup instead of side panel
chrome.action.onClicked.addListener(async (tab) => {
  try {
    console.log('Extension icon clicked, triggering content extraction...');
    
    // Send message to content script to start extraction
    chrome.tabs.sendMessage(tab.id, {
      type: 'EXTRACT_CONTENT'
    }).catch(error => {
      console.error('Failed to send message to content script:', error);
      // If content script not ready, inject it manually
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ['content-script.js']
      }).then(() => {
        setTimeout(() => {
          chrome.tabs.sendMessage(tab.id, {
            type: 'EXTRACT_CONTENT'
          });
        }, 100);
      });
    });
    
  } catch (error) {
    console.error('Extension action failed:', error);
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'CONTENT_EXTRACTED') {
    chrome.runtime.sendMessage({
      type: 'CONTENT_READY',
      data: request.data
    });
  }
});