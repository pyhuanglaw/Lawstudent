/* ===== 學姊（溫書瑀）準備法研所的那一年（祐廷法律大一；SIS-GRADSCHOOL-1017）=====
   交付單 AA_332（AA-C b4c3204d）第 2 節的表；台詞照 AA_284 第 2 節（同一個 commit，含審稿改的三處）、BB_122 ★-3 5-2／5-3（AA_284 2-5 開頭改「你來了。」），不改字。
   AA_360 第 2 節（STORY-AUDIT-1017，AA-C ff6f5923；使用者 2026-10-17 回 BB-LOGIC-14「可以」）取代 AA_284 2-5、2-7 和 AA_332 那一列：2-5 不再由她約（1/26 私訊拿掉），
   改成 1/24～1/27 玩家晚上自己在總圖、離開總圖的時候遇到（開頭兩行旁白、「學弟。你怎麼在這裡。」、選項 c 換）；2/2、2/3 前置放寬成 SIS_STUDY||SIS_PREEXAM_NIGHT；2-7 第一頁她自己寫。
   四條規則（AA_332 第 1 節）：①錄取固定：她一定上榜，不讀好感、一起念書次數、送禮、任何事件旗標（characters.js 的 possible_endings 只留「她考上法研所」）；
   ②婉拒不扣好感；③她不在群組起頭：群組的事一律 Kevin 起頭，她只回；她主動的私訊只有一起念書的邀請、2/2 考完那則、買計畫本那則（都只給熟了的玩家）；
   ④放榜（3/23）以前告白一律婉拒（date3d.js 的 preexam／prerank，現有）。
   掛勾（不改 story3d.js）：STORY_EVENTS（2-2、2-4、2-5、2-7、2-9、2-10、2-11、2-12）、STORY.PHONE_RULES（私訊、群組、排出遊）、STORY.TICKS（一起念書的日常、3/23 早上查榜）、
   STORY.WAKE_AT（2/3 21:00 睡著也會醒來）、HOME.STOPS（寒假快轉的停點）、STORY.onStudy（包一層：法圖坐下來讀書；在總圖讀書讀到 20:00 以後也記 2-5 那一晚）。
   2-1 的邀約上限：src/data/invites.js 學姊的 rule 呼叫 SISG.inviteCap；校外約會：src/date3d.js 的 DATE.menu 呼叫 SISG.dateDecline。BCG-42 在 src/adv3d.js 的 CG_REGISTRY。
   旗標：SIS_LAWLIB_NOTE（2-2）、SIS_STUDY（2-3 解鎖）、SIS_PREEXAM_NIGHT（2-5）、SIS_NEW_PLANNER（2-7）、SIS_RESULT_TOLD（2-8 查了榜）、SIS_OLD_BOOKS（2-10）；
   ev_sis_results 在 3/23 20:00 對所有玩家算演過。SISG_* 是這個檔自己的進度（存檔裡；舊存檔沒有＝還沒發生）。
   測試：node tests/sis_grad_unit.js */
