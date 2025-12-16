// ===== 全局變量 =====
let analysisData = null;
let currentStock = '';
let currentMarket = '';

// ===== DOM 元素 =====
const elements = {
    // 配置區
    marketSelect: document.getElementById('market-select'),
    stockInput: document.getElementById('stock-input'),
    analysisDate: document.getElementById('analysis-date'),
    depthSlider: document.getElementById('depth-slider'),
    startBtn: document.getElementById('start-analysis-btn'),

    // Agent 選擇
    agentTechnical: document.getElementById('agent-technical'),
    agentFundamental: document.getElementById('agent-fundamental'),
    agentNews: document.getElementById('agent-news'),
    agentSentiment: document.getElementById('agent-sentiment'),
    selectedCount: document.querySelector('.selected-count'),

    // 區塊顯示
    configSection: document.getElementById('config-section'),
    progressSection: document.getElementById('progress-section'),
    summarySection: document.getElementById('summary-section'),
    detailSection: document.getElementById('detail-section'),

    // 進度區
    analysisId: document.getElementById('analysis-id'),
    currentStepText: document.getElementById('current-step-text'),
    progressPercent: document.getElementById('progress-percent'),
    elapsedTime: document.getElementById('elapsed-time'),
    remainingTime: document.getElementById('remaining-time'),
    progressBar: document.getElementById('progress-bar'),
    viewReportBtn: document.getElementById('view-report-btn'),

    // 摘要區
    stockTitle: document.getElementById('stock-title'),
    recommendation: document.getElementById('recommendation'),
    confidence: document.getElementById('confidence'),
    confidenceChange: document.getElementById('confidence-change'),
    riskScore: document.getElementById('risk-score'),
    riskChange: document.getElementById('risk-change'),
    targetPrice: document.getElementById('target-price'),
    aiReasoningContent: document.getElementById('ai-reasoning-content'),

    // 詳細報告區
    technicalContent: document.getElementById('technical-content'),
    fundamentalContent: document.getElementById('fundamental-content'),
    sentimentContent: document.getElementById('sentiment-content'),
    newsContent: document.getElementById('news-content'),
    riskContent: document.getElementById('risk-content'),
    recommendationContent: document.getElementById('recommendation-content')
};

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', () => {
    // 設置今天日期
    const today = new Date().toISOString().split('T')[0];
    elements.analysisDate.value = today;

    // 綁定事件
    elements.startBtn.addEventListener('click', startAnalysis);
    elements.viewReportBtn.addEventListener('click', showDetailReport);

    // Agent 選擇變更事件
    const agentCheckboxes = [
        elements.agentTechnical,
        elements.agentFundamental,
        elements.agentNews,
        elements.agentSentiment
    ];
    agentCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateSelectedAgents);
    });

    // 標籤頁切換
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tabName = e.target.dataset.tab;
            switchTab(tabName);
        });
    });
});

// ===== 更新選中的 Agent =====
function updateSelectedAgents() {
    const agents = [];
    const agentMap = {
        'agent-technical': '技術分析師',
        'agent-fundamental': '基本面分析師',
        'agent-news': '新聞分析師',
        'agent-sentiment': '情緒分析師'
    };

    Object.keys(agentMap).forEach(id => {
        if (document.getElementById(id).checked) {
            agents.push(agentMap[id]);
        }
    });

    elements.selectedCount.innerHTML = `已選擇 <strong>${agents.length}</strong> 個分析師: ${agents.join(', ')}`;
}

// ===== 開始分析 =====
async function startAnalysis() {
    // 獲取配置
    const market = elements.marketSelect.value;
    const stock = elements.stockInput.value.trim().toUpperCase();
    const date = elements.analysisDate.value;
    const depth = elements.depthSlider.value;

    // 驗證輸入
    if (!stock) {
        alert('請輸入股票代碼！');
        return;
    }

    // 獲取選中的 agents
    const selectedAgents = getSelectedAgents();
    if (selectedAgents.length === 0) {
        alert('請至少選擇一個分析師！');
        return;
    }

    // 保存當前股票信息
    currentStock = stock;
    currentMarket = market;

    // 顯示進度區，隱藏配置區
    elements.configSection.style.display = 'none';
    elements.progressSection.style.display = 'block';
    elements.summarySection.style.display = 'none';
    elements.detailSection.style.display = 'none';

    // 開始分析流程
    try {
        await runMultiAgentAnalysis(market, stock, date, depth, selectedAgents);
    } catch (error) {
        console.error('分析錯誤:', error);
        alert('分析過程中發生錯誤：' + error.message);
        resetToConfig();
    }
}

