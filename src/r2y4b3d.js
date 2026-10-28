/* ===== 事件包第 2 輪之三（後半）：大四下、畢業後篇、尾聲（AA_327 2-Y4-31～61；AA-C 定稿 e284d601）——手機、時間、場景表、尾聲的掛勾 =====
   演出的事件（STORY_EVENTS）在 src/data/r2y4b_events.js；這裡是什麼時候、誰、怎麼排。台詞照 AA_327 不改字；AA 稿沒寫的字不補（UI 的選單標籤除外，照現有的寫法）。
   掛勾：STORY.PHONE_RULES（大四下的手機）、STORY.TICKS（大四下要開演的場面）、ACTIVITIES.list（國考讀書會 act_bar_study）、CLS.IN_CLASS（法律專題研究第 15 週的日誌）、
     PG.MSGS／PG.STEPS／PG.stops（畢業後篇：照 PG 的時間表、跳到下一件事會停）、PG.EPI_AFTER_CG／EPI_AFTER_ITEMS（尾聲：空著的座位、何俊朗）、
     PG.epiPartner／epiCg／epiLine／epiPresent（2-Y4-54 不選的玩家：尾聲照朋友版）、NOODLE_CLOSED.door（2029-04-19～25 阿姨出國）。
   2-Y4-54「選一個人」以後其他人的談話＝AA_346（AA-C 2026-10-21）：一位一場的出遊（OUT.plan；事件 ev_choice_apart_<id> 在 src/data/r2y4b_events.js）＋第三次沒到的電話版（PG.STEPS），見 2-Y4-54 那一段。
   沒做的（見各段註解）：2-Y4-47 後半「延後的回答」（PROPOSAL 等使用者）、
     （2-Y4-52 calendar.js 的 Y5S1、LUNAR 2030：AA_357 已做，見 calendar.js 的 TERMS_DELAYED 與 src/y5s1_3d.js；畢業後篇本來就是摘要日，照 PG 的場景表排）。
   已在 AA_319／AA_331 那一批（src/postgrad3d.js）、這裡不重做：45 七月最後衝刺、49 以安的兩通電話、42 學姊生日（友情／戀人／前任；友情版的「送禮物」四選一照 AA_345 G9 加在 postgrad3d.js S.bdayGift）、51 的 9/7 學姊與 2030 便條、53 尾聲每人一句的表、60 學姊律師錄取那句。
     53 方奕廷「那一年你在考試」照 AA_327 定稿表與 AA_331 第 1 節 b：只看台灣路線 BAR_YEAR===2030（交換路線 2031 那半句 AA 劃掉了，沒有加回去）。
   測試：node tests/r2y4b_events_unit.js、tests/aa346_apart_unit.js */
