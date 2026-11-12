/* 開學前迎新宿營 2025/8/22（五）～8/24（日），三天兩夜（CAMP-L1；新遊戲的第一段）。
   規格：AA_205（AA 分支 37e34086／c0d12275／d3de3c88：入口、骨架、旗標、AA 台詞、6-13 補字）、BB_177 第五版（BB 分支 eee886d8＋e627d747：Kevin（臥底）、沛珊、明軒、小隊輔、關主）。
   使用者 2026-10-16 23:1x～23:5x：開學前三天兩夜、強制參加（沒有報名、費用、沒去的分支）、所有玩家（含經濟系路線）都完整演；每天至少兩個活動；第一天 6～7 人小隊破冰；
   大二學長（Kevin）假裝大一混在小隊、營火晚會揭曉；第二天晚上烤肉；不新增有名字的人物（小隊輔、關主、主持的學長都是背景）。
   一段一個事件（trigger:'camp'），由 story3d.js 的 S.campY1 依時間順序跑（設定日子、時間、背景）；句子只照上面兩份規格，LAWWW 不自己寫（D79）。每段開頭的註解寫來源節。
   旗標：CAMP_Y1（演完）、CAMP_MOLE_CLUE（Kevin 的破綻看過幾個，0～4）、CAMP_MOLE_GUESSED、CAMP_MOLE_REVEALED、CAMP_SEEN（陣列，現在只有 yu）、MX_CAMP_PAIR、MET_ZHE、ZHE_CALLS_GE；
   小隊六個人 FIRST_MET（note 'camp'）。Kevin 不是 CHARACTERS 的人物（手機、事件用名字），記 CAMP_KEVIN。
   2026-11-03 AA_608 第 10 節（＋10-1～10-4；使用者「宿營活動蠻無聊的，可以只留認識過程嗎？」「宿營認識阿哲、沛珊、慈昕就好」）：三天兩夜照舊，畫面上只演認識人的段落，
   宿營只認識芯慈（破冰，第七小隊）、阿哲（撕名牌，隔壁第八小隊、不同寢室）、沛珊（第二天晚上營火才到；交換聯絡方式）。明軒、Alison 只有一句印象旁白（不寫名字、不記認識、不設 CAMP_SEEN）；柏翰、Kevin 不出場（不再有臥底）。
   第一天＝遊覽車（坐窗邊，CAMP_BUS 'win'）、破冰、撕名牌、自由時間（大老二）；第二天＝一句旁白、營火（沛珊）；第三天＝早餐、結業。學測、「哥」在第一天自由時間打牌的最後（10-5，阿哲不同寢室；CANON-1112：照 AA_859 改，見 ev_camp_d1_free）。
   迎新晚會、夜遊、法律闖關、水大地 retired（定義留給舊存檔）；夜談的定義已拿掉（CANON-1112，AA_859）。新局不再設：CAMP_MOLE_*、CAMP_CLUE*、CAMP_F*、CAMP_KEVIN、CAMP_SEEN、MX_CAMP_PAIR；舊存檔照舊。 */
/* 2026-11-11（使用者 X327 沛珊重寫）：ev_camp_d2_fire 沛珊的四句照 AA_762_peishan_events_2.json@1fc9a6658 換（行程、條件、別人的句子不動）。逐字對稿：tests/peishan_events_1111_unit.js */
/* Kevin 的立繪（使用者 2026-10-18 15:5x「營地差在Kevin沒有立繪」→ 選「潮流大哥型」；KEVIN-PORTRAIT-1018）：他不是 CHARACTERS 的人物，只登記立繪；
   台詞用 speaker:'npc_kevin'＋name（揭曉前「凱文」、揭曉後「Kevin」）。圖放進 assets/portraits/npc_kevin/campus/<表情>.webp、跑 build.py（或 tools/gen_portrait_manifest.py）就出現；沒放＝照舊沒有立繪 */
