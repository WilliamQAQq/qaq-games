/* QAQ 游戏中心 - 主逻辑：导航 + 游戏列表 + 玩家 + 代理 */
let currentCat = 'all';
let cleanup = null;
let currentGame = null;

const CATS = { action:'动作', puzzle:'益智', chess:'棋牌', arcade:'街机' };

function $(s){ return document.querySelector(s); }

function showPage(name){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active', b.dataset.page===name));
  if(name==='home') $('#page-home').classList.add('active');
  else if(name==='games') $('#page-games').classList.add('active');
  else if(name==='proxy') $('#page-proxy').classList.add('active');
  else if(name==='about') $('#page-about').classList.add('active');
  window.scrollTo({top:0, behavior:'smooth'});
}

function setCat(c, el){
  currentCat = c;
  document.querySelectorAll('.chip').forEach(ch=>ch.classList.remove('active'));
  if(el) el.classList.add('active');
  renderGames();
}

function bestText(def){
  const v = parseInt(localStorage.getItem(def.bestKey)||'0')||0;
  if(def.id==='memory') return v? `🏆 最少步：${v}` : '🏆 暂无记录，快来首通！';
  if(def.id==='gomoku') return v? `🏆 胜场：${v}` : '🏆 挑战 AI 拿首胜！';
  if(def.id==='minesweeper') return '🏆 通关即荣誉';
  return v? `🏆 最高分：${v}` : '🏆 暂无记录，快来刷分！';
}

function renderGames(){
  const kw = ($('#search')?.value||'').trim();
  const list = window.GAME_DEFS.filter(d =>
    (currentCat==='all'||d.cat===currentCat) &&
    (!kw || d.name.includes(kw) || d.desc.includes(kw))
  );
  const html = list.map(d=>`
    <div class="card-game" onclick="openGame('${d.id}')">
      <div class="go">▶</div>
      <div class="icon">${d.icon}</div>
      <h3>${d.name}</h3>
      <p>${d.desc}</p>
      <span class="tag">${CATS[d.cat]}</span>
      <div class="best-line">${bestText(d)}</div>
    </div>`).join('') || '<p class="muted">没找到游戏，换个关键词试试～</p>';
  $('#game-grid').innerHTML = html;
  $('#game-grid2').innerHTML = window.GAME_DEFS.map(d=>`
    <div class="card-game" onclick="openGame('${d.id}')">
      <div class="go">▶</div>
      <div class="icon">${d.icon}</div>
      <h3>${d.name}</h3>
      <p>${d.desc}</p>
      <span class="tag">${CATS[d.cat]}</span>
      <div class="best-line">${bestText(d)}</div>
    </div>`).join('');
}

function openGame(id){
  const def = window.GAME_DEFS.find(d=>d.id===id);
  if(!def) return;
  if(cleanup){ try{cleanup();}catch(e){} cleanup=null; }
  currentGame = id;
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  $('#page-player').classList.add('active');
  $('#player-title').textContent = def.icon+' '+def.name;
  $('#player-help').textContent = '玩法：'+def.help;
  const best = localStorage.getItem(def.bestKey)||'0';
  $('#player-best').textContent = best&&best!=='0' ? '🏆 '+best : '';
  const box = $('#player-box');
  box.innerHTML = '<div class="game-root" id="game-root"></div>';
  const rootEl = $('#game-root');
  try{
    cleanup = window.GAME_IMPL[id](rootEl);
  }catch(err){
    rootEl.innerHTML = '<p>游戏加载失败：'+err.message+'</p>';
  }
  window.scrollTo({top:0, behavior:'smooth'});
}

function backToList(){
  if(cleanup){ try{cleanup();}catch(e){} cleanup=null; }
  renderGames();
  showPage('home');
}

function restartGame(){
  if(!currentGame) return;
  openGame(currentGame);
}

