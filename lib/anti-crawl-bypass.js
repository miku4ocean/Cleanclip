/**
 * Anti-Crawl Bypass Utilities for CleanClip
 * Techniques to handle anti-crawling mechanisms
 */

class AntiCrawlBypass {
  constructor() {
    this.userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    ];
  }

  /**
   * Simulate human-like behavior
   */
  async simulateHumanBehavior() {
    // Random delay to simulate reading time
    await this.randomDelay(1000, 3000);
    
    // Simulate scroll behavior
    this.simulateScrolling();
    
    // Simulate mouse movement
    this.simulateMouseMovement();
  }

  /**
   * Wait for dynamic content with multiple strategies
   */
  async waitForContent(maxWaitTime = 10000) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const checkContent = () => {
        // Check if content indicators are present
        const contentIndicators = [
          document.querySelector('article'),
          document.querySelector('.story-body'),
          document.querySelector('.article-body'),
          document.querySelector('.content'),
          document.querySelector('main')
        ].filter(Boolean);

        if (contentIndicators.length > 0) {
          // Additional check: ensure content has substantial text
          const totalTextLength = contentIndicators.reduce((total, el) => 
            total + (el.textContent?.length || 0), 0
          );
          
          if (totalTextLength > 200) {
            resolve(true);
            return;
          }
        }

        // Timeout check
        if (Date.now() - startTime > maxWaitTime) {
          resolve(false);
          return;
        }

        // Continue checking
        setTimeout(checkContent, 500);
      };

      // Start checking
      checkContent();

      // Also listen for DOM mutations
      const observer = new MutationObserver((mutations) => {
        const hasSignificantChanges = mutations.some(mutation => 
          mutation.addedNodes.length > 0 && 
          Array.from(mutation.addedNodes).some(node => 
            node.nodeType === Node.ELEMENT_NODE && 
            (node.textContent?.length || 0) > 50
          )
        );
        
        if (hasSignificantChanges) {
          setTimeout(checkContent, 200);
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true
      });

      // Cleanup observer after max wait time
      setTimeout(() => observer.disconnect(), maxWaitTime);
    });
  }

  /**
   * Bypass lazy loading by triggering scroll events
   */
  async bypassLazyLoading() {
    // Simulate scrolling to trigger lazy loading
    const scrollPositions = [0, 100, 300, 500, 800, 1200];
    
    for (const position of scrollPositions) {
      window.scrollTo(0, position);
      await this.randomDelay(100, 300);
      
      // Trigger scroll event
      window.dispatchEvent(new Event('scroll'));
      
      // Check if new content appeared
      await this.randomDelay(200, 500);
    }
    
    // Scroll back to top
    window.scrollTo(0, 0);
  }

  /**
   * Handle paywall content
   */
  async handlePaywall() {
    const paywallSelectors = [
      '.paywall',
      '.subscription-wall',
      '.premium-content',
      '.member-only',
      '[class*="paywall"]',
      '[class*="subscription"]'
    ];

    for (const selector of paywallSelectors) {
      const paywallElements = document.querySelectorAll(selector);
      paywallElements.forEach(element => {
        // Try to find hidden content
        const hiddenContent = element.querySelector('[style*="display: none"]') ||
                              element.querySelector('[style*="visibility: hidden"]') ||
                              element.querySelector('.hidden-content');
        
        if (hiddenContent) {
          hiddenContent.style.display = 'block';
          hiddenContent.style.visibility = 'visible';
        }

        // Remove paywall overlay
        if (element.style.position === 'fixed' || 
            element.style.position === 'absolute') {
          element.remove();
        }
      });
    }
  }

  /**
   * Extract content from JSON-LD structured data
   */
  extractFromJsonLd() {
    const scripts = document.querySelectorAll('script[type="application/ld+json"]');
    
    for (const script of scripts) {
      try {
        const data = JSON.parse(script.textContent);
        
        // Look for Article structured data
        if (data['@type'] === 'Article' || 
            (Array.isArray(data) && data.some(item => item['@type'] === 'Article'))) {
          
          const article = Array.isArray(data) ? 
            data.find(item => item['@type'] === 'Article') : data;
          
          if (article.articleBody || article.text) {
            return {
              title: article.headline || article.name,
              text: article.articleBody || article.text,
              author: article.author?.name,
              datePublished: article.datePublished
            };
          }
        }
      } catch (error) {
        continue;
      }
    }
    
    return null;
  }

  /**
   * Extract content from meta tags
   */
  extractFromMeta() {
    const metaSelectors = [
      'meta[property="og:description"]',
      'meta[name="description"]',
      'meta[property="og:title"]',
      'meta[name="twitter:description"]'
    ];

    let title = document.title;
    let description = '';

    for (const selector of metaSelectors) {
      const meta = document.querySelector(selector);
      if (meta) {
        const content = meta.getAttribute('content');
        if (content && content.length > description.length) {
          if (selector.includes('title')) {
            title = content;
          } else {
            description = content;
          }
        }
      }
    }

    return description.length > 50 ? {
      title: title,
      text: description,
      source: 'meta'
    } : null;
  }

  /**
   * Try to extract content from RSS feeds or API endpoints
   */
  async tryAlternativeContent() {
    const currentUrl = window.location.href;
    
    // Check for RSS feed links
    const rssLinks = document.querySelectorAll('link[type="application/rss+xml"]');
    if (rssLinks.length > 0) {
      // Could potentially fetch RSS content, but limited by CORS
      console.log('RSS feeds found but not accessible due to CORS');
    }

    // Check for API endpoints in page source
    const scripts = Array.from(document.scripts);
    for (const script of scripts) {
      if (script.textContent) {
        // Look for API endpoints that might contain article content
        const apiMatches = script.textContent.match(/["']([^"']*api[^"']*article[^"']*)["']/gi);
        if (apiMatches) {
          console.log('Potential API endpoints found:', apiMatches);
          // Could try to fetch from these endpoints
        }
      }
    }

    return null;
  }

  /**
   * Simulate natural scrolling behavior
   */
  simulateScrolling() {
    const scrollHeight = document.body.scrollHeight;
    const viewportHeight = window.innerHeight;
    
    if (scrollHeight > viewportHeight) {
      // Scroll down slowly
      let currentPosition = 0;
      const scrollStep = Math.min(100, viewportHeight / 10);
      
      const scrollInterval = setInterval(() => {
        currentPosition += scrollStep;
        window.scrollTo(0, currentPosition);
        
        if (currentPosition >= scrollHeight - viewportHeight) {
          clearInterval(scrollInterval);
          // Scroll back to top after a delay
          setTimeout(() => window.scrollTo(0, 0), 1000);
        }
      }, 100);
    }
  }

  /**
   * Simulate mouse movement
   */
  simulateMouseMovement() {
    const events = ['mouseover', 'mouseenter', 'mousemove'];
    const contentElements = document.querySelectorAll('article, .content, main, .story-body');
    
    contentElements.forEach((element, index) => {
      setTimeout(() => {
        events.forEach(eventType => {
          const event = new MouseEvent(eventType, {
            view: window,
            bubbles: true,
            cancelable: true
          });
          element.dispatchEvent(event);
        });
      }, index * 200);
    });
  }

  /**
   * Random delay utility
   */
  randomDelay(min, max) {
    const delay = Math.random() * (max - min) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Check if content is behind a paywall
   */
  isPaywalled() {
    const paywallIndicators = [
      'paywall',
      'subscription',
      'premium',
      'member-only',
      'subscribe',
      '訂閱',
      '付費',
      '會員'
    ];

    const bodyText = document.body.textContent.toLowerCase();
    const hasPaywallKeywords = paywallIndicators.some(keyword => 
      bodyText.includes(keyword.toLowerCase())
    );

    const hasPaywallElements = document.querySelector(
      '.paywall, .subscription-wall, .premium-content, [class*="paywall"]'
    ) !== null;

    return hasPaywallKeywords || hasPaywallElements;
  }

  /**
   * Main bypass method
   */
  async bypassAntiCrawl() {
    console.log('Starting anti-crawl bypass...');

    // Step 1: Wait for initial content
    await this.waitForContent(5000);

    // Step 2: Simulate human behavior
    await this.simulateHumanBehavior();

    // Step 3: Handle lazy loading
    await this.bypassLazyLoading();

    // Step 4: Try to handle paywalls
    await this.handlePaywall();

    // Step 5: Try alternative content sources
    const jsonLdContent = this.extractFromJsonLd();
    if (jsonLdContent) {
      return jsonLdContent;
    }

    const metaContent = this.extractFromMeta();
    if (metaContent) {
      return metaContent;
    }

    // Step 6: Try alternative content endpoints
    await this.tryAlternativeContent();

    return null;
  }
}

// Export for use
window.AntiCrawlBypass = AntiCrawlBypass;