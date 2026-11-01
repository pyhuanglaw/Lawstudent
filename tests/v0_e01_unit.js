// v0 E01「宿舍第一晚」（AA_168，含 cdaf8a9f 兩處修改）——不需要瀏覽器。
// 檢查：經濟系開局的標題卡「2024 年 9 月 1 日（日）／開學前一天」；21:00 三句旁白 → 媽媽的訊息（寫進手機）→ 阿勳進門、自我介紹 → 「被子在最下面那一箱」兩個選項（熟悉 +2；AA_305 第 2 節拿掉冷笑話）
//       → 22:00 先睡（07:00 起床）／拆完（自在 +1、02:00 睡＝01:00 以後才睡、07:40 起床）→ 起床阿勳那一句（兩版）；先睡的玩家 9/2 晚上「箱子拆完」那一句；
//       演到一半關掉遊戲（E01_DONE 還沒記）下次在房間裡從頭演；換日標題寫日期；經濟系那一年房間裡是阿勳不是阿凱；門牌 412。
// 修改前：沒有 STORY.y0FirstNight（第 1 項就失敗）。用法：node tests/v0_e01_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); said=[]; opts=[]; picks=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; if(STORY._fy) STORY._fy.reset(); };
const R=(id,fam,trust,comf)=>{ const r=SOCIAL.rel(id); r.fam=fam; r.trust=trust||0; r.comf=comf||0; };
const LV={ACQ:[10],FAM:[25],FRI:[45,30],CLO:[65,50,45]};
const run=(h0,h1,st)=>{ st=st||0.05; for(let h=h0;h<=h1+1e-9;h+=st){ G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(G); } };
const termDay=(term,w,wd)=>STORY.termDay(term,w,wd);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
const TH=(th)=>(G.msgs||[]).filter(m=>m.th===th);
const txt=(th)=>TH(th).map(m=>(m.from||'')+':'+m.text);
E.endCinematic=()=>{}; E.player.obj.position=E.player.obj.position||{x:0,y:0,z:0}; GM.hideHUD=()=>{};
GM.spawnCharacter=(id,x,z,o)=>{ if(GM.npc[id]) return GM.npc[id]; const n={charId:id,obj:{position:{x,y:0,z}},seat:o&&o.seat||null,pose:o&&o.pose||'idle'}; GM.npc[id]=n; return n; };
const cards=[]; GM.titleCard=async(a,b)=>{ cards.push(a+'｜'+(b||'')); };
const XUN='econ_zhengxun';
(async()=>{
  check('1. 有 STORY.y0FirstNight、y0Morning、y0Tick、dayTitle',['y0FirstNight','y0Morning','y0Tick','dayTitle'].every(k=>typeof STORY[k]==='function'));
  if(fails){ console.log('FAILED '+fails); process.exit(1); }
  const Y0=STORY.y0Day1();
  const start=async(pk)=>{ fresh(Y0,21,'dorm',{}); G.flags={}; G.stage='law'; cards.length=0; picks=pk.slice(); await STORY.newGameEcon(GM,{camp:false}); return lines(); };   /* 舊的 9/1 起點（第 7 組以前的開發局；宿營版另測 v0_g7_unit）*/
  // 先睡
  { const L=await start(['怎麼知道','先睡']);
    check('2. 標題卡「2024 年 9 月 1 日（日）｜開學前一天」',cards[0]==='2024 年 9 月 1 日（日）｜開學前一天',cards.join(' / '));
    check('2. 21:00 旁白（四樓 412、三個紙箱疊在書桌上、先拆被子、另外兩組床桌空著貼名字；AA_208 第 3、6 節四人房）',L[0]==='開學前一天，晚上九點。男生宿舍四樓，四一二。'&&L[1]==='媽媽傍晚才走。她把三個紙箱疊在你的書桌上。'&&L[2]==='她說：「先拆被子。」被子在最下面那一箱。'&&L[3]==='（另外兩組床桌還是空的，上舖的床架上貼著名字：韋綸、唐睿。）',JSON.stringify(L.slice(0,4)));
    check('2. 媽媽的訊息「到了要記得吃晚餐。」（演完也寫進手機的對話串）＋「你已經吃過了。媽媽也知道。」',L[4]==='媽媽（手機）：到了要記得吃晚餐。'&&L[5]==='你已經吃過了。媽媽也知道。'&&(G.msgs||[]).some(m=>m.th==='p:mom'&&m.text==='到了要記得吃晚餐。'),JSON.stringify(L.slice(4,6)));
    check('2. 阿勳進門、自我介紹（盧正勳，經濟系；叫起來像在點名）；祐廷：我叫{name}',L.includes('阿勳：你好。盧正勳，經濟系。')&&L.includes('阿勳：叫我阿勳就好。')&&L.some(t=>t==='祐廷：我叫{name}。也是經濟系。'),JSON.stringify(L.slice(5,9)));
    check('2. 被子選項「「你怎麼知道？」」「「……對。」」（AA_305 第 2 節）',opts[0].join()==='「你怎麼知道？」,「……對。」');
    check('2. 「你怎麼知道？」：「每個人都這樣裝。」；臉盆放好以後直接接「被子在最下面那一箱」（AA_305 第 2 節：三個箱子的冷笑話拿掉）',L.includes('阿勳：每個人都這樣裝。')&&L[L.indexOf('他把臉盆放好，看了你的紙箱第二眼。')+1]==='阿勳：被子在最下面那一箱，對不對。'&&!L.some(t=>t.includes('成功率')||t.includes('三個箱子嗎')));
    check('2. 阿勳熟悉 +2（第一次見面以外，事件數值）、認識了',SOCIAL.rel(XUN).fam>=2&&SOCIAL.stage(XUN)!=='STRANGER',JSON.stringify(SOCIAL.rel(XUN)));
    check('2. 22:00：「十點了。被子鋪好了，地上還有兩個箱子沒拆。」選項「先睡。明天再拆。」「今天拆完。」',L.includes('十點了。被子鋪好了，地上還有兩個箱子沒拆。')&&opts[1].join()==='先睡。明天再拆。,今天拆完。');
    check('2. 先睡：E01_NIGHT sleep、E01_DONE；旁白「燈還沒關，你就睡著了」',G.flags.E01_NIGHT==='sleep'&&G.flags.E01_DONE===true&&L.includes('你把兩個箱子推到書桌旁邊的地上。燈還沒關，你就睡著了。'));
    check('3. 隔天 9/2 07:00 起床；換日標題寫日期「9 月 2 日」（不是第 −379 天）',G.day===Y0+1&&Math.abs(G.hour-7)<1e-6&&cards.some(c=>c.startsWith('9 月 2 日｜')),G.day+' '+G.hour+' '+cards.join(' / '));
    check('3. 起床：阿勳「你昨天十點就睡了。」「經原九點十分，在博思。」',L.includes('阿勳：你昨天十點就睡了。')&&L.includes('阿勳：經原九點十分，在博思。')&&G.flags.E01_MORNING===true);
    check('3. 先睡的那晚不算 01:00 以後才睡',!(G.daily&&G.daily.lateNight===G.day));
    said=[]; G.hour=18; G.zone='dorm'; STORY.y0Tick(GM); await new Promise(r=>setTimeout(r,10));
    check('4. 先睡的玩家 9/2 晚上回房間：「你終於把箱子拆完了。阿勳幫你把空箱子壓扁，拿去樓下回收。」一次，接著「（韋綸和唐睿搬進來了。…）」（AA_208 第 3 節）',lines().includes('你終於把箱子拆完了。阿勳幫你把空箱子壓扁，拿去樓下回收。')&&lines().indexOf('（韋綸和唐睿搬進來了。韋綸的東西比三個人加起來還多。）')===lines().indexOf('你終於把箱子拆完了。阿勳幫你把空箱子壓扁，拿去樓下回收。')+1&&G.flags.E01_BOXES===true);
    said=[]; STORY.y0Tick(GM); await new Promise(r=>setTimeout(r,10)); check('4. 不再說第二次',!lines().length); }
  // 拆完
  { const L=await start(['……對','拆完']);
    check('5. 「……對。」：阿勳「（點頭）每個人都這樣。」（AA_305 第 2 節）',L.includes('阿勳：（點頭）每個人都這樣。')&&!L.includes('阿勳：每個人都這樣裝。')&&!L.some(t=>t.includes('危險的室友')));
    check('5. 拆完：三句旁白（阿勳已經躺下了——BB-B 改的那句；桌燈照著你；兩點）',L.includes('你拆到第三箱的時候，阿勳已經躺下了。')&&L.includes('他的桌燈沒有關。他把燈轉過來，照著你那一邊。')&&L.includes('最後一本書放上書架，是兩點。'));
    check('5. 拆完：E01_NIGHT unpack、阿勳自在 +1',G.flags.E01_NIGHT==='unpack'&&SOCIAL.rel(XUN).comf>=1,JSON.stringify(SOCIAL.rel(XUN)));
    check('5. 隔天 07:40 起床；那晚算「01:00 以後才睡」',G.day===Y0+1&&Math.abs(G.hour-(7+40/60))<1e-6&&G.daily&&G.daily.lateNight===G.day,G.hour+' '+JSON.stringify(G.daily));
    check('5. 起床：「你拆到兩點。」「你的鬧鐘響了兩次。它快七分鐘，我剛剛對過。」',L.includes('阿勳：你拆到兩點。')&&L.includes('阿勳：你的鬧鐘響了兩次。它快七分鐘，我剛剛對過。'));
    said=[]; G.hour=18; STORY.y0Tick(GM); await new Promise(r=>setTimeout(r,10)); check('5. 拆完的玩家沒有「箱子拆完」那一句',!lines().some(t=>t.indexOf('箱子拆完')>=0)); }
  // 演到一半關掉
  { fresh(Y0,21.5,'dorm',{}); G.stage='econ'; G.flags={}; picks=['怎麼知道','先睡']; said=[]; STORY.y0Tick(GM); for(let i=0;i<50&&!G.flags.E01_MORNING;i++) await new Promise(r=>setTimeout(r,10));
    check('6. 讀檔時 9/1 晚上、E01 還沒演完：在房間裡從頭演（21:00 起）',lines()[0]==='開學前一天，晚上九點。男生宿舍四樓，四一二。'&&G.flags.E01_DONE===true,JSON.stringify(lines().slice(0,2)));
    fresh(Y0+1,7.2,'dorm',{}); G.stage='econ'; G.flags={E01_DONE:true,E01_NIGHT:'unpack'}; said=[]; STORY.y0Tick(GM); await new Promise(r=>setTimeout(r,10));
    check('6. 讀檔時 9/2 早上、還沒聽到阿勳那一句：補一次',lines().includes('阿勳：你拆到兩點。')&&G.flags.E01_MORNING===true);
    fresh(30,8,'dorm',{}); G.stage='law'; said=[]; check('6. 法律系的存檔：y0Tick 什麼都不做',STORY.y0Tick(GM)===false&&!lines().length); }
  check('7. 換日標題：法律系也寫日期（AA_195 4-7 A3：第 5 天＝「9 月 21 日」）、經濟系「9 月 3 日」',STORY.dayTitle({day:5})==='9 月 21 日'&&STORY.dayTitle({stage:'econ',day:Y0+2})==='9 月 3 日');
  { const st=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'), dm=fs.readFileSync(path.join(ROOT,'src/dorm3d.js'),'utf8'), hm=fs.readFileSync(path.join(ROOT,'src/home3d.js'),'utf8');
    const dw=g=>STORY.dormWho(g).map(w=>w[0]), wdy=d=>CALENDAR.dateOf(d).wd%7, gE=h=>({stage:'econ',day:Y0+3,hour:h,weekday:wdy(Y0+3),flags:{E01_DONE:true}}), gL={stage:'law',day:30,hour:20,weekday:wdy(30),flags:{}};
    check('8. 經濟系那一年房間裡是阿勳（populate 照 S.dormWho；DORM203-MATES-1028 改寫，原本比對 populate 的寫法），阿凱不出現；門牌 412；回家睡覺的換日標題也寫日期',/if\(zoneId==='dorm'\)\{ for\(const \[id,u\] of S\.dormWho\(G\)\) S\.dormSpawn\(GM,id,u,false\);/.test(st)&&JSON.stringify(dw(gE(20)))===JSON.stringify(['econ_zhengxun'])&&dw(gE(10)).length===0&&dw(Object.assign(gE(20),{flags:{}})).length===0&&dw(gL).includes('kai')&&!dw(gE(20)).includes('kai')&&/if\(econ\) h\.plate='412'/.test(dm)&&/STORY\.dayTitle\(G\)/.test(hm),JSON.stringify({econ20:dw(gE(20)),econ10:dw(gE(10)),law:dw(gL)})); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });
