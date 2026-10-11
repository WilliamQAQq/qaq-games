/* QAQ 游戏中心 - 8款游戏实现 */
window.GAME_DEFS = [
  { id:'snake', name:'贪吃蛇', icon:'🐍', desc:'经典贪吃蛇，吃豆变长加速，撞墙/撞自己结束。', cat:'arcade', bestKey:'best_snake', help:'⌨️ 方向键 / WASD 移动 · 📱 点下方按钮 · 吃到食物+10分，速度会越来越快' },
  { id:'tetris', name:'俄罗斯方块', icon:'🧱', desc:'七种方块堆叠消行，支持触屏按钮和硬降。', cat:'puzzle', bestKey:'best_tetris', help:'←→移动 · ↑旋转 · ↓加速下落 · 空格硬降 · 手机点下方按钮' },
  { id:'breakout', name:'打砖块', icon:'🧱', desc:'挡板反弹小球消砖，三条命，通关加分。', cat:'arcade', bestKey:'best_breakout', help:'←→ / A D / 鼠标移动挡板 · 空格发射' },
  { id:'shooter', name:'太空射击', icon:'🚀', desc:'打飞机，自动开火，空格放炸弹清屏。', cat:'action', bestKey:'best_shooter', help:'←→↑↓ / WASD / 手指拖动移动 · 空格炸弹（3颗）· 别撞敌机' },
  { id:'game2048', name:'2048', icon:'🔢', desc:'合并相同数字冲2048，支持键盘+滑动+按钮。', cat:'puzzle', bestKey:'best_2048', help:'方向键 / WASD / 滑动屏幕 / 点按钮移动合并' },
  { id:'minesweeper', name:'扫雷', icon:'💣', desc:'9×9 十颗雷，左键翻开右键/长按标记。', cat:'puzzle', bestKey:'best_ms', help:'左键翻开 · 右键标记旗子 · 长按=标记（手机）· 数字=周围雷数' },
  { id:'gomoku', name:'五子棋', icon:'⚫', desc:'15路棋盘人机对战，黑子先手连五获胜。', cat:'chess', bestKey:'best_gomoku', help:'你是黑子先手，点击交叉点落子，连成5子获胜' },
  { id:'memory', name:'记忆翻牌', icon:'🃏', desc:'4×4 翻牌配对，步数越少越厉害。', cat:'puzzle', bestKey:'best_memory', help:'点击翻牌，记住位置，两张相同即配对成功，16张全配对获胜' },
];

function getBest(k){ try{ return parseInt(localStorage.getItem(k)||'0')||0 }catch(e){ return 0 } }
function setBest(k,v){ try{ if(v>getBest(k)) localStorage.setItem(k,String(v)) }catch(e){} }

window.GAME_IMPL = {};

