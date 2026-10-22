// 人物線索和實際一致（2026-10-11 v9.5 審查：照行程出現的人原本只在「進入區域」時生出來；待在同一個區域時時間到了也不會出現或離開，
// 大地圖 👥、人物頁照時間寫「阿哲在校園」，卻要出去再進來他才會出現）。修正：story3d.js 的 refreshSchedule（S.tick 每 3 秒）。
// 不需要瀏覽器：載入真正的 characters.js、story3d.js（其餘最小替身），照 GAME.enter 進入區域（STORY.populate），
// 再照 game3d.js 的 frame() 讓時間流動（G.hour += dt·hourRate，每 30 幀呼叫一次 STORY.tick），比對 STORY.whereIs 和實際生出來的人。
// 修改前這個測試會失敗（阿哲、林芷若、小安時段到了都沒出現）。
// 用法：node tests/schedule_refresh_unit.js
const vm=require('vm'), fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.THREE={Vector3:function(x,y,z){this.x=x;this.y=y;this.z=z;}};
global.P3={CAST:new Proxy({},{get:(t,k)=>({name:String(k)})})};
const mkObj=()=>({position:{x:0,y:0,z:0,set(x,y,z){this.x=x;this.y=y;this.z=z;}},rotation:{y:0},userData:{}});
global.CHAR={build:()=>mkObj(),setExpr(){}}; global.location={search:''};
global.SOCIAL={displayName:id=>(CHARACTERS[id]&&CHARACTERS[id].name)||id,stage:()=>'ACQ',noticed(){},reveal:()=>'ACQUAINTANCE',has:()=>true};
let GM=null; const ALIAS={heroine_01:'an',heroine_05:'sis',prof_zhou:'prof'};
global.EVENTS={npcOf:id=>GM.npc[id]||GM.npc[ALIAS[id]]||null,onEnter(){},tick(){}};
for(const f of ['src/data/characters.js','src/data/places.js','src/story3d.js']) vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (CHARACTERS|STORY|PLACES|SOCIAL_GRAPH|UNFAMILIAR_POOL|PORTRAITS)\s*=/mg,'global.$1='),{filename:f});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
function newGM(zone,day,wd,hour,flags,seats,px){
  const E={npcs:[],q:{level:'high'},zone:{seats:seats||[]},levels:null,navOf:null,nav:null,indoor:zone!=='campus',camera:null,
    player:{obj:{position:{x:px||0,y:0,z:0},rotation:{y:0}},busy:false,lv:0},addNPC(n){this.npcs.push(n);return n;}};
  const G={day,weekday:wd,hour,flags:Object.assign({},flags),social:{},zone,goal:'自由的一天。去圖書館、公館，或找人聊天'};
  const gm={E,G,npc:{},extras:[],D:{active:false},hourRate:1/150};
  gm.spawnNPC=(id,spec,x,z,opts)=>{opts=opts||{};const o=mkObj();o.position.set(x,0,z);const n=E.addNPC({obj:o,id,charId:opts.charId||id,name:spec.name||id,beh:opts.beh||'idle',seat:opts.seat,waypoints:opts.waypoints});gm.npc[id]=n;return n;};
  gm.spawnCharacter=(id,x,z,opts)=>{const c=CHARACTERS[id];if(!c)return null;if(gm.npc[id])return gm.npc[id];const n=gm.spawnNPC(id,{name:c.name},x,z,Object.assign({charId:id},opts)); n.charId=id; return n;};
  gm.removeNPC=id=>{ const n=gm.npc[id]; if(n){ E.npcs=E.npcs.filter(m=>m!==n); delete gm.npc[id]; } };
  gm.spawnExtra=()=>{E.addNPC({obj:mkObj(),isExtra:true});}; gm.spawnRider=()=>{};
  gm.knownIds=()=>Object.keys(CHARACTERS).filter(id=>CHARACTERS[id].social_layer!=='B');
  return gm; }
const F0={afternoonDone:true,classDone:true,metAn:true,zheInvite:true,zheNoodleDone:true};
// 照 game3d.js frame()：每幀 dt≤0.1 s、G.hour += dt·hourRate；STORY.tick 大約每 0.5 秒一次
function flow(h1){ const dt=1/60; let frame=0; while(GM.G.hour<h1){ GM.G.hour+=dt*GM.hourRate; frame++; if(frame%30===0) STORY.tick(GM,dt*30); } }
const here=id=>!!EVENTS.npcOf(id), where=id=>STORY.whereIs(GM,id);
const fmt=h=>String(Math.floor(h)).padStart(2,'0')+':'+String(Math.round((h%1)*60)).padStart(2,'0');
// 1) 週五（第 3 天）14:30 進校園，待到 15:31：行程說在校園的人要出現
{ GM=newGM('campus',3,5,14.5,F0); STORY.populate('campus',GM); flow(15.52);
  const due=Object.keys(CHARACTERS).filter(id=>{ const w=where(id); return w&&w.zone==='campus'; });
  const miss=due.filter(id=>!here(id)); check('週五 14:30 進校園、待到 '+fmt(GM.G.hour)+'：行程說在校園的人都在（'+due.map(id=>CHARACTERS[id].name).join('、')+'）',due.length>0&&miss.length===0,miss.length?'沒出現：'+miss.map(id=>CHARACTERS[id].name).join('、'):''); }
