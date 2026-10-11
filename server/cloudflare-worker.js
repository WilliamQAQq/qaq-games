/* ============================================================
 * QAQ 游戏中心 · Cloudflare Worker 网页代理
 * 部署：Cloudflare Dashboard → Workers → Create → 粘贴本文件 → Deploy
 * 免费版每天 10万次请求，全球边缘节点，学校 iPad 直接可用
 * 用法：
 *   https://你的worker.workers.dev/?url=https://example.com
 *   https://你的worker.workers.dev/https://example.com
 * 前端代理页 → 节点选「Cloudflare自建」→ 填上面地址即可
 * ============================================================ */

// 可选：只允许代理这些域名，留空 [] = 允许所有（建议学校自用留空，上线后可加白名单）
// 例：["example.com", "wikipedia.org"]
const ALLOW_LIST = [];

// 可选：密码保护，留空 = 无需密码。设置后需 ?url=...&key=你的密码
const ACCESS_KEY = "";

const UA = "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 QAQProxy";

function isAllowed(target) {
  if (!ALLOW_LIST.length) return true;
  try {
    const h = new URL(target).hostname;
    return ALLOW_LIST.some(d => h === d || h.endsWith("." + d));
  } catch { return false; }
}

function stripHeaders(headers) {
  const h = new Headers(headers);
  // 去掉防 iframe 嵌入头，这是关键
  h.delete("x-frame-options");
  h.delete("content-security-policy");
  h.delete("content-security-policy-report-only");
  h.delete("cross-origin-embedder-policy");
  h.delete("cross-origin-opener-policy");
  h.delete("cross-origin-resource-policy");
  h.set("access-control-allow-origin", "*");
  h.set("x-proxied-by", "QAQ-CF-Worker");
  return h;
}

async function handleProxy(target, req) {
  if (!/^https?:\/\//i.test(target)) {
    return new Response("参数错误，用法: /?url=https://example.com", { status: 400 });
  }
  if (!isAllowed(target)) {
    return new Response("该域名不在白名单", { status: 403 });
  }
  const init = {
    method: req.method,
    headers: { "User-Agent": UA, Accept: req.headers.get("accept") || "*/*" },
    redirect: "follow",
  };
  // 透传 body（POST 等）
  if (req.method !== "GET" && req.method !== "HEAD") {
    init.body = await req.arrayBuffer();
  }
  const upstream = await fetch(target, init);
  const ct = upstream.headers.get("content-type") || "";
  const myOrigin = new URL(req.url).origin; // Worker 没有 location，用请求 URL 取自身源

  // HTML：导航链接改写成走本代理 + 注入 <base> 保证资源相对路径可用
  if (ct.includes("text/html")) {
    let html = await upstream.text();
    const finalUrl = upstream.url || target; // 跳转后的最终地址
    // 区域劫持修正：PH 等站会把中文区域跳到区域域名（如 cn.pornhub.com，学校网常直接掐断）
    html = html.replace(/\bcn\.pornhub\.com\b/g, "www.pornhub.com");
    // 点击链接不再直连目标站，全部留在代理内（学校网封域名也不影响）
    const proxify = (val) => {
      if (!val || /^(#|javascript:|mailto:|tel:|data:|sms:)/i.test(val)) return null;
      try {
        const abs = new URL(val, finalUrl).href;
        if (!/^https?:/i.test(abs)) return null;
        if (abs.startsWith(myOrigin)) return null; // 已是代理地址
        return myOrigin + "/?url=" + encodeURIComponent(abs);
      } catch { return null; }
    };
    html = html.replace(/(\b(?:href|action)\s*=\s*)(["'])([^"']*)\2/gi, (m, pre, q, val) => {
      const p = proxify(val);
      return p ? pre + q + p + q : m;
    });
    try {
      if (!/<base[\s>]/i.test(html)) {
        const b = new URL(finalUrl);
        html = html.replace(/<head([^>]*)>/i, `<head$1><base href="${b.origin}/">`);
      }
    } catch {}
    return new Response(html, { status: upstream.status, headers: stripHeaders(upstream.headers) });
  }
  // 其他资源原样转发
  const buf = await upstream.arrayBuffer();
  return new Response(buf, { status: upstream.status, headers: stripHeaders(upstream.headers) });
}

export default {
  async fetch(req, env) {
    const url = new URL(req.url);

    // CORS 预检
    if (req.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "GET,POST,PUT,DELETE,OPTIONS",
          "access-control-allow-headers": "*",
        },
      });
    }

    // 首页说明页
    if (!url.searchParams.get("url") && url.pathname === "/") {
      return new Response(
        `QAQ CF Proxy OK ✅\n\n用法:\n${url.origin}/?url=https://example.com\n${url.origin}/https://example.com\n\n前端节点选「Cloudflare自建」，填: ${url.origin}`,
        { headers: { "content-type": "text/plain; charset=utf-8", "access-control-allow-origin": "*" } }
      );
    }

    // 密码保护
    if (ACCESS_KEY) {
      const key = url.searchParams.get("key") || req.headers.get("x-proxy-key");
      if (key !== ACCESS_KEY) return new Response("需要正确的 ?key=密码", { status: 401 });
    }

    // 模式1: ?url=
    let target = url.searchParams.get("url");
    // 模式2: /https://example.com/xxx
    if (!target && url.pathname.length > 4) {
      const p = url.pathname.slice(1);
      if (/^https?:/.test(p) || /^https?:\//.test(p)) {
        target = p;
        // 兼容 /https:/example.com（少一个斜杠的情况）
        target = target.replace(/^http:\/(?!\/)/, "http://").replace(/^https:\/(?!\/)/, "https://");
      }
    }
    if (!target) return new Response("缺 url 参数", { status: 400 });

    try {
      return await handleProxy(target, req);
    } catch (e) {
      return new Response("代理抓取失败: " + e.message, { status: 502 });
    }
  },
};
