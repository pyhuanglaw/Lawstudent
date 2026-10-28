// 約以安「現在一起過去」阿鳳麵店：吃完卡在她說話的畫面、讀檔回來她一直跟著、跟她說話沒有「約她去…」（BUG-AN-NOODLE-STUCK-1027）——不需要瀏覽器。
// 使用者 2026-10-27 20:3x（存檔 day 14，2025-09-30 週二）：「跟沈以安吃完飯卡住在她說話的畫面 而且沒辦法約她到其他地方玩?沒有選項 其他人就算沒這麼熟也會有選項」；
//   20:4x：「我用存檔後重新讀存檔方式進入遊戲 沈以安跟我吃完飯會一直跟著我」「約沈以安吃麵那次 卡對話存檔重新讀取回來 紀錄是我沒有去吃麵 所以重新讀取她才跟著我」。
// 原因（src/invites3d.js）：一起走到的 S.arrive 走進門以後先等 0.9 秒才開演、約好的時間兩個人都在的 S.autoStart 用 Promise.then 延後才開演，兩個都沒有先 sceneBegin——
//   這段空檔玩家按「和她說話」、同一格的 EVENTS.tick（自動事件）都會另外開一段；GM.say 只留一個等點擊的 resolve（game3d.js），先開始的那一段被蓋掉、永遠等不到。
//   換區域的自動存檔（game3d.js enter：STORY.onEnter 之後馬上 autosave）也存成「人在麵店、還在一起走過去」；讀檔不走 S.arrive＝她一直跟著（作息 follow）、
//   一起走的路上本來就不列「約她去…」、兩小時後記成「作罷」。
// 這裡的假 GM 照 game3d.js 的規則：sceneBegin／sceneEnd 計層數、玩家 busy；GM.say 只留一個 resolve（新的一句蓋掉還沒點的那一句＝被蓋掉的那一段停住）；
//   玩家只有不 busy、沒有對話的時候按得到「和她說話」（game3d.js updateInteract）；每一格＝STORY.tick 的 INV.tick（玩家空下來才跑）＋ game3d.js 的 EVENTS.tick。
//   1. day 14：一起走進麵店，0.9 秒內按「和沈以安說話」——改前：說話那一段被見面蓋掉、演完停在第 1 層（使用者看到的）；改後：走進門就鎖住，按不到，見面演完、她不再跟著
//   2. 換區域的自動存檔：改前存成「在麵店、going」；改後走進門那一刻不存，見面演完才存（done）
//   1b. 更早一點：走進門、淡入的時候（還沒走到 S.arrive）就按了「和沈以安說話」——那一段先演完，再開始見面（改前兩段一起演、說話那一段停住）
//   3. day 9（10-23 那筆 _stuck：X.run）：約好 17:30 麵店，進門時阿哲長桌（自動事件）也成立——改前同一格兩段一起開演、一段停住；改後先演見面、再演長桌，兩段都演完
//   4. 讀「途中存的檔」（在麵店、iv13 還是 going）：改前她一直跟著、跟她說話沒有「約她去…」、兩小時後作罷（紀錄是沒去吃麵）；改後玩家空下來就照走到了開始，見面、done，之後約得到她
//   5. 讀「途中存的檔」（還在公館、going）：照舊跟著走；走進麵店照常見面（不壞掉原本的一起走過去）
// 修改前（開發分支 3240d3802、v9.10.11 候選 f54a35ec4、線上 v9.10.10 的 invites3d.js 都一樣）：1、1b、2、3、4 FAIL。用法：node tests/inv_arrive_lock_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){}, createElement:()=>({style:{},getContext:()=>null}) }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>'globalThis.'+n+'='); vm.runInThisContext(src,{filename:f}); };
const FILES=['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/data/needed_msgs.js',
  'src/romance3d.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/data/invite_replies.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js',
  'src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js','src/data/termend_lines.js','src/termend3d.js','src/story3d.js','src/classes3d.js','src/data/date_wish.js','src/wish3d.js','src/data/eat_lines.js','src/eat3d.js'];