/* ============ 贪吃蛇 ============ */
window.GAME_IMPL.snake = function(root){
  root.innerHTML = `<div class="score-bar"><span class="pill">分数 <b id="s-sc">0</b></span><span class="pill">最高 <b id="s-best">${getBest('best_snake')}</b></span></div>
  <canvas id="s-cv" class="game-canvas" width="400" height="400"></canvas>
  <div class="ctl-row"><button class="ctl-btn" data-d="up">▲</button></div>
  <div class="ctl-row"><button class="ctl-btn" data-d="left">◀</button><button class="ctl-btn" data-d="down">▼</button><button class="ctl-btn" data-d="right">▶</button></div>`;
  const cv = root.querySelector('#s-cv'), ctx = cv.getContext('2d');
  const N=20, SZ=20; let snake, dir, nextDir, food, score, timer, dead=false;
  function reset(){ snake=[{x:10,y:10},{x:9,y:10},{x:8,y:10}]; dir={x:1,y:0}; nextDir=dir; score=0; dead=false; placeFood(); upd(); }
  function placeFood(){ while(true){ const f={x:(Math.random()*N)|0,y:(Math.random()*N)|0}; if(!snake.some(s=>s.x===f.x&&s.y===f.y)){ food=f; break; } } }
  function upd(){ root.querySelector('#s-sc').textContent=score; root.querySelector('#s-best').textContent=getBest('best_snake'); }
  function step(){
    if(dead) return; dir=nextDir;
    const h={x:snake[0].x+dir.x, y:snake[0].y+dir.y};
    if(h.x<0||h.y<0||h.x>=N||h.y>=N||snake.some(s=>s.x===h.x&&s.y===h.y)){ dead=true; setBest('best_snake',score); upd(); draw(); ctx.fillStyle='rgba(0,0,0,.6)'; ctx.fillRect(0,0,400,400); ctx.fillStyle='#fff'; ctx.font='bold 28px sans-serif'; ctx.textAlign='center'; ctx.fillText('游戏结束! '+score+'分',200,200); return; }
    snake.unshift(h);
    if(h.x===food.x&&h.y===food.y){ score+=10; setBest('best_snake',score); placeFood(); }
    else snake.pop();
    upd(); draw();
  }
  function draw(){
    ctx.fillStyle='#070b22'; ctx.fillRect(0,0,400,400);
    ctx.fillStyle='#ff5470'; ctx.beginPath(); ctx.arc(food.x*SZ+SZ/2,food.y*SZ+SZ/2,SZ/2-2,0,7); ctx.fill();
    snake.forEach((s,i)=>{ ctx.fillStyle=i===0?'#00e0c6':'#2dd68f'; ctx.fillRect(s.x*SZ+1,s.y*SZ+1,SZ-2,SZ-2); });
  }
  function key(e){
    const k=e.key.toLowerCase();
    if((k==='arrowup'||k==='w')&&dir.y!==1) nextDir={x:0,y:-1};
    else if((k==='arrowdown'||k==='s')&&dir.y!==-1) nextDir={x:0,y:1};
    else if((k==='arrowleft'||k==='a')&&dir.x!==1) nextDir={x:-1,y:0};
    else if((k==='arrowright'||k==='d')&&dir.x!==-1) nextDir={x:1,y:0};
    if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k)) e.preventDefault();
  }
  window.addEventListener('keydown',key);
  root.querySelectorAll('.ctl-btn').forEach(b=>b.onclick=()=>{ const d=b.dataset.d; if(d==='up'&&dir.y!==1)nextDir={x:0,y:-1}; if(d==='down'&&dir.y!==-1)nextDir={x:0,y:1}; if(d==='left'&&dir.x!==1)nextDir={x:-1,y:0}; if(d==='right'&&dir.x!==-1)nextDir={x:1,y:0}; });
  reset(); draw(); timer=setInterval(step,130);
  root._restart=()=>{ clearInterval(timer); reset(); timer=setInterval(step,130); };
  return ()=>{ clearInterval(timer); window.removeEventListener('keydown',key); };
};

