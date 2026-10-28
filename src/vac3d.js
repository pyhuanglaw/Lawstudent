/* ===== 假期活動（VAC；AA_199 第 3 節、7-2、7-4、7-5；HOLIDAY-SYS 的一部分）=====
   第一批：大一暑假的 C02 法律生活營隊輔、C03 日語課、C05 日本五天（阿凱那一團）；台詞在 data/vac_activities.js（AA_241 照抄）。
   第二批：出國的 C08 首爾交流、C09 柬埔寨志工（大一暑假）、C10 加州暑期課、C11 東京冬季課、C12 京都語言課（大二）（AA_242 18fe1b6a 照抄）：報名（系上群組公告／行事曆）→ 學期裡的前置事件（說明會、面試、系辦）→ 錄取通知＋家人群組 → 出發那天麵店團群組 → 整段一趟 → 回來阿哲「伴手禮咧」→ 新認識的人的訊息。
   - 報名：手機邀約（群組、私訊；ask 的選項記 VAC_PICK）或手機「活動」頁的「假期行事曆」（還在報名期限內的，有「報名」按鈕）。家裡出錢的，家人群組媽媽一句。
   - 參加：每個關鍵事件是一趟出遊（OUT，事件 ev_vac_key）；連續好幾天人不在的（trip：營隊、日本）整段是一趟——出發 → 中間的關鍵事件（字卡寫日期和地點，時間往後跳、手機照時間收）→ 回到宿舍（或住家裡的回家）。
   - 衝突：同一天同一個時段、或人不在臺北的那幾天（AA_199 3-2）；報名的時候寫出會撞到哪幾天，不擋（人不能同時在兩個地方：撞到的那件到時候就是沒去）。
   - 沒參加：照卡片的 miss 傳一則；沒報名的不另外處理（不扣分）。
   - 每年都開（AA_199 7-5）：第二次以後不重演，關鍵事件那幾天換成日誌一句（AA_264 的 rep、late、again；C16～C18 是 AA_242 12-3）。
   第三批（任務 VAC-C16-C18-1021；AA_199 7-7、AA_242 第 9～11 節 ede67b34 照抄）：C16 法扶實習、C17 律所暑期實習（連續數週的平日白天）、C18／C18W 海外見習團（新加坡，暑假團／寒假團）。
   - 平日白天（A.work）：每個平日 h0 一趟上班（vac.k＝'w'），關鍵事件在那一天的那個時間演，演完過到 h1（下班）；晚上、週末照常。快轉（home3d.js）只停在有關鍵事件的那幾天，其他平日記成去過（S.repSkip 回那一天的日誌、或 ''）。
   - 門檻 gate（C17 要有英文檢定成績）、這一次自己的申請表／面試（setI／needI，存 V.ok）、沒錄取換的信（select.reject）、錄取換的家人那句（select.fam）、實習津貼（A.pay，存 V.work 去了哪幾天、V.paid 入帳多少）、
     面試那天人在國外也不能報（blockPre）、交往中的可昕視訊（A.kx）。
   AA_242 第 12 節（AA-C 2026-10-21 56a36a4d）：上班日的日誌（work.diary：沒有關鍵事件的上班日一天一行、照順序用、用完只有日期卡；diaryLastWeek 固定在最後一週的第一個上班日）、
     第二次以後的關鍵日（rep.keys2：一句；again：後面照演的，C16 語彤那兩段）、C16 午餐（work.lunch，上班日扣）、C16 上學期被當＝沒錄取（select.noFail，S.failedTerm）、
     C17 去過的人公告多一個選項（signup.again「寄信給馮律師」：不用交履歷、不面試，V.ok 記 AGAIN＋面試那一格）、沒錄取時阿哲那句照季節（寒假版）、C18 行前說明會（select.brief，錄取時排；vac.k＝'brief'）。
   存檔 G.vac＝{reg:{'C02@Y1':'yes'|'no'|'later'|'done'|'missed'|'rejected'}, seen:{C02:true}, log:[{day,t}], ok:{'C16@Y2:APP':日}, work:{'C17@Y2':[去了的日子]}, paid:{'C17@Y2':元}}；舊存檔沒有後三個＝用到時才建。
   2026-10-27：X58 中間跳過的日子收到訊息就停、打開手機（S.jump，tests/x58_skip_msg_unit.js）；E08 出國的那一趟先到 3D 出境大廳再登機（檔尾，tests/e08_airport_unit.js）；AA_478：大廳裡演「出發」、帶隊的人各一句，登機以後「飛往〇〇」字卡（tests/e08_hall_unit.js）；第 7 節：出國途中的時鐘換當地時間（檔尾，tests/e08_tz_unit.js）。
   測試：node tests/vac_unit.js、node tests/vac_c16_c18_unit.js */
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
  S.yearsOf=A=>A.years||(A.year?[A.year]:['Y1']);   /* 每張卡第一次開放的那一年（AA_199 7-5 每年都開；第二次以後照 AA_264 的 rep、late、again，C02、C03、C08、C09 都開三年——AA_355 1-5）*/
  S.dayOf=function(yk,season,mmdd){ const n=+String(yk).slice(1), m=+mmdd.slice(0,2), y=season==='summer'?2025+n:(m>=7?2024+n:2025+n); return DK(y+'-'+mmdd); };
  S.inst=function(id,yk){ const A0=Dt()&&Dt().A[id]; if(!A0) return null; const A=A0.byYear&&A0.byYear[yk]?Object.assign({},A0,A0.byYear[yk]):A0;   /* byYear：那一年的日子不一樣（C04 每個假期的考試日不同，AA_199 7-2）*/ if(!S.yearsOf(A).includes(yk)) return null; const from=S.dayOf(yk,A.season,A.days[0]), to=S.dayOf(yk,A.season,A.days[1]); if(from==null||to==null) return null;
    return {id,yk,key:id+'@'+yk,A,from,to,first:S.yearsOf(A)[0]===yk}; };
  /* 第幾次參加（AA_264：照實際參加的次數，不看年級）：報名的時候記下來 */
  const ser=id=>{ const A=Dt()&&Dt().A[id]; return (A&&A.series)||id; };   /* series：寒暑假分兩張卡、算同一系列的第幾次（C04 和 C04W：補習每個假期都算）*/
  S.nth=function(G,I){ const V=S.rec(G); if(V.nth&&V.nth[I.key]) return V.nth[I.key]; let n=1; for(const k in V.reg) if(k!==I.key&&ser(k.split('@')[0])===ser(I.id)&&V.reg[k]==='done') n++; return n; };
  /* 人在國外的期間不能報（AA_264 第 0 節：日本路線 2/20～8/5、美國路線 8/2～12/23）*/
  S.blocked=function(G,I){ if(typeof STORY==='undefined'||!STORY.movedOut) return false; const out=d=>{ const g=Object.assign({},G,{day:d}); return STORY.movedOut(g)||STORY.abroad(g); };
    for(let d=I.from;d<=I.to;d++) if(out(d)) return true;
    if(I.A.blockPre) for(const p of (I.A.pre||[])){ if(p.afterSignup!=null) continue; const d=S.preDay(I,p); if(d!=null&&out(d)) return true; }   /* 面試人要到（C18：美國路線大四上 8/2～12/23 人在美國，寒假團的面試在那時候）*/
    return false; };
  /* ---- 第三批（C16～C18）用的：這一次報名自己的「寫了申請表」「去了面試」（不跨年份）、報名門檻（C17 要有英文檢定成績）---- */
  S.okI=(G,I,tag)=>{ const V=S.rec(G); return !!(V.ok&&V.ok[I.key+':'+tag]!=null); };
  S.markI=(G,I,tag)=>{ const V=S.rec(G); (V.ok||(V.ok={}))[I.key+':'+tag]=G.day; };
  /* 英文檢定成績：C04 考完、成績出來了（S.phone 的「成績出來了。」那一刻記在 V.score）*/
  S.engScore=G=>{ const SC=(G.vac&&G.vac.score)||{}; return Object.keys(SC).some(k=>SC[k]&&(SC[k].day==null||SC[k].day<=G.day)); };
  S.gate=function(G,I){ const g=I&&I.A&&I.A.gate; if(!g) return null; if(g.engScore&&!S.engScore(G)) return g.narr||''; return null; };   /* null＝可以報；字串＝不能報的那句旁白 */
  /* 那一學期有被當的科目（C16「看成績」，AA_242 12-1 第 4 點）：期末考考了、0 分（答對 0 題＝被當，AA_126 1-2、classes3d.js S.scoreOf）。未開考（題庫不足）、沒有紀錄的不算 */
  S.failedTerm=function(G,termId){ const E=G&&G.courses&&G.courses.exam; if(!E||typeof E!=='object'||!termId) return false;
    return Object.keys(E).some(k=>k.indexOf(termId+':')===0&&/:final$/.test(k)&&!!E[k]&&E[k].status==='done'&&E[k].score===0); };
  /* 第二次以後的關鍵事件（AA_264 第 1、2 節）：日誌一行；C02 第二次第一天＝小隊長三句；大二以後才第一次參加的 C02＝換人版。null＝那一場不演 */
  S.repKey=function(G,I,i,k){ const R=I.A.rep; if(!R) return k; const n=S.nth(G,I), D=x=>x==null?null:{bg:k&&k.bg||null,lines:[typeof x==='string'?{narr:x}:x]};   /* 字串＝旁白一句；物件＝別人說的一句（C17 第二次最後一天是馮律師，AA_242 12-3）*/
    if(n>=2){ if(n===2&&R.leader&&i===0) return Object.assign({bg:k&&k.bg},R.leader); const L=(n>=3&&R.keys3)?R.keys3:R.keys2; let r=L?D(L[i]):k;
      if(L&&k&&k.again) r=Object.assign({},r||{bg:k.bg||null,lines:[]},{after:k.again});   /* again：那一句後面照演的（C16 大三第二次，語彤那兩段；AA_242 12-1 第 1 點）*/
      return r; }
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
  /* 這一趟同行的人（AA_369 H4）：出國期間的訊息、回國重逢、回來後第一次在 3D 遇到的招呼，都不算他們（人就在旁邊）。
     C13 自己排的 I.with，加上活動卡的 mates（陣列＝每年；{年份:[…]}＝那一年才同行：C11、C12 的以安只有大二）*/
  S.mates=function(I){ const out=new Set(); if(I&&I.with) out.add(I.with); const m=I&&I.A&&I.A.mates; if(Array.isArray(m)) m.forEach(x=>out.add(x)); else if(m&&I.yk&&Array.isArray(m[I.yk])) m[I.yk].forEach(x=>out.add(x)); return out; };
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
  /* 上班的日子（A.work：C16、C17）：起訖之間的平日、國定假日不上班 */
  S.workDays=I=>S.daysOf(I).filter(d=>!(typeof CALENDAR!=='undefined'&&CALENDAR.holiday&&CALENDAR.holiday(d)));
  const keysOn=(I,d)=>(I.A.keys||[]).filter(k=>S.dayOf(I.yk,I.A.season,k.day)===d).sort((a,b)=>a.h-b.h);   /* 那一天的關鍵事件（照時間）*/
  S.conflicts=function(G,I){ const mine=new Set(S.daysOf(I)), away=I.A.trip||I.A.place.kind!=='taipei', out=[];
    for(const J of S.all()){ if(J.key===I.key||!['yes','done'].includes(S.state(G,J.key))) continue; const awayJ=J.A.trip||J.A.place.kind!=='taipei';
      for(const d of S.daysOf(J)) if(mine.has(d)&&(away||awayJ||J.A.slot===I.A.slot)){ out.push({key:J.key,title:J.A.title,day:d}); } }
    if(typeof DATE!=='undefined'&&DATE.tripTitle) for(const t of (G.trips||[])){ if(t.status!=='booked'&&t.status!=='going') continue;   /* 已經約好的校外約會（大多在外縣市＝人不在臺北；兩天一夜兩天都算）：照樣寫出來、不擋（AA_199 3-2，BUG-DATE-OVERLAP-1021）*/
      for(let d=t.day;d<=t.day+(t.kind==='overnight'?(t.nights||1):0);d++) if(mine.has(d)) out.push({key:'date_'+t.trip,title:DATE.tripTitle(t),day:d}); }
    return out; };
  const dl=d=>{ if(typeof CALENDAR==='undefined') return String(d); const x=CALENDAR.dateOf(d); return x.m+'/'+x.d; };
  /* 報名：記下來、家裡出錢的家人群組一句、排關鍵事件（出遊）*/
  S.signup=function(G,key,how){ const V=S.rec(G), [id,yk]=key.split('@'), I=S.inst(id,yk); if(!I) return false;
    const again=how==='again'; if(again) how='yes';   /* 去過的人公告多的那個選項（C17「寄信給馮律師」，AA_242 12-1 第 5 點）：不用交履歷、不面試（英文檢定去年就有了，不看門檻）*/
    if(!again&&(how||'yes')==='yes'&&S.gate(G,I)!=null) return false;   /* 門檻不到（C17 沒有英文檢定成績）：不能報 */ V.reg[key]=how||'yes'; if(V.reg[key]!=='yes') return true; (V.when||(V.when={}))[key]=G.day; (V.nth||(V.nth={}))[key]=S.nth(G,I);
    if(again){ S.markI(G,I,'AGAIN'); (I.A.pre||[]).forEach((p,i)=>{ if(!p.setI) return; S.markI(G,I,p.setI); const q=typeof OUT!=='undefined'&&OUT.get?OUT.get(G,'vac_'+key+'_pre'+i):null; if(q&&q.state==='planned') q.state='cancelled'; }); }   /* 面試那一格算數；先在行事曆報名、排好的面試取消 */
    const s=I.A.signup||{}; if(s.flag) G.flags[s.flag]=true;
    if(s.famMsgs&&typeof PHONE!=='undefined'){ PHONE.join(G,'home','家人'); const M=s.famMsgs.map(t=>({th:'g:home',from:'mom',name:'媽媽',text:t})); if(s.famReply) M[M.length-1].ask={id:'vac_famr_'+key,opts:[{t:s.famReply.t,say:s.famReply.say.map(t=>({th:'g:home',from:'mom',name:'媽媽',text:t}))}]}; PHONE.at(G,G.day,Math.max(21,G.hour),M,'vac_fam_'+key); }   /* 當晚 21:00 家人群組（C04：AA_241 第 10 節；回不回都可以）*/
    else if(s.yes&&s.yes.family&&typeof PHONE!=='undefined'){ PHONE.join(G,'home','家人'); PHONE.at(G,G.day,G.hour,[{th:'g:home',from:'mom',name:'媽媽',text:s.yes.family}],'vac_fam_'+key); }   /* AA_199 3-7：家裡出的，家人群組一句 */
    S.plan(G,I); return true; };
  /* 學期裡的前置事件（說明會、面試、系辦、行前訓練）：{term:'S2',week,wd} 或 {day:'MM-DD'}；報名以後排出遊 */
  /* p.afterClass：那個時間有課就排到下課以後、17:00 以前第一個空的時間（C10 學分採計 14:00，AA 10-24 9a033f397）*/
  S.freeAfterClass=function(G,d,p){ let h=p.h; if(!p.afterClass||typeof CLS==='undefined'||!CLS.dayItems) return h;
    try{ const L=CLS.dayItems(Object.assign({},G,{day:d})).slice().sort((a,b)=>a.t0-b.t0); for(const q of L){ if(q.t0<h+0.5&&q.t1>h) h=q.t1; } }catch(e){ return p.h; }
    return h<=17-0.5?h:p.h; };
  S.preDay=function(I,p,G){ if(p.afterSignup!=null){ const w=G&&G.vac&&G.vac.when&&G.vac.when[I.key]; return w!=null?w+p.afterSignup:null; } return p.day?S.dayOf(I.yk,I.A.season,p.day):termDay((p.yk?p.yk(I.yk):I.yk)+p.term,p.week,p.wd); };
  /* 日期字串「6/13（六）10:00」（錄取通知的行前說明會）*/
  S.when=function(I,p){ const d=S.preDay(I,p); if(d==null||typeof CALENDAR==='undefined') return ''; const x=CALENDAR.dateOf(d), hh=Math.floor(p.h), mm=Math.round((p.h-hh)*60); return x.m+'/'+x.d+'（'+'日一二三四五六'[x.wd%7]+'）'+hh+':'+String(mm).padStart(2,'0'); };
  S.plan=function(G,I){ if(typeof OUT==='undefined') return; const A=I.A;
    (A.pre||[]).forEach((p,i)=>{ if(S.repLine(G,I,'pre',i)===null){ if(p.set) Object.assign(G.flags,p.set); if(p.setI) S.markI(G,I,p.setI); return; }   /* 第二次以後不演的前置（家睿直接邀、不用面試）*/ if(p.setI&&S.okI(G,I,p.setI)) return;   /* 這一格已經算數（C17「寄信給馮律師」：不面試）*/ const d=S.preDay(I,p,G); if(d!=null&&(d>G.day||(d===G.day&&G.hour<p.h))) OUT.plan(G,{id:'vac_'+I.key+'_pre'+i,ev:'ev_vac_key',day:d,h:p.h,late:0.25,place:p.place,title:A.title+'：'+p.title,travel:p.travel||'走過去約 10 分鐘',travelH:p.travelH!=null?p.travelH:1/6,vac:{key:I.key,k:'pre'+i}}); });   /* p.travel：不在學校的（C17 的面試在事務所）*/
    if(A.work){ const W=A.work, n2=S.nth(G,I)>=2;   /* 連續數週的平日白天（C16、C17）：每個平日一趟上班；標題寫那一天的關鍵事件（第二次以後不演，不寫）*/
      S.workDays(I).forEach((d,wi)=>{ if(d<G.day||(d===G.day&&G.hour>=W.h0)) return; const kt=n2?[]:keysOn(I,d).map(k=>k.title);
        OUT.plan(G,{id:'vac_'+I.key+'_w'+wi,ev:'ev_vac_key',day:d,h:W.h0,late:0.5,place:A.place.name,title:A.title+(kt.length?'：'+kt.join('、'):''),travel:W.travel||'捷運約 30 分鐘',travelH:W.travelH!=null?W.travelH:0.5,vac:{key:I.key,k:'w',wi}}); });
      return; }
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
        const gt=S.gate(G,I);   /* 門檻不到（C17 沒有英文檢定成績）：公告後一句旁白、不能報（AA_242 10-1）*/
        if(!I.first){ if(s.kind==='group'&&PHONE.inGroup(G,s.th.slice(2))){ const M=[Object.assign({th:s.th},s.msgs[0])]; if(I.A.rep&&I.A.rep.recruit2) M.push(Object.assign({th:s.th},I.A.rep.recruit2)); if(gt) M.push({th:'sys',text:gt});
            if(s.again&&S.nth(G,I)>=2) M[0].ask={id:tag,until:T(o.to,24),opts:[{t:s.again.t,post:false,set:{VAC_PICK:I.key+':again'},say:[]}]};   /* 去過的人多一個選項（C17「寄信給馮律師」，AA_242 12-1 第 5 點）；不是對全班說的話：不在群組留玩家的一句 */
            PHONE.at(G,o.from,o.h,M,tag); } }   /* 第二年起：同一則公告（換年份、日期），C02、C08 多一句；行事曆報名（AA_264 第 3 節）*/
        else if(s.kind==='group'){ if(!PHONE.inGroup(G,s.th.slice(2))) continue; const M=s.msgs.map(m=>Object.assign({th:s.th},m)); if(gt) M.push({th:'sys',text:gt}); else Object.assign(M[M.length-1],{ask:{id:tag,until:T(o.to,24),opts:[{t:s.yes.t,set:{VAC_PICK:I.key+':yes'},say:(s.yes.say||[]).map(x=>Object.assign({th:s.th},x))}]}}); PHONE.at(G,o.from,o.h,M,tag); }
        else if(s.kind==='dm'&&(!s.min||atLeast(s.who,s.min))&&!(typeof V6EX!=='undefined'&&V6EX.cool&&V6EX.cool(G,s.who))&&(typeof STORY==='undefined'||!STORY.knows||STORY.knows(s.who,G)||(typeof SOCIAL!=='undefined'&&SOCIAL.has&&SOCIAL.has(s.who,'FIRST_MET')))){ const th='p:'+s.who, M=s.msgs.map(t=>({th,from:s.who,text:t}));
          const opts=[{t:s.yes.t,set:{VAC_PICK:I.key+':yes'},say:(s.yes.say||[]).map(x=>Object.assign({th},x))}]; if(s.later) opts.push({t:s.later.t,set:{VAC_PICK:I.key+':later'},say:s.later.say.map(x=>Object.assign({th},x))}); if(s.no) opts.push({t:s.no.t,set:{VAC_PICK:I.key+':no'},say:s.no.say.map(x=>Object.assign({th},x))});
          Object.assign(M[M.length-1],{ask:{id:tag,until:T(o.to,24),opts}}); PHONE.at(G,o.from,o.h,M,tag); } }   /* 分開以後一個學期她不主動約（V6EX.cool，AA_434 第 4 節第 3 點）：她私訊約的那一種先不傳；冷卻過了、報名還沒截止就照常傳 */
      /* 沒參加（沒報名、或報了沒去）：卡片的 miss */
      const al=I.A.alt; if(al&&(!al.if||al.if(G))){ const ad=S.dayOf(I.yk,I.A.season,al.day), tg3='vac_alt_'+I.key, ah=al.h+(ad!=null&&typeof STORY!=='undefined'&&STORY.tzOffset?(STORY.tzOffset(G,ad)||0):0); if(ad!=null&&now>=T(ad,ah)&&G.day<=ad+2&&!PHONE.sent(G,tg3)&&(!al.min||atLeast(al.who,al.min))) PHONE.at(G,ad,ah,al.msgs.map(t=>({th:'p:'+al.who,from:al.who,text:t})),tg3); }   /* ah：人在國外＝當地時間（日本路線 7/5 臺灣 21:00＝日本 22:00；AA_341 J-S13）*/   /* 人不在、收不到邀約的版本（子晴曼谷：日本路線）*/
      if(!I.first&&I.A.rep&&I.A.rep.late&&I.A.rep.late.miss){ const md=S.dayOf(I.yk,I.A.season,I.A.days[1]), st=V.reg[I.key], tg2='vac_miss_'+I.key, M=I.A.rep.late.miss; if(md!=null&&now>=T(md,21)&&G.day<=md+3&&st!=='done'&&st!=='yes'&&!S.blocked(G,I)&&!PHONE.sent(G,tg2)&&PHONE.inGroup(G,M.th.slice(2))) PHONE.at(G,md,21,[Object.assign({},M)],tg2); }   /* 大二起沒去：系學會在全班群組貼大合照（AA_264 1-2）。人在國外的期間（S.blocked）沒有（AA_341 J-S14：日本路線 7/5 的營隊照片）*/
      const ms=I.first&&I.A.miss; if(ms&&!(ms.unless&&ms.unless(G))){ const md=S.dayOf(I.yk,I.A.season,ms.day), st=V.reg[I.key]; if(md!=null&&now>=T(md,ms.h)&&G.day<=md+3&&st!=='done'&&st!=='yes'||(md!=null&&st==='missed'&&now>=T(md,ms.h)&&G.day<=md+3)){ const tag2='vac_miss_'+I.key; if(!PHONE.sent(G,tag2)&&(!ms.min||atLeast(ms.who,ms.min))) PHONE.at(G,md,ms.h,ms.msgs.map(t=>({th:'p:'+ms.who,from:ms.who,text:t})),tag2); } }
      /* 只在行事曆報名的（board）：開放的那一刻提醒一次（系統字）*/
      if(s.kind==='board'&&now>=T(o.from,o.h)&&G.day<=o.to&&!V.reg[I.key]&&!(V.open||(V.open={}))[I.key]){ V.open[I.key]=G.day; if(GM.toast) GM.toast('手機｜假期行事曆：「'+I.A.title+'」開放報名到 '+dl(o.to),4200); }
      /* 錄取（AA_242 0-1）：有甄選的照公布日；直接報名的報名隔天 12:00。系統通知＋家人群組媽媽兩句 */
      const sel=I.A.select; if(sel&&V.reg[I.key]==='yes'){ const sd=sel.term?termDay(I.yk+sel.term,sel.week,sel.wd):((V.when||{})[I.key]!=null?V.when[I.key]+1:null), sh=sel.h||12, tg='vac_sel_'+I.key;
        const lack=(sel.needI?!S.okI(G,I,sel.needI):(sel.need&&!F[sel.need]))||(!!sel.noFail&&S.failedTerm(G,I.yk+sel.noFail));   /* needI：這一次自己的申請表／面試（C16～C18）；noFail：那一學期有被當的科目（C16，AA_242 12-1 第 4 點）*/
        if(sd!=null&&now>=T(sd,sh)&&!PHONE.sent(G,tg)&&lack&&!(I.A.rep&&I.A.rep.noSelect&&S.nth(G,I)>=2)){   /* 沒錄取（BB-C 13:03）：沒寫申請資料、面試沒到 */
          const rj=sel.reject||{}, M=(rj.sys||[{text:'【通知】很遺憾，'+(sel.name||'')+'本次未能錄取。'}]).map(x=>Object.assign({th:'sys'},x)); if(!rj.noGroup&&PHONE.inGroup(G,'noodle_team')) M.push({th:'p:zhe',from:'zhe',text:'名單出來了 我看到了'},{th:'p:zhe',from:'zhe',text:I.A.season==='winter'?'沒差啦 過年比較重要':'沒差啦 暑假還很長'});   /* AA_459 第 3 節：通知帶名字（同錄取那則的 sel.name）；阿哲不在群組講（你沒在群組說過），改私訊、先說怎麼知道的（系辦貼錄取名單）；有沒有阿哲照舊看在不在麵店團 */   /* reject：C16 系辦的信、C17 事務所的信（AA_242 9-2、10-2：不用群組那句）；寒假的活動（C18W、C11）阿哲換寒假版（12-4）*/
          PHONE.at(G,sd,sh,M,tg); V.reg[I.key]='rejected'; S.drop(G,I); if(GM.toast) GM.toast('（沒上。）',3000); continue; }
        if(sd!=null&&now>=T(sd,sh)&&!PHONE.sent(G,tg)){ PHONE.join(G,'home','家人'); const fam=sel.fam||['機票多少？我轉給你','護照記得看效期'];   /* fam：錄取時家人群組換的句子（C16「兩個禮拜都要穿正式一點嗎」、C17「有錢可以領喔？」）*/
          PHONE.at(G,sd,sh,[{th:'sys',text:'【通知】恭喜錄取'+sel.name+'。'+(sel.briefAt?'行前說明會：'+S.when(I,sel.briefAt)+'。':'')}].concat(fam.map(t=>({th:'g:home',from:'mom',name:'媽媽',text:t}))),tg);
          const br=sel.brief, bd=br&&sel.briefAt?S.preDay(I,sel.briefAt):null;   /* 行前說明會（C18，AA_242 12-5）：錄取了才排；沒去照樣出發（S.missed 不動報名）*/
          if(bd!=null&&typeof OUT!=='undefined'&&(bd>G.day||(bd===G.day&&G.hour<sel.briefAt.h))) OUT.plan(G,{id:'vac_'+I.key+'_brief',ev:'ev_vac_key',day:bd,h:sel.briefAt.h,late:0.25,place:br.place,title:I.A.title+'：'+br.title,travel:'走過去約 10 分鐘',travelH:1/6,vac:{key:I.key,k:'brief'}}); } }
      /* 實習津貼（A.pay，C17）：做完的那天 18:00 以後一次入帳＝時薪 × 每天幾小時 × 去了的天數（V.work 的日子數）；記進生活費（AA_242 10-6）*/
      const py=I.A.pay; if(py&&['yes','done'].includes(V.reg[I.key])&&now>=T(I.to,I.A.work?I.A.work.h1:18)&&!(V.paid&&V.paid[I.key]!=null)){ const n=(V.work&&Array.isArray(V.work[I.key]))?V.work[I.key].length:0, amt=n*(py.hourly|0)*(py.hours||8); (V.paid||(V.paid={}))[I.key]=amt;
        if(amt>0){ if(GM.money) GM.money(amt); else G.money=(G.money|0)+amt; if(GM.toast) GM.toast('實習津貼入帳：'+amt+' 元',3600); } }
      /* 出發那天的麵店團群組（AA_242 0-2）*/
      const dp=I.A.depart; if(dp&&I.A.trip&&['yes','done'].includes(V.reg[I.key])&&PHONE.inGroup(G,'noodle_team')){ const sd=S.dayOf(I.yk,I.A.season,I.A.trip.start.day), sh=I.A.trip.start.h; if(sd!=null&&now>=T(sd,sh)&&G.day<=sd+1&&!PHONE.sent(G,'vac_dep_'+I.key)) PHONE.at(G,sd,sh,[{th:'g:noodle_team',from:'zhe',text:dp.zhe},{th:'g:noodle_team',from:'yu',text:dp.yu}],'vac_dep_'+I.key); }
      /* 回來以後（AA_242 0-3：出國回來的第一次「伴手禮咧」、第二次「這次伴手禮咧」、第三次以後貼圖）*/
      const bk=I.A.back; if(bk&&V.reg[I.key]==='done'&&PHONE.inGroup(G,'noodle_team')){ const bd=S.dayOf(I.yk,I.A.season,bk.day||I.A.days[1]); if(bd!=null&&now>=T(bd,20)&&G.day<=bd+3&&!PHONE.sent(G,'vac_back_'+I.key)){ const n=S.all().filter(J=>J.A.back&&PHONE.sent(G,'vac_back_'+J.key)).length+((V.t13||[]).filter(r=>PHONE.sent(G,'vac_back_T13#'+r.n)).length); PHONE.at(G,bd,20,[{th:'g:noodle_team',from:'zhe',text:n===0?'伴手禮咧':(n===1?'這次伴手禮咧':'（貼圖：伸出手）')}],'vac_back_'+I.key); } }
      /* 回來重逢（AA_242 8-6、BB_200 第 4 節）：交往中、她在臺北＝回國當天 21:00 她約、隔天排出遊；她不在臺北（芷若大一暑假在台中）＝先傳一句，回臺北前一天晚上再約 */
      const M2=Dt().TRIP_MSG; if(I.A.place.kind==='abroad'&&V.reg[I.key]==='done'&&M2&&M2.reunion){ const rd=I.to;
        for(const id in M2.reunion){ if(!F['dating_'+id]||S.mates(I).has(id)) continue; const R=M2.reunion[id], tg='vac_re_'+I.key+'_'+id; if(PHONE.sent(G,tg)||G.day>rd+45) continue;   /* 同行的人不約重逢（AA_369 H4）*/
          const aw=R.away&&DK(R.away.until), inv=aw!=null&&rd<=aw?aw:rd;   /* 約的那一天（回國當天，或她回臺北的前一天）*/
          if(aw!=null&&rd<=aw&&now>=T(rd,21)&&!PHONE.sent(G,tg+'_away')) PHONE.at(G,rd,21,[{th:'p:'+id,from:id,text:R.away.text}],tg+'_away');
          { const RB=M2.reunionHomeBack&&M2.reunionHomeBack[id]; if(RB&&typeof STORY!=='undefined'&&STORY.presence){ const p0=STORY.presence(id,Object.assign({},G,{day:rd})); if(!p0.here&&p0.kind==='home'){ if(now>=T(rd,21)) PHONE.at(G,rd,21,RB.map(t=>({th:'p:'+id,from:id,text:t})),tg); continue; } } }   /* AA_350 S5：以安交往中、回國那天她在老家（台中）＝那天晚上兩則，不約見面、不約下次（C08、C09、2027 C10、T02）；她回臺北那天照原本的「回臺北了。」*/
          if(typeof STORY!=='undefined'&&STORY.presence){ const pr=STORY.presence(id,Object.assign({},G,{day:inv+1})); if(!pr.here&&pr.kind!=='home') continue;   /* 她那時不在臺灣：不約 */
            const RA=M2.reunionHomeAfter&&M2.reunionHomeAfter[id], ra=RA&&DK(RA.from), rh0=M2.reunionHome&&M2.reunionHome[id], rhv=Array.isArray(rh0)?rh0:(rh0&&rh0[I.key]),
              RH=RA&&ra!=null&&rd>=ra?RA.lines:(Array.isArray(rhv)?rhv:(rhv&&rhv.lines)), rhH=rhv&&!Array.isArray(rhv)&&rhv.h!=null?rhv.h:21;   /* 沛珊放榜以後：「開學前才回台南」（AA_349 K7）；{I.key: 句子}＝只有那一趟有句子（芷若東京／京都、以安首爾，AA_369 第 7 節第 2 題）；{h, lines}＝那一則的時間（以安首爾 15:00，第 8 節第 4 題）*/
            if(!pr.here&&pr.kind==='home'){ const p0=STORY.presence(id,Object.assign({},G,{day:rd})), hd=(!p0.here&&p0.kind==='home')?rd:inv+1;   /* 回國那天她還在臺北、隔天才回老家（以安 2026 首爾 7/24 回來、她 7/25 回台中）＝她回老家那一天才傳（句子寫「我今天回台中」）*/
              if(RH&&now>=T(hd,rhH)) PHONE.at(G,hd,rhH,RH.map(t=>({th:'p:'+id,from:id,text:t})),tg); continue; } }   /* 寒暑假她在老家：只傳私訊，不排臺北見面（AA_278 第 2 節第 1 點）。
               AA_369 M3：重逢那天人在老家的一律走這一條（芷若在台中也不約 Café）；reunionHome 沒有那一趟的句子＝不傳、不約 */
          if(now>=T(inv,21)){ const ns=S.reNS(R,inv+1);   /* 見面那天她不上班（芷若 2027-06-04～09-02，AA_369 第 8 節第 8 題）：換那一句、那個時間 */
            PHONE.at(G,inv,21,(ns?ns.invite:R.invite).map(t=>({th:'p:'+id,from:id,text:t})),tg); if(typeof OUT!=='undefined') OUT.plan(G,{id:'vac_'+I.key+'_re_'+id,ev:'ev_vac_key',day:inv+1,h:ns&&ns.h!=null?ns.h:R.h,late:0.5,place:R.place,title:'重逢：'+nm(id)+'（'+R.place+'）',travel:'走過去約 15 分鐘',travelH:0.25,vac:{key:I.key,k:'re',who:id}}); } } }
      /* 子晴一天一到兩則（BB-C 13:03）：00:40 那則在當天 18:00 以前回了，23:10 再傳第二則（回的時間＝手機第一次看到回覆的那一刻）*/
      for(const z of ((V.zq2||{})[I.key]||[])){ if(z.done) continue; const m=(G.msgs||[]).find(x=>x.ask&&x.ask.id===z.tag); if(!m) continue;
        if(m.ans!=null&&z.at==null) z.at=now;
        if(z.at!=null){ z.done=true; if(z.at<=S.tw2g(G,T(z.d,18))){ const g=S.tw2g(G,T(z.d,23+10/60)), gd=Math.floor(g/24+1e-9); PHONE.at(G,gd,g-gd*24,z.texts.map(t=>({th:'p:heroine_04',from:'heroine_04',text:t})),z.tag+'_2'); } }   /* 臺灣時間 18:00／23:10（出國途中換成當地時間，S.tw2g）*/
        else if(now>S.tw2g(G,T(z.d,18))) z.done=true; }
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
  S.va10Trip=async function(GM,q){ const G=GM.G, C=Dt().VA10, d0=DK(C.from), d1=DK(C.to), F=G.flags; if(!C||d0==null) return false; const endT=T(d1,18);
    if(q) S.flyStart(GM,q,endT,C.mates||[]);   /* 香港和臺灣同一個時區（tz 0）：時鐘不變，照樣記出國途中 */
    const I={key:'VA10',with:null,A:{id:'VA10',place:{kind:'abroad'},season:'summer',trip:{sd:d0,ed:d1,start:{h:8},end:{h:18}},mates:C.mates||[]},yk:null}; S.tripMsgs(G,I);   /* mates：阿哲、Alison、柏翰（AA_369 H4）*/
    for(const id in (C.datingMsg||{})){ const m=C.datingMsg[id], d=DK(m.day); if(F['dating_'+id]&&d!=null&&typeof PHONE!=='undefined') PHONE.at(G,d,m.h,m.ms.map(t=>({th:'p:'+id,from:id,text:t})),'va10_dm_'+id); }   /* AA_369 H1：以安在京都，交往中 8/27 21:00 她私訊 */
    for(const st of C.steps){ const extra=[]; for(const id in (st.dating||{})) if(F['dating_'+id]) extra.push(...st.dating[id]); await S.jump(GM,T(d0+st.d,st.h),'香港'); await S.key(GM,{bg:null,lines:st.lines.concat(extra)},I); }
    await S.jump(GM,S.clockEnd(G,endT),'香港'); S.flyEnd(GM,q); F.BACK_FROM_VA10=G.day; return true; };
  /* ---- C01 麵店團海邊：大二～大四寒假（AA_264）。大一照 AA_204（story3d.js va03）；去過的照第 2 節（第二次、第三次以後）；大二以後才第一次去的照 AA_264 第 4 節（AA_204 第 3 節整段、換三句）---- */
  S.c01Day=function(yk){ if(typeof CALENDAR==='undefined'||!CALENDAR.termDays) return null; const r=CALENDAR.termDays(yk+'S1'); if(!r) return null;
    if(typeof HOME!=='undefined'&&HOME.breakOf){ for(let d=r.to+1;d<=r.to+7;d++){ const B=HOME.breakOf(d); if(B&&B.kind==='winter'){ for(let x=B.from+7;x<=B.from+13;x++) if(CALENDAR.dateOf(x).wd%7===1){ while(CALENDAR.holiday&&CALENDAR.holiday(x)||CALENDAR.dateOf(x).wd%7===0||CALENDAR.dateOf(x).wd%7===6) x++; return x; } break; } } }   /* 落在國定假日（大四 2029-01-01 元旦）往後挪到最近的平日 */   /* AA_275 第 3 節：寒假開始後第 8 天以後的第一個週一（不撞期末考週、不撞 12/25）；揪人＝前一個週五 */
    for(let d=r.to+1;d<=r.to+14;d++){ if(!CALENDAR.termOf(d)&&CALENDAR.dateOf(d).wd%7===1) return d; } return null; };
  S.c01Ask=d=>{ let x=d-1; while(x>d-8&&CALENDAR.dateOf(x).wd%7!==5) x--; const t=CALENDAR.dateOf(x); if((t.m===12&&t.d===31)||(t.m===1&&t.d===1)) x-=2; return x; };   /* 揪人：出遊前一個週五；那個週五是 12/31、1/1 就改前一個週三（大二 12/30、大三 12/29，AA_264 第 5 節第 2 點）*/
  const WDN='日一二三四五六', c01Title=d=>'海邊一日遊（禮拜'+WDN[CALENDAR.dateOf(d).wd%7]+' 08:50 臺北車站集合）';   /* 集合的字照實際星期幾（AA_264 第 5 節第 3 點）*/
  S.c01N=function(G){ const V=S.rec(G); return (G.flags&&G.flags.VA03_BEACH==='went'?1:0)+Object.values(V.c01||{}).filter(x=>x==='done').length; };
  S.c01Phone=function(G){ const C=Dt().C01, V=S.rec(G), F=G.flags, now=T(G.day,G.hour); if(!C||!PHONE.inGroup(G,'noodle_team')) return;
    if(typeof F.C01_PICK==='string'){ const yk=F.C01_PICK; delete F.C01_PICK; const d=S.c01Day(yk); (V.c01||(V.c01={}))[yk]='yes'; if(d!=null&&typeof OUT!=='undefined') OUT.plan(G,{id:'vac_c01_'+yk,ev:'ev_vac_key',day:d,h:8+50/60,late:0.25,place:'臺北車站',title:c01Title(d),travel:'捷運約 20 分鐘',travelH:1/3,back:'回到臺北。',vac:{key:'C01#'+yk,k:'c01'}}); }
    for(const yk of ['Y2','Y3','Y4']){ const d=S.c01Day(yk); if(d!=null) S.c01First(G,yk,d); }
    for(const yk of ['Y2','Y3','Y4']){ const d=S.c01Day(yk), tg='vac_c01ask_'+yk, da=d!=null?S.c01Ask(d):null; if(d==null||PHONE.sent(G,tg)||now<T(da,21+5/60)||G.day>=d) continue; const n=S.c01N(G); if(n<1||PHONE.sent(G,'vac_c01first_'+yk)) continue;
      const L=(CALENDAR.dateOf(d).wd%7===2&&C.askTue?C.askTue:C.ask)[n>=2?3:2], T2='g:noodle_team', M=L.map(t=>({th:T2,from:'zhe',text:t})); Object.assign(M[M.length-1],{ask:{id:tg,until:T(d,8.5),opts:[{t:C.opts[0],set:{C01_PICK:yk}},{t:C.opts[1]}]}}); PHONE.at(G,da,21+5/60,M,tg); }
    /* 阿哲每年寒假在海邊隔天回高雄（AA_264 第 5 節第 1 點）：大二的「我明天回高雄」（AA_210 1-4）改在海邊那天 21:00；tag 照舊，已經在 1/1 收到的舊存檔不重複 */
    { const d=S.c01Day('Y2'); if(d!=null&&!PHONE.sent(G,'nye_y2_zhe')&&now>=T(d,21)&&G.day<=d+1) PHONE.at(G,d,21,[{th:'g:noodle_team',from:'zhe',text:'明天回高雄 回來帶烏魚子'}],'nye_y2_zhe'); } };   /* AA_456 1-4：大二換字（接 AA_446 大二 2/20「這次帶了烏魚子 我阿嬤做的」；大三、大四在 holff3d.js）*/
  /* 大二以後才第一次去（AA_264 第 4 節，e01ee2a8；第 5 節 7fa3660d）：揪人那天（S.c01Ask）21:05 麵店團群組照 AA_204 3-1（阿哲那句換「禮拜一去海邊？過幾天我就回高雄了」，大四週二換「禮拜二…」）；
     以安：和她 FAMILIAR 以上、而且那一天她在臺北，才回、才去（VA03_AN）；我去＝那天 08:50 臺北車站（出遊 ev_va03_beach，第一句旁白每年都是「放寒假的第二個禮拜」）；當晚群組照 AA_204 */
  S.C01_NONE={Y2:['📷（大家站在防波堤上，頭髮都被吹歪）','今年的風比去年大！！','我在家看照片就好。'],Y3:['📷（沙灘上用樹枝寫的「麵店團」）','浪一下就把它沖掉了','……拍到就好。'],Y4:['📷（大家在月台上，手裡拿著熱的飲料）','最後一次寒假的海！！','下次我去。']};   /* AA_446 第 3 節：沒去海邊的那一則照年份換（Alison 兩句、芯慈一句；大一照舊在 story3d.js）*/
  S.C01F_REPLY={Y2:['又是海邊？？','好啊','一樣九點十分那班。','我一樣不去。照片記得傳。','去年那家熱豆漿還在嗎？'],Y3:['這次我要帶暖暖包','好啊','九點十分。這次不要有人遲到。','不去。我負責看照片。','我可以。這次我帶熱水。'],Y4:['大四了還去？？','……去','九點十分。我查過了，還是那班。','我在家等照片。四年都是。','我可以。幾點集合？']};   /* AA_456 1-3（企劃線 71f260ecc）：一直沒去的玩家每年都收到同一串，回覆照年份換——Alison 兩句、柏翰、芯慈、以安（以安照原本的條件才有）；阿哲那句照 C01.first；大一照舊在 story3d.js；tag 不變 */
  S.c01First=function(G,yk,d){ const V=S.rec(G), F=G.flags, now=T(G.day,G.hour), tg='vac_c01first_'+yk, TH='g:noodle_team', C=V.c01||(V.c01={});
    if(!PHONE.sent(G,tg)){ if(now<T(S.c01Ask(d),21+5/60)||G.day>=d||S.c01N(G)>=1) return;
      const pr=typeof STORY!=='undefined'&&STORY.presence?STORY.presence('heroine_01',Object.assign({},G,{day:d,hour:9})):{here:true}, an=atLeast('heroine_01','FAMILIAR')&&!!(pr.here||pr.kind==='taipei');
      const C1=Dt().C01, R=S.C01F_REPLY[yk]||S.C01F_REPLY.Y2, L=[['zhe',C1.first[CALENDAR.dateOf(d).wd%7===2?2:1],21+5/60],['yu',R[0],21.1],['yu',R[1],21.1],['classmate_bohan',R[2],21+10/60],['classmate_xinci',R[3],21.5]];
      if(an) L.push(['heroine_01',R[4],21+40/60]); F.VA03_AN=an;
      L.forEach(([from,text,h],i)=>{ const m={th:TH,from,text}; if(i===L.length-1) m.ask={id:tg,until:T(d,8.5),opts:[{t:'我去',set:{C01F_PICK:yk}},{t:'我那天不行'}]}; PHONE.at(G,S.c01Ask(d),h,[m],i===L.length-1?tg:tg+'_'+i); });
      return; }
    if(F.C01F_PICK===yk){ delete F.C01F_PICK; C[yk]='first'; if(typeof OUT!=='undefined'&&!OUT.get(G,'vac_c01_'+yk)&&G.day<=d) OUT.plan(G,{id:'vac_c01_'+yk,ev:'ev_va03_beach',day:d,h:8+50/60,late:0.25,place:'臺北車站',title:c01Title(d),travel:'捷運約 20 分鐘',travelH:1/3,back:'回到臺北。'}); }
    if(G.day===d&&G.hour>=18&&F.VA03_BEACH!=='went'&&!PHONE.sent(G,tg+'_none')) PHONE.at(G,d,18,(S.C01_NONE[yk]||S.C01_NONE.Y2).map((t,i,a)=>({th:TH,from:i<a.length-1?'yu':'classmate_xinci',text:t})),tg+'_none');
    if(C[yk]==='first'&&F.VA03_BEACH==='went'&&!PHONE.sent(G,tg+'_photo')){ const at=Math.max(T(G.day,G.hour),T(d,20)); PHONE.at(G,Math.floor(at/24),at%24,[{th:TH,from:'yu',text:'📷（海邊的合照）'},{th:TH,from:'yu',text:'五張裡最好的一張'}].concat(F.VA03_SHOE?[{th:TH,from:'zhe',text:'📷（曬在宿舍欄杆上的鞋子）'},{th:TH,from:'zhe',text:'鞋子回來了'}]:[]),tg+'_photo'); } };
  /* ---- 關鍵事件（出遊事件 ev_vac_key 的 beforeOuting）---- */
  const run=async(GM,lines)=>{ const G=GM.G; for(let x of (lines||[])){ if(typeof x==='function') x=x(G); if(x==null) continue; if(Array.isArray(x)){ await run(GM,x); continue; }
      let t=typeof x.text==='function'?x.text(G):x.text; if(typeof x==='string') await GM.say(null,x);
      else if(x.narr) await GM.say(null,x.narr); else if(x.who==='player') await GM.say({name:G.name||'祐廷'},t); else if(x.who) await GM.say({name:x.name||nm(x.who),charId:x.name?null:x.who},t); } };
  S.key=async function(GM,k,I){ const G=GM.G; if(typeof ADV!=='undefined'&&ADV.begin) ADV.begin({background:k.bg==='blur'?'blur':(k.bg&&typeof OUT!=='undefined'&&OUT.bg?OUT.bg(k.bg):'dark')});   /* 'blur'＝疊在模糊的 3D 上（E08 出境大廳裡的「出發」那一幕）*/
    await run(GM,k.lines); if(k.choice&&k.choice.length&&(!k.choiceIf||k.choiceIf(G))){ const i=await GM.choose(k.choice.map(c=>({t:c.t}))), c=k.choice[i]||k.choice[0]; await run(GM,c.say); if(c.set) Object.assign(G.flags,c.set); if(c.rel&&typeof SOCIAL!=='undefined') for(const id in c.rel) SOCIAL.adjust(id,c.rel[id]); }
    if(k.after) await run(GM,k.after); if(k.set) Object.assign(G.flags,k.set); };
  /* 跳到 t（出國、營隊、上班的那幾天：中間的日子不演，手機照時間收）。
     X58（使用者 10-18 15:4x「跳過途中收到訊息就跳出來、按了繼續跳；不要跳完才說「收到 N 則」」）：途中收到任何一則別人傳的訊息（不用回的也算）就停在那一刻——
     日期卡（月/日（星期）時:分＋地點；o.quiet 不出、同一天一小時內不再出）→ 打開手機的對話列表（「收起來」寫「跳過」，同 home3d.js 的 ffPhone）→ 關掉以後接著跳到 t；
     跳完不再說「這幾天收到 N 則」。手機開著的時候 2D 先收起來（S.away：home3d.js 的 backdrop 照樣把 3D 藏著，不露出出發前的宿舍、機場）*/
  const dayCard=G=>{ const x=CALENDAR.dateOf(G.day); return x.m+'/'+x.d+'（'+WDN[x.wd%7]+'）'; };   /* WDN：上面 C01 那一段的「日一二三四五六」*/
  const hhmm=h=>{ const m=Math.round((((h%24)+24)%24)*60); return String(Math.floor(m/60)%24).padStart(2,'0')+':'+String(m%60).padStart(2,'0'); };
  const recvN=out=>(out||[]).filter(m=>m&&m.from!=='player').length;   /* 這一批裡別人傳的（祐廷自己那一句不算「收到」；同 HOME.recvN）*/
  S.MSG_STOPS=200;   /* 一次跳過最多停幾次（每一次都要玩家按「跳過」；只是防呆：超過就照舊一路跳到 t）*/
  S.away=false;   /* 跳過途中打開手機的那一下（2D 收起來）：home3d.js 的 S.backdrop 照這個把 3D 藏著 */
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['vac3d:away']=()=>{ S.away=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  S.msgStop=async function(GM,place,o,card){ const G=GM.G;
    if(card&&!(o&&o.quiet)&&GM.titleCard&&typeof CALENDAR!=='undefined') await GM.titleCard(dayCard(G)+hhmm(G.hour),place||'',2000);
    await GM.fade(false); const A=typeof ADV!=='undefined'?ADV:null, on=!!(A&&A.active), bgm=on?A.bgMode:null;
    S.away=true; if(typeof HOME!=='undefined'&&HOME.backdrop){ try{ HOME.backdrop(G); }catch(e){} } if(on&&A.end) A.end();
    try{ const P=typeof PHONE!=='undefined'&&PHONE.pending?PHONE.pending(G):[], m=P[P.length-1]; if(typeof HOME!=='undefined'&&HOME.askSeen) HOME.askSeen(G,P);   /* 要回的：記成打開過（3D 的 STORY.phoneAuto 不再開同一則）*/
      await GM.phoneThread(m&&PHONE.th?PHONE.th(m):null,{skip:true}); }
    finally{ S.away=false; if(on&&A.begin) A.begin({background:bgm||'dark'}); }
    await GM.fade(true); };
  S.jump=async function(GM,t,place,o){ const G=GM.G, E=GM.E; if(t<=T(G.day,G.hour)) return;   /* o.quiet：不出日期卡（同一天下班，C16、C17）*/ await GM.fade(true); let tt=T(G.day,G.hour), stops=0, tc=tt;
    while(tt+1<t-1e-6){ tt+=1; let got=0; const d=Math.floor(tt/24); if(d>G.day){ G.day=d; G.weekday=typeof CALENDAR!=='undefined'?CALENDAR.dateOf(d).wd%7:(G.weekday+1)%7; G.energy=100; G.flags.companion=null; } G.hour=tt-G.day*24; if(E) E.hour=G.hour;
      if(typeof STORY!=='undefined'&&STORY.monthlyFunds){ const f=STORY.monthlyFunds(G); if(f&&GM.money) GM.money(f.amount); }
      if(typeof PHONE!=='undefined'){ try{ if(typeof STORY!=='undefined'&&STORY.phoneRules) STORY.phoneRules(GM); PHONE.tick(G,out=>{ got+=recvN(out); }); }catch(e){ console.warn('VAC jump phone',e); } }
      if(got){ if(GM.phoneBadge) GM.phoneBadge(); if(GM.phoneThread&&stops<S.MSG_STOPS){ stops++; if(GM.updateHUD) GM.updateHUD(); const card=Math.floor(tc/24)!==G.day||tt-tc>=1; await S.msgStop(GM,place,o,card); tc=tt; } } }   /* X58：停在收到的那一刻，「跳過」接著跳 */
    const d=Math.floor(t/24); if(d>G.day){ G.day=d; G.weekday=typeof CALENDAR!=='undefined'?CALENDAR.dateOf(d).wd%7:G.weekday; } G.hour=t-G.day*24; if(E) E.hour=G.hour; if(GM.updateHUD) GM.updateHUD();
    if(!(o&&o.quiet)&&GM.titleCard&&typeof CALENDAR!=='undefined') await GM.titleCard(dayCard(G),place||'',2000);
    await GM.fade(false); /* 「這幾天收到 N 則」：改成途中一則一則停下來看（X58）*/ };
  /* ---- 出國期間的訊息（AA_242 第 6、8 節；BB_200 第 2～3 節）：出發的時候一次排好（交往中、熟不熟照出發那一刻）----
     交往中：出發那天一則、每天輪播池（學姊兩天一則；第二圈只用前半）、中間那天換成「中間」那則、回來那天一則；池子的每一則有兩個回覆（她不再回，沒回不扣分）。
     朋友（FAMILIAR 以上）：整趟一兩則。柬埔寨：晚上（臺灣 22:00）以後才收得到；停電那晚（8/2）不收，隔天早上一次收到＋交往中的「怎麼沒回？」。加州：第 3 週多一次「想念」。 */
  S.tripMsgs=function(G,I){ const M=Dt()&&Dt().TRIP_MSG; if(!M||typeof PHONE==='undefined') return 0; const A=I.A, tr=A.trip, F=G.flags||{};
    const sd=tr.sd!=null?tr.sd:S.dayOf(I.yk,A.season,tr.start.day), ed=tr.ed!=null?tr.ed:S.dayOf(I.yk,A.season,tr.end.day), dark=tr.dark?S.dayOf(I.yk,A.season,tr.dark):null; let n=0;
    const wdOf=d=>typeof CALENDAR!=='undefined'?CALENDAR.dateOf(d).wd%7:0;
    const when=(d,h)=>{ if(tr.signalAfter&&d>sd&&d<ed){ if(dark!=null&&d===dark) return {d:d+1,h:8}; if(h<tr.signalAfter&&h>=7) h=tr.signalAfter; } return {d,h}; };   /* 柬埔寨：白天收不到、停電那晚隔天早上才收到 */
    const put=(id,d,h,texts,tag,ask)=>{ const w=when(d,h), th='p:'+id, ms=texts.map(t=>({th,from:id,text:t})), g=S.tw2g(G,T(w.d,w.h)), gd=Math.floor(g/24+1e-9);   /* 她們照臺灣時間傳；出國途中遊戲時鐘是當地時間（AA_478 第 7 節）：換算（S.tw2g），送到的那一刻和原本一樣 */
      if(ask){ if(ask.until!=null) ask.until=S.tw2g(G,ask.until); Object.assign(ms[ms.length-1],{ask}); } if(PHONE.at(G,gd,g-gd*24,ms,tag)) n++; };
    const tx=(x)=>typeof x==='function'?x(G):x;
    const off=(o,d)=>{ if(!o) return false; const a=DK(o[0]), b=DK(o[1]); return a!=null&&b!=null&&d>=a&&d<b; };
    const mid=Math.floor((sd+ed)/2), depH=Math.max(7,tr.start.h-1), T0='vac_tm_'+I.key+'_', mates=S.mates(I);   /* 同行的人不傳（AA_369 H4：活動卡的 mates 也算，不只 C13 的 I.with）*/
    /* 她那天在不在臺北（AA_369 M3：Café 的班、總圖的照片只在人在臺北的日子用；P.tp＝那幾則：pool 的第幾則、mid、back）*/
    const inTP=(id,d)=>{ if(typeof STORY==='undefined'||!STORY.presence) return true; const p=STORY.presence(id,Object.assign({},G,{day:d})); return p.here!==false||p.kind==='taipei'; };
    for(const id in M.gf){ if(!F['dating_'+id]||mates.has(id)) continue; const P=M.gf[id], fr=P.freq; if(off(P.off,sd)) continue;   /* 一起去的那一位不傳 */
      const at=d=>{ const h=(fr.tt&&[2,4].includes(wdOf(d)))?fr.tt:fr.h; return fr.nextDay?{d:d+1,h}:{d,h}; };
      const TP=P.tp||{}, tpSet=new Set(TP.pool||[]), alt=P.pool.map((x,i)=>i).filter(i=>!tpSet.has(i)); let j=0;   /* 不在臺北的那幾天：跳過 tp 的那幾則，照順序用其他的 */
      const ns0=TP.noShift&&DK(TP.noShift[0]), ns1=TP.noShift&&DK(TP.noShift[1]), work=d=>inTP(id,d)&&!(ns0!=null&&ns1!=null&&d>=ns0&&d<ns1);   /* 她上班的日子：在臺北、而且不在 noShift 那一段（芷若 2027-06-04～09-02 不上班，AA_369 第 8 節第 8 題）*/
      /* 麵店過年店休（noodle_closed3d.js）：講店裡生意的那幾則（shopOpen：mid、pool 的第幾則、back）不傳，換 shut 的句子（AA_369 第 7 節第 7 題、第 8 節第 5 題，套 H5 ④）。
         店休第一天＝shut.first；初一以前的店休日子＝shut.pool 照順序各一次；其他店休的日子＝池子裡不講店裡的那幾則輪流；回國那天是店休＝shut.back */
      const SO=P.shopOpen||{}, SH=P.shut||null, shut=d=>typeof NOODLE_CLOSED!=='undefined'&&!!NOODLE_CLOSED.closed&&NOODLE_CLOSED.closed(G,d);
      const soSet=new Set(SO.pool||[]), sAlt=P.pool.map((x,i)=>i).filter(i=>!soSet.has(i)), sUsed={}; let sj=0;
      const shutPick=d=>{ const W=NOODLE_CLOSED.window?NOODLE_CLOSED.window(d):null; if(W&&d===W.from&&SH.first&&!sUsed.first){ sUsed.first=true; return SH.first; }
        if(W&&d<W.from+7) for(let i=0;i<(SH.pool||[]).length;i++) if(!sUsed['p'+i]){ sUsed['p'+i]=true; return SH.pool[i]; }   /* W.from+7＝初一 */
        return sAlt.length?tx(P.pool[sAlt[(sj++)%sAlt.length]]):null; };
      put(id,sd,Math.min(tr.start.h+0.5,23),P.dep,T0+id+'_dep');
      let k=0; for(let d=sd+1;d<ed;d++){ if(fr.every&&(d-sd)%fr.every!==1%fr.every) continue; const w=at(d), away=(tpSet.size||TP.mid)&&!work(w.d), closed=!!SH&&shut(w.d);
        if(d===mid&&!(TP.mid&&away)){ if(!(SO.mid&&shut(w.d))){ put(id,w.d,w.h,P.mid,T0+id+'_mid'); continue; } if(!SH) continue; }   /* 店休那天的中間那則：有 shut＝換店休的句子（下面），沒有＝那一天不傳 */
        let idx=null, texts; if(closed){ texts=shutPick(w.d); if(!texts) continue; }
        else { if(away&&tpSet.size&&alt.length){ idx=alt[(j++)%alt.length]; } else { idx=k<8?k:(k-8)%4; k++; } texts=tx(P.pool[idx]); }
        const ask={id:T0+id+'_p'+d,until:T(w.d+1,24),opts:(closed&&SH.rep?SH.rep:P.rep).map(t=>({t,say:[]}))}; put(id,w.d,w.h,texts,T0+id+'_p'+d,ask);   /* 店休那幾天玩家能回的換 shut.rep（AA_369 第 9 節第 3 題）*/
        if(id==='heroine_04'&&w.d<ed&&idx!=null){ const V=S.rec(G), Z=(V.zq2||(V.zq2={}))[I.key]||(V.zq2[I.key]=[]); Z.push({d:w.d,tag:T0+id+'_p'+d,texts:tx(P.pool[(idx+4)%8])}); } }   /* 子晴第二則：池子另一半的那一則 */
      if(!(TP.back&&!work(ed))&&!(TP.backNext&&!inTP(id,ed+1))) put(id,ed,Math.max(8,tr.end.h-3),SH&&SO.back&&SH.back&&shut(ed)?SH.back:P.back,T0+id+'_back');   /* backNext：以安「明天見。……」限臺北＝隔天（見面那天）她在臺北才傳（AA_369 第 7 節第 7 題）；隔天她在台中＝重逢走 reunionHome（第 2 題那句、AA_350 S5 那兩則）。回國那天麵店店休＝shut.back（第 8 節第 5 題）*/
      if(dark!=null&&P.dark){ const th='p:'+id; const ask={id:T0+id+'_dark',until:T(dark+2,24),opts:M.darkRep.map(t=>({t,say:[{th,from:id,text:P.darkAns}]}))}; put(id,dark,22.5,P.dark,T0+id+'_dark',ask); }   /* 停電那晚她傳的，隔天早上才收到 */
      if(tr.missWeek&&P.miss){ const d=sd+(tr.missWeek-1)*7+2; if(d<ed) put(id,at(d).d,at(d).h+0.5,P.miss,T0+id+'_miss',{id:T0+id+'_miss',until:T(d+2,24),opts:M.missRep.map(t=>({t,say:[]}))}); } }
    const fam=id=>atLeast(id,'FAMILIAR');
    for(const id in M.friend){ if(F['dating_'+id]||!fam(id)||mates.has(id)) continue; if(M.gf[id]&&off(M.gf[id].off,sd)) continue;
      M.friend[id].forEach((f,j)=>{ if(f.only&&f.only!==A.id) return; const d=f.day==='mid'?mid:(f.day==='mid1'?mid+1:(f.day==='mid-1'?mid-1:(f.day==='end'?ed-1:sd+f.day))); const h=f.h==='dep'?depH:f.h, fd=f.nextDay?d+1:d;
        const shutF=!!f.shut&&typeof NOODLE_CLOSED!=='undefined'&&!!NOODLE_CLOSED.closed&&NOODLE_CLOSED.closed(G,fd);   /* 那天麵店過年店休：語彤朋友版的照片換 shut（AA_369 第 9 節第 3 題）*/
        put(id,fd,h,tx(shutF?f.shut:f.ms),T0+'f_'+id+'_'+j); }); }
    return n; };
  /* 回來後第一次在 3D 遇到朋友（AA_242 8-7、BB_200 第 4 節）：最近一趟出國回來 30 天內、FAMILIAR 以上、沒有交往；每個人每趟一次（story3d.js 的 talkCharacter 在閒聊前呼叫）*/
  S.backGreet=async function(GM,who,id){ const G=GM.G, M=Dt()&&Dt().TRIP_MSG, t=M&&M.backGreet&&M.backGreet[id]; if(!t||!G.flags||G.flags['dating_'+id]||!atLeast(id,'FAMILIAR')) return false;
    let best=null; for(const k in G.flags){ const m=/^BACK_FROM_(C\d+W?)$/.exec(k);   /* W：寒假團那一張（C18W）*/ if(!m||typeof G.flags[k]!=='number') continue; if(G.day>=G.flags[k]&&G.day<=G.flags[k]+30&&(!best||G.flags[k]>best.d)) best={c:m[1],d:G.flags[k]}; }
    if(!best) return false;
    { const J=S.YEARS.map(yk=>S.inst(best.c,yk)).find(I=>I&&best.d>=I.from&&best.d<=I.to+1); if(J&&S.mates(J).has(id)) return false; }   /* 同一趟一起去的人（阿凱 C05、以安大二的 C11／C12）：沒有「回來了？」（AA_369 H4；AA_242 第 8 節的重逢）*/
    const V=S.rec(G), B=V.backSeen||(V.backSeen={}), key=best.c+'@'+best.d; B[key]=B[key]||{}; if(B[key][id]) return false; B[key][id]=G.day; await GM.say(who,t); return true; };
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
  S.trip13=async function(GM,key,q){ const G=GM.G, D=TV(), V=S.rec(G), rec=(V.t13||[]).find(r=>'T13#'+r.n===key); if(!rec||!D) return false; const De=D.dest[rec.dest], place=De.name, endT=T(rec.to,18);
    if(q) S.flyStart(GM,q,endT,rec.with?[rec.with]:[]);   /* 時鐘換當地時間（TRAVEL.dest 的 tz；AA_478 第 7 節）*/
    const I={key,with:rec.with,A:{id:'T13',place:{kind:'abroad'},season:rec.season,trip:{sd:rec.from,ed:rec.to,start:{h:8},end:{h:18}}},yk:null}; S.tripMsgs(G,I);
    const mid=Math.floor((rec.from+rec.to)/2), last=rec.to-1, k=x=>typeof x==='function'?x(G):x;
    const comp=rec.with?(rec.gf?(rec.with==='heroine_02'&&rec.dest!=='hk'?D.gf[rec.with].lastNot:D.gf[rec.with].last):D.friend[rec.with]):null;
    const nth=1+V.t13.filter(r=>r!==rec&&r.done&&r.dest===rec.dest).length+(rec.dest==='jp'&&V.reg['C05@Y1']==='done'?1:0), AG=nth>=2&&D.again&&D.again[nth>=3?3:2];   /* 同一個目的地第幾次 */
    const steps=AG?[{d:rec.from,h:8.5,lines:[{narr:AG.dep}]},{d:rec.from,h:15,lines:[{narr:AG.arr}]},{d:mid,h:14,lines:[{narr:AG.mid}]},{d:last,h:20,lines:[{narr:AG.last}].concat(comp?[{who:rec.with,text:comp}]:[])}]
      :[{d:rec.from,h:15,lines:[{narr:k(De.keys[0])}]},{d:mid,h:14,lines:[{narr:k(De.keys[1])}]},{d:last,h:20,lines:[{narr:k(De.keys[2])}].concat(comp?[{who:rec.with,text:comp}]:[])}];
    if(rec.gf) steps.push({d:last,h:23,bg:'trip_hotel_twin',lines:[{narr:'（燈關了。）'}]});   /* 雙床房（BB_173 VB-12）：對話在睡前結束 */
    for(const st of steps){ await S.jump(GM,T(st.d,st.h),place); await S.key(GM,{bg:st.bg||null,lines:st.lines},I); }
    await S.jump(GM,S.clockEnd(G,endT),place); S.flyEnd(GM,q); rec.done=true; G.flags.BACK_FROM_T13=G.day;
    if(rec.gf&&typeof DATE!=='undefined'&&DATE.log){ const L=DATE.log(G,rec.with); L.count=(L.count|0)+1; if(typeof SOCIAL!=='undefined'&&SOCIAL.adjust&&DATE.GAIN) SOCIAL.adjust(rec.with,DATE.GAIN[0]); }   /* 算一次正式約會（不加倍）*/
    if(typeof PHONE!=='undefined'&&PHONE.inGroup(G,'noodle_team')){ const n=S.all().filter(J=>J.A.back&&PHONE.sent(G,'vac_back_'+J.key)).length+V.t13.filter(r=>PHONE.sent(G,'vac_back_T13#'+r.n)).length; PHONE.at(G,rec.to,20,[{th:'g:noodle_team',from:'zhe',text:n===0?'伴手禮咧':(n===1?'這次伴手禮咧':'（貼圖：伸出手）')}],'vac_back_'+key); }
    return true; };
  /* 可昕的週末視訊（BB_200 第 3 節：週六晚上；加州是臺灣週日早上 10:00）：這一版整趟演一次（第一個週末），台詞 AA_242 8-2 */
  S.videoKey=function(G,I){ const M=Dt()&&Dt().TRIP_MSG; if(!M||!(G.flags&&G.flags.dating_kexin)) return null; const A=I.A, tr=A.trip, sd=S.dayOf(I.yk,A.season,tr.start.day), ed=S.dayOf(I.yk,A.season,tr.end.day), wd=tr.videoWd!=null?tr.videoWd:6, h=tr.videoH||20;
    for(let d=sd+1;d<ed;d++){ if(typeof CALENDAR!=='undefined'&&CALENDAR.dateOf(d).wd%7===wd){ const x=CALENDAR.dateOf(d); return {day:String(x.m).padStart(2,'0')+'-'+String(x.d).padStart(2,'0'),h,at:S.tw2g(G,T(d,h)),title:'視訊',bg:null,lines:M.gf.kexin.video.map(t=>({who:'kexin',text:t}))}; } } return null; };   /* 星期、幾點是臺灣時間（可昕在臺灣）；at＝遊戲時鐘的時刻（出國途中是當地時間：加州＝當地週六 19:00，AA_478 第 7 節）*/
  /* ---- 連續數週的平日白天（C16 法扶實習、C17 律所暑期實習；AA_199 3-4、7-7「平日白天不行，晚上、週末可以」）----
     每個平日 W.h0 一趟上班（S.plan 排，vac.k＝'w'）：那一天有關鍵事件的，到那個時間演（第一次參加；第二次以後不重演，換成 rep.keys2 的一句＋again，AA_264 第 0 節第 1 點、AA_242 12-3），演完過到 W.h1 下班（不出日期卡）。
     沒有關鍵事件的上班日（第一次參加）：日誌一行（W.diary，AA_242 12-2：照順序用——去了的日子才用掉一句，沒去的那天不用；用完以後只有日期卡；W.diaryLastWeek 固定在最後一週的第一個上班日）。第二次以後沒有。
     快轉（home3d.js 的 breakNext／breakJump）：第一次參加、有關鍵事件的那幾天要停；其他平日記成去過，旁白＝那一天的日誌（S.repSkip；沒有＝''）。第二次以後的關鍵日：只有一句旁白＝不停、旁白換成那一句；
       有人說話（C17 最後一天的馮律師）或 again 有東西演（C16 大三認識語彤）＝要停（AA_275 第 1 節）。
     最後一個上班日去了＝參加過（V.reg done）；去了哪幾天記在 V.work（同一天只算一次；C17 的實習津貼照天數算、C16 的午餐 W.lunch 照天數扣）。交往中的可昕（A.kx，C17 大二暑假）：最後一天 22:00 視訊 */
  const yields=(G,L)=>(L||[]).some(x=>{ if(typeof x==='function') x=x(G); if(x==null) return false; return Array.isArray(x)?yields(G,x):true; });   /* 這幾行對這個玩家有沒有東西演（函式回 null＝沒有）*/
  S.hasLines=(G,k)=>!!k&&(yields(G,k.lines)||(!!k.choice&&k.choice.length>0&&(!k.choiceIf||!!k.choiceIf(G)))||yields(G,k.after));
  S.workLine=function(G,I,d){ const W=I.A.work||{}, L=W.diary; if(!L||S.nth(G,I)>=2||keysOn(I,d).length) return null; const days=S.workDays(I);
    let lw=null; if(W.diaryLastWeek&&days.length&&typeof CALENDAR!=='undefined'){ const last=days[days.length-1], mon=last-(CALENDAR.dateOf(last).wd-1); lw=days.find(x=>x>=mon); }   /* 最後一週（最後一個上班日那一週）的第一個上班日 */
    if(d===lw) return W.diaryLastWeek;
    const V=S.rec(G), went=(V.work&&Array.isArray(V.work[I.key]))?V.work[I.key]:[], n=went.filter(x=>x<d&&x!==lw&&!keysOn(I,x).length).length;   /* 這一天以前去了幾個沒有關鍵事件的上班日＝用掉幾句 */
    return n<L.length?L[n]:null; };
  S.workSkip=function(G,I,q){ const ks=keysOn(I,q.day);
    if(S.nth(G,I)>=2){ let line=''; for(const k of ks){ const kk=S.repKey(G,I,(I.A.keys||[]).indexOf(k),k); if(!kk) continue; const one=kk.lines&&kk.lines.length===1&&kk.lines[0].narr&&!kk.choice;
        if(!one||yields(G,kk.after)) return null; line=kk.lines[0].narr; } return line; }
    return ks.length?null:(S.workLine(G,I,q.day)||''); };
  S.workDone=function(G,I,q,GM){ const V=S.rec(G), W=V.work||(V.work={}), A=Array.isArray(W[I.key])?W[I.key]:(W[I.key]=[]);
    if(!A.includes(q.day)){ A.push(q.day); const c=I.A.work&&I.A.work.lunch; if(c){ if(GM&&GM.money) GM.money(-c); else G.money=(G.money|0)-c; } }   /* 去了的日子（同一天只算一次）；C16 午餐每天 −100（AA_242 12-1）*/ const L=S.workDays(I); if(q.day!==L[L.length-1]) return;
    V.reg[I.key]='done'; V.seen[I.id]=true;
    const kx=I.A.kx; if(kx&&kx.yk===I.yk&&G.flags&&G.flags.dating_kexin&&S.nth(G,I)<2&&typeof OUT!=='undefined')
      OUT.plan(G,{id:'vac_'+I.key+'_kx',ev:'ev_vac_key',day:q.day,h:kx.h,late:0.5,place:'視訊',verb:'接起來',no:'今天先不要',title:kx.title||'視訊',travel:'',travelH:0,back:'視訊結束。',vac:{key:I.key,k:'kx'}}); };
  S.workDay=async function(GM,I,q){ const G=GM.G, A=I.A, W=A.work||{h1:18}, d=q.day, n2=S.nth(G,I)>=2, ks=keysOn(I,d);
    if(!ks.length){ const l=S.workLine(G,I,d); if(l) await S.key(GM,{bg:(A.keys&&A.keys[0]&&A.keys[0].bg)||null,lines:[{narr:l}]},I); }   /* 沒有關鍵事件的上班日：日誌一行（AA_242 12-2）*/
    for(const k of ks){ const kk=n2?S.repKey(G,I,(A.keys||[]).indexOf(k),k):k; if(!kk) continue; if(T(d,k.h)>T(G.day,G.hour)+1e-6) await S.jump(GM,T(d,k.h),k.place||A.place.name); await S.key(GM,kk,I); }
    S.workDone(G,I,q,GM); if(T(d,W.h1)>T(G.day,G.hour)+1e-6) await S.jump(GM,T(d,W.h1),A.place.name,{quiet:true}); return true; };
  /* AA_275 第 1 節：快轉跳過的日子裡有已報名的活動——第一次參加的照常停下來演；第二次以後、那一場只有一行（AA_264 的卡）的，快轉不停，
     那一次跳過的旁白換成那一句（home3d.js 的 breakNext／breakJump）。repSkip 回傳那一句（不是就 null）；repDone 照 S.outing 記成去過 */
  S.repSkip=function(G,q){ const v=q&&q.vac; if(!v||typeof v.key!=='string'||!/@/.test(v.key)) return null; const [id,yk]=v.key.split('@'), I=S.inst(id,yk); if(!I) return null;
    if(v.k==='w') return S.workSkip(G,I,q);   /* 上班日（C16、C17）：沒有關鍵事件的那幾天＝那一天的日誌或 ''（不停、記成去過）；第二次以後的關鍵日＝那一句（有人說話、語彤那段＝null 要停）*/
    if(typeof v.k==='number'){ const k0=(I.A.keys||[])[v.k], kk0=k0?S.repKey(G,I,v.k,k0):null; if(kk0&&!S.hasLines(G,kk0)) return ''; }   /* 那一年什麼都不演的那一場（C03 大三的小考、最後一堂：以安不在，AA_369 M4）：不停、記成去過 */
    if(S.nth(G,I)<2) return null;
    if(typeof v.k==='number'){ const k=(I.A.keys||[])[v.k], kk=k?S.repKey(G,I,v.k,k):null; return kk&&kk.lines&&kk.lines.length===1&&kk.lines[0].narr&&!kk.choice&&!yields(G,kk.after)?kk.lines[0].narr:null; }
    if(v.k==='prep'||v.k==='post'){ const r=S.repLine(G,I,v.k); return typeof r==='string'?r:null; }
    if(/^pre\d+$/.test(String(v.k))){ const r=S.repLine(G,I,'pre',+String(v.k).slice(3)); return typeof r==='string'?r:null; }
    return null; };
  S.repDone=function(G,q){ const v=q.vac, [id,yk]=v.key.split('@'), I=S.inst(id,yk), V=S.rec(G); q.state='done'; if(!I) return;
    if(v.k==='w'){ S.workDone(G,I,q); return; }
    if(typeof v.k==='number'){ (V.att||(V.att={}))[I.key]=(V.att[I.key]|0)+1; if(v.k===(I.A.keys.length-1)){ V.reg[I.key]='done'; V.seen[id]=true; } }
    if(/^pre\d+$/.test(String(v.k))){ const p=(I.A.pre||[])[+String(v.k).slice(3)]; if(p&&p.set) Object.assign(G.flags,p.set); if(p&&p.setI) S.markI(G,I,p.setI); } };
  S.outing=async function(GM,q){ const G=GM.G, v=q&&q.vac; if(!v) return false; if(/^T13#/.test(v.key)) return S.trip13(GM,v.key,q); if(v.key==='VA10') return S.va10Trip(GM,q);
    if(/^C01#/.test(v.key)){ const yk=v.key.slice(4), V=S.rec(G), n=S.c01N(G)+1, L=Dt().C01.diary[n>=3?3:2]; const pts=[[8+50/60],[12],[18]]; for(let i=0;i<3;i++){ if(i) await S.jump(GM,T(G.day,pts[i][0]),'海邊'); await S.key(GM,{bg:null,lines:[{narr:L[i]}]},null); } (V.c01||(V.c01={}))[yk]='done'; return true; } const [id,yk]=v.key.split('@'), I=S.inst(id,yk); if(!I) return false; const A=I.A, V=S.rec(G);
    if(v.k==='prep'){ const rl=S.repLine(G,I,'prep'); await S.key(GM,rl!==undefined?{bg:A.prep.bg,lines:[{narr:rl}]}:Object.assign({bg:A.prep.bg},A.prep),I); return true; }
    if(/^pre\d+$/.test(String(v.k))){ const pi=+String(v.k).slice(3), p=(A.pre||[])[pi], rl=S.repLine(G,I,'pre',pi); if(p&&typeof rl==='string'){ await S.key(GM,{bg:p.bg,lines:[{narr:rl}]},I); if(p.set) Object.assign(G.flags,p.set); if(p.setI) S.markI(G,I,p.setI); return true; } if(p){ if(p.lines&&p.lines.length) await S.key(GM,p,I); else if(GM.toast) GM.toast(p.title+'（'+(p.advance||1)+' 小時）',2600); if(p.advance&&GM.advance) GM.advance(p.advance); if(p.set) Object.assign(G.flags,p.set); if(p.setI) S.markI(G,I,p.setI); } return true; }
    if(v.k==='w') return S.workDay(GM,I,q);   /* 上班日（C16、C17）*/
    if(v.k==='brief'){ const b=A.select&&A.select.brief; if(b) await S.key(GM,{bg:b.bg,lines:b.lines.concat(S.nth(G,I)===1&&b.first?b.first:[])},I); return true; }   /* C18 行前說明會（AA_242 12-5）：第一次參加的多三行 */
    if(v.k==='kx'){ if(A.kx) await S.key(GM,A.kx,I); return true; }   /* 可昕的視訊（C17 最後一天 22:00，AA_242 10-6）*/
    if(v.k==='re'){ const R=Dt().TRIP_MSG.reunion[v.who]; if(R){ const ns=S.reNS(R,q.day); await S.key(GM,{bg:R.bg,lines:(ns&&ns.lines)||R.lines},I); G.flags['REUNION_'+id]=true; } return true; }   /* 她不上班的那段（芷若 2027-06-04～09-02）：noShift 的台詞（AA_369 第 9 節第 2 題）*/
    if(v.k==='trip'){ const abroad=A.place.kind==='abroad', ed=S.dayOf(I.yk,A.season,A.trip.end.day), endT=T(ed,A.trip.end.h);   /* endT：回到臺灣的那一刻（臺灣時間）*/
      if(abroad){ S.flyStart(GM,q,endT,[...S.mates(I)]); S.tripMsgs(G,I); }   /* 出國：時鐘換當地時間（AA_478 第 7 節），之後才排訊息（照臺灣時間排的換算成當地）*/
      const at=k=>k.at!=null?k.at:T(S.dayOf(I.yk,A.season,k.day),k.h);   /* 關鍵事件的 day／h 是當地時間（遊戲時鐘）；可昕的視訊 at＝換算過的 */
      const K=(A.keys||[]).slice(); if(abroad){ const vk=S.videoKey(G,I); if(vk) K.push(vk); } K.sort((a,b)=>at(a)-at(b));
      for(const k of K){ if(k.hall&&q.airHall) continue;   /* 進出境大廳就演過了（E08，AA_478 第 2 節：C05、T02、C08 的「出發」）*/ const i=(A.keys||[]).indexOf(k), kk=i>=0?S.repKey(G,I,i,k):k; await S.jump(GM,at(k),A.trip.placeName); if(kk) await S.key(GM,kk,I); }
      await S.jump(GM,S.clockEnd(G,endT),A.trip.placeName); S.flyEnd(GM,q);   /* 最後一張日期卡是當地時間；回到臺灣那一刻換回臺灣時間 */
      V.reg[I.key]='done'; V.seen[id]=true; if(abroad) G.flags['BACK_FROM_'+id]=G.day;   /* 回來以後第一次在 3D 遇到的招呼（BB_200 第 4 節、AA_242 8-7）*/
      if(A.trip.endLines) await run(GM,A.trip.endLines);
      if(A.post&&typeof OUT!=='undefined'&&(!A.post.if||G.flags[A.post.if])){ const p=A.post, d=S.preDay(I,p,G); if(d!=null) OUT.plan(G,{id:'vac_'+I.key+'_post',ev:'ev_vac_key',day:d,h:S.freeAfterClass(G,d,p),late:0.25,place:p.place,title:A.title+'：'+p.title,travel:'走過去約 10 分鐘',travelH:1/6,vac:{key:I.key,k:'post'}}); }
      return true; }
    if(v.k==='post'){ const rl=S.repLine(G,I,'post'); if(A.post) await S.key(GM,typeof rl==='string'?{bg:A.post.bg,lines:[{narr:rl}]}:A.post,I); return true; }
    const k=(A.keys||[])[v.k]; if(k){ const kk=S.repKey(G,I,v.k,k); if(kk){ if(S.hasLines(G,kk)) await S.key(GM,kk,I); else if(kk.set) Object.assign(G.flags,kk.set); } (V.att||(V.att={}))[I.key]=(V.att[I.key]|0)+1;   /* hasLines：那一年沒有句子的那一場不開畫面（C03 大三：以安不在，AA_369 M4）；旗標照記 */   /* 去了幾場（C04 的分數照這個算）*/ if(v.k===(A.keys.length-1)){ V.reg[I.key]='done'; V.seen[id]=true; } } return true; };
  S.missed=function(GM,q){ const G=GM.G, v=q&&q.vac; if(!v) return; const V=S.rec(G); if(v.k==='trip'||v.k===0) V.reg[v.key]='missed';
    if(v.k==='re'&&typeof PHONE!=='undefined'){ const R=Dt().TRIP_MSG.reunion[v.who]; if(R){ const ns=S.reNS(R,q.day); PHONE.at(G,q.day+1,12,((ns&&ns.miss)||R.miss).map(t=>({th:'p:'+v.who,from:v.who,text:t})),'vac_remiss_'+v.key+'_'+v.who); } } };   /* 重逢沒到：隔天她傳一則（AA_242 8-6）；她不上班的那段＝noShift 的那句（AA_369 第 9 節第 2 題）*/
  /* 重逢那天在她不上班的那一段（reunion 的 noShift：芷若 2027-06-04～09-02，含頭尾）＝那一段的設定（invite、h、lines、miss），不是＝null */
  S.reNS=function(R,d){ const NS=R&&R.noShift, n0=NS&&DK(NS.from), n1=NS&&DK(NS.to); if(n0!=null&&n1!=null&&d!=null&&d>=n0&&d<n1) return NS;
    for(const P of (R&&R.byDate)||[]){ const a=P.from?DK(P.from):null, b=P.to?DK(P.to):null; if(d!=null&&(!P.from||(a!=null&&d>=a))&&(!P.to||(b!=null&&d<b))) return P; }   /* byDate：{from?, to?（不含）, invite, h, lines?, miss?}——芷若 2027-06-04 以前的重逢「明天我十點下班。」22:00（AA_373 第 6 節第 9 題）*/
    return null; };
  /* ---- 手機「活動」頁的假期行事曆（AA_199 3-2）：報名了的、還可以報名的 ---- */
  S.html=function(G){ const esc=s=>String(s).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[ch]); const V=S.rec(G), rows=[];
    for(const I of S.all()){ const st=V.reg[I.key], o=S.signupOpen(G,I), open=o&&G.day>=o.from&&G.day<=o.to&&(!st||st==='later')&&(I.A.signup.board||I.A.signup.kind!=='dm'||!I.first||PHONE.sent(G,'vac_ask_'+I.key))&&!S.blocked(G,I), gt=open?S.gate(G,I):null;   /* gt：門檻不到（C17）＝那句旁白、沒有報名鈕 */
      if(!(st==='yes'||st==='done'||open)) continue; const when=dl(I.from)+(I.to!==I.from?'～'+dl(I.to):'')+(I.A.wd?'（每週'+I.A.wd.map(w=>'日一二三四五六'[w]).join('、')+'）':'');
      const cf=open?S.conflicts(G,I):[]; rows.push('<div class="item phrow"><div>'+esc(I.A.title)+'<div class="muted">'+esc(when)+'・'+esc(I.A.place.name)+(I.A.cost.payer==='family'?'・家裡出':'')+(I.A.cost.note?'・'+esc(I.A.cost.note):'')+(st==='done'?'・參加過':'')+(gt?'・'+esc(gt):'')+(cf.length?'・會撞到：'+esc(cf.map(c=>c.title+' '+dl(c.day)).slice(0,3).join('、')):'')+'</div></div>'+(open&&gt==null?'<button class="btn pri" data-vac="'+esc(I.key)+'">報名</button>':'')+'</div>'); }
    for(const r of (V.t13||[])){ const De=TV()&&TV().dest[r.dest]; if(!De) continue; rows.push('<div class="item phrow"><div>出國旅遊：'+esc(De.name)+(r.with?'（和'+esc(nm(r.with))+'）':'')+'<div class="muted">'+esc(dl(r.from)+'～'+dl(r.to))+(r.done?'・去過':'')+'</div></div></div>'); }
    if(TV()&&S.nextBreak(G)) rows.push('<div class="item phrow"><div>出國旅遊<div class="muted">自己排：目的地、和誰、幾天</div></div><button class="btn" data-vac13="1">安排</button></div>');
    return rows.length?'<div class="item"><b>假期行事曆</b></div>'+rows.join(''):''; };
  /* ===== E08：寒暑假出國從 3D 的出境大廳出發（使用者 10-16 21:49「3d做機場 旅館 街景 這種都我給妳CG」、10-17 00:0x「機場的也是阿」；src/exchange3d.js 的 EXCH.airGo）=====
     出國的那一趟（出國活動 trip：C05、T02、T03、C08～C12、C18／C18W；C13 自己排的出國旅遊 T13#；VA10 麵店團香港）時間到了「出發」（3D 的出發選單、放假住家裡的「出發」）：
     原本那一張字卡（標題＋「去機場 約 1 小時」）→ 3D 出境大廳（一起出發的人跟在旁邊）→ 走到安檢入口「登機」（或進大廳一小時以後自動登機）
     → 原本的整趟照舊演（OUT.go：中間的日子 S.jump、關鍵事件、台詞都沒改）→ 演完回到出發前的地方（宿舍等；放假住家裡的＝回臺北的家）。
     存檔：那一趟出遊 q.state＝'airport'（在大廳等登機：OUT 不會再問「出發」、不會算沒去）、q.airFrom（出發前在哪裡）、q.airHome（從家裡出發）、q.airDone（登機了）；G.flags.AIR_DEP（EXCH）。舊存檔都沒有＝照舊。
     進大廳就演：C05、T02、C08 的「出發」那一幕（關鍵事件的 hall:true，AA_478 第 2 節；S.airHallScene）、T03 子晴和阿凱各一句（hallLines，第 3 節；T02 方奕廷兩句接在「出發」後面）；
     其他（C09～C12、C18、VA10、C13）照舊只跟著走、不加話。C10 的那一場改成「抵達」、留在下飛機以後（資料）。
     登機以後：「飛往〇〇」字卡（AA_478 第 1 節、1-1：S.flyCard，資料在 vac_activities.js 的 fly）→ 深色底（人在飛機上，不露出出境大廳）→ 第一張日期卡。台詞沒有新寫的（AA 定）。*/
  S.abroadTrip=function(q){ const v=q&&q.vac; if(!v||typeof v.key!=='string') return false; if(/^T13#/.test(v.key)||v.key==='VA10') return true;
    if(v.k!=='trip'||!/@/.test(v.key)) return false; const [id,yk]=v.key.split('@'), I=S.inst(id,yk); return !!I&&!!I.A.place&&I.A.place.kind==='abroad'; };
  /* 一起出發的人（在大廳跟著你，最多三個、認識的）：活動卡 mates 是陣列的那幾團（C05 阿凱、T02 方奕廷、T03 子晴和阿凱）、VA10 麵店團、C13 和誰去；
     C11、C12 的以安（mates 照年份）是到了那邊才遇到，不算 */
  S.airWith=function(G,q){ const v=q.vac; let L=[];
    if(/^T13#/.test(v.key)){ const r=(S.rec(G).t13||[]).find(x=>'T13#'+x.n===v.key); if(r&&r.with) L=[r.with]; }
    else if(v.key==='VA10'){ const C=Dt()&&Dt().VA10; L=(C&&C.mates)||[]; }
    else { const [id,yk]=v.key.split('@'), I=S.inst(id,yk), m=I&&I.A.mates; if(Array.isArray(m)) L=m.slice(); }
    return L.filter(id=>typeof CHARACTERS!=='undefined'&&!!CHARACTERS[id]&&typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(id,'FIRST_MET')).slice(0,3); };
  /* 登機以後的字卡（AA_478 第 1 節、1-1）：出國活動＝活動卡的 fly；C13＝目的地（TRAVEL.dest 的 fly）；VA10＝VA10.fly。沒有＝不出（OUT.go 的 noCard）*/
  S.flyCard=function(G,q){ const v=q&&q.vac; if(!v||typeof v.key!=='string') return null; let f=null;
    if(/^T13#/.test(v.key)){ const r=(S.rec(G).t13||[]).find(x=>'T13#'+x.n===v.key), De=r&&TV()&&TV().dest[r.dest]; f=De&&De.fly; }
    else if(v.key==='VA10'){ const C=Dt()&&Dt().VA10; f=C&&C.fly; }
    else if(/@/.test(v.key)){ const [id,yk]=v.key.split('@'), I=S.inst(id,yk); f=I&&I.A.fly; }
    return Array.isArray(f)&&f.length?f:null; };
  /* d 那天人在國外的話，在哪裡（AA_492 第 1 節：學姊 12-6b「我在{國}。」＝那一趟「飛往〇〇」字卡的第一行去掉「飛往」）：
     出國活動（同 S.abroadOn：報了、或去過，出發到回來那幾天）＋手機自己排的出國旅遊（T13：出發到回來那幾天；那一趟取消、錯過的不算）。沒有字卡的回「國外」；不在國外＝null */
  S.abroadDest=function(G,d){ const V=S.rec(G), R=V.reg, nmOf=f=>Array.isArray(f)&&typeof f[0]==='string'&&/^飛往./.test(f[0])?f[0].slice(2):'國外';
    const I=S.all().find(I=>I.A.place.kind==='abroad'&&['yes','done'].includes(R[I.key])&&d>=I.from&&d<=I.to); if(I) return nmOf(I.A.fly);
    for(const r of (V.t13||[])){ if(!(d>=r.from&&d<=r.to)) continue; const q=typeof OUT!=='undefined'&&OUT.get?OUT.get(G,'vac_t13_'+r.n):null; if(q&&(q.state==='cancelled'||q.state==='missed')) continue;
      const De=TV()&&TV().dest[r.dest]; return nmOf(De&&De.fly); }
    return null; };
  S.airOk=(GM,q)=>!!q&&q.state==='planned'&&!q.airDone&&S.abroadTrip(q)&&typeof EXCH!=='undefined'&&!!EXCH.airGo&&!!EXCH.airZoneOk&&EXCH.airZoneOk()&&!!GM&&!!GM.enter;
  /* 出發：到出境大廳。回傳 false＝人在機場等登機、沒有回家（家裡的選單照「出門了」收起來；jp3d.js、home3d.js 的 !ok 先看 EXCH.airPending）*/
  const airReg=()=>{ if(typeof EXCH!=='undefined'&&EXCH.AIR&&!EXCH.AIR.vac) EXCH.AIR.vac={board:(GM,rec)=>S.airBoardTrip(GM,rec),hall:(GM,rec)=>S.airHallScene(GM,rec),resume:GM=>S.airResume(GM)}; };   /* 登記登機以後接著演什麼（exchange3d.js 照 index.html 在前面；單元測試載入順序不一定，出發時再補一次）*/
  S.toAirport=async function(GM,q,o){ airReg(); const G=GM.G, P=GM.E&&GM.E.player, home=!!(o&&o.fromHome)||(typeof HOME!=='undefined'&&!!HOME.at&&HOME.at(G)), tr=OUT.trip(G,q,home);
    q.airHome=home; q.airFrom=home||!P?null:{zone:G.zone,x:+P.obj.position.x.toFixed(2),z:+P.obj.position.z.toFixed(2),yaw:+((P.obj.rotation&&P.obj.rotation.y)||0).toFixed(3),lv:P.lv|0}; q.state='airport';
    await EXCH.airGo(GM,{k:'vac',q:q.id,with:S.airWith(G,q),card:[OUT.tt?OUT.tt(q.title):q.title,tr.travel],arrive:Math.max(T(G.day,G.hour)+(tr.travelH||0),T(q.day,q.h))});
    return false; };
  /* 進大廳就演的（EXCH.airGo 的 S.AIR.vac.hall；AA_478 第 2 節）：關鍵事件裡 hall:true 的那一場（C05、T02、C08 的「出發」：寫的都是登機前的機場）——2D 疊在模糊的大廳上，演完人照樣跟著走。
     第二次以後照 S.repKey（C08 第二次、第三次沒有「出發」那一場＝不演）。q.airHall＝在大廳演過了：登機以後的整趟不再演那一場（S.outing）；沒有 3D 機場＝照舊在旅程開頭演 */
  S.hallKeys=function(G,q){ const v=q&&q.vac; if(!v||v.k!=='trip'||typeof v.key!=='string'||!/@/.test(v.key)) return []; const [id,yk]=v.key.split('@'), I=S.inst(id,yk); if(!I) return []; const out=[];
    (I.A.keys||[]).forEach((k,i)=>{ if(!k||!k.hall) return; const kk=S.repKey(G,I,i,k); if(kk&&S.hasLines(G,kk)) out.push({k:Object.assign({},kk,{bg:'blur'}),I}); });
    if(Array.isArray(I.A.hallLines)&&I.A.hallLines.length) out.push({k:{bg:'blur',lines:I.A.hallLines},I});   /* 有認識的人帶隊的那一團多的幾句（T03 子晴、阿凱，AA_478 第 3 節；T02 方奕廷那兩句接在「出發」那一幕裡）*/
    return out; };
  S.airHallScene=async function(GM,rec){ const G=GM.G, q=typeof OUT!=='undefined'&&OUT.get&&rec?OUT.get(G,rec.q):null; if(!q||!q.vac) return false; q.airHall=true;
    const L=S.hallKeys(G,q); if(!L.length) return false;
    GM.sceneBegin(); try{ for(const x of L) await S.key(GM,x.k,x.I); } finally{ if(typeof ADV!=='undefined'&&ADV.active&&ADV.end) ADV.end(); GM.sceneEnd(); }
    return true; };
  /* 登機：原本的整趟（OUT.go；已經到了、字卡出過了）。從家裡出發的演完回臺北的家（同 home3d.js breakRound「出遊演完回家」）*/
  S.airBoardTrip=async function(GM,rec){ const G=GM.G, q=typeof OUT!=='undefined'&&OUT.get?OUT.get(G,rec.q):null;
    if(!q||q.state!=='airport'){ await S.airBack(GM,q,false); return false; }   /* 找不到那一趟（不該發生）：回到出發前的地方 */
    q.state='flying'; q.arrived=true; q.airDone=true;   /* flying：登機了、整趟演完以前（OUT 不會再問「出發」、不會算沒去；途中存的檔讀回來接著演，S.airResume）*/
    return S.airFly(GM,q,S.flyCard(G,q)); };   /* 「飛往〇〇」字卡（AA_478 第 1 節）*/
  /* 整趟（OUT.go；已經到了、去機場的字卡出過了）。從家裡出發的（OUT.go 不換區域）演完回臺北的家；3D 出發的在 OUT.go 結尾就換回去了（S.airStage）*/
  S._fly=new Set();   /* 正在演的那一趟（不存檔）*/
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['vac3d:_fly']=()=>{ S._fly.clear(); };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  S.airFly=async function(GM,q,card){ const G=GM.G; S._fly.add(q.id);
    try{ const ok=await OUT.go(GM,q,{fromHome:!!q.airHome,noCard:true,card:card||null}); if(G.zone==='airport_dep') await S.airBack(GM,q,false); return ok; }
    finally{ S._fly.delete(q.id); } };
  /* 回到出發前的地方：放假住家裡＝回臺北的家（字卡「回臺北的家」；inFade＝在 OUT.go 結尾的黑幕裡，不出字卡）；其他＝出發前站的地方（找不到＝宿舍房間）*/
  S.airBack=async function(GM,q,inFade){ const G=GM.G; if(G.zone!=='airport_dep') return false;
    if(q&&q.airHome&&typeof HOME!=='undefined'&&HOME.livesHome&&HOME.livesHome(G)){ const H=HOME.rec(G);
      if(!inFade){ await GM.fade(true); if(GM.titleCard) await GM.titleCard('回臺北的家','捷運＋公車 約 30 分鐘',2000); GM.advance(0.5); }
      H.at=true; H.day=G.day; if(typeof ADV!=='undefined'&&ADV.begin) ADV.begin({background:HOME.bgNow?HOME.bgNow():'dark'}); if(!inFade) await GM.fade(false); return true; }   /* 家裡的選單：story3d.js 的 HOME.tick 接著 */
    const f0=q&&q.airFrom, fine=!!f0&&!!f0.zone&&f0.zone!=='airport_dep'&&(typeof Z3==='undefined'||!Z3.ZONES||!!Z3.ZONES[f0.zone]), f=fine?f0:{zone:'dorm',x:0,z:2.4,yaw:Math.PI,lv:0};
    if(GM.enter) await GM.enter(f.zone,{x:f.x,z:f.z,yaw:f.yaw||0,lv:f.lv|0},inFade?{noFade:true,deferStory:true,noAutosave:true}:{}); return true; };
  /* OUT.go 結尾的黑幕裡換回出發前的地方（OUT.STAGE：演之前不換區域，回傳 restore）：登機以後才演的那一趟（q.airDone）、人還在出境大廳。
     bg:'dark'：登機了、人在飛機上——「飛往〇〇」字卡以後是深色底，不是模糊的出境大廳（AA_478 第 1 節；之後每一場照那一場的背景）*/
  S.airStage=async function(GM,q){ const G=GM&&GM.G; if(!G||!q||!q.airDone||G.zone!=='airport_dep') return null; return {restore:()=>S.airBack(GM,q,true),bg:'dark'}; };
  if(typeof OUT!=='undefined'){
    if(Array.isArray(OUT.STAGE)&&!OUT._vacAirStage){ OUT.STAGE.push(S.airStage); OUT._vacAirStage=true; }
    if(OUT.go&&!OUT._vacAir){ const go0=OUT.go; OUT.go=async function(GM,q,o){ if(S.airOk(GM,q)) return S.toAirport(GM,q,o); return go0.apply(this,arguments); }; OUT._vacAir=true; } }
  /* ===== 出國途中的時鐘換當地時間（AA_478 第 7 節，企劃線 6d9ebd49a，AA 定；做法同日本據點的 STORY.tzOffset）=====
     範圍：登機以後（行程開始）到回國桃園入境為止——遊戲時鐘（畫面上的時鐘、日期卡、X58 停下來那張卡、手機收到訊息的時間）、場次的觸發都照當地時間；回到臺灣那一刻換回臺灣時間。
       時差：活動卡 place.tz、C13 TRAVEL.dest[].tz、VA10 香港＝0（當地＝臺灣＋tz）。關鍵事件的 day／h 本來就是當地時間（AA：C10 第一堂課 6/23 09:00、C08 歡迎晚會 19:00）；
       行程的 start（從臺灣出發）、end（回到臺灣的那一刻）是臺灣時間。
     時鐘不往回走（手機訊息的先後、已讀、要回的期限都照時鐘）：比臺灣慢的地方（泰國、柬埔寨、越南 −1、歐洲 −6、加州／美國 −15）出發那一刻時鐘不動（當作飛行多花了那幾個小時），
       回來那一刻往後撥到臺灣時間；比臺灣快的地方（日本、韓國 +1）出發那一刻往後撥，回來那一刻不動。回到臺灣的時刻（end）和原本一樣。
     和臺灣的人往來（AA：手機照現在的排法，不用改）：照臺灣時間排的換成當地時間（送到的那一刻和原本一樣，手機上顯示當地時間）——S.tripMsgs、子晴的第二則、可昕的週末視訊（S.videoKey）、
       照 STORY.tzOffset 換算的系統（story3d.js 的 S.tzOffset 先問 VAC.tzAt：群組、可昕、芷若在英國……）、臺灣的朋友回訊息（MSG.replyAt；一起去的人照當地）。
     存檔：G.vac.clock＝{q, tz, end, with}（出國途中才有；舊存檔沒有＝臺灣時間）；那一趟出遊 q.state＝'flying'（演完 'done'）。途中存的檔讀回來（EXCH.tick → S.airResume）：接著演那一趟，
       時鐘已經是當地的就不再撥；E08 第一、二輪的存檔（登機以後 state 還是 planned）也接著演——原本讀回來會過了出發時間、被算成沒去。測試：node tests/e08_tz_unit.js */
  S.tzOf=function(G,q){ const v=q&&q.vac; if(!v||typeof v.key!=='string') return null;
    if(/^T13#/.test(v.key)){ const r=(S.rec(G).t13||[]).find(x=>'T13#'+x.n===v.key), De=r&&TV()&&TV().dest[r.dest]; return De&&typeof De.tz==='number'?De.tz:null; }
    if(v.key==='VA10') return 0;
    if(/@/.test(v.key)){ const [id,yk]=v.key.split('@'), I=S.inst(id,yk), P=I&&I.A.place; return P&&P.kind==='abroad'&&typeof P.tz==='number'?P.tz:null; }
    return null; };
  const clk=G=>{ const C=G&&G.vac&&G.vac.clock; return C&&typeof C==='object'&&typeof C.tz==='number'&&typeof C.end==='number'?C:null; };
  const setT=(GM,t)=>{ const G=GM.G, d=Math.floor(t/24+1e-9); G.day=d; G.hour=+(t-d*24).toFixed(4); if(typeof CALENDAR!=='undefined') G.weekday=CALENDAR.dateOf(d).wd%7; if(GM.E) GM.E.hour=G.hour; if(GM.updateHUD) GM.updateHUD(); };
  S.clock=G=>clk(G);
  /* 出國的那一趟開始（登機以後；沒有 3D 機場＝出發以後）：那一趟記成 flying、時鐘換當地時間（已經換過＝不再撥：讀檔接著演）*/
  S.flyStart=function(GM,q,end,withIds){ const G=GM.G; if(!q||typeof q!=='object') return null; if(q.state==='planned'||q.state==='airport') q.state='flying'; const C0=clk(G); if(C0) return C0;
    const tz=S.tzOf(G,q); if(tz==null) return null; const C=S.rec(G).clock={q:q.id,tz,end,with:(withIds||[]).filter(x=>typeof x==='string')};
    if(tz>0) setT(GM,T(G.day,G.hour)+tz); return C; };
  S.clockEnd=(G,end)=>{ const C=clk(G); return C?end+Math.min(C.tz,0):end; };   /* 行程最後那一張日期卡（當地時間）：回到臺灣那一刻 */
  S.clockBack=function(GM){ const G=GM.G, C=clk(G); if(!C) return false; delete S.rec(G).clock; if(C.tz<0) setT(GM,T(G.day,G.hour)-C.tz); return true; };   /* 換回臺灣時間（只往後撥）*/
  S.flyEnd=function(GM,q){ S.clockBack(GM); if(q&&q.state==='flying') q.state='planned'; };   /* 演完：換回臺灣時間；那一趟的 done 由 OUT.go 接著記（OUT.go 整段是 sceneBegin，中間不會被 OUT 問、算沒去）*/
  S.tw2g=function(G,t){ const C=clk(G); return C&&t<C.end?t+C.tz:t; };   /* 臺灣時間 → 遊戲時鐘（出國途中、回臺灣以前＝當地時間）*/
  S.tzAt=function(G,day){ const C=clk(G); if(!C) return null; if(day!=null&&day>Math.floor((C.end+Math.min(C.tz,0))/24+1e-9)) return 0; return C.tz; };   /* STORY.tzOffset 先問這裡（story3d.js）：沒有在國外＝null（照原本）；回國以後的日子＝0 */
  /* 讀檔回來、那一趟還在途中（flying；第一、二輪的存檔：planned＋登機了＋到了）：接著演（一次）。沒有在途中的那一趟、時鐘卻還是當地的（不該發生）：換回臺灣時間 */
  const tried=new WeakMap();
  S.airResume=function(GM){ const G=GM&&GM.G; if(!G||S._fly.size) return false;
    const q=(Array.isArray(G.outings)?G.outings:[]).find(x=>x&&x.vac&&(x.state==='flying'||(x.state==='planned'&&x.airDone&&x.arrived)));
    if(!q){ if(clk(G)) S.clockBack(GM); return false; }
    let D=tried.get(G); if(!D){ D=new Set(); tried.set(G,D); } if(D.has(q.id)) return false; D.add(q.id);
    q.state='flying'; q.arrived=true; void S.airFly(GM,q,null).catch(e=>console.warn('VAC.airResume',e)); return true; };
  /* 臺灣的朋友回訊息的時間（MSG.replyAt）：照臺灣時間算他們醒著、在忙，再換回當地時間；一起去的人照當地（同 jp3d.js、us_life3d.js）*/
  const msgReg=()=>{ if(typeof MSG==='undefined'||!MSG.replyAt||MSG._vacTz) return; const r0=MSG.replyAt; MSG.replyAt=function(G,id){ const C=clk(G); if(!C||!C.tz||(C.with||[]).includes(id)) return r0.apply(this,arguments);
      const t=T(G.day,G.hour)-C.tz, tw=Object.assign({},G), d=Math.floor(t/24+1e-9); tw.day=d; tw.hour=t-d*24; if(typeof CALENDAR!=='undefined') tw.weekday=CALENDAR.dateOf(d).wd%7; const r=r0.call(this,tw,id); if(!r) return r;
      const x=T(r.day,r.h)+C.tz, out=Object.assign({},r), xd=Math.floor(x/24+1e-9); out.day=xd; out.h=x-xd*24; out.tz=C.tz; return out; }; MSG._vacTz=true; };   /* msg3d.js 照 index.html 在前面；單元測試載入順序不一定（VAC.msgReg 再叫一次）*/
  S.msgReg=msgReg; msgReg();
  S.airReg=airReg; airReg();
  return S;
})();
