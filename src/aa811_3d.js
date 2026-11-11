/* ===== AA_811（MOVIE-TALK-1110 欠的兩組；任務 DLG-FULL-REVIEW-1110）：學姊合歡山北峰那一趟、子晴之後的十則語音 =====
   稿：企劃線 docs/story_planning/AA_811_movie_talk_hehuan_voice.json@fb1256280（AA 定稿 D109）。台詞在 src/data/aa811_lines.js（tools/story/import_aa811.py，一字不改）；
   這裡是稿上 when／trip／versions 的規則。
   ① 學姊合歡山北峰（ev_sis_hehuan；前提 SIS_HEHUAN＝《m2901b》學姊那一題選「好。我來查車。」，src/movies3d.js 記成那一天）：
     - 約：2029-06-15～2029-10-31 的週六、週日（明天起 7 天內；她在臺北；那一天沒有別的事、不是颱風假）；只演一次（演完 SIS_HEHUAN_WENT）。
       校外約會的清單（INV.flow「出去玩…」→ DATE.menu）畢業典禮以後就關了（AA_128 11-1，DATE.LAST_DAY 2029-06-01；DATE.canAsk「畢業典禮以後不能預約」），
       這一趟整段都在畢業以後——所以放在約她的清單「這個時候才有」那一類（INV.WHEN_X；和去她的城市、過節同一類），當面、手機都可以約。
       她答應的那一句照稿（手機約＝寫進手機的對話串，同校外約會 DATE.sayLines）。
     - 那一天：出遊（OUT.plan）04:00 在客運站上車——從宿舍或家裡到客運站 30 分鐘，03:15～03:30 問「出發」，過了就沒趕上（missed，之後還可以再約）；
       2D 演完 → 事件 hours 18 ＝ 22:00 → 「回到臺北。」。睡覺的鬧鐘照出遊（出發前 30 分鐘＝03:00；q.dawn：可以早於平常最早的 06:30，story3d.js bedOptions）；
       畢業後篇的「跳到下一件事」照出遊停在 03:15（PG.nextStop）。
     - 不下雨（q.noRain，outings3d.js）：該問「出發」的時候在下雨（rain／typhoon）＝這一趟取消（missed、q.rained），跳一行系統字，之後還可以再約。颱風假那天本來就不能選。
     - 2D 背景：客運那一句 coach_night（夜班客運上）→ 第二句起 trip_mountain（山上；稿建議的 'mountain' 沒有這個 key，用現有的山景）→ 「（下山的時候……）」以後的回程 coach_night。CG 不做（交 BB 判）。
     - dialogue：{if:'dating'}＝當天和她交往中（dating_heroine_05）才有、{if:'friend'}＝其他；選項的 fx：love＝她的戀愛、friend＝友情（SOCIAL.applyFx 的 fr：熟悉、信任、自在各 +n）；
       同一趟她的戀愛最多 +2（告白那一晚 +3），鍵 date:<那一天>:hehuan（同校外約會 DATE.capOf）。演完記一次正式校外約會（DATE.countVisit，人物頁「一起去過的地方」；同去她的城市那一套）。
     - 不開新的邀約（「下次換我查車」「印完那天，我會請你吃飯」只是一句話，稿 notes）；不用 SHE_PAYS；車資稿沒寫＝不扣。
   ② 子晴語音（ZQ_VOICE_MEMO；《m2909a》子晴那一題第三天選「（回一則語音）…」，src/movies3d.js 記成那一天）：
     - D0＝「🎤 第一天。」那則送到的那一天：送到的那一刻記 G.flags.ZQ_VOICE_D0（PHONE.ON_MK）。舊存檔沒有＝那一則訊息的日子 → 還在排程裡的那一筆 →
       看完那天＋1（MOVIES.later：m2909a:heroine_04 是 d:1）→ ZQ_VOICE_MEMO 那一天−2（第三天那則送到最早是 D0＋2）。
     - 第 N 天那則在 D0＋N−1（第五天＝D0＋4…第三十四天＝D0＋33）、最後一則（不數了）在 D0＋36；時間 22:00～23:40，每一則固定的分鐘（S.ZQ.h，讀檔不變）。
       ZQ_VOICE_MEMO 記下來的那一刻（回了第三天那則：PHONE.ON_ANSWER；舊存檔：手機規則 STORY.PHONE_RULES）一次排好十則（PHONE.at，tag zqvoice_1～10：讀檔、重進不重送），記 G.flags.ZQ_VOICE_Q＝D0。
       回得晚（第三天那則過了幾天才回）：已經過了的那幾則不補在過去（會排到祐廷回的那一句前面），從現在起一天一則、照順序，之後的照原本的日子。
     - 私訊（th p:heroine_04），不用回；只有第九則（上架）可以回：兩個選項（ask id zqvoice_9），她回的照稿，fx 照手機回覆（PHONE.answer：一個人一天她的戀愛最多 +2）。
       語音寫成字、照訊息體不加句號（稿原樣）。
   存檔：G.flags.SIS_HEHUAN_WENT、ZQ_VOICE_D0、ZQ_VOICE_Q；G.outings 那一筆（id sis_hehuan_<那一天>）；G.phone.q／G.msgs 的 zqvoice_1～10。舊存檔沒有＝沒有，不用遷移。
   測試：node tests/aa811_hehuan_voice_1111_unit.js */
