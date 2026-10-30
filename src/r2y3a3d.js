/* ===== 第 2 輪之二：大三（含大二暑假、大三寒假）2-Y3-01～2-Y3-25（AA_326，AA-C 2026-10-20 定稿 e284d601）：手機、出發、作息、課堂段、日本路線退宿 =====
   台詞在 data/r2y3a_events.js（R2Y3A_EVENTS，照 AA_326 不改字）。掛在 STORY.PHONE_RULES（手機：每一輪）、STORY.TICKS（日本路線退宿）、STORY.WAKE_AT（可昕的電話）、
   CLS.IN_CLASS（刑訴第 7、12、13 週）；人物的作息在載入時放進 CHARACTERS[id].daily_schedule 最前面（寫 terms＋dates／weeks，只在那幾天那幾個小時）；不改 story3d.js。
   另外包住的（只在條件成立時改結果）：STORY.roomY3Items（第三個房間多「旗津的燈塔」）、ROM.partners（2-Y3-10：10/23 起床「跟可昕說」排第一）、SYLLABUS 刑訴第 7 週（匯入新版以後自動不作用）。
   2-Y3-01 KH：7/20 21:30 可昕邀約（交往中）→ 答應＝8/7 09:00 左營（高鐵 2980；旅館一晚 1,800 元記「住宿」，AA_343 B1）→ 8/8 七夕；不回＝7/22 21:00 再一則、還是不回＝婉拒；沒出發＝09:30 電話、18:00 照片、KX_RUB +1；
           七夕視訊（D）：2026-08-19、2027-08-08（這一趟沒去的）、2028-08-26 21:00；房間物件「旗津的燈塔」（包住 STORY.roomY3Items）
   2-Y3-02 F2：7/20 21:00 方奕廷（說過話 3 次以上）→ 7/24 06:30；拒絕或不回＝8/16 21:00 再約 8/21；沒出發＝06:45、22:00 雲海
   2-Y3-03 迎新：9/2 21:00 系學會 → 9/4 13:00；沒去＝21:30 照片　2-Y3-04 開學第一頓：9/9 17:00 → 19:00；沒去＝21:30 照片　2-Y3-05 哲 3：9/10 12:00 群組；17:30～19:00 阿哲、明軒在籃球場
   2-Y3-06 K15：9/22 17:00 → 18:00 公館（18:10 沒到＝18:15 一則、KX_RUB +1；婉拒、不回＝18:30 空碗）　2-Y3-07 K11：9/27 21:00 → 9/29 19:00 博雅；她自己聽＝20:30～21:00 博雅一樓圓桌區、沒去＝21:00 一則
   2-Y3-08 Q8b：10/6 21:30 子晴（FAMILIAR）；10/6～10/8 22:00～23:30 公館；三天都沒去＝10/8 23:00 三則（一樣記 DAD_PLAYS、事件算演過）
   2-Y3-09 颱風假：T3a 19:30 阿凱兩則、20:00 宿舍；T3b 21:00 家族群組（回「我會上線」＝10/14 19:00 線上）
   2-Y3-10 可昕的電話：10/18 22:00（主線 4 回得不少：G.needed.answered ≥ NEED_MIN＝8，AA_343 B5）；轉移話題＝10/22 22:00；沒接＝一則
   2-Y3-11 刑訴旁聽：第 7 週課堂三句（syllabus 第 7 週在這裡覆寫）、10/19 21:00 麵店團群組約人、約了的那天 13:30 出發（12:30 鬧鐘）、自己找一天＝第 7～11 週平日 13:00～14:00 的出發選單；
           第 12 週交、第 13 週發回（CLS.IN_CLASS）；第 11 週以前都沒去＝CRIMPRO_HW 'none'
   2-Y3-12 慈 4：10/19 21:30 Alison 三則；10/20 12:10～12:40 芯慈在霖澤館二樓走廊　2-Y3-13 以安新 14：10/21 17:30～19:40 以安在麵店；沒遇到＝22:00 群組（不在群組＝私訊）
   2-Y3-14 翰 4：第 10 週平日 12:10～13:00 柏翰在霖澤館 4F 樓梯間（往五樓的刷卡門前，AA_343 B7）；接讀書會的＝11/18 21:40 一則　2-Y3-15 校慶：11/12 21:00 法服群組
   2-Y3-16 C4：11/19 21:00 阿哲四則（回覆到隔天 18:00）；沒回＝隔天 18:00 一則　2-Y3-17 續約：11/23 21:00 法服群組／語彤私訊 → 11/24 14:30；都沒遇到＝12/14 21:00
   2-Y3-18 慈 5：第 13 週以安、芯慈在總圖三樓　2-Y3-19 K17：12/8 21:00 → 12/9 21:45 視訊；4/25 21:00 → 4/26 18:30 政大山下（日本路線＝視訊被看；不去＝21:00 照片）
   2-Y3-20 事件 13：12/16 17:00 語彤兩則、18:00～19:45 總圖三樓　2-Y3-21 聖誕：12/24 21:00 → 12/25 21:00 視訊（沒接＝一則）
   2-Y3-23 KN：2028-01-25 22:00（回覆到 1/26 09:00；「打給妳。」＝演出來的短電話；不回＝1/26 09:00 一則）　2-Y3-24 情人節：2/13 21:00 → 2/14 20:00 視訊（沒接＝20:30 兩則）
   2-Y3-25 日本路線 X1：2/20 14:00 以後人在宿舍房間＝裝箱、搬回臺北的家（人在家＝先帶回宿舍）；21:00 柏翰兩則；2/23 10:00 系辦
   測試：node tests/r2y3a_events_unit.js */
