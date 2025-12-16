# 🚀 部署到 Vercel 指南

## 📋 前置準備

### 1. 註冊 Vercel 帳號

- 訪問 [Vercel 官網](https://vercel.com)
- 使用 GitHub 帳號登入（推薦）

### 2. 安裝 Vercel CLI（可選）

```bash
# 使用 npm
npm install -g vercel

# 或使用 yarn
yarn global add vercel
```

---

## 🌐 方法一：通過 Vercel Web 界面部署（推薦，最簡單）

### 步驟 1：連接 GitHub 倉庫

1. 登入 [Vercel Dashboard](https://vercel.com/dashboard)
2. 點擊 **"Add New..."** → **"Project"**
3. 選擇 **"Import Git Repository"**
4. 找到並選擇 `AI-Investment-Decision-Assistant` 倉庫
5. 點擊 **"Import"**

### 步驟 2：配置專案

#### 基本設置
- **Framework Preset:** 選擇 `Other`（或不選擇）
- **Root Directory:** `.` (默認)
- **Build Command:** 留空（靜態網站不需要構建）
- **Output Directory:** `.` (默認)

#### 環境變量設置（重要！）

**注意：** 由於安全原因，Vercel 不建議在前端直接暴露 API Key。但如果您要部署，可以選擇以下兩種方式：

##### 選項 A：用戶自行輸入 API Key（推薦）
- 不需要在 Vercel 設置環境變量
- 用戶在網頁上輸入自己的 API Key
- 數據存儲在瀏覽器 localStorage
- 最安全的方式

##### 選項 B：在 Vercel 設置環境變量（僅供測試）
1. 在專案配置頁面，找到 **"Environment Variables"** 區塊
2. 添加以下環境變量：
   ```
   名稱: VITE_OPENAI_API_KEY
   值: sk-proj-your-actual-api-key-here
   環境: Production, Preview, Development
   ```
3. 點擊 **"Add"**

⚠️ **警告：** 此方法會將 API Key 編譯到網頁中，任何人都可以查看。僅適合測試用途！

### 步驟 3：部署

1. 檢查所有設置
2. 點擊 **"Deploy"**
3. 等待部署完成（通常 1-2 分鐘）
4. 部署成功後，會顯示您的網站 URL

### 步驟 4：訪問您的網站

部署完成後，您會獲得一個 URL，類似：
```
https://ai-investment-assistant-xxx.vercel.app
```

---

## 💻 方法二：通過 Vercel CLI 部署

### 步驟 1：登入 Vercel

```bash
cd "D:\AI投資決策小幫手"
vercel login
```

### 步驟 2：初次部署

```bash
# 第一次部署
vercel

# 按照提示操作：
# - Set up and deploy? [Y/n] → Y
# - Which scope? → 選擇您的帳號
# - Link to existing project? [y/N] → N
# - What's your project's name? → ai-investment-assistant
# - In which directory is your code located? → ./
```

### 步驟 3：生產環境部署

```bash
# 部署到生產環境
vercel --prod
```

### 步驟 4：設置環境變量（可選）

```bash
# 添加環境變量
vercel env add VITE_OPENAI_API_KEY

# 輸入您的 API Key
# 選擇環境: Production, Preview, Development
```

---

## ⚙️ API Key 管理方案

由於前端應用的特殊性，我們提供兩種 API Key 管理方案：

### 方案 A：用戶輸入 API Key（推薦）

**優點：**
- ✅ 最安全：每個用戶使用自己的 API Key
- ✅ 無需暴露您的 API Key
- ✅ 用戶可以控制自己的費用

**實現方式：**
1. 網頁首次載入時檢查是否有 API Key
2. 如果沒有，顯示輸入框讓用戶輸入
3. API Key 存儲在瀏覽器 localStorage
4. 用戶可以隨時更換 API Key

**使用流程：**
```
訪問網站
  ↓
提示輸入 OpenAI API Key
  ↓
輸入並保存
  ↓
開始使用
```

### 方案 B：使用後端代理（最安全，但需要額外設置）

**優點：**
- ✅ 完全保護 API Key
- ✅ 可以控制使用量和成本
- ✅ 可以添加身份驗證

**缺點：**
- ❌ 需要設置後端服務
- ❌ 額外的開發工作

---

## 🔒 安全建議

### 1. 不要將 API Key 提交到 Git

確保 `.gitignore` 包含：
```
config.js
.env
.env.local
```

### 2. 使用環境變量（Vercel 部署）

在 Vercel Dashboard 中設置，不要硬編碼在代碼中。

### 3. 限制 API Key 權限

在 OpenAI 平台：
- 設置使用額度限制
- 啟用使用警報
- 定期更換 API Key

### 4. 考慮使用後端代理

對於生產環境，強烈建議：
- 創建後端 API
- 後端調用 OpenAI API
- 前端只調用您的後端
- 可以添加身份驗證和使用限制

---

## 🔄 自動部署（推薦）

連接 GitHub 後，Vercel 會自動：

1. **推送到 main 分支** → 自動部署到生產環境
2. **推送到其他分支** → 自動創建預覽部署
3. **Pull Request** → 自動生成預覽 URL

---

## 🌍 自訂域名

### 步驟 1：在 Vercel 添加域名

1. 進入專案設置
2. 選擇 **"Domains"**
3. 輸入您的域名（如 `investment.yourdomain.com`）
4. 點擊 **"Add"**

### 步驟 2：配置 DNS

在您的域名提供商（如 Cloudflare、GoDaddy）：

#### 方式 A：使用 CNAME（推薦）
```
類型: CNAME
名稱: investment（或您想要的子域名）
值: cname.vercel-dns.com
```

#### 方式 B：使用 A 記錄
```
類型: A
名稱: @（或您的子域名）
值: 76.76.21.21
```

### 步驟 3：等待 DNS 生效

通常需要幾分鐘到 24 小時，Vercel 會自動配置 HTTPS。

---

## 📊 監控與分析

### Vercel Analytics

Vercel 提供內建分析：
1. 進入專案
2. 點擊 **"Analytics"** 標籤
3. 查看訪問量、性能等數據

### 升級到 Pro（可選）

Pro 版本提供：
- 更詳細的分析
- 更多的建構時間
- 優先支援
- 更好的性能

---

## 🐛 常見問題

### Q1: 部署後網頁空白

**解決方案：**
- 檢查瀏覽器控制台錯誤（F12）
- 確認所有文件路徑正確
- 檢查 vercel.json 配置

### Q2: API Key 無效

**解決方案：**
- 確認 API Key 格式正確
- 檢查 localStorage 中的值
- 清除瀏覽器緩存重試

### Q3: 部署失敗

**解決方案：**
- 查看 Vercel 建構日誌
- 確認 Git 推送成功
- 檢查檔案命名和路徑

### Q4: 如何更新網站？

**解決方案：**
```bash
# 修改代碼後
git add .
git commit -m "更新說明"
git push origin main

# Vercel 會自動重新部署
```

---

## 📞 獲取幫助

- **Vercel 文檔：** https://vercel.com/docs
- **Vercel 社群：** https://github.com/vercel/vercel/discussions
- **專案 Issues：** https://github.com/elsonyeh/AI-Investment-Decision-Assistant/issues

---

## ✅ 部署檢查清單

部署前確認：

- [ ] GitHub 倉庫已推送最新代碼
- [ ] `.gitignore` 包含 `config.js`
- [ ] `.vercelignore` 已創建
- [ ] `vercel.json` 配置正確
- [ ] 決定 API Key 管理方案
- [ ] 測試本地版本正常運作

部署後驗證：

- [ ] 網站可以正常訪問
- [ ] 所有頁面都能載入
- [ ] API 功能正常（輸入 API Key 後）
- [ ] 響應式設計在不同設備正常
- [ ] 沒有控制台錯誤

---

## 🎉 完成！

恭喜！您的 AI 投資助手現在已經在線上運行了！

**下一步：**
1. 分享您的網站 URL
2. 收集用戶反饋
3. 持續改進功能
4. 考慮添加更多特性

---

**🤖 Generated with Claude Code**

最後更新：2025-12-16
