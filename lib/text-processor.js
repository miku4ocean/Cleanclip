/**
 * Text Processing Utilities for CleanClip
 * Advanced text cleaning and formatting tools
 */

class TextProcessor {
  constructor() {
    this.cleaningRules = {
      // 常見的網頁干擾文字
      webClutter: [
        /廣告/g,
        /Advertisement/gi,
        /點擊這裡/g,
        /Click here/gi,
        /更多內容/g,
        /Read more/gi,
        /繼續閱讀/g,
        /相關文章/g,
        /Related articles?/gi,
        /分享到/g,
        /Share to/gi,
        /按讚/g,
        /Like/g,
        /訂閱/g,
        /Subscribe/gi
      ],
      
      // 社交媒體干擾
      socialMedia: [
        /Facebook/gi,
        /Instagram/gi,
        /Twitter/gi,
        /LINE/gi,
        /WeChat/gi,
        /微信/g
      ],
      
      // 導覽和選單文字
      navigation: [
        /首頁|Home/gi,
        /關於我們|About us/gi,
        /聯絡我們|Contact us/gi,
        /隱私權政策|Privacy Policy/gi,
        /服務條款|Terms of Service/gi,
        /網站地圖|Sitemap/gi
      ]
    };
  }

  /**
   * 主要文字清理函數
   */
  cleanText(text, options = {}) {
    if (!text) return '';

    const {
      removeWebClutter = true,
      removeSocialMedia = true,
      removeNavigation = true,
      removeExtraSpaces = true,
      removeEmptyLines = true,
      formatParagraphs = true,
      preserveLineBreaks = false
    } = options;

    let cleanedText = text;

    // 1. 移除網頁干擾文字
    if (removeWebClutter) {
      this.cleaningRules.webClutter.forEach(rule => {
        cleanedText = cleanedText.replace(rule, '');
      });
    }

    // 2. 移除社交媒體相關
    if (removeSocialMedia) {
      this.cleaningRules.socialMedia.forEach(rule => {
        cleanedText = cleanedText.replace(rule, '');
      });
    }

    // 3. 移除導覽文字
    if (removeNavigation) {
      this.cleaningRules.navigation.forEach(rule => {
        cleanedText = cleanedText.replace(rule, '');
      });
    }

    // 4. 清理空白字符
    if (removeExtraSpaces) {
      cleanedText = cleanedText
        .replace(/[ \t]+/g, ' ')  // 多個空格或tab變成單個空格
        .replace(/\u00A0/g, ' ')  // 替換不換行空格
        .replace(/[\u2000-\u200A]/g, ' '); // 替換各種Unicode空格
    }

    // 5. 處理換行
    if (removeEmptyLines) {
      cleanedText = cleanedText
        .replace(/\n\s*\n\s*\n/g, '\n\n') // 多個換行變成雙換行
        .replace(/^\s+|\s+$/gm, ''); // 移除每行開頭和結尾的空白
    }

    // 6. 格式化段落
    if (formatParagraphs && !preserveLineBreaks) {
      cleanedText = this.formatParagraphs(cleanedText);
    }

    return cleanedText.trim();
  }

  /**
   * 格式化段落
   */
  formatParagraphs(text) {
    // 將文字分割成段落
    const paragraphs = text.split(/\n\s*\n/);
    
    return paragraphs
      .map(paragraph => {
        // 清理每個段落
        const cleaned = paragraph
          .replace(/\n/g, ' ')  // 段落內的換行變成空格
          .replace(/\s+/g, ' ') // 多個空格變成單個
          .trim();
        
        return cleaned;
      })
      .filter(p => p.length > 10) // 過濾太短的段落
      .join('\n\n'); // 段落間雙換行
  }

  /**
   * 智慧分段 - 根據標點符號和語義分段
   */
  smartParagraphSplit(text) {
    // 中文和英文的句號分段
    const sentences = text.split(/[。！？；：.!?;:]\s*/);
    const paragraphs = [];
    let currentParagraph = '';
    let sentenceCount = 0;

    sentences.forEach(sentence => {
      if (!sentence.trim()) return;
      
      currentParagraph += sentence.trim();
      sentenceCount++;

      // 每3-5句組成一段，或遇到特定關鍵字時分段
      const shouldBreak = sentenceCount >= 3 && sentenceCount <= 5 ||
                         /^(首先|其次|然後|最後|另外|此外|總之|因此)/g.test(sentence);

      if (shouldBreak || sentenceCount >= 5) {
        if (currentParagraph.length > 50) {
          paragraphs.push(currentParagraph);
        }
        currentParagraph = '';
        sentenceCount = 0;
      } else {
        currentParagraph += '。'; // 添加句號
      }
    });

    // 處理剩餘內容
    if (currentParagraph.trim().length > 30) {
      paragraphs.push(currentParagraph);
    }

    return paragraphs.join('\n\n');
  }

