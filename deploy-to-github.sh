#!/bin/bash

echo "🚀 CleanClip GitHub 部署腳本"
echo "================================"

# 檢查是否提供了 GitHub 用戶名
if [ -z "$1" ]; then
    echo "❌ 請提供你的 GitHub 用戶名"
    echo "使用方式: ./deploy-to-github.sh YOUR_GITHUB_USERNAME"
    echo ""
    echo "範例: ./deploy-to-github.sh leonalin"
    exit 1
fi

USERNAME=$1
REPO_URL="https://github.com/$USERNAME/cleanclip.git"

echo "👤 GitHub 用戶名: $USERNAME"
echo "📦 倉庫 URL: $REPO_URL"
echo ""

# 更新遠程倉庫 URL
echo "🔧 設置遠程倉庫..."
git remote remove origin 2>/dev/null || true
git remote add origin $REPO_URL

# 檢查 Git 狀態
echo "📋 檢查 Git 狀態..."
git status --porcelain

# 推送到 GitHub
echo "🚀 推送到 GitHub..."
echo "請確保你已經在 GitHub 創建了 'cleanclip' 倉庫"
read -p "按 Enter 繼續推送，或 Ctrl+C 取消: "

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 成功部署到 GitHub！"
    echo "🌐 你的倉庫地址: https://github.com/$USERNAME/cleanclip"
    echo "📖 README 預覽: https://github.com/$USERNAME/cleanclip#readme"
    echo ""
    echo "🎉 現在其他人可以通過以下命令克隆你的項目："
    echo "   git clone https://github.com/$USERNAME/cleanclip.git"
else
    echo ""
    echo "❌ 推送失敗！"
    echo "請確認："
    echo "1. 你已經在 GitHub 創建了 'cleanclip' 倉庫"
    echo "2. 你有該倉庫的推送權限"
    echo "3. 你已經配置了 Git 認證 (git config user.name 和 user.email)"
fi