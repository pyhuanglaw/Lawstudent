/* ===== 臺灣路線逐週補空白：大二上、大三下、大四（AA_342 第 2-1、3-2、4 節，AA-C／AA（帳號 A）2026-10-21 定稿；企劃線 f2de8d1c；全部第①級、已批准；任務 AA342-COVERAGE-1021）=====
   第 2-2 節（大二下）在 src/y2r2_3d.js、第 3-1 節（大三上）在 src/data/y3fill_events.js、src/y3fill3d.js，這裡不重複。
   台詞照 AA_342 一字不改（TWFILL_LINES；企劃的舊名字照使用者 10-21 改名寫 Alison，AA_380）；用事件系統演的段落在 TWFILL_EVENTS。
   手機、出遊、摘要日、服務學習和海商法期中考的那一句的接線在 src/twfill3d.js。
   2-1 大二上：ev_y2s1_noodle_1210（12/10 週四進麵店）
   3-2 大三下：ev_y3_mothers_day（5/14 18:00 臺北的家：5/10 家人群組回了「回。」的出遊）
   4-1 大四上：ev_y4_plg_last（12/7 讀書會最後一次；有 PLG_HANDOVER 的）
   4-2 大四下：ev_y4s2_thu_noodle_first（3/1 起這學期第一次週四進麵店）、ev_y4_grad_photo（4/28 10:00 椰林大道學士服拍照）、ev_y4s2_noodle_0524（5/24 週四進麵店）
   測試：node tests/aa342_twfill_unit.js */
