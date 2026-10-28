/* ===== 法律系大一逐週補空白（AA_347，AA-C 2026-10-21 定稿 83f130c0；全部第①級、已批准；任務 AA347-Y1-COVER-1021）=====
   台詞照 AA_347 一字不改（Y1FILL_LINES）；用事件系統演的段落在 Y1FILL_EVENTS。手機、時間窗、房間的紙箱、寒流日、手機小事、摘要日的接線在 src/y1fill3d.js。
   1-1 ev_kai_tape（10/27 22:30 起第一次在宿舍房間；當天沒回＝10/28 晚上；10/29 以後不演）、ev_kai_tape2（10/30 18:00 以後第一次回房間；第一晚有演的才有）
   1-2 ev_y1_relay（11/21 10:00 田徑場：11/20 群組回了「去。」的出遊）
   2-1 ev_y1w_noodle_last（2/7 18:00 麵店：2/6 群組回了「去。」的出遊）
   5-1 ev_y1_cold_box_glad（12/8 寒流第一次醒來，拆過紙箱）、ev_y1_cold_box_night（沒拆：12/8 晚上在宿舍睡，12/9 醒來）——由 y1fill3d.js 叫（trigger 'manual'）
   測試：node tests/aa347_y1_unit.js */
'use strict';
const Y1FILL_LINES={
  /* 1-2 第 12 週：運動會（11/21 停課）。11/20（四）21:00 麵店團群組；「去。」＝11/21 10:00 田徑場；「不去。」或沒回＝11:40 群組 */
  relayAsk:[['zhe','明天運動會'],['zhe','系上大隊接力 我跑第三棒'],['zhe','來看']],
  relayPhoto:[['zhe','📷（獎狀：大隊接力第五名）'],['yu','第五名有獎狀喔'],['zhe','有 參加獎等級的那種']],
  relayMiss:['你沒來','下次系籃要來喔'],   /* AA_350 O4（AA-C 10-21 12:1x）：沒去運動會的，12:10 阿哲私訊；不扣好感 */
  /* 1-3 第 13 週：期末範圍。11/26（三）22:10 麵店團群組 */
  finalScope:[['yu','期末範圍公布了'],['yu','憲法考到第八講'],['classmate_bohan','第九講。投影片最後一頁有寫。'],['yu','……謝謝柏翰'],['zhe','（貼圖：一隻趴在桌上的狗）']],
  /* 2-1 寒假第 7 週：2/5 摘要日；2/6（五）21:00 麵店團群組（接 AA_333 2/10 起的店休）*/
  sum0205:'（寒假第七週。你把大一上的筆記裝進一個紙箱，箱子外面寫「大一上」。比你想的重。）',
  noodleLastAsk:[['heroine_03','下禮拜二開始店休，到初三。'],['heroine_03','要吃的這個週末來。']],
  /* 3-1 大一下第 9 週：期中考完。4/24（五）21:30 麵店團群組 */
  midDone:[['yu','期中考完的人 舉手'],['zhe','🙋'],['classmate_bohan','我還有一科。'],['yu','柏翰 那你為什麼在這裡'],['classmate_bohan','……我去念書了。']],
  /* 3-2 大一下的手機小事（新的一批，term Y1S2）：[說話的人, 字]。kaiApp2＝兩週後同一則的後半（BB_70 F-K3）*/
  dp:{
    kevin_parrot:[['kevin','考古題資料夾我整理了一個晚上 發現有一份是我大一自己寫錯的答案 已刪除']],   /* AA_497 5-4：Kevin 的動物影片第 5 則（照原本的日期）換成他自己的事第 3 則；跟著鸚鵡影片的學姊「七八五十六。」拿掉 */
    yu_curry:[['yu','📷（學生餐廳的咖哩飯，飯比咖哩多很多）'],['yu','這個比例是違憲的'],['classmate_bohan','比例原則不是這樣用的。'],['yu','我知道 我在用']],
    zhe_three:[['zhe','系籃練習 今天投進三顆'],['zhe','三十顆裡面'],['yu','進步了']],
    bohan_closed:[['classmate_bohan','總圖十點關。'],['classmate_bohan','我被趕出來了。'],['zhe','你根本住那裡吧']],   /* AA_373 #19：總圖十點關（y1fill3d.js 22:10）*/
    an_ac:['總圖三樓的冷氣壞了。','我換到二樓。……二樓的也壞了。'],
    yt_board:['📷（麵店門口的黑板，今天的小菜寫錯一個字）','阿姨說不要改。客人看得懂。'],
    xinci_drama:['最近在追《檔案室的燈》。','第三集有一個律師講錯了一條。','……我還是會看完。'],   /* 《檔案室的燈》是虛構的劇名（AA_347）*/
    kaiApp1:['我做了一個 App','宿舍洗衣機排隊用的','你下載一下 拜託'],
    kaiApp2:['目前使用者：五人','我 你 還有三個我不認識的'] },
  /* 4-1 暑假第 7～11 週：7/29 摘要日（照住哪裡分）、8/18（二）21:00 麵店團群組、8/25 摘要日 */
  sum0729:{dorm:'（七月底。宿舍的走廊只開一半的燈。）',home:'（七月底。你陪媽媽去了一趟大賣場，推車是你推的。）'},
  stillTaipei:[['yu','暑假還在臺北的 舉手'],['classmate_bohan','新竹。'],['yu','你那個不叫舉手']],
  sum0825:'（暑假剩兩個禮拜。你先把大二上的兩本課本買了。比大一的厚。）',   /* AA_369 L6：8/25 離開學（9/7）還有兩個禮拜 */
  /* 5-1 AA_12 主線 1「冬天的衣服」紙箱：房間物件（label 是介面字）；寒流日 12/8 兩版 */
  box:{label:'床底下的紙箱',look:'（床底下的紙箱。上面是媽媽的字：「冬天的衣服」。）',opts:['拆。','先不拆。'],open:'（你把外套掛進衣櫃。紙箱摺好，塞回床底下。）'},
  boxColdOpen:'（寒流來了。你終於把床底下的紙箱拆了。外套有一股衣櫃的味道。）',   /* AA_350 O5：12/8（寒流那天）當天才拆的，「拆。」換這句；12/9 那句不演 */
  cold:{glad:'（寒流來了。你從衣櫃拿出外套。……幸好那天拆了。）',night:'（半夜被冷醒。你蹲在床邊拆那個紙箱，膠帶黏得很緊。）',kai:'（從被子裡）……你九月到現在都沒拆喔。'} };
