/* ===== 宿舍大二到大四：312、507、409 的房間日常（AA_517，AA-C 2026-10-28，第②級；DORM-Y24-1028、DORM203-MATES-1028 延伸、USER_WANTS X123）=====
   照 AA_502（大一 203，src/dorm203_3d.js）的做法往後延伸。台詞在 src/data/dorm_y24_lines.js（DORMY24_LINES，一字照稿）。
   AA_517 第 5 節「實作時定的」（企劃線 4e703821a，AA-C 回 LAWWW-C 10:06；DORM-Y24-AAFIX-1028）：感冒那晚要阿凱有來、沛珊分開不看玩家知不知道、
     美國路線 409 第 1 列從大四下開學起算四週、三件小事那一晚祐廷不在房間各補一句（下面各節標「第 5 節」的地方）。
   AA_517 5-後補（企劃線 07709b4c6，AA-C 回 LAWWW-C 10:46；DORM-Y24-AAFIX-1028 後補）：在房間睡著算「在」、另外一版；3-1 補的旁白隔天醒來也算（下面標「5-後補」的地方）。
   誰幾點在房間照舊 story3d.js 的 S.dormMates（AA_208 第 7、8 節，稿第 4 節「作息不改」）：大二 312（ROOM_Y2）阿哲 L1 22:00（12/19 起 23:00）、柏翰 R1 22:30；
     大三 507（ROOM_Y3）、大四 409（ROOM_Y4）柏翰 R1 22:30；23:30 以後在上舖（看不到）；只在上課的學期。例外只有一個：3-3 那一晚柏翰在（S.lastNight，見下面）。
   ■ 第 1 節 走進房間的旁白（背景室友，沒有 3D、沒有名字）：玩家從門口走進房間（GM.enter → story3d.js 的 S.onEnter 叫 S.entered）才說——
       睡覺醒來（sleepNow 換房間的那一次，STORY._sleeping）、讀檔、搬進新房間（ROOM_Y*_MOVING）、劇情帶進房間（演出中）不算；待在房間裡跳時間本來就不換區域。
       走進來以後玩家空下來（淡入、進門的事件之後，S.WAIT_MS）才說，字幕；中間演了事件、走出房間、換一天、過了 15 分鐘（遊戲時間）＝不說了。
       那一間的句子照順序輪流（312 一個學弟三句；507、409 兩個人各一句＝兩個人輪流），同一天同一句不說第二次；「學弟在問阿哲」那一句阿哲在房間（STORY.dormWho）才說，不在就換下一句。
       背景室友只在那一間的上課學期（312＝大二、507＝大三、409＝大四；寒暑假回家、3-3「學弟們先走了」）、07:00～23:30（23:30 以後在上舖，同 S.dormWho）。
       背景室友沒有 3D 人物（稿第 4 節）；床上的新生手冊、紙箱、大耳機這類小東西是 3D 美術（LAWWW2，照 AA_208 第 7、8 節），這裡只有旁白。
   ■ 第 2 節 在房間講話（S.roomTalk：story3d.js talkCharacter 在 DORM203.roomTalk 後面問）：只在宿舍房間、跟那一間的室友（312 阿哲、柏翰；507、409 柏翰）；
       每句一次、照表的順序和條件（S.rowOpen）；一天最多一句新的，其他時候是稿「之後」那兩句輪流；這一間一句都還沒說過、現在也沒有能說的＝照原本的閒聊。房間外照各人原本的閒聊。
       「大二上」＝大二上起（之後的學期也算）；「第 1～4 週」只在那一學期那幾週；「第 12 週以後」＝那一學期第 12 週起（之後的學期也算）；
       「期末前」＝那一學期第 10 週到期末考前一週（16 週的學期第 10～15 週，稿 2-1；大四下 15 週、第 15 週是期末考週＝第 10～14 週）。
       柏翰、沛珊分開以後（第 5 節第 2 點：不看玩家知不知道）＝沛珊和柏翰交往過（S.psBohanWas）、到了分開那一週（大二上第 6 週，2026-10-12 週一）以後、祐廷現在沒有和沛珊交往。
         「交往過」：characters.js 沛珊的 partner（2026-04-06 起、大二上第 6 週分開；玩家和沛珊交往＝沒有這一段，AA_374 第 11 項）——分開那一週的週一祐廷沒有在和她交往
         （ROMANCE_HISTORY 每一段的開始、結束，到週）；演過分開的那一件（ev_peishan_split、合併前的 ev_peishan_bohan_split）、群組看過（ps_split_group）一定算（那幾件只在沒和她交往時才有）。
       507 感冒那晚（第 5 節第 1 點）＝ev_cold_week_night（大三上 2027-10-24，AA_315 3-2）演過、而且那一晚阿凱有來（COLD_WEEK_PRESENT 有阿凱＝說了「你室友傳訊息給我說你要死了。我帶泡麵。」那一版）；
         阿凱沒來（沒有 SUNDAY_SUPPER）、那晚沒有人來、整晚不在（'missed'）＝這一列不出。12/19 以後看日期（S.dormMates 阿哲晚回來也看日期）。
       日本路線：大三下（2/20 退宿）507 那兩句不出。美國路線（稿 2-4 最後一點）：大四上人在美國——第 1 列改成大四下開學（2029-02-19）起四週＝大四下第 1～4 週（第 5 節第 3 點；原本照 12/23 返台起四週）；
       放榜那兩列看日期（第 2 列「放榜以前」12/23 已經過了＝不出；第 3 列照出）。
   ■ 第 3 節 三件小事（STORY_EVENTS，trigger auto，location dorm，一次）：條件＝祐廷在那一間、那個時間該在的人照作息在（正在走進來的等他坐下）。
       3-1 312 四份滷味：大二上第 11 週週四（2026-11-19）23:00～23:30，阿哲、柏翰。R312_SUPPER。
       3-2 507 阿哲上來借筆記：大三下第 15 週週二（2028-05-30）23:30～24:00，日本路線不演；柏翰「在」＝今晚照作息回來了（23:30 以後他在上舖、看不到：看 23:27 那一刻）。
         R507_ZHE；23:50「203（舊生）」群組兩則。
       3-3 409 最後一晚：宿舍退宿日（story3d.js Y4K.out＝2029-06-28，1A-15 宿舍期滿 10:00 收鑰匙）的前一晚 2029-06-27 23:00～23:30。
         那一晚已經放暑假（大四下 6/3 結束），S.dormMates 原本沒有柏翰：只有這一晚 22:30～23:30 他在書桌前（S.lastNight，story3d.js S.dormMates 問）。
         畢業後篇（postgrad3d.js）睡覺、站著不動＝跳到下一件事：人在 409、這一晚還沒演＝停在 23:00（S.pgStop，PG.stops），不然會直接跳到 6/28 10:00 的宿舍期滿。
         「（去關燈）」：2-4「最後一晚，燈你關」說過的，旁白多一句「（柏翰點了一下頭。）」。R409_LAST；23:40「203（舊生）」群組三則。
       那一晚祐廷沒有演到（第 5 節第 4 點、5-後補）：不補演、旗標不記（R312_SUPPER、R507_ZHE、R409_LAST 都不記），補一句——兩版：
         「睡著」（5-後補第 1 點：在房間睡著，在床上、沒醒）＝在房間醒來（sleepNow 換房間那一次，S.entered 看到 STORY._sleeping → S.woke）的這一覺睡過了那一件：
           演出的時間在醒來以前已經過了，而且睡著以前最後醒著的時候（S._awake：空下來 STORY.TICKS 跑到、從門口走進房間）在房間、在演出的時間結束以前。記 RY24.sleep。
         「不在」（第 5 節第 4 點：在別的地方、一直在別的劇情裡）＝其他沒演到的：演出的時間過了（或群組的時間到了、人不在那一間）還沒演。記 RY24.miss。
         兩版都要那一晚作息上該在的人那時候在（S.missedNight）；他們自己不在（照作息、那天不在臺北）＝那一件沒有發生，什麼都沒有；日本路線 3-2 照舊什麼都沒有。
         3-1：隔天（11/20）在 312 醒來、或第一次從門口走進 312，空下來的時候一句旁白（5-後補第 2 點，照 AA_502 3-7：醒來也算）——
           睡著那一版 L.sleep「（你的書桌上放著一份滷味，已經冷了。學弟的那份吃完了。）」、不在那一版 L.miss「（垃圾桶裡有四個滷味的袋子。……）」；記 RY24.nar（說的那一天）。
           走進來的那一次背景室友那一句讓它（輪到哪一句照舊）；第 1 節背景室友那幾句醒來照舊不說（兩種用途不同，不統一）；讀檔不算；隔天沒醒在 312、也沒走進去就沒有。
         3-2：照樣 23:50 傳「203（舊生）」群組，換成「（照片：507 的地板，兩雙拖鞋）」「所以少兩雙」（L.missGroup）——23:50 人不在 507 就傳（那一件之後不再演）；
           23:50 還在 507、那一件還沒演（在別的劇情裡）＝等它演；到 24:00 演出的時間過了還沒演＝算不在，這時候才傳（訊息時間是 24:00，PHONE.tick 晚 15 分鐘以內照現在的時間）。
         3-3：23:40 群組換成「最後一晚」「哥你人咧（ZHE_CALLS_GE）／你人咧」「所以又少一個」。畢業後篇跳時間：整點跑手機規則（postgrad3d.js），6/28 00:00 那一次補在 23:40。
         睡著那一版的群組（L.sleepGroup，醒來以後 S.phone 傳）：3-2「（照片：507，你的床，棉被拱起來一團）」「睡死了」「所以還是三個」——00:00（5-後補第 4 點「睡著的那一版也一樣：00:00 才傳」；
           第 1 點寫 23:50，照第 4 點）；3-3「最後一晚」「哥睡著了（ZHE_CALLS_GE）／他睡著了」「所以還是算在」23:40。畢業後篇睡覺＝跳到下一件事，人在 409 停在 23:00（S.pgStop）照演，不會睡過去。
         群組都照原本的時間（睡過、跳過時間的照原本的時間補，PHONE.tick）；晚三天以上不補（舊存檔讀進來已經過了很久的那一晚）；不在 203 群組不傳。STORY.PHONE_RULES 每一輪問（S.phone）。
   ■ 群組（AA_502 第 4 節的 g:r203；名稱照 AA_502 第 6 節＝「203（舊生）」）：那一件演過才傳；不在群組（沒有 203 四人房的舊存檔）不傳。tag rt_ 開頭（例行訊息，不算手機的頻率上限）。
   存檔：G.flags.RY24＝{walk:{房間:{i,day,used}}, talk:{'房間:人物':[說過的鍵]}, tday:{'房間:人物':第幾天}, after:{'房間:人物':第幾次}, ev:{鍵:演的那一天}, g:{鍵:排進手機的那一天},
     miss:{鍵:算成不在的那一晚}（第 5 節）, sleep:{鍵:算成睡著的那一晚}（5-後補）, nar:{鍵:3-1 補的旁白說了的那一天}}；
     第一次用到才建（舊存檔沒有＝照常，每一格缺的補 {}）。旗標照稿：R312_SUPPER、R507_ZHE、R409_LAST（true）。沒有新的鎖（不需要 LOADLOCKS）。
   測試：node tests/aa517_dorm_y24_unit.js（第 6 項＝AA_517 第 5 節的四件、第 7 項＝5-後補；第 0 項對稿兩個方向含第 5 節第 4 點、5-後補第 1 點）*/
