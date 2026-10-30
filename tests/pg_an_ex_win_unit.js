// 以安二試（2029-12-14）、司法官（2030-01-25）放榜的麵店團群組什麼時候還補發（AA-B 10-30 13:33 回 B；BB-B R43 PGF10_AN_EX_LATE）——不需要瀏覽器。
//   和電話版 an1／an2 同一段：21:00 起到隔天 03:00 以前條件成立才補（訊息照樣標 21:00），過了就不補。原本沒寫 win＝48 小時內都補。
// 修改前：pg_an_ex1、pg_an_group 沒有 win（第 1 項 FAIL）。用法：node tests/pg_an_ex_win_unit.js
const H=require('./pg_harness.js');
const {check,GM}=H, J=JSON.stringify;
const M=tag=>(PG.MSGS||[]).find(m=>m.tag===tag);
const call=id=>(PG.STEPS||[]).find(s=>s.id===id);
{ const a=M('pg_an_ex1'), b=M('pg_an_group'), c1=call('an1'), c2=call('an2');
  const T=(k,h)=>PG.T?PG.T(k,h):null;
  check('1. pg_an_ex1、pg_an_group 的 win＝6（21:00 到隔天 03:00）',!!a&&!!b&&a.win===6&&b.win===6,J({ex1:a&&a.win,group:b&&b.win}));
  if(c1&&c2&&typeof c1.until==='function'&&typeof c1.at==='function'){ const G=H.fresh('2029-12-14',20,'campus',{}); check('1. 和電話版 an1／an2 同一段（until－at＝6 小時）',c1.until(G)-c1.at(G)===6&&c2.until(G)-c2.at(G)===6); } }
// 2. S.rules 照 win：用一則假的訊息（同樣 21:00、win 6）看 02:30 補、隔天 10:00 不補
{ const tag='t_win_probe'; const fake={tag,at:['2029-12-14',21],win:6,cond:()=>true,items:()=>[{th:'g:noodle_team',from:'heroine_01',name:'沈以安',text:'測試'}]}; PG.MSGS.push(fake);
  const sentAt=(key,h)=>{ const G=H.fresh(key,h,'campus',{GRADUATED:true}); PG.rules(GM); return !!(typeof PHONE!=='undefined'&&PHONE.sent(G,tag)); };
  const a=sentAt('2029-12-15',2.5), b=sentAt('2029-12-16',10);
  PG.MSGS.splice(PG.MSGS.indexOf(fake),1);
  check('2. 21:00 那一則：隔天 02:30 條件成立＝補；隔天 10:00 才成立＝不補',a===true&&b===false,J({a,b})); }
H.done();
