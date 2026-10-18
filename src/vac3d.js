/* ===== 假期活動（VAC；AA_199 第 3 節、7-2、7-4、7-5；HOLIDAY-SYS 的一部分）=====
   第一批：大一暑假的 C02 法律生活營隊輔、C03 日語課、C05 日本五天（阿凱那一團）；台詞在 data/vac_activities.js（AA_241 照抄）。
   第二批：出國的 C08 首爾交流、C09 柬埔寨志工（大一暑假）、C10 加州暑期課、C11 東京冬季課、C12 京都語言課（大二）（AA_242 18fe1b6a 照抄）：報名（系上群組公告／行事曆）→ 學期裡的前置事件（說明會、面試、系辦）→ 錄取通知＋家人群組 → 出發那天麵店團群組 → 整段一趟 → 回來阿哲「伴手禮咧」→ 新認識的人的訊息。
   - 報名：手機邀約（群組、私訊；ask 的選項記 VAC_PICK）或手機「活動」頁的「假期行事曆」（還在報名期限內的，有「報名」按鈕）。家裡出錢的，家人群組媽媽一句。
   - 參加：每個關鍵事件是一趟出遊（OUT，事件 ev_vac_key）；連續好幾天人不在的（trip：營隊、日本）整段是一趟——出發 → 中間的關鍵事件（字卡寫日期和地點，時間往後跳、手機照時間收）→ 回到宿舍（或住家裡的回家）。
   - 衝突：同一天同一個時段、或人不在臺北的那幾天（AA_199 3-2）；報名的時候寫出會撞到哪幾天，不擋（人不能同時在兩個地方：撞到的那件到時候就是沒去）。
   - 沒參加：照卡片的 miss 傳一則；沒報名的不另外處理（不扣分）。
   - 每年都開（AA_199 7-5）：這一版先開大一暑假（第一次遇到）；之後的年份等「第二次以後寫進日誌」的台詞（AA_242 補）。
   存檔 G.vac＝{reg:{'C02@Y1':'yes'|'no'|'later'|'done'|'missed'}, seen:{C02:true}, log:[{day,t}]}。測試：node tests/vac_unit.js */
