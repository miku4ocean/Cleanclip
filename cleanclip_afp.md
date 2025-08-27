# CleanClip：純文字擷取外掛 AFP 文件

## 🧠 專案目的
設計一個簡潔實用的 Chrome 擴充功能，幫助使用者從網頁中擷取主文純文字，排除頁首／頁尾／廣告等干擾資訊，並可手動調整、儲存為 `.txt` 檔或進行摘要，未來支援乾淨 PDF 匯出。解決 Evernote、Notion 類工具過度包裝與格式污染的閱讀困擾。

## 🧩 功能模組
```json
[
  { "name": "側欄啟動", "description": "點擊外掛 icon 後開啟側邊欄 UI" },
  { "name": "文字擷取", "description": "自動擷取網頁主文純文字，排除干擾區塊" },
  { "name": "手動清理", "description": "讓使用者手動移除不需要的段落或文字" },
  { "name": "儲存文字", "description": "將清理後內容匯出為 .txt 檔" },
  { "name": "摘要文章", "description": "使用 GPT API 將主文進行摘要，另存為 .txt 檔" },
  { "name": "PDF 匯出（延伸）", "description": "將清爽主文與必要圖片生成乾淨版 PDF（非列印模式）" }
]
```

## 🧬 資料模型
```yaml
ExtractedContent:
  url: string
  fullText: string
  cleanedText: string
  summaryText: string
  createdAt: datetime
```

## 🔁 使用流程
1. 使用者點擊 Chrome 外掛 icon
2. 側邊欄 UI 開啟，系統自動擷取主文文字（使用 Readability）
3. 使用者預覽並可手動刪除段落內容
4. 點擊「儲存全文」→ 下載 `.txt` 檔
5. 或點擊「摘要文章」→ 呼叫 GPT API 摘要並下載摘要 `.txt`
6. （未來）可選擇「匯出 PDF」→ 清爽圖文轉為 PDF 檔

## ⚙️ 技術偏好
```json
{
  "extension": "Chrome Manifest v3",
  "frontend": "React + Tailwind",
  "content_script": "Vanilla JS + Readability.js",
  "api": "OpenAI GPT API（摘要）",
  "file_export": "Blob + download API",
  "pdf_generator": "jsPDF + html2canvas"
}
```

## 🔐 使用者角色與權限
```json
[
  { "role": "guest", "can": ["extractText", "editText", "downloadTxt", "generateSummary"] }
]
```

## 🎨 畫面風格
CleanClip 採用右側滑出式側邊欄設計，界面乾淨極簡，以淺灰＋白為基底色。文字顯示區域使用 monospace 字型，強調可閱讀性。按鈕採用扁平式設計，搭配淡藍點綴與 hover 動畫。整體風格類似 Linear、Raycast、Notion Web Clipper 的極簡延伸。

## 🤖 Sub Agent 任務拆解建議
```yaml
- agent: FrontendSidebarAgent
  responsibleFor:
    - 側邊欄 UI 建構（React）
    - 預覽與段落刪除操作
    - 匯出／摘要按鈕設計

- agent: ContentExtractorAgent
  responsibleFor:
    - content_script 撰寫
    - Readability.js 主文分析與過濾
    - 將資料傳送給 sidebar

- agent: FileExportAgent
  responsibleFor:
    - .txt 檔案下載流程
    - PDF 匯出模組整合（jsPDF）

- agent: SummaryAgent
  responsibleFor:
    - 串接 GPT API
    - 摘要內容回傳與整理
    - 錯誤處理與 fallback 策略
```