// ===== 獲取選中的 Agents =====
function getSelectedAgents() {
    const agents = [];
    if (elements.agentTechnical.checked) agents.push('technical');
    if (elements.agentFundamental.checked) agents.push('fundamental');
    if (elements.agentNews.checked) agents.push('news');
    if (elements.agentSentiment.checked) agents.push('sentiment');
    return agents;
}

// ===== Multi-Agent 分析流程 =====
async function runMultiAgentAnalysis(market, stock, date, depth, selectedAgents) {
    const startTime = Date.now();
    const analysisId = `analysis_${Date.now()}_${stock}`;
    elements.analysisId.textContent = analysisId;

    // 步驟 1: 初始化
    updateProgress(10, '初始化分析環境', startTime);
    await sleep(500);

    // 步驟 2: 分析師團隊分析
    const agentResults = {};
    const totalAgents = selectedAgents.length;
    let completedAgents = 0;

    for (const agent of selectedAgents) {
        const agentName = getAgentName(agent);
        updateProgress(10 + (completedAgents / totalAgents) * 60, `${agentName}正在分析`, startTime);

        const result = await callAgentAPI(agent, market, stock, date, depth);
        agentResults[agent] = result;

        completedAgents++;
        await sleep(800);
    }

    // 步驟 3: 多空辯論
    updateProgress(75, '多空辯論研究中', startTime);
    const debateResult = await runDebateAgents(agentResults, market, stock);
    await sleep(1000);

    // 步驟 4: 風控決策
    updateProgress(85, '風險管理評估', startTime);
    const riskAssessment = await runRiskManagement(agentResults, debateResult);
    await sleep(800);

    // 步驟 5: 組合經理決策
    updateProgress(95, '生成最終投資建議', startTime);
    const finalDecision = await runPortfolioManager(agentResults, debateResult, riskAssessment, market, stock);
    await sleep(800);

    // 步驟 6: 生成報告
    updateProgress(100, '生成報告', startTime);
    analysisData = {
        stock,
        market,
        date,
        agentResults,
        debateResult,
        riskAssessment,
        finalDecision,
        analysisId
    };

    await sleep(500);

    // 顯示完成狀態
    showCompletionStatus();
}

// ===== 調用單個 Agent API =====
async function callAgentAPI(agentType, market, stock, date, depth) {
    const prompts = {
        technical: `作為技術分析師，請分析 ${market} 市場的 ${stock} 股票（分析日期：${date}）。請提供：
1. 技術指標分析（MA、MACD、RSI、KD等）
2. 價格趨勢判斷（上升/下降/盤整）
3. 支撐位與壓力位
4. 量價關係分析
5. 技術面買賣建議

深度等級：${depth}/5`,

        fundamental: `作為基本面分析師，請分析 ${market} 市場的 ${stock} 股票（分析日期：${date}）。請提供：
1. 公司財務狀況分析（營收、獲利、現金流）
2. 成長性評估
3. 估值分析（本益比、股價淨值比等）
4. 產業地位與競爭優勢
5. 基本面投資評價

深度等級：${depth}/5`,

        news: `作為新聞分析師，請分析 ${market} 市場的 ${stock} 股票（分析日期：${date}）的相關新聞。請提供：
1. 近期重大新聞事件
2. 新聞對股價的影響評估
3. 政策面影響分析
4. 產業趨勢相關新聞
5. 新聞面綜合評價

深度等級：${depth}/5`,

        sentiment: `作為市場情緒分析師，請分析 ${market} 市場的 ${stock} 股票（分析日期：${date}）的市場情緒。請提供：
1. 社群媒體情緒分析
2. 投資者情緒指標
3. 機構投資者動向
4. 市場恐慌/貪婪程度
5. 情緒面綜合評價

深度等級：${depth}/5`
    };

    try {
        const response = await callChatGPT(prompts[agentType]);
        return response;
    } catch (error) {
        console.error(`${agentType} Agent 錯誤:`, error);
        return `[${getAgentName(agentType)}分析暫時無法完成，請稍後再試]`;
    }
}