for(const f of FILES) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const warn0=console.warn; console.warn=(...a)=>{ if(process.env.INV_LOCK_VERBOSE) warn0(...a); };
/* ---------- 照 game3d.js 的假 GM ---------- */
global.ADV={active:false,preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},cg(){},narrate(){},setBg(){},hide(){},slots:{}};
global.CHAR={setExpr(){}}; global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
const mkObj=(x,z)=>({position:{x:x||0,y:0,z:z||0,set(a,b,c){ this.x=a; this.y=b; this.z=c; }},rotation:{y:0},userData:{}});
let G=null; const D={active:false,resolve:null,busyDepth:0,busyWho:[]};
const E={q:{level:'medium'},player:{busy:false,obj:mkObj(0,3),lv:0,seat:null,pose:'idle'},zone:null,npcs:[],interactables:[],levels:null,setWeather(){},hour:0,endCinematic(){},cinematic(){}};
const log={said:[],orphans:[],saves:[],opts:[]}; const chooseQ=[];
const GM={get G(){ return G; },E,D,npc:{},extras:[],running:true,
  sceneBegin(o){ D.busyDepth++; D.busyWho.push(((new Error().stack||'').split('\n')[2]||'?').trim().slice(0,80)); E.player.busy=true; if(o&&o.adv) ADV.begin({right:o.adv}); },
  sceneEnd(){ D.busyDepth=Math.max(0,D.busyDepth-1); D.busyWho.pop(); if(D.busyDepth===0){ E.player.busy=false; if(ADV.active) ADV.end(); } },
  say(who,t){ return new Promise(res=>{ if(D.resolve) log.orphans.push(String(t).slice(0,30)); D.active=true; D.resolve=res; log.said.push((who&&who.name?who.name+'：':'')+t); }); },   /* game3d.js say：D.resolve=res（蓋掉還沒點的那一句）*/
  choose(o){ log.opts.push(o.map(q=>q.t)); return new Promise(res=>{ chooseQ.push({o,res}); }); },
  autosave(){ if(D.busyDepth>0) return; log.saves.push({zone:G.zone,hour:+G.hour.toFixed(3),iv:(G.invites||[]).map(v=>v.id+':'+v.state).join(',')}); },   /* game3d.js autosave：劇情中（busyDepth>0）不存 */
  fade:()=>Promise.resolve(),sleep:ms=>new Promise(r=>setTimeout(r,Math.min(ms|0,5))),advance(h){ G.hour+=h; },caption(){},toast(){},memo(){},addNote(){},letterbox(){},setGoal(){},rel(){},energy(){},money(){},phoneBadge(){},updateHUD(){},
  face(){},cine(){},walkTo:()=>Promise.resolve(true),titleCard:async()=>{},despawnLater(){},removeNPC(id){ const n=GM.npc[id]; if(n){ E.npcs=E.npcs.filter(m=>m!==n); delete GM.npc[id]; } },
  sitAt(ent,st){ ent.seat=st; ent.pose='sit'; if(ent.obj){ ent.obj.position.x=st.x; ent.obj.position.z=st.z; } },standUp(ent){ ent.seat=null; ent.pose='idle'; },
  spawnCharacter(id,x,z,o){ if(GM.npc[id]) return GM.npc[id]; const n=Object.assign({id,charId:id,name:id,obj:mkObj(x,z),lv:0,beh:'idle',pose:'idle'},o||{}); n.talk=nn=>STORY.talkCharacter(id,nn); GM.npc[id]=n; E.npcs.push(n); return n; }};
const tap=()=>{ if(chooseQ.length){ const c=chooseQ.pop(); const i=c.o.findIndex(q=>/就這樣|算了|不用了/.test(q.t)); c.res(i>=0?i:0); return true; }   /* 選單：不另外約（「就這樣」），其他選第一個 */
  if(D.active&&D.resolve){ const r=D.resolve; D.resolve=null; D.active=false; r(); return true; } return false; };
