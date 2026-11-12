/* ===== 多段感情 v6：收拾的時刻（V6-S4）、EX_<id>（V6-S3）、前任版（V6-A3、A6、B6）、桌遊團的反應（V6-A7）=====
   規格（企劃線 claude/cool-heisenberg-o8kuqx @ d805bceee，白名單同一個 commit）：AA_123 2-3、4-3、4-3b、5-3、第 6 節；AA_182 第 2、3 節；BB_119 第 0 節最後一列、第 4 節、第 7 節、9-4。
   台詞在 src/data/v6ex_lines.js（照原文）。不改 romance3d.js、story3d.js、y34b3d.js：包住 ROM.end／ROM.start、STORY.populate／cleanupTick、Y34B.an20Mode，事件用 STORY_EVENTS 的掛勾。
   ■ V6-S3 EX_<id>：ROM.end 原本就記 EX_<id>、status ex。這裡補 BB_119 第 7 節的 EX_<id>_REASON（talk／caught／drift）：
       apart_talk、apart_life、apart_choice＝talk；apart_drift、drift＝drift；two_hearts、mrel、zq_zr（被發現）＝caught；其他＝talk。已經有的不蓋掉（cracktalk3d.js 自己記）。
     不鎖重新開始：好好分開的芷若、子晴、沛珊照一般告白可以重新開始（AA_434 第 1 節：BB_119 的「不復合」作廢，照 AA_123 1-10、BB_194）。
   ■ V6-S4 收拾的時刻（AA_182 第 2 節）：
     - 每一次分開（ROM.end）：之後第一個空檔出系統字「（這一週，你可以把這件事放好。）」。
     - 七天內（CLEANUP_DONE false、還沒過 cleanupDue）：宿舍房間（和有書桌的房間）的書桌旁多一個「收拾」；在家：週末選單多一個「收拾」（HOME.MENU_OPTS），寒暑假一天問一次（trigger 'home' 的事件）。
       選項：還東西、收紙箱（記 CLEANUP_BOX；主線 10 大四開學前一天的拆箱多一步，story3d.js STORY.unboxY4，AA_437 第 6 節）／和阿哲說一次話（和阿哲 FAMILIAR 以上：傳「頂樓？」、他回「十分鐘。我帶飲料。」→ 十分鐘後宿舍頂樓；
       在家＝打電話，同一段話）／手機筆記寫一行（三句選一）／BB 的五位：她的物件（BB_119 9-4）／算了。選了任何一個＝ROM.cleanup（CLEANUP_DONE true）。
     - 七天都沒做：第七天 22:00「（你把那件事放好了。）」（story3d.js 原本的 cleanupTick；這裡讓它等到第七天 22:00）。
   ■ 前任版：
     A3 以安：讀書會分開後第一次「規則沒有改。……你也不用換位子。」（社課事件 clubEvent）；祐廷之後和別人交往、她知道＝說一次「理由我懂。不用解釋。」（說話前）；
        新 8 週六補讀：「……你也來了。坐原來的位子。」（ev_plg_rules_after 加一句）；新 9 行政法第 12 週下課後「剛剛那個，是課堂上的。」（syllabus.js 的 exAfter，afterClass 事件）；
        新 16 送機：她走進去以前「……到了我傳給桌遊團。」（ev_an_sendoff 加一句；AA_437 第 4 節改字）；新 20：前任＝麵店長桌那一版（Y34B.an20Mode）；新 21 畢業典禮：友情版（postgrad3d.js）。
     A6 語彤：之後和以安交往、她知道＝說一次「嗯。……她會讓你把話講完的。」；事件 17 畢業典禮：友情版（postgrad3d.js）；總圖的週四：分開以後不再傳留位子那一則（cracktalk3d.js 只在交往中傳）。
     B6（BB_119 第 4 節）：分開後第一次說話——子晴「好久不見。你看起來有睡飽。」；芷若在 Café（她在臺灣的時候）「好久不見。……老樣子？」；學姊在法學院「學弟。……吃飯了嗎。」
        （研究助理還在做＝「工作照舊。你不用勉強。」，JOB_RA 遊戲裡還沒有）；可昕（AA_351 慢慢分開以後、D6 午餐以前第一次當面）「嗨。」（她停了一下，把耳機拿下來。）「……你也來這裡喔。」（AA_434 第 2 節）。沛珊不做（見 V6EX.NOT_DONE）。
        之後一個學期（AA_434 4-3）：她先傳的私訊每兩則送一則、她不主動約，下一個學期第 1 週恢復（V6EX.cool）。
   ■ A7 桌遊團（AA_182 第 3 節，「確實知道」＝ROM.knowsOf）：開始交往＝他們知道以後的下一次麵店長桌（週二、週四 17:30～21:00 你在麵店），只有知道、也認識的人說；
     和同一個朋友圈的另一個人開始（前任也是他們知道的人）＝阿哲那一句。分開＝柏翰知道的話，下一個上課日 12:10 私訊筆記；Alison 那天晚上 22:00 一張貼圖；
     分開以後第一次去公法讀書會，芯慈把放在你位子上的筆袋拿走（AA_434 第 4 節）。
   存檔：G.flags.V6EX＝{entry, starts:[], notes:[], home}；CLEANUP_WHO、CLEANUP_BOX、CLEANUP_NOTE、CLEANUP_ZHE、CLEANUP_HER、V6EX_*（一次的句子）。舊存檔沒有＝空的。
   測試：node tests/v6_ex_unit.js */
