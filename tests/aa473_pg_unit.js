// AA_473 前任的畢業以後（企劃線 66393bb91；任務 PG-FIX-471-473-1027）——不需要瀏覽器。
//   1 學姊前任：6/2 中午她已經私訊恭喜（「畢業快樂。」／交換延畢「今天恭喜。」），晚上回「生日快樂。」她只回「謝謝。」（原本多一句恭喜）；中午那一則沒送到的照原本兩句
//   2 以安前任：2029-12-14、2030-01-25 21:00 不打電話給前男友，改成麵店團各一則（「二試過了。一月面試。」「司法官上了。」；美國那份申請不講）；不是前任的照舊打電話
// 逐字對稿（git 讀企劃線 66393bb91 的 AA_473）。修改前（243db0938）的結果見檔尾。用法：node tests/aa473_pg_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const cp=require('child_process');
const {check,GM}=H, J=JSON.stringify;
let DOC=''; try{ DOC=cp.execFileSync('git',['-C',H.ROOT,'-c','core.quotepath=false','show','66393bb91:docs/story_planning/AA_473_前任的畢業以後_學姊恭喜兩次_以安不打給前男友.md'],{encoding:'utf8'}); }catch(e){ DOC=''; }
const sec=n=>{ const a=DOC.indexOf('\n## '+n+'.'), b=DOC.indexOf('\n## ',a+4); return a<0?'':DOC.slice(a,b<0?undefined:b); };
const D=H.D;
const tsec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const graduated=G=>{ G.flags.GRADUATED=PG.gradDay(); PG.rec(G).done.grad=1; };
const ex=id=>{ H.FRIEND(id); H.date(id); ROM.end(H.G,id); H.FRIEND(id); };

