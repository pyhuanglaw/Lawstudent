/* ===== 店內偶遇（SHOP-ENCOUNTER-1103，USER_WANTS X188；使用者 11-03：「我希望除了路人 也會隨機在不同店面遇到朋友 或可以認識人」）=====
   人物表 src/data/shop_enc.js（AA_632 第一批、AA_633 第二批；tools/shop_enc/import_shop_enc.py 從劇情匯入白名單讀）。擴充自由出行的偶遇（src/encounter3d.js，ENC）：
   - 進店時決定（S.enter，story3d.js populate 一開始）：種子＝日期＋店＋時段（上午、下午、晚上）；有符合條件的人時 60% 遇到；照權重選一位（前任 0.5）。
     結果存在 G.daily.shopEnc.dec['日:店:時段']，同一天同一時段進出幾次都一樣（D55）；沒有人符合時先不定（晚一點來的人還可以擲）。不會在店裡突然生出人。
   - 誰可以：這一列的星期、時段、學期、週次（weeks）、月份（months）、旗標（flags、needFlags）、桌遊夜（onlyBoardgameNight）＋多熟（stageMin；還不認識的不來）
     ＋作息（STORY.schedEnt）說她現在不在任何地方（在別的區域、在外面〔away〕、約好的時間都不行：同一個人不會同時在兩個地方）。
   - 不會遇到：考試週（期中、期末那兩週）只有 cafe、cvs（examOK 的列例外：影印店）；那天和她有約會（OUT）、約好的時間（invites）；她在國外、休學、回老家（presence）；
     劇情演出中（EVENTS.running、對話中、有人跟著你）；同一個人一天一次（和自由出行的偶遇 ENC 一起算）；同一家店同一時段最多一位。
     學姊在巷子裡定食（weekMax 1、selfOnly）：一週最多一次、只有玩家自己走進去（有人跟著你、今天約好在這間店都不排；AA_633）。
   - 她在哪裡：坐著的店（Café、半熟、燒臘、林家、定食）用 CROWD.shopSeatPick 找位子、CROWD.shopSeatTake 預約（路人不坐；到 row.to 自動失效）；
     站著的店（舊路書房、日日便利、阿德影印）在架子、櫃台前面挑一個站的地方（CROWD.shopStandTake：路人不站那裡）。
     人由 story3d.js 的 populateSchedule 照「作息」生（STORY.SCHED_X：決定以後到 row.to 她的作息就是這間店；她原本的作息開始了就照原本的、從店裡走掉）。
     溫州街的外帶窗口（巷口茶飲 wz_tea、夏日冰菓室 wz_ice）不是區域：按「買一杯飲料」「買一碗冰」時決定，在窗口前遇到（ADV），之後到 row.to 她「在外面」（away）。
   - 走近：按鈕「和○○打招呼」→ 她在做什麼（why）→ 打招呼／一起坐（join 允許時）／不打擾。打招呼＝熟悉 +1（SOCIAL.activity 'shopHi'）；
     一起坐＝AA_124 1-2「一起去 Café 坐坐」（SOCIAL.activity 'cafe'：熟悉 +3、信任 +1、自在 +2），兩個都受每天上限；不打擾沒有任何後果。不加戀愛、不算約會。
     一起坐（AA_641 第 5 節）：她的台詞以後淡出淡入、時間走 30 分鐘（aa641.joinH）、玩家坐在她旁邊的空位（S.joinSeat；沒有空位、外帶窗口就站在桌邊）、旁白一句（aa641.joinLine）、玩家站起來（她留在原位）。
       同一天同一個人一次（G.daily.shopJoin）。走 30 分鐘會撞到課（CLS.spanCheck：還沒上、沒請假的課，和 STORY.missText 同一套）或約（STORY.wakeAlarms、outStopsToday：約好的時間、校外約會、出遊）＝選項變灰、hint「等一下有○○」，按了只提示、回到選項。
     台詞照關係分層（acq／friend／dating；all＝不分），前任照 ex（點頭／走過去／打招呼；沒有寫的用 ENCOUNTERS.NOD，不加任何數值）。memo 第一次留一筆記憶。
     遇過以後（不管選什麼）按鈕回到「和○○說話」（一般的閒聊）。
   - 新認識的人宋知寧（npc_songzn，中文系二年級；朋友、不能攻略、不接閒聊階梯）：舊路書房週六 14～17（大一、大二）。3D 用通用的女學生路人、站在書架前。
     第一次（「看二手書架」）兩個選項都會認識，記 SHOP_ZN_MET；之後三句輪流（G.flags.SHOP_ZN_N）；第二次以後她說加聯絡人那一句、記 SHOP_ZN_CONTACT。
     加了聯絡人以後的訊息（AA_641 第 2 節，aa641.znMsgs 六則；S.znPhone 在 STORY.PHONE_RULES）：照順序、一天一則、每學期最多兩則、學期中的平日（週一～五）21:00～21:20（PHONE.at）；考試週、寒暑假、國定假日不發；
       上一則以後至少 S.ZN_GAP 天、加聯絡人以後至少 3 天；哪一天照種子（S.ZN_P）。第 5 則（她要去山嵐書店打工）：山嵐書店還沒進遊戲就先跳過、改發第 6 則（之後開了再補第 5 則）；
       發了以後，她在店裡的出現改到山嵐書店（aa641.znMove：週六 14–17；台詞照舊三句輪流）。
       2026-11-12（AA_828 第 6 節，企劃線 1d6055568c）：AA_641 的 znMove 寫的 spot「shanlan」是 AA_634 暫定的名字，實際的區域是 xs_shanlan——這個檔原本直接拿它當區域 id，
         S.shanlanOpen() 永遠是 false＝第 5 則一直被跳過、她從來沒搬。現在照 S.ZONE_OF 對到區域（資料檔是匯入的，不改）。AA 定：①第 5 則發了以後週六 14～17 在山嵐（頁間書屋那個時段不再有她）
         ②週日 14～18 也在山嵐（多一班；時間在 SHOP_JOBS_AA828.jobs.shanlan.co.at，匯入）——沒在山嵐打工的玩家週六、週日走進山嵐二樓都看得到她，照店內偶遇這一套 ③第 5 則以前她不在山嵐
         ④舊存檔已經跳過第 5 則、收到第 6 則的＝補發第 5 則（S.znNext 照順序找還沒發的：第 5 則排在下一則，照一樣的節奏發；sent 變成 […,5,4]，不會重發第 6 則），補發以後才搬。
         她站二樓：CROWD 的山嵐二樓四個站的點（crowd3d.js standUnits 的 lv 1；S.STAND_LV）；那一層沒有站得住的點＝照舊「沒有站的地方」取消，不另外編座標。
       記在 G.flags.SHOP_ZN_BK＝{c0 加聯絡人那天, sent:[第幾則], terms:{學期:幾則}, last, ev 今天決定過, moved 第 5 則那天}（舊存檔沒有＝沒發過）。
       玩家傳訊息給她（MSG.EXTRA：在幹嘛、分享）：她只回一句（AA 11-03 15:05 定）：分享「哈哈。」、在幹嘛「在書房。」（到山嵐以後「在山嵐顧二樓。」）、謝謝「不客氣。」、生日快樂「謝謝。」、還好嗎「還好。」、新年快樂「新年快樂。」、其他「好。」，5～30 分鐘後（00:30～08:00 傳的 08:00 以後）。
   - 阿德（影印店老闆，AA_633 shopkeepers）：「印東西」時隨機一句（每次最多一句；期中、期末那兩週機率高）。
   - 店裡客人的路人句（SHOP-DINERS-1103、AA_640）：點了聽一句（按鈕最後才算 yieldIt）——吃飯的店兩人一桌（A／B 照 pair）、Café 與慢讀咖啡（第 2～5、7 句）、
     書店（第 1～6 句）全部「（小聲）」、便利商店排隊結帳的人；考試週 quiet 多一句（LAWWW 決定）。同一位客人一天只講一句（再點還是那一句）；同一句一天內不重複；用完了其他客人不說。
     G.daily.shopHear＝{day, by:{客人:[池, 第幾句]}, used:{池:[…]}}。
   測試：node tests/shop_enc_unit.js、node tests/shop_enc_seat_unit.js */