/* ============ 俄罗斯方块 ============ */
window.GAME_IMPL.tetris = function(root){
  root.innerHTML = `<div class="score-bar"><span class="pill">分数 <b id="t-sc">0</b></span><span class="pill">行 <b id="t-ln">0</b></span><span class="pill">最高 <b>${getBest('best_tetris')}</b></span></div>
  <canvas id="t-cv" class="game-canvas" width="240" height="400"></canvas>
  <div class="ctl-row"><button class="ctl-btn" id="t-l">◀</button><button class="ctl-btn" id="t-r">▶</button><button class="ctl-btn" id="t-rot">⟳</button><button class="ctl-btn" id="t-dn">▼</button><button class="ctl-btn" id="t-drop">⬇硬降</button></div>`;
  const cv=root.querySelector('#t-cv'), ctx=cv.getContext('2d');
  const C=10,R=20,S=24; const SHAPES=[[[1,1,1,1]],[[1,1],[1,1]],[[0,1,0],[1,1,1]],[[0,1,1],[1,1,0]],[[1,1,0],[0,1,1]],[[1,0,0],[1,1,1]],[[0,0,1],[1,1,1]]];
  const COLORS=['#00e0c6','#ffd23f','#c77dff','#5aff8a','#ff5d73','#5aa8ff','#ff9f43'];
  let grid,cur,score=0,lines=0,timer,over=false;
  function reset(){ grid=Array.from({length:R},()=>Array(C).fill(0)); score=0;lines=0;over=false; spawn(); upd(); }
  function spawn(){ const i=(Math.random()*SHAPES.length)|0; cur={s:SHAPES[i].map(r=>r.slice()),c:COLORS[i],x:3,y:0}; if(collide(0,0)){ over=true; setBest('best_tetris',score); drawOver(); } }
  function collide(dx,dy,s){ s=s||cur.s; for(let y=0;y<s.length;y++)for(let x=0;x<s[y].length;x++){ if(!s[y][x])continue; const nx=cur.x+x+dx,ny=cur.y+y+dy; if(nx<0||nx>=C||ny>=R||(ny>=0&&grid[ny][nx])) return true; } return false; }
  function merge(){ cur.s.forEach((r,y)=>r.forEach((v,x)=>{ if(v&&cur.y+y>=0) grid[cur.y+y][cur.x+x]=cur.c; })); clear(); spawn(); }
  function clear(){ let n=0; for(let y=R-1;y>=0;y--){ if(grid[y].every(v=>v)){ grid.splice(y,1); grid.unshift(Array(C).fill(0)); n++; y++; } } if(n){ lines+=n; score+=[0,100,300,500,800][n]; setBest('best_tetris',score); } upd(); }
  function rot(){ const s=cur.s[0].map((_,i)=>cur.s.map(r=>r[i]).reverse()); if(!collide(0,0,s)) cur.s=s; draw(); }
  function move(dx){ if(!collide(dx,0)){cur.x+=dx;draw();} }
  function down(){ if(!collide(0,1)){cur.y++;draw();} else merge(),draw(); }
  function drop(){ while(!collide(0,1))cur.y++; merge(); draw(); }
  function upd(){ root.querySelector('#t-sc').textContent=score; root.querySelector('#t-ln').textContent=lines; }
  function draw(){ ctx.fillStyle='#070b22'; ctx.fillRect(0,0,240,400); grid.forEach((r,y)=>r.forEach((v,x)=>{ if(v){ctx.fillStyle=v;ctx.fillRect(x*S+1,y*S+1,S-2,S-2);} })); if(cur)cur.s.forEach((rr,y)=>rr.forEach((v,x)=>{ if(v){ctx.fillStyle=cur.c;ctx.fillRect((cur.x+x)*S+1,(cur.y+y)*S+1,S-2,S-2);} })); }
  function drawOver(){ draw(); ctx.fillStyle='rgba(0,0,0,.65)';ctx.fillRect(0,0,240,400);ctx.fillStyle='#fff';ctx.font='bold 24px sans-serif';ctx.textAlign='center';ctx.fillText('结束 '+score+'分',120,200); }
  function key(e){ if(over)return; if(e.key==='ArrowLeft')move(-1); else if(e.key==='ArrowRight')move(1); else if(e.key==='ArrowDown')down(); else if(e.key==='ArrowUp')rot(); else if(e.key===' '){drop();e.preventDefault();} }
  window.addEventListener('keydown',key);
  root.querySelector('#t-l').onclick=()=>move(-1); root.querySelector('#t-r').onclick=()=>move(1);
  root.querySelector('#t-rot').onclick=rot; root.querySelector('#t-dn').onclick=down; root.querySelector('#t-drop').onclick=drop;
  reset(); draw(); timer=setInterval(()=>{ if(!over){down();} },500);
  root._restart=()=>{clearInterval(timer);reset();draw();timer=setInterval(()=>{if(!over)down();},500);};
  return ()=>{clearInterval(timer);window.removeEventListener('keydown',key);};
};