const Y1FILL_EVENTS=(function(){
  const D=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const T=(d,h)=>d*24+h, now=G=>G.day*24+G.hour;
  const roommate=G=>typeof STORY==='undefined'||!STORY.kaiRoommate||STORY.kaiRoommate(G);   /* 大一同房（阿凱是室友）*/
  /* 1-1 第一晚：10/27（一）22:30 起；當天沒回宿舍的＝隔天（10/28）晚上 18:00 以後；10/29 以後才回來的就不演（熬夜過了午夜 G.day 還是前一天、G.hour 超過 24）*/
  const tapeWin=G=>{ const d=D('2025-10-27'); if(d==null) return false; const t=now(G); if(t<T(d,22.5)||t>=T(d+1,27)) return false; return !(G.day===d+1&&G.hour<18); };
  /* 1-1 三天後：10/30（四）18:00 以後第一次回房間；期中考那一週的晚上（到 11/2 週日晚上）*/
  const tape2Win=G=>{ const d=D('2025-10-30'); if(d==null) return false; const t=now(G); if(t<T(d,18)||t>=T(d+3,27)) return false; const hh=((G.hour%24)+24)%24; return hh>=18||hh<3; };
  const tapeDone=G=>!!(G.events&&G.events.done&&G.events.done.ev_kai_tape)||!!(G.flags&&G.flags.KAI_TAPE);
  const L=Y1FILL_LINES;
  return [
    /* ---------- 1-1 第 9 週：阿凱的國界（F-K1，BB_70 4-6；擺法照 AA_209：繞他自己那組床桌一圈）。記 KAI_TAPE（rel_lines.js 好朋友兩句、BB_96 11-1 的回顧讀它）---------- */
    { id:'ev_kai_tape', title:'阿凱的國界', participants:['kai'], location:'dorm', trigger:'enter', once:true, background:'blur',
      prereq:{custom:G=>roommate(G)&&tapeWin(G)},
      dialogue:[ {speaker:null,text:'（阿凱蹲在地上，用紙膠帶繞著他那組床和書桌貼了一圈。）'},
        {speaker:'kai',text:'期中考週。這裡是國界。'},
        {speaker:'kai',text:'……過了這條線要安靜。我在寫作業。'},
        {choice:[{text:'「好。」',goto:'ok'},{text:'「那我的零食還在你桌上。」',goto:'snack'}]},
        {label:'ok'},{speaker:'kai',text:'謝謝配合。'},{goto:'end'},
        {label:'snack'},{speaker:'kai',text:'……入境申請另外辦。'},
        {label:'end'} ],
      consequences:{flags:{KAI_TAPE:true}} },
    { id:'ev_kai_tape2', title:'阿凱的國界', participants:['kai'], location:'dorm', trigger:'enter', once:true, background:'freeze', portraitLater:true,   /* 開場鏡頭貼近地上的膠帶、不模糊、不擺立繪，讀得到「法律系免簽」（UX-KAI-TAPE-CAM-1021）*/
      shot:GM=>typeof Y1FILL!=='undefined'&&Y1FILL.tapeShot?Y1FILL.tapeShot(GM):null,
      prereq:{custom:G=>roommate(G)&&tapeDone(G)&&tape2Win(G)&&(typeof Y1FILL==='undefined'||!Y1FILL.tapeReady||Y1FILL.tapeReady())},   /* 膠帶的模型載好才演（讀檔後第一次進門：交給 Y1FILL.tick，最多等 12 秒）*/
      dialogue:[ {speaker:null,text:'（膠帶上多了一行麥克筆的大字：「法律系免簽」。）'},
        {speaker:'kai',text:'（沒有回頭）期中考完了。國界放寬。'} ] },
    /* ---------- 1-2 運動會：11/21 10:00 田徑場（2D：校園一般背景＋字幕「田徑場」）---------- */
    { id:'ev_y1_relay', title:'運動會', participants:['zhe'], location:'any', trigger:'outing', once:true, background:'dark',
      dialogue:[ {scene:'田徑場',bg:'ntu_avenue'},
        {speaker:null,text:'（大隊接力。阿哲接棒的時候掉了一次，撿起來，還是追過了一個人。法律系第五名。）'},
        {speaker:'zhe',text:'第五名耶！'},
        {speaker:null,text:'（他舉著獎狀跑過來，比拿第一名的人還開心。）'} ],
      after:G=>{ G.flags.Y1_RELAY='went'; } },
    /* ---------- 2-1 店休前的麵店：2/7（六）18:00 ---------- */
    { id:'ev_y1w_noodle_last', title:'阿鳳麵店', participants:[], location:'any', trigger:'outing', once:true, background:'dark',
      dialogue:[ {scene:'阿鳳麵店・長桌',bg:'noodle_table'},
        {speaker:null,text:'（過年前最後一個週末。長桌只坐了三個人，阿姨多給每個人一顆滷蛋，說是提早發的紅包。）'} ],
      after:G=>{ G.flags.Y1W_NOODLE_LAST='went'; } },
    /* ---------- 5-1 寒流日（STORY.firstColdDay，大一上第 15 週週一 12/8）：y1fill3d.js 在醒來的那一刻叫 ---------- */
    { id:'ev_y1_cold_box_glad', title:'冬天的衣服', participants:[], location:'dorm', trigger:'manual', once:true, background:'blur',
      dialogue:[ {speaker:null,text:L.cold.glad} ] },
    { id:'ev_y1_cold_box_night', title:'冬天的衣服', participants:['kai'], location:'dorm', trigger:'manual', once:true, background:'blur',
      dialogue:[ {speaker:null,text:L.cold.night},{speaker:'kai',text:L.cold.kai} ] } ];
})();
/* 1-1 的兩個是進房間（enter）的事件：放在最前面，進門的時候比同一個晚上的其他宿舍事件（例：ev_dorm_late_kai「我這個 bug 追到第三小時」）先演；其他照順序接在後面 */
for(const e of Y1FILL_EVENTS.slice().reverse()){ if(STORY_EVENTS.some(x=>x.id===e.id)) continue; if(e.trigger==='enter') STORY_EVENTS.unshift(e); }
for(const e of Y1FILL_EVENTS){ if(!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e); }
