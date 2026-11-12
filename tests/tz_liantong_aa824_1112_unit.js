// 汀州路・汀州聯通（tz_liantong）的店內文字（TINGZHOU-SHOPS5-1110；AA_824 @ 2dd4ba0a9，分支 claude/magical-albattani-bk7b4n）——不需要瀏覽器（D131）。
//   1  資料檔 src/data/tz_grocery_lines.js 逐字對稿（店名、店員的句子、三樣服務的名字／價錢／分鐘／句子、六樣東西、四個「看」和按鈕、坐著等、拿起、掛回去）；匯入工具 --check；白名單
//   2  營業時間每天 11:00～21:30（places.js）、名字、颱風假關、算汀州路
//   3  關門時按店門：稿只有 not_open 一句＝開門以前、打烊以後都說那一句＋開放時間；開著不擋；颱風假只寫開放時間
//   4  進門：一天第一次店員一句、同一天再進來不說
//   5  打烊：人還在店裡＝店員「我們今天要打烊了。」、走到汀州路
//   6  看：四個點各自那一句；手機殼、配件是貨架（東西的名字＋價錢、說明當提示、拿起＝稿的 pick）；展示機、門號方案只有那一句
//   7  櫃台的服務：「今天要弄什麼？」→ 檢測手機 0 元 10 分鐘／貼保護貼 350 元 10 分鐘／問門號方案 0 元 5 分鐘（句子、順序、錢、時間照稿；做完店員 after 那一句）；
//      貼保護貼＝「物品」多「保護貼（已貼）」（再貼一次還是一份）；問門號方案可以一直問；錢不夠＝稿的 no_money、不扣錢、時間不動、沒有保護貼
//   8  買配件：貨架拿 → 櫃台「買」→ 扣錢、時間、進「物品」、after；錢不夠＝no_money、東西掛回去；「不用了」＝稿的 cancel
//   9  座位：自己坐下＝seat.sit；做檢測、貼保護貼＝坐到圓凳上、第一句後面演 seat.wait（沒有空位＝站著、不演）；問門號方案不坐、不演
//   10 配置的五個點都接上；手上的東西不進存檔；存檔只多 G.flags.GG3_OWN；東南大聯商行照舊；node --check
//   11 （子程序 A：建出遊戲真正的區域）五個點在配置的位置、按鈕的字照稿、兩張圓凳的按鈕「坐著等」、店員站在配置的位置（0.8, −2.5；開店才有；男性）
// 修改前（b51659c78c）：資料檔沒有 tz_liantong、GG3 不認得、沒有營業時間、互動點只有暫時的一句——0 就 FAIL。
// 用法：node tests/tz_liantong_aa824_1112_unit.js
const Z='tz_liantong', SHA='2dd4ba0a9', DOC='docs/story_planning/AA_824_tz_liantong.json', DATA='src/data/tz_grocery_lines.js', MEAL='src/data/tz_meal_lines.js';
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
check('11 GG3 認得 tz_liantong、包上區域的 build',!!T&&typeof GG3!=='undefined'&&GG3.ZONES.includes(Z)&&GG3.LAYID[Z]==='liantong'&&!!Z3.ZONES[Z]&&!!Z3.ZONES[Z]._gg3);
if(T&&typeof GG3!=='undefined'&&GG3.ZONES.includes(Z)&&Z3.ZONES[Z]){ const L=TZ_SHOPS_LAYOUT.liantong, z=loadZone(Z), IT=E.interactables, bad=[];
  for(const p of L.points){ const it=IT.find(i=>i.tzPoint===p.id); if(!it){ bad.push(p.id+' 沒有'); continue; }
    if(it.gg3!==Z) bad.push(p.kind+' 沒接上'); if(Math.abs(it.x-p.x)>1e-6||Math.abs(it.z-p.z)>1e-6) bad.push(p.kind+' 位置不對'); if(it.label!==T.labels[p.kind]) bad.push(p.kind+' 按鈕「'+it.label+'」≠稿「'+T.labels[p.kind]+'」'); }
  check('11 配置的五個點：在配置的位置、接上、按鈕的字照稿',!bad.length&&L.points.length===5,J(bad));
  check('11 按鈕的字：找店員、看手機殼、看展示機、看配件、看門號方案',J(L.points.map(p=>(IT.find(i=>i.tzPoint===p.id)||{}).label))===J(['找店員','看手機殼','看展示機','看配件','看門號方案']),J(L.points.map(p=>(IT.find(i=>i.tzPoint===p.id)||{}).label)));
  const seats=IT.filter(i=>i.tzSeat); check('11 兩張圓凳：按鈕「坐著等」（稿 seat.button）、在櫃台前面、zone.seats 兩個',seats.length===2&&seats.every(i=>i.label==='坐著等'&&i.label===T.seat.button)&&Array.isArray(z.seats)&&z.seats.length===2&&J(seats.map(i=>[i.seat.x,i.seat.z]))===J([[0.3,-0.95],[1.3,-0.95]]),J(seats.map(i=>[i.label,i.seat.x,i.seat.z])));
  check('11 離開的門還在（回汀州路）',IT.some(i=>i.exit&&i.exit.to==='tingzhou'));
  check('11 區域記了店員站的位置（配置 clerk：0.8, −2.5）',!!z.shopClerk&&z.shopClerk.x===0.8&&z.shopClerk.z===-2.5,J(z.shopClerk));
  const C0=global.CHAR, S0=global.STORY, A0=E.addNPC, got=[]; global.CHAR={build:()=>new THREE.Group()}; global.STORY={extraSpec:i=>({i})}; E.addNPC=o=>{ got.push(o); return o; };
  try{ const GMo={E,G:{day:DK('2025-10-07'),hour:12,flags:{}}}; const n1=GG3.placeClerk(Z,GMo); GMo.G.hour=21.6; const n2=GG3.placeClerk(Z,GMo); GMo.G.hour=10.5; const n3=GG3.placeClerk(Z,GMo);
    check('11 店員站在配置的位置（開店才有；打烊、開門以前沒有；男性的路人模型）',!!n1&&!n2&&!n3&&got.length===1&&Math.abs(n1.obj.position.x-0.8)<1e-6&&Math.abs(n1.obj.position.z+2.5)<1e-6&&Math.abs(n1.obj.rotation.y-L.clerk.yaw)<1e-6&&n1.frozen&&n1.clerk&&n1.gg3Clerk===Z&&GG3.CLERK_I[Z]%2===1,J(got.map(o=>[o.obj.position.x,o.obj.position.z]))); }
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
const ok0=!loadErr.length&&typeof GG3!=='undefined'&&typeof TZ_GROCERY_LINES!=='undefined'&&!!TZ_GROCERY_LINES[Z]&&GG3.ZONES.includes(Z)&&typeof GG3.serviceCounter==='function';
check('0 載得到（配置、資料檔、GG3），GG3 認得 tz_liantong、有櫃台服務的流程',ok0,loadErr.join(' | '));
if(!ok0){ H.done(); }
const T=TZ_GROCERY_LINES[Z], X=T.grocery, LY=TZ_SHOPS_LAYOUT.liantong;
let spent=[]; GM.money=(d,why)=>{ H.G.money=(H.G.money|0)+d; spent.push([d,why]); };
const toasts=[]; GM.toast=t=>toasts.push(t); GM.enterN=1;
let sits=[], fades=0; GM.sitAt=(P,s)=>{ P.seat=s; sits.push(s); }; GM.standUp=P=>{ P.seat=null; }; GM.fade=async()=>{ fades++; };
const stools=()=>LY.seats.map(q=>({x:q.x,z:q.z,radius:0.7,label:q.label,tzSeat:q.id,seat:{x:q.x,z:q.z,yaw:q.yaw,table:'liantong_t'+q.table}}));
const fresh=(key,h,zone,fl)=>{ const G=H.fresh(key,h,zone,fl); G.money=5000; toasts.length=0; spent=[]; sits=[]; fades=0; E.interactables=zone===Z?stools():[]; E.player.seat=null; GG3.rand=()=>0; GM.enterN=(GM.enterN|0)+1; return G; };
const said=()=>H.said.map(s=>[s.who,s.t]);
const near=(a,b)=>Math.abs(a-b)<1e-6;
const DK=k=>PG.DK(k);
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+' 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); } };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const press=kind=>STORY.interact({tzPoint:kind.replace('tz_liantong_',''),kind,label:'（暫時）',look:'（暫時）'},GM);
const take=async(kind,names)=>{ H.picks=names.concat(['不用了']); return press(kind); };
const counter=async p=>{ H.said=[]; H.opts=[]; H.picks=[p]; return GG3.serviceCounter(GM); };
const WHO='店員', ASK='今天要弄什麼？', AFTER='好，謝謝。有問題再拿來。', NOMONEY='（你看了一下價錢，說再想想。店員說好，東西都在這裡。）', WAIT='（你坐著等。旁邊的人在問他的照片救不救得回來。）', SIT='（圓凳有一點高。櫃台後面，店員低著頭在拆一支別人的手機，螺絲排成一排。）';
const CHECK=[[null,'（店員把你的手機翻過來看，按了幾下，又插上一條線。）'],[WHO,'電池還可以，螢幕沒問題。你這支保養得不錯，不用修。'],[null,'（他把手機還給你，螢幕順手擦了一下。）']];
const FILM=[[null,'（店員把舊的保護貼撕下來，用膠帶把螢幕上的灰一點一點黏掉。）'],[WHO,'等一下貼的時候，不要對著它講話，口水會跑進去。'],[null,'（他一次就貼好，一個氣泡都沒有。）']];
const PLAN=[[WHO,'學生方案在牆上那一張。你現在的合約還沒到期的話，換了要付違約金，我會勸你等到期再來。'],[null,'（你說合約還沒到期。他說那就到期再來。）']];
const MENU=['檢測手機','貼保護貼','問門號方案'];

(async()=>{
// ---- 1 逐字對稿 ----
await sec(1,()=>{ let raw=null; try{ raw=cp.execFileSync('git',['show',SHA+':'+DOC],{cwd:ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']}); }catch(e){}
  if(!raw){ console.log('SKIP 1 讀不到稿 '+SHA+'（淺層複本：git fetch origin claude/magical-albattani-bk7b4n）'); }
  else { const A=JSON.parse(raw), C=A.counter;
    check('1 店名「汀州聯通」、說話的人「店員」、營業時間照稿',T.name===A.shop.name&&T.name==='汀州聯通'&&T.who===A.staff.who&&T.who===WHO&&T.hours===A.shop.hours&&T.hours==='11:00～21:30',J([T.name,T.who,T.hours]));
    check('1 店員進門三句、打烊、門口關著那一句、錢不夠照稿',J(T.door)===J(A.staff.greet.map(t=>[WHO,t]))&&T.door.length===3&&T.close===A.staff.closed_line&&T.notOpen===A.staff.not_open&&/^（.*）$/.test(T.notOpen)&&T.sign===A.staff.closed_outside&&/^（.*）$/.test(T.sign)&&X.short===A.staff.no_money&&X.short===NOMONEY,J([T.door,T.close,T.notOpen,X.short]));
    const sids=Object.keys(C.menu); const L2=l=>typeof l==='string'?[null,l]:[l.who,l.t];
    check('1 櫃台：kind、按鈕「找店員」、「今天要弄什麼？」、做完那一句照稿',X.point===C.id&&X.point==='tz_liantong_counter'&&T.labels[X.point]===C.button&&C.button==='找店員'&&X.ask===C.ask&&X.ask===ASK&&J(X.after)===J([C.after])&&C.after===AFTER,J([X.ask,X.after]));
    check('1 三樣服務：id、名字、價錢、分鐘、每一句（說話的人、字、順序）照稿',J(sids)===J(['check','film','plan'])&&J(X.services.map(s=>[s.id,s.n,s.p,s.min,s.lines,s.item||null]))===J(sids.map(id=>[id,C.menu[id].name,C.menu[id].price,C.menu[id].minutes,C.menu[id].lines.map(L2),C.menu[id].item||null])),J(X.services.map(s=>[s.id,s.n,s.p,s.min])));
    check('1 檢測手機 0 元 10 分鐘、貼保護貼 350 元 10 分鐘、問門號方案 0 元 5 分鐘；句子＝稿的三句、三句、兩句',J(X.services.map(s=>[s.n,s.p,s.min]))===J([['檢測手機',0,10],['貼保護貼',350,10],['問門號方案',0,5]])&&J(X.services.map(s=>s.lines))===J([CHECK,FILM,PLAN]),J(X.services.map(s=>s.lines.length)));
    check('1 貼保護貼做完得到 tz_lt_film；坐著等的是檢測、貼保護貼（問門號方案不是）',X.services[1].item==='tz_lt_film'&&!X.services[0].item&&!X.services[2].item&&J(X.services.map(s=>!!s.wait))===J([true,true,false]));
    const ids=Object.keys(A.items); check('1 六樣東西：id、名字、價錢、在哪、一句說明照稿（順序也照稿）；保護貼（已貼）不能買',ids.length===6&&J(X.goods)===J(ids.map(id=>Object.assign({id,n:A.items[id].name,p:A.items[id].price,at:A.items[id].where,line:A.items[id].line},A.items[id].buy===false?{noBuy:true}:{})))&&J(X.goods.filter(g=>g.noBuy).map(g=>g.id))===J(['tz_lt_film']),J(X.goods.map(q=>[q.id,q.n,q.p,q.at,q.noBuy])));
    check('1 價錢：手機殼 390（看手機殼）；充電線 250、充電頭 450、行動電源 790、有線耳機 320（看配件）；保護貼（已貼）350（櫃台）',
      J(X.goods.map(q=>[q.n,q.p,q.at]))===J([['手機殼',390,'tz_liantong_cases'],['充電線',250,'tz_liantong_acc'],['充電頭',450,'tz_liantong_acc'],['行動電源',790,'tz_liantong_acc'],['有線耳機',320,'tz_liantong_acc'],['保護貼（已貼）',350,'tz_liantong_counter']]),J(X.goods.map(q=>[q.n,q.p,q.at])));
    const ks=Object.keys(A.looks); check('1 四個「看」：句子（旁白）、按鈕的字照稿',J(ks)===J(['tz_liantong_cases','tz_liantong_phones','tz_liantong_acc','tz_liantong_plan'])&&ks.every(k=>J(T.look[k])===J([A.looks[k].t])&&/^（.*）$/.test(A.looks[k].t)&&T.labels[k]===A.looks[k].button)&&Object.keys(T.look).length===4&&Object.keys(T.labels).length===5,J([T.look,T.labels]));
    check('1 坐著等（按鈕、坐下、等）、拿起、掛回去照稿',J(T.seat)===J({sit:A.seat.sit,wait:A.seat.wait,button:A.seat.button})&&T.seat.sit===SIT&&T.seat.wait===WAIT&&T.seat.button==='坐著等'&&X.pick===A.pick&&X.pick==='（你把它從掛勾上拿下來。）'&&X.cancel===A.cancel&&X.cancel==='（你把東西掛回去。）',J([T.seat,X.pick,X.cancel]));
    /* 資料檔裡每一個字串都原封不動在稿裡（程式用的 id、配置 id 除外）*/
    const SKIP=new Set(['layout','id','point','at','ids','item']), all=[]; const walk=(x,k)=>{ if(typeof x==='string'){ if(!SKIP.has(k)) all.push(x); } else if(Array.isArray(x)) x.forEach(v=>walk(v,k)); else if(x&&typeof x==='object') for(const kk of Object.keys(x)){ if(k==='labels'||k==='look') all.push(kk); walk(x[kk],kk); } };
    walk(T,''); const src=[]; const w2=x=>{ if(typeof x==='string') src.push(x); else if(Array.isArray(x)) x.forEach(w2); else if(x&&typeof x==='object') for(const kk of Object.keys(x)){ src.push(kk); w2(x[kk]); } }; w2(Object.assign({},A,{_meta:null}));
    const bad=all.filter(t=>!src.includes(t)); check('1 資料檔每一個字串都是稿裡完整的一句（'+all.length+' 個；沒有自己寫的字）',!bad.length&&all.length>=50,J(bad.slice(0,6)));
    /* 稿裡玩家看得到的每一句都在資料檔裡（沒有漏）*/
    const need=[A.shop.name,A.staff.who,A.staff.closed_line,A.staff.not_open,A.staff.no_money].concat(A.staff.greet,[C.button,C.ask,C.after],sids.map(id=>C.menu[id].name),[].concat(...sids.map(id=>C.menu[id].lines.map(l=>L2(l)[1]))),ids.map(id=>A.items[id].name),ids.map(id=>A.items[id].line),ks.map(k=>A.looks[k].button),ks.map(k=>A.looks[k].t),[A.seat.button,A.seat.sit,A.seat.wait,A.pick,A.cancel]);
    const miss=need.filter(t=>!all.includes(t)); check('1 稿裡玩家看得到的每一句都在資料檔（'+need.length+' 句；沒有漏）',!miss.length&&need.length===47,J([need.length,miss.slice(0,6)])); }
  let ck=null; try{ ck=cp.spawnSync('python3',['tools/shops/import_tz_grocery.py','--check'],{cwd:ROOT,encoding:'utf8'}); }catch(e){}
  if(!ck||ck.error) console.log('SKIP 1 沒有 python3（匯入工具 --check）'); else if(!raw) console.log('SKIP 1 匯入工具 --check（讀不到稿）'); else check('1 匯入工具 --check：資料檔＝稿匯出來的（走 import_guard 白名單）',ck.status===0,(ck.stdout+ck.stderr).trim().slice(0,200));
  const allow=JSON.parse(rd('docs/handoff/story_import_allow.json')).files; check('1 劇情匯入白名單有 AA_824（'+SHA+'、approved、approvedBy）',allow.some(e=>e.path===DOC&&e.sha===SHA&&e.status==='approved'&&e.approvedBy==='AA（TINGZHOU-SHOPS5-1110）'));
  check('1 資料檔記了來源（sha、稿）',J(TZ_GROCERY_LINES._src[Z])===J({sha:SHA,doc:DOC})); });

// ---- 2 營業時間 ----
await sec(2,()=>{ const d0=DK('2025-10-05');
  check('2 每天 11:00～21:30（稿「11:00～21:30」；一週七天）',[0,1,2,3,4,5,6].every(i=>!PLACES.isOpen(Z,10.98,d0+i)&&PLACES.isOpen(Z,11,d0+i)&&PLACES.isOpen(Z,21.48,d0+i)&&!PLACES.isOpen(Z,21.5,d0+i)&&!PLACES.isOpen(Z,3,d0+i)));
  check('2 名字「汀州聯通」、畫面上的時間、颱風假關、算汀州路（和旁邊幾間一樣）',PLACES.names[Z]==='汀州聯通'&&/11:00/.test(PLACES.hours[Z].text)&&/21:30/.test(PLACES.hours[Z].text)&&PLACES.hours[Z].shop===PLACES.hours.tz_dongnan.shop&&PLACES.typhoonShops.includes(Z)&&PLACES.base(Z)==='tingzhou',J(PLACES.hours[Z]));
  check('2 手機快速前往：汀州路・汀州聯通的店門口',PLACES.TZ_SHOPS.includes('liantong')&&!!PLACES.tzDoor('liantong')); });

// ---- 3 關門時按店門 ----
await sec(3,async()=>{ const door=async(key,h)=>{ fresh(key,h,'tingzhou'); const r=await STORY.interact({exit:{to:Z},label:'進'+T.name},GM); return {r,said:said(),t:toasts.slice()}; };
  /* AA_824 @ 2dd4ba0a9（AA-C 11-12 回 LAWWW 七問第 3 點）：補了 staff.closed_outside——打烊以後（到清晨 6 點）說這一句，開門以前（6 點到 11 點）才是 not_open */
  for(const h of [21.5,23,2,5.9,6,9,10.98]){ const x=await door('2025-10-07',h); const late=h>=21.5||h<6, NO=late?T.sign:T.notOpen;
    check('3 '+h+' 點按店門（關著）：'+(late?'打烊以後＝稿的 closed_outside':'開門以前＝稿的 not_open')+' 那一句（旁白）、不進去、寫開放時間',x.r===true&&J(x.said)===J([[null,NO]])&&!!T.sign&&T.sign!==T.notOpen&&!H.entered.length&&x.t.length===1&&/汀州聯通/.test(x.t[0])&&/11:00/.test(x.t[0])&&/21:30/.test(x.t[0]),J([x.said,x.t])); }
  for(const h of [11,15,21.4]){ const x=await door('2025-10-07',h); check('3 '+h+' 點開著：不擋',!x.said.length&&!x.t.length,J(x)); }
  { const TC=PLACES.typhoonClosed; PLACES.typhoonClosed=z=>PLACES.typhoonShops.includes(z);
    try{ const x=await door('2025-10-07',12); check('3 颱風假（稿上沒有那一句）：不說話、只寫「颱風假」',x.r===true&&!x.said.length&&/颱風假/.test(x.t[0]||''),J(x)); } finally { PLACES.typhoonClosed=TC; } }
  { fresh('2025-10-07',22,'tingzhou'); const x=GG3.doorLine('tz_dongnan',H.G); check('3 東南大聯商行打烊以後照舊（自己的 closed_outside，不是開門以前那一句）',!!x&&x.why==='sign'&&x.t===TZ_GROCERY_LINES.tz_dongnan.sign,J(x)); } });

// ---- 4 進門 ----
await sec(4,async()=>{ const D3=['你好，手機有問題嗎？還是看配件？','保護貼現場貼，十分鐘。','要修的話先放櫃台，我看一下。'];
  for(const [rv,i] of [[0,0],[0.5,1],[0.99,2]]){ const G=fresh('2025-10-07',12,Z); const due=GG3.doorDue(GM); GG3.rand=()=>rv; const r=await GG3.enterLine(GM);
    check(`4 一天第一次進來：店員「${D3[i]}」`,due&&r==='door'&&J(said())===J([[WHO,D3[i]]]),J(said()));
    if(i===0){ GM.enterN++; check('4 同一天再進來：不說',!GG3.doorDue(GM)); G.day++; GM.enterN++; check('4 隔天再進來：又說',GG3.doorDue(GM)); } }
  { fresh('2025-10-07',21.6,Z); check('4 關著的時候不說進門句',!GG3.doorDue(GM)); } });

// ---- 5 打烊 ----
await sec(5,async()=>{ { fresh('2025-10-07',21.6,Z); const r=await GG3.closeOut(GM);
    check('5 21:30 人還在店裡：店員「我們今天要打烊了。」一句、走到汀州路',r==='close'&&J(said())===J([[WHO,'我們今天要打烊了。']])&&T.close==='我們今天要打烊了。'&&H.entered[0]==='tingzhou',J([r,said(),H.entered])); }
  { fresh('2025-10-07',23.5,Z); const r=await GG3.closeOut(GM); check('5 讀檔回到打烊以後：不說、走出去、寫開放時間',r==='out'&&!H.said.length&&H.entered[0]==='tingzhou'&&toasts.length===1,J([r,said(),toasts])); }
  { const G=fresh('2025-10-07',21.4,Z); const a=GG3.tick(GM); await sleep(5); H.said=[]; G.hour=21.55; const b=GG3.tick(GM); await sleep(5);
    check('5 每 0.5 秒的檢查（GG3.tick）：開著的時候是進門句，過了 21:30 請你出來',a===true&&b===true&&H.has(T.close)&&H.entered[0]==='tingzhou',J([a,b,said(),H.entered])); }
  { const G=fresh('2025-10-07',21.4,Z); G.hour=21.6; E.player.seat={x:0.3,z:-0.95}; await GG3.closeOut(GM); check('5 坐在圓凳上打烊：站起來、走出去',E.player.seat===null&&H.entered[0]==='tingzhou'); } });

// ---- 6 看、貨架 ----
await sec(6,async()=>{ const LK={tz_liantong_cases:'（一整面牆的手機殼，照機型分成一排一排。最下面一排是打折的，都是舊機型。）',tz_liantong_phones:'（玻璃櫃裡擺著幾支展示機，每支旁邊一張手寫的價錢，後面多寫一行「可分期」。你沒有要換手機。）',
    tz_liantong_acc:'（充電線、充電頭、行動電源、耳機，一格一格掛著。有一格貼著紙條：「這條最耐用，店員自己也用」。）',tz_liantong_plan:'（牆上一張大海報，三種學生方案，數字寫得很大，底下的小字寫得很小。）'};
  const SH={tz_liantong_cases:['手機殼　390 元'],tz_liantong_acc:['充電線　250 元','充電頭　450 元','行動電源　790 元','有線耳機　320 元']};
  for(const kind of Object.keys(LK)){ const G=fresh('2025-10-07',12,Z); H.picks=['不用了']; const h0=G.hour, r=await press(kind);
    check('6 按「'+T.labels[kind]+'」：稿的那一句旁白'+(SH[kind]?' → 東西（名字＋價錢）＋不用了':'（只有這一句、沒有選單）')+'；不扣錢、時間不動',r===true&&J(said())===J([[null,LK[kind]]])&&(SH[kind]?H.opts.length===1&&J(Array.from(H.opts[0]))===J(SH[kind].concat(['不用了'])):!H.opts.length)&&G.money===5000&&near(G.hour,h0)&&!spent.length,J([said(),H.opts.map(o=>Array.from(o))])); }
  { fresh('2025-10-07',12,Z); const o0=GM.choose, hints=[]; GM.choose=async o=>{ for(const q of o) if(q.hint&&q.t!=='不用了') hints.push([q.t,q.hint]); return o0(o); };
    try{ for(const kind of Object.keys(SH)){ H.picks=['不用了']; await GG3.groceryShelf(GM,kind); } } finally { GM.choose=o0; }
    check('6 五樣東西的一句說明＝選項的提示（照稿）；保護貼（已貼）不在貨架上',J(hints)===J([['手機殼　390 元','透明的、霧面的、有掛繩的。牆上掛了一整面。'],['充電線　250 元','一公尺的。宿舍那條已經有點接觸不良了。'],['充電頭　450 元','小小一顆，插頭可以折起來。'],['行動電源　790 元','比手機小一點。店員說可以充兩次半。'],['有線耳機　320 元','有線的。不用充電，也不會掉一邊。']]),J(hints)); }
  { const G=fresh('2025-10-07',12,Z); await take('tz_liantong_acc',['充電線','有線耳機']);
    check('6 拿了充電線、有線耳機：稿的 pick「（你把它從掛勾上拿下來。）」每拿一樣一次；還沒扣錢；拿過的不再列',J(said())===J([[null,LK.tz_liantong_acc],[null,'（你把它從掛勾上拿下來。）'],[null,'（你把它從掛勾上拿下來。）']])&&G.money===5000&&!spent.length&&J(GG3.hand(GM))===J(['tz_lt_cable','tz_lt_earphone'])&&J(Array.from(H.opts[2]))===J(['充電頭　450 元','行動電源　790 元','不用了']),J([said(),H.opts.map(o=>Array.from(o))])); }
  { fresh('2025-10-07',12,Z); await take('tz_liantong_cases',['手機殼']); H.said=[]; H.opts=[]; H.picks=[]; await press('tz_liantong_cases'); check('6 手機殼拿了以後再按：只有「看」那一句、沒有選單',J(said())===J([[null,LK.tz_liantong_cases]])&&!H.opts.length,J([said(),H.opts.length])); } });

// ---- 7 櫃台的服務 ----
await sec(7,async()=>{
  { const G=fresh('2025-10-07',12,Z); E.interactables=[]; const h0=G.hour; const o0=GM.choose; let seen=null; GM.choose=async o=>{ seen=o; return o0(o); }; H.picks=['不用了']; let r; try{ r=await press('tz_liantong_counter'); } finally { GM.choose=o0; }
    check('7 按「找店員」：店員「今天要弄什麼？」→ 檢測手機／貼保護貼／問門號方案／不用了（手上沒東西＝沒有「買」）；提示＝幾元、幾分鐘',r===true&&J(said())===J([[WHO,ASK]])&&J(Array.from(H.opts[0]))===J(MENU.concat(['不用了']))&&J(seen.slice(0,3).map(o=>o.hint))===J(['0 元　10 分鐘','350 元　10 分鐘','0 元　5 分鐘'])&&!seen.some(o=>o.dim),J([said(),seen]));
    check('7 選「不用了」（手上沒東西）：沒有別的句子、不扣錢、時間不動',G.money===5000&&near(G.hour,h0)&&!spent.length&&H.said.length===1,J(said())); }
  { const G=fresh('2025-10-07',12,Z); E.interactables=[]; const h0=G.hour, r=await counter('檢測手機');
    check('7 檢測手機（沒有空的圓凳＝站著）：稿的三句照順序、店員 after 那一句；0 元（不扣錢）、時間 +10 分鐘；沒有 seat.wait',r==='檢測手機'&&J(said())===J([[WHO,ASK]].concat(CHECK,[[WHO,AFTER]]))&&G.money===5000&&!spent.length&&near(G.hour-h0,10/60)&&!sits.length&&!('GG3_OWN' in G.flags),J([r,said(),G.money,G.hour-h0])); }
  { const G=fresh('2025-10-07',12,Z); E.interactables=[]; const h0=G.hour, r=await counter('貼保護貼');
    check('7 貼保護貼（站著）：稿的三句、after；扣 350（記在汀州聯通）、時間 +10 分鐘',r==='貼保護貼'&&J(said())===J([[WHO,ASK]].concat(FILM,[[WHO,AFTER]]))&&G.money===4650&&J(spent)===J([[-350,'汀州聯通']])&&near(G.hour-h0,10/60),J([r,said(),G.money,spent,G.hour-h0]));
    check('7 貼了保護貼：「物品」有「保護貼（已貼）」（G.flags.GG3_OWN.tz_liantong.tz_lt_film＝1；選單 GG3.ownHTML：店名＋東西，都是稿的字）',J(G.flags.GG3_OWN)===J({tz_liantong:{tz_lt_film:1}})&&J(GG3.own(G))===J([{zone:Z,shop:'汀州聯通',items:[{id:'tz_lt_film',n:'保護貼（已貼）',count:1}]}])&&GG3.ownHTML(G)==='<div class="item"><b>汀州聯通</b><div>· 保護貼（已貼）</div></div>',J([G.flags.GG3_OWN,GG3.ownHTML(G)]));
    await counter('貼保護貼'); check('7 再貼一次：再扣 350、「物品」還是一份（不寫 ×2）',G.money===4300&&G.flags.GG3_OWN.tz_liantong.tz_lt_film===1&&!/×/.test(GG3.ownHTML(G)),J([G.money,G.flags.GG3_OWN]));
    const back=JSON.parse(JSON.stringify(G)); check('7 存檔（JSON）再讀回來：保護貼還在',GG3.ownHTML(back)===GG3.ownHTML(G)&&GG3.ownHTML(back)!==''); }
  { const G=fresh('2025-10-07',12,Z); const h0=G.hour; let ok=true; const out=[];
    for(let i=0;i<3;i++){ const r=await counter('問門號方案'); out.push(said()); ok=ok&&r==='問門號方案'&&J(said())===J([[WHO,ASK]].concat(PLAN)); }   /* 稿的 counter.after_skip:["plan"]（2dd4ba0a9）：問門號不接 counter.after，旁白就是結尾 */
    check('7 問門號方案：稿的兩句、不說 after（counter.after_skip）；0 元、一次 5 分鐘；可以一直問（連問三次每次一樣、時間 +15 分鐘）；站著、不演 seat.wait、沒有東西',ok&&G.money===5000&&!spent.length&&near(G.hour-h0,15/60)&&!sits.length&&!fades&&!out.some(s=>s.some(l=>l[1]===WAIT))&&!('GG3_OWN' in G.flags),J([out[2],G.hour-h0,sits.length])); }
  { const G=fresh('2025-10-07',12,Z); G.money=349; E.interactables=[]; const h0=G.hour; const o0=GM.choose; let seen=null; GM.choose=async o=>{ seen=o; return o0(o); }; let r; try{ r=await counter('貼保護貼'); } finally { GM.choose=o0; }
    check('7 錢不夠（349 元貼 350）：稿的 no_money 旁白、不扣錢、時間不動、沒有貼的句子、沒有 after、沒有保護貼；選項是灰的',r==='short'&&J(said())===J([[WHO,ASK],[null,NOMONEY]])&&G.money===349&&!spent.length&&near(G.hour,h0)&&!('GG3_OWN' in G.flags)&&seen[1].dim===true&&!seen[0].dim&&!seen[2].dim&&!toasts.length,J([r,said(),G.money]));
    const r2=await counter('檢測手機'); check('7 沒錢也可以檢測手機（0 元）',r2==='檢測手機'&&G.money===349&&H.has(CHECK[1][1]),J([r2,G.money]));
    G.money=350; const r3=await counter('貼保護貼'); check('7 剛好 350 元：貼得起',r3==='貼保護貼'&&G.money===0&&G.flags.GG3_OWN.tz_liantong.tz_lt_film===1,J([r3,G.money])); }
  check('7 做完那一句只有稿的一句（不隨機）',X.after.length===1&&X.after[0]===AFTER); });

// ---- 8 買配件 ----
await sec(8,async()=>{
  { const G=fresh('2025-10-07',12,Z); await take('tz_liantong_cases',['手機殼']); await take('tz_liantong_acc',['行動電源']); const h0=G.hour; const o0=GM.choose; let seen=null; GM.choose=async o=>{ seen=o; return o0(o); }; let r; try{ r=await counter('買'); } finally { GM.choose=o0; }
    check('8 手上有手機殼＋行動電源去櫃台：選單多「買」（提示：兩樣、共 1180 元）',J(Array.from(H.opts[0]))===J(MENU.concat(['買','不用了']))&&seen[3].hint==='手機殼、行動電源　共 1180 元'&&!seen[3].dim,J([Array.from(H.opts[0]),seen[3]]));
    check('8 買：扣 390＋790＝1180（記在汀州聯通）、時間 +'+GG3.HRS.buy+' 小時、店員 after 那一句',r==='手機殼、行動電源'&&G.money===3820&&J(spent)===J([[-1180,'汀州聯通']])&&near(G.hour-h0,GG3.HRS.buy)&&J(said())===J([[WHO,ASK],[WHO,AFTER]]),J([r,G.money,spent,said()]));
    check('8 買的東西進「物品」（順序照稿）',J(G.flags.GG3_OWN)===J({tz_liantong:{tz_lt_case:1,tz_lt_powerbank:1}})&&GG3.ownHTML(G)==='<div class="item"><b>汀州聯通</b><div>· 手機殼</div><div>· 行動電源</div></div>',J([G.flags.GG3_OWN,GG3.ownHTML(G)]));
    H.opts=[]; H.picks=['不用了']; await press('tz_liantong_counter'); check('8 買完手上空了：再找店員沒有「買」',J(Array.from(H.opts[0]))===J(MENU.concat(['不用了']))); }
  { const G=fresh('2025-10-07',12,Z); await take('tz_liantong_cases',['手機殼']); await take('tz_liantong_acc',['充電線','充電頭','行動電源','有線耳機']); await counter('買');
    check('8 五樣都買：扣 2200（390＋250＋450＋790＋320）',G.money===2800&&X.goods.filter(g=>!g.noBuy).reduce((a,g)=>a+g.p,0)===2200&&Object.keys(G.flags.GG3_OWN.tz_liantong).length===5&&!G.flags.GG3_OWN.tz_liantong.tz_lt_film,J([G.money,G.flags.GG3_OWN]));
    GM.enterN++; await take('tz_liantong_acc',['充電線']); await counter('買'); check('8 隔一趟再買一條充電線：×2',G.flags.GG3_OWN.tz_liantong.tz_lt_cable===2&&/充電線 ×2/.test(GG3.ownHTML(G)),GG3.ownHTML(G)); }
  { const G=fresh('2025-10-07',12,Z); G.money=700; await take('tz_liantong_acc',['行動電源']); const h0=G.hour, r=await counter('買');
    check('8 錢不夠（700 元買 790）：稿的 no_money 旁白、不扣錢、時間不動、沒有 after、沒進「物品」',r==='short'&&J(said())===J([[WHO,ASK],[null,NOMONEY]])&&G.money===700&&!spent.length&&near(G.hour,h0)&&!('GG3_OWN' in G.flags),J([r,said(),G.money]));
    H.opts=[]; H.picks=['不用了']; await press('tz_liantong_acc'); check('8 錢不夠以後東西掛回去了：配件櫃又拿得到行動電源',Array.from(H.opts[0]).includes('行動電源　790 元')&&!GG3.hand(GM).length,J(Array.from(H.opts[0]||[]))); }
  { const G=fresh('2025-10-07',12,Z); await take('tz_liantong_cases',['手機殼']); const h0=G.hour, r=await counter('不用了');
    check('8 手上有東西選「不用了」：稿的 cancel 旁白「（你把東西掛回去。）」；不扣錢、時間不動、沒有 after、沒進「物品」、手上空了',r===null&&J(said())===J([[WHO,ASK],[null,'（你把東西掛回去。）']])&&G.money===5000&&near(G.hour,h0)&&!('GG3_OWN' in G.flags)&&!GG3.hand(GM).length,J([r,said()])); }
  { const G=fresh('2025-10-07',12,Z); E.interactables=[]; await take('tz_liantong_cases',['手機殼']); await counter('檢測手機'); check('8 手上拿著東西先做檢測：東西還在手上、沒扣錢',J(GG3.hand(GM))===J(['tz_lt_case'])&&G.money===5000);
    await counter('買'); check('8 接著買：扣 390',G.money===4610&&G.flags.GG3_OWN.tz_liantong.tz_lt_case===1,J([G.money,G.flags.GG3_OWN])); } });

// ---- 9 座位 ----
await sec(9,async()=>{
  { fresh('2025-10-07',12,Z); await STORY.onSeat(GM,E.interactables[0].seat); check('9 自己坐到圓凳上：稿的 seat.sit 那一句旁白（一句）',J(said().filter(l=>l[1]===SIT))===J([[null,SIT]])&&!H.has(WAIT),J(said())); }
  for(const [nm,LN,cost] of [['檢測手機',CHECK,0],['貼保護貼',FILM,350]]){ const G=fresh('2025-10-07',12,Z); const h0=G.hour, r=await counter(nm);
    check('9 '+nm+'（圓凳有空位）：坐到圓凳上；第一句 → 稿的 seat.wait「（你坐著等。……）」→ 後面兩句 → after；時間 +10 分鐘、扣 '+cost+'；做完站起來；不演 seat.sit',
      r===nm&&sits.length===1&&LY.seats.some(q=>q.x===sits[0].x&&q.z===sits[0].z)&&J(said())===J([[WHO,ASK],LN[0],[null,WAIT],LN[1],LN[2],[WHO,AFTER]])&&near(G.hour-h0,10/60)&&G.money===5000-cost&&E.player.seat===null&&fades===4&&!H.has(SIT),J([r,sits.length,said(),fades])); }
  { const G=fresh('2025-10-07',12,Z); const st=E.interactables[1].seat; E.player.seat=st; const r=await counter('檢測手機');
    check('9 本來就坐在圓凳上做檢測：一樣演 seat.wait、不換位子、做完還坐著',r==='檢測手機'&&!sits.length&&J(said())===J([[WHO,ASK],CHECK[0],[null,WAIT],CHECK[1],CHECK[2],[WHO,AFTER]])&&E.player.seat===st,J([sits.length,said()])); E.player.seat=null; }
  { fresh('2025-10-07',12,Z); const F0=GM.freeSeat; GM.freeSeat=()=>null; let r; try{ r=await counter('貼保護貼'); } finally { if(F0) GM.freeSeat=F0; else delete GM.freeSeat; }
    check('9 兩張圓凳都有人：站著貼、不演 seat.wait（其他句子照舊）',r==='貼保護貼'&&!sits.length&&J(said())===J([[WHO,ASK]].concat(FILM,[[WHO,AFTER]])),J(said())); }
  check('9 配置的兩張圓凳：按鈕「坐著等」＝稿的 seat.button',LY.seats.length===2&&LY.seats.every(q=>q.label===T.seat.button)); });

// ---- 10 配置的點、存檔、原本的店照舊 ----
await sec(10,async()=>{ const miss=LY.points.filter(p=>!GG3.handles(Z,p.kind)).map(p=>p.kind);
  check('10 配置的五個點全部接上（counter／cases／phones／acc／plan）',!miss.length&&J(LY.points.map(p=>p.kind))===J(['tz_liantong_counter','tz_liantong_cases','tz_liantong_phones','tz_liantong_acc','tz_liantong_plan']),J(miss));
  check('10 配置的店員位置（0.8, −2.5）；稿的每一個「看」、櫃台、東西都對得到配置的點',LY.clerk.x===0.8&&LY.clerk.z===-2.5&&Object.keys(T.labels).every(k=>LY.points.some(p=>p.kind===k))&&X.goods.every(g=>LY.points.some(p=>p.kind===g.at)));
  check('10 流程：櫃台＝S.serviceCounter；手機殼、配件＝貨架；展示機、門號方案沒有自己的流程（只有「看」）',GG3.ACT.tz_liantong_counter===GG3.serviceCounter&&typeof GG3.ACT.tz_liantong_cases==='function'&&typeof GG3.ACT.tz_liantong_acc==='function'&&!GG3.ACT.tz_liantong_phones&&!GG3.ACT.tz_liantong_plan);
  { const G=fresh('2025-10-07',12,Z); const keys0=Object.keys(G).sort().join(), f0=Object.keys(G.flags).sort().join(); await take('tz_liantong_acc',['充電頭']); const snap=JSON.stringify(G); await counter('買'); await counter('貼保護貼'); await counter('問門號方案');
    check('10 手上的東西不在存檔裡；買、貼、問以後存檔只多 G.flags.GG3_OWN（G 最上層的欄位一樣；flags 只多這一個）',!/tz_lt_charger|充電頭/.test(snap)&&Object.keys(G).sort().join()===keys0&&Object.keys(G.flags).filter(k=>k!=='GG3_OWN').sort().join()===f0&&J(G.flags.GG3_OWN)===J({tz_liantong:{tz_lt_charger:1,tz_lt_film:1}}),J([Object.keys(G.flags),G.flags.GG3_OWN])); }
  { const G=fresh('2025-10-07',12,Z); await take('tz_liantong_cases',['手機殼']); GM.enterN++; H.opts=[]; H.picks=['不用了']; await press('tz_liantong_counter'); check('10 走出去再進來（另一趟）：手上沒有東西（沒有「買」）、沒扣錢',J(Array.from(H.opts[0]))===J(MENU.concat(['不用了']))&&G.money===5000); }
  { const G=fresh('2025-10-07',12,Z); check('10 舊存檔（沒有 GG3_OWN）：「物品」是空的、讀的時候不寫入',GG3.ownHTML(G)===''&&!('GG3_OWN' in G.flags)); G.flags.GG3_OWN={tz_liantong:{tz_lt_film:1,xx:3},tz_dongnan:{tz_dn_rice:2}};
    check('10 兩間店都買過：「物品」一間一格（東南大聯商行、汀州聯通）；稿裡沒有的 id 不列',GG3.ownHTML(G)==='<div class="item"><b>東南大聯商行</b><div>· 香米（一公斤） ×2</div></div><div class="item"><b>汀州聯通</b><div>· 保護貼（已貼）</div></div>',GG3.ownHTML(G)); }
  check('10 原本的店都還在、汀州聯通排在後面；東南大聯商行的結帳照舊',J(GG3.ZONES)===J(['gg_antai','gg_xianguo','gg_rongendian','tz_taimi','tz_xile','tz_yindehao','tz_yuehaochi','tz_keju','tz_dongnan',Z])&&/* 客居雲南：SHOP-LIFE-AA826-1112 */J(GG3.GROCERS)===J(['tz_dongnan',Z])&&GG3.ACT.tz_dongnan_counter===GG3.groceryPay&&!TZ_GROCERY_LINES.tz_dongnan.grocery.services,J(GG3.ZONES));
  { const G=fresh('2025-10-07',12,'tz_dongnan'); H.picks=['蝦餅','不用了']; await STORY.interact({tzPoint:'noodle',kind:'tz_dongnan_noodle',label:'x',look:'x'},GM); H.picks=['買']; await GG3.groceryPay(GM); check('10 東南大聯商行買蝦餅照舊（60 元）',G.money===4940&&J(G.flags.GG3_OWN)===J({tz_dongnan:{tz_dn_snack:1}}),J([G.money,G.flags.GG3_OWN])); }
  const html=rd('index.html'), at=f=>html.indexOf('src="'+f+'?v=');
  check('10 index.html 載入資料檔（GG3 前面）',at(DATA)>0&&at(DATA)<at('src/gg3shops3d.js'));
  const bad=[]; for(const f of ['src/gg3shops3d.js',DATA,'src/data/places.js']){ const r=cp.spawnSync(process.execPath,['--check',path.join(ROOT,f)],{encoding:'utf8'}); if(r.status!==0) bad.push(f+' '+r.stderr.slice(0,160)); }
  check('10 node --check',!bad.length,J(bad)); });

// ---- 11 子程序 A：真正的區域 ----
{ const r=cp.spawnSync(process.execPath,[__filename,'A'],{encoding:'utf8',maxBuffer:1<<26}); const out=(r.stdout||'').split('\n').filter(l=>/^(PASS|FAIL) /.test(l)); for(const l of out) check(l.replace(/^(PASS|FAIL) /,''),/^PASS /.test(l));
  check('11 子程序 A 跑完（'+out.length+' 項）',r.status===0&&out.length>=7,(r.stderr||'').slice(0,300)); }
H.done();
})();
}
