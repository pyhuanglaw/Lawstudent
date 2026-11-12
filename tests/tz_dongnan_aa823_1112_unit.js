// 汀州路・東南大聯商行（tz_dongnan）的店內文字（TINGZHOU-SHOPS5-1110；AA_823 @ 3d0ab9944〔第一版 6f1308ee5；3d0ab9944＝AA 11-12 回 LAWWW-C 七問〕，分支 claude/magical-albattani-bk7b4n）——不需要瀏覽器（D131）。
//   1  資料檔 src/data/tz_grocery_lines.js 逐字對稿（店名、老闆的句子、十樣東西的名字／價錢／貨架／一句說明、四個貨架的「看」和按鈕、結帳的字）；匯入工具 --check；白名單
//   2  營業時間每天 10:00～21:30（places.js）、名字、颱風假關、算汀州路
//   3  關門時按店門：打烊以後＝稿的 closed_outside＋開放時間；開門以前（06～10）＝稿的 not_open＋開放時間；開著不擋
//   4  進門：一天第一次老闆一句、同一天再進來不說
//   5  打烊：人還在店裡＝老闆「我們今天要打烊了。」、走到汀州路；讀檔回到打烊以後＝不說、走出去
//   6  貨架：稿的「看」那一句 → 這個貨架的東西（名字＋價錢；說明當提示）→ 拿在手上；拿過的不再列
//   7  結帳：手上沒東西＝empty；「就這些嗎？」→ 買／不用了；扣錢、時間；買完那一句——有泡麵（一包／五包裝）或辣醬＝after_spicy，其他＝after 隨機一句
//   8  錢不夠＝稿的那一句旁白、不扣錢、時間不動、東西放回去；「不用了」＝不扣錢
//   9  配置的五個點都接上；手上的東西不進存檔（走出去再進來＝沒有了）
//   10 原本的店照舊；index.html 載入順序；node --check
//   11 （子程序 A：建出遊戲真正的區域）五個點在配置的位置、按鈕的字照稿、老闆站在配置的位置（開店才有）
//   12 （AA 11-12 回七問，3d0ab9944）拿起一樣＝稿的 pick 那一句；結帳「不用了」＝稿的 counter.cancel 那一句；椰子水、泰式奶茶的說明照新稿；
//      買的東西進「物品」（G.flags.GG3_OWN；選單「物品」分頁 GG3.ownHTML：店名＋東西的名字，都是稿的字）；舊存檔沒有那個欄位＝照常、讀的時候不寫入；存檔（JSON）再讀回來留著
//      修改前（b3a9e3c6e0）：資料檔沒有 pick、cancel、GG3 沒有 own／ownHTML、買了存檔不變——12 全部 FAIL、1 的白名單 SHA FAIL。
// 修改前（b1d0379816）：沒有資料檔、GG3 不認得 tz_dongnan、沒有營業時間、互動點只有暫時的一句——FAIL。
// 用法：node tests/tz_dongnan_aa823_1112_unit.js
const Z='tz_dongnan', SHA='3d0ab9944', DOC='docs/story_planning/AA_823_tz_dongnan.json', DATA='src/data/tz_grocery_lines.js', MEAL='src/data/tz_meal_lines.js';
if(process.argv[2]==='A') partA(); else partB();

