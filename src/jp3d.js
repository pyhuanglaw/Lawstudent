/* ===== 日本那一學期（AA_341，AA-C 2026-10-20 定稿，企劃線 c2c5a66e；J-S1～S19、G0～G9）：出發前住臺北的家 → 3/25 出發 → 2D 的據點（國際學生宿舍）→ 8/5 回程 =====
   原本（AA_341 J-S10）：ev_an_depart_jp 演完沒有進日本，玩家留在臺灣的 3D 區域，3/25～8/4 照樣能走校園、去 Café、約臺灣的朋友、打工，8/5 也沒有回程。
   - 出發：y34b3d.js 的 S.departJP 演完 → JP.arrive：離開臺北的家、進 3D 的空區域 jp_hub（看不到：畫面是 2D 的據點，home3d.js 的 backdrop 把 3D 藏起來）。
     E08（2026-10-27）：departJP 先到 3D 的出境大廳（exchange3d.js EXCH.airGo），安檢入口「登機」以後 Y34B.departFly 演登機口、飛往日本，這裡包住 departFly 進據點。
     手機和時鐘是日本時間（台灣＋1，STORY.tzOffset）。日本路線的玩家 3/25 一定出發（J-S12：交往中、挽回中都是；睡過頭、那天在出遊，醒來就出發）。
   - 人在日本（JP.inJapan(G)＝STORY.inJapan(G)：日本路線、出發了、還沒回來）：story3d.js S.tick 在事件包的 STORY.TICKS 之後叫 JP.tick（在家判斷之前）→ 據點的選單 JP.loop：
     出發（約好的出遊、視訊）、去上課（一鍵）、共用廚房、便利商店、河邊、看手機、在房間休息一下、快轉、存檔、睡覺。臺灣的區域、邀約、打工、偶遇、約會都進不去（手機「地點」是空的、不能約人）。
     每一輪先：手機規則、到了的事（JP.SCH：G1～G8 的事件、摘要日；trigger:'jp' 的事件）、其他事件包的 STORY.TICKS（開演了就讓出畫面，演完下一輪接回選單）。
   - 日本的學期（J-S1）：3/25 抵達就入住（AA_377 第 17 項；3/27 是國際學生辦公室報到）、4/10（一）開學、黃金週 4/29、5/3～5/5 沒有課、海之日 7/17 沒有課、7/21 最後一堂、期末週 7/24～7/28（摘要日）、8/4 最後一天、8/5 回程。
   - 一鍵上課（J-S2，AA_185 1-5）：日本語（中級）週一、三、五 09:00；日本法入門 週二 10:40；比較行政法 週四 13:00。2D（借台灣的小教室＋字幕），每門兩句輪流；4/10 第一堂（G2）、5/18（G5）換。
   - 快轉、睡覺（J-S3）：到下一個有事的日子／過三天／過一週；停在 JP.SCH、開發分支其他事件包在日本那幾個月的時間（JP.KNOWN、JP.STOPS、STORY.WAKE_AT）、約好的出遊（AA_326 大三後半在日本的事件都是出遊）、特別的課、回程。
     日期卡寫「宿舍」，手機規則每小時跑一次。玩家選的快轉：途中收到要回的訊息就停、打開手機（「跳過」接著跳；AA_340 6-1 H2，同 home3d.js）；選單前有沒開過的要回的訊息也先打開手機（D103）。
     X58（使用者 10-18 15:4x）：快轉、睡覺的途中收到任何一則訊息（不用回的也算）都停、打開手機，「跳過」接著跳；跳完不再說「收到 N 則」。
   - 住臺北的家（J-S11）：2/20 退宿（r2y3a3d.js 2-Y3-25）以後到 3/25 出發、8/5 回來以後到 9/3 搬進 409：home3d.js 的 loop 交給 JP.homeRound——沒有「回宿舍」，有「出門」、快轉（摘要日 G0）；
     宿舍進不去（story3d.js populate、game3d.js 的手機「地點」）。
   - 8/5 回程（J-S9、J-S19）：入境大廳（AA_253 9-2）→ 回臺北的家（AA_144 X2）→ 當晚 1A-08（story3d.js，在家的版本）；大三暑假三選一不演（裁定 10）。時間換回臺灣時間。
   - 台灣的大三下（J-S6、J-S15）：日本路線不排台灣的課、不跳開學和期中期末的提示（classes3d.js 問 JP.skipTerm）；成績單只有日本的兩門（日本語不算學分），回來以後照公布日在早上發。
     大四下補修（AA_144 X4；以安不補修，裁定 7）：courses.js 的 civpro_2_re、insurance_re（route JP；redo＝重播大三下那一門的 syllabus）。
   - 以安的手機（G9、J-S16）、時差（J-S7、J-S13、AA_342 C6：group3d.js、y34b3d.js、r2y3a3d.js、r2y3b3d.js、home3d.js、holff3d.js、vac3d.js 各自換算；這裡包住 MSG.replyAt、STORY.DAILY_PHONE）、
     該關的（J-S14；家人群組每週四「這週回來吃飯嗎」人在日本不問）、旗標別名 AN_JP_DEPARTED（J-S17）見各段。
   給其他事件包（例：AA_326 的日本路線事件，src/r2y3b3d.js）：人在日本＝STORY.inJapan(G)；G.zone＝'jp_hub'；據點裡的地方 JP.place(G)＝'room'|'kitchen'|'konbini'|'river'。
     遊戲時鐘＝日本時間：臺灣傳來的時間要 +STORY.tzOffset(G,day)（r2y3b3d.js 的 lt／jt、group3d.js 的 tw、y34b3d.js 的 tzH）。
     事件可以寫 trigger:'jp'（據點每一輪、快轉每 15 分鐘 EVENTS.check，到了就演；location 可以寫 'any'），或照舊掛 STORY.TICKS（據點每一輪會跑，回傳 true＝開演了，據點讓出畫面）。
     快轉、睡覺要停的時間：JP.STOPS.push((G,now,where)=>時間或陣列)。出遊（OUT.plan）照舊：據點的選單出現「出發：…」（must＝只有「出發」），演完回到據點（q.back 沒寫＝「回到宿舍。」）；
     人在日本時 OUT.plan 擋掉 goto 臺灣區域的出遊。挽回的分數：JP.repair(G)（G.flags.REPAIR.heroine_01，和 r2y3b3d.js 町公所那一步同一個；一週最多 +1；AA_254 第 10 節）。
   挽回中（AA_349 L1、L3）：交換生群組每週日 20:00 以安一則（4/2～7/2 共 14 週；在群組回＝REPAIR +1，私訊她＝已讀不回、不加；JP.grpPhone）；4 月平日 07:30～08:00 便利商店點頭三次（JP.nod，不加分）。
  存檔：G.jp＝{place, arr, done:{表的 key:天}, att:{'天:課':1}, n:{課:出席次數}, rot:{課:輪到第幾句}, once:{課:只出一次的那句出在哪一天}, look:{}, g9, grp:{第幾週:在群組回、加過分的那天}, nod:[點頭的那幾天]}；
    旗標 JP_RETURNED（回來的那天）、REPAIR／REPAIR_WK（挽回，同 r2y3b3d.js、r2y4a3d.js）、JP_GRP_1～14（群組那一則選了 'group'／'dm'）、AN_JP_*（各段）。舊存檔沒有＝從空的開始。
   測試：node tests/jp_semester_unit.js */
