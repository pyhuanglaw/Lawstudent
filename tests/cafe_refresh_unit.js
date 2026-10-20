// 待在 Café 裡，客人也照時段進出（X71 後續，BUG-CAFE-NPC-1020；BB-C 2026-10-20 BB_218：「待在店裡路人一直 2 位，走出再進來是 3 位（晚上的路人數不會補）」）——不需要瀏覽器。
//   S.populate 只在進門那一刻照 S.cafeCustomers 生客人；待在店裡、時段人數變了不會補也不會走。
//   1. 15:00 兩位 → 待到 19:30（三位）：多的那一位從門口走進來、坐到第三個位子（讀書的姿勢）；
//   2. 19:30 三位 → 待到 23:00（一位）：不在名單上的兩位 until＝現在（refreshSchedule 下面那一段讓他們走到門口才離開），留下的那位不動；
//   3. 那個位子玩家坐著：不進來；已經在的不重複生；
//   4. 芷若 Z3 那天 21:25 以後不進新客人；兩段感情攤牌那晚（S.cafeQuiet）不進客人、在的也走；
//   5. refreshSchedule（待在區域裡每 3 秒）在 Café 會呼叫它，populate 生的客人記 cafeCust；
//   6. 整個 refreshSchedule 跑一次：15:00 進門的兩位 → 19:30 變三位，23:00 兩位走到門口離開。
// 修改前 1～6 FAIL（0 是既有的名單，照舊通過）。用法：node tests/cafe_refresh_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}}; global.THREE={Vector3:function(){}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
global.CHAR={ build:()=>({position:{x:0,y:0,z:0,set(x,y,z){ this.x=x; this.y=y; this.z=z; }},rotation:{y:0}}) };
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|ACTIVITIES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/activities.js','src/data/events.js','src/social3d.js','src/events3d.js','src/story3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
// 座位排法照 zones3d.js 的兩點半（同 tests/cafe_customers_unit.js）
const seats=[]; for(let t=0;t<5;t++) for(const s of [-1,1]) seats.push({x:t*2-4,z:s*0.8,yaw:0}); seats.push({x:-0.85,z:1.5,yaw:0},{x:0.85,z:1.5,yaw:0}); for(const x of [-4.5,-2.9,-1.3,0.3]) seats.push({x,z:-3.3,yaw:Math.PI,bar:true}); for(const z of [2.85,3.4,3.95]) seats.push({x:-5.95,z,yaw:Math.PI/2,sofa:true});
const DOOR={x:0,z:4.6,yaw:Math.PI};
let G=null; const DAY=12;
const at=h=>{ G={day:DAY,hour:h,zone:'cafe',stage:'law',weekday:CALENDAR.dateOf(DAY).wd%7,flags:{introDone:true,afternoonDone:true,classDone:true},choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null}; SOCIAL.bind(G); };
const mkGM=()=>{ const E={zone:{seats,spawn:DOOR,indoor:true},npcs:[],interactables:[{x:0,z:5.6,exit:{to:'wenzhou'}}],player:{seat:null,obj:{position:{x:0,y:0,z:4}}},
    addNPC(o){ const n=Object.assign({},o); E.npcs.push(n); return n; }, removeNPC(n){ const i=E.npcs.indexOf(n); if(i>=0) E.npcs.splice(i,1); },
    moveTo(n,x,z,cb){ n.walkedFrom={x:n.obj.position.x,z:n.obj.position.z}; n.walkTo={x,z}; n.obj.position.x=x; n.obj.position.z=z; if(cb) cb(); return true; }};
  const GM={get G(){ return G; },E,npc:{},D:{active:false,busyDepth:0},spawnNPC(){ return null; },removeNPC(id){ delete GM.npc[id]; },sitAt(n,st){ n.seat=st; n.pose='sit'; },standUp(n){ n.seat=null; },seatApproach:st=>[st.x,st.z+0.6]};
  EVENTS.bind(GM); return GM; };
const seated=(GM,i)=>{ const s=seats[i]; return GM.E.addNPC({obj:{position:{x:s.x,y:0,z:s.z},rotation:{y:0}},name:'',beh:'idle',pose:'read',idlePose:'read',frozen:true,isExtra:true,cafeCust:i,seat:{x:s.x,z:s.z,yaw:s.yaw,lv:0}}); };
const cust=GM=>GM.E.npcs.filter(n=>n.cafeCust!=null);
const ok=typeof STORY.cafeRefresh==='function';
at(15); const w15=STORY.cafeCustomers(G,seats); at(19.5); const w19=STORY.cafeCustomers(G,seats); at(23); const w23=STORY.cafeCustomers(G,seats);
check('0. 名單照時段：15:00 兩位、19:30 三位（前兩位一樣）、23:00 一位（是 19:30 的第一位）', w15.length===2&&w19.length===3&&w19[0]===w15[0]&&w19[1]===w15[1]&&w23.length===1&&w23[0]===w19[0], JSON.stringify([w15,w19,w23]));
{ at(19.5); const GM=mkGM(); for(const i of w15) seated(GM,i); const k=ok?STORY.cafeRefresh(GM):0; const nw=cust(GM).find(n=>n.cafeCust===w19[2]);
  check('1. 15:00 兩位、待到 19:30：第三位從門口走進來、坐到他的位子（讀書）', ok&&k===1&&cust(GM).length===3&&!!nw&&nw.walkedFrom&&nw.walkedFrom.x===DOOR.x&&nw.walkedFrom.z===DOOR.z&&nw.seat===seats[w19[2]]&&nw.pose==='read'&&!nw.until, nw?JSON.stringify({from:nw.walkedFrom,seat:nw.seat===seats[w19[2]],pose:nw.pose,until:nw.until}):'沒有進來');
  const k2=ok?STORY.cafeRefresh(GM):0; check('3. 已經在的不重複生', ok&&k2===0&&cust(GM).length===3); }
{ at(23); const GM=mkGM(); const ns=w19.map(i=>seated(GM,i)); const k=ok?STORY.cafeRefresh(GM):0; const go=ns.filter(n=>n.until!=null&&n.until<=23);
  check('2. 19:30 三位、待到 23:00：另外兩位 until＝現在（要走），留下的那位不動', ok&&k===2&&go.length===2&&!go.includes(ns[0])&&ns[0].until==null&&cust(GM).length===3, JSON.stringify(ns.map(n=>n.until))); }
{ at(19.5); const GM=mkGM(); for(const i of w15) seated(GM,i); GM.E.player.seat=seats[w19[2]]; const k=ok?STORY.cafeRefresh(GM):0;
  check('3. 第三位的位子玩家坐著：不進來', ok&&k===0&&cust(GM).length===2); }
{ const zp=STORY.z3Pending; STORY.z3Pending=()=>true;
  at(21.5); let GM=mkGM(); seated(GM,w19[0]); let k=ok?STORY.cafeRefresh(GM):0; check('4. 芷若 Z3 那天 21:30（21:25 以後）：不進新客人', ok&&k===0&&cust(GM).length===1, 'k='+k);
  at(20.5); GM=mkGM(); seated(GM,w19[0]); seated(GM,w19[1]); k=ok?STORY.cafeRefresh(GM):0; const nw=cust(GM).find(n=>n.cafeCust===w19[2]);
  check('4. Z3 那天 20:30 進來的客人：until＝21:40（跟其他客人一起走）', ok&&k===1&&!!nw&&nw.until===STORY.Z3_SHUT, nw?String(nw.until):'沒有進來');
  STORY.z3Pending=zp; }
{ const td=STORY.twoHeartsCafeDue; STORY.twoHeartsCafeDue=()=>true; at(22.6); const GM=mkGM(); const n0=seated(GM,w23[0]); const k=ok?STORY.cafeRefresh(GM):0;
  check('4. 兩段感情攤牌那晚（打烊後）：不進客人、在的那位也走', ok&&typeof STORY.cafeQuiet==='function'&&STORY.cafeQuiet(G)&&k===1&&n0.until!=null&&n0.until<=22.6&&cust(GM).length===1);
  STORY.twoHeartsCafeDue=td; }
{ const s=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'); const m=s.match(/function refreshSchedule\(GM\)\{[\s\S]*?roomMove\(GM,zoneId\);/);
  check('5. refreshSchedule 在 Café 呼叫 cafeRefresh（在路人離開那一段之前）', !!m&&/zoneId==='cafe'[^\n]*cafeRefresh\(GM\)/.test(m[0]));
  check('5. populate 生的客人記 cafeCust（坐哪一號）、照 S.cafeQuiet 不生', /for\(const i of S\.cafeCustomers\(G,seats\)\)\{ if\(S\.cafeQuiet\(G\)\) continue;[^\n]*cafeCust:i/.test(s)); }
if(typeof STORY.refreshSchedule==='function'){ at(19.5); const GM=mkGM(); for(const i of w15) seated(GM,i);
  try{ STORY.refreshSchedule(GM); }catch(e){ console.log('  refreshSchedule 例外：'+e.message); }
  check('6. 整個 refreshSchedule：15:00 的兩位待到 19:30 變三位', cust(GM).length===3, String(cust(GM).length));
  at(23); try{ STORY.refreshSchedule(GM); }catch(e){ console.log('  refreshSchedule 例外：'+e.message); }
  const lv=cust(GM).filter(n=>n.leaving), stay=cust(GM).filter(n=>!n.leaving);
  check('6. 待到 23:00：兩位起身走到門口（leaving、走向出口），留下一位坐著', lv.length===2&&lv.every(n=>n.walkTo&&n.walkTo.x===0&&n.walkTo.z===5.6&&!n.seat)&&stay.length===1&&stay[0].cafeCust===w23[0]&&!!stay[0].seat, JSON.stringify(cust(GM).map(n=>({i:n.cafeCust,leaving:!!n.leaving,seat:!!n.seat}))));
  try{ STORY.refreshSchedule(GM); }catch(e){}
  check('6. 走到門口的下一輪離開（店裡剩一位）', cust(GM).length===1, String(cust(GM).length)); }
// 7. 要走的客人卡在門口（BB-C 79f2cd22：玩家站在門口，客人走不出去、疊在一起、一直不離開）：兩次檢查之間沒動、離出口 3.5 m 內＝當作出了門
if(typeof STORY.refreshSchedule==='function'){ at(23); const GM=mkGM(); GM.E.moveTo=(n,x,z,cb)=>{ n.obj.position.x=0; n.obj.position.z=4.1; return true; };   /* 走到門口前 1.5 m 就卡住（玩家站在門口），不會「走到了」*/
  for(const i of w19) seated(GM,i); GM.E.player.obj.position={x:0,y:0,z:4.6};
  try{ STORY.refreshSchedule(GM); }catch(e){}
  const n1=cust(GM).length; try{ STORY.refreshSchedule(GM); }catch(e){} const n2=cust(GM).length; try{ STORY.refreshSchedule(GM); }catch(e){} const n3=cust(GM).length;
  check('7. 要走的兩位卡在門口（沒走到）：下一、兩輪檢查就當作出了門，店裡剩一位', n1===3&&n3===1, [n1,n2,n3].join('→')); }
// 8. 要走的客人一直在動、但碰到站在入口那圈的玩家（BB-C 2026-10-20 CAFE 23:00 重驗：22:59～23:07 疊在一起）：離玩家 0.6 m 內、離出口 3.5 m 內＝下一輪就當作出了門
if(typeof STORY.refreshSchedule==='function'){ at(23); const GM=mkGM(); let k=0; GM.E.moveTo=(n,x,z,cb)=>{ k++; n.obj.position.x=0.25*(k%2); n.obj.position.z=4.4; return true; };   /* 在玩家身上來回動（每輪都動超過 0.2 m 的話舊的判斷抓不到）*/
  for(const i of w19) seated(GM,i); GM.E.player.obj.position={x:0,y:0,z:4.6};
  try{ STORY.refreshSchedule(GM); }catch(e){} const m1=cust(GM).length; try{ STORY.refreshSchedule(GM); }catch(e){} const m2=cust(GM).length;
  check('8. 要走的兩位疊在玩家身上（離玩家 0.6 m 內、門口 3.5 m 內）：下一輪就出門，店裡剩一位', m1===3&&m2===1, [m1,m2].join('→')); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
