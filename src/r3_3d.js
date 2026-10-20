/* ===== 事件包第 3 輪：大二到畢業後篇的小事件（AA_328，AA-C 2026-10-20 定稿 5ae6a133；任務 EVPKG-R3-1020）：手機、時間窗、鬧鐘、人物放到場景裡 =====
   台詞照 AA_328 不改字；事件（3D 場景裡碰到的、出遊的 2D 場面）在 src/data/r3_events.js。掛在 STORY.PHONE_RULES（手機：每一輪）、STORY.TICKS（把人放到場景裡）、
   STORY.ALARMS（鬧鐘），另外包住 STORY.bedOptions（3/13 早上六點的鬧鐘可以早於 06:30）、STORY.neededAnswered（記主線 4 的 kai_bot 回過沒有）。不改 story3d.js。
   3-01 芷若的試譯稿費（2026-11-11、11/25 私訊；時刻照 y2_zr_order：她知道你在交往 15:10，其他 22:07）
   3-02 阿凱 F2（12/6 的週日宵夜在 r3_events.js；沒去＝12/7 00:40 截圖；所有人 12/18 23:40「機器人拿了A」）
   3-04 方奕廷 F3 早上六點（3/12 21:00 約、3/13 06:00 椰林大道、鬧鐘 05:30；沒去＝07:00 葉子；拍照＝3/14 13:00 阿凱；法學院的樹＝3/24 12:20）
   3-05 芷若 F4 拉花比賽（5/7 Café 在 r3_events.js；沒去、和她 FAMILIAR 以上＝22:07 黑板的照片）
   3-07 阿凱 F5 萬聖節（2027-10-27 23:40 三則＋三選一（期限 10/28 18:00）；沒回 18:10；10/30 13:10 照片）
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

  /* ===================== 鬧鐘（STORY.ALARMS）與早於 06:30 的叫醒（包住 STORY.bedOptions）===================== */
  /* 床的「睡到明天早上」最早 06:30（story3d.js 的 bedOptions）；3/13 06:00 的約要 05:30 叫醒（AA_328 3-04 第 6 節）：early 的鬧鐘照它自己的時間 */
  S.alarms=function(G,day){ const F=G.flags||{}, out=[]; if(!law(G)) return out;
    if(day===D('2027-03-13')&&F.FANG_6AM_GO===true&&!F.FANG_6AM) out.push({h:5.5,why:S.FANG_WHY,early:true});
    return out; };
  S.earlyWake=function(G,O){ if(!Array.isArray(O)) return O; const a=S.alarms(G,G.day+1).filter(x=>x.early)[0]; if(!a) return O;
    for(const o of O){ if(!o||o.kind!=='sleep'||o.alarm!==a.why||!(o.wake>a.h)) continue; const w0=hm(o.wake), w1=hm(a.h); o.wake=a.h; o.t=String(o.t||'').replace('（'+w0+'）','（'+w1+'）'); o.hint=String(o.hint||'').replace('鬧鐘 '+w0,'鬧鐘 '+w1); }
    return O; };

  /* ===================== 人物面板的記憶名稱（介面字，AA 可改）===================== */
  S.MEMORY_LABEL={ZR_FEE_LETTER:'陪她把試譯稿費的事問清楚',KAI_BOT:'教他的機器人說「先吃飯」',FANG_LAWTREE:'說好下次帶他看法學院的樹',ZR_SWAN:'拉花比賽投了她'};
  if(typeof SOCIAL!=='undefined'&&SOCIAL.MEMORY_LABEL) for(const k in S.MEMORY_LABEL) if(!(k in SOCIAL.MEMORY_LABEL)) SOCIAL.MEMORY_LABEL[k]=S.MEMORY_LABEL[k];

  /* ===================== 掛勾 ===================== */
  S.phone=function(G,GM){ if(!G||!G.flags||!law(G)||typeof PHONE==='undefined') return;
    for(const f of [S.zrFee,S.kaiF2,S.fang6am,S.latteMissed,S.kaiHalloween]){ try{ f(G,GM); }catch(e){ console.warn('R3 phone',e); } } };
  S.tick=function(GM,dt){ const G=GM&&GM.G; if(!G||!G.flags||!law(G)) return false;
    try{ S.fangPlace(GM); }catch(e){ console.warn('R3 fangPlace',e); }
    return false; };
  if(typeof STORY!=='undefined'){
    if(Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push((G,GM)=>S.phone(G,GM));
    if(Array.isArray(STORY.TICKS)) STORY.TICKS.push((GM,dt)=>S.tick(GM,dt));
    if(Array.isArray(STORY.ALARMS)) STORY.ALARMS.push((G,day)=>S.alarms(G,day).map(a=>({h:a.h,why:a.why})));
    if(STORY.bedOptions&&!STORY._r3bed){ const ob=STORY.bedOptions; STORY.bedOptions=function(G){ const O=ob.apply(this,arguments); try{ S.earlyWake(G,O); }catch(e){ console.warn('R3 bed',e); } return O; }; STORY._r3bed=true; }
    if(STORY.neededAnswered&&!STORY._r3need){ const on=STORY.neededAnswered; STORY.neededAnswered=function(G,m,o){ if(o&&o.need==='kai_bot'&&G&&G.flags) G.flags.KAI_BOT_REPLIED=true; return on.apply(this,arguments); }; STORY._r3need=true; } }
  /* 3-01 讀它的：芷若 Z10 第一張明信片（AA_321 1B-10，2027-09-24；y2b3d.js 的 pcLines）原本的字後面多一句（回過試譯稿費的 ZR_FEE_LETTER）*/
  if(typeof Y2B!=='undefined'&&Y2B.pcLines&&!Y2B._r3fee){ const op=Y2B.pcLines; Y2B.pcLines=function(G,c){ const L=op.apply(this,arguments); if(c&&c.key==='2027-09-24'&&has('heroine_02','ZR_FEE_LETTER')) L.push('這張的郵票，是那筆稿費買的。'); return L; }; Y2B._r3fee=true; }
  return S;
})();