'use strict';
const TWFILL_LINES={
  /* ---------- 2-1 大二上（2026）---------- */
  /* 第 4 週 9/28（一）教師節 21:00 麵店團群組 */
  teachersY2:[['classmate_xinci','今天教師節。我傳訊息給高中的導師。'],['classmate_xinci','她回我：妳是誰。'],['zhe','哈哈哈哈']],
  /* 第 5 週 10/7（三）服務學習（二）：那天的旁白換掉 */
  svc1007:'（服務學習的第二次。你被分到社區的老人中心，陪一位阿公下象棋。他贏了三盤。）',
  /* 第 5 週 10/9（五）國慶補假：前一晚 10/8 21:00 群組 */
  longWeekend:[['zhe','連假 去哪'],['yu','睡覺'],['classmate_bohan','圖書館。']],
  /* 第 11 週 11/18（三）服務學習（接第 5 週）*/
  svc1118:'（服務學習快結束了。阿公終於輸了一盤。他說：「你進步了。」……其實是他讓的。）',
  /* 第 14 週 12/10（四）麵店（週四第一次進麵店；只演一次）*/
  noodle1210:'（期末前的週四。阿姨在每一碗裡多加了一顆蛋，說是考試加持。）',

  /* ---------- 3-2 大三下（臺灣路線，2028）---------- */
  sum0412:'（大三下的期中考。你在考卷背面算了一下：再三個學期就畢業了。）',
  /* 第 12 週：母親節。5/10（三）21:00 家人群組；「回。」＝5/14（日）18:00 臺北的家、「這週不行。」＝姊姊一句 */
  momAsk:'禮拜天母親節 你回不回來吃', momYes:'回。', momNo:'這週不行。', momNoReply:'好 我跟媽說',
  momDay:'（媽媽煮了一桌。姊姊買了蛋糕，上面寫的「媽媽辛苦了」，字是歪的。）', momLine:'……你爸在視訊裡也說了一次。',
  /* 第 13 週 5/18（四）21:00 群組 */
  summerY3:[['zhe','暑假誰留台北'],['yu','我'],['classmate_bohan','新竹。'],['classmate_xinci','永和。永和算台北。']],
  /* 第 14 週：5/26（五）摘要日；5/27（六）22:00 阿凱私訊（不影響 6/11 暑住、7/15 抽籤）*/
  sum0526:'（大三最後一個月。宿舍走廊有人開始收紙箱。）',
  kaiDorm:'暑假宿舍你要續住嗎', kaiDormOpts:[['還沒想。','我也是'],['要。','那我們暑假又在同一棟了']],
  /* 第 14 週 5/28（日）端午 12:00 媽媽私訊 */
  zongzi:'粽子寄去宿舍了。十顆。分給室友。',

  /* ---------- 4-1 大四上（臺灣路線，2028）---------- */
  teachersY4:[['yu','教師節。我傳訊息給大一的導師。'],['yu','她說她記得我。……然後把我的名字打錯了。']],
  mid1027:[['zhe','大四的期中考 為什麼還是期中考'],['yu','因為你還沒畢業']],
  mid1031:[['yu','（照片：公館的路口，有人扮成一本六法全書）'],['yu','拍到了']],
  plg1101:'下週四恢復。題目是第十一章。',   /* 11/1（三）21:00 讀書會群組（參加讀書會的）*/
  sum1103:'（期中考完。你數了一下大四上剩下的課：六週。）',
  bohan1117:['推甄下禮拜四放榜。','……這幾天我都在整理書櫃。'],   /* 第 11 週 11/17（五）21:00 柏翰私訊 */
  plgLast:'（大四上最後一次讀書會。學弟把白板擦得很乾淨，只留最上面那一行沒擦：說理由。）',   /* 第 14 週 12/7（四）有 PLG_HANDOVER 的 */
  sum1208:'（十二月。總圖前面的聖誕樹立起來了。）',   /* 沒參加讀書會的：12/8（五）摘要日 */

  /* ---------- 4-2 大四下（2029）---------- */
  noodle0301:'（最後一學期的第一個週四。長桌坐滿了，阿姨多拿了兩張椅子。）',
  /* 第 4 週 3/13（二）法律實習（一鍵那天換旁白）：大四下的法律實習現在沒有一鍵上課的路（教室 OFF 沒有地點，CLS.goPlan 回 null），還沒接線 */
  practice0313:'（實習的第四週。律師讓你第一次自己接一通諮詢電話。你講了十分鐘，掛掉以後，手還在抖。）',
  maritime0411:'（海商法的期中考。題目裡的那艘船，沉在一個你沒聽過的海峽。）',
  lastMid:[['yu','最後一次期中考'],['yu','考完了'],['zhe','最後一次']],
  /* 第 10 週：學士服拍照。4/26（四）21:00 群組；「去。」＝4/28（六）10:00 椰林大道；沒去＝12:30 群組 */
  gradAsk:[['zhe','禮拜六十點 椰影大道 學士服拍照'],['zhe','衣服我先租了 錢之後給']], gradGo:'去。',
  gradNarr:'（學士服是租的，袖子太長。Alison 拍了兩百張，說只會留三張。）', gradZhe:'（把學士帽丟上去，沒接到）……再一次。', gradBohan:'學士帽要等典禮那天才丟。',
  gradMiss:[['yu','（照片：椰影大道，一排人穿著學士服，中間空了一個位子）'],['yu','你的位子我們留了']],
  /* 第 11 週 5/4（五）21:00 群組：畢業紀念冊的一句話（記 F.YEARBOOK_LINE，只是紀念，不讀）*/
  yearbook:'畢業紀念冊的一句話，今天截止。', yearbookOpts:[['謝謝麵店的阿姨。','auntie'],['謝謝那幾年的週四。','thursday'],['還沒想好。','notyet','我幫你寫：還沒想好。']],
  seatsY4:[['yu','畢業典禮的位子按學號排'],['zhe','我跟 Alison 只差一號'],['yu','差兩號']],   /* 第 13 週 5/17（四）21:00 群組 */
  noodle0524:'（阿姨在牆上貼了一張空白的紙，說畢業那天給大家簽名。）',   /* 第 14 週 5/24（四）進麵店（最後一個上課週的週四）*/
  kaiMove:['你什麼時候搬','你的床位我要先借給我的鍵盤'] };   /* 第 14 週 5/25（五）22:00 阿凱私訊 */
