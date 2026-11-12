/* ===== 學期末的飯：告白只在學期末（BB_203，使用者 2026-10-17 確認；使用者 11:40 對 LAWWW-C「告白只在學期末」；任務 BB203-CONFESS-1017）=====
   - 時段：每學期第 16 週週四～放假後第 1 週週日（AA_250 各學期的「聚餐時段」＝CALENDAR.termDays 的最後一天 -3～+7）。大四下（畢業那天）另外做。
   - 時段第一天 00:00 以後第一次算的時候決定這學期的邀約（S.plan；中途條件變了不重算，BB_203 第 5 節）：
     ①心意的邀約（使用者 2026-10-17 改、每個學期都一樣，BB_203 第 1 節第 4 點 303fe766）：她的戀愛（npcRom）≥ 30＋4 次正式約會含心願地點＋她當時願意（C4～C10）＋這段期間不是特別不發的時候（學姊筆試、放榜前；沛珊重考期）。第 6 階、答應線、祐廷的戀愛、大一上的例外都不用了。
     ②朋友的邀約：這學期 contact ≥ 6、熟度 FAMILIAR 以上的前兩名（BB_202 1-1；contact 照 S.contact 記）。
     ③保底（①②都沒有）：contact 最高、ACQUAINTANCE 以上的那一位；再沒有＝阿凱在宿舍當面「宵夜？」。
     交往中的女朋友另外有學期末約會（AA_250 10-3），不佔名額；可昕照 BB_202 第 6 節另外做。
   - 手機：時段第一天 20:00 不發心意邀約的手機一句（AA_254 第 9 節）、20:30 起各邀約一則；**只能接一個**——接了一個，其他的自動回「那天有約了。」（她們回婉拒那句）。
     例外（TE-HEART-EXEMPT-1104，BB-C 2026-11-04 19:15）：語彤的心意邀約（HEART 寫 examDay 的那一則）不佔這個名額——答應她記 R.heartPick（R.picked 不動）、晚餐是另一場出遊 te_ex_<學期>_<她>，
     別人的邀約照常傳、照常可以接；只有兩頓的時間撞到才互斥（S.exSweep：先定的那一頓留下，另一邊還沒回的那一則照「改天」＝自動回「那天有約了。」＋她的婉拒句，不扣數值）。
     TE-HEART-AVOID-1104（BB-C 2026-11-04 20:17）：還沒回的一般邀約排日子時避開語彤那一頓那一整晚（S.genDay、S.exEvening），找不到別的晚上才照字面互斥（console.info「TE-HEART-AVOID …」）。
   - 飯＝出遊（OUT，事件 ev_termend_dinner 的 beforeOuting）：開場旁白（AA_250 0-1）→ 話題池 → 飯桌一句 → 收尾；
     心意的邀約接著回家的路上：說出來三句＋（先不說）→ 說出來＝答應、交往（ROM.start）；先不說＝她說 →「好。」交往／「讓我想想。」這學期不交往，下學期她用第二次的邀約再約。
     「她先說」的模式（SHE-FIRST-1110，芷若、沛珊；S.sheFirst）：她先告白 → 直接出稿上的幾個回應（各有 result）→ yes＝交往、think＝這學期不交往；沒有「（先不說）」、後面沒有「好。／讓我想想。」。
   - 學期中、正式校外約會的收尾不再有告白（DATE.confessOffer 看 S.ON）。
   台詞全部在 data/termend_lines.js（AA 定稿照抄）。存檔：G.termend＝{contact:{學期:{id:{pts,k:{種類:哪一天}}}}, 學期:{plan, asks, picked, done, heartPick, heartDone, ...}, think:{id:哪一學期說讓我想想}}
  （heartPick／heartDone：不佔名額的那一則答應了／吃完了，形狀和 picked／done 一樣；舊存檔沒有＝沒有；plan.exempt＝這學期不佔名額的人，舊版排的名單沒有這一欄＝整學期照原本只能接一個）。測試：node tests/termend_unit.js、node tests/te_heart_exempt_unit.js */