/* ============ 网页在线代理 ============ */
function normalizeUrl(u){
  u = (u||'').trim();
  if(!u) return '';
  if(!/^https?:\/\//i.test(u)) u = 'https://' + u;
  try{ new URL(u); return u; }catch(e){ return ''; }
}

function getCFBase(){
  return (localStorage.getItem('cf_worker')||'').trim().replace(/\/+$/,'');
}
function onNodeChange(){
  const v = $('#proxy-node').value;
  $('#cf-row').style.display = v==='cf' ? 'flex' : 'none';
  try{ localStorage.setItem('proxy_node', v); }catch(e){}
}
function saveCF(){
  const v = ($('#cf-worker').value||'').trim().replace(/\/+$/,'');
  if(!/^https:\/\//i.test(v)){ $('#proxy-status').textContent='❌ Worker 地址必须是 https:// 开头'; return; }
  try{ localStorage.setItem('cf_worker', v); }catch(e){}
  $('#proxy-status').textContent='✅ 已保存 CF Worker：'+v;
}
async function testCF(){
  const base = ($('#cf-worker').value||'').trim().replace(/\/+$/,'') || getCFBase();
  if(!base){ $('#proxy-status').textContent='❌ 先填 Worker 地址'; return; }
  $('#proxy-status').textContent='📡 测试中…';
  try{
    const r = await fetch(base+'/?url='+encodeURIComponent('https://example.com'), {method:'GET'});
    $('#proxy-status').textContent = r.ok ? '✅ CF 节点正常！可以开始代理了' : '⚠️ 节点返回 '+r.status+'，检查 Worker 是否 Deploy 成功';
  }catch(e){ $('#proxy-status').textContent='❌ 连不上 Worker：'+e.message+'（学校网可能屏蔽 workers.dev，试试给 Worker 绑自定义域名）'; }
}

function buildProxyUrl(target, node){
  if(node==='direct') return target;
  const enc = encodeURIComponent(target);
  if(node==='cf'){
    const base = ($('#cf-worker')?.value||'').trim().replace(/\/+$/,'') || getCFBase();
    if(!base) return target;
    return base + '/?url=' + enc;
  }
  if(node==='allorigins') return 'https://api.allorigins.win/raw?url=' + enc;
  if(node==='codetabs') return 'https://api.codetabs.com/v1/proxy?quest=' + enc;
  if(node==='corsproxy') return 'https://corsproxy.io/?url=' + enc;
  if(node==='local') return 'http://localhost:3001/proxy?url=' + enc;
  return target;
}

function goProxy(){
  const raw = $('#proxy-url').value;
  const node = $('#proxy-node').value;
  const url = normalizeUrl(raw);
  const status = $('#proxy-status');
  if(!url){ status.textContent = '❌ 请输入有效网址'; return; }
  if(node==='cf'){
    const base = ($('#cf-worker')?.value||'').trim() || getCFBase();
    if(!base){ status.textContent = '❌ 先在下方填你的 Cloudflare Worker 地址（见关于页 3 分钟部署）'; return; }
    try{ localStorage.setItem('cf_worker', base.trim().replace(/\/+$/,'')); }catch(e){}
  }
  const final = buildProxyUrl(url, node);
  const frame = $('#proxy-frame');
  $('#proxy-empty').classList.add('hide');
  frame.classList.add('show');
  status.textContent = '⏳ 正在通过 [' + $('#proxy-node').selectedOptions[0].text + '] 加载 ' + url + ' …';
  frame.src = final;
  frame.onload = ()=>{ status.textContent = '✅ 已加载：' + url + '（若空白，说明目标站禁止被嵌入，换节点或用本地后端试试）'; };
  frame.onerror = ()=>{ status.textContent = '❌ 加载失败，目标站可能拒绝嵌入或节点不可用'; };
  saveProxyHistory(url);
}

function quickProxy(u){ $('#proxy-url').value = u; goProxy(); }

function saveProxyHistory(u){
  try{
    let h = JSON.parse(localStorage.getItem('proxy_hist')||'[]');
    h = [u, ...h.filter(x=>x!==u)].slice(0,8);
    localStorage.setItem('proxy_hist', JSON.stringify(h));
    renderProxyHistory();
  }catch(e){}
}
function renderProxyHistory(){
  try{
    const h = JSON.parse(localStorage.getItem('proxy_hist')||'[]');
    $('#proxy-history').innerHTML = h.map(u=>`<button class="hist-chip" onclick="quickProxy('${u.replace(/'/g,'')}')">${u.replace(/^https?:\/\//,'').slice(0,28)}</button>`).join('') || '<span class="muted">暂无</span>';
  }catch(e){}
}
function clearProxyHistory(){ localStorage.removeItem('proxy_hist'); renderProxyHistory(); }
function proxyFullscreen(){
  const f = $('#proxy-frame');
  if(f.requestFullscreen) f.requestFullscreen();
}

/* clock + init */
setInterval(()=>{ const el=$('#clock'); if(el) el.textContent = new Date().toLocaleString('zh-CN',{hour12:false}); },1000);
$('#year').textContent = new Date().getFullYear();
// 恢复上次节点 + CF 地址
try{
  const n = localStorage.getItem('proxy_node'); if(n) $('#proxy-node').value = n;
  const cf = localStorage.getItem('cf_worker'); if(cf && $('#cf-worker')) $('#cf-worker').value = cf;
  onNodeChange();
}catch(e){}
renderGames();
renderProxyHistory();
// PWA：iPad 添加到主屏幕后可离线玩
if('serviceWorker' in navigator){ window.addEventListener('load', ()=> navigator.serviceWorker.register('sw.js').catch(()=>{})); }
