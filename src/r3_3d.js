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
  S.ZR_FEE_SHOTS=[R('📷（對話的截圖）'),R('📷（對話的截圖）'),NAR('（你問了四件事：誰找她、要她做什麼、有沒有說好價錢、他們拿去做了什麼。她一題一題回。）')];
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

  /* ===================== 鬧鐘（STORY.ALARMS）與早於 06:30 的叫醒（包住 STORY.bedOptions）===================== */
  /* 床的「睡到明天早上」最早 06:30（story3d.js 的 bedOptions）；3/13 06:00 的約要 05:30 叫醒（AA_328 3-04 第 6 節）：early 的鬧鐘照它自己的時間 */
  S.alarms=function(G,day){ const F=G.flags||{}, out=[]; if(!law(G)) return out;
    if(day===D('2027-03-13')&&F.FANG_6AM_GO===true&&!F.FANG_6AM) out.push({h:5.5,why:S.FANG_WHY,early:true});
    return out; };
  S.earlyWake=function(G,O){ if(!Array.isArray(O)) return O; const a=S.alarms(G,G.day+1).filter(x=>x.early)[0]; if(!a) return O;
    for(const o of O){ if(!o||o.kind!=='sleep'||o.alarm!==a.why||!(o.wake>a.h)) continue; const w0=hm(o.wake), w1=hm(a.h); o.wake=a.h; o.t=String(o.t||'').replace('（'+w0+'）','（'+w1+'）'); o.hint=String(o.hint||'').replace('鬧鐘 '+w0,'鬧鐘 '+w1); }
    return O; };

  /* ===================== 人物面板的記憶名稱（介面字，AA 可改）===================== */
  S.MEMORY_LABEL={ZR_FEE_LETTER:'陪她把試譯稿費的事問清楚',KAI_BOT:'教他的機器人說「先吃飯」',FANG_LAWTREE:'說好下次帶他看法學院的樹',ZR_SWAN:'拉花比賽投了她',
    PINYU_WORRY:'期末考週在社科圖，聽她說精算的事',KAI_STAYED_UP:'他寫的 bug 那晚，陪他醒著'};
  if(typeof SOCIAL!=='undefined'&&SOCIAL.MEMORY_LABEL) for(const k in S.MEMORY_LABEL) if(!(k in SOCIAL.MEMORY_LABEL)) SOCIAL.MEMORY_LABEL[k]=S.MEMORY_LABEL[k];

  /* ===================== 掛勾 ===================== */
  S.phone=function(G,GM){ if(!G||!G.flags||!law(G)||typeof PHONE==='undefined') return;
    for(const f of [S.zrFee,S.kaiF2,S.fang6am,S.latteMissed,S.kaiHalloween,S.summerFlag,S.pinyuActuary,S.kaiK5,S.zq3am,S.psCamp]){ try{ f(G,GM); }catch(e){ console.warn('R3 phone',e); } } };
  let lastZone=null;
  S.tick=function(GM,dt){ const G=GM&&GM.G; if(!G||!G.flags||!law(G)) return false; const entered=G.zone!==lastZone; lastZone=G.zone;   /* 剛走進這一區（讀檔也算）：人放好，不在眼前憑空出現 */
    try{ S.fangPlace(GM); S.sk12Place(GM,entered); }catch(e){ console.warn('R3 place',e); }
    if(S.zqCallDue(G)&&typeof EVENTS!=='undefined'&&!EVENTS.running&&!(GM.D&&GM.D.active)){ const ev=STORY_EVENTS.find(e=>e.id==='ev_ziqing_3am_call'); if(ev){ void EVENTS.run(ev); return true; } }   /* 3-15 選了「（直接打電話給她）」：手機關掉以後演電話 */
    return false; };
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
