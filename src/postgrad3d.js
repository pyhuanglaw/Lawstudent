/* ===== 畢業以後（AA_319 1A-13、1A-14、1A-16～1A-20；台詞在 src/data/postgrad_lines.js）=====
   一條線：2029-05-10 21:00 國考報名提醒 → 6/2 畢業典禮拍照（12:00～13:30，CG-9）→ 傍晚（一對一的飯、Café 併桌）→ 20:30 學姊的生日 → 6/9 可昕的畢業典禮（BCG-07）→
   7/12 20:00 總圖 B1 → 8/3 學姊的便條 → 8/4 一試（20 題）→ 9/7 一試放榜 → 10/20～21 二試 → 12/14 二試放榜（18:00 麵店、21:00 以安的電話）→
   2030-01-25 以安三試放榜（電話）→（交換延畢、2029 一試不到 12 題：2030 再一輪，8/3、9/6、10/19～20、12/13）→ 2030-10-01 第一份工作 → 2034-06-03 尾聲（CG-10）→ 回標題。
   - 拍照演完（F.GRADUATED）以後是「畢業後篇」（S.on）：站著不動 2 秒、或睡覺＝跳到下一件事（場景、手機訊息、出遊；做法同經濟系的 ECONFF）；
     跳的途中照時間跑手機規則，收到訊息就停、打開那一段。課表的提醒、去上課的選單不再跳（classes3d.js 讀 PG.on）。
     跳過日子的日期卡下面那一句（AA_353）：S.cardLine（照經濟系的做法，每句一次）。
   - 場景（S.STEPS）：時間到了、玩家空下來就演，不能錯過的不給「不去了」。手機（S.MSGS）照時間排。可以不去的照出遊（OUT：Café、麵店、學姊的生日、可昕的典禮）。
   - 一對一的飯、回家的路照 termend3d.js：TERMEND_LINES 補大四下（Y4S2）的版本（S.patchTermend）。
   - 一試 20 題：期末考的題庫（EXAM_BANK）＋刑訴 QBANK 一起隨機抽、不重複，第二年換一組；題目、答案照題庫，不改。答對題數只在 9/7 放榜看得到。
   - 1A-12（主線 12 畢業典禮的家人，別一批）有 ev_grad_family 的話，拍照等那一段演完；沒有的話 6/2 早上直接帶到 12:00。
   - 存檔：G.flags.PG＝{done:{場景 id:1|'missed'}, exam:{年:{qs,ans}}, lines:[日期卡用過的句子]（舊存檔沒有 lines＝空）}；旗標照 AA_319 第 4 節（BAR_REG、BAR_REG_2030（交換延畢 2030 的報名，AA_357 1-6）、BAR_SCORE_<年>、BAR_SIT_<年>、BAR_STAGE_<年>、BAR_YEAR、
     GRADUATED、GRAD_PHOTO、SIS_THERMOS、GRAD_EVENING、GRAD_CAFE_HEARD、SIS_BDAY_Y4、PS_GRAD_CARD、KX_TERMEND_Y4S2、KX_GRAD、FIRST_DAY_SEEN、EPILOGUE_DONE；
     SIS_STORE_2029＝2029 一試那天學姊有沒有說「我在對面的便利商店等」，AA_472 第 5 節）。
   - 開發分支還沒有的旗標（Y4_PATH、GRAD_ADMIT、ZQ_CONTRACT、KAI_STAYED_UP…）一律當作沒有。
   - 掛勾：S.MSGS／S.STEPS／S.stops／S.RULES（別的模組加訊息、場景、停點、每一次的規則；訊息的 win＝過了幾小時不補）。交往中的固定格（可昕「我們的日子」AA_366、六位每月一格 AA_367）在 src/pgdates3d.js。
   測試：node tests/graduation_unit.js、tests/bar_exam_unit.js、tests/epilogue_unit.js、tests/postgrad_days_unit.js、tests/pg_cardline_unit.js */
