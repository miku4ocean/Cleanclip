// CleanClip External JavaScript - CSP Compliant Version
console.log('🚀 CleanClip External Script Loading...');

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
    
    // 獲取所有元素
    const testJSBtn = document.getElementById('testJSBtn');
    const testAlertBtn = document.getElementById('testAlertBtn');
    const testConsoleBtn = document.getElementById('testConsoleBtn');
    const testDOMBtn = document.getElementById('testDOMBtn');
    const clearBtn = document.getElementById('clearBtn');
    const extractBtn = document.getElementById('extractBtn');
    const saveBtn = document.getElementById('saveBtn');
    
    const outputDiv = document.getElementById('output');
    const textarea = document.getElementById('textarea');
    
    console.log('🎯 Elements found:', {
        testJSBtn: !!testJSBtn,
        testAlertBtn: !!testAlertBtn,
        testConsoleBtn: !!testConsoleBtn,
        testDOMBtn: !!testDOMBtn,
        clearBtn: !!clearBtn,
        extractBtn: !!extractBtn,
        saveBtn: !!saveBtn,
        outputDiv: !!outputDiv,
        textarea: !!textarea
    });
    
    // 設置事件監聽器
    if (testJSBtn) {
        testJSBtn.addEventListener('click', function() {
            console.log('🧪 Test JS button clicked!');
            testJS();
        });
    }
    
    if (testAlertBtn) {
        testAlertBtn.addEventListener('click', function() {
            console.log('🔔 Test Alert button clicked!');
            testAlert();
        });
    }
    
    if (testConsoleBtn) {
        testConsoleBtn.addEventListener('click', function() {
            console.log('📝 Test Console button clicked!');
            testConsole();
        });
    }
    
    if (testDOMBtn) {
        testDOMBtn.addEventListener('click', function() {
            console.log('🎯 Test DOM button clicked!');
            testDOM();
        });
    }
    
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
        outputDiv.innerHTML = '🟢 CleanClip 外部腳本載入完成！<br>所有事件監聽器已設置，請測試按鈕功能。';
    }
    
    console.log('✅ CleanClip initialization completed');
    
    // Chrome 環境檢查
    setTimeout(checkChromeEnvironment, 1000);
}

function testJS() {
    console.log('🧪 JavaScript test function called');
    const outputDiv = document.getElementById('output');
    const textarea = document.getElementById('textarea');
    
    if (outputDiv) {
        outputDiv.innerHTML = '✅ JavaScript 完全正常！<br>' +
            '⏰ 時間：' + new Date().toLocaleString() + '<br>' +
            '🎉 外部腳本事件處理成功！';
    }
    
    if (textarea) {
        textarea.value = 'JavaScript 測試成功！\n\n' +
            '✅ 外部腳本載入正常\n' +
            '✅ 事件監聽器工作正常\n' +
            '✅ DOM 操作功能正常\n\n' +
            '時間：' + new Date().toLocaleString();
    }
}

function testAlert() {
    console.log('🔔 Alert test function called');
    try {
        alert('🎉 Alert 功能正常！\n\n這個彈窗證明 JavaScript 事件處理完全正常。\n\n外部腳本載入成功！');
        
        const outputDiv = document.getElementById('output');
        if (outputDiv) {
            outputDiv.innerHTML += '<br>✅ Alert 測試完成 - 彈窗顯示正常';
        }
    } catch (error) {
        console.error('Alert error:', error);
    }
}

function testConsole() {
    console.log('🔥 Console 測試成功！外部腳本的 console.log 正常運作。');
    console.warn('⚠️ 這是一個警告訊息測試（外部腳本）');
    console.error('❌ 這是一個錯誤訊息測試（外部腳本，非真實錯誤）');
    
    const outputDiv = document.getElementById('output');
    if (outputDiv) {
        outputDiv.innerHTML += '<br>✅ Console 訊息已輸出，請檢查開發者工具的 Console 標籤';
    }
}