const TERMEND=(function(){
  const S={}; S.ON=true;
  const L=()=>typeof TERMEND_LINES!=='undefined'?TERMEND_LINES:null;
  const T=(d,h)=>d*24+h;
  const nm=id=>typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(id):id;
  const TERMS=['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1'];
  const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  /* 大五上（交換延畢，AA_357 3-4）：只有女朋友的學期末約會（延畢、交往中），時段 12/19～12/23；其他照 kind 'gf'（心意、朋友的邀約、阿凱都沒有）*/
  S.Y5={id:'Y5S1',from:'2029-12-19',to:'2029-12-23'};
  const delayedTE=G=>typeof STORY!=='undefined'&&!!STORY.routeAbroadRoute&&!!STORY.routeAbroadRoute(G);
  S.windowOf=function(id){ if(id===S.Y5.id){ const a=DK(S.Y5.from), b=DK(S.Y5.to); return a!=null&&b!=null?{id,from:a,to:b,termTo:b}:null; } if(typeof CALENDAR==='undefined'||!CALENDAR.termDays) return null; const r=CALENDAR.termDays(id); return r?{id,from:r.to-3,to:r.to+7,termTo:r.to}:null; };
  S.window=function(G){ if(!G||(G.stage||'law')!=='law') return null; for(const id of TERMS.concat(delayedTE(G)?[S.Y5.id]:[])){ const w=S.windowOf(id); if(w&&G.day>=w.from&&G.day<=w.to) return w; } return null; };
  S.rec=function(G,id){ const R=G.termend&&typeof G.termend==='object'?G.termend:(G.termend={}); if(!R.think||typeof R.think!=='object') R.think={}; if(!id) return R; return R[id]||(R[id]={}); };
  /* ---- 這學期常接觸的分數（BB_202 1-1）：同一天同一種只算一次。talk 閒聊 +1、meet 約好的見面／正式約會 +2、same 同一堂課／讀書會／社團 +1、together 劇情事件一起在場 +2 ---- */
  const PTS={talk:1,meet:2,same:1,together:2};
  const ACT2K={chat:'talk',chatNew:'talk',classmate:'same',cafe:'meet',library:'meet',meal:'meet',walk:'meet',acceptInvite:'meet',help:'together'};
  S.ROM_MIN=30;   /* C1：她的戀愛 ≥ 30（使用者 2026-10-17「不管哪一個學期，好感度 30 就可以告白，她對我」，BB_203 第 5 節 303fe766）*/
  S.contact=function(G,id,kind){ if(!G||!id||!PTS[kind]||typeof CALENDAR==='undefined') return 0; const t=CALENDAR.termOf(G.day); if(!t||!(t.week>=1&&t.week<=16)) return 0;
    const R=S.rec(G), C=R.contact||(R.contact={}), M=C[t.id]||(C[t.id]={}), P=M[id]||(M[id]={pts:0,k:{}}); if(P.k[kind]===G.day) return 0; P.k[kind]=G.day; P.pts+=PTS[kind]; P.last=G.day; return PTS[kind]; };
  S.score=function(G,term,id){ const C=G.termend&&G.termend.contact; const P=C&&C[term]&&C[term][id]; return P?P.pts|0:0; };
  if(typeof SOCIAL!=='undefined') SOCIAL.onActivity=(G,id,kind)=>{ const k=ACT2K[kind]; if(k) S.contact(G,id,k); };
  const atLeast=(id,st)=>{ if(typeof SOCIAL==='undefined'||!SOCIAL.STAGES) return false; const A=SOCIAL.STAGES; return A.indexOf(SOCIAL.stage(id))>=A.indexOf(st); };
  const romStatus=(G,id)=>typeof ROM!=='undefined'&&ROM.get?ROM.get(G,id).status:'none';
  /* ---- 心意的邀約發不發（BB_203 第 5 節）：true＝發；{nope:'low'|'knows'|'preexam'}＝不發但時段第一天傳那一句（AA_254 第 9 節）；false＝不發、不傳 ---- */
  /* 她知道祐廷正在和別人交往的時候（BB_203 第 5 節 5-3 第三欄、BB_194 §6／§13-4；BB-C 12:43）：先過一般條件，再看這張表，到了＝照樣發心意邀約，沒到＝不發、只傳那一句。
     知情＝knowsRel[X][Y]、Y 在交往中、沒有 OPEN_OK[X][Y]（她明確同意祐廷同時和 Y 交往）。數字不隨 30 降低。YT_HONEST／YT_DODGED／YT_LIED 是 {她:true} 或 旗標_她 */
  const fl=(G,k,id)=>{ const F=G.flags||{}, v=F[k]; return !!((v&&typeof v==='object'&&v[id])||F[k+'_'+id]); };
  const romOf=id=>typeof SOCIAL!=='undefined'&&SOCIAL.rel?(+SOCIAL.rel(id).npcRom||0):0;
  const seen=(G,ids)=>ids.some(e=>G.events&&G.events.done&&G.events.done[e]);
  S.KNOWS_OK={
    heroine_04:G=>fl(G,'YT_HONEST','heroine_04')&&!fl(G,'YT_DODGED','heroine_04'),
    classmate_peishan:G=>fl(G,'YT_HONEST','classmate_peishan')&&romOf('classmate_peishan')>=70&&!fl(G,'YT_LIED','classmate_peishan'),
    heroine_03:G=>fl(G,'YT_HONEST','heroine_03')&&romOf('heroine_03')>=73,
    heroine_02:G=>fl(G,'YT_HONEST','heroine_02')&&(DATE.log(G,'heroine_02').count|0)>=6&&seen(G,['ev_zhiruo_film_night','ev_zhiruo_early_show','ev_zhiruo_applied']),   /* 看過 Z5 或 Z7 */
    heroine_05:G=>fl(G,'YT_HONEST','heroine_05')&&romOf('heroine_05')>=75,
    heroine_01:G=>fl(G,'YT_HONEST','heroine_01')&&romOf('heroine_01')>=77,
    kexin:G=>romOf('kexin')>=85&&!fl(G,'YT_LIED','kexin'),
    classmate_xinci:G=>typeof XCROM!=='undefined'&&XCROM.acceptsOpen(G)&&XCROM.knowsOk(G) };   /* 芯慈：只要沒騙她就接受（AA_548 第 7 節，使用者 10-31 點選）＝她知道的每一段都是你親口說的 */
  S.openOk=(G,x,y)=>!!(G.flags&&G.flags.OPEN_OK&&G.flags.OPEN_OK[x]&&G.flags.OPEN_OK[x][y]);
  S.knownOthers=(G,id)=>typeof ROM!=='undefined'&&ROM.knows?ROM.knows(G,id).filter(p=>!S.openOk(G,id,p)):[];
  /* 她當時願意（DATE.willing 的條件，知情那一項改看上面的表）*/
  S.willing=function(G,id){ const F=G.flags||{};
    if(DATE.LOW&&DATE.LOW[id]&&DATE.LOW[id](G)) return {ok:false,why:'low'};
    if(typeof ROM!=='undefined'&&ROM.get){ const R=ROM.get(G,id); if(R&&R.status==='paused') return {ok:false,why:'paused'}; }
    if(S.knownOthers(G,id).length&&!(S.KNOWS_OK[id]&&S.KNOWS_OK[id](G))) return {ok:false,why:'knows'};
    const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[id]; if(c&&c.partner&&typeof STORY!=='undefined'&&(STORY.partnerOn?STORY.partnerOn(G,c.partner):(STORY.inTerms&&STORY.inTerms(G,c.partner)))) return {ok:false,why:'partner'};
    if(F['dating_'+id]) return {ok:false,why:'dating'};
    return {ok:true}; };
  /* 告白的條件（BB_203 第 5 節 303fe766）：C1 她的戀愛 < 30、C2 正式約會不到 4 次或沒有心願地點＝還沒到；C4～C10 她當時願意（DATE.willing）；學姊筆試前、放榜前婉拒 */
  S.cond=function(G,id){ if(DATE.HOLD&&DATE.HOLD[id]) return {ok:false,why:'hold'};
    if(id==='classmate_xinci'&&!(typeof XCROM!=='undefined'&&XCROM.heartOk(G))) return {ok:false,why:'xc'};   /* 芯慈（XINCI-ROMANCE-1030）：G1～G10 沒全過＝不發、也不傳 NOPE（AA_537b 第 7 節）*/
    const r=typeof SOCIAL!=='undefined'&&SOCIAL.rel?SOCIAL.rel(id):{}, L=DATE.log(G,id);
    if((+r.npcRom||0)<S.ROM_MIN) return {ok:false,why:'rom'}; if((L.count|0)<4) return {ok:false,why:'count'}; if(!L.wish) return {ok:false,why:'wish'};
    const ww=S.willing(G,id); if(!ww.ok) return {ok:false,why:ww.why};
    if(id==='heroine_05'&&DATE.sisPreexam&&DATE.sisPreexam(G)) return {ok:true,decline:'preexam'}; if(id==='heroine_05'&&DATE.sisPrerank&&DATE.sisPrerank(G)) return {ok:true,decline:'prerank'}; return {ok:true}; };
  S.heartWhy=function(G,id,w){ if(typeof DATE==='undefined'||!DATE.log) return false; const Lx=L(); if(!Lx||!Lx.HEART[id]) return false;
    if(G.flags&&G.flags['dating_'+id]) return false;   /* C4：交往中＝女朋友的學期末約會 */
    { const h0=S.heart(id,w&&w.id); if(!h0||h0.invite==null) return false; }   /* SHE-FIRST-1110：台詞在 TERMEND_OPTS.HEART 的人（芷若、沛珊）沒載到那一份＝沒有邀約句，不發 */
    if(typeof ROM!=='undefined'&&ROM.canStart&&!ROM.canStart(G,id)) return false;   /* C8：分手以後還不能重新開始 */
    if(typeof V6EX!=='undefined'&&V6EX.noContact&&V6EX.noContact(G,id)) return false;   /* AA_600 S5（企劃線 031414cad）：以安、學姊是前任＝不發心意邀約、也不傳 NOPE 那一句；要復合只走祐廷主動的路（約會結尾告白、挽回）*/
    if(id==='kexin'&&G.flags&&G.flags.KX_ENDED==='drift') return false;   /* CANON-NO-ECON-1112 第四批（AA_895 第 2 節、AA_876）：和可昕「慢慢分開」以後，心意邀約不再有她 */
    if(typeof INV!=='undefined'&&INV.cool&&INV.cool(G,id)) return false;   /* 分開以後到下一個學期第 1 週：她不主動約（AA_434 4-3，V6EX.cool），心意邀約不發、那一句也不傳；你自己約她吃飯＝朋友的期末飯（S.playerInvite）*/
    if(id==='heroine_05'&&typeof SISB4!=='undefined'&&SISB4.brokeUp&&SISB4.brokeUp(G)) return false;   /* AA_386 第 4 節：分開過的學姊不發心意邀約（她的答應是第一次的台詞「你確定？」「我很難相處喔。」——AA_590 決3 前是「考試那時候就有一點了」，接不上）——重新開始照三件事（SIS_REBUILD）＋兩次正式校外約會，第二次那一趟的結尾告白（date3d.js）*/
    const c=S.cond(G,id);
    if(!c.ok){ if(c.why==='low'||c.why==='knows') return {nope:c.why}; if(c.why==='partner') return Lx.NOPE.partner&&Lx.NOPE.partner[id]?{nope:'partner'}:false; return false; }   /* 手機一句只給 C5 她自己有交往對象、C6 低潮、C10 她知道（含 5-3 第二欄沒到）；C1、C2 只是還沒到，不傳（BB_203 5-4，AA_254 第 9 節 8c76052b）*/
    if(c.decline==='preexam'||c.decline==='prerank') return false;   /* 學姊：放榜（2026-03-23）以前不發、也不傳（5-3 第一欄，AA_254 第 9 節刪了那一句）*/
    const D=typeof CONFESS_LINES!=='undefined'?CONFESS_LINES[id]:null; if(D&&typeof D.hideIf==='function'&&D.hideIf(G,null)) return false;   /* 沛珊重考期：聯絡不到，不傳 */
    return true; };
  S.friendOk=function(G,id,w){ if(G.flags&&G.flags['dating_'+id]) return false; const st=romStatus(G,id); if(st==='ended'||st==='friend_after_catch'||st==='paused') return false;
    if(typeof V6EX!=='undefined'&&V6EX.noContact&&V6EX.noContact(G,id)) return false;   /* AA_600 S5：前任的朋友邀約也不發 */
    if(typeof INV!=='undefined'&&INV.cool&&INV.cool(G,id)) return false;   /* 同上（AA_434 4-3）：分開以後這段期間她也不發朋友的邀約（不然心意邀約不發，她會改用朋友的邀約約你）*/
    if(id==='heroine_05'&&w.id==='Y1S1') return false;   /* 學姊筆試前不約（AA_250 10-2）*/
    if(id==='classmate_peishan'&&(w.id==='Y2S1'||w.id==='Y2S2')) return false;   /* 大二上說要重考以後不想見人、大二下聯絡不到（AA_250 第 3、4 節）*/
    if(id==='classmate_peishan'&&/^Y[34]/.test(w.id)) return false;   /* 大三起她在台南，不來臺北、也不來這一桌（AA_250 第 5 節 2026-10-20 AA-C 更正；AA_282）：朋友的邀約不發；心意的邀約、女朋友的學期末約會照 AA_282 第 5 節第 5 點在台南 */
    if(id==='heroine_02'&&w.id==='Y3S1') return false;   /* 芷若在英國（AA_250 第 5 節）*/
    if(id==='heroine_01'&&w.id==='Y3S2') return false;   /* 以安在日本（AA_250 第 6 節）*/
    if(id==='npc_fangyt'&&w.id==='Y4S1') return false;   /* 方奕廷大四上起在嘉義，不發期末飯邀約（AA_250 01029de1）*/
    const F=L().FRIEND[id]; if(!F) return false; if(w.id==='Y1S1'&&!F.y1s1) return false;
    if(typeof STORY!=='undefined'&&STORY.knows&&!STORY.knows(id,G)&&!(typeof SOCIAL!=='undefined'&&SOCIAL.has&&SOCIAL.has(id,'FIRST_MET'))) return false; return true; };
  /* 這段期間要晚一點才在的人（AA-C 12:29：學姊美國 2028-08-02～12-23，大四上的學期末 12/24 起可以約）*/
  S.FROM={Y4S1:{heroine_05:'2028-12-24'}};
  S.fromDay=(w,id)=>{ const k=S.FROM[w.id]&&S.FROM[w.id][id]; const d=k?DK(k):null; return d!=null&&d>w.from?d:w.from; };
  /* 這段期間不在台灣的人不約（AA_259 第 4 節第 5 點 cf864bff）：照人物的 presence（芷若大三上、大四在英國；以安大三下在日本）；在臺北、不在台大的（kind:'taipei'：子晴大四）照約；
     在臺灣的別的城市（kind:'city'：沛珊大三起在台南，AA_282 第 5 節第 5 點）照約，地點照那一學期的 over（台南她學校附近）；放榜後還沒重新聯絡上的（presence 的 lost，AA_282 第 2 節：她不先找人）不約 */
  S.away=function(G,w,id){ if(typeof STORY==='undefined'||!STORY.presence) return false; const d=S.fromDay(w,id), p=STORY.presence(id,Object.assign({},G,{day:d})); return !p.here&&(!!p.lost||(p.kind!=='taipei'&&p.kind!=='city')); };
  /* 玩家人在國外（交換路線；AA_250 第 6、7 節、AA_260 第 4 節第 6 點）：整段時段都在國外（日本路線大三下）＝臺灣這邊什麼都不發；中途回來（美國路線 12/23）＝回來的隔天起才發（AA_378 #12）*/
  S.backDay=function(G,w){ if(typeof STORY==='undefined'||!STORY.abroad) return w.from; for(let d=w.from;d<=w.to;d++) if(!STORY.abroad(Object.assign({},G,{day:d}))) return d===w.from?d:(d+1<=w.to?d+1:null); return null; };   /* 中途回來＝回來的隔天起（AA_378 #12，企劃線 5cd35678：美國路線 12/23 回國那晚只有阿凱的私訊，學期末時段從 12/24 開始——原本 12/23 當面又約一次宵夜）*/
  /* 期末邀約從玩家自己最後一科考完的隔天開始（AA_375 第 6 項）：時段第一天（第 16 週週四）以後還有期末考的＝最後一科的隔天（大二下：端午 6/9 停課，行政救濟補考 6/11（五）上午＝6/12 起）；
     最後一科在時段第一天以前或當天考完＝照時段第一天（那天晚上 20:30 已經考完）。考試照 CLS.examList（這學期修的、考五題的法律課，含補考那一堂）*/
  S.examStart=function(G,w){ if(typeof CLS==='undefined'||!CLS.examList) return w.from; let last=null; try{ for(const e of CLS.examList(G,w.id)) if(e.kind==='final'&&(last==null||e.day>last)) last=e.day; }catch(e){ return w.from; } return last!=null&&last>w.from?last+1:w.from; };
  /* AA_684 第 6 項（企劃線 0382b8a34，AA-C 定 D109）：語彤的心意邀約（HEART.heroine_03 的 examDay）在玩家最後一科考完的那一天 20:30 發（不是隔天）、晚餐排在那天以後的第一個週六——週五考完＝隔天週六。
     S.examDay＝最後一科考完的那一天（時段第一天以前或當天考完＝時段第一天）；S.heartFrom＝那一則邀約發的那一天（人在國外、中途回來的照回來那一天 S.backDay；不早於 S.fromDay）。
     沒寫 examDay 的照原本（P.back：最後一科考完的隔天）。S.dinnerDay 的「那天以後」也照 S.heartFrom 算。
     AA_687 第 5 項（企劃線 d41750385，AA-C 定 D109）：語彤的期末飯（朋友那一則，FRIEND.heroine_03 也寫 examDay）照同一個規則——最後一科考完的那天 20:30 發、那天以後的第一個週六 18:00（週五考完＝隔天週六：大二下 2027-06-12、大四上 2028-12-23）。
     朋友那一則照舊佔「只能接一個」的名額（不佔名額的只有心意那一則，S.plan 的 exempt 只看 HEART）*/
  S.examDay=function(G,w){ const s=S.examStart(G,w); return s>w.from?s-1:w.from; };
  S.heartFrom=function(G,w,id,spec){ const b=(S.rec(G,w.id).plan||{}).back||w.from; if(!(spec&&spec.examDay)) return Math.max(S.fromDay(w,id),b); const bd=S.backDay(G,w);
    return Math.max(S.fromDay(w,id),Math.min(b,Math.max(bd==null?b:bd,S.examDay(G,w)))); };
  S.plan=function(G,w){ const R=S.rec(G,w.id); if(R.plan) return R.plan; const Lx=L(); const bd0=S.backDay(G,w), bd=bd0==null?null:Math.max(bd0,S.examStart(G,w));   /* 玩家回來那天、最後一科考完的隔天，比較晚的那一天（AA_375 第 6 項）*/
    if(bd==null){ R.plan={heart:[],friend:[],fallback:null,gf:[],nope:{},kx:false,abroad:true,exempt:[]}; return R.plan; }   /* 日本路線的以安那一頓（AA_250 6-2）不算學期末的飯、不在這裡：6/9 她私訊約、6/10 出遊（src/jp3d.js 的 S.dinnerPhone，AA_355 1-1）*/
    const P={back:bd,heart:[],friend:[],fallback:null,gf:[],nope:{},exempt:[],kx:!!(G.flags&&G.flags.dating_kexin)&&!!(Lx.KX&&Lx.KX[w.id])&&!(w.id==='Y1S2'&&G.events&&G.events.done&&G.events.done.ev_revisit_y1_kexin)};   /* 可昕：舊存檔演過重訪日的算大一下已經演過（BB_202 第 6 節）*/
    for(const id of Object.keys(Lx.GF)) if(G.flags&&G.flags['dating_'+id]&&!S.away(G,w,id)) P.gf.push(id);   /* 交往中但人在國外（芷若大三上）：不發期末約會，照 BB_124 聖誕視訊（AA_259 第 5 節，等 BB）*/
    if(w.id===S.Y5.id){ R.plan=P; return P; }   /* 大五上：只有女朋友的學期末約會（可昕照 KX 那張表）；心意、朋友的邀約、保底都不發（AA_357 3-4）*/
    for(const id of Object.keys(Lx.HEART)){ if(S.away(G,w,id)) continue; const h=S.heartWhy(G,id,w); if(h===true) P.heart.push(id); else if(h&&h.nope) P.nope[id]=h.nope; }
    P.exempt=P.heart.filter(id=>!!(S.heart(id,w.id)||{}).examDay);   /* TE-HEART-EXEMPT-1104：不佔「只能接一個」名額的心意邀約（語彤，AA_684 第 6 項的 examDay）*/
    const taken=new Set(P.heart.concat(P.gf)), fam=id=>typeof SOCIAL!=='undefined'&&SOCIAL.rel?(+SOCIAL.rel(id).fam||0):0;
    const C=Object.keys(Lx.FRIEND).filter(id=>!taken.has(id)&&!S.away(G,w,id)&&S.friendOk(G,id,w)).map(id=>({id,c:S.score(G,w.id,id)})).sort((a,b)=>b.c-a.c||fam(b.id)-fam(a.id));
    P.friend=C.filter(x=>x.c>=6&&atLeast(x.id,'FAMILIAR')).slice(0,2).map(x=>x.id);
    if(!P.heart.length&&!P.friend.length){ const b=C.find(x=>x.c>0&&atLeast(x.id,'ACQUAINTANCE')); if(b) P.friend=[b.id]; else P.fallback='kai'; }   /* BB_203 第 1 節第 7 點 */
    R.plan=P; return P; };
  const resolve=(x,G,d)=>typeof x==='function'?x(G,d):x;   /* d：邀約傳的那一天（send 傳進來；AA_687 補 1881111f2 語彤大一下那一句看邀約那天在不在 6/18 以前）*/
  /* 她的心意邀約規格：HEART[id] 疊上那一學期的 over（沛珊大三起的地點、大四上的版本…）*/
  const overOf=(h,term)=>{ if(!h) return null; let o=h; for(const v of (h.over||[])) if(v.terms.includes(term)){ o=Object.assign({},o,v); delete o.terms; } return o; };
  /* SHE-FIRST-1110：TERMEND_OPTS.HEART[她]（「她先說」的告白：芷若、沛珊，台詞照企劃稿匯入）疊在 HEART[她] 上面當底，再疊那一學期的 over（地點、時間；大四下 postgrad3d.js 的那一版照舊蓋過去），
     最後疊稿上那一學期自己的版本（byTerm：沛珊大四上的 she／answer）。invite／invite2 寫成 {gen, byTerm} 的照學期挑；over 把它換成函式、那個函式沒有字的時候（r2y3b3d.js 芷若大三下的一般版）照底下這一句 */
  S.heart=function(id,term){ const Lx=L(), b=Lx&&Lx.HEART[id], T=TO(), x=b&&T&&T.HEART&&T.HEART[id]; if(!x) return overOf(b,term);
    const pick=v=>v&&typeof v==='object'&&!Array.isArray(v)&&('gen' in v)?((v.byTerm&&v.byTerm[term])||v.gen):v, base=Object.assign({},b,x), IK=['invite','invite2']; delete base.byTerm;
    for(const k of IK) base[k]=pick(x[k]);
    let o=overOf(base,term);
    for(const k of IK) if(typeof o[k]==='function'){ const f=o[k], d=base[k]; o=Object.assign({},o,{[k]:(G,dd)=>{ const r=f(G,dd); return r==null?d:r; }}); }
    if(x.byTerm&&x.byTerm[term]) o=Object.assign({},o,x.byTerm[term]); return o; };
  S.gf=function(id,term){ const Lx=L(), g=Lx&&Lx.GF[id], iv=g&&g.invByTerm&&g.invByTerm[term]; return overOf(iv!=null?Object.assign({},g,{invite:iv}):g,term); };   /* 女朋友的學期末約會也照學期換（沛珊大三起的地點）；邀約那一句照 invByTerm（AA_456 1-5：沒寫的學期照 invite，over 寫的照 over）*/
  S.friend=function(id,term){ const Lx=L(); return overOf(Lx&&Lx.FRIEND[id],term); };   /* 朋友的一對一邀約也照學期換（芷若大二下：她 6/3 以後不上班，不在 Café 打烊以後，AA_375 第 1 項）*/
  const lines=(x,G,d)=>{ x=resolve(x,G,d); return x==null?[]:(Array.isArray(x)?x:[x]); };
  /* 不發心意邀約的那一句、朋友邀約的婉拒照學期換（AA_260 (b-1) 第 5、6、11、14 項，AA_262 (b) 第 4 條）：NOPE[種類][她] 可以是字串（照舊）或 {gen, byTerm:{學期:句子}}；FRIEND[她].noByTerm 優先於 noBySem、no */
  S.nopeText=function(Lx,kind,id,term){ const v=(Lx&&Lx.NOPE&&Lx.NOPE[kind]||{})[id]; if(v&&typeof v==='object'&&!Array.isArray(v)) return (v.byTerm&&v.byTerm[term])||v.gen||null; return v; };
  S.friendNo=function(f,term){ if(!f) return null; const sem=String(term).slice(2); return (f.noByTerm&&f.noByTerm[term])||(f.noBySem&&f.noBySem[sem])||f.no; };
  /* ---- 手機（story3d.js 的 S.phoneRules 每次呼叫）---- */
  S.phone=function(GM){ const G=GM.G; if(!S.ON||typeof PHONE==='undefined'||!L()) return; S.hooks(); const w=S.window(G); if(!w) { S.pickCheck(GM); return; } const now=T(G.day,G.hour);
    if(now<T(w.from,0)) return; const P=S.plan(G,w), R=S.rec(G,w.id), Lx=L(); R.asks=R.asks||{};
    const until=T(w.to,18);
    const d1=P.back||w.from;   /* 玩家回來那天（不在國外＝時段第一天）*/
    for(const id in P.nope){ const t=S.nopeText(Lx,P.nope[id],id,w.id), tag='te_nope_'+w.id+'_'+id, mine=x=>!!(x&&x.who===id);   /* 時段的最後一天 20:00（BB_203 5-4）；這學期玩家已經約她吃過期末飯＝不傳；一學期一人一句 */
      if(t&&now>=T(w.to,20)&&!PHONE.sent(G,tag)&&!mine(R.picked)&&!mine(R.done)) PHONE.at(G,w.to,20,[{th:'p:'+id,from:id,text:t}],tag); }
    /* TE-FRI-SAME-NIGHT-1104（BB-C 2026-11-04 22:09）：週五考完的學期（大二下、大四上），語彤那一則（examDay）週五晚上就到、其他人原本隔天才到——玩家只看得到她一個人約，接了以後別人就不傳，等於遊戲替玩家選了人（理由同 TE-HEART-EXEMPT）。
       改成：她那一則比一般的邀約早到的時候（exD＜P.back），其他人的心意、朋友邀約也在她那一晚到、排在她那一則後面（照原本的先後）。
       TE-SAME-TIME-1104（BB-C 22:33 選①）：同一晚的期末邀約（心意、朋友）全部 20:30 一起到（原本一則隔 9 分鐘：手機打開時遊戲時間停住，玩家馬上回第一則就看不到後面的人）；
       週四、週五考完的學期都一樣。手機裡的順序照原本（先傳的在前：週五考完的學期她那一則先傳，fri 時分兩輪——先她、再其他人）。
       晚餐的日子照各自原本的排法（S.dinnerDay 的「那天以後」照舊從 P.back 算、S.genDay 避開她那一晚照舊，TE-HEART-AVOID）；當天才約的（sameDay，芯慈）、S.FROM 比那一晚晚的（學姊大四上 12/24）照原本；
       可昕、女朋友的學期末約會不在 send（不是「只能接一個」的邀約），不動。她這學期沒有 examDay 那一則（不在名單：交往中、沒約）＝照原本隔天。其他學期（最後一科在時段第一天以前或當天考完）本來就同一晚到，不動 */
    const exSp=(id,kind)=>{ const s=kind==='heart'?S.heart(id,w.id):S.friend(id,w.id); return s&&s.examDay&&!(kind==='heart'&&s.sameDay)?s:null; },
      exL=P.heart.map(id=>[id,'heart']).concat(P.friend.map(id=>[id,'friend'])).filter(x=>exSp(x[0],x[1])),
      exD=exL.length?Math.min.apply(null,exL.map(x=>S.heartFrom(G,w,x[0],exSp(x[0],x[1])))):null, fri=exD!=null&&exD<(P.back||w.from);
    let exPass=null; const send=(id,kind,txt,no)=>{ const tag='te_'+w.id+'_'+id, hs=kind==='heart'?S.heart(id,w.id):null, xs=hs||(kind==='friend'?S.friend(id,w.id):null), isEx=!!(xs&&xs.examDay); if(exPass!=null&&exPass!==isEx) return; const h=20.5; let d0=isEx?S.heartFrom(G,w,id,xs):Math.max(S.fromDay(w,id),P.back||w.from);   /* examDay：AA_684 第 6 項（語彤的心意邀約：最後一科考完的那天）；AA_687 第 5 項（企劃線 d41750385，AA-C 定 D109）：語彤的期末飯（朋友那一則，FRIEND 寫 examDay）也照這個規則發 */
      if(fri&&!isEx&&!(hs&&hs.sameDay)){ const df=Math.max(S.fromDay(w,id),exD); if(df===exD) d0=df; }   /* TE-FRI-SAME-NIGHT-1104：週五考完的學期，一般的邀約和她那一則同一晚到（S.FROM 比那一晚晚的照原本）；時間都是 20:30（TE-SAME-TIME-1104）*/
      const taken=kind==='heart'&&S.isExempt(G,w.id,id)?S.exBlocked(G,w.id,id):R.picked;   /* TE-HEART-EXEMPT-1104：不佔名額的那一則不看 R.picked（別人那一頓定了照樣傳；時間撞到的，傳到以後 S.exSweep 照「改天」回）；這學期已經和她本人約了期末的飯才不發 */
      /* 當天才約（HEART.sameDay，芯慈 AA_537b 第 7 節「考完了。今天晚上有空嗎。……我沒有提前一天。」）：先排好日子，那一天 12:00 傳、回覆到 17:30，飯就在那天（BB-B 10-31：原本時段第一天 20:30 傳、飯排在兩天後，「今天」不對）*/
      if(hs&&hs.sameDay){ const RH=R.heartDay||(R.heartDay={}); if(PHONE.sent(G,tag)||taken) return;
        const sdDay=()=>{ const r=S.genDay(G,w,Object.assign({},hs,{h:hs.h||18.5}),id); if(r.fb){ (R.avFb||(R.avFb={}))[id]=G.day; S.avInfo(G,w,'找不到別的晚上：當天才約的保留日照字面排',{who:id,ytEvening:dk(r.ye),day:dk(r.day)}); } return r.day; };   /* TE-HEART-AVOID-1104：保留日也避開語彤那一晚（她那一則到以後才排的；已經排好的不動）*/
        if(RH[id]==null){ if(now<T(d0,0)) return; const dd0=sdDay(); RH[id]=dd0==null?-1:dd0; }
        if(RH[id]>=0&&now>=T(RH[id],17.5)){ const d2=sdDay(); RH[id]=d2==null?-1:d2; }   /* 那天 12:00～17:30 手機規則都沒跑到（一直在劇情、出遊、上課、睡過）＝還沒傳就過了期限：不傳過期的，改排下一個能約的晚上（BB-B 10-31 疑點 1）*/
        const dd=RH[id]; if(dd<0||now<T(dd,12)) return; const T3=lines(txt,G); if(!T3.length) return;
        const ask={id:tag,until:T(dd,17.5),opts:[{t:'好。',set:{TE_PICK:w.id+'|'+id+'|'+kind}},{t:'那天有約了。',set:{TE_NO:w.id+'|'+id},say:no?[{from:id,text:no}]:[]}]};
        PHONE.at(G,dd,Math.min(Math.max(12,G.day===dd?(+G.hour||0):12),17),T3.map((t,i)=>Object.assign({th:'p:'+id,from:id,text:t},i===T3.length-1?{ask}:{})),tag); R.asks[id]=tag; return; }
      if(now<T(d0,h)||PHONE.sent(G,tag)||taken) return;   /* 已經接了一場（收到的或自己約的）就不再發 */ const T2=lines(txt,G,d0);
      const ask={id:tag,until,opts:[{t:'好。',set:{TE_PICK:w.id+'|'+id+'|'+kind}},{t:'那天有約了。',set:{TE_NO:w.id+'|'+id},say:no?[{from:id,text:no}]:[]}]};
      PHONE.at(G,d0,h,T2.map((t,i)=>Object.assign({th:'p:'+id,from:id,text:t},i===T2.length-1?{ask}:{})),tag); R.asks[id]=tag; };
    if(P.kx){ const K=Lx.KX[w.id], tag='te_kx_'+w.id; if(now>=T(d1,20.75)&&!PHONE.sent(G,tag)){ S.planKexin(G,w); const q=typeof OUT!=='undefined'?OUT.get(G,tag):null, dw=q&&q.state!=='cancelled'?S.dayWord(d1,q.day):''; PHONE.at(G,d1,20.75,K.invite.map(t=>({th:'p:kexin',from:'kexin',text:S.fillDay(t,dw)})),tag); } }   /* 可昕：她排好了，直接排出遊（不佔名額）；先排好日子、句子裡的 {哪天} 照那一天換（AA_460 第 5 節；排不到日子＝拿掉 {哪天}）*/
    /* 女朋友的學期末約會（AA_378 #3，企劃線 5cd35678；每個學期都一樣）：先排好日子（S.dinnerDay：玩家最後一科考完、回來以後，照她那一學期的星期），邀約在約會當天 12:00 傳、回覆期限當天 17:30；句子不改
       （原本時段第一天 20:15 傳、飯排在兩天後——「今天不讀書」「今天晚上我空著」說的「今天」都不對）。S.FROM 照舊：學姊大四上 12/23 才從美國回來（BUG-SIS-Y4S1-DATEINV-1021）*/
    { const RG=R.gfDay||(R.gfDay={});
      for(const id of P.gf){ const g=S.gf(id,w.id), tag='te_gf_'+w.id+'_'+id, dg=Math.max(S.fromDay(w,id),d1); if(PHONE.sent(G,tag)||now<T(dg,0)) continue;
        const pick=()=>{ const dd=S.dinnerDay(G,w,Object.assign({},g,{h:g.h||18.5,gf:true}),id); RG[id]=dd==null?-1:dd; S.gfOff(G,w,id); };
        if(RG[id]==null) pick();   /* gf：女朋友版（S.XMAS_GF 避開那一天、S.GF_FIXED 固定那一天）*/
        if(RG[id]>=0&&now>=T(RG[id],12)&&S.eveningBusy(G,RG[id])) pick();   /* 排好以後、邀約以前，那天晚上又有了別的出遊＝照同一套規則往後讓（不重複約在同一個晚上）*/
        const dd=RG[id]; if(dd<0) continue;
        if(g.inviteDayBefore!=null){ if(now<T(dd-1,g.inviteDayBefore)) continue; PHONE.at(G,dd-1,g.inviteDayBefore,[{th:'p:'+id,from:id,text:resolve(g.invite,G),ask:{id:tag,until:T(dd,17.5),opts:[{t:'好。',set:{TE_GF:w.id+'|'+id}}]}}],tag); continue; }   /* 提前一天約（芯慈，AA_537b 8-1：前一天 21:00）*/
        if(now<T(dd,12)) continue;
        const hAt=Math.min(Math.max(12,G.day===dd?(+G.hour||0):(G.day>dd?24:12)),23.5);   /* 等同一天那一場的結果才傳的（AA_464 第 7 節）：照真的傳出去的時間；那一場演到半夜＝記在當天 23:30（「今天」還是那一天；PHONE.tick 晚 15 分鐘以內會改記成現在）*/
        { const ago=g.tnVisited?S.tnVisited(G,id,dd):-1; if(ago==='wait') continue;   /* 同一天那一場（聖誕）排了、還沒演完：先不傳，等演完或沒去 */
          if(ago>=0){ const tv=resolve(g.tnVisited,G); PHONE.at(G,dd,ago===0?hAt:12,[{th:'p:'+id,from:id,text:Array.isArray(tv)?tv[Math.min(ago,tv.length-1)]:tv}],tag); continue; } }   /* 沛珊在台南：當天（演完）或前兩天內去找過她＝一句訊息（照幾天前換字）、不約（AA_462 第 4、8 節）*/
        PHONE.at(G,dd,hAt,[{th:'p:'+id,from:id,text:resolve(g.invite,G),ask:{id:tag,until:T(dd,17.5),opts:[{t:'好。',set:{TE_GF:w.id+'|'+id}}]}}],tag); } }   /* 同一天那一場沒去（不去了、過了時間）＝照平常約（18:30 的飯照排）*/
    const sends=()=>{
    for(const id of P.heart){ const h=S.heart(id,w.id), again=R.second&&R.second[id]!=null?R.second[id]:(S.rec(G).think[id]!=null); (R.second||(R.second={}))[id]=again; send(id,'heart',again?h.invite2:h.invite,h.decline); }
    for(const id of P.friend){ if(id==='zhe'&&w.id==='Y2S1'&&G.events&&G.events.done&&G.events.done.ev_term_last_meal_y2s1) continue;   /* AA_374 第 24 項：最後一科考完那天 17:00 阿哲約的「期末最後一頓」（麵店）演過了，20:30 他不再約期末飯（同一晚約兩次）*/
      const f=Lx.FRIEND[id], sem=String(w.id).slice(2); send(id,'friend',w.id==='Y1S1'?f.y1s1:((f.genByTerm&&f.genByTerm[w.id])||(f.genBySem&&f.genBySem[sem])||f.gen),S.friendNo(f,w.id));   /* 字在 send 裡照邀約那一天換（lines(txt,G,d0)；AA_687 補）*/ }   /* noByTerm：學姊大三下「好。我出發前再找你。」（AA_260 (b-1) 第 14 項）*/   /* genBySem／noBySem：上學期末（S1）、下學期末（S2）不同句（方奕廷，AA_369 L1）*/
    };   /* TE-SAME-TIME-1104：週五考完的學期先傳她那一則（exPass true）、再傳其他人（false），同一個時間照傳出去的先後排；其他學期一輪照原本的先後 */
    if(fri){ exPass=true; sends(); exPass=false; sends(); exPass=null; } else sends();
    S.pickCheck(GM); S.exSweep(G,w); };
  /* 約會那天（dd）或前兩天內（dd-2、dd-1）已經去她的城市找過她（AA_462 第 4 節：沛珊在台南，聖誕那天開車下去、隔天學期末又要「你下來」＝連兩天往返；
     第 8 節①、AA_464 4-2：同一天也算——12/24 聖誕開車下去、學期末的飯也排在 12/24）：
     她的節日那一場（fest3d.js 的出遊，當面、在台南）或「我去台南找妳？」（hometown3d.js 的 ev_hv_ps_tn）有去（OUT 的 state 'done'）。
     同一天的那一場只是排了不算（AA_464 第 7 節）：還沒演完（'planned'）＝'wait'（等演完再傳、沒去＝照平常約）；前一天、前兩天的已經演過了，照算。
     回傳幾天前（0＝同一天、1＝前一天、2＝前兩天；幾場都有取最近的）、'wait'，沒有＝-1 */
  S.tnVisited=(G,id,dd)=>{ if(typeof OUT==='undefined') return -1; let ago=-1, wait=false;
    for(const q of OUT.rec(G)){ if(!q||q.day<dd-2||q.day>dd) continue;
      if(!((!!q.fest&&q.fest.id===id&&q.fest.mode==='meet'&&q.place==='台南')||(q.ev==='ev_hv_ps_tn'&&!!q.hv&&q.hv.key===id+'@台南'))) continue;
      if(q.state==='planned'&&q.day===dd){ wait=true; continue; } if(q.state!=='done') continue;
      const a=dd-q.day; if(ago<0||a<ago) ago=a; }
    return ago>=0?ago:(wait?'wait':-1); };
  /* 接了一個：排出遊、其他的自動婉拒；女朋友的學期末約會另外排 */
  S.eveningBusy=(G,d)=>typeof OUT!=='undefined'&&OUT.rec(G).some(q=>q&&q.day===d&&(q.state==='planned'||q.state==='done')&&!/^te_/.test(q.id||'')&&q.h>=17);
  /* 那天晚上已經排了別人的期末飯（BB-B 10-31 疑點 2：芯慈當天約的心意飯 18:00 和子晴的期末宵夜 22:00 排在同一晚）：排好的出遊（te_ 開頭、te.who 不是她）、還沒傳的保留日（heartDay、gfDay）都算。
     eveningBusy 不算 te_ 是因為她自己那一頓排好以後不能把自己擋掉（line 144 的 pick）*/
  /* mode（TE-HEART-EXEMPT-1104）：'ex'＝排不佔名額的那一頓（語彤）：不看一般名額那一頓（te_<學期>）、當天才約的保留日（heartDay）——兩邊撞不撞照時間另外判斷（S.exSweep）；
     'nat'＝算一般邀約「本來會排在哪一天」：不看不佔名額的那一頓（te.ex）。沒給＝照原本（全部都看） */
  S.teBusy=function(G,w,d,who,mode){ const R=S.rec(G,w.id), reg='te_'+w.id; if(typeof OUT!=='undefined'&&OUT.rec(G).some(q=>q&&q.day===d&&q.state==='planned'&&/^te_/.test(q.id||'')&&q.te&&q.te.who!==who&&!(mode==='ex'&&q.id===reg)&&!(mode==='nat'&&q.te.ex))) return true;
    for(const m of [mode==='ex'?{}:(R.heartDay||{}),R.gfDay||{}]) for(const k in m) if(k!==who&&m[k]===d) return true; return false; };   /* AA_378 S4：那天晚上已經有別的出遊（例：12/23 20:30 接學姊的飛機）*/
  /* 女朋友版的學期末約會要避開的那一天（AA_386 第 3 節）：學姊交往中，大二上、大三上的 12/24 晚上是她約的聖誕（Café 門口、研究室；src/sis_b4_3d.js）*/
  S.XMAS_GF={heroine_05:{Y2S1:'2026-12-24',Y3S1:'2027-12-24'}};
  /* 女朋友版的學期末約會固定那一天（AA_386 3-3，企劃線 d0468be4）：學姊大四上 12/24 18:30（她 12/23 回來的隔天；兩條路線一樣）。其他人照 S.dinnerDay 的規則 */
  S.GF_FIXED={heroine_05:{Y4S1:'2028-12-24'}};
  /* 固定那一天沒排成（那天晚上有別的約、往後讓了）＝AA_386 3-3 備援：12/24 21:00 她私訊（sis_b4_3d.js SISB4.xm3Fallback；3-2 有來才有）*/
  S.gfOff=function(G,w,id){ const fx=S.GF_FIXED[id]&&S.GF_FIXED[id][w.id]?DK(S.GF_FIXED[id][w.id]):null; if(fx==null) return; const dd=S.rec(G,w.id).gfDay[id]; if(dd===fx) return;
    if(id==='heroine_05'&&w.id==='Y4S1'&&typeof SISB4!=='undefined'&&SISB4.xm3Fallback) SISB4.xm3Fallback(G); };
  S.dinnerDay=function(G,w,spec,who){ const hh=spec.h||18.5, xm=who==='kexin'&&w.id==='Y2S1'?DK('2026-12-25'):null, xg=spec.gf&&S.XMAS_GF[who]&&S.XMAS_GF[who][w.id]?DK(S.XMAS_GF[who][w.id]):null, ok=d=>d!==xm&&d!==xg&&!S.eveningBusy(G,d)&&!S.teBusy(G,w,d,who,spec&&spec.teMode)&&!(spec&&typeof spec.skip==='function'&&spec.skip(d))&&(d>G.day||(d===G.day&&G.hour<hh-0.5)), pb=spec&&spec.examDay?S.heartFrom(G,w,who,spec):((S.rec(G,w.id).plan||{}).back||w.from); let lo=Math.max(w.from+1,pb+1,G.day);   /* examDay：那天以後的第一個（AA_684 第 6 項；語彤朋友那一則同，AA_687 第 5 項）；skip：那一天不排（TE-HEART-AVOID-1104，S.genDay）*/
    if(who==='heroine_03'&&w.id==='Y1S2'){ const d=DK('2026-06-19'); if(d!=null) lo=Math.max(lo,d); }   /* 語彤 6/18 雙主修筆試以前不來（AA_250 第 2 節）*/   /* xm：可昕大二上的期末約會避開 12/25（那天晚上是她排的聖誕行程，AA_325 2-Y2-07）*/
    const c=CHARACTERS[who], hi=c&&c.presence&&c.presence.home?Math.min(w.to,w.termTo):w.to;   /* 寒暑假回老家的（可昕、沛珊，AA_276 第 3 節第 2 點）：限定在期末考最後一天後第 2 天以前，第 3 天她們就回老家了 */
    { const fx=spec.gf&&S.GF_FIXED[who]&&S.GF_FIXED[who][w.id]?DK(S.GF_FIXED[who][w.id]):null; if(fx!=null&&fx>=w.from&&fx<=hi&&ok(fx)) return fx; }   /* 固定那一天（那天晚上已經有別的約＝照下面的規則往後讓）*/
    if(spec.wd!=null){ for(let d=lo;d<=hi;d++){ const wd=CALENDAR.dateOf(d).wd%7; if(wd===spec.wd&&ok(d)) return d; } }
    for(let d=Math.max(lo,w.from+2,pb+2);d<=hi;d++) if(ok(d)) return d; for(let d=lo;d<=hi;d++) if(ok(d)) return d; return null; };
  /* 飯的時間（幾點）：朋友的照那一學期（hByTerm）、大一上以外的 hGen；其他照 h（沒寫＝18:30）。S.planDinner 和 S.askSlot 共用 */
  S.dinnerH=(term,kind,spec)=>(kind==='friend'&&spec.hByTerm&&spec.hByTerm[term]!=null)?spec.hByTerm[term]:((kind==='friend'&&spec.hGen&&term!=='Y1S1')?spec.hGen:(spec.h||18.5));
  /* o.ex（TE-HEART-EXEMPT-1104）：不佔名額的那一頓（語彤）——出遊 id 另外一個（S.exId，一般名額那一頓照舊 te_<學期>）、te.ex；日子照她自己的規則排、不看一般名額那一頓（teMode 'ex'），
     真的和已經定的一般那一頓撞到（不該發生：撞到的那一則已經照「改天」回了）＝照原本的規則往後讓 */
  S.planDinner=function(G,w,who,kind,o){ const ex=!!(o&&o.ex), Lx=L(), spec=kind==='heart'?S.heart(who,w.id):(kind==='gf'?S.gf(who,w.id):(kind==='fallback'?Lx.FALLBACK[who]:S.friend(who,w.id))); if(!spec||typeof OUT==='undefined') return false;
    const hh=S.dinnerH(w.id,kind,spec), gd=kind==='gf'?(S.rec(G,w.id).gfDay||{})[who]:(kind==='heart'&&spec.sameDay?(S.rec(G,w.id).heartDay||{})[who]:null);   /* 當天才約的心意邀約：飯就在傳訊息那天 */ let day;
    if(gd!=null&&gd>=0) day=gd;   /* gd：女朋友的約會先排好的那一天（AA_378 #3）*/
    else if(!ex&&(kind==='heart'||kind==='friend')&&S.exempts(G,w.id).length){ const r=S.genDay(G,w,Object.assign({},spec,{h:hh}),who,null,true); day=r.day;   /* TE-HEART-AVOID-1104：一般的那一頓避開語彤那一晚（S.genDay）*/
      if(r.fb){ const R=S.rec(G,w.id); (R.avFb||(R.avFb={}))[who]=G.day; S.avInfo(G,w,'找不到別的晚上：一般的那一頓照字面排',{who,kind,ytEvening:dk(r.ye),day:dk(day),h:hh}); } }   /* avFb：這一頓是找不到別的晚上才排的（之後撞到語彤那一則，S.exSweep 記的那一筆分得出來）*/
    else day=S.dinnerDay(G,w,Object.assign({},spec,{h:hh},kind==='gf'?{gf:true}:null,ex?{teMode:'ex'}:null),who);
    if(ex&&day!=null&&S.overlap(S.span(day,hh,spec.travelH||0.25,0.25),S.regSlot(G,w))) day=S.dinnerDay(G,w,Object.assign({},spec,{h:hh}),who);
    if(day==null) return false; const P=Lx.PLACE[spec.place]||{}, pname=spec.placeName||P.name||'';
    return OUT.plan(G,Object.assign({id:ex?S.exId(w.id,who):'te_'+(kind==='gf'?'gf_':'')+w.id+(kind==='gf'?'_'+who:''),ev:'ev_termend_dinner',day,h:hh,late:0.25,place:pname,title:'學期末的飯：'+nm(who)+(pname?'（'+pname+'）':''),travel:spec.travel||'走過去約 15 分鐘',travelH:spec.travelH||0.25,te:Object.assign({term:w.id,who,kind},ex?{ex:true}:null)},spec.back?{back:spec.back}:{})); };   /* travel／travelH／back：外縣市的那一版（沛珊大三起在台南：高鐵去、搭最後一班高鐵回臺北，AA_282 第 5 節第 5 點）*/
  /* {哪天}：約會那天跟傳訊息那天比——同一天「今天」、隔天「明天」、其他「禮拜幾」（AA_460 第 5 節）*/
  S.dayWord=function(d0,d){ if(d==null||typeof CALENDAR==='undefined') return ''; if(d===d0) return '今天'; if(d===d0+1) return '明天'; return '禮拜'+'日一二三四五六'[CALENDAR.dateOf(d).wd%7]; };
  S.fillDay=(t,w)=>typeof t==='string'?t.replace(/\{哪天\}\s?/g,w?w+' ':''):t;
  S.planKexin=function(G,w){ const Lx=L(), K=Lx.KX[w.id], PL=Lx.KX_PLACE[K.place]; if(!K||!PL||typeof OUT==='undefined') return false; const day=S.dinnerDay(G,w,{h:PL.h,wd:K.wd},'kexin'); if(day==null) return false;
    return OUT.plan(G,{id:'te_kx_'+w.id,ev:'ev_termend_dinner',day,h:PL.h,late:0.25,place:PL.name,title:'和可昕的學期末約會（'+PL.name+'）',travel:'開車約 40 分鐘',travelH:2/3,te:{term:w.id,who:'kexin',kind:'kexin'}}); };
  S.pickCheck=function(GM){ const G=GM.G, F=G.flags||{};
    if(typeof F.TE_GF==='string'){ const [term,who]=F.TE_GF.split('|'); delete F.TE_GF; const w=S.windowOf(term); if(w) S.planDinner(G,w,who,'gf'); }
    if(typeof F.TE_NO==='string'){ const [term,who]=F.TE_NO.split('|'); delete F.TE_NO; const R=S.rec(G,term); (R.no||(R.no={}))[who]=G.day; }
    if(typeof F.TE_PICK==='string'){ const [term,who,kind]=F.TE_PICK.split('|'); delete F.TE_PICK; const R=S.rec(G,term), w=S.windowOf(term); if(!w) return;
      if(kind==='heart'&&S.isExempt(G,term,who)){ if(!S.exBlocked(G,term,who)){ R.heartPick={who,kind,day:G.day}; S.planDinner(G,w,who,kind,{ex:true}); } }   /* TE-HEART-EXEMPT-1104：語彤那一則不佔名額（R.picked 不動、別人的邀約不自動婉拒；撞到時間的照「改天」，下面 S.exSweep）*/
      else { if(R.picked) return;
        R.picked={who,kind,day:G.day}; S.planDinner(G,w,who,kind);
        for(const id in (R.asks||{})){ if(id===who||S.isExempt(G,term,id)) continue; const tag=R.asks[id], m=PHONE.byAsk?PHONE.byAsk(G,tag):null; if(m&&PHONE.askOpen(G,m)) PHONE.answer(G,tag,1); } }   /* 只能接一個（BB_203 第 1 節第 3 點）；不佔名額的那一則不在這裡婉拒 */
      S.exSweep(G,w,true); } };
  /* ---- 保底：阿凱在宿舍當面「宵夜？」（時段裡、20:00 以後第一次在房間；一學期問一次）---- */
  S.kaiDue=function(G){ if(!S.ON||G.zone!=='dorm') return false; const w=S.window(G); if(!w) return false; const P=S.plan(G,w), R=S.rec(G,w.id); return P.fallback==='kai'&&!R.picked&&!R.kaiAsked&&G.day>=(P.back||w.from)&&G.hour>=20&&G.hour<24.5&&!S.eveningBusy(G,G.day); };   /* 那天晚上已經有別的出遊（例：12/23 20:30 接學姊的飛機）＝那晚不問，讓「出發」先問；隔天晚上再問（BUG-KAI-PICKUP-1022，BB 10-22 11:28；同 dinnerDay 的 eveningBusy）*/
  S.kaiAsk=async function(GM){ const G=GM.G, w=S.window(G); if(!w) return false; const R=S.rec(G,w.id), Lx=L(), K=Lx.FALLBACK.kai, me={name:nm('kai'),charId:'kai'}; R.kaiAsked=G.day; let k=1; GM.sceneBegin();
    try{ await GM.say(me,K.ask); k=await GM.choose([{t:'「好。」'},{t:'「那天有約了。」'}]); if(k!==0){ await GM.say(me,K.no); return false; } R.picked={who:'kai',kind:'fallback',day:G.day};
      await GM.fade(true); if(GM.titleCard) await GM.titleCard('學期末的飯：'+nm('kai')+'（公館宵夜）','走過去約 10 分鐘',2200); GM.advance(1/6); await GM.fade(false);
      await S.dinner(GM,{te:{term:w.id,who:'kai',kind:'fallback'}}); await GM.fade(true); GM.advance(1.5); if(typeof ADV!=='undefined'&&ADV.active&&ADV.end) ADV.end(); await GM.fade(false); if(GM.caption) GM.caption('','回到宿舍。',2200); }
    finally{ GM.sceneEnd(); } if(GM.autosave) GM.autosave(); return true; };
  /* ---- 飯（出遊事件 ev_termend_dinner 的 beforeOuting；保底阿凱直接叫）---- */
  S._chose=0;   /* 這一頓到現在出過幾組選項（話題池那一則自己有選項＝祐廷不再自動回「嗯。」）*/
  /* 這頓飯（含回家路上）她的戀愛合計最多 +2；告白那一晚 +3（FX-LOVE-CAP-1110；DATE.capMax）*/
  S._heart=null;   /* 現在演的是誰的心意的飯（告白那一晚＝上限 +3；TERMEND-OPTS-1110）*/
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['termend3d:_heart']=()=>{ S._heart=null; S._chose=0; };
  S.fxCap=(G,who)=>({cap:'termend:'+G.day,max:S._heart&&S._heart===who?((typeof SOCIAL!=='undefined'&&SOCIAL.FX_CAP_CONFESS)||3):(typeof DATE!=='undefined'&&DATE.capMax?DATE.capMax(G,who):2)});
  /* ---- TERMEND-OPTS-1110（使用者 X324：期末飯給玩家選項；AA_748、AA_749，台詞在 data/termend_opts.js＝TERMEND_OPTS，匯入工具 tools/story/import_termend_opts.py）----
     - 女朋友版（kind 'gf'）：TERMEND_OPTS.GF[她] 有那一頓（tableByTerm[學期]，沒寫的學期照 table）＝她說 says（照條件挑第一組）→ 選項（照 if 篩）→ 她的回答、fx → after（學姊大四上 SNOWQ 那一段、大二上她請的那一句）
       →（鉤子、lastByTerm 照舊）→ 收尾；**不再接朋友的話題池**（AA_749 規則第 1 條）、祐廷不自動回。TERMEND_OPTS 沒有這個人（芯慈）＝照 termend_lines.js 原本的一句＋話題池。沛珊＝AA_751 GF（PEISHAN-VOICE-1110；大三下的 nextMorning／alt 見 S.gfPrep）。
     - 心意的邀約（kind 'heart'）：飯桌那一句說完，TERMEND_OPTS.TABLE[她].after 有那一句＝接選項（學姊大四上換句的那一頓沒有）；回家路上「說出來」的三句照 TERMEND_OPTS.CONFESS[她]（S.confessOpts）。
     - 選項顯示的順序洗過（BB_314 第 1 節 #5：36 頓裡 29 頓 +2 排第一個）：種子＝那一天＋她＋哪一組，同一天、讀檔以後都一樣；效果跟著選項走。「說出來」的三句不洗（「（先不說）」照舊第四個）。
     - 可昕（kind 'kexin'，S.kexinDinner）：TERMEND_OPTS.KX[學期] 有＝table 換成 says＋選項＋then；KX_EXTRA 照舊（KX_ASK 見下面）。
     - fx 走共用上限（S.fxCap：一頓飯她的戀愛最多 +2，心意的飯＝告白那一晚 +3）。存檔沒有新欄位（只多旗標 YT_DINNER_YES）。
     - 朋友版（kind 'friend'、保底的 'fallback'；AA_749_termend_friend_v2_*，企劃線 5ffd725b8）：TERMEND_OPTS.FRIEND[學期][人] 有＝開場旁白（保底＝open）→ 她（他）說 says → 選項 → 回答、fx → then →（鉤子、收尾照舊）；
       **不抽話題池、祐廷不自動回「嗯。」**。沒有的人（稿沒寫的學期）照原本的話題池。沛珊的五頓（大一上、大一下、大三上～大四上）＝AA_751 friend_v2（PEISHAN-VOICE-1110）。{子晴學姊|一個學姊}＝照 Q6 二選一（S.alt）。
       條件：ZR_LAST／noZR_LAST（6/3 最後一個班去了沒，ev_zhiruo_last_shift）、noJP／noUS（EXCHANGE_ROUTE）、US4P（美國路線回來）。
     - 心意的飯不再抽朋友的話題池（AA 11-10；有朋友版稿的人。沛珊等重寫，照舊）。
     - 鉤子那一句和飯桌開場重複的＝不念 say、直接出選項（S.hookNoSay：稿上 hookNoSay 的——柏翰大三下；S.HOOK_NOSAY 列的——女朋友版以安大二上；鉤子的句子在這頓飯已經一字不差說過的）。
     - 可昕：有選項稿的學期，KX_ASK 的二選一不再接在後面（AA 11-10）；每個選項照稿的 set 記（企劃線 1cf434dee；匯入時換成 khh＝KX_KHH[那一次寒暑假]='yes'／'no'、y5＝KX_Y5_CALL='sat'，和原本二選一記的值一樣，下游 kx_khh3d.js 不用改；美國路線那一組不記）。沒有 TERMEND_OPTS.KX 的舊資料照原本。
     - 朋友版 thenIf｛if, lines｝：then 之後照條件多說的（學姊大三上 SIS_FU「……收到信那天，我打給你。」）。
     - 選項的 hook（子晴女朋友版 Q6 通用格、那一頓的 hookTerm＝大一下才算）：'skip'＝這頓的鉤子整個不出（選了「（現在玩。）」），'nosay'＝鉤子不念 say、直接出選項（AA 11-10）。*/
  const TO=()=>typeof TERMEND_OPTS!=='undefined'&&TERMEND_OPTS?TERMEND_OPTS:null;
  S.SHUFFLE=true;
  S.optIf=function(G,c,term){ if(!c) return true; const C=(L()&&L().COND)||{}, F=(G&&G.flags)||{}, f=k=>{ try{ return !!(C[k]&&C[k](G)); }catch(e){ return false; } };
    if(c==='Q6') return f('Q6'); if(c==='noQ6') return !f('Q6'); if(c==='SNOWQ') return f('SNOWQ'); if(c==='YOUPAY') return f('YOUPAY'); if(c==='noYOUPAY') return !f('YOUPAY');
    if(c==='C10') return f('C10'); if(c==='US') return f('US'); if(c==='noUS') return !f('US'); if(c==='SIS_FU') return f('SIS_FU');
    if(c==='US4P') return typeof STORY!=='undefined'&&!!STORY.routeAbroadRoute&&STORY.routeAbroadRoute(G)==='US';   /* termend_lines.js 的 US4P 同一個判斷 */
    if(c==='noJP') return F.EXCHANGE_ROUTE!=='JP';
    if(c==='ZR_LAST'||c==='noZR_LAST'){ const d=!!(G&&G.events&&G.events.done&&G.events.done.ev_zhiruo_last_shift); return c==='ZR_LAST'?d:!d; }   /* 芷若 6/3 最後一個班那天去了沒（AA_749 朋友版大二下）*/
    if(c==='YT_MET_JOB') return !!F.YT_MET_JOB; if(c==='summer') return /S2$/.test(String(term));
    if(c==='DELAYED') return delayedTE(G)||!!F.FAIL_DELAY;   /* 祐廷延畢（大五上還在學）：交換延畢、或大四下被當的延畢（同 postgrad3d.js S.delayed）。沛珊大四下 6/8 台南那一頓第一句（AA_751@768b9a131 GF.tableByTerm.Y4S2 的 note，2026-11-11）*/
    if(c==='sisGrad'||c==='sisPreGrad'){ const d=DK('2026-09-01'), g=d!=null&&G.day>=d; return c==='sisGrad'?g:!g; }   /* 學姊 2026-09 上法研所（AA_748 tableOpts 學姊的 note）*/
    if(/^term:/.test(c)) return c.slice(5)===term; return false; };
  S.shuffled=function(G,who,arr,salt){ const a=arr.slice(); if(!S.SHUFFLE||a.length<2) return a; let h=2166136261; const s=[G&&G.day,who,salt].join('|'); for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); }
    const rnd=()=>{ h|=0; h=h+0x6D2B79F5|0; let t=Math.imul(h^h>>>15,1|h); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };
    for(let i=a.length-1;i>0;i--){ const j=Math.floor(rnd()*(i+1)); const x=a[i]; a[i]=a[j]; a[j]=x; } return a; };
  S.optEntry=function(G,E,who,term,salt){ const ok=x=>S.optIf(G,x&&x.if,term), s=(E.says||[]).find(ok); return {say:s?s.say:[],opts:(E.opts||[]).filter(ok),shuffle:term+'|'+salt}; };
  S.gfEntry=function(who,term,spec){ const T=TO(), g=T&&T.GF&&T.GF[who]; if(!g) return null; if(g.tableByTerm&&g.tableByTerm[term]) return {E:g.tableByTerm[term],generic:false};
    if(spec&&spec.tableByTerm&&spec.tableByTerm[term]!=null) return null; return g.table?{E:g.table,generic:true}:null; };   /* 稿沒寫、遊戲有寫的學期＝照遊戲原本那一句 */
  /* 朋友版的一頓（TERMEND_OPTS.FRIEND[學期][人]）；{甲|乙}＝照 Q6 二選一（阿凱「子晴學姊／一個學姊」）*/
  S.frEntry=function(who,term){ const T=TO(), f=T&&T.FRIEND&&T.FRIEND[term]; return (f&&f[who])||null; };
  S.frHas=function(who){ const T=TO(), F=T&&T.FRIEND; return !!F&&Object.keys(F).some(t=>!!F[t][who]); };
  S.alt=function(G,E){ const s=JSON.stringify(E); if(s.indexOf('|')<0) return E; const q=S.optIf(G,'Q6'); return JSON.parse(s.replace(/\{([^{}|"]+)\|([^{}|"]+)\}/g,(m,a,b)=>q?a:b)); };
  const strs=x=>x==null?[]:(typeof x==='string'?[x]:(Array.isArray(x)?[].concat(...x.map(strs)):(typeof x==='object'?[].concat(...Object.keys(x).filter(k=>k==='say'||k==='says'||k==='re'||k==='then'||k==='opts'||k==='after').map(k=>strs(x[k]))):[])));
  S.HOOK_NOSAY={gf:{heroine_01:['Y2S1','Y2S2']}};   /* 女朋友版以安大二上：飯桌已經講了東京那兩個禮拜，鉤子「寒假我報了東京的冬季課。」不念（AA 11-10）；大二下：飯桌已經講了京都那三個禮拜，鉤子「八月去京都上語言課。」不念、直接出選項（AA 11-10 回 LAWWW）*/
  S._optHook=null;   /* 剛選的那個選項的 hook（'skip'／'nosay'）*/
  S._optPicked=null;   /* 剛選的那個選項（S._dinner 看它有沒有 nextMorning）*/
  /* ---- PEISHAN-VOICE-1110（AA_751 GF 大三下）：選項的 nextMorning／alt ----
     「那我留到明天。」＝這頓飯演完以後時間跳到隔天早上（換日不演，照兩天一夜約會的 STORY.travelOvernight），深色底＋地點字幕（where），演那幾行，「你搭中午的車回臺北」＝12:00 上車，出遊照原本收尾（再加兩小時回到臺北，不再寫「搭最後一班高鐵」）。
     隔天有不能錯過的事（S.morningFree：隔天有考試、已經排好的出遊／約會、已經答應或對方約了還沒回的邀約、寒暑假快轉的停點、人在國外）＝這個選項換成稿上的 alt（「下次我留到隔天。」），不過夜。
     存檔沒有新欄位（只動時間；那一筆出遊的 back 清掉）*/
  S.morningFree=function(GM,d){ const G=GM.G; try{
      if(typeof CLS!=='undefined'&&CLS.dayItems&&(CLS.dayItems(G,d)||[]).some(it=>it&&(it.exam||it.examMain))) return false;   /* 隔天自己有考試 */
      if(typeof OUT!=='undefined'&&OUT.rec&&OUT.rec(G).some(q=>q&&q.day===d&&q.state==='planned')) return false;   /* 排好的出遊（含別人的期末飯、接機…）*/
      if(typeof DATE!=='undefined'&&DATE.tripDays&&DATE.tripDays(G).has(d)) return false;   /* 約好的校外約會 */
      if(Array.isArray(G.invites)&&G.invites.some(iv=>iv&&iv.day===d&&!iv.done&&(iv.accepted||iv.state==='accepted'||iv.state==='offered'))) return false;   /* 答應了的、對方約了還沒回的邀約 */
      if(typeof HOME!=='undefined'&&HOME.breakNext){ const nx=HOME.breakNext(G,T(d,0)-1e-3); if(nx!=null&&nx<T(d,15)) return false; }   /* 有時限的事件（寒暑假快轉會停下來的那些）落在回到臺北以前 */
      if(typeof STORY!=='undefined'&&STORY.abroad&&STORY.abroad(Object.assign({},G,{day:d}))) return false;
      return true; }catch(e){ console.warn('TERMEND.morningFree',e); return false; } };   /* 查不了＝當作有事（不過夜）*/
  S.gfPrep=function(GM,E){ if(!E||!(E.opts||[]).some(o=>o&&o.nextMorning)) return E; const free=S.morningFree(GM,GM.G.day+1);
    return Object.assign({},E,{opts:E.opts.map(o=>o&&o.nextMorning&&!free&&o.alt?Object.assign({},o.alt):o)}); };
  S.nextMorning=async function(GM,q,who,nmx){ const G=GM.G, d=G.day+1, h=8;
    await GM.fade(true); if(typeof STORY!=='undefined'&&STORY.travelOvernight) STORY.travelOvernight(GM,d,h); else { G.day=d; G.weekday=((G.weekday|0)+1)%7; G.hour=h; }
    if(typeof ADV!=='undefined'&&ADV.begin) ADV.begin({background:'dark',right:{charId:who,expression:'neutral'}}); await GM.fade(false);
    if(nmx.where&&GM.caption) GM.caption('',nmx.where,2400);
    await run(GM,who,nmx.lines||[]);
    G.hour=12; if(GM.E) GM.E.hour=12; if(q&&q.back) q.back=null;   /* 中午的車：出遊收尾再加路上的時間、字幕照一般的「回到…」*/
    return true; };
  S.hookNoSay=function(G,term,who,kind,E){ if(!E) return false; if(E.hookNoSay) return true; if(((S.HOOK_NOSAY[kind]||{})[who]||[]).includes(term)) return true;
    const H=S.hookFor(G,term,who), hs=H?S.flat(lines(H.say,G),G):[], said=strs(E); return hs.length>0&&hs.every(t=>said.includes(t)); };
  /* 「說出來」的三句：TERMEND_OPTS.CONFESS[她]——照 if 篩；條件不合、寫了 orig 的那一格照原本第 orig 個選項；篩完不是三個＝照原本（後面的程式照第幾個選項算）*/
  S.confessOpts=function(G,who,term,say3){ const T=TO(), c=T&&T.CONFESS&&T.CONFESS[who]; if(!c||!Array.isArray(c.opts)) return null; const O=[];
    for(const o of c.opts){ if(S.optIf(G,o.if,term)) O.push(o); else if(o.orig!=null&&say3[o.orig]) O.push({t:say3[o.orig],yesLead:[]}); } return O.length===3?O:null; };
  const run=async(GM,who,arr)=>{ const G=GM.G, me={name:nm(who),charId:who}; for(let x of arr){ x=resolve(x,G); if(x==null) continue; if(Array.isArray(x)){ await run(GM,who,x); continue; }
      if(typeof x==='string') await GM.say(me,x); else if(x.cg!==undefined){ if(typeof ADV!=='undefined'&&ADV.cg) ADV.cg(x.cg); }   /* {cg:id}：這一刻換成 CG（沒登錄的圖＝不顯示，照立繪）*/ else if(x.narr) await GM.say(null,x.narr);
      else if(x.who==='narr') await GM.say(null,/^（/.test(x.text)?x.text:'（'+x.text+'）');   /* confess_lines.js 的寫法 */
      else if(x.who==='player') await GM.say({name:G.name||'祐廷'},x.text);
      else if(Array.isArray(x.choice)||Array.isArray(x.opts)){   /* {choice:[{t,say}]}：飯桌上的一組選項（AA_470 4-2）。DLG-FX-MECH-1110：也可以寫 {say?:[她先說的], opts:[{t, re|say, fx}]}——re＝她的回答（一句或陣列）、fx＝{fr, love}（SOCIAL.applyFx，算在這頓飯的對象身上）*/
        if(x.say!=null) await run(GM,who,[].concat(x.say)); const O=(x.opts||x.choice).filter(o=>o&&typeof o.t==='string'&&o.t.trim()&&(typeof o.if!=='function'||o.if(G)));   /* if 寫成字串的（TERMEND_OPTS）已經在 S.optEntry 篩過 */ if(!O.length) continue;
        const O2=x.shuffle?S.shuffled(G,who,O,x.shuffle):O, k=await GM.choose(O2.map(o=>({t:o.t}))), o=O2[k]||O2[0]; S._chose++; S._optHook=o.hook||null; S._optPicked=o; await run(GM,who,o.say!=null?[].concat(o.say):(o.re!=null?[].concat(o.re).map(t=>typeof t==='string'&&/^（.*）$/.test(t)?{narr:t}:t):[]));
        if(o.fx&&typeof SOCIAL!=='undefined'&&SOCIAL.applyFx) SOCIAL.applyFx(G,who,o.fx,S.fxCap(G,who)); if(o.set&&G.flags&&G.flags[o.set]==null) G.flags[o.set]=G.day; if(o.adv&&GM.advance) GM.advance(o.adv);
        if(Array.isArray(o.khh)&&G.flags){ const KH=G.flags.KX_KHH||(G.flags.KX_KHH={}); KH[o.khh[0]]=o.khh[1]; } if(o.y5&&G.flags) G.flags.KX_Y5_CALL=o.y5; }   /* khh、y5：可昕的選項照稿的 set 記（和原本 KX_ASK 二選一記的值一樣）*/   /* shuffle：顯示的順序洗過（S.shuffled）；adv：選了以後時間多走（AA_748 子晴「現在玩」+15 分鐘）*/
      else if(x.text) await GM.say(x.who&&x.who!==who?{name:nm(x.who),charId:x.who}:me,x.text,x.expr?{expr:x.expr}:undefined); } };
  /* 女朋友版那一學期自己的一頓（TERMEND_OPTS.GF[她].tableByTerm[學期]）：她說 → 選項 → 回答、fx。期末飯以外的地方演同一份稿用（2026-11-11，X327：沛珊大四下 6/8 台南那一頓，src/r2y4b3d.js R2Y4B.psDinner）；
     稿沒有那個學期（只有通用的 table）＝回 false，呼叫的地方照原本那一句 */
  S.gfTable=async function(GM,who,term,spec){ const ge=S.gfEntry(who,term,spec); if(!ge||ge.generic) return false; await run(GM,who,[S.optEntry(GM.G,S.gfPrep(GM,ge.E),who,term,'gf')]); return true; };
  S.dinner=async function(GM,q){ const G=GM.G, te=q&&q.te; if(!te) return false; const Lx=L(), who=te.who, kind=te.kind, R=S.rec(G,te.term);
    if(kind==='kexin') return S.kexinDinner(GM,te);
    S._heart=kind==='heart'?who:null; try{ return await S._dinner(GM,q); } finally{ S._heart=null; } };
  S._dinner=async function(GM,q){ const G=GM.G, te=q.te, Lx=L(), who=te.who, kind=te.kind, R=S.rec(G,te.term);
    const spec=kind==='heart'?S.heart(who,te.term):(kind==='gf'?S.gf(who,te.term):(kind==='fallback'?Lx.FALLBACK[who]:S.friend(who,te.term))); if(!spec) return false;
    const INV2TE={noodle:['noodle','noodle_closed'],teahouse:['tea_closed']}, other=!!te.place&&!(INV2TE[te.place]||[]).includes(spec.place);   /* 玩家自己約、選的店不是她那一家（AA_268 第 1 節）：開場收尾照選的那一家、不說飯桌一句。teahouse：AA_675 2-1 語彤的飯搬到一盞茶屋（tea_closed），玩家約她去一盞＝她那一家 */
    /* AA_686 第 2 項（企劃線 1df3c189e）：語彤的期末飯（朋友的邀約）改到溫州街的小路——舊存檔已經排好、出遊寫「公館燒臘」的那一頓＝照公館燒臘演（開場、收尾、背景跟排好的出遊一樣，不演到一半換店）*/
    const oldYt=!other&&kind==='friend'&&who==='heroine_03'&&spec.place==='teishoku'&&!!q&&!!Lx.PLACE.noodle&&q.place===Lx.PLACE.noodle.name;
    const P=other?(Lx.PLACE[(INV2TE[te.place]||[])[0]]||{name:te.placeName||'',open:'（'+(te.placeName||'')+'。）'}):(Lx.PLACE[oldYt?'noodle':spec.place]||{}); if(typeof ADV!=='undefined'&&ADV.begin) ADV.begin({background:P.bg&&typeof OUT!=='undefined'&&OUT.bg?OUT.bg(P.bg):'dark',right:{charId:who,expression:'neutral'}});
    if(P.caption&&GM.caption) GM.caption('',P.caption,2400);   /* 沒有底圖的地方：深色底＋地點字幕（台南，AA_282 第 5 節第 6 點）*/
    if(!other&&spec.fare&&GM.money) GM.money(-spec.fare,'交通');   /* 外縣市的那一版：高鐵來回（沛珊台南 2700，hometown_lines.js 同一個數字）*/
    /* 鉤子等一下要說的那一句，話題池裡有一字不差的＝話題池那一則不說（TE-HOOK-REPEAT-1110，AA audit_1110 termend D6：「你要不要來探班？」連說兩次；七個鉤子這樣）*/
    const hk=S.hookFor(G,te.term,who), hkSay=hk?S.flat(lines(hk.say,G),G):[];
    const pool=((Lx.POOL[te.term]||{})[who]||[]).map(x=>resolve(x,G)).filter(x=>x!=null&&!(typeof x==='string'&&hkSay.includes(x))), me={name:G.name||'祐廷'}; let ri=0;
    /* 話題池：她說一則、祐廷輪流回 REPLY（「嗯。」「真的假的。」「我也是。」）；那一則自己有選項（{say, opts}／{choice}）＝玩家選、不再自動回（DLG-FX-MECH-1110，AA_746 第 2 節第 4 點）*/
    const fe0=(kind==='friend'||kind==='fallback')?S.frEntry(who,te.term):null, fe=fe0?S.alt(G,fe0):null; let noSay=false, noHook=false, morning=null;   /* 朋友版有選項的那一頓：不抽話題池 */
    const friend1=async()=>{ await run(GM,who,[S.optEntry(G,fe,who,te.term,'friend')]); if(fe.then) await run(GM,who,fe.then); if(fe.thenIf&&S.optIf(G,fe.thenIf.if,te.term)) await run(GM,who,fe.thenIf.lines);   /* thenIf：選項演完以後照條件多說的（學姊大三上 SIS_FU）*/ noSay=S.hookNoSay(G,te.term,who,kind,fe); };
    const talk=async n=>{ for(let i=0;i<Math.min(n,pool.length);i++){ const c0=S._chose; await run(GM,who,[pool[i]]); if(i<Math.min(n,pool.length)-1&&S._chose===c0){ await GM.say(me,Lx.REPLY[(ri++)%Lx.REPLY.length]); } } };
    if(kind==='fallback'){ await run(GM,who,spec.open); if(fe) await friend1(); else await talk(2); await S.hook(GM,te.term,who,noSay); await run(GM,who,spec.close); }
    const bar=kind==='heart'&&!!spec.atBar&&!other;   /* SHE-FIRST-1110 芷若：整場在吧台（店還開著、她下班以後）——不念店的開場／收尾（那兩句是打烊以後），開場＝她飯桌的第一句旁白；告白在收尾以前、在店裡演，演完才是稿上的收尾旁白 closeAdd */
    if(kind!=='fallback'&&!bar) await GM.say(null,P.open||'（'+(other?P.name:(spec.placeName||P.name||''))+'。）');
    if(kind!=='fallback'){
      if(kind==='gf'){ const tb=spec.tableByTerm&&spec.tableByTerm[te.term], ge=S.gfEntry(who,te.term,spec);
        if(ge){ S._optHook=null; S._optPicked=null; await run(GM,who,[S.optEntry(G,S.gfPrep(GM,ge.E),who,te.term,'gf')]); const oh=ge.E.hookTerm===te.term?S._optHook:null; morning=(S._optPicked&&S._optPicked.nextMorning)||null;   /* nextMorning：沛珊大三下「那我留到明天。」（S.nextMorning，收尾以後演）*/   /* 選的那個選項怎麼接鉤子（子晴 Q6 通用格、大一下）*/   /* TERMEND-OPTS-1110：有選項的那一頓——不接話題池 */
          if(ge.generic&&spec.tableFlag&&G.flags[spec.tableFlag]==null) G.flags[spec.tableFlag]=G.day;
          const M=Lx.GF_MORE&&Lx.GF_MORE[who]&&Lx.GF_MORE[who][te.term]; if(M) await run(GM,who,lines(M,G));   /* 學姊大四上 XM3 兩句照舊接在選項後面 */
          let ai=0; for(const a of ge.E.after||[]){ ai++; if(S.optIf(G,a.if,te.term)) await run(GM,who,[S.optEntry(G,{says:[{say:a.say}],opts:a.opts||[]},who,te.term,'gf.after'+ai)]); }
          noSay=S.hookNoSay(G,te.term,who,'gf',ge.E)||oh==='nosay'; noHook=oh==='skip'; }
        else { await run(GM,who,lines(tb!=null?tb:spec.table,G)); if(tb==null&&spec.tableFlag&&G.flags[spec.tableFlag]==null) G.flags[spec.tableFlag]=G.day; await talk(2); } }   /* 飯桌一句每學期不一樣（AA_352）；沒寫的學期照 table。tableFlag：聽過 table 那一句（AA_524 Y1 語彤「我媽問你……」）*/
      else if(kind==='friend'&&spec.openByTerm&&spec.openByTerm[te.term]&&!(R.picked&&R.picked.by==='player')){ await run(GM,who,lines(spec.openByTerm[te.term],G)); if(fe) await friend1(); else await talk(3); }   /* 開場之後多一句（AA_524 A6 以安大一上「（她點了菜單上最便宜的那一個。）」）：她約的才有，玩家自己約的不演 */
      else if(kind==='heart'){ if(!S.frHas(who)) await talk(2);   /* 心意的飯不再抽朋友的話題池（AA 11-10）；沒有朋友版稿的人照舊 */ if(!other){ const tl=lines(spec.table,G); await run(GM,who,tl); const T=TO(), tt=T&&T.TABLE&&T.TABLE[who];
          if(Array.isArray(spec.tableOpts)&&spec.tableOpts.length) await run(GM,who,[S.optEntry(G,{opts:spec.tableOpts},who,te.term,'table')]);   /* SHE-FIRST-1110：她先說的那一份自己帶飯桌選項（芷若、沛珊）*/
          else if(tt&&tl.length===1&&typeof tl[0]==='string'&&(tt.after||[]).includes(tl[0])) await run(GM,who,[S.optEntry(G,{opts:tt.opts},who,te.term,'table')]); } }   /* TERMEND-OPTS-1110：飯桌那一句之後的選項（AA_748 tableOpts；那一句照稿的 after 才接）*/
      else if(fe) await friend1();
      else await talk(3);
      if(!noHook) await S.hook(GM,te.term,who,noSay);   /* 邀約鉤子（AA_250 10-1：話題之後、收尾之前）；noHook：選了「（現在玩。）」＝鉤子整個不出 */
      if(kind==='gf'&&spec.lastByTerm&&spec.lastByTerm[te.term]) await run(GM,who,lines(spec.lastByTerm[te.term],G));   /* 那一頓的最後（收尾之前；AA_470 4-2 學姊大四上）。約在哪一家都演（AA_490 第 2 節：句子沒提到店；原本玩家自己約別家＝other 不演）——lastByTerm 只放和店無關的句子 */
      const atTbl=kind==='heart'&&spec.againAtTable&&spec.closeAgain&&S.rec(G).think[who]!=null;   /* 以安第二次在桌邊演：收尾換一句，收盤子挪到「……勾了。」之後（AA 2026-11-02 20:57）*/
      const cl=atTbl?spec.closeAgain:(kind==='gf'&&P.closeGf?P.closeGf:P.close); if(cl&&!bar) await GM.say(null,cl); }   /* 學姊的女朋友版收尾（AA_250 10-1）*/
    if(te.ex) R.heartDone={who,kind,day:G.day}; else R.done={who,kind,day:G.day};   /* te.ex：不佔名額的那一頓（TE-HEART-EXEMPT-1104）吃完記 heartDone，一般名額的 done 不動 */
    if(morning) await S.nextMorning(GM,q,who,morning);
    if(kind==='heart') await S.walkHome(GM,who,te.term);
    if(bar&&spec.closeAdd) await GM.say(null,spec.closeAdd);   /* 芷若：告白演完以後的收尾旁白（AA_748 inviteNote）*/
    return true; };
  /* ---- 玩家自己約（BB_203 第 1 節第 13 點、AA_268）：期末時段裡用 invites 的「吃飯」約＝期末的飯。FAMILIAR 以上、在臺北照 invites 本來的條件；
     這學期已經接過一場（收到的或自己約的）＝照一般吃飯；關係結束、還不能重新開始（C8、C9）＝她婉拒；心意條件到齊＝心意的期末飯（飯後照她的回家路線）；女朋友＝期末約會（不佔名額）---- */
  S.playerInvite=function(G,id,P,W){ if(!S.ON||!P||P.kind!=='meal'||!W||(G.stage||'law')!=='law') return null; const w=S.window(Object.assign({},G,{day:W.day,hour:W.h})); const Lx=L(); if(!w||!Lx) return null;
    if(romStatus(G,id)==='ended'&&typeof ROM!=='undefined'&&ROM.canStart&&!ROM.canStart(G,id)) return Lx.ENDED[id]?{refuse:Lx.ENDED[id]}:null;
    if(G.flags&&G.flags['dating_'+id]) return Lx.GF[id]?{w,kind:'gf'}:null;
    if(w.id===S.Y5.id) return null;   /* 大五上只有女朋友的學期末約會（AA_357 3-4）：自己約別人吃飯照一般的吃飯 */
    const R=S.rec(G,w.id); if(R.picked||R.done) return null;
    { const X=R.heartPick||R.heartDone; if(X&&(X.who===id||S.overlap(S.exPlanned(G,w),S.span(W.day,W.h,0.25,0,P.stay||1)))) return null; }   /* TE-HEART-EXEMPT-1104：已經答應了語彤那一頓（不佔名額）——約她本人、或約的時間和那一頓撞到＝照一般的吃飯（原本答應她以後一律照一般的吃飯）*/
    if(S.heartWhy(G,id,w)===true){ if((S.heart(id,w.id)||{}).atBar) return null;   /* SHE-FIRST-1110 芷若：她的心意那一場在店裡吧台、她下班以後（寫在杯套上）——玩家自己約她去別的地方吃飯＝照一般的吃飯（不算期末飯、不佔名額），她那一則照常會傳 */ return {w,kind:'heart'}; }
    if(Lx.FRIEND[id]) return {w,kind:'friend'}; if(Lx.FALLBACK[id]) return {w,kind:'fallback'}; return null; };
  /* 玩家自己約了別人，還沒回的那一則替你回「這次我有約了，開學見。」＋她的婉拒句（TE_NO）——S.playerPicked 原本的那一條；不佔名額的那一則時間撞到也走這一條（S.teNo）*/
  const meNo=(G,term,id,m)=>{ const Lx=L(), R=S.rec(G,term), grad=term==='Y4S2', me=grad?Lx.AUTO_ME_GRAD:Lx.AUTO_ME, heart=(R.plan&&R.plan.heart)||[];
    const dly=grad&&typeof PG!=='undefined'&&(PG.exchDelayed||PG.delayed)&&(PG.exchDelayed||PG.delayed)(G)&&Lx.AUTO_NO_GRAD_DELAYED;   /* 交換延畢：「好。今天恭喜。」（AA_381 第 1 節）*/
    const reply=heart.includes(id)?((S.heart(id,term)||{}).decline):((grad&&((dly&&dly[id])||Lx.AUTO_NO_GRAD[id]))||Lx.AUTO_NO[id]);
    m.ask.opts.push({t:me,say:reply?[{from:id,text:resolve(reply,G)}]:[],set:{TE_NO:term+'|'+id}}); return !!PHONE.answer(G,m.ask.id,m.ask.opts.length-1); };
  S.playerPicked=function(G,iv){ const t=iv&&iv.te; if(!t||t.kind==='gf') return; const R=S.rec(G,t.term); R.picked={who:iv.who,kind:t.kind,day:G.day,by:'player'}; if(iv.id!=null) R.picked.iv=iv.id; if(typeof PHONE==='undefined') return;   /* iv：那一場邀約（S.regSlot 找時間用；舊存檔沒有＝照人找）*/
    for(const id in (R.asks||{})){ if(id===iv.who||S.isExempt(G,t.term,id)) continue; const tag=R.asks[id], m=PHONE.byAsk?PHONE.byAsk(G,tag):null; if(!m||!PHONE.askOpen(G,m)) continue; meNo(G,t.term,id,m); }   /* 不佔名額的那一則：時間撞到才回（S.exSweep）*/
    const w=S.windowOf(t.term); if(w) S.exSweep(G,w,true); };
  /* ---- TE-HEART-EXEMPT-1104（BB-C 2026-11-04 19:15，只改條件、不改台詞）：語彤的心意邀約（HEART 寫 examDay 的那一則，AA_684 第 6 項）不佔「只能接一個」的名額 ----
     - 誰不佔：這學期名單（S.plan）的 exempt＝P.heart 裡 HEART 寫 examDay 的人；舊版排的名單沒有 exempt 這一欄＝整學期照原本（只能接一個）。
     - 答應她：R.heartPick（R.picked 不動）、晚餐是另一場出遊 S.exId（te.ex），吃完記 R.heartDone（R.done 不動）；別人的邀約照常傳、照常可以接（一般的那一個名額照舊只能接一個）。
     - 撞到＝兩頓的時間重疊：每一頓從「約好的時間減路上的時間」到「約好的時間＋晚到的寬限（15 分鐘）＋出遊的時數（ev_termend_dinner 2 小時）」；玩家自己約的吃飯＝約好的時間減 15 分鐘到加那家店的 stay。
       已經定的那一頓照排好的時間；還沒回的那一則照「現在答應會排在哪一天幾點」，而且不看另一邊那一頓（看兩頓本來會不會撞：S.teBusy 的 mode 'ex'／'nat'）。
     - 撞到的時候先定的那一頓留下，另一邊還沒回的那一則照「改天」：她傳來的邀約＝自動回「那天有約了。」＋她原本的婉拒句（TE_NO，和原本「只能接一個」自動婉拒同一條）；
       玩家自己約了別人＝照 S.playerPicked 原本的「這次我有約了，開學見。」＋婉拒句。不扣任何數值。
     - 兩則都先讓玩家看到：沒撞到的不婉拒、也不再不發；後到的那一則照樣傳，傳到的當下（PHONE.tick 之後）才照「改天」回；手機上按「好。」的當下就處理（PHONE.ON_ANSWER），同一個手機畫面裡不會兩則撞到的都答應。*/
  S.exempts=(G,term)=>{ const P=G&&G.termend&&G.termend[term]&&G.termend[term].plan; return P&&Array.isArray(P.exempt)?P.exempt:[]; };
  S.isExempt=(G,term,id)=>S.exempts(G,term).includes(id);
  S.exBlocked=(G,term,id)=>{ const R=S.rec(G,term), me=x=>!!(x&&x.who===id); return !!R.heartPick||!!R.heartDone||me(R.picked)||me(R.done); };   /* 已經答應過她那一則、或這學期已經和她本人約了一般名額的那一頓（自己約她吃飯）＝不再發、答應也不算 */
  S.exId=(term,who)=>'te_ex_'+term+'_'+who;
  const DUR=()=>{ const e=typeof STORY_EVENTS!=='undefined'&&Array.isArray(STORY_EVENTS)?STORY_EVENTS.find(x=>x&&x.id==='ev_termend_dinner'):null; return (e&&e.hours)||2; };
  S.span=(day,h,tr,late,dur)=>day==null||h==null?null:{day,h,from:T(day,h)-(tr||0),to:T(day,h)+(late||0)+(dur==null?DUR():dur)};
  S.overlap=(a,b)=>!!(a&&b&&a.from<b.to&&b.from<a.to);
  const qSpan=q=>q&&(q.state==='planned'||q.state==='done')?S.span(q.day,q.h,q.travelH!=null?q.travelH:0.25,q.late!=null?q.late:0.25):null;
  S.exNatural=function(G,w,who){ const h=S.heart(who,w.id); if(!h) return null; const hh=S.dinnerH(w.id,'heart',h); return S.span(S.dinnerDay(G,w,Object.assign({},h,{h:hh,teMode:'ex'}),who),hh,h.travelH||0.25,0.25); };
  S.exPlanned=function(G,w){ const X=S.rec(G,w.id).heartPick; return X&&typeof OUT!=='undefined'?qSpan(OUT.get(G,S.exId(w.id,X.who))):null; };
  S.regSlot=function(G,w){ const p=S.rec(G,w.id).picked; if(!p) return null;
    if(p.by==='player'){ const iv=(G.invites||[]).find(x=>x&&x.te&&x.te.term===w.id&&(p.iv!=null?x.id===p.iv:x.who===p.who)&&(x.state==='accepted'||x.state==='going'||x.state==='done')); if(!iv) return null; const Q=typeof INV!=='undefined'&&INV.place?INV.place(iv.place):null; return S.span(iv.day,iv.h,0.25,0,(Q&&Q.stay)||1); }
    const q=typeof OUT!=='undefined'?OUT.get(G,'te_'+w.id):null; return q&&q.te&&q.te.who===p.who?qSpan(q):null; };   /* 阿凱當面的宵夜（保底）沒有出遊＝不算（那一學期也沒有語彤那一則）*/
  S.askKind=m=>{ const o=m&&m.ask&&(m.ask.opts||[]).find(x=>x&&x.set&&typeof x.set.TE_PICK==='string'); return o?o.set.TE_PICK.split('|')[2]||null:null; };
  /* ---- TE-HEART-AVOID-1104（BB-C 2026-11-04 20:17，只改條件、不改台詞）----
     1. 還沒回的一般邀約（不佔名額的那一則以外的心意、朋友的邀約）排日子時，避開語彤那一頓那一整晚（同一天的晚上都不排），往後排到別的晚上：
        S.genDay＝先照原本的規則、跳過語彤那一晚（S.exEvening）排；排一般那一頓（S.planDinner）、算還沒回的那一則會排在哪裡（S.askSlot，S.exSweep 看撞不撞）、當天才約的保留日（heartDay）都走這裡。
     2. 別人的邀約傳來的時間不動（避開她那一晚只動排飯的日子；後來 BB-C 22:09 TE-FRI-SAME-NIGHT-1104 週五考完的學期其他人和她同一晚到、22:33 TE-SAME-TIME-1104 同一晚的邀約全部 20:30 一起到）。找不到別的晚上（期末週的窗口排滿）＝照原本（照字面：時間撞到才互斥、自動婉拒，同 TE-HEART-EXEMPT），console.info 記一筆
        （「TE-HEART-AVOID 找不到別的晚上…」；CC 走的時候數有幾次。其他照字面互斥的情形記「TE-HEART-AVOID 照字面互斥…」，分開數）。
     3. 玩家自己約語彤＝佔一般名額（照原本）；4. 阿凱的保底照原本（kaiAsk 不經這裡）；6. 玩家自己約的吃飯和她那一頓撞到＝照邀約系統原本的做法（S.playerPicked），不改。
     5. 語彤那一晚＝她那一頓答應了（R.heartPick）＝排好的那一天；她那一則已經到了、還沒回＝現在答應會排在哪一天（S.exNatural）；還沒到、回了「那天有約了。」、過了期限＝沒有（不避開）。
        所以她那一則到以前玩家已經接了同一個週六的一般邀約（很少見）：兩頓時間不重疊＝兩頓都留（不婉拒）；重疊＝照字面（她那一則照「改天」）。
     舊存檔：這學期的名單沒有 exempt＝沒有這件事（照原本只能接一個）；已經排好的出遊不重排、已經回過的邀約不改。 */
  const dk=d=>d==null?null:(typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(d).key:d);
  S.exEvening=function(G,w){ const ex=S.exempts(G,w.id); if(!ex.length||typeof PHONE==='undefined'||!PHONE.byAsk) return null; const R=S.rec(G,w.id);
    if(R.heartPick){ const s=S.exPlanned(G,w); return s?s.day:null; }
    for(const id of ex){ const tag=(R.asks||{})[id], m=tag?PHONE.byAsk(G,tag):null; if(m&&PHONE.askOpen(G,m)){ const s=S.exNatural(G,w,id); if(s) return s.day; } }
    return null; };
  /* 一般那一頓排在哪一天：{day, ye（語彤那一晚）, fb（找不到別的晚上、照字面排的）}。mode＝S.teBusy 的 mode（S.askSlot 用 'nat'）；
     clash（S.planDinner）：照字面排的時候她那一頓已經答應了＝那一晚時間不撞到的才排（不會兩頓重疊；照理不會走到——撞到的那一則已經照「改天」回了）*/
  S.genDay=function(G,w,spec,who,mode,clash){ const hh=spec.h||18.5, ye=S.isExempt(G,w.id,who)?null:S.exEvening(G,w), base=Object.assign({},spec,mode?{teMode:mode}:null);
    if(ye==null) return {day:S.dinnerDay(G,w,base,who),ye:null,fb:false};
    const d=S.dinnerDay(G,w,Object.assign({},base,{skip:x=>x===ye}),who); if(d!=null) return {day:d,ye,fb:false};
    const xs=clash&&S.rec(G,w.id).heartPick?S.exPlanned(G,w):null;
    return {day:xs?S.dinnerDay(G,w,Object.assign({},base,{teMode:'nat',skip:x=>S.overlap(S.span(x,hh,spec.travelH||0.25,0.25),xs)}),who):S.dinnerDay(G,w,base,who),ye,fb:true}; };
  S.avInfo=function(G,w,what,o){ try{ if(typeof console!=='undefined'&&console.info) console.info('TE-HEART-AVOID '+what+' '+JSON.stringify(Object.assign({term:w&&w.id,at:dk(G.day)+' '+(+G.hour||0).toFixed(2)},o||{}))); }catch(e){} };
  S.askSlot=function(G,w,id,kind){ const spec=kind==='heart'?S.heart(id,w.id):(kind==='friend'?S.friend(id,w.id):null); if(!spec) return null; const hh=S.dinnerH(w.id,kind,spec), RH=S.rec(G,w.id).heartDay||{};
    if(kind==='heart'&&spec.sameDay) return S.span(RH[id]!=null&&RH[id]>=0?RH[id]:null,hh,spec.travelH||0.25,0.25);   /* 當天才約的（芯慈）：先排好的那一天 */
    const r=S.genDay(G,w,Object.assign({},spec,{h:hh}),id,'nat'), s=S.span(r.day,hh,spec.travelH||0.25,0.25); return s?Object.assign(s,{fb:r.fb}):null; };   /* TE-HEART-AVOID-1104：避開語彤那一晚；找不到別的晚上＝照字面（不看她那一頓，'nat'），fb */
  S.teNo=function(G,term,id,m,mine){ if(!m||!PHONE.askOpen(G,m)) return false; const k=mine?-1:(m.ask.opts||[]).findIndex(o=>o&&o.set&&typeof o.set.TE_NO==='string'); return k>=0?!!PHONE.answer(G,m.ask.id,k):meNo(G,term,id,m); };
  const swept=typeof WeakMap!=='undefined'?new WeakMap():null;   /* 手機規則每一格都叫：同一個時間、訊息沒變就不再算一次 */
  S.exSweep=function(G,w,force){ if(!G||!w||typeof PHONE==='undefined'||!PHONE.byAsk) return; const ex=S.exempts(G,w.id); if(!ex.length) return; const R=S.rec(G,w.id); if(!R.picked&&!R.heartPick) return;
    const key=[w.id,G.day,Math.floor((+G.hour||0)*4),(G.msgs||[]).length,R.picked?R.picked.who:'',R.heartPick?R.heartPick.who:''].join('|'); if(!force&&swept&&swept.get(G)===key) return; if(swept) swept.set(G,key);
    const A=R.asks||{}, open=id=>{ const m=A[id]?PHONE.byAsk(G,A[id]):null; return m&&PHONE.askOpen(G,m)?m:null; };
    if(R.picked){ const rs=S.regSlot(G,w); if(rs) for(const id of ex){ if(id===R.picked.who) continue; const m=open(id); if(m&&S.overlap(S.exNatural(G,w,id),rs)&&S.teNo(G,w.id,id,m,R.picked.by==='player')){   /* 一般的那一頓定了：她那一則和它撞到＝照「改天」（一般的那一頓就是約她本人＝不回，原本 S.playerPicked 也跳過她）*/
      const fb=!!(R.avFb&&R.avFb[R.picked.who]!=null);   /* TE-HEART-AVOID-1104：記一筆（一般那一頓是找不到別的晚上才排在她那一晚的、她那一則到以前已經接了、玩家自己約的）*/
      S.avInfo(G,w,fb?'語彤那一則照「改天」（一般那一頓找不到別的晚上、排在她那一晚，時間撞到）':'照字面互斥：語彤那一則照「改天」（'+(R.picked.by==='player'?'玩家自己約的吃飯':'她那一則到以前已經接了同一晚的一般邀約')+'，時間撞到）',{who:id,picked:R.picked.who,day:dk(rs.day)}); } } }
    if(R.heartPick){ const xs=S.exPlanned(G,w); if(xs) for(const id in A){ if(ex.includes(id)) continue; const m=open(id), k=m&&S.askKind(m); if(!k) continue; const sl=S.askSlot(G,w,id,k); if(S.overlap(sl,xs)&&S.teNo(G,w.id,id,m,false))   /* 她那一頓定了：還沒回的一般邀約和它撞到（避開她那一晚以後還是撞到＝找不到別的晚上）＝照「改天」*/
      S.avInfo(G,w,sl.fb?'找不到別的晚上：自動婉拒':'照字面互斥：自動婉拒',{who:id,kind:k,day:dk(sl.day),h:sl.h}); } } };
  /* 手機上按「好。」的當下就處理（手機開著、遊戲暫停也一樣：原本等手機收起來的下一格才處理，兩則都按得到「好。」）；新的邀約傳到的當下就看撞不撞（PHONE.tick 之後、自動打開手機之前）。只在這學期有不佔名額的那一則才做 */
  S.onAnswer=function(G,m,o){ const v=o&&o.set&&o.set.TE_PICK; if(typeof v!=='string'||!G||!S.exempts(G,v.split('|')[0]).length) return; S.pickCheck({G}); };
  S.afterTick=function(G){ if(!S.ON||!G||(G.stage||'law')!=='law') return; const w=S.window(G); if(w) S.exSweep(G,w,true); };
  S.hooks=function(){ if(typeof PHONE==='undefined') return;
    if(Array.isArray(PHONE.ON_ANSWER)&&!PHONE.ON_ANSWER._teEx){ PHONE.ON_ANSWER.push((G,m,o)=>{ try{ S.onAnswer(G,m,o); }catch(e){ console.warn('TERMEND.onAnswer',e); } }); PHONE.ON_ANSWER._teEx=true; }
    if(typeof PHONE.tick==='function'&&!PHONE.tick._teEx){ const t0=PHONE.tick; PHONE.tick=Object.assign(function(G){ const n=t0.apply(this,arguments); if(n){ try{ S.afterTick(G); }catch(e){ console.warn('TERMEND.afterTick',e); } } return n; },{_teEx:true}); } };
  /* ---- 邀約鉤子（AA_250 各學期 x-2、10-1）：飯裡她提一件假期的事，玩家接了就進行事曆；C14 事務所參觀、C15 朋友約的單日小事（AA_251）---- */
  const Dk=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const md=d=>{ const x=CALENDAR.dateOf(d); return x.m+'/'+x.d+'（'+'日一二三四五六'[x.wd%7]+'）'; };
  S.hookFor=function(G,term,who){ const Lx=L(); if(!Lx||!Lx.HOOK||!Lx.HOOK_NO) return null; const H=(Lx.HOOK[term]||{})[who]; if(!H) return null; try{ if(H.if&&!H.if(G)) return null; }catch(e){ return null; }
    const a=H.act||{};
    if(a.c14&&!(Lx.C14&&Lx.C14.msg&&S.c14Day(term)!=null)) return null;
    if(a.c15){ const c=Lx.C15[a.c15], d=c&&Dk(c.day); if(!c||!c.msg||d==null||d<=G.day||S.psPreC15(G,c,d)) return null; }
    if(a.vac){ if(typeof VAC==='undefined') return null; const [id,yk]=a.vac.split('@'), I=VAC.inst(id,yk); if(!I||VAC.enrolled(G,id,yk)||G.day>=I.from) return null; }
    if(a.flag&&G.flags&&G.flags[a.flag]!=null) return null;
    return H; };
  S.flat=function(x,G){ x=resolve(x,G); if(x==null) return []; if(typeof x==='string') return [x]; if(Array.isArray(x)) return [].concat(...x.map(y=>S.flat(y,G))); if(typeof x==='object'&&typeof x.text==='string'&&(!x.who||x.who!=='narr')) return [x.text]; return []; };
  S.hook=async function(GM,term,who,noSay){ const G=GM.G, H=S.hookFor(G,term,who); if(!H) return null; const Lx=L(), R=S.rec(G,term);
    if(!(noSay&&!H.noOpt)) await run(GM,who,lines(H.say,G));   /* noSay：飯桌已經講過這件事＝不念、直接出選項（沒有選項的鉤子照念）*/ if(H.noOpt){ if(H.then) await run(GM,who,lines(H.then,G)); R.hook={who,ok:false,noOpt:true}; return false; }   /* noOpt：她照樣說，不給接的選項（AA_389 第 2 點：沒有下文的鉤子）*/
    const k=await GM.choose([{t:resolve(H.ok,G)},{t:Lx.HOOK_NO}]); R.hook={who,ok:k===0};
    if(k===0&&H.after) await run(GM,who,lines(H.after,G));
    if(H.then) await run(GM,who,lines(H.then,G));   /* then：選不選都講（芷若大二上「放映完隔天，我就回台中了。」，AA_369 第 9 節第 1 題）*/
    if(k!==0) return false;
    const a=H.act||{};
    if(a.flag) G.flags[a.flag]=G.day;
    if(a.vac&&typeof VAC!=='undefined') VAC.signup(G,a.vac,'yes');
    if(a.c14) S.c14Plan(G,term);
    if(a.c15) S.c15Plan(G,a.c15);
    return true; };
  /* C14：那個假期第三週的週三上午 10:00（LAWWW 暫排；AA_199 7-6「寒假或暑假的平日上午」）；隔天 21:00 芯慈傳日子 */
  S.c14Day=function(term){ const r=typeof CALENDAR!=='undefined'&&CALENDAR.termDays?CALENDAR.termDays(term):null; if(!r) return null; for(let d=r.to+15;d<=r.to+21;d++) if(!CALENDAR.termOf(d)&&CALENDAR.dateOf(d).wd%7===3) return d; return null; };
  S.c14Plan=function(G,term){ const Lx=L(), C=Lx.C14, d=S.c14Day(term); if(!C||d==null||typeof OUT==='undefined') return false;
    if(typeof PHONE!=='undefined'&&C.msg) PHONE.at(G,G.day+1,21,[].concat(C.msg).map(t=>({th:'p:classmate_xinci',from:'classmate_xinci',text:t.replace('{日期}',md(d))})),'c14_msg_'+term);
    OUT.plan(G,{id:'c14_'+term,ev:'ev_te_day',day:d,h:10,late:0.25,place:C.place,title:'事務所參觀',travel:'捷運約 20 分鐘',travelH:1/3,ted:{day:'c14',term}}); return true; };
  /* AA_723（AA723-CONFESS-PS-1107）：沛珊 ps_class（2028-01-12 台中的國小）——交往中照舊；沒交往的線那天還在沉默期（2028-12-29 重聚以前，STORY.psPre）＝不播 */
  S.psPreC15=(G,C,d)=>!!C&&C.who==='classmate_peishan'&&typeof STORY!=='undefined'&&!!STORY.psPre&&STORY.psPre(Object.assign({},G,{day:d}));
  S.c15Plan=function(G,id){ const Lx=L(), C=Lx.C15[id], d=C&&Dk(C.day); if(!C||d==null||typeof OUT==='undefined'||S.psPreC15(G,C,d)) return false;
    if(typeof PHONE!=='undefined'&&C.msg) PHONE.at(G,G.day+1,21,[].concat(C.msg).map(t=>({th:'p:'+C.who,from:C.who,text:t.replace('{日期}',md(d))})),'c15_msg_'+id);
    OUT.plan(G,{id:'c15_'+id,ev:'ev_te_day',day:d,h:C.h,late:0.25,place:C.place,title:C.title||C.place,travel:C.travel||'約 20 分鐘',travelH:C.travelH||1/3,ted:{day:'c15',id}}); return true; };   /* title／travel：外縣市的那幾場（沛珊台中的國小，AA_276 第 3 節第 4 點）*/
  const scene=async(GM,bg,arr,opts)=>{ const G=GM.G; if(typeof ADV!=='undefined'&&ADV.begin) ADV.begin({background:bg&&typeof OUT!=='undefined'&&OUT.bg?OUT.bg(bg):'dark'});
    const say1=async x=>{ if(x.name) await GM.say({name:x.name},x.text); else await run(GM,x.who||null,[x]); };   /* 沒有人物資料的人（芯慈爸爸）用 name */
    for(const x of lines(arr,G)) await say1(x);
    const O=(opts||[]).filter(o=>!o.if||o.if(G)); if(O.length>1){ const k=await GM.choose(O.map(o=>({t:o.t}))); for(const x of (O[k]||O[0]).say||[]) await say1(x); } else if(O.length===1){ for(const x of O[0].say||[]) await say1(x); } };
  S.dayOuting=async function(GM,q){ const G=GM.G, t=q&&q.ted, Lx=L(); if(!t||!Lx) return false;
    if(t.day==='c14'){ const C=Lx.C14; await scene(GM,C.bg,C.open,C.opts); await scene(GM,C.bg,C.close); G.flags.C14_VISITED=G.day; return true; }
    if(t.day==='c15'){ const C=Lx.C15[t.id]; if(!C) return false; await scene(GM,C.bg,C.lines,C.opts); (G.flags.C15_DONE||(G.flags.C15_DONE={}))[t.id]=G.day; return true; }
    return false; };
  /* 沒去：C14＝芯慈下次見面一句；C15＝那天晚上 21:00 朋友私訊一張照片（AA_270 第 3 節；Alison 多益不傳）*/
  S.dayMissed=function(GM,q){ const G=GM.G, t=q&&q.ted, Lx=L(); if(!t||!Lx) return;
    if(t.day==='c14') G.flags.C14_MISSED=G.day;
    if(t.day==='c15'){ const C=Lx.C15[t.id]; if(C&&C.photo&&typeof PHONE!=='undefined') PHONE.at(G,q.day,21,C.photo.map(x=>({th:'p:'+C.who,from:C.who,text:x})),'c15_photo_'+t.id); } };
  S.meetLine=async function(GM,who,id){ const G=GM.G, F=G.flags||{}, Lx=L(); if(id!=='classmate_xinci'||F.C14_MISSED==null||F.C14_MISS_SAID||!Lx||!Lx.C14) return false; F.C14_MISS_SAID=G.day; for(const t of Lx.C14.miss) await GM.say(who,t); return true; };   /* who＝芯慈的名字（story3d.js talkCharacter）：有名字說的不在外面加「」（AA-B 2026-11-08，TEXT-QUOTE-UNIFY-1108 第三批）*/
  /* ---- 可昕的學期末約會：開場、（大一下）BB_167 4-3 那段／（之後）飯桌兩句、收尾 ---- */
  S.kexinDinner=async function(GM,te){ const G=GM.G, Lx=L(), K=Lx.KX[te.term], PL=K&&Lx.KX_PLACE[K.place]; if(!K||!PL) return false;
    if(typeof ADV!=='undefined'&&ADV.begin) ADV.begin({background:typeof OUT!=='undefined'&&OUT.bg?OUT.bg(PL.bg):'dark',right:{charId:'kexin',expression:'smile'}});
    await GM.say(null,PL.open);
    if(typeof FAV!=='undefined'&&FAV.kexinDate) await FAV.kexinDate(GM,te,{name:nm('kexin'),charId:'kexin'});   /* 帶給她的那一杯（巷口茶飲，src/foodfav3d.js，AA_410）：開頭、她的第一句之前 */
    const XA=(Lx.KX_EXTRA&&Lx.KX_EXTRA[te.term])||{}; if(XA.open) await run(GM,'kexin',lines(XA.open,G));   /* AA_525 3-10：飯桌一開始（美國路線大四上「第一碗。說好我請。」）*/
    if(K.first){ const ev=typeof STORY_EVENTS!=='undefined'?STORY_EVENTS.find(e=>e.id==='ev_revisit_y1_kexin'):null; if(ev&&typeof EVENTS!=='undefined'&&EVENTS.runLines) await EVENTS.runLines(ev.dialogue,ev); if(ev&&typeof ev.after==='function') ev.after(G); }   /* BB_167 4-3：八段回憶挑一段（REVISIT_Y1 照記，大四主線 10 讀）*/
    else { const kt=TO()&&TO().KX&&TO().KX[te.term];   /* TERMEND-OPTS-1110：可昕那一頓的選項（AA_749_termend_kx_v2）*/
      if(kt){ await run(GM,'kexin',[S.optEntry(G,kt,'kexin',te.term,'kx')]); if(kt.then) await run(GM,'kexin',kt.then); } else await run(GM,'kexin',lines(K.table,G));
      const A0=kt?null:(Lx.KX_ASK&&Lx.KX_ASK[te.term]), A=typeof A0==='function'?A0(G):A0;   /* 有選項稿的學期不再接 KX_ASK（AA 11-10）；KX_KHH、KX_Y5_CALL 由選項的 khh、y5 記（稿上的 set）*/   /* AA_401：table 兩句後面的二選一 */
      if(Array.isArray(A)&&A.length&&GM.choose){ const k=await GM.choose(A.map(o=>({t:o.t}))), o=A[k]||A[0]; await run(GM,'kexin',o.r);
        if(o.khh){ const KH=G.flags.KX_KHH||(G.flags.KX_KHH={}); KH[o.khh[0]]=o.khh[1]; } if(o.y5) G.flags.KX_Y5_CALL=o.y5; } }
    if(XA.end) await run(GM,'kexin',lines(XA.end,G));   /* AA_525 3-1、3-2：飯桌最後（大三上聖誕的禮物、第二頁；美國路線大四上的摩天輪）*/
    await GM.say(null,PL.close); (G.flags.KX_TERMEND||(G.flags.KX_TERMEND={}))[te.term]=G.day; S.rec(G,te.term).kx=G.day; return true; };
  S.missed=function(GM,q){ const G=GM.G, te=q&&q.te; if(!te||te.kind!=='kexin'||typeof PHONE==='undefined') return; const Lx=L(), K=Lx.KX[te.term], PL=K&&Lx.KX_PLACE[K.place]; if(!PL) return;
    PHONE.at(G,G.day,Math.max(G.hour,q.h+0.75),PL.miss.map(t=>({th:'p:kexin',from:'kexin',text:t})),'te_kx_miss_'+te.term); };   /* 沒去：她傳「我在河堤（正門）等了一下」「你還好嗎」（AA_250 9-2）*/
  /* ---- 回家的路上（AA_254 第 0 節）---- */
  /* againAtTable（以安，AA＋BB 2026-11-02 20:55）：第二次（上次選了「讓我想想」）在店裡、兩人還沒起身的時候演（CG-27 的圖是桌邊）——背景＝那家店、不演走出店門那兩句，演完才「（走出店門…）」；第一次照舊在巷子（CG-11 是巷子路燈下）*/
  S.walkHome=async function(GM,who,term){ const G=GM.G, h=S.heart(who,term), Rt=S.rec(G); const atTable=!!(h&&h.againAtTable&&Rt.think[who]!=null);
    const r=await S._walkHome(GM,who,term,atTable); if(atTable&&h.afterTable) await run(GM,who,h.afterTable); return r; };
  /* ---- SHE-FIRST-1110「她先說」的告白（LAWWW 2026-11-10 23:26；芷若 AA_748、沛珊 AA_751，台詞在 TERMEND_OPTS.HEART[她]）----
     她先告白（she）→ 直接出 confessOpts 的幾個回應（照稿的順序、不洗）→ result 'yes'＝演那個選項的 yesLead 再接 yes，交往（照原本答應的那一條：ROM.start、OPEN_OK、confessed；回傳 'sheSaid'）；
     'think'＝演那個選項的 re（她的回話），這學期不交往、記 think[她]＝這學期，下學期她用 invite2 再約。後面**沒有**「好。／讓我想想。」那一組。
     - 沛珊：回家路上 walk → walkOpts（三個入口都接到 guess）→ guess（say＋三個選項；選的那個有 sheFrom＝she 從那一句開始，前面的旁白照演、前面她說的不重講）→ she → confessOpts。
       大四上（byTerm.Y4S1：she 換、answer 兩個選項）：walk → she → answer（第一個＝答應接 yes、第二個＝想一下，稿沒有寫她這時候回什麼＝不說話）。
     - 芷若（atBar）：不走路，背景照店裡；she（杯套）→ confessOpts。
     - 第二次（think[她] 有記）：walk（有的話）→ she2 → 稿沒有寫第二次祐廷的選項＝照共用的 ANSWER「好。／讓我想想。」→ 好＝yes2、交往；讓我想想＝confessOpts 裡 think 那個選項的 re，再記一次 think。
     - 選項的 fx 走這頓飯的上限（S.fxCap；告白那一晚 +3）。存檔沒有新欄位（result、think 照原本的值）。
     玩家先說的原本流程（其他人，下面 S._walkHome）不動 */
  S.sheFirst=async function(GM,who,term,h){ const G=GM.G, Lx=L(), R=S.rec(G,term), Rt=S.rec(G), again=Rt.think[who]!=null;
    const bg=h.atBar?((Lx.PLACE[h.place]||{}).bg||null):h.walkBg;
    if(typeof ADV!=='undefined'&&ADV.begin) ADV.begin({background:bg&&typeof OUT!=='undefined'&&OUT.bg?OUT.bg(bg):'dark',right:{charId:who,expression:'neutral'}});
    if(!h.atBar&&h.walkCaption&&GM.caption) GM.caption('',h.walkCaption,2400);
    const fxOf=o=>{ if(o&&o.fx&&typeof SOCIAL!=='undefined'&&SOCIAL.applyFx) SOCIAL.applyFx(G,who,o.fx,S.fxCap(G,who)); };
    const pick=async O=>{ const k=await GM.choose(O.map(o=>({t:o.t}))); S._chose++; return O[k]||O[0]; };
    const start=()=>{ const K=S.knownOthers(G,who); const ok=typeof ROM!=='undefined'&&ROM.start?ROM.start(G,who):((G.flags['dating_'+who]=true),true); if(ok&&K.length){ const O=G.flags.OPEN_OK||(G.flags.OPEN_OK={}), M=O[who]||(O[who]={}); for(const y of K) M[y]=true; } return ok; };
    const yesEnd=async(lead,yes)=>{ if(!start()) return 'blocked'; if(lead&&lead.length) await run(GM,who,lead); await run(GM,who,yes||[]); (G.flags.confessed||(G.flags.confessed={}))[who]=G.day; delete Rt.think[who]; R.result='sheSaid'; return 'sheSaid'; };
    const thinkEnd=async re=>{ if(re&&re.length) await run(GM,who,re); Rt.think[who]=term; R.result='think'; return 'think'; };
    const CO=Array.isArray(h.confessOpts)?h.confessOpts:[], tk=CO.find(o=>o.result==='think');
    if(!h.atBar&&h.walk) await run(GM,who,h.walk);
    if(again){ await run(GM,who,h.she2||h.she); const a=await GM.choose(Lx.ANSWER.map(t=>({t}))); S._chose++; return a===0?yesEnd(null,h.yes2||h.yes):thinkEnd(tk&&tk.re); }
    if(Array.isArray(h.answer)){ await run(GM,who,h.she); const a=await GM.choose(h.answer.map(t=>({t}))); S._chose++; return a===0?yesEnd(null,h.yes):thinkEnd(null); }
    let she=h.she||[];
    if(Array.isArray(h.walkOpts)&&h.walkOpts.length){ const o=await pick(h.walkOpts); await run(GM,who,[].concat(o.re||[])); fxOf(o); }
    if(h.guess){ await run(GM,who,h.guess.say||[]); const o=await pick(h.guess.opts); await run(GM,who,[].concat(o.re||[])); fxOf(o);
      if(o.sheFrom){ const i=she.indexOf(o.sheFrom); if(i>=0) she=she.filter((x,k)=>k>=i||typeof x!=='string'); } }
    await run(GM,who,she);
    if(!CO.length){ R.result='silent'; return 'silent'; }
    const o=await pick(CO); fxOf(o);
    return o.result==='yes'?yesEnd(o.yesLead,h.yes):thinkEnd(o.re); };
  S._walkHome=async function(GM,who,term,atTable){ const G=GM.G, Lx=L(), h=S.heart(who,term), R=S.rec(G,term), Rt=S.rec(G); if(!h) return null;
    if(h.mode==='sheFirst') return S.sheFirst(GM,who,term,h);
    const tbg=atTable?((Lx.PLACE[h.place]||{}).bg||null):h.walkBg;
    if(typeof ADV!=='undefined'&&ADV.begin) ADV.begin({background:tbg&&typeof OUT!=='undefined'&&OUT.bg?OUT.bg(tbg):'dark',right:{charId:who,expression:'neutral'}});
    if(!atTable&&h.walkCaption&&GM.caption) GM.caption('',h.walkCaption,2400);   /* 沒有底圖的那一段路：深色底＋字幕（沛珊大三起：台南・往她租的地方；芯慈：羅斯福路・往公館站）。walkPlace 是企劃的欄位、不出字幕（飯換到別的地方時會對不上：沛珊大四下在台南）*/
    if(!atTable) await run(GM,who,Rt.think[who]!=null&&h.walkAgain?h.walkAgain:h.walk);   /* walkAgain：第二次（上次選了「讓我想想」）回家路上換的句子（芯慈 AA_537b 8-5）*/
    const D=typeof CONFESS_LINES!=='undefined'?CONFESS_LINES[who]:null;
    const say3=h.optsFrom==='confess'&&D&&D.choice?resolve(D.choice,G).map(q=>q.t):Lx.OPTS(h.buddy);
    /* 芯慈（AA_548 第 7 節，h.tellOpt）：交往中、她不知道＝多一個選項「（先告訴她，你在跟誰交往）」，說完再選一次（不再出那一個）；她之前就知道＝答應的時候多一句 */
    const XC_=typeof XCROM!=='undefined'?XCROM:null, knewBefore=!!(h.tellOpt&&XC_&&XC_.othersDating(G).length&&!XC_.hidden(G).length);
    const tellMaybe=async(opts)=>{ for(;;){ const told=!!(h.tellOpt&&XC_&&XC_.hidden(G).length); const k0=await GM.choose(opts.concat(told?[XC_.TELL_OPT]:[]).map(t=>({t}))); if(!(told&&k0===opts.length)) return k0; await run(GM,who,XC_.TELL_LINES); XC_.tell(G); } };
    const knownLine=async()=>{ if(knewBefore&&XC_.KNOWN_LINE) await run(GM,who,[XC_.KNOWN_LINE]); };
    const CO=S.confessOpts(G,who,term,say3);   /* TERMEND-OPTS-1110：每個人自己的三句（AA_748 confessOpts）；第幾個選項的意義不變 */
    const k=await tellMaybe((CO?CO.map(o=>o.t):say3).concat([Lx.NOT_YET_OPT]));
    if(k<3&&CO&&CO[k]&&CO[k].fx&&typeof SOCIAL!=='undefined'&&SOCIAL.applyFx) SOCIAL.applyFx(G,who,CO[k].fx,S.fxCap(G,who));
    const start=()=>{ const K=S.knownOthers(G,who); const ok=typeof ROM!=='undefined'&&ROM.start?ROM.start(G,who):((G.flags['dating_'+who]=true),true); if(ok&&K.length){ const O=G.flags.OPEN_OK||(G.flags.OPEN_OK={}), M=O[who]||(O[who]={}); for(const y of K) M[y]=true; } return ok; };   /* 知情還發的邀約，答應＝她同意祐廷同時和那些人交往（OPEN_OK，BB_194 §6）*/
    const again=Rt.think[who]!=null;   /* 第二次（上次選了「讓我想想」）*/
    /* 她先問「你現在有在跟誰交往嗎。」（芯慈，AA_537b 第 7 節）：有別的交往對象＝接 others 後兩行、不交往（這學期的告白結束）；沒有＝祐廷自動「沒有。」*/
    const me={name:G.name||'祐廷'}, others=()=>typeof XCROM!=='undefined'&&XCROM.othersNow?XCROM.othersNow(G,who):[];
    const afterAsk=async()=>{ if(typeof XCROM!=='undefined'&&XCROM.asked) XCROM.asked(G); if(others().length){ await run(GM,who,h.othersTail||[]); R.result='others'; return false; } await GM.say(me,h.noOther||'沒有。'); return true; };
    if(k<3&&h.askFirst){ await run(GM,who,[h.askFirst]); if(!await afterAsk()) return 'others'; }
    if(k<3){ const cf=typeof CF723!=='undefined'&&CF723.termDecide?await CF723.termDecide(GM,who,run):null;   /* AA_723（告白第一次失敗、再約幾次還能告白）：第一次看她的 heart＝yes／fail（演了 fail）；失敗過、她說過 ready 或條件到了＝second（演了 second，接著照原本答應）；null＝照原本 */
      if(cf==='fail'||cf==='pending'){ R.result=cf==='fail'?'fail723':'pending723'; return R.result; }
      if(!cf&&h.decideYes&&typeof DATE!=='undefined'&&DATE.confessDecide&&DATE.confessDecide(G,who)!=='yes'){ await run(GM,who,D&&D.notYet||[]); if(D&&D.notYetFlag) G.flags[D.notYetFlag]={day:G.day,term}; Rt.think[who]=term; R.result='notYet'; return 'notYet'; } }   /* 玩家先說：她的戀愛到 YES_LINE（75）才答應，沒到＝「我還沒想好……」（AA_537 第 4 節 notYet），下學期她用第二次的邀約再約 */
    if(k<3){ if(!start()) return 'blocked'; const yes=again&&h.yes2?h.yes2:(h.yes||(D&&D.yes?(typeof D.yes==='function'?D.yes(G,null,k):D.yes):[]));   /* 第二次玩家先說：她上次已經先說過，換 yes2（AA_254 第 0 節第 7 點）*/
      if(CO&&CO[k]&&CO[k].yesLead&&CO[k].yesLead.length) await run(GM,who,CO[k].yesLead);   /* 她答應時的第一段（接在 yes／yes2 前面；門檻沒到的不演）*/
      if(!again&&h.yesCg) await run(GM,who,[{cg:resolve(h.yesCg,G)}]);   /* 自己先說的玩家也有那張 CG，放在她答應的那一句（AA-C 16:5x）；第二次不放 */
      await knownLine(); await run(GM,who,typeof CF723!=='undefined'&&CF723.swapYes?CF723.swapYes(G,who,yes):yes);   /* 第二次告白：AA_723 secondYes 換句（CF723.swapYes）*/ (G.flags.confessed||(G.flags.confessed={}))[who]=G.day; delete Rt.think[who]; R.result='yes'; return 'yes'; }
    { const sl=again?h.she2:h.she; if(!sl){ R.result='silent'; return 'silent'; } }   /* 她不先說（學姊，AA_591 第 11 節第 13 點）：祐廷沒開口＝這一次什麼都沒發生，等下一次 */
    await run(GM,who,again?h.she2:h.she);
    if(!again&&h.sheMem&&typeof SOCIAL!=='undefined'&&SOCIAL.remember&&!(SOCIAL.has&&SOCIAL.has(who,h.sheMem))) SOCIAL.remember(who,h.sheMem,'');   /* 她先說的那一場給你看過那一頁（以安：AN_SHOP_PAGE，AA_587 第 13 節）*/
    if(h.sheAsks&&!await afterAsk()) return 'others';   /* 她先說的最後一句就是那個問題 */
    const a=await tellMaybe(h.answer||Lx.ANSWER);   /* 沛珊大四上：「從今天開始認識。」／「……讓我想一下。」；芯慈多「（先告訴她…）」那一個 */
    if(a===0){ if(again&&h.she2Yes) await run(GM,who,h.she2Yes);   /* 第二次她問「你要看嗎？」、你說好＝補兩拍再交往（以安，AA_587 第 13 節）*/ if(again&&h.she2YesMem&&typeof SOCIAL!=='undefined'&&SOCIAL.remember&&!(SOCIAL.has&&SOCIAL.has(who,h.she2YesMem))) SOCIAL.remember(who,h.she2YesMem,'');   /* 第一次已經記過同一個（AN_SHOP_PAGE）就不重複記（BB_246 P3：記憶上限 80）*/ if(!start()) return 'blocked'; await knownLine(); (G.flags.confessed||(G.flags.confessed={}))[who]=G.day; delete Rt.think[who]; R.result='sheSaid'; return 'sheSaid'; }
    await run(GM,who,[h.think]); Rt.think[who]=term; R.result='think'; return 'think'; };
  S.hooks();   /* TE-HEART-EXEMPT-1104：手機的「好。」當下處理、傳到就看撞不撞（phone3d.js 先載；沒載到的話 S.phone 第一次跑的時候補）*/
  /* ---- TE-KOMICHI-STAGE-1104（BB-C 2026-11-04 21:28；AA_686 第 2 項的背景）----
     語彤的期末飯（朋友那一則）在溫州街・小路、17:30（AA_687 第 3 項起 18:00）。十二月那幾次天已經暗了＝照舊 2D 背景 teishoku_night；
     六月那幾次（大一下 6/20、大三下 6/10；AA_687 第 5 項以後大二下也在六月：6/12）天還亮＝不用夜景圖，改在 3D 的小路室內演（窗邊那一桌：玩家坐靠門那一側、她坐對面；小路室內有白天的窗景，WZ4_komichi 驗過），背景 blur。
     做法和宵夜（offbeat_sys3d.js S.stage）、霖澤館 5F（lab5f3d.js）同一套：OUT.STAGE 演之前換到那個區域、演完回到原本的地方；從家裡出發、國外、騎車、有人跟著＝照舊 2D（夜景圖）。
     月份：4～9 月 17:30／18:00 天還亮（期末飯只會在六月、十二月）。舊存檔排好「公館燒臘」的那一頓（q.place 不是小路）不換。
     AA_687 第 4 項（企劃線 d41750385）：BB 那邊要小路傍晚的版本（六月 18:00 天還亮）；沒有以前照現在（六月 3D、十二月 teishoku_night）。開場、收尾的旁白在 PLACE.teishoku */
  S.KOMICHI={zone:'wz_teishoku',me:0,her:2,months:[4,5,6,7,8,9]};   /* WZ_SHOPS_LAYOUT.teishoku（小路 v4）的座位：0＝窗邊第一桌靠門那一側、2＝對面 */
  S.komichiStaged=null;
  S.komichiDue=function(G,q,ev){ if(!ev||ev.id!=='ev_termend_dinner'||!q||!q.te||q.te.who!=='heroine_03') return false; const P=(L().PLACE||{}).teishoku; if(!P||q.place!==P.name) return false;
    const dd=typeof CALENDAR!=='undefined'&&CALENDAR.dateOf&&q.day!=null?CALENDAR.dateOf(q.day):null; return !!dd&&S.KOMICHI.months.includes(dd.m); };
  S.komichiCan=function(GM){ const G=GM&&GM.G, E=GM&&GM.E, Ly=typeof WZ_SHOPS_LAYOUT!=='undefined'?WZ_SHOPS_LAYOUT.teishoku:null;
    if(!G||!E||!E.player||!Ly||!Array.isArray(Ly.seats)||typeof Z3==='undefined'||!Z3.ZONES||!Z3.ZONES[S.KOMICHI.zone]||!Z3.ZONES[G.zone]) return false;
    if(typeof OUT!=='undefined'&&OUT.fromHome) return false; if(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G)) return false;
    if(typeof STORY!=='undefined'&&STORY.abroad&&STORY.abroad(G)) return false; if(typeof EXCH!=='undefined'&&EXCH.inUS&&EXCH.inUS(G)) return false; if(typeof JP!=='undefined'&&JP.inJapan&&JP.inJapan(G)) return false;
    if(E.player.riding||(G.flags&&G.flags.companion)) return false; return true; };
  /* BG-DUSK-1105（BB-C 09:21：使用者生成的小路傍晚 teishoku_dusk 通過 BB 檢查，AA_687 第 4 項要的那一張）：六月那幾次改用這張 2D 背景，不再換到 3D 的小路室內；S.KOMICHI_3D=true 回到 3D 那一套 */
  S.KOMICHI_3D=false;
  S.komichiStage=async function(GM,q,ev){ if(!GM||!S.komichiDue(GM.G,q,ev)) return null;
    if(!S.KOMICHI_3D&&typeof OUT!=='undefined'&&OUT.BG&&OUT.BG.teishoku_dusk&&OUT.BG.teishoku_dusk.image){ S.komichiStaged='dusk'; let done=false; return {restore:async()=>{ if(done) return; done=true; S.komichiStaged=null; }}; }
    if(!S.komichiCan(GM)) return null;
    const G=GM.G, P=GM.E.player, Ly=WZ_SHOPS_LAYOUT.teishoku, me=Ly.seats[S.KOMICHI.me], her=Ly.seats[S.KOMICHI.her]; if(!me||!her) return null;
    const prev={zone:G.zone,x:P.obj.position.x,z:P.obj.position.z,yaw:P.obj.rotation.y,lv:P.lv|0}; if(P.seat&&GM.standUp) GM.standUp(P);
    const st=s=>({x:s.x,z:s.z,yaw:s.yaw,lv:0}), sp=Ly.spawn||{x:me.x,z:me.z,yaw:me.yaw}; S.komichiStaged=q.id;
    await GM.enter(S.KOMICHI.zone,{x:sp.x,z:sp.z,yaw:sp.yaw||0},{noFade:true,deferStory:true,noAutosave:true});   /* 小路的出生點（一定站得住），接著坐到位子上（sitAt 直接放到座位）*/
    if(GM.sitAt) GM.sitAt(P,st(me));
    const id='heroine_03'; if(GM.npc&&GM.npc[id]&&GM.removeNPC) GM.removeNPC(id);
    const n=GM.spawnCharacter?GM.spawnCharacter(id,her.x,her.z,{seat:st(her),pose:'sit'}):null; if(n){ n.idlePose='sit'; n.frozen=true; }
    let done=false;
    return {restore:async()=>{ if(done) return; done=true; S.komichiStaged=null; if(P.seat&&GM.standUp) GM.standUp(P);
      await GM.enter(prev.zone,{x:prev.x,z:prev.z,yaw:prev.yaw,lv:prev.lv},{noFade:true,deferStory:true,noAutosave:true}); }}; };
  if(typeof OUT!=='undefined'&&Array.isArray(OUT.STAGE)&&!OUT._teKomichi){ OUT.STAGE.push(S.komichiStage); OUT._teKomichi=true;
    if(OUT.bg){ const b0=OUT.bg; OUT.bg=function(id){ if(S.komichiStaged&&id==='teishoku_night') return S.komichiStaged==='dusk'?b0.call(this,'teishoku_dusk'):'blur'; return b0.apply(this,arguments); }; } }   /* 演的時候這一頓的背景（PLACE.teishoku.bg）＝模糊的 3D */
  return S;
})();
