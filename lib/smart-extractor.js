/**
 * Smart Content Extractor for CleanClip
 * Advanced extraction strategies for difficult websites
 */

class SmartExtractor {
  constructor() {
    this.maxRetries = 3;
    this.retryDelay = 2000;
    this.contentChecks = [];
    this.antiCrawlBypass = window.AntiCrawlBypass ? new window.AntiCrawlBypass() : null;
  }

  /**
   * Main extraction method with multiple fallback strategies
   */
  async extractContent() {
    // First, try anti-crawl bypass for difficult sites
    if (this.antiCrawlBypass && this.isDifficultSite()) {
      console.log('Detected difficult site, trying anti-crawl bypass...');
      try {
        const bypassResult = await this.antiCrawlBypass.bypassAntiCrawl();
        if (bypassResult && this.isValidContent(bypassResult)) {
          return {
            success: true,
            content: bypassResult,
            method: 'anti_crawl_bypass'
          };
        }
      } catch (error) {
        console.log('Anti-crawl bypass failed:', error.message);
      }
    }

    const strategies = [
      this.extractWithReadability.bind(this),
      this.extractWithDOMWait.bind(this),
      this.extractWithMultipleSelectors.bind(this),
      this.extractWithVisibleContent.bind(this),
      this.extractWithTextDensity.bind(this)
    ];

    for (let i = 0; i < strategies.length; i++) {
      try {
        console.log(`Trying extraction strategy ${i + 1}/${strategies.length}`);
        const result = await strategies[i]();
        
        if (this.isValidContent(result)) {
          console.log(`Strategy ${i + 1} succeeded`);
          return {
            success: true,
            content: result,
            method: `strategy_${i + 1}`,
            ...result
          };
        }
      } catch (error) {
        console.log(`Strategy ${i + 1} failed:`, error.message);
        continue;
      }
    }

    return {
      success: false,
      content: this.getLastResortContent(),
      method: 'last_resort'
    };
  }

  /**
   * Strategy 1: Standard Readability
   */
  async extractWithReadability() {
    if (typeof Readability === 'undefined') {
      throw new Error('Readability not available');
    }

    const documentClone = document.cloneNode(true);
    const reader = new Readability(documentClone);
    const article = reader.parse();

    if (!article || !article.textContent || article.textContent.length < 50) {
      throw new Error('Readability extraction insufficient');
    }

    return {
      title: article.title || document.title,
      text: this.cleanText(article.textContent),
      length: article.textContent.length
    };
  }

