// 約會選互動點的 2D 圖層（DATE-S6，使用者要的 I07、I08；src/datelayer3d.js、src/data/date_hotspots.js、date3d.js 的 S.pickChoose）。用法：node tests/date_layer_s6_unit.js
// 1 資料：標記只指到真的互動點、真的底圖（約會實際用的那一張、寬高對）、x,y 在 0～1；坐姿的互動點是真的；人物錨點和 assets/date/anchors.json 一樣、圖檔在
// 2 涵蓋：哪些地點用圖層、哪些照文字選單（缺一個互動點的位置＝整個地點照文字選單）
// 3 圖層和文字選單挑到的互動點、扣的錢、推的時間、說的話一樣；存檔的欄位一樣（D20）
// 4 灰掉的（時間不夠、下雨停用）按不下去
// 5 缺資料、?nodatelayer、ADV 沒開、底圖載不到、中途出錯＝照原本的文字選單（同一列選項）
// 6 她的去背圖：有圖的人站著、做完坐的互動點以後坐著；沒有圖的人不放（D8）；畫面上沒有除錯字
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
/* ---- 假的 DOM（只做圖層用得到的）---- */
class CL{ constructor(e){ this.e=e; } _l(){ return (this.e.className||'').split(/\s+/).filter(Boolean); } add(...c){ const l=this._l(); for(const x of c) if(!l.includes(x)) l.push(x); this.e.className=l.join(' '); }
  remove(...c){ this.e.className=this._l().filter(x=>!c.includes(x)).join(' '); } contains(c){ return this._l().includes(c); } toggle(c,on){ const has=this.contains(c); const want=on===undefined?!has:!!on; if(want) this.add(c); else this.remove(c); return want; } }
class El{ constructor(tag){ this.tagName=String(tag).toUpperCase(); this.children=[]; this.parentNode=null; this.style={}; this.className=''; this.classList=new CL(this); this.attrs={}; this.textContent=''; this.listeners={}; this.scrollLeft=0; this.scrollTop=0; this.id=''; }
  appendChild(c){ if(c.parentNode) c.parentNode.removeChild(c); c.parentNode=this; this.children.push(c); if(this.onAppend) this.onAppend(c); return c; }
  removeChild(c){ const i=this.children.indexOf(c); if(i>=0) this.children.splice(i,1); c.parentNode=null; return c; }
  setAttribute(k,v){ this.attrs[k]=String(v); } getAttribute(k){ return this.attrs[k]===undefined?null:this.attrs[k]; }
  addEventListener(k,f){ (this.listeners[k]=this.listeners[k]||[]).push(f); } removeEventListener(){}
  get scrollWidth(){ return parseFloat(this.children[0]&&this.children[0].style.width)||0; } get clientWidth(){ return global.innerWidth; } get clientHeight(){ return global.innerHeight; }
  all(){ const out=[]; const walk=e=>{ for(const c of e.children){ out.push(c); walk(c); } }; walk(this); return out; }
  text(){ return this.all().map(e=>e.textContent).filter(Boolean).join('|'); } }