/* ============ 打砖块 ============ */
window.GAME_IMPL.breakout = function(root){
  root.innerHTML=`<div class="score-bar"><span class="pill">分数 <b id="b-sc">0</b></span><span class="pill">生命 <b id="b-lf">3</b></span><span class="pill">最高 <b>${getBest('best_breakout')}</b></span></div>
  <canvas id="b-cv" class="game-canvas" width="480" height="360"></canvas>
  <p class="muted">←→ / AD / 鼠标移动 · 空格发射</p>`;
  const cv=root.querySelector('#b-cv'),ctx=cv.getContext('2d');
  let pad={x:200,w:80},ball,vel,bricks,score=0,life=3,stuck=true,over=false,win=false,raf,mx=null;
  function reset(){score=0;life=3;over=false;win=false;buildBricks();resetBall();upd();}
  function buildBricks(){bricks=[];const cols=8,rows=4;for(let r=0;r<rows;r++)for(let c=0;c<cols;c++)bricks.push({x:10+c*58,y:40+r*24,w:52,h:18,hp:1,on:true,col:['#ff5d73','#ffb020','#00e0c6','#6c7bff'][r]});}
  function resetBall(){pad.x=200;ball={x:240,y:330};vel={x:3,y:-3.5};stuck=true;}
  function upd(){root.querySelector('#b-sc').textContent=score;root.querySelector('#b-lf').textContent=life;}
  function loop(){
    if(over||win){drawEnd();return;}
    if(mx!==null){const rect=cv.getBoundingClientRect();pad.x=Math.min(Math.max((mx-rect.left)*(cv.width/rect.width)-pad.w/2,0),cv.width-pad.w);}
    if(!stuck){ball.x+=vel.x;ball.y+=vel.y;
      if(ball.x<6||ball.x>474)vel.x*=-1; if(ball.y<6)vel.y*=-1;
      if(ball.y>354){ if(ball.x>pad.x&&ball.x<pad.x+pad.w){vel.y=-Math.abs(vel.y); vel.x+=((ball.x-pad.x-pad.w/2)/pad.w)*2;} else {life--;upd(); if(life<=0){over=true;setBest('best_breakout',score);} else resetBall(); } }
      if(ball.y>330&&ball.y<345&&ball.x>pad.x&&ball.x<pad.x+pad.w&&vel.y>0){vel.y*=-1;}
      bricks.forEach(b=>{ if(!b.on)return; if(ball.x>b.x&&ball.x<b.x+b.w&&ball.y>b.y&&ball.y<b.y+b.h){b.on=false;vel.y*=-1;score+=20;setBest('best_breakout',score);upd();} });
      if(bricks.every(b=>!b.on)){win=true;score+=200;setBest('best_breakout',score);upd();}
    } else { ball.x=pad.x+pad.w/2; ball.y=328; }
    draw(); raf=requestAnimationFrame(loop);
  }
  function draw(){
    ctx.fillStyle='#070b22';ctx.fillRect(0,0,480,360);
    bricks.forEach(b=>{if(!b.on)return;ctx.fillStyle=b.col;ctx.fillRect(b.x,b.y,b.w,b.h);});
    ctx.fillStyle='#fff';ctx.fillRect(pad.x,336,pad.w,10);
    ctx.fillStyle='#ffe27c';ctx.beginPath();ctx.arc(ball.x,ball.y,6,0,7);ctx.fill();
    if(stuck){ctx.fillStyle='#9aa3c7';ctx.font='14px sans-serif';ctx.textAlign='center';ctx.fillText('按空格发射',240,300);}
  }
  function drawEnd(){draw();ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(0,0,480,360);ctx.fillStyle='#fff';ctx.font='bold 26px sans-serif';ctx.textAlign='center';ctx.fillText(win?'🎉 通关! '+score+'分':'💀 结束 '+score+'分',240,180);}
  function key(e){ if(e.key==='ArrowLeft'||e.key==='a')pad.x=Math.max(0,pad.x-18); if(e.key==='ArrowRight'||e.key==='d')pad.x=Math.min(400,pad.x+18); if(e.key===' '){stuck=false;e.preventDefault();} }
  window.addEventListener('keydown',key);
  cv.addEventListener('mousemove',e=>mx=e.clientX);
  cv.addEventListener('pointermove',e=>{mx=e.clientX;});
  cv.addEventListener('touchmove',e=>{if(e.touches[0])mx=e.touches[0].clientX;e.preventDefault();},{passive:false});
  cv.addEventListener('touchstart',()=>{stuck=false;},{passive:true});
  cv.addEventListener('click',()=>stuck=false);
  reset();upd();loop();
  root._restart=()=>{cancelAnimationFrame(raf);reset();loop();};
  return ()=>{cancelAnimationFrame(raf);window.removeEventListener('keydown',key);};
};

