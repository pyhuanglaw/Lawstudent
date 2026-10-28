/* ===== BB 事件包：BB_105 法律系時期還沒做的幾件、BB_106 SK08～SK10／SK14、BB_110 L4、BB_106 第 389 行（可昕和品妤在社科院門口）=====
   任務：V3-B105-P5、V3-B105-G2、V3-B105-B2、V3-B105（AA_153 的十五件）、V3-SK08、V3-SK09、V3-SK10、V5-SK14、V3-B110-L4、BB106-L389-1022。
   台詞一字照稿（企劃線 origin/claude/cool-heisenberg-o8kuqx）：
     BB_105 @3954f9b62（白名單 68a8479e；兩版只差 AA_383 第 1～3 點的「念過一個多月」和阿勳、品妤的重新介紹，這裡用遊戲已經在用的那兩句）；
     BB_137 @a047e5feb（白名單同一版）；AA_153 @c7f4ada86（AB-05 完成後最後一次審過的版本；之後的 09ecee83a 是沒審的 WIP，只把 18 週制的週次改成 16 週制，這裡照 16 週制排）；
     AA_430 @7525db6a5（白名單 2eb3041f0：B6b、B12 的台詞，AA 補 BB 稿沒有的字）；
     BB_106 @3954f9b62（白名單 71b3e6c3，SK08～SK10、SK14、第 389 行兩版相同）；BB_110 @3a26e94af；AA_383 第 7 節 @bc8a1f5d4；AA_289 第 5-4 節 @3a26e94af（沛珊的四件改依附以安的公法讀書會／還筆記）。
   時間、條件、手機訊息在 src/bbpack3d.js（BBPACK）；這裡只放事件。日文班三個人（采蓁、立衡、宇恆）在 characters.js（jp_caizhen、jp_liheng、jp_yuheng）；台詞用稱呼說話（和日本路線的 ev_liheng_japan 一樣）。
   測試：node tests/bbpack_unit.js */
