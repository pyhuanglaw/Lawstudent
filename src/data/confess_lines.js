/* 告白的台詞（ROM-1017-L／SYS-02；規則 AA_215 第 1 節（使用者定案）、AA_128 3-1～3-3、AA_126 4-2）。
   流程在 src/date3d.js（DATE.confessOffer）：正式校外約會的結尾、條件到齊（DATE.canConfess）時出現「（告訴她）」；
   **這張表裡沒有她的台詞，就不出現這個選項**——台詞照 AA（以安、語彤）、BB（其他五位）交付的定稿照抄，不在這裡改字、不自己寫。
   每一位（各欄可以是陣列，或照情況回傳陣列的函式 (G, t＝這一趟約會, k＝祐廷選的第幾個)）：{
     src:'檔案 commit 節',                     // 照抄的來源
     only:(G,t)=>true,                         // （可省略）只在某些場合出現（例：語彤只在淡水收尾）
     say:[行…],                                // 選項之前（她先說的第一句等）
     choice:[{t:'選項',say:[行…]}…],           // （可省略）祐廷的說法
     yes:[行…],                                // 答應：之後 ROM.start（dating_<id>、交往紀錄）
     notYet:[行…], notYetFlag:'YT_NOT_YET',    // 還沒：不鎖線；兩週後、再多一次正式約會才會再出現選項。旗標記 {n:第幾次, day}
     decide:(G,t,k)=>'yes'|'notYet',           // （可省略）特例；沒有＝DATE.confessDecide（BB_191 第 10 節：她的戀愛到答應線＝答應、第三次一定答應）
     preexam:[行…], preexamFlag:'SIS_DECLINED_PREEXAM',  // 只有學姊：研究所筆試以前婉拒（AA_215 第 2 節、BB_122 ★-2）
     prerank:[行…], prerankFlag:'SIS_DECLINED_PRERANK',  // 只有學姊：筆試後到放榜以前婉拒（AA_223 第 1 節 @8dac7e49）
     hideIf:(G,t)=>bool                       // 這段期間不出現一般告白選項（沛珊重考期）
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
    yes:['……你先說了。',{who:'narr',text:'（她低頭，把書包拉鍊拉上又拉開。）'},'我本來也想講，可是一直不知道什麼時候講。',{who:'heroine_03',text:'……好。',expr:'embarrassed'}],   /* 她第一次的 embarrassed 表情放在這一刻（AA_187 2-2）*/ },   /* 語彤沒有「還沒」：YT_NOT_YET 作廢（BB_203 沒有「還沒」；AA-C 16:44 告白文件對齊第 9 點）*/
  /* 學姊：AA_223 第 1 節（企劃線 8dac7e49；筆試前婉拒照 BB_122 ★-2 原句）。筆試 2026-02-02 以前＝preexam；筆試後到放榜 2026-03-23 以前＝prerank（使用者同意 BB_190 LOGIC-14）：
     選項照樣出現、她婉拒、不鎖線（DATE.canConfess 的 decline）；放榜以後照一般流程 */
  heroine_05:{ src:'AA_223 第 1 節 @8dac7e49',
    say:(G,t)=>DATE.sisPreexam(G)||DATE.sisPrerank(G)?[]:['時間差不多了。……你剛剛好像一直想講什麼。'],
    choice:[{t:'「我喜歡妳。」'},{t:'「我們可以不只是直屬嗎？」'},{t:'「我喜歡妳。妳不用現在回答。」'}],
    preexam:G=>G.flags&&G.flags.SIS_DECLINED_PREEXAM?['我上次說的，現在還是一樣。','不是你不好。是我現在真的沒辦法想這個。']
      :['……謝謝你跟我說。','可是我現在不想交往。考完試以前，我只想把書讀完。','我們還是一起讀書，好嗎？',{choice:[{t:'「好。」',say:['嗯。明天八點，法圖。']},{t:'「我知道了。」',say:['……你不要因為這樣就不來喔。']}]}],
    preexamFlag:'SIS_DECLINED_PREEXAM',
    prerank:G=>G.flags&&G.flags.SIS_DECLINED_PRERANK?['還沒放榜啦。……我說過的，等放榜。']:['……謝謝你。','考完了，可是還沒放榜。我現在每天都在想那個數字。','等放榜好不好？放榜以後，你再跟我說一次。'],
    prerankFlag:'SIS_DECLINED_PRERANK',
    yes:G=>typeof SISB4!=='undefined'&&SISB4.restartYes&&SISB4.restartYes(G)?['你做到了。','……我也想好了。','其他的，想了很久。……沒有了。','這次，我選你。']   /* AA_386 4-2（BB_122 9-2 答應的版本；企劃線 e848154a）；AA_398 第 47 列不數件數：分開以後、演過 ev_sis_three_conditions、重新開始的那一次。
       AA_512 6-2（企劃線 c444f0757）：4-1「其他的，我還沒想好。想好了告訴你。」在這裡兌現——「……我也想好了。」和「這次，我選你。」中間加「其他的，想了很久。……沒有了。」；第一次答應照舊 */
      :['……我知道。','其實我也是。考試那時候就有一點了，只是那時候不想想這個。'].concat(G.flags&&(G.flags.SIS_DECLINED_PREEXAM||G.flags.SIS_DECLINED_PRERANK)?['你上次說的，我有記得。']:[]).concat(['好。']),
    decide:(G,t,k)=>typeof SISB4!=='undefined'&&SISB4.rebuildReady&&SISB4.rebuildReady(G)?'yes':DATE.confessDecide(G,'heroine_05'),   /* AA_386 4-2：三件事以後第二次正式校外約會的結尾告白＝答應（她說好的那天）；其他照 DATE.confessDecide */
    notYet:['……謝謝你。可是我還沒想好。','不是你不好。我想再多認識你一點。'], notYetFlag:'SIS_NOT_YET' },
  /* 芷若：AA_223 第 2 節（32424049；LAWWW Q11 以後第一句不綁約會內容）。有看電影的約會（西門町 D04、光點 D05）第一句換成「今天的電影」 */
  heroine_02:{ src:'AA_223 第 2 節 @32424049',
    say:(G,t)=>[t&&Array.isArray(t.locs)&&['D04','D05'].includes(t.locs[0])?'今天的電影還不錯。……你要說什麼？':'今天很開心。……你要說什麼？'],
    choice:[{t:'「我喜歡妳。」'},{t:'「我們可以不只是朋友嗎？」'},{t:'「我喜歡妳。妳不用現在回答。」'}],
    yes:['……你講得好直接。',{who:'narr',text:'（她低頭笑了一下。）'},'好啊。','店長明天一定會看出來。'],
    notYet:['今天玩得太開心了，我現在回答不準。','下次找個平常的日子，你再說一次好不好？'], notYetFlag:'ZR_NOT_YET',
    unwilling:['……對不起，我現在沒辦法答應你。不是你的問題。'] },
  /* 子晴：AA_223 第 3 節（32424049）。這一趟有吃東西的互動點（DATE.ate：餐廳、小吃、甜點、飲料；只逛、只玩扭蛋不算）第一句換成「好飽。」。
     「不願意」的台詞先放著：子晴什麼時候不願意（低潮期等）還沒有規格，所以沒有 unwillingIf */
  heroine_04:{ src:'AA_223 第 3 節 @32424049',
    say:(G,t)=>[DATE.ate(t)?'好飽。……你今天怎麼都不太講話？':'今天很好玩欸。……你今天怎麼都不太講話？'],
    choice:[{t:'「我喜歡妳。」'},{t:'「我們可以不只是朋友嗎？」'},{t:'「我喜歡妳。妳不用現在回答。」'}],
    yes:['……你認真的喔。',{who:'narr',text:'（她把臉埋進外套的帽子裡，過了一下才出來。）'},'我剛剛在想要不要跑。……這裡跑不掉。','好啦。好。你不准反悔喔。'],
    notYet:['……現在不行。對不起。','下次還是可以約我吃東西啦。'], notYetFlag:'ZQ_NOT_YET',
    unwilling:['……你認真的喔。','對不起，我現在沒辦法。我沒有討厭你，只是現在真的沒辦法想這個。'] },
  /* 沛珊：AA_223 第 4 節（52702c92）。重考期間（大二上第 7 週～放榜）不走一般告白（不出現選項）。
     使用者 2026-10-17「沛珊重考期間應該要直接消失，大家都聯絡不到她」（BB_194 §19）：重考期沒有見面、沒有心意邀約；原本要另外接的特別場面（BB_119 1b-1～1b-3）
     和 AA_223 第 4 節的重考期婉拒句都作廢（AA_360 第 5 節）。hideIf 照舊：PEISHAN_RETAKE 而且在大二上第 7 週～大二下（只改這段註解，行為不變）*/
  classmate_peishan:{ src:'AA_223 第 4 節 @52702c92',
    say:['今天謝謝你約我。……你要講什麼嗎？'],
    choice:[{t:'「我喜歡妳。」'},{t:'「我們可以不只是朋友嗎？」'},{t:'「我喜歡妳。妳不用現在回答。」'}],
    yes:['……你說完了？','你都不問我答案喔。',{who:'narr',text:'（她自己笑了。）'},'好啦。好。以後我會一直問你問題喔。'],
    notYet:['我可以想一下嗎？我還沒想好。','想好了我會跟你說。'], notYetFlag:'PS_NOT_YET',
    hideIf:G=>{ if(!(G.flags&&G.flags.PEISHAN_RETAKE)||typeof CALENDAR==='undefined') return false; const T=CALENDAR.termOf(G.day); return !!T&&((T.id==='Y2S1'&&T.week>=7)||T.id==='Y2S2'); } }
};
