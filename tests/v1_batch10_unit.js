// 交接包 v1（大一上）第 10 批——不需要瀏覽器。
// 檢查（修改前都會失敗）：
//   A20 聖誕交換禮物（AA_71 2-6「大一的實作」，AA 2026-10-14）：麵店團群組在第 17 週週一 12/22 21:00 收到阿哲「聖誕交換禮物，週三中午，霖澤館一樓。一百五以內。」
//     （沒有群組＝沒有；週二才加入＝加入時收到；週三 12:20 以後不再傳）；12/24 週三 12:20～13:10 在霖澤館一樓、有群組才會開始（二樓、13:10 以後、別週、沒有群組都不會）；
//     祐廷選三種禮物之一；抽到他禮物的人、他抽到誰的從在場（認識）的人裡挑，七個人三種禮物的反應照 AA 原文（21 句）；語彤抽到筆記本記 GIFT_NOTEBOOK_YT；
//     明軒和 Alison 都在、抽到祐廷禮物的不是明軒＝明軒抽到 Alison 的玩偶（旁白），祐廷不會抽到 Alison 的；柏翰的考古題：以安在才有「沒收。」，旁白的「又」只給中秋烤肉看過沒收的玩家（AA）；
//     明軒的禮物（BB_95 3-6b）：三色螢光筆，祐廷抽到時三種台詞（沒有／SAW_HIM_STUDY／綠色螢光筆），別人抽到＝阿哲、明軒各一句，明軒不在就沒有；只認識阿哲＝兩個都是阿哲；只一次。
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
/* 一次跑一場：known＝認識的人；gift＝選哪一種；toIdx＝在場名單（照 XMAS_WHO 的順序）裡第幾個或人物代號；fromIdx＝抽禮物那一次的亂數值 */
const runX=async(known,gift,toIdx,fromIdx,flags,setup)=>{ const WED=termDay(17,3); fresh(WED,12.5,'linze',flags||{}); PHONE.join(G,'noodle_team','麵店團'); for(const id of known) meet(id); if(setup) setup(); E.player.lv=0;
  const here=XMAS_HERE(G); rnd=[]; if(typeof toIdx==='string') toIdx=here.indexOf(toIdx); if(toIdx!=null) rnd.push((toIdx+0.5)/here.length); if(fromIdx!=null) rnd.push(fromIdx); picks=[gift]; await EVENTS.run(ev('ev_xmas_exchange')); rnd=[]; return {here,F:G.flags,L:lines()}; };