  /**
   * 提取標題
   */
  extractTitle(text) {
    const lines = text.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) return '無標題';

    // 第一行通常是標題
    const firstLine = lines[0].trim();
    
    // 檢查第一行是否像標題（長度適中，不包含過多標點）
    if (firstLine.length > 5 && firstLine.length < 100) {
      const punctuationCount = (firstLine.match(/[。！？；：,.!?;:]/g) || []).length;
      if (punctuationCount <= 2) {
        return firstLine;
      }
    }

    // 尋找其他可能的標題行
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i].trim();
      if (line.length > 5 && line.length < 80) {
        return line;
      }
    }

    return '無標題';
  }

  /**
   * 文字統計分析
   */
  analyzeText(text) {
    if (!text) return null;

    const cleanedText = text.replace(/\s/g, '');
    
    return {
      characters: text.length,
      charactersNoSpaces: cleanedText.length,
      words: this.countWords(text),
      paragraphs: text.split(/\n\s*\n/).filter(p => p.trim()).length,
      sentences: this.countSentences(text),
      readingTime: Math.ceil(this.countWords(text) / 200), // 每分鐘約200字
      language: this.detectLanguage(text)
    };
  }

  /**
   * 計算字數（中英文混合）
   */
  countWords(text) {
    // 中文字符數
    const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
    
    // 英文單詞數
    const englishWords = text
      .replace(/[\u4e00-\u9fff]/g, '') // 移除中文
      .match(/\b\w+\b/g) || [];
    
    return chineseChars + englishWords.length;
  }

  /**
   * 計算句子數
   */
  countSentences(text) {
    return (text.match(/[。！？.!?]+/g) || []).length;
  }

  /**
   * 簡單語言檢測
   */
  detectLanguage(text) {
    const chineseChars = (text.match(/[\u4e00-\u9fff]/g) || []).length;
    const totalChars = text.replace(/\s/g, '').length;
    
    if (chineseChars / totalChars > 0.3) {
      return '中文';
    } else if (/[a-zA-Z]/.test(text)) {
      return '英文';
    } else {
      return '其他';
    }
  }

  /**
   * 移除重複段落
   */
  removeDuplicateParagraphs(text) {
    const paragraphs = text.split(/\n\s*\n/);
    const seen = new Set();
    const unique = [];

    paragraphs.forEach(paragraph => {
      const normalized = paragraph.toLowerCase().replace(/\s+/g, ' ').trim();
      if (normalized.length > 10 && !seen.has(normalized)) {
        seen.add(normalized);
        unique.push(paragraph.trim());
      }
    });

    return unique.join('\n\n');
  }

  /**
   * 清理複製貼上的格式問題
   */
  fixCopyPasteIssues(text) {
    return text
      .replace(/\r\n/g, '\n')  // Windows換行符
      .replace(/\r/g, '\n')    // Mac換行符
      .replace(/\u2028/g, '\n') // Unicode換行符
      .replace(/\u2029/g, '\n\n') // Unicode段落分隔符
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // 零寬字符
      .replace(/\u00AD/g, '')   // 軟連字符
      .replace(/\t/g, ' ')      // Tab轉空格
      .trim();
  }

  /**
   * 生成清理後的預覽
   */
  generatePreview(text, maxLength = 200) {
    const cleaned = this.cleanText(text);
    
    if (cleaned.length <= maxLength) {
      return cleaned;
    }

    return cleaned.substring(0, maxLength) + '...';
  }

  /**
   * 批量清理選項
   */
  getCleaningPresets() {
    return {
      gentle: {
        name: '輕度清理',
        description: '僅移除明顯的干擾內容',
        options: {
          removeWebClutter: true,
          removeSocialMedia: false,
          removeNavigation: true,
          removeExtraSpaces: true,
          removeEmptyLines: true,
          formatParagraphs: false
        }
      },
      
      standard: {
        name: '標準清理',
        description: '推薦的平衡清理模式',
        options: {
          removeWebClutter: true,
          removeSocialMedia: true,
          removeNavigation: true,
          removeExtraSpaces: true,
          removeEmptyLines: true,
          formatParagraphs: true
        }
      },
      
      aggressive: {
        name: '深度清理',
        description: '最大程度清理和格式化',
        options: {
          removeWebClutter: true,
          removeSocialMedia: true,
          removeNavigation: true,
          removeExtraSpaces: true,
          removeEmptyLines: true,
          formatParagraphs: true,
          smartParagraphSplit: true
        }
      }
    };
  }
}

// Export for use
window.TextProcessor = TextProcessor;