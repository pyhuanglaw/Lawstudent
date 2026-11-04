// 2:30 AM 室內 v1b 接進遊戲（WZ-SHOPS1-1104）＋AA_659 第 1 節店內台詞＋AA_657 一盞的劇情位置（WZ-YIZHAN-1104）——不需要瀏覽器（D131）。
//   A（遊戲真正的 cafe 區域：zones3d.js 照 AA 的 src/data/cafe230_layout.js v2 建，引擎真正的找路、移動 E.simWalk）：
//     A1 配置載入、正式模型登錄 bldg.cafe230_interior＝aa_support/cafe230.glb（檔案在）、LICENSES 一行、index.html 在 zones3d.js 前面
//     A2 不能動的 12 點（docs/handoff/WZ_SHOPS1_FIXED_COORDS.md 第 1 節）：出口、進門落點 (0,5) 前面沒有東西、出生點、打工上班、點餐、芷若／老闆（吧檯後面）、班表、學姊 5 號、第二天主線 0、1 號、打工告示——站得住、走得到、按鈕會出現
//     A3 座位：原本 17 個的位置與順序不變；吧檯 10～13 tag bar、沙發 14～16 tag sofa；卡座 17～19（配置 seats、tag booth、late）；
//        8～13、17～19 有按鈕（吧檯「坐吧檯」、其他「坐下」、cafeTable＝可以「點杯咖啡慢慢讀」）；每一個按鈕都按得到、從進門走得到（按不到的列出來）
//     A4 阻擋：卡座 (−6.7,0)、小圓桌 (−5.4,0) 擋住；大盆栽搬到 (−6.35,1.95)
//     A5 互動「看唱片」(4.1,−5.0)、「看蛋糕櫃」(1.4,−3.65)：按得到、走得到、不蓋掉點餐和班表
//     A6 配置沒載入：照舊（17 個座位、沒有卡座與新按鈕、大盆栽在 (−6.35,0.4)）
//   B（子程序，tests/pg_harness.js）：AA_659 第 1 節逐字（git show 企劃線；讀不到 SKIP）、看唱片輪流第 1、2 句／22:00 以後第 3 句、看蛋糕櫃 20:00 前後、芷若在吧檯第一次換她那一句；
//     店內偶遇以安「坐在沙發那一區」挑 tag sofa（shop_enc.js 的 tag、shopenc3d.js S.seatPick 通用：有 tag 照 tag、沒有照舊）；照作息坐下的人不先坐卡座（late）
//   C（子程序）：AA_657 逐字；c510_3_2、c506_3_3 的 zone、座標、時段、說話人；HCIRCLE.on 時段；ev_yt_family_dinner 當天（邀請送出）茶屋開到 21:00＋20:00 以後門口旁白、其他天 20:00 照舊擋；劇情匯入白名單
// 修改前（開發分支 e8c657891）：沒有 cafe230_layout.js、沒有 cafe230 區域接線、沒有 S.cafe230Line、AA187.fdDoorOpen、兩列還在 noodle——A1～A5、B、C 的主要檢查都 FAIL。
// 用法：node tests/cafe230_aa657_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');
const rd=p=>fs.readFileSync(path.join(ROOT,p),'utf8'), J=x=>JSON.stringify(x), r2=v=>+(+v).toFixed(2);
const git=(sha,f)=>{ try{ return cp.execFileSync('git',['-C',ROOT,'show',sha+':'+f],{encoding:'utf8',maxBuffer:1<<26,stdio:['ignore','pipe','ignore']}); }catch(e){ return ''; } };
const AA659='docs/story_planning/AA_659_溫州街新室內_店內台詞.md', AA657='docs/story_planning/AA_657_一盞茶屋_劇情對位置的決定.md';
if(process.argv[2]==='B') partB(); else if(process.argv[2]==='C') partC(); else partA();

function partA(){
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node')); console.warn=()=>{};
const T=rd('tests/nav_buildings_unit.js');
const files=[...new Set([...eval(T.match(/const files=(\[[^\]]+\])/)[1]),'src/data/calendar.js','src/data/places.js','src/data/wz_park_layout.js','src/data/wz_shops_layout.js','src/data/cafe230_layout.js'])];
const ord=f=>f.startsWith('lib/')?0:(f.startsWith('src/data/')?1:(f==='src/zones3d.js'?2:4));
const pre=files.filter(f=>ord(f)<2).concat(["src/zones3d.js"]).concat(files.filter(f=>ord(f)===4&&f!=="src/zones3d.js"));
for(const f of pre){ if(!fs.existsSync(path.join(ROOT,f))) continue; let src=rd(f); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
ASSETS.loadOne=()=>Promise.reject(new Error('no GLB in node'));
global.GAME={G:{zone:'cafe',day:30,hour:15,flags:{},money:5000,weather:'clear'}};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.exits=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; if(E.nav) E.nav._cm=null;
  E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; if(E.fitSeatRadius) E.fitSeatRadius(); return {z,its:E.interactables}; }