/* ============ 太空射击 ============ */
window.GAME_IMPL.shooter = function(root){
  root.innerHTML=`<div class="score-bar"><span class="pill">分数 <b id="sh-sc">0</b></span><span class="pill">💣 <b id="sh-b">3</b></span><span class="pill">最高 <b>${getBest('best_shooter')}</b></span></div>
  <canvas id="sh-cv" class="game-canvas" width="440" height="480"></canvas>
  <p class="muted">拖动/方向键移动 · 自动开火 · 空格=炸弹清屏</p>`;
  const cv=root.querySelector('#sh-cv'),ctx=cv.getContext('2d');
  let p,bullets,ebullets,enemies,parts,score=0,bombs=3,over=false,raf,keys={},last=0,t=0;
  function reset(){p={x:220,y:420};bullets=[];ebullets=[];enemies=[];parts=[];score=0;bombs=3;over=false;upd();}
  function upd(){root.querySelector('#sh-sc').textContent=score;root.querySelector('#sh-b').textContent=bombs;}
  function boom(x,y,n,col){for(let i=0;i<n;i++)parts.push({x,y,vx:(Math.random()-.5)*4,vy:(Math.random()-.5)*4,life:30,col:col||'#ffb020'});}
  function loop(ts){
    if(over){drawOver();return;}
    t++;
    if(keys['arrowleft']||keys['a'])p.x=Math.max(15,p.x-5);
    if(keys['arrowright']||keys['d'])p.x=Math.min(425,p.x+5);
    if(keys['arrowup']||keys['w'])p.y=Math.max(40,p.y-5);
    if(keys['arrowdown']||keys['s'])p.y=Math.min(465,p.y+5);
    if(t%8===0)bullets.push({x:p.x,y:p.y-14});
    if(t%40===0)enemies.push({x:20+Math.random()*400,y:-20,vy:1+Math.random()*1.5+score/3000,hp:1});
    if(t%90===0&&enemies.length)enemies[(Math.random()*enemies.length)|0].shoot=true;
    bullets.forEach(b=>b.y-=8); ebullets.forEach(b=>{b.y+=3;b.x+=b.vx||0;});
    enemies.forEach(e=>{e.y+=e.vy; if(e.shoot){ebullets.push({x:e.x,y:e.y+10,vx:(p.x-e.x)/120});e.shoot=false;}});
    // 碰撞
    bullets=bullets.filter(b=>{
      let hit=false;
      enemies=enemies.filter(e=>{ if(Math.abs(b.x-e.x)<14&&Math.abs(b.y-e.y)<14){hit=true;score+=10;setBest('best_shooter',score);boom(e.x,e.y,8,'#ff5d73');return false;} return true; });
      return !hit&&b.y>-10;
    });
    enemies=enemies.filter(e=>{
      if(Math.abs(e.x-p.x)<18&&Math.abs(e.y-p.y)<18){over=true;setBest('best_shooter',score);boom(p.x,p.y,24);return false;}
      return e.y<510;
    });
    ebullets=ebullets.filter(b=>{ if(Math.abs(b.x-p.x)<12&&Math.abs(b.y-p.y)<12){over=true;setBest('best_shooter',score);boom(p.x,p.y,24);return false;} return b.y<500; });
    parts=parts.filter(pt=>{pt.x+=pt.vx;pt.y+=pt.vy;return --pt.life>0;});
    upd();draw();raf=requestAnimationFrame(loop);
  }
  function draw(){
    ctx.fillStyle='#05081c';ctx.fillRect(0,0,440,480);
    ctx.fillStyle='#ffffff10';for(let i=0;i<40;i++){ctx.fillRect((i*97+t*2)%440,(i*53+t*4)%480,2,2);}
    ctx.font='26px sans-serif';ctx.textAlign='center';ctx.fillText('🚀',p.x,p.y);
    ctx.fillStyle='#00e0c6';bullets.forEach(b=>ctx.fillRect(b.x-2,b.y,4,10));
    ctx.fillStyle='#ff5d73';ebullets.forEach(b=>{ctx.beginPath();ctx.arc(b.x,b.y,4,0,7);ctx.fill();});
    enemies.forEach(e=>ctx.fillText('👾',e.x,e.y));
    parts.forEach(pt=>{ctx.fillStyle=pt.col;ctx.fillRect(pt.x,pt.y,3,3);});
  }
  function drawOver(){draw();ctx.fillStyle='rgba(0,0,0,.65)';ctx.fillRect(0,0,440,480);ctx.fillStyle='#fff';ctx.font='bold 28px sans-serif';ctx.textAlign='center';ctx.fillText('💥 坠毁 '+score+'分',220,240);}
  function key(e,down){keys[e.key.toLowerCase()]=down;if(e.key===' '&&down){if(bombs>0&&!over){bombs--;enemies.forEach(en=>boom(en.x,en.y,6));score+=enemies.length*10;enemies=[];ebullets=[];setBest('best_shooter',score);upd();}e.preventDefault();}}
  const kd=e=>key(e,true),ku=e=>key(e,false);
  window.addEventListener('keydown',kd);window.addEventListener('keyup',ku);
  let drag=false;
  cv.addEventListener('pointerdown',e=>drag=true);window.addEventListener('pointerup',()=>drag=false);
  cv.addEventListener('pointermove',e=>{if(!drag)return;const r=cv.getBoundingClientRect();p.x=(e.clientX-r.left)*(440/r.width);p.y=(e.clientY-r.top)*(480/r.height);});
  reset();raf=requestAnimationFrame(loop);
  root._restart=()=>{cancelAnimationFrame(raf);reset();t=0;raf=requestAnimationFrame(loop);};
  return ()=>{cancelAnimationFrame(raf);window.removeEventListener('keydown',kd);window.removeEventListener('keyup',ku);};
};

