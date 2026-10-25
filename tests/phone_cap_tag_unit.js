// 手機超過 200 則、刪掉最舊的以後，PHONE.sent 還記得那些 tag 傳過（AA_460 第 1 節，AA-B 2026-10-25）——不需要瀏覽器。用法：node tests/phone_cap_tag_unit.js
//   phone3d.js put 超過 200 則就刪最舊的，原本 tag 沒進 cut；PHONE.sent 只看 q、G.msgs、cut，刪掉以後就「忘了傳過」，條件只寫 !PHONE.sent 的訊息（例 guitar_grp1）會再排一次。
//   修法：put 刪的時候把 tag 推進 PHONE.rec(G).cut。修改前：1、2 FAIL。
const H=require('./pg_harness.js'), {check}=H, J=JSON.stringify;
const G=H.fresh('2026-09-07',9,'dorm',{}); G.msgs=[];
PHONE.rec(G).cut=[];   /* 照遊戲的走法：PHONE.at 排、PHONE.tick 送出 */
for(let i=0;i<205;i++) PHONE.at(G,G.day,8+i*0.001,[{th:'p:mom',from:'mom',text:'第 '+i+' 則'}],'cap_t'+i);
G.hour=12; PHONE.tick(G);
check('0. 送出 205 則：手機留 200 則（最舊的 5 則刪掉）',G.msgs.length===200&&!G.msgs.some(m=>m.tag==='cap_t0'),J(G.msgs.length));
check('1. 刪掉的 cap_t0～cap_t4 仍算傳過（PHONE.sent）',[0,1,2,3,4].every(i=>PHONE.sent(G,'cap_t'+i)),J(PHONE.rec(G).cut));
check('2. 條件只寫 !PHONE.sent 的訊息不會再排一次（PHONE.at 回 false、佇列沒有）',PHONE.at(G,G.day,13,[{th:'p:mom',from:'mom',text:'第 0 則'}],'cap_t0')===false&&!PHONE.rec(G).q.some(q=>q.tag==='cap_t0'));
check('3. 還在手機裡的照舊算傳過、cut 不重複記',PHONE.sent(G,'cap_t204')&&new Set(PHONE.rec(G).cut).size===PHONE.rec(G).cut.length);
/* 另一條刪舊訊息的路：invites3d.js 的 INV.msg／INV.msgAt（classes3d skipNotes 補的群組訊息；BB-B R38_CAP_GUITAR）*/
G.msgs=G.msgs.slice(0,200); const oldest=G.msgs[0].tag; INV.msgAt(G,null,'（群組）以安：今天講課予義務訴訟',G.day,12.5);
check('4. INV.msgAt 補一則把最舊的擠掉：那一則的 tag 也記進 cut（不會再排一次）',G.msgs.length===200&&!G.msgs.some(m=>m.tag===oldest)&&PHONE.sent(G,oldest)&&PHONE.at(G,G.day,13,[{th:'p:mom',from:'mom',text:'x'}],oldest)===false,oldest);
const old2=G.msgs[0].tag; INV.msg(G,null,'（群組）明軒：法學英文');
check('5. INV.msg 也一樣',!G.msgs.some(m=>m.tag===old2)&&PHONE.sent(G,old2),old2);
H.done();
