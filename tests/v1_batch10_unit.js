// 交接包 v1（大一上）第 10 批——不需要瀏覽器。
// 檢查（修改前都會失敗）：
//   A20 聖誕交換禮物（AA_71 2-6「大一的實作」，AA 2026-10-14）：麵店團群組在第 17 週週一 12/22 21:00 收到阿哲「聖誕交換禮物，週三中午，霖澤館一樓。一百五以內。」
//     （沒有群組＝沒有；週二才加入＝加入時收到；週三 12:20 以後不再傳）；12/24 週三 12:20～13:10 在霖澤館一樓、有群組才會開始（二樓、13:10 以後、別週、沒有群組都不會）；
//     祐廷選三種禮物之一；抽到他禮物的人、他抽到誰的從在場（認識）的人裡挑，七個人三種禮物的反應照 AA 原文（21 句）；語彤抽到筆記本記 GIFT_NOTEBOOK_YT；
//     明軒和小語都在＝明軒抽到小語的玩偶（旁白），祐廷不會抽到小語的；柏翰的考古題：以安在才有「沒收。」；只認識阿哲＝兩個都是阿哲；只一次。
// 用法：node tests/v1_batch10_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|OUT|COURSES|CLS|ACTIVITIES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/classes3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(){},setBg(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], caps=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption:(a,t)=>{ caps.push(t); },sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); said=[]; opts=[]; picks=[]; caps=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; E.player.obj.position.x=0; E.player.obj.position.z=0; };
const keepOn=(day,hour,zone,flags)=>{ const ev=G.events, soc=G.social, msgs=G.msgs, phone=G.phone, contacts=G.contacts, ch=G.choices, act=G.activities; fresh(day,hour,zone,Object.assign({},G.flags,flags||{})); G.events=ev; G.social=soc; SOCIAL.bind(G); if(msgs) G.msgs=msgs; if(phone) G.phone=phone; if(contacts) G.contacts=contacts; G.choices=ch; if(act) G.activities=act; };
const lines=()=>said.map(s=>s.t);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const npc=(id,x,z)=>{ const n={id,charId:id,name:id,obj:{position:{x,y:0,z}},seat:null,lv:0}; GM.npc[id]=n; E.npcs.push(n); return n; };
const tickEv=()=>{ const r=EVENTS.tick(0.1); return r; };
const termDay=(w,wd)=>STORY.termDay('Y1S1',w,wd);
const run=(h0,h1,st)=>{ st=st||0.05; for(let h=h0;h<=h1+1e-9;h+=st){ G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(G); } };
const meet=id=>SOCIAL.remember(id,'FIRST_MET','');
const WHO=['heroine_01','heroine_03','zhe','classmate_bohan','classmate_xinci','yu','classmate_mingxuan'];
let rnd=[]; const R0=Math.random; Math.random=()=>rnd.length?rnd.shift():R0();
/* 一次跑一場：known＝認識的人；gift＝選哪一種；toIdx／fromIdx＝在場名單（照 XMAS_WHO 的順序）裡第幾個 */
const runX=async(known,gift,toIdx,fromIdx)=>{ const WED=termDay(17,3); fresh(WED,12.5,'linze',{}); PHONE.join(G,'noodle_team','麵店團'); for(const id of known) meet(id); E.player.lv=0;
  const here=XMAS_HERE(G); rnd=[]; if(toIdx!=null) rnd.push((toIdx+0.5)/here.length); if(fromIdx!=null) rnd.push(fromIdx); picks=[gift]; await EVENTS.run(ev('ev_xmas_exchange')); rnd=[]; return {here,F:G.flags,L:lines()}; };