const walk=(a,b)=>{ for(const dt of [1/30,0.1]){ const r=E.simWalk(a[0],a[1],b[0],b[1],{dt}); if(!r.ok) return Object.assign({dt:r2(dt)},r); } return {ok:true}; };
function touchable(it,from){ const r=(it.radius||1.5)-0.05, P=E.player, c=[];
  for(let dz=-r;dz<=r+1e-6;dz+=0.1) for(let dx=-r;dx<=r+1e-6;dx+=0.1){ const d=Math.hypot(dx,dz); if(d>r) continue; const x=it.x+dx, z=it.z+dz; if(E.canStand(x,z,0.32,0)) c.push([d,x,z]); }
  c.sort((a,b)=>a[0]-b[0]); for(const [,x,z] of c){ P.obj.position.set(x,0,z); if(E.nearestInteractable()!==it) continue; if(from&&!walk(from,[x,z]).ok) continue; return [r2(x),r2(z)]; } return null; }
const L=typeof CAFE230_LAYOUT!=='undefined'?CAFE230_LAYOUT:null;
// ---- A1 ----
check('A1 配置 src/data/cafe230_layout.js v2 載入（zone cafe、glb aa_support/cafe230.glb）',!!L&&L.version===2&&L.zone==='cafe'&&L.glb==='assets/models/env/second_ai/aa_support/cafe230.glb',J(L&&[L.version,L.zone,L.glb]));
if(!L){ console.log('FAILED '+(fails)); process.exit(1); }
const R=loadZone('cafe'), z=R.z, its=R.its, IN=[0,5];
const man=ASSETS.manifest['bldg.cafe230_interior'];
check('A1 區域照新配置建（z.cafe230＝2）、正式模型登錄 bldg.cafe230_interior＝配置的 glb（檔案在、building）',z.cafe230===2&&!!man&&man.url===L.glb&&man.type==='building'&&fs.existsSync(path.join(ROOT,L.glb)),J(man&&man.url));
check('A1 zones3d.js：配置在的時候載 bldg.cafe230_interior、接 attachCafe230；不在照舊 bldg.cafe_interior＋attachCafeInterior',/if\(L230\)\{ cafe230Reg\(L230\); if\(typeof ASSETS!=='undefined'&&ASSETS\.manifest\['bldg\.cafe230_interior'\]\)/.test(rd('src/zones3d.js'))&&/attachRoomGLB\(z,g0,g,root\); attachCafe230\(E,z,g0,root\)/.test(rd('src/zones3d.js'))&&/else if\(typeof ASSETS!=='undefined'&&ASSETS\.manifest\['bldg\.cafe_interior'\]\)/.test(rd('src/zones3d.js')));
{ const h=rd('index.html'), sc=[...h.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]); check('A1 index.html：cafe230_layout.js 在 zones3d.js 前面',sc.indexOf('src/data/cafe230_layout.js')>0&&sc.indexOf('src/data/cafe230_layout.js')<sc.indexOf('src/zones3d.js')); }
check('A1 LICENSES.md：cafe230.glb 一行（本作 Blender、AA 製作）',/\| [^\n]*aa_support\/cafe230\.glb[^\n]*本作 Blender[^\n]*AA 製作/.test(rd('LICENSES.md')));
// ---- A2 不能動的點 ----
const ex=its.find(q=>q.exit&&q.exit.to==='wenzhou');
check('A2 #1 出口「離開咖啡廳」(0, 5.6) r 1.6 → 溫州街 (51.7, 0, −π/2)',!!ex&&ex.label==='離開咖啡廳'&&ex.x===0&&ex.z===5.6&&ex.radius===1.6&&J(ex.exit.spawn)===J({x:51.7,z:0,yaw:-Math.PI/2}));
if(ex){ const tp=touchable(ex,IN); check('A2 #1 出口按得到、從進門落點走得到',!!tp,J(tp)); }
const clearLine=(()=>{ const bad=[]; for(let zz=5.0;zz>=3.6;zz-=0.1) if(!E.canStand(0,zz,0.33,0)) bad.push(r2(zz)); return bad; })();
check('A2 #2 進門落點 (0, 5) 站得住（半徑 0.33），前面到 z 3.6 一路沒有東西（D：門口不放地上的東西）',E.canStand(0,5,0.33,0)&&!clearLine.length,J(clearLine));
check('A2 #3 出生點 (0, 4.6, π)：區域的 spawn、站得住',J(z.spawn)===J({x:0,z:4.6,yaw:Math.PI})&&E.canStand(0,4.6,0.33,0));
{ const w=walk(IN,[0,4.4]); check('A2 #4 打工上班的落點 (0, 4.4) 站得住、走得到',E.canStand(0,4.4,0.33,0)&&w.ok,J(w)); }
const order=its.find(q=>q.counter==='cafe');
check('A2 #5 「到吧檯點餐」(−2.5, −3.2) r 1.6',!!order&&order.label==='到吧檯點餐'&&order.x===-2.5&&order.z===-3.2&&order.radius===1.6);
if(order){ const tp=touchable(order,IN); check('A2 #5 點餐按得到（最近的互動就是它，吧檯椅的「坐吧檯」沒有蓋掉）、走得到',!!tp,J(tp)); }
check('A2 #6、#7 芷若 (−2.5, −5.15)、老闆 (−0.6, −5.25) 在吧檯後面（NPC，站不住＝不在客人區）',!E.canStand(-2.5,-5.15,0.3,0)&&!E.canStand(-0.6,-5.25,0.3,0));
const rota=its.find(q=>q.cafeRota);
check('A2 #8 「看班表」(0.7, −3.7) r 0.9',!!rota&&rota.label==='看班表'&&rota.x===0.7&&rota.z===-3.7&&rota.radius===0.9);
if(rota){ const tp=touchable(rota,IN); check('A2 #8 看班表按得到（不被「坐吧檯」13 號、「看蛋糕櫃」蓋掉）、走得到',!!tp,J(tp)); }
const S0=[[4.5,-3.3,0],[4.5,-1.7,Math.PI],[4.5,0.7,0],[4.5,2.3,Math.PI],[0,0.7,0],[0,2.3,Math.PI],[-4,1.7,0],[-4,3.3,Math.PI],[-0.85,1.5,Math.PI/2],[0.85,1.5,-Math.PI/2],
  [-4.5,-3.3,Math.PI],[-2.9,-3.3,Math.PI],[-1.3,-3.3,Math.PI],[0.3,-3.3,Math.PI],[-5.95,2.85,Math.PI/2],[-5.95,3.4,Math.PI/2],[-5.95,3.95,Math.PI/2]];