// ===== 多空辯論 =====
async function runDebateAgents(agentResults, market, stock) {
    const allAnalysis = Object.values(agentResults).join('\n\n');

    const bullPrompt = `作為多頭分析師，基於以下分析報告，請提出 ${market} 市場 ${stock} 股票的看多論點：

${allAnalysis}

請提供：
1. 主要看多理由（3-5點）
2. 支持證據
3. 預期上漲目標價`;

    const bearPrompt = `作為空頭分析師，基於以下分析報告，請提出 ${market} 市場 ${stock} 股票的看空論點：

${allAnalysis}

請提供：
1. 主要看空理由（3-5點）
2. 風險證據
3. 預期下跌目標價`;

    try {
        const [bullCase, bearCase] = await Promise.all([
            callChatGPT(bullPrompt),
            callChatGPT(bearPrompt)
        ]);

        return { bullCase, bearCase };
    } catch (error) {
        console.error('辯論分析錯誤:', error);
        return {
            bullCase: '[多頭分析暫時無法完成]',
            bearCase: '[空頭分析暫時無法完成]'
        };
    }
}

// ===== 風險管理 =====
async function runRiskManagement(agentResults, debateResult) {
    const prompt = `作為風險管理團隊，請評估以下投資提案的風險：

分析報告：
${JSON.stringify(agentResults, null, 2)}

多空辯論：
${JSON.stringify(debateResult, null, 2)}

請提供：
1. 風險評分（0-100，越高越危險）
2. 主要風險因素
3. 風險控制建議
4. 建議倉位配置（激進/中性/保守）`;

    try {
        return await callChatGPT(prompt);
    } catch (error) {
        console.error('風險評估錯誤:', error);
        return '[風險評估暫時無法完成]';
    }
}

// ===== 組合經理最終決策 =====
async function runPortfolioManager(agentResults, debateResult, riskAssessment, market, stock) {
    const prompt = `作為投資組合經理，請基於以下所有分析做出最終投資決策：

市場：${market}
股票代碼：${stock}

分析師報告：
${JSON.stringify(agentResults, null, 2)}

多空辯論：
${JSON.stringify(debateResult, null, 2)}

風險評估：
${riskAssessment}

請提供最終決策，必須包含以下JSON格式的數據（請在回應中包含這個JSON）：
{
  "recommendation": "買入/持有/賣出",
  "confidence": 85,
  "confidenceChange": 10,
  "riskScore": 45,
  "riskChange": -5,
  "targetPrice": "$XXX.XX",
  "reasoning": "詳細的決策理由..."
}

並提供完整的投資建議報告。`;

    try {
        return await callChatGPT(prompt);
    } catch (error) {
        console.error('最終決策錯誤:', error);
        return '[最終決策暫時無法完成]';
    }
}

