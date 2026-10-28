/* ===== 手機「動態」（AA_503 第 1 節，企劃線 d13ab3ab7；HEROINE-LIFE-1028，使用者 2026-10-28 01:2x「可攻略女主角 感覺都沒有自己的生活」，USER_WANTS X122★）=====
   她貼自己的事（照片＋一句），像限時動態；加上她私訊你講她自己的事（不約你、不回你，只是跟你說）。資料一學期一份，加進 SETS：
     src/data/feed_y1s1.js（大一上，AA_503）、feed_y1s2.js（大一下＋暑假，AA_504）、feed_y2s1.js（大二上＋寒假，AA_505）、
     feed_y2s2.js（大二下＋暑假，AA_506）、feed_y3s1.js（大三上＋寒假，AA_507）、feed_y3s2.js（大三下＋暑假，AA_508）、feed_y4s1.js（大四上＋寒假，AA_509）、
     feed_y4s2.js（大四下＋畢業那年夏天，AA_510）、feed_pg.js（畢業以後 2029-09～2030-12，AA_511）。
     id 全部不重複（大一下的加 b、大二上 c、大二下 d、大三上 e、大三下 f、大四上 g、大四下 h、畢業以後 i）。
   ■ 動態頁（手機「訊息」旁邊那一頁，game3d.js 的 renderPhone 叫 FEED.html）：
     - 誰：有聯絡方式的人（INV.hasContact）。保留七天（S.KEEP），最新的在上面。
     - 提示：新的只在「動態」頁籤上亮一個小點（S.newCount）；不跳通知、不算未讀、不算在私訊的頻率上限裡（動態不在 G.msgs）。
     - 頻率（S.CAP）：女主角（DATE.HEROINES 七位）每人任何連續七天最多兩則；配角每人十四天最多一則；全部一天最多四則。超過的那一則就不出。
     - 階段（S.ST、S.rank；那一則到了她貼的時間才判斷，沒到的那一則就是沒有，不顯示「鎖住」）：
         階段看 SOCIAL.friendLevel（朋友這條線，只看熟悉、信任、自在：熟悉 ≥5 認識 ACQUAINTANCE、≥20 有點熟 FAMILIAR、熟悉 ≥40＋信任 ≥25 朋友 FRIEND、
         熟悉 ≥60＋信任 ≥45＋自在 ≥40 很熟 CLOSE_FRIEND；STRANGER＝還沒見過面）；交往中＝G.flags['dating_<id>']（交往中也算到了前面每一階）。
         不用 SOCIAL.stage：它的曖昧（POSSIBLE_ROMANTIC_INTEREST 熟悉 ≥45）排在好朋友後面，會讓沒那麼熟的人看到「很熟」那幾則。
     - 回應（S.respond）：一則只回一次，三選一——「（按愛心）」她不回；留言＝她回（進私訊對話串）；「（私訊問一句）」＝那一則寫的問題和她的回答（也進私訊）。
       回了熟悉 +1，同一個人一天只算一次（SOCIAL.activity 'feed'：同一種活動一天一次，也在一天的上限裡）。對話串裡那一句標「動態「…」」（S.refLabel）。
     - 時間到了才出（S.tick，STORY.PHONE_RULES 每次呼叫）；睡過、跳時間的，照原本的時間補在動態裡（超過七天的就不補）。
     - 舊存檔：從讀檔那一天開始有，以前的不補（G.flags.FEED.start＝第一次建立那一天；新遊戲一開始就建立）。
   ■ 私訊（dms）：時間到了用 PHONE.at 傳（照原本的時間補；回覆照 PHONE.answer），選項的記號寫進 G.flags（資料檔開頭）。
     那一則的時間到了才判斷（階段、聯絡方式、need、after）；判斷過就不再判斷（G.flags.FEED.dm）。私訊的 tag、選項的 ask id 一律「aa503_」＋id（大一上起用的前綴，之後的學期照用）。
     動態的 if：那一則要的條件（FEED.COND；沛珊大一下第 3 則＝沒有和沛珊交往）。語彤雙主修放榜（AA_504）之後第一次在麵店點餐，阿姨請（S.ytTreat，story3d.js 的 noodleScene）。
     可昕「我陪妳熬夜。」＝排出遊（視訊，ev_kexin_video_report，照現有視訊讀書：讀哪一科、兩個小時）；「妳先睡，明天再做。」＝隔天中午以前你傳訊息給她，她中午才回（包住 MSG.replyAt）。
   ■ 分開以後一學期（INV.cool 那段：分開那天到下一個學期第 1 週）：可昕把你設成不看動態——她的動態不出、私訊不傳；之後照朋友的階段再出現。
     V6EX.COOL_IDS 沒有可昕（照 AA_351，INV.cool 對她永遠是 false），所以這裡自己用同一段期間算（ROM 的分開那天＋V6EX.coolUntil）。
     其他六位在 INV.cool 期間：動態照常（稿只寫可昕），私訊照 V6EX 每兩則送一則（'dp' 那一類）。
   ■ 大二下、大三上（AA_506、AA_507，企劃線 31a4c4002）加的：
     - 照片裡的 {name}＝玩家的名字（G.name；以安大二下第 7 則「京都：{name}」，S.pic）。
     - 去沒去 WENT：anC12（報了 C12 京都語言課、和以安 FAMILIAR 以上＝同班那一版，同 vac_activities.js 的 AN_C12）、
       zqNamed（回過 needed_msgs zq_name「『存檔點』。」：包住 STORY.neededAnswered 記 ZQ_NAME_REPLIED；舊存檔看訊息）、anJP（日本路線，STORY.route）。
     - 一個月最多幾則（那一份的 capMonth，S.monthCap）：沛珊大三上（台南）一個月最多一則；照那一則的日期算同一個月已經出的（R.done 'p'，各學期的都算）。超過＝'x:month'。
     - 語彤 2027-07-09 生日（那一份的 ytBday，S.ytBdayTick）：12:00 麵店團群組 Alison／不在群組、FAMILIAR 以上＝她的私訊放系統字，選項「傳一句生日快樂」（home3d.js 2026、r2y3b3d.js 2028 的做法）。
   ■ 大三下、大四上（AA_508、AA_509，企劃線 28f981438）加的：
     - 時差（S.loc）：稿上的時間都是臺灣時間；玩家人在國外（日本路線 3/25～8/5、美國路線 8/2～12/23、寒暑假出國途中）遊戲時鐘是當地時間，照 STORY.tzOffset 換
       （同 r2y4a3d.js 的 loc）——送到的那一刻和在臺灣一樣，手機上顯示當地時間；私訊、回覆期限、選項排的出遊也照換。人在臺灣＝0，不變（前幾輪的都一樣）。
     - 出遊途中貼的（AA_506 第 9 節，691a26400）：那一則出的時候玩家在出遊途中（G.outings 裡到了、還沒演完的那一趟：寒暑假出國、營隊……）＝記 tr（那一趟的 id）；
       演完以後第一次 tick 記 back（回來那一刻），從回來那一刻起再留七天（S.live）；還在途中的照留。前幾輪的（AA_506 以安「京都：{name}」）一起照這個。
     - 去沒去：ytAunt（語彤 8/22 問阿姨的 2D 短場演過）、sisUS（美國路線：學姊大四上第 1～3 則照片加「你」）；stIf＝那個 WENT 成立就不看階段
       （AA_508 3-3「陪她去的玩家也看得到」）。私訊的 if（FEED.COND；語彤 8/21 ytAuntHere：8/22 人不在國外）。
     - 選項的 out：排一趟出遊（at＝臺灣時間；語彤「好。」→ 8/22 21:00 麵店的短場）；那一份的 events 接進 STORY_EVENTS。
     - 那一份的 ladSet：閒聊階梯選了哪一句就寫進 G.flags（ladder.js 這一層只記 YT6_ASK_AUNT、不分選項）：包住 STORY.ladPlay（語彤 Y6-L8「我可以陪妳問。」＝YT6_WITH）。
     - 留言、回覆兩個版本句數不同（子晴大三下第 3 則）：沒有的那一版寫 ''，那一句不出。
   ■ 大四下、畢業以後（AA_510 企劃線 28f981438、AA_511 企劃線 c9899bed9）加的：
     - 畢業以後篇（src/postgrad3d.js；PG.on：6/2 拍照以後，站著不動兩秒、睡覺＝跳到下一件事）跳時間，動態不過期（AA_511 第 0 節第 1 點，照 AA_506 第 9 節出遊途中的做法）：
       跳的途中（PG.jumpTo 那一段，S.pgJumping）貼的、跳之前最後一次還看得到的（S.free 那一刻還在七天內的）記 tr＝'pg'（S.PG_TR）；
       停下來＝跳完、接著的那一件演完（PG.busy：PG.advance 的開手機、演場景）、落地的出遊也演完或不去了（S.tripNow、OUT.due）、PG 的場景沒有該演的（PG.due）以後第一次 tick，
       記 back（那一刻），從那一刻起再留七天（S.live）。一則只延一次：已經有 tr 的不再記（不然每跳一次都重算，永遠不過期）。跳的途中最多留 S.PG_MAX 天（PG 的跳不會卡住，只是上限）。
     - 停點（PG.stops，S.pgStop）：最後一個停點（2030-10-01 第一份工作、12/13 麵店團）以後接著就是尾聲（2034）的，先停在還沒出、會出的最後一則動態（那一刻還有聯絡方式、階段夠）——
       不然那幾則（以安紐約、語彤紅紙、芷若存摺、學姊計畫本……）永遠看不到（AA_511 第 8 節第 4 點「每一則都看得到」）。中間還有別的停點時不影響（取最早的那一個）。
     - 可昕分開以後一學期（AA_503 9-3，AA_510 7-3、AA_511 第 7 節照用）：大四下以後沒有下一個學期（V6EX.coolUntil＝null），照分開那天起 18 週（S.COOL_LAST）。
   ■ 存檔：G.flags.FEED＝{start, items:[{id, who, day, h, v, r, tr, back}], done:{動態 id:'p'|'old'|'x:原因'}, dm:{私訊 id:'sent'|'old'|'x:原因'}, seen, hold:{人物:絕對時間}, ytTreat:阿姨請的那一天}；舊存檔沒有＝從那一天開始。
     tr：出遊途中貼的＝那一趟的 id；畢業以後篇跳時間＝'pg'。
     G.flags.ZQ_NAME_REPLIED（子晴 zq_name 回過）、YT_BDAY_Y2（2027 生日回了「生日快樂。」）、YT6_WITH（語彤 Y6-L8 選「我可以陪妳問。」）、YT_AUNT_DM（8/21 私訊選了哪一個）。
   測試：node tests/aa503_feed_unit.js、node tests/aa504_505_feed_unit.js、node tests/aa506_507_feed_unit.js、node tests/aa508_509_feed_unit.js、node tests/aa510_511_feed_unit.js */
