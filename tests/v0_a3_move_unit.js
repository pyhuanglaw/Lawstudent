// v0 A3 搬出宿舍那天（BB_112 A3；日期 AA_218 第 11 節：2024-10-19，原本 3/29）＋休學以後從家裡出發（AA_154 1-3b）：觸發、請／不請、搬回家、在家的選單、在家讀書、去學校、回家——不需要瀏覽器。
// 修改前沒有 ev_y0_a3（全部失敗）。用法：node tests/v0_a3_unit.js
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
const meet=id=>SOCIAL.remember(id,'FIRST_MET','');
(async()=>{
  const D=STORY.dayOfKey('2024-10-31'); const ev=STORY_EVENTS.find(e=>e.id==='ev_y0_a3'); check('0. A3 在、10/31 是週四（AA_305 第 7 節：宿舍住到月底，原本 10/19）',!!ev&&CALENDAR.dateOf(D).wd===4&&STORY.Y0_MOVE_DAY==='2024-10-31'); if(!ev){ console.log('FAILED '+fails); process.exit(1); }
  const ck=(h,z,f)=>{ fresh(D,h,z,Object.assign({LEAVE_WEEK:6},f||{})); G.stage='econ'; return EVENTS.check(ev); };
  check('1. 10/31 09:00 以後在宿舍演；08:00、在校園（20:00 前）不演；20:00 以後在哪裡都演；沒有休學不演',ck(9.5,'dorm')&&!ck(8,'dorm')&&!ck(15,'campus')&&ck(20.5,'campus')&&!(()=>{ fresh(D,10,'dorm'); G.stage='econ'; return EVENTS.check(ev); })());
  let menus=[], script=[]; const choose0=GM.choose;
  GM.choose=async o=>{ const t=o.map(q=>q.t||q.text); menus.push(t); const w=script.shift(); if(w==null) throw new Error('STOP'); const k=t.findIndex(x=>x.includes(w)); return k<0?0:k; };
  fresh(D,10,'dorm',{LEAVE_WEEK:6,Y0_STICKY:true}); G.stage='econ'; said=[]; script=['請阿勳']; await EVENTS.run(ev); await new Promise(r=>setTimeout(r,20));
  const L=said.map(x=>x.t);
  check('2. AA_305 第 7 節：「（十月三十一日，早上九點。宿舍可以住到今天。）」→ 阿勳封箱 →「保齡球那場，記得。」→ 韋綸 → 唐睿「你說你會回來。那就不算走。」→ 請吃飯；冷笑話三句拿掉',L[0]==='（十月三十一日，早上九點。宿舍可以住到今天。）'&&L[1]==='箱子我幫你封。你的膠帶貼得很醜。'&&L.includes('保齡球那場，記得。')&&L.includes('你說你會回來。那就不算走。')&&!L.some(t=>/冷笑話|一個人講/.test(t))&&L.includes('雞腿便當？……那我不客氣了。')&&G.flags.A3_TREAT===true,JSON.stringify(L));
  check('3. 搬回臺北的家：在家、H.base、最後一箱上的便利貼（AA_305 第 7 節：「保齡球欠我一場。」＋小字「下次有事，先跟室友說。」）、選單（讀書／休息／存檔／睡覺；沒有回宿舍、沒有去學校：使用者 10-18「重考中不要讓我去台大」）',HOME.at(G)&&G.home.base===true&&G.flags.Y0_MOVED_OUT===true&&L.includes('（傍晚，回到臺北的家。拆箱的時候，最後一箱上面貼著一張便利貼。阿勳的字。）')&&L.includes('保齡球欠我一場。')&&L.includes('（下面還有一行小字：「下次有事，先跟室友說。」）')&&menus.length>=2&&!menus[menus.length-1].includes('去學校')&&menus[menus.length-1].includes('存檔')&&menus[menus.length-1].includes('讀書')&&menus[menus.length-1].includes('休息')&&!menus[menus.length-1].some(t=>/回宿舍/.test(t)),JSON.stringify(menus));
  check('3. 搬出以後 HOME.canGo 一直是 true（校門口「回臺北的家」每天都在）',HOME.baseMode(G)&&HOME.canGo(G));
  // 在家讀書
  const h0=G.hour, sl=HOME.y0Slot(G); script=['讀書']; try{ await HOME.loop(GM); }catch(e){ if(e.message!=='STOP') throw e; }
  check('4. 在家讀書：讀到這個時段結束（使用者 21:5x 時段制）；10/19 還沒決定重考（AA_218：2025-02 才決定），habit retake:study 不算（重考期 2/15～7/10 才算）',!!sl&&Math.abs(G.hour-Math.max(h0+0.5,sl.end))<1e-6&&EVENTS.habitCount({key:'retake:study'})===0,G.hour+' '+h0);
  // 家裡的選單沒有「去學校」（使用者 10-18：「一個休學的人根本不會想再踏入台大」）
  G.hour=15; menus=[]; script=['__none__']; try{ await HOME.loop(GM); }catch(e){ if(e.message!=='STOP') throw e; }
  check('5. 下午在家的選單也沒有「去學校」',menus.length>0&&!menus.some(m=>m.some(t=>/去學校/.test(t))),JSON.stringify(menus[0]));
  G.home.at=false; G.zone='gongguan';   /* 從外面（出遊演完、公館）回家 */
  // 回家：HOME.go 走 30 分鐘、還是 base
  script=[]; G.hour=17; const t0=G.hour; try{ await HOME.go(GM); }catch(e){ if(e.message!=='STOP') throw e; } check('6. 從外面回家：約 30 分鐘、在家、base',HOME.at(G)&&G.home.base===true&&Math.abs(G.hour-(t0+0.5))<1e-6,G.hour);
  // 不請
  fresh(D,10,'dorm',{LEAVE_WEEK:6}); G.stage='econ'; said=[]; script=['不請']; try{ await EVENTS.run(ev); await new Promise(r=>setTimeout(r,20)); }catch(e){}
  { const L7=said.map(x=>x.t); check('7. 不請：阿勳傳一張照片；A3 開頭不再先演檯燈上的便利貼（AA_305：便利貼貼在最後一箱，搬回家拆箱時才看到）、拆箱那三行有',PHONE.thread(G,'p:econ_zhengxun').some(m=>m.text==='📷（他自己買的便當）')&&G.flags.A3_TREAT===false&&L7[0]==='（十月三十一日，早上九點。宿舍可以住到今天。）'&&!L7.includes('檯燈上多了一張便利貼。阿勳的字。')&&L7.includes('（下面還有一行小字：「下次有事，先跟室友說。」）')&&G.flags.Y0_STICKY===true,JSON.stringify(L7)); }
  { fresh(D,10,'dorm',{LEAVE_WEEK:6,Y0_STICKY:true}); G.stage='econ'; said=[]; script=['請阿勳']; try{ await EVENTS.run(ev); await new Promise(r=>setTimeout(r,20)); }catch(e){} check('7. 舊存檔已經看過檯燈便利貼的：A3 一樣從 10/31 早上那句開始',said[0]&&said[0].t==='（十月三十一日，早上九點。宿舍可以住到今天。）'); }
  { const note=STORY_EVENTS.find(e=>e.id==='ev_y0_e30_note'), D27=STORY.dayOfKey('2024-10-17'); const ck=(d,h,f)=>{ fresh(d,h,'dorm',Object.assign({LEAVE_WEEK:6},f||{})); G.stage='econ'; return EVENTS.check(note); };
    check('7. AA_305 第 5 節：10/17 晚上檯燈上的便利貼拿掉（10/17 22:30、10/18 中午都不演）',!ck(D27,22.5)&&!ck(D27+1,13)&&!ck(D27,21)); }
  // A46 ①：10/19 週末在家（還沒搬）→ 下一輪選單之前先回宿舍演 A3 → 搬回家
  const homeWeekend=(day,h)=>{ fresh(day,h,'campus',{LEAVE_WEEK:6}); G.stage='econ'; const H=HOME.rec(G); H.at=true; H.day=day; H.base=false; };
  let enterH=null; const en0=GM.enter; GM.enter=async z=>{ if(enterH==null&&z==='dorm') enterH=G.hour; G.zone=z; };
  homeWeekend(D,8.6); said=[]; menus=[]; script=['請阿勳']; try{ await HOME.loop(GM); }catch(e){ if(e.message!=='STOP') throw e; } await new Promise(r=>setTimeout(r,20)); GM.enter=en0;
  check('9. 10/31 08:36 從家裡出發：10:00 才到宿舍（阿勳十點在房間）',enterH!=null&&Math.abs(enterH-10)<1e-6,String(enterH));
  let L2=said.map(x=>x.t);
  check('9. A46：10/31 早上在家（回家、還沒搬）→ 先「今天要搬出宿舍。阿勳說他十點會在房間。」→ 回宿舍（40 分鐘，10/31 當天最早 10:00 到）→ A3 → 搬回臺北的家',L2[0]==='今天要搬出宿舍。阿勳說他十點會在房間。'&&L2.includes('箱子我幫你封。你的膠帶貼得很醜。')&&G.flags.Y0_MOVED_OUT===true&&HOME.at(G)&&G.home.base===true,JSON.stringify(L2.slice(0,3)));
  homeWeekend(D+1,10); said=[]; script=['不請']; try{ await HOME.loop(GM); }catch(e){ if(e.message!=='STOP') throw e; } await new Promise(r=>setTimeout(r,20));
  L2=said.map(x=>x.t); check('9. 11/1 才在家：「宿舍還沒退完。阿勳說，箱子還在房間等你。」→ A3 → 搬回家',L2[0]==='宿舍還沒退完。阿勳說，箱子還在房間等你。'&&L2.includes('箱子我幫你封。你的膠帶貼得很醜。')&&G.flags.Y0_MOVED_OUT===true,JSON.stringify(L2.slice(0,3)));
  { fresh(D+1,10,'dorm',{LEAVE_WEEK:6}); G.stage='econ'; const a=EVENTS.check(ev); G.flags.Y0_MOVED_OUT=true; const b=EVENTS.check(ev); check('9. 11/1 在宿舍（當天沒演到）：A3 照演；搬過了不演',a&&!b); }
  // A46 ②：搬回家以後，出遊從家裡出發一律 30 分鐘（例：E18b 原本「走過去約 15 分鐘」）
  fresh(D+5,18.2,'campus',{LEAVE_WEEK:6,Y0_MOVED_OUT:true}); G.stage='econ'; { const H=HOME.rec(G); H.at=true; H.base=true; H.day=G.day; }
  OUT.plan(G,{id:'t_a46',ev:'ev_y0_e18b',day:G.day,h:19,late:0.25,place:'公館豆花店',title:'公館豆花店 19:00',travel:'走過去約 15 分鐘',travelH:0.25});
  const dueA=!OUT.due(G); G.hour=18.3; const dueB=OUT.due(G)&&OUT.due(G).id==='t_a46'; const tr=OUT.trip(G,OUT.get(G,'t_a46'));
  check('10. A46 ②：在家（休學後）＝「捷運＋公車 約 30 分鐘」、0.5 小時；問出發的時間跟著提早到 18:15',dueA&&dueB&&tr.travelH===0.5&&tr.travel==='捷運＋公車 約 30 分鐘');
  menus=[]; script=['豆花店',0,0,0,0,0,0,0,0]; let card=null; const tc=GM.titleCard; GM.titleCard=async(a,b)=>{ if(card==null) card=b; }; try{ await HOME.loop(GM); }catch(e){ if(e.message!=='STOP') throw e; } GM.titleCard=tc;
  check('10. 從家裡的選單出發：選單提示、字卡都是 30 分鐘；18:18 出發＝19:00 到（不早於約好的時間）',(menus[0]||[]).some(t=>t.includes('豆花店'))&&card==='捷運＋公車 約 30 分鐘',JSON.stringify(menus[0])+' '+card);
  fresh(D+5,18.6,'campus',{LEAVE_WEEK:6,Y0_MOVED_OUT:true}); G.stage='econ'; OUT.plan(G,{id:'t_a46b',ev:'ev_y0_e18b',day:G.day,h:19,late:0.25,place:'公館',title:'公館',travel:'走過去約 15 分鐘',travelH:0.25});
  check('10. 人在學校（不在家）：照原本的「走過去約 15 分鐘」',OUT.trip(G,OUT.get(G,'t_a46b')).travelH===0.25);
  // 法律系：不受影響
  fresh(termDay('Y1S1',4,3),19,'dorm'); check('8. 法律系的存檔：週三晚上不能回家（baseMode 不成立）',!HOME.baseMode(G)&&!HOME.canGo(G));
  GM.choose=choose0;
    { const g3=require('fs').readFileSync(require('path').join(__dirname,'..','src/game3d.js'),'utf8'); check('8. 手機「地點」最上面有「回臺北的家」（HOME.canGo 而且不在家；BB-C DORM-AFTER-MOVEOUT）',/HOME\.canGo\(G\)&&!\(HOME\.at&&HOME\.at\(G\)\)\) h\+='<div class="item phrow"><div>回臺北的家/.test(g3)&&/data-gohome/.test(g3)); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