const VAC=(function(){
  const S={}; S.ON=true;
  const Dt=()=>typeof VAC_DATA!=='undefined'?VAC_DATA:null;
  const T=(d,h)=>d*24+h;
  const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const nm=id=>typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(id):id;
  const atLeast=(id,st)=>{ if(typeof SOCIAL==='undefined'||!SOCIAL.STAGES||!SOCIAL.has||!SOCIAL.has(id,'FIRST_MET')) return false; const A=SOCIAL.STAGES; return A.indexOf(SOCIAL.stage(id))>=A.indexOf(st); };
  S.rec=function(G){ let V=G.vac; if(!V||typeof V!=='object') V=G.vac={}; if(!V.reg||typeof V.reg!=='object') V.reg={}; if(!V.seen||typeof V.seen!=='object') V.seen={}; if(!Array.isArray(V.log)) V.log=[]; return V; };
  /* 年份：大一暑假＝2026（Y1），大二暑假＝2027（Y2）；寒假 Yn＝(2024+n)/12～(2025+n)/2 */
  S.YEARS=['Y1','Y2','Y3','Y4'];
  S.yearsOf=A=>A.years||(A.year?[A.year]:['Y1']);   /* 每張卡第一次開放的那一年（AA_199 7-5 每年都開：第二次以後的台詞等 AA 補，這一版只開第一次）*/
  S.dayOf=function(yk,season,mmdd){ const n=+String(yk).slice(1), m=+mmdd.slice(0,2), y=season==='summer'?2025+n:(m>=7?2024+n:2025+n); return DK(y+'-'+mmdd); };
  S.inst=function(id,yk){ const A0=Dt()&&Dt().A[id]; if(!A0) return null; const A=A0.byYear&&A0.byYear[yk]?Object.assign({},A0,A0.byYear[yk]):A0;   /* byYear：那一年的日子不一樣（C04 每個假期的考試日不同，AA_199 7-2）*/ if(!S.yearsOf(A).includes(yk)) return null; const from=S.dayOf(yk,A.season,A.days[0]), to=S.dayOf(yk,A.season,A.days[1]); if(from==null||to==null) return null;
    return {id,yk,key:id+'@'+yk,A,from,to,first:S.yearsOf(A)[0]===yk}; };
  /* 第幾次參加（AA_264：照實際參加的次數，不看年級）：報名的時候記下來 */
  const ser=id=>{ const A=Dt()&&Dt().A[id]; return (A&&A.series)||id; };   /* series：寒暑假分兩張卡、算同一系列的第幾次（C04 和 C04W：補習每個假期都算）*/
  S.nth=function(G,I){ const V=S.rec(G); if(V.nth&&V.nth[I.key]) return V.nth[I.key]; let n=1; for(const k in V.reg) if(k!==I.key&&ser(k.split('@')[0])===ser(I.id)&&V.reg[k]==='done') n++; return n; };
  /* 人在國外的期間不能報（AA_264 第 0 節：日本路線 2/20～8/5、美國路線 8/2～12/23）*/
  S.blocked=function(G,I){ if(typeof STORY==='undefined'||!STORY.movedOut) return false; for(let d=I.from;d<=I.to;d++){ const g=Object.assign({},G,{day:d}); if(STORY.movedOut(g)||STORY.abroad(g)) return true; } return false; };
  /* 第二次以後的關鍵事件（AA_264 第 1、2 節）：日誌一行；C02 第二次第一天＝小隊長三句；大二以後才第一次參加的 C02＝換人版。null＝那一場不演 */
  S.repKey=function(G,I,i,k){ const R=I.A.rep; if(!R) return k; const n=S.nth(G,I), D=x=>x==null?null:{bg:k&&k.bg||null,lines:[{narr:x}]};
    if(n>=2){ if(n===2&&R.leader&&i===0) return Object.assign({bg:k&&k.bg},R.leader); const L=(n>=3&&R.keys3)?R.keys3:R.keys2; return L?D(L[i]):k; }
    if(!I.first&&R.late){ const T=R.late; if(i===0) return D(T.day1); if(i===2) return {bg:k.bg,lines:T.last}; if(i===1&&k.choice) return Object.assign({},k,{choice:k.choice.map((c,j)=>j===1?Object.assign({},c,{say:T.eveOpt2}):c)}); }
    return k; };
  S.repLine=function(G,I,kind,i){ const R=I.A.rep; if(!R) return undefined; const n=S.nth(G,I);
    if(kind==='prep'){ if(n>=2) return n>=3&&R.prep3?R.prep3:R.prep2; if(!I.first&&R.late) return R.late.prep; return undefined; }
    if(kind==='pre'&&n>=2){ const L=(n>=3&&R.pre3)?R.pre3:R.pre2; return L?L[i]:undefined; }
    if(kind==='post'&&n>=2) return R.post2; return undefined; };
  /* 公館的補習班門口：平日 18:00～18:30，Kevin 招呼一次（AA_241 9-2 台詞；一個假期一次；ev_kevin_cram_door）。大一寒假每個玩家都有（BB-C 17:17）；大二寒假起只給沒報 C04 的 */
  S.kevinDoor=function(G){ if(typeof HOME==='undefined'||!HOME.breakOf) return null; const B=HOME.breakOf(G.day); if(!B||!/^Y[123]W$/.test(B.key)) return null; const yk=B.key.slice(0,2);
    if(yk==='Y1'){ const j0=DK('2026-01-24'), j1=DK('2026-01-31'); if(j0!=null&&G.day>=j0&&G.day<=j1) return null; }   /* 大一寒假：他已經在補習班當助教、每個玩家都有一次（BB-C 17:17，BB_198 d142d98d）；1/24～1/31 他在日本 */
    else if(S.enrolled(G,'C04W',yk)) return null;   /* 大二寒假起：報了寒假班的不在門口招呼（他是那一班的助教）*/ const K=G.flags.KEVIN_DOOR; if(K&&K[B.key]!=null) return null; return B.key; };
  S.all=function(){ const out=[]; const D=Dt(); if(!D) return out; for(const yk of S.YEARS) for(const id of Object.keys(D.A)){ const I=S.inst(id,yk); if(I) out.push(I); } return out; };
  S.state=(G,key)=>S.rec(G).reg[key]||null;
  S.enrolled=function(G,id,yk){ const R=S.rec(G).reg; for(const k in R) if((k===id+'@'+(yk||'')||(!yk&&k.split('@')[0]===id))&&(R[k]==='yes'||R[k]==='done')) return true; return false; };
  /* 報名的期限：signup.until（'MM-DD' 或 {term,week,wd}）*/
  const termDay=(term,week,wd)=>typeof STORY!=='undefined'&&STORY.termDay?STORY.termDay(term,week,wd):null;
  S.signupOpen=function(G,I){ const s=I.A.signup; if(!s) return null; let d0,d1;
    if(s.kind==='group'||s.kind==='board'){ const term=I.yk+s.term; d0=termDay(term,s.week,s.wd); d1=s.until?termDay(term,s.until.week,s.until.wd===0?7:s.until.wd):I.from-1; }
    else { d0=S.dayOf(I.yk,I.A.season,s.day); d1=S.dayOf(I.yk,I.A.season,s.until); }
    return d0==null||d1==null?null:{from:d0,to:d1,h:s.h||21}; };
  /* 會撞到什麼（AA_199 3-2：時段和地點；人不在臺北的那幾天，臺北要到場的都撞）*/
  /* 那一天人在國外（報了、或去過的出國活動的期間）*/
  S.abroadOn=function(G,d){ const R=S.rec(G).reg; return S.all().some(I=>I.A.place.kind==='abroad'&&['yes','done'].includes(R[I.key])&&d>=I.from&&d<=I.to); };
  S.daysOf=function(I){ const out=[]; for(let d=I.from;d<=I.to;d++){ if(I.A.wd){ const w=typeof CALENDAR!=='undefined'?CALENDAR.dateOf(d).wd%7:0; if(!I.A.wd.includes(w)) continue; } out.push(d); } return out; };
  S.conflicts=function(G,I){ const mine=new Set(S.daysOf(I)), away=I.A.trip||I.A.place.kind!=='taipei', out=[];
    for(const J of S.all()){ if(J.key===I.key||!['yes','done'].includes(S.state(G,J.key))) continue; const awayJ=J.A.trip||J.A.place.kind!=='taipei';
      for(const d of S.daysOf(J)) if(mine.has(d)&&(away||awayJ||J.A.slot===I.A.slot)){ out.push({key:J.key,title:J.A.title,day:d}); } }
    return out; };
  const dl=d=>{ if(typeof CALENDAR==='undefined') return String(d); const x=CALENDAR.dateOf(d); return x.m+'/'+x.d; };
  /* 報名：記下來、家裡出錢的家人群組一句、排關鍵事件（出遊）*/
  S.signup=function(G,key,how){ const V=S.rec(G), [id,yk]=key.split('@'), I=S.inst(id,yk); if(!I) return false; V.reg[key]=how||'yes'; if(V.reg[key]!=='yes') return true; (V.when||(V.when={}))[key]=G.day; (V.nth||(V.nth={}))[key]=S.nth(G,I);
    const s=I.A.signup||{}; if(s.flag) G.flags[s.flag]=true;
    if(s.famMsgs&&typeof PHONE!=='undefined'){ PHONE.join(G,'home','家人'); const M=s.famMsgs.map(t=>({th:'g:home',from:'mom',name:'媽媽',text:t})); if(s.famReply) M[M.length-1].ask={id:'vac_famr_'+key,opts:[{t:s.famReply.t,say:s.famReply.say.map(t=>({th:'g:home',from:'mom',name:'媽媽',text:t}))}]}; PHONE.at(G,G.day,Math.max(21,G.hour),M,'vac_fam_'+key); }   /* 當晚 21:00 家人群組（C04：AA_241 第 10 節；回不回都可以）*/
    else if(s.yes&&s.yes.family&&typeof PHONE!=='undefined'){ PHONE.join(G,'home','家人'); PHONE.at(G,G.day,G.hour,[{th:'g:home',from:'mom',name:'媽媽',text:s.yes.family}],'vac_fam_'+key); }   /* AA_199 3-7：家裡出的，家人群組一句 */
    S.plan(G,I); return true; };
  /* 學期裡的前置事件（說明會、面試、系辦、行前訓練）：{term:'S2',week,wd} 或 {day:'MM-DD'}；報名以後排出遊 */
  S.preDay=function(I,p,G){ if(p.afterSignup!=null){ const w=G&&G.vac&&G.vac.when&&G.vac.when[I.key]; return w!=null?w+p.afterSignup:null; } return p.day?S.dayOf(I.yk,I.A.season,p.day):termDay((p.yk?p.yk(I.yk):I.yk)+p.term,p.week,p.wd); };
  /* 日期字串「6/13（六）10:00」（錄取通知的行前說明會）*/
  S.when=function(I,p){ const d=S.preDay(I,p); if(d==null||typeof CALENDAR==='undefined') return ''; const x=CALENDAR.dateOf(d), hh=Math.floor(p.h), mm=Math.round((p.h-hh)*60); return x.m+'/'+x.d+'（'+'日一二三四五六'[x.wd%7]+'）'+hh+':'+String(mm).padStart(2,'0'); };
  S.plan=function(G,I){ if(typeof OUT==='undefined') return; const A=I.A;
    (A.pre||[]).forEach((p,i)=>{ if(S.repLine(G,I,'pre',i)===null){ if(p.set) Object.assign(G.flags,p.set); return; }   /* 第二次以後不演的前置（家睿直接邀、不用面試）*/ const d=S.preDay(I,p,G); if(d!=null&&(d>G.day||(d===G.day&&G.hour<p.h))) OUT.plan(G,{id:'vac_'+I.key+'_pre'+i,ev:'ev_vac_key',day:d,h:p.h,late:0.25,place:p.place,title:A.title+'：'+p.title,travel:'走過去約 10 分鐘',travelH:1/6,vac:{key:I.key,k:'pre'+i}}); });
    if(A.prep){ const pd=termDay(I.yk+A.prep.term,A.prep.week,A.prep.wd); if(pd!=null&&(pd>G.day||(pd===G.day&&G.hour<A.prep.h))) OUT.plan(G,{id:'vac_'+I.key+'_prep',ev:'ev_vac_key',day:pd,h:A.prep.h,late:0.25,place:A.prep.place,title:A.title+'：籌備會',travel:'走過去約 10 分鐘',travelH:1/6,vac:{key:I.key,k:'prep'}}); }
    if(A.trip){ const sd=S.dayOf(I.yk,A.season,A.trip.start.day); OUT.plan(G,{id:'vac_'+I.key,ev:'ev_vac_key',day:sd,h:A.trip.start.h,late:0.5,place:A.trip.placeName,title:A.title+'（出發）',travel:A.place.kind==='abroad'?'去機場 約 1 小時':'走過去約 10 分鐘',travelH:A.place.kind==='abroad'?1:1/6,back:A.place.kind==='abroad'?'回到臺北。':'營隊結束。',vac:{key:I.key,k:'trip'}}); return; }
    (A.keys||[]).forEach((k,i)=>{ const d=S.dayOf(I.yk,A.season,k.day); OUT.plan(G,{id:'vac_'+I.key+'_'+i,ev:'ev_vac_key',day:d,h:k.h,late:0.25,place:k.place||A.place.name,title:A.title+'：'+k.title,travel:k.travel||'走過去約 15 分鐘',travelH:k.travelH||0.25,vac:{key:I.key,k:i}}); }); };   /* k.place：那一場在別的地方（C04 的正式考試在別的學校）*/
  /* 取消這一項排好的出遊（沒錄取）*/
  S.drop=function(G,I){ if(typeof OUT==='undefined'||!OUT.rec) return; for(const q of OUT.rec(G)) if(q.vac&&q.vac.key===I.key&&q.state==='planned') q.state='cancelled'; };
  /* ---- 手機（story3d.js 的 S.phoneRules 每次呼叫）：邀約、選了以後、沒去、大一暑假的訊息 ---- */
  S.phone=function(GM){ const G=GM.G; if(!S.ON||typeof PHONE==='undefined'||!Dt()||(G.stage||'law')!=='law') return; const V=S.rec(G), F=G.flags, now=T(G.day,G.hour);
    if(typeof F.VAC_PICK==='string'){ const [key,how]=F.VAC_PICK.split(':'); delete F.VAC_PICK; S.signup(G,key,how); }
    S.c01Phone(G); S.va09Phone(G); S.va10Phone(G);
    for(const I of S.all()){ const s=I.A.signup, o=S.signupOpen(G,I); if(!s||!o) continue; const tag='vac_ask_'+I.key;
      if(now>=T(o.from,o.h)&&G.day<=o.to&&!PHONE.sent(G,tag)&&!V.reg[I.key]&&!(s.unless&&s.unless(G))&&!S.blocked(G,I)){
        if(!I.first){ if(s.kind==='group'&&PHONE.inGroup(G,s.th.slice(2))){ const M=[Object.assign({th:s.th},s.msgs[0])]; if(I.A.rep&&I.A.rep.recruit2) M.push(Object.assign({th:s.th},I.A.rep.recruit2)); PHONE.at(G,o.from,o.h,M,tag); } }   /* 第二年起：同一則公告（換年份、日期），C02、C08 多一句；行事曆報名（AA_264 第 3 節）*/
        else if(s.kind==='group'){ if(!PHONE.inGroup(G,s.th.slice(2))) continue; const M=s.msgs.map(m=>Object.assign({th:s.th},m)); Object.assign(M[M.length-1],{ask:{id:tag,until:T(o.to,24),opts:[{t:s.yes.t,set:{VAC_PICK:I.key+':yes'},say:(s.yes.say||[]).map(x=>Object.assign({th:s.th},x))}]}}); PHONE.at(G,o.from,o.h,M,tag); }
        else if(s.kind==='dm'&&(!s.min||atLeast(s.who,s.min))&&(typeof STORY==='undefined'||!STORY.knows||STORY.knows(s.who,G)||(typeof SOCIAL!=='undefined'&&SOCIAL.has&&SOCIAL.has(s.who,'FIRST_MET')))){ const th='p:'+s.who, M=s.msgs.map(t=>({th,from:s.who,text:t}));
          const opts=[{t:s.yes.t,set:{VAC_PICK:I.key+':yes'},say:(s.yes.say||[]).map(x=>Object.assign({th},x))}]; if(s.later) opts.push({t:s.later.t,set:{VAC_PICK:I.key+':later'},say:s.later.say.map(x=>Object.assign({th},x))}); if(s.no) opts.push({t:s.no.t,set:{VAC_PICK:I.key+':no'},say:s.no.say.map(x=>Object.assign({th},x))});
          Object.assign(M[M.length-1],{ask:{id:tag,until:T(o.to,24),opts}}); PHONE.at(G,o.from,o.h,M,tag); } }
      /* 沒參加（沒報名、或報了沒去）：卡片的 miss */
      const al=I.A.alt; if(al&&(!al.if||al.if(G))){ const ad=S.dayOf(I.yk,I.A.season,al.day), tg3='vac_alt_'+I.key; if(ad!=null&&now>=T(ad,al.h)&&G.day<=ad+2&&!PHONE.sent(G,tg3)&&(!al.min||atLeast(al.who,al.min))) PHONE.at(G,ad,al.h,al.msgs.map(t=>({th:'p:'+al.who,from:al.who,text:t})),tg3); }   /* 人不在、收不到邀約的版本（子晴曼谷：日本路線）*/
      if(!I.first&&I.A.rep&&I.A.rep.late&&I.A.rep.late.miss){ const md=S.dayOf(I.yk,I.A.season,I.A.days[1]), st=V.reg[I.key], tg2='vac_miss_'+I.key, M=I.A.rep.late.miss; if(md!=null&&now>=T(md,21)&&G.day<=md+3&&st!=='done'&&st!=='yes'&&!PHONE.sent(G,tg2)&&PHONE.inGroup(G,M.th.slice(2))) PHONE.at(G,md,21,[Object.assign({},M)],tg2); }   /* 大二起沒去：系學會在全班群組貼大合照（AA_264 1-2）*/
      const ms=I.first&&I.A.miss; if(ms&&!(ms.unless&&ms.unless(G))){ const md=S.dayOf(I.yk,I.A.season,ms.day), st=V.reg[I.key]; if(md!=null&&now>=T(md,ms.h)&&G.day<=md+3&&st!=='done'&&st!=='yes'||(md!=null&&st==='missed'&&now>=T(md,ms.h)&&G.day<=md+3)){ const tag2='vac_miss_'+I.key; if(!PHONE.sent(G,tag2)&&(!ms.min||atLeast(ms.who,ms.min))) PHONE.at(G,md,ms.h,ms.msgs.map(t=>({th:'p:'+ms.who,from:ms.who,text:t})),tag2); } }
      /* 只在行事曆報名的（board）：開放的那一刻提醒一次（系統字）*/
      if(s.kind==='board'&&now>=T(o.from,o.h)&&G.day<=o.to&&!V.reg[I.key]&&!(V.open||(V.open={}))[I.key]){ V.open[I.key]=G.day; if(GM.toast) GM.toast('手機｜假期行事曆：「'+I.A.title+'」開放報名到 '+dl(o.to),4200); }
      /* 錄取（AA_242 0-1）：有甄選的照公布日；直接報名的報名隔天 12:00。系統通知＋家人群組媽媽兩句 */
      const sel=I.A.select; if(sel&&V.reg[I.key]==='yes'){ const sd=sel.term?termDay(I.yk+sel.term,sel.week,sel.wd):((V.when||{})[I.key]!=null?V.when[I.key]+1:null), sh=sel.h||12, tg='vac_sel_'+I.key;
        if(sd!=null&&now>=T(sd,sh)&&!PHONE.sent(G,tg)&&sel.need&&!F[sel.need]&&!(I.A.rep&&I.A.rep.noSelect&&S.nth(G,I)>=2)){   /* 沒錄取（BB-C 13:03）：沒寫申請資料、面試沒到 */
          const M=[{th:'sys',text:'【通知】很遺憾，本次未能錄取。'}]; if(PHONE.inGroup(G,'noodle_team')) M.push({th:'g:noodle_team',from:'zhe',text:'沒差啦 暑假還很長'});
          PHONE.at(G,sd,sh,M,tg); V.reg[I.key]='rejected'; S.drop(G,I); if(GM.toast) GM.toast('（沒上。）',3000); continue; }
        if(sd!=null&&now>=T(sd,sh)&&!PHONE.sent(G,tg)){ PHONE.join(G,'home','家人'); PHONE.at(G,sd,sh,[{th:'sys',text:'【通知】恭喜錄取'+sel.name+'。'+(sel.briefAt?'行前說明會：'+S.when(I,sel.briefAt)+'。':'')},{th:'g:home',from:'mom',name:'媽媽',text:'機票多少？我轉給你'},{th:'g:home',from:'mom',name:'媽媽',text:'護照記得看效期'}],tg); } }
      /* 出發那天的麵店團群組（AA_242 0-2）*/
      const dp=I.A.depart; if(dp&&I.A.trip&&['yes','done'].includes(V.reg[I.key])&&PHONE.inGroup(G,'noodle_team')){ const sd=S.dayOf(I.yk,I.A.season,I.A.trip.start.day), sh=I.A.trip.start.h; if(sd!=null&&now>=T(sd,sh)&&G.day<=sd+1&&!PHONE.sent(G,'vac_dep_'+I.key)) PHONE.at(G,sd,sh,[{th:'g:noodle_team',from:'zhe',text:dp.zhe},{th:'g:noodle_team',from:'yu',text:dp.yu}],'vac_dep_'+I.key); }
      /* 回來以後（AA_242 0-3：出國回來的第一次「伴手禮咧」、第二次「這次伴手禮咧」、第三次以後貼圖）*/
      const bk=I.A.back; if(bk&&V.reg[I.key]==='done'&&PHONE.inGroup(G,'noodle_team')){ const bd=S.dayOf(I.yk,I.A.season,bk.day||I.A.days[1]); if(bd!=null&&now>=T(bd,20)&&G.day<=bd+3&&!PHONE.sent(G,'vac_back_'+I.key)){ const n=S.all().filter(J=>J.A.back&&PHONE.sent(G,'vac_back_'+J.key)).length+((V.t13||[]).filter(r=>PHONE.sent(G,'vac_back_T13#'+r.n)).length); PHONE.at(G,bd,20,[{th:'g:noodle_team',from:'zhe',text:n===0?'伴手禮咧':(n===1?'這次伴手禮咧':'（貼圖：伸出手）')}],'vac_back_'+I.key); } }
      /* 回來重逢（AA_242 8-6、BB_200 第 4 節）：交往中、她在臺北＝回國當天 21:00 她約、隔天排出遊；她不在臺北（芷若大一暑假在台中）＝先傳一句，回臺北前一天晚上再約 */
      const M2=Dt().TRIP_MSG; if(I.A.place.kind==='abroad'&&V.reg[I.key]==='done'&&M2&&M2.reunion){ const rd=I.to;
        for(const id in M2.reunion){ if(!F['dating_'+id]) continue; const R=M2.reunion[id], tg='vac_re_'+I.key+'_'+id; if(PHONE.sent(G,tg)||G.day>rd+45) continue;
          const aw=R.away&&DK(R.away.until), inv=aw!=null&&rd<=aw?aw:rd;   /* 約的那一天（回國當天，或她回臺北的前一天）*/
          if(aw!=null&&rd<=aw&&now>=T(rd,21)&&!PHONE.sent(G,tg+'_away')) PHONE.at(G,rd,21,[{th:'p:'+id,from:id,text:R.away.text}],tg+'_away');
          if(typeof STORY!=='undefined'&&STORY.presence){ const pr=STORY.presence(id,Object.assign({},G,{day:inv+1})); if(!pr.here&&pr.kind!=='home') continue;   /* 她那時不在臺灣：不約 */
            const RH=M2.reunionHome&&M2.reunionHome[id]; if(!pr.here&&pr.kind==='home'&&RH){ if(now>=T(rd,21)) PHONE.at(G,rd,21,RH.map(t=>({th:'p:'+id,from:id,text:t})),tg); continue; } }   /* 寒暑假她在老家：只傳私訊，不排臺北見面（AA_278 第 2 節第 1 點）*/
          if(now>=T(inv,21)){ PHONE.at(G,inv,21,R.invite.map(t=>({th:'p:'+id,from:id,text:t})),tg); if(typeof OUT!=='undefined') OUT.plan(G,{id:'vac_'+I.key+'_re_'+id,ev:'ev_vac_key',day:inv+1,h:R.h,late:0.5,place:R.place,title:'重逢：'+nm(id)+'（'+R.place+'）',travel:'走過去約 15 分鐘',travelH:0.25,vac:{key:I.key,k:'re',who:id}}); } } }
      /* 子晴一天一到兩則（BB-C 13:03）：00:40 那則在當天 18:00 以前回了，23:10 再傳第二則（回的時間＝手機第一次看到回覆的那一刻）*/
      for(const z of ((V.zq2||{})[I.key]||[])){ if(z.done) continue; const m=(G.msgs||[]).find(x=>x.ask&&x.ask.id===z.tag); if(!m) continue;
        if(m.ans!=null&&z.at==null) z.at=now;
        if(z.at!=null){ z.done=true; if(z.at<=T(z.d,18)) PHONE.at(G,z.d,23+10/60,z.texts.map(t=>({th:'p:heroine_04',from:'heroine_04',text:t})),z.tag+'_2'); }
        else if(now>T(z.d,18)) z.done=true; }
      /* 考前提醒（C04：Kevin 考試日前七天 21:00 私訊，只給報了的；AA_241 9-3）*/
      const rm=I.A.remind; if(rm&&(V.reg[I.key]==='yes'||V.reg[I.key]==='done')){ const kd=S.dayOf(I.yk,I.A.season,I.A.keys[rm.key].day), rd=kd!=null?kd-rm.before:null, tg='vac_rem_'+I.key;
        if(rd!=null&&now>=T(rd,rm.h)&&G.day<=rd+2&&!PHONE.sent(G,tg)){ const th='p:'+rm.who, M=rm.msgs.map(t=>({th,from:rm.who,name:rm.name,text:t})); if(rm.opts) M[M.length-1].ask={id:tg,until:T(rd+2,24),opts:rm.opts.map(o=>({t:o.t,say:o.say.map(t=>({th,from:rm.who,name:rm.name,text:t}))}))}; PHONE.at(G,rd,rm.h,M,tg); } }
      /* 分數（C04：考完 days 天後的系統字「成績出來了。」；分數照去了幾場和這一系列考過幾次算，AA_241 第 10 節「分數照程式」；比上一次同一種考試高＝「比上次多。」AA_264）*/
      const sc=I.A.score; if(sc&&V.reg[I.key]==='done'){ const kd=S.dayOf(I.yk,I.A.season,I.A.keys[I.A.keys.length-1].day), sd=kd!=null?kd+sc.days:null, tg='vac_score_'+I.key;
        if(sd!=null&&now>=T(sd,sc.h)&&G.day<=sd+3&&!PHONE.sent(G,tg)){ const SC=V.score||(V.score={}), prev=Object.keys(SC).filter(k=>SC[k].test===sc.test).map(k=>SC[k]).sort((a,b)=>a.day-b.day), att=(V.att||{})[I.key]|0;
          const n=sc.test==='toeic'?Math.min(950,640+35*att+50*prev.length):Math.min(110,68+4*att+6*prev.length), last=prev.length?prev[prev.length-1].n:null; SC[I.key]={test:sc.test,n,day:sd};
          PHONE.at(G,sd,sc.h,[{th:'sys',text:'成績出來了。'},{th:'sys',text:sc.name+' '+n+' 分。'+(last!=null&&n>last?'比上次多。':'')}],tg); } }
      /* 成績（AA_242 3-6）：學校的信、A 版截圖傳家人群組 */
      const gr=S.nth(G,I)===1&&I.A.grades; if(gr&&V.reg[I.key]==='done'){ const gd=S.dayOf(I.yk,I.A.season,gr.day), tg='vac_grade_'+I.key; if(gd!=null&&now>=T(gd,gr.h)&&G.day<=gd+3&&!PHONE.sent(G,tg)){ const A2=!!F.C10_STUDY, V2=A2?gr.A:gr.B, M=[{th:'sys',text:gr.mail},{th:'sys',text:V2.narr}];
          if(A2&&V2.mom){ PHONE.join(G,'home','家人'); M.push({th:'g:home',from:'player',name:G.name||'祐廷',text:'📷（成績單的截圖）'}); for(const t of V2.mom) M.push({th:'g:home',from:'mom',name:'媽媽',text:t}); } PHONE.at(G,gd,gr.h,M,tg); } }
      /* 去過那一項才有的後續訊息（AA_242 7-1：智恩、家睿、Priya）*/
      for(const [j,f] of (S.nth(G,I)===1?(I.A.follow||[]):[]).entries()){ if(V.reg[I.key]!=='done') break; const fd=f.abs?DK(f.abs):(f.next?termDay('Y'+(+I.yk.slice(1)+1)+f.next.term,f.next.week,f.next.wd):(f.day?S.dayOf(I.yk,I.A.season,f.day):(f.dayFn?f.dayFn(I):null))), tg='vac_fol_'+I.key+'_'+j; if(fd==null||now<T(fd,f.h)||G.day>fd+2||PHONE.sent(G,tg)) continue;
        const th='p:'+f.who, M=f.msgs(G).map(t=>({th,from:f.who,name:f.name,text:t})); const fo=f.optsFn?f.optsFn(G):f.opts; if(fo) Object.assign(M[M.length-1],{ask:{id:tg,until:T(fd+2,24),opts:fo.map(o=>({t:o.t,set:o.set,say:o.say.map(t=>({th,from:f.who,name:f.name,text:t}))}))}}); PHONE.at(G,fd,f.h,M,tg); } }
    /* 大一暑假的訊息（AA_241 第 4、6、7 節）*/
    for(const m of Dt().MSGS){ if(PHONE.sent(G,m.tag)) continue; const d=DK(m.day); if(d==null||now<T(d,m.h)||G.day>d+2) continue;
      if(m.th.startsWith('g:')&&!PHONE.inGroup(G,m.th.slice(2))) continue; if(m.min&&!atLeast(m.min[0],m.min[1])) continue; if(m.dating&&!F['dating_'+m.dating]) continue;
      if(m.vac&&!S.enrolled(G,m.vac)) continue; if(m.dating&&!m.vac&&S.abroadOn(G,d)) continue;   /* 人在國外的那幾天，交往中的訊息照 AA_242 第 6、8 節（出國期間的那一套）*/ if(m.idle&&Object.values(V.reg).some(v=>v==='yes'||v==='done')) continue;   /* 整個暑假都沒排事才傳（VA-11 最後一列）*/
      if(!m.dating&&m.th.startsWith('p:')&&F['dating_'+m.th.slice(2)]&&/^va02_/.test(m.tag)) continue;   /* 交往中的返鄉訊息另外補（AA_241 第 6 節最後一點）*/
      PHONE.at(G,d,m.h,m.ms.map(x=>Object.assign({th:m.th},x)),m.tag); } };
  /* ---- VA-09 芯慈的事務所暑假（AA_256 第 1 節）：她自己過，玩家有沒有回都照常；第 2、3 則可以約一次午餐 ---- */
  S.va09Phone=function(G){ const C=Dt().VA09, F=G.flags, now=T(G.day,G.hour); if(!C) return; const who=C.who, th='p:'+who;
    if(F.VA09_LUNCH_ASK===true){ F.VA09_LUNCH_ASK='planned'; const d1=DK(C.lunchTo); const wkend=x=>{ const w=CALENDAR.dateOf(x).wd%7; return w===0||w===6; }; let d=G.hour<11?G.day:G.day+1; while(d1!=null&&d<=d1&&wkend(d)) d++;   /* 最近的平日（今天 11 點以前問的＝今天）*/
      if(d1!=null&&d<=d1&&typeof OUT!=='undefined') OUT.plan(G,{id:'va09_lunch',ev:'ev_va09_lunch',day:d,h:12,late:0.5,place:'芯慈爸爸事務所樓下的自助餐',title:'和芯慈吃午餐（事務所樓下）',travel:'捷運約 25 分鐘',travelH:0.4}); }
    if(!atLeast(who,C.min)) return;
    for(const m of C.msgs){ if(PHONE.sent(G,m.tag)) continue; const d=DK(m.day); if(d==null||now<T(d,m.h)||G.day>d+2) continue;
      const L=(m.c14&&F.C14_VISITED!=null?m.c14:m.ms), R=C.replies.slice(); if(m.lunch&&!F.VA09_LUNCH_ASK) R.push(Object.assign({set:{VA09_LUNCH_ASK:true}},C.lunchAsk));
      const M=L.map(t=>({th,from:who,text:t})); M[M.length-1].ask={id:m.tag,until:T(d+2,24),opts:R.map(o=>({t:o.t,set:o.set,say:o.r.map(t=>({th,from:who,text:t}))}))};
      PHONE.at(G,d,m.h,M,m.tag); break; } };   /* 一次一則（一週最多一則，照順序）*/
  /* ---- VA-10 麵店團出國：香港（AA_256 第 2 節）：群組揪 → 我也去／不行／不回（8/1 阿哲私訊，8/3 以後算不去）；去了照 S.va10Trip 演三場 ---- */
  S.va10Phone=function(G){ const C=Dt().VA10, F=G.flags, now=T(G.day,G.hour); if(!C||!PHONE.inGroup(G,'noodle_team')) return; const g='g:noodle_team', P=(th,[w,t])=>({th,from:w,text:t});
    const d0=DK(C.from), d1=DK(C.to), dA=DK(C.ask.day), dN=DK(C.nudge.day), dU=DK(C.nudge.until); if(d0==null||dA==null) return;
    const opts=th=>[{t:C.yes,set:{VA10:'yes'},say:[]},{t:C.no.t,set:{VA10:'no'},say:C.no.r.map(x=>P(th,x))}];
    if(!PHONE.sent(G,'va10_ask')&&now>=T(dA,C.ask.h)&&G.day<=dA+2){ const M=C.ask.ms.map(x=>P(g,x)); M[M.length-1].ask={id:'va10_ask',until:T(d0-1,24),opts:opts(g)}; PHONE.at(G,dA,C.ask.h,M,'va10_ask'); }
    if(!F.VA10&&PHONE.sent(G,'va10_ask')&&!PHONE.sent(G,'va10_nudge')&&dN!=null&&now>=T(dN,C.nudge.h)&&G.day<=dN+1){ const M=C.nudge.ms.map(t=>({th:'p:zhe',from:'zhe',text:t})); M[M.length-1].ask={id:'va10_nudge',until:T(dU,24),opts:opts('p:zhe')}; PHONE.at(G,dN,C.nudge.h,M,'va10_nudge'); }
    if(!F.VA10&&dU!=null&&G.day>dU) F.VA10='no';   /* 再不回就算不去 */
    if(F.VA10==='yes'&&typeof OUT!=='undefined'&&!OUT.get(G,'vac_va10')) OUT.plan(G,{id:'vac_va10',ev:'ev_vac_key',day:d0,h:8,late:0.5,place:'香港',title:'麵店團出國：香港（'+dl(d0)+'～'+dl(d1)+'）',travel:'去機場 約 1 小時',travelH:1,back:'回到臺北。',vac:{key:'VA10',k:'va10'}});
    const went=F.VA10==='yes'&&(OUT.get(G,'vac_va10')||{}).state==='done';
    if(F.VA10!=='yes'||(OUT.get(G,'vac_va10')||{}).state==='missed'){ const m=C.missPhoto; if(PHONE.sent(G,'va10_ask')&&!PHONE.sent(G,'va10_photo')&&now>=T(d0+m.d,m.h)&&G.day<=d1) PHONE.at(G,d0+m.d,m.h,m.ms.map(x=>P(g,x)),'va10_photo'); }
    if(PHONE.sent(G,'va10_ask')&&!PHONE.sent(G,'va10_back')&&now>=T(d1,C.back.h)&&G.day<=d1+2){ const M=C.back.ms.map(x=>P(g,x)); if(!went) for(const x of C.missTail) M.push(P(g,x)); PHONE.at(G,d1,C.back.h,M,'va10_back'); } };
  S.va10Trip=async function(GM){ const G=GM.G, C=Dt().VA10, d0=DK(C.from), d1=DK(C.to), F=G.flags; if(!C||d0==null) return false;
    const I={key:'VA10',with:null,A:{id:'VA10',place:{kind:'abroad'},season:'summer',trip:{sd:d0,ed:d1,start:{h:8},end:{h:18}}},yk:null}; S.tripMsgs(G,I);
    for(const st of C.steps){ const extra=[]; for(const id in (st.dating||{})) if(F['dating_'+id]) extra.push(...st.dating[id]); await S.jump(GM,T(d0+st.d,st.h),'香港'); await S.key(GM,{bg:null,lines:st.lines.concat(extra)},I); }
    await S.jump(GM,T(d1,18),'香港'); F.BACK_FROM_VA10=G.day; return true; };
  /* ---- C01 麵店團海邊：大二～大四寒假（AA_264）。大一照 AA_204（story3d.js va03）；去過的照第 2 節（第二次、第三次以後）；大二以後才第一次去的照 AA_264 第 4 節（AA_204 第 3 節整段、換三句）---- */
  S.c01Day=function(yk){ if(typeof CALENDAR==='undefined'||!CALENDAR.termDays) return null; const r=CALENDAR.termDays(yk+'S1'); if(!r) return null; for(let d=r.to+1;d<=r.to+14;d++){ if(!CALENDAR.termOf(d)&&CALENDAR.dateOf(d).wd%7===1) return d; } return null; };
  S.c01N=function(G){ const V=S.rec(G); return (G.flags&&G.flags.VA03_BEACH==='went'?1:0)+Object.values(V.c01||{}).filter(x=>x==='done').length; };
  S.c01Phone=function(G){ const C=Dt().C01, V=S.rec(G), F=G.flags, now=T(G.day,G.hour); if(!C||!PHONE.inGroup(G,'noodle_team')) return;
    if(typeof F.C01_PICK==='string'){ const yk=F.C01_PICK; delete F.C01_PICK; const d=S.c01Day(yk); (V.c01||(V.c01={}))[yk]='yes'; if(d!=null&&typeof OUT!=='undefined') OUT.plan(G,{id:'vac_c01_'+yk,ev:'ev_vac_key',day:d,h:8+50/60,late:0.25,place:'臺北車站',title:'海邊一日遊（臺北車站集合）',travel:'捷運約 20 分鐘',travelH:1/3,back:'回到臺北。',vac:{key:'C01#'+yk,k:'c01'}}); }
    for(const yk of ['Y2','Y3','Y4']){ const d=S.c01Day(yk); if(d!=null) S.c01First(G,yk,d); }
    for(const yk of ['Y2','Y3','Y4']){ const d=S.c01Day(yk), tg='vac_c01ask_'+yk; if(d==null||PHONE.sent(G,tg)||now<T(d-3,21+5/60)||G.day>=d) continue; const n=S.c01N(G); if(n<1||PHONE.sent(G,'vac_c01first_'+yk)) continue;
      const L=C.ask[n>=2?3:2], T2='g:noodle_team', M=L.map(t=>({th:T2,from:'zhe',text:t})); Object.assign(M[M.length-1],{ask:{id:tg,until:T(d,8.5),opts:[{t:C.opts[0],set:{C01_PICK:yk}},{t:C.opts[1]}]}}); PHONE.at(G,d-3,21+5/60,M,tg); } };
  /* 大二以後才第一次去（AA_264 第 4 節，e01ee2a8）：前一個週五 21:05 麵店團群組照 AA_204 3-1（阿哲那句換「禮拜一去海邊？過幾天我就回高雄了」）；
     以安：和她 FAMILIAR 以上、而且那個禮拜一她在臺北，才回、才去（VA03_AN）；我去＝禮拜一 08:50 臺北車站（出遊 ev_va03_beach，第一句旁白換「寒假的第一個禮拜一」）；當晚群組照 AA_204 */
  S.c01First=function(G,yk,d){ const V=S.rec(G), F=G.flags, now=T(G.day,G.hour), tg='vac_c01first_'+yk, TH='g:noodle_team', C=V.c01||(V.c01={});
    if(!PHONE.sent(G,tg)){ if(now<T(d-3,21+5/60)||G.day>=d||S.c01N(G)>=1) return;
      const pr=typeof STORY!=='undefined'&&STORY.presence?STORY.presence('heroine_01',Object.assign({},G,{day:d,hour:9})):{here:true}, an=atLeast('heroine_01','FAMILIAR')&&!!(pr.here||pr.kind==='taipei');
      const L=[['zhe','禮拜一去海邊？過幾天我就回高雄了',21+5/60],['yu','冬天去海邊？？',21.1],['yu','好啊',21.1],['classmate_bohan','火車九點十分有一班。',21+10/60],['classmate_xinci','我怕冷，我不去了。你們拍照。',21.5]];
      if(an) L.push(['heroine_01','我可以。幾點集合？',21+40/60]); F.VA03_AN=an;
      L.forEach(([from,text,h],i)=>{ const m={th:TH,from,text}; if(i===L.length-1) m.ask={id:tg,until:T(d,8.5),opts:[{t:'我去',set:{C01F_PICK:yk}},{t:'我那天不行'}]}; PHONE.at(G,d-3,h,[m],i===L.length-1?tg:tg+'_'+i); });
      return; }
    if(F.C01F_PICK===yk){ delete F.C01F_PICK; C[yk]='first'; if(typeof OUT!=='undefined'&&!OUT.get(G,'vac_c01_'+yk)&&G.day<=d) OUT.plan(G,{id:'vac_c01_'+yk,ev:'ev_va03_beach',day:d,h:8+50/60,late:0.25,place:'臺北車站',title:'海邊一日遊（禮拜一 08:50 臺北車站集合）',travel:'捷運約 20 分鐘',travelH:1/3,back:'回到臺北。'}); }
    if(G.day===d&&G.hour>=18&&F.VA03_BEACH!=='went'&&!PHONE.sent(G,tg+'_none')) PHONE.at(G,d,18,[{th:TH,from:'yu',text:'📷（灰色的海）'},{th:TH,from:'yu',text:'好冷但好好玩'},{th:TH,from:'classmate_xinci',text:'看起來好冷。'}],tg+'_none');
    if(C[yk]==='first'&&F.VA03_BEACH==='went'&&!PHONE.sent(G,tg+'_photo')){ const at=Math.max(T(G.day,G.hour),T(d,20)); PHONE.at(G,Math.floor(at/24),at%24,[{th:TH,from:'yu',text:'📷（海邊的合照）'},{th:TH,from:'yu',text:'五張裡最好的一張'}].concat(F.VA03_SHOE?[{th:TH,from:'zhe',text:'📷（曬在宿舍欄杆上的鞋子）'},{th:TH,from:'zhe',text:'鞋子回來了'}]:[]),tg+'_photo'); } };
  /* ---- 關鍵事件（出遊事件 ev_vac_key 的 beforeOuting）---- */
  const run=async(GM,lines)=>{ const G=GM.G; for(let x of (lines||[])){ if(typeof x==='function') x=x(G); if(x==null) continue; if(Array.isArray(x)){ await run(GM,x); continue; }
      let t=typeof x.text==='function'?x.text(G):x.text; if(typeof x==='string') await GM.say(null,x);
      else if(x.narr) await GM.say(null,x.narr); else if(x.who==='player') await GM.say({name:G.name||'祐廷'},t); else if(x.who) await GM.say({name:x.name||nm(x.who),charId:x.name?null:x.who},t); } };
  S.key=async function(GM,k,I){ const G=GM.G; if(typeof ADV!=='undefined'&&ADV.begin) ADV.begin({background:k.bg&&typeof OUT!=='undefined'&&OUT.bg?OUT.bg(k.bg):'dark'});
    await run(GM,k.lines); if(k.choice&&k.choice.length&&(!k.choiceIf||k.choiceIf(G))){ const i=await GM.choose(k.choice.map(c=>({t:c.t}))), c=k.choice[i]||k.choice[0]; await run(GM,c.say); if(c.set) Object.assign(G.flags,c.set); if(c.rel&&typeof SOCIAL!=='undefined') for(const id in c.rel) SOCIAL.adjust(id,c.rel[id]); }
    if(k.after) await run(GM,k.after); if(k.set) Object.assign(G.flags,k.set); };
  S.jump=async function(GM,t,place){ const G=GM.G, E=GM.E; if(t<=T(G.day,G.hour)) return; await GM.fade(true); let tt=T(G.day,G.hour), n=0;
    while(tt+1<t-1e-6){ tt+=1; const d=Math.floor(tt/24); if(d>G.day){ G.day=d; G.weekday=typeof CALENDAR!=='undefined'?CALENDAR.dateOf(d).wd%7:(G.weekday+1)%7; G.energy=100; G.flags.companion=null; } G.hour=tt-G.day*24; if(E) E.hour=G.hour;
      if(typeof STORY!=='undefined'&&STORY.monthlyFunds){ const f=STORY.monthlyFunds(G); if(f&&GM.money) GM.money(f.amount); }
      if(typeof PHONE!=='undefined'){ try{ if(typeof STORY!=='undefined'&&STORY.phoneRules) STORY.phoneRules(GM); PHONE.tick(G,out=>{ n+=out.length; }); }catch(e){ console.warn('VAC jump phone',e); } } }
    const d=Math.floor(t/24); if(d>G.day){ G.day=d; G.weekday=typeof CALENDAR!=='undefined'?CALENDAR.dateOf(d).wd%7:G.weekday; } G.hour=t-G.day*24; if(E) E.hour=G.hour; if(GM.updateHUD) GM.updateHUD();
    if(GM.titleCard&&typeof CALENDAR!=='undefined'){ const x=CALENDAR.dateOf(G.day); await GM.titleCard(x.m+'/'+x.d+'（'+['日','一','二','三','四','五','六'][x.wd%7]+'）',place||'',2000); }
    await GM.fade(false); if(n&&GM.toast) GM.toast('手機｜這幾天收到 '+n+' 則訊息',3600); };
  /* ---- 出國期間的訊息（AA_242 第 6、8 節；BB_200 第 2～3 節）：出發的時候一次排好（交往中、熟不熟照出發那一刻）----
     交往中：出發那天一則、每天輪播池（學姊兩天一則；第二圈只用前半）、中間那天換成「中間」那則、回來那天一則；池子的每一則有兩個回覆（她不再回，沒回不扣分）。
     朋友（FAMILIAR 以上）：整趟一兩則。柬埔寨：晚上（臺灣 22:00）以後才收得到；停電那晚（8/2）不收，隔天早上一次收到＋交往中的「怎麼沒回？」。加州：第 3 週多一次「想念」。 */
  S.tripMsgs=function(G,I){ const M=Dt()&&Dt().TRIP_MSG; if(!M||typeof PHONE==='undefined') return 0; const A=I.A, tr=A.trip, F=G.flags||{};
    const sd=tr.sd!=null?tr.sd:S.dayOf(I.yk,A.season,tr.start.day), ed=tr.ed!=null?tr.ed:S.dayOf(I.yk,A.season,tr.end.day), dark=tr.dark?S.dayOf(I.yk,A.season,tr.dark):null; let n=0;
    const wdOf=d=>typeof CALENDAR!=='undefined'?CALENDAR.dateOf(d).wd%7:0;
    const when=(d,h)=>{ if(tr.signalAfter&&d>sd&&d<ed){ if(dark!=null&&d===dark) return {d:d+1,h:8}; if(h<tr.signalAfter&&h>=7) h=tr.signalAfter; } return {d,h}; };   /* 柬埔寨：白天收不到、停電那晚隔天早上才收到 */
    const put=(id,d,h,texts,tag,ask)=>{ const w=when(d,h), th='p:'+id, ms=texts.map(t=>({th,from:id,text:t})); if(ask) Object.assign(ms[ms.length-1],{ask}); if(PHONE.at(G,w.d,w.h,ms,tag)) n++; };
    const tx=(x)=>typeof x==='function'?x(G):x;
    const off=(o,d)=>{ if(!o) return false; const a=DK(o[0]), b=DK(o[1]); return a!=null&&b!=null&&d>=a&&d<b; };
    const mid=Math.floor((sd+ed)/2), depH=Math.max(7,tr.start.h-1), T0='vac_tm_'+I.key+'_';
    for(const id in M.gf){ if(!F['dating_'+id]||id===I.with) continue; const P=M.gf[id], fr=P.freq; if(off(P.off,sd)) continue;   /* 一起去的那一位不傳 */
      const at=d=>{ const h=(fr.tt&&[2,4].includes(wdOf(d)))?fr.tt:fr.h; return fr.nextDay?{d:d+1,h}:{d,h}; };
      put(id,sd,Math.min(tr.start.h+0.5,23),P.dep,T0+id+'_dep');
      let k=0; for(let d=sd+1;d<ed;d++){ if(fr.every&&(d-sd)%fr.every!==1%fr.every) continue; const w=at(d);
        if(d===mid){ put(id,w.d,w.h,P.mid,T0+id+'_mid'); continue; }
        const idx=k<8?k:(k-8)%4; k++; const ask={id:T0+id+'_p'+d,until:T(w.d+1,24),opts:P.rep.map(t=>({t,say:[]}))}; put(id,w.d,w.h,tx(P.pool[idx]),T0+id+'_p'+d,ask);
        if(id==='heroine_04'&&w.d<ed){ const V=S.rec(G), Z=(V.zq2||(V.zq2={}))[I.key]||(V.zq2[I.key]=[]); Z.push({d:w.d,tag:T0+id+'_p'+d,texts:tx(P.pool[(idx+4)%8])}); } }   /* 子晴第二則：池子另一半的那一則 */
      put(id,ed,Math.max(8,tr.end.h-3),P.back,T0+id+'_back');
      if(dark!=null&&P.dark){ const th='p:'+id; const ask={id:T0+id+'_dark',until:T(dark+2,24),opts:M.darkRep.map(t=>({t,say:[{th,from:id,text:P.darkAns}]}))}; put(id,dark,22.5,P.dark,T0+id+'_dark',ask); }   /* 停電那晚她傳的，隔天早上才收到 */
      if(tr.missWeek&&P.miss){ const d=sd+(tr.missWeek-1)*7+2; if(d<ed) put(id,at(d).d,at(d).h+0.5,P.miss,T0+id+'_miss',{id:T0+id+'_miss',until:T(d+2,24),opts:M.missRep.map(t=>({t,say:[]}))}); } }
    const fam=id=>atLeast(id,'FAMILIAR');
    for(const id in M.friend){ if(F['dating_'+id]||!fam(id)||id===I.with) continue; if(M.gf[id]&&off(M.gf[id].off,sd)) continue;
      M.friend[id].forEach((f,j)=>{ if(f.only&&f.only!==A.id) return; const d=f.day==='mid'?mid:(f.day==='mid1'?mid+1:(f.day==='mid-1'?mid-1:(f.day==='end'?ed-1:sd+f.day))); const h=f.h==='dep'?depH:f.h;
        put(id,f.nextDay?d+1:d,h,tx(f.ms),T0+'f_'+id+'_'+j); }); }
    return n; };
  /* 回來後第一次在 3D 遇到朋友（AA_242 8-7、BB_200 第 4 節）：最近一趟出國回來 30 天內、FAMILIAR 以上、沒有交往；每個人每趟一次（story3d.js 的 talkCharacter 在閒聊前呼叫）*/
  S.backGreet=async function(GM,who,id){ const G=GM.G, M=Dt()&&Dt().TRIP_MSG, t=M&&M.backGreet&&M.backGreet[id]; if(!t||!G.flags||G.flags['dating_'+id]||!atLeast(id,'FAMILIAR')) return false;
    let best=null; for(const k in G.flags){ const m=/^BACK_FROM_(C\d+)$/.exec(k); if(!m||typeof G.flags[k]!=='number') continue; if(G.day>=G.flags[k]&&G.day<=G.flags[k]+30&&(!best||G.flags[k]>best.d)) best={c:m[1],d:G.flags[k]}; }
    if(!best) return false; const V=S.rec(G), B=V.backSeen||(V.backSeen={}), key=best.c+'@'+best.d; B[key]=B[key]||{}; if(B[key][id]) return false; B[key][id]=G.day; await GM.say(who,t); return true; };
  /* ===== 出國旅遊（C13，自己排；AA_244 第 2 節、3-1；BB_200 第 7 節）===== */
  const TV=()=>Dt()&&Dt().TRAVEL;
  /* 這個假期（或這學期第 10 週以後＝下一個假期）：{kind, from, to} */
  S.nextBreak=function(G){ if(typeof HOME==='undefined'||!HOME.breakOf||typeof CALENDAR==='undefined') return null; let B=HOME.breakOf(G.day); if(B) return B; const t=CALENDAR.termOf(G.day); if(!t||t.week<10) return null; const r=CALENDAR.termDays(t.id); if(!r) return null;
    for(let d=r.to+1;d<=r.to+14;d++){ if(!CALENDAR.termOf(d)){ B=HOME.breakOf(d); if(B) return B; } } return null; };
  /* 交往了幾天（ROM 的 start 紀錄；可昕從經濟系那一年就在交往）*/
  S.datingDays=function(G,id){ if(id==='kexin') return 9999; const R=G.flags&&G.flags.romance&&G.flags.romance[id]; let d=null;
    for(const h of ((R&&R.history)||[])){ if(!h||h.ev!=='start') continue; if(typeof h.day==='number') d=h.day; else if(typeof h.at==='string'){ const m=/^(Y\dS\d)W(\d+)$/.exec(h.at), m2=/^D(-?\d+)$/.exec(h.at); if(m) d=termDay(m[1],+m[2],1); else if(m2) d=+m2[1]; } }
    return d==null?0:G.day-d; };
  /* 她那幾天能不能一起出國（BB_200 第 7 節）：交往滿 28 天、正式約會 2 次、那幾天都在臺灣；學姊放榜（3/23）以前不行；沛珊重考消失期不行；歐美再加滿 90 天（不到＝「下次」）*/
  S.gfCan=function(G,id,dest,from,to){ const D=TV(); if(!G.flags['dating_'+id]||!D.gf[id]) return 'none'; const L=typeof DATE!=='undefined'&&DATE.log?DATE.log(G,id):{count:0};
    if(S.datingDays(G,id)<28||(id!=='kexin'&&(L.count|0)<2)) return 'no';
    for(let d=from;d<=to;d++){ if(typeof STORY!=='undefined'&&STORY.presence){ const pr=STORY.presence(id,Object.assign({},G,{day:d})); if(!pr.here&&pr.kind!=='home') return 'no'; } }   /* 回老家的女朋友照樣約得出國（AA_276：約出國）*/
    const M=Dt().TRIP_MSG, off=M&&M.gf[id]&&M.gf[id].off; if(off){ const a=DK(off[0]), b=DK(off[1]); if(a!=null&&b!=null&&from<b&&to>=a) return 'no'; }
    if(id==='heroine_05'&&typeof DATE!=='undefined'&&DATE.SIS_RESULT_DAY){ const r=DK(DATE.SIS_RESULT_DAY); if(r!=null&&from<r) return 'no'; }
    if(D.dest[dest].far&&S.datingDays(G,id)<90) return 'later';
    return 'yes'; };
  /* 手機活動頁的「安排出國旅遊」→ 一連串選擇（目的地、和誰、幾天、哪天出發）*/
  S.plan13=async function(GM){ const G=GM.G, D=TV(), B=S.nextBreak(G); if(!D||!B){ if(GM.toast) GM.toast('現在離假期還太遠，第 10 週以後可以排',3000); return false; }
    const keys=Object.keys(D.dest).filter(k=>!D.dest[k].far||B.kind==='summer'); const o1=keys.map(k=>({t:D.dest[k].name})).concat([{t:'不去了'}]); const a=await GM.choose(o1); if(a>=keys.length) return false; const dest=keys[a], far=D.dest[dest].far;
    const who=[{t:'自己去',id:null}]; for(const id in D.gf) if(G.flags['dating_'+id]) who.push({t:'和'+nm(id),id,gf:true}); for(const id in D.friend) if(atLeast(id,'FAMILIAR')) who.push({t:'和'+nm(id),id});
    const b=await GM.choose(who.map(x=>({t:x.t})).concat([{t:'不去了'}])); if(b>=who.length) return false; const W=who[b];
    const lens=far?[7,10,14]:[3,5,7]; const c=await GM.choose(lens.map(n=>({t:n+' 天'})).concat([{t:'不去了'}])); if(c>=lens.length) return false; const len=lens[c];
    const lo=Math.max(B.from,G.day+3), starts=[]; for(let d=lo;d+len-1<=B.to&&starts.length<4;d+=7) starts.push(d); if(!starts.length){ if(GM.toast) GM.toast('這個假期排不下 '+len+' 天',3000); return false; }
    const e=await GM.choose(starts.map(d=>({t:dl(d)+' 出發（'+dl(d+len-1)+' 回來）'})).concat([{t:'不去了'}])); if(e>=starts.length) return false; const from=starts[e], to=from+len-1;
    if(W.gf){ const P=D.gf[W.id], me={name:nm(W.id),charId:W.id}; await GM.say({name:G.name||'祐廷'},'要不要一起出國？'); const r=S.gfCan(G,W.id,dest,from,to);
      if(r!=='yes'){ await GM.say(me,r==='later'?P.later:P.no); return false; } for(const t of P.yes) await GM.say(me,t);
      if(P.next&&typeof PHONE!=='undefined') PHONE.at(G,G.day+1,21,P.next.map(t=>({th:'p:'+W.id,from:W.id,text:t})),'vac_t13next_'+G.day+'_'+W.id); }
    const V=S.rec(G), T=V.t13||(V.t13=[]), n=T.length+1, rec={n,dest,from,to,with:W.id||null,gf:!!W.gf,season:B.kind}; T.push(rec);
    if(typeof PHONE!=='undefined'){ PHONE.join(G,'home','家人'); PHONE.at(G,G.day,G.hour,D.fam.map(t=>({th:'g:home',from:'mom',name:'媽媽',text:t})),'vac_t13fam_'+n);
      const P=W.gf&&D.gf[W.id]; if(P&&P.eve) PHONE.at(G,from-1,21,P.eve.map(t=>({th:'p:'+W.id,from:W.id,text:t})),'vac_t13eve_'+n); }   /* 學姊住家裡：出發前一天 21:00「我跟我媽說了。」*/
    if(typeof OUT!=='undefined') OUT.plan(G,{id:'vac_t13_'+n,ev:'ev_vac_key',day:from,h:8,late:0.5,place:D.dest[dest].name,title:'出國旅遊：'+D.dest[dest].name+(W.id?'（和'+nm(W.id)+'）':''),travel:'去機場 約 1 小時',travelH:1,back:'回到臺北。',vac:{key:'T13#'+n,k:'trip'}});
    if(GM.toast) GM.toast('排好了：'+dl(from)+'～'+dl(to)+' '+D.dest[dest].name,3000); return true; };
  S.trip13=async function(GM,key){ const G=GM.G, D=TV(), V=S.rec(G), rec=(V.t13||[]).find(r=>'T13#'+r.n===key); if(!rec||!D) return false; const De=D.dest[rec.dest], place=De.name;
    const I={key,with:rec.with,A:{id:'T13',place:{kind:'abroad'},season:rec.season,trip:{sd:rec.from,ed:rec.to,start:{h:8},end:{h:18}}},yk:null}; S.tripMsgs(G,I);
    const mid=Math.floor((rec.from+rec.to)/2), last=rec.to-1, k=x=>typeof x==='function'?x(G):x;
    const comp=rec.with?(rec.gf?(rec.with==='heroine_02'&&rec.dest!=='hk'?D.gf[rec.with].lastNot:D.gf[rec.with].last):D.friend[rec.with]):null;
    const nth=1+V.t13.filter(r=>r!==rec&&r.done&&r.dest===rec.dest).length+(rec.dest==='jp'&&V.reg['C05@Y1']==='done'?1:0), AG=nth>=2&&D.again&&D.again[nth>=3?3:2];   /* 同一個目的地第幾次 */
    const steps=AG?[{d:rec.from,h:8.5,lines:[{narr:AG.dep}]},{d:rec.from,h:15,lines:[{narr:AG.arr}]},{d:mid,h:14,lines:[{narr:AG.mid}]},{d:last,h:20,lines:[{narr:AG.last}].concat(comp?[{who:rec.with,text:comp}]:[])}]
      :[{d:rec.from,h:15,lines:[{narr:k(De.keys[0])}]},{d:mid,h:14,lines:[{narr:k(De.keys[1])}]},{d:last,h:20,lines:[{narr:k(De.keys[2])}].concat(comp?[{who:rec.with,text:comp}]:[])}];
    if(rec.gf) steps.push({d:last,h:23,bg:'trip_hotel_twin',lines:[{narr:'（燈關了。）'}]});   /* 雙床房（BB_173 VB-12）：對話在睡前結束 */
    for(const st of steps){ await S.jump(GM,T(st.d,st.h),place); await S.key(GM,{bg:st.bg||null,lines:st.lines},I); }
    await S.jump(GM,T(rec.to,18),place); rec.done=true; G.flags.BACK_FROM_T13=G.day;
    if(rec.gf&&typeof DATE!=='undefined'&&DATE.log){ const L=DATE.log(G,rec.with); L.count=(L.count|0)+1; if(typeof SOCIAL!=='undefined'&&SOCIAL.adjust&&DATE.GAIN) SOCIAL.adjust(rec.with,DATE.GAIN[0]); }   /* 算一次正式約會（不加倍）*/
    if(typeof PHONE!=='undefined'&&PHONE.inGroup(G,'noodle_team')){ const n=S.all().filter(J=>J.A.back&&PHONE.sent(G,'vac_back_'+J.key)).length+V.t13.filter(r=>PHONE.sent(G,'vac_back_T13#'+r.n)).length; PHONE.at(G,rec.to,20,[{th:'g:noodle_team',from:'zhe',text:n===0?'伴手禮咧':(n===1?'這次伴手禮咧':'（貼圖：伸出手）')}],'vac_back_'+key); }
    return true; };
  /* 可昕的週末視訊（BB_200 第 3 節：週六晚上；加州是臺灣週日早上 10:00）：這一版整趟演一次（第一個週末），台詞 AA_242 8-2 */
  S.videoKey=function(G,I){ const M=Dt()&&Dt().TRIP_MSG; if(!M||!(G.flags&&G.flags.dating_kexin)) return null; const A=I.A, tr=A.trip, sd=S.dayOf(I.yk,A.season,tr.start.day), ed=S.dayOf(I.yk,A.season,tr.end.day), wd=tr.videoWd!=null?tr.videoWd:6, h=tr.videoH||20;
    for(let d=sd+1;d<ed;d++){ if(typeof CALENDAR!=='undefined'&&CALENDAR.dateOf(d).wd%7===wd){ const x=CALENDAR.dateOf(d); return {day:String(x.m).padStart(2,'0')+'-'+String(x.d).padStart(2,'0'),h,title:'視訊',bg:null,lines:M.gf.kexin.video.map(t=>({who:'kexin',text:t}))}; } } return null; };
  /* AA_275 第 1 節：快轉跳過的日子裡有已報名的活動——第一次參加的照常停下來演；第二次以後、那一場只有一行（AA_264 的卡）的，快轉不停，
     那一次跳過的旁白換成那一句（home3d.js 的 breakNext／breakJump）。repSkip 回傳那一句（不是就 null）；repDone 照 S.outing 記成去過 */
  S.repSkip=function(G,q){ const v=q&&q.vac; if(!v||typeof v.key!=='string'||!/@/.test(v.key)) return null; const [id,yk]=v.key.split('@'), I=S.inst(id,yk); if(!I||S.nth(G,I)<2) return null;
    if(typeof v.k==='number'){ const k=(I.A.keys||[])[v.k], kk=k?S.repKey(G,I,v.k,k):null; return kk&&kk.lines&&kk.lines.length===1&&kk.lines[0].narr&&!kk.choice?kk.lines[0].narr:null; }
    if(v.k==='prep'||v.k==='post'){ const r=S.repLine(G,I,v.k); return typeof r==='string'?r:null; }
    if(/^pre\d+$/.test(String(v.k))){ const r=S.repLine(G,I,'pre',+String(v.k).slice(3)); return typeof r==='string'?r:null; }
    return null; };
  S.repDone=function(G,q){ const v=q.vac, [id,yk]=v.key.split('@'), I=S.inst(id,yk), V=S.rec(G); q.state='done'; if(!I) return;
    if(typeof v.k==='number'){ (V.att||(V.att={}))[I.key]=(V.att[I.key]|0)+1; if(v.k===(I.A.keys.length-1)){ V.reg[I.key]='done'; V.seen[id]=true; } }
    if(/^pre\d+$/.test(String(v.k))){ const p=(I.A.pre||[])[+String(v.k).slice(3)]; if(p&&p.set) Object.assign(G.flags,p.set); } };
  S.outing=async function(GM,q){ const G=GM.G, v=q&&q.vac; if(!v) return false; if(/^T13#/.test(v.key)) return S.trip13(GM,v.key); if(v.key==='VA10') return S.va10Trip(GM);
    if(/^C01#/.test(v.key)){ const yk=v.key.slice(4), V=S.rec(G), n=S.c01N(G)+1, L=Dt().C01.diary[n>=3?3:2]; const pts=[[8+50/60],[12],[18]]; for(let i=0;i<3;i++){ if(i) await S.jump(GM,T(G.day,pts[i][0]),'海邊'); await S.key(GM,{bg:null,lines:[{narr:L[i]}]},null); } (V.c01||(V.c01={}))[yk]='done'; return true; } const [id,yk]=v.key.split('@'), I=S.inst(id,yk); if(!I) return false; const A=I.A, V=S.rec(G);
    if(v.k==='prep'){ const rl=S.repLine(G,I,'prep'); await S.key(GM,rl!==undefined?{bg:A.prep.bg,lines:[{narr:rl}]}:Object.assign({bg:A.prep.bg},A.prep),I); return true; }
    if(/^pre\d+$/.test(String(v.k))){ const pi=+String(v.k).slice(3), p=(A.pre||[])[pi], rl=S.repLine(G,I,'pre',pi); if(p&&typeof rl==='string'){ await S.key(GM,{bg:p.bg,lines:[{narr:rl}]},I); if(p.set) Object.assign(G.flags,p.set); return true; } if(p){ if(p.lines&&p.lines.length) await S.key(GM,p,I); else if(GM.toast) GM.toast(p.title+'（'+(p.advance||1)+' 小時）',2600); if(p.advance&&GM.advance) GM.advance(p.advance); if(p.set) Object.assign(G.flags,p.set); } return true; }
    if(v.k==='re'){ const R=Dt().TRIP_MSG.reunion[v.who]; if(R){ await S.key(GM,{bg:R.bg,lines:R.lines},I); G.flags['REUNION_'+id]=true; } return true; }
    if(v.k==='trip'){ if(A.place.kind==='abroad') S.tripMsgs(G,I);
      const K=(A.keys||[]).slice(); if(A.place.kind==='abroad'){ const vk=S.videoKey(G,I); if(vk) K.push(vk); } K.sort((a,b)=>T(S.dayOf(I.yk,A.season,a.day),a.h)-T(S.dayOf(I.yk,A.season,b.day),b.h));
      for(const k of K){ const d=S.dayOf(I.yk,A.season,k.day), i=(A.keys||[]).indexOf(k), kk=i>=0?S.repKey(G,I,i,k):k; await S.jump(GM,T(d,k.h),A.trip.placeName); if(kk) await S.key(GM,kk,I); }
      const ed=S.dayOf(I.yk,A.season,A.trip.end.day); await S.jump(GM,T(ed,A.trip.end.h),A.trip.placeName); V.reg[I.key]='done'; V.seen[id]=true; if(A.place.kind==='abroad') G.flags['BACK_FROM_'+id]=G.day;   /* 回來以後第一次在 3D 遇到的招呼（BB_200 第 4 節、AA_242 8-7）*/
      if(A.trip.endLines) await run(GM,A.trip.endLines);
      if(A.post&&typeof OUT!=='undefined'&&(!A.post.if||G.flags[A.post.if])){ const p=A.post, d=S.preDay(I,p,G); if(d!=null) OUT.plan(G,{id:'vac_'+I.key+'_post',ev:'ev_vac_key',day:d,h:p.h,late:0.25,place:p.place,title:A.title+'：'+p.title,travel:'走過去約 10 分鐘',travelH:1/6,vac:{key:I.key,k:'post'}}); }
      return true; }
    if(v.k==='post'){ const rl=S.repLine(G,I,'post'); if(A.post) await S.key(GM,typeof rl==='string'?{bg:A.post.bg,lines:[{narr:rl}]}:A.post,I); return true; }
    const k=(A.keys||[])[v.k]; if(k){ const kk=S.repKey(G,I,v.k,k); if(kk) await S.key(GM,kk,I); (V.att||(V.att={}))[I.key]=(V.att[I.key]|0)+1;   /* 去了幾場（C04 的分數照這個算）*/ if(v.k===(A.keys.length-1)){ V.reg[I.key]='done'; V.seen[id]=true; } } return true; };
  S.missed=function(GM,q){ const G=GM.G, v=q&&q.vac; if(!v) return; const V=S.rec(G); if(v.k==='trip'||v.k===0) V.reg[v.key]='missed';
    if(v.k==='re'&&typeof PHONE!=='undefined'){ const R=Dt().TRIP_MSG.reunion[v.who]; if(R) PHONE.at(G,q.day+1,12,R.miss.map(t=>({th:'p:'+v.who,from:v.who,text:t})),'vac_remiss_'+v.key+'_'+v.who); } };   /* 重逢沒到：隔天她傳一則（AA_242 8-6）*/
  /* ---- 手機「活動」頁的假期行事曆（AA_199 3-2）：報名了的、還可以報名的 ---- */
  S.html=function(G){ const esc=s=>String(s).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[ch]); const V=S.rec(G), rows=[];
    for(const I of S.all()){ const st=V.reg[I.key], o=S.signupOpen(G,I), open=o&&G.day>=o.from&&G.day<=o.to&&(!st||st==='later')&&(I.A.signup.board||I.A.signup.kind!=='dm'||!I.first||PHONE.sent(G,'vac_ask_'+I.key))&&!S.blocked(G,I);
      if(!(st==='yes'||st==='done'||open)) continue; const when=dl(I.from)+(I.to!==I.from?'～'+dl(I.to):'')+(I.A.wd?'（每週'+I.A.wd.map(w=>'日一二三四五六'[w]).join('、')+'）':'');
      const cf=open?S.conflicts(G,I):[]; rows.push('<div class="item phrow"><div>'+esc(I.A.title)+'<div class="muted">'+esc(when)+'・'+esc(I.A.place.name)+(I.A.cost.payer==='family'?'・家裡出':'')+(st==='done'?'・參加過':'')+(cf.length?'・會撞到：'+esc(cf.map(c=>c.title+' '+dl(c.day)).slice(0,3).join('、')):'')+'</div></div>'+(open?'<button class="btn pri" data-vac="'+esc(I.key)+'">報名</button>':'')+'</div>'); }
    for(const r of (V.t13||[])){ const De=TV()&&TV().dest[r.dest]; if(!De) continue; rows.push('<div class="item phrow"><div>出國旅遊：'+esc(De.name)+(r.with?'（和'+esc(nm(r.with))+'）':'')+'<div class="muted">'+esc(dl(r.from)+'～'+dl(r.to))+(r.done?'・去過':'')+'</div></div></div>'); }
    if(TV()&&S.nextBreak(G)) rows.push('<div class="item phrow"><div>出國旅遊<div class="muted">自己排：目的地、和誰、幾天</div></div><button class="btn" data-vac13="1">安排</button></div>');
    return rows.length?'<div class="item"><b>假期行事曆</b></div>'+rows.join(''):''; };
  return S;
})();