'use strict';
const FEED=(function(){
  const S={};
  const SETS=()=>[typeof FEED_Y1S1!=='undefined'?FEED_Y1S1:null,typeof FEED_Y1S2!=='undefined'?FEED_Y1S2:null,typeof FEED_Y2S1!=='undefined'?FEED_Y2S1:null,
    typeof FEED_Y2S2!=='undefined'?FEED_Y2S2:null,typeof FEED_Y3S1!=='undefined'?FEED_Y3S1:null,typeof FEED_Y3S2!=='undefined'?FEED_Y3S2:null,
    typeof FEED_Y4S1!=='undefined'?FEED_Y4S1:null,typeof FEED_Y4S2!=='undefined'?FEED_Y4S2:null,typeof FEED_PG!=='undefined'?FEED_PG:null].filter(Boolean);
  S.SETS=SETS;
  S.KEEP=7;
  S.CAP={heroine:{n:2,days:7},other:{n:1,days:14},day:4};
  S.ST={'認識':1,'有點熟':2,'朋友':3,'很熟':4,'交往中':5};
  const abs=(d,h)=>d*24+h;
  const nowOf=G=>abs(G.day,+G.hour||0);
  const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
  const dating=(G,id)=>!!(G.flags&&G.flags['dating_'+id]===true);
  const HEROINES=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan','kexin'];
  S.isHeroine=id=>((typeof DATE!=='undefined'&&Array.isArray(DATE.HEROINES))?DATE.HEROINES:HEROINES).includes(id);
  /* ---------- 時間：'W2日 21:40'（這一份的學期第幾週星期幾）、'2025-12-27 15:30'、'@錨點 12:30' ---------- */
  const WD='一二三四五六日';
  const dayOfKey=k=>{ const [y,m,d]=k.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-CALENDAR.tOf(1))/864e5)+1; };
  const termDay=(term,week,wd)=>{ const R=typeof CALENDAR!=='undefined'&&CALENDAR.termDays?CALENDAR.termDays(term):null; return R?R.from+(week-1)*7+(wd-1):null; };   /* 第 1 週週一＝開學日；wd 1＝週一 … 7＝週日（同 CALENDAR.dateOf）*/
  S.termDay=termDay;
  const cache={};
  S.when=function(G,t,term){ if(typeof t!=='string'||typeof CALENDAR==='undefined') return null; let m=/^@(\w+) (\d\d):(\d\d)$/.exec(t);
    if(m){ const f=S.ANCHOR[m[1]]; const d=f?f(G):null; return d==null?null:{day:d,h:+m[2]+(+m[3])/60}; }
    const k=term+'|'+t; if(k in cache) return cache[k]; let r=null;
    if((m=/^W(\d+)([一二三四五六日]) (\d\d):(\d\d)$/.exec(t))){ const d=termDay(term,+m[1],WD.indexOf(m[2])+1); if(d!=null) r={day:d,h:+m[3]+(+m[4])/60}; }
    else if((m=/^(\d{4}-\d\d-\d\d) (\d\d):(\d\d)$/.exec(t))) r={day:dayOfKey(m[1]),h:+m[2]+(+m[3])/60};
    return cache[k]=r; };
  /* 臺灣時間 → 遊戲時鐘（AA_508 第 8 節第 3 點：日本路線人在日本、美國路線 8/2 以後動態、私訊照收）：人在國外的時鐘是當地時間，照 STORY.tzOffset 換
     （日本 +1、美國 −12／11/5 起 −13、寒暑假出國途中照 VAC.tzAt；同 r2y4a3d.js 的 loc）。在臺灣＝0，不變。S.when 照舊回臺灣時間（快取）*/
  S.tz=(G,day)=>{ if(!G||typeof STORY==='undefined'||!STORY.tzOffset) return 0; const z=+STORY.tzOffset(G,day); return isFinite(z)?z:0; };
  S.loc=function(G,w){ if(!w) return w; const z=S.tz(G,w.day); if(!z) return w; const t=abs(w.day,w.h)+z, d=Math.floor(t/24+1e-9); return {day:d,h:+(t-d*24).toFixed(4)}; };
  S.whenLoc=(G,t,term)=>S.loc(G,S.when(G,t,term));
  /* 照劇情算的那一天 */
  S.ANCHOR={
    /* 可昕 9-3 第 3 則：予樂宵夜那一晚之後隔天 12:30。有去（ev_kexin_yule_pass，yulePassDay）＝那一晚的隔天；K1b「這週不行」或沒回＝她自己去（問的隔天晚上）；
       答應了沒去（出遊 missed）＝排的那一晚的隔天；還沒到那一晚＝等。K1b 沒問過（沒去過政大 NCCU_VISITED）＝她自己去，照第一個能問的日子（第 6 週週二問、週三晚上）＝第 6 週週四 */
    kxYule:G=>{ const F=G.flags||{}; if(F.yulePassDay!=null) return F.yulePassDay+1;
      if(F.kxYuleAskDay!=null){ const q=typeof OUT!=='undefined'&&OUT.get?OUT.get(G,'kx_yule'):null; if(q&&q.state==='planned') return null; if(q) return q.day+1; if(F.KX_YULE==='yes'||F.KX_YULE==='late') return null; return F.kxYuleAskDay+2; }
      if(!F.NCCU_VISITED) return termDay('Y1S1',6,4);
      return null; }
  };
  /* 去沒去（照片、回覆的兩個版本）*/
  S.WENT={
    kxBbq:G=>!!(G.flags&&G.flags.KX_BBQ_COME&&G.events&&G.events.done&&G.events.done.ev_mid_autumn_bbq!=null),   /* K3「來我們這邊。」而且中秋烤肉有去（她在你旁邊）*/
    kxYule:G=>!!(G.flags&&G.flags.yulePassDay!=null),   /* 予樂的宵夜你有去 */
    kxDec3:G=>{ const F=G.flags||{}; return !!(F.KX_DEC3_VISIT||(F.KX_DEC3&&F.KX_DEC3[1]==='visit')); },   /* 12/3 交完報告那晚開車去政大（ev_kexin_birthday_y1；AA_503 d13ab3ab7 第 12 節第 3 點）*/
    anWent:G=>(G.invites||[]).some(iv=>iv&&iv.who==='heroine_01'&&iv.state==='done')||!!(G.dateLog&&G.dateLog.heroine_01&&(G.dateLog.heroine_01.count|0)>0),   /* 和以安一起去過：INV 任一地點見到了，或校外約會（AA_505 1-3 第 3 則）*/
    /* 報了 C12 京都語言課（還在京都＝'yes'、回來了＝'done'；沒去＝'missed' 不算）而且和以安 FAMILIAR 以上（同班那一版，vac_activities.js 的 AN_C12：她只有大二暑假在京都）（AA_506 1-3 第 7 則）*/
    anC12:G=>{ const st=typeof VAC!=='undefined'&&VAC.state?VAC.state(G,'C12@Y2'):null; return (st==='yes'||st==='done')&&S.atLeast('heroine_01','FAMILIAR'); },
    zqNamed:G=>S.zqNamed(G),   /* 回過子晴的 needed_msgs zq_name「『存檔點』。」（AA_506 4-3 第 6 則）*/
    anJP:G=>typeof STORY!=='undefined'&&!!STORY.route&&STORY.route(G)==='JP',   /* 日本路線（11/18 志願表截止時和以安交往；AA_507 1-3 第 7 則、AA_508 1-3 第 4、7 則）*/
    /* 語彤 8/22 問阿姨的 2D 短場演過（8/21 私訊回「好。」、出遊那一趟 done；AA_508 3-3 第 7 則）*/
    ytAunt:G=>{ const q=typeof OUT!=='undefined'&&OUT.get?OUT.get(G,'aa508_yt_aunt'):null; return !!(q&&q.state==='done')||!!(G.events&&G.events.done&&G.events.done.ev_aa508_yt_aunt!=null); },
    sisUS:G=>typeof STORY!=='undefined'&&!!STORY.route&&STORY.route(G)==='US'   /* 美國路線（和學姊同一班出發、人在美國；AA_509 5-3 第 1～3 則照片加「你」）*/
  };
  /* 和她 st 以上（認識、照 SOCIAL.stage 的順序；同 vac3d.js 的 atLeast）*/
  S.atLeast=(id,st)=>{ if(typeof SOCIAL==='undefined'||!SOCIAL.STAGES||!SOCIAL.stage||!SOCIAL.has||!SOCIAL.has(id,'FIRST_MET')) return false; const A=SOCIAL.STAGES; return A.indexOf(SOCIAL.stage(id))>=A.indexOf(st); };
  /* 子晴 zq_name 回過沒有：STORY.neededAnswered 記 ZQ_NAME_REPLIED（檔尾包住）；舊存檔看訊息（ask id 'need_<日>_zq_name' 回過）*/
  S.zqNamed=G=>!!(G&&G.flags&&G.flags.ZQ_NAME_REPLIED)||(G&&G.msgs||[]).some(m=>m&&m.ask&&/_zq_name$/.test(m.ask.id||'')&&m.ans!=null);
  S.COND={
    anRulesGroup:G=>!!(G.flags&&G.flags.AN_DORM_RULES==='group'),   /* 10/14 Alison 在麵店團群組爆料（story3d.js an_rules_grp）*/
    zrAskedDrink:G=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has('heroine_02','ASKED_HER_DRINK'),   /* 問過她自己喝什麼（events.js Z3：熱可可加一份濃縮）*/
    /* 沛珊和柏翰那一段在（characters.js 沛珊的 partner：2026-04-06 起、玩家和沛珊交往＝沒有；STORY.partnerOn）。AA_504 6-3 第 3 則「只有玩家沒有和沛珊交往的才出」*/
    psBohan:G=>{ const c=typeof CHARACTERS!=='undefined'?CHARACTERS.classmate_peishan:null; if(c&&c.partner&&typeof STORY!=='undefined'&&STORY.partnerOn) return !!STORY.partnerOn(G,c.partner); return !dating(G,'classmate_peishan'); },
    /* 語彤 8/21 私訊（AA_508 3-2 第 7 點「你說要坐旁邊」）：8/22 人在臺灣——不在交換的國外（美國路線 8/2 起在美國）、8/22 沒有報了出國的寒暑假活動。稿沒寫，照最保守的做 */
    ytAuntHere:G=>{ const d=dayOfKey('2028-08-22'); if(typeof STORY!=='undefined'&&STORY.abroad&&(STORY.abroad(G)||STORY.abroad(Object.assign({},G,{day:d})))) return false;
      return !(typeof VAC!=='undefined'&&VAC.abroadOn&&VAC.abroadOn(G,d)); }
  };
  /* ---------- 階段 ---------- */
  S.rank=function(G,id){ if(dating(G,id)) return 5; if(typeof SOCIAL==='undefined') return 0; const f=SOCIAL.friendLevel?SOCIAL.friendLevel(id):(SOCIAL.stage?SOCIAL.stage(id):'STRANGER'); return {ACQUAINTANCE:1,FAMILIAR:2,FRIEND:3,CLOSE_FRIEND:4}[f]||0; };
  S.stageOk=(G,id,st)=>S.rank(G,id)>=(S.ST[st]||1);
  const hasContact=(G,id)=>typeof INV==='undefined'||!INV.hasContact||INV.hasContact(G,id);
  /* 可昕：分開以後一學期（分開那天到下一個學期第 1 週，同 V6EX.coolUntil）*/
  const nextTerm=d=>{ if(typeof V6EX!=='undefined'&&V6EX.coolUntil) return V6EX.coolUntil(d); let cur=null; for(let x=d;x>d-200;x--){ const t=CALENDAR.termOf(x); if(t){ cur=t.id; break; } }
    for(let x=d+1;x<d+400;x++){ const t=CALENDAR.termOf(x); if(t&&t.id!==cur&&t.week===1) return x; } return null; };
  /* 最近一次分開的那一天（ROM 的紀錄 history 的 end，同 V6EX.endDay；直接讀，不用 ROM.get——它會替沒有紀錄的人建一筆空的）*/
  S.endDay=function(G,id){ const F=G.flags||{}, R=F.romance&&F.romance[id], H=(R&&R.history)||[]; for(let i=H.length-1;i>=0;i--) if(H[i]&&H[i].ev==='end'&&H[i].day!=null) return H[i].day;
    return id==='kexin'&&typeof F.KX_ENDED_ON==='number'?F.KX_ENDED_ON:null; };
  S.COOL_LAST=126;   /* 大四下以後分開（沒有下一個學期：V6EX.coolUntil＝null）：分開那天起 18 週（一學期）。AA_510 7-3、AA_511 第 7 節「分開以後一學期：照 AA_503 9-3」*/
  S.kxCool=function(G){ const F=G.flags||{}; if(dating(G,'kexin')||(!F.EX_kexin&&F.KX_ENDED_ON==null)) return false; if(typeof INV!=='undefined'&&INV.cool&&INV.cool(G,'kexin')) return true;
    const d=S.endDay(G,'kexin'); if(d==null) return false; let u=nextTerm(d); if(u==null) u=d+S.COOL_LAST; return G.day>=d&&G.day<u; };
  /* ---------- 存檔 ---------- */
  S.rec=function(G){ const F=G.flags||(G.flags={}); let R=F.FEED; if(!R||typeof R!=='object') R=F.FEED={start:G.day,items:[],done:{},dm:{},seen:-1e9};
    if(typeof R.start!=='number') R.start=G.day; if(!Array.isArray(R.items)) R.items=[]; if(!R.done||typeof R.done!=='object') R.done={}; if(!R.dm||typeof R.dm!=='object') R.dm={}; if(typeof R.seen!=='number') R.seen=-1e9; return R; };
  S.post=id=>{ for(const s of SETS()) for(const p of s.posts||[]) if(p.id===id) return p; return null; };
  S.dmOf=id=>{ for(const s of SETS()) for(const q of s.dms||[]) if(q.id===id) return {q,term:s.term}; return null; };
  S.txt=(x,v)=>x&&typeof x==='object'?(x[v||'no']!=null?x[v||'no']:x.no):x;   /* 兩個版本的照片／回覆／私訊問的那一句（可昕第 6 則）*/
  S.line=(G,l)=>l&&typeof l==='object'&&l.if?((S.COND[l.if]&&S.COND[l.if](G))?l.yes:l.no):l;
  /* ---------- 動態：這一則出不出（空字串＝出）---------- */
  S.blocked=function(G,p,w){ if(!hasContact(G,p.who)) return 'contact'; if(p.who==='kexin'&&S.kxCool(G)) return 'cool';
    if(!S.stageOk(G,p.who,p.st)&&!(p.stIf&&S.WENT[p.stIf]&&S.WENT[p.stIf](G))) return 'stage';   /* stIf：那個 WENT 成立就不看階段（語彤 8/22「陪她去的玩家也看得到」）*/
    if(p.if&&!(S.COND[p.if]&&S.COND[p.if](G))) return 'if';
    const R=S.rec(G), t=abs(w.day,w.h), hero=S.isHeroine(p.who), C=hero?S.CAP.heroine:S.CAP.other;
    if(R.items.filter(i=>i.who===p.who&&abs(i.day,i.h)<=t&&t-abs(i.day,i.h)<C.days*24).length>=C.n) return 'week';
    if(R.items.filter(i=>i.day===w.day).length>=S.CAP.day) return 'day';
    if(S.monthCap(G,p,w)) return 'month';
    return ''; };
  /* 一個月最多幾則（那一份的 capMonth：沛珊大三上，AA_507 6-3）：照那一則的日期，同一個月已經出的（R.done 'p'，各學期的都算；items 只留十五天，所以不看 items）*/
  S.setOf=p=>{ for(const s of SETS()) if((s.posts||[]).includes(p)) return s; return null; };
  const ym=d=>{ const x=CALENDAR.dateOf(d); return x.y*100+x.m; };
  S.monthCap=function(G,p,w){ const s=S.setOf(p), n=s&&s.capMonth&&s.capMonth[p.who]; if(!n) return false; const R=S.rec(G), k=ym(w.day); let c=0;
    for(const s2 of SETS()) for(const q of s2.posts||[]){ if(q===p||q.who!==p.who||R.done[q.id]!=='p') continue; const wq=S.when(G,q.t,s2.term); if(wq&&ym(wq.day)===k) c++; }
    return c>=n; };
  S.decide=function(G,p,w){ const R=S.rec(G); if(w.day<R.start||abs(w.day,w.h)<nowOf(G)-S.KEEP*24){ R.done[p.id]='old'; return false; }
    const why=S.blocked(G,p,w); if(why){ R.done[p.id]='x:'+why; return false; }
    const it={id:p.id,who:p.who,day:w.day,h:+w.h.toFixed(3)}; if(p.went&&S.WENT[p.went]) it.v=S.WENT[p.went](G)?'yes':'no';
    const q=S.tripNow(G); if(q) it.tr=q.id;   /* 出遊途中貼的（AA_506 第 9 節）：回來以後再留七天 */
    else if(S.pgJumping>0) it.tr=S.PG_TR;   /* 畢業以後篇跳時間的途中貼的（AA_511 第 0 節第 1 點）：停下來以後再留七天 */
    R.items.push(it); R.done[p.id]='p'; return true; };
  /* ---------- 出遊途中（AA_506 第 9 節，企劃線 691a26400）：「從玩家回來那一天起再留七天。之後別的出遊途中貼的照這個做。」----------
     途中＝G.outings 裡到了（arrived，OUT.go 演之前記、演完刪）、還沒演完（planned，出國的那一段是 flying）的那一趟——寒暑假的整趟（出國、營隊）、校外的約會。
     回來＝那一趟演完以後第一次 tick（S.tick 記 back＝那一刻）；從那一刻起七天（同一般的七天：7×24 小時）。還在途中的照留；卡住沒演完的最多留 S.TRIP_MAX 天 */
  S.TRIP_MAX=60;
  const going=(G,q)=>!!q&&q.arrived===true&&(q.state==='planned'||q.state==='flying')&&!(typeof q.day==='number'&&G.day-q.day>S.TRIP_MAX);   /* 出發那天起 60 天以上還「在途中」＝卡住的紀錄，不算 */
  S.tripNow=G=>(Array.isArray(G&&G.outings)?G.outings:[]).find(q=>going(G,q))||null;
  /* ---------- 畢業以後篇跳時間（AA_511 第 0 節第 1 點，企劃線 c9899bed9）：「畢業以後篇跳時間的時候，動態不過期：照 AA_506 第 9 節出遊途中的做法，
     從玩家停下來（下一件事演完、回到可以操作）那一刻起留七天。」----------
     跳的途中＝PG.jumpTo 那一段（檔尾包住，S.pgJumping）。tr＝'pg'：跳的途中貼的（S.decide）、跳之前最後一次 tick（S.free）還在七天內、還沒延過的（S.tick）。
     停下來以前（S.pgHold）＝還在跳、PG.busy（PG.advance 跳完開手機、演落地的場景；PG.tick／sleepJump 設）、PG 有該演的場景（PG.due）、落地的出遊在演（S.tripNow）或在問「出發」（OUT.due）。
     停下來以後第一次 tick 記 back，從那一刻起七天。跳的途中最多留 S.PG_MAX 天（PG 的跳不會卡住，只是上限；最長的一跳是 2029-06-28 到 2030-10-01 那種）*/
  S.PG_TR='pg'; S.PG_MAX=800; S.pgJumping=0; S.free=null;
  S.pgHold=G=>S.pgJumping>0||(typeof PG!=='undefined'&&(!!PG.busy||(!!PG.due&&!!PG.due(G))))||!!S.tripNow(G)||!!(typeof OUT!=='undefined'&&OUT.due&&OUT.due(G));
  S.holdMax=it=>it&&it.tr===S.PG_TR?S.PG_MAX:S.TRIP_MAX;
  S.tripOn=(G,id)=>id===S.PG_TR?S.pgHold(G):(Array.isArray(G&&G.outings)?G.outings:[]).some(q=>q&&q.id===id&&going(G,q));
  S.live=function(G,it,now){ if(now==null) now=nowOf(G); const t=abs(it.day,it.h); if(t>now) return false; if(now-t<S.KEEP*24) return true; if(it.tr==null) return false;
    if(it.back==null) return now-t<S.holdMax(it)*24&&S.tripOn(G,it.tr); return now-it.back<S.KEEP*24; };
  /* 畢業以後篇的停點（檔尾掛在 PG.stops；PG.nextStop 取所有停點最早的那一個）：還沒出、到時候會出的最後一則動態（現在有聯絡方式、階段夠、條件成立）。
     中間還有別的停點時不影響；只有最後一個停點（2030-10-01 第一份工作、12/13 麵店團…）以後接著就是尾聲（2034，PG.advance 直接演）的時候，先停在這裡——
     不然那幾則永遠看不到（AA_511 第 8 節第 4 點「每一則都看得到」）。停下來看得到跳的途中貼的那幾則（七天）*/
  S.pgStop=function(G){ if(!G||!G.flags||typeof PG==='undefined'||!PG.on||!PG.on(G)||typeof CALENDAR==='undefined') return null; const R=S.rec(G), now=nowOf(G); let best=null;
    for(const s of SETS()) for(const p of s.posts||[]){ if(R.done[p.id]) continue; const w=S.when(G,p.t,s.term); if(!w) continue; const t=abs(w.day,w.h); if(t<=now+1e-6) continue;
      if(!hasContact(G,p.who)||!(S.stageOk(G,p.who,p.st)||(p.stIf&&S.WENT[p.stIf]&&S.WENT[p.stIf](G)))||(p.if&&!(S.COND[p.if]&&S.COND[p.if](G)))) continue;
      if(best==null||t>best) best=t; }
    return best; };
  /* ---------- 私訊：這一則傳不傳 ---------- */
  S.dmBlocked=function(G,q){ const F=G.flags||{}, R=S.rec(G); if(!hasContact(G,q.who)) return 'contact'; if(q.who==='kexin'&&S.kxCool(G)) return 'cool';
    if(q.st&&!S.stageOk(G,q.who,q.st)) return 'stage'; if(q.need&&!F[q.need]) return 'need'; if(q.after&&R.dm[q.after]!=='sent') return 'after';
    if(q.if&&!(S.COND[q.if]&&S.COND[q.if](G))) return 'if';   /* 那一則要的條件（語彤 8/21：8/22 人在臺灣）*/
    if(q.who!=='kexin'&&typeof INV!=='undefined'&&INV.cool&&INV.cool(G,q.who)&&typeof V6EX!=='undefined'&&V6EX.coolSkip&&V6EX.coolSkip(G,q.who,'dp','aa503_'+q.id)) return 'cool';   /* 其他六位分開以後一學期：她先傳的每兩則送一則（同手機小事）*/
    return ''; };
  S.dmItems=function(G,q,term){ const th='p:'+q.who, items=q.lines.map(l=>({th,from:q.who,text:S.line(G,l)}));
    if(q.ask){ const A=q.ask, opts=A.opts.map(o=>{ const x={t:o.t,fk:o.k,set:Object.assign({[A.flag]:o.k},o.set||{}),say:(o.r||[]).map(r=>r&&typeof r==='object'&&r.nar?{text:r.nar}:{from:q.who,text:r})};
        if(o.post!==undefined) x.post=o.post; if(o.video) x.video=o.video; if(o.hold) x.hold=o.hold; if(o.out) x.out=o.out; return x; });
      const ask={id:'aa503_'+q.id,opts}; if(A.until){ const u=S.whenLoc(G,A.until,term); if(u) ask.until=abs(u.day,u.h); } items[items.length-1].ask=ask; }
    return items; };
  S.sendDm=function(G,q,w,term){ const R=S.rec(G); if(w.day<R.start){ R.dm[q.id]='old'; return false; } const why=S.dmBlocked(G,q); if(why){ R.dm[q.id]='x:'+why; return false; }
    if(typeof PHONE==='undefined') return false; PHONE.at(G,w.day,w.h,S.dmItems(G,q,term),'aa503_'+q.id); R.dm[q.id]='sent'; return true; };
  /* ---------- 每次手機規則（STORY.PHONE_RULES）：時間到了的動態、私訊 ---------- */
  S.tick=function(G){ if(!G||!G.flags||typeof CALENDAR==='undefined'||(G.stage||'law')!=='law') return 0; const R=S.rec(G), now=nowOf(G), due=[];
    /* 畢業以後篇跳時間（AA_511 第 0 節第 1 點）：跳之前最後一次 tick 還看得到、還沒延過的，記 tr＝'pg'（跳的途中不過期，停下來以後再留七天；一則只延一次）*/
    if(S.pgJumping>0){ const t0=S.free&&S.free.G===G&&S.free.t<=now?S.free.t:now; for(const i of R.items) if(i.tr==null&&S.live(G,i,t0)) i.tr=S.PG_TR; }
    else S.free={G,t:now};
    const dueAt=(t,term)=>{ const w0=S.when(G,t,term); if(!w0||abs(w0.day,w0.h)>now+24) return null; const w=S.loc(G,w0); return abs(w.day,w.h)>now?null:w; };   /* 人在國外照時差換成當地時間（S.loc）；一天以後的先不算時差 */
    for(const s of SETS()){ for(const p of s.posts||[]){ if(R.done[p.id]) continue; const w=dueAt(p.t,s.term); if(w) due.push({p,w}); }
      for(const q of s.dms||[]){ if(R.dm[q.id]) continue; const w=dueAt(q.t,s.term); if(w) due.push({q,w,term:s.term}); } }
    due.sort((a,b)=>abs(a.w.day,a.w.h)-abs(b.w.day,b.w.h)); let n=0;
    for(const x of due){ if(x.p){ if(S.decide(G,x.p,x.w)) n++; } else S.sendDm(G,x.q,x.w,x.term); }   /* 照時間的先後：一天四則、每人一週兩則照先貼的算 */
    S.ytBdayTick(G);
    for(const i of R.items) if(i.tr!=null&&i.back==null&&!S.tripOn(G,i.tr)) i.back=now;   /* 出遊途中貼的：那一趟演完了＝記回來的那一刻（AA_506 第 9 節）；畢業以後篇跳時間：停下來的那一刻（AA_511 第 0 節第 1 點）*/
    if(R.items.length) R.items=R.items.filter(i=>now-abs(i.day,i.h)<=15*24||(i.tr!=null&&(i.back==null?now-abs(i.day,i.h)<S.holdMax(i)*24:now-i.back<=15*24)));   /* 只留十五天（配角十四天一則要看得到前一則；畫面只顯示七天）；出遊途中貼的從回來那一刻算、跳時間的從停下來那一刻算 */
    return n; };
  /* ---------- 畫面 ---------- */
  S.visible=function(G){ const R=S.rec(G), now=nowOf(G); return R.items.filter(i=>S.live(G,i,now)).sort((a,b)=>abs(b.day,b.h)-abs(a.day,a.h)); };   /* S.live：七天；出遊途中貼的從回來那一刻起七天 */
  S.newCount=function(G){ if(!G||!G.flags) return 0; const R=S.rec(G); return S.visible(G).filter(i=>abs(i.day,i.h)>R.seen).length; };
  S.markSeen=function(G){ const R=S.rec(G); for(const i of S.visible(G)) R.seen=Math.max(R.seen,abs(i.day,i.h)); };
  S.name=(G,id)=>typeof PHONE!=='undefined'&&PHONE.title?PHONE.title(G,'p:'+id):((typeof CHARACTERS!=='undefined'&&CHARACTERS[id]&&CHARACTERS[id].name)||id);
  const hhmm=h=>{ const x=((h%24)+24)%24, H=Math.floor(x+1e-6), M=Math.round((x-H)*60); return String(M===60?H+1:H).padStart(2,'0')+':'+String(M===60?0:M).padStart(2,'0'); };
  S.whenText=function(G,day,h){ const today=G.day+Math.floor((+G.hour||0)/24), d=CALENDAR.dateOf(day); return (day===today?'今天':(day===today-1?'昨天':d.m+'/'+d.d))+' '+hhmm(h); };
  S.dmOk=(G,p)=>!!p.dm&&(!p.dmIf||!!(S.COND[p.dmIf]&&S.COND[p.dmIf](G)));
  const HINT='<div style="font-size:12px;opacity:.75;line-height:1.3;margin-top:2px">';
  S.pic=(G,p,v)=>String(S.txt(p.pic,v)==null?'':S.txt(p.pic,v)).replace('{name}',(G&&G.name)||'祐廷');   /* 照片裡的 {name}＝玩家的名字（AA_506 以安第 7 則「京都：」後面是你的名字）*/
  S.card=function(G,it){ const p=S.post(it.id); if(!p) return ''; const nm=S.name(G,p.who), pic=S.pic(G,p,it.v);
    let h='<div class="item feedItem"><div class="phrow"><b>'+esc(nm)+'</b><span class="muted">'+esc(S.whenText(G,it.day,it.h))+'</span></div><div class="feedPic">（照片：'+esc(pic)+'）</div>'+(p.say?'<div>'+esc(S.txt(p.say,it.v))+'</div>':'');   /* 她的一句也可以分兩版（AA_508 以安第 4 則：日本路線「三個了。」，ce6e87a99）*/
    const says=L=>L.slice(1).map(r=>S.txt(r,it.v)).filter(x=>x!=null&&x!=='');   /* 兩個版本句數不同：沒有的那一版是 ''（子晴大三下第 3 則）*/
    if(!it.r){ const B=['<button class="btn" data-fd="'+esc(it.id+'|heart')+'">（按愛心）</button>'];
      if(p.cm) B.push('<button class="btn" data-fd="'+esc(it.id+'|cm')+'">'+esc(S.txt(p.cm[0],it.v))+'</button>');
      if(S.dmOk(G,p)) B.push('<button class="btn" data-fd="'+esc(it.id+'|dm')+'">（私訊問一句）'+HINT+esc(S.txt(p.dm[0],it.v))+'</div></button>');
      h+='<div class="row2" style="gap:6px;margin-top:6px;flex-wrap:wrap">'+B.join('')+'</div>'; }
    else if(it.r==='heart') h+='<div class="muted" style="margin-top:6px">♥ 你按了愛心。</div>';
    else { const L=it.r==='cm'?p.cm:p.dm; h+='<div style="margin-top:6px"><div class="muted">'+(it.r==='cm'?'你留言：':'你私訊問：')+esc(S.txt(L[0],it.v))+'</div>'+says(L).map(x=>'<div><b>'+esc(nm)+'</b>：'+esc(x)+'</div>').join('')
      +'<button class="btn" style="margin-top:6px" data-msg="'+esc(p.who)+'">看私訊</button></div>'; }
    return h+'</div>'; };
  S.html=function(G){ if(!G) return ''; S.rec(G); const L=S.visible(G); S.markSeen(G);
    if(!L.length) return '<div class="item muted">最近七天沒有動態。</div>';
    return '<div class="list">'+L.map(it=>S.card(G,it)).join('')+'</div><div class="item muted" style="margin-top:8px">動態只留七天。</div>'; };
  /* 私訊對話串裡，回動態的那一句標是哪一則（game3d.js threadHTML）*/
  S.refLabel=function(G,m){ if(!m||!m.fd) return ''; const p=S.post(m.fd); if(!p) return ''; const it=S.rec(G).items.find(i=>i.id===m.fd); const s=S.txt(p.say,it&&it.v)||('照片：'+S.pic(G,p,it&&it.v));
    return ' · 動態「'+esc(s.length>14?s.slice(0,13)+'…':s)+'」'; };
  /* ---------- 回應 ---------- */
  S.fam=function(G,id){ if(typeof SOCIAL==='undefined'||!SOCIAL.activity) return null; if(SOCIAL.ACT&&!SOCIAL.ACT.feed) SOCIAL.ACT.feed={fam:1}; return SOCIAL.activity(id,'feed'); };
  S.respond=function(G,id,kind){ if(!G||!['heart','cm','dm'].includes(kind)) return null; const R=S.rec(G), it=R.items.find(i=>i.id===id), p=S.post(id); if(!it||!p||it.r) return null;
    if(!S.live(G,it)) return null; if(kind==='cm'&&!p.cm) return null; if(kind==='dm'&&!S.dmOk(G,p)) return null;   /* 畫面上看得到的才能回（出遊途中貼的照 S.live 多留）*/
    it.r=kind; const out=[];
    if(kind!=='heart'&&typeof PHONE!=='undefined'){ const L=kind==='cm'?p.cm:p.dm, th='p:'+p.who; const m=PHONE.post(G,{th,from:'player',who:null,text:S.txt(L[0],it.v)}); m.fd=id; m.fk=kind; out.push(m);
      for(const r of L.slice(1)){ const tx=S.txt(r,it.v); if(tx) out.push(PHONE.post(G,{th,from:p.who,text:tx})); }
      if(PHONE.markSeen) PHONE.markSeen(G,th); }   /* 她的回覆動態頁上就看得到：不再算未讀 */
    S.fam(G,p.who); return {item:it,out}; };
  /* ---------- 私訊的回覆：可昕的視訊、隔天中午才回 ---------- */
  S.onAnswer=function(G,m,o){ const id=m&&m.ask&&m.ask.id; if(!id||id.indexOf('aa503_')!==0||!o) return; const d=S.dmOf(id.slice(6)); if(!d) return; const R=S.rec(G);
    if(o.video&&typeof OUT!=='undefined'&&OUT.plan){ const w=S.whenLoc(G,o.video,d.term); if(w) OUT.plan(G,{id:'aa503_kx_video',ev:'ev_kexin_video_report',day:w.day,h:w.h,place:'視訊',title:'可昕的視訊：熬夜做報告',verb:'接起來',no:'今天先不要',travel:'',travelH:0,back:'視訊結束。'}); }
    if(o.out&&typeof OUT!=='undefined'&&OUT.plan){ const w=S.whenLoc(G,o.out.at,d.term); if(w){ const x=Object.assign({},o.out,{day:w.day,h:w.h}); delete x.at; OUT.plan(G,x); } }   /* 排一趟出遊（語彤「好。」→ 8/22 21:00 麵店的 2D 短場）*/
    if(o.hold){ const w=S.whenLoc(G,o.hold,d.term); if(w) (R.hold||(R.hold={}))[d.q.who]=abs(w.day,w.h); } };
  /* 語彤雙主修放榜（AA_504 3-2）：7/3 那則私訊傳了以後，第一次在麵店點餐——阿姨一句、那一碗不用錢（story3d.js 的 noodleScene 問 S.ytTreatDue、說完叫 S.ytTreatDone）*/
  S.ytTreatOf=()=>{ for(const s of SETS()) if(s.ytTreat) return s.ytTreat; return null; };
  S.ytTreatDue=function(G){ const T=S.ytTreatOf(), R=G&&G.flags&&G.flags.FEED; return !!(T&&R&&R.dm&&R.dm[T.after]==='sent'&&!R.ytTreat); };
  S.ytTreatDone=function(G){ const R=S.rec(G); R.ytTreat=G.day; };
  /* 語彤 2027-07-09 生日（AA_506 3-2 第 4 點；那一份的 ytBday）：照 home3d.js 2026、r2y3b3d.js 2028 那兩則——12:00、當天 24:00 以前（睡過整天就沒有）；
     麵店團群組 Alison「今天語彤生日！」；不在群組、和語彤 FAMILIAR 以上＝她的私訊放系統字；按鈕「傳一句生日快樂」→ 她回、記 flag */
  S.ytBdayTick=function(G){ if(typeof PHONE==='undefined'||!PHONE.at||!PHONE.sent) return; const now=nowOf(G);
    for(const s of SETS()){ const B=s.ytBday; if(!B) continue; const d=dayOfKey(B.day); if(d==null||now<abs(d,B.h)||now>=abs(d+1,0)||PHONE.sent(G,B.tag)) continue;
      const reply={from:'heroine_03',text:B.reply}, opt={t:B.opt,post:B.post,say:[reply],set:{[B.flag]:true}};
      if(PHONE.inGroup&&PHONE.inGroup(G,'noodle_team')) PHONE.at(G,d,B.h,[{th:'g:noodle_team',from:'yu',text:B.group,ask:{id:B.tag,until:abs(d+1,0),opts:[Object.assign({},opt,{say:[Object.assign({th:'g:noodle_team'},reply)]})]}}],B.tag);
      else if(S.atLeast('heroine_03','FAMILIAR')) PHONE.at(G,d,B.h,[{th:'p:heroine_03',text:B.sys,ask:{id:B.tag,until:abs(d+1,0),opts:[opt]}}],B.tag); } };
  S.holdAt=(G,id)=>{ const R=G&&G.flags&&G.flags.FEED, hd=R&&R.hold&&R.hold[id]; return hd!=null&&nowOf(G)<hd?hd:null; };
  /* 可昕的視訊（9-2 第 3 點）：照現有視訊讀書（ev_kexin_video_study）那一套——讀哪一科、兩個小時算兩次自學；台詞只有開頭、結尾那兩句 */
  S.VIDEO_EV=(function(){ const V=(typeof FEED_Y1S1!=='undefined'&&FEED_Y1S1.video)||{}; const base=()=>typeof STORY_EVENTS!=='undefined'?STORY_EVENTS.find(e=>e.id==='ev_kexin_video_study')||null:null;
    return { id:'ev_kexin_video_report', title:'熬夜做報告', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
      beforeOuting:async(G,GM)=>{ const b=base(); if(b&&b.beforeOuting) await b.beforeOuting(G,GM); },
      afterOuting:async(G,GM)=>{ const b=base(); if(b&&b.afterOuting) await b.afterOuting(G,GM); },
      dialogue:[ {scene:'視訊',bg:'video'}, {speaker:'kexin',expression:'neutral',text:V.start}, {speaker:'kexin',expression:'neutral',text:V.end} ] }; })();
  /* ---------- 接線 ---------- */
  if(typeof STORY_EVENTS!=='undefined'&&!STORY_EVENTS.some(e=>e.id===S.VIDEO_EV.id)) STORY_EVENTS.push(S.VIDEO_EV);
  if(typeof STORY_EVENTS!=='undefined') for(const s of SETS()) for(const e of s.events||[]) if(!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e);   /* 那一份的事件（AA_508 語彤 8/22 問阿姨的 2D 短場）*/
  /* 閒聊階梯選了哪一句（那一份的 ladSet：{層 id:{選項的字:{旗標:值}}}）：ladder.js 這一層不分選項記，包住 STORY.ladPlay——選項照原本的 GM.choose，選到那一句就寫進 G.flags。
     story3d.js 自己的 S.ladderTalk、OUT.go 都是叫 STORY.ladPlay（同一個物件），一起經過這裡 */
  S.ladSet=id=>{ for(const s of SETS()) if(s.ladSet&&s.ladSet[id]) return s.ladSet[id]; return null; };
  if(typeof STORY!=='undefined'&&typeof STORY.ladPlay==='function'&&!STORY._feedLad){ const lp=STORY.ladPlay;
    STORY.ladPlay=function(GM,who,id,st){ const W=st&&S.ladSet(st.id); if(!W||!GM||typeof GM.choose!=='function') return lp.apply(this,arguments);
      const P=Object.create(GM); P.choose=async function(o){ const k=await GM.choose(o); const c=Array.isArray(o)?(o[k]||o[0]):null, set=c&&W[c.t];   /* ladPlay 也是 CH[k]||CH[0] */
        if(set&&GM.G&&GM.G.flags) Object.assign(GM.G.flags,set); return k; };
      return lp.call(this,P,who,id,st); };
    STORY._feedLad=true; }
  if(typeof SOCIAL!=='undefined'&&SOCIAL.ACT&&!SOCIAL.ACT.feed) SOCIAL.ACT.feed={fam:1};   /* 回動態：熟悉 +1（同一個人一天一次）*/
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.tick(G));
  /* 畢業以後篇跳時間（AA_511 第 0 節第 1 點）：PG.jumpTo 那一段＝跳的途中（PG.advance 叫的是 PG 自己的 S.jumpTo＝同一個屬性，包了也會經過這裡）；
     最後一則動態當停點（S.pgStop，PG.stops 是給其他模組加停點的掛勾）*/
  if(typeof PG!=='undefined'&&typeof PG.jumpTo==='function'&&!PG._feedJump){ const j0=PG.jumpTo; PG.jumpTo=function(){ S.pgJumping++; try{ return j0.apply(this,arguments); } finally { S.pgJumping--; } }; PG._feedJump=true; }
  if(typeof PG!=='undefined'&&Array.isArray(PG.stops)&&!PG.stops.some(f=>f&&f._feed)){ const f=G=>S.pgStop(G); f._feed=true; PG.stops.push(f); }
  if(typeof PHONE!=='undefined'&&Array.isArray(PHONE.ON_ANSWER)) PHONE.ON_ANSWER.push((G,m,o,k)=>S.onAnswer(G,m,o,k));
  /* 子晴 zq_name 回了（phone3d.js 回 need 選項時叫 STORY.neededAnswered）：記 ZQ_NAME_REPLIED（大二下第 6 則兩個版本，S.WENT.zqNamed）*/
  if(typeof STORY!=='undefined'&&typeof STORY.neededAnswered==='function'&&!STORY._feedNeed){ const on=STORY.neededAnswered; STORY.neededAnswered=function(G,m,o){ if(o&&o.need==='zq_name'&&G&&G.flags) G.flags.ZQ_NAME_REPLIED=true; return on.apply(this,arguments); }; STORY._feedNeed=true; }
  if(typeof MSG!=='undefined'&&typeof MSG.replyAt==='function'&&!MSG._feedHold){ const r0=MSG.replyAt; MSG.replyAt=function(G,id){ const r=r0.apply(this,arguments); const hd=S.holdAt(G,id);
      if(hd!=null&&r&&r.day!=null&&abs(r.day,r.h)<hd){ const d=Math.floor(hd/24); return Object.assign({},r,{day:d,h:hd-d*24,late:false,after:true}); } return r; }; MSG._feedHold=true; }
  return S;
})();
