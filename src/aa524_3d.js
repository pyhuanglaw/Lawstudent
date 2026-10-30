/* ===== AA_524 說了沒發生（一）：以安、芷若、語彤（企劃線 claude/cool-heisenberg-o8kuqx 8fd10848d，AA-C 2026-10-28；任務 HEROINE-LIFE-1028，USER_WANTS X122★）=====
   做法照 AA_356：說「下次」的人會記得——在之後已經有的那一場補一兩句；後面沒有見面場合的改原句；原句是玩家選項的記一個旗標。台詞照稿逐字。
   大部分改在原本的檔裡（檔內標 AA_524）：events.js（A1 R1、A5、A6 選項旗標、Z2、Z4、Y2）、y34b3d.js（A1 餞行旗標、Y1 二十三週年、Y7）、termend_lines.js／termend3d.js（A3、A6、Y1）、
   r2y3b3d.js（A7、A10）、encounters.js（A11、Z11）、vac_activities.js（A12）、story3d.js（A13、Y8 掛勾）、y2r2_3d.js＋y2b_events.js（Z1）、fest_events.js＋fest3d.js（Z8 旗標）、
   r2y4a_events.js＋r2y4a3d.js（Z9）、an_yt_hol_events.js（Y3 旗標、Y4）、noodle_closed3d.js（Y3）、needed_msgs.js（Y6）、feed_y2s1.js（Z3 動態兩個版本）；
   閒聊階梯（A4、A14、Z10）只經 tools/ladder/import_ladder.py 的 _fix；約會台詞改字（A8、A9、Z7）只經 tools/date/import_date_lines.py 的 AA_524 那一段。
   這個檔放要「掛上去」的：
   - 閒聊階梯選了哪一句記旗標（STORY.ladReply 包一層，同 sis_b16_3d.js）：A2-L1「下次做給我吃。」AN_COOK_PROMISE（A4）、A5-L8「回來第一碗我請。」AN_FIRST_BOWL（A1）、
     Z2-L8「回來的時候跟我說。」ZR_TELL_BACK（Z6）、Z4-L1「一半也想吃。」ZR_LUROU_HALF（Z10）。
   - 私訊（STORY.PHONE_RULES）：Z3 大二上第 8 週週六 22:07 早場（ZR_EARLY_PROMISE；回覆期限週日 08:30，「我去。」記 ZR_EARLY_GO）、Z6 2026-08-26 22:07（ZR_TELL_BACK）、
     Y5 閒聊階梯 Y-L8（YT_TEN_MINUTES）說完以後的第二個週四 21:00（店休往後延一週；回覆期限 21:40）。時間是臺灣時間，人在國外照 FEED.loc 換（同動態的私訊）。
   - Z3 動態 zr3c 兩個版本：FEED.WENT.zrEarly（ZR_EARLY_GO）。
   - Z5、Z8 她主動約的 D04 西門老片（DATE.arriveLine 包一層：地點那一句之後、抵達句之前）：ZR_Z11B 'with'＝倒數第三排兩句、ZR_POSTER＝海報那一部兩句；各演一次。快速約會跳過介紹，不演。
   - Z7、Y9 約會互動點的 remember 多一句（DATE.spotLine、DATE.playSet 包一層）：芷若 D04 小吃「下次換我請。」、語彤 D10 天鵝船「我請。」——第一次選了那一個的才有，演一次。
     第一次選了哪一個記在 G.dateMemory[人][地點].fp（這一版起才記）。
   - A2 以安告白（TERMEND.walkHome 包一層）：她先說或玩家先說、答應了（'yes'／'sheSaid'），有 AN_REASON_HIDDEN 的最後兩句；演一次。
   - Y5 「我過去。」：當天 23:00 以前在麵店門口按「進入阿鳳麵店」（NOODLE_CLOSED.door 包一層）＝旁白兩句、不進去（不排出遊，走過去就演；早於 21:50 到的時間跳到 21:50）。
   - Y8 滷蛋：story3d.js noodleScene 點餐、付完錢那個位置叫 S.ytEgg（阿姨不在店裡＝等下一次，同 FEED.ytTreat）；記 YT_BDAY_EGG。
   存檔：新旗標（稿第 4 節）＋G.flags.AA524＝{a2, z5, z8, y5d, y5}（演過的那一天、Y5 的那個週四）；舊存檔沒有＝沒演過。補的旗標從這一版起才記，之前就選過的看不到兌現。
   測試：node tests/aa524_promises_unit.js */