/* ============ 2048 ============ */
window.GAME_IMPL.game2048 = function(root){
  root.innerHTML=`<div class="score-bar"><span class="pill">分数 <b id="n-sc">0</b></span><span class="pill">最高 <b id="n-best">${getBest('best_2048')}</b></span></div>
  <div class="grid2048" id="n-g"></div>
  <div class="ctl-row"><button class="ctl-btn" data-m="up">▲</button></div>
  <div class="ctl-row"><button class="ctl-btn" data-m="left">◀</button><button class="ctl-btn" data-m="down">▼</button><button class="ctl-btn" data-m="right">▶</button></div>`;
  let g,score=0;
  const box=root.querySelector('#n-g');
  const COLORS={2:'#2b3a75',4:'#2f5d8a',8:'#1f8a70',16:'#0f9d6c',32:'#b7791f',64:'#c7512f',128:'#a63d5c',256:'#7c4dff',512:'#00b3ff',1024:'#ff5d73',2048:'#ffe27c'};
  function reset(){g=Array.from({length:4},()=>Array(4).fill(0));score=0;add();add();draw();}
  function add(){const e=[];g.forEach((r,y)=>r.forEach((v,x)=>{if(!v)e.push([y,x]);}));if(!e.length)return;const[y,x]=e[(Math.random()*e.length)|0];g[y][x]=Math.random()<.9?2:4;}
  function draw(){box.innerHTML='';g.flat().forEach(v=>{const d=document.createElement('div');d.className='cell2048';d.textContent=v||'';d.style.background=v?(COLORS[v]||'#ff8a5c'):'#1c2450';if(v>=128)d.style.color='#0b1020';else d.style.color='#fff';box.appendChild(d);});root.querySelector('#n-sc').textContent=score;root.querySelector('#n-best').textContent=getBest('best_2048');}
  function slide(row){row=row.filter(v=>v);for(let i=0;i<row.length-1;i++){if(row[i]===row[i+1]){row[i]*=2;score+=row[i];row.splice(i+1,1);}}while(row.length<4)row.push(0);return row;}
  function move(dir){
    let moved=false;const old=JSON.stringify(g);
    if(dir==='left')g=g.map(slide);
    if(dir==='right')g=g.map(r=>slide(r.reverse()).reverse());
    if(dir==='up'){for(let x=0;x<4;x++){let col=[g[0][x],g[1][x],g[2][x],g[3][x]];col=slide(col);for(let y=0;y<4;y++)g[y][x]=col[y];}}
    if(dir==='down'){for(let x=0;x<4;x++){let col=[g[0][x],g[1][x],g[2][x],g[3][x]].reverse();col=slide(col).reverse();for(let y=0;y<4;y++)g[y][x]=col[y];}}
    if(JSON.stringify(g)!==old){moved=true;add();setBest('best_2048',score);draw();checkOver();}
  }
  function checkOver(){if(g.flat().includes(0))return;for(let y=0;y<4;y++)for(let x=0;x<4;x++){if(x<3&&g[y][x]===g[y][x+1])return;if(y<3&&g[y][x]===g[y+1][x])return;}setTimeout(()=>alert('游戏结束! 分数:'+score),50);}
  function key(e){const m={arrowup:'up',w:'up',arrowdown:'down',s:'down',arrowleft:'left',a:'left',arrowright:'right',d:'right'}[e.key.toLowerCase()];if(m){move(m);e.preventDefault();}}
  window.addEventListener('keydown',key);
  root.querySelectorAll('.ctl-btn').forEach(b=>b.onclick=()=>move(b.dataset.m));
  let sx,sy;box.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY;},{passive:true});
  box.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;if(Math.abs(dx)<20&&Math.abs(dy)<20)return;move(Math.abs(dx)>Math.abs(dy)?(dx>0?'right':'left'):(dy>0?'down':'up'));});
  reset();
  root._restart=reset;
  return ()=>window.removeEventListener('keydown',key);
};

