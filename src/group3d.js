/* ===== 1C 群戲（AA_324，AA-C 2026-10-20 定稿 c41f4305；AA_314 第 1 輪的最後一組）：邀約、出發、沒去的群組照片、旗標 =====
   台詞在 data/group_events.js（GROUP_EVENTS，照 AA_324 不改字）。掛在 STORY.PHONE_RULES（手機規則：每一輪）、STORY.TICKS（春假三選一的選單）。
   1C-01 春假（大二版）2027-03-30 21:00 麵店團群組（Alison、語彤、阿哲、柏翰）＋交往中 21:30 可昕（大二版的兩則，AA_336 C8；流程照大一 kx_spring_y1）→ 兩則都到了才問三選一（期限 4/1）：
         麵店團（4/4 一天，回家取車）／和可昕（4/3，BB_97 9-12）／留在宿舍；4/1 以前沒回＝'none'。沒去麵店團的群組成員 4/4 21:30 群組照片。記 SPRING_Y2
   1C-02 中秋＝以安的生日：2027-09-14 21:00 阿哲在群組、9/15 18:00 公館的河濱；沒去＝以安的照片兩則
   1C-03 寄到英國的那一箱：2027-12-25 21:00 阿哲在群組（兩則）、12/26 18:30 麵店；沒去＝22:00 群組照片、XMAS_Y3_BOX 'missed'；
         這學期接了阿哲的期末飯（TERMEND）＝這一場就算那一頓（AA_180）
   1C-04 2028-04-28 21:00 群組「明天晚上七點，冠軍賽 來喊」；23:00 哲 4（和阿哲 FRIEND 以上）：在宿舍＝回「（下樓）」十分鐘後宿舍樓下的便利商店外、
         在臺北的外面＝回「我在外面。二十分鐘回宿舍。」二十分鐘後同一個地方（AA_336 C10）、在家＝回「我在家。」視訊、人不在臺北、日本路線＝視訊；不回＝沒有。
         4/29 19:00 冠軍賽（日本路線＝直播 FINAL_GAME_Y3 'stream'＋一句旁白（AA_336 C11），賽後明軒傳訊息）；沒去＝21:30 群組照片
   1C-05 2028-06-02 21:00 子晴私訊（台灣、美國路線；和她 FRIEND 以上；交往中四句）；回「去。」＝6/3 09:00～11:00 椰林大道；沒去上午＝12:30 自拍三則；
         芷若 Z12＝6/3 14:00 以後第一次進 Café（和她 FAMILIAR 以上）；日本路線只有照片。記 GRAD_ZQ_ZR
   1C-06 2029-02-22 17:00 阿哲把麵店團改名「最後一學期」＋揪、19:00 麵店；2/25 21:00 改回「麵店團」；沒去＝21:30 群組照片。記 LAST_TERM_DINNER
   群組照片的傳送人照大二群戲（story3d.js 的 v3）：邀約的人。測試：node tests/group_events_unit.js */
