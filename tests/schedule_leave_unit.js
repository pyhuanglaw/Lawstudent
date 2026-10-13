// 照行程出現的人，時段結束時怎麼離開（src/story3d.js 的 refreshSchedule／walkAway）——不需要瀏覽器。
// 2026-10-13 使用者試玩：「林芷若第一次講完話直接消失在校園，本來在我前面」——原本時段一結束，只要鏡頭沒對著她就拿掉，玩家一轉頭人就不見了。
// 修改後：還在附近的人先走到最近的門口／出口（坐著的先起身、聊天的對象放開），走到了才離開；已經在遠處又看不到的照舊直接離開。
// 修改前：第 2、3 項失敗（她不會走、走到門口也不會離開）。用法：node tests/schedule_leave_unit.js
const vm=require('vm'), fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.THREE={Vector3:function(x,y,z){this.x=x;this.y=y;this.z=z;}};
global.P3={CAST:new Proxy({},{get:(t,k)=>({name:String(k)})})};
const mkObj=()=>({position:{x:0,y:0,z:0,set(x,y,z){this.x=x;this.y=y;this.z=z;}},rotation:{y:0},userData:{}});
global.CHAR={build:()=>mkObj(),setExpr(){}}; global.location={search:''}; global.document={getElementById:()=>null,addEventListener(){}};
global.SOCIAL={displayName:id=>(CHARACTERS[id]&&CHARACTERS[id].name)||id,stage:()=>'ACQ',noticed(){},reveal:()=>'ACQUAINTANCE',has:()=>true};
let GM=null; const ALIAS={heroine_01:'an',heroine_05:'sis',prof_zhou:'prof'};
global.EVENTS={npcOf:id=>GM.npc[id]||GM.npc[ALIAS[id]]||null,onEnter(){},tick(){}};
for(const f of ['src/data/characters.js','src/data/places.js','src/data/calendar.js','src/data/courses.js','src/story3d.js','src/classes3d.js']) vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (CHARACTERS|STORY|PLACES|SOCIAL_GRAPH|UNFAMILIAR_POOL|PORTRAITS|CALENDAR|COURSES|CLS)\s*=/mg,'global.$1='),{filename:f});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
function newGM(zone,day,hour,flags,seats){
  const wd=(3+day-1)%7;   // 第 1 天週三＝3，週日＝0（和遊戲的 G.weekday 一樣）
  const E={npcs:[],interactables:[],q:{level:'high'},zone:{seats:seats||[]},levels:null,navOf:null,nav:null,indoor:zone!=='campus',camera:null,
    player:{obj:{position:{x:0,y:0,z:0},rotation:{y:0}},busy:false,lv:0},addNPC(n){this.npcs.push(n);return n;}};
  const G={day,weekday:wd,hour,flags:Object.assign({},flags),social:{},zone,goal:''};
  const gm={E,G,npc:{},extras:[],D:{active:false},hourRate:1/150};
  gm.spawnNPC=(id,spec,x,z,opts)=>{opts=opts||{};const o=mkObj();o.position.set(x,0,z);const n=E.addNPC({obj:o,id,charId:opts.charId||id,name:spec.name||id,beh:opts.beh||'idle',seat:opts.seat,waypoints:opts.waypoints});gm.npc[id]=n;return n;};
  gm.spawnCharacter=(id,x,z,opts)=>{const c=CHARACTERS[id];if(!c)return null;if(gm.npc[id])return gm.npc[id];const n=gm.spawnNPC(id,{name:c.name},x,z,Object.assign({charId:id},opts)); n.charId=id; return n;};
  gm.removeNPC=id=>{ const n=gm.npc[id]; if(n){ E.npcs=E.npcs.filter(m=>m!==n); delete gm.npc[id]; } };
  gm.spawnExtra=()=>{E.addNPC({obj:mkObj(),isExtra:true});}; gm.spawnRider=()=>{};
  gm.knownIds=()=>Object.keys(CHARACTERS).filter(id=>CHARACTERS[id].social_layer!=='B');
  return gm; }

const F0={afternoonDone:true,classDone:true,metAn:true,zheInvite:true,zheNoodleDone:true};
// 找一個芷若在校園的時段（照遊戲的作息資料）
let slot=null; for(let day=3;day<40&&!slot;day++) for(let hh=8;hh<22&&!slot;hh+=0.25){ const g=newGM('campus',day,hh,F0).G; const e=STORY.schedEnt(CHARACTERS.heroine_02,g); if(e&&e.zone==='campus'){ let end=hh; while(end<24){ const g2=newGM('campus',day,end+0.25,F0).G; const e2=STORY.schedEnt(CHARACTERS.heroine_02,g2); if(!(e2&&e2.zone==='campus')) break; end+=0.25; } slot={day,from:hh,to:end+0.25}; } }
check('作息資料裡芷若有在校園的時段',!!slot,JSON.stringify(slot));
if(slot){ GM=newGM('campus',slot.day,slot.to+0.1,F0); const E=GM.E;
  E.interactables=[{x:30,z:4,radius:1.5,label:'進入總圖書館',exit:{to:'library_hall'}},{x:-60,z:2,radius:2,label:'走出校門',exit:{to:'gongguan'}},{x:6,z:2,radius:0.8,label:'坐在長椅上',seat:{x:6,z:2}}];
  const moves=[]; E.moveTo=(n,x,z,cb,lv)=>{ moves.push([n.id,x,z]); n.path=[[x,z]]; n.onArrive=cb; return true; };
  const n=GM.spawnCharacter('heroine_02',4,0,{beh:'wander'}); n.sched=true; E.player.obj.position.x=2;   /* 玩家在她旁邊 2 m（看得到）*/
  STORY.refreshSchedule(GM);
  check('時段結束、玩家就在旁邊：她沒有當場消失',!!GM.npc.heroine_02,JSON.stringify(Object.keys(GM.npc)));
  check('她往最近的出口走（總圖門口，不是校門）：leaving、路線終點是總圖門口',n.leaving===true&&moves.some(m=>m[0]==='heroine_02'&&m[1]===30&&m[2]===4)&&n.beh==='leave',JSON.stringify(moves));
  STORY.refreshSchedule(GM); check('還在路上：不會被拿掉',!!GM.npc.heroine_02);
  n.onArrive(n); STORY.refreshSchedule(GM); check('走到門口了（進總圖）：離開',!GM.npc.heroine_02); }
// 已經在遠處：照舊直接離開（不需要走）；沒有出口可走的區域：照舊（看不到才離開）
if(slot){ GM=newGM('campus',slot.day,slot.to+0.1,F0); const E=GM.E; E.interactables=[]; E.moveTo=()=>true;
  const n=GM.spawnCharacter('heroine_02',4,0,{beh:'wander'}); n.sched=true; E.player.obj.position.x=2;
  STORY.refreshSchedule(GM); check('沒有出口的區域、玩家在旁邊：照舊不會當場拿掉（看得到）',!!GM.npc.heroine_02&&!n.leaving); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
