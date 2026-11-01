// 學姊第二次傳書（AA_552 第 2 節；任務 SIS-BOOKS-Y2S1-1031；src/sisbooks2_3d.js）——不需要瀏覽器。照 AA_552 2-8 的測試 1～6。
//   1 9/5 17:05 私訊：一般三個回覆各走一次（熟悉 +1）、交往版兩個回覆；17:05 以前沒有；已經搬完（ROOM_Y2）＝不傳
//   2 9/6 搬完房間（ROOM_Y2）才演管理室；搬到一半（ROOM_Y2_MOVING）不演；便利貼兩行；書架多三本（SIS_OLD_BOOKS_2）
//   3 朋友以上多法典＋便利貼（SIS_OLD_CODE）；未滿朋友沒有；交往中一定有（書瑀 2D、沒有「問 Kevin」）
//   4 拿到書以後第一堂行政法：老師那一句之後兩句旁白，只一次；已經上過大二上行政法的舊存檔不補
//   5 讀檔時已過 9/6：第一次回宿舍補第二段（沒有第一段）；大二上結束以後不演
//   6 兩個條件都沒有（沒拿過第一次的書、也不認識她）：整件不演
// 修改前（開發分支 97c4f5e7e）：沒有 src/sisbooks2_3d.js——全部 FAIL。用法：node tests/sis_books2_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
let err=''; try{ vm.runInThisContext(fs.readFileSync(path.join(H.ROOT,'src/sisbooks2_3d.js'),'utf8').replace(/^const SISBOOKS2\s*=/m,'globalThis.SISBOOKS2='),{filename:'src/sisbooks2_3d.js'}); }catch(e){ err=String(e); }
GM.toast=()=>{}; GM.caption=()=>{};
const X=()=>typeof SISBOOKS2!=='undefined'?SISBOOKS2:null, ID='heroine_05';
const D=k=>STORY.dayOfKey(k), keyOf=d=>CALENDAR.dateOf(d).key;
check('0. src/sisbooks2_3d.js 載得到；事件 ev_sis_books_y2s1 加進 STORY_EVENTS；index.html 有載',!!X()&&!err&&STORY_EVENTS.some(e=>e.id==='ev_sis_books_y2s1')&&/src\/sisbooks2_3d\.js/.test(fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8')),err);
if(!X()) H.done();
const ev=STORY_EVENTS.find(e=>e.id==='ev_sis_books_y2s1');
const said=()=>H.said.map(s=>s.t);
const phone=(G,h)=>{ G.hour=h; X().phone(G); PHONE.tick(G); };
const mk=(key,h,zone,flags)=>{ const G=H.fresh(key,h,zone||'dorm',Object.assign({SIS_OLD_BOOKS:true},flags||{})); INV.addContact(G,ID); return G; };
(async()=>{
  /* 1 手機 */
  { const G=mk('2026-09-05',16); phone(G,17); const n0=H.msgs('p:'+ID).length; phone(G,17.2);
    check('1. 9/5 17:05「我今天搬研究室。清出三本大二上的書。」「明天放男宿管理室。」；17:05 以前沒有',n0===0&&J(H.msgs('p:'+ID))===J(['我今天搬研究室。清出三本大二上的書。','明天放男宿管理室。']),J(H.msgs('p:'+ID)));
    const R=[]; for(let k=0;k<3;k++){ const G2=mk('2026-09-05',17.2); const f0=SOCIAL.rel(ID).fam; X().phone(G2); PHONE.tick(G2); const r=PHONE.answer(G2,'sis_books2_ask',k); R.push([r&&r.out.map(m=>m.text),SOCIAL.rel(ID).fam-f0]); }
    check('1. 一般三個回覆：「謝謝學姊。」→「這次比較重。」／「研究室在哪？」→「五樓。窗戶對著一棵樹。」／「上次那三本我還在用。」→「那就好。這三本也一樣。」；回了熟悉 +1',
      J(R.map(x=>x[0]))===J([['謝謝學姊。','這次比較重。'],['研究室在哪？','五樓。窗戶對著一棵樹。'],['上次那三本我還在用。','那就好。這三本也一樣。']])&&R.every(x=>x[1]===1),J(R));
    const G3=mk('2026-09-05',17.2,'dorm',{dating_heroine_05:true}); X().phone(G3); PHONE.tick(G3); const m3=H.msgs('p:'+ID); const r3=PHONE.answer(G3,'sis_books2_ask',1);
    check('1. 交往中（書瑀）：「明天你搬宿舍，我拿過去。」；回覆「很重的話我去拿。」→「不重。……有一點。」',m3[1]==='明天你搬宿舍，我拿過去。'&&!!r3&&J(r3.out.map(m=>m.text))===J(['很重的話我去拿。','不重。……有一點。']),J([m3,r3&&r3.out]));
    const G4=mk('2026-09-06',10,'dorm',{ROOM_Y2:D('2026-09-06')}); X().phone(G4); PHONE.tick(G4); check('1. 已經搬完房間（ROOM_Y2）才讀進來：不傳（沒有第一段）',H.msgs('p:'+ID).length===0); }
  /* 2、3 管理室 */
  { const G=mk('2026-09-06',18,'dorm',{ROOM_Y2_MOVING:true}); const a=EVENTS.check(ev); G.flags.ROOM_Y2_MOVING=false; G.flags.ROOM_Y2=G.day; const b=EVENTS.check(ev);
    H.said=[]; await EVENTS.runLines(ev.dialogue,ev); const L=said();
    check('2. 搬到一半不演、搬完才演；一般：「（管理室有你的一箱書。上面貼著一張便利貼，跟上次一樣。）」便利貼兩行；未滿朋友沒有法典',!a&&b&&J(L)===J(['（管理室有你的一箱書。上面貼著一張便利貼，跟上次一樣。）','（便利貼：「行政法、刑分、物權。後半本我擦掉了，換你寫。」）','（下面還有一行，比較小：「以後的書，問 Kevin。」）'])&&!G.flags.SIS_OLD_CODE,J(L));
    G.flags.SIS_OLD_BOOKS_2=true; const Lr=[]; X().room(G,Lr); check('2. 書架多三本：「學姊的三本大二上舊書。後半本是空的，現在有你的字。」',Lr.length===1&&Lr[0][1]==='學姊的三本大二上舊書。後半本是空的，現在有你的字。',J(Lr));
    const G2=mk('2026-09-06',18,'dorm',{ROOM_Y2:D('2026-09-06')}); H.FRIEND(ID); H.said=[]; await EVENTS.runLines(ev.dialogue,ev); const L2=said();
    check('3. 朋友以上：多「（箱子最下面還有一本舊法典，側邊貼滿了索引貼。）」「（另一張便利貼：「條文是舊的，不要用。貼法可以照抄。」）」、記 SIS_OLD_CODE',L2.length===5&&L2[3]==='（箱子最下面還有一本舊法典，側邊貼滿了索引貼。）'&&G2.flags.SIS_OLD_CODE===true,J(L2));
    const G3=mk('2026-09-06',18,'dorm',{ROOM_Y2:D('2026-09-06'),dating_heroine_05:true}); H.said=[]; await EVENTS.runLines(ev.dialogue,ev); const L3=H.lines();
    check('3. 交往中：書瑀在管理室前面、「行政法、刑分、物權。後半本我擦掉了。」「……換你寫。」、一定有法典、沒有「以後的書，問 Kevin」',J(said())===J(['（管理室前面，書瑀坐在一個紙箱上。）','行政法、刑分、物權。後半本我擦掉了。','……換你寫。','（箱子最下面是她的舊法典，側邊貼滿了索引貼。）','條文是舊的，不要用。貼法可以照抄。'])&&G3.flags.SIS_OLD_CODE===true,J(L3)); }
  /* 4 回聲 */
  { const G=mk('2026-09-07',9,'classroom',{ROOM_Y2:D('2026-09-06'),SIS_OLD_BOOKS_2:true}); const it={c:{id:'admin_law'},term:'Y2S1',week:1};
    H.said=[]; const a=await X().inClass(GM,it); const L=said(); H.said=[]; const b=await X().inClass(GM,it);
    check('4. 第一堂行政法：「（你翻開學姊的行政法。她的字停在一半。）」「（老師講到第一個重點。你在空白的地方，寫了第一行自己的字。）」；只一次；別的課沒有',a&&J(L)===J(['（你翻開學姊的行政法。她的字停在一半。）','（老師講到第一個重點。你在空白的地方，寫了第一行自己的字。）'])&&!b&&!X().echoDue(G,{c:{id:'civ_law_property'},term:'Y2S1'}),J(L));
    check('4. CLS.IN_CLASS 掛上（有 due）',CLS.IN_CLASS.some(f=>typeof f.due==='function'&&f.due(Object.assign({},G,{flags:Object.assign({},G.flags,{SIS_BOOKS2_ECHO:null})}),it)));
    const G2=mk('2026-10-05',9,'dorm',{ROOM_Y2:D('2026-09-06')}); CLS.rec(G2).attend.admin_law=3; X().markOldEcho(G2); G2.flags.SIS_OLD_BOOKS_2=true;
    check('4. 舊存檔：拿書以前已經上過大二上行政法＝不補回聲',!X().echoDue(G2,{c:{id:'admin_law'},term:'Y2S1'})); }
  /* 5 讀檔時已過 9/6；大二上結束以後 */
  { const G=mk('2026-10-12',18,'dorm_hall',{ROOM_Y2:D('2026-09-06')}); const a=EVENTS.check(ev); const r=CALENDAR.termDays('Y2S1'); G.day=r.to+1; const b=EVENTS.check(ev);
    check('5. 10/12 才回宿舍（讀檔時已過 9/6）：照演管理室；大二上結束以後不演',a&&!b,J([a,b])); }
  /* 6 兩個條件都沒有 */
  { const G=H.fresh('2026-09-05',17.2,'dorm',{}); INV.addContact(G,ID); X().phone(G); PHONE.tick(G); G.flags.ROOM_Y2=G.day+1; G.day+=1;
    check('6. 沒拿過第一次的書、也不認識她：沒有私訊、沒有管理室',H.msgs('p:'+ID).length===0&&!EVENTS.check(ev)); }
  H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
