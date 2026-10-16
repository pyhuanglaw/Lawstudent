// 作息的 near（芷若「外文系的課後在傅鐘附近」）：wander 走離那一點最近的路線、從最近的點出現——不需要瀏覽器。
// v9.8 回歸 flow_first_meet A：路線原本輪流分配，v9.8 多了幾個人以後她被分到校園另一頭（82 m 外、追不到）。修改前第 1 項失敗。用法：node tests/wander_near_unit.js
// 不需要瀏覽器：載入真正的 calendar.js、characters.js、story3d.js、博雅的座位配置（boya_layout.js：101 的座位、兩張圓桌），其餘最小替身；
// 照 GAME.enter 進入博雅（STORY.populate），再像 S.tick 那樣呼叫 STORY.refreshSchedule。
// 修改前這個測試會失敗（第 2 項：20:30 以後兩個人還坐在 101、沒有往圓桌走）。用法：node tests/schedule_roommove_unit.js
const vm=require('vm'), fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.THREE={Vector3:function(x,y,z){this.x=x;this.y=y;this.z=z;}};
global.P3={CAST:new Proxy({},{get:(t,k)=>({name:String(k)})})};
const mkObj=()=>({position:{x:0,y:0,z:0,set(x,y,z){this.x=x;this.y=y;this.z=z;}},rotation:{y:0},userData:{}});
global.CHAR={build:()=>mkObj(),setExpr(){}}; global.location={search:''};
global.SOCIAL={displayName:id=>(CHARACTERS[id]&&CHARACTERS[id].name)||id,stage:()=>'ACQ',noticed(){},reveal:()=>'ACQUAINTANCE',has:()=>true};
let GM=null; const ALIAS={heroine_01:'an',heroine_05:'sis',prof_zhou:'prof'};
global.EVENTS={npcOf:id=>GM.npc[id]||GM.npc[ALIAS[id]]||null,onEnter(){},tick(){}};
for(const f of ['src/data/calendar.js','src/data/characters.js','src/data/places.js','src/data/boya_layout.js','src/story3d.js']) vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (CALENDAR|CHARACTERS|STORY|PLACES|SOCIAL_GRAPH|UNFAMILIAR_POOL|PORTRAITS|BOYA_LAYOUT)\s*=/mg,'global.$1='),{filename:f});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
// 博雅的座位：和 teach3d.js seatsOf 一樣（101 的座位 room:'101'；圓桌 room:'round'、table:'r1'/'r2'）
const L=BOYA_LAYOUT, SEATS=[];
for(const r of L.rooms) for(const s of (r.seats||[])) SEATS.push(Object.assign({kind:'lecture'},s));
const TUE=7;   // 9/23 週二
function newGM(hour){
  const E={npcs:[],interactables:[],q:{level:'high'},zone:{seats:[],spawn:{x:0,z:0,lv:0}},levels:null,navOf:null,nav:null,indoor:false,camera:null,
    player:{obj:{position:{x:-38,y:0,z:6},rotation:{y:0}},busy:false,lv:0},addNPC(n){this.npcs.push(n);return n;},removeNPC(n){ this.npcs=this.npcs.filter(m=>m!==n); }};
  E.moveTo=()=>true;
  const G={day:TUE,weekday:2,hour,flags:{afternoonDone:true,classDone:true,metAn:true,zheInvite:true,zheNoodleDone:true},social:{},zone:'campus',goal:''};
  const gm={E,G,npc:{},extras:[],D:{active:false},hourRate:1/150};
  gm.spawnNPC=(id,spec,x,z,opts)=>{opts=opts||{};const o=mkObj();o.position.set(x,0,z);const n=E.addNPC({obj:o,id,charId:opts.charId||id,name:spec.name||id,beh:opts.beh||'idle',seat:opts.seat,pose:opts.pose,waypoints:opts.waypoints,lv:opts.lv|0});gm.npc[id]=n;return n;};
  gm.spawnCharacter=(id,x,z,opts)=>{const c=CHARACTERS[id];if(!c)return null;if(gm.npc[id])return gm.npc[id];const n=gm.spawnNPC(id,{name:c.name},x,z,Object.assign({charId:id},opts)); n.charId=id; return n;};
  gm.removeNPC=id=>{ const n=gm.npc[id]; if(n){ E.npcs=E.npcs.filter(m=>m!==n); delete gm.npc[id]; } };
  gm.spawnExtra=()=>{E.addNPC({obj:mkObj(),isExtra:true});}; gm.spawnRider=()=>{}; gm.sitAt=()=>{}; gm.standUp=()=>{}; gm.seatApproach=st=>[st.x,st.z];
  gm.knownIds=()=>Object.keys(CHARACTERS).filter(id=>CHARACTERS[id].social_layer!=='B');
  return gm; }
let ok=0;
for(let k=0;k<5;k++){ GM=newGM(11+20/60); try{ STORY.populate('campus',GM); }catch(e){ console.log('populate',e.message); } const n=GM.E.npcs.find(q=>q.charId==='heroine_02');
  const near=n&&n.waypoints&&n.waypoints.some(q=>Math.hypot(q[0]+38,q[1]-9)<1)&&Math.hypot(n.obj.position.x+38,n.obj.position.z-9)<3; if(near) ok++; if(k===0) check('1. 週二 11:20 芷若在校園：走傅鐘那一圈的路線、從傅鐘旁邊出現（near:[-38,9]）',near,n?JSON.stringify({pos:[n.obj.position.x,n.obj.position.z],wp:n.waypoints&&n.waypoints[0]}):'沒有芷若'); }
check('2. 重複五次都一樣（不靠輪流分配、不靠亂數）',ok===5,String(ok));
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