'use strict';
const R2Y3A=(function(){
  const S={};
  const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const T=(d,h)=>d*24+h, now=G=>T(G.day,G.hour);
  const hh=G=>((G.hour%24)+24)%24;
  const law=G=>!!G&&(G.stage||'law')==='law';
  const knows=(id,G)=>typeof STORY!=='undefined'&&!!STORY.knows&&STORY.knows(id,G);
  const atLeast=(id,st)=>typeof SOCIAL!=='undefined'&&!!SOCIAL.STAGES&&SOCIAL.STAGES.indexOf(SOCIAL.stage(id))>=SOCIAL.STAGES.indexOf(st);
  const met=(G,id,st)=>knows(id,G)&&atLeast(id,st||'FAMILIAR');   /* 先看認識（不替沒有紀錄的人建一筆空的關係），才問階段 */
  const dating=(G,id)=>{ const F=(G&&G.flags)||{}, R=F.romance||{}; return F['dating_'+id]===true||!!(R[id]&&R[id].status==='dating'); };
  const done=(G,id)=>!!(G.events&&G.events.done&&G.events.done[id]);
  const mark=(G,id)=>{ const E=G.events||(G.events={done:{},last:{},count:0}); E.done=E.done||{}; E.last=E.last||{}; E.done[id]=(E.done[id]||0)+1; E.last[id]=G.day; };
  const grp=(G,id)=>typeof PHONE!=='undefined'&&PHONE.inGroup(G,id||'noodle_team');
  const inJP=(G,day)=>typeof STORY!=='undefined'&&!!STORY.route&&STORY.route(G)==='JP'&&!!STORY.abroad&&STORY.abroad(day==null?G:Object.assign({},G,{day}));
  const abroadOn=(G,day)=>typeof STORY!=='undefined'&&!!STORY.abroad&&STORY.abroad(Object.assign({},G,{day}));
  const atHome=G=>typeof HOME!=='undefined'&&!!HOME.at&&HOME.at(G);
  const atH=(G,d,h)=>G.day===d?Math.max(h,G.hour):h;   /* 當天就是現在（不早於 h）；隔天才補的照原本的時間 */
  const sent=(G,tag)=>typeof PHONE!=='undefined'&&PHONE.sent(G,tag);
  const out=()=>typeof OUT!=='undefined'?OUT:null;
  const plan=(G,o)=>{ const O=out(); return !!O&&O.plan(G,o); };
  const outGet=(G,id)=>{ const O=out(); return O?O.get(G,id):null; };
  const silentContact=(G,id)=>{ if(typeof INV==='undefined'||!INV.rec) return; INV.rec(G); if(G.contacts&&G.contacts[id]==null) G.contacts[id]=G.day; };   /* 他傳訊息給你＝有你的聯絡方式 */
  const remember=(id,tag,note)=>{ if(typeof SOCIAL!=='undefined'&&SOCIAL.remember&&!SOCIAL.has(id,tag)) SOCIAL.remember(id,tag,note||''); };
  const M=(th,from,name)=>t=>{ const o={th,from,text:t}; if(name) o.name=name; return o; };
  const P=id=>M('p:'+id,id);   /* 一對一 */
  const R=from=>t=>({from,text:t});   /* 回覆的 say（對話串照那一則）*/
  const K=P('kexin'), Kr=R('kexin');
  const kxYearSet=(G,key,n,v)=>{ const F=G.flags; F[key]=Object.assign({},(F[key]&&typeof F[key]==='object')?F[key]:{},{[n]:v}); };
  const VIDEO=(id,ev,day,h,title,o)=>Object.assign({id,ev,day,h,late:0.5,place:'視訊',verb:'接起來',no:'今天先不要',title,travel:'',travelH:0,back:'視訊結束。',alarm:true},o||{});
  const CALL=(id,ev,day,h,o)=>Object.assign({id,ev,day,h,late:1/6,place:'電話',verb:'接起來',no:'先不接',title:'可昕打電話來',call:true,travel:'',travelH:0,back:'電話掛了。'},o||{});   /* call:true＝電話，人在家也不用出門（OUT.trip）*/

  /* ===================== 載入時：作息、syllabus、房間物件、人物面板的記憶名稱 ===================== */
  /* 人物放在哪裡（populateSchedule 照作息）：寫了 terms 的比沒寫的優先、同樣有 terms 照陣列順序——放在最前面＝這幾個小時蓋過一般作息 */
  const ONE=k=>[[k,k]];
  S.SCHED=[
    ['zhe',{days:[5],from:17.5,to:19,zone:'campus',act:'linger',at:[-3,-111,Math.PI,0],label:'在籃球場練球',terms:['Y3S1'],dates:ONE('2027-09-10'),note:'2-Y3-05 哲 3：新球季第一次練（新體育館旁的籃球場）'}],
    ['classmate_mingxuan',{days:[5],from:17.5,to:19,zone:'campus',act:'linger',at:[-6.5,-114,Math.PI/2,0],label:'在籃球場練球',terms:['Y3S1'],dates:ONE('2027-09-10'),note:'2-Y3-05：明軒照樣打球（家教是二、四、六）'}],
    ['kexin',{days:[3],from:20.5,to:21,zone:'boya',room:'round',act:'read',terms:['Y3S1'],dates:ONE('2027-09-29'),if:{custom:G=>!!(G.flags&&G.flags.KX_K11_SELF)&&G.flags.KX_K11!=='together'&&dating(G,'kexin')},note:'2-Y3-07 K11：她自己聽完講座，坐在博雅一樓的小桌子'}],
    ['heroine_01',{days:[4],from:17.5,to:19+40/60,zone:'noodle',act:'eat',terms:['Y3S1'],dates:ONE('2027-10-21'),note:'2-Y3-13 以安新 14：麵店長桌（20:00 讀書會）'}],
    ['classmate_bohan',{days:[1,2,3,4,5],from:12+10/60,to:13,zone:'linze_4f',act:'linger',at:[6.2,-6.3,Math.PI,0],terms:['Y3S1'],weeks:[10],noHoliday:true,note:'2-Y3-14 翰 4：4F 樓梯間的門口，面向往五樓的那扇門（AA_343 B7；3D 沒有樓梯間裡面，放在 4F 走廊的樓梯間門前）'}],
    ['heroine_01',{days:[1,2,3],from:18,to:21,zone:'library',act:'read',terms:['Y3S1'],weeks:[13],note:'2-Y3-18 慈 5：和芯慈在總圖三樓對刑訴期中的答案'}],
    ['heroine_01',{days:[4],from:18,to:19.75,zone:'library',act:'read',terms:['Y3S1'],weeks:[13],note:'2-Y3-18 慈 5（週四 20:00 讀書會）'}],
    ['classmate_xinci',{days:[1,2,3],from:18,to:21,zone:'library',act:'read',terms:['Y3S1'],weeks:[13],note:'2-Y3-18 慈 5'}],
    ['classmate_xinci',{days:[4],from:18,to:19.75,zone:'library',act:'read',terms:['Y3S1'],weeks:[13],note:'2-Y3-18 慈 5'}],
    ['heroine_03',{days:[4],from:18,to:19.75,zone:'library',act:'read',terms:['Y3S1'],dates:ONE('2027-12-16'),note:'2-Y3-20 事件 13：工讀生第一天，她在總圖三樓'}] ];
  S.installSchedules=function(){ if(typeof CHARACTERS==='undefined') return 0; let n=0;
    for(const [id,e] of S.SCHED.slice().reverse()){ const c=CHARACTERS[id]; if(!c) continue; const L=c.daily_schedule||(c.daily_schedule=[]); if(L.includes(e)) continue; L.unshift(e); n++; }
    return n; };
  S.installSchedules();
  /* 2-Y3-11：刑訴第 7 週的黑板和第一句（AA_252 5-1；syllabus.js 是匯入工具產生的檔，不手改——企劃線的 JSON 還是舊的「法院旁聽／這週我們不在教室」時才覆寫，AA 匯入新版以後這段自動不作用）*/
  S.CR_BOARD=['旁聽作業','一份兩頁的案例說明','第 7～11 週自己去地院旁聽；第 12 週交答辯狀'];
  S.patchSyllabus=function(){ if(typeof SYLLABUS==='undefined'||!SYLLABUS.courses||!Array.isArray(SYLLABUS.courses.crimpro)) return false; const w=SYLLABUS.courses.crimpro.find(q=>q.w===7);
    if(!w||!w.board||w.board[0]!=='法院旁聽') return false; w.board=S.CR_BOARD.slice(); w.line='這次作業，三件事。一份案例說明，我發給你們。'; w.react=[]; return true; };
  S.patchSyllabus();
  /* 2-Y3-01：第三個房間（9/5，AA_315 1A-03）大二的新東西多「旗津的燈塔」（照片）；點了的旁白照 AA_326 第 4 節 */
  S.LIGHTHOUSE=['旗津的燈塔','她住高雄二十年，那天才爬上去。'];
  if(typeof STORY!=='undefined'&&STORY.roomY3Items&&!STORY._r2y3aRoom){ const orig=STORY.roomY3Items; STORY._r2y3aRoom=true;
    STORY.roomY3Items=function(G){ const L=orig.apply(this,arguments); const T3=(G&&G.flags&&G.flags.KX_TRIP)||{}; if(T3.Y2SUM==='two_days'&&!L.some(r=>r[0]==='kx_lighthouse')) L.push(['kx_lighthouse',S.LIGHTHOUSE[0],[S.LIGHTHOUSE[1]]]); return L; };
    if(STORY.ROOM_Y3_TEXT&&!STORY.ROOM_Y3_TEXT.kx_lighthouse) STORY.ROOM_Y3_TEXT.kx_lighthouse=S.LIGHTHOUSE.slice(); }
  /* 人物面板的記憶名稱：搬到 social3d.js 的 MEMORY_LABEL（AN_ADMIN_COURT、ZHE_SCOOTER…；人物面板的測試只讀那裡）*/

  /* ===================== 2-Y3-01 可昕 KH「高雄的兩天」＋七夕 ===================== */
  const KH={inv:'2027-07-20',re:'2027-07-22',d1:'2027-08-07',d2:'2027-08-08'};
  S.KH_FARE=(typeof HOMETOWN_LINES!=='undefined'&&HOMETOWN_LINES.kexin&&HOMETOWN_LINES.kexin.fare)||2980;   /* 高鐵照「去她的縣市」（AA_276 第 7 節）*/
  S.KH_LODGING=()=>1800;   /* 旅館一晚 1,800 元，記「住宿」（AA_343 B1：左營站旁邊的商務旅館，她幫忙找、他自己付；不寫旅館名稱）。春假 1C-01（group3d.js）維持現狀不扣 */
  /* 連續兩個假期都沒和她去（BB_97 9-1：她約了、你沒去）：大二寒假的高雄（y2r2_3d.js 的 y2r2_kh_ask；去了＝KX_TRIP.Y2W 'kaohsiung'）、大二春假（group3d.js 的 y2s2_spring_kx；去了＝KX_TRIP.Y2S2）*/
  S.khTwoMissed=G=>{ const F=G.flags||{}, T=(F.KX_TRIP&&typeof F.KX_TRIP==='object')?F.KX_TRIP:{}; return sent(G,'y2r2_kh_ask')&&T.Y2W!=='kaohsiung'&&sent(G,'y2s2_spring_kx')&&!T.Y2S2; };
  S.khPhone=function(G){ const F=G.flags, di=DK(KH.inv), dr=DK(KH.re), d1=DK(KH.d1), d2=DK(KH.d2); if(di==null||G.day<di||G.day>d2+1) return; const n=now(G);
    if(dating(G,'kexin')&&n>=T(di,21.5)&&n<T(d1-1,21)&&!sent(G,'y3_kh_inv')){
      const L=[K('八月七號、八號，週末。我空下來了。'),K('你來高雄。這次住一晚。'),K('八號是七夕。……我借了我爸的車。')]; if(S.khTwoMissed(G)) L.push(K('一天也算。……這次是兩天。'));
      L[L.length-1].ask={id:'y3_kh_inv',until:T(d1-1,21),opts:[{t:'好。我坐早上的高鐵。',say:[Kr('九點到左營。旅館我幫你找好了，在車站旁邊。')],set:{KX_KH_GO:true},need:{money:S.KH_FARE+S.KH_LODGING(),why:'高鐵票和旅館的錢不夠。'}},   /* AA_350 M1：出發前要付得出高鐵＋旅館 4,780（AA_343 B1 旅館他自己付）*/
        {t:'那兩天不行。',say:[Kr('好。那寒假。……行程表我先留著。')],set:{KX_KH_GO:false}}]};
      PHONE.at(G,di,atH(G,di,21.5),L,'y3_kh_inv'); }
    const m=PHONE.byAsk(G,'y3_kh_inv');
    if(m&&m.ans==null&&n>=T(dr,21)&&n<T(d1-1,21)&&!sent(G,'y3_kh_inv2')) PHONE.at(G,dr,atH(G,dr,21),[K('七號、八號。你回一下。')],'y3_kh_inv2');
    if(m&&m.ans==null&&n>=T(d1-1,21)&&F.KX_KH_GO==null) F.KX_KH_GO=false;   /* 還是不回＝婉拒那一版（不另外扣分）*/
    if(F.KX_KH_GO===false&&!F.KX_KH_DEFER){ F.KX_KH_DEFER=true; F.KX_TRIP_DEFERRED='winter'; }   /* 「好。那寒假。」延到寒假（BB_97 9-1 的延期，值照 9-1 寫 'winter'）*/
    if(F.KX_KH_GO===true&&!outGet(G,'y3_kh')&&n<T(d1,9.5)) plan(G,{id:'y3_kh',ev:'ev_kexin_trip_summer_y2',day:d1,h:9,late:0.5,place:'左營站',title:'去高雄找可昕（兩天一夜）',travel:'高鐵約一個半小時',travelH:1.5,back:'回到臺北。',alarm:true});
    /* C：沒出發的電話（ev 的 outingMissed 排）、18:00 照片 */
    if(F.KX_TRIP&&F.KX_TRIP.Y2SUM==='missed'&&!sent(G,'y3_kh_photo')) PHONE.at(G,d1,18,[K('（照片：燈塔上往下看的海）'),K('一個人爬上去了。')],'y3_kh_photo'); };
  S.khPay=function(G,GM){ if(GM&&GM.money){ GM.money(-S.KH_FARE,'交通'); GM.money(-S.KH_LODGING(),'住宿'); } };
  S.khNight=function(G,GM){ const d2=DK(KH.d2); if(d2==null) return; if(typeof STORY!=='undefined'&&STORY.travelOvernight&&GM) STORY.travelOvernight(GM,d2,16); else { G.day=d2; G.hour=16; } };   /* 旅館一晚：不演室內 */
  S.khDone=function(G){ const F=G.flags; F.KX_TRIP=Object.assign({},(F.KX_TRIP&&typeof F.KX_TRIP==='object')?F.KX_TRIP:{},{Y2SUM:'two_days'}); kxYearSet(G,'KX_QIXI',2027,'harbor');
    const N=F.HV_N||(F.HV_N={}); N.kexin=(N.kexin|0)+1; (F.HV_LAST||(F.HV_LAST={})).kexin=G.day; delete F.KX_KH_DAY1; };   /* 去過高雄了：之後的「去她的縣市」用 pickAgain */
  S.khMissed=function(G,q){ const F=G.flags, d1=DK(KH.d1); F.KX_TRIP=Object.assign({},(F.KX_TRIP&&typeof F.KX_TRIP==='object')?F.KX_TRIP:{},{Y2SUM:'missed'}); F.KX_RUB=(F.KX_RUB|0)+1;
    plan(G,CALL('y3_kh_call','ev_kexin_kh_missed_call',G.day,Math.max(G.day===d1?9.5:0,G.hour),{late:3,must:true}));
    PHONE.at(G,d1,18,[K('（照片：燈塔上往下看的海）'),K('一個人爬上去了。')],'y3_kh_photo'); };
  /* D：其他年份的七夕、或這一趟沒去的（視訊 21:00；她在高雄）。2029 年（她留在臺北準備律師考試）是大四的，不在這一批 */
  S.QIXI=[{key:'2026-08-19',ok:G=>true},{key:'2027-08-08',ok:G=>{ const F=G.flags; return F.KX_KH_GO===false||!!(F.KX_TRIP&&F.KX_TRIP.Y2SUM==='missed'); }},{key:'2028-08-26',ok:G=>!abroadOn(G,DK('2028-08-26'))}];
  S.qixiPhone=function(G){ if(!dating(G,'kexin')) return; for(const x of S.QIXI){ const d=DK(x.key); if(d==null||G.day<d-7||G.day>d||(G.day===d&&G.hour>=21.5)) continue; const id='kx_qixi_'+x.key.slice(0,4); if(outGet(G,id)||!x.ok(G)) continue;
      plan(G,VIDEO(id,'ev_kexin_qixi_video',d,21,'可昕的視訊：七夕',{alarm:false})); } };   /* 她打來的（沒有約）：不設鬧鐘 */
  S.qixiVideoDone=G=>{ const y=typeof CALENDAR!=='undefined'?CALENDAR.dateOf(G.day).y:null; if(y) kxYearSet(G,'KX_QIXI',y,'video'); };

  /* ===================== 2-Y3-02 方奕廷 F2「山上沒有訊號」 ===================== */
  const F2={inv1:'2027-07-20',d1:'2027-07-24',inv2:'2027-08-16',d2:'2027-08-21'};
  const Fy=P('npc_fangyt'), Fr=R('npc_fangyt');
  S.f2Ok=G=>knows('npc_fangyt',G)&&typeof SOCIAL!=='undefined'&&!!SOCIAL.rel&&(SOCIAL.rel('npc_fangyt').talked|0)>=3;   /* 到大二暑假為止說過話 3 次以上 */
  S.f2Phone=function(G){ const F=G.flags, a=DK(F2.inv1), b=DK(F2.d1), c=DK(F2.inv2), e=DK(F2.d2); if(a==null||G.day<a||G.day>e+1) return; const n=now(G);
    if(n>=T(a,21)&&n<T(b,5)&&!sent(G,'y3_f2_inv')&&!F.FANG_F2&&S.f2Ok(G)){ silentContact(G,'npc_fangyt');
      PHONE.at(G,a,atH(G,a,21),[Object.assign(Fy('這週六爬山。缺一個人。不用會。'),{ask:{id:'y3_f2_inv',until:T(b,5),opts:[{t:'好。',say:[Fr('早上六點半，臺北車站的客運站。帶兩瓶水。')],set:{FANG_F2_GO:1}},{t:'這週不行。',say:[Fr('好。那下次。山不會跑。')],set:{FANG_F2_GO:0}}]}})],'y3_f2_inv'); }
    const m1=PHONE.byAsk(G,'y3_f2_inv'), no1=!!m1&&(m1.ans===1||(m1.ans==null&&n>=T(b,5)));   /* 拒絕或不回 */
    if(no1&&n>=T(c,21)&&n<T(e,5)&&!sent(G,'y3_f2_inv2')&&!F.FANG_F2)
      PHONE.at(G,c,atH(G,c,21),[Object.assign(Fy('這週六再去爬一次山。還是缺一個人。不用會。'),{ask:{id:'y3_f2_inv2',until:T(e,5),opts:[{t:'好。',say:[Fr('早上六點半，臺北車站的客運站。帶兩瓶水。')],set:{FANG_F2_GO:2}},{t:'這週不行。',say:[Fr('好。山還在。')],set:{FANG_F2:'declined'}}]}})],'y3_f2_inv2');
    { const m2=PHONE.byAsk(G,'y3_f2_inv2'); if(m2&&m2.ans==null&&n>=T(e,5)&&!F.FANG_F2) F.FANG_F2='declined'; }   /* 第二次也不回＝這個暑假沒有 */
    const go=F.FANG_F2_GO, day=go===1?b:go===2?e:null;
    if(day!=null&&!F.FANG_F2&&!outGet(G,'y3_f2')&&n<T(day,6.75)) plan(G,{id:'y3_f2',ev:'ev_fangyt_mountain',day,h:6.5,late:0.25,place:'臺北車站的客運站',title:'爬山（方奕廷）',travel:'捷運約 30 分鐘',travelH:0.5,back:'回到臺北。',alarm:true}); };
  S.f2Missed=function(G,q){ const F=G.flags; F.FANG_F2='missed'; const d=q&&q.day!=null?q.day:G.day; PHONE.at(G,d,6.75,[Fy('我們先走了。你的位子我沒補人。')],'y3_f2_gone'); PHONE.at(G,d,22,[Fy('（照片：雲海）'),Fy('沒訊號。下山才傳。')],'y3_f2_photo'); };

  /* ===================== 2-Y3-03 迎新（大三版）＋ 2-Y3-04 開學第一頓 ＋ 2-Y3-05 哲 3 的群組 ===================== */
  const LC=M('g:law_class','law_assoc','系學會');
  S.welcomePhone=function(G){ if(!grp(G,'law_class')) return; const di=DK('2027-09-02'), d=DK('2027-09-04'); if(di==null||G.day<di||G.day>d+1) return;
    if(now(G)>=T(di,21)&&G.day<=d&&!sent(G,'y3_welcome_ask')){ PHONE.at(G,di,atH(G,di,21),[LC('禮拜六迎新，大三的關主一點在社科院旁的草地集合。')],'y3_welcome_ask');
      if(!outGet(G,'y3_welcome')&&(G.day<d||G.hour<13.25)) plan(G,{id:'y3_welcome',ev:'ev_y3_welcome',day:d,h:13,late:0.25,place:'社科院旁的草地',title:'迎新（關主）',travel:'走過去約 10 分鐘',travelH:1/6}); } };
  S.welcomePhoto=G=>{ const d=DK('2027-09-04'); if(d!=null&&grp(G,'law_class')) PHONE.at(G,d,21.5,[LC('（照片：草地上，新生圍成一圈）')],'y3_welcome_photo'); };
  const zheTh=G=>grp(G)?'g:noodle_team':(met(G,'zhe','FAMILIAR')?'p:zhe':null);   /* 不在群組、和阿哲 FAMILIAR 以上＝阿哲私訊 */
  S.firstMealPhone=function(G){ const d=DK('2027-09-09'); if(d==null||G.day!==d) return; const th=zheTh(G); if(!th) return;
    if(G.hour>=17&&!sent(G,'y3_first_meal_ask')){ PHONE.at(G,d,atH(G,d,17),[{th,from:'zhe',text:'大三第一頓 七點 長桌'}],'y3_first_meal_ask');
      if(!outGet(G,'y3_first_meal')&&G.hour<19.25) plan(G,{id:'y3_first_meal',ev:'ev_y3_first_meal',day:d,h:19,late:0.25,place:'阿鳳麵店',title:'開學第一頓',travel:'走過去約 15 分鐘',travelH:0.25}); } };
  S.firstMealPhoto=G=>{ const d=DK('2027-09-09'), th=zheTh(G); if(d!=null&&th) PHONE.at(G,d,21.5,[{th,from:'zhe',text:'（照片：新的菜單，每一個價錢都貼了一張小紙條）'}],'y3_first_meal_photo'); };
  S.captainPhone=function(G){ const d=DK('2027-09-10'); if(d==null||G.day!==d||G.hour<12) return; const th=zheTh(G); if(!th||sent(G,'y3_zhe3_ask')) return; PHONE.at(G,d,atH(G,d,12),[{th,from:'zhe',text:'今天傍晚球場 新球季第一次練'}],'y3_zhe3_ask'); };

  /* ===================== 2-Y3-06 可昕 K15「三十分鐘的晚餐」 ===================== */
  S.k15Phone=function(G){ const F=G.flags, d=DK('2027-09-22'); if(d==null||G.day<d||G.day>d+1||!dating(G,'kexin')) return; const n=now(G);
    if(n>=T(d,17)&&n<T(d,18)&&!sent(G,'y3_k15')) PHONE.at(G,d,atH(G,d,17),[Object.assign(K('我七點要回學校。六點公館，吃三十分鐘，夠嗎？'),{ask:{id:'y3_k15',until:T(d,18),opts:[{t:'夠。',say:[Kr('好。六點，不要遲到。')],set:{KX_K15_GO:true}},{t:'今天不行。',set:{KX_K15:'declined'}}]}})],'y3_k15');   /* AA_376 #13：「我七點有課。」→「我七點要回學校。」（下一個週三 9/29 她 19:00 在台大聽講座）*/
    if(F.KX_K15_GO===true&&!F.KX_K15&&!outGet(G,'y3_k15')&&n<T(d,18+1/6)) plan(G,{id:'y3_k15',ev:'ev_kexin_30min',day:d,h:18,late:1/6,place:'公館',title:'公館 18:00（三十分鐘）',travel:'走過去約 10 分鐘',travelH:1/6});
    { const m=PHONE.byAsk(G,'y3_k15'); if(m&&m.ans==null&&n>=T(d,18)&&F.KX_K15==null) F.KX_K15='declined'; }   /* 不回＝婉拒那一版（AA 只寫了婉拒：要問 AA）*/
    if(F.KX_K15==='declined'&&n>=T(d,18.5)&&!sent(G,'y3_k15_photo')) PHONE.at(G,d,18.5,[K('（照片：一個空碗）'),K('吃完了。下次換你挑。')],'y3_k15_photo'); };   /* 她吃完傳（18:30）*/
  S.k15Missed=function(G,q){ const F=G.flags, d=q&&q.day!=null?q.day:DK('2027-09-22'); F.KX_K15='missed'; F.KX_RUB=(F.KX_RUB|0)+1; PHONE.at(G,d,18.25,[K('我先吃了。七點有課。')],'y3_k15_late'); };

  /* ===================== 2-Y3-07 可昕 K11「她來台大聽講座」 ===================== */
  S.k11Phone=function(G){ const F=G.flags, di=DK('2027-09-27'), d=DK('2027-09-29'); if(di==null||G.day<di||G.day>d+1||!dating(G,'kexin')) return; const n=now(G);
    if(n>=T(di,21)&&n<T(d,18.5)&&!sent(G,'y3_k11')) PHONE.at(G,di,atH(G,di,21),[Object.assign(K('你們學校這週有一場講座，我想聽。我要去。你要嗎？'),{ask:{id:'y3_k11',until:T(d,18.5),opts:[{t:'一起去。',say:[Kr('好。禮拜三七點，博思。我先占位子。')],set:{KX_K11_GO:true}},{t:'那天我不行。',say:[Kr('好。我自己聽。')],set:{KX_K11_SELF:true}}]}})],'y3_k11');
    { const m=PHONE.byAsk(G,'y3_k11'); if(m&&m.ans==null&&n>=T(d,18.5)&&!F.KX_K11_GO) F.KX_K11_SELF=true; }   /* 不回：她照樣自己聽 */
    if(F.KX_K11_GO&&!F.KX_K11&&!outGet(G,'y3_k11')&&n<T(d,19.25)) plan(G,{id:'y3_k11',ev:'ev_kexin_lecture_ntu',day:d,h:19,late:0.25,place:'博思教學館',title:'講座（博思）19:00',travel:'走過去約 8 分鐘',travelH:8/60,alarm:true});
    if(F.KX_K11_SELF&&!F.KX_K11&&n>=T(d,21)&&!sent(G,'y3_k11_heard')){ PHONE.at(G,d,21,[K('我先回去了。今天的講座我很喜歡。')],'y3_k11_heard'); F.KX_K11='heard'; } };
  S.lectureMissed=G=>{ G.flags.KX_K11_SELF=true; };   /* 答應了沒到：照「她自己聽」（小桌子、21:00 那一則）*/
  S.lectureAttended=function(G){ if(typeof ACTIVITIES!=='undefined'&&ACTIVITIES.rec){ const A=ACTIVITIES.rec(G).att; A['B6c@'+G.day]={h:19,end:'full'}; } };   /* 一起聽的記 attended:'B6c'（BB_105）*/

  /* ===================== 2-Y3-08 子晴 Q8b ===================== */
  const Zq=P('heroine_04'), Zqr=R('heroine_04');
  S.q8bPhone=function(G){ const F=G.flags, d=DK('2027-10-06'); if(d==null||G.day<d||G.day>d+3||!met(G,'heroine_04','FAMILIAR')) return; const n=now(G);
    if(G.day<=d+2&&n>=T(d,21.5)&&!sent(G,'y3_q8b')&&!done(G,'ev_ziqing_dad_stuck')) PHONE.at(G,d,atH(G,d,21.5),[Zq('你有空嗎'),Zq('我在公館 騎樓那邊'),Object.assign(Zq('給你看一個東西 很好笑'),{ask:{id:'y3_q8b',until:T(d+2,23.5),opts:[{t:'好，十分鐘。',say:[Zqr('快點')]},{t:'明天再看？',say:[Zqr('好 那明天')]}]}})],'y3_q8b');
    if(sent(G,'y3_q8b')&&!done(G,'ev_ziqing_dad_stuck')&&n>=T(d+2,23)&&!sent(G,'y3_q8b_phone')){   /* 三天都沒去：手機版（一樣記 DAD_PLAYS；事件算演過，Q10、閒聊階梯讀它）*/
      PHONE.at(G,d+2,23,[Zq('我爸傳的「第三關怎麼過」'),Zq('他在玩我做的遊戲 上個月丟到網路上的 他自己找到的'),Zq('卡三天了 他真的很爛')],'y3_q8b_phone'); F.ZQ_Q8B_PHONE=true; remember('heroine_04','DAD_PLAYS'); mark(G,'ev_ziqing_dad_stuck'); } };

  /* ===================== 2-Y3-09 颱風假（10/13）T3a、T3b ===================== */
  const FT='g:family_law', KV=M(FT,'kevin','Kevin'), SIS=M(FT,'heroine_05','溫學姊'), JR=t=>({th:FT,name:'學妹',text:t});
  const KVr=t=>({from:'kevin',name:'Kevin',text:t}), SISr=t=>({from:'heroine_05',name:'溫學姊',text:t});
  S.typhoonPhone=function(G){ const F=G.flags, d=DK('2027-10-13'); if(d==null||G.day<d||G.day>d+1||typeof CALENDAR==='undefined'||!CALENDAR.typhoon||!CALENDAR.typhoon(d)) return; const n=now(G);
    if(G.day===d&&n>=T(d,19.5)&&met(G,'kai','FAMILIAR')&&!sent(G,'y3_t3a')){ silentContact(G,'kai'); PHONE.at(G,d,atH(G,d,19.5),[P('kai')('明天也停課吧'),
      P('kai')('所以我帶豆漿過去')],'y3_t3a'); }   /* AA_519 第 9 節第 1 點「這兩場裡其他泡麵也照這個換」：大三這一場阿凱帶的是兩杯熱豆漿（原本「所以我帶泡麵過去」，子代理照同樣的意思改）*/
    if(grp(G,'family_law')&&n>=T(d,21)&&!sent(G,'y3_t3b'))
      PHONE.at(G,d,atH(G,d,21),[KV('明天家族讀書會還要嗎 颱風欸 @學姊'),SIS('線上。想來的再來。'),Object.assign(JR('……我已經把書收起來了。'),{ask:{id:'y3_t3b',until:T(d+1,19),opts:[
        {t:'明天可以休息嗎？',say:[SISr('……好。休息。')],set:{SIS_TYPHOON_Y3:'rest'}},
        {t:'我會上線。',say:[KVr('不要！'),SISr('……那就兩個人上。其他人休息。')],set:{SIS_TYPHOON_Y3:'online'}},
        {t:'（貼一張鞠躬的企鵝）',post:'（貼圖：鞠躬的企鵝）',say:[SISr('（貼圖：鞠躬的企鵝）'),KVr('學姊會用貼圖了！！')],set:{SIS_TYPHOON_Y3:'penguin'}}]}})],'y3_t3b');
    if(F.SIS_TYPHOON_Y3==='online'&&!outGet(G,'y3_t3b_online')&&n<T(d+1,19+1/6))   /* 10/14（四）19:00～19:50（20:00 是公法讀書會）；19:10 還沒上線＝什麼都不發生、她不追人（AA_343 B4）*/
      plan(G,{id:'y3_t3b_online',ev:'ev_typhoon_y3_family',day:d+1,h:19,late:1/6,place:'視訊',verb:'上線',no:'今天先不要',title:'家族讀書會（線上）',travel:'',travelH:0,back:'視訊結束。'}); };

  /* ===================== 2-Y3-10 可昕「主線 4 的那通電話」 ===================== */
  /* 主線 4 回得不少：G.needed.answered ≥ 8（AA_343 B5：一週最多回兩則、一年最多六十幾則，8 則大約是一個月有在回；有打開過每週訊息的玩家幾乎都有）*/
  S.NEED_MIN=8;
  S.helperOk=G=>dating(G,'kexin')&&!!G.needed&&(G.needed.answered|0)>=S.NEED_MIN;
  const CD1='2027-10-18', CD2='2027-10-22';
  S.callPhone=function(G){ const F=G.flags, d1=DK(CD1), d2=DK(CD2); if(d1==null||G.day<d1||G.day>d2+1) return;
    if(F.KX_HELPER_CALL==null&&S.helperOk(G)){
      if(G.day===d1&&G.hour>=22&&!outGet(G,'y3_kx_call1')) plan(G,CALL('y3_kx_call1','ev_kexin_call_helper',d1,G.hour));   /* 22:00 起響；在做別的事的，結束後響（S.tick 在劇情中不跑）；10 分鐘沒接＝沒接 */
      else if(G.day>d1&&!outGet(G,'y3_kx_call1')) S.helperMissed(G); }   /* 睡過了（WAKE_AT 叫不醒的情況）：當作沒接 */
    if(F.KX_HELPER_CALL==='dodge'&&F.KX_HELPER_CALL2==null&&G.day===d2&&G.hour>=22&&!outGet(G,'y3_kx_call2')) plan(G,CALL('y3_kx_call2','ev_kexin_call_helper2',d2,G.hour)); };
  S.helperMissed=function(G){ const d1=DK(CD1); G.flags.KX_HELPER_CALL='missed'; PHONE.at(G,d1,22+1/6,[K('你在忙。……沒事，不是急的。')],'y3_kx_call1_missed'); };   /* 沒接的沒有 10/22 那一通 */
  /* 讀它的：AA_315 1A-04（story3d.js 的感冒那一週）——'admit' 或 KX_HELPER_CALL2:'tell' 的玩家，10/23 起床時「（傳訊息跟可昕說……）」排第一（AA_326 2-Y3-10 第 4 節）。
     那一串選項照 ROM.partners 的順序（cwPartners）：只在 10/23 那一天、只對這兩種玩家，把可昕排到最前面（不改 story3d.js）*/
  S.kxFirst=G=>{ const F=(G&&G.flags)||{}; return law(G)&&G.day===DK('2027-10-23')&&dating(G,'kexin')&&(F.KX_HELPER_CALL==='admit'||F.KX_HELPER_CALL2==='tell'); };
  if(typeof ROM!=='undefined'&&ROM.partners&&!ROM._r2y3aKxFirst){ const orig=ROM.partners; ROM._r2y3aKxFirst=true;
    ROM.partners=function(G){ const L=orig.apply(this,arguments); return Array.isArray(L)&&S.kxFirst(G)&&L.includes('kexin')?['kexin'].concat(L.filter(id=>id!=='kexin')):L; }; }
  S.wakeAt=function(G){ const F=(G&&G.flags)||{}; if(!law(G)) return null; const d1=DK(CD1), d2=DK(CD2);
    if(G.day===d1&&G.hour<22&&F.KX_HELPER_CALL==null&&S.helperOk(G)) return 22;
    if(G.day===d2&&G.hour<22&&F.KX_HELPER_CALL==='dodge'&&F.KX_HELPER_CALL2==null&&dating(G,'kexin')) return 22;
    return null; };

  /* ===================== 2-Y3-11 刑訴旁聽作業 ===================== */
  const CR={w7:'2027-10-19',an:'2027-10-22',bohan:'2027-10-20',zhe:'2027-11-16',w11:'2027-11-19',w12:'2027-11-22'};
  const NG='g:noodle_team', A_=M(NG,'heroine_01'), B_=M(NG,'classmate_bohan'), Z_=M(NG,'zhe'), Y_=M(NG,'yu');
  S.CR_RETURN=['格式對了。理由可以再具體一點。','你把旁聽看到的程序寫進去了。這樣很好。','第二段太長。其他不錯。'];   /* 第 13 週發回（三句輪流一句）*/
  S.crSkipped=G=>G.flags.CRIMPRO_W7==null;   /* 翹了第 7 週那堂課＝課堂上沒聽到作業（S.crClass 記 CRIMPRO_W7；遲到超過 15 分鐘進去的照樣聽得到後半堂）*/
  S.crCourt=function(G,who){ const d=DK(CR[who]); if(d==null||outGet(G,'y3_cr_'+who)) return; if(now(G)>=T(d,14)) return;
    plan(G,{id:'y3_cr_'+who,ev:'ev_crimpro_court_visit',day:d,h:13.5,late:0.5,place:'地方法院大門口',title:'地方法院（旁聽）',travel:'捷運約 30 分鐘',travelH:0.5,alarm:true,crWith:who}); };   /* 手機行事曆＝出遊；當天 12:30 鬧鐘（出發前 30 分鐘）*/
  /* 自己找一天：第 7～11 週平日（國定假日不算）13:00～14:00 的出發選單（每天一筆；「不去了」＝今天不去）。約了人、那一天還沒過的不出現；約的那一趟沒去成的照樣可以自己去 */
  S.crSelfOpen=function(G){ const F=G.flags; if(!F.CRIMPRO_TOLD||F.CRIMPRO_HW||typeof CALENDAR==='undefined') return false; const t=CALENDAR.termOf(G.day); if(!t||t.id!=='Y3S1'||t.week<7||t.week>11) return false;
    if(G.weekday<1||G.weekday>5||CALENDAR.holiday(G.day)) return false; const x=hh(G); if(x<12.5||x>=14) return false;
    const w=F.CRIMPRO_WITH; if(w&&w!=='self'){ const q=outGet(G,'y3_cr_'+w), d=DK(CR[w]); if(q&&q.state==='planned') return false; if(!q&&d!=null&&now(G)<T(d,14)) return false; } return true; };
  S.crPhone=function(G){ const F=G.flags, d=DK(CR.w7), e=DK(CR.w11); if(d==null||G.day<d) return; const n=now(G);
    if(grp(G)&&G.day<=e&&n>=T(d,21)&&!sent(G,'y3_cr_grp')){ const O=[];
      if(knows('heroine_01',G)) O.push({t:'我跟以安去。',set:{CRIMPRO_WITH:'an'}}); if(knows('classmate_bohan',G)) O.push({t:'我週三跟柏翰。',set:{CRIMPRO_WITH:'bohan'}}); if(knows('zhe',G)) O.push({t:'我也最後一週，跟阿哲。',set:{CRIMPRO_WITH:'zhe'}});
      O.push({t:'我自己找一天。',set:{CRIMPRO_WITH:'self'}});
      const L=(S.crSkipped(G)?[B_('今天刑訴發了旁聽作業。'),B_('自己去地院旁聽，第十二週交答辯狀。你記得。')]:[])   /* 翹了第 7 週那堂課（AA_180 改成作業）*/
        .concat([A_('旁聽我禮拜五下午去。開庭表我查好了。'),B_('我週三下午沒課。週三。'),Z_('我最後一週再說'),Y_('阿哲你每次都這樣')]).filter(m=>knows(m.from,G));   /* 只有認識的人說話（第 0 節）*/
      if(L.length){ L[L.length-1]=Object.assign({},L[L.length-1],{ask:{id:'y3_cr_grp',until:T(e,12),opts:O}}); PHONE.at(G,d,atH(G,d,21),L,'y3_cr_grp'); F.CRIMPRO_TOLD=true; } }
    const w=F.CRIMPRO_WITH; if(w&&w!=='self'&&!F.CRIMPRO_HW) S.crCourt(G,w);
    if(S.crSelfOpen(G)&&!outGet(G,'y3_cr_self_'+G.day)) plan(G,{id:'y3_cr_self_'+G.day,ev:'ev_crimpro_court_visit',day:G.day,h:13.5,late:0.5,ask:T(G.day,13),place:'地方法院',title:'地方法院（旁聽）',travel:'捷運約 30 分鐘',travelH:0.5,crWith:'self'});
    if(!F.CRIMPRO_HW&&G.day>=DK(CR.w12)) F.CRIMPRO_HW='none'; };   /* 第 11 週以前都沒去 */
  S.courtDone=function(G){ const F=G.flags; F.CRIMPRO_HW='done'; F.CRIMPRO_WITH=F._CR_WITH||F.CRIMPRO_WITH||'self'; delete F._CR_WITH; };
  S.courtMissed=function(G,q){ };   /* 約的那一趟沒去：之後照樣可以自己去（S.crSelfOpen）；自己那一天「不去了」＝今天不去 */
  /* 課堂段（CLS.IN_CLASS：課堂那一句後面）：第 7 週（第一句是 syllabus 的 line）、第 12 週交、第 13 週發回 */
  S.crClass=async function(GM,it,prof,ct){ const G=GM.G, F=G.flags; if(!it||!it.c||it.c.id!=='crimpro'||it.exam||!law(G)||typeof CALENDAR==='undefined') return false; const t=CALENDAR.termOf(G.day); if(!t||t.id!=='Y3S1') return false;
    const say=x=>GM.say(prof||null,(prof?'':((ct&&ct.prof)||(typeof CLS!=='undefined'&&CLS.profName?CLS.profName(it.c):'林教授'))+'：')+x);
    if(t.week===7&&F.CRIMPRO_W7==null&&!(ct&&ct.second)){ F.CRIMPRO_W7=G.day; F.CRIMPRO_TOLD=true;   /* 第 7 週的作業在那一週的第一堂（週二）；週五是第二格的短片段（ct.second），不在那裡補講 */
      await say('第二，自己去地方法院旁聽一場刑事庭，日期自己挑。'); await say('第三，你是那個案例的辯護律師，寫一份答辯狀。第十二週交。');
      if(!grp(G)&&F.CRIMPRO_WITH==null) F.CRIMPRO_WITH='self'; return true; }   /* 不在麵店團群組：課堂上聽完就是「自己找一天」*/
    if(t.week===12&&F.CRIMPRO_W12==null){ F.CRIMPRO_W12=G.day; if(F.CRIMPRO_HW==='done') await GM.say(null,'（答辯狀在你的資料夾裡，已經交了。）'); else { F.CRIMPRO_HW='none'; await say('旁聽作業，還有幾位沒交。'); } return true; }
    if(t.week===13&&F.CRIMPRO_W13==null&&F.CRIMPRO_HW==='done'){ F.CRIMPRO_W13=G.day; const k=typeof CLS!=='undefined'&&CLS.rot?CLS.rot(it,3):0; await say(S.CR_RETURN[k]||S.CR_RETURN[0]); return true; }
    return false; };

  /* 2-Y3-12 慈 4 的 Alison 三則（「芯慈跟以安吵架了」）：AA_547 第 2 節拿掉（D116） */

  /* ===================== 2-Y3-13 以安新 14：沒遇到＝22:00 麵店團群組（不在群組、和她 FRIEND 以上＝私訊）===================== */
  S.an14Phone=function(G){ const F=G.flags, d=DK('2027-10-21'); if(d==null||G.day<d||G.day>d+1||F.AN14||done(G,'ev_an_admin_court')||now(G)<T(d,22)) return;
    const th=!knows('heroine_01',G)?null:grp(G)?NG:(met(G,'heroine_01','FRIEND')?'p:heroine_01':null); if(!th) return;
    /* AA_462 第 1 節：「我自己去」緊接在「我跟以安去。」後面像放你鴿子——換字；約了她週五一起去地院的（CRIMPRO_WITH 'an'）多一句 */
    PHONE.at(G,d,atH(G,d,22),[{th,from:'heroine_01',text:'今天下午我先去了一趟行政法院。自己想看的。'},{th,from:'heroine_01',text:'是一個人告區公所。'}].concat(F.CRIMPRO_WITH==='an'?[{th,from:'heroine_01',text:'禮拜五的地院照舊。'}]:[]),'y3_an14_msg'); F.AN14='group'; remember('heroine_01','AN_ADMIN_COURT'); };

  /* ===================== 2-Y3-14 翰 4：柏翰接讀書會的版本＝11/18（四）21:40 私訊 ===================== */
  S.bohanPhone=function(G){ const F=G.flags, d=DK('2027-11-18'); if(d==null||G.day<d||G.day>d+1||now(G)<T(d,21+40/60)||sent(G,'y3_bohan_w11')) return;
    if(!done(G,'ev_bohan_third_floor')||F.STUDYGROUP_LEADER||!done(G,'ev_bohan_scores')) return; silentContact(G,'classmate_bohan');
    PHONE.at(G,d,atH(G,d,21+40/60),[P('classmate_bohan')('白板那張表我還留著。這學期換成大家輪流寫。')],'y3_bohan_w11'); };

  /* ===================== 2-Y3-15 校慶：11/12（五）21:00 柏翰在法服群組 ===================== */
  const FF='g:lawclub_study', BF=M(FF,'classmate_bohan'), BFr=R('classmate_bohan');
  const member=G=>typeof STORY!=='undefined'&&!!STORY.fafuMember&&STORY.fafuMember(G);
  S.fairPhone=function(G){ const d=DK('2027-11-12'); if(d==null||G.day<d||G.day>d+1||!member(G)||!grp(G,'lawclub_study')||now(G)<T(d,21)||sent(G,'y3_fair_ask')) return;
    PHONE.at(G,d,atH(G,d,21),[BF('明天校慶。法服的攤位十點開。'),Object.assign(BF('早上誰可以來搬桌子。'),{ask:{id:'y3_fair_ask',until:T(d+1,9.5),opts:[{t:'我。',say:[BFr('好。九點半。')],set:{FAIR_Y3_HELP:true}}]}})],'y3_fair_ask'); };

  /* ===================== 2-Y3-16 C4 阿哲的機車（LEGAL_REVIEW_REQUIRED：U_TORT 那個選項的字是 BB 10-14 查過的）===================== */
  const Zh=P('zhe'), Zhr=R('zhe'), Me=t=>({from:'player',who:null,text:t});
  S.c4Phone=function(G){ const F=G.flags, d=DK('2027-11-19'); if(d==null||G.day<d||G.day>d+1||!met(G,'zhe','FAMILIAR')) return; const n=now(G);
    if(n>=T(d,21)&&!sent(G,'y3_c4')){ silentContact(G,'zhe');
      /* 第一則回覆固定（大三的祐廷一定會說到這裡），接著選「向誰」，然後問「你真正想要的是什麼？」（AA_117；「四個問題」的筆記畫面還沒有：先用訊息的回覆）*/
      const tail=[Me('你真正想要的是什麼？'),Zhr('……我想要我的車修好 然後不要再想這件事'),Me('那就照修車的估價談，談好寫清楚。'),Zhr('好 我先拍照')];
      const opt=(t,k)=>({t,post:false,say:[Me('先不要簽。拍照、報警做紀錄。'),Me(t)].concat(tail),mem:[{npc:'zhe',tag:'ZHE_SCOOTER',note:''}],set:{ZHE_C4:k}});
      const O=[opt('找對方談。後面怎麼賠，我們去法服問。','fafu')];   /* AA_462 第 2 節：原本開頭只有「對方。」接不上前一句；U_TORT 那一句不動 */ if(F.U_TORT) O.push(opt('如果是對方不小心造成的，修車費可以要他賠。他有保第三人責任險的話，保險公司會來談。','tort'));
      PHONE.at(G,d,atH(G,d,21),[Zh('我剛在路口被一台車擦到'),Zh('我沒事啦 人好好的 車殼裂了'),Zh('對方說他趕時間 要給我一千塊 叫我簽一張紙'),Object.assign(Zh('要簽嗎'),{ask:{id:'y3_c4',until:T(d+1,18),opts:O}})],'y3_c4'); }
    const m=PHONE.byAsk(G,'y3_c4'); if(m&&m.ans==null&&n>=T(d+1,18)&&!sent(G,'y3_c4_noreply')) PHONE.at(G,d+1,18,[Zh('沒事啦 我沒簽 明天去修車')],'y3_c4_noreply'); };   /* 沒回：沒有記憶 */

  /* ===================== 2-Y3-17 語彤事件 14「續約」 ===================== */
  const Yt=P('heroine_03'), Ytr=R('heroine_03');
  S.leasePhone=function(G){ const F=G.flags, d=DK('2027-11-24'); if(d==null) return; const di=d-1, n=now(G);
    if(G.day>=di&&G.day<=d&&n>=T(di,21)&&n<T(d,14.5)){
      if(member(G)&&grp(G,'lawclub_study')){ if(!sent(G,'y3_lease_fafu')) PHONE.at(G,di,atH(G,di,21),[Object.assign(BF('明天下午兩點半，麵店。續約的談話，要一個人做紀錄。'),{ask:{id:'y3_lease_fafu',until:T(d,14.5),opts:[{t:'我去。',say:[BFr('好。')],set:{YT_EV14_GO:true}}]}})],'y3_lease_fafu'); }   /* 不回＝別人去 */
      else if(dating(G,'heroine_03')&&!sent(G,'y3_lease_yt')) PHONE.at(G,di,atH(G,di,21),[Yt('明天下午兩點半 阿姨要談續約'),Object.assign(Yt('……你坐我旁邊就好'),{ask:{id:'y3_lease_yt',until:T(d,14.5),opts:[{t:'好。',say:[Ytr('嗯')],set:{YT_EV14_GO:true}},{t:'那天我不行。',say:[Ytr('嗯 沒關係')]}]}})],'y3_lease_yt'); }
    if(F.YT_EV14_GO===true&&!F.YT_EV14&&!outGet(G,'y3_lease')&&n<T(d,14.75)) plan(G,{id:'y3_lease',ev:'ev_yt_lease_renew',day:d,h:14.5,late:0.25,place:'阿鳳麵店',title:'續約（阿鳳麵店 14:30）',travel:'走過去約 15 分鐘',travelH:0.25,alarm:true});
    const dm=DK('2027-12-14'); if(dm!=null&&G.day>=dm&&G.day<=dm+1&&n>=T(dm,21)&&!F.YT_EV14&&!done(G,'ev_yt_lease_renew')&&met(G,'heroine_03','FAMILIAR')&&!sent(G,'y3_lease_msg')){   /* 轉述的窗口都沒遇到：她私訊前兩句 */
      PHONE.at(G,dm,atH(G,dm,21),[Yt('阿姨續約了。五年，寫成書面的。'),Yt('……新屋主說，他高中的時候也來這裡吃過麵。')],'y3_lease_msg'); F.YT_EV14='heard'; } };   /* AA_376 #10：轉述和現場一致（「我高中的時候來過。」）*/

  /* ===================== 2-Y3-19 可昕 K17 ===================== */
  S.k17Phone=function(G){ const F=G.flags; if(!dating(G,'kexin')) return; const n=now(G), d8=DK('2027-12-08');
    if(d8!=null&&G.day>=d8&&G.day<=d8+1){ const d9=d8+1;
      if(n>=T(d8,21)&&n<T(d9,21.75)&&!sent(G,'y3_k17')) PHONE.at(G,d8,atH(G,d8,21),[K('明天晚上九點四十五，視訊。你讀書會結束以後。'),Object.assign(K('我有一件事要你幫忙。'),{ask:{id:'y3_k17',until:T(d9,21.75),opts:[{t:'好。',say:[Kr('好。')],set:{KX_K17_GO:true}},{t:'明天不行。',say:[Kr('好。那我對著牆講。')]}]}})],'y3_k17');
      if(F.KX_K17_GO&&!outGet(G,'y3_k17')&&n<T(d9,22)) plan(G,VIDEO('y3_k17','ev_kexin_tutor_practice',d9,21.75,'可昕的視訊',{late:0.25})); }
    const dj=DK('2028-04-25'); if(dj==null||G.day<dj||G.day>dj+1) return; const dd=dj+1, jp=inJP(G,dd);
    if(jp){ const tz=x=>x+(typeof STORY!=='undefined'&&STORY.tzOffset?STORY.tzOffset(G,dj):0); if(n>=T(dj,tz(21))&&!sent(G,'y3_k17_jr_jp')){ PHONE.at(G,dj,atH(G,dj,tz(21)),[K('讀書會的學弟妹要請你吃飯。你在國外，先視訊被看。')],'y3_k17_jr_jp'); plan(G,VIDEO('y3_k17_jrv','ev_kexin_juniors_video',dd,tz(19.5),'可昕的視訊',{alarm:false})); } return; }   /* 人在日本＝當地時間（台灣＋1；AA_341 J-S7）*/
    if(n>=T(dj,21)&&n<T(dd,17.5)&&!sent(G,'y3_k17_jr')) PHONE.at(G,dj,atH(G,dj,21),[K('讀書會的學弟妹考完了。他們說要請學姊的男朋友吃飯。'),Object.assign(K('你要來被看。'),{ask:{id:'y3_k17_jr',until:T(dd,17.5),opts:[{t:'好。',say:[Kr('明天六點半，山下那家。')],set:{KX_JUNIORS_GO:true}},{t:'我不太想被看。',say:[Kr('……好。我跟他們說你很忙。')],set:{KX_JUNIORS_GO:false}}]}})],'y3_k17_jr');
    if(F.KX_JUNIORS_GO===true&&!F.KX_JUNIORS&&!outGet(G,'y3_k17_dinner')&&n<T(dd,19)) plan(G,{id:'y3_k17_dinner',ev:'ev_kexin_juniors_dinner',day:dd,h:18.5,late:0.5,place:'木柵大學山下的小吃店',title:'學弟妹的飯（木柵大學山下 18:30）',travel:'開車約 40 分鐘',travelH:2/3,alarm:true});
    const m=PHONE.byAsk(G,'y3_k17_jr'), no=F.KX_JUNIORS_GO===false||(!!m&&m.ans==null&&n>=T(dd,17.5));   /* 不去（不回也算：要問 AA）*/
    if(no&&!F.KX_JUNIORS&&n>=T(dd,21)) S.juniorsPhoto(G); };
  S.juniorsPhoto=function(G){ const dd=DK('2028-04-26'); if(dd==null||sent(G,'y3_k17_jr_photo')) return; PHONE.at(G,dd,21,[K('（照片：小吃店的圓桌，三個學弟妹）'),K('他們說下次一定要看到本人。')],'y3_k17_jr_photo'); G.flags.KX_JUNIORS='photo'; };

  /* ===================== 2-Y3-20 語彤事件 13：12/16 17:00 兩則 ===================== */
  S.yt13Phone=function(G){ const d=DK('2027-12-16'); if(d==null||G.day!==d||G.hour<17||G.hour>=19.75||sent(G,'y3_yt13')||!met(G,'heroine_03','FRIEND')) return; silentContact(G,'heroine_03');
    PHONE.at(G,d,atH(G,d,17),[Yt('你今天晚上有空嗎'),Object.assign(Yt('我在總圖三樓'),{ask:{id:'y3_yt13',until:T(d,19.75),opts:[{t:'有，我過去。',say:[Ytr('嗯')]},{t:'今天不行。',say:[Ytr('嗯 沒事')]}]}})],'y3_yt13'); };

  /* ===================== 2-Y3-21 可昕 聖誕 ===================== */
  S.xmasPhone=function(G){ const F=G.flags, d24=DK('2027-12-24'); if(d24==null||G.day<d24||G.day>d24+1||!dating(G,'kexin')) return; const d25=d24+1, n=now(G);
    const teSame=()=>{ const q=outGet(G,'te_kx_Y3S1'); return !!q&&q.day===d25&&q.state!=='cancelled'&&q.state!=='missed'; };   /* AA_462 第 5 節：學期末的飯（te_kx_Y3S1）也排在 12/25＝先講吃完飯 */
    if(n>=T(d24,21)&&n<T(d25,21)&&!sent(G,'y3_kx_xmas')) PHONE.at(G,d24,atH(G,d24,21),[K(teSame()?'明天吃完飯，九點再視訊。':'明天晚上九點，視訊。'),Object.assign(K('我還在趕報告。你陪我就好。'),{ask:{id:'y3_kx_xmas',until:T(d25,21),opts:[{t:'好。',say:[Kr('嗯。')],set:{KX_XMAS3_GO:true}},{t:'明天不行。',say:[Kr('……好。')],set:{KX_XMAS3_GO:false}}]}})],'y3_kx_xmas');
    if(F.KX_XMAS3_GO===true&&!outGet(G,'y3_kx_xmas')&&n<T(d25,21+1/6)) plan(G,VIDEO('y3_kx_xmas','ev_kexin_xmas_y3',d25,21,'可昕的視訊：聖誕',{late:1/6}));   /* 10 分鐘沒接＝沒接 */
    const m=PHONE.byAsk(G,'y3_kx_xmas'); if((F.KX_XMAS3_GO===false||(m&&m.ans==null&&n>=T(d25,21)))&&n>=T(d25,22.5)&&!(F.KX_XMAS&&F.KX_XMAS[3])) S.xmasMissed(G); };   /* 不視訊的（「明天不行」、不回）：報告寫完那一則（要問 AA）*/
  S.xmasMissed=function(G){ const d25=DK('2027-12-25'); kxYearSet(G,'KX_XMAS',3,'missed'); PHONE.at(G,d25,22.5,[K('報告我寫完了。聖誕快樂。禮物等考完。')],'y3_kx_xmas_missed'); };
  S.kxYear=(G,key,v)=>kxYearSet(G,key,3,v);

  /* ===================== 2-Y3-23 可昕 除夕 KN（裁定 #12）===================== */
  S.knPhone=function(G){ const F=G.flags, eve=DK('2028-01-25'); if(eve==null||G.day<eve||G.day>eve+1||!dating(G,'kexin')) return; const ny=eve+1, n=now(G);
    if(n>=T(eve,22)&&!sent(G,'kx_kn_y3')) PHONE.at(G,eve,atH(G,eve,22),[K('新年快樂。'),K('今年圍爐，我舅舅問我：「念法律，以後要當法官嗎？」'),Object.assign(K('我說還不知道。我媽在旁邊說：「她要當律師。」……我什麼時候說過？'),{ask:{id:'kx_kn_y3',until:T(ny,9),opts:[
      {t:'妳媽比妳先決定了。',say:[Kr('對。我等一下要跟她吵。……過完年再吵。')],set:{KX_KN3_PICK:'mom'}},
      {t:'那妳想當什麼？',say:[Kr('……還在想。開學以後再跟你說。')],set:{KX_KN3_PICK:'think'}},
      {t:'打給妳。',post:false,set:{KX_KN3_PICK:'call'}}]}})],'kx_kn_y3');   /* 「打給妳。」＝直接打過去（不替你傳那一句；同大二 y2r2_kn）*/
    if(F.KX_KN3_PICK){ kxYearSet(G,'KX_KN',3,F.KX_KN3_PICK); if(F.KX_KN3_PICK==='call'&&!outGet(G,'kx_kn_call_y3')) plan(G,CALL('kx_kn_call_y3','ev_kexin_kn_call_y3',G.day,G.hour,{late:2,must:true,verb:'打給她',title:'打給可昕'})); delete F.KX_KN3_PICK; }
    const m=PHONE.byAsk(G,'kx_kn_y3'); if(m&&m.ans==null&&n>=T(ny,9)&&!sent(G,'kx_kn_y3_noreply')){ PHONE.at(G,ny,9,[K('新年快樂。我昨天沒跟我媽吵。今天再說。')],'kx_kn_y3_noreply'); kxYearSet(G,'KX_KN',3,'none'); } };

  /* ===================== 2-Y3-24 可昕 情人節（大三寒假）===================== */
  S.vdayPhone=function(G){ const F=G.flags, d13=DK('2028-02-13'); if(d13==null||G.day<d13||G.day>d13+1||!dating(G,'kexin')) return; const d14=d13+1, n=now(G);
    if(n>=T(d13,21)&&n<T(d14,20)&&!sent(G,'y3_kx_vday')) PHONE.at(G,d13,atH(G,d13,21),[Object.assign(K('明天晚上八點，視訊。三十分鐘。'),{ask:{id:'y3_kx_vday',until:T(d14,20),opts:[{t:'好。',say:[Kr('好。')],set:{KX_VDAY3_GO:true}},{t:'明天不行。',say:[Kr('……好。那開學再說。')],set:{KX_VDAY3_GO:false}}]}})],'y3_kx_vday');
    if(F.KX_VDAY3_GO===true&&!outGet(G,'y3_kx_vday')&&n<T(d14,20.5)) plan(G,VIDEO('y3_kx_vday','ev_kexin_valentine_y3',d14,20,'可昕的視訊：情人節',{late:0.5})); };
  S.vdayMissed=function(G){ const d14=DK('2028-02-14'); kxYearSet(G,'KX_VDAY',3,'missed'); PHONE.at(G,d14,20.5,[K('打了兩次。……三十分鐘我拿去看書了。'),K('情人節快樂。')],'y3_kx_vday_missed'); };
  S.vdayGiraffe=G=>{ if(typeof PHONE!=='undefined'&&!sent(G,'y3_kx_vday_giraffe')) PHONE.at(G,G.day,G.hour,[K('（貼圖：長頸鹿）')],'y3_kx_vday_giraffe'); };   /* 旁白「她傳來一張長頸鹿的貼圖」：手機裡也有那一張 */

  /* ===================== 2-Y3-25 日本路線 X1 退宿＝主線 8「出發前」 ===================== */
  const X1D='2028-02-20';
  S.x1Due=G=>{ const d=DK(X1D); return law(G)&&d!=null&&G.day===d&&G.hour>=14&&G.flags.X1_JP==null&&typeof STORY!=='undefined'&&!!STORY.route&&STORY.route(G)==='JP'; };
  /* 裝箱：ROOM_Y3_ITEMS、ROOM_Y2_ITEMS（大三上丟掉的 ROOM_Y3_DISCARD 不在），最近的優先、最多三件；名稱照 ROOM_Y3_TEXT（STORY.roomItemName）*/
  S.x1Items=function(G){ const F=G.flags||{}, y3=Array.isArray(F.ROOM_Y3_ITEMS)?F.ROOM_Y3_ITEMS.slice().reverse():[];
    const y2=Array.isArray(F.ROOM_Y2_ITEMS)?F.ROOM_Y2_ITEMS.slice().reverse():((typeof STORY!=='undefined'&&STORY.roomY2Items&&F.ROOM_Y2)?STORY.roomY2Items(G).map(r=>r[0]).reverse():[]);
    const out=[]; for(const id of y3.concat(y2)){ if(out.length>=3) break; if(id===F.ROOM_Y3_DISCARD||out.some(o=>o.id===id)) continue; const nm=typeof STORY!=='undefined'&&STORY.roomItemName?STORY.roomItemName(G,id):null; if(nm) out.push({id,name:nm}); }
    return out; };
  S.x1Jp=async function(GM){ const G=GM.G, F=G.flags; if(!S.x1Due(G)) return false; F.X1_JP=G.day; mark(G,'ev_x1_moveout_jp');
    GM.sceneBegin(); try{ if(typeof ADV!=='undefined'&&ADV.begin) ADV.begin({background:'blur'});
      await GM.say(null,'（寒假最後一天。紙箱攤在地上。）');
      for(const it of S.x1Items(G)) await GM.say(null,'（'+it.name+'。放進去。）');
      await GM.say(null,'（宿舍的床墊翻起來的時候，下面有一張不知道誰的課表。）');   /* AA_377 第 18 項：507 是大三才搬進去的 */
      await GM.say(null,'（507 你那半邊空了。檯燈原本的位置，桌上留下一圈比較白的印子。）');
      if(typeof ADV!=='undefined'&&ADV.active&&ADV.end) ADV.end();
      await GM.fade(true); if(GM.titleCard) await GM.titleCard('搬回臺北的家','計程車　約 30 分鐘',2400); GM.advance(0.5);
      if(typeof HOME!=='undefined'&&HOME.rec){ const H=HOME.rec(G); H.at=true; H.day=G.day; if(typeof ADV!=='undefined'&&ADV.begin) ADV.begin({background:HOME.bgNow?HOME.bgNow():'dark'}); }
      await GM.fade(false); if(GM.memo) GM.memo('退宿（日本路線）'); if(GM.autosave) GM.autosave(); }
    finally{ GM.sceneEnd(); }
    if(typeof HOME!=='undefined'&&HOME.loop&&HOME.at(G)) await HOME.loop(GM);   /* 之後住臺北的家（2/21～3/24 不在臺大修課）：HOME 還沒有「日本路線住家裡」的模式（要 LAWWW 在 home3d.js 接 STORY.movedOut）*/
    return true; };
  S.x1Phone=function(G){ const F=G.flags, d=DK(X1D); if(d==null||G.day<d) return;
    if(S.x1Due(G)&&atHome(G)&&!outGet(G,'y3_x1_back')) plan(G,{id:'y3_x1_back',must:true,goto:{zone:'dorm',x:0,z:2.4,yaw:Math.PI},day:G.day,h:G.hour,late:8,place:'宿舍',title:'回宿舍',travel:'捷運＋公車 約 40 分鐘',travelH:0.7});   /* 人在臺北的家：先帶回宿舍（字卡「回宿舍」）*/
    if(F.X1_JP==null) return;
    if(knows('classmate_bohan',G)&&G.day<=d+1&&now(G)>=T(d,21)&&!sent(G,'y3_x1_bohan')){ silentContact(G,'classmate_bohan'); const B=P('classmate_bohan');
      PHONE.at(G,d,atH(G,d,21),[B('你的床，下學期學弟要來住。'),Object.assign(B('東西都拿走了嗎。'),{ask:{id:'y3_x1_bohan',opts:[{t:'拿走了。',say:[R('classmate_bohan')('好。八月見。')]}]}})],'y3_x1_bohan'); }
    const d23=DK('2028-02-23'); if(d23!=null&&G.day>=d23-1&&G.day<=d23+7&&!sent(G,'y3_x1_sys')) PHONE.at(G,d23,10,[{th:'sys',name:'系辦',text:'出國交換的役男出境，系辦已經幫你送出申請。'}],'y3_x1_sys'); };

  /* ===================== 掛勾 ===================== */
  S.phone=function(G,GM){ if(!G||!G.flags||!law(G)||typeof PHONE==='undefined') return;
    S.khPhone(G); S.qixiPhone(G); S.f2Phone(G); S.welcomePhone(G); S.firstMealPhone(G); S.captainPhone(G); S.k15Phone(G); S.k11Phone(G); S.q8bPhone(G); S.typhoonPhone(G);
    S.callPhone(G); S.crPhone(G); S.an14Phone(G); S.bohanPhone(G); S.fairPhone(G); S.c4Phone(G); S.leasePhone(G); S.k17Phone(G); S.yt13Phone(G); S.xmasPhone(G);
    S.knPhone(G); S.vdayPhone(G); S.x1Phone(G); };
  let busy=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['r2y3a3d:busy']=()=>{ busy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  S.tick=function(GM){ const G=GM&&GM.G; if(busy||!G||!G.flags||!law(G)) return false; if(atHome(G)) return false;
    if(out()&&OUT.due&&OUT.due(G)) return false;   /* 出遊的「出發」先問 */
    if(S.x1Due(G)&&G.zone==='dorm'){ busy=true; S.x1Jp(GM).catch(e=>console.warn('R2Y3A x1',e)).finally(()=>{ busy=false; }); return true; }
    return false; };
  if(typeof STORY!=='undefined'){
    if(Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push((G,GM)=>S.phone(G,GM));
    if(Array.isArray(STORY.TICKS)) STORY.TICKS.push((GM,dt)=>S.tick(GM,dt));
    if(Array.isArray(STORY.WAKE_AT)) STORY.WAKE_AT.push(G=>S.wakeAt(G)); }
  if(typeof CLS!=='undefined'&&Array.isArray(CLS.IN_CLASS)){ const f=(GM,it,prof,ct)=>S.crClass(GM,it,prof,ct); f.due=(G,it,ct)=>{ const F=G.flags||{}; if(!it||!it.c||it.c.id!=='crimpro'||it.exam||!law(G)||it.term!=='Y3S1') return false; return (it.week===7&&F.CRIMPRO_W7==null&&!(ct&&ct.second))||(it.week===12&&F.CRIMPRO_W12==null)||(it.week===13&&F.CRIMPRO_W13==null&&F.CRIMPRO_HW==='done'); }; CLS.IN_CLASS.push(f); }   /* due：學期中的快轉（src/semff3d.js）停在這一堂前面 */
  return S;
})();
