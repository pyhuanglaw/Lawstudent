// 交接包 v2 C11、C21 第二個畫面（AA 2026-10-14 64ceb70）：大一下期中考完（刑總二，第 8 週週三）——G1 大一下版＋晚上 19:00 阿鳳麵店長桌——不需要瀏覽器。
// 修改前沒有 ev_midterm_walkout_y1s2（第 1 項失敗）。檢查：G1 的兩句、沒有選項（沒有群組的玩家最後被當面問）；群組揪人的時間與排程；「去。」才排、「這次不行。」不排；
//   晚餐的開頭（認識 Alison 才有）、明軒的回聲（SAW_HIM_STUDY）、沛珊和柏翰（認識沛珊才有）；沒去的群組成員 20:30 收到滷蛋照片＋「柏翰幫沛珊切的。」「……他們在一起了。」（AA_373 #16，照交接包 v2）、記聽說；不去不扣分；大一上不受影響
// 用法：node tests/v2_c11_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
  const g1=ev('ev_midterm_walkout_y1s2'), sup=ev('ev_midterm_supper_y1s2');
  check('1. G1 大一下版、考完的晚餐兩個事件都在',!!g1&&!!sup);
  if(!g1||!sup){ console.log('FAILED '+fails); process.exit(1); }
  check('1. G1 接在刑總二的期中考之後、只在大一下',g1.afterClass==='crim_gen2'&&g1.afterExam==='mid'&&JSON.stringify(g1.term)==='["Y1S2"]'&&g1.once===true);
  let midDay=null, midIt=null; for(let d=termDay('Y1S2',8,1);d<=termDay('Y1S2',9,7);d++){ fresh(d,8,'campus'); const it=CLS.dayItems(G,d).find(x=>x.c.id==='crim_gen2'&&x.exam==='mid'); if(it){ midDay=d; midIt=it; break; } }
  check('2. 刑總二期中考在第 8 週週三（4/15）',midDay===termDay('Y1S2',8,3),JSON.stringify({midDay,want:termDay('Y1S2',8,3),date:midDay&&CALENDAR.dateOf(midDay)}));
  if(!midDay){ console.log('FAILED '+fails); process.exit(1); }
  /* G1 */
  const runG1=async(group,pk)=>{ fresh(midDay,midIt.t0+0.2,'classroom',{}); for(const id of ['zhe','yu','classmate_peishan','classmate_bohan']) meet(id); if(group) PHONE.join(G,'noodle_team','麵店團'); picks=pk||[]; await CLS.attend(GM,midIt); return lines(); };
  let L=await runG1(true);
  const i0=L.indexOf('走廊上一群人。有人在翻課本，有人已經在滑手機。');
  check('3. G1 大一下版：旁白沿用大一上＋阿哲「刑總二比上學期難好多，第三題我整題亂寫。」（AA_209）',i0>=0&&L[i0+1]==='阿哲：刑總二比上學期難好多，第三題我整題亂寫。',JSON.stringify(L.slice(Math.max(0,i0),i0+3)));
  check('3. 有群組的玩家：G1 沒有選項、沒有當面問',!L.some(l=>l.includes('晚上麵店，七點'))&&!opts.some(o=>o.some(t=>t.includes('去。'))),JSON.stringify(opts));
  L=await runG1(false,['「去。」']);
  check('3. 沒有群組的玩家：G1 最後阿哲當面問「晚上麵店，七點，來不來？」（「去。」／「這次不行。」）',L[L.length-1]==='阿哲：晚上麵店，七點，來不來？'&&JSON.stringify(opts[opts.length-1])==='["「去。」","「這次不行。」"]',JSON.stringify({L:L.slice(-2),o:opts}));
  run(G.hour,G.hour+0.1); const o1=OUT.get(G,'supper_mid2');
  check('4. 回「去。」＝排 19:00 阿鳳麵店（考完的晚餐）',!!o1&&o1.day===midDay&&o1.h===19&&o1.place==='阿鳳麵店'&&o1.ev==='ev_midterm_supper_y1s2',JSON.stringify(o1));
  await runG1(false,['「這次不行。」']); run(G.hour,G.hour+0.1); check('4. 回「這次不行。」＝不排',!OUT.get(G,'supper_mid2'));
  /* 群組揪人 */
  fresh(midDay,8,'campus'); PHONE.join(G,'noodle_team','麵店團'); run(8,midIt.t1-0.05,0.05); const before=G.msgs.filter(m=>m.tag==='zhe_supper_mid2').length; run(midIt.t1,midIt.t1+0.3,0.05);
  const gm=G.msgs.filter(m=>m.tag==='zhe_supper_mid2'), o2=OUT.get(G,'supper_mid2');
  check('4. 有群組：考完以後阿哲在群組「刑總考完了。今天麵店，七點，長桌。」（考完以前沒有），排 19:00',before===0&&gm.length===1&&gm[0].th==='g:noodle_team'&&gm[0].from==='zhe'&&gm[0].text==='刑總考完了。今天麵店，七點，長桌。'&&!!o2&&o2.h===19,JSON.stringify({gm:gm.map(m=>[m.h,m.text]),o2}));
  { /* 大一上的宵夜不受影響：大一下沒有 supper_mid1 */ check('4. 大一下不排大一上的公館滷味（supper_mid1）',!OUT.get(G,'supper_mid1')); }
  /* 晚餐 */
  const dinner=async(setup,pk)=>{ fresh(midDay,18.9,'campus',{}); meet('zhe'); if(setup) setup(); picks=pk||[]; await EVENTS.run(sup); return lines(); };
  L=await dinner(()=>{ meet('yu'); });
  check('5. 開頭：旁白（還沒認識語彤＝「（阿姨的手腕綁著護腕。今天端麵的是一個沒見過的女生。）」，AA_373 #15；認識的照 AA_185 3-8「…今天端麵的是語彤。」，見 aa373_y1s2）；認識 Alison：Alison「今天不講考試。誰講誰請。」阿哲「那第二題——」Alison「你請。」阿哲「我還沒講完！」',JSON.stringify(L.slice(0,5))===JSON.stringify(['（阿姨的手腕綁著護腕。今天端麵的是一個沒見過的女生。）','Alison：今天不講考試。誰講誰請。','阿哲：那第二題——','Alison：你請。','阿哲：我還沒講完！']),JSON.stringify(L));
  L=await dinner(null); check('5. 不認識 Alison：沒有那四句',!L.some(l=>l.includes('誰講誰請')),JSON.stringify(L));
  L=await dinner(()=>{ meet('classmate_mingxuan'); SOCIAL.remember('classmate_mingxuan','SAW_HIM_STUDY',''); },['他有念']);
  check('6. 明軒的回聲（SAW_HIM_STUDY）：阿哲「明軒說他這次也沒念。」→「……他有念。我看到了。」→（他低頭吃了一口麵）明軒「……好啦，這次我請。」（AA_209）',L.includes('阿哲：明軒說他這次也沒念。')&&JSON.stringify(opts[0])==='["「……他有念。我看到了。」","（繼續吃麵）"]'&&L.includes('（他低頭吃了一口麵）')&&L.some(l=>l.endsWith('……好啦，這次我請。'))&&G.flags.SUPPER2_MX===true,JSON.stringify({L,opts}));
  L=await dinner(()=>{ meet('classmate_mingxuan'); }); check('6. 沒有 SAW_HIM_STUDY：沒有明軒那段',!L.some(l=>l.includes('明軒說他這次也沒念')),JSON.stringify(L));
  L=await dinner(()=>{ meet('classmate_peishan'); meet('classmate_bohan'); });
  const P=['柏翰幫沛珊把滷蛋切成兩半。','阿哲：……喔。','全桌安靜三秒。'], k=L.indexOf(P[0]);
  check('7. 沛珊和柏翰（認識沛珊）：滷蛋、「……喔。」、安靜三秒、沛珊「對，我們在一起了。你們吃你們的。」、柏翰「上禮拜的事。」（他把另一半滷蛋推回她碗裡。）（AA_209）',k>=0&&L[k+1]===P[1]&&L[k+2]===P[2]&&L[k+3].endsWith('對，我們在一起了。你們吃你們的。')&&L[k+4].endsWith('上禮拜的事。')&&L[k+5]==='（他把另一半滷蛋推回她碗裡。）',JSON.stringify(L));
  L=await dinner(null); check('7. 不認識沛珊：沒有那一段',!L.some(l=>l.includes('滷蛋')),JSON.stringify(L));
  /* 沒去 */
  const miss=async(group,knowPs)=>{ fresh(midDay,18,'campus',{}); if(group) PHONE.join(G,'noodle_team','麵店團'); if(knowPs) meet('classmate_peishan'); const r0=JSON.stringify(G.social.rel), e0=G.energy, m0=G.money;
    OUT.plan(G,{id:'supper_mid2',ev:'ev_midterm_supper_y1s2',day:midDay,h:19,place:'阿鳳麵店',title:'考完的晚餐',travelH:1/6}); G.hour=20; OUT.tick(GM); run(20,21,0.1);
    return {o:OUT.get(G,'supper_mid2'),msgs:G.msgs.filter(m=>m.tag==='zhe_supper_mid2_egg'),same:JSON.stringify(G.social.rel)===r0&&G.energy===e0&&G.money===m0}; };
  let r=await miss(true,true);
  check('8. 沒去（在群組、認識沛珊）：20:30 群組阿哲切成兩半的滷蛋照片，配「柏翰幫沛珊切的。」「……他們在一起了。」（AA_373 #16，照交接包 v2），記「聽說」',r.o.state==='missed'&&r.msgs.length===3&&r.msgs[0].text.includes('滷蛋')&&r.msgs[1].text==='柏翰幫沛珊切的。'&&r.msgs[2].text==='……他們在一起了。'&&r.msgs[0].h>=20.5&&SOCIAL.has('classmate_peishan','HEARD_ABOUT'),JSON.stringify({o:r.o&&r.o.state,m:r.msgs.map(m=>[m.h,m.text])}));
  r=await miss(true,false); check('8. 沒去、不認識沛珊：沒有那兩則',r.msgs.length===0);
  r=await miss(false,true); check('8. 沒去、不在群組：沒有那兩則',r.msgs.length===0);
  check('8. 不去不扣分（關係、體力、錢都不變）',r.same);
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