'use strict';
const AA811=(function(){
  const S={};
  const L=()=>typeof AA811_LINES!=='undefined'?AA811_LINES:null;
  const DK=k=>{ if(typeof CALENDAR==='undefined'||!CALENDAR.tOf) return null; const p=String(k).split('-').map(Number); return Math.round((Date.UTC(p[0],p[1]-1,p[2])-CALENDAR.tOf(1))/864e5)+1; };
  const NOW=G=>G.day*24+(+G.hour||0);
  const law=G=>!!G&&(G.stage||'law')==='law';
  const flagOn=(G,f)=>!!(G&&G.flags&&G.flags[f]!=null&&G.flags[f]!==false);
  const dating=(G,id)=>!!(G&&G.flags&&G.flags['dating_'+id]===true);
  const nm=id=>typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(id):((typeof CHARACTERS!=='undefined'&&CHARACTERS[id]&&CHARACTERS[id].name)||id);
  const wdOf=d=>typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(d).wd%7:-1;
  const narr=t=>typeof INV!=='undefined'&&INV.narrLine?INV.narrLine(t):/^（[^（）]*）$/.test(String(t));
  S.DK=DK;
  /* 稿的 fx：love＝她的戀愛；friend＝友情（SOCIAL.applyFx 的 fr，熟悉、信任、自在各 +n；DLG-FX-MECH-1110）*/
  S.fxOf=fx=>{ const o={}; if(fx&&+fx.love) o.love=+fx.love; if(fx&&+fx.friend) o.fr=+fx.friend; return o; };

  /* ---------- ① 學姊合歡山北峰 ---------- */
  S.HH={who:'heroine_05',ev:'ev_sis_hehuan',from:'2029-06-15',to:'2029-10-31',h:4,back:22,travelH:0.5,late:-0.5,ahead:7,bus:'coach_night',mountain:'trip_mountain',down:'（下山的時候'};   /* late −0.5：客運四點開，03:30 以前要出發（OUT.due 的窗 03:15～03:30）*/
  S.HH_HINT='04:00 出發・22:00 回到臺北';   /* 系統字（清單、選日子的小字）*/
  S.HH_ALL_BUSY='這幾個週末都已經有別的事';   /* 系統字（7 天內的週末都排了別的：灰掉，選了說這一句）*/
  S.HH_RAIN='下雨了，和{who}去合歡山北峰的行程取消。';   /* 系統字（照 invites.js 晨跑 rainOff 的寫法）*/
  S.hhWho=()=>(L()&&L().hehuan&&L().hehuan.who)||S.HH.who;
  S.hhTitle=()=>(L()&&L().hehuan&&L().hehuan.title)||'合歡山北峰';
  S.hhPlanned=G=>typeof OUT!=='undefined'&&OUT.rec?OUT.rec(G).find(q=>q&&q.ev===S.HH.ev&&q.state==='planned')||null:null;
  S.hhInWin=d=>{ const a=DK(S.HH.from), b=DK(S.HH.to); return a!=null&&b!=null&&d>=a&&d<=b; };
  S.hhWeekend=d=>{ const w=wdOf(d); return w===6||w===0; };
  /* 這一天能不能去：''＝可以，不然是原因的代號（清單不列不能去的日子；代號給測試看）*/
  S.hhBusy=function(G,d){ const who=S.hhWho();
    if(typeof CALENDAR!=='undefined'&&CALENDAR.typhoon&&CALENDAR.typhoon(d)) return 'typhoon';   /* 颱風假：一定下雨 */
    if(typeof DATE!=='undefined'&&DATE.playerAbroad&&DATE.playerAbroad(G,d)) return 'abroad';
    if(typeof STORY!=='undefined'&&STORY.presence){ const p=STORY.presence(who,Object.assign({},G,{day:d})); if(p&&p.here===false&&p.kind!=='taipei') return 'away'; }
    if(typeof PGDATE!=='undefined'&&PGDATE.busyDays){ try{ if(PGDATE.busyDays(G,d,d).has(d)) return 'busy'; }catch(e){ console.warn('AA811 busyDays',e); } }   /* 畢業後篇那一天有別的事（PG 的場景、別的出遊、校外約會、可昕的格子；pgdates3d.js）*/
    if(typeof OUT!=='undefined'&&OUT.rec&&OUT.rec(G).some(q=>q&&q.day===d&&(q.state==='planned'||q.state==='done'))) return 'out';
    if(typeof DATE!=='undefined'&&DATE.tripOn&&DATE.tripOn(G,d)) return 'trip';
    if(typeof PGDATE!=='undefined'&&PGDATE.upcoming){ try{ if(PGDATE.upcoming(G).some(s=>s&&s.day===d)) return 'slot'; }catch(e){ console.warn('AA811 upcoming',e); } }   /* 交往中的每月一格（還沒排成出遊的）*/
    if((G.invites||[]).some(v=>v&&v.day===d&&['accepted','going','offered','changed'].includes(v.state))) return 'invite';
    if(typeof CLS!=='undefined'&&CLS.examNear&&CLS.examNear(G,d)) return 'exam';   /* 交換延畢的大五上：考試那天和前一天 */
    return ''; };
  /* 清單上的日子：明天起 7 天內、在 6/15～10/31、週六週日（cand 不看有沒有別的事）*/
  S.hhCand=G=>{ const out=[]; for(let d=G.day+1;d<=G.day+S.HH.ahead;d++) if(S.hhInWin(d)&&S.hhWeekend(d)) out.push(d); return out; };
  S.hhDays=G=>S.hhCand(G).filter(d=>!S.hhBusy(G,d));
  /* 約她的清單那一項：null＝不出現；{t,hint,dim,why} */
  S.hhOffer=function(G,id){ if(!G||!G.flags||!law(G)||!L()||id!==S.hhWho()) return null;
    if(!flagOn(G,'SIS_HEHUAN')||flagOn(G,'SIS_HEHUAN_WENT')) return null;
    const q=S.hhPlanned(G); if(!q&&!S.hhCand(G).length) return null;   /* 這 7 天碰不到 6/15～10/31 的週末＝不出現 */
    const base={t:S.hhTitle(),hint:S.HH_HINT};
    if(q) return Object.assign(base,{dim:true,why:'已經約好了'});   /* 同 HV.offer 的系統字 */
    if(!S.hhDays(G).length) return Object.assign(base,{dim:true,why:S.HH_ALL_BUSY});
    return Object.assign(base,{dim:false,why:''}); };
  S.hhLabel=(G,d)=>typeof DATE!=='undefined'&&DATE.dayLabel?DATE.dayLabel(G,d):String(d);
  S.hhPlan=(G,day)=>typeof OUT!=='undefined'&&OUT.plan?OUT.plan(G,{id:'sis_hehuan_'+day,ev:S.HH.ev,day,h:S.HH.h,late:S.HH.late,travelH:S.HH.travelH,travel:'',place:S.hhTitle(),
    title:'和'+nm(S.hhWho())+'去'+S.hhTitle(),back:'回到臺北。',who:S.hhWho(),noRain:true,dawn:true}):false;   /* title 照校外約會（DATE.tripTitle）；back 照去她的城市（HV）；who：那一天不會在外面偶遇她 */
  /* 約（INV.flow 選了這一項；n＝當面）：選日子 → 她答應的那一句（照稿）→ 排出遊 →「約好了：…」（同 DATE.menu 的系統字）*/
  S.hhAsk=async function(GM,id,n){ const G=GM.G, o=S.hhOffer(G,id); if(!o) return null; if(o.dim){ await GM.say(null,o.why+'。'); return null; }
    const D=S.hhDays(G), k=await GM.choose(D.map(d=>({t:S.hhLabel(G,d),hint:S.HH_HINT})).concat([{t:'算了'}])); if(!(k>=0&&k<D.length)) return null; const day=D[k], yes=L().hehuan.accept;
    if(typeof DATE!=='undefined'&&DATE.sayLines) await DATE.sayLines(GM,id,[yes],n); else await GM.say({name:nm(id),charId:id},yes);
    if(!S.hhPlan(G,day)) return null;
    await GM.say(null,'約好了：'+S.hhLabel(G,day).trim()+' 04:00，'+S.hhTitle()+'。'); if(GM.autosave) GM.autosave(); return day; };
  /* 那一天（ev_sis_hehuan 的 beforeOuting）*/
  S.hhBg=k=>{ if(typeof ADV!=='undefined'&&ADV.setBg&&typeof OUT!=='undefined'&&OUT.bg) ADV.setBg(OUT.bg(k)); };
  S.hhLine=async(GM,x)=>{ if(!x||typeof x.text!=='string') return; if(x.speaker) await GM.say({name:nm(x.speaker),charId:x.speaker},x.text); else await GM.say(null,x.text); };
  S.hhCap=G=>({cap:'date:'+G.day+':hehuan',max:typeof DATE!=='undefined'&&DATE.capMax?DATE.capMax(G,S.hhWho()):((typeof SOCIAL!=='undefined'&&SOCIAL.FX_CAP_MAX)||2)});
  S.hhPlay=async function(GM,q){ const G=GM.G, H=L()&&L().hehuan; if(!G||!H) return false; const who=S.hhWho(), V=dating(G,who)?'dating':'friend', cap=S.hhCap(G);
    let down=false;
    for(let i=0;i<H.dialogue.length;i++){ const x=H.dialogue[i];
      if(i===0) S.hhBg(S.HH.bus); else if(i===1) S.hhBg(S.HH.mountain); if(down){ S.hhBg(S.HH.bus); down=false; }   /* 客運 → 山上 → 下山以後的回程 */
      if(x.set){ for(const f in x.set) G.flags[f]=x.set[f]; continue; }
      if(x.if){ if(x.if===V) await S.hhLine(GM,x.line); continue; }
      if(Array.isArray(x.choice)){ const k=await GM.choose(x.choice.map(c=>({t:c.t}))), c=x.choice[k]||x.choice[0];
        for(const s of (c.say||[])) await S.hhLine(GM,s); if(typeof SOCIAL!=='undefined'&&SOCIAL.applyFx) SOCIAL.applyFx(G,who,S.fxOf(c.fx),cap); continue; }
      await S.hhLine(GM,x); if(String(x.text||'').indexOf(S.HH.down)===0) down=true; }
    if(!flagOn(G,'SIS_HEHUAN_WENT')) G.flags.SIS_HEHUAN_WENT=true;   /* 稿最後一格就是 set；保底 */
    if(typeof DATE!=='undefined'&&DATE.countVisit) DATE.countVisit(G,who,S.hhTitle());
    return true; };
  S.hhMissed=function(G,GM,q){ if(q&&q.rained&&GM&&GM.toast) GM.toast(S.HH_RAIN.replace('{who}',nm(S.hhWho())),4200); };   /* 沒去、沒趕上：不扣分、不說話（稿沒有）；下雨取消：一行系統字 */
  S.EV={id:S.HH.ev,title:'合歡山北峰',participants:[],location:'any',trigger:'outing',background:'dark',hours:S.HH.back-S.HH.h,dialogue:[],
    beforeOuting:async(G,GM,q)=>{ await S.hhPlay(GM,q); }, outingMissed:(G,GM,q)=>{ S.hhMissed(G,GM,q); }};
  S.register=function(){ if(typeof STORY_EVENTS==='undefined') return false; if(!STORY_EVENTS.some(e=>e&&e.id===S.EV.id)) STORY_EVENTS.push(S.EV); return true; };
  /* INV.flow「這個時候才有」那一類的一項（INV.WHEN_X）*/
  S.when=(G,id,n)=>{ const o=S.hhOffer(G,id); return o?Object.assign({},o,{run:(GM,i,nn)=>S.hhAsk(GM,i,nn)}):null; };

  /* ---------- ② 子晴語音 ---------- */
  /* off：第 N 天那則＝D0＋N−1（第五、八、十一、十四、十九、二十三、二十七、三十、三十四天），不數了＝D0＋36；h：22:00～23:40 之間固定的分鐘；ask：第九則（上架，從 0 算第 8）*/
  S.ZQ={who:'heroine_04',film:'m2909a',flag:'ZQ_VOICE_MEMO',first:'mv745_m2909a_heroine_04_0',tag:'zqvoice_',ask:8,
    off:[4,7,10,13,18,22,26,29,33,36],h:[22+40/60,23+15/60,22+25/60,23.5,22+50/60,23+5/60,22+35/60,23+20/60,22.75,23+40/60]};
  S.zqD0=function(G){ const F=(G&&G.flags)||{}; if(typeof F.ZQ_VOICE_D0==='number') return F.ZQ_VOICE_D0;
    const m=(G.msgs||[]).find(x=>x&&x.tag===S.ZQ.first); if(m&&typeof m.day==='number') return m.day;   /* 舊存檔：「第一天」那則訊息的日子 */
    if(typeof PHONE!=='undefined'&&PHONE.rec){ const q=PHONE.rec(G).q.find(x=>x&&x.tag===S.ZQ.first); if(q) return q.day+Math.floor((+q.h||0)/24); }   /* 還沒送到（排程裡）*/
    const sn=F.MOVIE_SEEN&&F.MOVIE_SEEN[S.ZQ.who]&&F.MOVIE_SEEN[S.ZQ.who][S.ZQ.film]; if(typeof sn==='number') return sn+1;   /* 看完那天＋1（MOVIES.later d:1）*/
    if(typeof F[S.ZQ.flag]==='number') return F[S.ZQ.flag]-2;   /* 回第三天那則的那一天−2 */
    return null; };
  /* 十則的日子、時間：照稿（D0＋off）；已經過了的（回得晚）從現在起一天一則、照順序（t0＝現在＋15 分鐘）*/
  S.zqPlan=function(D0,t0){ const out=[]; let prev=-Infinity; S.ZQ.off.forEach((o,i)=>{ const h=S.ZQ.h[i]; let d=Math.max(D0+o,prev+1); while(d*24+h<=t0) d++; prev=d; out.push({day:d,h}); }); return out; };
  S.zqItems=function(i){ const Z=L().zq_voice, w=Z.who, it={th:'p:'+w,from:w,text:Z.msgs[i]};
    if(i===S.ZQ.ask) it.ask={id:S.ZQ.tag+'9',opts:Z.reply9.opts.map(o=>{ const x={t:o.t,say:(o.say||[]).map(t=>({from:w,text:t})),fx:S.fxOf(o.fx)}; if(narr(o.t)) x.post=false; return x; })};   /* 照 MOVIES.askOf：選項字整句是旁白才不貼 */
    return [it]; };
  S.zqSched=function(G){ if(!G||!G.flags||!L()||typeof PHONE==='undefined'||!PHONE.at) return false; const F=G.flags;
    if(!flagOn(G,S.ZQ.flag)||F.ZQ_VOICE_Q!=null) return false; const D0=S.zqD0(G); if(D0==null) return false;
    S.zqPlan(D0,NOW(G)+0.25).forEach((p,i)=>PHONE.at(G,p.day,p.h,S.zqItems(i),S.ZQ.tag+(i+1)));
    F.ZQ_VOICE_Q=D0; if(F.ZQ_VOICE_D0==null) F.ZQ_VOICE_D0=D0; return true; };
  S.zqMk=function(G,m){ if(m&&m.tag===S.ZQ.first&&G&&G.flags&&G.flags.ZQ_VOICE_D0==null) G.flags.ZQ_VOICE_D0=m.day; };   /* 「第一天」那則送到的那一刻（PHONE.ON_MK）*/
  S.zqAnswer=function(G,m,o){ const x=o&&o.mvx; if(x&&x.id===S.ZQ.film&&x.w===S.ZQ.who) S.zqSched(G); };   /* 回了第三天那則（movies3d.js 的 ON_ANSWER 先記 ZQ_VOICE_MEMO）*/

  /* ---------- 接線 ---------- */
  S.register();
  if(typeof INV!=='undefined'&&Array.isArray(INV.WHEN_X)&&!INV.WHEN_X.includes(S.when)) INV.WHEN_X.push(S.when);
  if(typeof PHONE!=='undefined'){ if(Array.isArray(PHONE.ON_MK)&&!PHONE.ON_MK.includes(S.zqMk)) PHONE.ON_MK.push(S.zqMk); if(Array.isArray(PHONE.ON_ANSWER)&&!PHONE.ON_ANSWER.includes(S.zqAnswer)) PHONE.ON_ANSWER.push(S.zqAnswer); }
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.PHONE_RULES)&&!STORY._aa811){ STORY.PHONE_RULES.push(G=>S.zqSched(G)); STORY._aa811=true; }   /* 舊存檔（ZQ_VOICE_MEMO 已經有、還沒排）、ON_ANSWER 的順序不對時的保底 */
  return S;
})();
