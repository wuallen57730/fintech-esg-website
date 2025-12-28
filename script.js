// ===== 全局變量 =====
let analysisData = null;
let currentStock = '';
let currentMarket = '';
let watchlist = [];
let analysisHistory = [];

// ===== 股票代碼資料庫 =====
const STOCK_DATABASE = {
    TW: [
        { code: '2330', name: '台積電', nameEn: 'TSMC' },
        { code: '2317', name: '鴻海', nameEn: 'Hon Hai' },
        { code: '2454', name: '聯發科', nameEn: 'MediaTek' },
        { code: '2412', name: '中華電', nameEn: 'Chunghwa Telecom' },
        { code: '2882', name: '國泰金', nameEn: 'Cathay FHC' },
        { code: '2881', name: '富邦金', nameEn: 'Fubon FHC' },
        { code: '2886', name: '兆豐金', nameEn: 'Mega FHC' },
        { code: '2891', name: '中信金', nameEn: 'CTBC FHC' },
        { code: '2303', name: '聯電', nameEn: 'UMC' },
        { code: '2308', name: '台達電', nameEn: 'Delta Electronics' },
        { code: '2357', name: '華碩', nameEn: 'ASUS' },
        { code: '2382', name: '廣達', nameEn: 'Quanta' },
        { code: '2395', name: '研華', nameEn: 'Advantech' },
        { code: '3008', name: '大立光', nameEn: 'Largan' },
        { code: '3711', name: '日月光投控', nameEn: 'ASE Technology' },
        { code: '5880', name: '合庫金', nameEn: 'Taiwan Business Bank' },
        { code: '6505', name: '台塑化', nameEn: 'Formosa Petrochemical' },
        { code: '1301', name: '台塑', nameEn: 'Formosa Plastics' },
        { code: '1303', name: '南亞', nameEn: 'Nan Ya Plastics' },
        { code: '0050', name: '元大台灣50', nameEn: 'Yuanta Taiwan 50 ETF' },
        { code: '0056', name: '元大高股息', nameEn: 'Yuanta High Dividend ETF' }
    ],
    US: [
        { code: 'AAPL', name: 'Apple', nameCn: '蘋果' },
        { code: 'MSFT', name: 'Microsoft', nameCn: '微軟' },
        { code: 'GOOGL', name: 'Alphabet (Google)', nameCn: '谷歌' },
        { code: 'AMZN', name: 'Amazon', nameCn: '亞馬遜' },
        { code: 'TSLA', name: 'Tesla', nameCn: '特斯拉' },
        { code: 'META', name: 'Meta (Facebook)', nameCn: 'Meta' },
        { code: 'NVDA', name: 'NVIDIA', nameCn: '輝達' },
        { code: 'TSM', name: 'Taiwan Semiconductor (ADR)', nameCn: '台積電ADR' },
        { code: 'JPM', name: 'JPMorgan Chase', nameCn: '摩根大通' },
        { code: 'V', name: 'Visa', nameCn: 'Visa' },
        { code: 'WMT', name: 'Walmart', nameCn: '沃爾瑪' },
        { code: 'JNJ', name: 'Johnson & Johnson', nameCn: '嬌生' },
        { code: 'PG', name: 'Procter & Gamble', nameCn: '寶僑' },
        { code: 'DIS', name: 'Walt Disney', nameCn: '迪士尼' },
        { code: 'NFLX', name: 'Netflix', nameCn: '網飛' },
        { code: 'PYPL', name: 'PayPal', nameCn: 'PayPal' },
        { code: 'INTC', name: 'Intel', nameCn: '英特爾' },
        { code: 'AMD', name: 'AMD', nameCn: '超微' },
        { code: 'BABA', name: 'Alibaba', nameCn: '阿里巴巴' },
        { code: 'NKE', name: 'Nike', nameCn: '耐克' },
        { code: 'BA', name: 'Boeing', nameCn: '波音' },
        { code: 'COST', name: 'Costco', nameCn: '好市多' },
        { code: 'MA', name: 'Mastercard', nameCn: '萬事達卡' }
    ]
};

// ===== LocalStorage 鍵名 =====
const STORAGE_KEYS = {
    WATCHLIST: 'ai_investment_watchlist',
    HISTORY: 'ai_investment_history',
    API_KEY: 'ai_investment_api_key',
    MODEL: 'ai_investment_model',
    STOCK_DB_TW: 'ai_investment_stock_db_tw',
    STOCK_DB_US: 'ai_investment_stock_db_us',
    STOCK_DB_TIMESTAMP: 'ai_investment_stock_db_timestamp'
};

// ===== 完整股票資料庫配置 =====
const STOCK_DB_CONFIG = {
    CACHE_DURATION: 7 * 24 * 60 * 60 * 1000, // 7天快取
    TW_API_URL: 'https://openapi.twse.com.tw/v1/exchangeReport/STOCK_DAY_ALL',
    FALLBACK_MODE: true // 如果 API 失敗，使用內建資料
};

// ===== DOM 元素 =====
const elements = {
    // 側邊欄與導航
    sidebar: document.getElementById('sidebar'),
    sidebarToggle: document.getElementById('sidebar-toggle'),
    mobileMenuBtn: document.getElementById('mobile-menu-btn'),
    navItems: document.querySelectorAll('.nav-item'),
    pages: document.querySelectorAll('.page'),

    // AI 評分卡片
    aiScoreSection: document.getElementById('ai-score-section'),
    aiScore: document.getElementById('ai-score'),
    scoreProgress: document.getElementById('score-progress'),
    scoreLabel: document.getElementById('score-label'),
    scoreStockName: document.getElementById('score-stock-name'),
    technicalScore: document.getElementById('technical-score'),
    fundamentalScore: document.getElementById('fundamental-score'),
    sentimentScore: document.getElementById('sentiment-score'),
    addToWatchlistBtn: document.getElementById('add-to-watchlist-btn'),

    // 配置區
    marketSelect: document.getElementById('market-select'),
    stockInput: document.getElementById('stock-input'),
    analysisDate: document.getElementById('analysis-date'),
    depthSlider: document.getElementById('depth-slider'),
    depthValue: document.getElementById('depth-value'),
    startBtn: document.getElementById('start-analysis-btn'),
    exportPdfBtn: document.getElementById('export-pdf-btn'),

    // Agent 選擇
    agentTechnical: document.getElementById('agent-technical'),
    agentFundamental: document.getElementById('agent-fundamental'),
    agentNews: document.getElementById('agent-news'),
    agentSentiment: document.getElementById('agent-sentiment'),
    agentCount: document.getElementById('agent-count'),

    // 進度
    progressSection: document.getElementById('progress-section'),
    currentStepText: document.getElementById('current-step-text'),
    progressBar: document.getElementById('progress-bar'),
    progressPercent: document.getElementById('progress-percent'),
    elapsedTime: document.getElementById('elapsed-time'),
    remainingTime: document.getElementById('remaining-time'),

    // 摘要
    summarySection: document.getElementById('summary-section'),
    stockTitle: document.getElementById('stock-title'),
    recommendation: document.getElementById('recommendation'),
    confidence: document.getElementById('confidence'),
    confidenceChange: document.getElementById('confidence-change'),
    riskScore: document.getElementById('risk-score'),
    riskChange: document.getElementById('risk-change'),
    targetPrice: document.getElementById('target-price'),
    aiReasoningContent: document.getElementById('ai-reasoning-content'),
    viewDetailBtn: document.getElementById('view-detail-btn'),

    // 詳細報告
    detailSection: document.getElementById('detail-section'),
    tabBtns: document.querySelectorAll('.tab-btn'),
    technicalContent: document.getElementById('technical-content'),
    fundamentalContent: document.getElementById('fundamental-content'),
    sentimentContent: document.getElementById('sentiment-content'),
    newsContent: document.getElementById('news-content'),
    riskContent: document.getElementById('risk-content'),
    recContent: document.getElementById('rec-content'),

    // 觀察清單
    watchlistEmpty: document.getElementById('watchlist-empty'),
    watchlistContainer: document.getElementById('watchlist-container'),
    watchlistCount: document.getElementById('watchlist-count'),

    // 歷史記錄
    historyEmpty: document.getElementById('history-empty'),
    historyContainer: document.getElementById('history-container'),
    historyCount: document.getElementById('history-count'),
    clearHistoryBtn: document.getElementById('clear-history-btn'),

    // 儀表板
    totalWatchlist: document.getElementById('total-watchlist'),
    totalAnalyses: document.getElementById('total-analyses'),
    buySignals: document.getElementById('buy-signals'),
    sellSignals: document.getElementById('sell-signals'),

    // 快速搜尋
    quickSearch: document.getElementById('quick-search'),
    quickSearchBtn: document.getElementById('quick-search-btn'),

    // 設定頁面
    apiKeyInput: document.getElementById('api-key-input'),
    toggleApiKeyBtn: document.getElementById('toggle-api-key'),
    saveApiKeyBtn: document.getElementById('save-api-key-btn'),
    clearApiKeyBtn: document.getElementById('clear-api-key-btn'),
    apiKeyStatus: document.getElementById('api-key-status'),
    modelSelect: document.getElementById('model-select'),
    autoSave: document.getElementById('auto-save'),

    // 股票比較
    startCompareBtn: document.getElementById('start-compare-btn'),
    compareContainer: document.getElementById('compare-container')
};

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

function initApp() {
    // 載入資料
    loadWatchlist();
    loadHistory();

    // 設置今天日期
    const today = new Date().toISOString().split('T')[0];
    elements.analysisDate.value = today;

    // 綁定事件
    bindEvents();

    // 更新統計
    updateStats();

    // 檢查 API Key
    checkAPIStatus();

    // 初始化設定
    initSettings();

    // 載入完整股票資料庫（異步）
    loadFullStockDatabase();
}