const canTalk=()=>!E.player.busy&&!D.active;   /* game3d.js updateInteract：busy 或對話中＝互動鍵收起來 */
const frame=()=>{ if(!E.player.busy&&!D.active) INV.tick(GM); if(EVENTS.tick&&G.social) EVENTS.tick(15); };   /* 每 30 格：STORY.tick（玩家空下來才跑，裡面有 INV.tick）→ EVENTS.tick */
const turn=()=>new Promise(r=>setTimeout(r,2));
/* 跑到安靜下來：每一輪先跑一格、等非同步、玩家點一下；連續 20 輪沒有東西可點、也沒有劇情在演＝結束 */
async function play(maxTurns,opt){ opt=opt||{}; let idle=0; for(let i=0;i<maxTurns;i++){ if(!opt.noFrames) frame(); await turn(); await turn(); if(tap()) idle=0; else if(++idle>=20&&!chooseQ.length) break; } }
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const DK=k=>STORY.dayOfKey(k);
/* 使用者存檔的關係（以安 fam45／trust18／comf16、FIRST_MET；語彤、阿哲認識）、旗標（法律系、開場完、和可昕交往中）*/
function fresh(key,hour,zone){ const day=DK(key); G={v:3,stage:'law',name:'祐廷',day,hour,zone,weekday:wdOf(day),weather:'clear',energy:100,money:41275,
    flags:{dating_kexin:true,KX_DEC3_MIGRATED:true,KX_FIRST_MSG:true,FAM_GROUP_SENT:true,introDone:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,classDone:true,metAn:true,met_an:true,met_heroine_01:true,afternoonDone:true,anAfter:true,companion:null,met_zhe:true,zheInvite:true,zheNoodleDone:true,met_heroine_03:true,campusIntro:true},
    choices:{},events:{done:{},last:{},count:0},rel:{},social:null,stats:{classes:0},invites:[],msgs:[],contacts:{heroine_01:2},invSeq:13};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); if(typeof ROM!=='undefined'&&ROM.rec) ROM.rec(G); STORY._bindGM(GM);
  const R=(id,f,t,c)=>{ const r=SOCIAL.rel(id); r.fam=f; r.trust=t; r.comf=c; SOCIAL.remember(id,'FIRST_MET','campus'); };
  R('heroine_01',45,18,16); R('zhe',19,11,0); R('heroine_03',25,2,10);
  D.active=false; D.resolve=null; D.busyDepth=0; D.busyWho=[]; E.player.busy=false; E.player.seat=null; E.player.obj=mkObj(0,3); ADV.active=false;
  E.npcs=[]; GM.npc={}; chooseQ.length=0; log.said=[]; log.orphans=[]; log.saves=[]; log.opts=[];
  E.zone={seats:[{x:-3,z:-0.3,yaw:0,lv:0},{x:-3,z:1.3,yaw:Math.PI,lv:0},{x:3,z:-0.3,yaw:0,lv:0},{x:3,z:1.3,yaw:Math.PI,lv:0}],roomAt:()=>null,spawn:{x:0,z:3.4}};   /* 麵店：一張桌子兩個位子面對面、相距 1.6 m */
  return G; }
const going=(G,h)=>{ const iv={id:'iv13',who:'heroine_01',place:'noodle',zone:'noodle',day:G.day,h,state:'going',accepted:true,by:'player',now:true,label:'和沈以安約在阿鳳麵店',kxd:1}; G.invites.push(iv); G.msgs.push({day:G.day,h,who:'heroine_01',text:'和沈以安一起去阿鳳麵店吃飯。',iv:'iv13'}); return iv; };
const anFollow=()=>{ const n=GM.spawnCharacter('heroine_01',0.4,3.8,{beh:'follow'}); n.followOff=1.1; return n; };
const metMsg=G=>(G.msgs||[]).some(m=>m.iv==='iv13'&&m.text==='和沈以安在阿鳳麵店。');
const st=()=>JSON.stringify({depth:D.busyDepth,who:D.busyWho,orphans:log.orphans,adv:ADV.active,iv:(G.invites||[]).map(v=>v.id+':'+v.state)});
/* 跟她說話的選單有沒有「約她去…」（STORY.offerInvite，talkCharacter 最後那一段）*/
async function inviteOpts(n){ const k0=log.opts.length; const p=STORY.offerInvite(GM,'heroine_01',n); await turn(); const o=log.opts.slice(k0); while(tap()) await turn(); await p; return o.length?o[0]:[]; }

