// ROOM-MAP-LABELS-1030（使用者 2026-10-30：「教室 應該在地圖顯示 例如普通 101 要能從地圖看的出來 往哪邊是哪間教室 其他教學樓也依樣」）——不需要瀏覽器。
// src/roommap3d.js（ROOMMAP）給小地圖（game3d.js drawMinimap）和大地圖（guide3d.js drawMap）的教室名牌：
//   1. 每個教學館區域（普通、博雅、共同、霖澤館 1F／2F、霖澤館 3F、4F、萬才館）都有每間教室的門號與位置：
//      普通、博雅、共同＝配置 rooms 的教室、階梯教室、門號是數字的關著的教室（名牌在房間正中間，同一層）；霖澤館、萬才館＝配置 doors 的教室門（名牌在門口的互動點）；
//      洗手間、器材室、往空橋、樓梯間、辦公室不標；名字從配置讀（改配置的名字，名牌跟著改）。
//   2. 多樓層照所在那一層（1F 只有 1F 的教室、2F 只有 2F 的）。
//   3. 今天還要上的課的那一間有標記（today：幾點、哪一門課）；下課以後、別間沒有。霖澤館 201（classroom 區）、202（linze_202）、萬才館多功能教室（wancai_multi）、研討室 A（門口上課）都對得到門。
//   4. 小地圖（假的 2D canvas 記下畫了什麼）：字正著寫（位置照地圖旋轉算，和 NPC 點同一套換算）、在小地圖裡面、不重疊、今天的那一間金色「★101」、字夠大（手機直向：畫布 224×160 顯示成 112×80，字 ≥ 18 px＝9 CSS px）。
//      大地圖：今天的那一間「★ 101（…）　幾點 課名」；擠的時候只寫門號、不和別的字重疊。
//   5. 接線：index.html 載入 src/roommap3d.js（GAME.boot 以前）；game3d.js 的 drawMinimap 照玩家那一層呼叫 ROOMMAP.drawMini；guide3d.js 的 drawMap 呼叫 ROOMMAP.drawBig（分層時照那一層）。
// 修改前：沒有 src/roommap3d.js（全部 FAIL）。用法：node tests/room_map_labels_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.window=global; global.self=global; global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.location={search:''}; console.warn=()=>{};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>'globalThis.'+n+'='); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/putong_layout.js','src/data/boya_layout.js','src/data/gongtong_layout.js','src/data/linze_layout.js','src/data/wancai_layout.js','src/data/linze_upper_layouts.js','src/data/room_glb_layouts.js',
  'src/data/calendar.js','src/data/courses.js','src/data/activities.js','src/classes3d.js']) load(f);
if(!fs.existsSync(path.join(ROOT,'src/roommap3d.js'))){ check('0. 有 src/roommap3d.js（ROOMMAP）',false,'沒有這個檔'); console.log('\n'+fails+' 項 FAIL'); process.exit(1); }
load('src/roommap3d.js');
const R=z=>ROOMMAP.rooms(z), ids=z=>R(z).map(q=>q.num||q.mini).sort().join(',');
// ---------- 1. 每個教學館區域的每間教室 ----------
const want={putong:'101,102,103,104,201,202,203,204',boya:'101,102,103,201,202,203,204',gongtong:'101,102,201,202,203',linze:'101,201,202',linze_3f:'301,302',linze_4f:'401,402',wancai:'多功能教室,演講廳,研討室 A,研討室 B'};
for(const z of Object.keys(want)) check('1. '+z+'：每間教室都有名牌（'+want[z]+'）',ids(z)===want[z],ids(z));
{ const bad=[]; for(const [z,L] of [['putong',PUTONG_LAYOUT],['boya',BOYA_LAYOUT],['gongtong',GONGTONG_LAYOUT]]) for(const q of R(z)){ const r=L.rooms.find(o=>String(o.id)===q.id); if(!r||q.x<r.x0||q.x>r.x1||q.z<r.z0||q.z>r.z1||(q.lv|0)!==(r.lv|0)) bad.push(z+' '+q.id); }
  check('1. 普通、博雅、共同：名牌在那一間的正中間、同一層',!bad.length,bad.join(',')); }
{ const bad=[]; for(const [z,L,zf] of [['linze',LINZE_LAYOUT,d=>-LINZE_LAYOUT.D/2+0.75],['wancai',WANCAI_LAYOUT,d=>-WANCAI_LAYOUT.D/2+0.75],['linze_3f',LINZE_UPPER_LAYOUTS['3f'],d=>d.z+0.75],['linze_4f',LINZE_UPPER_LAYOUTS['4f'],d=>d.z+0.75]]) for(const q of R(z)){ const d=L.doors.find(o=>String(o.id)===q.id); if(!d||Math.abs(q.x-d.x)>1e-6||Math.abs(q.z-zf(d))>0.01||(q.lv|0)!==(d.lv|0)) bad.push(z+' '+q.id); }
  check('1. 霖澤館、萬才館：名牌在教室門口（和門的互動點同一點、同一層）',!bad.length,bad.join(',')); }
{ const all=Object.keys(want).flatMap(z=>R(z).map(q=>q.label)); check('1. 洗手間、器材室、往空橋、樓梯間、辦公室、研究室不標',!all.some(t=>/洗手間|器材室|空橋|樓梯間|辦公室|研究室/.test(t)),all.filter(t=>/洗手間|器材室|空橋|樓梯間|辦公室|研究室/.test(t)).join(',')); }
{ const r=PUTONG_LAYOUT.rooms.find(o=>o.id==='101'), old=r.label; r.label='普通 101 測試改名'; const q=R('putong').find(o=>o.id==='101'); r.label=old;
  const b=R('boya').find(o=>o.id==='101');
  check('1. 名字從配置讀（配置改名，名牌跟著改）：普通 101 的大地圖字「101 測試改名」、小地圖字「101」；博雅 101「101（階梯教室）」',!!q&&q.text==='101 測試改名'&&q.mini==='101'&&!!b&&b.text==='101（階梯教室）',q&&(q.text+' / '+q.mini)); }
check('1. 其他區域（校園、總圖、霖澤館 5F 研究室）沒有教室名牌',R('campus').length===0&&R('library_hall').length===0&&R('linze_5f').length===0);
// ---------- 2. 多樓層照所在那一層 ----------
const at=(z,lv)=>ROOMMAP.labels({day:1,hour:8,flags:{}},z,lv).map(q=>q.num||q.mini).sort().join(',');
check('2. 普通 1F：101～104；2F：201～204',at('putong',0)==='101,102,103,104'&&at('putong',1)==='201,202,203,204',at('putong',0)+' / '+at('putong',1));
check('2. 博雅 1F：101、102、103；2F：201～204',at('boya',0)==='101,102,103'&&at('boya',1)==='201,202,203,204',at('boya',0)+' / '+at('boya',1));
check('2. 共同 1F：101、102；2F：201～203',at('gongtong',0)==='101,102'&&at('gongtong',1)==='201,202,203',at('gongtong',0)+' / '+at('gongtong',1));
check('2. 霖澤館 1F：101；2F：201、202；萬才館 1F：演講廳、多功能教室；2F：研討室 A、B',at('linze',0)==='101'&&at('linze',1)==='201,202'&&at('wancai',0)==='多功能教室,演講廳'&&at('wancai',1)==='研討室 A,研討室 B',at('linze',1)+' / '+at('wancai',1));
// ---------- 3. 今天的教室 ----------
/* 照課表找一天：那一區有課（CLS.dayItems 的 room）*/
const find=(pred)=>{ for(let d=-380;d<1500;d++){ const T=CALENDAR.termOf(d); if(!T) continue; const G={day:d,hour:7,flags:{},stage:/^Y0/.test(T.id)?'econ':'law',weekday:CALENDAR.dateOf(d).wd%7}; let L=[]; try{ L=CLS.dayItems(G); }catch(e){ continue; } const it=L.find(pred); if(it) return {G,it}; } return null; };
const cases=[['putong',it=>it.room.zone==='putong','101'],['boya',it=>it.room.zone==='boya','101'],['gongtong',it=>it.room.zone==='gongtong','102'],['linze',it=>it.room.zone==='classroom','201'],['linze',it=>it.room.zone==='linze_202','202'],['wancai',it=>it.room.zone==='wancai_multi','多功能教室'],['wancai',it=>it.room.zone==='wancai'&&it.room.label==='研討室 A','研討室 A']];
for(const [z,pred,room] of cases){ const f=find(pred); if(!f){ check('3. '+z+' '+room+'：找得到有課的那一天',false); continue; }
  const {G,it}=f, k=q=>q.num||q.mini; const lv=R(z).find(q=>k(q)===room).lv; G.hour=it.t0-0.4; const L=ROOMMAP.labels(G,z,lv), mine=L.find(q=>k(q)===room), others=L.filter(q=>k(q)!==room&&q.today&&!CLS.dayItems(G).some(t=>t!==it&&ROOMMAP.matches(z,q,t)&&G.hour<t.t1));
  G.hour=it.t1+0.05; const after=ROOMMAP.labels(G,z,lv).find(q=>k(q)===room);
  check('3. '+z+' '+room+'（'+CALENDAR.dateOf(G.day).key+' '+it.c.name+'）：上課前標今天（幾點、課名）、別間不標、下課以後不標',!!mine&&!!mine.today&&Math.abs(mine.today.t0-it.t0)<1e-6&&mine.today.name===it.c.name&&!others.length&&(!after||!after.today||CLS.dayItems(G).some(t=>t!==it&&ROOMMAP.matches(z,after,t)&&G.hour<t.t1)),mine&&JSON.stringify(mine.today)); }
