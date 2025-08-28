// Initialize extension - simplified version
chrome.runtime.onInstalled.addListener(async () => {
  console.log('CleanClip extension installed');
  
  // Check if sidePanel API is available (Chrome 114+)
  if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
    try {
      await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
      console.log('Side panel behavior set successfully');
    } catch (error) {
      console.error('Failed to set side panel behavior:', error);
    }
  } else {
    console.warn('sidePanel API not available - Chrome 114+ required');
  }
});

// Simple action handler - just open side panel
chrome.action.onClicked.addListener(async (tab) => {
  console.log('CleanClip icon clicked');
  
  if (chrome.sidePanel && chrome.sidePanel.open) {
    try {
      await chrome.sidePanel.open({ tabId: tab.id });
      console.log('Side panel opened');
    } catch (error) {
      console.error('Failed to open side panel:', error);
    }
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