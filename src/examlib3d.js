/* ===== 期末考前的圖書館：位子很滿、請朋友占位子、看到同學在念書（AA_669 第 0～5、7 節，企劃線 468a1d0b9，AA-C 定稿 D109；任務 EXAM-LIB-CROWD-1104、USER_WANTS X228）=====
   使用者 2026-11-04 16:1x：「期末考前一定要看到圖書館，反正幾乎是不管哪個圖書館就是位子會很滿還要請同學佔位子，然後會看到很多同學在唸書不一定有約，但是就是會看到也可以跟朋友約過去喔，你可以請朋友佔位子」。
   台詞：src/data/examlib_lines.js（EXAMLIB_LINES，照稿一字不差）。第 6 節的場景（社科圖二樓）是 LAWWW2 的（SOCLIB-2F-1104，src/soclib2f3d.js；2026-11-04 接進開發分支）：
   區域沒有載入＝社科圖二樓的人照一樓（S.PLACES.soc2f 的 fallback）；劇情的部分（第一次坐下的旁白、SOCLIB_2F_SEAT、「老位子」那兩句）在下面「■ 第 6 節」。
   ■ 第 0 節 時段（S.on）：每學期第 14 週起，到這學期的期末考考完（CLS.examList 最後一場的結束時間；沒有考試的學期＝期末週的最後一天）；國外那一學期沒有（CLS.termAway）。
     法律系八個學期都有。經濟系那一年沒有（AA_669 第 5 節 11-04 17:2x 改「不用做」：10/17 休學（Y0_LEFT）以後在家、不去台大，第 14 週以後都玩不到；AA-C 11-04 20:56 確認：S.on 對 econ 回 false，第 5 節的資料、S.cast 留著）。
     地點（S.ZONES）：總圖（大廳二樓自習區 library_hall 的二樓、3F 閱覽區 library、B1 自習室 library_b1 的 study24、研究小間 library_carrels）、社科圖（soclib，二樓 soclib_2f 做好以後）、法圖（lawlib）、法律系館A 4F（linze_4f）。
     「滿」（S.fill）：開館後一小時坐到七成、平日 10:00（週末 11:00）以後全滿；社科圖二樓平日 09:00。座位用 crowd3d.js 那一套的位子（E.zone.seats）：
       坐著的人照舊；空的位子照比例標「有人了」（st.exHeld：桌上放東西、人不在——座位的按鈕寫「有人了」、按了只說「有人了。」、SEATACT 照「休息」那一組放桌上的東西）；
       哪幾個位子照日期＋區域＋座位當種子（同一天進出是同一批）。路人、有名字的人照舊可以坐上去（那是他們的東西）；劇情寫死的位子（S.KEEP）不放。
   ■ 第 1 節 一進門的旁白（S.atmosDue）：這一段第一次走進這一間的讀書區（每學期每一間一次），五句輪流；閉館前 30 分鐘內進來＝第 6 句。
     第 1～5 句寫的是坐滿的樣子：坐到五成以上（開館後約四十分鐘起）才放（一開館就進去＝坐到五成的時候才出那一句）。
   ■ 第 2 節 找不到位子（S.fullDue → S.fullPrompt）：這一段全滿的時間以後第一次走到讀書區的座位旁邊（每天每一間一次），提示＋「再繞一圈」「去別間」「回宿舍讀」（住家裡＝「回家讀」）；
     這一間裡有 FRIEND 以上的朋友坐著、旁邊有位子＝多一個「（看到她／他在對你招手）」（坐到旁邊，第 3 節的招呼照演）。
     再繞一圈：時間 +20 分鐘；平日 14:00 以前一半的機會（照日期＋區域）有人收東西走了＝坐下；沒有＝這一次不能再繞。去別間：其他開著的圖書館（快速前往，路程照現有的）。回宿舍讀：快速前往宿舍（住家裡＝HOME.go）。
     有人幫你占了位子（第 4-1 節）的那一天、那一間不跳；約好一起來的（邀約、一起走）也不跳。
   ■ 第 3 節 有名字的人（S.sched：STORY.SCHED_X）：這一段，表上的人作息裡「讀書」（act read）的時段坐到表上的地方（只換讀書的時段；上課、約好的、出遊、劇情的位置、別的模組的作息都照舊；
     那一間沒開＝照作息；只換本來就在圖書館、自習區讀書的時段（S.STUDY_FROM）——Café、店裡、研究室的讀書照作息，那裡有她們的戲）；同一天最多三位在同一間。經濟系那一年三位朋友沒有作息：這一段的平日給一段讀書的時間（S.Y0_SLOTS，LAWWW 暫定，作息歸 BB 可以改）。
     說話（STORY.talkCharacter 包一層，S.talk）：這一段在表上的那一間的讀書區，第一次碰到（這一段、這一間）＝點頭（LIBQ 今天點過頭的也算）；之後每人每學期照順序一句（小聲）那幾句，用完只點頭（在別間照原本的）；
     交往中的人第一句前面多一個動作。pool（二十位同學）：每人每學期一句（四句輪流），說過就照原本的閒聊。劇情、約好的、門檻台詞、第一次見面照舊先。
   ■ 第 4-1 節 請朋友占（S.topicOk／S.send41：手機私訊的話題「明天幫我占位子」，包住 MSG.topics／MSG.send）：這一段每天 18:00～23:00，FRIEND 以上、表上有答應那一句的人，一天只能問一個人。
     明天作息裡有讀書的時段、早上不是上課（考試）＝答應，否則＝不行；答應＝隔天那一間他坐自己的位子、旁邊一個位子「有人了」（st.taken，路人、別人不坐）到他說的時間（以安 9:30、子晴 10:00、學姊 9:00，其他 12:00）。
     那段時間玩家走進讀書區＝直接走過去坐下（GM.seatMenu）→ 他說到了以後那一句（交往中先第 3 節的動作）。到了那個時間還沒到＝他傳沒到那一則（不扣任何數值）；這一學期再問同一個人＝前面多一則「這次會來吧」。
   ■ 第 4-2 節 朋友請你占（S.ask42）：阿哲、Alison、芯慈、語彤每學期最多一次，前一天 21:00 私訊（語彤只在明天是平日；芯慈的便利貼和 4-1 同一學期只用一個）；回「好。」＝隔天 10:00 以前（語彤 09:20）
     在那一間坐下＝「（你把一本講義放在旁邊的位子上。）」、旁邊留一個位子；他照時間走進來坐下、說那一句。沒去、太晚＝他照時間傳沒占到那一則（不扣任何數值）。
   ■ 第 5 節 經濟系那一年（不用做、S.on 不開，見第 0 節；下面是原本的設計，資料留著）：同一套（人換成品妤、阿勳、韋綸）；稿上沒寫的欄（沒到、不行、品妤和阿勳到了以後）不出。休學（Y0_LEFT）、退宿以後不能約（使用者 2026-10-18「重考中不要讓我去台大」）。
   ■ 第 6 節 社科圖二樓（soclib_2f；S.seat2fDue／S.seat2f、S.useOld41、S.holdPick）：這一段第一次在二樓自習室靠窗那排坐下（自己搶到、有人占、招手坐過去都一樣；旁白寫「你在靠窗那排坐下」，
     所以只算靠窗那排）＝旁白一次，記 G.flags.SOCLIB_2F_SEAT＝{x,z,lv,term,day}（那一個位子＝玩家的「老位子」）。之後的學期（記下的不是這一學期、而且是同一個階段：法律系的人不知道經濟系那一年的位子）：
     語彤（經濟系那一年＝阿勳）答應占位子那一句換成「老位子」那一句（hold.yesOld），隔天占的是那一個位子。語彤、阿勳在二樓常坐的位子＝靠窗那排、老位子（seat.old，北往南第三個）的南邊那一個
     （第 6 節「劇情和占位子會用到其中一排」）；「我旁邊」旁邊是老位子就占老位子。二樓「滿」只算自習室的長桌和靠窗（討論室不算）。背景讀書的人：src/soclib2f_people3d.js（S.keepSeats＝哪些位子不要坐）。
   ■ D118：這是氣氛和人際，不是讀書打卡——不扣關係、不影響成績、不強迫每天去（這個檔不呼叫 SOCIAL.adjust、不碰成績）。
   存檔：G.exlib＝{v, atm:{n,seen}, nod:{學期:{區域:{人:1}}}, said:{學期:{人:用了幾句}}, pool:{n,said}, prompt:{日:區域}, ask41, hold, noShow:{學期:{人:1}}, asked42:{學期:{人:日}}, d42, note:{學期:1}}；
     舊存檔沒有＝讀到時補預設；已經過了的學期不補演（全部照現在的日期即時算）。
     第 6 節：G.flags.SOCLIB_2F_SEAT（{x,z,lv,term,day}；沒有＝還沒在這一段坐過二樓靠窗那排：舊存檔照沒有，下一次坐下才演）；hold 多一個 old（[x,z,lv]：之後的學期占老位子；舊的 hold 沒有＝照旁邊的位子）。
   測試：node tests/exam_lib_crowd_unit.js */
