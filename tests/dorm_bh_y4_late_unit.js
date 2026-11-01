// 柏翰大四上推甄前桌燈開到 01:00（AA_208 第 8 節；任務 DORM-Y34；story3d.js S.bhLateY4、S.dormMates 第 4 欄、S.dormWho）——不需要瀏覽器。
//   1 大四 409（ROOM_Y4）、大四上第 1～12 週：22:30～01:00 在書桌前（23:45、00:30 都在；01:10 不在）；凌晨算前一天晚上那一週
//   2 第 13 週以後（放榜以後）、大三 507：照舊 22:30～23:30（23:45 不在）
// 修改前（開發分支 88d47a516）：23:30 以後一律上舖——第 1 項 FAIL。用法：node tests/dorm_bh_y4_late_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const {check}=H, J=JSON.stringify;
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
H.done();
