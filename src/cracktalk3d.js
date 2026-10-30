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
       沛珊、子晴的修補怎麼驗照 AA_431 1-7（見下面）。
   ■ 裂縫來源（遊戲裡真的有給機會的）：
     語彤①（AA_182 1-2）：交往中、她的週四是自己的（STORY.ytThuFree）、那天 17:00～20:00 她照作息在總圖三樓＝12:10 她傳「今天週四。總圖三樓，斜對面的位子我留了。」；
            那天 17:00～20:00 你沒到總圖三樓、也沒回「今天不行」＝+1。
     芷若①：zr_uk3d.js 的每週視訊「早點睡。」連兩次（原本就有，ROM.crack）。芷若②：第二輪明信片（r2y4a3d.js）連兩張沒回寄＝下一張最後一行多「上一張你沒回。……」＋1（避不掉的）。
     AA_431 第 1 節（企劃線 434e6d6d7；1-1 照 AA_434 更正：讀書會週四 20:00～21:30）：
       以安①讀書會的週四 12:30 私訊（說會來或不回、20:30 還沒到＝21:40「你今天沒來。」+1）；以安②大二起第 4、10 週週二 21:00 問意見（連續兩題「妳決定就好。」＝+1）；
       語彤②每 4 週一次（顧店那天 16:30／回診前一晚週五 21:00，第三個選項＋1）；沛珊①期中考週改期（第 9 週＋1，避不掉）、②第 5 週週三 23:10、③連續兩個月沒去台南（避不掉）；
       芷若③第 6 週週日臺灣 07:00 戲院的照片（晚點再回、72 小時沒回＝+1）；子晴①大四上第 8～12 週加班取消（約人系統的約、校外約會的晚上；一個月第三次＋1）、②每月第一個週三 23:30、③手機選「我去妳公司樓下等妳」（30 天內第三次＋1）。
       修補承諾：沛珊「每個月我去台南找妳一次。」（之後三個月看 ev_hv_ps_tn，漏一個月她問、漏兩個月分開）；子晴「那妳來決定時間。」（她約三次，到兩次以上）。
       談話邀約的回覆選項：沛珊「明天可以嗎？」、芷若「後天可以嗎？」＝移到隔天。
   存檔：G.flags.CRACKTALK＝{r:{人物:{talked:{學期:1}, plan, drift, commit, lastUnavoid, unavoidUsed, jpUsed, mode}}, seat:{日:{went,done}}, seatTxt:{term,i}, pc:{from,note:{}}}；舊存檔沒有＝空的。
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
    if(typeof CALENDAR!=='undefined'&&CALENDAR.termOf){ const del=CALENDAR.termOfDelayed?(x=>CALENDAR.termOfDelayed(x)):(()=>null);
      for(let i=0;i<220;i++){ const t=CALENDAR.termOf(d-i); if(t){ k=t.id; break; } const t5=del(d-i); if(t5){ k=i===0?t5.id:'PG'; break; } } }   /* 寒暑假＝前一個學期 */
    /* AA_471 第 2 節：最後一個學期結束以後不要每天一個鍵（原本 220 天找不到就回 'D'+日子：2030-01 起語彤留位子每週都是原句、裂縫次數每天歸零）。
       交換延畢的大五上（CALENDAR.termOfDelayed，2029-09-03～12-23）＝'Y5S1'，之後＝'PG'；220 天找不到、而且在最後一個學期之後＝'PG' */
    if(!k&&typeof CALENDAR!=='undefined'&&Array.isArray(CALENDAR.TERMS)&&CALENDAR.TERMS.length&&CALENDAR.tOf){ const T=CALENDAR.TERMS[CALENDAR.TERMS.length-1]; if(T&&T.t1!=null&&CALENDAR.tOf(d)>=T.t1) k='PG'; }
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
    if(id===PS){ const d=vday(G,reach); P.mode='video'; const iv=toGame(G,d,20); const a=vid('ev_peishan_two_directions',G,d,21,true); a.invite={day:iv.day,h:iv.h,msgs:L.MSG.ps_video,opts:L.SRC2.psVideo,shift:2};   /* AA_431 1-7 第 7 點：回覆選項；「明天可以嗎？」＝移到隔天（第 3 次起）*/
      P.att=[a,vid('ev_peishan_two_directions',G,d,21.5,true),vid('ev_peishan_two_directions',G,d+1,21,true),vid('ev_peishan_two_directions',G,d+1,21.5,true)]; return P; }
    if(id===ZR){ const tw=twNow(G), td=Math.floor(tw/24+1e-9); if(typeof ZRUK==='undefined'||!ZRUK.inUK||!ZRUK.inUK(G,td)) return null;   /* 她不在英國：先等 */
      let s=null; for(let d=td;d<td+21;d++) if(wdOf(d)===6&&T(d-1,23.5)>=tw){ s=d; break; } if(s==null||!ZRUK.inUK(G,s)) return null; P.mode='video'; P.tw=s;
      const iv=toGame(G,s-1,23.5), a=vid('ev_zhiruo_timezone_talk',G,s,17,true), t5=toGame(G,s,17+5/60); a.invite={day:iv.day,h:iv.h,msgs:L.MSG.zr_ask,opts:L.SRC2.zrVideo,shift:2}; a.mid={day:t5.day,h:t5.h,msgs:L.MSG.zr_tea};
      P.att=[a,vid('ev_zhiruo_timezone_talk',G,s,17.5,true),vid('ev_zhiruo_timezone_talk',G,s+1,17,true),vid('ev_zhiruo_timezone_talk',G,s+1,17.5,true)]; return P; }
    if(id===ZQ){ if(meAb) return null;   /* 你在國外：先等（BB_119 9-1 沒有這一列）*/
      let s=nextWd(G.day,6,reach,-1,21); if(s==null) return null; if(keyOf(s)==='2029-05-12') s+=1;   /* 吉他社成發（AA_181）：改週日 */ P.mode='meet';
      const o={m:'out',ev:'ev_ziqing_direct_statement',h:19,late:1,place:'河堤',title:'河堤',travel:'走路 約 15 分鐘',travelH:0.25};
      P.att=[Object.assign({},o,{day:s,invite:{day:s-1,h:21,msgs:L.MSG.zq_ask},mid:{day:s,h:19.5,msgs:L.MSG.zq_wait},miss:{h:20,msgs:L.MSG.zq_next}}),Object.assign({},o,{day:s+1})]; return P; }
    return null; };

  /* ======================= 手機規則：私訊、出遊、沒到、不回答、修補承諾 ======================= */
  const DM=(id,t)=>({th:'p:'+id,from:id,text:t});
  const tagOf=(id,kind,day,h)=>'ct_'+id+'_'+kind+'_'+keyOf(day)+'_'+Math.round((h||0)*100);
  S.invAsk=(id,p)=>'ct_'+id+'_invask_'+p.term+'_'+(p.reach|0);
  /* 一則或幾則，最後一則帶回覆選項（AA_431 1-7 第 7 點：手機的問句一定要有回覆選項）*/
  S.sendAsk=function(G,id,day,h,msgs,tag,opts,until){ if(typeof PHONE==='undefined'||!msgs||!msgs.length) return false; opts=opts.map(o=>Object.assign({},o,{say:(o.say||[]).map(x=>Object.assign({tag:tag+'_r'},x))}));   /* 她的回覆也帶 tag（ct_…）*/
    return PHONE.at(G,day,h,msgs.map((t,k)=>k===msgs.length-1?Object.assign(DM(id,t),{ask:{id:tag,until:until!=null?until:null,opts}}):DM(id,t)),tag); };
  S.send=function(G,id,day,h,msgs,kind){ if(typeof PHONE==='undefined'||!msgs||!msgs.length) return false; return PHONE.at(G,day,h,msgs.map(t=>DM(id,t)),tagOf(id,kind,day,h)); };
  S.outId=(id,p,i)=>'ct_'+id+'_'+p.term+'_'+i;
  S.step=function(G,id){ const r=S.pr(G,id), p=r.plan; if(!p) return;
    if(!dating(G,id)){ S.cancel(G,id); return; }
    const a=p.att[p.i]; if(!a){ r.plan=null; return; }
    if(a.invite&&!a.invSent&&now(G)>=T(a.invite.day,a.invite.h)){ a.invSent=true; if(now(G)<T(a.day,a.h)+(a.late||1)){ if(a.invite.opts) S.sendAsk(G,id,a.invite.day,a.invite.h,a.invite.msgs,S.invAsk(id,p),a.invite.opts.map(o=>({t:o[0],say:[DM(id,o[1])]})),T(a.day,a.h)); else S.send(G,id,a.invite.day,a.invite.h,a.invite.msgs,'inv'); } }
    { const a0=p.att[0], v=a0&&a0.invite; if(v&&v.opts&&v.shift!=null&&!p.shifted&&p.i<v.shift&&typeof PHONE!=='undefined'){ const m=PHONE.byAsk(G,S.invAsk(id,p)); if(m&&m.ans===1){ p.shifted=true; for(let i=p.i;i<v.shift&&i<p.att.length;i++){ const q=typeof OUT!=='undefined'?OUT.get(G,S.outId(id,p,i)):null; if(q&&q.state==='planned') q.state='cancelled'; p.att[i].failed=true; } p.i=Math.min(v.shift,p.att.length-1); return S.step(G,id); } } }   /* 「明天／後天可以嗎？」：今天那兩次取消，從隔天的第一次開始（隔天沒接照現行的不回答）*/
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
    if(c.kind==='ps_month') return S.psMonthCommit(G,r,c);
    if(c.kind==='zq_month') return S.zqMonthCommit(G,r,c);
    if(c.kind==='zr_trip'){ const end=D('2029-02-19'); if(end==null||G.day<end) return; r.commit=null;
      if((typeof SOCIAL!=='undefined'&&SOCIAL.has&&SOCIAL.has(ZR,'UK_VISIT'))||G.flags.ZR_UK_VISIT){ r.kept=(r.kept|0)+1; return; }
      S.send(G,id,G.day,+(G.hour||0).toFixed(2),[L.LAST[id]],'last'); S.apart(G,id,'apart_talk','talk'); } };
  S.phone=function(G){ if(!law(G)||typeof PHONE==='undefined') return;
    try{ for(const id of S.IDS){ const r=S.pr(G,id);
        if(!r.plan&&(r.wait||S.due(G,id))) S.check(G,id);
        S.step(G,id); S.drift(G,id); S.commit(G,id); }
      S.seatPhone(G); S.srcPhone(G); }catch(e){ console.warn('CRACKTALK.phone',e); } };

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
    if(res==='mend'){ ROM.mend(G,id); return res; }
    if(res==='commit_ps'){ ROM.mend(G,id); r.commit={kind:'ps_month',day:G.day,miss:0,asked:{},done:{}}; return res; }   /* AA_431 1-7 第 1 點：之後三個月每個月去台南一次 */
    if(res==='commit_zq'){ ROM.mend(G,id); r.commit={kind:'zq_month',day:G.day,k:0,went:0,ans:{}}; return res; }   /* 1-7 第 2 點：之後一個月她約三次，到兩次以上 */
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
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['cracktalk3d:busy']=()=>{ busy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
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
    { const Z=R.src&&R.src.zq3; if(Z&&Z.pend!=null){ if(Z.pend===G.day) return go(()=>S.zq3Scene(GM)); Z.pend=null; } }   /* 子晴③：手機傳了「我去妳公司樓下等妳」、手機收起來以後 */
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
  /* 那一週傳哪一句（AA_462 第 3 節）：每學期（S.termKey，寒暑假算前一學期）第一個週四＝原句 yt_seat；之後 yt_seat_rot 四句照順序輪（不跟上一週同一句）。
     R.seatTxt＝{term, i}（上一週用了哪句：0＝原句、1～4＝輪的那四句）；舊存檔沒有＝從原句開始 */
  S.seatText=function(G,d){ const R=S.rec(G), k=S.termKey(G,d), P=R.seatTxt, rot=L.SRC.yt_seat_rot||[], n=rot.length;
    const i=(!P||typeof P!=='object'||P.term!==k||!n)?0:((P.i|0)%n)+1; R.seatTxt={term:k,i}; return i===0?L.SRC.yt_seat:rot[i-1]; };
  S.seatPhone=function(G){ const R=S.rec(G), d=G.day, h=hh(G);
    if(wdOf(d)===4&&!R.seat[d]&&h>=12+10/60&&G.hour<20&&S.seatOn(G,d)){ R.seat[d]={went:false,done:false};
      PHONE.at(G,d,12+10/60,[Object.assign(DM(YT,S.seatText(G,d)),{ask:{id:S.seatTag(d),until:T(d,20),opts:[{t:L.SRC.yt_seat_no,set:{['CT_YT_SEAT_NO_'+keyOf(d)]:true}}]}})],S.seatTag(d)); }
    for(const k of Object.keys(R.seat)){ const dd=+k, s=R.seat[k]; if(s.done||now(G)<T(dd,20)) continue; s.done=true;
      const no=!!G.flags['CT_YT_SEAT_NO_'+keyOf(dd)]; if(!s.went&&!no&&dating(G,YT)) S.add(G,YT,{unavoidable:false}); }
    for(const k of Object.keys(R.seat)) if(+k<d-60) delete R.seat[k]; };
  /* 芷若②（BB_119 2-3）：第二輪明信片連兩張沒回寄（交往中寄來的）＝下一張的最後一行多一句、+1（避不掉的那一種）*/
  S.pcNote=function(G,c){ if(!c||typeof R2Y4A==='undefined'||!R2Y4A.pc2Cards||!R2Y4A.pc2Rec) return false; const R=S.rec(G).pc; if(R.note[c.key]) return true;
    if(!dating(G,ZR)||c.i==null||c.i<2) return false; const Cs=R2Y4A.pc2Cards(G), p1=Cs.find(x=>x.i===c.i-1), p2=Cs.find(x=>x.i===c.i-2); if(!p1||!p2||p2.i<(R.from|0)) return false;
    const since=(ROM.get(G,ZR)||{}).sinceDay; if(since!=null&&p2.day<since) return false; const sent=R2Y4A.pc2Rec(G).sent||{}; if(sent[p1.key]||sent[p2.key]) return false;
    R.note[c.key]=G.day; R.from=c.i; S.add(G,ZR,{unavoidable:true}); return true; };
  if(typeof R2Y4A!=='undefined'&&R2Y4A.pc2Lines&&!R2Y4A._ctPc){ const p0=R2Y4A.pc2Lines; R2Y4A.pc2Lines=function(G,c){ const out=p0.apply(this,arguments); try{ if(S.pcNote(G,c)&&Array.isArray(out)) out.push({q:L.SRC.zr_pc}); }catch(e){ console.warn('CRACKTALK.pc',e); } return out; }; R2Y4A._ctPc=true; }

  /* ======================= AA_431 第 1 節：裂縫來源的時刻（企劃線 434e6d6d7；1-1 照 AA_434 的更正）======================= */
  const X2=L.SRC2;
  S.src=function(G){ const R=S.rec(G); if(!R.src||typeof R.src!=='object') R.src={}; return R.src; };
  const sub=(o,k)=>o[k]&&typeof o[k]==='object'?o[k]:(o[k]={});
  const ansOf=tag=>{ if(typeof PHONE==='undefined') return undefined; const m=PHONE.byAsk(_G,tag); return m?(m.ans==null?null:m.ans):undefined; };   /* 沒送到＝undefined；送到還沒回＝null */
  let _G=null;
  const opt3=(id,opts)=>opts.map(o=>({t:o[0],say:[].concat(o[1]||[]).map(t=>DM(id,t))}));
  const tutorOn=G=>typeof JOBS!=='undefined'&&JOBS.at?!!JOBS.at(G,'tutor'):!!(G.flags&&G.flags.JOB_TUTOR);
  const dayOfTerm=(id,week,wd)=>{ const k=id+'|'+week+'|'+wd; if(k in dtc) return dtc[k]; let r=null; for(let d=D('2024-08-01');d!=null&&d<D('2031-01-01');d++){ const t=CALENDAR.termOf(d); if(t&&t.id===id&&t.week===week&&wdOf(d)===wd){ r=d; break; } } return dtc[k]=r; };
  const dtc={};
  const monthOf=d=>keyOf(d).slice(0,7);
  const m1Cache={}; S.monthFirst=m=>m in m1Cache?m1Cache[m]:(m1Cache[m]=D(m+'-01'));
  S.monthNext=m=>{ let [y,mo]=m.split('-').map(Number); mo++; if(mo>12){ mo=1; y++; } return y+'-'+String(mo).padStart(2,'0'); };
  S.monthLast=m=>{ const n=S.monthFirst(S.monthNext(m)); return n==null?null:n-1; };
  /* 算不算一個月（她在台南的學期中）：那個月有 15 天以上是學期中、而且月中她在台南——寒暑假（她在台中）不算 */
  /* AA_531 3-1：祐廷人在國外的日子（交換）和寒暑假一樣不算——原本美國那一學期照算，10/31 照發「這個月你也沒來。」還加裂縫（避不掉）。快取照路線分（國外的日子只看路線）*/
  const mcCache={}; S.monthCounts=function(G,m){ const ar=typeof STORY.routeAbroadRoute==='function'?(STORY.routeAbroadRoute(G)||''):'', k=m+'|'+ar; if(k in mcCache) return mcCache[k]; const a=S.monthFirst(m), b=S.monthLast(m); if(a==null||b==null) return mcCache[k]=false; let n=0; for(let d=a;d<=b;d++) if(CALENDAR.termOf(d)&&!(CALENDAR.holiday&&CALENDAR.holiday(d))&&!(ar&&abroad(Object.assign({},G,{day:d})))) n++;
    return mcCache[k]=n>=15&&S.psTN(G,a+14); };
  S.psTN=(G,d)=>{ const p=pres(PS,Object.assign({},G,{day:d})); return p.kind==='city'&&p.city==='台南'; };
  /* 去台南找她（hometown3d.js 的出遊 ev_hv_ps_tn）：每一次的日子記下來（G.events.last 只留最後一次）*/
  S.psVisits=function(G){ const R=sub(S.src(G),'ps'), V=R.visits||(R.visits=[]), d=G.events&&G.events.last&&G.events.last.ev_hv_ps_tn; if(d!=null&&!V.includes(d)){ V.push(d); if(V.length>40) V.splice(0,V.length-40); } return V; };
  S.psVisited=(G,m)=>S.psVisits(G).some(d=>monthOf(d)===m);

  /* ---------- 1-1 以安①：讀書會的週四 12:30「今晚讀書會 20:00，萬才館研討室 A。你來嗎？」---------- */
  S.an1On=function(G,d){ if(!dating(G,AN)||wdOf(d)!==4||abroad(G)||!done(G,'ev_public_law_group')) return false; const hand=D('2028-11-30'); if(hand!=null&&d>=hand) return false;
    if(!S.plgOn(G,d)) return false; const p=S.pr(G,AN).plan, a=p&&p.att[p.i]; if(a&&a.day===d) return false; return true; };   /* 那天是談話＝不傳 */
  S.an1Came=(G,d)=>{ const A=(G.acts&&G.acts.att)||{}, r=A['public_law_group@'+d]; return !!r&&(r.h==null||r.h<=20.5); };   /* 20:30 以前到 */
  S.an1=function(G){ const R=sub(S.src(G),'an1'), d=G.day, h=hh(G), tag=x=>'ct_an1_'+keyOf(x);
    if(wdOf(d)===4&&!R[d]&&h>=12.5&&h<20&&S.an1On(G,d)){ R[d]={}; const O=X2.an1.opts.filter((o,i)=>i<2||tutorOn(G)); S.sendAsk(G,AN,d,12.5,[X2.an1.ask],tag(d),O.map(o=>({t:o[0],say:[DM(AN,o[1])],set:{['CT_AN1_'+keyOf(d)]:o[2]}})),T(d,20)); }
    for(const k of Object.keys(R)){ const dd=+k, r=R[k]; if(r.done||now(G)<T(dd,21+40/60)) continue; r.done=true; const a=G.flags['CT_AN1_'+keyOf(dd)];
      if(a!=='no'&&!S.an1Came(G,dd)&&dating(G,AN)){ S.send(G,AN,dd,21+40/60,[X2.an1.miss],'an1miss'); S.add(G,AN); } }   /* 說了「會。」或不回、20:30 還沒到＝21:40「你今天沒來。」+1；婉拒有說理由＝0 */
    for(const k of Object.keys(R)) if(+k<d-60) delete R[k]; };

  /* ---------- 1-2 以安②：第 4、10 週的週二 21:00 問意見；連續兩題「妳決定就好。」＝+1 ---------- */
  S.an2=function(G){ const R=sub(S.src(G),'an2'), U=sub(R,'used'), t=CALENDAR.termOf(G.day), tag=i=>'ct_an2_'+i;
    if(t&&dating(G,AN)&&!abroad(G)&&pres(AN,G).kind!=='abroad'){ for(const q of (X2.an2[t.id]||[])){ if(U[q.i]!=null) continue; const d=dayOfTerm(t.id,q.w,2); if(d==null||G.day<d||G.day>d+1||now(G)<T(d,21)) continue;
        U[q.i]=d; const again=(R.streak|0)===1, O=q.opts.map((o,k)=>({t:o[0],say:[DM(AN,k===2&&again?X2.an2.again:o[1])]})); S.sendAsk(G,AN,d,21,[q.q],tag(q.i),O,T(d+7,21)); } }
    for(const i of Object.keys(U)){ const P=sub(R,'done'); if(P[i]) continue; const a=ansOf(tag(i)); if(a==null){ if(U[i]!=null&&now(G)>T(U[i]+7,21)) P[i]='none'; continue; } P[i]=a;   /* 沒回＝不算、也不打斷 */
      if(a===2){ R.streak=(R.streak|0)+1; if(R.streak>=2){ R.streak=0; S.add(G,AN); } } else R.streak=0; } };   /* 中間有一題認真回答＝重新算 */

  /* ---------- 1-3 語彤②：每 4 週一次，A 顧店那天 16:30／B 媽媽回診的前一晚（週五 21:00），二選一輪流 ---------- */
  S.ytShop=(G,d)=>{ if(typeof NOODLE_CLOSED!=='undefined'&&NOODLE_CLOSED.closed&&NOODLE_CLOSED.closed(G,d)) return false;   /* AA_532 第 1 節（企劃線 ade80d22f）：麵店過年店休（除夕前 6 天～初三，noodle_closed3d.js）＝沒顧店（原本 2028 除夕她說「今天顧店到九點。」）*/
    const w=wdOf(d); return w===2||(w===4&&!(STORY.ytThuFree&&STORY.ytThuFree(Object.assign({},G,{day:d})))); };   /* 事件 13 以後週四是她自己的 */
  S.yt2=function(G){ const R=sub(S.src(G),'yt2'), tag=n=>'ct_yt2_'+n;
    if(dating(G,YT)){ if(R.next==null){ const since=(ROM.get(G,YT)||{}).sinceDay; R.next=(since!=null?since:G.day)+28; R.n=0; }
      if(G.day>=R.next&&!abroad(G)&&pres(YT,G).here){ const k=(R.n|0)%2===0?'A':'B', h=hh(G), X=X2.yt2[k];
        if((k==='A'&&S.ytShop(G,G.day)&&h>=16.5&&h<21)||(k==='B'&&wdOf(G.day)===5&&h>=21)){ const n=R.n|0, A=[].concat(X.ask), c=Object.values(R.sent||{}).filter(v=>v===k).length, i=c<A.length?c:(A.length>1?1+(c-1)%(A.length-1):0);   /* 開頭照這一種（A／B）第幾次輪流（AA_457 第 2 節）：已經收過幾次（sent 裡同一種的筆數，舊存檔照算）→ 第 1～4 次照表、第 5 次起從第 2 組再輪；tag 照舊 ct_yt2_<n> */
          S.sendAsk(G,YT,G.day,k==='A'?16.5:21,[A[i]],tag(n),opt3(YT,X.opts),k==='A'?T(G.day,21):T(G.day+1,12)); (R.sent||(R.sent={}))[n]=k; R.n=n+1; R.next=G.day+28; } } }
    else R.next=null;
    for(const n of Object.keys(R.sent||{})){ const P=sub(R,'done'); if(P[n]) continue; const a=ansOf(tag(n)); if(a==null) continue; P[n]=true; const X=X2.yt2[R.sent[n]]; if(X.opts[a]&&X.opts[a][2]) S.add(G,YT); } };   /* 不回＝0（她本來就只是告知）*/

  /* ---------- 1-4 沛珊（大三起她在台南）---------- */
  /* 第 8、9 週哪幾週有期中考（AA_463 第 7 節③）：{8:bool, 9:bool}，同 S.midBoth 的算法 */
  const mwCache={}; S.midWeeks=function(G,tid){ if(tid in mwCache) return mwCache[tid]; if(typeof CLS==='undefined'||!CLS.dayItems) return mwCache[tid]={8:false,9:false};
    const has=w=>{ for(let wd=1;wd<=5;wd++){ const d=dayOfTerm(tid,w,wd); if(d!=null&&CLS.dayItems(Object.assign({},G,{day:d}),d).some(it=>it.exam==='mid')) return true; } return false; };
    return mwCache[tid]={8:has(8),9:has(9)}; };
  const midCache={}; S.midBoth=function(G,tid){ if(tid in midCache) return midCache[tid]; if(typeof CLS==='undefined'||!CLS.dayItems) return midCache[tid]=false; const has=w=>{ for(let wd=1;wd<=5;wd++){ const d=dayOfTerm(tid,w,wd); if(d!=null&&CLS.dayItems(Object.assign({},G,{day:d}),d).some(it=>it.exam==='mid')) return true; } return false; };
    return midCache[tid]=has(8)&&has(9); };   /* 祐廷的期中考在第 8、9 兩週都有；只有一週的學期沒有這一項 */
  S.ps=function(G){ const R=sub(S.src(G),'ps'), d=G.day, h=hh(G), t=CALENDAR.termOf(d); S.psVisits(G);
    const on=dating(G,PS)&&!abroad(G)&&S.psTN(G,d);
    /* ① 期中考週的週五 21:00：改期（避不掉）*/
    /* 觸發條件（AA_463 第 7 節③）：那學期第 8 或第 9 週有期中考＝有考試的第一個週五發第 8 週那一版（不加）；兩週都有考試的，第二個週五（第 9 週）再發第 9 週那一版（加裂縫，避不掉）。tag 照週次 ct_ps1_<學期>_<週> */
    if(on&&t&&(t.week===8||t.week===9)&&wdOf(d)===5&&h>=21){ const k='ps1_'+t.id+'_'+t.week, S1=sub(R,'sent'), MW=S.midWeeks(G,t.id); if(!S1[k]&&MW[t.week]){ S1[k]=d; const second=t.week===9&&MW[8], P1=Object.assign({},X2.ps1,(X2.ps1.byTerm||{})[t.id]||{});   /* 她的話照學期換（AA_463 4-3）*/
        PHONE.at(G,d,21,[DM(PS,P1.ask),{th:'p:'+PS,from:'player',who:null,text:P1.me}].concat((second?P1.w9:P1.w8).map(x=>DM(PS,x))),'ct_'+k); if(second) S.add(G,PS,{unavoidable:true}); } }
    /* ② 第 5 週週三 23:10：用法條回答 */
    if(on&&t&&t.week===5&&wdOf(d)===3&&h>=23+10/60){ const k='ps2_'+t.id, S1=sub(R,'sent'); if(!S1[k]){ const c=Object.keys(S1).filter(x=>/^ps2_/.test(x)).length, i=S.nthRot(c,1+(X2.ps2x||[]).length), X=S.ps2Of(i);   /* 照第幾次換（AA_463 4-1）：已經收過幾次（sent 裡 ps2_ 的筆數，舊存檔照算）*/
        S1[k]=d; sub(R,'v2')[k]=i; S.sendAsk(G,PS,d,23+10/60,[X.ask],'ct_'+k,opt3(PS,X.opts),T(d+1,23)); } }
    for(const k of Object.keys(R.sent||{})){ if(!/^ps2_/.test(k)) continue; const P=sub(R,'done'); if(P[k]) continue; const a=ansOf('ct_'+k); if(a==null) continue; P[k]=true; const X=S.ps2Of((R.v2||{})[k]|0); if(X.opts[a]&&X.opts[a][2]) S.add(G,PS); }   /* 不回＝0（隔天她傳一張貼圖：AA 沒寫哪一張，沒有傳）*/
    /* ③ 連續兩個自然月（寒暑假不算）都沒去台南找她：第二個月最後一天 23:00（避不掉）；修補期間由修補那邊管 */
    if(dating(G,PS)&&!(S.pr(G,PS).commit&&S.pr(G,PS).commit.kind==='ps_month')){ const since=(ROM.get(G,PS)||{}).sinceDay, m=monthOf(d), last=S.monthLast(m);
      if(last===d&&h>=23&&S.monthCounts(G,m)&&R.m3!==m){ let prev=null, x=m; for(let i=0;i<8;i++){ x=S.monthPrev(x); if(S.monthCounts(G,x)){ prev=x; break; } }
        const okSince=prev&&since!=null&&S.monthFirst(prev)>since&&(R.m3==null||R.m3<prev);   /* 兩個月都在交往以後、上一次問過以後 */
        if(okSince&&!S.psVisited(G,m)&&!S.psVisited(G,prev)){ if(R.n3==null) R.n3=R.m3!=null?1:0; const i=S.nthRot(R.n3|0,1+(X2.ps3x||[]).length); R.m3=m; R.n3=(R.n3|0)+1;   /* 照第幾次換（AA_463 4-2）：R.n3＝收過幾次；舊存檔沒有＝問過（m3）算一次、沒問過從第 1 句 */
          S.send(G,PS,d,23,i===0?X2.ps3:X2.ps3x[i-1],'ps3'); S.add(G,PS,{unavoidable:true}); } } } };
  /* 第幾次（c＝已經收過幾次，0 起算）用第幾組（n 組）：第 1～n 次照順序，之後從第 2 組再輪（同 yt2 的開頭，AA_457 第 2 節；AA_463 4-2「5 以後從 2 再輪」）*/
  S.nthRot=(c,n)=>c<n?c:(n>1?1+(c-1)%(n-1):0);
  S.ps2Of=i=>i>0&&X2.ps2x&&X2.ps2x[i-1]?X2.ps2x[i-1]:X2.ps2;
  S.monthPrev=m=>{ let [y,mo]=m.split('-').map(Number); mo--; if(mo<1){ mo=12; y--; } return y+'-'+String(mo).padStart(2,'0'); };
  /* 修補「每個月我去台南找妳一次。」（1-7 第 1 點）：之後三個月（寒暑假往後延），每個月至少一次；漏一個月＝下個月 1 日 21:00 她問；漏兩個月＝分開 */
  S.psMonthCommit=function(G,r,c){ S.psVisits(G); const d=G.day; let m=monthOf(c.day), n=0;
    for(let i=0;i<14&&n<3;i++){ m=S.monthNext(m); if(!S.monthCounts(G,m)) continue; n++; const last=S.monthLast(m); if(last==null||d<=last) break;
      if(c.done[m]) continue; c.done[m]=true; if(S.psVisited(G,m)) continue; c.miss=(c.miss|0)+1;
      if(c.miss>=2){ r.commit=null; S.send(G,PS,d,+(G.hour||0).toFixed(2),[S.psLast(G)],'last'); S.apart(G,PS,'apart_talk','talk'); return; }
      if(!c.asked[m]){ c.asked[m]=true; S.send(G,PS,last+1,21,[X2.psMonth],'psmonth'); } }
    if(n>=3){ const lm=m, last=S.monthLast(lm); if(last!=null&&d>last&&c.done[lm]){ r.commit=null; r.kept=(r.kept|0)+1; } } };
  S.psLast=G=>{ const R=ROM.get(G,PS), d0=D('2026-12-17'); return R&&R.sinceDay!=null&&d0!=null&&R.sinceDay<=d0?L.LAST.ps.retake:L.LAST.ps.other; };   /* 1-7 第 4 點 */

  /* ---------- 1-5 芷若③：她在英國，每學期第 6 週週日臺灣 07:00 戲院的照片 ---------- */
  S.zr=function(G){ const R=sub(S.src(G),'zr'), td=Math.floor(twNow(G)/24+1e-9), t=CALENDAR.termOf(td), tag=k=>'ct_zr3_'+k;
    if(dating(G,ZR)&&t&&t.week===6&&wdOf(td)===0&&twNow(G)-td*24>=7&&typeof ZRUK!=='undefined'&&ZRUK.inUK&&ZRUK.inUK(G,td)){ const S1=sub(R,'sent'); if(!S1[t.id]){ const c=toGame(G,td,7); S1[t.id]={day:c.day,h:c.h};
        S.sendAsk(G,ZR,c.day,c.h,X2.zr3.msgs,tag(t.id),[{t:X2.zr3.opts[0][0],say:[DM(ZR,X2.zr3.opts[0][1])]},{t:X2.zr3.opts[1][0],post:false,set:{['CT_ZR3_LATER_'+t.id]:true}}],T(c.day,c.h)+72); } }
    for(const k of Object.keys(R.sent||{})){ const s0=R.sent[k], P=sub(R,'done'); if(P[k]) continue; const a=ansOf(tag(k)), at=T(s0.day,s0.h);
      if(a===0){ P[k]=true; continue; }
      if(a===1){ if(now(G)>=at+48){ P[k]=true; const dd=Math.floor((at+48)/24+1e-9), hx=+(at+48-dd*24).toFixed(2); PHONE.at(G,dd,hx,[{th:'p:'+ZR,from:'player',who:null,text:X2.zr3.later},DM(ZR,X2.zr3.laterReply)],'ct_zr3_later_'+k); if(dating(G,ZR)) S.add(G,ZR); } continue; }   /* 兩天後那則自動送出「好看」、她回「嗯。」，+1 */
      if(a===null&&now(G)>=at+72){ P[k]=true; if(dating(G,ZR)) S.add(G,ZR); } } };   /* 72 小時沒回＝+1 */

  /* ---------- 1-6 子晴（2028-07-10 曼谷回來起在工作室上班；AA_508 0-2 第 4 點，原本 2028-06-01）---------- */
  S.zqWork=(G,d)=>{ const a=D('2028-07-10'); if(a==null||(d==null?G.day:d)<a) return false; const p=pres(ZQ,d==null?G:Object.assign({},G,{day:d})); return p.kind==='taipei'||!!p.here; };
  S.zq=function(G){ const R=sub(S.src(G),'zq'), d=G.day, h=hh(G);
    /* ① 大四上第 8～12 週，約好的平日晚上（約人系統 INV 的約、校外約會 DATE 的預約）：那天 17:30「又要加班 對不起」、行程取消；同一個自然月第三次多一則、+1（避不掉）*/
    if(dating(G,ZQ)&&S.zqWork(G)){ const C=[];
      for(const iv of (G.invites||[])) if(iv&&iv.who===ZQ&&iv.state==='accepted'&&!iv.zqOT) C.push({o:iv,key:'ct_zq1_'+iv.id,day:iv.day,h:iv.h,cancel:()=>{ iv.state='cancelled'; }});
      if(typeof DATE!=='undefined'&&DATE.rec) DATE.rec(G); for(const tr of (G.trips||[])) if(tr&&tr.who===ZQ&&tr.status==='booked'&&!tr.zqOT&&(tr.kind==='evening'||(+tr.depart||0)>=17)) C.push({o:tr,key:'ct_zq1_d'+tr.trip,day:tr.day,h:+tr.depart||19,cancel:()=>{ tr.status='cancelled'; const q=typeof OUT!=='undefined'&&OUT.get?OUT.get(G,'date_'+tr.trip):null; if(q&&q.state==='planned') q.state='skipped'; }});   /* 校外約會：晚上那一種（evening）*/
      for(const c of C.sort((a,b)=>T(a.day,a.h)-T(b.day,b.h))){ const t=CALENDAR.termOf(c.day), w=wdOf(c.day);
        if(!t||t.id!=='Y4S1'||t.week<8||t.week>12||w<1||w>5||c.h<17) continue; if(now(G)<T(c.day,17.5)||now(G)>=T(c.day,c.h)+0.5) continue;
        c.o.zqOT=true; c.cancel(); const m=monthOf(c.day), M=sub(R,'ot'); M[m]=(M[m]|0)+1;
        S.sendAsk(G,ZQ,c.day,17.5,[X2.zq1.msg].concat(M[m]===3?[X2.zq1.third]:[]),c.key,[{t:X2.zq1.opt[0],say:[DM(ZQ,X2.zq1.opt[1])]}],T(c.day+1,23)); if(M[m]===3) S.add(G,ZQ,{unavoidable:true}); } }
    /* ② 每個月第一個週三 23:30「今天又改了三個 bug」*/
    /* AA_531 3-2：祐廷人在美國＝照她那邊（臺灣）的時間（每個月第一個週三 23:30＝美東中午前後）、第二個選項換國外版「我這邊中午。開視訊陪妳？」（數值照原本的第二個選項）；
       人在日本不傳（「要我過去陪妳加班嗎？」過不去、「我這邊中午」對不上；稿只寫美國）*/
    const zab=abroad(G), zus=zab&&typeof STORY.routeAbroadRoute==='function'&&STORY.routeAbroadRoute(G)==='US', ztn=twNow(G), zd=zab?Math.floor(ztn/24+1e-9):d, zh=zab?ztn-zd*24:h;
    if(dating(G,ZQ)&&(!zab||zus)&&S.zqWork(G,zd)&&wdOf(zd)===3&&CALENDAR.dateOf(zd).d<=7&&zh>=23.5){ const S1=sub(R,'sent2'), m=monthOf(zd); if(!S1[m]){ const M2=X2.zq2.msgs, k=Object.keys(S1).length, vi=Array.isArray(M2[0])?k%M2.length:0, mg=Array.isArray(M2[0])?M2[vi]:M2, O0=(X2.zq2.optsBy&&X2.zq2.optsBy[vi])||X2.zq2.opts, O=zus&&X2.zq2.abroadOpt?[O0[0],X2.zq2.abroadOpt]:O0, c=zab?toGame(G,zd,23.5):{day:d,h:23.5}; S1[m]=c.day; S.sendAsk(G,ZQ,c.day,c.h,mg,'ct_zq2_'+m,opt3(ZQ,O),T(c.day,c.h)+24); } }   /* 她回的照那一組換（AA_464 第 3 節；會不會加裂縫照 opts）*/   /* 開頭兩則照第幾個月輪流（AA_456 1-6）：已經收過幾個月（sent2 的筆數，舊存檔照算）→ 第 k%4 組；tag 照舊 ct_zq2_<年-月> */
    for(const m of Object.keys(R.sent2||{})){ const P=sub(R,'done2'); if(P[m]) continue; const a=ansOf('ct_zq2_'+m); if(a==null) continue; P[m]=true; if(X2.zq2.opts[a]&&X2.zq2.opts[a][2]) S.add(G,ZQ); } };
  /* ③ 等她下班：手機私訊選「我去妳公司樓下等妳」（MSG 的話題；她上班以後、交往中、平日 19:00～21:30）→ 2D 短場景、1 小時；30 天內第三次＝+1 */
  S.zq3On=G=>law(G)&&dating(G,ZQ)&&S.zqWork(G)&&!abroad(G)&&wdOf(G.day)>=1&&wdOf(G.day)<=5&&hh(G)>=19&&hh(G)<21.5;
  if(typeof MSG!=='undefined'&&MSG.topics&&MSG.send&&!MSG._ctZq3){ const t0=MSG.topics, s0=MSG.send;
    MSG.topics=function(G,id){ const out=t0.apply(this,arguments); try{ if(id===ZQ&&G&&S.zq3On(G)&&Array.isArray(out)&&!out.some(q=>q.k==='zq_wait')&&(!MSG.open||MSG.open(G,id).ok)) return out.concat([{k:'zq_wait',t:X2.zq3.opt}]); }catch(e){} return out; };
    MSG.send=function(G,id,topic){ if(topic!=='zq_wait') return s0.apply(this,arguments); if(id!==ZQ||!S.zq3On(G)||(MSG.canSend&&!MSG.canSend(G,id))) return {ok:false,why:'這個話題現在不行'};
      if(typeof PHONE!=='undefined') PHONE.post(G,{th:'p:'+ZQ,from:'player',who:null,text:X2.zq3.opt}); if(MSG.rec) MSG.rec(G).sent[id]=G.day; sub(S.src(G),'zq3').pend=G.day; return {ok:true,text:X2.zq3.opt}; };
    MSG._ctZq3=true; }
  S.zq3Scene=async function(GM){ const G=GM.G, R=sub(S.src(G),'zq3'); R.pend=null; const Lg=(R.log||(R.log=[])).filter(x=>x>G.day-30); const n=(R.n|0)+1; R.n=n; Lg.push(G.day); R.log=Lg;
    const third=Lg.length>=3, V=n===1?X2.zq3.first:(third?X2.zq3.third:X2.zq3.second); if(third) R.log=[];
    GM.sceneBegin(); try{ if(typeof ADV!=='undefined'&&ADV.begin) ADV.begin({background:'dark'}); if(GM.caption) GM.caption('',X2.zq3.scene,2400); await GM.say(null,X2.zq3.nar); if(EVENTS.runLines) await EVENTS.runLines(V,{id:'ct_zq3'}); if(GM.advance) GM.advance(1); }
    finally{ if(typeof ADV!=='undefined'&&ADV.active&&ADV.end) ADV.end(); GM.sceneEnd(); }
    if(third&&dating(G,ZQ)) S.add(G,ZQ); return true; };
  /* 修補「那妳來決定時間。」（1-7 第 2 點）：她約三次（週三 22:30／第二週週四 23:00／第三週週二 22:40），到兩次以上＝做到；沒做到＝分開＋最後一句 */
  S.zqMonthDays=c=>{ let w=c.day+1; while(wdOf(w)!==3) w++; return [{dm:w,dm_h:22.5,at:w+2},{dm:w+8,dm_h:23,at:w+11},{dm:w+13,dm_h:22+40/60,at:w+17}]; };
  S.zqMonthCommit=function(G,r,c){ const P=S.zqMonthDays(c);
    P.forEach((x,i)=>{ const tg='ct_zqm_'+c.day+'_'+i, I=X2.zqMonth.inv[i]; if(!c.ans[i]&&now(G)>=T(x.dm,x.dm_h)){ c.ans[i]='sent'; S.sendAsk(G,ZQ,x.dm,x.dm_h,I.dm,tg,X2.zqMonth.opts.map((t,k)=>({t,set:{['CT_ZQM_'+c.day+'_'+i]:k===0?'yes':'no'}})),T(x.at,I.h)); }
      if(c.ans[i]==='sent'){ const a=G.flags['CT_ZQM_'+c.day+'_'+i]; if(a==='yes'&&typeof OUT!=='undefined'){ c.ans[i]='yes'; OUT.plan(G,{id:'ct_zqm_'+c.day+'_'+i,ev:'ev_ziqing_month_'+i,day:x.at,h:I.h,late:0.5,place:I.place,title:I.place,travel:'',travelH:0}); } else if(a==='no'||now(G)>=T(x.at,I.h)) c.ans[i]='no'; } });
    if(now(G)<T(P[2].at,X2.zqMonth.inv[2].h)+3) return;   /* 第三次見面結束以後才算 */
    r.commit=null; if((c.went|0)>=2){ r.kept=(r.kept|0)+1; return; } S.send(G,ZQ,G.day,+(G.hour||0).toFixed(2),[L.LAST[ZQ]],'last'); S.apart(G,ZQ,'apart_talk','talk'); };
  S.zqMonthEv=i=>{ const I=X2.zqMonth.inv[i]; return {id:'ev_ziqing_month_'+i,title:I.place,participants:[ZQ],location:'any',trigger:'outing',once:false,background:'dark',hours:i===0?1:2,
    dialogue:[{scene:I.place,bg:I.bg}].concat(i===2?[{if:{custom:G=>!!G.flags.CT_ZQM_OK},speaker:ZQ,text:X2.zqMonth.ok}]:[]),
    beforeOuting:G=>{ const c=S.pr(G,ZQ).commit; G.flags.CT_ZQM_OK=!!c&&((c.went|0)+1>=2); },
    afterOuting:G=>{ const c=S.pr(G,ZQ).commit; if(c&&c.kind==='zq_month') c.went=(c.went|0)+1; G.flags.CT_ZQM_OK=false; }}; };
  for(let i=0;i<3;i++){ const e=S.zqMonthEv(i); if(!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e); }

  S.srcPhone=function(G){ if(typeof PHONE==='undefined'||typeof CALENDAR==='undefined') return; _G=G; try{ S.an1(G); S.an2(G); S.yt2(G); S.ps(G); S.zr(G); S.zq(G); } finally { _G=null; } };

  /* 規格寫了、遊戲裡還沒有那個時刻或訊號的裂縫來源（回報 AA）*/
  S.SOURCES_MISSING=[
    '沛珊②不回：AA_431 寫「隔天她傳一張貼圖，不加」，沒有寫是哪一張貼圖——沒有傳',
    '以安①「20:30 還沒到、也沒再傳訊息」：玩家那天有沒有再傳訊息給她沒有判斷（只看 20:30 以前有沒有到讀書會）',
    '子晴③：手機「傳訊息」的話題（MSG.topics／MSG.send 包一層）——一天只能傳一次的限制照 MSG' ];
  S.GAPS=[
    '芷若「寒假我去英國找妳」：1c-1 那一趟（ev_zhiruo_uk_visit）還沒進遊戲，選項先不出（AA_431 1-7 第 5 點：照這樣）',
    '語彤②第一次：交往開始 28 天以後（AA_431 只寫「每 4 週一次」，沒寫從哪一天算）；之後每 28 天，A、B 輪流',
    '沛珊③、修補驗證的「一個月」：那個月有 15 天以上是學期中、月中她在台南才算（寒暑假她在台中，不算、往後延）；修補漏一個月＝下個月 1 日 21:00 她問「這個月你會來嗎？」',
    '子晴修補三次邀約的「第二週」「第三週」：從她第一次約的那個週三算（第二週週四＝＋8 天、第三週週二＝＋13 天）；沒回＝那一次沒到',
    '手機的回覆選項不加「」（企劃表格的「會。」＝祐廷傳出去的字）；子晴③的場景字幕寫「夜裡的辦公大樓門口」（AA_431 的背景說明）' ];

  STORY.PHONE_RULES.push(G=>S.phone(G));
  STORY.TICKS.push((GM,dt)=>S.tick(GM,dt));
  return S;
})();