function bindEvents() {
    // 側邊欄導航
    elements.navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            switchPage(page);
        });
    });

    // 行動版選單
    if (elements.mobileMenuBtn) {
        elements.mobileMenuBtn.addEventListener('click', () => {
            elements.sidebar.classList.toggle('active');
        });
    }

    // 深度滑桿
    elements.depthSlider.addEventListener('input', (e) => {
        elements.depthValue.textContent = e.target.value;
    });

    // Agent 選擇
    const agentCheckboxes = [
        elements.agentTechnical,
        elements.agentFundamental,
        elements.agentNews,
        elements.agentSentiment
    ];
    agentCheckboxes.forEach(cb => {
        cb.addEventListener('change', updateAgentCount);
    });

    // 開始分析
    elements.startBtn.addEventListener('click', startAnalysis);

    // 查看詳細報告
    if (elements.viewDetailBtn) {
        elements.viewDetailBtn.addEventListener('click', () => {
            elements.detailSection.style.display = 'block';
            elements.detailSection.scrollIntoView({ behavior: 'smooth' });
        });
    }

    // 標籤頁切換
    elements.tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchTab(tab);
        });
    });

    // 加入觀察清單
    elements.addToWatchlistBtn.addEventListener('click', addCurrentToWatchlist);

    // 清空歷史
    if (elements.clearHistoryBtn) {
        elements.clearHistoryBtn.addEventListener('click', clearHistory);
    }

    // 匯出 PDF
    if (elements.exportPdfBtn) {
        elements.exportPdfBtn.addEventListener('click', exportToPDF);
    }

    // 快速搜尋
    elements.quickSearchBtn.addEventListener('click', () => {
        const query = elements.quickSearch.value.trim();
        if (query) {
            elements.stockInput.value = query;
            switchPage('analysis');
            elements.quickSearch.value = '';
        }
    });

    elements.quickSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            elements.quickSearchBtn.click();
        }
    });

    // 股票比較
    if (elements.startCompareBtn) {
        elements.startCompareBtn.addEventListener('click', showCompareSelection);
    }

    // 智能建議列表
    initStockAutocomplete();
}

// ===== 頁面切換 =====
function switchPage(pageName) {
    // 更新導航
    elements.navItems.forEach(item => {
        item.classList.remove('active');
        if (item.dataset.page === pageName) {
            item.classList.add('active');
        }
    });

    // 更新頁面
    elements.pages.forEach(page => {
        page.classList.remove('active');
        if (page.id === `page-${pageName}`) {
            page.classList.add('active');
        }
    });

    // 特殊頁面處理
    if (pageName === 'watchlist') {
        renderWatchlist();
    } else if (pageName === 'history') {
        renderHistory();
    } else if (pageName === 'dashboard') {
        renderDashboard();
    }

    // 關閉行動版選單
    if (window.innerWidth <= 768) {
        elements.sidebar.classList.remove('active');
    }
}

// ===== Agent 計數更新 =====
function updateAgentCount() {
    const count = [
        elements.agentTechnical,
        elements.agentFundamental,
        elements.agentNews,
        elements.agentSentiment
    ].filter(cb => cb.checked).length;

    elements.agentCount.textContent = count;
}

// ===== 開始分析 =====
async function startAnalysis() {
    let market = elements.marketSelect.value;
    const stock = elements.stockInput.value.trim().toUpperCase();
    const date = elements.analysisDate.value;
    const depth = elements.depthSlider.value;

    if (!stock) {
        showNotification('請輸入股票代碼！', 'warning');
        return;
    }

    const selectedAgents = getSelectedAgents();
    if (selectedAgents.length === 0) {
        showNotification('請至少選擇一個分析師！', 'warning');
        return;
    }

    // 自動識別模式：根據代碼格式自動判斷市場
    if (market === 'AUTO') {
        const detectedMarket = detectMarketFromCode(stock);

        if (detectedMarket) {
            market = detectedMarket;
            elements.marketSelect.value = detectedMarket;
            showNotification(`已自動識別為${getMarketName(detectedMarket)}`, 'success', 2000);
        } else {
            showNotification('無法識別代碼格式，請手動選擇市場', 'warning');
            return;
        }
    } else {
        // 手動選擇模式：驗證市場與代碼是否匹配
        const validation = validateMarketMatch(market, stock);

        if (!validation.valid) {
            // 顯示確認對話框
            showMarketMismatchDialog(validation, stock, (confirmedMarket) => {
                // 使用確認後的市場進行分析
                proceedWithAnalysis(confirmedMarket, stock, date, depth, selectedAgents);
            });
            return;
        }

        // 如果有警告但仍然有效
        if (validation.warning) {
            showNotification(validation.warning, 'info', 3000);
        }
    }

    // ===== 驗證代碼是否存在 =====
    const stockValidation = validateStockExists(stock, market);

    if (!stockValidation.exists) {
        // 顯示找不到股票的錯誤對話框
        showStockNotFoundDialog(stock, market);
        return;
    }

    // 直接進行分析（只使用代碼）
    proceedWithAnalysis(market, stock, date, depth, selectedAgents);
}

async function proceedWithAnalysis(market, stock, date, depth, selectedAgents) {
    currentStock = stock;
    currentMarket = market;

    // 隱藏配置，顯示進度
    elements.progressSection.style.display = 'block';
    elements.summarySection.style.display = 'none';
    elements.detailSection.style.display = 'none';
    elements.aiScoreSection.style.display = 'none';

    elements.progressSection.scrollIntoView({ behavior: 'smooth' });

    try {
        await runAnalysis(market, stock, date, depth, selectedAgents);
    } catch (error) {
        console.error('分析錯誤:', error);
        showNotification('分析過程中發生錯誤：' + error.message, 'error', 5000);
    }
}

function getSelectedAgents() {
    const agents = [];
    if (elements.agentTechnical.checked) agents.push('technical');
    if (elements.agentFundamental.checked) agents.push('fundamental');
    if (elements.agentNews.checked) agents.push('news');
    if (elements.agentSentiment.checked) agents.push('sentiment');
    return agents;
}

// ===== 分析流程 =====
async function runAnalysis(market, stock, date, depth, agents) {
    const startTime = Date.now();

    // 初始化
    updateProgress(10, '初始化分析環境', startTime);
    await sleep(500);

    // 分析師分析
    const agentResults = {};
    for (let i = 0; i < agents.length; i++) {
        const agent = agents[i];
        const progress = 10 + ((i + 1) / agents.length) * 60;
        updateProgress(progress, `${getAgentName(agent)}正在分析`, startTime);

        agentResults[agent] = await callAgentAPI(agent, market, stock, date, depth);
        await sleep(3000); // 3秒延遲，適應 Tier 1 的 500 RPM 限制
    }

    // 多空辯論
    updateProgress(75, '多空辯論研究中', startTime);
    const debate = await runDebate(agentResults, market, stock);
    await sleep(3000); // 3秒延遲

    // 風險評估
    updateProgress(85, '風險管理評估', startTime);
    const risk = await runRiskManagement(agentResults, debate);
    await sleep(3000); // 3秒延遲

    // 最終決策
    updateProgress(95, '生成最終投資建議', startTime);
    const decision = await runPortfolioManager(agentResults, debate, risk, market, stock);
    await sleep(1000);

    // 完成
    updateProgress(100, '分析完成', startTime);

    // 計算 AI 評分
    const aiScore = calculateAIScore(agentResults, decision);

    // 確保 market 不是 AUTO（以防萬一）
    let finalMarket = market;
    if (finalMarket === 'AUTO') {
        finalMarket = detectMarketFromCode(stock) || currentMarket || 'TW';
        currentMarket = finalMarket; // 同步更新
    }

    // 保存數據
    analysisData = {
        stock,
        market: finalMarket, // 使用最終確認的市場
        date,
        depth,
        agentResults,
        debate,
        risk,
        decision,
        aiScore,
        timestamp: new Date().toISOString()
    };

    // 保存到歷史
    saveToHistory(analysisData);

    // 顯示結果
    await sleep(500);
    displayResults();
}

// ===== 更新進度 =====
function updateProgress(percent, step, startTime) {
    elements.progressPercent.textContent = `${Math.round(percent)}%`;
    elements.currentStepText.textContent = step;
    elements.progressBar.style.width = `${percent}%`;

    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    elements.elapsedTime.textContent = `${elapsed}秒`;

    if (percent < 100) {
        const remaining = Math.floor((elapsed / percent) * (100 - percent));
        elements.remainingTime.textContent = `約${remaining}秒`;
    } else {
        elements.remainingTime.textContent = '已完成';
    }
}

// ===== API 調用（沿用原始邏輯）=====
async function callAgentAPI(agentType, market, stock, date, depth) {
    // 與原始 script.js 相同的邏輯
    const prompts = {
        technical: `作為技術分析師，請分析 ${market} 市場的 ${stock} 股票（分析日期：${date}）。
請提供：1. 技術指標分析 2. 價格趨勢 3. 支撐壓力位 4. 量價關係 5. 買賣建議
深度等級：${depth}/5
請在回應末尾提供一個技術面評分（1-10分）。`,

        fundamental: `作為基本面分析師，請分析 ${market} 市場的 ${stock} 股票（分析日期：${date}）。
請提供：1. 財務狀況 2. 成長性評估 3. 估值分析 4. 產業地位 5. 投資評價
深度等級：${depth}/5
請在回應末尾提供一個基本面評分（1-10分）。`,

        news: `作為新聞分析師，請分析 ${market} 市場的 ${stock} 股票（分析日期：${date}）的相關新聞。
請提供：1. 重大新聞事件 2. 新聞影響評估 3. 政策面影響 4. 產業趨勢 5. 綜合評價
深度等級：${depth}/5`,

        sentiment: `作為市場情緒分析師，請分析 ${market} 市場的 ${stock} 股票（分析日期：${date}）的市場情緒。
請提供：1. 社群情緒 2. 投資者情緒指標 3. 機構動向 4. 市場恐慌/貪婪程度 5. 綜合評價
深度等級：${depth}/5
請在回應末尾提供一個情緒面評分（1-10分）。`
    };

    try {
        const response = await callChatGPT(prompts[agentType]);
        return response;
    } catch (error) {
        console.error(`${agentType} Agent 錯誤:`, error);
        return `[${getAgentName(agentType)}分析暫時無法完成]`;
    }
}

async function runDebate(agentResults, market, stock) {
    const allAnalysis = Object.values(agentResults).join('\n\n');
    const bullPrompt = `作為多頭分析師，基於以下分析，提出 ${market} ${stock} 的看多論點：\n${allAnalysis}`;
    const bearPrompt = `作為空頭分析師，基於以下分析，提出 ${market} ${stock} 的看空論點：\n${allAnalysis}`;

    try {
        // 改為順序執行，避免並行請求觸發速率限制
        const bullCase = await callChatGPT(bullPrompt);
        await sleep(3000); // 3秒延遲，適應 Tier 1 的 500 RPM 限制
        const bearCase = await callChatGPT(bearPrompt);
        return { bullCase, bearCase };
    } catch (error) {
        console.error('辯論分析錯誤:', error);
        return { bullCase: '[多頭分析失敗]', bearCase: '[空頭分析失敗]' };
    }
}

async function runRiskManagement(agentResults, debate) {
    const prompt = `作為風險管理團隊，評估以下投資的風險：\n${JSON.stringify({ agentResults, debate }, null, 2)}
請提供：1. 風險評分（0-100） 2. 主要風險因素 3. 風險控制建議 4. 倉位配置建議`;

    try {
        return await callChatGPT(prompt);
    } catch (error) {
        return '[風險評估失敗]';
    }
}