'use strict';
const DORMY24=(function(){
  const S={};
  if(typeof STORY==='undefined'||typeof DORMY24_LINES==='undefined'||typeof STORY_EVENTS==='undefined') return S;
  const L=DORMY24_LINES, BH='classmate_bohan', GID='r203', TH='g:'+GID;
  const DK=k=>STORY.dayOfKey?STORY.dayOfKey(k):null;
  const TD=(t,w,wd)=>STORY.termDayIn?STORY.termDayIn(t,w,wd):null;   /* wd：1＝週一 … 7＝週日 */
  const now=G=>G.day*24+(+G.hour||0), hh=G=>{ const x=+G.hour||0; return ((x%24)+24)%24; };
  const law=G=>!!G&&!!G.flags&&(G.stage||'law')==='law';
  const done=(G,id)=>!!(G&&G.events&&G.events.done&&G.events.done[id]);
  const busy=GM=>!!((GM.E&&GM.E.player&&GM.E.player.busy)||(GM.D&&GM.D.active)||(typeof ADV!=='undefined'&&ADV.active)||(typeof EVENTS!=='undefined'&&EVENTS.running));
  const term=d=>typeof CALENDAR!=='undefined'?CALENDAR.termOf(d):null;
  const route=G=>STORY.route?STORY.route(G):null;
  const out=(F,d)=>F.MOVED_OUT!=null&&F.MOVED_OUT!==false&&!(d!=null&&typeof F.MOVED_OUT==='number'&&F.MOVED_OUT>d);   /* 1A-15 宿舍期滿搬走（同 home3d.js HOME.movedOut）。MOVED_OUT＝搬走那一天：
     d＝問的是第幾天（G.day），那一天還沒搬（第 5 節：搬走以後才問 409 最後一晚 6/27 那時候的事，例如畢業後篇跳時間 6/28 才跑到手機規則）*/
  const ROOM_TERM={r312:'Y2',r507:'Y3',r409:'Y4'};
  /* 現在住哪一間（dorm3d.js homeOf 的順序）：409（ROOM_Y4）、507（ROOM_Y3）、312（ROOM_Y2）；還在 203、經濟系、搬出宿舍、交換退宿到返台（STORY.movedOut）、日本路線退宿到搬進 409（JP.movedOut）＝null */
  S.room=function(G){ if(!law(G)) return null; const F=G.flags; if(out(F,G.day)) return null;
    if((STORY.movedOut&&STORY.movedOut(G))||(typeof JP!=='undefined'&&JP.movedOut&&JP.movedOut(G))) return null;
    return F.ROOM_Y4?'r409':F.ROOM_Y3?'r507':F.ROOM_Y2?'r312':null; };
  /* 紀錄：make＝沒有就建（舊存檔照常）；每一格缺的補 {} */
  S.rec=function(G,make){ const F=G&&G.flags; if(!F) return null; let R=F.RY24; if(!R||typeof R!=='object'){ if(!make) return null; R=F.RY24={}; }
    for(const k of ['walk','talk','tday','after','ev','g','miss','sleep','nar']) if(!R[k]||typeof R[k]!=='object') R[k]={}; return R; };

  /* ======================= 第 1 節：走進房間的旁白 ======================= */
  S.mates=function(G,room){ const T=term(G.day), x=hh(G); return !!T&&!!room&&T.id.slice(0,2)===ROOM_TERM[room]&&x>=7&&x<23.5; };   /* 背景室友在：那一間的上課學期、07:00～23:30 */
  S.walkLine=function(G){ const room=S.room(G), A=room&&L.walkIn[room]; if(!A||!A.length||!S.mates(G,room)) return null;
    const R=S.rec(G,true), w=R.walk[room]||(R.walk[room]={i:0,day:null,used:[]}); if(!Array.isArray(w.used)) w.used=[]; if(w.day!==G.day){ w.day=G.day; w.used=[]; }
    let W=[]; try{ W=STORY.dormWho(G)||[]; }catch(e){ W=[]; } const zheIn=W.some(x=>x[0]==='zhe');
    for(let j=0;j<A.length;j++){ const k=((w.i|0)+j)%A.length; if(w.used.includes(k)||(A[k].zhe&&!zheIn)) continue; w.used.push(k); w.i=k+1; return A[k].t; }   /* 輪到的那一句今天說過、或阿哲不在＝換下一句 */
    return null; };
  S._walk=null;   /* 走進房間的那一次（不存檔）：{k:'區域|第幾天', t:遊戲時間, ms:真實時間, n:那時候演過幾件事件} */
  S.WAIT_MS=1500;   /* 走進來、淡入以後等一下（進門的事件 EVENTS.onEnter 600 ms、HOME.back 的「回到宿舍。」字幕先）*/
  S._wake=null;   /* 在房間醒來的那一次（不存檔）：{k:'區域|第幾天', ms:真實時間}——5-後補第 2 點：3-1 補的旁白醒來也算（第 1 節那幾句醒來不說）*/
  S._awake=null;   /* 最後一次看到祐廷醒著（不存檔）：{t:遊戲時間, zone}——S.tick（空下來）、從門口走進房間記；在房間醒來時，這一覺從這時候算（S.woke）*/
  S.entered=function(GM,opts){ const G=GM&&GM.G; S._walk=null; S._wake=null; opts=opts||{}; if(!G||G.zone!=='dorm'||!S.room(G)) return false; const F=G.flags||{};
    if(STORY._sleeping&&!opts.fromLoad){ try{ S.woke(G); }catch(e){ console.warn('DORMY24.woke',e); } S._wake={k:G.zone+'|'+G.day,ms:Date.now()}; return false; }   /* 在房間醒來（sleepNow 換房間那一次）：第 1 節不說；這一覺睡過的小事＝睡著那一版（5-後補）*/
    S._awake={t:now(G),zone:G.zone};   /* 進房間的時候醒著（讀檔、劇情帶進來也是）*/
    if(opts.fromLoad||STORY._sleeping||F.ROOM_Y2_MOVING||F.ROOM_Y3_MOVING||F.ROOM_Y4_MOVING||busy(GM)) return false;   /* 讀檔、睡覺醒來、搬進新房間、劇情帶進來的不算 */
    S._walk={k:G.zone+'|'+G.day,t:now(G),ms:Date.now(),n:(G.events&&G.events.count)|0}; return true; };
  /* 每一輪（STORY.TICKS；玩家空下來才會跑到）：走進來的那一句。字幕，不擋路，回傳 false */
  S.tick=function(GM){ const G=GM&&GM.G; if(!G) return false; S._awake={t:now(G),zone:G.zone};   /* 5-後補：空下來（STORY.TICKS 跑得到）＝醒著 */
    if(S._wake){ const v=S._wake; if(G.zone!=='dorm'||v.k!==G.zone+'|'+G.day) S._wake=null;   /* 醒來以後走出房間、換一天：不說了（那一天再走進來照樣說）*/
      else if(!busy(GM)&&Date.now()-v.ms>=S.WAIT_MS){ S._wake=null; const t=S.missLine(G); if(t&&GM.caption) GM.caption('',t,4200); return false; } }   /* 在房間醒來、空下來：只有 3-1 補的旁白 */
    const w=S._walk; if(!w) return false;
    if(G.zone!=='dorm'||w.k!==G.zone+'|'+G.day||now(G)<w.t||now(G)-w.t>0.25||((G.events&&G.events.count)|0)!==w.n){ S._walk=null; return false; }   /* 走出房間、換一天、過了 15 分鐘、中間演了事件：不說了 */
    if(busy(GM)||Date.now()-w.ms<S.WAIT_MS) return false;
    S._walk=null; const t=S.missLine(G)||S.walkLine(G); if(t&&GM.caption) GM.caption('',t,4200); return false; };   /* 3-1 那一晚不在房間：隔天第一次走進來是那一句（第 5 節第 4 點）*/

  /* ======================= 第 2 節：在房間講話 ======================= */
  const TERMS=['Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'];
  const termWeeks=id=>{ const T=typeof CALENDAR!=='undefined'&&Array.isArray(CALENDAR.TERMS)?CALENDAR.TERMS.find(x=>x.id===id):null; return T?T.weeks:16; };
  /* ---- 柏翰和沛珊分開以後（第 5 節第 2 點：不看玩家知不知道）---- */
  const PS='classmate_peishan', psDating=G=>!!(G&&G.flags&&G.flags['dating_'+PS]);
  S.splitDay=()=>TD('Y2S1',6,1);   /* 分開那一週（大二上第 6 週）的週一＝2026-10-12（events.js ev_peishan_split、characters.js partner untilWeek 都是這一週）*/
  /* ROM 的 S.when 字串 → 第幾天：'Y2S1W6'＝那一週的週一；'D123'＝寒暑假的那一天；'Y0'＝經濟系那一年（可昕）；認不得＝null */
  const whenDay=s=>{ if(typeof s!=='string') return null; if(s==='Y0') return -Infinity; let m=s.match(/^D(-?\d+)$/); if(m) return +m[1]; m=s.match(/^(Y\dS\d)W(\d+)$/); return m?TD(m[1],+m[2],1):null; };
  /* 第 x 天（那天 00:00）祐廷在和沛珊交往嗎：ROMANCE_HISTORY（romance3d.js，每一段 {id, from, to}；from、to 到週）有一段在 x 那一週以前開始、x 那一週或以後才結束。
     還沒結束（to 空的）又不是現在交往中（舊存檔、資料不齊）＝不知道什麼時候結束的，不算。沒有 ROMANCE_HISTORY＝null（不知道）*/
  S.psDatingOn=function(G,x){ const Hs=G&&G.flags&&G.flags.ROMANCE_HISTORY; if(!Array.isArray(Hs)||x==null) return null;
    return Hs.some(q=>{ if(!q||q.id!==PS) return false; const a=whenDay(q.from); if(a==null||!(a<x)) return false; if(q.to==null) return psDating(G); const b=whenDay(q.to); return b!=null&&b>=x; }); };
  /* 沛珊和柏翰交往過：分開那一週的週一祐廷沒有在和她交往（她 2026-04-06 起和柏翰在一起，祐廷和她交往中＝沒有這一段；交往中不能約、不能告白，DATE 的 partner）；
     演過分開那一件、群組看過她說分開（ps_split_group）＝一定有（那幾件只在祐廷那時候沒有和她交往才有）*/
  S.psBohanWas=function(G){ if(done(G,'ev_peishan_split')||done(G,'ev_peishan_bohan_split')||(typeof PHONE!=='undefined'&&PHONE.sent&&G.msgs&&PHONE.sent(G,'ps_split_group'))) return true;
    const d=S.splitDay(); return d!=null&&S.psDatingOn(G,d)!==true; };
  S.split=G=>{ const d=S.splitDay(); return d!=null&&G.day>=d&&!psDating(G)&&S.psBohanWas(G); };
  /* 507 感冒那晚（第 5 節第 1 點）：ev_cold_week_night 演過、那一晚阿凱有來（COLD_WEEK_PRESENT：交誼廳那一晚來的人，story3d.js S.coldWeekNight 記；整晚不在＝'missed'、[]）*/
  S.cold=G=>{ const F=(G&&G.flags)||{}, P=F.COLD_WEEK_PRESENT; return (done(G,'ev_cold_week_night')||typeof F.COLD_WEEK_NIGHT==='number')&&Array.isArray(P)&&P.includes('kai'); };
  S.rowOpen=function(G,r){ const T=term(G.day), cur=T?T.id:(STORY.termAt?STORY.termAt(G.day):null), wk=T?T.week:99, ci=TERMS.indexOf(cur), ri=TERMS.indexOf(r.term);   /* 寒暑假＝前一個學期的最後（wk 99）*/
    if(ci<0||ri<0||ci<ri) return false;
    if(r.noJP&&route(G)==='JP') return false;
    if(r.us&&typeof r.us==='object'&&route(G)==='US'){ if(!T||cur!==r.us.term||wk<r.us.weeks[0]||wk>r.us.weeks[1]) return false; }   /* 美國路線改照這幾週（409 第 1 列：大四下開學 2029-02-19 起四週＝大四下第 1～4 週，第 5 節第 3 點）*/
    else if(r.weeks&&(!T||cur!==r.term||wk<r.weeks[0]||wk>r.weeks[1])) return false;
    if(r.after&&ci===ri&&wk<r.after) return false;
    if(r.prefinal&&(!T||cur!==r.term||wk<10||wk>termWeeks(r.term)-1)) return false;
    if(r.from){ const d=DK(r.from); if(d==null||G.day<d) return false; }
    if(r.need==='split'&&!S.split(G)) return false;
    if(r.need==='cold'&&!S.cold(G)) return false;
    return true; };
  const key=(room,id)=>room+':'+id;
  S.nextRow=function(G,room,id){ const T=L.room[room]&&L.room[room][id]; if(!T) return null; const R=S.rec(G), said=(R&&R.talk[key(room,id)])||[]; return T.rows.find(r=>!said.includes(r.k)&&S.rowOpen(G,r))||null; };
  S.said=(G,room,id,k)=>{ const R=S.rec(G); return !!R&&(R.talk[key(room,id)]||[]).includes(k); };
  const sayRow=async(GM,who,room,id,r)=>{ const R=S.rec(GM.G,true), kk=key(room,id); (R.talk[kk]||(R.talk[kk]=[])).push(r.k); R.tday[kk]=GM.G.day;
    if(r.pre) await GM.say(null,r.pre); await GM.say(who,r.t);   /* 「（旁白）「台詞」」那兩格：先旁白、再他說 */
    if(typeof SOCIAL!=='undefined'&&SOCIAL.activity){ SOCIAL.activity(id,'chat'); SOCIAL.activity(id,'chatNew'); } };
  S.roomTalk=async function(GM,who,id){ const G=GM.G; if(!G||G.zone!=='dorm') return false; const room=S.room(G), T=room&&L.room[room]&&L.room[room][id]; if(!T) return false;
    const R=S.rec(G,true), kk=key(room,id), r=R.tday[kk]===G.day?null:S.nextRow(G,room,id); if(r){ await sayRow(GM,who,room,id,r); return true; }
    if(!(R.talk[kk]||[]).length) return false;   /* 這一間一句都還沒說過、現在也沒有能說的：照原本的閒聊 */
    const A=T.after, a=A[(R.after[kk]|0)%A.length]; R.after[kk]=(R.after[kk]|0)+1; await GM.say(a.speaker===null?null:who,a.text);
    if(typeof SOCIAL!=='undefined'&&SOCIAL.activity) SOCIAL.activity(id,'chat'); return true; };

  /* ======================= 第 3 節：三件小事 ======================= */
  /* 宿舍退宿日（story3d.js 的 Y4K.out：1A-15 宿舍期滿，2029-06-28 10:00 收鑰匙）的前一晚＝3-3 最後一晚 */
  S.lastDay=()=>{ const d=DK((STORY.Y4K&&STORY.Y4K.out)||'2029-06-28'); return d!=null?d-1:null; };
  /* 3-3 那一晚柏翰在 409（22:30～23:30，S.dormMates 問）：已經放暑假，作息原本沒有他；只有這一晚、還住 409 的 */
  S.lastNight=function(G){ const F=(G&&G.flags)||{}; if(!law(G)||!F.ROOM_Y4||out(F,G.day)) return false; const d=S.lastDay(); return d!=null&&G.day===d; };
  S.EVS=[
    {k:'sup312',id:'ev_r312_supper',title:'四份滷味',room:'r312',days:()=>[TD('Y2S1',11,4)],t:[23,23.5],need:['zhe',BH],part:['zhe',BH]},   /* 避開第 10 週週四 11/12「哲 2」*/
    {k:'zhe507',id:'ev_r507_zhe',title:'阿哲上來借筆記',room:'r507',days:()=>[TD('Y3S2',15,2)],t:[23.5,24],need:[BH],probe:23.45,noJP:true,part:['zhe',BH]},   /* probe：23:30 以後柏翰在上舖，看 23:27 那一刻在不在 */
    {k:'last409',id:'ev_r409_last',title:'最後一晚',room:'r409',days:()=>[S.lastDay()],t:[23,23.5],need:[BH],part:['zhe',BH]} ];
  S.ev=k=>S.EVS.find(e=>e.k===k)||null;
  /* 照作息，第 d 天 h 點，need 的人都在房間（不看玩家在哪；STORY.dormWho）*/
  S.allIn=function(G,need,d,h){ const G2=(d===G.day&&h===G.hour)?G:Object.assign({},G,{day:d,hour:h,weekday:typeof CALENDAR!=='undefined'?CALENDAR.dateOf(d).wd%7:G.weekday}); let W=[]; try{ W=STORY.dormWho(G2)||[]; }catch(e){ return false; } return need.every(id=>W.some(w=>w[0]===id)); };
  S.evDue=function(G,GM,e){ if(!G||G.zone!=='dorm'||S.room(G)!==e.room) return false; if(e.noJP&&route(G)==='JP') return false; const R=S.rec(G); if(R&&(R.ev[e.k]!=null||R.miss[e.k]!=null||R.sleep[e.k]!=null)) return false;   /* miss、sleep：已經算成祐廷不在（3-2 群組 23:50 傳了）、睡著，之後回來也不演 */
    if(!e.days(G).includes(G.day)) return false; const x=hh(G); if(x<e.t[0]||x>=e.t[1]) return false;
    if(!S.allIn(G,e.need,G.day,e.probe!=null?Math.min(+G.hour||0,e.probe):G.hour)) return false;
    for(const id of e.need){ const n=GM&&GM.npc&&GM.npc[id]; if(n&&n.dormGo!=null) return false; }   /* 正在走進來（S.dormSpawn）：等他坐下 */
    return true; };
  S.nodDue=G=>S.said(G,'r409',BH,'d5');   /* 3-3「（去關燈）」：2-4「最後一晚，燈你關。……之前都是我。」說過的 */
  /* 群組（那一件演過才傳；第 5 節：祐廷不在房間的那一晚換成 L.missGroup，tag 多一個 m；5-後補：睡著那一版 L.sleepGroup，tag 多一個 s）：items 照 at 分批排進手機（at 24 以上＝隔天凌晨）；
     ge＝阿哲叫「哥」的那一版才傳（true 要有 ZHE_CALLS_GE、false 要沒有）*/
  S.post=function(G,k,d,items,sfx){ const ph=typeof PHONE!=='undefined'?PHONE:null; items=items||L.group[k]; if(!ph||!items||d==null) return false; const R=S.rec(G,true); if(R.g[k]!=null) return false;
    if(!ph.inGroup(G,GID)){ R.g[k]='nogroup'; return false; }   /* 沒有 203 四人房的舊存檔：沒有這個群組 */
    const ge=!!(G.flags&&G.flags.ZHE_CALLS_GE), by={}; for(const it of items){ if(it.ge!=null&&it.ge!==ge) continue; (by[it.at]||(by[it.at]=[])).push({th:TH,from:it.from,text:it.text}); }
    let i=0; for(const h of Object.keys(by).map(Number).sort((a,b)=>a-b)) ph.at(G,d,h,by[h],'rt_r203_y24_'+k+(sfx||'')+'_'+(i++));
    R.g[k]=d; return true; };
  for(const e of S.EVS){ if(STORY_EVENTS.some(x=>x.id===e.id)) continue;
    const lines=L.ev[e.k].map(l=>l&&l.lightNod?{if:{custom:G=>S.nodDue(G)},speaker:null,text:l.text}:l);   /* 「（柏翰點了一下頭。）」：2-4 那一句說過才有 */
    STORY_EVENTS.push({ id:e.id, title:e.title, participants:e.part, location:'dorm', trigger:'auto', once:true, background:'blur', portraitLater:true, time:e.t, stage:'law',
      prereq:{custom:(G,GM)=>S.evDue(G,GM,e)}, dialogue:lines,
      after:G=>{ const R=S.rec(G,true); R.ev[e.k]=G.day; if(L.group[e.k]) S.post(G,e.k,G.day); } }); }
  /* ---- 第 5 節第 4 點：那一晚祐廷不在房間 ---- */
  /* 第 d 天（那一晚）住哪一間：照那一天算（MOVED_OUT 是那一天以後才搬的＝還住；美國、日本路線退宿照那一天）*/
  S.roomAt=(G,d)=>S.room(Object.assign({},G,{day:d,weekday:typeof CALENDAR!=='undefined'?CALENDAR.dateOf(d).wd%7:G.weekday}));
  /* 這一件是不是「那一晚祐廷不在」：還沒演、路線對、那一晚住那一間、作息上該在的人那時候在（3-2 看 23:27 柏翰回來了沒有，同 evDue 的 probe）→ 那一晚是第幾天；不是＝null。
     「演出的時間過了沒有」由呼叫的人看（3-1 隔天、群組的時間）*/
  S.missedNight=function(G,e){ if(!law(G)) return null; const d=e.days(G)[0]; if(d==null) return null; const R=S.rec(G); if((R&&R.ev[e.k]!=null)||done(G,e.id)) return null;
    if(e.noJP&&route(G)==='JP') return null; if(S.roomAt(G,d)!==e.room) return null;
    return S.allIn(G,e.need,d,e.probe!=null?e.probe:e.t[0]+0.01)?d:null; };
  /* 3-1：隔天在 312 醒來、或第一次從門口走進 312（S.tick，空下來才說）一句旁白——睡著那一版（S.woke 記的 sleep）、不然是不在那一版（那一晚沒演、作息上他們在：這時候記 miss）；
     說了記 nar（那一天）。隔天沒醒在 312、也沒走進去＝沒有 */
  S.missLine=function(G){ const room=S.room(G); for(const e of S.EVS){ if(e.room!==room||!((L.miss&&L.miss[e.k])||(L.sleep&&L.sleep[e.k]))) continue;
      const d=e.days(G)[0]; if(d==null||G.day!==d+1) continue; const R=S.rec(G,true); if(R.nar[e.k]!=null) continue; let t=null;
      if(R.sleep[e.k]===d) t=L.sleep&&L.sleep[e.k];
      else if(R.sleep[e.k]==null&&(R.miss[e.k]===d||(R.miss[e.k]==null&&S.missedNight(G,e)===d))){ R.miss[e.k]=d; t=L.miss&&L.miss[e.k]; }
      if(!t) continue; R.nar[e.k]=G.day; return t; }
    return null; };
  /* 5-後補第 1 點：在房間醒來（S.entered 看到 STORY._sleeping）——這一覺睡過去的小事＝睡著那一版（記 sleep：那一晚；旗標不記）。
     條件：那一晚該演、沒演、作息上該在的人在（S.missedNight）；醒來的時候演出的時間已經過了；還沒算成不在（miss：3-2 群組的時間人在外面，已經傳了）；
     睡著以前最後醒著的時候（S._awake）在房間、而且在演出的時間結束以前——之後才睡（那時候醒著：在外面、一直在別的劇情裡）＝不在那一版（照第 5 節第 4 點）。
     S._awake 不知道（讀檔以後沒看過）＝在房間醒來，算睡著。晚三天以上不算（同 S.phone）*/
  S.woke=function(G){ if(!law(G)) return; const t=now(G), a=S._awake, room=S.room(G);
    for(const e of S.EVS){ if(e.room!==room||!((L.sleep&&L.sleep[e.k])||(L.sleepGroup&&L.sleepGroup[e.k]))) continue; const d=e.days(G)[0];
      if(d==null||t<d*24+e.t[1]||G.day>d+S.MISS_LATE) continue; const R0=S.rec(G); if(R0&&(R0.miss[e.k]!=null||R0.sleep[e.k]!=null)) continue;
      if(a&&(a.zone!=='dorm'||a.t>=d*24+e.t[1])) continue;
      if(S.missedNight(G,e)!==d) continue;
      S.rec(G,true).sleep[e.k]=d; } };
  /* 3-2、3-3 的群組：睡著那一版（S.woke 醒來時記的 sleep）＝照那一版的時間傳 L.sleepGroup；
     不然群組的時間到了、還沒演——人不在那一間（或還在那一間、演出的時間也過了）＝那一晚不在：照原本的時間傳 L.missGroup，記 miss（那一晚）。晚三天以上不補 */
  S.MISS_LATE=3;
  S.phone=function(G){ if(!law(G)||typeof PHONE==='undefined') return; const t=now(G);
    for(const e of S.EVS){ const d=e.days(G)[0]; if(d==null||G.day>d+S.MISS_LATE) continue; const R0=S.rec(G);
      if(R0&&R0.sleep[e.k]===d){ const sg=L.sleepGroup&&L.sleepGroup[e.k]; if(sg&&sg.length&&R0.g[e.k]==null) S.post(G,e.k,d,sg,'s'); continue; }
      const items=L.missGroup&&L.missGroup[e.k]; if(!items||!items.length||t<d*24+items[0].at) continue;
      if(R0&&(R0.miss[e.k]!=null||R0.sleep[e.k]!=null||R0.g[e.k]!=null)) continue;
      if(t<d*24+e.t[1]&&G.zone==='dorm'&&S.room(G)===e.room) continue;   /* 人在那一間、演出的時間還沒過（在別的劇情裡）：等它演 */
      if(S.missedNight(G,e)!==d) continue;
      const R=S.rec(G,true); R.miss[e.k]=d; S.post(G,e.k,d,items,'m'); } };
  /* 畢業後篇（postgrad3d.js）的「跳到下一件事」：人在 409 房間、最後一晚還沒演＝停在那一晚 23:00 */
  S.pgStop=function(G){ if(!G||G.zone!=='dorm'||S.room(G)!=='r409') return null; if(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G)) return null;
    const R=S.rec(G); if((R&&(R.ev.last409!=null||R.miss.last409!=null||R.sleep.last409!=null))||done(G,'ev_r409_last')) return null; const d=S.lastDay(); return d!=null?d*24+23:null; };

  if(Array.isArray(STORY.TICKS)) STORY.TICKS.push(GM=>{ try{ return S.tick(GM); }catch(e){ console.warn('DORMY24.tick',e); return false; } });
  if(typeof PG!=='undefined'&&Array.isArray(PG.stops)) PG.stops.push(G=>S.pgStop(G));
  if(Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>{ try{ S.phone(G); }catch(e){ console.warn('DORMY24.phone',e); } });   /* 第 5 節：不在房間那一晚的群組 */
  return S;
})();