(async()=>{
check('0. 讀得到企劃線 66393bb91 的 AA_473',DOC.length>500&&DOC.includes('## 1. 學姊前任'));

/* ======================= 1. 學姊前任：畢業那天恭喜兩次 ======================= */
await tsec(1,async()=>{ const S1=sec(1);
  check('1. 稿：只回一句「學姊：謝謝。」；中午那一則沒送到的照原本兩句',S1.includes('> 學姊：謝謝。')&&/中午那一則沒送到的（那時候還不是前任），照原本兩句/.test(S1));
  const B=POSTGRAD_LINES.BDAY, DL=POSTGRAD_LINES.DELAYED;
  for(const [route,noon,two] of [[null,POSTGRAD_LINES.THERMOS.ex,B.exReply[1]],['JP',DL.thermosEx,DL.bdayEx[1]]]){ const tag=route?'交換延畢':'臺灣路線';
    const G=H.fresh('2029-06-02',11.6,'campus',route?{EXCHANGE_ROUTE:route}:{}); ex('heroine_05'); PHONE.join(G,'family_law','法律系直屬家族'); PG.rules(GM); H.at('2029-06-02',12.1); PHONE.tick(G);
    const atNoon=H.msgs('p:heroine_05').slice(); await H.run('grad');
    H.at('2029-06-02',19.1); PG.rules(GM); H.at('2029-06-02',19.6); PHONE.tick(G); PHONE.answer(G,'pg_sis_ex_bday',0); PG.rules(GM);
    const th=H.msgs('p:heroine_05');
    check('1. '+tag+'、學姊前任：12:00 她私訊「'+noon+'」',J(atNoon)===J([noon]),J(atNoon));
    check('1. '+tag+'：19:30 Kevin 的生日 → 傳「生日快樂。」→ 她只回「謝謝。」（不再恭喜一次：「'+two+'」不出）',th.join('|').endsWith('生日快樂。|謝謝。')&&!th.includes(two)&&G.flags.SIS_BDAY_Y4==='msg'&&th.filter(t=>t===noon).length===1,J(th)); }
  /* 中午那一則沒送到（還不是前任的時候不發；之後也過了補發的時間）：照原本兩句 */
  { const G=H.fresh('2029-06-04',13,'dorm'); graduated(G); ex('heroine_05'); G.flags.PG_SIS_EX_BDAY='send'; PG.rules(GM); PHONE.tick(G); const th=H.msgs('p:heroine_05');
    check('1. 中午那一則沒送到：照原本兩句「謝謝。」「'+B.exReply[1]+'」',!PHONE.sent(G,'pg_sis_ex')&&th.join('|').endsWith('生日快樂。|謝謝。|'+B.exReply[1]),J(th)); }
  /* 不傳＝沒有回覆 */
  { const G=H.fresh('2029-06-02',19.1,'campus'); graduated(G); ex('heroine_05'); PHONE.join(G,'family_law','法律系直屬家族'); PG.rules(GM); H.at('2029-06-02',19.6); PHONE.tick(G); PHONE.answer(G,'pg_sis_ex_bday',1); PG.rules(GM);
    check('1. 選「不傳」：沒有「生日快樂。」也沒有回覆',!H.msgs('p:heroine_05').includes('生日快樂。')&&!H.msgs('p:heroine_05').includes('謝謝。')&&G.flags.SIS_BDAY_Y4==='none'); } });

/* ======================= 2. 以安前任：不打電話給前男友 ======================= */
await tsec(2,async()=>{ const S2=sec(2), L1='二試過了。一月面試。', L2='司法官上了。', US='我還寄了一份申請。美國的。……先不要問。';
  check('2. 稿：12/14「以安：'+L1+'」、1/25「以安：'+L2+'」（麵店團、不用回）',S2.includes('> 以安：'+L1)&&S2.includes('> 以安：'+L2)&&/前任改成麵店團群組\*\*（21:00，不用回）/.test(S2));
  const noodle=G=>(G.msgs||[]).filter(m=>m.th==='g:noodle_team'&&m.from==='heroine_01').map(m=>m.text);
  for(const route of [null,'JP']){ const tag=route?'日本路線（交換延畢）':'臺灣路線';
    const G=H.fresh('2029-12-14',20.6,'dorm',route?{EXCHANGE_ROUTE:route}:{}); graduated(G); PHONE.join(G,'noodle_team','麵店團'); ex('heroine_01');
    PG.rules(GM); H.at('2029-12-14',21); const s1=PG.due(G); H.said=[]; if(s1) await PG.runStep(GM,s1); H.tick();   /* 照實際流程：時間到了有場景就演 */
    check('2. '+tag+'、以安前任（FRIEND 以上）：12/14 21:00 沒有電話（an1 不成立）；麵店團「'+L1+'」',!(s1&&s1.id==='an1')&&!PG.byId('an1').cond(G)&&J(noodle(G))===J([L1]),J([s1&&s1.id,noodle(G)]));
    check('2. '+tag+'：美國那份申請不講（電話、群組都沒有）',!H.has(US)&&!(G.msgs||[]).some(m=>m.text===US)&&!H.said.some(x=>/（電話）$/.test(x.who||'')));
    H.at('2030-01-25',20.6); PG.rules(GM); H.at('2030-01-25',21); const s2=PG.due(G); if(s2) await PG.runStep(GM,s2); H.tick();
    check('2. '+tag+'：1/25 21:00 沒有電話（an2 不成立）；麵店團「'+L2+'」',!(s2&&s2.id==='an2')&&J(noodle(G))===J([L1,L2]),J([s2&&s2.id,noodle(G)]));
    H.at('2030-03-28',22.1); PG.rules(GM); STORY.phoneRules(GM); PHONE.tick(G); H.at('2030-03-29',10); PHONE.tick(G); }
  /* 不是前任（FRIEND）：照舊打電話、麵店團沒有那兩則 */
  { const G=H.fresh('2029-12-14',20.6,'dorm'); graduated(G); PHONE.join(G,'noodle_team','麵店團'); H.FRIEND('heroine_01'); PG.rules(GM); H.at('2029-12-14',21); const c=PG.due(G);
    check('2. 不是前任（FRIEND）：21:00 照舊是她打來的電話',!!c&&c.id==='an1'); H.said=[]; await PG.runStep(GM,c); H.tick();
    check('2. 電話「'+L1+'」「'+US+'」；麵店團沒有那一則',H.has(L1)&&H.has(US)&&!noodle(G).length,J(noodle(G))); }
  /* 交往中：照舊打電話（「……我只跟你講了。」）*/
  { const G=H.fresh('2029-12-14',21,'dorm'); graduated(G); PHONE.join(G,'noodle_team','麵店團'); H.FRIEND('heroine_01'); H.date('heroine_01'); const c=PG.due(G);
    check('2. 交往中：照舊打電話',!!c&&c.id==='an1'); }
  /* 前任但不到 FRIEND：照原本（12/14 沒有、1/25 麵店團一則）*/
  { const G=H.fresh('2029-12-14',20.6,'dorm'); graduated(G); PHONE.join(G,'noodle_team','麵店團'); H.FRIEND('heroine_01'); H.date('heroine_01'); ROM.end(G,'heroine_01'); H.FAMILIAR('heroine_01');
    PG.rules(GM); H.at('2029-12-14',21.1); H.tick(); const a=noodle(G).slice(); H.at('2030-01-25',20.6); PG.rules(GM); H.at('2030-01-25',21.1); H.tick();
    check('2. 前任、不到 FRIEND：12/14 沒有（照原本）、1/25 麵店團「'+L2+'」',!a.length&&J(noodle(G))===J([L2])&&!PG.due(G),J([a,noodle(G)])); }
  /* 舊存檔：這一版以前已經演過電話（PG.done an1／an2 是 1）＝不再發群組那一則（不重演）*/
  { const G=H.fresh('2029-12-14',21.4,'dorm'); graduated(G); PHONE.join(G,'noodle_team','麵店團'); ex('heroine_01'); PG.rec(G).done.an1=1; PG.rules(GM); H.tick(); const a=noodle(G).slice();
    H.at('2030-01-25',21.4); PG.rec(G).done.an2=1; PG.rules(GM); H.tick();
    check('2. 舊存檔（電話已經演過）：12/14、1/25 都不再發群組那一則',!a.length&&!noodle(G).length,J([a,noodle(G)])); }
  /* 前任、不在麵店團：沒有 */
  { const G=H.fresh('2029-12-14',20.6,'dorm'); graduated(G); ex('heroine_01'); PG.rules(GM); H.at('2029-12-14',21.1); H.tick(); const c=PG.due(G);
    check('2. 前任、不在麵店團：沒有電話、沒有群組',!(c&&c.id==='an1')&&!(G.msgs||[]).some(m=>m.text===L1)); } });

H.done();
})();
// 修改前（243db0938，開工檢查點＝開發分支 129540766＋AA_470）：FAILED 9（第 1 節 2、第 2 節 7）；改完 ALL PASS。
