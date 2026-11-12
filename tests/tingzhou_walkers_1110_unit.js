// 汀州路的路人（TINGZHOU-WALKERS-1110；BB 2026-11-10：汀州路街上 0 個路人；使用者 11-10「真實城市道路……行人、固定店面、部分夜市攤位共存」「傍晚熱鬧」）——不需要瀏覽器。
//   原本 story3d.js 的 S.populate 沒有汀州路：進去一個路人都沒有。
//   1  路線資料 src/data/tingzhou_walk.js（index.html 有載入，在 story3d.js 前面）：兩側騎樓各一條、巷 A 一條
//   2  在 Node 裡建出真正的汀州路（tingzhou3d.js）：每個路點連隨機偏移的四個角都站得住；每一段（偏移的四個角互相）用引擎真正的移動走得到（走路的速度、低幀率）
//   3  不擋店門、不擋攤位：路點離每一間店門互動點、每一台攤車至少 1.6 m；路人一直走（不在路點停下來）、沒有名字、不能對話
//   4  人數照時間、畫質：每個時段、每個畫質都 > 0；夜市時段（17～23）最多、深夜最少；畫質低的人不比畫質高的多；最多不超過公館（16）；颱風假只剩一個、攤位收起來
//   5  story3d.js：S.populate 進汀州路照這份生路人（GM.spawnExtra）；walkRoutes.tingzhou 接上（其他系統查得到這一區的路線）
// 修改前（b99dfd4dd）：1 就 FAIL（沒有檔案）。用法：node tests/tingzhou_walkers_1110_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const WF='src/data/tingzhou_walk.js';
if(!fs.existsSync(path.join(ROOT,WF))){ check('1. 有 '+WF,false); console.log('FAILED '+fails); process.exit(1); }
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{});
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/tingzhou_layout.js','src/tingzhou3d.js',WF];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
ASSETS.loadOne=()=>new Promise(()=>{});
const W=TINGZHOU_WALK, L=TINGZHOU_LAYOUT, F=L.facade, html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'), story=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8');
// 1
check('1. index.html 載入 tingzhou_walk.js，在 tingzhou_layout.js 後面、story3d.js 前面',html.indexOf('src/data/tingzhou_walk.js')>html.indexOf('src/data/tingzhou_layout.js')&&html.indexOf('src/data/tingzhou_walk.js')<html.indexOf('src/story3d.js')&&html.indexOf('src/data/tingzhou_walk.js')>0);
{ const R=W.routes, inArc=(rt,sx)=>rt.every(p=>p[0]*sx>F.east&&p[0]*sx<F.east+F.arcade), A=(L.alleys.find(a=>a.market)||L.alleys[0])   /* SHUIYUAN-MARKET-LANE-1112：攤位和第三條路線搬到水源市場旁的巷子 */;
  check('1. 三條路線：西側騎樓、東側騎樓（都在立面和店面玻璃中間、南北各走到 30 m 以外）、水源市場旁的巷子（進到巷子裡 10 m 以上）',R.length===3&&W.jit.length===3&&inArc(R[0],-1)&&inArc(R[1],1)&&[R[0],R[1]].every(rt=>Math.min(...rt.map(p=>p[1]))<-30&&Math.max(...rt.map(p=>p[1]))>30)&&R[2].some(p=>p[0]>F.east+10&&p[1]>A.z0&&p[1]<A.z1),R.map(r=>r.length).join('/')); }
// 2
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null;
const z=Z3.ZONES.tingzhou.build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0};
const C=[[0,0],[1,1],[1,-1],[-1,1],[-1,-1]], badS=[], badW=[], nearD=[], nearS=[]; const doors=E.interactables.filter(i=>i.tzShop), stalls=z.tzStalls||[];
W.routes.forEach((rt,i)=>{ const j=W.jit[i]; rt.forEach((a,k)=>{ const b=rt[(k+1)%rt.length];
  for(const [dx,dz] of C){ const x=a[0]+dx*j[0], zz=a[1]+dz*j[1]; if(!E.canStand(x,zz,0.33,0)){ badS.push(`第 ${i+1} 條 ${k} (${x},${zz})`); continue; }
    for(const [ex,ez] of C){ let ok=true; for(const [dt,sp] of [[1/30,1.45],[0.1,1.45]]){ const r=E.simWalk(x,zz,b[0]+ex*j[0],b[1]+ez*j[1],{lv0:0,lv1:0,dt,speed:sp}); if(!r||!r.ok){ ok=false; break; } } if(!ok) badW.push(`第 ${i+1} 條 ${k}→${(k+1)%rt.length}`); } }
  for(const d of doors) if(Math.hypot(d.x-a[0],d.z-a[1])<1.6) nearD.push(`第 ${i+1} 條 ${k}→${d.tzShop}`);
  for(const s of stalls) if(Math.hypot(s.x-a[0],s.z-a[1])<1.6) nearS.push(`第 ${i+1} 條 ${k}→${s.id}`); }); });
