// ===== OpenAI API 配置範例 =====
// 請複製此文件為 config.js，然後填入您的實際 API Key

const CONFIG = {
    // 請將下方的 'your-api-key-here' 替換為您的實際 OpenAI API Key
    // 獲取 API Key: https://platform.openai.com/api-keys
    OPENAI_API_KEY: 'your-api-key-here',

    // 使用的模型（推薦使用 gpt-4o-mini 以降低成本）
    // 可選模型:
    // - gpt-4o-mini (推薦，成本低，速度快)
    // - gpt-4o (更強大但成本較高)
    // - gpt-4-turbo (較舊版本)
    MODEL: 'gpt-4o-mini',

    // API 基礎 URL（通常不需要修改）
    API_BASE_URL: 'https://api.openai.com/v1',

    // 最大 tokens 數量
    MAX_TOKENS: 2000,

    // 溫度參數（0-2，越高越有創意，越低越保守）
    TEMPERATURE: 0.7
};

// ===== 配置驗證 =====
function validateConfig() {
    if (!CONFIG.OPENAI_API_KEY || CONFIG.OPENAI_API_KEY === 'your-api-key-here') {
        console.warn('⚠️ 警告：尚未設置 OpenAI API Key！');
        console.warn('請在 config.js 文件中設置您的 API Key');
        console.warn('獲取 API Key: https://platform.openai.com/api-keys');
        return false;
    }
    return true;
}

// 頁面載入時驗證配置
window.addEventListener('DOMContentLoaded', () => {
    if (!validateConfig()) {
        // 可以在頁面上顯示警告
        const warning = document.createElement('div');
        warning.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #fff3cd;
            border: 2px solid #ffc107;
            border-radius: 8px;
            padding: 15px 20px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            z-index: 10000;
            max-width: 400px;
        `;
        warning.innerHTML = `
            <h4 style="margin: 0 0 10px 0; color: #856404;">⚠️ API Key 未設置</h4>
            <p style="margin: 0; color: #856404; font-size: 14px;">
                請在 <code>config.js</code> 文件中設置您的 OpenAI API Key。<br>
                <a href="https://platform.openai.com/api-keys" target="_blank" style="color: #0066cc;">點此獲取 API Key</a>
            </p>
            <button onclick="this.parentElement.remove()" style="margin-top: 10px; padding: 5px 15px; background: #ffc107; border: none; border-radius: 4px; cursor: pointer;">關閉</button>
        `;
        document.body.appendChild(warning);
    }
});

// ===== 使用說明 =====
/*
# OpenAI API Key 設置步驟

1. 複製本文件並重命名為 config.js
   cp config.example.js config.js

2. 前往 OpenAI 網站: https://platform.openai.com/api-keys

3. 登入您的 OpenAI 帳號（如果沒有，請先註冊）

4. 點擊 "Create new secret key" 創建新的 API Key

5. 複製生成的 API Key

6. 在 config.js 中，將 'your-api-key-here' 替換為您的 API Key：
   OPENAI_API_KEY: 'sk-proj-xxxxxxxxxxxxxxxxxx',

7. 保存文件

8. 刷新網頁，即可開始使用

# 費用說明

- gpt-4o-mini 模型費用較低，適合測試和日常使用
  - 輸入: $0.15 / 1M tokens
  - 輸出: $0.60 / 1M tokens

- 單次完整分析預估費用約 $0.05 - $0.15 USD（取決於分析深度）

- 建議在 OpenAI 帳號中設置使用額度限制，避免意外支出

# 安全提示

- 不要將包含 API Key 的 config.js 文件上傳到公開的程式碼倉庫
- 不要與他人分享您的 API Key
- 如果 API Key 洩露，請立即在 OpenAI 平台上撤銷並重新生成

*/
