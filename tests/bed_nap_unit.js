// 床的選項與小睡（story3d.js 的 S.bedOptions、classes3d.js 的 CLS.skipTo(GM,h,{nap:true})）——不需要瀏覽器。
// 2026-10-13 使用者試玩：「睡覺只能隔天醒來？應該要有小睡一下的選項」「早上睡覺醒來變成下午、下午睡覺起來變成晚上」。
// 檢查：早上有「小睡到 13:00」「睡到傍晚 18:00」、下午有「小睡到 18:00」、晚上（17:30 以後、過午夜）才有「睡到明天早上」；第一、二天照劇情只有「睡覺」；
//       小睡：時間到 13:00／18:00、體力回一點、旁白寫醒來；中間有約好的時間會先叫醒（和手機跳過時間同一套）；會錯過的課先問一次。
// 修改前：沒有 S.bedOptions（第 1 項就失敗）。用法：node tests/bed_nap_unit.js
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

check('有 STORY.bedOptions',typeof STORY.bedOptions==='function');
if(fails){ console.log('FAILED '+fails); process.exit(1); }
const F0={afternoonDone:true,classDone:true,metAn:true,zheInvite:true,zheNoodleDone:true};
const kinds=G=>STORY.bedOptions(G).map(o=>o.kind+(o.to?':'+o.to:'')).join(',');
{ const g=d=>(h)=>newGM('dorm',d,h,F0).G; const d5=g(5);
  check('早上 09:00：小睡到 13:00、睡到傍晚 18:00、再撐一下（沒有睡到明天）',kinds(d5(9))==='nap:13,nap:18,stay',kinds(d5(9)));
  check('下午 14:00：小睡到 18:00、再撐一下',kinds(d5(14))==='nap:18,stay',kinds(d5(14)));
  check('傍晚 17:45：睡覺（到明天早上）、再撐一下',kinds(d5(17.75))==='sleep,stay',kinds(d5(17.75)));
  check('晚上 22:00：睡覺、再撐一下',kinds(d5(22))==='sleep,stay',kinds(d5(22)));
  check('過午夜 25:00：睡覺、再撐一下',kinds(d5(25))==='sleep,stay',kinds(d5(25)));
  check('第一、二天（劇情）：只有睡覺、再撐一下',kinds(g(1)(21.5))==='sleep,stay'&&kinds(g(2)(10))==='sleep,stay',kinds(g(2)(10))); }
// 小睡（用遊戲真正的 CLS.skipTo）
function napGM(day,hour){ const gm=newGM('dorm',day,hour,F0); const G=gm.G; G.energy=40; G.zone='dorm'; const log=[];
  Object.assign(gm,{fade:async()=>{},sleep:async()=>{},sceneBegin(){},sceneEnd(){},advance:hh=>{ G.hour+=hh; },energy:d=>{ G.energy=Math.max(0,Math.min(100,G.energy+d)); },caption:(a,t)=>log.push(t),toast:t=>log.push('toast:'+t),choose:async()=>0,autosave(){},setGoal(){}}); gm.log=log; return gm; }
(async()=>{
  { const gm=napGM(6,9.0); const ok=await CLS.skipTo(gm,13,{nap:true});
    check('09:00 小睡到下午：醒來 13:00、體力 +32（每小時 +8）、旁白寫醒來',ok&&Math.abs(gm.G.hour-13)<0.01&&gm.G.energy===72&&gm.log.some(t=>/睡了一下，醒來是 13:00/.test(t)),`${gm.G.hour} 體力 ${gm.G.energy} ${gm.log.join(' / ')}`); }
  { const gm=napGM(6,14.0); gm.G.invites=[{who:'zhe',day:6,h:16,accepted:true,done:false,label:'和阿哲約在 Café'}]; const ok=await CLS.skipTo(gm,18,{nap:true});
    check('14:00 小睡、16:00 有約：15:50 先醒（和手機跳過時間一樣）',ok&&Math.abs(gm.G.hour-(16-1/6))<0.01&&gm.log.some(t=>/約好的時間/.test(t)),`${gm.G.hour.toFixed(3)} ${gm.log.join(' / ')}`); }
  { const gm=napGM(2,9.0); const ok=await CLS.skipTo(gm,13,{nap:true}); check('第二天不能小睡跳時間（劇情）',!ok&&gm.G.hour===9,gm.log.join(' / ')); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0); })();