// 2) 11:50 進校園，Alison 坐在傅鐘的長椅（行程到 12:00）；12:01 以後玩家離很遠：她離開
{ GM=newGM('campus',3,5,11.8333,F0,null,400); STORY.populate('campus',GM); const was=here('yu'); flow(12.05);
  check('11:50 Alison 在傅鐘長椅；12:00 時段結束、玩家在 12 m 外：她離開（人物線索也不再寫她在校園）',was&&!here('yu')&&!(where('yu')&&where('yu').zone==='campus'),'一開始 '+was+'、之後 '+here('yu')); }
// 3) 同上，但玩家就在旁邊、看得到：不在眼前消失（測試裡沒有鏡頭＝一律算看得到）
{ GM=newGM('campus',3,5,11.8333,F0,null,0); STORY.populate('campus',GM); const n=EVENTS.npcOf('yu'); if(n) GM.E.player.obj.position={x:n.obj.position.x+2,y:0,z:n.obj.position.z}; flow(12.05);
  check('時段結束、玩家在旁邊看著：Alison 不會憑空消失',!!n&&here('yu')); }
// 4) 18:40 進 Café，待到 19:01：林芷若 19:00 開始打工，要出現
{ const seats=Array.from({length:12},(_,i)=>({x:i,z:0,yaw:0,row:0,col:i})); GM=newGM('cafe',3,5,18.6667,F0,seats); STORY.populate('cafe',GM); const was=here('heroine_02'); flow(19.1);
  const w=where('heroine_02'); check('18:40 進 Café、待到 '+fmt(GM.G.hour)+'：林芷若（行程：'+(w?w.zone+' '+(w.act||''):'—')+'）在店裡',!was&&!!w&&w.zone==='cafe'&&here('heroine_02'),'一開始 '+was+'、之後 '+here('heroine_02')); }
// 5) 17:45 進校園，待到 18:01：小安 18:00 開始在校園走走，要出現
{ GM=newGM('campus',3,5,17.75,F0); STORY.populate('campus',GM); const was=here('heroine_01'); flow(18.1);
  const w=where('heroine_01'); check('17:45 進校園、待到 '+fmt(GM.G.hour)+'：小安（行程：'+(w?w.zone:'—')+'）出現',!was&&!!w&&w.zone==='campus'&&here('heroine_01'),'一開始 '+was+'、之後 '+here('heroine_01')); }
// 6) 補人不會重複：同一個人只有一個
{ GM=newGM('campus',3,5,14.5,F0); STORY.populate('campus',GM); flow(16.0); const ids=GM.E.npcs.filter(n=>!n.isExtra).map(n=>n.charId); const dup=ids.filter((x,i)=>ids.indexOf(x)!==i); check('待很久也不會生出兩個同一個人',dup.length===0,dup.join(',')); }
// 待在區域裡補人：時段剩不到 15 分鐘的不補（v9.6 回歸 flow_class_real 第二次：第二天的劇情課擋住補人，下課後同學在座位上憑空出現、一分鐘後又起身走到後門）
{ const seats=Array.from({length:8},(_,i)=>({x:i,z:0,yaw:0}));
  GM=newGM('library',2,4,18.85,F0,seats); STORY.refreshSchedule(GM); const late=here('classmate_peishan');
  GM=newGM('library',2,4,16.2,F0,seats); STORY.refreshSchedule(GM); const early=here('classmate_peishan');
  check('待在總圖時補人：郭沛珊（週四 16–19 在總圖）18:51 不補（剩 9 分鐘）、16:12 照舊補',!late&&early,JSON.stringify({late,early})); }
// 待在區域裡補人（室內）：從門口走進來、走到位子才坐下，不在座位上憑空出現（開發分支；v9.6 回歸 flow_class_real 看到同學在座位上冒出來）
{ const seats=Array.from({length:20},(_,i)=>({x:i,z:0,yaw:0})); const mv=[];
  GM=newGM('library',2,4,16.2,F0,seats); GM.E.zone.spawn={x:0,z:9,lv:0};
  GM.E.moveTo=(n,x,z,cb,lv)=>{ mv.push([n.charId,x,z]); n._arrive=cb; return true; }; GM.sitAt=(n,st)=>{ n.seat=st; n.pose='sit'; n.obj.position.set(st.x,0,st.z); }; GM.seatApproach=st=>[st.x,st.z+0.6];
  STORY.refreshSchedule(GM); const n=EVENTS.npcOf('classmate_peishan');
  const atDoor=!!n&&!n.seat&&n.obj.position.x===0&&n.obj.position.z===9&&!!n.seatTarget&&mv.some(m=>m[0]==='classmate_peishan'&&m[2]===n.seatTarget.z+0.6);
  if(n&&n._arrive) n._arrive(n); const sat=!!n&&!!n.seat&&n.pose==='read'&&!n.seatTarget;
  check('待在總圖、16:12 補人：郭沛珊從門口（0,9）走進來、走到位子才坐下（看書）',atDoor&&sat,JSON.stringify({atDoor,sat,mv}));
  GM=newGM('library',2,4,16.2,F0,seats); GM.E.zone.spawn={x:0,z:9,lv:0}; GM.E.moveTo=()=>true; GM.sitAt=(n,st)=>{ n.seat=st; };
  STORY.populate('library',GM); const m=EVENTS.npcOf('classmate_peishan');
  check('剛走進總圖（不是補人）：照舊已經坐在位子上',!!m&&!!m.seat&&!m.seatTarget,JSON.stringify(m&&{x:m.obj.position.x,z:m.obj.position.z})); }
console.log(fails?('FAILED '+fails):'ALL PASS');
process.exit(fails?1:0);