async function runPortfolioManager(agentResults, debate, risk, market, stock) {
    const prompt = `作為投資組合經理，基於所有分析做出最終決策：
市場：${market}，股票：${stock}
分析：${JSON.stringify({ agentResults, debate, risk }, null, 2)}

請提供JSON格式的決策（包含在回應中）：
{
  "recommendation": "買入/持有/賣出",
  "confidence": 85,
  "confidenceChange": 10,
  "riskScore": 45,
  "riskChange": -5,
  "targetPrice": "$XXX.XX",
  "reasoning": "詳細理由..."
}`;

    try {
        return await callChatGPT(prompt);
    } catch (error) {
        return '[最終決策失敗]';
    }
}

async function callChatGPT(prompt, retries = 3) {
    // 優先從 localStorage 讀取 API Key
    let apiKey = getApiKey();

    // 如果 localStorage 沒有，嘗試從 CONFIG 讀取（向後兼容）
    if (!apiKey && typeof CONFIG !== 'undefined' && CONFIG.OPENAI_API_KEY && CONFIG.OPENAI_API_KEY !== 'your-api-key-here') {
        apiKey = CONFIG.OPENAI_API_KEY;
    }

    if (!apiKey) {
        throw new Error('請先在設定頁面設置您的 OpenAI API Key');
    }

    const model = getModel();

    // 重試機制
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: model,
                    messages: [
                        { role: 'system', content: '你是專業的投資分析AI。' },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.7,
                    max_tokens: 2000
                })
            });

            if (!response.ok) {
                const error = await response.json();

                // 如果是 429 速率限制錯誤，使用指數退避重試
                if (response.status === 429 && attempt < retries - 1) {
                    const waitTime = Math.pow(2, attempt) * 2000; // 2s, 4s, 8s
                    console.log(`⏳ 速率限制，等待 ${waitTime/1000} 秒後重試... (嘗試 ${attempt + 1}/${retries})`);
                    await sleep(waitTime);
                    continue;
                }

                // 其他錯誤或最後一次重試失敗
                throw new Error(`API 調用失敗: ${error.error?.message || response.statusText}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;

        } catch (error) {
            // 如果是網路錯誤且還有重試次數
            if (attempt < retries - 1 && (error.name === 'TypeError' || error.message.includes('Failed to fetch'))) {
                const waitTime = 2000;
                console.log(`🔄 網路錯誤，${waitTime/1000} 秒後重試... (嘗試 ${attempt + 1}/${retries})`);
                await sleep(waitTime);
                continue;
            }

            // 最後一次重試或其他錯誤
            throw error;
        }
    }
}

// ===== 計算 AI 評分 =====
function calculateAIScore(agentResults, decision) {
    // 從各個分析師的回應中提取評分，處理可能的 undefined 或錯誤訊息
    const scores = {
        technical: agentResults.technical ? extractScore(agentResults.technical) : 5,
        fundamental: agentResults.fundamental ? extractScore(agentResults.fundamental) : 5,
        sentiment: agentResults.sentiment ? extractScore(agentResults.sentiment) : 5
    };

    // 計算平均分
    const validScores = Object.values(scores).filter(s => s > 0);
    const avgScore = validScores.length > 0
        ? validScores.reduce((a, b) => a + b, 0) / validScores.length
        : 5;

    return {
        overall: Math.round(avgScore * 10) / 10,
        technical: scores.technical || 5,
        fundamental: scores.fundamental || 5,
        sentiment: scores.sentiment || 5
    };
}

function extractScore(text) {
    // 檢查輸入是否有效
    if (!text || typeof text !== 'string') {
        return 5; // 默認值
    }

    // 嘗試從文本中提取評分（1-10）
    const patterns = [
        /評分[：:]\s*(\d+(?:\.\d+)?)/i,
        /(\d+(?:\.\d+)?)\s*[\/\/]10/,
        /(\d+(?:\.\d+)?)\s*分/
    ];

    for (const pattern of patterns) {
        const match = text.match(pattern);
        if (match) {
            const score = parseFloat(match[1]);
            if (score >= 1 && score <= 10) {
                return score;
            }
        }
    }

    return 5; // 默認值
}

// ===== 顯示結果 =====
function displayResults() {
    // 顯示 AI 評分卡片
    displayAIScore();

    // 顯示摘要
    displaySummary();

    // 顯示詳細報告
    displayDetailReport();

    // 顯示匯出按鈕
    elements.exportPdfBtn.style.display = 'inline-flex';

    // 滾動到 AI 評分卡片
    elements.aiScoreSection.scrollIntoView({ behavior: 'smooth' });
}

function displayAIScore() {
    const { aiScore } = analysisData;

    elements.aiScoreSection.style.display = 'block';
    elements.aiScore.textContent = aiScore.overall.toFixed(1);
    elements.scoreStockName.textContent = `${currentStock} AI 評分`;

    // 更新評分標籤
    const score = aiScore.overall;
    if (score >= 8) {
        elements.scoreLabel.textContent = '強力買入';
        elements.scoreLabel.style.color = '#4caf50';
    } else if (score >= 6.5) {
        elements.scoreLabel.textContent = '建議買入';
        elements.scoreLabel.style.color = '#8bc34a';
    } else if (score >= 5) {
        elements.scoreLabel.textContent = '中性持有';
        elements.scoreLabel.style.color = '#ff9800';
    } else if (score >= 3.5) {
        elements.scoreLabel.textContent = '建議賣出';
        elements.scoreLabel.style.color = '#ff5722';
    } else {
        elements.scoreLabel.textContent = '強力賣出';
        elements.scoreLabel.style.color = '#f44336';
    }

    // 更新進度圓圈
    const circumference = 2 * Math.PI * 75;
    const offset = circumference - (score / 10) * circumference;
    elements.scoreProgress.style.strokeDashoffset = offset;

    // 更新各維度評分
    elements.technicalScore.textContent = aiScore.technical.toFixed(1);
    elements.fundamentalScore.textContent = aiScore.fundamental.toFixed(1);
    elements.sentimentScore.textContent = aiScore.sentiment.toFixed(1);
}

function displaySummary() {
    elements.summarySection.style.display = 'block';
    elements.stockTitle.textContent = `📊 ${currentStock} 分析結果`;

    const { decision } = analysisData;

    // 解析決策
    let parsed = null;
    try {
        const jsonMatch = decision.match(/\{[\s\S]*"recommendation"[\s\S]*\}/);
        if (jsonMatch) {
            parsed = JSON.parse(jsonMatch[0]);
        }
    } catch (e) {
        console.error('解析決策失敗:', e);
    }

    if (parsed) {
        elements.recommendation.textContent = parsed.recommendation;
        elements.confidence.textContent = `${parsed.confidence}%`;
        elements.confidenceChange.textContent = `↑ ${Math.abs(parsed.confidenceChange)}%`;
        elements.riskScore.textContent = `${parsed.riskScore}%`;
        elements.riskChange.textContent = `${parsed.riskChange >= 0 ? '↑' : '↓'} ${Math.abs(parsed.riskChange)}%`;
        elements.targetPrice.textContent = parsed.targetPrice;

        // 美化顯示推理內容
        elements.aiReasoningContent.innerHTML = `
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; line-height: 1.8;">
                <p style="margin: 0; color: #333; font-size: 15px;">${parsed.reasoning}</p>
            </div>
        `;
    } else {
        // 如果無法解析 JSON，使用 formatContent 處理整個內容
        elements.aiReasoningContent.innerHTML = `
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; line-height: 1.8;">
                ${formatContent(decision)}
            </div>
        `;
    }
}

function displayDetailReport() {
    elements.detailSection.style.display = 'block';

    const { agentResults, debate, risk, decision } = analysisData;

    elements.technicalContent.innerHTML = formatContent(agentResults.technical || '無數據');
    elements.fundamentalContent.innerHTML = formatContent(agentResults.fundamental || '無數據');
    elements.sentimentContent.innerHTML = formatContent(agentResults.sentiment || '無數據');
    elements.newsContent.innerHTML = formatContent(agentResults.news || '無數據');

    elements.riskContent.innerHTML = `
        <h4>🐂 多頭論點</h4>
        <div>${formatContent(debate.bullCase)}</div>
        <h4 style="margin-top: 20px;">🐻 空頭論點</h4>
        <div>${formatContent(debate.bearCase)}</div>
        <h4 style="margin-top: 20px;">🛡️ 風險評估</h4>
        <div>${formatContent(risk)}</div>
    `;

    // 投資建議：嘗試解析 JSON 並美化顯示
    let decisionHTML = '';
    try {
        const jsonMatch = decision.match(/\{[\s\S]*"recommendation"[\s\S]*\}/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            decisionHTML = `
                <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                    <h3 style="color: #1976d2; margin-top: 0;">📊 投資決策摘要</h3>
                    <div style="margin-bottom: 15px;">
                        <strong style="color: #1e88e5;">建議操作：</strong>
                        <span style="
                            display: inline-block;
                            padding: 4px 12px;
                            background: ${getRecommendationColor(parsed.recommendation)};
                            color: white;
                            border-radius: 4px;
                            margin-left: 10px;
                        ">${parsed.recommendation}</span>
                    </div>
                    <div style="margin-bottom: 10px;">
                        <strong style="color: #1e88e5;">信心度：</strong> ${parsed.confidence}%
                        ${parsed.confidenceChange ? `<span style="color: #4caf50;">(↑${Math.abs(parsed.confidenceChange)}%)</span>` : ''}
                    </div>
                    <div style="margin-bottom: 10px;">
                        <strong style="color: #1e88e5;">風險評分：</strong> ${parsed.riskScore}%
                        ${parsed.riskChange ? `<span style="color: ${parsed.riskChange >= 0 ? '#f44336' : '#4caf50'};">(${parsed.riskChange >= 0 ? '↑' : '↓'}${Math.abs(parsed.riskChange)}%)</span>` : ''}
                    </div>
                    <div style="margin-bottom: 10px;">
                        <strong style="color: #1e88e5;">目標價格：</strong> ${parsed.targetPrice}
                    </div>
                </div>
                <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #1976d2;">
                    <h4 style="color: #1976d2; margin-top: 0;">💡 分析推理</h4>
                    <p style="line-height: 1.8; color: #333; margin: 0;">${parsed.reasoning}</p>
                </div>
            `;
        } else {
            // 無法解析 JSON，使用 formatContent 處理
            decisionHTML = formatContent(decision);
        }
    } catch (e) {
        console.error('解析投資建議失敗:', e);
        decisionHTML = formatContent(decision);
    }

    elements.recContent.innerHTML = decisionHTML;
}

function formatContent(text) {
    if (!text) return '<p>暫無數據</p>';

    // 移除 JSON 代碼塊標記
    let formatted = text.replace(/```json\s*/g, '');
    formatted = formatted.replace(/```\s*/g, '');

    // 處理 Markdown 標題
    formatted = formatted.replace(/^####\s+(.+)$/gm, '<h4 style="color: #1e88e5; margin-top: 20px; margin-bottom: 10px;">$1</h4>');
    formatted = formatted.replace(/^###\s+(.+)$/gm, '<h3 style="color: #1976d2; margin-top: 20px; margin-bottom: 10px;">$1</h3>');
    formatted = formatted.replace(/^##\s+(.+)$/gm, '<h2 style="color: #1565c0; margin-top: 20px; margin-bottom: 10px;">$1</h2>');
    formatted = formatted.replace(/^#\s+(.+)$/gm, '<h1 style="color: #0d47a1; margin-top: 20px; margin-bottom: 10px;">$1</h1>');

    // 處理粗體文字
    formatted = formatted.replace(/\*\*([^\*]+)\*\*/g, '<strong style="color: #1e88e5;">$1</strong>');

    // 處理有序列表（1. 2. 3.）
    formatted = formatted.replace(/^(\d+)\.\s+(.+)$/gm, '<div style="margin-left: 20px; margin-bottom: 8px;">$1. $2</div>');

    // 處理無序列表（- 或 *）
    formatted = formatted.replace(/^[-*]\s+(.+)$/gm, '<div style="margin-left: 20px; margin-bottom: 8px;">• $1</div>');

    // 處理換行
    formatted = formatted.replace(/\n/g, '<br>');

    return formatted;
}

// ===== 標籤頁切換 =====
function switchTab(tabName) {
    elements.tabBtns.forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));

    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

// ===== 觀察清單管理 =====
function loadWatchlist() {
    const stored = localStorage.getItem(STORAGE_KEYS.WATCHLIST);
    watchlist = stored ? JSON.parse(stored) : [];
    updateWatchlistBadge();
}

function saveWatchlist() {
    localStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
    updateWatchlistBadge();
}

function updateWatchlistBadge() {
    elements.watchlistCount.textContent = watchlist.length;
}

function addCurrentToWatchlist() {
    if (!analysisData) return;

    const exists = watchlist.find(item => item.stock === currentStock && item.market === currentMarket);
    if (exists) {
        showNotification('此股票已在觀察清單中！', 'warning');
        return;
    }

    watchlist.push({
        stock: currentStock,
        market: currentMarket,
        aiScore: analysisData.aiScore.overall,
        recommendation: extractRecommendation(analysisData.decision),
        addedDate: new Date().toISOString(),
        data: analysisData
    });

    saveWatchlist();
    showNotification(`${currentStock} 已加入觀察清單！`, 'success');
}

function extractRecommendation(decision) {
    const match = decision.match(/"recommendation"\s*:\s*"([^"]+)"/);
    return match ? match[1] : '持有';
}

function renderWatchlist() {
    if (watchlist.length === 0) {
        elements.watchlistEmpty.style.display = 'block';
        elements.watchlistContainer.style.display = 'none';
        return;
    }

    elements.watchlistEmpty.style.display = 'none';
    elements.watchlistContainer.style.display = 'grid';

    elements.watchlistContainer.innerHTML = watchlist.map((item, index) => {
        // 如果 market 是 AUTO，嘗試從代碼重新識別
        let displayMarket = item.market;
        if (displayMarket === 'AUTO') {
            const detected = detectMarketFromCode(item.stock);
            displayMarket = detected || 'TW'; // 預設台股
        }

        // 獲取市場圖標
        const marketIcon = displayMarket === 'TW' ? '🇹🇼' :
                          displayMarket === 'US' ? '🇺🇸' :
                          displayMarket === 'HK' ? '🇭🇰' : '📊';

        const marketName = getMarketName(displayMarket);

        return `
        <div class="watchlist-item">
            <div class="watchlist-header">
                <div>
                    <div class="watchlist-title">${marketIcon} ${marketName}: ${item.stock}</div>
                    <div class="watchlist-info">加入日期: ${new Date(item.addedDate).toLocaleDateString()}</div>
                </div>
                <div class="watchlist-actions">
                    <button class="icon-btn" onclick="viewWatchlistItem(${index})" title="查看詳情">👁️</button>
                    <button class="icon-btn" onclick="removeFromWatchlist(${index})" title="移除">🗑️</button>
                </div>
            </div>
            <div class="watchlist-score">${item.aiScore.toFixed(1)}<span style="font-size: 0.5em;">/10</span></div>
            <div class="watchlist-info">
                <strong>建議:</strong> ${item.recommendation}
            </div>
        </div>
    `;
    }).join('');
}

function removeFromWatchlist(index) {
    showConfirm('確定要移除此股票？', () => {
        watchlist.splice(index, 1);
        saveWatchlist();
        renderWatchlist();
        updateStats();
        showNotification('已移除股票', 'success');
    });
}

function viewWatchlistItem(index) {
    analysisData = watchlist[index].data;
    currentStock = watchlist[index].stock;
    currentMarket = watchlist[index].market;
    displayResults();
    switchPage('analysis');
}

// ===== 歷史記錄管理 =====
function loadHistory() {
    const stored = localStorage.getItem(STORAGE_KEYS.HISTORY);
    analysisHistory = stored ? JSON.parse(stored) : [];
    updateHistoryBadge();
}

function saveToHistory(data) {
    analysisHistory.unshift({
        ...data,
        id: Date.now()
    });

    // 最多保留 50 條
    if (analysisHistory.length > 50) {
        analysisHistory = analysisHistory.slice(0, 50);
    }

    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(analysisHistory));
    updateHistoryBadge();
    updateStats();
}

function updateHistoryBadge() {
    elements.historyCount.textContent = analysisHistory.length;
}

function clearHistory() {
    showConfirm('確定要清空所有歷史記錄嗎？此操作無法撤銷！', () => {
        analysisHistory = [];
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(analysisHistory));
        updateHistoryBadge();
        renderHistory();
        updateStats();
        showNotification('歷史記錄已清空', 'success');
    });
}

function renderHistory() {
    if (analysisHistory.length === 0) {
        elements.historyEmpty.style.display = 'block';
        elements.historyContainer.style.display = 'none';
        return;
    }

    elements.historyEmpty.style.display = 'none';
    elements.historyContainer.style.display = 'flex';

    elements.historyContainer.innerHTML = analysisHistory.map((item, index) => {
        // 如果 market 是 AUTO，嘗試從代碼重新識別
        let displayMarket = item.market;
        if (displayMarket === 'AUTO') {
            const detected = detectMarketFromCode(item.stock);
            displayMarket = detected || 'TW'; // 預設台股
        }

        // 獲取市場圖標
        const marketIcon = displayMarket === 'TW' ? '🇹🇼' :
                          displayMarket === 'US' ? '🇺🇸' :
                          displayMarket === 'HK' ? '🇭🇰' : '📊';

        const marketName = getMarketName(displayMarket);

        return `
        <div class="history-item" onclick="viewHistoryItem(${index})">
            <div class="history-info">
                <div class="history-title">${marketIcon} ${marketName}: ${item.stock}</div>
                <div class="history-meta">
                    ${new Date(item.timestamp).toLocaleString()} | 深度: ${item.depth}級
                </div>
            </div>
            <div class="history-result">
                <div class="history-recommendation">${extractRecommendation(item.decision)}</div>
                <div class="history-score">AI評分: ${item.aiScore.overall.toFixed(1)}/10</div>
            </div>
            <button class="icon-btn" onclick="event.stopPropagation(); removeHistory(${index})" title="刪除">🗑️</button>
        </div>
    `;
    }).join('');
}

function viewHistoryItem(index) {
    analysisData = analysisHistory[index];
    currentStock = analysisHistory[index].stock;
    currentMarket = analysisHistory[index].market;
    displayResults();
    switchPage('analysis');
}

function removeHistory(index) {
    showConfirm('確定要刪除此記錄？', () => {
        analysisHistory.splice(index, 1);
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(analysisHistory));
        updateHistoryBadge();
        renderHistory();
        updateStats();
        showNotification('記錄已刪除', 'success');
    });
}

// ===== 統計與儀表板 =====
function updateStats() {
    elements.totalWatchlist.textContent = watchlist.length;
    elements.totalAnalyses.textContent = analysisHistory.length;

    let buyCount = 0;
    let sellCount = 0;

    analysisHistory.forEach(item => {
        const rec = extractRecommendation(item.decision);
        if (rec.includes('買')) buyCount++;
        if (rec.includes('賣')) sellCount++;
    });

    elements.buySignals.textContent = buyCount;
    elements.sellSignals.textContent = sellCount;
}

function renderDashboard() {
    updateStats();

    // 繪製圖表
    renderScoreDistributionChart();
    renderRecommendationChart();
}

// 儲存圖表實例
let scoreDistributionChartInstance = null;
let recommendationChartInstance = null;

function renderScoreDistributionChart() {
    const ctx = document.getElementById('scoreDistributionChart');
    if (!ctx) return;

    // 銷毀舊的圖表實例
    if (scoreDistributionChartInstance) {
        scoreDistributionChartInstance.destroy();
    }

    const scores = watchlist.map(item => item.aiScore);
    const bins = [0, 0, 0, 0, 0]; // 0-2, 2-4, 4-6, 6-8, 8-10

    scores.forEach(score => {
        const index = Math.min(Math.floor(score / 2), 4);
        bins[index]++;
    });

    scoreDistributionChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['0-2', '2-4', '4-6', '6-8', '8-10'],
            datasets: [{
                label: '股票數量',
                data: bins,
                backgroundColor: 'rgba(30, 136, 229, 0.7)',
                borderColor: 'rgba(30, 136, 229, 1)',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}

function renderRecommendationChart() {
    const ctx = document.getElementById('recommendationChart');
    if (!ctx) return;

    // 銷毀舊的圖表實例
    if (recommendationChartInstance) {
        recommendationChartInstance.destroy();
    }

    const recs = analysisHistory.map(item => extractRecommendation(item.decision));
    const counts = {};

    recs.forEach(rec => {
        counts[rec] = (counts[rec] || 0) + 1;
    });

    recommendationChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(counts),
            datasets: [{
                data: Object.values(counts),
                backgroundColor: [
                    'rgba(76, 175, 80, 0.7)',
                    'rgba(255, 152, 0, 0.7)',
                    'rgba(244, 67, 54, 0.7)'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

// ===== 匯出 PDF =====
function exportToPDF() {
    if (!analysisData) {
        showNotification('沒有可匯出的分析數據！', 'warning');
        return;
    }

    showNotification('PDF 匯出功能開發中，敬請期待！您可以使用瀏覽器的列印功能（Ctrl+P）', 'info', 5000);
}

// ===== 檢查 API 狀態 =====
function checkAPIStatus() {
    const statusDot = document.getElementById('api-status-dot');
    const statusText = document.getElementById('api-status-text');
    const apiKey = getApiKey();

    // 同時檢查 localStorage 和 CONFIG
    const hasLocalStorageKey = !!apiKey;
    const hasConfigKey = typeof CONFIG !== 'undefined' && CONFIG.OPENAI_API_KEY && CONFIG.OPENAI_API_KEY !== 'your-api-key-here';
    const hasApiKey = hasLocalStorageKey || hasConfigKey;

    if (hasApiKey) {
        statusDot.style.background = '#4caf50';
        // 顯示 API Key 來源
        if (hasLocalStorageKey) {
            statusText.textContent = 'API 已連接';
        } else {
            statusText.textContent = 'API 已連接 (config.js)';
        }
    } else {
        statusDot.style.background = '#f44336';
        statusText.textContent = 'API 未設置';
    }
}

// ===== API Key 管理 =====
function getApiKey() {
    return localStorage.getItem(STORAGE_KEYS.API_KEY);
}

function saveApiKey(apiKey) {
    localStorage.setItem(STORAGE_KEYS.API_KEY, apiKey);
    checkAPIStatus();
    updateApiKeyStatus();
}

function clearApiKey() {
    localStorage.removeItem(STORAGE_KEYS.API_KEY);
    checkAPIStatus();
    updateApiKeyStatus();
}

function getModel() {
    const savedModel = localStorage.getItem(STORAGE_KEYS.MODEL);
    if (savedModel) return savedModel;

    // 向後兼容：從 CONFIG 讀取
    if (typeof CONFIG !== 'undefined' && CONFIG.MODEL) {
        return CONFIG.MODEL;
    }

    return 'gpt-4o-mini'; // 默認值
}

function saveModel(model) {
    localStorage.setItem(STORAGE_KEYS.MODEL, model);
}

function updateApiKeyStatus() {
    const apiKeyStatus = elements.apiKeyStatus;
    const apiKey = getApiKey();

    // 同時檢查 localStorage 和 CONFIG，與 checkAPIStatus() 保持一致
    const hasLocalStorageKey = !!apiKey;
    const hasConfigKey = typeof CONFIG !== 'undefined' && CONFIG.OPENAI_API_KEY && CONFIG.OPENAI_API_KEY !== 'your-api-key-here';
    const hasApiKey = hasLocalStorageKey || hasConfigKey;

    if (hasApiKey) {
        // 顯示 API Key 來源
        if (hasLocalStorageKey) {
            apiKeyStatus.textContent = '已設定';
        } else {
            apiKeyStatus.textContent = '已設定 (使用 config.js)';
        }
        apiKeyStatus.classList.add('connected');
    } else {
        apiKeyStatus.textContent = '未設定';
        apiKeyStatus.classList.remove('connected');
    }
}

function initSettings() {
    // 加載 API Key 狀態
    updateApiKeyStatus();

    // 加載已保存的 API Key
    let apiKey = getApiKey();

    // 如果 localStorage 沒有，檢查 config.js
    if (!apiKey && typeof CONFIG !== 'undefined' && CONFIG.OPENAI_API_KEY && CONFIG.OPENAI_API_KEY !== 'your-api-key-here') {
        apiKey = CONFIG.OPENAI_API_KEY;
    }

    // 顯示 API Key（完整顯示，因為有顯示/隱藏按鈕）
    if (apiKey && elements.apiKeyInput) {
        elements.apiKeyInput.value = apiKey;
    }

    // 加載模型設置
    const model = getModel();
    if (elements.modelSelect) {
        elements.modelSelect.value = model;
    }

    // 切換顯示/隱藏 API Key
    if (elements.toggleApiKeyBtn) {
        elements.toggleApiKeyBtn.addEventListener('click', () => {
            const input = elements.apiKeyInput;
            if (input.type === 'password') {
                input.type = 'text';
                elements.toggleApiKeyBtn.textContent = '👁️ 隱藏';
            } else {
                input.type = 'password';
                elements.toggleApiKeyBtn.textContent = '👁️ 顯示';
            }
        });
    }

    // 保存 API Key
    if (elements.saveApiKeyBtn) {
        elements.saveApiKeyBtn.addEventListener('click', () => {
            const apiKey = elements.apiKeyInput.value.trim();
            if (!apiKey) {
                showNotification('請輸入 API Key！', 'warning');
                return;
            }

            if (!apiKey.startsWith('sk-')) {
                showNotification('API Key 格式不正確！應該以 "sk-" 開頭。', 'error');
                return;
            }

            saveApiKey(apiKey);
            showNotification('API Key 已保存！', 'success');
        });
    }

    // 清除 API Key
    if (elements.clearApiKeyBtn) {
        elements.clearApiKeyBtn.addEventListener('click', () => {
            showConfirm('確定要清除 API Key 嗎？', () => {
                clearApiKey();
                elements.apiKeyInput.value = '';
                showNotification('API Key 已清除！', 'success');
            });
        });
    }

    // 保存模型選擇
    if (elements.modelSelect) {
        elements.modelSelect.addEventListener('change', () => {
            const model = elements.modelSelect.value;
            saveModel(model);
            console.log('模型已更新為：', model);
        });
    }
}

// ===== 工具函數 =====
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getAgentName(type) {
    const names = {
        technical: '技術分析師',
        fundamental: '基本面分析師',
        news: '新聞分析師',
        sentiment: '情緒分析師'
    };
    return names[type] || type;
}

// ===== 自製通知系統 =====
function showNotification(message, type = 'info', duration = 3000) {
    // 移除舊通知
    const oldNotification = document.getElementById('custom-notification');
    if (oldNotification) {
        oldNotification.remove();
    }

    const colors = {
        success: { bg: '#4caf50', icon: '✓' },
        error: { bg: '#f44336', icon: '✕' },
        warning: { bg: '#ff9800', icon: '⚠' },
        info: { bg: '#2196f3', icon: 'ℹ' }
    };

    const config = colors[type] || colors.info;

    const notification = document.createElement('div');
    notification.id = 'custom-notification';
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${config.bg};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10001;
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 15px;
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
    `;

    notification.innerHTML = `
        <span style="font-size: 20px; font-weight: bold;">${config.icon}</span>
        <span style="flex: 1;">${message}</span>
        <button onclick="this.parentElement.remove()" style="
            background: rgba(255,255,255,0.3);
            border: none;
            color: white;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            cursor: pointer;
            font-size: 16px;
            line-height: 1;
        ">×</button>
    `;

    document.body.appendChild(notification);

    // 自動消失
    if (duration > 0) {
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOut 0.3s ease-out';
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);
    }
}

