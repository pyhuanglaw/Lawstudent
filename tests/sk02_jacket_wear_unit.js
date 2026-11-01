// 經濟系系外套穿在身上（SK02-LINE-JACKET-1030）——不需要瀏覽器。
// 使用者 10-30：「我選了穿去霖澤上課 結果我的衣服在遊戲裡面也沒換」。模型是 LAWWW2-B b84ce8d27（VRM 的 JACKET_ECON、宿舍 L2 椅背的 JACKET_CHAIR）。
// 規則（AA 劇情總監）：ev_sk02_spy 那天必穿；大一上、大一下最高溫 ≤20°C 的上課日出門穿、回宿舍掛椅背；大二起一直掛椅背；沒拿到外套＝都沒有。
//   最高溫：遊戲沒有氣溫資料，先用大一上第 10 週～大一下第 5 週的上課日（STORY.jacketCold，TODO 問 AA）。
// 檢查（用遊戲真正的 ev_sk02_jacket、ev_sk02_spy、CLS 課表、STORY.populate／tick；玩家模型是假的 VRM，但 CHAR.setJacket、z.setJacketChair 是從 src 抓出來的真的函式）：
//   1. 系辦選「（穿去霖澤館上課）」：事件一結束身上就穿著（S.tick），回宿舍房間（S.populate）脫下來掛椅背
//   2. 領外套以後下一次霖澤館的課：那天出門穿著、坐在霖澤館 201 上課也穿著；阿哲「臥底」那天穿著；翹了那一堂，七天內下一堂霖澤館的課照樣穿
//   3. 大一冷天（第 10 週起、大一下第 5 週以前）的上課日：出門穿、宿舍走廊穿、回房間掛椅背；沒課的日子、還不冷的週不穿（椅背掛著）
//   4. 大二起：冷天上課日也不穿、椅背一直掛著
//   5. 沒拿外套（送給阿勳、沒去領）、收進衣櫃／阿勳代領（房間物件「摺好的，還沒穿過」）：身上、椅背都沒有
//   6. 換區域、讀檔（存檔 JSON 來回、重建玩家模型、宿舍模型晚到）以後狀態還在；換成正式模型（CHAR.upgrade）帶著外套
//   7. 舊存檔（沒有 events.last、沒有 events、沒有課表紀錄）不出錯、照規則推
// 修改前（ca39039fe）：FAIL 23 項（沒有 CHAR.setJacket、z.setJacketChair、STORY.jacketSync——要穿、要掛椅背的全部沒有；本來就不該穿的那幾項會 PASS）。
//   只套 LAWWW2 的模型＋patch、還沒接穿的規則（4f698664d）：也是 FAIL 23 項（有開關、沒有人去開）。
// 用法：node tests/sk02_jacket_wear_unit.js（SRC_ROOT=<別的根目錄> 可以拿舊版的 src 來跑）
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=process.env.SRC_ROOT?path.resolve(process.env.SRC_ROOT):path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
/* 真的 CHAR.setJacket（character3d.js）、z.setJacketChair（zones3d.js 宿舍）：從原始碼抓出來（不載整個 three.js）。舊版沒有＝undefined */
function grabFn(src,head){ const i=src.indexOf(head); if(i<0) return null; let k=src.indexOf('{',i), d=0; for(;k<src.length;k++){ if(src[k]==='{') d++; else if(src[k]==='}'){ d--; if(!d) break; } } return src.slice(i+head.indexOf('function'),k+1); }
const C3=fs.readFileSync(path.join(ROOT,'src/character3d.js'),'utf8'), Z3S=fs.readFileSync(path.join(ROOT,'src/zones3d.js'),'utf8');
const setJacketSrc=grabFn(C3,'C.setJacket=function(h,on)');
const realSetJacket=setJacketSrc?vm.runInThisContext('('+setJacketSrc+')'):null;
const chairM=/z\.jacketChair=false; z\.setJacketChair=(on=>\{ z\.jacketChair=!!on;[^}]*\})/.exec(Z3S);
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(){}};
global.CHAR={setExpr(){},calls:[]}; if(realSetJacket) CHAR.setJacket=function(h,on){ CHAR.calls.push(!!on); return realSetJacket(h,on); };
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
/* 假的 VRM 玩家：model.traverse 走得到 JACKET_ECON（buildVRM 照 manifest hide 先藏起來）、後背包 */
const mkHero=()=>{ const jk={name:'JACKET_ECON',visible:false}; const bp={position:{y:1.1},scale:{x:1,y:1,z:1,set(x,y,z){ this.x=x; this.y=y; this.z=z; }},userData:{}};
  return {position:{x:0,y:0,z:0},rotation:{y:0},userData:{driver:'vrm',model:{traverse(f){ f({name:'Body'}); f(jk); }},props:{backpack:bp}},jk,bp}; };
