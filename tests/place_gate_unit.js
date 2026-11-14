// 地點關卡・第一層（PLACE-GATE-TOOL-1112；規則：CLAUDE.md §12 店面標準 D155、docs/rules/ROLE_BB.md 2.6 D154）——不需要瀏覽器。
// 使用者 2026-11-12：「這要寫進測試規則！！避免以後要我真的開遊戲才能發現」「要有一個規則，而且要確保這個規則不會在交班之後別的帳號的 AI 根本就不知道有這件事情」。
// 每一間玩家進得去的店一列（清單從遊戲資料算，新加的店會自動被查），照店面標準七點逐項查；結果寫成 docs/handoff/SHOP_STANDARD_STATUS.md（SHOP-STANDARD-BACKFILL-1112）。
// 做法和 tests/shop_life_audit_1112_unit.js 一樣：照 index.html 的順序把整個遊戲載進 Node、建出每一間店真正的區域、叫真的 STORY.populate；
//   互動點是「真的按下去」（GM.say／choose 換成會記錄的假畫面，選單自動選有價錢的那一項；身上 0 元、5000 元各按一輪）。
// 用法：
//   node tests/place_gate_unit.js              全部檢查（GitHub Actions 的 node-unit-auto 會自動跑：.github/workflows/node-unit-auto.yml 收 tests/*_unit.js）
//   node tests/place_gate_unit.js --write      另外重寫 docs/handoff/SHOP_STANDARD_STATUS.md
//   node tests/place_gate_unit.js --check      只多一句說明；狀態表過期本來就會 FAIL（平常跑也查）
//   node tests/place_gate_unit.js --coplanar   重算每一間室內模型「牆的疊面」基準 tests/place_gate_coplanar.json（要 python3＋numpy；模型改了以後跑）
//   node tests/place_gate_unit.js --no-doc     不查狀態表（拿去舊版本跑的時候用）
// 結束碼：0＝沒有新的問題（已知未過的印 KNOWN-FAIL、照樣 0）；1＝①出現不在 KNOWN_FAIL 的新問題 ②KNOWN_FAIL 上的某一項現在過了（要從表上拿掉）③狀態表過期。
// 第一層判不了的（畫面上才看得出來：立體櫥窗的視差、閃、純色塊、進門鏡頭被擋、打烊看起來關了沒）＝第二層（CC 的 cc_place_gate_probe.py），這裡不假裝，狀態表寫「第二層」。
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process'), crypto=require('crypto');
const ROOT=path.resolve(__dirname,'..'); const ARGV=process.argv.slice(2); const T0=Date.now();

/* ====================================================================================================
   例外表（唯一的一張；一列一個理由。檢查不能關掉，只能在這裡寫為什麼這一間這一項不適用）
   ==================================================================================================== */
const EXCEPT=[
  {zone:'tz_xile',  item:'clerk', reason:'自助洗衣店，沒有店員（AA_742）'},
  {zone:'tz_limao', item:'clerk', reason:'只有上師一個人，他在騎樓的算命桌（src/shoplife3d.js NO_CLERK）'},
  {zone:'tz_limao', item:'buy',   reason:'命理館：算命在騎樓的算命桌（src/limao3d.js），店裡不賣東西'},
  {zone:'tz_limao', item:'nomoney', reason:'同上：店裡不賣東西'},
  {zone:'wz_teishoku', item:'gift', reason:'居酒屋內用，杯子裝的、沒有外帶；酒不送（GIFT_DRINK_SHOPS_AUDIT_1112.md 第 2 節）'},
  {zone:'aoki',        item:'gift', reason:'店內是一壺的熱茶（內用）；同一間店在公館街上的外帶窗口可以買來送人（GIFT_DRINK_SHOPS_AUDIT_1112.md 第 1 節第 4 列、第 2 節）'},
  {zone:'us_market',       item:'quick', reason:'在美國手機「地點」只列公寓和公寓社區（交換流程的設計，src/exchange3d.js EXCH.places、tests/exch_min_unit.js 第 4 項）；超市從公寓「出門（去超市）」搭車去'},
  {zone:'us_asian_market', item:'quick', reason:'同上：在美國不用手機快速前往去店裡，從超市那條街走過去'},
  {zone:'cvs',         item:'typhoon', reason:'便利商店 24 小時、颱風天照開（使用者 11-04「所有便利商店都是24小時」）'},
  {zone:'wz_teahouse', item:'view', reason:'玻璃（緣側）外面是 3D 的前院，不是照片：wz_teahouse_yard.glb（庭院、冠木門、竹垣、石燈籠、老樟樹、牆外的街；zones3d.js teaYard，WZ-YIZHAN-1104）。LAWWW-C 11-13 判；請 CC 第二層從店裡往外拍一張確認'},
  {zone:'xs_dakou',    item:'typhoon', reason:'24 小時的速食店（places.js：AA_613 沒寫颱風天關）'},
  {zone:'stall:tingzhou:st_ring',      item:'buy', reason:'夜市背景攤（套圈圈）：稿（AA_752）只有看，沒有買'},
  {zone:'stall:tingzhou:st_socks',     item:'buy', reason:'夜市背景攤（襪子）：稿（AA_752）只有看，沒有買'},
  {zone:'stall:gongguan:st_phonecase', item:'buy', reason:'夜市背景攤（手機殼）：稿（AA_752）只有看，沒有買'},
];

/* ====================================================================================================
   已知未過（真的還沒過、已經開了任務的；不是例外）。印 KNOWN-FAIL、結束碼照樣 0；修好以後這一列要刪（不刪會 FAIL）。
   manual:true＝第一層判不了、是使用者／LAWWW2 回報的（等第二層 PASS 才拿掉；不會自動變過）。
   ==================================================================================================== */
const T_WIN='SHOP-WINDOW-3D-1112', T_VIEW='SHOP-INTERIOR-VIEW-1112', T_AA='SHOP-LIFE-AA826-1112', T_CLOSED='L118-CLOSED-LOOKS-OPEN-1112', T_BACK='SHOP-STANDARD-BACKFILL-1112';
const KF=(task,item,zones,manual)=>zones.split(/\s+/).filter(Boolean).map(zone=>Object.assign({zone,item,task},manual?{manual:true}:{}));
const KNOWN_FAIL=[].concat(
  /* 從店外看進去是一張 2D 圖（使用者 11-12；清單＝任務 SHOP-WINDOW-3D-1112 的 LAWWW2 清單：新生南路七間、公館同一批、汀州路那一排）*/
  /* 新生南路六間（shanlan tongxian dakou haopai dabu xsports）、汀州路五間（yuehaochi keju dongnan liantong taimi）：BB-C 判店外立體＝店內 ⑦b PASS（docs/handoff/place_gate_bb.json 各店 note：SHOP-REAL-INSIDE 店外看到的牆、地板、擺設和店內一樣；大步 07:4x 改回 PASS），
     拿掉（LAWWW2-C 11-13，SHOP-WINDOW-3D-1112）。這幾間還沒過的質感（D159）、效能、客人在 place_gate_bb.json 的 fail／pending，由 SHOP-REALISM-1112 等任務追 */
  /* 公館九間（aoki bookstore cvs bikeshop afar yangyang corner_records daybreak noodle）：BB-C 11-12 判店外立體 PASS（BB_379 53180642a9、ade9c3659d；第二層左中右錯開），拿掉 */
  /* 118 巷打烊看起來關了：BB_379 L118_CLOSED_LOOK_r2 PASS（11-12，11 間公休／打烊鐵捲門到地、燈暗）＝這一列拿掉 */
  /* 以下是第一層量到的（會自動比對：過了這一列就要刪，不刪會 FAIL）*/
  /* 天花板比預設跟隨鏡頭矮（鏡頭高過天花板＝天花板不畫、抬頭看到背景色）。安泰 3.1、禮貌生財 3.0、溫州街四間 2.6～3.0；其他是 3.2 m 對鏡頭 3.208 m（差 8 mm，請第二層抬頭拍一張確認）*/
  /* 一盞：LAWWW2-C 11-13 天花板抬到 2.9 m、鏡頭距離 3.2（2.86 m），過了，從表上拿掉 */
  /* 118 巷八間店的天花板（L118-DIAN-CEILING-1112）：BB 17:4x 定鏡頭距離 4.2→3.6 m，過了（LAWWW2-C） */
  /* 有窗（或模型有玻璃）沒有窗景照片 */
  /* 美國兩間超市（us_market、us_asian_market）：白天／晚上兩張照片（views/us_market_*、us_asian_market_*；src/us3d.js US_VIEW）SHOP-INTERIOR-VIEW-1112 LAWWW-C 11-13，拿掉 */
  /* 沒開的時候店裡還站著店員（玩家進不去；從店外的窗戶看進去會像開著）*/
  /* 其他（補查出來的）*/
  /* 美國兩間超市的買得到／錢不夠／字：2026-11-12 接好了（AA_850；src/us_markets3d.js），這三列拿掉 */
  []);

