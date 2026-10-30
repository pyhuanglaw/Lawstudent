// 體育館路人「聽一句」（AA_489 第 4 節，AA-C 2026-10-27；使用者 X108）——不需要瀏覽器。在 Node 建出遊戲真正的體育館三層，照 GAME.enter 進館（CROWD.enter）：
//   1. 1F：服務台的工讀生、羽球場打球的人有句子（照 AA 的表）；散步的人、長椅上的人沒有；同一次進來同一種人不重複，用完了其他人不說
//   2. 下一次進來從下一句開始（照區域輪，G.flags.gymHear）；3. B1：櫃台阿姨一句、運動的人兩句；4. 3F：打球的人兩句、看球的人一句；5. 體育課：老師（課堂上的稱呼）一句、同學兩句
// 修改前（87df07d99）：第 1 項 FAIL（沒有人能聽一句）。用法：node tests/gym_hear_unit.js
// AA_495（AA-C 2026-10-28，CROWD-DEPTS-1028）：體育館加三句，跟這 13 句一起輪（羽球場、籃球場、場邊各多一句，說的人是外文系、化學系、醫學系的學生）——第 0、1、4 項的句數照 AA_495 改（13→16；羽球場 3、籃球場 3、場邊 2），檢查一樣：每一種人這一次說的句子不重複、句子用完了其他人不說。
//   這裡沒有載入 src/data/crowd_depts.js：散步的人、長椅上的人照 AA_489 沒有句子；載入以後他們是「體」的系（AA_495），在 tests/crowd_depts_unit.js 測。
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const warn0=console.warn; console.warn=()=>{}; process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
const GL=/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|GYM_LAYOUT|GY3|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|CALENDAR|PLACES|ACTIVITIES|COURSES|SYLLABUS|CLS|CROWD|PROPS|CHAR)$/;
for(const f of ['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
  'src/data/gym_layout.js','src/gym3d.js','src/data/characters.js','src/data/calendar.js','src/data/places.js','src/data/activities.js','src/data/courses.js','src/data/syllabus.js','src/classes3d.js','src/crowd3d.js']){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>GL.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.CHAR={build:spec=>{ const g=new THREE.Group(); g.userData.spec=spec; return g; },release(){}};
global.STORY={extraSpec:i=>({id:'x'+i,sex:i%2===0?'f':'m'}),profSpec:c=>({id:c.id,name:c.name,sex:c.gender==='f'?'f':'m'}),CROWD_X:2};
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
E.addNPC=n=>{ n.path=null; n.speed=0; n.pose=n.pose||'idle'; n.radius=0.32; n.lv=n.lv|0; if(n.seat&&n.seat.y!=null) n.obj.position.y=n.seat.y; E.npcs.push(n); return n; }; E.removeNPC=n=>{ E.npcs=E.npcs.filter(m=>m!==n); };
global.GAME={G:null};
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
const mkG=(key,h)=>({day:dayOf(key),hour:h,flags:{},weekday:CALENDAR.dateOf(dayOf(key)).wd%7,stage:'law'});
const ppl=()=>E.npcs.filter(n=>n.crowd&&/^gym_/.test(n.crowd));
const role=r=>ppl().filter(n=>n.crowdRole===r);
const TUE='2025-09-23', SAT='2025-09-27', SUN='2025-09-28', MON4='2025-09-22';
/* 有玩家體育課的星期一（大一上第 3 週以後、不是國定假日、不是第四個星期一）：照課表找，不寫死 */
const MONPE=(()=>{ for(let d=1;d<120;d++){ const q=CALENDAR.dateOf(d), t=CALENDAR.termOf(d); if(!t||t.week<3||q.wd!==1||(q.d>=22&&q.d<=28)) continue; const G={day:d,hour:15.8,flags:{},stage:'law'}; if(CLS.dayItems(G).some(it=>it.room&&it.room.door==='gym')) return q.key; } return null; })();
let VIS=0;
function enter(id,G){ GAME.G=G; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; else if(z.nav) z.nav._cm=null;
  E.player={obj:{position:new THREE.Vector3(z.spawn.x,0,z.spawn.z),rotation:{y:0}},radius:0.32,lv:0,seat:null}; E.camera=null; G.zone=id; const GM={G,E,enterN:++VIS,hourRate:1/150,sitAt:(n,st)=>{ n.seat=st; n.pose='sit'; n.frozen=true; n.path=null; n.obj.position.set(st.x,st.y||0,st.z); n.obj.rotation.y=st.yaw||0; }};
  CROWD.enter(GM,id); return {z,GM}; }
const H=CROWD.GYM_HEAR, J=JSON.stringify, said=r=>role(r).filter(n=>n.hear).map(n=>n.hear.t), uniq=a=>new Set(a).size===a.length;
check('0. 句子照 AA_489 第 4 節（13 句）＋AA_495 體育館加三句＝16 句',!!H&&Object.values(H).reduce((a,h)=>a+h.L.length,0)===16);
if(!H){ console.log('FAILED '+fails); process.exit(1); }
const G=mkG(TUE,12.6);
// 1
{ enter('gym',G); const d=said('desk_1f'), b=said('badminton');
  check('1. 1F 服務台的工讀生一句（AA 的兩句之一）、羽球場的人三句（AA_489 兩句＋AA_495 一句；不重複，多的人不說）',d.length===1&&H.desk_1f.L.includes(d[0])&&b.length===Math.min(H.badminton.L.length,role('badminton').length)&&uniq(b)&&b.every(t=>H.badminton.L.includes(t)),J({d,b,n:role('badminton').length}));
  check('1. 散步的人、長椅上的人沒有句子',role('walker').concat(role('bench')).every(n=>!n.hear&&!n.talk));
  const n=role('desk_1f')[0]; check('1. 點了是「聽一句」，說話的人是工讀生',!!n&&n.talkLabel==='聽一句'&&typeof n.talk==='function'&&n.hear.who==='工讀生');
  var first=d[0]; }
// 2
{ enter('gym',G); const d=said('desk_1f'); check('2. 下一次進來：工讀生換下一句',d.length===1&&d[0]!==first&&H.desk_1f.L.includes(d[0]),J([first,d[0]]));
  enter('gym',G); const d2=said('desk_1f'); check('2. 再下一次：輪回第一句',d2[0]===first,J(d2)); }
// 3
{ enter('gym_b1',mkG(TUE,18.5)); const a=said('desk_b1'), fit=ppl().filter(n=>n.crowdRole!=='desk_b1'&&n.hear).map(n=>n.hear);
  check('3. B1：櫃台阿姨一句、運動的人兩句（不重複）',a.length===1&&a[0]===H.desk_b1.L[0]&&fit.length===2&&uniq(fit.map(h=>h.t))&&fit.every(h=>h.who==='運動的人'&&H.fit.L.includes(h.t)),J({a,fit})); }
// 4
{ enter('gym_arena',mkG(SAT,15.5)); const bk=said('basketball'), rs=said('rest');
  check('4. 3F：打球的人三句（AA_489 兩句＋AA_495 一句）、看球的人兩句（AA_489 一句＋AA_495 一句）；不重複，多的人不說',bk.length===Math.min(H.basketball.L.length,role('basketball').length)&&uniq(bk)&&bk.every(t=>H.basketball.L.includes(t))&&rs.length===Math.min(H.rest.L.length,role('rest').length)&&uniq(rs)&&rs.every(t=>H.rest.L.includes(t)),J({bk,rs})); }
// 5
if(MONPE){ enter('gym',mkG(MONPE,15.8)); const T=role('pe_teacher')[0], st=said('pe_student');
  check('5. 體育課：老師一句（說話的人是課堂上的稱呼）、同學兩句',!!T&&!!T.hear&&T.hear.t===H.pe_teacher.L[0]&&T.hear.who===T.name&&st.length===2&&uniq(st),J({t:T&&T.hear,st})); }
else check('5. 找得到有體育課的星期一',false);
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
