// 第一次見面（AA_120 3-1；使用者 2026-10-13 試玩：「第一次跟高子晴講話……怎麼會這樣，那時候還不熟吧」）——不需要瀏覽器。
// 兩個原因都要修：
//   ① 事件引擎（events3d.js 的 X.run）在播對話之前就替參與的人物記下 FIRST_MET，所以「只有第一次見面才說」（unless FIRST_MET）的台詞永遠被跳過、
//      「已經認識」（if FIRST_MET）的「又來了」在第一次就出現——子晴第一次去吉他社說「又來了」、芷若第一次在兩點半沒有「歡迎光臨」。
//   ② 五位女主角還沒見過時被搭話（story3d.js 的 talkCharacter）走一般自我介紹、記下 FIRST_MET，她專屬的相遇事件就再也不會發生。
// 檢查：測試事件與遊戲裡的 ev_ziqing_club、ev_cafe_barista_zhiruo、ev_zhiruo_ge_group（BB 6-1：可以當第一次見面）、ev_kai_mentions_ziqing（認識子晴就不轉述）；
//   talkCharacter：女主角沒見過＝旁白、不記 FIRST_MET；之後吉他社照第一次見面演；一般同學照舊自我介紹。修改前 ①② 都會失敗。
// 用法：node tests/first_meet_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}}; global.THREE={Vector3:function(){}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|SMALLTALK|SOCIAL|EVENTS|STORY)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/characters.js','src/data/events.js','src/social3d.js','src/events3d.js','src/story3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){}}; global.CHAR={setExpr(){}};
let said=[], opts=[];
const mkG=()=>({day:6,hour:19.5,zone:'wancai',weekday:1,flags:{},choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{an:6,zhe:12,sis:2,kai:3,yu:2},social:null});
let G=mkG();
const GM={get G(){ return G; },E:{q:{level:'medium'},player:{busy:false,obj:{position:{x:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null},D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(){},setGoal(){},toast(){},
  advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},
  say:async(who,t)=>{ said.push(t); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); return 0; }};
const fresh=()=>{ G=mkG(); SOCIAL.bind(G); EVENTS.bind(GM); said=[]; opts=[]; };
const evById=id=>STORY_EVENTS.find(e=>e.id===id);
const has=(id,tag)=>SOCIAL.has(id,tag);
(async()=>{
  // ---------- ① 事件引擎 ----------
  { fresh(); const t={id:'t_meet',participants:['heroine_04'],location:'any',trigger:'interact',dialogue:[{unless:{memory:[{npc:'heroine_04',tag:'FIRST_MET'}]},speaker:'heroine_04',text:'第一次見面的話'},{if:{memory:[{npc:'heroine_04',tag:'FIRST_MET'}]},speaker:'heroine_04',text:'又見面的話'}]};
    await EVENTS.run(t); const a=said.slice(); said=[]; await EVENTS.run(t); const b=said.slice();
    check('① 測試事件：第一次演＝「第一次見面的話」（沒有「又見面的話」）',a.includes('第一次見面的話')&&!a.includes('又見面的話'),JSON.stringify(a));
    check('① 第二次演＝「又見面的話」；第一次演完就記下 FIRST_MET',b.includes('又見面的話')&&!b.includes('第一次見面的話')&&has('heroine_04','FIRST_MET'),JSON.stringify(b)); }
  { fresh(); G.zone='wancai'; await EVENTS.run(evById('ev_ziqing_club')); const a=said.slice();
    check('① 子晴的吉他社（ev_ziqing_club）第一次：沒聽阿凱說過＝「新人？……」（BB_95 2-6；聽過＝「你就是阿凱的室友？」）、「我高子晴，資工系的。」，沒有「又來了」',a.some(t=>/^新人？/.test(t))&&a.some(t=>/我高子晴/.test(t))&&!a.some(t=>/又來了/.test(t)),a.slice(0,3).join(' / '));
    said=[]; G.day++; await EVENTS.run(evById('ev_ziqing_club')); const b=said.slice();
    check('① 第二次去吉他社：「又來了」，不再自我介紹',b.some(t=>/又來了/.test(t))&&!b.some(t=>/我高子晴/.test(t)),b.slice(0,2).join(' / ')); }
  { fresh(); G.zone='cafe'; await EVENTS.run(evById('ev_cafe_barista_zhiruo')); const a=said.slice(), o=(opts[0]||[]).join('／');
    check('① 芷若的兩點半（ev_cafe_barista_zhiruo）第一次：「歡迎光臨——喔，法律系的」；選項有「檸檬塔。然後——妳是外文系的？」（BB 6-1：第一次見面才問）',a.some(t=>/歡迎光臨/.test(t))&&/檸檬塔/.test(o),a[0]+'｜'+o);
    said=[]; opts=[]; G.day++; await EVENTS.run(evById('ev_cafe_barista_zhiruo')); const b=said.slice(), o2=(opts[0]||[]).join('／');
    check('① 第二次：沒有「歡迎光臨」、沒有問系所的選項，換成「老樣子？」（BB_95 2-2 交接包 v1；原本是「你又來了」）、不再說名字',!b.some(t=>/歡迎光臨/.test(t))&&!/檸檬塔/.test(o2)&&b[0]==='老樣子？'&&!b.some(t=>/林芷若/.test(t)),b[0]+'｜'+o2); }
  { fresh(); const ev=evById('ev_zhiruo_ge_group');
    check('① ev_zhiruo_ge_group 沒見過芷若也可以發生（前置條件不再要 FIRST_MET）',!ev.prereq||EVENTS.cond(ev.prereq),JSON.stringify(ev.prereq||null));
    G.zone='campus'; await EVENTS.run(ev); const a=said.slice();
    check('① 芷若的分組當第一次見面：她先報名字「林芷若，外文二。」、之後記下 FIRST_MET',a.includes('林芷若，外文二。')&&has('heroine_02','FIRST_MET'),a.slice(0,3).join(' / '));
    fresh(); SOCIAL.meet('heroine_02','cafe'); said=[]; await EVENTS.run(ev);
    check('① 已經認識芷若：分組時不再報名字',!said.includes('林芷若，外文二。'),said.slice(0,2).join(' / ')); }
  { fresh(); const ev=evById('ev_kai_mentions_ziqing');
    check('① 阿凱轉述子晴：還不認識子晴時可以',EVENTS.cond(ev.prereq||{}));
    SOCIAL.meet('heroine_04','wancai'); check('① 已經認識子晴：阿凱不再轉述（BB 6-1）',!EVENTS.cond(ev.prereq||{}),JSON.stringify(ev.prereq||null)); }
  // ---------- ② talkCharacter ----------
  { fresh(); G.zone='campus'; STORY.populate('none',GM); EVENTS.onInteract=()=>false;
    const n={id:'heroine_04',charId:'heroine_04',obj:{position:{x:1,z:1}},pose:'walk'}; await STORY.talkCharacter('heroine_04',n);
    check('② 在校園對還沒見過的子晴搭話：一句旁白、不自我介紹、不記 FIRST_MET',said.length===1&&/^（她/.test(said[0])&&!said.some(t=>/我是高子晴|資工/.test(t))&&!has('heroine_04','FIRST_MET'),JSON.stringify(said));
    delete EVENTS.onInteract; EVENTS.onInteract=undefined; load('src/events3d.js'); EVENTS.bind(GM);
    said=[]; G.zone='wancai'; await EVENTS.run(evById('ev_ziqing_club'));
    check('② 之後第一次去吉他社：照第一次見面演（「新人？……」「我高子晴，資工系的。」）',said.some(t=>/^新人？/.test(t))&&said.some(t=>/我高子晴/.test(t))&&!said.some(t=>/又來了/.test(t)),said.slice(0,2).join(' / ')); }
  { fresh(); G.zone='library'; STORY.populate('none',GM); EVENTS.onInteract=()=>false;
    const n={id:'heroine_03',charId:'heroine_03',obj:{position:{x:1,z:1}},pose:'read',seat:{x:1,z:1}}; await STORY.talkCharacter('heroine_03',n);
    check('② 總圖裡對還沒見過的語彤搭話（她坐著念書）：旁白、不記 FIRST_MET——之後總圖門口的相遇照樣會發生',said.length===1&&/低頭/.test(said[0])&&!has('heroine_03','FIRST_MET')&&EVENTS.cond(evById('ev_library_door_phone').prereq||{}),JSON.stringify(said)); }
  { fresh(); G.zone='library'; STORY.populate('none',GM); EVENTS.onInteract=()=>false;
    const id='classmate_bohan'; const n={id,charId:id,obj:{position:{x:1,z:1}},pose:'read'}; await STORY.talkCharacter(id,n);
    check('② 一般同學（柏翰）照舊：第一次搭話就自我介紹、記下 FIRST_MET（同學不算在內，AA、BB 2026-10-13）',has(id,'FIRST_MET')&&said.some(t=>/我是/.test(t)),said.slice(0,2).join(' / ')); }
  // ---------- ③ AA 2026-10-13 回報（P1-1、P1-2、P1-3 的「在她附近」）----------
  { fresh(); G.zone='campus'; STORY.populate('none',GM); EVENTS.onInteract=()=>false;
    const n={id:'heroine_02',charId:'heroine_02',obj:{position:{x:1,z:1}},pose:'walk'}; await STORY.talkCharacter('heroine_02',n); const r=SOCIAL.rel('heroine_02'), st=SOCIAL.stage('heroine_02'), nm=SOCIAL.displayName('heroine_02');
    check('③ P1-1 對還沒見過的芷若搭話一次：熟悉度 0、陌生人、不算聊過、名字不揭露（按鈕「和不認識的女生說話」）',r.fam===0&&(r.talked|0)===0&&st==='STRANGER'&&nm==='不認識的女生'&&n.talkLabel==='和不認識的女生說話'&&!has('heroine_02','FIRST_MET'),JSON.stringify({fam:r.fam,talked:r.talked,stage:st,name:nm,label:n.talkLabel})); }
  { load('src/events3d.js'); fresh(); G.zone='campus'; STORY.populate('none',GM);
    const n={id:'heroine_02',charId:'heroine_02',obj:{position:{x:1,z:1}},pose:'idle'}; await STORY.talkCharacter('heroine_02',n);
    check('③ P1-2 在傅鐘找還沒見過的芷若：不播「傅鐘旁邊」（認識以後的日常）、只有一句旁白、不記 FIRST_MET',!G.events.done.ev_zhiruo_bell&&said.length===1&&/^（她/.test(said[0])&&!has('heroine_02','FIRST_MET'),JSON.stringify(said));
    fresh(); G.zone='campus'; SOCIAL.meet('heroine_02','cafe'); said=[]; const ok=EVENTS.onInteract('heroine_02'); await new Promise(r=>setTimeout(r,20));   /* X.run 是非同步的：等對話演完 */
    check('③ P1-2 認識以後：「傅鐘旁邊」照常',ok&&!!G.events.done.ev_zhiruo_bell,JSON.stringify({ok,said:said[0]})); }
  { fresh(); Object.assign(G,{zone:'putong',day:10,weekday:5,hour:12.25}); const tried=[]; EVENTS.run=async ev=>{ tried.push(ev.id); };
    const P=GM.E.player; GM.E.zone={seats:[],roomAt:(x,z,lv)=>z<-1.2&&x<-4.4?'101':(z<1.6?'corridor':'lobby'),spaceAt:(x,z,lv)=>z<-1.2&&x<-4.4?'101':'public'};
    GM.npc.heroine_02={id:'heroine_02',charId:'heroine_02',obj:{position:{x:-4.8,z:0.9}},lv:0};
    P.obj.position.x=-5.6; P.obj.position.z=-2.0; EVENTS.tick(0.016); const inRoom=tried.includes('ev_zhiruo_ge_group');
    tried.length=0; P.obj.position.x=-7.0; P.obj.position.z=0.2; EVENTS.tick(0.016); const inHall=tried.includes('ev_zhiruo_ge_group');
    tried.length=0; P.obj.position.x=-2.5; P.obj.position.z=3.4; EVENTS.tick(0.016); const inLobby=tried.includes('ev_zhiruo_ge_group');
    check('③ P1-3 經原分組（在她 5 m 內）：她在 101 門口的走廊、玩家還在 101 裡（隔著牆 3 m）不觸發；走出 101 到走廊、或在旁邊開放的門廳（3.4 m）才觸發',!inRoom&&inHall&&inLobby,JSON.stringify({inRoom,inHall,inLobby,tried}));
    GM.npc={}; P.obj.position.x=0; P.obj.position.z=0; GM.E.zone={roomAt:()=>null,seats:[]}; }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
