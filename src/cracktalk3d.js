/* ===== 多段感情 v6：裂縫計數 → 談話（V6-S5、V6-A2、V6-A5、V6-B4；企劃線 claude/cool-heisenberg-o8kuqx @ d805bceee）=====
   規格：AA_123 2-1、2-2、4-2、5-2（以安、語彤）；AA_182 第 1 節（以安、語彤的到場、語彤裂縫①的訊號）；BB_119 第 2 節（2-1 沛珊、2-3 芷若、2-4 子晴；開頭的通則）、
         第 7 節（修補承諾怎麼判斷、EX_<id>_REASON）、9-0／9-1（到場）。學姊 2-2 作廢（BB_119 檔首）；可昕照 AA_351（kxdrift3d.js）。
   台詞在 src/data/cracktalk_lines.js（照原文）。這裡是計數、什麼時候演、結果。不改 romance3d.js：包住 ROM.crack。
   ■ 計數（每一段關係各自算；D74、AA_140 第 0 節）：AN_CRACK、YT_CRACK、PS_CRACK、ZR_CRACK、ZQ_CRACK（ROM.CRACK）。
     - 同一學期：<K>_TERM 記這個數字是哪一學期的；換學期以後的第一次加減先歸零（寒暑假算在前一個學期）。舊存檔沒有 <K>_TERM＝當作這學期（不歸零）。
     - 只在和她交往中才加（ROM.crack 的 +；別的系統的 −1 照舊，最低 0）。修補（ROM.mend）、開始、分開都歸零（romance3d.js 原本就做）。
     - 同一學期加到 3（而且這學期還沒談過）＝排談話；同一學期只演一次。
   ■ 談話（她先開口；到場照 AA_182、BB_119 9-1）：
     以安：學期中＝到 3 以後的下一個週四。那晚有公法讀書會、你有去＝散會後「你留一下。」→ 萬才館研討室；沒去＝22:00 私訊 → 隔天 16:00 Café 窗邊（人到 Café 就演；16:30「我在窗邊。」；17:15 還沒到＝不回答）。
           讀書會不開的週＝週四 21:00 私訊 → 隔天 16:00 Café。她在日本、你不在／你在國外／寒暑假＝視訊 21:00（20:00 私訊；沒接＝隔天同一時間；還是沒接＝不回答）；
           兩個人都在日本＝週六 15:00 她那裡（前一晚 21:00 私訊）。她在日本那一次是「沒有誰對誰錯的一次」：不回答＝修補（最多一次）。
     語彤：到 3 以後的下一個週四 17:30～18:30 總圖三樓（12:10 私訊；人到三樓就演）；20:00 還沒到＝「沒關係。下週四。」，下一個週四同一時間；還是沒到＝不回答。你在國外＝視訊 21:00（20:00 私訊）。
     沛珊：視訊 21:00（20:00 私訊；沒接 30 分鐘後再打；隔天兩次都沒接＝不回答）。她大三起在台南（現行設定總表第 2 節），溫州街小公園那一列不會發生。
     芷若：她在英國，到 3 以後的下一個週六臺灣 17:00 視訊（前一晚 23:30 私訊；17:05 一則；17:30 再打；週日同樣兩次；都沒接＝不回答）。不在英國的時候先等。
     子晴：到 3 以後的下一個週六 19:00 河堤（前一晚 21:00 私訊；19:30 兩則；20:00「明天。一樣七點。」→ 隔天 19:00；還是沒到＝不回答）；2029-05-12 吉他社成發改週日。你在國外的時候先等。
   ■ 結果：修補＝ROM.mend（歸零、這學期不再談）；好好分開／生活差異＝ROM.end(how)、EX_<id>_REASON='talk'；
     不回答＝幾天以後她傳的那幾句（AA_123、BB_119）、ROM.end(…,'apart_drift')、EX_<id>_REASON='drift'（語彤：一週後到麵店那一句；芷若：兩週後的信封）；
     BB 的三位：讓計數到 3 的那一件是避不掉的（沒有選項的：芷若②明信片）＝那一次「不回答」改成她傳「我們再試一個月」、歸零（一次）。
     修補承諾（BB_119 第 7 節）：芷若「每週固定一個時間」＝ZR_WEEKLY_FIX（zr_uk3d.js 讀）、之後的固定時間視訊八次接六次（ZRUK 的紀錄）；沒做到＝分開（apart_talk）＋她最後一句私訊。
       芷若「寒假我去英國找妳」：1c-1 那一趟（ev_zhiruo_uk_visit）還沒進遊戲，這個選項先不出；大四下（寒假以後）本來就沒有（AA_263 C19）。
       沛珊「每個月留一天給溫州街」、子晴「那妳來決定時間」：之後要驗的事（溫州街的邀約、她發的三次邀約）遊戲裡沒有、和現行設定也對不上——先當修補，回報 AA。
   ■ 裂縫來源（遊戲裡真的有給機會的）：
     語彤①（AA_182 1-2）：交往中、她的週四是自己的（STORY.ytThuFree）、那天 17:00～20:00 她照作息在總圖三樓＝12:10 她傳「今天週四。總圖三樓，斜對面的位子我留了。」；
            那天 17:00～20:00 你沒到總圖三樓、也沒回「今天不行」＝+1。
     芷若①：zr_uk3d.js 的每週視訊「早點睡。」連兩次（原本就有，ROM.crack）。芷若②：第二輪明信片（r2y4a3d.js）連兩張沒回寄＝下一張最後一行多「上一張你沒回。……」＋1（避不掉的）。
     其他（以安①②、語彤②、沛珊①②③、芷若③、子晴①②③）遊戲裡還沒有那個時刻或訊號、或和現行設定衝突：沒有做，S.SOURCES_MISSING 列給 AA。
   存檔：G.flags.CRACKTALK＝{r:{人物:{talked:{學期:1}, plan, drift, commit, lastUnavoid, unavoidUsed, jpUsed, mode}}, seat:{日:{went,done}}, pc:{from,note:{}}}；舊存檔沒有＝空的。
   測試：node tests/v6_crack_unit.js */