/* 店的種類（決定查不查「尖峰有客人」）：eat＝吃飯的、drink＝咖啡店茶店、shop＝賣東西的、service＝服務。新加的店沒有寫在這裡＝FAIL（要人決定它是哪一種）*/
const TYPE={ noodle:'eat', yangyang:'eat', daybreak:'eat', wz_brunch:'eat', wz_lin:'eat', wz_teishoku:'eat', tz_taimi:'eat', tz_yuehaochi:'eat', tz_keju:'eat', xs_dakou:'eat',
  l118_dian:'eat', l118_self:'eat', l118_tea:'eat', l118_home:'eat', l118_cafe2:'eat', l118_pasta:'eat', l118_korea:'eat', l118_omu:'eat', l118_noodle2:'eat',
  cafe:'drink', afar:'drink', aoki:'drink', wz_teahouse:'drink', wz_mokuyobi:'drink', wz_offbeat:'drink',
  cvs:'shop', bookstore:'shop', bikeshop:'shop', corner_records:'shop', xs_tongxian:'shop', xs_shanlan:'shop', xs_dabu:'shop', xs_haopai:'shop', xs_xsports:'shop', gg_antai:'shop', gg_xianguo:'shop', gg_rongendian:'shop',
  tz_dongnan:'shop', tz_liantong:'shop', flower_notes:'shop', us_market:'shop', us_asian_market:'shop',
  wz_print:'service', tz_yindehao:'service', tz_xile:'service', tz_limao:'service', xs_nanyang:'service' };
const NOT_SHOP={xs_nanyang_hall:'南洋戲院的影廳（不是店面；大廳 xs_nanyang 有算）'};

/* 檢查項目 → 店面標準第幾點（狀態表的欄）。layer2＝第一層判不了 */
const ITEMS={
  name:{col:1,t:'店名'}, closedClerk:{col:1,t:'打烊後店裡不該有店員'}, street3d:{col:1,t:'從店外看進去是立體的',layer2:true}, closedLook:{col:1,t:'打烊看得出來關了',layer2:true},
  ceiling:{col:2,t:'天花板比跟隨鏡頭高'}, view:{col:2,t:'有窗的有窗景'}, coplanar:{col:2,t:'牆沒有疊在同一平面'}, texture:{col:2,t:'質感（D159）',layer2:true},
  clerk:{col:3,t:'營業中有店員'}, cust:{col:3,t:'尖峰有客人'}, mates:{col:3,t:'遇得到同學'}, tend:{col:3,t:'有人顧攤'},
  wired:{col:4,t:'互動點按了有反應'}, exit:{col:4,t:'出得來'}, buy:{col:4,t:'買得到（有價錢、會扣錢）'}, nomoney:{col:4,t:'錢不夠有對應'}, gift:{col:4,t:'飲料可以買來送人'}, closeOut:{col:4,t:'打烊會請出去'},
  hours:{col:5,t:'營業時間'}, noBreak:{col:5,t:'吃的店不午休'}, typhoon:{col:5,t:'颱風天'}, quick:{col:5,t:'手機快速前往'},
  text:{col:6,t:'字'}, type:{col:7,t:'種類'} };
const LAYER2_NOTE={1:'立體櫥窗的視差、招牌、亮燈、打烊的樣子、門口互動點的字',2:'純色塊、閃（連拍）、進門鏡頭、地板、抬頭看天花板',3:'畫面上數得到店員和客人、站的位置',4:'實際坐下、點一次餐、走出來',5:'',6:'',7:''};
const COLS=['','街上看','店裡面','人','做得到的事','時間','字','驗收'];

/* ====================================================================================================
   載入整個遊戲（和 shop_life_audit_1112_unit.js 同一套）
   ==================================================================================================== */
process.on('unhandledRejection',()=>{}); global.window=global; global.self=global; console.warn=()=>{}; const cerr=console.error; console.error=()=>{};
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'||k==='createImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
const el=()=>({getContext:()=>ctx2d,style:{},dataset:{},classList:{add(){},remove(){},toggle(){},contains:()=>false},children:[],childNodes:[],width:1,height:1,appendChild(){},removeChild(){},addEventListener(){},removeEventListener(){},setAttribute(){},getAttribute:()=>null,querySelector:()=>null,querySelectorAll:()=>[],remove(){},getBoundingClientRect:()=>({left:0,top:0,width:1,height:1}),focus(){},blur(){},insertBefore(){}});
global.document={ createElementNS:()=>el(), createElement:()=>el(), getElementById:()=>null, querySelector:()=>null, querySelectorAll:()=>[], addEventListener(){}, removeEventListener(){}, body:el(), documentElement:el(), head:el() };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.removeEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:'',href:'',hash:''};
global.localStorage={getItem:()=>null,setItem(){},removeItem(){}}; global.fetch=()=>Promise.reject(new Error('no fetch in node')); global.requestAnimationFrame=()=>0; global.matchMedia=()=>({matches:false,addEventListener(){}});
const J=JSON.stringify; let hardFails=0; const out=s=>console.log(s);
const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'); const FILES=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]); const loadErr=[];
for(const f of FILES){ if(/three-vrm|lz-string/.test(f)) continue; let src;
  try{ src=fs.readFileSync(path.join(ROOT,f),'utf8'); }catch(e){ loadErr.push(f+'（沒有這個檔）'); continue; }
  src=src.replace(/^(const|let) (\w+)\s*=/mg,(m,k,n)=>'globalThis.'+n+'=');
  if(f==='src/game3d.js') src=src.replace('const GM={E:null,','const GM={_test:(e,g)=>{ E=e; G=g; GM.E=e; GM.G=g; },E:null,');   /* 測試用：設定 game3d.js 裡的 E、G（平常是 GM.boot 設的，要 WebGL）*/
  try{ vm.runInThisContext(src,{filename:f}); }catch(e){ loadErr.push(f+'：'+String(e&&e.message||e).slice(0,160)); } }
const has=n=>typeof globalThis[n]!=='undefined';
if(loadErr.length||!has('GAME')||typeof GAME._test!=='function'||!has('STORY')||!has('Z3')||!has('PLACES')){ out('FAIL 0 index.html 的程式全部載得進來　'+loadErr.slice(0,5).join(' | ')); out('FAILED 1'); process.exit(1); }
out('PASS 0 index.html 的程式全部載得進來（'+FILES.length+' 支）');
/* 亂數固定（招呼句隨機挑、路人隨機走：每次跑結果要一樣）*/
{ let s=20261112; Math.random=()=>{ s=(s*1103515245+12345)&0x7fffffff; return s/0x7fffffff; }; }
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; ASSETS.loadOne=()=>new Promise(()=>{});   /* 正式模型不載入（店員、座位、導航不靠模型）*/
E.addNPC=n=>{ n.path=null; n.speed=n.speed||0; n.pose=n.pose||'idle'; n.radius=0.32; n.lv=n.lv|0; E.npcs.push(n); return n; }; E.removeNPC=n=>{ E.npcs=E.npcs.filter(m=>m!==n); }; E.addExtra=x=>{ (E.extras=E.extras||[]).push(x); return x; };
const GM=GAME, G=GM.defaults(); E.player={obj:new THREE.Group(),radius:0.32,lv:0,seat:null}; E.npcs=[]; GM._test(E,G); GM.bindSystems();
const DKm={}; const DK=key=>{ if(DKm[key]==null){ for(let d=-400;d<2500;d++) if(CALENDAR.dateOf(d).key===key){ DKm[key]=d; break; } } return DKm[key]; };
/* 窗景：記下每一區建立時要了哪幾張窗外照片（W3.viewPhoto）*/
const viewKinds={}; let viewCur=null;
if(has('W3')&&W3.viewPhoto){ const v0=W3.viewPhoto; W3.viewPhoto=function(kind,night,base){ if(viewCur&&kind&&!base) (viewKinds[viewCur]=viewKinds[viewCur]||new Set()).add(kind); return v0.apply(this,arguments); }; }
function enter(id,day,hour){ G.day=day; G.hour=hour; G.weekday=CALENDAR.dateOf(day).wd%7; G.zone=id; E.hour=hour;
  E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.extras=[]; E.exits=[]; E.spawnHint=null; GM.npc={}; GM.extras=[];
  viewCur=id; const z=Z3.ZONES[id].build(E); viewCur=null; z.def=Z3.ZONES[id]; if(z.id==null) z.id=id; E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(z.nav) z.nav._cm=null; if(E.levels) for(const n of E.levels) n._cm=null; E.indoor=!!Z3.ZONES[id].indoor;
  E.player.obj.position.set(z.spawn.x,0,z.spawn.z); E.player.seat=null; E.player.busy=false; E.player.lv=(z.spawn.lv|0);
  STORY.populate(id,GM); return z; }
const clerks=()=>E.npcs.filter(n=>n.clerk), anon=()=>E.npcs.filter(n=>(typeof n.crowd==='string'&&/^shop_/.test(n.crowd))||n.cafeCust);