'use strict';
const SHOPENC=(function(){
  const S={};
  const D=()=>typeof SHOP_ENC!=='undefined'?SHOP_ENC:{rows:[],newPeople:[],shopkeepers:[],hear:{}};
  const term=G=>typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(G.day):null;
  const month=G=>typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(G.day).m:0;
  const period=h=>h<12?'am':(h<18?'pm':'ev');
  const ST=()=>typeof SOCIAL!=='undefined'&&SOCIAL.STAGES?SOCIAL.STAGES:['STRANGER','ACQUAINTANCE','FAMILIAR','FRIEND','CLOSE_FRIEND','POSSIBLE_ROMANTIC_INTEREST','ROMANTIC_TENSION','RELATIONSHIP'];
  const nameOf=id=>typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(id):((typeof CHARACTERS!=='undefined'&&CHARACTERS[id]&&CHARACTERS[id].name)||id);
  const hash=s=>{ let h=2166136261; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } return h>>>0; };
  const rand=k=>typeof ENC!=='undefined'&&ENC.rand?ENC.rand(k):[hash(k+'a')/4294967296,hash(k+'b')/4294967296,hash(k+'c')/4294967296];
  /* 打招呼＝熟悉 +1（AA_632 第 1 節）：SOCIAL 的活動表沒有剛好 +1 的「打招呼」，加一種（同一種活動一天一次、受每天上限，和其他活動一樣）*/
  if(typeof SOCIAL!=='undefined'&&SOCIAL.ACT&&!SOCIAL.ACT.shopHi) SOCIAL.ACT.shopHi={fam:1};
  S.WINDOW={wz_tea:'tea',wz_ice:'ice'};   /* 溫州街的外帶窗口（不是區域；wzshops3d.js 的 order364）*/
  S.EXAM_SPOTS=['cafe','cvs'];   /* 考試週只有讀書、宵夜的地方（AA_632 第 3 節）*/
  S.ZONE_OF={shanlan:'xs_shanlan'};   /* 資料寫的店（AA_634／AA_641 暫定的名字）→ 實際的區域 id */
  S.zoneOf=spot=>(spot&&Object.prototype.hasOwnProperty.call(S.ZONE_OF,spot))?S.ZONE_OF[spot]:spot;
  S.STAND_SPOTS=['bookstore','cvs','wz_print','xs_shanlan'];   /* 站著的店：書架、貨架、櫃台前面（山嵐書店：宋知寧打工的二樓，AA_641）*/
  S.STAND_LV={xs_shanlan:1};   /* 站在哪一層（兩層的店；沒寫＝不分層，照舊）*/
  S.ZN='npc_songzn';
  const X41=()=>D().aa641||{};
  S.rows=spot=>(D().rows||[]).filter(r=>!spot||r.spot===spot);
  /* 山嵐書店（資料寫 shanlan，區域 xs_shanlan）進遊戲了沒 */
  S.shanlanZone=()=>S.zoneOf((X41().znMove||{}).spot||'shanlan');
  S.shanlanOpen=()=>typeof Z3!=='undefined'&&!!Z3.ZONES&&!!Z3.ZONES[S.shanlanZone()];
  S.spots=()=>{ const o={}; for(const r of D().rows||[]) o[r.spot]=1; for(const p of D().newPeople||[]) o[p.intro_spot]=1; const mv=X41().znMove; if(mv&&S.shanlanOpen()) o[S.shanlanZone()]=1; return Object.keys(o); };
  /* 她在山嵐的時間：[{wd（0＝週日…6＝週六，同 G.weekday）, from, to}]——AA_641 znMove（週六 14–17）＋AA_828 第 6 節多的那一班（週日 14–18；SHOP_JOBS_AA828.jobs.shanlan.co.at，匯入）。沒有 AA_828 的資料＝只有 znMove */
  S.znShanSlots=function(){ const mv=X41().znMove; if(!mv) return []; const out=(mv.days||[]).map(wd=>({wd:wd%7,from:mv.from,to:mv.to}));
    const J=typeof SHOP_JOBS_AA828!=='undefined'&&SHOP_JOBS_AA828&&SHOP_JOBS_AA828.jobs&&SHOP_JOBS_AA828.jobs.shanlan, A=J&&J.co&&Array.isArray(J.co.at)?J.co.at:[];
    for(const q of A){ if(!q||typeof q.wd!=='number'||typeof q.t0!=='number'||typeof q.t1!=='number') continue; const wd=q.wd%7; if(!out.some(o=>o.wd===wd)) out.push({wd,from:q.t0,to:q.t1}); } return out; };
  /* 她搬到山嵐了沒：第 5 則訊息發了的隔天起（SHOP_ZN_BK.moved＝發的那一天）、山嵐書店在遊戲裡 */
  S.znMoved=function(G){ const mv=X41().znMove, R=G&&G.flags&&G.flags.SHOP_ZN_BK; return !!(mv&&R&&typeof R==='object'&&R.moved!=null&&G.day>R.moved&&S.shanlanOpen()); };
  /* 新認識的人現在在哪一間、什麼時間（宋知寧：搬了以後＝山嵐書店週六 14–17、週日 14–18；今天是哪一天就給那一天的時間）*/
  S.npAt=function(G,P){ if(P&&P.id===S.ZN&&S.znMoved(G)){ const L=S.znShanSlots(), q=L.find(o=>o.wd===G.weekday)||L[0]; if(q) return Object.assign({},P,{intro_spot:S.shanlanZone(),days:L.map(o=>o.wd),from:q.from,to:q.to}); } return P; };
  S.npOf=(G,id)=>{ const P=(D().newPeople||[]).find(p=>p.id===id); return P?S.npAt(G,P):null; };
  S.rec=function(G){ const d=G.daily||(G.daily={}); let r=d.shopEnc; if(!r||r.day!==G.day) r=d.shopEnc={day:G.day,dec:{},who:{},met:[]}; if(!d.shopEncWk||typeof d.shopEncWk!=='object') d.shopEncWk={}; return r; };
  const weekKey=G=>{ const T=term(G); return T?T.id+'W'+T.week:'D'+Math.floor(G.day/7); };
  S.key=(G,spot)=>G.day+':'+spot+':'+period(G.hour%24);
  /* 她原本的作息（不算店內偶遇自己加的那一筆）*/
  let guard=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['shopenc3d:guard']=()=>{ guard=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）*/
  S.baseSched=function(c,G){ if(typeof STORY==='undefined'||!STORY.schedEnt||!c) return null; const g=guard; guard=true; try{ return STORY.schedEnt(c,G); } finally { guard=g; } };
  /* 「整段的背景作息」：作息表裡一筆在遊戲場景裡、做自己的事、時間長（6 小時以上）的（阿凱大一 18:00～08:00 在 203 的書桌、學姊大一大二平日 9～17 在總圖）——
     那是她平常大概在哪裡，不是約好的事。店內偶遇可以把那一段的一小時換成這間店（STORY.SCHED_X 換掉，別的地方就不生她：還是不會同時兩個地方）。
     上課、約好的時間、在外面（away）、出遊、劇情的位置（spot、talkEvent）、其他模組加的作息（SCHED_X）都不換 */
  S.SOFT_ACTS=['read','desk','sit','linger','wander','eat'];
  S.soft=(c,b)=>!!b&&!!c&&Array.isArray(c.daily_schedule)&&c.daily_schedule.includes(b)&&b.zone!=null&&S.SOFT_ACTS.includes(b.act)&&!b.spot&&!b.talkEvent&&!b.cls&&!b.invite&&!b.activity&&typeof b.from==='number'&&typeof b.to==='number'&&b.to-b.from>=6;
  const tierOf=(G,id)=>typeof ENC!=='undefined'&&ENC.tier?ENC.tier(G,id):{t:'acq',st:'ACQUAINTANCE'};
  const metToday=(G,who)=>{ const R=S.rec(G); if(R.met.includes(who)) return true; const em=G.daily&&G.daily.encMet; return !!(em&&em.day===G.day&&Array.isArray(em.who)&&em.who.includes(who)); };
  const timeOk=(G,days,from,to)=>{ const h=G.hour; return (days||[]).includes(G.weekday)&&h>=from&&h<to; };
  const calOk=(G,row,no)=>{ const T=term(G);
    if((row.terms||row.weeks)&&!T) return no('不在學期裡'); if(row.terms&&!row.terms.includes(T.id)) return no('學期');
    if(row.weeks&&(Array.isArray(row.weeks)?!row.weeks.includes(T.week):((T.week%2===1)!==(row.weeks==='odd')))) return no('週次');
    if(row.months&&!row.months.includes(month(G))) return no('月份');   /* AA_633：冰菓室 5、6、9 月 */
    if(T&&T.exam&&!S.EXAM_SPOTS.includes(row.spot||row.intro_spot)&&!row.examOK) return no('考試週');
    if(row.dates&&!(typeof STORY!=='undefined'&&STORY.inDates&&STORY.inDates(G,row.dates))) return no('日期');
    if(row.onlyBoardgameNight&&!(typeof BGN!=='undefined'&&BGN.isNight&&BGN.isNight(G.day))) return no('不是桌遊夜');   /* AA_634（第三批，新店）：日常失速的明軒 */
    return true; };
  /* 今天在這間店的劇情、跟著你的人、約好的地點（selfOnly：學姊的定食店）*/
  S.calm=function(G,zone){ const F=G.flags||{}; if(F.companion) return true; return (G.invites||[]).some(iv=>iv&&iv.day===G.day&&iv.accepted&&!iv.done&&(iv.zone===zone)); };
  /* 這一列現在成立嗎：{row,tier} 或 null（why 給測試看）*/
  S.eligible=function(G,row,why){ const no=w=>{ if(why) why.push(row.who+'@'+row.spot+':'+w); return null; };
    if(G.stage==='econ') return no('econ');
    if(!timeOk(G,row.days,row.from,row.to)) return no('時段'); if(calOk(G,row,no)!==true) return null;
    if(row.flags&&!row.flags.every(f=>G.flags&&G.flags[f])) return no('旗標'); if(row.needFlags&&!row.needFlags.every(f=>G.flags&&G.flags[f])) return no('needFlags');
    if(typeof STORY!=='undefined'&&STORY.presence){ const pr=STORY.presence(row.who,G); if(pr&&pr.here===false&&pr.kind!=='taipei') return no('不在（'+(pr.away||pr.kind)+'）'); }   /* 國外、休學、回老家 */
    const tr=tierOf(G,row.who); if(tr.t==='stranger') return no('還不認識');
    if(row.stageMin&&tr.t!=='dating'&&tr.t!=='ex'&&tr.t!=='catch'&&ST().indexOf(tr.st)<ST().indexOf(row.stageMin)) return no('還不夠熟');
    if(metToday(G,row.who)) return no('今天遇過了');
    { const R=S.rec(G), k=S.key(G,row.spot); if(R.who[row.who]&&R.who[row.who]!==k) return no('今天在別的地方出現過'); }
    if(typeof OUT!=='undefined'&&OUT.rec&&OUT.rec(G).some(q=>q.day===G.day&&q.state!=='missed'&&(q.who===row.who||q.with===row.who))) return no('今天和她有約');
    if((G.invites||[]).some(iv=>iv&&iv.day===G.day&&iv.who===row.who&&iv.accepted&&!iv.done)) return no('今天約好了');
    if(row.weekMax){ const W=(G.daily&&G.daily.shopEncWk)||{}; const w=W[row.who+'@'+row.spot]; if(w&&w.wk===weekKey(G)&&w.day!==G.day) return no('這週遇過了'); }
    if(row.selfOnly&&S.calm(G,row.spot)) return no('不是自己走進來');
    const c=typeof CHARACTERS!=='undefined'?CHARACTERS[row.who]:null; if(!c) return no('沒有這個人');
    const b=S.baseSched(c,G); if(b&&b.zone!==row.spot&&!S.soft(c,b)) return no('作息在別的地方');   /* 她現在照作息在某個地方（別的區域、在外面、約好的時間）：不能同時在店裡 */
    return {row,tier:tr,here:!!b}; };   /* here：作息本來就在這間店（以安週末下午在兩點半）＝照作息坐她的位子，偶遇只是走過去的那一段 */
  /* 新認識的人（宋知寧）：只看時間、學期、考試週、今天遇過沒（她不在任何人的作息裡）*/
  S.znEligible=function(G,spot,why){ const P=(D().newPeople||[]).map(p=>S.npAt(G,p)).find(p=>p.intro_spot===spot); if(!P) return null; const no=w=>{ if(why) why.push(P.id+'@'+spot+':'+w); return null; };
    if(G.stage==='econ') return no('econ'); if(!timeOk(G,P.days,P.from,P.to)) return no('時段'); if(calOk(G,Object.assign({spot},P),no)!==true) return null; if(metToday(G,P.id)) return no('今天遇過了');
    return {row:{who:P.id,spot,np:P},tier:{t:'new'}}; };
  S.candidates=function(G,spot,why){ const C=S.rows(spot).map(r=>S.eligible(G,r,why)).filter(Boolean); const z=S.znEligible(G,spot,why); if(z) C.push(z); return C; };
  /* 演出中（劇情、對話、有人跟著你）不排 */
  S.busy=function(GM){ const G=GM.G; return !!((typeof EVENTS!=='undefined'&&EVENTS.running)||(GM.D&&GM.D.active)||(G.flags&&G.flags.companion)); };
  S.decide=function(G,spot){ const R=S.rec(G), k=S.key(G,spot); if(R.dec[k]) return R.dec[k]; const C=S.candidates(G,spot); if(!C.length) return null;
    const [r1,r2]=rand('shop|'+k); let who=null; if(r1<0.6){ const W=C.map(c=>c.tier.t==='ex'?0.5:1), sum=W.reduce((a,b)=>a+b,0); let x=r2*sum; for(let i=0;i<C.length;i++){ x-=W[i]; if(x<0){ who=C[i].row.who; break; } } if(!who) who=C[C.length-1].row.who; }
    const d=R.dec[k]={who,spot}; if(who) R.who[who]=k; return d; };
  S.rowOf=(who,spot,G)=>who===S.ZN?{who,spot,np:G?S.npOf(G,who):(D().newPeople||[]).find(p=>p.id===who)}:S.rows(spot).find(r=>r.who===who)||null;
  /* 她今天在哪一間店（決定了、還在那一列的時段裡）：{key, spot, row, dec} */
  S.active=function(G,id){ const R=G.daily&&G.daily.shopEnc; if(!R||R.day!==G.day) return null;
    for(const k in R.dec){ const d=R.dec[k]; if(!d||d.who!==id||d.cancel) continue; const row=S.rowOf(id,d.spot,G); if(!row) continue; const to=row.np?row.np.to:row.to; if(G.hour<to&&(+k.split(':')[0])===G.day) return {key:k,spot:d.spot,row,dec:d}; }
    return null; };
  /* STORY.SCHED_X：決定以後到 row.to，她的作息是這間店（別的區域不生她、手機的「現在大概在」照這一筆）；她原本的作息開始了就照原本的 */
  S.sched=function(c,G){ if(guard||!c||!c.id||!G||!G.daily||!G.daily.shopEnc) return null; const a=S.active(G,c.id); if(!a||a.row.np) return null; { const b=S.baseSched(c,G); if(b&&!S.soft(c,b)) return null; }
    const row=a.row, P=a.dec.place||{}, base={days:[G.weekday],from:row.from,to:row.to,away:row.away,label:row.away,shopEnc:a.key,note:'店內偶遇（'+row.src+'）'};
    if(S.WINDOW[row.spot]||!P.seat&&!P.stand) return Object.assign(base,{zone:null,act:'out'});   /* 外帶窗口：她在溫州街（沒有 3D） */
    if(P.stand) return Object.assign(base,{zone:row.spot,act:'linger',at:[P.stand[0],P.stand[1],P.stand[2]||0,P.stand[3]|0],noPair:true});
    return Object.assign(base,{zone:row.spot,act:'read',seatAt:[P.seat.x,P.seat.z],noPair:true}); };   /* 坐著（populateSchedule：read＝坐著看書、喝東西、吃）*/
  /* 站的地方：CROWD 的架子、櫃台前面（排隊結帳那一格不算），照種子挑一個沒人站的 */
  S.standPick=function(GM,spot,k,lv){ const C=typeof CROWD!=='undefined'?CROWD:null, def=C&&C.SHOP_ZONES&&C.SHOP_ZONES[spot]; if(!def) return null; const E=GM.E, L0=lv==null?0:lv|0;   /* lv（S.STAND_LV）：只挑那一層的點，回傳 [x,z,yaw,lv] */
    const pts=def.units.filter(u=>u.stand&&u.kind!=='pay'&&(lv==null||(u.lv|0)===L0)).map(u=>lv==null?u.stand:[u.stand[0],u.stand[1],u.stand[2],L0]).filter(p=>!(E.interactables||[]).some(i=>!i.seat&&!i.hidden&&(lv==null||(i.lv|0)===L0)&&Math.hypot(i.x-p[0],i.z-p[1])<(i.exit?1.0:0.45))&&(!E.canStand||E.canStand(p[0],p[1],0.3,L0)));
    if(!pts.length) return null; const taken=(C.shopStandRes&&C.shopStandRes[spot])||{}; const free=pts.filter(p=>!taken[p[0].toFixed(2)+','+p[1].toFixed(2)]); const L=free.length?free:pts;
    return L[hash(k)%L.length]; };
  /* row.tag（WZ-SHOPS1-1104）：偶遇資料寫了 tag＝只挑那一種位子（座位的 tag：2:30 AM 的 sofa、bar、booth…；以安「她坐在沙發那一區」＝sofa）；沒有空的那一種＝沒有位子（句子寫的是那一區，不坐別的地方）。
     沒寫 tag 照舊：Café 不坐學姊的位子（5）、吧檯、沙發、今天的客人坐的位子；其他店 CROWD.shopSeatPick */
  S.seatPick=function(GM,spot,row){ const E=GM.E, G=GM.G, C=typeof CROWD!=='undefined'?CROWD:null; if(!E.zone||!Array.isArray(E.zone.seats)) return null;
    if(row&&row.tag){ const ok=E.zone.seats.filter((q,i)=>q.tag===row.tag&&!(spot==='cafe'&&i===5)&&!(C&&C.seatBusy&&C.seatBusy(E,q))&&!(C&&C.shopReserved&&C.shopReserved(spot,q,G))); return ok[0]||null; }
    if(spot==='cafe'){ const want=typeof STORY!=='undefined'&&STORY.cafeCustomers?STORY.cafeCustomers(G,E.zone.seats):[];   /* 兩點半：學姊的位子（5）、吧檯、沙發、今天的客人坐的位子不要 */
      const ok=E.zone.seats.filter((q,i)=>i!==5&&!q.bar&&!q.sofa&&!q.label&&!want.includes(i)&&!(C&&C.seatBusy&&C.seatBusy(E,q))); return ok[0]||null; }
    return C&&C.shopSeatPick?C.shopSeatPick(GM):null; };
  /* 進到店裡（story3d.js populate 一開始，路人客人、作息的人生之前）：決定、找位子、預約 */
  S.enter=function(GM,zoneId){ const G=GM.G; if(!G||!S.spots().includes(zoneId)||S.WINDOW[zoneId]) return null; const R=S.rec(G), k=S.key(G,zoneId);
    if(!R.dec[k]&&S.busy(GM)) return null; const d=S.decide(G,zoneId); if(!d||!d.who||d.cancel) return d;
    const row=S.rowOf(d.who,zoneId,G), to=row.np?row.np.to:row.to, C=typeof CROWD!=='undefined'?CROWD:null;
    if(G.hour>=to) return d;
    if(!row.np&&typeof CHARACTERS!=='undefined'&&CHARACTERS[d.who]){ const b=S.baseSched(CHARACTERS[d.who],G); if(b&&b.zone===zoneId&&!S.soft(CHARACTERS[d.who],b)){ d.place={sched:true}; return d; } }   /* 作息本來就在這間店：populateSchedule 照作息生、坐她自己的位子 */
    if(S.STAND_SPOTS.includes(zoneId)){ const p=(d.place&&d.place.stand)||S.standPick(GM,zoneId,k,S.STAND_LV[zoneId]); if(!p){ d.cancel='沒有站的地方'; return d; } d.place={stand:p[3]?[p[0],p[1],p[2],p[3]|0]:[p[0],p[1],p[2]]}; if(C&&C.shopStandTake) C.shopStandTake(zoneId,p,{day:G.day,until:to,whoId:d.who}); return d; }
    let st=null; if(d.place&&d.place.seat){ st=(GM.E.zone.seats||[]).find(q=>Math.hypot(q.x-d.place.seat.x,q.z-d.place.seat.z)<0.12)||null; if(st&&C&&C.seatBusy&&C.seatBusy(GM.E,st)&&!(C.shopReserved&&C.shopReserved(zoneId,st,G))) st=null; }
    if(!st) st=S.seatPick(GM,zoneId,row); if(!st){ d.cancel='沒有位子'; if(d.who) delete R.who[d.who]; return d; }
    d.place={seat:{x:st.x,z:st.z,lv:st.lv|0}}; if(C&&C.shopSeatTake) C.shopSeatTake(zoneId,st,{G,day:G.day,until:to,whoId:d.who,instant:true}); return d; };
  /* populate 最後：她的按鈕換成「和○○打招呼」；宋知寧（不是作息的人）在這裡生 */
  S.after=function(GM,zoneId){ const G=GM.G, E=GM.E; if(!G||!S.spots().includes(zoneId)) return; const R=S.rec(G), d=R.dec[S.key(G,zoneId)]; if(!d||!d.who||d.cancel||R.met.includes(d.who)) return;
    if(d.who===S.ZN){ const P=d.place&&d.place.stand; if(!P||(E.npcs||[]).some(n=>n&&n.shopZn)) return; const P0=S.npOf(G,S.ZN); if(!P0||G.hour>=P0.to) return;
      const spec=typeof STORY!=='undefined'&&STORY.extraSpec?STORY.extraSpec(998):{}; const o=CHAR.build(spec); o.position.set(P[0],0,P[1]); o.rotation.y=P[2]||0;
      const met=!!(G.flags&&G.flags.SHOP_ZN_MET); const n=E.addNPC({obj:o,name:met?P0.name:'',beh:'idle',pose:'idle',idlePose:'idle',frozen:true,isExtra:true,shopZn:true,lv:P[3]|0});   /* 山嵐：二樓（E.addNPC 照那一層的地板放）*/
      if(n){ n.until=P0.to; n.talkLabel=met?'和'+P0.name+'說話':'看二手書架'; n.talk=()=>S.znTalk(GM,n); } return n; }
    const n=typeof EVENTS!=='undefined'&&EVENTS.npcOf?EVENTS.npcOf(d.who):null; if(n&&(G.zone===zoneId)){ n.shopEnc=true; n.talkLabel='和'+nameOf(d.who)+'打招呼'; } return n; };
  S.pending=function(G,id){ const a=S.active(G,id); return !!a&&!a.row.np&&a.spot===G.zone&&!S.rec(G).met.includes(id); };
  const ESAY=(GM,who,t)=>GM.say(who,typeof ENC!=='undefined'&&ENC.zheGe?ENC.zheGe(GM.G,who,t):t);
  S.linesFor=function(row,t){ const L=row.lines||{}; if(L.all) return L.all; if(t==='dating') return L.dating||L.friend||L.acq||[]; if(t==='friend') return L.friend||L.acq||[]; return L.acq||L.friend||[]; };
  /* 一起坐過了（同一天同一個人一次，AA_641 第 5 節）*/
  S.joinRec=function(G){ const d=G.daily||(G.daily={}); let r=d.shopJoin; if(!r||r.day!==G.day||!Array.isArray(r.who)) r=d.shopJoin={day:G.day,who:[]}; return r; };
  S.canJoin=function(row,tr,G){ if(tr.t==='ex'||tr.t==='catch'||!row.join) return false; if(G&&S.joinRec(G).who.includes(row.who)) return false; if(row.join==='friend') return tr.t==='friend'||tr.t==='dating'; if(row.join==='dating') return tr.t==='dating'; return true; };
  S.mark=function(G,row){ const R=S.rec(G); if(!R.met.includes(row.who)) R.met.push(row.who); const em=typeof ENC!=='undefined'&&ENC.rec?ENC.rec(G).encMet:(G.daily&&G.daily.encMet); if(em&&em.day===G.day&&Array.isArray(em.who)&&!em.who.includes(row.who)) em.who.push(row.who);   /* 和自由出行的偶遇一起算「一天一次」*/
    if(row.weekMax) G.daily.shopEncWk[row.who+'@'+row.spot]={wk:weekKey(G),day:G.day};
    const L=G.daily.shopEncLog||(G.daily.shopEncLog=[]); L.push({day:G.day,h:+(G.hour%24).toFixed(2),spot:row.spot,who:row.who}); if(L.length>30) L.splice(0,L.length-30); };
  /* 遇到：why → 選項 → 台詞、數值（回傳 'greet'／'join'／'pass'／'ex'）*/
  /* 走 30 分鐘會撞到什麼：'' 或 hint「等一下有○○」（課名／約）*/
  S.joinBlock=function(G){ const X=X41(), H=X.joinH||0.5, pre=X.joinHint||'等一下有', h=G.hour;
    if(typeof CLS!=='undefined'&&CLS.spanCheck){ const sc=CLS.spanCheck(G,H,{noClose:true})||{}; const c=(sc.miss||[])[0]||(sc.hard||[])[0]; if(c) return pre+String(c).replace(/^\d{1,2}:\d{2}\s*/,''); }   /* 還沒上、沒請假的課（考試也在裡面）*/
    if(typeof STORY!=='undefined'){ const hh=h%24, A=(STORY.wakeAlarms?STORY.wakeAlarms(G,G.day):[]).filter(a=>!/考試$/.test(a.why||'')).concat(STORY.outStopsToday?STORY.outStopsToday(G,hh):[]);   /* 鬧鐘＝約好的時間前 30 分鐘（考試的鬧鐘不算：上面的課已經看了）*/
      if(A.some(a=>a.h<hh+H&&a.h+0.5>hh)) return pre+'約'; }
    return ''; };
  /* 她旁邊的空位：她坐的位子 2.2 m 以內、同一層、沒有人坐、也沒有預約給別人的；最近的一個 */
  S.joinSeat=function(GM,row,n){ const E=GM.E, G=GM.G; if(!E||!E.zone||!Array.isArray(E.zone.seats)||G.zone!==row.spot) return null; const C=typeof CROWD!=='undefined'?CROWD:null;
    let me=n&&n.seat; if(!me){ const a=S.active(G,row.who), s=a&&a.dec.place&&a.dec.place.seat; if(s) me=s; } if(!me&&n&&n.obj) me={x:n.obj.position.x,z:n.obj.position.z,lv:n.lv|0}; if(!me) return null;
    const L=E.zone.seats.filter(q=>(q.lv|0)===(me.lv|0)&&!q.label&&Math.hypot(q.x-me.x,q.z-me.z)>0.2&&Math.hypot(q.x-me.x,q.z-me.z)<2.2&&!(C&&C.seatBusy&&C.seatBusy(E,q,n)));
    L.sort((a,b)=>Math.hypot(a.x-me.x,a.z-me.z)-Math.hypot(b.x-me.x,b.z-me.z)); return L[0]||null; };
  /* 一起坐：淡出 → 坐到她旁邊（沒有空位站在桌邊）、時間走 30 分鐘 → 淡入 → 旁白 → 站起來（她留在原位）*/
  S.sitTogether=async function(GM,row,n){ const G=GM.G, E=GM.E, X=X41(), J=S.joinRec(G); if(!J.who.includes(row.who)) J.who.push(row.who);
    if(GM.fade) await GM.fade(true); let st=null;
    try{ st=E&&E.player&&!E.player.seat?S.joinSeat(GM,row,n):null; if(st&&GM.sitAt) GM.sitAt(E.player,st); else st=null;
      if(!st&&n&&n.obj&&E&&E.player&&GM.face) GM.face(E.player,n.obj.position.x,n.obj.position.z);
      if(n&&n.obj&&E&&E.player&&!n.seat&&GM.face) GM.face(n,E.player.obj.position.x,E.player.obj.position.z);
      if(GM.advance) GM.advance(X.joinH||0.5); }
    finally { if(GM.fade) await GM.fade(false); }
    if(X.joinLine) await ESAY(GM,null,X.joinLine);
    if(st&&GM.standUp) GM.standUp(E.player); return st; };
  S.meet=async function(GM,row,tr,n){ const G=GM.G; S.mark(G,row); const who={name:nameOf(row.who),charId:row.who};
    if(row.why) await ESAY(GM,null,row.why);
    if(tr.t==='ex'||tr.t==='catch'){ const i=await GM.choose([{t:'點頭'},{t:'走過去'},{t:'打招呼'}]); if(i!==2) return 'pass';   /* 前任：不加任何關係數值、不留記錄 */
      const k=typeof ENC!=='undefined'&&ENC.exKey?ENC.exKey(row.ex,tr.how):tr.how; const L=tr.t==='ex'&&row.ex?(row.ex[k]||null):null;
      if(L) for(const t of L) await ESAY(GM,who,t); else await ESAY(GM,null,(typeof ENCOUNTERS!=='undefined'&&ENCOUNTERS.NOD)||'（她看了你一眼，點了一下頭，走了。）'); return 'ex'; }
    if(row.busy==='yes'){ await ESAY(GM,null,row.busyLine||'（她在講電話，對你揮揮手。）'); return 'busy'; }
    const join=S.canJoin(row,tr,G), blk=join?S.joinBlock(G):'', ops=[{t:'打招呼'}]; if(join) ops.push(blk?{t:'一起坐',dim:true,hint:blk}:{t:'一起坐'}); ops.push({t:'不打擾'});
    let pick=null; for(;;){ const i=await GM.choose(ops), o=ops[i]; pick=o&&o.t; if(o&&o.dim){ if(GM.toast) GM.toast(o.hint); continue; } break; }   /* 灰掉的「一起坐」：按了只提示，回到選項 */
    if(pick!=='打招呼'&&pick!=='一起坐') return 'pass';   /* 不打擾：沒有任何後果 */
    for(const t of S.linesFor(row,tr.t)) await ESAY(GM,who,t);
    if(typeof SOCIAL!=='undefined'){ if(SOCIAL.activity) SOCIAL.activity(row.who,pick==='一起坐'?'cafe':'shopHi');
      if(row.memo&&SOCIAL.has&&!SOCIAL.has(row.who,row.memo)&&SOCIAL.remember) SOCIAL.remember(row.who,row.memo,row.away||''); }
    if(pick==='一起坐') await S.sitTogether(GM,row,n);
    return pick==='一起坐'?'join':'greet'; };
  /* 走近她按「和○○打招呼」（story3d.js talkCharacter 最前面）*/
  S.talk=async function(GM,id,n){ const G=GM.G, a=S.active(G,id); if(!a||a.row.np) return false; const tr=tierOf(G,id);
    GM.sceneBegin({adv:id}); let r=null; try{ const E=GM.E; if(n&&!n.seat&&GM.face) GM.face(n,E.player.obj.position.x,E.player.obj.position.z); if(GM.cine&&n) GM.cine('talk',E.player.obj,n.obj); r=await S.meet(GM,a.row,tr,n); } finally { GM.sceneEnd(); }
    if(n){ n.shopEnc=false; n.talkLabel='和'+nameOf(id)+'說話'; } if(GM.autosave) GM.autosave(); return r; };
  /* 外帶窗口（wzshops3d.js order364 的巷口茶飲、冰菓室，點餐之前）*/
  S.window=async function(GM,spot){ const G=GM.G; if(!S.WINDOW[spot]) return null; const R=S.rec(G), k=S.key(G,spot); if(!R.dec[k]&&S.busy(GM)) return null;
    const d=S.decide(G,spot); if(!d||!d.who||d.cancel||R.met.includes(d.who)) return null; const row=S.rowOf(d.who,spot,G); if(!row||G.hour>=row.to) return null;
    return await S.meet(GM,row,tierOf(G,d.who)); };
  /* 宋知寧（AA_632 第 2 節）*/
  S.znTalk=async function(GM,n){ const G=GM.G, F=G.flags||(G.flags={}), P=S.npOf(G,S.ZN); if(!P) return;
    const row={who:S.ZN,spot:P.intro_spot}; GM.sceneBegin(); try{ if(GM.face&&n) GM.face(GM.E.player,n.obj.position.x,n.obj.position.z);
      if(!F.SHOP_ZN_MET){ const she={name:'看書的女生',obj:n&&n.obj}; S.mark(G,row); await GM.say(null,P.first.why); for(const t of P.first.lines) await GM.say(she,t);
        const i=await GM.choose(P.first.choices.map(c=>({t:c[0]}))); const c=P.first.choices[i]||P.first.choices[0]; const L=c[1]||[];
        for(const t of L) await GM.say(/^（/.test(t)?null:she,t);   /* （…）開頭＝旁白（「（她翻了十分鐘，把書遞給你。）「第三章的筆記最好看。」」整句照稿）*/
        F[P.first.memo||'SHOP_ZN_MET']=true; F.SHOP_ZN_N=1; if(n){ n.name=P.name; n.talkLabel='和'+P.name+'說話'; } }
      else { const zn={name:P.name,obj:n&&n.obj}; if(!S.rec(G).met.includes(S.ZN)){ S.mark(G,row); const k=((F.SHOP_ZN_N|0)-1+P.later.length)%P.later.length; for(const t of P.later[Math.max(0,k)]) await GM.say(zn,t); F.SHOP_ZN_N=(F.SHOP_ZN_N|0)+1;
          if(P.contact&&!F[P.contact.flag]&&F.SHOP_ZN_N>=P.contact.after){   /* 第二次以後（contact.after＝2）*/ await GM.say(/^（/.test(P.contact.line)?null:zn,P.contact.line); F[P.contact.flag]=true; if(GM.toast) GM.toast('加了'+P.name+'的聯絡方式。'); } }
      } }
    finally { GM.sceneEnd(); } if(n){ n.talk=null; n.talkLabel=null; }   /* 一天一次：說完她繼續翻書（不另外寫台詞）*/ if(GM.autosave) GM.autosave(); };
  /* 店員招呼（AA_633 shopkeepers：阿德影印）：印東西時隨機一句（每次最多一句；考試週機率高）；不和上一句一樣 */
  S.keeperLine=function(G,spot,r){ const K=(D().shopkeepers||[]).find(q=>q.spot===spot); if(!K||!K.lines||!K.lines.length) return null; const T=term(G); const p=T&&T.exam?0.6:0.25;
    const x=r!=null?r:Math.random(); if(x>=p) return null; const F=G.flags||(G.flags={}), last=F.shopKeepLast&&F.shopKeepLast[spot]; let i=Math.floor(Math.random()*K.lines.length)%K.lines.length; if(K.lines.length>1&&i===last) i=(i+1)%K.lines.length;
    (F.shopKeepLast||(F.shopKeepLast={}))[spot]=i; return {name:K.name,lines:K.lines[i]}; };
  // ---------- 店裡客人的路人句（AA_640）----------
  S.hearRec=function(G){ const d=G.daily||(G.daily={}); let r=d.shopHear; if(!r||r.day!==G.day) r=d.shopHear={day:G.day,by:{},used:{}}; return r; };
  /* 池：dine（兩人一桌）／quiet_cafe／quiet_book／cvs；每一句＝[[說話的 A 或 B 或 null, 句子], …] */
  S.pool=function(G,name){ const H=D().hear||{}, T=term(G), ex=!!(T&&T.exam);
    if(name==='dine') return (H.dine||[]).map((q,i)=>({i,lines:q.pair}));
    if(name==='cvs') return (H.cvs||[]).map((t,i)=>({i,lines:[[null,t]]}));
    if(name==='quiet_cafe'||name==='quiet_book'){ const use=(H.quietUse||{})[name==='quiet_cafe'?'cafe':'book']||[]; const out=use.filter(i=>H.quiet&&H.quiet[i]).map(i=>({i,lines:[[null,H.quiet[i]]]})); if(ex&&H.quietExam) out.push({i:'exam',lines:[[null,H.quietExam]]}); return out; }
    return []; };
  /* 這位客人今天說哪一句：說過＝同一句；沒說過＝今天這一池還沒有人說過的（照種子挑）；用完了＝null */
  S.hearPick=function(G,name,cust,peek){ const R=S.hearRec(G); if(R.by[cust]) return R.by[cust]; const P=S.pool(G,name), U=R.used[name]||[]; const free=P.filter(q=>!U.includes(q.i)); if(!free.length) return null;
    const q=free[hash(G.day+'|'+cust)%free.length]; if(peek) return q; (R.used[name]||(R.used[name]=[])).push(q.i); return (R.by[cust]={pool:name,i:q.i,lines:q.lines}); };
  S.kindPool=function(defKind,unitKind,n){ if(defKind==='meal'||defKind==='brunch') return n===2&&(unitKind==='face'||unitKind==='side')?'dine':null; if(defKind==='cafe') return 'quiet_cafe'; if(defKind==='book') return 'quiet_book'; if(defKind==='cvs') return unitKind==='pay'?'cvs':null; return null; };
  S.hear=async function(GM,npcs,name,cust){ const G=GM.G; if(!GM||(GM.D&&GM.D.active)) return false; const q=S.hearPick(G,name,cust); if(!q){ for(const m of npcs){ if(m){ m.talk=null; m.talkLabel=null; } } return false; }
    GM.sceneBegin(); try{ const E=GM.E, a=npcs[0]; if(GM.face&&E&&E.player&&a&&a.obj) GM.face(E.player,a.obj.position.x,a.obj.position.z);
      for(const [sp,t] of q.lines){ const m=sp==='B'?npcs[1]||npcs[0]:npcs[0]; await GM.say({name:'路人',obj:m&&m.obj},t); } } finally { GM.sceneEnd(); } return true; };
  const bindHear=(GM,npcs,name,cust)=>{ if(!S.hearPick(GM.G,name,cust,true)) return false; for(const m of npcs){ if(!m) continue; m.talkLabel='聽一句'; m.yieldIt=true; m.talk=()=>S.hear(GM,npcs,name,cust); } return true; };
  /* crowd3d.js：店裡一組客人生好的時候（spawnPeople）*/
  S.bindDiners=function(GM,spot,npcs,slot){ if(!spot||!spot.shop||!npcs||!npcs.length||typeof CROWD==='undefined') return 0; const def=CROWD.SHOP_ZONES&&CROWD.SHOP_ZONES[spot.shop]; if(!def) return 0; const u=def.units[spot.unit]||{};
    const name=S.kindPool(def.kind,u.kind,npcs.length); if(!name) return 0; if(name==='dine') return bindHear(GM,npcs,name,spot.id+'|'+slot.key)?1:0;
    let k=0; npcs.forEach((n,i)=>{ if(bindHear(GM,[n],name,n.crowdKey||(spot.id+'|'+slot.key+'|'+i))) k++; }); return k; };
  /* story3d.js：兩點半 Café 的客人（S.cafeCustomers，坐第 i 號）*/
  S.bindCafe=function(GM,n,i){ if(!n) return false; const G=GM.G, h=G.hour%24, b=h>=11&&h<14?'a':(h>=14&&h<18?'b':(h>=18&&h<22?'c':'d')); return bindHear(GM,[n],'quiet_cafe','cafe|'+i+'|'+b); };
  // ---------- 宋知寧加聯絡人以後的訊息（AA_641 第 2 節）----------
  S.ZN_GAP=14; S.ZN_P=0.3; S.ZN_TAG='shop_zn_bk_';
  S.znBk=function(G){ const F=G.flags||(G.flags={}); let R=F.SHOP_ZN_BK; if(!R||typeof R!=='object') R=F.SHOP_ZN_BK={};
    if(!Array.isArray(R.sent)) R.sent=[]; if(!R.terms||typeof R.terms!=='object') R.terms={}; return R; };
  /* 第 5 則（「我下個月開始在山嵐書店打工了……有空來坐。」）只在她還會在店裡的學期發（newPeople 的 terms：到大二下）——大三以後才輪到／才補發的話她已經不出現了，那一句會變成空話：跳過（LAWWW 的保守做法，問 AA 中）*/
  S.znTermOk=function(G){ const P=(D().newPeople||[]).find(p=>p.id===S.ZN), T=term(G); return !P||!Array.isArray(P.terms)||!T||P.terms.includes(T.id); };
  /* 下一則（照順序；第 5 則：山嵐書店還沒開＝先跳過）：第幾則（0 起）或 -1 */
  S.znNext=function(G){ const L=X41().znMsgs||[], mv=X41().znMove, R=S.znBk(G); for(let i=0;i<L.length;i++){ if(R.sent.includes(i)) continue; if(mv&&i===mv.after-1&&(!S.shanlanOpen()||!S.znTermOk(G))) continue; return i; } return -1; };   /* 舊存檔（第 5 則被跳過、已經收到第 6 則）：第 5 則是最前面還沒發的＝下一則就補它（AA_828 第 6 節第 4 點）*/
  /* STORY.PHONE_RULES：一天決定一次（21:00 以前）——今天發不發、發哪一則（PHONE.at 排在 21:00～21:20）*/
  S.znPhone=function(G){ if(!G||(G.stage||'law')!=='law'||typeof PHONE==='undefined'||typeof CALENDAR==='undefined') return false; const F=G.flags||{}; if(!F.SHOP_ZN_CONTACT) return false;
    const R=S.znBk(G); if(R.c0==null) R.c0=G.day; if(R.ev===G.day) return false; if(G.hour>=21) return false; R.ev=G.day;
    const T=term(G), wd=CALENDAR.dateOf(G.day).wd%7; if(!T||T.exam||wd<1||wd>5||(CALENDAR.holiday&&CALENDAR.holiday(G.day))) return false;   /* 學期中的平日；考試週、寒暑假、國定假日不發 */
    if((R.terms[T.id]|0)>=2) return false; if(G.day<R.c0+3||(R.last!=null&&G.day<R.last+S.ZN_GAP)) return false;
    if(hash('zn|'+G.day)/4294967296>=S.ZN_P) return false;
    const i=S.znNext(G); if(i<0) return false; const L=X41().znMsgs, P=(D().newPeople||[]).find(p=>p.id===S.ZN)||{}, mv=X41().znMove;
    const h=21+(hash('znh|'+G.day)%21)/60; if(!PHONE.at(G,G.day,h,[{th:'p:'+S.ZN,from:S.ZN,name:P.name,text:L[i]}],S.ZN_TAG+(i+1))) return false;
    R.sent.push(i); R.terms[T.id]=(R.terms[T.id]|0)+1; R.last=G.day; if(mv&&i===mv.after-1) R.moved=G.day; return true; };
  /* 玩家傳訊息給她（手機的「傳訊息」，src/msg3d.js 的 MSG.EXTRA）：只回一句 */
  { const P=(D().newPeople||[]).find(p=>p.id===S.ZN);
    if(P&&typeof PHONE!=='undefined'&&PHONE.NAMES) PHONE.NAMES[S.ZN]=P.name;
    if(P&&typeof MSG!=='undefined'&&MSG.EXTRA) MSG.EXTRA[S.ZN]={name:P.name,
      open:G=>(G.flags&&G.flags.SHOP_ZN_CONTACT)?{ok:true}:{ok:false,why:'還沒有聯絡方式',noContact:true},
      topics:()=>(MSG.TOPICS||[]).filter(q=>q.k==='chat'||q.k==='share'||q.k==='night'),
      reply:(G,topic)=>{ const R=X41().znReplies||[], shan=!!(G.flags&&G.flags.SHOP_ZN_BK&&G.flags.SHOP_ZN_BK.moved!=null&&G.day>G.flags.SHOP_ZN_BK.moved);   /* AA 11-03 15:05：照話題各一句，只回這一句、沒有下文 */
        const M={share:R[0]||'哈哈。',chat:shan?'在山嵐顧二樓。':'在書房。',thanks:'不客氣。',bday:'謝謝。',ok:'還好。',newyear:'新年快樂。'}; return M[topic]||'好。'; },
      at:G=>{ const h=G.hour%24, day=G.day+Math.floor(G.hour/24), m=5+hash('znr|'+G.day+'|'+Math.round(G.hour*60))%26; if(h>=0.5&&h<8) return {day,h:8+m/60,late:true}; return {day,h:h+m/60}; }}; }
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.PHONE_RULES)&&!STORY._shopEncZn){ STORY.PHONE_RULES.push(G=>S.znPhone(G)); STORY._shopEncZn=true; }
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.SCHED_X)&&!STORY._shopEncSched){ STORY.SCHED_X.push(S.sched); STORY._shopEncSched=true; }
  return S;
})();
