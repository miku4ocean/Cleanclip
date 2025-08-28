// CleanClip External JavaScript - CSP Compliant Version
console.log('🚀 CleanClip External Script Loading...');

// 全域變數來追蹤擷取狀態
let isExtracting = false;

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

function extractContent() {
    console.log('📄 Extract content function called');
    
    // 檢查是否正在擷取中
    if (isExtracting) {
        console.log('⚠️ Already extracting, ignoring duplicate request');
        return;
    }
    
    // 設置擷取狀態
    isExtracting = true;
    
    const outputDiv = document.getElementById('output');
    const textarea = document.getElementById('textarea');
    
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
                                'nav', 'header', 'footer', 'aside', '.sidebar',
                                '.advertisement', '.ad', '.social-share',
                                '.related-articles', '.comments', '.comment-section'
                            ];
                            
                            unwantedSelectors.forEach(unwanted => {
                                const unwantedElements = clonedElement.querySelectorAll(unwanted);
                                unwantedElements.forEach(el => el.remove());
                            });
                            
                            const text = clonedElement.innerText || clonedElement.textContent || '';
                            // 保留段落結構，只清理過多的空行
                            const cleanText = text.trim().replace(/\n{3,}/g, '\n\n').replace(/[ \t]+/g, ' ');
                            
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
                            'nav', 'header', 'footer', 'aside', '.sidebar', '.menu',
                            '.advertisement', '.ad', '.social-share', '.navbar',
                            '.related-articles', '.comments', '.comment-section',
                            'script', 'style', 'noscript'
                        ];
                        
                        unwantedSelectors.forEach(unwanted => {
                            const unwantedElements = bodyClone.querySelectorAll(unwanted);
                            unwantedElements.forEach(el => el.remove());
                        });
                        
                        const bodyText = bodyClone.innerText || bodyClone.textContent || '';
                        const cleanBodyText = bodyText.trim().replace(/\n{3,}/g, '\n\n').replace(/[ \t]+/g, ' ');
                        
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