/* ---------- 假畫面：按互動點的時候記下說了什麼、出了什麼選單、扣了多少錢 ---------- */
const STOP={stop:1}; let REC=null;
for(const k of ['sceneBegin','sceneEnd','cine','face','hideHUD','updateHUD','letterbox','toastClear','setGoal','autosave','standUp','freeSeat','updateInteract','openPhone','closePhone','phoneBadge','addNote','memo']) if(typeof GM[k]==='function') GM[k]=function(){ if(REC) REC.n++; };
for(const k of ['fade','titleCard','sleep','walkTo','sitAt','waitChars']) GM[k]=async function(){ if(REC) REC.n++; return true; };
const strs=a=>a.filter(x=>typeof x==='string').join('／');
GM.say=async function(...a){ if(!REC) return; REC.n++; REC.says.push(strs(a)); if(REC.n>80) throw STOP; };
GM.caption=function(...a){ if(REC){ REC.n++; REC.says.push(strs(a)); } }; GM.toast=function(...a){ if(REC){ REC.n++; REC.says.push(strs(a)); } };
const NO_RE=/不用|算了|取消|先不要|沒事|離開|看看就好|不了|放回去|什麼都不點/, DONE_RE=/好了|結帳|就這些|這樣就好|點完|確定|送出|就這樣/, PRICE_RE=/[1-9][\d,]*\s*元/;
GM.choose=async function(opts){ if(!REC) return 0; REC.n++; const T=opts.map(q=>((q&&q.t)||'')+((q&&q.hint)?'〔'+q.hint+'〕':'')); const key=T.join('|'); REC.menus.push(T.filter((t,i)=>!opts[i].hidden)); if(REC.menus.length>8) throw STOP;
  const GIFT_RE=/買禮物|選物|帶走送人/; const vis=opts.map((q,i)=>i).filter(i=>!opts[i].hidden&&!GIFT_RE.test(T[i])); const again=REC.seen[key]; REC.seen[key]=(again|0)+1;
  const giftI=opts.map((q,i)=>i).find(i=>!opts[i].hidden&&/買禮物|選物/.test(T[i]));   /* 這一份選單沒有標價的東西、只有「買禮物…」（山嵐書店的結帳）：走禮物那一條看價錢 */
  if(again){ const d=vis.find(i=>DONE_RE.test(T[i])&&!NO_RE.test(T[i])); if(d!=null) return d; }
  const priced=vis.find(i=>PRICE_RE.test(T[i])&&!NO_RE.test(T[i])&&!(again&&REC.picked[key]===i)); const other=vis.find(i=>!NO_RE.test(T[i]));
  const pick=priced!=null?priced:(giftI!=null&&!again?giftI:(other!=null?other:(vis.length?vis[0]:0))); REC.picked[key]=pick; if(opts[pick]&&opts[pick].dim&&PRICE_RE.test(T[pick])) REC.dim=true;   /* 錢不夠的那一項變灰＝有對應 */ return pick; };
GM.money=function(d){ G.money+=d; if(REC){ REC.money.push(d); if(G.money<0) REC.neg=true; } }; GM.advance=function(){ if(REC) REC.n++; }; GM.enter=async function(){ if(REC) REC.n++; throw STOP; };
const realTimeout=global.setTimeout; global.setTimeout=(f)=>setImmediate(f);
const tick=()=>new Promise(r=>setImmediate(r));
async function press(it){ REC={n:0,says:[],menus:[],money:[],seen:{},picked:{},neg:false}; let ret; const m0=G.money;
  try{ const p=it.onInteract?it.onInteract(it):STORY.interact(it,GM);
    ret=await Promise.race([Promise.resolve(p).then(v=>v?'handled':'none',e=>e===STOP?'handled':'err:'+String(e&&e.message||e).slice(0,120)),(async()=>{ for(let i=0;i<600;i++) await tick(); return 'timeout'; })()]); }
  catch(e){ ret=e===STOP?'handled':'err:'+String(e&&e.message||e).slice(0,120); }
  const r=REC; REC=null; r.ret=ret; r.spent=m0-G.money; if(G.money<0) r.neg=true; E.player.busy=false;
  if(process.env.PG_DEBUG&&G.zone===process.env.PG_DEBUG) out('  [debug] '+labelOf(it)+'　身上 '+m0+' → '+ret+'　扣 '+r.spent+'　選單 '+J(r.menus).slice(0,300)+'　說 '+J(r.says).slice(0,200));
  return r; }
const hiddenOf=it=>{ try{ return !!it.hidden; }catch(e){ return false; } };
const labelOf=it=>{ try{ return it.label; }catch(e){ return undefined; } };

/* ====================================================================================================
   店的清單（從遊戲資料算，和盤點測試同一個算法）
   ==================================================================================================== */
const SHOPS=[]; { const add=z=>{ if(z&&Z3.ZONES[z]&&Z3.ZONES[z].indoor&&!SHOPS.includes(z)&&!NOT_SHOP[z]) SHOPS.push(z); };
  for(const z of ['cafe','cvs','noodle','bookstore','bikeshop']) add(z);
  for(const z of Object.keys(PLACES.hours)) if(PLACES.hours[z].shop) add(z);
  if(has('CROWD')&&CROWD.SHOP_ZONES) for(const z of Object.keys(CROWD.SHOP_ZONES)) add(z);
  if(has('TZ_SHOPS_LAYOUT')) for(const k of Object.keys(TZ_SHOPS_LAYOUT)) add(TZ_SHOPS_LAYOUT[k].zone);
  if(has('LANE118_SHOPS')) for(const s of LANE118_SHOPS.shops) add('l118_'+s.id);
  for(const z of ['flower_notes','wz_offbeat','xs_dakou','tz_xile','us_market','us_asian_market']) add(z);
  for(const z of Object.keys(TYPE)) add(z); }
const TW=z=>!/^us_|^jp_/.test(z);
const l118id=z=>{ const m=/^l118_(.+)$/.exec(z); return m?m[1]:null; };
const l118shop=z=>{ const id=l118id(z); return id&&has('LANE118_SHOPS')?LANE118_SHOPS.shops.find(s=>s.id===id)||null:null; };
const tzLay=z=>{ if(!has('TZ_SHOPS_LAYOUT')) return null; const k=Object.keys(TZ_SHOPS_LAYOUT).find(k=>TZ_SHOPS_LAYOUT[k].zone===z); return k?TZ_SHOPS_LAYOUT[k]:null; };
const nameOf=z=>{ const s=l118shop(z); return (PLACES.names&&PLACES.names[z])||(s&&s.name)||String((Z3.ZONES[z]&&Z3.ZONES[z].name)||'').replace(/（118 巷）$/,'')||z; };
const isOpen=(z,day,h)=>{ const id=l118id(z); if(id&&has('L118')) return L118.isOpen(id,{day,hour:h,weekday:CALENDAR.dateOf(day).wd%7,flags:{}});
  if(z==='noodle'&&has('NOODLE_CLOSED')&&NOODLE_CLOSED.closed&&NOODLE_CLOSED.closed({day,hour:h,flags:{}})) return false; return PLACES.isOpen(z,h,day); };
const WED=DK('2025-10-08'), SAT=DK('2025-10-11');
const DAYS=[]; for(let d=DK('2025-10-06');DAYS.length<3;d++) if(CALENDAR.kind(d)==='term'&&!CALENDAR.weekend(d)&&!CALENDAR.holiday(d)&&!(CALENDAR.termOf(d)||{}).exam&&!(CALENDAR.typhoon&&CALENDAR.typhoon(d))&&CALENDAR.dateOf(d).wd%7>=2&&CALENDAR.dateOf(d).wd%7<=4) DAYS.push(d);   /* 三個平日（週二～四：避開大部分店的公休日）*/
let TYPHOON=null; if(CALENDAR.typhoon) for(let d=DK('2025-09-01');d<DK('2025-09-01')+500;d++) if(CALENDAR.typhoon(d)){ TYPHOON=d; break; }

/* ---------- 結果 ---------- */
const CC0={};   /* 區域 → 每個店內模型的 cc0Of 結果（D160）*/
const RES={};   /* RES[zone][item]={st:'PASS'|'FAIL'|'L2'|'NA',msg} */
const set=(z,item,st,msg)=>{ (RES[z]=RES[z]||{})[item]={st,msg:msg||''}; };
const pass=(z,i,m)=>set(z,i,'PASS',m), fail=(z,i,m)=>set(z,i,'FAIL',m), na=(z,i,m)=>set(z,i,'NA',m);
const ROWS=[];   /* {key,name,area,stall} 狀態表的列 */

/* ---------- 跟隨鏡頭預設高度（從 engine3d.js 讀：頭的高度＋抬高＋sin(室內俯角)×鏡頭距離）---------- */
const ENG=fs.readFileSync(path.join(ROOT,'src/engine3d.js'),'utf8');
const CAM=(()=>{ const a=/E\.cam\.pitch=E\.indoor\?([\d.]+):/.exec(ENG), b=/E\.cam\.distTarget=E\.indoor\?\(zoneDef\.camDist\|\|([\d.]+)\)/.exec(ENG), c=/C\.target\.lerp\(tmpV2\.copy\(P\.obj\.position\)\.add\(tmpV3\.set\(0,([\d.]+),0\)\)/.exec(ENG), d=/Math\.sin\(pitch\)\*dist0\+([\d.]+)/.exec(ENG);
  return a&&b&&c&&d?{pitch:+a[1],dist:+b[1],head:+c[1],lift:+d[1]}:null; })();
if(!CAM){ out('FAIL 0 讀不到跟隨鏡頭的參數（src/engine3d.js 的寫法改了：室內俯角、鏡頭距離、頭的高度、抬高）'); hardFails++; }
const camYOf=z=>CAM?+(CAM.head+CAM.lift+Math.sin(CAM.pitch)*((Z3.ZONES[z]&&Z3.ZONES[z].camDist)||CAM.dist)).toFixed(3):null;

/* ---------- 模型檔：GLB 的 JSON、玻璃材質、牆的疊面 ---------- */
const glbJson=p=>{ try{ const fd=fs.openSync(path.join(ROOT,p),'r'); const h=Buffer.alloc(20); fs.readSync(fd,h,0,20,0); const n=h.readUInt32LE(12); const b=Buffer.alloc(n); fs.readSync(fd,b,0,n,20); fs.closeSync(fd); return JSON.parse(b.toString('utf8')); }catch(e){ return null; } };
/* 質感：同一個網格裡「同尺寸的東西一排重複」（合併成一個網格的等大方塊；BB-C 11-12 21:1x 建議）——每個連通塊（三邊 ≥3 cm、兩邊 ≥10 cm）的包圍盒（公分）一樣的 ≥8 個 */
const REP_SKIP=/CEIL|WALL|light|lamp|joist|glass|trim|frame|tile|floor|stair|step|rail|led|emit|price|chair|stool|seat|bench|table|cup|plate|bowl|pothos|plant|leaf|hedge|bulb|pendant|metal|wood|walnut|vc/i;   /* 牆、天花板、燈、層板條本來就一樣大；座位、桌子、杯盤、盆栽、材質共用網格（vc／wood／metal）也不算（BB-C 11-12 21:1x：真的店椅子本來就同款）——只看貨品那類 */
const glbRepeats=p=>{ try{ const f=fs.readFileSync(path.join(ROOT,p)); const n=f.readUInt32LE(12); const j=JSON.parse(f.slice(20,20+n).toString('utf8')); const b0=20+n+8; const out=[];
  const CT={5121:[1,'readUInt8'],5123:[2,'readUInt16LE'],5125:[4,'readUInt32LE'],5126:[4,'readFloatLE']}, NC={SCALAR:1,VEC2:2,VEC3:3,VEC4:4};
  const rd=i=>{ const a=j.accessors[i], bv=j.bufferViews[a.bufferView]; const [sz,fn]=CT[a.componentType], nc=NC[a.type], st=bv.byteStride||sz*nc, off=b0+(bv.byteOffset||0)+(a.byteOffset||0); const r=new Array(a.count*nc);
    for(let k=0;k<a.count;k++) for(let c=0;c<nc;c++) r[k*nc+c]=f[fn](off+k*st+c*sz); return r; };
  for(const m of (j.meshes||[])) for(const q of (m.primitives||[])){ if(q.indices==null||!q.attributes||q.attributes.POSITION==null) continue; const P=rd(q.attributes.POSITION), I=rd(q.indices), nv=P.length/3; if(nv>60000) continue;
    const par=new Int32Array(nv).map((_,i)=>i); const fd=x=>{ while(par[x]!==x){ par[x]=par[par[x]]; x=par[x]; } return x; };
    for(let t=0;t<I.length;t+=3){ const a=fd(I[t]), b=fd(I[t+1]), c=fd(I[t+2]); par[b]=a; par[fd(c)]=a; }
    if(REP_SKIP.test(m.name||'')) continue;
    const bb=new Map(); for(let v=0;v<nv;v++){ const r=fd(v); let e=bb.get(r); if(!e) bb.set(r,e=[1e9,1e9,1e9,-1e9,-1e9,-1e9,0]); e[6]++; for(let c=0;c<3;c++){ const x=P[v*3+c]; if(x<e[c]) e[c]=x; if(x>e[c+3]) e[c+3]=x; } }
    if(bb.size<6) continue; const cnt=new Map(); for(const e of bb.values()){ const d=[0,1,2].map(c=>Math.round((e[c+3]-e[c])*100)); if(Math.min(...d)<3||d.filter(x=>x>=10).length<2) continue; const k=d.join('×'); cnt.set(k,(cnt.get(k)||0)+1); }
    let best=null; for(const [k,c] of cnt) if(c>=8&&(!best||c>best[1])) best=[k,c]; if(best) out.push({mesh:m.name||'?',k:best[1],size:best[0]+' cm'}); }
  return out; }catch(e){ return []; } };
const glbsOf=z=>{ const L=tzLay(z); const list=[]; if(L&&L.glb) list.push(L.glb); if(has('ZONE_ASSETS')&&ZONE_ASSETS[z]) for(const a of ZONE_ASSETS[z]){ if(!/^bldg\./.test(a)) continue; const e=ASSETS.manifest&&ASSETS.manifest[a]; if(e&&e.url&&!list.includes(e.url)) list.push(e.url); } return list.filter(p=>fs.existsSync(path.join(ROOT,p))); };
const COP_FILE=path.join(ROOT,'tests/place_gate_coplanar.json'), COP_TOOL=path.join(ROOT,'tools/glb_coplanar.py'), WALL_RE=/wall|shell|外殼|牆/i;
let COP={}; try{ COP=JSON.parse(fs.readFileSync(COP_FILE,'utf8')); }catch(e){}
const sha1=p=>crypto.createHash('sha1').update(fs.readFileSync(path.join(ROOT,p))).digest('hex');
let pyOK=null; const copScan=p=>{ if(pyOK===false||!fs.existsSync(COP_TOOL)) return null; const tmp=path.join(require('os').tmpdir(),'place_gate_cop_'+process.pid+'.json');
  try{ cp.execFileSync('python3',[COP_TOOL,path.join(ROOT,p),'--top','0','--json',tmp],{stdio:'ignore',timeout:120000}); const r=JSON.parse(fs.readFileSync(tmp,'utf8'))[0]; fs.unlinkSync(tmp); pyOK=true;
    const W=r.pairs.filter(q=>q.kind==='always'&&(WALL_RE.test(q.a)||WALL_RE.test(q.b)||WALL_RE.test(q.am||'')||WALL_RE.test(q.bm||''))); const top=W[0];
    return {sha1:sha1(p),wall:+W.reduce((s,q)=>s+q.area,0).toFixed(2),always:r.always,top:top?(top.a+'×'+top.b+' '+top.area+' m² @'+J(top.at)):''}; }
  catch(e){ if(pyOK==null) pyOK=false; return null; } };

/* ====================================================================================================
   逐店檢查
   ==================================================================================================== */
const QL=(()=>{ try{ return PLACES.quickList(); }catch(e){ return []; } })();
const exitsByZone={};   /* 出去的落點：之後一條街建一次、一起驗站不站得住 */
async function checkShop(z){ const nm=nameOf(z), ty=TYPE[z], L=tzLay(z), s118=l118shop(z), def=Z3.ZONES[z];
  ROWS.push({key:z,name:nm,area:/^l118_/.test(z)?'118 巷':/^tz_/.test(z)?'汀州路':/^xs_/.test(z)?'新生南路':/^wz_|^cafe$/.test(z)?'溫州街':/^us_/.test(z)?'美國（交換）':'公館'});
  if(!ty) fail(z,'type','tests/place_gate_unit.js 的 TYPE 表沒有這一間（新加的店：寫它是 eat／drink／shop／service）'); else pass(z,'type');
  for(const i of ['street3d','closedLook']) set(z,i,'L2','');
  /* --- 名字 --- */
  if((PLACES.names&&PLACES.names[z])||(s118&&s118.name)) pass(z,'name'); else fail(z,'name','PLACES.names 沒有這一區（打烊的說明、手機地圖會顯示區域 id）');
  /* --- 營業時間 --- */
  const H=PLACES.hours&&PLACES.hours[z]; const hoursText=H?(H.text||''):(s118&&s118.hours?(s118.hours.text||'有'):'');
  let allDay=true, anyOpen=false; for(const d of [WED,SAT,WED+5]) for(let h=0;h<24;h+=0.5){ if(isOpen(z,d,h)) anyOpen=true; else allDay=false; }
  if(!hoursText) fail(z,'hours','沒有寫營業時間（現在整天進得去；24 小時的店要明寫）'); else if(!anyOpen) fail(z,'hours','找不到開著的時刻'); else pass(z,'hours');
  /* --- 手機快速前往 --- */
  if(QL.some(q=>q&&(q[0]===z||q[1]===nm))) pass(z,'quick'); else fail(z,'quick','手機快速前往沒有這一間（PLACES.quickList：沒有這一區、也沒有落在它店門口的那一筆）');
  /* --- 開著的時刻 --- */
  const openHs=[9.5,12.5,15.5,18.5,20.5].filter(h=>isOpen(z,WED,h)); let openDay=WED; if(!openHs.length){ for(const d of [SAT,WED+1,WED+2]){ const hs=[9.5,12.5,15.5,18.5,20.5].filter(h=>isOpen(z,d,h)); if(hs.length){ openDay=d; openHs.push(...hs); break; } } }
  if(!openHs.length){ for(const i of ['clerk','cust','wired','exit','buy','nomoney','text','ceiling','view']) fail(z,i,'找不到開著的時刻，查不了'); return; }
  /* --- 吃的店不午休 --- */
  if(ty==='eat'){ const d=DAYS[0]; if(isOpen(z,d,12.5)&&isOpen(z,d,18.5)){ const gap=[14,14.5,15,15.5,16,16.5].filter(h=>!isOpen(z,d,h)); if(gap.length) fail(z,'noBreak','中午和晚上都開、下午 '+PLACES.hhmm(gap[0])+' 沒開（午休要使用者或 AA 明寫才行）'); else pass(z,'noBreak'); } else na(z,'noBreak'); } else na(z,'noBreak');
  /* --- 颱風天 --- */
  if(!TW(z)) na(z,'typhoon'); else if(TYPHOON==null) na(z,'typhoon','行事曆沒有颱風假'); else { const open=[12.5,18.5].some(h=>isOpen(z,TYPHOON,h)); if(open) fail(z,'typhoon','颱風假（'+CALENDAR.dateOf(TYPHOON).key+'）照常開著（PLACES.typhoonShops 沒有它）'); else pass(z,'typhoon'); }
  /* --- 店員（照真的生成程式）＋天花板、窗景 --- */
  const samp=[openHs[0],openHs[Math.floor(openHs.length/2)],openHs[openHs.length-1]].filter((h,i,a)=>a.indexOf(h)===i); let miss=[], far=[], zone=null;
  for(const h of samp){ zone=enter(z,openDay,h); const cs=clerks(); if(!cs.length){ miss.push(PLACES.hhmm(h)); continue; }
    const spot=(zone.shopLayout&&zone.shopLayout.clerk)||(L&&L.clerk)||(l118id(z)&&has('L118_SHOP_LAYOUTS')&&L118_SHOP_LAYOUTS[l118id(z)]&&L118_SHOP_LAYOUTS[l118id(z)].clerk)||null;
    if(spot&&typeof spot.x==='number'){ const dmin=Math.min(...cs.map(n=>Math.hypot(n.obj.position.x-spot.x,n.obj.position.z-spot.z))); if(dmin>1.5) far.push(PLACES.hhmm(h)+' 離配置的店員位置 '+dmin.toFixed(1)+' m'); } }
  if(miss.length) fail(z,'clerk','開著沒有店員（週'+'日一二三四五六'[CALENDAR.dateOf(openDay).wd%7]+' '+miss.join('、')+'）'); else if(far.length) fail(z,'clerk',far[0]+'（要在 1.5 m 內）'); else pass(z,'clerk');
  /* 天花板：房間高度（程式用的那一個：Z3.room 的 H＝頂燈高度＋0.3；多樓層＝二樓地板）對預設跟隨鏡頭 */
  { const camY=camYOf(z); let Hh=null; if(zone.levels&&zone.levels.length>1&&typeof zone.levels[1].y0==='number') Hh=zone.levels[1].y0; else if(L&&L.h) Hh=L.h; else if(zone.ceilLight) Hh=+(zone.ceilLight.position.y+0.3).toFixed(2);
    if(Hh==null||camY==null) set(z,'ceiling','L2','量不到房間高度（第二層抬頭拍）'); else if(Hh<camY) fail(z,'ceiling','房間 '+Hh+' m < 預設跟隨鏡頭 '+camY+' m（鏡頭距離 '+((def.camDist)||CAM.dist)+'；鏡頭高過天花板＝天花板不畫）'); else pass(z,'ceiling'); }
  /* 窗景：建區域時要了窗外照片，或配置的那一張（汀州路／公館：模型載完才放）；白天、晚上都要有檔 */
  { const VD='assets/models/env/views/'; const ok=k=>fs.existsSync(path.join(ROOT,VD+k+'_day.webp'))&&fs.existsSync(path.join(ROOT,VD+k+'_night.webp'));
    try{ if(zone.applyTime){ viewCur=z; zone.applyTime(12.5); zone.applyTime(21); viewCur=null; } }catch(e){ viewCur=null; }
    const kinds=[...(viewKinds[z]||[])]; if(L&&L.viewDepth) kinds.push(L.view||L.zone); let names=[]; try{ names=fs.readdirSync(path.join(ROOT,VD)); }catch(e){}
    for(const f of names){ const m=/^(.+?)(?:_near)?_day\.webp$/.exec(f); if(m&&(m[1]===z||m[1].indexOf(z+'_')===0)&&!kinds.includes(m[1])) kinds.push(m[1]); }
    const glass=glbsOf(z).some(p=>{ const j=glbJson(p); return j&&(j.materials||[]).some(m=>/glass|玻璃/i.test(m.name||'')); });
    const bad=kinds.filter(k=>!ok(k));
    /* 模型裡的窗景卡換照片（公館 GG_VIEW：材質名；溫州街 WZ_VIEW：網格名；zones3d.js）——卡要真的在模型裡、白天晚上兩張照片都在（SHOP-INTERIOR-VIEW-1112 LAWWW-C 11-13：afar 等七間原本被當成沒有窗景）*/
    const cards=[]; if(typeof Z3!=='undefined'){ const gv=Z3.GG_VIEW&&Z3.GG_VIEW[z]; if(gv) cards.push({re:new RegExp('^'+gv.mat+'$'),mat:true,day:gv.day,night:gv.night}); const wv=Z3.WZ_VIEW&&Z3.WZ_VIEW[z.replace(/^wz_/,'')]; if(wv) for(const e of wv) cards.push({re:new RegExp(e.mesh),mat:false,day:e.day,night:e.night}); const nv=Z3.WZ_AA_NIGHTVIEW&&Z3.WZ_AA_NIGHTVIEW[z.replace(/^wz_/,'')]; if(nv) cards.push({re:new RegExp('^'+nv.mat+'$'),mat:true,tex:true,night:nv.url}); }   /* WZ_AA_NIGHTVIEW（SUNNY SIDE）：白天是模型裡那張卡自己的貼圖（要有貼圖），晚上換這張 */
    const cardOk=c=>(c.tex||fs.existsSync(path.join(ROOT,c.day)))&&fs.existsSync(path.join(ROOT,c.night))&&glbsOf(z).some(p=>{ const j=glbJson(p); return j&&(c.mat?(j.materials||[]):(j.nodes||[]).concat(j.meshes||[])).some(o=>c.re.test(o.name||'')&&(!c.tex||!!(o.pbrMetallicRoughness&&o.pbrMetallicRoughness.baseColorTexture)||!!o.emissiveTexture)); });
    if(!kinds.length&&cards.length){ const cb=cards.filter(c=>!cardOk(c)); if(!cb.length) pass(z,'view'); else fail(z,'view','窗景卡設定了、但模型裡找不到那張卡或照片缺檔：'+cb.map(c=>c.re.source+'（'+(c.day||c.night)+'）').join('、')); }
    else if(kinds.length&&!bad.length) pass(z,'view'); else if(kinds.length) fail(z,'view','窗景照片缺檔：'+bad.join('、')+'（白天、晚上各一張）');
    else if(zone.wins&&zone.wins.length) fail(z,'view','房間有 '+zone.wins.length+' 扇窗、沒有窗外照片（assets/models/env/views/'+z+'_day／_night.webp）');
    else if(glass) fail(z,'view','模型有玻璃、沒有窗景設定（views/ 沒有這一區的照片，程式也沒有放視差窗）'); else pass(z,'view'); }
  /* 牆的疊面：和基準（tests/place_gate_coplanar.json）比；基準上已經有的＝疑似，交給第二層連拍 */
  { const gl=glbsOf(z); let st='PASS', msg='', sus=[];
    for(const p of gl){ const base=COP[p]; let cur=base; if(!base||base.sha1!==sha1(p)){ const r=copScan(p); if(!r){ st='FAIL'; msg='模型 '+path.basename(p)+' 換了（或沒有基準）、這台機器不能重查（python3＋numpy）：跑 node tests/place_gate_unit.js --coplanar'; break; } cur=r; const b0=base?base.wall:0; if(r.wall>b0+0.05){ st='FAIL'; msg=path.basename(p)+' 牆的疊面 '+r.wall+' m²，比基準 '+b0+' m² 多（'+r.top+'）'; break; } }
      if(cur.wall>0.05) sus.push(path.basename(p)+' '+cur.wall+' m²'); }
    if(!gl.length) set(z,'coplanar','L2','找不到這一區的室內模型檔'); else if(st==='FAIL') fail(z,'coplanar',msg); else if(sus.length) set(z,'coplanar','L2','疑似牆面疊面 '+sus.join('、')+'（基準；連拍確認閃不閃）'); else pass(z,'coplanar'); }
  /* CC0 素材（D160，CLAUDE.md §12 第 2 點）：狀態表「CC0 素材」那一欄；判斷在 tests/shop_cc0_unit.js（擋新店、基準表外的店）*/
  { try{ const C=require('./shop_cc0_unit.js'); CC0[z]=glbsOf(z).filter(p=>!/_stair\.glb$/.test(p)).map(C.cc0Of); }catch(e){ CC0[z]=null; } }
  /* 質感（D159，CLAUDE.md §9 2a）：第一層只量、不判（BB 看圖判）——模型裡沒貼圖的純色零件、等大方塊零件各佔多少 */
  { const gl=glbsOf(z); let n=0, flat=0, box=0, rep=[];
    for(const p of gl){ const j=glbJson(p); if(!j) continue; const mats=j.materials||[], acc=j.accessors||[]; rep=rep.concat(glbRepeats(p));
      for(const m of (j.meshes||[])) for(const q of (m.primitives||[])){ n++; const mt=q.material!=null?mats[q.material]:null; const pb=mt&&mt.pbrMetallicRoughness||{};
        if(!pb.baseColorTexture) flat++; const pos=acc[q.attributes&&q.attributes.POSITION], idx=q.indices!=null?acc[q.indices]:null;
        if(pos&&pos.count<=24&&idx&&idx.count===36) box++; } }
    if(!n) set(z,'texture','L2','找不到這一區的室內模型檔（程式拼的道具第一層量不到）');
    else { const fp=Math.round(flat*100/n), bp=Math.round(box*100/n); rep.sort((a,b)=>b.k-a.k); const warn=fp>=50||bp>=25, rw=rep.length>0;   /* ★＝純色／方塊、◆＝同尺寸貨品一排重複（BB-C 建議分兩個符號）*/
      set(z,'texture','L2',(warn?'★ ':'')+(rw?'◆ ':'')+'零件 '+n+' 個：沒貼圖的純色 '+fp+'%、方塊 '+box+' 個（'+bp+'%）'+(rep.length?'；同一網格裡同尺寸重複 '+rep.slice(0,3).map(r=>r.mesh+' '+r.k+' 個 '+r.size).join('、'):'')+(warn||rw?'（★ 純色 ≥50% 或方塊 ≥25%；◆ 貨品同尺寸重複 ≥8｜SHOP-REALISM-1112）':'')); } }
  /* --- 尖峰有客人（吃的、喝的；平日 12:30、18:30）--- */
  if(ty==='eat'||ty==='drink'){ const bad=[]; let n=0; for(const h of [12.5,18.5]){ const ds=DAYS.filter(d=>isOpen(z,d,h)); if(!ds.length) continue; n++; let mx=0; for(const d of ds){ enter(z,d,h); mx=Math.max(mx,anon().length); if(mx) break; } if(!mx) bad.push(PLACES.hhmm(h)+'（看了 '+ds.length+' 個平日）'); }
    if(!n) fail(z,'cust','平日 12:30、18:30 都沒開，量不到尖峰'); else if(bad.length) fail(z,'cust','尖峰沒有任何路人客人：'+bad.join('、')); else pass(z,'cust'); } else na(z,'cust');
  /* --- 118 巷：排得到同學（SHOPLIFE）--- */
  if(l118id(z)){ if(!has('SHOPLIFE')||!SHOPLIFE.who) fail(z,'mates','沒有「吃飯時間遇到同學」那一套（SHOPLIFE）'); else { let n=0; for(let d=DK('2025-09-29');d<DK('2025-09-29')+42&&!n;d++){ const g=Object.assign({},G,{flags:Object.assign({},G.flags),zone:'dorm',day:d,weekday:CALENDAR.dateOf(d).wd%7}); for(const slot of ['lunch','dinner']){ g.hour=slot==='lunch'?12.5:18.5; try{ if(SHOPLIFE.who(g,slot).some(p=>p.zone===z)) n++; }catch(e){} } }
      if(n) pass(z,'mates'); else fail(z,'mates','六週裡午餐、晚餐都排不到任何一位同學'); } } else na(z,'mates');
  /* --- 互動點：真的按（0 元一輪、5000 元一輪）--- */
  const snap=J(G); const restore=()=>{ const g0=JSON.parse(snap); for(const k of Object.keys(G)) if(!(k in g0)) delete G[k]; Object.assign(G,g0); };
  const h0=openHs.includes(12.5)?12.5:openHs[0]; const unw=[], txt=[], errs=[]; let menus=[], neg=false, paidSay=true, spent=0, giftOpt=false, exitIt=null, clerkSaid=false;
  for(const money of [0,5000]){ restore(); enter(z,openDay,h0); G.money=money; const pts=E.interactables.slice();
    for(const n of clerks()) if(typeof n.talk==='function') pts.push({x:n.obj.position.x,z:n.obj.position.z,label:'（跟店員說話）',clerkTalk:true,onInteract:()=>n.talk(n)});   /* 跟店員說話點餐的店（公館燒臘）*/
    for(let round=0;round<(money?2:1);round++){ if(round&&spent>0) break;
      for(const it of pts){ if(hiddenOf(it)) continue; const lb=labelOf(it); if(it.exit){ if(!exitIt&&it.exit.to&&!Z3.ZONES[it.exit.to].indoor) exitIt=it; if(!exitIt&&it.exit.to&&/離開|出去|出門|下樓/.test(lb||'')) exitIt=it; }
        if(!money&&!round&&(lb==null||!String(lb).trim())) txt.push('有一個互動點按鈕沒有字（'+(it.kind||'x '+it.x+', z '+it.z)+'）');
        if(it.exit||it.elevator||(it.seat&&!it.onInteract&&!it.kind)) continue;
        const r=await press(it); if(r.neg) neg=true; if(money){ spent+=Math.max(0,r.spent); } for(const m of r.menus){ menus.push(m); if(m.some(t=>/帶走送人/.test(t))) giftOpt=true; }
        if(!money&&!it.clerkTalk&&r.menus.some(m=>m.some(t=>PRICE_RE.test(t)))&&!r.says.length&&!r.dim) paidSay=false;
        if(it.clerkTalk&&r.says.length) clerkSaid=true;
        if(money||round||it.clerkTalk) continue;
        if(/^err:/.test(r.ret)) errs.push('「'+lb+'」按了出錯（'+r.ret.slice(4)+'）');
        else if(r.ret==='timeout') errs.push('「'+lb+'」按了沒有結束');
        else if(r.ret==='none'&&!r.n){ const look=typeof it.look==='string'?it.look.trim():'';
          if(!look&&!it.seat) unw.push('「'+lb+'」'+(it.kind?'（'+it.kind+'）':''));
          else if(look&&(/^（[^）]*）$/.test(look)&&look.replace(/[（）]/g,'')===nm||look.replace(/。$/,'')===String(lb).replace(/^第 \d+ 走道：/,''))) txt.push('「'+lb+'」只有暫時的字「'+look+'」'); } } } }
  restore();
  if(errs.length) fail(z,'wired',errs.slice(0,3).join('；')+(errs.length>3?'…共 '+errs.length+' 個':'')); else if(unw.length) fail(z,'wired','按了沒有反應：'+unw.slice(0,4).join('、')+(unw.length>4?'…共 '+unw.length+' 個':'')); else pass(z,'wired');
  if(txt.length) fail(z,'text',txt.slice(0,3).join('；')+(txt.length>3?'…共 '+txt.length+' 個':'')+'（字由 AA 寫，D79）'); else pass(z,'text');
  const priced=menus.some(m=>m.some(t=>PRICE_RE.test(t)));
  const seatOrder=!priced&&clerkSaid&&Array.isArray(zone.seats)&&zone.seats.length>0;   /* 店員會說話、有座位、互動點沒有點餐＝可能是坐下才點（座位選單在 game3d.js 裡面，第一層按不到）*/
  if(seatOrder){ set(z,'buy','L2','互動點和店員都出不了有價錢的選單，可能是坐下才點餐（座位選單第一層按不到）：實際坐下點一次'); set(z,'nomoney','L2','同上'); }
  else if(!priced) fail(z,'buy','沒有任何一個互動點出得了有價錢的選單（買不到東西／點不到餐）'); else if(!(spent>0)) fail(z,'buy','有價錢的選單，身上 5000 元選了卻沒有扣錢'); else pass(z,'buy');
  if(seatOrder){} else if(!priced) fail(z,'nomoney','沒有買東西的流程'); else if(neg) fail(z,'nomoney','身上 0 元也買得下去（錢變成負的）'); else if(!paidSay) fail(z,'nomoney','身上 0 元選了東西以後沒有任何一句話'); else pass(z,'nomoney');
  /* 賣飲料的可以「買一份帶走送人」*/
  { const drinks=[]; if(has('GIFT')&&GIFT.isDrinkName) for(const m of menus) for(const t of m){ if(!PRICE_RE.test(t)) continue; const n1=t.split(/[　〔]/)[0].trim(); try{ if(n1&&GIFT.isDrinkName(n1)&&!drinks.includes(n1)) drinks.push(n1); }catch(e){} }
    if(!drinks.length) na(z,'gift'); else if(giftOpt) pass(z,'gift'); else fail(z,'gift','賣飲料（'+drinks.slice(0,3).join('、')+'）、選單沒有「買一份帶走送人…」（GIFT.SHOPS）'); }
  /* 出口 */
  if(!exitIt) fail(z,'exit','沒有出口互動點'); else { pass(z,'exit'); (exitsByZone[exitIt.exit.to]=exitsByZone[exitIt.exit.to]||[]).push({z,sp:exitIt.exit.spawn||null}); }
  /* --- 打烊：會請出去（資料／處理程式在不在）；打烊以後店裡不該還站著店員 --- */
  if(allDay){ if(hoursText) na(z,'closeOut','24 小時'); else fail(z,'closeOut','沒有營業時間，也就沒有打烊'); na(z,'closedClerk'); }
  else { const X=has('XSCLOSE')?XSCLOSE:null; const ok=(X&&((X.ZONES&&X.ZONES[z])||(X.PLACE_OF&&X.PLACE_OF[z])))||(has('GG3')&&Array.isArray(GG3.ZONES)&&GG3.ZONES.includes(z)&&typeof GG3.closeOut==='function');
    if(ok) pass(z,'closeOut'); else fail(z,'closeOut','打烊時人在店裡沒有對應（不在 XSCLOSE 的表上、也不是 GG3 管的店）');
    let cd=null, ch=null; for(const d of [openDay,openDay+1]){ for(const h of [23.5,3,6.5,22.5,21.5,16]){ if(!isOpen(z,d,h)){ cd=d; ch=h; break; } } if(cd!=null) break; }
    if(cd==null) na(z,'closedClerk'); else { enter(z,cd,ch); const n=clerks().length; if(n) fail(z,'closedClerk','沒開的時候（'+PLACES.hhmm(ch)+'）店裡還站著 '+n+' 位店員（從店外的窗戶看進去會像開著）'); else pass(z,'closedClerk'); } }
}

/* ====================================================================================================
   攤販（不進去的：只查「有人顧攤」「買得到」）
   ==================================================================================================== */
async function checkStalls(){ const defs=[
    {zone:'tingzhou',area:'夜市（汀州路）',pick:it=>it.nmStall,id:it=>it.nmStall,times:[[SAT,19.5],[SAT,21],[DK('2026-07-11'),19.5]]},
    {zone:'gongguan',area:'夜市（公館）',pick:it=>it.nmStall,id:it=>it.nmStall,times:[[SAT,19.5],[SAT,21],[DK('2026-07-11'),19.5]]},
    {zone:'gongguan',area:'宵夜（公館）',pick:it=>it.lwStall,id:it=>it.lwStall,times:[[SAT,19.5],[SAT,22.5],[DK('2026-07-11'),19.5]]},   /* 滷味攤（EAT-EFFECT-1020，src/luwei3d.js；每天 18:00～24:00）*/
    {zone:'lane118',area:'118 巷（外帶）',pick:it=>typeof it.shop118==='string'&&/^drink/.test(it.shop118),id:it=>it.shop118,times:[[WED,15],[WED,12.5]]},
    {zone:'wenzhou',area:'溫州街（窗口）',pick:it=>it.wzShop&&it.kind==='window',id:it=>it.wzShop,times:[[WED,15],[DK('2026-07-08'),15]]} ];
  for(const D of defs){ if(!Z3.ZONES[D.zone]) continue; const seen={};
    for(const [d,h] of D.times){ if(d==null) continue; const snap=J(G); enter(D.zone,d,h); const pts=E.interactables.filter(it=>{ try{ return D.pick(it); }catch(e){ return false; } });
      for(const it of pts){ const id=D.id(it), key='stall:'+D.zone+':'+id; const S=seen[key]=seen[key]||{name:String(labelOf(it)||id).replace(/^看/,'').replace(/（.*$/,''),tend:false,priced:false,spent:false};
        if(hiddenOf(it)) continue; S.n=(S.n|0)+1; G.money=5000; const r=await press(it); const pr=r.menus.some(m=>m.some(t=>PRICE_RE.test(t))); if(pr){ S.priced=true; if(r.spent>0) S.spent=true; }
        if(E.npcs.some(n=>(n.clerk||n.vendor||n.stallKeeper)&&Math.hypot(n.obj.position.x-it.x,n.obj.position.z-it.z)<3.0)) S.tend=true; }
      const g0=JSON.parse(snap); for(const k of Object.keys(G)) if(!(k in g0)) delete G[k]; Object.assign(G,g0); }
    for(const key of Object.keys(seen)){ const S=seen[key]; ROWS.push({key,name:S.name,area:D.area,stall:true});
      if(S.tend) pass(key,'tend'); else fail(key,'tend','攤子 3 m 內沒有顧攤的人（看了 '+(S.n|0)+' 個時刻；程式沒有放人，模型裡有沒有假人第一層看不到）');
      if(!S.priced) fail(key,'buy','按了出不了有價錢的選單'); else if(!S.spent) fail(key,'buy','有價錢的選單，選了沒有扣錢'); else pass(key,'buy'); } } }

/* ====================================================================================================
   --coplanar：重算基準
   ==================================================================================================== */
if(ARGV.includes('--coplanar')){ const o={}; for(const z of SHOPS){ try{ enter(z,WED,12.5); }catch(e){} for(const p of glbsOf(z)){ if(o[p]) continue; const r=copScan(p); if(!r){ out('FAIL 重算不了（要 python3＋numpy、tools/glb_coplanar.py）：'+p); process.exit(1); } o[p]=r; out('  '+p+'　牆的疊面 '+r.wall+' m²（全部 '+r.always+' m²）'); } }
  /* 基準只准變少（2026-11-14 LAWWW-C：大口漢堡一樓的真疊面被「先 --coplanar --write」蓋掉，LAWWW2 驗收時沒抓到）：同一個模型的 wall／always 比原本的基準多 0.01 m² 以上＝不寫、印出來、結束碼 1；真的要放寬（例如換了新模型、整間重做）才加 --allow-grow，並在 commit 訊息寫為什麼 */
  { let old={}; try{ old=JSON.parse(fs.readFileSync(COP_FILE,'utf8')); }catch(e){} const grow=[]; for(const k of Object.keys(o)){ const a0=old[k]; if(!a0) continue; for(const f of ['wall','always']){ if(typeof a0[f]==='number'&&typeof o[k][f]==='number'&&o[k][f]>a0[f]+0.01) grow.push(k.split('/').pop()+' '+f+' '+a0[f]+' → '+o[k][f]+'（'+(o[k].top||'')+'）'); } }
    if(grow.length&&!ARGV.includes('--allow-grow')){ out('FAIL 疊面基準只准變少，這幾個變多了（沒有寫檔；要先修模型；確定要放寬才加 --allow-grow）：\n  '+grow.join('\n  ')); process.exit(1); }
    if(grow.length) out('WARN --allow-grow：疊面基準放寬 '+grow.length+' 個：\n  '+grow.join('\n  ')); }
  const keys=Object.keys(o).sort(); const s={}; for(const k of keys) s[k]=o[k]; fs.writeFileSync(COP_FILE,JSON.stringify(s,null,1)+'\n'); out('寫好了 tests/place_gate_coplanar.json（'+keys.length+' 個模型）'); process.exit(0); }

/* ====================================================================================================
   跑、對例外表和已知未過、印結果、寫狀態表
   ==================================================================================================== */
(async()=>{
  for(const z of SHOPS){ try{ await checkShop(z); }catch(e){ fail(z,'wired','檢查到一半出錯：'+String(e&&e.stack||e).split('\n').slice(0,2).join(' / ').slice(0,240)); } }
  /* 出口落點站不站得住（一條街建一次）*/
  for(const to of Object.keys(exitsByZone)){ if(!Z3.ZONES[to]){ for(const q of exitsByZone[to]) fail(q.z,'exit','出口通到不存在的區域 '+to); continue; }
    try{ enter(to,WED,12.5); }catch(e){ for(const q of exitsByZone[to]) fail(q.z,'exit','出口通到的區域 '+to+' 建不起來'); continue; }
    for(const q of exitsByZone[to]){ const sp=q.sp||E.zone.spawn; let ok=false; try{ const lv=sp.lv|0; if(E.levels) E.nav=E.levels[lv]||E.nav; ok=!!E.canStand(sp.x,sp.z,0.3,lv); }catch(e){} if(!ok) fail(q.z,'exit','走出去的位置站不住（'+to+' x '+sp.x+', z '+sp.z+'）'); } }
  try{ await checkStalls(); }catch(e){ out('FAIL 攤販檢查到一半出錯　'+String(e&&e.stack||e).split('\n').slice(0,2).join(' / ').slice(0,240)); hardFails++; }

  /* 對例外表、已知未過 */
  const keyOf=(z,i)=>z+'|'+i; const EXC={}, KNOWN={}; const tableErr=[];
  for(const e of EXCEPT){ if(!e.reason||!ITEMS[e.item]) tableErr.push('例外表：'+J(e)+' 沒有理由或項目名寫錯'); EXC[keyOf(e.zone,e.item)]=e; }
  for(const k of KNOWN_FAIL){ if(!k.task||!ITEMS[k.item]) tableErr.push('KNOWN_FAIL：'+J(k)+' 沒有任務 ID 或項目名寫錯'); if(EXC[keyOf(k.zone,k.item)]) tableErr.push('同一項同時在例外表和 KNOWN_FAIL：'+k.zone+' '+k.item); KNOWN[keyOf(k.zone,k.item)]=k; }
  const rowOf={}; for(const r of ROWS) rowOf[r.key]=r;
  for(const e of EXCEPT) if(!rowOf[e.zone]) tableErr.push('例外表有一間不存在的店：'+e.zone); for(const k of KNOWN_FAIL) if(!rowOf[k.zone]) tableErr.push('KNOWN_FAIL 有一間不存在的店：'+k.zone);
  const newFail=[], known=[], stale=[], exc=[], unusedExc=[]; let nPass=0, nL2=0;
  for(const r of ROWS){ const R=RES[r.key]||{};
    for(const item of Object.keys(ITEMS)){ let c=R[item]; const k=keyOf(r.key,item), K=KNOWN[k], X=EXC[k]; if(!c){ if(K&&K.manual){ c=R[item]={st:'L2',msg:''}; } else continue; }
      if(X){ if(c.st!=='FAIL'&&c.st!=='L2') unusedExc.push(r.name+' '+ITEMS[item].t+(c.st==='NA'?'（這一項現在不適用）':'')); c.st='EXC'; c.msg=X.reason; exc.push([r,item,X]); continue; }
      if(K&&K.manual){ c.st='KNOWN'; c.task=K.task; c.msg=c.msg||'使用者／LAWWW2 回報，第一層判不了，等第二層'; known.push([r,item,c]); continue; }
      if(c.st==='FAIL'){ if(K){ c.st='KNOWN'; c.task=K.task; known.push([r,item,c]); } else newFail.push([r,item,c]); }
      else if(K){ stale.push([r,item,K]); }
      else if(c.st==='PASS') nPass++; else if(c.st==='L2') nL2++; } }
  for(const [r,item,c] of known) out('KNOWN-FAIL '+r.name+'（'+r.key+'）'+ITEMS[item].t+'：'+c.msg+'（'+c.task+'）');
  for(const [r,item,X] of exc) out('例外 '+r.name+'（'+r.key+'）'+ITEMS[item].t+'：'+X.reason);
  if(unusedExc.length) out('WARN 例外表上這幾項現在其實過得了（可以考慮拿掉）：'+unusedExc.join('、'));
  for(const [r,item,c] of newFail) out('FAIL '+r.name+'（'+r.key+'）'+ITEMS[item].t+'：'+c.msg);
  for(const [r,item,K] of stale) out('FAIL '+r.name+'（'+r.key+'）'+ITEMS[item].t+'：KNOWN_FAIL 上寫未過（'+K.task+'），現在過了——把這一列從 tests/place_gate_unit.js 的 KNOWN_FAIL 拿掉');
  for(const t of tableErr) out('FAIL 表寫錯：'+t);
  if(ARGV.includes('--suggest')){ const by={}; for(const [r,item] of newFail) (by[item]=by[item]||[]).push(r.key); for(const i of Object.keys(by)) out("  KF(T_BACK,'"+i+"','"+by[i].join(' ')+"'),"); }

  /* ---------- 狀態表 ---------- */
  const cell=(r,col)=>{ const R=RES[r.key]||{}; const its=Object.keys(ITEMS).filter(i=>ITEMS[i].col===col&&R[i]); const esc=s=>String(s).replace(/\|/g,'／').replace(/\n/g,' ');
    if(r.stall&&!its.length) return '—'; const F=its.filter(i=>R[i].st==='FAIL'||R[i].st==='KNOWN'), X=its.filter(i=>R[i].st==='EXC'), L=its.filter(i=>R[i].st==='L2'); const parts=[];
    if(F.length) parts.push('**FAIL**（'+F.map(i=>ITEMS[i].t+'：'+esc(R[i].msg)+(R[i].task?'｜'+R[i].task:'｜**還沒開任務**')).join('；')+'）');
    if(X.length) parts.push('例外（'+X.map(i=>ITEMS[i].t+'：'+esc(R[i].msg)).join('；')+'）');
    const l2=L.map(i=>ITEMS[i].t+(R[i].msg?'：'+esc(R[i].msg):'')); if(!r.stall&&LAYER2_NOTE[col]) l2.push(LAYER2_NOTE[col]); if(l2.length) parts.push('第二層（還沒拍：'+l2.join('；')+'）');
    if(!F.length&&its.some(i=>R[i].st==='PASS')) parts.unshift('PASS'+(X.length||l2.length?'（第一層）':''));
    return parts.join('<br>')||'—'; };
  /* 第三層＝BB 看圖判的結果（docs/handoff/place_gate_bb.json，BB 每判一批更新、交 LAWWW 合；BB-C 2026-11-12：交班後別的帳號看表要看得到 BB 已經判 FAIL 的店）*/
  let BBJ={}; try{ const j=JSON.parse(fs.readFileSync(path.join(ROOT,'docs/handoff/place_gate_bb.json'),'utf8')); for(const q of j.shops||[]) BBJ[q.zone]=q; }catch(e){}
  const bbCell=k=>{ const esc=s=>String(s).replace(/\|/g,'／').replace(/\n/g,' '); const q=BBJ[k]; if(!q) return '第二層還沒拍、BB 還沒判'; const f=(q.fail||[]).join('、'), pd=(q.pending||[]).join('、');
    return '**BB '+esc(q.verdict)+'**（@'+esc(q.sha||'')+(f?'；未過：'+esc(f):'')+(pd?'；還沒判：'+esc(pd):'')+(q.note?'；'+esc(q.note):'')+'｜'+esc(q.ref||'')+'）'; };
  const cc0Cell=r=>{ if(r.stall) return '—'; const L=CC0[r.key]; if(!L) return '量不到'; if(!L.length) return '找不到店內模型（第二層看）'; const esc=x=>String(x).replace(/\|/g,'／');
    return L.map(q=>q.ok?'PASS（'+path.basename(q.glb)+'）':'**沒用**（'+path.basename(q.glb)+'：'+esc(q.why)+'｜SHOP-REALISM-1112）').join('<br>'); };
  const verdict=r=>{ const R=RES[r.key]||{}; const F=Object.keys(R).filter(i=>R[i].st==='FAIL'||R[i].st==='KNOWN'); return (F.length?'**未過 '+F.length+' 項**':'第一層 PASS')+(r.stall?'':'；'+bbCell(r.key)); };
  const areas=[]; for(const r of ROWS) if(!areas.includes(r.area)) areas.push(r.area);
  const byTask={}; for(const [r,item,c] of known) (byTask[c.task]=byTask[c.task]||[]).push(r.name+'（'+ITEMS[item].t+'）');
  const MARK='<!-- 以下由 tests/place_gate_unit.js --write 產生，不要手改 -->';
  let body=MARK+'\n\n## 總計\n\n- 店 '+ROWS.filter(r=>!r.stall).length+' 間、攤販 '+ROWS.filter(r=>r.stall).length+' 攤；第一層查了 '+(nPass+known.length+newFail.length+exc.length)+' 項：PASS '+nPass+'、未過 '+(known.length+newFail.length)+'（已開任務 '+known.length+'、還沒開任務 '+newFail.length+'）、例外 '+exc.length+'。\n'
    +Object.keys(byTask).sort().map(t=>'- 未過・'+t+'（'+byTask[t].length+' 項）：'+byTask[t].join('、')).join('\n')+'\n'
    +(newFail.length?'- **還沒開任務的未過**：'+newFail.map(([r,item])=>r.name+'（'+ITEMS[item].t+'）').join('、')+'\n':'')
    +'\n## 第一層判不了、要第二層（CC 瀏覽器）拍的\n\n'+[1,2,3,4].map(c=>'- 第 '+c+' 點「'+COLS[c]+'」：'+LAYER2_NOTE[c]).join('\n')+'\n- 「牆沒有疊在同一平面」第一層只擋「比基準多」；基準上已經有的疊面寫「疑似」，閃不閃要連拍。\n- 「天花板」第一層比的是房間高度和**預設**跟隨鏡頭高度（玩家自己把鏡頭抬高不算）；多樓層只比一樓。\n';
  for(const a of areas){ const rows=ROWS.filter(r=>r.area===a); body+='\n## '+a+'\n\n| 店（區域 id） | 1 街上看 | 2 店裡面 | 3 人 | 4 做得到的事 | 5 時間 | 6 字 | 7 驗收 | CC0 素材（D160） |\n|---|---|---|---|---|---|---|---|---|\n';
    for(const r of rows) body+='| '+r.name+'<br>`'+r.key+'` | '+[1,2,3,4,5,6].map(c=>cell(r,c)).join(' | ')+' | '+verdict(r)+' | '+cc0Cell(r)+' |\n'; }
  const DOC=path.join(ROOT,'docs/handoff/SHOP_STANDARD_STATUS.md');
  if(ARGV.includes('--write')){ let sha='?', date='?'; try{ sha=cp.execSync('git rev-parse --short=10 HEAD',{cwd:ROOT,encoding:'utf8'}).trim(); date=cp.execSync('git log -1 --format=%cs',{cwd:ROOT,encoding:'utf8'}).trim(); }catch(e){}
    const head='# 每一間店照店面標準七點的現況（SHOP-STANDARD-BACKFILL-1112；CLAUDE.md §12，D155）\n\n'
      +'> 這一份是測試產生的，不是手寫的：`node tests/place_gate_unit.js --write`（地點關卡第一層，ROLE_BB 2.6）。產生時的版本：`'+sha+'`（'+date+'）之後的工作目錄。\n'
      +'> 重新產生：改了店、修了問題以後跑 `node tests/place_gate_unit.js --write`，和程式同一個 commit 交。這份過期（和測試現在算出來的不一樣）測試會 FAIL。\n'
      +'> 每一格：PASS／**FAIL**（哪一項、為什麼｜任務 ID）／例外（理由，寫在測試最上面的例外表）／第二層（第一層判不了、CC 還沒拍）。七點的內容看 CLAUDE.md §12。\n'
      +'> 第一層是在 Node 把整個遊戲載進來、建出每一間店、真的叫生成程式、真的按每一個互動點量的；**沒有畫面**，看起來對不對是第二層（CC）和第三層（BB）。\n\n';
    fs.writeFileSync(DOC,head+body); out('寫好了 docs/handoff/SHOP_STANDARD_STATUS.md'); }
  let docStale=false; if(!ARGV.includes('--no-doc')&&!ARGV.includes('--write')){ let cur=''; try{ cur=fs.readFileSync(DOC,'utf8'); }catch(e){} const i=cur.indexOf(MARK); if(i<0||cur.slice(i)!==body){ docStale=true; out('FAIL 狀態表 docs/handoff/SHOP_STANDARD_STATUS.md '+(cur?'過期了（和現在算出來的不一樣）':'不存在')+'：跑 node tests/place_gate_unit.js --write 再一起 commit'); } else out('PASS 狀態表 docs/handoff/SHOP_STANDARD_STATUS.md 是最新的'+(ARGV.includes('--check')?'（--check）':'')); }

  const byT={}; for(const [, ,c] of known) byT[c.task]=(byT[c.task]|0)+1;
  out('INFO 店 '+ROWS.filter(r=>!r.stall).length+' 間＋攤販 '+ROWS.filter(r=>r.stall).length+' 攤；PASS '+nPass+' 項、已知未過 '+known.length+' 項（'+Object.keys(byT).sort().map(t=>t+' '+byT[t]).join('、')+'）、例外 '+exc.length+' 項、第二層 '+nL2+' 項；'+((Date.now()-T0)/1000).toFixed(1)+' 秒');
  const bad=newFail.length+stale.length+tableErr.length+hardFails+(docStale?1:0);
  out(bad?'FAILED '+bad+'（新的問題 '+newFail.length+'、已經過了要從表上拿掉 '+stale.length+(docStale?'、狀態表過期':'')+'）':'ALL PASS（沒有新的問題；已知未過 '+known.length+' 項見上面）');
  process.exit(bad?1:0);
})().catch(e=>{ console.log('FAILED（地點關卡自己壞了，沒有跑完——不算通過）：'+(e&&e.stack||e)); process.exit(1); });   /* 2026-11-12：原本中途丟例外會安靜地結束碼 0 */