(async()=>{
  const MON=termDay(17,1), TUE=MON+1, WED=MON+2;
  /* ---------- 群組的揪 ---------- */
  { const grp=()=>G.msgs.filter(m=>m.tag==='xmas_ask').map(m=>({day:m.day,h:m.h,th:m.th,from:m.from,text:m.text}));
    fresh(MON,20.5,'campus',{}); PHONE.join(G,'noodle_team','麵店團'); run(20.5,20.95); const before=grp().length; run(20.95,21.2);
    const g=grp(); check('A20：麵店團群組 12/22（週一）21:00 阿哲「聖誕交換禮物，週三中午，霖澤館一樓。一百五以內。」（AA 原文）',CALENDAR.dateOf(MON).key.endsWith('12-22')&&before===0&&g.length===1&&g[0].day===MON&&Math.abs(g[0].h-21)<0.06&&g[0].th==='g:noodle_team'&&g[0].from==='zhe'&&g[0].text==='聖誕交換禮物，週三中午，霖澤館一樓。一百五以內。',JSON.stringify(g));
    keepOn(TUE,10); run(10,23); check('A20：只傳一次（隔天不會再傳）',grp().length===1);
    fresh(MON,20.5,'campus',{}); run(20.5,23.5); check('A20：沒有麵店團群組＝沒有（不扣分，也不會私訊）',grp().length===0&&!G.msgs.some(m=>/交換禮物/.test(m.text||'')));
    fresh(TUE,15,'campus',{}); run(15,15.2); PHONE.join(G,'noodle_team','麵店團'); run(15.2,15.4); const t=grp();
    check('A20：週二才加入群組＝加入的時候收到（不會補在加入以前）',t.length===1&&t[0].day===TUE&&t[0].h>=15.2,JSON.stringify(t));
    fresh(WED,12.4,'campus',{}); PHONE.join(G,'noodle_team','麵店團'); run(12.4,12.6); check('A20：週三 12:20 以後才加入＝不傳（活動已經開始）',grp().length===0); }
  /* ---------- 什麼時候開始 ---------- */
  { const e=ev('ev_xmas_exchange'); const ok=(day,hour,lv,grp)=>{ fresh(day,hour,'linze',{}); if(grp) PHONE.join(G,'noodle_team','麵店團'); E.player.lv=lv; return EVENTS.check(e); };
    check('A20：12/24（週三）12:20～13:10 在霖澤館一樓、有群組＝開始',CALENDAR.dateOf(WED).key.endsWith('12-24')&&ok(WED,12.34,0,true)&&ok(WED,13.1,0,true));
    check('A20：12:19、13:10 以後、二樓、沒有群組、前一週的週三都不會',!ok(WED,12.3,0,true)&&!ok(WED,13.17,0,true)&&!ok(WED,12.5,1,true)&&!ok(WED,12.5,0,false)&&!ok(WED-7,12.5,0,true));
    fresh(WED,12.5,'campus',{}); PHONE.join(G,'noodle_team','麵店團'); E.player.lv=0; check('A20：不在霖澤館（校園）不會',!EVENTS.check(e));
    E.player.lv=0; }
  /* ---------- 七個人、三種禮物的反應（AA 原文） ---------- */
  { const WANT={heroine_01:['剛好。手帳的理由欄不夠寫了。','我不喝咖啡。……期末會喝。好。','字很工整。我收著。'],heroine_03:['嗯。……我還不知道要寫什麼。先收著。','我帶去店裡。阿姨會好奇。','嗯。我會看兩次。'],
      zhe:['好，我拿來寫菜單。','可以配滷味嗎？','你寫這麼多字，我會哭耶。……沒事啦。'],classmate_bohan:['我拿來整理考古題。……這次不會被沒收吧。','期末很需要。謝謝。','……沒有人寫卡片給我過。謝謝。'],
      classmate_xinci:['格線的嗎？……空白的也好。謝謝。','追劇的時候剛好。謝謝。','你寫得比我整齊。……騙你的，我比較整齊。'],yu:['我要拿來寫三個社團的行事曆！','我拿去社辦泡給大家喝！','卡片！我要貼在牆上！'],
      classmate_mingxuan:['……我不念書的。','家教的時候喝。謝啦。','卡片喔。……我帶回家。']};
    const GIFTS=[['一本小筆記本','notebook'],['一包咖啡豆','coffee'],['一張手寫卡片','card']]; const bad=[]; let firstOpts=null;
    for(let i=0;i<WHO.length;i++) for(let k=0;k<3;k++){ const r=await runX(WHO.filter(x=>x!=='zhe'),GIFTS[k][0],i,0); if(!firstOpts) firstOpts=opts[0];
      const who=r.here[i]; if(r.F.XMAS_TO!==who||r.F.XMAS_GIFT!==GIFTS[k][1]||!r.L.includes(WANT[who][k])) bad.push(who+'/'+GIFTS[k][1]+'：'+JSON.stringify(r.L.slice(3,6))); }
    check('A20：祐廷可以選三種禮物（一本小筆記本、一包咖啡豆、一張手寫卡片）',JSON.stringify(firstOpts)===JSON.stringify(['一本小筆記本','一包咖啡豆','一張手寫卡片']),JSON.stringify(firstOpts));
    check('A20：七個人 × 三種禮物，抽到的人的反應照 AA 原文（21 句）',!bad.length,bad.slice(0,3).join(' | '));
    let r=await runX(WHO.filter(x=>x!=='zhe'),'一本小筆記本',1,0); check('A20：語彤抽到筆記本＝記 GIFT_NOTEBOOK_YT（AA_11 事件 16）',r.F.XMAS_TO==='heroine_03'&&SOCIAL.has('heroine_03','GIFT_NOTEBOOK_YT'));
    r=await runX(WHO.filter(x=>x!=='zhe'),'一包咖啡豆',1,0); check('A20：語彤抽到咖啡豆＝不記 GIFT_NOTEBOOK_YT',r.F.XMAS_TO==='heroine_03'&&!SOCIAL.has('heroine_03','GIFT_NOTEBOOK_YT'));
    r=await runX(WHO.filter(x=>x!=='zhe'),'一包咖啡豆',6,0); check('A20：明軒抽到筆記本以外的，沒有「收進書包」那句；抽到筆記本才有',!r.L.includes('他很快把它收進書包。')&&(await runX(WHO.filter(x=>x!=='zhe'),'一本小筆記本',6,0)).L.includes('他很快把它收進書包。')); }
  /* ---------- 祐廷抽到誰的、只有認識的人在場 ---------- */
  { let r=await runX([],'一張手寫卡片',0,0);
    check('A20：只認識阿哲＝抽到祐廷禮物的、祐廷抽到的都是阿哲（滷味：「冷掉了，但很好吃。」）',JSON.stringify(r.here)==='["zhe"]'&&r.F.XMAS_TO==='zhe'&&r.F.XMAS_FROM==='zhe'&&r.L.includes('你抽到阿哲的禮物：一盒滷味。')&&r.L.includes('冷掉了，但很好吃。'),JSON.stringify(r.L));
    check('A20：只認識阿哲＝沒有別人的句子（以安沒收、明軒的玩偶、其他人的反應）',!r.L.some(t=>/以安|明軒|小語|柏翰|芯慈|語彤/.test(t)),JSON.stringify(r.L));
    const all=WHO.filter(x=>x!=='zhe'); const seen={}; let yuFrom=0, same=0;
    for(let n=0;n<80;n++){ const r2=await runX(all,'一張手寫卡片',null,null); seen[r2.F.XMAS_FROM]=1; if(r2.F.XMAS_FROM==='yu') yuFrom++; if(r2.F.XMAS_FROM===r2.F.XMAS_TO) same++; }
    check('A20：明軒和小語都在＝祐廷不會抽到小語的玩偶（是明軒抽到）、也不會抽到明軒的（AA 沒寫明軒的禮物）',yuFrom===0&&!seen.classmate_mingxuan,JSON.stringify(seen));
    check('A20：在場有兩個人以上＝祐廷抽到的和抽到祐廷禮物的不是同一個人',same===0);
    r=await runX(all,'一張手寫卡片',0,0.0); check('A20：明軒和小語都在＝旁白「明軒抽到小語的巨大玩偶，揹著它去搭公車。」',r.L.includes('明軒抽到小語的巨大玩偶，揹著它去搭公車。'));
    r=await runX(all.filter(x=>x!=='classmate_mingxuan'),'一張手寫卡片',0,null); let tries=0; while(r.F.XMAS_FROM!=='yu'&&tries++<60) r=await runX(all.filter(x=>x!=='classmate_mingxuan'),'一張手寫卡片',0,null);
    check('A20：明軒不在＝祐廷可以抽到小語的玩偶（「我一個人在家的時候抱的那種。……送你。」），沒有明軒的旁白',r.F.XMAS_FROM==='yu'&&r.L.includes('你抽到小語的禮物：一個巨大的玩偶。')&&r.L.includes('我一個人在家的時候抱的那種。……送你。')&&!r.L.some(t=>/明軒/.test(t)),JSON.stringify(r.L.slice(-3)));
    const withBohan=async(known)=>{ let r3=null; for(let n=0;n<80;n++){ r3=await runX(known,'一張手寫卡片',null,null); if(r3.F.XMAS_FROM==='classmate_bohan') return r3; } return r3; };
    r=await withBohan(['heroine_01','classmate_bohan','heroine_03']); const i1=r.L.indexOf('你抽到柏翰的禮物：一疊考古題。');
    check('A20：祐廷抽到柏翰的考古題、以安在＝以安「沒收。」',r.F.XMAS_FROM==='classmate_bohan'&&i1>=0&&r.L[i1+1]==='沒收。'&&said[i1+1].who!==null,JSON.stringify(r.L.slice(-3)));
    r=await withBohan(['classmate_bohan','heroine_03']); check('A20：以安不在＝沒有「沒收。」',r.F.XMAS_FROM==='classmate_bohan'&&!r.L.includes('沒收。')&&!r.L.some(t=>/以安/.test(t)),JSON.stringify(r.L.slice(-3)));
    let r4=null; for(let n=0;n<80;n++){ r4=await runX(['heroine_01','classmate_bohan','heroine_03'],'一張手寫卡片',null,null); if(r4.F.XMAS_FROM!=='classmate_bohan') break; }
    check('A20：柏翰、以安都在、祐廷沒抽到考古題＝旁白「柏翰送的考古題，又被以安沒收了。」',r4.F.XMAS_FROM!=='classmate_bohan'&&r4.L.includes('柏翰送的考古題，又被以安沒收了。'));
    r=await runX(['heroine_01'],'一張手寫卡片',0,0); const F=G.flags; check('A20：只一次（演完再檢查不會開始）；記 XMAS_Y1',F.XMAS_Y1===true&&!EVENTS.check(ev('ev_xmas_exchange'))); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