'use strict';
const V6EX=(function(){
  const S={};
  if(typeof STORY==='undefined'||typeof ROM==='undefined'||typeof V6EX_LINES==='undefined'||typeof STORY_EVENTS==='undefined') return S;
  const L=V6EX_LINES, C=L.CLEAN, X=L.EX;
  const AN='heroine_01', YT='heroine_03', PS='classmate_peishan', ZR='heroine_02', ZQ='heroine_04', SIS='heroine_05', KX='kexin';
  const T=(d,h)=>d*24+h, now=G=>G.day*24+(+G.hour||0), hh=G=>{ const x=+G.hour||0; return x>=0&&x<24?x:((x%24)+24)%24; };
  const law=G=>!!G&&!!G.flags&&(G.stage||'law')==='law';
  const dating=(G,id)=>!!(G&&G.flags&&G.flags['dating_'+id]===true);
  const isEx=(G,id)=>!dating(G,id)&&!!(G.flags&&G.flags['EX_'+id]);
  const met=id=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(id,'FIRST_MET');
  const stageAt=(id,lv)=>typeof SOCIAL!=='undefined'&&!!SOCIAL.STAGES&&!!SOCIAL.stage&&SOCIAL.STAGES.indexOf(SOCIAL.stage(id))>=SOCIAL.STAGES.indexOf(lv);
  const evOf=id=>STORY_EVENTS.find(e=>e.id===id)||null;
  const wdOf=d=>CALENDAR.dateOf(d).wd%7;
  S.rec=function(G){ const F=G.flags||(G.flags={}); let R=F.V6EX; if(!R||typeof R!=='object') R=F.V6EX={}; if(!Array.isArray(R.starts)) R.starts=[]; if(!Array.isArray(R.notes)) R.notes=[]; return R; };
  S.endDay=function(G,id){ const R=ROM.get(G,id), H=(R&&R.history)||[]; for(let i=H.length-1;i>=0;i--) if(H[i]&&H[i].ev==='end') return H[i].day!=null?H[i].day:null; return null; };

  /* ======================= V6-S3：EX_<id>_REASON、不復合 ======================= */
  /* AA_434 第 4 節第 3 點：分開以後一個學期，她主動傳的私訊每兩則送一則、她不主動約；到下一個學期第 1 週恢復，一句旁白都不加。七位通用；可昕照 AA_351（kxdrift3d.js），這裡不管她 */
  S.COOL_IDS=[AN,ZR,YT,ZQ,SIS,PS];
  S.coolUntil=function(d){ if(typeof CALENDAR==='undefined'||!CALENDAR.termOf) return null; let cur=null; for(let x=d;x>d-200;x--){ const t=CALENDAR.termOf(x); if(t){ cur=t.id; break; } }   /* 寒暑假算前一個學期 */
    for(let x=d+1;x<d+400;x++){ const t=CALENDAR.termOf(x); if(t&&t.id!==cur&&t.week===1) return x; } return null; };   /* 下一個學期第 1 週的第一天 */
  S.cool=(G,id)=>{ const R=G&&G.flags&&G.flags.V6EX, c=R&&R.cool&&R.cool[id]; return !!c&&!dating(G,id)&&G.day>=c.from&&G.day<c.until; };
  /* 每兩則送一則：同一類（need＝主線 4 這週的訊息、dp＝手機小事）她輪到的第 2、4、6…次跳過；同一則（key）問幾次都是同一個答案 */
  /* AA_600 S1（企劃線 031414cad，使用者 11-02「分手，不會主動聯絡」「如果分手他不太會理我」）：以安、學姊分手以後（ROM.exOf：EX_、ex／paused／friend_after_catch、挽回中）
     她主動傳的訊息、主動的邀約一律不送，直到重新交往——不是「下一個學期恢復」。其他五位照 AA_434 4-3 的一個學期。
     S.noContact 給各個「她先傳／她先約」的地方讀（主線 4 週日訊息、手機小事、INV.anAsk、動態裡她先傳的私訊、她們主動約、心意邀約、寒暑假私訊揪人…）*/
  S.NO_CONTACT=[AN,SIS];
  S.noContact=(G,id)=>!!G&&!!G.flags&&S.NO_CONTACT.includes(id)&&typeof ROM!=='undefined'&&!!ROM.exOf&&ROM.exOf(G,id);
  /* AA_600 S8～S10、B7：前任的學姊——祐廷找她，要找很多次才回。這一次分開的計數記在 G.flags.SIS_EXC＝{end（分開那天）, msg, inv, talk:{學期: 次數}, tries}；
     重新交往再分開（end 不一樣）就從 0 開始。tries＝分手以後祐廷找過她幾次（傳訊息、約、當面，S8～S10 哪一種都算；B7 ev_sis_three_conditions 要 2 次以上）*/
  S.sisExRec=function(G){ const F=G.flags, e=S.endDay(G,SIS); let R=F.SIS_EXC; if(!R||typeof R!=='object'||R.end!==e) R=F.SIS_EXC={end:e,msg:0,inv:0,talk:{},tries:0}; if(!R.talk||typeof R.talk!=='object') R.talk={}; return R; };
  S.sisExTries=G=>S.noContact(G,SIS)?(S.sisExRec(G).tries|0):0;
  S.termKey=function(G){ if(typeof CALENDAR==='undefined'||!CALENDAR.termOf) return 'd'+Math.floor(G.day/180); for(let x=G.day;x>G.day-200;x--){ const t=CALENDAR.termOf(x); if(t) return t.id; } return 'd'+Math.floor(G.day/180); };   /* 寒暑假算前一個學期 */
  /* S8 傳訊息（msg3d.js 的 MSG.send）：第 1、2 則已讀不回（「（她已讀了。）」，us_blank_lines.js 同一句旁白）；第 3 則才回最短的一句，回完歸零 */
  S.SIS_EX_READ='（她已讀了。）';
  S.sisExShort=topic=>['thanks','newyear'].includes(topic)?'謝謝。':(['course','ask','help'].includes(topic)?'好。':'嗯。');
  S.sisExMsg=function(G,topic){ const R=S.sisExRec(G); R.tries++; if(topic==='bday') return 0;   /* B8、B10：前任傳生日快樂＝已讀不回（不回「謝謝。」），也不算進第 3 則 */
    R.msg=(R.msg|0)+1; if(R.msg<3) return 0; R.msg=0; return 3; };
  /* S9 約她（invites3d.js 的 INV.flow，校內的邀約；校外約會 DATE 照它自己的條件）：第 1、2 次已讀不回；第 3 次回「最近忙。」；不答應。回傳 'read'／'busy' */
  S.SIS_EX_BUSY='最近忙。';
  S.sisExInvite=function(G){ const R=S.sisExRec(G); R.tries++; R.inv=(R.inv|0)+1; if(R.inv<3) return 'read'; R.inv=0; return 'busy'; };
  /* S10 當面找她（story3d.js 的 talkSis、talkCharacter）：每學期前兩次只點頭，第三次起回一句「嗯。」，不閒聊（sis_b10 3-2 的 SIS_EX_CAFE「之後招呼只點頭」接在這裡）。
     B7：在她讀書的地方、ev_sis_three_conditions 該演了（SISB4.rebuildDue，要 tries≥2）＝不擋，交給 SISB4.preTalk（這一次也算一次）*/
  S.SIS_EX_NOD='（她抬頭看了你一眼，點了一下頭。）';
  S.SIS_EX_HM='嗯。';
  S.sisExTalk=async function(GM,who){ const G=GM&&GM.G; if(!G||!G.flags||!law(G)||!S.noContact(G,SIS)) return false; const R=S.sisExRec(G);
    if(typeof SISB4!=='undefined'&&SISB4.rebuildDue&&Array.isArray(SISB4.READ_ZONES)&&SISB4.READ_ZONES.includes(G.zone)&&SISB4.rebuildDue(G)){ R.tries++; return false; }
    const k=S.termKey(G); R.talk[k]=(R.talk[k]|0)+1; R.tries++;
    if(R.talk[k]<=2) await GM.say(null,S.SIS_EX_NOD); else await GM.say(who,S.SIS_EX_HM);
    return true; };
  S.coolSkip=function(G,id,cat,key){ if(S.noContact(G,id)) return true; const c=G.flags.V6EX&&G.flags.V6EX.cool&&G.flags.V6EX.cool[id]; if(!c) return false; if(!c.n) c.n={}; const M=c.m||(c.m={}), k=cat+'|'+key; if(M[k]!=null) return M[k]; const n=(c.n[cat]|0)+1; c.n[cat]=n; return M[k]=(n%2===0); };
  S.REASON=how=>{ if(how==='apart_drift'||how==='drift') return 'drift'; if(how==='two_hearts'||how==='mrel'||how==='zq_zr'||how==='caught') return 'caught'; return 'talk'; };
  if(!ROM._v6exEnd){ const e0=ROM.end; ROM.end=function(G,id,how){ const ok=e0.apply(this,arguments); if(ok&&G&&G.flags){ const F=G.flags; if(F['EX_'+id+'_REASON']==null) F['EX_'+id+'_REASON']=S.REASON(how);
        (F.CLEANUP_WHO||(F.CLEANUP_WHO=[])).push({id,day:G.day}); if(F.CLEANUP_WHO.length>10) F.CLEANUP_WHO.splice(0,F.CLEANUP_WHO.length-10);
        const R=S.rec(G), h=+(+G.hour||0).toFixed(2); R.entry=G.day; R.notes.push({id,day:G.day}); (R.yu||(R.yu=[])).push({id,day:G.day,h}); (R.seat||(R.seat=[])).push({id,day:G.day,h});
        for(const k of ['yu','seat']) if(R[k].length>10) R[k].splice(0,R[k].length-10);
        if(S.COOL_IDS.includes(id)){ const u=S.coolUntil(G.day); if(u!=null) (R.cool||(R.cool={}))[id]={from:G.day,until:u,n:{}}; } }
      return ok; }; ROM._v6exEnd=true; }
  if(!ROM._v6exStart){ const s0=ROM.start; ROM.start=function(G,id){ const ok=s0.apply(this,arguments); if(ok&&G&&G.flags){ const R=S.rec(G); R.starts.push({id,day:G.day}); if(R.starts.length>10) R.starts.splice(0,R.starts.length-10); } return ok; }; ROM._v6exStart=true; }

  /* ======================= V6-S4：收拾的時刻 ======================= */
  /* 七天內還沒收拾：分開那天起到第七天（cleanupDue）22:00 以前。沒有 cleanupDue＝V6-S4 以前的舊存檔（romance3d.js 當作已經過了一週）*/
  S.pending=G=>{ const F=G&&G.flags; if(!F||F.CLEANUP_DONE!==false||F.cleanupDue==null) return false; return G.day<F.cleanupDue||(G.day===F.cleanupDue&&hh(G)<22); };
  /* 這一週分開的、BB 的五位（她的物件）：最近一位 */
  S.herOf=function(G){ const W=(G.flags.CLEANUP_WHO||[]).slice().reverse(); const due=G.flags.cleanupDue; for(const w of W){ if(due!=null&&w.day<due-7) break; if(C.her[w.id]) return w.id; } return null; };
  S.options=function(G){ const O=[{t:C.menu.box,k:'box'}]; if(met('zhe')&&stageAt('zhe','FAMILIAR')) O.push({t:C.menu.zhe,k:'zhe'}); O.push({t:C.menu.note,k:'note'});
    const h=S.herOf(G); if(h) O.push({t:C.her[h].btn,k:'her',id:h}); O.push({t:C.menu.no,k:'no'}); return O; };
  S.done=function(G,k,extra){ ROM.cleanup(G); G.flags.CLEANUP_HOW=k; if(extra) Object.assign(G.flags,extra); };
  /* 已經在 ADV 裡（在家的選單）＝不另外開、也不關 */
  const advBegin=bg=>{ if(typeof ADV==='undefined'||!ADV.begin||ADV.active) return false; ADV.begin({background:bg||'blur'}); return true; }, advEnd=own=>{ if(own&&typeof ADV!=='undefined'&&ADV.active&&ADV.end) ADV.end(); };
  S.menu=async function(GM,mode){ const G=GM.G; if(!S.pending(G)) return false; const O=S.options(G); let o=null;
    GM.sceneBegin(); try{ if(mode==='home') await GM.say(null,C.entry);   /* 在家：選單跳出來以前先一句（同一句系統字；書桌是玩家自己點的，不用）*/ const k=await GM.choose(O.map(x=>({t:x.t}))); o=O[k]||null; } finally { GM.sceneEnd(); }
    if(!o||o.k==='no') return false;
    if(o.k==='box'){ const B=G.flags.CLEANUP_BOX||(G.flags.CLEANUP_BOX=[]); const w=(G.flags.CLEANUP_WHO||[]).slice(-1)[0]; B.push({id:w?w.id:null,day:G.day}); S.done(G,'box'); if(GM.toast) GM.toast(C.boxDone,2400); return true; }
    if(o.k==='note') return S.note(GM);
    if(o.k==='zhe') return S.zhe(GM,mode);
    if(o.k==='her') return S.her(GM,o.id);
    return false; };
  /* 手機筆記寫一行（AA_182：手機裡，隨時可以）：選單和手機共用 */
  S.note=async function(GM){ const G=GM.G; if(!S.pending(G)) return false; let k=0; GM.sceneBegin(); try{ k=await GM.choose(C.notes.map(t=>({t}))); } finally { GM.sceneEnd(); } S.done(G,'note',{CLEANUP_NOTE:C.notes[k]||C.notes[0]}); if(GM.toast) GM.toast(C.noteDone,2400); return true; };
  /* 手機上的入口（AA_182「手機裡，隨時可以」）：手機「今天」頁的按鈕（game3d.js 讀 PHONE.TODAY_ACTS：{label, show(G), run(GM)}）*/
  S.PHONE_ACT={id:'v6_note',label:C.menu.note,show:G=>S.pending(G),run:GM=>S.note(GM)};
  if(typeof PHONE!=='undefined'){ if(!Array.isArray(PHONE.TODAY_ACTS)) PHONE.TODAY_ACTS=[]; if(!PHONE.TODAY_ACTS.some(a=>a&&a.id==='v6_note')) PHONE.TODAY_ACTS.push(S.PHONE_ACT); }
  S.zhe=async function(GM,mode){ const G=GM.G, home=mode!=='dorm';   /* 宿舍＝頂樓；在家（和宿舍以外有書桌的房間）＝打電話、同一段話 */
    if(!home&&typeof PHONE!=='undefined'){ PHONE.post(G,{th:'p:zhe',from:'player',who:null,text:C.zheAsk}); PHONE.post(G,{th:'p:zhe',from:'zhe',text:C.zheReply}); }
    GM.sceneBegin(); try{ if(!home){ if(GM.fade) await GM.fade(true); GM.advance(1/6); if(GM.fade) await GM.fade(false); }   /* 十分鐘後，宿舍頂樓 */
      const e=evOf(home?'ev_v6_clean_zhe_call':'ev_v6_clean_zhe'); if(e&&typeof EVENTS!=='undefined'){ if(EVENTS.running&&EVENTS.runLines) await EVENTS.runLines(e.dialogue,e); else await EVENTS.run(e,{noTitle:true}); } }   /* 在家＝在家選單的事件裡面（EVENTS.run 不能套另一個）*/
    finally { GM.sceneEnd(); }
    S.done(G,'zhe'); return true; };
  S.her=async function(GM,id){ const G=GM.G, H=C.her[id]; let pick=null, own=false; GM.sceneBegin();
    try{ own=advBegin('blur'); for(const t of H.lines) await GM.say(null,t); if(H.opts){ const k=await GM.choose(H.opts.map(t=>({t}))); pick=H.opts[k]||null; } if(H.after) await GM.say(null,H.after); }
    finally { advEnd(own); GM.sceneEnd(); }
    S.done(G,'her',{CLEANUP_HER:id,CLEANUP_HER_PICK:pick}); return true; };   /* 沛珊的便條留哪裡都一樣（BB_119 9-4：沒有新旗標，玩家自己的決定）——記下來而已 */
  /* 書桌旁的「收拾」（有書桌的房間：宿舍、美國公寓…）*/
  S.place=function(GM){ const G=GM.G, E=GM.E; if(!E||!Array.isArray(E.interactables)) return; const k=E.interactables.findIndex(it=>it.v6Clean);
    if(!S.pending(G)){ if(k>=0) E.interactables.splice(k,1); return; } if(k>=0) return;
    const d=E.interactables.find(it=>it.deskStudy); if(!d) return;
    const it={x:d.x-0.35,z:d.z+0.35,radius:0.7,prio:0.1,label:'收拾',v6Clean:true,onInteract:()=>{ if(busy) return; go(async()=>{ await S.menu(GM,G.zone==='dorm'?'dorm':'call'); S.place(GM); }); }};   /* 「收拾」照 AA_182 第 2 節 */
    if(d.lv!==undefined) it.lv=d.lv;
    /* 站得到的那一角（明信片用 d.x+0.35、d.z+0.35，這裡先試另外三角；R2Y4A.pc2Reach：站得住、不被別的東西蓋掉、從書桌椅子走得到）*/
    const reach=typeof R2Y4A!=='undefined'&&R2Y4A.pc2Reach, ap=d.seat&&d.seat.ap;
    if(reach){ const CS=[[-0.35,0.35],[0.35,-0.35],[-0.35,-0.35],[0.35,0.35]]; let ok=false; for(const c of CS){ it.x=d.x+c[0]; it.z=d.z+c[1]; if(reach(E,it,ap)){ ok=true; break; } } if(!ok){ it.x=d.x+0.35; it.z=d.z-0.35; } }
    E.interactables.push(it); };
  if(STORY.populate&&!STORY._v6exPopulate){ const p0=STORY.populate; STORY.populate=function(zoneId,GM){ const r=p0.apply(this,arguments); try{ if(GM&&GM.G) S.place(GM); }catch(e){ console.warn('V6EX.populate',e); } return r; }; STORY._v6exPopulate=true; }
  /* 在家：在家的選單之前，一天問一次（trigger 'home'）*/
  S.homeDue=G=>S.pending(G)&&S.rec(G).home!==G.day;   /* 經濟系那一年（休學在家）也算：事件標 stage:'any' */
  /* 週末在家（home3d.js 的週末選單沒有跑 trigger 'home' 的事件）：選單多一個「收拾」（HOME.MENU_OPTS），阿哲那一項＝打電話 */
  S.homeOpt=G=>S.pending(G)?{t:'收拾',run:GM=>S.menu(GM,'call')}:null;
  if(typeof HOME!=='undefined'&&Array.isArray(HOME.MENU_OPTS)&&!HOME.MENU_OPTS.includes(S.homeOpt)) HOME.MENU_OPTS.push(S.homeOpt);
  /* 七天都沒做：等到第七天 22:00 才補那一句（AA_182；ROM.cleanupLate 照原本，第七天 0 點起就不擋新的交往）*/
  if(STORY.cleanupTick&&!STORY._v6exCleanTick){ const t0=STORY.cleanupTick; STORY.cleanupTick=function(GM){ const G=GM&&GM.G, F=G&&G.flags; if(F&&F.CLEANUP_DONE===false&&F.cleanupDue!=null&&G.day===F.cleanupDue&&hh(G)<22) return false; return t0.apply(this,arguments); }; STORY._v6exCleanTick=true; }

  /* ======================= 事件（收拾、前任版）======================= */
  const say=(id,t)=>({speaker:id,text:t}), nar=t=>({speaker:null,text:t});
  /* 讀書會以前來過（不搶第一次的白板 ev_public_law_group）：演過白板，或這一場以外還有到場紀錄（classes3d.js 先 markAttended 這一場、再挑事件）*/
  S.plgBefore=G=>{ if(G.events&&G.events.done&&G.events.done.ev_public_law_group) return true; const A=(G.acts&&G.acts.att)||{}; return Object.keys(A).filter(k=>k.indexOf('public_law_group@')===0&&k!=='public_law_group@'+G.day).length>0; };
  S.anPlgDue=G=>isEx(G,AN)&&!G.flags.V6EX_AN_PLG&&(typeof STORY.present!=='function'||STORY.present(AN,G));
  /* 芯慈留位子：這一場是分開以後的第一場（分開以後、這一場以前沒有別的讀書會到場紀錄；同一天的話，分開要在 20:00 開始以前）；和芯慈有點熟以上、她在；交棒（大四上 11/30）以後沒有 */
  S.XC='classmate_xinci';
  S.seatDue=function(G){ const R=G.flags.V6EX, P=(R&&R.seat)||[]; if(!P.length) return false; if(!(met(S.XC)&&stageAt(S.XC,'FAMILIAR'))||(typeof STORY.present==='function'&&!STORY.present(S.XC,G))) return false;
    const hand=STORY.dayOfKey?STORY.dayOfKey('2028-11-30'):null; if(hand!=null&&G.day>=hand) return false;
    const A=(G.acts&&G.acts.att)||{}, att=Object.keys(A).filter(k=>k.indexOf('public_law_group@')===0).map(k=>+k.slice(17)).filter(d=>d!==G.day);
    return P.some(b=>(b.day<G.day||(b.day===G.day&&b.h<20))&&!att.some(d=>d>b.day||(d===b.day&&b.h<20))); };
  S.seatDone=G=>{ const R=G.flags.V6EX; if(R) R.seat=[]; };
  S.EV=[
    {id:'ev_v6_clean_zhe',title:'宿舍頂樓',participants:['zhe'],location:'any',trigger:'manual',stage:'any',background:'dark',dialogue:[{scene:'宿舍頂樓',bg:'dorm_roof'},say('zhe',C.zheLine),{choice:C.zheOpts.map((t,i)=>({text:t,set:{CLEANUP_ZHE:i}}))}]},
    {id:'ev_v6_clean_zhe_call',title:'阿哲的電話',participants:['zhe'],location:'any',trigger:'manual',stage:'any',background:'dark',dialogue:[{scene:'電話'},say('zhe',C.zheLine),{choice:C.zheOpts.map((t,i)=>({text:t,set:{CLEANUP_ZHE:i}}))}]},
    {id:'ev_v6_clean_home',title:'收拾',participants:[],location:'any',trigger:'home',stage:'any',background:'dark',prereq:{custom:G=>S.homeDue(G)},
      dialogue:[{call:async(G,GM)=>{ S.rec(G).home=G.day; await S.menu(GM,'home'); }}]},
    /* 分開以後第一次去公法讀書會：芯慈把筆袋拿走（AA_434 第 4 節第 2 點，分開的是誰都演）→ 以安那一句（AA_123 4-3；只有和以安分開過的）。一場社課只演一件事，兩段合在這裡 */
    {id:'ev_an_ex_plg',title:'公法讀書會',participants:[AN],portraitLater:true,location:'any',trigger:'club',clubEvent:'public_law_group',background:'blur',
      prereq:{custom:G=>S.plgBefore(G)&&(S.anPlgDue(G)||S.seatDue(G))},
      dialogue:[{if:{custom:G=>S.seatDue(G)},text:L.TEAM.xinciSeat[0],speaker:null},{if:{custom:G=>S.seatDue(G)},text:L.TEAM.xinciSeat[1],speaker:null},{call:G=>{ S.seatDone(G); }},
        {if:{custom:G=>S.anPlgDue(G)},speaker:null,text:X.anPlgNod},   /* AA_600 A1：她的句子刪，旁白「（她看了你一眼，點了一下頭，翻開講義。）」*/{if:{custom:G=>S.anPlgDue(G)},set:{V6EX_AN_PLG:true}}]} ];
  /* A3 新 9（AA_123 4-3b）：大二上行政法第 12 週，課堂照演；下課後多一句。句子在 syllabus.js 那一週的 exAfter（tools/syllabus/import_syllabus.py 從 AA_123 匯入）*/
  S.exAfter=(cid,wk)=>{ const w=typeof SYLLABUS!=='undefined'&&SYLLABUS.courses&&(SYLLABUS.courses[cid]||[]).find(x=>x&&x.w===wk); return (w&&Array.isArray(w.exAfter))?w.exAfter:[]; };
  S.AN_EX_ADMIN_OFF=true;   /* AA_600 A2（企劃線 031414cad）：下課後她先開口的那一句＝前任不演（syllabus.js 的 exAfter 資料留著，不接）*/
  { const A9=S.AN_EX_ADMIN_OFF?[]:S.exAfter('admin_law',12); if(A9.length) S.EV.push({id:'ev_an_ex_admin',title:'行政法',participants:[AN],location:'any',trigger:'class',afterClass:'admin_law',term:['Y2S1'],weeks:[12],once:true,background:'blur',
      prereq:{custom:G=>isEx(G,AN)&&(typeof STORY.present!=='function'||STORY.present(AN,G))},dialogue:A9.map(r=>say(r.who,r.text))}); }
  for(const e of S.EV) if(!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e);
  /* A3 新 16 送機：她走進去以前多一句（前任；不給那一頁＝原本就只有交往版給）*/
  S.patchSendoff=function(){ const e=evOf('ev_an_sendoff'); if(!e||!Array.isArray(e.dialogue)||e.v6exPatched) return false;
    const i=e.dialogue.findIndex(l=>l&&Array.isArray(l.choice)&&l.unless&&l.choice[0]&&l.choice[0].text==='「好。」'); if(i<0) return false;
    e.dialogue.splice(i,0,{if:{custom:G=>isEx(G,AN)},speaker:AN,text:X.anSendoff}); e.v6exPatched=true; return true; };
  S.patchSendoff();
  /* A3 新 8（AA_123 4-3b）：週六補讀那天她看到你（ev_plg_rules_after，events.js），其他照友情版——加在 CG-2 那一拍之前 */
  S.patchPlgAfter=function(){ const e=evOf('ev_plg_rules_after'); if(!e||!Array.isArray(e.dialogue)||e.v6exPatched) return false;
    const i=e.dialogue.findIndex(l=>l&&l.cg==='cg_plg_rules'); if(i<0) return false;
    e.dialogue.splice(i,0,{if:{custom:G=>isEx(G,AN)},speaker:AN,text:X.anPlg8}); e.v6exPatched=true; return true; };
  S.AN_PLG8_OFF=true;   /* AA_600 A3：ev_plg_rules_after 的前任插句「……你也來了。坐原來的位子。」刪（她不先開口）——不再插 */
  if(!S.AN_PLG8_OFF) S.patchPlgAfter();
  /* A3 新 20：前任＝麵店長桌那一版（照「和別人交往中」）*/
  if(typeof Y34B!=='undefined'&&Y34B.an20Mode&&!Y34B._v6exAn20){ const m0=Y34B.an20Mode; Y34B.an20Mode=function(G){ if(G&&isEx(G,AN)) return 'noodle'; return m0.apply(this,arguments); }; Y34B._v6exAn20=true; }

  /* ======================= 說話前的一句（STORY.PRE_TALK）======================= */
  /* 祐廷之後和別人交往（分開以後才開始的）、她確實知道 */
  S.otherAfter=function(G,ex,only){ const e=S.endDay(G,ex); return ROM.partners(G).filter(p=>p!==ex&&(!only||p===only)).filter(p=>{ const R=ROM.get(G,p); return (e==null||R.sinceDay==null||R.sinceDay>=e)&&ROM.knowsOf(G,ex,p); }); };
  const lawZone=z=>typeof z==='string'&&(z==='wancai'||z==='lawlib'||z==='classroom'||z.indexOf('linze')===0);   /* 法學院：霖澤館（各層、各間）、萬才館、法圖、201 */
  S.preLine=function(G,id){ const F=G.flags; if(!law(G)) return null;
    if(id===AN&&isEx(G,AN)&&!F.V6EX_AN_OTHER&&S.otherAfter(G,AN).length) return ['V6EX_AN_OTHER',X.anOther];
    if(id===YT&&isEx(G,YT)&&!F.V6EX_YT_AN&&S.otherAfter(G,YT,AN).length) return ['V6EX_YT_AN',X.ytAfterAn];
    if(id===ZQ&&isEx(G,ZQ)&&!F.V6EX_FIRST_ZQ) return ['V6EX_FIRST_ZQ',X.zqFirst];
    if(id===ZR&&isEx(G,ZR)&&!F.V6EX_FIRST_ZR&&G.zone==='cafe') return ['V6EX_FIRST_ZR',X.zrFirst];
    if(id===SIS&&isEx(G,SIS)&&!F.V6EX_FIRST_SIS&&(F.JOB_RA||lawZone(G.zone))) return ['V6EX_FIRST_SIS',F.JOB_RA?X.sisRA:X.sisLaw];   /* AA_600 S10：前任的學姊當面找她＝S.sisExTalk 先擋（只點頭／「嗯。」），這一句走不到；留給舊存檔讀稿對照 */
    if(id===KX&&isEx(G,KX)&&!F.V6EX_FIRST_KX&&F.KX_ENDED==='drift'&&!(typeof KXDRIFT!=='undefined'&&KXDRIFT.frOn&&KXDRIFT.frOn(G))) return ['V6EX_FIRST_KX',X.kxFirst];   /* 走向 B、C（AA_351 的慢慢分手）分開以後第一次見面；D6 公館那頓午餐（AA_351）先見過＝照它，不說 */
    return null; };
  S.preTalk=async function(GM,who,id){ const G=GM&&GM.G; if(!G||!G.flags) return; const p=S.preLine(G,id); if(!p) return; G.flags[p[0]]=G.day; for(const l of [].concat(p[1])) await (typeof l==='string'?GM.say(who,l):GM.say(null,l.n)); };   /* 旁白＝{n} */
  if(Array.isArray(STORY.PRE_TALK)) STORY.PRE_TALK.push((GM,who,id)=>S.preTalk(GM,who,id));

  /* ======================= A7 桌遊團 ======================= */
  S.TEAM=['zhe','yu','classmate_bohan','classmate_xinci'];
  S.knowers=(G,p)=>S.TEAM.filter(x=>met(x)&&ROM.knowsOf(G,x,p));
  S.teamDue=function(G){ if(!law(G)||G.zone!=='noodle') return null; const h=hh(G); if(!(STORY.noodleDay&&STORY.noodleDay(G.day))||h<17||h>=21) return null;   /* 麵店日（上課週的週二、週四）17:00～21:00 在麵店＝story3d.js 記「有來」的同一個窗 */
    if(typeof PHONE!=='undefined'&&PHONE.inGroup&&!PHONE.inGroup(G,'noodle_team')) return null;   /* 不在桌遊團的玩家，沒有這一段 */
    for(const s of S.rec(G).starts){ if(s.done||!dating(G,s.id)) continue; const K=S.knowers(G,s.id); if(!K.length) continue;
      const same=ROM.exes(G).some(x=>x!==s.id&&S.knowers(G,x).length>0); return {s,K,same}; }
    return null; };
  S.teamPlay=async function(GM,t){ const G=GM.G; t.s.done=G.day; const lines=t.same?L.TEAM.same.filter(([id])=>t.K.includes(id)):L.TEAM.start.filter(([id])=>t.K.includes(id));
    if(!lines.length) return false; let own=false; GM.sceneBegin(); try{ own=advBegin('blur'); for(const [id,tx] of lines) await GM.say({name:typeof SOCIAL!=='undefined'?SOCIAL.displayName(id):id,charId:id},tx); } finally { advEnd(own); GM.sceneEnd(); } return true; };
  /* 分開：柏翰知道的話，下一個上課日 12:10 私訊 */
  S.classDay=d=>{ if(typeof CALENDAR==='undefined') return false; const w=wdOf(d); return w>=1&&w<=5&&CALENDAR.kind(d)==='term'; };
  S.phone=function(G){ if(!law(G)||typeof PHONE==='undefined') return; const R=S.rec(G);
    /* Alison：分開以後第一個晚上 22:00 一張貼圖（AA_434 第 4 節第 1 點）：和她朋友以上、她確實知道那一段（ROM.knowsOf，分開的事跟著知道） */
    for(const y of (R.yu||[])){ if(y.sent!=null) continue; const d=y.h<22?y.day:y.day+1; if(now(G)<T(d,22)) continue;
      if(!(met('yu')&&stageAt('yu','FRIEND')&&ROM.knowsOf(G,'yu',y.id)&&(typeof INV==='undefined'||!INV.hasContact||INV.hasContact(G,'yu')))||G.day>d+1){ y.sent=false; continue; }
      y.sent=d; PHONE.at(G,d,22,[{th:'p:yu',from:'yu',text:L.TEAM.yuSticker}],'v6ex_yu_'+y.id+'_'+y.day); }
    for(const n of R.notes){ if(n.sent!=null) continue; if(!(met('classmate_bohan')&&ROM.knowsOf(G,'classmate_bohan',n.id)&&(typeof INV==='undefined'||!INV.hasContact||INV.hasContact(G,'classmate_bohan')))){ n.sent=false; continue; }
      let d=n.day+1; while(d<n.day+60&&!S.classDay(d)) d++; if(d>=n.day+60){ n.sent=false; continue; }
      if(now(G)>=T(d,12+10/60)){ n.sent=d; if(G.day<=d+1) PHONE.at(G,d,12+10/60,[{th:'p:classmate_bohan',from:'classmate_bohan',text:L.TEAM.bohanNotes}],'v6ex_bohan_'+n.id+'_'+n.day); } } };

  /* ======================= 分開以後一個學期（AA_434 第 4 節第 3 點）======================= */
  /* 主線 4 這週的訊息（STORY.neededPick，週日 21:00）：她的那幾則每兩次送一次 */
  if(STORY.neededPick&&!STORY._v6exNeed){ const n0=STORY.neededPick; STORY.neededPick=function(G,d){ const L=n0.apply(this,arguments); if(!Array.isArray(L)||!G||!G.flags) return L;
      return L.filter(e=>!(e&&S.noContact(G,e.who))).filter(e=>!G.flags.V6EX||!(e&&S.COOL_IDS.includes(e.who)&&S.cool(Object.assign({},G,{day:d}),e.who)&&S.coolSkip(G,e.who,'need',e.id+'@'+d))); }; STORY._v6exNeed=true; }
  /* 手機小事（story3d.js 的 dailyPhone，tag dp_<條目>_<第幾次>_<第幾則>）：她傳的那一則每兩次送一次（同一次的幾則一起送或一起跳過）*/
  if(typeof PHONE!=='undefined'&&PHONE.at&&!PHONE._v6exAt){ const a0=PHONE.at; PHONE.at=function(G,day,h,items,tag){
      if(G&&G.flags&&typeof tag==='string'&&/^dp_/.test(tag)&&Array.isArray(items)){ const keep=items.filter(it=>!(it&&S.noContact(G,it.from)&&it.th==='p:'+it.from)).filter(it=>!(G.flags.V6EX&&it&&S.COOL_IDS.includes(it.from)&&it.th==='p:'+it.from&&S.cool(Object.assign({},G,{day}),it.from)&&S.coolSkip(G,it.from,'dp',tag.replace(/_\d+$/,''))));
        if(!keep.length) return false; if(keep.length!==items.length) return a0.call(this,G,day,h,keep,tag); }
      return a0.apply(this,arguments); }; PHONE._v6exAt=true; }
  /* 她主動約（約人系統：以安週二 21:00 約讀書會完去吃飯，INV.anAsk）：這段期間不約 */
  if(typeof INV!=='undefined'&&INV.anAsk&&!INV._v6exAsk){ const q0=INV.anAsk; INV.anAsk=function(G){ if(G&&G.flags&&(S.cool(G,AN)||S.noContact(G,AN))) return false;   /* AA_600 S3：前任不約 */ return q0.apply(this,arguments); }; INV._v6exAsk=true; }

  /* ======================= 每 0.5 秒 ======================= */
  let busy=false; const go=fn=>{ busy=true; Promise.resolve().then(fn).catch(e=>console.warn('V6EX',e)).finally(()=>{ busy=false; }); return true; };
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['v6ex3d:busy']=()=>{ busy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  S.isBusy=()=>busy;
  const free=GM=>{ const E=GM.E, P=E&&E.player; return !!P&&!E.paused&&!P.busy&&!(GM.D&&GM.D.active)&&!(typeof EVENTS!=='undefined'&&EVENTS.running)&&!(typeof ADV!=='undefined'&&ADV.active)&&!GM.titleIdle; };
  S.tick=function(GM){ const G=GM&&GM.G; if(!G||!G.flags) return false; try{ S.place(GM); }catch(e){}
    if(busy||!free(GM)) return false; const R=S.rec(G);
    if(R.entry!=null&&S.pending(G)){ R.entry=null; return go(async()=>{ GM.sceneBegin(); try{ await GM.say(null,C.entry); } finally { GM.sceneEnd(); } }); }   /* 分開以後第一個空檔 */
    if(R.entry!=null&&!S.pending(G)) R.entry=null;
    { const t=S.teamDue(G); if(t) return go(()=>S.teamPlay(GM,t)); }
    return false; };
  STORY.TICKS.push((GM,dt)=>S.tick(GM,dt));
  STORY.PHONE_RULES.push(G=>S.phone(G));

  /* 規格寫了、這一輪沒有做的（回報 LAWWW／AA）*/
  S.NOT_DONE=[
    'S4 紙箱：主線 10 拆箱（story3d.js STORY.unboxY4）照 AA_437 第 6 節接了；「不打開」記 BOX_KEPT_Y4＝exbox，主線 11 收拾（STORY.packY4）拿起它的那一句 AA_318 第 4 節沒有寫（「你從紙箱裡拿出…」對紙箱本身不通），先跳過；第三步又留了一件東西＝BOX_KEPT_Y4 記那一件（EXBOX_Y4 記 kept）',
    'A3 以安：桌遊團前兩週坐長桌另一頭（畫面）；新 13b 照 AA_123 4-3b 前任不演（新 15 前任版＝麵店長桌，AA_437 第 4 節，story3d.js STORY.an15Noodle）',
    'A6 語彤：事件 9、10、12、13、14、15 的前任版（y2b3d.js、r2y3a_events.js、y34b3d.js 各自的場景）、16b 群組版',
    'B6：沛珊（P6 公開課、書店那一句——她在台南，書店是台南的二手書店，要走 hometown3d.js，這一輪別人的檔）、芷若的明信片改寄到 Café（r2y4a3d.js 第二輪明信片）、學姊研究助理「辭掉」的選項（JOB_RA 遊戲裡還沒有）',
    'B6 之後一個學期（AA_434 4-3）：接了主線 4 的週日訊息（STORY.neededPick）、手機小事（dp_）、以安週二約讀書會完吃飯（INV.anAsk）、寒暑假活動她私訊約（vac3d.js 的 signup dm）；固定日子的 needed（story3d.js S.neededAt）、節日（fest3d.js、an_yt_hol3d.js）、其他事件包自己排的私訊和邀約要各自讀 V6EX.cool(G,id)',
    'B7：BCG-19 學姊告白點 2（ev_sis_walk_avenue，遊戲裡沒有，告白已經改到學期末）；BCG-24 沛珊星期日（1b-2 作廢）。BCG-25 英國的雨已經放了：src/v6b_3d.js 的 ev_zhiruo_uk_visit（BB_119 1c-1＝V6-B2，任務 feat-v6b-1101）' ];
  S.GAPS=['收拾選單的「算了」、做完的提示「收好了。」「寫好了。」','阿哲那段三個選項寫成「（講一點）」「（只吃東西）」「「謝謝」」','手機筆記三句加「」'];
  return S;
})();
