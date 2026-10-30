/* ===== 事件包第 3 輪：大二到畢業後篇的小事件（AA_328，AA-C 2026-10-20 定稿 5ae6a133；任務 EVPKG-R3-1020）：手機、時間窗、鬧鐘、人物放到場景裡 =====
   台詞照 AA_328 不改字；事件（3D 場景裡碰到的、出遊的 2D 場面）在 src/data/r3_events.js。掛在 STORY.PHONE_RULES（手機：每一輪）、STORY.TICKS（把人放到場景裡）、
   STORY.ALARMS（鬧鐘），另外包住 STORY.bedOptions（3/13 早上六點的鬧鐘可以早於 06:30）、STORY.neededAnswered（記主線 4 的 kai_bot 回過沒有）。不改 story3d.js。
   3-01 芷若的試譯稿費（2026-11-11、11/25 私訊；時刻照 y2_zr_order：她知道你在交往 15:10，其他 22:07）
   3-02 阿凱 F2（12/6 的週日宵夜在 r3_events.js；沒去＝12/7 00:40 截圖；所有人 12/18 23:40「機器人拿了A」）
   3-04 方奕廷 F3 早上六點（3/12 21:00 約、3/13 06:00 椰林大道、鬧鐘 05:30；沒去＝07:00 葉子；拍照＝3/14 13:00 阿凱；法學院的樹＝3/24 12:20）
   3-05 芷若 F4 拉花比賽（5/7 Café 在 r3_events.js；沒去、和她 FAMILIAR 以上＝22:07 黑板的照片）
   3-07 阿凱 F5 萬聖節（2027-10-27 23:40 三則＋三選一（期限 10/28 18:00）；沒回 18:10；10/30 13:10 照片）
   3-06 大二暑假三個摘要日的旁白（包住 HOME.breakArrive；8/25 記 SUMMER_Y2；第三個房間的拆箱多兩列：包住 STORY.roomY3Items）
   3-08 SK12（12/20～12/23 晚上走進社科圖＝品妤放在最裡面那張長桌的桌角；事件在 r3_events.js；大四 2028-11-10 20:30 她的私訊）
   3-10 阿凱 K5（2028-11-22 23:40，期限到 11/23 08:00；11/23 22:30；美國路線照當地時間）
   3-15 子晴凌晨三點的 build（2029-03-16 02:58：醒著＝即時三則＋三選一、睡了＝起床看到四則；電話那一段在 r3_events.js；尾聲 'sleep' 多一句：包住 PG.epiLine）
   3-16 沛珊 2029 年的營隊（交往中三組訊息；沒交往、重新聯絡上的＝7/23～7/27 自動回：包住 MSG.send；不在的日子在 characters.js 的 absentDates）
   3-11 學姊的讀書計畫和便條（10/21 家族群組；美國路線 10/18 會所；1/9 或 2/21 研究室；2/3 08:30 考場門口（在家的時候包住 STORY.y4HomeDue／y4HomeScene）或 2/2 21:00 照片）
   3-13 方奕廷 F4（1/24 21:00；1/27 07:00 開車去嘉義：出遊＋鬧鐘；在家睡覺的叫醒包住 HOME.wakeFor）
   3-14 學姊交往中的大四（2/26 起每週三研究室、3/14 她爸爸的晚餐（3/17）、4/27 她自己放的一天假（4/28））
   3-12 何俊朗 1～5（美國路線：8/14、9/8、9/15、10/4、10/24→10/25；人物 npc_long 只在 characters.js 的 PORTRAIT_ONLY 登錄名字）——AA_370 M3：停用，美國路線只跑 us_life3d.js 的 USL 版（舊存檔排了的取消）；第 6 節第 9 題：R3 版的事件資料刪掉
   3-19 摘要日的手機小事（池＝加進 STORY.DAILY_PHONE；定時＝PHONE.at；子晴的爸爸＝包住 INV.walkPick）
   3-09 沛珊在台南的「再去」三版：不在這個檔——資料是 src/data/hometown_lines.js 的 'classmate_peishan@台南'，hometown3d.js 的 S.key 照 presence 的城市選那一組
        （presence 改台南、學期中的邀約是 AA_282 第 5 節第 1、3 點——2026-10-21 已接：characters.js 的 presence「在台南」、台南邀約在 hometown3d.js（PS_TAINAN_VISITS）；AA_507 0-2 第 8 點更新註解）
   3-18 2031 交換延畢的第二年：不做——AA_331 第 1 節 b（a642f518，AI解讀、待使用者確認）定了交換延畢的 2030 也不再擋、沒有 2031 國考（postgrad3d.js 的 S.tier 已經這樣）
   3-03、3-17：AA_328 標「已在」，跳過
   測試：node tests/r3_events_unit.js */