const sBad=S0.map((s,i)=>{ const q=z.seats[i]; return q&&Math.abs(q.x-s[0])<1e-6&&Math.abs(q.z-s[1])<1e-6&&Math.abs(q.yaw-s[2])<1e-6?null:i; }).filter(i=>i!==null);
check('A3 原本的 17 個座位位置、方向、順序都沒變（0、1＝第二天主線窗邊雙人桌、5＝學姊）',!sBad.length,J(sBad));
for(const [n,ap] of [[0,[3.9,-4.1]],[1,[3.9,-0.9]]]){ const w=walk(IN,ap); check(`A2 #10、#11 第二天主線 ${n} 號走近點 (${ap}) 站得住、走得到`,E.canStand(ap[0],ap[1],0.32,0)&&w.ok,J(w)); }
{ const sis=its.find(q=>q.seat&&q.seat.x===0&&q.seat.z===2.3); const tp=sis&&touchable(sis,IN); check('A2 #9 學姊 5 號 (0, 2.3) 的按鈕按得到、走得到',!!tp,J(tp)); }
{ const job={x:2.0,z:4.6,radius:1.0,label:'門上的告示'}; its.push(job); const tp=touchable(job,IN); its.splice(its.indexOf(job),1); check('A2 #12 打工告示 (2.0, 4.6) r 1.0（jobs3d.js 放進店裡）：按得到、走得到',!!tp,J(tp)); }
// ---- A3 座位 ----
check('A3 吧檯 10～13 tag bar（照舊 bar、lift 0.27）、沙發 14～16 tag sofa',[10,11,12,13].every(i=>z.seats[i].tag==='bar'&&z.seats[i].bar&&z.seats[i].lift===0.27)&&[14,15,16].every(i=>z.seats[i].tag==='sofa'&&z.seats[i].sofa));
const B=L.seats, bk=z.seats.slice(17);
check('A3 卡座 3 個接在 17 號後面（照配置的位置、方向；tag booth、late＝照作息最後才挑）',z.seats.length===20&&bk.every((q,i)=>q.x===B[i].x&&q.z===B[i].z&&q.yaw===B[i].yaw&&q.tag==='booth'&&q.late===true),J(bk));
const want={8:'坐下',9:'坐下',10:'坐吧檯',11:'坐吧檯',12:'坐吧檯',13:'坐吧檯',17:B[0].label,18:B[1].label,19:B[2].label};
const btn=i=>its.find(q=>q.seat&&q.cafeSeat===i);
const lbad=Object.keys(want).filter(i=>{ const b=btn(+i), q=z.seats[+i]; return !b||b.label!==want[i]||!b.cafeTable||Math.abs(b.seat.x-q.x)>1e-6||Math.abs(b.seat.z-q.z)>1e-6||(q.lift&&b.seat.lift!==q.lift); });
check('A3 8～13、17～19 有按鈕：吧檯「坐吧檯」（lift 0.27）、長桌兩端與卡座「坐下」／「坐卡座」；都帶 cafeTable（「點杯咖啡慢慢讀」，AA_659 第 1 節）',!lbad.length,J(lbad));
const seatBtns=its.filter(q=>q.seat), unreach=[];
for(const b of seatBtns){ if(!touchable(b,IN)) unreach.push([b.label,b.seat.x,b.seat.z]); }
check('A3 每一個座位按鈕（'+seatBtns.length+' 個：原本 4 桌＋沙發＋新開放 9 個）都按得到、從進門走得到',!unreach.length,J(unreach));
// ---- A4 ----
const blk=(L.blocks||[]).filter(b=>E.canStand(b[0],b[1],0.05,0));
check('A4 配置的阻擋（卡座 (−6.7,0)、小圓桌 (−5.4,0)）中心站不住',!blk.length&&L.blocks.length===2,J(blk));
check('A4 大盆栽搬到 (−6.35, 1.95)：那裡擋住（配置 plant_moved）',!E.canStand(-6.35,1.95,0.05,0)&&L.added.some(q=>q.kind==='plant_moved'&&J(q.to)===J([-6.35,1.95])));
// ---- A5 ----
for(const [kind,label,x,zz] of [['record','看唱片',4.1,-5.0],['pastry','看蛋糕櫃',1.4,-3.65]]){ const it=its.find(q=>q.wzShop==='cafe'&&q.kind===kind);
  check(`A5 「${label}」(${x}, ${zz})（wzShop cafe、kind ${kind}）`,!!it&&it.label===label&&it.x===x&&it.z===zz,J(it&&[it.label,it.x,it.z]));
  if(it){ const tp=touchable(it,IN); check(`A5 「${label}」按得到、從進門走得到`,!!tp,J(tp)); } }
