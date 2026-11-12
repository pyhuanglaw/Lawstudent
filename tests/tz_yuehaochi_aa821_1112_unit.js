// 汀州路・越好吃小館（tz_yuehaochi）的店內文字（TINGZHOU-SHOPS5-1110；AA_821，企劃線 7917d4289）——不需要瀏覽器（D131）。
//   1  資料檔 src/data/tz_meal_lines.js 逐字對稿（店名、老闆娘的句子、六樣菜的名字／價錢／吃的兩句、點餐、四個「看」的按鈕和句子、坐下）；匯入工具 --check；白名單
//   2  營業時間每天 11:00～21:00（places.js）、名字、颱風假關、算汀州路
//   3  關門時按店門：打烊以後＝稿的門口那一句＋開放時間、不進去；開門以前（06～11）＝稿的 staff.not_open＋開放時間；開著不擋
//   4  進門：一天第一次老闆娘一句、同一天再進來不說
//   5  打烊：人還在店裡＝老闆娘「我們今天要打烊了。」、走到汀州路；讀檔回到打烊以後＝不說、走出去
//   6  點餐：「要吃什麼？」→ 六樣（稿的名字、價錢）→ 扣錢、點完一句、吃的兩句、吃 30 分鐘（和泰米村食一樣）、坐下那一句、吃過的登記
//      點好幾樣只演一樣的「吃」（河粉 > 春捲 > 法國麵包 > 咖啡；兩碗河粉＝先點的）；沒點河粉＝order.after_no_pho（不說「香草自己夾喔」）
//   7  只點咖啡＝「咖啡要等它滴完，不要急著攪。」、15 分鐘、不算一餐（不登記 EAT）；咖啡＋別的＝照一般的
//   （3 的開門以前、6 的只演一樣／沒點河粉、7 的 15 分鐘／不算一餐＝AA 11-12 回 LAWWW-C 七問，稿 _meta.lawww_1112；改以前的 bd8643003a 這幾項 FAIL）
//   8  錢不夠＝稿的那一句旁白、不扣錢、時間不動；「不用了」＝不扣錢
//   9  四個「看」：配置的點都接上、按了就是稿的那一句；坐下（每一桌）＝稿的那一句
//   10 原本六間照舊（泰米村食的點餐、坐下不受影響）；index.html 載入順序；node --check
//   11 （子程序 A：建出遊戲真正的區域）四個「看」和點餐在配置的位置、按鈕的字照稿、16 個座位補成 zone.seats、店員站在配置的位置（開店才有）
// 修改前（9dedfa2088）：沒有資料檔、GG3 不認得 tz_yuehaochi、沒有營業時間、互動點只有「（越好吃小館）」——FAIL。
// 用法：node tests/tz_yuehaochi_aa821_1112_unit.js
const Z='tz_yuehaochi', SHA='7917d4289', DOC='docs/story_planning/AA_821_tz_yuehaochi.json', DATA='src/data/tz_meal_lines.js';
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
for(const f of files){ if(!fs.existsSync(path.join(ROOT,f))){ check('11 載得到 '+f,false); continue; } let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|TZ3|TZS3|TINGZHOU_LAYOUT|TZ_SHOPS_LAYOUT|LINZE_LAYOUT|CLASSROOM_LAYOUT|PROPS|CHAR|CALENDAR|PLACES|GG3_LINES|TZ_MEAL_LINES|GG3)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
if(typeof ASSETS!=='undefined') ASSETS.loadOne=()=>new Promise(()=>{});
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
const loadZone=id=>{ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.nav=z.nav; return z; };
const T=typeof TZ_MEAL_LINES!=='undefined'?TZ_MEAL_LINES[Z]:null;
check('11 GG3 認得 tz_yuehaochi、包上區域的 build',!!T&&GG3.ZONES.includes(Z)&&GG3.LAYID[Z]==='yuehaochi'&&!!Z3.ZONES[Z]&&!!Z3.ZONES[Z]._gg3);
if(T&&Z3.ZONES[Z]){ const L=TZ_SHOPS_LAYOUT.yuehaochi, z=loadZone(Z), IT=E.interactables, bad=[];
  for(const p of L.points){ const it=IT.find(i=>i.tzPoint===p.id); if(!it){ bad.push(p.id+' 沒有'); continue; }
    if(it.gg3!==Z) bad.push(p.kind+' 沒接上'); if(Math.abs(it.x-p.x)>1e-6||Math.abs(it.z-p.z)>1e-6) bad.push(p.kind+' 位置不對'); if(it.label!==T.labels[p.kind]) bad.push(p.kind+' 按鈕「'+it.label+'」≠稿「'+T.labels[p.kind]+'」'); }
  check('11 配置的五個點（點餐＋四個看）：在配置的位置、接上、按鈕的字照稿',!bad.length&&L.points.length===5,J(bad));
  check('11 按鈕的字：點餐、看菜單、看香草檯、看廚房、看牆上的斗笠',J(L.points.map(p=>IT.find(i=>i.tzPoint===p.id).label))===J(['點餐','看菜單','看香草檯','看廚房','看牆上的斗笠']),J(L.points.map(p=>IT.find(i=>i.tzPoint===p.id).label)));
  check('11 16 個座位補成 zone.seats（桌子 yuehaochi_t1～t5）',Array.isArray(z.seats)&&z.seats.length===16&&z.seats.every(s=>/^yuehaochi_t[1-5]$/.test(s.table)&&IT.some(i=>i.seat===s)),J(z.seats&&z.seats.length));
  check('11 離開的門還在（回汀州路）',IT.some(i=>i.exit&&i.exit.to==='tingzhou'));
  const C0=global.CHAR, S0=global.STORY, A0=E.addNPC, got=[]; global.CHAR={build:()=>new THREE.Group()}; global.STORY={extraSpec:i=>({i})}; E.addNPC=o=>{ got.push(o); return o; };
  try{ const GMo={E,G:{day:DK('2025-10-07'),hour:12,flags:{}}}; const n1=GG3.placeClerk(Z,GMo); GMo.G.hour=22; const n2=GG3.placeClerk(Z,GMo);
    check('11 老闆娘站在配置的位置（開店才有，打烊沒有；女性的路人模型）',!!n1&&!n2&&got.length===1&&Math.abs(n1.obj.position.x-L.clerk.x)<1e-6&&Math.abs(n1.obj.position.z-L.clerk.z)<1e-6&&n1.frozen&&n1.clerk&&GG3.CLERK_I[Z]%2===0,J(got.map(o=>[o.obj.position.x,o.obj.position.z]))); }
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
check('0 載得到（配置、EAT、六間的資料檔、越好吃小館的資料檔、GG3），GG3 認得 tz_yuehaochi',ok0,loadErr.join(' | '));
if(!ok0){ H.done(); }
const T=TZ_MEAL_LINES[Z], M=T.meal, LY=TZ_SHOPS_LAYOUT.yuehaochi;
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

(async()=>{
// ---- 1 逐字對稿 ----
await sec(1,()=>{ let raw=null; try{ raw=cp.execFileSync('git',['show',SHA+':'+DOC],{cwd:ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']}); }catch(e){}
  if(!raw){ console.log('SKIP 1 讀不到企劃線 '+SHA+'（淺層複本：git fetch origin claude/story-planning）'); }
  else { const A=JSON.parse(raw);
    check('1 店名「越好吃小館」、說話的人、營業時間照稿',T.name===A.shop.name&&T.name==='越好吃小館'&&T.who===A.staff.who&&T.hours===A.shop.hours,J([T.name,T.who,T.hours]));
    check('1 老闆娘進門三句、打烊、門口、錢不夠照稿',J(T.door)===J(A.staff.greet.map(t=>[A.staff.who,t]))&&T.door.length===3&&T.close===A.staff.closed_line&&T.sign===A.staff.closed_outside&&M.short===A.staff.no_money,J([T.door,T.close,T.sign,M.short]));
    check('1 開門以前門口那一句（staff.not_open，旁白）照稿',typeof A.staff.not_open==='string'&&T.notOpen===A.staff.not_open&&/^（.*）$/.test(T.notOpen)&&T.notOpen!==T.sign,J(T.notOpen));
    const ids=Object.keys(A.items); check('1 六樣菜：id、名字、價錢、吃的兩句照稿（順序也照稿）',ids.length===6&&J(M.menu)===J(ids.map(id=>({id,n:A.items[id].name,p:A.items[id].price,eat:A.items[id].eat})))&&M.menu.every(q=>q.eat.length===2),J(M.menu.map(q=>[q.id,q.n,q.p])));
    check('1 價錢：牛肉河粉 130、雞肉河粉 120、生春捲（兩捲）80、炸春捲（四條）90、越式法國麵包 75、越南冰咖啡 60',J(M.menu.map(q=>[q.n,q.p]))===J([['牛肉河粉',130],['雞肉河粉',120],['生春捲（兩捲）',80],['炸春捲（四條）',90],['越式法國麵包',75],['越南冰咖啡',60]]));
    check('1 點餐：kind、要吃什麼、點完兩句、只點咖啡那一句照稿',M.point===A.order.id&&M.point==='tz_yue_order'&&M.ask===A.order.ask&&J(M.after)===J(A.order.after)&&J(M.afterOnly)===J({id:'tz_yue_coffee',line:A.order.after_coffee_only})&&T.labels[A.order.id]===A.order.button,J([M.ask,M.after,M.afterOnly]));
    check('1 沒點河粉那一句（order.after_no_pho）照稿、對到兩樣河粉',typeof A.order.after_no_pho==='string'&&J(M.afterNo)===J({ids:['tz_yue_pho_beef','tz_yue_pho_chicken'],line:A.order.after_no_pho})&&!/香草/.test(M.afterNo.line),J(M.afterNo));
    check('1 只演一樣的順序：河粉 > 春捲 > 法國麵包 > 咖啡（六樣菜各在一組；稿 _meta.lawww_1112 ②）',/河粉 > 春捲 > 法國麵包 > 咖啡/.test(A._meta.lawww_1112)&&J(M.eatFirst)===J([['tz_yue_pho_beef','tz_yue_pho_chicken'],['tz_yue_roll_fresh','tz_yue_roll_fried'],['tz_yue_banhmi'],['tz_yue_coffee']])
      &&M.eatFirst.every((g,i)=>g.every(id=>item(id).n.includes(['河粉','春捲','法國麵包','咖啡'][i]))),J(M.eatFirst));
    const ks=Object.keys(A.looks); check('1 四個「看」（菜單、香草檯、廚房、斗笠）：句子、按鈕的字照稿',J(ks)===J(['tz_yue_menu','tz_yue_herbs','tz_yue_kitchen','tz_yue_hats'])&&ks.every(k=>J(T.look[k])===J([A.looks[k].t])&&T.labels[k]===A.looks[k].button)&&Object.keys(T.look).length===4&&Object.keys(T.labels).length===5,J([T.look,T.labels]));
    check('1 坐下那一句照稿',J(T.seat)===J({sit:A.seat.sit}));
    /* 資料檔裡每一個字串都原封不動在稿裡（程式用的 id、配置 id 除外）*/
    const SKIP=new Set(['layout','id','point']), all=[]; const walk=(x,k)=>{ if(typeof x==='string'){ if(!SKIP.has(k)) all.push(x); } else if(Array.isArray(x)) x.forEach(v=>walk(v,k)); else if(x&&typeof x==='object') for(const kk of Object.keys(x)){ if(k==='labels'||k==='look') all.push(kk); walk(x[kk],kk); } };
    walk(T,''); const src=[]; const w2=x=>{ if(typeof x==='string') src.push(x); else if(Array.isArray(x)) x.forEach(w2); else if(x&&typeof x==='object') for(const kk of Object.keys(x)){ src.push(kk); w2(x[kk]); } }; w2(Object.assign({},A,{_meta:null}));
    const bad=all.filter(t=>!src.includes(t)); check('1 資料檔每一個字串都是稿裡完整的一句（'+all.length+' 個；沒有自己寫的字）',!bad.length&&all.length>=40,J(bad.slice(0,6))); }
  let ck=null; try{ ck=cp.spawnSync('python3',['tools/shops/import_tz_meals.py','--check'],{cwd:ROOT,encoding:'utf8'}); }catch(e){}
  if(!ck||ck.error) console.log('SKIP 1 沒有 python3（匯入工具 --check）'); else if(!raw) console.log('SKIP 1 匯入工具 --check（讀不到企劃線）'); else check('1 匯入工具 --check：資料檔＝稿匯出來的（走 import_guard 白名單）',ck.status===0,(ck.stdout+ck.stderr).trim().slice(0,200));
  const allow=JSON.parse(rd('docs/handoff/story_import_allow.json')).files; check('1 劇情匯入白名單有 AA_821（'+SHA+'、approved、approvedBy）',allow.some(e=>e.path===DOC&&e.sha===SHA&&e.status==='approved'&&e.approvedBy==='AA（TINGZHOU-SHOPS5-1110）'));
  check('1 資料檔記了來源（sha、稿）',J(TZ_MEAL_LINES._src[Z])===J({sha:SHA,doc:DOC})); });

// ---- 2 營業時間 ----
await sec(2,()=>{ const d0=DK('2025-10-05');
  check('2 每天 11:00～21:00（稿「11:00～21:00」；一週七天）',T.hours==='11:00～21:00'&&[0,1,2,3,4,5,6].every(i=>!PLACES.isOpen(Z,10.98,d0+i)&&PLACES.isOpen(Z,11,d0+i)&&PLACES.isOpen(Z,20.98,d0+i)&&!PLACES.isOpen(Z,21,d0+i)&&!PLACES.isOpen(Z,3,d0+i)));
  check('2 名字「越好吃小館」、畫面上的時間、颱風假關、算汀州路（和泰米村食一樣）',PLACES.names[Z]==='越好吃小館'&&/11:00/.test(PLACES.hours[Z].text)&&/21:00/.test(PLACES.hours[Z].text)&&PLACES.hours[Z].shop===PLACES.hours.tz_taimi.shop&&PLACES.typhoonShops.includes(Z)&&PLACES.base(Z)==='tingzhou',J(PLACES.hours[Z]));
  check('2 手機快速前往：汀州路・越好吃小館的店門口（和其他幾間一樣列在汀州路）',PLACES.TZ_SHOPS.includes('yuehaochi')&&!!PLACES.tzDoor('yuehaochi')); });

// ---- 3 關門時按店門 ----
await sec(3,async()=>{ const door=async(key,h)=>{ fresh(key,h,'tingzhou'); const r=await STORY.interact({exit:{to:Z},label:'進'+T.name},GM); return {r,said:said(),t:toasts.slice()}; };
  { const x=await door('2025-10-07',21.5); check('3 21:30 按店門：稿的門口那一句（旁白）、不進去、寫開放時間',x.r===true&&J(x.said)===J([[null,T.sign]])&&!H.entered.length&&x.t.length===1&&/越好吃小館/.test(x.t[0]),J([x.said,x.t])); }
  { const x=await door('2025-10-07',2); check('3 半夜 02:00 按店門：同一句',x.r===true&&J(x.said)===J([[null,T.sign]])&&!H.entered.length,J(x.said)); }
  for(const h of [6,9,10.98]){ const x=await door('2025-10-07',h); check('3 '+h+' 點（開門以前）：稿的 staff.not_open 那一句（旁白；不是打烊的那一句）、不進去、寫開放時間',x.r===true&&J(x.said)===J([[null,T.notOpen]])&&T.notOpen==='（鐵門只拉起一半。裡面的大湯鍋已經在滾了，味道飄到騎樓。小黑板寫十一點開。）'&&!H.entered.length&&x.t.length===1&&/11:00/.test(x.t[0]),J([x.said,x.t])); }
  { const x=await door('2025-10-07',5.9); check('3 05:54（清晨 6 點以前）：還是打烊的那一句',x.r===true&&J(x.said)===J([[null,T.sign]]),J(x.said)); }
  { fresh('2025-10-07',9,'tingzhou'); const a=GG3.doorLine('tz_taimi',H.G); check('3 泰米村食（稿沒有 not_open）開門以前照舊不說',a===null&&!GG3_LINES.tz_taimi.notOpen,J(a)); }
  { const x=await door('2025-10-07',12); check('3 12:00 開著：不擋',x.r!==true||!x.said.length,J(x)); }
  { const TC=PLACES.typhoonClosed; PLACES.typhoonClosed=z=>PLACES.typhoonShops.includes(z);
    try{ const x=await door('2025-10-07',12); check('3 颱風假（稿上沒有那一句）：不說話、只寫「颱風假」',x.r===true&&!x.said.length&&/颱風假/.test(x.t[0]||''),J(x)); } finally { PLACES.typhoonClosed=TC; } } });

// ---- 4 進門 ----
await sec(4,async()=>{ for(const [rv,i] of [[0,0],[0.5,1],[0.99,2]]){ const G=fresh('2025-10-07',12,Z); GM.enterN=(GM.enterN|0)+1; const due=GG3.doorDue(GM); GG3.rand=()=>rv; const r=await GG3.enterLine(GM);
    check(`4 一天第一次進來：老闆娘「${T.door[i][1]}」`,due&&r==='door'&&J(said())===J([['老闆娘',T.door[i][1]]]),J(said()));
    if(i===0){ GM.enterN++; check('4 同一天再進來：不說',!GG3.doorDue(GM)); G.day++; GM.enterN++; check('4 隔天再進來：又說',GG3.doorDue(GM)); } }
  { fresh('2025-10-07',21.5,Z); GM.enterN++; check('4 關著的時候不說進門句',!GG3.doorDue(GM)); } });

// ---- 5 打烊 ----
await sec(5,async()=>{ { fresh('2025-10-07',21.1,Z); GM.enterN++; E.player.seat={x:0,z:0}; const r=await GG3.closeOut(GM);
    check('5 21:00 人還在店裡：老闆娘「我們今天要打烊了。」一句、站起來、走到汀州路',r==='close'&&J(said())===J([['老闆娘','我們今天要打烊了。']])&&T.close==='我們今天要打烊了。'&&H.entered[0]==='tingzhou'&&!E.player.seat,J([r,said(),H.entered])); }
  { fresh('2025-10-07',23.5,Z); GM.enterN++; const r=await GG3.closeOut(GM); check('5 讀檔回到打烊以後：不說、走出去、寫開放時間',r==='out'&&!H.said.length&&H.entered[0]==='tingzhou'&&toasts.length===1,J([r,said(),toasts])); }
  { const G=fresh('2025-10-07',20.9,Z); GM.enterN++; const a=GG3.tick(GM); await sleep(5); H.said=[]; G.hour=21.05; const b=GG3.tick(GM); await sleep(5);
    check('5 每 0.5 秒的檢查（GG3.tick）：開著的時候是進門句，過了 21:00 請你出來',a===true&&b===true&&H.has(T.close)&&H.entered[0]==='tingzhou',J([a,b,said(),H.entered])); } });

// ---- 6 點餐 ----
await sec(6,async()=>{ const pho=item('tz_yue_pho_beef'), roll=item('tz_yue_roll_fried');
  { const G=fresh('2025-10-07',12,Z); E.interactables=seatsOf(LY); H.picks=['牛肉河粉','炸春捲','點好了']; const h0=G.hour; const r=await STORY.interact({tzPoint:'order',kind:'tz_yue_order',label:'點餐',look:'（暫時）'},GM); const o=H.opts[0], s=said();
    check('6 按「點餐」：老闆娘「要吃什麼？」→ 六樣（名字＋價錢）＋不用了',r===true&&J(s[0])===J(['老闆娘','要吃什麼？'])&&J(Array.from(o))===J(['牛肉河粉　130 元','雞肉河粉　120 元','生春捲（兩捲）　80 元','炸春捲（四條）　90 元','越式法國麵包　75 元','越南冰咖啡　60 元','不用了']),J(Array.from(o)));
    check('6 點過的那一樣不再列、多了「點好了」',!Array.from(H.opts[1]).some(t=>t.startsWith('牛肉河粉'))&&Array.from(H.opts[1]).includes('點好了')&&H.opts[1].length===7,J(Array.from(H.opts[1])));
    check('6 牛肉河粉＋炸春捲：扣 130＋90',G.money===5000-220,String(G.money));
    check('6 點完老闆娘一句（稿的 after 第一句；不是只點咖啡那一句）',s.some(x=>J(x)===J(['老闆娘',M.after[0]]))&&!H.has(M.afterOnly.line)&&!H.has(M.after[1]),J(s));
    const i0=s.findIndex(x=>x[1]===T.seat.sit), tail=s.slice(i0);
    check('6 坐到空位（坐下那一句）→ 只演河粉的「吃」兩句（炸春捲的不演；都是旁白、照稿）',i0>0&&J(tail)===J([[null,T.seat.sit],[null,pho.eat[0]],[null,pho.eat[1]]])&&!roll.eat.some(t=>H.has(t)),J(tail));
    check('6 吃 30 分鐘（和泰米村食一樣）、吃完站起來',near(G.hour-h0,0.5)&&near(GG3.HRS.mealEat,GG3.HRS.taimiEat)&&!E.player.seat,String(G.hour-h0));
    check('6 吃過的登記（EAT：汀州路・越好吃小館；和泰米村食同一種登記）',!!(G.eat&&G.eat.ate&&G.eat.ate.some(a=>a.shop==='汀州路・越好吃小館'&&/牛肉河粉/.test(a.item)&&/炸春捲/.test(a.item))),J(G.eat)); }
  { const G=fresh('2025-10-07',18,Z); E.interactables=seatsOf(LY); H.picks=['雞肉河粉','點好了']; GG3.rand=()=>0.99; await GG3.mealOrder(GM);
    check('6 雞肉河粉（隨機到第二句）：扣 120、老闆娘「好，馬上來。香草自己夾喔。」、吃的兩句',G.money===4880&&H.has(M.after[1])&&!H.has(M.after[0])&&H.has(item('tz_yue_pho_chicken').eat[0])&&H.said[H.said.length-1].t===item('tz_yue_pho_chicken').eat[1],J(said())); }
  { const G=fresh('2025-10-07',12,Z); E.interactables=seatsOf(LY); E.player.seat=E.interactables[0].seat; H.picks=['越式法國麵包','點好了']; await GG3.mealOrder(GM);
    check('6 已經坐著點：不換位子、不再說坐下那一句，吃的兩句照說',G.money===4925&&!H.has(T.seat.sit)&&H.has(item('tz_yue_banhmi').eat[0])&&H.has(item('tz_yue_banhmi').eat[1]),J(said())); }
  const eats=()=>said().filter(x=>x[0]===null&&M.menu.some(q=>q.eat.includes(x[1]))).map(x=>x[1]);
  for(const [picks,id,why] of [[['越式法國麵包','生春捲','雞肉河粉','牛肉河粉'],'tz_yue_pho_chicken','兩碗河粉＝先點的雞肉河粉'],[['越南冰咖啡','越式法國麵包','炸春捲','生春捲'],'tz_yue_roll_fried','沒有河粉＝春捲，先點的炸春捲'],
      [['越南冰咖啡','越式法國麵包'],'tz_yue_banhmi','法國麵包在咖啡前面'],[['越南冰咖啡','牛肉河粉'],'tz_yue_pho_beef','後點的河粉也排最前面']]){
    const G=fresh('2025-10-07',12,Z); E.interactables=seatsOf(LY); H.picks=picks.concat(['點好了']); const h0=G.hour; await GG3.mealOrder(GM);
    check('6 點 '+picks.join('＋')+'：只演「'+item(id).n+'」的兩句（'+why+'）、照樣吃 30 分鐘、每一樣都登記',J(eats())===J(item(id).eat)&&near(G.hour-h0,0.5)&&G.eat.ate.length===1&&picks.every(n=>G.eat.ate[0].item.includes(n)),J([eats(),G.hour-h0,G.eat])); }
  check('6 GG3.mealPick：沒有 eatFirst 的店＝先點的那一樣',GG3.mealPick({},[item('tz_yue_coffee'),pho])===item('tz_yue_coffee')&&GG3.mealPick(M,[item('tz_yue_coffee'),pho])===pho);
  for(const rv of [0,0.99]){ const G=fresh('2025-10-07',12,Z); E.interactables=seatsOf(LY); H.picks=['炸春捲','越式法國麵包','點好了']; GG3.rand=()=>rv; await GG3.mealOrder(GM); const s=said();
    check('6 沒點河粉（炸春捲＋法國麵包；隨機 '+rv+'）：老闆娘「好，找位子坐，等一下端過去。」（order.after_no_pho），不說「香草自己夾喔」',s.some(x=>J(x)===J(['老闆娘','好，找位子坐，等一下端過去。']))&&M.afterNo.line==='好，找位子坐，等一下端過去。'&&!H.has(M.after[1])&&!s.some(x=>/香草自己夾/.test(x[1])),J(s)); }
  { const G=fresh('2025-10-07',12,Z); E.interactables=seatsOf(LY); H.picks=['生春捲','雞肉河粉','點好了']; GG3.rand=()=>0.99; await GG3.mealOrder(GM);
    check('6 有點河粉（生春捲＋雞肉河粉；隨機到第二句）：照樣可以說「好，馬上來。香草自己夾喔。」',H.has('好，馬上來。香草自己夾喔。')&&M.after[1]==='好，馬上來。香草自己夾喔。',J(said())); }
  { const G=fresh('2025-10-07',12,Z); E.interactables=seatsOf(LY); H.picks=['牛肉河粉','雞肉河粉','生春捲','炸春捲','越式法國麵包','越南冰咖啡','點好了']; await GG3.mealOrder(GM);
    check('6 六樣都點：扣 555、每一樣最多一份（最後只剩「點好了」「不用了」）',G.money===5000-555&&J(Array.from(H.opts[6]))===J(['點好了','不用了']),J([G.money,Array.from(H.opts[6]||[])])); } });

// ---- 7 只點咖啡 ----
await sec(7,async()=>{ const cf=item('tz_yue_coffee');
  { const G=fresh('2025-10-07',15,Z); E.interactables=seatsOf(LY); H.picks=['越南冰咖啡','點好了']; const h0=G.hour; const r=await GG3.mealOrder(GM); const s=said();
    check('7 只點越南冰咖啡：過 15 分鐘（不是 30 分鐘）',near(G.hour-h0,0.25)&&near(GG3.HRS.mealDrink,0.25),String(G.hour-h0));
    check('7 只點越南冰咖啡：不算一餐（EAT 沒有登記吃過）、照樣坐下、喝完站起來',!(G.eat&&G.eat.ate&&G.eat.ate.length)&&H.has(T.seat.sit)&&!E.player.seat,J(G.eat));
    check('7 只點越南冰咖啡：扣 60、老闆娘「咖啡要等它滴完，不要急著攪。」（不說一般那兩句）、咖啡的兩句',r==='越南冰咖啡'&&G.money===4940&&s.some(x=>J(x)===J(['老闆娘','咖啡要等它滴完，不要急著攪。']))&&!M.after.some(t=>H.has(t))&&H.has(cf.eat[0])&&s[s.length-1][1]===cf.eat[1],J(s)); }
  { const G=fresh('2025-10-07',15,Z); E.interactables=seatsOf(LY); H.picks=['越南冰咖啡','生春捲','點好了']; const h0=G.hour; await GG3.mealOrder(GM);
    check('7 咖啡＋生春捲：不是「只點咖啡」＝沒點河粉那一句、30 分鐘、算一餐（登記）',G.money===4860&&!H.has(M.afterOnly.line)&&H.has(M.afterNo.line)&&near(G.hour-h0,0.5)&&!!(G.eat&&G.eat.ate&&G.eat.ate.length===1&&/越南冰咖啡/.test(G.eat.ate[0].item)),J([said(),G.eat])); } });

// ---- 8 錢不夠、不用了 ----
await sec(8,async()=>{ { const G=fresh('2025-10-07',12,Z); G.money=100; E.interactables=seatsOf(LY); H.picks=['牛肉河粉','點好了']; const h0=G.hour; const r=await GG3.mealOrder(GM); const s=said();
    check('8 錢不夠（100 元點 130）：稿的那一句旁白、不扣錢、時間不動、不登記、不坐下',r==='short'&&G.money===100&&J(s[s.length-1])===J([null,T.meal.short])&&s.length===2&&near(G.hour,h0)&&!(G.eat&&G.eat.ate&&G.eat.ate.length)&&!E.player.seat&&!toasts.length,J([r,G.money,s,toasts])); }
  { const G=fresh('2025-10-07',12,Z); G.money=130; E.interactables=seatsOf(LY); H.picks=['牛肉河粉','點好了']; const r=await GG3.mealOrder(GM); check('8 剛好 130 元：買得起',r==='牛肉河粉'&&G.money===0,J([r,G.money])); }
  { const G=fresh('2025-10-07',12,Z); H.picks=['不用了']; const r=await GG3.mealOrder(GM); check('8「不用了」：不扣錢、只有「要吃什麼？」',r===null&&G.money===5000&&H.said.length===1,J(said())); }
  { const G=fresh('2025-10-07',12,Z); H.picks=['牛肉河粉','不用了']; const r=await GG3.mealOrder(GM); check('8 選了一樣再「不用了」：不扣錢',r===null&&G.money===5000,J([r,G.money])); } });

// ---- 9 看、坐下 ----
await sec(9,async()=>{ const miss=[], bad=[];
  for(const p of LY.points){ if(!GG3.handles(Z,p.kind)){ miss.push(p.kind); continue; } if(GG3.ACT[p.kind]) continue;
    fresh('2025-10-07',12,Z); const r=await STORY.interact({tzPoint:p.id,kind:p.kind,label:p.label,look:'（暫時）'},GM); if(!(r===true&&J(said())===J([[null,T.look[p.kind][0]]]))) bad.push(p.kind+' '+J(said())); }
  check('9 配置的五個點全部接上（tz_yue_order／menu／herbs／kitchen／hats）',!miss.length&&J(LY.points.map(p=>p.kind))===J(['tz_yue_order','tz_yue_menu','tz_yue_herbs','tz_yue_kitchen','tz_yue_hats']),J(miss));
  check('9 四個「看」按下去＝稿的那一句旁白（不是暫時的「（越好吃小館）」）',!bad.length&&Object.keys(T.look).every(k=>LY.points.some(p=>p.kind===k)),J(bad));
  { const out=[]; for(const t of [1,2,3,4,5]){ fresh('2025-10-07',12,Z); await STORY.onSeat(GM,{x:0,z:0,yaw:0,table:'yuehaochi_t'+t}); out.push(said()); }
    check('9 坐下（STORY.onSeat；五張桌子都一樣）：稿的那一句',out.every(s=>J(s)===J([[null,T.seat.sit]])),J(out)); } });

// ---- 10 原本六間照舊、載入 ----
await sec(10,async()=>{ const X=GG3_LINES.tz_taimi;
  check('10 原本六間都還在（越好吃小館排在後面；再後面是客居雲南，SHOP-LIFE-AA826-1112）',J(GG3.ZONES)===J(['gg_antai','gg_xianguo','gg_rongendian','tz_taimi','tz_xile','tz_yindehao',Z,'tz_keju'])&&J(GG3.MEALS)===J([Z,'tz_keju'])&&GG3.ACT.tz_taimi_order===GG3.taimiOrder&&GG3.ACT.tz_yue_order===GG3.mealOrder);
  { const G=fresh('2025-10-07',12,'tz_taimi'); H.said=[]; await STORY.onSeat(GM,{x:-2.22,z:3.6,yaw:0,table:'taimi_t1'}); const a=said(); H.said=[]; await STORY.onSeat(GM,{x:2.1,z:3,yaw:0,table:'taimi_t6'}); const b=said(); G.zone='tz_xile'; H.said=[]; await STORY.onSeat(GM,{x:0,z:0,table:'xile_t1'});
    check('10 泰米村食坐下照舊（兩人桌／四人桌各自那一句）、洗樂不說',J(a)===J([[null,X.seat.two]])&&J(b)===J([[null,X.seat.four]])&&!H.said.length,J([a,b,said()])); }
  { const G=fresh('2025-10-07',18,'tz_taimi'); H.picks=['泰式椒麻雞飯','點好了']; await GG3.taimiOrder(GM); check('10 泰米村食點餐照舊（椒麻雞 130）',G.money===4870,String(G.money)); }
  const html=rd('index.html'), at=f=>html.indexOf('src="'+f+'?v=');
  check('10 index.html 載入資料檔（在六間的資料檔後面、GG3 前面；版本號照旁邊的寫法）',at(DATA)>at('src/data/gg3_shops_lines.js')&&at('src/data/gg3_shops_lines.js')>0&&at(DATA)<at('src/gg3shops3d.js')&&(html.match(/src="src\/data\/tz_meal_lines\.js\?v=([\d.]+)"/)||[])[1]===(html.match(/src="src\/gg3shops3d\.js\?v=([\d.]+)"/)||[])[1]);
  const bad=[]; for(const f of ['src/gg3shops3d.js',DATA,'src/data/places.js']){ const r=cp.spawnSync(process.execPath,['--check',path.join(ROOT,f)],{encoding:'utf8'}); if(r.status!==0) bad.push(f+' '+r.stderr.slice(0,160)); }
  check('10 node --check',!bad.length,J(bad));
  check('10 客居雲南有稿了（AA_825，SHOP-LIFE-AA826-1112；測試在 tests/tz_keju_aa825_1112_unit.js）：越好吃小館的資料沒有被動到（沒有 afterHas）',!!TZ_MEAL_LINES.tz_keju&&T.meal.afterHas===null&&T.meal.point==='tz_yue_order'); });

// ---- 11 子程序 A：遊戲真正的區域 ----
await sec(11,()=>{ const r=cp.spawnSync(process.execPath,[__filename,'A'],{cwd:ROOT,encoding:'utf8',maxBuffer:1<<26});
  const out=String(r.stdout||'').split('\n').filter(l=>/^(PASS|FAIL) /.test(l)); for(const l of out) console.log('  A '+l);
  check('11 子程序 A（建出越好吃小館的區域）全部通過（'+out.length+' 項）',r.status===0&&out.length>=6&&!out.some(l=>/^FAIL /.test(l)),String(r.stderr||'').split('\n').slice(0,4).join(' / ')); });
H.done(); })();
}
