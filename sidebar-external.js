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
    
    // 完全重置所有狀態
    isExtracting = false;
    lastTabId = null;
    lastTabUrl = null;
    
    if (outputDiv) {
        outputDiv.innerHTML = '✅ 內容已清空，可以擷取新的網頁內容';
    }
    
    if (textarea) {
        textarea.value = '';
    }
    
    console.log('🔄 All states reset completed, ready for new extraction from any page');
}

// 檢查並重置狀態函數（改為 Promise 版本）
function checkAndResetState() {
    return new Promise((resolve) => {
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
            resolve();
        });
    });
}

async function extractContent() {
    console.log('📄 Extract content function called');
    
    // 等待狀態檢查完成
    await checkAndResetState();
    
    // 直接執行擷取
    performExtraction();
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
                    
                    // 台灣新聞網站特殊處理
                    if (url.includes('cw.com.tw') || url.includes('udn.com') || 
                        url.includes('pixnet.net') || url.includes('thenewslens.com') ||
                        url.includes('cna.com.tw')) {
                        return extractTaiwanNewsContent();
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
                    
                    // 1. CSS 選擇器過濾（加強版 - 針對台灣新聞網站）
                    const universalUnwantedSelectors = [
                        // 導航和結構（安全移除）
                        'nav', 'header', 'footer', 'aside', '.sidebar', '.menu', '.navbar',
                        // 廣告相關（明確標識）- 加強版
                        '.advertisement', '.adsbygoogle', '.google-auto-placed',
                        '[data-ad-client]', '[data-ad-slot]', '.adsystem', 
                        '.ad-container', '.ad-wrapper', '.ad-banner', '.ad-block',
                        // 聯合報特殊廣告選擇器
                        '.story-ad', '.story-list-ad', '.news-ad', '.inline-ad',
                        '.native-ad', '.promoted-content', '.sponsor-content',
                        // 更多廣告變形
                        '[class*="ad-"]', '[id*="ad-"]', '[class*="ads"]', '[id*="ads"]',
                        '.dfp-ad', '.banner-ad', '.text-ad', '.display-ad',
                        // Google廣告特殊過濾 - 針對聯合報
                        '.adsbygoogle', '[data-google-av-cxn]', '[data-google-av-cpmav]',
                        '.google_ads', '.googleads', '.goog-te-banner-frame',
                        '[id*="google"]', '[class*="google"]', 
                        // DFP和其他廣告系統
                        '[id*="dfp"]', '[class*="dfp"]', '[id*="gpt"]', '[class*="gpt"]',
                        // 訂閱相關（明確標識）
                        '.newsletter-signup', '.subscription-box', '.email-signup', 
                        '.signup-form', '.subscribe-form',
                        // 社群分享（明確標識）
                        '.social-share', '.share-buttons', '.social-buttons', '.sharing-tools',
                        // 圖片相關（明確標識）
                        '.photo-credit', '.image-source', '.image-caption',
                        '.getty-embed', '.reuters-embed', '.ap-embed',
                        // 互動元素（明確標識）
                        '.comments-section', '.comment-form', '.disqus-thread', '.fb-comments-wrapper',
                        // 推薦相關（明確標識）
                        '.related-articles', '.recommended-articles', '.more-stories-section',
                        // 促銷內容（明確標識）
                        '.call-to-action', '.marketing-banner', '.promotional-content',
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
                        
                        // Google廣告代碼檢測 - 針對聯合報問題
                        if (isGoogleAdCode(text, el)) {
                            console.log(`Removing Google ad code: "${text.substring(0, 50)}..."`);
                            el.remove();
                            return;
                        }
                        
                        // 廣告內容檢測（增強版 - 考慮上下文）
                        if (isAdvertisementContent(text, el)) {
                            el.remove();
                            return;
                        }
                        
                        // 圖片說明檢測（智慧版 - 保留有內容的說明）
                        if (isImageCaptionContent(text, el)) {
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
                
                // 動態閾值調整函數（基於平台和內容類型）
                function getContentThreshold(platformType, contentType) {
                    // 根據平台調整
                    if (platformType === 'twitter') return 10; // Twitter短推文
                    if (platformType === 'instagram' && contentType === 'caption') return 20;
                    if (platformType === 'facebook' && contentType === 'post') return 15;
                    
                    // 根據內容類型調整
                    if (contentType === 'financial') return 5; // 財務數據可以很短
                    if (contentType === 'news_alert') return 8; // 突發新聞
                    if (contentType === 'quote') return 12; // 專家引言
                    if (contentType === 'headline') return 6; // 新聞標題
                    
                    return 30; // 預設閾值
                }
                
                // 平台類型檢測函數
                function detectPlatformType() {
                    const hostname = window.location.hostname.toLowerCase();
                    const url = window.location.href.toLowerCase();
                    
                    if (hostname.includes('facebook.com') || hostname.includes('fb.com')) return 'facebook';
                    if (hostname.includes('instagram.com')) return 'instagram';
                    if (hostname.includes('twitter.com') || hostname.includes('t.co')) return 'twitter';
                    if (hostname.includes('linkedin.com')) return 'linkedin';
                    if (hostname.includes('bnext.com') || hostname.includes('businessweekly.com') || 
                        hostname.includes('cw.com.tw') || hostname.includes('udn.com') ||
                        hostname.includes('chinatimes.com') || hostname.includes('ltn.com.tw') ||
                        hostname.includes('pixnet.net') || hostname.includes('thenewslens.com') ||
                        hostname.includes('cna.com.tw')) return 'taiwan_news';
                    if (hostname.includes('techcrunch.com') || hostname.includes('theverge.com') || 
                        hostname.includes('wired.com')) return 'tech_news';
                    if (hostname.includes('reuters.com') || hostname.includes('bloomberg.com') ||
                        hostname.includes('wsj.com') || hostname.includes('ft.com')) return 'financial_news';
                    if (hostname.includes('medium.com') || hostname.includes('substack.com')) return 'blog_platform';
                    
                    return 'general';
                }
                
                // 檢測合法重要短內容（保護財務數據、專家引言等）
                function isLegitimateShortContent(text, element) {
                    if (!text) return false;
                    
                    const platformType = detectPlatformType();
                    const maxLength = platformType === 'twitter' ? 280 : 200; // Twitter特殊處理
                    if (text.length > maxLength) return false;
                    
                    const textTrimmed = text.trim();
                    
                    // 財務數據模式（台灣 + 國際）
                    const financialPatterns = [
                        // 台股相關
                        /\d+億|\d+萬|營收|獲利|成長\d+%|下跌\d+%/,
                        /股價|市值|EPS|本益比|殖利率|股息/,
                        /台積電|鴻海|聯發科|台塑|中鋼|大立光|聯電|日月光/,
                        // 國際股市
                        /S&P|Nasdaq|FTSE|Dow Jones|NYSE|TSE/i,
                        /Apple|Microsoft|Google|Tesla|Amazon|Meta/i,
                        // 經濟指標
                        /GDP|CPI|通膨|利率|匯率|Fed|央行/,
                        // 加密貨幣
                        /Bitcoin|Ethereum|BTC|ETH|cryptocurrency/i,
                        // ESG投資
                        /ESG|永續|綠能|碳中和|renewable/i
                    ];
                    
                    // 專家引言模式（更全面）
                    const expertQuotePatterns = [
                        // 台灣高層
                        /執行長|總經理|董事長|分析師|研究員.*表示/,
                        /專家.*指出|學者.*認為|業界.*預期/,
                        // 國際權威
                        /CEO|CFO|CTO.*said|analyst.*noted/i,
                        /expert.*believes|researcher.*found/i,
                        // 調查研究
                        /調查顯示|統計指出|研究發現|數據顯示/,
                        /survey shows|study found|data indicates/i,
                        // 機構報告
                        /根據.*報告|.*機構指出|.*銀行認為/,
                        /according to.*report|.*institute says/i
                    ];
                    
                    // 重要結論模式
                    const conclusionPatterns = [
                        /總結|結論|關鍵.*在於|重點.*為/,
                        /預測|展望|預期.*將|未來.*可能/,
                        /conclusion|summary|key.*point|outlook/i,
                        /forecast|expect.*to|future.*may/i
                    ];
                    
                    // 新聞重點模式
                    const newsHighlightPatterns = [
                        /突發|緊急|重大|獨家|最新消息/,
                        /breaking|urgent|exclusive|latest/i,
                        /快訊|即時|更新|live/i
                    ];
                    
                    // 檢查元素上下文
                    if (element) {
                        const contextClasses = (element.className || '').toLowerCase();
                        const parentClasses = (element.parentElement?.className || '').toLowerCase();
                        const allClasses = contextClasses + ' ' + parentClasses;
                        
                        // 引言框、重點框、數據框
                        if (allClasses.match(/quote|highlight|callout|important|emphasis|blockquote|pullquote|sidebar|infobox|databox|factbox/)) {
                            console.log(`Preserving contextual content: "${text}"`);
                            return true;
                        }
                        
                        // 標題類元素
                        if (['H1','H2','H3','H4','H5','H6'].includes(element.tagName)) {
                            return true;
                        }
                    }
                    
                    // 模式匹配檢查
                    return financialPatterns.some(pattern => pattern.test(textTrimmed)) ||
                           expertQuotePatterns.some(pattern => pattern.test(textTrimmed)) ||
                           conclusionPatterns.some(pattern => pattern.test(textTrimmed)) ||
                           newsHighlightPatterns.some(pattern => pattern.test(textTrimmed));
                }
                
                // Google廣告代碼檢測函數（針對聯合報等網站）
                function isGoogleAdCode(text, element) {
                    if (!text) return false;
                    
                    const textTrimmed = text.trim();
                    
                    // 檢查是否包含Google廣告相關代碼或標識
                    const googleAdPatterns = [
                        // Google廣告代碼模式
                        /googletag\.cmd\.push/i,
                        /adsbygoogle/i,
                        /google_ad_client/i,
                        /google_ad_slot/i,
                        /googleads\.g\.doubleclick\.net/i,
                        /pagead2\.googlesyndication\.com/i,
                        // DFP相關
                        /dfp\..*\.googletag/i,
                        /gpt\.js/i,
                        // 廣告相關JavaScript
                        /googletag\.display/i,
                        /refreshAds|loadAds|showAds/i,
                        // 廣告容器檢測
                        /div-gpt-ad/i,
                        // 常見廣告JavaScript模式
                        /\.push\s*\(\s*function\s*\(\s*\)\s*\{.*ad/i
                    ];
                    
                    // 檢查元素屬性
                    if (element) {
                        const className = element.className || '';
                        const elementId = element.id || '';
                        const tagName = element.tagName || '';
                        
                        // script標籤且包含廣告代碼
                        if (tagName.toLowerCase() === 'script' && 
                            googleAdPatterns.some(pattern => pattern.test(textTrimmed))) {
                            return true;
                        }
                        
                        // 元素有廣告相關的class或id
                        const adElementPatterns = [
                            /adsbygoogle/i, /google.*ad/i, /dfp.*ad/i, /gpt.*ad/i
                        ];
                        
                        if (adElementPatterns.some(pattern => 
                            pattern.test(className) || pattern.test(elementId))) {
                            return true;
                        }
                    }
                    
                    // 檢查文字內容是否為廣告代碼
                    return googleAdPatterns.some(pattern => pattern.test(textTrimmed));
                }
                
                // 廣告內容檢測函數（增強版 - 上下文感知）
                function isAdvertisementContent(text, element) {
                    if (!text || text.length > 200) return false;  // 增加長度限制
                    
                    const textTrimmed = text.trim();
                    
                    // 先檢查是否為合法重要內容
                    if (isLegitimateShortContent(text, element)) {
                        console.log(`Preserving important content: "${text}"`);
                        return false;
                    }
                    
                    // 元素類別和ID檢查 - 針對廣告元素
                    if (element) {
                        const className = element.className || '';
                        const elementId = element.id || '';
                        
                        // 檢查廣告相關的class和id
                        const adElementPatterns = [
                            /ad[-_]/i, /[-_]ad/i, /ads/i, /advertisement/i,
                            /sponsor/i, /promote/i, /native[-_]?ad/i,
                            /banner/i, /dfp/i, /adsystem/i
                        ];
                        
                        if (adElementPatterns.some(pattern => 
                            pattern.test(className) || pattern.test(elementId))) {
                            return true;
                        }
                    }
                    
                    // 完全匹配的廣告標示（擴展版）
                    const exactAdMatches = [
                        '廣告', 'Advertisement', 'ADVERTISEMENT', 'AD', 'ad',
                        '贊助內容', 'Sponsored Content', 'SPONSORED', 'Sponsored',
                        '推廣內容', 'Promoted Content', 'PROMOTED',
                        '相關廣告', '推薦廣告', '廣告區', 'AD AREA'
                    ];
                    
                    // 檢測完全匹配
                    if (exactAdMatches.includes(textTrimmed)) return true;
                    
                    // 廣告模式檢測（加強版）
                    const adPatterns = [
                        /^廣告$/,
                        /^贊助內容$/,
                        /^sponsored$/i,
                        /^advertisement$/i,
                        /廣告區/,
                        /推薦廣告/,
                        /相關廣告/,
                        // 聯合報特有廣告模式
                        /看更多.*內容/,
                        /立即購買|立即訂閱/,
                        /點擊查看|點擊了解/,
                        // 常見廣告call to action
                        /免費試用|立即下載|馬上體驗/
                    ];
                    
                    return adPatterns.some(pattern => pattern.test(textTrimmed));
                }
                
                // 圖片說明檢測函數（智能策略 - 保留有實質內容的說明）
                function isImageCaptionContent(text, element) {
                    if (!text || text.length > 80) return false;
                    
                    const textTrimmed = text.trim();
                    
                    // 檢查是否為重要內容（即使看起來像圖片說明）
                    if (isLegitimateShortContent(text, element)) {
                        console.log(`Preserving important caption content: "${text}"`);
                        return false;
                    }
                    
                    // 明確的圖片說明標示（精確匹配）
                    const captionPatterns = [
                        // 中文圖片說明模式（更精確）
                        /^圖片來源[:：]/,
                        /^照片來源[:：]/,
                        /^資料來源[:：].*Getty/i,
                        /^資料來源[:：].*Shutterstock/i,
                        /^資料來源[:：].*Reuters/i,
                        /^攝影[:：]/
                    ];
                    
                    // 檢查是否有實質內容（除了來源標記之外）
                    let hasSubstantialContent = false;
                    captionPatterns.forEach(pattern => {
                        const match = textTrimmed.match(pattern);
                        if (match) {
                            const contentAfterSource = textTrimmed.replace(pattern, '').trim();
                            if (contentAfterSource.length > 30) {
                                hasSubstantialContent = true;
                                console.log(`Preserving caption with substantial content: "${text}"`);
                            }
                        }
                    });
                    
                    if (hasSubstantialContent) return false;
                    
                    // 完全匹配的純圖片來源（無實質內容）
                    const exactCaptionMatches = [
                        'Getty Images', 'Shutterstock', 'Reuters',
                        '路透社', '美聯社', 'AP Photo'
                    ];
                    
                    return captionPatterns.some(pattern => pattern.test(textTrimmed)) ||
                           exactCaptionMatches.includes(textTrimmed);
                }
                
                // 訂閱內容檢測函數（更保守的策略）
                function isSubscriptionContent(text) {
                    if (!text || text.length > 150) return false; // 只檢測短文本
                    
                    const textTrimmed = text.trim().toLowerCase();
                    
                    // 明確的訂閱標示（完全匹配或行首匹配）
                    const subscriptionPatterns = [
                        // 訂閱相關（行首匹配，避免誤刪正文）
                        /^立即訂閱/,
                        /^免費訂閱/,
                        /^訂閱電子報/,
                        /^加入會員/,
                        /^subscribe now/i,
                        /^join our newsletter/i,
                        /^sign up for free/i,
                        // Email域名（獨立出現）
                        /^gmail\.com$/,
                        /^hotmail\.com$/,
                        /^yahoo\.com$/,
                        // 謝謝訊息（完整句子）
                        /^謝謝訂閱/,
                        /^thank you for subscribing/i
                    ];
                    
                    // 完全匹配的訂閱用語
                    const exactSubscriptionMatches = [
                        '立即訂閱', '免費訂閱', '訂閱電子報', '加入會員',
                        'subscribe now', 'join newsletter', 'sign up',
                        '謝謝訂閱', 'thank you for subscribing'
                    ];
                    
                    return subscriptionPatterns.some(pattern => pattern.test(textTrimmed)) ||
                           exactSubscriptionMatches.includes(textTrimmed);
                }
                
                // 通用文字清理函數（保守策略）
                function universalTextCleaning(text) {
                    return text.trim()
                        .split('\n')
                        .map(line => line.trim())
                        .filter(line => {
                            // 只過濾太短的行（1個字符以下）
                            if (line.length < 2) return false;
                            
                            // 只在高確信度時才移除內容
                            // 廣告行檢測（只移除明確的廣告標示）
                            if (isAdvertisementContent(line, null)) {
                                console.log(`Removing ad line: "${line}"`);
                                return false;
                            }
                            
                            // 圖片說明行檢測（只移除明確的圖片來源）
                            if (isImageCaptionContent(line, null)) {
                                console.log(`Removing caption line: "${line}"`);
                                return false;
                            }
                            
                            // 訂閱行檢測（只移除明確的訂閱提示）
                            if (isSubscriptionContent(line)) {
                                console.log(`Removing subscription line: "${line}"`);
                                return false;
                            }
                            
                            return true;
                        })
                        .join('\n')
                        .replace(/\n{4,}/g, '\n\n\n')  // 最多保留3個連續換行
                        .replace(/[ \t]{3,}/g, '  ');  // 最多保留2個空格
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
                
                // 台灣新聞網站專門擷取策略
                function extractTaiwanNewsContent() {
                    console.log('🔍 Taiwan News content extraction started');
                    console.log('🌐 Current URL:', window.location.href);
                    
                    const url = window.location.href;
                    let selectors = [];
                    let metadata = '';
                    
                    // 針對不同台灣網站使用不同選擇器
                    if (url.includes('cw.com.tw')) {
                        // 天下雜誌
                        selectors = [
                            '.article-content',
                            '.article-body',
                            '.content-wrapper .content',
                            '.post-content',
                            'main .article-content p',
                            '[data-testid="article-content"]'
                        ];
                    } else if (url.includes('udn.com')) {
                        // 聯合報 - 加強廣告過濾版本
                        console.log('🎯 UDN extraction - using enhanced ad filtering');
                        selectors = [
                            // 主要內容選擇器 - 排除廣告區域
                            '.article-content:not([class*="ad"]):not([id*="ad"])',
                            '.article-body:not([class*="ad"]):not([id*="ad"])', 
                            '#story_body:not([class*="ad"]):not([id*="ad"])',
                            '.story-body:not([class*="ad"]):not([id*="ad"])',
                            '.article__content:not([class*="ad"]):not([id*="ad"])',
                            // 段落級選擇器 - 避免廣告段落
                            '.article-content p:not([class*="ad"]):not([id*="ad"])',
                            '.story_art_content p:not([class*="ad"]):not([id*="ad"])',
                            // 更保險的選擇器
                            'article p:not([class*="ad"]):not([id*="ad"])',
                            'main p:not([class*="ad"]):not([id*="ad"])'
                        ];
                    } else if (url.includes('pixnet.net')) {
                        // 痞客邦
                        selectors = [
                            '.article-content',
                            '.article-body',
                            '#article-content',
                            '.content-area',
                            '.entry-content',
                            '.post-content',
                            '.article-content-inner'
                        ];
                    } else if (url.includes('thenewslens.com')) {
                        // 關鍵評論網
                        selectors = [
                            '.article-content',
                            '.article-body',
                            '.post-content',
                            '.entry-content',
                            'main .article-content',
                            '[data-testid="article-content"]'
                        ];
                    } else if (url.includes('cna.com.tw')) {
                        // 中央社 - 2025年更新版選擇器（針對單篇文章）
                        console.log('🎯 CNA extraction - checking if this is a specific news article');
                        
                        if (url.includes('/news/')) {
                            console.log('✅ CNA specific news article detected, using precise selectors');
                            // 針對特定新聞文章頁面 - 使用非常精確的選擇器
                            selectors = [
                                // 最精確的組合選擇器，避免抓到其他文章
                                '.centralContent[data-article]:first-of-type',
                                '.centralContent article:first-of-type',
                                '.pageContent[data-article]:first-of-type', 
                                '.centralContent .pageContent:first-of-type',
                                // 如果有唯一ID的話
                                '#article-content',
                                '.article-main-content',
                                // 後備選擇器 - 只取第一個
                                '.centralContent:first-of-type',
                                '.pageContent:first-of-type'
                            ];
                        } else {
                            console.log('⚠️ CNA general page, using broader selectors');
                            // 一般頁面選擇器
                            selectors = [
                                '.centralContent',     // 主要內容容器
                                '.pageContent',        // 文章內容容器
                                'article',             // 標準文章標籤
                                'main',                // 主要內容區域
                                '[role="main"]'        // 語義化主要內容
                            ];
                        }
                    }
                    
                    // 通用台灣新聞選擇器
                    selectors = selectors.concat([
                        'article .content',
                        'main article p',
                        '.content-inner',
                        '.news-content',
                        '.article-inner p'
                    ]);
                    
                    let bestContent = '';
                    let usedSelector = '';
                    let allTexts = [];
                    
                    // 嘗試每個選擇器
                    for (let selector of selectors) {
                        try {
                            const elements = document.querySelectorAll(selector);
                            console.log(`Trying Taiwan news selector: ${selector}, found ${elements.length} elements`);
                            
                            if (elements.length > 0) {
                                let combinedText = '';
                                
                                // 如果選擇器包含 'p'，表示是段落選擇器
                                if (selector.includes('p')) {
                                    // 段落模式：保持段落結構
                                    const paragraphs = [];
                                    elements.forEach(el => {
                                        const text = el.innerText || el.textContent || '';
                                        if (text.trim() && text.trim().length > 10) {
                                            paragraphs.push(text.trim());
                                        }
                                    });
                                    combinedText = paragraphs.join('\n\n');
                                } else {
                                    // 容器模式：從容器中提取段落
                                    elements.forEach(container => {
                                        const paragraphs = container.querySelectorAll('p, div, span');
                                        const textParts = [];
                                        
                                        paragraphs.forEach(p => {
                                            const text = p.innerText || p.textContent || '';
                                            if (text.trim() && text.trim().length > 10) {
                                                // 檢查是否為合法段落（不是廣告或雜訊）
                                                if (!isAdvertisementContent(text.trim(), p) && 
                                                    !isImageCaptionContent(text.trim(), p) && 
                                                    !isSubscriptionContent(text.trim())) {
                                                    textParts.push(text.trim());
                                                }
                                            }
                                        });
                                        
                                        if (textParts.length > 0) {
                                            combinedText += textParts.join('\n\n') + '\n\n';
                                        }
                                    });
                                }
                                
                                // 清理內容但保持段落結構
                                const cleanedText = combinedText
                                    .trim()
                                    .replace(/\n{4,}/g, '\n\n\n')  // 最多3個連續換行
                                    .replace(/[ \t]{3,}/g, '  ');  // 最多2個空格
                                
                                console.log(`Taiwan news extraction from ${selector}: ${cleanedText.length} characters`);
                                
                                if (cleanedText.length > 200) {  // 降低門檻以捕獲更多內容
                                    allTexts.push({
                                        text: cleanedText,
                                        length: cleanedText.length,
                                        selector: selector
                                    });
                                    
                                    if (cleanedText.length > bestContent.length) {
                                        bestContent = cleanedText;
                                        usedSelector = selector;
                                    }
                                }
                            }
                        } catch (e) {
                            console.log(`Error with Taiwan news selector ${selector}:`, e);
                        }
                    }
                    
                    console.log(`Taiwan news extraction result: ${bestContent.length} characters using ${usedSelector}`);
                    return {
                        content: bestContent,
                        selector: usedSelector,
                        debug: allTexts.slice(0, 3)
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