function showConfirm(message, onConfirm, onCancel) {
    // 移除舊對話框
    const oldDialog = document.getElementById('custom-confirm');
    if (oldDialog) {
        oldDialog.remove();
    }

    const dialog = document.createElement('div');
    dialog.id = 'custom-confirm';
    dialog.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10002;
        animation: fadeIn 0.2s ease-out;
    `;

    dialog.innerHTML = `
        <div style="
            background: white;
            border-radius: 12px;
            padding: 30px;
            max-width: 400px;
            width: 90%;
            box-shadow: 0 8px 24px rgba(0,0,0,0.2);
            animation: scaleIn 0.3s ease-out;
        ">
            <div style="font-size: 18px; color: #333; margin-bottom: 20px; line-height: 1.6;">
                ${message}
            </div>
            <div style="display: flex; gap: 10px; justify-content: flex-end;">
                <button id="confirm-cancel" style="
                    padding: 10px 24px;
                    border: 1px solid #ccc;
                    background: white;
                    color: #666;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.2s;
                ">取消</button>
                <button id="confirm-ok" style="
                    padding: 10px 24px;
                    border: none;
                    background: #1976d2;
                    color: white;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 14px;
                    transition: all 0.2s;
                ">確定</button>
            </div>
        </div>
    `;

    document.body.appendChild(dialog);

    // 添加動畫樣式
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            @keyframes scaleIn {
                from { transform: scale(0.9); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
            #confirm-ok:hover { background: #1565c0; }
            #confirm-cancel:hover { background: #f5f5f5; }
        `;
        document.head.appendChild(style);
    }

    // 綁定事件
    document.getElementById('confirm-ok').onclick = () => {
        dialog.remove();
        if (onConfirm) onConfirm();
    };

    document.getElementById('confirm-cancel').onclick = () => {
        dialog.remove();
        if (onCancel) onCancel();
    };

    // 點擊背景關閉
    dialog.onclick = (e) => {
        if (e.target === dialog) {
            dialog.remove();
            if (onCancel) onCancel();
        }
    };
}

