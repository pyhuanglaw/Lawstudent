// AA 11:14（學姊名字規則補充）：交往中的學姊不坐後座的旁白——只有她一個同行＝「（她說她走路就好。）」；有別人同行、沒交往＝照舊寫名字。
// 修改前（int/next1102 88aceabea 合併後）：第 1 項 FAIL。用法：node tests/sis_ride_she_unit.js
'use strict';
const H=require('./pg_harness.js'); const {check}=H;
const G=H.fresh('2026-10-14',12,'campus',{CALLED_SHUYU:true}); G.flags.dating_heroine_05=true; SOCIAL.bind(G);
const m0=STORY.rideMode, i0=STORY.rideInfo; STORY.rideMode=()=>'walk'; STORY.rideInfo=()=>({mode:'walk'});
try{
  const sis={charId:'heroine_05',beh:'follow'}, an={charId:'heroine_01',beh:'follow'};
  check('1. 交往中、只有她一個同行：「（她說她走路就好。）」',STORY.rideBlock({G,E:{npcs:[sis]}},sis)==='（她說她走路就好。）',STORY.rideBlock({G,E:{npcs:[sis]}},sis));
  const two=STORY.rideBlock({G,E:{npcs:[sis,an]}},sis); check('2. 還有以安同行：照舊寫名字',/^（溫書瑀說她走路就好。）$/.test(two),two);
  delete G.flags.dating_heroine_05; const no=STORY.rideBlock({G,E:{npcs:[sis]}},sis); check('3. 沒交往：照舊寫名字（不是「她」）',!/^（她說/.test(no)&&/說她走路就好。）$/.test(no),no);
} finally { STORY.rideMode=m0; STORY.rideInfo=i0; }
H.done();
