/* ===== 事件包第 3 輪：大二到畢業後篇的小事件（AA_328，AA-C 2026-10-20 定稿 5ae6a133；第②級，台詞照原文、不改字）=====
   這裡是用事件系統演的段落（3D 場景裡碰到的、出遊的 2D 場面）；手機、時間窗、鬧鐘、人物放到場景裡、包住別人的函式在 src/r3_3d.js。
   3-02 ev_kai_sunday_supper（events.js）裡 12/6 那一晚換成 F2：本檔最下面把 F2 那一段接進去（不改 events.js 那一行；對不到就不接，tests/r3_events_unit.js 會失敗）
   3-04 ev_fangyt_6am（3/13 06:00 椰林大道，方奕廷站著、阿凱坐在長椅上）　3-05 ev_zhiruo_latte_contest（5/7 Café 拉花比賽）＋ev_cafe_barista_zhiruo 投她的兩週內「這次有脖子了」
   測試：node tests/r3_events_unit.js */
'use strict';
const R3_EVENTS=(function(){
  const D=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const has=(id,tag)=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(id,tag);
  /* 絕對時間（熬夜過了午夜 G.day 還是前一天、G.hour 超過 24）：[k 那天 h0, k 那天 h1) */
  const at=(G,k,h0,h1)=>{ const d=D(k); if(d==null) return false; const t=G.day*24+G.hour; return t>=d*24+h0&&t<d*24+h1; };
  const toH=h=>G=>{ const hh=((G.hour%24)+24)%24; return h>hh?h-hh+1e-6:0; };   /* advance：跳到當天的某個時間（已經過了就不動）*/
  const R3x=()=>typeof R3!=='undefined'?R3:null;

  /* ---------- 3-04 方奕廷 F3 早上六點（BB_110 F3）：3/13（六）06:00 椰林大道。r3_3d.js 在 05:50～06:30 把方奕廷（站著）、阿凱（坐在長椅上）放好，走過去（npcNear）才演 ---------- */
  const FANG_6AM={ id:'ev_fangyt_6am', title:'早上六點', participants:['npc_fangyt','kai'], location:'campus', trigger:'auto', once:true, npcNear:'npc_fangyt', background:'blur',
    prereq:{custom:G=>G.flags.FANG_6AM_GO===true&&!G.flags.FANG_6AM&&at(G,'2027-03-13',5+50/60,6.5)},
    dialogue:[ {speaker:'npc_fangyt',text:'這是大王椰子。'},
      {speaker:'kai',text:'我知道。椰子。'},
      {speaker:'npc_fangyt',text:'它不會長椰子。'},
      {speaker:'kai',text:'……那它為什麼叫椰子？'},
      {speaker:'npc_fangyt',text:'因為人取名字的時候，沒有問它。'},
      {speaker:'npc_fangyt',text:'（指著地上）這片葉子掉下來很大聲。不要站在下面。'},
      {speaker:'player',text:'會砸到人嗎？'},
      {speaker:'npc_fangyt',text:'會。你們法律系應該知道要找誰。'},
      {speaker:null,text:'（阿凱坐在長椅上，睡著了。）'},
      {choice:[{text:'「要找誰？」',goto:'a'},{text:'（拍一張阿凱睡著的照片）',set:{FANG_6AM_PHOTO:true},goto:'end'},{text:'「下次換我帶你看法學院的樹。」',goto:'c'}]},
      {label:'a'},{speaker:'npc_fangyt',text:'我不知道。我只知道要站旁邊。'},{goto:'end'},
      {label:'c'},{speaker:'npc_fangyt',text:'法學院有樹？'},{speaker:'player',text:'有一棵。'},{speaker:'npc_fangyt',text:'好。'},{mem:[{npc:'npc_fangyt',tag:'FANG_LAWTREE',note:''}]},
      {label:'end'},{advance:toH(7)},{speaker:null,text:'（七點，太陽照到大道上。阿凱醒來，問你們講到哪裡了。）'},
      {set:{FANG_6AM:'went'}} ] };

  /* ---------- 3-05 芷若 F4 拉花比賽（BB_110 F4）：2027-05-07（五）19:00～22:00 兩點半 Café，她在班；走到櫃台前（npcNear）才開始，只一次。去過 Café 就有（常客都會被拉去投票）---------- */
  const LATTE={ id:'ev_zhiruo_latte_contest', title:'拉花比賽', participants:['heroine_02'], location:'cafe', trigger:'auto', once:true, npcNear:'heroine_02', background:'blur',
    prereq:{custom:G=>at(G,'2027-05-07',19,22)},
    dialogue:[ {speaker:'老闆',text:'今天的拉花比賽，客人投票。一包糖一票。'},
      {speaker:'heroine_02',text:'（端出一杯）這是天鵝。'},
      {speaker:'player',text:'……它的脖子在哪裡？'},
      {speaker:'heroine_02',text:'它在低頭。它在想事情。'},
      {speaker:null,text:'（老闆端出一杯脖子很長的天鵝。）'},
      {speaker:'heroine_02',text:'老闆，你這樣不公平。你練了十五年。'},
      {speaker:'老闆',text:'所以妳要練十五年。'},
      {choice:[{text:'「投芷若。」',set:{ZR_SWAN_VOTE:'her'},mem:[{npc:'heroine_02',tag:'ZR_SWAN',note:''}],goto:'h'},{text:'「投老闆。」',set:{ZR_SWAN_VOTE:'boss'},goto:'b'},{text:'（把糖倒進咖啡，不投）',set:{ZR_SWAN_VOTE:'sugar'},goto:'s'}]},
      {label:'h'},{speaker:'heroine_02',text:'同情票不算。……算了，算。'},{goto:'end'},
      {label:'b'},{speaker:'heroine_02',text:'你很誠實。'},{speaker:null,text:'（她笑了。）'},{speaker:'heroine_02',text:'……下次我會贏。'},{goto:'end'},
      {label:'s'},{speaker:'heroine_02',text:'你把選票喝掉了。這在選舉裡叫什麼？'},{speaker:'player',text:'……廢票？'},{speaker:'heroine_02',text:'叫好喝。'},
      {label:'end'} ] };

  return [FANG_6AM,LATTE];
})();
Array.prototype.push.apply(STORY_EVENTS,R3_EVENTS);