'use strict';
const BBPACK_EVENTS=(function(){
  const B=()=>typeof BBPACK!=='undefined'?BBPACK:null;
  const C=fn=>({custom:(G,GM)=>{ const b=B(); return !!b&&!!fn(b,G,GM); }});
  const KN=(...ids)=>({custom:()=>typeof SOCIAL!=='undefined'&&ids.every(id=>SOCIAL.has(id,'FIRST_MET'))});
  const FI=(k,v)=>({flagIs:{[k]:v}});
  const nar=t=>({speaker:null,text:t}), say=(s,t)=>({speaker:s,text:t}), me=t=>({speaker:'player',text:t});
  const IF=(c,l)=>Object.assign({if:c},l), UN=(c,l)=>Object.assign({unless:c},l);
  const PS='classmate_peishan', AN='heroine_01', YT='heroine_03', ZR='heroine_02', SIS='heroine_05', XC='classmate_xinci', BH='classmate_bohan', MX='classmate_mingxuan';
  /* 校園上的門口（near）：大一女舍門口的長椅（同 ev_b106_d1_bench）、社科院大樓正門（同 SK06）、普通／博雅／共同教學館的正門（classes3d.js DOORS；出館的落點也在範圍內）、文學院的門廊 */
  const FDORM={x:-93,z:54.26,r:3.5}, SOC={x:16,z:-85,r:3.5}, PUTONG={x:-38,z:-48.4,r:4}, BOYA_DOOR={x:-38,z:-71.7,r:4}, GONGTONG={x:2,z:21.7,r:4}, ARTS={x:-38,z:-21.5,r:4};
  const EV=[];

  /* ================= 共同教學館：日文班（BB_105 3-3、BB_137 第 1 節；AA_153 第 1 節的時間）=================
     日文上＝大二上、日文下＝大二下，週一 13:20～15:10 共同教學館 102（courses.js japanese_1／japanese_2）。認識三個人＝JP_MET（G1，同時 SOCIAL.meet）。熟悉度：關係的 fam +1，另外記 JP_FAM_CAIZHEN／LIHENG／YUHENG */
  /* G1 日文上的第一堂：第一次去上日文的那一堂（CLS.IN_CLASS，老師那一句之後）。第 1 週那一堂的點名換成這一段（課表 syllabus 第 1 週的自我介紹選項不再問一次）；
     不是第 1 週（第一次去就晚了）才有老師開頭那一句 */
  EV.push({ id:'ev_jp_g1', title:'はじめまして', participants:[], location:'any', trigger:'manual', once:true, background:'blur',
    dialogue:[ IF(C(b=>!b._g1w1),say('日文老師','一人ずつ、自己紹介をお願いします。……用中文補充也可以。')),
      say('采蓁','はじめまして！獸醫系三年級！我想看懂日劇不用字幕！'),
      say('立衡','……機械系四年級。想去日本念書。よろしくお願いします。'),
      nar('（輪到{name}。）'),
      {choice:[{text:'「法律系二年級。……想多會一種語言。」',hint:'認真',set:{JP_G1_INTRO:'serious'},goto:'end'},{text:'「はじめまして。我只會說はじめまして。」',hint:'搞笑',set:{JP_G1_INTRO:'funny'},goto:'f'},{text:'「よろしく。」',hint:'最短',set:{JP_G1_INTRO:'short'},goto:'s'}]},
      {label:'f'},nar('（采蓁笑出來。）'),{goto:'end'},
      {label:'s'},say('日文老師','……很省。'),
      {label:'end'},{set:{JP_MET:true}} ],
    consequences:{meet:[{id:'jp_caizhen',where:'gongtong'},{id:'jp_liheng',where:'gongtong'},{id:'jp_yuheng',where:'gongtong'}],memo:'日文上的第一堂：認識了采蓁、立衡、宇恆'} });   /* 三個人在 characters.js（jp_caizhen、jp_liheng、jp_yuheng）：這一堂才算認識 */
  /* G2 發音的小遊戲：日文上第 2～7 週的下課（15:10），四成（照日子擲）；四題照順序、用完從頭；第一次記 JP_PARTNER */
  const G2Q=n=>FI('JP_G2_Q',n);
  EV.push({ id:'ev_jp_g2', title:'', participants:[], location:'any', trigger:'class', afterClass:'japanese_1', term:['Y2S1'], weeks:[2,3,4,5,6,7], background:'blur',
    prereq:{flags:['JP_MET'],custom:G=>{ const b=B(); return !!b&&b.roll(G,'g2')<0.4; }},
    dialogue:[ {call:G=>{ G.flags.JP_G2_Q=((G.flags.JP_G2_N|0)%4)+1; }},
      say('采蓁','練習搭檔！老師說要找人互相聽。'),
      say('采蓁','兩個字，你選一個念，我們猜你念哪個。'),
      IF(G2Q(1),say('采蓁','おばさん和おばあさん。差一個長音。')),
      IF(G2Q(1),{choice:[{text:'「おばさん。」',goto:'q1a'},{text:'「おばあさん。」',goto:'q1b'}]}),
      IF(G2Q(2),say('立衡','ビル和ビール。一樣差一個長音。')),IF(G2Q(2),say('采蓁','一個是大樓，一個是啤酒。')),
      IF(G2Q(2),{choice:[{text:'「ビル。」',goto:'q2a'},{text:'「ビール。」',goto:'q2b'}]}),
      IF(G2Q(3),say('采蓁','きて和きって。中間要停一拍。')),IF(G2Q(3),say('立衡','停一拍，就從「來」變成「郵票」。')),
      IF(G2Q(3),{choice:[{text:'「きて。」',goto:'q3a'},{text:'「きって。」',goto:'q3b'}]}),
      IF(G2Q(4),say('采蓁','いえ和いいえ。一個是家，一個是不是。')),
      IF(G2Q(4),{choice:[{text:'「いえ。」',goto:'q4a'},{text:'「いいえ。」',goto:'q4b'}]}),
      {label:'q1a'},say('立衡','阿姨。'),say('采蓁','拉長就變阿嬤了。好險。'),{goto:'end'},
      {label:'q1b'},say('采蓁','阿嬤！拉得很長，很有誠意。'),{goto:'end'},
      {label:'q2a'},say('立衡','大樓。……很清楚。'),{goto:'end'},
      {label:'q2b'},say('采蓁','啤酒！你念這個特別有感情。'),{goto:'end'},
      {label:'q3a'},say('采蓁','來！……好，我來了。'),{goto:'end'},
      {label:'q3b'},say('立衡','郵票。停得剛好。（他在筆記本上打了一個勾）'),{goto:'end'},
      {label:'q4a'},say('立衡','家。'),say('采蓁','你回家了。'),{goto:'end'},
      {label:'q4b'},say('采蓁','不是！……你拒絕我。'),
      {label:'end'},
      UN({flags:['JP_PARTNER']},say('采蓁','以後練習就找你了，搭檔。')),{set:{JP_PARTNER:true}},
      {inc:{JP_G2_N:1,JP_FAM_CAIZHEN:1,JP_FAM_LIHENG:1},rel:{jp_caizhen:{fam:1},jp_liheng:{fam:1}}} ],
    after:G=>{ delete G.flags.JP_G2_Q; } });
  /* G3 采蓁的日劇台詞：日文上第 2～7、10～15 週，週一上課前（12:50 起可以坐下；13:20 上課），五成；五題不重複，猜對記 JP_DRAMA_<n>；選錯不扣分，熟悉度一樣 +1 */
  const G3Q=n=>FI('JP_G3_Q',n);
  const g3=(n,line,opts)=>[IF(G3Q(n),say('采蓁',line)),IF(G3Q(n),{choice:opts.map(([t,ok],i)=>({text:t,set:ok?{['JP_DRAMA_'+n]:true}:undefined,goto:'q'+n+'_'+(i+1)}))})];
  EV.push({ id:'ev_jp_g3', title:'', participants:[], location:'any', trigger:'class', beforeClass:'japanese_1', term:['Y2S1'], weeks:[2,3,4,5,6,7,10,11,12,13,14,15], time:[12+50/60,13+20/60], background:'blur',
    prereq:{flags:['JP_MET'],custom:G=>{ const b=B(); return !!b&&b.roll(G,'g3')<0.5&&b.g3Next(G)!=null; }},
    dialogue:[ {call:G=>{ G.flags.JP_G3_Q=B().g3Next(G); }},
      say('采蓁','欸，考你。昨天的日劇有一句——'),
      ...g3(1,'「お疲れさまです。」',[['「辛苦了。」',1],['「你看起來很累。」',0],['「我先走了。」',0]]),
      ...g3(2,'「ただいま。」',[['「我回來了。」',1],['「現在幾點？」',0],['「等一下。」',0]]),
      ...g3(3,'「別に。」',[['「沒什麼。」',1],['「其實很在意。」',1],['「分手吧。」',0]]),
      ...g3(4,'「よろしくお願いします。」',[['「請多指教。」',0],['「拜託你了。」',0],['「兩個都是。」',1]]),
      ...g3(5,'「まさか。」',[['「不會吧。」',1],['「真的嗎？」',0],['「馬上。」',0]]),
      {label:'q1_1'},say('采蓁','對！日劇裡上班的人，一天說二十次。'),{goto:'end'},
      {label:'q1_2'},say('采蓁','字面很像……可是他們見面就說，不是說你臉色差。'),{goto:'end'},
      {label:'q1_3'},say('采蓁','差一點。下班時說，是有一點這個意思。'),{goto:'end'},
      {label:'q2_1'},say('采蓁','對！家裡的人要回「おかえり」。……我室友都不回我。'),{goto:'end'},
      {label:'q2_2'},say('采蓁','那是「いま、なんじ」。……你很想下課。'),{goto:'end'},
      {label:'q2_3'},say('采蓁','那是「ちょっと待って」。不過很接近生活。'),{goto:'end'},
      {label:'q3_1'},say('采蓁','字面是。可是說「別に」的人，通常都有什麼。'),{goto:'end'},
      {label:'q3_2'},say('采蓁','你很懂日劇！說這句的人，九成都很在意。'),{goto:'end'},
      {label:'q3_3'},say('采蓁','那是「別れ」。差一個字，差很多。'),{goto:'end'},
      {label:'q4_1'},say('采蓁','對一半！拜託人的時候也說。'),{goto:'end'},
      {label:'q4_2'},say('采蓁','對一半！見面的時候也說。'),{goto:'end'},
      {label:'q4_3'},say('采蓁','都對！日文最萬用的一句。'),{goto:'end'},
      {label:'q5_1'},say('采蓁','對！日劇發現真相的時候，一定有人說這句。'),{goto:'end'},
      {label:'q5_2'},say('采蓁','有一點像。可是「まさか」是不想相信。'),{goto:'end'},
      {label:'q5_3'},say('采蓁','那是「すぐ」。……你真的很想下課。'),
      {label:'end'},{inc:{JP_FAM_CAIZHEN:1},rel:{jp_caizhen:{fam:1}}} ],
    after:G=>{ const n=G.flags.JP_G3_Q; delete G.flags.JP_G3_Q; if(n){ const L=Array.isArray(G.flags.JP_G3_USED)?G.flags.JP_G3_USED:(G.flags.JP_G3_USED=[]); if(!L.includes(n)) L.push(n); } } });
  /* G4 考前一起讀單字：第 7 週（小考那天，期中前）、第 16 週（口試考完）的下課；日文上、日文下都有（BB_137 1-3 日文下第 16 週多一句）。同一堂下課先演這一件（classFirst）*/
  const g4=(id,course,term,week,fin)=>({ id, title:'', participants:[], location:'any', trigger:'class', afterClass:course, afterExam:fin?'final':undefined, classFirst:true, once:true, term:[term], weeks:[week], background:'blur',
    prereq:{flags:['JP_MET']},
    dialogue:[ ...(fin?[say('立衡','口試考完了。還有筆試。'),say('采蓁','這學期最後一次了，一起吧？')]:[say('立衡','下週期中。我把單字做成卡片了。'),say('采蓁','立衡的卡片比課本還清楚。一起嗎？')]),
      ...(fin&&term==='Y2S2'?[say('采蓁','一年了耶。我們從はじめまして，讀到這裡。')]:[]),
      {choice:[{text:'「一起讀。」',goto:'y'},{text:'「我先走了。」',goto:'n'}]},
      {label:'y'},nar('（一個小時。立衡翻卡片，采蓁念，你答。）'),say('立衡','錯的放左邊。……左邊比較高。'),say('采蓁','高的那疊是我的。'),
      {set:{['JP_VOCAB_'+(fin?'期末':'期中')+(term==='Y2S2'?'_下':'')]:true}},{inc:{JP_FAM_CAIZHEN:1,JP_FAM_LIHENG:1},rel:{jp_caizhen:{fam:1},jp_liheng:{fam:1}}},{advance:1},{goto:'end'},
      {label:'n'},say('采蓁','好！じゃあね！考試加油！'),
      {label:'end'} ] });
  EV.push(g4('ev_jp_g4_mid1','japanese_1','Y2S1',7,false),g4('ev_jp_g4_fin1','japanese_1','Y2S1',16,true),g4('ev_jp_g4_mid2','japanese_2','Y2S2',7,false),g4('ev_jp_g4_fin2','japanese_2','Y2S2',16,true));
  /* G4b 小考與課後的活大：日文上、日文下第 12 週的下課（下課前十分鐘小考）。一起去＝2D 活大（底圖沿用小福，AA_186 4-4）、時間 +40 分；不去＝日文班群組宇恆一句 */
  const g4b=(id,course,term)=>({ id, title:'', participants:[], location:'any', trigger:'class', afterClass:course, once:true, term:[term], weeks:[12], background:'blur',
    prereq:{flags:['JP_MET']},
    dialogue:[ say('宇恆','小考考完了。我要吃東西，腦袋沒電。'),say('采蓁','活大！走！'),
      {choice:[{text:'「一起去。」',goto:'y'},{text:'「今天不行。」',goto:'n'}]},
      {label:'y'},{scene:'活大・自助餐',bg:'xiaofu'},
      ...(term==='Y2S1'?[say('宇恆','我寫了「きのう、ねました」。昨天睡了。'),say('采蓁','那是事實吧。')]:[say('宇恆','這次我有準備。……錯一題，授受動詞。'),say('采蓁','誰給誰？'),say('宇恆','我給了老師一個錯。')]),
      {inc:{JP_FAM_YUHENG:1},rel:{jp_yuheng:{fam:1}}},{advance:40/60},{goto:'end'},
      {label:'n'},{call:G=>{ const b=B(); if(b) b.jpPost(G,'宇恆','活大的雞腿飯，我替你吃了。'); }},
      {label:'end'} ] });
  EV.push(g4b('ev_jp_g4b1','japanese_1','Y2S1'),g4b('ev_jp_g4b2','japanese_2','Y2S2'));
  /* G4c 期末會話口試的前一晚：第 15 週週日 20:00 日文班群組（BBPACK.phone），21:00 博雅一樓的小桌子（自習區）。走過去就演（21:00～22:30）；沒去＝隔天中午群組采蓁一句。
     隔天（第 16 週週一的口試）上課的開頭一句旁白（beforeClass）*/
  const g4c=(id,term)=>({ id, title:'期末會話口試的前一晚', participants:[], location:'boya', room:'study', trigger:'auto', once:true, term:[term], weeks:[15], weekday:[0], time:[21,22.5], background:'blur',
    prereq:{flags:['JP_MET'],custom:G=>typeof PHONE!=='undefined'&&PHONE.sent(G,'jp_g4c_'+term)},
    dialogue: term==='Y2S1'?[ say('立衡','兩個人一組。……宇恆跟我。'),say('采蓁','那我跟你！你要當店員，還是客人？'),
        {choice:[{text:'「店員。」',goto:'a'},{text:'「客人。」',goto:'b'}]},
        {label:'a'},me('いらっしゃいませ。'),say('采蓁','えっと……これ、ください！'),me('……かしこまりました。'),say('采蓁','你好像真的店員！'),{goto:'end'},
        {label:'b'},say('采蓁','いらっしゃいませ！何名様ですか？'),me('……ひとりです。'),say('采蓁','一個人來吃飯，好寂寞的客人。'),
        {label:'end'},say('宇恆','我們這組，我一直說すみません。'),say('立衡','……那是對的。'),{set:{JP_ORAL_PRACTICE_上:true}} ]
      :[ say('采蓁','三個人一組：問路的、知道路的、不知道路的。'),say('采蓁','你要當哪一個？'),
        {choice:[{text:'「問路的。」',goto:'a'},{text:'「不知道路的。」',goto:'b'}]},
        {label:'a'},me('すみません、駅はどこですか。'),say('立衡','まっすぐ行って、右です。'),say('宇恆','……立衡講太快了。'),{goto:'end'},
        {label:'b'},say('宇恆','すみません、駅は……'),me('すみません、わかりません。'),say('采蓁','老師說要誠實說不知道。你好誠實！'),
        {label:'end'},say('立衡','明天，說錯了就再說一次。'),{set:{JP_ORAL_PRACTICE_下:true}} ] });
  EV.push(g4c('ev_jp_g4c1','Y2S1'),g4c('ev_jp_g4c2','Y2S2'));
  EV.push({ id:'ev_jp_g4c1_next', title:'', participants:[], location:'any', trigger:'class', beforeClass:'japanese_1', once:true, term:['Y2S1'], weeks:[16], background:'blur',
      prereq:{events:['ev_jp_g4c1']}, dialogue:[ nar('采蓁抽到點餐那題。她回頭對你比了一個讚。') ] },
    { id:'ev_jp_g4c2_next', title:'', participants:[], location:'any', trigger:'class', beforeClass:'japanese_2', once:true, term:['Y2S2'], weeks:[16], background:'blur',
      prereq:{events:['ev_jp_g4c2']}, dialogue:[ nar('采蓁抽到問路那題。她回頭對你比了一個讚。') ] });
  /* G5 日文下：認得的人，空出來的位子——第一次去上日文下的那一堂，上課前（日文上認識他們的玩家；沒上過日文上的，第一次去就是 G1）*/
  EV.push({ id:'ev_jp_g5', title:'認得的人，空出來的位子', participants:[], location:'any', trigger:'class', beforeClass:'japanese_2', once:true, term:['Y2S2'], background:'blur',
    prereq:{flags:['JP_MET'],custom:G=>{ const b=B(); return !!b&&b.attendN(G,'japanese_2')===0; }},
    dialogue:[ nar('（宇恆坐在第一排。采蓁回頭對你揮手。靠窗那個位子空著。）'),
      {choice:[{text:'「那個同學呢？」',goto:'a'},{text:'（坐下）',goto:'b'}]},
      {label:'a'},say('日文老師','他說他想先把本科顧好。'),{goto:'end'},
      {label:'b'},say('采蓁','宇恆上學期都坐最後面耶。'),say('宇恆','文法跟寫程式很像。有規則。'),
      {label:'end'} ] });
  /* G6 「大丈夫」不一定是沒事：日文下第 10 週那一堂（courses.js 的 special；CLS.IN_CLASS）。課表的提問（三個讀法，沒有對錯）先問，接著這五句（AA-C 審過的版本：
     拿掉了采蓁「所以學語言，是在學看人」和老師「生活考這個」，課表 syllabus 第 10 週還留著那兩句——點名的收尾換成這一段）。記 attended：r2y4a_events.js 的 G6 照舊看那一堂有沒有去 */
  EV.push({ id:'ev_jp_g6', title:'「大丈夫」不一定是沒事', participants:[], location:'any', trigger:'manual', once:true, background:'blur',
    dialogue:[ say('日文老師','同一句「大丈夫です」，可以是「沒關係」，也可以是「不用了」。'),
      say('日文老師','要看前面那一句，和說的人的表情。'),
      say('采蓁','所以要看臉？'),
      say('立衡','……那考試怎麼考？'),
      say('日文老師','考試考單字。'),
      {set:{JP_G6:true}} ] });
  /* G7 立衡的申請（＝3-1 的「我申請上了」）：日文下那一學期的後半（第 10～16 週，「日文下快結束時」），平日 10:00～17:00 經過共同教學館門口，一天擲一次三成五；修過日文、認識他 */
  EV.push({ id:'ev_jp_g7', title:'立衡的申請', participants:[], location:'campus', trigger:'auto', near:GONGTONG, once:true, tier:'short', building:'gongtong_front', term:['Y2S2'], weeks:[10,11,12,13,14,15,16], weekday:[1,2,3,4,5], time:[10,17], background:'blur',
    prereq:{flags:['JP_MET'],custom:G=>{ const b=B(); return !!b&&b.tookJp(G)&&b.roll(G,'g7')<0.35; }},
    dialogue:[ nar('（共同教學館門口。立衡手上拿著一個牛皮紙信封。）'),
      say('立衡','我申請上了。日本的研究所。'),
      {choice:[{text:'「恭喜。去了要寄照片。」',set:{LIHENG_TOLD:'wish'},goto:'w'},{text:'「你怎麼準備的？」',set:{LIHENG_TOLD:'ask'},goto:'a'}]},
      {label:'w'},nar('（他在方格筆記本上寫了一行。）'),say('立衡','好。'),{goto:'end'},
      {label:'a'},nar('（他講了十分鐘的研究計畫。你聽懂一半。）'),
      {label:'end'},{inc:{JP_FAM_LIHENG:1},rel:{jp_liheng:{fam:1}}} ] });

  /* ================= 博雅教學館（BB_105 4-2、4-4；BB_137 第 2 節；AA_153 第 2 節）=================
     講座用 3D 現有的大教室（博雅 101，坐下選「聽演講」＝坐到下一段，AA_115 第 3 節；和 B4、交換說明會同一間）——活動清單（ACTIVITIES）在檔尾。
     AA_399 第 10 節（10-23）寫 B6、B7、B10b、B12「實作的時候用 103」：103 現在是關著的房間，開了以後把活動的 room 改成 '103' 就好 */
  /* B6 跨領域講座「經濟和法律，在同一張桌子上」：大二上第 6 週週二 18:30～20:00。前一個週六芯慈私訊（BBPACK.phone）；沒收到訊息、認識阿勳的玩家：週二傍晚在博雅門口遇到阿勳 */
  const knowXun=C((b,G)=>b.knowXun(G));
  EV.push({ id:'ev_b6_xun_door', title:'', participants:[], location:'campus', trigger:'auto', near:BOYA_DOOR, once:true, term:['Y2S1'], weeks:[6], weekday:[2], time:[18,18.5], background:'blur',
    prereq:{custom:G=>{ const b=B(); return !!b&&b.knowXun(G)&&!(typeof PHONE!=='undefined'&&PHONE.sent(G,'bb_b6_dm')); }},
    dialogue:[ UN({flags:['MET_XUN']},say('阿勳','盧正勳。你經濟系那年的室友。……你該不會連我都忘了。')),
      say('阿勳','你也來聽？……芯慈約的吧。她約了全世界。'),{set:{MET_XUN:true}} ] });
  EV.push({ id:'ev_b6_lecture', title:'經濟和法律，在同一張桌子上', participants:[], location:'boya', trigger:'activity', once:true, background:'blur',
    dialogue:[ IF({any:[knowXun,KN(XC)]},nar('（芯慈占了一整排，阿勳和品妤坐在旁邊。）')),
      IF(knowXun,UN({flags:['MET_PINYU']},say('品妤','曾品妤。經濟系，可昕以前的室友。'))),
      IF(knowXun,say('品妤','我是陪他來的。我只聽前半場。')),IF(knowXun,say('阿勳','她每次都這樣說，每次都聽完。')),
      UN(knowXun,IF(KN(XC),say(XC,'這是阿勳，統計課的。這是品妤。'))),
      IF({any:[knowXun,KN(XC)]},{set:{MET_XUN:true,MET_PINYU:true}}),
      nar('講者說，同一份契約，經濟學問怎樣最有效率，法律問誰信任了誰。'),
      IF({any:[knowXun,KN(XC)]},nar('你發現，左邊的芯慈和右邊的阿勳，在同一句話寫下了不一樣的筆記。')) ],
    consequences:{memo:'博雅 101 聽講座：「經濟和法律，在同一張桌子上」'} });
  /* SK09 兩個系的同一題（BB_106）：B6 聽完（attended，中途離開不算）、散場（justEnded）、兩個朋友圈接上了（ECON_LAW_BRIDGE）。講座結束就接著演（afterActivity；坐到結束沒選「聽演講」的，散場 20 分鐘內在博雅裡也會演）。
     走廊 → 活大（2D，底圖沿用小福）；吵的題目、轉頭看你是稿上的說明，改成旁白。記 TRANSLATOR（SK10 讀）*/
  EV.push({ id:'ev_sk09', title:'兩個系的同一題', participants:[], location:'boya', trigger:'auto', activity:'B6', activityPhase:'justEnded', afterActivity:'B6', once:true, background:'blur',
    prereq:{attended:['B6'],flags:['ECON_LAW_BRIDGE']},
    dialogue:[ nar('（走廊上，阿勳和芯慈在吵：違約的人只要賠錢就好嗎？阿勳講效率，芯慈講信賴。）'),
      nar('（兩個人同時轉頭看你。）'),say('芯慈、阿勳','你說。'),
      {choice:[{text:'翻給阿勳聽：「她說的是，約定本身就有價值，不只是那筆錢。」',set:{SK09_CHOICE:'xun'}},{text:'翻給芯慈聽：「他說的是，如果賠得夠，大家都不會比較差。」',set:{SK09_CHOICE:'xinci'}},{text:'兩邊都翻，最後補一句：「你們只是在吵要賠多少。」',set:{SK09_CHOICE:'both'}}]},
      {scene:'活大',bg:'xiaofu'},
      say('品妤','活大的吸管太細了。'),say('芯慈、阿勳','……這倒是。'),
      {set:{TRANSLATOR:true,MET_XUN:true,MET_PINYU:true}},{advance:0.5} ],
    consequences:{memo:'博雅的走廊：芯慈和阿勳吵同一題，你替兩邊翻譯'} });
  /* B6b 公共政策的講座「一條法律是怎麼被寫出來的」（BB_105 4-1b 第 3 場、4-2；台詞 AA_430 第 1 節 @7525db6a5）：大二上第 10 週（期中考第 8～9 週以後）週三 19:00～20:30，博雅 102（AA_430「週三晚上七點，博雅 102」）。
     前兩天（週一）21:00 以安在麵店團群組、柏翰回（BBPACK.phone；稿：玩家的回覆不影響能不能去——稿沒有回覆的字，這裡不給回覆選項）；沒去（missed）＝那天 21:30 柏翰在群組一句。
     講座：坐下選「聽演講」＝這一段（中途離開的玩家照 B4 的做法沒有這一段，也就沒有最後兩句）；（時間往前跳。）＝前四句之後時鐘往前 45 分鐘（晚到的不跳）。
     散場（聽完、認識以安）：講座一結束就接著演（afterActivity，和 SK09、B12 一樣）；稿的「走到以安旁邊 npcNear」沒有做（她的作息沒有排進博雅）。
     以安熟悉 +1；第二個選項的「公司法」＝她商事法興趣的第一個線索（AA_285，玩家不用知道），選了什麼記 B6B_PICK */
  EV.push({ id:'ev_b6b_lecture', title:'一條法律是怎麼被寫出來的', participants:[], location:'boya', trigger:'activity', once:true, background:'blur',
    dialogue:[ nar('講者以前在立法機關當過很多年的助理。投影片很少，大部分時間他在講故事。'),
      say('講者','一條條文，從草案到通過，常常改了十幾次。'),
      say('講者','有時候只改一個字。「得」改成「應」。'),
      say('講者','一個字改了，就有一群人的生活跟著不一樣。'),
      {if:{custom:G=>(G.hour%24)<19.5},advance:0.75},
      say('講者','你們以後讀到的每一條，都有人在會議室裡吵過。去找那些紀錄來看。'),
      IF(KN(AN),nar('掌聲。以安在筆記本上寫了一行字，畫了兩條線。')),UN(KN(AN),nar('掌聲。')) ],
    consequences:{memo:'博雅 102 聽講座：「一條法律是怎麼被寫出來的」'} });
  EV.push({ id:'ev_b6b_after', title:'', participants:[], location:'boya', trigger:'auto', activity:'B6b', activityPhase:'justEnded', afterActivity:'B6b', once:true, background:'blur',
    prereq:{attended:['B6b'],memory:[{npc:AN,tag:'FIRST_MET'}]},
    dialogue:[ IF(KN(BH),say(BH,'三讀的順序，跟課本一樣。我先回總圖。')),IF(KN(BH),nar('（柏翰走了。以安靠在走廊的窗邊，還在看她的筆記。）')),UN(KN(BH),nar('（以安靠在走廊的窗邊，還在看她的筆記。）')),
      say(AN,'「得」改成「應」，就有一群人要多做一件事。'),
      say(AN,'……我想知道那一群人是誰。'),
      {choice:[{text:'「妳以後想寫法條？」',set:{B6B_PICK:'write'},goto:'w'},{text:'「會議紀錄很長喔。」',set:{B6B_PICK:'minutes'},goto:'m'},{text:'（聽她說）',set:{B6B_PICK:'listen'},goto:'l'}]},
      {label:'w'},say(AN,'我想先看懂。……寫是很久以後的事。'),{goto:'end'},
      {label:'m'},say(AN,'我知道。我已經下載了一份。'),say(AN,'公司法那次修的。我想看他們吵什麼。'),{goto:'end'},
      {label:'l'},nar('（她講了十分鐘。中間停下來兩次，問你有沒有在聽。）'),
      {label:'end'},say(AN,'好，我講完了。我回宿舍讀書。'),{rel:{[AN]:{fam:1}}} ],
    consequences:{memo:'博雅的走廊：以安想知道「得」改成「應」的那一群人是誰'} });
  /* B7 土地、財產權與城市的講座（4-1b 第 4 場「老房子、租屋與城市」）：大二下第 6 週週三 19:00～20:30（語彤週二、四晚上在麵店幫忙，週三 17:40 在 118 巷吃晚餐）；
     語彤週一 21:00 在麵店團群組轉了一張海報（BBPACK.phone）。提問時間在後段：講座開頭時鐘往前跳到 20:10（同 B4 的寫法）。認識語彤才有她的那一段 */
  EV.push({ id:'ev_b7_lecture', title:'老房子、租屋與城市', participants:[], location:'boya', trigger:'activity', once:true, background:'blur',
    prereq:KN(YT),
    dialogue:[ {if:{custom:G=>(G.hour%24)<20+10/60},advance:G=>20+10/60-(G.hour%24)},
      nar('（提問時間。語彤舉手，停了很久。）'),
      say(YT,'嗯……老房子拆掉以後，原本在樓下吃麵的人，要去哪裡？'),
      nar('（講者想了一下：「這是一個很好的問題。我沒有答案。」）'),
      {set:{B7_HEARD:true}} ],
    consequences:{memo:'博雅 101 聽講座：語彤在提問時間舉手'} });
  /* B8 教育與人生選擇的講座（4-1b 第 7 場「我們為什麼要上學？」）：大三上第 5 週週五 15:30～17:00；17:00～17:30 經過博雅門口（散場）遇到學姊（碩二，只是聽眾）。
     沛珊那一段 AA-C 拿掉了（她不回台大）；不推進任何感情線。稿寫「記 attended:'B8'」：到場紀錄只記真的坐在 101 聽的人，這裡另外記 B8_SEEN */
  EV.push({ id:'ev_b8_door', title:'', participants:[SIS], location:'campus', trigger:'auto', near:BOYA_DOOR, once:true, tier:'short', building:'boya_front', term:['Y3S1'], weeks:[5], weekday:[5], time:[17,17.5], background:'blur',
    prereq:{memory:[{npc:SIS,tag:'FIRST_MET'}],custom:G=>{ const b=B(); return !!b&&b.here(SIS,G); }},
    dialogue:[ nar('（散場的人群裡，學姊抱著筆記走出來，看到你。）'),
      say(SIS,'你也來聽？'),
      say(SIS,'後半段講法律扶助的教育，我是為那段來的。……先走了，七點還有東西要交。'),
      {set:{B8_SEEN:true}} ] });
  /* B10 大四的小桌子（AA 寫，AA_153 第 6 節）：大四上、大四下平日 19:00～22:00 走進博雅自習區，一天擲一次三成；可重複（一天一次），懷舊那個選項只一次。
     開場三組輪流（只輪認識的人）；推甄放榜（大四上第 12 週）以後柏翰換那一句。有 SK10 匯率紀錄的玩家，第一次多一句旁白（BBPACK.rateLine，照實際紀錄組句）*/
  const B10O=n=>FI('B10_OPEN',n);
  EV.push({ id:'ev_b10_table', title:'', participants:[], location:'boya', room:'study', trigger:'auto', tier:'short', building:'boya', cooldown_days:1, term:['Y4S1','Y4S2'], weekday:[1,2,3,4,5], time:[19,22], background:'blur',
    prereq:{any:[KN('zhe'),KN('yu'),KN(BH)],custom:G=>{ const b=B(); return !!b&&b.roll(G,'b10')<0.3; }},
    dialogue:[ {call:G=>{ const b=B(); G.flags.B10_OPEN=b?b.b10Open(G):null; G.flags.B10_RATE_TEXT=b&&!G.flags.B10_RATE_SAID?b.rateLine(G):null; }},
      IF(B10O('zhe'),say('zhe','坐。這桌是國考桌。Alison 說不能講話，所以我們用寫的。')),
      IF(B10O('yu'),say('yu','（推一包餅乾過來，便利貼上寫「吃。不要出聲。」）')),
      IF(B10O('bohan'),UN(C((b,G)=>b.bohanIn(G)),say(BH,'我在讀研究所要用的書。……提早讀，比較不怕。'))),
      IF(B10O('bohan'),IF(C((b,G)=>b.bohanIn(G)),say(BH,'我上了。我來陪考。……順便讀我自己的。'))),
      IF({custom:G=>!!G.flags.B10_RATE_TEXT},nar('{flag:B10_RATE_TEXT}')),IF({custom:G=>!!G.flags.B10_RATE_TEXT},{set:{B10_RATE_SAID:true}}),
      {choice:[{text:'（坐下讀一點）',goto:'r'},{text:'「聊兩句就走。」',goto:'t'},{text:'「大一民總那一題……」',unless:{flags:['B10_NOSTALGIA']},set:{B10_NOSTALGIA:true},goto:'n'}]},
      {label:'r'},IF(KN('yu'),nar('Alison 在便利貼上寫：「加油。不用回。」')),{goto:'end'},
      {label:'t'},IF(KN('zhe'),say('zhe','你走了，這桌又剩我們三個。……很安靜，很好。')),{goto:'end'},
      {label:'n'},IF(KN('zhe'),say('zhe','網拍標錯價那題，我現在會答了。')),IF(KN(BH),say(BH,'說說看。')),IF(KN('zhe'),say('zhe','……先讓我翻一下。')),IF(KN('yu'),say('yu','（便利貼）「四年了。」')),
      {label:'end'} ],
    after:G=>{ G.flags.B10_N=(G.flags.B10_N|0)+1; delete G.flags.B10_OPEN; delete G.flags.B10_RATE_TEXT; } });
  /* B10b 文學的講座「小說裡的審判」：大二下第 11 週週二 18:30～20:00；前一週起博雅的公告欄（活動清單的海報 7 天）。講座一句旁白、時鐘往前到 19:50，散場：明軒、Alison（AA 寫）；
     和芷若 FAMILIAR 以上她才在（兩句＋兩個選項）。去了＝到場紀錄 attended:'B10b'（活動系統記）*/
  EV.push({ id:'ev_b10b_lecture', title:'小說裡的審判', participants:[], location:'boya', trigger:'activity', once:true, background:'blur',
    dialogue:[ nar('講者從一本一百年前的小說講起：一個人被審判，到最後都不知道自己犯了什麼罪。'),
      {if:{custom:G=>(G.hour%24)<19+50/60},advance:G=>19+50/60-(G.hour%24)},
      IF(KN(MX),say(MX,'法律系的聽這個，會坐立難安。')),
      IF(KN('yu'),say('yu','欸！我中間一直想舉手問，那個人到底犯了什麼？')),
      IF(C((b,G)=>b.famZR(G)),say(ZR,'我讀的是英文版。德文的我看不懂。')),
      IF(C((b,G)=>b.famZR(G)),say(ZR,'你們讀判決，也會讀到最後還是不知道為什麼嗎？')),
      IF(C((b,G)=>b.famZR(G)),{choice:[{text:'「有時候會。」',goto:'a'},{text:'「判決會寫理由。」',goto:'b'}]}),
      {goto:'end'},
      {label:'a'},say(ZR,'……那跟這本差不多。'),{goto:'end'},
      {label:'b'},say(ZR,'真好。小說不用寫。'),
      {label:'end'} ],
    consequences:{memo:'博雅 101 聽講座：「小說裡的審判」'} });
  /* B12 同一個議題，再聽一次（BB_105 4-2；台詞 AA_430 第 2 節 @7525db6a5）：大三上第 10 週週四 19:00～20:30，博雅 101（同一位講者；AA_430「週四晚上七點，博雅 101」）；
     前三天（週一）21:00 以安在麵店團群組、Alison、阿哲回（BBPACK.phone）；這一場沒去或中途離開＝那天 21:30 Alison 在群組一句。
     講座（ev_b12_lecture，坐下選「聽演講」）：以安先舉手；玩家可以舉手（三選一＋不舉手，記 B12_ASK）——「上次最後那一題」只給聽完 B4、或沒去但在群組看過轉述（b4_missed）的玩家；
     B4 中途離開的玩家換成「多久算暫時」。散場（聽完 B12）：講座一結束就接著演（afterActivity）；和以安 FAMILIAR 以上＝以安的小桌（照 B4 的三種：聽完、沒去、中途離開），
     不到 FAMILIAR、認識 Alison＝Alison 版（沒有筆記本、便利貼，不記以安熟悉）。稿的「npcNear 才開始」沒有做（以安的作息沒有排進博雅的小桌）*/
  const B12W=FI('B12_WHO','yu'), B4S=s=>FI('B12_B4',s), B5S={custom:G=>!!G.flags.B12_B5_TEXT}, ASK=k=>FI('B12_ASK',k);
  EV.push({ id:'ev_b12_lecture', title:'政府可以為了大家，限制一個人嗎？', participants:[], location:'boya', trigger:'activity', once:true, background:'blur',
    dialogue:[ nar('還是那位頭髮花白的老師。他說話還是很慢。'),
      say('講者','幾年前我在這裡問過一個問題。有些人可能聽過。'),
      say('講者','今天我想先聽你們問。'),
      nar('（以安第一個舉手。）'),
      say(AN,'如果被限制的人，連要去哪裡問都不知道呢？'),
      say('講者','……這個問題，比我上次那一題好。'),
      nar('（教室裡有人笑。以安沒有笑，在等他講下去。）'),
      say('講者','所以制度要讓人找得到門。找不到門，有理由也沒用。'),
      {choice:[{text:'「『最小的手段』，要由誰說明？」',set:{B12_ASK:'who'},goto:'q1'},{text:'「被限制的人，可以先被問一次意見嗎？」',set:{B12_ASK:'ask'},goto:'q2'},
        {text:'「您上次最後問的那一題，有答案了嗎？」',if:C((b,G)=>b.b12Last(G)),set:{B12_ASK:'last'},goto:'q3'},{text:'「如果限制是暫時的，多久算暫時？」',if:C((b,G)=>b.b4State(G)==='partial'),set:{B12_ASK:'time'},goto:'q4'},
        {text:'（不舉手）',goto:'t'}]},
      {label:'q1'},say('講者','做出限制的人，要說得出理由。說不出來，就不該限制。'),{goto:'t'},
      {label:'q2'},say('講者','可以，也應該。……可是問了以後他說不要，怎麼辦？這一題留給你。'),{goto:'t'},
      {label:'q3'},nar('（他笑了。）'),say('講者','沒有。所以我又來了。'),{goto:'t'},
      {label:'q4'},say('講者','要看限制的是什麼。……你們以後會寫很多書狀在吵這個。'),
      {label:'t'},{if:{custom:G=>(G.hour%24)<19.5},advance:0.75},
      say('講者','今天的最後一題，跟上次一樣。'),
      say('講者','被限制的那個人，最後可以去哪裡？'),
      nar('掌聲。這次以安沒有抄。') ],
    consequences:{memo:'博雅 101 聽講座：同一個講者，第二次「政府可以為了大家，限制一個人嗎？」'} });
  EV.push({ id:'ev_b12_after', title:'', participants:[], location:'boya', trigger:'auto', activity:'B12', activityPhase:'justEnded', afterActivity:'B12', once:true, background:'blur',
    prereq:{attended:['B12'],custom:G=>{ const b=B(); return !!b&&b.b12Due(G); }},
    dialogue:[ {call:G=>{ const b=B(); G.flags.B12_WHO=b.b12Who(G); G.flags.B12_B5_TEXT=b.b5Text(G); G.flags.B12_B4=b.b4State(G); }},
      IF(B12W,{goto:'yu'}),
      nar('（阿哲和 Alison 說要去買雞排，先走了。小桌子只剩以安。）'),
      IF(B4S('missed'),{goto:'m'}),IF(B4S('partial'),{goto:'p'}),
      /* A 聽完 B4：對照大一的筆記；有 B5_THOUGHT 照那一句問、沒有（散場先走）問最後一題 */
      nar('（以安從包包拿出一本舊的筆記本，翻到中間。最後那一句抄了兩次，字比現在的小。）'),
      say(AN,'大一那天，我只抄得下這一句。'),say(AN,'今天我知道要問什麼了。'),
      UN(B5S,{goto:'a0'}),
      say(AN,'你大一寫的是「{flag:B12_B5_TEXT}」。現在呢？'),
      {choice:[{text:'「還是一樣。」',goto:'a1'},{text:'「現在會先問是誰被限制。」',goto:'a2'},{text:'「我現在比較不確定。」',goto:'a3'}]},
      {label:'a1'},say(AN,'好。那你大一就想對方向了。'),{goto:'end'},
      {label:'a2'},say(AN,'……嗯。這個我也是最近才會問。'),{goto:'end'},
      {label:'a3'},say(AN,'那下次讀書會，你講這個。'),{goto:'end'},
      {label:'a0'},say(AN,'大一那場，你記得最後一題嗎？'),
      {choice:[{text:'「被限制的人可以去哪裡。」',goto:'a4'},{text:'「不太記得了。」',goto:'a5'}]},
      {label:'a4'},say(AN,'對。今天他講了一半。'),{goto:'end'},
      {label:'a5'},say(AN,'我抄了兩次。……給你看。'),nar('（她把筆記本轉過來給你。）'),{goto:'end'},
      /* B 沒去 B4 */
      {label:'m'},say(AN,'大一那場你沒來。我把我的筆記給你看——你現在答得出來嗎？'),nar('（她把筆記本轉過來。最後那一句抄了兩次。）'),
      {choice:[{text:'「要讓他找得到門。」',hint:'今天聽到的',goto:'m1'},{text:'「要先問他本人。」',goto:'m2'},{text:'「答不出來。」',goto:'m3'}]},
      {label:'m1'},say(AN,'……那是今天的。你自己的呢？'),say(AN,'好，下次再講。'),{goto:'end'},
      {label:'m2'},say(AN,'嗯。大一的時候，我們桌上也有人這樣寫。'),{goto:'end'},
      {label:'m3'},say(AN,'我大一也答不出來。所以抄了兩次。'),{goto:'end'},
      /* C B4 中途離開 */
      {label:'p'},say(AN,'大一那場你沒聽完。後半場在這裡。'),nar('（她把筆記本翻到後半，推過來。）'),say(AN,'最後一題，是今天那一題。'),
      {choice:[{text:'「原來大一就問過了。」',goto:'p1'},{text:'「我那天先走，有點可惜。」',goto:'p2'}]},
      {label:'p1'},say(AN,'嗯。他問了兩次。'),{goto:'end'},
      {label:'p2'},say(AN,'今天補到了。'),
      /* 收尾（A、B、C 一樣）：舉過手的多一句 */
      {label:'end'},
      IF(ASK('who'),say(AN,'你今天問的那一題，我本來也想問。')),IF(ASK('ask'),say(AN,'你問『他說不要怎麼辦』那一題，我回去想。')),
      IF(ASK('last'),say(AN,'你問他有沒有答案。……他說沒有的時候，我鬆了一口氣。')),IF(ASK('time'),say(AN,'多久算暫時，我們下次讀書會可以吵。')),
      nar('（她把今天的便利貼，貼在大一那一頁的旁邊。兩張的字不一樣大。）'),
      {rel:{[AN]:{fam:1}}},{goto:'done'},
      /* 2-4 和以安不到 FAMILIAR：Alison 版 */
      {label:'yu'},nar('（以安和阿哲去買宵夜了。小桌子只剩 Alison。）'),
      say('yu','欸，大一那場我也有去。那時候我只聽懂一半。'),
      say('yu','今天聽懂比較多了！！……以安問的那一題我就沒想到。'),
      {choice:[{text:'「我也只聽懂一半。」',goto:'y1'},{text:'「以安問得很好。」',goto:'y2'}]},
      {label:'y1'},say('yu','對吧！那我們一樣。'),{goto:'done'},
      {label:'y2'},say('yu','她每次都這樣。……我要去跟她說，她一定會說『還好』。'),
      {label:'done'},{set:{B12_DONE:true}} ],
    after:G=>{ delete G.flags.B12_WHO; delete G.flags.B12_B5_TEXT; delete G.flags.B12_B4; } });
  /* B13 沛珊在小桌子：大一上、大一下（AA_289 5-4：照用、不依附讀書會；只到大二上＝她 12/17 休學以前），週三 16:00～18:00 走進博雅自習區，一天擲一次兩成；考試週不排。
     打招呼的句子輪流、不連續重複（「明天讀書會的題目」只在公法讀書會有開的學期；大二上用大一下那一句）；不打擾＝她的一個動作。沛珊熟悉 +1（一天一次）*/
  EV.push({ id:'ev_b13_peishan', title:'', participants:[PS], location:'boya', room:'study', trigger:'auto', tier:'short', building:'boya', cooldown_days:1, term:['Y1S1','Y1S2','Y2S1'], weekday:[3], time:[16,18], background:'blur',
    prereq:{memory:[{npc:PS,tag:'FIRST_MET'}],custom:G=>{ const b=B(); return !!b&&b.b13Due(G); }},
    dialogue:[ {choice:[{text:'（打招呼）',goto:'hi'},{text:'（不打擾）',goto:'no'}]},
      {label:'hi'},{call:G=>{ G.flags.B13_LINE=B().b13Line(G); }},
      IF(FI('B13_LINE','quiet'),say(PS,'你也來這裡。……這裡比總圖安靜。總圖有太多認真的人。')),
      IF(FI('B13_LINE','plg'),say(PS,'明天讀書會的題目，我先在這裡看一遍。')),
      IF(FI('B13_LINE','phil'),say(PS,'我在讀哲學系的講義。旁聽拿到的。')),
      IF(FI('B13_LINE','edu'),say(PS,'我在讀一本教育學的書。……法律的等一下再讀。')),
      {rel:{[PS]:{fam:1}}},{goto:'end'},
      {label:'no'},{call:G=>{ G.flags.B13_QUIET=((G.flags.B13_QUIET_N|0)%2)+1; G.flags.B13_QUIET_N=(G.flags.B13_QUIET_N|0)+1; }},
      IF(FI('B13_QUIET',1),nar('沛珊把耳機戴上，在筆記本的邊角畫了一個小小的荷包蛋。')),
      IF(FI('B13_QUIET',2),nar('沛珊抬頭看了你一眼，點點頭，又低頭寫字。')),
      {label:'end'} ],
    after:G=>{ if(G.flags.B13_LINE) G.flags.B13_LAST=G.flags.B13_LINE; delete G.flags.B13_LINE; delete G.flags.B13_QUIET; } });

  /* ================= 大一女舍門口（BB_105 5-2、BB_137 第 3 節；畫面只到門口，祐廷不進女舍）================= */
  /* D4c 沛珊的問題（AA_289 5-4）：大一上第 10～15 週週四 18:20～18:30，公法讀書會前的晚餐集合——她在女舍門口等以安下樓。那一個週四擲一次五成；大一上最多三次、題目不重複（四題隨機）。
     參加過 D4（還筆記）或公法讀書會；以安在臺北。沛珊熟悉 +1 */
  const D4Q=n=>FI('D4C_Q',n);
  const d4q=(n,q,opts)=>[IF(D4Q(n),say(PS,q)),IF(D4Q(n),{choice:opts.map(([t],i)=>({text:t,goto:'d'+n+'_'+(i+1)}))})];
  const d4a=(n,opts)=>opts.flatMap(([,r],i)=>[{label:'d'+n+'_'+(i+1)},say(PS,r),{goto:'end'}]);
  const D4CQ=[[1,'法律系的人，是不是都很怕遲到？',[['「怕。遲到要寫理由。」','要寫三段。……我記住了。'],['「不怕。依情形而定。」','那我也要學這句。'],['「妳自己呢？」','我怕。所以都提早二十分鐘，在這裡站著。']]],
    [2,'讀書會，是去讀書的，還是去見人的？',[['「讀書。」','我也是這樣跟我媽說的。'],['「見人。」','……我也是。一個人讀不下去。'],['「都有。」','你很會回答。法律系的。']]],
    [3,'你早餐都吃什麼？',[['「蛋餅。」','什麼口味？……不用回答，我在心裡幫你煎了。'],['「不吃。」','……這是我今天聽過最難過的事。'],['「便利商店的飯糰。」','那個也很好。可是我家的蛋餅比較好。']]],
    [4,'你覺得老師上課，最重要的是什麼？',[['「講得清楚。」','……我也這麼覺得。我會記起來。'],['「不要點名。」','那是學生最重要的。不是老師的。'],['「讓人想聽。」','嗯。這個最難。']]]];
  EV.push({ id:'ev_d4c_question', title:'', participants:[PS], location:'campus', trigger:'auto', near:FDORM, tier:'short', building:'fdorm', cooldown_days:1, term:['Y1S1'], weeks:[10,11,12,13,14,15], weekday:[4], time:[18+20/60,18.5], background:'blur',
    prereq:{memory:[{npc:PS,tag:'FIRST_MET'}],custom:G=>{ const b=B(); return !!b&&b.d4cDue(G); }},
    dialogue:[ {call:G=>{ G.flags.D4C_Q=B().d4cPick(G); }},
      nar('（沛珊站在門口的路燈下，抱著講義。）'),
      say(PS,'他們還沒下來。等人的時候，我會想一些問題。'),
      ...D4CQ.flatMap(([n,q,o])=>d4q(n,q,o)),
      ...D4CQ.flatMap(([n,,o])=>d4a(n,o)),
      {label:'end'},nar('門開了，以安下來了。'),{rel:{[PS]:{fam:1}}} ],
    after:G=>{ const n=G.flags.D4C_Q; delete G.flags.D4C_Q; if(n){ const L=Array.isArray(G.flags.D4C_USED)?G.flags.D4C_USED:(G.flags.D4C_USED=[]); if(!L.includes(n)) L.push(n); } } });
  /* D5 沛珊的講義（AA_289 5-4：她是公法讀書會的成員、幫忙印，不是發起人）：週三 20:00 公法讀書會群組（BBPACK.phone，冷卻四週）；選「我去拿。」＝當晚 20:00～22:00 走到女舍門口。
     便利貼三張輪流；第一次去拿她剛好下樓倒垃圾，多一句。沛珊熟悉 +1；不產生戀愛情緒 */
  const D5N=n=>FI('D5_NOTE',n);
  EV.push({ id:'ev_d5_handout', title:'', participants:[], location:'campus', trigger:'auto', near:FDORM, weekday:[3], time:[20,22], background:'blur',
    prereq:{custom:G=>G.flags.D5_GO===G.day},
    dialogue:[ {call:G=>{ G.flags.D5_NOTE=((G.flags.D5_N|0)%3)+1; }},
      nar('櫃子上一疊講義，最上面一張便利貼。'),
      IF(D5N(1),say('便利貼','{name}的。第三題的圖我多印了一頁。')),
      IF(D5N(2),say('便利貼','第二題我也不會。明天一起問。')),
      IF(D5N(3),say('便利貼','今天的比較厚，對不起。')),
      UN({flags:['D5_MET']},nar('（沛珊剛好下樓倒垃圾。）')),UN({flags:['D5_MET']},say(PS,'你來了！……不用謝，我順便印的。')),
      {set:{D5_MET:true}},{rel:{[PS]:{fam:1}}} ],
    after:G=>{ G.flags.D5_N=(G.flags.D5_N|0)+1; G.flags.D5_GO=null; delete G.flags.D5_NOTE; } });
  /* D6 沛珊和柏翰（AA_289 5-4）：大一下第 10 週起（期中公開以後）的週四 18:30，公法讀書會前的晚餐——柏翰在女舍門口等她（第 11 週讀書會停一次，沒有晚餐集合）。
     兩個人交往中（characters.js 沛珊的 partner：STORY.partnerOn）、兩個人都認識。柏翰那段 AA 寫（AA_153 第 6 節，BB_137 改「到罪數」）；記 D6_SEEN */
  EV.push({ id:'ev_d6_peishan_bohan', title:'', participants:[PS,BH], location:'campus', trigger:'auto', near:FDORM, once:true, tier:'short', building:'fdorm', term:['Y1S2'], weeks:[10,12,13,14,15], weekday:[4], time:[18+20/60,18.75], background:'blur', portraitLater:true,
    prereq:{memory:[{npc:PS,tag:'FIRST_MET'},{npc:BH,tag:'FIRST_MET'}],custom:G=>{ const b=B(); return !!b&&b.coupleOn(G); }},
    dialogue:[ nar('（柏翰在女舍門口等沛珊。）'),
      say(BH,'期末刑總考到共犯。……不對，到罪數。我剛剛查了。'),
      {choice:[{text:'「你準備好了？」',goto:'a'},{text:'「範圍很大。」',goto:'b'}]},
      {label:'a'},say(BH,'沒有。所以我在門口也在想。'),{goto:'end'},
      {label:'b'},say(BH,'對。所以我先背目錄。'),
      {label:'end'},say(PS,'（下樓）你們兩個在聊考試，我就知道。'),{set:{D6_SEEN:true}} ] });
  /* D8 臨時取消：法律系的任一學期，平日 17:30～20:00 經過女舍門口，一天擲一次一成；冷卻四週；兩種開場輪流；只有指路，沒有後續、沒有記憶（不是搭訕）*/
  const D8O=n=>FI('D8_OPEN',n);
  EV.push({ id:'ev_d8_cancel', title:'', participants:[], location:'campus', trigger:'auto', near:FDORM, tier:'short', building:'fdorm', cooldown_days:28, weekday:[1,2,3,4,5], time:[17.5,20], background:'blur',
    prereq:{custom:G=>{ const b=B(); return !!b&&b.d8Due(G); }},
    dialogue:[ {call:G=>{ G.flags.D8_OPEN=((G.flags.D8_N|0)%2)+1; }},
      IF(D8O(1),nar('（門口的長椅，一個女生看著手機，嘆了一口氣。）')),IF(D8O(1),say('女生','（自言自語）……又取消。')),
      IF(D8O(2),nar('（一個女生在門口站了很久。）')),IF(D8O(2),say('女生','（對著手機）說十分鐘到，結果不來了。')),
      {choice:[{text:'「溫州街有一家麵店，不錯。」',goto:'a'},{text:'（不打擾）',goto:'b'}]},
      {label:'a'},say('女生','……好。一個人去吃麵，也可以。謝謝。'),{goto:'end'},
      {label:'b'},nar('你走過去的時候，她已經把手機收起來，往公館的方向走了。'),
      {label:'end'} ],
    after:G=>{ G.flags.D8_N=(G.flags.D8_N|0)+1; delete G.flags.D8_OPEN; } });

  /* ================= 普通教學館前：經濟系的舊同學（BB_105 P5；程式 id ev_putong_oldmate，避開沛珊的 P5）=================
     法律系大二、大三，一學期一次；平日 12:00～17:30 經過普通教學館門口、那一天擲一次三成（他們照作息不在學校的不出現）。每次換一個人（韋綸、品妤、阿勳、唐睿），所以每個人的第一句只說一次。
     經濟系的朋友在法律系時期第一次出現先加一句重新介紹（2-1 通則；用遊戲已經在用的那幾句）。選項「站著聊兩句／一起去吃飯／約整群人」是稿上的動作；一起去吃飯＝時間 +1 小時。
     韋綸那一段稿上沒有選項（只有三句）：照三句演。「走啦」和日常 D2 共用 WL_SAID_LAW：第一次「欸！……喔你現在是法律系的。」＋「那也走啦！我們剛好要去吃飯。」，之後只有「走啦！」；
     「已讀不回」只給經濟系那年小年夜選了已讀不回的玩家（Y0_F1_SEEN），其他人換成「品妤說好久沒看到你了。」*/
  const P5W=w=>FI('P5_WHO',w);
  const p5opts=(id,a,b,c)=>[{choice:[{text:'（站著聊兩句）',goto:id+'_a'},{text:'（一起去吃飯）',goto:id+'_b'},{text:'（約整群人）',goto:id+'_c'}]},
    {label:id+'_a'},...a,{goto:'end'},{label:id+'_b'},...b,{advance:1},{goto:'end'},{label:id+'_c'},...c,{goto:'end'}];
  EV.push({ id:'ev_putong_oldmate', title:'', participants:[], location:'campus', trigger:'auto', near:PUTONG, tier:'short', building:'putong', term:['Y2S1','Y2S2','Y3S1','Y3S2'], weekday:[1,2,3,4,5], time:[12,17.5], background:'blur',
    prereq:{custom:G=>{ const b=B(); return !!b&&b.p5Due(G); }},
    dialogue:[ {call:G=>{ G.flags.P5_WHO=B().p5Pick(G); }},
      IF(P5W('wl'),{goto:'wl'}),IF(P5W('py'),{goto:'py'}),IF(P5W('xun'),{goto:'xun'}),IF(P5W('tr'),{goto:'tr'}),{goto:'end'},
      {label:'wl'},IF({custom:G=>typeof STORY!=='undefined'&&!!STORY.wlIntro&&STORY.wlIntro(G)},say('韋綸','韋綸！騎車的！')),{set:{MET_WEILUN:true}},
        IF({flags:['WL_SAID_LAW']},say('韋綸','走啦！')),
        UN({flags:['WL_SAID_LAW']},say('韋綸','欸！……喔你現在是法律系的。')),UN({flags:['WL_SAID_LAW']},say('韋綸','那也走啦！我們剛好要去吃飯。')),{set:{WL_SAID_LAW:true}},
        IF({flags:['Y0_F1_SEEN']},say('韋綸','品妤說你上次在群組已讀不回。她記帳了。')),UN({flags:['Y0_F1_SEEN']},say('韋綸','品妤說好久沒看到你了。')),{goto:'end'},
      {label:'py'},UN({flags:['MET_PINYU']},say('品妤','曾品妤。經濟系，可昕以前的室友。')),{set:{MET_PINYU:true}},
        say('品妤','喔，法律系的。我們今天上計量。你們上什麼？'),say('品妤','……聽起來比較貴。'),
        ...p5opts('py',[say('品妤','好，我去打工了。這次的時間，記你一筆。')],[say('品妤','各付各的。不要跟我搶付。')],[say('品妤','我在群組發。你這次要回。')]),
      {label:'xun'},UN({flags:['MET_XUN']},say('阿勳','盧正勳。你經濟系那年的室友。……你該不會連我都忘了。')),{set:{MET_XUN:true}},
        say('阿勳','（點頭）{name}。統計剛下課。……你們有統計嗎？'),say('阿勳','沒有。好。你們比較幸福。'),
        ...p5opts('xun',[IF(C((b,G)=>b.bowled(G)),say('阿勳','保齡球再一場。上次的全倒，我要再有一次證人。')),UN(C((b,G)=>b.bowled(G)),say('阿勳','保齡球還欠一場。'))],[say('阿勳','活大。這次我請。')],[say('阿勳','我問韋綸。他一定說走啦。')]),
      {label:'tr'},IF({custom:G=>typeof STORY!=='undefined'&&!!STORY.tangIntro&&STORY.tangIntro(G)},say('唐睿','唐睿。全系最會講話的那個。')),{set:{MET_TANG:true}},
        IF({flags:['SOC_ROAD_PERSON']},say('唐睿','法律系的路人！我剛在課上講了十分鐘，教授叫我坐下。')),UN({flags:['SOC_ROAD_PERSON']},say('唐睿','{name}！我剛在課上講了十分鐘，教授叫我坐下。')),
        ...p5opts('tr',[say('唐睿','你們上課可以講話嗎？……不行？好可憐。')],[say('唐睿','品妤也要來。……還有其他人啦。')],[say('唐睿','我負責講話，你負責安靜。')]),
      {label:'end'} ],
    after:G=>{ const b=B(); if(b) b.p5Done(G,G.flags.P5_WHO); delete G.flags.P5_WHO; } });

  /* ================= 社科院（BB_106）================= */
  /* SK08 學長，用一個經濟學名詞介紹自己：大二上第 1 週週三（經濟系開學典禮那天的下午；週一下午是日文上）12:00 阿勳私訊，13:00～17:00 走到社科院門口＝2D 系上的教室（E02 的同一間）。
     第 4 個選項只給玩過經濟系大一、E02 散場挑過詞的玩家（E02_WORD）。記 SOC_GUEST_SENIOR；唐睿介紹他時說「法律系的路人」（有 SOC_ROAD_PERSON）。沒去＝當晚 21:00 阿勳的大合照（BBPACK.phone）*/
  EV.push({ id:'ev_sk08_guest', title:'學長，用一個經濟學名詞介紹自己', participants:[], location:'campus', trigger:'auto', near:SOC, once:true, term:['Y2S1'], weeks:[1], weekday:[3], time:[13,17], background:'dark',
    prereq:{custom:G=>typeof PHONE!=='undefined'&&PHONE.sent(G,'bb_sk08_dm')},
    dialogue:[ {call:G=>{ G.flags.SK08_WORD_TEXT=({externality:'外部性',equilibrium:'均衡',invisible_hand:'看不見的手'})[G.flags.E02_WORD]||null; }},
      {scene:'社科院・系上的教室｜迎新',bg:'soc_classroom'},
      UN({flags:['MET_XUN']},say('阿勳','盧正勳。你經濟系那年的室友。……你該不會連我都忘了。')),
      IF({custom:G=>typeof STORY!=='undefined'&&!!STORY.tangIntro&&STORY.tangIntro(G)},say('唐睿','唐睿。全系最會講話的那個。')),
      IF({flags:['SOC_ROAD_PERSON']},say('唐睿','法律系的路人。')),
      say('阿勳','我們那年有一個人這樣介紹自己，我一直記得。今年改成每個人都要。'),
      {choice:[{text:'「我是『沉沒成本』。……不對，我不後悔。」',set:{SK08_WORD:'sunk'},goto:'w'},{text:'「我是『比較利益』：我去了法律系，大家都比較好。」',set:{SK08_WORD:'comparative'},goto:'w'},
        {text:'「我是『善意第三人』。」',set:{SK08_WORD:'third'},goto:'t'},{text:'「我是『{flag:SK08_WORD_TEXT}』。」',if:{custom:G=>!!G.flags.PLAYED_Y0&&!!G.flags.SK08_WORD_TEXT},set:{SK08_WORD:'e02'},goto:'e'}]},
      {label:'t'},say('唐睿','那不是經濟學。'),me('是我現在的身分。'),{goto:'w'},
      {label:'e'},say('阿勳','這個詞，可昕說過是你挑的。……犯規。'),nar('（新生大笑。）'),
      {label:'w'},say('新生','學長，經濟系可以轉法律系嗎？'),
      {choice:[{text:'「我不是轉的，是重考的。很累，但我不後悔。」',goto:'end'},{text:'「可以。記得帶六法，很重。」',goto:'end'},{text:'「你為什麼想轉？」',goto:'q'}]},
      {label:'q'},say('新生','……其實沒有。我只是想聽故事。'),
      {label:'end'},{set:{SOC_GUEST_SENIOR:true,MET_XUN:true,MET_TANG:true}},{advance:1} ],
    after:G=>{ delete G.flags.SK08_WORD_TEXT; },
    consequences:{memo:'社科院：經濟系迎新的神秘嘉賓'} });
  /* SK10 一題民法換一題微積分：大二上～大三下，每學期第 6 週（期中前）、第 15 週（期末前）的週三 19:00～21:00，博雅自習區（芯慈週一 21:00 在「一題換一題」小群組貼時間地點，BBPACK.phone）。
     前提 ECON_LAW_BRIDGE；那一學期第一次去＝匯率談判（記 STUDY_EXCHANGE_RATE，B10 讀）；同一學期第二次沒有談判（稿只寫了便利貼、翻譯官、民法貶值那幾句：有才演）。
     上一場沒去，下一次見面唐睿一句。大二下起品妤也來（台詞沒有她）*/
  EV.push({ id:'ev_sk10_swap', title:'一題民法換一題微積分', participants:[], location:'boya', room:'study', trigger:'auto', term:['Y2S1','Y2S2','Y3S1','Y3S2'], weeks:[6,15], weekday:[3], time:[19,21], background:'blur',
    prereq:{flags:['ECON_LAW_BRIDGE'],custom:G=>{ const b=B(); return !!b&&b.sk10Due(G); }},
    dialogue:[ {call:G=>{ G.flags.SK10_NEG=B().sk10Neg(G)?1:0; }},
      IF({flags:['SK10_MISSED']},say('唐睿','你不在的時候，民法貶值了。')),
      IF({flags:['STICKY_NOTES']},nar('桌上一張唐睿的便利貼。')),IF({flags:['STICKY_NOTES']},say('便利貼','民法一題＝？')),
      IF({flags:['TRANSLATOR']},nar('（芯慈和阿勳一吵起來，兩個人就先看你。）')),IF({flags:['TRANSLATOR']},say('芯慈、阿勳','……翻譯官，你說。')),
      IF(FI('SK10_NEG',1),say('唐睿','一題民法換兩題微積分。因為民法比較難懂。這是市場決定的。')),
      IF(FI('SK10_NEG',1),{choice:[{text:'（接受唐睿的價）',set:{SK10_RATE:'two'},goto:'end'},{text:'「公平。」',set:{SK10_RATE:'one'},goto:'one'},{text:'「我免費教，但你們請宵夜。」',set:{SK10_RATE:'snack'},goto:'snack'}]}),
      {goto:'end'},
      {label:'one'},say(XC,'同意。我記帳。'),{goto:'end'},
      {label:'snack'},nar('（匯率改成「宵夜本位」。）'),
      {label:'end'},{set:{SK10_MISSED:false,MET_XUN:true,MET_TANG:true}} ],
    after:G=>{ const b=B(); if(b) b.sk10Done(G); delete G.flags.SK10_NEG; } });
  /* SK14 新生的自我介紹：大四上第 1 週，平日 9:00～17:00 走到社科院門口（你來還一本書）＝2D 社科院一樓。美國路線那時在美國：沒有這一場。
     玩過經濟系大一、聽過 E02 那一句（E02 演過）＝台下有人笑那句；沒玩經濟系大一＝「你自己也玩過這個」。和可昕交往中多一個選項「拍下來傳給可昕」；分開了＝拿出手機又放回去。
     收尾系辦助理：有 SK02 的 SOC_WRONG_BUILDING 那一句，沒有＝「轉去法律的」（她記錯了，祐廷不糾正）。「站著看一會兒／直接去還書」是稿上的動作 */
  EV.push({ id:'ev_sk14_freshmen', title:'新生的自我介紹', participants:[], location:'campus', trigger:'auto', near:SOC, once:true, term:['Y4S1'], weeks:[1], weekday:[1,2,3,4,5], time:[9,17], background:'dark',
    prereq:{custom:G=>!(typeof STORY!=='undefined'&&STORY.abroad&&STORY.abroad(G))},
    dialogue:[ {scene:'社科院・一樓',bg:'soc_hall'},
      nar('你來還一本書。'),
      nar('（經濟系的迎新。新生在玩「用一個經濟學名詞介紹自己」。）'),
      say('新生','我是邊際效用遞減。'),
      IF({custom:G=>!!G.flags.PLAYED_Y0&&!!(G.events&&G.events.done&&G.events.done.ev_y0_e02)},nar('（台下有人笑。你在門口站了一下，才往裡面走。）')),
      UN({flags:['PLAYED_Y0']},nar('你自己也玩過這個。')),
      UN({flags:['dating_kexin']},nar('你拿出手機，又放回口袋。')),
      {choice:[{text:'（站著看一會兒）',goto:'end'},{text:'（直接去還書）',goto:'end'},{text:'拍下來傳給可昕',if:{flags:['dating_kexin']},goto:'kx'}]},
      {label:'kx'},{phone:'kexin',text:'有人用我的名詞。'},{phone:'kexin',text:'我那時候說，我會越來越好玩。……你覺得我做到了嗎？'},
        {choice:[{text:'「做到了。」',goto:'k1'},{text:'「還差一點。」',goto:'k2'}]},
        {label:'k1'},{phone:'kexin',text:'好。那我繼續。'},{goto:'end'},
        {label:'k2'},{phone:'kexin',text:'……記下來了。今年追上。'},
      {label:'end'},
      IF({flags:['SOC_WRONG_BUILDING']},say('系辦助理','你不是那個……來領系外套的？又走錯棟了？')),
      UN({flags:['SOC_WRONG_BUILDING']},say('系辦助理','你不是那個轉去法律的？')),
      {set:{SK14_SEEN:true}} ],
    consequences:{memo:'社科院一樓：經濟系的新生在自我介紹'} });
  /* 可昕和品妤在社科院門口（BB_106 第 389 行；AA_383 第 7 節）：和可昕交往中、「我們的日子」排的是她來台大（社科院門口）的那一天，約好的時間前 60～15 分鐘走到社科院門口；
     到經濟系那群畢業（2028-06）；品妤那天不在學校就不演、留到下一個來台大的日子；整個遊戲一次。演完照常在約好的時間見面（這兩句不算見面）*/
  EV.push({ id:'ev_kx_pinyu_soc', title:'', participants:['kexin'], location:'campus', trigger:'auto', near:SOC, once:true, background:'blur',
    prereq:{flags:['dating_kexin'],custom:G=>{ const b=B(); return !!b&&b.l389Due(G); }},
    dialogue:[ say('kexin','我來找品妤。……順便找你。順序不要問。'),
      UN({flags:['MET_PINYU']},say('品妤','曾品妤。經濟系，可昕以前的室友。')),{set:{MET_PINYU:true}},
      say('品妤','她先找我的。我有證人。') ] });

  /* ================= 文學院門口的長椅（BB_110 L4；芷若的系，文學院只有外觀）================= */
  /* L4a 鉛筆的翻譯：大一上第 6 週起，週二、四上午，和她 ACQUAINTANCE 以上，一次。稿沒有寫三個翻譯版本的字：選項是「第一個／第二個／第三個」（記 L4A_SAT，L4c 讀）*/
  EV.push({ id:'ev_l4a_pencil', title:'', participants:[ZR], location:'campus', trigger:'auto', near:ARTS, once:true, tier:'short', building:'arts', term:['Y1S1','Y1S2'], minWeek:{term:'Y1S1',week:6}, weekday:[2,4], time:[9,12], background:'blur',
    prereq:{stage:{npc:ZR,min:'ACQUAINTANCE'},custom:G=>{ const b=B(); return !!b&&b.here(ZR,G); }},
    dialogue:[ nar('文學院門口的長椅上，芷若在讀一本很舊的英文劇本，用鉛筆在空白處寫中文。'),
      {choice:[{text:'「坐下來。」',goto:'a'},{text:'「在讀什麼？」',goto:'b'},{text:'（打個招呼就走）',goto:'c'}]},
      {label:'a'},nar('她把書往旁邊挪一點：'),say(ZR,'這一句，我翻了三個版本。你聽哪一個比較像人講的話。'),
        {choice:[{text:'「第一個。」'},{text:'「第二個。」'},{text:'「第三個。」'}]},
        nar('（她圈起來。）'),say(ZR,'好。就這個。'),{set:{L4A_SAT:true}},{goto:'end'},
      {label:'b'},say(ZR,'一個劇本。兩個人在月台上等車，等了兩幕。……很好看，真的。'),{goto:'end'},
      {label:'c'},nar('她抬頭點一下，繼續寫。'),
      {label:'end'} ] });
  /* L4b 布告欄：大二上、Z7（12/10 交換申請截止）以前，平日 10:00～16:00 文學院門口；ACQUAINTANCE 以上；不影響 Z7 */
  EV.push({ id:'ev_l4b_poster', title:'', participants:[ZR], location:'campus', trigger:'auto', near:ARTS, once:true, tier:'short', building:'arts', term:['Y2S1'], weekday:[1,2,3,4,5], time:[10,16], background:'blur',
    prereq:{stage:{npc:ZR,min:'ACQUAINTANCE'},notEvents:['ev_zhiruo_applied'],custom:G=>{ const b=B(); return !!b&&b.here(ZR,G)&&b.beforeKey(G,'2026-12-10'); }},
    dialogue:[ nar('布告欄貼著交換說明會的海報，芷若站在前面看了很久。'),
      {choice:[{text:'「要去聽嗎？」',goto:'a'},{text:'（站在旁邊一起看）',goto:'b'}]},
      {label:'a'},say(ZR,'……我只是在看海報的字體。'),nar('（她看的是日期。）'),{goto:'end'},
      {label:'b'},nar('她過了一會兒才發現：'),say(ZR,'你也在看字體？'),me('嗯。'),say(ZR,'……騙人。'),
      {label:'end'} ] });
  /* L4c 同一張長椅：大三下、台灣路線和美國路線（美國 8/2 才出發，大三下在臺灣；AA_508 0-2 第 11 點）、Z11（她回來第一次點餐，ev_zhiruo_no_sugar）以後，平日 9:00～17:00 文學院門口；人物不宣告自己的改變（AA-C 改的那句）*/
  EV.push({ id:'ev_l4c_bench', title:'', participants:[ZR], location:'campus', trigger:'auto', near:ARTS, once:true, tier:'short', building:'arts', term:['Y3S2'], weekday:[1,2,3,4,5], time:[9,17], background:'blur',
    prereq:{events:['ev_zhiruo_no_sugar'],custom:G=>typeof STORY!=='undefined'&&!!STORY.route&&STORY.route(G)!=='JP'},
    dialogue:[ say(ZR,'我回來第一天就來坐這裡。'),
      say(ZR,'……這張椅子還是會晃。'),
      IF({flags:['L4A_SAT']},say(ZR,'你那時候選的那個版本，我後來交出去了。老師說很像人講的話。')) ] });

  /* ================= BB_154 S-3 阿凱網拍鍵盤（任務 BB154-KAI-KB；企劃線 BB_154 @968473469，2-1～2-3；BB_70 8b 最後一點 Kevin 家族群組三句 @7fca0df50 的同一版）=================
     大一下第 6～7 週，週一到週四 22:00～24:00 在宿舍房間（阿凱是室友），一次；第 7 週週四 24:00 以前都沒在房間＝不發生（不記 KAI_KEYBOARD，大二 needed_msgs.js kai_kb 走替代版）。
     手機筆記（AA_117）：前三行自動填好，玩家選「請求什麼」；有 U_SALE（民總那一堂的理解）多一個選項。阿凱自在 +2。
     「那問誰」：去過法服（LAWCLUB_SAT_VISITS ≥1）＝「週六法服。」→ 第 7 週週六 9:00～12:00 走進萬才館（ev_kai_keyboard_fafu）；沒去＝12:30 阿凱私訊兩句（BBPACK.phone）。
     沒去過法服＝「我問學長。」→ 當晚 23:00 家族群組 Kevin 三句（BB_70 8b）、23:05 阿凱私訊「你們法律系的人原來要查這麼久」（BBPACK.phone）。三種結尾都記 KAI_KEYBOARD（記憶，BBPACK.kaiKb）。
     BB_154 檔頭（2026-10-18）：2-3「學姊是法服社長，這天她值班」作廢——大一的週六法服是現任社長帶（AA_238 2-1、2-2；story3d.js S.fafuLead），學姊那幾句換成社長說（字不改）。說話人標籤寫全名「法服的社長」（AA_496 第 9 節第 6 點：「社長」法服、吉他社、即興劇社共用）；旁白的「社長」照舊。
     「我問直屬學長。」：直屬只有學姊一個（企劃線 e627d7475），BB_70 8b 寫「問學長：家族的大二學長 Kevin」——這裡用「我問學長。」*/
  const KBA=v=>FI('KAI_KB_ASK',v);
  EV.push({ id:'ev_kai_keyboard', title:'', participants:['kai'], location:'dorm', trigger:'auto', once:true, term:['Y1S2'], weeks:[6,7], weekday:[1,2,3,4], time:[22,24], background:'blur',
    prereq:{custom:G=>{ const b=B(); return !!b&&b.here('kai',G); }},
    dialogue:[ nar('阿凱的鍵盤聲停了。他把椅子轉過來。'),
      say('kai','欸。法律系的。'),
      say('kai','所以 網拍買的鍵盤少一顆鍵 賣家說不退 可以告嗎'),
      nar('他把鍵盤舉起來。右下角少了一顆。'),
      say('手機筆記','誰：阿凱'),say('手機筆記','向誰：賣家'),say('手機筆記','依據什麼：（還不知道。民總的課本？）'),say('手機筆記','請求什麼：'),
      {choice:[{text:'「我也還不會。我們一起查。」',set:{KAI_KB_ANS:'honest'},goto:'h'},{text:'「東西跟說的不一樣，可以要求退錢，或少付一點。」',if:{flags:['U_SALE']},set:{KAI_KB_ANS:'sale'},goto:'u'}]},
      {label:'h'},say('kai','好 一起翻'),nar('你們翻民總課本，翻到網拍相機那一章。看了二十分鐘。'),me('……好像有關，但我說不出來。'),{goto:'who'},
      {label:'u'},say('kai','少付一點也可以喔 那我要少付一顆鍵的錢'),me('……可是要怎麼跟賣家講，我說不清楚。'),
      {label:'who'},say('kai','那問誰'),
      IF({flagNum:{LAWCLUB_SAT_VISITS:{min:1}}},me('週六法服。')),IF({flagNum:{LAWCLUB_SAT_VISITS:{min:1}}},{set:{KAI_KB_ASK:'fafu'}}),
      UN({flagNum:{LAWCLUB_SAT_VISITS:{min:1}}},me('我問學長。')),UN({flagNum:{LAWCLUB_SAT_VISITS:{min:1}}},{set:{KAI_KB_ASK:'kevin'}}),
      {rel:{kai:{comf:2}}} ],
    after:G=>{ G.flags.KAI_KB_DAY=G.day; } });
  EV.push({ id:'ev_kai_keyboard_fafu', title:'', participants:['kai'], location:'wancai', trigger:'auto', once:true, term:['Y1S2'], weeks:[7], weekday:[6], time:[9,12], background:'blur', portraitLater:true,
    prereq:{flagIs:{KAI_KB_ASK:'fafu'}},
    dialogue:[ nar('阿凱抱著鍵盤坐下。社長看了一眼少掉的那一顆。'),
      say('法服的社長','三件事。'),
      say('法服的社長','一，賣場的頁面、你們的對話，先截圖存起來。'),
      say('法服的社長','二，賣家如果是店家，網購收到七天內，可以直接退。'),
      say('法服的社長','三，超過七天，或賣家是個人：東西跟說好的不一樣，可以要求退錢，或少付一點。'),
      say('法服的社長','少一顆鍵，退整台可能太多。少付一點，比較合理。'),
      say('法服的社長','你們已經跟賣家說了。很好。發現了要馬上說。'),
      say('法服的社長','我們是學生，只能講方向。要確定的話，帶著截圖找律師。'),
      say('kai','你們法律系的人原來要查這麼久'),
      say('法服的社長','……三分鐘。'),
      nar('回宿舍的路上，你在手機筆記寫了一行。'),
      me('下次我要自己講得出來。'),
      {call:G=>{ const b=B(); if(b) b.kaiKb(G); }} ] });
  return EV;
})();
for(const e of BBPACK_EVENTS){ if(!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e); }

