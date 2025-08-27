let isExtracting = false;
let smartExtractor = null;

// Initialize smart extractor when content script loads
document.addEventListener('DOMContentLoaded', () => {
  initializeSmartExtractor();
});

// Also initialize if DOM is already loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeSmartExtractor);
} else {
  initializeSmartExtractor();
}

function initializeSmartExtractor() {
  try {
    if (window.SmartExtractor) {
      smartExtractor = new window.SmartExtractor();
      console.log('SmartExtractor initialized');
    }
  } catch (error) {
    console.error('Failed to initialize SmartExtractor:', error);
  }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'EXTRACT_CONTENT') {
    if (isExtracting) {
      console.log('Already extracting, skipping...');
      return;
    }
    
    extractContent();
  }
});

async function extractContent() {
  isExtracting = true;
  
  try {
    console.log('Starting smart content extraction...');
    console.log('Current URL:', window.location.href);
    
    let result;
    
    // Try smart extractor first
    if (smartExtractor) {
      console.log('Using SmartExtractor...');
      result = await smartExtractor.extractContent();
    } else {
      // Fallback to original method
      console.log('SmartExtractor not available, using fallback...');
      result = await fallbackExtraction();
    }

    if (result.success && result.content) {
      const extractedData = {
        url: window.location.href,
        title: result.content.title || document.title,
        text: result.content.text,
        timestamp: new Date().toISOString(),
        method: result.method,
        fallback: result.method !== 'strategy_1'
      };

      console.log('Content extracted successfully:', {
        url: extractedData.url,
        title: extractedData.title,
        textLength: extractedData.text.length,
        method: result.method
      });

      let statusMessage;
      if (result.method === 'strategy_1') {
        statusMessage = `已擷取 ${extractedData.text.length} 個字符的內容`;
      } else {
        statusMessage = `智慧模式：已擷取 ${extractedData.text.length} 個字符 (${result.method})`;
      }

      chrome.runtime.sendMessage({
        type: 'CONTENT_EXTRACTED',
        data: {
          ...extractedData,
          message: statusMessage
        }
      });
    } else {
      throw new Error('All extraction methods failed');
    }

  } catch (error) {
    console.error('Content extraction failed:', error);
    
    // Final fallback
    const fallbackText = getFallbackContent();
    
    let statusMessage = '使用最終備援模式擷取內容';
    if (window.location.hostname.includes('cw.com.tw')) {
      statusMessage = '天下雜誌：嘗試多種方法後使用備援模式';
    } else if (window.location.hostname.includes('bnext.com.tw')) {
      statusMessage = '數位時代：可能需要等待內容載入或登入';
    }
    
    chrome.runtime.sendMessage({
      type: 'CONTENT_EXTRACTED',
      data: {
        url: window.location.href,
        title: document.title,
        text: fallbackText,
        timestamp: new Date().toISOString(),
        fallback: true,
        message: statusMessage
      }
    });
  } finally {
    isExtracting = false;
  }
}

async function fallbackExtraction() {
  return new Promise((resolve, reject) => {
    try {
      if (typeof Readability === 'undefined') {
        throw new Error('Readability library not loaded');
      }

      const documentClone = document.cloneNode(true);
      const reader = new Readability(documentClone);
      const article = reader.parse();

      if (!article || !article.textContent || article.textContent.length < 50) {
        throw new Error('Readability extraction insufficient');
      }

      resolve({
        success: true,
        content: {
          title: article.title || document.title,
          text: cleanText(article.textContent),
          length: article.textContent.length
        },
        method: 'readability_fallback'
      });
    } catch (error) {
      reject(error);
    }
  });
}

function cleanText(text) {
  if (!text) return '';
  
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function getFallbackContent() {
  console.log('Using fallback content extraction...');
  
  const contentSelectors = [
    'article',
    '[role="main"]',
    '.main-content',
    '.content',
    '.post-content',
    '.article-content',
    '.entry-content',
    '.story-body',
    '.article-body',
    '.news-content',
    '.post-body',
    'main',
    '#main',
    '#content',
    '.cna-content',
    '.story-text'
  ];

  let content = '';
  
  for (const selector of contentSelectors) {
    const element = document.querySelector(selector);
    if (element) {
      content = getTextContent(element);
      if (content && content.length > 100) {
        console.log(`Found content using selector: ${selector}`);
        break;
      }
    }
  }

  if (!content || content.length < 100) {
    const bodyText = getTextContent(document.body);
    if (bodyText && bodyText.length > 100) {
      content = bodyText;
      console.log('Using body text as fallback');
    }
  }

  return cleanText(content) || '無法擷取網頁內容';
}

function getTextContent(element) {
  if (!element) return '';
  
  const clone = element.cloneNode(true);
  
  const unwantedSelectors = [
    'script', 'style', 'nav', 'header', 'footer',
    '.navigation', '.nav', '.menu', '.sidebar',
    '.comments', '.comment', '.ads', '.advertisement',
    '.social', '.share', '.related', '.recommended'
  ];
  
  unwantedSelectors.forEach(selector => {
    const elements = clone.querySelectorAll(selector);
    elements.forEach(el => el.remove());
  });

  return clone.textContent || clone.innerText || '';
}