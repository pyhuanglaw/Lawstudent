/* ===== 學期末的飯：告白只在學期末（BB_203，使用者 2026-10-17 確認；使用者 11:40 對 LAWWW-C「告白只在學期末」；任務 BB203-CONFESS-1017）=====
   - 時段：每學期第 16 週週四～放假後第 1 週週日（AA_250 各學期的「聚餐時段」＝CALENDAR.termDays 的最後一天 -3～+7）。大四下（畢業那天）另外做。
   - 時段第一天 00:00 以後第一次算的時候決定這學期的邀約（S.plan；中途條件變了不重算，BB_203 第 5 節）：
     ①心意的邀約（使用者 2026-10-17 改、每個學期都一樣，BB_203 第 1 節第 4 點 303fe766）：她的戀愛（npcRom）≥ 30＋4 次正式約會含心願地點＋她當時願意（C4～C10）＋這段期間不是特別不發的時候（學姊筆試、放榜前；沛珊重考期）。第 6 階、答應線、祐廷的戀愛、大一上的例外都不用了。
     ②朋友的邀約：這學期 contact ≥ 6、熟度 FAMILIAR 以上的前兩名（BB_202 1-1；contact 照 S.contact 記）。
     ③保底（①②都沒有）：contact 最高、ACQUAINTANCE 以上的那一位；再沒有＝阿凱在宿舍當面「宵夜？」。
     交往中的女朋友另外有學期末約會（AA_250 10-3），不佔名額；可昕照 BB_202 第 6 節另外做。
   - 手機：時段第一天 20:00 不發心意邀約的手機一句（AA_254 第 9 節）、20:30 起各邀約一則；**只能接一個**——接了一個，其他的自動回「那天有約了。」（她們回婉拒那句）。
   - 飯＝出遊（OUT，事件 ev_termend_dinner 的 beforeOuting）：開場旁白（AA_250 0-1）→ 話題池 → 飯桌一句 → 收尾；
     心意的邀約接著回家的路上：說出來三句＋（先不說）→ 說出來＝答應、交往（ROM.start）；先不說＝她說 →「好。」交往／「讓我想想。」這學期不交往，下學期她用第二次的邀約再約。
   - 學期中、正式校外約會的收尾不再有告白（DATE.confessOffer 看 S.ON）。
   台詞全部在 data/termend_lines.js（AA 定稿照抄）。存檔：G.termend＝{contact:{學期:{id:{pts,k:{種類:哪一天}}}}, 學期:{plan, asks, picked, done, ...}, think:{id:哪一學期說讓我想想}}。測試：node tests/termend_unit.js */
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
    if(typeof ROM!=='undefined'&&ROM.canStart&&!ROM.canStart(G,id)) return false;   /* C8：分手以後還不能重新開始 */
    if(typeof INV!=='undefined'&&INV.cool&&INV.cool(G,id)) return false;   /* 分開以後到下一個學期第 1 週：她不主動約（AA_434 4-3，V6EX.cool），心意邀約不發、那一句也不傳；你自己約她吃飯＝朋友的期末飯（S.playerInvite）*/
    if(id==='heroine_05'&&typeof SISB4!=='undefined'&&SISB4.brokeUp&&SISB4.brokeUp(G)) return false;   /* AA_386 第 4 節：分開過的學姊不發心意邀約（她的答應是第一次的台詞「考試那時候就有一點了」，接不上）——重新開始照三件事（SIS_REBUILD）＋兩次正式校外約會，第二次那一趟的結尾告白（date3d.js）*/
    const c=S.cond(G,id);
    if(!c.ok){ if(c.why==='low'||c.why==='knows') return {nope:c.why}; if(c.why==='partner') return Lx.NOPE.partner&&Lx.NOPE.partner[id]?{nope:'partner'}:false; return false; }   /* 手機一句只給 C5 她自己有交往對象、C6 低潮、C10 她知道（含 5-3 第二欄沒到）；C1、C2 只是還沒到，不傳（BB_203 5-4，AA_254 第 9 節 8c76052b）*/
    if(c.decline==='preexam'||c.decline==='prerank') return false;   /* 學姊：放榜（2026-03-23）以前不發、也不傳（5-3 第一欄，AA_254 第 9 節刪了那一句）*/
    const D=typeof CONFESS_LINES!=='undefined'?CONFESS_LINES[id]:null; if(D&&typeof D.hideIf==='function'&&D.hideIf(G,null)) return false;   /* 沛珊重考期：聯絡不到，不傳 */
    return true; };
  S.friendOk=function(G,id,w){ if(G.flags&&G.flags['dating_'+id]) return false; const st=romStatus(G,id); if(st==='ended'||st==='friend_after_catch'||st==='paused') return false;
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
  S.plan=function(G,w){ const R=S.rec(G,w.id); if(R.plan) return R.plan; const Lx=L(); const bd0=S.backDay(G,w), bd=bd0==null?null:Math.max(bd0,S.examStart(G,w));   /* 玩家回來那天、最後一科考完的隔天，比較晚的那一天（AA_375 第 6 項）*/
    if(bd==null){ R.plan={heart:[],friend:[],fallback:null,gf:[],nope:{},kx:false,abroad:true}; return R.plan; }   /* 日本路線的以安那一頓（AA_250 6-2）不算學期末的飯、不在這裡：6/9 她私訊約、6/10 出遊（src/jp3d.js 的 S.dinnerPhone，AA_355 1-1）*/
    const P={back:bd,heart:[],friend:[],fallback:null,gf:[],nope:{},kx:!!(G.flags&&G.flags.dating_kexin)&&!!(Lx.KX&&Lx.KX[w.id])&&!(w.id==='Y1S2'&&G.events&&G.events.done&&G.events.done.ev_revisit_y1_kexin)};   /* 可昕：舊存檔演過重訪日的算大一下已經演過（BB_202 第 6 節）*/
    for(const id of Object.keys(Lx.GF)) if(G.flags&&G.flags['dating_'+id]&&!S.away(G,w,id)) P.gf.push(id);   /* 交往中但人在國外（芷若大三上）：不發期末約會，照 BB_124 聖誕視訊（AA_259 第 5 節，等 BB）*/
    if(w.id===S.Y5.id){ R.plan=P; return P; }   /* 大五上：只有女朋友的學期末約會（可昕照 KX 那張表）；心意、朋友的邀約、保底都不發（AA_357 3-4）*/
    for(const id of Object.keys(Lx.HEART)){ if(S.away(G,w,id)) continue; const h=S.heartWhy(G,id,w); if(h===true) P.heart.push(id); else if(h&&h.nope) P.nope[id]=h.nope; }
    const taken=new Set(P.heart.concat(P.gf)), fam=id=>typeof SOCIAL!=='undefined'&&SOCIAL.rel?(+SOCIAL.rel(id).fam||0):0;
    const C=Object.keys(Lx.FRIEND).filter(id=>!taken.has(id)&&!S.away(G,w,id)&&S.friendOk(G,id,w)).map(id=>({id,c:S.score(G,w.id,id)})).sort((a,b)=>b.c-a.c||fam(b.id)-fam(a.id));
    P.friend=C.filter(x=>x.c>=6&&atLeast(x.id,'FAMILIAR')).slice(0,2).map(x=>x.id);
    if(!P.heart.length&&!P.friend.length){ const b=C.find(x=>x.c>0&&atLeast(x.id,'ACQUAINTANCE')); if(b) P.friend=[b.id]; else P.fallback='kai'; }   /* BB_203 第 1 節第 7 點 */
    R.plan=P; return P; };
  const resolve=(x,G)=>typeof x==='function'?x(G):x;
  /* 她的心意邀約規格：HEART[id] 疊上那一學期的 over（沛珊大三起的地點、大四上的版本…）*/
  const overOf=(h,term)=>{ if(!h) return null; let o=h; for(const v of (h.over||[])) if(v.terms.includes(term)){ o=Object.assign({},o,v); delete o.terms; } return o; };
  S.heart=function(id,term){ const Lx=L(); return overOf(Lx&&Lx.HEART[id],term); };
  S.gf=function(id,term){ const Lx=L(), g=Lx&&Lx.GF[id], iv=g&&g.invByTerm&&g.invByTerm[term]; return overOf(iv!=null?Object.assign({},g,{invite:iv}):g,term); };   /* 女朋友的學期末約會也照學期換（沛珊大三起的地點）；邀約那一句照 invByTerm（AA_456 1-5：沒寫的學期照 invite，over 寫的照 over）*/
  S.friend=function(id,term){ const Lx=L(); return overOf(Lx&&Lx.FRIEND[id],term); };   /* 朋友的一對一邀約也照學期換（芷若大二下：她 6/3 以後不上班，不在 Café 打烊以後，AA_375 第 1 項）*/
  const lines=(x,G)=>{ x=resolve(x,G); return x==null?[]:(Array.isArray(x)?x:[x]); };
  /* 不發心意邀約的那一句、朋友邀約的婉拒照學期換（AA_260 (b-1) 第 5、6、11、14 項，AA_262 (b) 第 4 條）：NOPE[種類][她] 可以是字串（照舊）或 {gen, byTerm:{學期:句子}}；FRIEND[她].noByTerm 優先於 noBySem、no */
  S.nopeText=function(Lx,kind,id,term){ const v=(Lx&&Lx.NOPE&&Lx.NOPE[kind]||{})[id]; if(v&&typeof v==='object'&&!Array.isArray(v)) return (v.byTerm&&v.byTerm[term])||v.gen||null; return v; };
  S.friendNo=function(f,term){ if(!f) return null; const sem=String(term).slice(2); return (f.noByTerm&&f.noByTerm[term])||(f.noBySem&&f.noBySem[sem])||f.no; };
  /* ---- 手機（story3d.js 的 S.phoneRules 每次呼叫）---- */
  S.phone=function(GM){ const G=GM.G; if(!S.ON||typeof PHONE==='undefined'||!L()) return; const w=S.window(G); if(!w) { S.pickCheck(GM); return; } const now=T(G.day,G.hour);
    if(now<T(w.from,0)) return; const P=S.plan(G,w), R=S.rec(G,w.id), Lx=L(); R.asks=R.asks||{};
    const until=T(w.to,18);
    const d1=P.back||w.from;   /* 玩家回來那天（不在國外＝時段第一天）*/
    for(const id in P.nope){ const t=S.nopeText(Lx,P.nope[id],id,w.id), tag='te_nope_'+w.id+'_'+id, mine=x=>!!(x&&x.who===id);   /* 時段的最後一天 20:00（BB_203 5-4）；這學期玩家已經約她吃過期末飯＝不傳；一學期一人一句 */
      if(t&&now>=T(w.to,20)&&!PHONE.sent(G,tag)&&!mine(R.picked)&&!mine(R.done)) PHONE.at(G,w.to,20,[{th:'p:'+id,from:id,text:t}],tag); }
    let n=0; const send=(id,kind,txt,no)=>{ const tag='te_'+w.id+'_'+id, h=20.5+(n++)*0.15, d0=Math.max(S.fromDay(w,id),P.back||w.from);
      /* 當天才約（HEART.sameDay，芯慈 AA_537b 第 7 節「考完了。今天晚上有空嗎。……我沒有提前一天。」）：先排好日子，那一天 12:00 傳、回覆到 17:30，飯就在那天（BB-B 10-31：原本時段第一天 20:30 傳、飯排在兩天後，「今天」不對）*/
      const hs=kind==='heart'?S.heart(id,w.id):null;
      if(hs&&hs.sameDay){ const RH=R.heartDay||(R.heartDay={}); if(PHONE.sent(G,tag)||R.picked) return; if(RH[id]==null){ if(now<T(d0,0)) return; const dd0=S.dinnerDay(G,w,Object.assign({},hs,{h:hs.h||18.5}),id); RH[id]=dd0==null?-1:dd0; }
        if(RH[id]>=0&&now>=T(RH[id],17.5)){ const d2=S.dinnerDay(G,w,Object.assign({},hs,{h:hs.h||18.5}),id); RH[id]=d2==null?-1:d2; }   /* 那天 12:00～17:30 手機規則都沒跑到（一直在劇情、出遊、上課、睡過）＝還沒傳就過了期限：不傳過期的，改排下一個能約的晚上（BB-B 10-31 疑點 1）*/
        const dd=RH[id]; if(dd<0||now<T(dd,12)) return; const T3=lines(txt,G); if(!T3.length) return;
        const ask={id:tag,until:T(dd,17.5),opts:[{t:'好。',set:{TE_PICK:w.id+'|'+id+'|'+kind}},{t:'那天有約了。',set:{TE_NO:w.id+'|'+id},say:no?[{from:id,text:no}]:[]}]};
        PHONE.at(G,dd,Math.min(Math.max(12,G.day===dd?(+G.hour||0):12),17),T3.map((t,i)=>Object.assign({th:'p:'+id,from:id,text:t},i===T3.length-1?{ask}:{})),tag); R.asks[id]=tag; return; }
      if(now<T(d0,h)||PHONE.sent(G,tag)||R.picked) return;   /* 已經接了一場（收到的或自己約的）就不再發 */ const T2=lines(txt,G);
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
    for(const id of P.heart){ const h=S.heart(id,w.id), again=R.second&&R.second[id]!=null?R.second[id]:(S.rec(G).think[id]!=null); (R.second||(R.second={}))[id]=again; send(id,'heart',again?h.invite2:h.invite,h.decline); }
    for(const id of P.friend){ if(id==='zhe'&&w.id==='Y2S1'&&G.events&&G.events.done&&G.events.done.ev_term_last_meal_y2s1) continue;   /* AA_374 第 24 項：最後一科考完那天 17:00 阿哲約的「期末最後一頓」（麵店）演過了，20:30 他不再約期末飯（同一晚約兩次）*/
      const f=Lx.FRIEND[id], sem=String(w.id).slice(2); send(id,'friend',resolve(w.id==='Y1S1'?f.y1s1:((f.genByTerm&&f.genByTerm[w.id])||(f.genBySem&&f.genBySem[sem])||f.gen),G),S.friendNo(f,w.id)); }   /* noByTerm：學姊大三下「好。我出發前再找你。」（AA_260 (b-1) 第 14 項）*/   /* genBySem／noBySem：上學期末（S1）、下學期末（S2）不同句（方奕廷，AA_369 L1）*/
    S.pickCheck(GM); };
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
  S.teBusy=function(G,w,d,who){ const R=S.rec(G,w.id); if(typeof OUT!=='undefined'&&OUT.rec(G).some(q=>q&&q.day===d&&q.state==='planned'&&/^te_/.test(q.id||'')&&q.te&&q.te.who!==who)) return true;
    for(const m of [R.heartDay||{},R.gfDay||{}]) for(const k in m) if(k!==who&&m[k]===d) return true; return false; };   /* AA_378 S4：那天晚上已經有別的出遊（例：12/23 20:30 接學姊的飛機）*/
  /* 女朋友版的學期末約會要避開的那一天（AA_386 第 3 節）：學姊交往中，大二上、大三上的 12/24 晚上是她約的聖誕（Café 門口、研究室；src/sis_b4_3d.js）*/
  S.XMAS_GF={heroine_05:{Y2S1:'2026-12-24',Y3S1:'2027-12-24'}};
  /* 女朋友版的學期末約會固定那一天（AA_386 3-3，企劃線 d0468be4）：學姊大四上 12/24 18:30（她 12/23 回來的隔天；兩條路線一樣）。其他人照 S.dinnerDay 的規則 */
  S.GF_FIXED={heroine_05:{Y4S1:'2028-12-24'}};
  /* 固定那一天沒排成（那天晚上有別的約、往後讓了）＝AA_386 3-3 備援：12/24 21:00 她私訊（sis_b4_3d.js SISB4.xm3Fallback；3-2 有來才有）*/
  S.gfOff=function(G,w,id){ const fx=S.GF_FIXED[id]&&S.GF_FIXED[id][w.id]?DK(S.GF_FIXED[id][w.id]):null; if(fx==null) return; const dd=S.rec(G,w.id).gfDay[id]; if(dd===fx) return;
    if(id==='heroine_05'&&w.id==='Y4S1'&&typeof SISB4!=='undefined'&&SISB4.xm3Fallback) SISB4.xm3Fallback(G); };
  S.dinnerDay=function(G,w,spec,who){ const hh=spec.h||18.5, xm=who==='kexin'&&w.id==='Y2S1'?DK('2026-12-25'):null, xg=spec.gf&&S.XMAS_GF[who]&&S.XMAS_GF[who][w.id]?DK(S.XMAS_GF[who][w.id]):null, ok=d=>d!==xm&&d!==xg&&!S.eveningBusy(G,d)&&!S.teBusy(G,w,d,who)&&(d>G.day||(d===G.day&&G.hour<hh-0.5)), pb=(S.rec(G,w.id).plan||{}).back||w.from; let lo=Math.max(w.from+1,pb+1,G.day);
    if(who==='heroine_03'&&w.id==='Y1S2'){ const d=DK('2026-06-19'); if(d!=null) lo=Math.max(lo,d); }   /* 語彤 6/18 雙主修筆試以前不來（AA_250 第 2 節）*/   /* xm：可昕大二上的期末約會避開 12/25（那天晚上是她排的聖誕行程，AA_325 2-Y2-07）*/
    const c=CHARACTERS[who], hi=c&&c.presence&&c.presence.home?Math.min(w.to,w.termTo):w.to;   /* 寒暑假回老家的（可昕、沛珊，AA_276 第 3 節第 2 點）：限定在期末考最後一天後第 2 天以前，第 3 天她們就回老家了 */
    { const fx=spec.gf&&S.GF_FIXED[who]&&S.GF_FIXED[who][w.id]?DK(S.GF_FIXED[who][w.id]):null; if(fx!=null&&fx>=w.from&&fx<=hi&&ok(fx)) return fx; }   /* 固定那一天（那天晚上已經有別的約＝照下面的規則往後讓）*/
    if(spec.wd!=null){ for(let d=lo;d<=hi;d++){ const wd=CALENDAR.dateOf(d).wd%7; if(wd===spec.wd&&ok(d)) return d; } }
    for(let d=Math.max(lo,w.from+2,pb+2);d<=hi;d++) if(ok(d)) return d; for(let d=lo;d<=hi;d++) if(ok(d)) return d; return null; };
  S.planDinner=function(G,w,who,kind){ const Lx=L(), spec=kind==='heart'?S.heart(who,w.id):(kind==='gf'?S.gf(who,w.id):(kind==='fallback'?Lx.FALLBACK[who]:S.friend(who,w.id))); if(!spec||typeof OUT==='undefined') return false;
    const hh=(kind==='friend'&&spec.hByTerm&&spec.hByTerm[w.id]!=null)?spec.hByTerm[w.id]:((kind==='friend'&&spec.hGen&&w.id!=='Y1S1')?spec.hGen:(spec.h||18.5)), gd=kind==='gf'?(S.rec(G,w.id).gfDay||{})[who]:(kind==='heart'&&spec.sameDay?(S.rec(G,w.id).heartDay||{})[who]:null),   /* 當天才約的心意邀約：飯就在傳訊息那天 */ day=gd!=null&&gd>=0?gd:S.dinnerDay(G,w,Object.assign({},spec,{h:hh},kind==='gf'?{gf:true}:null),who); if(day==null) return false;   /* gd：女朋友的約會先排好的那一天（AA_378 #3）*/ const P=Lx.PLACE[spec.place]||{}, pname=spec.placeName||P.name||'';
    return OUT.plan(G,Object.assign({id:'te_'+(kind==='gf'?'gf_':'')+w.id+(kind==='gf'?'_'+who:''),ev:'ev_termend_dinner',day,h:hh,late:0.25,place:pname,title:'學期末的飯：'+nm(who)+(pname?'（'+pname+'）':''),travel:spec.travel||'走過去約 15 分鐘',travelH:spec.travelH||0.25,te:{term:w.id,who,kind}},spec.back?{back:spec.back}:{})); };   /* travel／travelH／back：外縣市的那一版（沛珊大三起在台南：高鐵去、搭最後一班高鐵回臺北，AA_282 第 5 節第 5 點）*/
  /* {哪天}：約會那天跟傳訊息那天比——同一天「今天」、隔天「明天」、其他「禮拜幾」（AA_460 第 5 節）*/
  S.dayWord=function(d0,d){ if(d==null||typeof CALENDAR==='undefined') return ''; if(d===d0) return '今天'; if(d===d0+1) return '明天'; return '禮拜'+'日一二三四五六'[CALENDAR.dateOf(d).wd%7]; };
  S.fillDay=(t,w)=>typeof t==='string'?t.replace(/\{哪天\}\s?/g,w?w+' ':''):t;
  S.planKexin=function(G,w){ const Lx=L(), K=Lx.KX[w.id], PL=Lx.KX_PLACE[K.place]; if(!K||!PL||typeof OUT==='undefined') return false; const day=S.dinnerDay(G,w,{h:PL.h,wd:K.wd},'kexin'); if(day==null) return false;
    return OUT.plan(G,{id:'te_kx_'+w.id,ev:'ev_termend_dinner',day,h:PL.h,late:0.25,place:PL.name,title:'和可昕的學期末約會（'+PL.name+'）',travel:'開車約 40 分鐘',travelH:2/3,te:{term:w.id,who:'kexin',kind:'kexin'}}); };
  S.pickCheck=function(GM){ const G=GM.G, F=G.flags||{};
    if(typeof F.TE_GF==='string'){ const [term,who]=F.TE_GF.split('|'); delete F.TE_GF; const w=S.windowOf(term); if(w) S.planDinner(G,w,who,'gf'); }
    if(typeof F.TE_NO==='string'){ const [term,who]=F.TE_NO.split('|'); delete F.TE_NO; const R=S.rec(G,term); (R.no||(R.no={}))[who]=G.day; }
    if(typeof F.TE_PICK==='string'){ const [term,who,kind]=F.TE_PICK.split('|'); delete F.TE_PICK; const R=S.rec(G,term), w=S.windowOf(term); if(!w||R.picked) return;
      R.picked={who,kind,day:G.day}; S.planDinner(G,w,who,kind);
      for(const id in (R.asks||{})){ if(id===who) continue; const tag=R.asks[id], m=PHONE.byAsk?PHONE.byAsk(G,tag):null; if(m&&PHONE.askOpen(G,m)) PHONE.answer(G,tag,1); } } };   /* 只能接一個（BB_203 第 1 節第 3 點）*/
  /* ---- 保底：阿凱在宿舍當面「宵夜？」（時段裡、20:00 以後第一次在房間；一學期問一次）---- */
  S.kaiDue=function(G){ if(!S.ON||G.zone!=='dorm') return false; const w=S.window(G); if(!w) return false; const P=S.plan(G,w), R=S.rec(G,w.id); return P.fallback==='kai'&&!R.picked&&!R.kaiAsked&&G.day>=(P.back||w.from)&&G.hour>=20&&G.hour<24.5&&!S.eveningBusy(G,G.day); };   /* 那天晚上已經有別的出遊（例：12/23 20:30 接學姊的飛機）＝那晚不問，讓「出發」先問；隔天晚上再問（BUG-KAI-PICKUP-1022，BB 10-22 11:28；同 dinnerDay 的 eveningBusy）*/
  S.kaiAsk=async function(GM){ const G=GM.G, w=S.window(G); if(!w) return false; const R=S.rec(G,w.id), Lx=L(), K=Lx.FALLBACK.kai, me={name:nm('kai'),charId:'kai'}; R.kaiAsked=G.day; let k=1; GM.sceneBegin();
    try{ await GM.say(me,K.ask); k=await GM.choose([{t:'「好。」'},{t:'「那天有約了。」'}]); if(k!==0){ await GM.say(me,K.no); return false; } R.picked={who:'kai',kind:'fallback',day:G.day};
      await GM.fade(true); if(GM.titleCard) await GM.titleCard('學期末的飯：'+nm('kai')+'（公館宵夜）','走過去約 10 分鐘',2200); GM.advance(1/6); await GM.fade(false);
      await S.dinner(GM,{te:{term:w.id,who:'kai',kind:'fallback'}}); await GM.fade(true); GM.advance(1.5); if(typeof ADV!=='undefined'&&ADV.active&&ADV.end) ADV.end(); await GM.fade(false); if(GM.caption) GM.caption('','回到宿舍。',2200); }
    finally{ GM.sceneEnd(); } if(GM.autosave) GM.autosave(); return true; };
  /* ---- 飯（出遊事件 ev_termend_dinner 的 beforeOuting；保底阿凱直接叫）---- */
  const run=async(GM,who,arr)=>{ const G=GM.G, me={name:nm(who),charId:who}; for(let x of arr){ x=resolve(x,G); if(x==null) continue; if(Array.isArray(x)){ await run(GM,who,x); continue; }
      if(typeof x==='string') await GM.say(me,x); else if(x.cg!==undefined){ if(typeof ADV!=='undefined'&&ADV.cg) ADV.cg(x.cg); }   /* {cg:id}：這一刻換成 CG（沒登錄的圖＝不顯示，照立繪）*/ else if(x.narr) await GM.say(null,x.narr);
      else if(x.who==='narr') await GM.say(null,/^（/.test(x.text)?x.text:'（'+x.text+'）');   /* confess_lines.js 的寫法 */
      else if(x.who==='player') await GM.say({name:G.name||'祐廷'},x.text);
      else if(Array.isArray(x.choice)){ const k=await GM.choose(x.choice.map(o=>({t:o.t}))); await run(GM,who,(x.choice[k]||x.choice[0]).say||[]); }   /* {choice:[{t,say}]}：飯桌上的一組選項（AA_470 4-2）*/
      else if(x.text) await GM.say(x.who&&x.who!==who?{name:nm(x.who),charId:x.who}:me,x.text,x.expr?{expr:x.expr}:undefined); } };
  S.dinner=async function(GM,q){ const G=GM.G, te=q&&q.te; if(!te) return false; const Lx=L(), who=te.who, kind=te.kind, R=S.rec(G,te.term);
    if(kind==='kexin') return S.kexinDinner(GM,te);
    const spec=kind==='heart'?S.heart(who,te.term):(kind==='gf'?S.gf(who,te.term):(kind==='fallback'?Lx.FALLBACK[who]:S.friend(who,te.term))); if(!spec) return false;
    const INV2TE={noodle:['noodle','noodle_closed']}, other=!!te.place&&!(INV2TE[te.place]||[]).includes(spec.place);   /* 玩家自己約、選的店不是她那一家（AA_268 第 1 節）：開場收尾照選的那一家、不說飯桌一句 */
    const P=other?(Lx.PLACE[(INV2TE[te.place]||[])[0]]||{name:te.placeName||'',open:'（'+(te.placeName||'')+'。）'}):(Lx.PLACE[spec.place]||{}); if(typeof ADV!=='undefined'&&ADV.begin) ADV.begin({background:P.bg&&typeof OUT!=='undefined'&&OUT.bg?OUT.bg(P.bg):'dark',right:{charId:who,expression:'neutral'}});
    if(P.caption&&GM.caption) GM.caption('',P.caption,2400);   /* 沒有底圖的地方：深色底＋地點字幕（台南，AA_282 第 5 節第 6 點）*/
    if(!other&&spec.fare&&GM.money) GM.money(-spec.fare,'交通');   /* 外縣市的那一版：高鐵來回（沛珊台南 2700，hometown_lines.js 同一個數字）*/
    const pool=((Lx.POOL[te.term]||{})[who]||[]).map(x=>resolve(x,G)).filter(x=>x!=null), me={name:G.name||'祐廷'}; let ri=0;
    const talk=async n=>{ for(let i=0;i<Math.min(n,pool.length);i++){ await run(GM,who,[pool[i]]); if(i<Math.min(n,pool.length)-1){ await GM.say(me,Lx.REPLY[(ri++)%Lx.REPLY.length]); } } };
    if(kind==='fallback'){ await run(GM,who,spec.open); await talk(2); await S.hook(GM,te.term,who); await run(GM,who,spec.close); }
    else { await GM.say(null,P.open||'（'+(other?P.name:(spec.placeName||P.name||''))+'。）');
      if(kind==='gf'){ const tb=spec.tableByTerm&&spec.tableByTerm[te.term]; await run(GM,who,lines(tb!=null?tb:spec.table,G)); if(tb==null&&spec.tableFlag&&G.flags[spec.tableFlag]==null) G.flags[spec.tableFlag]=G.day; await talk(2); }   /* 飯桌一句每學期不一樣（AA_352）；沒寫的學期照 table。tableFlag：聽過 table 那一句（AA_524 Y1 語彤「我媽問你……」）*/
      else if(kind==='friend'&&spec.openByTerm&&spec.openByTerm[te.term]&&!(R.picked&&R.picked.by==='player')){ await run(GM,who,lines(spec.openByTerm[te.term],G)); await talk(3); }   /* 開場之後多一句（AA_524 A6 以安大一上「（她點了菜單上最便宜的那一個。）」）：她約的才有，玩家自己約的不演 */
      else if(kind==='heart'){ await talk(2); if(!other) await run(GM,who,lines(spec.table,G)); }
      else await talk(3);
      await S.hook(GM,te.term,who);   /* 邀約鉤子（AA_250 10-1：話題之後、收尾之前）*/
      if(kind==='gf'&&spec.lastByTerm&&spec.lastByTerm[te.term]) await run(GM,who,lines(spec.lastByTerm[te.term],G));   /* 那一頓的最後（收尾之前；AA_470 4-2 學姊大四上）。約在哪一家都演（AA_490 第 2 節：句子沒提到店；原本玩家自己約別家＝other 不演）——lastByTerm 只放和店無關的句子 */
      const cl=kind==='gf'&&P.closeGf?P.closeGf:P.close; if(cl) await GM.say(null,cl); }   /* 學姊的女朋友版收尾（AA_250 10-1）*/
    R.done={who,kind,day:G.day};
    if(kind==='heart') await S.walkHome(GM,who,te.term);
    return true; };
  /* ---- 玩家自己約（BB_203 第 1 節第 13 點、AA_268）：期末時段裡用 invites 的「吃飯」約＝期末的飯。FAMILIAR 以上、在臺北照 invites 本來的條件；
     這學期已經接過一場（收到的或自己約的）＝照一般吃飯；關係結束、還不能重新開始（C8、C9）＝她婉拒；心意條件到齊＝心意的期末飯（飯後照她的回家路線）；女朋友＝期末約會（不佔名額）---- */
  S.playerInvite=function(G,id,P,W){ if(!S.ON||!P||P.kind!=='meal'||!W||(G.stage||'law')!=='law') return null; const w=S.window(Object.assign({},G,{day:W.day,hour:W.h})); const Lx=L(); if(!w||!Lx) return null;
    if(romStatus(G,id)==='ended'&&typeof ROM!=='undefined'&&ROM.canStart&&!ROM.canStart(G,id)) return Lx.ENDED[id]?{refuse:Lx.ENDED[id]}:null;
    if(G.flags&&G.flags['dating_'+id]) return Lx.GF[id]?{w,kind:'gf'}:null;
    if(w.id===S.Y5.id) return null;   /* 大五上只有女朋友的學期末約會（AA_357 3-4）：自己約別人吃飯照一般的吃飯 */
    const R=S.rec(G,w.id); if(R.picked||R.done) return null;
    if(S.heartWhy(G,id,w)===true) return {w,kind:'heart'};
    if(Lx.FRIEND[id]) return {w,kind:'friend'}; if(Lx.FALLBACK[id]) return {w,kind:'fallback'}; return null; };
  S.playerPicked=function(G,iv){ const t=iv&&iv.te; if(!t||t.kind==='gf') return; const R=S.rec(G,t.term), Lx=L(); R.picked={who:iv.who,kind:t.kind,day:G.day,by:'player'}; if(typeof PHONE==='undefined') return;
    const grad=t.term==='Y4S2', me=grad?Lx.AUTO_ME_GRAD:Lx.AUTO_ME, heart=(R.plan&&R.plan.heart)||[];
    for(const id in (R.asks||{})){ if(id===iv.who) continue; const tag=R.asks[id], m=PHONE.byAsk?PHONE.byAsk(G,tag):null; if(!m||!PHONE.askOpen(G,m)) continue;
      const dly=grad&&typeof PG!=='undefined'&&(PG.exchDelayed||PG.delayed)&&(PG.exchDelayed||PG.delayed)(G)&&Lx.AUTO_NO_GRAD_DELAYED;   /* 交換延畢：「好。今天恭喜。」（AA_381 第 1 節）*/
      const reply=heart.includes(id)?((S.heart(id,t.term)||{}).decline):((grad&&((dly&&dly[id])||Lx.AUTO_NO_GRAD[id]))||Lx.AUTO_NO[id]);
      m.ask.opts.push({t:me,say:reply?[{from:id,text:resolve(reply,G)}]:[],set:{TE_NO:t.term+'|'+id}}); PHONE.answer(G,tag,m.ask.opts.length-1); } };
  /* ---- 邀約鉤子（AA_250 各學期 x-2、10-1）：飯裡她提一件假期的事，玩家接了就進行事曆；C14 事務所參觀、C15 朋友約的單日小事（AA_251）---- */
  const Dk=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const md=d=>{ const x=CALENDAR.dateOf(d); return x.m+'/'+x.d+'（'+'日一二三四五六'[x.wd%7]+'）'; };
  S.hookFor=function(G,term,who){ const Lx=L(); if(!Lx||!Lx.HOOK||!Lx.HOOK_NO) return null; const H=(Lx.HOOK[term]||{})[who]; if(!H) return null; try{ if(H.if&&!H.if(G)) return null; }catch(e){ return null; }
    const a=H.act||{};
    if(a.c14&&!(Lx.C14&&Lx.C14.msg&&S.c14Day(term)!=null)) return null;
    if(a.c15){ const c=Lx.C15[a.c15], d=c&&Dk(c.day); if(!c||!c.msg||d==null||d<=G.day) return null; }
    if(a.vac){ if(typeof VAC==='undefined') return null; const [id,yk]=a.vac.split('@'), I=VAC.inst(id,yk); if(!I||VAC.enrolled(G,id,yk)||G.day>=I.from) return null; }
    if(a.flag&&G.flags&&G.flags[a.flag]!=null) return null;
    return H; };
  S.hook=async function(GM,term,who){ const G=GM.G, H=S.hookFor(G,term,who); if(!H) return null; const Lx=L(), R=S.rec(G,term);
    await run(GM,who,lines(H.say,G)); if(H.noOpt){ if(H.then) await run(GM,who,lines(H.then,G)); R.hook={who,ok:false,noOpt:true}; return false; }   /* noOpt：她照樣說，不給接的選項（AA_389 第 2 點：沒有下文的鉤子）*/
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
  S.c15Plan=function(G,id){ const Lx=L(), C=Lx.C15[id], d=C&&Dk(C.day); if(!C||d==null||typeof OUT==='undefined') return false;
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
  S.meetLine=async function(GM,who,id){ const G=GM.G, F=G.flags||{}, Lx=L(); if(id!=='classmate_xinci'||F.C14_MISSED==null||F.C14_MISS_SAID||!Lx||!Lx.C14) return false; F.C14_MISS_SAID=G.day; for(const t of Lx.C14.miss) await GM.say(who,'「'+t+'」'); return true; };
  /* ---- 可昕的學期末約會：開場、（大一下）BB_167 4-3 那段／（之後）飯桌兩句、收尾 ---- */
  S.kexinDinner=async function(GM,te){ const G=GM.G, Lx=L(), K=Lx.KX[te.term], PL=K&&Lx.KX_PLACE[K.place]; if(!K||!PL) return false;
    if(typeof ADV!=='undefined'&&ADV.begin) ADV.begin({background:typeof OUT!=='undefined'&&OUT.bg?OUT.bg(PL.bg):'dark',right:{charId:'kexin',expression:'smile'}});
    await GM.say(null,PL.open);
    if(typeof FAV!=='undefined'&&FAV.kexinDate) await FAV.kexinDate(GM,te,{name:nm('kexin'),charId:'kexin'});   /* 帶給她的那一杯（巷口茶飲，src/foodfav3d.js，AA_410）：開頭、她的第一句之前 */
    const XA=(Lx.KX_EXTRA&&Lx.KX_EXTRA[te.term])||{}; if(XA.open) await run(GM,'kexin',lines(XA.open,G));   /* AA_525 3-10：飯桌一開始（美國路線大四上「第一碗。說好我請。」）*/
    if(K.first){ const ev=typeof STORY_EVENTS!=='undefined'?STORY_EVENTS.find(e=>e.id==='ev_revisit_y1_kexin'):null; if(ev&&typeof EVENTS!=='undefined'&&EVENTS.runLines) await EVENTS.runLines(ev.dialogue,ev); if(ev&&typeof ev.after==='function') ev.after(G); }   /* BB_167 4-3：八段回憶挑一段（REVISIT_Y1 照記，大四主線 10 讀）*/
    else { await run(GM,'kexin',lines(K.table,G)); const A0=Lx.KX_ASK&&Lx.KX_ASK[te.term], A=typeof A0==='function'?A0(G):A0;   /* AA_401：table 兩句後面的二選一 */
      if(Array.isArray(A)&&A.length&&GM.choose){ const k=await GM.choose(A.map(o=>({t:o.t}))), o=A[k]||A[0]; await run(GM,'kexin',o.r);
        if(o.khh){ const KH=G.flags.KX_KHH||(G.flags.KX_KHH={}); KH[o.khh[0]]=o.khh[1]; } if(o.y5) G.flags.KX_Y5_CALL=o.y5; } }
    if(XA.end) await run(GM,'kexin',lines(XA.end,G));   /* AA_525 3-1、3-2：飯桌最後（大三上聖誕的禮物、第二頁；美國路線大四上的摩天輪）*/
    await GM.say(null,PL.close); (G.flags.KX_TERMEND||(G.flags.KX_TERMEND={}))[te.term]=G.day; S.rec(G,te.term).kx=G.day; return true; };
  S.missed=function(GM,q){ const G=GM.G, te=q&&q.te; if(!te||te.kind!=='kexin'||typeof PHONE==='undefined') return; const Lx=L(), K=Lx.KX[te.term], PL=K&&Lx.KX_PLACE[K.place]; if(!PL) return;
    PHONE.at(G,G.day,Math.max(G.hour,q.h+0.75),PL.miss.map(t=>({th:'p:kexin',from:'kexin',text:t})),'te_kx_miss_'+te.term); };   /* 沒去：她傳「我在河堤（正門）等了一下」「你還好嗎」（AA_250 9-2）*/
  /* ---- 回家的路上（AA_254 第 0 節）---- */
  S.walkHome=async function(GM,who,term){ const G=GM.G, Lx=L(), h=S.heart(who,term), R=S.rec(G,term), Rt=S.rec(G); if(!h) return null;
    if(typeof ADV!=='undefined'&&ADV.begin) ADV.begin({background:h.walkBg&&typeof OUT!=='undefined'&&OUT.bg?OUT.bg(h.walkBg):'dark',right:{charId:who,expression:'neutral'}});
    { const wc=h.walkCaption||(!h.walkBg&&h.walkPlace); if(wc&&GM.caption) GM.caption('',wc,2400); }   /* 沒有底圖的那一段路：深色底＋字幕（沛珊大三起：台南・往她租的地方）；沒寫 walkCaption 的用 walkPlace（BB-B 10-31：芷若、子晴、芯慈、沛珊的 walkPlace 原本沒有程式讀，回家路上只有一片深色）*/
    await run(GM,who,h.walk);
    const D=typeof CONFESS_LINES!=='undefined'?CONFESS_LINES[who]:null;
    const say3=h.optsFrom==='confess'&&D&&D.choice?resolve(D.choice,G).map(q=>q.t):Lx.OPTS(h.buddy);
    /* 芯慈（AA_548 第 7 節，h.tellOpt）：交往中、她不知道＝多一個選項「（先告訴她，你在跟誰交往）」，說完再選一次（不再出那一個）；她之前就知道＝答應的時候多一句 */
    const XC_=typeof XCROM!=='undefined'?XCROM:null, knewBefore=!!(h.tellOpt&&XC_&&XC_.othersDating(G).length&&!XC_.hidden(G).length);
    const tellMaybe=async(opts)=>{ for(;;){ const told=!!(h.tellOpt&&XC_&&XC_.hidden(G).length); const k0=await GM.choose(opts.concat(told?[XC_.TELL_OPT]:[]).map(t=>({t}))); if(!(told&&k0===opts.length)) return k0; await run(GM,who,XC_.TELL_LINES); XC_.tell(G); } };
    const knownLine=async()=>{ if(knewBefore&&XC_.KNOWN_LINE) await run(GM,who,[XC_.KNOWN_LINE]); };
    const k=await tellMaybe(say3.concat([Lx.NOT_YET_OPT]));
    const start=()=>{ const K=S.knownOthers(G,who); const ok=typeof ROM!=='undefined'&&ROM.start?ROM.start(G,who):((G.flags['dating_'+who]=true),true); if(ok&&K.length){ const O=G.flags.OPEN_OK||(G.flags.OPEN_OK={}), M=O[who]||(O[who]={}); for(const y of K) M[y]=true; } return ok; };   /* 知情還發的邀約，答應＝她同意祐廷同時和那些人交往（OPEN_OK，BB_194 §6）*/
    const again=Rt.think[who]!=null;   /* 第二次（上次選了「讓我想想」）*/
    /* 她先問「你現在有在跟誰交往嗎。」（芯慈，AA_537b 第 7 節）：有別的交往對象＝接 others 後兩行、不交往（這學期的告白結束）；沒有＝祐廷自動「沒有。」*/
    const me={name:G.name||'祐廷'}, others=()=>typeof XCROM!=='undefined'&&XCROM.othersNow?XCROM.othersNow(G,who):[];
    const afterAsk=async()=>{ if(typeof XCROM!=='undefined'&&XCROM.asked) XCROM.asked(G); if(others().length){ await run(GM,who,h.othersTail||[]); R.result='others'; return false; } await GM.say(me,h.noOther||'沒有。'); return true; };
    if(k<3&&h.askFirst){ await run(GM,who,[h.askFirst]); if(!await afterAsk()) return 'others'; }
    if(k<3){
      if(h.decideYes&&typeof DATE!=='undefined'&&DATE.confessDecide&&DATE.confessDecide(G,who)!=='yes'){ await run(GM,who,D&&D.notYet||[]); if(D&&D.notYetFlag) G.flags[D.notYetFlag]={day:G.day,term}; Rt.think[who]=term; R.result='notYet'; return 'notYet'; } }   /* 玩家先說：她的戀愛到 YES_LINE（75）才答應，沒到＝「我還沒想好……」（AA_537 第 4 節 notYet），下學期她用第二次的邀約再約 */
    if(k<3){ if(!start()) return 'blocked'; const yes=again&&h.yes2?h.yes2:(h.yes||(D&&D.yes?(typeof D.yes==='function'?D.yes(G,null,k):D.yes):[]));   /* 第二次玩家先說：她上次已經先說過，換 yes2（AA_254 第 0 節第 7 點）*/
      if(!again&&h.yesCg) await run(GM,who,[{cg:resolve(h.yesCg,G)}]);   /* 自己先說的玩家也有那張 CG，放在她答應的那一句（AA-C 16:5x）；第二次不放 */
      await knownLine(); await run(GM,who,yes); (G.flags.confessed||(G.flags.confessed={}))[who]=G.day; delete Rt.think[who]; R.result='yes'; return 'yes'; }
    await run(GM,who,again?h.she2:h.she);
    if(h.sheAsks&&!await afterAsk()) return 'others';   /* 她先說的最後一句就是那個問題 */
    const a=await tellMaybe(h.answer||Lx.ANSWER);   /* 沛珊大四上：「從今天開始認識。」／「……讓我想一下。」；芯慈多「（先告訴她…）」那一個 */
    if(a===0){ if(!start()) return 'blocked'; await knownLine(); (G.flags.confessed||(G.flags.confessed={}))[who]=G.day; delete Rt.think[who]; R.result='sheSaid'; return 'sheSaid'; }
    await run(GM,who,[h.think]); Rt.think[who]=term; R.result='think'; return 'think'; };
  return S;
})();