(async()=>{
  check('0. 有 INV.arrive、INV.autoStart、STORY.talkCharacter、EVENTS.tick；麵店是吃飯的地點（stay 0.75）',typeof INV.arrive==='function'&&typeof INV.autoStart==='function'&&typeof STORY.talkCharacter==='function'&&typeof EVENTS.tick==='function'&&(INV.place('noodle')||{}).stay===0.75);
  /* ---------- 1、2 day 14：一起走進麵店，0.9 秒內按「和沈以安說話」 ---------- */
  { fresh('2025-09-30',16.807,'noodle'); const iv=going(G,16.68); const an=anFollow();
    check('1 前置：2025-09-30 週二 16:48、iv13 一起走過去（going）、以安照作息跟著（entryFor follow）',G.weekday===2&&(INV.entryFor(G,'heroine_01')||{}).act==='follow'&&an.beh==='follow');
    const pEnter=STORY.onEnter('noodle',GM,{}); GM.autosave();   /* game3d.js enter：STORY.onEnter（不等）→ autosave */
    const entrySave=log.saves.slice();
    let talked=false; if(canTalk()){ talked=true; void STORY.talkCharacter('heroine_01',an); }   /* 走進門馬上按「和沈以安說話」（她就在旁邊 0.6 m）*/
    await play(400); await Promise.race([pEnter,turn()]);
    check('1. 走進門那一刻就鎖住：玩家 busy、按不到「和沈以安說話」（改前按得到，說話那一段和見面一起演）',!talked,talked?'按到了':'');
    check('1. 見面演完、沒有哪一段停住：劇情層數回到 0、沒有被蓋掉的對話、ADV 關了（改前停在第 1 層 S.talkCharacter＝使用者看到的「卡在她說話的畫面」）',D.busyDepth===0&&!log.orphans.length&&!ADV.active,st());
    check('1. 吃過了：iv13 done、訊息「和沈以安在阿鳳麵店。」、時間過了 45 分鐘',iv.state==='done'&&metMsg(G)&&Math.abs(G.hour-(iv.h+0.75))<0.02,JSON.stringify({st:iv.state,h:iv.h,hour:G.hour,msg:metMsg(G)}));
    check('1. 吃完她不再跟著（beh 不是 follow、作息不再是 follow）',an.beh!=='follow'&&!((INV.entryFor(G,'heroine_01')||{}).act==='follow'),JSON.stringify({beh:an.beh,e:INV.entryFor(G,'heroine_01')}));
    check('2. 換區域的自動存檔不存成「在麵店、還在一起走過去」（改前存了：讀回來她一直跟著）',!entrySave.some(s=>s.zone==='noodle'&&/iv13:going/.test(s.iv)),JSON.stringify(entrySave));
    check('2. 見面演完以後自動存檔（done）',log.saves.length>0&&/iv13:done/.test(log.saves[log.saves.length-1].iv),JSON.stringify(log.saves));
    const o=await inviteOpts(an);
    check('1. 吃完再跟她說話：有「約她去…」（使用者：「沒辦法約她到其他地方玩?沒有選項」）',o.some(t=>/^約她去/.test(t)),JSON.stringify(o)); }
  /* ---------- 1b 淡入的時候（S.arrive 鎖住以前）就按了「和沈以安說話」 ---------- */
  { fresh('2025-09-30',16.807,'noodle'); const iv=going(G,16.68); const an=anFollow();
    void STORY.talkCharacter('heroine_01',an); await turn();   /* game3d.js enter：淡入（await fade(false)）的時候互動鍵已經出來了，玩家先按到 */
    const talkLine=log.said.slice(-1)[0]||'';
    const pEnter=STORY.onEnter('noodle',GM,{}); GM.autosave();
    await play(500); await Promise.race([pEnter,turn()]);
    check('1b. 先開始的說話演完、再見面：沒有被蓋掉的對話、劇情層數回到 0、ADV 關了（改前說話那一段停住）',D.busyDepth===0&&!log.orphans.length&&!ADV.active,st()+' 說話：'+talkLine);
    check('1b. 見面照樣演完（done、「和沈以安在阿鳳麵店。」）、她不再跟著',iv.state==='done'&&metMsg(G)&&an.beh!=='follow',JSON.stringify({st:iv.state,msg:metMsg(G),beh:an.beh})); }
  /* ---------- 3 day 9：約好 17:30 麵店，進門時阿哲長桌也成立（同一格 autoStart＋EVENTS.tick）---------- */
  { fresh('2025-09-25',17.6,'noodle'); delete G.flags.zheNoodleDone;
    const iv=INV.accept(G,'heroine_01','noodle',G.day,17.5,{by:'player'}); const an=GM.spawnCharacter('heroine_01',-3,-0.3,{pose:'sit'}); an.seat=E.zone.seats[0];
    const zhe=GM.spawnCharacter('zhe',1,2.5,{});
    const ev=STORY_EVENTS.find(e=>e.id==='ev_zhe_long_table');
    check('3 前置：2025-09-25 週四 17:36、約好 17:30 麵店（accepted）、以安在、阿哲長桌（自動事件）這時候成立',G.weekday===4&&iv.state==='accepted'&&!!ev&&EVENTS.check(ev),JSON.stringify({wd:G.weekday,ev:!!ev}));
    frame();   /* 同一格：INV.tick（autoStart）→ EVENTS.tick */
    await play(600);
    check('3. 兩段都演完、沒有哪一段停住（改前同一格一起開演：被蓋掉的那一段停住＝10-23 day 9 的 _stuck「X.run」）',D.busyDepth===0&&!log.orphans.length,st());
    check('3. 見面（iv done、「和沈以安在阿鳳麵店。」）和阿哲長桌（noodleTableDay）都有',iv.state==='done'&&(G.msgs||[]).some(m=>m.iv===iv.id&&m.text==='和沈以安在阿鳳麵店。')&&G.flags.noodleTableDay===G.day&&!!(G.events.done||{}).ev_zhe_long_table,JSON.stringify({st:iv.state,ndl:G.flags.noodleTableDay,ev:(G.events.done||{}).ev_zhe_long_table})); }
  /* ---------- 4 讀「途中存的檔」：在麵店、iv13 還是 going（換區域那一刻的自動存檔）---------- */
  { fresh('2025-09-30',16.81,'noodle'); const iv=going(G,16.68); const an=anFollow();   /* 讀檔：S.onEnter 的 fromLoad 不走 S.arrive；作息照 entryFor 把她生成跟著 */
    check('4 前置：讀檔回來在麵店、iv13 going、她跟著（使用者：「重新讀取她才跟著我」）',(INV.entryFor(G,'heroine_01')||{}).act==='follow'&&an.beh==='follow');
    await play(400);
    check('4. 玩家空下來就照「走到了」開始：見面演完、iv13 done、「和沈以安在阿鳳麵店。」（改前一直是 going、她一直跟著）',iv.state==='done'&&metMsg(G)&&D.busyDepth===0&&!log.orphans.length,JSON.stringify({st:iv.state,msg:metMsg(G),depth:D.busyDepth}));
    check('4. 之後她不再跟著',an.beh!=='follow'&&!((INV.entryFor(G,'heroine_01')||{}).act==='follow'),JSON.stringify({beh:an.beh}));
    const o=await inviteOpts(an);
    check('4. 跟她說話有「約她去…」（改前一直跟著的時候沒有任何選項）',o.some(t=>/^約她去/.test(t)),JSON.stringify(o));
    G.hour=iv.h+2.1; INV.tick(GM);
    check('4. 兩小時後不會再記成「作罷」（紀錄是吃過了，不是沒去）',iv.state==='done'&&!(G.msgs||[]).some(m=>m.iv==='iv13'&&/作罷/.test(m.text)),JSON.stringify({st:iv.state})); }
  /* ---------- 5 讀「途中存的檔」：還在公館、going ---------- */
  { fresh('2025-09-30',16.75,'gongguan'); const iv=going(G,16.68); const an=anFollow();
    await play(60);
    check('5. 還沒到麵店：照舊一起走（going、跟著），不會在公館就開始',iv.state==='going'&&an.beh==='follow'&&D.busyDepth===0,JSON.stringify({st:iv.state,beh:an.beh}));
    G.zone='noodle'; const p=STORY.onEnter('noodle',GM,{}); await play(400); await Promise.race([p,turn()]);
    check('5. 走進麵店：照常見面（done、「和沈以安在阿鳳麵店。」）、沒有停住',iv.state==='done'&&metMsg(G)&&D.busyDepth===0&&!log.orphans.length,st()); }
  /* AA_489 第 5 節：這一趟已經和以安在麵店吃過（約的那一筆 done、同一天、兩小時內）＝她那句換成「你吃完了？我才剛到。……還在看菜單。」*/
  { const g=h=>({day:14,hour:h,invites:[{id:'iv13',who:'heroine_01',place:'noodle',state:'done',day:14,h:16.8}]});
    check('6. AA_489：吃過以後兩小時內＝換句；之前、兩小時以後、別天、沒去成（going）＝照原句',typeof STORY.anAteNoodle==='function'&&STORY.anAteNoodle(g(17.9))&&!STORY.anAteNoodle(g(19.2))&&!STORY.anAteNoodle(g(16.5))&&!STORY.anAteNoodle(Object.assign(g(17.5),{day:15}))&&!STORY.anAteNoodle({day:14,hour:17.5,invites:[{who:'heroine_01',place:'noodle',state:'going',day:14,h:16.8}]})&&STORY.AN_MENU_AFTER==='你吃完了？我才剛到。……還在看菜單。'
      &&/if\(id==='heroine_01'&&g===S\.AN_MENU&&S\.anAteNoodle\(G\)\) g=S\.AN_MENU_AFTER;/.test(require('fs').readFileSync(require('path').join(__dirname,'../src/story3d.js'),'utf8'))); }
  console.warn=warn0;
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.warn=warn0; console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });
