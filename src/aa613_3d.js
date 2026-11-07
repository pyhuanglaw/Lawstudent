/* ===== AA_613 開學活動有同學約一起去、系籃怎麼加入（企劃線 claude/cool-heisenberg-o8kuqx 52e3d83a8，AA 2026-11-03 照；接線時補的 232fe4149（AA-B 11-07 20:3x：第 4、6、9 點）； D109 自己定；任務 AA613-OPENING-ACTS-1103；第①級）=====
   使用者 11-03：「社團博覽會要有同學邀請一起去啊」「系藍怎麼參加的要說阿」「學校開學的活動要有同學約一起去啊 不然先認識同學要幹嘛」。
   台詞照稿第 1、2 節一字不改（S.L；說的人照稿）。第 3 節（兩層樓的書店）在別的地方做，這裡不做。
   約人的原則（稿開頭）：約的人都是玩家之前已經認識的（STORY.knows）；玩家說不去，活動照樣可以自己去；沒去的不懲罰。
   第 1 節：
     1 社博（新局 9/6（六）10:00～16:00＝CLUBFAIR.fairDay；只給社博在週六的局 CLUBFAIR.hintOn）：前一天 21:00 阿哲私訊兩則＋「好。」／「我晚點自己去。」
         「好。」＝AA613_ZHE_FAIR（那一天）：阿哲 09:45～12:00 在晨思鐘（作息 STORY.SCHED_X）；玩家 10:00～12:00 走到他旁邊＝2-1 那一段（S.bellScene；AA613_BELL_MET）。
         說了「好。」、到 12:00 都沒到晨思鐘（也還沒自己填系籃）＝16:00 阿哲「你沒來喔？系籃我幫你填了。」：送到就算填了（CLUB_dept_basketball），回「不要啦。」＝取消、「好。」＝照填。
     2 前一天 21:10 第七小隊群組（宿營的 camp_squad_y1）：芯慈、沛珊各一則，不用回。11:00～12:00 沛珊、芯慈在合唱團的攤位前面（作息）；
         走過去說話（找她們任何一位）＝ev_aa613_choir：沛珊「你填了什麼？」→ 你（自動）說填過的社團名字（一個都沒填＝「還沒。」）→ 沛珊「我想去看熱舞。十一點半。」（演一次）。
         沛珊那個週末本來回台中（AA_372 第 8 項，單數週）：只有 9/6 11:00～12:00 算在臺北（STORY.presence 包一層，S.psFairHere；已問 AA）。
     3 法律資料怎麼查（activities.js lawlib_intro_y1s1：9/24、10/1 週三 15:30）：兩場都還沒去，前一天 21:00 芯慈私訊兩則＋「好。」／「這次先不用。」
         「好。」＝AA613_XC_LIB（那一天）：15:20～15:30 她在法圖門口（萬才館一樓大廳西南角的門前）；走到她旁邊＝「這邊。」（AA613_XC_MET），之後她在討論室 A；
         你坐下來聽講座（CLS.attendActivity）＝她坐到你旁邊的位子（S.sitBeside）。講座照現在。
     4 第一次社課（第 5 週）：在社博填過表的吉他社、辯論社、登山社＝第一次社課前一天 21:00 社團群組（學長）一則；系籃見 2-3。
     開學典禮（遊戲裡是 8/31 14:00 自動演，story3d.js S.ceremonyY1）：是自動流程＝開頭一句旁白「（你和柏翰一起走過去。）」（S.ceremonyWalk；認識柏翰才有）。
   第 2 節（系籃＝法律系系學會的系隊；練球大一上第 5～7、10～15 週週五 17:30～19:00，activities.js dept_basketball）：
     2-1 跟阿哲一起去社博（第 1 列說「好。」）：晨思鐘那一段（S.bellScene）→ 走到系籃的攤位 → 「我也寫。」＝加入（CLUB_dept_basketball，照現在）／「我先看看。」；
         之後阿哲 12:00 前在系籃攤位旁邊（作息），之後離開。
     2-2 自己去社博的系籃攤位：顧攤的學長多兩句（src/data/club_fair.js 的 BOOTHS basketball.say）。
     2-3 社博沒填的：第一次練球前一天 21:00 阿哲私訊兩則＋「好，我去看看。」（AA613_BALL_GO）／「這學期先不要。」→ 阿哲「OK。」；
         已加入的：同一天 21:00 系籃群組，學長一則。（稿寫「第 4 週週四」，句子是「明天系籃第一次練球」、第一次練球是第 5 週週五——照句子排在第一次練球的前一天，已問 AA）
     2-4 第一次到球場（沒填過表的）：「（你在場邊填了表。）」換成學長兩句（club_fair.js DOOR_SAY_BY，clubfair3d.js 演）；之後照現在記 CLUB_dept_basketball；
         阿哲在場（作息在同一區）、而且 2-3 選了「好，我去看看。」＝加阿哲一句「我就說吧。」（S.doorAfter，CLUBFAIR.DOOR_AFTER）。
   載入順序：story3d.js、classes3d.js、clubfair3d.js、phone3d.js 之後（index.html 放在 aa667_3d.js 後面）。測試：node tests/aa613_opening_acts_unit.js、node tests/aa613_spots_unit.js */
