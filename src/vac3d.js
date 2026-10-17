/* ===== 假期活動（VAC；AA_199 第 3 節、7-2、7-4、7-5；HOLIDAY-SYS 的一部分）=====
   第一批：大一暑假的 C02 法律生活營隊輔、C03 日語課、C05 日本五天（阿凱那一團）；台詞在 data/vac_activities.js（AA_241 照抄）。
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
  S.YEARS=['Y1'];   /* 第一批只開大一（AA_199 7-5 每年都開：第二次以後的日誌台詞等 AA_242）*/
  S.dayOf=function(yk,season,mmdd){ const n=+String(yk).slice(1), m=+mmdd.slice(0,2), y=season==='summer'?2025+n:(m>=7?2024+n:2025+n); return DK(y+'-'+mmdd); };
  S.inst=function(id,yk){ const A=Dt()&&Dt().A[id]; if(!A) return null; if(A.year&&A.year!==yk) return null; const from=S.dayOf(yk,A.season,A.days[0]), to=S.dayOf(yk,A.season,A.days[1]); if(from==null||to==null) return null;
    return {id,yk,key:id+'@'+yk,A,from,to}; };
  S.all=function(){ const out=[]; const D=Dt(); if(!D) return out; for(const yk of S.YEARS) for(const id of Object.keys(D.A)){ const I=S.inst(id,yk); if(I) out.push(I); } return out; };
  S.state=(G,key)=>S.rec(G).reg[key]||null;
  S.enrolled=function(G,id,yk){ const R=S.rec(G).reg; for(const k in R) if((k===id+'@'+(yk||'')||(!yk&&k.split('@')[0]===id))&&(R[k]==='yes'||R[k]==='done')) return true; return false; };
  /* 報名的期限：signup.until（'MM-DD' 或 {term,week,wd}）*/
  const termDay=(term,week,wd)=>typeof STORY!=='undefined'&&STORY.termDay?STORY.termDay(term,week,wd):null;
  S.signupOpen=function(G,I){ const s=I.A.signup; if(!s) return null; let d0,d1;
    if(s.kind==='group'){ const term=I.yk+s.term; d0=termDay(term,s.week,s.wd); d1=s.until?termDay(term,s.until.week,s.until.wd===0?7:s.until.wd):I.from-1; }
    else { d0=S.dayOf(I.yk,I.A.season,s.day); d1=S.dayOf(I.yk,I.A.season,s.until); }
    return d0==null||d1==null?null:{from:d0,to:d1,h:s.h||21}; };
  /* 會撞到什麼（AA_199 3-2：時段和地點；人不在臺北的那幾天，臺北要到場的都撞）*/
  S.daysOf=function(I){ const out=[]; for(let d=I.from;d<=I.to;d++){ if(I.A.wd){ const w=typeof CALENDAR!=='undefined'?CALENDAR.dateOf(d).wd%7:0; if(!I.A.wd.includes(w)) continue; } out.push(d); } return out; };
  S.conflicts=function(G,I){ const mine=new Set(S.daysOf(I)), away=I.A.trip||I.A.place.kind!=='taipei', out=[];
    for(const J of S.all()){ if(J.key===I.key||!['yes','done'].includes(S.state(G,J.key))) continue; const awayJ=J.A.trip||J.A.place.kind!=='taipei';
      for(const d of S.daysOf(J)) if(mine.has(d)&&(away||awayJ||J.A.slot===I.A.slot)){ out.push({key:J.key,title:J.A.title,day:d}); } }
    return out; };
  const dl=d=>{ if(typeof CALENDAR==='undefined') return String(d); const x=CALENDAR.dateOf(d); return x.m+'/'+x.d; };
  /* 報名：記下來、家裡出錢的家人群組一句、排關鍵事件（出遊）*/
  S.signup=function(G,key,how){ const V=S.rec(G), [id,yk]=key.split('@'), I=S.inst(id,yk); if(!I) return false; V.reg[key]=how||'yes'; if(V.reg[key]!=='yes') return true;
    const s=I.A.signup||{}; if(s.flag) G.flags[s.flag]=true;
    if(s.yes&&s.yes.family&&typeof PHONE!=='undefined'){ PHONE.join(G,'home','家人'); PHONE.at(G,G.day,G.hour,[{th:'g:home',from:'mom',name:'媽媽',text:s.yes.family}],'vac_fam_'+key); }   /* AA_199 3-7：家裡出的，家人群組一句 */
    S.plan(G,I); return true; };
  S.plan=function(G,I){ if(typeof OUT==='undefined') return; const A=I.A;
    if(A.prep){ const pd=termDay(I.yk+A.prep.term,A.prep.week,A.prep.wd); if(pd!=null&&(pd>G.day||(pd===G.day&&G.hour<A.prep.h))) OUT.plan(G,{id:'vac_'+I.key+'_prep',ev:'ev_vac_key',day:pd,h:A.prep.h,late:0.25,place:A.prep.place,title:A.title+'：籌備會',travel:'走過去約 10 分鐘',travelH:1/6,vac:{key:I.key,k:'prep'}}); }
    if(A.trip){ const sd=S.dayOf(I.yk,A.season,A.trip.start.day); OUT.plan(G,{id:'vac_'+I.key,ev:'ev_vac_key',day:sd,h:A.trip.start.h,late:0.5,place:A.trip.placeName,title:A.title+'（出發）',travel:A.place.kind==='abroad'?'去機場 約 1 小時':'走過去約 10 分鐘',travelH:A.place.kind==='abroad'?1:1/6,back:A.place.kind==='abroad'?'回到臺北。':'營隊結束。',vac:{key:I.key,k:'trip'}}); return; }
    (A.keys||[]).forEach((k,i)=>{ const d=S.dayOf(I.yk,A.season,k.day); OUT.plan(G,{id:'vac_'+I.key+'_'+i,ev:'ev_vac_key',day:d,h:k.h,late:0.25,place:A.place.name,title:A.title+'：'+k.title,travel:'走過去約 15 分鐘',travelH:0.25,vac:{key:I.key,k:i}}); }); };
  /* ---- 手機（story3d.js 的 S.phoneRules 每次呼叫）：邀約、選了以後、沒去、大一暑假的訊息 ---- */
  S.phone=function(GM){ const G=GM.G; if(!S.ON||typeof PHONE==='undefined'||!Dt()||(G.stage||'law')!=='law') return; const V=S.rec(G), F=G.flags, now=T(G.day,G.hour);
    if(typeof F.VAC_PICK==='string'){ const [key,how]=F.VAC_PICK.split(':'); delete F.VAC_PICK; S.signup(G,key,how); }
    for(const I of S.all()){ const s=I.A.signup, o=S.signupOpen(G,I); if(!s||!o) continue; const tag='vac_ask_'+I.key;
      if(now>=T(o.from,o.h)&&G.day<=o.to&&!PHONE.sent(G,tag)&&!V.reg[I.key]){
        if(s.kind==='group'){ if(!PHONE.inGroup(G,s.th.slice(2))) continue; const M=s.msgs.map(m=>Object.assign({th:s.th},m)); Object.assign(M[M.length-1],{ask:{id:tag,until:T(o.to,24),opts:[{t:s.yes.t,set:{VAC_PICK:I.key+':yes'},say:(s.yes.say||[]).map(x=>Object.assign({th:s.th},x))}]}}); PHONE.at(G,o.from,o.h,M,tag); }
        else if(s.kind==='dm'&&(!s.min||atLeast(s.who,s.min))&&(typeof STORY==='undefined'||!STORY.knows||STORY.knows(s.who,G)||(typeof SOCIAL!=='undefined'&&SOCIAL.has&&SOCIAL.has(s.who,'FIRST_MET')))){ const th='p:'+s.who, M=s.msgs.map(t=>({th,from:s.who,text:t}));
          const opts=[{t:s.yes.t,set:{VAC_PICK:I.key+':yes'},say:(s.yes.say||[]).map(x=>Object.assign({th},x))}]; if(s.later) opts.push({t:s.later.t,set:{VAC_PICK:I.key+':later'},say:s.later.say.map(x=>Object.assign({th},x))}); if(s.no) opts.push({t:s.no.t,set:{VAC_PICK:I.key+':no'},say:s.no.say.map(x=>Object.assign({th},x))});
          Object.assign(M[M.length-1],{ask:{id:tag,until:T(o.to,24),opts}}); PHONE.at(G,o.from,o.h,M,tag); } }
      /* 沒參加（沒報名、或報了沒去）：卡片的 miss */
      const ms=I.A.miss; if(ms){ const md=S.dayOf(I.yk,I.A.season,ms.day), st=V.reg[I.key]; if(md!=null&&now>=T(md,ms.h)&&G.day<=md+3&&st!=='done'&&st!=='yes'||(md!=null&&st==='missed'&&now>=T(md,ms.h)&&G.day<=md+3)){ const tag2='vac_miss_'+I.key; if(!PHONE.sent(G,tag2)&&(!ms.min||atLeast(ms.who,ms.min))) PHONE.at(G,md,ms.h,ms.msgs.map(t=>({th:'p:'+ms.who,from:ms.who,text:t})),tag2); } }
      /* 回來以後（C05 阿哲「伴手禮咧」）*/
      const bk=I.A.back; if(bk&&V.reg[I.key]==='done'&&PHONE.inGroup(G,'noodle_team')){ const bd=S.dayOf(I.yk,I.A.season,bk.day); if(bd!=null&&now>=T(bd,20)&&G.day<=bd+3&&!PHONE.sent(G,'vac_back_'+I.key)) PHONE.at(G,bd,20,bk.group.map(m=>Object.assign({th:'g:noodle_team'},m)),'vac_back_'+I.key); } }
    /* 大一暑假的訊息（AA_241 第 4、6、7 節）*/
    for(const m of Dt().MSGS){ if(PHONE.sent(G,m.tag)) continue; const d=DK(m.day); if(d==null||now<T(d,m.h)||G.day>d+2) continue;
      if(m.th.startsWith('g:')&&!PHONE.inGroup(G,m.th.slice(2))) continue; if(m.min&&!atLeast(m.min[0],m.min[1])) continue; if(m.dating&&!F['dating_'+m.dating]) continue;
      if(m.vac&&!S.enrolled(G,m.vac)) continue; if(m.idle&&Object.values(V.reg).some(v=>v==='yes'||v==='done')) continue;   /* 整個暑假都沒排事才傳（VA-11 最後一列）*/
      if(!m.dating&&m.th.startsWith('p:')&&F['dating_'+m.th.slice(2)]&&/^va02_/.test(m.tag)) continue;   /* 交往中的返鄉訊息另外補（AA_241 第 6 節最後一點）*/
      PHONE.at(G,d,m.h,m.ms.map(x=>Object.assign({th:m.th},x)),m.tag); } };
  /* ---- 關鍵事件（出遊事件 ev_vac_key 的 beforeOuting）---- */
  const run=async(GM,lines)=>{ const G=GM.G; for(let x of (lines||[])){ if(typeof x==='function') x=x(G); if(x==null) continue; if(Array.isArray(x)){ await run(GM,x); continue; }
      let t=typeof x.text==='function'?x.text(G):x.text; if(typeof x==='string') await GM.say(null,x);
      else if(x.narr) await GM.say(null,x.narr); else if(x.who==='player') await GM.say({name:G.name||'祐廷'},t); else if(x.who) await GM.say({name:x.name||nm(x.who),charId:x.name?null:x.who},t); } };
  S.key=async function(GM,k,I){ const G=GM.G; if(typeof ADV!=='undefined'&&ADV.begin) ADV.begin({background:k.bg&&typeof OUT!=='undefined'&&OUT.bg?OUT.bg(k.bg):'dark'});
    await run(GM,k.lines); if(k.choice&&k.choice.length){ const i=await GM.choose(k.choice.map(c=>({t:c.t}))), c=k.choice[i]||k.choice[0]; await run(GM,c.say); if(c.set) Object.assign(G.flags,c.set); if(c.rel&&typeof SOCIAL!=='undefined') for(const id in c.rel) SOCIAL.adjust(id,c.rel[id]); }
    if(k.after) await run(GM,k.after); };
  S.jump=async function(GM,t,place){ const G=GM.G, E=GM.E; if(t<=T(G.day,G.hour)) return; await GM.fade(true); let tt=T(G.day,G.hour), n=0;
    while(tt+1<t-1e-6){ tt+=1; const d=Math.floor(tt/24); if(d>G.day){ G.day=d; G.weekday=typeof CALENDAR!=='undefined'?CALENDAR.dateOf(d).wd%7:(G.weekday+1)%7; G.energy=100; G.flags.companion=null; } G.hour=tt-G.day*24; if(E) E.hour=G.hour;
      if(typeof STORY!=='undefined'&&STORY.monthlyFunds){ const f=STORY.monthlyFunds(G); if(f&&GM.money) GM.money(f.amount); }
      if(typeof PHONE!=='undefined'){ try{ if(typeof STORY!=='undefined'&&STORY.phoneRules) STORY.phoneRules(GM); PHONE.tick(G,out=>{ n+=out.length; }); }catch(e){ console.warn('VAC jump phone',e); } } }
    const d=Math.floor(t/24); if(d>G.day){ G.day=d; G.weekday=typeof CALENDAR!=='undefined'?CALENDAR.dateOf(d).wd%7:G.weekday; } G.hour=t-G.day*24; if(E) E.hour=G.hour; if(GM.updateHUD) GM.updateHUD();
    if(GM.titleCard&&typeof CALENDAR!=='undefined'){ const x=CALENDAR.dateOf(G.day); await GM.titleCard(x.m+'/'+x.d+'（'+['日','一','二','三','四','五','六'][x.wd%7]+'）',place||'',2000); }
    await GM.fade(false); if(n&&GM.toast) GM.toast('手機｜這幾天收到 '+n+' 則訊息',3600); };
  S.outing=async function(GM,q){ const G=GM.G, v=q&&q.vac; if(!v) return false; const [id,yk]=v.key.split('@'), I=S.inst(id,yk); if(!I) return false; const A=I.A, V=S.rec(G);
    if(v.k==='prep'){ await S.key(GM,Object.assign({bg:A.prep.bg},A.prep),I); return true; }
    if(v.k==='trip'){ for(const k of (A.keys||[])){ const d=S.dayOf(I.yk,A.season,k.day); await S.jump(GM,T(d,k.h),A.trip.placeName); await S.key(GM,k,I); }
      const ed=S.dayOf(I.yk,A.season,A.trip.end.day); await S.jump(GM,T(ed,A.trip.end.h),A.trip.placeName); V.reg[I.key]='done'; V.seen[id]=true; return true; }
    const k=(A.keys||[])[v.k]; if(k){ await S.key(GM,k,I); if(v.k===(A.keys.length-1)){ V.reg[I.key]='done'; V.seen[id]=true; } } return true; };
  S.missed=function(GM,q){ const G=GM.G, v=q&&q.vac; if(!v) return; const V=S.rec(G); if(v.k==='trip'||v.k===0) V.reg[v.key]='missed'; };
  /* ---- 手機「活動」頁的假期行事曆（AA_199 3-2）：報名了的、還可以報名的 ---- */
  S.html=function(G){ const esc=s=>String(s).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[ch]); const V=S.rec(G), rows=[];
    for(const I of S.all()){ const st=V.reg[I.key], o=S.signupOpen(G,I), open=o&&G.day>=o.from&&G.day<=o.to&&(!st||st==='later')&&(I.A.signup.board||I.A.signup.kind!=='dm'||PHONE.sent(G,'vac_ask_'+I.key));
      if(!(st==='yes'||st==='done'||open)) continue; const when=dl(I.from)+(I.to!==I.from?'～'+dl(I.to):'')+(I.A.wd?'（每週'+I.A.wd.map(w=>'日一二三四五六'[w]).join('、')+'）':'');
      const cf=open?S.conflicts(G,I):[]; rows.push('<div class="item phrow"><div>'+esc(I.A.title)+'<div class="muted">'+esc(when)+'・'+esc(I.A.place.name)+(I.A.cost.payer==='family'?'・家裡出':'')+(st==='done'?'・參加過':'')+(cf.length?'・會撞到：'+esc(cf.map(c=>c.title+' '+dl(c.day)).slice(0,3).join('、')):'')+'</div></div>'+(open?'<button class="btn pri" data-vac="'+esc(I.key)+'">報名</button>':'')+'</div>'); }
    return rows.length?'<div class="item"><b>假期行事曆</b></div>'+rows.join(''):''; };
  return S;
})();