// ===== 股票比較功能 =====
let selectedStocksForCompare = [];

function showCompareSelection() {
    // 合併觀察清單和歷史記錄
    const allStocks = [];

    // 從觀察清單添加
    watchlist.forEach(item => {
        allStocks.push({
            id: `watchlist_${item.stock}_${item.market}`,
            stock: item.stock,
            market: item.market,
            aiScore: item.aiScore,
            recommendation: item.recommendation,
            data: item.data,
            source: '觀察清單'
        });
    });

    // 從歷史記錄添加（避免重複）
    analysisHistory.forEach(item => {
        const exists = allStocks.find(s => s.stock === item.stock && s.market === item.market);
        if (!exists) {
            allStocks.push({
                id: `history_${item.id}`,
                stock: item.stock,
                market: item.market,
                aiScore: item.aiScore.overall,
                recommendation: extractRecommendation(item.decision),
                data: item,
                source: '歷史記錄'
            });
        }
    });

    if (allStocks.length === 0) {
        showNotification('沒有可比較的股票！請先進行分析或加入觀察清單。', 'warning');
        return;
    }

    // 創建選擇對話框
    const dialogHTML = `
        <div id="compare-dialog" style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.7);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        ">
            <div style="
                background: white;
                border-radius: 12px;
                padding: 30px;
                max-width: 600px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
            ">
                <h3 style="margin: 0 0 20px 0; color: #1976d2;">選擇要比較的股票（最多4檔）</h3>
                <div id="stock-selection-list">
                    ${allStocks.map(stock => `
                        <label style="
                            display: flex;
                            align-items: center;
                            padding: 12px;
                            margin-bottom: 10px;
                            border: 2px solid #e0e0e0;
                            border-radius: 8px;
                            cursor: pointer;
                            transition: all 0.2s;
                        " onmouseover="this.style.borderColor='#1976d2'" onmouseout="this.style.borderColor='#e0e0e0'">
                            <input type="checkbox" value="${stock.id}" style="margin-right: 10px;" onchange="updateCompareSelection(this)">
                            <div style="flex: 1;">
                                <div style="font-weight: bold; color: #333;">${stock.market}: ${stock.stock}</div>
                                <div style="font-size: 12px; color: #666; margin-top: 4px;">
                                    來源: ${stock.source} | AI評分: ${stock.aiScore.toFixed(1)}/10 | ${stock.recommendation}
                                </div>
                            </div>
                        </label>
                    `).join('')}
                </div>
                <div style="margin-top: 20px; text-align: right;">
                    <button onclick="cancelCompare()" style="
                        padding: 10px 20px;
                        margin-right: 10px;
                        border: 1px solid #ccc;
                        background: white;
                        border-radius: 4px;
                        cursor: pointer;
                    ">取消</button>
                    <button onclick="confirmCompare()" style="
                        padding: 10px 20px;
                        border: none;
                        background: #1976d2;
                        color: white;
                        border-radius: 4px;
                        cursor: pointer;
                    ">開始比較</button>
                </div>
            </div>
        </div>
    `;

    // 移除舊對話框（如果存在）
    const oldDialog = document.getElementById('compare-dialog');
    if (oldDialog) {
        oldDialog.remove();
    }

    // 添加新對話框
    document.body.insertAdjacentHTML('beforeend', dialogHTML);

    // 保存所有股票數據供後續使用
    window.allStocksForCompare = allStocks;
}