'use strict';
const GROUP=(function(){
  const S={};
  const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const T=(d,h)=>d*24+h;
  const knows=(id,G)=>typeof STORY!=='undefined'&&!!STORY.knows&&STORY.knows(id,G);
  const atLeast=(id,st)=>typeof SOCIAL!=='undefined'&&!!SOCIAL.STAGES&&SOCIAL.STAGES.indexOf(SOCIAL.stage(id))>=SOCIAL.STAGES.indexOf(st);
  const met=(G,id,st)=>knows(id,G)&&atLeast(id,st);   /* 先看認識（不替沒有紀錄的人建一筆空的關係），才問階段 */
  const dating=(G,id)=>{ const F=(G&&G.flags)||{}, R=F.romance||{}; return F['dating_'+id]===true||!!(R[id]&&R[id].status==='dating'); };
  const grp=G=>typeof PHONE!=='undefined'&&PHONE.inGroup(G,'noodle_team');
  const inJP=(G,day)=>typeof STORY!=='undefined'&&!!STORY.route&&STORY.route(G)==='JP'&&!!STORY.abroad&&STORY.abroad(day==null?G:Object.assign({},G,{day}));
  const atHome=G=>typeof HOME!=='undefined'&&!!HOME.at&&HOME.at(G);
  const msgIn=(G,tag)=>(G.msgs||[]).some(m=>m.tag===tag);
  const evDone=(G,id)=>!!(G.events&&G.events.done&&G.events.done[id]);
  const atH=(G,d,h)=>G.day===d?Math.max(h,G.hour):h;   /* 當天就是現在（不早於 h）；隔天才補的照原本的時間 */
  const tw=(G,d,h)=>h+(typeof STORY!=='undefined'&&STORY.tzOffset?STORY.tzOffset(G,d):0);   /* 台灣時間 → 手機的當地時間（人在日本＋1；AA_341 J-S13、AA_342 C6）*/
  const NG='g:noodle_team';
  const msg=(th,from)=>t=>({th,from,text:t});
  const Z=msg(NG,'zhe');
  const out=()=>typeof OUT!=='undefined'?OUT:null;
  const plan=(G,o)=>{ const O=out(); return !!O&&O.plan(G,o); };
  const outGet=(G,id)=>{ const O=out(); return O?O.get(G,id):null; };
  /* 人物面板的記憶名稱（AN_BDAY_POMELO、ZHE_SAID_IT、SAW_HIM_TRY）登記在 social3d.js 的 MEMORY_LABEL */

  /* ---------- 1C-01 春假（大二版）---------- */
  const SP={inv:'2027-03-30',dl:'2027-04-01',d0:'2027-04-03',trip:'2027-04-04'};
  S.springDays=()=>({inv:DK(SP.inv),dl:DK(SP.dl),d0:DK(SP.d0),trip:DK(SP.trip)});
  /* 該問了：收到的邀約都到了（麵店團群組的、交往中可昕的）、還沒選、沒過 4/1、「晚一點再決定」的時間到了（照大一 S.springPending）*/
  S.springPending=function(G){ const F=G.flags||{}, D=S.springDays(); if(F.SPRING_Y2!=null||D.inv==null||G.day<D.inv||G.day>D.dl) return false;
    const g=grp(G), kx=!!F.dating_kexin; if(!g&&!kx) return false; if(g&&!msgIn(G,'y2s2_spring_grp')) return false; if(kx&&!msgIn(G,'y2s2_spring_kx')) return false;
    return F.spring2AskAt==null||T(G.day,G.hour)>=F.spring2AskAt; };
  /* 選單（介面文字，照大一的寫法）：跟麵店團出去（在群組才有）／和可昕開車旅行（交往中才有）／留在宿舍／晚一點再決定（隔天同一時間再問）*/
  S.springPrompt=async function(GM){ const G=GM.G, F=G.flags, O=[];
    if(grp(G)) O.push({t:'春假：跟阿哲他們出去',hint:'4/4，一天來回（你開車）',k:'noodle'});
    if(F.dating_kexin) O.push({t:'春假：和可昕開車旅行',hint:'4/3，一天來回',k:'kexin'});
    O.push({t:'春假：留在宿舍',k:'dorm'},{t:'晚一點再決定',hint:'明天再問',k:'later'});
    let i=O.length-1; GM.sceneBegin(); try{ i=await GM.choose(O.map(o=>({t:o.t,hint:o.hint}))); } finally { GM.sceneEnd(); }
    const k=(O[i]||O[O.length-1]).k; if(k==='later'){ F.spring2AskAt=T(G.day+1,G.hour); return k; } S.springChoose(GM,k); return k; };
  /* 選了以後：出遊（麵店團 4/4 回家取車；可昕 4/3 照大一那一趟）、可昕的回覆與照片（BB_97 9-12：選麵店團或宿舍＝「好。那暑假再去。」、春假一張她和予樂在讀書會的照片＋一句，AA_336 C13）、
     沒去麵店團的群組照片。silent：4/1 以前沒回（'none'，可昕不回）*/
  S.springChoose=function(GM,k,o){ o=o||{}; const G=GM.G, F=G.flags, D=S.springDays(), kx=!!F.dating_kexin, g=grp(G); F.SPRING_Y2=k;
    const KX=(day,h,L,tag)=>PHONE.at(G,day,h,L.map(t=>({th:'p:kexin',from:'kexin',text:t})),tag);
    if(k==='noodle') plan(G,{id:'ndl_trip_y2s2',ev:'ev_spring_y2_noodle',day:D.trip,h:8,place:'臺北的家（先回家取車）',title:'春假：開車載阿哲他們',travel:'回家取車約 30 分鐘',travelH:0.5,back:'回到台北。'});
    if(k==='kexin') plan(G,{id:'kx_trip_y2s2',ev:'ev_kexin_trip_spring_y2',day:D.d0,h:7+40/60,place:'木柵大學校門口（先回家取車）',title:'春假：開車旅行',travel:'回家取車約 30 分鐘，再開到木柵大學接她',travelH:40/60,back:'送她回木柵大學，再把車開回家。'});
    if(kx&&(k==='noodle'||k==='dorm')){ if(!o.silent) KX(G.day,G.hour+0.1,['好。那暑假再去。'],'kx_spring2_reply'); KX(D.d0,21.5,['📷（她和予樂在讀書會的長桌，桌上兩疊講義）','春假。我們在讀書。'],'kx_spring2_photo'); F.KX_TRIP_DEFERRED='summer'; }
    S.springPick(G,k,o);
    if(k!=='noodle'&&g) S.springPhoto(G); };
  /* 群組 @ 了你兩次「誰開車」（3/23、3/30），選完祐廷在群組回一句、有人回（AA_461 第 1 節；句子跟大一下的 spring_pick_msg 不一樣）；
     4/1 以前沒回（'none'）＝4/2 21:00 柏翰一句（接得上 4/4 的海邊照片）。只給在群組裡、收到 3/30 那則的玩家 */
  S.SPRING_PICK={noodle:[['player','我開。'],['zhe','司機有了！']],kexin:[['player','春假我有約了。'],['classmate_bohan','那我租車。']],dorm:[['player','這次我不去。'],['classmate_bohan','那我租車。']]};
  /* 選可昕：私訊回她（AA_461 第 6 節④：大一下有「好。我們去。」，大二下補；她問的是 y2s2_spring_kx「春假。今年也開車？」；群組那一句照上表一起傳）*/
  S.SPRING_PICK_KX=[['player','好。今年也開。'],['kexin','嗯。七點四十，校門口。']];
  S.springPick=function(G,k,o){ if(typeof PHONE==='undefined') return;
    if(k==='kexin'&&!o.silent&&PHONE.sent(G,'y2s2_spring_kx')) PHONE.at(G,G.day,G.hour+0.05,S.SPRING_PICK_KX.map(([from,text])=>from==='player'?{th:'p:kexin',from,who:null,text}:{th:'p:kexin',from,text}),'y2s2_spring_kx_pick');
    if(!grp(G)||!PHONE.sent(G,'y2s2_spring_grp')) return;
    const L=!o.silent&&S.SPRING_PICK[k]; if(L) PHONE.at(G,G.day,G.hour+0.05,L.map(([from,text])=>from==='player'?{th:NG,from,who:null,text}:{th:NG,from,text}),'y2s2_spring_pick');
    const d2=DK('2027-04-02'); if(k==='none'&&o.silent&&d2!=null) PHONE.at(G,d2,21,[{th:NG,from:'classmate_bohan',text:(G.name||'祐廷')+'沒回。我租車了。'}],'y2s2_spring_none'); };
  /* 麵店團那一趟（4/4）誰去（AA_375 第 5、14 項）：祐廷去＝認識的那幾個（事件照「認識沒」）；祐廷沒去、在群組裡（邀約那則傳了）＝麵店團六個人照樣去（S.springPhoto）；沒有邀約＝沒有這一趟 */
  S.SPRING_TEAM=['heroine_03','zhe','heroine_01','yu','classmate_bohan','classmate_xinci'];
  S.springRiders=G=>S.SPRING_TEAM.filter(id=>knows(id,G));   /* 祐廷去的那一趟：認識的那幾個（ev_spring_y2_noodle 的「只有認識的人在場」）*/
  S.springGoers=function(G){ const F=(G&&G.flags)||{}; if(!G||(G.stage||'law')!=='law') return []; if(F.SPRING_Y2==='noodle') return S.springRiders(G);
    return F.SPRING_Y2!=null&&typeof PHONE!=='undefined'&&PHONE.sent(G,'y2s2_spring_grp')?S.SPRING_TEAM.slice():[]; };
  /* 車上最多三個人（AA_375 第 5 項）：照熟悉度（fam 高的先；一樣照上面的順序）；其他人搭火車，下午會合。出發前記 SPRING_Y2_CAR（ev_spring_y2_noodle 的 beforeOuting）*/
  S.springCarOf=function(G){ const fam=id=>typeof SOCIAL!=='undefined'&&SOCIAL.rel?(+SOCIAL.rel(id).fam||0):0;
    return S.springRiders(G).map((id,i)=>({id,i,f:fam(id)})).sort((a,b)=>b.f-a.f||a.i-b.i).slice(0,3).map(x=>x.id); };
  S.springSeat=G=>{ G.flags.SPRING_Y2_CAR=S.springCarOf(G); return G.flags.SPRING_Y2_CAR; };
  S.springInCar=(G,id)=>{ const C=Array.isArray(G.flags&&G.flags.SPRING_Y2_CAR)?G.flags.SPRING_Y2_CAR:S.springCarOf(G); return C.includes(id); };
  S.springTrain=G=>S.springRiders(G).length>3;
  /* 麵店團出遊那天，去的人作息停掉（AA_375 第 14 項；story3d.js 的 schedEnt 先問這裡）：4/4 07:30～20:00（08:00 出發、一天來回）。柏翰的北投、以安的美術館那天不排 */
  S.tripAway=function(G,id){ const D=S.springDays(); if(!G||D.trip==null||G.day!==D.trip||!S.SPRING_TEAM.includes(id)) return null; const hh=((G.hour%24)+24)%24; if(hh<7.5||hh>=20) return null;
    if(!S.springGoers(G).includes(id)) return null; return {zone:null,act:'out',away:'和阿哲他們去市場和海邊',days:[G.weekday],from:7.5,to:20,spring:true}; };
  S.springPhoto=G=>{ const D=S.springDays(); if(D.trip!=null&&grp(G)) PHONE.at(G,D.trip,21.5,[{th:NG,from:'yu',text:'📷（海邊。一排人站在堤防上，阿哲在最後面，還是最高。）'}],'y2s2_spring_photo'); };
  S.springPhone=function(G,GM){ const F=G.flags, D=S.springDays(); if(D.inv==null||G.day<D.inv||G.day>D.trip+1) return; const now=T(G.day,G.hour);
    if(grp(G)&&G.day<=D.dl&&now>=T(D.inv,21)){ const Y=msg(NG,'yu'), W=msg(NG,'heroine_03'), B=msg(NG,'classmate_bohan');
      PHONE.at(G,D.inv,atH(G,D.inv,21),[Y('春假那個'),Y('語彤說行程她排'),W('第一站是市場。'),Z('市場？'),W('……田野課的。我想自己去看一次。'),B('誰開車？'),Z('@'+(G.name||'祐廷'))],'y2s2_spring_grp'); }
    if(F.dating_kexin&&G.day<=D.dl&&now>=T(D.inv,21.5)) PHONE.at(G,D.inv,atH(G,D.inv,21.5),[{th:'p:kexin',from:'kexin',text:'春假。今年也開車？'},{th:'p:kexin',from:'kexin',text:'行程表做好了。……這次吃的只有一頁。'}],'y2s2_spring_kx');   /* 大二版的邀約（AA_336 C8，不沿用大一的句子）；流程照大一 kx_spring_y1 */
    if(G.day>D.dl&&F.SPRING_Y2==null&&(PHONE.sent(G,'y2s2_spring_grp')||PHONE.sent(G,'y2s2_spring_kx'))) S.springChoose(GM,'none',{silent:true}); };

  /* ---------- 1C-02 中秋＝以安的生日 ---------- */
  const MA={inv:'2027-09-14',d:'2027-09-15'};
  /* 知道她生日（AA_336 C9：三種有一種就算）：她的閒聊階梯 AN5_BIRTHDAY、交往中、2026 年傳過她生日快樂（MSG.rec(G).bday['heroine_01:2026']，src/msg3d.js 傳 bday 時記）*/
  S.knowsAnBday=G=>(typeof SOCIAL!=='undefined'&&SOCIAL.has('heroine_01','AN5_BIRTHDAY'))||dating(G,'heroine_01')||(typeof MSG!=='undefined'&&!!MSG.rec&&MSG.rec(G).bday['heroine_01:2026']!=null);
  S.midautumnPhone=function(G){ const di=DK(MA.inv), d=DK(MA.d); if(di==null||!grp(G)||G.day<di||G.day>d) return; if(T(G.day,G.hour)<T(di,21)) return;
    PHONE.at(G,di,atH(G,di,21),[Z('明天中秋，河濱，六點')],'y3_midautumn_ask');
    if(!outGet(G,'y3_midautumn')&&(G.day<d||G.hour<18.25)) plan(G,{id:'y3_midautumn',ev:'ev_midautumn_y3',day:d,h:18,late:0.25,place:'公館的河濱',title:'中秋（河濱）',travel:'走過去約 15 分鐘',travelH:0.25}); };
  S.midautumnPhoto=G=>{ const d=DK(MA.d), A=msg(NG,'heroine_01'); if(d!=null&&grp(G)) PHONE.at(G,d,21.5,[A('（照片：柚子上插著蠟燭）'),A('謝謝。柚子也可以。')],'y3_midautumn_photo'); };

  /* ---------- 1C-03 寄到英國的那一箱 ---------- */
  const XM={inv:'2027-12-25',d:'2027-12-26'};
  S.xmasBoxPhone=function(G){ const di=DK(XM.inv), d=DK(XM.d); if(di==null||!grp(G)||G.day<di||G.day>d) return; if(T(G.day,G.hour)<T(di,21)) return;
    PHONE.at(G,di,atH(G,di,21),[Z('明天六點半麵店'),Z('帶一樣東西 不要超過手掌大')],'y3_xmas_box_ask');
    if(!outGet(G,'y3_xmas_box')&&(G.day<d||G.hour<18.75)) plan(G,{id:'y3_xmas_box',ev:'ev_xmas_y3_box',day:d,h:18.5,late:0.25,place:'阿鳳麵店',title:'寄到英國的那一箱',travel:'走過去約 15 分鐘',travelH:0.25}); };
  S.xmasBoxPhoto=G=>{ const d=DK(XM.d); if(G.flags.XMAS_Y3_BOX==null) G.flags.XMAS_Y3_BOX='missed'; if(d!=null&&grp(G)) PHONE.at(G,d,22,[Z('📷（一個紙箱，上面寫著倫敦的地址。）')],'y3_xmas_box_photo'); };
  /* 這學期接了阿哲的期末飯（BB_203；TERMEND 的 picked）而且還沒吃：這一場就算那一頓（AA_180 Y3S1-XMAS），排好的那一頓不再出發 */
  S.xmasBoxAfter=function(G){ if(typeof TERMEND==='undefined'||!TERMEND.rec) return; const R=TERMEND.rec(G,'Y3S1'); if(!R.picked||R.picked.who!=='zhe'||R.done) return;
    R.done={who:'zhe',kind:R.picked.kind,day:G.day,via:'ev_xmas_y3_box'}; const q=outGet(G,'te_Y3S1'); if(q&&q.state==='planned') q.state='done'; };

  /* ---------- 1C-04 哲 4＋冠軍賽 ---------- */
  const FG={d:'2028-04-28',g:'2028-04-29'};
  S.finalDays=()=>({d:DK(FG.d),g:DK(FG.g)});
  /* 人不在臺北（AA_336 C10「例如出遊」）：捷運自由出行去了臺北市以外的地方（景點的 area）。學期中其他不在臺北的時候（出遊、去她的縣市）都在劇情裡，手機規則不跑 */
  S.awayFromTaipei=G=>{ if(typeof TRIP==='undefined'||!TRIP.at||!TRIP.at(G)||!TRIP.spot||!G.trip) return false; const s=TRIP.spot(G.trip.spot); return !!(s&&s.area&&s.area!=='臺北市'); };
  S.planFinal=G=>{ const g=DK(FG.g); if(g==null||inJP(G,g)||outGet(G,'y3_final')||!(G.day<g||(G.day===g&&G.hour<19.25))) return false;
    return plan(G,{id:'y3_final',ev:'ev_final_game_y3',day:g,h:19,late:0.25,place:'新體育館',title:'系籃冠軍賽',travel:'走過去約 10 分鐘',travelH:1/6}); };
  S.finalPhone=function(G){ const F=G.flags, {d,g}=S.finalDays(); if(d==null||G.day<d||G.day>g+1) return; const now=T(G.day,G.hour), jp=inJP(G,g);
    if(grp(G)&&G.day<=g&&now>=T(d,tw(G,d,21))){ PHONE.at(G,d,atH(G,d,tw(G,d,21)),[Z('明天晚上七點，冠軍賽 來喊')],'y3_final_ask'); S.planFinal(G); }
    /* 23:00 哲 4（AA_40；AA_324 第 6 節：ask 下樓／我在家／不回）：日本路線＝阿哲打視訊（台灣 23:00＝日本 0:00）*/
    if((jp?(now>=T(d,24)&&now<T(d,26)):(G.day===d&&now>=T(d,23)))&&F.ZHE4_ASKED==null&&met(G,'zhe','FRIEND')){ F.ZHE4_ASKED=d; const away=!jp&&S.awayFromTaipei(G);   /* 日本路線：台灣 23:00＝日本 0:00（AA_341 J-S13）*/
      if(jp||away){ F.ZHE4_REPLY=jp?'jp':'away'; plan(G,{id:'y3_zhe4',ev:'ev_zhe_said_it',day:d,h:Math.max(jp?24:23,now-T(d,0)),late:1,place:'視訊',title:'阿哲的視訊',verb:'接起來',must:true,travel:'',travelH:0,back:'視訊結束。'}); }   /* 人不在臺北＝在家的視訊版（AA_336 C10）；祐廷這時候不回話，照日本路線：阿哲直接打視訊（AA_355 第 2 節：AA 看過、照用）*/
      else { const home=atHome(G), dorm=['dorm','dorm_hall'].includes(G.zone);
        const opts=home?[{t:'我在家。',set:{ZHE4_REPLY:'home'}}]:dorm?[{t:'（下樓）',post:false,set:{ZHE4_REPLY:'down'}}]:[{t:'我在外面。二十分鐘回宿舍。',set:{ZHE4_REPLY:'out'},say:[{from:'zhe',text:'好 我在樓下'}]}];   /* 不在宿舍、也不在家（在臺北的外面，AA_336 C10）*/
        PHONE.at(G,d,atH(G,d,23),[{th:'p:zhe',from:'zhe',text:'你在宿舍嗎',ask:{id:'y3_zhe4',until:T(d,24),opts}}],'y3_zhe4'); } }
    if(['down','home','out'].includes(F.ZHE4_REPLY)&&!outGet(G,'y3_zhe4')&&now<T(d,24.5)){ const R=F.ZHE4_REPLY;
      plan(G,R==='down'?{id:'y3_zhe4',ev:'ev_zhe_said_it',day:G.day,h:G.hour+1/6,late:0.5,place:'宿舍樓下的便利商店外',title:'阿哲（宿舍樓下）',must:true,travel:'走下樓',travelH:1/6,back:'回到房間。'}
             :R==='out'?{id:'y3_zhe4',ev:'ev_zhe_said_it',day:G.day,h:G.hour+1/3,late:0.5,place:'宿舍樓下的便利商店外',title:'阿哲（宿舍樓下）',must:true,travel:'走回宿舍 約 20 分鐘',travelH:1/3,back:'回到房間。'}   /* 二十分鐘後（回的時間 23:00＝23:20），照當面版；演完回到房間（group_events.js afterOuting）*/
             :{id:'y3_zhe4',ev:'ev_zhe_said_it',day:G.day,h:G.hour,late:0.5,place:'視訊',title:'阿哲的視訊',verb:'接起來',must:true,travel:'',travelH:0,back:'視訊結束。'}); }
    /* 日本路線：直播（台灣 19:00＝日本 20:00）；賽後明軒傳訊息（和他 FAMILIAR 以上；BB_98 5-2）*/
    if(jp&&(grp(G)||F.ZHE4_ASKED!=null)&&now>=T(g,tw(G,g,19))&&F.FINAL_GAME_Y3==null) F.FINAL_GAME_Y3='stream';
    if(jp&&F.FINAL_GAME_Y3==='stream'&&now>=T(g,tw(G,g,20+40/60))&&met(G,'classmate_mingxuan','FAMILIAR')){ const X=msg('p:classmate_mingxuan','classmate_mingxuan');
      PHONE.at(G,g,atH(G,g,tw(G,g,20+40/60)),[X('冠軍。我九點家教，先走了。'),Object.assign(X('……你看到了喔。我今天很用力。'),{ask:{id:'y3_mx_stream',until:T(g+2,0),opts:[
        {t:'恭喜！',set:{MX_EGG_JP:true},say:[{from:'classmate_mingxuan',text:'回來請你吃一碗大的。'}]},
        {t:'那出國呢？',mem:[{npc:'classmate_mingxuan',tag:'SAW_HIM_TRY',note:''}],say:[{from:'classmate_mingxuan',text:'……交換那個，我放棄了。畢業以後自己存錢去。'}]}]}})],'y3_mx_stream'); } };
  /* 哲 4 演完：不在群組、但是被叫「明天你要來喔」的人也排冠軍賽（台灣、美國路線）*/
  S.zhe4After=G=>{ if(!grp(G)) S.planFinal(G); };
  /* 日本路線看直播（AA_336 C11）：台灣 19:00（日本 20:00）以後、當天，一句旁白（只演一次；在家、在劇情裡、睡著了就等下一次空下來，過了那天就沒有）*/
  S.STREAM_LINE='（日本晚上八點。你在宿舍的書桌前開著系上的直播，畫面一直卡。最後一顆，阿哲傳給明軒。他們贏了。）';
  S.streamDue=G=>{ const F=G.flags||{}, g=DK(FG.g); return g!=null&&F.FINAL_GAME_Y3==='stream'&&!F.FINAL_STREAM_SEEN&&G.day===g&&G.hour>=tw(G,g,19)&&inJP(G,g); };   /* 「日本晚上八點」＝台灣 19:00（AA_341 J-S13）*/
  S.streamScene=async function(GM){ const G=GM.G; G.flags.FINAL_STREAM_SEEN=true; GM.sceneBegin(); try{ await GM.say(null,S.STREAM_LINE); } finally { GM.sceneEnd(); } return true; };
  S.finalMissed=G=>{ const g=DK(FG.g); if(G.flags.FINAL_GAME_Y3==null) G.flags.FINAL_GAME_Y3='missed'; if(g!=null&&grp(G)) PHONE.at(G,g,21.5,[Z('📷（獎盃在明軒手上。阿哲在旁邊比讚。）')],'y3_final_photo'); };
  /* 欠的滷蛋：現場選「冠軍耶，明天請客。」＝隔週（下週一起）；日本路線直播回「恭喜！」＝回國以後 */
  S.eggDue=function(G){ const F=G.flags||{}; if(F.MX_EGG_PAID) return false; if(F.MX_EGG_DAY!=null){ let m=F.MX_EGG_DAY+1; while(typeof CALENDAR!=='undefined'&&CALENDAR.dateOf(m).wd!==1&&m<F.MX_EGG_DAY+8) m++; return G.day>=m; }
    return !!F.MX_EGG_JP&&!inJP(G); };

  /* ---------- 1C-05 子晴、芷若同一天畢業 ---------- */
  const GR={inv:'2028-06-02',d:'2028-06-03'};
  S.gradDays=()=>({inv:DK(GR.inv),d:DK(GR.d)});
  S.gradPhone=function(G){ const F=G.flags, {inv,d}=S.gradDays(); if(inv==null||G.day<inv||G.day>d+1) return; const now=T(G.day,G.hour), jp=inJP(G,d), Q=msg('p:heroine_04','heroine_04');
    if(!jp&&G.day<=d&&now>=T(inv,21)&&!PHONE.sent(G,'y3_zq_grad')&&met(G,'heroine_04','FRIEND')){
      const L=(dating(G,'heroine_04')?['明天早上畢業典禮','九點 椰影大道','你來的話我會很緊張','所以你要來']:['明天早上畢業典禮','九點 椰影大道','你要來喔']).map(Q);
      L[L.length-1].ask={id:'y3_zq_grad',until:T(d,9),opts:[{t:'去。',set:{ZQ_GRAD_GO:true},say:[{from:'heroine_04',text:'好 那你負責拍'}]},{t:'那天我有事。',set:{ZQ_GRAD_GO:false},say:[{from:'heroine_04',text:'好 那拍給你看'}]}]};
      PHONE.at(G,inv,atH(G,inv,21),L,'y3_zq_grad'); }
    if(F.ZQ_GRAD_GO===true&&!outGet(G,'y3_zq_grad')&&(G.day<d||(G.day===d&&G.hour<11))) plan(G,{id:'y3_zq_grad',ev:'ev_zq_zr_graduation',day:d,h:9,late:2,place:'椰影大道',title:'子晴、芷若的畢業典禮',travel:'走過去約 10 分鐘',travelH:1/6});
    if(!jp&&PHONE.sent(G,'y3_zq_grad')&&!evDone(G,'ev_zq_zr_graduation')&&now>=T(d,12.5)&&!PHONE.sent(G,'y3_zq_grad_photo')){   /* 沒去上午 */
      PHONE.at(G,d,12.5,['（一張自拍，學士帽歪的）','你沒來','帽子是故意歪的 不要笑'].map(Q),'y3_zq_grad_photo'); if(F.GRAD_ZQ_ZR==null) F.GRAD_ZQ_ZR='photo'; }
    if(jp&&now>=T(d,tw(G,d,12.5))){   /* 日本路線：只有照片（子晴：BB_98 4-5 照 4-4 傳照片；芷若：AA_324 1C-05、BB_98 3-5）*/
      if(met(G,'heroine_04','FRIEND')) PHONE.at(G,d,tw(G,d,12.5),[Q('📷（一張自拍，學士帽歪的）')],'y3_zq_grad_jp');   /* 照片格式（AA_336 C13）*/
      if(met(G,'heroine_02','FAMILIAR')){ const R=msg('p:heroine_02','heroine_02'); PHONE.at(G,d,tw(G,d,15),[R('📷（學士服的照片，旁邊是子晴歪掉的學士帽）'),R('子晴拍的。她拍了二十張，這是唯一一張我沒閉眼的。')],'y3_zr_grad_jp'); }
      if((PHONE.sent(G,'y3_zq_grad_jp')||PHONE.sent(G,'y3_zr_grad_jp'))&&F.GRAD_ZQ_ZR==null) F.GRAD_ZQ_ZR='photo'; } };
  S.zrCafeDue=G=>{ const d=DK(GR.d); return d!=null&&G.day===d&&G.hour>=14&&!inJP(G)&&met(G,'heroine_02','FAMILIAR'); };

  /* ---------- 1C-06 最後一學期的開學第一頓 ---------- */
  const LT={d:'2029-02-22',back:'2029-02-25'};
  const rename=(G,name)=>{ const P=PHONE.rec(G), g=P.groups&&P.groups.noodle_team; if(g) g.name=name; };
  S.lastTermPhone=function(G){ const F=G.flags, d=DK(LT.d), b=DK(LT.back); if(d==null||!grp(G)||G.day<d||G.day>b+1) return; const now=T(G.day,G.hour);
    if(G.day<=d&&now>=T(d,17)&&!PHONE.sent(G,'y4_last_term_ask')){ rename(G,'最後一學期'); F.LAST_TERM_RENAMED=true;
      PHONE.at(G,d,atH(G,d,17),[{th:NG,text:'（阿哲把群組名稱改成「最後一學期」。）'},Z('開學第一頓 七點，長桌')],'y4_last_term_ask');
      if(G.hour<19.25) plan(G,{id:'y4_last_term',ev:'ev_last_term_first_dinner',day:d,h:19,late:0.25,place:'阿鳳麵店',title:'最後一學期的開學第一頓',travel:'走過去約 15 分鐘',travelH:0.25}); }
    if(F.LAST_TERM_RENAMED&&now>=T(b,21)&&!PHONE.sent(G,'y4_last_term_back')){ rename(G,'法四吃飯'); F.LAST_TERM_RENAMED=false;
      PHONE.at(G,b,atH(G,b,21),[{th:NG,text:'（阿哲把群組名稱改回「法四吃飯」。）'},Z('改回來了'),Z('Alison 說很難過')],'y4_last_term_back'); } };
  S.lastTermPhoto=G=>{ const d=DK(LT.d); if(G.flags.LAST_TERM_DINNER==null) G.flags.LAST_TERM_DINNER='missed'; if(d!=null&&grp(G)) PHONE.at(G,d,21.5,[Z('📷（長桌上的碗，跟大一的時候一樣多。）')],'y4_last_term_photo'); };

  /* ---------- 掛勾 ---------- */
  S.phone=function(G,GM){ if(!G||!G.flags||(G.stage||'law')!=='law'||typeof PHONE==='undefined') return;
    S.springPhone(G,GM); S.midautumnPhone(G); S.xmasBoxPhone(G); S.finalPhone(G); S.gradPhone(G); S.lastTermPhone(G); };
  let busy=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['group3d:busy']=()=>{ busy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  S.tick=function(GM){ const G=GM&&GM.G; if(busy||!G||!G.flags||(G.stage||'law')!=='law'||typeof PHONE==='undefined') return false; if(atHome(G)) return false;
    if(out()&&OUT.due&&OUT.due(G)) return false;   /* 出遊的「出發」先問 */
    if(S.streamDue(G)){ busy=true; S.streamScene(GM).catch(e=>console.warn('GROUP stream',e)).finally(()=>{ busy=false; }); return true; }   /* 日本路線的直播（AA_336 C11）*/
    if(S.springPending(G)){ busy=true; S.springPrompt(GM).catch(e=>console.warn('GROUP spring',e)).finally(()=>{ busy=false; }); return true; }
    return false; };
  if(typeof STORY!=='undefined'&&STORY.PHONE_RULES&&STORY.TICKS){ STORY.PHONE_RULES.push((G,GM)=>S.phone(G,GM)); STORY.TICKS.push((GM,dt)=>S.tick(GM,dt)); }
  return S;
})();