/* ============ 扫雷 ============ */
window.GAME_IMPL.minesweeper = function(root){
  const SZ=9,MINES=10;
  root.innerHTML=`<div class="score-bar"><span class="pill">💣 <b>${MINES}</b></span><span class="pill" id="m-st">状态：游戏中</span><button class="ctl-btn" id="m-re">↻ 重开</button></div>
  <div><div class="ms-grid" id="m-g" style="grid-template-columns:repeat(${SZ},32px)"></div></div>
  <p class="muted">左键翻开 · 右键/长按标旗 · 点 ↻ 换新图</p>`;
  const box=root.querySelector('#m-g'),st=root.querySelector('#m-st');
  let mines,open,flag,over,win,first=true,longT=null;
  function reset(){mines=new Set();open=new Set();flag=new Set();over=false;win=false;first=true;st.textContent='状态：游戏中';draw();}
  function key(x,y){return y*SZ+x;}
  function place(ex,ey){while(mines.size<MINES){const i=(Math.random()*SZ*SZ)|0;const x=i%SZ,y=(i/SZ)|0;if(Math.abs(x-ex)<=1&&Math.abs(y-ey)<=1)continue;mines.add(i);}}
  function around(x,y){let n=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){if(!dx&&!dy)continue;const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=SZ||ny>=SZ)continue;if(mines.has(key(nx,ny)))n++;}return n;}
  function reveal(x,y){
    if(over||win||flag.has(key(x,y)))return;
    if(first){place(x,y);first=false;}
    if(mines.has(key(x,y))){over=true;st.textContent='状态：💥 踩雷了!';draw();return;}
    const stack=[[x,y]];
    while(stack.length){const[cx,cy]=stack.pop();const k=key(cx,cy);if(open.has(k)||flag.has(k))continue;open.add(k);if(around(cx,cy)===0){for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const nx=cx+dx,ny=cy+dy;if(nx<0||ny<0||nx>=SZ||ny>=SZ)continue;if(!open.has(key(nx,ny))&&!mines.has(key(nx,ny)))stack.push([nx,ny]);}}}
    if(open.size===SZ*SZ-MINES){win=true;st.textContent='状态：🎉 通关!';try{const t=Date.now();const b=getBest('best_ms');if(!b||t<b)localStorage.setItem('best_ms',String(t));}catch(e){}}
    draw();
  }
  function draw(){
    box.innerHTML='';
    for(let y=0;y<SZ;y++)for(let x=0;x<SZ;x++){
      const d=document.createElement('div');const k=key(x,y);
      d.className='ms-cell'+(open.has(k)?' open':'')+(flag.has(k)?' flag':'');
      if(open.has(k)&&!mines.has(k)){const n=around(x,y);d.textContent=n||'';d.style.color=['','#5aa8ff','#5aff8a','#ffb020','#ff5d73','#c77dff','#00e0c6','#fff','#ffe27c'][n]||'#fff';}
      else if((over||win)&&mines.has(k))d.textContent='💣';
      else if(flag.has(k))d.textContent='🚩';
      d.oncontextmenu=e=>{e.preventDefault();if(!open.has(k)&&!over&&!win){flag.has(k)?flag.delete(k):flag.add(k);draw();}};
      d.onclick=()=>reveal(x,y);
      d.addEventListener('touchstart',()=>{longT=setTimeout(()=>{if(!open.has(k)){flag.has(k)?flag.delete(k):flag.add(k);draw();}},450);},{passive:true});
      d.addEventListener('touchend',()=>clearTimeout(longT));
      box.appendChild(d);
    }
  }
  root.querySelector('#m-re').onclick=reset;
  reset();root._restart=reset;
  return ()=>{};
};