'use strict';
const AA613=(function(){
  const S={};
  const ZHE='zhe', XC='classmate_xinci', PS='classmate_peishan', BH='classmate_bohan';
  const law=G=>!!G&&(G.stage||'law')==='law';
  const NOW=G=>G.day*24+(+G.hour||0), T=(d,h)=>d*24+h, hr=G=>(+G.hour||0)%24;
  const F_=G=>G.flags||(G.flags={});
  const knows=(id,G)=>typeof STORY!=='undefined'&&!!STORY.knows&&!!STORY.knows(id,G);
  const P_=()=>typeof PHONE!=='undefined'?PHONE:null;
  const sent=(G,tag)=>{ const P=P_(); return !!P&&P.sent(G,tag); };
  const dm=(id,t)=>({th:'p:'+id,from:id,text:t});
  const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const act=id=>typeof ACTIVITIES!=='undefined'&&ACTIVITIES.list?ACTIVITIES.list.find(a=>a.id===id)||null:null;
  const here=(id,G)=>!(typeof STORY!=='undefined'&&STORY.presence&&(p=>p&&p.here===false)(STORY.presence(id,G)));
  const fair=()=>typeof CLUBFAIR!=='undefined'?CLUBFAIR:null;

  /* ---------------- 台詞（稿第 1、2 節，一字不改）---------------- */
  S.L={
    zheFair:{dm:['明天社博要不要一起去？','十點，晨思鐘。我要去系籃那攤。'],opts:['好。','我晚點自己去。']},   /* 1-1 */
    squad:[[XC,'明天社博有人要去嗎？我想去看合唱團。'],[PS,'我！我十一點才能到。']],   /* 1-2 群組 */
    choir:{ask:'你填了什麼？',none:'還沒。',dance:'我想去看熱舞。十一點半。'},   /* 1-2 合唱團的攤位前面（沛珊）*/
    xcLib:{dm:['明天下午法圖有教怎麼查判決，三點半。之後寫報告會用到。','我想去。你要不要？'],opts:['好。','這次先不用。'],here:'這邊。',late:'（她看到你，指了指旁邊的空位。）'},   /* 1-3；late：15:30 以後才到（接線時補的第 9 點，232fe4149）*/
    clubGrp:{club_guitar:'明天第一次社課，七點，B館多功能教室。沒有吉他的可以借。',club_debate:'明天七點博思 201。第一次只講規則。',club_hiking:'週四行前會七點半，普通 201。'},   /* 1-4（學長）*/
    ceremony:'（你和柏翰一起走過去。）',   /* 開學典禮：自動流程的那一句旁白 */
    noShow:{dm:'你沒來喔？系籃我幫你填了。',opts:['不要啦。','好。']},   /* 1：說了「好。」又沒來 */
    bell:[[null,'（10:00，晨思鐘。阿哲已經在了，手上拿著三張傳單。）'],[ZHE,'你來了。我先拿了一些。'],[ZHE,'系籃在那邊。走。'],
      [null,'（系學會的攤位，招牌寫「法律系系學會（系籃）」。）'],['顧攤的學長','法律系的？系籃缺人。'],[ZHE,'學長，我高中有打。'],
      ['顧攤的學長','好，名字寫這裡。（他看你）你呢？'],['顧攤的學長','系籃是系學會的，法律系都可以來。不用會打，練球週五五點半，第五週開始。']],   /* 2-1 */
    bellOpts:[{t:'我也寫。',join:true,say:[[ZHE,'好欸。']]},{t:'我先看看。',say:[[ZHE,'好啦，想來再跟我說。']]}],
    bellEnd:[ZHE,'我去看別的。你逛你的，中午舞台有表演。'],
    bellLate:[null,'（晨思鐘。社團博覽會已經開始一陣子了，攤位前面都是人。阿哲站在系籃的攤位旁邊，手上拿著三張傳單。）'],   /* 10:30 以後才到：換掉開頭旁白（接線時補的第 4 點，232fe4149）*/
    ball:{dm:['明天系籃第一次練球。','五點半，映月湖旁邊的球場。系上的都可以來，不用報名。'],opts:['好，我去看看。','這學期先不要。'],no:'OK。',
      grp:'明天第一次練球，17:30 球場。大一的穿球鞋就好，球我們有。'},   /* 2-3 */
    told:'我就說吧。' };   /* 2-4 阿哲 */

  /* ---------------- 日子 ---------------- */
  /* 社博（大一、9/6 週六的局）：前一天＝私訊、群組的那一天 */
  /* 這一份的事都在大一上開學到第 6 週以前（社博、講座、第一次社課、第一次練球）：主迴圈每一格都叫手機規則、作息、presence——過了就不算（先比日子）*/
  let END=null; S.endDay=()=>{ if(END==null){ const r=typeof CALENDAR!=='undefined'&&CALENDAR.termDays?CALENDAR.termDays('Y1S1'):null; END=r?r.from+6*7-1:-1; } return END; };
  S.fairDay=G=>{ if(!G||G.day>S.endDay()) return null; const C=fair(); return C&&law(G)&&C.hintOn(G)?C.fairDay(G):null; };
  /* 某個社團大一上第一次社課（照 ACTIVITIES.on；國定假日停的照它）。社團的日子只看學期、週次、星期（不看這一局），算一次記下來 */
  const FS={};
  S.firstSession=function(G,aid){ if(Object.prototype.hasOwnProperty.call(FS,aid)) return FS[aid]; const a=act(aid); if(!a||typeof CALENDAR==='undefined'||!CALENDAR.termDays) return null; const r=CALENDAR.termDays('Y1S1'); if(!r) return null;
    let out=null; for(let d=r.from; d<=r.to; d++) if(ACTIVITIES.on(a,d,G)){ out=d; break; } FS[aid]=out; return out; };
  S.lecDays=()=>{ const a=act('lawlib_intro_y1s1'); return a?(a.dates||[]).map(DK).filter(d=>d!=null).sort((x,y)=>x-y):[]; };

  /* ---------------- 作息（STORY.SCHED_X）：同一個時段回傳同一個物件（story3d.js lingerMove 照 === 比）---------------- */
  const ALL=[0,1,2,3,4,5,6];
  S.SPOT={ bell:[-36.6,13.4,Math.PI,0], booth:[-29.8,11.2,0,0], ps:[-74.9,3.0,0,0], xc:[-72.3,3.0,0,0], door:[-6.2,5.6,Math.PI/2,0] };   /* tests/aa613_spots_unit.js：站得住、從大道／大廳走得到 */
  S.SCHED={
    zheBell:{days:ALL,from:9.75,to:12,zone:'campus',act:'linger',at:S.SPOT.bell,label:'晨思鐘',note:'AA_613 1-1／2-1：社博那天說了「好。」，十點晨思鐘'},
    zheBooth:{days:ALL,from:10,to:12,zone:'campus',act:'linger',at:S.SPOT.booth,label:'社團博覽會（系籃的攤位）',note:'AA_613 2-1：12:00 前在系籃攤位旁邊，之後離開'},
    psChoir:{days:ALL,from:11,to:12,zone:'campus',act:'linger',at:S.SPOT.ps,label:'社團博覽會（合唱團的攤位）',talkEvent:'ev_aa613_choir',note:'AA_613 1-2'},
    xcChoir:{days:ALL,from:11,to:12,zone:'campus',act:'linger',at:S.SPOT.xc,label:'社團博覽會（合唱團的攤位）',talkEvent:'ev_aa613_choir',note:'AA_613 1-2'},
    xcDoor:{days:ALL,from:15+20/60,to:15.5,zone:'wancai',act:'linger',at:S.SPOT.door,label:'法律學院圖書館門口',note:'AA_613 1-3：15:20 在法圖門口'},
    xcLec:{days:ALL,from:15+20/60,to:16.5,zone:'lawlib',act:'read',room:'discA',label:'法律學院圖書館 討論室 A',note:'AA_613 1-3：講座（法律資料怎麼查）'} };
  S.zheFairOn=G=>!!G&&!!G.flags&&G.flags.AA613_ZHE_FAIR===G.day&&S.fairDay(G)===G.day;   /* 先看旗標（阿哲的作息常常被叫）*/
  S.choirOn=G=>{ if(!G||hr(G)<11||hr(G)>=12) return false; const d=S.fairDay(G); return d!=null&&G.day===d&&sent(G,'aa613_squad'); };   /* 先看時間（沛珊的 presence 常常被叫）*/
  S.sched=function(c,G){ if(!c||!G||!law(G)) return null; const id=c.id, F=F_(G), h=hr(G);
    if(id===ZHE&&S.zheFairOn(G)&&h<12&&here(ZHE,G)) return F.AA613_BELL_MET===G.day?(h>=10?S.SCHED.zheBooth:null):(h>=9.75?S.SCHED.zheBell:null);
    if((id===PS||id===XC)&&S.choirOn(G)&&here(id,G)) return id===PS?S.SCHED.psChoir:S.SCHED.xcChoir;
    if(id===XC&&F.AA613_XC_LIB===G.day&&here(XC,G)&&h>=15+20/60&&h<16.5) return h<15.5&&F.AA613_XC_MET!==G.day?S.SCHED.xcDoor:S.SCHED.xcLec;
    return null; };

  /* ---------------- 手機（STORY.PHONE_RULES）---------------- */
  S.phone=function(G){ const P=P_(); if(!P||!G||G.day>S.endDay()||!law(G)) return; const F=F_(G), now=NOW(G);
    /* 1-1、1-2：社博前一天 */
    const d6=S.fairDay(G);
    if(d6!=null&&G.day<=d6){
      if(knows(ZHE,G)&&!sent(G,'aa613_zhe_fair')&&now<T(d6,10)){ const X=S.L.zheFair, M=X.dm.map(t=>dm(ZHE,t));
        M[M.length-1].ask={id:'aa613_zhe_fair',until:T(d6,12),opts:[{t:X.opts[0],set:{AA613_ZHE_FAIR:d6}},{t:X.opts[1]}]}; P.at(G,d6-1,21,M,'aa613_zhe_fair'); }
      if(P.inGroup(G,'camp_squad_y1')&&!sent(G,'aa613_squad')&&now<T(d6,10)) P.at(G,d6-1,21+10/60,S.L.squad.map(([id,t])=>({th:'g:camp_squad_y1',from:id,name:typeof SOCIAL!=='undefined'?SOCIAL.displayName(id):undefined,text:t})),'aa613_squad'); }
    /* 1：說了「好。」、到 12:00 都沒到晨思鐘＝16:00 */
    if(d6!=null&&F.AA613_ZHE_FAIR===d6&&F.AA613_BELL_MET!==d6&&now>=T(d6,12)&&G.day<=d6+1&&!F.CLUB_dept_basketball&&!sent(G,'aa613_zhe_noshow')){ const X=S.L.noShow, b=S.firstSession(G,'dept_basketball');
      P.at(G,d6,16,[Object.assign(dm(ZHE,X.dm),{ask:{id:'aa613_zhe_noshow',until:b!=null?T(b,17.5):T(d6+7,24),opts:[{t:X.opts[0],set:{CLUB_dept_basketball:false,AA613_ZHE_FILL_NO:true}},{t:X.opts[1]}]}})],'aa613_zhe_noshow'); }
    if(F.AA613_ZHE_FILLED==null&&G.msgs&&G.msgs.some(m=>m.tag==='aa613_zhe_noshow')){ F.AA613_ZHE_FILLED=G.day; if(!F.AA613_ZHE_FILL_NO) F.CLUB_dept_basketball=true; }   /* 送到＝他幫你填了（回「不要啦。」＝取消）*/
    /* 1-3：法律資料怎麼查，兩場都還沒去＝前一天 21:00 */
    { const a=act('lawlib_intro_y1s1');
      if(a&&knows(XC,G)&&!ACTIVITIES.onceDone(G,a)) for(const d of S.lecDays()){ const tag='aa613_xc_lib_'+d;
        if(G.day<d-1||now>=T(d,a.t0)||sent(G,tag)) continue; const X=S.L.xcLib, M=X.dm.map(t=>dm(XC,t));
        M[M.length-1].ask={id:tag,until:T(d,a.t0),opts:[{t:X.opts[0],set:{AA613_XC_LIB:d}},{t:X.opts[1]}]}; P.at(G,d-1,21,M,tag); } }
    /* 1-4：社博填過表的社團，第一次社課前一天 21:00 社團群組（學長）*/
    for(const aid of Object.keys(S.L.clubGrp)){ const tag='aa613_grp_'+aid; if(!F['CLUB_'+aid]||sent(G,tag)) continue; const d=S.firstSession(G,aid), a=act(aid); if(d==null||!a) continue;
      if(G.day<d-1||now>=T(d,a.t0)) continue; const g=S.group(G,aid); if(!g) continue; P.at(G,d-1,21,[{th:'g:'+g,name:'學長',text:S.L.clubGrp[aid]}],tag); }
    /* 2-3：第一次練球前一天 21:00 */
    { const d=S.firstSession(G,'dept_basketball'), a=act('dept_basketball');
      if(d!=null&&a&&G.day>=d-1&&now<T(d,a.t0)){
        if(F.CLUB_dept_basketball){ if(!sent(G,'aa613_ball_grp')){ const g=S.group(G,'dept_basketball'); if(g) P.at(G,d-1,21,[{th:'g:'+g,name:'學長',text:S.L.ball.grp}],'aa613_ball_grp'); } }
        else if(knows(ZHE,G)&&!sent(G,'aa613_ball_zhe')&&!sent(G,'aa613_ball_grp')){ const X=S.L.ball, M=X.dm.map(t=>dm(ZHE,t));
          M[M.length-1].ask={id:'aa613_ball_zhe',until:T(d,a.t0),opts:[{t:X.opts[0],set:{AA613_BALL_GO:d}},{t:X.opts[1],say:[{from:ZHE,text:X.no}]}]}; P.at(G,d-1,21,M,'aa613_ball_zhe'); } } } };
  /* 社團群組：吉他社照舊用 guitar（story3d.js、guitar3d.js 同一個），其他的照社團名（activities.js 的 clubName，括號拿掉）*/
  S.GROUP_ID={club_guitar:'guitar',club_debate:'club_debate',club_hiking:'club_hiking',dept_basketball:'dept_basketball'};
  S.group=function(G,aid){ const P=P_(), a=act(aid), gid=S.GROUP_ID[aid]; if(!P||!a||!gid) return null; P.join(G,gid,S.clubName(a)); return gid; };
  S.clubName=a=>String((a&&(a.clubName||a.title))||'').replace(/（[^）]*）/g,'');

  /* ---------------- 2-1 晨思鐘那一段（STORY.TICKS：走到阿哲旁邊）---------------- */
  S.BELL_R=4.5;
  let bellBusy=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['aa613:bellBusy']=()=>{ bellBusy=false; };
  S.bellDue=function(GM){ const G=GM&&GM.G, E=GM&&GM.E; if(!G||bellBusy||G.zone!=='campus'||!S.zheFairOn(G)||F_(G).AA613_BELL_MET===G.day) return false; const h=hr(G); if(h<10||h>=12) return false;
    const C=fair(); if(C&&!C.open(G)) return false; if(!E||!E.player||!E.player.obj) return false; const P=E.player.obj.position, s=S.SPOT.bell; return (E.player.lv|0)===0&&Math.hypot(P.x-s[0],P.z-s[1])<=S.BELL_R; };
  const whoOf=(GM,id)=>{ if(id==null) return null; if(!(typeof CHARACTERS!=='undefined'&&CHARACTERS[id])) return {name:id}; const n=GM.npc&&GM.npc[id]; return {name:SOCIAL.displayName(id),obj:n&&n.obj,charId:id,pose:n&&n.pose}; };
  const sayAll=async(GM,L)=>{ for(const [w,t] of L) await GM.say(whoOf(GM,w),t); };
  S.bellScene=async function(GM){ const G=GM.G, F=F_(G), E=GM.E; if(bellBusy) return false; bellBusy=true; F.AA613_BELL_MET=G.day;
    { const C=fair(), A=C&&C.expo(); if(A&&!ACTIVITIES.attendedAny(G,A.id,G.day)) ACTIVITIES.markAttended(G,A); }   /* 去過博覽會（同攤位、服務台）*/
    GM.sceneBegin(); try{ const L=S.L.bell;   /* 3D 畫面（同社博的攤位）：中間要一起走到系籃的攤位 */
      await sayAll(GM,(hr(G)>=10.5?[S.L.bellLate]:L.slice(0,1)).concat(L.slice(1,3)));   /* 10:30 以後才到＝晚到版的開頭旁白；10:00～10:30 照原本 */
      { const C=fair(), b=C&&C.pos('basketball'), n=GM.npc&&GM.npc[ZHE]; if(b&&GM.walkTo&&E&&E.player){ const w=[GM.walkTo(E.player,b.x,b.z)]; if(n){ if(n.seat&&GM.standUp) GM.standUp(n); n.frozen=false; n.waypoints=null; n.beh='idle'; w.push(GM.walkTo(n,S.SPOT.booth[0],S.SPOT.booth[1]).then(()=>{ if(n.obj) n.obj.rotation.y=S.SPOT.booth[2]; n.pose=n.idlePose='idle'; })); }
        await Promise.all(w); if(GM.face) GM.face(E.player,b.x,b.z+1); } }   /* 「系籃在那邊。走。」：一起走到攤位前面 */
      await sayAll(GM,L.slice(3));
      const O=S.L.bellOpts, k=await GM.choose(O.map(o=>({t:o.t}))), o=O[k]||O[1];
      const had=!!F.CLUB_dept_basketball; if(o.join){ F.CLUB_dept_basketball=true; F.FAIR_JOIN=true; }
      await sayAll(GM,o.say||[]);
      if(o.join&&!had){ const ba=act('dept_basketball'); await GM.say(null,'你在「'+((ba&&(ba.clubName||ba.title))||'系籃')+'」的攤位填了表。'); }   /* 加入＝照現在（clubfair3d.js 攤位填表那一句）；放在阿哲「好欸。」後面（接線時補的第 6 點，232fe4149）*/
      await sayAll(GM,[S.L.bellEnd]);
    } finally { GM.sceneEnd(); bellBusy=false; }
    if(GM.autosave) GM.autosave(); return true; };
  S.tick=function(GM){ if(!S.bellDue(GM)) return false; S.bellScene(GM).catch(e=>console.warn('AA613.bellScene',e)); return true; };

  /* ---------------- 1-3 法圖門口「這邊。」（STORY.TICKS：走到芯慈旁邊）---------------- */
  S.DOOR_R=2.6;
  let doorBusy=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['aa613:doorBusy']=()=>{ doorBusy=false; };
  S.doorDue=function(GM){ const G=GM&&GM.G, E=GM&&GM.E; if(!G||doorBusy||G.zone!=='wancai'||!law(G)) return false; const F=F_(G); if(F.AA613_XC_LIB!==G.day||F.AA613_XC_MET===G.day) return false; const h=hr(G); if(h<15+20/60||h>=15.5) return false;
    if(!E||!E.player||!E.player.obj) return false; const P=E.player.obj.position, s=S.SPOT.door; return (E.player.lv|0)===0&&Math.hypot(P.x-s[0],P.z-s[1])<=S.DOOR_R; };
  S.doorScene=async function(GM){ const G=GM.G; if(doorBusy) return false; doorBusy=true; F_(G).AA613_XC_MET=G.day;
    GM.sceneBegin(); try{ await GM.say(whoOf(GM,XC),S.L.xcLib.here); } finally { GM.sceneEnd(); doorBusy=false; } return true; };
  const tickDoor=function(GM){ if(!S.doorDue(GM)) return false; S.doorScene(GM).catch(e=>console.warn('AA613.doorScene',e)); return true; };

  /* 1-3「坐旁邊」：講座開始（坐下、選聽講座）那一刻，她坐到你旁邊的空位（同一張桌子同一邊，沒有就同一間最近的）*/
  S.sitBeside=function(GM,a){ const G=GM&&GM.G, E=GM&&GM.E; if(!G||!a||a.id!=='lawlib_intro_y1s1'||F_(G).AA613_XC_LIB!==G.day||G.zone!=='lawlib') return false;
    const n=GM.npc&&GM.npc[XC], P=E&&E.player, ps=P&&P.seat; if(!n||!ps||!E.zone||!Array.isArray(E.zone.seats)||!GM.sitAt) return false;
    const room=ps.room||ps.table, busy=st=>(Math.hypot(st.x-ps.x,st.z-ps.z)<0.1)||(E.npcs||[]).some(m=>m&&m!==n&&m.seat&&Math.hypot(m.seat.x-st.x,m.seat.z-st.z)<0.1);
    const L=E.zone.seats.filter(st=>st&&(st.room||st.table)===room&&(st.lv|0)===(ps.lv|0)&&!busy(st)); if(!L.length) return false;
    const side=L.filter(st=>Math.abs(st.x-ps.x)<0.1); const pick=(side.length?side:L).sort((u,v)=>Math.hypot(u.x-ps.x,u.z-ps.z)-Math.hypot(v.x-ps.x,v.z-ps.z))[0];
    if(n.seat&&Math.hypot(n.seat.x-pick.x,n.seat.z-pick.z)<0.1) return true; if(n.seat&&GM.standUp) GM.standUp(n); GM.sitAt(n,pick); n.pose=n.idlePose='read'; return true; };

  /* 15:30 以後才到（沒在門口碰到她）：她已經在討論室 A 裡面，旁白一句（接線時補的第 9 點，232fe4149）；一次 */
  S.lateDue=function(GM,a){ const G=GM&&GM.G; if(!G||!a||a.id!=='lawlib_intro_y1s1'||G.zone!=='lawlib') return false; const F=F_(G); return F.AA613_XC_LIB===G.day&&F.AA613_XC_MET!==G.day&&F.AA613_XC_LATE!==G.day&&hr(G)>=15.5; };

  /* ---------------- 開學典禮的那一句旁白（story3d.js S.ceremonyY1 叫）---------------- */
  S.ceremonyWalk=async function(GM){ const G=GM&&GM.G; if(!G||!knows(BH,G)) return false; await GM.say(null,S.L.ceremony); return true; };

  /* ---------------- 2-4 第一次到球場：阿哲那一句（clubfair3d.js 學長兩句之後）---------------- */
  S.doorAfter=async function(GM,a){ const G=GM&&GM.G; if(!G||!a||a.id!=='dept_basketball'||F_(G).AA613_BALL_GO==null) return false;
    const e=typeof STORY!=='undefined'&&STORY.schedEnt&&typeof CHARACTERS!=='undefined'?STORY.schedEnt(CHARACTERS[ZHE],G):null; if(!e||e.zone!==G.zone) return false;   /* 阿哲在場（作息在同一區：晴天球場、下雨體育館走廊）*/
    await GM.say(whoOf(GM,ZHE),S.L.told); return true; };

  /* ---------------- 1-2 合唱團的攤位前面（作息的 talkEvent；演一次）---------------- */
  /* 填過的社團名字：照社博攤位的順序、括號拿掉（系籃（系學會）＝系籃）*/
  S.filledText=function(G){ const C=fair(), F=F_(G); const names=(C?C.booths():[]).filter(b=>b.club&&F['CLUB_'+b.club]).map(b=>S.clubName(act(b.club))||b.sign).filter(Boolean);
    return names.length?names.join('、')+'。':S.L.choir.none; };
  S.EVENTS=[ {id:'ev_aa613_choir',title:'社團博覽會',participants:[PS,XC],location:'campus',trigger:'talk',once:true,time:[11,12],
    prereq:{custom:G=>S.choirOn(G)&&knows(PS,G)&&knows(XC,G)},
    dialogue:[ {call:G=>{ F_(G).AA613_FILLED_T=S.filledText(G); }},{speaker:PS,text:S.L.choir.ask},{speaker:'player',text:'{flag:AA613_FILLED_T|'+S.L.choir.none+'}'},{speaker:PS,text:S.L.choir.dance},
      {call:G=>{ delete F_(G).AA613_FILLED_T; }} ]} ];

  /* ---------------- 登記 ---------------- */
  if(typeof STORY!=='undefined'){
    if(Array.isArray(STORY.PHONE_RULES)&&!STORY._aa613Phone){ STORY.PHONE_RULES.push(G=>S.phone(G)); STORY._aa613Phone=true; }
    if(Array.isArray(STORY.SCHED_X)&&!STORY.SCHED_X.includes(S.sched)) STORY.SCHED_X.push(S.sched);
    if(Array.isArray(STORY.TICKS)&&!STORY._aa613Tick){ STORY.TICKS.push(GM=>{ try{ return S.tick(GM)||tickDoor(GM); }catch(e){ console.warn('AA613.tick',e); return false; } }); STORY._aa613Tick=true; } }
  /* 1-2 沛珊「我！我十一點才能到。」：AA_372 第 8 項的隔週回台中（單數週的週末，第 1 週＝9/6～9/7）那一天，11:00～12:00 她在社博（稿 11-03 比 AA_372 新；已問 AA）——
     只有群組那兩則傳了的局、只有那一個小時算在臺北（STORY.presence 包一層；其他時間照 absentDates）*/
  S.psFairHere=G=>!!G&&law(G)&&S.choirOn(G);
  if(typeof STORY!=='undefined'&&STORY.presence&&!STORY.presence._aa613){ const p0=STORY.presence; STORY.presence=Object.assign(function(id,G){ if(id===PS&&S.psFairHere(G)) return {here:true}; return p0.apply(this,arguments); },p0,{_aa613:true}); }
  if(typeof STORY_EVENTS!=='undefined') for(const e of S.EVENTS) if(!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e);
  if(typeof CLUBFAIR!=='undefined'&&Array.isArray(CLUBFAIR.DOOR_AFTER)&&!CLUBFAIR.DOOR_AFTER.includes(S.doorAfter)) CLUBFAIR.DOOR_AFTER.push(S.doorAfter);
  if(typeof CLS!=='undefined'&&CLS.attendActivity&&!CLS.attendActivity._aa613){ const a0=CLS.attendActivity; CLS.attendActivity=Object.assign(async function(GM,a,o){ try{ if(S.lateDue(GM,a)){ F_(GM.G).AA613_XC_LATE=GM.G.day; GM.sceneBegin(); try{ await GM.say(null,S.L.xcLib.late); } finally { GM.sceneEnd(); } } S.sitBeside(GM,a); }catch(e){ console.warn('AA613.sitBeside',e); } return a0.apply(this,arguments); },a0,{_aa613:true}); }
  return S;
})();
if(typeof window!=='undefined') window.AA613=AA613;
