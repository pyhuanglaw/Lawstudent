// LIFE-LINE 第 7 組（AA_224 第 7 組 @4e3a7c2b；使用者 2026-10-17 10:4x「直接進經濟系」）——不需要瀏覽器。
// 檢查：新遊戲（沒有 ?start0／?start1）直接走經濟系開局；回顧前三句 → 字卡 8/23 經濟系迎新宿營 → 遊覽車上可昕（二選一、E15_BUS）→ CG＋三句旁白 → 8/25 回家 →
//       21:00 小隊群組三則 → 一句旁白 → 9/1 E01（阿勳宿營版）；ECON_CAMP_OPEN；E02 宿營版的句子；11/22 的經濟系宿營不排；?start1 照舊是法律系開局。
// 用法：node tests/v0_g7_unit.js
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
  const Y0=STORY.y0Day1(); const D=k=>STORY.dayOfKey(k);
  fresh(1,21.2,'title',{}); G.flags={}; cards.length=0; global.location={search:''}; picks=[1,0,0]; GM.titleIdle=true; GM.D.busyDepth=0;
  await STORY.newGame(GM); const L=lines();
  check('1. 新遊戲（預設）＝經濟系開局：stage econ、ECON_CAMP_OPEN、E01 演完',G.stage==='econ'&&G.flags.ECON_CAMP_OPEN===true&&G.flags.E01_DONE===true,JSON.stringify({stage:G.stage,f:G.flags.ECON_CAMP_OPEN}));
  check('2. 回顧只有前三句（念經濟為止）',JSON.stringify(L.slice(0,3))===JSON.stringify(STORY.LAW_START_RECAP.slice(0,3))&&!L.includes(STORY.LAW_START_RECAP[3]),JSON.stringify(L.slice(0,4)));
  check('3. 字卡：「2024 年 8 月 23 日（五）｜經濟系迎新宿營」→「8 月 23 日～25 日｜經濟系宿營」→「2024 年 9 月 1 日（日）｜開學前一天」',cards[0]==='2024 年 8 月 23 日（五）｜經濟系迎新宿營'&&cards[1]==='8 月 23 日～25 日｜經濟系宿營'&&cards[2]==='2024 年 9 月 1 日（日）｜開學前一天',JSON.stringify(cards));
  const i0=L.indexOf('（遊覽車上，你從上車就開始睡。）');
  check('4. 遊覽車：兩句旁白、可昕兩句、二選一；選「妳一直在看我睡覺喔？」→「我在看名單。你剛好在名單旁邊。」、E15_BUS',i0>0&&L[i0+2]==='可昕：你醒了？你是第三小隊的吧。我也是。'&&L[i0+3]==='可昕：我叫杜可昕。……你睡了一個小時，車子轉彎你都沒醒。'&&JSON.stringify(opts[0])==='["「……我昨天沒睡。」","「妳一直在看我睡覺喔？」"]'&&L[i0+4]==='可昕：我在看名單。你剛好在名單旁邊。'&&G.flags.E15_BUS==='watching',JSON.stringify(L.slice(i0,i0+5)));
  check('5. E15 的三句旁白、8/25 回家那句、開學前那一週那句',['（經濟系的宿營，山邊的青年活動中心。第三小隊：你、可昕、阿勳、韋綸，小隊輔是家豪學長。）','（回到家，你倒在床上，一覺睡到晚上。）','開學前那一週，你在家把要帶去宿舍的東西裝進三個紙箱。'].every(t=>L.includes(t))&&!L.some(t=>/洗衣機/.test(t)));
  check('6. 宿營就認識可昕、阿勳（camp）',SOCIAL.has('kexin','FIRST_MET')&&SOCIAL.has(XUN,'FIRST_MET'));
  PHONE.tick(G); const sq=txt('g:econ_squad3');
  check('7. 8/25 21:00 小隊群組「經濟系第三小隊」三則（玩家不用回）',PHONE.title(G,'g:econ_squad3')==='經濟系第三小隊'&&JSON.stringify(sq)===JSON.stringify(['econ_zhengxun:📷（活動中心門口，七個人的合照）','econ_weilun:我還在累','kexin:睡飽了嗎第三小隊'])&&TH('g:econ_squad3').every(m=>m.day===D('2024-08-25')&&Math.abs(m.h-21)<0.2&&!m.ask),JSON.stringify([PHONE.title(G,'g:econ_squad3'),TH('g:econ_squad3').map(m=>[m.day,m.h])]));
  const j=L.indexOf('門開了。宿營第三小隊的阿勳拿著臉盆走進來，看了你的紙箱一眼。');
  check('8. E01 宿營版：阿勳「欸，第三小隊的。我們同一間？」祐廷「好像是。」「門口的名單，我們兩個排在一起。學號也只差一號。」；沒有原本的自我介紹',j>0&&L[j+1]==='阿勳：欸，第三小隊的。我們同一間？'&&L[j+2]==='祐廷：好像是。'&&L[j+3]==='阿勳：門口的名單，我們兩個排在一起。學號也只差一號。'&&!L.some(t=>/盧正勳，經濟系/.test(t)),JSON.stringify(L.slice(j,j+4)));
  { const e=ev('ev_y0_e02'); fresh(D('2024-09-02'),12.5,'campus',{ECON_CAMP_OPEN:true}); G.stage='econ'; said=[]; picks=[0]; await EVENTS.run(e); const M=lines();
    check('9. E02 宿營版：家豪學長「宿營來過的，大部分都見過了。」「沒來的，講名字、從哪裡來就好。」、韋綸「（他朝你揮手）欸，第三小隊的。」、可昕「杜可昕。宿營第三小隊的。……」',M.includes('家豪學長：宿營來過的，大部分都見過了。')&&M.includes('家豪學長：沒來的，講名字、從哪裡來就好。')&&M.includes('韋綸：（他朝你揮手）欸，第三小隊的。')&&M.some(t=>/杜可昕。宿營第三小隊的。……我是「邊際效用遞減」/.test(t))&&!M.some(t=>/我是宋家豪/.test(t)),JSON.stringify(M.slice(0,10)));
    fresh(D('2024-09-02'),12.5,'campus',{}); G.stage='econ'; said=[]; picks=[0]; await EVENTS.run(e); const N=lines();
    check('10. 沒有 ECON_CAMP_OPEN（舊的開發局）：E02 原版',N.some(t=>/我是宋家豪，大二/.test(t))&&!N.some(t=>/宿營/.test(t))); }
  { const fri12=termDay('Y0S1',12,5); fresh(fri12-2,20.5,'dorm',{ECON_CAMP_OPEN:true}); G.stage='econ'; run(20.5,21.5); STORY.phoneRules(GM);
    check('11. 有宿營的局：11/20 沒有宿營的邀約、11/22 不排出發',!PHONE.sent(G,'y0_e15_ask')&&!(OUT.get(G,'y0_e15')),JSON.stringify(TH('g:econ_class').map(m=>m.text))); }
  { fresh(1,21.2,'title',{}); G.flags={}; global.location={search:'?start1'}; GM.titleIdle=true; GM.D.busyDepth=0; STORY.recap=STORY.recap; const camp=STORY.campY1; let law=false; STORY.campY1=async()=>{ law=true; return true; };
    try{ await STORY.newGame(GM); } finally { STORY.campY1=camp; global.location={search:''}; }
    check('12. ?start1：照舊是法律系開局（8/22 法律系宿營），不設 ECON_CAMP_OPEN',law&&!G.flags.ECON_CAMP_OPEN&&G.stage!=='econ'); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+e.stack); process.exit(1); });
