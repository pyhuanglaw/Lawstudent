// BUG-KAI-Y2-SCHED-1022（BB 帳號 A 10-22 05:02）：阿凱大二起住別棟（story3d.js S.kaiRoommate：搬進 312 以後就不在你房間），
//   作息卻整段 2024～2029 寫「每晚宿舍書桌」——手機「朋友」寫「・就在這裡」（game3d.js：作息的 zone＝你在的區域），312 裡卻沒有他。不需要瀏覽器。
//   1 大一（2025-10-01 21:00）：作息在宿舍書桌（dorm、desk），和房間裡生成他的條件（S.kaiRoommate）一致
//   2 搬家那天 9/6：還沒搬（沒有 ROOM_Y2）照舊在宿舍；搬了（ROOM_Y2）＝「在他那棟宿舍」、不在任何 3D 區域
//   3 大二以後（2026-10-01 21:00、2028-03-01 01:00）：「在他那棟宿舍」，zone 不是 dorm（手機不會寫「就在這裡」）；S.kaiRoommate 也是 false
//   4 畢業以後（2029-06-29 週五 22:30）：照舊公館宵夜
// 修改前（開發分支 a3d2185d）：第 2（搬了那一項）、3 項 FAIL。用法：node tests/kai_y2_sched_unit.js
const H=require('./pg_harness.js');
const {check}=H;
const J=JSON.stringify, C=CHARACTERS.kai;
const ent=(key,h,flags)=>{ H.fresh(key,h,'dorm',flags); const e=STORY.schedEnt(C,H.G); return e?{zone:e.zone,act:e.act,away:e.away||null}:null; };
const y1=ent('2025-10-01',21); const rm1=STORY.kaiRoommate(H.G);
check('1. 大一 10/1 21:00：宿舍書桌（dorm、desk），房間裡也生成他（kaiRoommate）',!!y1&&y1.zone==='dorm'&&y1.act==='desk'&&rm1===true,J([y1,rm1]));
const m0=ent('2026-09-06',21), m1=ent('2026-09-06',21,{ROOM_Y2:H.D('2026-09-06')});
check('2. 9/6 還沒搬：照舊宿舍；搬了（ROOM_Y2）：「在他那棟宿舍」、不在任何 3D 區域',!!m0&&m0.zone==='dorm'&&!!m1&&m1.zone===null&&m1.away==='在他那棟宿舍',J([m0,m1]));
const y2=ent('2026-10-01',21,{ROOM_Y2:H.D('2026-09-06')}); const rm2=STORY.kaiRoommate(H.G); const y3=ent('2028-03-01',25,{ROOM_Y2:H.D('2026-09-06')});
check('3. 大二 10/1 21:00、大三 3/1 01:00：「在他那棟宿舍」（zone 不是 dorm，手機不寫「就在這裡」）；房間裡也不生成（kaiRoommate false）',!!y2&&y2.zone===null&&y2.away==='在他那棟宿舍'&&!!y3&&y3.zone===null&&rm2===false,J([y2,y3,rm2]));
const pg=ent('2029-06-29',22.5,{ROOM_Y2:H.D('2026-09-06')});
check('4. 畢業以後 2029-06-29（五）22:30：照舊公館宵夜（taipei 那一筆）',!pg||pg.zone==='gongguan'||pg.zone===null,J(pg));
H.done();
