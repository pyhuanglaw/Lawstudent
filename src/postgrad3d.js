/* ===== 畢業以後（AA_319 1A-13、1A-14、1A-16～1A-20；台詞在 src/data/postgrad_lines.js）=====
   一條線：2029-05-10 21:00 國考報名提醒 → 6/2 畢業典禮拍照（12:00～13:30，CG-9）→ 傍晚（一對一的飯、Café 併桌）→ 20:30 學姊的生日 → 6/9 可昕的畢業典禮（BCG-07）→
   7/12 20:00 總圖 B1 → 8/3 學姊的便條 → 8/4 一試（20 題）→ 9/7 一試放榜 → 10/20～21 二試 → 12/14 二試放榜（18:00 麵店、21:00 以安的電話）→
   2030-01-25 以安三試放榜（電話）→（交換延畢、2029 一試不到 12 題：2030 再一輪，8/3、9/6、10/19～20、12/13）→ 2030-10-01 第一份工作 → 2034-06-03 尾聲（CG-10）→ 回標題。
   - 拍照演完（F.GRADUATED）以後是「畢業後篇」（S.on）：站著不動 2 秒、或睡覺＝跳到下一件事（場景、手機訊息、出遊；做法同經濟系的 ECONFF）；
     跳的途中照時間跑手機規則，收到訊息就停、打開那一段。課表的提醒、去上課的選單不再跳（classes3d.js 讀 PG.on）。
   - 場景（S.STEPS）：時間到了、玩家空下來就演，不能錯過的不給「不去了」。手機（S.MSGS）照時間排。可以不去的照出遊（OUT：Café、麵店、學姊的生日、可昕的典禮）。
   - 一對一的飯、回家的路照 termend3d.js：TERMEND_LINES 補大四下（Y4S2）的版本（S.patchTermend）。
   - 一試 20 題：期末考的題庫（EXAM_BANK）＋刑訴 QBANK 一起隨機抽、不重複，第二年換一組；題目、答案照題庫，不改。答對題數只在 9/7 放榜看得到。
   - 1A-12（主線 12 畢業典禮的家人，別一批）有 ev_grad_family 的話，拍照等那一段演完；沒有的話 6/2 早上直接帶到 12:00。
   - 存檔：G.flags.PG＝{done:{場景 id:1|'missed'}, exam:{年:{qs,ans}}}；旗標照 AA_319 第 4 節（BAR_REG、BAR_SCORE_<年>、BAR_SIT_<年>、BAR_STAGE_<年>、BAR_YEAR、
     GRADUATED、GRAD_PHOTO、SIS_THERMOS、GRAD_EVENING、GRAD_CAFE_HEARD、SIS_BDAY_Y4、PS_GRAD_CARD、KX_TERMEND_Y4S2、KX_GRAD、FIRST_DAY_SEEN、EPILOGUE_DONE）。
   - 開發分支還沒有的旗標（Y4_PATH、GRAD_ADMIT、ZQ_CONTRACT、KAI_STAYED_UP…）一律當作沒有。
   測試：node tests/graduation_unit.js、tests/bar_exam_unit.js、tests/epilogue_unit.js、tests/postgrad_days_unit.js */
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
  S.delayed=G=>!!(typeof STORY!=='undefined'&&STORY.routeAbroadRoute&&STORY.routeAbroadRoute(G));   /* 交換延畢（日本、美國路線）：2029 不能考，2030 考 */
  S.lean=G=>(typeof STORY!=='undefined'&&STORY.careerLean?STORY.careerLean(G):null)||{A:0,B:0,C:0,top:'B'};
  const nm=id=>typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(id):((typeof CHARACTERS!=='undefined'&&CHARACTERS[id]&&CHARACTERS[id].name)||id);
  const nmD=(G,id)=>(S.dating(G,id)&&typeof SOCIAL!=='undefined'&&SOCIAL.datingName&&SOCIAL.datingName(id))||nm(id);   /* 交往中的叫法（學姊＝書瑀；AA_327 2-Y4-42「照程式現有的稱呼規則」）*/
  S.who=(G,w)=>{ if(w==null) return null; if(w==='me') return {name:G.name||'祐廷'}; if(typeof w==='object') return w; return {name:nmD(G,w),charId:w}; };
  S.sisOk=G=>!S.isEx(G,'heroine_05')&&S.at(G,'heroine_05','FRIEND');
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
  S.sits=(G,y)=>{ const F=G.flags||{}; if(y===2029) return F.BAR_REG===true&&!S.delayed(G); return S.delayed(G)?F.BAR_REG!==false:(F.BAR_SIT_2029===true&&S.stage(G,2029)==='none'); };   /* 2030：交換延畢（第一次考）、2029 一試不到 12 題（AA_319 1A-18 第 7 節）*/
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
  S.zqLine=G=>S.lean(G).top==='C'&&S.at(G,'heroine_04','FRIEND')&&(G.flags.ZQ_CONTRACT==='lawyer'||G.flags.ZQ_CONTRACT===true);   /* 子晴線達成：落點 C、FRIEND 以上、Q14 陪她去找律師（Q14 還沒做）*/
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
    const inv=[].concat(kind==='gf'?TE.GF.heroine_04.invite:(think.heroine_04!=null?TE.HEART.heroine_04.invite2:TE.HEART.heroine_04.invite)), dec=TE.HEART.heroine_04.decline;
    const ask={id:'pg_zq_dm',until:T(GRAD,17.75),opts:[{t:'好。',set:{PG_TE_PICK:'heroine_04|'+kind}},{t:'今天晚上我有約了。',say:[{from:'heroine_04',text:dec}]}]};
    return inv.map((t,i)=>Object.assign(P_('heroine_04',t),i===inv.length-1?{ask}:{})); };   /* 16:30 私訊；手機的兩個回答照 termend3d.js（「好。」／TERMEND_LINES.AUTO_ME_GRAD）*/
  S.bdayKnown=G=>graduated(G)&&inFam(G)&&(S.sisOk(G)||S.isEx(G,'heroine_05'));
  S.kevinItems=function(G){ const B=L().BDAY, m=FAM('kevin',B.kevin); if(S.isEx(G,'heroine_05')) m.ask={id:'pg_sis_ex_bday',until:T(GRAD,27),opts:[{t:B.exOpts[0],post:false,set:{PG_SIS_EX_BDAY:'send'}},{t:B.exOpts[1],post:false,set:{PG_SIS_EX_BDAY:'no'}}]}; return [m]; };   /* 前任：沒有「去」，只有傳不傳 */
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
    {tag:'pg_r1g_'+y,at:[K.r1,15],cond:G=>inNoodle(G)&&(y===2029||S.sits(G,2030)),items:G=>grp(L().R1.group)},
    {tag:'pg_r1f_'+y,at:[K.r1,15+6/60],cond:G=>y===2029&&G.flags.BAR_SIT_2029===true&&inNoodle(G),items:G=>grp(L().R1.friends.concat(S.stage(G,2029)==='none'?L().R1.low:[]))},
    {tag:'pg_r1kx_'+y,at:[K.r1,15+8/60],cond:G=>y===2029&&S.dating(G,'kexin'),items:G=>[P_('kexin',L().R1.kexin)].concat(S.stage2(G,2029)?[P_('kexin',L().R1.kexinBoth)]:[])},
    {tag:'pg_r1sis_'+y,at:[K.r1,15+20/60],cond:G=>y===2029&&G.flags.BAR_SIT_2029===true&&S.stage(G,2029)==='none'&&S.sisOk(G),items:G=>L().R1.sisLow.map(t=>P_('heroine_05',t))},
    {tag:'pg_r2g_'+y,at:[K.r2,15],cond:G=>inNoodle(G)&&(y===2029||S.sits(G,2030)),items:G=>grp(L().R2.group)},
    {tag:'pg_r2f_'+y,at:[K.r2,15+6/60],cond:G=>y===2029&&S.stage2(G,2029)&&inNoodle(G),items:G=>[GR('zhe',L().R2.zhe)].concat(L().R2.bohan.map(t=>GR('classmate_bohan',t)))},
    {tag:'pg_r2late_'+y,at:[K.r2,15+5/60],cond:G=>y===2029&&S.delayed(G),items:G=>[P_('zhe',L().R2.zheLate)]},
    {tag:'pg_r2kx_'+y,at:[K.r2,15+5/60],cond:G=>y===2029&&S.dating(G,'kexin')&&G.flags.BAR_SIT_2029!==true,items:G=>L().R2.kexinNone.map(t=>P_('kexin',t))},
    {tag:'pg_r2sis_'+y,at:[K.r2,15+20/60],cond:G=>G.flags.BAR_YEAR===y&&S.sisOk(G)&&(y===2029||S.sits(G,2030)),items:G=>(y===2030&&S.retaker(G)?L().R2.sis2:L().R2.sis).map(t=>P_('heroine_05',t))} ]; };   /* AA_327 2-Y4-60（第二年才上：2-Y4-51）*/
  S.MSGS=[
    /* 1A-13 前一晚 */
    {tag:'pg_ps_eve',at:['2029-06-01',22],cond:G=>S.dating(G,'classmate_peishan'),items:G=>[P_('classmate_peishan',L().PARTNER.classmate_peishan.eve)]},
    {tag:'pg_zr_eve',at:['2029-06-01',23],cond:G=>S.dating(G,'heroine_02'),items:G=>[P_('heroine_02',L().PARTNER.heroine_02.eve)]},
    /* 1A-13 ⑦ 手機（不在現場的人）*/
    {tag:'pg_kx_ex',at:[GRAD,12],cond:G=>S.isEx(G,'kexin'),items:G=>L().PHONE.kexinEx.text.map(t=>P_('kexin',t))},
    {tag:'pg_sis_ex',at:[GRAD,12],cond:G=>S.isEx(G,'heroine_05'),items:G=>[P_('heroine_05',L().THERMOS.ex)]},
    {tag:'pg_ps_card',at:[GRAD,12.5],cond:G=>!S.dating(G,'classmate_peishan')&&!S.isEx(G,'classmate_peishan')&&!!G.flags.PS_RECONNECT&&S.at(G,'classmate_peishan','FAMILIAR'),items:G=>L().PHONE.peishan.text.map(t=>P_('classmate_peishan',t)),after:G=>{ G.flags.PS_GRAD_CARD=true; }},   /* AA_327 2-Y4-53：收過照片記 PS_GRAD_CARD */
    {tag:'pg_fy',at:[GRAD,13],cond:G=>!S.isEx(G,'npc_fangyt')&&S.at(G,'npc_fangyt','FAMILIAR'),items:G=>L().PHONE.fangyt.text.map(t=>P_('npc_fangyt',t))},
    {tag:'pg_zr_photo',at:[GRAD,21],cond:G=>!S.dating(G,'heroine_02')&&!S.isEx(G,'heroine_02')&&S.at(G,'heroine_02','FAMILIAR'),items:G=>L().PHONE.zhiruo.text.map(t=>P_('heroine_02',t))},
    /* 1A-14 */
    {tag:'pg_zq_dm',at:[GRAD,16.5],cond:G=>!!S.zqInvite(G),items:G=>S.zqItems(G)},
    {tag:'pg_cafe_photo',at:[GRAD,17.5],cond:G=>graduated(G)&&!!S.tePicked(G)&&inNoodle(G),items:G=>[GR('zhe',L().CAFE.photo)],after:G=>{ G.flags.GRAD_CAFE_HEARD=true; }},   /* 接了一對一：記「聽說」*/
    {tag:'pg_kevin_bday',at:[GRAD,19.5],cond:G=>S.bdayKnown(G),items:G=>S.kevinItems(G),after:G=>S.planBday(G)},
    {tag:'pg_sis_lover_dm',at:[GRAD,19.5+1/60],cond:G=>graduated(G)&&S.dating(G,'heroine_05')&&S.tePicked(G)!=='heroine_05',items:G=>L().BDAY.loverDm.map(t=>P_('heroine_05',t)),after:G=>S.planBday(G)},
    {tag:'pg_sis_thanks',at:['2029-06-03',10],cond:G=>{ const q=typeof OUT!=='undefined'?OUT.get(G,'pg_sis_bday'):null; return !!q&&q.state==='missed'&&inFam(G); },items:G=>[FAM('heroine_05',L().BDAY.thanks)]},
    {tag:'pg_kx_inv',at:['2029-06-03',21],cond:G=>graduated(G)&&S.dating(G,'kexin'),items:G=>[P_('kexin',L().KX.invite)],after:G=>S.planKx(G)},
    /* 1A-16～18 */
    {tag:'pg_b1_zhe',at:['2029-07-12',17],cond:G=>S.sits(G,2029)&&inNoodle(G),items:G=>[GR('zhe',L().B1.zhe)]},
    {tag:'pg_an_group',at:['2030-01-25',21],cond:G=>!S.at(G,'heroine_01','FRIEND')&&inNoodle(G),items:G=>[GR('heroine_01',L().AN.group)]},   /* 和以安不到 FRIEND：麵店團一則（到了的是她打來的電話）*/
    {tag:'pg_yt_2030_r1',at:['2030-09-06',15+10/60],cond:G=>inNoodle(G)&&S.at(G,'heroine_03','FAMILIAR'),items:G=>L().Y2030.yt1.map(t=>GR('heroine_03',t))},
    {tag:'pg_zhe_2030_r2',at:['2030-12-13',15+6/60],cond:G=>inNoodle(G),items:G=>S.zhe2030(G)},
    {tag:'pg_yu_2030_r2',at:['2030-12-13',15+8/60],cond:G=>inNoodle(G),items:G=>[GR('yu',L().Y2030.yu)]},
    {tag:'pg_yt_2030_r2',at:['2030-12-13',15+10/60],cond:G=>inNoodle(G)&&S.at(G,'heroine_03','FAMILIAR'),items:G=>L().Y2030.yt2.map(t=>GR('heroine_03',t))} ].concat(yearMsgs(2029),yearMsgs(2030));
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
    return OUT.plan(G,{id:'pg_sis_bday',ev:'ev_pg_sis_bday',day:S.gradDay(),h:20.5,late:0.5,place:'霖澤館・研究室',title:'學姊的生日：研究室，八點半',travel:'走過去約 10 分鐘',travelH:1/6}); };
  S.planKx=G=>typeof OUT!=='undefined'&&OUT.plan(G,{id:'pg_kx_grad',ev:'ev_pg_kx_grad',day:S.DK('2029-06-09'),h:16.5,late:0.5,place:'政大',title:'兩個畢業典禮（政大）',travel:'開車約 40 分鐘',travelH:2/3});
  S.planNoodle=(G,y)=>typeof OUT!=='undefined'&&OUT.plan(G,{id:'pg_bar_noodle_'+y,ev:'ev_pg_noodle',day:S.DK(Y[y].r2),h:18,late:0.5,place:'阿鳳麵店',title:'阿鳳麵店・長桌',travel:'走過去約 15 分鐘',travelH:0.25});
  /* ---------- 手機規則（story3d.js 的 S.tick、跳的途中照時間）---------- */
  S.rules=function(GM){ const G=GM&&GM.G?GM.G:GM; if(!G||!G.flags||!law(G)) return; const now=NOW(G); if(now<T('2029-05-10',0)) return; const F=G.flags;
    if(F.Y4_PATH==='bar'&&F.BAR_REG==null&&now>=T('2029-05-10',21)) F.BAR_REG=true;   /* 已經報名的：沒有提醒（X1）*/
    if(typeof PHONE!=='undefined') for(const m of S.MSGS){ if(PHONE.sent(G,m.tag)) continue; const t=T(m.at[0],m.at[1]); if(now<t-0.5||now>t+48) continue; let ok=false; try{ ok=!!m.cond(G); }catch(e){ ok=false; } if(!ok) continue;
      const d=Math.floor(t/24); let items=[]; try{ items=m.items(G)||[]; }catch(e){ console.warn('PG msg '+m.tag,e); continue; } if(items.length&&PHONE.at(G,d,t-d*24,items,m.tag)&&m.after) m.after(G); }
    if(typeof F.PG_TE_PICK==='string'){ const [who,kind]=F.PG_TE_PICK.split('|'); delete F.PG_TE_PICK; if(!S.tePicked(G)) S.planTe(G,who,kind); }   /* 子晴 16:30 的邀約回了「好。」*/
    if(F.PG_SIS_EX_BDAY==='send'&&typeof PHONE!=='undefined'&&!PHONE.sent(G,'pg_sis_ex_bday_reply')){ const B=L().BDAY; PHONE.post(G,{th:'p:heroine_05',from:'player',text:B.exSend,tag:'pg_sis_ex_bday_reply'}); for(const t of B.exReply) PHONE.post(G,Object.assign(P_('heroine_05',t),{tag:'pg_sis_ex_bday_reply'})); F.SIS_BDAY_Y4='msg'; }
    if(F.PG_SIS_EX_BDAY==='no'&&F.SIS_BDAY_Y4==null) F.SIS_BDAY_Y4='none';
    const done=S.teDone(G); if(done&&!F.GRAD_EVENING) F.GRAD_EVENING='date:'+done;
    if(graduated(G)&&!F.GRAD_EVENING&&now>=(S.gradDay()+1)*24) F.GRAD_EVENING='none';
    if(!F.GRADUATED&&now>=T('2029-06-04',0)){ F.GRADUATED=S.gradDay(); if(!S.rec(G).done.grad) S.rec(G).done.grad='missed'; } };   /* 6/2 那一段沒演到（讀檔、跳過）也算畢業了：不卡在學生的作息裡 */
  /* ---------- 場景（時間到了、玩家空下來就演）---------- */
  async function regScene(GM){ const G=GM.G, F=G.flags, R=L().REG; if(F.BAR_REG!=null) return; if(typeof PHONE!=='undefined'&&!PHONE.sent(G,'pg_reg_sys')) PHONE.post(G,{th:'sys',text:R.text,tag:'pg_reg_sys'});
    GM.sceneBegin(); try{ await GM.say(null,R.text); const k=await GM.choose(R.opts.map(t=>({t}))); F.BAR_REG=k===0; } finally { GM.sceneEnd(); } }
  S.familyModule=()=>(typeof STORY!=='undefined'&&!!STORY.gradFamily)||(typeof STORY_EVENTS!=='undefined'&&STORY_EVENTS.some(e=>e.id==='ev_grad_family'));   /* 1A-12 主線 12（AA_318，story3d.js S.gradFamily：08:00～12:00，撥穗記 GRADUATED）*/
  S.gradReady=G=>!S.familyModule()||G.day>S.gradDay()||!!(G.events&&G.events.done&&G.events.done.ev_grad_family);   /* 拍照接在家人那一段後面（那一段在演＝玩家不空，不會插進去）*/
  S.CLASS=['zhe','yu','classmate_bohan','classmate_xinci','classmate_mingxuan','heroine_01','classmate_youchen'];   /* 同班（大合照）*/
  S.PARTNER_ORDER=['kexin','heroine_05','heroine_01','heroine_03','heroine_04','heroine_02'];   /* 沛珊在台南：前一晚的訊息、18:00 視訊 */
  S.thermos=async function(GM){ const G=GM.G, F=G.flags, W=L().THERMOS, sis=S.who(G,'heroine_05'); await S.play(GM,W.lines);
    if(F.HOT_WATER) await GM.say(sis,W.hotWater); else if(S.helpedCoffee(G)) await GM.say(sis,W.helped);
    if(F.MET_SIS_FATHER) await GM.say(sis,W.father);   /* 最後多一句（AA_319 5ae6a133；MET_SIS_FATHER＝AA_328 3-14，開發分支還沒有）*/
    F.SIS_THERMOS=true; };
  S.helpedCoffee=G=>{ const M=G.social&&G.social.mem&&G.social.mem.heroine_05; return !!(M&&M.some(m=>m.tag==='HELPED'&&/黑咖啡/.test(m.note||''))); };   /* 只有 HELPED（空的保溫瓶那次選黑咖啡）*/
  S.mother=async function(GM,partner){ const G=GM.G, M=L().MOTHER, A=adv(); await S.play(GM,M.lines);
    if(partner){ await S.play(GM,M.partner); const k=await GM.choose(M.opts.map(o=>({t:o.t}))); await S.play(GM,(M.opts[k]||M.opts[0]).say); }
    if(A&&A.setBg) A.setBg(BG('graduation_avenue'));   /* 離開 CG-9 那一拍 */
    if(typeof SOCIAL!=='undefined'&&SOCIAL.remember) SOCIAL.remember('heroine_01',M.mem.tag,M.mem.note); };
  S.yt17=async function(GM){ const G=GM.G, Y17=L().YT17; await S.play(GM,Y17.lines); const d=S.dating(G,'heroine_03'), other=!d&&S.partners(G).length>0;
    await GM.say(S.who(G,'heroine_03'),d?Y17.dating:(other?Y17.other:Y17.friend)); };
  S.zrVideo=async function(GM){ const G=GM.G, F=G.flags; if(!S.dating(G,'heroine_02')||F.PG_ZR_VIDEO) return false; F.PG_ZR_VIDEO=true; await S.play(GM,L().PARTNER.heroine_02.video); return true; };   /* 芷若（在英國）：典禮開始前視訊（BB_99 第 6 節）*/
  S.beforeLawCeremony=async function(GM,bg){ const G=GM.G, A=adv(); if(!S.dating(G,'heroine_02')||G.flags.PG_ZR_VIDEO) return false; toAtLeast(GM,S.gradDay()*24+10.5);   /* 1A-12 家人那一段裡：校級典禮完、法律學院典禮（11:00）以前，這裡 10:30＝英國凌晨三點多 */
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
      const dec=kind==='heart'?TE.HEART[id].decline:(((typeof TERMEND_LINES!=='undefined'&&TERMEND_LINES.AUTO_NO_GRAD)||{})[id]||TE.HEART[id].decline);
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
      const shown=new Set(); for(const id of S.PARTNER_ORDER) if(partners.includes(id)){ await S.partnerBeat(GM,id); shown.add(id); }   /* ② 伴侶永遠是大合照之後的第一個 */
      if(!shown.has('heroine_01')&&!S.isEx(G,'heroine_01')&&S.at(G,'heroine_01','FRIEND')) await S.mother(GM,false);   /* ③ 新 21 */
      if(!shown.has('heroine_05')&&S.sisOk(G)) await S.thermos(GM);   /* ④ W15 */
      if(!shown.has('heroine_03')&&!S.isEx(G,'heroine_03')&&S.at(G,'heroine_03','FRIEND')) await S.yt17(GM);   /* ⑤ 事件 17 */
      if(!shown.has('heroine_04')&&!S.isEx(G,'heroine_04')&&S.at(G,'heroine_04','FRIEND')) await S.play(GM,Lx.OTHERS.heroine_04);   /* ⑥ */
      if(!S.isEx(G,'classmate_mingxuan')&&S.at(G,'classmate_mingxuan','FAMILIAR')){ await S.play(GM,Lx.OTHERS.mingxuan); if(has('classmate_mingxuan','SAW_HIM_STUDY')) await S.play(GM,Lx.OTHERS.mingxuanSaw); }
      await S.play(GM,Lx.OTHERS.kai);
      await S.invites(GM);   /* ⑧ */
      F.GRADUATED=F.GRADUATED||G.day;   /* AA_318 1A-12：GRADUATED＝那一天 */
    } finally { if(A&&A.active) A.end(); GM.sceneEnd(); }
    await GM.fade(true); toAtLeast(GM,gd*24+13.5); await GM.fade(false); }
  async function cafeScene(GM){ const G=GM.G, F=G.flags, C=L().CAFE, A=adv(); GM.sceneBegin(); try{ if(A) A.begin({background:'blur'});
      await S.play(GM,C.open); await S.play(GM,C.pool.filter(x=>S.at(G,x[0],'FAMILIAR')).slice(0,3)); await S.play(GM,C.close); F.GRAD_EVENING='cafe'; }
    finally { if(A&&A.active) A.end(); GM.sceneEnd(); }
    await GM.fade(true); toAtLeast(GM,S.gradDay()*24+19.75); await GM.fade(false); }
  S.bdayScene=async function(GM,mode){ const G=GM.G, F=G.flags, B=L().BDAY, A=adv(), lover=S.dating(G,'heroine_05');
    const bg=(typeof OUT!=='undefined'&&OUT.BG&&OUT.BG.ra_lab&&OUT.BG.ra_lab.image)?BG('ra_lab'):BG('linze_prof_hall');   /* AA_327：2D ra_lab（開發分支沒有→研究室的走廊）*/
    const inner=async()=>{ if(lover){ await S.play(GM,[B.friend[0]]); await S.play(GM,B.loverKevin); await S.play(GM,B.lover); const k=await GM.choose(B.loverOpts.map(o=>({t:o.t}))); await S.play(GM,(B.loverOpts[k]||B.loverOpts[0]).say); F.SIS_BDAY_Y4='lover'; }
      else { await S.play(GM,B.friend); const k=await GM.choose(B.friendOpts.map(o=>({t:o.t}))); await S.play(GM,(B.friendOpts[k]||B.friendOpts[0]).say); F.SIS_BDAY_Y4='there'; } };
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
  async function b1Scene(GM){ const G=GM.G, A=adv(); GM.sceneBegin(); try{ await GM.fade(true); toAtLeast(GM,T('2029-07-12',20)); if(GM.titleCard) await GM.titleCard(S.dateLabel(G.day,G.hour),'總圖 B1',2000);
      if(A) A.begin({background:BG('ntu_lib_b1')}); await GM.fade(false); await S.play(GM,L().B1.lines); } finally { if(A&&A.active) A.end(); GM.sceneEnd(); }
    await GM.fade(true); toAtLeast(GM,T('2029-07-12',22)); await GM.fade(false); }
  S.noteScene=async function(GM,y){ const G=GM.G, N=L().NOTE, sis=S.who(G,'heroine_05');
    if(y===2030&&S.retaker(G)) await GM.say(null,N.retake.note); else await S.play(GM,N.lines);
    if(S.dating(G,'heroine_05')) await GM.say(sis,N.lover); };   /* 戀人版當面給：最後多一句 */
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
    if(y===2029){ if(S.studyGroup(G)==='yutong'){ if(typeof PHONE!=='undefined') PHONE.at(G,S.DK(Y[y].r2),18,L().R2.study.yutong.map(t=>P_('heroine_03',t)),'pg_noodle_yt_'+y); } else S.planNoodle(G,y); } }   /* 2030 的麵店 AA 沒寫（阿哲那一句在群組）；只有語彤的讀書小組＝18:00 她傳照片 */
  S.studyGroup=G=>{ const g=G.flags&&G.flags.BAR_STUDY_GROUP; if(!Array.isArray(g)) return null; const k=g.includes('kexin'), y=g.includes('yutong')||g.includes('heroine_03'); return k&&y?'three':(k?'kexin':(y?'yutong':null)); };   /* AA_327 2-Y4-33（那一批還沒做＝沒有）*/
  S.noodleScene=async function(GM){ const A=adv(), R=L().R2, sg=S.studyGroup(GM.G); if(A) A.begin({background:BG('noodle_table')}); await S.play(GM,sg==='three'?R.study.three:(sg==='kexin'?R.study.kexin:R.noodle)); };   /* 12/14 18:00（AA_319 1A-18）：讀書小組三個人／只有可昕／麵店團 */
  async function anCall(GM,n){ const G=GM.G, A_=L().AN, me={name:nmD(G,'heroine_01')+'（電話）'}; if(GM.toast) GM.toast('手機響了。',2400);
    GM.sceneBegin(); try{ if(n===1){ await GM.say(me,A_.call1[0]); await GM.say(me,S.dating(G,'heroine_01')?A_.call1Dating:A_.call1[1]); }
      else { for(const t of A_.call2) await GM.say(me,t); const k=await GM.choose(A_.call2Opts.map(o=>({t:o.t}))); for(const t of (A_.call2Opts[k]||A_.call2Opts[0]).say) await GM.say(me,t); } } finally { GM.sceneEnd(); } }
  S.firstLate=G=>S.sits(G,2030)&&G.flags.BAR_YEAR==null;   /* 2030 年還在準備律師二試（AA_319 b6757852）*/
  async function firstDay(GM){ const G=GM.G, F=G.flags, Fi=L().FIRST, late=S.firstLate(G);
    toAtLeast(GM,T('2030-10-01',21));
    const items=[{th:'g:noodle_team',from:'player',text:'📷'+(late?Fi.late:Fi.me[S.path(G)])}];
    for(const [id,ph,t] of Fi.friends) if(S.at(G,id,'FAMILIAR')){ items.push(GR(id,'📷'+ph)); items.push(GR(id,t)); }   /* 認識的人才傳 */
    if(typeof PHONE!=='undefined'){ if(!PHONE.inGroup(G,'noodle_team')) PHONE.join(G,'noodle_team','麵店團'); if(!PHONE.sent(G,'pg_first_day')) items.forEach((it,i)=>PHONE.postAt(G,Object.assign({tag:'pg_first_day'},it),G.day,G.hour+i*0.01)); }
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
      case 'zhe': { if(S.atTable(G,'yu')) return E.zhe.withYu; let t=E.zhe.base; if(has('zhe','LENT_NOTES_Y2')) t=E.zhe.notes; if(has('zhe','STUDIED_WITH_ZHE')) t=E.zhe.studied; if(yes(F.ZHE4_FINAL)) t=E.zhe.final; return [[id,t]]; }   /* 和小語同一桌＝兩人那一組 */
      case 'yu': { if(S.atTable(G,'zhe')) return null; return [[id,yes(F.YU4_ALONE)?E.yu.alone:E.yu.base]]; }
      case 'classmate_bohan': { let t=E.bohan.base; if(yes(F.BH4_DONE)) t=E.bohan.bh4; if(S.gradAdmit(G)) t=E.bohan.bh5; return [[id,t]]; }   /* 翰 5 兩人同一組＝GRAD_ADMIT 有值（AA_327 2-Y4-06）*/
      case 'classmate_xinci': { if(yes(F.XC1_STICKY)) return [[id,E.xinci.sticky]]; if(yes(F.XC5_RECONCILE)&&S.atTable(G,'heroine_01')) return S.dating(G,'heroine_01')?[E.xinci.reconcile[0]]:E.xinci.reconcile; return [[id,E.xinci.base]]; }
      case 'heroine_01': { if(S.dating(G,'heroine_01')) return me(E.an.partner); if(yes(F.XC5_RECONCILE)&&S.atTable(G,'classmate_xinci')&&!yes(F.XC1_STICKY)) return null; return [[id,E.an.friend]]; }   /* 慈 5 那一組裡以安那句就是她的一句 */
      case 'heroine_03': { const Y3=S.ytEnd(G); if(!Y3.end) return null; if(Y3.end===5) return [[id,E.yt[Y3.job===4?4:Y3.job][0]],[id,E.yt[5]]]; return me(E.yt[Y3.end]); }
      case 'heroine_05': { const B=E.sis; if(S.dating(G,'heroine_05')) return me(yes(F.SIS_DAY_OFF)?B.dayOff:B.lover); if(yes(F.US4_FRIEND)||yes(F.HEART_FRIEND_heroine_05)) return me(B.peer); return me(S.lean(G).top==='A'&&lw?B.roadA:B.road); }
      case 'heroine_02': { if(S.dating(G,'heroine_02')) return E.zr.me; if(yes(F.ZR_FY)) return me(E.zr.fy); return me(E.zr.main); }
      case 'heroine_04': { const Z=E.zq; if(S.dating(G,'heroine_04')) return me(Z.me); if(S.zqLine(G)&&lw) return me(Z.line); if(F.ZQ_CONTRACT!=null&&!S.zqLine(G)) return me(Z.apart); return me(F.ZQ_Q12==='nine'?Z.nine:Z.cat); }
      case 'kai': { const K=E.kai; let t=K.base; if(lw) t=K.lawyer; if(has('kai','SUNDAY_SUPPER')) t=K.supper; if(yes(F.KAI_STAYED_UP)||has('kai','KAI_STAYED_UP')) t=K.stayed; return me(t); }
      case 'classmate_mingxuan': { const M=E.mx; let t=M.base; if(S.gradAdmit(G)) t=M.grad; if(F.BAR_YEAR===2029) t=M.bar2029; if(F.BAR_YEAR===2030) t=M.bar2030; if(has('classmate_mingxuan','SAW_HIM_STUDY')) t=M.saw; return me(t); }
      case 'classmate_peishan': { const P=E.ps; let t=P.base; if(lw&&F.PS_GRAD_CARD) t=P.card; if(yes(F.KEPT_FRIEND)) t=P.kept; if(has('classmate_peishan','MIRROR_PEISHAN')) t=P.mirror; if(S.dating(G,'classmate_peishan')) t=P.lover; return me(t); }
      case 'npc_fangyt': { const Fy=E.fy; let t=Fy.base; if(yes(F.CHIAYI_TREE)) t=Fy.tree; if((!S.delayed(G)&&F.BAR_YEAR===2030)||(S.delayed(G)&&F.BAR_YEAR===2031)) t=Fy.y2030; if(yes(F.MOUNTAIN_DAY)) t=Fy.day; if(yes(F.ZR_FY)) t=Fy.zr; return me(t); }   /* 多考的那一年：台灣路線 2030、交換路線 2031（AA_327 f252a7b5）*/
      case 'kexin': { if(!S.dating(G,'kexin')) return null; const R=typeof ROM!=='undefined'&&ROM.get?ROM.get(G,'kexin'):null, back=!!(R&&(R.history||[]).some(h=>h.ev==='end')); return me(E.kx.arrive.concat(back?E.kx.b:[])); }   /* A／B（B＝分開又回來）；她最晚到 */
    } return null; };
  S.EPI_ORDER=['zhe','yu','classmate_bohan','classmate_xinci','heroine_01','heroine_03','heroine_05','heroine_02','heroine_04','kai','classmate_mingxuan','classmate_peishan','npc_fangyt','kexin'];
  S.epiPresent=(G,id)=>id==='kai'||(id==='kexin'?S.dating(G,'kexin'):S.atTable(G,id));   /* 只有認識的人在場；阿凱是室友 */
  S.econLine=function(G){ const F=G.flags, E=L().EPI.econ; if(!(F.PLAYED_Y0||F.MET_XUN||has('econ_zhengxun','FIRST_MET'))) return null;
    if(F.ECON_PAST_SHARED==='full'||F.ECON_PAST_SHARED==='half'){ const nights=!!(G.events&&G.events.done&&Object.keys(G.events.done).some(k=>/^ev_sk05_vending/.test(k))); return {line:nights?E.full:E.noNights,far:false}; }   /* 那幾個晚上＝SK05 三閃，販賣機見 */
    return {line:E.none,far:true}; };
  S.EX_ORDER=['heroine_01','heroine_03','heroine_02','heroine_04','heroine_05','classmate_peishan','kexin'];
  S.exLines=function(G,id,econFar){ const E=L().EPI, X=E.ex, me=x=>x.map(t=>[id,t]);
    if(id==='heroine_01') return me(econFar?[X.heroine_01Alt,X.heroine_01[1]]:X.heroine_01);   /* 不再接 */
    if(id==='heroine_03'){ const Y3=S.ytEnd(G); return me(X.heroine_03.concat([E.yt[Y3.job===1||Y3.job===2?Y3.job:4][0]])); }
    if(id==='heroine_02') return me(X.heroine_02.concat(E.zr.main));
    if(id==='heroine_04') return me(X.heroine_04.concat(G.flags.ZQ_Q12==='nine'?E.zq.nine:E.zq.cat));
    if(id==='heroine_05') return me(X.heroine_05.concat(E.sis.road));
    if(id==='classmate_peishan') return me(X.classmate_peishan.concat(E.ps.base));
    if(id==='kexin') return me(X.kexin.concat(G.flags.GIRAFFE_KEYCHAIN?[X.kexinKey]:[]));
    return null; };
  S.CG_ID={kai:'kai',heroine_01:'heroine01',heroine_02:'heroine02',heroine_03:'heroine03',heroine_04:'heroine04',heroine_05:'heroine05',kexin:'kexin',classmate_peishan:'peishan'};
  S.epiPartner=G=>['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','kexin','classmate_peishan'].find(id=>S.dating(G,id))||null;   /* 祐廷右手邊：畢業時的伴侶；前任不在旁邊也不在對面 */
  S.epiCg=G=>'cg_reunion_window_table_'+S.CG_ID[S.epiPartner(G)||'kai'];
  S.epiAlways=function(G){ const id=['zhe','yu','classmate_bohan'].find(x=>S.atTable(G,x)&&S.at(G,x,'FRIEND')); return id?{id,t:L().EPI.always[S.lean(G).top]||L().EPI.always.B}:null; };
  S.footprint=function(G){ const F=G.flags||{}, H=G.habits||{};
    const days=re=>{ const set=new Set(); let mx=0; for(const k in H){ if(!re.test(k)) continue; const h=H[k]||{}; for(const d of (h.days||[])) set.add(d); mx=Math.max(mx,h.n|0); } return Math.max(set.size,mx); };
    let grp=0; const att=(G.acts&&G.acts.att)||{}; for(const k in att) if(/^(public_law_group|lawclub_study)@/.test(k)&&att[k]&&(att[k].end||'full')==='full') grp++;
    const c={cafe:Math.max(+F.CAFE_VISITS||0,days(/^place:cafe:/)),fafu:+F.LAWCLUB_SAT_VISITS||0,noodle:days(/^place:noodle:/),library:days(/^place:(library|library_hall|lawlib):/),yexiao:days(/^place:gongguan:night$/),guitar:0,group:grp,abroad:S.delayed(G)?60:0};   /* G.footprint 還沒有：照現有的計次回推（AA_319 1A-20 第 6 節第 3 點）；交換固定 60 天 */
    let best=null; for(const [k] of L().EPI.foot) if(best==null||c[k]>c[best]) best=k; return best; };   /* 平手照表的順序（「比大四一年」沒有逐年的紀錄，不做）*/
  S.epiItems=function(G){ const E=L().EPI, foot=S.footprint(G), item=(E.foot.find(x=>x[0]===foot)||E.foot[0])[1], p=S.epiPartner(G), F=G.flags;
    F.EPI_ITEMS=[item].concat(p&&E.items[p]?[E.items[p]]:[]);   /* 伴侶的東西（桌上的另一邊）：旁白 AA 還沒寫（BB_202 第 5 節），先記下來 */
    return [E.itemNarr.replace('{item}',item)]; };
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
      const al=S.epiAlways(G); if(al) await GM.say(S.who(G,al.id),al.t);   /* ④ */
      await GM.say(S.who(G,'me'),E.last[S.path(G)]);   /* ⑤ */
      for(const t of S.epiItems(G)) await GM.say(null,t);   /* ⑥ */
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
    {id:'grad',at:G=>T(GRAD,6),until:G=>T('2029-06-04',0),cond:G=>true,ready:G=>S.gradReady(G),run:gradScene},
    {id:'cafe',at:G=>T(GRAD,17.25),until:G=>T(GRAD,21),cond:G=>{ const q=typeof OUT!=='undefined'?OUT.get(G,'pg_grad_cafe'):null; return !!q&&q.state==='done'&&G.zone==='cafe'; },run:cafeScene},
    {id:'ps_video',at:G=>T(GRAD,18),until:G=>T(GRAD,27),cond:G=>graduated(G)&&S.dating(G,'classmate_peishan'),run:psVideo},
    {id:'bday_walk',at:G=>T(GRAD,17.5),until:G=>T(GRAD,28),cond:G=>S.teDone(G)==='heroine_05',run:GM=>S.bdayScene(GM,'walk')},   /* 和學姊吃畢業傍晚那頓飯：不用選，直接走回研究室 */
    {id:'kx_miss',at:G=>T('2029-06-09',18.5),until:G=>T('2029-06-10',12),cond:G=>G.flags.KX_GRAD==='mine',run:kxMissScene},
    {id:'b1',at:G=>T('2029-07-12',20),until:G=>T('2029-07-12',27),cond:G=>S.sits(G,2029),run:b1Scene},   /* b6757852：20:00（和國考讀書會同一個時間）*/
    {id:'late_2029',at:G=>T('2029-08-04',17.5+5/60),until:G=>T('2029-08-05',12),cond:G=>S.delayed(G),run:lateNarr},
    {id:'an1',at:G=>T('2029-12-14',21),until:G=>T('2029-12-14',27),cond:G=>S.at(G,'heroine_01','FRIEND'),run:GM=>anCall(GM,1)},   /* 以安的二試放榜（AA_319 c9b4f60e）*/
    {id:'an2',at:G=>T('2030-01-25',21),until:G=>T('2030-01-25',27),cond:G=>S.at(G,'heroine_01','FRIEND'),run:GM=>anCall(GM,2)},
    {id:'first',at:G=>T('2030-10-01',21),until:G=>Infinity,cond:G=>true,run:firstDay},
    {id:'epi',at:G=>T('2034-06-03',19),until:G=>Infinity,cond:G=>!!G.flags.FIRST_DAY_SEEN&&!G.flags.EPILOGUE_DONE&&!S.pendingExam(G),run:epilogue} ].concat(yStep(2029),yStep(2030));
  S.byId=id=>S.STEPS.find(s=>s.id===id)||null;
  S.pendingExam=G=>S.sits(G,2030)&&G.flags.BAR_YEAR==null&&!S.done(G,'r2_2030');   /* 2030 年那一輪還沒演完：尾聲等它 */
  S.y4Due=G=>{ if(typeof STORY==='undefined') return false; for(const k of ['packDue','gradMorningDue','gradLunchDue','moveOutDue']){ try{ if(STORY[k]&&STORY[k](G)) return true; }catch(e){} } return false; };   /* AA_318 那一批的場景（story3d.js S.y4Tick 演）：時間到了先讓它演，不跳 */
  const running=new Set();
  S.pending=function(G){ const now=NOW(G), r=S.rec(G), out=[]; if(!law(G)||G.flags.EPILOGUE_DONE) return out;   /* 尾聲演完：讀那個存檔＝2034 年自由活動，不再有場景 */
    for(const s of S.STEPS){ if(r.done[s.id]||running.has(s.id)) continue; const t=s.at(G); if(t==null) continue; let ok=false; try{ ok=!!s.cond(G); }catch(e){ ok=false; } if(!ok) continue;
      if(now>(s.until?s.until(G):t+6)){ r.done[s.id]='missed'; continue; } out.push({s,t}); }
    return out.sort((a,b)=>a.t-b.t); };
  S.due=function(G){ const now=NOW(G); for(const {s,t} of S.pending(G)){ if(t>now+1e-6) break; if(s.ready&&!s.ready(G)) continue; return s; } return null; };
  S.runStep=async function(GM,s){ const G=GM.G, r=S.rec(G); if(r.done[s.id]||running.has(s.id)) return false; running.add(s.id);
    try{ await s.run(GM); } catch(e){ console.warn('PG '+s.id,e); } finally { running.delete(s.id); r.done[s.id]=1; }
    if(GM.autosave) GM.autosave(); return true; };
  /* ---------- 跳到下一件事 ---------- */
  S.SOFT=[['2029-06-02',22],['2029-06-28',10]];   /* 別一批的固定時間（1A-12 晚上大伯的信封、1A-15 宿舍期滿）：停一下，讓那邊的程式有機會演 */
  S.stops=[];   /* 其他模組可以加：G=>絕對時間（小時）或 null */
  S.nextStop=function(G){ const now=NOW(G); let best=Infinity; const cand=t=>{ if(t!=null&&t>now+1e-6&&t<best) best=t; };
    for(const {t} of S.pending(G)) cand(t);
    if(typeof PHONE!=='undefined'){ for(const m of S.MSGS){ if(PHONE.sent(G,m.tag)) continue; const t=T(m.at[0],m.at[1]); if(t<=now+1e-6||t>=best) continue; let ok=false; try{ ok=!!m.cond(G); }catch(e){} if(ok) cand(t); }
      for(const q of PHONE.rec(G).q) cand(q.day*24+q.h); }
    if(typeof OUT!=='undefined') for(const q of OUT.rec(G)){ if(q.state!=='planned') continue; const tr=OUT.trip(G,q); let t=q.day*24+q.h-(tr.travelH||0)-0.25; if(q.ask!=null) t=Math.max(t,q.ask); cand(t); }
    for(const [k,h] of S.SOFT) cand(T(k,h));
    for(const f of S.stops){ try{ cand(f(G)); }catch(e){} }
    return best===Infinity?null:best; };
  S.newestTh=G=>{ if(typeof PHONE==='undefined') return null; const P=PHONE.pending?PHONE.pending(G):[]; const m=P.length?P[P.length-1]:((G.msgs||[]).filter(x=>x.from!=='player').slice(-1)[0]); return m&&PHONE.th?PHONE.th(m):null; };
  S.jumpTo=function(GM,target){ const G=GM.G, E=GM.E; let t=NOW(G), got=0; const step=target-t>24*60?6:0.25;   /* 60 天以上：每 6 小時看一次 */
    const look=hourly=>{ try{ S.rules(GM); if(hourly&&typeof STORY!=='undefined'&&STORY.phoneRules) STORY.phoneRules(GM); if(typeof PHONE!=='undefined') PHONE.tick(G,o=>{ got+=(o&&o.length)|0; }); }catch(e){ console.warn('PG jump',e); } };
    while(t+step<=target+1e-6){ t=Math.round((t+step)*4)/4; const d=Math.floor(t/24); setT(G,E,d,t-d*24); look(Math.abs(t-Math.round(t))<1e-6);
      if(got>0) return 'msg'; if(typeof OUT!=='undefined'&&OUT.due&&OUT.due(G)) return 'out'; if(S.due(G)) return 'step'; }
    if(t<target-1e-6){ const d=Math.floor(target/24); setT(G,E,d,target-d*24); look(true); }
    return got>0?'msg':'ok'; };
  S.busy=false;
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
      if(GM.titleCard&&(G.day!==d0||(o&&o.sleep))) await GM.titleCard(S.dateLabel(G.day,G.hour),'',1800);
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
      beforeOuting:async(G,GM,q)=>{ await S.noodleScene(GM); }} ];
  S.register=function(){ if(typeof STORY_EVENTS==='undefined') return false; for(const e of S.EVS) if(!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e); return true; };
  S.patchTermend(); S.register();
  return S;
})();
