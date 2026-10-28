// 1A-13 畢業典禮的人、1A-14 畢業那天傍晚（AA_319；src/postgrad3d.js）——不需要瀏覽器。
//   報名提醒（5/10）；拍照的順序（大合照 → 伴侶 → 以安和媽媽 CG-9 → 學姊 W15 → 語彤 17 → 子晴、明軒、阿凱）；BB 的驗收情境 D1～D4、E1～E4；
//   W15 拿掉「一件事。只有一件。」、MET_SIS_FATHER 多「我爸叫我跟你說：恭喜。」（AA-C 更正 b6757852、5ae6a133）；手機 ⑦；心意邀約、女朋友的約會、Café 併桌；
//   20:30 學姊的生日（友情版、戀人版、前任）；可昕 6/3、6/9（BCG-07）；畢業後篇（PG.on、床、課表不跳）；接在 1A-12 家人那一段（AA_318）後面、午餐演完才跳。用法：node tests/graduation_unit.js
const H=require('./pg_harness.js'); const {check}=H;
const heart=(id)=>{ SOCIAL.rel(id).npcRom=40; const L=DATE.log(H.G,id); L.count=4; L.wish=true; };
const sayIdx=t=>H.said.findIndex(s=>s.t===t);
(async()=>{
  const GM=H.GM;
  // ---- 5/10 報名提醒 ----
  { const G=H.fresh('2029-05-10',20,'dorm'); PG.rules(GM); check('1. 5/10 20:00：還沒到',!PG.due(G));
    H.at('2029-05-10',21); const s=PG.due(G); check('1. 5/10 21:00：報名提醒（沒有 bar、不是交換路線）',s&&s.id==='reg');
    H.picks=['不報名']; await PG.runStep(GM,s); check('1. 「（系統）國考報名，這週五截止。」→ 不報名＝BAR_REG false',H.has('國考報名，這週五截止。')&&G.flags.BAR_REG===false&&JSON.stringify(H.opts[0])==='["報名","不報名"]',JSON.stringify(H.opts)); }
  { const G=H.fresh('2029-05-10',21,'dorm',{EXCHANGE_ROUTE:'JP'}); check('1. 日本路線（交換延畢）：沒有報名提醒',!PG.due(G)); }
  { const G=H.fresh('2029-05-10',21,'dorm',{Y4_PATH:'bar'}); PG.rules(GM); check('1. Y4_PATH bar：沒有提醒、BAR_REG＝true（X1）',!PG.due(G)&&G.flags.BAR_REG===true); }
  // ---- D1：單身、以安、學姊、子晴 FRIEND 以上 ----
  { const G=H.fresh('2029-06-02',8,'dorm'); ['zhe','yu','classmate_bohan','classmate_xinci'].forEach(H.FAMILIAR); ['heroine_01','heroine_05','heroine_04'].forEach(H.FRIEND);
    check('2. 6/2 08:00：1A-12 家人那一段先（AA_318，story3d.js S.gradFamily），拍照等它',PG.familyModule()&&STORY.gradMorningDue(G)&&!PG.due(G));
    await STORY.gradFamily(GM);
    check('2. 家人那一段演完（撥穗＝GRADUATED 是那一天；11:55 霖澤館大廳）→ 12:00 拍照',G.flags.GRADUATED===PG.gradDay()&&Math.abs(G.hour-12)<1e-6&&PG.due(G)&&PG.due(G).id==='grad');
    H.said=[]; H.cards=[]; H.cgs=[]; H.opts=[]; H.entered=[];
    await H.run('grad'); const L=H.lines();
    const i0=sayIdx('（傅鐘前，同班的人擠成三排。有人在喊「中間的蹲下」。）'), i1=sayIdx('（以安的媽媽站在傅鐘旁邊。）'), i2=sayIdx('（她還穿著碩士服，手上拿著一個新的保溫瓶。）'), i3=sayIdx('欸不是，今天禮拜六欸，我本來要睡到中午。');
    check('2. D1 順序：大合照 → 以安和媽媽 → 保溫瓶 → 子晴「本來要睡到中午」',i0===0&&i0<i1&&i1<i2&&i2<i3,JSON.stringify([i0,i1,i2,i3]));
    check('2. D1：CG-9 在「謝謝你們這四年陪她吵架。」',H.cgs[0]==='cg_graduation_mother_heroine01'&&H.has('（對大家，很平常）謝謝你們這四年陪她吵架。'));
    check('2. D1：沒有伴侶那一段（可昕、「媽，這是祐廷。」）',!H.has('媽，這是祐廷。')&&!H.has('你的那天，我到了。'));
    check('2. W15：「每天帶出門。」；拿掉「一件事。只有一件。」（b6757852）',H.has('每天帶出門。')&&!H.has('一件事。只有一件。'));
    check('2. 時間：12:00 開始（字卡 6/2（六）12:00）、13:30 結束',H.cards[0][0]==='6/2（六）12:00'&&Math.abs(G.hour-13.5)<1e-6,JSON.stringify(H.cards)+' '+G.hour);
    check('2. 旗標：GRADUATED、SIS_THERMOS、GRAD_PHOTO（同班 FAMILIAR 以上）、以安的記憶 IMPORTANT_CONVERSATION',G.flags.GRADUATED===PG.gradDay()&&G.flags.SIS_THERMOS===true&&G.flags.GRAD_PHOTO.includes('zhe')&&!G.flags.GRAD_PHOTO.includes('classmate_mingxuan')&&SOCIAL.has('heroine_01','IMPORTANT_CONVERSATION'),JSON.stringify(G.flags.GRAD_PHOTO));
    check('2. 阿凱（所有玩家）：「畢業快樂。宵夜？」「……現在才中午。」「那晚上。」',H.has('畢業快樂。宵夜？')&&H.has('……現在才中午。')&&H.has('那晚上。'));
    check('2. E2：單身、沒人邀＝以安約 Café「晚上五點半，兩點半 Café。我訂了窗邊。」、排出遊 17:30',H.has('晚上五點半，兩點半 Café。我訂了窗邊。')&&OUT.get(G,'pg_grad_cafe')&&OUT.get(G,'pg_grad_cafe').h===17.5);
    check('2. 13:30 家人的午餐（1A-12）還沒演：先不跳、床照舊',PG.on(G)&&STORY.gradLunchDue(G)&&PG.y4Due(G)&&!PG.bedOptions(G));
    await STORY.gradLunch(GM);
    check('2. 午餐演完：畢業後篇、床「睡覺：到下一件事」',PG.on(G)&&!PG.y4Due(G)&&STORY.bedOptions(G)[0].hint==='到下一件事');
    // Café 併桌
    OUT.get(G,'pg_grad_cafe').state='done'; G.zone='cafe'; H.at('2029-06-02',17.5); H.said=[]; ['heroine_03'].forEach(H.FAMILIAR);
    const s=PG.due(G); check('3. Café：出遊到了（在 Café）＝併桌那一段',s&&s.id==='cafe'); await PG.runStep(GM,s);
    check('3. E2：「我的帽子不見了。」「我剛剛看到明軒戴兩頂。」→ 抽兩三句 → 蛋糕的蠟燭；GRAD_EVENING＝cafe',H.has('我的帽子不見了。')&&H.has('我剛剛看到明軒戴兩頂。')&&H.has('下禮拜一我就去事務所上班。')&&H.has('（有人點的蛋糕來了，上面插了一根蠟燭，不知道是誰的。）')&&G.flags.GRAD_EVENING==='cafe',JSON.stringify(H.lines()));
    check('3. E4：沒有感言、沒有問題（Café 那一段沒有選項）',H.opts.length===0); }
  // ---- W15 的多一句：HOT_WATER、MET_SIS_FATHER（5ae6a133）----
  { const G=H.fresh('2029-06-02',12,'campus',{HOT_WATER:true,MET_SIS_FATHER:true}); H.FRIEND('heroine_05'); await H.run('grad');
    const a=sayIdx('每天帶出門。'), b=sayIdx('大一那年冬天，你幫我裝的是熱水。我記到現在。'), c=sayIdx('我爸叫我跟你說：恭喜。');
    check('4. HOT_WATER 多一句；MET_SIS_FATHER 她最後多「我爸叫我跟你說：恭喜。」',a>=0&&a<b&&b<c,JSON.stringify([a,b,c])); }
  { const G=H.fresh('2029-06-02',12,'campus'); H.FRIEND('heroine_05'); await H.run('grad'); check('4. 沒有 MET_SIS_FATHER：沒有那一句',!H.has('我爸叫我跟你說：恭喜。')); }
  /* AA_392 第 8 節：交往中、3/17 她爸爸的晚餐約過沒吃到——她那一段之前，她爸爸那一小段；記 MET_SIS_FATHER 'grad'，不再轉述「我爸叫我跟你說：恭喜。」*/
  for(const [k,want] of [[0,['好。','（他對書瑀點了一下頭）']],[1,['下次。','……他記住了。']]]){ const G=H.fresh('2029-06-02',12,'campus',{SIS_FATHER_ASKED:'msg',SIS_FATHER_GO:false}); H.FRIEND('heroine_05'); H.date('heroine_05'); H.picks=[k];
    await H.run('grad'); const F=['（典禮結束，她身邊站著一個頭髮有一點白的男人。）','我爸。','祐廷？','……上次的飯沒吃到。畢業快樂。','（他跟你握了一下手，很用力。）'].concat(want), ix=F.map(t=>sayIdx(t)), w=sayIdx('（她還穿著碩士服，手上拿著一個新的保溫瓶。）');
    check('4. AA_392 第 8 節 交往中、她爸爸的晚餐沒到：保溫瓶那一段之前她爸爸「……上次的飯沒吃到。畢業快樂。」，選項 '+(k?'「上次對不起。」':'「伯父好。」')+'；記 MET_SIS_FATHER grad；沒有「我爸叫我跟你說：恭喜。」',ix.every((v,i)=>v>=0&&(i===0||v>ix[i-1]))&&w>ix[ix.length-1]&&G.flags.MET_SIS_FATHER==='grad'&&!H.has('我爸叫我跟你說：恭喜。'),JSON.stringify(ix.concat([w]))); }
  { const G=H.fresh('2029-06-02',12,'campus',{SIS_FATHER_ASKED:'msg',MET_SIS_FATHER:true}); H.FRIEND('heroine_05'); H.date('heroine_05'); await H.run('grad');
    check('4. AA_392 第 8 節 晚餐有去（MET_SIS_FATHER）：沒有那一小段',!H.has('……上次的飯沒吃到。畢業快樂。')&&H.has('我爸叫我跟你說：恭喜。')); }
  { const G=H.fresh('2029-06-02',12,'campus',{SIS_FATHER_ASKED:'msg',SIS_FATHER_GO:false}); H.FRIEND('heroine_05'); await H.run('grad');
    check('4. AA_392 第 8 節 沒交往：沒有那一小段',!H.has('……上次的飯沒吃到。畢業快樂。')); }
  // ---- D2：和可昕交往 ----
  { const G=H.fresh('2029-06-02',12,'campus',{GIRAFFE_KEYCHAIN:true}); H.FRIEND('kexin'); H.date('kexin'); H.FRIEND('heroine_01'); await H.run('grad');
    const k=sayIdx('（她看到你鑰匙上的長頸鹿。）'), m=sayIdx('（以安的媽媽站在傅鐘旁邊。）'), g=sayIdx('那是妳的帽子。');
    check('5. D2：大合照之後第一個是可昕（長頸鹿：「它還在。脖子還是很短。」）',g>0&&k===g+1&&H.has('它還在。脖子還是很短。')&&k<m,JSON.stringify(H.lines().slice(0,7))); }
  { const G=H.fresh('2029-06-02',12,'campus'); H.FRIEND('kexin'); H.date('kexin'); await H.run('grad'); check('5. 沒有長頸鹿：「你的那天，我到了。」',H.has('你的那天，我到了。')); }
  // ---- D3：和芷若交往 ----
  { const G=H.fresh('2029-06-01',22.4,'dorm'); H.FRIEND('heroine_02'); H.date('heroine_02'); PG.rules(GM); H.at('2029-06-01',23.1); H.tick();
    check('6. D3：前一晚 23:00「我設了鬧鐘。」',H.msgs('p:heroine_02').includes('我設了鬧鐘。'),JSON.stringify(H.msgs('p:heroine_02')));
    H.at('2029-06-02',8); await STORY.gradFamily(GM); const a=sayIdx('這裡凌晨三點。……學士服是不是借太大件？'), b=sayIdx('（撥穗。帽子上的穗從右邊換到左邊，只有一秒。）');
    check('6. D3：視訊在家人那一段裡、校級典禮完、法律學院典禮（撥穗）以前（10:30＝英國凌晨三點多）',a>=0&&a<b&&sayIdx('（看台上，媽媽一直在揮手。爸爸舉著手機，沒有放下來過。）')<a&&G.flags.PG_ZR_VIDEO===true,JSON.stringify([a,b]));
    await H.run('grad'); check('6. D3：拍照那一段不再視訊一次',H.said.filter(s=>s.t==='這裡凌晨三點。……學士服是不是借太大件？').length===1);
    check('6. D3：典禮開始前視訊（video 背景）；合照時阿凱舉高手機，螢幕裡有她',H.bgs.some(b=>b&&b.image==='assets/bg/video.webp')&&sayIdx('這裡凌晨三點。……學士服是不是借太大件？')<sayIdx('（傅鐘前，同班的人擠成三排。有人在喊「中間的蹲下」。）')&&H.has('（合照時，阿凱把手機舉高，螢幕裡的她也在。）')); }
  // ---- D4：和學姊分手過 ----
  { const G=H.fresh('2029-06-02',11.6,'campus'); H.FRIEND('heroine_05'); H.date('heroine_05'); ROM.end(G,'heroine_05'); H.FRIEND('heroine_05'); PG.rules(GM); H.at('2029-06-02',12.1); PHONE.tick(G);
    check('7. D4：學姊前任＝只有「畢業快樂。」訊息',H.msgs('p:heroine_05').includes('畢業快樂。'));
    await H.run('grad'); check('7. D4：拍照沒有保溫瓶',!H.has('每天帶出門。')&&!G.flags.SIS_THERMOS); }
  // ---- ⑦ 手機 ----
  { const G=H.fresh('2029-06-02',11.6,'campus',{PS_RECONNECT:true}); H.FAMILIAR('classmate_peishan'); H.FAMILIAR('npc_fangyt'); H.FAMILIAR('heroine_02'); H.FRIEND('kexin'); H.date('kexin'); ROM.end(G,'kexin');
    await H.run('grad'); for(const h of [12.1,12.6,13.1,21.1]){ H.at('2029-06-02',h); PG.rules(GM); PHONE.tick(G); }
    H.at('2029-06-03',5.2); PG.rules(GM); PHONE.tick(G);   /* 芷若的票根：AA_510 0-2 第 4 點改 6/3 05:07（英國 6/2 22:07）*/
    check('8. ⑦ 可昕分開了 12:00「恭喜。」、沛珊 12:30 卡片（記 PS_GRAD_CARD）、方奕廷 13:00 山上、芷若 6/3 05:07 票根（英國 6/2 22:07）',H.msgs('p:kexin').includes('恭喜。')&&H.msgs('p:classmate_peishan').includes('我學生說要送畢業的人卡片。……我拍給你。')&&G.flags.PS_GRAD_CARD===true&&H.msgs('p:npc_fangyt').includes('這裡沒訊號。下山才傳。恭喜。')&&H.msgs('p:heroine_02').includes('畢業快樂。今天下午替你看了一部。'),JSON.stringify((G.msgs||[]).map(m=>m.text))); }
  // ---- E1：學姊條件到齊、單身 → 飯 → 椰林大道告白 → 20:30 研究室戀人版 ----
  { const G=H.fresh('2029-06-02',12,'campus'); H.FRIEND('heroine_05'); heart('heroine_05'); H.picks=['好。'];
    await H.run('grad');
    check('9. E1：拍照最後「今天晚上……飯吃完，跟我回研究室。」→ 接了＝17:30 學期末的飯（不排 Café）',H.has('今天晚上……飯吃完，跟我回研究室。')&&OUT.get(G,'te_Y4S2')&&OUT.get(G,'te_Y4S2').h===17.5&&!OUT.get(G,'pg_grad_cafe'),JSON.stringify(G.outings));
    check('9. E3 的規則：Café 那句由別人說（阿哲；學姊發了邀約不說）',H.has('晚上五點半兩點半啦，能來的都來。'));
    H.at('2029-06-02',17.5); H.said=[]; H.picks=['（先不說）','「好。」'];
    await TERMEND.dinner(GM,OUT.get(G,'te_Y4S2'));
    check('9. 飯桌一句「拍照拍到臉僵了。……你也是。」；她說畢業傍晚限定版「我以前把喜歡的東西都排在計畫後面。」「這次計畫做完了。……後面排你。」；交往',H.has('拍照拍到臉僵了。……你也是。')&&H.has('我以前把喜歡的東西都排在計畫後面。')&&H.has('這次計畫做完了。……後面排你。')&&G.flags.dating_heroine_05===true,JSON.stringify(H.lines()));
    { const i=t=>H.said.findIndex(s=>s.t===t), n1='（她手上拿著一張摺過的小便條。從吃飯的時候就一直拿著。）', n2='（便條上寫滿了字。她一句都沒有照著念。）';
      check('9. AA_350 M7：畢業那天她說的那一版也有便條那一拍：「（她手上拿著一張摺過的小便條……）」在「我以前把喜歡的東西……」前面（旁白）、「（便條上寫了三行……）」在「……後面排你。」後面；BCG-44 有放',i(n1)>=0&&H.said[i(n1)].who==null&&i(n1)<i('我以前把喜歡的東西都排在計畫後面。')&&i(n2)>i('這次計畫做完了。……後面排你。')&&H.cgs.includes('cg_three_things_heroine05'),JSON.stringify(H.lines())+' cgs='+JSON.stringify(H.cgs)); }
    H.at('2029-06-02',19.5); PG.rules(GM); check('9. GRAD_EVENING＝date:heroine_05',G.flags.GRAD_EVENING==='date:heroine_05');
    const s=PG.due(G); check('9. 飯後直接走回研究室（不用選）',s&&s.id==='bday_walk'); H.said=[]; H.picks=[2]; await PG.runStep(GM,s);
    check('9. 20:30 戀人版：Kevin「我們先走了！學弟，蛋糕交給你。」→「……不說。這次不排。」；SIS_BDAY_Y4＝lover',H.has('我們先走了！學弟，蛋糕交給你。')&&H.has('……不說。這次不排。')&&G.flags.SIS_BDAY_Y4==='lover'&&G.hour>=20.5,JSON.stringify(H.lines())); }
  // ---- E3：和以安交往 ----
  { const G=H.fresh('2029-06-02',12,'campus'); H.FRIEND('heroine_01'); H.date('heroine_01'); H.FRIEND('heroine_03'); H.picks=[0,'好。'];
    await H.run('grad');
    check('10. E3：以安「今天不讀書。……晚上的位子我訂好了。」；Café 那句由別人說（語彤 FRIEND）',H.has('今天不讀書。……晚上的位子我訂好了。')&&!H.has('晚上五點半，兩點半 Café。我訂了窗邊。')&&H.has('晚上要不要一起吃？店今天沒開，我們去兩點半。')&&OUT.get(G,'te_gf_Y4S2_heroine_01'),JSON.stringify(H.lines().slice(-4))); }
  // ---- 第二次（之前說過「讓我想想」）：以安 18:00 ----
  { const G=H.fresh('2029-06-02',12,'campus'); H.FRIEND('heroine_01'); heart('heroine_01'); TERMEND.rec(G).think.heroine_01='Y4S1'; H.picks=['好。'];
    await H.run('grad'); check('11. 第二次：「典禮完，六點，同一家。」「手帳最後一頁，我還沒給你看。」→ 18:00',H.has('典禮完，六點，同一家。')&&H.has('手帳最後一頁，我還沒給你看。')&&OUT.get(G,'te_Y4S2').h===18); }
  // ---- 子晴 16:30 私訊（心意邀約）----
  { const G=H.fresh('2029-06-02',12,'campus'); H.FRIEND('heroine_04'); heart('heroine_04'); H.FRIEND('heroine_01'); await H.run('grad');
    check('12. 沒人當面約：Café 排了',OUT.get(G,'pg_grad_cafe').state==='planned');
    H.at('2029-06-02',16.1); PG.rules(GM); H.at('2029-06-02',16.5); PHONE.tick(G);
    const m=PHONE.byAsk(G,'pg_zq_dm'); check('12. 16:30 子晴私訊「畢業快樂」「晚上吃飯 只有我們兩個」',H.msgs('p:heroine_04').join('|')==='畢業快樂|晚上吃飯 只有我們兩個'&&!!m,JSON.stringify(H.msgs('p:heroine_04')));
    PHONE.answer(G,'pg_zq_dm',0); PG.rules(GM);
    check('12. 回「好。」＝18:00 的飯、Café 取消',OUT.get(G,'te_Y4S2')&&OUT.get(G,'te_Y4S2').h===18&&OUT.get(G,'pg_grad_cafe').state==='cancelled');
    H.at('2029-06-02',17.4); PG.rules(GM); H.at('2029-06-02',17.6); PHONE.tick(G);
    check('12. 17:30 阿哲在麵店團傳 Café 的照片（沒有麵店團＝沒有）；接了一對一的記「聽說」只有在群組裡',!PHONE.inGroup(G,'noodle_team')||G.flags.GRAD_CAFE_HEARD===true); }
  // ---- 19:30 Kevin、學姊生日（友情版）、前任 ----
  { const G=H.fresh('2029-06-02',12,'campus'); H.FRIEND('heroine_05'); PHONE.join(G,'family_law','法律系直屬家族'); await H.run('grad');
    H.at('2029-06-02',19.1); PG.rules(GM); H.at('2029-06-02',19.6); PHONE.tick(G);
    check('13. 19:30 Kevin「學姊今天生日，研究室，八點半。」→ 出遊 20:30（可以不去）',H.msgs('g:family_law').includes('學姊今天生日，研究室，八點半。')&&OUT.get(G,'pg_sis_bday')&&OUT.get(G,'pg_sis_bday').h===20.5);
    H.said=[]; H.picks=[0]; await PG.EVS[0].beforeOuting(G,GM,OUT.get(G,'pg_sis_bday'));
    check('13. 友情版：Kevin 點蠟燭、「{name}也來了。」（AA_327：不說「學弟也來了」）、「生日快樂。」→「今天你畢業，我生日。都沒排，結果還不錯。」',H.has('學姊！快！蠟燭要燒完了！')&&H.has('祐廷也來了。')&&!H.has('學弟也來了。')&&H.has('今天你畢業，我生日。都沒排，結果還不錯。')&&G.flags.SIS_BDAY_Y4==='there',JSON.stringify(H.lines())); }
  { const G=H.fresh('2029-06-02',12,'campus'); H.FRIEND('heroine_05'); PHONE.join(G,'family_law','法律系直屬家族'); await H.run('grad'); H.at('2029-06-02',19.1); PG.rules(GM); H.at('2029-06-02',19.6); PHONE.tick(G);
    const q=OUT.get(G,'pg_sis_bday'); H.at('2029-06-03',0); OUT.expire(G); OUT.onMissed(GM,q); H.at('2029-06-03',9.6); PG.rules(GM); H.at('2029-06-03',10.1); PHONE.tick(G);
    check('13. 沒去：第二天家族群組只有她一句「謝謝大家。」',q.state==='missed'&&H.msgs('g:family_law').includes('謝謝大家。')&&G.flags.SIS_BDAY_Y4==='none'&&G.flags.GRAD_EVENING==='none'); }
  { const G=H.fresh('2029-06-02',12,'campus'); H.FRIEND('heroine_05'); H.date('heroine_05'); ROM.end(G,'heroine_05'); H.FRIEND('heroine_05'); PHONE.join(G,'family_law','法律系直屬家族'); await H.run('grad');
    H.at('2029-06-02',19.1); PG.rules(GM); H.at('2029-06-02',19.6); PHONE.tick(G); PHONE.answer(G,'pg_sis_ex_bday',0); PG.rules(GM);
    check('13. 前任：沒有「去」，傳一句生日快樂 →「謝謝。」（AA_473 第 1 節：中午她已經私訊「畢業快樂。」，晚上不再恭喜一次；原本多一句「今天畢業，恭喜你。」）',!OUT.get(G,'pg_sis_bday')&&H.msgs('p:heroine_05').join('|').endsWith('畢業快樂。|生日快樂。|謝謝。')&&!H.msgs('p:heroine_05').includes('今天畢業，恭喜你。')&&G.flags.SIS_BDAY_Y4==='msg',JSON.stringify(H.msgs('p:heroine_05'))); }
  // ---- 可昕 6/3、6/9（BB_99 9-17、AA_250 9-2）----
  { const G=H.fresh('2029-06-02',12,'campus'); H.FRIEND('kexin'); H.date('kexin'); await H.run('grad');
    check('14. 6/2 傍晚可昕不發約會邀約',!(G.outings||[]).some(q=>/kexin|kx/.test(q.id)));
    H.at('2029-06-03',20.6); PG.rules(GM); H.at('2029-06-03',21.1); PHONE.tick(G);
    check('14. 6/3 21:00「下週六，我的畢業典禮。你要來嗎？」→ 6/9 出遊（政大）',H.msgs('p:kexin').includes('下週六，我的畢業典禮。你要來嗎？')&&OUT.get(G,'pg_kx_grad')&&OUT.get(G,'pg_kx_grad').day===PG.DK('2029-06-09'));
    H.said=[]; H.cgs=[]; await PG.EVS[1].beforeOuting(G,GM,OUT.get(G,'pg_kx_grad'));
    check('14. 去：「你來了。」「等我拍完。晚上吃山下那家。」BCG-07、飯桌「八月四號以前，我們還有八週。」；KX_GRAD both、KX_TERMEND_Y4S2',H.has('你來了。')&&H.cgs.includes('cg_two_graduations_kexin')&&H.has('八月四號以前，我們還有八週。')&&G.flags.KX_GRAD==='both'&&G.flags.KX_TERMEND_Y4S2===G.day,JSON.stringify(H.lines())); }
  { const G=H.fresh('2029-06-09',12,'dorm',{GRADUATED:1355}); PG.rec(G).done.grad=1; H.date('kexin'); PG.planKx(G); const q=OUT.get(G,'pg_kx_grad'); H.at('2029-06-09',18); OUT.expire(G); OUT.onMissed(GM,q); H.at('2029-06-09',18.6); PHONE.tick(G);
    const s=PG.due(G); H.cgs=[]; if(s) await PG.runStep(GM,s);
    check('14. 不去：她傳「拍完了。予樂說，你欠我一張合照。」，BCG-07 照樣出現；KX_GRAD mine',H.msgs('p:kexin').includes('拍完了。予樂說，你欠我一張合照。')&&H.cgs.includes('cg_two_graduations_kexin')&&G.flags.KX_GRAD==='mine'); }
  // ---- 課表：畢業後篇不再跳去上課 ----
  { const G=H.fresh('2029-06-05',8,'dorm',{GRADUATED:1355}); PG.rec(G).done.grad=1; let threw=null; try{ CLS.tick(GM); }catch(e){ threw=e; }
    check('15. 畢業後篇：CLS.tick 不丟例外、PG.on',!threw&&PG.on(G),threw&&threw.stack); }
  H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
