// 木曜日考試週：場景照進門那一句「（今天每一桌都坐了人。只剩吧檯旁邊一個位子。）」（BUG-MOKU-EXAM-SEATS-1110、USER_WANTS X270）——不需要瀏覽器（D131）。
// 使用者 11-10 00:3x：「去木曜日說只剩吧台有位置 但明明還有空桌 吧台也沒位子」（存檔 day 47 13:40 在木曜日）。
// 建出遊戲真正的木曜日（src/mokuyobi3d.js：座位、互動點、導航格），跑真正的 src/mokuyobi_sys3d.js（populate、examSync、tick、STORY.interact 那一層）和 src/crowd3d.js（路人的店）：
//   1 考試週、開著、一個人來：十一張桌子每一張都有人；「坐吧檯」有人；「坐吧檯旁邊」空著、路人和照作息的人不坐（taken）、玩家坐得到（按鈕照舊「坐吧檯旁邊」、站得住）
//   2 其他沒人坐的位子＝「有人了」（按鈕的字、按了只說「有人了。」、不出座位選單）；玩家能坐的位子只剩吧檯旁邊那一個；桌上放東西（SEATACT.AWAY）
//   3 進門那一句照舊（台詞不改）、路人系統這段時間不排木曜日的客人
//   4 待著的時候：一桌的人走了＝從樓梯口走上來補一位（不憑空出現）；照作息的人坐到「有人了」的位子照常
//   5 不是考試週、一起來的（約好）＝照舊（沒有「有人了」、吧檯旁邊不留）；打烊那一刻放開
// 修改前（06e779533）：1、2、3（路人照排）、4 FAIL。
// 用法：node tests/moku_exam_seats_1110_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node')); console.warn=()=>{};
const T=fs.readFileSync(path.join(ROOT,'tests/nav_buildings_unit.js'),'utf8');
const files=[...new Set([...eval(T.match(/const files=(\[[^\]]+\])/)[1]),'src/data/calendar.js','src/data/places.js','src/data/wz_park_layout.js','src/data/wz_shops_layout.js','src/data/lane118_layout.js','src/data/lane118_shops.js','src/data/l118_redo772.js','src/data/lane118_props.js',
  'src/data/xinsheng_layout.js','src/data/bike_layout.js','src/data/cvs_layout.js','src/data/yejian_layout.js','src/data/aoki_layout.js','src/xinsheng3d.js','src/data/mokuyobi_layout.js','src/mokuyobi3d.js','src/crowd3d.js'])];
const order=f=>f.startsWith('lib/')?0:(f.startsWith('src/data/')?1:(f==='src/zones3d.js'?2:(/xinsheng3d|mokuyobi3d/.test(f)?3:4)));
const pre=files.filter(f=>order(f)<2).concat(['src/zones3d.js']).concat(files.filter(f=>order(f)===3)).concat(files.filter(f=>order(f)===4&&f!=='src/zones3d.js'));
const run=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
global.CHAR={build:()=>new THREE.Object3D(),SIT_TOP:0.45};
for(const f of pre){ if(fs.existsSync(path.join(ROOT,f))) run(f); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+String(info).slice(0,500):'')); if(!ok) fails++; };
const J=x=>JSON.stringify(x);
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
ASSETS.loadOne=()=>Promise.reject(new Error('no GLB in node'));
E.addNPC=n=>{ n.lv=n.lv|0; n.radius=0.32; E.npcs.push(n); return n; }; E.removeNPC=n=>{ const i=E.npcs.indexOf(n); if(i>=0) E.npcs.splice(i,1); };   /* 引擎的 addNPC 要畫面（scene）：這裡只記人 */
const ZONE='wz_mokuyobi';
/* 假的 STORY（MOKS 接在 STORY.populate／interact／TICKS 上；populate 原本那一層＝照作息放人，這裡由測試自己放）*/
let schedPeople=[];
global.STORY={TICKS:[],PRE_TALK:[],interact:async()=>'orig',onSeat:async()=>false,onStudy(){},studyNarr:()=>null,extraSpec:n=>({n}),schedEnt:()=>null,
  populate:(zoneId,GM)=>{ for(const [id,tab] of schedPeople){ const st=E.zone.seats.filter(q=>q.table===tab&&!q.taken).pop(); if(st){ const n=E.addNPC({obj:new THREE.Object3D(),name:id,charId:id,beh:'idle',pose:'read',lv:1}); GM.sitAt(n,st); n.sched=true; } } }};
