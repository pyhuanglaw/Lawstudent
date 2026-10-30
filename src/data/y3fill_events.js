/* ===== 法律系大三逐週補空白（AA_342 第 3 節，AA-C 2026-10-21 定稿；企劃線 b7c437a1；全部第①級、已批准；任務 AA342-COVERAGE-1021）=====
   台詞照 AA_342 一字不改（Y3FILL_LINES）；用事件系統演的段落在 Y3FILL_EVENTS。手機、出遊、摘要日、閒聊階梯的條件（AA_376、AA_377）的接線在 src/y3fill3d.js。
   3-1 大三上：ev_y3_tue_noodle（9/21 起這學期第一次週二進麵店）、ev_y3_river33（9/28 15:00 河濱：9/27 群組回了「去。」的出遊）、
     ev_y3_plg_topic（10/7 讀書會散會）、ev_y3_plg_lead（10/14 讀書會：10/7 被點名帶題目的）、ev_y3_last_noodle（12/9 進麵店）
   測試：node tests/aa376_y3s1_unit.js */
'use strict';
const Y3FILL_LINES={
  /* 3-1 第 3 週 9/21（二）麵店：這學期第一次週二進麵店；只演一次 */
  tueNoodle:'（大三第一次在麵店遇到大家。阿姨看了一圈：「大三了，點的還是一樣。」）',
  /* 3-1 第 4 週 9/28（二）教師節：9/27 21:00 群組；「去。」＝9/28 15:00 河濱（出遊）、「不去。」＝阿哲「好喔」*/
  riverAsk:[['zhe','明天放假 河濱 三對三'],['zhe','輸的請飲料']],
  riverNo:'好喔',
  river:'（三對三。你們輸了兩場，贏了一場。阿哲說贏的那一場才算。飲料還是你們請的。）',
  /* 3-1 第 5～6 週：讀書會的題目。參加公法讀書會的＝10/7（四）散會時以安；10/14（四）讀書會（颱風假隔天照開）的旁白 */
  plgTopic:'下週的題目，你帶。', plgYes:'「好。」', plgNotYet:'「我還不會。」', plgNotYetReply:'不會才要帶。',
  plgLead:'（你講了十五分鐘。以安只問了一個問題：「理由呢？」你答了。她在手帳上畫了一個勾。）',
  /* 沒參加讀書會的：10/8（五）21:00 柏翰私訊 */
  bohanNotes:['民訴甲上第三章，我的筆記寫錯一個條號。','改好了。你那份也改一下。'],
  /* 3-1 第 9 週：11/3（三）摘要日；11/5（五）22:00 群組 */
  sum1103:'（期中考完的那一週，沒有課。你把刑訴旁聽作業的筆記整理成兩頁。）',
  noClass:[['yu','沒課的一週'],['yu','我睡了三天']],
  /* 3-1 第 14 週：12/8（三）21:00 群組；12/9（四）進麵店的旁白 */
  lastNoodleAsk:[['zhe','期末前最後一頓 明天 麵店']],
  lastNoodle:'（期末前最後一次在麵店。大家都帶了講義，沒有人翻開。）',
  /* 3-1 第 15 週：12/18（六）摘要日 */
  sum1218:'（期末考前的週末。總圖的位子早上八點就沒了。）' };