/* ===== 接進現有事件的段落（AA_328 第 6 節「給 LAWWW」：取代那一晚的輪流句、點餐多一句）。對不到原本的那一行就不接（測試會抓到）===== */
(function(){
  const D=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const has=(id,tag)=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(id,tag);
  const ev=id=>STORY_EVENTS.find(e=>e.id===id);
  /* ---- 3-02 阿凱 F2 聊天機器人（BB_110 F2）：2026-12-06（日）第 13 週的週日宵夜，那一晚演這一場、取代輪流句；第一次去宵夜的＝先演 K3 第一次那一段，再接「（吃到一半，阿凱打開筆電。）」 ---- */
  const F2N={custom:G=>G.day===D('2026-12-06')&&!G.flags.KAI_F2};
  const BOT={custom:G=>typeof R3!=='undefined'&&R3.kaiBotReplied(G)};   /* 主線 4 的 kai_bot 那一則回過 */
  const F2=[ {label:'r3_f2'},
    {if:BOT,speaker:'kai',text:'你上次說它不能給法律結論。'},
    {if:BOT,speaker:'kai',text:'所以我改了。現在它不回答問題，只會吵架。'},
    {unless:BOT,speaker:'kai',text:'我的作業。一個會吵架的聊天機器人。'},
    {speaker:'kai',text:'我用法律系的口氣訓練它。資料是你。'},
    {speaker:'player',text:'我？'},
    {speaker:'kai',text:'你大一傳給我的訊息。全部。'},
    {speaker:null,text:'（手機螢幕）使用者：今天宵夜吃什麼？'},
    {speaker:null,text:'（手機螢幕）機器人：看情況。'},
    {speaker:null,text:'（手機螢幕）使用者：鹹酥雞可以嗎？'},
    {speaker:null,text:'（手機螢幕）機器人：原則上可以。但有例外。'},
    {speaker:'kai',text:'它已經學會了。'},
    {if:{memory:[{npc:'kai',tag:'SAID_DEPENDS'}]},speaker:'kai',text:'「看情況」是你大一颱風天說的。它記得。'},
    {choice:[{text:'「問它：你喜歡法律嗎？」',goto:'r3_f2a'},{text:'「把我刪掉。」',goto:'r3_f2b'},{text:'「教它說：先吃飯。」',goto:'r3_f2c'}]},
    {label:'r3_f2a'},{speaker:'機器人',text:'這個問題，學說上有爭議。'},{speaker:'kai',text:'你看，連它都不確定。'},{goto:'r3_f2e'},
    {label:'r3_f2b'},{speaker:'kai',text:'不行。你是唯一的資料。'},{goto:'r3_f2e'},
    {label:'r3_f2c'},{speaker:'機器人',text:'先吃飯。其他的，看情況。'},{speaker:'kai',text:'……它比你還像人。'},{mem:[{npc:'kai',tag:'KAI_BOT',note:''}]},
    {label:'r3_f2e'},{set:{KAI_F2:'went'}} ];
  const sup=ev('ev_kai_sunday_supper');
  if(sup&&!sup._r3f2){ const L=sup.dialogue, iN=L.findIndex(l=>l.text==='（週日晚上，滷味攤。阿凱的籃子永遠比你的滿。）'), iE=L.findIndex(l=>l.label==='end');
    if(iN>=0&&iE>iN){ L.splice(iE,0,{if:F2N,speaker:null,text:'（吃到一半，阿凱打開筆電。）'},{unless:F2N,goto:'end'},...F2); L.splice(iN+1,0,{if:F2N,goto:'r3_f2'}); sup._r3f2=true; } }   /* 第二次以後：旁白之後直接跳 F2（不演輪流句）；第一次：K3 第一次那一段演完接旁白、F2；收尾照 K3（快轉到 00:00）*/
  /* ---- 3-05 投她的（ZR_SWAN）：5/8～5/21 第一次在 Café 跟她點餐（ev_cafe_barista_zhiruo）＝最後那句「杯子放著就好，慢慢來。」前面多兩句 ---- */
  const SWAN={custom:G=>{ const a=D('2027-05-08'), b=D('2027-05-21'); return a!=null&&G.day>=a&&G.day<=b&&!G.flags.ZR_SWAN_SEEN&&has('heroine_02','ZR_SWAN'); }};
  const bar=ev('ev_cafe_barista_zhiruo');
  if(bar&&!bar._r3swan){ const L=bar.dialogue, i=L.findIndex(l=>l.text==='杯子放著就好，慢慢來。');
    if(i>=0){ L.splice(i,0,{if:SWAN,speaker:null,text:'（拿鐵上面是一隻天鵝。這次有脖子。）'},{if:SWAN,speaker:'heroine_02',text:'這次有脖子了。'},{if:SWAN,set:{ZR_SWAN_SEEN:true}}); bar._r3swan=true; } }
})();
