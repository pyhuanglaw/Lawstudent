// AA_378 法律系大四上修正稿（企劃線 5cd35678；任務 AA378-Y4S1-FIX-1021）S5、第 2～4 節裡程式這邊的部分——不需要瀏覽器。
//   0 逐字對稿：S5、#5～#8、#10 的新句子＝稿、＝遊戲；舊句子不在了
//   1 #1 以安 A7-L2「今年生日不是中秋。」只在 2028-09-15 當天（之前等、之後算過）
//   10 #10 可昕週年第四年自己一組選項（BB_209 第 4 節）
//   （#4 在 r2y4a_events_unit B3、S5／#15 在 y34b_events_unit、#12 在 termend_unit 9i）
//   9／11／13／14 閒聊階梯：源檔 6e0d1313 匯入的句子＋程式的條件（A7-L5 選項、招呼的日子）修改前（開發分支 8ef05e75）：每一項 FAIL。用法：node tests/aa378_rest_unit.js
require('./alison.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const NAMES=/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|CG_REGISTRY|NEEDED_MSGS|MSG|MSG_POOL|MSG2_POOL|HOMETOWN_LINES|HV|TERMEND|TERMEND_LINES|FREE_TRIPS|TRIP|ENCOUNTERS|ENC|CROWD)$/;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } length(){ return Math.hypot(this.x,this.y,this.z); } normalize(){ const l=this.length()||1; this.x/=l; this.y/=l; this.z/=l; return this; } }};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const FILES=['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/data/needed_msgs.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/data/hometown_lines.js','src/hometown3d.js','src/romance3d.js',
  'src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js','src/data/termend_lines.js','src/termend3d.js','src/story3d.js','src/classes3d.js','src/data/free_trips.js','src/freetrip3d.js','src/data/encounters.js','src/encounter3d.js','src/crowd3d.js'];
for(const f of FILES) if(fs.existsSync(path.join(ROOT,f))) load(f);
global.ADV={active:false,preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},cg(){ return true; },setBg(){},hide(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
if(typeof HOME!=='undefined') HOME.phoneRules=()=>{};
let said=[], opts=[], picks=[], caps=[], memos=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0,removeNPC(){}};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(who,t){ caps.push([who,t]); },sleep:()=>Promise.resolve(),memo(m){ memos.push(m); },autosave(){},addNote(){},energy(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},money(n){ G.money+=n; },removeNPC(){},hasNote:()=>true,
  spawnNPC(id,spec,x,z,o){ const n=Object.assign({id,charId:id,name:spec.name,obj:{position:{x,y:0,z}},beh:'idle'},o||{}); GM.npc[id]=n; return n; },
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>(q.t||q.text)+(q.hint?'〔'+q.hint+'〕':''))); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const D=k=>STORY.dayOfKey(k), J=x=>JSON.stringify(x), TD=(t,w,wd)=>STORY.termDay?STORY.termDay(t,w,wd):null;
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,stage:'law',weekday:wdOf(day),weather:'clear',energy:70,money:9000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,MAIN_D1:D('2025-09-03'),LAW_START_DAY:D('2025-08-29'),introDone:true,classDone:true,afternoonDone:true,metAn:true,AN_NAME_TOLD:true},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0},contacts:{},memo:[]};
  SOCIAL.bind(G); EVENTS.bind(GM); if(EVENTS.zoneChanged) EVENTS.zoneChanged(); INV.rec(G); if(typeof ROM!=='undefined'&&ROM.rec) ROM.rec(G); said=[]; opts=[]; picks=[]; caps=[]; memos=[]; GM.npc={}; E.npcs=[]; E.interactables=[]; E.player.obj.position={x:0,y:0,z:0}; ADV.active=false; return G; };