'use strict';
const AA524=(function(){
  const S={};
  const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const T=(d,h)=>d*24+h, now=G=>T(G.day,+G.hour||0);
  const law=G=>!!G&&(G.stage||'law')==='law';
  const rec=G=>{ const F=G.flags; if(!F.AA524||typeof F.AA524!=='object') F.AA524={}; return F.AA524; };
  const has=(id,tag)=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(id,tag);
  const contact=(G,id)=>typeof INV==='undefined'||!INV.hasContact||INV.hasContact(G,id);
  const nm=id=>typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(id):id;
  const loc=(G,day,h)=>(typeof FEED!=='undefined'&&FEED.loc)?FEED.loc(G,{day,h}):{day,h};   /* 臺灣時間 → 遊戲時鐘（人在國外，同 FEED 的私訊）*/
  const say=async(GM,x)=>{ if(x.narr) return GM.say(null,x.narr); if(x.name) return GM.say({name:x.name},x.t); return GM.say({name:nm(x.who),charId:x.who},x.t); };

  /* ---------------- 台詞（稿逐字）---------------- */
  S.L={
    a2:[{who:'heroine_01',t:'（把手帳翻到園區那一天）上次沒給你看的那一行。'},{narr:'（理由欄寫著：「想到{name}。」）'}],
    z3:{msg:['明天早場。九點十分。','你說過你起得來。'],go:'我去。',goR:'好。',no:'起不來。',noR:'我就知道。'},
    z5:[{narr:'（她買的票是倒數第三排。）'},{who:'heroine_02',t:'說好的。'}],
    z6:['回來了。','台中帶來的行李，比我去的時候重。'],
    z8:[{narr:'（放的是海報上那一部。）'},{who:'heroine_02',t:'第五次。'}],
    y5:{msg:'今天我顧到打烊。',go:'我過去。',no:'今天不行。',noR:'嗯。',scene:[{narr:'（你到的時候，她在拉鐵門。阿姨在裡面算錢。）'},{who:'heroine_03',t:'……你真的來了。'}]},
    y8:[{narr:'（阿姨把一顆滷蛋放進你的碗裡。）'},{name:'阿姨',t:'生日那天說的。'}],
    /* remember 多一句：pick＝第一次選的那一個（地點檔裡選項的字）*/
    rem:[{key:'z7',loc:'D04',who:'heroine_02',pid:'D04.snack',pick:'「下次換我請。」',x:{who:'heroine_02',t:'上次你說要請。……老闆，兩份，他付。'}},
      {key:'y9',loc:'D10',who:'heroine_03',pid:'D10.boat',pick:'「我請。」',x:{narr:'（這次她先去付了錢。）'}}] };

  /* ---------------- 閒聊階梯選了哪一句 ---------------- */
  S.LAD={'A2-L1':{id:'heroine_01',t:'「下次做給我吃。」',f:'AN_COOK_PROMISE'},'A5-L8':{id:'heroine_01',t:'「回來第一碗我請。」',f:'AN_FIRST_BOWL'},
    'Z2-L8':{id:'heroine_02',t:'「回來的時候跟我說。」',f:'ZR_TELL_BACK'},'Z4-L1':{id:'heroine_02',t:'「一半也想吃。」',f:'ZR_LUROU_HALF'}};
  S.onLad=function(G,st,ch,id){ if(!G||!G.flags||!st||!ch) return false; const x=S.LAD[st.id]; if(!x||x.id!==id||ch.t!==x.t) return false; G.flags[x.f]=true; return true; };

  /* ---------------- 私訊 ---------------- */
  /* Z3：大二上第 8 週週六（第 1 週週一＝開學日；同 FEED 的 'W8六'）22:07，回覆期限週日 08:30 */
  S.z3Sat=function(){ const r=typeof CALENDAR!=='undefined'&&CALENDAR.termDays?CALENDAR.termDays('Y2S1'):null; return r?r.from+7*7+5:null; };
  S.z3=function(G){ const F=G.flags; if(!F.ZR_EARLY_PROMISE||PHONE.sent(G,'aa524_z3')) return false; const sat=S.z3Sat(); if(sat==null) return false;
    const w=loc(G,sat,22+7/60), dl=loc(G,sat+1,8.5); if(now(G)<T(w.day,w.h)||now(G)>=T(dl.day,dl.h)||!contact(G,'heroine_02')) return false;
    const L=S.L.z3, M=L.msg.map(t=>({th:'p:heroine_02',from:'heroine_02',text:t}));
    M[M.length-1].ask={id:'aa524_z3',until:T(dl.day,dl.h),opts:[{t:L.go,say:[{from:'heroine_02',text:L.goR}],set:{ZR_EARLY_GO:true}},{t:L.no,say:[{from:'heroine_02',text:L.noR}]}]};
    PHONE.at(G,w.day,w.h,M,'aa524_z3'); return true; };
  /* Z6：2026-08-26（她回臺北那天，characters.js）22:07；兩天內補 */
  S.z6=function(G){ const F=G.flags; if(!F.ZR_TELL_BACK||PHONE.sent(G,'aa524_z6')) return false; const d=DK('2026-08-26'); if(d==null) return false;
    const w=loc(G,d,22+7/60); if(now(G)<T(w.day,w.h)||now(G)>=T(w.day+2,0)||!contact(G,'heroine_02')) return false;
    PHONE.at(G,w.day,w.h,S.L.z6.map(t=>({th:'p:heroine_02',from:'heroine_02',text:t})),'aa524_z6'); return true; };
  /* Y5：Y-L8 說完的那一天（記憶 YT_TEN_MINUTES 的 day）以後的第二個週四；店休（NOODLE_CLOSED）往後延一週。算出來就記住（記憶有上限，舊的會被擠掉）*/
  S.y5Day=function(G){ const R=rec(G); if(R.y5d!=null) return R.y5d; const M=typeof SOCIAL!=='undefined'&&SOCIAL.memories?SOCIAL.memories('heroine_03'):[]; const m=M.find(x=>x&&x.tag==='YT_TEN_MINUTES'); if(!m||typeof CALENDAR==='undefined') return null;
    let d=m.day, n=0; while(n<2){ d++; if(CALENDAR.dateOf(d).wd%7===4) n++; }
    for(let k=0;k<10&&typeof NOODLE_CLOSED!=='undefined'&&NOODLE_CLOSED.closed&&NOODLE_CLOSED.closed(G,d);k++) d+=7;
    R.y5d=d; return d; };
  S.y5=function(G){ if(!has('heroine_03','YT_TEN_MINUTES')&&rec(G).y5d==null) return false; if(PHONE.sent(G,'aa524_y5')) return false; const d=S.y5Day(G); if(d==null) return false;
    if(now(G)<T(d,21)||now(G)>=T(d,21+40/60)||!contact(G,'heroine_03')) return false; if(typeof STORY!=='undefined'&&STORY.abroad&&STORY.abroad(G)) return false;
    const L=S.L.y5; PHONE.at(G,d,21,[{th:'p:heroine_03',from:'heroine_03',text:L.msg,ask:{id:'aa524_y5',until:T(d,21+40/60),opts:[{t:L.go,say:[]},{t:L.no,say:[{from:'heroine_03',text:L.noR}]}]}}],'aa524_y5'); return true; };
  S.y5Due=function(G){ const R=rec(G); if(R.y5!=null||R.y5d==null||G.day!==R.y5d||(+G.hour||0)>=23||typeof PHONE==='undefined'||!PHONE.byAsk) return false; const m=PHONE.byAsk(G,'aa524_y5'); return !!m&&m.ans===0; };
  S.y5Door=async function(GM){ const G=GM.G; if(!S.y5Due(G)) return false; const R=rec(G); R.y5=G.day;
    GM.sceneBegin(); try{ const h=+G.hour||0; if(h<21+50/60&&GM.advance) GM.advance(21+50/60-h); for(const x of S.L.y5.scene) await say(GM,x); } finally { GM.sceneEnd(); } return true; };
  S.phone=function(G){ if(!G||!G.flags||!law(G)||typeof PHONE==='undefined') return; for(const f of [S.z3,S.z6,S.y5]){ try{ f(G); }catch(e){ console.warn('AA524 phone',e); } } };

  /* ---------------- Y8 滷蛋（story3d.js noodleScene）---------------- */
  S.ytEggDue=G=>!!G&&!!G.flags&&!!G.flags.YT_BDAY_Y1&&!G.flags.YT_BDAY_EGG;
  S.ytEgg=async function(GM){ const G=GM.G; if(!S.ytEggDue(G)) return false; if(typeof EAT!=='undefined'&&EAT.staffAway&&EAT.staffAway(GM,'阿鳳麵店')) return false;   /* 阿姨不在店裡：等下一次 */
    G.flags.YT_BDAY_EGG=G.day; for(const x of S.L.y8) await say(GM,x); return true; };

  /* ---------------- A2 以安告白的最後兩句 ---------------- */
  S.a2=async function(GM,id,r){ const G=GM.G; if(id!=='heroine_01'||(r!=='yes'&&r!=='sheSaid')||!has('heroine_01','AN_REASON_HIDDEN')) return false; const R=rec(G); if(R.a2!=null) return false; R.a2=G.day;
    for(const x of S.L.a2) await say(GM,x); return true; };

  /* ---------------- Z5、Z8 她主動約的 D04 西門老片：開頭兩句 ---------------- */
  S.d04Open=async function(GM,t){ const G=GM.G, F=G.flags; if(!t||t.who!=='heroine_02'||(t.locs||[])[0]!=='D04'||t.by!=='npc') return false; const R=rec(G); let n=0;
    if(F.ZR_Z11B==='with'&&R.z5==null){ R.z5=G.day; for(const x of S.L.z5) await say(GM,x); n++; }
    if(F.ZR_POSTER&&R.z8==null){ R.z8=G.day; for(const x of S.L.z8) await say(GM,x); n++; }
    return n>0; };

  /* ---------------- Z7、Y9 remember 多一句 ---------------- */
  S._spot=null;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['aa524_3d:_spot']=()=>{ S._spot=null; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊約會走不到 finally */
  const remSet=(id,lc,pid)=>{ const H=(((((typeof DATE_LINES!=='undefined'?DATE_LINES:{}).loc||{})[lc]||{}).lines||{})[id]||{}).hotspots||{}; return (H[pid]||{}).remember||null; };
  S.remExtra=async function(GM,id,set,t,pid){ const G=GM.G, lc=(t.locs||[])[0]; for(const e of S.L.rem){ if(e.who!==id||e.loc!==lc||e.pid!==pid||set!==remSet(id,lc,pid)) continue;
      const m=DATE.mem(G,id,lc), fp=m.fp||{}, rx=m.rx||(m.rx={}); if(fp[pid]!==e.pick||rx[pid]) continue; rx[pid]=G.day; await say(GM,e.x); } };

  /* ---------------- 掛上去 ---------------- */
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G));
  if(typeof STORY!=='undefined'&&typeof STORY.ladReply==='function'&&!STORY._aa524Lad){ const r0=STORY.ladReply;
    STORY.ladReply=function(st,ch,G,id){ try{ S.onLad(G,st,ch,id); }catch(e){ console.warn('AA524 lad',e); } return r0.apply(this,arguments); }; STORY._aa524Lad=true; }
  if(typeof FEED!=='undefined'&&FEED.WENT) FEED.WENT.zrEarly=G=>!!(G&&G.flags&&G.flags.ZR_EARLY_GO);   /* Z3：動態 zr3c（feed_y2s1.js went:'zrEarly'）*/
  if(typeof TERMEND!=='undefined'&&typeof TERMEND.walkHome==='function'&&!TERMEND.walkHome._aa524){ const w0=TERMEND.walkHome;
    TERMEND.walkHome=Object.assign(async function(GM,id,term){ const r=await w0.apply(this,arguments); try{ await S.a2(GM,id,r); }catch(e){ console.warn('AA524 a2',e); } return r; },{_aa524:true}); }
  if(typeof DATE!=='undefined'){
    if(typeof DATE.arriveLine==='function'&&!DATE.arriveLine._aa524){ const a0=DATE.arriveLine;
      DATE.arriveLine=Object.assign(async function(GM,t){ try{ await S.d04Open(GM,t); }catch(e){ console.warn('AA524 d04',e); } return a0.apply(this,arguments); },{_aa524:true}); }
    if(typeof DATE.spotLine==='function'&&typeof DATE.mem==='function'&&!DATE.spotLine._aa524){ const s0=DATE.spotLine;
      DATE.spotLine=Object.assign(async function(GM,t,pid){ const m=DATE.mem(GM.G,t.who,t.locs[0]), first=!m.picks.includes(pid); const prev=S._spot; S._spot={t,pid}; let r;
        try{ r=await s0.apply(this,arguments); } finally { S._spot=prev; }
        if(first&&r&&r.pick&&typeof r.pick.t==='string'){ const P=m.fp||(m.fp={}); if(P[pid]==null) P[pid]=r.pick.t; }   /* 第一次選了哪一個 */
        return r; },{_aa524:true}); }
    if(typeof DATE.playSet==='function'&&!DATE.playSet._aa524){ const p0=DATE.playSet;
      DATE.playSet=Object.assign(async function(GM,id,set,t){ const r=await p0.apply(this,arguments); const sp=S._spot; if(sp&&sp.t===t&&set){ try{ await S.remExtra(GM,id,set,t,sp.pid); }catch(e){ console.warn('AA524 rem',e); } } return r; },{_aa524:true}); }
  }
  if(typeof NOODLE_CLOSED!=='undefined'&&typeof NOODLE_CLOSED.door==='function'&&!NOODLE_CLOSED.door._aa524){ const d0=NOODLE_CLOSED.door;
    NOODLE_CLOSED.door=Object.assign(async function(GM){ try{ if(await S.y5Door(GM)) return true; }catch(e){ console.warn('AA524 y5',e); } return d0.apply(this,arguments); },{_aa524:true}); }
  return S;
})();
