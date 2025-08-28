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
  const [pdfExporter, setPdfExporter] = useState(null);
  const [pageUrl, setPageUrl] = useState('');
  const [pageTitle, setPageTitle] = useState('');
  const [canRetry, setCanRetry] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [textProcessor, setTextProcessor] = useState(null);
  const [textStats, setTextStats] = useState(null);
  const [cleaningPreset, setCleaningPreset] = useState('standard');

  useEffect(() => {
    loadSettings();
    initializePDFExporter();
    initializeTextProcessor();
    
    // Auto-trigger content extraction when popup opens
    triggerContentExtraction();
    
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

  const triggerContentExtraction = async () => {
    try {
      setStatus('loading');
      setStatusMessage('開始擷取內容...');
      
      // Get current active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab) {
        // Send message to content script
        chrome.tabs.sendMessage(tab.id, {
          type: 'EXTRACT_CONTENT'
        }).catch(async (error) => {
          console.error('Content script not ready, injecting...', error);
          
          // Inject content scripts if not loaded
          try {
            await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: ['lib/readability.js', 'lib/smart-extractor.js', 'content-script.js']
            });
            
            // Wait a bit then retry
            setTimeout(() => {
              chrome.tabs.sendMessage(tab.id, {
                type: 'EXTRACT_CONTENT'
              });
            }, 500);
          } catch (injectError) {
            console.error('Failed to inject content script:', injectError);
            setStatus('error');
            setStatusMessage('無法載入內容擷取腳本，請重新整理頁面後再試');
          }
        });
      }
    } catch (error) {
      console.error('Failed to trigger extraction:', error);
      setStatus('error');
      setStatusMessage('無法開始內容擷取，請檢查權限設定');
    }
  };

  const initializePDFExporter = async () => {
    try {
      if (window.PDFExporter) {
        const exporter = new window.PDFExporter();
        setPdfExporter(exporter);
      }
    } catch (error) {
      console.error('Failed to initialize PDF exporter:', error);
    }
  };

  const initializeTextProcessor = async () => {
    try {
      if (window.TextProcessor) {
        const processor = new window.TextProcessor();
        setTextProcessor(processor);
        console.log('TextProcessor initialized');
      }
    } catch (error) {
      console.error('Failed to initialize TextProcessor:', error);
    }
  };

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
      setPageUrl(data.url || '');
      setPageTitle(data.title || '');
      
      if (data.fallback) {
        setStatus('warning');
        setStatusMessage(data.message || `備援模式：已擷取 ${data.text.length} 個字符`);
        setCanRetry(true);
      } else {
        setStatus('success');
        setStatusMessage(`已擷取 ${data.text.length} 個字符的內容`);
        setCanRetry(false);
      }
    } else {
      setStatus('error');
      setStatusMessage('內容擷取失敗，請重試或手動複製文字');
      setCanRetry(true);
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

  const handleExportPDF = async () => {
    if (!editedText.trim()) {
      setStatus('error');
      setStatusMessage('沒有內容可以匯出為PDF');
      return;
    }

    if (!pdfExporter) {
      setStatus('error');
      setStatusMessage('PDF 匯出功能尚未載入');
      return;
    }

    setIsProcessing(true);
    setStatus('loading');
    setStatusMessage('正在產生PDF...');

    try {
      const options = {
        title: pageTitle || '擷取內容',
        url: pageUrl,
        fontSize: 12,
        lineHeight: 1.6
      };

      const result = await pdfExporter.downloadPDF(editedText, null, options);
      
      setStatus('success');
      setStatusMessage(`PDF已產生：${result.pages} 頁`);
    } catch (error) {
      console.error('PDF export failed:', error);
      setStatus('error');
      setStatusMessage(`PDF匯出失敗: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportEnhancedPDF = async () => {
    if (!editedText.trim()) {
      setStatus('error');
      setStatusMessage('沒有內容可以匯出為圖文PDF');
      return;
    }

    if (!pdfExporter) {
      setStatus('error');
      setStatusMessage('PDF 匯出功能尚未載入');
      return;
    }

    setIsProcessing(true);
    setStatus('loading');
    setStatusMessage('正在檢查剪貼簿圖片並產生PDF...');

    try {
      const options = {
        title: pageTitle || textProcessor?.extractTitle(editedText) || '文字內容',
        url: pageUrl,
        fontSize: 12,
        lineHeight: 1.6,
        includeImages: true
      };

      // Try to get clipboard images
      const result = await pdfExporter.generatePDFWithClipboardImages(editedText, options);
      
      // Generate filename with timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
      const filename = `cleanclip-enhanced-${timestamp}.pdf`;
      
      // Download the PDF
      result.save(filename);
      
      setStatus('success');
      setStatusMessage(`圖文PDF已產生：${result.getNumberOfPages()} 頁`);
    } catch (error) {
      console.error('Enhanced PDF export failed:', error);
      setStatus('error');
      setStatusMessage(`圖文PDF匯出失敗: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRetryExtraction = () => {
    setStatus('loading');
    setStatusMessage('重新嘗試擷取內容...');
    setCanRetry(false);
    
    triggerContentExtraction();
  };

  const handleManualTextChange = (e) => {
    const text = e.target.value;
    setEditedText(text);
    
    // 更新文字統計
    if (textProcessor && text.trim()) {
      const stats = textProcessor.analyzeText(text);
      setTextStats(stats);
    } else {
      setTextStats(null);
    }
  };

  const handleCleanText = () => {
    if (!textProcessor || !editedText.trim()) return;
    
    setIsProcessing(true);
    setStatus('loading');
    setStatusMessage('正在清理文字...');
    
    try {
      const presets = textProcessor.getCleaningPresets();
      const options = presets[cleaningPreset].options;
      
      let cleanedText = textProcessor.fixCopyPasteIssues(editedText);
      cleanedText = textProcessor.cleanText(cleanedText, options);
      cleanedText = textProcessor.removeDuplicateParagraphs(cleanedText);
      
      if (options.smartParagraphSplit) {
        cleanedText = textProcessor.smartParagraphSplit(cleanedText);
      }
      
      setEditedText(cleanedText);
      const stats = textProcessor.analyzeText(cleanedText);
      setTextStats(stats);
      
      setStatus('success');
      setStatusMessage(`文字已清理完成 - ${stats.characters} 個字符`);
    } catch (error) {
      console.error('Text cleaning failed:', error);
      setStatus('error');
      setStatusMessage('文字清理失敗');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleManualMode = () => {
    const newManualMode = !manualMode;
    setManualMode(newManualMode);
    
    if (newManualMode) {
      setStatus('success');
      setStatusMessage('手動模式：請貼上要處理的文字');
      setPageTitle('手動輸入');
      setPageUrl('');
      setEditedText('');
      setTextStats(null);
    } else {
      setStatus('waiting');
      setStatusMessage('點擊外掛圖示開始擷取內容');
      setPageTitle('');
      setPageUrl('');
      setEditedText('');
      setTextStats(null);
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
        
        <div className="mode-toggle" style={{marginBottom: '12px'}}>
          <button
            className={`btn ${manualMode ? 'btn-primary' : 'btn-secondary'}`}
            onClick={handleToggleManualMode}
            style={{width: '100%', padding: '6px 12px'}}
          >
            {manualMode ? '📝 手動模式' : '🤖 自動模式'}
          </button>
        </div>

        {!manualMode && (
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
        )}

        {manualMode && textProcessor && (
          <div className="text-processing-config">
            <div className="input-group">
              <label className="label">清理模式</label>
              <select
                className="select"
                value={cleaningPreset}
                onChange={(e) => setCleaningPreset(e.target.value)}
              >
                {Object.entries(textProcessor.getCleaningPresets()).map(([key, preset]) => (
                  <option key={key} value={key}>
                    {preset.name}
                  </option>
                ))}
              </select>
            </div>
            
            <button
              className="btn btn-secondary"
              onClick={handleCleanText}
              disabled={!editedText.trim() || isProcessing}
              style={{width: '100%', marginTop: '8px'}}
            >
              {isProcessing ? '清理中...' : '🧹 清理文字'}
            </button>
          </div>
        )}
      </div>

      <div className="content-area">
        <div className={getStatusClass()}>
          {isProcessing && <div className="loading-spinner"></div>}
          {statusMessage}
          {canRetry && !isProcessing && (
            <button
              className="btn btn-secondary"
              onClick={handleRetryExtraction}
              style={{
                marginLeft: '8px',
                padding: '4px 8px',
                fontSize: '12px',
                minWidth: 'auto'
              }}
            >
              🔄 重試
            </button>
          )}
        </div>

        <div className="text-preview">
          <label>
            {manualMode ? '文字內容（支援貼上）' : '擷取的文字內容'}
            {editedText && textStats && (
              <span className="word-count">
                ({textStats.characters} 字符, {textStats.words} 字, {textStats.paragraphs} 段, 
                 約 {textStats.readingTime} 分鐘閱讀)
              </span>
            )}
            {editedText && !textStats && (
              <span className="word-count">({editedText.length} 字符)</span>
            )}
          </label>
          <textarea
            className="textarea"
            value={editedText}
            onChange={manualMode ? handleManualTextChange : (e) => setEditedText(e.target.value)}
            placeholder={manualMode 
              ? "請貼上要處理的文字內容...\n\n💡 支援複製貼上\n🧹 可使用清理功能去除干擾文字\n📊 提供詳細文字統計\n📄 支援多種格式匯出" 
              : "文字內容將顯示在這裡，您可以編輯刪除不需要的部分..."
            }
            rows={manualMode ? "12" : "8"}
          />
          
          {manualMode && textStats && (
            <div className="text-stats" style={{
              marginTop: '8px',
              padding: '8px 12px',
              background: '#f8fafc',
              borderRadius: '4px',
              fontSize: '12px',
              color: '#64748b'
            }}>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px'}}>
                <div>語言: {textStats.language}</div>
                <div>段落: {textStats.paragraphs}</div>
                <div>句子: {textStats.sentences}</div>
                <div>閱讀: {textStats.readingTime}分鐘</div>
              </div>
            </div>
          )}
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

        <div className="actions" style={{marginTop: '8px'}}>
          <button
            className="btn btn-success"
            onClick={handleExportPDF}
            disabled={!editedText.trim() || isProcessing}
            style={{flex: 1, marginRight: '4px'}}
          >
            {isProcessing ? (
              <>
                <div className="loading-spinner"></div>
                PDF產生中...
              </>
            ) : (
              '📄 文字PDF'
            )}
          </button>
          
          <button
            className="btn btn-primary"
            onClick={handleExportEnhancedPDF}
            disabled={!editedText.trim() || isProcessing}
            style={{flex: 1, marginLeft: '4px'}}
          >
            {isProcessing ? (
              <>
                <div className="loading-spinner"></div>
                處理中...
              </>
            ) : (
              '🖼️ 圖文PDF'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

ReactDOM.render(<CleanClipSidebar />, document.getElementById('root'));