// AA_381 法律系大四下第一部分（企劃線 d14a0388；AA381-Y4S2-FIX-1021）——不需要瀏覽器。
//   第 1 節：交換延畢的玩家（日本、美國路線，PG.delayed）6/2 典禮那天大家不說「畢業快樂」：15 句換版本（GRADUATED 照舊，只換字）；臺灣路線照舊。
//   第 2 節：語彤週四 17:00～20:00——大三上 12/16 以後總圖三樓、大三下 2/24 起田野訪談、大四上起（2028-09-04～）總圖三樓到她畢業。
//   句子從企劃檔讀（git show d14a0388），逐句對。修改前：第 1、2 節全部 FAIL（除了臺灣路線照舊那幾項）。用法：node tests/aa381_y4s2_unit.js
require('./alison.js');   /* AA_380：企劃線的舊稿還寫「小語」，讀稿的時候照匯入工具換成 Alison */
const H=require('./pg_harness.js'); const {check}=H; const {execSync}=require('child_process');
const DOC=execSync('git -c core.quotepath=false show d14a0388:"docs/story_planning/AA_381_法律系大四下_交換延畢的畢業典禮那天_修正稿.md"',{cwd:H.ROOT,encoding:'utf8'});
const row=k=>{ const r=DOC.split('\n').find(l=>l.startsWith('| ')&&l.includes(k)); if(!r) throw new Error('企劃檔找不到這一列：'+k); const c=r.split('|').map(x=>x.trim()); return {now:c[2],dly:c[3]}; };
const q=s=>[...s.matchAll(/「([^」]*)」/g)].map(m=>m[1]);   /* 一格裡「」包起來的句子 */
const heart=(id)=>{ SOCIAL.rel(id).npcRom=40; const L=DATE.log(H.G,id); L.count=4; L.wish=true; };
const D=POSTGRAD_LINES.DELAYED;
(async()=>{
  const GM=H.GM;
  // ---- 0. 資料和企劃檔一字不差 ----
  { const pairs=[['THERMOS 第 2 句',D.thermos2],['THERMOS `ex`',D.thermosEx],['OTHERS `kai`',D.kai[0][1]],['PHONE `zhiruo`',D.zhiruo[1]],['TE.HEART `heroine_05.decline`',D.sisDecline],
      ['TE.HEART `heroine_04.invite`',D.zqFirst],['TE.GF `heroine_04.invite`',D.zqGf],['BDAY `friendOpts`',D.bdayFriend],['BDAY `exReply`',D.bdayEx[1]],['YT17 `friend`',D.yt17Friend],['YT17 `other`',D.yt17Other],
      ['`heroine_05.thermos`',D.epiThermos],['`ps.card`',D.psCard]];
    for(const [k,v] of pairs) check('0. 企劃檔「'+k+'」那一列的新句子＝'+v,q(row(k).dly).includes(v),JSON.stringify(q(row(k).dly)));
    const ps=q(row('PHONE `peishan`').dly); check('0. 沛珊兩句＝企劃檔',ps[0]===D.peishan[1]&&ps[1]===D.peishan[2],JSON.stringify(ps));
    const ng=q(row('AUTO_NO_GRAD').dly); check('0. AUTO_NO_GRAD 兩句＝企劃檔',ng.includes(TERMEND_LINES.AUTO_NO_GRAD_DELAYED.heroine_01)&&ng.includes(TERMEND_LINES.AUTO_NO_GRAD_DELAYED.yu)&&TERMEND_LINES.AUTO_NO_GRAD_DELAYED.heroine_05===TERMEND_LINES.AUTO_NO_GRAD_DELAYED.heroine_01&&TERMEND_LINES.AUTO_NO_GRAD_DELAYED.classmate_xinci===TERMEND_LINES.AUTO_NO_GRAD_DELAYED.heroine_01,JSON.stringify(ng));
    check('0. 原本那幾句照舊（企劃檔「現在」那一欄）',q(row('THERMOS 第 2 句').now)[0]===POSTGRAD_LINES.THERMOS.lines[1][1]&&q(row('YT17 `friend`').now)[0]===POSTGRAD_LINES.YT17.friend&&q(row('`ps.card`').now)[0]===POSTGRAD_LINES.EPI.ps.card[0]); }
  // ---- 1. 典禮拍照：學姊遞保溫瓶、阿凱、語彤（交換延畢＝美國路線；臺灣路線照舊）----
  for(const route of ['US','JP',null]){ const G=H.fresh('2029-06-02',12,'campus',route?{EXCHANGE_ROUTE:route}:{}); H.FRIEND('heroine_05'); H.FRIEND('heroine_03'); await H.run('grad');
    const d=!!route, tag=route?route+' 路線（交換延畢）':'臺灣路線';
    check('1. '+tag+'：學姊遞保溫瓶那一句'+(d?'「'+D.thermos2+'」':'「畢業快樂。」'),d?H.has(D.thermos2)&&!H.said.some(s=>s.t==='畢業快樂。'):H.has('畢業快樂。')&&!H.has(D.thermos2));
    check('1. '+tag+'：阿凱'+(d?'「恭喜一半。宵夜？」':'「畢業快樂。宵夜？」')+'，後面兩句照舊',(d?H.has('恭喜一半。宵夜？')&&!H.has('畢業快樂。宵夜？'):H.has('畢業快樂。宵夜？'))&&H.has('……現在才中午。')&&H.has('那晚上。'));
    check('1. '+tag+'：語彤（朋友）'+(d?'「'+D.yt17Friend+'」':'照舊'),d?H.has(D.yt17Friend):H.has(POSTGRAD_LINES.YT17.friend)); }
  { const G=H.fresh('2029-06-02',12,'campus',{EXCHANGE_ROUTE:'US'}); H.FRIEND('heroine_03'); H.FRIEND('kexin'); H.date('kexin'); await H.run('grad');
    check('1. 交換延畢、有伴侶：語彤「'+D.yt17Other+'」',H.has(D.yt17Other)&&!H.has(POSTGRAD_LINES.YT17.other)); }
  // ---- 2. 手機（不在現場的人）----
  for(const route of ['JP',null]){ const G=H.fresh('2029-06-02',11.6,'campus',Object.assign({PS_RECONNECT:true},route?{EXCHANGE_ROUTE:route}:{})); H.FAMILIAR('classmate_peishan'); H.FAMILIAR('heroine_02'); H.FRIEND('heroine_05'); H.date('heroine_05'); ROM.end(G,'heroine_05'); H.FRIEND('heroine_05');
    await H.run('grad'); for(const h of [12.1,12.6,13.1,21.1]){ H.at('2029-06-02',h); PG.rules(GM); PHONE.tick(G); }
    H.at('2029-06-03',5.2); PG.rules(GM); PHONE.tick(G);   /* 芷若的票根：AA_510 0-2 第 4 點改 6/3 05:07（英國 6/2 22:07）*/
    const d=!!route, tag=d?'交換延畢':'臺灣路線';
    check('2. '+tag+'：沛珊卡片'+(d?'「我學生說要送穿學士服的人卡片。……我拍給你。」「恭喜！」':'照舊'),d?H.msgs('p:classmate_peishan').join('|').endsWith(D.peishan.slice(1).join('|')):H.msgs('p:classmate_peishan').includes('畢業快樂！'),JSON.stringify(H.msgs('p:classmate_peishan')));
    check('2. '+tag+'：芷若票根'+(d?'「恭喜。今天下午替你看了一部。」':'照舊'),d?H.msgs('p:heroine_02').includes(D.zhiruo[1]):H.msgs('p:heroine_02').includes('畢業快樂。今天下午替你看了一部。'),JSON.stringify(H.msgs('p:heroine_02')));
    check('2. '+tag+'：分手過的學姊'+(d?'「今天恭喜。」':'「畢業快樂。」'),d?H.msgs('p:heroine_05').includes(D.thermosEx)&&!H.msgs('p:heroine_05').includes('畢業快樂。'):H.msgs('p:heroine_05').includes('畢業快樂。'),JSON.stringify(H.msgs('p:heroine_05'))); }
  // ---- 3. 傍晚的當面約：學姊心意邀約不接、接了學姊以後女朋友那一句、子晴 16:30 私訊 ----
  { const G=H.fresh('2029-06-02',12,'campus',{EXCHANGE_ROUTE:'US'}); H.FRIEND('heroine_05'); heart('heroine_05'); H.picks=['今天晚上我有約了'];
    await H.run('grad'); check('3. 學姊心意邀約、回「今天晚上我有約了。」→「'+D.sisDecline+'」',H.has(D.sisDecline)&&!H.has('好。畢業快樂。'),JSON.stringify(H.lines().slice(-6))); }
  { const G=H.fresh('2029-06-02',12,'campus',{EXCHANGE_ROUTE:'JP'}); H.FRIEND('heroine_05'); heart('heroine_05'); H.FRIEND('heroine_01'); H.date('heroine_01'); H.picks=['好。'];
    await H.run('grad'); check('3. 接了學姊、女朋友以安當面約：「好。今天恭喜。」',H.has('好。今天恭喜。')&&!H.has('好。畢業快樂。'),JSON.stringify(H.lines().slice(-6))); }
  for(const [route,gf] of [['US',false],['US',true],[null,false]]){ const G=H.fresh('2029-06-02',12,'campus',route?{EXCHANGE_ROUTE:route}:{}); H.FRIEND('heroine_04'); if(gf) H.date('heroine_04'); else heart('heroine_04'); H.FRIEND('heroine_01'); await H.run('grad');
    H.at('2029-06-02',16.1); PG.rules(GM); H.at('2029-06-02',16.5); PHONE.tick(G); const m=H.msgs('p:heroine_04').join('|'), tag=(route?'交換延畢':'臺灣路線')+(gf?'、子晴是女朋友':'、子晴心意邀約');
    const want=!route?'畢業快樂|晚上吃飯 只有我們兩個':(gf?D.zqGf:D.zqFirst+'|晚上吃飯 只有我們兩個');
    check('3. '+tag+'：16:30 私訊「'+want+'」',m===want,m); }
  // ---- 4. 20:30 學姊的生日：友情版「生日快樂。」、前任的回覆 ----
  { const G=H.fresh('2029-06-02',12,'campus',{EXCHANGE_ROUTE:'US'}); H.FRIEND('heroine_05'); PHONE.join(G,'family_law','法律系直屬家族'); await H.run('grad');
    H.at('2029-06-02',19.1); PG.rules(GM); H.at('2029-06-02',19.6); PHONE.tick(G); H.said=[]; H.picks=[0]; await PG.EVS[0].beforeOuting(G,GM,OUT.get(G,'pg_sis_bday'));
    check('4. 交換延畢、生日友情版「生日快樂。」→「'+D.bdayFriend+'」',H.has(D.bdayFriend)&&!H.has('今天你畢業，我生日。都沒排，結果還不錯。'),JSON.stringify(H.lines())); }
  { const G=H.fresh('2029-06-02',12,'campus',{EXCHANGE_ROUTE:'US'}); H.FRIEND('heroine_05'); H.date('heroine_05'); ROM.end(G,'heroine_05'); H.FRIEND('heroine_05'); PHONE.join(G,'family_law','法律系直屬家族'); await H.run('grad');
    H.at('2029-06-02',19.1); PG.rules(GM); H.at('2029-06-02',19.6); PHONE.tick(G); PHONE.answer(G,'pg_sis_ex_bday',0); PG.rules(GM);
    check('4. 交換延畢、分手過的學姊：中午「今天恭喜。」已經送到＝晚上只回「謝謝。」（AA_473 第 1 節；原本多一句「今天的典禮，恭喜你。」，DELAYED.bdayEx 第 2 句留給中午那一則沒送到的）',H.msgs('p:heroine_05').join('|').endsWith(D.thermosEx+'|生日快樂。|謝謝。')&&!H.msgs('p:heroine_05').includes(D.bdayEx[1]),JSON.stringify(H.msgs('p:heroine_05'))); }
  // ---- 5. 手機的心意邀約：接了別人，其他人自動回 AUTO_NO_GRAD（termend3d.js）----
  for(const route of ['JP',null]){ const G=H.fresh('2029-06-02',16,'campus',route?{EXCHANGE_ROUTE:route}:{});
    PHONE.at(G,G.day,16,[{th:'p:yu',from:'yu',text:'晚上一起吃飯嗎！！',ask:{id:'te_t_yu',until:G.day*24+20,opts:[{t:'好。'}]}}],'te_t_yu'); PHONE.tick(G);
    const R=TERMEND.rec(G,'Y4S2'); R.asks={yu:'te_t_yu'}; R.plan={heart:[]}; TERMEND.playerPicked(G,{who:'heroine_01',te:{kind:'friend',term:'Y4S2'}});
    const want=route?'好吧！！今天恭喜！':'好吧！！畢業快樂！';
    check('5. '+(route?'交換延畢':'臺灣路線')+'：手機接了別人，Alison 自動回「'+want+'」',H.msgs('p:yu').includes(want),JSON.stringify(H.msgs('p:yu'))); }
  // ---- 6. 尾聲：學姊的保溫瓶、沛珊的卡片 ----
  for(const route of ['US',null]){ const G=H.fresh('2031-06-02',12,'campus',route?{EXCHANGE_ROUTE:route,SIS_THERMOS:true}:{SIS_THERMOS:true}); H.FRIEND('heroine_05'); H.date('heroine_05');
    const t=PG.epiItems(G).join('|'), tag=route?'交換延畢':'臺灣路線';
    check('6. '+tag+'：尾聲學姊的保溫瓶'+(route?'「你穿學士服那天她遞給你的」':'照舊'),route?t.includes(D.epiThermos):t.includes(POSTGRAD_LINES.EPI_PARTNER.heroine_05.thermos),t); }
  for(const route of ['JP',null]){ const G=H.fresh('2031-06-02',12,'campus',route?{EXCHANGE_ROUTE:route,PS_GRAD_CARD:true,BAR_YEAR:2030}:{PS_GRAD_CARD:true,BAR_YEAR:2029}); H.FAMILIAR('classmate_peishan');
    const t=(PG.epiLine(G,'classmate_peishan')||[]).map(x=>x[1]).join('|'), tag=route?'交換延畢':'臺灣路線';
    check('6. '+tag+'：尾聲沛珊卡片第一句'+(route?'「'+D.psCard+'」':'照舊')+'、第二句照舊',(route?t.startsWith(D.psCard):t.startsWith(POSTGRAD_LINES.EPI.ps.card[0]))&&t.includes(POSTGRAD_LINES.EPI.ps.card[1]),t); }
  // ---- 7. 第 2 節：語彤週四 17:00～20:00 ----
  for(const [k,want] of [['2027-12-23','library'],['2028-03-02','田野'],['2028-08-31','田野'],['2028-09-07','library'],['2029-01-11','library'],['2029-03-08','library'],['2030-03-07','library']]){
    const G=H.fresh(k,18,'campus',{YT_EV13:true,MAIN_D1:-400,afternoonDone:true}); const e=STORY.schedEnt(CHARACTERS.heroine_03,G);
    check('7. '+k+'（週四）18:00 語彤在'+(want==='library'?'總圖三樓':'做田野訪談'),want==='library'?!!e&&e.zone==='library'&&e.act==='read':!!e&&e.act==='out'&&/田野/.test(e.away||''),JSON.stringify(e)); }
  H.done(); })().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });
