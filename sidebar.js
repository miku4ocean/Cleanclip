const { useState, useEffect } = React;

const API_MODELS = [
  { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo (便宜)', cost: '$0.001/1K tokens' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini (平衡)', cost: '$0.00015/1K tokens' },
  { value: 'gpt-4', label: 'GPT-4 (高品質)', cost: '$0.03/1K tokens' }
];

function CleanClipSidebar() {
  const [extractedText, setExtractedText] = useState('');
  const [editedText, setEditedText] = useState('');
  const [status, setStatus] = useState('waiting');
  const [statusMessage, setStatusMessage] = useState('點擊外掛圖示開始擷取內容');
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('gpt-3.5-turbo');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    loadSettings();
    
    const messageListener = (message) => {
      if (message.type === 'CONTENT_READY') {
        handleContentExtracted(message.data);
      }
    };
    
    chrome.runtime.onMessage.addListener(messageListener);
    
    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  const loadSettings = async () => {
    try {
      const result = await chrome.storage.local.get(['apiKey', 'selectedModel']);
      if (result.apiKey) setApiKey(result.apiKey);
      if (result.selectedModel) setSelectedModel(result.selectedModel);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      await chrome.storage.local.set({
        apiKey: apiKey,
        selectedModel: selectedModel
      });
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  };

  const handleContentExtracted = (data) => {
    if (data && data.text) {
      setExtractedText(data.text);
      setEditedText(data.text);
      setStatus('success');
      setStatusMessage(`已擷取 ${data.text.length} 個字符的內容`);
    } else {
      setStatus('error');
      setStatusMessage('內容擷取失敗，請重試');
    }
  };

  const handleApiKeyChange = (e) => {
    setApiKey(e.target.value);
    saveSettings();
  };

  const handleModelChange = (e) => {
    setSelectedModel(e.target.value);
    saveSettings();
  };

  const downloadText = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSaveFullText = () => {
    if (!editedText.trim()) {
      setStatus('error');
      setStatusMessage('沒有內容可以儲存');
      return;
    }
    
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    const filename = `cleanclip-full-${timestamp}.txt`;
    downloadText(editedText, filename);
    
    setStatus('success');
    setStatusMessage('全文已儲存');
  };

  const handleSummaryText = async () => {
    if (!apiKey.trim()) {
      setStatus('error');
      setStatusMessage('請先設定 OpenAI API 金鑰');
      return;
    }
    
    if (!editedText.trim()) {
      setStatus('error');
      setStatusMessage('沒有內容可以摘要');
      return;
    }

    setIsProcessing(true);
    setStatus('loading');
    setStatusMessage('正在產生摘要...');

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: [
            {
              role: 'user',
              content: `請用繁體中文摘要以下文章，控制在 300 字以內，保留重點資訊：\n\n${editedText}`
            }
          ],
          max_tokens: 1000,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || '摘要產生失敗');
      }

      const data = await response.json();
      const summary = data.choices[0]?.message?.content?.trim();
      
      if (summary) {
        const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
        const filename = `cleanclip-summary-${timestamp}.txt`;
        downloadText(summary, filename);
        
        setStatus('success');
        setStatusMessage('摘要已產生並儲存');
      } else {
        throw new Error('無法產生摘要內容');
      }
    } catch (error) {
      console.error('Summary generation failed:', error);
      setStatus('error');
      setStatusMessage(`摘要失敗: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusClass = () => {
    switch (status) {
      case 'loading': return 'status loading';
      case 'error': return 'status error';
      case 'success': return 'status success';
      default: return 'status';
    }
  };

  const selectedModelInfo = API_MODELS.find(m => m.value === selectedModel);

  return (
    <div className="sidebar-container">
      <div className="header">
        <div className="logo">CleanClip</div>
        
        <div className="api-config">
          <div className="input-group">
            <label className="label">OpenAI API 金鑰</label>
            <input
              type="password"
              className="input"
              placeholder="sk-..."
              value={apiKey}
              onChange={handleApiKeyChange}
            />
          </div>
          
          <div className="config-row">
            <div className="input-group">
              <label className="label">AI 模型</label>
              <select
                className="select"
                value={selectedModel}
                onChange={handleModelChange}
              >
                {API_MODELS.map(model => (
                  <option key={model.value} value={model.value}>
                    {model.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          {selectedModelInfo && (
            <div style={{fontSize: '11px', color: '#64748b', textAlign: 'center'}}>
              費用: {selectedModelInfo.cost}
            </div>
          )}
        </div>
      </div>

      <div className="content-area">
        <div className={getStatusClass()}>
          {isProcessing && <div className="loading-spinner"></div>}
          {statusMessage}
        </div>

        <div className="text-preview">
          <label>
            擷取的文字內容 
            {editedText && (
              <span className="word-count">({editedText.length} 字符)</span>
            )}
          </label>
          <textarea
            className="textarea"
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            placeholder="文字內容將顯示在這裡，您可以編輯刪除不需要的部分..."
          />
        </div>

        <div className="actions">
          <button
            className="btn btn-secondary"
            onClick={handleSaveFullText}
            disabled={!editedText.trim()}
          >
            儲存全文
          </button>
          
          <button
            className="btn btn-primary"
            onClick={handleSummaryText}
            disabled={!editedText.trim() || !apiKey.trim() || isProcessing}
          >
            {isProcessing ? (
              <>
                <div className="loading-spinner"></div>
                摘要中...
              </>
            ) : (
              '摘要文章'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

ReactDOM.render(<CleanClipSidebar />, document.getElementById('root'));