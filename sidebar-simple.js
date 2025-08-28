console.log('Sidebar script starting...');

// Check if React is available
if (typeof React === 'undefined') {
  console.error('React not loaded');
  document.getElementById('root').innerHTML = `
    <div class="sidebar-container">
      <div class="header">
        <div class="logo">CleanClip</div>
        <div style="margin-top: 10px; padding: 8px; background: #fee2e2; color: #dc2626; border-radius: 4px; font-size: 14px;">
          React 載入失敗
        </div>
      </div>
    </div>
  `;
} else {
  console.log('React is available, creating app...');
  
  const { useState, useEffect, createElement: e } = React;
  
  // Simple CleanClip App without JSX
  function CleanClipApp() {
    const [status, setStatus] = useState('loading');
    const [statusMessage, setStatusMessage] = useState('正在載入...');
    const [extractedText, setExtractedText] = useState('');
    const [editedText, setEditedText] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [selectedModel, setSelectedModel] = useState('gpt-3.5-turbo');
    
    useEffect(() => {
      console.log('CleanClip app mounted');
      setStatus('success');
      setStatusMessage('CleanClip 已載入，點擊開始擷取內容');
      
      // Try to trigger content extraction
      setTimeout(() => {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
          if (tabs[0]) {
            chrome.tabs.sendMessage(tabs[0].id, {
              type: 'EXTRACT_CONTENT'
            }).catch(error => {
              console.error('Failed to send message:', error);
              setStatus('warning');
              setStatusMessage('請重新整理頁面後再試');
            });
          }
        });
      }, 1000);
      
      // Listen for content messages
      const messageListener = (message) => {
        if (message.type === 'CONTENT_READY') {
          console.log('Content received:', message.data);
          if (message.data && message.data.text) {
            setExtractedText(message.data.text);
            setEditedText(message.data.text);
            setStatus('success');
            setStatusMessage(`已擷取 ${message.data.text.length} 個字符的內容`);
          }
        }
      };
      
      chrome.runtime.onMessage.addListener(messageListener);
      
      return () => {
        chrome.runtime.onMessage.removeListener(messageListener);
      };
    }, []);
    
    const handleRetry = () => {
      setStatus('loading');
      setStatusMessage('重新擷取中...');
      
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'EXTRACT_CONTENT'
          });
        }
      });
    };
    
    const handleSaveText = () => {
      if (!editedText.trim()) {
        alert('沒有內容可以儲存');
        return;
      }
      
      const blob = new Blob([editedText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cleanclip-${new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    };
    
    // Create UI elements without JSX
    return e('div', {className: 'sidebar-container'},
      e('div', {className: 'header'},
        e('div', {className: 'logo'}, 'CleanClip'),
        e('div', {className: 'api-config'},
          e('input', {
            type: 'password',
            placeholder: '輸入 OpenAI API 金鑰',
            value: apiKey,
            onChange: (e) => setApiKey(e.target.value),
            style: {
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px'
            }
          }),
          e('select', {
            value: selectedModel,
            onChange: (e) => setSelectedModel(e.target.value),
            style: {
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '4px',
              fontSize: '14px',
              marginTop: '8px'
            }
          },
            e('option', {value: 'gpt-3.5-turbo'}, 'GPT-3.5 Turbo (便宜)'),
            e('option', {value: 'gpt-4o-mini'}, 'GPT-4o Mini (平衡)'),
            e('option', {value: 'gpt-4'}, 'GPT-4 (高品質)')
          )
        )
      ),
      e('div', {className: 'content-area'},
        e('div', {
          className: `status ${status}`,
          style: {
            padding: '8px 12px',
            marginBottom: '12px',
            borderRadius: '6px',
            fontSize: '14px',
            textAlign: 'center',
            backgroundColor: status === 'loading' ? '#dbeafe' : status === 'success' ? '#d1fae5' : '#fef3c7',
            color: status === 'loading' ? '#1d4ed8' : status === 'success' ? '#059669' : '#d97706'
          }
        }, statusMessage),
        e('div', {className: 'text-preview'},
          e('label', {style: {fontSize: '14px', fontWeight: '500', marginBottom: '8px', color: '#374151'}}, '擷取的內容'),
          e('textarea', {
            className: 'textarea',
            value: editedText,
            onChange: (e) => setEditedText(e.target.value),
            placeholder: '擷取的內容將顯示在這裡...',
            style: {
              width: '100%',
              minHeight: '300px',
              padding: '12px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontFamily: 'Monaco, Menlo, monospace',
              fontSize: '13px',
              resize: 'vertical'
            }
          })
        ),
        e('div', {className: 'actions', style: {display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '16px'}},
          e('button', {
            onClick: handleRetry,
            style: {
              padding: '8px 16px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }
          }, '重新擷取'),
          e('button', {
            onClick: handleSaveText,
            style: {
              padding: '8px 16px',
              background: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px'
            }
          }, '儲存文字')
        )
      )
    );
  }
  
  // Mount the app
  try {
    console.log('Mounting CleanClip app...');
    const root = ReactDOM.createRoot(document.getElementById('root'));
    root.render(e(CleanClipApp));
    console.log('CleanClip app mounted successfully');
  } catch (error) {
    console.error('Failed to mount app:', error);
    document.getElementById('root').innerHTML = `
      <div class="sidebar-container">
        <div class="header">
          <div class="logo">CleanClip</div>
          <div style="margin-top: 10px; padding: 8px; background: #fee2e2; color: #dc2626; border-radius: 4px; font-size: 14px;">
            應用載入失敗: ${error.message}
          </div>
        </div>
      </div>
    `;
  }
}