check('3. 過了午夜（G.hour ≥ 24）今天的課都不標',ROOMMAP.todayItems({day:30,hour:24.5,flags:{}}).length===0);
// ---------- 4. 畫出來 ----------
function mockCtx(W,H){ const o={canvas:{width:W,height:H},calls:[],rot:0,font:'10px sans-serif',fillStyle:'',strokeStyle:'',lineWidth:1,textAlign:'start',textBaseline:'alphabetic',lineJoin:'miter',
  save(){},restore(){},rotate(a){ this.rot+=a; },translate(){},setTransform(){},measureText(t){ const m=/(\d+)px/.exec(this.font); return {width:(m?+m[1]:10)*[...String(t)].length*0.62}; },
  strokeText(){},fillText(t,x,y){ this.calls.push({t,x,y,font:this.font,fill:this.fillStyle,rot:this.rot,align:this.textAlign}); },beginPath(){},arc(){},fill(){},stroke(){},rect(){},fillRect(){},drawImage(){}}; return o; }
/* 普通教學館 1F 的導航格（和 teach3d.js 同一套：0.4 m 一格，原點在西北角外 1 m）；小地圖 indoor scale 4.5 */
const nav={cell:0.4,ox:(Math.floor((-PUTONG_LAYOUT.W/2-1)/0.4+1e-9)-0.5)*0.4,oz:(Math.floor((-PUTONG_LAYOUT.D/2-1)/0.4+1e-9)-0.5)*0.4,toCell(x,z){ return [Math.floor((x-this.ox)/this.cell),Math.floor((z-this.oz)/this.cell)]; }};
const PF=find(it=>it.room.zone==='putong'); const GP=PF.G; GP.hour=PF.it.t0-0.4;
const draw=(px,pz,yaw,lv)=>{ const x=mockCtx(224,160), [cx,cz]=nav.toCell(px,pz); const d=ROOMMAP.drawMini(x,nav,cx,cz,4.5,yaw,224,160,GP,'putong',lv); return {x,d,cx,cz}; };
{ const {x,d,cx,cz}=draw(-8,-1.6,0,0), t=d.find(q=>q.today);   /* 走廊上、101 門口附近，鏡頭朝北（yaw 0：前方＝北） */
  check('4. 小地圖（普通 1F，101 門口、朝北）：畫了 101、今天的那一間金色「★101」',!!t&&t.text==='★101'&&x.calls.some(c=>c.t==='★101'&&/ffd88a/i.test(c.fill)),d.map(q=>q.text).join(','));
  check('4. 小地圖的字正著寫（畫字的時候沒有旋轉）、字夠大（≥ 18 px）',x.calls.length>0&&x.calls.every(c=>c.rot===0&&+(/(\d+)px/.exec(c.font)||[0,0])[1]>=18),x.calls.map(c=>c.font).join(' | '));
  const inb=d.every(q=>q.box[0]>=0&&q.box[2]<=224&&q.box[1]>=0&&q.box[3]<=160), ov=d.some((a,i)=>d.some((b,j)=>j>i&&a.box[0]<b.box[2]&&a.box[2]>b.box[0]&&a.box[1]<b.box[3]&&a.box[3]>b.box[1]));
  check('4. 小地圖的字都在小地圖裡面、互相不重疊',d.length>0&&inb&&!ov,d.map(q=>q.text+'@'+q.x.toFixed(0)+','+q.y.toFixed(0)).join(' '));
  const q101=R('putong').find(q=>q.id==='101'), q103=R('putong').find(q=>q.id==='103'), e101=d.find(q=>q.id==='101'), e103=d.find(q=>q.id==='103');
  check('4. 位置：朝北時 101（北邊的教室）在上面、103（南邊）在下面；和 NPC 點同一套換算（格子＋旋轉）',!!e101&&!!e103&&e101.y<80&&e103.y>80,(e101?e101.y.toFixed(0):'-')+' / '+(e103?e103.y.toFixed(0):'-')); }
{ const a=draw(-8,-1.6,0,0).d.find(q=>q.id==='101'), b=draw(-8,-1.6,Math.PI/2,0).d.find(q=>q.id==='101');
  /* yaw＝π/2：鏡頭在玩家東邊、前方＝西：101 在玩家西北 → 畫面上方偏右（地圖轉 90°）*/
  const exp=(()=>{ const [cx,cz]=nav.toCell(-8,-1.6), u=((q=>((q.x-nav.ox)/nav.cell-cx-0.5)*4.5)(R('putong').find(q=>q.id==='101'))), v=((R('putong').find(q=>q.id==='101').z-nav.oz)/nav.cell-cz-0.5)*4.5; return [112+u*Math.cos(Math.PI/2)-v*Math.sin(Math.PI/2),80+u*Math.sin(Math.PI/2)+v*Math.cos(Math.PI/2)]; })();
  check('4. 小地圖跟著鏡頭轉：yaw π/2 時 101 的位置＝地圖旋轉以後的那一點（字還是正的）',!!a&&!!b&&Math.abs(b.x-exp[0])<0.01&&Math.abs(b.y-exp[1])<0.01&&(Math.abs(a.x-b.x)>5||Math.abs(a.y-b.y)>5),b&&(b.x.toFixed(1)+','+b.y.toFixed(1)+' 期望 '+exp.map(v=>v.toFixed(1)).join(','))); }
{ /* 萬才館 2F 走廊（研討室 A x −3.0、B x 1.5，門相距 4.5 m）：沒有門號的名字長，放不下改短的（研討A）、字小一點（≥ 16 px），兩間都寫、不重疊 */
  const wn={cell:WANCAI_LAYOUT.cell,ox:-WANCAI_LAYOUT.W/2-1,oz:-WANCAI_LAYOUT.D/2-1,toCell(x,z){ return [Math.floor((x-this.ox)/this.cell),Math.floor((z-this.oz)/this.cell)]; }};
  const x=mockCtx(224,160), [cx,cz]=wn.toCell(-0.75,-4.2), d=ROOMMAP.drawMini(x,wn,cx,cz,4.5,0,224,160,{day:1,hour:8,flags:{}},'wancai',1);
  const ov=d.some((a,i)=>d.some((b,j)=>j>i&&a.box[0]<b.box[2]&&a.box[2]>b.box[0]&&a.box[1]<b.box[3]&&a.box[3]>b.box[1]));
  check('4. 小地圖（萬才館 2F 走廊）：研討室 A、B 都寫（放不下改短的「研討A」）、不重疊、字 ≥ 16 px',d.length===2&&!ov&&d.every(q=>/研討/.test(q.text)&&q.px>=16)&&ROOMMAP.shortName('研討室 A')==='研討A'&&ROOMMAP.shortName('多功能教室')==='多功能',d.map(q=>q.text+'@'+q.px).join(',')); }
{ const d=draw(-8,-1.6,0,1).d; check('4. 小地圖在 2F：只畫 2F 的教室',d.length>0&&d.every(q=>/^20/.test(q.text.replace('★',''))),d.map(q=>q.text).join(',')); }
{ const x=mockCtx(360,600), boxes=[]; const free=(u,w,tw,th)=>{ const b=[u-tw/2-2,w-th/2-1,u+tw/2+2,w+th/2+1]; for(const q of boxes) if(b[0]<q[2]&&b[2]>q[0]&&b[1]<q[3]&&b[3]>q[1]) return false; boxes.push(b); return true; };
  const toS=(wx,wz)=>[180+wx*10,300+wz*10]; const d=ROOMMAP.drawBig(x,toS,GP,'putong',0,free), t=d.find(q=>q.today);
  check('4. 大地圖（普通 1F，一格 10 px）：每間教室都寫、今天的那一間金色「★ 101」＋第二行「幾點 課名」',d.length===4&&!!t&&t.l1==='★ 101'&&t.l2===ROOMMAP.hhmm(PF.it.t0)+' '+PF.it.c.name&&x.calls.some(c=>c.t==='★ 101'&&/ffd88a/i.test(c.fill)),d.map(q=>q.text).join(' | '));
  const x2=mockCtx(360,600), b2=[]; const free2=(u,w,tw,th)=>{ const b=[u-tw/2-2,w-th/2-1,u+tw/2+2,w+th/2+1]; for(const q of b2) if(b[0]<q[2]&&b[2]>q[0]&&b[1]<q[3]&&b[3]>q[1]) return false; b2.push(b); return true; };
  const tiny=(wx,wz)=>[180+wx*1.6,300+wz*1.6]; const d2=ROOMMAP.drawBig(x2,tiny,GP,'putong',0,free2);
  check('4. 大地圖縮小（擠）：先拿掉課名、再只寫門號，不重疊；今天的那一間一定寫',d2.some(q=>q.today)&&d2.every(q=>q.text.length<=14),d2.map(q=>q.text).join(' | ')); }