'use strict';
const R3=(function(){
  const S={};
  const D=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const T=(d,h)=>d*24+h, now=G=>G.day*24+G.hour;
  const past=(G,d,h)=>d!=null&&now(G)>=T(d,h);
  const has=(id,tag)=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(id,tag);
  const knows=(id,G)=>typeof STORY!=='undefined'&&!!STORY.knows&&STORY.knows(id,G);
  const done=(G,id)=>!!(G.events&&G.events.done&&G.events.done[id]);
  const LOVE=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan','kexin'];
  const dating=(G,id)=>{ const F=(G&&G.flags)||{}, R=F.romance||{}; return F['dating_'+id]===true||!!(R[id]&&R[id].status==='dating'); };
  const datingAny=G=>LOVE.some(x=>dating(G,x));
  const stageAt=(id,lv)=>typeof SOCIAL!=='undefined'&&!!SOCIAL.STAGES&&SOCIAL.STAGES.indexOf(SOCIAL.stage(id))>=SOCIAL.STAGES.indexOf(lv);
  const met=(G,id,lv)=>knows(id,G)&&stageAt(id,lv||'FAMILIAR');   /* 先看認識（不替沒有紀錄的人建一筆空的關係），才問階段；交往中（RELATIONSHIP）一定算 */
  const contact=(G,id)=>typeof INV!=='undefined'&&!!INV.hasContact&&INV.hasContact(G,id);
  const law=G=>(G.stage||'law')==='law';
  const tz=(G,d)=>typeof STORY!=='undefined'&&STORY.tzOffset?STORY.tzOffset(G,d):0;   /* 人在國外：當地時間＝臺灣時間＋這個數（日本 +1、美國 −12／11/5 起 −13）*/
  const hm=x=>{ const m=Math.round(x*60); return String(Math.floor(m/60)%24).padStart(2,'0')+':'+String(m%60).padStart(2,'0'); };
  const M=id=>t=>({th:'p:'+id,from:id,text:t});
  const ME=t=>({from:'player',text:t});   /* 回覆選項的 say 裡祐廷接著傳的那一句（對話串由 PHONE.answer 補）*/
  const MEp=id=>t=>({th:'p:'+id,from:'player',who:null,text:t});   /* 排定時間的祐廷那一句 */
  const NAR=t=>({text:t});   /* 對話串裡的旁白（沒有說話的人）*/
  const R=M('heroine_02'), A=M('kai'), FY=M('npc_fangyt');
  /* 芷若傳訊息的時刻（story3d.js 的 y2_zr_order、zrKnows：AA_112 8-1）：她知道祐廷和別人交往＝15:10，其他（雙方都單身）＝22:07 */
  S.zrHour=G=>(typeof ROM!=='undefined'&&ROM.knows?ROM.knows(G,'heroine_02').length>0:!!(G.flags&&G.flags.dating_kexin))?15+10/60:22+7/60;

  /* ===================== 3-01 芷若的試譯稿費（BB_70 8b、8b-1 C2；AA_117 C2；BB_97 第 0b 節）===================== */
  /* 第二張換字（AA_461 第 3 節：兩張原本一字不差）*/
  S.ZR_FEE_SHOTS=[R('📷（對話的截圖）'),R('📷（對話的截圖，往上滑的那一段）'),NAR('（你問了四件事：誰找她、要她做什麼、有沒有說好價錢、他們拿去做了什麼。她一題一題回。）')];
  S.zrFee=function(G){ const F=G.flags, d=D('2026-11-11'), d2=D('2026-11-25'); if(d==null||now(G)<T(d,0)||now(G)>=T(d2+2,0)) return;
    const ok=met(G,'heroine_02','FAMILIAR')&&contact(G,'heroine_02');
    if(ok&&G.day<=d+1&&now(G)>=T(d,S.zrHour(G))&&!PHONE.sent(G,'r3_zr_fee')){ const h=S.zrHour(G), sh=S.ZR_FEE_SHOTS.map(x=>Object.assign({},x)), mem=[{npc:'heroine_02',tag:'ZR_FEE_LETTER',note:''}];
      const opts=[{t:'妳先把你們的對話拍給我看。',say:sh.concat([{from:'heroine_02',text:'……好。我整理一下。'}]),set:{ZR_FEE:'honest'},mem}];   /* 老實的選項，永遠在；二十分鐘後的時間表在下面 */
      if(F.U_CONTRACT) opts.push({t:'先看你們說好了什麼。',say:[ME('說好試譯不付錢，是試譯。拿去用，就不是試譯了。')].concat(sh,[{from:'heroine_02',text:'……原來我可以這樣講。'},ME('翻譯算不算妳的作品、能不能被拿去用，我還沒學到。這部分我們問法服。'),{from:'heroine_02',text:'好。我先寫信，不行再去問。'}]),set:{ZR_FEE:'contract'},mem});   /* 大一下債總契約成立那幾週（U_CONTRACT）才有 */
      PHONE.at(G,d,h,[R('我幫一個出版社翻了一篇短文，對方說「先試譯，不付錢」。'),Object.assign(R('可是他們拿去用了。……這樣正常嗎。'),{ask:{id:'r3_zr_fee',until:T(d+1,18),opts}})],'r3_zr_fee'); }
    if(F.ZR_FEE==='honest'&&!PHONE.sent(G,'r3_zr_fee_tl')){ if(F.ZR_FEE_T==null) F.ZR_FEE_T=now(G); const t=F.ZR_FEE_T+20/60, dd=Math.floor(t/24);   /* （二十分鐘後）*/
      PHONE.at(G,dd,t-dd*24,[R('📷（一張時間表。日期、誰說了什麼，一格一格排好。）'),MEp('heroine_02')('翻譯算不算妳的作品、能不能被拿去用，我還沒學到。這部分我們問法服。'),R('好。我先寫信，不行再去問。')],'r3_zr_fee_tl'); }
    if(F.ZR_FEE==null&&PHONE.sent(G,'r3_zr_fee')&&now(G)>T(d+1,18)){ const m=PHONE.byAsk(G,'r3_zr_fee'); if(!m||m.ans==null){ F.ZR_FEE='missed'; PHONE.at(G,d+1,18,[R('沒事。我自己先問問看。')],'r3_zr_fee_miss'); } }   /* 沒回（隔天 18:00 前）*/
    if(F.ZR_FEE&&G.day>=d2&&now(G)>=T(d2,S.zrHour(G))&&!PHONE.sent(G,'r3_zr_fee2')){ const h=S.zrHour(G);
      if(F.ZR_FEE==='missed') PHONE.at(G,d2,h,[R('出版社回信了。我自己寫的信，他們付了。')],'r3_zr_fee2');
      else PHONE.at(G,d2,h,[R('出版社回信了。道歉，稿費也付了。'),Object.assign(R('我沒想到「問清楚」就有用。'),{ask:{id:'r3_zr_fee2',until:T(d2+1,18),opts:[{t:'恭喜。',say:[{from:'heroine_02',text:'下次來店裡，那杯我請。'}]},{t:'時間表做得好。',say:[{from:'heroine_02',text:'外文系的仔細。……好啦，也是被你問出來的。'}]}]}})],'r3_zr_fee2'); } };

  /* ===================== 3-02 阿凱 F2 聊天機器人（BB_110 F2）：當面那一場在 r3_events.js（12/6 的週日宵夜）===================== */
  S.kaiBotReplied=G=>!!(G.flags&&G.flags.KAI_BOT_REPLIED)||(G.msgs||[]).some(m=>m.ask&&/_kai_bot$/.test(m.ask.id||'')&&m.ans!=null);   /* 主線 4 的 kai_bot（needed_msgs.js）回過（STORY.neededAnswered 記；舊存檔看訊息）*/
  S.kaiF2=function(G){ const F=G.flags, d6=D('2026-12-06'), d18=D('2026-12-18'); if(d6==null||now(G)<T(d6,24)||now(G)>=T(d18+3,0)||!knows('kai',G)) return;
    if(!F.KAI_F2&&now(G)>=T(d6,24+40/60)){ F.KAI_F2='missed'; PHONE.at(G,d6,24+40/60,[A('📷（截圖：機器人：看情況。）'),A('它學你的'),A('不客氣')],'r3_kai_f2_miss'); }   /* 沒去 12/6 的宵夜：12/7（一）00:40 */
    if(now(G)>=T(d18,23+40/60)&&!PHONE.sent(G,'r3_kai_f2_a')) PHONE.at(G,d18,23+40/60,[A('機器人拿了A'),A('助教問它是誰訓練的'),A('它說 看情況')],'r3_kai_f2_a'); };   /* 所有玩家：12/18（五）23:40 */

  /* ===================== 3-04 方奕廷 F3 早上六點（BB_110 F3）===================== */
  S.FANG_WHY='約好的時間：椰林大道 06:00';
  S.FANG_GOTO={zone:'campus',x:-4,z:-7.5,yaw:2.23};   /* 椰林大道北側人行道（走過去約 7 m 才碰到方奕廷）*/
  S.FANG_AT={x:1.3,z:-11.6,yaw:-0.91};   /* 方奕廷站在長椅旁邊、面向你走來的方向；阿凱坐在 (0,-13) 那張長椅（zones3d.js 椰林大道北側）*/
  S.fang6am=function(G){ const F=G.flags, d12=D('2027-03-12'); if(d12==null||now(G)<T(d12,21)||now(G)>=T(d12+15,0)) return; const d13=d12+1;
    if(met(G,'npc_fangyt','FAMILIAR')&&contact(G,'npc_fangyt')&&now(G)<T(d13,5.5)&&!PHONE.sent(G,'r3_fang_6am'))
      PHONE.at(G,d12,21,[Object.assign(FY('明天早上六點，椰林大道。帶外套。不用帶腦袋，我負責講。'),{ask:{id:'r3_fang_6am',until:T(d13,6),opts:[{t:'好。',say:[{from:'npc_fangyt',text:'好。阿凱也會來。'}],set:{FANG_6AM_GO:true}},{t:'六點我起不來。',say:[{from:'npc_fangyt',text:'好。那下次。'}],set:{FANG_6AM_GO:false}}]}})],'r3_fang_6am');
    if(F.FANG_6AM_GO===true&&typeof OUT!=='undefined'&&!OUT.get(G,'r3_fang_6am')&&now(G)<T(d13,6.5))   /* 答應＝出遊（只帶到椰林大道，事件在那裡等）；行事曆記 3/13 06:00 */
      OUT.plan(G,{id:'r3_fang_6am',day:d13,h:6,late:0.5,place:'椰林大道',title:'椰林大道 06:00',travel:'走過去 約 10 分鐘',travelH:1/6,goto:Object.assign({},S.FANG_GOTO)});
    if(F.FANG_6AM_GO!=null&&!F.FANG_6AM&&now(G)>=T(d13,6.5)){ F.FANG_6AM='missed'; PHONE.at(G,d13,7,[FY('📷（地上一片很大的葉子，旁邊長椅上睡著的阿凱）'),FY('你錯過了一片葉子。')],'r3_fang_6am_miss'); }   /* 回了「六點我起不來」、或答應了沒到（06:30 以前沒走到他旁邊）*/
    if(F.FANG_6AM_PHOTO&&now(G)>=T(d13+1,13)&&!PHONE.sent(G,'r3_fang_photo')) PHONE.at(G,d13+1,13,[A('刪掉'),A('……算了 傳給我')],'r3_fang_photo');   /* 拍了阿凱睡著的照片：隔天 3/14（日）13:00 */
    { const d=D('2027-03-24'); if(d!=null&&now(G)>=T(d,12+20/60)&&G.day<=d+7&&has('npc_fangyt','FANG_LAWTREE')&&!PHONE.sent(G,'r3_fang_tree')) PHONE.at(G,d,12+20/60,[FY('📷（霖澤館前的那棵樹）'),FY('我自己來看了。它很努力。')],'r3_fang_tree'); } };   /* 3/24（三）12:20 */
  S.fangDue=function(G){ const F=G.flags, d=D('2027-03-13'); return d!=null&&G.zone==='campus'&&F.FANG_6AM_GO===true&&!F.FANG_6AM&&now(G)>=T(d,5+50/60)&&now(G)<T(d,6.5); };
  /* 05:50～06:30 人在校園：方奕廷站在長椅旁、阿凱坐在長椅上（GM.spawnCharacter；until＝07:00 以後走開）*/
  S.fangPlace=function(GM){ const G=GM.G, E=GM.E; if(!S.fangDue(G)||!GM.spawnCharacter||!E) return 0; let n=0;
    if(!GM.npc.npc_fangyt){ const c=GM.spawnCharacter('npc_fangyt',S.FANG_AT.x,S.FANG_AT.z,{yaw:S.FANG_AT.yaw,pose:'idle'}); if(c){ c.idlePose='idle'; c.until=7; n++; } }
    if(!GM.npc.kai){ const st=((E.zone&&E.zone.seats)||[]).find(q=>Math.abs(q.x)<0.6&&Math.abs(q.z+12.94)<0.3)||{x:0,z:-12.94,yaw:0,lv:0}; const c=GM.spawnCharacter('kai',st.x,st.z,{seat:st,pose:'sit'}); if(c){ c.idlePose='sit'; c.until=7; n++; } }
    return n; };

  /* ===================== 3-05 芷若 F4 拉花比賽（BB_110 F4）：沒去、和她 FAMILIAR 以上＝5/7 22:07 黑板的照片（裁定 3）===================== */
  S.latteMissed=function(G){ const F=G.flags, d=D('2027-05-07'); if(d==null||now(G)<T(d,22)||now(G)>=T(d+3,0)||F.ZR_SWAN_VOTE!=null||done(G,'ev_zhiruo_latte_contest')) return;
    F.ZR_SWAN_VOTE='missed'; if(met(G,'heroine_02','FAMILIAR')&&contact(G,'heroine_02')) PHONE.at(G,d,22+7/60,[R('📷（店裡的黑板：本月冠軍：老闆。本月最有想法：在想事情的天鵝。）'),R('老闆寫的。')],'r3_zr_swan_miss'); };

  /* ===================== 3-07 阿凱 F5 萬聖節（BB_110 F5；阿凱的訊息不打標點、分則傳）===================== */
  S.COSTUME={third_party:'脖子上掛著一張紙：我什麼都不知道',force_majeure:'披著雨衣，抱著一台電風扇',negotiorum:'撐著一把傘',depends:'胸前貼著一張紙：看情況',principle:'胸前貼著一張紙：原則上'};
  S.kaiHalloween=function(G){ const F=G.flags, d=D('2027-10-27'); if(d==null||now(G)<T(d,23+40/60)||now(G)>=T(d+5,0)||!knows('kai',G)) return;
    if(!PHONE.sent(G,'r3_kai_h')) PHONE.at(G,d,23+40/60,[A('資工系萬聖節要變裝'),A('我要扮一個法律名詞'),Object.assign(A('你負責'),{ask:{id:'r3_kai_h',until:T(d+1,18),opts:[
      {t:'善意第三人。',say:[ME('脖子上掛一張紙：我什麼都不知道。'),{from:'kai',text:'這個我不用演'}],set:{KAI_COSTUME:'third_party'}},
      {t:'不可抗力。',say:[ME('披雨衣，拿一台電風扇。'),{from:'kai',text:'我是颱風？'},ME('你是理由。'),{from:'kai',text:'好 我去借電風扇'}],set:{KAI_COSTUME:'force_majeure'}},
      {t:'無因管理。',say:[ME('幫路人撐傘，撐一整晚。'),{from:'kai',text:'那我要撐一整晚喔'},{from:'kai',text:'……好啦 我借傘'}],set:{KAI_COSTUME:'negotiorum'}}]}})],'r3_kai_h');
    if(!F.KAI_COSTUME&&PHONE.sent(G,'r3_kai_h')&&now(G)>=T(d+1,18+10/60)){ const bot=has('kai','KAI_BOT'); F.KAI_COSTUME=bot?'depends':'principle'; PHONE.at(G,d+1,18+10/60,[A('我自己選了'),A(bot?'我扮成看情況':'我扮成原則上')],'r3_kai_h_self'); }   /* 沒回：「他自己選了」；大二 F2 教過「先吃飯」（KAI_BOT）＝看情況 */
    if(F.KAI_COSTUME&&S.COSTUME[F.KAI_COSTUME]&&now(G)>=T(d+3,13+10/60)&&!PHONE.sent(G,'r3_kai_h_photo')) PHONE.at(G,d+3,13+10/60,[A('📷（變裝比賽的合照。他站在最旁邊，'+S.COSTUME[F.KAI_COSTUME]+'）'),A('第二名'),A('第一名扮期末報告'),A('大家都很怕他')],'r3_kai_h_photo'); };   /* 10/30（六）13:10 */

  /* ===================== 3-06 大二暑假：三個摘要日的旁白（AA_170 第 2 節；裁定 4～6）===================== */
  /* 一天最多兩句：先打工、再住家裡；兩個都不成立＝照現有（沒有旁白）。打工中＝JOBS.any（SYS-13／DL-10 還沒有：現在實際會出現的只有「暑假回家住」）；家教、麵店工讀不算 */
  S.SUM_Y2={ '2027-06-28':{work:'暑假的班表排出來了。比學期中多兩倍。',home:'媽媽把你的房間打掃過了。'},
    '2027-07-20':{work:{cafe:'芷若不在的下午，店裡安靜很多。',bookstore:'書店的冷氣壞了一個禮拜。老闆說，這樣看書的人比較不會睡著。',cvs:'夜班的冰箱補了三次貨。冰塊賣得比便當快。',cram:'暑期班的學生多了一倍。白板角落有人寫了：助教哥哥。'},home:'姊姊回來住了一週。你們去吃了小時候那家冰。'},   /* 溫州街三家照 AA_165 那一家的熟練描述（字還沒拿到）*/
    '2027-08-25':{work:'你算了一下，暑假存的錢，夠買一台新的筆電。……你沒有買。',home:'家裡視訊的時候，爸爸問你大三要不要考慮出國。你說還在想。'} };
  S.summerJob=G=>{ if(typeof JOBS==='undefined'||!JOBS.any) return null; const j=JOBS.any(G); if(!j) return null; const k=typeof j==='string'?j:(j.id||j.key||j.shop||''); return /tutor|noodle/.test(k)?null:(k||'job'); };   /* 家教寒暑假停、麵店工讀大三上才開始（AA_163、AA_289）*/
  S.summerHome=G=>!!(G.home&&G.home.stay&&G.home.stay.Y2S==='home');
  S.summerLines=function(G,key){ const P=S.SUM_Y2[key]; if(!P) return []; const out=[], j=S.summerJob(G);
    if(j){ const w=typeof P.work==='string'?P.work:(P.work[j]||null); if(w) out.push(w); }
    if(S.summerHome(G)) out.push(P.home); return out; };
  /* 到了摘要日（HOME.breakArrive：快轉停在 18:30 的那一刻）：原本的做完，再說這兩句 */
  S.summerArrive=async function(GM){ const G=GM.G; if(!law(G)||typeof HOME==='undefined'||!HOME.breakPts) return false; const t=now(G);
    const p=HOME.breakPts(G).find(q=>q.k==='sum'&&Math.abs(T(q.day,q.h)-t)<1e-6); if(!p) return false; const key=Object.keys(S.SUM_Y2).find(k=>D(k)===p.day); if(!key) return false;
    for(const l of S.summerLines(G,key)) await GM.say(null,l); return true; };
  /* 8/25 18:30 算一次 SUMMER_Y2（camp／work／home／dorm）；打工中 +22000（AA_170 第 3 節；SYS-13 做了暑假照班發薪就拿掉）*/
  S.summerFlag=function(G,GM){ const F=G.flags, d=D('2027-08-25'); if(d==null||F.SUMMER_Y2!=null||now(G)<T(d,18.5)||now(G)>=T(d+20,0)) return;
    const V=(G.vac&&G.vac.reg)||{}, j=S.summerJob(G); F.SUMMER_Y2=V['C02@Y2']==='done'?'camp':(j?'work':(S.summerHome(G)?'home':'dorm'));
    if(j&&!(typeof JOBS!=='undefined'&&JOBS.summerPay)){ if(GM&&GM.money) GM.money(22000); else G.money=(G.money|0)+22000; } };
  /* 讀它的：主線 5 第三個房間的拆箱（AA_315 1A-03，STORY.roomY3Items）多兩列 */
  if(typeof STORY!=='undefined'&&STORY.ROOM_Y3_TEXT){ Object.assign(STORY.ROOM_Y3_TEXT,{summer_y2_shift:['那家店的暑假班表影印','最下面一格是你的名字。寫錯一個字，老闆用立可白改過。'],summer_y2_popsicle:['一包小時候那家店的冰棒棍','媽媽塞進行李的。你問她留著做什麼，她說：『……留著。』']}); }
  S.roomY3Extra=function(G){ const v=G&&G.flags&&G.flags.SUMMER_Y2, T3=typeof STORY!=='undefined'&&STORY.ROOM_Y3_TEXT; if(!T3) return []; const id=v==='work'?'summer_y2_shift':(v==='home'?'summer_y2_popsicle':null); return id&&T3[id]?[[id,T3[id][0],[T3[id][1]]]]:[]; };

  /* ===================== 3-08 SK12（BB_106）：品妤放到社科圖最裡面那張長桌的桌角；大四 2028-11-10 20:30 她的私訊 ===================== */
  S.SK12_SEAT=16;   /* soclib_layout.js 的座位 16＝離入口最遠的長桌（-3.4,-5.1）東端、北側的位子（桌角）*/
  S.sk12Win=G=>['2027-12-20','2027-12-21','2027-12-22','2027-12-23'].some(k=>{ const d=D(k); return d!=null&&now(G)>=T(d,19)&&now(G)<T(d,21); });
  S.sk12Place=function(GM,entered){ const G=GM.G, E=GM.E; if(G.zone!=='soclib'||G.flags.SK12||!S.sk12Win(G)||!entered||!GM.spawnCharacter||!E) return 0; if(GM.npc.econ_pinyu) return 0;
    const st=(E.zone&&E.zone.seats&&E.zone.seats[S.SK12_SEAT])||{x:-2.2,z:-5.9,yaw:0,lv:0,kind:'table'}; const c=GM.spawnCharacter('econ_pinyu',st.x,st.z,{seat:st,pose:'read'}); if(c){ c.idlePose='read'; c.until=22; return 1; } return 0; };
  S.pinyuActuary=function(G){ const F=G.flags, d=D('2028-11-10'); if(d==null) return; const z=tz(G,d), t=T(d,20.5+z); if(now(G)<t||now(G)>=T(d+5,0)||PHONE.sent(G,'r3_py_actuary')) return;
    if(!(F.MET_PINYU||knows('econ_pinyu',G))||!contact(G,'econ_pinyu')) return; const P=M('econ_pinyu');
    if(!F.SK12){ PHONE.at(G,d,20.5+z,[P('精算第一科過了。')],'r3_py_actuary'); return; }   /* 沒去 SK12、但認識她：不提那張桌子 */
    const L=[P('📷（成績單，第一行：精算 第一科 通過）'),P('精算第一科過了。我還滿喜歡的。')], w=F.PINYU_WORRY;
    if(w==='stay') L.push(Object.assign(P('那題機率題，你現在會了嗎？'),{ask:{id:'r3_py_actuary',until:T(d+1,18+z),opts:[{t:'不會。',say:[{from:'econ_pinyu',text:'很好。'}]},{t:'會了。',say:[{from:'econ_pinyu',text:'騙人。'}]}]}}));
    else if(w==='one') L.push(P('一科一科來。你說的。')); else if(w==='ask') L.push(P('我問了那個學長。他說第一科最難。結果還好。')); else if(w==='both') L.push(P('沒有同時。一科一科。'));
    PHONE.at(G,d,20.5+z,L,'r3_py_actuary'); };

  /* ===================== 3-10 阿凱 K5 所以他可以告我嗎（BB_40 K5；BB_99 5-1；AA_117 C7）===================== */
  /* 2028-11-22（三）23:40（臺灣；美國路線照當地時間）。回覆期限例外：到 11/23 08:00。演過＝msg3d.js 的 'kai:k5_sue'（還好嗎的回覆，三天）*/
  S.kaiK5=function(G){ const F=G.flags, d=D('2028-11-22'); if(d==null||!knows('kai',G)) return; const z=tz(G,d), us=z<0, t0=T(d,23+40/60+z), tEnd=T(d+1,8+z);
    if(now(G)<t0||now(G)>=T(d+4,0)) return;
    if(!PHONE.sent(G,'r3_kai_k5')){ const opts=[
        {t:'先寫下來，明天問法務。',post:'先不要慌。我陪你把發生了什麼寫下來，明天拿去問公司的法務。',say:[{from:'kai',text:'好 你法律系的講話好像大人'}],set:{KAI_K5:'write'}},
        {t:'我不能給正式意見。',post:us?'我還是學生，不能給你正式的法律意見。但我可以陪你聊到你睡著。':'我還是學生，不能給你正式的法律意見。但我可以陪你醒著。',say:[{from:'kai',text:'好 那你不要睡'},NAR('（你們開著電話。二十分鐘，誰都沒說話，只聽得到兩邊在打字。）')],set:{KAI_K5:'awake',KAI_STAYED_UP:true},mem:[{npc:'kai',tag:'KAI_STAYED_UP',note:''}]},
        {t:'先修 bug。',say:[{from:'kai',text:'對 先修 bug'},{from:'kai',text:'你比我們主管冷靜'}],set:{KAI_K5:'bug'}}];
      if(F.U_WORK) opts.push({t:'對外通常是公司處理。',post:'你是在工作時出的事，對外通常是公司處理。你要做的是把經過如實告訴公司。',say:[{from:'kai',text:'……所以不是我一個人被告'},{from:'kai',text:'那我現在可以哭了嗎'},ME('可以。哭完寫經過。')],set:{KAI_K5:'company'}});   /* 大三下修過勞動法（U_WORK）*/
      PHONE.at(G,d,23+40/60+z,(us?[A('你那邊是早上吧 那剛好 我這邊睡不著')]:[]).concat([A('你醒著嗎'),A('我寫的一個 bug 讓一些玩家的道具不見了'),A('有一個玩家在論壇說要告我們'),A('所以他可以告我嗎'),Object.assign(A('這次不是開玩笑'),{ask:{id:'r3_kai_k5',until:tEnd,opts}})]),'r3_kai_k5');
      const E=G.events||(G.events={done:{},last:{},count:0}); E.done=E.done||{}; E.last=E.last||{}; E.done.ev_kai_can_they_sue=(E.done.ev_kai_can_they_sue|0)+1; E.last.ev_kai_can_they_sue=d; }   /* 收到那幾則＝演過（msg3d.js 的 k5_sue 後續）*/
    if(!F.KAI_K5&&PHONE.sent(G,'r3_kai_k5')&&now(G)>=tEnd){ const m=PHONE.byAsk(G,'r3_kai_k5'); if(!m||m.ans==null){ F.KAI_K5='none'; PHONE.at(G,d+1,8+z,[A('沒事了 不用回')],'r3_kai_k5_none'); } }
    if(PHONE.sent(G,'r3_kai_k5')&&now(G)>=T(d+1,22.5+z)&&!PHONE.sent(G,'r3_kai_k5_b')) PHONE.at(G,d+1,22.5+z,[A('公司處理了 道具都補回去了'),A('我以前覺得玩家是數字'),A('昨天我把那個人的留言看了十遍'),A('他是一個國中生 存了三個月的錢')],'r3_kai_k5_b'); };

  /* ===================== 3-15 子晴：凌晨三點的 build（BB_165 4-2）：2029-03-16（五）02:58，和她交往中 ===================== */
  /* 02:58 那一刻醒著（第一次看到這條規則是在 03:20 以前）＝即時三則＋三選一；睡著了（醒來才跑到這裡）＝起床一次看到四則（照原本的時間）＋回覆 */
  S.ZQ3_AT=2+58/60;
  S.zq3am=function(G){ const F=G.flags, d=D('2029-03-16'); if(d==null||!dating(G,'heroine_04')) return; const t=now(G); if(t<T(d,S.ZQ3_AT)||t>=T(d+2,0)) return; const Q=M('heroine_04');
    if(!F.ZQ_3AM_SEEN){ F.ZQ_3AM_SEEN=t<T(d,3+20/60)?'awake':'asleep';
      if(F.ZQ_3AM_SEEN==='awake') PHONE.at(G,d,S.ZQ3_AT,[Q('欸不是，你醒著嗎'),Q('📎 build_0316_0258.zip'),Object.assign(Q('第二關我改了。我覺得改壞了。'),{ask:{id:'r3_zq_3am',until:T(d,8),opts:[
          {t:'第二關，貓卡在牆裡。',say:[{from:'heroine_04',text:'……我就知道。'}],set:{ZQ_3AM_BUILD:'tested'}},
          {t:'明天再測，妳去睡。',say:[{from:'heroine_04',text:'……你這樣講很像我爸。'}],set:{ZQ_3AM_BUILD:'sleep'}},
          {t:'（直接打電話給她）',post:false,set:{ZQ_3AM_BUILD:'call'}}]}})],'r3_zq_3am');
      else { PHONE.at(G,d,S.ZQ3_AT,[Q('欸不是，你醒著嗎')],'r3_zq_3am'); PHONE.at(G,d,3+20/60,[Q('沒事。你睡。')],'r3_zq_3am_b'); F.ZQ_3AM_BUILD='morning';
        PHONE.at(G,d,4.75,[Q('修好了'),Object.assign(Q('你起來先測'),{ask:{id:'r3_zq_3am',until:T(d+1,18),opts:[{t:'早。我現在測。',say:[{from:'heroine_04',text:'……你醒了。'},{from:'heroine_04',text:'第二關，貓有沒有卡在牆裡？',ask:{id:'r3_zq_3am_cat',until:T(d+1,18),opts:[{t:'有。',say:[{from:'heroine_04',text:'……我就知道。我再修。'}]},{t:'沒有。',say:[{from:'heroine_04',text:'好。那我去睡了。'}]}]}}]}]}})],'r3_zq_3am_c'); } }
    /* 回完以後的「（三分鐘後）」「（五分鐘後）」*/
    if((F.ZQ_3AM_BUILD==='tested'||F.ZQ_3AM_BUILD==='sleep')&&F.ZQ_3AM_SEEN==='awake'&&!PHONE.sent(G,'r3_zq_3am_after')){ if(F.ZQ_3AM_T==null) F.ZQ_3AM_T=t; const tt=F.ZQ_3AM_T+(F.ZQ_3AM_BUILD==='tested'?3:5)/60, dd=Math.floor(tt/24);
      PHONE.at(G,dd,tt-dd*24,F.ZQ_3AM_BUILD==='tested'?[Q('修好了。'),Q('你睡吧。我也……再三分鐘。')]:[Q('好啦。晚安。')],'r3_zq_3am_after'); } };
  S.zqCallDue=G=>!!G&&!!G.flags&&G.flags.ZQ_3AM_BUILD==='call'&&!done(G,'ev_ziqing_3am_call');

  /* ===================== 3-16 沛珊 2029 年的營隊（BB_99 6b-3；AA_282 第 1、2 節）：7/23～7/27 在山上（characters.js 的 absentDates）===================== */
  S.psCamp=function(G){ const F=G.flags, d22=D('2029-07-22'); if(d22==null||!dating(G,'classmate_peishan')) return; const t=now(G); if(t<T(d22,21)||t>=T(d22+8,0)) return; const P=M('classmate_peishan');
    if(!PHONE.sent(G,'r3_ps_camp1')) PHONE.at(G,d22,21,[P('明天上山帶營隊。五天。'),Object.assign(P('山上訊號很差，找得到訊號我就傳。'),{ask:{id:'r3_ps_camp1',until:T(d22+1,18),opts:[{t:'好。',say:[{from:'classmate_peishan',text:'你也要好好念書喔。'}]},{t:'上山小心。',say:[{from:'classmate_peishan',text:'嗯！'}]}]}})],'r3_ps_camp1');
    if(t>=T(d22+2,22.5)&&!PHONE.sent(G,'r3_ps_camp2')){ PHONE.at(G,d22+2,22.5,[P('有一個小孩在名牌上寫「法官」。'),P('我問他那是你的名字嗎。他說不是，是我以後的名字。')],'r3_ps_camp2'); F.PS_CAMP_2029_MSG=true; }
    if(t>=T(d22+5,20)&&!PHONE.sent(G,'r3_ps_camp3')) PHONE.at(G,d22+5,20,[P('下山了。'),P('小孩寫了信給國中畢業的自己。我收走了，說那一年再寄。')],'r3_ps_camp3'); };
  /* 沒交往、放榜後重新聯絡上的（PS_BACK_FIRST）：7/23～7/27 20:00 傳訊息給她＝自動回（包住 MSG.send）*/
  S.psCampAuto=G=>{ if(!G||!G.flags||!law(G)||!G.flags.PS_BACK_FIRST||dating(G,'classmate_peishan')) return false; const a=D('2029-07-23'), b=D('2029-07-27'); return a!=null&&now(G)>=T(a,0)&&now(G)<T(b,20); };
  S.psCampSend=function(G,id,topic,sub){ if(typeof MSG==='undefined'||!MSG.canSend(G,id)||!MSG.topics(G,id).some(q=>q.k===topic)) return null;
    const text=MSG.playerText(G,id,topic,sub), th='p:'+id; PHONE.post(G,{th,from:'player',who:null,text}); MSG.rec(G).sent[id]=G.day;
    const at={day:G.day,h:G.hour+0.01}; PHONE.at(G,at.day,at.h,[{th,from:id,text:'在山上帶營隊，訊號很差。下山再回你。'}],null); return {ok:true,text,at,auto:true}; };

  /* ===================== 3-11 學姊：大四選擇那一週的讀書計畫和便條（BB_99 2-4、10-1 第 4 項；當面、出遊的場面在 r3_events.js）=====================
     A 2028-10-21（六）20:30 家族群組（台灣、日本路線）；B 10/18（三）美國路線、交往中：當地 19:00 私訊、20:00 會所（出遊）；
     C 她回來以後（FRIEND 以上、她知道你的計畫）：要考 2/3 筆試的 1/8 21:00 → 1/9 19:00 研究室，其他 2/20 21:00 → 2/21 19:00；B 演過的不再演；
     D 要考 2/3 筆試的（FRIEND 以上）：交往中或雙方都單身＝2/3 08:30 考場門口當面（S.noteDue；在家的時候借 STORY.y4HomeDue），其他＝2/2 21:00 照片 */
  const SIS='heroine_05', W=M(SIS);
  const GK=t=>({th:'g:family_law',from:'kevin',name:'Kevin',text:t}), GW=t=>({th:'g:family_law',from:SIS,name:'溫學姊',text:t}), GJ=t=>({th:'g:family_law',from:'family_junior',name:'佳穎',text:t});   /* AA_497 5-2、第 8 節第 5 點：家族的學妹統一叫佳穎 */
  const route=G=>typeof STORY!=='undefined'&&STORY.route?STORY.route(G):null;
  const partners=G=>typeof ROM!=='undefined'&&ROM.partners?ROM.partners(G):LOVE.filter(x=>dating(G,x));
  /* 要考 2/3 筆試：台灣路線（未決定也算）、Y4_PATH 'grad'、推甄沒上（AA_327 的 Y4_PUSH／GRAD_ADMIT 還沒有＝當作沒上，同 events.js 跨年大四的單字卡）*/
  S.gradExam=G=>{ const F=(G&&G.flags)||{}, r=route(G); return r!=='JP'&&r!=='US'&&F.Y4_PATH==='grad'&&F.Y4_PUSH!=='pass'&&F.GRAD_ADMIT!=='push'; };
  S.sisKnowsPlan=G=>!!G.flags.SIS_PLAN_POSTED||G.flags.SIS_PLAN_SEEN==='us'||dating(G,SIS);   /* 她知道你的計畫：A 貼過、B 演過、或交往中 */
  S.noteDoor=G=>dating(G,SIS)||partners(G).length===0;   /* 交往中，或雙方都單身＝當面 */
  S.sisPlan=function(G){ const F=G.flags, t=now(G);
    { const d=D('2028-10-21'), r=route(G); if(d!=null&&t>=T(d,20.5)&&t<T(d+3,0)&&r!=='US'&&PHONE.inGroup(G,'family_law')){   /* A */
        if(!PHONE.sent(G,'r3_sis_plan_a')) PHONE.at(G,d,20.5,[GK('大四的各位 讀書計畫貼上來'),Object.assign(GK('學姊說她可以幫忙看'),{ask:{id:'r3_sis_plan_a',until:T(d+1,18),opts:[{t:'（貼上自己的讀書計畫）',post:'📷（讀書計畫表，一週七欄。週日那一欄只寫了「休息」。）',set:{SIS_PLAN_POSTED:true}},{t:'（不貼）',post:false}]}})],'r3_sis_plan_a');   /* 群組裡是照片（AA_343 C5）；選項的字不進群組 */
        if(F.SIS_PLAN_POSTED&&!PHONE.sent(G,'r3_sis_plan_a2')){ if(F.SIS_PLAN_POSTED_T==null) F.SIS_PLAN_POSTED_T=t; const tt=Math.max(T(d,20+40/60),F.SIS_PLAN_POSTED_T+5/60), dd=Math.floor(tt/24);   /* 20:40（比 20:40 晚才貼的：貼完五分鐘後）*/
          PHONE.at(G,dd,tt-dd*24,[GW((G.name||'祐廷')+'的讀書計畫我看了。有休息日，有吃飯，有睡覺。'),GJ('學姊，妳以前不是這樣說的。'),GW('以前是以前。')],'r3_sis_plan_a2'); } } }
    { const d=D('2028-10-18'); if(d!=null&&route(G)==='US'&&dating(G,SIS)&&F.SIS_PLAN_SEEN==null&&t>=T(d,19)&&t<T(d+1,0)&&typeof OUT!=='undefined'&&!OUT.get(G,'r3_sis_plan_us')){   /* B（美東當地時間）*/
        PHONE.at(G,d,19,[W('你的讀書計畫，帶去會所給我看。八點。')],'r3_sis_plan_b');
        OUT.plan(G,{id:'r3_sis_plan_us',ev:'ev_sis_plan_us',day:d,h:20,late:0.5,place:'會所',title:'會所・自習室',travel:'',travelH:0,back:'回到公寓。'}); } }
    if(F.SIS_PLAN_SEEN!=='us'&&!PHONE.sent(G,'r3_sis_plan_c')&&typeof OUT!=='undefined'){ const d=D(S.gradExam(G)?'2029-01-08':'2029-02-20');   /* C */
      if(d!=null&&t>=T(d,21)&&t<T(d+1,18)&&met(G,SIS,'FRIEND')&&S.sisKnowsPlan(G)&&contact(G,SIS)&&!(typeof STORY!=='undefined'&&STORY.abroad&&STORY.abroad(G))){
        PHONE.at(G,d,21,[W('你的讀書計畫，拿來研究室給我看。明天晚上七點。')],'r3_sis_plan_c');
        OUT.plan(G,{id:'r3_sis_plan_lab',ev:'ev_sis_plan_lab',day:d+1,h:19,late:0.5,place:'霖澤館・研究室',title:'研究室',travel:'走路 約 10 分鐘',travelH:1/6}); } }
    { const d3=D('2029-02-03'); if(d3!=null&&F.SIS_NOTE_GRAD==null&&S.gradExam(G)&&met(G,SIS,'FRIEND')&&!S.noteDoor(G)&&t>=T(d3-1,21)&&t<T(d3+1,0)&&contact(G,SIS)){   /* D 照片（祐廷和別人交往中）*/
        F.SIS_NOTE_GRAD='photo'; const same=PHONE.sent(G,'y4_push_note');   /* AA_378 S3：收過 10/25 推甄前那一張的，這一張只寫「同上。」*/
        PHONE.at(G,d3-1,21,[Object.assign(W(same?'📷（一張手寫的便條：同上。）':'📷（一張手寫的便條：你可以。）'),{ask:{id:'r3_sis_note_photo',until:T(d3,18),opts:[{t:same?'同上。':'只有一句。',say:[{from:SIS,text:same?'對。':'一句就夠了。'}]},{t:'謝謝。',say:[{from:SIS,text:'考完傳訊息。'}]}]}})],'r3_sis_note_photo'); } } };
  /* B、C 沒到（outingMissed）：21:00 一則；C 沒到、在群組貼過計畫的＝她自己看了那一張 */
  S.sisPlanMissed=function(G,kind){ const F=G.flags, q=typeof OUT!=='undefined'?OUT.get(G,kind==='us'?'r3_sis_plan_us':'r3_sis_plan_lab'):null; if(!q) return; F.SIS_PLAN_SEEN='missed';
    PHONE.at(G,q.day,21,[W(kind==='us'?'……下次帶來。':(F.SIS_PLAN_POSTED?'我自己看了你傳在群組的那張。……週六十二個小時，改成八個。':'……下次拿來。'))],'r3_sis_plan_miss_'+kind); };
  /* D 當面：2/3 08:00～08:40（醒著、空下來）→ 08:30 考場門口（接著 08:40 是 AA_327 2-Y4-27 以安在門口那一段：開發分支還沒有）*/
  S.noteDue=function(G){ const F=(G&&G.flags)||{}, d=D('2029-02-03'); return d!=null&&law(G)&&G.day===d&&G.hour>=8&&G.hour<8+40/60&&F.SIS_NOTE_GRAD==null&&S.gradExam(G)&&met(G,SIS,'FRIEND')&&S.noteDoor(G)&&!done(G,'ev_sis_exam_note'); };
  S.noteRun=async function(GM){ const G=GM.G, e=typeof STORY_EVENTS!=='undefined'?STORY_EVENTS.find(x=>x.id==='ev_sis_exam_note'):null; if(!e||typeof EVENTS==='undefined') return false; G.flags.SIS_NOTE_GRAD='door';
    if(GM.fade) await GM.fade(true); if(G.hour<8.5){ G.hour=8.5; if(GM.E) GM.E.hour=G.hour; if(GM.updateHUD) GM.updateHUD(); } if(GM.fade) await GM.fade(false); await EVENTS.run(e); return true; };

  /* ===================== 3-13 方奕廷 F4 兩千歲的紅檜（BB_40 F4；BB_99 5-2、10-1 第 11 項）：1/24 21:00 私訊；答應＝1/27 07:00 從臺北的家開車出發（出遊，鬧鐘）===================== */
  S.chiayi=function(G){ const F=G.flags, d=D('2029-01-24'), d27=D('2029-01-27'); if(d==null||d27==null) return; const t=now(G); if(t<T(d,21)||t>=T(d27+1,6)) return;
    if(!PHONE.sent(G,'r3_fang_f4')&&t<T(d+1,18)&&met(G,'npc_fangyt','FAMILIAR')&&contact(G,'npc_fangyt')){ const mtn=has('npc_fangyt','MOUNTAIN_DAY')||!!F.MOUNTAIN_DAY;   /* 大二暑假 F2 一起爬過山（AA_326 2-Y3-02，開發分支還沒有＝沒有）*/
      PHONE.at(G,d,21,[FY('📷（雲海）'),FY('我在嘉義的山上。'),FY(mtn?'這裡的紅檜比那次爬山看的那棵老。兩千歲。':'這裡有一棵兩千歲的紅檜。'),Object.assign(FY('你要不要上來看。不用會。有點遠，你有車。'),{ask:{id:'r3_fang_f4',until:T(d+1,18),opts:[
        {t:'好。我開車上去。',say:[{from:'npc_fangyt',text:'週六早上七點出發剛好。霧中午會散。'}],set:{FANG_F4_GO:true}},{t:'下次。',say:[{from:'npc_fangyt',text:'好。它也不會走。'}],set:{FANG_F4:'later'}}]}})],'r3_fang_f4'); }
    if(F.FANG_F4_GO===true&&!F.FANG_F4&&typeof OUT!=='undefined'&&!OUT.get(G,'r3_fang_f4')&&t<T(d27,7.5))
      OUT.plan(G,{id:'r3_fang_f4',ev:'ev_fangyt_chiayi',day:d27,h:7,late:0.5,place:'臺北的家',title:'開車去嘉義',travel:'',travelH:0,alarm:true,back:'回到臺北。'}); };   /* 寒假住宿舍的「前一晚回家取車」（AA_140 G04）沒有另外演：出遊的第一段就是臺北的家 */
  /* 答應了、07:30 還沒出發：10:00、15:00 兩則；照「下次。」那一版，不記 CHIAYI_TREE。「路上塞車嗎？」可以回（AA_343 C4，到 15:00）：「睡過頭了。對不起。」→「嗯。」／「今天去不了了。」→「好。」；不回沒有後續；三種都照樣有 15:00 那則 */
  S.chiayiMissed=function(G){ const F=G.flags, d27=D('2029-01-27'); if(F.FANG_F4) return; F.FANG_F4='missed';
    PHONE.at(G,d27,10,[Object.assign(FY('路上塞車嗎？'),{ask:{id:'r3_fang_f4_late',until:T(d27,15),opts:[{t:'睡過頭了。對不起。',say:[{from:'npc_fangyt',text:'嗯。'}]},{t:'今天去不了了。',say:[{from:'npc_fangyt',text:'好。'}]}]}})],'r3_fang_f4_late'); PHONE.at(G,d27,15,[FY('霧散了。它還在。下次。')],'r3_fang_f4_late2'); };

  /* ===================== 3-14 學姊：交往中的大四（BB_99 2-7a～c、10-1 第 6、7 項）：大四下和她交往中 ===================== */
  /* 2-7a 兩張書桌：2/26 21:00 私訊；每週三 21:00 研究室（2/28～5/23，出遊，可以不去）；第一次沒去的那一週 23:10 照片 */
  S.DESK_DAYS=['2029-02-28','2029-03-07','2029-03-14','2029-03-21','2029-03-28','2029-04-04','2029-04-11','2029-04-18','2029-04-25','2029-05-02','2029-05-09','2029-05-16','2029-05-23'];
  S.desks=function(G){ const F=G.flags, d=D('2029-02-26'), t=now(G); if(d==null||!dating(G,SIS)||typeof OUT==='undefined') return;
    if(!PHONE.sent(G,'r3_sis_desk')&&t>=T(d,21)&&t<T(d+2,21)&&contact(G,SIS)) PHONE.at(G,d,21,[W('每週三晚上，研究室。'),Object.assign(W('你寫你的，我寫我的。'),{ask:{id:'r3_sis_desk',until:T(d+1,18),opts:[{t:'好。',say:[{from:SIS,text:'九點。我先到。'}]},{t:'有時候會沒辦法。',say:[{from:SIS,text:'那就有空的時候。'}]}]}})],'r3_sis_desk');
    if(!PHONE.sent(G,'r3_sis_desk')) return;
    for(const k of S.DESK_DAYS){ const dd=D(k); if(dd!=null&&G.day===dd&&t<T(dd,21.75)&&!OUT.get(G,'r3_desk_'+k)) OUT.plan(G,{id:'r3_desk_'+k,ev:'ev_sis_y4_desks',day:dd,h:21,late:0.75,place:'霖澤館・研究室',title:'研究室',travel:'走路 約 10 分鐘',travelH:1/6}); } };
  S.deskMissed=function(G,q){ const F=G.flags; if(F.SIS_DESK_MISSED||!q) return; F.SIS_DESK_MISSED=q.day; PHONE.at(G,q.day,23+10/60,[W('📷（同一張桌子，對面的位子空著）'),W('你今天沒來。我寫到十一點。')],'r3_sis_desk_miss'); };
  /* 2-7b 她爸爸的晚餐：3/14 21:00 私訊（那晚人在研究室＝21:10 當面，r3_events.js）；答應＝3/17 18:30 公館的餐廳（出遊）；18:45 還沒到、19:30 還沒到、婉拒 */
  S.father=function(G){ const F=G.flags, d14=D('2029-03-14'), d17=D('2029-03-17'), t=now(G); if(d14==null||d17==null||!dating(G,SIS)||typeof OUT==='undefined') return;
    if(F.SIS_FATHER_ASKED==null&&t>=T(d14,21)&&t<T(d14+1,6)&&contact(G,SIS)){ F.SIS_FATHER_ASKED='msg';
      PHONE.at(G,d14,21,[W('我爸週六會過來，他要請吃飯。'),Object.assign(W('……你要不要來。六點半，公館。'),{ask:{id:'r3_sis_father',until:T(d14+1,18),opts:[{t:'好。',say:[{from:SIS,text:'好。不用穿太正式。'}],set:{SIS_FATHER_GO:true}},{t:'那天不行。',say:[{from:SIS,text:'好。我跟他說。'}],set:{SIS_FATHER_GO:false}}]}})],'r3_sis_father'); }
    if(F.SIS_FATHER_GO===true&&!OUT.get(G,'r3_sis_father')&&t<T(d17,19.5)) OUT.plan(G,{id:'r3_sis_father',ev:'ev_sis_y4_father',day:d17,h:18.5,late:1,place:'公館・餐廳',title:'她爸爸的晚餐',travel:'走過去 約 15 分鐘',travelH:0.25});
    const q=OUT.get(G,'r3_sis_father');
    if(q&&q.state==='planned'&&t>=T(d17,18.75)&&!PHONE.sent(G,'r3_sis_father_late')) PHONE.at(G,d17,18.75,[Object.assign(W('我爸先點菜了。……你在路上嗎？'),{ask:{id:'r3_sis_father_late',until:T(d17,19.5),opts:[{t:'快到了。',say:[{from:SIS,text:'好。'}]},{t:'今天去不了。',say:[{from:SIS,text:'好。'}],set:{SIS_FATHER_GO:'cancel'}}]}})],'r3_sis_father_late');
    if(q&&q.state==='planned'&&F.SIS_FATHER_GO==='cancel') q.state='missed';   /* 「今天去不了。」：不再問出發、沒有 19:30 那一則 */
    if(F.SIS_FATHER_GO===false&&t>=T(d17,21)&&t<T(d17+3,0)&&!PHONE.sent(G,'r3_sis_father_no')) PHONE.at(G,d17,21,[W('我爸說下次。他記住你的名字了。')],'r3_sis_father_no');
    /* 沒回（AA_343 C2）：她爸爸的飯，她再確認一次（只提這一次）——3/16（五）21:00；還是沒回＝3/17 不排出遊、21:00 一則，不記 MET_SIS_FATHER。
       3/14 當面說的那一版（人在研究室，SIS_FATHER_ASKED 'face'）沒有「沒回」*/
    if(F.SIS_FATHER_ASKED==='msg'&&F.SIS_FATHER_GO==null){ const m=PHONE.byAsk(G,'r3_sis_father');
      if(m&&m.ans==null&&t>=T(d17-1,21)&&t<T(d17+3,0)&&!PHONE.sent(G,'r3_sis_father_re'))
        PHONE.at(G,d17-1,21,[Object.assign(W('週六六點半，公館。……不能來也跟我說一聲。'),{ask:{id:'r3_sis_father_re',until:T(d17,18),opts:[{t:'好。',say:[{from:SIS,text:'好。不用穿太正式。'}],set:{SIS_FATHER_GO:true}},{t:'那天不行。',say:[{from:SIS,text:'好。我跟他說。'}],set:{SIS_FATHER_GO:false}}]}})],'r3_sis_father_re');
      const m2=PHONE.byAsk(G,'r3_sis_father_re');
      if(PHONE.sent(G,'r3_sis_father_re')&&(!m2||m2.ans==null)&&t>=T(d17,21)&&t<T(d17+3,0)&&!PHONE.sent(G,'r3_sis_father_none')) PHONE.at(G,d17,21,[W('我們吃完了。我爸說下次。')],'r3_sis_father_none'); } };
  S.fatherMissed=function(G,q){ if(G.flags.SIS_FATHER_GO==='cancel'||!q) return; PHONE.at(G,q.day,19.5,[W('我們吃完了。我爸說下次。')],'r3_sis_father_miss'); };   /* 19:30 還沒到：不記 MET_SIS_FATHER */
  /* 2-7c 她自己放的一天假：4/27 21:00 三選一（回覆到 4/28 09:00）→ 4/28 河堤 10:00／貓空 13:00（出遊）／「哪裡都不去」＝12:00、21:00 兩則；沒回＝16:00 河邊的照片 */
  const dayOffMark=G=>{ G.flags.SIS_DAY_OFF=true; if(typeof SOCIAL!=='undefined'&&SOCIAL.remember&&!has(SIS,'SIS_DAY_OFF')) SOCIAL.remember(SIS,'SIS_DAY_OFF',''); };
  S.dayOff=function(G){ const F=G.flags, d27=D('2029-04-27'); if(d27==null||!dating(G,SIS)||typeof OUT==='undefined') return; const d28=d27+1, t=now(G); if(t<T(d27,21)||t>=T(d28+1,6)) return;
    if(!PHONE.sent(G,'r3_sis_dayoff')&&t<T(d28,9)&&contact(G,SIS)) PHONE.at(G,d27,21,[W('明天我不寫論文。'),Object.assign(W('……你排。去哪裡都可以。'),{ask:{id:'r3_sis_dayoff',until:T(d28,9),opts:[
        {t:'河堤，騎腳踏車。',say:[{from:SIS,text:'好。……我騎很慢。不要等我。'},ME('要等。')],set:{SIS_DAY_OFF_PLAN:'river'}},
        {t:'貓空，喝茶。',say:[{from:SIS,text:'好。纜車上不談論文。'}],set:{SIS_DAY_OFF_PLAN:'tea'}},
        {t:'哪裡都不去。妳睡到中午。',say:[{from:SIS,text:'……這是最難的選項。'}],set:{SIS_DAY_OFF_PLAN:'sleep'}}]}})],'r3_sis_dayoff');
    const P=F.SIS_DAY_OFF_PLAN;
    if(P==='river'&&!OUT.get(G,'r3_sis_dayoff')) OUT.plan(G,{id:'r3_sis_dayoff',ev:'ev_sis_y4_dayoff_river',day:d28,h:10,late:0.5,place:'公館河濱',title:'河堤',travel:'騎腳踏車 約 10 分鐘',travelH:1/6});
    if(P==='tea'&&!OUT.get(G,'r3_sis_dayoff')) OUT.plan(G,{id:'r3_sis_dayoff',ev:'ev_sis_y4_dayoff_tea',day:d28,h:13,late:0.5,place:'貓空纜車站',title:'貓空',travel:'捷運＋纜車 約 1 小時',travelH:1});
    if(P==='sleep'&&!PHONE.sent(G,'r3_sis_dayoff_sleep')){ dayOffMark(G); PHONE.at(G,d28,12,[W('我睡到十一點五十。差一點。')],'r3_sis_dayoff_sleep'); PHONE.at(G,d28,21,[W('📷（計畫本，4/28 那一格畫了一條線，什麼都沒寫）'),W('今天就這樣。')],'r3_sis_dayoff_sleep2'); }
    if(P==null&&PHONE.sent(G,'r3_sis_dayoff')&&t>=T(d28,9)){ const m=PHONE.byAsk(G,'r3_sis_dayoff'); if(!m||m.ans==null){ F.SIS_DAY_OFF_PLAN='none'; dayOffMark(G); PHONE.at(G,d28,16,[W('📷（河邊）'),W('今天沒寫。')],'r3_sis_dayoff_none'); } } };
  /* 答應了、過了 30 分鐘沒到：河堤「我先騎。慢慢騎。」／貓空「我先上去了。……」，之後照「沒回」那一版 16:00 的照片——河堤＝「📷（河邊）」；貓空＝「📷（纜車窗外的茶園）」（AA_343 C3）*/
  S.dayOffMissed=function(G,k){ const d28=D('2029-04-28'); if(d28==null) return; dayOffMark(G);
    PHONE.at(G,d28,k==='river'?10.5:13.5,[W(k==='river'?'我先騎。慢慢騎。':'我先上去了。纜車上不談論文。……我一個人也不談。')],'r3_sis_dayoff_late'); PHONE.at(G,d28,16,[W(k==='river'?'📷（河邊）':'📷（纜車窗外的茶園）'),W('今天沒寫。')],'r3_sis_dayoff_none'); };

  /* ===================== 3-12 何俊朗 1～5（美國路線；AA_80 5-3、AA_185 1-1、1-6；AA_291 第 2 節）：美東當地時間；美國行事曆上的固定事件（出遊，可以錯過）=====================
     1 8/14 10:00 迎新、2a 9/8 12:00 Legal Writing 下課、2b 9/15 18:30 新開的餐廳（2a 去了才有）、3 10/4 20:00 會所、5 10/24 21:00 私訊 → 10/25（或 11/1）19:00 中餐館；
     3、5 要先見過他（MET_LONG）。4＝3 的當晚回到公寓（3D）的筆記；10/6 20:00 人在社區＝聚餐的旁白，不在＝隔天早上補一句。出遊都在三天前排進行事曆。 */
  S.longMet=G=>has('npc_long','MET_LONG')||!!(G&&G.flags&&G.flags.MET_LONG);   /* 兩邊互相認（AA_370 M3）*/
  /* AA_370 M3：美國路線只跑 us_life3d.js 的 USL 版何俊朗 1～5（AA_340 第 2 節裁定 1 已經取代這一版、拿掉「B 棟的。又見面了。」）——這一版停用：不再排、不再傳；
     舊存檔（v9.10.3 兩版都排了）排了還沒去的取消。記憶 MET_LONG 等和 USL 的旗標互相認（USL.longMerge）；這一版的事件資料（r3_events.js）AA_370 第 6 節第 9 題刪掉，舊存檔演過的紀錄（G.events.done）照舊在 USL.longMerge 認 */
  S.LONG_OUTS=['r3_long_1','r3_long_2a','r3_long_2b','r3_long_3','r3_long_5'];
  S.long=function(G){ if(route(G)!=='US'||typeof OUT==='undefined') return; for(const id of S.LONG_OUTS){ const q=OUT.get(G,id); if(q&&q.state==='planned') q.state='cancelled'; } };
  /* 10/4 回公寓的筆記、10/6 聚餐的旁白：USL 版（ev_usl_long4、ev_usl_party）*/

  /* ===================== 3-19 摘要日的手機小事（BB_97 第 5 節、BB_98 第 6 節、BB_99 9-20；AA_118；BB_70 2-6 F-Q4）=====================
     「池」＝加進 STORY.DAILY_PHONE（每天的手機小事：一天最多一則、輪流、每學期第 4 週起）；「定時」＝固定日子的 PHONE.at（S.DP3_AT）。
     可昕的只給交往中；人在日本、美國照當地時間（臺灣的時刻＋STORY.tzOffset）。每學期最多 2 次的（長頸鹿、欸、二十分鐘）記在 G.flags.R3_DPT。
     子晴的爸爸（當面）：有 DAD_PLAYS（AA_326 2-Y3-08，開發分支還沒有）的玩家，大三上起和她一起走路的下一次（包住 INV.walkPick）；日本路線還沒聽過的＝3/29 訊息版 */
  const P1=(id,t,dt)=>({th:'p:'+id,from:id,text:t,dt:dt||0}), SQ=(id,L)=>L.map((t,k)=>P1(id,t,k/60));
  const kxOn=G=>law(G)&&dating(G,'kexin');
  const lt=h=>G=>h+tz(G,G.day);   /* 臺灣的時刻 → 當地 */
  const TERMS=['Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'];
  const inT=(Tm,a,b,w0)=>!!Tm&&TERMS.includes(Tm.id)&&TERMS.indexOf(Tm.id)>=TERMS.indexOf(a)&&TERMS.indexOf(Tm.id)<=TERMS.indexOf(b)&&(w0==null||Tm.id!==a||Tm.week>=w0);
  const termOf=G=>typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(G.day):null;
  const termN=(G,id)=>{ const Tm=termOf(G), R=((G.flags.R3_DPT||{})[id])||{}; return Tm?(R[Tm.id]|0):0; };
  const termInc=(G,id)=>{ const Tm=termOf(G); if(!Tm) return; const A=G.flags.R3_DPT||(G.flags.R3_DPT={}), R=A[id]||(A[id]={}); R[Tm.id]=(R[Tm.id]|0)+1; };
  const dpGot=(G,id)=>((G.flags.dpN||{})[id]|0)>0;   /* 收過那一則（每天的手機小事的 dpN）*/
  const metZhan=G=>!!G.flags.KX_NCCU_FRIENDS||((G.flags.KX_BDAY||{})[2]==='class');   /* 見過詹靖＝政大的電影夜或系上小教室的生日（AA_343 C7）：兩場都記 KX_NCCU_FRIENDS（y2r2_3d.js）；KX_BDAY[2] 'class'＝這一版以前的舊存檔 */
  const metShao=G=>has('kexin','ENC_D13_KX')||has('kexin','ENC_D09_KX')||metZhan(G)||done(G,'ev_kexin_k22');   /* 見過邵鈞（AA_343 C7）＝電影夜、小教室生日、貓空 D09、淡水 D13 任一；聽過＝K22 演過（AA_328 3-19 原文）*/
  const until=G=>T(G.day+1,18);
  const giraffe={t:'（回一隻長頸鹿）',post:'（長頸鹿貼圖）'};
  const KX=(id,term,h,txt,o)=>Object.assign({id,term,h:lt(h),ok:G=>kxOn(G),items:G=>[].concat(typeof txt==='function'?txt(G):txt).map((t,k)=>P1('kexin',t,k/60))},o||{});
  S.DP3=[
    KX('y2_kx_k10c',Tm=>inT(Tm,'Y2S1','Y2S1'),21+10/60,'物權考壞的那一章，我講給予樂聽，講到她懂。',{ok:(G,day)=>kxOn(G)&&done(G,'ev_kexin_bad_exam')&&G.events.last&&G.events.last.ev_kexin_bad_exam!=null&&(day==null?G.day:day)-G.events.last.ev_kexin_bad_exam>=14}),   /* K10c 演過 14 天以後 */
    KX('y2_kx_giraffe1',Tm=>inT(Tm,'Y2S1','Y4S2',9),23+10/60,null,{items:G=>[P1('kexin','（長頸鹿貼圖）'),P1('kexin','以後我傳這隻，就是累了、不想打字',1/60),Object.assign(P1('kexin','你回一隻一樣的就好',2/60),{ask:{id:'dp_y2_kx_giraffe1',until:until(G),opts:[giraffe]}})]}),
    KX('y2_kx_giraffe',Tm=>inT(Tm,'Y2S1','Y4S2',11),23+10/60,null,{max:()=>12,gap:21,ok:G=>kxOn(G)&&dpGot(G,'y2_kx_giraffe1')&&termN(G,'y2_kx_giraffe')<2,items:(G,n)=>{ termInc(G,'y2_kx_giraffe'); return [Object.assign(P1('kexin','（長頸鹿貼圖）'),{ask:{id:'dp_y2_kx_giraffe_'+n,until:until(G),opts:[giraffe]}})]; }}),
    KX('y3_kx_lunch',Tm=>inT(Tm,'Y3S1','Y3S1'),21+10/60,['📷（政大山下那家的碗）','午餐。']),
    KX('y3_kx_mid',Tm=>inT(Tm,'Y3S1','Y3S1',10),21+10/60,null,{items:G=>[Object.assign(P1('kexin','民訴期中，你們那邊考哪一題？'),{ask:{id:'dp_y3_kx_mid',until:until(G),opts:[{t:'最後一題沒寫完。',say:[{from:'kexin',text:'我也是。……我們老師一定是約好的。'}]},{t:'不想講。',say:[{from:'kexin',text:'好。不講。'},{from:'kexin',text:'……我也不想講。'}]}]}})]}),
    KX('y3_kx_zhan',Tm=>inT(Tm,'Y3S1','Y3S1'),21+10/60,G=>metZhan(G)?'詹靖拍了山下那家的老闆一整天，老闆只說了一句：好。':'我那個拍片的朋友詹靖，拍了山下那家的老闆一整天。老闆只說了一句：好。'),
    KX('y3_kx_eh1',Tm=>inT(Tm,'Y3S1','Y4S2',4),22+40/60,null,{items:G=>[P1('kexin','欸。'),Object.assign(P1('kexin','……以後我只打一個『欸』，就是想找你講話。',1/60),{ask:{id:'dp_y3_kx_eh1',until:until(G),opts:[{t:'在。',say:[{from:'kexin',text:'好。……沒事了。'}]}]}})]}),
    KX('y3_kx_eh',Tm=>inT(Tm,'Y3S1','Y4S2'),22+40/60,null,{max:()=>8,gap:21,ok:G=>kxOn(G)&&dpGot(G,'y3_kx_eh1')&&termN(G,'y3_kx_eh')<2,items:(G,n)=>{ termInc(G,'y3_kx_eh'); return [Object.assign(P1('kexin','欸'),{ask:{id:'dp_y3_kx_eh_'+n,until:until(G),opts:[{t:'在。',say:[NAR('（她打來，講了十分鐘今天的事。掛之前說：「好，我要讀書了。」）')]}]}})]; }}),
    KX('y3s2_kx_cat',Tm=>inT(Tm,'Y3S2','Y3S2'),21+10/60,'山上的貓認得我了。'),
    KX('y3s2_kx_juniors',Tm=>inT(Tm,'Y3S2','Y3S2'),21+10/60,'讀書會的學弟妹全部考過。我比他們還緊張。'),
    KX('y3s2_kx_film',Tm=>inT(Tm,'Y3S2','Y3S2'),21+10/60,G=>metZhan(G)?'詹靖的短片在小影展放了。我坐第一排。':'我那個拍片的朋友詹靖，短片在小影展放了。我坐第一排。'),
    KX('y4_kx_index2',Tm=>inT(Tm,'Y4S1','Y4S1'),21+10/60,G=>metShao(G)?'邵鈞的考古題目錄，現在有第二冊。':'我們系那個考古題有目錄的人，現在出第二冊了。'),
    KX('y4_kx_mutter',Tm=>inT(Tm,'Y4S1','Y4S1'),21+10/60,'予樂說我讀書的時候會自言自語。她錄下來了。我不承認。'),
    KX('y4_kx_mock',Tm=>inT(Tm,'Y4S1','Y4S1'),21+10/60,'今天模擬考，第三題我寫了兩頁。寫完才發現題目只問一句。'),
    KX('y4_kx_twenty1',Tm=>inT(Tm,'Y4S1','Y4S2',4),22+10/60,null,{items:G=>[P1('kexin','二十分鐘。'),Object.assign(P1('kexin','這段讀完就打給你。',1/60),{ask:{id:'dp_y4_kx_twenty1',until:until(G),opts:[{t:'好。',say:[NAR('（二十分鐘後，她真的打來了。）')]}]}})]}),
    KX('y4_kx_twenty',Tm=>inT(Tm,'Y4S1','Y4S2'),22+10/60,null,{max:()=>4,gap:21,ok:G=>kxOn(G)&&dpGot(G,'y4_kx_twenty1')&&termN(G,'y4_kx_twenty')<2,items:(G,n)=>{ termInc(G,'y4_kx_twenty'); return [Object.assign(P1('kexin','二十分鐘'),{ask:{id:'dp_y4_kx_twenty_'+n,until:until(G),opts:[{t:'好。',say:[NAR('（二十分鐘後，她打來了。）')]}]}})]; }}),
    KX('y4s2_kx_rest',Tm=>inT(Tm,'Y4S2','Y4S2'),21+10/60,'讀書計畫表上，今天那一格寫著『休息』。我休息到下午三點，又開始讀了。'),
    KX('y4s2_kx_soon',Tm=>inT(Tm,'Y4S2','Y4S2'),21+10/60,'山下那家的老闆問我們是不是要畢業了。我說還沒。他說：快了。') ];
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.DAILY_PHONE)&&!STORY._r3dp){ for(const d of S.DP3) if(!STORY.DAILY_PHONE.some(x=>x.id===d.id)) STORY.DAILY_PHONE.push(d); STORY._r3dp=true; }
  /* 定時：[id, 日子, 臺灣的時刻（null＝寫在 local 的當地時刻）, 條件, 訊息]；隔一分鐘的照 dt 分開排 */
  const fangOk=G=>met(G,'npc_fangyt','FAMILIAR')&&contact(G,'npc_fangyt');
  const KW=()=>[GK('這週辛苦了各位'),Object.assign(GK('@學姊 妳也是'),{dt:1/60}),Object.assign(GW('辛苦了。'),{dt:3/60})];
  const KW2=()=>[GK('期末倒數三週 各位撐住'),Object.assign(GK('@學姊 妳也是'),{dt:1/60}),Object.assign(GW('我的期末是論文。'),{dt:3/60})];   /* 12/3（第 13 週）換一組（AA_462 第 5 節：原本和 10/15 一字不差；學姊碩二，期末是論文）；10/15 照舊 KW */
  S.zqDogTold=G=>has('heroine_04','ZQ_DOG_TOLD')||!!(G.flags&&G.flags.ZQ_DOG_TOLD);
  S.DP3_AT=[
    ['y2s_fang_moss','2027-07-19',19.5,fangOk,()=>SQ('npc_fangyt',['📷（山上的一片苔蘚，上面有露水）','沒訊號。下山才傳。'])],
    ['y3_yu_moon','2027-09-15',22.5,G=>PHONE.inGroup(G,'noodle_team')&&knows('heroine_02',G),()=>[{th:'g:noodle_team',from:'yu',text:'芷若說英國的月亮比較小'},{th:'g:noodle_team',from:'yu',text:'我不信',dt:1/60}]],
    ['y3_kx_civpro','2027-09-08',21+10/60,kxOn,()=>[P1('kexin','民訴開課了。第一堂就抄了十一頁。')]],
    ['y3_kevin_week_1015','2027-10-15',17+5/60,G=>PHONE.inGroup(G,'family_law'),KW],
    ['y3_fang_sample','2027-11-01',7.5,fangOk,()=>SQ('npc_fangyt',['📷（雲海）','畢業專題的樣區在這裡。這禮拜收不到訊號。'])],
    ['y3_kevin_week_1203','2027-12-03',17+5/60,G=>PHONE.inGroup(G,'family_law'),KW2],
    ['y3_ps_kid','2027-12-10',19.5,G=>dating(G,'classmate_peishan'),()=>SQ('classmate_peishan',['📷（一張孩子的作業，最上面寫著：老師我長大要當法官）','我回他：那你要先學會寫字。'])],
    ['y3s2_fang_azalea','2028-03-06',12+20/60,fangOk,()=>SQ('npc_fangyt',['📷（一叢杜鵑）','畢業專題的樣區，花開了。'])],
    ['y3s2_zq_dog_jp','2028-03-29',22+40/60,G=>route(G)==='JP'&&has('heroine_04','DAD_PLAYS')&&!S.zqDogTold(G)&&contact(G,'heroine_04'),G=>{ G.flags.ZQ_DOG_TOLD='msg'; return SQ('heroine_04',['我爸：『第七關那隻狗是誰設計的，很討厭』','是我','他已讀了']); }],
    ['y3s2_kai_jp','2028-04-02',23,G=>route(G)==='JP'&&has('kai','SUNDAY_SUPPER'),G=>{ const L=SQ('kai',['宵夜？','喔你在日本','拉麵比較好吃對不對','不要回答']); L[3].ask={id:'r3_y3s2_kai_jp',until:until(G),opts:[{t:'（傳一碗拉麵的照片）',post:'📷（一碗拉麵）',say:[{from:'kai',text:'我就說不要回答'}]}]}; return L; }],
    ['y3s2_mx_save','2028-05-18',21+40/60,G=>has('classmate_mingxuan','SAW_HIM_TRY')&&contact(G,'classmate_mingxuan'),()=>[P1('classmate_mingxuan','家教又多接了一個。……德國那筆。')].concat(has('classmate_mingxuan','SAW_HIM_STUDY')?[P1('classmate_mingxuan','你什麼都沒看到。',1/60)]:[])],
    ['y4_kai_us','2028-09-10',23,G=>route(G)==='US'&&has('kai','SUNDAY_SUPPER'),()=>SQ('kai',['宵夜？','喔你在美國','那我自己吃','拍給你看','📷（滷味，籃子夾得很滿）'])] ];
  /* y4_sis_egg（9/16 美東 10:00「今天的雞蛋，日期是對的。」）拿掉（AA_370 M2）：和 us_life3d.js 的 usl_sis_0916（AA_340 第 1 節第 7 週，交往中 12:10）重複，留 USL 那則 */
  S.DP3_LOCAL={};   /* 寫當地時刻的（hTW＝null）：現在沒有 */
  S.dp3At=function(G){ if(!law(G)) return; const t=now(G);
    for(const [id,k,hTW,ok,items] of S.DP3_AT){ const d=D(k); if(d==null||t>=T(d+3,0)||PHONE.sent(G,'r3_'+id+'_0')) continue; const h=hTW==null?S.DP3_LOCAL[id]:hTW+tz(G,d); if(t<T(d,h)||!ok(G)) continue;
      items(G).forEach((it,j)=>{ const x=Object.assign({},it), dt=x.dt||0; delete x.dt; PHONE.at(G,d,h+dt,[x],'r3_'+id+'_'+j); }); } };
  /* 子晴的爸爸（當面）：大三上起和她一起走路的下一次（日本路線出發以前），排在那一次的第一段（同一個梗只出現一次）*/
  S.zqDogDue=G=>{ if(!G||!G.flags||!law(G)||!has('heroine_04','DAD_PLAYS')||S.zqDogTold(G)) return false; const Tm=termOf(G); if(!Tm||TERMS.indexOf(Tm.id)<TERMS.indexOf('Y3S1')) return false;
    if(route(G)==='JP'){ const dep=D('2028-03-25'); if(dep!=null&&G.day>=dep) return false; } return true; };
  if(typeof INV!=='undefined'&&INV.walkPick&&!INV._r3dog){ const owp=INV.walkPick; INV.walkPick=function(G,id){ if(id==='heroine_04'&&S.zqDogDue(G)) return {lines:['（她把手機舉起來，唸給你聽。）','『第七關那隻狗是誰設計的，很討厭。』','……是我。我很得意。'],next(){ G.flags.ZQ_DOG_TOLD=true; if(typeof SOCIAL!=='undefined'&&SOCIAL.remember) SOCIAL.remember('heroine_04','ZQ_DOG_TOLD',''); }}; return owp.apply(this,arguments); }; INV._r3dog=true; }

  /* ===================== 鬧鐘（STORY.ALARMS）與早於 06:30 的叫醒（包住 STORY.bedOptions）===================== */
  /* 床的「睡到明天早上」最早 06:30（story3d.js 的 bedOptions）；3/13 06:00 的約要 05:30 叫醒（AA_328 3-04 第 6 節）：early 的鬧鐘照它自己的時間 */
  S.alarms=function(G,day){ const F=G.flags||{}, out=[]; if(!law(G)) return out;
    if(day===D('2027-03-13')&&F.FANG_6AM_GO===true&&!F.FANG_6AM) out.push({h:5.5,why:S.FANG_WHY,early:true});
    return out; };
  S.earlyWake=function(G,O){ if(!Array.isArray(O)) return O; const a=S.alarms(G,G.day+1).filter(x=>x.early)[0]; if(!a) return O;
    for(const o of O){ if(!o||o.kind!=='sleep'||o.alarm!==a.why||!(o.wake>a.h)) continue; const w0=hm(o.wake), w1=hm(a.h); o.wake=a.h; o.t=String(o.t||'').replace('（'+w0+'）','（'+w1+'）'); o.hint=String(o.hint||'').replace('鬧鐘 '+w0,'鬧鐘 '+w1); }
    return O; };

  /* ===================== 人物面板的記憶名稱（介面字，AA 可改）===================== */
  /* 搬到 social3d.js 的 MEMORY_LABEL（ZR_FEE_LETTER、KAI_BOT…、何俊朗四項；人物面板的測試只讀那裡）*/

  /* ===================== 掛勾 ===================== */
  S.phone=function(G,GM){ if(!G||!G.flags||!law(G)||typeof PHONE==='undefined') return;
    for(const f of [S.zrFee,S.kaiF2,S.fang6am,S.latteMissed,S.kaiHalloween,S.summerFlag,S.pinyuActuary,S.kaiK5,S.zq3am,S.psCamp,S.sisPlan,S.chiayi,S.desks,S.father,S.dayOff,S.dp3At,S.long]){ try{ f(G,GM); }catch(e){ console.warn('R3 phone',e); } } };
  let lastZone=null;
  S.tick=function(GM,dt){ const G=GM&&GM.G; if(!G||!G.flags||!law(G)) return false; const entered=G.zone!==lastZone; lastZone=G.zone;   /* 剛走進這一區（讀檔也算）：人放好，不在眼前憑空出現 */
    try{ S.fangPlace(GM); S.sk12Place(GM,entered); }catch(e){ console.warn('R3 place',e); }
    const free=typeof EVENTS!=='undefined'&&!EVENTS.running&&!(GM.D&&GM.D.active);
    if(S.zqCallDue(G)&&free){ const ev=STORY_EVENTS.find(e=>e.id==='ev_ziqing_3am_call'); if(ev){ void EVENTS.run(ev); return true; } }   /* 3-15 選了「（直接打電話給她）」：手機關掉以後演電話 */
    if(S.noteDue(G)&&free&&!(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G))){ void S.noteRun(GM); return true; }   /* 3-11 D：2/3 08:30 考場門口（在家的時候是 home3d.js 的選單問 STORY.y4HomeDue）*/
    return false; };
  /* 在家（寒假）：home3d.js 的 loop 問 STORY.y4HomeDue；'stay'＝在家的選單裡演（3-11 D 的便條）。接在 y34b3d.js 那一層外面 */
  S.homeDue=G=>S.noteDue(G)?'stay':null;
  if(typeof STORY!=='undefined'&&!STORY._r3home){ const hd0=STORY.y4HomeDue, hs0=STORY.y4HomeScene; STORY._r3home=true;
    STORY.y4HomeDue=function(G){ const r=hd0?hd0.apply(this,arguments):null; return r||S.homeDue(G); };
    STORY.y4HomeScene=function(GM){ if(S.homeDue(GM.G)==='stay'&&!(hd0&&hd0(GM.G))) return S.noteRun(GM); return hs0?hs0.apply(this,arguments):null; }; }
  /* 在家睡覺的叫醒時間（home3d.js 的 S.wakeFor 只看課、約）：這個檔的早班出遊（3-13 1/27 07:00 開車去嘉義）提早叫醒＝出發前 30 分鐘 */
  S.homeWake=function(G,day){ if(typeof OUT==='undefined'||!OUT.rec) return null; let w=null; for(const q of OUT.rec(G)) if(q.alarm&&q.state==='planned'&&q.day===day&&/^r3_/.test(q.id)){ const h=Math.max(5,q.h-(q.travelH||0)-0.5); w=w==null?h:Math.min(w,h); } return w; };
  if(typeof HOME!=='undefined'&&HOME.wakeFor&&!HOME._r3wake){ const ow=HOME.wakeFor; HOME.wakeFor=function(G,day){ const w0=ow.apply(this,arguments); let w1=null; try{ w1=S.homeWake(G,day); }catch(e){ console.warn('R3 homeWake',e); } return w1==null?w0:(w0==null?w1:Math.min(w0,w1)); }; HOME._r3wake=true; }
  if(typeof STORY!=='undefined'){
    if(Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push((G,GM)=>S.phone(G,GM));
    if(Array.isArray(STORY.TICKS)) STORY.TICKS.push((GM,dt)=>S.tick(GM,dt));
    if(Array.isArray(STORY.ALARMS)) STORY.ALARMS.push((G,day)=>S.alarms(G,day).map(a=>({h:a.h,why:a.why})));
    if(STORY.bedOptions&&!STORY._r3bed){ const ob=STORY.bedOptions; STORY.bedOptions=function(G){ const O=ob.apply(this,arguments); try{ S.earlyWake(G,O); }catch(e){ console.warn('R3 bed',e); } return O; }; STORY._r3bed=true; }
    if(STORY.neededAnswered&&!STORY._r3need){ const on=STORY.neededAnswered; STORY.neededAnswered=function(G,m,o){ if(o&&o.need==='kai_bot'&&G&&G.flags) G.flags.KAI_BOT_REPLIED=true; return on.apply(this,arguments); }; STORY._r3need=true; } }
  /* 3-06 摘要日的旁白（HOME.breakArrive）、第三個房間的拆箱多兩列（STORY.roomY3Items）*/
  if(typeof HOME!=='undefined'&&HOME.breakArrive&&!HOME._r3sum){ const ob=HOME.breakArrive; HOME.breakArrive=async function(GM){ const r=await ob.apply(this,arguments); try{ await S.summerArrive(GM); }catch(e){ console.warn('R3 summerArrive',e); } return r; }; HOME._r3sum=true; }
  if(typeof STORY!=='undefined'&&STORY.roomY3Items&&!STORY._r3room){ const orr=STORY.roomY3Items; STORY.roomY3Items=function(G){ const L=orr.apply(this,arguments); try{ for(const x of S.roomY3Extra(G)) if(Array.isArray(L)&&!L.some(r=>r[0]===x[0])) L.push(x); }catch(e){ console.warn('R3 roomY3',e); } return L; }; STORY._r3room=true; }
  /* 3-16 沛珊在山上帶營隊（沒交往、重新聯絡上的）：傳訊息給她＝自動回（包住 MSG.send，接在 y2b3d.js 那一層外面）*/
  if(typeof MSG!=='undefined'&&MSG.send&&!MSG._r3){ const om=MSG.send; MSG.send=function(G,id,topic,sub){ if(id==='classmate_peishan'&&S.psCampAuto(G)){ const r=S.psCampSend(G,id,topic,sub); if(r) return r; } return om.apply(this,arguments); }; MSG._r3=true; }
  /* 3-15 讀它的：尾聲子晴「和祐廷」那一列（PG.epiLine），'sleep'（「明天再測，妳去睡。」）多一句 */
  if(typeof PG!=='undefined'&&PG.epiLine&&!PG._r3zq){ const oe=PG.epiLine; PG.epiLine=function(G,id){ const L=oe.apply(this,arguments); if(id==='heroine_04'&&Array.isArray(L)&&G&&G.flags&&G.flags.ZQ_3AM_BUILD==='sleep'&&dating(G,'heroine_04')) return L.concat([['heroine_04','我現在三點以前睡。……有人管。']]); return L; }; PG._r3zq=true; }
  /* 3-01 讀它的：芷若 Z10 第一張明信片（AA_321 1B-10，2027-09-24；y2b3d.js 的 pcLines）原本的字後面多一句（回過試譯稿費的 ZR_FEE_LETTER）*/
  if(typeof Y2B!=='undefined'&&Y2B.pcLines&&!Y2B._r3fee){ const op=Y2B.pcLines; Y2B.pcLines=function(G,c){ const L=op.apply(this,arguments); if(c&&c.key==='2027-09-24'&&has('heroine_02','ZR_FEE_LETTER')) L.push('這張的郵票，是那筆稿費買的。'); return L; }; Y2B._r3fee=true; }
  return S;
})();
