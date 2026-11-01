// BUG-SIS-ORAL-SCHED-1022（BB 帳號 A 10-22 05:02）：2029-05-29 學姊口試（y34b3d.js M9：16:00 霖澤館研究室），她的 3D 作息還是平日 9～17 點在總圖 3F——不需要瀏覽器。
//   1 5/29 08:00～18:00：作息是「口試（霖澤館的研究室）」、不在任何 3D 區域（不會在總圖 3F 被生出來）
//   2 前一天 5/28、後一天 5/30 的白天：照舊總圖 3F 讀書；5/29 晚上照舊（不是口試那一筆）
// 修改前（開發分支 c816b8de）：第 1 項 FAIL。用法：node tests/sis_oral_sched_unit.js
const H=require('./pg_harness.js');
const {check}=H;
const J=JSON.stringify, C=CHARACTERS.heroine_05;
const ent=(key,h)=>{ H.fresh(key,h,'library'); const e=STORY.schedEnt(C,H.G); return e?{zone:e.zone,act:e.act,away:e.away||null}:null; };
const a=[ent('2029-05-29',10),ent('2029-05-29',16.5)];
check('1. 5/29 10:00、16:30：口試（法律系館A的研究室），不在總圖',a.every(e=>e&&e.zone===null&&e.away==='口試（法律系館A的研究室）'),J(a));
const b=[ent('2029-05-28',10),ent('2029-05-30',10)];
check('2. 前一天 5/28、後一天 5/30 的 10:00：照平常的作息——大三起週一～週四早上在研究室（BB_206 第 2 節；原本總圖），不是口試那一筆',b.every(e=>e&&e.zone==='linze_5f'&&e.act==='read'&&e.away!=='口試（法律系館A的研究室）'),J(b));
const c=ent('2029-05-29',19);
check('2. 5/29 19:00：不是口試那一筆（晚上照原本的作息）',!c||c.away!=='口試（法律系館A的研究室）',J(c));
H.done();