function updateCompareSelection(checkbox) {
    const checkboxes = document.querySelectorAll('#stock-selection-list input[type="checkbox"]');
    const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;

    // 限制最多選擇4個
    if (checkedCount > 4) {
        checkbox.checked = false;
        showNotification('最多只能選擇 4 檔股票進行比較！', 'warning');
    }
}

function cancelCompare() {
    const dialog = document.getElementById('compare-dialog');
    if (dialog) {
        dialog.remove();
    }
    window.allStocksForCompare = null;
}

function confirmCompare() {
    const checkboxes = document.querySelectorAll('#stock-selection-list input[type="checkbox"]:checked');

    if (checkboxes.length < 2) {
        showNotification('請至少選擇 2 檔股票進行比較！', 'warning');
        return;
    }

    const selectedIds = Array.from(checkboxes).map(cb => cb.value);
    const selectedStocks = window.allStocksForCompare.filter(s => selectedIds.includes(s.id));

    // 關閉對話框
    cancelCompare();

    // 顯示比較結果
    displayCompareResults(selectedStocks);
}

function displayCompareResults(stocks) {
    const container = elements.compareContainer;

    // 保留數據供查看詳情使用
    if (!window.allStocksForCompare) {
        window.allStocksForCompare = stocks;
    }

    container.innerHTML = `
        <div style="margin-bottom: 20px;">
            <h3 style="color: #1976d2;">比較 ${stocks.length} 檔股票</h3>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px;">
            ${stocks.map(stock => `
                <div class="compare-card" style="
                    background: white;
                    border-radius: 12px;
                    padding: 20px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                    border: 2px solid ${getRecommendationColor(stock.recommendation)};
                ">
                    <div style="text-align: center; margin-bottom: 15px;">
                        <h3 style="margin: 0 0 5px 0; color: #333;">${stock.market}: ${stock.stock}</h3>
                        <span style="
                            display: inline-block;
                            padding: 4px 12px;
                            background: ${getRecommendationColor(stock.recommendation)};
                            color: white;
                            border-radius: 4px;
                            font-size: 12px;
                        ">${stock.recommendation}</span>
                    </div>

                    <div style="
                        width: 120px;
                        height: 120px;
                        margin: 20px auto;
                        position: relative;
                    ">
                        <svg width="120" height="120">
                            <circle cx="60" cy="60" r="50" fill="none" stroke="#e0e0e0" stroke-width="10"/>
                            <circle cx="60" cy="60" r="50" fill="none" stroke="${getScoreColor(stock.aiScore)}"
                                stroke-width="10" stroke-dasharray="314"
                                stroke-dashoffset="${314 - (stock.aiScore / 10) * 314}"
                                transform="rotate(-90 60 60)"/>
                        </svg>
                        <div style="
                            position: absolute;
                            top: 50%;
                            left: 50%;
                            transform: translate(-50%, -50%);
                            text-align: center;
                        ">
                            <div style="font-size: 28px; font-weight: bold; color: ${getScoreColor(stock.aiScore)};">
                                ${stock.aiScore.toFixed(1)}
                            </div>
                            <div style="font-size: 12px; color: #666;">AI 評分</div>
                        </div>
                    </div>

                    ${stock.data ? `
                        <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e0e0e0;">
                            <div style="margin-bottom: 10px;">
                                <strong style="color: #1976d2;">技術面:</strong> ${stock.data.aiScore.technical.toFixed(1)}/10
                            </div>
                            <div style="margin-bottom: 10px;">
                                <strong style="color: #1976d2;">基本面:</strong> ${stock.data.aiScore.fundamental.toFixed(1)}/10
                            </div>
                            <div style="margin-bottom: 10px;">
                                <strong style="color: #1976d2;">情緒面:</strong> ${stock.data.aiScore.sentiment.toFixed(1)}/10
                            </div>
                        </div>
                    ` : ''}

                    <button onclick="viewStockDetail('${stock.id}')" style="
                        width: 100%;
                        padding: 10px;
                        margin-top: 15px;
                        border: none;
                        background: #1976d2;
                        color: white;
                        border-radius: 4px;
                        cursor: pointer;
                        font-size: 14px;
                    ">查看詳細分析</button>
                </div>
            `).join('')}
        </div>
    `;

    // 滾動到比較結果
    container.scrollIntoView({ behavior: 'smooth' });
}

function getRecommendationColor(recommendation) {
    if (recommendation.includes('買')) return '#4caf50';
    if (recommendation.includes('賣')) return '#f44336';
    return '#ff9800';
}

function getScoreColor(score) {
    if (score >= 8) return '#4caf50';
    if (score >= 6.5) return '#8bc34a';
    if (score >= 5) return '#ff9800';
    if (score >= 3.5) return '#ff5722';
    return '#f44336';
}

function viewStockDetail(stockId) {
    // 檢查數據是否存在
    if (!window.allStocksForCompare) {
        showNotification('數據已過期，請重新選擇股票比較！', 'warning');
        return;
    }

    const stock = window.allStocksForCompare.find(s => s.id === stockId);
    if (!stock || !stock.data) {
        showNotification('找不到詳細數據！', 'error');
        return;
    }

    // 設置為當前分析數據
    analysisData = stock.data;
    currentStock = stock.stock;
    currentMarket = stock.market;

    // 顯示結果
    displayResults();

    // 切換到分析頁面
    switchPage('analysis');
}

// ===== 完整股票資料庫載入系統 =====
let fullStockDatabase = {
    TW: [],
    US: []
};

async function loadFullStockDatabase() {
    try {
        // 檢查快取
        const timestamp = localStorage.getItem(STORAGE_KEYS.STOCK_DB_TIMESTAMP);
        const now = Date.now();

        if (timestamp && (now - parseInt(timestamp)) < STOCK_DB_CONFIG.CACHE_DURATION) {
            // 使用快取
            const cachedTW = localStorage.getItem(STORAGE_KEYS.STOCK_DB_TW);
            const cachedUS = localStorage.getItem(STORAGE_KEYS.STOCK_DB_US);

            if (cachedTW) fullStockDatabase.TW = JSON.parse(cachedTW);
            if (cachedUS) fullStockDatabase.US = JSON.parse(cachedUS);

            console.log('📦 使用快取的股票資料庫');
            console.log(`台股: ${fullStockDatabase.TW.length} 支, 美股: ${fullStockDatabase.US.length} 支`);
            return;
        }

        // 載入新資料
        console.log('🔄 載入完整股票資料庫...');

        // 載入台股
        await loadTaiwanStocks();

        // 載入美股（擴充版）
        loadUSStocks();

        // 儲存快取
        localStorage.setItem(STORAGE_KEYS.STOCK_DB_TW, JSON.stringify(fullStockDatabase.TW));
        localStorage.setItem(STORAGE_KEYS.STOCK_DB_US, JSON.stringify(fullStockDatabase.US));
        localStorage.setItem(STORAGE_KEYS.STOCK_DB_TIMESTAMP, now.toString());

        console.log('✅ 股票資料庫載入完成');
        console.log(`台股: ${fullStockDatabase.TW.length} 支, 美股: ${fullStockDatabase.US.length} 支`);

    } catch (error) {
        console.error('❌ 載入股票資料庫失敗:', error);
        // 使用內建資料庫
        fullStockDatabase.TW = STOCK_DATABASE.TW;
        fullStockDatabase.US = STOCK_DATABASE.US;
        console.log('📦 使用內建資料庫');
    }
}

async function loadTaiwanStocks() {
    try {
        // 方法1: 嘗試從台灣證交所 API 載入
        const response = await fetch(STOCK_DB_CONFIG.TW_API_URL, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();

            // 轉換格式
            fullStockDatabase.TW = data.map(stock => ({
                code: stock.Code || stock.code,
                name: stock.Name || stock.name,
                nameEn: stock.NameEn || stock.nameEn || ''
            })).filter(stock => stock.code && stock.name);

            console.log(`✅ 從 API 載入 ${fullStockDatabase.TW.length} 支台股`);
            return;
        }
    } catch (error) {
        console.warn('⚠️ API 載入失敗，使用擴充資料庫');
    }

    // 方法2: 使用擴充的內建資料庫
    fullStockDatabase.TW = getExtendedTaiwanStocks();
}

function getExtendedTaiwanStocks() {
    // 擴充台股資料庫（包含更多常見股票）
    return [
        ...STOCK_DATABASE.TW,
        // 科技股
        { code: '2327', name: '國巨', nameEn: 'Yageo' },
        { code: '2409', name: '友達', nameEn: 'AUO' },
        { code: '2474', name: '可成', nameEn: 'Catcher' },
        { code: '3034', name: '聯詠', nameEn: 'Novatek' },
        { code: '3045', name: '台灣大', nameEn: 'Taiwan Mobile' },
        { code: '6669', name: '緯穎', nameEn: 'Wiwynn' },

        // 金融股
        { code: '2834', name: '臺企銀', nameEn: 'Taiwan Business Bank' },
        { code: '2883', name: '開發金', nameEn: 'CDIB FHC' },
        { code: '2884', name: '玉山金', nameEn: 'E.SUN FHC' },
        { code: '2885', name: '元大金', nameEn: 'Yuanta FHC' },
        { code: '2887', name: '台新金', nameEn: 'Taishin FHC' },
        { code: '2892', name: '第一金', nameEn: 'First FHC' },

        // 傳產股
        { code: '1216', name: '統一', nameEn: 'Uni-President' },
        { code: '1326', name: '台化', nameEn: 'Taiwan Fertilizer' },
        { code: '2002', name: '中鋼', nameEn: 'China Steel' },
        { code: '2207', name: '和泰車', nameEn: 'Hotai Motor' },
        { code: '2301', name: '光寶科', nameEn: 'Lite-On' },
        { code: '2324', name: '仁寶', nameEn: 'Compal' },
        { code: '2408', name: '南亞科', nameEn: 'Nanya Tech' },
        { code: '2603', name: '長榮', nameEn: 'Evergreen Marine' },
        { code: '2609', name: '陽明', nameEn: 'Yang Ming' },

        // ETF
        { code: '0051', name: '元大中型100', nameEn: 'Yuanta Taiwan Mid-Cap 100 ETF' },
        { code: '0052', name: '富邦科技', nameEn: 'Fubon TWSE Taiwan Tech ETF' },
        { code: '006208', name: '富邦台50', nameEn: 'Fubon TWSE Taiwan 50 ETF' },
        { code: '00631L', name: '元大台灣50正2', nameEn: 'Yuanta Taiwan 50 2X ETF' },
        { code: '00878', name: '國泰永續高股息', nameEn: 'Cathay MSCI Taiwan ESG Sustainability High Dividend Yield ETF' },
        { code: '00679B', name: '元大美債20年', nameEn: 'Yuanta 20+ Year U.S. Treasury Bond ETF' }
    ];
}