check('2. 每個路點連偏移的四個角都站得住（人物半徑 0.33）',!badS.length,badS.slice(0,4).join(' | '));
check('2. 每一段走得到（引擎的移動模擬：走路、低幀率；偏移的四個角互相）',!badW.length,[...new Set(badW)].slice(0,4).join(' | '));
// 3
check('3. 路點離每一間店門互動點（'+doors.length+' 間）至少 1.6 m',doors.length===L.shops.length&&!nearD.length,nearD.slice(0,4).join(' | '));
check('3. 路點離每一台攤車（'+stalls.length+' 攤）至少 1.6 m',stalls.length>0&&!nearS.length,nearS.slice(0,4).join(' | '));
{ const g3=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8'), m=g3.match(/function spawnExtra\(spec,route,opts\)\{[^\n]*?return n; \}/);
  check('3. 路人（GM.spawnExtra）沒有名字、沿路線一直走不停（pauseAt:false）、不能對話（沒有 talk）',!!m&&/name:''/.test(m[0])&&/beh:'route'/.test(m[0])&&/pauseAt:false/.test(m[0])&&!/talk/.test(m[0])); }
// 4
const LV=['low','medium','high'], HS=[0.5,2,5,6.75,9,12,15,17,18,20,22.5,23.5], T=HS.map(h=>LV.map(l=>W.count(h,l)));
check('4. 每個時段、每個畫質都有路人（> 0）',T.every(r=>r.every(n=>n>0)),HS.map((h,i)=>h+':'+T[i].join('/')).join(' '));
check('4. 畫質低的人不比畫質高的多（low ≤ medium ≤ high）',T.every(r=>r[0]<=r[1]&&r[1]<=r[2]));
{ const at=(h,l)=>W.count(h,l||'high'), night=[17,18,20,22.5].map(h=>at(h)), day=[9,12,15].map(h=>at(h)), late=[2,5].map(h=>at(h));
  check('4. 夜市時段（17:00～23:00）比白天多、白天比深夜多；23:00 以後比夜市少；最多 16 個（和公館一樣）',Math.min(...night)>Math.max(...day)&&Math.min(...day)>Math.max(...late)&&at(23.5)<Math.min(...night)&&at(0.5)<at(23.5)&&Math.max(...T.map(r=>r[2]))<=16,J([night,day,late,at(23.5),at(0.5)]));
  { const nOpen=h=>L.stalls.list.filter(q=>TZ3.stallOpen(h,q,L)).length, n=L.stalls.list.length;   /* NIGHT-MARKET-1110（使用者 11-10：各攤時間不一樣）：不再是 17:00 全部一起開；改成比「夜市時段大部分的攤開著、下午只有少數」 */
    check('4. 夜市時段和攤位的時間對得上（17:00 起路人變多＝大部分的攤已經開；下午三點只有少數幾攤；22:54 還有一半以上）',W.night(17)&&!W.night(16.9)&&nOpen(17.5)>=n*0.7&&nOpen(15)<=n*0.3&&nOpen(15)>0&&W.night(22.9)&&nOpen(22.9)>=n*0.4&&TZ3.stallsOpen(22.9,L),[nOpen(15),nOpen(17.5),nOpen(22.9),n].join('/')); }
  check('4. 時間超過 24（凌晨 G.hour 25＝01:00）照 01:00 算',W.count(25,'high')===W.count(1,'high'));
  check('4. 颱風假：街上只剩一個人',LV.every(l=>W.count(19,l,true)===1)); }
{ const cnt=[0,0,0]; for(let i=0;i<W.count(19,'high');i++) cnt[W.routeOf(i,19)]++; const cd=[0,0,0]; for(let i=0;i<W.count(12,'low');i++) cd[W.routeOf(i,12)]++;
  check('4. 夜市時段三條路線都有人、市場旁的巷子最多；白天畫質最低也兩側都有人',cnt.every(n=>n>0)&&cnt[2]>=cnt[0]&&cnt[2]>=cnt[1]&&cd[0]>0&&cd[1]>0,J([cnt,cd])); }