'use strict';
const PG=(function(){
  const S={};
  const L=()=>typeof POSTGRAD_LINES!=='undefined'?POSTGRAD_LINES:null;
  /* 日子：STORY.dayOfKey 只找到第 2200 天（2031 年），尾聲 2034 年要自己算 */
  const dkc={};
  S.DK=function(k){ if(k in dkc) return dkc[k]; if(typeof CALENDAR==='undefined') return null; const p=String(k).split('-').map(Number); return dkc[k]=Math.round((Date.UTC(p[0],p[1]-1,p[2])-CALENDAR.tOf(1))/86400000)+1; };
  const T=(k,h)=>S.DK(k)*24+h;
  const NOW=G=>G.day*24+(+G.hour||0);
  const WD=['日','一','二','三','四','五','六'];
  const wdOf=d=>typeof CALENDAR!=='undefined'?CALENDAR.dateOf(d).wd%7:0;
  S.dateLabel=(day,h)=>{ const D=typeof CALENDAR!=='undefined'?CALENDAR.dateOf(day):{m:0,d:0}; const m=Math.round(h*60); return D.m+'/'+D.d+'（'+WD[wdOf(day)]+'）'+String(Math.floor(m/60)%24).padStart(2,'0')+':'+String(m%60).padStart(2,'0'); };
  const GRAD='2029-06-02';
  const SEA_DAY0='2030-06-01', SEA_DAY='2030-06-02';   /* 學姊 2030 年的生日（AA_382 第 4 節）*/
  S.gradDay=()=>S.DK(GRAD);
  const Y={2029:{note:'2029-08-03',exam:'2029-08-04',r1:'2029-09-07',e2a:'2029-10-20',e2b:'2029-10-21',r2:'2029-12-14'},2030:{note:'2030-08-02',exam:'2030-08-03',r1:'2030-09-06',e2a:'2030-10-19',e2b:'2030-10-20',r2:'2030-12-13'}};
  S.Y=Y;
  /* ---------- 人物 ---------- */
  const FL=['STRANGER','ACQUAINTANCE','FAMILIAR','FRIEND','CLOSE_FRIEND'];
  const law=G=>(G.stage||'law')==='law';
  S.dating=(G,id)=>!!(G&&G.flags&&G.flags['dating_'+id]===true);
  S.isEx=(G,id)=>!S.dating(G,id)&&!!(G&&G.flags&&(G.flags['EX_'+id]||(typeof ROM!=='undefined'&&ROM.isEx&&ROM.isEx(G,id))));
  S.lv=id=>typeof SOCIAL!=='undefined'&&SOCIAL.friendLevel?SOCIAL.friendLevel(id):'STRANGER';
  S.at=(G,id,min)=>S.dating(G,id)||FL.indexOf(S.lv(id))>=FL.indexOf(min||'FAMILIAR');   /* FAMILIAR、FRIEND「以上」（交往中一定算）*/
  const has=(id,tag)=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(id,tag);
  S.partners=G=>typeof ROM!=='undefined'&&ROM.partners?ROM.partners(G):Object.keys(G.flags||{}).filter(k=>/^dating_/.test(k)&&G.flags[k]===true).map(k=>k.slice(7));
  S.exchDelayed=G=>!!(typeof STORY!=='undefined'&&STORY.routeAbroadRoute&&STORY.routeAbroadRoute(G));   /* 交換延畢（日本、美國路線）：2029 不能考，2030 考 */
  S.delayed=G=>S.exchDelayed(G)||!!(G&&G.flags&&G.flags.FAIL_DELAY&&(G.stage||'law')==='law');   /* ＋大四下被當的延畢（D14-T5B，AA_421 1-2：6/18 成績單那一刻起；src/faildelay3d.js）。只屬於交換的句子用 S.exchDelayed */
  const DLY=(G,k,v)=>{ const D=S.exchDelayed(G)&&L().DELAYED; return D&&D[k]!=null?D[k]:v; };   /* 交換延畢的那一句（POSTGRAD_LINES.DELAYED，AA_381 第 1 節）；不是交換延畢、沒有寫的照原本 */
  S.dly=DLY;
  S.lean=G=>(typeof STORY!=='undefined'&&STORY.careerLean?STORY.careerLean(G):null)||{A:0,B:0,C:0,top:'B'};
  const nm=id=>typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(id):((typeof CHARACTERS!=='undefined'&&CHARACTERS[id]&&CHARACTERS[id].name)||id);
  const nmD=(G,id)=>(S.dating(G,id)&&typeof SOCIAL!=='undefined'&&SOCIAL.datingName&&SOCIAL.datingName(id))||nm(id);   /* 交往中的叫法（學姊＝書瑀；AA_327 2-Y4-42「照程式現有的稱呼規則」）*/
  S.who=(G,w)=>{ if(w==null) return null; if(w==='me') return {name:G.name||'祐廷'}; if(typeof w==='object') return w; return {name:nmD(G,w),charId:w}; };
  S.sisOk=G=>!S.isEx(G,'heroine_05')&&S.at(G,'heroine_05','FRIEND');
  /* 抓包以後分手、還沒重建的（AA_227 的 D；AA_437 第 5 節）：她現在是前任，而且最近一次分開是被發現的那幾種（multirel3d.js 的 CAUGHT_HOW：two_hearts、mrel、zq_zr、caught、told）；
     那一筆沒有 how（舊存檔）照 EX_<id>_REASON 'caught'（v6ex3d.js）。重新交往過、後來好好分開的照最近那一次。以安、語彤：新 21／事件 17 照 AA_319「點頭，不說話」*/
  S.CAUGHT_HOW=['two_hearts','mrel','zq_zr','caught','told'];
  S.exCaught=function(G,id){ if(!S.isEx(G,id)) return false; const R=G.flags.romance&&G.flags.romance[id], H=R&&Array.isArray(R.history)?R.history:[]; let e=null; for(let i=H.length-1;i>=0;i--) if(H[i]&&H[i].ev==='end'){ e=H[i]; break; }
    if(e&&e.how) return ((typeof MREL!=='undefined'&&Array.isArray(MREL.CAUGHT_HOW)&&MREL.CAUGHT_HOW)||S.CAUGHT_HOW).includes(e.how); return G.flags['EX_'+id+'_REASON']==='caught'; };
  const BG=id=>typeof OUT!=='undefined'&&OUT.bg?OUT.bg(id):'dark';
  const adv=()=>typeof ADV!=='undefined'?ADV:null;
  /* ---------- 存檔 ---------- */
  S.rec=G=>{ const F=G.flags||(G.flags={}); const r=F.PG&&typeof F.PG==='object'?F.PG:(F.PG={}); if(!r.done||typeof r.done!=='object') r.done={}; return r; };
  S.done=(G,id)=>!!S.rec(G).done[id];
  S.on=G=>!!G&&!!G.flags&&law(G)&&!!G.flags.GRADUATED&&S.done(G,'grad')&&!G.flags.EPILOGUE_DONE;   /* 畢業後篇：跳到下一件事、課表不跳 */
  /* ---------- 時間 ---------- */
  const setT=(G,E,day,h)=>{ if(day!==G.day){ G.day=day; G.weekday=wdOf(day); G.energy=100; if(G.flags) G.flags.companion=null; G.weather=(typeof CALENDAR!=='undefined'&&CALENDAR.typhoon&&CALENDAR.typhoon(day))?'rain':'clear'; } G.hour=h; if(E) E.hour=G.hour; };
  S.setT=setT;
  const toAtLeast=(GM,t)=>{ const G=GM.G; if(NOW(G)>=t-1e-6) return false; const d=Math.floor(t/24); setT(G,GM.E,d,t-d*24); if(GM.updateHUD) GM.updateHUD(); return true; };   /* 只往前，不倒回去 */
  S.toAtLeast=toAtLeast;
  /* ---------- 國考 ---------- */
  S.sits=(G,y)=>{ const F=G.flags||{}; if(y===2029) return F.BAR_REG===true&&!S.delayed(G); return S.delayed(G)?F.BAR_REG_2030===true:(F.BAR_SIT_2029===true&&S.stage(G,2029)==='none'); };   /* 2030：交換延畢（第一次考）、2029 一試不到 12 題（AA_319 1A-18 第 7 節）*/   /* AA_357 1-6：交換延畢的 2030 看 BAR_REG_2030（2030-05-10 21:00 問一次，沒回答＝不報名）；原本 BAR_REG!==false＝沒問就算報名 */
  S.retaker=G=>!S.delayed(G)&&G.flags.BAR_SIT_2029===true&&S.stage(G,2029)==='none';
  S.tier=(y,k)=>k>=16?'both':((k>=12||y===2030)?'lawyer':'none');   /* AA_286 第 2 節；第二年不到 12 題也進律師二試（2-1）*/
  S.stage=(G,y)=>{ const F=G.flags||{}; if(F['BAR_STAGE_'+y]) return F['BAR_STAGE_'+y]; return F['BAR_SIT_'+y]?S.tier(y,F['BAR_SCORE_'+y]|0):null; };
  S.stage2=(G,y)=>{ const s=S.stage(G,y); return s==='both'||s==='lawyer'; };
  S.N_Q=20;
  S.pool=function(){ const out=[]; if(typeof EXAM_BANK!=='undefined') for(const q of EXAM_BANK.questions) if(q.status==='USER_CONFIRMED'||q.status==='AI_CROSS_REVIEWED'||q.status==='Y4_CROSS_REVIEWED') out.push(q);
    if(typeof QBANK!=='undefined') for(const q of QBANK) if(q.complete!==false) out.push(q); return out; };   /* 四年各科期末考的題庫＋刑訴（AA_126 第 3 節）*/
  const hashStr=str=>{ let h=2166136261>>>0; for(let i=0;i<str.length;i++){ h^=str.charCodeAt(i); h=Math.imul(h,16777619)>>>0; } return h>>>0; };
  const rng=seed=>()=>{ seed|=0; seed=seed+0x6D2B79F5|0; let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };
  S.draw=function(G,y){ const R=S.rec(G), X=R.exam&&typeof R.exam==='object'?R.exam:(R.exam={}), pool=S.pool(), byId=new Map(pool.map(q=>[q.id,q]));
    if(X[y]&&Array.isArray(X[y].qs)&&X[y].qs.length){ const qs=X[y].qs.map(id=>byId.get(id)).filter(Boolean); if(qs.length===X[y].qs.length) return qs; }
    const used=new Set(); for(const k in X) if(+k!==+y) for(const id of (X[k].qs||[])) used.add(id);   /* 第二年換一組（AA_286 2-1）*/
    const F=G.flags; if(F.examSeed==null) F.examSeed=Math.floor(Math.random()*1e9);
    const r=rng(hashStr(F.examSeed+'|bar|'+y)), a=pool.filter(q=>!used.has(q.id)); for(let i=a.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); const x=a[i]; a[i]=a[j]; a[j]=x; }
    const qs=a.slice(0,S.N_Q); X[y]={qs:qs.map(q=>q.id)}; return qs; };
  S.opts=q=>q.type==='tf'||!q.options?['對','錯'].map(t=>({t,v:t})):Object.keys(q.options).map(k=>({t:'（'+k+'）'+q.options[k],v:k}));   /* 照期末考的介面（classes3d.js optList）*/
  /* ---------- 研究所、職涯（1A-01 的傾向＋考試；尾聲、第一份工作同一套）：研究所的旗標開發分支還沒有（AA_327 2-Y4-06、2-Y4-34）---------- */
  S.gradApplied=G=>{ const F=G.flags||{}; return F.Y4_PATH==='grad'||F.GRAD_ADMIT!=null||F.Y4_PUSH!=null||F.GRAD_RETRY!=null; };
  S.gradAdmit=G=>{ const F=G.flags||{}; return (F.GRAD_ADMIT!=null&&F.GRAD_ADMIT!==false&&F.GRAD_ADMIT!=='fail')||F.Y4_PUSH==='pass'; };
  S.zqLine=G=>S.lean(G).top==='C'&&S.at(G,'heroine_04','FRIEND')&&G.flags.ZQ_CONTRACT!=null&&G.flags.ZQ_CONTRACT!==false;   /* 子晴線達成：落點 C、FRIEND 以上、Q14 有回（AA_323 1B-23 第 4 節：lawyer／legal_aid／honest 三個都算陪她去找律師；src/y34b3d.js）*/
  S.path=function(G){ const F=G.flags||{}, c=S.lean(G); let top=c.top;
    if(top==='B'&&!S.gradApplied(G)) top=(c.C>c.A)?'C':'A';   /* B、四年沒報考研究所：改用 A、C 裡分數比較高的（再平手 A）*/
    if(top==='A') return F.BAR_YEAR!=null?'A_bar':'A_none';
    if(top==='B') return S.gradAdmit(G)?'B_grad':'B_quit';
    return S.zqLine(G)?'C_zq':'C'; };
  /* ---------- 台詞 ---------- */
  S.play=async function(GM,arr){ const G=GM.G, A=adv(); for(const x of (arr||[])){ if(!x) continue;
      if(Array.isArray(x)){ await GM.say(S.who(G,x[0]),x[1]); continue; }
      if(x.cg!==undefined){ if(A&&A.cg) A.cg(x.cg); continue; }   /* 沒登錄的圖＝不顯示（BCG-39）*/
      if(typeof x==='string') await GM.say(null,x); } };
  /* ---------- 手機 ---------- */
  const P_=(id,t)=>({th:'p:'+id,from:id,text:t});
  const GR=(from,t)=>from==null?{th:'g:noodle_team',who:null,text:t}:{th:'g:noodle_team',from,text:t};
  const grp=arr=>arr.map(x=>GR(x[0],x[1]));
  const FAM=(from,t)=>from==='kevin'?{th:'g:family_law',from:'kevin',name:'Kevin',text:t}:{th:'g:family_law',from,name:'溫學姊',text:t};
  const inNoodle=G=>typeof PHONE!=='undefined'&&PHONE.inGroup(G,'noodle_team');
  const inFam=G=>typeof PHONE!=='undefined'&&PHONE.inGroup(G,'family_law');
  const graduated=G=>S.done(G,'grad');
  S.tePicked=G=>{ const R=G.termend&&G.termend.Y4S2; return R&&R.picked?R.picked.who:null; };
  S.teDone=G=>{ const R=G.termend&&G.termend.Y4S2; return R&&R.done?R.done.who:null; };
  S.zqInvite=G=>{ if(!graduated(G)||S.tePicked(G)||S.isEx(G,'heroine_04')||typeof TERMEND==='undefined') return null; if(S.dating(G,'heroine_04')) return 'gf';
    const w=TERMEND.windowOf?TERMEND.windowOf('Y4S2'):null; let h=false; try{ h=!!w&&TERMEND.heartWhy(G,'heroine_04',w)===true; }catch(e){ h=false; } return h?'heart':null; };
  S.zqItems=function(G){ const TE=L().TE, kind=S.zqInvite(G); if(!kind) return []; const think=typeof TERMEND!=='undefined'?(TERMEND.rec(G).think||{}):{};
    let inv=[].concat(kind==='gf'?TE.GF.heroine_04.invite:(think.heroine_04!=null?TE.HEART.heroine_04.invite2:TE.HEART.heroine_04.invite)); const dec=TE.HEART.heroine_04.decline;
    if(S.delayed(G)) inv=kind==='gf'?[].concat(DLY(G,'zqGf',inv)):[DLY(G,'zqFirst',inv[0])].concat(inv.slice(1));   /* 交換延畢：「欸 學士服很好看」（AA_381 第 1 節）*/
    const ask={id:'pg_zq_dm',until:T(GRAD,17.75),opts:[{t:'好。',set:{PG_TE_PICK:'heroine_04|'+kind}},{t:'今天晚上我有約了。',say:[{from:'heroine_04',text:dec}]}]};
    return inv.map((t,i)=>Object.assign(P_('heroine_04',t),i===inv.length-1?{ask}:{})); };   /* 16:30 私訊；手機的兩個回答照 termend3d.js（「好。」／TERMEND_LINES.AUTO_ME_GRAD）*/
  S.bdayKnown=G=>graduated(G)&&inFam(G);   /* AA_523 3-3（企劃線 0d7b5388b；AA_470 5-2：家族群組的貼文在群組的人都收得到）：原本只有朋友以上、前任；能不能去研究室照舊（S.planBday：朋友以上；前任只有傳不傳）*/
  S.kevinItems=function(G){ const B=L().BDAY, m=FAM('kevin',B.kevin); if(S.isEx(G,'heroine_05')) m.ask={id:'pg_sis_ex_bday',until:T(GRAD,27),opts:[{t:B.exOpts[0],post:false,set:{PG_SIS_EX_BDAY:'send'}},{t:B.exOpts[1],post:false,set:{PG_SIS_EX_BDAY:'no'}}]};   /* 前任：沒有「去」，只有傳不傳 */
    else if(!S.sisOk(G)){ const Y=typeof SISB16_LINES!=='undefined'&&SISB16_LINES.bdayCD; if(Y) m.ask={id:'pg_sis_bday_cd',until:T(GRAD,27),opts:[{t:Y.t,say:[FAM('heroine_05',Y.r)]}]}; }   /* AA_523 3-3：C、D（不到朋友）收到、沒有出遊，只能在群組回「生日快樂。」→ 她「謝謝。」*/
    return [m]; };
  S.notePhoto=(G,y)=>S.sisOk(G)&&!S.noteInPerson(G,y);
  S.noteInPerson=(G,y)=>S.sisOk(G)&&(S.dating(G,'heroine_05')||(!(y===2030&&S.retaker(G))&&S.partners(G).length===0));   /* 交往中，或雙方都單身＝考場門口當面給；2030 重考的只有交往中當面（AA_327 2-Y4-51）*/
  S.noteItems=function(G,y){ const N=L().NOTE; if(y===2030&&S.retaker(G)) return [P_('heroine_05',N.retake.photo),{th:'p:heroine_05',who:null,text:N.retake.note}];
    return [P_('heroine_05',N.photo)].concat(N.lines.map(x=>x[0]==='me'?{th:'p:heroine_05',from:'player',text:x[1]}:P_('heroine_05',x[1]))); };
  S.zhe2030=G=>{ const Z=L().Y2030.zhe; return (G.flags.BAR_YEAR===2029?Z.done:(S.sits(G,2030)?Z.both:Z.none)).map(t=>GR('zhe',t)); };
  const yearMsgs=y=>{ const K=Y[y]; return [
    {tag:'pg_note_'+y,at:[K.note,21],cond:G=>S.sits(G,y)&&S.notePhoto(G,y),items:G=>S.noteItems(G,y)},
    {tag:'pg_go_'+y,at:[K.exam,7.5],cond:G=>S.sits(G,y)&&inNoodle(G),items:G=>grp(L().EXAM.go)},
    {tag:'pg_none_'+y,at:[K.exam,17.5],cond:G=>y===2029&&!S.sits(G,2029)&&inNoodle(G),items:G=>grp(L().EXAM.none)},
    {tag:'pg_kxnone_'+y,at:[K.exam,17.5+2/60],cond:G=>y===2029&&!S.sits(G,2029)&&S.dating(G,'kexin'),items:G=>L().EXAM.kexinNone.concat(S.delayed(G)?[L().EXAM.kexinLate]:[]).map(t=>P_('kexin',t))},
    {tag:'pg_r1g_'+y,at:[K.r1,15],cond:G=>inNoodle(G)&&(y===2029||S.sits(G,2030)),items:G=>grp(y===2030&&L().R1.group2030||L().R1.group)},   /* AA_471 第 3 節：四次放榜各一版（2029-09-07 原句）*/
    {tag:'pg_r1f_'+y,at:[K.r1,15+6/60],cond:G=>y===2029&&G.flags.BAR_SIT_2029===true&&inNoodle(G),items:G=>grp(L().R1.friends.concat(S.stage(G,2029)==='none'?L().R1.low:[]))},
    {tag:'pg_r1kx_'+y,at:[K.r1,15+8/60],cond:G=>y===2029&&S.dating(G,'kexin'),items:G=>[P_('kexin',L().R1.kexin)].concat(S.stage2(G,2029)?[P_('kexin',L().R1.kexinBoth)]:[])},
    {tag:'pg_r1sis_'+y,at:[K.r1,15+20/60],cond:G=>y===2029&&G.flags.BAR_SIT_2029===true&&S.stage(G,2029)==='none'&&S.sisOk(G),items:G=>L().R1.sisLow.map(t=>P_('heroine_05',t))},
    {tag:'pg_r2g_'+y,at:[K.r2,15],cond:G=>inNoodle(G)&&(y===2029||S.sits(G,2030)),items:G=>grp(y===2030&&L().R2.group2030||L().R2.group)},
    {tag:'pg_r2f_'+y,at:[K.r2,15+6/60],cond:G=>y===2029&&S.stage2(G,2029)&&inNoodle(G),items:G=>[GR('zhe',L().R2.zhe)].concat(L().R2.bohan.map(t=>GR('classmate_bohan',t)))},
    {tag:'pg_r2late_'+y,at:[K.r2,15+5/60],cond:G=>y===2029&&S.delayed(G),items:G=>[P_('zhe',L().R2.zheLate)]},
    /* 可昕考上律師（交往中、沒報 2029 國考）：原本 15:05 兩則私訊（pg_r2kx_2029），AA_296 2-3-1 ③ 起改成她打來的電話＝場景 kx_bar_2029（S.STEPS）；沒接＝那兩則（S.kxBarMissed）*/
    {tag:'pg_r2sis_'+y,at:[K.r2,15+20/60],cond:G=>G.flags.BAR_YEAR===y&&S.sisOk(G)&&(y===2029||S.sits(G,2030)),items:G=>(y===2030&&S.retaker(G)?L().R2.sis2:L().R2.sis).map(t=>P_('heroine_05',t))} ]; };   /* AA_327 2-Y4-60（第二年才上：2-Y4-51）*/
  S.MSGS=[
    /* 1A-13 前一晚 */
    {tag:'pg_ps_eve',at:['2029-06-01',22],cond:G=>S.dating(G,'classmate_peishan'),items:G=>[P_('classmate_peishan',L().PARTNER.classmate_peishan.eve)]},
    {tag:'pg_zr_eve',at:['2029-06-01',23],cond:G=>S.dating(G,'heroine_02'),items:G=>[P_('heroine_02',L().PARTNER.heroine_02.eve)]},
    /* 1A-13 ⑦ 手機（不在現場的人）*/
    {tag:'pg_kx_ex',at:[GRAD,12],cond:G=>S.isEx(G,'kexin'),items:G=>L().PHONE.kexinEx.text.map(t=>P_('kexin',t))},
    {tag:'pg_sis_ex',at:[GRAD,12],cond:G=>S.isEx(G,'heroine_05'),items:G=>[P_('heroine_05',DLY(G,'thermosEx',L().THERMOS.ex))]},
    {tag:'pg_ps_card',at:[GRAD,12.5],cond:G=>!S.dating(G,'classmate_peishan')&&!S.isEx(G,'classmate_peishan')&&!!G.flags.PS_RECONNECT&&S.at(G,'classmate_peishan','FAMILIAR'),items:G=>DLY(G,'peishan',L().PHONE.peishan.text).map(t=>P_('classmate_peishan',t)),after:G=>{ G.flags.PS_GRAD_CARD=true; }},   /* AA_327 2-Y4-53：收過照片記 PS_GRAD_CARD */
    {tag:'pg_fy',at:[GRAD,13],cond:G=>!S.isEx(G,'npc_fangyt')&&S.at(G,'npc_fangyt','FAMILIAR'),items:G=>L().PHONE.fangyt.text.map(t=>P_('npc_fangyt',t))},
    {tag:'pg_zr_photo',at:['2029-06-03',5+7/60],cond:G=>!S.dating(G,'heroine_02')&&!S.isEx(G,'heroine_02')&&S.at(G,'heroine_02','FAMILIAR'),items:G=>DLY(G,'zhiruo',L().PHONE.zhiruo.text).map(t=>P_('heroine_02',t))},
    /* 1A-14 */
    {tag:'pg_zq_dm',at:[GRAD,16.5],cond:G=>!!S.zqInvite(G),items:G=>S.zqItems(G)},
    {tag:'pg_cafe_photo',at:[GRAD,17.5],cond:G=>graduated(G)&&!!S.tePicked(G)&&inNoodle(G),items:G=>[GR('zhe',L().CAFE.photo)],after:G=>{ G.flags.GRAD_CAFE_HEARD=true; }},   /* 接了一對一：記「聽說」*/
    {tag:'pg_kevin_bday',at:[GRAD,19.5],cond:G=>S.bdayKnown(G),items:G=>S.kevinItems(G),after:G=>S.planBday(G)},
    {tag:'pg_sis_lover_dm',at:[GRAD,19.5+1/60],cond:G=>graduated(G)&&S.dating(G,'heroine_05')&&S.tePicked(G)!=='heroine_05',items:G=>L().BDAY.loverDm.map(t=>P_('heroine_05',t)),after:G=>S.planBday(G)},
    {tag:'pg_sis_thanks',at:['2029-06-03',10],cond:G=>{ const q=typeof OUT!=='undefined'?OUT.get(G,'pg_sis_bday'):null; return !!q&&q.state==='missed'&&inFam(G); },items:G=>[FAM('heroine_05',L().BDAY.thanks)]},
    {tag:'pg_kx_inv',at:['2029-06-03',21],cond:G=>graduated(G)&&S.dating(G,'kexin'),items:G=>[P_('kexin',L().KX.invite)],after:G=>S.planKx(G)},
    /* 1A-16～18 */
    {tag:'pg_b1_zhe',at:['2029-07-12',17],cond:G=>S.sits(G,2029)&&inNoodle(G),items:G=>[GR('zhe',L().B1.zhe)]},
    {tag:'pg_b1_zhe_2030',at:['2030-07-11',17],cond:G=>S.sits(G,2030)&&!!L().B1_2030,items:G=>[P_('zhe',L().B1_2030.zhe)]},   /* AA_331：2030 阿哲私訊（不發群組）*/
    {tag:'pg_an_group',at:['2030-01-25',21],win:6,cond:G=>(!S.at(G,'heroine_01','FRIEND')||(S.isEx(G,'heroine_01')&&S.rec(G).done.an2!==1))&&inNoodle(G),items:G=>[GR('heroine_01',L().AN.group)]},   /* 和以安不到 FRIEND：麵店團一則（到了的是她打來的電話）；前任也是這一則（AA_473 第 2 節；舊版本已經演過電話 an2 的存檔不再發）*/
    /* win:6（AA-B 10-30 13:33 回 B）：以安二試、司法官放榜那兩則群組和電話版 an1／an2 同一段——到隔天 03:00 以前條件成立才補（訊息照樣標 21:00），過了就不補（BB-B R43 PGF10_AN_EX_LATE：沒寫 win＝48 小時內都補）。測試：node tests/pg_an_ex_win_unit.js */
    {tag:'pg_an_ex1',at:['2029-12-14',21],win:6,cond:G=>S.isEx(G,'heroine_01')&&S.at(G,'heroine_01','FRIEND')&&inNoodle(G)&&S.rec(G).done.an1!==1,items:G=>[GR('heroine_01',L().AN.exGroup1)]},   /* 舊版本已經演過電話 an1 的存檔不再發（不重演）*/   /* AA_473 第 2 節：前任（FRIEND 以上，原本會打電話的）二試放榜改成麵店團一則，不演電話、不講美國那份申請 */
    {tag:'pg_yt_2030_r1',at:['2030-09-06',15+10/60],cond:G=>inNoodle(G)&&S.at(G,'heroine_03','FAMILIAR'),items:G=>L().Y2030.yt1.map(t=>GR('heroine_03',t))},
    {tag:'pg_zhe_2030_r2',at:['2030-12-13',15+6/60],cond:G=>inNoodle(G),items:G=>S.zhe2030(G)},
    {tag:'pg_yu_2030_r2',at:['2030-12-13',15+8/60],cond:G=>inNoodle(G),items:G=>[GR('yu',L().Y2030.yu)]},
    {tag:'pg_yt_2030_r2',at:['2030-12-13',15+10/60],cond:G=>inNoodle(G)&&S.at(G,'heroine_03','FAMILIAR'),items:G=>L().Y2030.yt2.map(t=>GR('heroine_03',t))},
    /* 學姊 2030 年的生日（AA_382 第 4 節）*/
    {tag:'pg_sis_sea_ask',at:[SEA_DAY0,21],cond:G=>S.seaOk(G),items:G=>S.seaItems(G)},
    {tag:'pg_sis_sea_late',at:[SEA_DAY,9.5],cond:G=>S.seaOk(G)&&G.flags.PG_SIS_SEA==='yes'&&G.flags.SIS_BDAY_Y5!=='sea'&&S.seaMissed(G),items:G=>[P_('heroine_05',L().SEA_Y5.late)]},   /* 回了「好。」、9:00 卻沒到（出遊錯過，116d5c72）：09:30 她先傳一則，15:00 照片照下一筆 */
    {tag:'pg_sis_sea_alone',at:[SEA_DAY,15],cond:G=>S.seaOk(G)&&typeof PHONE!=='undefined'&&PHONE.sent(G,'pg_sis_sea_ask')&&G.flags.SIS_BDAY_Y5!=='sea',items:G=>L().SEA_Y5.alone.map(t=>P_('heroine_05',t)),after:G=>{ G.flags.SIS_BDAY_Y5='alone'; }} ].concat(yearMsgs(2029),yearMsgs(2030));
  /* ---------- 出遊（可以不去的）---------- */
  S.PLAZA={x:-34,z:12.5,yaw:Math.PI};   /* 傅鐘廣場北緣（zones3d.js：傅鐘 (-38,16.5)）*/
  S.planTe=function(G,who,kind){ if(typeof TERMEND==='undefined'||typeof OUT==='undefined') return false; const TE=L().TE, spec=(kind==='heart'?TE.HEART:TE.GF)[who]; if(!spec) return false;
    const second=kind==='heart'&&(TERMEND.rec(G).think||{})[who]!=null, h=(second&&spec.h2)||spec.h||17.5;
    const te=kind==='heart'?TERMEND.heart(who,'Y4S2'):TERMEND.gf(who,'Y4S2'), PL=(typeof TERMEND_LINES!=='undefined'&&TERMEND_LINES.PLACE[te&&te.place])||{}, pname=(te&&te.placeName)||PL.name||'';
    TERMEND.rec(G,'Y4S2').picked={who,kind,day:G.day};
    const c=OUT.get(G,'pg_grad_cafe'); if(c&&c.state==='planned') c.state='cancelled';   /* 接了一對一的不去 Café */
    return OUT.plan(G,{id:'te_'+(kind==='gf'?'gf_':'')+'Y4S2'+(kind==='gf'?'_'+who:''),ev:'ev_termend_dinner',day:S.gradDay(),h,late:0.25,place:pname,title:'學期末的飯：'+nm(who)+(pname?'（'+pname+'）':''),travel:'走過去約 15 分鐘',travelH:0.25,te:{term:'Y4S2',who,kind}}); };
  S.planCafe=G=>typeof OUT!=='undefined'&&OUT.plan(G,{id:'pg_grad_cafe',goto:{zone:'cafe',x:0,z:5,yaw:Math.PI},day:S.gradDay(),h:17.5,late:0.25,place:'兩點半 Café',title:'兩點半 Café',travel:'走過去約 15 分鐘',travelH:0.25});   /* 窗口 17:15～17:45 */
  S.planBday=function(G){ if(typeof OUT==='undefined'||OUT.get(G,'pg_sis_bday')||S.isEx(G,'heroine_05')||S.tePicked(G)==='heroine_05') return false; if(!S.sisOk(G)) return false;
    return OUT.plan(G,{id:'pg_sis_bday',ev:'ev_pg_sis_bday',day:S.gradDay(),h:20.5,late:0.5,place:'法律系館A・研究室',title:'學姊的生日：研究室，八點半',travel:'走過去約 10 分鐘',travelH:1/6}); };
  S.planKx=G=>typeof OUT!=='undefined'&&OUT.plan(G,{id:'pg_kx_grad',ev:'ev_pg_kx_grad',day:S.DK('2029-06-09'),h:16.5,late:0.5,place:'木柵大學',title:'兩個畢業典禮（木柵大學）',travel:'開車約 40 分鐘',travelH:2/3});
  /* 學姊 2030 年的生日（AA_382 第 4 節，企劃線 e6d4a198）：畢業以後和學姊交往中（她在臺灣上班）。6/1（六）21:00 私訊「好。」／「明天不行。」（沒回＝到 6/2 09:00 為止）→
     「好。」＝6/2（日）09:00 她家樓下（跳過時間、睡覺停在出發前），開車約一小時到北海岸；沒去（明天不行、沒回、約了沒到）＝6/2 15:00 她傳照片「看到了。」；約了沒到的 09:30 先傳「九點半了。我先去。」（企劃線 116d5c72）。
     旗標 SIS_BDAY_Y5（sea／alone），和 SIS_BDAY_Y1～Y4 同一套；6/2 那天算有事（src/pgdates3d.js 的 busyDays：固定格不排在那天）*/
  S.seaOk=G=>!!G&&!!G.flags&&!!G.flags.GRADUATED&&S.dating(G,'heroine_05')&&!G.flags.EPILOGUE_DONE;
  S.seaMissed=G=>{ const o=typeof OUT!=='undefined'&&OUT.get?OUT.get(G,'pg_sis_sea'):null; return !!o&&o.state==='missed'; };   /* 答應了、出遊錯過（9:30 還沒到，或出發前選了不去）*/
  S.seaItems=function(G){ const Y=L().SEA_Y5, a=P_('heroine_05',Y.ask[0]), b=P_('heroine_05',Y.ask[1]);
    b.ask={id:'pg_sis_sea',until:T(SEA_DAY,9),opts:[{t:Y.opts[0],set:{PG_SIS_SEA:'yes'}},{t:Y.opts[1],set:{PG_SIS_SEA:'no'},say:[{from:'heroine_05',text:Y.no}]}]}; return [a,b]; };
  S.planSea=G=>typeof OUT!=='undefined'&&OUT.plan(G,{id:'pg_sis_sea',ev:'ev_pg_sis_sea',day:S.DK(SEA_DAY),h:9,late:0.5,place:'她家樓下',title:'學姊的生日：九點，她家樓下',travel:'開車約 15 分鐘',travelH:0.25,back:'回到臺北。',alarm:true,who:'heroine_05'});
  S.planNoodle=(G,y)=>typeof OUT!=='undefined'&&OUT.plan(G,{id:'pg_bar_noodle_'+y,ev:'ev_pg_noodle',day:S.DK(Y[y].r2),h:18,late:0.5,place:'阿鳳麵店',title:'阿鳳麵店・長桌',travel:'走過去約 15 分鐘',travelH:0.25});
  /* ---------- 手機規則（story3d.js 的 S.tick、跳的途中照時間）---------- */
  S.rules=function(GM){ const G=GM&&GM.G?GM.G:GM; if(!G||!G.flags||!law(G)) return; const now=NOW(G); if(now<T('2029-05-10',0)) return; const F=G.flags;
    if(F.Y4_PATH==='bar'&&F.BAR_REG==null&&now>=T('2029-05-10',21)&&!S.delayed(G)) F.BAR_REG=true;   /* 已經報名的：沒有提醒（X1）。交換延畢的 2029 不考、不設（AA_357 1-6：7/14 照「沒報名」那一版）*/
    if(typeof PHONE!=='undefined') for(const m of S.MSGS){ if(PHONE.sent(G,m.tag)) continue; const t=T(m.at[0],m.at[1]); if(now<t-0.5||now>t+(m.win!=null?m.win:48)) continue; let ok=false; try{ ok=!!m.cond(G); }catch(e){ ok=false; } if(!ok) continue;   /* win：過了幾小時就不補（沒寫＝48；例：可昕畢業以後「我們的日子」的開頭那一則＝那一段的第一週內，src/pgdates3d.js）*/
      const d=Math.floor(t/24); let items=[]; try{ items=m.items(G)||[]; }catch(e){ console.warn('PG msg '+m.tag,e); continue; } if(items.length&&PHONE.at(G,d,t-d*24,items,m.tag)&&m.after) m.after(G); }
    if(F.PG_SIS_SEA==='yes'&&S.seaOk(G)&&typeof OUT!=='undefined'&&!OUT.get(G,'pg_sis_sea')) S.planSea(G);   /* 6/1 21:00 回了「好。」*/
    if(F.SIS_BDAY_Y5==null&&typeof PHONE!=='undefined'&&PHONE.sent(G,'pg_sis_sea_ask')&&now>=T('2030-06-03',0)) F.SIS_BDAY_Y5='alone';   /* 15:00 那則沒送到（那時已經分手）也記一次 */
    if(typeof F.PG_TE_PICK==='string'){ const [who,kind]=F.PG_TE_PICK.split('|'); delete F.PG_TE_PICK; if(!S.tePicked(G)) S.planTe(G,who,kind); }   /* 子晴 16:30 的邀約回了「好。」*/
    if(F.PG_SIS_EX_BDAY==='send'&&typeof PHONE!=='undefined'&&!PHONE.sent(G,'pg_sis_ex_bday_reply')){ const B=L().BDAY, R=DLY(G,'bdayEx',B.exReply), noon=PHONE.sent(G,'pg_sis_ex'); PHONE.post(G,{th:'p:heroine_05',from:'player',text:B.exSend,tag:'pg_sis_ex_bday_reply'}); for(const t of (noon?R.slice(0,1):R)) PHONE.post(G,Object.assign(P_('heroine_05',t),{tag:'pg_sis_ex_bday_reply'})); F.SIS_BDAY_Y4='msg'; }   /* AA_473 第 1 節（企劃線 66393bb91）：中午她已經私訊恭喜過（pg_sis_ex）＝只回「謝謝。」；中午那一則沒送到的（那時候還不是前任）照原本兩句 */
    if(F.PG_SIS_EX_BDAY==='no'&&F.SIS_BDAY_Y4==null) F.SIS_BDAY_Y4='none';
    const done=S.teDone(G); if(done&&!F.GRAD_EVENING) F.GRAD_EVENING='date:'+done;
    if(graduated(G)&&!F.GRAD_EVENING&&now>=(S.gradDay()+1)*24) F.GRAD_EVENING='none';
    if(!F.GRADUATED&&now>=T('2029-06-04',0)){ F.GRADUATED=S.gradDay(); if(!S.rec(G).done.grad) S.rec(G).done.grad='missed'; }
    if(F.GRADUATED&&!F.GRAD_DONE) F.GRAD_DONE=true;   /* 閒聊階梯的 skipIf GRAD_DONE（story3d.js 撥穗那一句設；讀檔、跳過、舊存檔在這裡補）*/   /* 6/2 那一段沒演到（讀檔、跳過）也算畢業了：不卡在學生的作息裡 */
    for(const f of S.RULES){ try{ f(G,GM&&GM.G?GM:null); }catch(e){ console.warn('PG.RULES',e); } } };   /* 別的模組的規則（S.RULES.push(fn)，fn(G, GM)）：每 0.5 秒、跳的每一步都跑（例：畢業以後的固定格到了該問的時間＝排成出遊，src/pgdates3d.js）*/
  /* ---------- 場景（時間到了、玩家空下來就演）---------- */
  async function regScene(GM){ const G=GM.G, F=G.flags, R=L().REG; if(F.BAR_REG!=null) return; if(typeof PHONE!=='undefined'&&!PHONE.sent(G,'pg_reg_sys')) PHONE.post(G,{th:'sys',text:R.text,tag:'pg_reg_sys'});
    GM.sceneBegin(); try{ await GM.say(null,R.text); const k=await GM.choose(R.opts.map(t=>({t}))); F.BAR_REG=k===0; } finally { GM.sceneEnd(); } }
  /* AA_357 1-6：交換延畢的玩家 2030-05-10（五）21:00 問一次，句子、選項照 2029 那一場；選研究所的也問。記 BAR_REG_2030（沒回答＝不報名）*/
  async function regScene2030(GM){ const G=GM.G, F=G.flags, R=L().REG; if(F.BAR_REG_2030!=null) return; if(typeof PHONE!=='undefined'&&!PHONE.sent(G,'pg_reg_sys_2030')) PHONE.post(G,{th:'sys',text:R.text,tag:'pg_reg_sys_2030'});
    GM.sceneBegin(); try{ await GM.say(null,R.text); const k=await GM.choose(R.opts.map(t=>({t}))); F.BAR_REG_2030=k===0; } finally { GM.sceneEnd(); } }
  /* 舊存檔（讀檔時 game3d.js 的 migrate 叫一次；AA_357 第 6 節）：交換延畢、BAR_REG 被 5/10 自動設成 true 的——2030 的報名問題以前（5/12 以前）清掉，5/10 再問；
     已經過了 2030 的報名時間（5/12 以後）才讀的舊存檔：照舊規則算（BAR_REG 不是 false＝報了名），記 BAR_REG_2030，不讓已經在準備的國考突然取消 */
  S.migrate=function(s){ const F=s&&s.flags; if(!F||typeof F!=='object'||(s.stage||'law')!=='law'||typeof s.day!=='number'||!S.delayed(s)||F.BAR_REG_2030!=null) return false; const now=s.day*24+(+s.hour||0);
    if(now<T('2030-05-12',0)){ if(F.BAR_REG===true){ delete F.BAR_REG; return true; } return false; }
    if(F.PG&&F.PG.done&&F.PG.done.reg_2030){ F.BAR_REG_2030=false; return true; }   /* 這一版排過 2030 的報名問題、錯過了（done＝missed）：沒回答＝不報名，和沒讀檔時一樣（BUG-PG-REG2030-MIGRATE-1021，BB 10-21 20:45）；下面是沒有這一題的舊存檔 */
    F.BAR_REG_2030=F.BAR_REG!==false; return true; };
  S.familyModule=()=>(typeof STORY!=='undefined'&&!!STORY.gradFamily)||(typeof STORY_EVENTS!=='undefined'&&STORY_EVENTS.some(e=>e.id==='ev_grad_family'));   /* 1A-12 主線 12（AA_318，story3d.js S.gradFamily：08:00～12:00，撥穗記 GRADUATED）*/
  S.gradReady=G=>!S.familyModule()||G.day>S.gradDay()||!!(G.events&&G.events.done&&G.events.done.ev_grad_family);   /* 拍照接在家人那一段後面（那一段在演＝玩家不空，不會插進去）*/
  S.CLASS=['zhe','yu','classmate_bohan','classmate_xinci','classmate_mingxuan','heroine_01','classmate_youchen'];   /* 同班（大合照）*/
  S.PARTNER_ORDER=['kexin','heroine_05','heroine_01','heroine_03','heroine_04','heroine_02'];   /* 沛珊在台南：前一晚的訊息、18:00 視訊 */
  /* AA_392 第 8 節：交往中、3/17 她爸爸的晚餐約過卻沒吃到（婉拒、取消、沒到、沒回）——她那一段之前，她爸爸那一小段；當面說過畢業快樂，後面就不再轉述「我爸叫我跟你說：恭喜。」*/
  S.fatherGradDue=G=>{ const F=G.flags; return S.dating(G,'heroine_05')&&F.SIS_FATHER_ASKED!=null&&!F.MET_SIS_FATHER; };
  S.fatherGrad=async function(GM){ const G=GM.G, W=L().THERMOS.fatherGrad; if(!W) return; await S.play(GM,W.lines.map(x=>[x[0],String(x[1]).replace('{name}',G.name||'祐廷')]));
    const k=await GM.choose(W.opts.map(o=>({t:o.t}))); await S.play(GM,(W.opts[k]||W.opts[0]).say); G.flags.MET_SIS_FATHER='grad'; };
  S.thermos=async function(GM){ const G=GM.G, F=G.flags, W=L().THERMOS, sis=S.who(G,'heroine_05'); if(S.fatherGradDue(G)) await S.fatherGrad(GM); await S.play(GM,W.lines.map(x=>Array.isArray(x)&&x[0]==='heroine_05'&&x[1]==='畢業快樂。'?[x[0],DLY(G,'thermos2',x[1])]:x));   /* 交換延畢：「學士服借的吧。……一月還要再穿一次。」*/
    if(F.HOT_WATER) await GM.say(sis,W.hotWater); else if(S.helpedCoffee(G)) await GM.say(sis,W.helped);
    if(F.MET_SIS_FATHER&&F.MET_SIS_FATHER!=='grad') await GM.say(sis,W.father);   /* 最後多一句（AA_319 5ae6a133；MET_SIS_FATHER＝AA_328 3-14，開發分支還沒有）*/
    if(F.SIS7_PHOTO&&typeof SISB16_LINES!=='undefined'&&Array.isArray(SISB16_LINES.thermosPhoto)) await S.play(GM,SISB16_LINES.thermosPhoto);   /* AA_523 5-5（企劃線 0d7b5388b）：階梯 S7-L8 選「一起參加典禮。」（她回「嗯。那天記得拍照。」，記 SIS7_PHOTO）＝最後多兩句 */
    F.SIS_THERMOS=true; };
  S.helpedCoffee=G=>{ const M=G.social&&G.social.mem&&G.social.mem.heroine_05; return !!(M&&M.some(m=>m.tag==='HELPED'&&/黑咖啡/.test(m.note||''))); };   /* 只有 HELPED（空的保溫瓶那次選黑咖啡）*/
  S.mother=async function(GM,partner){ const G=GM.G, M=L().MOTHER, A=adv(); await S.play(GM,M.lines);
    if(partner){ await S.play(GM,M.partner); const k=await GM.choose(M.opts.map(o=>({t:o.t}))); await S.play(GM,(M.opts[k]||M.opts[0]).say); }
    if(A&&A.setBg) A.setBg(BG('graduation_avenue'));   /* 離開 CG-9 那一拍 */
    if(typeof SOCIAL!=='undefined'&&SOCIAL.remember) SOCIAL.remember('heroine_01',M.mem.tag,M.mem.note); };
  S.yt17=async function(GM){ const G=GM.G, Y17=L().YT17, A=adv(); await S.play(GM,Y17.lines); const d=S.dating(G,'heroine_03'), other=!d&&S.partners(G).length>0;
    const cg=!!(d&&Y17.cgDating&&A&&A.cg&&A.cg(Y17.cgDating));   /* CG-21 一把傘（交往中那一句；沒登錄的圖＝不顯示）*/
    await GM.say(S.who(G,'heroine_03'),d?Y17.dating:(other?DLY(G,'yt17Other',Y17.other):DLY(G,'yt17Friend',Y17.friend)));
    if(cg&&A.setBg) A.setBg(BG('graduation_avenue')); };   /* 離開 CG-21 那一拍 */
  S.zrVideo=async function(GM){ const G=GM.G, F=G.flags; if(!S.dating(G,'heroine_02')||F.PG_ZR_VIDEO) return false; F.PG_ZR_VIDEO=true; await S.play(GM,L().PARTNER.heroine_02.video); return true; };   /* 芷若（在英國）：典禮開始前視訊（BB_99 第 6 節）*/
  S.beforeLawCeremony=async function(GM,bg){ const G=GM.G, A=adv(); if(!S.dating(G,'heroine_02')||G.flags.PG_ZR_VIDEO) return false; toAtLeast(GM,S.gradDay()*24+10.5);   /* 1A-12 家人那一段裡：校級典禮完、法律學院典禮（11:00）以前，這裡 10:30＝英國凌晨三點多（AA_476 A-1：視訊不搬到 12:00，句子照原句）*/
    if(A) A.begin({background:BG('video'),right:{charId:'heroine_02',expression:'smile'}}); await S.zrVideo(GM); if(A&&bg) A.begin({background:bg}); return true; };   /* 演完換回家人那一段的背景 */
  S.partnerBeat=async function(GM,id){ const G=GM.G, P=L().PARTNER;
    if(id==='kexin') return S.play(GM,G.flags.GIRAFFE_KEYCHAIN?P.kexin.key:P.kexin.noKey);
    if(id==='heroine_05') return S.thermos(GM);
    if(id==='heroine_01') return S.mother(GM,true);
    if(id==='heroine_03') return S.yt17(GM);
    if(id==='heroine_04') return S.play(GM,P.heroine_04);
    if(id==='heroine_02') return S.play(GM,P.heroine_02.photo); };
  /* ⑧ 拍照的最後當面約（學姊 → 以安 → 語彤）：女朋友的約會、心意邀約（第二次＝G.termend.think）；只能接一個；沒有接＝Café 併桌（以安 → 語彤 → 阿哲說那一句）*/
  S.invites=async function(GM){ const G=GM.G, TE=L().TE; if(typeof TERMEND==='undefined') return; const w=TERMEND.windowOf?TERMEND.windowOf('Y4S2'):null, think=TERMEND.rec(G).think||{}; let picked=S.tePicked(G); const asked=new Set();
    for(const id of ['heroine_05','heroine_01','heroine_03']){ if(S.isEx(G,id)) continue; let kind=null;
      if(S.dating(G,id)) kind='gf'; else { let h=false; try{ h=!!w&&TERMEND.heartWhy(G,id,w)===true; }catch(e){ h=false; } if(h) kind='heart'; }
      if(!kind) continue; asked.add(id); const who=S.who(G,id);
      for(const t of [].concat(kind==='gf'?TE.GF[id].invite:(think[id]!=null?TE.HEART[id].invite2:TE.HEART[id].invite))) await GM.say(who,t);
      const hd=id==='heroine_05'?DLY(G,'sisDecline',TE.HEART[id].decline):TE.HEART[id].decline, ng=(typeof TERMEND_LINES!=='undefined'&&((S.exchDelayed(G)&&TERMEND_LINES.AUTO_NO_GRAD_DELAYED)||TERMEND_LINES.AUTO_NO_GRAD))||{};   /* 交換延畢：「好。……今天恭喜。」／「好。今天恭喜。」*/
      const dec=kind==='heart'?hd:(ng[id]||hd);
      if(picked){ await GM.say(S.who(G,'me'),TE.ME_NO.replace(/[「」]/g,'')); await GM.say(who,dec); continue; }   /* 已經接了一個：同一個晚上只有一場一對一 */
      const k=await GM.choose([{t:TE.ME_OK},{t:TE.ME_NO}]); if(k===0){ S.planTe(G,id,kind); picked=id; } else await GM.say(who,dec); }
    let ask='zhe'; for(const id of ['heroine_01','heroine_03']) if(!asked.has(id)&&!S.dating(G,id)&&!S.isEx(G,id)&&S.at(G,id,'FRIEND')){ ask=id; break; }   /* 伴侶、發了邀約的不揪 Café（AA_250 第 8 節；E3「Café 那句由別人說」）*/
    await GM.say(S.who(G,ask),L().CAFE.ask[ask]); if(!picked) S.planCafe(G); };   /* 接了一對一的不去 Café */
  async function gradScene(GM){ const G=GM.G, F=G.flags, Lx=L(), gd=S.gradDay(), A=adv(), partners=S.partners(G);
    GM.sceneBegin(); try{ await GM.fade(true);
      if(S.dating(G,'heroine_02')&&!F.PG_ZR_VIDEO){ toAtLeast(GM,gd*24+9.5); if(A) A.begin({background:BG('video'),right:{charId:'heroine_02',expression:'smile'}}); await GM.fade(false); await S.zrVideo(GM); await GM.fade(true); if(A&&A.active) A.end(); }   /* 芷若（在英國）：典禮開始前視訊 */
      toAtLeast(GM,gd*24+12);
      if(GM.titleCard) await GM.titleCard(S.dateLabel(G.day,G.hour),(typeof OUT!=='undefined'&&OUT.BG&&OUT.BG.graduation_avenue&&OUT.BG.graduation_avenue.label)||'',2200);
      if(GM.enter&&G.zone!=='campus') await GM.enter('campus',{x:S.PLAZA.x,z:S.PLAZA.z,yaw:S.PLAZA.yaw,lv:0},{noFade:true});
      if(A) A.begin({background:BG('graduation_avenue')}); await GM.fade(false);
      await S.play(GM,Lx.PHOTO.open); if(S.at(G,'heroine_03','FAMILIAR')) await S.play(GM,Lx.PHOTO.yt); await S.play(GM,Lx.PHOTO.hat);   /* ① 大合照 */
      F.GRAD_PHOTO=S.CLASS.filter(id=>S.at(G,id,'FAMILIAR')).concat(S.at(G,'heroine_03','FAMILIAR')?['heroine_03']:[]);
      const ps=S.PARTNER_ORDER.filter(id=>partners.includes(id)), shown=new Set(ps); if(ps[0]) await S.partnerBeat(GM,ps[0]);   /* ② 伴侶永遠是大合照之後的第一個；兩位以上（AA_327 2-Y4-54，U5）：分開演，第二位起在 ⑥ 其他人之前，不演被發現 */
      if(!shown.has('heroine_01')&&S.at(G,'heroine_01','FRIEND')){ if(S.exCaught(G,'heroine_01')) await S.play(GM,Lx.MOTHER.exCaught); else await S.mother(GM,false); }   /* ③ 新 21；前任＝友情版（她介紹朋友，沒有「媽，這是祐廷」，CG-9 照常：AA_123 4-3 V6-A3）；抓包以後分手、還沒重建＝只有那一句旁白，不介紹、沒有 CG-9（AA_437 第 5 節）*/
      if(!shown.has('heroine_05')&&S.sisOk(G)) await S.thermos(GM);   /* ④ W15 */
      if(!shown.has('heroine_03')&&S.at(G,'heroine_03','FRIEND')&&!S.exCaught(G,'heroine_03')) await S.yt17(GM);   /* ⑤ 事件 17；前任＝友情版（AA_123 5-3 V6-A6：照朋友／和別人交往中那一句，沒有 CG-21）；抓包以後分手、還沒重建＝點頭、不說話（AA_437 第 5 節；AA 沒有寫她點頭的旁白＝這一段不演）*/
      for(const id of ps.slice(1)) await S.partnerBeat(GM,id);
      if(!shown.has('heroine_04')&&!S.isEx(G,'heroine_04')&&S.at(G,'heroine_04','FRIEND')) await S.play(GM,Lx.OTHERS.heroine_04);   /* ⑥ */
      if(!S.isEx(G,'classmate_mingxuan')&&S.at(G,'classmate_mingxuan','FAMILIAR')){ await S.play(GM,Lx.OTHERS.mingxuan); if(has('classmate_mingxuan','SAW_HIM_STUDY')) await S.play(GM,Lx.OTHERS.mingxuanSaw); }
      await S.play(GM,DLY(G,'kai',Lx.OTHERS.kai));
      await S.invites(GM);   /* ⑧ */
      F.GRADUATED=F.GRADUATED||G.day; F.GRAD_DONE=true;   /* AA_318 1A-12：GRADUATED＝那一天 */
    } finally { if(A&&A.active) A.end(); GM.sceneEnd(); }
    await GM.fade(true); toAtLeast(GM,gd*24+13.5); await GM.fade(false); }
  async function cafeScene(GM){ const G=GM.G, F=G.flags, C=L().CAFE, A=adv(); GM.sceneBegin(); try{ if(A) A.begin({background:'blur'});
      await S.play(GM,C.open); await S.play(GM,C.pool.filter(x=>S.at(G,x[0],'FAMILIAR')).slice(0,3)); await S.play(GM,C.close); F.GRAD_EVENING='cafe'; }
    finally { if(A&&A.active) A.end(); GM.sceneEnd(); }
    await GM.fade(true); toAtLeast(GM,S.gradDay()*24+19.75); await GM.fade(false); }
  /* 送禮物（AA_345 G9）：四選一；她的反應＋合適的那一句；只算一次（SIS_BDAY_GIFT_Y4）、不扣錢 */
  S.bdayGift=async function(GM,gift){ const G=GM.G, F=G.flags; if(F.SIS_BDAY_GIFT_Y4!=null) return false; const k=await GM.choose(gift.items.map(o=>({t:o.t}))), it=gift.items[k]||gift.items[0];
    await S.play(GM,it.say.concat([gift.fit])); F.SIS_BDAY_GIFT_Y4=it.k; if(typeof SOCIAL!=='undefined'&&SOCIAL.adjust) SOCIAL.adjust('heroine_05',{trust:3,npcRom:2}); return true; };
  S.bdayScene=async function(GM,mode){ const G=GM.G, F=G.flags, B=L().BDAY, A=adv(), lover=S.dating(G,'heroine_05');
    const bg=(typeof OUT!=='undefined'&&OUT.BG&&OUT.BG.ra_lab&&OUT.BG.ra_lab.image)?BG('ra_lab'):BG('linze_prof_hall');   /* AA_327：2D ra_lab（開發分支沒有→研究室的走廊）*/
    const inner=async()=>{ if(lover){ await S.play(GM,[B.friend[0]]); await S.play(GM,B.loverKevin); await S.play(GM,B.lover); const k=await GM.choose(B.loverOpts.map(o=>({t:o.t}))), lo=B.loverOpts[k]||B.loverOpts[0]; if(lo.set) Object.assign(F,lo.set); await S.play(GM,lo.say); F.SIS_BDAY_Y4='lover'; }   /* lo.set：AA_523 1-5「修正本我陪妳改。」記 SIS16_REV_PROMISE */
      else { await S.play(GM,B.friend); const FO=S.delayed(G)?B.friendOpts.map(o=>Object.assign({},o,{say:o.say.map(x=>x[1]==='今天你畢業，我生日。都沒排，結果還不錯。'?[x[0],DLY(G,'bdayFriend',x[1])]:x)})):B.friendOpts;   /* 交換延畢：「今天你穿學士服，我生日。」*/
        const gift=B.gift&&F.SIS_BDAY_GIFT_Y4==null?B.gift:null, O=FO.map(o=>({t:o.t})).concat(gift?[{t:gift.opt}]:[]);
        const k=await GM.choose(O); if(gift&&k===FO.length) await S.bdayGift(GM,gift); else await S.play(GM,(FO[k]||FO[0]).say); F.SIS_BDAY_Y4='there'; } };
    if(mode==='outing'){ if(A) A.begin({background:bg}); await inner(); return; }   /* 出遊（OUT.go 已經包著劇情）*/
    GM.sceneBegin(); try{ await GM.fade(true); toAtLeast(GM,S.gradDay()*24+20.5); if(A) A.begin({background:bg}); await GM.fade(false); await inner(); } finally { if(A&&A.active) A.end(); GM.sceneEnd(); }
    await GM.fade(true); toAtLeast(GM,S.gradDay()*24+21.5); await GM.fade(false); };
  async function psVideo(GM){ const G=GM.G, A=adv(); GM.sceneBegin(); try{ if(A) A.begin({background:BG('video'),right:{charId:'classmate_peishan',expression:'smile'}}); await S.play(GM,L().PARTNER.classmate_peishan.video); } finally { if(A&&A.active) A.end(); GM.sceneEnd(); } }
  S.kxGradScene=async function(GM){ const G=GM.G, F=G.flags, K=L().KX, A=adv(); if(A) A.begin({background:BG('nccu_campus'),right:{charId:'kexin',expression:'smile'}});
    await S.play(GM,K.photo); if(A&&A.setBg) A.setBg(BG('nccu_food'));
    await GM.say(null,K.open); for(const t of K.table) await GM.say(S.who(G,'kexin'),t); await GM.say(null,K.close);
    F.KX_GRAD='both'; F.KX_TERMEND_Y4S2=G.day; (F.KX_TERMEND||(F.KX_TERMEND={})).Y4S2=G.day; };
  S.kxGradMissed=function(GM){ const G=GM.G||GM, F=G.flags, K=L().KX; F.KX_GRAD='mine'; if(typeof PHONE!=='undefined') PHONE.at(G,S.DK('2029-06-09'),18.5,K.miss.map(t=>P_('kexin',t)),'pg_kx_grad_miss'); };
  async function kxMissScene(GM){ const G=GM.G, K=L().KX, A=adv(); GM.sceneBegin(); try{ if(A){ A.begin({background:'dark'}); if(A.cg) A.cg('cg_two_graduations_kexin'); }   /* BCG-07：去、不去都用同一張 */
      await GM.say(null,K.miss[0].replace(/^📷/,'')); await GM.say(S.who(G,'kexin'),K.miss[1]); } finally { if(A&&A.active) A.end(); GM.sceneEnd(); } }
  S.seaScene=async function(GM){ const G=GM.G, F=G.flags, Y=L().SEA_Y5, A=adv();
    await GM.fade(true); toAtLeast(GM,T(SEA_DAY,10)); if(GM.titleCard) await GM.titleCard(S.dateLabel(G.day,G.hour),'北海岸',2000);   /* 九點她家樓下，開車約一小時 */
    if(A) A.begin({background:BG('trip_sea'),right:{charId:'heroine_05',expression:'neutral'}}); await GM.fade(false);
    await S.play(GM,Y.open); const k=await GM.choose(Y.choose.map(o=>({t:o.t}))); await S.play(GM,(Y.choose[k]||Y.choose[0]).say); await S.play(GM,Y.close); F.SIS_BDAY_Y5='sea'; };
  async function b1Scene(GM){ const G=GM.G, A=adv(); GM.sceneBegin(); try{ await GM.fade(true); toAtLeast(GM,T('2029-07-12',20)); if(GM.titleCard) await GM.titleCard(S.dateLabel(G.day,G.hour),'總圖 B1',2000);
      if(A) A.begin({background:BG('ntu_lib_b1')}); await GM.fade(false); await S.play(GM,L().B1.lines); } finally { if(A&&A.active) A.end(); GM.sceneEnd(); }
    await GM.fade(true); toAtLeast(GM,T('2029-07-12',22)); await GM.fade(false); }
  /* 2030 那一輪的總圖 B1（AA_331 2a）：阿哲第二句看玩家（2029 也報了名＝again、交換延畢第一次考＝first）；讀書小組有語彤＝保鮮盒 */
  S.b1Lines2030=function(G){ const B=L().B1_2030, F=G.flags||{}, sg=S.studyGroup(G); return B.lines.concat(S.delayed(G)?B.first:(F.BAR_SIT_2029===true?B.again:[])).concat(sg==='three'||sg==='yutong'?B.yt:[]); };
  async function b1Scene2030(GM){ const G=GM.G, A=adv(); GM.sceneBegin(); try{ await GM.fade(true); toAtLeast(GM,T('2030-07-11',20)); if(GM.titleCard) await GM.titleCard(S.dateLabel(G.day,G.hour),'總圖 B1',2000);
      if(A) A.begin({background:BG('ntu_lib_b1')}); await GM.fade(false); await S.play(GM,S.b1Lines2030(G)); } finally { if(A&&A.active) A.end(); GM.sceneEnd(); }
    await GM.fade(true); toAtLeast(GM,T('2030-07-11',22)); await GM.fade(false); }
  S.noteScene=async function(GM,y){ const G=GM.G, N=L().NOTE, sis=S.who(G,'heroine_05'), d=S.dating(G,'heroine_05');
    if(y===2030&&S.retaker(G)) await GM.say(null,N.retake.note); else await S.play(GM,N.lines);
    if(d) await GM.say(sis,y===2030&&N.lover2030&&S.sisWaited2029(G)?N.lover2030:N.lover);   /* 戀人版當面給：最後多一句；AA_472 第 5 節：2030 第二次考、去年她也在便利商店等＝換句 */
    if(y===2029) G.flags.SIS_STORE_2029=d; };   /* 2029 那一次她有沒有說「我在對面的便利商店等」（AA_472 第 5 節）*/
  /* 2029 一試那天她在對面的便利商店等過（戀人版當面給便條）：記 SIS_STORE_2029；舊存檔沒有＝2029 有考、現在這一段交往在 2029-08-04 以前就開始 */
  S.sisWaited2029=G=>{ const F=G.flags||{}; if(F.SIS_STORE_2029!=null) return F.SIS_STORE_2029===true; if(F.BAR_SIT_2029!==true||!S.dating(G,'heroine_05')) return false;
    const R=F.romance&&F.romance.heroine_05, e=S.DK(Y[2029].exam); if(!R) return false; if(typeof R.sinceDay==='number') return R.sinceDay<=e; const m=/^D(-?\d+)$/.exec(String(R.since||'')); return m?+m[1]<=e:!!R.since; };
  async function examDay(GM,y){ const G=GM.G, F=G.flags, Lx=L(), d=S.DK(Y[y].exam), A=adv();
    GM.sceneBegin(); try{ await GM.fade(true); toAtLeast(GM,d*24+8);
      if(S.noteInPerson(G,y)){ if(GM.titleCard) await GM.titleCard(S.dateLabel(G.day,G.hour),'',1600); if(A) A.begin({background:BG('ntu_avenue'),right:{charId:'heroine_05',expression:'smile'}}); await GM.fade(false); await S.noteScene(GM,y); await GM.fade(true); if(A&&A.active) A.end(); }
      toAtLeast(GM,d*24+8.5); if(GM.titleCard) await GM.titleCard(Lx.EXAM.card,S.dateLabel(G.day,G.hour),2200);   /* 字幕「考場」*/
      if(A) A.begin({background:BG('exam_hs_classroom')}); await GM.fade(false);
      const qs=S.draw(G,y), ans=[]; let k=0;
      for(let i=0;i<qs.length;i++){ const q=qs[i]; await GM.say(null,(i+1)+'／'+qs.length+'　'+q.q); const o=S.opts(q); const j=await GM.choose(o.map(x=>({t:x.t}))); const v=(o[j]||o[0]).v; ans.push(v); if(String(v)===String(q.answer)) k++; }
      await GM.say(null,'交卷。');   /* 答對題數不在這裡說（9/7 放榜）*/
      S.rec(G).exam[y].ans=ans; F['BAR_SCORE_'+y]=k; F['BAR_SIT_'+y]=true;
      await GM.fade(true); toAtLeast(GM,d*24+17.5); await GM.fade(false);
      if(y===2029) await S.play(GM,Lx.EXAM.out);   /* 走出考場（柏翰 2029 考過了，2030 不在）*/
      if(y===2029&&S.dating(G,'kexin')&&typeof PHONE!=='undefined') PHONE.at(G,d,17.5+2/60,Lx.EXAM.kexin.map(t=>P_('kexin',t)),'pg_kx_exam_'+y);
    } finally { if(A&&A.active) A.end(); GM.sceneEnd(); } }
  async function lateNarr(GM){ GM.sceneBegin(); try{ await GM.say(null,L().EXAM.lateNarr); } finally { GM.sceneEnd(); } }
  async function result1(GM,y){ const G=GM.G, F=G.flags, st=S.stage(G,y), t=L().R1.sys[st]; F['BAR_STAGE_'+y]=st;
    if(typeof PHONE!=='undefined'&&!PHONE.sent(G,'pg_r1sys_'+y)) PHONE.post(G,{th:'sys',text:t,tag:'pg_r1sys_'+y});
    GM.sceneBegin(); try{ await GM.say(null,t); } finally { GM.sceneEnd(); } }
  async function exam2(GM,y,part){ const G=GM.G, Lx=L(), K=Y[y], A=adv();
    GM.sceneBegin(); try{ await GM.fade(true);
      if(part===1){ toAtLeast(GM,T(K.e2a,8.5)); if(GM.titleCard) await GM.titleCard(Lx.EXAM2.card,S.dateLabel(G.day,G.hour),2400); }   /* 考試畫面帶過，不出題 */
      else { toAtLeast(GM,T(K.e2b,17.5)); if(GM.titleCard) await GM.titleCard(S.dateLabel(G.day,G.hour),'',1600); if(A) A.begin({background:BG('exam_hs_classroom')}); await GM.fade(false); await GM.say(null,Lx.EXAM2.end); await GM.fade(true); }
      if(part===1) toAtLeast(GM,T(K.e2a,17.5)); } finally { if(A&&A.active) A.end(); GM.sceneEnd(); }
    await GM.fade(false); }
  async function result2(GM,y){ const G=GM.G, F=G.flags, R=L().R2, judge=S.stage(G,y)==='both';
    if(typeof PHONE!=='undefined'&&!PHONE.sent(G,'pg_r2sys_'+y)) for(const t of R.sys.concat(judge?[R.judgeNo]:[])) PHONE.post(G,{th:'sys',text:t,tag:'pg_r2sys_'+y});
    GM.sceneBegin(); try{ for(const t of R.sys) await GM.say(null,t); if(judge){ await GM.say(null,R.judgeNo); await GM.say(null,R.judgeNarr); } } finally { GM.sceneEnd(); }
    F.BAR_YEAR=y;
    if(y===2029){ if(S.studyGroup(G)==='yutong'){ if(typeof PHONE!=='undefined') PHONE.at(G,S.DK(Y[y].r2),18,L().R2.study.yutong.map(t=>P_('heroine_03',t)),'pg_noodle_yt_'+y); } else S.planNoodle(G,y); }
    else if(y===2030&&L().R2_2030&&typeof OUT!=='undefined') OUT.plan(G,{id:'pg_bar_noodle_2030',ev:'ev_pg_noodle_2030',day:S.DK(Y[y].r2),h:18,late:0.5,place:'阿鳳麵店',title:'阿鳳麵店・長桌',travel:'走過去約 15 分鐘',travelH:0.25}); }   /* AA_331 2a：2030 的 12/13 18:00 麵店（可以錯過）*/   /* 2030 的麵店 AA 沒寫（阿哲那一句在群組）；只有語彤的讀書小組＝18:00 她傳照片 */
  S.studyGroup=G=>{ const g=G.flags&&G.flags.BAR_STUDY_GROUP; if(!Array.isArray(g)) return null; const k=g.includes('kexin'), y=g.includes('yutong')||g.includes('heroine_03'); return k&&y?'three':(k?'kexin':(y?'yutong':null)); };   /* AA_327 2-Y4-33（那一批還沒做＝沒有）*/
  S.noodle2030Lines=function(G){ const R=L().R2_2030, sg=S.studyGroup(G); return (sg==='three'||sg==='yutong'?R.yt:R.base).concat(S.dating(G,'kexin')?R.kx:[]); };   /* AA_331 2a：有語彤＝三張紅紙；和可昕交往中＝她最後到 */
  S.noodleScene2030=async function(GM){ const A=adv(); if(A) A.begin({background:BG('noodle_table')}); await S.play(GM,S.noodle2030Lines(GM.G)); };
  S.noodleMissed2030=async function(GM){ if(!GM||!GM.say) return; GM.sceneBegin(); try{ await GM.say(null,L().R2_2030.missed); } finally { GM.sceneEnd(); } };
  S.noodleScene=async function(GM){ const A=adv(), R=L().R2, sg=S.studyGroup(GM.G); if(A) A.begin({background:BG('noodle_table')}); await S.play(GM,sg==='three'?R.study.three:(sg==='kexin'?R.study.kexin:R.noodle)); };   /* 12/14 18:00（AA_319 1A-18）：讀書小組三個人／只有可昕／麵店團 */
  async function anCall(GM,n){ const G=GM.G, A_=L().AN, me={name:nmD(G,'heroine_01')+'（電話）'}; if(GM.toast) GM.toast('手機響了。',2400);
    GM.sceneBegin(); try{ if(n===1){ await GM.say(me,A_.call1[0]); await GM.say(me,S.dating(G,'heroine_01')?A_.call1Dating:A_.call1[1]); }
      else { for(const t of A_.call2) await GM.say(me,t); const k=await GM.choose(A_.call2Opts.map(o=>({t:o.t}))); for(const t of (A_.call2Opts[k]||A_.call2Opts[0]).say) await GM.say(me,t); } } finally { GM.sceneEnd(); } }
  /* 可昕考上律師（AA_296 2-3-1 ③，企劃線 3f406dbc）：交往中、沒報 2029 國考＝12/14 15:05 她打來的電話（原本兩則私訊 pg_r2kx_2029；寫法照上面以安的電話）。
     「下午三點多」：15:05～16:00 玩家空下來就演（場景 kx_bar_2029；跳到下一件事、睡覺都停在這裡）；沒接（在出遊、在劇情裡，過了 16:00）＝原本那兩則私訊（S.kxBarMissed）。
     最後那一句旁白是那天晚上的宵夜，不另外排出遊。9/7「一試過了。二試十月。」（pg_r1kx_2029）是中途的結果，照用私訊 */
  S.KX_BAR={at:15+5/60,until:16};
  S.kxBarOk=G=>S.dating(G,'kexin')&&G.flags.BAR_SIT_2029!==true;
  /* 3D 的跳過時間停在她打來的時間（AA 10-22 08:41；PG 的「跳到下一件事」本來就停在場景；睡覺照舊算沒接）*/
  if(typeof CLS!=='undefined'&&CLS.STOP_FNS) CLS.STOP_FNS.push(G=>{ const d=S.DK(Y[2029].r2); if(d==null||G.day!==d||!S.kxBarOk(G)||(S.rec&&S.rec(G).done&&S.rec(G).done.kx_bar_2029)) return []; return [{h:S.KX_BAR.at,why:'手機響了'}]; });
  async function kxBarCall(GM){ const G=GM.G, K=L().R2.kexinCall, me={name:nmD(G,'kexin')+'（電話）'}; if(GM.toast) GM.toast('手機響了。',2400);
    GM.sceneBegin(); try{ await GM.say(null,K.narr); for(const t of K.lines) await GM.say(me,t);
      const k=await GM.choose(K.opts.map(o=>({t:o.t}))); for(const t of (K.opts[k]||K.opts[0]).say) await GM.say(me,t);
      for(const t of K.close) await GM.say(me,t); await GM.say(null,K.after); } finally { GM.sceneEnd(); } }
  S.kxBarMissed=function(G){ if(typeof PHONE==='undefined') return; PHONE.at(G,S.DK(Y[2029].r2),S.KX_BAR.at,L().R2.kexinNone.map(t=>P_('kexin',t)),'pg_r2kx_2029'); };
  S.firstLate=G=>S.sits(G,2030)&&G.flags.BAR_YEAR==null;   /* 2030 年還在準備律師二試（AA_319 b6757852）*/
  async function firstDay(GM){ const G=GM.G, F=G.flags, Fi=L().FIRST, late=S.firstLate(G);
    toAtLeast(GM,T('2030-10-01',21));
    const FR=L().FIRST_RETAKE||{}, items=[{th:'g:noodle_team',from:'player',text:'📷'+(late?(FR[F.RETAKE_STYLE]||Fi.late):Fi.me[S.path(G)])}];   /* AA_331 1a：2029 一試沒過的照 RETAKE_STYLE（cram／home／zhe）；交換延畢沒有＝補習班 */
    for(const [id,ph,t] of Fi.friends) if(S.at(G,id,'FAMILIAR')){ items.push(GR(id,'📷'+ph)); items.push(GR(id,t)); }   /* 認識的人才傳 */
    if(typeof PHONE!=='undefined'){ if(!PHONE.inGroup(G,'noodle_team')) PHONE.join(G,'noodle_team','法四吃飯'); if(!PHONE.sent(G,'pg_first_day')) items.forEach((it,i)=>PHONE.postAt(G,Object.assign({tag:'pg_first_day'},it),G.day,G.hour+i*0.01)); }
    GM.sceneBegin(); try{ await GM.say(null,Fi.narr); } finally { GM.sceneEnd(); }
    F.FIRST_DAY_SEEN=true;
    if(GM.phoneThread) await GM.phoneThread('g:noodle_team');
    if(late){ GM.sceneBegin(); try{ await GM.say(null,Fi.lateNarr); } finally { GM.sceneEnd(); } } }
  /* ---------- 尾聲（1A-20；BB 人物照 AA_327 2-Y4-53 的表：條件由低到高，取符合的最後一列）---------- */
  const yes=v=>!!v;
  S.atTable=(G,id)=>!S.isEx(G,id)&&S.at(G,id,'FAMILIAR');
  S.ytEnd=function(G){ const F=G.flags, h=t=>has('heroine_03',t); const e1=h('RENT_CONSULTATION')&&h('LAW_MEETS_LIFE'), e2=h('FIELD_NOTES_IDEA')&&yes(F.YT_NOTES_NEXT), e3=e1&&S.lean(G).top==='A'&&h('APOLOGIZED');   /* AA_11 結局表：5 → 3 → 2 → 1 → 4 */
    const job=e3?3:(e2?2:(e1?1:4)); if(S.dating(G,'heroine_03')) return {end:5,job}; if(e3) return {end:3,job:3}; if(e2) return {end:2,job:2}; if(e1) return {end:1,job:1}; if(S.at(G,'heroine_03','FRIEND')) return {end:4,job:4}; return {end:0,job}; };
  S.epiLine=function(G,id){ const F=G.flags, E=L().EPI, lw=F.BAR_YEAR!=null, me=x=>x.map(t=>[id,t]);
    switch(id){
      case 'zhe': { let t=E.zhe.base; if(has('zhe','LENT_NOTES_Y2')) t=E.zhe.notes; if(has('zhe','STUDIED_WITH_ZHE')) t=E.zhe.studied; if(yes(F.ZHE4_FINAL)) t=E.zhe.final;
        if(S.atTable(G,'yu')) return E.zhe.withYu.concat(t!==E.zhe.base?[[id,t]]:[]); return [[id,t]]; }   /* 和 Alison 同一桌＝兩人那一組照演，接著阿哲自己的回收句（筆記／陪念／哲 4，照他那張表取最下面一列）一句；只有預設句的不加（AA_496 第 9 節第 2 點：原本兩人那一組蓋掉各自的回收句）*/
      case 'yu': { const lib=typeof SUP497!=='undefined'&&SUP497.epiYuLib&&yes(F.YU4_ALONE)?SUP497.epiYuLib(G):[];   /* AA_497 3-7：「一個人吃滷肉飯」那一段之後，有 YU_Y4_LIB（大四法圖坐她對面）多一句 */
        if(S.atTable(G,'zhe')) return yes(F.YU4_ALONE)?[[id,E.yu.alone]].concat(lib):null; return [[id,yes(F.YU4_ALONE)?E.yu.alone:E.yu.base]].concat(lib); }   /* 和阿哲同一桌：她那一句已經在兩人那一組；YU4_ALONE 的回收句接在阿哲的回收句後面（同上）*/
      case 'classmate_bohan': { let t=E.bohan.base; if(yes(F.BH4_DONE)) t=E.bohan.bh4; if(S.gradAdmit(G)) t=E.bohan.bh5; return [[id,t]]; }   /* 翰 5 兩人同一組＝GRAD_ADMIT 有值（AA_327 2-Y4-06）*/
      case 'classmate_xinci': { if(yes(F.XC1_STICKY)) return [[id,E.xinci.sticky]]; if(yes(F.XC5_RECONCILE)&&S.atTable(G,'heroine_01')) return S.dating(G,'heroine_01')?[E.xinci.reconcile[0]]:E.xinci.reconcile; return [[id,E.xinci.base]]; }
      case 'heroine_01': { if(S.dating(G,'heroine_01')) return me(E.an.partner); if(yes(F.XC5_RECONCILE)&&S.atTable(G,'classmate_xinci')&&!yes(F.XC1_STICKY)) return null; return [[id,E.an.friend]]; }   /* 慈 5 那一組裡以安那句就是她的一句 */
      case 'heroine_03': { const Y3=S.ytEnd(G); if(!Y3.end) return null; if(Y3.end===5) return [[id,E.yt[Y3.job===4?4:Y3.job][0]],[id,E.yt[5]]]; return me(E.yt[Y3.end]); }
      case 'heroine_05': { const B=E.sis; if(S.dating(G,'heroine_05')) return me(yes(F.SIS_DAY_OFF)?B.dayOff:B.lover); if(yes(F.US4_FRIEND)||yes(F.HEART_FRIEND_heroine_05)) return me(B.peer); return me(S.lean(G).top==='A'&&lw?B.roadA:B.road); }
      case 'heroine_02': { if(S.dating(G,'heroine_02')) return E.zr.me; if(yes(F.ZR_FY)) return me(E.zr.fy); return me(E.zr.main); }
      case 'heroine_04': { const Z=E.zq; if(S.dating(G,'heroine_04')) return me(Z.me); if(S.zqLine(G)&&lw) return me(Z.line); if(F.ZQ_CONTRACT!=null&&!S.zqLine(G)) return me(Z.apart); return me(F.ZQ_Q12==='cat'?Z.cat:Z.nine); }   /* AA_360 第 1 節：她發表的一律是《九點以後》（沒看過 Q12 的也是）；舊存檔已經演完《找插座的貓》（ZQ_Q12 cat）照舊、不改尾聲 */
      case 'kai': { const K=E.kai; let t=K.base; if(lw) t=K.lawyer; if(has('kai','SUNDAY_SUPPER')) t=K.supper; if(yes(F.KAI_STAYED_UP)||has('kai','KAI_STAYED_UP')) t=K.stayed; return me(t); }
      case 'classmate_mingxuan': { const M=E.mx; let t=M.base; if(S.gradAdmit(G)) t=M.grad; if(F.BAR_YEAR===2029) t=M.bar2029; if(F.BAR_YEAR===2030) t=M.bar2030; if(has('classmate_mingxuan','SAW_HIM_STUDY')) t=M.saw; return me(t); }
      case 'classmate_peishan': { const P=E.ps; let t=P.base; if(lw&&F.PS_GRAD_CARD) t=S.delayed(G)?[DLY(G,'psCard',P.card[0])].concat(P.card.slice(1)):P.card; if(yes(F.KEPT_FRIEND)) t=P.kept; if(has('classmate_peishan','MIRROR_PEISHAN')) t=P.mirror; if(S.dating(G,'classmate_peishan')) t=yes(F.PS_WAITED)&&P.waited?P.lover.concat([P.waited]):P.lover; return me(t); }   /* PS_WAITED（BB_165 5-1，台南那一天等你問完）：和祐廷那一版多一句 */
      case 'npc_fangyt': { const Fy=E.fy; let t=Fy.base; if(yes(F.CHIAYI_TREE)) t=Fy.tree; if(!S.delayed(G)&&F.BAR_YEAR===2030) t=Fy.y2030;   /* AA_331 1b：交換路線 2031 拿掉（交換延畢的 2030 也不再擋，沒有 2031 國考；AI解讀、待使用者確認）*/ if(yes(F.MOUNTAIN_DAY)) t=Fy.day; if(yes(F.ZR_FY)) t=Fy.zr; return me(t); }   /* 多考的那一年：台灣路線 2030、交換路線 2031（AA_327 f252a7b5）*/
      case 'classmate_youchen': return typeof SUP497!=='undefined'&&SUP497.epiYc?SUP497.epiYc(G):null;   /* AA_497 1-6（BB_70 7b）：五年後「法條我還是背得很熟。只是現在背的是著作權法。」；地下室那場去了（YC_GIG）多一句 */
      case 'kexin': { if(!S.dating(G,'kexin')) return null; const R=typeof ROM!=='undefined'&&ROM.get?ROM.get(G,'kexin'):null, back=!!(R&&(R.history||[]).some(h=>h.ev==='end')); return me(E.kx.arrive.concat(back?E.kx.b:[])); }   /* A／B（B＝分開又回來）；她最晚到 */
    } return null; };
  S.EPI_ORDER=['zhe','yu','classmate_bohan','classmate_xinci','heroine_01','heroine_03','heroine_05','heroine_02','heroine_04','kai','classmate_mingxuan','classmate_youchen','classmate_peishan','npc_fangyt','kexin'];   /* 宥辰：AA_497 1-6 五年後那一句（有點熟以上才在桌上，同其他人）*/
  S.epiPresent=(G,id)=>id==='kai'||(id==='kexin'?S.dating(G,'kexin'):S.atTable(G,id));   /* 只有認識的人在場；阿凱是室友 */
  S.econLine=function(G){ const F=G.flags, E=L().EPI.econ; if(!(F.PLAYED_Y0||F.MET_XUN||has('econ_zhengxun','FIRST_MET'))) return null;
    if(F.ECON_PAST_SHARED==='full'||F.ECON_PAST_SHARED==='half'){ const nights=!!(G.events&&G.events.done&&Object.keys(G.events.done).some(k=>/^ev_sk05_vending/.test(k))); return {line:nights?E.full:E.noNights,far:false}; }   /* 那幾個晚上＝SK05 三閃，販賣機見 */
    return {line:E.none,far:true}; };
  S.EX_ORDER=['heroine_01','heroine_03','heroine_02','heroine_04','heroine_05','classmate_peishan','kexin'];
  S.exLines=function(G,id,econFar){ const E=L().EPI, X=E.ex, me=x=>x.map(t=>[id,t]);
    if(id==='heroine_01') return me(econFar?[X.heroine_01Alt,X.heroine_01[1]]:X.heroine_01);   /* 不再接 */
    if(id==='heroine_03'){ const Y3=S.ytEnd(G); return me(X.heroine_03.concat([E.yt[Y3.job===1||Y3.job===2?Y3.job:4][0]])); }
    if(id==='heroine_02') return me(X.heroine_02.concat(E.zr.main));
    if(id==='heroine_04') return me(X.heroine_04.concat(G.flags.ZQ_Q12==='cat'?E.zq.cat:E.zq.nine));   /* 同上（AA_360 第 1 節）*/
    if(id==='heroine_05') return me(X.heroine_05.concat(E.sis.road));
    if(id==='classmate_peishan') return me(X.classmate_peishan.concat(E.ps.base));
    if(id==='kexin') return me(X.kexin.concat(G.flags.GIRAFFE_KEYCHAIN?[X.kexinKey]:[]));
    return null; };
  S.CG_ID={kai:'kai',heroine_01:'heroine01',heroine_02:'heroine02',heroine_03:'heroine03',heroine_04:'heroine04',heroine_05:'heroine05',kexin:'kexin',classmate_peishan:'peishan'};
  S.epiPartner=G=>['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','kexin','classmate_peishan'].find(id=>S.dating(G,id))||null;   /* 祐廷右手邊：畢業時的伴侶；前任不在旁邊也不在對面 */
  S.epiPartners=G=>{ const p=S.epiPartner(G); return p?[p]:[]; };   /* 桌上放東西的伴侶（照座位：右手邊、左手邊、對面）；都同意的兩位以上由 src/r2y4b3d.js 換（AA_482 第 3 節）*/
  S.epiCg=G=>'cg_reunion_window_table_'+S.CG_ID[S.epiPartner(G)||'kai'];
  S.epiAlways=function(G){ const id=['zhe','yu','classmate_bohan'].find(x=>S.atTable(G,x)&&S.at(G,x,'FRIEND')); return id?{id,t:L().EPI.always[S.lean(G).top]||L().EPI.always.B}:null; };
  S.footprint=function(G){ const F=G.flags||{}, H=G.habits||{};
    const days=re=>{ const set=new Set(); let mx=0; for(const k in H){ if(!re.test(k)) continue; const h=H[k]||{}; for(const d of (h.days||[])) set.add(d); mx=Math.max(mx,h.n|0); } return Math.max(set.size,mx); };
    let grp=0; const att=(G.acts&&G.acts.att)||{}; for(const k in att) if(/^(public_law_group|lawclub_study)@/.test(k)&&att[k]&&(att[k].end||'full')==='full') grp++;
    const c={cafe:Math.max(+F.CAFE_VISITS||0,days(/^place:cafe:/)),fafu:+F.LAWCLUB_SAT_VISITS||0,noodle:days(/^place:noodle:/),library:days(/^place:(library|library_hall|lawlib):/),yexiao:days(/^place:gongguan:night$/),guitar:0,group:grp,abroad:S.exchDelayed(G)?60:0};   /* G.footprint 還沒有：照現有的計次回推（AA_319 1A-20 第 6 節第 3 點）；交換固定 60 天 */
    let best=null; for(const [k] of L().EPI.foot) if(best==null||c[k]>c[best]) best=k; return best; };   /* 平手照表的順序（「比大四一年」沒有逐年的紀錄，不做）*/
  S.epiItems=function(G){ const E=L().EPI, foot=S.footprint(G), item=(E.foot.find(x=>x[0]===foot)||E.foot[0])[1], ps=S.epiPartners(G), F=G.flags;
    F.EPI_ITEMS=[item].concat(ps.filter(p=>E.items[p]).map(p=>E.items[p]));   /* 伴侶的東西（桌上的另一邊；都同意的每一位都放，AA_482 第 3 節）*/
    const PI=L().EPI_PARTNER||{}, pn=p=>{ const pi=PI[p]; return pi&&typeof pi==='object'?(F.SIS_THERMOS?(p==='heroine_05'?DLY(G,'epiThermos',pi.thermos):pi.thermos):pi.plain):pi; };   /* AA_331 2b：接在祐廷那一樣後面；學姊看 SIS_THERMOS（6/2 她遞的保溫瓶）*/
    return [E.itemNarr.replace('{item}',item)].concat(ps.map(pn).filter(Boolean)); };
  S.toTitle=function(GM){ try{ const b=typeof document!=='undefined'&&document.getElementById?document.getElementById('btnTitle'):null; if(b&&typeof b.onclick==='function'){ b.onclick(); return true; } }catch(e){ console.warn('PG toTitle',e); } if(GM) GM.running=false; return false; };
  async function epilogue(GM){ const G=GM.G, F=G.flags, E=L().EPI, A=adv(); let ok=false;
    GM.sceneBegin(); try{ await GM.fade(true); if(A&&A.active) A.end();
      toAtLeast(GM,T('2034-06-03',19));
      for(const [a,b] of E.cards) if(GM.titleCard) await GM.titleCard(a,b,2400);   /* 「五年後」→「2034 年 6 月 3 日」「兩點半 Café」*/
      if(GM.enter&&G.zone!=='cafe') await GM.enter('cafe',{x:0,z:5,yaw:Math.PI,lv:0},{noFade:true});
      if(A) A.begin({background:'blur'}); await GM.fade(false);
      await S.play(GM,E.enter);
      for(const id of S.EPI_ORDER) if(S.epiPresent(G,id)){ const ln=S.epiLine(G,id); if(ln) await S.play(GM,ln); }   /* 同一桌的先 */
      const yt=S.ytEnd(G); if(!yt.end&&!S.isEx(G,'heroine_03')&&S.at(G,'heroine_03','ACQUAINTANCE')) await GM.say(null,E.yt.away);   /* 語彤不到 FRIEND：店的另一頭 */
      const ec=S.econLine(G); if(ec) await GM.say(S.who(G,'econ_zhengxun'),ec.line);   /* 經濟系那桌 */
      for(const id of S.EX_ORDER) if(S.isEx(G,id)){ const ln=S.exLines(G,id,!!(ec&&ec.far)); if(ln) await S.play(GM,ln); }   /* 前任：店的另一頭，起身經過時 */
      if(A&&A.cg) A.cg(S.epiCg(G));   /* ③ CG-10 */
      for(const f of S.EPI_AFTER_CG) await f(GM);   /* 事件包的掛勾（AA_327 2-Y4-54：空著的座位那一句；src/r2y4b3d.js）*/
      const al=S.epiAlways(G); if(al) await GM.say(S.who(G,al.id),al.t);   /* ④ */
      await GM.say(S.who(G,'me'),E.last[S.path(G)]);   /* ⑤ */
      for(const t of S.epiItems(G)) await GM.say(null,t);   /* ⑥ */
      for(const f of S.EPI_AFTER_ITEMS) await f(GM);   /* 事件包的掛勾（AA_327 2-Y4-55：美國路線何俊朗的訊息；src/r2y4b3d.js）*/
      await GM.say(null,E.end);   /* ⑦ */
      ok=true;
    } finally { if(A&&A.active) A.end(); if(ok){ await GM.fade(true); if(GM.titleCard) await GM.titleCard(E.title,'',3200); } GM.sceneEnd(); }
    if(ok){ F.EPILOGUE_DONE=true; if(GM.autosave) GM.autosave(true); S.toTitle(GM); } if(GM.fade) await GM.fade(false); }
  /* ---------- 場景表 ---------- */
  const yStep=y=>{ const K=Y[y]; return [
    {id:'exam_'+y,at:G=>T(K.exam,8),until:G=>T(K.exam,30),cond:G=>S.sits(G,y),run:GM=>examDay(GM,y)},
    {id:'r1_'+y,at:G=>T(K.r1,15+5/60),until:G=>T(K.r1,48),cond:G=>G.flags['BAR_SIT_'+y]===true,run:GM=>result1(GM,y)},
    {id:'e2a_'+y,at:G=>T(K.e2a,8.5),until:G=>T(K.e2a,30),cond:G=>G.flags['BAR_SIT_'+y]===true&&S.stage2(G,y),run:GM=>exam2(GM,y,1)},
    {id:'e2b_'+y,at:G=>T(K.e2b,17.5),until:G=>T(K.e2b,30),cond:G=>G.flags['BAR_SIT_'+y]===true&&S.stage2(G,y),run:GM=>exam2(GM,y,2)},
    {id:'r2_'+y,at:G=>T(K.r2,15+5/60),until:G=>T(K.r2,48),cond:G=>G.flags['BAR_SIT_'+y]===true&&S.stage2(G,y),run:GM=>result2(GM,y)} ]; };
  S.STEPS=[
    {id:'reg',at:G=>T('2029-05-10',21),until:G=>T('2029-05-12',0),cond:G=>!S.delayed(G)&&G.flags.BAR_REG==null&&G.flags.Y4_PATH!=='bar',run:regScene},
    {id:'reg_2030',at:G=>T('2030-05-10',21),until:G=>T('2030-05-12',0),cond:G=>S.delayed(G)&&G.flags.BAR_REG_2030==null,run:regScene2030,onMiss:G=>{ G.flags.BAR_REG_2030=false; }},   /* AA_357 1-6；錯過＝沒回答＝不報名（日期卡、考不考都照這個）*/
    {id:'grad',at:G=>T(GRAD,6),until:G=>T('2029-06-04',0),cond:G=>true,ready:G=>S.gradReady(G),run:gradScene},
    {id:'cafe',at:G=>T(GRAD,17.25),until:G=>T(GRAD,21),cond:G=>{ const q=typeof OUT!=='undefined'?OUT.get(G,'pg_grad_cafe'):null; return !!q&&q.state==='done'&&G.zone==='cafe'; },run:cafeScene},
    {id:'ps_video',at:G=>T(GRAD,18),until:G=>T(GRAD,27),cond:G=>graduated(G)&&S.dating(G,'classmate_peishan'),run:psVideo},
    {id:'bday_walk',at:G=>T(GRAD,17.5),until:G=>T(GRAD,28),cond:G=>S.teDone(G)==='heroine_05',run:GM=>S.bdayScene(GM,'walk')},   /* 和學姊吃畢業傍晚那頓飯：不用選，直接走回研究室 */
    {id:'kx_miss',at:G=>T('2029-06-09',18.5),until:G=>T('2029-06-10',12),cond:G=>G.flags.KX_GRAD==='mine',run:kxMissScene},
    {id:'b1',at:G=>T('2029-07-12',20),until:G=>T('2029-07-12',27),cond:G=>S.sits(G,2029),run:b1Scene},
    {id:'b1_2030',at:G=>T('2030-07-11',20),until:G=>T('2030-07-11',27),cond:G=>S.sits(G,2030)&&!!L().B1_2030,run:b1Scene2030},   /* AA_331 2a */   /* b6757852：20:00（和國考讀書會同一個時間）*/
    {id:'late_2029',at:G=>T('2029-08-04',17.5+5/60),until:G=>T('2029-08-05',12),cond:G=>S.delayed(G),run:lateNarr},
    {id:'an1',at:G=>T('2029-12-14',21),until:G=>T('2029-12-14',27),cond:G=>S.at(G,'heroine_01','FRIEND')&&!S.isEx(G,'heroine_01'),run:GM=>anCall(GM,1)},   /* 以安的二試放榜（AA_319 c9b4f60e）；前任不打給前男友（AA_473 第 2 節：改麵店團 pg_an_ex1、pg_an_group）*/
    {id:'an2',at:G=>T('2030-01-25',21),until:G=>T('2030-01-25',27),cond:G=>S.at(G,'heroine_01','FRIEND')&&!S.isEx(G,'heroine_01'),run:GM=>anCall(GM,2)},
    {id:'kx_bar_2029',at:G=>T(Y[2029].r2,S.KX_BAR.at),until:G=>T(Y[2029].r2,S.KX_BAR.until),cond:G=>S.kxBarOk(G),run:GM=>kxBarCall(GM),onMiss:G=>S.kxBarMissed(G)},   /* AA_296 2-3-1 ③ 可昕考上律師：她打來 */
    {id:'first',at:G=>T('2030-10-01',21),until:G=>Infinity,cond:G=>true,run:firstDay},
    {id:'epi',at:G=>T('2034-06-03',19),until:G=>Infinity,cond:G=>!!G.flags.FIRST_DAY_SEEN&&!G.flags.EPILOGUE_DONE&&!S.pendingExam(G),run:epilogue} ].concat(yStep(2029),yStep(2030));
  S.byId=id=>S.STEPS.find(s=>s.id===id)||null;
  S.pendingExam=G=>S.sits(G,2030)&&G.flags.BAR_YEAR==null&&!S.done(G,'r2_2030');   /* 2030 年那一輪還沒演完：尾聲等它 */
  S.y4Due=G=>{ if(typeof STORY==='undefined') return false; for(const k of ['packDue','gradMorningDue','gradLunchDue','moveOutDue']){ try{ if(STORY[k]&&STORY[k](G)) return true; }catch(e){} } return false; };   /* AA_318 那一批的場景（story3d.js S.y4Tick 演）：時間到了先讓它演，不跳 */
  const running=new Set();
  S.pending=function(G){ const now=NOW(G), r=S.rec(G), out=[]; if(!law(G)||G.flags.EPILOGUE_DONE) return out;   /* 尾聲演完：讀那個存檔＝2034 年自由活動，不再有場景 */
    for(const s of S.STEPS){ if(r.done[s.id]||running.has(s.id)) continue; const t=s.at(G); if(t==null) continue; let ok=false; try{ ok=!!s.cond(G); }catch(e){ ok=false; } if(!ok) continue;
      if(now>(s.until?s.until(G):t+6)){ r.done[s.id]='missed'; if(s.onMiss) try{ s.onMiss(G); }catch(e){ console.warn('PG miss '+s.id,e); } continue; } out.push({s,t}); }
    return out.sort((a,b)=>a.t-b.t); };
  S.due=function(G){ const now=NOW(G); for(const {s,t} of S.pending(G)){ if(t>now+1e-6) break; if(s.ready&&!s.ready(G)) continue; return s; } return null; };
  S.runStep=async function(GM,s){ const G=GM.G, r=S.rec(G); if(r.done[s.id]||running.has(s.id)) return false; running.add(s.id);
    try{ await s.run(GM); } catch(e){ console.warn('PG '+s.id,e); } finally { running.delete(s.id); r.done[s.id]=1; }
    if(GM.autosave) GM.autosave(); return true; };
  /* ---------- 跳到下一件事 ---------- */
  S.SOFT=[['2029-06-02',22],['2029-06-28',10]];   /* 別一批的固定時間（1A-12 晚上大伯的信封、1A-15 宿舍期滿）：停一下，讓那邊的程式有機會演 */
  S.stops=[G=>typeof STORY!=='undefined'&&STORY.kxAnniv6Stop?STORY.kxAnniv6Stop(G):null];   /* 其他模組可以加：G=>絕對時間（小時）或 null。第一個：可昕第六年的週年還沒排的時候，停在該問「出發」的時間（AA_472 第 3 節，story3d.js）*/
  S.RULES=[];   /* 其他模組可以加：(G, GM)=>{}，S.rules 每一次最後跑（src/pgdates3d.js：固定格到了就排成出遊、不再交往就改 skipped）*/
  S.EPI_AFTER_CG=[]; S.EPI_AFTER_ITEMS=[];   /* 尾聲的掛勾（async GM=>…）：③ CG-10 之後、⑥ 桌上的東西之後（⑦ 最後畫面之前）*/
  S.nextStop=function(G){ const now=NOW(G); let best=Infinity; const cand=t=>{ if(t!=null&&t>now+1e-6&&t<best) best=t; };
    for(const {t} of S.pending(G)) cand(t);
    if(typeof PHONE!=='undefined'){ for(const m of S.MSGS){ if(PHONE.sent(G,m.tag)) continue; const t=T(m.at[0],m.at[1]); if(t<=now+1e-6||t>=best) continue; let ok=false; try{ ok=!!m.cond(G); }catch(e){} if(ok) cand(t); }
      for(const q of PHONE.rec(G).q) cand(q.day*24+q.h); }
    if(typeof OUT!=='undefined') for(const q of OUT.rec(G)){ if(q.state!=='planned') continue; const tr=OUT.trip(G,q); let t=q.day*24+q.h-(tr.travelH||0)-0.25; if(q.ask!=null) t=Math.max(t,q.ask); cand(t); }
    for(const [k,h] of S.SOFT) cand(T(k,h));
    for(const f of S.stops){ try{ cand(f(G)); }catch(e){} }
    return best===Infinity?null:best; };
  S.newestTh=G=>{ if(typeof PHONE==='undefined') return null; const P=PHONE.pending?PHONE.pending(G):[]; const m=P.length?P[P.length-1]:((G.msgs||[]).filter(x=>x.from!=='player').slice(-1)[0]); return m&&PHONE.th?PHONE.th(m):null; };
  /* AA_527 2-7（企劃線 bfede0a62）：00:00～07:00 送到、不用回的訊息（沒有 ask、沒有 call），跳的時候不停在那一刻、跳到那一天 07:30 才停（訊息上的時間照原本，看得出是半夜傳的）；
     要回的照現在（送到就停）；電話是場景（S.due），照現在。例：芷若 6/3 05:07（英國 22:07）那一則＝畫面停在 6/3 07:30 */
  S.QUIET=[0,7]; S.QUIET_TO=7.5;
  S.quietMsgs=(o,h)=>{ const hh=((h%24)+24)%24; return hh>=S.QUIET[0]-1e-6&&hh<S.QUIET[1]-1e-6&&Array.isArray(o)&&o.every(m=>m&&!m.ask&&!m.call); };
  S.jumpTo=function(GM,target){ const G=GM.G, E=GM.E; let t=NOW(G), got=0, loud=false, hold=null; let step=target-t>24*60?6:0.25;   /* 60 天以上：每 6 小時看一次，對齊在每天 05、11、17、23 點（整點才跑 STORY.phoneRules；原本起點不在整點時一步都不在整點，整段都不跑——「那一天幾點以後」的訊息整段不見，AA 10-21 盤點發現）。
     每天 23 點那一次保證「那一天、幾點以後」「那一天、幾點以前（5 點以後）」的規則都跑得到；更窄的時段（例：18:00～19:45）長跳會錯過，畢業以後要準時的訊息請做成停點（S.MSGS／S.SOFT）。每個整點都跑太慢（83 天約 2.3 秒，STORY.phoneRules 一次約 1.3 ms）；tests/pg_longjump_phone_unit.js */
    const look=hourly=>{ try{ S.rules(GM); if(hourly&&typeof STORY!=='undefined'&&STORY.phoneRules) STORY.phoneRules(GM); if(typeof PHONE!=='undefined') PHONE.tick(G,o=>{ const k=(o&&o.length)|0; got+=k; if(k&&!S.quietMsgs(o,G.hour)) loud=true; }); }catch(e){ console.warn('PG jump',e); } };
    if(step===6){ const a=Math.ceil((t-5)/6+1e-9)*6+5; if(a<target) t=a-6; }   /* 長跳先對齊：下一步落在 05／11／17／23 點，之後每一步都是 */
    for(;;){ const lim=Math.max(target,hold==null?-Infinity:hold); let part=false;
      if(t+step<=lim+1e-6) t=Math.round((t+step)*4)/4; else if(t<lim-1e-6){ t=lim; part=true; } else break;   /* part：最後不到一步的那一段（照原本：到目標、整點規則照跑、不問 out／step）*/
      const d=Math.floor(t/24); setT(G,E,d,t-d*24); look(part||Math.abs(t-Math.round(t))<1e-6);
      if(got>0){ if(loud) return 'msg'; if(hold==null){ hold=d*24+S.QUIET_TO; step=0.25; } }   /* 清晨送到、不用回的：先不停，跳到 07:30（途中送到要回的＝當場停）*/
      if(hold!=null&&t>=hold-1e-6) return 'msg';
      if(part) continue;
      if(typeof OUT!=='undefined'&&OUT.due&&OUT.due(G)) return 'out'; if(S.due(G)) return 'step'; }
    return got>0?'msg':'ok'; };
  /* ---------- 跳日期時日期卡下面那一句（AA_353，AA-C 2026-10-21；照經濟系 econff3d.js 的 cardLine，句子照抄）----------
     範圍（含頭尾）和跳過的日子（d0+1～d1−1）重疊、條件成立、還沒用過的——落地前最近的那一段的那一句（AA_355 第 5 節第 2 題；原本是第一句）；用過的記在 G.flags.PG.lines（舊存檔沒有＝空）；同一天、隔一天的跳不出。不加停點、不加旗標。
     2029 那一表：臺灣路線（交換延畢的 2029 不考，不出）。2030 那一表：只給 2029 一試沒過再考的（S.retaker）。
     交換延畢（日本、美國路線）2030 第一次考：照 2029 那一表的句子、條件看 2030，日子換成 2030 的——照 S.Y，2030 的每一個日子都是 2029 的同一個星期幾、早一天（一試 8/4→8/3、放榜 9/7→9/6…），整張表往後移同樣的天數。
     每一列：[起 MM-DD, 迄 MM-DD（含）, 條件 (G, 年), 句子]。有沒有考一試看 BAR_SIT_<年>；一試過了＝考二試（S.stage2：BAR_STAGE_<年> 是 both／lawyer）*/
  const sat=(G,y)=>!!(G.flags&&G.flags['BAR_SIT_'+y]===true), two=(G,y)=>sat(G,y)&&S.stage2(G,y);
  S.CARDS_2029=[
    ['06-03','06-27',(G,y)=>S.sits(G,y)&&!fdLate(G),'（畢業以後，你還是每天八點起床。不用上課，就去總圖。）'],
    ['06-03','06-27',(G,y)=>!S.sits(G,y)&&!fdLate(G),'（畢業以後的第一個禮拜，你每天睡到自然醒。……然後就睡不著了。）'],   /* AA_476 A-2（企劃線 6ad997806）：FAIL_DELAY_CERT 有值的（被當延畢、證書延到六月）不出——他的「畢業以後」從 6/17 領證書才開始，6/18 起接「你媽這次把框裝上了」。上一列（報了 2030 國考的那一版）同一段、同一個理由，一起擋 */
    ['06-29','07-11',(G,y)=>S.sits(G,y),'（七月。總圖 B1 的長桌，每天早上都是同一群人。）'],
    ['07-15','08-02',(G,y)=>S.sits(G,y),'（考前三個禮拜。讀書計畫表的格子一格一格劃掉，剩下的比劃掉的少了。）'],
    ['08-05','09-06',(G,y)=>sat(G,y),'（一試考完，離放榜還有一個月。你把法典放在書架最上面。）'],
    ['09-08','10-19',(G,y)=>two(G,y),'（二試的書比一試厚。早上讀實體法，下午寫考古題，晚上把寫錯的再寫一次。）'],
    ['09-08','10-19',(G,y)=>sat(G,y)&&S.stage(G,y)==='none','（九月。學弟妹開學了，總圖又開始搶位子。明年你還會坐在這裡。）'],
    ['09-08','10-19',(G,y)=>!S.sits(G,y),'（九月。學弟妹開學了，總圖又開始搶位子。）'],
    ['10-22','12-13',(G,y)=>two(G,y),'（二試考完以後等放榜的七個禮拜，比讀書的時候還長。）'],
    ['10-22','12-13',(G,y)=>!two(G,y),'（十一月。公館的騎樓下，開始有人在賣烤地瓜。）'] ];
  S.CARDS_2030=[
    ['06-01','07-10',(G,y)=>S.sits(G,y),'（又是一個要讀書的夏天。總圖 B1 的位子，你坐的還是同一張。）'],
    ['07-12','08-01',(G,y)=>S.sits(G,y),'（考前三個禮拜。這次的讀書計畫表，你自己排。）'],
    ['08-04','09-05',(G,y)=>sat(G,y),'（一試考完。這一次，你沒有把法典放到書架最上面。）'],
    ['09-07','10-18',(G,y)=>two(G,y),'（二試的書還是很厚。你讀得比去年快一點。）'],
    ['10-21','12-12',(G,y)=>two(G,y),'（等放榜的七個禮拜。你去打工，晚上照樣翻一下考古題。）'] ];
  /* 交換延畢（日本、美國路線）的那幾張（2029 那一表不出；2030-06 起照 2029 那一表往後 364 天，見 S.cardRows）：
     AA_353 第 3 節：2029 夏天三句（6/3～9/2）；AA_357 第 4 節：大五上（9/4～12/23；Y5_DAYS 三選一；同一段有「共通」的共通先列＝先出）、寒假到 2030-05。
     美國路線那一句（9/4～12/17）：大五上第一次跳的時候先出（first）。「報名」那兩列：2030-05-10 問過的照回答（BAR_REG_2030），還沒問的照 Y4_PATH（bar＝報名）。
     每一列：[起 YYYY-MM-DD, 迄 YYYY-MM-DD（含）, 條件 G, 句子, {first}] */
  const dl=G=>S.delayed(G), ex=G=>S.exchDelayed(G), fd=G=>dl(G)&&!ex(G), fdc=G=>fd(G)&&!(typeof FD!=='undefined'&&FD.certLate&&FD.certLate(G)), fdLate=G=>fd(G)&&typeof FD!=='undefined'&&!!FD.certLate&&FD.certLate(G), y5d=(G,v)=>dl(G)&&!!G.flags&&G.flags.Y5_DAYS===v, y5us=G=>dl(G)&&typeof STORY!=='undefined'&&!!STORY.routeAbroadRoute&&STORY.routeAbroadRoute(G)==='US';
  S.reg2030=G=>{ const F=G.flags||{}; return F.BAR_REG_2030!=null?F.BAR_REG_2030===true:F.Y4_PATH==='bar'; };
  /* AA_471 第 7 節：2029 跨年（延畢那一年）交往中、那天沒有另外排她的跨年場次（12/31～1/1 的出遊：id 有 nye 或約的是她；現在遊戲裡 2029 沒有這種場次）＝「你沒有在家」那一句 */
  S.nyeOut=G=>{ if(typeof OUT==='undefined'||!OUT.rec) return false; const a=S.DK('2029-12-31'), P=S.partners(G); return OUT.rec(G).some(q=>q&&(q.day===a||q.day===a+1)&&q.state!=='cancelled'&&(/nye/i.test(q.id||'')||(!!q.who&&P.includes(q.who)))); };
  S.nyeAway=G=>S.partners(G).length>0&&!S.nyeOut(G);
  S.CARDS_DELAY=[
    ['2029-06-03','2029-06-27',G=>ex(G)&&!y5us(G),'（同屆的人都畢業了。你還差一門實習，九月再回學校。）'],
    ['2029-06-18','2029-06-27',fd,'（同屆的人都畢業了。你還差{課名}，九月再回學校。）'],   /* 被當延畢（AA_421 1-4）：6/18 成績單以後；6/3～6/17 照一般畢業生（那時候還不是延畢）*/
    ['2029-06-03','2029-06-27',y5us,'（同屆的人都畢業了。你還差一門實習和兩門課，九月再回學校。）'],   /* 美國路線還要補修強制執行法、法律倫理（AA_382 第 1 節，企劃線 e6d4a198）*/
    ['2029-06-29','2029-08-03',dl,'（七月。退宿以後住在家裡。不用趕早八，反而醒得很早。）'],
    ['2029-08-05','2029-09-02',dl,'（八月。同屆的人在考國考。你在群組裡傳了一句加油，很快就被洗下去了。）'],
    ['2029-09-04','2029-12-17',y5us,'（週一、週三補修兩門課。教室裡坐的，都是大四的學弟妹。）',{first:true}],
    ['2029-09-04','2029-12-17',fd,'（重修{課名}。教室裡坐的，都是學弟妹。）',{first:true}],
    ['2029-09-04','2029-09-10',G=>y5d(G,'study'),'（開學第一週。總圖三樓的位子，坐的大多是不認識的臉。）'],
    ['2029-09-04','2029-09-10',G=>y5d(G,'work'),'（你接了兩個家教。一個國三，一個高二。）'],
    ['2029-09-04','2029-09-10',G=>y5d(G,'bar'),'（你把國考的書在書桌上排成一排。先從民法開始。）'],
    ['2029-09-12','2029-09-21',G=>y5d(G,'study'),'（你常坐的那一排，換了一批大一的。他們讀書的時候，會小聲對答案。）'],
    ['2029-09-12','2029-09-21',G=>y5d(G,'work'),'（國三那個學生問你，法律系是不是要背很多。你說還好。他不信。）'],
    ['2029-09-12','2029-09-21',G=>y5d(G,'bar'),'（在家讀書，最難的是不去開冰箱。）'],
    ['2029-09-23','2029-10-15',G=>y5d(G,'study'),'（十月。總圖的冷氣比外面冷，你在位子上放了一件外套。）'],
    ['2029-09-23','2029-10-15',G=>y5d(G,'work'),'（家教的錢第一次匯進來。你沒有馬上花。）'],
    ['2029-09-23','2029-10-15',G=>y5d(G,'bar'),'（民法讀完第一輪。第二輪比第一輪慢。）'],
    ['2029-10-17','2029-11-19',G=>ex(G)||(fd(G)&&typeof FD!=='undefined'&&FD.lp(G)),'（週二去法扶。其他的日子，一天和一天很像。）',{common:true}],
    ['2029-10-17','2029-11-19',G=>fd(G)&&!(typeof FD!=='undefined'&&FD.lp(G)),'（一週一堂{課名}。其他的日子，一天和一天很像。）',{common:true}],   /* 共通（AA_363 T3：這一跳落在 11/19 以後＝出下面三選一那句，這句不出）*/
    ['2029-10-17','2029-11-19',G=>y5d(G,'study'),'（有一天，一個大一的跟你借延長線。他叫你學長。）'],
    ['2029-10-17','2029-11-19',G=>y5d(G,'work'),'（高二那個學生期中考進步了。他媽媽多塞了一袋橘子給你。）'],
    ['2029-10-17','2029-11-19',G=>y5d(G,'bar'),'（刑法的書，書邊都翻黑了。）'],
    ['2029-11-21','2029-12-17',G=>y5d(G,'study'),'（十二月。總圖門口有人在發期末考的講義。……那已經不是你的期末考。）'],
    ['2029-11-21','2029-12-17',G=>y5d(G,'work'),'（家教學生要期末考了。你比他還緊張。）'],
    ['2029-11-21','2029-12-17',G=>y5d(G,'bar'),'（考古題寫到第三年。錯的題目，越來越常是同一種。）'],
    ['2029-12-19','2029-12-23',ex,'（大五上結束了。這一次，沒有期末考。）',{common:true}],
    ['2029-12-19','2029-12-23',fd,'（大五上結束了。重修的報告，交出去了。）',{common:true}],   /* 共通（這一段沒有三選一：照現在，AA_363 T3）*/
    ['2030-01-01','2030-01-20',G=>dl(G)&&!S.nyeAway(G),'（跨年那天晚上，你在家。煙火是從電視上看的。）'],   /* AA_477 第 2 節（企劃線 0fae57ee2）：開始日 12-24→01-01——被當延畢 12/26 那一停（AA_471 §5）會讓它在跨年以前出現；下一列同理 */
    ['2030-01-01','2030-01-20',G=>dl(G)&&S.nyeAway(G),'（跨年那天晚上，你沒有在家。煙火很遠，她說這樣剛好。）'],   /* AA_471 第 7 節（企劃線 763993620）：交往中、那天另外沒有排她的跨年場次的；沒在交往的照上面原句 */
    ['2030-01-22','2030-02-01',G=>ex(G)||fdc(G),'（證書放在書桌上。你媽買了一個框，還沒裝進去。）'],
    ['2030-02-02','2030-02-10',G=>ex(G)||fdc(G),'（過年。親戚問你什麼時候畢業。你說上個月。）'],
    ['2030-02-11','2030-03-14',G=>ex(G)||fdc(G),'（二月。學弟妹開學了。這是你第一次，開學跟你沒有關係。）'],
    ['2030-02-18','2030-03-15',fdLate,'（二月。又一個學期。這次你每一堂都去了。）'],   /* 重修不到三堂、證書延到 2030-06（AA_421 1-5）；上面三張（證書、上個月畢業、開學跟你沒關係）不出（LAWWW-B 解讀：和證書還沒拿到矛盾）*/
    ['2030-06-18','2030-06-30',fdLate,'（證書放在書桌上。你媽這次把框裝上了。）',{first:true}],   /* 先出（同一段的「畢業以後的第一個禮拜」排在它後面）；AA_471 第 5 節：06-18 起，排在 6/17 系辦領證書之後（src/faildelay3d.js，原本 06-01）*/
    ['2030-03-16','2030-04-30',G=>dl(G)&&S.reg2030(G),'（四月。你每天早上九點到總圖。這次是為了國考。）'],
    ['2030-03-16','2030-04-30',G=>ex(G)&&!S.reg2030(G),'（四月。你開始寫履歷。寫到「交換」那一欄，寫了很久。）'],
    ['2030-03-16','2030-04-30',G=>fd(G)&&!S.reg2030(G),'（四月。你開始寫履歷。寫到畢業那一欄，停了一下。）'],
    ['2030-05-01','2030-05-31',G=>dl(G)&&S.reg2030(G),'（五月。國考報名的表格，你檢查了兩次才送出去。）'],
    ['2030-05-01','2030-05-31',G=>dl(G)&&!S.reg2030(G),'（五月。群組裡，去年畢業的人在聊上班。你看了，沒有回。）'] ];
  S.cardRows=function(G){ const R=[], add=(tab,yr,y,sh)=>{ for(const [a,b,c,t] of tab) R.push([S.DK(yr+'-'+a)+sh,S.DK(yr+'-'+b)+sh,c,y,t]); };
    if(S.delayed(G)){ for(const [a,b,c,t,o] of S.CARDS_DELAY) R.push([S.DK(a),S.DK(b),c,2030,t,o||null]); add(S.CARDS_2029,2029,2030,S.DK(Y[2030].exam)-S.DK(Y[2029].exam)); }
    else { add(S.CARDS_2029,2029,2029,0); if(S.retaker(G)) add(S.CARDS_2030,2030,2030,0); }
    return R; };
  /* 一跳只出一句（AA_355 第 5 節第 2 題，AA-C 2026-10-21）：出「最後一句」——落地以前最近的那一段裡、條件成立、沒用過的那一句（同一段照表的順序：共通先出）；
     前面的段落沒出的就不出（句子寫的是「現在」的狀態）。first（美國路線大五上那一句）先出。原本出的是最早一段的第一句（3d1105e2）*/
  /* AA_363 T3（不加停點，規則改一條）：一跳碰到的範圍同時有「共通」（{common}）和三選一兩句、而且這一跳的落點已經到了那個範圍的最後一天以後（之後的跳不會再碰到這個範圍）
     ＝出三選一那句，共通的不出。落點還在範圍裡（下一跳還會碰到）照舊：共通先出、下一跳出三選一。三選一沒有可出的（9/3 沒選、用過了）＝照舊出共通 */
  S.cardLine=function(G,d0,d1){ if(!G||!G.flags||d1-d0<2) return null; const r=S.rec(G); if(!Array.isArray(r.lines)) r.lines=[]; const k0=d0+1, k1=d1-1; let best=null;
    const rows=S.cardRows(G), okRow=x=>{ try{ return !!x[2](G,x[3]); }catch(e){ return false; } };
    for(const row of rows){ const [da,db,,,t,o]=row; if(r.lines.includes(t)||da>k1||db<k0) continue; if(!okRow(row)) continue;
      if(o&&o.first){ best={t}; break; }
      if(o&&o.common&&d1>=db&&rows.some(x=>x!==row&&x[0]===da&&x[1]===db&&!(x[5]&&(x[5].common||x[5].first))&&!r.lines.includes(x[4])&&okRow(x))) continue;
      const e=Math.min(db,k1); if(!best||e>best.e||(e===best.e&&da>best.da)) best={t,e,da}; }
    if(!best) return null; r.lines.push(best.t); return typeof FD!=='undefined'&&FD.fill?FD.fill(G,best.t):best.t; };   /* {課名}：被當延畢的那一門（FD.fill）*/
  S.busy=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['postgrad3d:busy']=()=>{ S.busy=false; running.clear(); };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  S.DORM={x:0,z:2.4,yaw:Math.PI,lv:0};   /* 宿舍房間（story3d.js Y4_DORM）*/
  S.advance=async function(GM,o){ const G=GM.G, E=GM.E; if(E&&E.player&&E.player.seat&&GM.standUp) GM.standUp(E.player);
    if(S.y4Due(G)) return false;
    if(typeof STORY!=='undefined'&&STORY.gradEnvelopeDue&&STORY.gradEnvelopeDue(G)&&G.zone!=='dorm'&&GM.enter){   /* 1A-12 大伯的信封＝22:00 以後第一次在宿舍房間（AA_318）：跳之前先回宿舍 */
      GM.sceneBegin(); try{ await GM.fade(true); if(GM.titleCard) await GM.titleCard('回宿舍','',1800); await GM.enter('dorm',Object.assign({},S.DORM)); await GM.fade(false); } finally { GM.sceneEnd(); } return true; }
    let s=S.due(G); if(s){ await S.runStep(GM,s); return true; }
    const t=S.nextStop(G); if(t==null) return false;
    const ep=S.byId('epi'); if(ep&&!S.done(G,'epi')&&Math.abs(t-ep.at(G))<1e-6&&ep.cond(G)){ await S.runStep(GM,ep); return true; }   /* 五年後：字卡在尾聲裡 */
    const d0=G.day; let res='ok'; GM.sceneBegin(); try{ await GM.fade(true); res=S.jumpTo(GM,t);
      if(GM.updateHUD) GM.updateHUD(); if(E&&E.setWeather) E.setWeather(G.weather);
      const ln=S.cardLine(G,d0,G.day);   /* AA_353：跳過的日子那一句（同一天、隔一天＝null）*/
      if(GM.titleCard&&(G.day!==d0||(o&&o.sleep))) await GM.titleCard(S.dateLabel(G.day,G.hour),ln||'',ln?3200:1800);
      await GM.fade(false); } finally { GM.sceneEnd(); }
    if(GM.autosave) GM.autosave();
    if(res==='msg'&&GM.phoneThread) await GM.phoneThread(S.newestTh(G),{skip:true});   /* 收到訊息：打開那一段，關掉再繼續 */
    s=S.due(G); if(s&&!(E&&E.player&&E.player.busy)) await S.runStep(GM,s);
    return true; };
  /* 睡覺（story3d.js sleepNow、home3d.js 在家睡）：畢業後篇＝到下一件事；6/1 晚上（沒有 1A-12 的時候）＝睡到 6/2 早上 08:00，不會睡過典禮 */
  S.sleepJump=async function(GM){ const G=GM.G; if(!G||!G.flags||!law(G)) return false; if(S.busy) return true;
    if(!S.on(G)){ const gd=S.gradDay(); if(S.done(G,'grad')||S.familyModule()||G.day<gd-1||NOW(G)>=gd*24+8) return false;
      S.busy=true; try{ GM.sceneBegin(); try{ await GM.fade(true); toAtLeast(GM,gd*24+8); if(GM.titleCard) await GM.titleCard(S.dateLabel(G.day,G.hour),'',1800); await GM.fade(false); } finally { GM.sceneEnd(); } if(GM.autosave) GM.autosave(); } finally { S.busy=false; } return true; }
    if(S.nextStop(G)==null&&!S.due(G)) return false;
    if(typeof EVENTS!=='undefined'&&EVENTS.sleepEvent){ let ev=null; try{ ev=EVENTS.sleepEvent(); }catch(e){} if(ev) return false; }   /* 睡著時要演的（例：1A-12 沒回房間就睡著＝大伯的信封）：照一般的睡覺 */
    if(S.y4Due(G)) return false;
    S.busy=true; try{ return await S.advance(GM,{sleep:true}); } finally { S.busy=false; } };
  S.bedOptions=G=>S.on(G)&&!S.y4Due(G)&&(S.due(G)||S.nextStop(G)!=null)?[{t:'睡覺',hint:'到下一件事',kind:'sleep'},{t:'先不睡',kind:'stay'}]:null;   /* 同經濟系事件模式的床 */
  /* 每 0.5 秒（story3d.js 的 S.tick）：手機規則；場景時間到了就演；畢業後篇站著不動 2 秒＝跳 */
  let idleSince=0; S.IDLE_MS=2000;
  S.tick=function(GM){ const G=GM.G; if(!G||!G.flags||!law(G)||NOW(G)<T('2029-05-10',0)) return; S.rules(GM); if(S.busy) return;
    const E=GM.E, P=E&&E.player;
    const free=!!P&&!E.paused&&!P.busy&&!(GM.D&&GM.D.active)&&!GM.titleIdle&&!(P.path&&P.path.length)&&!(typeof EVENTS!=='undefined'&&EVENTS.running)&&!(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G));
    if(!free){ idleSince=0; return; }
    const s=S.due(G); if(s&&!P.seat){ idleSince=0; S.busy=true; S.runStep(GM,s).catch(e=>console.warn('PG '+s.id,e)).finally(()=>{ S.busy=false; }); return; }
    if(!S.on(G)||P.seat||(+P.speed||0)>0.05||P.pose==='walk'||P.pose==='run'||S.y4Due(G)||(typeof OUT!=='undefined'&&OUT.due&&OUT.due(G))||(typeof PHONE!=='undefined'&&PHONE.mustOpen&&PHONE.mustOpen(G))){ idleSince=0; return; }
    const now=Date.now(); if(!idleSince){ idleSince=now; return; } if(now-idleSince<S.IDLE_MS) return; idleSince=0;
    if(S.nextStop(G)==null) return;
    S.busy=true; S.advance(GM).catch(e=>console.warn('PG advance',e)).finally(()=>{ S.busy=false; }); };
  /* ---------- 掛上去：TERMEND_LINES 的大四下版本、出遊的事件 ---------- */
  S.patchTermend=function(){ if(typeof TERMEND_LINES==='undefined'||!L()) return false; const Lx=TERMEND_LINES, TE=L().TE;
    for(const id in TE.HEART){ const h=Lx.HEART[id]; if(!h) continue; const o=Object.assign({terms:['Y4S2'],pg:true},TE.HEART[id]); delete o.h; delete o.h2; delete o.dm;
      if(id==='heroine_04') o.table=G=>{ const y=typeof TERMEND!=='undefined'?TERMEND.heart('heroine_04','Y4S1'):null; return y?(typeof y.table==='function'?y.table(G):y.table):null; };   /* 飯桌一句照大四上那一句 */
      h.over=(h.over||[]).filter(v=>!v.pg).concat([o]); }
    for(const id in TE.GF){ const g=Lx.GF[id]; if(!g) continue; const o={terms:['Y4S2'],pg:true,invite:TE.GF[id].invite}; if(TE.GF[id].table) o.table=TE.GF[id].table; g.over=(g.over||[]).filter(v=>!v.pg).concat([o]); }
    return true; };
  S.EVS=[
    {id:'ev_pg_sis_bday',title:'學姊的生日：研究室，八點半',participants:[],location:'any',trigger:'outing',background:'dark',hours:1,dialogue:[],
      beforeOuting:async(G,GM,q)=>{ await S.bdayScene(GM,'outing'); }, outingMissed:(G,GM,q)=>{ if(G.flags.SIS_BDAY_Y4==null) G.flags.SIS_BDAY_Y4='none'; }},
    {id:'ev_pg_kx_grad',title:'兩個畢業典禮',participants:[],location:'any',trigger:'outing',background:'dark',hours:4.5,dialogue:[],
      beforeOuting:async(G,GM,q)=>{ await S.kxGradScene(GM); }, outingMissed:(G,GM,q)=>{ S.kxGradMissed(GM); }},
    {id:'ev_pg_noodle',title:'阿鳳麵店・長桌',participants:[],location:'any',trigger:'outing',background:'dark',hours:2,dialogue:[],
      beforeOuting:async(G,GM,q)=>{ await S.noodleScene(GM); }},
    {id:'ev_pg_noodle_2030',title:'阿鳳麵店・長桌',participants:[],location:'any',trigger:'outing',background:'dark',hours:2,dialogue:[],
      beforeOuting:async(G,GM,q)=>{ await S.noodleScene2030(GM); }, outingMissed:(G,GM,q)=>{ S.noodleMissed2030(GM).catch(e=>console.warn('PG noodle 2030 missed',e)); }},
    {id:'ev_pg_sis_sea',title:'學姊的生日：北海岸',participants:[],location:'any',trigger:'outing',background:'dark',hours:4,dialogue:[],
      beforeOuting:async(G,GM,q)=>{ await S.seaScene(GM); }} ];   /* 學姊 2030 年的生日（AA_382 第 4 節；排在最後：測試用 PG.EVS[2] 找麵店）。沒去：6/2 15:00 的照片（S.MSGS pg_sis_sea_alone）*/
  S.register=function(){ if(typeof STORY_EVENTS==='undefined') return false; for(const e of S.EVS) if(!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e); return true; };
  S.patchTermend(); S.register();
  return S;
})();