const TWFILL_EVENTS=(function(){
  const D=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const law=G=>!!G&&(G.stage||'law')==='law';
  const ndl=G=>law(G)&&typeof PHONE!=='undefined'&&!!PHONE.inGroup&&PHONE.inGroup(G,'noodle_team');   /* 麵店團（AA_342 檔首的「典型玩家」；同 y2r2_3d.js 的週四麵店）*/
  const knows=id=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(id,'FIRST_MET');
  const L=TWFILL_LINES;
  return [
    /* ---------- 2-1 第 14 週：12/10（四）期末前的週四進麵店（麵店團的時段，只演一次）---------- */
    { id:'ev_y2s1_noodle_1210', title:'', participants:[], location:'noodle', trigger:'enter', once:true, term:['Y2S1'], weekday:[4], time:[17.5,21], background:'blur',
      prereq:{custom:G=>G.day===D('2026-12-10')&&ndl(G)},
      dialogue:[ {speaker:null,text:L.noodle1210} ] },
    /* ---------- 3-2 第 12 週：5/14（日）18:00 母親節，臺北的家（5/10 回了「回。」）---------- */
    { id:'ev_y3_mothers_day', title:'母親節', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
      dialogue:[ {scene:'臺北的家',bg:'home_living'}, {speaker:null,text:L.momDay}, {speaker:'媽媽',text:L.momLine} ],
      after:G=>{ G.flags.Y3_MOM_DAY='went'; } },
    /* ---------- 4-1 第 14 週：12/7（四）大四上最後一次讀書會（有 PLG_HANDOVER 的：交棒那晚在場 there、或在群組看到 heard）---------- */
    { id:'ev_y4_plg_last', title:'最後一次讀書會', participants:[], location:'any', trigger:'manual', clubEvent:'public_law_group', once:true, term:['Y4S1'], background:'blur',
      prereq:{custom:G=>G.day===D('2028-12-07')&&!!(G.flags&&G.flags.PLG_HANDOVER)},
      dialogue:[ {speaker:null,text:L.plgLast} ] },
    /* ---------- 4-2 第 2 週：3/1（四）起這學期第一次週四進麵店（2/22 開學第一頓是出遊、不算；第 3 週以前）---------- */
    { id:'ev_y4s2_thu_noodle_first', title:'', participants:[], location:'noodle', trigger:'enter', once:true, term:['Y4S2'], weeks:[2,3], weekday:[4], time:[17.5,21], background:'blur',
      prereq:{custom:ndl},
      dialogue:[ {speaker:null,text:L.noodle0301} ] },
    /* ---------- 4-2 第 10 週：4/28（六）10:00 椰林大道學士服拍照（4/26 回了「去。」；典禮前自己約的，和 6/2 典禮後的拍照不衝突）---------- */
    { id:'ev_y4_grad_photo', title:'學士服拍照', participants:['zhe'], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
      dialogue:[ {scene:'椰影大道',bg:'ntu_avenue'}, {speaker:null,text:L.gradNarr}, {speaker:'zhe',text:L.gradZhe},
        {if:{custom:()=>knows('classmate_bohan')},speaker:'classmate_bohan',text:L.gradBohan} ],
      after:G=>{ G.flags.Y4_GRAD_PHOTO='went'; } },
    /* ---------- 4-2 第 14 週：5/24（四）最後一個上課週的週四進麵店 ---------- */
    { id:'ev_y4s2_noodle_0524', title:'', participants:[], location:'noodle', trigger:'enter', once:true, term:['Y4S2'], weekday:[4], time:[17.5,21], background:'blur',
      prereq:{custom:G=>G.day===D('2029-05-24')&&ndl(G)},
      dialogue:[ {speaker:null,text:L.noodle0524} ] } ];
})();
/* 進麵店（enter）的放在最前面：進門的那一刻比同一個晚上的其他事件先演；其他照順序接在後面（同 y3fill_events.js）*/
for(const e of TWFILL_EVENTS.slice().reverse()){ if(STORY_EVENTS.some(x=>x.id===e.id)) continue; if(e.trigger==='enter') STORY_EVENTS.unshift(e); }
for(const e of TWFILL_EVENTS){ if(!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e); }