// 5
check('5. story3d.js：進汀州路照 TINGZHOU_WALK 生路人（人數照時間、畫質、颱風；照 plan 的路點、出發點、速度）',/if\(zoneId==='tingzhou'&&typeof TINGZHOU_WALK!=='undefined'\)\{[\s\S]{0,900}?TW\.plan\(hr,E\.q\.level,ty,S\.CROWD_X,rnd\)[^\n]*GM\.spawnExtra\(extraSpec\(xi\+\+\),p\.pts,[^\n]*n\.ri=p\.start; n\.walkSpeed=p\.speed; E\.placeAt\(n,/.test(story));
check('5. story3d.js：walkRoutes.tingzhou 接上；颱風假攤位收起來（區域的 tzStallsClosed）',/walkRoutes\.tingzhou=TINGZHOU_WALK\.routes/.test(story)&&/E\.zone\.tzStallsClosed=ty/.test(story));
{ z.tzStallsClosed=true; z.applyTimeOutdoor(19,null); const off=z.tzStallsOn===false; z.tzStallsClosed=false; z.applyTimeOutdoor(19,null); check('5. 區域：tzStallsClosed 打開＝19:00 也不擺攤；關掉＝照時間擺',off&&z.tzStallsOn===true); }
// 6 不像同一個人複製一排（使用者 2026-11-10 看到一排一模一樣的機車以後交代）：外型、間距、速度、方向都要不一樣
{ const em=story.match(/\n  function extraSpec\(i\)\{[^\n]*\}\n/); let extraSpec=null; try{ extraSpec=em?vm.runInThisContext('('+em[0].trim()+')'):null; }catch(e){}
  check('6. 找得到 story3d.js 的 extraSpec（路人的外型）',typeof extraSpec==='function');
  let seed=7; const rnd=()=>{ seed=(seed*16807)%2147483647; return (seed-1)/2147483646; };
  const sig=s=>[s.sex,s.outfit.top.type,s.outfit.top.color,s.outfit.bottom.type,s.outfit.bottom.color,s.hair.style].join('|'), look=s=>[s.sex,s.outfit.top.type,s.outfit.top.color].join('|');
  for(const [h,l] of [[19,'high'],[19,'medium'],[19,'low'],[12,'high'],[12,'low'],[9,'medium']]){ const PL=W.plan(h,l,false,2,rnd), n=PL.length, tag=h+':00 '+l+'（'+n+' 人）';
    const specs=extraSpec?PL.map((p,i)=>extraSpec(i)):[], sg=specs.map(sig), sexes=new Set(specs.map(s=>s.sex));   /* 汀州路進區域時 xi 從 0 開始（S.populate 在這之前沒有別的路人）*/
    check('6. '+tag+'：人數＝count；外型不是同一個（整套不重複的至少一半、而且至少 4 種；男女都有）',n===W.count(h,l)&&new Set(sg).size>=Math.max(Math.min(4,n),Math.ceil(n/2))&&sexes.size===2,new Set(sg).size+' 種');
    const same=[]; for(const k of [0,1,2]){ const on=PL.map((p,i)=>[p,i]).filter(q=>q[0].route===k).sort((a,b)=>a[0].start-b[0].start); for(let a=0;a+1<on.length;a++) if(specs.length&&look(specs[on[a][1]])===look(specs[on[a+1][1]])) same.push(k+':'+on[a][1]+'/'+on[a+1][1]); }
    check('6. '+tag+'：同一條路線上前後兩個人的性別＋上衣不一樣（不是一排同樣的人）',!same.length,same.join(' '));
    let minD=1e9; const st=PL.map(p=>p.pts[p.start]); for(let a=0;a<n;a++) for(let b=a+1;b<n;b++) minD=Math.min(minD,Math.hypot(st[a][0]-st[b][0],st[a][1]-st[b][1]));
    const gaps=[]; for(const k of [0,1]){ const zs=PL.filter(p=>p.route===k).map(p=>p.pts[p.start][1]).sort((a,b)=>a-b); for(let a=0;a+1<zs.length;a++) gaps.push(+(zs[a+1]-zs[a]).toFixed(1)); }
    check('6. '+tag+'：出發的位置互相至少 '+W.gap+' m（不疊在一起）；騎樓上的間距不是等距的一列',minD>=W.gap-1e-6&&(gaps.length<3||new Set(gaps.map(g=>Math.round(g))).size>=2),minD.toFixed(1)+' m；間距 '+J(gaps));
    const sp=PL.map(p=>p.speed), dirOK=[0,1,2].every(k=>{ const on=PL.filter(p=>p.route===k); return on.length<2||(on.some(p=>p.rev)&&on.some(p=>!p.rev)); });
    check('6. '+tag+'：速度不一樣（至少 '+Math.min(4,n)+' 種、差 0.3 m/s 以上、都在 0.9～1.65）；有兩個人以上的路線兩個方向都有人',new Set(sp).size>=Math.min(4,n)&&Math.max(...sp)-Math.min(...sp)>=0.3&&sp.every(v=>v>=0.9&&v<=1.65)&&dirOK,J(sp));
    const bad=PL.filter(p=>!p.pts.every(q=>E.canStand(q[0],q[1],0.33,0))||p.start<0||p.start>=p.pts.length).length;
    check('6. '+tag+'：排出來的每個路點都站得住',!bad,String(bad)); } }
function J(x){ return JSON.stringify(x); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