global.SEATACT={AWAY:[]};
run('src/mokuyobi_sys3d.js');
const L=MOKUYOBI_LAYOUT;
let G=null, toasts=[], menus=[];
const GM={get G(){ return G; },E,npc:{},enterN:1,titleIdle:false,
  sitAt(n,st){ n.seat=st; n.pose='sit'; n.idlePose='sit'; n.frozen=true; n.path=null; if(st.lv!=null&&E.levels) E.setLv(n,st.lv); n.obj.position.set(st.x,0,st.z); },
  standUp(n){ n.seat=null; n.pose='idle'; n.frozen=false; },
  seatApproach:st=>[st.x+Math.sin(st.yaw||0)*-0.6,st.z+Math.cos(st.yaw||0)*-0.6],
  toast(t){ toasts.push(t); }, say:async()=>{}, sceneBegin(){}, sceneEnd(){}, choose:async()=>0, autosave(){}, seatMenu:async it=>{ menus.push(it); }};
const wdOf=d=>CALENDAR.dateOf(d).wd%7;
let EX=null, NX=null; for(let d=1;d<1600&&(!EX||!NX);d++){ const t=CALENDAR.termOf(d); if(!PLACES.isOpen(ZONE,15,d)) continue; if(!EX&&t&&t.exam&&d>=40) EX=d; if(!NX&&t&&!t.exam&&d>=40) NX=d; }
function enter(day,hour,o){ o=o||{}; G={stage:'law',day,hour,zone:ZONE,weekday:wdOf(day),flags:{},invites:o.invites||[],money:1000,mokuyobi:{n:3,seats:{},first:1}};
  E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.exits=[]; E.spawnHint=null; const z=Z3.ZONES[ZONE].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.nav) E.nav._cm=null;
  E.player={obj:{position:new THREE.Vector3(-3.75,0,5.4),rotation:{y:0},userData:{}},radius:0.32,lv:0,seat:null,pose:'idle'}; if(E.fitSeatRadius) E.fitSeatRadius();
  GM.enterN++; toasts=[]; menus=[]; STORY.populate(ZONE,GM); return z; }
