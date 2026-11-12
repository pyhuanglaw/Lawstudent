// 汀州路・客居雲南（tz_keju）的店內文字（SHOP-LIFE-AA826-1112；AA_825，企劃線 90fb5fa77）——不需要瀏覽器（D131）。做法照 tests/tz_yuehaochi_aa821_1112_unit.js。
//   1  資料檔 src/data/tz_meal_lines.js 逐字對稿（店名、老闆娘的句子、六樣菜的名字／價錢／吃的兩句、點餐、兩個「看」的按鈕和句子、坐下）；匯入工具 --check；白名單
//      稿的 looks 對配置的點：menu＝tz_keju_menu、wall＝tz_keju_batik；table（看桌上）配置沒有點＝不接（那一句不在資料檔裡）
//   2  營業時間每天 11:00～21:00、中午不休息（places.js）、名字、颱風假關、算汀州路
//   3  關門時按店門：打烊以後＝稿的 closed_outside＋開放時間、不進去；開門以前（06～11）＝稿的 not_open＋開放時間；開著不擋
//   4  進門：一天第一次老闆娘一句（三句）、同一天再進來不說
//   5  打烊：人還在店裡＝老闆娘「我們今天要打烊了。」、走到汀州路；14:00 不請人出去（不午休）
//   6  點餐：「想吃什麼？」→ 六樣（稿的名字、價錢）→ 扣錢、點完一句、吃的兩句、吃 30 分鐘、坐下那一句、吃過的登記
//      點好幾樣只演一樣的「吃」（稿的順序由上到下，不管先點哪一樣）；有點過橋米線＝order.after_guoqiao；沒點＝after 兩句隨機
//   7  錢不夠＝稿的那一句旁白、不扣錢、時間不動；「不用了」＝不扣錢
//   8  「看」：稿有句子的兩個點按了就是稿的那一句、按鈕的字照稿；茶餅櫃、廚房稿沒有句子＝GG3 不接（照 tz_shops3d.js 原本的）；坐下（每一桌）＝稿的那一句
//   9  越好吃小館、泰米村食照舊；node --check
//   10 （子程序 A：建出遊戲真正的區域）點餐和兩個「看」在配置的位置、按鈕的字照稿、16 個座位補成 zone.seats、老闆娘站在配置的位置（開店才有）
// 修改前（a5a4cdfa67）：資料檔沒有 tz_keju、GG3 不認得、沒有營業時間、「點餐」按下去只有暫時的「（客居雲南）」——第 0 節就 FAIL。
// 用法：node tests/tz_keju_aa825_1112_unit.js
const Z='tz_keju', SHA='90fb5fa77', DOC='docs/story_planning/AA_825_tz_keju.json', DATA='src/data/tz_meal_lines.js';
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
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/calendar.js','src/data/places.js','src/data/tingzhou_layout.js','src/tingzhou3d.js','src/data/tz_shops_layout.js','src/tz_shops3d.js','src/data/gg3_shops_lines.js',DATA,'src/gg3shops3d.js'];
for(const f of files){ if(!fs.existsSync(path.join(ROOT,f))){ check('10 載得到 '+f,false); continue; } let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|TZ3|TZS3|TINGZHOU_LAYOUT|TZ_SHOPS_LAYOUT|LINZE_LAYOUT|CLASSROOM_LAYOUT|PROPS|CHAR|CALENDAR|PLACES|GG3_LINES|TZ_MEAL_LINES|GG3)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
if(typeof ASSETS!=='undefined') ASSETS.loadOne=()=>new Promise(()=>{});
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
const loadZone=id=>{ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.nav=z.nav; return z; };
const T=typeof TZ_MEAL_LINES!=='undefined'?TZ_MEAL_LINES[Z]:null;
check('10 GG3 認得 tz_keju、包上區域的 build',!!T&&GG3.ZONES.includes(Z)&&GG3.LAYID[Z]==='keju'&&!!Z3.ZONES[Z]&&!!Z3.ZONES[Z]._gg3);
if(T&&Z3.ZONES[Z]){ const L=TZ_SHOPS_LAYOUT.keju, z=loadZone(Z), IT=E.interactables, bad=[], by=id=>IT.find(i=>i.tzPoint===id);
  for(const p of L.points){ const it=by(p.id); if(!it){ bad.push(p.id+' 沒有'); continue; } if(Math.abs(it.x-p.x)>1e-6||Math.abs(it.z-p.z)>1e-6) bad.push(p.kind+' 位置不對');
    if(T.labels[p.kind]){ if(it.gg3!==Z) bad.push(p.kind+' 沒接上'); if(it.label!==T.labels[p.kind]) bad.push(p.kind+' 按鈕「'+it.label+'」≠稿「'+T.labels[p.kind]+'」'); }
    else { if(it.gg3) bad.push(p.kind+' 稿沒有句子卻接上了'); if(it.label!==p.label) bad.push(p.kind+' 按鈕被改了'); } }
  check('10 配置的五個點都在配置的位置；稿有句子的三個（點餐、看菜單、看牆上）接上、按鈕的字照稿；另外兩個（茶餅櫃、廚房）照配置',!bad.length&&L.points.length===5,J(bad));
  check('10 按鈕的字：點餐、看菜單、看茶餅櫃、看廚房、看牆上',J(L.points.map(p=>by(p.id).label))===J(['點餐','看菜單','看茶餅櫃','看廚房','看牆上']),J(L.points.map(p=>by(p.id).label)));
  check('10 16 個座位補成 zone.seats（桌子 keju_t1～t5）',Array.isArray(z.seats)&&z.seats.length===16&&z.seats.every(s=>/^keju_t[1-5]$/.test(s.table)&&IT.some(i=>i.seat===s)),J(z.seats&&z.seats.length));
  check('10 離開的門還在（回汀州路）',IT.some(i=>i.exit&&i.exit.to==='tingzhou'));
  const C0=global.CHAR, S0=global.STORY, A0=E.addNPC, got=[]; global.CHAR={build:()=>new THREE.Group()}; global.STORY={extraSpec:i=>({i})}; E.addNPC=o=>{ got.push(o); return o; };
  try{ const GMo={E,G:{day:DK('2025-10-07'),hour:14.5,flags:{}}}; const n1=GG3.placeClerk(Z,GMo); GMo.G.hour=22; const n2=GG3.placeClerk(Z,GMo);
    check('10 老闆娘站在配置的位置（14:30 也在＝不午休；打烊沒有；女性的路人模型）',!!n1&&!n2&&got.length===1&&Math.abs(n1.obj.position.x-L.clerk.x)<1e-6&&Math.abs(n1.obj.position.z-L.clerk.z)<1e-6&&n1.frozen&&n1.clerk&&GG3.CLERK_I[Z]%2===0,J(got.map(o=>[o.obj.position.x,o.obj.position.z]))); }
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
for(const f of ['src/data/tingzhou_layout.js','src/data/tz_shops_layout.js','src/data/eat_lines.js','src/eat3d.js','src/data/gg3_shops_lines.js',DATA,'src/gg3shops3d.js']){
  if(!fs.existsSync(path.join(ROOT,f))){ loadErr.push(f+'（沒有這個檔）'); continue; }
  try{ let s=rd(f); s=s.replace(/^const (\w+)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); }catch(e){ loadErr.push(f+'：'+String(e).slice(0,200)); } }
const ok0=!loadErr.length&&typeof GG3!=='undefined'&&typeof TZ_MEAL_LINES!=='undefined'&&!!TZ_MEAL_LINES[Z]&&GG3.ZONES.includes(Z);
check('0 載得到（配置、EAT、資料檔、GG3），資料檔有 tz_keju、GG3 認得',ok0,loadErr.join(' | '));
if(!ok0){ H.done(); }
const T=TZ_MEAL_LINES[Z], M=T.meal, LY=TZ_SHOPS_LAYOUT.keju;
GM.money=d=>{ H.G.money=(H.G.money|0)+d; };
const toasts=[]; GM.toast=t=>toasts.push(t); GM.enterN=1;
GM.sitAt=(P,s)=>{ P.seat=s; }; GM.standUp=P=>{ P.seat=null; };
const fresh=(key,h,zone,fl)=>{ const G=H.fresh(key,h,zone,fl); G.money=5000; toasts.length=0; E.interactables=[]; E.player.seat=null; GG3.rand=()=>0; return G; };
const said=()=>H.said.map(s=>[s.who,s.t]);
const near=(a,b)=>Math.abs(a-b)<1e-6;
const DK=k=>PG.DK(k);
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+' 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); } };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const seatsOf=Ly=>(Ly.seats||[]).map(q=>({x:q.x,z:q.z,radius:0.7,label:q.label||'坐下',tzSeat:q.id,seat:{x:q.x,z:q.z,yaw:q.yaw,table:Ly.id+'_t'+q.table}}));
const item=id=>M.menu.find(q=>q.id===id);
const GQ='tz_kj_guoqiao';

(async()=>{
// ---- 1 逐字對稿 ----
await sec(1,()=>{ let raw=null; try{ raw=cp.execFileSync('git',['show',SHA+':'+DOC],{cwd:ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']}); }catch(e){}
  if(!raw){ console.log('SKIP 1 讀不到企劃線 '+SHA+'（淺層複本：git fetch origin claude/magical-albattani-bk7b4n）'); }
  else { const A=JSON.parse(raw);
    check('1 店名「客居雲南」、說話的人「老闆娘」、營業時間照稿',T.name===A.shop.name&&T.name==='客居雲南'&&T.who===A.staff.who&&T.who==='老闆娘'&&T.hours===A.shop.hours,J([T.name,T.who,T.hours]));
    check('1 老闆娘進門三句、打烊、打烊以後門口、錢不夠照稿',J(T.door)===J(A.staff.greet.map(t=>[A.staff.who,t]))&&T.door.length===3&&T.close===A.staff.closed_line&&T.sign===A.staff.closed_outside&&M.short===A.staff.no_money,J([T.door,T.close,T.sign,M.short]));
    check('1 開門以前門口那一句（staff.not_open，旁白）照稿',typeof A.staff.not_open==='string'&&T.notOpen===A.staff.not_open&&/^（.*）$/.test(T.notOpen)&&T.notOpen!==T.sign,J(T.notOpen));
    const ids=Object.keys(A.items); check('1 六樣菜：id、名字、價錢、吃的兩句照稿（順序也照稿）',ids.length===6&&J(M.menu)===J(ids.map(id=>({id,n:A.items[id].name,p:A.items[id].price,eat:A.items[id].eat})))&&M.menu.every(q=>q.eat.length===2),J(M.menu.map(q=>[q.id,q.n,q.p])));
    check('1 價錢：過橋米線 160、紅燒牛肉米干 140、豌豆粉 70、破酥包（兩個）60、涼拌木耳 50、冰普洱茶 40',J(M.menu.map(q=>[q.n,q.p]))===J([['過橋米線',160],['紅燒牛肉米干',140],['豌豆粉',70],['破酥包（兩個）',60],['涼拌木耳',50],['冰普洱茶',40]]));
    check('1 點餐：想吃什麼、點完兩句、按鈕的字照稿；kind＝配置的 tz_keju_order（稿沒有 id）',A.order.id===undefined&&M.point==='tz_keju_order'&&LY.points.some(p=>p.kind===M.point)&&M.ask===A.order.ask&&J(M.after)===J(A.order.after)&&M.after.length===2&&T.labels[M.point]===A.order.button,J([M.ask,M.after]));
    check('1 有點過橋米線那一句（order.after_guoqiao）照稿、對到過橋米線；沒有「只點某一樣」「沒點某一樣」的句子',typeof A.order.after_guoqiao==='string'&&J(M.afterHas)===J({ids:[GQ],line:A.order.after_guoqiao})&&M.afterOnly===null&&M.afterNo===null,J([M.afterHas,M.afterOnly,M.afterNo]));
    check('1 只演一樣的順序＝稿的 items 由上到下（稿 _meta：「順序照 items 由上到下」；六樣各在一組）',A._meta.rules.some(t=>/順序照 items 由上到下/.test(t))&&J(M.eatFirst)===J(ids.map(id=>[id])),J(M.eatFirst));
    check('1 兩個「看」（菜單、牆上）：句子、按鈕的字照稿，對到配置的點',J(T.look)===J({tz_keju_menu:[A.looks.menu.t],tz_keju_batik:[A.looks.wall.t]})&&T.labels.tz_keju_menu===A.looks.menu.button&&T.labels.tz_keju_batik===A.looks.wall.button&&Object.keys(T.labels).length===3&&Object.keys(T.look).every(k=>LY.points.some(p=>p.kind===k)),J([T.look,T.labels]));
    check('1 稿的「看桌上」（looks.table）配置沒有點＝不接：那一句、那個按鈕的字不在資料檔裡',J(Object.keys(A.looks))===J(['menu','wall','table'])&&!J(T).includes(A.looks.table.t)&&!J(T).includes(A.looks.table.button)&&!LY.points.some(p=>/table/.test(p.kind)));
    check('1 坐下那一句照稿',J(T.seat)===J({sit:A.seat.sit}));
    /* 資料檔裡每一個字串都原封不動在稿裡（程式用的 id、配置的 id／kind 除外）*/
    const SKIP=new Set(['layout','id','point']), all=[]; const walk=(x,k)=>{ if(typeof x==='string'){ if(!SKIP.has(k)) all.push(x); } else if(Array.isArray(x)) x.forEach(v=>walk(v,k)); else if(x&&typeof x==='object') for(const kk of Object.keys(x)){ if(k==='labels'||k==='look') continue; walk(x[kk],kk); } };
    walk(T,''); for(const k of Object.keys(T.labels)) all.push(T.labels[k]); for(const k of Object.keys(T.look)) for(const t of T.look[k]) all.push(t);
    const src=[]; const w2=x=>{ if(typeof x==='string') src.push(x); else if(Array.isArray(x)) x.forEach(w2); else if(x&&typeof x==='object') for(const kk of Object.keys(x)){ src.push(kk); w2(x[kk]); } }; w2(Object.assign({},A,{_meta:null}));
    const bad=all.filter(t=>!src.includes(t)); check('1 資料檔每一個字串都是稿裡完整的一句（'+all.length+' 個；沒有自己寫的字）',!bad.length&&all.length>=35,J(bad.slice(0,6))); }
  let ck=null; try{ ck=cp.spawnSync('python3',['tools/shops/import_tz_meals.py','--check'],{cwd:ROOT,encoding:'utf8'}); }catch(e){}
  if(!ck||ck.error) console.log('SKIP 1 沒有 python3（匯入工具 --check）'); else if(!raw) console.log('SKIP 1 匯入工具 --check（讀不到企劃線）'); else check('1 匯入工具 --check：資料檔＝稿匯出來的（走 import_guard 白名單）；印出不接的那一句',ck.status===0&&/不接：tz_keju looks\.table/.test(ck.stdout),(ck.stdout+ck.stderr).trim().slice(0,200));
  const allow=JSON.parse(rd('docs/handoff/story_import_allow.json')).files; check('1 劇情匯入白名單有 AA_825（'+SHA+'、approved）',allow.filter(e=>e.path===DOC).length===1&&allow.some(e=>e.path===DOC&&e.sha===SHA&&e.status==='approved'&&!!e.approvedBy));
  check('1 資料檔記了來源（sha、稿）',J(TZ_MEAL_LINES._src[Z])===J({sha:SHA,doc:DOC})); });

// ---- 2 營業時間 ----
await sec(2,()=>{ const d0=DK('2025-10-05');
  check('2 每天 11:00～21:00（稿「11:00～21:00」；一週七天；14:00～17:00 也開＝不午休）',T.hours==='11:00～21:00'&&[0,1,2,3,4,5,6].every(i=>!PLACES.isOpen(Z,10.98,d0+i)&&PLACES.isOpen(Z,11,d0+i)&&PLACES.isOpen(Z,14.5,d0+i)&&PLACES.isOpen(Z,16.5,d0+i)&&PLACES.isOpen(Z,20.98,d0+i)&&!PLACES.isOpen(Z,21,d0+i)&&!PLACES.isOpen(Z,3,d0+i))&&PLACES.windowsOf(Z,d0).length===1);
  check('2 名字「客居雲南」、畫面上的時間、颱風假關、算汀州路（和越好吃小館一樣）',PLACES.names[Z]==='客居雲南'&&/11:00/.test(PLACES.hours[Z].text)&&/21:00/.test(PLACES.hours[Z].text)&&PLACES.hours[Z].shop===true&&PLACES.typhoonShops.includes(Z)&&PLACES.base(Z)==='tingzhou',J(PLACES.hours[Z]));
  check('2 手機快速前往：汀州路・客居雲南的店門口',PLACES.TZ_SHOPS.includes('keju')&&!!PLACES.tzDoor('keju')); });

// ---- 3 關門時按店門 ----
await sec(3,async()=>{ const door=async(key,h)=>{ fresh(key,h,'tingzhou'); const r=await STORY.interact({exit:{to:Z},label:'進'+T.name},GM); return {r,said:said(),t:toasts.slice()}; };
  { const x=await door('2025-10-07',21.5); check('3 21:30 按店門：稿的 closed_outside（旁白）、不進去、寫開放時間',x.r===true&&J(x.said)===J([[null,'（鐵門拉下來了。門口的菜單立牌收進去了，只剩地上一圈水漬。）']])&&T.sign===x.said[0][1]&&!H.entered.length&&x.t.length===1&&/客居雲南/.test(x.t[0]),J([x.said,x.t])); }
  { const x=await door('2025-10-07',2); check('3 半夜 02:00 按店門：同一句',x.r===true&&J(x.said)===J([[null,T.sign]])&&!H.entered.length,J(x.said)); }
  for(const h of [6,9,10.98]){ const x=await door('2025-10-07',h); check('3 '+h+' 點（開門以前）：稿的 not_open 那一句（旁白）、不進去、寫開放時間',x.r===true&&J(x.said)===J([[null,'（門還沒開。裡面有人在擦桌子，湯鍋上面一層白煙。門口的牌子寫十一點。）']])&&T.notOpen===x.said[0][1]&&!H.entered.length&&x.t.length===1&&/11:00/.test(x.t[0]),J([x.said,x.t])); }
  for(const h of [12,14.5,16]){ const x=await door('2025-10-07',h); check('3 '+h+' 點開著：不擋（下午不午休）',x.r!==true||!x.said.length,J(x)); }
  { const TC=PLACES.typhoonClosed; PLACES.typhoonClosed=z=>PLACES.typhoonShops.includes(z);
    try{ const x=await door('2025-10-07',12); check('3 颱風假（稿上沒有那一句）：不說話、只寫「颱風假」',x.r===true&&!x.said.length&&/颱風假/.test(x.t[0]||''),J(x)); } finally { PLACES.typhoonClosed=TC; } } });

// ---- 4 進門 ----
await sec(4,async()=>{ const want=['幾位？裡面坐，菜單在桌上。','過橋米線要等一下，湯要夠燙才能上。','第一次來嗎？米干是寬的，米線是圓的。'];
  for(const [rv,i] of [[0,0],[0.5,1],[0.99,2]]){ const G=fresh('2025-10-07',12,Z); GM.enterN=(GM.enterN|0)+1; const due=GG3.doorDue(GM); GG3.rand=()=>rv; const r=await GG3.enterLine(GM);
    check(`4 一天第一次進來：老闆娘「${want[i]}」`,due&&r==='door'&&J(said())===J([['老闆娘',want[i]]])&&T.door[i][1]===want[i],J(said()));
    if(i===0){ GM.enterN++; check('4 同一天再進來：不說',!GG3.doorDue(GM)); G.day++; GM.enterN++; check('4 隔天再進來：又說',GG3.doorDue(GM)); } }
  { const G=fresh('2025-10-07',12,Z); GM.enterN++; const a=GG3.tick(GM); await sleep(5); check('4 每 0.5 秒的檢查（GG3.tick）：走進店裡就說、記在 G.flags.GG3_DOOR',a===true&&H.said.length===1&&H.said[0].who==='老闆娘'&&G.flags.GG3_DOOR[Z]===G.day,J(said())); }
  { fresh('2025-10-07',21.5,Z); GM.enterN++; check('4 關著的時候不說進門句',!GG3.doorDue(GM)); } });

// ---- 5 打烊 ----
await sec(5,async()=>{ { fresh('2025-10-07',21.1,Z); GM.enterN++; E.player.seat={x:0,z:0}; const r=await GG3.closeOut(GM);
    check('5 21:00 人還在店裡：老闆娘「我們今天要打烊了。」一句、站起來、走到汀州路',r==='close'&&J(said())===J([['老闆娘','我們今天要打烊了。']])&&T.close==='我們今天要打烊了。'&&H.entered[0]==='tingzhou'&&!E.player.seat,J([r,said(),H.entered])); }
  { fresh('2025-10-07',23.5,Z); GM.enterN++; const r=await GG3.closeOut(GM); check('5 讀檔回到打烊以後：不說、走出去、寫開放時間',r==='out'&&!H.said.length&&H.entered[0]==='tingzhou'&&toasts.length===1,J([r,said(),toasts])); }
  { const G=fresh('2025-10-07',13.9,Z); GM.enterN++; GG3.tick(GM); await sleep(5); H.said=[]; G.hour=14.05; const b=GG3.tick(GM); await sleep(5);
    check('5 14:00 人在店裡：不請你出去（不午休）',b===false&&!H.said.length&&!H.entered.length&&!GG3.closingNow(Z,G),J([b,said(),H.entered])); } });

// ---- 6 點餐 ----
await sec(6,async()=>{ const gq=item(GQ), mg=item('tz_kj_migan');
  { const G=fresh('2025-10-07',12,Z); E.interactables=seatsOf(LY); H.picks=['紅燒牛肉米干','過橋米線','點好了']; const h0=G.hour; const r=await STORY.interact({tzPoint:'order',kind:'tz_keju_order',label:'點餐',look:'（客居雲南）'},GM); const o=H.opts[0], s=said();
    check('6 按「點餐」：老闆娘「想吃什麼？」→ 六樣（名字＋價錢）＋不用了（不是暫時的「（客居雲南）」）',r===true&&J(s[0])===J(['老闆娘','想吃什麼？'])&&!H.has('（客居雲南）')&&J(Array.from(o))===J(['過橋米線　160 元','紅燒牛肉米干　140 元','豌豆粉　70 元','破酥包（兩個）　60 元','涼拌木耳　50 元','冰普洱茶　40 元','不用了']),J([s[0],Array.from(o)]));
    check('6 點過的那一樣不再列、多了「點好了」',!Array.from(H.opts[1]).some(t=>t.startsWith('紅燒牛肉米干'))&&Array.from(H.opts[1]).includes('點好了')&&H.opts[1].length===7,J(Array.from(H.opts[1])));
    check('6 米干＋過橋米線：扣 140＋160',G.money===5000-300,String(G.money));
    check('6 有點過橋米線：老闆娘「好，過橋米線。等一下湯很燙，不要直接喝。」（order.after_guoqiao；不說一般那兩句）',s.some(x=>J(x)===J(['老闆娘','好，過橋米線。等一下湯很燙，不要直接喝。']))&&M.afterHas.line==='好，過橋米線。等一下湯很燙，不要直接喝。'&&!M.after.some(t=>H.has(t)),J(s));
    const i0=s.findIndex(x=>x[1]===T.seat.sit), tail=s.slice(i0);
    check('6 坐到空位（坐下那一句）→ 只演過橋米線的「吃」兩句（先點的米干不演；都是旁白、照稿）',i0>0&&J(tail)===J([[null,T.seat.sit],[null,gq.eat[0]],[null,gq.eat[1]]])&&!mg.eat.some(t=>H.has(t)),J(tail));
    check('6 吃 30 分鐘（和越好吃小館、泰米村食一樣）、吃完站起來',near(G.hour-h0,0.5)&&!E.player.seat,String(G.hour-h0));
    check('6 吃過的登記（EAT：汀州路・客居雲南）',!!(G.eat&&G.eat.ate&&G.eat.ate.some(a=>a.shop==='汀州路・客居雲南'&&/過橋米線/.test(a.item)&&/紅燒牛肉米干/.test(a.item))),J(G.eat)); }
  for(const [rv,i] of [[0,0],[0.99,1]]){ const G=fresh('2025-10-07',18,Z); E.interactables=seatsOf(LY); H.picks=['紅燒牛肉米干','點好了']; GG3.rand=()=>rv; await GG3.mealOrder(GM);
    check('6 沒點過橋米線（米干；隨機 '+rv+'）：扣 140、老闆娘「'+M.after[i]+'」、不說過橋米線那一句、米干的兩句',G.money===4860&&H.has(['好，稍等。','好。辣可以自己加，桌上那罐。'][i])&&M.after[i]===['好，稍等。','好。辣可以自己加，桌上那罐。'][i]&&!H.has(M.after[1-i])&&!H.has(M.afterHas.line)&&H.has(mg.eat[0])&&H.said[H.said.length-1].t===mg.eat[1],J(said())); }
  { const G=fresh('2025-10-07',12,Z); E.interactables=seatsOf(LY); E.player.seat=E.interactables[0].seat; H.picks=['豌豆粉','點好了']; await GG3.mealOrder(GM);
    check('6 已經坐著點：不換位子、不再說坐下那一句，吃的兩句照說',G.money===4930&&!H.has(T.seat.sit)&&H.has(item('tz_kj_wandou').eat[0])&&H.has(item('tz_kj_wandou').eat[1]),J(said())); }
  const eats=()=>said().filter(x=>x[0]===null&&M.menu.some(q=>q.eat.includes(x[1]))).map(x=>x[1]);
  for(const [picks,id,why] of [[['冰普洱茶','涼拌木耳','破酥包（兩個）','豌豆粉'],'tz_kj_wandou','四樣裡稿上最前面的是豌豆粉'],[['冰普洱茶','涼拌木耳'],'tz_kj_muer','木耳在茶前面'],
      [['冰普洱茶','破酥包（兩個）','紅燒牛肉米干'],'tz_kj_migan','後點的米干也排最前面'],[['冰普洱茶'],'tz_kj_tea','只點茶＝茶的兩句']]){
    const G=fresh('2025-10-07',12,Z); E.interactables=seatsOf(LY); H.picks=picks.concat(['點好了']); const h0=G.hour; await GG3.mealOrder(GM);
    check('6 點 '+picks.join('＋')+'：只演「'+item(id).n+'」的兩句（'+why+'）、吃 30 分鐘、每一樣都登記',J(eats())===J(item(id).eat)&&near(G.hour-h0,0.5)&&G.eat.ate.length===1&&picks.every(n=>G.eat.ate[0].item.includes(n)),J([eats(),G.hour-h0,G.eat])); }
  { const G=fresh('2025-10-07',12,Z); E.interactables=seatsOf(LY); H.picks=['過橋米線','紅燒牛肉米干','豌豆粉','破酥包（兩個）','涼拌木耳','冰普洱茶','點好了']; await GG3.mealOrder(GM);
    check('6 六樣都點：扣 520、每一樣最多一份（最後只剩「點好了」「不用了」）、演過橋米線',G.money===5000-520&&J(Array.from(H.opts[6]))===J(['點好了','不用了'])&&J(eats())===J(gq.eat),J([G.money,Array.from(H.opts[6]||[])])); } });

// ---- 7 錢不夠、不用了 ----
await sec(7,async()=>{ { const G=fresh('2025-10-07',12,Z); G.money=100; E.interactables=seatsOf(LY); H.picks=['過橋米線','點好了']; const h0=G.hour; const r=await GG3.mealOrder(GM); const s=said();
    check('7 錢不夠（100 元點 160）：稿的那一句旁白、不扣錢、時間不動、不登記、不坐下',r==='short'&&G.money===100&&J(s[s.length-1])===J([null,'（你看了菜單上的價錢，跟老闆娘說下次再來。她說好，下次來給你多加一點酸菜。）'])&&M.short===s[s.length-1][1]&&s.length===2&&near(G.hour,h0)&&!(G.eat&&G.eat.ate&&G.eat.ate.length)&&!E.player.seat&&!toasts.length,J([r,G.money,s,toasts])); }
  { const G=fresh('2025-10-07',12,Z); G.money=160; E.interactables=seatsOf(LY); H.picks=['過橋米線','點好了']; const r=await GG3.mealOrder(GM); check('7 剛好 160 元：買得起',r==='過橋米線'&&G.money===0,J([r,G.money])); }
  { const G=fresh('2025-10-07',12,Z); H.picks=['不用了']; const r=await GG3.mealOrder(GM); check('7「不用了」：不扣錢、只有「想吃什麼？」',r===null&&G.money===5000&&H.said.length===1,J(said())); }
  { const G=fresh('2025-10-07',12,Z); H.picks=['過橋米線','不用了']; const r=await GG3.mealOrder(GM); check('7 選了一樣再「不用了」：不扣錢',r===null&&G.money===5000,J([r,G.money])); } });

// ---- 8 看、坐下 ----
await sec(8,async()=>{ const got={}, un=[];
  for(const p of LY.points){ if(GG3.ACT[p.kind]) continue; if(!GG3.handles(Z,p.kind)){ un.push(p.kind); continue; }
    fresh('2025-10-07',12,Z); const r=await STORY.interact({tzPoint:p.id,kind:p.kind,label:p.label,look:'（客居雲南）'},GM); got[p.kind]=r===true?said():null; }
  check('8 看菜單＝稿的那一句旁白',J(got.tz_keju_menu)===J([[null,'（護貝的菜單，照片有點褪色。過橋米線那一格旁邊用紅筆寫了「招牌」，寫了兩次。）']]),J(got.tz_keju_menu));
  check('8 看牆上（配置的扎染布那一點）＝稿的那一句旁白',J(got.tz_keju_batik)===J([[null,'（牆上掛著一塊藍白的紮染布，旁邊一張山的照片，山頂有雪。）']]),J(got.tz_keju_batik));
  check('8 點餐接到 GG3.mealOrder；茶餅櫃、廚房稿沒有句子＝GG3 不接（不自己寫字；回報給 AA）',GG3.ACT.tz_keju_order===GG3.mealOrder&&J(un)===J(['tz_keju_tea','tz_keju_kitchen'])&&J(LY.points.map(p=>p.kind))===J(['tz_keju_order','tz_keju_menu','tz_keju_tea','tz_keju_kitchen','tz_keju_batik']),J(un));
  { const out=[]; for(const t of [1,2,3,4,5]){ fresh('2025-10-07',12,Z); await STORY.onSeat(GM,{x:0,z:0,yaw:0,table:'keju_t'+t}); out.push(said()); }
    check('8 坐下（STORY.onSeat；五張桌子都一樣）：稿的那一句',out.every(s=>J(s)===J([[null,'（木頭的桌椅，桌面擦得很乾淨。隔壁桌的湯還在冒煙。）']]))&&T.seat.sit===out[0][0][1],J(out)); } });

// ---- 9 別間照舊、載入 ----
await sec(9,async()=>{ const Y=TZ_MEAL_LINES.tz_yuehaochi;
  check('9 原本的都還在（客居雲南排在越好吃小館後面）',J(GG3.ZONES)===J(['gg_antai','gg_xianguo','gg_rongendian','tz_taimi','tz_xile','tz_yindehao','tz_yuehaochi',Z])&&J(GG3.MEALS)===J(['tz_yuehaochi',Z])&&GG3.ACT.tz_taimi_order===GG3.taimiOrder&&GG3.ACT.tz_yue_order===GG3.mealOrder);
  { const G=fresh('2025-10-07',12,'tz_yuehaochi'); E.interactables=seatsOf(TZ_SHOPS_LAYOUT.yuehaochi); H.picks=['越南冰咖啡','點好了']; const h0=G.hour; await GG3.mealOrder(GM);
    check('9 越好吃小館照舊：只點咖啡＝那一句、15 分鐘；沒有 afterHas',Y.meal.afterHas===null&&H.has(Y.meal.afterOnly.line)&&near(G.hour-h0,0.25)&&G.money===4940,J(said())); }
  { const G=fresh('2025-10-07',18,'tz_taimi'); H.picks=['泰式椒麻雞飯','點好了']; await GG3.taimiOrder(GM); check('9 泰米村食點餐照舊（椒麻雞 130）',G.money===4870,String(G.money)); }
  const bad=[]; for(const f of ['src/gg3shops3d.js',DATA,'src/data/places.js']){ const r=cp.spawnSync(process.execPath,['--check',path.join(ROOT,f)],{encoding:'utf8'}); if(r.status!==0) bad.push(f+' '+r.stderr.slice(0,160)); }
  check('9 node --check',!bad.length,J(bad)); });

// ---- 10 子程序 A：遊戲真正的區域 ----
await sec(10,()=>{ const r=cp.spawnSync(process.execPath,[__filename,'A'],{cwd:ROOT,encoding:'utf8',maxBuffer:1<<26});
  const out=String(r.stdout||'').split('\n').filter(l=>/^(PASS|FAIL) /.test(l)); for(const l of out) console.log('  A '+l);
  check('10 子程序 A（建出客居雲南的區域）全部通過（'+out.length+' 項）',r.status===0&&out.length>=6&&!out.some(l=>/^FAIL /.test(l)),String(r.stderr||'').split('\n').slice(0,4).join(' / ')); });
H.done(); })();
}
