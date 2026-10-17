/* 告白的台詞（ROM-1017-L／SYS-02；規則 AA_215 第 1 節（使用者定案）、AA_128 3-1～3-3、AA_126 4-2）。
   流程在 src/date3d.js（DATE.confessOffer）：正式校外約會的結尾、條件到齊（DATE.canConfess）時出現「（告訴她）」；
   **這張表裡沒有她的台詞，就不出現這個選項**——台詞照 AA（以安、語彤）、BB（其他五位）交付的定稿照抄，不在這裡改字、不自己寫。
   每一位（各欄可以是陣列，或照情況回傳陣列的函式 (G, t＝這一趟約會, k＝祐廷選的第幾個)）：{
     src:'檔案 commit 節',                     // 照抄的來源
     only:(G,t)=>true,                         // （可省略）只在某些場合出現（例：語彤只在淡水收尾）
     say:[行…],                                // 選項之前（她先說的第一句等）
     choice:[{t:'選項',say:[行…]}…],           // （可省略）祐廷的說法
     yes:[行…],                                // 答應：之後 ROM.start（dating_<id>、交往紀錄）
     notYet:[行…], notYetFlag:'YT_NOT_YET',    // 還沒：不鎖線；兩週後、再多一次正式約會才會再出現選項
     decide:(G,t,k)=>'yes'|'notYet',           // （可省略）照她的個性和當時的故事決定；沒有＝答應（「還沒」的規則 BB 定，D98）
     preexam:[行…], preexamFlag:'SIS_DECLINED_PREEXAM',  // 只有學姊：研究所筆試以前婉拒（AA_215 第 2 節、BB_122 ★-2）
     unwilling:[行…], unwillingIf:(G,t)=>bool  // 她當時不願意（AA_223）：選項照樣出現、她婉拒、不鎖線
   }
   行：字串＝她說的；{who:'narr'|'player'|人物 id, text, expr}；{choice:[{t,say:[行…]}…]}＝中間的小選擇。 */
