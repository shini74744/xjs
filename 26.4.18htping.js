// == Nezha Dashboard IP Ping/TCPing 按钮 + Ping0v4/Ping0v6 ==
(function () {
    'use strict';

    if (!location.href.includes('/dashboard')) return;

    // ---------- 样式 ----------
    const style = document.createElement('style');
    style.textContent = `
        .nezha-ping-btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            height: 18px;
            line-height: 18px;
            font-size: 11px;
            padding: 0 6px;
            margin-right: 4px;
            margin-bottom: 2px;
            border-radius: 6px;
            cursor: pointer;
            user-select: none;
            border: 1px solid #666;
            background: rgba(60, 60, 60, 0.92);
            color: #fff;
            text-decoration: none;
            white-space: nowrap;
            box-sizing: border-box;
        }

        .nezha-ping-btn:hover {
            filter: brightness(1.08);
        }

        .nezha-ping-wrap {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
            margin-bottom: 2px;
        }
    `;
    document.head.appendChild(style);

    // ---------- 工具：从 token 里识别 IP ----------
    function parseIPs(text) {
        if (!text) return { v4: [], v6: [] };

        const tokens = text
            .split(/[\s,\/|;]+/)
            .map(t => t.trim())
            .filter(Boolean);

        const v4 = [];
        const v6 = [];

        const reV4 = /^(?:\d{1,3}\.){3}\d{1,3}(?::\d+)?$/;
        const reV6Bracket = /^\[[0-9a-fA-F:]+\](?::\d+)?$/;
        const reDateTime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z?$/;

        for (const t of tokens) {
            if (reV4.test(t)) {
                v4.push(t);
                continue;
            }

            if (reV6Bracket.test(t)) {
                v6.push(t);
                continue;
            }

            if (
                t.includes(':') &&
                !t.includes('.') &&
                /^[0-9a-fA-F:]+$/.test(t) &&
                (t.match(/:/g) || []).length >= 2 &&
                (/[a-fA-F]/.test(t) || t.includes('::')) &&
                t.length >= 4 &&
                !reDateTime.test(t)
            ) {
                v6.push(t);
            }
        }

        return { v4, v6 };
    }

    // ---------- 规范化 IP，去掉端口/中括号 ----------
    function normalizeIP(token, isIPv4) {
        if (!token) return '';

        if (isIPv4) {
            // 1.2.3.4:443 -> 1.2.3.4
            return token.replace(/:\d+$/, '');
        }

        // [2602:f732::1]:443 -> 2602:f732::1
        if (/^\[[0-9a-fA-F:]+\]:\d+$/.test(token)) {
            return token.replace(/^\[/, '').replace(/\]:\d+$/, '');
        }

        // [2602:f732::1] -> 2602:f732::1
        if (/^\[[0-9a-fA-F:]+\]$/.test(token)) {
            return token.slice(1, -1);
        }

        // 纯 IPv6
        return token;
    }

    // ---------- 原 itdog 按钮 ----------
    function createITDogButton(token, isIPv4, hasPort) {
        const a = document.createElement('a');
        a.className = 'nezha-ping-btn';

        if (hasPort) {
            a.textContent = isIPv4 ? 'Tcpingv4' : 'Tcpingv6';
            a.href = isIPv4
                ? `https://www.itdog.cn/tcping/${token}`
                : `https://www.itdog.cn/tcping_ipv6/${token}`;
        } else {
            a.textContent = isIPv4 ? 'Pingv4' : 'Pingv6';
            a.href = isIPv4
                ? `https://www.itdog.cn/ping/${token}`
                : `https://www.itdog.cn/ping_ipv6/${token}`;
        }

        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        return a;
    }

    // ---------- Ping0 按钮 ----------
    function createPing0Button(token, isIPv4) {
        const ip = normalizeIP(token, isIPv4);
        if (!ip) return null;

        const a = document.createElement('a');
        a.className = 'nezha-ping-btn';
        a.textContent = isIPv4 ? 'Ping0v4' : 'Ping0v6';
        a.href = `https://ping0.cc/ping/${ip}`;
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        return a;
    }

    // ---------- 给单元格追加按钮 ----------
    function appendButtons(cell) {
        if (!cell) return;
        if (cell.dataset.nzPingProcessed === '1') return;

        const text = (cell.textContent || '').trim();
        if (!text) return;

        const { v4, v6 } = parseIPs(text);
        if (v4.length === 0 && v6.length === 0) return;

        const wrap = document.createElement('div');
        wrap.className = 'nezha-ping-wrap';

        v4.forEach(tok => {
            const hasPort = /:\d+$/.test(tok);
            wrap.appendChild(createITDogButton(tok, true, hasPort));

            const ping0 = createPing0Button(tok, true);
            if (ping0) wrap.appendChild(ping0);
        });

        v6.forEach(tok => {
            const hasPort = /^\[[0-9a-fA-F:]+\]:\d+$/.test(tok);
            wrap.appendChild(createITDogButton(tok, false, hasPort));

            const ping0 = createPing0Button(tok, false);
            if (ping0) wrap.appendChild(ping0);
        });

        if (wrap.children.length > 0) {
            cell.insertAdjacentElement('afterbegin', wrap);
            cell.dataset.nzPingProcessed = '1';
        }
    }

    // ---------- 遍历表格 ----------
    function processTable() {
        document.querySelectorAll('tbody tr td').forEach(td => appendButtons(td));
    }

    // ---------- 初始化 ----------
    function init() {
        processTable();

        const observer = new MutationObserver(() => {
            processTable();
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            characterData: true
        });

        setTimeout(processTable, 300);
        setTimeout(processTable, 1000);
        setTimeout(processTable, 2000);
    }

    if (document.readyState === 'loading') {
        window.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