'use strict';
const CRACKTALK=(function(){
  const S={};
  if(typeof STORY==='undefined'||typeof ROM==='undefined'||!ROM.crack||typeof CRACKTALK_LINES==='undefined'||typeof STORY_EVENTS==='undefined') return S;
  const L=CRACKTALK_LINES, AN=L.AN, YT=L.YT, PS=L.PS, ZR=L.ZR, ZQ=L.ZQ;
  S.IDS=[AN,YT,PS,ZR,ZQ];
  const dk={}; const D=k=>{ if(k in dk) return dk[k]; return dk[k]=STORY.dayOfKey?STORY.dayOfKey(k):null; };
  const T=(d,h)=>d*24+h, now=G=>G.day*24+(+G.hour||0), hh=G=>{ const x=+G.hour||0; return x>=0&&x<24?x:((x%24)+24)%24; };
  const wdOf=d=>CALENDAR.dateOf(d).wd%7, keyOf=d=>CALENDAR.dateOf(d).key;
  const law=G=>!!G&&!!G.flags&&(G.stage||'law')==='law';
  const dating=(G,id)=>!!(G&&G.flags&&G.flags['dating_'+id]===true);
  const done=(G,id)=>!!(G&&G.events&&G.events.done&&G.events.done[id]);
  const evOf=id=>STORY_EVENTS.find(e=>e.id===id)||null;
  const pres=(id,G)=>typeof STORY.presence==='function'?(STORY.presence(id,G)||{here:true}):{here:true};
  const abroad=G=>typeof STORY.abroad==='function'&&!!STORY.abroad(G);
  const tz=(G,d)=>typeof STORY.tzOffset==='function'?(+STORY.tzOffset(G,d)||0):0;
  /* 臺灣時間 → 遊戲時鐘（你在國外的時候遊戲是當地時間）*/
  const toGame=(G,d,h)=>{ if(typeof ZRUK!=='undefined'&&ZRUK.toGame) return ZRUK.toGame(G,d,h); const a=T(d,h)+tz(G,d), dd=Math.floor(a/24+1e-9); return {day:dd,h:+(a-dd*24).toFixed(4)}; };
  const twNow=G=>now(G)-tz(G,G.day);
  const nick=id=>(typeof CHARACTERS!=='undefined'&&CHARACTERS[id]&&CHARACTERS[id].nickname)||(typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(id):id);

  /* ======================= 學期、計數 ======================= */
  const tkCache={};
  S.termKey=function(G,day){ const d=day==null?G.day:day; if(d in tkCache) return tkCache[d]; let k=null;
    if(typeof CALENDAR!=='undefined'&&CALENDAR.termOf){ for(let i=0;i<220;i++){ const t=CALENDAR.termOf(d-i); if(t){ k=t.id; break; } } }   /* 寒暑假＝前一個學期 */
    return tkCache[d]=k||('D'+d); };
  S.key=id=>ROM.CRACK[id];
  S.count=function(G,id){ const k=S.key(id), F=G.flags||{}; if(!k) return 0; if(F[k+'_TERM']!=null&&F[k+'_TERM']!==S.termKey(G)) return 0; return Math.max(0,+F[k]||0); };
  S.rec=function(G){ const F=G.flags||(G.flags={}); let R=F.CRACKTALK; if(!R||typeof R!=='object') R=F.CRACKTALK={};
    if(!R.r||typeof R.r!=='object') R.r={}; if(!R.seat||typeof R.seat!=='object') R.seat={}; if(!R.pc||typeof R.pc!=='object') R.pc={from:0,note:{}}; if(!R.pc.note) R.pc.note={}; return R; };
  S.pr=function(G,id){ const R=S.rec(G).r; let r=R[id]; if(!r||typeof r!=='object') r=R[id]={}; if(!r.talked||typeof r.talked!=='object') r.talked={}; return r; };
  let nextUnavoid=false;
  /* 包住 ROM.crack（只動這五位；可昕、學姊照原本）*/
  if(!ROM._ctCrack){ const c0=ROM.crack; ROM.crack=function(G,id,n){ if(!S.IDS.includes(id)||!G||!G.flags) return c0.apply(this,arguments);
      const k=S.key(id), F=G.flags, d=n==null?1:n, un=nextUnavoid; nextUnavoid=false;
      if(d>0&&!dating(G,id)) return Math.max(0,+F[k]||0);   /* 只在交往中算 */
      const tk=S.termKey(G); if(F[k+'_TERM']!=null&&F[k+'_TERM']!==tk) F[k]=0; F[k+'_TERM']=tk;
      c0.call(this,G,id,d); if((+F[k]||0)<0) F[k]=0;
      if(d>0){ const r=S.pr(G,id); r.lastUnavoid=!!un; (r.log||(r.log=[])).push({day:G.day,un:!!un}); if(r.log.length>20) r.log.splice(0,r.log.length-20); S.check(G,id); }
      return F[k]; }; ROM._ctCrack=true; }
  /* 裂縫來源加 1（unavoidable＝沒有選項的那一種，BB_119 第 2 節開頭）*/
  S.add=function(G,id,o){ nextUnavoid=!!(o&&o.unavoidable); const r=ROM.crack(G,id,1); nextUnavoid=false; return r; };
  S.due=function(G,id){ const r=S.pr(G,id); return law(G)&&dating(G,id)&&S.count(G,id)>=3&&!r.talked[S.termKey(G)]&&!r.plan&&!r.drift; };
  S.check=function(G,id){ if(!S.due(G,id)) return false; const r=S.pr(G,id); const p=S.build(G,id); if(!p){ r.wait=S.termKey(G); return false; } r.wait=null; p.unavoid=!!r.lastUnavoid; r.plan=p; return true; };   /* unavoid：讓計數到 3 的那一件是避不掉的（BB_119 第 2 節開頭）*/

  /* ======================= 什麼時候、在哪裡（AA_182 第 1 節、BB_119 9-1）======================= */
  /* 第一個週 wd 的那一天 d（d ≥ from），而且 T(d+off, h) 還沒過 reach */
  const nextWd=(from,wd,reach,off,h)=>{ for(let d=from;d<from+21;d++) if(wdOf(d)===wd&&T(d+(off||0),h)>=reach) return d; return null; };
  const vday=(G,reach)=>{ const d=G.day; return reach<T(d,19.75)?d:d+1; };   /* 視訊：今天 20:00 的私訊還來得及＝今天，不然明天 */
  const plgAct=()=>typeof ACTIVITIES!=='undefined'&&ACTIVITIES.list?ACTIVITIES.list.find(a=>a.id==='public_law_group'):null;
  S.plgOn=function(G,d){ const a=plgAct(); if(!a||!ACTIVITIES.on||!ACTIVITIES.on(a,d,G)) return null; const Gx=Object.assign({},G,{day:d,hour:a.t0,weekday:4}); if(!pres(AN,Gx).here) return null; return a; };
  const vid=(ev,G,d,h,tw)=>{ const c=tw?toGame(G,d,h):{day:d,h}; return {m:'out',ev,day:c.day,h:c.h,late:0.25,video:true}; };
  S.build=function(G,id){ const reach=now(G), meAb=abroad(G), term=!!(typeof CALENDAR!=='undefined'&&CALENDAR.termOf&&CALENDAR.termOf(G.day));
    const P={id,term:S.termKey(G),reach,i:0,att:[]};
    if(id===AN){ const anAb=pres(AN,G).kind==='abroad', meJP=meAb&&STORY.route&&STORY.route(G)==='JP';
      if(anAb&&meJP){ const d=nextWd(G.day,6,reach,-1,21); if(d==null) return null; P.mode='jp';
        P.att=[Object.assign({m:'out',ev:'ev_an_talk_jp',day:d,h:15,late:1,place:'以安那裡',title:'以安那裡',invite:{day:d-1,h:21,msgs:L.MSG.an_jp}}),{m:'out',ev:'ev_an_talk_jp',day:d+1,h:15,late:1,place:'以安那裡',title:'以安那裡'}]; return P; }
      if(anAb||meAb||!term){ const d=vday(G,reach); P.mode=anAb?'jp_video':'video'; const a=vid('ev_an_talk_video',G,d,21,meAb), b=vid('ev_an_talk_video',G,d+1,21,meAb); const iv=meAb?toGame(G,d,20):{day:d,h:20};
        a.invite={day:iv.day,h:iv.h,msgs:L.MSG.an_video}; P.att=[a,b]; return P; }   /* 她在日本、你不在＝「沒有誰對誰錯的一次」（jp_video）；你在國外、寒暑假（她回台中）＝視訊 */
      const d=nextWd(G.day,4,reach,0,20); if(d==null) return null; P.mode='meet'; const cafe={m:'zone',zone:'cafe',ev:'ev_an_talk',day:d+1,h:16,w0:15.75,w1:17.25,mid:{h:16.5,msgs:L.MSG.an_cafe_wait}};
      const a=S.plgOn(G,d); if(a){ cafe.invite={day:d,h:22,msgs:L.MSG.an_cafe}; P.att=[{m:'plg',day:d,t1:a.t1||21.5},cafe]; } else { cafe.invite={day:d,h:21,msgs:L.MSG.an_cafe}; P.att=[cafe]; }
      return P; }
    if(id===YT){ if(meAb){ const d=vday(G,reach); P.mode='video'; const iv=toGame(G,d,20), a=vid('ev_yt_talk_video',G,d,21,true), b=vid('ev_yt_talk_video',G,d+1,21,true); a.invite={day:iv.day,h:iv.h,msgs:L.MSG.yt_video}; P.att=[a,b]; return P; }
      const d=nextWd(G.day,4,reach,0,12+10/60); if(d==null) return null; P.mode='meet';
      P.att=[{m:'zone',zone:'library',ev:'ev_yt_talk',day:d,h:17.5,w0:17.25,w1:18.5,failH:20,invite:{day:d,h:12+10/60,msgs:L.MSG.yt_thu},miss:{h:20,msgs:L.MSG.yt_next}},
             {m:'zone',zone:'library',ev:'ev_yt_talk',day:d+7,h:17.5,w0:17.25,w1:18.5,failH:20}]; return P; }
    if(id===PS){ const d=vday(G,reach); P.mode='video'; const iv=toGame(G,d,20); const a=vid('ev_peishan_two_directions',G,d,21,true); a.invite={day:iv.day,h:iv.h,msgs:L.MSG.ps_video};
      P.att=[a,vid('ev_peishan_two_directions',G,d,21.5,true),vid('ev_peishan_two_directions',G,d+1,21,true),vid('ev_peishan_two_directions',G,d+1,21.5,true)]; return P; }
    if(id===ZR){ const tw=twNow(G), td=Math.floor(tw/24+1e-9); if(typeof ZRUK==='undefined'||!ZRUK.inUK||!ZRUK.inUK(G,td)) return null;   /* 她不在英國：先等 */
      let s=null; for(let d=td;d<td+21;d++) if(wdOf(d)===6&&T(d-1,23.5)>=tw){ s=d; break; } if(s==null||!ZRUK.inUK(G,s)) return null; P.mode='video'; P.tw=s;
      const iv=toGame(G,s-1,23.5), a=vid('ev_zhiruo_timezone_talk',G,s,17,true), t5=toGame(G,s,17+5/60); a.invite={day:iv.day,h:iv.h,msgs:L.MSG.zr_ask}; a.mid={day:t5.day,h:t5.h,msgs:L.MSG.zr_tea};
      P.att=[a,vid('ev_zhiruo_timezone_talk',G,s,17.5,true),vid('ev_zhiruo_timezone_talk',G,s+1,17,true),vid('ev_zhiruo_timezone_talk',G,s+1,17.5,true)]; return P; }
    if(id===ZQ){ if(meAb) return null;   /* 你在國外：先等（BB_119 9-1 沒有這一列）*/
      let s=nextWd(G.day,6,reach,-1,21); if(s==null) return null; if(keyOf(s)==='2029-05-12') s+=1;   /* 吉他社成發（AA_181）：改週日 */ P.mode='meet';
      const o={m:'out',ev:'ev_ziqing_direct_statement',h:19,late:1,place:'河堤',title:'河堤',travel:'走路 約 15 分鐘',travelH:0.25};
      P.att=[Object.assign({},o,{day:s,invite:{day:s-1,h:21,msgs:L.MSG.zq_ask},mid:{day:s,h:19.5,msgs:L.MSG.zq_wait},miss:{h:20,msgs:L.MSG.zq_next}}),Object.assign({},o,{day:s+1})]; return P; }
    return null; };

  /* ======================= 手機規則：私訊、出遊、沒到、不回答、修補承諾 ======================= */
  const DM=(id,t)=>({th:'p:'+id,from:id,text:t});
  const tagOf=(id,kind,day,h)=>'ct_'+id+'_'+kind+'_'+keyOf(day)+'_'+Math.round((h||0)*100);
  S.send=function(G,id,day,h,msgs,kind){ if(typeof PHONE==='undefined'||!msgs||!msgs.length) return false; return PHONE.at(G,day,h,msgs.map(t=>DM(id,t)),tagOf(id,kind,day,h)); };
  S.outId=(id,p,i)=>'ct_'+id+'_'+p.term+'_'+i;
  S.step=function(G,id){ const r=S.pr(G,id), p=r.plan; if(!p) return;
    if(!dating(G,id)){ S.cancel(G,id); return; }
    const a=p.att[p.i]; if(!a){ r.plan=null; return; }
    if(a.invite&&!a.invSent&&now(G)>=T(a.invite.day,a.invite.h)){ a.invSent=true; if(now(G)<T(a.day,a.h)+(a.late||1)) S.send(G,id,a.invite.day,a.invite.h,a.invite.msgs,'inv'); }
    if(a.m==='out'){ const oid=S.outId(id,p,p.i); let q=typeof OUT!=='undefined'?OUT.get(G,oid):null;
      if(!q&&typeof OUT!=='undefined'&&now(G)<T(a.day,a.h)+(a.late||0.25)){ OUT.plan(G,Object.assign({id:oid,ev:a.ev,day:a.day,h:a.h,late:a.late||0.25,title:a.video?('和'+nick(id)+'視訊'):a.title,ct:{id,i:p.i}},
          a.video?{place:'視訊',verb:'接起來',no:'先不接',travel:'',travelH:0,alarm:true,back:'視訊結束。'}:{place:a.place,travel:a.travel||'',travelH:a.travelH||0})); q=OUT.get(G,oid); }   /* 標題、back 照 zr_uk3d.js 的視訊；當面的回程字照 OUT 原本的 */
      if(a.mid&&!a.midSent&&q&&q.state==='planned'&&!q.arrived&&now(G)>=T(a.mid.day,a.mid.h)){ a.midSent=true; S.send(G,id,a.mid.day,a.mid.h,a.mid.msgs,'mid'); }
      if(q&&(q.state==='missed'||(q.state==='planned'&&!q.arrived&&now(G)>T(a.day,a.h)+(a.late||0.25)+1e-6))){ if(q.state==='planned') q.state='missed'; S.fail(G,id,p.i); }
      if(!q&&now(G)>=T(a.day,a.h)+(a.late||0.25)) S.fail(G,id,p.i);
      return; }
    if(a.m==='zone'){ if(a.mid&&!a.midSent&&now(G)>=T(a.day,a.mid.h)&&now(G)<T(a.day,a.w1)){ a.midSent=true; S.send(G,id,a.day,a.mid.h,a.mid.msgs,'mid'); }
      if(now(G)>T(a.day,a.failH!=null?a.failH:a.w1)) S.fail(G,id,p.i); return; }
    if(a.m==='plg'){ if(now(G)>=T(a.day,22)) S.fail(G,id,p.i); return; } };
  /* 這一次沒到：照表傳那一則，換下一次；沒有下一次＝不回答 */
  S.fail=function(G,id,i){ const r=S.pr(G,id), p=r.plan; if(!p||p.i!==i) return; const a=p.att[i]; if(a.failed) return; a.failed=true;
    if(a.miss) S.send(G,id,a.day,a.miss.h,a.miss.msgs,'miss');
    p.i++; if(p.i>=p.att.length) S.noAnswer(G,id,p); else S.step(G,id); };
  S.outMissed=function(G,q){ const c=q&&q.ct; if(!c) return; S.fail(G,c.id,c.i); };
  S.cancel=function(G,id){ const r=S.pr(G,id), p=r.plan; if(p&&typeof OUT!=='undefined') for(let i=0;i<p.att.length;i++){ const q=OUT.get(G,S.outId(id,p,i)); if(q&&q.state==='planned') q.state='cancelled'; } r.plan=null; };
  /* 不回答（慢慢淡）*/
  S.noAnswer=function(G,id,p){ p=p||{}; const r=S.pr(G,id), mode=p.mode||null; r.talked[p.term||S.termKey(G)]=1; S.cancel(G,id); r.mode=mode||r.mode||null;
    if(id===AN&&mode==='jp_video'&&!r.jpUsed){ r.jpUsed=true; ROM.mend(G,id); return 'mend'; }   /* 她在日本那半年：沒有誰對誰錯的一次，預設是修補（AA_123 4-2）*/
    const X=L.DRIFT[id]; if(!X) return null;
    if(L.RETRY[id]&&p.unavoid&&!r.unavoidUsed){ r.unavoidUsed=true; r.drift={day:G.day+X.days,retry:true}; return 'retry'; }   /* 避不掉的那一件讓計數到 3：她說「我們再試一個月」（一次）*/
    r.drift={day:G.day+X.days}; return 'drift'; };
  S.drift=function(G,id){ const r=S.pr(G,id), x=r.drift; if(!x) return; const X=L.DRIFT[id], at=X.letter?12:21; if(now(G)<T(x.day,at)) return;
    r.drift=null;
    if(!dating(G,id)) return;   /* 已經因為別的事分開了 */
    if(x.retry){ S.send(G,id,x.day,at,[L.RETRY[id]],'retry'); ROM.mend(G,id); return; }
    if(X.msgs) S.send(G,id,x.day,at,id===PS&&r.mode==='video'&&X.video?X.video:X.msgs,'drift');
    if(X.noodle) r.noodle={from:x.day,until:x.day+60};
    if(X.letter) r.letter={from:x.day};
    S.apart(G,id,'apart_drift','drift'); };
  S.apart=function(G,id,how,why){ if(!ROM.end(G,id,how)) return false; G.flags['EX_'+id+'_REASON']=why||'talk'; return true; };
  /* 修補承諾（BB_119 第 7 節）*/
  S.zrLog=function(G,since){ if(typeof ZRUK==='undefined'||!ZRUK.rec) return []; return ZRUK.rec(G).w.log.filter(e=>e&&e.fix&&e.day>=since&&(e.ans==='yes'||e.ans==='missed')).slice(0,8); };
  S.commit=function(G,id){ const r=S.pr(G,id), c=r.commit; if(!c) return; if(!dating(G,id)){ r.commit=null; return; }
    if(c.kind==='zr_weekly'){ const Lg=S.zrLog(G,c.since), n=Lg.filter(e=>e.ans==='yes').length, m=Lg.length-n, inUK=typeof ZRUK!=='undefined'&&ZRUK.inUK&&ZRUK.inUK(G,Math.floor(twNow(G)/24+1e-9));
      if(n>=6||(!inUK&&m<3&&G.day>c.day)){ r.commit=null; r.kept=(r.kept|0)+1; return; }   /* 八週裡接六次（她回來以前沒有漏到三次也算）*/
      if(m>=3){ r.commit=null; S.send(G,id,G.day,+(G.hour||0).toFixed(2),[L.LAST[id]],'last'); S.apart(G,id,'apart_talk','talk'); } return; }   /* 沒做到＝分開；分開時她的最後一句 */
    if(c.kind==='zr_trip'){ const end=D('2029-02-19'); if(end==null||G.day<end) return; r.commit=null;
      if((typeof SOCIAL!=='undefined'&&SOCIAL.has&&SOCIAL.has(ZR,'UK_VISIT'))||G.flags.ZR_UK_VISIT){ r.kept=(r.kept|0)+1; return; }
      S.send(G,id,G.day,+(G.hour||0).toFixed(2),[L.LAST[id]],'last'); S.apart(G,id,'apart_talk','talk'); } };
  S.phone=function(G){ if(!law(G)||typeof PHONE==='undefined') return;
    try{ for(const id of S.IDS){ const r=S.pr(G,id);
        if(!r.plan&&(r.wait||S.due(G,id))) S.check(G,id);
        S.step(G,id); S.drift(G,id); S.commit(G,id); }
      S.seatPhone(G); }catch(e){ console.warn('CRACKTALK.phone',e); } };

  /* ======================= 談話本身 ======================= */
  const PRE={ev_an_talk_plg:L.PRE.plg,ev_an_talk_video:L.PRE.video,ev_an_talk_jp:L.PRE.jp,ev_yt_talk_video:L.PRE.video,ev_peishan_two_directions:L.PRE.video,ev_zhiruo_timezone_talk:L.PRE.video,ev_ziqing_direct_statement:L.PRE.river};
  const WHO={ev_an_talk:AN,ev_an_talk_plg:AN,ev_an_talk_video:AN,ev_an_talk_jp:AN,ev_yt_talk:YT,ev_yt_talk_video:YT,ev_peishan_two_directions:PS,ev_zhiruo_timezone_talk:ZR,ev_ziqing_direct_statement:ZQ};
  const TITLE={[AN]:'以安：理由',[YT]:'語彤：分出來的時間',[PS]:'沛珊：兩個方向',[ZR]:'芷若：時差',[ZQ]:'子晴：直述句'};
  const OUTING=new Set(['ev_an_talk_video','ev_an_talk_jp','ev_yt_talk_video','ev_peishan_two_directions','ev_zhiruo_timezone_talk','ev_ziqing_direct_statement']);
  S.prep=function(G,id){ const F=G.flags; F.CT_RES=null; F.CT_ASKED=false;
    if(id===ZR){ const td=Math.floor(twNow(G)/24+1e-9); F.CT_ZR_WINTER=typeof ZRUK!=='undefined'&&ZRUK.winter?!!ZRUK.winter(G,td):false;
      const wb=D('2028-12-25'); F.CT_ZR_TRIP_OK=!!evOf('ev_zhiruo_uk_visit')&&wb!=null&&G.day<wb; }
    if(id===PS){ const R=ROM.get(G,PS), d0=D('2026-12-17'); F.CT_PS_RETAKE=!!R&&R.sinceDay!=null&&d0!=null&&R.sinceDay<=d0; } };   /* 重考那年（2026-12-17 起）已經在交往 */
  S.after=function(G,id){ const F=G.flags, r=S.pr(G,id), res=F.CT_RES||'drift', p=r.plan||{}; r.talked[p.term||S.termKey(G)]=1; const mode=p.mode||null; S.cancel(G,id); r.mode=mode;
    F.CT_RES=null; F.CT_ASKED=false; r.last={day:G.day,res};
    if(res==='mend'||res==='commit_ps'||res==='commit_zq'){ ROM.mend(G,id); if(res!=='mend') r.commit=null, r.unverified=res; return res; }
    if(res==='commit_zr_weekly'){ F.ZR_WEEKLY_FIX=true; ROM.mend(G,id); r.commit={kind:'zr_weekly',since:Math.floor(twNow(G)/24+1e-9),day:G.day}; return res; }
    if(res==='commit_zr_trip'){ ROM.mend(G,id); r.commit={kind:'zr_trip',day:G.day}; return res; }
    if(res==='apart_talk'||res==='apart_life'){ S.apart(G,id,res,'talk'); return res; }
    return S.noAnswer(G,id,p); };
  S.EV=[];
  for(const evId of Object.keys(WHO)){ const id=WHO[evId];
    S.EV.push({id:evId,title:TITLE[id],participants:[id],location:'any',trigger:OUTING.has(evId)?'outing':'manual',background:evId==='ev_an_talk_plg'?'blur':(OUTING.has(evId)?'dark':'blur'),hours:evId==='ev_ziqing_direct_statement'?1:0.5,
      dialogue:(PRE[evId]||[]).concat(L.BODY[id]),
      beforeOuting:G=>S.prep(G,id), afterOuting:G=>{ S.after(G,id); }, outingMissed:(G,GM,q)=>S.outMissed(G,q)}); }
  S.EV.push({id:'ev_yt_drift_noodle',title:'麵店',participants:[YT],location:'noodle',trigger:'manual',background:'blur',dialogue:L.yt_noodle});
  for(const e of S.EV) if(!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e);
  let busy=false; const go=fn=>{ busy=true; Promise.resolve().then(fn).catch(e=>console.warn('CRACKTALK',e)).finally(()=>{ busy=false; }); return true; };
  S.isBusy=()=>busy;
  S.runTalk=async function(GM,id,evId){ const G=GM.G, e=evOf(evId); if(!e||typeof EVENTS==='undefined') return false; S.prep(G,id); await EVENTS.run(e,{noTitle:true}); S.after(G,id); if(GM.autosave) GM.autosave(); return true; };
  S.letter=async function(GM){ const G=GM.G, r=S.pr(G,ZR), X=L.DRIFT[ZR].letter; r.letter=null; GM.sceneBegin();
    try{ if(typeof ADV!=='undefined'&&ADV.begin) ADV.begin({background:'blur'}); await GM.say(null,X.nar); await GM.say({name:'小卡'},'「'+X.card+'」'); }
    finally{ if(typeof ADV!=='undefined'&&ADV.active&&ADV.end) ADV.end(); GM.sceneEnd(); } return true; };
  const free=GM=>{ const E=GM.E, P=E&&E.player; return !!P&&!E.paused&&!P.busy&&!(GM.D&&GM.D.active)&&!(typeof EVENTS!=='undefined'&&EVENTS.running)&&!(typeof ADV!=='undefined'&&ADV.active)&&!GM.titleIdle; };
  S.plgAttended=G=>typeof ACTIVITIES!=='undefined'&&!!ACTIVITIES.lastAttendedDay&&ACTIVITIES.lastAttendedDay(G,'public_law_group',true)===G.day;
  /* 每 0.5 秒：人到了（Café、總圖三樓）、讀書會散會、麵店那一句、信封、語彤的週四有沒有到總圖三樓 */
  S.tick=function(GM){ const G=GM&&GM.G; if(!G||!G.flags||!law(G)) return false; const t=now(G), h=hh(G), R=S.rec(G);
    { const s=R.seat[G.day]; if(s&&!s.done&&G.zone==='library'&&h>=17&&h<20) s.went=true; }
    if(busy||!free(GM)) return false;
    for(const id of S.IDS){ const r=R.r[id]; if(!r) continue; const p=r.plan;
      if(p&&dating(G,id)){ const a=p.att[p.i];
        if(a&&a.m==='zone'&&G.zone===a.zone&&t>=T(a.day,a.w0)&&t<=T(a.day,a.w1)) return go(()=>S.runTalk(GM,id,a.ev));
        if(a&&a.m==='plg'&&G.day===a.day&&h>=a.t1&&h<22&&S.plgAttended(G)) return go(()=>S.runTalk(GM,id,'ev_an_talk_plg')); }
      if(r.noodle&&G.zone==='noodle'&&G.day>=r.noodle.from){ if(G.day>r.noodle.until){ r.noodle=null; continue; } r.noodle=null; return go(()=>EVENTS.run(evOf('ev_yt_drift_noodle'),{noTitle:true})); }
      if(r.letter&&G.day>=r.letter.from) return go(()=>S.letter(GM)); }
    return false; };

  /* ======================= 裂縫來源 ======================= */
  /* 語彤①（AA_182 1-2）：交往中每週四 12:10「今天週四。總圖三樓，斜對面的位子我留了。」；那天沒去、也沒回「今天不行」＝+1 */
  S.seatOn=function(G,d){ if(!dating(G,YT)||abroad(G)||wdOf(d)!==4) return false; if(!(STORY.ytThuFree&&STORY.ytThuFree(Object.assign({},G,{day:d})))) return false;
    const r=S.pr(G,YT); if(r.drift) return false;   /* 不回答以後她不再留位子 */
    const p=r.plan, a=p&&p.att[p.i]; if(a&&a.m==='zone'&&a.day===d) return false;   /* 那天是談話：私訊換成談話那兩句 */
    const Gx=Object.assign({},G,{day:d,hour:17.5,weekday:4}); if(!pres(YT,Gx).here) return false;
    const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[YT], e=c&&STORY.schedEnt?STORY.schedEnt(c,Gx):null; return !!(e&&e.zone==='library'); };
  S.seatTag=d=>'ct_yt_seat_'+keyOf(d);
  S.seatPhone=function(G){ const R=S.rec(G), d=G.day, h=hh(G);
    if(wdOf(d)===4&&!R.seat[d]&&h>=12+10/60&&G.hour<20&&S.seatOn(G,d)){ R.seat[d]={went:false,done:false};
      PHONE.at(G,d,12+10/60,[Object.assign(DM(YT,L.SRC.yt_seat),{ask:{id:S.seatTag(d),until:T(d,20),opts:[{t:L.SRC.yt_seat_no,set:{['CT_YT_SEAT_NO_'+keyOf(d)]:true}}]}})],S.seatTag(d)); }
    for(const k of Object.keys(R.seat)){ const dd=+k, s=R.seat[k]; if(s.done||now(G)<T(dd,20)) continue; s.done=true;
      const no=!!G.flags['CT_YT_SEAT_NO_'+keyOf(dd)]; if(!s.went&&!no&&dating(G,YT)) S.add(G,YT,{unavoidable:false}); }
    for(const k of Object.keys(R.seat)) if(+k<d-60) delete R.seat[k]; };
  /* 芷若②（BB_119 2-3）：第二輪明信片連兩張沒回寄（交往中寄來的）＝下一張的最後一行多一句、+1（避不掉的那一種）*/
  S.pcNote=function(G,c){ if(!c||typeof R2Y4A==='undefined'||!R2Y4A.pc2Cards||!R2Y4A.pc2Rec) return false; const R=S.rec(G).pc; if(R.note[c.key]) return true;
    if(!dating(G,ZR)||c.i==null||c.i<2) return false; const Cs=R2Y4A.pc2Cards(G), p1=Cs.find(x=>x.i===c.i-1), p2=Cs.find(x=>x.i===c.i-2); if(!p1||!p2||p2.i<(R.from|0)) return false;
    const since=(ROM.get(G,ZR)||{}).sinceDay; if(since!=null&&p2.day<since) return false; const sent=R2Y4A.pc2Rec(G).sent||{}; if(sent[p1.key]||sent[p2.key]) return false;
    R.note[c.key]=G.day; R.from=c.i; S.add(G,ZR,{unavoidable:true}); return true; };
  if(typeof R2Y4A!=='undefined'&&R2Y4A.pc2Lines&&!R2Y4A._ctPc){ const p0=R2Y4A.pc2Lines; R2Y4A.pc2Lines=function(G,c){ const out=p0.apply(this,arguments); try{ if(S.pcNote(G,c)&&Array.isArray(out)) out.push({q:L.SRC.zr_pc}); }catch(e){ console.warn('CRACKTALK.pc',e); } return out; }; R2Y4A._ctPc=true; }

  /* 規格寫了、遊戲裡還沒有那個時刻或訊號的裂縫來源（回報 AA）*/
  S.SOURCES_MISSING=[
    '以安①：她約的讀書會或理由欄的週四——遊戲裡沒有她約的那一則（AA_182 沒有像語彤那樣寫訊號）',
    '以安②：她問意見時連續回「妳決定就好」——研究所、讀書會交棒那些事件沒有這個選項',
    '語彤②：要她把麵店或媽媽的時間讓出來——沒有「週四不要去麵店了，陪我」這類選項',
    '沛珊①：期中考週兩次約會因為他的考試改期——沒有改期的機制；③三週沒去溫州街——她大三起在台南（現行設定總表），和事實衝突；②摘要日課輔班的訊息——沒有寫什麼時候傳',
    '芷若③：戲院的照片——沒有寫什麼時候傳',
    '子晴①加班改期、②「今天又改了三個 bug」、③等她下班——沒有寫什麼時候、在哪裡' ];
  S.GAPS=[
    '沛珊修補「每個月留一天給溫州街」：之後三個月每月一次溫州街的邀約——她大三起在台南、不出現在溫州街（現行設定總表第 2 節），也沒有那個邀約；先當修補',
    '子晴修補「那妳來決定時間」：之後一個月她發的三次邀約——沒有邀約的台詞和時間；先當修補',
    '沛珊不回答的第一句「溫州街那天說的事……」：談話是視訊（她在台南），這一句不送，只送第二句',
    '沛珊分開時的最後一句「謝謝你在我重考那年陪我」：重考那年（2026-12-17 起）沒有在交往的不說',
    '芷若「寒假我去英國找妳」：1c-1 那一趟（ev_zhiruo_uk_visit）還沒進遊戲，選項先不出',
    '談話的選項「（給一個真的理由）」「（不回答）」、以安兩句動作描寫改旁白（「給他看」→「給你看」）、芷若信封的旁白、「我們再試一個月」的標點、子晴的貼圖寫法、語彤裂縫①的回覆「今天不行」：程式照規格補的字',
    '邀約裡的問句（沛珊「今晚九點，可以視訊嗎？」、芷若「明天你那邊下午五點，可以視訊嗎？」）沒有回覆選項：規格沒寫，回答就是接不接那通視訊' ];

  STORY.PHONE_RULES.push(G=>S.phone(G));
  STORY.TICKS.push((GM,dt)=>S.tick(GM,dt));
  return S;
})();
