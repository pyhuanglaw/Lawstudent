// 1A-16～1A-18 國考（AA_319；src/postgrad3d.js）——不需要瀏覽器。
//   7/12 總圖 B1 改 20:00（b6757852）；8/3 學姊的便條（當面／照片）；8/4 一試 20 題（題庫＋QBANK、不重複、題目答案照題庫、第二年換一組）；
//   沒報名、交換延畢的 8/4；9/7 一試放榜三段系統字、朋友、不到 12 題；10/20～21 二試；12/14 二試放榜（16 題以上司法官那一行）、麵店、學姊那一句（AA_327 2-Y4-60）；
//   以安的二試、三試放榜＝她打來的電話（AA_319 c9b4f60e；不到 FRIEND 只有 1/25 麵店團一則）；2030 年（交換延畢、2029 不到 12 題）；12/14 讀書小組三個版本（Z1）。用法：node tests/bar_exam_unit.js
const H=require('./pg_harness.js'); const {check}=H;
const graduated=G=>{ G.flags.GRADUATED=PG.gradDay(); PG.rec(G).done.grad=1; };
const answerK=(qs,k)=>qs.map((q,i)=>{ const o=PG.opts(q); const right=o.findIndex(x=>String(x.v)===String(q.answer)); return i<k?right:(right===0?1:0); });   /* 前 k 題答對 */
(async()=>{
  const GM=H.GM;
  // ---- X1：Y4_PATH bar ----
  { const G=H.fresh('2029-07-12',16,'dorm',{Y4_PATH:'bar',BAR_REG:true}); graduated(G); PHONE.join(G,'noodle_team','麵店團'); PG.rules(GM); H.at('2029-07-12',17.1); H.tick();
    check('1. 7/12 17:00 阿哲群組「今天滷味我帶。」',H.msgs('g:noodle_team').includes('今天滷味我帶。'));
    H.at('2029-07-12',19.6); check('1. 19:30 還不是（改 20:00，b6757852）',!PG.due(G)||PG.due(G).id!=='b1');
    H.at('2029-07-12',20); const s=PG.due(G); check('1. 20:00 總圖 B1',s&&s.id==='b1'); await PG.runStep(GM,s);
    check('1. X1：B1 滷味「（把滷味放在桌子正中間）剩三個禮拜了，吃好一點。」；字卡 7/12（四）20:00',H.has('（把滷味放在桌子正中間）剩三個禮拜了，吃好一點。')&&H.cards.some(c=>c[0]==='7/12（四）20:00'),JSON.stringify(H.cards)); }
  // ---- 8/3、8/4：單身、學姊 FRIEND＝當面給便條；20 題 ----
  { const G=H.fresh('2029-08-04',7,'dorm',{BAR_REG:true}); graduated(G); H.FRIEND('heroine_05'); PHONE.join(G,'noodle_team','麵店團'); H.FRIEND('kexin'); H.date('kexin');
    PG.rules(GM); H.at('2029-08-04',7.6); H.tick(); check('2. 07:30 群組「出發。」「帶准考證。」',H.msgs('g:noodle_team').join('|').includes('出發。|帶准考證。'));
    H.at('2029-08-04',8); const s=PG.due(G); check('2. 8/4 一試',s&&s.id==='exam_2029');
    const qs=PG.draw(G,2029); H.picks=answerK(qs,14); await PG.runStep(GM,s);
    const ids=new Set(qs.map(q=>q.id)), pool=new Map(PG.pool().map(q=>[q.id,q]));
    check('2. 20 題、不重複、都在題庫裡（EXAM_BANK＋QBANK）',qs.length===20&&ids.size===20&&qs.every(q=>pool.get(q.id)===q));
    check('2. 題目、答案照題庫（和 EXAM_BANK／QBANK 原物件同一個）',qs.every(q=>{ const o=(EXAM_BANK.questions.find(x=>x.id===q.id)||QBANK.find(x=>x.id===q.id)); return o===q; }));
    check('2. 呈現照期末考：「1／20　題目」、選項（A）…；交卷不報分數',H.said.some(x=>x.t.startsWith('1／20　'))&&H.opts.some(o=>o[0]&&/^（A）|^對$/.test(o[0]))&&H.has('交卷。')&&!H.said.some(x=>/答對/.test(x.t)));
    check('2. 和可昕交往中＝考場門口沒有學姊當面給便條（改 8/3 21:00 照片，見第 9 組）',!H.has('一，你可以。'));
    check('2. BAR_SCORE_2029＝14、BAR_SIT_2029',G.flags.BAR_SCORE_2029===14&&G.flags.BAR_SIT_2029===true);
    check('2. X1：走出考場 柏翰「第十四題你選哪個？」阿哲「不要對。對了會睡不著。」',H.has('第十四題你選哪個？')&&H.has('不要對。對了會睡不著。'));
    H.at('2029-08-04',17.6); PHONE.tick(G); check('2. 和可昕交往：她傳「考完了。手還在抖。」「……你的也是吧。」',H.msgs('p:kexin').join('|')==='考完了。手還在抖。|……你的也是吧。',JSON.stringify(H.msgs('p:kexin')));
    // 9/7
    H.at('2029-09-07',14.6); PG.rules(GM); H.at('2029-09-07',15); H.tick();
    check('3. 9/7 15:00 群組「一試放榜了。」（群組安靜了三秒。）「宵夜。」',H.msgs('g:noodle_team').join('|').includes('一試放榜了。|（群組安靜了三秒。）|宵夜。'));
    H.at('2029-09-07',15+5/60); const r=PG.due(G); check('3. 15:05 系統字',r&&r.id==='r1_2029'); await PG.runStep(GM,r);
    check('3. Y1：答對 14＝「律師一試：通過。司法官一試：未通過。」；BAR_STAGE_2029 lawyer',H.has('律師一試：通過。司法官一試：未通過。')&&G.flags.BAR_STAGE_2029==='lawyer');
    H.at('2029-09-07',15.2); H.tick(); check('3. 朋友：小語「一試沒過。明年再來。」阿哲「我也沒過。……宵夜照吃。」柏翰「過了。」；沒有「明年一起。」',H.msgs('g:noodle_team').join('|').includes('一試沒過。明年再來。|我也沒過。……宵夜照吃。|過了。')&&!H.msgs('g:noodle_team').includes('明年一起。'));
    check('3. 可昕：「一試過了。二試十月。」「表我再排到十月。」',H.msgs('p:kexin').includes('一試過了。二試十月。')&&H.msgs('p:kexin').includes('表我再排到十月。'));
    // 10/20～21
    H.at('2029-10-20',8.5); const e=PG.due(G); check('4. Y1：10/20 進考場',e&&e.id==='e2a_2029'); await PG.runStep(GM,e); check('4. 字卡「考場」',H.cards.some(c=>c[0]==='考場'));
    H.at('2029-10-21',17.5); const e2=PG.due(G); await PG.runStep(GM,e2); check('4. 10/21 傍晚「（交卷的鐘響了。你把筆收進筆袋。）」',e2&&e2.id==='e2b_2029'&&H.has('（交卷的鐘響了。你把筆收進筆袋。）'));
    // 12/14
    H.FRIEND('heroine_01'); H.at('2029-12-14',14.6); PG.rules(GM); H.at('2029-12-14',15); H.tick();
    H.at('2029-12-14',15+5/60); const r2=PG.due(G); await PG.runStep(GM,r2);
    check('5. 12/14「律師二試：錄取。」「律師職前訓練：報到通知」；14 題沒有司法官那一行；BAR_YEAR 2029',H.has('律師二試：錄取。')&&H.has('律師職前訓練：報到通知')&&!H.has('司法官二試：未錄取。')&&G.flags.BAR_YEAR===2029);
    H.at('2029-12-14',15.4); H.tick();
    check('5. 阿哲「恭喜。……我明年一定跟上。」柏翰「上了。」「研究所的報告還沒寫完。」',H.msgs('g:noodle_team').join('|').includes('恭喜。……我明年一定跟上。|上了。|研究所的報告還沒寫完。'));
    check('5. 學姊 15:20「恭喜。」「……那張讀書計畫，可以收起來了。」（AA_327 2-Y4-60）',H.msgs('p:heroine_05').join('|').includes('恭喜。|……那張讀書計畫，可以收起來了。'));
    const nq=OUT.get(G,'pg_bar_noodle_2029'); check('5. 18:00 麵店是出遊（可以錯過）',nq&&nq.h===18);
    H.said=[]; await PG.EVS[2].beforeOuting(G,GM,nq); check('5. Z2：紅紙；阿哲「（舉起碗）今天我請。……明年換你請我。」',H.has('（麵店的長桌。阿姨在門口貼了一張紅紙，上面是你的名字。）')&&H.has('（舉起碗）今天我請。……明年換你請我。'));
    H.at('2029-12-14',21); const c=PG.due(G); check('6. 21:00 以安打來的電話（FRIEND）',c&&c.id==='an1'); H.said=[]; await PG.runStep(GM,c);
    check('6. 「二試過了。一月面試。」「我還寄了一份申請。美國的。……先不要問。」（電話，不是群組）',H.said[0].who==='沈以安（電話）'&&H.has('二試過了。一月面試。')&&H.has('我還寄了一份申請。美國的。……先不要問。'),JSON.stringify(H.said));
    H.at('2030-01-25',21); const c2=PG.due(G); H.said=[]; H.picks=['美國那份呢？']; await PG.runStep(GM,c2);
    check('6. 1/25 電話「司法官上了。」→「美國那份呢？」→「三月。」；麵店團沒有那一則',c2&&c2.id==='an2'&&H.has('司法官上了。')&&H.has('三月。')&&!H.msgs('g:noodle_team').includes('司法官上了。')); }
  // ---- 雙方都單身、學姊 FRIEND＝考場門口當面給便條 ----
  { const G=H.fresh('2029-08-04',8,'dorm',{BAR_REG:true}); graduated(G); H.FRIEND('heroine_05'); H.picks=new Array(20).fill(0); await H.run('exam_2029');
    check('2b. 便條當面給（單身、學姊 FRIEND）：「一，你可以。」…「三件都一樣。」「對。」；不是戀人＝沒有「我在對面的便利商店等」',H.has('一，你可以。')&&H.has('三件都一樣。')&&H.has('對。')&&!H.has('我在對面的便利商店等。考完先傳訊息。')); }
  { const G=H.fresh('2029-08-04',8,'dorm',{BAR_REG:true}); graduated(G); H.FAMILIAR('heroine_05'); H.picks=new Array(20).fill(0); await H.run('exam_2029');
    check('2b. 學姊不到 FRIEND＝沒有便條',!H.has('一，你可以。')); }
  // ---- 以安：不到 FRIEND＝麵店團一則；交往中的第二句 ----
  { const G=H.fresh('2030-01-25',20.6,'dorm'); graduated(G); PHONE.join(G,'noodle_team','麵店團'); H.FAMILIAR('heroine_01'); PG.rules(GM); H.at('2030-01-25',21.1); H.tick();
    check('7. 和以安不到 FRIEND：沒有電話，麵店團「司法官上了。」',!PG.due(G)&&H.msgs('g:noodle_team').includes('司法官上了。')); }
  { const G=H.fresh('2029-12-14',21,'dorm'); graduated(G); H.FRIEND('heroine_01'); H.date('heroine_01'); await H.run('an1');
    check('7. 和以安交往中：「我還寄了一份申請。美國的。……我只跟你講了。」',H.has('我還寄了一份申請。美國的。……我只跟你講了。')&&!H.has('我還寄了一份申請。美國的。……先不要問。')); }
  // ---- 16 題以上：司法官未錄取那一行 ----
  { const G=H.fresh('2029-08-04',8,'dorm',{BAR_REG:true}); graduated(G); const qs=PG.draw(G,2029); H.picks=answerK(qs,17); await H.run('exam_2029');
    H.at('2029-09-07',15.1); await H.run('r1_2029'); check('8. 答對 17＝「律師、司法官一試：通過。」',H.has('律師、司法官一試：通過。')&&G.flags.BAR_STAGE_2029==='both');
    H.at('2029-12-14',15.1); H.said=[]; await H.run('r2_2029'); check('8. Z3：多「司法官二試：未錄取。」＋旁白',H.has('司法官二試：未錄取。')&&H.has('（你看了一下司法官那一欄，沒有你的號碼。）')); }
  // ---- 學姊的便條：和別人交往中＝8/3 21:00 照片；戀人＝當面＋多一句 ----
  { const G=H.fresh('2029-08-03',20.6,'dorm',{BAR_REG:true}); graduated(G); H.FRIEND('heroine_05'); H.FRIEND('heroine_03'); H.date('heroine_03'); PG.rules(GM); H.at('2029-08-03',21.1); H.tick();
    check('9. 祐廷和別人交往中：8/3 21:00 收到便條的照片',H.msgs('p:heroine_05').join('|').includes('一，你可以。|二，你可以。|三，你可以。|三件都一樣。|對。'),JSON.stringify(H.msgs('p:heroine_05')));
    H.at('2029-08-04',8); H.picks=new Array(20).fill(0); await H.run('exam_2029'); check('9. 當面就沒有',!H.has('一，你可以。')); }
  { const G=H.fresh('2029-08-04',8,'dorm',{BAR_REG:true}); graduated(G); H.FRIEND('heroine_05'); H.date('heroine_05'); H.picks=new Array(20).fill(0); await H.run('exam_2029');
    check('9. 戀人版當面給，最後多「我在對面的便利商店等。考完先傳訊息。」',H.has('一，你可以。')&&H.has('我在對面的便利商店等。考完先傳訊息。')); }
  // ---- X2：沒報名 ----
  { const G=H.fresh('2029-08-04',8,'dorm',{BAR_REG:false}); graduated(G); PHONE.join(G,'noodle_team','麵店團'); H.FRIEND('kexin'); H.date('kexin');
    check('10. X2：沒報名＝沒有一試',!PG.due(G)); H.at('2029-08-04',17.1); PG.rules(GM); H.at('2029-08-04',17.6); H.tick();
    check('10. X2：17:30 群組「國考考完了。」「考完了」「晚上燒肉 誰要」；可昕「律師考試考完了。你今天負責聽我抱怨。」',H.msgs('g:noodle_team').join('|').includes('國考考完了。|考完了|晚上燒肉 誰要')&&H.msgs('p:kexin').includes('律師考試考完了。你今天負責聽我抱怨。'));
    H.at('2029-09-07',14.6); PG.rules(GM); H.at('2029-09-07',15.2); H.tick(); check('10. 沒報名：9/7 只有群組那三句，沒有系統字',!PG.due(G)&&!H.msgs('g:noodle_team').includes('一試沒過。明年再來。'));
    H.at('2029-12-14',14.6); PG.rules(GM); H.at('2029-12-14',15.2); H.tick(); check('10. 和可昕交往、祐廷沒考：12/14 15:05「律師考試放榜了。我上了。」「今天你負責宵夜。」',H.msgs('p:kexin').join('|').includes('律師考試放榜了。我上了。|今天你負責宵夜。')); }
  // ---- X3／Z4：日本路線（交換延畢）----
  { const G=H.fresh('2029-08-04',8,'dorm',{EXCHANGE_ROUTE:'JP'}); graduated(G); PHONE.join(G,'noodle_team','麵店團'); H.FRIEND('kexin'); H.date('kexin');
    check('11. X3：2029 不能考',!PG.due(G)); H.at('2029-08-04',17.1); PG.rules(GM); H.at('2029-08-04',17.7); H.tick();
    const s=PG.due(G); if(s) await PG.runStep(GM,s);
    check('11. X3：8/4 群組＋旁白「（明年八月，換你。）」；可昕多「你明年考。我先去探路。」',H.msgs('g:noodle_team').includes('晚上燒肉 誰要')&&H.has('（明年八月，換你。）')&&H.msgs('p:kexin').includes('你明年考。我先去探路。'));
    H.at('2029-12-14',14.6); PG.rules(GM); H.at('2029-12-14',15.2); H.tick(); check('11. Z4：2029 是阿哲那則私訊「我沒上。……明年跟你同一場。」',H.msgs('p:zhe').includes('我沒上。……明年跟你同一場。'));
    // 2030 全演（AA_357 1-6：延畢的 2030 要先在 5/10 21:00 報名，原本沒問就算報名）
    H.at('2030-05-10',21); H.picks=['報名']; await PG.runStep(GM,PG.byId('reg_2030')); check('11. 延畢 2030-05-10 報名（AA_357 1-6）',G.flags.BAR_REG_2030===true);
    H.at('2030-08-03',8); const e=PG.due(G); check('11. Z4：2030-08-03 一試',e&&e.id==='exam_2030'); const qs30=PG.draw(G,2030); H.picks=answerK(qs30,9); await PG.runStep(GM,e);
    H.at('2030-09-06',15.1); await H.run('r1_2030'); check('11. 第二年不到 12 題也進律師二試（「律師一試：通過。司法官一試：未通過。」）',H.has('律師一試：通過。司法官一試：未通過。')&&G.flags.BAR_STAGE_2030==='lawyer');
    H.at('2030-10-19',8.5); await H.run('e2a_2030'); H.at('2030-10-20',17.5); await H.run('e2b_2030'); H.at('2030-12-13',15.1); await H.run('r2_2030');
    check('11. 2030-12-13 錄取：BAR_YEAR 2030',G.flags.BAR_YEAR===2030&&H.has('律師二試：錄取。'));
    H.at('2030-12-13',15.4); H.tick(); check('11. 阿哲「我們兩個都上了。宵夜走。」（2030 一起上）',H.msgs('g:noodle_team').includes('我們兩個都上了。宵夜走。')); }
  // ---- 2029 不到 12 題 → 2030 換一組 20 題 ----
  { const G=H.fresh('2029-08-04',8,'dorm',{BAR_REG:true}); graduated(G); PHONE.join(G,'noodle_team','麵店團'); H.FRIEND('heroine_05'); H.FRIEND('heroine_03');
    const q29=PG.draw(G,2029); H.picks=answerK(q29,10); await H.run('exam_2029');
    H.at('2029-09-07',14.6); PG.rules(GM); H.at('2029-09-07',15.1); await H.run('r1_2029'); H.at('2029-09-07',15.4); H.tick();
    check('12. Y2：答對 10＝「律師、司法官一試：未通過。」；阿哲「明年一起。」小語「我們一起明年。」',H.has('律師、司法官一試：未通過。')&&H.msgs('g:noodle_team').join('|').includes('明年一起。|我們一起明年。'));
    check('12. 學姊 15:20「明年。……讀書計畫我幫你排。」（AA_327 2-Y4-51）',H.msgs('p:heroine_05').includes('明年。……讀書計畫我幫你排。'));
    H.at('2029-10-20',8.5); check('12. Y2：沒有二試',!PG.due(G)||!/^e2/.test(PG.due(G).id));
    const q30=PG.draw(G,2030), s29=new Set(q29.map(q=>q.id)); check('12. 第二年換一組 20 題（和 2029 不重複）',q30.length===20&&q30.every(q=>!s29.has(q.id)));
    H.at('2030-08-02',20.6); PG.rules(GM); H.at('2030-08-02',21.1); H.tick(); check('12. 2030 重考的便條（照片）：「（便條：「早點睡。」「你比去年多念了一年。」）」',H.msgs('p:heroine_05').includes('（便條：「早點睡。」「你比去年多念了一年。」）'));
    H.at('2030-12-13',14.6); G.flags.BAR_SIT_2030=true; G.flags.BAR_SCORE_2030=8; G.flags.BAR_STAGE_2030='lawyer'; PG.rec(G).done.exam_2030=1; PG.rec(G).done.r1_2030=1; PG.rec(G).done.e2a_2030=1; PG.rec(G).done.e2b_2030=1;
    PG.rules(GM); H.at('2030-12-13',15.1); await H.run('r2_2030'); H.at('2030-12-13',15.4); H.tick();
    check('12. 2030-12-13：學姊「恭喜。」「……這次可以停一下了。」；小語、語彤的群組',G.flags.BAR_YEAR===2030&&H.msgs('p:heroine_05').join('|').includes('恭喜。|……這次可以停一下了。')&&H.msgs('g:noodle_team').includes('司法官還是沒上。檢察事務官那個，筆試考完了，還在等。')&&H.msgs('g:noodle_team').includes('阿姨已經在寫紅紙了。')); }
  // ---- 2029 已經考上的玩家，2030-12-13 阿哲那一句 ----
  { const G=H.fresh('2030-12-13',14.6,'dorm',{BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:14,BAR_STAGE_2029:'lawyer',BAR_YEAR:2029}); graduated(G); PHONE.join(G,'noodle_team','麵店團'); PG.rules(GM); H.at('2030-12-13',15.3); H.tick();
    check('13. 2029 已經考上：阿哲「上了。去年那頓宵夜，今天換我請。」；沒考的系統字不出現',H.msgs('g:noodle_team').includes('上了。去年那頓宵夜，今天換我請。')&&!H.msgs('g:noodle_team').includes('國考放榜了。')); }
  { const G=H.fresh('2030-12-13',14.6,'dorm',{BAR_REG:false}); graduated(G); PHONE.join(G,'noodle_team','麵店團'); PG.rules(GM); H.at('2030-12-13',15.3); H.tick();
    check('13. 沒考：群組「國考上了」「宵夜我請」',H.msgs('g:noodle_team').join('|').includes('國考上了|宵夜我請')); }
  // ---- Z1：讀書小組（BAR_STUDY_GROUP，AA_327 2-Y4-33；那一批還沒做，旗標先照 AA 的格式）----
  const z1=async grp=>{ const G=H.fresh('2029-12-14',15.1,'dorm',{BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:14,BAR_STAGE_2029:'lawyer',BAR_STUDY_GROUP:grp}); graduated(G); PHONE.join(G,'noodle_team','麵店團'); H.said=[]; await H.run('r2_2029'); return G; };
  { const G=await z1(['kexin','yutong']); const q=OUT.get(G,'pg_bar_noodle_2029'); H.said=[]; if(q) await PG.EVS[2].beforeOuting(G,GM,q);
    check('14. Z1：三個人＝18:00 麵店「（麵店的電視開著…）」可昕「上了。……你的也上了。我先查了你的，不要生氣。」語彤「…明年換我。」；沒有紅紙、阿哲那一句',!!q&&H.has('（麵店的電視開著，沒有人在看。可昕的手機先震。）')&&H.has('上了。……你的也上了。我先查了你的，不要生氣。')&&H.has('（端了兩碗麵出來，各加了一顆蛋）明年換我。')&&!H.has('（舉起碗）今天我請。……明年換你請我。')); }
  { const G=await z1(['kexin']); const q=OUT.get(G,'pg_bar_noodle_2029'); H.said=[]; if(q) await PG.EVS[2].beforeOuting(G,GM,q);
    check('14. 只有可昕：「上了。兩個都上了。……今天不要排任何東西。」',!!q&&H.has('上了。兩個都上了。……今天不要排任何東西。')&&!H.has('（舉起碗）今天我請。……明年換你請我。')); }
  { const G=await z1(['yutong']); H.at('2029-12-14',18.1); PHONE.tick(G);
    check('14. 只有語彤：沒有麵店的出遊，18:00 她傳紅紙的照片「阿姨貼的，我攔不住。」「她說明年要換貼我的。」',!OUT.get(G,'pg_bar_noodle_2029')&&H.msgs('p:heroine_03').join('|')==='（照片：麵店牆上，一張剛貼上去的紅紙，寫著祐廷的名字）|阿姨貼的，我攔不住。|她說明年要換貼我的。',JSON.stringify(H.msgs('p:heroine_03'))); }
  H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
