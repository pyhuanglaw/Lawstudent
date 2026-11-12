/* ===== AA_614 同學也在打工：約了會說「我要上班」＋AA_615 南洋戲院剩下的（企劃線 claude/cool-heisenberg-o8kuqx：AA_614 a0b8a3e40＋接線時補的 73ee9256d、AA_615 ba26f7f7d＝ebea3a2b0 同一份；
   AA 2026-11-03 照 D109 自己定；任務 AA614-CLASSMATE-JOBS-1103、AA615-ALISON-CINEMA-1103；第①級）=====
   使用者 11-03：「有在打工的同學也不是只有我啊 要可以遇到同學約什麼不能來因為在打工」「也要遇到在電影院打工的同學 遇到玩家送爆米花」「不是有電影情節嗎 怎麼沒有電影院阿」。
   原則（AA_614 開頭）：打工是生活的一部分，不是用來卡玩家的關卡；不能來的人一定給一個改約的時間（invites.js 的 resched）；不加數值、不加懲罰。台詞一字照稿（S.L）。
   已經在別的地方的：AA_614 第 1 節的作息（characters.js：阿凱週六 13:00～18:00 程式教室、沛珊每週三 18:00～21:00 課輔班〔AA-B 11-07 改〕、Alison 週五六 18:00～23:00 南洋戲院；
     作息那一筆的 job＝這裡認「今天有上班」）、沛珊 ps2b 拿掉（feed_y1s2.js）、ev_peishan_tutoring 搬到週三晚上（events.js）；AA_615 的戲院場景（src/nanyang3d.js）、買票（src/nanyang_sys3d.js）、
     Alison 在櫃檯送爆米花（src/data/shop_npc.js、src/shopnpc3d.js）。
   這裡做：
   - AA_614 第 2 節：邀約撞到上班（INVITE_DATA.people 的 rule 前面包一層 S.invRule）——明軒週二、週四 19:00～21:30（只有表上沒寫的地點；Café、總圖、燒臘店照 BB_172 M10～M12）→ 當天 21:30；
     沛珊週三 18:00～21:30（課輔班那幾天）→ 隔天同一個時間；阿凱週六 12:30～18:30（程式教室那幾天）→ 當天 19:00；語彤週六、週日 12:30～17:30（她在一盞茶屋有班的那天；
     和她交往中照 AA_627 P-27 那幾句，不換）兩種說法看祐廷那一天有沒有排茶屋的班（JOBS.scheduled）→ 當天 17:30。AA_615 第 4 節 Alison 週五 18:00～23:00 →「禮拜天下午」（下一個週日 14:00）；
     週六晚上稿上沒有句子＝改天、不說話（系統的那一句）。
   - AA_614 第 3 節：五則群組／私訊（S.phone，STORY.PHONE_RULES）；第 3 列「好。」＝當天 19:30 南洋戲院（出遊 ev_aa614_movie；那天 Alison 在櫃檯＝AA_615「三位？……你們三個看同一部喔。」）。
   - AA_614 第 4 節：路上遇到（trigger:'auto' 的兩個事件）——沛珊週三 18:20 溫州街、阿凱週六 17:50 新生南路（各一天一次）。
   - AA_614 第 5 節：閒聊各一句（阿凱：SMALLTALK；沛珊每學期都有閒聊階梯＝STORY.ladderTalk 前面包一層），一次。人物頁「打工：……」那一行：AA-B 接線時補的（73ee9256d）＝S.WHOIS（src/whois3d.js）。
   - AA_615 第 3、4 節：1 廳「坐下看電影」（STORY.onSeat：有今天的票、今天還沒看過＝場燈關掉、時間過去、三句旁白隨機一句；今天拿到爆米花＝多一句）；Alison 人物頁那一行在 src/whois3d.js。
   存檔：G.flags.AA614_MOVIE（第 3 列說「好。」那一天）、AA614_PSDOOR／AA614_PSDOOR_N（沛珊課輔班門口：最近一次那天、第幾次）、AA614_KAIDOOR（阿凱程式教室門口那天）、
     AA614_TALK（{kai, ps}：閒聊那一句說過的那天）、NY_WATCHED（1 廳看完電影那天）；舊存檔沒有＝沒發生過。
   載入順序：invites.js、invites3d.js、story3d.js、phone3d.js、outings3d.js、jobs3d.js 之後（index.html 放在 aa613_3d.js 後面）。測試：node tests/aa614_jobs_unit.js */
/* 2026-11-11（使用者 X327 沛珊重寫）：溫州街課輔班窗外看到她那一句照 AA_763_peishan_misc3.json@62460ea75 換（1 列，只換字）。逐字對稿：tests/peishan_misc3_1111_unit.js */
'use strict';
const AA614=(function(){
  const S={};
  const ZHE='zhe', MX='classmate_mingxuan', PS='classmate_peishan', BH='classmate_bohan', XC='classmate_xinci', YT='heroine_03', YU='yu', KAI='kai';
  const law=G=>!!G&&(G.stage||'law')==='law';
  const NOW=G=>G.day*24+(+G.hour||0), T=(d,h)=>d*24+h, hr=G=>(+G.hour||0)%24;
  const F_=G=>G.flags||(G.flags={});
  const knows=(id,G)=>typeof STORY!=='undefined'&&!!STORY.knows&&!!STORY.knows(id,G);
  const P_=()=>typeof PHONE!=='undefined'?PHONE:null;
  const sent=(G,tag)=>{ const P=P_(); return !!P&&P.sent(G,tag); };
  const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const TD=(term,w,wd)=>typeof STORY!=='undefined'&&STORY.termDayIn?STORY.termDayIn(term,w,wd):null;   /* wd：1＝週一 … 7＝週日（CALENDAR.dateOf 的 wd）*/
  const wdOf=d=>typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(d).wd%7:null;   /* 0＝週日（G.weekday 的寫法）*/
  const nameOf=id=>typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(id):((typeof CHARACTERS!=='undefined'&&CHARACTERS[id]&&CHARACTERS[id].name)||id);

  /* ---------------- 台詞（一字照稿）---------------- */
  S.L={
    /* AA_614 第 2 節（說的話）＋AA_615 第 4 節（Alison）：S.invRule 回的 lines → invites3d.js S.playLines(GM,who,…)＝有名字說的，不加外面的「」（稿上有；AA-B 2026-11-08 11:05，TEXT-QUOTE-UNIFY-1108 第五批）*/
    inv:{ mx:'我那時候家教。……九點半以後可以，公館？', ps:'禮拜三我在課輔班，九點才下課。……禮拜四好不好？', kai:'禮拜六下午我在上班。……晚上？我六點半回宿舍。',
      ytBoth:'我們兩個都在上班啊。', ytOff:'我在茶屋。……五點以後可以。', yu:'禮拜五晚上我在戲院。……禮拜天下午？', yuSat:'週六我在南洋上班，到很晚。……禮拜天下午可以嗎？' },   /* yuSat：接線時補的（73ee9256d）*/
    /* AA_614 第 3 節（群組、私訊；說的人照稿）*/
    g1:[[ZHE,'宵夜？公館。'],[MX,'我剛家教完，在公車上。……你們先吃，我到再說。'],[ZHE,'好，幫你點。']],
    g2:[[XC,'今晚有人要讀民總嗎？法圖。'],[PS,'我在課輔班，九點下課。明天可以！']],
    g3:[[BH,'下午要不要去看電影？'],[KAI,'我上班到六點。……晚場可以。'],[BH,'那七點半那場。']], g3opts:['好。','我不去了。'],
    g3movie:'（電影不好看。阿凱在公車上一直講結局哪裡不合理。）',
    g4:[[YU,'誰要去吃火鍋？'],[MX,'我禮拜二禮拜四都在家教。禮拜三我可以。'],[YU,'那禮拜三！']],
    g5:[[YT,'今天茶屋好多人。……下午你不在，蘇姨問你去哪了。']],
    /* AA_614 第 4 節（路上遇到）*/
    psDoor:'你怎麼在這？我在這裡當助教，教國小的小朋友。', psDoorAgain:'（課輔班的窗戶裡，沛珊在白板前面講題目。）',
    kaiDoor:'（阿凱站在門口，一個一個看家長來接。看到你，他比了一個累的手勢。）',
    /* AA_614 第 5 節（閒聊）*/
    talk:{ kai:'我禮拜六去教小學生寫程式。他們問我會不會做遊戲，我說會。……其實還不會。', ps:'課輔班有一個五年級的，每次都說數學沒用。……我也這樣想過。' },
    /* AA_615 第 3 節：1 廳坐下來看（隨機一句）；第 4 節：和朋友一起來 */
    watch:['（第一部是一年前很紅的那部。你這次才看懂結局。）','（第二部看到一半，前面有人睡著了。）','（散場的時候已經很晚，羅斯福路上的車少了。）'],
    three:'三位？……你們三個看同一部喔。' };

  /* ---------------- 作息：那一天有沒有上班（characters.js 那一筆的 job）---------------- */
  /* 照作息、那一天那個時間在哪一筆（不含邀約本身；和 invites3d.js entAt 一樣的寫法）*/
  S.entAt=function(G,id,day,h){ if(typeof STORY==='undefined'||!STORY.schedEnt||typeof CHARACTERS==='undefined'||!CHARACTERS[id]) return null; const wd=wdOf(day);
    return STORY.schedEnt(CHARACTERS[id],{day,hour:h,weekday:wd==null?G.weekday:wd,flags:G.flags||{},stage:G.stage,noInvite:true}); };
  S.JOB_AT={ps_tutor:18.5,kai_code:15,yu_cinema:20};   /* 看哪一個時間：沛珊 18:30（考試週 19:00 起那幾筆 AA_320 E7 在前面）、阿凱 15:00、Alison 20:00 */
  S.jobOn=function(G,id,job,day){ const e=S.entAt(G,id,day,S.JOB_AT[job]); return !!e&&e.job===job; };
  /* 語彤那一天在一盞茶屋有班（invites3d.js teaOn 同一個看法：13～16 點有一個時間在 wz_teahouse）*/
  S.ytShift=(G,day)=>[13,14,15,16].some(t=>{ const e=S.entAt(G,YT,day,t); return !!e&&e.zone==='wz_teahouse'; });
  /* 祐廷那一天有沒有排一盞茶屋的班（AA_614 第 2 節「祐廷也在班表上的時候」）*/
  S.meTea=(G,day)=>typeof JOBS!=='undefined'&&!!JOBS.scheduled&&!!JOBS.scheduled(G,'tea',day);
  const over=(c,a,b)=>c.h<b-1e-6&&c.h+((c.P&&c.P.stay)||1)>a+1e-6;   /* 約的那段時間和上班的時間重疊 */

  /* ---------------- 第 2 節：邀約撞到上班（invites3d.js S.personal 的 rule；回傳 null＝照原本的）---------------- */
  const atOr=(I,G,id,P,day,h)=>I.freeAt(G,id,P,day,h)?{day,h}:I.nextFree(G,id,P,day,h);
  const sameDay=(a,day)=>a&&a.day===day?a:null;
  S.invRule=function(id,G,c,I){ if(!law(G)||!c||!c.r||c.r.res!=='accept'||!c.P) return null;
    if(id===MX){ if(['cafe','library','noodle'].includes(c.pid)) return null;   /* 那三個地點照 BB_172 M10～M12（invites.js 原本的 rule）*/
      if(!c.term||![2,4].includes(c.wd)||!over(c,19,21.5)) return null;   /* 學期中（暑假學生放假，AA_614 第 1 節）*/
      return {res:'resched',why:'tutor',lines:[S.L.inv.mx],alt:atOr(I,G,id,c.P,c.day,21.5)}; }
    if(id===PS){ if(c.wd!==3||!over(c,18,21.5)||!S.jobOn(G,PS,'ps_tutor',c.day)) return null;
      return {res:'resched',why:'work',act:'work',lines:[S.L.inv.ps],alt:sameDay(atOr(I,G,id,c.P,c.day+1,c.h),c.day+1)||sameDay(I.nextFree(G,id,c.P,c.day+1,10),c.day+1)}; }
    if(id===KAI){ if(c.wd!==6||!over(c,12.5,18.5)||!S.jobOn(G,KAI,'kai_code',c.day)) return null;
      return {res:'resched',why:'work',act:'work',lines:[S.L.inv.kai],alt:atOr(I,G,id,c.P,c.day,19)}; }
    if(id===YT){ if(!(c.wd===6||c.wd===0)||!over(c,12.5,17.5)||(G.flags&&G.flags.dating_heroine_03)||!S.ytShift(G,c.day)) return null;   /* 交往中：AA_627 P-27～P-29 那幾句（invite_replies.js）照舊 */
      return {res:'resched',why:'work',act:'work',lines:[S.meTea(G,c.day)?S.L.inv.ytBoth:S.L.inv.ytOff],alt:atOr(I,G,id,c.P,c.day,17.5)}; }
    if(id===YU){ if(!(c.wd===5||c.wd===6)||!over(c,18,23)||!S.jobOn(G,YU,'yu_cinema',c.day)) return null;
      let sun=c.day+1; while(wdOf(sun)!==0&&sun<c.day+8) sun++; const alt=atOr(I,G,id,c.P,sun,14);
      return {res:'resched',why:'work',act:'work',lines:[c.wd===5?S.L.inv.yu:S.L.inv.yuSat],alt}; }   /* 週六晚上：AA-B 接線時補的那一句（73ee9256d）*/
    return null; };
  S.INV_IDS=[MX,PS,KAI,YT,YU];
  S.installInv=function(){ if(typeof INVITE_DATA==='undefined'||!INVITE_DATA.people) return false; const PP=INVITE_DATA.people;
    for(const id of S.INV_IDS){ const p=PP[id]||(PP[id]={}); if(p._aa614) continue; const r0=p.rule; p.rule=function(G,c,I){ let q=null; try{ q=S.invRule(id,G,c,I); }catch(e){ console.warn('AA614.invRule',e); } return q||(r0?r0.apply(this,arguments):null); }; p._aa614=true; }
    return true; };

  /* ---------------- 第 3 節：群組、私訊（STORY.PHONE_RULES）---------------- */
  const gm=(gid,id,t)=>({th:'g:'+gid,from:id,name:nameOf(id),text:t});
  const dm=(id,t)=>({th:'p:'+id,from:id,text:t});
  const inGrp=(G,g)=>{ const P=P_(); return !!P&&!!P.inGroup&&P.inGroup(G,g); };
  S.GRP={dept:'noodle_team',squad:'camp_squad_y1',room:'r203'};   /* 系上朋友＝桌遊團（阿哲、明軒、Alison…；story3d.js NDL_TEAM）、第七小隊、宿舍 203（src/dorm203_3d.js GID）*/
  /* 每一列的日子（學期、週、星期 1～7）與時間 */
  S.ROWS={ r1:['Y1S1',6,4,21+40/60], r2:['Y1S1',8,3,19], r3:['Y1S1',9,6,12], r4:['Y1S2',3,2,19+20/60], r5:['Y1S1',12,7,14] };
  S.rowDay=k=>{ const R=S.ROWS[k]; return R?TD(R[0],R[1],R[2]):null; };
  const due=(G,k)=>{ const d=S.rowDay(k), h=S.ROWS[k][3]; return d!=null&&G.day>=d-1&&NOW(G)<T(d,h)?d:null; };   /* 前一天起排（睡過頭也照原本的時間補進去），過了就不排 */
  const hasContact=(G,id)=>typeof INV==='undefined'||!INV.hasContact||INV.hasContact(G,id);
  S.phone=function(G){ const P=P_(); if(!P||!G||!law(G)) return; const F=F_(G);
    /* 1：大一上第 6 週週四 21:40 系上朋友（不在群組裡＝阿哲私訊；只有阿哲那一句，明軒不在私訊裡）*/
    { const d=due(G,'r1'), tag='aa614_r1'; if(d!=null&&!sent(G,tag)&&knows(ZHE,G)){
        if(inGrp(G,S.GRP.dept)&&knows(MX,G)) P.at(G,d,S.ROWS.r1[3],S.L.g1.map(([id,t])=>gm(S.GRP.dept,id,t)),tag);
        else if(!inGrp(G,S.GRP.dept)&&hasContact(G,ZHE)) P.at(G,d,S.ROWS.r1[3],[dm(ZHE,S.L.g1[0][1])],tag); } }
    /* 2：大一上第 8 週週三 19:00 第七小隊 */
    { const d=due(G,'r2'), tag='aa614_r2'; if(d!=null&&!sent(G,tag)&&inGrp(G,S.GRP.squad)&&knows(XC,G)&&knows(PS,G)) P.at(G,d,S.ROWS.r2[3],S.L.g2.map(([id,t])=>gm(S.GRP.squad,id,t)),tag); }
    /* 3：大一上第 9 週週六 12:00 宿舍 203（回「好。」＝當天 19:30 南洋戲院）*/
    { const d=due(G,'r3'), tag='aa614_r3'; if(d!=null&&!sent(G,tag)&&inGrp(G,S.GRP.room)&&knows(BH,G)&&knows(KAI,G)){ const M=S.L.g3.map(([id,t])=>gm(S.GRP.room,id,t));
        M[M.length-1].ask={id:tag,until:T(d,19),opts:[{t:S.L.g3opts[0],set:{AA614_MOVIE:d}},{t:S.L.g3opts[1]}]}; P.at(G,d,S.ROWS.r3[3],M,tag); } }
    { const d=F.AA614_MOVIE; if(typeof d==='number'&&typeof OUT!=='undefined'&&!OUT.get(G,'aa614_movie')&&NOW(G)<T(d,19.5+0.75))
        OUT.plan(G,{id:'aa614_movie',ev:'ev_aa614_movie',day:d,h:19.5,late:0.5,place:'南洋戲院',title:'看電影 19:30（南洋戲院）',travel:'走過去約 10 分鐘',travelH:1/6}); }
    /* 4：大一下第 3 週週二 19:20 系上朋友 */
    { const d=due(G,'r4'), tag='aa614_r4'; if(d!=null&&!sent(G,tag)&&inGrp(G,S.GRP.dept)&&knows(YU,G)&&knows(MX,G)) P.at(G,d,S.ROWS.r4[3],S.L.g4.map(([id,t])=>gm(S.GRP.dept,id,t)),tag); }
    /* 5：大一上第 12 週週日 14:00 語彤私訊（那一天祐廷沒排茶屋的班、她有班、已經認識）*/
    { const d=due(G,'r5'), tag='aa614_r5'; if(d!=null&&!sent(G,tag)&&knows(YT,G)&&hasContact(G,YT)&&typeof JOBS!=='undefined'&&JOBS.active&&JOBS.active(G,'tea')&&!S.meTea(G,d)&&S.ytShift(G,d)) P.at(G,d,S.ROWS.r5[3],S.L.g5.map(([id,t])=>dm(id,t)),tag); } };

  /* 第 3 列那一場（出遊）：那天 Alison 在櫃檯（週六 18:00～23:00 的班、已經認識）＝AA_615「三位？……」*/
  S.yuHere=G=>knows(YU,G)&&S.jobOn(G,YU,'yu_cinema',G.day);
  S.EVENTS=[ {id:'ev_aa614_movie',title:'看電影',participants:[KAI,BH],location:'any',trigger:'outing',once:true,background:'dark',hours:4,   /* AA_615 第 3 節：一場兩部連映，約 4 小時 */
      beforeOuting:(G,GM)=>{ if(typeof INV!=='undefined'&&INV.buyTicket) INV.buyTicket(GM,G,{zone:'xs_nanyang'}); },   /* 票照自己去一樣買（INVITE-PLACES-1107）；錢不夠照樣看（不擋）*/
      dialogue:[ {scene:'南洋戲院',bg:'gongguan_cinema'},
        {if:{custom:G=>S.yuHere(G)},speaker:YU,text:S.L.three},
        {speaker:null,text:S.L.g3movie} ]},
    /* 第 4 節：沛珊 週三 18:20 溫州街（第一次那一句、之後旁白）；阿凱 週六 17:50 新生南路。一天一次 */
    {id:'ev_aa614_ps_door',participants:[PS],noMeet:[PS],location:'wenzhou',trigger:'auto',weekday:[3],time:[18+20/60,18+50/60],background:'blur',
      prereq:{custom:G=>law(G)&&F_(G).AA614_PSDOOR!==G.day&&knows(PS,G)&&S.jobOn(G,PS,'ps_tutor',G.day)},
      dialogue:[ {scene:'溫州街・課輔班門口',bg:'wenzhou_tutoring'},
        {if:{custom:G=>!(F_(G).AA614_PSDOOR_N>0)},speaker:PS,text:S.L.psDoor},
        {if:{custom:G=>F_(G).AA614_PSDOOR_N>0},speaker:null,text:S.L.psDoorAgain} ],
      after:G=>{ const F=F_(G); F.AA614_PSDOOR=G.day; F.AA614_PSDOOR_N=(F.AA614_PSDOOR_N|0)+1; }},
    {id:'ev_aa614_kai_door',participants:[KAI],noMeet:[KAI],location:'xinsheng',trigger:'auto',weekday:[6],time:[17+50/60,18+20/60],background:'blur',
      prereq:{custom:G=>law(G)&&F_(G).AA614_KAIDOOR!==G.day&&knows(KAI,G)&&S.jobOn(G,KAI,'kai_code',G.day)},
      dialogue:[ {speaker:null,text:S.L.kaiDoor} ],
      after:G=>{ F_(G).AA614_KAIDOOR=G.day; }} ];

  /* ---------------- 第 5 節：閒聊各一句（大一上第 4 週起、還在打工的時候；一次）---------------- */
  S.talkOn=function(G,who){ if(!law(G)) return false; const w4=TD('Y1S1',4,1); if(w4==null||G.day<w4) return false;
    const end=DK(who==='kai'?'2029-06-27':'2026-12-17'); return end==null||G.day<=end; };   /* 阿凱做到宿舍期滿那天、沛珊到 12/17（characters.js 那一筆的 dates）*/
  S.heard=(G,who)=>{ const R=F_(G).AA614_TALK; return !!(R&&typeof R==='object'&&R[who]!=null); };
  const markTalk=(G,who)=>{ const F=F_(G); if(!F.AA614_TALK||typeof F.AA614_TALK!=='object') F.AA614_TALK={}; F.AA614_TALK[who]=G.day; };
  S.KAI_SMALL={t:S.L.talk.kai,once:true,aa614:true,if:{custom:G=>S.talkOn(G,'kai')}};   /* SMALLTALK 的寫法：說的話不加外面的「」（閒聊是 GM.say(who,…) 有名字說的，AA-B 2026-11-08，TEXT-QUOTE-UNIFY-1108 第四批；舊存檔記的「…」讀檔時 STORY.smallQuoteMigrate 換成這一句）*/
  /* 沛珊每一學期都有閒聊階梯（ladder.js），一般閒聊輪不到：第一次說話（條件到了、還沒說過）先說這一句，這一次不走階梯 */
  S.psTalk=async function(GM,who,id){ const G=GM&&GM.G; if(id!==PS||!G||S.heard(G,'ps')||!S.talkOn(G,'ps')) return false;
    await GM.say(who,S.L.talk.ps); markTalk(G,'ps'); if(typeof SOCIAL!=='undefined'&&SOCIAL.activity){ SOCIAL.activity(PS,'chat'); SOCIAL.activity(PS,'chatNew'); } return true; };

  /* ---------------- AA_615：1 廳坐下來看（STORY.onSeat）---------------- */
  S.HALL='xs_nanyang_hall';
  S.canWatch=G=>!!G&&law(G)&&G.zone===S.HALL&&F_(G).NY_WATCHED!==G.day&&(typeof NYS==='undefined'||!NYS.hasTicket||NYS.hasTicket(G));   /* 今天的票（nanyang_sys3d.js S.hasTicket）；一張票看一場 */
  S.watchHours=G=>Math.max(0.5,Math.min(4,24-hr(G)));   /* 兩部連映約 4 小時；24:00 打烊以前散場 */
  S.pick=()=>Math.floor(Math.random()*S.L.watch.length);
  S.watch=async function(GM){ const G=GM.G; F_(G).NY_WATCHED=G.day; const h0=hr(G), dur=S.watchHours(G);
    const NY=typeof NY3!=='undefined'?NY3:null; if(NY&&NY.houseLights) NY.houseLights(false);
    if(GM.fade) await GM.fade(true); if(GM.advance) GM.advance(dur); if(typeof CLS!=='undefined'&&CLS.slotFillSpan) CLS.slotFillSpan(G,h0,h0+dur);   /* 看一場電影＝那段時間的一件主要的事（出遊同一個做法）*/
    if(GM.fade) await GM.fade(false);
    { const SL=typeof MOVIES!=='undefined'&&MOVIES.soloLines?MOVIES.soloLines(G):null; if(SL&&SL.length&&MOVIES.soloPlay&&typeof MOVIE_PLOTS!=='undefined'&&await MOVIES.soloPlay(GM)){ /* AA_745：solo 三句中間接兩部片的那一幕（scene），兩部都算看過（MOVIE-TALK-1110）*/ } else if(SL&&SL.length){ for(const t of SL) await GM.say(null,t); } else await GM.say(null,S.L.watch[S.pick()]); }   /* 一個人看：AA_730 的 solo 三句（片名照那一段；MOVIE-REAL-1110，AA_730 pick 第 7 條取代 AA_615 的隨機旁白）；片單沒載入照舊 */
    if(typeof SHOPNPC!=='undefined'&&SHOPNPC.popcorn&&SHOPNPC.popcorn(G)&&typeof SHOP_NPC!=='undefined'&&SHOP_NPC.alison&&SHOP_NPC.alison.movieLine) await GM.say(null,SHOP_NPC.alison.movieLine);   /* AA_615 第 4 節：今天拿到爆米花 */
    { const sl=typeof JOBS!=='undefined'&&JOBS.staffTicketLine?JOBS.staffTicketLine(G):null; if(sl) await GM.say(null,sl); }   /* AA_828 第 2 節：拿員工票看的（站著看）＝看完多一句 */
    if(NY&&NY.houseLights) NY.houseLights(true); if(GM.autosave) GM.autosave(); return true; };
  S.onSeat=async function(GM,seat){ const G=GM&&GM.G; if(!seat||seat.kind!=='cinema'||!S.canWatch(G)) return false;
    if(typeof JOBS!=='undefined'&&JOBS.staffTicketToday&&JOBS.staffTicketToday(G)){ const P=GM.E&&GM.E.player; if(P&&P.seat&&GM.standUp) GM.standUp(P); }   /* 員工票＝站著看（AA_828）：人不坐在位子上（站在走過去的那一點）*/
    return S.watch(GM); };

  /* ---------------- 登記 ---------------- */
  S.installInv();
  if(typeof STORY!=='undefined'){
    if(Array.isArray(STORY.PHONE_RULES)&&!STORY._aa614Phone){ STORY.PHONE_RULES.push(G=>S.phone(G)); STORY._aa614Phone=true; }
    if(STORY.ladderTalk&&!STORY.ladderTalk._aa614){ const l0=STORY.ladderTalk; STORY.ladderTalk=Object.assign(async function(GM,who,id,mode){ if(!mode){ try{ if(await S.psTalk(GM,who,id)) return true; }catch(e){ console.warn('AA614.psTalk',e); } } return l0.apply(this,arguments); },{_aa614:true}); }
    if(!STORY._aa614Seat){ const os=STORY.onSeat; STORY.onSeat=async function(GM,seat){ const r=os?await os.apply(this,arguments):false; try{ if(GM&&GM.G&&GM.G.zone===S.HALL) await S.onSeat(GM,seat); }catch(e){ console.warn('AA614.onSeat',e); } return r; }; STORY._aa614Seat=true; } }
  if(typeof SMALLTALK!=='undefined'){ const A=SMALLTALK[KAI]||(SMALLTALK[KAI]=[]); if(!A.some(e=>e&&e.aa614)) A.push(S.KAI_SMALL); }
  if(typeof STORY_EVENTS!=='undefined') for(const e of S.EVENTS) if(!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e);
  /* ---------------- 接線時補的（AA-B 2026-11-07 21:56，企劃線 73ee9256d）---------------- */
  /* 閒聊階梯（ladder.js 是匯入產生的檔，不手改；這裡在載入時改）：
     大一下、大二上沛珊的招呼「（她帶著一排小孩過馬路，對你點頭）……等一下！」原本綁週二、四 16:30～18:00 溫州街＝課輔班搬到週三晚上以後演不到 → 週三 20:50～21:10（下課送小孩到路口），字不動；
     P2-L3「一週兩天。」→「每個禮拜三。」；「當志工」→「當助教」（AA-B 22:03 說法統一） */
  S.PS_CROSS='（她帶著一排小孩過馬路，對你點頭）等一下！我在上班！';   /* 2026-11-11（X327 沛珊重寫，AA_753@c5094495d）：這一則的字換了（原本「……等一下！」）。出現條件 2026-11-11 起照 BB_326 第 4 節（週三 18:00～21:00、溫州街），在 ladder.js 的資料裡，這裡不再搬。P2-L3 新稿 AA 已更正成「我在溫州街的課輔班帶小朋友，每個禮拜三。」（AA_753_peishan_ladder_Y1S2_Y2S1.json@b59a8f9de）＝下面 P2L3.from 對不到、不用換 */
  S.P2L3={from:'我在溫州街的課輔班當志工。一週兩天。',to:'我在溫州街的課輔班當助教。每個禮拜三。'};
  S.fixLadder=function(Ld){ const B=Ld&&Ld.byTerm; if(!B) return 0; let n=0;
    for(const t of Object.keys(B)){ const p=B[t]&&B[t][PS]; if(!p) continue;
      /* 2026-11-11（BB_326 第 4 節，企劃線 8abb761bd；BB 定、LAWWW 同意）：這一則招呼的出現條件改成溫州街、週三 18:00～21:00（她整段課輔班的時間），寫在 ladder.js 的資料裡（tools/ladder/import_ladder.py 的 PS326）——
         原本這裡在載入時把它搬到週三 20:50～21:10（下課送小孩到路口），拿掉、不再覆蓋；S.PS_CROSS 留著給測試找那一則 */
      for(const st of (p.steps||[])){ if(!st) continue; const fix=L=>Array.isArray(L)?L.map(x=>x===S.P2L3.from?(n++,S.P2L3.to):x):L; if(st.id==='P2-L3') st.lines=fix(st.lines); } }
    return n; };
  if(typeof LADDER!=='undefined') S.fixLadder(LADDER);
  /* 人物頁「打工：……」：聽過第 5 節那句（閒聊）或第 4 節在上班的地方遇到以後才出現（whois3d.js 讀這兩個）*/
  S.knowsJob=function(G,who){ if(!G) return false; const F=F_(G);
    if(who===KAI){ const r=G.social&&G.social.small&&G.social.small[KAI]; return !!(r&&r.once&&r.once[S.KAI_SMALL.t])||F.AA614_KAIDOOR!=null; }
    if(who===PS) return S.heard(G,'ps')||(F.AA614_PSDOOR_N|0)>0;
    return false; };
  return S;
})();
if(typeof window!=='undefined') window.AA614=AA614;