/* ============ 五子棋 ============ */
window.GAME_IMPL.gomoku = function(root){
  const N=15,S=28;
  root.innerHTML=`<div class="score-bar"><span class="pill" id="go-st">你是黑子 ● 请落子</span><button class="ctl-btn" id="go-re">↻ 重开</button></div>
  <canvas id="go-cv" class="game-canvas gomoku-board" width="${N*S}" height="${N*S}"></canvas>`;
  const cv=root.querySelector('#go-cv'),ctx=cv.getContext('2d');
  let bd,over,lock;
  function reset(){bd=Array.from({length:N},()=>Array(N).fill(0));over=false;lock=false;root.querySelector('#go-st').textContent='你是黑子 ● 请落子';draw();}
  function draw(){
    ctx.fillStyle='#e8b96a';ctx.fillRect(0,0,N*S,N*S);
    ctx.strokeStyle='#8a5a2b';ctx.lineWidth=1;
    for(let i=0;i<N;i++){ctx.beginPath();ctx.moveTo(S/2,i*S+S/2);ctx.lineTo(N*S-S/2,i*S+S/2);ctx.stroke();ctx.beginPath();ctx.moveTo(i*S+S/2,S/2);ctx.lineTo(i*S+S/2,N*S-S/2);ctx.stroke();}
    bd.forEach((r,y)=>r.forEach((v,x)=>{if(!v)return;ctx.beginPath();ctx.arc(x*S+S/2,y*S+S/2,11,0,7);ctx.fillStyle=v===1?'#111':'#fff';ctx.fill();ctx.strokeStyle='#333';ctx.stroke();}));
  }
  function win(x,y,c){const dirs=[[1,0],[0,1],[1,1],[1,-1]];for(const[dx,dy]of dirs){let n=1;for(let s=1;s<5;s++){const nx=x+dx*s,ny=y+dy*s;if(nx<0||ny<0||nx>=N||ny>=N||bd[ny][nx]!==c)break;n++;}for(let s=1;s<5;s++){const nx=x-dx*s,ny=y-dy*s;if(nx<0||ny<0||nx>=N||ny>=N||bd[ny][nx]!==c)break;n++;}if(n>=5)return true;}return false;}
  function scorePos(x,y,c){ // 简单启发式
    let s=Math.random()*5;const dirs=[[1,0],[0,1],[1,1],[1,-1]];
    for(const[dx,dy]of dirs){let n=1,open=0;for(const sgn of[1,-1]){for(let k=1;k<5;k++){const nx=x+dx*k*sgn,ny=y+dy*k*sgn;if(nx<0||ny<0||nx>=N||ny>=N)break;if(bd[ny][nx]===c)n++;else if(bd[ny][nx]===0){open++;break;}else break;}}s+=n*n*10+open*3;}
    return s;
  }
  function ai(){
    lock=true;
    setTimeout(()=>{
      let bx=-1,by=-1,best=-1;
      for(let y=0;y<N;y++)for(let x=0;x<N;x++){if(bd[y][x])continue;let near=false;for(let dy=-2;dy<=2&&!near;dy++)for(let dx=-2;dx<=2;dx++){const nx=x+dx,ny=y+dy;if(nx>=0&&ny>=0&&nx<N&&ny<N&&bd[ny][nx]){near=true;break;}}if(!near)continue;
        const s=Math.max(scorePos(x,y,2)*1.1,scorePos(x,y,1));if(s>best){best=s;bx=x;by=y;}}
      if(bx<0){bx=7;by=7;}
      bd[by][bx]=2;draw();
      if(win(bx,by,2)){over=true;root.querySelector('#go-st').textContent='⚪ 白子(AI)获胜! 点↻再来';}
      else lock=false;
    },350);
  }
  cv.onclick=e=>{
    if(over||lock)return;
    const r=cv.getBoundingClientRect();const x=Math.round((e.clientX-r.left)*(N*S/r.width)-S/2)/S|0;const xx=Math.round(((e.clientX-r.left)*(N*S/r.width)-S/2)/S),yy=Math.round(((e.clientY-r.top)*(N*S/r.height)-S/2)/S);
    if(xx<0||yy<0||xx>=N||yy>=N||bd[yy][xx])return;
    bd[yy][xx]=1;draw();
    if(win(xx,yy,1)){over=true;root.querySelector('#go-st').textContent='🎉 黑子获胜! 太强了';try{setBest('best_gomoku',getBest('best_gomoku')+1);}catch(e){}return;}
    ai();
  };
  root.querySelector('#go-re').onclick=reset;
  reset();root._restart=reset;
  return ()=>{};
};

/* ============ 记忆翻牌 ============ */
window.GAME_IMPL.memory = function(root){
  root.innerHTML=`<div class="score-bar"><span class="pill">步数 <b id="mm-s">0</b></span><span class="pill">配对 <b id="mm-p">0/8</b></span><span class="pill">最少步 <b id="mm-b">${getBest('best_memory')||'—'}</b></span></div>
  <div class="mem-grid" id="mm-g"></div>`;
  const icons=['🍎','🚀','🐱','⚽','🎹','🌙','🐍','🚗'];
  let deck,first=null,lock=false,steps=0,pairs=0;
  function reset(){deck=[...icons,...icons].sort(()=>Math.random()-.5);first=null;lock=false;steps=0;pairs=0;draw();upd();}
  function upd(){root.querySelector('#mm-s').textContent=steps;root.querySelector('#mm-p').textContent=pairs+'/8';const b=getBest('best_memory');root.querySelector('#mm-b').textContent=b||'—';}
  function draw(){
    const box=root.querySelector('#mm-g');box.innerHTML='';
    deck.forEach((ic,i)=>{
      const d=document.createElement('div');d.className='mem-card';d.dataset.i=i;d.textContent='❓';
      d.onclick=()=>flip(d,i);
      box.appendChild(d);
    });
  }
  function flip(d,i){
    if(lock||d.classList.contains('open')||d.classList.contains('done'))return;
    d.classList.add('open');d.textContent=deck[i];
    if(!first){first={d,i};return;}
    steps++;upd();
    if(deck[first.i]===deck[i]){first.d.classList.add('done');d.classList.add('done');first=null;pairs++;upd();
      if(pairs===8){if(!getBest('best_memory')||steps<getBest('best_memory'))localStorage.setItem('best_memory',String(steps));setTimeout(()=>{alert('🎉 完成! 用了'+steps+'步');upd();},300);}
    } else {lock=true;const a=first.d;setTimeout(()=>{a.classList.remove('open');a.textContent='❓';d.classList.remove('open');d.textContent='❓';first=null;lock=false;},650);}
  }
  reset();root._restart=reset;
  return ()=>{};
};