// ===== 調用 ChatGPT API =====
async function callChatGPT(prompt) {
    // 檢查 API Key
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
                {
                    role: 'system',
                    content: '你是一個專業的投資分析AI，擅長股票分析、技術分析、基本面分析和風險管理。請提供專業、客觀的分析意見。'
                },
                {
                    role: 'user',
                    content: prompt
                }
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

// ===== 更新進度 =====
function updateProgress(percent, stepText, startTime) {
    elements.progressPercent.textContent = `${percent.toFixed(1)}%`;
    elements.currentStepText.textContent = stepText;
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

// ===== 顯示完成狀態 =====
function showCompletionStatus() {
    elements.viewReportBtn.style.display = 'block';

    // 顯示摘要
    displaySummary();
}

// ===== 顯示摘要 =====
function displaySummary() {
    if (!analysisData) return;

    // 顯示摘要區
    elements.summarySection.style.display = 'block';
    elements.stockTitle.textContent = `📊 ${currentStock} 分析結果`;

    // 解析最終決策中的 JSON
    const decision = analysisData.finalDecision;
    let parsedDecision = null;

    try {
        // 嘗試從回應中提取 JSON
        const jsonMatch = decision.match(/\{[\s\S]*"recommendation"[\s\S]*\}/);
        if (jsonMatch) {
            parsedDecision = JSON.parse(jsonMatch[0]);
        }
    } catch (e) {
        console.error('解析決策 JSON 失敗:', e);
    }

    // 如果成功解析，使用解析的數據；否則使用默認值
    if (parsedDecision) {
        elements.recommendation.textContent = parsedDecision.recommendation;
        elements.confidence.textContent = `${parsedDecision.confidence}%`;
        elements.confidenceChange.textContent = `↑ ${Math.abs(parsedDecision.confidenceChange)}%`;
        elements.confidenceChange.className = `summary-change ${parsedDecision.confidenceChange >= 0 ? 'positive' : 'negative'}`;

        elements.riskScore.textContent = `${parsedDecision.riskScore}%`;
        elements.riskChange.textContent = `${parsedDecision.riskChange >= 0 ? '↑' : '↓'} ${Math.abs(parsedDecision.riskChange)}%`;
        elements.riskChange.className = `summary-change ${parsedDecision.riskChange >= 0 ? 'negative' : 'positive'}`;

        elements.targetPrice.textContent = parsedDecision.targetPrice;
    } else {
        // 使用默認值
        elements.recommendation.textContent = '分析中';
        elements.confidence.textContent = '計算中';
        elements.riskScore.textContent = '評估中';
        elements.targetPrice.textContent = '待定';
    }

    // 顯示 AI 推理
    elements.aiReasoningContent.innerHTML = `
        <p><strong>綜合分析結果：</strong></p>
        <div style="white-space: pre-wrap; line-height: 1.8;">${decision}</div>
    `;
}

// ===== 顯示詳細報告 =====
function showDetailReport() {
    if (!analysisData) return;

    elements.detailSection.style.display = 'block';

    // 填充各個標籤頁的內容
    const { agentResults, debateResult, riskAssessment, finalDecision } = analysisData;

    elements.technicalContent.innerHTML = formatContent(agentResults.technical || '暫無技術分析數據');
    elements.fundamentalContent.innerHTML = formatContent(agentResults.fundamental || '暫無基本面分析數據');
    elements.sentimentContent.innerHTML = formatContent(agentResults.sentiment || '暫無情緒分析數據');
    elements.newsContent.innerHTML = formatContent(agentResults.news || '暫無新聞分析數據');

    elements.riskContent.innerHTML = `
        <h4>🎯 多頭論點</h4>
        <div class="debate-section">${formatContent(debateResult.bullCase)}</div>
        <h4 style="margin-top: 25px;">⚠️ 空頭論點</h4>
        <div class="debate-section">${formatContent(debateResult.bearCase)}</div>
        <h4 style="margin-top: 25px;">🛡️ 風險評估</h4>
        <div class="risk-section">${formatContent(riskAssessment)}</div>
    `;

    elements.recommendationContent.innerHTML = formatContent(finalDecision);

    // 滾動到詳細報告
    elements.detailSection.scrollIntoView({ behavior: 'smooth' });
}

// ===== 格式化內容 =====
function formatContent(text) {
    if (!text) return '<p>暫無數據</p>';

    // 將換行符轉換為 <br>
    let formatted = text.replace(/\n/g, '<br>');

    // 將數字列表轉換為有序列表
    formatted = formatted.replace(/(\d+\.\s[^\<]+)/g, '<li>$1</li>');
    if (formatted.includes('<li>')) {
        formatted = '<ol>' + formatted + '</ol>';
    }

    // 將 ** 粗體標記轉換為 <strong>
    formatted = formatted.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');

    return formatted;
}

// ===== 切換標籤頁 =====
function switchTab(tabName) {
    // 移除所有 active 類
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(pane => pane.classList.remove('active'));

    // 添加 active 類
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

// ===== 重置到配置頁面 =====
function resetToConfig() {
    elements.configSection.style.display = 'block';
    elements.progressSection.style.display = 'none';
    elements.summarySection.style.display = 'none';
    elements.detailSection.style.display = 'none';
}

// ===== 工具函數 =====
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function getAgentName(agentType) {
    const names = {
        technical: '技術分析師',
        fundamental: '基本面分析師',
        news: '新聞分析師',
        sentiment: '情緒分析師'
    };
    return names[agentType] || agentType;
}