'use strict';
const JP=(function(){
  const S={};
  if(typeof STORY==='undefined') return S;
  const DK=k=>STORY.dayOfKey?STORY.dayOfKey(k):null, T=(d,h)=>d*24+h, NOW=G=>T(G.day,G.hour);
  const law=G=>!!G&&(G.stage||'law')==='law';
  const isJP=G=>law(G)&&!!STORY.route&&STORY.route(G)==='JP';
  const dating=(G,id)=>{ const F=(G&&G.flags)||{}, R=F.romance||{}; return F['dating_'+id]===true||!!(R[id]&&R[id].status==='dating'); };
  const dat=G=>dating(G,'heroine_01'), rep=G=>!dat(G);   /* 日本路線只有兩種：和以安交往中、挽回中（AA_253 第 5 節）*/
  const So=()=>typeof SOCIAL!=='undefined'?SOCIAL:null;
  const met=id=>{ const s=So(); return !!(s&&s.has&&s.has(id,'FIRST_MET')); };
  const lv=(id,l)=>{ const s=So(); return !!(s&&s.STAGES)&&met(id)&&s.STAGES.indexOf(s.stage(id))>=s.STAGES.indexOf(l); };
  const wdOf=d=>{ const w=typeof CALENDAR!=='undefined'?CALENDAR.dateOf(d).wd:((d%7)+7)%7; return w===7?0:w; };   /* 0＝週日（同 G.weekday）*/
  const hm=h=>{ h=((h%24)+24)%24; const m=Math.round(h*60); return String(Math.floor(m/60)%24).padStart(2,'0')+':'+String(m%60).padStart(2,'0'); };
  const dateLabel=t=>{ const d=Math.floor(t/24+1e-9); if(typeof CALENDAR==='undefined') return hm(t-d*24); const x=CALENDAR.dateOf(d); return x.m+'/'+x.d+'（'+['日','一','二','三','四','五','六'][wdOf(d)]+'）'+hm(t-d*24); };   /* 同 home3d.js 的日期卡 */
  const evOf=id=>typeof STORY_EVENTS!=='undefined'?STORY_EVENTS.find(e=>e.id===id)||null:null;
  const P_=()=>typeof PHONE!=='undefined'?PHONE:null;
  const A_=()=>typeof ADV!=='undefined'?ADV:null;
  const esc=s=>String(s).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[ch]);
  /* ---------------- 日子（J-S1）---------------- */
  const K={out:'2028-02-20',dep:'2028-03-25',office:'2028-03-27',term0:'2028-04-10',town:'2028-05-06',g5:'2028-05-18',term1:'2028-07-21',fin0:'2028-07-24',fin1:'2028-07-28',last:'2028-08-04',ret:'2028-08-05',room:'2028-09-03'};
  S.K=K; const D=k=>DK(K[k]); S.D=D;
  S.HOLIDAYS=['2028-04-29','2028-05-03','2028-05-04','2028-05-05','2028-07-17'];   /* 黃金週（4/29、5/3～5/5）、海之日（7/17）：沒有課 */
  S.holiday=day=>S.HOLIDAYS.some(k=>DK(k)===day);
  S.classDay=day=>{ const a=D('term0'), b=D('term1'); return a!=null&&b!=null&&day>=a&&day<=b&&!S.holiday(day)&&wdOf(day)>=1&&wdOf(day)<=5; };
  /* ---------------- 狀態 ---------------- */
  S.rec=G=>{ if(!G.jp||typeof G.jp!=='object') G.jp={}; const R=G.jp; for(const k of ['done','att','n','rot','look','once']) if(!R[k]||typeof R[k]!=='object') R[k]={}; return R; };
  S.departed=G=>isJP(G)&&!!G.flags&&G.flags.JP_DEPARTED!=null;
  S.inJapan=G=>S.departed(G)&&G.flags.JP_RETURNED==null;   /* 人在日本：出發以後、回程以前 */
  S.returned=G=>isJP(G)&&!!G.flags&&G.flags.JP_RETURNED!=null;
  S.movedOut=G=>isJP(G)&&!!G.flags&&G.flags.X1_JP!=null&&!G.flags.ROOM_Y4;   /* 2/20 退宿以後到搬進 409：台灣沒有宿舍（AA_158 第 4 節「住處」）*/
  S.homeOn=G=>S.movedOut(G)&&!S.inJapan(G);   /* 住臺北的家：出發前（2/20～3/25）、回來以後（8/5～9/3）*/
  S.place=G=>S.inJapan(G)?(S.rec(G).place||'room'):null;
  S.hasRoom3d=()=>typeof Z3!=='undefined'&&!!Z3.ZONES&&!!Z3.ZONES.jp_room&&typeof JP_DORM_LAYOUTS!=='undefined'&&!!JP_DORM_LAYOUTS.jp_room;
  S.room3d=G=>!!G&&G.zone==='jp_room'&&S.hasRoom3d();   /* 人在 3D 的「你的房間」 */
  /* 3D 房間的床（jp_dorm3d.js）：回據點、接著照選單的「睡覺」（錯過約的確認照舊）*/
  S.bedFromRoom=async function(GM){ const G=GM.G; if(!S.inJapan(G)) return false; S.rec(G).pendingSleep=true; if(GM.enter) await GM.enter('jp_hub',Object.assign({},S.SPAWN)); return true; };
  /* 3D 房間按「看」的旁白（AA_341 檔尾附加，AA-C 2026-10-21 56a36a4d；台詞照抄）：窗外分兩段日子（田五月才灌水：4/30 以前、5/1 以後）；小冰箱、行李箱各一句。
     3/28 摘要日已經講過「窗外是一片田，遠一點的地方有一座山」，這裡是別的細節。床接成「睡覺」，不用字。jp_dorm3d.js 讀 JP.roomLook（配置檔 note 是空的，產生的檔不改）*/
  S.ROOM_LOOK={ window:['（窗外的田還是乾的，土是深褐色。有人在田埂上騎腳踏車。）','（窗外的田灌了水。傍晚的時候，整片田會反光。）'],
    fridge:'（小冰箱裡有一瓶麥茶、兩顆便利商店的飯糰。其中一顆明天到期。）', suitcase:'（行李箱還攤在地上，一直沒收進櫃子。最底下有一包從台北帶來的泡麵。）' };
  S.roomLook=function(id,G){ const L=S.ROOM_LOOK[id]; if(!L) return null; if(typeof L==='string') return L; const m=G&&G.day!=null&&typeof CALENDAR!=='undefined'?CALENDAR.dateOf(G.day).m:4; return m>=5?L[1]:L[0]; };   /* 日本那一學期 3/25～8/5：5 月以後＝灌了水 */
  S.skipTerm=(G,termId)=>termId==='Y3S2'&&isJP(G);   /* J-S6：日本路線不修台灣的大三下（classes3d.js：不排課、不跳開學和期中期末的提示；成績單換日本的兩門）*/
  STORY.inJapan=G=>S.inJapan(G);
  /* ---------------- 據點：3D 的空區域（畫面是 2D）、背景 ---------------- */
  S.SPAWN={x:0,z:0,yaw:Math.PI};
  { const hub={id:'jp_hub',name:'國際學生宿舍',indoor:true,camDist:4.2,tmp:true,build(E){ return Z3.room(E,{w:6,d:6,h:3,wallColor:'#1b1e24',floorTex:W3.stoneTex('#22252b'),spawn:S.SPAWN}); }};
    if(typeof Z3!=='undefined'&&Z3.ZONES&&!Z3.ZONES.jp_hub) Z3.ZONES.jp_hub=hub; }
  if(typeof OUT!=='undefined'&&OUT.BG&&!OUT.BG.jp_room) OUT.BG.jp_room={label:'日本・國際學生宿舍',image:'assets/bg/jp_room.webp'};   /* 企劃線 bg_approved/jp_room.webp（BB-C S4 0758caf3）；其他地方沒有圖＝深色底＋地點字幕（AA_341 第 5 節）*/
  S.PLACES={room:{label:'國際學生宿舍',bg:'jp_room'},kitchen:{label:'宿舍・共用廚房',bg:'jp_kitchen'},konbini:{label:'便利商店',bg:null},river:{label:'河邊',bg:null}};   /* 便利商店的 jp_konbini 窗外有雪（3 月底那一張）：據點不用 */
  S.bgNow=G=>{ G=G||(typeof GAME!=='undefined'?GAME.G:null); const p=S.PLACES[(G&&S.place(G))||'room']||S.PLACES.room; return p.bg&&typeof OUT!=='undefined'&&OUT.bg?OUT.bg(p.bg):'dark'; };
  S.adv=G=>{ const A=A_(); if(A&&A.begin) A.begin({background:S.bgNow(G)}); };
  /* ---------------- 一鍵上課（J-S2；AA_185 1-5，課名、星期、時間、兩句旁白照抄；每門 90 分鐘：AA_349 L5 確認）---------------- */
  S.CLASSES=[
    {id:'jp_nihongo',name:'日本語（中級）',wds:[1,3,5],t0:9,t1:10.5,credit:null,lines:['老師說你的敬語很有禮貌，只是用錯了對象。','今天學了『よろしく』的十種用法。']},   /* 不抵學分 */
    {id:'jp_law_intro',name:'日本法入門（英語授課）',wds:[2],t0:10+40/60,t1:12+10/60,credit:'外國法導論',lines:['老師畫了一張圖：同一條規定，兩國的法院怎麼讀。','同學問台灣的民法從哪裡來。你答了很久。']},
    {id:'jp_comp_admin',name:'比較行政法',wds:[4],t0:13,t1:14.5,credit:'行政法專題',lines:['（教授的日文很快。你只抓得到一半，筆記上一半是問號。）','（旁邊的日本同學把筆記推過來給你看。字很小，很整齊。）'],
      once:{from:'town',line:'今天講行政指導。你想起以安說的町公所。'}} ];   /* AA_377 第 1 項：町公所那張通知 5/6 才看到——5/6 以後的第一堂出一次「想起以安說的町公所」，之後回到兩句輪流；「期末報告的題目，你寫了三次才寫定。」拿掉（6/28 摘要已經講）*/
  S.FIRST_LINE={dating:'（日本語的第一堂課。老師請每個人用日文自我介紹。你講到一半忘了「法律」怎麼說，以安在後面小聲說：ほうりつ。）',
    repair:'（日本語的第一堂課。老師請每個人用日文自我介紹。你講到一半忘了「法律」怎麼說，自己想了起來。）'};   /* G2：4/10 第一堂（挽回中：後半換）*/
  S.classesOn=(G,day)=>{ if(!S.classDay(day)) return []; const wd=wdOf(day); return S.CLASSES.filter(c=>c.wds.includes(wd)).map(c=>({c,day,t0:c.t0,t1:c.t1,key:day+':'+c.id})); };
  S.classNow=G=>{ const h=G.hour, R=S.rec(G); return S.classesOn(G,G.day).find(it=>!R.att[it.key]&&h>=it.t0-1&&h<it.t0+0.25)||null; };   /* 開始前 1 小時到開始後 15 分鐘可以去 */
  S.firstClass=(G,day)=>S.classesOn(G,day)[0]||null;
  S.special=(G,it)=>{ if(it.c.id==='jp_nihongo'&&it.day===D('term0')) return 'first'; if(it.c.id==='jp_comp_admin'&&it.day===D('g5')) return 'g5'; return null; };
  S.classSpecialNow=G=>{ const it=S.classNow(G); return !!it&&!!S.special(G,it); };
  S.attend=async function(GM,it){ const G=GM.G, R=S.rec(G), A=A_(); if(R.att[it.key]) return false;
    if(G.hour<it.t0) GM.advance(it.t0-G.hour); R.att[it.key]=1; R.n[it.c.id]=(R.n[it.c.id]|0)+1;
    const sp=S.special(G,it);
    if(sp==='g5'){ const ev=evOf('ev_jp_admin_report'); if(ev&&typeof EVENTS!=='undefined') await EVENTS.run(ev); S.adv(G); }   /* G5 5/18：以安的報告 */
    else { if(A&&A.setBg&&typeof OUT!=='undefined') A.setBg(OUT.bg('classroom_small')); if(GM.caption) GM.caption('',it.c.name,2400);
      let line; if(sp==='first') line=S.FIRST_LINE[dat(G)?'dating':'repair'];
      else if(it.c.once&&!R.once[it.c.id]&&D(it.c.once.from)!=null&&it.day>=D(it.c.once.from)){ R.once[it.c.id]=it.day; line=it.c.once.line; }   /* 那一句只出一次（不佔輪流的順序）*/
      else { const i=(R.rot[it.c.id]|0)%it.c.lines.length; R.rot[it.c.id]=i+1; line=it.c.lines[i]; }
      await GM.say(null,line); }
    if(G.hour<it.t1) GM.advance(it.t1-G.hour);
    if(A&&A.active&&A.setBg) A.setBg(S.bgNow(G)); return true; };
  /* ---------------- 要演的事（G0～G8；AA_341 第 3 節）：[key, 日期, 幾點, 在哪（home＝住臺北的家／jp＝日本）, 條件]；sum＝摘要日的一句（照抄）；ev＝事件（data/jp_events.js）---------------- */
  S.SCH=[
    {k:'g0_s1',d:'2028-02-27',h:18.5,w:'home',sum:'（不用上課的第一週。你每天早上還是七點醒。）'},
    {k:'g0_s2',d:'2028-03-06',h:18.5,w:'home',sum:'（你把日文課本的第一課念了五遍。）'},
    {k:'g0_s3',d:'2028-03-13',h:18.5,w:'home',sum:'（媽媽問你日本的冬天冷不冷。你說三月底就不冷了。她還是買了一件外套。）'},
    {k:'g0_s4',d:'2028-03-20',h:18.5,w:'home',sum:'（行李箱打開在房間地上，一個禮拜都沒有闔上。）'},
    {k:'g1_office',d:'2028-03-27',h:10,w:'jp',ev:'ev_jp_office'},
    {k:'g1_s',d:'2028-03-28',h:18.5,w:'jp',sum:'（住了三天，房間還是覺得小。窗外是一片田，遠一點的地方有一座山。）'},   /* AA_377 第 17 項：3/25 抵達那天就入住（第一句換；後半照留，問 AA 中）*/
    {k:'g3_kitchen',d:'2028-04-19',h:18.5,w:'jp',if:dat,ev:'ev_jp_kitchen'},
    {k:'g4_river',d:'2028-05-03',h:14,w:'jp',if:dat,ev:'ev_jp_goldenweek'},
    {k:'g4_s',d:'2028-05-03',h:18.5,w:'jp',if:rep,sum:'（黃金週。電車上都是人。你在宿舍讀了一整天。）'},
    {k:'g6_rain',d:'2028-06-07',h:21.5,w:'jp',if:rep,sum:'（交換生群組有人傳『梅雨開始了』，以安按了一個讚。）'},   /* G6 挽回中（旁白；AA_349 L7：加括號、裡面的引號換『』）；交往中是 21:30 她的私訊（S.phone）*/
    /* 以安約的那一頓：原本 6/16（五）19:00 自動演（AA_341 G7），AA_355 1-1 改成 6/9 她私訊約、6/10 出遊（S.dinnerPhone）*/
    {k:'g7_repair4',d:'2028-06-24',h:16,w:'jp',if:rep,ev:'ev_jp_repair_river'},
    {k:'g7_s',d:'2028-06-28',h:18.5,w:'jp',sum:'（期末報告的題目定了。你寫了三個版本的第一句。）'},
    {k:'g7_tanabata',d:'2028-07-07',h:19,w:'jp',ev:G=>dat(G)?'ev_jp_tanabata':'ev_jp_tanabata_repair'},   /* 七夕 19:00（AA_349 L5 確認）*/
    {k:'g8_sea',d:'2028-07-17',h:9,w:'jp',if:dat,ev:'ev_jp_sea'},   /* 海之日 09:00 出發、傍晚回來（AA_349 L5 確認）*/
    {k:'g8_f1',d:'2028-07-24',h:18.5,w:'jp',sum:'（日本語的期末考。聽力那一段，你聽懂了七成。）'},
    {k:'g8_f2',d:'2028-07-26',h:18.5,w:'jp',sum:'（日本法入門交報告。你在最後一頁寫了台灣的對照表。）'},
    {k:'g8_f3',d:'2028-07-28',h:18.5,w:'jp',sum:'（比較行政法的期末報告。你的題目是：協力，和義務。）'},
    {k:'g8_s',d:'2028-08-01',h:18.5,w:'jp',sum:'（你開始收行李。來的時候的那件外套，一次都沒穿過。）'},
    {k:'g8_konbini',d:'2028-08-04',h:22,w:'jp',ev:G=>dat(G)?'ev_jp_lastnight':'ev_jp_lastnight_alone'},   /* 挽回成功＝已經回到交往的，照交往版 */
    {k:'s_0812',d:'2028-08-12',h:18.5,w:'home',sum:G=>typeof HOLFF!=='undefined'&&HOLFF.y3sPath?HOLFF.y3sPath(G):null},
    {k:'s_0821',d:'2028-08-21',h:18.5,w:'home',sum:'（八月。時差調回來了。你把在日本的筆記和大四的課表放在一起，書桌一下子滿了。）'} ];
    /* 8/5～9/3 照台灣暑假的摘要日（AA_340 6-3 的 8/12；2026-10-21 AA_345 H3 換句：8/5 晚上 1A-08 選好了 Y4_PATH＝第一句，還沒決定＝第二句）。
       兩句只寫在 holff3d.js 的 S.y3sPath（台灣路線的摘要日也用它；holff 那邊日本路線不排 8/12，不會兩次）。
       8/21（AA_349 L2）：日本路線沒有暑假三選一（裁定 10），8/21 只有這一句（AA_343 D5「依三選一分三句」日本路線作廢；r2y3b3d.js 的日本那一列拿掉）；9/3 的房間也沒有三選一的物件 */
  /* AA_326 大三後半在日本的事件（src/r2y3b3d.js：J1 便利商店、立衡、櫻花、主線 8 視訊、町公所、各人打來的視訊）都是出遊（OUT.plan）或有選項的訊息：快轉照出遊、要回的訊息停（不另外列）*/
  /* 開發分支已經有的（當地時間）：5/20 子晴的電話（台灣 21:00）、6/2 學姊的視訊（台灣 18:00）、4/28 哲 4（台灣 23:00）、4/29 冠軍賽直播（台灣 19:00）*/
  S.KNOWN=[ G=>lv('heroine_04','FAMILIAR')&&G.flags.ZQ_Q12_SEEN==null?T(DK('2028-05-20'),22):null, G=>G.flags.SIS_BDAY_Y3==='video_set'?T(DK('2028-06-02'),19):null,
    G=>lv('zhe','FRIEND')&&G.flags.ZHE4_ASKED==null?T(DK('2028-04-28'),24):null,
    G=>!G.flags.FINAL_STREAM_SEEN&&((P_()&&P_().inGroup(G,'noodle_team'))||G.flags.ZHE4_ASKED!=null)?T(DK('2028-04-29'),20):null ];
  S.STOPS=[];
  S.dueStop=function(G,where){ const R=S.rec(G), now=NOW(G);
    for(const s of S.SCH){ if(s.w!==where||R.done[s.k]!=null) continue; const d=DK(s.d); if(d==null) continue; const t=T(d,s.h); if(now<t||now>=T(d,26.5)) continue; if(s.if&&!s.if(G)) continue; return s; }
    return null; };
  S.playStop=async function(GM,s,where){ const G=GM.G, R=S.rec(G), A=A_(); R.done[s.k]=G.day;
    if(s.sum){ const line=typeof s.sum==='function'?s.sum(G):s.sum; GM.sceneBegin(); try{ if(A&&A.begin) A.begin({background:where==='jp'?S.bgNow(G):(typeof HOME!=='undefined'&&HOME.bgNow?HOME.bgNow():'dark')}); if(line) await GM.say(null,line); } finally{ GM.sceneEnd(); } return true; }
    const id=typeof s.ev==='function'?s.ev(G):s.ev, ev=evOf(id); if(ev&&typeof EVENTS!=='undefined') await EVENTS.run(ev); return true; };
  /* trigger:'jp' 的事件（其他事件包；location 'any' 或 'jp_hub'），和 auto 但地點寫 jp_hub 的 */
  S.jpEvent=G=>{ if(typeof STORY_EVENTS==='undefined'||typeof EVENTS==='undefined') return null; return STORY_EVENTS.find(e=>(e.trigger==='jp'||(e.trigger==='auto'&&e.location==='jp_hub'))&&(!e.jpPlace||e.jpPlace===S.place(G))&&EVENTS.check(e))||null; };
  /* ---------------- 挽回（AA_254 第 10 節）：REPAIR 一週最多 +1；7/7 REPAIR ≥ 3 重新交往 ---------------- */
  S.repairN=G=>{ const R=G&&G.flags&&G.flags.REPAIR; return R&&typeof R==='object'?(R.heroine_01|0):0; };
  S.repair=function(G){ if(typeof R2Y3B!=='undefined'&&R2Y3B.repairAdd){ R2Y3B.repairAdd(G,'heroine_01'); return S.repairN(G); }   /* 和 AA_326 町公所那一步（r2y3b3d.js）用同一個：G.flags.REPAIR＝{人物:n}、REPAIR_WK＝{人物:第幾週}（Math.floor(day/7)）*/
    const F=G.flags, R=F.REPAIR&&typeof F.REPAIR==='object'?F.REPAIR:(F.REPAIR={}), W=F.REPAIR_WK&&typeof F.REPAIR_WK==='object'?F.REPAIR_WK:(F.REPAIR_WK={}), wk=Math.floor(G.day/7);
    if(W.heroine_01!==wk){ W.heroine_01=wk; R.heroine_01=(R.heroine_01|0)+1; } return R.heroine_01|0; };
  /* 挽回中：交換生群組每週那一則（AA_349 L1，AA-C 2026-10-21 新寫；AA_254 第 10 節、BB_194 §8）：日本時間週日 20:00（臺灣 19:00），4/2～7/2 共 14 週，以安發在交換生群組，寫給大家用的事。
     第一個選項＝在群組回（REPAIR +1；一週最多 +1，和町公所、河堤合起來算：S.repair）；第二個每週都一樣「（私訊她）……我們可以談一下嗎？」＝私訊她，已讀、沒有回，不加。不回＝不加。
     交往中的玩家不收這一套（交往中走她的私訊）。[日期, 以安在群組, 祐廷回（群組）, 之後（沒有＝null；from 沒寫＝群組裡的旁白）] */
  S.GRP=[
    ['2028-04-02','國際學生辦公室週三下午不開。要交表的，請上午去。','收到。週三上午去。',null],
    ['2028-04-09','公寓的垃圾分六種。分類表我拍了，在相簿。','謝謝。寶特瓶的蓋子要拆嗎？',{from:'heroine_01',text:'要。蓋子是另一類。'}],
    ['2028-04-16','學校附近的超市，晚上八點以後便當打折。','八點半去，只剩一個。',{text:'（群組裡有人回了一個笑臉。）'}],
    ['2028-04-23','日文課的作業，第三課的動詞表有一個印錯。第 12 行。','我也發現了。還以為是我抄錯。',{from:'heroine_01',text:'不是你。是講義。'}],
    ['2028-04-30','黃金週圖書館只開到下午三點。','好。那我早上去。',null],
    ['2028-05-07','町公所的窗口週六也開，只到中午。','好。週六中午以前。',null],   /* 接 5 月的町公所（第 3 步）*/
    ['2028-05-14','比較行政法的報告，我排在第六週。要換的人跟我說。','我第十週，不用換。',null],
    ['2028-05-21','投幣洗衣機三號壞了。不要投錢。','……我昨天投了。',{from:'heroine_01',text:'退幣口用力按一下。'}],
    ['2028-05-28','下週開始梅雨。傘不要放在宿舍門口，會被拿走。','收到。傘帶進房間。',null],
    ['2028-06-04','圖書館三樓有插座的位子只有八個。早上九點以前去。','明天去試試。',null],
    ['2028-06-11','期末考的時間表出來了，在學校網站的第二頁。','找到了。謝謝。',null],
    ['2028-06-18','宿舍門口要立竹子了。七夕那天，一個人可以掛一張短冊。','好。我會寫。',null],   /* 接 7/7 的竹子（第 5 步）*/
    ['2028-06-25','回國的機票，學校的旅行社有團體價。截止日是七月十號。','謝謝。我去問。',null],
    ['2028-07-02','七號晚上，宿舍門口有七夕的活動。','我會去。',null] ];   /* 接 7/7 的竹子（第 5 步）*/
  S.GRP_DM='（私訊她）……我們可以談一下嗎？';
  S.grpTag=i=>'jp_grp_'+(i+1);
  S.grpPhone=function(G){ const P=P_(); if(!P||!S.inJapan(G)||!rep(G)||!P.inGroup(G,'jp_exchange')) return; const R=S.rec(G), F=G.flags, gr=R.grp||(R.grp={});
    S.GRP.forEach(([k,post,reply,after],i)=>{ const d=DK(k), tag=S.grpTag(i); if(d==null) return;
      if(NOW(G)>=T(d,20)&&NOW(G)<T(d+7,20)&&!P.sent(G,tag)){ const th='g:jp_exchange';
        P.at(G,d,20,[{th,from:'heroine_01',text:post,ask:{id:tag,opts:[{t:reply,say:after?[Object.assign({th},after)]:[],set:{['JP_GRP_'+(i+1)]:'group'}},
          {t:S.GRP_DM,post:false,say:[{th:'p:heroine_01',from:'player',who:null,text:'……我們可以談一下嗎？'}],set:{['JP_GRP_'+(i+1)]:'dm'}}]}}],tag); }
      if(F['JP_GRP_'+(i+1)]==='group'&&gr[i+1]==null){ gr[i+1]=G.day; S.repair(G); } }); };   /* 在群組回了＝REPAIR +1（回的那一週算；一週最多 +1）*/
  /* 挽回中：早上在便利商店（AA_349 L3，新寫；AA_253 §5 第 2 步：剛到的那幾週她只在群組說話，早上會在便利商店遇到，點頭）：4 月平日 07:30～08:00、宿舍附近的便利商店，一週最多一次，共三次；不加 REPAIR。
     據點的選單之前演（醒來在那個時間＝去便利商店買早餐的路上遇到；有 9:00 的課那天 08:00 醒）*/
  S.NOD=['（宿舍附近的便利商店。以安在飯糰架前面。她看到你，點了一下頭，拿了一個鮭魚的就去結帳。）','（便利商店。她在排隊，手上一瓶麥茶。你們中間隔了一個人。她點了一下頭。）','（便利商店門口。她要出去，你要進來。她側身讓你，點了一下頭。）'];
  const monOf=d=>d-((wdOf(d)+6)%7);   /* 那一週的週一（一週＝週一到週日）*/
  S.nodDue=function(G){ if(!S.inJapan(G)||!rep(G)||typeof CALENDAR==='undefined') return false; const R=S.rec(G), L=Array.isArray(R.nod)?R.nod:[], wd=wdOf(G.day), h=G.hour;
    if(L.length>=S.NOD.length||CALENDAR.dateOf(G.day).m!==4||wd<1||wd>5||S.holiday(G.day)||h<7.5-1e-6||h>8+1e-6) return false;
    return !L.some(d=>monOf(d)===monOf(G.day)); };
  S.nod=async function(GM){ const G=GM.G, R=S.rec(G), A=A_(); if(!S.nodDue(G)) return false; const L=Array.isArray(R.nod)?R.nod:(R.nod=[]); const line=S.NOD[L.length]; L.push(G.day);
    R.place='konbini'; try{ if(A&&A.setBg) A.setBg('dark'); if(GM.caption) GM.caption('',S.PLACES.konbini.label,2400); if(GM.sleep) await GM.sleep(700); await GM.say(null,line); GM.advance(0.25); }
    finally{ R.place='room'; if(A&&A.active&&A.setBg) A.setBg(S.bgNow(G)); } return true; };
  S.resume=function(G){ const id='heroine_01', F=G.flags; if(dat(G)) return true; if(typeof ROM==='undefined'||!ROM.get){ F['dating_'+id]=true; return true; }
    const R=ROM.get(G,id); if(R.status!=='paused'&&ROM.start(G,id)) return true;   /* 等你說清楚（paused）、或還沒收拾（CLEANUP_DONE false）：直接回到交往 */
    const when=ROM.when?ROM.when(G):null; F['dating_'+id]=true; R.status='dating'; R.since=when; R.sinceDay=G.day; (R.history||(R.history=[])).push({ev:'start',at:when,how:'jp_tanabata'}); if(ROM.rec) ROM.rec(G).push({id,from:when,to:null,how:null}); return true; };
  /* ---------------- 以安在日本（J-S4、G9）---------------- */
  S.anWhere=function(G){ const h=G.hour%24, wd=G.weekday, we=wd===0||wd===6;
    if(!we&&!S.holiday(G.day)&&h>=9&&h<16) return '學校';
    if(dat(G)&&(wd===2||wd===4)&&h>=18&&h<22) return '宿舍（你那邊）';   /* 週二、四 18:00～22:00 在祐廷宿舍的共用廚房：只給交往中（AA_349 L5、AA_341 J-S4）；挽回中她不來祐廷的宿舍（大廳查字典那一場是她自己來交表、剛好遇到，r2y3b3d.js）*/
    if(we&&h>=13&&h<17) return '河邊';   /* 週末下午 13:00～17:00 河邊（AA_349 L5：照舊）*/
    return '她的房間'; };
  S.anAt=G=>{ const w=S.anWhere(G); return w==='宿舍（你那邊）'?'kitchen':(w==='河邊'?'river':null); };
  S.G9=['學校。剛下課。','房間。日文作業，第三頁。','河邊。今天風很大，書一直被翻過去。','投幣洗衣機前面。還有十二分鐘。'];   /* 問「在哪？」的回覆（輪流；挽回中只回前兩句）*/
  /* ---------------- 手機（STORY.PHONE_RULES）：以安的私訊（G0、G3、G4、G6、G8）、旗標 ---------------- */
  /* F.abroad（J-S14：麵店團阿哲的「麵店 我揪了」看這個，原本從來沒有設）＝STORY.abroad；AN_JP_DEPARTED（J-S17：階梯的 skipIf 讀這個）＝以安 3/25 出發了（所有路線）*/
  S.flagSync=function(G){ const F=G.flags; if(!F) return; const ab=!!(STORY.abroad&&STORY.abroad(G)); if(!!F.abroad!==ab) F.abroad=ab;
    const dep=D('dep'); if(dep!=null&&G.day>=dep&&F.AN_JP_DEPARTED==null) F.AN_JP_DEPARTED=F.JP_DEPARTED!=null?F.JP_DEPARTED:dep; };
  /* 2/20 那天沒有回宿舍、退宿那一場沒演到的（舊存檔）：2/21 以後直接記（不演），之後照住家裡 */
  S.x1Late=function(G){ const F=G.flags; if(!isJP(G)||F.X1_JP!=null||F.JP_DEPARTED!=null) return; const o=D('out'); if(o!=null&&G.day>o){ F.X1_JP=G.day; F.X1_JP_LATE=true; } };
  S.phone=function(G,GM){ if(!law(G)||!G.flags) return; S.flagSync(G); S.x1Late(G); const P=P_(); if(!isJP(G)||!P) return;
    const A=t=>({th:'p:heroine_01',from:'heroine_01',text:t});
    const dm=(key,h,lines,tag,ok)=>{ const d=DK(key); if(!ok||d==null||G.day<d||G.day>d+1||NOW(G)<T(d,h)) return false; return P.at(G,d,G.day===d?Math.max(h,G.hour):h,lines.map(A),tag); };
    const jp=S.inJapan(G), d=dat(G);
    dm('2028-03-10',21,['行李箱，明天一起去買？……我的輪子壞了一個。'],'jp_g0_bag_ask',d&&!S.departed(G));
    { const d11=DK('2028-03-11'); if(P.sent(G,'jp_g0_bag_ask')&&typeof OUT!=='undefined'&&!OUT.get(G,'jp_g0_bag')&&d11!=null&&NOW(G)<T(d11,14.75)&&!S.departed(G))
        OUT.plan(G,{id:'jp_g0_bag',ev:'ev_jp_suitcase',day:d11,h:14,late:0.75,place:'公館',title:'行李箱的店',travelH:0.5}); }   /* G0：3/11（六）14:00 公館（出遊）*/
    dm('2028-04-19',17,['今天去你那邊的廚房。我買了菜。'],'jp_g3_kitchen_ask',d&&jp);
    dm('2028-05-02',21,['黃金週，哪裡都是人。……明天去河邊就好。'],'jp_g4_river_ask',d&&jp);
    dm('2028-06-07',21.5,['梅雨開始了。','投幣洗衣機前面排了四個人。……我在讀行政法。'],'jp_g6_rain',d&&jp);
    dm('2028-07-16',21,['明天海之日。……我想看海。電車一個小時。'],'jp_g8_sea_ask',d&&jp);
    S.dinnerPhone(G,P);   /* AA_355 1-1：6/9 以安約的那一頓 */
    S.grpPhone(G); };   /* 挽回中：交換生群組每週那一則（AA_349 L1）*/
  /* 以安約的那一頓（AA_355 1-1，AA-C 2026-10-21；台詞照抄，三句在 data/jp_events.js 的 ev_jp_dinner＝AA_250 6-2）：
     6/9（五）21:00（日本時間：人在日本時遊戲的時鐘就是日本時間）她私訊兩則，交往中或和她 FRIEND 以上；「好。」＝6/10（六）18:30 出遊（地點字幕「日本・學校後面的小餐館」、深色底）；
     「那天不行。」＝她回「好。」，不補（6/16 也不演）。不算學期末的飯（AA_250 6-2：不佔名額、沒有告白）。回覆期限 6/10 18:00；AN_JP_DINNER_ASK＝'yes'／'no'。
     AA_355 第 5 節（AA-C 2026-10-21 2f1aaa22）：4c 挽回中、冷靜中的不約（她在冷靜的時候不會先約兩個人吃飯、訂同一班飛機）——交往過、分開了（ROM 的 ex）、對質後「等你說清楚」（paused）、
     被發現後退回朋友（friend_after_catch）都不約；交往中、沒交往過的 FRIEND 以上照舊。1-1 走路約 10 分鐘（字幕「走路約 10 分鐘」）*/
  S.DINNER_ASK=['週六晚上有空嗎。','學校後面那家小餐館，六點半。我訂了兩個人。'];
  const strained=G=>{ const R=(G.flags&&G.flags.romance&&G.flags.romance.heroine_01)||null; return !dat(G)&&!!R&&['ex','paused','friend_after_catch'].includes(R.status); };   /* 挽回中、冷靜中（和以安）*/
  S.dinnerPhone=function(G,P){ const d9=DK('2028-06-09'), d10=DK('2028-06-10'), F=G.flags; if(!P||d9==null||d10==null||!S.inJapan(G)) return;
    if(G.day>=d9&&G.day<=d9+1&&NOW(G)>=T(d9,21)&&NOW(G)<T(d10,18)&&!P.sent(G,'jp_g7_dinner_ask')&&(dat(G)||(lv('heroine_01','FRIEND')&&!strained(G)))){
      const L=S.DINNER_ASK.map(t=>({th:'p:heroine_01',from:'heroine_01',text:t}));
      L[L.length-1].ask={id:'jp_g7_dinner_ask',until:T(d10,18),opts:[{t:'好。',set:{AN_JP_DINNER_ASK:'yes'}},{t:'那天不行。',set:{AN_JP_DINNER_ASK:'no'},say:[{from:'heroine_01',text:'好。'}]}]};
      P.at(G,d9,G.day===d9?Math.max(21,G.hour):21,L,'jp_g7_dinner_ask'); }
    if(F.AN_JP_DINNER_ASK==='yes'&&typeof OUT!=='undefined'&&!OUT.get(G,'jp_g7_dinner')&&NOW(G)<T(d10,19))
      OUT.plan(G,{id:'jp_g7_dinner',ev:'ev_jp_dinner',day:d10,h:18.5,late:0.5,place:'日本・學校後面的小餐館',title:'和以安：學校後面的小餐館（日本 18:30）',travel:'走路約 10 分鐘',travelH:1/6}); };
  /* ---------------- 快轉、睡覺（J-S3）---------------- */
  S.homeFfEnd=G=>S.returned(G)?T(D('room'),8.5):T(D('dep'),8);   /* 出發前：到 3/25 早上（出發）；回來以後：到 9/3 早上（搬進 409）*/
  S.t1Stops=function(G){ const out=[]; if(typeof Y34B==='undefined'||!Y34B.t1On||!Y34B.t1On(G)) return out; const a=DK('2028-02-24'), dep=D('dep'); if(a==null||dep==null) return out;
    for(let d=a;d<dep;d+=7) out.push(T(d,(d===a?16.75:17)-0.5)); return out; };   /* 語彤的週四（裁定 4）：出門到麵店門口要 30 分鐘 */
  S.nextStop=function(G,now,where){ let best=null; const c=x=>{ if(x!=null&&x>now+1e-6&&(best==null||x<best)) best=x; }; const R=S.rec(G);
    for(const s of S.SCH){ if(s.w!==where||R.done[s.k]!=null||(s.if&&!s.if(G))) continue; const d=DK(s.d); if(d!=null) c(T(d,s.h)); }
    if(where==='jp'){ for(const f of S.KNOWN){ try{ c(f(G)); }catch(e){ console.warn('JP.KNOWN',e); } }
      c(T(D('term0'),8)); c(T(D('g5'),12));   /* 特別的課：4/10 第一堂、5/18 比較行政法 */
      c(T(D('ret'),8)); }
    else { for(const x of S.t1Stops(G)) c(x); if(!S.departed(G)) c(T(D('dep'),8));
      if(S.returned(G)&&STORY.y4PathAt&&!(G.flags&&G.flags.Y4_PATH)){ const a=STORY.y4PathAt(G); if(a) c(T(a.day,a.h)); } }   /* 8/5 晚上 1A-08 */
    if(typeof OUT!=='undefined'&&OUT.rec) for(const q of OUT.rec(G)) if(q.state==='planned') c(Math.max(T(q.day,q.h)-OUT.trip(G,q,where==='home').travelH-0.25,q.ask!=null?q.ask:-1e9));
    if(where==='home'&&Array.isArray(G.invites)) for(const iv of G.invites) if(iv.state==='accepted') c(T(iv.day,iv.h)-1);
    for(const f of S.STOPS){ try{ const x=f(G,now,where); if(x!=null) for(const v of [].concat(x)) c(v); }catch(e){ console.warn('JP.STOPS',e); } }
    if(STORY.lawWakeAt){ let w=null; try{ w=STORY.lawWakeAt(G); }catch(e){ w=null; } if(w!=null) c(T(G.day,w)); }   /* 事件包登記的「睡著也會醒來」（STORY.WAKE_AT）＝快轉也停（AA_340 H1，同 holff3d.js）*/
    return best; };
  S.returnDue=G=>S.inJapan(G)&&D('ret')!=null&&NOW(G)>=T(D('ret'),8);
  /* 快轉途中新出現的要回的訊息（手機有選項的 ask、當面約的邀請 offered）：玩家選的快轉才停（睡覺不停）；同 home3d.js 的 S.waitSnap／waitNew（AA_340 6-1 H2）*/
  S.waitSnap=G=>{ const P=P_(); return {asks:new Set(P&&P.pending?P.pending(G):[]),inv:new Set((G.invites||[]).filter(iv=>iv.state==='offered').map(iv=>iv.id))}; };
  S.waitNew=(G,w)=>{ const P=P_(); if(P&&P.pending&&P.pending(G).some(m=>!w.asks.has(m))) return true; return (G.invites||[]).some(iv=>iv.state==='offered'&&!w.inv.has(iv.id)); };
  /* 現在該停嗎：'msg'＝新的要回的訊息（w＝跳之前的快照；沒有 w＝不看）、'stop'＝其他該演、該出發的；null＝不用停 */
  S.stopNow=function(G,where,w){ if(S.dueStop(G,where)) return 'stop'; if(w&&S.waitNew(G,w)) return 'msg';
    if(typeof OUT!=='undefined'&&OUT.due&&OUT.due(G)) return 'stop';
    if(where==='jp'){ if(S.returnDue(G)||S.classSpecialNow(G)||S.jpEvent(G)) return 'stop'; }
    else if(typeof HOME!=='undefined'){ if(HOME.dueInvites&&HOME.dueInvites(G).length) return 'stop'; const be=HOME.breakEvent||HOME.homeEvent; if(be&&be(G)) return 'stop'; if(STORY.y4HomeDue&&STORY.y4HomeDue(G)) return 'stop'; }
    return null; };
  const setTime=(G,E,tt)=>{ const d=Math.floor(tt/24+1e-9); if(d>G.day){ G.day=d; G.weekday=wdOf(d); if(G.flags) G.flags.companion=null; G.weather=Math.random()<0.7?'clear':'cloudy'; } G.hour=tt-d*24; if(E) E.hour=G.hour; };   /* 同 home3d.js 的快轉 */
  /* 跳到 t（where＝'jp'：日本的據點；'home'：臺北的家）：每 15 分鐘看要不要停；整點跑手機規則、生活費。
     X58（使用者 10-18 15:4x「跳過途中收到訊息就跳出來、按了繼續跳；不要跳完才說「收到 N 則」」）：途中收到任何一則別人傳的訊息（不用回的也算）就停在那一刻（回傳 'msg'）——
     呼叫的人打開手機（S.ffPhone，「跳過」）、關掉以後接著跳（S.ff 快轉、S.sleep 睡覺）；跳完不再說「收到 N 則」（同 home3d.js 的 breakJump、經濟系 y0Jump）*/
  const recvN=out=>(out||[]).filter(m=>m&&m.from!=='player').length;   /* 這一批裡別人傳的（祐廷自己那一句不算「收到」；同 HOME.recvN）*/
  S.FF_MAX=200;   /* 一次快轉、睡覺最多停幾次（每一次都要玩家按「跳過」；只是防呆）*/
  S.jump=async function(GM,t,where,o){ o=o||{}; const G=GM.G, E=GM.E, P=P_(); await GM.fade(true); let n=0, mo=null, why=null, tt=NOW(G); const t0=tt, d0=G.day, w0=o.ff?S.waitSnap(G):null;   /* o.ff：玩家選的快轉（要回的訊息也停）*/
    { const nx=S.nextStop(G,tt,where); if(nx!=null&&nx<t) t=nx; }
    while(tt+0.25<=t+1e-6){ tt=Math.round((tt+0.25)*4)/4; setTime(G,E,tt); let got=0;
      if(Math.abs(tt-Math.round(tt))<1e-6){ if(STORY.monthlyFunds){ const f=STORY.monthlyFunds(G); if(f){ if(GM.money) GM.money(f.amount); mo=typeof STORY!=='undefined'&&STORY.fundsJoin?STORY.fundsJoin(mo,f):f; } }
        if(P){ try{ if(STORY.phoneRules) STORY.phoneRules(GM); P.tick(G,out=>{ n+=out.length; got+=recvN(out); }); }catch(e){ console.warn('JP.jump phone',e); } } }
      { const s=S.stopNow(G,where,w0); if(s){ why=s; break; } }
      if(got&&GM.phoneThread){ why='msg'; break; }   /* X58：不用回的訊息也停（該演的、該出發的照上面先算）。停下來是為了打開手機：沒有手機畫面（GM.phoneThread）就不停 */
      const nx=S.nextStop(G,tt,where); if(nx!=null&&nx<t) t=nx; }
    if(!why&&NOW(G)<t-1e-6) setTime(G,E,t);
    if(E&&E.setWeather) E.setWeather(G.weather); if(GM.updateHUD) GM.updateHUD();
    const brief=G.day===d0&&NOW(G)-t0<1; if(GM.titleCard&&!brief) await GM.titleCard(dateLabel(NOW(G)),where==='jp'?'宿舍':'臺北的家',2200);   /* J-S3：日期卡寫「宿舍」*/
    const A=A_(); if(A&&A.begin) A.begin({background:where==='jp'?S.bgNow(G):(typeof HOME!=='undefined'&&HOME.bgNow?HOME.bgNow():'dark')}); await GM.fade(false);
    if(mo&&GM.toast) GM.toast(mo.text,3800); /* 收到 N 則：改成途中一則一則停下來看（上面 why＝'msg'），跳完不再統計（X58）*/ if(n&&GM.phoneBadge) GM.phoneBadge(); if(GM.autosave) GM.autosave(); return why||'end'; };
  /* 玩家選的快轉：停在要回的訊息＝打開手機（「跳過」關掉），關掉以後接著跳到原本選的日子（同 home3d.js 的 S.ffMenu；AA_340 6-1 H2、D103）；X58 起不用回的也停 */
  S.ff=async function(GM,to,where){ const G=GM.G; for(let k=0;k<S.FF_MAX;k++){ const why=await S.jump(GM,to,where,{ff:true}); if(why!=='msg'||!(await S.ffPhone(GM,where))||!S.ffGoOn(G,to,where)) break; } return true; };
  S.ffGoOn=(G,to,where)=>NOW(G)<to-1e-6&&(where==='jp'?S.inJapan(G):S.homeOn(G))&&!S.stopNow(G,where,null);
  const askKey=x=>x.id||x.key||x.text;
  S.askSeen=function(G,L){ const F=G.flags||(G.flags={}), seen=F._autoAsk||(F._autoAsk=[]); for(const x of L){ const k=askKey(x); if(!seen.includes(k)) seen.push(k); } if(seen.length>200) seen.splice(0,seen.length-200); };   /* 同 home3d.js 的 S.askSeen（同一張 G.flags._autoAsk）*/
  S.bgBack=function(GM,where){ const A=A_(), G=GM.G; if(!A||!A.begin) return; if(where==='jp'){ if(S.inJapan(G)) A.begin({background:S.bgNow(G)}); } else if(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G)) A.begin({background:HOME.bgNow?HOME.bgNow():'dark'}); };
  S.ffPhone=async function(GM,where){ const G=GM.G, P=P_(); if(!P||!P.pending||!GM.phoneThread) return false; const L=P.pending(G), m=L[L.length-1]; S.askSeen(G,L); const A=A_(); if(A&&A.end) A.end();
    try{ await GM.phoneThread(m&&P.th?P.th(m):null,{skip:true}); } finally{ S.bgBack(GM,where); } return true; };
  /* 選單之前：有沒開過的要回的訊息（睡著、上課、出遊時收到的）＝打開手機的對話列表（同 home3d.js 的 S.askAuto）*/
  S.askAuto=async function(GM,where){ const G=GM.G, P=P_(); if(!P||!P.pending||!GM.phoneThread) return false; const seen=(G.flags&&G.flags._autoAsk)||[], L=P.pending(G); if(!L.some(x=>!seen.includes(askKey(x)))) return false; S.askSeen(G,L);
    const A=A_(); if(A&&A.end) A.end(); try{ await GM.phoneThread(null); } finally{ S.bgBack(GM,where); } return true; };
  S.ffOpts=function(G,where){ const now=NOW(G), end=where==='jp'?T(D('ret'),8):S.homeFfEnd(G); if(end==null||end<=now+0.5) return null;
    const nx=S.nextStop(G,now,where), to=nx!=null&&nx<end?nx:end, d3=Math.min(T(G.day+3,8.5),end), d7=Math.min(T(G.day+7,8.5),end);
    return [{t:'到下一個有事的日子',hint:(nx!=null&&nx<end?'跳到 ':'沒有排定的事：到 ')+dateLabel(to),to},{t:'過三天',hint:'到 '+dateLabel(d3)+'（中間有事會先停）',to:d3},{t:'過一週',hint:'到 '+dateLabel(d7)+'（中間有事會先停）',to:d7},{t:'不用了',to:null}]; };   /* 同 home3d.js 的快轉選單 */
  S.wakeH=function(G,day){ if(day===D('ret')) return 8; const it=S.firstClass(G,day); return it?Math.max(6.5,it.t0-1):8.5; };   /* 有課＝第一堂前 1 小時 */
  S.sleep=async function(GM){ const G=GM.G, early=G.hour<5, nd=early?G.day:G.day+1; let to=T(nd,S.wakeH(G,nd));   /* early：快轉過半夜（setTime 換日、G.hour 0.x）以後才睡＝醒來是同一天（原本一律 G.day+1，多睡一整天；BUG-JP-SLEEP-MIDNIGHT-1022）*/ const lw=STORY.lawWakeAt?STORY.lawWakeAt(G):null; if(lw!=null&&T(G.day,lw)>NOW(G)) to=Math.min(to,T(G.day,lw));   /* 事件包的「睡著也會醒來」（STORY.WAKE_AT）*/
    if(G.hour>=25||(early&&G.hour>=1)) (G.daily||(G.daily={})).lateNight=nd;
    for(let k=0;k<S.FF_MAX;k++){ const why=await S.jump(GM,to,'jp'); if(why!=='msg'||!(await S.ffPhone(GM,'jp'))||!S.ffGoOn(G,to,'jp')) break; }   /* X58：睡著的途中收到訊息也停、打開手機，「跳過」接著睡到原本醒來的時間 */
    return true; };
  S.confirmMiss=async function(GM,toH){ const M=typeof HOME!=='undefined'&&HOME.wouldMiss?HOME.wouldMiss(GM.G,toH):[]; if(!M.length) return true; await GM.say(null,'會錯過：'+M.join('、')+'。'); return (await GM.choose([{t:'照樣'},{t:'先不要'}]))===0; };   /* 同 home3d.js */
  /* ---------------- 據點的選單（J-S5）---------------- */
  S.callLike=q=>!!q&&(q.verb==='接起來'||q.place==='視訊'||!!q.call);
  S.visit=async function(GM,p){ const G=GM.G, R=S.rec(G), L=S.PLACES[p]||S.PLACES.room, A=A_(); R.place=p;
    try{ if(A&&A.setBg&&typeof OUT!=='undefined') A.setBg(L.bg?OUT.bg(L.bg):'dark'); if(A&&A.show&&S.anAt(G)===p&&met('heroine_01')) A.show('right','heroine_01','neutral');   /* 以安的作息（J-S4）：週二、四晚上在共用廚房（交往中）、週末下午在河邊 */
      if(GM.caption) GM.caption('',L.label,2400); if(GM.sleep) await GM.sleep(900);
      const ev=S.jpEvent(G); if(ev&&typeof EVENTS!=='undefined'){ await EVENTS.run(ev); S.adv(G); }
      else if(p==='kitchen'&&rep(G)) await GM.say(null,'（流理台上有人留了一張紙條：鍋子用完請洗。是中文寫的。）');   /* G3 挽回中：共用廚房的「看」*/
      else if(p==='river'&&typeof JPB!=='undefined'&&JPB.riverLine){ const t=JPB.riverLine(G); if(t) await GM.say(null,t); }   /* AA_435 2-3：交往中週末下午她在河邊（src/jp_blank3d.js）*/
      GM.advance(0.5); }
    finally{ R.place='room'; if(A&&A.active){ if(A.hide) A.hide('right'); if(A.setBg) A.setBg(S.bgNow(G)); } }
    return true; };
  S.phoneTick=function(GM){ const G=GM.G, P=P_(); if(!P) return; try{ if(STORY.phoneRules) STORY.phoneRules(GM); P.tick(G,out=>{ if(out.length&&GM.toast) GM.toast('手機｜'+P.notice(G,out[0]),3800); if(GM.phoneBadge) GM.phoneBadge(); }); }catch(e){ console.warn('JP phone',e); } };
  const REST_UNTIL=()=>typeof HOME!=='undefined'&&HOME.REST_UNTIL?HOME.REST_UNTIL:26.5;   /* 凌晨 2:30（home3d.js S.REST_UNTIL）*/
  S.round=async function(GM){ const G=GM.G, O=[], A=A_();
    const q=typeof OUT!=='undefined'&&OUT.due?OUT.due(G):null;
    if(q) O.push({t:(q.verb||'出發')+'：'+q.title,hint:(q.place||'')+'　'+hm(q.h)+(q.travel?'　'+q.travel:''),k:'out',q});
    const c=S.classNow(G); if(c) O.push({t:'去上課：'+c.c.name,hint:hm(c.t0)+'　交換學校',k:'class',c});
    O.push({t:'共用廚房',k:'place',p:'kitchen'},{t:'便利商店',k:'place',p:'konbini'},{t:'河邊',k:'place',p:'river'});
    O.push({t:'看手機',hint:'和朋友聯絡',k:'phone'}); if(S.hasRoom3d()) O.push({t:'在房間休息一下',hint:'走進你的房間',k:'room3d'}); else if(G.hour<REST_UNTIL()) O.push({t:'在房間休息一下',hint:'一小時',k:'rest'});   /* 凌晨 2:30 以後不出一小時的休息（BUG-HOME-REST-NOCAP-1027）*/
    const ff=S.ffOpts(G,'jp'); if(ff) O.push({t:'快轉',hint:'到下一個有事的日子、過三天、過一週',k:'ff'});
    O.push({t:'存檔',hint:'存到存檔欄位',k:'save'},{t:'睡覺',hint:'明天 '+hm(S.wakeH(G,G.day+1))+' 醒來',k:'sleep'});
    const o=O[await GM.choose(O,{menu:true})]||O[O.length-1];
    if(o.k==='out') return S.goOut(GM,o.q,false);
    if(o.k==='class'){ await S.attend(GM,o.c); return true; }
    if(o.k==='place'){ await S.visit(GM,o.p); return true; }
    if(o.k==='phone'){ if(GM.phoneThread){ if(A&&A.end) A.end(); await GM.phoneThread(null); S.adv(G); } return true; }
    if(o.k==='rest'){ if(await S.confirmMiss(GM,G.hour+1)) GM.advance(1); return true; }
    if(o.k==='room3d'){ S.rec(G).place='room'; return 'room'; }   /* 走進 3D 的房間：讓出選單（S.loop 收尾以後 GM.enter）*/
    if(o.k==='ff'){ const f=ff[await GM.choose(ff.map(x=>({t:x.t,hint:x.hint})),{menu:true})]; if(f&&f.to!=null&&f.to>NOW(G)) await S.ff(GM,f.to,'jp'); return true; }
    if(o.k==='save'){ if(GM.saveMenu) await GM.saveMenu(); return true; }
    if(await S.confirmMiss(GM,24+S.wakeH(G,G.day+1))) await S.sleep(GM); return true; };
  /* 出發（出遊、視訊）：演完回到據點。must＝一定要去的（例：AA_326 J1 便利商店）只有「出發」一個選項（同 outings3d.js 的 S.prompt）*/
  S.goOut=async function(GM,q,must){ const G=GM.G, A=A_(); if(must) await GM.choose([{t:(q.verb||'出發')+'：'+q.title,hint:(q.place||'')+'　'+hm(q.h)+(q.travel?'　'+q.travel:'')}]);
    if(q.back==null) q.back='回到宿舍。'; if(A&&A.end) A.end(); await OUT.go(GM,q); S.adv(G); return true; };
  /* 其他事件包（STORY.TICKS）：據點每一輪跑一次；回傳 true＝開演了 */
  S.othersTick=function(GM){ for(const f of (STORY.TICKS||[])){ let r=false; try{ r=f(GM,0.5); }catch(e){ console.warn('JP TICKS',e); } if(r) return true; } return false; };
  let busy=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['jp3d:busy']=()=>{ busy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  S.loop=async function(GM){ const G=GM.G; if(busy) return; busy=true; let go=null; GM.sceneBegin();
    try{ S.adv(G);
      for(let guard=0;guard<40&&S.inJapan(G);guard++){
        S.phoneTick(GM);
        if(typeof OUT!=='undefined'&&OUT.expire) for(const q of OUT.expire(G)) if(OUT.onMissed) OUT.onMissed(GM,q);   /* 錯過的出遊（OUT.tick 在日本不跑）*/
        if(S.returnDue(G)){ go='ret'; break; }
        if(G.hour>=24+2.5){ await GM.say(null,'已經凌晨了。你撐不住，躺上床就睡著了。'); await S.sleep(GM); continue; }
        const st=S.dueStop(G,'jp'); if(st){ await S.playStop(GM,st,'jp'); S.adv(G); continue; }
        const ev=S.jpEvent(G); if(ev){ await EVENTS.run(ev); S.adv(G); continue; }
        if(await S.nod(GM)) continue;   /* 挽回中：4 月平日早上在便利商店點頭（AA_349 L3）*/
        if(S.othersTick(GM)){ go='yield'; break; }   /* 讓出畫面：那一段演完，下一次 JP.tick 接回選單 */
        { const q=typeof OUT!=='undefined'&&OUT.due?OUT.due(G):null; if(q&&q.must){ await S.goOut(GM,q,true); continue; } }
        if(await S.askAuto(GM,'jp')) continue;
        { const Rs=S.rec(G); if(Rs.pendingSleep){ delete Rs.pendingSleep; if(await S.confirmMiss(GM,24+S.wakeH(G,G.day+1))) await S.sleep(GM); continue; } }   /* 3D 房間的床：回到據點就睡 */
        if(await S.round(GM)==='room'){ go='room'; break; } } }
    catch(e){ console.warn('JP.loop',e); }
    finally{ busy=false; GM.sceneEnd(); }
    if(go==='ret') await S.returnHome(GM);
    if(go==='room'){ const A=A_(); if(A&&A.end) A.end(); if(GM.enter) await GM.enter('jp_room',Object.assign({},JP_DORM_LAYOUTS.jp_room.spawn)); } };
  S.leaveHome=G=>{ if(typeof HOME==='undefined'||!HOME.rec) return; const H=HOME.rec(G); H.at=false; H.wakeAsk=null; H.lbreak=null; H.bskip=null; H.stayMon=null; };
  S.toHub=async function(GM){ S.leaveHome(GM.G); if(GM.enter) await GM.enter('jp_hub',Object.assign({},S.SPAWN)); };
  /* 人在 3D 房間的時候，據點的迴圈（S.loop）不跑：必接的電話／視訊／出遊（OUT.due 的 must）、日本的停點、事件、回程、凌晨 2:30 到了＝先回據點，由據點照常問「接起來」、演出、睡覺
     （BB 10-22 12:5x：2028-05-29 日本 21:30 在房間待到 01:36，22:00 奕廷的電話一直沒響、FANG_F3 一直是 null）。正在對話、坐著做事的時候先不打斷 */
  S.roomDue=function(GM){ const G=GM.G, E=GM.E; if((E&&E.player&&E.player.busy)||(GM.D&&GM.D.active)||(typeof ADV!=='undefined'&&ADV.active)) return false;
    if(S.returnDue(G)||G.hour>=24+2.5) return true;
    if(typeof OUT!=='undefined'&&OUT.due){ const q=OUT.due(G); if(q&&q.must) return true; }
    return !!(S.dueStop(G,'jp')||S.jpEvent(G)); };
  /* story3d.js S.tick（事件包 TICKS 之後、在家判斷之前）：人在日本＝據點；回傳 true＝這一輪不再往下判斷 */
  S.tick=function(GM){ const G=GM.G; if(!S.inJapan(G)) return false;
    { const r=D('ret'); if(r!=null&&G.day>r+3){ G.flags.JP_RETURNED=G.day; G.flags.JP_RETURN_LATE=true; return false; } }   /* 舊存檔：早就過了回程（不補演）*/
    if(busy) return true;
    if(G.zone!=='jp_hub'){ if(S.room3d(G)){ if(!(GM.isEntering&&GM.isEntering())&&S.roomDue(GM)){ busy=true; S.toHub(GM).catch(e=>console.warn('JP.toHub',e)).finally(()=>{ busy=false; }); } return true; }   /* 3D 的「你的房間」（jp_dorm3d.js，使用者 10-21 13:0x「已經做的 3D 保留」）：自由走動，走出房門回據點；該接的電話、出遊、停點、事件到了也先回據點（S.roomDue）*/
      if(!(GM.isEntering&&GM.isEntering())){ busy=true; S.toHub(GM).catch(e=>console.warn('JP.toHub',e)).finally(()=>{ busy=false; }); } return true; }   /* 開發分支舊版出發以後還在臺灣的區域：先進據點 */
    S.loop(GM).catch(e=>{ console.warn('JP.loop',e); busy=false; }); return true; };
  /* ---------------- 出發以後（y34b3d.js S.departJP 演完）---------------- */
  /* 出發以後在臺灣的約：出遊（視訊、電話以外）不去了、當面約延後（不算爽約；AA_340 S9 同一個原則）。回來的那天也再跑一次（在日本那段時間答應的臺灣的約）*/
  S.cancelTW=function(G){ const dep=D('dep'), ret=D('ret'); if(dep==null||ret==null) return;
    if(typeof OUT!=='undefined'&&OUT.rec) for(const q of OUT.rec(G)) if(q.state==='planned'&&q.day>=dep&&q.day<ret&&!S.callLike(q)&&!/^jp_/.test(q.id||'')) q.state='missed';
    if(Array.isArray(G.invites)) for(const iv of G.invites) if(['accepted','going','offered','changed'].includes(iv.state)&&iv.day>=dep&&iv.day<ret) iv.state='postponed'; };
  S.arrive=async function(GM){ const G=GM.G, F=G.flags, R=S.rec(G); if(!S.inJapan(G)) return false; S.leaveHome(G); R.place='room'; R.arr=G.day; if(F.AN_JP_DEPARTED==null) F.AN_JP_DEPARTED=F.JP_DEPARTED;
    S.cancelTW(G); if(GM.enter) await GM.enter('jp_hub',Object.assign({},S.SPAWN)); if(GM.autosave) GM.autosave(); return true; };
  /* ---------------- 8/5 回程（J-S9）---------------- */
  const MOM={name:'媽媽'}, DAD={name:'爸爸'};
  S.momSay=async function(GM,x){ if(!x) return; const w=x.who==='爸爸'?DAD:MOM; if(/^（.*）$/.test(x.t)) await GM.say(null,x.t.replace(/^（/,'（'+w.name)); else await GM.say(w,x.t); };   /* 同 home3d.js（家人台詞照 AA_138）*/
  S.X2='你回來了。媽媽把你的房間打掃過，桌上多了一盒你小時候的模型。';   /* AA_144 X2（照抄）*/
  S.returnHome=async function(GM){ const G=GM.G, F=G.flags, R=S.rec(G), E=GM.E, r=D('ret'); if(!S.returnDue(G)) return false; const A=A_();
    GM.sceneBegin();
    try{ if(A&&A.active&&A.end) A.end(); await GM.fade(true); const x=CALENDAR.dateOf(G.day);
      if(GM.titleCard){ await GM.titleCard(x.m+' 月 '+x.d+' 日','回程｜關西的機場',2400); await GM.titleCard('飛回臺灣','關西　約 3 小時',2400); }
      if(G.day===r) G.hour=Math.max(13,G.hour+2); if(E) E.hour=G.hour;   /* 日本時間換回臺灣時間（−1）＋飛行約 3 小時（J-S13）*/
      F.JP_RETURNED=G.day; R.place=null; if(GM.updateHUD) GM.updateHUD();
      if(GM.titleCard) await GM.titleCard('抵達','桃園機場　'+hm(G.hour),2200); await GM.fade(false); }
    finally{ GM.sceneEnd(); }
    { const ev=evOf('ev_jp_return_hall'); if(ev&&typeof EVENTS!=='undefined') await EVENTS.run(ev); }   /* 入境大廳（AA_253 9-2）*/
    S.cancelTW(G);
    GM.sceneBegin();
    try{ await GM.fade(true); if(GM.titleCard) await GM.titleCard('回臺北的家','機場捷運＋捷運　約 1 小時',2400); GM.advance(1);
      if(typeof HOME!=='undefined'&&HOME.rec){ const H=HOME.rec(G); H.at=true; H.day=G.day; H.wakeAsk=null; if(A&&A.begin) A.begin({background:HOME.bgNow?HOME.bgNow():'dark'}); }
      await GM.fade(false); await GM.say(null,S.X2); if(typeof HOME!=='undefined'&&HOME.pick) await S.momSay(GM,HOME.pick(G,'arrive')); if(GM.memo) GM.memo('從日本回來'); if(GM.autosave) GM.autosave(); }
    finally{ GM.sceneEnd(); }
    return true; };   /* 之後 home3d.js 的 loop：當晚 20:00 1A-08「大四要怎麼過？」（STORY.y4HomeDue）、9/3 搬進 409 */
  /* ---------------- 住臺北的家（J-S11；home3d.js 的 loop 每一輪叫）---------------- */
  S.goList=function(G){ const L=typeof PLACES!=='undefined'&&PLACES.quickList?PLACES.quickList():[], V=G.visited||{}, K0=(typeof PLACES!=='undefined'&&PLACES.known0)||{};
    return ['公館商圈','阿鳳麵店','溫州街','兩點半 Café','校門口'].map(n=>L.find(p=>p[1]===n)).filter(p=>p&&(K0[p[0]]||V[p[0]])); };   /* 出門：照手機「地點」的名字；店要去過一次（D54 ①）*/
  S.homeRound=async function(GM){ const G=GM.G, H=HOME.rec(G), h=G.hour, A=A_(), bg=()=>HOME.bgNow?HOME.bgNow():'dark';
    const st=S.dueStop(G,'home'); if(st){ await S.playStop(GM,st,'home'); if(H.at&&A&&A.begin) A.begin({background:bg()}); return H.at; }   /* 摘要日（G0、8/12）*/
    { const ev=HOME.breakEvent?HOME.breakEvent(G):(HOME.homeEvent?HOME.homeEvent(G):null); if(ev&&typeof EVENTS!=='undefined'){ await EVENTS.run(ev); if(H.at&&A&&A.begin) A.begin({background:bg()}); return H.at; } }
    if(G.hour>=24+2.5){ if(await S.confirmMiss(GM,24+8.5)) await HOME.sleep(GM); return H.at; }
    if(await S.askAuto(GM,'home')) return H.at;   /* 沒開過的要回的訊息：先打開手機（D103）*/
    const O=[], q=HOME.dueOuting?HOME.dueOuting(G):null, ateToday=H.eat&&H.eat.day===G.day;
    if(q){ const tr=OUT.trip?OUT.trip(G,q,true):{travel:q.travel||''}; O.push({t:(q.verb||'出發')+'：'+q.title,hint:(S.callLike(q)?'':'從家裡出發　')+(q.place||'')+'　'+hm(q.h)+(tr.travel?'　'+tr.travel:''),k:'out',q}); }
    for(const iv of (HOME.dueInvites?HOME.dueInvites(G):[])){ const P=INV.place(iv.place)||{}; O.push({t:'出發：和'+(typeof SOCIAL!=='undefined'?SOCIAL.displayName(iv.who):iv.who)+'約在'+(P.name||''),hint:hm(iv.h)+'　捷運＋公車 約 30 分鐘',k:'inv',iv,P}); }
    if(!ateToday&&h>=18.5&&h<20) O.push({t:'吃晚餐',k:'eat'});
    if(h<22) O.push({t:'出門',hint:'公館、溫州街、台大　捷運＋公車 約 30 分鐘',k:'go'});
    O.push({t:'看手機',hint:'和朋友聯絡',k:'phone'});
    const ff=S.ffOpts(G,'home'); if(ff) O.push({t:'快轉',hint:'到下一個有事的日子、過三天、過一週',k:'ff'});
    O.push({t:'存檔',hint:'存到存檔欄位',k:'save'});
    if(!G.flags.carWithMe) O.push({t:'去玄關拿車鑰匙（取車）',k:'car'});
    if(G.hour<REST_UNTIL()) O.push({t:'在家休息一下',hint:'一小時',k:'rest'}); O.push({t:'睡覺',hint:'隔天早上在家醒來',k:'sleep'});   /* 同上 */
    const o=O[await GM.choose(O,{menu:true})]||O.find(x=>x.k==='sleep');
    if(o.k==='save'){ if(GM.saveMenu) await GM.saveMenu(); return H.at; }
    if(o.k==='out'){ const call=S.callLike(o.q); H.at=false; if(A&&A.end) A.end(); const ok=await OUT.go(GM,o.q,{fromHome:true});
      if(ok&&!o.q.goto){ if(!call){ await GM.fade(true); if(GM.titleCard) await GM.titleCard('回臺北的家','捷運＋公車 約 30 分鐘',2000); GM.advance(0.5); } H.at=true; H.day=G.day; if(A&&A.begin) A.begin({background:bg()}); if(!call) await GM.fade(false); return true; }   /* 同 home3d.js 的 breakRound */
      if(!ok&&!(typeof EXCH!=='undefined'&&EXCH.airPending&&EXCH.airPending(G))){ H.at=true; if(A&&A.begin) A.begin({background:bg()}); return true; }   /* 去了出境大廳等登機（E08，寒暑假出國）不算沒出門 */
      if(o.q.goto&&GM.toast) GM.toast('要回家：手機「地點」→ 回臺北的家（或走到校門口）。',5200); return false; }
    if(o.k==='inv'){ await HOME.leaveTo(GM,o.P); return false; }
    if(o.k==='go'){ const L=S.goList(G), k=await GM.choose(L.map(p=>({t:p[1]})).concat([{t:'不用了'}]),{menu:true}), p=L[k]; if(!p) return H.at; await HOME.leaveTo(GM,{name:p[1],zone:p[0],spawn:p[2]||undefined}); return false; }
    if(o.k==='phone'){ if(GM.phoneThread){ if(A&&A.end) A.end(); await GM.phoneThread(null); if(A&&A.begin) A.begin({background:bg()}); } return H.at; }
    if(o.k==='eat'){ if(await S.confirmMiss(GM,G.hour+1)) await HOME.dinner(GM); return H.at; }
    if(o.k==='ff'){ const f=ff[await GM.choose(ff.map(x=>({t:x.t,hint:x.hint})),{menu:true})]; if(f&&f.to!=null&&f.to>NOW(G)) await S.ff(GM,f.to,'home'); return H.at; }
    if(o.k==='car'){ if(HOME.takeCar) await HOME.takeCar(GM); return H.at; }
    if(o.k==='rest'){ if(await S.confirmMiss(GM,G.hour+1)) GM.advance(1); return H.at; }
    if(await S.confirmMiss(GM,24+8.5)) await HOME.sleep(GM); return H.at; };
  /* ---------------- 手機的「今天」「課表」（在日本：交換學校的課；J-S1 台灣的節日、課不顯示）---------------- */
  S.todayHTML=function(G){ const R=S.rec(G), x=CALENDAR.dateOf(G.day), its=S.classesOn(G,G.day);
    let h='<div class="item"><b>'+esc(x.m+'/'+x.d+'（'+'日一二三四五六'[wdOf(G.day)]+'）')+'</b>・交換學校<div class="muted">現在 '+hm(G.hour)+'（日本時間）</div></div>';
    if(!its.length) h+='<div class="item">今天沒有課</div>';
    for(const it of its){ const st=R.att[it.key]?'上過了':(G.hour>=it.t0+0.25?'沒去':(G.hour>=it.t0-1?'現在可以進教室':'還沒開始')); h+='<div class="item"><b>'+hm(it.t0)+'–'+hm(it.t1)+'</b> '+esc(it.c.name)+'<div class="muted">'+st+'</div></div>'; }
    return h; };
  S.weekHTML=function(G){ const R=S.rec(G), wk=STORY.routeWeek?STORY.routeWeek(G):null; let h='<div class="item"><b>交換學校的課</b>'+(wk?'・抵達後第 '+wk+' 週':'')+'</div>';
    for(const c of S.CLASSES) h+='<div class="item">'+esc(c.wds.map(w=>'週'+'日一二三四五六'[w]).join('、'))+'　'+hm(c.t0)+'　'+esc(c.name)+'<div class="muted">出席 '+(R.n[c.id]|0)+' 次'+(c.credit?'':'（不算學分）')+'</div></div>';
    return h; };
  /* ---------------- 成績單（J-S15）：日本路線的大三下＝日本的兩門（日本語不算學分）；出席照 CLS 的等第（10 次以上很好、5 次以上不錯）---------------- */
  S.report=G=>{ const R=S.rec(G), g={}; for(const c of S.CLASSES) if(c.credit) g[c.id]=typeof CLS!=='undefined'&&CLS.gradeOf?CLS.gradeOf(R.n[c.id]|0):''; return g; };
  S.showGrades=async function(GM,opts){ opts=opts||{}; const G=GM.G, C=CLS.rec(G); if(!C.grades.Y3S2) C.grades.Y3S2=S.report(G); const g=C.grades.Y3S2;
    const lines=S.CLASSES.filter(c=>c.credit).map(c=>c.name+'：'+(g[c.id]||CLS.gradeOf(0)));
    if(!opts.inScene) GM.sceneBegin(); try{ await GM.say(null,CLS.termName('Y3S2')+'的成績出來了。'); await GM.say(null,lines.join('　')); } finally{ if(!opts.inScene) GM.sceneEnd(); } return true; };
  /* ---------------- 包住別的系統（只在日本路線的條件成立時改結果）---------------- */
  if(typeof Y34B!=='undefined'&&Y34B.departJP){ const dep0=Y34B.departJP; Y34B.departJP=async function(GM){ const r=await dep0.apply(this,arguments); if(r) await S.arrive(GM); return r; }; }   /* J-S10：出發以後進日本的據點（E08 起 3D 出境大廳要先登機：這裡還沒出發＝S.arrive 不做事，登機以後在下面 departFly）*/
  if(typeof Y34B!=='undefined'&&Y34B.departFly){ const fly0=Y34B.departFly; Y34B.departFly=async function(GM){ const r=await fly0.apply(this,arguments); if(r) await S.arrive(GM); return r; }; }   /* E08：出境大廳「登機」→ 登機口、飛往日本、抵達 → 日本的據點 */
  if(typeof Y34B!=='undefined'&&Y34B.departResume){ const rs0=Y34B.departResume; Y34B.departResume=async function(GM){ const r=await rs0.apply(this,arguments); if(r) await S.arrive(GM); return r; }; }   /* 登機口那一段演完就關掉的存檔：接著飛往日本 → 日本的據點（y34b3d.js S.departResume）*/
  if(typeof HOME!=='undefined'){ const live0=HOME.livesHome, can0=HOME.canGo;
    if(live0) HOME.livesHome=function(G){ return S.homeOn(G)||live0.apply(this,arguments); };   /* 從家裡出發、出遊演完回家 */
    if(can0) HOME.canGo=function(G){ if(S.inJapan(G)) return false; if(typeof EXCH!=='undefined'&&EXCH.airPending&&EXCH.airPending(G)) return false; if(S.homeOn(G)) return true; return can0.apply(this,arguments); }; }   /* 在出境大廳等登機（E08）：不能回家 */   /* 人在日本：手機沒有「回臺北的家」；住家裡：隨時可以回家 */
  if(STORY.forceHome){ const f0=STORY.forceHome; let forcing=false;
    (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['jp3d:forcing']=()=>{ forcing=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
    STORY.forceHome=async function(GM){ const G=GM.G; if(S.inJapan(G)) return;   /* 據點自己處理凌晨（JP.loop）*/
      if(S.homeOn(G)&&typeof HOME!=='undefined'&&!HOME.at(G)){ if(forcing) return; forcing=true; try{ GM.sceneBegin(); try{ await GM.say(null,'已經凌晨了。'); } finally{ GM.sceneEnd(); } G.flags.companion=null; HOME.rec(G).at=false; await HOME.go(GM); } finally{ forcing=false; } return; }   /* 住家裡（退宿以後）：凌晨了＝回家（不回宿舍）*/
      return f0.apply(this,arguments); }; }
  if(STORY.whereIs){ const w0=STORY.whereIs; STORY.whereIs=function(GM,id){ const G=GM&&GM.G; if(id==='heroine_01'&&G&&S.inJapan(G)) return {zone:null,act:'',away:S.anWhere(G)}; return w0.apply(this,arguments); }; }   /* G9「現在大概在」*/
  if(typeof MSG!=='undefined'&&MSG.pick){ const p0=MSG.pick; MSG.pick=function(G,id,topic){ if(id==='heroine_01'&&topic==='chat'&&S.inJapan(G)){ const R=S.rec(G), L=dat(G)?S.G9:S.G9.slice(0,2), i=(R.g9|0)%L.length; R.g9=i+1;
      return {topic:'chat',tier:'A',variant:'在日本',msgs:[L[i]],tags:[],ask:null,src:'AA_341 G9'}; } return p0.apply(this,arguments); }; }   /* G9 問「在哪？」：輪流（挽回中只回前兩句）；取代「在總圖。」「在台中。」*/
  if(typeof INV!=='undefined'){ const ci0=INV.canInvite, wn0=INV.whyNot;
    if(ci0) INV.canInvite=function(G){ if(S.inJapan(G)) return false; return ci0.apply(this,arguments); };   /* J-S8：人在國外不出台灣朋友的邀約（按鈕不出現；AA_340 S9）*/
    if(wn0) INV.whyNot=function(G){ if(S.inJapan(G)) return ''; return wn0.apply(this,arguments); }; }
  if(typeof OUT!=='undefined'&&OUT.plan){ const plan0=OUT.plan; OUT.plan=function(G,o){ if(o&&o.goto&&S.inJapan(G)&&!/^jp_/.test(String(o.goto.zone||''))) return false; return plan0.apply(this,arguments); }; }   /* 人在日本：帶到臺灣區域的出遊不排 */
  if(typeof CLS!=='undefined'){ const td0=CLS.todayHTML, wk0=CLS.weekHTML, sg0=CLS.showGrades;
    if(td0) CLS.todayHTML=function(G){ if(S.inJapan(G)) return S.todayHTML(G); return td0.apply(this,arguments); };
    if(wk0) CLS.weekHTML=function(G){ if(S.inJapan(G)) return S.weekHTML(G); return wk0.apply(this,arguments); };
    { const l0=CLS.todayLine, g0=CLS.goalFor;   /* HUD 第一行（#goal）：人在日本照交換學校的課表（BB-B 10-25 R38_HUD_JP：第二行對了、第一行還是「今天沒有課」；同 us_life3d.js 包 todayLine／goalFor）*/
      if(l0) CLS.todayLine=function(G){ if(!G||!S.inJapan(G)) return l0.apply(this,arguments); const its=S.classesOn(G,G.day); return its.length?'今天的課：'+its.map(it=>hm(it.t0)+' '+it.c.name).join('、'):'今天沒有課'; };
      if(g0) CLS.goalFor=function(G){ if(!G||!S.inJapan(G)) return g0.apply(this,arguments); const R=S.rec(G), h=G.hour, nx=S.classesOn(G,G.day).find(it=>!R.att[it.key]&&h<it.t0+0.25); return {text:CLS.todayLine(G)+(nx?'。上課、讀書或自由活動都可以':''),dest:null}; }; }
    { const u0=CLS.updateHUD; if(u0) CLS.updateHUD=function(GM){ const G=GM&&GM.G; if(!G||GM.titleIdle||!S.inJapan(G)) return u0.apply(this,arguments); const el=typeof document!=='undefined'&&document.getElementById?document.getElementById('nextClass'):null; if(!el) return;   /* HUD 第二行：人在日本照交換學校的課表（原本照臺灣課表寫「今天沒有課」，BB-B 10-25 同美國那一則）*/
        const R=S.rec(G), h=G.hour, its=S.classesOn(G,G.day), nx=its.find(it=>!R.att[it.key]&&h<it.t0+0.25), s=nx?((h>=nx.t0-1?'現在可以上課：':'下一堂 ')+hm(nx.t0)+' '+nx.c.name):(its.length?'今天的課都結束了':'今天沒有課');
        if(el.dataset.s!==s){ el.dataset.s=s; el.textContent=s; } el.classList.remove('hide'); }; }
    if(sg0) CLS.showGrades=function(GM,termId,opts){ if(termId==='Y3S2'&&GM&&isJP(GM.G)) return S.showGrades(GM,opts); return sg0.apply(this,arguments); }; }
  { const e=evOf('ev_jp_repair_river'); if(e) e.after=G=>{ if(G.flags.AN_REPAIR4==='sorry') S.repair(G); };   /* 挽回第 4 步：REPAIR +1 */
    const t=evOf('ev_jp_tanabata_repair'); if(t) t.after=G=>{ if(G.flags.AN_JP_RECONCILED) S.resume(G); };   /* 挽回第 5 步：重新交往 */
    const o=evOf('ev_jp_office'); if(o) o.after=G=>{ if(typeof PHONE!=='undefined') PHONE.join(G,'jp_exchange','交換生群組'); }; }
  /* 家人群組（每週四 20:00「這週回來吃飯嗎」）：人在日本不問（同 us_life3d.js 美國的做法；AA_341 J-S14 的原則：在國外不出現臺灣才成立的事）*/
  /* AA_466 第 5 節（企劃線 8a7f797ec）：只放行住家裡版家人群組（HOME.LIVE_GROUP，src/jpprep3d.js；不問、不用回、家裡的日常），其他照 J-S14 擋 */
  if(typeof HOME!=='undefined'&&HOME.phoneRules){ const h0=HOME.phoneRules; HOME.phoneRules=function(GM){ if(GM&&GM.G&&S.inJapan(GM.G)){ if(typeof HOME.LIVE_GROUP==='function'){ try{ HOME.LIVE_GROUP(GM.G); }catch(e){ console.warn('HOME.LIVE_GROUP',e); } } return; } return h0.apply(this,arguments); }; }
  /* 臺灣的朋友回訊息的時間（MSG.replyAt）：照臺灣時間算他們醒著、在忙，再換回日本時間；以安在日本，照當地（AA_341 J-S7；同 us_life3d.js 的美國版）*/
  if(typeof MSG!=='undefined'&&MSG.replyAt){ const r0=MSG.replyAt; MSG.replyAt=function(G,id){ if(!S.inJapan(G)||id==='heroine_01') return r0.apply(this,arguments); const tz=STORY.tzOffset?(STORY.tzOffset(G)||0):0; if(!tz) return r0.apply(this,arguments);
      const t=NOW(G)-tz, tw=Object.assign({},G); tw.day=Math.floor(t/24); tw.hour=t-tw.day*24; tw.weekday=wdOf(tw.day); const r=r0.call(this,tw,id); if(!r) return r;
      const x=T(r.day,r.h)+tz, out=Object.assign({},r); out.day=Math.floor(x/24); out.h=x-out.day*24; out.tz=tz; return out;   /* tz：她照臺灣時間（msg3d.js S.herG 換回她那邊挑句子，MSG-ABROAD-SIT-TZ-1022）*/ }; }
  /* 每天的手機小事（STORY.DAILY_PHONE，例：阿凱的泡麵評鑑表 21:48）：臺灣的朋友傳的，人在日本＝當地時間（AA_341 J-S13）*/
  for(const d of (STORY.DAILY_PHONE||[])){ if(!d||d.jpTz||typeof d.h!=='function') continue; const h0=d.h; d.h=function(G){ const v=h0.apply(this,arguments); return G&&S.inJapan(G)&&STORY.tzOffset?v+(STORY.tzOffset(G)||0):v; }; d.jpTz=true; }
  /* AA_326 2-Y3-54 大三暑假的三選一（src/r2y3b3d.js）：日本路線不演（AA_341 裁定 10：8/5 晚上只演 1A-08；三選一是給留在臺灣的玩家 6/19 選的），快轉也不停在 8/5 21:00。
     2026-10-21 起 r2y3b3d.js 自己也不排日本路線的三選一（AA_349 L2）；這裡留著，舊版的事件包也一樣 */
  if(typeof R2Y3B!=='undefined'){ const sp0=R2Y3B.summerPlanPhone; if(sp0) R2Y3B.summerPlanPhone=function(G){ if(isJP(G)) return; return sp0.apply(this,arguments); };
    if(Array.isArray(R2Y3B.Y3_STOPS)) for(const x of R2Y3B.Y3_STOPS) if(x&&x[3]==='plan3'&&Array.isArray(x[2])) x[2]=x[2].filter(r=>r!=='JP'); }
  if(Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push((G,GM)=>S.phone(G,GM));
  return S;
})();
