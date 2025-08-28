// CleanClip External JavaScript - CSP Compliant Version
console.log('🚀 CleanClip External Script Loading...');

// 全域變數來追蹤擷取狀態和當前 tab
let isExtracting = false;
let lastTabId = null;
let lastTabUrl = null;

// 等待 DOM 載入完成
document.addEventListener('DOMContentLoaded', function() {
    console.log('📋 DOM Content Loaded');
    initializeCleanClip();
});

// 如果 DOM 已經載入完成
if (document.readyState === 'loading') {
    // 等待 DOMContentLoaded
} else {
    // DOM 已經準備好
    console.log('📋 DOM Already Ready');
    setTimeout(initializeCleanClip, 100);
}

function initializeCleanClip() {
    console.log('🔧 Initializing CleanClip...');
    
    // 獲取元素
    const clearBtn = document.getElementById('clearBtn');
    const extractBtn = document.getElementById('extractBtn');
    const saveBtn = document.getElementById('saveBtn');
    const outputDiv = document.getElementById('output');
    const textarea = document.getElementById('textarea');
    
    console.log('🎯 Elements found:', {
        clearBtn: !!clearBtn,
        extractBtn: !!extractBtn,
        saveBtn: !!saveBtn,
        outputDiv: !!outputDiv,
        textarea: !!textarea
    });
    
    // 設置事件監聽器
    if (clearBtn) {
        clearBtn.addEventListener('click', function() {
            console.log('🗑️ Clear button clicked!');
            clearAll();
        });
    }
    
    if (extractBtn) {
        extractBtn.addEventListener('click', function() {
            console.log('📄 Extract button clicked!');
            extractContent();
        });
    }
    
    if (saveBtn) {
        saveBtn.addEventListener('click', function() {
            console.log('💾 Save button clicked!');
            saveContent();
        });
    }
    
    // 初始化完成訊息
    if (outputDiv) {
        outputDiv.innerHTML = '✅ CleanClip 準備就緒！點擊「擷取網頁內容」開始使用。';
    }
    
    console.log('✅ CleanClip initialization completed');
}


function clearAll() {
    console.log('🗑️ Clear function called');
    const outputDiv = document.getElementById('output');
    const textarea = document.getElementById('textarea');
    
    // 重置擷取狀態
    isExtracting = false;
    
    if (outputDiv) {
        outputDiv.innerHTML = '✅ 內容已清空，可以擷取新的網頁內容';
    }
    
    if (textarea) {
        textarea.value = '';
    }
    
    console.log('🔄 State reset completed, ready for new extraction');
}

// 檢查並重置狀態函數
function checkAndResetState() {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs && tabs[0]) {
            const currentTab = tabs[0];
            if (lastTabId !== currentTab.id || lastTabUrl !== currentTab.url) {
                console.log('🔄 Page changed, resetting extraction state');
                isExtracting = false;
                lastTabId = currentTab.id;
                lastTabUrl = currentTab.url;
            }
        }
    });
}

function extractContent() {
    console.log('📄 Extract content function called');
    
    // 先檢查並重置狀態
    checkAndResetState();
    
    // 短暫延遲確保狀態檢查完成
    setTimeout(() => {
        performExtraction();
    }, 100);
}

