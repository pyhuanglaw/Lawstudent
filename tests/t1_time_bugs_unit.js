// T1 隨機快轉抓到的兩個時間 bug（BB-C 11-04 17:30；CC 的 random_play_sim.js，紀錄 CC/logs/T1_1104 868e94d1b）——不需要瀏覽器。第三個（宿營換日）在 tests/camp_y1_unit.js 的 A2b。
// ① FORCING-SAVED-1104：story3d.js S.forceHome 原本把「正在送回去睡」記在 G.flags._forcing（會存檔）：演到一半 GM.enter／sleepNow 自動存檔＝true 存進去，
//    讀檔以後 forceHome 一進來就 return，再也不送人回去睡（時間跑到 29:00、47:00）。檢查：存檔裡帶著 _forcing:true 的舊存檔，凌晨照樣送回去（開始演「已經凌晨了」）；
//    演到一半存檔（JSON）沒有 _forcing；同一段還沒演完再叫一次不重複；讀檔（LOADLOCKS 放開）以後再叫會演
// ② CAFE-TIME-BACK-1104：第二天下午 Café／總圖那一場最後 GM.advance(17.7-G.hour) 沒看現在幾點，23:08 才開演會退回 17:42。檢查：23:08 開演、演完時間不會比開演早；14:12 開演照舊到 17:42
// 修改前（37c354189 的 story3d.js）：①三項、②兩項 FAIL；修改後 ALL PASS。用法：node tests/t1_time_bugs_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}}; global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } length(){ return Math.hypot(this.x,this.y,this.z); } normalize(){ const l=this.length()||1; this.x/=l; this.y/=l; this.z/=l; return this; } }};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|SMALLTALK|SOCIAL|EVENTS|STORY)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/characters.js','src/data/events.js','src/social3d.js','src/events3d.js','src/story3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(){}}; global.CHAR={setExpr(){}};
let said=[], sayHold=null;
const mkG=()=>({v:2,day:2,hour:14.2,zone:'cafe',weekday:4,money:2000,stage:'law',flags:{introDone:true,campusIntro:true,readCase:'full',classDone:true,metAn:true,plan:'cafe',companion:'an',walkCk:{road:true}},choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{an:6,zhe:12,sis:2,kai:3,yu:2},social:null});
let G=mkG();
const P={busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0};
const entered=[];
const GM={get G(){ return G; },E:{q:{level:'medium'},player:P,zone:{roomAt:()=>null,seats:[{x:1,z:1,lv:1,yaw:0},{x:2,z:2,lv:1,yaw:Math.PI}]},npcs:[],interactables:[],levels:null,setWeather(){},endCinematic(){}},D:{active:false,busyDepth:0},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},
  sitAt(){},standUp(){},walkTo:()=>Promise.resolve(true),removeNPC(){},hasNote:()=>true,advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},
  enter:async z=>{ entered.push(z); G.zone=z; },
  say:(who,t)=>{ said.push(t); return sayHold||Promise.resolve(); },
  choose:async()=>0};
const fresh=over=>{ G=mkG(); Object.assign(G.flags,over||{}); SOCIAL.bind(G); EVENTS.bind(GM); said=[]; sayHold=null; entered.length=0; GM.npc={an:{id:'an',charId:'heroine_01',name:'小安',obj:{position:{x:0,z:0}},beh:'follow'}}; };
const flush=async()=>{ for(let i=0;i<20;i++) await new Promise(r=>setImmediate(r)); };
(async()=>{
  // ---------- ① forceHome ----------
  { fresh(); G.day=20; G.hour=26.6; G.zone='campus'; G.flags.companion=null; G.flags._forcing=true;   /* 舊存檔：演到一半存進去的 */
    sayHold=new Promise(()=>{});   /* 停在第一句（不演到 sleepNow）：只看有沒有開始演 */
    void STORY.forceHome(GM); await flush();
    check('① 存檔帶著 _forcing:true（舊存檔）：凌晨照樣送回去（開始演「已經凌晨了」）',said.some(t=>/已經凌晨了/.test(t)),JSON.stringify(said));
    check('① 演到一半存檔（JSON）：沒有 _forcing',!('_forcing' in JSON.parse(JSON.stringify(G)).flags),JSON.stringify(G.flags));
    const n0=said.length; void STORY.forceHome(GM); await flush();
    check('① 同一段還沒演完再叫一次：不重複演',said.length===n0,String(said.length-n0));
    check('① 有登記讀檔放開的鎖（LOADLOCKS story3d:forcing）',!!(globalThis.LOADLOCKS&&typeof globalThis.LOADLOCKS['story3d:forcing']==='function'));
    if(globalThis.LOADLOCKS&&globalThis.LOADLOCKS['story3d:forcing']) globalThis.LOADLOCKS['story3d:forcing']();
    const n1=said.length; void STORY.forceHome(GM); await flush();
    check('① 讀檔（放開鎖）以後再叫：照樣演',said.length>n1,String(said.length-n1)); }
  // ---------- ② Café／總圖下午那一場 ----------
  for(const [nm,plan,zone,fn] of [['Café','cafe','cafe','cafeScene'],['總圖','library','library_hall','libraryScene']]){
    fresh({plan,walkCk:plan==='library'?{soc:true}:{road:true}}); G.zone=zone; G.hour=23+8/60; const h0=G.hour; await STORY._day2[fn](GM);
    check('② '+nm+' 23:08 才開演：演完時間不比開演早（原本退回 17:42）',G.hour>=h0-1e-9,'開演 '+h0.toFixed(2)+' → 演完 '+G.hour.toFixed(2));
    fresh({plan,walkCk:plan==='library'?{soc:true}:{road:true}}); G.zone=zone; G.hour=14.2; await STORY._day2[fn](GM);
    check('② '+nm+' 14:12 開演：照舊演到黃昏（17:42）',Math.abs(G.hour-17.7)<1e-6,G.hour.toFixed(3)); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