function partA(){
const fs=require('fs'), vm=require('vm'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
process.on('unhandledRejection',()=>{}); global.window=global; global.self=global; console.warn=()=>{};
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const J=x=>JSON.stringify(x);
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/calendar.js','src/data/places.js','src/data/tingzhou_layout.js','src/tingzhou3d.js','src/data/tz_shops_layout.js','src/tz_shops3d.js','src/data/gg3_shops_lines.js',MEAL,DATA,'src/gg3shops3d.js'];
for(const f of files){ if(!fs.existsSync(path.join(ROOT,f))){ check('11 載得到 '+f,false); continue; } let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|TZ3|TZS3|TINGZHOU_LAYOUT|TZ_SHOPS_LAYOUT|LINZE_LAYOUT|CLASSROOM_LAYOUT|PROPS|CHAR|CALENDAR|PLACES|GG3_LINES|TZ_MEAL_LINES|TZ_GROCERY_LINES|GG3)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
if(typeof ASSETS!=='undefined') ASSETS.loadOne=()=>new Promise(()=>{});
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
const loadZone=id=>{ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.nav=z.nav; return z; };
const T=typeof TZ_GROCERY_LINES!=='undefined'?TZ_GROCERY_LINES[Z]:null;
check('11 GG3 認得 tz_dongnan、包上區域的 build',!!T&&typeof GG3!=='undefined'&&GG3.ZONES.includes(Z)&&GG3.LAYID[Z]==='dongnan'&&!!Z3.ZONES[Z]&&!!Z3.ZONES[Z]._gg3);
if(T&&typeof GG3!=='undefined'&&GG3.ZONES.includes(Z)&&Z3.ZONES[Z]){ const L=TZ_SHOPS_LAYOUT.dongnan, z=loadZone(Z), IT=E.interactables, bad=[];
  for(const p of L.points){ const it=IT.find(i=>i.tzPoint===p.id); if(!it){ bad.push(p.id+' 沒有'); continue; }
    if(it.gg3!==Z) bad.push(p.kind+' 沒接上'); if(Math.abs(it.x-p.x)>1e-6||Math.abs(it.z-p.z)>1e-6) bad.push(p.kind+' 位置不對'); if(it.label!==T.labels[p.kind]) bad.push(p.kind+' 按鈕「'+it.label+'」≠稿「'+T.labels[p.kind]+'」'); }
  check('11 配置的五個點（結帳＋四個貨架）：在配置的位置、接上、按鈕的字照稿',!bad.length&&L.points.length===5,J(bad));
  check('11 按鈕的字：結帳、看泡麵和零食、看醬料和罐頭、看飲料冰箱、看米和乾貨',J(L.points.map(p=>(IT.find(i=>i.tzPoint===p.id)||{}).label))===J(['結帳','看泡麵和零食','看醬料和罐頭','看飲料冰箱','看米和乾貨']),J(L.points.map(p=>(IT.find(i=>i.tzPoint===p.id)||{}).label)));
  check('11 沒有座位（zone.seats 是空的）',Array.isArray(z.seats)&&z.seats.length===0&&!IT.some(i=>i.tzSeat),J(z.seats&&z.seats.length));
  check('11 離開的門還在（回汀州路）',IT.some(i=>i.exit&&i.exit.to==='tingzhou'));
  check('11 區域記了老闆站的位置（配置 clerk：2.5, 3.3、面向店裡）',!!z.shopClerk&&z.shopClerk.x===2.5&&z.shopClerk.z===3.3&&Math.abs(z.shopClerk.yaw-Math.PI)<1e-3,J(z.shopClerk));
  const C0=global.CHAR, S0=global.STORY, A0=E.addNPC, got=[]; global.CHAR={build:()=>new THREE.Group()}; global.STORY={extraSpec:i=>({i})}; E.addNPC=o=>{ got.push(o); return o; };
  try{ const GMo={E,G:{day:DK('2025-10-07'),hour:12,flags:{}}}; const n1=GG3.placeClerk(Z,GMo); GMo.G.hour=21.6; const n2=GG3.placeClerk(Z,GMo); GMo.G.hour=9; const n3=GG3.placeClerk(Z,GMo);
    check('11 老闆站在配置的位置、面向店裡（開店才有；打烊、開門以前沒有；男性的路人模型）',!!n1&&!n2&&!n3&&got.length===1&&Math.abs(n1.obj.position.x-L.clerk.x)<1e-6&&Math.abs(n1.obj.position.z-L.clerk.z)<1e-6&&Math.abs(n1.obj.rotation.y-L.clerk.yaw)<1e-6&&n1.frozen&&n1.clerk&&n1.gg3Clerk===Z&&GG3.CLERK_I[Z]%2===1,J(got.map(o=>[o.obj.position.x,o.obj.position.z]))); }
  finally { global.CHAR=C0; global.STORY=S0; E.addNPC=A0; } }
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
function DK(key){ for(let d=-400;d<1500;d++) if(CALENDAR.dateOf(d).key===key) return d; return null; }
}

function partB(){
const H=require('./pg_harness.js'); const {check,GM,E}=H;
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=H.ROOT, rd=p=>fs.readFileSync(path.join(ROOT,p),'utf8'), J=JSON.stringify;
console.warn=()=>{};
const loadErr=[];
for(const f of ['src/data/tingzhou_layout.js','src/data/tz_shops_layout.js','src/data/eat_lines.js','src/eat3d.js','src/data/gg3_shops_lines.js',MEAL,DATA,'src/gg3shops3d.js']){
  if(!fs.existsSync(path.join(ROOT,f))){ loadErr.push(f+'（沒有這個檔）'); continue; }
  try{ let s=rd(f); s=s.replace(/^const (\w+)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); }catch(e){ loadErr.push(f+'：'+String(e).slice(0,200)); } }
const ok0=!loadErr.length&&typeof GG3!=='undefined'&&typeof TZ_GROCERY_LINES!=='undefined'&&!!TZ_GROCERY_LINES[Z]&&GG3.ZONES.includes(Z);
check('0 載得到（配置、原本的資料檔、東南大聯商行的資料檔、GG3），GG3 認得 tz_dongnan',ok0,loadErr.join(' | '));
if(!ok0){ H.done(); }
const T=TZ_GROCERY_LINES[Z], X=T.grocery, LY=TZ_SHOPS_LAYOUT.dongnan;
let spent=[]; GM.money=(d,why)=>{ H.G.money=(H.G.money|0)+d; spent.push([d,why]); };
const toasts=[]; GM.toast=t=>toasts.push(t); GM.enterN=1;
const fresh=(key,h,zone,fl)=>{ const G=H.fresh(key,h,zone,fl); G.money=5000; toasts.length=0; spent=[]; E.interactables=[]; E.player.seat=null; GG3.rand=()=>0; GM.enterN=(GM.enterN|0)+1; return G; };
const said=()=>H.said.map(s=>[s.who,s.t]);
const near=(a,b)=>Math.abs(a-b)<1e-6;
const DK=k=>PG.DK(k);
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+' 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); } };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const good=id=>X.goods.find(q=>q.id===id);
const press=kind=>STORY.interact({tzPoint:kind.replace('tz_dongnan_',''),kind,label:'（暫時）',look:'（暫時）'},GM);
/* 到貨架拿（names：要拿的幾樣，照順序；最後「不用了」離開）*/
const take=async(kind,names)=>{ H.picks=names.concat(['不用了']); return press(kind); };
const WHO='老闆';

(async()=>{
// ---- 1 逐字對稿 ----
await sec(1,()=>{ let raw=null; try{ raw=cp.execFileSync('git',['show',SHA+':'+DOC],{cwd:ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']}); }catch(e){}
  if(!raw){ console.log('SKIP 1 讀不到稿 '+SHA+'（淺層複本：git fetch origin claude/magical-albattani-bk7b4n）'); }
  else { const A=JSON.parse(raw), C=A.looks.tz_dongnan_counter;
    check('1 店名「東南大聯商行」、說話的人「老闆」、營業時間照稿',T.name===A.shop.name&&T.name==='東南大聯商行'&&T.who===A.staff.who&&T.who===WHO&&T.hours===A.shop.hours,J([T.name,T.who,T.hours]));
    check('1 老闆進門三句、打烊、打烊以後門口、錢不夠照稿',J(T.door)===J(A.staff.greet.map(t=>[A.staff.who,t]))&&T.door.length===3&&T.close===A.staff.closed_line&&T.sign===A.staff.closed_outside&&X.short===A.staff.no_money,J([T.door,T.close,T.sign,X.short]));
    check('1 開門以前門口那一句（staff.not_open，旁白；膠帶「印著泰文」）照稿',T.notOpen===A.staff.not_open&&/^（.*）$/.test(T.notOpen)&&/印著泰文/.test(T.notOpen)&&T.notOpen!==T.sign,J(T.notOpen));
    const ids=Object.keys(A.items); check('1 十樣東西：id、名字、價錢、貨架、一句說明照稿（順序也照稿）',ids.length===10&&J(X.goods)===J(ids.map(id=>({id,n:A.items[id].name,p:A.items[id].price,at:A.items[id].where,line:A.items[id].line}))),J(X.goods.map(q=>[q.id,q.n,q.p,q.at])));
    check('1 價錢：泡麵一包 35、五包裝 150、蝦餅 60、是拉差辣醬 95、魚露 70、椰奶罐頭 45、椰子水 40、泰式奶茶 45、香米 110、乾河粉 55',
      J(X.goods.map(q=>[q.n,q.p]))===J([['東南亞泡麵（一包）',35],['泡麵（五包裝）',150],['蝦餅',60],['是拉差辣醬',95],['魚露（小瓶）',70],['椰奶罐頭',45],['罐裝椰子水',40],['瓶裝泰式奶茶',45],['香米（一公斤）',110],['乾河粉',55]]),J(X.goods.map(q=>[q.n,q.p])));
    check('1 每一樣在哪個貨架：泡麵零食 3、醬料罐頭 3、飲料 2、米和乾貨 2',J(['noodle','sauce','drink','rice'].map(s=>X.goods.filter(q=>q.at==='tz_dongnan_'+s).length))===J([3,3,2,2]));
    const ks=Object.keys(A.looks).filter(k=>k!=='tz_dongnan_counter'); check('1 四個貨架的「看」：句子（旁白）、按鈕的字照稿',J(ks)===J(['tz_dongnan_noodle','tz_dongnan_sauce','tz_dongnan_drink','tz_dongnan_rice'])&&ks.every(k=>J(T.look[k])===J([A.looks[k].t])&&/^（.*）$/.test(A.looks[k].t)&&T.labels[k]===A.looks[k].button)&&Object.keys(T.look).length===4&&Object.keys(T.labels).length===5,J([T.look,T.labels]));
    check('1 結帳：kind、按鈕「結帳」、「就這些嗎？」、買完兩句、手上沒有東西那一句照稿',X.point==='tz_dongnan_counter'&&T.labels[X.point]===C.button&&C.button==='結帳'&&X.ask===C.ask&&X.ask==='就這些嗎？'&&J(X.after)===J(C.after)&&X.after.length===2&&X.empty===C.empty,J([X.ask,X.after,X.empty]));
    check('1 買了泡麵或辣醬那一句（after_spicy）照稿；條件＝稿的 after_spicy_when 寫的三樣',J(X.afterIf)===J({ids:['tz_dn_noodle','tz_dn_noodle5','tz_dn_sauce'],line:C.after_spicy})&&X.afterIf.ids.every(id=>C.after_spicy_when.includes(id))&&/取代 after/.test(C.after_spicy_when)
      &&Object.keys(A.items).filter(id=>C.after_spicy_when.includes(id+'、')||C.after_spicy_when.includes(id+'）')).sort().join()===X.afterIf.ids.slice().sort().join(),J(X.afterIf));
    /* 資料檔裡每一個字串都原封不動在稿裡（程式用的 id、配置 id 除外）*/
    const SKIP=new Set(['layout','id','point','at','ids']), all=[]; const walk=(x,k)=>{ if(typeof x==='string'){ if(!SKIP.has(k)) all.push(x); } else if(Array.isArray(x)) x.forEach(v=>walk(v,k)); else if(x&&typeof x==='object') for(const kk of Object.keys(x)){ if(k==='labels'||k==='look') all.push(kk); walk(x[kk],kk); } };
    walk(T,''); const src=[]; const w2=x=>{ if(typeof x==='string') src.push(x); else if(Array.isArray(x)) x.forEach(w2); else if(x&&typeof x==='object') for(const kk of Object.keys(x)){ src.push(kk); w2(x[kk]); } }; w2(Object.assign({},A,{_meta:null}));
    const bad=all.filter(t=>!src.includes(t)); check('1 資料檔每一個字串都是稿裡完整的一句（'+all.length+' 個；沒有自己寫的字）',!bad.length&&all.length>=45,J(bad.slice(0,6)));
    /* 稿裡玩家看得到的每一句都在資料檔裡（沒有漏）*/
    const need=[A.shop.name,A.staff.who,A.staff.closed_line,A.staff.not_open,A.staff.closed_outside,A.staff.no_money].concat(A.staff.greet,ids.map(id=>A.items[id].name),ids.map(id=>A.items[id].line),Object.keys(A.looks).map(k=>A.looks[k].button),ks.map(k=>A.looks[k].t),[C.ask,C.empty,C.after_spicy,C.cancel,A.pick],C.after);
    const miss=need.filter(t=>!all.includes(t)); check('1 稿裡玩家看得到的每一句都在資料檔（'+need.length+' 句；沒有漏）',!miss.length&&need.length===45,J([need.length,miss.slice(0,6)])); }
  let ck=null; try{ ck=cp.spawnSync('python3',['tools/shops/import_tz_grocery.py','--check'],{cwd:ROOT,encoding:'utf8'}); }catch(e){}
  if(!ck||ck.error) console.log('SKIP 1 沒有 python3（匯入工具 --check）'); else if(!raw) console.log('SKIP 1 匯入工具 --check（讀不到稿）'); else check('1 匯入工具 --check：資料檔＝稿匯出來的（走 import_guard 白名單）',ck.status===0,(ck.stdout+ck.stderr).trim().slice(0,200));
  const allow=JSON.parse(rd('docs/handoff/story_import_allow.json')).files; check('1 劇情匯入白名單有 AA_823（'+SHA+'、approved、approvedBy）',allow.some(e=>e.path===DOC&&e.sha===SHA&&e.status==='approved'&&e.approvedBy==='AA（TINGZHOU-SHOPS5-1110）'));
  check('1 資料檔記了來源（sha、稿）',J(TZ_GROCERY_LINES._src[Z])===J({sha:SHA,doc:DOC})); });

// ---- 2 營業時間 ----
await sec(2,()=>{ const d0=DK('2025-10-05');
  check('2 每天 10:00～21:30（稿「10:00～21:30」；一週七天）',T.hours==='10:00～21:30'&&[0,1,2,3,4,5,6].every(i=>!PLACES.isOpen(Z,9.98,d0+i)&&PLACES.isOpen(Z,10,d0+i)&&PLACES.isOpen(Z,21.48,d0+i)&&!PLACES.isOpen(Z,21.5,d0+i)&&!PLACES.isOpen(Z,3,d0+i)));
  check('2 名字「東南大聯商行」、畫面上的時間、颱風假關、算汀州路（和旁邊幾間一樣）',PLACES.names[Z]==='東南大聯商行'&&/10:00/.test(PLACES.hours[Z].text)&&/21:30/.test(PLACES.hours[Z].text)&&PLACES.hours[Z].shop===PLACES.hours.tz_taimi.shop&&PLACES.typhoonShops.includes(Z)&&PLACES.base(Z)==='tingzhou',J(PLACES.hours[Z]));
  check('2 手機快速前往：汀州路・東南大聯商行的店門口',PLACES.TZ_SHOPS.includes('dongnan')&&!!PLACES.tzDoor('dongnan')); });

// ---- 3 關門時按店門 ----
await sec(3,async()=>{ const door=async(key,h)=>{ fresh(key,h,'tingzhou'); const r=await STORY.interact({exit:{to:Z},label:'進'+T.name},GM); return {r,said:said(),t:toasts.slice()}; };
  { const x=await door('2025-10-07',21.5); check('3 21:30 按店門：稿的 closed_outside（旁白）、不進去、寫開放時間',x.r===true&&J(x.said)===J([[null,'（鐵門拉下來了。門口的紙箱都收進去了，只剩一張手寫的營業時間。）']])&&T.sign===x.said[0][1]&&!H.entered.length&&x.t.length===1&&/東南大聯商行/.test(x.t[0])&&/21:30/.test(x.t[0]),J([x.said,x.t])); }
  { const x=await door('2025-10-07',2); check('3 半夜 02:00 按店門：同一句',x.r===true&&J(x.said)===J([[null,T.sign]])&&!H.entered.length,J(x.said)); }
  for(const h of [6,8,9.98]){ const x=await door('2025-10-07',h); check('3 '+h+' 點（開門以前）：稿的 not_open 那一句（旁白；不是打烊的那一句）、不進去、寫開放時間',x.r===true&&J(x.said)===J([[null,'（鐵門還沒拉起來。門口疊著三箱還沒拆的貨，膠帶上印著泰文。）']])&&T.notOpen===x.said[0][1]&&!H.entered.length&&x.t.length===1&&/10:00/.test(x.t[0]),J([x.said,x.t])); }
  { const x=await door('2025-10-07',5.9); check('3 05:54（清晨 6 點以前）：還是打烊以後的那一句',x.r===true&&J(x.said)===J([[null,T.sign]]),J(x.said)); }
  for(const h of [10,12,21.4]){ const x=await door('2025-10-07',h); check('3 '+h+' 點開著：不擋',!x.said.length&&!x.t.length,J(x)); }
  { const TC=PLACES.typhoonClosed; PLACES.typhoonClosed=z=>PLACES.typhoonShops.includes(z);
    try{ const x=await door('2025-10-07',12); check('3 颱風假（稿上沒有那一句）：不說話、只寫「颱風假」',x.r===true&&!x.said.length&&/颱風假/.test(x.t[0]||''),J(x)); } finally { PLACES.typhoonClosed=TC; } } });

// ---- 4 進門 ----
await sec(4,async()=>{ for(const [rv,i] of [[0,0],[0.5,1],[0.99,2]]){ const G=fresh('2025-10-07',12,Z); const due=GG3.doorDue(GM); GG3.rand=()=>rv; const r=await GG3.enterLine(GM);
    check(`4 一天第一次進來：老闆「${T.door[i][1]}」`,due&&r==='door'&&J(said())===J([[WHO,T.door[i][1]]]),J(said()));
    if(i===0){ GM.enterN++; check('4 同一天再進來：不說',!GG3.doorDue(GM)); G.day++; GM.enterN++; check('4 隔天再進來：又說',GG3.doorDue(GM)); } }
  check('4 進門三句＝稿的三句',J(T.door.map(d=>d[1]))===J(['隨便看。找不到的問我，我都知道放哪裡。','今天有新到的泡麵，在最前面那一排。','袋子要自己拿喔，掛在櫃檯旁邊。']));
  { fresh('2025-10-07',21.6,Z); check('4 關著的時候不說進門句',!GG3.doorDue(GM)); } });

// ---- 5 打烊 ----
await sec(5,async()=>{ { fresh('2025-10-07',21.6,Z); const r=await GG3.closeOut(GM);
    check('5 21:30 人還在店裡：老闆「我們今天要打烊了。」一句、走到汀州路',r==='close'&&J(said())===J([[WHO,'我們今天要打烊了。']])&&T.close==='我們今天要打烊了。'&&H.entered[0]==='tingzhou',J([r,said(),H.entered])); }
  { fresh('2025-10-07',23.5,Z); const r=await GG3.closeOut(GM); check('5 讀檔回到打烊以後：不說、走出去、寫開放時間',r==='out'&&!H.said.length&&H.entered[0]==='tingzhou'&&toasts.length===1,J([r,said(),toasts])); }
  { const G=fresh('2025-10-07',21.4,Z); const a=GG3.tick(GM); await sleep(5); H.said=[]; G.hour=21.55; const b=GG3.tick(GM); await sleep(5);
    check('5 每 0.5 秒的檢查（GG3.tick）：開著的時候是進門句，過了 21:30 請你出來',a===true&&b===true&&H.has(T.close)&&H.entered[0]==='tingzhou',J([a,b,said(),H.entered])); }
  { const G=fresh('2025-10-07',21.4,Z); await take('tz_dongnan_drink',['罐裝椰子水']); G.hour=21.6; await GG3.closeOut(GM); G.zone=Z; G.hour=12; GM.enterN++; H.said=[]; await press('tz_dongnan_counter');
    check('5 手上拿著東西被請出去：不扣錢；再進來手上沒有東西',G.money===5000&&J(said())===J([[null,X.empty]]),J([G.money,said()])); } });

// ---- 6 貨架 ----
await sec(6,async()=>{ const SH={tz_dongnan_noodle:['東南亞泡麵（一包）　35 元','泡麵（五包裝）　150 元','蝦餅　60 元'],tz_dongnan_sauce:['是拉差辣醬　95 元','魚露（小瓶）　70 元','椰奶罐頭　45 元'],tz_dongnan_drink:['罐裝椰子水　40 元','瓶裝泰式奶茶　45 元'],tz_dongnan_rice:['香米（一公斤）　110 元','乾河粉　55 元']};
  for(const kind of Object.keys(SH)){ const G=fresh('2025-10-07',12,Z); H.picks=['不用了']; const h0=G.hour, r=await press(kind);
    check('6 按「'+T.labels[kind]+'」：稿的那一句旁白 → 這個貨架的東西（名字＋價錢）＋不用了；只看不拿＝不扣錢、時間不動',r===true&&J(said())===J([[null,T.look[kind][0]]])&&J(Array.from(H.opts[0]))===J(SH[kind].concat(['不用了']))&&H.opts.length===1&&G.money===5000&&near(G.hour,h0)&&!spent.length,J([said(),Array.from(H.opts[0]||[])])); }
  { fresh('2025-10-07',12,Z); const o0=GM.choose; let seen=null; GM.choose=async o=>{ if(!seen) seen=o; return o0(o); }; try{ H.picks=['不用了']; await GG3.groceryShelf(GM,'tz_dongnan_noodle'); await GG3.groceryShelf(GM,'tz_dongnan_sauce'); await GG3.groceryShelf(GM,'tz_dongnan_drink'); await GG3.groceryShelf(GM,'tz_dongnan_rice'); } finally { GM.choose=o0; }
    check('6 每一樣的一句說明＝選項的提示（照稿）',!!seen&&J(seen.slice(0,3).map(o=>o.hint))===J(['包裝上的辣椒畫了三根。你不確定三根是多辣。','五包一袋。夠宿舍吃一個禮拜的宵夜。','一大包，打開就停不下來的那種。'])&&!seen[3].hint,J(seen&&seen.map(o=>o.hint))); }
  { fresh('2025-10-07',12,Z); const o0=GM.choose, hints=[]; GM.choose=async o=>{ for(const q of o) if(q.hint&&q.t!=='不用了'&&q.t!=='買') hints.push([q.t,q.hint]); return o0(o); };
    try{ for(const kind of Object.keys(SH)){ H.picks=['不用了']; await GG3.groceryShelf(GM,kind); } } finally { GM.choose=o0; }
    check('6 十樣東西的說明都看得到、各自對到自己那一樣',hints.length===10&&X.goods.every(g=>hints.some(h=>h[0]===g.n+'　'+g.p+' 元'&&h[1]===g.line)),J(hints.length)); }
  { const G=fresh('2025-10-07',12,Z); await take('tz_dongnan_noodle',['蝦餅']);
    check('6 拿了蝦餅：稿的 pick 那一句旁白「（你拿了一份，先拿在手上。）」（看的那一句後面、一次）',J(said())===J([[null,T.look.tz_dongnan_noodle[0]],[null,'（你拿了一份，先拿在手上。）']])&&X.pick===said()[1][1],J(said()));
    check('6 拿了蝦餅：還沒扣錢（到櫃檯才結帳）；拿過的不再列；「不用了」的提示寫手上有什麼',G.money===5000&&!spent.length&&J(Array.from(H.opts[1]))===J(['東南亞泡麵（一包）　35 元','泡麵（五包裝）　150 元','不用了'])&&J(GG3.hand(GM))===J(['tz_dn_snack']),J([Array.from(H.opts[1]||[]),GG3.hand(GM)]));
    H.said=[]; H.opts=[]; await take('tz_dongnan_noodle',['東南亞泡麵（一包）','泡麵（五包裝）']);
    check('6 一次拿兩樣：pick 那一句說兩次（每拿一樣一次）',J(said())===J([[null,T.look.tz_dongnan_noodle[0]],[null,X.pick],[null,X.pick]]),J(said()));
    check('6 同一個貨架三樣都拿了：不再問（只有那一句旁白）',H.opts.length===2&&J(GG3.hand(GM))===J(['tz_dn_snack','tz_dn_noodle','tz_dn_noodle5']),J([H.opts.map(o=>Array.from(o)),GG3.hand(GM)]));
    H.said=[]; H.opts=[]; H.picks=[]; await press('tz_dongnan_noodle'); check('6 都拿了以後再按那個貨架：只有「看」那一句、沒有選單',J(said())===J([[null,T.look.tz_dongnan_noodle[0]]])&&!H.opts.length,J([said(),H.opts.length])); } });

// ---- 7 結帳 ----
await sec(7,async()=>{ { const G=fresh('2025-10-07',12,Z); const h0=G.hour, r=await press('tz_dongnan_counter');
    check('7 手上沒有東西按「結帳」：稿的那一句旁白、沒有選單、不扣錢、時間不動',r===true&&J(said())===J([[null,'（你手上沒有東西。老闆看了你一眼，繼續理貨。）']])&&X.empty===said()[0][1]&&!H.opts.length&&G.money===5000&&near(G.hour,h0),J(said())); }
  { const G=fresh('2025-10-07',12,Z); await take('tz_dongnan_drink',['罐裝椰子水']); await take('tz_dongnan_rice',['乾河粉']); H.said=[]; H.opts=[]; H.picks=['買']; const h0=G.hour; const o0=GM.choose; let seen=null; GM.choose=async o=>{ seen=o; return o0(o); }; let r; try{ r=await GG3.groceryPay(GM); } finally { GM.choose=o0; }
    check('7 椰子水＋乾河粉去結帳：老闆「就這些嗎？」→「買」（提示：兩樣、共 95 元）／「不用了」',J(said()[0])===J([WHO,'就這些嗎？'])&&J(Array.from(H.opts[0]))===J(['買','不用了'])&&seen[0].hint==='罐裝椰子水、乾河粉　共 95 元'&&!seen[0].dim,J([said(),seen]));
    check('7 買：扣 40＋55＝95（記在東南大聯商行）、時間 +'+GG3.HRS.buy+' 小時（和其他店買東西一樣）',G.money===4905&&J(spent)===J([[-95,'東南大聯商行']])&&near(G.hour-h0,GG3.HRS.buy)&&r==='罐裝椰子水、乾河粉',J([G.money,spent,G.hour-h0,r]));
    check('7 沒有泡麵、辣醬：老闆「好，謝謝。」（after 第一句），不說辣的那一句',J(said())===J([[WHO,'就這些嗎？'],[WHO,'好，謝謝。']])&&!H.has(X.afterIf.line),J(said()));
    H.said=[]; H.opts=[]; await press('tz_dongnan_counter'); check('7 結完帳手上空了：再按「結帳」＝手上沒有東西那一句',J(said())===J([[null,X.empty]])&&G.money===4905,J(said())); }
  { const G=fresh('2025-10-07',12,Z); await take('tz_dongnan_sauce',['魚露（小瓶）','椰奶罐頭']); H.said=[]; H.picks=['買']; GG3.rand=()=>0.99; await GG3.groceryPay(GM);
    check('7 魚露＋椰奶罐頭（隨機到第二句）：扣 115、老闆「好。袋子在旁邊，自己拿。」',G.money===4885&&J(said())===J([[WHO,'就這些嗎？'],[WHO,'好。袋子在旁邊，自己拿。']]),J([G.money,said()])); }
  const SP='好。辣的那個第一次吃，先加一半就好。';
  for(const [shelf,names,cost] of [[{tz_dongnan_noodle:['東南亞泡麵（一包）']},'泡麵一包',35],[{tz_dongnan_noodle:['泡麵（五包裝）']},'泡麵五包裝',150],[{tz_dongnan_sauce:['是拉差辣醬']},'是拉差辣醬',95],
      [{tz_dongnan_drink:['瓶裝泰式奶茶'],tz_dongnan_rice:['香米（一公斤）'],tz_dongnan_sauce:['是拉差辣醬']},'奶茶＋香米＋辣醬（辣醬最後拿）',250],[{tz_dongnan_noodle:['東南亞泡麵（一包）','蝦餅'],tz_dongnan_drink:['罐裝椰子水']},'泡麵＋蝦餅＋椰子水',135]]){
    for(const rv of [0,0.99]){ const G=fresh('2025-10-07',12,Z); for(const k of Object.keys(shelf)) await take(k,shelf[k]); H.said=[]; H.picks=['買']; GG3.rand=()=>rv; await GG3.groceryPay(GM);
      check('7 買了'+names+'（隨機 '+rv+'）：老闆「'+SP+'」取代一般那兩句、扣 '+cost,G.money===5000-cost&&J(said())===J([[WHO,'就這些嗎？'],[WHO,SP]])&&X.afterIf.line===SP&&!X.after.some(t=>H.has(t)),J([G.money,said()])); } }
  for(const g of X.goods.filter(g=>!X.afterIf.ids.includes(g.id))){ const G=fresh('2025-10-07',12,Z); await take(g.at,[g.n]); H.said=[]; H.picks=['買']; await GG3.groceryPay(GM);
    check('7 只買'+g.n+'：扣 '+g.p+'、不說辣的那一句',G.money===5000-g.p&&!H.has(SP)&&H.has(X.after[0]),J([G.money,said()])); }
  { const G=fresh('2025-10-07',12,Z); for(const k of ['tz_dongnan_noodle','tz_dongnan_sauce','tz_dongnan_drink','tz_dongnan_rice']) await take(k,X.goods.filter(g=>g.at===k).map(g=>g.n)); H.said=[]; H.picks=['買']; await GG3.groceryPay(GM);
    check('7 十樣都買：扣 705（35＋150＋60＋95＋70＋45＋40＋45＋110＋55）',G.money===5000-705&&X.goods.reduce((a,g)=>a+g.p,0)===705&&H.has(SP),J([G.money,said()])); }
  { const G=fresh('2025-10-07',12,Z); const keys0=Object.keys(G).sort().join(), f0=Object.keys(G.flags).sort().join(); await take('tz_dongnan_rice',['香米（一公斤）']); H.picks=['買']; await GG3.groceryPay(GM);
    check('7 買的東西：存檔只多 G.flags.GG3_OWN（G 最上層的欄位和買以前一樣；flags 只多這一個）',G.money===4890&&Object.keys(G).sort().join()===keys0&&Object.keys(G.flags).filter(k=>k!=='GG3_OWN').sort().join()===f0&&J(G.flags.GG3_OWN)===J({tz_dongnan:{tz_dn_rice:1}}),J([Object.keys(G).sort().join()===keys0,Object.keys(G.flags),G.flags.GG3_OWN])); } });

// ---- 8 錢不夠、不用了 ----
await sec(8,async()=>{ { const G=fresh('2025-10-07',12,Z); G.money=100; await take('tz_dongnan_rice',['香米（一公斤）']); H.said=[]; H.opts=[]; H.picks=['買']; const h0=G.hour; const o0=GM.choose; let seen=null; GM.choose=async o=>{ seen=o; return o0(o); }; let r; try{ r=await GG3.groceryPay(GM); } finally { GM.choose=o0; } const s=said();
    check('8 錢不夠（100 元買 110）：稿的那一句旁白、不扣錢、時間不動、沒有買完那一句',r==='short'&&G.money===100&&J(s)===J([[WHO,'就這些嗎？'],[null,'（你把東西放回架上。老闆說沒關係，下次再來。）']])&&X.short===s[1][1]&&near(G.hour,h0)&&!spent.length&&!toasts.length&&seen[0].dim===true,J([r,G.money,s,toasts]));
    H.said=[]; await press('tz_dongnan_counter'); check('8 錢不夠以後東西放回架上了：再按「結帳」＝手上沒有東西',J(said())===J([[null,X.empty]]),J(said()));
    H.said=[]; H.opts=[]; H.picks=['不用了']; await press('tz_dongnan_rice'); check('8 放回去的東西貨架上又拿得到',Array.from(H.opts[0]).includes('香米（一公斤）　110 元'),J(Array.from(H.opts[0]||[]))); }
  { const G=fresh('2025-10-07',12,Z); G.money=110; await take('tz_dongnan_rice',['香米（一公斤）']); H.picks=['買']; const r=await GG3.groceryPay(GM); check('8 剛好 110 元：買得起',r==='香米（一公斤）'&&G.money===0,J([r,G.money])); }
  { const G=fresh('2025-10-07',12,Z); await take('tz_dongnan_noodle',['東南亞泡麵（一包）']); H.said=[]; H.picks=['不用了']; const h0=G.hour, r=await GG3.groceryPay(GM);
    check('8「就這些嗎？」選「不用了」：稿的 cancel 那一句旁白「（你把東西一樣一樣放回架上。）」；不扣錢、時間不動、老闆不說買完那一句、沒有進「物品」',r===null&&G.money===5000&&!spent.length&&near(G.hour,h0)&&J(said())===J([[WHO,'就這些嗎？'],[null,'（你把東西一樣一樣放回架上。）']])&&X.cancel===said()[1][1]&&!('GG3_OWN' in G.flags)&&GG3.ownHTML(G)==='',J([r,said(),G.flags.GG3_OWN]));
    H.said=[]; await press('tz_dongnan_counter'); check('8「不用了」＝東西放回去：再按「結帳」＝手上沒有東西',J(said())===J([[null,X.empty]]),J(said())); } });

// ---- 9 配置的點、手上的東西不進存檔 ----
await sec(9,async()=>{ const miss=LY.points.filter(p=>!GG3.handles(Z,p.kind)).map(p=>p.kind);
  check('9 配置的五個點全部接上（counter／noodle／sauce／drink／rice）、沒有座位',!miss.length&&J(LY.points.map(p=>p.kind))===J(['tz_dongnan_counter','tz_dongnan_noodle','tz_dongnan_sauce','tz_dongnan_drink','tz_dongnan_rice'])&&LY.seats.length===0,J(miss));
  check('9 配置的店員位置（2.5, 3.3）',LY.clerk.x===2.5&&LY.clerk.z===3.3);
  check('9 稿的每一個貨架、結帳都對得到配置的點',Object.keys(T.labels).every(k=>LY.points.some(p=>p.kind===k))&&X.goods.every(g=>LY.points.some(p=>p.kind===g.at)));
  { const G=fresh('2025-10-07',12,Z); await take('tz_dongnan_drink',['瓶裝泰式奶茶']); const snap=JSON.stringify(G); check('9 手上的東西不在存檔裡（G 裡沒有 tz_dn_tea、泰式奶茶）',!/tz_dn_tea|泰式奶茶/.test(snap));
    GM.enterN++; H.said=[]; await press('tz_dongnan_counter'); check('9 走出去再進來（另一趟）：手上沒有東西、沒扣錢',J(said())===J([[null,X.empty]])&&G.money===5000,J(said())); }
  { const G=fresh('2025-10-07',12,Z); await take('tz_dongnan_drink',['瓶裝泰式奶茶']); const L=globalThis.LOADLOCKS||{}; for(const k of Object.keys(L)) if(/^gg3shops3d:/.test(k)) L[k](); H.said=[]; await press('tz_dongnan_counter');
    check('9 讀檔（LOADLOCKS）：手上的東西清掉',typeof L['gg3shops3d:hand']==='function'&&J(said())===J([[null,X.empty]]),J(said())); } });

// ---- 10 原本的店照舊、載入 ----
await sec(10,async()=>{ const TM=GG3_LINES.tz_taimi;
  check('10 原本六間＋越好吃小館都還在（東南大聯商行排在後面；它後面是 11-12 加的汀州聯通，tests/tz_liantong_aa824_1112_unit.js）',J(GG3.ZONES.slice(0,8))===J(['gg_antai','gg_xianguo','gg_rongendian','tz_taimi','tz_xile','tz_yindehao','tz_yuehaochi',Z])&&J(GG3.MEALS)===J(['tz_yuehaochi'])&&GG3.GROCERS[0]===Z&&GG3.ACT.tz_taimi_order===GG3.taimiOrder&&GG3.ACT.tz_yue_order===GG3.mealOrder&&GG3.ACT.tz_dongnan_counter===GG3.groceryPay,J(GG3.ZONES));
  { const G=fresh('2025-10-07',18,'tz_taimi'); H.picks=['泰式椒麻雞飯','點好了']; GM.sitAt=(P,s)=>{ P.seat=s; }; GM.standUp=P=>{ P.seat=null; }; await GG3.taimiOrder(GM); check('10 泰米村食點餐照舊（椒麻雞 130）',G.money===4870,String(G.money)); }
  { const G=fresh('2025-10-07',12,'tz_yuehaochi'); H.picks=['牛肉河粉','點好了']; await GG3.mealOrder(GM); check('10 越好吃小館點餐照舊（牛肉河粉 130）',G.money===4870,String(G.money)); }
  { fresh('2025-10-07',12,'tz_yuehaochi'); await STORY.interact({tzPoint:'menu',kind:'tz_yue_menu',label:'x',look:'x'},GM); check('10 越好吃小館的「看菜單」照舊',J(said())===J([[null,TZ_MEAL_LINES.tz_yuehaochi.look.tz_yue_menu[0]]]),J(said())); }
  check('10 泰米村食資料沒被動到',!!TM&&TM.name==='泰米村食'&&!TM.grocery);
  const html=rd('index.html'), at=f=>html.indexOf('src="'+f+'?v=');
  check('10 index.html 載入資料檔（在小館的資料檔後面、GG3 前面；版本號照旁邊的寫法）',at(DATA)>at(MEAL)&&at(MEAL)>0&&at(DATA)<at('src/gg3shops3d.js')&&(html.match(/src="src\/data\/tz_grocery_lines\.js\?v=([\d.]+)"/)||[])[1]===(html.match(/src="src\/gg3shops3d\.js\?v=([\d.]+)"/)||[])[1]);
  const bad=[]; for(const f of ['src/gg3shops3d.js',DATA,'src/data/places.js']){ const r=cp.spawnSync(process.execPath,['--check',path.join(ROOT,f)],{encoding:'utf8'}); if(r.status!==0) bad.push(f+' '+r.stderr.slice(0,160)); }
  check('10 node --check',!bad.length,J(bad)); });

// ---- 12 AA 11-12 回七問：pick、cancel、兩句說明、買的東西進「物品」 ----
await sec(12,async()=>{ let A=null; try{ A=JSON.parse(cp.execFileSync('git',['show',SHA+':'+DOC],{cwd:ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']})); }catch(e){}
  if(!A) console.log('SKIP 12 讀不到稿 '+SHA+'（逐字對稿的三項）');
  else { check('12 拿起一樣那一句（稿最上層 pick，旁白、沒有品名的空格）照稿',X.pick===A.pick&&/^（.*）$/.test(X.pick)&&!/[{}<>％%]|○○|XX/.test(A.pick),J(X.pick));
    check('12 結帳「不用了」那一句（looks.tz_dongnan_counter.cancel，旁白）照稿',X.cancel===A.looks.tz_dongnan_counter.cancel&&/^（.*）$/.test(X.cancel)&&X.cancel!==X.short,J(X.cancel));
    check('12 椰子水、泰式奶茶的說明照新稿（買之前看得出來的）',good('tz_dn_drink').line===A.items.tz_dn_drink.line&&good('tz_dn_tea').line===A.items.tz_dn_tea.line&&good('tz_dn_drink').line==='冰的，細細長長的一罐。'&&good('tz_dn_tea').line==='橘色的。光看顏色就知道很甜。',J([good('tz_dn_drink').line,good('tz_dn_tea').line])); }
  check('12 GG3 有 own／ownAdd／ownHTML',typeof GG3.own==='function'&&typeof GG3.ownAdd==='function'&&typeof GG3.ownHTML==='function');
  if(typeof GG3.own!=='function') return;
  const buy=async(G,shelf)=>{ for(const k of Object.keys(shelf)) await take(k,shelf[k]); H.picks=['買']; return GG3.groceryPay(GM); };
  { const G=fresh('2025-10-07',12,Z); check('12 還沒買：沒有 GG3_OWN、「物品」沒有多東西',!('GG3_OWN' in G.flags)&&J(GG3.own(G))==='[]'&&GG3.ownHTML(G)==='');
    await take('tz_dongnan_drink',['罐裝椰子水']); check('12 只是拿在手上（還沒結帳）：不進「物品」',!('GG3_OWN' in G.flags)&&GG3.ownHTML(G)==='');
    H.picks=['買']; await GG3.groceryPay(GM); await buy(G,{tz_dongnan_noodle:['蝦餅']});
    check('12 買了椰子水、再買蝦餅：G.flags.GG3_OWN＝{tz_dongnan:{tz_dn_drink:1,tz_dn_snack:1}}',J(G.flags.GG3_OWN)===J({tz_dongnan:{tz_dn_drink:1,tz_dn_snack:1}}),J(G.flags.GG3_OWN));
    check('12 GG3.own：店名、東西的名字照稿，順序照稿（蝦餅在椰子水前面）',J(GG3.own(G))===J([{zone:Z,shop:'東南大聯商行',items:[{id:'tz_dn_snack',n:'蝦餅',count:1},{id:'tz_dn_drink',n:'罐裝椰子水',count:1}]}]),J(GG3.own(G)));
    check('12 選單「物品」那一格：店名＋一行一樣',GG3.ownHTML(G)==='<div class="item"><b>東南大聯商行</b><div>· 蝦餅</div><div>· 罐裝椰子水</div></div>',GG3.ownHTML(G));
    GM.enterN++; await buy(G,{tz_dongnan_noodle:['蝦餅']}); check('12 另一趟再買一份蝦餅：兩份（×2）',G.flags.GG3_OWN[Z].tz_dn_snack===2&&/· 蝦餅 ×2</.test(GG3.ownHTML(G))&&/· 罐裝椰子水</.test(GG3.ownHTML(G)),GG3.ownHTML(G));
    const txt=GG3.ownHTML(G).replace(/<[^>]+>/g,'|').split('|').map(s=>s.replace(/^· /,'').replace(/ ×\d+$/,'')).filter(Boolean), names=[T.name].concat(X.goods.map(g=>g.n));
    check('12「物品」那一格的字都是稿的（店名、東西的名字；沒有自己寫的字）',txt.length===3&&txt.every(s=>names.includes(s)),J(txt));
    const G2=JSON.parse(JSON.stringify(G)); check('12 存檔（JSON）再讀回來：東西還在',GG3.ownHTML(G2)===GG3.ownHTML(G)&&G2.flags.GG3_OWN[Z].tz_dn_snack===2); }
  { const G=fresh('2025-10-07',12,Z); G.money=30; await take('tz_dongnan_noodle',['東南亞泡麵（一包）']); H.picks=['買']; await GG3.groceryPay(GM); check('12 錢不夠：沒有進「物品」',!('GG3_OWN' in G.flags)); }
  { const G=fresh('2025-10-07',12,Z); await buy(G,{tz_dongnan_noodle:X.goods.filter(g=>g.at==='tz_dongnan_noodle').map(g=>g.n),tz_dongnan_sauce:X.goods.filter(g=>g.at==='tz_dongnan_sauce').map(g=>g.n),tz_dongnan_drink:X.goods.filter(g=>g.at==='tz_dongnan_drink').map(g=>g.n),tz_dongnan_rice:X.goods.filter(g=>g.at==='tz_dongnan_rice').map(g=>g.n)});
    check('12 十樣都買：十樣都在「物品」、順序照稿',J(GG3.own(G)[0].items.map(i=>i.n))===J(X.goods.map(g=>g.n))&&GG3.own(G)[0].items.every(i=>i.count===1),J(GG3.own(G))); }
  /* 舊存檔：沒有 GG3_OWN；連 flags 都沒有；資料壞掉 */
  { const G=fresh('2025-10-07',12,Z); delete G.flags.GG3_OWN; const s0=J(G); const h=GG3.ownHTML(G), o=GG3.own(G);
    check('12 舊存檔（沒有 GG3_OWN）：「物品」不多東西、不丟例外、讀的時候不寫存檔',h===''&&J(o)==='[]'&&J(G)===s0);
    const r=await buy(G,{tz_dongnan_rice:['乾河粉']}); check('12 舊存檔照常買：買完才有 GG3_OWN',r==='乾河粉'&&G.money===4945&&J(G.flags.GG3_OWN)===J({tz_dongnan:{tz_dn_vermicelli:1}}),J([r,G.flags.GG3_OWN])); }
  { let ok=true, why=''; for(const bad of [null,undefined,0,'x',[],[1],{tz_dongnan:null},{tz_dongnan:[]},{tz_dongnan:'x'},{tz_dongnan:{tz_dn_snack:'abc',tz_dn_tea:-2,nope:3}},{nope:{tz_dn_snack:1}}]){ try{ if(GG3.ownHTML({flags:{GG3_OWN:bad}})!==''){ ok=false; why=J(bad); } }catch(e){ ok=false; why=J(bad)+' '+e; } }
    try{ if(GG3.ownHTML({})!==''||GG3.ownHTML(null)!=='') ok=false; }catch(e){ ok=false; why='沒有 flags '+e; }
    check('12 GG3_OWN 壞掉（不是物件、份數不是正的數、稿裡沒有的 id、不認得的店）、沒有 flags：不列、不丟例外',ok,why); }
  { const G=fresh('2025-10-07',12,Z); G.flags.GG3_OWN='x'; await buy(G,{tz_dongnan_rice:['乾河粉']}); check('12 GG3_OWN 壞掉以後再買：重新記',J(G.flags.GG3_OWN)===J({tz_dongnan:{tz_dn_vermicelli:1}}),J(G.flags.GG3_OWN)); }
  { const G={flags:{GG3_OWN:{tz_dongnan:{tz_dn_snack:1}}}}; const n0=X.goods.find(g=>g.id==='tz_dn_snack').n; X.goods.find(g=>g.id==='tz_dn_snack').n='<b>&"x'; let h; try{ h=GG3.ownHTML(G); } finally { X.goods.find(g=>g.id==='tz_dn_snack').n=n0; }
    check('12「物品」的字有跳脫（不會被當成 HTML）',/&lt;b&gt;&amp;&quot;x/.test(h)&&!/<b>&"x/.test(h),h); }
  /* game3d.js 的選單：「物品」分頁先畫禮物（GIFTH）、後面接這一格 */
  { const src=rd('src/game3d.js'), m=/if\(\$\('itemsList'\)\)\{[^\n]*?GIFTH\.renderBag\(\$\('itemsList'\),G\);[^\n]*?GG3\.ownHTML\(G\)[^\n]*?\}/.exec(src);
    check('12 game3d.js 打開選單：「物品」分頁先畫禮物（GIFTH.renderBag）、後面接 GG3.ownHTML',!!m&&m[0].indexOf('GIFTH.renderBag')<m[0].indexOf('GG3.ownHTML')&&/insertAdjacentHTML\('beforeend'/.test(m[0]),m?m[0].slice(0,200):'找不到');
    if(m){ const el={innerHTML:'舊的',insertAdjacentHTML(pos,h){ this.pos=pos; this.innerHTML+=h; }}; const G={flags:{GG3_OWN:{tz_dongnan:{tz_dn_tea:2}}}};
      new Function('$','G','GIFTH','GG3',m[0])(()=>el,G,{renderBag(e,g){ e.innerHTML='[禮物]'; }},GG3); const a=el.innerHTML; el.innerHTML='舊的'; new Function('$','G','GG3',m[0])(()=>el,G,GG3);
      check('12 那一段真的跑：禮物後面接「東南大聯商行／瓶裝泰式奶茶 ×2」；沒有 GIFTH 也不會留舊的字',a==='[禮物]<div class="item"><b>東南大聯商行</b><div>· 瓶裝泰式奶茶 ×2</div></div>'&&el.innerHTML==='<div class="item"><b>東南大聯商行</b><div>· 瓶裝泰式奶茶 ×2</div></div>',J([a,el.innerHTML])); } }
  check('12 index.html 有「物品」分頁（itemsList）',/id="tab-items"><div class="list" id="itemsList">/.test(rd('index.html'))); });

// ---- 11 子程序 A：遊戲真正的區域 ----
await sec(11,()=>{ const r=cp.spawnSync(process.execPath,[__filename,'A'],{cwd:ROOT,encoding:'utf8',maxBuffer:1<<26});
  const out=String(r.stdout||'').split('\n').filter(l=>/^(PASS|FAIL) /.test(l)); for(const l of out) console.log('  A '+l);
  check('11 子程序 A（建出東南大聯商行的區域）全部通過（'+out.length+' 項）',r.status===0&&out.length>=7&&!out.some(l=>/^FAIL /.test(l)),String(r.stderr||'').split('\n').slice(0,4).join(' / ')); });
H.done(); })();
}
