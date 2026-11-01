// 柏翰大四上推甄前桌燈開到 01:00（AA_208 第 8 節；任務 DORM-Y34；story3d.js S.bhLateY4、S.dormMates 第 4 欄、S.dormWho）——不需要瀏覽器。
//   1 大四 409（ROOM_Y4）、大四上第 1～12 週：22:30～01:00 在書桌前（23:45、00:30 都在；01:10 不在）；凌晨算前一天晚上那一週
//   2 第 13 週以後（放榜以後）、大三 507：照舊 22:30～23:30（23:45 不在）
//   3 待在房間裡（S.dormLive）：01:00 到了，柏翰起身走到自己的床（梯子），不是當成 23:30 早該睡、直接消失（BB-B 11-01 讀程式抓到）
// 修改前（開發分支 88d47a516）：23:30 以後一律上舖——第 1 項 FAIL。用法：node tests/dorm_bh_y4_late_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM,E}=H, J=JSON.stringify;
vm.runInThisContext(fs.readFileSync(path.join(H.ROOT,'src/data/dorm_room_layout.js'),'utf8').replace(/^const DORM_ROOM\s*=/m,'globalThis.DORM_ROOM='),{filename:'src/data/dorm_room_layout.js'});
const TD=(term,week,wd)=>{ const r=CALENDAR.termDays(term); return r.from+(week-1)*7+(wd||0); };   /* wd：0＝那一週的第一天 */
const keyOf=d=>CALENDAR.dateOf(d).key;
const who=(flags,term,week,wd,hr)=>{ const G=H.fresh(keyOf(TD(term,week,wd)),hr,'dorm',flags); return STORY.dormWho(G).some(x=>x[0]==='classmate_bohan'); };
const Y4={ROOM_Y3:1,ROOM_Y4:1}, Y3={ROOM_Y2:1,ROOM_Y3:1};
check('0. STORY.bhLateY4 存在',typeof STORY.bhLateY4==='function');
{ const a=who(Y4,'Y4S1',5,2,22.6), b=who(Y4,'Y4S1',5,2,23.75), c=who(Y4,'Y4S1',5,3,0.5), d=who(Y4,'Y4S1',5,3,1.2), e=who(Y4,'Y4S1',5,2,21);
  check('1. 大四上第 5 週：22:36、23:45、隔天 00:30 在書桌前；01:12、21:00 不在',a&&b&&c&&!d&&!e,J({a,b,c,d,e})); }
{ const r=CALENDAR.termDays('Y4S1'), mon13=r.from+12*7; const G=H.fresh(keyOf(mon13),0.5,'dorm',Y4); const f=STORY.dormWho(G).some(x=>x[0]==='classmate_bohan');
  check('1. 第 13 週第一天 00:30（前一晚是第 12 週）：還在',f,J(CALENDAR.termOf(mon13))); }
{ const g=who(Y4,'Y4S1',13,2,23.75), h=who(Y4,'Y4S1',13,2,22.6), i=who(Y3,'Y3S1',5,2,23.75), j=who(Y3,'Y3S1',5,2,22.6);
  check('2. 第 13 週以後、大三：22:36 在、23:45 不在（照舊）',!g&&h&&!i&&j,J({g,h,i,j})); }
/* 3 S.dormLive（假的生人物、走路：同 tests/dorm_mates_live_unit.js）*/
{ let walks=[]; const mkN=(id,x,z,o)=>{ const n={id,charId:id,name:id,obj:{position:{x,y:0,z},rotation:{y:0}},pose:'idle',idlePose:'idle',lv:0}; GM.npc[id]=n; E.npcs.push(n); if(o&&o.seat) GM.sitAt(n,o.seat); return n; };
  GM.spawnNPC=(id,spec,x,z,o)=>GM.npc[id]||mkN(id,x,z,o); GM.spawnCharacter=(id,x,z,o)=>GM.npc[id]||mkN(id,x,z,o);
  GM.removeNPC=id=>{ const n=GM.npc[id]; if(n){ E.npcs.splice(E.npcs.indexOf(n),1); delete GM.npc[id]; } };
  GM.sitAt=(n,st)=>{ n.seat=st; n.obj.position.x=st.x; n.obj.position.z=st.z; n.pose='sit'; }; GM.standUp=n=>{ n.seat=null; n.pose='idle'; };
  E.canStand=()=>true; E.moveTo=(n,x,z,cb)=>{ walks.push({n,x,z,cb}); return true; };
  const G=H.fresh(keyOf(TD('Y4S1',5,3)),0.9,'dorm',Y4); for(const k of Object.keys(GM.npc)) delete GM.npc[k]; E.npcs.length=0; walks=[];
  STORY.dormLive(GM); const a=!!GM.npc.classmate_bohan; G.hour=1.05; walks=[]; STORY.dormLive(GM); const n=GM.npc.classmate_bohan, w=walks[0], U=DORM_ROOM.units.find(q=>q.id==='R1');
  check('3. 00:54 在書桌前；01:03 起身走到自己的床（還在、正在走），不是直接消失',a&&!!n&&!!w&&w.n===n&&U&&Math.abs(w.x-U.sleep[0])<1e-6&&Math.abs(w.z-U.sleep[1])<1e-6,J({a,has:!!n,walk:w&&[w.x,w.z],sleep:U&&U.sleep})); }
H.done();
