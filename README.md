# 🎮 QAQ 游戏中心 · 在线小游戏合集 + Cloudflare网页代理

纯静态前端 + Cloudflare Worker 代理，专为学校 iPad + GitHub Pages 优化。

## 回答你的问题

**Q：可以通过 CF 的节点来代理吗？**
**A：可以，而且这是最推荐的方式。** 已内置 `server/cloudflare-worker.js`：

1. 打开 `dash.cloudflare.com` → Workers → Create → 粘贴 `server/cloudflare-worker.js` → Deploy
2. 得到 `https://qaq-proxy.xxx.workers.dev`
3. 回本站 → 在线代理 → 节点选「☁️ Cloudflare自建」→ 填入地址 → 保存 → 测试
4. 之后走 CF 全球边缘节点，自动去掉 `X-Frame-Options / CSP` 防嵌入头

免费版每天 10 万次请求。想加密码/白名单：改 worker 顶部 `ACCESS_KEY / ALLOW_LIST` 后重新 Deploy。
学校网若屏蔽 `*.workers.dev`：给 Worker 绑一个自定义域名（Worker → Settings → Domains）即可。

**Q：放 GitHub 给学校 iPad 用？**
**A：已配好开箱即用：**

```bash
cd D:\QAQ
git init && git add -A && git commit -m "qaq games"
# GitHub 建空仓库 qaq-games 后：
git remote add origin https://github.com/你的用户名/qaq-games.git
git branch -M main && git push -u origin main
# 然后仓库 Settings → Pages → Source 选 "GitHub Actions"
# 得到 https://你的用户名.github.io/qaq-games/
```

- 已含 `.github/workflows/pages.yml`（push 即部署）、`.nojekyll`、`manifest.webmanifest`、`sw.js`
- 全程 HTTPS，iPad Safari 直接打开 → 分享 → **添加到主屏幕**（全屏+离线，断网也能玩 8 款游戏）
- iPad 适配已做：输入框 16px 防自动缩放、44px 触控区、safe-area、打砖块触控、Service Worker 离线缓存

## 功能

- 🕹️ 8 款游戏：贪吃蛇 / 俄罗斯方块 / 打砖块 / 太空射击 / 2048 / 扫雷 / 五子棋(AI) / 记忆翻牌
- 🌐 代理节点：Cloudflare自建（推荐）/ 直连 / AllOrigins / CodeTabs / CorsProxy / 本地后端
- 📱 手机/电脑/iPad 全兼容，最高分存本地

## 目录

```
├── index.html / style.css / js/games.js / js/app.js
├── manifest.webmanifest / sw.js / icon-*.png   # PWA
├── server/cloudflare-worker.js + wrangler.toml # CF 代理
├── server/proxy-server.js                      # 本地代理（可选）
└── .github/workflows/pages.yml                 # Pages 自动部署
```

## 本地运行

```bash
python -m http.server 8080
# http://localhost:8080
cd server && npm install && node proxy-server.js  # 可选本地后端
```

⚠️ 仅代理公开静态站点、学习调试用，遵守法律法规与目标站 ToS。直连模式下部分站（百度/B站/谷歌等）因防嵌入策略显示空白是正常的，切 CF 节点即可。
