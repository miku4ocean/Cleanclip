let isExtracting = false;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'EXTRACT_CONTENT') {
    if (isExtracting) {
      console.log('Already extracting, skipping...');
      return;
    }
    
    extractContent();
  }
});

function extractContent() {
  isExtracting = true;
  
  try {
    console.log('Starting content extraction...');
    console.log('Current URL:', window.location.href);
    
    if (typeof Readability === 'undefined') {
      throw new Error('Readability library not loaded');
    }

    // Site-specific handling
    if (window.location.hostname.includes('cw.com.tw')) {
      console.log('Detected CommonWealth Magazine - using fallback');
      throw new Error('Using fallback for CW');
    }

    const documentClone = document.cloneNode(true);
    const reader = new Readability(documentClone);
    const article = reader.parse();

    if (!article || !article.textContent) {
      throw new Error('No readable content found');
    }

    const extractedData = {
      url: window.location.href,
      title: article.title || document.title,
      text: cleanText(article.textContent),
      timestamp: new Date().toISOString()
    };

    console.log('Content extracted successfully:', {
      url: extractedData.url,
      title: extractedData.title,
      textLength: extractedData.text.length
    });

    chrome.runtime.sendMessage({
      type: 'CONTENT_EXTRACTED',
      data: extractedData
    });

  } catch (error) {
    console.error('Content extraction failed:', error);
    
    const fallbackText = getFallbackContent();
    
    let statusMessage = '使用備援模式擷取內容';
    if (window.location.hostname.includes('cw.com.tw')) {
      statusMessage = '天下雜誌需要手動複製內容';
    } else if (window.location.hostname.includes('bnext.com.tw')) {
      statusMessage = '數位時代可能需要登入會員';
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