const people=()=>E.npcs.filter(n=>n&&!n.mokBoss&&!n.leaving);
const near=(a,b)=>!!a&&Math.hypot(a.x-b.x,a.z-b.z)<0.35;
const whoAt=st=>people().find(n=>near(n.seat,st)||near(n.seatTarget,st));
const itOf=st=>E.interactables.find(q=>q.seat&&q.shop==='mokuyobi'&&Math.hypot(q.seat.x-st.x,q.seat.z-st.z)<0.05);
const barS=()=>{ const s=L.seats.find(q=>q.label==='坐吧檯旁邊'); return E.zone.seats.find(q=>Math.hypot(q.x-s.x,q.z-s.z)<0.05); };
const barMain=()=>{ const s=L.seats.find(q=>q.label==='坐吧檯'); return E.zone.seats.find(q=>Math.hypot(q.x-s.x,q.z-s.z)<0.05); };
const tables=()=>[...new Set(E.zone.seats.map(q=>q.table))];
/* 玩家能坐的位子：沒有人坐、按鈕不是「有人了」（game3d.js 的 GM.freeSeat 只看有沒有人坐；「有人了」由 STORY.interact 先接走）*/
const playerFree=()=>E.zone.seats.filter(st=>{ const it=itOf(st); return it&&!it.mokHeld&&!whoAt(st); });
/* 照作息的人挑位子（story3d.js populateSchedule 的 seatFree：沒人、不是 taken）*/
const schedPick=()=>E.zone.seats.filter(st=>!st.taken&&!whoAt(st));
(async()=>{ try{
  check('0 找得到考試週（開著）和平常的一天',!!EX&&!!NX,J([EX,NX]));
  check('0 進門那一句照舊（S.L.exam，不改）',MOKS.L.exam==='（今天每一桌都坐了人。只剩吧檯旁邊一個位子。）',MOKS.L.exam);
  // ---- 1、2 考試週、一個人 ----
  enter(EX,15);
  const emptyT=tables().filter(t=>!E.zone.seats.some(q=>q.table===t&&whoAt(q)));
  check('1 考試週 15:00 一個人：十一張桌子每一張都有人',tables().length===11&&!emptyT.length,J({tables:tables().length,empty:emptyT}));
  check('1 吧檯那一桌：「坐吧檯」有人、「坐吧檯旁邊」空著',!!whoAt(barMain())&&!whoAt(barS()),J([!!whoAt(barMain()),!!whoAt(barS())]));
  check('1 「坐吧檯旁邊」留給玩家：路人、照作息的人不坐（taken）、按鈕照舊',!!barS().taken&&itOf(barS()).label==='坐吧檯旁邊'&&!itOf(barS()).mokHeld,J([barS().taken,itOf(barS()).label]));
  const ap=GM.seatApproach(barS()); check('1 「坐吧檯旁邊」走得到（走近點站得住）',E.canStand(ap[0],ap[1],0.32,1)||E.canStand(barS().x+0.6,barS().z,0.32,1),J(ap));
  const pf=playerFree(); check('2 玩家能坐的位子只剩「坐吧檯旁邊」那一個',pf.length===1&&pf[0]===barS(),J(pf.map(q=>[q.table,q.x,q.z])));
  const held=E.zone.seats.filter(st=>!whoAt(st)&&st!==barS());
  check('2 其他沒人坐的位子按鈕寫「有人了」',held.length>0&&held.every(st=>itOf(st).label==='有人了'&&itOf(st).mokHeld),J(held.map(st=>itOf(st).label)));
  const r=await STORY.interact(itOf(held[0]),GM); check('2 按「有人了」：只說「有人了。」、不出座位選單',r===true&&J(toasts)===J(['有人了。'])&&!menus.length,J([r,toasts]));
  const aw=SEATACT.AWAY.map(f=>f(GM)).flat(); check('2 桌上放東西（SEATACT.AWAY）：每一個「有人了」的位子',aw.length===held.length&&held.every(st=>aw.includes(st)),J([aw.length,held.length]));
  check('2 人數：一桌一位（≤ 11 位，不含老闆）',people().length<=11&&people().length>=10,people().length);
  // ---- 3 進門那一句、路人 ----
  { E.player.lv=1; E.player.obj.position.set(L.stairWell.x1+1,0,2.0); const said=[]; GM.say=async(w,t)=>{ said.push(t); }; const k=await MOKS.door(GM); GM.say=async()=>{};
    check('3 進門：考試週那一句照舊',k==='exam'&&J(said)===J([MOKS.L.exam]),J([k,said])); }
  { const def=CROWD.SHOP_ZONES[ZONE], pl=CROWD.shopPlan(def,G); check('3 路人系統：考試週一個人來的時候不排木曜日的客人（人由 MOKS 放）',!!def&&pl.units.every(u=>!u.length),J(pl.units.map(u=>u.length))); }
  check('3 照作息的人挑位子：不會挑到「坐吧檯旁邊」',!schedPick().includes(barS()),J(schedPick().map(q=>[q.table,q.x,q.z])));
  // ---- 4 待著的時候 ----
  { const t5=E.zone.seats.filter(q=>q.table===5), n=people().find(p=>t5.some(q=>near(p.seat,q))); E.removeNPC(n);
    MOKS.examTick(GM); const m=people().find(p=>t5.some(q=>near(p.seat,q)||near(p.seatTarget,q)));
    check('4 第 5 桌的人走了：tick 補一位，從樓梯口走上來（seatTarget，不是直接坐在位子上）',!!m&&!!m.seatTarget&&!m.seat&&Math.hypot(m.obj.position.x-MOK3.IN.x,m.obj.position.z-MOK3.IN.z)<1.5,J(m&&{t:m.seatTarget&&[m.seatTarget.x,m.seatTarget.z],at:[m.obj.position.x,m.obj.position.z]}));
    const pf2=playerFree(); check('4 補人以後玩家能坐的還是只有吧檯旁邊',pf2.length===1&&pf2[0]===barS(),pf2.length); }
  { schedPeople=[['classmate_bohan',3]]; enter(EX,15); schedPeople=[];
    const bh=people().find(p=>p.charId==='classmate_bohan'), t3=E.zone.seats.filter(q=>q.table===3);
    check('4 照作息的人（柏翰）先坐了第 3 桌：那一桌不再多放路人、空的那一個是「有人了」',!!bh&&people().filter(p=>t3.some(q=>near(p.seat,q))).length===1&&t3.filter(q=>!whoAt(q)).every(q=>itOf(q).mokHeld),J(t3.map(q=>[!!whoAt(q),itOf(q).label])));
    const pf=playerFree(); check('4 玩家能坐的只剩吧檯旁邊',pf.length===1&&pf[0]===barS()); }
  // ---- 5 照舊的情況 ----
  { enter(NX,15); const anyHeld=E.interactables.some(q=>q.mokHeld);
    check('5 不是考試週：沒有「有人了」、吧檯旁邊不留、不放考試週的人',!anyHeld&&!barS().taken&&!people().some(p=>p.mokExam),J([anyHeld,barS().taken])); }
  { enter(EX,15,{invites:[{id:'iv',who:'heroine_01',place:'mokuyobi',zone:ZONE,day:EX,h:15,state:'going'}]}); const anyHeld=E.interactables.some(q=>q.mokHeld);
    check('5 考試週但約好一起來：照舊（沒有「有人了」、吧檯旁邊不留）',!anyHeld&&!barS().taken&&!people().some(p=>p.mokExam),J([anyHeld,barS().taken])); }
  { enter(EX,15); G.hour=22.05; MOKS.examTick(GM); const anyHeld=E.interactables.some(q=>q.mokHeld);
    check('5 22:00 打烊那一刻：放開（沒有「有人了」、吧檯旁邊不留）',!anyHeld&&!barS().taken,J([anyHeld,barS().taken])); }
  }catch(e){ check('跑到一半出錯（例外）',false,e&&e.stack||e); }
  console.log(fails?('FAILED '+fails):'ALL PASS');
  process.exit(fails?1:0);
})();
