// ===== 全局變量 =====
let analysisData = null;
let currentStock = '';
let currentMarket = '';
let watchlist = [];
let analysisHistory = [];

// ===== LocalStorage 鍵名 =====
const STORAGE_KEYS = {
    WATCHLIST: 'ai_investment_watchlist',
    HISTORY: 'ai_investment_history'
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
    quickSearchBtn: document.getElementById('quick-search-btn')
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
    const market = elements.marketSelect.value;
    const stock = elements.stockInput.value.trim().toUpperCase();
    const date = elements.analysisDate.value;
    const depth = elements.depthSlider.value;

    if (!stock) {
        alert('請輸入股票代碼！');
        return;
    }

    const selectedAgents = getSelectedAgents();
    if (selectedAgents.length === 0) {
        alert('請至少選擇一個分析師！');
        return;
    }

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
        alert('分析過程中發生錯誤：' + error.message);
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
        await sleep(800);
    }

    // 多空辯論
    updateProgress(75, '多空辯論研究中', startTime);
    const debate = await runDebate(agentResults, market, stock);
    await sleep(1000);

    // 風險評估
    updateProgress(85, '風險管理評估', startTime);
    const risk = await runRiskManagement(agentResults, debate);
    await sleep(800);

    // 最終決策
    updateProgress(95, '生成最終投資建議', startTime);
    const decision = await runPortfolioManager(agentResults, debate, risk, market, stock);
    await sleep(800);

    // 完成
    updateProgress(100, '分析完成', startTime);

    // 計算 AI 評分
    const aiScore = calculateAIScore(agentResults, decision);

    // 保存數據
    analysisData = {
        stock,
        market,
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
        const [bullCase, bearCase] = await Promise.all([
            callChatGPT(bullPrompt),
            callChatGPT(bearPrompt)
        ]);
        return { bullCase, bearCase };
    } catch (error) {
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

async function callChatGPT(prompt) {
    if (!CONFIG.OPENAI_API_KEY || CONFIG.OPENAI_API_KEY === 'your-api-key-here') {
        throw new Error('請先在 config.js 中設置您的 OpenAI API Key');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${CONFIG.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: CONFIG.MODEL || 'gpt-4o-mini',
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
        throw new Error(`API 調用失敗: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

// ===== 計算 AI 評分 =====
function calculateAIScore(agentResults, decision) {
    // 從各個分析師的回應中提取評分
    const scores = {
        technical: extractScore(agentResults.technical),
        fundamental: extractScore(agentResults.fundamental),
        sentiment: extractScore(agentResults.sentiment)
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
    }

    elements.aiReasoningContent.innerHTML = `<pre style="white-space: pre-wrap; line-height: 1.8;">${decision}</pre>`;
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

    elements.recContent.innerHTML = formatContent(decision);
}

function formatContent(text) {
    if (!text) return '<p>暫無數據</p>';
    let formatted = text.replace(/\n/g, '<br>');
    formatted = formatted.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
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
        alert('此股票已在觀察清單中！');
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
    alert(`${currentStock} 已加入觀察清單！`);
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

    elements.watchlistContainer.innerHTML = watchlist.map((item, index) => `
        <div class="watchlist-item">
            <div class="watchlist-header">
                <div>
                    <div class="watchlist-title">${item.market}: ${item.stock}</div>
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
    `).join('');
}

function removeFromWatchlist(index) {
    if (confirm('確定要移除此股票？')) {
        watchlist.splice(index, 1);
        saveWatchlist();
        renderWatchlist();
        updateStats();
    }
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
    if (confirm('確定要清空所有歷史記錄嗎？此操作無法撤銷！')) {
        analysisHistory = [];
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(analysisHistory));
        updateHistoryBadge();
        renderHistory();
        updateStats();
    }
}

function renderHistory() {
    if (analysisHistory.length === 0) {
        elements.historyEmpty.style.display = 'block';
        elements.historyContainer.style.display = 'none';
        return;
    }

    elements.historyEmpty.style.display = 'none';
    elements.historyContainer.style.display = 'flex';

    elements.historyContainer.innerHTML = analysisHistory.map((item, index) => `
        <div class="history-item" onclick="viewHistoryItem(${index})">
            <div class="history-info">
                <div class="history-title">${item.market}: ${item.stock}</div>
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
    `).join('');
}

function viewHistoryItem(index) {
    analysisData = analysisHistory[index];
    currentStock = analysisHistory[index].stock;
    currentMarket = analysisHistory[index].market;
    displayResults();
    switchPage('analysis');
}

function removeHistory(index) {
    if (confirm('確定要刪除此記錄？')) {
        analysisHistory.splice(index, 1);
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(analysisHistory));
        updateHistoryBadge();
        renderHistory();
        updateStats();
    }
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

function renderScoreDistributionChart() {
    const ctx = document.getElementById('scoreDistributionChart');
    if (!ctx) return;

    const scores = watchlist.map(item => item.aiScore);
    const bins = [0, 0, 0, 0, 0]; // 0-2, 2-4, 4-6, 6-8, 8-10

    scores.forEach(score => {
        const index = Math.min(Math.floor(score / 2), 4);
        bins[index]++;
    });

    new Chart(ctx, {
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

    const recs = analysisHistory.map(item => extractRecommendation(item.decision));
    const counts = {};

    recs.forEach(rec => {
        counts[rec] = (counts[rec] || 0) + 1;
    });

    new Chart(ctx, {
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
        alert('沒有可匯出的分析數據！');
        return;
    }

    alert('PDF 匯出功能開發中，敬請期待！\n\n您可以：\n1. 截圖保存報告\n2. 複製文字內容\n3. 使用瀏覽器的列印功能（Ctrl+P）');
}

// ===== 檢查 API 狀態 =====
function checkAPIStatus() {
    const statusDot = document.getElementById('api-status-dot');
    const statusText = document.getElementById('api-status-text');

    if (CONFIG.OPENAI_API_KEY && CONFIG.OPENAI_API_KEY !== 'your-api-key-here') {
        statusDot.style.background = '#4caf50';
        statusText.textContent = 'API 已連接';
    } else {
        statusDot.style.background = '#f44336';
        statusText.textContent = 'API 未設置';
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

// ===== 全局函數（供 HTML 調用）=====
window.removeFromWatchlist = removeFromWatchlist;
window.viewWatchlistItem = viewWatchlistItem;
window.viewHistoryItem = viewHistoryItem;
window.removeHistory = removeHistory;