/* 假的區域：宿舍房間有真的 setJacketChair；dormRoot（GLB）可以晚到 */
const mkZone=(id,glb)=>{ const z={id,roomAt:()=>null,seats:[]}; if(id==='dorm'&&chairM){ new Function('z','z.jacketChair=false; z.setJacketChair='+chairM[1]+';')(z); z.chair={name:'JACKET_CHAIR',visible:false}; if(glb!==false) z.dormRoot={getObjectByName:n=>n==='JACKET_CHAIR'?z.chair:null}; } return z; };
let said=[], opts=[], picks=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:mkHero(),lv:0},zone:mkZone('campus'),npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},extras:[],
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
global.GAME=GM;
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(day,hour,zone,flags)=>{ G={v:3,stage:'law',day,hour,zone,weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0},visited:{}};
  SOCIAL.bind(G); EVENTS.bind(GM); if(typeof INV!=='undefined') INV.rec(G); said=[]; opts=[]; picks=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; E.zone=mkZone(zone); E.player.obj=mkHero(); CHAR.calls=[]; };
const at=(x,z)=>{ E.player.obj.position.x=x; E.player.obj.position.z=z; E.player.lv=0; };
const lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const wait=async()=>{ for(let i=0;i<80&&EVENTS.running;i++) await new Promise(r=>setTimeout(r,0)); };
const sync=()=>{ if(STORY.jacketSync) STORY.jacketSync(GM); };
/* 換區域：和 game3d.js 的 enter 一樣（loadZone → G.zone → STORY.populate）；假的 GM 生不了 NPC，populate 後面出錯不管（外套在前面就處理了）*/
const go=zone=>{ E.zone=mkZone(zone); G.zone=zone; try{ STORY.populate(zone,GM); }catch(e){} };
const tick=()=>{ try{ STORY.tick(GM,0.5); }catch(e){} };
const worn=()=>!!E.player.obj.jk.visible, chair=()=>!!(E.zone.chair&&E.zone.chair.visible);
const lz=it=>!!(it&&it.room&&(it.room.zone==='classroom'||it.room.via==='linze'));
const items=d=>CLS.dayItems(G,d);
const termDay=(t,w,wd)=>STORY.termDay(t,w,wd);
(async()=>{
  check('0. ev_sk02_jacket 的「（穿去法律系館A上課）」記 ECON_JACKET wear（規則用的就是這個值）',(()=>{ const e=ev('ev_sk02_jacket'); const c=e&&e.dialogue.find(l=>l.choice); const o=c&&c.choice.find(q=>q.text==='（穿去法律系館A上課）'); return !!o&&o.set&&o.set.ECON_JACKET==='wear'; })());
  /* ===== 1. 系辦選「穿去霖澤館上課」===== */
  const mon4=termDay('Y1S1',4,1);
  fresh(mon4,15.5,'campus',{SK01_DAY:2,SK02_DM_DAY:mon4,MET_XUN:true}); at(15.4,-85); picks=['穿去法律系館A']; EVENTS.tick(0.1); await wait();
  check('1. 前提：系辦三選一選了「穿去法律系館A上課」（ECON_JACKET wear、SK02_DAY＝今天）',G.flags.ECON_JACKET==='wear'&&G.flags.SK02_DAY===mon4,JSON.stringify(opts[opts.length-1]));
  tick(); check('1. 事件一結束（S.tick）：身上穿著系外套（JACKET_ECON 顯示、後背包往外放）',worn()&&E.player.obj.bp.scale.x>1,'calls '+JSON.stringify(CHAR.calls));
  go('dorm_hall'); check('1. 走回宿舍走廊（還沒進房間）：還穿著',worn());
  go('dorm'); check('1. 進自己的房間（S.populate）：脫下來、掛在椅背（JACKET_CHAIR 顯示）',!worn()&&chair());
  /* ===== 2. 下一次霖澤館的課 ===== */
  let d1=null; for(let d=mon4+1;d<=mon4+7&&d1==null;d++) if(items(d).some(lz)) d1=d;
  let d2=null; for(let d=(d1||mon4)+1;d<=mon4+7&&d2==null;d++) if(items(d).some(lz)) d2=d;
  let dn=null; for(let d=mon4+1;d<=mon4+7&&dn==null;d++) if(items(d).length&&!items(d).some(lz)) dn=d;
  check('2. 前提：領外套後七天內有霖澤館的課（第 '+d1+'、'+d2+' 天）',d1!=null&&d2!=null);
  const s1=JSON.stringify(G);
  G.day=d1; G.weekday=wdOf(d1); G.hour=7.5; go('dorm'); check('2. 那天早上在房間：外套掛在椅背',!worn()&&chair());
  go('dorm_hall'); check('2. 出房間：穿上（領外套以後第一次霖澤館的課）',worn());
  go('campus'); go('classroom'); check('2. 坐在法律系館A 201 上課：穿著（使用者回報的那一次課）',worn());
  { const it=items(d1).find(lz); said=[]; await CLS.beforeClassEvent(GM,it); check('2. 上課前阿哲：「你是經濟系派來的臥底嗎？」',lines().includes('阿哲：你是經濟系派來的臥底嗎？'),JSON.stringify(lines())); }
  tick(); check('2. 阿哲說完（ev_sk02_spy 那天）：照樣穿著',worn()&&G.events.last.ev_sk02_spy===d1);
  G.day=d2; G.weekday=wdOf(d2); go('campus'); check('2. 阿哲說過以後，隔天又有霖澤館的課（第 '+d2+' 天，還不冷）：不穿（掛回椅背）',!worn());
  if(dn!=null){ G=JSON.parse(s1); SOCIAL.bind(G); EVENTS.bind(GM); G.day=dn; G.weekday=wdOf(dn); go('campus'); check('2. 領外套以後、阿哲說之前，沒有霖澤館課的上課日（第 '+dn+' 天）：不穿',!worn()); }
  /* 翹了那一堂：阿哲沒說到 → 七天內下一堂霖澤館的課照樣穿 */
  G=JSON.parse(s1); SOCIAL.bind(G); EVENTS.bind(GM); G.day=d2; G.weekday=wdOf(d2); G.hour=8; go('campus');
  check('2. 翹了第一堂（阿哲還沒說）：七天內下一個有霖澤館課的日子照樣穿',worn());
  /* ===== 3. 大一冷天 ===== */
  const findDay=(term,w0,w1,pred)=>{ for(let w=w0;w<=w1;w++) for(let wd=1;wd<=7;wd++){ const d=termDay(term,w,wd); if(d!=null&&pred(d)) return d; } return null; };
  const cls=d=>items(d).length>0&&!CALENDAR.holiday(d), nocls=d=>!items(d).length;
  const afterSpy=Object.assign(JSON.parse(s1),{}); afterSpy.events.done.ev_sk02_spy=1; afterSpy.events.last.ev_sk02_spy=d1; const sA=JSON.stringify(afterSpy);
  const use=(day,zone)=>{ G=JSON.parse(sA); SOCIAL.bind(G); EVENTS.bind(GM); G.day=day; G.weekday=wdOf(day); G.hour=9; E.player.obj=mkHero(); go(zone); };
  const c11=findDay('Y1S1',11,11,cls), w11=findDay('Y1S1',11,11,nocls), c9=findDay('Y1S1',9,9,cls), c10=findDay('Y1S1',10,10,cls), s3=findDay('Y1S2',3,3,cls), s5=findDay('Y1S2',5,5,cls), s6=findDay('Y1S2',6,6,cls);
  use(c11,'dorm'); check('3. 大一上第 11 週上課日、早上在房間：掛在椅背',!worn()&&chair());
  go('dorm_hall'); check('3. 出房間（宿舍走廊）：穿上',worn());
  go('campus'); check('3. 在校園：穿著',worn());
  go('dorm'); check('3. 回房間：脫下來掛椅背',!worn()&&chair());
  use(w11,'campus'); check('3. 第 11 週沒課的日子（週末）：不穿',!worn());
  use(w11,'dorm'); check('3. 第 11 週沒課的日子在房間：椅背掛著',chair());
  use(c9,'campus'); check('3. 第 9 週（還不冷）的上課日：不穿',!worn());
  use(c10,'campus'); check('3. 第 10 週起的上課日：穿（替代的冷天開始）',worn());
  use(s3,'campus'); check('3. 大一下第 3 週上課日：穿',worn());
  use(s5,'campus'); check('3. 大一下第 5 週上課日：穿',worn());
  use(s6,'campus'); check('3. 大一下第 6 週上課日：不穿（替代的冷天結束）',!worn());
  /* ===== 4. 大二起 ===== */
  const y2=findDay('Y2S1',12,12,cls), y2b=findDay('Y2S2',2,2,cls);
  use(y2,'campus'); check('4. 大二上第 12 週上課日：不穿',!worn());
  use(y2,'dorm'); check('4. 大二在房間：椅背一直掛著',chair());
  use(y2b,'campus'); check('4. 大二下第 2 週上課日：不穿',!worn());
  /* ===== 5. 沒有外套 ===== */
  const noJ=(val,label)=>{ const g=JSON.parse(sA); if(val==null) delete g.flags.ECON_JACKET; else g.flags.ECON_JACKET=val; const s=JSON.stringify(g);
    G=JSON.parse(s); SOCIAL.bind(G); EVENTS.bind(GM); G.day=c11; G.weekday=wdOf(c11); G.hour=9; E.player.obj=mkHero(); go('campus'); const a=!worn(); go('dorm'); const b=!worn()&&!chair(); check('5. '+label+'：大一冷天上課日也不穿、宿舍椅背也沒有',a&&b); };
  noJ('xun','②送給阿勳'); noJ(null,'沒去領（沒有 ECON_JACKET）'); noJ('closet','③收進衣櫃／第 8 週阿勳代領（房間物件「摺好的，還沒穿過」）');
  /* ===== 6. 換區域、讀檔、模型重建、模型晚到 ===== */
  use(c11,'campus'); const before=worn(); const sv=JSON.stringify(G);
  G=JSON.parse(sv); SOCIAL.bind(G); EVENTS.bind(GM); E.player.obj=mkHero(); go(G.zone);   /* 讀檔：G 換新的、一定換區域；玩家模型是重建的（外套藏著）*/
  check('6. 讀檔以後（存檔 JSON 來回、重建玩家模型）：還穿著',before&&worn());
  E.player.obj=mkHero(); tick(); check('6. 玩家模型重建（換模型）以後的下一次 S.tick：再穿上',worn());
  { G.zone='dorm'; E.zone=mkZone('dorm',false); try{ STORY.populate('dorm',GM); }catch(e){} const z=E.zone; z.dormRoot={getObjectByName:n=>n==='JACKET_CHAIR'?z.chair:null}; if(z.dormSet) z.dormSet('203'); else if(z.setJacketChair) z.setJacketChair(z.jacketChair);
    check('6. 宿舍模型（GLB）比換區域晚到：載好以後椅背照樣掛著',z.jacketChair===true&&z.chair.visible===true); }
  check('6. character3d.js：CHAR.upgrade（開發用模型換成正式 VRM）把外套帶過去',/if\(u\.jacket\) C\.setJacket\(nh,true\);/.test(C3));
  check('6. story3d.js：S.populate、S.tick 都會叫 STORY.jacketSync',/S\.populate=function\(zoneId,GM\)\{[^\n]*S\.jacketSync\(GM\)/.test(fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'))&&/S\.tick=function\(GM,dt\)\{ const G=GM\.G, F=G\.flags, E=GM\.E; S\.jacketSync\(GM\);/.test(fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8')));
  /* ===== 7. 舊存檔 ===== */
  { const g=JSON.parse(sA); delete g.events.last; G=g; SOCIAL.bind(G); EVENTS.bind(GM); G.day=c11; G.weekday=wdOf(c11); E.player.obj=mkHero(); let ok=true; try{ go('campus'); }catch(e){ ok=false; }
    check('7. 舊存檔沒有 events.last：不出錯、大一冷天上課日照樣穿',ok&&worn()); }
  { const g=JSON.parse(sA); delete g.events; delete g.courses; G=g; G.day=d2; G.weekday=wdOf(d2); E.player.obj=mkHero(); let ok=true; try{ if(STORY.jacketState) STORY.jacketState(G); sync(); }catch(e){ ok=false; }
    check('7. 舊存檔沒有 events、沒有課表紀錄：不出錯',ok); }
  { G=JSON.parse(sA); SOCIAL.bind(G); EVENTS.bind(GM); G.flags.ECON_JACKET='wear'; G.stage='econ'; G.day=c11; E.player.obj=mkHero(); go('campus'); check('7. 經濟系那一年（stage econ）：不穿',!worn()); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0); })().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); console.log('FAILED '+(fails+1)); process.exit(1); });