// ---- A6 配置沒載入 ----
{ const keep=globalThis.CAFE230_LAYOUT; globalThis.CAFE230_LAYOUT=undefined; const R2=loadZone('cafe'); globalThis.CAFE230_LAYOUT=keep; const z2=R2.z, it2=R2.its;
  check('A6 配置沒載入：照舊（17 個座位、沒有新按鈕與唱片／蛋糕櫃、大盆栽在 (−6.35, 0.4)、(−6.35, 1.95) 站得住、卡座那裡站得住）',z2.seats.length===17&&!z2.cafe230&&!it2.some(q=>q.cafeSeat!=null||q.wzShop==='cafe')&&!E.canStand(-6.35,0.4,0.05,0)&&E.canStand(-6.35,1.95,0.05,0)&&E.canStand(-5.4,0,0.3,0),J([z2.seats.length,it2.filter(q=>q.seat).length])); }
// ---- B、C 子程序 ----
for(const part of ['B','C']){ const r=cp.spawnSync(process.execPath,[__filename,part],{encoding:'utf8',cwd:ROOT,timeout:300000});
  process.stdout.write(r.stdout||''); if(r.status!==0){ fails+=((r.stdout||'').match(/^FAIL /mg)||[]).length||1; if(r.stderr) console.log(part+' stderr:',r.stderr.split('\n').slice(0,6).join(' / ')); } }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
}

function partB(){
const H=require('./pg_harness.js'); const {check,GM}=H; console.warn=()=>{};
for(const f of ['src/data/shop_enc.js','src/shopenc3d.js','src/wzshops3d.js']){ let src=rd(f); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
const W=typeof WZS!=='undefined'?WZS:null;
check('B WZS.cafe230Line、S.CAFE230 在',!!W&&typeof W.cafe230Line==='function'&&!!W.CAFE230);
if(!W||!W.CAFE230) return H.done();
const DOC=git('origin/claude/story-planning',AA659)||git('21beb9d12',AA659);
const C=W.CAFE230, all=[...C.record,...C.pastry,'芷若：'+C.pastryZr];
if(!DOC) console.log('SKIP B 讀不到 '+AA659+'（企劃線沒 fetch）：逐字對照略過');
else { const sec1=DOC.slice(DOC.indexOf('## 1. 2:30 AM'),DOC.indexOf('## 2.'));
  const miss=all.filter(t=>!sec1.includes(t)); check('B AA_659 第 1 節逐字：看唱片三句、看蛋糕櫃兩句、芷若那一句',!miss.length&&C.record.length===3&&C.pastry.length===2,J(miss));
  check('B AA_659 第 1 節：按鈕字「看唱片」「看蛋糕櫃」「坐吧檯」、座標 (4.1, −5.0)、(1.4, −3.65)',['「看唱片」(4.1, −5.0)','「看蛋糕櫃」(1.4, −3.65)','吧檯椅寫「坐吧檯」'].every(t=>sec1.includes(t))); }
const G=H.fresh('2027-03-10',15,'cafe',{});
const seq=[]; for(let i=0;i<3;i++) seq.push(W.cafe230Line(G,'record').lines[0]);
G.hour=22; const a22=W.cafe230Line(G,'record').lines[0]; G.hour=25.5; const a1=W.cafe230Line(G,'record').lines[0]; G.hour=21.9; const a21=W.cafe230Line(G,'record').lines[0];
check('B 看唱片：照順序輪流第 1、2 句（15:00 連看三次＝1、2、1）；22:00 以後固定第 3 句（22:00、凌晨 01:30）；21:54 照輪',J(seq)===J([C.record[0],C.record[1],C.record[0]])&&a22===C.record[2]&&a1===C.record[2]&&a21===C.record[1],J({seq,a22,a1,a21}));
G.hour=19.98; const p0=W.cafe230Line(G,'pastry').lines[0]; G.hour=20; const p1=W.cafe230Line(G,'pastry').lines[0]; G.hour=24.5; const p2=W.cafe230Line(G,'pastry').lines[0];
check('B 看蛋糕櫃：20:00 前第 1 句、20:00 以後（含凌晨）第 2 句',p0===C.pastry[0]&&p1===C.pastry[1]&&p2===C.pastry[1],J([p0,p1,p2]));
const G2=H.fresh('2027-03-10',15,'cafe',{});
const z1=W.cafe230Line(G2,'pastry',true), z2=W.cafe230Line(G2,'pastry',true);
check('B 芷若在吧檯：第一次看蛋糕櫃換她那一句（記 CAFE230_PASTRY_ZR）、第二次照時段',z1.zr===true&&z1.lines[0]===C.pastryZr&&!z2.zr&&z2.lines[0]===C.pastry[0]&&G2.flags.CAFE230_PASTRY_ZR===true,J([z1,z2]));
(async()=>{
  const G3=H.fresh('2027-03-10',15,'cafe',{}); GM.npc.heroine_02={name:'林芷若',staff:'cafe'}; H.said=[];
  await W.interact(GM,{wzShop:'cafe',kind:'pastry'}); await W.interact(GM,{wzShop:'cafe',kind:'record'});
  check('B WZS.interact（按鈕 wzShop cafe）：芷若在吧檯＝她說那一句（說話人是她）、看唱片＝旁白',J(H.said.map(s=>[s.who,s.t]))===J([['林芷若',C.pastryZr],[null,C.record[0]]]),J(H.said));
  GM.npc={}; H.said=[]; const G4=H.fresh('2027-03-10',15,'cafe',{}); await W.interact(GM,{wzShop:'cafe',kind:'pastry'});
  check('B 芷若不在：看蛋糕櫃照時段的旁白、不記 CAFE230_PASTRY_ZR',J(H.said.map(s=>[s.who,s.t]))===J([[null,C.pastry[0]]])&&!G4.flags.CAFE230_PASTRY_ZR);
  /* 店內偶遇：以安「她坐在沙發那一區」→ tag sofa */
  const row=SHOP_ENC.rows.find(r=>r.who==='heroine_01'&&r.spot==='cafe');
  check('B shop_enc.js：以安 Café 那一列（「她坐在沙發那一區」）tag sofa（匯入工具加的）；其他列沒有 tag',!!row&&row.tag==='sofa'&&/坐在沙發/.test(row.why)&&SHOP_ENC.rows.filter(r=>r.tag).length===1&&/r\['tag'\] = 'sofa'/.test(rd('tools/shop_enc/import_shop_enc.py')));
  const seats=[{x:4.5,z:-3.3},{x:4.5,z:-1.7},{x:4.5,z:0.7},{x:4.5,z:2.3},{x:0,z:0.7},{x:0,z:2.3},{x:-4,z:1.7},{x:-4,z:3.3},{x:-0.85,z:1.5},{x:0.85,z:1.5},{x:-4.5,z:-3.3,bar:true,tag:'bar'},{x:-2.9,z:-3.3,bar:true,tag:'bar'},{x:-1.3,z:-3.3,bar:true,tag:'bar'},{x:0.3,z:-3.3,bar:true,tag:'bar'},
    {x:-5.95,z:2.85,sofa:true,tag:'sofa'},{x:-5.95,z:3.4,sofa:true,tag:'sofa'},{x:-5.95,z:3.95,sofa:true,tag:'sofa'},{x:-6.55,z:-0.55,tag:'booth',late:true}];
  const fakeGM={G:H.fresh('2027-03-13',14.5,'cafe',{}),E:{zone:{seats},npcs:[],interactables:[]}};
  const st=SHOPENC.seatPick(fakeGM,'cafe',row), st0=SHOPENC.seatPick(fakeGM,'cafe',{who:'x'});
  check('B SHOPENC.seatPick：有 tag 照 tag 挑（以安＝沙發）；沒有 tag 照舊（不坐吧檯、沙發、學姊的位子）',!!st&&st.tag==='sofa'&&!!st0&&!st0.sofa&&!st0.bar&&seats.indexOf(st0)!==5,J([st,st0]));
  const busy=typeof CROWD!=='undefined'?null:null; const seats2=seats.filter(q=>q.tag!=='sofa'); const st2=SHOPENC.seatPick({G:fakeGM.G,E:{zone:{seats:seats2},npcs:[],interactables:[]}},'cafe',row);
  check('B 沒有空的沙發＝沒有位子（不坐到別的地方，句子寫的是沙發那一區）',st2===null,J(st2));
  check('B story3d.js seatFree：late（2:30 AM 卡座）照作息的人最後才挑',/\(pass\|\|!isKeep\(st\)&&!st\.late\)\) return st;/.test(rd('src/story3d.js')));
  H.done(); })().catch(e=>{ check('B 例外',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); H.done(); });
}