const Y3FILL_EVENTS=(function(){
  const D=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const wdOf=d=>typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(d).wd%7:null;
  const T0=id=>{ const t=typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf:null; return d=>{ const x=t?t(d):null; return !!x&&x.id===id; }; };
  const inY3S1=T0('Y3S1');
  /* 這學期之前的週二有沒有進過麵店（麵店團的紀錄 ndlDays：麵店日 17:00～21:00 在麵店；或習慣記憶 place:noodle:* 的日子）*/
  const tueBefore=G=>{ const F=G.flags||{}, old=d=>d<G.day&&wdOf(d)===2&&inY3S1(d); if((F.ndlDays||[]).some(old)) return true;
    const H=G.habits||{}; for(const k in H){ if(!/^place:noodle:/.test(k)||!H[k]) continue; if((H[k].days||[]).some(old)) return true; } return false; };
  const member=G=>{ const F=(G&&G.flags)||{}; return !!(F.PUBLIC_LAW_GROUP||F.CLUB_public_law_group); };   /* 參加公法讀書會的（第一次去就算加入，classes3d.js 的 CLUB_<id>）*/
  const here=(id,G)=>typeof STORY==='undefined'||!STORY.present||STORY.present(id,G);
  const L=Y3FILL_LINES;
  return [
    /* ---------- 3-1 第 3 週：這學期第一次週二進麵店（9/21 起、麵店團的時間）---------- */
    { id:'ev_y3_tue_noodle', title:'阿鳳麵店', participants:[], location:'noodle', trigger:'enter', once:true, term:['Y3S1'], weekday:[2], time:[17,21], background:'blur',
      prereq:{custom:G=>{ const d=D('2027-09-21'); return d!=null&&G.day>=d&&!tueBefore(G); }},
      dialogue:[ {speaker:null,text:L.tueNoodle} ] },
    /* ---------- 3-1 第 4 週：9/28 教師節 15:00 河濱的三對三 ---------- */
    { id:'ev_y3_river33', title:'河濱的三對三', participants:['zhe'], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
      dialogue:[ {scene:'公館河濱',bg:'riverside'}, {speaker:null,text:L.river} ],
      after:G=>{ G.flags.Y3_RIVER33='went'; } },
    /* ---------- 3-1 第 5 週：10/7（四）讀書會散會（參加公法讀書會的；以安在）---------- */
    { id:'ev_y3_plg_topic', title:'下週的題目', participants:['heroine_01'], location:['wancai','wancai_sema'], trigger:'activity', afterActivity:'public_law_group', once:true, term:['Y3S1'], background:'blur',
      prereq:{custom:G=>G.day===D('2027-10-07')&&member(G)&&here('heroine_01',G)},
      dialogue:[ {speaker:'heroine_01',text:L.plgTopic},
        {choice:[{text:L.plgYes,set:{Y3_PLG_TOPIC:'yes'},goto:'pt_end'},{text:L.plgNotYet,set:{Y3_PLG_TOPIC:'notyet'},goto:'pt_n'}]},
        {label:'pt_n'},{speaker:'heroine_01',text:L.plgNotYetReply},
        {label:'pt_end'} ] },
    /* ---------- 3-1 第 6 週：10/14（四）讀書會（颱風假 10/13 隔天照開）：10/7 被點名帶題目的那一場 ---------- */
    { id:'ev_y3_plg_lead', title:'你帶的題目', participants:['heroine_01'], location:'any', trigger:'manual', clubEvent:'public_law_group', once:true, term:['Y3S1'], background:'blur',
      prereq:{custom:G=>G.day===D('2027-10-14')&&!!(G.flags&&G.flags.Y3_PLG_TOPIC)},
      dialogue:[ {speaker:null,text:L.plgLead} ],
      after:G=>{ G.flags.Y3_PLG_LEAD=G.day; } },
    /* ---------- 3-1 第 14 週：12/9（四）期末前最後一次週四麵店（進麵店的旁白）---------- */
    { id:'ev_y3_last_noodle', title:'阿鳳麵店', participants:[], location:'noodle', trigger:'enter', once:true, term:['Y3S1'], weekday:[4], time:[17,21], background:'blur',
      prereq:{custom:G=>G.day===D('2027-12-09')},
      dialogue:[ {speaker:null,text:L.lastNoodle} ] } ];
})();
/* 進麵店（enter）的兩個放在最前面：進門的那一刻比同一個晚上的其他事件先演；其他照順序接在後面（同 y1fill_events.js）*/
for(const e of Y3FILL_EVENTS.slice().reverse()){ if(STORY_EVENTS.some(x=>x.id===e.id)) continue; if(e.trigger==='enter') STORY_EVENTS.unshift(e); }
for(const e of Y3FILL_EVENTS){ if(!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e); }