// ---------- 5. 接線 ----------
{ const h=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'), a=h.indexOf('src="src/roommap3d.js'), b=h.indexOf('GAME.boot()');
  check('5. index.html 載入 src/roommap3d.js（GAME.boot 以前）',a>0&&b>a);
  const g=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8'), m=/function drawMinimap\(\)\{[\s\S]*?function mmArrowAngle/.exec(g);
  check('5. game3d.js 的 drawMinimap 呼叫 ROOMMAP.drawMini（玩家那一層 plv、鏡頭角度 E.cam.yaw）',!!m&&/ROOMMAP\.drawMini\(x,nav,cx,cz,scale,cy,W,H,G,G&&G\.zone,plv\)/.test(m[0])&&m[0].indexOf('ROOMMAP.drawMini')>m[0].indexOf('x.restore()'));
  const gd=fs.readFileSync(path.join(ROOT,'src/guide3d.js'),'utf8'), m2=/function drawMap\(\)\{[\s\S]*?function bindMap/.exec(gd);
  check('5. guide3d.js 的 drawMap 呼叫 ROOMMAP.drawBig（分層時照那一層），在畫入口以前',!!m2&&/ROOMMAP\.drawBig\(x,S,GM\.G,GM\.G\.zone,v\.perLv\?v\.lv:null,free\)/.test(m2[0])&&m2[0].indexOf('ROOMMAP.drawBig')<m2[0].indexOf('// 入口')); }
console.log(fails?('\n'+fails+' 項 FAIL'):'\nALL PASS'); process.exit(fails?1:0);