function partC(){
const H=require('./pg_harness.js'); const {check,GM}=H; console.warn=()=>{};
const loadG=(f,names)=>{ let s=rd(f); for(const n of names) s=s.replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'='); vm.runInThisContext(s,{filename:f}); };
for(const [f,n] of [['src/sideq3d.js',['SIDEQ']],['src/data/pool_story.js',['POOL_STORY']],['src/pool3d.js',['POOL']],['src/data/heroine_circle.js',['HCIRCLE_DATA']],['src/hcircle3d.js',['HCIRCLE']],
  ['src/data/cracktalk_lines.js',['CRACKTALK_LINES']],['src/cracktalk3d.js',['CRACKTALK']],['src/aa187_3d.js',['AA187']]]) loadG(f,n);
const toasts=[]; GM.toast=t=>toasts.push(t); GM.caption=()=>{};
const DOC=git('origin/claude/story-planning',AA657)||git('1aadca7e4',AA657);
const R=id=>HCIRCLE_DATA.ROWS.find(r=>r.id===id), Sc=id=>HCIRCLE_DATA.SCHED.find(s=>s.hc===id);
const a=R('c510_3_2'), b=R('c506_3_3');
check('C c510_3_2：zone wz_teahouse、seatAt 語彤木凳 (3.05, 3.35)、standAt (2.3, 3.4)、週四 17:30～20:00、句子照舊',!!a&&a.zone==='wz_teahouse'&&J(a.seatAt)===J([3.05,3.35])&&J(a.standAt)===J([2.3,3.4])&&J(a.days)===J([4])&&a.from===17.5&&a.to===20&&a.heard==='（她坐在吧檯最旁邊，考古題攤開。客人進來，她把書闔上，站起來。）'&&/^一盞：水屋旁的木凳（語彤顧店的位子）/.test(a.place),J(a&&[a.zone,a.seatAt,a.standAt,a.days,a.from,a.to]));
const HB='常來的阿伯：妳錄這個要幹嘛？／語彤：做報告。／常來的阿伯：報告寫我？……那要寫我年輕的時候很帥。／語彤：……我記下來了。';
check('C c506_3_3：zone wz_teahouse、act read、週四、週五 14:30～15:30、阿伯坐對面 (−0.7, 2.45)、「常來的阿伯」、place 照 AA_657',!!b&&b.zone==='wz_teahouse'&&b.act==='read'&&J(b.days)===J([4,5])&&b.from===14.5&&b.to===15.5&&J(b.comp)===J({hc_uncle:{seatAt:[-0.7,2.45]}})&&b.heard===HB&&b.place==='一盞：茶席最東邊、靠水屋的位子，阿伯坐對面（午後客人少）'&&HCIRCLE_DATA.PEOPLE.hc_uncle.label==='常來的阿伯'&&HCIRCLE_DATA.NAMES['常來的阿伯']==='hc_uncle',J(b&&[b.zone,b.days,b.comp]));
const s1=Sc('c506_3_3'), s2=Sc('c510_3_2');
check('C 作息補：c506_3_3 茶席最東 seatAt (−0.7, 0.95)、週四五 14:30～15:30；c510_3_2 週四 17:30～20:00 一盞（她上班的點 (2.95, 2.4)）',!!s1&&s1.e.zone==='wz_teahouse'&&J(s1.e.seatAt)===J([-0.7,0.95])&&J(s1.e.days)===J([4,5])&&s1.e.act==='read'&&!!s2&&s2.e.zone==='wz_teahouse'&&s2.e.to===20&&J(s2.e.at.slice(0,2))===J([2.95,2.4]));
check('C hcircle3d.js S.place：同伴的 comp seatAt＝坐那個位子',/if\(opt\.seatAt\)\{/.test(rd('src/hcircle3d.js')));
if(!DOC) console.log('SKIP C 讀不到 '+AA657+'（企劃線沒 fetch）：逐字對照略過');
else check('C AA_657 逐字：座標、時間、「常來的阿伯」四句、place 兩句、門口旁白',['`seatAt` 語彤木凳 (3.05, 3.35)','`standAt` (2.3, 3.4)','週四 17:30～**20:00**','(−0.7, 0.95)','(−0.7, 2.45)','**週四、週五**','常來的阿伯：妳錄這個要幹嘛？／語彤：做報告。／常來的阿伯：報告寫我？……那要寫我年輕的時候很帥。／語彤：……我記下來了。',
  '「一盞：水屋旁的木凳（語彤顧店的位子）」','「一盞：茶席最東邊、靠水屋的位子，阿伯坐對面（午後客人少）」','「（門口的燈還亮著。暖簾收起來了，可是門沒鎖。）」','**時間照舊 20:30～21:00**'].every(t=>DOC.includes(t))&&AA187.FD_DOOR==='（門口的燈還亮著。暖簾收起來了，可是門沒鎖。）');
const DK=k=>STORY.dayOfKey(k), wdOf=d=>CALENDAR.dateOf(d).wd%7;
const fresh=(d,h,zone,flags)=>{ const G=H.fresh(CALENDAR.dateOf(d).key,h,zone,Object.assign({EXCHANGE_ROUTE:'TW',afternoonDone:true},flags||{})); G.weekday=wdOf(d); G.hour=h; if(!G.contacts) G.contacts={}; if(!Array.isArray(G.outings)) G.outings=[]; G.invites=[]; return G; };
const onAt=(r,key,h,zone)=>{ const d=DK(key); fresh(d,h,zone||'wz_teahouse'); return HCIRCLE.on(r,H.G,zone||'wz_teahouse'); };
check('C c510_3_2：2029-06-07（四）18:00、19:59 在一盞成立；20:00、17:20、2029-06-06（三）不成立；在麵店不成立',onAt(a,'2029-06-07',18)&&onAt(a,'2029-06-07',19.98)&&!onAt(a,'2029-06-07',20)&&!onAt(a,'2029-06-07',17.3)&&!onAt(a,'2029-06-06',18)&&!onAt(a,'2029-06-07',18,'noodle'),J([onAt(a,'2029-06-07',18),onAt(a,'2029-06-07',20)]));
{ const days=[]; for(let d=DK('2027-07-09');d<=DK('2027-09-05');d++) days.push(d); const th=days.filter(d=>wdOf(d)===4), fr=days.filter(d=>wdOf(d)===5), tu=days.filter(d=>wdOf(d)===2);
  const he=d=>{ fresh(d,15,'wz_teahouse'); return HCIRCLE.heroEnt(b,H.G); }, e=d=>{ fresh(d,15,'wz_teahouse'); return STORY.schedEnt(CHARACTERS.heroine_03,H.G); };
  const inTpe=d=>{ fresh(d,15,'wz_teahouse'); return !STORY.reachable||STORY.reachable('heroine_03',H.G); }, th1=th.filter(inTpe), fr1=fr.filter(inTpe);   /* 7/20～7/31 她不在臺北（presence）：那幾天本來就不在 3D */
  const okTh=th1.filter(d=>he(d)).length, okFr=fr1.filter(d=>he(d)).length, okTu=tu.filter(d=>he(d)).length, e1=e(th[0]);
  check('C c506_3_3：暑假週四、週五 15:00（她在臺北的日子）她在一盞茶席最東（作息 read、seatAt (−0.7, 0.95)）；週二不在（一盞公休）',th1.length>=5&&fr1.length>=5&&okTh===th1.length&&okFr===fr1.length&&okTu===0&&!!e1&&e1.zone==='wz_teahouse'&&J(e1.seatAt)===J([-0.7,0.95]),J({okTh,nTh:th1.length,okFr,nFr:fr1.length,okTu,e1:e1&&[e1.zone,e1.seatAt]})); }
/* ev_yt_family_dinner：門 */
check('C AA187.fdDoorOpen、fdDoorLine 在',typeof AA187.fdDoorOpen==='function'&&typeof AA187.fdDoorLine==='function');
const door={x:-20.5,z:4.1,radius:1.2,label:'進去一盞',exit:{to:'wz_teahouse',spawn:{x:-3,z:4.2,yaw:Math.PI}}};
const knock=async(key,h,sent)=>{ const d=DK(key); const G=fresh(d,h,'wenzhou'); G.flags.dating_heroine_03=true; H.FRIEND('heroine_03'); if(sent){ G.hour=17.05; AA187.phone(G); PHONE.tick(G); G.hour=h; } toasts.length=0; H.said=[]; const r=await STORY.interact(Object.assign({},door),GM); return {r,toasts:toasts.slice(),said:H.said.map(s=>s.t),sent:PHONE.sent(G,'aa187_fd')}; };
(async()=>{
  const x1=await knock('2029-04-26',20.5,true), x2=await knock('2029-04-26',20.95,true), x3=await knock('2029-04-26',21.0,true), x4=await knock('2029-04-26',20.5,false), x5=await knock('2029-04-25',20.5,false), x6=await knock('2029-04-27',20.5,false), x7=await knock('2029-04-26',15,true);
  const closed=x=>x.r===true&&x.toasts.length===1&&/12:00–20:00|週三～週日/.test(x.toasts[0]);
  check('C 2029-04-26 邀請送出了：20:30、20:57 門讓你進去（不擋、不出關門的字）＋門口旁白一句',x1.sent&&x1.r!==true&&!x1.toasts.length&&J(x1.said)===J([AA187.FD_DOOR])&&x2.r!==true&&!x2.toasts.length&&J(x2.said)===J([AA187.FD_DOOR]),J({x1,x2}));
  check('C 那天 21:00 以後照舊擋；邀請沒送出照舊擋；其他天（4/25 週三、4/27 週五）20:30 照舊擋',closed(x3)&&closed(x4)&&closed(x5)&&closed(x6),J({x3,x4,x5,x6}));
  check('C 那天 15:00（照常營業）進門不說旁白',x7.r!==true&&!x7.toasts.length&&!x7.said.length,J(x7));
  const al=JSON.parse(rd('docs/handoff/story_import_allow.json')).files, e659=al.find(q=>q.path===AA659), e657=al.find(q=>q.path===AA657);
  check('C 劇情匯入白名單：AA_659（21beb9d12）、AA_657（65a1b2fe9，1aadca7e4 在 history），approved、AA（D109）',!!e659&&e659.sha==='21beb9d12'&&e659.status==='approved'&&e659.approvedBy==='AA（D109）'&&!!e657&&e657.sha==='65a1b2fe9'&&(e657.history||[]).some(h=>h.sha==='1aadca7e4')&&e657.status==='approved'&&e657.approvedBy==='AA（D109）');
  H.done(); })().catch(e=>{ check('C 例外',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); H.done(); });
}