'use strict';
const R2Y4B=(function(){
  const S={};
  /* ---------- 共用 ---------- */
  S.DK=k=>{ if(typeof PG!=='undefined'&&PG.DK) return PG.DK(k); return typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null; };
  const DK=S.DK, T=(d,h)=>d*24+h, now=G=>G.day*24+(+G.hour||0);
  const at=(G,k,h)=>{ const d=DK(k); return d!=null&&now(G)>=T(d,h); };
  const hh=G=>((G.hour%24)+24)%24;
  const atH=(G,d,h)=>G.day===d?Math.max(h,G.hour):h;   /* 當天就是現在（不早於 h）；隔天才補的照原本的時間 */
  const law=G=>!!G&&(G.stage||'law')==='law';
  const knows=(id,G)=>typeof STORY!=='undefined'&&!!STORY.knows&&STORY.knows(id,G);
  const has=(id,tag)=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(id,tag); S.has=has;
  const stageAt=(id,lv)=>typeof SOCIAL!=='undefined'&&!!SOCIAL.STAGES&&SOCIAL.STAGES.indexOf(SOCIAL.stage(id))>=SOCIAL.STAGES.indexOf(lv);
  const LOVE=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan','kexin'];
  const dating=(G,id)=>{ const F=(G&&G.flags)||{}, R=F.romance||{}; return F['dating_'+id]===true||!!(R[id]&&R[id].status==='dating'); }; S.dating=dating;
  const partners=G=>LOVE.filter(id=>dating(G,id));
  const isEx=(G,id)=>!dating(G,id)&&!!(G.flags&&G.flags['EX_'+id]);
  const met=(G,id,lv)=>knows(id,G)&&(dating(G,id)||stageAt(id,lv));   /* 認識、到那一階（交往中一定算）*/
  S.friendUp=(G,id)=>met(G,id,'FRIEND');
  const contact=(G,id)=>typeof INV!=='undefined'&&!!INV.hasContact&&INV.hasContact(G,id);
  const grp=G=>typeof PHONE!=='undefined'&&PHONE.inGroup(G,'noodle_team');
  const NG='g:noodle_team';
  const P_=(id,t,o)=>Object.assign({th:'p:'+id,from:id,text:t},o||{});
  const GR=(id,t,o)=>Object.assign({th:NG,from:id,text:t},o||{});
  const plan=(G,o)=>typeof OUT!=='undefined'&&OUT.plan(G,o);
  const outGet=(G,id)=>typeof OUT!=='undefined'?OUT.get(G,id):null;
  const evDone=(G,id)=>!!(G.events&&G.events.done&&G.events.done[id]);
  const route=G=>typeof STORY!=='undefined'&&STORY.route?STORY.route(G):null;
  const exchD=G=>!!(typeof STORY!=='undefined'&&STORY.routeAbroadRoute&&STORY.routeAbroadRoute(G));   /* 交換延畢（日本、美國路線）*/
  const fdOnly=G=>!!(G&&G.flags&&G.flags.FAIL_DELAY)&&!exchD(G);   /* 大四下被當的延畢（D14-T5B，AA_421；src/faildelay3d.js）*/
  const delayed=G=>exchD(G)||fdOnly(G); S.delayed=delayed;
  const internOn=G=>exchD(G)||(fdOnly(G)&&typeof FD!=='undefined'&&FD.lp(G));   /* 週二實習：交換那一版（被當的是法律實習也照這一版，AA_421 1-3 例外）*/
  const nm=id=>typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(id):id;
  const who=id=>({name:nm(id),charId:id});
  const adv=()=>typeof ADV!=='undefined'?ADV:null;
  const bg=id=>typeof OUT!=='undefined'&&OUT.bg?OUT.bg(id):'dark';
  const graduated=G=>typeof PG!=='undefined'&&PG.done&&PG.done(G,'grad');
  S.isDay=(G,k)=>{ const d=DK(k); return d!=null&&G.day===d; };
  /* 好幾天的出遊（春假宜蘭、大峽谷）：跳到那一天的那個時間，日期、星期、天氣一起換（PG.setT；只往後）。給 r2y4b_events.js 的 advance 用（回傳 0，GM.advance(0) 會照新的時間更新光線）*/
  S.jumpTo=(G,k,h)=>{ const d=DK(k); if(d==null||T(d,h)<=now(G)) return false; if(typeof PG!=='undefined'&&PG.setT) PG.setT(G,null,d,h); else { G.day=d; G.hour=h; } return true; };
  S.isSat=G=>typeof CALENDAR!=='undefined'&&CALENDAR.dateOf(G.day).wd%7===6;
  const LIB_ZONES=['library','library_hall','lawlib'];
  /* 對話：字串＝她說、{narr}＝旁白（同 termend3d.js 的寫法）*/
  const play=async(GM,id,arr)=>{ const G=GM.G; for(const x of [].concat(arr||[])){ if(x==null) continue; if(typeof x==='string') await GM.say(who(id),String(x).replace(/\{name\}/g,G.name||'祐廷')); else if(x.narr) await GM.say(null,x.narr); } };
  const scene=async(GM,f)=>{ GM.sceneBegin(); try{ await f(); } finally { const A=adv(); if(A&&A.active&&A.end) A.end(); GM.sceneEnd(); } };
  /* 高鐵票錢（AA_276 第 7 節的算法：標準車廂來回；台南照同一個算法，AA 沒有給數字）*/
  S.FARE={taichung:1400,tainan:2700};
  S.payFare=(GM,k)=>{ if(GM&&GM.money&&S.FARE[k]) GM.money(-S.FARE[k],'交通'); };
  /* 總圖天數（研究所筆試的門檻，AA_181 2-4、裁定 #2、#38）：G.habits 的總圖、法圖（每個鍵只留最近 60 天）＋這裡自己記的那幾段日子 */
  S.libDays=function(G,a,b){ const d0=DK(a), d1=DK(b); if(d0==null||d1==null) return 0; const set=new Set(), H=G.habits||{};
    for(const k in H){ if(!/^place:(library|library_hall|lawlib):/.test(k)) continue; for(const d of ((H[k]&&H[k].days)||[])) if(d>=d0&&d<=d1) set.add(d); }
    for(const d of ((G.flags&&G.flags.R2Y4B_LIB)||[])) if(d>=d0&&d<=d1) set.add(d); return set.size; };
  S.trackLib=function(G){ if(!LIB_ZONES.includes(G.zone)) return; const a=DK('2028-09-04'), b=DK('2030-02-15'); if(a==null||G.day<a||G.day>b) return; const L=Array.isArray(G.flags.R2Y4B_LIB)?G.flags.R2Y4B_LIB:(G.flags.R2Y4B_LIB=[]); if(L[L.length-1]!==G.day) L.push(G.day); };

  /* ===================== 2-Y4-31 杜鵑花第四張（2029-03-08）===================== */
  const AZ='2029-03-08';
  S.onAvenue=GM=>{ const P=GM&&GM.E&&GM.E.player&&GM.E.player.obj&&GM.E.player.obj.position; return !!P&&Math.abs(P.z)<=14&&P.x>=-110&&P.x<=72; };   /* 椰林大道（zones3d.js：z=0，校門 x=-124 到總圖前 x≈72；兩側杜鵑在 z=±10.8）*/
  S.azaleaDue=function(G,GM){ const d=DK(AZ); if(d==null||G.day!==d||!law(G)||G.zone!=='campus'||G.flags.AZALEA_Y4!=null) return false; const h=hh(G); if(h<12+25/60||h>=12+55/60) return false;
    const ok=knows('heroine_01',G)&&S.onAvenue(GM); if(ok) G.flags.AZALEA_VER=S.azaleaVer(G); return ok; };   /* 版本在開演前先定：EVENTS.run 一開始的 SOCIAL.meet 會把還不熟的熟悉度補到 5（＝有點熟）*/
  S.azaleaVer=G=>dating(G,'heroine_01')?'two':((G.flags.EX_heroine_01||!stageAt('heroine_01','ACQUAINTANCE'))?'yu':'shot');   /* 不熟、分開過＝她請 Alison 拍 */
  S.azaleaNow=G=>G.flags.AZALEA_VER||S.azaleaVer(G);
  S.azaleaPhoto=G=>{ const d=DK(AZ); if(d!=null&&grp(G)) PHONE.at(G,d,12+40/60,[GR('heroine_01','📷（同一叢杜鵑，同一個位置。以安一個人。第四張。）')],'y4_azalea_photo'); };   /* 12:40 群組一張照片（她請 Alison 拍的）：照片的說明照 AA_345 G5 */
  const azaleaPhone=G=>{ const d=DK(AZ), F=G.flags; if(d==null||G.day<d||G.day>d+7) return;
    if(G.day===d&&at(G,AZ,12+10/60)&&hh(G)<12+55/60&&knows('heroine_01',G)&&stageAt('heroine_01','ACQUAINTANCE')&&!F.EX_heroine_01&&contact(G,'heroine_01')) PHONE.at(G,d,12+10/60,[P_('heroine_01','杜鵑開了'),P_('heroine_01','十二點半 老位置')],'y4_azalea_dm');
    if(at(G,AZ,12+55/60)&&F.AZALEA_Y4==null&&knows('heroine_01',G)){ F.AZALEA_Y4='missed'; S.azaleaPhoto(G); } };

  /* ===================== 2-Y4-32 明軒 M4「存夠了」（3/8 19:00 麵店）===================== */
  S.mxSavedDue=G=>{ const d=DK('2029-03-08'); return d!=null&&G.day===d&&law(G)&&hh(G)>=18.75&&hh(G)<20.5&&knows('classmate_mingxuan',G)&&G.flags.MX_SAVED==null; };
  const mxPhone=G=>{ const d=DK('2029-03-08'), F=G.flags; if(d==null||G.day<d||G.day>d+3||F.MX_SAVED!=null||!at(G,'2029-03-08',21)||!knows('classmate_mingxuan',G)) return;
    if(grp(G)){ PHONE.at(G,d,21,[GR('classmate_mingxuan','我存夠了！德國！九月走！')],'y4_mx_saved'); F.MX_SAVED='heard'; } };

  /* ===================== 2-Y4-33 國考讀書會（大四下第 2 週 3/1 起每週四 20:00～22:00、暑假到 7/5；7/12 最後衝刺是 AA_319 的 b1）===================== */
  S.barStudyOn=G=>{ const F=(G&&G.flags)||{}; return law(G)&&(F.Y4_PATH==='bar'||F.BAR_REG===true)&&!delayed(G); };   /* 5/10 才報名的：從那一週起 */
  S.barDates=function(){ const out=[]; const a=DK('2029-03-01'), b=DK('2029-07-05'); if(a==null||b==null||typeof CALENDAR==='undefined') return out;
    for(let d=a;d<=b;d+=7){ if(CALENDAR.holiday&&CALENDAR.holiday(d)) continue; const t=CALENDAR.termOf(d); if(t&&t.id==='Y4S2'&&(t.week<2||t.exam==='final')) continue; out.push(CALENDAR.dateOf(d).key); } return out; };   /* 國定假日不開；期末考週不開（AA_327 寫的「第 16 週」；AA_342 C4 以後大四下 15 週，期末考在第 15 週 5/28～6/1，6/4 起是畢業後篇＝暑假照開）*/
  S.ACT={id:'act_bar_study',title:'國考讀書會',clubName:'國考讀書會',kind:'club',zone:'library_b1',roomName:'總圖 B1 討論室 2',spot:{x:2.0,z:2.7,lv:0,label:'國考讀書會（討論室 2）'},verb:'參加',dates:S.barDates(),t0:20,t1:22,
    skip:G=>!S.barStudyOn(G),desc:'每週四 20:00～22:00，總圖 B1 討論室 2。',story:true};   /* AA_399 第 2 節：集合點在 B1 討論室 2（LAWWW2-B 的 library_b1；原本一樓大廳 (-3.0,2.8)＋2D）。阿哲、柏翰、Alison 坐在裡面、參加時的底圖換成模糊的 3D：src/b1story3d.js */
  S.BAR_SPK=['zhe','yu','classmate_bohan','zhe','yu'];   /* 每週一句的說話的人（r2y4b_events.js 的 ev_bar_study_week 照這個順序）*/
  S.barLine=G=>{ const n=Math.max(0,((G.flags&&G.flags.BAR_STUDY_N)|0)-1); for(let k=0;k<5;k++){ const i=(n+k)%5; if(knows(S.BAR_SPK[i],G)) return i; } return -1; };   /* 輪流；不認識的人的那一句跳過 */
  S.barStop=function(G){ if(!S.barStudyOn(G)||typeof ACTIVITIES==='undefined') return null; const n=now(G), d0=DK('2029-06-03');
    for(const k of S.ACT.dates){ const d=DK(k); if(d==null||d<d0) continue; const t=T(d,19.5); if(t<=n) continue; if(ACTIVITIES.attendedAny(G,'act_bar_study',d)) continue; return t; } return null; };   /* 畢業後篇（跳到下一件事）：暑假的週四 19:30 停一下 */

  /* ===================== 2-Y4-34 研究所放榜（3/22）===================== */
  const R34='2029-03-22';
  S.gradPass2029=G=>S.libDays(G,'2028-09-04','2029-02-02')>=24;   /* 2-Y4-27 第 4 節：大四上＋寒假到考前一天 */
  S.anFarewell=G=>G.flags.AN_FAREWELL==='went'||evDone(G,'ev_an_farewell_dinner');   /* AA_322 1B-12 餞行 */
  /* 祐廷的結果：3/22 15:00 起算一次（2-Y4-27 第 4 節的總圖天數）；跳過 15:00 直接到晚上的也先算好，麵店那一段才讀得到 */
  S.gradResult=G=>{ const F=G.flags; if(F.GRAD_EXAM_2029===true&&F.GRAD_EXAM_RESULT==null&&at(G,R34,15)){ const ok=S.gradPass2029(G); F.GRAD_EXAM_RESULT=ok?'pass':'fail'; if(ok&&F.GRAD_ADMIT==null) F.GRAD_ADMIT='exam'; } return F.GRAD_EXAM_RESULT; };
  S.anPassDue=G=>{ const d=DK(R34); const ok=d!=null&&G.day===d&&hh(G)>=18.75&&hh(G)<=19.25&&!G.flags.AN_GRAD_PASS_SEEN&&met(G,'heroine_01','FRIEND'); if(ok) S.gradResult(G); return ok; };
  S.gradResultDue=G=>{ const d=DK(R34), F=G.flags; return d!=null&&F.GRAD_EXAM_RESULT==='fail'&&F.GRAD_RETRY==null&&F.GRAD_QUIT==null&&at(G,R34,21)&&G.day<=d+6&&!F.GRAD_EXAM_2030; };
  const R34_SYS={pass:'研究所放榜：法律學研究所，錄取。',fail:'研究所放榜：法律學研究所，未錄取。'};
  const gradPhone=G=>{ const d=DK(R34), F=G.flags; if(d==null||G.day<d||G.day>d+7) return;
    if(F.GRAD_EXAM_2029===true&&at(G,R34,15)&&!PHONE.sent(G,'y4_grad_result')){ S.gradResult(G);
      PHONE.at(G,d,15,[{th:'sys',text:R34_SYS[F.GRAD_EXAM_RESULT]||R34_SYS.fail}],'y4_grad_result'); }
    if(at(G,R34,22)&&!F.AN_GRAD_PASS_SEEN&&!F.Y4_AN_PASS_TOLD&&knows('heroine_01',G)){ F.Y4_AN_PASS_TOLD=true;   /* 沒去麵店的玩家 */
      if(grp(G)) PHONE.at(G,d,22,[GR('heroine_01','商法組放榜。上了。')],'y4_an_pass_grp');
      if(met(G,'heroine_01','FRIEND')&&contact(G,'heroine_01')) PHONE.at(G,d,22+1/60,[P_('heroine_01','八月還有司法官。一樣，先考上。')],'y4_an_pass_dm'); } };
  /* 和以安交往中：17:50 她打來（演出來的電話）*/
  S.anCallDue=G=>{ const d=DK(R34); return d!=null&&G.day===d&&hh(G)>=17+50/60&&hh(G)<18.75&&dating(G,'heroine_01')&&!G.flags.Y4_AN_CALL; };
  S.anCall=async function(GM){ const G=GM.G; G.flags.Y4_AN_CALL=G.day; if(GM.toast) GM.toast('手機響了。',2400); const me={name:nm('heroine_01')+'（電話）',charId:'heroine_01'};
    await scene(GM,async()=>{ await GM.say(me,'……上了。'); await GM.say(me,'晚上麵店，我自己跟大家說。'); }); return true; };

  /* ===================== 2-Y4-35 春假（最後一次）＋可昕三選一（照 1C-01 的流程）===================== */
  const SP={inv:'2029-03-25',dl:'2029-04-01',eve:'2029-04-02',d0:'2029-04-03',d1:'2029-04-04'};
  const SPD=()=>({inv:DK(SP.inv),dl:DK(SP.dl),eve:DK(SP.eve),d0:DK(SP.d0),d1:DK(SP.d1)});
  const msgIn=(G,tag)=>(G.msgs||[]).some(m=>m.tag===tag);
  S.kxTrips=G=>(G.flags.KX_TRIP&&typeof G.flags.KX_TRIP==='object')?G.flags.KX_TRIP:{};
  S.kxSeen=G=>{ const T0=S.kxTrips(G); return Object.keys(T0).filter(k=>k!=='Y4S2').map(k=>T0[k]); };
  S.kxAllSeen=G=>['sea','oldtown','stars'].every(d=>S.kxSeen(G).includes(d));
  S.kxStarsBefore=G=>S.kxSeen(G).includes('stars')||G.flags.KX_TRIP_Y1S2==='stars';
  S.kxWaiao=G=>{ if(typeof DATE==='undefined'||!DATE.log) return false; const L=DATE.log(G,'kexin'); return !!(L&&L.byLoc&&(L.byLoc.D25|0)>0); };   /* 已經和她去過外澳（D25）*/
  S.springPending=function(G){ const F=G.flags, D=SPD(); if(F.SPRING_Y4!=null||D.inv==null||G.day<D.inv||G.day>D.dl) return false;
    const g=grp(G), kx=dating(G,'kexin'); if(!g&&!kx) return false; if(g&&!msgIn(G,'y4_spring_grp')) return false; if(kx&&!msgIn(G,'y4_spring_kx')) return false;
    return F.spring4AskAt==null||now(G)>=F.spring4AskAt; };
  S.springPrompt=async function(GM){ const G=GM.G, F=G.flags, O=[];
    if(grp(G)) O.push({t:'春假：跟麵店團出去',hint:'4/3～4/4，兩天一夜（你開車）',k:'noodle'});
    if(dating(G,'kexin')) O.push({t:'春假：和可昕開車旅行',hint:'4/3，一天來回',k:'kexin'});
    O.push({t:'春假：留在宿舍',k:'dorm'},{t:'晚一點再決定',hint:'明天再問',k:'later'});
    let i=O.length-1; GM.sceneBegin(); try{ i=await GM.choose(O.map(o=>({t:o.t,hint:o.hint}))); } finally { GM.sceneEnd(); }
    const k=(O[i]||O[O.length-1]).k; if(k==='later'){ F.spring4AskAt=T(G.day+1,G.hour); return k; } S.springChoose(GM,k); return k; };
  S.springChoose=function(GM,k,o){ o=o||{}; const G=GM.G||GM, F=G.flags, D=SPD(), kx=dating(G,'kexin'), g=grp(G); F.SPRING_Y4=k;
    if(k==='noodle') plan(G,{id:'y4_spring',ev:'ev_spring_y4',day:D.d0,h:8,late:0.5,place:'台大校門口',title:'春假：開車載麵店團去宜蘭',travel:'走到校門口約 10 分鐘',travelH:1/6,back:'回到臺北。'});
    if(k==='kexin') plan(G,{id:'y4_spring_kx',ev:'ev_kexin_trip_spring_y4',day:D.d0,h:7+40/60,place:'政大校門口（先回家取車）',title:'春假：開車旅行',travel:'回家取車約 30 分鐘，再開到政大接她',travelH:40/60,back:'送她回政大，再把車開回家。'});
    if(kx&&(k==='noodle'||k==='dorm'||k==='none')){ if(!o.silent) PHONE.at(G,G.day,G.hour+0.1,[P_('kexin','好。那畢業旅行再說。')],'y4_spring_kx_reply'); PHONE.at(G,D.d0,21.5,[P_('kexin','📷（讀書會的長桌。予樂比 YA，可昕低頭在寫講義，沒有看鏡頭。）')],'y4_spring_kx_photo'); }   /* BB_99 9-15；照片的說明照 AA_345 G5 */
    S.springPick(G,k,o);
    if(k!=='noodle'&&g) S.springPhoto(G); };
  /* 選完：祐廷在群組回以安一句、以安回（AA_465 第 3 節；句子和大一、大二都不一樣；沒選＝4/3 的月台照片已經說明了，不補）；
     選可昕：私訊回她（AA_461 第 6 節④：她問的是 y4_spring_kx「最後一個春假。……」；群組那一句一起傳）。同 group3d.js 的 S.springPick */
  S.SPRING_PICK={noodle:[['player','我開車。兩天一夜。'],['heroine_01','好。車上的位子我排。']],kexin:[['player','最後一個春假，我有約了。'],['heroine_01','好。照片會傳。']],dorm:[['player','這次我留在台北。'],['heroine_01','好。照片會傳。']]};
  S.SPRING_PICK_KX=[['player','好。我開車。'],['kexin','嗯。到時候見。']];
  S.springPick=function(G,k,o){ if(typeof PHONE==='undefined'||o.silent) return; const msg=(th,[from,text])=>from==='player'?{th,from,who:null,text}:{th,from,text};
    if(k==='kexin'&&PHONE.sent(G,'y4_spring_kx')) PHONE.at(G,G.day,G.hour+0.05,S.SPRING_PICK_KX.map(x=>msg('p:kexin',x)),'y4_spring_kx_pick');
    const L=S.SPRING_PICK[k]; if(L&&grp(G)&&PHONE.sent(G,'y4_spring_grp')) PHONE.at(G,G.day,G.hour+0.05,L.map(x=>msg(NG,x)),'y4_spring_pick'); };
  S.springPhoto=G=>{ const D=SPD(); if(D.d0!=null&&grp(G)) PHONE.at(G,D.d0,21.5,[GR('heroine_01','📷（火車站的月台。他們改搭火車。）')],'y4_spring_photo'); };   /* 祐廷沒去：他們改搭火車 */
  const springPhone=function(G,GM){ const F=G.flags, D=SPD(); if(D.inv==null||G.day<D.inv||G.day>D.d1+1) return;
    if(grp(G)&&G.day<=D.dl&&at(G,SP.inv,20.5)) PHONE.at(G,D.inv,atH(G,D.inv,20.5),[GR('heroine_01','春假要不要出去 兩天一夜'),GR('heroine_01','行程我排好了 4/1 前跟我說')],'y4_spring_grp');
    if(dating(G,'kexin')&&G.day<=D.dl&&at(G,SP.inv,21)) PHONE.at(G,D.inv,atH(G,D.inv,21),[P_('kexin',S.kxWaiao(G)?'最後一個春假。……一樣不排行程表。':'最後一個春假。……這次不排行程表。')],'y4_spring_kx');
    if(G.day>D.dl&&F.SPRING_Y4==null&&(PHONE.sent(G,'y4_spring_grp')||PHONE.sent(G,'y4_spring_kx'))) S.springChoose(GM||G,'none',{silent:true});
    if(dating(G,'heroine_03')&&PHONE.sent(G,'y4_spring_grp')&&at(G,SP.d0,18)&&G.day<=D.d1) PHONE.at(G,D.d0,18,[P_('heroine_03','看到群組了。……店裡今天很空。')],'y4_spring_yt'); };   /* 和語彤交往中：她春假照樣顧店（AA_71 2-10）*/
  S.springCarDue=G=>{ const D=SPD(); return G.flags.SPRING_Y4==='noodle'&&G.day===D.eve&&hh(G)>=20&&!G.flags.Y4_SPRING_CAR; };
  S.springCar=async function(GM){ GM.G.flags.Y4_SPRING_CAR=true; await scene(GM,async()=>{ await GM.say(null,'（你回家把車開出來。）'); }); return true; };   /* 4/2 晚上 */

  /* ===================== 2-Y4-36 沛珊 P6 公開課（4/12 21:00 私訊、4/14 14:00 台南）===================== */
  S.psReconnected=G=>{ const F=G.flags||{}; return !!F.PS_RECONNECT||F.PS_BACK_FIRST!=null||typeof F.PS_BACK_READ==='number'; };   /* 放榜以後重新聯絡上（AA_282 第 2 節；玩家先傳過訊息）*/
  S.psOpenOk=G=>dating(G,'classmate_peishan')||(!isEx(G,'classmate_peishan')&&S.psReconnected(G)&&met(G,'classmate_peishan','FAMILIAR'));
  const psOpenPhone=G=>{ const d12=DK('2029-04-12'), d14=DK('2029-04-14'), F=G.flags; if(d12==null||G.day<d12||G.day>d14+1) return; const Pp=t=>P_('classmate_peishan',t);
    if(G.day<=d14&&at(G,'2029-04-12',21)&&(G.day<d14||hh(G)<12)&&S.psOpenOk(G)){
      const L=[Pp('週六下午我上公開課，書店那天請假了。家長會來。……你也可以來，坐最後面。'),Pp('在台南喔。很遠，不來也沒關係。')];
      L[1].ask={id:'y4_ps_open',until:T(d14,12),opts:[{t:'我去。',set:{PS_OPEN_GO:true}},{t:'那天不行。',set:{PS_OPEN_GO:false},say:[{from:'classmate_peishan',text:'好～那我拍照給你看。'}]}]};
      PHONE.at(G,d12,atH(G,d12,21),L,'y4_ps_open'); }
    if(F.PS_OPEN_GO===true&&!outGet(G,'y4_ps_open')&&(G.day<d14||hh(G)<14.5)) plan(G,{id:'y4_ps_open',ev:'ev_peishan_open_class',day:d14,h:14,late:1,place:'台南・課輔班',title:'沛珊的公開課（台南）',travel:'高鐵（去台南）約兩小時',travelH:2,back:'回到臺北。'});
    if(PHONE.sent(G,'y4_ps_open')&&F.PS_OPEN_CLASS!=='went'&&at(G,'2029-04-14',21)&&!PHONE.sent(G,'y4_ps_open_missed')){ const q=outGet(G,'y4_ps_open'); if(q&&q.state==='planned') return;
      F.PS_OPEN_CLASS='missed'; PHONE.at(G,d14,21,[Pp('媽媽來了。她坐最後一排。……就是我叫你坐的那個位子。')],'y4_ps_open_missed'); } };   /* 沒去：當晚（沒有 CG）*/
  S.psOpenMissed=G=>{};   /* 當晚 21:00 那一則照上面的規則 */

  /* ===================== 2-Y4-37 語彤 16b 阿姨的照片（4/19 18:00）＋麵店公休 4/19～4/25 ===================== */
  const knowsOther=(G,id)=>typeof ROM!=='undefined'&&LOVE.filter(x=>x!==id&&dating(G,x)).some(p=>p==='kexin'?(ROM.knowsGF&&ROM.knowsGF(G,id)):(ROM.knowsOf&&ROM.knowsOf(G,id,p)));
  const ytAuntPhone=G=>{ const d=DK('2029-04-19'); if(d==null||G.day<d||G.day>d+6||!at(G,'2029-04-19',18)||!met(G,'heroine_03','FAMILIAR')||PHONE.sent(G,'y4_yt_aunt')) return;
    const ask={id:'y4_yt_aunt',until:T(d+6,24),opts:[{t:'阿姨好開心。',set:{YT_AUNT_PHOTO:'happy'},say:[{from:'heroine_03',text:'她說這是她第一次出國。店休一個禮拜，她說回來要煮多一點補回來。'}]},
      {t:'（回一張麵的照片）',post:'📷（別家的乾麵，旁邊一顆滷蛋）',set:{YT_AUNT_PHOTO:'noodle'},say:[{from:'heroine_03',text:'你在吃別家的麵？我要跟阿姨講。'}]},
      {t:'妳呢？',set:{YT_AUNT_PHOTO:'you'},say:[{from:'heroine_03',text:'我在總圖。期中考，店剛好也沒開。'}]}]};
    const PH='（照片：阿姨在日本一座寺廟前比 YA，背後是跟團的旗子）';
    if(knowsOther(G,'heroine_03')){ if(grp(G)) PHONE.at(G,d,18,[GR('heroine_03',PH),GR('heroine_03','阿姨第一次出國'),GR('heroine_03','店休一個禮拜',{ask})],'y4_yt_aunt'); }   /* 她知道祐廷和別人交往：照片發在麵店團群組 */
    else if(contact(G,'heroine_03')) PHONE.at(G,d,18,[P_('heroine_03',PH,{ask})],'y4_yt_aunt'); };
  S.aunTrip=G=>{ const a=DK('2029-04-19'), b=DK('2029-04-25'); return law(G)&&a!=null&&G.day>=a&&G.day<=b; };
  S.AUNT_DOOR='（麵店門口貼著「老闆出國，休息七天」。）';

  /* ===================== 2-Y4-38 可昕：生日「今年不要慶祝」（4/23 21:00、4/24）===================== */
  const KB={d23:'2029-04-23',d24:'2029-04-24',d25:'2029-04-25'};
  S.kxPlanTable=G=>!!G.flags.KX_STUDY_PLAN;   /* 共用的讀書計畫表（2-Y4-13 K21 寫的，沒去也記）*/
  const kxBdaySet=S.kxBdaySet=(G,v)=>{ G.flags.KX_BDAY_Y4=v; G.flags.KX_BDAY=Object.assign({},G.flags.KX_BDAY||{},{4:v}); };
  const kxBdayPhone=G=>{ const d23=DK(KB.d23), d24=d23+1, d25=d23+2, F=G.flags; if(d23==null||G.day<d23||G.day>d25+1||!dating(G,'kexin')) return;
    if(at(G,KB.d23,21)&&G.day<=d24) PHONE.at(G,d23,atH(G,d23,21),[P_('kexin','明天我生日。今年不要慶祝，我們都在準備考試。',{ask:{id:'y4_kx_bday',until:T(d24,24),opts:[{t:'好。'}]}})],'y4_kx_bday');
    if(G.day>=d25&&F.KX_BDAY_Y4==null&&PHONE.sent(G,'y4_kx_bday')){ const q=outGet(G,'y4_kx_bday'); if(q&&q.state==='planned') return; kxBdaySet(G,'none');
      PHONE.at(G,d25,atH(G,d25,21),[P_('kexin','昨天我生日。我知道我說不要慶祝。'),P_('kexin','可是我還是等了一天。')],'y4_kx_bday_none'); } };   /* 什麼都沒做：隔天兩句（她這學期的那一句）*/
  S.kxBdayDue=G=>{ const d=DK(KB.d24); return d!=null&&G.day===d&&hh(G)>=9&&hh(G)<23&&dating(G,'kexin')&&G.flags.KX_BDAY_Y4==null&&!outGet(G,'y4_kx_bday')&&(G.flags.KX_BDAY4_ASK==null||now(G)>=G.flags.KX_BDAY4_ASK)&&PHONE.sent(G,'y4_kx_bday'); };
  S.kxBdayPrompt=async function(GM){ const G=GM.G, F=G.flags, O=[{t:'（傳一句「生日快樂。」）',k:'quiet'}]; if(S.kxPlanTable(G)) O.push({t:'（在讀書計畫表 4/24 那一格旁邊寫「生日快樂」）',k:'note'});
    O.push({t:'（開車上山，送一碗山下那家的酸辣湯餃）',hint:'不進去，送到就走',k:'visit'},{t:'晚一點再說',hint:'兩個小時後再問',k:'later'});
    let i=O.length-1; GM.sceneBegin(); try{ i=await GM.choose(O.map(o=>({t:o.t,hint:o.hint}))); } finally { GM.sceneEnd(); } const k=(O[i]||O[O.length-1]).k;
    if(k==='later'){ F.KX_BDAY4_ASK=now(G)+2; return k; }
    if(k==='quiet'){ PHONE.post(G,{th:'p:kexin',from:'player',who:null,text:'生日快樂。'}); PHONE.at(G,G.day,G.hour+0.25,[P_('kexin','收到。……謝謝你照做。')],'y4_kx_bday_quiet'); kxBdaySet(G,'quiet'); }
    if(k==='note'){ PHONE.at(G,G.day,G.hour+0.25,[P_('kexin','我說不要慶祝。'),P_('kexin','……這不算慶祝。這算註解。')],'y4_kx_bday_note'); kxBdaySet(G,'note'); }
    if(k==='visit') plan(G,{id:'y4_kx_bday',ev:'ev_kexin_bday_visit_y4',day:G.day,h:Math.max(21,Math.ceil((G.hour+1)*4)/4),late:0.5,place:'政大・宿舍樓下',title:'開車上山（送湯餃）',travel:'開車約 40 分鐘',travelH:2/3,back:'回到台大。'});
    return k; };
  S.kxBdayMissed=G=>{};   /* 沒到：隔天那兩句照上面的規則（'none'）*/

  /* ===================== 2-Y4-39 系籃最後一場＋吉他社成發（5/11 21:00 群組、5/12）===================== */
  const ballPhone=G=>{ const d11=DK('2029-05-11'), d12=d11+1; if(d11==null||G.day<d11||G.day>d12||!grp(G)||!at(G,'2029-05-11',21)) return;
    if(PHONE.at(G,d11,atH(G,d11,21),[GR('zhe','明天早上十點 最後一場'),GR('zhe','晚上 Alison 成發'),GR('zhe','兩個都給我來')],'y4_last_game')){
      plan(G,{id:'y4_last_game',ev:'ev_last_game_y4',day:d12,h:10,late:0.5,place:'新體育館',title:'系籃最後一場',travel:'走過去約 10 分鐘',travelH:1/6});
      plan(G,{id:'y4_concert',ev:'ev_concert_y4',day:d12,h:19,late:0.5,place:'吉他社成發',title:'吉他社成發',travel:'走過去約 10 分鐘',travelH:1/6}); } };
  S.ballMissed=G=>{ const d=DK('2029-05-12'); G.flags.BALL_Y4='missed'; if(d!=null&&grp(G)) PHONE.at(G,d,12.5,[GR('classmate_mingxuan','系籃最後一場打完了。這次我待到最後 😂')],'y4_ball_missed'); };
  S.concertMissed=G=>{ const d=DK('2029-05-12'); G.flags.CONCERT_Y4='missed'; if(d!=null&&grp(G)) PHONE.at(G,d,21.5,[GR('zhe','📷（舞台上，Alison 拿著麥克風，對著台下比了一個讚。）')],'y4_concert_photo'); };

  /* ===================== 2-Y4-40 可昕 K25 讀書會的最後一晚（5/16 18:00 私訊、21:00）===================== */
  S.kxInBarGroup=G=>G.flags.Y4_PATH==='bar'&&Array.isArray(G.flags.BAR_STUDY_GROUP)&&G.flags.BAR_STUDY_GROUP.includes('kexin');
  const k25Phone=G=>{ const d=DK('2029-05-16'), F=G.flags; if(d==null||G.day<d||G.day>d+1||!dating(G,'kexin')) return;
    if(G.day===d&&at(G,'2029-05-16',18)&&hh(G)<21.25) PHONE.at(G,d,atH(G,d,18),[P_('kexin','今天是讀書會的最後一晚。你要來，還是視訊？',{ask:{id:'y4_kx_k25',until:T(d,21.25),opts:[{t:'我開車送宵夜過去。',set:{KX_K25:'drive'}},{t:'視訊。',set:{KX_K25:'video'}}]}})],'y4_kx_k25');
    if(F.KX_K25==='drive'&&!outGet(G,'y4_kx_k25')) plan(G,{id:'y4_kx_k25',ev:'ev_kexin_last_study_night',day:d,h:21,late:0.5,place:'政大',title:'讀書會的最後一晚（政大）',travel:'開車約 40 分鐘',travelH:2/3,back:'回到台大。'});
    if(F.KX_K25==='video'&&!outGet(G,'y4_kx_k25')) plan(G,{id:'y4_kx_k25',ev:'ev_kexin_last_study_night',day:d,h:21,late:0.5,place:'視訊',verb:'接起來',title:'讀書會的最後一晚（視訊）',travel:'',travelH:0,back:'視訊結束。'});
    if(F.KX_K25==null&&PHONE.sent(G,'y4_kx_k25')&&now(G)>T(d,21.25)) S.k25Missed(G); };
  S.k25Missed=G=>{ const d=DK('2029-05-16'), F=G.flags; if(F.KX_K25==='missed') return; F.KX_K25='missed'; F.KX_SHELF=true;
    if(d!=null) PHONE.at(G,d,Math.max(22,G.day===d?G.hour:22),[P_('kexin','（照片：書架）'),P_('kexin','讀書會的書架，最右邊空了一格。還不知道要放什麼。')],'y4_kx_k25_missed'); };

  /* ===================== 2-Y4-41 法律專題研究：期末的日誌一句（5/28 第 15 週那堂上完；AA_252 2-4）===================== */
  S.journal=async function(GM,it){ const G=GM.G; if(!it||!it.c||it.c.id!=='legal_research'||it.exam||!law(G)||typeof CALENDAR==='undefined') return false; const t=CALENDAR.termOf(G.day);
    if(!t||t.id!=='Y4S2'||t.week!==15||G.flags.LR_JOURNAL_Y4) return false; G.flags.LR_JOURNAL_Y4=G.day;
    if(GM.memo) GM.memo(G.flags.CRIMPRO_HW==='done'?'法律專題研究的報告交了。你寫的是大三那次旁聽之後一直想的事。':'法律專題研究的報告交了。'); return true; };

  /* ===================== 2-Y4-43 期末最後一頓（6/22）、2-Y4-44 可昕 K26（7/5、7/7）===================== */
  S.lastMealMissed=G=>{ const d=DK('2029-06-22'); G.flags.LAST_MEAL_Y4='missed'; if(d!=null&&grp(G)) PHONE.at(G,d,21.5,[GR('zhe','📷（牆上貼滿了照片。阿姨說，找不到自己的，下次帶一張來。）')],'y4_last_meal_photo'); };
  S.kxShopRegular=G=>(G.flags.NCCU_FOOD_N|0)>=3;   /* 「我們的店」（政大山下那一家）去過三次以上 */
  S.k26Spot=function(G){ if(S.kxShopRegular(G)) return {shop:true,name:'政大・山下的小吃街',bg:'nccu_food'};
    let best=null; if(typeof DATE!=='undefined'&&DATE.log){ const L=DATE.log(G,'kexin'), B=(L&&L.byLoc)||{}; for(const k in B) if((B[k]|0)>0&&(best==null||(B[k]|0)>(B[best]|0))) best=k; }   /* 約會紀錄裡次數最多的那一個 */
    if(best&&typeof DATE!=='undefined'&&DATE.loc){ const loc=DATE.loc(best)||{}, key=typeof OUT!=='undefined'?Object.keys(OUT.BG).find(k=>k.startsWith(String(best).toLowerCase()+'_base')):null; return {shop:false,name:loc.name||'老地方',bg:key||'dark',loc:best}; }
    return {shop:false,name:'政大・山下的小吃街',bg:'nccu_food'}; };
  S.k26Plan=function(G){ const d=DK('2029-07-07'); if(d==null||outGet(G,'y4_kx_k26')) return false; const sp=S.k26Spot(G);
    return plan(G,{id:'y4_kx_k26',ev:'ev_kexin_after_grad',day:d,h:15,late:0.5,place:sp.name,title:'和可昕：老地方（'+sp.name+'）',travel:'開車約 40 分鐘',travelH:2/3,k26:sp}); };
  S.k26Scene=async function(GM,q){ const G=GM.G, sp=(q&&q.k26)||S.k26Spot(G), A=adv(), K=who('kexin');
    if(A&&A.begin) A.begin({background:bg(sp.bg),right:{charId:'kexin',expression:'smile'}}); if(GM.caption) GM.caption('',sp.name,2400);
    if(sp.bg==='nccu_food') G.flags.NCCU_FOOD_N=(G.flags.NCCU_FOOD_N|0)+1;   /* 在山下那一家吃過幾次（同 events3d.js）*/
    if(sp.shop) await GM.say(null,'（老闆端上兩個人的點法，只說：「畢業了喔？」）'); else await GM.say(K,'畢業了。這裡也算我們的店。');
    if(G.flags.KX_GRAD==='mine'){ await GM.say(null,'（她把手機交給隔壁桌的人：「不好意思，幫我們拍一張。」）'); await GM.say(K,'典禮那天欠的合照。'); G.flags.KX_GRAD_PHOTO='k26'; }   /* AA_356 1-3：她的典禮沒去（「你欠我一張合照」）的下文 */
    await GM.say(K,delayed(G)?'你還差一個學期。……那今天先慶祝我的。':'下個月考試。今天不讀書。……考試的事，明天再說。');   /* 交換延畢：她說的那一句換掉 */
    G.flags.KX_K26='went'; };
  S.k26Missed=G=>{ const d=DK('2029-07-07'); G.flags.KX_K26='missed'; if(d!=null) PHONE.at(G,d,Math.max(16,G.day===d?G.hour:16),[P_('kexin','三點，老地方。你沒來。'),P_('kexin','……我自己吃了兩份。')],'y4_kx_k26_missed'); };   /* AA_356 1-4：之後沒有見面的場合，不留欠債（原句「你欠我一次。」）*/

  /* ===================== 2-Y4-46 七月最後一次的心意邀約（7/13 21:00 邀約、7/14）===================== */
  S.JULY={
    heroine_01:{inv:['明天晚上有空嗎。','六點半，同一家。……手帳我帶著。'],h:18.5,place:'eatery',placeName:'公館巷子裡她知道的小店',
      last:[{narr:'（她把手帳翻到最後一頁，推到你面前。那一行字的下面，寫滿了。）'},'我寫完了。這次我不等下一次。','你回答。'],friend:'好。……八月四號，你考試加油。',friendNo:'好。……九月見。'},
    heroine_03:{inv:['明天打烊以後，你來店裡。','我煮。'],h:21,place:'noodle_closed',placeName:'麵店（打烊以後）',
      last:['你上次說要想。我等到現在。','……我還是想坐你旁邊。'],friend:'好。考完來吃麵，算我的。',friendNo:'好。下次來吃麵，算我的。'},
    heroine_05:{inv:['明天晚上，同一家。','我請。'],h:18.5,place:'eatery_lib',placeName:'法圖旁邊的簡餐',
      last:['六月那天說的，我不想再往後排了。','你說吧。我聽。'],friend:'好。考完告訴我結果。',friendNo:'好。有什麼事，再告訴我。'},
    heroine_04:{inv:['明天 宵夜','最後一次問你喔'],h:21,place:'yexiao',placeName:'公館宵夜',
      last:['我這次不跑了。','換你。'],friend:'好啦。那你考完我請宵夜，朋友那種。',friendNo:'好啦。那下次宵夜我請，朋友那種。'},
    classmate_peishan:{inv:['明天晚上有空嗎？','我在台中。……六點半，我家附近那間簡餐。你來的話，我去車站接你。'],h:18.5,place:'eatery',placeName:'台中・她家附近的簡餐',taichung:true,
      last:['這是我最後一次問。','你想好了嗎？'],friend:'好。……那我以後還可以問你別的問題嗎？'} };
  const JD='2029-07-14';
  S.julyWho=function(G){ if(typeof TERMEND==='undefined'||!TERMEND.rec) return null; const th=TERMEND.rec(G).think||{}; return Object.keys(S.JULY).find(id=>th[id]==='Y4S2'&&!G.flags['HEART_LAST_'+id])||null; };   /* 畢業那天傍晚（沛珊：6/8 台南）選「讓我想想」的那一位 */
  S.julyOk=function(G,id){ if(typeof TERMEND==='undefined'||!TERMEND.heartWhy) return false; try{ return TERMEND.heartWhy(G,id,TERMEND.windowOf?TERMEND.windowOf('Y4S2'):null)===true; }catch(e){ return false; } };   /* C1～C10、5-3（BB_203 5-5）*/
  S.julyMsg=G=>{ const id=S.julyWho(G); if(!id) return []; const J=S.JULY[id], d=DK(JD), L=J.inv.map(t=>P_(id,t));
    L[L.length-1].ask={id:'y4_july',until:T(d,J.h),opts:[{t:'好。',set:{JULY_GO:id}},{t:'那天不行。',set:{JULY_NO:id},say:[{from:id,text:'好。'}]}]}; return L; };
  const julyRules=G=>{ const F=G.flags, d=DK(JD); if(d==null||G.day<d-1||G.day>d+1) return; const id=S.julyWho(G)||F.JULY_GO||F.JULY_NO; if(!id) return; const J=S.JULY[id];
    if(F.JULY_NO&&!F['HEART_LAST_'+F.JULY_NO]){ F['HEART_LAST_'+F.JULY_NO]=true; if(typeof TERMEND!=='undefined') delete TERMEND.rec(G).think[F.JULY_NO]; }
    if(F.JULY_GO&&!outGet(G,'y4_july')&&!F.JULY_CANCEL) plan(G,{id:'y4_july',ev:'ev_heart_july',day:d,h:J.h,late:0.5,place:J.placeName,title:'最後一次的邀約：'+nm(id)+'（'+J.placeName+'）',
      travel:J.taichung?'高鐵（去台中）約一小時':'走過去約 15 分鐘',travelH:J.taichung?1:0.25,back:J.taichung?'搭最後一班高鐵回到臺北。':'回到住的地方。',july:{id}});
    if(now(G)>=T(d,0)&&!F.JULY_CHECKED){ F.JULY_CHECKED=true; if(!S.julyOk(G,id)){ F.JULY_CANCEL=true; const q=outGet(G,'y4_july'); if(q&&q.state==='planned') q.state='cancelled'; } }   /* 7/14 00:00 重新判斷：不成立就沒有這一場，不傳、不記 */
    const m=PHONE.byAsk(G,'y4_july'); if(m&&m.ans==null&&now(G)>T(d,J.h)&&!F.JULY_CANCEL&&!F['HEART_LAST_'+id]){ PHONE.post(G,P_(id,'好。')); F['HEART_LAST_'+id]=true; if(typeof TERMEND!=='undefined') delete TERMEND.rec(G).think[id]; } };   /* 沒回：她回「好。」，這一場不補 */
  S.julyScene=async function(GM,q){ const G=GM.G, F=G.flags, id=q&&q.july&&q.july.id; if(!id||typeof TERMEND==='undefined'||typeof TERMEND_LINES==='undefined') return false;
    const J=S.JULY[id], Lx=TERMEND_LINES, h=TERMEND.heart(id,'Y4S2')||{}, P=Lx.PLACE[J.place]||{}, A=adv(); if(J.taichung) S.payFare(GM,'taichung');
    if(A&&A.begin) A.begin({background:J.taichung?'dark':bg(P.bg),right:{charId:id,expression:'neutral'}}); if(GM.caption) GM.caption('',J.placeName,2400);
    if(P.open) await GM.say(null,P.open);   /* 開場旁白 */
    const pool=((Lx.POOL&&Lx.POOL.Y4S2)||{})[id]||[]; for(let i=0;i<Math.min(2,pool.length);i++){ await play(GM,id,[pool[i]]); if(i<Math.min(2,pool.length)-1&&Lx.REPLY) await GM.say({name:G.name||'祐廷'},Lx.REPLY[i%Lx.REPLY.length]); }   /* 話題池（Y4S2 還沒有）；沒有飯桌一句 */
    if(A&&A.begin) A.begin({background:h.walkBg?bg(h.walkBg):'dark',right:{charId:id,expression:'neutral'}});
    await play(GM,id,h.walk);   /* 回家路上她的第一句（照 AA_254 各人；以安＝畢業那天的版本）*/
    const k=await GM.choose(Lx.OPTS(h.buddy).concat([Lx.NOT_YET_OPT]).map(t=>({t})));
    const start=()=>{ const K=TERMEND.knownOthers?TERMEND.knownOthers(G,id):[]; const ok=typeof ROM!=='undefined'&&ROM.start?ROM.start(G,id):((F['dating_'+id]=true),true);
      if(ok&&K.length){ const O=F.OPEN_OK||(F.OPEN_OK={}), M=O[id]||(O[id]={}); for(const y of K) M[y]=true; } if(ok) (F.confessed||(F.confessed={}))[id]=G.day; return ok; };
    let res;
    const friend=async()=>{ await play(GM,id,[(F.BAR_REG!==true&&J.friendNo)?J.friendNo:J.friend]); F['HEART_FRIEND_'+id]=true; F['HEART_LAST_'+id]=true; res='friend'; };   /* 「沒報國考」＝8/4 國考沒有報名（BAR_REG 不是 true）*/
    if(typeof MREL!=='undefined'&&MREL.knowsOther&&MREL.knowsOther(G,id)){   /* AA_474 3b：她知道祐廷正在和別人交往＝先演她那一節的知情對話（說出來＝KNOW.say，沒有就 q；先不說＝她七月那幾句接 KNOW.she）；學姊算第二次 */
      if(k>=3) await play(GM,id,J.last);
      const r=await MREL.knowGate(GM,id,{said:k<3,again:true,term:'Y4S2',at:'july',start});
      if(r==='yes') res=k<3?'yes':'sheSaid'; else await friend(); }   /* 不交往＝朋友那一句、HEART_LAST（最後一次：承諾以後沒有下一次）*/
    else if(k<3){ start(); await play(GM,id,h.yes2||[]); res='yes'; }   /* 第二次、七月：她上一次已經先說過（AA_254 第 0 節第 7 點）*/
    else { await play(GM,id,J.last); const a=await GM.choose(['「好。」','「我們還是朋友。」'].map(t=>({t})));
      if(a===0){ start(); res='sheSaid'; }
      else await friend(); }
    delete TERMEND.rec(G).think[id]; F.HEART_JULY={id,res,day:G.day}; return res; };

  /* ===================== 2-Y4-47 芷若回國（8/25、9/1）。延後的回答：PROPOSAL，等使用者，不做 ===================== */
  S.zrBackHere=G=>{ const d=DK('2029-09-01'); return d!=null&&G.day>=d&&G.zone==='cafe'; };
  S.zrExDue=G=>{ const a=DK('2029-09-01'), b=DK('2029-09-07'); return a!=null&&G.day>=a&&G.day<=b&&G.zone==='cafe'&&isEx(G,'heroine_02')&&knows('heroine_02',G); };
  S.zrCupMissed=G=>{ const d=DK('2029-09-01'); G.flags.ZR_CUP_Y5='later'; if(d!=null) PHONE.at(G,d,23,[P_('heroine_02','杯子我先收著。')],'y5_zr_cup_later'); };

  /* ===================== 2-Y4-48 明軒出發（9/1 21:00 群組、9/2 07:00 機場）===================== */
  S.mxDepartMissed=G=>{};   /* 08:40 的照片照 PG.MSGS（y5_mx_photo）*/
  const mxDepartRules=G=>{ const F=G.flags, d=DK('2029-09-02'); if(F.MX_DEPART_GO===true&&!outGet(G,'y5_mx_depart')&&now(G)<T(d,7.5)) plan(G,{id:'y5_mx_depart',ev:'ev_mingxuan_depart',day:d,h:7,late:0.5,place:'桃園機場',title:'送明軒（桃園機場）',travel:'捷運約一小時',travelH:1}); };

  /* ===================== 2-Y4-50 以安：哥大（2030-03-27／28）＋紐約送機（8/10／11）===================== */
  const AN={c27:'2030-03-27',c28:'2030-03-28',s10:'2030-08-10',s11:'2030-08-11'};
  S.anColumbiaMissed=G=>{};   /* 22:00 群組照 PG.MSGS */
  S.anSendoffMissed=G=>{};    /* 11:40 照 PG.MSGS */
  const anRules=G=>{ const F=G.flags;
    if(F.AN_COL_GO===true&&!outGet(G,'y6_an_col')){ const d=DK(AN.c28); if(now(G)<T(d,19.5)) plan(G,{id:'y6_an_col',ev:'ev_an_columbia',day:d,h:19,late:0.5,place:'阿鳳麵店',title:'阿鳳麵店（以安）',travel:'捷運＋公車 約 30 分鐘',travelH:0.5}); }
    if(F.AN_NY_GO===true&&!outGet(G,'y6_an_ny')){ const d=DK(AN.s11); if(now(G)<T(d,10.5)) plan(G,{id:'y6_an_ny',ev:'ev_an_ny_sendoff',day:d,h:10,late:0.5,place:'桃園機場',title:'送以安（桃園機場）',travel:'捷運約一小時',travelH:1}); } };

  /* ===================== 2-Y4-51 一試不到 12 題：2030 重考的那一年（台灣路線）===================== */
  S.retaker=G=>typeof PG!=='undefined'&&!!PG.retaker&&PG.retaker(G);
  S.retakePlan=async function(GM){ const G=GM.G, F=G.flags; let k=0;
    await scene(GM,async()=>{ await GM.say(null,'（明年八月，再一次。）'); const O=[{t:'「去補習班的自習室。」',v:'cram'},{t:'「在家讀。」',v:'home'}]; if(met(G,'zhe','FAMILIAR')) O.push({t:'「跟阿哲一起讀。」',v:'zhe'});
      k=await GM.choose(O.map(o=>({t:o.t}))); F.RETAKE_STYLE=(O[k]||O[0]).v; });   /* 只改摘要日的句子，不改結果（AA_286 2-1）*/
    if(F.RETAKE_STYLE==='zhe'&&typeof PHONE!=='undefined') PHONE.at(G,G.day,G.hour+0.05,[P_('zhe','好 總圖 B1，週四照舊'),P_('zhe','……這次我們兩個')],'y5_retake_zhe');
    return true; };
  const narrStep=(id,key,h,text,cond)=>({id,at:G=>T(DK(key),h),until:G=>T(DK(key),h+48),cond,run:async GM=>{ await scene(GM,async()=>{ if(GM.titleCard&&typeof PG!=='undefined') await GM.titleCard(PG.dateLabel(GM.G.day,GM.G.hour),'',1600); await GM.say(null,text); }); }});

  /* ===================== 2-Y4-52 交換延畢 Y5S1：實習三件、證書、2030 研究所筆試 ===================== */
  S.y5Plan=async function(GM){ const G=GM.G; await scene(GM,async()=>{ if(fdOnly(G)&&typeof FD!=='undefined') await GM.say(null,FD.fill(G,FD.courses(G).filter(id=>id!=='legal_practice').length>=2?FD.LINES.plan2:FD.LINES.plan1)); else await GM.say(null,route(G)==='US'?'（這學期，週二去實習，週一、週三補兩門課。其他的日子——）':'（這學期，只有週二要去實習。其他的日子——）');   /* AA_357 1-1：美國路線週一、週三補修（src/y5s1_3d.js）*/
      const O=[{t:'「去總圖讀書。」',v:'study'},{t:'「接家教，存一點錢。」',v:'work'},{t:'「在家準備國考。」',v:'bar'}]; const k=await GM.choose(O.map(o=>({t:o.t}))); G.flags.Y5_DAYS=(O[k]||O[0]).v; }); return true; };
  const LAWYER={name:'律師'}, UNCLE={name:'阿伯'}, TA={name:'助教'};
  S.INTERN=[
    [{narr:'（卷宗有三公分厚。你影印了兩個小時。）'},[LAWYER,'影完了？好。現在讀第一頁。']],
    [{narr:'（一位阿伯在走廊的塑膠椅上坐了一個早上。）'},[UNCLE,'我不急。我只是想問，要等多久。'],['me','我去問。'],{narr:'（四十分鐘。他說：好，知道就好。）'}],
    [{narr:'（當事人講到一半，你想插話。）'},[LAWYER,'（小聲）先聽他說完。'],{narr:'（他講了很久。你記了兩頁，律師只圈了最後三行。）'}] ];   /* AA_181 2-10 X7 原句；律師、阿伯是不具名的路人（compact）；不出現任何法律結論 */
  S.intern=async function(GM,i){ const G=GM.G, A=adv(); await scene(GM,async()=>{ if(GM.titleCard&&typeof PG!=='undefined') await GM.titleCard(PG.dateLabel(G.day,G.hour),'法律實習',1800); if(A&&A.begin) A.begin({background:bg('legal_aid_office')});
      for(const x of S.INTERN[i]){ if(x.narr) await GM.say(null,x.narr); else await GM.say(x[0]==='me'?{name:G.name||'祐廷'}:x[0],x[1]); } });
    const L=Array.isArray(G.flags.Y5_INTERN)?G.flags.Y5_INTERN:(G.flags.Y5_INTERN=[]); if(!L.includes(i+1)) L.push(i+1); return true; };
  /* o（AA_471 第 5 節，被當延畢、重修不到三堂的 2030-06-17，src/faildelay3d.js）：{key:那一天, ta:助教那一句, tag:手機的 tag 開頭}；沒有＝2030-01-21 那一場 */
  S.cert=async function(GM,o){ o=o||{}; const G=GM.G, d=DK(o.key||'2030-01-21'), tg=o.tag||'y5'; if(typeof PHONE!=='undefined'){ PHONE.at(G,d,10,[{th:'sys',text:'畢業證書已可領取。'}],tg+'_cert_sys'); PHONE.tick(G); }
    await scene(GM,async()=>{ await GM.say(null,'（系辦的助教把證書遞給你。）'); await GM.say(TA,o.ta||(fdOnly(G)?'恭喜。……延了一學期，還是恭喜。':'你們交換回來的，今天第三個了。')); });   /* 被當延畢：AA_399 第 7 節延畢的證書那一句（「交換回來的」只給交換）*/
    G.flags.CERT_DAY=G.day; if(typeof PHONE!=='undefined') PHONE.at(G,d,12,[{th:'p:mom',from:'mom',text:'照片傳給我。我要傳給你爸。'}],tg+'_cert_mom'); return true; };
  S.gradExam=async function(GM,y){ const G=GM.G; await scene(GM,async()=>{ if(GM.titleCard&&typeof PG!=='undefined') await GM.titleCard('考場',PG.dateLabel(G.day,G.hour),2200); await GM.say(null,'（兩節。第二節最後一題，你寫到鐘響。）'); });   /* 黑幕兩節（照 2-Y4-27），不出題目 */
    G.flags['GRAD_EXAM_'+y]=true; if(y===2031){ G.flags.GRAD_EXAM_RESULT='pass'; G.flags.GRAD_ADMIT='exam'; } return true; };   /* 2031 再考：上了（AA_181 2-4）*/
  S.gradPass2030=G=>G.flags.GRAD_RETRY===true&&!delayed(G)?true:(S.libDays(G,'2029-02-19','2030-02-15')+(G.flags.Y5_DAYS==='study'?64:0))>=24;   /* 台灣路線明年再考＝上；交換延畢看總圖天數（Y5S1 選了去總圖＝一週 4 天，16 週；AA 審稿 #6）*/
  S.gradResult2030=async function(GM){ const G=GM.G, F=G.flags, ok=S.gradPass2030(G); F.GRAD_EXAM_RESULT=ok?'pass':'fail'; if(ok) F.GRAD_ADMIT='exam';
    const t=R34_SYS[F.GRAD_EXAM_RESULT]; if(typeof PHONE!=='undefined'&&!PHONE.sent(G,'y5_grad_result')) PHONE.post(G,{th:'sys',text:t,tag:'y5_grad_result'});
    await scene(GM,async()=>{ await GM.say(null,t); }); return true; };
  S.gradRetry2030=async function(GM){ const G=GM.G, F=G.flags; await scene(GM,async()=>{ await GM.say(null,'（書桌上，二月那份考古題還攤著。）');
      const k=await GM.choose([{t:'「明年再考。」'},{t:'「不考了。」'}]); if(k===0) F.GRAD_RETRY2=true; else F.GRAD_QUIT=true; }); return true; };   /* 2030 沒上：二選一（旁白沿用 3/22 那一句，AA 沒有另外寫）*/
  S.gradExam2030Due=G=>{ const F=G.flags; return (F.GRAD_RETRY===true&&!delayed(G))||(delayed(G)&&F.Y4_PATH==='grad'&&!(typeof PG!=='undefined'&&PG.gradAdmit&&PG.gradAdmit(G))); };

  /* ===================== 2-Y4-54 多段感情：畢業前（5/21）、畢業後一年內（2030-05-25）、尾聲的座位（U5）===================== */
  S.TELL={
    heroine_01:{loc:'萬才館研討室外的走廊',loc30:'麵店，兩人桌',lines:['……多久了？',{narr:'（你回答以後，她點了一下頭，沒有再問。）'},'我們先當朋友。']},
    heroine_03:{loc:'麵店打烊以後，她在櫃台後面剝蒜頭',lines:['……嗯。',{narr:'（很久以後）'},'蒜頭剝完了。','我們……先不要了。']},
    heroine_02:{loc:'約好的視訊（她在英國，那邊下午）',loc30:'打烊後的 Café',lines:['……嗯。','我先掛了。……我會寫一張明信片給你。寫完才寄。'],last30:'……今天先這樣。我收店了。'},
    heroine_04:{loc:'吉他社辦外面的樓梯（她晚上回來看社課）',loc30:'工作室樓下',lines:['……你是來跟我說，你還有別人。','……我還以為你要問社課的事。','我不要這樣。我們先當朋友。']},
    heroine_05:{loc:'研究室走廊（5/29 口試前）',loc30:'她上班的研究單位樓下',lines:['……口試前一週。','口試以後才知道的話，我會很生氣。……現在也有一點。','我們先當朋友。我需要時間。'],first30:'……你特地在樓下等我，就是要講這個。',first30n:2},   /* 2030：first30 換掉講口試的前兩句（原本是一整句）*/
    classmate_peishan:{loc:'電話（她在台南）',lines:['……你特地打來說這個。','……我想要的不是這樣。','我會想一下。想完，我們還是朋友。']},
    kexin:{loc:'政大山下的小吃店',loc30:'她家樓下',lines:['……你說完了？',{narr:'（她把筷子放下。）'},'……我們先回到朋友。','今天你先走。']} };   /* AA_350 R0b（企劃線 cae5cc76）：「謝謝你（自己）說／講」七位換句，結果不變 */   /* C 表（以安、語彤照 AA_127 5-4；BB 的五位照 BB_164 第 2 節，裁定 #31、#33、#48）*/
  S.multiPreDue=G=>{ const P=partners(G); if(P.length<2||G.flags.MULTI_PRE!=null) return false; if(typeof ROM==='undefined'||!ROM.knowsOf) return true; return P.some(x=>P.some(y=>y!==x&&!(y==='kexin'?ROM.knowsGF(G,x):ROM.knowsOf(G,x,y)))); };   /* 至少一位還不知道 */
  /* 坦白＝她們退回朋友（acceptsOpen 都是 false），重新開始的等待減半：2 週，學姊 3 週（AA_185 0b）。不是前任 */
  S.toFriend=function(G,id){ const F=G.flags; if(F['dating_'+id]!==true&&!dating(G,id)) return false; F['dating_'+id]=false; if(typeof ROM==='undefined') return true; const R=ROM.get(G,id); R.status='friend_after_catch'; R.restartDay=G.day+(id==='heroine_05'?21:14);
    R.history.push({ev:'end',at:ROM.when(G),day:G.day,how:'told'}); const H=ROM.rec(G); for(let i=H.length-1;i>=0;i--) if(H[i].id===id&&H[i].to==null){ H[i].to=ROM.when(G); H[i].how='told'; break; }
    for(const p of partners(G)) ROM.learn(G,id,p,'yt_told'); return true; };
  S.pickOne=async function(GM,y){ const G=GM.G, P=partners(G); const k=await GM.choose(P.map(id=>({t:nm(id)}))); const keep=P[k]||P[0];
    S.apartSchedule(G,y||2029,keep,P.filter(id=>id!==keep));   /* AA_346：選的當下不結束其他人；從隔天起一位一場分開的談話（ev_choice_apart_<id>），談完才分開。舊存檔（已經 apart_talk 分開的）不受影響 */
    return keep; };
  S.multiPre=async function(GM){ const G=GM.G, F=G.flags; await scene(GM,async()=>{ await GM.say(null,'（典禮那天，她們都會來。）');
      const k=await GM.choose([{t:'「先跟她們說清楚。」'},{t:'「選一個人。」'},{t:'「先不想。」'}]);
      if(k===0){ F.MULTI_PRE='tell'; F.MULTI_TELL29={list:partners(G),from:G.day+1}; }
      else if(k===1){ const id=await S.pickOne(GM,2029); F.MULTI_PRE='pick:'+id; }
      else F.MULTI_PRE='later'; });   /* 先不想：不演被發現（U5）；典禮兩段伴侶戲分開演（postgrad3d.js gradScene）*/
    return true; };
  S.multiY5Due=G=>partners(G).length>=2&&G.flags.MULTI_Y5==null;
  S.multiY5=async function(GM){ const G=GM.G, F=G.flags; await scene(GM,async()=>{ await GM.say(null,'（畢業快一年了。手機裡，兩個對話框都停在「晚安」。）');
      const k=await GM.choose([{t:'「選一個人。」'},{t:'「跟她們說實話。」'},{t:'（不選）'}]);
      if(k===0){ const id=await S.pickOne(GM,2030); F.MULTI_Y5='pick:'+id; }
      else if(k===1){ F.MULTI_Y5='tell'; F.MULTI_TELL30={list:partners(G),from:G.day+1}; }
      else { F.MULTI_Y5='none'; F.EPI_SEAT_EMPTY=true; } });   /* 不選：不演被發現、不扣數值；尾聲祐廷旁邊空著 */
    return true; };
  S.tellScene=async function(GM,id,y30){ const G=GM.G, C=S.TELL[id]; if(!C||!dating(G,id)) return false; const A=adv();
    let L=C.lines.slice(); if(y30&&C.first30) L.splice(0,C.first30n||1,C.first30); if(y30&&C.last30) L[L.length-1]=C.last30;
    await scene(GM,async()=>{ if(A&&A.begin) A.begin({background:'dark',right:{charId:id,expression:'neutral'}}); if(GM.caption) GM.caption('',(y30&&C.loc30)||C.loc,2600); await play(GM,id,L); });
    S.toFriend(G,id); return true; };
  const tellSteps=(tag,key)=>[0,1,2,3,4,5,6].map(i=>({id:'r2y4b_'+tag+'_'+i,at:G=>{ const M=G.flags[key]; return M&&typeof M.from==='number'?T(M.from+i,21):Infinity; },until:G=>{ const M=G.flags[key]; return M&&typeof M.from==='number'?T(M.from+i+7,24):Infinity; },
    cond:G=>{ const M=G.flags[key]; return !!M&&Array.isArray(M.list)&&!!M.list[i]&&dating(G,M.list[i]); },run:GM=>S.tellScene(GM,GM.G.flags[key].list[i],tag==='tell30')}));   /* 當週一位一場（每天晚上 21:00 一位）*/

  /* ===================== AA_346「選一個人」之後，和其他人的分開談話（ev_choice_apart_<id>；AA-C 2026-10-21，第②級，台詞照原文、不改字）=====================
     - 選的當下不結束其他人（S.pickOne → S.apartSchedule）：照 AA_346 第 1 節的表，從選的隔天起一晚一位（照表的順序：以安、語彤、芷若、子晴、學姊、沛珊、可昕）；
       2029 都排在 6/2（畢業典禮）以前，學姊固定 5/30（三）17:00（口試 5/29 的隔天）；2030 從 5/26 起。一場＝一個出遊（OUT.plan，id apart<29|30>_<人>_<第幾次>，who＝她）。
     - 沒到（「不去了」、或過了約好的時間 30 分鐘還沒出發）：延到隔天同一時間，最多延兩次；第三次還沒到＝那一晚 22:00（過了 22:00 才算沒到的＝當下）她私訊
       「你是不是有話要跟我說。」，接著演電話版（PG 的場景 r2y4b_apart<29|30>_call_<人>：時間到了、玩家空下來就演；地點的旁白換成「（電話。）」）。
     - 知不知道（第 1 節）：她知道祐廷同時在和別人交往（knowsRel，BB_194；選的那一刻的伴侶、現在的伴侶，任何一位）＝「知道」那一版，沒有二選一。
       被選的那一位不因為這幾場知道別人；「我喜歡上別人了。」沒有說是誰，也不寫 knowsRel。
     - 談完：ROM.end(G,id,'apart_choice')（romance 的 status 'ex'、EX_<id>、收拾的時刻照一般分開），ROMANCE_HISTORY 那一筆加 said（knew／told／quiet）、day；F.CHOICE_APART_DONE 加她。
       前任版：apart_choice 當成 apart_talk 的一種（encounter3d.js 讀 apart_talk 的地方一起讀）；尾聲照「前任經過時那一句」（PG.exLines 讀 EX_）。不扣數值、不演吵架。
     - 選了以後、談話以前：她照舊是交往中（dating）；這段時間她因為別的原因分開了（不再交往）＝她那一場取消（apartRules）。
     - 存檔：F.CHOICE_APART29／F.CHOICE_APART30＝{y, keep, day（選的那一天）, list:[…], at:{人:{d（第一場的日子）, h, n（沒到幾次）, st:'plan'|'call'|'done'|'void', call（電話版的時間，絕對小時）, said, end}}}。
       舊存檔沒有這兩個旗標＝沒有這幾場；已經用 apart_talk 分開的不受影響。
     - 地點的 2D 背景：萬才館＝研討室（wancai_seminar，沒有走廊那一張）、研究室走廊（linze_prof_hall）、麵店（noodle_table）、視訊（video）、政大山下（nccu_food）；
       沒有圖的（Café 打烊後、吉他社辦外面的樓梯、2030 的工作室樓下、研究單位樓下、她家樓下）＝dark＋地點字幕；電話照 events3d.js 的 {scene:'電話'}。測試：node tests/aa346_apart_unit.js */
  S.APART_ORDER=['heroine_01','heroine_03','heroine_02','heroine_04','heroine_05','classmate_peishan','kexin'];
  const NEAR={travel:'走過去約 10 分鐘',travelH:1/6}, NOODLE={travel:'走過去約 15 分鐘',travelH:0.25}, Y30={travel:'捷運＋公車 約 30 分鐘',travelH:0.5};   /* 照現有的出遊（萬才館、研究室、吉他社 10 分鐘；麵店 15 分鐘；2030 照 y6_an_col）*/
  /* 每個人：h＝[2029, 2030] 幾點；at29／at30＝地點（place 也是出遊的地點、字幕）；open29／open30＝地點的旁白；knew／ask／told／quiet／last＝台詞
     （字串＝她說；{narr}＝旁白，n30＝2030 的那一句；{t, t30}＝她說、2030 換成 t30）*/
  S.APART={   /* AA_346 第 3-0 節（企劃線 12d52835，AA-C 10-21）改句：五位「謝謝你自己說」太像、四位「我不問」、以安的理由欄比喻、「我知道是誰」→ 照表換 */
    heroine_01:{h:[18,19],at29:Object.assign({place:'萬才館研討室外的走廊',bg:'wancai_seminar'},NEAR),at30:Object.assign({place:'麵店，兩人桌',bg:'noodle_table'},Y30),
      open29:'（讀書會散了。萬才館研討室外的走廊，只剩你們兩個。她手上還拿著白板筆。）',open30:'（麵店，兩人桌。她先到，點了兩碗，一碗推到你面前。）',
      knew:['……我知道。不用說名字。','你選了。……好。'],ask:['理由呢？'],
      told:[{narr:'（她沒有馬上說話。）'},'……你說實話了。','我要一點時間。'],quiet:['……好。',{narr:'（她把白板筆的蓋子蓋上。）',n30:'（她把筷子在碗上放好。）'}],
      last:[{narr:'（她翻開手帳，寫了一行，沒有給你看。）'},'好了。……你先走。我把這頁寫完。']},
    heroine_03:{h:[21.5,21.5],at29:Object.assign({place:'麵店打烊以後',bg:'noodle_table'},NOODLE),at30:Object.assign({place:'麵店打烊以後',bg:'noodle_table'},Y30),
      open29:'（麵店打烊以後。她在櫃台後面剝蒜頭，沒有抬頭。）',open30:'（麵店打烊以後。她在櫃台後面剝蒜頭，沒有抬頭。）',
      knew:[{narr:'（蒜頭一顆一顆放進碗裡。）'},'……嗯。我知道會有這一天。'],
      told:['……嗯。',{narr:'（很久以後。）'},'你坐。我把這碗剝完。'],quiet:['……嗯。',{narr:'（她沒有問為什麼。蒜頭剝完了，她又拿了一顆。）'}],
      last:['那我把這段時間，還給我自己。……謝謝你教我分時間。']},
    heroine_02:{h:[22,21.5],at29:{place:'約好的視訊',bg:'video',video:true},at30:Object.assign({place:'打烊後的 Café',bg:'dark'},Y30),
      open29:'（視訊。她那邊是下午，窗外是英國灰灰的天。）',open30:'（打烊後的 Café。只開了吧檯一盞燈。）',
      knew:['……我猜到了。你最近話都很短。'],told:[{narr:'（她沒有接話。平常她都會接話。）'},'……我知道了。'],
      quiet:['……好。',{narr:'（她低頭，看著鏡頭外面的什麼。）',n30:'（她低頭，擦了一下已經乾淨的杯子。）'},'我不問。問了，我會想記住答案。'],
      last:[{t:'回去以後，我還是在吧檯後面。你點什麼，我都記得。',t30:'我還是在吧檯後面。你點什麼，我都記得。'}]},
    heroine_04:{h:[21,20],at29:Object.assign({place:'吉他社辦外面的樓梯',bg:'dark'},NEAR),at30:Object.assign({place:'工作室樓下',bg:'dark'},Y30),
      open29:'（吉他社辦外面的樓梯。裡面在上社課，有人一直彈錯同一個和弦。）',open30:'（工作室樓下。她外套的帽子拉起來一半，手上拿著一杯便利商店的咖啡。）',
      knew:['……喔。你選好了。','我早就知道會是這樣。……也沒有很早啦。'],told:['……你喜歡上別人了。','好喔。好。……那個——',{narr:'（她沒有講完。）'}],
      quiet:['……好。',{narr:'（她把帽子拉起來，蓋住半張臉。）'},'那我也不講了。'],last:['之後還是朋友。……我說真的。']},
    heroine_05:{h:[17,18.5],fix29:'2029-05-30',at29:Object.assign({place:'研究室走廊',bg:'linze_prof_hall'},NEAR),at30:Object.assign({place:'她上班的研究單位樓下',bg:'dark'},Y30),
      open29:'（研究室的走廊。口試的資料還堆在她桌上，一疊一疊用夾子夾好。）',open30:'（她上班的研究單位樓下。她剛下班，識別證還掛在脖子上。）',
      knew:['……我知道。','走一段吧。這種事，站著講不好。'],told:['……嗯。','我需要一點時間。……不用太久。'],quiet:['好。',{narr:'（她把計畫本闔上，沒有寫任何東西。）'}],
      last:[{t:'謝謝你。……畢業快樂，先說了。',t30:'謝謝你。……你也要好好吃飯。'}]},
    classmate_peishan:{h:[21,21],at29:{place:'電話',call:true},at30:{place:'電話',call:true},
      open29:'（電話。她那邊有小孩子的聲音，她走到外面才講。）',open30:'（電話。她那邊有小孩子的聲音，她走到外面才講。）',
      knew:['……我知道你要說什麼。','你特地打來說這個。'],told:['……你特地打來說這個。','……還好啦。你那邊吃飯了嗎？'],quiet:['……嗯。',{narr:'（電話那頭很久沒有聲音。）'},'好。……那我掛了喔。'],
      last:['謝謝你在我重考那年陪我。那一年，我不會忘。']},
    kexin:{h:[18.5,20],at29:{place:'政大山下的小吃店',bg:'nccu_food',travel:'開車約 40 分鐘',travelH:2/3},at30:Object.assign({place:'她家樓下',bg:'dark'},Y30),
      open29:'（政大山下的小吃店。她點好了兩碗，筷子還沒拆。）',open30:'（她家樓下。她穿著拖鞋下來，手上還拿著鑰匙。）',
      knew:['……你說完了？',{narr:'（她把筷子放下。）',n30:'（她把鑰匙握在手裡。）'},'我知道。……我以為你會更早講。'],
      told:['……你說完了？',{narr:'（她把筷子放下。）',n30:'（她把鑰匙握在手裡。）'},'……操。','你至少講完了。'],quiet:['……就這樣？',{narr:'（她站起來，自己去付了錢。）',n30:'（她轉身上樓，門沒有關好。）'}],
      last:['我累的時候傳的那隻長頸鹿，先不傳了。','……累了，我自己會去睡。']} };
  S.APART_ME='……我想跟妳分開。'; S.APART_DM='你是不是有話要跟我說。'; S.APART_PHONE='（電話。）';
  /* 電話版（沛珊，以及錯過三次改電話的）：看得到動作的旁白換成聽得到的，不另寫整段（AA_350 Q3）；null＝拿掉。視訊版（芷若 2029）看得到，照留 */
  S.APART_HEAR={'（蒜頭一顆一顆放進碗裡。）':'（電話那頭有剝東西的聲音。）','（她沒有問為什麼。蒜頭剝完了，她又拿了一顆。）':'（電話那頭有剝東西的聲音。）',
    '（她低頭，擦了一下已經乾淨的杯子。）':'（那頭有杯子碰到的聲音。）','（她把計畫本闔上，沒有寫任何東西。）':'（紙闔起來的聲音。）','（她翻開手帳，寫了一行，沒有給你看。）':'（翻紙的聲音。）',
    '（她把筷子放下。）':'（那頭安靜了一下。）','（她把筷子在碗上放好。）':'（那頭安靜了一下。）','（她站起來，自己去付了錢。）':'（那頭安靜了一下。）','（她轉身上樓，門沒有關好。）':'（那頭安靜了一下。）',
    '（她把帽子拉起來，蓋住半張臉。）':null,'（她把鑰匙握在手裡。）':null,'（她把白板筆的蓋子蓋上。）':null,'（她低頭，看著鏡頭外面的什麼。）':null};
  S.APART_OPTS=['「我喜歡上別人了。」','（不說原因）'];   /* 她不知道的時候，祐廷二選一（第 2 節）；以安先問「理由呢？」*/
  const AK=y=>'CHOICE_APART'+(y%100);
  S.apartRound=(G,y)=>{ const R=G&&G.flags&&G.flags[AK(y)]; return R&&typeof R==='object'&&R.at&&typeof R.at==='object'?R:null; };
  S.apartOf=(G,id)=>{ for(const y of [2030,2029]){ const R=S.apartRound(G,y), P=R&&R.at[id]; if(P&&P.st!=='done'&&P.st!=='void') return R; } return null; };   /* 她還沒談的那一輪 */
  S.apartOutId=(y,id,n)=>'apart'+(y%100)+'_'+id+'_'+n;
  S.apartSchedule=function(G,y,keep,others){ const F=G.flags; if(S.apartRound(G,y)) return S.apartRound(G,y);   /* 同一年只排一次 */
    const list=S.APART_ORDER.filter(id=>(others||[]).includes(id)); if(!list.length) return null;
    const R={y,keep,day:G.day,list,at:{}}, used=new Set(), fix={}, gd=DK('2029-06-02');
    for(const id of list){ const f=y===2029&&S.APART[id].fix29?DK(S.APART[id].fix29):null; if(f!=null&&f>G.day){ fix[id]=f; used.add(f); } }   /* 學姊固定 5/30（口試 5/29 之後，不排在口試前）*/
    let d=G.day+1; if(y===2030){ const d0=DK('2030-05-26'); if(d0!=null) d=Math.max(d,d0); }
    for(const id of list){ let day=fix[id]; if(day==null){ while(used.has(d)||(y===2029&&d===gd)) d++; day=d; used.add(d); d++; }   /* 一晚一位；6/2 畢業典禮當天不排（5/28 才選、人又多到排不下的，接到典禮以後）*/
      R.at[id]={d:day,h:S.APART[id].h[y===2029?0:1],n:0,st:'plan'}; }
    F[AK(y)]=R; for(const id of list) S.apartPlan(G,R,id); return R; };
  S.apartDay=(R,id)=>{ const P=R&&R.at[id]; return P?(P.day!=null?P.day:P.d+P.n):null; };   /* 那一場實際排在哪一天（P.day；舊存檔沒有＝d＋n）*/
  S.apartPlan=function(G,R,id){ const P=R.at[id], C=S.APART[id]; if(!P||!C) return false; const at=R.y===2029?C.at29:C.at30, nm0=nm(id);
    let day=Math.max(P.d+P.n,P.day!=null?P.day+(P.n>(P.dn|0)?1:0):0); const gd=DK('2029-06-02');   /* 沒到＝隔天同一時間 */
    while((R.y===2029&&day===gd)||Object.keys(R.at).some(x=>x!==id&&R.at[x].st==='plan'&&S.apartDay(R,x)===day)) day++;   /* AA_350 Q4：一晚只排一場，撞到的往後順延一天（不算沒到）；6/2 典禮當天不排 */
    P.day=day; P.dn=P.n;
    const o={id:S.apartOutId(R.y,id,P.n),ev:'ev_choice_apart_'+id,day,h:P.h,late:0.5,place:at.place,who:id,apart:{y:R.y,id,n:P.n}};   /* who：那一天不會在外面偶遇她（encounter3d.js）*/
    if(at.call) Object.assign(o,{title:'打給'+nm0,verb:'打給她',no:'今天先不要',call:true,travel:'',travelH:0,back:'電話結束。'});
    else if(at.video) Object.assign(o,{title:at.place+'（'+nm0+'）',verb:'接起來',no:'先不接',travel:'',travelH:0,back:'視訊結束。'});
    else Object.assign(o,{title:at.place+'（'+nm0+'）',travel:at.travel,travelH:at.travelH});
    return plan(G,o); };
  /* 沒到（出遊的 outingMissed）：延到隔天同一時間；第三次＝那一晚 22:00 她私訊，接著演電話版 */
  S.apartMissed=function(G,q){ const a=q&&q.apart; if(!a) return false; const R=S.apartRound(G,a.y), P=R&&R.at[a.id]; if(!P||P.st!=='plan'||P.n!==a.n) return false;
    if(!dating(G,a.id)){ P.st='void'; return false; }
    if(P.n<2){ P.n++; S.apartPlan(G,R,a.id); return 'later'; }
    const t=Math.max(T(q.day,22),now(G)), d=Math.floor(t/24); P.st='call'; P.call=t;
    if(typeof PHONE!=='undefined') PHONE.at(G,d,t-d*24,[P_(a.id,S.APART_DM)],'apart'+(a.y%100)+'_call_'+a.id);
    return 'call'; };
  /* 她知道祐廷同時和別人交往嗎（BB_194 的 knowsRel；不看 OPEN_OK，同意過的也是知道）*/
  S.apartKnew=function(G,id,R){ if(typeof ROM==='undefined'||!ROM.knowsOf) return false; const k=R&&R.keep; return !!k&&k!==id&&!!ROM.knowsOf(G,id,k); };   /* AA_350 Q6：只看她知不知道「被選的那一位」；只知道別人（例：先談完分開的那一位）＝照「不知道」走 */
  const phoneBg=G=>{ if(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G)&&HOME.bgNow) return HOME.bgNow(); if(typeof JP!=='undefined'&&JP.inJapan&&JP.inJapan(G)&&JP.bgNow) return JP.bgNow(G); return bg('phone_street_night'); };   /* 同 events3d.js 的 {scene:'電話'}：人在家＝家裡，不在家＝晚上的路邊 */
  /* 演一場（出遊的 beforeOuting、電話版共用；第 2 節的流程）：回傳 said（knew／told／quiet）；已經談過、她不在交往＝false */
  S.apartScene=async function(GM,id,o){ o=o||{}; const G=GM.G, C=S.APART[id], R=o.y?S.apartRound(G,o.y):S.apartOf(G,id), P=R&&R.at[id]; if(!C||!P||P.st==='done'||P.st==='void'||!dating(G,id)) return false;
    const y30=R.y===2030, ph=!!o.phone, at=y30?C.at30:C.at29, A=adv();
    const hear=ph||!!at.call, v=x=>x&&typeof x==='object'?(x.narr!=null?{narr:y30&&x.n30?x.n30:x.narr}:(y30&&x.t30!=null?x.t30:x.t)):x;
    const L=a=>(a||[]).map(v).map(x=>x&&typeof x==='object'&&hear&&Object.prototype.hasOwnProperty.call(S.APART_HEAR,x.narr)?(S.APART_HEAR[x.narr]==null?null:{narr:S.APART_HEAR[x.narr]}):x).filter(x=>x!=null);   /* 電話：聽得到的旁白（AA_350 Q3）*/
    if(A&&A.begin) A.begin({background:ph||at.call?phoneBg(G):bg(at.bg),right:{charId:id,expression:'neutral'}}); if(GM.caption) GM.caption('',ph?'電話':at.place,2600);
    await GM.say(null,ph?S.APART_PHONE:(y30?C.open30:C.open29));   /* 1. 地點的旁白（電話版＝「（電話。）」）*/
    await GM.say({name:G.name||'祐廷'},S.APART_ME);   /* 2. 祐廷先開口 */
    let said='knew';
    if(S.apartKnew(G,id,R)) await play(GM,id,L(C.knew));   /* 3. 她知道：直接接「知道」那一版，沒有二選一 */
    else { await play(GM,id,L(C.ask)); const k=await GM.choose(S.APART_OPTS.map(t=>({t}))); said=k===0?'told':'quiet'; await play(GM,id,L(said==='told'?C.told:C.quiet)); }   /* 4. 她不知道：祐廷二選一 */
    await play(GM,id,L(C.last));   /* 5. 她最後一句 */
    S.apartEnd(G,id,said,R); return said; };
  S.apartOuting=(GM,q)=>q&&q.apart?S.apartScene(GM,q.apart.id,{y:q.apart.y}):Promise.resolve(false);
  /* 電話版（PG 的場景）：出遊那一條由 EVENTS.run 記 events.done，電話版不經過它，這裡記 */
  S.apartCall=async function(GM,y,id){ const G=GM.G, R=S.apartRound(G,y), P=R&&R.at[id]; if(!P||P.st!=='call'||!dating(G,id)) return false; let r=false;
    await scene(GM,async()=>{ r=await S.apartScene(GM,id,{y,phone:true}); });
    if(r){ const E0=G.events||(G.events={done:{},last:{},count:0}), k='ev_choice_apart_'+id; E0.done=E0.done||{}; E0.last=E0.last||{}; E0.done[k]=(E0.done[k]||0)+1; E0.last[k]=G.day; E0.count=(E0.count|0)+1; }
    return r; };
  /* 談完：分開（第 5 節的旗標）。同一輪她還排著的（延期的那幾場）取消 */
  S.apartEnd=function(G,id,said,R){ const P=R&&R.at[id]; if(P){ P.st='done'; P.said=said; P.end=G.day; }
    if(typeof ROM!=='undefined'&&ROM.rec&&ROM.end){ const H=ROM.rec(G); let i0=-1; for(let i=H.length-1;i>=0;i--) if(H[i].id===id&&H[i].to==null){ i0=i; break; }
      if(ROM.end(G,id,'apart_choice')){ const h=i0>=0?H[i0]:(H.push({id,from:null,to:ROM.when(G),how:'apart_choice'}),H[H.length-1]); h.said=said; h.day=G.day; } }
    const D=Array.isArray(G.flags.CHOICE_APART_DONE)?G.flags.CHOICE_APART_DONE:(G.flags.CHOICE_APART_DONE=[]); if(!D.includes(id)) D.push(id);
    if(typeof OUT!=='undefined'&&R) for(const q of OUT.rec(G)) if(q.state==='planned'&&q.apart&&q.apart.id===id&&q.apart.y===R.y) q.state='cancelled'; };
  /* 每 0.5 秒（S.phone）：選了以後、談話以前，她因為別的原因已經不在交往＝她那一場取消（排著的出遊、還沒送出的私訊）*/
  const apartRules=G=>{ for(const y of [2029,2030]){ const R=S.apartRound(G,y); if(!R) continue;
      for(const id of (R.list||[])){ const P=R.at[id]; if(!P||(P.st!=='plan'&&P.st!=='call')||dating(G,id)) continue; P.st='void';
        if(typeof OUT!=='undefined') for(const q of OUT.rec(G)) if(q.state==='planned'&&q.apart&&q.apart.id===id&&q.apart.y===y) q.state='cancelled';
        if(typeof PHONE!=='undefined'){ const Q=PHONE.rec(G).q, tag='apart'+(y%100)+'_call_'+id; for(let i=Q.length-1;i>=0;i--) if(Q[i].tag===tag) Q.splice(i,1); } } } };
  S.apartRules=apartRules;
  const apartCallSteps=y=>S.APART_ORDER.map(id=>({id:'r2y4b_apart'+(y%100)+'_call_'+id,
    at:G=>{ const R=S.apartRound(G,y), P=R&&R.at[id]; return P&&P.st==='call'&&typeof P.call==='number'?P.call:null; },until:()=>Infinity,
    cond:G=>{ const R=S.apartRound(G,y), P=R&&R.at[id]; return !!P&&P.st==='call'&&dating(G,id); },run:GM=>S.apartCall(GM,y,id)}));   /* 電話版：時間到了、玩家空下來就演（不會再錯過）*/
  /* 尾聲：不選（EPI_SEAT_EMPTY）＝她們都在場、照朋友版那一句；祐廷旁邊空著；CG-10 只有共通圖；桌上不放伴侶那一樣 */
  S.seatView=function(G){ const F=Object.assign({},G.flags), Rm={}; for(const id of LOVE){ if(F['dating_'+id]===true) F['dating_'+id]=false; } const R0=G.flags.romance||{}; for(const id in R0){ Rm[id]=Object.assign({},R0[id]); if(Rm[id].status==='dating') Rm[id].status='none'; } F.romance=Rm; return Object.assign({},G,{flags:F}); };
  S.SEAT_EMPTY='（你旁邊的位子一直空著。沒有人問。）';
  S.patchEpilogue=function(){ if(typeof PG==='undefined'||PG._r2y4b) return false; PG._r2y4b=true;
    const wrap=(k,f)=>{ const o=PG[k]; if(typeof o!=='function') return; PG[k]=function(G){ return f.call(this,o,G,[].slice.call(arguments,1)); }; };
    wrap('epiPartner',(o,G,a)=>G&&G.flags&&G.flags.EPI_SEAT_EMPTY?null:o.apply(PG,[G].concat(a)));
    wrap('epiCg',(o,G,a)=>G&&G.flags&&G.flags.EPI_SEAT_EMPTY?'cg_reunion_window_table':o.apply(PG,[G].concat(a)));   /* 只有共通圖（不放伴侶、也不放阿凱的圖層）*/
    wrap('epiLine',(o,G,a)=>o.apply(PG,[G&&G.flags&&G.flags.EPI_SEAT_EMPTY?S.seatView(G):G].concat(a)));
    wrap('epiPresent',(o,G,a)=>o.apply(PG,[G&&G.flags&&G.flags.EPI_SEAT_EMPTY?S.seatView(G):G].concat(a)));
    if(Array.isArray(PG.EPI_AFTER_CG)) PG.EPI_AFTER_CG.push(async GM=>{ if(GM.G.flags.EPI_SEAT_EMPTY) await GM.say(null,S.SEAT_EMPTY); });   /* 接在 ③ CG-10 之後 */
    if(Array.isArray(PG.EPI_AFTER_ITEMS)) PG.EPI_AFTER_ITEMS.push(async GM=>{ const G=GM.G; if(route(G)!=='US'||!G.flags.MET_LONG) return;   /* 2-Y4-55：美國路線、有 MET_LONG（何俊朗 1 演過）*/
      await GM.say(null,'（你把長桌的合照傳給一個人。過了一下，手機亮了。）'); await GM.say({name:'何俊朗（手機）'},'看到你們的合照了。下次來香港，我帶你去吃。'); });
    return true; };

  /* ===================== 2-Y4-56 美國路線、和學姊交往中：秋假大峽谷（美東當地時間；AA_291 2-1）===================== */
  const SISP=(t,o)=>P_('heroine_05',t,o);   /* o：回覆按鈕（ask）等，照 P_ */
  const usCanyonPhone=G=>{ const d=DK('2028-09-27'), d7=DK('2028-10-07'), F=G.flags; if(d==null||G.day<d||G.day>d7+8||route(G)!=='US') return;
    if(dating(G,'heroine_05')&&at(G,'2028-09-27',21)&&now(G)<T(d7,6)){
      const L=[SISP('十月有一個禮拜的秋假。我想開車去大峽谷。'),SISP('機票我看好了，飛到鳳凰城，在那邊租車。'),SISP('……你坐副駕，負責放音樂。')];
      L[2].ask={id:'y4_us_canyon',until:T(d7,6),opts:[{t:'好。',say:[{from:'heroine_05',text:'好。我訂兩張。'}]},{t:'妳開那麼遠不累嗎？',say:[{from:'heroine_05',text:'所以才要你放音樂。'}]}]};
      if(PHONE.at(G,d,atH(G,d,21),L,'y4_us_canyon')) plan(G,{id:'y4_us_canyon',ev:'ev_us_canyon',day:d7,h:6,late:1,must:true,place:'社區門口',title:'秋假：大峽谷',travel:'',travelH:0,back:'回到社區。'}); } };   /* 交往中，約了就會去：兩個回答都記行事曆 */
  S.usFallDue=G=>{ const d7=DK('2028-10-07'); if(d7==null||route(G)!=='US'||dating(G,'heroine_05')||!knows('heroine_05',G)||!(typeof STORY!=='undefined'&&STORY.abroad&&STORY.abroad(G))) return null;   /* 挽回中、挽回不成：兩個摘要日 */
    if(G.day===d7&&hh(G)>=9&&!G.flags.US_FALL_1) return 1; if(G.day===d7+1&&hh(G)>=9&&!G.flags.US_FALL_2) return 2; return null; };
  S.usFall=async function(GM,n){ const G=GM.G; G.flags['US_FALL_'+n]=G.day;
    await scene(GM,async()=>{ await GM.say(null,n===1?'秋假。社區的停車場空了一半。':(G.flags.MET_LONG?'何俊朗去了芝加哥找朋友。你把三門課的閱讀都讀完了。':'你把三門課的閱讀都讀完了。')); }); return true; };   /* AA 稿這兩句沒有括號，照原樣 */
  S.canyonAfter=function(G,kind){ if(typeof DATE!=='undefined'&&DATE.log){ const L=DATE.log(G,'heroine_05'); L.count=(L.count|0)+2; if(kind==='tw'){ L.wish=true; L.wishKnown=true; } }   /* 算 2 次正式約會（台灣路線也算她的心願地點）*/
    if(kind==='us'&&typeof SOCIAL!=='undefined') SOCIAL.adjust('heroine_05',{rom:2,npcRom:2});   /* 她和祐廷的戀愛各 +2（AA_291 2-1）*/
    if(kind==='tw'&&G.flags.SIS_CANYON!=='knows'&&!dating(G,'heroine_05')&&typeof ROM!=='undefined'&&ROM.start&&ROM.start(G,'heroine_05')){ (G.flags.confessed||(G.flags.confessed={})).heroine_05=G.day; G.flags.SIS_GF_CANYON=G.day; } };   /* SIS_GF_CANYON：大峽谷才交往（AA_392 第 1-3 節：中秋那組不演；從第一組開始）*/   /* 10/13 告白＝交往；交往當天起叫她「書瑀」（CALLED_SHUYU）；知情對話沒答應（SIS_CANYON 'knows'）＝不交往 */
  /* AA_474 3b：大峽谷告白的那一刻她知道祐廷正在和別人交往（臺灣路線）＝接 KNOW.heroine_05（她第一次知情＝一律讓我想想，AA_474 1-2）。
     接受（第二次才可能）＝照原本的交往（ROM.start＋OPEN_OK＋confessed、SIS_GF_CANYON）；不交往＝SIS_CANYON 'knows'：行程照算兩次約會＋心願地點（canyonAfter），SIS_GF_CANYON 不記、不叫書瑀 */
  S.knowsOther=(G,id)=>typeof MREL!=='undefined'&&!!MREL.knowsOther&&MREL.knowsOther(G,id);
  S.canyonKnow=async function(GM,said){ const G=GM.G; if(typeof MREL==='undefined'||!MREL.knowGate) return null;
    const ys=MREL.knownOthers(G,'heroine_05'), r=await MREL.knowGate(GM,'heroine_05',{said,at:'canyon',start:G0=>{ const ok=MREL.startOpen(G0,'heroine_05',ys); if(ok) G0.flags.SIS_GF_CANYON=G0.day; return ok; }});
    if(r!=null) G.flags.SIS_CANYON=r==='yes'?'confess':'knows'; return r; };

  /* ===================== 2-Y4-57 台灣、日本路線：學姊在美國（8/2～12/23）——每週的訊息、視訊、秋假大峽谷 ===================== */
  /* AA_378 第 1 節 S1（企劃線 f2de8d1c；使用者 10-21 22:5x「學姊才是真正的女主角」）：不輪播——每一則、每一組最多一次。「到了。」拿出每週那一套，她落地那天 8/3（四）07:00 傳（臺灣時間）；
     T1、T2 都兩週一則（8/7、8/21……12/11，十格）、T3 視訊每週；T1 照順序，楓樹那則 9/25 以前不出（輪到它還沒到 9/25，先出下表的一則）；
     那一段用完、或輪到的不能出，就用 SA_X（照順序、「最早」那天以後才出、各一次；最早那天起兩週內才能出，X0 四週——AA 23:11 確認）；表也用完那一格就不傳 */
  /* 「到了。」不另外傳（AA_378 S1 更正，企劃線 5cd35678）：8/3 09:00 家族群組已經有 US0「到了。天空很大。」（AA_398 第 29、30 列）（y34b3d.js），原本 8/3 07:00 那則會重複 */
  S.SA_T1=[['（照片：超市的花生醬貨架）','我買了一罐太大的花生醬。'],['（照片：圖書館的長桌）','這邊的圖書館整晚開著。……以後我十二點就走。'],['（照片：校園裡一棵開始變紅的楓樹）','九月底，葉子先紅了一棵。']];
  S.SA_T1_FROM=[null,null,'2028-09-25'];
  S.SA_X=[{from:'2028-09-11',days:28,L:['（照片：超市架上的一盒烏龍茶）','找到臺灣的烏龍茶了。很貴。我還是買了。']},   /* X0 不分季節：四週內（到 10/8），T2 的玩家 10/2 那一格收得到（AA 23:11，企劃線 c0734889；「臺灣」8f138c5b）*/
   {from:'2028-10-09',L:['（照片：圖書館前的長椅，一隻松鼠站在椅背上）','我在吃三明治。牠在等。……我沒有分。']},
    {from:'2028-10-23',L:['（照片：宿舍門口一顆刻了臉的南瓜）','室友刻的。她說刻的是我。……不像。']},{from:'2028-11-06',L:['（照片：圖書館的窗，外面已經全黑）','冬令時間開始了。五點就天黑。']},
    {from:'2028-11-24',L:['（照片：一盤火雞，旁邊一小碗白飯）','感恩節。同學的媽媽聽說我是臺灣來的，多煮了一碗飯。']},{from:'2028-12-04',L:['（照片：計畫本十二月那一頁）','最後一格寫的是回臺灣。']}];
  S.SA_X_DAYS=14;   /* 最早那天起兩週內才能出（AA 確認 LAWWW 23:10 的解讀）；個別的寫 days */
  S.SA_V_SETS=3; S.SA_V_NARR='（視訊。她那邊是週六晚上。這個禮拜的事，你們講了半個小時。）';   /* T3 三組用完以後只有這一行旁白（大峽谷邀約照現在的條件接在後面）*/
  /* AA_392 第 1-3 節：交往中的六組視訊（ev_sis_video_gf），照順序、各一次；from＝那一組最早的週日（中秋、冬令時間、感恩節、回臺灣那幾週），還沒到就那一週只有旁白；
     canyon＝臺灣路線 10/13 大峽谷才交往的不演（中秋那組）*/
  S.SA_VD=[{from:'2028-08-13'},{from:'2028-09-03'},{from:'2028-10-01',canyon:false},{from:'2028-11-05'},{from:'2028-11-26'},{from:'2028-12-10'}];
  S.SA_VG_NARR='（視訊。她那邊是週六晚上。你們講到她那邊快十二點，她說要睡了，鏡頭又開了三分鐘才關。）';
  S.SA_T2=[{L:['論文的第三章寫完了，第四章在寫。這邊的指導教授回信很快，比我想的快。','你大四上的課排得怎樣？'],O:[{t:'還好，不算太滿。'},{t:'很滿。'}]},
    {L:['今天第一次在這邊開車。這邊紅燈可以右轉，我在路口停了很久，後面一直按喇叭。','你最近有在開車嗎？'],O:[{t:'有，週末開。'},{t:'沒有。'}]},
    {L:['圖書館我待到十二點。旁邊的人讀到兩點，我先走了。','你研究所的事，決定了嗎？不用現在回答。'],O:[{t:'決定了。',if:G=>!!G.flags.Y4_PATH},{t:'還在想。'}]},
    {L:['這邊的人問我還好嗎，我都說還好。','……你那邊呢？'],O:[{t:'還好。'},{t:'其實有點累。'}]}];   /* 她問了要有回覆按鈕；她不再回（一來一回就停）*/
  S.saOn=G=>law(G)&&route(G)!=='US'&&knows('heroine_05',G)&&stageAt('heroine_05','ACQUAINTANCE')&&!isEx(G,'heroine_05');   /* 和學姊分手過：沒有訊息池、沒有邀約；交往中也排（AA_392 第 1 節：女朋友的每週視訊＋T1、SA_X 照片，saGf）*/
  /* 每週一格（k＝第幾週，8/6 那一週＝0）：週日 08:00 決定這一週是哪一段；T1、T2 的訊息臺灣週一 09:00（11/5 起 10:00；手機訊息不撞課），T3 視訊臺灣週日 10:00（她那邊週六晚上，AA_378 S2：原本週一 09:00 撞必修強制執行法）*/
  S.saChecks=function(){ if(S._sac) return S._sac; const out=[]; const a=DK('2028-08-06'), b=DK('2028-12-17'), w=DK('2028-11-05'); if(a==null||b==null) return out;
    for(let d=a;d<=b;d+=7) out.push({day:d,h:8,vDay:d,vH:10,mDay:d+1,mH:d>=w?10:9}); return (S._sac=out); };
  S.saRec=G=>{ const F=G.flags; if(!F.SIS_AB||typeof F.SIS_AB!=='object') F.SIS_AB={k:-1,tier:0,i1:0,i2:0,i3:0,ix:0,t1k:-9,log:[],v:2}; const R=F.SIS_AB;
    if(R.v!==2){ R.i1=Math.max(0,(R.i1|0)-1); R.i3=Math.min(R.i3|0,S.SA_V_SETS); R.ix=R.ix|0; R.v=2; }   /* 舊存檔（AA_378 以前）：T1 的第一則原本是「到了」，往前挪一格；T2、視訊已經輪過的不再重來 */
    return R; };
  const saReplied=(G,e)=>{ if(e.kind==='video'){ const q=outGet(G,e.tag); return !!q&&q.state==='done'; } const ms=(G.msgs||[]).filter(m=>m.th==='p:heroine_05'); const i=ms.findIndex(m=>m.tag===e.tag&&m.from==='heroine_05'); if(i<0) return false;
    for(let j=i+1;j<ms.length;j++){ if(ms[j].from==='player') return true; if(ms[j].from==='heroine_05'&&ms[j].tag&&/^y4_sa_/.test(ms[j].tag)&&ms[j].tag!==e.tag) return false; } return false; };
  S.saRate=G=>{ const L=S.saRec(G).log; if(!L.length) return 0; return L.filter(e=>saReplied(G,e)).length/L.length; };
  S.saTarget=G=>{ const st=typeof DATE!=='undefined'&&DATE.stageNum?DATE.stageNum('heroine_05'):1; let t=st>=5?3:(st>=4?2:1);
    if(t>2&&partners(G).length&&typeof TERMEND!=='undefined'&&TERMEND.willing&&!TERMEND.willing(G,'heroine_05').ok) t=2;   /* 和別人交往中、條件不成立：只有 T1／T2 */
    return t; };
  const saFrom=k=>{ const d=k?DK(k):null; return d==null?-1:d; };
  /* T1 那一格要傳的（AA_378 S1 第 4、5 點）：輪到的 T1 能出就出；不能出（楓樹 9/25 以前）或用完＝表上下一則（照順序、最早那天以後、過期的跳過）*/
  const saPick=(G,R,tier,day)=>{ if(tier===1&&R.i1<S.SA_T1.length&&day>=saFrom(S.SA_T1_FROM[R.i1])) return {t1:R.i1};
    if(tier===2&&R.i2<S.SA_T2.length) return {t2:R.i2};
    while((R.ix|0)<S.SA_X.length&&day>saFrom(S.SA_X[R.ix|0].from)+(S.SA_X[R.ix|0].days||S.SA_X_DAYS)-1) R.ix=(R.ix|0)+1;   /* 過期的不出（之後也不出）*/
    const x=S.SA_X[R.ix|0]; return x&&day>=saFrom(x.from)?{x:R.ix|0}:null; };
  /* AA_392 第 1-2 節：交往中（臺灣、日本路線）——T1、SA_X 照片照朋友版兩週一則（照片是生活的事，不分關係）；每週日 10:00 視訊六組照順序（S.SA_VD）、各一次，沒輪到的週次＝旁白；
     大峽谷那一週（10/7 出發～10/15 回來）跳過不補；已經過了的時間不排；沒接＝她傳「你在忙。下週。」（ev_sis_video_gf.outingMissed）；連續兩週沒接，第三週她不打，改傳「這週我先不打了。你有空打給我。」，下一週照常 */
  const saGf=(G,R,c,k)=>{ const F=G.flags;
    if(!(k%2)){ const p=saPick(G,R,1,c.mDay); if(p){ const L=p.t1!=null?S.SA_T1[p.t1]:S.SA_X[p.x].L, tag=(p.t1!=null?'y4_sa_t1_':'y4_sa_x_')+k; if(p.t1!=null) R.i1++; else R.ix=p.x+1; PHONE.at(G,c.mDay,c.mH,L.map(t=>SISP(t)),tag); R.log.push({k,kind:p.t1!=null?'t1':'x',tag,x:p.x}); } }
    const cq=outGet(G,'y4_sis_canyon'), d7=DK('2028-10-07'), d15=DK('2028-10-15'); if(cq&&cq.state!=='missed'&&c.vDay>=d7&&c.vDay<=d15) return;   /* 大峽谷那一週 */
    if(T(c.vDay,c.vH)+1<=now(G)) return;   /* 已經過了（讀檔、事件跳過時間）：不補 */
    const last=R.log.filter(e=>e.kind==='gvideo'||e.kind==='gskip').slice(-2), miss=e=>e.kind==='gvideo'&&(q=>!!q&&q.state==='missed')(outGet(G,e.tag));
    if(last.length===2&&last.every(miss)){ const tag='y4_sa_gskip_'+k; PHONE.at(G,c.vDay,c.vH,[SISP('這週我先不打了。你有空打給我。')],tag); R.log.push({k,kind:'gskip',tag}); return; }
    let g=R.g|0; while(g<S.SA_VD.length&&S.SA_VD[g].canyon===false&&F.SIS_GF_CANYON!=null) g++;
    let set=S.SA_VD.length; if(g<S.SA_VD.length&&c.vDay>=saFrom(S.SA_VD[g].from)){ set=g; g++; } R.g=g;
    const tag='y4_sa_g_'+k; plan(G,{id:tag,ev:'ev_sis_video_gf',day:c.vDay,h:c.vH,late:1,place:'視訊',verb:'接起來',title:'和書瑀視訊（她那邊週六晚上）',travel:'',travelH:0,back:'視訊結束。',sa:{k,gset:set}}); R.log.push({k,kind:'gvideo',tag,set}); };
  S.sisGfSet=G=>{ const q=typeof OUT!=='undefined'?OUT.rec(G).filter(x=>/^y4_sa_g_/.test(x.id)&&x.sa).sort((a,b)=>b.day-a.day).find(x=>x.day<=G.day):null; return q?q.sa.gset:S.SA_VD.length; };
  S.sisGfThanksPhoto=G=>{ const R=S.saRec(G); return R.log.some(e=>e.kind==='x'&&e.x===4&&PHONE.sent(G,e.tag)&&(G.msgs||[]).some(m=>m.tag===e.tag&&(m.day<G.day||(m.day===G.day&&m.h<=G.hour)))); };   /* V5：那一週已經收到感恩節照片（SA_X 第 5 則）*/
  const saWeekly=G=>{ if(!S.saOn(G)) return; const R=S.saRec(G), C=S.saChecks(), n=now(G);
    for(let k=R.k+1;k<C.length;k++){ const c=C[k]; if(T(c.day,c.h)>n) break; R.k=k; if(n-T(c.day,c.h)>48) continue;   /* 讀檔跳過很久的不補 */
      if(dating(G,'heroine_05')){ saGf(G,R,c,k); continue; }   /* AA_392 第 1 節：交往中走女朋友那一套（不收 T2、朋友版 T3）*/
      const tgt=S.saTarget(G); if(!R.tier) R.tier=tgt; else if(tgt<R.tier) R.tier=tgt; else if(tgt>R.tier){ const last=R.log.slice(-3); if(last.filter(e=>saReplied(G,e)).length>=2) R.tier=Math.min(tgt,R.tier+1); }   /* 最近三則回兩則以上才升 */
      G.flags.SIS_ABROAD_TIER=R.tier;   /* 每週的段（AA_327 2-Y4-57 第 4 節）*/
      if(R.tier===2&&k%2){ const tag='y4_sa_s_'+k, set=Math.min(R.t2v|0,S.SA_S_SETS); R.t2v=(R.t2v|0)+1;   /* AA_395 2-1：T2 的奇數週＝臺灣週日 10:00 十分鐘的短視訊（三組各一次，之後旁白；沒接那一組不補）*/
        plan(G,{id:tag,ev:'ev_sis_video_short',day:c.vDay,h:c.vH,late:1,place:'視訊',verb:'接起來',title:'和學姊視訊（十分鐘）',travel:'',travelH:0,hours:0.2,back:'視訊結束。',sa:{k,sset:set}}); R.log.push({k,kind:'video',tag}); continue; }   /* kind video：接了就算回過（saReplied）*/
      if(R.tier===1||R.tier===2){ if(k%2) continue; const p=saPick(G,R,R.tier,c.mDay); if(!p) continue;   /* T1、T2：兩週一則（第 0、2、4……格＝8/7、8/21……12/11）*/
        if(p.t2!=null){ const it=S.SA_T2[p.t2], tag='y4_sa_t2_'+k; R.i2++; const L=it.L.map(t=>SISP(t)); L[L.length-1].ask={id:tag,until:T(c.mDay+7,0),opts:it.O.filter(o=>!o.if||o.if(G)).map(o=>({t:o.t}))}; PHONE.at(G,c.mDay,c.mH,L,tag); R.log.push({k,kind:'t2',tag}); }
        else { const L=p.t1!=null?S.SA_T1[p.t1]:S.SA_X[p.x].L, tag=(p.t1!=null?'y4_sa_t1_':'y4_sa_x_')+k; if(p.t1!=null) R.i1++; else R.ix=p.x+1; PHONE.at(G,c.mDay,c.mH,L.map(t=>SISP(t)),tag); R.log.push({k,kind:p.t1!=null?'t1':'x',tag,x:p.x}); } }
      else { const tag='y4_sa_v_'+k; R.vset=Math.min(R.i3|0,S.SA_V_SETS); R.i3=(R.i3|0)+1; plan(G,{id:tag,ev:'ev_sis_video',day:c.vDay,h:c.vH,late:1,place:'視訊',verb:'接起來',title:'和學姊視訊（她那邊週六晚上）',travel:'',travelH:0,back:'視訊結束。',sa:{k,set:R.vset}}); R.log.push({k,kind:'video',tag}); } } };   /* 每週視訊：三組各一次，之後 set 3＝只有旁白 */
  S.SA_S_SETS=3;   /* AA_395 2-1 短視訊三組 */
  S.sisShortSet=G=>{ const q=typeof OUT!=='undefined'?OUT.rec(G).filter(x=>/^y4_sa_s_/.test(x.id)&&x.sa).sort((a,b)=>b.day-a.day).find(x=>x.day<=G.day):null; return q?q.sa.sset:0; };
  S.sisVideoSet=G=>{ const q=typeof OUT!=='undefined'?OUT.rec(G).filter(x=>/^y4_sa_v_/.test(x.id)&&x.sa).sort((a,b)=>b.day-a.day).find(x=>x.day<=G.day):null; return q?q.sa.set:0; };
  S.sisInviteDue=G=>{ const d30=DK('2028-09-30'), F=G.flags; if(d30==null||G.day>d30||G.day+7<=d30||F.SIS_CANYON_ASK!=null||F.SIS_CANYON!=null) return false;   /* 9/30 以前最後一次視訊 */
    const R=S.saRec(G); if(R.tier!==3) return false; if(!(typeof DATE!=='undefined'&&DATE.stageNum&&DATE.stageNum('heroine_05')>=5)) return false;   /* AA_395 2-3（AA 10-23 08:4x 定第 2 條）：第 6 階 → 第 5 階以上＋9/1～9/30 接過至少兩次 T3 視訊 */
    { const a=DK('2028-09-01'); if(a==null||S.sisSepVideos(G)<2) return false; }
    if(!(typeof DATE!=='undefined'&&DATE.log&&(DATE.log(G,'heroine_05').count|0)>=2)) return false; if(S.saRate(G)<0.5) return false;   /* 第 6 階、出國前至少 2 次正式約會、回覆率 ≥ 0.5、正在 T3（BB_204 9-1）*/
    if(partners(G).length&&typeof TERMEND!=='undefined'&&TERMEND.willing&&!TERMEND.willing(G,'heroine_05').ok) return false; return true; };
  S.sisSepVideos=G=>{ const a=DK('2028-09-01'), b=DK('2028-09-30'); if(a==null||b==null||typeof OUT==='undefined') return 0; return OUT.rec(G).filter(q=>/^y4_sa_v_/.test(q.id)&&q.state==='done'&&q.day>=a&&q.day<=b).length; };   /* 9 月接過的 T3 視訊（短視訊不算）*/
  S.sisVideoAfter=function(G){ if(typeof SOCIAL!=='undefined') SOCIAL.adjust('heroine_05',{npcRom:1});   /* T3：她的戀愛 +1 */
    const F=G.flags, d30=DK('2028-09-30');
    if(F.SIS_CANYON_ASK==='wait'&&!PHONE.sent(G,'y4_sa_canyon_ask')) PHONE.post(G,Object.assign(SISP('九月底以前跟我說。'),{tag:'y4_sa_canyon_ask',ask:{id:'y4_sa_canyon_ask',until:T(d30,21),opts:[{t:'我去。',set:{SIS_CANYON_ASK:'go'}},{t:'這次不行。',set:{SIS_CANYON_ASK:'no'}}]}}));   /* 9/30 21:00 以前再問一次 */
    sisCanyonRules(G); };
  const sisCanyonRules=G=>{ const F=G.flags, d7=DK('2028-10-07'), d11=DK('2028-10-11');
    if(F.SIS_CANYON_ASK==='go'&&!outGet(G,'y4_sis_canyon')&&now(G)<T(d7,7.5)) plan(G,{id:'y4_sis_canyon',ev:'ev_sis_canyon',day:d7,h:7,late:0.5,place:'桃園機場',title:'秋假：去大峽谷找學姊',travel:'捷運約一小時（機票家裡出）',travelH:1,back:'回到臺北。'});
    if(S.saOn(G)&&!dating(G,'heroine_05')&&F.SIS_CANYON==null&&at(G,'2028-10-11',9)&&G.day<=d11+3){   /* 交往中不收朋友版的照片（saOn 交往中也開，AA_392 第 1 節）*/ const q=outGet(G,'y4_sis_canyon'); if(q&&q.state==='planned') return; S.sisCanyonMissed(G); } };
  S.sisCanyonMissed=function(G){ const F=G.flags, d11=DK('2028-10-11'); if(F.SIS_CANYON!=null) return; F.SIS_CANYON='photo';   /* 條件沒到、「這次不行」：她那邊 10/10 晚上（臺灣 10/11 早上）傳照片 */
    PHONE.at(G,d11,9,[SISP('（照片：峽谷的邊緣，四個交換生背對鏡頭站成一排）'),SISP('秋假和同學來大峽谷。風很大。'),SISP('……你以後有機會，一定要來一次。',{ask:{id:'y4_sa_canyon_photo',opts:[{t:'好漂亮。',say:[{from:'heroine_05',text:'嗯。照片拍不出來。'}]},{t:'學姊玩得開心。',say:[{from:'heroine_05',text:'好。你也是。'}]}]}})],'y4_sa_canyon_photo'); };

  /* ===================== 2-Y4-58 律師讀書小組（AA_253 第 11 節；2/23 成立、到 8/3）===================== */
  S.ytMember=G=>knows('heroine_03',G)&&!isEx(G,'heroine_03')&&(dating(G,'heroine_03')||stageAt('heroine_03','FRIEND'));
  S.groupKind=function(G){ const kx=dating(G,'kexin'), yt=S.ytMember(G); if(!kx&&!yt) return null; if(kx&&!yt) return 'kexin'; if(yt&&!kx) return 'yutong';
    const k=typeof ROM!=='undefined'&&ROM.knowsGF&&ROM.knowsGF(G,'heroine_03'), y=!dating(G,'heroine_03')||(typeof ROM!=='undefined'&&ROM.knowsOf&&ROM.knowsOf(G,'kexin','heroine_03'));   /* 三個人：兩人都知道彼此和祐廷的關係（BB_194 的知情規則）*/
    return k&&y?'three':'split'; };
  S.groupOn=G=>law(G)&&!delayed(G)&&(G.flags.Y4_PATH==='bar'||G.flags.BAR_REG===true);
  const GS='2029-02-23';
  const groupStartPhone=G=>{ const d=DK(GS), F=G.flags; if(d==null||G.day<d||G.day>d+1||F.BAR_GROUP_KIND!=null||!S.groupOn(G)||!at(G,GS,0)) return; const kind=S.groupKind(G); if(!kind){ F.BAR_GROUP_KIND='none'; return; }
    F.BAR_GROUP_KIND=kind; F.BAR_STUDY_GROUP=kind==='kexin'?['kexin']:(kind==='yutong'?['yutong']:['kexin','yutong']); F.BAR_GROUP_START=kind==='split'?'kexin':kind;   /* 分開讀：成立那一晚照可昕的視訊 */
    const st=F.BAR_GROUP_START, video=st==='kexin';
    plan(G,{id:'y4_bar_group_start',ev:'ev_bar_group_start',day:d,h:21.5,late:0.5,place:video?'視訊':'阿鳳麵店',verb:video?'接起來':undefined,title:'律師讀書小組'+(video?'（視訊）':'（阿鳳麵店）'),travel:video?'':'走過去約 15 分鐘',travelH:video?0:0.25}); };
  S.kxVday=G=>!!(G.flags.KX_VDAY&&G.flags.KX_VDAY[4]==='video');
  S.kxIn=G=>Array.isArray(G.flags.BAR_STUDY_GROUP)&&G.flags.BAR_STUDY_GROUP.includes('kexin')&&dating(G,'kexin');   /* 之後分手的人，那天以後不再出現 */
  S.ytIn=G=>Array.isArray(G.flags.BAR_STUDY_GROUP)&&G.flags.BAR_STUDY_GROUP.includes('yutong')&&!isEx(G,'heroine_03');
  /* 這一天的讀書：週一、三、五 21:00～23:00、週六 10:00～18:00，2/26～8/3，國定假日不排。回傳 {mode:'noodle'|'library'|'video'|'nccu', t0, t1} 或 null */
  S.session=function(G,day){ const F=G.flags, kind=F.BAR_GROUP_KIND; if(!S.groupOn(G)||!kind||kind==='none') return null; const a=DK('2029-02-26'), b=DK('2029-08-03'); if(a==null||day<a||day>b) return null;
    if(typeof CALENDAR!=='undefined'&&CALENDAR.holiday&&CALENDAR.holiday(day)) return null; const wd=typeof CALENDAR!=='undefined'?CALENDAR.dateOf(day).wd%7:0; if(![1,3,5,6].includes(wd)) return null;
    const sat=wd===6, t0=sat?10:21, t1=sat?18:23, kx=S.kxIn(G), yt=S.ytIn(G);
    if(kind==='three'&&kx&&yt) return {mode:'noodle',t0,t1,who:'three'};
    let w=kind; if(kind==='three'||kind==='split'){ w=(wd===1||wd===3)?'kexin':'yutong'; if(w==='kexin'&&!kx) w='yutong'; if(w==='yutong'&&!yt) w=kx?'kexin':null; }   /* 分開讀：週一、三可昕（視訊）、週五、六語彤（AI 解讀）*/
    if(w==='kexin'&&kx) return {mode:sat?'nccu':'video',t0,t1,who:'kexin'};   /* 只有可昕：週六在政大 */
    if(w==='yutong'&&yt) return {mode:sat?'library':'noodle',t0,t1,who:'yutong'};   /* 只有語彤：週六在總圖 */
    return null; };
  S.groupNightDue=function(G){ const F=G.flags; if(F.BAR_GROUP_LAST===G.day) return false; const s=S.session(G,G.day); if(!s||(s.mode!=='noodle'&&s.mode!=='library')) return false; const h=hh(G); if(h<s.t0||h>=s.t1) return false;
    return s.mode==='noodle'?G.zone==='noodle':LIB_ZONES.includes(G.zone); };
  S.groupLine=function(G,force){ const F=G.flags, s=S.session(G,G.day), w=force||(s&&s.who)||'kexin';
    if(w!=='kexin'&&!F.BAR_GROUP_YT_FIRST&&(w==='yutong')&&F.BAR_GROUP_KIND!=='three'&&s&&(s.mode==='noodle'||(s.mode==='library'&&F.BAR_GROUP_KIND==='yutong'))) return 'yt_first';   /* AA_350 N1：只有語彤、第一次是週六白天總圖的＝演白天版（第一句旁白換，其他兩句一樣）；分開讀的照舊留到她第一個麵店的晚上 */   /* 只有語彤（或分開讀的語彤那幾晚）：第一次那三句。是晚上的事（「十點，麵店拉下一半的鐵門」）：週六白天在總圖不演；分開讀的放在她的第一個週五晚上 3/2（AA_345 G6）*/
    const pick=w==='three'?(((F.BAR_GROUP_N|0)%2===0)?'kexin':'yutong'):w;
    if(w==='three') return S.threeLine(G,pick);   /* 三個人在麵店：AA_468 第 4 節 */
    return S.narrLine(G,pick==='kexin'?'k':'y'); };
  /* AA_468 第 2 節（企劃線 cd2dc7646）：第一輪 k1～k4、y1～y4 各一次照舊；之後換成旁白（R2Y4B_BAR_NARR，src/data/r2y4b_events.js），每句一次、照順序；週六那幾句只在週六；用完只留收尾那一句（平日、週六各一句）。
     回傳 k1～k4／kw1～kw7／ks1～ks2／kwe（平日收尾）／kse（週六收尾），語彤 y…同。
     第一輪是不是演完照 BAR_GROUP_KI／YI 有沒有到 4（KI、YI 照舊每一晚都加）。AA_468 第 4 節（企劃線 8a7f797ec）：旁白另開計數，不用「減 4」——
     平日 BAR_GROUP_KN／YN、週六 BAR_GROUP_KNS／YNS（舊存檔沒有＝0，從第 1 句看起）。
     三個人一起讀（who:'three'，都在麵店）＝S.threeLine：第一輪 k、y 輪流八次照舊（KI、YI 都到 4 才算演完）；之後另一組六句（R2Y4B_BAR_NARR.three），照順序各一次，
     週六那句只在週六、平日那句只在平日（輪到今天不能用的先留著，下一個能用的日子再演）；用完留收尾。用過的記 BAR_GROUP_3U（第幾句，0 起）*/
  S.BAR_NARR=typeof R2Y4B_BAR_NARR!=='undefined'?R2Y4B_BAR_NARR:null;
  S.narrLine=function(G,p){ const F=G.flags, N=S.BAR_NARR&&S.BAR_NARR[p==='k'?'kexin':'yutong'], c=(p==='k'?F.BAR_GROUP_KI:F.BAR_GROUP_YI)|0; if(!N||c<4) return p+((c%4)+1);
    if(S.isSat(G)){ const s=(p==='k'?F.BAR_GROUP_KNS:F.BAR_GROUP_YNS)|0; return s<N.sat.length?p+'s'+(s+1):p+'se'; }
    const n=(p==='k'?F.BAR_GROUP_KN:F.BAR_GROUP_YN)|0; return n<N.wd.length?p+'w'+(n+1):p+'we'; };
  S.threeLine=function(G,pick){ const F=G.flags, ki=F.BAR_GROUP_KI|0, yi=F.BAR_GROUP_YI|0, N=S.BAR_NARR&&S.BAR_NARR.three;
    if(!N||ki<4||yi<4){ if(pick==='kexin'&&ki>=4&&yi<4) pick='yutong'; else if(pick==='yutong'&&yi>=4&&ki<4) pick='kexin'; return pick==='kexin'?'k'+((ki%4)+1):'y'+((yi%4)+1); }   /* 第一輪（照舊）*/
    const used=Array.isArray(F.BAR_GROUP_3U)?F.BAR_GROUP_3U:[], sat=S.isSat(G);
    for(let i=0;i<N.list.length;i++){ if(used.includes(i)) continue; const w=N.when[i]; if((w==='sat'&&!sat)||(w==='wd'&&sat)) continue; return 't'+(i+1); }
    return sat?'tse':'twe'; };
  S.groupNightDone=function(G,mode){ const F=G.flags, ln=S.groupLine(G,mode==='video'?'kexin':undefined); F.BAR_GROUP_LAST=G.day; F.BAR_GROUP_N=(F.BAR_GROUP_N|0)+1;
    const inc=k=>{ F[k]=(F[k]|0)+1; };
    if(ln==='yt_first') F.BAR_GROUP_YT_FIRST=G.day;
    else if(ln[0]==='t'){ if(/^t\d+$/.test(ln)){ if(!Array.isArray(F.BAR_GROUP_3U)) F.BAR_GROUP_3U=[]; F.BAR_GROUP_3U.push(+ln.slice(1)-1); } }   /* 三個人的旁白（AA_468 第 4 節）*/
    else if(ln[0]==='k'){ inc('BAR_GROUP_KI'); if(ln[1]==='w') inc('BAR_GROUP_KN'); else if(ln[1]==='s') inc('BAR_GROUP_KNS'); }
    else { inc('BAR_GROUP_YI'); if(ln[1]==='w') inc('BAR_GROUP_YN'); else if(ln[1]==='s') inc('BAR_GROUP_YNS'); } };   /* 旁白另開計數（AA_468 第 4 節）*/
  const groupVideoRules=G=>{ const F=G.flags; if(!F.BAR_GROUP_KIND||F.BAR_GROUP_KIND==='none'||!evDone(G,'ev_bar_group_start')) return;
    if(typeof OUT!=='undefined'&&OUT.rec(G).some(q=>/^y4_bar_vid_/.test(q.id)&&q.state==='planned')) return;   /* 一次只排下一場 */
    for(let d=G.day;d<=G.day+7;d++){ const s=S.session(G,d); if(!s||(s.mode!=='video'&&s.mode!=='nccu')) continue; if(now(G)>T(d,s.t0+0.5)) continue; if(outGet(G,'y4_bar_vid_'+d)) continue; if(F.BAR_GROUP_LAST===d) continue;
      const nc=s.mode==='nccu'; plan(G,{id:'y4_bar_vid_'+d,ev:'ev_bar_group_video',day:d,h:s.t0,late:0.5,place:nc?'政大':'視訊',verb:nc?undefined:'接起來',no:'今天先不讀',title:'律師讀書小組（'+(nc?'政大':'視訊')+'）',travel:nc?'開車約 40 分鐘':'',travelH:nc?2/3:0,back:nc?'回到台大。':'視訊結束。'}); break; } };
  S.groupStop=function(G){ if(!graduated(G)) return null; for(let d=G.day;d<=G.day+7;d++){ const s=S.session(G,d); if(!s||(s.mode!=='noodle'&&s.mode!=='library')||G.flags.BAR_GROUP_LAST===d) continue; const t=T(d,s.t0); if(t>now(G)) return t; } return null; };   /* 畢業後篇：麵店、總圖那幾晚停一下 */
  const groupThreeRules=G=>{ const d=DK('2029-06-23'), F=G.flags; if(d==null||G.day<d-3||G.day>d||F.BAR_GROUP_KIND!=='three'||!S.kxIn(G)||!S.ytIn(G)||outGet(G,'y4_bar_three')) return;
    if(now(G)<T(d,19.25)) plan(G,{id:'y4_bar_three',ev:'ev_bar_group_three',day:d,h:19,late:0.25,place:'阿鳳麵店',title:'三個人的長桌（阿鳳麵店）',travel:'走過去約 15 分鐘',travelH:0.25}); };

  /* ===================== 2-Y4-61 沛珊大四下的學期末（6/8（五）台南；AA_254 第 6 節的心意邀約、女朋友的約會、第二次）===================== */
  const PSD='2029-06-08';
  S.ps61Kind=function(G){ if(typeof TERMEND==='undefined'||!law(G)) return null; const id='classmate_peishan'; if(dating(G,id)) return TERMEND_LINES.GF&&TERMEND_LINES.GF[id]?'gf':null;
    if(typeof STORY!=='undefined'&&STORY.presence&&STORY.presence(id,G).lost) return null;   /* 放榜後還沒重新聯絡上的玩家：她不先找人（AA_282 第 2 節；presence 的 lost）*/
    try{ return TERMEND.heartWhy(G,id,TERMEND.windowOf?TERMEND.windowOf('Y4S2'):null)===true?'heart':null; }catch(e){ return null; } };
  const ps61Phone=G=>{ const d=DK(PSD), F=G.flags, id='classmate_peishan'; if(d==null||G.day!==d||typeof TERMEND==='undefined') return;
    if(at(G,PSD,15)&&hh(G)<16.5&&!PHONE.sent(G,'y4_ps_te')){ const kind=S.ps61Kind(G); if(!kind) return; F.PS_TE_KIND=kind; const Lx=TERMEND_LINES;
      const again=TERMEND.rec(G).think[id]!=null, h=TERMEND.heart(id,'Y4S2')||{}, g=TERMEND.gf(id,'Y4S2')||{};
      const txt=[].concat(kind==='gf'?g.invite:(again?h.invite2:h.invite)).map(t=>typeof t==='function'?t(G):t);
      const opts=kind==='gf'?[{t:'好。',set:{PS_TE_GO:true}}]:[{t:'好。',set:{PS_TE_GO:true}},{t:'那天有約了。',say:h.decline?[{from:id,text:h.decline}]:[]}];
      const L=txt.map((t,i)=>Object.assign(P_(id,t),i===txt.length-1?{ask:{id:'y4_ps_te',until:T(d,16.5),opts}}:{})); PHONE.at(G,d,atH(G,d,15),L,'y4_ps_te'); }   /* 15:00「期末考完了！……」*/
    if(F.PS_TE_GO===true&&!outGet(G,'y4_ps_te')&&hh(G)<19) plan(G,{id:'y4_ps_te',ev:'ev_ps_termend_y4s2',day:d,h:18.5,late:1,place:'台南・她學校附近的簡餐',title:'學期末的飯：沛珊（台南）',travel:'高鐵（去台南）約兩小時',travelH:2,back:'搭最後一班高鐵回到臺北。',ps61:{kind:F.PS_TE_KIND}}); };
  S.psDinner=async function(GM,q){ const G=GM.G, id='classmate_peishan', kind=(q&&q.ps61&&q.ps61.kind)||G.flags.PS_TE_KIND; if(typeof TERMEND==='undefined'||typeof TERMEND_LINES==='undefined'||!kind) return false;
    const Lx=TERMEND_LINES, spec=kind==='gf'?TERMEND.gf(id,'Y4S2'):TERMEND.heart(id,'Y4S2'), P=Lx.PLACE.eatery||{}, A=adv(); if(!spec) return false; S.payFare(GM,'tainan');
    if(A&&A.begin) A.begin({background:'dark',right:{charId:id,expression:'neutral'}}); if(GM.caption) GM.caption('','台南・她學校附近的簡餐',2400);   /* 台南的底圖沒有：dark＋字幕（AA_282 第 5 節第 6 點）*/
    if(P.open) await GM.say(null,P.open); const tbl=typeof spec.table==='function'?spec.table(G):spec.table; if(tbl) await play(GM,id,[tbl]); if(P.close) await GM.say(null,P.close);
    G.flags.PS_TE_Y4S2={kind,day:G.day};
    if(kind==='heart'){ if(GM.caption) GM.caption('','台南・往她租的地方',2400); const r=await TERMEND.walkHome(GM,id,'Y4S2'); G.flags.PS_TE_Y4S2.result=r; }   /* 讓我想想＝7/14 台中那一次（2-Y4-46）*/
    return true; };

  /* ===================== 手機（STORY.PHONE_RULES，每 0.5 秒）===================== */
  S.phone=function(G,GM){ if(!G||!G.flags||!law(G)||typeof PHONE==='undefined') return; const F=G.flags;
    if(!F.PS_RECONNECT&&(F.PS_BACK_FIRST!=null||typeof F.PS_BACK_READ==='number')) F.PS_RECONNECT=true;   /* 放榜以後重新聯絡上：AA_319 1A-13 ⑦（6/2 學生的卡片照片）讀這個 */
    const y=d=>DK(d); const n=G.day; if(n<y('2028-08-01')) return;
    try{ usCanyonPhone(G); saWeekly(G); sisCanyonRules(G); }catch(e){ console.warn('R2Y4B 2028',e); }
    if(n<y('2029-02-20')) return;
    groupStartPhone(G); groupVideoRules(G); groupThreeRules(G);
    azaleaPhone(G); mxPhone(G); gradPhone(G); springPhone(G,GM); psOpenPhone(G); ytAuntPhone(G); kxBdayPhone(G); ballPhone(G); k25Phone(G); ps61Phone(G);
    julyRules(G); mxDepartRules(G); anRules(G); apartRules(G);
    if(F.ZR_BACK==null&&n>=y('2029-08-25')&&knows('heroine_02',G)) F.ZR_BACK=G.day; };   /* 2-Y4-47 第 4 節：芷若回國（8/25）以後記一次 */

  /* ===================== 每 0.5 秒（STORY.TICKS）：要開演的場面 ===================== */
  let busy=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['r2y4b3d:busy']=()=>{ busy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  S.tick=function(GM){ const G=GM&&GM.G; if(busy||!G||!G.flags||!law(G)) return false; S.trackLib(G);
    if(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G)) return false; if(typeof OUT!=='undefined'&&OUT.due&&OUT.due(G)) return false;   /* 出遊的「出發」先問 */
    const E=GM.E, P=E&&E.player; if(P&&(P.busy||(P.path&&P.path.length))) return false; if(GM.D&&GM.D.active) return false; if(typeof EVENTS!=='undefined'&&EVENTS.running) return false;
    const go=f=>{ busy=true; Promise.resolve().then(f).catch(e=>console.warn('R2Y4B',e)).finally(()=>{ busy=false; }); return true; };
    if(S.anCallDue(G)) return go(()=>S.anCall(GM));
    if(S.springPending(G)) return go(()=>S.springPrompt(GM));
    if(S.springCarDue(G)) return go(()=>S.springCar(GM));
    if(S.kxBdayDue(G)) return go(()=>S.kxBdayPrompt(GM));
    { const n=S.usFallDue(G); if(n) return go(()=>S.usFall(GM,n)); }
    return false; };

  /* ===================== 畢業後篇（PG）：訊息、場景表、停一下 ===================== */
  S.MSGS=[
    /* 2-Y4-43 期末最後一頓 */
    {tag:'y4_last_meal',at:['2029-06-22',17],cond:G=>grp(G),items:G=>[GR('zhe','今天 期末最後一頓'),GR('zhe','七點 麵店')],
      after:G=>plan(G,{id:'y4_last_meal',ev:'ev_last_meal_y4',day:DK('2029-06-22'),h:19,late:0.5,place:'阿鳳麵店',title:'期末最後一頓',travel:'走過去約 15 分鐘',travelH:0.25})},
    /* 2-Y4-44 可昕 K26 */
    {tag:'y4_kx_k26',at:['2029-07-05',21],cond:G=>dating(G,'kexin'),items:G=>[P_('kexin','禮拜六下午，我把行程表空出來了。'),P_('kexin','三點，老地方。',{ask:{id:'y4_kx_k26',until:T(DK('2029-07-07'),15),opts:[{t:'好。'}]}})],after:G=>S.k26Plan(G)},   /* AA_366 第 4 節 A7（企劃線 e6d4a198）：6/10 已經講好畢業以後的節奏（隔週日晚上），K26 不再說「重新排」*/
    /* 2-Y4-46 七月的心意邀約 */
    {tag:'y4_july',at:['2029-07-13',21],cond:G=>!!S.julyWho(G)&&S.julyOk(G,S.julyWho(G)),items:G=>S.julyMsg(G)},
    /* 2-Y4-47 芷若回國（畢業時和她交往中）*/
    {tag:'y5_zr_back',at:['2029-08-25',21],cond:G=>dating(G,'heroine_02'),items:G=>[P_('heroine_02','到了。先回台中一個禮拜。'),P_('heroine_02','下週六打烊以後，來店裡。')],
      after:G=>plan(G,{id:'y5_zr_cup',ev:'ev_zhiruo_back_cafe',day:DK('2029-09-01'),h:22,late:0.5,place:'兩點半 Café',title:'兩點半 Café（打烊以後）',travel:'走過去約 15 分鐘',travelH:0.25})},
    /* 2-Y4-48 明軒出發 */
    {tag:'y5_mx_depart',at:['2029-09-01',21],cond:G=>grp(G)&&knows('classmate_mingxuan',G),items:G=>{ const L=[GR('classmate_mingxuan','明天早上的飛機。'),GR('classmate_mingxuan','不用送。……真的不用。'),GR('zhe','幾點'),GR('classmate_mingxuan','七點。我說不用。'),GR('yu','我們去！！')];
      if(met(G,'classmate_mingxuan','FAMILIAR')) L[L.length-1].ask={id:'y5_mx_depart',until:T(DK('2029-09-02'),6),opts:[{t:'我也去。',set:{MX_DEPART_GO:true}}]}; return L; }},
    {tag:'y5_mx_photo',at:['2029-09-02',8+40/60],cond:G=>PHONE.sent(G,'y5_mx_depart')&&G.flags.MX_DEPART!=='airport',items:G=>[GR('classmate_mingxuan','（照片：機場的落地窗，一架飛機）'),GR('classmate_mingxuan','出發了。一年。八月見。'),GR('zhe','帶香腸回來')],after:G=>{ G.flags.MX_DEPART='msg'; }},
    /* 2-Y4-50 以安：哥大、紐約 */
    {tag:'y6_an_col',at:['2030-03-27',21],cond:G=>met(G,'heroine_01','FRIEND')&&!isEx(G,'heroine_01')&&contact(G,'heroine_01'),items:G=>[P_('heroine_01','明天晚上七點，麵店。'),P_('heroine_01','有事想說。',{ask:{id:'y6_an_col',until:T(DK('2030-03-28'),19),opts:[{t:'好。',set:{AN_COL_GO:true}},{t:'那天不行。',set:{AN_COL_GO:false},say:[{from:'heroine_01',text:'好。……那我寫在群組。'}]}]}})]},   /* 「那天不行。」的回話：AA_345 G6；3/28 22:00 群組那一則照常 */
    {tag:'y6_an_col_grp',at:['2030-03-28',22],cond:G=>grp(G)&&knows('heroine_01',G)&&!evDone(G,'ev_an_columbia'),items:G=>[GR('heroine_01','哥大上了。八月去紐約。')]},   /* 不到 FRIEND（和當面沒去的）*/
    {tag:'y6_an_ny_grp',at:['2030-08-10',21],cond:G=>grp(G)&&knows('heroine_01',G),items:G=>{ const L=[GR('zhe','明天以安的飛機'),GR('zhe','早上十點 桃園 要去的舉手')];
      if(met(G,'heroine_01','FRIEND')) L[1].ask={id:'y6_an_ny',until:T(DK('2030-08-11'),9),opts:[{t:'我去。',set:{AN_NY_GO:true}}]}; return L; }},
    {tag:'y6_an_ny_photo',at:['2030-08-11',11+40/60],cond:G=>knows('heroine_01',G)&&G.flags.AN_NY_SENDOFF!=='went'&&(met(G,'heroine_01','FRIEND')?contact(G,'heroine_01'):grp(G)),
      items:G=>{ const th=met(G,'heroine_01','FRIEND')?'p:heroine_01':NG; return ['（照片：登機證）','要登機了','到了再傳'].map(t=>({th,from:'heroine_01',text:t})); },after:G=>{ G.flags.AN_NY_SENDOFF='missed'; }},   /* 不到 FRIEND：只有群組 */
    /* 2-Y4-51 2030 重考：和可昕交往中，考前一晚 */
    {tag:'y5_kx_0802',at:['2030-08-02',22],cond:G=>S.retaker(G)&&dating(G,'kexin'),items:G=>[P_('kexin','明天你考。'),P_('kexin','……早點睡。我十點不打給你。')]},
    /* 2-Y4-52 交換延畢：明軒（10 月）、證書那天媽媽在 S.cert */
    {tag:'y5_mx_oct',at:['2029-10-15',21],cond:G=>delayed(G)&&met(G,'classmate_mingxuan','FAMILIAR'),items:G=>[P_('classmate_mingxuan','（照片：宿舍窗外的樹都黃了）'),P_('classmate_mingxuan','這裡十月就要穿大衣了。')]},
    /* 2-Y4-59 可昕 K27：第一份工作那一串之後 30 分鐘 */
    {tag:'y6_kx_shelf',at:['2030-10-01',21.5],cond:G=>!!G.flags.KX_SHELF&&dating(G,'kexin'),items:G=>[P_('kexin','（照片：政大讀書會的書架，最右邊那一格放了一本筆記）'),P_('kexin','讀書會書架最右邊那一格，我放了第一次開庭的筆記。')]} ];
  const ret=G=>S.retaker(G);
  S.STEPS=[
    /* 2-Y4-54 多段感情 */
    {id:'r2y4b_multi_pre',at:G=>T(DK('2029-05-21'),22),until:G=>T(DK('2029-05-28'),24),cond:G=>S.multiPreDue(G),ready:G=>G.zone==='dorm',run:GM=>S.multiPre(GM)},
    {id:'r2y4b_multi_y5',at:G=>T(DK('2030-05-25'),22),until:G=>T(DK('2030-06-01'),24),cond:G=>S.multiY5Due(G),run:GM=>S.multiY5(GM)},
    /* 2-Y4-46 7/14 白天（AA_345 G9 新寫）：有那天晚上的心意邀約（7/14 00:00 重判還成立）、報了國考的；10:00 演，17:00 以前沒空下來就不補（AA 沒給沒報國考的那一句）*/
    Object.assign(narrStep('r2y4b_july_day','2029-07-14',10,'（白天照樣在總圖。離一試還有二十一天。）',G=>{ const q=outGet(G,'y4_july'); return !!q&&q.state==='planned'&&G.flags.BAR_REG===true; }),{until:G=>T(DK('2029-07-14'),17)}),
    Object.assign(narrStep('r2y4b_july_day_nobar','2029-07-14',10,'（白天沒有排什麼事。畢業以後的第一個七月，一天變得很長。）',G=>{ const q=outGet(G,'y4_july'); return !!q&&q.state==='planned'&&G.flags.BAR_REG!==true; }),{until:G=>T(DK('2029-07-14'),17)}),   /* AA_350 N2：沒報國考的 7/14 白天（「離一試還有二十一天」不成立）*/
    /* 2-Y4-51 2030 重考的那一年（摘要日）*/
    {id:'r2y4b_retake_plan',at:G=>T(DK('2029-09-08'),21),until:G=>T(DK('2029-09-15'),24),cond:G=>ret(G)&&G.flags.RETAKE_STYLE==null,run:GM=>S.retakePlan(GM)},
    narrStep('r2y4b_rt_1020','2029-10-20',10,'（朋友們去考二試的那兩天，你在自習室讀民法。）',ret),
    narrStep('r2y4b_rt_1214','2029-12-14',20,'（群組很熱鬧。你把手機蓋起來，讀完那一章才打開。）',ret),
    narrStep('r2y4b_rt_0109','2030-01-09',20,'（你接了一個國中生的家教，週三晚上。）',ret),
    narrStep('r2y4b_rt_0308','2030-03-08',12.5,'（杜鵑又開了。你從椰林大道旁邊走過去，沒有停。）',ret),
    {id:'r2y4b_rt_reg',at:G=>T(DK('2030-05-09'),21),until:G=>T(DK('2030-05-11'),24),cond:ret,run:async GM=>{ const G=GM.G, t=typeof POSTGRAD_LINES!=='undefined'?POSTGRAD_LINES.REG.text:'國考報名，這週五截止。';
      if(typeof PHONE!=='undefined') PHONE.post(G,{th:'sys',text:t,tag:'y5_reg_2030'}); await scene(GM,async()=>{ await GM.say(null,t); await GM.say(null,'（你按了報名。）'); }); G.flags.BAR_REG=true; }},
    /* 2-Y4-52 交換延畢 Y5S1 */
    {id:'r2y4b_y5_plan',at:G=>T(DK('2029-09-03'),9),until:G=>T(DK('2029-09-10'),24),cond:G=>delayed(G)&&G.flags.Y5_DAYS==null,run:GM=>S.y5Plan(GM)},
    {id:'r2y4b_y5_intern1',at:G=>T(DK('2029-09-11'),10),until:G=>T(DK('2029-09-13'),24),cond:internOn,run:GM=>S.intern(GM,0)},
    {id:'r2y4b_y5_intern2',at:G=>T(DK('2029-10-16'),10),until:G=>T(DK('2029-10-18'),24),cond:internOn,run:GM=>S.intern(GM,1)},
    {id:'r2y4b_y5_intern3',at:G=>T(DK('2029-11-20'),10),until:G=>T(DK('2029-11-22'),24),cond:internOn,run:GM=>S.intern(GM,2)},
    {id:'r2y4b_y5_cert',at:G=>T(DK('2030-01-21'),10),until:G=>T(DK('2030-01-24'),24),cond:G=>delayed(G)&&!(fdOnly(G)&&typeof FD!=='undefined'&&FD.certLate(G)),run:GM=>S.cert(GM)},   /* 重修不到三堂：證書延到 2030-06（日期卡帶過，AA_421 1-5）*/
    {id:'r2y4b_grad_exam_2030',at:G=>T(DK('2030-02-16'),9),until:G=>T(DK('2030-02-17'),12),cond:G=>S.gradExam2030Due(G),run:GM=>S.gradExam(GM,2030)},
    {id:'r2y4b_grad_result_2030',at:G=>T(DK('2030-03-15'),15),until:G=>T(DK('2030-03-17'),24),cond:G=>G.flags.GRAD_EXAM_2030===true,run:GM=>S.gradResult2030(GM)},
    {id:'r2y4b_grad_retry_2030',at:G=>T(DK('2030-03-15'),21),until:G=>T(DK('2030-03-22'),24),cond:G=>G.flags.GRAD_EXAM_2030===true&&G.flags.GRAD_EXAM_RESULT==='fail'&&G.flags.GRAD_RETRY2==null&&!G.flags.GRAD_QUIT,run:GM=>S.gradRetry2030(GM)},
    {id:'r2y4b_grad_exam_2031',at:G=>T(DK('2031-02-15'),9),until:G=>T(DK('2031-02-16'),12),cond:G=>G.flags.GRAD_RETRY2===true,run:GM=>S.gradExam(GM,2031)} ]
    .concat(tellSteps('tell29','MULTI_TELL29'),tellSteps('tell30','MULTI_TELL30'),apartCallSteps(2029),apartCallSteps(2030));   /* AA_346 的電話版（第三次沒到）*/
  S.stop=function(G){ let best=null; const c=t=>{ if(t!=null&&t>now(G)&&(best==null||t<best)) best=t; }; c(S.barStop(G)); c(S.groupStop(G)); return best; };

  /* ===================== 掛上去 ===================== */
  if(typeof STORY!=='undefined'){ if(Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push((G,GM)=>S.phone(G,GM)); if(Array.isArray(STORY.TICKS)) STORY.TICKS.push((GM,dt)=>S.tick(GM,dt)); }
  if(typeof ACTIVITIES!=='undefined'&&Array.isArray(ACTIVITIES.list)&&!ACTIVITIES.list.some(a=>a.id==='act_bar_study')) ACTIVITIES.list.push(S.ACT);
  if(typeof CLS!=='undefined'&&Array.isArray(CLS.IN_CLASS)){ const f=(GM,it)=>S.journal(GM,it); f.due=(G,it)=>!!it&&!!it.c&&it.c.id==='legal_research'&&!it.exam&&law(G)&&it.term==='Y4S2'&&it.week===15&&!G.flags.LR_JOURNAL_Y4; CLS.IN_CLASS.push(f); }   /* due：學期中的快轉（src/semff3d.js）停在這一堂前面 */
  if(typeof PG!=='undefined'){ if(Array.isArray(PG.MSGS)) for(const m of S.MSGS) if(!PG.MSGS.some(x=>x.tag===m.tag)) PG.MSGS.push(m); if(Array.isArray(PG.STEPS)) for(const s of S.STEPS) if(!PG.STEPS.some(x=>x.id===s.id)) PG.STEPS.push(s); if(Array.isArray(PG.stops)) PG.stops.push(G=>S.stop(G)); S.patchEpilogue(); }
  if(typeof NOODLE_CLOSED!=='undefined'&&NOODLE_CLOSED.door&&!NOODLE_CLOSED._r2y4b){ const orig=NOODLE_CLOSED.door; NOODLE_CLOSED._r2y4b=true;
    NOODLE_CLOSED.door=async function(GM){ const G=GM.G; if(S.aunTrip(G)&&!(NOODLE_CLOSED.storyDue&&NOODLE_CLOSED.storyDue(G))){ GM.sceneBegin(); try{ await GM.say(null,S.AUNT_DOOR); } finally { GM.sceneEnd(); } return true; } return orig.apply(this,arguments); }; }   /* 2029-04-19～25 阿姨跟團出國（語彤 16b）*/
  /* BCG-39：cg_approved/ README 的 key 是 cg_no_plan_heroine05，postgrad_lines.js 寫的是 cg_this_time_heroine05——哪一個登錄了，另一個也指到同一張 */
  if(typeof CG_REGISTRY!=='undefined'){ const a='cg_no_plan_heroine05', b='cg_this_time_heroine05'; if(CG_REGISTRY[a]&&!CG_REGISTRY[b]) CG_REGISTRY[b]=CG_REGISTRY[a]; else if(CG_REGISTRY[b]&&!CG_REGISTRY[a]) CG_REGISTRY[a]=CG_REGISTRY[b]; }
  return S;
})();
