/* QAQ 游戏中心 - 本地代理后端（可选）
 * 运行后，前端代理页选「本地后端」即可转发任意 http(s) 页面，
 * 并自动重写 Cookie/CSP，解决纯前端 iframe 被 X-Frame-Options 拦截的问题。
 * 用法： cd server && npm install && node proxy-server.js
 */
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
const PORT = 3001;

app.get('/', (req, res) => {
  res.send('QAQ Proxy OK. 用法: /proxy?url=https://example.com');
});

// 核心转发接口
app.get('/proxy', async (req, res) => {
  const target = req.query.url;
  if (!target || !/^https?:\/\//i.test(target)) {
    return res.status(400).send('参数错误，用法: /proxy?url=https://example.com');
  }
  try {
    const r = await fetch(target, {
      headers: { 'User-Agent': 'Mozilla/5.0 QAQProxy' },
      redirect: 'follow',
    });
    const ct = r.headers.get('content-type') || 'text/html';
    const buf = Buffer.from(await r.arrayBuffer());
    // 去掉防嵌入头，允许 iframe 显示
    res.set('Content-Type', ct);
    res.set('Access-Control-Allow-Origin', '*');
    let body = buf;
    if (ct.includes('text/html')) {
      let html = buf.toString('utf8');
      // 相对路径转绝对路径，保证 CSS/JS/图片正常
      const base = new URL(target);
      html = html.replace(/<head([^>]*)>/i, `<head$1><base href="${base.origin}/">`);
      body = html;
    }
    res.send(body);
  } catch (e) {
    res.status(502).send('代理抓取失败: ' + e.message);
  }
});

app.listen(PORT, () => console.log(`✅ QAQ 代理后端已启动: http://localhost:${PORT}/proxy?url=https://example.com`));