function loadUSStocks() {
    // 擴充美股資料庫
    fullStockDatabase.US = [
        ...STOCK_DATABASE.US,
        // FAANG+
        { code: 'GOOG', name: 'Alphabet (Google) Class C', nameCn: '谷歌C股' },
        { code: 'FB', name: 'Meta (Facebook) - Legacy', nameCn: 'Meta舊代碼' },

        // 科技巨頭
        { code: 'CRM', name: 'Salesforce', nameCn: 'Salesforce' },
        { code: 'ADBE', name: 'Adobe', nameCn: 'Adobe' },
        { code: 'ORCL', name: 'Oracle', nameCn: '甲骨文' },
        { code: 'IBM', name: 'IBM', nameCn: 'IBM' },
        { code: 'CSCO', name: 'Cisco', nameCn: '思科' },
        { code: 'QCOM', name: 'Qualcomm', nameCn: '高通' },
        { code: 'TXN', name: 'Texas Instruments', nameCn: '德州儀器' },
        { code: 'AVGO', name: 'Broadcom', nameCn: '博通' },

        // 電動車與能源
        { code: 'RIVN', name: 'Rivian', nameCn: 'Rivian' },
        { code: 'LCID', name: 'Lucid Motors', nameCn: 'Lucid' },
        { code: 'F', name: 'Ford', nameCn: '福特' },
        { code: 'GM', name: 'General Motors', nameCn: '通用汽車' },

        // 金融
        { code: 'BAC', name: 'Bank of America', nameCn: '美國銀行' },
        { code: 'WFC', name: 'Wells Fargo', nameCn: '富國銀行' },
        { code: 'GS', name: 'Goldman Sachs', nameCn: '高盛' },
        { code: 'MS', name: 'Morgan Stanley', nameCn: '摩根士丹利' },
        { code: 'C', name: 'Citigroup', nameCn: '花旗' },

        // 消費品
        { code: 'KO', name: 'Coca-Cola', nameCn: '可口可樂' },
        { code: 'PEP', name: 'PepsiCo', nameCn: '百事可樂' },
        { code: 'MCD', name: 'McDonald\'s', nameCn: '麥當勞' },
        { code: 'SBUX', name: 'Starbucks', nameCn: '星巴克' },

        // 醫療保健
        { code: 'UNH', name: 'UnitedHealth', nameCn: '聯合健康' },
        { code: 'PFE', name: 'Pfizer', nameCn: '輝瑞' },
        { code: 'MRNA', name: 'Moderna', nameCn: 'Moderna' },
        { code: 'ABBV', name: 'AbbVie', nameCn: '艾伯維' },

        // 零售
        { code: 'TGT', name: 'Target', nameCn: 'Target' },
        { code: 'HD', name: 'Home Depot', nameCn: '家得寶' },
        { code: 'LOW', name: 'Lowe\'s', nameCn: '勞氏' },

        // 能源
        { code: 'XOM', name: 'Exxon Mobil', nameCn: '埃克森美孚' },
        { code: 'CVX', name: 'Chevron', nameCn: '雪佛龍' },

        // 中概股
        { code: 'PDD', name: 'Pinduoduo', nameCn: '拼多多' },
        { code: 'JD', name: 'JD.com', nameCn: '京東' },
        { code: 'BIDU', name: 'Baidu', nameCn: '百度' },
        { code: 'NIO', name: 'NIO', nameCn: '蔚來' },

        // ETF
        { code: 'SPY', name: 'SPDR S&P 500 ETF', nameCn: 'S&P 500 ETF' },
        { code: 'QQQ', name: 'Invesco QQQ Trust', nameCn: '那斯達克100 ETF' },
        { code: 'VOO', name: 'Vanguard S&P 500 ETF', nameCn: 'Vanguard S&P 500' },
        { code: 'VTI', name: 'Vanguard Total Stock Market ETF', nameCn: 'Vanguard 全市場' },
        { code: 'IWM', name: 'iShares Russell 2000 ETF', nameCn: '羅素2000 ETF' }
    ];
}

// ===== 智能建議列表 =====
function initStockAutocomplete() {
    const stockInput = elements.stockInput;
    const marketSelect = elements.marketSelect;

    // 創建建議列表容器
    const suggestionBox = document.createElement('div');
    suggestionBox.id = 'stock-suggestions';
    suggestionBox.style.cssText = `
        position: absolute;
        background: white;
        border: 2px solid #1976d2;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        max-height: 300px;
        overflow-y: auto;
        z-index: 1000;
        display: none;
        width: ${stockInput.offsetWidth}px;
    `;

    // 插入到輸入框後面
    stockInput.parentElement.style.position = 'relative';
    stockInput.parentElement.appendChild(suggestionBox);

    // 輸入事件
    stockInput.addEventListener('input', (e) => {
        const query = e.target.value.trim().toUpperCase();
        const market = marketSelect.value;

        if (query.length === 0) {
            suggestionBox.style.display = 'none';
            return;
        }

        const suggestions = searchStocks(query, market);
        displaySuggestions(suggestions, suggestionBox, stockInput);
    });

    // 點擊外部關閉建議列表
    document.addEventListener('click', (e) => {
        if (e.target !== stockInput && !suggestionBox.contains(e.target)) {
            suggestionBox.style.display = 'none';
        }
    });

    // 市場切換時更新建議
    marketSelect.addEventListener('change', () => {
        if (stockInput.value.trim()) {
            const query = stockInput.value.trim().toUpperCase();
            const suggestions = searchStocks(query, marketSelect.value);
            displaySuggestions(suggestions, suggestionBox, stockInput);
        }
    });
}

function searchStocks(query, market) {
    // 自動識別模式：同時搜尋台股和美股
    if (market === 'AUTO') {
        const twResults = searchStocksInMarket(query, 'TW');
        const usResults = searchStocksInMarket(query, 'US');

        // 合併結果並標記市場
        const combined = [
            ...twResults.map(s => ({ ...s, market: 'TW' })),
            ...usResults.map(s => ({ ...s, market: 'US' }))
        ];

        return combined.slice(0, 10); // 最多顯示10個
    }

    // 手動選擇模式：只搜尋指定市場
    return searchStocksInMarket(query, market);
}

function searchStocksInMarket(query, market) {
    // 優先使用完整資料庫，如果沒有則使用內建資料庫
    const stocks = (fullStockDatabase[market] && fullStockDatabase[market].length > 0)
        ? fullStockDatabase[market]
        : STOCK_DATABASE[market] || [];

    // 只搜尋代碼，不搜尋名稱
    return stocks.filter(stock => {
        return stock.code.includes(query);
    }).slice(0, 5); // 每個市場最多5個
}

function displaySuggestions(suggestions, suggestionBox, stockInput) {
    if (suggestions.length === 0) {
        suggestionBox.style.display = 'none';
        return;
    }

    const selectedMarket = elements.marketSelect.value;

    suggestionBox.innerHTML = suggestions.map(stock => {
        // 判斷股票來自哪個市場（自動識別模式下會有 market 屬性）
        const stockMarket = stock.market || selectedMarket;

        // 根據市場決定顯示名稱
        const displayName = stockMarket === 'TW'
            ? `${stock.name} (${stock.nameEn || ''})`
            : `${stock.name}${stock.nameCn ? ' (' + stock.nameCn + ')' : ''}`;

        // 市場標籤（只在自動識別模式下顯示）
        const marketBadge = selectedMarket === 'AUTO'
            ? `<span style="
                display: inline-block;
                padding: 2px 8px;
                background: ${stockMarket === 'TW' ? '#4caf50' : '#2196f3'};
                color: white;
                border-radius: 12px;
                font-size: 10px;
                margin-left: 8px;
            ">${stockMarket === 'TW' ? '🇹🇼 台股' : '🇺🇸 美股'}</span>`
            : '';

        return `
            <div class="suggestion-item" data-code="${stock.code}" data-market="${stockMarket}" style="
                padding: 12px 16px;
                cursor: pointer;
                border-bottom: 1px solid #f0f0f0;
                transition: background 0.2s;
            " onmouseover="this.style.background='#f5f5f5'" onmouseout="this.style.background='white'">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div style="flex: 1;">
                        <div style="display: flex; align-items: center;">
                            <span style="font-weight: bold; color: #1976d2; font-size: 14px;">${stock.code}</span>
                            ${marketBadge}
                        </div>
                        <div style="font-size: 12px; color: #666; margin-top: 2px;">${displayName}</div>
                    </div>
                    <div style="color: #1976d2; font-size: 20px;">→</div>
                </div>
            </div>
        `;
    }).join('');

    suggestionBox.style.display = 'block';

    // 綁定點擊事件
    suggestionBox.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', () => {
            stockInput.value = item.dataset.code;

            // 如果是自動識別模式，自動切換到對應的市場
            if (selectedMarket === 'AUTO') {
                const detectedMarket = item.dataset.market;
                elements.marketSelect.value = detectedMarket;
                showNotification(`已自動切換為${getMarketName(detectedMarket)}`, 'success', 2000);
            }

            suggestionBox.style.display = 'none';
            stockInput.focus();
        });
    });
}