function testDOM() {
    console.log('🎯 DOM test function called');
    const outputDiv = document.getElementById('output');
    const textarea = document.getElementById('textarea');
    
    if (outputDiv) {
        outputDiv.innerHTML += '<br>🎯 DOM 操作測試結果：';
        outputDiv.innerHTML += '<br>- 找到 output 元素：' + (outputDiv ? '✅' : '❌');
        outputDiv.innerHTML += '<br>- 找到 textarea 元素：' + (textarea ? '✅' : '❌');
        outputDiv.innerHTML += '<br>- 當前時間：' + new Date().toLocaleTimeString();
        outputDiv.innerHTML += '<br>- 外部腳本 DOM 操作：✅ 成功';
    }
    
    if (textarea) {
        textarea.value += '\n\nDOM 操作測試完成！\n' +
            '所有元素都能正常存取和修改。\n' +
            '外部腳本運作完全正常。';
    }
}

function clearAll() {
    console.log('🗑️ Clear function called');
    const outputDiv = document.getElementById('output');
    const textarea = document.getElementById('textarea');
    
    if (outputDiv) {
        outputDiv.innerHTML = '🗑️ 結果已清空，等待新的測試...';
    }
    
    if (textarea) {
        textarea.value = '';
    }
}

function extractContent() {
    console.log('📄 Extract content function called');
    const outputDiv = document.getElementById('output');
    const textarea = document.getElementById('textarea');
    
    if (outputDiv) {
        outputDiv.innerHTML = '⏳ 正在擷取內容...';
    }
    
    // 檢查 Chrome API
    if (typeof chrome === 'undefined') {
        if (outputDiv) {
            outputDiv.innerHTML = '❌ Chrome API 不可用';
        }
        return;
    }
    
    console.log('✅ Chrome API available, starting content extraction...');
    
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (chrome.runtime.lastError) {
            console.error('Tab query error:', chrome.runtime.lastError);
            if (outputDiv) {
                outputDiv.innerHTML = '❌ 權限錯誤：' + chrome.runtime.lastError.message;
            }
            return;
        }
        
        if (!tabs || !tabs[0]) {
            if (outputDiv) {
                outputDiv.innerHTML = '❌ 找不到活動分頁';
            }
            return;
        }
        
        const tab = tabs[0];
        console.log('📄 Found active tab:', tab.url);
        
        if (tab.url.startsWith('chrome://')) {
            if (outputDiv) {
                outputDiv.innerHTML = '❌ 無法在 Chrome 內建頁面擷取內容';
            }
            return;
        }
        
        chrome.scripting.executeScript({
            target: {tabId: tab.id},
            function: function() {
                const title = document.title || '未知標題';
                const content = document.body.innerText || document.body.textContent || '';
                
                return {
                    title: title,
                    content: content.substring(0, 2000),
                    length: content.length,
                    url: window.location.href
                };
            }
        }).then(function(results) {
            if (results && results[0] && results[0].result) {
                const data = results[0].result;
                console.log('✅ Content extracted:', data);
                
                if (outputDiv) {
                    outputDiv.innerHTML = `✅ 內容擷取成功！<br>長度：${data.length} 字符`;
                }
                
                if (textarea) {
                    textarea.value = `標題：${data.title}\n` +
                        `網址：${data.url}\n` +
                        `長度：${data.length} 字符\n\n` +
                        `--- 內容 ---\n${data.content}`;
                }
            } else {
                console.error('No extraction result');
                if (outputDiv) {
                    outputDiv.innerHTML = '❌ 擷取失敗：無結果';
                }
            }
        }).catch(function(error) {
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

function checkChromeEnvironment() {
    console.log('🔍 Chrome 擴充功能環境檢查：');
    console.log('- chrome 物件：', typeof chrome !== 'undefined' ? '✅ 可用' : '❌ 不可用');
    console.log('- chrome.tabs：', typeof chrome !== 'undefined' && chrome.tabs ? '✅ 可用' : '❌ 不可用');
    console.log('- chrome.scripting：', typeof chrome !== 'undefined' && chrome.scripting ? '✅ 可用' : '❌ 不可用');
    console.log('- 當前網址：', window.location.href);
}