const run=(h0,h1,st)=>{ st=st||0.05; for(let h=h0;h<=h1+1e-9;h+=st){ G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(G); if(typeof OUT!=='undefined') OUT.expire(G); } };
const setDay=(d,h)=>{ G.day=d; G.weekday=wdOf(d); G.hour=h; };
const TH=th=>(G.msgs||[]).filter(m=>m.th===th), txt=th=>TH(th).map(m=>(m.from||'')+':'+m.text);
const lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const has=(L,t)=>L.some(x=>x===t||x.endsWith('：'+t));
const RUN=async e=>{ if(e) await EVENTS.run(e); };
const B2={ key:(G,id)=>STORY.b106d2Key?STORY.b106d2Key(G,id):'(沒有)', due:(G,id)=>STORY.b106d2Due?STORY.b106d2Due(G,id):false, done:(G,id,k)=>{ if(STORY.b106d2Done) STORY.b106d2Done(G,id,k); }, term:G=>STORY.b106d2Term?STORY.b106d2Term(G):null };   /* 修改前這些函式不存在：各項照樣 FAIL，不整支當掉 */
const near=(id,dx)=>{ const n={id,charId:id,name:id,obj:{position:{x:E.player.obj.position.x+(dx||1),y:0,z:E.player.obj.position.z}},lv:0}; GM.npc[id]=n; E.npcs.push(n); return n; };

