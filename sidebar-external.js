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
                
                // 一般網站擷取策略
                function extractGeneralContent() {
                    console.log('🔍 General content extraction started');
                    
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
                            // 移除不必要的元素
                            const clonedElement = element.cloneNode(true);
                            const unwantedSelectors = [
                                // 導航和結構元素
                                'nav', 'header', 'footer', 'aside', '.sidebar', '.menu',
                                // 廣告相關
                                '.advertisement', '.ad', '.ads', '.ad-container', '.ad-wrapper', 
                                '.ad-banner', '.ad-content', '.ad-block', '.ad-space',
                                '.google-auto-placed', '.adsbygoogle', '[data-ad-client]',
                                '[data-ad-slot]', '.adsystem', '.ad-unit',
                                // 訂閱和電子報
                                '.newsletter', '.newsletter-signup', '.newsletter-form',
                                '.subscription', '.subscription-box', '.subscribe-box',
                                '.email-signup', '.signup-form', '.join-newsletter',
                                // 社群分享
                                '.social-share', '.share-buttons', '.social-buttons', 
                                '.sharing-tools', '.share-widget', '.social-media',
                                // 圖片和媒體資訊
                                '.image-caption', '.photo-credit', '.image-source', '.caption',
                                '.getty', '.reuters', '.ap-photo', '.photo-info', '.image-info',
                                'figcaption', '.media-caption', '.pic-info',
                                // 相關文章和推薦
                                '.related-articles', '.recommended', '.more-stories',
                                '.related-content', '.suggestion-box',
                                // 留言和互動
                                '.comments', '.comment-section', '.disqus', '.fb-comments',
                                // 促銷和宣傳
                                '.promo-box', '.promotion', '.banner', '.call-to-action',
                                '.cta-box', '.marketing-box',
                                // 標籤和分類
                                '.tags', '.categories', '.tag-list', '.breadcrumb',
                                // 其他雜訊
                                'iframe', 'script', 'style', 'noscript', '.hidden',
                                // 版權和法律
                                '.copyright', '.disclaimer', '.legal-notice'
                            ];
                            
                            // 移除不需要的元素
                            unwantedSelectors.forEach(unwanted => {
                                const unwantedElements = clonedElement.querySelectorAll(unwanted);
                                unwantedElements.forEach(el => el.remove());
                            });
                            
                            // 只移除明顯的廣告和訂閱元素（更保守的策略）
                            const allElements = clonedElement.querySelectorAll('*');
                            allElements.forEach(el => {
                                const text = el.textContent || '';
                                const textLower = text.trim().toLowerCase();
                                
                                // 只移除明顯的訂閱提示（完整句子，不是單詞）
                                if ((textLower.includes('訂閱電子報') || textLower.includes('免費訂閱') ||
                                     textLower.includes('立即訂閱') || textLower.includes('加入會員') ||
                                     textLower.includes('subscribe to') || textLower.includes('join our newsletter')) &&
                                    text.trim().length < 100) {  // 短文字才移除
                                    el.remove();
                                    return;
                                }
                                
                                // 只移除明顯的圖片來源標注
                                if ((textLower.includes('圖片來源：') || textLower.includes('photo credit:') ||
                                     textLower.includes('來源：getty') || textLower.includes('source:')) &&
                                    text.trim().length < 80) {  // 短文字才移除
                                    el.remove();
                                    return;
                                }
                                
                                // 移除明顯的廣告標示
                                if ((textLower === '廣告' || textLower === 'advertisement' || 
                                     textLower === 'sponsored content' || textLower.includes('贊助內容')) &&
                                    text.trim().length < 50) {
                                    el.remove();
                                    return;
                                }
                            });
                            
                            // 使用 innerText 來保持原始排版
                            const text = clonedElement.innerText || '';
                            if (!text) {
                                // 備案：使用 textContent 但需要更多處理
                                const rawText = clonedElement.textContent || '';
                                const cleanText = rawText.trim()
                                    .split('\n')
                                    .map(line => line.trim())
                                    .filter(line => {
                                        if (line.length < 2) return false;
                                        const lineLower = line.toLowerCase().trim();
                                        const exactUnwantedLines = [
                                            '廣告', 'advertisement', 'sponsored',
                                            '訂閱電子報', '免費訂閱', '立即訂閱'
                                        ];
                                        return !exactUnwantedLines.includes(lineLower);
                                    })
                                    .join('\n')
                                    .replace(/\n{4,}/g, '\n\n\n')
                                    .replace(/[ \t]{3,}/g, '  ');
                                
                                console.log(`Using textContent fallback: ${cleanText.length} characters`);
                                
                                if (cleanText.length > 100) {
                                    allTexts.push({
                                        text: cleanText,
                                        length: cleanText.length,
                                        selector: selector + ' (textContent)'
                                    });
                                    
                                    if (cleanText.length > bestContent.length) {
                                        bestContent = cleanText;
                                        usedSelector = selector + ' (textContent)';
                                    }
                                }
                                continue;
                            }
                            
                            // 保守的文字清理，保留正文內容
                            const cleanText = text.trim()
                                .split('\n')
                                .map(line => line.trim())
                                .filter(line => {
                                    // 只過濾明顯無用的行
                                    if (line.length < 2) return false;
                                    
                                    // 只過濾明顯的廣告標示行（完整匹配，不是包含）
                                    const lineLower = line.toLowerCase().trim();
                                    const exactUnwantedLines = [
                                        '廣告', 'advertisement', 'sponsored', '贊助內容',
                                        '訂閱電子報', '免費訂閱', '立即訂閱', '加入會員',
                                        'subscribe now', 'join newsletter', 'sign up'
                                    ];
                                    
                                    // 只移除完全匹配的行，不是包含
                                    return !exactUnwantedLines.includes(lineLower);
                                })
                                .join('\n')
                                .replace(/\n{4,}/g, '\n\n\n')   // 最多保留3個連續換行
                                .replace(/[ \t]{3,}/g, '  ');   // 最多保留2個空格
                            
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
                        const bodyClone = document.body.cloneNode(true);
                        const unwantedSelectors = [
                            // 導航和結構元素
                            'nav', 'header', 'footer', 'aside', '.sidebar', '.menu', '.navbar',
                            // 廣告相關
                            '.advertisement', '.ad', '.ads', '.ad-container', '.ad-wrapper', 
                            '.ad-banner', '.ad-content', '.google-auto-placed', '.adsbygoogle',
                            '[data-ad-client]', '[data-ad-slot]', '.adsystem',
                            // 訂閱和電子報
                            '.newsletter', '.newsletter-signup', '.subscription-box',
                            '.email-signup', '.subscribe-box', '.join-newsletter',
                            // 社群分享和互動
                            '.social-share', '.share-buttons', '.social-buttons', '.sharing-tools',
                            '.comments', '.comment-section', '.disqus', '.fb-comments',
                            // 圖片和媒體資訊
                            '.image-caption', '.photo-credit', '.image-source', 'figcaption',
                            '.getty', '.reuters', '.ap-photo', '.photo-info',
                            // 相關內容和推薦
                            '.related-articles', '.recommended', '.more-stories',
                            '.related-content', '.suggestion-box',
                            // 促銷和其他雜訊
                            '.promo-box', '.promotion', '.banner', '.call-to-action',
                            '.tags', '.categories', '.breadcrumb', '.copyright',
                            'script', 'style', 'noscript', 'iframe'
                        ];
                        
                        unwantedSelectors.forEach(unwanted => {
                            const unwantedElements = bodyClone.querySelectorAll(unwanted);
                            unwantedElements.forEach(el => el.remove());
                        });
                        
                        const bodyText = bodyClone.innerText || bodyClone.textContent || '';
                        const cleanBodyText = bodyText.trim()
                            .split('\n')
                            .map(line => line.trim())
                            .filter(line => {
                                if (line.length < 2) return false;
                                const lineLower = line.toLowerCase().trim();
                                const exactUnwantedLines = [
                                    '廣告', 'advertisement', 'sponsored', '贊助內容',
                                    '訂閱電子報', '免費訂閱', '立即訂閱', '加入會員'
                                ];
                                return !exactUnwantedLines.includes(lineLower);
                            })
                            .join('\n')
                            .replace(/\n{4,}/g, '\n\n\n')
                            .replace(/[ \t]{3,}/g, '  ');
                        
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