'use strict';
const CONFESS_LINES={
  /* 以安：AA_187 第 9-1 節（企劃線 6a0d2030，AA-C 2026-10-17 定稿；08:01 確認：選項照 AA_189 #40、「十七次」AN_COUNTED 不放）。
     場合：正式校外約會的收尾（讀書會散會後的「理由欄」、節日是特別的場面，另外接）。CG-11 還沒有圖（ART），先不放 */
  heroine_01:{ src:'AA_187 9-1 @6a0d2030',
    say:(G,t)=>[t&&t.by==='her'?'今天是我選的地方。……你是不是有話想說？':'今天是你約的。……你是不是有話要說？'],
    choice:G=>{ const A=(G.acts&&G.acts.att)||{}, rg=Object.keys(A).some(k=>k.indexOf('public_law_group@')===0); return [{t:'「我喜歡妳。」'},{t:rg?'「我們可以不只是讀書會的朋友嗎？」':'「我們可以不只是朋友嗎？」'},{t:'「我喜歡妳。妳不用現在回答。」'}]; },   /* 去過她的讀書會的玩家，第二個選項換說法 */
    yes:(G,t,k)=>[{who:'narr',text:'（她翻開手帳，翻到後面某一頁，又闔起來。）'},'……我上個月就在想這件事了。','只是想說等你先講。'].concat(k===2?['我現在就可以回答。']:[]).concat(['好。我們在一起。']),
    notYet:['……我很高興你跟我說。','可是我還沒想清楚，不想隨便回你。再給我一點時間。'], notYetFlag:'AN_REASON_PENDING' },
  /* 語彤：AA_187 第 9-2 節（企劃線 6a0d2030，AA-C 定稿）。約會收尾只在淡水（她的心願地點，AA_187 第 3 節）；總圖收書包那一版、事件 16 她先開口的不在這裡。
     「還沒」：事件 13（空出來的週四）還沒做，先用事件 13 以前那句 */
  heroine_03:{ src:'AA_187 9-2 @6a0d2030',
    only:(G,t)=>!!t&&Array.isArray(t.locs)&&t.locs[0]==='D13',
    say:['河邊風好大。……你今天一直在想事情。'],
    choice:[{t:'「我喜歡妳。」'},{t:'「我們要不要在一起？」'},{t:'「我喜歡妳。妳不用急著回答。」'}],
    yes:['……你先說了。',{who:'narr',text:'（她低頭，把書包拉鍊拉上又拉開。）'},'我本來也想講，可是一直不知道什麼時候講。',{who:'heroine_03',text:'……好。',expr:'embarrassed'}],   /* 她第一次的 embarrassed 表情放在這一刻（AA_187 2-2）*/
    notYet:['現在不行……不是因為你。我現在店裡跟學校都顧不好，沒辦法再多一件事。'], notYetFlag:'YT_NOT_YET' },
  /* 學姊：AA_223 第 1 節（企劃線 ad087f01，AA-C 2026-10-17 定稿；筆試前婉拒照 BB_122 ★-2 原句）。筆試 2026-02-02 以前：選項照樣出現、她婉拒（DATE.canConfess 的 decline:'preexam'） */
  heroine_05:{ src:'AA_223 第 1 節 @ad087f01',
    say:(G,t)=>DATE.sisPreexam(G)?[]:['時間差不多了。……你剛剛好像一直想講什麼。'],
    choice:[{t:'「我喜歡妳。」'},{t:'「我們可以不只是直屬嗎？」'},{t:'「我喜歡妳。妳不用現在回答。」'}],
    preexam:G=>G.flags&&G.flags.SIS_DECLINED_PREEXAM?['我上次說的，現在還是一樣。','不是你不好。是我現在真的沒辦法想這個。']
      :['……謝謝你跟我說。','可是我現在不想交往。考完試以前，我只想把書讀完。','我們還是一起讀書，好嗎？',{choice:[{t:'「好。」',say:['嗯。明天八點，法圖。']},{t:'「我知道了。」',say:['……你不要因為這樣就不來喔。']}]}],
    preexamFlag:'SIS_DECLINED_PREEXAM',
    yes:G=>['……我知道。','其實我也是。考試那時候就有一點了，只是那時候不想想這個。'].concat(G.flags&&G.flags.SIS_DECLINED_PREEXAM?['你上次說的，我有記得。']:[]).concat(['好。']),
    notYet:['……謝謝你。可是我還沒想好。','不是你不好。我想再多認識你一點。'], notYetFlag:'SIS_NOT_YET' },
  /* 芷若：AA_223 第 2 節（ad087f01）。第一句寫「今天的電影」：先只在有看電影的約會收尾（西門町 D04、光點 D05）——其他地點的第一句問 AA 中 */
  heroine_02:{ src:'AA_223 第 2 節 @ad087f01',
    only:(G,t)=>!!t&&Array.isArray(t.locs)&&['D04','D05'].includes(t.locs[0]),
    say:['今天的電影還不錯。……你要說什麼？'],
    choice:[{t:'「我喜歡妳。」'},{t:'「我們可以不只是朋友嗎？」'},{t:'「我喜歡妳。妳不用現在回答。」'}],
    yes:['……你講得好直接。',{who:'narr',text:'（她低頭笑了一下。）'},'好啊。','不要跟店長講，她會一直問。'],
    notYet:['今天玩得太開心了，我現在回答不準。','下次找個平常的日子，你再說一次好不好？'], notYetFlag:'ZR_NOT_YET',
    unwilling:['……對不起，我現在沒辦法答應你。不是你的問題。'] },
  /* 沛珊：AA_223 第 4 節（ad087f01）。重考期間（大二上第 7 週～放榜）她不願意：放榜日還沒有規格，先用 PEISHAN_RETAKE 而且在大二上第 7 週～大二下（BB 定確切的結束）*/
  classmate_peishan:{ src:'AA_223 第 4 節 @ad087f01',
    say:['今天謝謝你約我。……你要講什麼嗎？'],
    choice:[{t:'「我喜歡妳。」'},{t:'「我們可以不只是朋友嗎？」'},{t:'「我喜歡妳。妳不用現在回答。」'}],
    yes:['……你說完了？','你都不問我答案喔。',{who:'narr',text:'（她自己笑了。）'},'好啦。好。以後我會一直問你問題喔。'],
    notYet:['我可以想一下嗎？我還沒想好。','想好了我會跟你說。'], notYetFlag:'PS_NOT_YET',
    unwilling:['我現在要先顧考試，沒辦法想這個。對不起。'],
    unwillingIf:G=>{ if(!(G.flags&&G.flags.PEISHAN_RETAKE)||typeof CALENDAR==='undefined') return false; const T=CALENDAR.termOf(G.day); return !!T&&((T.id==='Y2S1'&&T.week>=7)||T.id==='Y2S2'); } }
};