(async()=>{
  const MON=termDay(17,1), TUE=MON+1, WED=MON+2;
  /* ---------- 群組的揪 ---------- */
  { const grp=()=>G.msgs.filter(m=>m.tag==='xmas_ask').map(m=>({day:m.day,h:m.h,th:m.th,from:m.from,text:m.text}));
    fresh(MON,20.5,'campus',{}); PHONE.join(G,'noodle_team','麵店團'); run(20.5,20.95); const before=grp().length; run(20.95,21.2);
    const g=grp(); check('A20：麵店團群組 12/22（週一，16 週制的寒假第一天）21:00 阿哲「聖誕交換禮物，週三晚上六點半，麵店 一百五以內」（AA_204 1-2）',CALENDAR.dateOf(MON).key.endsWith('12-22')&&before===0&&g.length===1&&g[0].day===MON&&Math.abs(g[0].h-21)<0.06&&g[0].th==='g:noodle_team'&&g[0].from==='zhe'&&g[0].text==='聖誕交換禮物，週三晚上六點半，麵店 一百五以內',JSON.stringify(g));
    check('A20：收到揪團＝排出遊 12/24 18:30 阿鳳麵店（15 分鐘沒到＝沒去）',(()=>{ const q=OUT.get(G,'xmas_y1'); return !!q&&q.day===WED&&q.h===18.5&&q.ev==='ev_xmas_exchange'; })());
    keepOn(TUE,10); run(10,23); check('A20：只傳一次（隔天不會再傳）',grp().length===1);
    fresh(MON,20.5,'campus',{}); run(20.5,23.5); check('A20：沒有麵店團群組＝沒有（不扣分，也不會私訊）',grp().length===0&&!G.msgs.some(m=>/交換禮物/.test(m.text||'')));
    fresh(TUE,15,'campus',{}); run(15,15.2); PHONE.join(G,'noodle_team','麵店團'); run(15.2,15.4); const t=grp();
    check('A20：週二才加入群組＝加入的時候收到（不會補在加入以前）',t.length===1&&t[0].day===TUE&&t[0].h>=15.2,JSON.stringify(t));
    fresh(WED,12.4,'campus',{}); PHONE.join(G,'noodle_team','麵店團'); run(12.4,12.6); check('A20：週三中午才加入＝不傳揪團（原本的規則照舊：週三以後不補）',grp().length===0); }
  /* ---------- 什麼時候開始（16 週制：照出遊，AA_204 1-1） ---------- */
  { const e=ev('ev_xmas_exchange'); const ok=(grp)=>{ fresh(WED,18.5,'noodle',{}); if(grp) PHONE.join(G,'noodle_team','麵店團'); return EVENTS.check(e); };
    check('A20：事件是出遊（trigger outing），12/24 那天有群組＝可以開始；沒有群組不會',e.trigger==='outing'&&ok(true)&&!ok(false)&&CALENDAR.dateOf(WED).key.endsWith('12-24')); }
  /* ---------- 七個人、三種禮物的反應（AA 原文） ---------- */
  { const WANT={heroine_01:['剛好。我的快用完了。','我在 Café 都點茶。……開學以後會用到。謝謝。','字很工整。我收著。'],heroine_03:['嗯。……我還不知道要寫什麼。先收著。','放店裡好了。阿姨會想喝喝看。','嗯。回去再看。'],   /* AA_204 1-3 改的句子 */
      zhe:['好，我拿來寫菜單。','可以配滷味嗎？','你寫這麼多字，我會哭耶。……沒事啦。'],classmate_bohan:['我拿來整理考古題。','下學期很需要。謝謝。','……謝謝。我回去看。'],
      classmate_xinci:['格線的嗎？……空白的也好。謝謝。','追劇的時候剛好。謝謝。','謝謝。你寫好多。'],yu:['我要拿來寫三個社團的行事曆！','我拿去社辦泡給大家喝！','卡片！我要貼在牆上！'],
      classmate_mingxuan:['……我不念書的。','家教的時候喝。謝啦。','卡片喔。……我帶回家。']};
    const GIFTS=[['一本小筆記本','notebook'],['一包咖啡豆','coffee'],['一張手寫卡片','card']]; const bad=[]; let firstOpts=null;
    for(let i=0;i<WHO.length;i++) for(let k=0;k<3;k++){ const r=await runX(WHO.filter(x=>x!=='zhe'),GIFTS[k][0],i,0); if(!firstOpts) firstOpts=opts[0];
      const who=r.here[i]; if(r.F.XMAS_TO!==who||r.F.XMAS_GIFT!==GIFTS[k][1]||!r.L.includes(WANT[who][k])) bad.push(who+'/'+GIFTS[k][1]+'：'+JSON.stringify(r.L.slice(3,8))); }
    check('A20：祐廷可以選三種禮物（一本小筆記本、一包咖啡豆、一張手寫卡片）',JSON.stringify(firstOpts)===JSON.stringify(['一本小筆記本','一包咖啡豆','一張手寫卡片']),JSON.stringify(firstOpts));
    check('A20：七個人 × 三種禮物，抽到的人的反應照 AA 原文（21 句）',!bad.length,bad.slice(0,3).join(' | '));
    let r=await runX(WHO.filter(x=>x!=='zhe'),'一本小筆記本',1,0); check('A20：語彤抽到筆記本＝記 GIFT_NOTEBOOK_YT（AA_11 事件 16）',r.F.XMAS_TO==='heroine_03'&&SOCIAL.has('heroine_03','GIFT_NOTEBOOK_YT'));
    r=await runX(WHO.filter(x=>x!=='zhe'),'一包咖啡豆',1,0); check('A20：語彤抽到咖啡豆＝不記 GIFT_NOTEBOOK_YT',r.F.XMAS_TO==='heroine_03'&&!SOCIAL.has('heroine_03','GIFT_NOTEBOOK_YT'));
    r=await runX(WHO.filter(x=>x!=='zhe'),'一包咖啡豆',6,0); check('A20：明軒抽到筆記本以外的，沒有「收進書包」那句；抽到筆記本才有',!r.L.includes('他很快把它收進書包。')&&(await runX(WHO.filter(x=>x!=='zhe'),'一本小筆記本',6,0)).L.includes('他很快把它收進書包。')); }
  /* ---------- 祐廷抽到誰的、只有認識的人在場 ---------- */
  { let r=await runX([],'一張手寫卡片',0,0);
    check('A20：只認識阿哲＝抽到祐廷禮物的、祐廷抽到的都是阿哲（滷味：「冷掉了，但很好吃。」）',JSON.stringify(r.here)==='["zhe"]'&&r.F.XMAS_TO==='zhe'&&r.F.XMAS_FROM==='zhe'&&r.L.includes('你抽到阿哲的禮物：一盒滷味。')&&r.L.includes('冷掉了，但很好吃。'),JSON.stringify(r.L));
    check('A20：只認識阿哲＝沒有別人的句子（以安沒收、明軒的玩偶、其他人的反應）',!r.L.some(t=>/以安|明軒|Alison|柏翰|芯慈|語彤/.test(t)),JSON.stringify(r.L));
    const all=WHO.filter(x=>x!=='zhe'); const seen={}; let yuFrom=0, same=0;
    for(let n=0;n<80;n++){ const r2=await runX(all,'一張手寫卡片',null,null); seen[r2.F.XMAS_FROM]=1; if(r2.F.XMAS_FROM==='yu'&&r2.F.XMAS_TO!=='classmate_mingxuan') yuFrom++; if(r2.F.XMAS_FROM===r2.F.XMAS_TO) same++; }
    check('A20：明軒和 Alison 都在、抽到祐廷禮物的不是明軒＝祐廷不會抽到 Alison 的玩偶（是明軒抽到）；明軒的螢光筆抽得到（BB_95 3-6b）',yuFrom===0&&!!seen.classmate_mingxuan,JSON.stringify(seen));
    check('A20：在場有兩個人以上＝祐廷抽到的和抽到祐廷禮物的不是同一個人',same===0);
    r=await runX(all,'一張手寫卡片',0,0.0); check('A20：明軒和 Alison 都在＝旁白「明軒抽到 Alison 的巨大玩偶，揹著它去搭公車。」',r.L.includes('明軒抽到 Alison 的巨大玩偶，揹著它去搭公車。'));
    r=await runX(all.filter(x=>x!=='classmate_mingxuan'),'一張手寫卡片',0,null); let tries=0; while(r.F.XMAS_FROM!=='yu'&&tries++<60) r=await runX(all.filter(x=>x!=='classmate_mingxuan'),'一張手寫卡片',0,null);
    check('A20：明軒不在＝祐廷可以抽到 Alison 的玩偶（「我一個人在家的時候抱的那種。……送你。」），沒有明軒的旁白',r.F.XMAS_FROM==='yu'&&r.L.includes('你抽到 Alison 的禮物：一個巨大的玩偶。')&&r.L.includes('我一個人在家的時候抱的那種。……送你。')&&!r.L.some(t=>/明軒/.test(t)),JSON.stringify(r.L.slice(-3)));
    const withBohan=async(known)=>{ let r3=null; for(let n=0;n<80;n++){ r3=await runX(known,'一張手寫卡片',null,null); if(r3.F.XMAS_FROM==='classmate_bohan') return r3; } return r3; };
    r=await withBohan(['heroine_01','classmate_bohan','heroine_03']); const i1=r.L.indexOf('你抽到柏翰的禮物：一疊考古題。');
    check('A20：祐廷抽到柏翰的考古題、以安在＝以安「沒收。」',r.F.XMAS_FROM==='classmate_bohan'&&i1>=0&&r.L[i1+1]==='沒收。'&&said[i1+1].who!==null,JSON.stringify(r.L.slice(-3)));
    r=await withBohan(['classmate_bohan','heroine_03']); check('A20：以安不在＝沒有「沒收。」',r.F.XMAS_FROM==='classmate_bohan'&&!r.L.includes('沒收。')&&!r.L.some(t=>/以安/.test(t)),JSON.stringify(r.L.slice(-3)));
    let r4=null; for(let n=0;n<80;n++){ r4=await runX(['heroine_01','classmate_bohan','heroine_03'],'一張手寫卡片',null,null); if(r4.F.XMAS_FROM!=='classmate_bohan') break; }
    check('A20：柏翰、以安都在、祐廷沒抽到考古題、中秋沒看到沒收＝旁白「柏翰送的考古題，被以安沒收了。」（沒有「又」）',r4.F.XMAS_FROM!=='classmate_bohan'&&r4.L.includes('柏翰送的考古題，被以安沒收了。')&&!r4.L.includes('柏翰送的考古題，又被以安沒收了。'),JSON.stringify(r4.L.slice(-3)));
    const notBohan=async(flags)=>{ let r5=null; for(let n=0;n<80;n++){ r5=await runX(['heroine_01','classmate_bohan','heroine_03'],'一張手寫卡片',null,null,flags); if(r5.F.XMAS_FROM!=='classmate_bohan') break; } return r5; };
    r4=await notBohan({MIDAUTUMN_Y1:true,BBQ_BOHAN_SEIZED:true}); check('A20：中秋烤肉看過柏翰的考古題被沒收（MIDAUTUMN_Y1＋那一句有出現）＝「柏翰送的考古題，又被以安沒收了。」（AA 交付清單 A20）',r4.L.includes('柏翰送的考古題，又被以安沒收了。')&&!r4.L.includes('柏翰送的考古題，被以安沒收了。'),JSON.stringify(r4.L.slice(-3)));
    r4=await notBohan({MIDAUTUMN_Y1:true}); check('A20：去了中秋烤肉、但那時還不認識柏翰（沒看到沒收）＝沒有「又」',r4.L.includes('柏翰送的考古題，被以安沒收了。')&&!r4.L.includes('柏翰送的考古題，又被以安沒收了。'));
    /* A13 中秋烤肉：認識柏翰才有「柏翰帶了考古題，被沒收了。」，同時記 BBQ_BOHAN_SEIZED（A20 的「又」）*/
    const bbq=async(knowBohan)=>{ fresh(termDay(5,6),15,'campus',{}); PHONE.join(G,'noodle_team','麵店團'); if(knowBohan) meet('classmate_bohan'); picks=[]; await EVENTS.runLines(ev('ev_mid_autumn_bbq').dialogue,ev('ev_mid_autumn_bbq')); return {L:lines(),F:G.flags}; };
    let b1=await bbq(true), b0=await bbq(false); check('A13：認識柏翰＝「柏翰帶了考古題，被沒收了。」＋記 BBQ_BOHAN_SEIZED；不認識＝兩個都沒有',b1.L.includes('柏翰帶了考古題，被沒收了。')&&b1.F.BBQ_BOHAN_SEIZED===true&&!b0.L.includes('柏翰帶了考古題，被沒收了。')&&!b0.F.BBQ_BOHAN_SEIZED,JSON.stringify({b1:b1.F.BBQ_BOHAN_SEIZED,b0:b0.F.BBQ_BOHAN_SEIZED}));
    /* 明軒的聖誕禮物（BB_95 3-6b，BB 2026-10-14）：一組三色螢光筆；祐廷抽到時三種台詞；別人抽到＝阿哲一句、明軒一句；明軒不在＝抽不到 */
    const MXL='多買的。……我用不到啦。', MX_SAW='……收好啦。'   /* AA_207 §5（BB_167 SC4 第 29 列；原本「……你什麼都沒看到。」）*/, MX_GREEN='上次那支綠的還在嗎？……這樣你有四種了。';
    const mxGift=async(setup,flags)=>runX(['zhe','classmate_mingxuan'],'一包咖啡豆',0,0,flags,setup);
    r=await mxGift(null,null); check('A20 明軒的禮物：祐廷抽到（沒看過他念書）＝「你抽到明軒的禮物：一組三色螢光筆，黃、粉紅、藍。」「多買的。……我用不到啦。」、沒有另外兩句；記 XMAS_HL3（道具）',r.F.XMAS_FROM==='classmate_mingxuan'&&r.L.includes('你抽到明軒的禮物：一組三色螢光筆，黃、粉紅、藍。')&&r.L.includes(MXL)&&!r.L.includes(MX_SAW)&&!r.L.includes(MX_GREEN)&&r.F.XMAS_HL3===true,JSON.stringify(r.L.slice(-4)));
    r=await mxGift(()=>SOCIAL.remember('classmate_mingxuan','SAW_HIM_STUDY',''),null); check('A20 明軒的禮物：有 SAW_HIM_STUDY（M1）＝多一句「……收好啦。」',r.L.includes(MXL)&&r.L.indexOf(MX_SAW)===r.L.indexOf(MXL)+1&&!r.L.includes(MX_GREEN),JSON.stringify(r.L.slice(-4)));
    r=await mxGift(()=>SOCIAL.remember('classmate_mingxuan','SAW_HIM_STUDY',''),{GREEN_HIGHLIGHTER:true}); check('A20 明軒的禮物：有綠色螢光筆（M1 坐到他旁邊）＝那一句換成「上次那支綠的還在嗎？……這樣你有四種了。」',r.L.includes(MXL)&&r.L.indexOf(MX_GREEN)===r.L.indexOf(MXL)+1&&!r.L.includes(MX_SAW),JSON.stringify(r.L.slice(-4)));
    check('A20 明軒的禮物：祐廷抽到的時候沒有「你送螢光筆？你？」（那是別人抽到時）',!r.L.includes('你送螢光筆？你？'));
    r=await runX(['zhe','classmate_mingxuan'],'一包咖啡豆',1,0); check('A20 明軒的禮物：別人抽到（祐廷抽到阿哲的）＝阿哲「你送螢光筆？你？」明軒「多買的啦。」、沒有祐廷抽到時的句子、不記道具',r.F.XMAS_TO==='classmate_mingxuan'&&r.F.XMAS_FROM==='zhe'&&r.L.indexOf('多買的啦。')===r.L.indexOf('你送螢光筆？你？')+1&&r.L.includes('你送螢光筆？你？')&&!r.L.includes(MXL)&&!r.F.XMAS_HL3,JSON.stringify(r.L.slice(-4)));
    { const noMx=WHO.filter(x=>x!=='classmate_mingxuan'); let mxSeen=0, hl=0; for(let n=0;n<60;n++){ const r6=await runX(noMx,'一張手寫卡片',null,null); if(r6.F.XMAS_FROM==='classmate_mingxuan'||r6.L.some(t=>/螢光筆/.test(t))) mxSeen++; } check('A20 明軒的禮物：明軒不在＝抽不到他的、也沒有螢光筆的句子（60 次）',mxSeen===0,String(mxSeen)); }
    r=await runX(['yu','classmate_mingxuan'],'一張手寫卡片','classmate_mingxuan',0.99); check('A20：抽到祐廷禮物的是明軒（Alison 也在）＝明軒抽的是祐廷的，沒有「明軒抽到 Alison 的巨大玩偶」；祐廷抽得到 Alison 的玩偶',r.F.XMAS_TO==='classmate_mingxuan'&&r.F.XMAS_FROM==='yu'&&r.L.includes('你抽到 Alison 的禮物：一個巨大的玩偶。')&&!r.L.includes('明軒抽到 Alison 的巨大玩偶，揹著它去搭公車。'),JSON.stringify(r.L.slice(-3)));
    r=await runX(['heroine_01'],'一張手寫卡片',0,0); const F=G.flags; check('A20：只一次（演完再檢查不會開始）；記 XMAS_Y1',F.XMAS_Y1===true&&!EVENTS.check(ev('ev_xmas_exchange'))); }
  /* ---------- 可昕 K2 她第一次來台大（BB_95 9-3）---------- */
  { const FRI=termDay(6,5), SAT=FRI+1;
    fresh(FRI,19.5,'dorm',{dating_kexin:true}); run(19.5,20.1); const m=G.msgs.find(x=>x.tag==='kx_ntu_ask'); const q=OUT.get(G,'kx_ntu');
    check('K2：第 6 週週五 20:00「這次換我去台大。我先去找品妤，你四點來社科院門口。」（AA_313 第 2 節第 8 列）；週六 16:00 社科院門口（不和第 4 週六迎新、第 5 週六中秋同一天）',!!m&&m.day===FRI&&Math.abs(m.h-20)<0.06&&m.text==='這次換我去台大。我先去找品妤，你四點來社科院門口。'&&!!q&&q.day===SAT&&q.h===16&&SAT!==termDay(4,6)&&SAT!==termDay(5,6),JSON.stringify(q));
    const go=async(flags,events,pick)=>{ fresh(SAT,15.7,'campus',Object.assign({dating_kexin:true},flags||{})); for(const e of (events||[])) G.events.done[e]=1; PHONE.at(G,FRI,20,[{th:'p:kexin',from:'kexin',text:'x'}],'kx_ntu_ask'); run(15.7,15.8); const q2=OUT.get(G,'kx_ntu'); picks=[pick]; said=[]; opts=[]; await OUT.go(GM,q2); return {L:lines(),O:opts[0]||[]}; };
    let r=await go({},[],'「今天沒有遲到。」');
    check('K2：旁白用「你」（BB 2026-10-14）：「社科院門口，可昕和品妤已經在等你。」「品妤先回去了。你們沿著椰林大道走出校門，在附近吃晚餐。」（AA_313 第 2 節第 8 列）；品妤第一次出現＝「好久不見。你現在每天都在對面那棟喔？」（AA_207 §4-6：不報全名）；可昕「我們的舊系館。……裡面的販賣機還是壞的。」（AA_207 §7 第 3 列：原本接在品妤的問句後面又是一個問句）',r.L[0]==='社科院門口，可昕和品妤已經在等你。'&&r.L.includes('品妤先回去了。你們沿著椰林大道走出校門，在附近吃晚餐。')&&!r.L.includes('品妤先回去了。你們沿著椰林大道，一路走到公館吃晚餐。')&&r.L.includes('好久不見。你現在每天都在對面那棟喔？')&&!r.L.includes('你來了。')&&r.L.includes('我們的舊系館。……裡面的販賣機還是壞的。')&&!r.L.includes('我們的舊系館。……你現在每天經過，都不會進去了吧？'),JSON.stringify(r.L.slice(0,4)));
    check('K2：霖澤館前三選一（AA_295）；「今天沒有遲到。」→「……因為我在。」她笑',JSON.stringify(r.O)===JSON.stringify(['「遲到走後門。」','「今天沒有遲到。」','「我沒有每天遲到。」'])&&r.L.includes('霖澤館。以前每天從社科院看過來。……第一次走進來。')&&r.L.includes('你每天第一堂都從這個門進去？……遲到的時候也是？')&&r.L.includes('……因為我在。')&&r.L.includes('她笑。'));
    check('K2：K1 還沒去過＝分開時「下次換你來，我當導遊。」；記 MET_PINYU',r.L.includes('下次換你來，我當導遊。')&&G.flags.MET_PINYU===true);
    r=await go({MET_PINYU:true},['ev_kexin_tour_nccu'],'「我沒有每天遲到。」');
    check('K2：之前遇過品妤＝只點頭「你來了。」；K1 去過＝沒有「下次換你來」；「我沒有每天遲到。」→「證據呢？」',r.L.includes('你來了。')&&!r.L.some(t=>t.startsWith('曾品妤。'))&&!r.L.includes('下次換你來，我當導遊。')&&r.L.includes('證據呢？'));
    fresh(SAT,15.7,'campus',{dating_kexin:true}); PHONE.at(G,FRI,20,[{th:'p:kexin',from:'kexin',text:'x'}],'kx_ntu_ask'); run(15.7,15.8); const q3=OUT.get(G,'kx_ntu'); q3.state='missed'; OUT.onMissed(GM,q3); run(15.8,17.2);
    const ph=G.msgs.filter(x=>x.tag==='kx_ntu_photo').map(x=>x.text); check('K2：沒去＝她照樣去找品妤，傳兩個人在社科院門口的照片＋「我們等到五點。……你人呢。」（AA_313 第 2 節第 8 列）',JSON.stringify(ph)===JSON.stringify(['📷（她和品妤在社科院門口）','我們等到五點。……你人呢。'])&&G.msgs.filter(x=>x.tag==='kx_ntu_photo').every(x=>Math.abs(x.h-17)<0.06),JSON.stringify(G.msgs.filter(x=>x.tag==='kx_ntu_photo').map(x=>[x.h,x.text]))); }
  /* ---------- 可昕 K4 第一次視訊一起讀書（BB_95 9-5）---------- */
  { const D=termDay(16,2); const kx=()=>G.msgs.filter(m=>m.th==='p:kexin').map(m=>({day:m.day,h:m.h,from:m.from,text:m.text,ask:m.ask?m.ask.opts.map(o=>o.t):null}));
    const ask=()=>G.msgs.find(m=>m.tag==='kx_video_ask');
    fresh(D-1,19,'dorm',{dating_kexin:true}); run(19,23.9); const early=!!ask(); keepOn(D,19); run(19,19.9); const before=!!ask(); run(19.9,20.1);
    let m=ask(); check('K4：第 16 週週二 20:00 她問「要不要視訊一起讀書？各讀各的。我每半小時會吵你一次，你可以不理我。」（BB_95 原文；兩個回覆）',!early&&!before&&!!m&&m.day===D&&Math.abs(m.h-20)<0.06&&m.text==='要不要視訊一起讀書？各讀各的。我每半小時會吵你一次，你可以不理我。'&&JSON.stringify(m.ask.opts.map(o=>o.t))===JSON.stringify(['好，九點開。','今天不行。']),JSON.stringify(kx()));
    G.hour=20.2; PHONE.answer(G,m.ask.id,0); run(20.2,20.3); const q=OUT.get(G,'kx_video');
    check('K4：「好，九點開。」→ 她「好。我先把書排好。」、當天 21:00 排視訊（接起來）',kx().some(x=>x.text==='好。我先把書排好。')&&!!q&&q.day===D&&q.h===21&&q.verb==='接起來',JSON.stringify(q));
    const R0=JSON.parse(JSON.stringify(CLS.rec(G).prep)); G.hour=21; said=[]; picks=[0,'（回她）','（不回，繼續讀）','（回她）','（不回，繼續讀）']; const st0=(G.stats&&G.stats.study)||0;
    await OUT.go(GM,q); const L=lines(); const c=G.flags.kxVideoCourse; const R1=CLS.rec(G).prep;
    const Q=['我的螢光筆沒水了。……你那邊的黃色借我。算了，你又遞不過來。','你們期末考還剩幾科？我在算哪天可以見面。','這是我今天第三杯咖啡。你不要跟我媽說。','我眼睛快閉起來了。……你先不要掛。'];   /* AA_295 */
    check('K4：開始前先選讀哪一科；四題照順序（BB_95 原文）',L[0]==='今天讀哪一科？'&&!!c&&Q.every((t,i)=>L.indexOf(t)>=0&&(i===0||L.indexOf(t)>L.indexOf(Q[i-1]))),JSON.stringify(L));
    check('K4：回她＝「你分心了。很好。」、不回＝「你今天好認真。我有點寂寞。……繼續。」，各自只說第一次',L.filter(t=>t==='你分心了。很好。').length===1&&L.filter(t=>t==='你今天好認真。我有點寂寞。……繼續。').length===1&&L.indexOf('你分心了。很好。')<L.indexOf(Q[1])&&L.indexOf('你今天好認真。我有點寂寞。……繼續。')<L.indexOf(Q[2]));
    check('K4：讀書時間算進期末準備（兩個小時＝那一科 +2）、時間往後兩小時、記 VIDEO_STUDY',(R1[c]||0)-(R0[c]||0)===2&&((G.stats&&G.stats.study)||0)-st0===2&&Math.abs(G.hour-23)<0.05&&SOCIAL.has('kexin','VIDEO_STUDY'),JSON.stringify({c,before:R0[c]||0,after:R1[c],hour:G.hour}));
    run(23,23.9); check('K4：去了就沒有書桌的照片',!G.msgs.some(x=>x.tag==='kx_video_photo'));
    fresh(D,19.9,'dorm',{dating_kexin:true}); run(19.9,20.1); m=ask(); G.hour=20.3; PHONE.answer(G,m.ask.id,1); run(20.3,23.1);
    const ph=G.msgs.filter(x=>x.tag==='kx_video_photo').map(x=>x.text); check('K4：「今天不行。」→「好。我自己讀，讀完傳照片給你。」、23:00 書桌的照片「我自己讀了。你欠我一次。」、沒有視訊',kx().some(x=>x.text==='好。我自己讀，讀完傳照片給你。')&&JSON.stringify(ph)===JSON.stringify(['📷（她的書桌）','我自己讀了。你欠我一次。'])&&!OUT.get(G,'kx_video'),JSON.stringify(ph));
    fresh(D,19.9,'dorm',{dating_kexin:true}); run(19.9,23.1); m=ask(); const exp=PHONE.answer(G,m.ask.id,0);
    check('K4：沒回＝21:45 以後不能再回、23:00 一樣傳照片',exp===null&&G.msgs.filter(x=>x.tag==='kx_video_photo').length===2&&G.flags.KX_VIDEO==='none');
    fresh(D,19.9,'dorm',{dating_kexin:true}); run(19.9,20.1); m=ask(); G.hour=20.3; PHONE.answer(G,m.ask.id,0); run(20.3,20.4); const q2=OUT.get(G,'kx_video'); G.hour=21; q2.state='missed'; OUT.onMissed(GM,q2); run(21,23.1);
    check('K4：答應了但沒接（今天先不要）＝23:00 一樣傳照片',G.msgs.filter(x=>x.tag==='kx_video_photo').length===2);
    fresh(D,19.9,'dorm',{}); run(19.9,23.5); check('K4：沒有在交往（dating_kexin 沒設）＝沒有',!ask()); }
  /* ---------- 舊存檔：KX_BDAY[1] 搬到 KX_DEC3[1]（BB_95 9-6 改版的「影響」）---------- */
  { const src=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8'); const a=src.indexOf('  function migrate(s){'), b=src.indexOf('  function ls(){',a);
    const mig=new Function('defaults','SAVE_VER',src.slice(a,b)+'; return migrate;')(()=>({rel:{}}),3);
    const o1=mig({v:3,name:'x',rel:{},flags:{dating_kexin:true,KX_BDAY:{1:'visit'}},events:{done:{}}});
    const o2=mig({v:3,name:'x',rel:{},flags:{dating_kexin:true,KX_BDAY:{1:'message',2:'visit'},KX_BDAY_MSG:true},events:{done:{}}});
    const o3=mig({v:3,name:'x',rel:{},flags:{dating_kexin:true},events:{done:{}}});
    check('舊存檔讀檔：KX_BDAY[1]→KX_DEC3[1]、清掉 KX_BDAY[1]（4/24 不會被當成已經過了）；其他年的照留；當天的暫存旗標改名；沒有的不動',
      o1.flags.KX_DEC3[1]==='visit'&&o1.flags.KX_BDAY===undefined&&o2.flags.KX_DEC3[1]==='message'&&o2.flags.KX_BDAY[2]==='visit'&&o2.flags.KX_BDAY[1]===undefined&&o2.flags.KX_DEC3_MSG===true&&o2.flags.KX_BDAY_MSG===undefined&&o3.flags.KX_DEC3===undefined,
      JSON.stringify([o1.flags,o2.flags,o3.flags].map(f=>({b:f.KX_BDAY,d:f.KX_DEC3})))); 
    /* AA_140 G46：只轉一次——4/24 記下的結果（KX_BDAY[1]、當天的 KX_BDAY_VISIT／_MSG）存檔、讀檔以後還在 */
    o1.flags.KX_BDAY={1:'visit'}; const o1b=mig(JSON.parse(JSON.stringify(o1)));
    const o4=mig({v:3,name:'x',rel:{},flags:{dating_kexin:true,KX_DEC3_MIGRATED:true,KX_BDAY:{1:'visit'},KX_BDAY_MSG:true},events:{done:{}}});
    const o5=mig({v:3,name:'x',rel:{},flags:{dating_kexin:true,KX_DEC3:{1:'visit'},KX_BDAY:{1:'none'}},events:{done:{}}});
    const o6=mig({v:3,name:'x',rel:{},flags:{dating_kexin:true,KX_BDAY_VISIT:true},events:{done:{ev_kexin_birthday_y1s2:1}}});
    check('G46 只轉一次：轉過的再讀檔、新遊戲（KX_DEC3_MIGRATED）、已經有 KX_DEC3、4/24 事件演過的，4/24 的結果都不被搬走',
      o1.flags.KX_DEC3_MIGRATED===true&&o1b.flags.KX_BDAY[1]==='visit'&&o1b.flags.KX_DEC3[1]==='visit'&&o4.flags.KX_BDAY[1]==='visit'&&o4.flags.KX_BDAY_MSG===true&&o4.flags.KX_DEC3===undefined
      &&o5.flags.KX_BDAY[1]==='none'&&o5.flags.KX_DEC3[1]==='visit'&&o6.flags.KX_BDAY_VISIT===true&&o6.flags.KX_DEC3_VISIT===undefined,
      JSON.stringify([o1b,o4,o5,o6].map(o=>({b:o.flags.KX_BDAY,d:o.flags.KX_DEC3,v:o.flags.KX_BDAY_VISIT,m:o.flags.KX_BDAY_MSG}))));
    check('G46 新遊戲的 defaults 有 KX_DEC3_MIGRATED（不會把第一次讀檔前記的 4/24 搬走）',/flags:\{dating_kexin:true,KX_DEC3_MIGRATED:true\}/.test(src)); }
  /* ---------- 第一份報告交出去的晚上（BB_95 9-6 改版，2026-10-15 BB-B：生日改 4/24；AA_140 G01）---------- */
  { const BD=termDay(14,3); let toasts=[]; GM.toast=(t)=>{ toasts.push(t); };
    const draft=()=>G.msgs.find(m=>m.tag==='kx_dec3_draft');
    fresh(BD-1,20.5,'dorm',{dating_kexin:true}); run(20.5,21.2);
    check('12/3 前一晚 21:00：她傳「明天交第一份期末報告。交完我要去山下那一家。一個人吃好像有點悲壯。」',G.msgs.some(m=>m.th==='p:kexin'&&m.text==='明天交第一份期末報告。交完我要去山下那一家。一個人吃好像有點悲壯。'));
    fresh(BD,5.5,'dorm',{dating_kexin:true}); toasts=[]; run(5.5,6.2); let d=draft();
    check('12/3（週三）：沒有「生日」的行事曆；她的對話串有「（草稿）」可以傳「交出去了嗎？」',CALENDAR.dateOf(BD).key.endsWith('12-03')&&!toasts.some(t=>/生日/.test(t))&&!!d&&d.th==='p:kexin'&&d.from==='player'&&JSON.stringify(d.ask.opts.map(o=>o.t))===JSON.stringify(['交出去了嗎？']),JSON.stringify({toasts,d:d&&d.text}));
    const q=OUT.get(G,'kx_bday'); G.hour=17.9; const due0=OUT.due(G); G.hour=18.01; const due1=OUT.due(G);
    check('18:00 起出遊提示「開車去政大」（開車約 30 分鐘；標題沒有「生日」）',!!q&&!due0&&!!due1&&due1.id==='kx_bday'&&q.title==='開車去政大'&&q.travel==='開車約 30 分鐘',JSON.stringify(q));
    G.hour=12; PHONE.answer(G,d.ask.id,0); const rep=G.msgs.filter(m=>m.th==='p:kexin').map(m=>m.text).slice(-2);
    check('只傳訊息 →「交出去了嗎？」＋她「交了。……今天可以早點睡了。」',JSON.stringify(rep)===JSON.stringify(['交出去了嗎？','交了。……今天可以早點睡了。']),JSON.stringify(rep));
    run(12,23); keepOn(BD+1,7.5); run(7.5,8.2); check('只傳訊息＝KX_DEC3 {1:"message"}、那晚沒有空椅子的照片、沒有 KX_BDAY',G.flags.KX_DEC3&&G.flags.KX_DEC3[1]==='message'&&!G.msgs.some(m=>m.tag==='kx_dec3_none')&&!G.flags.KX_BDAY);
    fresh(BD,6,'dorm',{dating_kexin:true}); run(6,23.95); const none=G.msgs.filter(m=>m.tag==='kx_dec3_none').map(m=>[m.day,m.h,m.text]); keepOn(BD+1,7); run(7,8.2);
    check('什麼都沒做＝那晚 22:30 她傳「一個人吃了。很好吃。下次你要來。」（酸辣湯餃的照片 AA_503 9-3 改成可昕的動態第 6 則，23:30 一定出）、KX_DEC3 {1:"none"}；隔天沒有「我等了一天。」',none.length===1&&none[0][2]==='一個人吃了。很好吃。下次你要來。'&&none[0][1]===22.5&&G.flags.KX_DEC3[1]==='none'&&!G.msgs.some(m=>m.text==='我等了一天。'),JSON.stringify(none));
    fresh(BD,6,'dorm',{dating_kexin:true}); run(6,6.2); d=draft(); keepOn(BD+1,0.2); const late=PHONE.answer(G,d.ask.id,0); check('草稿過了當天就不能傳',late===null);
    const go=async(flags,events,pick)=>{ fresh(BD,18.2,'dorm',Object.assign({dating_kexin:true},flags||{})); for(const e of (events||[])) G.events.done[e]=1; run(18.2,18.3); const q3=OUT.get(G,'kx_bday'); picks=[pick]; said=[]; opts=[]; await OUT.go(GM,q3); return {L:lines(),O:opts[0]||[]}; };
    let r=await go({},[],'「猜的。」');
    check('去政大＝旁白「政大的晚上，山上的風比台大冷一點。」→「……你怎麼知道我幾點下課？」；沒見過予樂＝沒有「問予樂的。」；整段沒有「生日」',r.L[0]==='政大的晚上，山上的風比台大冷一點。'&&r.L.includes('……你怎麼知道我幾點下課？')&&JSON.stringify(r.O)===JSON.stringify(['「妳的課表在我手機裡。」','「猜的。」'])&&!r.L.some(t=>/生日/.test(t)),JSON.stringify(r.L.slice(0,4)));
    check('「猜的。」→「猜錯的話，你要在這裡等多久？」「等到猜對。」「……很會講欸。」（AA_207 §7 第 1 列：原本「……好，算你過。」替玩家打分）；予樂沒見過＝「予樂看了你一眼，對可昕說：」「好，我先走。」',['猜錯的話，你要在這裡等多久？','等到猜對。','……很會講欸。','予樂看了你一眼，對可昕說：','好，我先走。'].every(t=>r.L.includes(t))&&!r.L.includes('……好，算你過。'));
    check('小吃街「今天本來是一個普通的週三。」「……你從台北開上來喔？山路晚上很暗欸。」（AA_207 §5／BB_167 SC4 第 33 列）「今天你點餐。」；沒有「老闆記得你的點法。」',['今天本來是一個普通的週三。','……你從台北開上來喔？山路晚上很暗欸。','今天你點餐。'].every(t=>r.L.includes(t))&&!r.L.includes('老闆記得你的點法。'));
    keepOn(BD+1,7.5); run(7.5,8.2); check('去了＝KX_DEC3 {1:"visit"}',G.flags.KX_DEC3[1]==='visit');
    r=await go({K1_ORDER:'let_her'},['ev_kexin_tour_nccu','ev_kexin_yule_pass'],'「問予樂的。」');
    check('見過予樂＝有「問予樂的。」→ 予樂「我什麼都沒說。」可昕「她說了。她每次說謊都先撥頭髮。」、予樂「好，我先走。司機，載好她。」',r.O.includes('「問予樂的。」')&&r.L.includes('我什麼都沒說。')&&r.L.includes('她說了。她每次說謊都先撥頭髮。')&&r.L.includes('好，我先走。司機，載好她。')&&!r.L.includes('予樂看了你一眼，對可昕說：'));
    check('K1、K1b 都去過、K1 讓她點＝第三次去，「老闆記得你的點法。」',r.L.includes('老闆記得你的點法。'));
    r=await go({K1_ORDER:'mine'},['ev_kexin_tour_nccu','ev_kexin_yule_pass'],'「妳的課表在我手機裡。」'); check('K1 自己點的＝沒有「老闆記得你的點法。」；「妳的課表在我手機裡。」→「那張是我開玩笑傳給你的。……你真的存了。」',!r.L.includes('老闆記得你的點法。')&&r.L.includes('那張是我開玩笑傳給你的。……你真的存了。'));
    fresh(BD,6,'dorm',{}); toasts=[]; run(6,8); check('生日：沒有在交往＝沒有提醒、沒有草稿',!toasts.length&&!draft()); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