function performExtraction() {
    const outputDiv = document.getElementById('output');
    const textarea = document.getElementById('textarea');
    
    // 檢查是否正在擷取中
    if (isExtracting) {
        console.log('⚠️ Already extracting, ignoring duplicate request');
        return;
    }
    
    // 設置擷取狀態
    isExtracting = true;
    
    if (outputDiv) {
        outputDiv.innerHTML = '⏳ 正在擷取內容...';
    }
    
    // 檢查 Chrome API
    if (typeof chrome === 'undefined') {
        isExtracting = false; // 重置狀態
        if (outputDiv) {
            outputDiv.innerHTML = '❌ Chrome API 不可用';
        }
        return;
    }
    
    console.log('✅ Chrome API available, starting content extraction...');
    
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (chrome.runtime.lastError) {
            isExtracting = false; // 重置狀態
            console.error('Tab query error:', chrome.runtime.lastError);
            if (outputDiv) {
                outputDiv.innerHTML = '❌ 權限錯誤：' + chrome.runtime.lastError.message;
            }
            return;
        }
        
        if (!tabs || !tabs[0]) {
            isExtracting = false; // 重置狀態
            if (outputDiv) {
                outputDiv.innerHTML = '❌ 找不到活動分頁';
            }
            return;
        }
        
        const tab = tabs[0];
        console.log('📄 Found active tab:', tab.url);
        
        if (tab.url.startsWith('chrome://')) {
            isExtracting = false; // 重置狀態
            if (outputDiv) {
                outputDiv.innerHTML = '❌ 無法在 Chrome 內建頁面擷取內容';
            }
            return;
        }
        
        chrome.scripting.executeScript({
            target: {tabId: tab.id},
            function: function() {
                const title = document.title || '未知標題';
                const url = window.location.href;
                
                // 智能內容擷取函數
                function extractContent() {
                    // Facebook 特殊處理
                    if (url.includes('facebook.com')) {
                        return extractFacebookContent();
                    }
                    
                    // Instagram 特殊處理
                    if (url.includes('instagram.com')) {
                        return extractInstagramContent();
                    }
                    
                    // Twitter/X 特殊處理
                    if (url.includes('twitter.com') || url.includes('x.com')) {
                        return extractTwitterContent();
                    }
                    
                    // 一般網站擷取
                    return extractGeneralContent();
                }
                
                // Facebook 專門擷取策略
                function extractFacebookContent() {
                    console.log('🔍 Facebook content extraction started');
                    
                    const selectors = [
                        // Facebook 貼文內容選擇器（按優先順序）
                        '[data-ad-preview="message"]',
                        '[data-testid="post_message"] div[dir="auto"]',
                        '[data-testid="post_message"]',
                        '[aria-label="貼文內容"]',
                        '[aria-label="Post"]',
                        '.userContent',
                        '.text_exposed_root',
                        'div[data-testid="post_message"] span',
                        'div[role="article"] div[dir="auto"]',
                        '[data-ft] .userContent',
                        // 新版 Facebook 選擇器
                        'div[data-pagelet="FeedUnit"] div[dir="auto"]',
                        'div[role="main"] div[dir="auto"]',
                        // 備用選擇器
                        'span[dir="auto"]',
                        'p[dir="auto"]'
                    ];
                    
                    let bestContent = '';
                    let usedSelector = '';
                    let allTexts = [];
                    
                    // 嘗試每個選擇器
                    for (let selector of selectors) {
                        const elements = document.querySelectorAll(selector);
                        console.log(`Trying selector: ${selector}, found ${elements.length} elements`);
                        
                        for (let element of elements) {
                            const text = element.innerText || element.textContent || '';
                            if (text && text.trim().length > 20) {
                                allTexts.push({
                                    text: text.trim(),
                                    length: text.trim().length,
                                    selector: selector
                                });
                                
                                // 如果找到較長的內容，使用它
                                if (text.trim().length > bestContent.length) {
                                    bestContent = text.trim();
                                    usedSelector = selector;
                                }
                            }
                        }
                        
                        // 如果已經找到不錯的內容就停止
                        if (bestContent.length > 100) break;
                    }
                    
                    // 如果還是沒找到好內容，嘗試更廣泛的搜索
                    if (bestContent.length < 50) {
                        console.log('🔄 Fallback: searching for any meaningful text');
                        
                        // 查找包含中文或英文段落的元素
                        const allDivs = document.querySelectorAll('div');
                        for (let div of allDivs) {
                            const text = div.innerText || div.textContent || '';
                            const directText = Array.from(div.childNodes)
                                .filter(node => node.nodeType === Node.TEXT_NODE)
                                .map(node => node.textContent.trim())
                                .join(' ');
                            
                            // 優先使用直接的文字節點
                            if (directText.length > 20) {
                                allTexts.push({
                                    text: directText,
                                    length: directText.length,
                                    selector: 'direct text node'
                                });
                                
                                if (directText.length > bestContent.length) {
                                    bestContent = directText;
                                    usedSelector = 'direct text node';
                                }
                            }
                        }
                    }
                    
                    console.log(`Facebook extraction result: ${bestContent.length} characters using ${usedSelector}`);
                    return {
                        content: bestContent,
                        selector: usedSelector,
                        debug: allTexts.slice(0, 5) // 保留前5個結果用於調試
                    };
                }
                
                // Instagram 擷取策略
                function extractInstagramContent() {
                    console.log('🔍 Instagram content extraction started');
                    
                    const selectors = [
                        // Instagram 貼文內容選擇器
                        'article div[style*="line-height"] span',
                        'article span[style*="line-height"]',
                        'div[role="button"] + div span',
                        'time ~ div span',
                        'article h1',
                        'article span[dir="auto"]',
                        'div[data-testid] span',
                        // 更廣泛的搜尋
                        'article div span',
                        'main article span',
                        '[role="main"] span',
                        // 備用選擇器
                        'span[style*="word-wrap"]',
                        'div[style*="white-space"] span'
                    ];
                    
                    let bestContent = '';
                    let usedSelector = '';
                    let allTexts = [];
                    
                    for (let selector of selectors) {
                        const elements = document.querySelectorAll(selector);
                        console.log(`Trying Instagram selector: ${selector}, found ${elements.length} elements`);
                        
                        for (let element of elements) {
                            const text = element.innerText || element.textContent || '';
                            if (text && text.trim().length > 15 && !text.includes('點讚') && !text.includes('留言')) {
                                allTexts.push({
                                    text: text.trim(),
                                    length: text.trim().length,
                                    selector: selector
                                });
                                
                                if (text.trim().length > bestContent.length) {
                                    bestContent = text.trim();
                                    usedSelector = selector;
                                }
                            }
                        }
                        
                        if (bestContent.length > 50) break;
                    }
                    
                    console.log(`Instagram extraction result: ${bestContent.length} characters using ${usedSelector}`);
                    return {
                        content: bestContent,
                        selector: usedSelector,
                        debug: allTexts.slice(0, 3)
                    };
                }
                
                // Twitter 擷取策略
                function extractTwitterContent() {
                    const selectors = [
                        '[data-testid="tweetText"]',
                        'div[lang] span',
                        'article div[lang]'
                    ];
                    
                    for (let selector of selectors) {
                        const element = document.querySelector(selector);
                        if (element) {
                            const text = element.innerText || element.textContent || '';
                            if (text.trim().length > 10) {
                                return {
                                    content: text.trim(),
                                    selector: selector,
                                    debug: []
                                };
                            }
                        }
                    }
                    
                    return { content: '', selector: 'none', debug: [] };
                }
                
                // 通用內容清理系統
                function universalContentCleaning(element) {
                    const clonedElement = element.cloneNode(true);
                    
                    // 1. CSS 選擇器過濾（適用所有網站）
                    const universalUnwantedSelectors = [
                        // 導航和結構
                        'nav', 'header', 'footer', 'aside', '.sidebar', '.menu', '.navbar',
                        // 廣告相關（通用）
                        '.ad', '.ads', '.advertisement', '[class*="ad-"]', '[id*="ad-"]',
                        '.sponsored', '.promo', '.banner', '.google-auto-placed', '.adsbygoogle',
                        '[data-ad-client]', '[data-ad-slot]', '.adsystem', '.ad-container',
                        // 訂閱相關（通用）
                        '.newsletter', '.subscribe', '.subscription', '[class*="newsletter"]',
                        '[class*="subscribe"]', '.email-signup', '.signup-form',
                        // 社群分享（通用）
                        '.social', '.share', '.sharing', '[class*="share"]', '[class*="social"]',
                        // 圖片相關（通用）
                        '.caption', '.photo-credit', '.image-source', 'figcaption',
                        '.getty', '.reuters', '.ap-photo', '.photo-info', '.image-info',
                        // 互動元素（通用）
                        '.comments', '.comment', '.disqus', '.fb-comments', '.related',
                        '.recommendation', '.more-stories', '.tags', '.categories',
                        // 促銷內容（通用）
                        '.cta', '.call-to-action', '.marketing', '.promotional',
                        // 技術元素
                        'script', 'style', 'noscript', 'iframe'
                    ];
                    
                    universalUnwantedSelectors.forEach(selector => {
                        const elements = clonedElement.querySelectorAll(selector);
                        elements.forEach(el => el.remove());
                    });
                    
                    // 2. 智能內容檢測（通用廣告和圖片說明識別）
                    const allElements = clonedElement.querySelectorAll('*');
                    allElements.forEach(el => {
                        const text = el.textContent || '';
                        const textLower = text.toLowerCase().trim();
                        
                        // 廣告內容檢測
                        if (isAdvertisementContent(text)) {
                            el.remove();
                            return;
                        }
                        
                        // 圖片說明檢測
                        if (isImageCaptionContent(text)) {
                            el.remove();
                            return;
                        }
                        
                        // 訂閱內容檢測
                        if (isSubscriptionContent(text)) {
                            el.remove();
                            return;
                        }
                    });
                    
                    return clonedElement;
                }
                
                // 廣告內容檢測函數
                function isAdvertisementContent(text) {
                    if (!text || text.length > 200) return false; // 長文不太可能是廣告
                    
                    const adPatterns = [
                        // 中文廣告模式
                        /^\s*廣告\s*$/,
                        /^\s*贊助內容\s*$/,
                        /^\s*推廣\s*$/,
                        // 英文廣告模式  
                        /^\s*advertisement\s*$/i,
                        /^\s*sponsored\s*$/i,
                        /^\s*promoted\s*$/i,
                        // 複合廣告模式
                        /贊助.*內容/,
                        /sponsored.*content/i,
                        /廣告.*訊息/
                    ];
                    
                    return adPatterns.some(pattern => pattern.test(text.trim()));
                }
                
                // 圖片說明檢測函數  
                function isImageCaptionContent(text) {
                    if (!text || text.length > 150) return false; // 長文不太可能是圖片說明
                    
                    const captionPatterns = [
                        // 中文圖片說明模式
                        /圖片來源[:：]/,
                        /照片來源[:：]/,
                        /資料來源[:：]/,
                        /圖[:：]/,
                        /來源[:：].*getty/i,
                        /來源[:：].*shutterstock/i,
                        /來源[:：].*reuters/i,
                        // 英文圖片說明模式
                        /photo.*credit/i,
                        /image.*source/i,
                        /source[:：].*getty/i,
                        /courtesy.*of/i,
                        // 攝影師標註
                        /攝影[:：]/,
                        /photographer[:：]/i
                    ];
                    
                    return captionPatterns.some(pattern => pattern.test(text));
                }
                
                // 訂閱內容檢測函數
                function isSubscriptionContent(text) {
                    if (!text || text.length > 300) return false;
                    
                    const subscriptionPatterns = [
                        // 訂閱提示
                        /立即訂閱/,
                        /免費訂閱/,
                        /訂閱.*電子報/,
                        /加入會員/,
                        /subscribe.*now/i,
                        /join.*newsletter/i,
                        /sign.*up.*free/i,
                        // Email 相關
                        /gmail\.com/,
                        /hotmail\.com/,
                        /yahoo\.com/,
                        /請.*輸入.*email/i,
                        // 謝謝訊息
                        /謝謝訂閱/,
                        /thank.*you.*subscribing/i,
                        // 會議活動廣告
                        /高峰會.*解密/,
                        /營收.*加速器/,
                        /roi.*倍增/i
                    ];
                    
                    return subscriptionPatterns.some(pattern => pattern.test(text));
                }
                
                // 通用文字清理函數
                function universalTextCleaning(text) {
                    return text.trim()
                        .split('\n')
                        .map(line => line.trim())
                        .filter(line => {
                            // 過濾太短的行
                            if (line.length < 2) return false;
                            
                            // 過濾廣告行
                            if (isAdvertisementContent(line)) return false;
                            
                            // 過濾圖片說明行
                            if (isImageCaptionContent(line)) return false;
                            
                            // 過濾訂閱行
                            if (isSubscriptionContent(line)) return false;
                            
                            return true;
                        })
                        .join('\n')
                        .replace(/\n{4,}/g, '\n\n\n')  // 最多3個換行
                        .replace(/[ \t]{3,}/g, '  ');  // 最多2個空格
                }
                
                // 數位時代專門擷取策略（簡化版，主要用通用清理）
                function extractBusinessNextContent() {
                    console.log('🔍 BusinessNext (數位時代) content extraction started');
                    
                    let content = '';
                    let metadata = '';
                    let usedSelector = '';
                    
                    // 擷取文章metadata
                    try {
                        // 日期
                        const dateEl = document.querySelector('.article-info time, .date, .publish-date');
                        const articleDate = dateEl ? dateEl.textContent.trim() : '';
                        
                        // 分類
                        const categoryEl = document.querySelector('.category, .article-category, .breadcrumb a:last-child');
                        const category = categoryEl ? categoryEl.textContent.trim() : '';
                        
                        // 標題
                        const titleEl = document.querySelector('h1, .article-title');
                        const articleTitle = titleEl ? titleEl.textContent.trim() : '';
                        
                        // 作者
                        const authorEl = document.querySelector('.author, .byline, .article-author');
                        const author = authorEl ? authorEl.textContent.trim() : '';
                        
                        // 標籤
                        const tagElements = document.querySelectorAll('.tags a, .article-tags a, [class*="tag"]');
                        const tags = Array.from(tagElements).map(tag => tag.textContent.trim()).filter(t => t.length > 0);
                        
                        // 組合metadata
                        if (articleDate) metadata += articleDate + '\n';
                        if (category) metadata += '| ' + category + '\n';
                        if (articleTitle) metadata += articleTitle + '\n';
                        if (author) metadata += author + '\n';
                        if (tags.length > 0) metadata += tags.map(t => '#' + t).join(' ') + '\n\n';
                        
                    } catch (e) {
                        console.log('Metadata extraction failed:', e);
                    }
                    
                    // 擷取文章主體內容
                    const contentSelectors = [
                        '.article-content', 
                        '.content-body',
                        'article .content'
                    ];
                    
                    for (let selector of contentSelectors) {
                        const element = document.querySelector(selector);
                        if (element) {
                            // 使用通用清理系統
                            const cleanedElement = universalContentCleaning(element);
                            content = cleanedElement.innerText || cleanedElement.textContent || '';
                            
                            if (content.trim().length > 500) {
                                usedSelector = selector + ' (BusinessNext)';
                                break;
                            }
                        }
                    }
                    
                    // 使用通用文字清理
                    const cleanContent = universalTextCleaning(content);
                    
                    const finalContent = metadata + cleanContent;
                    
                    console.log(`BusinessNext extraction result: ${finalContent.length} characters using ${usedSelector}`);
                    return {
                        content: finalContent,
                        selector: usedSelector,
                        debug: []
                    };
                }
                
                // 一般網站擷取策略
                function extractGeneralContent() {
                    console.log('🔍 General content extraction started');
                    
                    // 數位時代特殊處理
                    if (url.includes('bnext.com.tw')) {
                        return extractBusinessNextContent();
                    }
                    
                    const selectors = [
                        // 新聞網站主要內容選擇器
                        'article',
                        'main article',
                        '[role="main"] article',
                        'main',
                        '[role="main"]',
                        // 特定新聞網站選擇器
                        '.story-body',
                        '.article-body',
                        '.article-content',
                        '.news-content',
                        '.post-content',
                        '.entry-content',
                        '.content-body',
                        '.main-content',
                        // 數位時代等特殊選擇器
                        '.post-body',
                        '.article-text',
                        '.content-text',
                        '.article-detail',
                        // 通用選擇器
                        '.content',
                        '#content',
                        '#main-content',
                        // ID 選擇器
                        '#article-content',
                        '#post-content'
                    ];
                    
                    let bestContent = '';
                    let usedSelector = '';
                    let allTexts = [];
                    
                    for (let selector of selectors) {
                        const element = document.querySelector(selector);
                        if (element) {
                            // 使用通用清理系統
                            const cleanedElement = universalContentCleaning(element);
                            const text = cleanedElement.innerText || cleanedElement.textContent || '';
                            const cleanText = universalTextCleaning(text);
                            
                            console.log(`Trying selector: ${selector}, found ${cleanText.length} characters`);
                            
                            if (cleanText.length > 100) {
                                allTexts.push({
                                    text: cleanText,
                                    length: cleanText.length,
                                    selector: selector
                                });
                                
                                if (cleanText.length > bestContent.length) {
                                    bestContent = cleanText;
                                    usedSelector = selector;
                                }
                            }
                        }
                        
                        // 如果找到足夠長的內容就停止
                        if (bestContent.length > 500) break;
                    }
                    
                    // 如果還是沒找到好內容，使用 body 但清理掉導航等元素
                    if (bestContent.length < 200) {
                        console.log('🔄 Fallback: using cleaned body content');
                        // 使用通用清理系統處理整個 body
                        const cleanedBody = universalContentCleaning(document.body);
                        const bodyText = cleanedBody.innerText || cleanedBody.textContent || '';
                        const cleanBodyText = universalTextCleaning(bodyText);
                        
                        if (cleanBodyText.length > bestContent.length) {
                            bestContent = cleanBodyText;
                            usedSelector = 'body (cleaned)';
                        }
                    }
                    
                    console.log(`General extraction result: ${bestContent.length} characters using ${usedSelector}`);
                    return {
                        content: bestContent,
                        selector: usedSelector,
                        debug: allTexts.slice(0, 3)
                    };
                }
                
                // 執行擷取
                const result = extractContent();
                
                return {
                    title: title,
                    content: result.content.substring(0, 8000), // 大幅增加字數限制
                    length: result.content.length,
                    selector: result.selector,
                    url: url,
                    debug: result.debug || [],
                    platform: url.includes('facebook.com') ? 'Facebook' : 
                             url.includes('instagram.com') ? 'Instagram' :
                             url.includes('twitter.com') || url.includes('x.com') ? 'Twitter' : 'General'
                };
            }
        }).then(function(results) {
            isExtracting = false; // 重置狀態
            
            if (results && results[0] && results[0].result) {
                const data = results[0].result;
                console.log('✅ Content extracted:', data);
                
                if (outputDiv) {
                    outputDiv.innerHTML = `✅ 內容擷取成功！<br>長度：${data.length} 字符`;
                }
                
                if (textarea) {
                    let debugInfo = '';
                    if (data.debug && data.debug.length > 0) {
                        debugInfo = '\n--- 調試資訊 ---\n' +
                            data.debug.map((item, index) => 
                                `${index + 1}. ${item.selector} (${item.length} 字符): ${item.text.substring(0, 100)}...`
                            ).join('\n') + '\n';
                    }
                    
                    textarea.value = `平台：${data.platform || 'General'}\n` +
                        `標題：${data.title}\n` +
                        `網址：${data.url}\n` +
                        `使用選擇器：${data.selector}\n` +
                        `內容長度：${data.length} 字符\n` +
                        debugInfo +
                        `\n--- 擷取內容 ---\n${data.content}`;
                }
            } else {
                console.error('No extraction result');
                if (outputDiv) {
                    outputDiv.innerHTML = '❌ 擷取失敗：無結果';
                }
            }
        }).catch(function(error) {
            isExtracting = false; // 重置狀態
            console.error('Script execution error:', error);
            if (outputDiv) {
                outputDiv.innerHTML = '❌ 腳本執行失敗：' + error.message;
            }
        });
    });
}

function saveContent() {
    console.log('💾 Save content function called');
    const textarea = document.getElementById('textarea');
    const outputDiv = document.getElementById('output');
    
    if (!textarea || !textarea.value.trim()) {
        alert('沒有內容可以儲存！');
        return;
    }
    
    try {
        const text = textarea.value;
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cleanclip-${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        if (outputDiv) {
            outputDiv.innerHTML += '<br>✅ 檔案已下載';
        }
        
        console.log('✅ File download completed');
    } catch (error) {
        console.error('Save error:', error);
        if (outputDiv) {
            outputDiv.innerHTML += '<br>❌ 儲存失敗：' + error.message;
        }
    }
}

