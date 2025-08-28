// Initialize extension
chrome.runtime.onInstalled.addListener(async () => {
  console.log('CleanClip extension installed');
  
  // Check if sidePanel API is available (Chrome 114+)
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    try {
      // Enable sidePanel on all sites
      await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
      console.log('Side panel behavior set successfully');
    } catch (error) {
      console.error('Failed to set side panel behavior:', error);
    }
  } else {
    console.warn('sidePanel API not available - Chrome 114+ required');
  }
});

// Handle icon click - open side panel
chrome.action.onClicked.addListener(async (tab) => {
  try {
    console.log('Extension icon clicked, attempting to open side panel...');
    
    // Check if sidePanel API is available
    if (chrome.sidePanel && chrome.sidePanel.open) {
      try {
        // Open the side panel
        await chrome.sidePanel.open({ tabId: tab.id });
        console.log('Side panel opened successfully');
        
        // Send message to content script to start extraction
        setTimeout(() => {
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
        }, 500); // Give side panel time to load
      } catch (error) {
        console.error('Failed to open side panel:', error);
        // Fallback: try to create a popup window
        chrome.windows.create({
          url: chrome.runtime.getURL('sidebar.html'),
          type: 'popup',
          width: 400,
          height: 600
        });
      }
    } else {
      console.warn('sidePanel API not available - creating popup window as fallback');
      chrome.windows.create({
        url: chrome.runtime.getURL('sidebar.html'),
        type: 'popup',
        width: 400,
        height: 600
      });
    }
    
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