'use strict';
const EXLIB=(function(){
  const S={};
  const L=()=>typeof EXAMLIB_LINES!=='undefined'?EXAMLIB_LINES:{people:{},econ:{},atmos:[],full:{},pool:[]};
  S.L=L;
  const hr=G=>(((+G.hour||0)%24)+24)%24;
  const now=G=>(G.day|0)*24+(+G.hour||0);
  const hash=str=>{ let h=2166136261; for(let i=0;i<str.length;i++){ h^=str.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; };
  const rnd=str=>(hash(str)%100000)/100000;
  const law=G=>!!G&&(G.stage||'law')==='law';
  const termOf=(G,day)=>typeof CALENDAR!=='undefined'?CALENDAR.termOf(day==null?G.day:day):null;
  const wdOf=day=>{ const w=CALENDAR.dateOf(day).wd; return w===7?0:w; };
  const weekendDay=day=>CALENDAR.dateOf(day).wd>=6;
  const sub=(o,k)=>{ if(!o[k]||typeof o[k]!=='object') o[k]={}; return o[k]; };
  const say=(GM,who,t)=>GM.say(who,t);
  const isNarr=t=>/^（[\s\S]*）$/.test(t)&&t.indexOf('（小聲）')!==0;   /* 整個包在（）裡、不是（小聲）開頭＝旁白 */
  let busy=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['examlib3d:busy']=()=>{ busy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）*/
  let guard=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['examlib3d:guard']=()=>{ guard=false; };

  /* ---------- 存檔 ---------- */
  S.rec=function(G){ let R=G.exlib; if(!R||typeof R!=='object'||Array.isArray(R)) R=G.exlib={v:1};
    for(const k of ['atm','nod','said','pool','prompt','noShow','asked42','note']) if(!R[k]||typeof R[k]!=='object'||Array.isArray(R[k])) R[k]={};
    if(typeof R.atm.n!=='number') R.atm.n=0; if(!R.atm.seen||typeof R.atm.seen!=='object') R.atm.seen={};
    if(typeof R.pool.n!=='number') R.pool.n=0; if(!R.pool.said||typeof R.pool.said!=='object') R.pool.said={};
    for(const k of Object.keys(R.prompt)) if((+k.split(':')[0])<(G.day|0)-1) delete R.prompt[k];   /* 舊的日子不留 */
    for(const k of ['ask41','hold','d42']) if(R[k]&&(typeof R[k]!=='object'||typeof R[k].day!=='number')) R[k]=null;
    return R; };
  const rec0=G=>G&&G.exlib&&typeof G.exlib==='object'?G.exlib:null;   /* 只讀（作息、手機的假 G 也會進來：不寫）*/

  /* ---------- 第 0 節：時段 ---------- */
  S.WEEK=14;
  const endMemo=new WeakMap();
  /* 這學期最後一場期末考結束的時間（絕對小時）；沒有考試＝期末週最後一天的 24:00 */
  S.examEnd=function(G,termId){ let M=endMemo.get(G); if(!M){ M=new Map(); endMemo.set(G,M); } const key=termId+'|'+(G.day|0)+'|'+(((G.courses&&G.courses.retake)||[]).length);
    if(M.has(key)) return M.get(key); let end=null;
    try{ if(typeof CLS!=='undefined'&&CLS.examList) for(const e of CLS.examList(G,termId)){ if(!e||e.kind!=='final'||typeof e.day!=='number') continue; const t=e.day*24+(typeof e.t1==='number'?e.t1:17); if(end==null||t>end) end=t; } }catch(e){ console.warn('EXLIB.examEnd',e); }
    if(end==null&&typeof CALENDAR!=='undefined'&&CALENDAR.termDays){ const r=CALENDAR.termDays(termId); if(r) end=(r.to+1)*24; }
    if(M.size>40) M.clear(); M.set(key,end); return end; };
  S.on=function(G,day,h){ if(!G||typeof CALENDAR==='undefined') return false; /* 經濟系那一年沒有（第 0 節：AA_669 第 5 節改「不用做」，AA-C 11-04 20:56）*/ if(day==null) day=G.day|0; if(h==null) h=hr(G); const t=termOf(G,day); if(!t||!t.week||t.week<S.WEEK) return false;
    if(typeof CLS!=='undefined'&&CLS.termAway&&CLS.termAway(G,t.id)) return false;   /* 國外那一學期沒有（日本、美國照 AA_340、AA_341）*/
    const end=S.examEnd(G,t.id); if(end!=null&&day*24+h>=end) return false; return true; };

  /* ---------- 地點 ---------- */
  S.PLACES={
    hall2f:{zone:'library_hall',name:'總圖大廳二樓自習區'}, lib3f:{zone:'library',name:'總圖 3F 閱覽區'}, b1:{zone:'library_b1',name:'總圖 B1 自習室'},
    soc1f:{zone:'soclib',name:'社科圖一樓開架閱覽室'}, soc2f:{zone:'soclib_2f',fallback:'soclib',name:'社科圖二樓自習室'},
    lawlib:{zone:'lawlib',name:'法圖'}, a4f:{zone:'linze_4f',name:'法律系館A 4F 自習討論區'} };
  S.ZONES=['library_hall','library','library_b1','library_carrels','soclib','soclib_2f','lawlib','linze_4f'];
  const zoneExists=z=>typeof Z3!=='undefined'&&!!Z3&&!!Z3.ZONES&&!!Z3.ZONES[z];
  S.zoneOf=key=>{ const P=S.PLACES[key]; if(!P) return null; return P.fallback&&!zoneExists(P.zone)?P.fallback:P.zone; };
  S.isLib=z=>S.ZONES.includes(z);
  S.hoursZone=z=>z==='soclib_2f'?'soclib':z;
  /* 開不開（PLACES 沒寫開放時間的：B1 自習室、霖澤館＝一直開）*/
  S.isOpen=(z,day,h)=>typeof PLACES==='undefined'||!PLACES.isOpen||PLACES.isOpen(S.hoursZone(z),h,day);
  const hasHours=z=>typeof PLACES!=='undefined'&&!!PLACES.hours&&!!PLACES.hours[S.hoursZone(z)];
  S.OPEN_DEFAULT=8;   /* 沒寫開放時間的（24 小時的 B1 自習室、霖澤館 4F）：人從 08:00 開始來 */
  S.openH=function(z,day){ if(!hasHours(z)) return S.OPEN_DEFAULT; for(let h=6;h<23;h+=0.25) if(S.isOpen(z,day,h+0.01)) return h; return null; };
  S.closeH=function(z,day,h){ if(!hasHours(z)) return 24; for(let x=Math.ceil(Math.max(h||0,0)*4-1e-9)/4;x<24;x+=0.25) if(!S.isOpen(z,day,x+0.001)) return x; return 24; };   /* 照 15 分鐘的格子找（開放時間都在格子上：21:45、22:00）*/
  S.fullH=function(G,z,day){ day=day==null?G.day|0:day; const we=weekendDay(day); if(z==='soclib_2f') return we?10:9; return we?11:10; };   /* 平日 10:00、週末 11:00；社科圖二樓平日 09:00 */
  /* 這個時刻坐滿幾成（0～1）*/
  S.fill=function(G,z,h){ h=h==null?hr(G):h; const day=G.day|0; if(!S.on(G,day,h)||!S.isOpen(z,day,h)) return 0; const o=S.openH(z,day); if(o==null) return 0; const f=S.fullH(G,z,day);
    if(h>=f) return 1; if(h<o) return 0; if(h<o+1) return Math.min(0.7,0.7*(h-o)); return Math.min(1,0.7+0.3*(h-o-1)/Math.max(0.25,f-o-1)); };

  /* ---------- 誰（表上的人；經濟系那一年換人）---------- */
  S.cast=G=>(L().people||{});
  S.inCast=function(G,id){ const P=S.cast(G)[id]; if(!P) return null; if(P.terms){ const t=termOf(G); if(!t||!P.terms.includes(t.id)) return null; } return P; };
  S.isPool=id=>typeof POOL!=='undefined'&&!!POOL.owns&&POOL.owns(id);
  const dating=(G,id)=>!!(G.flags&&G.flags['dating_'+id]===true);
  S.friendUp=function(G,id){ if(dating(G,id)) return true; if(typeof SOCIAL==='undefined'||!SOCIAL.stage||!SOCIAL.STAGES) return false; return SOCIAL.STAGES.indexOf(SOCIAL.stage(id))>=3; };   /* FRIEND 以上 */
  const nameOf=id=>typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(id):((typeof CHARACTERS!=='undefined'&&CHARACTERS[id]&&CHARACTERS[id].name)||id);
  const male=id=>{ const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[id]; return !!c&&(c.gender==='m'||c.sex==='m'); };
  const present=(id,G)=>typeof STORY==='undefined'||!STORY.present||STORY.present(id,G);

  /* ---------- 座位 ---------- */
  /* 讀書的位子（「滿」只算這些）：總圖大廳只有二樓、B1 只有 24 小時自習室、社科圖的長桌和窗邊、社科圖二樓的自習室（長桌、靠窗；討論室不算）、法圖的長桌和個人座、A館 4F 的自習座 */
  S.studySeat=function(z,st){ if(!st) return false; switch(z){
      case 'library_hall': return (st.lv|0)===1;
      case 'library_b1': return st.room==='study24';
      case 'soclib': return st.kind==='table'||st.kind==='window';
      case 'soclib_2f': return st.kind==='study'||st.kind==='window';   /* 討論室（discuss）不算：AA_669 第 6 節「可以講話」的小房間，不是自習室 */
      case 'lawlib': return /^T\d+$/.test(String(st.table||''))||st.table==='carrel';
      case 'linze_4f': return !!st.study;
      default: return true; } };
  /* 劇情寫死的位子不放東西：總圖大廳 0、1（小安「總圖的下午」）、3F 2、8（學姊、小安）、社科圖 16（SK12 品妤）*/
  S.KEEP={library_hall:[0,1],library:[2,8],soclib:[16]};
  S.PREF={library_hall:{heroine_01:1},soclib_2f:{heroine_03:'byOld'}};   /* 以安「二樓靠牆那張長桌」＝總圖的下午那個位子；品妤＝SK12 那張；
     社科圖二樓：語彤、阿勳＝靠窗那排、老位子的南邊那一個（AA_669 第 6 節「劇情和占位子會用到其中一排（例：靠窗那排的第三個位子當「老位子」）」：她旁邊就是老位子）*/
  /* PREF 的值：數字＝座位表的第幾號；'byOld'＝老位子（seat.old）南邊那一個（同一層、同一種、x 一樣、往南 0.45～1.2 m）；找不到＝null（照種子）*/
  S.prefIdx=function(seats,v){ if(typeof v==='number') return v; if(v!=='byOld') return null; const o=seats.find(q=>q&&q.old); if(!o) return null;
    const i=seats.findIndex(q=>q&&q!==o&&(q.lv|0)===(o.lv|0)&&q.kind===o.kind&&Math.abs(q.x-o.x)<0.05&&q.z-o.z>0.45&&q.z-o.z<1.2); return i>=0?i:null; };
  const skey=st=>(+st.x).toFixed(2)+','+(+st.z).toFixed(2)+','+(st.lv|0);
  S.occupied=function(E,st){ const near=q=>!!q&&(q.lv==null||(q.lv|0)===(st.lv|0))&&Math.hypot(q.x-st.x,q.z-st.z)<0.4; if(E&&E.player&&near(E.player.seat)) return true;
    return !!E&&(E.npcs||[]).some(n=>n&&(near(n.seat)||near(n.seatTarget))); };
  S.cands=function(E,z){ const seats=(E&&E.zone&&E.zone.seats)||[], keep=S.KEEP[z]||[]; const out=[]; seats.forEach((st,i)=>{ if(S.studySeat(z,st)&&!keep.includes(i)) out.push(st); }); return out; };
  /* 一個人在這一間常坐的位子（照 S.PREF，其他照人＋區域當種子）*/
  S.spotSeat=function(E,z,id){ const seats=(E&&E.zone&&E.zone.seats)||[]; const pi=S.PREF[z]?S.prefIdx(seats,S.PREF[z][id]):null; if(pi!=null&&seats[pi]&&S.studySeat(z,seats[pi])) return seats[pi];
    const C=S.cands(E,z); return C.length?C[hash('exspot|'+z+'|'+id)%C.length]:null; };
  /* 旁邊的位子：同一排（同一個方向、左右 0.45～1.5 m、前後 0.3 m 內）；side＝right／left 照坐的人的手邊（SEATACT：+x 是 yaw 0 的人的左手邊）；沒有＝對面 */
  S.adjacent=function(E,st,side,ok){ const seats=(E&&E.zone&&E.zone.seats)||[]; const yaw=st.yaw||0, fx=Math.sin(yaw), fz=Math.cos(yaw), lx=fz, lz=-fx; let best=null, bs=1e9;
    for(const q of seats){ if(q===st||(q.lv|0)!==(st.lv|0)) continue; if(ok&&!ok(q)) continue; const dx=q.x-st.x, dz=q.z-st.z, f=dx*fx+dz*fz, l=dx*lx+dz*lz, dy=Math.abs(Math.atan2(Math.sin((q.yaw||0)-yaw),Math.cos((q.yaw||0)-yaw)));
      let s=null; if(dy<0.3&&Math.abs(f)<0.3&&Math.abs(l)>=0.45&&Math.abs(l)<=1.5){ s=Math.abs(l); if(side==='left'&&l<0) s+=5; if(side==='right'&&l>0) s+=5; }
      else if(dy>2.8&&f>0.5&&f<2.2&&Math.abs(l)<0.5) s=10+f;
      else if(Math.hypot(dx,dz)<=2.0) s=20+Math.hypot(dx,dz);   /* 圓桌（3F 閱覽區三人一桌，相鄰的位子差 1.65 m）：同一張桌子最近的那一個 */
      if(s!=null&&s<bs){ bs=s; best=q; } }
    return best; };

  /* 同一排的旁邊（S.adjacent 的第一種：同一層、同一個方向、左右 0.45～1.5 m、前後 0.3 m 內）*/
  S.sameRow=function(st,q){ const yaw=st.yaw||0, fx=Math.sin(yaw), fz=Math.cos(yaw), dx=q.x-st.x, dz=q.z-st.z, f=dx*fx+dz*fz, l=dx*fz-dz*fx, dy=Math.abs(Math.atan2(Math.sin((q.yaw||0)-yaw),Math.cos((q.yaw||0)-yaw)));
    return (q.lv|0)===(st.lv|0)&&dy<0.3&&Math.abs(f)<0.3&&Math.abs(l)>=0.45&&Math.abs(l)<=1.5; };
  /* 社科圖二樓：st 同一排的旁邊就是老位子（seat.old）而且 ok＝老位子；其他＝null（第 6 節「劇情和占位子會用到其中一排」：占位子、招手都坐到老位子）*/
  S.besideOld=function(E,z,st,ok){ if(z!=='soclib_2f'||!st) return null; const o=((E&&E.zone&&E.zone.seats)||[]).find(q=>q&&q.old); return o&&o!==st&&(!ok||ok(o))&&S.sameRow(st,o)?o:null; };
  /* 4-1 占哪一個（第 6 節）：之後的學期答應的是「老位子」那一句（H.old）＝玩家的老位子；社科圖二樓「我旁邊」：旁邊就是老位子＝占老位子；其他＝旁邊（S.adjacent，照舊）*/
  S.holdPick=function(E,z,H,fs,P,free){ const seats=(E&&E.zone&&E.zone.seats)||[];
    if(Array.isArray(H.old)){ const q=seats.find(q=>q&&(q.lv|0)===(H.old[2]|0)&&Math.hypot(q.x-H.old[0],q.z-H.old[1])<0.1); if(q&&free(q)) return q; }
    if(!fs) return null; return S.besideOld(E,z,fs,free)||S.adjacent(E,fs,P&&P.hold&&P.hold.side,free); };

  /* ---------- 這一間的位子狀態（換區域就重來；座位物件是區域建好時才有的）---------- */
  let ZS=null;   /* {zone:E.zone, id, day, order, held:Set, lastH, holdSeat, holdIt, d42Seat} */
  const setLabel=(it,lab)=>{ try{ const d=Object.getOwnPropertyDescriptor(it,'label'); if(d&&!d.writable&&!d.set) return false; it.label=lab; return true; }catch(e){ return false; } };
  S.HELD_LABEL='有人了';
  S.hold=function(E,st){ st.exHeld=true; for(const it of (E.interactables||[])) if(it&&it.seat===st&&!it.exHeld){ it.exLabel0=it.label; it.exPrio0=it.prio; if(setLabel(it,S.HELD_LABEL)){ it.exHeld=true; it.prio=(it.prio||0)-0.4; } } };
  S.unhold=function(E,st){ st.exHeld=false; for(const it of (E.interactables||[])) if(it&&it.seat===st&&it.exHeld){ setLabel(it,it.exLabel0); it.prio=it.exPrio0; delete it.exHeld; delete it.exLabel0; delete it.exPrio0; } };
  S.clearSeats=function(){ const Z=ZS; ZS=null; if(!Z||!Z.E) return; if(Z.E.zone!==Z.zone) return; for(const st of Z.held) S.unhold(Z.E,st); };
  /* 第 4-1 節：朋友幫玩家占的那一個（st.taken＝路人、別的人都不坐）；第 4-2 節：玩家幫朋友留的那一個 */
  const holdToday=(G,z)=>{ const R=rec0(G), H=R&&R.hold; return H&&H.day===(G.day|0)&&H.zone===z&&!H.arrived&&!H.missSent&&hr(G)<H.until?H:null; };
  S.syncSeats=function(GM,force){ const E=GM&&GM.E, G=GM&&GM.G; if(!E||!G||!E.zone) return null; const z=G.zone;
    if(!ZS||ZS.zone!==E.zone) ZS={zone:E.zone,E,id:z,day:null,order:null,held:new Set(),lastH:-1,holdSeat:null,holdIt:null};   /* 換區域：舊的座位跟著舊的區域丟掉 */
    if(!S.isLib(z)||!Array.isArray(E.zone.seats)) return ZS;
    const h=hr(G); if(!force&&ZS.day===(G.day|0)&&Math.abs(h-ZS.lastH)<1/12) return ZS; ZS.lastH=h;
    const C=S.cands(E,z); if(ZS.day!==(G.day|0)||!ZS.order){ ZS.day=G.day|0; ZS.order=C.slice().sort((a,b)=>hash('exheld|'+z+'|'+G.day+'|'+skey(a))-hash('exheld|'+z+'|'+G.day+'|'+skey(b))); }
    S.syncHold(GM); S.sync42(GM);
    const keep=new Set(); if(ZS.holdSeat) keep.add(ZS.holdSeat); const D=rec0(G)&&rec0(G).d42; if(D&&D.day===(G.day|0)&&D.zone===z&&D.placed&&D.seat){ const q=C.find(st=>Math.hypot(st.x-D.seat[0],st.z-D.seat[1])<0.1&&(st.lv|0)===(D.seat[2]|0)); if(q) keep.add(q); }
    const H=holdToday(G,z); if(H){ const fs=S.spotSeat(E,z,H.who); if(fs) keep.add(fs); }   /* 占位子的那一天：他自己的位子也留著 */
    const want=Math.round(S.fill(G,z)*C.length); let need=want-C.filter(st=>S.occupied(E,st)).length; const next=new Set();
    for(const st of ZS.order){ if(need<=0) break; if(keep.has(st)||S.occupied(E,st)||st.taken) continue; next.add(st); need--; }
    for(const st of ZS.held) if(!next.has(st)) S.unhold(E,st);
    for(const st of next) if(!ZS.held.has(st)) S.hold(E,st);
    ZS.held=next; return ZS; };
  /* 4-2 坐滿也放得了講義（D42-RESERVE-1104，BB-C 11-04 18:23，BB_260）：「玩家答應了、照時間到了、坐下了，朋友卻說『沒占到』，這是遊戲的錯」——
     答應的那天、這一間、還沒放、還沒過他說的時間（D.dl）＝先保留兩個連著的空位（taken＝'exlib42'，路人、背景讀書的人、別人都不坐），玩家走進讀書區就直接走過去坐其中一個（S.auto42Due）、
     講義放旁邊那一個（S.place42 先用這一對）；放好了、過了時間、換區域＝放開（「沒占到」只剩玩家沒去、太晚才到）*/
  const d42Today=(G,z)=>{ const R=rec0(G), D=R&&R.d42; return D&&D.ok&&!D.placed&&D.day===(G.day|0)&&D.zone===z&&hr(G)<D.dl?D:null; };
  S.sync42=function(GM){ const E=GM.E, G=GM.G, z=G.zone, D=d42Today(G,z);
    const free=()=>{ if(ZS&&ZS.pair42){ for(const q of ZS.pair42) if(q.taken==='exlib42') q.taken=null; ZS.pair42=null; } };
    if(!ZS||!D){ free(); return null; } if(ZS.pair42) return ZS.pair42;
    const ok=q=>S.studySeat(z,q)&&!S.occupied(E,q)&&!q.taken&&!q.old&&!S.isOld2f(G,q);   /* 老位子（二樓靠窗、記下的）不拿來用 */
    for(const st of (ZS.order||[])){ if(!ok(st)) continue; const a=S.adjacent(E,st,null,ok); if(!a) continue;
      for(const q of [st,a]){ q.taken='exlib42'; if(q.exHeld) S.unhold(E,q); ZS.held.delete(q); } ZS.pair42=[st,a]; return ZS.pair42; }
    return null; };
  S.auto42Due=function(GM){ const G=GM.G, E=GM.E, D=d42Today(G,G.zone); if(!D||D.autoTried||E.player.seat||!S.inStudy(GM)||!ZS||!ZS.pair42) return false; return (ZS.pair42[0].lv|0)===(E.player.lv|0); };
  /* 4-1 的位子：今天、這一間、還沒到時間＝標 taken、加一個「坐到○○占的位子」的按鈕；不是了＝拿掉 */
  S.syncHold=function(GM){ const E=GM.E, G=GM.G, z=G.zone, H=holdToday(G,z);
    if(!H){ if(ZS.holdSeat){ if(ZS.holdSeat.taken==='exlib41') ZS.holdSeat.taken=null; ZS.holdSeat=null; } if(ZS.holdIt){ const i=E.interactables.indexOf(ZS.holdIt); if(i>=0) E.interactables.splice(i,1); ZS.holdIt=null; } return null; }
    if(!ZS.holdSeat){ const fs=S.spotSeat(E,z,H.who); const P=S.cast(G)[H.who]||{}; const st=S.holdPick(E,z,H,fs,P,q=>S.studySeat(z,q)&&!S.occupied(E,q)&&!q.taken);
      if(!st) return null; st.taken='exlib41'; if(st.exHeld) S.unhold(E,st); ZS.holdSeat=st;
      const it={x:st.x,z:st.z,lv:st.lv|0,radius:0.9,prio:0.2,label:'坐到'+nameOf(H.who)+'占的位子',exHoldSeat:st}; E.interactables.push(it); ZS.holdIt=it; }
    return ZS.holdSeat; };
  /* SEATACT：占著、人不在的位子（桌上放東西）*/
  S.awaySeats=function(GM){ const E=GM&&GM.E; if(!ZS||!E||ZS.zone!==E.zone) return []; const out=[]; for(const st of ZS.held) if(!S.occupied(E,st)) out.push(st); return out; };

  /* ---------- 第 3 節：作息（STORY.SCHED_X）---------- */
  S.base=function(c,G){ if(typeof STORY==='undefined'||!STORY.schedEnt) return null; const g=guard; guard=true; try{ return STORY.schedEnt(c,G); }catch(e){ return null; } finally { guard=g; } };
  /* 不換的：劇情的位置、約好的、上課、活動、店內偶遇、別的模組加的、日子很短的那幾筆（劇情寫死的那幾天）、在臺北但不在台大（taipei）*/
  S.special=function(b){ if(!b) return true; if(b.pri||b.talkEvent||b.spot||b.activity||b.cls||b.invite||b.shopEnc||b.exlib||b.taipei) return true;
    if(Array.isArray(b.dates)&&b.dates.length&&typeof STORY!=='undefined'&&STORY.dayOfKey&&b.dates.every(r=>{ const a=STORY.dayOfKey(r[0]), z=STORY.dayOfKey(r[1]); return a!=null&&z!=null&&z-a<7; })) return true;
    return false; };
  /* 換哪些地方的讀書時段：圖書館、自習的地方（總圖各層、社科圖、法圖、霖澤館 3F／4F、教學館的自習區）。
     Café、店裡、研究室的讀書照作息——那裡常有她們的戲（例：大三下 5/25 Café「帶哪一本」，sis_b15_3d.js S.thuYield 讓她那一晚留在 Café；tests/aa518_sis_b15_unit.js）*/
  S.STUDY_FROM=['library','library_hall','library_media','library_b1','library_stacks','library_carrels','soclib','soclib_2f','lawlib','linze_3f','linze_4f','gongtong','boya','putong'];
  /* 同一天最多三位在同一間：表上同一間的人超過三位＝照日期輪，多的照作息 */
  S.capOk=function(G,id,z){ const C=S.cast(G), ids=Object.keys(C).filter(k=>S.inCast(G,k)&&S.zoneOf(C[k].place)===z); if(ids.length<=3) return true;
    ids.sort((a,b)=>hash('excap|'+G.day+'|'+a)-hash('excap|'+G.day+'|'+b)); return ids.indexOf(id)<3; };
  /* 這一段多給的讀書時段（BB_260 第 1 節，BB-C 11-04 17:3x；使用者 16:1x「會看到很多同學在唸書不一定有約」）：只填原本的空檔——作息這個時間沒有東西，或只是在校園裡晃（wander）、走路（walk）；
     上課、考試、打工、劇情、約好的事照舊優先（S.special、act 不是 wander／walk 的都不動）。wd：0＝週日…6＝週六。since：從哪一學期起（明軒：大二以後）。地方照 AA_669 表上的那一間（S.cast 的 place）
     子晴「有插座的那一排」：總圖大廳二樓的配置沒有標插座，位子照 spotSeat（人＋區域當種子）*/
  S.EXTRA={heroine_04:[{wd:[1,3,5],from:13,to:17.5},{wd:[6],from:10,to:15}],   /* 子晴：二、四照原本的作息（系館）*/
    zhe:[{wd:[1,2,3,4],from:10+40/60,to:16.5},{wd:[0],from:13,to:18}],   /* 阿哲：五不去（「我明天睡到中午」）*/
    yu:[{wd:[1,2,4,5],from:11,to:17}],   /* Alison：三不去（「明天早上我起不來」）*/
    classmate_mingxuan:[{wd:[1,2,3,4],from:13,to:19,since:'Y2S1'}] };   /* 明軒：五不去（「明天我在宿舍讀」）*/
  S.FILL_ACTS=['wander','walk'];
  S.extraSlot=function(G,id,day,h){ const L=S.EXTRA[id]; if(!L||typeof CALENDAR==='undefined') return null; const wd=CALENDAR.dateOf(day).wd%7, t=termOf(G,day);
    for(const X of L){ if(!X.wd.includes(wd)||h<X.from||h>=X.to) continue; if(X.since&&(!t||String(t.id)<X.since)) continue; return X; } return null; };
  S.fillable=b=>!b||(S.FILL_ACTS.includes(b.act)&&!S.special(b));
  const entMemo=new Map();
  const entry=(G,id,z,from,to,seat,src)=>{ const k=[id,G.day|0,z,from,to,seat?skey(seat):'-',src].join('|'); let e=entMemo.get(k); if(!e){ if(entMemo.size>200) entMemo.clear();
      e={days:[G.weekday],from,to,zone:z,act:'read',exlib:src,noPair:true}; if(seat) e.seatAt=[seat.x,seat.z,seat.lv|0]; entMemo.set(k,e); } return e; };
  /* 這一間載入了（玩家在那裡）＝照那個人的位子坐（seatAt）；沒載入＝不寫（populateSchedule 照空位）*/
  let lastGM=null;
  const loadedSeat=(z,id)=>{ const GM=lastGM; if(!GM||!GM.E||!GM.G||GM.G.zone!==z||!GM.E.zone||!Array.isArray(GM.E.zone.seats)) return null; return S.spotSeat(GM.E,z,id); };
  S.sched=function(c,G){ if(guard||!c||!c.id||!G||typeof CALENDAR==='undefined') return null; const id=c.id, P=S.inCast(G,id); if(!P) return null;
    const h=hr(G), day=G.day|0; if(!S.on(G,day,h)) return null; const R=rec0(G);
    if(typeof STORY!=='undefined'&&STORY.presence){ const pr=STORY.presence(id,G); if(pr&&pr.kind==='taipei') return null; }
    /* 4-2：玩家幫他留了位子＝照他說的時間走進來 */
    const D=R&&R.d42; if(D&&D.who===id&&D.day===day&&D.placed&&D.seat&&h>=D.at&&h<D.to&&S.isOpen(D.zone,day,h)) return entry(G,id,D.zone,D.at,D.to,{x:D.seat[0],z:D.seat[1],lv:D.seat[2]},'4-2');
    /* 4-1：答應占位子的那一天早上在那一間 */
    const H=R&&R.hold; if(H&&H.who===id&&H.day===day&&h>=H.from&&h<H.stay&&S.isOpen(H.zone,day,h)) return entry(G,id,H.zone,H.from,H.stay,loadedSeat(H.zone,id),'4-1');
    const z=S.zoneOf(P.place); if(!z||!S.isOpen(z,day,h)) return null;
    const b=S.base(c,G);
    if(S.fillable(b)){ const X=S.extraSlot(G,id,day,h); if(X&&S.capOk(G,id,z)){ const o=Math.max(X.from,S.openH(z,day)||X.from); if(h>=o) return entry(G,id,z,o,Math.min(X.to,S.closeH(z,day,h)),loadedSeat(z,id),'bb260'); } }   /* BB_260：多給的讀書時段（只填空檔）*/
    if(!b) return null;
    if(b.act!=='read'||b.zone==null||b.zone===z||!S.STUDY_FROM.includes(b.zone)||S.special(b)) return null;
    if(!S.capOk(G,id,z)) return null;
    return entry(G,id,z,b.from,Math.min(b.to,S.closeH(z,day,h)),loadedSeat(z,id),'3'); };

  /* ---------- 第 3 節：說話 ---------- */
  /* 劇情、約好的、門檻台詞、第一次見面照舊先（talkCharacter 自己演）*/
  S.storyFirst=function(G,id,n){ if(n&&n.staff) return true;
    if(typeof SOCIAL!=='undefined'&&SOCIAL.has&&!SOCIAL.has(id,'FIRST_MET')) return true;
    try{ if(typeof INV!=='undefined'&&INV.meetable&&INV.meetable(G,id)) return true; }catch(e){}
    try{ if(typeof SOCIAL!=='undefined'&&SOCIAL.upLine&&SOCIAL.upLine(id)) return true; }catch(e){}
    try{ const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[id], te=c&&typeof STORY!=='undefined'&&STORY.schedEnt?STORY.schedEnt(c,G):null; if(te&&te.talkEvent) return true; }catch(e){}
    try{ if(typeof STORY_EVENTS!=='undefined'&&typeof EVENTS!=='undefined'&&EVENTS.check&&STORY_EVENTS.some(ev=>ev.trigger==='interact'&&ev.participants&&ev.participants[0]===id&&EVENTS.check(ev))) return true; }catch(e){}
    return false; };
  /* 讀書區：LIBQ 管的區域照 LIBQ（D127③；社科圖二樓只算自習室，AA_669 第 6 節）；LIBQ 沒管的（A館 4F 自習討論區）＝整間都算（稿上那幾位的句子本來就寫了（小聲））*/
  const libqZone=z=>typeof LIBQ!=='undefined'&&!!LIBQ.ZONES&&!!LIBQ.ZONES[z];
  S.here=function(GM){ const G=GM&&GM.G; if(!G||!S.isLib(G.zone)||!S.on(G)) return false; if(!libqZone(G.zone)) return S.inStudy(GM)&&!(typeof LIBQ!=='undefined'&&LIBQ.isLoud&&LIBQ.isLoud()); return !LIBQ.quietNow||LIBQ.quietNow(GM); };
  S.nodRec=(G,z)=>{ const R=S.rec(G), t=termOf(G); return sub(sub(R.nod,t?t.id:'-'),z); };
  /* LIBQ 今天點過頭（讀書區第一次）：這一段、這一間也算點過了 */
  S.noteNod=function(GM,n){ const G=GM&&GM.G, id=n&&(n.charId||n.id); if(!id||!S.here(GM)) return; const P=S.inCast(G,id); if(P?S.zoneOf(P.place)!==G.zone:!S.isPool(id)) return; S.nodRec(G,G.zone)[id]=1; };
  const play=async(GM,who,steps)=>{ for(const t of steps) await say(GM,isNarr(t)?null:who,t); };
  /* 打招呼（說話、招手坐過去）：點頭／（小聲）那一句／用完了點頭。回傳 true＝這次照這裡演了 */
  S.greet=async function(GM,id,n){ const G=GM.G, R=S.rec(G), t=termOf(G), z=G.zone, P=S.inCast(G,id); if(!t) return false;
    const who={name:nameOf(id),obj:n&&n.obj,charId:id,pose:n&&n.pose}; const nd=S.nodRec(G,z), nod=typeof LIBQ!=='undefined'&&LIBQ.nodLine?LIBQ.nodLine(id):(male(id)?'（他抬頭看到你，點了一下頭。）':'（她抬頭看到你，點了一下頭。）');
    if(!nd[id]){ nd[id]=1; if(typeof LIBQ!=='undefined'&&LIBQ.mark) LIBQ.mark(G,id); await say(GM,null,nod); return 'nod'; }
    if(P){ const SD=sub(R.said,t.id), k=SD[id]|0; if(k>=(P.lines||[]).length){ await say(GM,null,nod); return 'nod'; }
      if(k===0&&P.dating&&dating(G,id)) await say(GM,null,P.dating);
      SD[id]=k+1; await play(GM,who,P.lines[k]); if(typeof SOCIAL!=='undefined'){ if(SOCIAL.talkedTo) SOCIAL.talkedTo(id); if(SOCIAL.activity) SOCIAL.activity(id,'chat'); } return 'line'; }
    if(S.isPool(id)){ const PS=sub(R.pool.said,t.id); if(PS[id]) return false; const Ls=L().pool||[]; if(!Ls.length) return false; const i=(R.pool.n|0)%Ls.length; R.pool.n=i+1; PS[id]=1;
      await play(GM,who,Ls[i]); if(typeof SOCIAL!=='undefined'){ if(SOCIAL.talkedTo) SOCIAL.talkedTo(id); if(SOCIAL.activity) SOCIAL.activity(id,'chat'); } return 'line'; }
    return false; };
  S.talk=async function(GM,id,n){ const G=GM&&GM.G; if(!G||!S.here(GM)) return false; const P=S.inCast(G,id); if(!P&&!S.isPool(id)) return false;
    if(P&&S.zoneOf(P.place)!==G.zone) return false;   /* 表上的人在表上的那一間才說那幾句（明軒「四樓的插座比總圖多」）；在別間照 LIBQ、照原本的閒聊 */
    if(S.storyFirst(G,id,n)) return false;
    if(S.isPool(id)&&!S.inCast(G,id)){ const t=termOf(G); const nd=S.nodRec(G,G.zone); if(nd[id]&&t&&sub(S.rec(G).pool.said,t.id)[id]) return false; }   /* pool：這學期說過了＝照原本的閒聊 */
    GM.sceneBegin({adv:id}); let r=false;
    try{ const E=GM.E; if(n&&!n.seat&&GM.face&&E&&E.player) GM.face(n,E.player.obj.position.x,E.player.obj.position.z); if(GM.cine&&E&&E.player&&n) GM.cine('talk',E.player.obj,n.obj); const nod1=!S.nodRec(G,G.zone)[id]; r=await S.greet(GM,id,n);
      if(r&&!nod1&&typeof GIFTH!=='undefined'&&GIFTH.libTalk) await GIFTH.libTalk(GM,{name:nameOf(id),obj:n&&n.obj,charId:id,pose:n&&n.pose},id); }   /* 節日、她生日：打完招呼多「送她禮物…」（AA_732 rules 最後一條 ②，d1bf75f6f；src/gifthol3d.js）。這一段這一間第一次＝只點頭，不出 */
    finally { if(n&&typeof SOCIAL!=='undefined'&&SOCIAL.npcName){ n.name=SOCIAL.npcName(id); n.talkLabel='和'+n.name+'說話'; } GM.sceneEnd(); }
    return !!r; };

  /* ---------- 第 1 節：一進門的旁白 ---------- */
  S.inStudy=function(GM){ const G=GM.G, E=GM.E, P=E&&E.player, o=P&&P.obj&&P.obj.position; if(!S.isLib(G.zone)) return false; if(!libqZone(G.zone)||!LIBQ.studyAt) return true; return LIBQ.studyAt(G.zone,P?P.lv:0,o?o.x:undefined,o?o.z:undefined); };
  S.atmosLine=function(G){ const R=S.rec(G), A=L().atmos||[]; const close=typeof CROWD!=='undefined'&&CROWD.closingSoon?CROWD.closingSoon(G,S.hoursZone(G.zone)):false;
    if(close&&L().atmosClose) return {t:L().atmosClose,close:true}; if(!A.length) return null; const i=(R.atm.n|0)%A.length; return {t:A[i],i}; };
  /* 第 1～5 句寫的是坐滿的樣子：坐到五成以上（開館後約四十分鐘起）才放；閉館前 30 分鐘那一句照時間 */
  S.atmosDue=function(GM){ const G=GM.G; if(!S.on(G)||!S.isLib(G.zone)||!S.inStudy(GM)) return false; const t=termOf(G); if(!t) return false; const R=S.rec(G); if(R.atm.seen[t.id+':'+G.zone]) return false;
    const close=typeof CROWD!=='undefined'&&CROWD.closingSoon?CROWD.closingSoon(G,S.hoursZone(G.zone)):false; return close||S.fill(G,G.zone)>=0.5; };
  S.atmos=async function(GM){ const G=GM.G, R=S.rec(G), t=termOf(G); const x=S.atmosLine(G); R.atm.seen[t.id+':'+G.zone]=G.day|0; if(!x) return false; if(!x.close) R.atm.n=(R.atm.n|0)+1; await say(GM,null,x.t); return true; };

  /* ---------- 第 2 節：找不到位子 ---------- */
  const invitedHere=G=>!!(G.flags&&G.flags.companion)||(Array.isArray(G.invites)&&G.invites.some(iv=>iv&&iv.day===(G.day|0)&&iv.zone===G.zone&&(iv.state==='accepted'||iv.state==='done')));
  S.nearHeld=function(GM,r){ const E=GM.E, P=E&&E.player&&E.player.obj&&E.player.obj.position; if(!P||!ZS||ZS.zone!==E.zone) return false; const lv=E.player.lv|0; for(const st of ZS.held) if((st.lv|0)===lv&&Math.hypot(st.x-P.x,st.z-P.z)<(r||2.5)) return true; return false; };
  S.fullDue=function(GM){ const G=GM.G, E=GM.E; if(!S.on(G)||!S.isLib(G.zone)||!S.inStudy(GM)) return false; if(E.player&&E.player.seat) return false; if(hr(G)<S.fullH(G,G.zone)) return false;
    const R=S.rec(G); if(R.prompt[(G.day|0)+':'+G.zone]) return false; if(holdToday(G,G.zone)||invitedHere(G)) return false; if(!ZS||ZS.zone!==E.zone||!ZS.held.size) return false;
    return S.nearHeld(GM); };
  /* 招手的朋友：這一間、坐著、FRIEND 以上、旁邊有位子（沒有人坐；放了東西的＝他幫你收）*/
  S.waver=function(GM){ const G=GM.G, E=GM.E; const out=[]; for(const id of Object.keys(S.cast(G))){ const P=S.inCast(G,id); if(!P||S.zoneOf(P.place)!==G.zone) continue; const n=GM.npc&&GM.npc[id]; if(!n||!n.seat||!E.npcs.includes(n)) continue; if(!S.friendUp(G,id)) continue;
      const ok=q=>S.studySeat(G.zone,q)&&!S.occupied(E,q)&&!q.taken, a=S.besideOld(E,G.zone,n.seat,ok)||S.adjacent(E,n.seat,null,ok); if(a) out.push({id,n,seat:a}); } return out[0]||null; };   /* 社科圖二樓：旁邊是老位子就招手叫你坐老位子（第 6 節）*/
  S.waveText=id=>String((L().full||{}).wave||'').replace('{她／他}',male(id)?'他':'她');
  const seatIt=(E,st)=>(E.interactables||[]).find(it=>it&&it.seat===st)||{x:st.x,z:st.z,lv:st.lv|0,radius:0.8,label:'坐下讀書',seat:st,study:true};
  const sit42=async(GM,st)=>{ const E=GM.E; if(ZS&&ZS.held.has(st)){ S.unhold(E,st); ZS.held.delete(st); } if(st.taken==='exlib42') st.taken=null; const it=seatIt(E,st); if(GM.seatMenu) await GM.seatMenu(it); return true; };   /* 坐下 → STORY.onSeat → S.place42 用這一對的另一個 */
  const sitDown=async(GM,st)=>{ const E=GM.E; if(ZS&&ZS.held.has(st)){ S.unhold(E,st); ZS.held.delete(st); } if(st.taken==='exlib41') st.taken=null; const it=seatIt(E,st); if(GM.seatMenu) await GM.seatMenu(it); return true; };
  S.otherLibs=function(G){ if(typeof PLACES==='undefined'||!PLACES.quickList) return []; const base=z=>PLACES.base?PLACES.base(z):z, here=base(G.zone)==='linze'||G.zone==='linze_4f'?'linze':base(G.zone);
    const known=z=>!!((PLACES.known0&&PLACES.known0[z])||(G.visited&&G.visited[z]));
    return PLACES.quickList().filter(p=>p&&['library_hall','soclib','lawlib','linze'].includes(p[0])&&base(p[0])!==here&&known(p[0])&&(typeof PLACES.isOpen!=='function'||PLACES.isOpen(p[0],hr(G),G.day))); };
  const atHome=G=>typeof HOME!=='undefined'&&((HOME.movedOut&&HOME.movedOut(G)));
  /* 再繞一圈：平日 14:00 以前一半的機會（照日期＋區域，同一天同一間一樣）；週末、14:00 以後沒有 */
  S.againLucky=(G,h0)=>!weekendDay(G.day|0)&&h0<14&&rnd('exagain|'+(G.day|0)+'|'+G.zone)<0.5;
  S.fullPrompt=async function(GM){ const G=GM.G, E=GM.E, F=L().full||{}, R=S.rec(G); R.prompt[(G.day|0)+':'+G.zone]=1; let again=true;
    GM.sceneBegin(); let next=null;
    try{ await say(GM,null,F.say);
      for(let guardN=0;guardN<4&&!next;guardN++){ const w=S.waver(GM), opts=[];
        if(again) opts.push({t:F.again,hint:'時間 +20 分鐘',k:'again'});
        opts.push({t:F.other,k:'other'}); opts.push({t:atHome(G)?F.home:F.dorm,k:'dorm'});
        if(w&&F.wave) opts.push({t:S.waveText(w.id),k:'wave',w});
        const o=opts[await GM.choose(opts)]||opts[0];
        if(o.k==='again'){ again=false; const lucky=S.againLucky(G,hr(G)); if(GM.advance) GM.advance(1/3); S.syncSeats(GM,true);
          if(lucky&&ZS&&ZS.held.size){ const P=E.player.obj.position, lv=E.player.lv|0; const st=[...ZS.held].filter(q=>(q.lv|0)===lv).sort((a,b)=>Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z))[0]||[...ZS.held][0];
            await say(GM,null,F.lucky); next={k:'sit',st}; }
          else await say(GM,null,F.none); continue; }
        if(o.k==='other'){ const libs=S.otherLibs(G); const lo=libs.map(p=>({t:p[1],p})); lo.push({t:'不去了'}); const j=await GM.choose(lo); const pick=lo[j]; if(pick&&pick.p) next={k:'go',p:pick.p}; else next={k:'stay'}; continue; }
        if(o.k==='dorm'){ next={k:'dorm'}; continue; }
        if(o.k==='wave'){ next={k:'wave',w:o.w}; continue; } } }
    finally { GM.sceneEnd(); }
    if(!next||next.k==='stay') return true;
    if(next.k==='sit'){ await sitDown(GM,next.st); return true; }
    if(next.k==='go'){ if(GM.quickGo) await GM.quickGo(next.p); return true; }
    if(next.k==='dorm'){ if(atHome(G)&&HOME.go) await HOME.go(GM); else if(GM.quickGo){ const d=(typeof PLACES!=='undefined'&&PLACES.quickList?PLACES.quickList():[]).find(p=>p&&p[0]==='dorm'); if(d) await GM.quickGo(d); } return true; }
    if(next.k==='wave'){ S._waveGreet={id:next.w.id,st:next.w.seat,day:G.day|0}; await sitDown(GM,next.w.seat); return true; }
    return true; };

  /* ---------- 第 4-1 節：手機的話題「明天幫我占位子」---------- */
  S.TOPIC='exlib_seat'; S.TOPIC_T='明天幫我占位子';
  const Gat=(G,day,h)=>Object.assign({},G,{day,hour:h,weekday:wdOf(day)});
  const SOFT=['read','wander','sit','linger','walk','eat'];
  const soft=b=>!b||(SOFT.includes(b.act)&&!b.cls&&!b.invite&&!b.activity&&!b.talkEvent&&!b.pri);
  /* 那一天他會不會去圖書館（照作息：那一天有讀書的時段；他說的那段時間——到的時間到占到幾點——不是上課、考試、約好的）*/
  S.goes=function(G,id,day,at){ const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[id], P=S.inCast(Gat(G,day,9),id); if(!c||!P) return false; const z=S.zoneOf(P.place); if(!z) return false;
    const Gm=Gat(G,day,9); if(!S.on(G,day,9)||!present(id,Gm)) return false; const o=S.openH(z,day); if(o==null||o>=12) return false;
    const h0=Math.max(o,at!=null?at:(P.hold&&P.hold.from)||o), h1=Math.min(12,(P.hold&&P.hold.until)||12);
    for(let x=h0;x<Math.max(h1,h0+0.25);x+=0.25) if(!soft(S.base(c,Gat(G,day,x+0.05)))) return false;
    const c1=S.closeH(z,day,o); for(let h=o;h<c1;h+=0.25){ const b=S.base(c,Gat(G,day,h+0.05)); if(b&&b.act==='read'&&b.zone!=null) return true; } return false; };
  S.topicOk=function(G,id){ if(!G||typeof MSG==='undefined') return false; const P=S.inCast(G,id); if(!P||!P.hold||!P.hold.yes) return false; const h=hr(G); if(h<18||h>=23) return false;
    if(!S.on(G)||!S.on(G,(G.day|0)+1,9)) return false; const R=rec0(G)||{};
    if(R.ask41&&R.ask41.day===(G.day|0)) return false; if(R.hold&&R.hold.day===(G.day|0)+1) return false; if(R.d42&&R.d42.day===(G.day|0)+1&&R.d42.ok) return false;   /* 一天只能問一個人、一天只占一個位子 */
    if(id==='classmate_xinci'){ const t=termOf(G); if(t&&R.note&&R.note[t.id]) return false; }   /* 芯慈的便利貼和 4-2 同一學期只用一個 */
    if(!S.friendUp(G,id)||!present(id,G)) return false; const o=MSG.open?MSG.open(G,id):{ok:true}; if(!o||!o.ok||o.mode==='silent') return false; if(MSG.canSend&&!MSG.canSend(G,id)) return false;
    if(!P.hold.no&&!S.goes(G,id,(G.day|0)+1)) return false;   /* 稿上沒有「不行」那一句的（經濟系那一年）：不去的那天不出 */
    return true; };
  S.send41=function(G,id){ if(!S.topicOk(G,id)) return {ok:false,why:'這個話題現在不行'}; const P=S.inCast(G,id), R=S.rec(G), th='p:'+id, t=termOf(G), day=(G.day|0)+1;
    if(typeof PHONE!=='undefined') PHONE.post(G,{th,from:'player',who:null,text:S.TOPIC_T});
    if(MSG.rec){ const M=MSG.rec(G); M.sent[id]=G.day|0; }
    R.ask41={day:G.day|0,who:id};
    const goes=S.goes(G,id,day), items=[]; if(R.noShow[t.id]&&R.noShow[t.id][id]) items.push(L().again41);
    if(goes){ const old=S.useOld41(G,id); for(const m of (old?P.hold.yesOld:P.hold.yes)) items.push(m); const z=S.zoneOf(P.place), o=S.openH(z,day)||8; const until=Math.min(12,P.hold.until||12);   /* 第 6 節：之後的學期＝「老位子」那一句、隔天占老位子 */
      R.hold={who:id,day,zone:z,place:P.place,from:Math.max(o,P.hold.from||o),until,stay:12,arrived:false,missSent:false,atDone:false,term:t.id,old:old?[old.x,old.z,old.lv|0]:null};
      if(id==='classmate_xinci') R.note[t.id]=1; }
    else for(const m of (weekendDay(day)&&P.hold.noWe?P.hold.noWe:(P.hold.no||[]))) items.push(m);
    const at=MSG.replyAt?MSG.replyAt(G,id):{day:G.day|0,h:hr(G)+0.1}; if(items.length&&typeof PHONE!=='undefined') PHONE.at(G,at.day,at.h,items.map(text=>({th,from:id,text})),'exlib41_'+(G.day|0));
    return {ok:true,text:S.TOPIC_T,at,goes}; };   /* 熟悉度不加、不扣（這是約占位子，不是閒聊；D118）*/
  /* 到了：坐到占好的位子（GM.seatMenu → STORY.onSeat）*/
  S.arrive41=async function(GM,seat){ const G=GM.G, H=holdToday(G,G.zone); if(!H||!ZS||!seat||ZS.holdSeat!==seat&&!(ZS.holdSeat&&Math.hypot(ZS.holdSeat.x-seat.x,ZS.holdSeat.z-seat.z)<0.1)) return false;
    H.arrived=true; H.sitH=hr(G); const n=GM.npc&&GM.npc[H.who]; const P=S.cast(G)[H.who]; if(!P||!P.hold||!n||!GM.E.npcs.includes(n)) return true;
    const who={name:nameOf(H.who),obj:n.obj,charId:H.who,pose:n.pose}; H.atDone=true;
    if(dating(G,H.who)&&P.dating) await say(GM,null,P.dating);   /* 交往中：到了以後的動作照第 3 節 */
    const at=P.hold.late!=null&&H.sitH<P.hold.late&&P.hold.atEarly?P.hold.atEarly:(P.hold.at||[]); await play(GM,who,at);
    S.nodRec(G,G.zone)[H.who]=1; return true; };
  /* 占位子那一天，玩家走進讀書區＝直接走過去坐下 */
  S.autoSitDue=function(GM){ const G=GM.G, E=GM.E, H=holdToday(G,G.zone); if(!H||H.autoTried||E.player.seat||!S.inStudy(GM)||!ZS||!ZS.holdSeat) return false; return (ZS.holdSeat.lv|0)===(E.player.lv|0); };

  /* ---------- 第 4-2 節：朋友請你占 ---------- */
  S.ASK42=['zhe','yu','classmate_xinci','heroine_03'];
  /* 這學期這個人哪一天晚上問（照學期＋人當種子；那天條件不成立就往後一天）*/
  const dayMemo=new Map();
  S.ask42Day=function(G,termId,id){ const k=termId+'|'+id; if(dayMemo.has(k)) return dayMemo.get(k); const r=typeof CALENDAR!=='undefined'&&CALENDAR.termDays?CALENDAR.termDays(termId):null; let res=null;
    if(r){ const L2=[]; for(let d=r.from;d<=r.to;d++){ const t=CALENDAR.termOf(d), t1=CALENDAR.termOf(d+1); if(t&&t.week>=S.WEEK&&t1&&t1.id===termId&&!t1.exam) L2.push(d); } if(L2.length) res=L2[hash('ex42|'+k)%Math.max(1,L2.length-2)]; }
    dayMemo.set(k,res); return res; };
  S.ask42Ok=function(G,id,P){ const day=(G.day|0)+1, R=rec0(G)||{}, t=termOf(G); if(!S.friendUp(G,id)||!present(id,G)||!present(id,Gat(G,day,9))) return false;
    if(P.ask.weekdayOnly&&weekendDay(day)) return false; if(id==='classmate_xinci'&&t&&R.note&&R.note[t.id]) return false;
    if(typeof MSG!=='undefined'&&MSG.open){ const o=MSG.open(G,id); if(!o||!o.ok||o.mode==='silent') return false; }
    const z=S.zoneOf(P.place); if(!z||!S.isOpen(z,day,P.ask.h+0.05)||!S.on(G,day,P.ask.h)) return false;
    const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[id]; if(!c||!soft(S.base(c,Gat(G,day,P.ask.h+0.05)))) return false;
    return true; };
  S.ask42=function(G){ if(!law(G)||typeof PHONE==='undefined') return false; const h=hr(G); if(h<21||h>=23.5) return false; const t=termOf(G); if(!t||!S.on(G)||!S.on(G,(G.day|0)+1,10)) return false;
    const R=S.rec(G), day=G.day|0; if(R.d42&&R.d42.askDay===day) return false; if(R.hold&&R.hold.day===day+1) return false;
    const A=sub(R.asked42,t.id);
    for(const id of S.ASK42){ if(A[id]!=null) continue; const P=S.inCast(G,id); if(!P||!P.ask) continue; const d0=S.ask42Day(G,t.id,id); if(d0==null||day<d0) continue; if(!S.ask42Ok(G,id,P)) continue;
      A[id]=day; if(id==='classmate_xinci') R.note[t.id]=1; const tag='exlib42_'+day+'_'+id, z=S.zoneOf(P.place), dl=Math.min(10,P.ask.h);
      const items=P.ask.msg.map(text=>({th:'p:'+id,from:id,text})); items[items.length-1].ask={id:tag,until:(day+1)*24+dl,opts:[{t:'好。'}]};
      PHONE.at(G,day,21,items,tag); R.d42={who:id,askDay:day,day:day+1,zone:z,place:P.place,at:P.ask.h,dl,to:Math.max(12.5,P.ask.h+1.5),ok:false,placed:false,seat:null,done:false,missSent:false,tag,term:t.id};
      return true; }
    return false; };
  /* 玩家在那一間坐下（10:00 以前）＝放講義、旁邊留位子 */
  S.place42=async function(GM,seat){ const G=GM.G, E=GM.E, R=rec0(G), D=R&&R.d42; if(!D||!D.ok||D.placed||D.day!==(G.day|0)||D.zone!==G.zone||hr(G)>=D.dl||!seat||!S.studySeat(G.zone,seat)) return false;
    const P2=ZS&&ZS.pair42; let a=P2&&P2.includes(seat)?(P2[0]===seat?P2[1]:P2[0]):null;   /* 保留的那一對（D42-RESERVE-1104）：坐其中一個＝講義放另一個 */
    if(!a) a=S.adjacent(E,seat,null,q=>S.studySeat(G.zone,q)&&!S.occupied(E,q)&&(!q.taken||q.taken==='exlib42')); if(!a) return false; if(ZS&&ZS.held.has(a)){ S.unhold(E,a); ZS.held.delete(a); }
    if(P2){ for(const q of P2) if(q.taken==='exlib42') q.taken=null; ZS.pair42=null; }   /* 放好了：這一對放開（留的位子照 keep、keepSeats 留給他，他照 seatAt 坐進來）*/
    D.placed=true; D.seat=[a.x,a.z,a.lv|0]; await say(GM,null,L().place42); return true; };
  /* 他走進來、坐下（populateSchedule 照 SCHED_X 的 seatAt）＝說那一句 */
  S.arrive42Due=function(GM){ const G=GM.G, E=GM.E, R=rec0(G), D=R&&R.d42; if(!D||!D.placed||D.done||D.day!==(G.day|0)||D.zone!==G.zone) return null; const n=GM.npc&&GM.npc[D.who];
    if(!n||!n.seat||!E.npcs.includes(n)||Math.hypot(n.seat.x-D.seat[0],n.seat.z-D.seat[1])>0.5) return null; return n; };
  S.arrive42=async function(GM,n){ const G=GM.G, D=S.rec(G).d42, P=S.cast(G)[D.who]; D.done=true; if(!P||!P.ask) return false; const who={name:nameOf(D.who),obj:n.obj,charId:D.who,pose:n.pose};
    GM.sceneBegin({adv:D.who}); try{ await play(GM,who,P.ask.at||[]); } finally { GM.sceneEnd(); } S.nodRec(G,G.zone)[D.who]=1; return true; };

  /* ---------- 第 6 節：社科圖二樓（SOCLIB-2F-1104）---------- */
  S.SEAT2F='SOCLIB_2F_SEAT';
  /* 記下的老位子（G.flags.SOCLIB_2F_SEAT＝{x,z,lv,term,day}）；沒有、壞掉的＝null */
  S.old2f=function(G){ const v=G&&G.flags&&G.flags[S.SEAT2F]; return v&&typeof v==='object'&&typeof v.x==='number'&&typeof v.z==='number'?v:null; };
  S.isOld2f=(G,st)=>{ const o=S.old2f(G); return !!o&&!!st&&(st.lv|0)===(o.lv|0)&&Math.hypot(st.x-o.x,st.z-o.z)<0.1; };
  /* 旁白：這一段、二樓自習室靠窗那排（kind window；旁白寫「你在靠窗那排坐下」）、還沒記過 */
  /* AA-C 11-04 18:2x（企劃線 6a4b6ba22）：長桌第一次坐下也演（換長桌那一句）；兩種都記 SOCLIB_2F_SEAT；老位子照舊是靠窗那排第三個（SL2.oldSeat()），不是第一次坐的那一個；討論室不算 */
  S.seat2fDue=function(G,seat){ if(!G||G.zone!=='soclib_2f'||!seat||(seat.kind!=='window'&&seat.kind!=='study')||(seat.lv|0)!==1) return false; if(!S.on(G)) return false; return !S.old2f(G); };
  S.seat2f=async function(GM,seat){ const G=GM.G, t=termOf(G); if(!G.flags) G.flags={}; const o=typeof SL2!=='undefined'&&SL2.oldSeat?SL2.oldSeat():null, q=o||seat;   /* 老位子＝靠窗那排第三個；SL2 沒載入才用坐下的那一個 */
    G.flags[S.SEAT2F]={x:+q.x,z:+q.z,lv:q.lv|0,term:t?t.id:null,day:G.day|0,sat:[+seat.x,+seat.z],kind:seat.kind||null};
    const txt=seat.kind==='study'?L().seat2fTable:L().seat2f; if(txt) await say(GM,null,txt); return true; };
  /* 之後的學期（記下的不是這一學期；同一個階段——經濟系那一年的人不知道法律系的位子，反過來也一樣）：語彤、阿勳答應那一句換成「老位子」那一句；回傳記下的位子或 null */
  const stageOfTerm=id=>/^Y0/.test(String(id||''))?'econ':'law';
  S.useOld41=function(G,id){ const P=S.inCast(G,id); if(!P||!P.hold||!Array.isArray(P.hold.yesOld)||!P.hold.yesOld.length||S.zoneOf(P.place)!=='soclib_2f') return null; const o=S.old2f(G), t=termOf(G);
    if(!o||!t||!o.term||o.term===t.id||stageOfTerm(o.term)!==('law')) return null; return o; };
  /* 背景讀書的人（src/soclib2f_people3d.js）不要坐的位子：4-1 占的位子和占位子的人自己的位子、4-2 留的位子和那個人的位子、這一段表上的人在這一間常坐的位子 */
  S.keepSeats=function(GM){ const E=GM&&GM.E, G=GM&&GM.G, out=new Set(); if(!E||!G||!E.zone||!Array.isArray(E.zone.seats)) return out; const z=G.zone, seats=E.zone.seats, day=G.day|0;
    const at=a=>Array.isArray(a)?seats.find(q=>q&&(q.lv|0)===(a[2]|0)&&Math.hypot(q.x-a[0],q.z-a[1])<0.1):null, add=q=>{ if(q) out.add(q); };
    if(d42Today(G,z)&&!(ZS&&ZS.zone===E.zone&&ZS.pair42)) S.syncSeats(GM,true);   /* 背景讀書的人進來就坐好：先把 4-2 那一對留下來（D42-RESERVE-1104）*/
    if(ZS&&ZS.zone===E.zone&&ZS.holdSeat) add(ZS.holdSeat); if(ZS&&ZS.zone===E.zone&&ZS.pair42) for(const q of ZS.pair42) add(q);
    const R=rec0(G), H=R&&R.hold, D=R&&R.d42;
    if(H&&H.day===day&&H.zone===z){ add(S.spotSeat(E,z,H.who)); add(at(H.old)); }
    if(D&&D.day===day&&D.zone===z){ add(S.spotSeat(E,z,D.who)); add(at(D.seat)); }
    if(S.on(G)) for(const id of Object.keys(S.cast(G))){ const P=S.inCast(G,id); if(P&&S.zoneOf(P.place)===z) add(S.spotSeat(E,z,id)); }
    return out; };

  /* ---------- 手機（STORY.PHONE_RULES）：沒到、沒占到、21:00 的私訊 ---------- */
  S.phone=function(G){ if(!G||typeof PHONE==='undefined'||!G.flags) return; const R0=rec0(G), t=now(G);   /* 沒有 G.exlib（沒用過這一段）＝不建 */
    if(R0){ const R=S.rec(G);
      const H=R.hold; if(H&&!H.arrived&&!H.missSent&&t>=H.day*24+H.until){ H.missSent=true; const P=S.cast(G)[H.who]; const miss=P&&P.hold&&P.hold.miss;
        if(miss&&miss.length) PHONE.at(G,H.day,H.until,miss.map(text=>({th:'p:'+H.who,from:H.who,text})),'exlib41m_'+H.day); sub(R.noShow,H.term||'-')[H.who]=1; }   /* 不扣任何數值（D118）*/
      const D=R.d42; if(D&&D.ok&&!D.placed&&!D.missSent&&t>=D.day*24+D.at){ D.missSent=true; const P=S.cast(G)[D.who]; const miss=P&&P.ask&&P.ask.miss; if(miss&&miss.length) PHONE.at(G,D.day,D.at,miss.map(text=>({th:'p:'+D.who,from:D.who,text})),'exlib42m_'+D.day); } }
    S.ask42(G); };

  /* ---------- 每一格（STORY.TICKS）---------- */
  S.tick=function(GM){ const G=GM&&GM.G, E=GM&&GM.E; if(!G||!E) return false; lastGM=GM; if(busy) return false;
    S.syncSeats(GM); if(!S.isLib(G.zone)||!S.on(G)) return false;
    let job=null;
    if(S.atmosDue(GM)) job=()=>{ GM.sceneBegin(); return S.atmos(GM).finally(()=>GM.sceneEnd()); };
    else { const n=S.arrive42Due(GM); if(n) job=()=>S.arrive42(GM,n);
      else if(S.autoSitDue(GM)){ const H=holdToday(G,G.zone); H.autoTried=true; const st=ZS.holdSeat; job=()=>sitDown(GM,st); }
      else if(S.auto42Due(GM)){ const D=d42Today(G,G.zone); D.autoTried=true; const st=ZS.pair42[0]; job=()=>sit42(GM,st); }   /* 4-2：直接走過去坐保留的那一對（D42-RESERVE-1104）*/
      else if(S.fullDue(GM)) job=()=>S.fullPrompt(GM); }
    if(!job) return false;
    busy=true; Promise.resolve().then(job).catch(e=>console.warn('EXLIB',e)).finally(()=>{ busy=false; if(GM.autosave) GM.autosave(); });
    return true; };

  /* ---------- 掛上去 ---------- */
  if(typeof STORY!=='undefined'){
    if(Array.isArray(STORY.SCHED_X)&&!STORY._exlibSched){ STORY.SCHED_X.push(S.sched); STORY._exlibSched=true; }
    if(Array.isArray(STORY.TICKS)&&!STORY._exlibTick){ STORY.TICKS.push(S.tick); STORY._exlibTick=true; }
    if(Array.isArray(STORY.PHONE_RULES)&&!STORY._exlibPhone){ STORY.PHONE_RULES.push(G=>S.phone(G)); STORY._exlibPhone=true; }
    if(STORY.populate&&!STORY._exlibPop){ const p0=STORY.populate; STORY.populate=function(zoneId,GM){ lastGM=GM||lastGM;
        try{ if(GM&&GM.E&&GM.G&&GM.E.zone&&S.isLib(zoneId)){ S.syncSeats(GM,true); } }catch(e){ console.warn('EXLIB.populate(前)',e); }   /* 4-1 的位子先標 taken：populateSchedule 的人不坐 */
        const r=p0.apply(this,arguments);
        try{ if(GM&&GM.E&&GM.G&&S.isLib(zoneId)){ const G=GM.G;
            if(zoneId==='library'&&S.on(G)&&GM.npc&&GM.npc.an&&!(G.flags&&G.flags.companion==='an')){ const P=S.inCast(G,'heroine_01'); if(P&&S.zoneOf(P.place)!=='library'&&GM.removeNPC) GM.removeNPC('an'); }   /* 3F 寫死的小安（8～12 點）：這一段她照第 3 節在大廳二樓 */
            S.syncSeats(GM,true); } }catch(e){ console.warn('EXLIB.populate',e); }
        return r; }; STORY._exlibPop=true; }
    if(STORY.talkCharacter&&!STORY._exlibTalk){ const t0=STORY.talkCharacter; STORY.talkCharacter=async function(id,n){ const GM=typeof GAME!=='undefined'&&GAME&&GAME.G?GAME:lastGM;
        try{ if(GM&&GM.G&&await S.talk(GM,id,n)) return; }catch(e){ console.warn('EXLIB.talk',e); }
        return t0.apply(this,arguments); }; STORY._exlibTalk=true; }
    if(STORY.interact&&!STORY._exlibInteract){ const o0=STORY.interact; STORY.interact=async function(it,GM){
        if(it&&GM&&GM.G){ if(it.exHeld){ if(GM.toast) GM.toast('有人了。',2200); return true; }
          if(it.exHoldSeat){ await sitDown(GM,it.exHoldSeat); return true; } }
        return o0.apply(this,arguments); }; STORY._exlibInteract=true; }
    if(!STORY._exlibSeat){ const os=STORY.onSeat; STORY.onSeat=async function(GM,seat){ const r=os?await os.apply(this,arguments):false;
        try{ if(GM&&GM.G&&seat&&S.isLib(GM.G.zone)&&S.on(GM.G)){ const G=GM.G;
            if(S.studySeat(G.zone,seat)) S.rec(G).prompt[(G.day|0)+':'+G.zone]=1;   /* 今天在這一間坐過了（早上搶到位子）：起來走動不再跳「找不到位子」*/
            if(S.seat2fDue(G,seat)) await S.seat2f(GM,seat);   /* 第 6 節：第一次在這一段坐到二樓靠窗那排（自己搶到、有人占、招手都一樣）＝旁白一次、記老位子；接著照下面（占位子的人說那一句…）*/
            if(await S.arrive41(GM,seat)) return r;
            const W=S._waveGreet; if(W&&W.day===(G.day|0)&&Math.hypot(W.st.x-seat.x,W.st.z-seat.z)<0.1){ S._waveGreet=null; const n=GM.npc&&GM.npc[W.id]; if(n) await S.greet(GM,W.id,n); return r; }
            await S.place42(GM,seat); } }catch(e){ console.warn('EXLIB.onSeat',e); }
        return r; }; STORY._exlibSeat=true; } }
  if(typeof LIBQ!=='undefined'&&LIBQ.gate&&!LIBQ._exlib){ const g0=LIBQ.gate; LIBQ.gate=async function(GM,n){ const r=await g0.apply(this,arguments); if(r===true){ try{ S.noteNod(GM,n); }catch(e){ console.warn('EXLIB.noteNod',e); } } return r; }; LIBQ._exlib=true; }
  if(typeof MSG!=='undefined'&&MSG.topics&&MSG.send&&!MSG._exlib){ const t0=MSG.topics, s0=MSG.send;
    MSG.topics=function(G,id){ const out=t0.apply(this,arguments); try{ if(Array.isArray(out)&&!out.some(q=>q.k===S.TOPIC)&&S.topicOk(G,id)) return out.concat([{k:S.TOPIC,t:S.TOPIC_T}]); }catch(e){ console.warn('EXLIB.topics',e); } return out; };
    MSG.send=function(G,id,topic){ if(topic!==S.TOPIC) return s0.apply(this,arguments); return S.send41(G,id); };
    MSG._exlib=true; }
  if(typeof PHONE!=='undefined'&&Array.isArray(PHONE.ON_ANSWER)&&!PHONE._exlib){ PHONE.ON_ANSWER.push((G,m)=>{ const id=m&&m.ask&&m.ask.id; if(!id||!/^exlib42_/.test(id)||!G) return; const R=S.rec(G); if(R.d42&&R.d42.tag===id) R.d42.ok=true; }); PHONE._exlib=true; }
  if(typeof SEATACT!=='undefined'&&Array.isArray(SEATACT.AWAY)&&!SEATACT._exlib){ SEATACT.AWAY.push(GM=>S.awaySeats(GM)); SEATACT._exlib=true; }
  S._bindGM=GM=>{ lastGM=GM; };   /* 單元測試用 */
  S._zs=()=>ZS;
  S._reset=()=>{ ZS=null; busy=false; guard=false; entMemo.clear(); dayMemo.clear(); };
  return S;
})();
if(typeof window!=='undefined') window.EXLIB=EXLIB;