const body=new El('body'), head=new El('head');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){}, createElement:t=>new El(t), body, head };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.removeEventListener=()=>{}; global.location={search:''};
global.innerWidth=844; global.innerHeight=390; global.getComputedStyle=()=>({paddingTop:'0px',paddingRight:'0px',paddingBottom:'0px',paddingLeft:'0px'});
global.requestAnimationFrame=f=>setTimeout(f,0);
let MISSING=new Set(); global.Image=class{ set src(v){ this._s=v; setTimeout(()=>{ if(MISSING.has(v)||[...MISSING].some(m=>v.includes(m))){ if(this.onerror) this.onerror(); } else if(this.onload) this.onload(); },0); } get src(){ return this._s; } };
const NAMES=/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|DATE|DATE_DATA|DATE_LINES|ROM|DATE_HOTSPOTS|DATELAYER)$/;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/social3d.js','src/events3d.js','src/data/l118_redo772.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/classes3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/date_hotspots.js','src/datelayer3d.js','src/date3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
const advRoot=new El('div'); advRoot.id='adv';
global.ADV={active:false,root:advRoot,skip:false,preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},cg(){},setBg(){},narrate(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
/* webp 的寬高（RIFF：VP8X／VP8／VP8L）*/
function webpSize(f){ const b=fs.readFileSync(f); const t=b.toString('ascii',12,16);
  if(t==='VP8X') return [1+b.readUIntLE(24,3),1+b.readUIntLE(27,3)]; if(t==='VP8 ') return [b.readUInt16LE(26)&0x3fff,b.readUInt16LE(28)&0x3fff];
  if(t==='VP8L'){ const v=b.readUInt32LE(21); return [1+(v&0x3fff),1+((v>>14)&0x3fff)]; } return null; }
const cur=()=>DATELAYER._cur();
const layerEl=()=>advRoot.children.find(c=>c.id==='dateLayer')||null;
const hots=()=>{ const c=cur(); return c?c.hots.map(h=>h.btn):[]; };
const tick=()=>new Promise(r=>setTimeout(r,0));
async function waitLayer(n){ for(let i=0;i<(n||50);i++){ if(cur()) return cur(); await tick(); } return null; }
/* ---- 和 date_scene_unit 同一套假 GM ---- */
let said=[], opts=[], picks=[], G=null, layerPicks=[], layerOpens=0, layerSeen=[];
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
GM.money=d=>{ G.money+=d; };
/* 圖層打開時：從同一串 picks 拿下一個字，按標籤含這個字的標記（或結束鍵）——和文字選單吃同一串 */
advRoot.onAppend=c=>{ if(c.id!=='dateLayer') return; layerOpens++; setTimeout(()=>{ const L=cur(); if(!L) return; layerSeen.push({pids:L.hots.map(h=>h.pid),labels:L.hots.map(h=>h.btn.text()),dim:L.hots.map(h=>h.btn.classList.contains('dim')),end:L.end.textContent,her:L.her?L.her.src:null,txt:c.text()});
  const want=picks.shift(); layerPicks.push(want); const items=L.hots.map(h=>h.btn.text()).concat([L.end.textContent]);   /* 和假 GM.choose 同一個規則：字找得到＝那一項、找不到＝第 0 項；數字＝第幾項 */
  let k=typeof want==='string'?items.findIndex(t=>t.includes(want)):(want||0); if(k<0) k=0; const b=k<L.hots.length?L.hots[k].btn:L.end; b.onclick({stopPropagation(){}}); },0); };
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,YT_MET_JOB:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); said=[]; opts=[]; picks=[]; layerPicks=[]; layerSeen=[]; layerOpens=0; GM.npc={}; E.interactables=[]; E.npcs=[]; if(STORY._fy) STORY._fy.reset(); };
const lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
const keysDeep=(o,p)=>{ if(!o||typeof o!=='object') return []; return Object.keys(o).flatMap(k=>[(p||'')+k].concat(Array.isArray(o[k])?[]:keysDeep(o[k],(p||'')+k+'.'))); };
(async()=>{
  const H=DATE_HOTSPOTS, BGS=Object.keys(H.bg);
  /* ---------- 1 資料 ---------- */
  { const bad=[];
    for(const k of BGS){ const e=H.bg[k], f=path.join(ROOT,'assets/bg/'+k+'.webp');
      if(!OUT.BG[k]||OUT.BG[k].image!=='assets/bg/'+k+'.webp') bad.push(k+' 不在 OUT.BG'); if(!fs.existsSync(f)){ bad.push(k+' 圖檔不在'); continue; }
      const wh=webpSize(f); if(!wh||wh[0]!==e.wh[0]||wh[1]!==e.wh[1]) bad.push(k+' 寬高 '+JSON.stringify(wh)+'≠'+JSON.stringify(e.wh));
      if(!DATE.loc(e.loc)) bad.push(k+' 地點 '+e.loc+' 不在地點表'); if(DATE.bgKey(e.loc)!==k) bad.push(k+' 不是 '+e.loc+' 約會用的那一張（'+DATE.bgKey(e.loc)+'）');
      const ids=DATE.points(e.loc).map(p=>p.id); for(const pid in e.pts){ const p=e.pts[pid]; if(!ids.includes(pid)) bad.push(k+' '+pid+' 不是 '+e.loc+' 的互動點'); if(!(Array.isArray(p)&&p.length===2&&p.every(v=>typeof v==='number'&&v>=0&&v<=1))) bad.push(k+' '+pid+' 位置 '+JSON.stringify(p)); }
      if(!(e.her&&e.her.x>=0&&e.her.x<=1)) bad.push(k+' her.x'); }
    check('1. 標記只指到真的互動點、真的底圖（約會實際用的那一張，寬高和圖檔一樣）、x,y 都在 0～1（'+BGS.length+' 張）',!bad.length&&BGS.length>=30,bad.join('；'));
    const allIds=new Set(Object.keys(DATE_DATA.points.points)); const sb=(H.seated||[]).filter(p=>!allIds.has(p));
    check('1. 坐姿的互動點都是真的互動點',H.seated.length>0&&!sb.length,sb.join('、'));
    const A=JSON.parse(fs.readFileSync(path.join(ROOT,'assets/date/anchors.json'),'utf8')), fb=[];
    for(const who in H.fig){ for(const p in H.fig[who]){ const a=H.fig[who][p], b=(A[who]||{})[p]||{}; for(const k in a) if(a[k]!==b[k]) fb.push(who+'.'+p+'.'+k); if(!fs.existsSync(path.join(ROOT,'assets/date',who,p+'.webp'))) fb.push(who+'/'+p+'.webp 不在');
      const wh=webpSize(path.join(ROOT,'assets/date',who,p+'.webp')); if(!wh||wh[0]!==a.w||wh[1]!==a.hpx) fb.push(who+'/'+p+' 寬高'); }
      if(!H.fig[who].H1) fb.push(who+' 沒有 H1'); }
    check('1. 人物錨點和 assets/date/anchors.json 逐欄一樣、圖檔在、寬高對（'+Object.keys(H.fig).join('、')+'）',!fb.length&&Object.keys(H.fig).length===7,fb.join('；')); }
  /* ---------- 2 涵蓋 ---------- */
  const locs=Object.keys(DATE_DATA.locations).sort(), cov=[], back=[];
  for(const l of locs){ const pts=DATE.points(l), k=DATE.bgKey(l); if(!pts.length||!k) { back.push(l+'（'+(k?'沒有互動點':'沒有底圖')+'）'); continue; } if(DATELAYER.covers(k,pts,pts)) cov.push(l); else back.push(l+'（'+(H.bg[k]?'有互動點沒有位置':'沒有登記')+'）'); }
  console.log('     用圖層的地點 '+cov.length+'：'+cov.join(' ')); console.log('     照文字選單 '+back.length+'：'+back.join(' '));
  check('2. 有底圖、有互動點的地點：除了 D28（海堤的夕陽放不準）全部用圖層',cov.length===31&&!cov.includes('D28')&&back.some(x=>/^D28/.test(x)),cov.length+'／'+back.join(' '));
  /* ---------- 3 圖層和文字選單結果一樣 ---------- */
  const day=STORY.termDay('Y1S2',5,6);
  const go=async(who,picks0,o)=>{ o=o||{}; const b=DATE.book(G,{who,locs:[o.loc||'D13'],transport:'mrt',day:G.day,depart:o.depart||15}); const q=OUT.get(G,'date_'+b.trip); G.hour=o.depart||15; said=[]; opts=[]; picks=['出發'].concat(picks0); await OUT.prompt(GM,q); return {b,t:DATE.trip(G,b.trip),L:lines()}; };
  const runBoth=async(who,pk,o)=>{ const out={};
    for(const mode of ['menu','layer']){ location.search=mode==='menu'?'?nodatelayer':''; fresh(day,9,'dorm',o&&o.flags); G.money=5000; if(o&&o.prep) o.prep();
      const r=await go(who,pk.slice(),o); out[mode]={spots:(r.t&&r.t.spots||[]).slice(),money:G.money,hour:+G.hour.toFixed(4),day:G.day,status:r.t&&r.t.status,L:r.L,opts:opts.slice(),opens:layerOpens,seen:layerSeen.slice(),gkeys:keysDeep(G).sort().join(','),tkeys:Object.keys(r.t||{}).sort().join(','),left:!!layerEl()}; }
    location.search=''; return out; };
  { const R=await runBoth('heroine_02',['飲料攤','「我幫妳點？」','河邊欄杆',0,'長椅',0,'差不多了']);
    const m=R.menu, y=R.layer;
    check('3. 文字選單（?nodatelayer）：照舊走完、沒有開圖層',m.status==='done'&&m.opens===0&&m.spots.length===3,JSON.stringify({st:m.status,opens:m.opens,spots:m.spots}));
    check('3. 圖層：每一次選互動點都開圖層（4 次：三個點＋結束），文字選單沒有出現互動點那一列',y.opens===4&&!y.opts.some(o=>o.includes('飲料攤')||o.includes('差不多了，回去吧')),JSON.stringify({opens:y.opens,opts:y.opts}));
    check('3. 圖層和文字選單：挑到的互動點、順序一樣',JSON.stringify(y.spots)===JSON.stringify(m.spots)&&y.spots.join()==='D13.drink,D13.rail,D13.bench',JSON.stringify({m:m.spots,y:y.spots}));
    check('3. 扣的錢、推的時間、結束的狀態一樣',y.money===m.money&&y.hour===m.hour&&y.day===m.day&&y.status===m.status,JSON.stringify({m:[m.money,m.hour,m.status],y:[y.money,y.hour,y.status]}));
    check('3. 說的話（台詞、旁白、結算那一句）逐句一樣',JSON.stringify(y.L)===JSON.stringify(m.L),y.L.length+'／'+m.L.length);
    check('3. 存檔：G 的欄位、這一趟 trip 的欄位和文字選單一樣（不加存檔欄位，D20）',y.gkeys===m.gkeys&&y.tkeys===m.tkeys,y.gkeys===m.gkeys?'':'G 不同');
    const s0=y.seen[0]||{}, menu0=(m.opts.find(o=>o.includes('飲料攤'))||[]);
    check('3. 標記的字＝選單那一項的字（名字＋時間、花費），結束鍵＝選單最後一項（「就這樣回去」→ 做過以後「差不多了，回去吧」）',s0.labels&&s0.labels.length===4&&s0.labels.every((t,i)=>t===menu0[i]||t.startsWith(menu0[i]))&&s0.end===menu0[4]&&(y.seen[1]||{}).end==='差不多了，回去吧',JSON.stringify({labels:s0.labels,menu0,end:s0.end}));
    check('3. 選完就收掉圖層（畫面上沒有留下 #dateLayer、ADV 的 dlayer 拿掉）',!y.left&&!advRoot.classList.contains('dlayer'));
    check('6. 她的去背圖：芷若一開始站著（H1）、做完長椅（坐的互動點）回到選單是坐著（H4）',(y.seen[0]||{}).her==='assets/date/heroine_02/H1.webp'&&(y.seen[3]||{}).her==='assets/date/heroine_02/H4.webp',JSON.stringify(y.seen.map(s=>s.her)));
    const words=y.seen.map(s=>s.txt).join('|'); check('6. 圖層上的字只有互動點名字、選單的提示、結束鍵（沒有除錯字、沒有自己編的字）',!/dev|DEBUG|PLACEHOLDER|D13\.|undefined|null/.test(words)&&y.seen.every(s=>s.txt.split('|').every(t=>s.labels.some(l=>l.includes(t))||t===s.end)),words.slice(0,300)); }
  /* 兩天一夜（S.dayRound）也一樣 */
  { const prep=()=>{ const r=SOCIAL.rel('heroine_02'); r.fam=70; r.trust=60; r.comf=50; r.npcRom=60; };
    const goO=async(pk)=>{ const b=DATE.book(G,{who:'heroine_02',locs:['D31'],kind:'overnight',transport:'car',day:G.day,depart:9}); if(!b.ok) return {b}; const q=OUT.get(G,'date_'+b.trip); G.hour=9; said=[]; opts=[]; picks=['出發'].concat(pk); await OUT.prompt(GM,q); return {b,t:DATE.trip(G,b.trip),L:lines()}; };
    const out={}; for(const mode of ['menu','layer']){ location.search=mode==='menu'?'?nodatelayer':''; fresh(day,8,'dorm',{dating_heroine_02:true}); G.money=20000; prep(); const r=await goO(['湖邊步道',0,'碼頭',0,'山上的纜車',0,'差不多了']); out[mode]={ok:r.b.ok,why:r.b.why,spots:r.t&&r.t.spots,money:G.money,hour:+G.hour.toFixed(3),day:G.day,opens:layerOpens,L:(r.L||[]).length}; }
    location.search='';
    check('3. 兩天一夜（D31 日月潭，S.dayRound）：圖層和文字選單挑到的點、錢、時間、台詞句數一樣，圖層開了',out.menu.ok&&JSON.stringify(out.menu.spots)===JSON.stringify(out.layer.spots)&&out.menu.money===out.layer.money&&out.menu.hour===out.layer.hour&&out.menu.day===out.layer.day&&out.menu.L===out.layer.L&&out.layer.opens>=3&&out.menu.opens===0,JSON.stringify(out)); }
  /* ---------- 4 灰掉的按不下去 ---------- */
  { location.search=''; fresh(day,9,'dorm',{}); G.weather='rain'; ADV.active=true;
    const pts=DATE.points('D13'), o=pts.map(p=>{ const rw=DATE.spotOff(G,p.id); return rw?{t:p.name,hint:rw,dim:true}:{t:p.name,hint:p.min+' 分'}; }).concat([{t:'就這樣回去'}]);
    let got=null; const pr=DATE.pickChoose(GM,o,{bg:'d13_base_sunset',pts,all:pts,who:'heroine_02',spots:[]}).then(k=>{ got=k; });
    advRoot.onAppend=null; const L=await waitLayer(); const bench=L&&L.hots.find(h=>h.pid==='D13.bench');
    check('4. 下雨：長椅（椅子是濕的）灰掉、按鈕 disabled、字照選單（名字＋原因）',!!bench&&bench.btn.disabled===true&&bench.btn.classList.contains('dim')&&bench.btn.text().includes('長椅')&&bench.btn.text().includes('椅子是濕的'),bench&&bench.btn.text());
    if(bench) bench.btn.onclick({stopPropagation(){}}); await tick(); await tick();
    check('4. 按灰掉的那一個：沒有選、圖層還開著',got===null&&!!cur());
    const rail=L&&L.hots.find(h=>h.pid==='D13.rail'); if(rail) rail.btn.onclick({stopPropagation(){}}); await pr;
    check('4. 再按河邊欄杆：回傳選單上欄杆那一項的位置',got===pts.findIndex(p=>p.id==='D13.rail'),String(got));
    /* 時間不夠的灰掉：整趟走一次，只剩 20 分鐘的時候 */
    fresh(day,9,'dorm',{}); G.money=5000;
    const b=DATE.book(G,{who:'heroine_02',locs:['D13'],transport:'mrt',day:G.day,depart:15}); const q=OUT.get(G,'date_'+b.trip); G.hour=15; said=[]; opts=[];
    const tr=DATE.trip(G,b.trip), trH=DATE.travel('D13','mrt').minutes/60; tr.back=15+2*trH+0.45;   /* 到了以後剩 27 分：飲料攤 20 分、拍照位置 15 分可以；河邊欄杆、長椅 30 分不夠 */
    picks=['出發'];
    let seenDim=null; advRoot.onAppend=c=>{ if(c.id!=='dateLayer') return; setTimeout(()=>{ const L=cur(); if(!L) return; if(seenDim===null) seenDim=L.hots.map(h=>({pid:h.pid,dim:!!h.btn.disabled,min:DATE.points('D13').find(p=>p.id===h.pid).min})); L.end.onclick({stopPropagation(){}}); },0); };
    await OUT.prompt(GM,q); const endH=tr.day*24+tr.back-DATE.travel('D13','mrt').minutes/60;
    check('4. 時間不夠的互動點灰掉（和選單同一條：現在＋時間 > 回程前），夠的沒灰（剩 27 分：30 分的欄杆、長椅灰掉）',Array.isArray(seenDim)&&seenDim.length===4&&seenDim.every(x=>x.dim===(x.min>27)),JSON.stringify(seenDim)+' endH '+endH.toFixed(2)); }
  /* ---------- 5 備援 ---------- */
  { advRoot.onAppend=null; fresh(day,9,'dorm',{}); const pts=DATE.points('D13'), o=pts.map(p=>({t:p.name})).concat([{t:'就這樣回去'}]); const ctx={bg:'d13_base_sunset',pts,all:pts,who:'heroine_02',spots:[]};
    const viaMenu=async(label,setup,undo)=>{ opts=[]; picks=[1]; setup(); let k; try{ k=await DATE.pickChoose(GM,o,ctx); } finally { undo(); } return {k,menu:opts.length===1&&JSON.stringify(opts[0])===JSON.stringify(o.map(x=>x.t)),left:!!layerEl()||advRoot.classList.contains('dlayer')}; };
    let r=await viaMenu('nodatelayer',()=>{ ADV.active=true; location.search='?nodatelayer'; },()=>{ location.search=''; });
    check('5. ?nodatelayer：照原本的文字選單（同一列選項）',r.menu&&r.k===1&&!r.left,JSON.stringify(r));
    r=await viaMenu('adv',()=>{ ADV.active=false; },()=>{ ADV.active=true; });
    check('5. ADV（2D 畫面）沒開：文字選單',r.menu&&r.k===1&&!r.left,JSON.stringify(r));
    const sv=H.bg.d13_base_sunset; r=await viaMenu('nodata',()=>{ delete H.bg.d13_base_sunset; },()=>{ H.bg.d13_base_sunset=sv; });
    check('5. 這張底圖沒有登記：文字選單',r.menu&&r.k===1&&!r.left,JSON.stringify(r));
    const sp=sv.pts['D13.photo']; let covM=null; r=await viaMenu('onemissing',()=>{ delete sv.pts['D13.photo']; covM=DATELAYER.covers('d13_base_sunset',pts.filter(p=>p.id!=='D13.photo'),pts); },()=>{ sv.pts['D13.photo']=sp; });
    check('5. 有一個互動點沒有位置（即使這一次只列其他三個也一樣）：整個地點照文字選單',r.menu&&covM===false,JSON.stringify(r));
    r=await viaMenu('bad',()=>{ sv.pts['D13.photo']=[1.4,0.2]; },()=>{ sv.pts['D13.photo']=sp; });
    check('5. 位置超出 0～1：文字選單',r.menu,JSON.stringify(r));
    const sh=global.DATE_HOTSPOTS; r=await viaMenu('nohot',()=>{ global.DATE_HOTSPOTS=undefined; },()=>{ global.DATE_HOTSPOTS=sh; });
    check('5. 整個 DATE_HOTSPOTS 沒有載（data 檔缺）：文字選單',r.menu,JSON.stringify(r));
    const ob=OUT.BG.d13_base_sunset; r=await viaMenu('noBG',()=>{ delete OUT.BG.d13_base_sunset; },()=>{ OUT.BG.d13_base_sunset=ob; });
    check('5. OUT.BG 沒有這張底圖：文字選單',r.menu,JSON.stringify(r));
    r=await viaMenu('imgerr',()=>{ MISSING=new Set(['assets/bg/d13_base_sunset.webp']); },()=>{ MISSING=new Set(); });
    check('5. 底圖載不到：收掉圖層、改出文字選單（同一列選項），畫面上沒有留下圖層',r.menu&&r.k===1&&!r.left,JSON.stringify(r));
    const iw=Object.getOwnPropertyDescriptor(global,'innerWidth'); r=await viaMenu('throw',()=>{ Object.defineProperty(global,'innerWidth',{configurable:true,get(){ throw new Error('boom'); }}); },()=>{ Object.defineProperty(global,'innerWidth',iw); });
    check('5. 圖層排版中途出錯：收掉圖層、改出文字選單',r.menu&&r.k===1&&!r.left,JSON.stringify(r));
    /* 人物圖載不到：圖層照開，只是沒有人（不畫代替的）*/
    MISSING=new Set(['assets/date/heroine_02/']); let got=null; const pr=DATE.pickChoose(GM,o,ctx).then(k=>{ got=k; }); const L=await waitLayer(); const img=L&&L.her; if(img&&img.onerror) img.onerror(); await tick();
    check('6. 人物去背圖載不到：圖層照開、她那張拿掉（不畫代替的人）',!!L&&!L.her&&!L.stage.all().some(e=>e.tagName==='IMG'),L&&String(L.her)); if(L) L.end.onclick({stopPropagation(){}}); await pr; MISSING=new Set();
    check('6. 結束鍵＝回傳最後一項',got===o.length-1,String(got));
    /* 沒有去背圖的人（芯慈）：不放人 */
    got=null; const pr2=DATE.pickChoose(GM,o,Object.assign({},ctx,{who:'classmate_xinci'})).then(k=>{ got=k; }); const L2=await waitLayer();
    check('6. 沒有去背圖的人（芯慈）：圖層照開、不放人（D8）',!!L2&&!L2.her&&!L2.stage.all().some(e=>e.tagName==='IMG')); if(L2) L2.hots[0].btn.onclick({stopPropagation(){}}); await pr2;
    check('6. 標記回傳的是選單那一項的位置',got===0,String(got));
    /* 直向：底圖左右可以滑、標記和人在底圖座標上、按鈕至少 44 px */
    global.innerWidth=390; global.innerHeight=844; const pr3=DATE.pickChoose(GM,o,ctx); const L3=await waitLayer();
    const W3=parseFloat(L3.stage.style.width), H3=parseFloat(L3.stage.style.height);
    check('6. 直向 390×844：底圖照高度放滿（'+Math.round(W3)+'×'+Math.round(H3)+'）、可以左右滑、一開始捲到她那一邊',L3.scroll.classList.contains('pan')&&Math.abs(H3-844)<1&&W3>390&&L3.scroll.scrollLeft>=0&&L3.scroll.scrollLeft<=W3-390,JSON.stringify({W3,H3,sl:L3.scroll.scrollLeft}));
    const pos3=L3.hots.map(h=>({pid:h.pid,x:parseFloat(h.btn.style.left)+22,y:parseFloat(h.btn.style.top)+22,w:44})), exp3=pos3.map(p=>[sv.pts[p.pid][0]*W3,sv.pts[p.pid][1]*H3]);
    check('6. 直向：標記在底圖上的位置＝資料的比例（誤差 2 px 內，上下只在留給按鈕的地方往內收）',pos3.every((p,i)=>Math.abs(p.x-exp3[i][0])<2&&(Math.abs(p.y-exp3[i][1])<2||p.y>52)),JSON.stringify(pos3));
    L3.end.onclick({stopPropagation(){}}); await pr3;
    global.innerWidth=844; global.innerHeight=390; const pr4=DATE.pickChoose(GM,o,ctx); const L4=await waitLayer();
    const ys=L4.hots.map(h=>parseFloat(h.btn.style.top)+22), off=parseFloat(L4.stage.style.top);
    check('6. 橫向 844×390：不左右滑、底圖上下裁掉的部分不放標記（標記都在畫面裡、不壓到上面的「紀錄」和下面的結束鍵）',!L4.scroll.classList.contains('pan')&&ys.every(y=>y+off>=52&&y+off<=390-70),JSON.stringify({ys,off}));
    L4.end.onclick({stopPropagation(){}}); await pr4; }
  /* ADV 收掉（讀檔、回標題）：圖層一起收，不留一層看不見的 */
  { fresh(day,9,'dorm',{}); ADV.active=true; const pts=DATE.points('D13'), o=pts.map(p=>({t:p.name})).concat([{t:'就這樣回去'}]); DATE.pickChoose(GM,o,{bg:'d13_base_sunset',pts,all:pts,who:'heroine_02',spots:[]}); const L=await waitLayer();
    ADV.end(); check('5. 圖層開著時 ADV.end（讀檔、回標題）：圖層一起收掉',!!L&&!cur()&&!layerEl()&&!advRoot.classList.contains('dlayer')); ADV.active=true; }
  /* ---------- index.html ---------- */
  { const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'), at=f=>html.indexOf('<script src="'+f+'?v=');
    check('7. index.html：date_hotspots.js、datelayer3d.js 在 date3d.js 前面、adv3d.js 和 outings3d.js 後面',at('src/data/date_hotspots.js')>0&&at('src/datelayer3d.js')>at('src/data/date_hotspots.js')&&at('src/date3d.js')>at('src/datelayer3d.js')&&at('src/adv3d.js')<at('src/datelayer3d.js')&&at('src/outings3d.js')<at('src/datelayer3d.js')); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