'use strict';
const SISG=(function(){
  const S={}, ID='heroine_05';
  const T=(day,h)=>day*24+h;
  const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const law=G=>!!G&&(G.stage||'law')==='law';
  const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };   /* G.weekday 的寫法：週日 0 */
  const term=d=>typeof CALENDAR!=='undefined'?CALENDAR.termOf(d):null;
  const atLeast=(id,st)=>typeof SOCIAL!=='undefined'&&SOCIAL.STAGES.indexOf(SOCIAL.stage(id))>=SOCIAL.STAGES.indexOf(st);
  const inFam=G=>typeof PHONE!=='undefined'&&PHONE.inGroup(G,'family_law');
  const sent=(G,tag)=>typeof PHONE!=='undefined'&&PHONE.sent(G,tag);
  const done=(G,id)=>{ const E=G.events||(G.events={done:{},last:{},count:0}); E.done=E.done||{}; E.last=E.last||{}; E.done[id]=(E.done[id]||0)+1; E.last[id]=G.day; };   /* 訊息型的「事件」記成演過（別的條件用 events 讀）*/
  const evDone=(G,id)=>!!(G.events&&G.events.done&&G.events.done[id]);
  const P5=t=>({th:'p:'+ID,from:ID,text:t});
  const K=t=>({th:'g:family_law',from:'kevin',name:'Kevin',text:t});
  const W=t=>({th:'g:family_law',from:ID,name:'溫學姊',text:t});
  S.who=()=>{ const n=typeof EVENTS!=='undefined'&&EVENTS.npcOf?EVENTS.npcOf(ID):null; return {name:typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(ID):'溫學姊',obj:n&&n.obj,charId:ID}; };
  /* 日子（AA_332 第 2 節；星期 AA 核對過）。筆試、放榜只用在觸發，台詞不說幾號（第 4 節）*/
  S.DAYS={low:'2026-01-26',lowFrom:'2026-01-24',lowTo:'2026-01-27',fam:'2026-01-31',exam:'2026-02-02',ask:'2026-02-03',planner:'2026-02-04',books:'2026-02-22',rank:'2026-03-23',dinner:'2026-03-27',grad:'2026-06-06'};   /* low：舊的 1/26 私訊那天（舊存檔才有）；lowFrom～lowTo：2-5 路過總圖的那幾晚（AA_360 2-1）*/
  const D=k=>DK(S.DAYS[k]);
  S.preExam=(day,h)=>{ const d=D('exam'); return d!=null&&T(day,h||0)<T(d,17); };   /* 2/2 17:00 考完以前（和 INV.sisPostExam、DATE.sisPreexam 同一個分界）*/

  /* ---------- 2-1 邀約：筆試以前（到 2026-02-02 17:00；AA_284 2-1、AA_332 第 7 節第 2 點）----------
     普通邀約（Café、阿鳳麵店、半熟、一盞、溫州街）：大一上第 1～9 週每週最多答應一次；第 10～13 週每兩週最多一次（10–11、12–13）；第 14 週～2/2 都婉拒。
     平日 12:00～13:00 約吃飯一律答應、不算次數（她本來就要吃飯；2/1～2/2 她在家、不在學校的不算）。總圖＝一起念書，不在這裡。
     婉拒不扣分；婉拒句四句輪流（G.flags.SISG_DECL）。散步的婉拒照 invites.js 原本那一句（AA_284 1-3），在這之前就回了 */
  S.CAP_PLACES=['cafe','noodle','brunch','teahouse','wenzhou','gym_badminton','run_avenue'];   /* 羽球、晨跑（AA_417 3-3：筆試以前照現有的 rule，和其他不讀書的邀約一起算上限）*/
  S.DECLINE=['「這學期我在準備研究所，晚上大多在圖書館。……約我沒關係，我只是真的沒空。」','「等我考完，你再約一次。」','「今天不行。刑訴在等我。」','「這週的時間用完了。下週再問我。」'];
  /* AA_535 第 1 節（INVITE-OPTS-1030，AA-B 定稿 dbd49dca7；第②級）放寬：第 1～9 週不設上限（w，她自己的規則照舊）；第 10～13 週一週一次（p＋週次；原本兩週一次）；
     第 14 週～筆試照舊婉拒（off），但她一定提「一起念書」（S.DECLINE_OFF 兩句輪流＋選項「那一起念書。」，S.studyOffer）；念書（總圖、慢讀咖啡）一直不算次數；
     校外：第 10～13 週和校內共用那一週的一次、只能約半天（S.tripWhy、S.halfOnly，date3d.js），第 14 週起照舊婉拒（S.DATE_NO.off）*/
  S.capBucket=function(G,day,h){ if(!law(G)||!S.preExam(day,h)) return null; const t=term(day);
    if(t&&t.id==='Y1S1') return t.week<=9?'w'+t.week:(t.week<=13?'p'+t.week:'off');
    const r=typeof CALENDAR!=='undefined'&&CALENDAR.termDays?CALENDAR.termDays('Y1S1'):null; return r&&day>r.to?'off':null; };   /* 寒假到筆試：都婉拒 */
  const lunch=(pid,day,h)=>{ const P=typeof INV!=='undefined'&&INV.place?INV.place(pid):null, wd=wdOf(day); return !!P&&P.kind==='meal'&&wd>=1&&wd<=5&&h>=12&&h<13; };
  const awayAt=(G,day,h)=>{ if(typeof STORY==='undefined'||!STORY.schedEnt||typeof CHARACTERS==='undefined') return false; const e=STORY.schedEnt(CHARACTERS[ID],Object.assign({},G,{day,hour:h,weekday:wdOf(day),invites:[]})); return !!e&&e.zone==null; };
  S.capUsed=function(G,day,h,skipTrip){ const b=S.capBucket(G,day,h); if(!b||b==='off') return false;
    return (G.invites||[]).some(iv=>iv.who===ID&&S.CAP_PLACES.includes(iv.place)&&['accepted','going','done','missed'].includes(iv.state)&&!lunch(iv.place,iv.day,iv.h)&&S.capBucket(G,iv.day,iv.h)===b)
      ||(G.trips||[]).some(t=>t&&t.who===ID&&t.trip!==skipTrip&&t.status!=='cancelled'&&S.capBucket(G,t.day,+t.depart||0)===b); };   /* 校外約會也算那一週的一次（AA_535 1-2）*/
  S.declineLine=function(G){ const F=G.flags||(G.flags={}), n=F.SISG_DECL|0; F.SISG_DECL=n+1; return S.DECLINE[n%S.DECLINE.length]; };
  S.DECLINE_OFF=['「這陣子只剩念書的時間。……一起念的話可以。」','「考前我不出去。總圖的話，我在。」'];   /* AA_535 1-3：第 14 週～筆試，兩句輪流（G.flags.SISG_DECL2）*/
  S.offLine=function(G){ const F=G.flags||(G.flags={}), n=F.SISG_DECL2|0; F.SISG_DECL2=n+1; return S.DECLINE_OFF[n%S.DECLINE_OFF.length]; };
  S.inviteCap=function(G,c){ if(!c||!c.r||c.postExam||!S.CAP_PLACES.includes(c.pid)||(c.r.res!=='accept'&&c.r.res!=='resched')) return null;
    const b=S.capBucket(G,c.day,c.h); if(!b||/^w/.test(b)) return null;   /* 第 1～9 週不設上限（AA_535 1-2）*/
    if(lunch(c.pid,c.day,c.h)&&!awayAt(G,c.day,c.h)) return null;
    if(b!=='off'&&!S.capUsed(G,c.day,c.h)) return null;
    if(b==='off') return {res:'decline',why:'exam',lines:[S.offLine(G)],alt:null,study:true};   /* 說完接「那一起念書。」（invites3d.js 的 flow → S.studyOffer）*/
    return {res:'decline',why:'exam',lines:[S.declineLine(G)],alt:null}; };   /* 第 10～13 週：這一週用過了（四句輪流；「這週的時間用完了。下週再問我。」在這裡才合）*/
  /* 「那一起念書。」（AA_535 1-3）：系統替你約同一個時間的念書地點——平日總圖、週末而且慢讀開著＝慢讀咖啡；那個時間都不行＝照一般「改天」算總圖的下一個空檔。她答應的那一句 S.STUDY_YES；「不用了。」什麼都不發生 */
  S.STUDY_YES='「好。我帶刑訴。……你不要跟我講話，傳訊息。」';
  S.STUDY_OPTS=['那一起念書。','不用了。'];
  S.studyAt=function(G,W){ if(typeof INV==='undefined'||!INV.place) return null; const wk=[1,2,3,4,5].includes(wdOf(W.day)), ok=pid=>{ const P=INV.place(pid); return !!P&&(!P.show||P.show(G,ID))&&INV.freeAt(G,ID,P,W.day,W.h); };
    if(!wk&&ok('slowread')) return {pid:'slowread',day:W.day,h:W.h}; if(ok('library')) return {pid:'library',day:W.day,h:W.h};
    const L=INV.place('library'), a=L?INV.nextFree(G,ID,L,W.day,W.h):null; return a?{pid:'library',day:a.day,h:a.h}:null; };
  S.studyOffer=async function(GM,W,who,n){ const G=GM.G; const k=await GM.choose(S.STUDY_OPTS.map(t=>({t}))); if(k!==0) return null;
    const at=S.studyAt(G,W); if(!at){ await GM.say(null,'這幾天找不到一起念書的時間。'); return null; } const P=INV.place(at.pid), now=!!W.now&&at.day===G.day&&Math.abs(at.h-W.h)<1e-6&&!!n;
    const iv=INV.accept(G,ID,at.pid,at.day,at.h,{now,by:'player'}); await GM.say(who,S.STUDY_YES); await GM.say(null,now?'你們一起'+P.verb+'。':'約好 '+INV.when(G,at.day,at.h)+'，'+P.name+'。');
    if(now&&n){ if(GM.standUp) GM.standUp(n); n.beh='follow'; n.frozen=false; n.followOff=1.1; n.path=null; } return iv; };
  S.preExamStudy=(G,c)=>!!c&&S.capBucket(G,c.day,c.h)==='off';   /* 第 14 週～筆試約念書（慢讀）：她答應的那一句也是 S.STUDY_YES（AA_535 4-2）*/
  /* 校外約會（DATE.menu）：第 1～9 週照一般條件；第 10～13 週和校內共用那一週的一次、只能約半天（S.halfOnly、S.tripWhy；AA_535 1-2，原本婉拒「等我考完。」）；第 14 週～筆試（capBucket 'off'）照舊婉拒（AA_339 第 4 題）*/
  S.dateDecline=function(G){ return S.capBucket(G,G.day,G.hour)==='off'; };
  S.halfOnly=function(G){ return /^p/.test(S.capBucket(G,G.day,G.hour)||''); };
  S.tripWhy=function(G,o){ if(!o||o.who!==ID) return ''; const b=S.capBucket(G,o.day,+o.depart||0); if(!b||/^w/.test(b)) return '';
    if(b==='off') return '她考試前不出去';
    if(o.kind&&o.kind!=='half'&&o.kind!=='evening') return '考試前只能約半天';
    return S.capUsed(G,o.day,+o.depart||0,o.skip)?'這週已經約過她了':''; };
  S.DATE_NO={p:'等我考完。',off:'校外的話，等我考完。……考完我想去很遠的地方。'};
  S.dateNo=async function(GM,n){ const G=GM.G, t=S.capBucket(G,G.day,G.hour)==='off'?S.DATE_NO.off:S.DATE_NO.p, nm=S.who().name;
    if(n) await GM.say({name:nm,obj:n.obj,charId:ID},t); else { if(typeof PHONE!=='undefined') PHONE.post(G,P5(t)); await GM.say({name:nm+'（手機）',charId:ID},t); if(GM.phoneBadge) GM.phoneBadge(); } };

  /* ---------- 事件（STORY_EVENTS）----------*/
  const LOW_OLD={custom:G=>sent(G,'sisg_low_msg')};   /* 舊存檔：舊版本在 1/26 18:00 傳過「今天總圖讀到閉館。位子幫你留了」（AA_360 第 6 節：已經收到的照舊演一次）*/
  S.EVENTS=[
    /* 2-2 十月的法圖（底稿 BB_188 A5-4 Y2）：大一上第 6～9 週週三 19:00～21:00（她作息週三 19～21 在法圖）、玩家走進法圖、她在；有點熟以上、SIS_W1；只一次 */
    { id:'ev_sis_lawlib_meet', title:'十月的法圖', participants:[ID], location:'lawlib', trigger:'auto', npcPresent:ID, term:['Y1S1'], weeks:[6,7,8,9], weekday:[3], time:[19,21], once:true, priority:7, background:'blur',
      prereq:{flags:['SIS_W1'],stage:{npc:ID,min:'FAMILIAR'},custom:G=>law(G)},
      dialogue:[ {speaker:null,text:'（她的桌上三疊書、一疊考古題，便利貼排成一排顏色。桌角壓著一般入學考試的簡章。）'},
        {speaker:ID,expression:'neutral',text:'學弟，你走路好大聲。'},
        {speaker:ID,expression:'neutral',text:'……坐吧。旁邊沒人。'},
        {speaker:null,text:'（十分鐘後，她推過來一張便利貼：「你民總小考考幾分？」）'},
        {choice:[{text:'「七十二。」',goto:'a'},{text:'（在便利貼上畫一個問號）',goto:'b'}]},
        {label:'a'},{speaker:null,text:'（她在便利貼下面寫：「錯哪裡？」）'},{speaker:null,text:'（你們用便利貼講了二十分鐘。）'},{goto:'end'},
        {label:'b'},{speaker:null,text:'（她看了一眼，在問號旁邊畫一個哭臉，推回來。）'},
        {label:'end'} ],
      consequences:{flags:{SIS_LAWLIB_NOTE:true},rel:{[ID]:{fam:2,trust:1}},mem:[{npc:ID,tag:'SIS_LAWLIB_NOTE',note:''}],memo:'十月的法圖'} },
    /* 2-4 一個人走回去（底稿 Y5）：大一上第 14～15 週週一～四 21:40（她在法圖待到 21:45 的那兩週）、玩家和她都在法圖；SIS_STUDY；只一次；和熱水不同一晚，熱水先 */
    { id:'ev_sis_walk_alone', title:'一個人走回去', participants:[ID], location:'lawlib', trigger:'auto', npcPresent:ID, term:['Y1S1'], weeks:[14,15], weekday:[1,2,3,4], time:[21+40/60,21.75], once:true, priority:8, background:'blur',
      prereq:{flags:['SIS_STUDY'],events:['ev_sis_hot_water'],custom:G=>{ const L=(G.events&&G.events.last)||{}; return law(G)&&L.ev_sis_hot_water!==G.day&&L.ev_sis_hot_water_again!==G.day; }},
      dialogue:[ {speaker:null,text:'（那一週她比較安靜。閉館的廣播響了，她收書收得比平常慢。）'},
        {speaker:ID,expression:'tired',text:'今天我想一個人走回去。'},
        {choice:[{text:'「好。到家傳一下。」',set:{SISG_WALK_TEXT:true},goto:'a'},{text:'（點頭）',goto:'b'}]},
        {label:'a'},{speaker:ID,expression:'neutral',text:'嗯。'},{goto:'end'},
        {label:'b'},{speaker:null,text:'（她走到門口，回頭揮了一下手。）'},
        {label:'end'} ],
      after:G=>{ if(G.flags.SISG_WALK_TEXT===true&&typeof PHONE!=='undefined'){ G.flags.SISG_WALK_TEXT='sent'; PHONE.at(G,G.day,22+10/60,[P5('到了')],'sisg_walk_home'); } } },   /* 22:10 私訊「到了」；沒有下文、不加數值 */
    /* 2-5 筆試前一週的晚上（BB_122 ★-3 5-2；CG BCG-42；AA_360 第 2-1 節取代 AA_284 2-5、AA_332 那一列）：不再由她約。1/24～1/27（筆試前一週）玩家第一次晚上（20:00 以後）在總圖、
       離開總圖的時候演（S.lowMark／S.lowDue，STORY.TICKS 叫；有 SIS_STUDY 才有、只一次；沒去總圖＝沒有這一場）。開頭兩行旁白新寫、「學弟。你怎麼在這裡。」、
       選項 c 換「我陪妳走到捷運站。」（熱的東西已經移到平常日），其餘照舊。「走在後面的男生」是李冠宏（BB_194 16-2），這裡不叫名字。
       舊存檔已經收到 1/26 18:00 那則私訊、排了 20:00 出遊的：照舊演一次（LOW_OLD：舊的開頭；選項 c 也是新的，AA_363 R7）。
       路過版演完的時間（AA_363 R3）：a 到 22:00、b 不動、c 加 15 分鐘；出遊版照出遊的 1.5 小時 */
    { id:'ev_sis_low_night', title:'筆試前一週的晚上', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:1.5,
      dialogue:[ {scene:'總圖門口的台階',bg:'library_gate_night'},
        {unless:LOW_OLD,speaker:null,text:'（總圖門口的台階。兩個人剛收好東西先走了，走在後面的男生回頭看了一下。）'},
        {unless:LOW_OLD,speaker:null,text:'（她還坐在台階上，計畫本攤在膝蓋上，一頁一頁往回翻。）'},
        {if:LOW_OLD,speaker:null,text:'（她坐在台階上，計畫本攤在膝蓋上，一頁一頁往回翻。）'},{cg:'cg_planner_four_years_heroine05'},
        {unless:LOW_OLD,speaker:ID,expression:'neutral',text:'學弟。你怎麼在這裡。'},
        {if:LOW_OLD,speaker:ID,expression:'neutral',text:'學弟。你來了。'},
        {speaker:ID,expression:'neutral',text:'我在看我的計畫本。大一到現在的。'},
        {speaker:ID,expression:'tired',text:'每一週都排滿了。我剛剛在找有沒有哪一週是空的。'},
        {speaker:ID,expression:'tired',text:'……沒有。'},
        {speaker:null,text:'（她把計畫本闔上。）'},
        {speaker:ID,expression:'sad',text:'再一個禮拜就考試了。我有一點怕。'},   /* AA_369 L7：1/24 起會觸發，筆試 2/2 */
        {choice:[{text:'「我陪妳坐一下。」',goto:'a'},{text:'「妳準備得很夠了。」',goto:'b'},{text:'「我陪妳走到捷運站。」',goto:'c'}]},   /* 這一場沒有告白選項。AA_363 R7：舊存檔（LOW_OLD）的選項 c 也用新的，舊的「要不要吃點熱的？」拿掉（熱的東西已經移到平常日）；舊開頭「學弟。你來了。」照留 */
        /* AA_363 R3：路過版（不是出遊）演完照選項走時間——a 跳到總圖關門（places.js 22:00；已經過了就不動）、b 不動、c 加 15 分鐘（總圖走到公館站，人在原地）。
           舊存檔照出遊系統演的（LOW_OLD，出遊本身快轉 1.5 小時）照舊，不再加 */
        {label:'a'},{speaker:ID,expression:'neutral',text:'好。不用講話。'},{speaker:null,text:'（你們坐到圖書館熄燈。）'},{unless:LOW_OLD,advance:G=>S.lowCloseH(G)},{goto:'end'},
        {label:'b'},{speaker:ID,expression:'neutral',text:'大家都這樣說。……可是謝謝。'},{goto:'end'},
        {label:'c'},{speaker:ID,expression:'neutral',text:'……好。走到那裡就好。'},{unless:LOW_OLD,advance:0.25},
        {label:'end'},{speaker:ID,expression:'neutral',text:'好了，我回去了。明天還是八點到。'} ],
      consequences:{flags:{SIS_PREEXAM_NIGHT:true},rel:{[ID]:{trust:3,comf:2}},memo:'筆試前一週的晚上'} },
    /* 2-7 新的計畫本（BB_122 ★-3 5-3；AA_360 第 2-2 節取代 AA_284 2-7：第一頁她自己寫）：2/3（二）21:00 她私訊（SIS_STUDY 或 SIS_PREEXAM_NIGHT）、回「好。」＝2/4（三）14:00 公館的文具店（出遊）。
       文具店沒有背景：2D gongguan＋字幕（AA_332 第 6 節）。前兩句照舊；三個選項是祐廷看到第一頁以後的反應，數值、旗標照原本的 a、b、c（都在 consequences）*/
    { id:'ev_sis_new_planner', title:'新的計畫本', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:1,
      dialogue:[ {scene:'公館・文具店',bg:'gongguan'},
        {speaker:ID,expression:'neutral',text:'這本。週末那一欄是空白的，沒有格子。'},
        {speaker:ID,expression:'neutral',text:'我想要一本可以留白的。'},
        {speaker:null,text:'（結帳以後，她站在店門口，翻開第一頁寫了一行，寫完拿給你看。）'},
        {speaker:null,text:'（第一頁只有一行：「二月四日　買計畫本。」）'},
        {choice:[{text:'「第一件就做完了。」',goto:'a'},{text:'「後面都空著？」',goto:'b'},{text:'「下一行寫『睡午覺』。」',goto:'c'}]},
        {label:'a'},{speaker:null,text:'（她笑出來。）'},{speaker:ID,expression:'laugh',text:'對。第一件做完了。'},{goto:'end'},
        {label:'b'},{speaker:ID,expression:'neutral',text:'嗯。慢慢寫。'},{goto:'end'},
        {label:'c'},{speaker:ID,expression:'smile',text:'……好。這個我真的需要。'},
        {label:'end'} ],
      consequences:{flags:{SIS_NEW_PLANNER:true},rel:{[ID]:{trust:3,comf:3,rom:2}},memo:'新的計畫本'} },
    /* 2-9 上榜聚餐（舊的大二版 ev_sis_results_dinner 不用）：3/23 21:00 Kevin 在家族群組邀、回「去。」＝3/27（五）19:00 公館的日日定食（虛構店名；2D gongguan＋字幕）*/
    { id:'ev_sis_results_dinner_y1', title:'上榜聚餐', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
      dialogue:[ {scene:'公館・日日定食',bg:'gongguan'},
        {unless:{flags:['SIS_W1']},speaker:'player',text:'學姊好，我是{name}。'},{unless:{flags:['SIS_W1']},speaker:ID,expression:'neutral',text:'……我知道。家聚你都沒來。今天來了就好。'},   /* AA_470 5-1（表上寫 ev_sis_results_dinner＝大一下 3/27 這一場）：還沒認識她的兩句，點菜之前（沒有開場旁白：接在場景後面）；3/20 演過就不會到這裡；演完記 met_sis、SIS_W1 */
        {speaker:ID,expression:'neutral',text:'你們真的不用請我。'},
        {speaker:'Kevin',text:'學姊，坐好。今天妳只負責吃。'},
        {speaker:ID,expression:'neutral',text:'……好。'},
        {speaker:null,text:'（她點了最貴的那一份，然後看了 Kevin 一眼。Kevin 假裝沒看到。）'},
        {if:{flags:['SIS_RESULT_TOLD']},speaker:null,text:'（她小聲對你說。）'},
        {if:{flags:['SIS_RESULT_TOLD']},speaker:ID,expression:'smile',text:'那天你傳的時候，我還在睡。'},
        {if:{flags:['SIS_NEW_PLANNER'],notFlags:['SIS_RESULT_TOLD']},speaker:ID,expression:'smile',text:'計畫本今天這一格，我寫了『吃飯』。'},{unless:{flags:['SIS_W1']},set:{SIS_W1:true,met_sis:true}} ] },
    /* 2-10 舊教科書（接 12/5「下學期的書，我會留給你」）：去過 12/5 家族聚餐的玩家，2/22（日）回宿舍那天；回家住的在 17:00 回宿舍（寒假表的 back）以後。
       2/22 那天沒回宿舍的：第一次回宿舍那天演（AA_339 第 10 題；不限 2/28 以前，到大一下結束）*/
    { id:'ev_sis_books_y1s2', title:'舊教科書', participants:[], location:['dorm','dorm_hall'], trigger:'auto', once:true, priority:6, background:'blur',
      prereq:{events:['ev_sis_family_dinner'],custom:G=>{ const d=D('books'), r=typeof CALENDAR!=='undefined'&&CALENDAR.termDays?CALENDAR.termDays('Y1S2'):null; return law(G)&&d!=null&&G.day>=d&&G.day<=(r?r.to:d+6); }},
      dialogue:[ {speaker:null,text:'（管理室有你的一箱書。上面貼著一張便利貼。）'},
        {speaker:null,text:'（便利貼：「民總、刑總、憲法。紅筆是我的，藍筆是我學姊的。」）'} ],
      consequences:{flags:{SIS_OLD_BOOKS:true},memo:'學姊留下的舊教科書'} },
    /* 2-11 考古題送學妹（底稿 Y10）：大一下第 8～12 週平日 12:00～13:00、總圖門口（3D 校園）、有點熟以上；只一次 */
    { id:'ev_sis_give_notes', title:'考古題送學妹', participants:[ID], location:'campus', trigger:'auto', near:{x:83,z:3,r:7}, term:['Y1S2'], weeks:[8,9,10,11,12], weekday:[1,2,3,4,5], time:[12,13], once:true, priority:5, background:'blur',
      spawn:{npc:ID,at:{x:83.6,z:3.6},pose:'idle'},
      prereq:{stage:{npc:ID,min:'FAMILIAR'},custom:G=>law(G)&&!(typeof CALENDAR!=='undefined'&&CALENDAR.holiday(G.day))},
      dialogue:[ {speaker:null,text:'（她把一個紙箱交給一個大三的學妹。）'},
        {speaker:ID,expression:'neutral',text:'拿去。有錯的地方我用紅筆改過了。'},
        {speaker:null,text:'（學妹走了以後。）'},
        {speaker:ID,expression:'neutral',text:'……書架空了一層。我還沒想好要放什麼。'},
        {choice:[{text:'「放新的計畫本。」',goto:'a'},{text:'「先空著。」',goto:'b'}]},
        {label:'a'},{speaker:ID,expression:'smile',text:'那本很薄。'},{speaker:null,text:'（她笑了一下。）'},{goto:'end'},
        {label:'b'},{speaker:ID,expression:'neutral',text:'嗯。先空著。'},
        {label:'end'} ],
      after:(G,GM,npcs)=>{ const n=npcs&&npcs[0]; if(n&&G.zone==='campus'){ n.beh='route'; n.waypoints=[[86.4,1.2]]; n.pauseAt=false; n.talk=null; if(GM.despawnLater) GM.despawnLater(n,6); } } },   /* 走回總圖（和 W1 同一條路）*/
    /* 2-12 畢業典禮（BB_97 2-8；W10）：6/6（六）11:00 法律學院的典禮之後、霖澤館一樓大廳；有點熟以上的玩家當天早上收到她的私訊 → 出遊。
       她的爸爸、媽媽：路人 compact（沒有立繪）；說話人標「學姊的爸爸」（AA_339 第 3 題；媽媽同理標「學姊的媽媽」——這一場媽媽沒有台詞，只有旁白）；2D linze_auditorium */
    { id:'ev_sis_graduation', title:'畢業典禮', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:1.5,
      dialogue:[ {scene:'霖澤館・一樓大廳',bg:'linze_auditorium'},
        {speaker:'學姊的爸爸',text:'九月開學？'},
        {speaker:ID,expression:'neutral',text:'九月。……開學前，我想先睡一個禮拜。'},
        {speaker:null,text:'（媽媽笑了。）'},
        {speaker:'學姊的爸爸',text:'來，拍一張。'},
        {speaker:null,text:'（她看到你，笑了一下。）'},
        {speaker:ID,expression:'smile',text:'你來了。'},
        {speaker:ID,expression:'smile',text:'……我本來想了很多要說的。'},
        {speaker:ID,expression:'smile',text:'今天只說一句：謝謝你來。'} ],   /* AA_398 第 42 列 */
      consequences:{memo:'學姊的畢業典禮'} } ];

  /* ---------- 手機（STORY.PHONE_RULES；跳過時間、寒假快轉每小時跑一次）----------*/
  /* 2-3 解鎖（ev_sis_study_invite）：大一上第 7 週起、朋友以上、SIS_W1；條件到齊後的第一個星期二 21:30（「明天」＝她在法圖的星期三；AA_332 第 3 節）。
     星期二晚上睡著的：隔天 09:00 以前補（時間照星期二 21:30）。兩個選項都解鎖（傳的時候就記 SIS_STUDY）；回覆到星期三 19:00 */
  S.unlockRule=function(G,now){ const F=G.flags; if(F.SIS_STUDY||!F.SIS_W1||sent(G,'sisg_study_invite')||!atLeast(ID,'FRIEND')) return;
    for(const d of [G.day,G.day-1]){ if(wdOf(d)!==2) continue; const t=term(d); if(!t||t.id!=='Y1S1'||t.week<7||t.week>16||now<T(d,21.5)||now>=T(d+1,9)) continue;
      PHONE.at(G,d,21.5,[P5('你晚上如果也要讀書，可以來法圖。我旁邊的位子常常空著。'),Object.assign(P5('不要講話就好。閉館的時候，可以一起去買飲料。'),{ask:{id:'sisg_study_invite',until:T(d+1,19),opts:[{t:'好。',say:[P5('明天七點。')]},{t:'這週有點忙。',say:[P5('好。位子還是空的。')]}]}})],'sisg_study_invite');   /* 兩句尾巴補句號（AA_458 3-4：學姊的私訊都用句號收尾）*/
      F.SIS_STUDY=true; F.SISG_STUDY_DAY=d; done(G,'ev_sis_study_invite'); return; } };
  /* 2-3 她邀（一週最多一次）：解鎖以後的星期日 21:30「這週三晚上，法圖。」；那個星期三要在大一上的學期裡、法圖晚上有開；沒接不扣分。
     她不追人（AA_339 第 5 題）：剛解鎖（解鎖後的第一個星期日），或這一週（上一個星期日以後）有去法圖和她坐（SISG_SAT_DAY，S.onStudy 記）才傳——
     上一個週三沒來＝不傳，連兩週沒來也不傳；玩家自己再去法圖坐一次以後，下一個星期日恢復 */
  S.wedInvite=function(G,now){ const F=G.flags; if(!F.SIS_STUDY||!S.preExam(G.day,G.hour)) return;
    for(const d of [G.day,G.day-1]){ if(wdOf(d)!==0||(F.SISG_STUDY_DAY!=null&&d<=F.SISG_STUDY_DAY)||now<T(d,21.5)||now>=T(d+1,12)) continue; const wed=d+3, t=term(wed); if(!t||t.id!=='Y1S1') continue;
      if(typeof PLACES!=='undefined'&&PLACES.isOpen&&PLACES.hours&&PLACES.hours.lawlib&&!PLACES.isOpen('lawlib',19,wed)) continue;
      const fresh=F.SISG_STUDY_DAY!=null&&d-F.SISG_STUDY_DAY<=7, came=F.SISG_SAT_DAY!=null&&F.SISG_SAT_DAY>d-7; if(!fresh&&!came) return;
      const tag='sisg_wed_'+wed; if(!sent(G,tag)) PHONE.at(G,d,21.5,[P5('這週三晚上，法圖。')],tag); return; } };
  /* 寒假（2-6、2-7）。2-5 不再由她約（AA_360 2-1：1/26 18:00 那則私訊和 20:00 的出遊拿掉，改成 1/24～1/27 晚上路過總圖，S.lowMark／S.lowDue）；
     舊存檔已經收到那則、排好的出遊（OUT 'sisg_low_night'）照舊由出遊系統演 */
  S.breakRules=function(G,now){ const F=G.flags, d31=D('fam'), d2=D('exam'), d3=D('ask'), d4=D('planner'); if(d31==null) return; const st=!!(F.SIS_STUDY||F.SIS_PREEXAM_NIGHT);   /* AA_360 2-1：2/2、2/3 不綁那一晚在不在 */
    if(inFam(G)&&now>=T(d31,21)&&now<T(d2+1,0)&&!sent(G,'sisg_fam_0131'))   /* 2-6：1/31（六）21:00 家族群組（Kevin 1/31 從日本回來）：Kevin 起頭、她只回（所有在群組的人）；兩個學弟妹＝直屬學弟「致遠」、學妹「怡萱」（AA_339 第 1 題，只在家族群組出現）*/
      PHONE.at(G,d31,21,[K('學姊後天考試！！大家幫學姊集氣'),{th:'g:family_law',from:'fam_junior1',name:'致遠',text:'（貼圖）'},{th:'g:family_law',from:'fam_junior2',name:'怡萱',text:'（貼圖）'},W('謝謝。睡了。')],'sisg_fam_0131');
    if(st&&now>=T(d2,17.5)&&now<T(d2+3,0)&&!sent(G,'sisg_exam_done'))   /* 2-6：2/2（一）17:30 私訊，給一起念過書（SIS_STUDY）或有那一晚（SIS_PREEXAM_NIGHT）的；AA_360 2-1 放寬（原本只給 SIS_PREEXAM_NIGHT）*/
      PHONE.at(G,d2,17.5,[P5('考完了'),Object.assign(P5('我想吃一碗很燙的東西，然後睡十二個小時'),{ask:{id:'sisg_exam_done',opts:[{t:'去吃。',say:[P5('嗯。')]},{t:'辛苦了。',say:[P5('不要問我考得怎麼樣。我也不知道')]}]}})],'sisg_exam_done');
    if(st&&now>=T(d3,21)&&now<T(d4,13.5)&&!sent(G,'sisg_planner_ask'))   /* 2-7：2/3（二）21:00（同上，SIS_STUDY||SIS_PREEXAM_NIGHT）；「好。」＝2/4（三）14:00 公館的文具店 */
      PHONE.at(G,d3,21,[P5('我想去買一本新的計畫本'),Object.assign(P5('你要一起來嗎？不來也沒關係'),{ask:{id:'sisg_planner_ask',until:T(d4,13.5),opts:[{t:'好。',set:{SISG_PLANNER_GO:true}},{t:'這次不行。',say:[P5('好。我自己去')]}]}})],'sisg_planner_ask');
    if(F.SISG_PLANNER_GO===true){ F.SISG_PLANNER_GO='planned'; if(typeof OUT!=='undefined'&&now<T(d4,14.5)) OUT.plan(G,{id:'sisg_new_planner',ev:'ev_sis_new_planner',day:d4,h:14,late:0.5,place:'公館・文具店',title:'公館的文具店（學姊）',travel:'走過去約 15 分鐘',travelH:0.25,alarm:true}); } };
  /* 放榜（2-8）、上榜聚餐（2-9）*/
  S.rankRules=function(G,now){ const F=G.flags, d=D('rank'), d27=D('dinner'); if(d==null) return;
    if(now>=T(d,20)&&!evDone(G,'ev_sis_results')) done(G,'ev_sis_results');   /* 3/23 20:00 起，對所有玩家算演過（閒聊階梯 S2-L3 的 skipIf、S2-L5 的 linesIf 讀它）*/
    if(inFam(G)&&now>=T(d,20)&&now<T(d+2,0)&&!sent(G,'sisg_rank_fam')) PHONE.at(G,d,20,[K('各位！！學姊上榜了！！！'),W('收到。'),K('學姊妳可以多講兩個字'),W('謝謝。')],'sisg_rank_fam');   /* 所有在家族群組的玩家（錄取固定）*/
    if(inFam(G)&&now>=T(d,21)&&now<T(d27,18.5)&&!sent(G,'sisg_rank_dinner'))
      PHONE.at(G,d,21,[Object.assign(K('學姊上榜聚餐！這週五七點，公館的日日定食。這次我們請學姊'),{ask:{id:'sisg_rank_dinner_q',until:T(d27,18.5),opts:[{t:'去。',set:{SISG_DINNER_GO:true}}]}})].concat(sent(G,'fam_dinner_inv')?[K('上禮拜罰她，這禮拜請她。')]:[]),'sisg_rank_dinner');   /* AA_459 2-3：收過咖哩那一則（story3d.js fam_dinner_inv，3/20 罰學姊）的，Kevin 多一句 */
    if(F.SISG_DINNER_GO===true){ F.SISG_DINNER_GO='planned'; if(typeof OUT!=='undefined'&&now<T(d27,19.25)) OUT.plan(G,{id:'sisg_rank_dinner',ev:'ev_sis_results_dinner_y1',day:d27,h:19,late:0.25,place:'公館・日日定食',title:'學姊上榜聚餐（公館・日日定食）',travel:'走過去約 15 分鐘',travelH:0.25,alarm:true}); }
    if(inFam(G)&&sent(G,'sisg_rank_dinner')&&now>=T(d27,21.5)&&now<T(d27+2,0)&&!evDone(G,'ev_sis_results_dinner_y1')&&!sent(G,'sisg_rank_dinner_photo'))   /* 沒去的玩家：21:30 Kevin 貼合照 */
      PHONE.at(G,d27,21.5,[K('📷（定食店的長桌，學姊坐中間，面前是全桌最貴的那一份）'),K('沒來的人錯過請學姊吃飯。千載難逢')],'sisg_rank_dinner_photo'); };   /* 合照的說明：AA_339 第 2 題 */
  /* 2-12：6/6（六）早上她的私訊（有點熟以上）→ 11:00 霖澤館（出遊）。11:00 以後才起床的不補 */
  S.gradRule=function(G,now){ const d=D('grad'); if(d==null||now<T(d,8)||now>=T(d,11)||sent(G,'sisg_grad_msg')||!atLeast(ID,'FAMILIAR')) return;
    PHONE.at(G,d,8,[P5('今天十一點，霖澤館。不用帶花。')],'sisg_grad_msg');   /* AA_459 第 5 節：學姊的私訊用句號收尾 */
    if(typeof OUT!=='undefined') OUT.plan(G,{id:'sisg_grad',ev:'ev_sis_graduation',day:d,h:11,late:0.5,place:'霖澤館',title:'學姊的畢業典禮（霖澤館）',travel:'走過去約 10 分鐘',travelH:1/6,alarm:true,back:'離開霖澤館。'}); };
  S.phone=function(G){ if(typeof PHONE==='undefined'||!law(G)) return; if(!G.flags) G.flags={}; const now=T(G.day,G.hour);
    S.unlockRule(G,now); S.wedInvite(G,now); S.breakRules(G,now); S.rankRules(G,now); S.gradRule(G,now); };

  /* ---------- 寒假快轉的停點（AA_284 2-13；HOME.STOPS）：1/31 21:00、2/2 17:30、2/3 21:00；沒有對應旗標的玩家不停。
     AA_360 2-1：1/24～1/27 不再為她停（原本 1/26 18:00 停、等她的私訊）——玩家自己晚上去總圖才會碰到。2/2、2/3 照 SIS_STUDY||SIS_PREEXAM_NIGHT。
     2/4 14:00 的出遊（和舊存檔的 1/26 20:00）和 3/27、6/6 一樣由出遊系統停（OUT 的 planned）；2/22 回宿舍那一停是寒假表上原本的 back ----------*/
  S.stops=function(G,now){ if(!law(G)) return null; const F=G.flags||{}, d31=D('fam'), d2=D('exam'), d3=D('ask'); if(d31==null) return null; const out=[], st=!!(F.SIS_STUDY||F.SIS_PREEXAM_NIGHT);
    if(inFam(G)&&!sent(G,'sisg_fam_0131')) out.push(T(d31,21));
    if(st&&!sent(G,'sisg_exam_done')) out.push(T(d2,17.5));
    if(st&&!sent(G,'sisg_planner_ask')) out.push(T(d3,21));
    return out.filter(x=>x>now+1e-6); };
  /* 宿舍睡著也會醒來（STORY.WAKE_AT）：會錯過邀約的那一則——2/3 21:00（買計畫本）。1/26 18:00 那一則拿掉了（AA_360 2-1）*/
  S.wakeAt=function(G){ if(!law(G)) return null; const F=G.flags||{}, d3=D('ask');
    if((F.SIS_STUDY||F.SIS_PREEXAM_NIGHT)&&G.day===d3&&G.hour<21&&!sent(G,'sisg_planner_ask')) return 21;
    return null; };

  /* ---------- 2-5 筆試前一週的晚上（AA_360 第 2-1 節）：1/24～1/27 玩家晚上在總圖、離開總圖的時候演 ----------
     「晚上在總圖」＝那一晚 20:00 以後人在總圖（大廳 library_hall、3F 閱覽區 library；在裡面讀書讀到 20:00 以後也是，S.onStudy）：S.lowMark 記 SISG_LOW_NIGHT＝那一晚是哪一天。
     離開總圖（走出大門、用手機「地點」去別的地方都算）、還是同一晚（到隔天 05:00）＝S.lowDue，S.tick 接著演 ev_sis_low_night（EVENTS.run，不走出遊；演完的時間照選項，AA_363 R3：a 到 22:00、c 加 15 分鐘）。
     條件照舊：一起念過書（SIS_STUDY）；只一次。沒去總圖＝沒有這一場（她不在群組起頭，1/31 Kevin 的集氣群組照舊）。
     舊存檔已經收到 1/26 那則私訊的（sisg_low_msg）照舊走 20:00 的出遊、沒去就沒有，不走這一條。
     寒假的快轉選單（HOME.ffMenu）沒有「總圖」這個選項：只有在 3D 裡走到總圖待到 20:00 以後才會碰到 */
  S.LIB_ZONES=['library_hall','library'];
  const nightOf=G=>{ const now=T(G.day,G.hour), d=Math.floor((now-20)/24); return now-T(d,20)<9?d:null; };   /* 20:00～隔天 05:00 算那一晚（G.hour 過了 24 也一樣）*/
  S.lowOk=G=>{ const F=(G&&G.flags)||{}; return law(G)&&!!F.SIS_STUDY&&!evDone(G,'ev_sis_low_night')&&!sent(G,'sisg_low_msg')&&!(typeof EVENTS!=='undefined'&&EVENTS.failed&&EVENTS.failed.ev_sis_low_night); };   /* 演到一半出錯的（EVENTS.failed）這次遊戲不再試 */
  S.lowMark=function(G){ if(!G||!S.LIB_ZONES.includes(G.zone)) return false; const d=nightOf(G), a=D('lowFrom'), b=D('lowTo'); if(d==null||a==null||b==null||d<a||d>b||!S.lowOk(G)) return false; G.flags.SISG_LOW_NIGHT=d; return true; };   /* 便宜的先看（每 0.5 秒叫一次）*/
  S.lowDue=function(G){ const m=G&&G.flags&&G.flags.SISG_LOW_NIGHT; if(m==null||S.LIB_ZONES.includes(G.zone)||nightOf(G)!==m) return false; return S.lowOk(G); };
  /* AA_363 R3 選 a：跳到總圖關門（places.js 的 library_hall close，22:00）——那一晚的 22:00；已經過了（含過了午夜、G.hour 24 以上）＝0，時間只往前 */
  S.lowCloseH=function(G){ const P=typeof PLACES!=='undefined'&&PLACES.hours&&PLACES.hours.library_hall, c=P&&P.close!=null?P.close:22, d=nightOf(G); return d==null?0:Math.max(0,T(d,c)-T(G.day,G.hour)); };
  S.lowPlay=async function(GM){ const G=GM.G; if(!S.lowDue(G)||typeof EVENTS==='undefined'||typeof STORY_EVENTS==='undefined') return false; const e=STORY_EVENTS.find(x=>x.id==='ev_sis_low_night'); if(!e) return false;
    await EVENTS.run(e); return evDone(G,'ev_sis_low_night'); };   /* EVENTS 正在演別的（EVENTS.run 直接回來）＝下一次 tick 再試 */

  /* ---------- 2-3 一起念書的日常（AA_284 2-3 ①～⑤）：解鎖以後、筆試以前，玩家在法圖坐下來讀、她那時候照作息在法圖 → 讀完輪到一段（一天最多一段）。
     ③是那天晚上的家族群組（Kevin 問、她回；不在群組就跳過）；⑤要 SIS_TEA_ORDER（AA_311 H1：在一一八茶飲點飲料時記，src/lane118.js 的 L118.h1Due／playH1）。輪到哪一段記在 G.flags.SISG_SEG ----------*/
  S.segOk=(G,k)=>k===3?inFam(G):(k===5?!!(G.flags&&G.flags.SIS_TEA_ORDER):true);
  S.nextSeg=function(G){ const last=(G.flags&&G.flags.SISG_SEG)|0; for(let i=1;i<=5;i++){ const k=(last-1+i)%5+1; if(S.segOk(G,k)) return k; } return null; };
  S.herAt=function(GM,h0){ const G=GM.G; if(typeof STORY!=='undefined'&&STORY.schedEnt&&typeof CHARACTERS!=='undefined'){ const e=STORY.schedEnt(CHARACTERS[ID],Object.assign({},G,{hour:h0})); if(e&&e.zone==='lawlib') return true; }
    const n=typeof EVENTS!=='undefined'&&EVENTS.npcOf?EVENTS.npcOf(ID):null; return !!n&&!!GM.E&&Array.isArray(GM.E.npcs)&&GM.E.npcs.includes(n); };
  S._seg=null;
  S.onStudy=function(GM,hrs){ const G=GM.G, F=(G&&G.flags)||{}; if(G) S.lowMark(G);   /* 在總圖讀書讀到 20:00 以後（2-5，AA_360 2-1）*/ if(!law(G)||!F.SIS_STUDY||G.zone!=='lawlib'||!S.preExam(G.day,G.hour)) return;
    if(!S.herAt(GM,G.hour-(+hrs||1))) return; F.SISG_SAT_DAY=G.day;   /* 和她在法圖坐過（週日那則邀約看這個，AA_339 第 5 題）*/
    if(F.SISG_SEG_DAY===G.day) return; const k=S.nextSeg(G); if(!k) return; F.SISG_SEG=k; F.SISG_SEG_DAY=G.day;
    if(k===3){ if(typeof PHONE!=='undefined') PHONE.at(G,G.day,Math.max(22,(G.hour%24)+0.5),[K('學姊今天有吃飯嗎'),W('有。飯糰。……早餐、午餐、晚餐都是。')],'sisg_seg3_'+G.day); return; }
    S._seg={k,day:G.day}; };
  S.SEG={1:[[null,'（她和兩個也要考研究所的同學在走廊對答案，吵一個爭點吵到笑出來。看到你，揮一下手，繼續吵。）']],   /* ①不放同學名字（AA_339 第 7 題）*/
    2:[[null,'（她把字卡遞給你。）'],[ID,'念給我聽。'],[null,'（你念錯一個字，她直接說出正確答案和條號。）'],[ID,'……你念錯了。不過我答對了。']],
    4:[[null,'（你卡在一題民總，她看了一眼。）'],[ID,'先看題目問誰。你在幫錯的人想。'],[null,'（說完就回去讀自己的。）']],
    5:[[null,'（你把一杯無糖綠茶去冰放在她的書旁邊。她看了杯子一眼。）'],[ID,'……誰跟你說的。']]};   /* ⑤後面接選項；不加數值、不記憶 */
  S.segDue=function(G){ const q=S._seg; if(!q) return false; if(q.day!==G.day||G.zone!=='lawlib'){ S._seg=null; return false; } return true; };
  S.playSeg=async function(GM){ const G=GM.G, q=S._seg; S._seg=null; if(!q) return false; const her=S.who();
    GM.sceneBegin(); try{ if(typeof ADV!=='undefined'){ ADV.preload([ID]); ADV.begin({background:'blur',right:{charId:ID,expression:'neutral'}}); }
      for(const [sp,t] of S.SEG[q.k]) await GM.say(sp?her:null,t);
      if(q.k===5){ G.flags.SISG_SEG5=G.day;   /* 演過第 5 段（她說過「誰跟你說的」）：之後在一一八茶飲幫她點對，換「又是她說的。」那兩句（AA_410，src/foodfav3d.js）*/ const k=await GM.choose([{t:'「一一八的店員。」'},{t:'（不說）'}]); if(k===0) await GM.say(her,'……她記性比我好。謝謝。'); else await GM.say(null,'（她喝了一口，在便利貼上寫：「謝謝。下次換我。」推過來。）'); }
    } finally { if(typeof ADV!=='undefined'&&ADV.active) ADV.end(); GM.sceneEnd(); }
    if(GM.autosave) GM.autosave(); return true; };

  /* ---------- 2-8 放榜：3/23（一）早上起床（一起念過書：SIS_STUDY 或 SIS_PREEXAM_NIGHT）。查了＝自動傳私訊，她 12:10、12:13 回（查得晚就是 10、13 分鐘後）----------*/
  S.rankDue=function(G){ const F=(G&&G.flags)||{}, d=D('rank'); return law(G)&&d!=null&&G.day===d&&G.hour>=5&&G.hour<20&&F.SISG_RANK==null&&!!(F.SIS_STUDY||F.SIS_PREEXAM_NIGHT); };
  S.rankMorning=async function(GM){ const G=GM.G, F=G.flags; if(!S.rankDue(G)) return false; F.SISG_RANK='asked'; let k=1;
    GM.sceneBegin(); try{ await GM.say(null,'（今天法研所放榜。）'); k=await GM.choose([{t:'（上網查榜）'},{t:'（先不要）'}]);
      if(k===0){ F.SISG_RANK='told'; await GM.say(null,'（你在榜單上找到她的名字。）'); const t='學姊，榜單上有妳。恭喜。';
        if(typeof PHONE!=='undefined') PHONE.post(G,{th:'p:'+ID,from:'player',who:null,text:t}); await GM.say({name:G.name+'（手機）'},t);
        F.SIS_RESULT_TOLD=true; if(typeof SOCIAL!=='undefined'){ SOCIAL.remember(ID,'SIS_RESULT_TOLD',''); SOCIAL.adjust(ID,{trust:3,rom:1}); }
        const h=G.hour%24, r1=h<12+10/60?12+10/60:h+10/60;
        if(typeof PHONE!=='undefined'){ PHONE.at(G,G.day,r1,[P5('……我還沒去看。你比我快')],'sisg_rank_r1'); PHONE.at(G,G.day,r1+3/60,[P5('真的有'),P5('謝謝。我先去跟我媽說')],'sisg_rank_r2'); } }
      else F.SISG_RANK='later';
    } finally { GM.sceneEnd(); }
    if(GM.autosave) GM.autosave(); return true; };

  /* ---------- 每 0.5 秒（STORY.TICKS：在 1A-05 之後、在家判斷之前；劇情、對話進行中不會叫）----------*/
  let busy=false; S._p=null;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['sis_grad3d:busy']=()=>{ busy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  const go=f=>{ busy=true; S._p=Promise.resolve().then(f).catch(e=>console.warn('SISG',e)).finally(()=>{ busy=false; }); return true; };
  S.tick=function(GM){ const G=GM&&GM.G; if(busy||!law(G)) return false;
    S.lowMark(G);   /* 2-5：1/24～1/27 晚上人在總圖＝記下那一晚（AA_360 2-1）*/
    if(S.rankDue(G)) return go(()=>S.rankMorning(GM));
    if(S.segDue(G)) return go(()=>S.playSeg(GM));
    if(S.lowDue(G)) return go(()=>S.lowPlay(GM));   /* 2-5：那一晚離開總圖了 */
    return false; };

  /* ---------- 登記 ----------*/
  if(typeof STORY_EVENTS!=='undefined') for(const e of S.EVENTS) if(!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e);
  if(typeof STORY!=='undefined'){
    if(STORY.TICKS) STORY.TICKS.push(GM=>S.tick(GM));
    if(STORY.PHONE_RULES) STORY.PHONE_RULES.push(G=>S.phone(G));
    if(STORY.WAKE_AT) STORY.WAKE_AT.push(G=>S.wakeAt(G));
    const prev=STORY.onStudy; STORY.onStudy=function(GM,hrs){ if(prev){ try{ prev.call(STORY,GM,hrs); }catch(e){ console.warn('STORY.onStudy',e); } } try{ S.onStudy(GM,hrs); }catch(e){ console.warn('SISG.onStudy',e); } }; }   /* 法圖坐下來讀書（game3d.js 的 studySession 讀完呼叫）*/
  if(typeof HOME!=='undefined'&&Array.isArray(HOME.STOPS)) HOME.STOPS.push((G,now)=>S.stops(G,now));
  if(typeof SOCIAL!=='undefined'&&SOCIAL.MEMORY_LABEL) Object.assign(SOCIAL.MEMORY_LABEL,{SIS_LAWLIB_NOTE:'十月的法圖，她用便利貼問你小考',SIS_RESULT_TOLD:'放榜那天，你先查到她的名字'});
  return S;
})();