// ===== 市場與代碼驗證 =====
function detectMarketFromCode(code) {
    // 移除可能的後綴並分析
    let cleanCode = code;
    let explicitMarket = null;

    // 方案 D: 後綴識別
    if (code.includes('.')) {
        const parts = code.split('.');
        cleanCode = parts[0];
        const suffix = parts[1] ? parts[1].toUpperCase() : '';

        if (suffix === 'TW') explicitMarket = 'TW';
        else if (suffix === 'US') explicitMarket = 'US';
        else if (suffix === 'HK') explicitMarket = 'HK';
    }

    // 如果有明確後綴，直接返回
    if (explicitMarket) {
        return explicitMarket;
    }

    // 方案 A: 擴展識別規則
    const isTaiwanFormat = /^\d{4,6}$/.test(cleanCode);  // 4-6位數字（涵蓋 ETF）
    const isUSFormat = /^[A-Z]{1,5}$/.test(cleanCode);    // 1-5個字母
    const isHKFormat = /^\d{4}$/.test(cleanCode);         // 4位數字（港股）

    // 5-6位數字 → 台股 ETF
    if (cleanCode.length >= 5 && isTaiwanFormat) {
        return 'TW';
    }

    // 字母 → 美股
    if (isUSFormat) {
        return 'US';
    }

    // 4位數字 → 方案 C: 優先級策略（台股 > 港股）
    if (isHKFormat) {
        // 先檢查台股資料庫是否存在
        const existsInTW = checkStockExistsInMarket(cleanCode, 'TW');
        if (existsInTW) {
            return 'TW';
        }

        // 再檢查港股（目前沒有港股資料庫，預設返回台股）
        return 'TW';
    }

    return null;
}

// 檢查代碼是否存在於指定市場資料庫
function checkStockExistsInMarket(code, market) {
    const stocks = (fullStockDatabase[market] && fullStockDatabase[market].length > 0)
        ? fullStockDatabase[market]
        : STOCK_DATABASE[market] || [];

    return stocks.some(stock => stock.code === code);
}

// 驗證股票代碼是否存在（僅支援代碼搜尋）
function validateStockExists(input, market) {
    const cleanInput = input.trim().toUpperCase();

    // 移除可能的後綴
    const codeOnly = cleanInput.split('.')[0];

    // 如果市場是 AUTO，需要同時檢查所有市場
    const marketsToCheck = market === 'AUTO' ? ['TW', 'US'] : [market];

    // 只檢查代碼匹配
    for (const mkt of marketsToCheck) {
        const stocks = (fullStockDatabase[mkt] && fullStockDatabase[mkt].length > 0)
            ? fullStockDatabase[mkt]
            : STOCK_DATABASE[mkt] || [];

        const codeMatch = stocks.find(stock => stock.code === codeOnly);

        if (codeMatch) {
            return {
                exists: true,
                market: mkt,
                stock: codeMatch,
                matchType: 'code'
            };
        }
    }

    return {
        exists: false,
        message: `找不到股票代碼「${codeOnly}」`
    };
}

function validateMarketMatch(selectedMarket, stockCode) {
    const detectedMarket = detectMarketFromCode(stockCode);

    if (!detectedMarket) {
        return { valid: true, warning: '無法識別代碼格式，將使用選擇的市場進行分析' };
    }

    if (detectedMarket !== selectedMarket) {
        return {
            valid: false,
            detectedMarket: detectedMarket,
            selectedMarket: selectedMarket,
            message: `您選擇了${getMarketName(selectedMarket)}，但輸入的代碼「${stockCode}」看起來像${getMarketName(detectedMarket)}格式`
        };
    }

    return { valid: true };
}

function getMarketName(market) {
    return market === 'TW' ? '台股' : '美股';
}

function showMarketMismatchDialog(validation, stockCode, onConfirm) {
    const dialog = document.createElement('div');
    dialog.id = 'market-mismatch-dialog';
    dialog.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10003;
        animation: fadeIn 0.2s ease-out;
    `;

    dialog.innerHTML = `
        <div style="
            background: white;
            border-radius: 16px;
            padding: 30px;
            max-width: 450px;
            width: 90%;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            animation: scaleIn 0.3s ease-out;
        ">
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 48px; margin-bottom: 10px;">🤔</div>
                <h3 style="margin: 0; color: #f57c00; font-size: 20px;">代碼與市場不匹配</h3>
            </div>

            <div style="background: #fff3e0; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <div style="margin-bottom: 12px;">
                    <strong style="color: #e65100;">您選擇的市場：</strong>
                    <span style="color: #333; font-size: 16px;">${getMarketName(validation.selectedMarket)}</span>
                </div>
                <div style="margin-bottom: 12px;">
                    <strong style="color: #e65100;">輸入的代碼：</strong>
                    <span style="color: #333; font-size: 18px; font-weight: bold;">${stockCode}</span>
                </div>
                <div>
                    <strong style="color: #e65100;">檢測到格式：</strong>
                    <span style="color: #1976d2; font-size: 16px; font-weight: bold;">${getMarketName(validation.detectedMarket)}</span>
                </div>
            </div>

            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin-bottom: 25px;">
                <div style="font-size: 14px; color: #1565c0; line-height: 1.6;">
                    💡 <strong>建議：</strong>我們偵測到您輸入的代碼格式更像${getMarketName(validation.detectedMarket)}。您想要：
                </div>
            </div>

            <div style="display: flex; gap: 12px; justify-content: center;">
                <button id="mismatch-keep" style="
                    flex: 1;
                    padding: 12px 20px;
                    border: 2px solid #1976d2;
                    background: white;
                    color: #1976d2;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 15px;
                    font-weight: bold;
                    transition: all 0.2s;
                " onmouseover="this.style.background='#f5f5f5'" onmouseout="this.style.background='white'">
                    保持 ${getMarketName(validation.selectedMarket)}
                </button>
                <button id="mismatch-switch" style="
                    flex: 1;
                    padding: 12px 20px;
                    border: none;
                    background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
                    color: white;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 15px;
                    font-weight: bold;
                    transition: all 0.2s;
                    box-shadow: 0 4px 12px rgba(25, 118, 210, 0.3);
                " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 6px 16px rgba(25, 118, 210, 0.4)'"
                   onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 4px 12px rgba(25, 118, 210, 0.3)'">
                    切換為 ${getMarketName(validation.detectedMarket)} ⭐
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(dialog);

    // 綁定事件
    document.getElementById('mismatch-keep').onclick = () => {
        dialog.remove();
        onConfirm(validation.selectedMarket);
    };

    document.getElementById('mismatch-switch').onclick = () => {
        dialog.remove();
        // 切換市場選擇
        elements.marketSelect.value = validation.detectedMarket;
        showNotification(`已自動切換為${getMarketName(validation.detectedMarket)}`, 'success');
        onConfirm(validation.detectedMarket);
    };

    // 點擊背景不關閉（強制選擇）
}

// ===== 股票不存在錯誤對話框 =====
function showStockNotFoundDialog(stockCode, market) {
    const dialog = document.createElement('div');
    dialog.id = 'stock-not-found-dialog';
    dialog.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.6);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10003;
        animation: fadeIn 0.2s ease-out;
    `;

    // 獲取建議的相似股票
    const suggestions = searchStocksInMarket(stockCode.substring(0, 3), market).slice(0, 5);
    const suggestionsHTML = suggestions.length > 0
        ? `
        <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e0e0e0;">
            <h4 style="margin: 0 0 12px 0; color: #1976d2; font-size: 14px;">💡 您可能在找：</h4>
            ${suggestions.map(s => `
                <div style="
                    padding: 8px 12px;
                    margin-bottom: 8px;
                    background: #f5f5f5;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: background 0.2s;
                " onmouseover="this.style.background='#e3f2fd'" onmouseout="this.style.background='#f5f5f5'"
                   onclick="selectSuggestedStock('${s.code}', '${market}')">
                    <strong style="color: #1976d2;">${s.code}</strong> - ${s.name}
                </div>
            `).join('')}
        </div>
        `
        : '';

    dialog.innerHTML = `
        <div style="
            background: white;
            border-radius: 16px;
            padding: 30px;
            max-width: 450px;
            width: 90%;
            box-shadow: 0 8px 32px rgba(0,0,0,0.3);
            animation: scaleIn 0.3s ease-out;
        ">
            <div style="text-align: center; margin-bottom: 20px;">
                <div style="font-size: 64px; margin-bottom: 10px;">❌</div>
                <h3 style="margin: 0; color: #f44336; font-size: 22px;">找不到股票</h3>
            </div>

            <div style="background: #ffebee; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <div style="margin-bottom: 10px;">
                    <strong style="color: #c62828;">輸入的代碼：</strong>
                    <span style="color: #333; font-size: 18px; font-weight: bold;">${stockCode}</span>
                </div>
                <div>
                    <strong style="color: #c62828;">選擇的市場：</strong>
                    <span style="color: #333; font-size: 16px;">${getMarketName(market)}</span>
                </div>
            </div>

            <div style="background: #fff3e0; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
                <div style="font-size: 14px; color: #e65100; line-height: 1.8;">
                    <strong>📌 可能的原因：</strong><br>
                    • 股票代碼輸入錯誤<br>
                    • 該股票不在我們的資料庫中<br>
                    • 選擇的市場不正確<br>
                    • 使用了錯誤的市場後綴（如 .TW, .US）<br><br>
                    <strong>💡 提示：</strong>僅支援股票代碼搜尋<br>
                    （如：2330、AAPL、00878）
                </div>
            </div>

            ${suggestionsHTML}

            <div style="display: flex; gap: 12px; justify-content: center; margin-top: 25px;">
                <button onclick="closeStockNotFoundDialog()" style="
                    flex: 1;
                    padding: 12px 20px;
                    border: none;
                    background: #1976d2;
                    color: white;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 15px;
                    font-weight: bold;
                    transition: all 0.2s;
                " onmouseover="this.style.background='#1565c0'" onmouseout="this.style.background='#1976d2'">
                    重新輸入
                </button>
            </div>
        </div>
    `;

    document.body.appendChild(dialog);

    // 點擊背景關閉
    dialog.onclick = (e) => {
        if (e.target === dialog) {
            dialog.remove();
        }
    };
}

function closeStockNotFoundDialog() {
    const dialog = document.getElementById('stock-not-found-dialog');
    if (dialog) {
        dialog.remove();
    }
    // 聚焦到輸入框
    elements.stockInput.focus();
    elements.stockInput.select();
}

function selectSuggestedStock(code, market) {
    closeStockNotFoundDialog();
    elements.stockInput.value = code;
    elements.marketSelect.value = market;
    showNotification(`已選擇：${code}`, 'success', 2000);
}

// ===== 全局函數（供 HTML 調用）=====
window.removeFromWatchlist = removeFromWatchlist;
window.viewWatchlistItem = viewWatchlistItem;
window.viewHistoryItem = viewHistoryItem;
window.removeHistory = removeHistory;
window.updateCompareSelection = updateCompareSelection;
window.cancelCompare = cancelCompare;
window.confirmCompare = confirmCompare;
window.viewStockDetail = viewStockDetail;
window.closeStockNotFoundDialog = closeStockNotFoundDialog;
window.selectSuggestedStock = selectSuggestedStock;