const cp=require('child_process'), SPEC_SHA='5cd35678';
(async()=>{
  let spec=''; try{ spec=cp.execSync('git -c core.quotepath=false show '+SPEC_SHA+':"docs/story_planning/AA_378_法律系大四上_學姊在美國那半年與作息_修正稿.md"',{cwd:ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']}); }catch(e){}
  check('0. 讀得到稿（AA_378@'+SPEC_SHA+'）',/S5（低）子晴的一句把學姊說成法服的人/.test(spec));
  const src=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
  const NEW=[['S5','src/y34b3d.js','法服？你們系上那個社團？……好。','法服？那個學姊的法服？……好。'],
    ['#5','src/y34b3d.js','你的那條路，現在走到哪了？不用現在說。','大四要走哪條路，你決定了嗎？不用現在說。'],['#5','src/y34b3d.js','我的也想跟你說。','可是我想第一批知道。'],
    ['#6','src/y34b3d.js','阿姨，三年前我說，我們週二週四都會來。','阿姨，四年前我說，我們週二週四都會來。'],['#6','src/y34b3d.js','（坐下）第四年了。這兩個位子，本來就是我們的。','（坐下）四年了。這兩個位子，本來就是我們的。'],['#6','src/y34b3d.js','你說了三年的麵，原來是真的。','你說了四年的麵，原來是真的。'],
    ['#7','src/data/termend_lines.js','考完喔？吃飯，一樣九點以後','考完喔？吃飯，最後一學期了，一樣九點以後'],['#8','src/data/termend_lines.js','筆試考完，我想去看一次海。……還沒想好去哪裡。',null],
    ['#10','src/data/events.js','（把卡片翻到第一頁）第四年。……明年這一天，我們都畢業了。',null],['#10','src/data/events.js','對啊。四年前你還不知道木柵大學怎麼走。',null]];
  for(const [k,f,nw,old] of NEW) check('0. '+k+'「'+nw+'」＝稿、＝遊戲（'+f+'）'+(old?'；舊句「'+old+'」不在了':''),spec.includes(nw)&&src(f).includes("'"+nw+"'")&&(!old||!src(f).includes("'"+old+"'")));
  // ---- 1. 以安 A7-L2 ----
  { const at=(k)=>{ fresh(D(k),15,'campus'); SOCIAL.remember('heroine_01','FIRST_MET',''); Object.assign(SOCIAL.rel('heroine_01'),{fam:45,trust:30,comf:20}); const LD=STORY.ladData(G,'heroine_01'); const i=LD?LD.L.steps.findIndex(s=>s.id==='A7-L2'):-1; G.social=G.social||{}; G.social.ladder=Object.assign({},G.social.ladder||{},LD?{[LD.key]:i}:{}); G.social.ladderDay={}; const st=STORY.ladNext(G,'heroine_01'); return {i,id:st&&st.id}; };
    const a=at('2028-09-14'), b=at('2028-09-15'), c=at('2028-09-16');
    check('1. #1 以安 A7-L2 只在她生日 9/15：9/14 等（沒有這一層）、9/15 聊、9/16 以後算過（下一層）',a.i>=0&&a.id==null&&b.id==='A7-L2'&&!!c.id&&c.id!=='A7-L2',JSON.stringify([a,b,c])); }
  // ---- 9、11、13、14 閒聊階梯（源檔 6e0d1313）----
  { const LD=fs.readFileSync(path.join(ROOT,'src/data/ladder.js'),'utf8');
    const NEWL=[['#14','謝謝。八月就回來了，一直到開學才去吃。','謝謝。八月就回來了，今天才第一次來吃。'],['#11','這學期週五早上的研討，我很期待。','這學期週五早上有公司法研討，我很期待。'],['#11','期末考週。書還有一半沒背完。','期末考週。強執禮拜一早上考，我還沒背完。'],
      ['#13','店開二十三年了。牆上多了一張紅紙，阿姨每天都去看一下。','店開二十三年了。門口多了一張紅紙，阿姨每天都去看一下。'],['#9','她寄了一本她以前讀的保險法來。……上面的筆記比書還多。','先跟她講了。她沒說不好。']];
    for(const [k,nw,old] of NEWL) check('0. '+k+' 閒聊階梯「'+nw+'」＝稿、匯入了（ladder.js）；舊句不在了',spec.includes(nw)&&LD.includes('"'+nw+'"')&&!LD.includes('"'+old+'"'));
    const st=(LADDER.byTerm.Y4S1.heroine_01.steps||[]).find(x=>x.id==='A7-L5'), ch=an=>{ fresh(D('2028-10-30'),15,'campus',an?{AN_CHOICE:an}:{}); return STORY.ladChoices(st).map(c=>c.t+'→'+c.reply); };
    const here=ch('here'), grp=ch('group'), none=ch(null), R='她寄了一本她以前讀的保險法來。……上面的筆記比書還多。';
    check('9. #9 以安 A7-L5 選項②一次只出一個：演過新 18 當面那一場（AN_CHOICE here）＝「妳媽媽後來呢？」；群組收到的、還沒演＝「妳媽媽知道嗎？」；回答都是同一句',!!st&&here.length===2&&here[1]==='「妳媽媽後來呢？」→'+R&&grp.length===2&&grp[1]==='「妳媽媽知道嗎？」→'+R&&JSON.stringify(none)===JSON.stringify(grp),JSON.stringify({here,grp,none}));
    const GI=STORY.LADDER_GREET_IF, at=(k)=>{ fresh(D(k),15,'campus'); return G; };
    const fin=k=>GI['期末考週。書還有一半沒背完。'].test(at(k)), grpT=k=>GI['讀書會八點開始，我先來擦白板。'].test(at(k));
    check('11. #11 以安招呼：「期末考週。書還有一半沒背完。」只在 12/18～12/21；「讀書會八點開始……」跳過第 8～9 週',!fin('2028-12-17')&&fin('2028-12-18')&&fin('2028-12-21')&&!fin('2028-12-22')&&grpT('2028-10-19')&&!grpT('2028-10-26')&&!grpT('2028-11-02')&&grpT('2028-11-09'),
      JSON.stringify([fin('2028-12-17'),fin('2028-12-18'),fin('2028-12-21'),fin('2028-12-22'),CALENDAR.termOf(D('2028-10-26')).week,grpT('2028-10-19'),grpT('2028-10-26'),grpT('2028-11-02'),grpT('2028-11-09')])); }
  // ---- 10. 可昕週年第四年 ----
  { const e=STORY_EVENTS.find(x=>x.id==='ev_kexin_anniversary_yn'), L=(e&&e.dialogue)||[], i=L.findIndex(l=>l.label==='y4'), ch=i>=0?L.slice(i).find(l=>l.choice):null;
    const rep=lab=>{ const j=L.findIndex(l=>l.label===lab); return j>=0?L[j+1].text:null; };
    const C=ch?ch.choice.map(c=>[c.text,rep(c.goto)]):null;
    check('10. #10 可昕第四年：「（把卡片翻到第一頁）第四年。……明年這一天，我們都畢業了。」＋自己一組選項（「明年也一起過。」→「好。寫進表格。」／「時間好快。」→「對啊。四年前你還不知道木柵大學怎麼走。」／（不說話，看著她）→「……幹嘛一直看。」）',
      i>=0&&L[i+1].text==='（把卡片翻到第一頁）第四年。……明年這一天，我們都畢業了。'&&JSON.stringify(C)===JSON.stringify([['「明年也一起過。」','好。寫進表格。'],['「時間好快。」','對啊。四年前你還不知道木柵大學怎麼走。'],['（不說話，看著她）','……幹嘛一直看。']]),JSON.stringify(C)); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });
