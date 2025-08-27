chrome.action.onClicked.addListener(async (tab) => {
  try {
    await chrome.sidePanel.open({
      tabId: tab.id
    });
    
    chrome.tabs.sendMessage(tab.id, {
      type: 'EXTRACT_CONTENT'
    });
  } catch (error) {
    console.error('Failed to open side panel:', error);
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