/* 博雅午後講座（BB_105 4-1b；B4、交換說明會之外的幾場）：博雅 101，坐下選「聽演講」。講者、題目虛構；只講方向、不給法律結論 */
if(typeof ACTIVITIES!=='undefined'&&Array.isArray(ACTIVITIES.list)){
  const LECT=[
    {id:'B6',title:'經濟和法律，在同一張桌子上',kind:'lecture',zone:'boya',room:'101',roomName:'博雅 101',term:['Y2S1'],weeks:[6],weekday:2,t0:18.5,t1:20,once:true,crowd:{n:30},poster:{daysBefore:7},event:'ev_b6_lecture',
      desc:'博雅午後講座（每月一到兩場）。這一場的主題是經濟。',story:true},
    {id:'B7',title:'老房子、租屋與城市',kind:'lecture',zone:'boya',room:'101',roomName:'博雅 101',term:['Y2S2'],weeks:[6],weekday:3,t0:19,t1:20.5,once:true,crowd:{n:30},poster:{daysBefore:7},event:'ev_b7_lecture',
      desc:'博雅午後講座（每月一到兩場）。這一場的主題是社會議題。',story:true},
    {id:'B10b',title:'小說裡的審判',kind:'lecture',zone:'boya',room:'101',roomName:'博雅 101',term:['Y2S2'],weeks:[11],weekday:2,t0:18.5,t1:20,once:true,crowd:{n:30},poster:{daysBefore:7},event:'ev_b10b_lecture',
      desc:'博雅午後講座（每月一到兩場）。這一場的主題是文學。',story:true},
    {id:'B8',title:'我們為什麼要上學？',kind:'lecture',zone:'boya',room:'101',roomName:'博雅 101',term:['Y3S1'],weeks:[5],weekday:5,t0:15.5,t1:17,once:true,crowd:{n:30},poster:{daysBefore:7},
      desc:'博雅午後講座（每月一到兩場）。這一場的主題是教育與人生。',story:true},
    {id:'B6b',title:'一條法律是怎麼被寫出來的',kind:'lecture',zone:'boya',room:'102',roomName:'博雅 102',term:['Y2S1'],weeks:[10],weekday:3,t0:19,t1:20.5,once:true,crowd:{n:30},poster:{daysBefore:7},event:'ev_b6b_lecture',   /* AA_430 第 1 節：週三晚上七點，博雅 102 */
      desc:'博雅午後講座（每月一到兩場）。這一場的主題是公共政策。',story:true},
    {id:'B12',title:'政府可以為了大家，限制一個人嗎？',kind:'lecture',zone:'boya',room:'101',roomName:'博雅 101',term:['Y3S1'],weeks:[10],weekday:4,t0:19,t1:20.5,once:true,crowd:{n:30},poster:{daysBefore:7},event:'ev_b12_lecture',   /* AA_430 第 2-1 節：週四晚上七點，博雅 101（原本週二 18:30） */
      desc:'博雅午後講座（每月一到兩場）。同一位講者，第二次講這個題目。',story:true}];
  for(const a of LECT) if(!ACTIVITIES.list.some(x=>x.id===a.id)) ACTIVITIES.list.push(a);
}
