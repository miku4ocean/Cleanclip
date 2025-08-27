# CleanClip - 智慧網頁文字擷取工具

<div align="center">

![CleanClip Logo](icons/icon128.png)

**一個強大的 Chrome 擴充功能，用於擷取純淨網頁內容、智慧文字處理和 AI 摘要生成**

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-blue?style=flat-square&logo=google-chrome)](https://github.com/yourusername/cleanclip)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](https://opensource.org/licenses/MIT)
[![Version](https://img.shields.io/badge/Version-1.0.0-green?style=flat-square)](#)

</div>

## ✨ 功能特色

### 🚀 核心功能
- **🎯 智慧內容擷取**: 5層式策略擷取系統，突破反爬蟲限制
- **🛡️ 反爬蟲繞過**: 自動處理動態載入、付費牆、懶加載內容
- **📱 社交媒體支援**: 專門處理 Facebook、Twitter、Instagram、LinkedIn
- **📝 手動文字模式**: 支援複製貼上任意文字進行智慧處理
- **🧹 3級文字清理**: 輕度/標準/深度清理，去除網頁干擾和格式問題

### 📊 高級功能
- **📈 文字分析統計**: 字數、段落數、語言檢測、閱讀時間等詳細分析
- **💾 多格式匯出**: TXT、標準PDF、圖文PDF 三種格式選擇
- **🖼️ 圖文並茂PDF**: 自動從剪貼簿獲取圖片生成專業PDF文檔
- **🤖 AI 智慧摘要**: 整合 OpenAI GPT API，支援多種模型選擇
- **🔄 智慧重試機制**: 擷取失敗時提供一鍵重試功能

### 🔐 安全與控制
- **🔐 用戶自管API金鑰**: 安全的本地儲存，不寫死在程式中
- **💰 成本控制**: 提供便宜模型選項，顯示詳細費用資訊
- **🛠️ 靈活配置**: 可自訂清理規則、PDF格式、AI模型選擇

## 🎬 示範影片

| 自動擷取模式 | 手動處理模式 | AI摘要功能 |
|:---:|:---:|:---:|
| ![自動模式](https://via.placeholder.com/200x150/007ACC/ffffff?text=Auto+Mode) | ![手動模式](https://via.placeholder.com/200x150/28A745/ffffff?text=Manual+Mode) | ![AI摘要](https://via.placeholder.com/200x150/FFC107/000000?text=AI+Summary) |

## 📦 安裝指南

### 方法一：開發者模式安裝（推薦）

1. **下載項目**
   ```bash
   git clone https://github.com/yourusername/cleanclip.git
   cd cleanclip
   ```

2. **安裝到 Chrome**
   - 開啟 Chrome 瀏覽器
   - 前往 `chrome://extensions/`
   - 開啟右上角的「開發人員模式」
   - 點擊「載入未封裝項目」
   - 選擇 `cleanclip` 資料夾
   - ✅ 安裝完成！

### 方法二：從 GitHub Releases 下載
> 🚧 Chrome Web Store 版本準備中...

## 🚀 快速開始

### 🤖 自動模式（網頁擷取）
1. 瀏覽任何網頁（新聞、部落格、技術文檔等）
2. 點擊工具列上的 **CleanClip** 圖示  
3. 側邊欄會自動開啟並開始智慧擷取內容
4. 編輯文字內容（刪除不需要的部分）
5. 選擇匯出格式或生成 AI 摘要

### 📝 手動模式（文字處理）
1. 點擊 CleanClip 圖示開啟側邊欄
2. 點擊「**手動模式**」按鈕切換
3. 複製貼上任意文字到文字框
4. 選擇清理模式：
   - **輕度清理**: 僅移除明顯干擾內容
   - **標準清理**: 平衡的清理模式（推薦）
   - **深度清理**: 最大程度清理和智慧分段
5. 點擊「清理文字」處理內容
6. 匯出為 TXT、PDF 或圖文PDF

### 🖼️ 圖文PDF製作
1. 複製圖片到系統剪貼簿
2. 在 CleanClip 中輸入或擷取文字內容
3. 點擊「**圖文PDF**」按鈕
4. 自動生成包含圖片的專業PDF文檔

## ⚙️ API 設定

### 🔑 OpenAI API 金鑰設定
1. 前往 [OpenAI API Keys](https://platform.openai.com/account/api-keys)
2. 建立新的 API 金鑰
3. 在 CleanClip 側邊欄頂部的輸入框中貼上金鑰
4. 金鑰會安全地儲存在本地瀏覽器中

### 🧠 AI 模型選擇
| 模型 | 適用場景 | 費用 |
|:---:|:---:|:---:|
| **GPT-3.5 Turbo** | 日常使用，預算優先 | $0.001/1K tokens |
| **GPT-4o Mini** | 品質與成本平衡（推薦） | $0.00015/1K tokens |
| **GPT-4** | 最高品質，專業用途 | $0.03/1K tokens |

## 🏗️ 技術架構

```
cleanclip/
├── 📄 manifest.json          # Chrome 擴充功能配置
├── 🔧 background.js          # 服務工作腳本
├── 🎨 sidebar.html/css/js    # React 使用者界面
├── 📝 content-script.js      # 內容擷取腳本
├── 📚 lib/                   # 核心程式庫
│   ├── 🧠 smart-extractor.js    # 5層智慧擷取引擎
│   ├── 🛡️ anti-crawl-bypass.js  # 反爬蟲繞過機制
│   ├── 🧹 text-processor.js     # 文字清理和分析引擎
│   ├── 📄 pdf-export.js         # PDF 匯出功能（含圖文）
│   └── 📖 readability.js        # 基礎文字擷取算法
└── 🎨 icons/                # 擴充功能圖示
```

### 🔧 核心技術棧
- **前端框架**: React.js + Babel (CDN)
- **樣式系統**: 純 CSS with 現代設計
- **內容擷取**: Mozilla Readability + 自研智慧算法
- **PDF生成**: jsPDF 專業排版
- **AI整合**: OpenAI GPT API
- **儲存**: Chrome Storage API

## 📋 支援網站

### ✅ 完全支援
- 📰 **新聞網站**: 聯合新聞網、中央社、BBC、CNN
- 📝 **部落格平台**: Medium、WordPress、Ghost
- 💼 **商業媒體**: 天下雜誌、商業週刊、數位時代
- 🔬 **技術文檔**: GitHub、Stack Overflow、MDN

### 🔶 部分支援（需登入或手動模式）
- 📱 **社交平台**: Facebook、Twitter、Instagram、LinkedIn
- 💰 **付費內容**: 華爾街日報、金融時報、NYT
- 🔒 **會員制網站**: 各種需要登入的專業網站

## 🧪 測試指南

### 基本功能測試
```bash
# 測試網址範例
https://udn.com/news/story/     # 新聞網站測試
https://medium.com/@author/     # 部落格測試  
https://github.com/project/     # 技術文檔測試
```

### 測試檢查清單
- [ ] 外掛安裝成功，圖示顯示正常
- [ ] 點擊圖示開啟側邊欄
- [ ] 自動擷取內容並顯示統計資訊
- [ ] 手動模式切換和文字清理功能
- [ ] TXT/PDF/圖文PDF 匯出功能
- [ ] API 金鑰設定和 AI 摘要生成
- [ ] 各種網站相容性測試

## 🛠️ 開發指南

### 本地開發環境
```bash
# 1. 克隆項目
git clone https://github.com/yourusername/cleanclip.git
cd cleanclip

# 2. 在 Chrome 中載入擴充功能
# chrome://extensions/ → 開發人員模式 → 載入未封裝項目

# 3. 修改代碼後重新載入
# 在擴充功能頁面點擊「重新載入」按鈕
```

### 調試方式
- **側邊欄調試**: 右鍵點擊側邊欄 → 檢查元素
- **背景腳本調試**: 擴充功能頁面 → 點擊「背景頁面」
- **內容腳本調試**: 網頁 F12 → Console 查看擷取日誌

## 📈 版本歷史

### v1.0.0 (最新版本) - 2024-12-XX
- ✅ 完整的 5層智慧擷取系統
- ✅ 社交媒體平台專門支援
- ✅ 手動文字處理和 3級清理模式  
- ✅ 圖文PDF匯出功能
- ✅ OpenAI API 整合和多模型選擇
- ✅ 完整的錯誤處理和重試機制

### v0.9.0 - 2024-12-XX
- ✅ 基礎擷取和PDF匯出功能
- ✅ React 使用者界面
- ✅ Chrome擴充功能基礎架構

## 🤝 貢獻指南

我們歡迎各種形式的貢獻！

### 如何貢獻
1. **Fork** 本項目到你的 GitHub
2. 建立功能分支：`git checkout -b feature/amazing-feature`
3. 提交你的更改：`git commit -m 'Add some amazing feature'`
4. 推送到分支：`git push origin feature/amazing-feature`  
5. 開啟 **Pull Request**

### 問題回報
- 🐛 [回報 Bug](https://github.com/yourusername/cleanclip/issues/new?template=bug_report.md)
- 💡 [功能建議](https://github.com/yourusername/cleanclip/issues/new?template=feature_request.md)
- ❓ [提問討論](https://github.com/yourusername/cleanclip/discussions)

## ⚠️ 已知限制

1. **部分動態網站**: 需要等待頁面完全載入，建議使用重試功能
2. **社交媒體內容**: Facebook/Instagram 通常需要登入，建議使用手動模式
3. **複雜佈局網站**: 某些特殊設計的網站可能需要手動調整
4. **API 費用**: AI 摘要功能需要 OpenAI API，會產生使用費用

## 📄 授權條款

本項目採用 [MIT License](LICENSE) 開源授權。

```
MIT License

Copyright (c) 2024 CleanClip

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software...
```

## 🙏 致謝

- [Mozilla Readability](https://github.com/mozilla/readability) - 內容擷取算法基礎
- [jsPDF](https://github.com/parallax/jsPDF) - PDF 生成功能
- [OpenAI](https://openai.com/) - AI 摘要功能支援
- [React](https://reactjs.org/) - 使用者界面框架

---

<div align="center">

**如果這個項目對你有幫助，請給我們一個 ⭐ Star！**

[⬆️ 回到頂部](#cleanclip---智慧網頁文字擷取工具)

</div>