/* ===== AA_442（AA-B 2026-10-24 定稿，企劃線 d94d259ec；第①級、D109）第 1、2 節 =====
   第 1 節：住家裡的時候，週四 20:00 的家人群組換成「住家裡版」H1～H6（不問、不用回、爸爸不傳「？」）；日本路線 3/23（四）那一則換成三句。
   第 2 節：日本路線出發前（2028-02-20～03-24，住臺北的家、沒有修課）：兩種存檔都有的（2-1）、交往中九點的日文電話（2-2，AN_JP_CALL）、挽回中和沒打電話的平日（2-3）。
   台詞照 AA_442 一字不改（JPPREP_LINES）；用事件系統演的段落在 JPPREP_EVENTS（JP.SCH 的一列演、3/1 行前說明會是出遊）。接線在 src/jpprep3d.js。
   第 3 節（學姊 3/22 那一句的日子）LAWWW 已經改了（src/data/sis_jp_events.js 的 hint），這裡不重複。
   測試：node tests/aa442_jpprep_unit.js */
'use strict';
const JPPREP_LINES={
  /* ---------- 第 1 節 住家裡版（照 G.day/7 每週輪一則）：[誰, 字]；dad＝爸爸、mom＝媽媽、sister＝宜蓁 ---------- */
  HOME_GROUP:[
    [['dad','（照片：一個便當，旁邊一罐啤酒）'],['mom','少喝一點']],
    [['sister','（照片：一疊校樣，最上面那張畫滿紅字）'],['sister','這週又加班'],['mom','記得吃飯']],
    [['mom','（長輩圖：週末愉快 天天開心）']],
    [['dad','家裡的熱水器 上次說要換的 換了沒'],['mom','你兒子在家 叫他去問']],
    [['dad','（照片：工地，一排鋼筋排得很整齊）'],['dad','這批做得好'],['sister','爸 這是第幾張鋼筋了']],
    [['sister','媽 下個月我回去一趟'],['mom','好 我煮妳愛吃的'],['dad','（讚）']] ],
  JP_0323:[['dad','禮拜六的飛機？'],['mom','早上'],['dad','到了在群組說一聲']],   /* 日本路線 3/23（四）那一則 */

  /* ---------- 2-1 兩種存檔都有的 ---------- */
  d0221:{narr:'（大三下開學第一天。你不用去學校。）',mom:'你在家正好。客戶換了一套新的記帳軟體，你教我。',end:'（教了一個早上。她學會了。換你看不懂她的分類。）'},
  d0225:'出國交換行前說明會：3/1（三）14:00，國際事務處。',
  d0226:{narr:'（連假第一天。媽媽拉你去大賣場，推了一整車要帶去日本的東西。）',mom:'日本的藥很貴。',end:'（結帳的時候，車裡有三盒感冒藥、一條痠痛藥膏、一大包你不吃的海苔。）'},
  d0301:{room:'（國際事務處的會議室，坐滿了要出國的人。投影片寫著「出國交換行前說明」。）',ins:'（講者講了三次：「保險一定要保。」）',
    dating:'（以安坐在你旁邊，每一頁都拍照。保險那一頁，她拍了兩張。）',repair:'（以安坐在第一排。你坐在最後面。散會的時候，她先走了。）'},
  d0304:{ms:['你房間那箱書 我下個月回去拿','你不在 我自己進去喔'],opts:[['好。','（OK 的貼圖）'],['不要動我的桌子。','我只動書']]},
  d0305:[['yu','日本回來要帶什麼給我們！'],['classmate_xinci','他們還沒出發欸'],['zhe','抹茶口味的 什麼都可以'],['heroine_01','記下來了。']],
  d0308:'（簽證要的照片。相館的老闆說：「不要笑。」你就沒有笑。）',
  d0310:'出國交換的學分抵免申請表，請於出發前交到系辦。',
  d0312:{mom:'行李箱打開給我看。',end:'（她把你摺好的衣服全部拿出來，重新摺了一次。放回去的時候，多了兩包暖暖包。）'},
  d0314:{narr:'（日本台灣交流協會的櫃台。護照拿回來，裡面多了一頁簽證。）',dating:'（以安的號碼在你後面三號。她拿到護照，先翻到簽證那一頁，看名字的拼法對不對。）'},
  d0317:{narr:'（系辦的助教翻了一下你的抵免表。）',ta:'必修抵不了喔。選修的可以。',opts:[['好。','那就這樣，我收了。'],['那回來要補修？','大部分的人都延一學期。']]},
  d0318:'（你把書架上的書收進紙箱，留了一排沒收。姊姊說過要回來拿書。）',
  d0319:{narr:'（家人群組的視訊。爸爸的鏡頭後面是上海的辦公室，姊姊那邊在台南，媽媽擠在你旁邊。）',lines:[['爸爸','日本。……那邊的建材做得很細。你看到了拍給我。'],['宜蓁','爸，他是去讀書。'],['爸爸','讀書也會經過工地。']]},
  d0321:{mom:'禮拜六的飛機，幾點？',opts:['早上。','妳不用送。'],morning:['那我五點起來。','（你說不用。她說她本來就五點起來。）'],nosend:'我沒有要送。我要煮早餐。'},

  /* ---------- 2-2 交往中：九點的日文電話 ---------- */
  callAsk:{ms:['出發前，平日晚上講十分鐘日文。','電話。九點。連假完開始。'],opts:[['好。','好。',true],['十分鐘夠嗎？','不夠再加。',true],['我自己練就好。','好。',false]]},
  /* [日期, 旁白, 以安（沒有＝null）] */
  CALLS:[
    ['2028-02-29','（九點。電話一接通，她就開始講日文。你聽懂了「今天」和「天氣」。）','你要出聲。電話裡我看不到你點頭。'],
    ['2028-03-03','（今天練自我介紹。你講到「法學部」，她停了一下。）','發音對。……繼續。'],
    ['2028-03-07','（你們練到市役所登記住址。她扮櫃台，講得很快。）','到時候真的會這麼快。'],
    ['2028-03-08','（十分鐘到了。她說了「じゃあね」，又用中文多講了兩分鐘：她的行李箱輪子還是會卡。）',null],
    ['2028-03-14','（今天換你出題。你問她到日本最想吃什麼。她用日文講了一個很長的名字。）','……親子丼。我講得比較正式而已。'],
    ['2028-03-15','（電話那頭有翻頁的聲音。她一邊講日文，一邊在手帳上寫字。）','我在寫要帶的東西。你繼續，我在聽。'],
    ['2028-03-17','（你講錯一個助詞。她等你講完才說：）','「で」。在哪裡做什麼，用「で」。'],
    ['2028-03-21','（說好十分鐘，今天講了二十分鐘。）','……超過了。明天繼續。'],
    ['2028-03-22','（最後一次日文電話。掛之前，她換回中文。）','後天麵店見。'] ],
  bag:{ms:['（照片：攤開的行李箱，東西分成一格一格）','好了。你的呢？'],notyet:'還沒。',notyetSay:'明天收。收完拍給我。',done:'好了。',doneSay:['照片。','（你拍了一張傳過去。）','……充電器呢？']},

  /* ---------- 2-3 挽回中，還有沒打電話的交往中 ---------- */
  rep0311:'（你一個人去公館買行李箱。店員推薦最貴的那個，你買了第二便宜的。）',
  MORNINGS:[
    ['2028-02-29','（你在網路上查宿舍附近有什麼。地圖放到最大，看得到一家便利商店和一片田。）'],
    ['2028-03-03','（下午，你去總圖把借的書全部還了。櫃台的人問：「出國喔？」）'],
    ['2028-03-07','（媽媽在客廳記帳。你坐在旁邊讀日文。兩個人一個下午沒有說話。）'],
    ['2028-03-15','（晚上，你把日文課本的最後一課念完了。明天再從第一課開始。）'],
    ['2028-03-22','（你一個人去麵店吃了一碗麵。阿姨問你去多久，你說到八月。她說：「那回來第一碗算我的。」）'] ]
};
const JPPREP_EVENTS=(function(){
  const X=JPPREP_LINES;
  const F=G=>(G&&G.flags)||{};
  const dat=G=>{ const f=F(G), R=f.romance||{}; return f.dating_heroine_01===true||!!(R.heroine_01&&R.heroine_01.status==='dating'); };   /* 同 jp3d.js：日本路線只有交往中、挽回中 */
  /* 沒有標題的小場景：EVENTS.run 會把事件 id 記進日誌（GM.memo(ev.title||ev.id)）——演完拿掉那一筆（同 vacfill_events.js）*/
  const noMemo=(id,f)=>(G,GM,n)=>{ const M=G&&G.memo; if(Array.isArray(M)&&M.length&&M[M.length-1]&&M[M.length-1].t===id) M.pop(); if(f) f(G,GM,n); };
  const ev=(id,dialogue,o)=>Object.assign({id,title:'',participants:[],location:'any',trigger:'manual',once:true,background:'dark',dialogue,after:noMemo(id)},o||{});
  const choice=(opts,labels)=>({choice:opts.map((t,i)=>({text:'「'+t+'」',goto:labels[i]}))});
  const L=[
    ev('ev_jpp_0221',[ {scene:'臺北的家'}, {speaker:null,text:X.d0221.narr}, {speaker:'媽媽',name:'媽媽',text:X.d0221.mom}, {speaker:null,text:X.d0221.end} ]),
    ev('ev_jpp_0226',[ {scene:'大賣場',bg:'dark'}, {speaker:null,text:X.d0226.narr}, {speaker:'媽媽',name:'媽媽',text:X.d0226.mom}, {speaker:null,text:X.d0226.end} ]),
    /* 3/1 行前說明會：一鍵的出遊（2D）*/
    ev('ev_jpp_0301',[ {scene:'國際事務處',bg:'dark'}, {speaker:null,text:X.d0301.room}, {speaker:null,text:X.d0301.ins},
      {if:{custom:G=>dat(G)},speaker:null,text:X.d0301.dating}, {if:{custom:G=>!dat(G)},speaker:null,text:X.d0301.repair} ],{title:'出國交換行前說明會',trigger:'outing',hours:2,after:undefined}),
    ev('ev_jpp_0312',[ {scene:'臺北的家'}, {speaker:'媽媽',name:'媽媽',text:X.d0312.mom}, {speaker:null,text:X.d0312.end} ]),
    ev('ev_jpp_0314',[ {scene:'日本台灣交流協會',bg:'dark'}, {speaker:null,text:X.d0314.narr}, {if:{custom:G=>dat(G)},speaker:null,text:X.d0314.dating} ]),
    ev('ev_jpp_0317',[ {scene:'系辦',bg:'dark'}, {speaker:null,text:X.d0317.narr}, {speaker:'助教',name:'助教',text:X.d0317.ta},
      choice(X.d0317.opts.map(o=>o[0]),['a','b']),
      {label:'a'},{speaker:'助教',name:'助教',text:X.d0317.opts[0][1]},{goto:'e'},
      {label:'b'},{speaker:'助教',name:'助教',text:X.d0317.opts[1][1]},
      {label:'e'} ]),
    ev('ev_jpp_0319',[ {scene:'臺北的家'}, {speaker:null,text:X.d0319.narr}, ...X.d0319.lines.map(([s,t])=>({speaker:s,name:s,text:t})) ]),
    ev('ev_jpp_0321',[ {scene:'臺北的家'}, {speaker:'媽媽',name:'媽媽',text:X.d0321.mom},
      choice(X.d0321.opts,['a','b']),
      {label:'a'},{speaker:'媽媽',name:'媽媽',text:X.d0321.morning[0]},{speaker:null,text:X.d0321.morning[1]},{goto:'e'},
      {label:'b'},{speaker:'媽媽',name:'媽媽',text:X.d0321.nosend},
      {label:'e'} ]) ];
  /* 2-2 九個晚上 21:00 的日文電話（2D 電話、一段旁白、最多一句以安；時間過 10 分鐘）*/
  for(const [k,narr,an] of X.CALLS){ const id='ev_jpp_call_'+k.slice(5).replace('-','');
    L.push(ev(id,[ {scene:'電話'}, {speaker:null,text:narr} ].concat(an?[{speaker:'heroine_01',text:an}]:[]),{participants:['heroine_01'],after:noMemo(id,(G,GM)=>{ if(GM&&GM.advance) GM.advance(1/6); })})); }
  return L;
})();
if(typeof STORY_EVENTS!=='undefined') for(const e of JPPREP_EVENTS){ if(!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e); }