  /**
   * Strategy 2: Wait for DOM changes (for dynamic content)
   */
  async extractWithDOMWait() {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const maxAttempts = 5;
      
      const checkContent = () => {
        attempts++;
        const content = this.extractBasicContent();
        
        if (this.isValidContent(content)) {
          resolve(content);
          return;
        }
        
        if (attempts >= maxAttempts) {
          reject(new Error('DOM wait timeout'));
          return;
        }
        
        // Wait for more content to load
        setTimeout(checkContent, 1000);
      };

      // Also listen for DOM changes
      const observer = new MutationObserver((mutations) => {
        const hasContentChanges = mutations.some(mutation => 
          mutation.type === 'childList' && 
          mutation.addedNodes.length > 0
        );
        
        if (hasContentChanges) {
          setTimeout(checkContent, 500);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      // Start checking immediately
      checkContent();
      
      // Cleanup after 10 seconds
      setTimeout(() => {
        observer.disconnect();
        reject(new Error('DOM wait cleanup'));
      }, 10000);
    });
  }

  /**
   * Strategy 3: Multiple selector approach
   */
  async extractWithMultipleSelectors() {
    const selectors = [
      // Standard content selectors
      'article',
      '[role="main"]',
      'main',
      
      // News specific
      '.story-body',
      '.article-body',
      '.news-content',
      '.post-content',
      '.entry-content',
      '.content-body',
      
      // Magazine specific  
      '.article-content',
      '.magazine-content',
      '.story-content',
      
      // Common patterns
      '.content',
      '#content',
      '.main-content',
      '#main',
      
      // Taiwan media specific
      '.cna-content',
      '.story-text',
      '.article-text',
      '.news-text',
      
      // Business Next specific patterns
      '.post-body',
      '.article-wrapper',
      '.content-wrapper',
      
      // CommonWealth patterns
      '.cw-article',
      '.magazine-article',
      '.story-wrapper'
    ];

    let bestContent = null;
    let maxScore = 0;

    for (const selector of selectors) {
      try {
        const elements = document.querySelectorAll(selector);
        
        for (const element of elements) {
          if (!this.isVisible(element)) continue;
          
          const text = this.getCleanTextFromElement(element);
          const score = this.calculateContentScore(text, element);
          
          if (score > maxScore && text.length > 100) {
            maxScore = score;
            bestContent = {
              title: this.extractTitle(),
              text: text,
              length: text.length,
              selector: selector,
              score: score
            };
          }
        }
      } catch (error) {
        continue;
      }
    }

    if (!bestContent) {
      throw new Error('No suitable content found with selectors');
    }

    return bestContent;
  }

  /**
   * Strategy 4: Extract only visible content
   */
  async extractWithVisibleContent() {
    const allTextNodes = this.getAllVisibleTextNodes();
    const contentBlocks = this.groupTextNodesByProximity(allTextNodes);
    
    let bestBlock = null;
    let maxScore = 0;

    for (const block of contentBlocks) {
      const text = block.text;
      const score = this.calculateContentScore(text);
      
      if (score > maxScore && text.length > 200) {
        maxScore = score;
        bestBlock = {
          title: this.extractTitle(),
          text: text,
          length: text.length,
          score: score
        };
      }
    }

    if (!bestBlock) {
      throw new Error('No suitable visible content found');
    }

    return bestBlock;
  }

  /**
   * Strategy 5: Text density analysis
   */
  async extractWithTextDensity() {
    const elements = document.querySelectorAll('div, article, section, main, p');
    let bestElement = null;
    let maxDensity = 0;

    for (const element of elements) {
      if (!this.isVisible(element)) continue;
      
      const textLength = element.textContent.length;
      const htmlLength = element.innerHTML.length;
      
      // Calculate text density (text / HTML ratio)
      const density = htmlLength > 0 ? textLength / htmlLength : 0;
      
      if (density > maxDensity && textLength > 200) {
        maxDensity = density;
        bestElement = element;
      }
    }

    if (!bestElement) {
      throw new Error('No high-density content found');
    }

    const text = this.getCleanTextFromElement(bestElement);
    
    return {
      title: this.extractTitle(),
      text: text,
      length: text.length,
      density: maxDensity
    };
  }

  /**
   * Utility methods
   */
  isValidContent(content) {
    if (!content || !content.text) return false;
    
    const text = content.text.trim();
    
    // Check minimum length
    if (text.length < 50) return false;
    
    // Check if it's not just navigation/menu content
    const navigationKeywords = ['登入', '註冊', '首頁', '關於我們', '聯絡我們', '隱私權', '服務條款'];
    const hasMainlyNavigation = navigationKeywords.some(keyword => 
      text.toLowerCase().includes(keyword.toLowerCase())
    ) && text.length < 200;
    
    if (hasMainlyNavigation) return false;
    
    return true;
  }

  extractBasicContent() {
    // Try basic extraction without Readability
    const mainSelectors = ['article', 'main', '[role="main"]'];
    
    for (const selector of mainSelectors) {
      const element = document.querySelector(selector);
      if (element && this.isVisible(element)) {
        const text = this.getCleanTextFromElement(element);
        if (text.length > 100) {
          return {
            title: this.extractTitle(),
            text: text,
            length: text.length
          };
        }
      }
    }
    
    return null;
  }

  extractTitle() {
    // Try multiple title extraction methods
    const titleSelectors = [
      'h1',
      '.article-title',
      '.story-title',
      '.post-title',
      '.news-title',
      '.title'
    ];

    for (const selector of titleSelectors) {
      const element = document.querySelector(selector);
      if (element && this.isVisible(element)) {
        return element.textContent.trim();
      }
    }

    return document.title || '無標題';
  }

  getCleanTextFromElement(element) {
    // Remove unwanted elements
    const clone = element.cloneNode(true);
    
    const unwantedSelectors = [
      'script', 'style', 'nav', 'header', 'footer', 'aside',
      '.navigation', '.nav', '.menu', '.sidebar', '.ads', 
      '.advertisement', '.social', '.share', '.related', 
      '.comments', '.comment-section', '.breadcrumb'
    ];
    
    unwantedSelectors.forEach(selector => {
      const elements = clone.querySelectorAll(selector);
      elements.forEach(el => el.remove());
    });

    return this.cleanText(clone.textContent || '');
  }

  cleanText(text) {
    if (!text) return '';
    
    return text
      .replace(/\s+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  calculateContentScore(text, element = null) {
    let score = 0;
    
    // Length bonus
    score += Math.min(text.length / 100, 10);
    
    // Paragraph count bonus
    const paragraphs = text.split('\n').filter(p => p.trim().length > 20);
    score += paragraphs.length * 2;
    
    // Sentence count bonus  
    const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 10);
    score += sentences.length * 0.5;
    
    // Penalize navigation-heavy content
    const navKeywords = ['首頁', '登入', '註冊', '選單', '導覽'];
    const navPenalty = navKeywords.reduce((penalty, keyword) => {
      return penalty + (text.includes(keyword) ? 1 : 0);
    }, 0);
    score -= navPenalty * 2;
    
    return score;
  }

  isVisible(element) {
    if (!element) return false;
    
    const style = window.getComputedStyle(element);
    
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           style.opacity !== '0' &&
           element.offsetWidth > 0 && 
           element.offsetHeight > 0;
  }

  getAllVisibleTextNodes() {
    const textNodes = [];
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          if (node.textContent.trim().length < 10) return NodeFilter.FILTER_REJECT;
          if (!this.isVisible(node.parentElement)) return NodeFilter.FILTER_REJECT;
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    let node;
    while (node = walker.nextNode()) {
      textNodes.push({
        node: node,
        text: node.textContent.trim(),
        element: node.parentElement
      });
    }

    return textNodes;
  }

  groupTextNodesByProximity(textNodes) {
    // Simple grouping by parent element
    const groups = {};
    
    textNodes.forEach(textNode => {
      const parent = textNode.element;
      const parentKey = this.getElementKey(parent);
      
      if (!groups[parentKey]) {
        groups[parentKey] = {
          element: parent,
          texts: [],
          text: ''
        };
      }
      
      groups[parentKey].texts.push(textNode.text);
    });

    // Combine texts in each group
    return Object.values(groups).map(group => ({
      ...group,
      text: group.texts.join(' ').trim()
    }));
  }

  getElementKey(element) {
    return element.tagName + '_' + Array.from(element.parentElement?.children || []).indexOf(element);
  }

  getLastResortContent() {
    // Final fallback - just get all visible text
    const bodyText = document.body.textContent || '';
    const cleanedText = this.cleanText(bodyText);
    
    return {
      title: document.title,
      text: cleanedText.length > 100 ? cleanedText : '無法擷取內容，請手動複製文字',
      length: cleanedText.length,
      fallback: true
    };
  }

  /**
   * Detect if current site is known to be difficult
   */
  isDifficultSite() {
    const hostname = window.location.hostname.toLowerCase();
    const difficultSites = [
      'cw.com.tw',          // 天下雜誌
      'bnext.com.tw',       // 數位時代
      'businessweekly.com.tw', // 商業週刊
      'gvm.com.tw',         // 遠見雜誌
      'cheers.com.tw',      // Cheers雜誌
      'wall-street-journal', // WSJ
      'nytimes.com',        // NYT
      'ft.com'              // Financial Times
    ];

    return difficultSites.some(site => hostname.includes(site));
  }
}

// Export for use in content script
window.SmartExtractor = SmartExtractor;