if(typeof PORTRAITS!=='undefined'&&!PORTRAITS.npc_kevin){ const o={campus:{}}; for(const ex of ['neutral','smile','laugh','surprised']) o.campus[ex]='assets/portraits/npc_kevin/campus/'+ex+'.webp'; PORTRAITS.npc_kevin={characterId:'npc_kevin',displayName:'Kevin',tier:2,defaultOutfit:'campus',defaultPortrait:'assets/portraits/npc_kevin/campus/neutral.webp',outfits:o,silhouette:'m'}; }
const CAMP_Y1_EVENTS=[
  /* 8/22 08:30 校門集合、遊覽車（AA_205 2-2 開頭旁白；AA_608 第 10 節第 1 點：不給選項、坐窗邊（CAMP_BUS 固定 'win'）；10-1 明軒的印象一句（不寫名字、不記認識）；AA_195 4-10 經濟系玩家到營地那句）*/
  { id:'ev_camp_d1_bus', stage:'any', title:'迎新宿營：遊覽車', participants:[], location:'any', trigger:'camp', once:true, background:'dark',
    dialogue:[ {scene:'首都帝大校門口',bg:'dark'},
      {speaker:null,text:'放榜以後，系學會建了一個新生群組。宿營的通知是一個禮拜前貼的，新生都要去。'},
      {speaker:null,text:'（早上八點半，校門口停了兩台遊覽車。小隊名單前一天晚上貼出來了，你那一隊有七個人。）'},
      {scene:'遊覽車上',bg:'tour_bus'},
      {speaker:null,text:'（早上八點半，遊覽車從校門口出發。你坐在靠窗的位子，一路看著窗外。）'},
      {speaker:null,text:'（後面一排有個戴帽子的男生，一上車就靠著窗睡著，到營地才醒。）'},
      {set:{CAMP_BUS:'win'}},
      {scene:'山上的青年活動中心',bg:'econ_camp'} ] },   /* CANON-1112（AA_859「一起拿掉的」）：「這個營地你去年來過」那一句拿掉 */

  /* 8/22 10:30 小隊時間：破冰（AA_608 第 10 節第 2 點、10-1（Alison 的印象一句，不寫名字、不設 CAMP_SEEN）、10-3（第七小隊：芯慈、沛珊；你只記住了芯慈））。
     祐廷報自己的那段照原本（AA_205 6-12）；只認識芯慈（沛珊第二天晚上才到、阿哲在第八小隊）*/
  { id:'ev_camp_d1_ice', stage:'any', title:'迎新宿營：破冰', participants:[], location:'any', trigger:'camp', once:true, background:'dark',
    dialogue:[ {scene:'營地的空地',bg:'camp_yard_day'},
      {speaker:null,text:'（營地的空地上，每個小隊圍成一圈，輪流報名字和從哪裡來。）'},
      {speaker:null,text:'（隔壁小隊喊隊呼，帶頭的女生聲音大到整個營地都聽得到。）'},
      {speaker:'classmate_xinci',text:'吳芯慈，永和。我應該是全隊住最近的。'},
      {speaker:null,text:'（另外幾個人也報了名字，你一下子記不住。輪到你。）'},
      {choice:[{text:'「臺北。我家就在這附近。」'},{text:'「臺北人。」'}]},   /* AA_205 6-12 定版（10-17）；AA_546 第 0 節（NO-COMPARE-1030）早餐改「從哪裡來」 */
      {speaker:'小隊輔',text:'好，七個人都記住了吧。'},
      {speaker:'小隊輔',text:'還有一個沛珊，她明天晚上才到。'},
      {speaker:null,text:'（你們小隊七個人，你只記住了芯慈。）'},
      {meet:[{id:'classmate_xinci',where:'camp'}]} ] },

  /* 8/22 13:30 大地遊戲：撕名牌——認識阿哲（AA_608 10-4，取代第 9 節的搶旗；阿哲在隔壁第八小隊）。不設 CAMP_SEEN */
  { id:'ev_camp_d1_field', stage:'any', title:'迎新宿營：撕名牌', participants:[], location:'any', trigger:'camp', once:true, background:'dark',
    dialogue:[ {scene:'營地・大地遊戲',bg:'camp_field'},
      {speaker:null,text:'（下午的大地遊戲是撕名牌。每個人背後貼一張寫著自己名字的貼紙，被撕掉就出局。你們第七小隊對隔壁的第八小隊。）'},
      {speaker:null,text:'（你躲在樹後面。背後忽然有腳步聲——你一轉身，跟一個男生撞個正著。）'},
      {speaker:null,text:'（兩個人都晃了一下。他的手還是比較快。）'},
      {speaker:null,text:'（嘶——你背後的名牌被撕走了。）'},
      {speaker:'zhe',text:'（看著手上的貼紙）{name}……出局！'},
      {choice:[{text:'「你偷襲。」',goto:'sneak'},{text:'（揉一下被撞到的肩膀）',goto:'rub'}]},
      {label:'sneak'},{speaker:'zhe',text:'撕名牌本來就是偷襲啊。'},{goto:'name'},
      {label:'rub'},{speaker:'zhe',text:'欸，撞很大力喔？……抱歉抱歉。'},
      {label:'name'},
      {speaker:'zhe',text:'張哲維，叫我阿哲。高雄上來的。'},
      {speaker:null,text:'（對面有人在喊：「阿哲！後面！」）'},
      {speaker:'zhe',text:'……我先走了！'},
      {speaker:null,text:'（他轉身就跑。下一秒，他背後的名牌被芯慈撕掉了。）'},
      {set:{MET_ZHE:true},meet:[{id:'zhe',where:'camp'}]} ] },

  /* 8/22 19:30 自由時間：芯慈找你打牌（AA_608 第 10 節第 4 點、10-4 阿哲那句、10-5：學測那段在打牌最後，阿哲在這一桌）。
     CANON-1112（企劃線 AA_859@077a6e501d 定稿，逐字照稿：tests/canon_opening_1112_unit.js）：祐廷沒有舊序章——「你數學幾級分？」之後照 AA_859：
     十五級分 → 滿級分？厲害欸。→ 那我以後數學問你 → 兩個選項都走到 ZHE_CALLS_GE（「哥」的原因＝數學滿級分）→ 結尾芯慈、阿哲各一句；熟悉 +1（芯慈、阿哲）照舊。
     原本 old／econ／said／why_h 四個分支和它們讀寫的旗標在這裡不再用 */
  { id:'ev_camp_d1_free', stage:'any', title:'迎新宿營：自由時間', participants:[], location:'any', trigger:'camp', once:true, background:'dark',
    dialogue:[ {scene:'寢室外面的走廊',bg:'econ_camp_room'},
      {speaker:null,text:'（晚餐後是自由時間。你坐在寢室外面的走廊，芯慈拿著一副撲克牌走過來。）'},
      {speaker:'classmate_xinci',text:'{name}，我們在玩大老二，三缺一。你要不要來？'},
      {choice:[{text:'「好啊。」',goto:'ok'},{text:'「我不太會玩。」',goto:'teach'}]},
      {label:'teach'},{speaker:'classmate_xinci',text:'我教你。很快。'},
      {label:'ok'},
      {speaker:null,text:'（交誼廳的角落，阿哲也在，看到你就笑了。）'},
      {speaker:'zhe',text:'下午那個！……來來來，坐。'},
      {speaker:null,text:'（玩了三局。芯慈贏了兩局，阿哲一直說牌不好。）'},
      {speaker:'classmate_xinci',text:'我通勤，平常很少跟同學玩到這麼晚。……其實有點羨慕你們住宿舍的。'},
      {speaker:null,text:'（打牌，第三局。阿哲又拿到一手爛牌。）'},
      {speaker:'zhe',text:'今年運氣都很差。學測數學也是，難到我想哭。你數學幾級分？'},
      {speaker:'player',text:'十五級分。'},
      {speaker:'zhe',text:'……滿級分？厲害欸。'},
      {speaker:'zhe',text:'那我以後數學問你。——不對，法律系沒有數學。'},
      {choice:[{text:'「你可以問我別的。」',goto:'ge_a'},{text:'「那你白問了。」',goto:'ge_b'}]},
      {label:'ge_a'},{speaker:'zhe',text:'好。那我叫你哥。有事問哥。'},{speaker:'player',text:'不要。'},{speaker:'zhe',text:'哥，換你出牌。'},{goto:'ge_end'},
      {label:'ge_b'},{speaker:'zhe',text:'沒有白問。現在知道這一桌誰是哥了。'},{speaker:'zhe',text:'哥，換你出牌。'},
      {label:'ge_end'},{set:{ZHE_CALLS_GE:true}},
      {speaker:'classmate_xinci',text:'（看了你們一下）你們不是今天下午才認識的嗎？'},
      {speaker:'zhe',text:'一個下午夠了。'},
      {rel:{classmate_xinci:{fam:1},zhe:{fam:1}}} ] },

  /* ↓ 以下四段 retired（AA_608 第 1 節：迎新晚會、夜遊、法律闖關不演；水大地併進第二天的一句旁白（第 10 節第 5 點）；定義留給舊存檔的 events.done，S.campY1 跳過）*/
  /* 8/22 18:00 晚餐（AA_205 3-2：芯慈宿營版）、19:30 迎新晚會（AA_205 6-5 旁白；破綻 2）*/
  { id:'ev_camp_d1_party', retired:true, stage:'any', title:'迎新宿營：迎新晚會', participants:[], location:'any', trigger:'camp', once:true, background:'dark',
    dialogue:[ {scene:'營地・餐廳',bg:'camp_dining'},
      {speaker:'classmate_xinci',text:'（看了一下手機）晚會七點，在草地。'},   /* AA_205 3-2（10-17 補宿營版）*/
      {advance:1.5},{scene:'營地・迎新晚會',bg:'camp_party_hall'},   /* 18:00 晚餐 → 19:30 晚會（AA_205 6-14 程式 4）*/
      {speaker:null,text:'（晚會是學長姐的場子。隊輔劇演的是系上的老師，台下笑得最大聲的是大二。）'},
      {speaker:null,text:'（學長姐跳舞的時候，凱文跟著小聲唱，歌詞一句都沒漏。）'},
      {inc:{CAMP_MOLE_CLUE:1},set:{CAMP_CLUE2:true}} ] },

  /* 8/22 21:30 夜遊、22:30 熄燈（AA_205 6-5；BB_177 第 5 節：跟 Kevin 走＝破綻 3、看過兩個以上破綻可以問他）*/
  { id:'ev_camp_d1_walk', retired:true, stage:'any', title:'迎新宿營：夜遊', participants:[], location:'any', trigger:'camp', once:true, background:'dark',
    dialogue:[ {scene:'營地後面的步道',bg:'camp_trail_night'},   /* 晚上：白天的步道圖調暗（BG-CAMP-NIGHT-TRAIL-1021）*/
      {speaker:null,text:'（九點半，小隊輔帶小隊走營地後面的步道。沒有路燈，大家把手機的手電筒打開。）'},
      {choice:[{text:'走前面',goto:'front'},{text:'走後面',goto:'back'},{text:'跟凱文走在一起',goto:'kv'}]},
      {label:'front'},{speaker:null,text:'（走到一半，有人說看到星星了。真的有，很多。）'},{goto:'end'},
      {label:'back'},{speaker:null,text:'（阿哲一直回頭確認你還在。）'},{goto:'end'},
      {label:'kv'},
      {speaker:null,text:'（他不用看地圖，哪裡要轉彎都知道。）'},
      {speaker:'npc_kevin',name:'凱文',text:'前面右轉喔。地上有樹根，小心。'},
      {inc:{CAMP_MOLE_CLUE:1},set:{CAMP_CLUE3:true,CAMP_WALK_KEVIN:true}},
      {if:{custom:G=>(G.flags.CAMP_MOLE_CLUE|0)>=2},choice:[{text:'「你是不是來過這裡？」',set:{CAMP_GUESS_OFFERED:true},goto:'ask'},{text:'不問',set:{CAMP_GUESS_OFFERED:true},goto:'noask'}]},
      {goto:'end'},
      {label:'ask'},{speaker:'npc_kevin',name:'凱文',text:'高中的時候跟社團來過啦。……好久以前了。'},{speaker:null,text:'（他走快了兩步，去跟前面的人講話。）'},{set:{CAMP_MOLE_GUESSED:true}},{goto:'end'},
      {label:'noask'},{speaker:null,text:'（他把手電筒照到你腳前面。）'},{speaker:'npc_kevin',name:'凱文',text:'這邊有個洞喔。'},
      {label:'end'},
      {scene:'八人寢室',bg:'econ_camp_room'},
      {speaker:null,text:'（回到寢室，十點半就熄燈了。）'} ] },
  /* 8/23 07:00 早操（AA_205 6-13①）、09:00 法律闖關（BB_177 第 6 節；祐廷上台的三種說法 AA_205 6-11；柏翰、芯慈那兩句 AA）*/
  { id:'ev_camp_d2_quiz', retired:true, stage:'any', title:'迎新宿營：法律闖關', participants:[], location:'any', trigger:'camp', once:true, background:'dark',
    dialogue:[ {scene:'營地的空地',bg:'camp_yard_day'},
      {speaker:null,text:'（七點早操。阿哲最後一個到，外套穿反了。）'},
      {advance:2},{scene:'營地的教室',bg:'camp_classroom'},   /* 07:00 早操 → 09:00 闖關；背景不用八人寢室（6-14 程式 4）*/
      {speaker:'關主學長',text:'這關很簡單。我念一個故事，你們討論五分鐘，派一個人上來講你們覺得怎樣。沒有標準答案。'},
      {speaker:'關主學長',text:'便利商店的店員把一瓶三千塊的紅酒，標價標成三百。你拿去結帳，店員刷了三百，你付了錢。隔天店長打電話給你，說標錯了，要你把酒拿回來，或是補兩千七。你要還嗎？'},
      {speaker:null,text:'（小隊圍成一圈。）'},
      {speaker:'classmate_mingxuan',text:'三百就是三百啊。標錯是他們的事。'},
      {speaker:'classmate_peishan',text:'可是如果我拿去結帳的時候，就知道他標錯了呢？那樣也算嗎？'},
      {speaker:'classmate_bohan',text:'這個一定有法條。……可是我們還沒有法條。'},
      {speaker:null,text:'（凱文張開嘴，又閉起來。）'},
      {speaker:'npc_kevin',name:'凱文',text:'我……沒意見。你們說。'},
      {speaker:'classmate_xinci',text:'還剩一分鐘。'},
      {choice:[{text:'「我上去。」',goto:'me'},{text:'「沛珊去吧，問題是她想的。」',goto:'ps'},{text:'「明軒去？」',goto:'mx'}]},
      {label:'me'},
      {choice:[{text:'「看他是寫錯，還是本來就在特價。」'},{text:'「付了錢就是我的。」'},{text:'「我會還，但我想先問清楚。」'}]},
      {speaker:'關主學姊',text:'好。我記下來了。'},{goto:'out'},
      {label:'ps'},
      {speaker:null,text:'（沛珊愣了一下，還是走上去。）'},
      {speaker:'classmate_peishan',text:'我們這隊覺得……要看買的人知不知道。'},
      {speaker:'關主學姊',text:'好。我記下來了。'},{goto:'out'},
      {label:'mx'},
      {speaker:'classmate_mingxuan',text:'我？好啦。'},
      {speaker:'classmate_mingxuan',text:'我們覺得三百就是三百。……大概啦。'},
      {speaker:null,text:'（關主學姊笑了一下。）'},
      {speaker:'關主學姊',text:'好。我記下來了。'},
      {label:'out'},
      {speaker:'關主學長',text:'每一隊講的都不一樣。很好。'},
      {speaker:'關主學長',text:'答案我不說。這個開學以後民總會教。'},
      {speaker:null,text:'（走出教室的時候，沛珊在筆記本上寫了一行字。）'} ] },

  /* 8/23 14:00 水大地（AA_205 6-6 旁白與選項；BB_177 第 7 節：裝水球的明軒、躲樹下的 Kevin）*/
  { id:'ev_camp_d2_water', retired:true, stage:'any', title:'迎新宿營：水大地', participants:[], location:'any', trigger:'camp', once:true, background:'dark',
    dialogue:[ {scene:'營地的空地',bg:'camp_field'},
      {speaker:null,text:'（下午的太陽很大。學長姐搬出三大桶水球，在空地上唱歌出題，答對的人可以潑水。）'},
      {choice:[{text:'衝前面',goto:'a'},{text:'幫忙裝水球',goto:'b'},{text:'躲在樹下',goto:'c'}]},
      {label:'a'},{speaker:null,text:'（你被三顆水球同時打中。阿哲在後面笑到蹲下去。）'},{goto:'end'},
      {label:'b'},{speaker:null,text:'（裝到第五十顆，手指都皺了。明軒過來拿了一顆。）'},{speaker:'classmate_mingxuan',text:'借一顆，試一下。'},{speaker:null,text:'（他就跑了。）'},{goto:'end'},
      {label:'c'},{speaker:null,text:'（樹下比較涼。沒多久，凱文拿著水桶走過來。）'},{speaker:'npc_kevin',name:'凱文',text:'找到了！躲樹下的都算我的！'},{speaker:null,text:'（一整桶水從頭上下來。）'},
      {label:'end'} ] },

  /* 8/23 白天（AA_608 第 10 節第 5 點：白天的活動一句旁白帶過；原本的烤肉、水大地合併成這一句）*/
  { id:'ev_camp_d2_bbq', stage:'any', title:'迎新宿營：第二天', participants:[], location:'any', trigger:'camp', once:true, background:'dark',
    dialogue:[ {scene:'營地的空地',bg:'camp_yard_day'},
      {speaker:null,text:'（第二天的活動排得很滿。你們小隊在水大地被潑得最慘。）'} ] },

  /* 8/23 20:00 營火晚會：沛珊到了（AA_608 10-7，取代第 9 節第 7 點與第 10 節第 6 點）。認識沛珊、交換聯絡方式 */
  { id:'ev_camp_d2_fire', stage:'any', title:'迎新宿營：營火晚會', participants:[], location:'any', trigger:'camp', once:true, background:'dark',
    dialogue:[ {scene:'營地・營火晚會',bg:'camp_bonfire'},
      {speaker:null,text:'（營火晚會開始沒多久，小隊輔帶著一個揹大背包的女生走過來。）'},
      {speaker:'小隊輔',text:'這是沛珊。妳先坐這邊。'},
      {speaker:null,text:'（她在你旁邊坐下，把背包放在腳邊。）'},
      {speaker:'classmate_peishan',text:'嗨！我是不是錯過很多？我是遲到一天半的那個沛珊。'},
      {choice:[{text:'「還好，昨天主要在玩遊戲。」',goto:'fine'},{text:'「妳怎麼今天才來？」',goto:'why'}]},
      {label:'fine'},{speaker:'classmate_peishan',text:'那還好。我先跑了一場中友會的宿營，台中同學辦的，今天中午才結束。'},{goto:'grp'},
      {label:'why'},{speaker:'classmate_peishan',text:'中友會也辦宿營，日期撞在一起。那邊中午一結束我就衝過來，行李都還沒打開。'},
      {label:'grp'},
      {speaker:null,text:'（營火那邊開始喊各小隊的名字。）'},
      {speaker:'classmate_peishan',text:'我們小隊有群組嗎？拉我拉我，我要補進度。'},
      {speaker:null,text:'（你把她拉進小隊的群組。她傳了一個貼圖。）'},
      {meet:[{id:'classmate_peishan',where:'camp'}],consequences:{contact:'classmate_peishan'},set:{CAMP_PS_P0:true}} ] },

  /* 夜談（8/23 22:30）原本 retired、定義留給舊存檔——CANON-1112（AA_859「一起拿掉的」）：整段定義拿掉（舊存檔不留）。story3d.js 的 S.CAMP_SEQ_V1 只用它的 id 換算時間，不讀定義 */

  /* 8/24 07:30 早餐（AA_608 第 6 節：只留餐廳那一段（AA_205 6-3），拿掉金頭腦；第 10 節第 8 點拿掉明軒那句；10-5「哥？」改由沛珊問）。
     CANON-1112：阿哲回答沛珊的那兩句都在講舊序章（AA_859 沒有新字）＝先拿掉、列給 AA；沛珊問完直接接芯慈那一句旁白 */
  { id:'ev_camp_d3_quiz', stage:'any', title:'迎新宿營：早餐', participants:[], location:'any', trigger:'camp', once:true, background:'dark',
    dialogue:[ {scene:'營地・餐廳',bg:'camp_dining'},
      {unless:{flags:['ZHE_CALLS_GE']},speaker:null,text:'（第三天早上，大家都很睏，餐廳裡沒什麼人講話。）'},   /* AA_205 6-14④ */
      {if:{flags:['ZHE_CALLS_GE']},speaker:'zhe',text:'（隔著桌子）哥，你的蛋。'},
      {if:{flags:['ZHE_CALLS_GE']},speaker:'classmate_peishan',text:'哥？'},   /* AA_608 10-5：芯慈打牌時已經知道了，改成第二天才到的沛珊問 */
      {if:{flags:['ZHE_CALLS_GE']},speaker:null,text:'（芯慈「喔」了一聲，繼續吃。）'} ] },

  /* 8/24 10:30 結業式、上車（AA_205 6-13⑤）、12:30 回到校門（AA_205 6-4）*/
  { id:'ev_camp_d3_end', stage:'any', title:'迎新宿營：結業式', participants:[], location:'any', trigger:'camp', once:true, background:'dark',
    dialogue:[ {scene:'營地的空地',bg:'camp_yard_day'},
      {speaker:null,text:'（結業式很短。系學會會長說了一句「開學見」，大家就去搬行李了。）'},
      {scene:'遊覽車上',bg:'tour_bus'},
      {speaker:null,text:'（回程的車上，大部分的人都睡著了。阿哲睡得最早。）'},
      {advance:2},{scene:'首都帝大校門口',bg:'dark'},   /* 10:30 結業式 → 12:30 回到校門（6-14 程式 4）*/
      {speaker:null,text:'（十二點半，遊覽車停在校門口。大家拖著行李，往不同的方向走。）'},
      {speaker:'zhe',text:'我先回高雄，29 號再上來搬宿舍。'},
      {choice:[{text:'「好，開學見。」'},{text:'「這麼遠還跑一趟？」',goto:'far'}]},
      {goto:'end'},
      {label:'far'},{speaker:'zhe',text:'宿營很好玩啊。'},
      {label:'end'},
      {set:{CAMP_Y1:true}} ] }
];
Array.prototype.push.apply(STORY_EVENTS,CAMP_Y1_EVENTS);
