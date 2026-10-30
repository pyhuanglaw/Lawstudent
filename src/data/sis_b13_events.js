/* ===== 學姊第十三批：她自己的事當面演、八段空白、說了沒發生九件（AA_512，企劃線 c444f0757；任務 SIS-B13-1028、SIS-LEAD-1021、D111、USER_WANTS C25）的台詞與事件 =====
   台詞照稿一字不改（D100、D109）。接線在 src/sis_b13_3d.js。
   改在現有事件裡的句子寫在各自的檔（sup497_3d.js 交棒、sis_y2y3_events.js 慶祝、r2y4a_events.js 接機、r2y4b_events.js 每週視訊、confess_lines.js、sis_b4_events.js、feed_y3s1.js），
   那幾行都帶 aa512:true（tests/aa512_sis_b13_unit.js 逐句對稿用；遊戲不讀這個欄位）。
   說話的人：Kevin 照各自那一場的寫法（sup497 的交棒是 npc_kevin，其他照 sis_b12 寫 'Kevin'）；家族的學妹＝family_junior「佳穎」（AA_497 第 8 節第 5 點）；
   伴手禮那一場（第 5 節）她是「書瑀」——交往中 SOCIAL.displayName 自己會換（AA_411 第 2 節），台詞寫她的 id。 */
'use strict';
const SISB13_LINES={
  /* 13-2 她新家的咖哩：5/6（四）21:00 家族群組（回「去。」才演）；有 SIS4_CURRY（閒聊 S4-L3）的玩家學姊多一則私訊。k＝Kevin、s＝學姊（同 sis_b12 的寫法）*/
  curryAsk:[['k','禮拜天中午 學姊家 吃咖哩！！'],['k','學姊說她煮 我負責帶白飯'],['s','白飯我煮了。你帶水果。']],
  curryGo:'去。',
  curryDm:'你說過要來吃。',
  /* 13-6 挽回中的短招呼（大四上美國，3D 遇到她，三句輪流，各一次）：src/sis_b13_3d.js 放進 SMALLTALK（照 SMALLTALK 的寫法，說的話加「」）*/
  repairGreet:['（她點了一下頭。）早。','這邊的咖啡很淡。我開始喝茶了。','報告完了。……有一個人舉手。我聽懂了。'],
  /* 13-7「歡迎回來」家聚：12/26（二）20:30 家族群組（回「去。」才演；AA_516 1-5 原本 21:00）*/
  welcomeAsk:[['k','禮拜四家聚！'],['k','歡迎學姊回來 118 巷那家']],   /* AA_523 6-11（企劃線 0d7b5388b）：12/24 20:30 Kevin 已經說過「學姊回來了」（heard_lines.js h509_kevin）——第一句換「禮拜四家聚！」、第二句「歡迎學姊回來 118 巷那家」*/
  welcomeGo:'去。',
  /* 第 2 節第 1 點：2027-03-08 佳穎私訊多一個選項（有 SIS_OLD_NOTES）；傳了以後隔天 21:00 學姊私訊（不用回）*/
  notesOpt:'（把學姊的筆記傳給她）', notesRep:'這是……溫學姊的字？謝謝學長！！',
  notesBack:['佳穎拿著我的筆記來問問題。','……你真的傳下去了。'],
  /* AA_512 第 7 節第 9 點（企劃線 0e02591e4）：2-1 改成 2027-05-20（四）21:00 佳穎私訊（有 SIS_OLD_NOTES、有直屬學妹）；學姊那兩則改 5/21（五）21:00 */
  yzNotesAsk:'學長，民總期末範圍好大……你那時候是怎麼讀的？', yzNotesNo:'先把考古題做完。', yzNotesNoRep:'好！！',
  /* AA_512 第 7 節第 12 點：研究室晚上 21:30 一起出去，一學期一次 */
  labEveOut:'（九點半。她把筆電闔上，關了桌燈。你們一起走下樓。）',
  /* 第 2 節第 3 點：2029-07-15（日）21:00 修正本（有 SIS6_FATHER_COPY）*/
  thesisMsg:['修正本印好了。','第一本給我爸了。他放在辦公室書架最上面。','第二本。……你說過要的。'],
  thesisOpts:[{t:'要。',k:'yes',r:'週五晚上，公館。我放在陳助教那桌。'},{t:'不用了，給更需要的人。',k:'no',r:'……好。那我留一本在研究室，給學弟妹。'}],
  /* 第 2 節第 6 點：美國路線交往中 2028-09-11（第四十天）22:00；湖邊問過「想家嗎？」的多一句 */
  day40:['今天第四十天。','……想。一點點。'], day40Asked:'你之前問我想不想家。',
  day40Opts:[{t:'想什麼？',r:'家裡樓下那家早餐店。……很奇怪，平常我都沒吃。'},{t:'我過去。',r:'好。……帶傘，外面在下雨。'}],
  /* 第 2 節第 7 點：美國路線，彩排（US208_REHEARSAL）以後的下一個週三 21:00（不用回）*/
  reportDone:['報告完了。','最後有一個人舉手問問題。我聽懂了，也答了。','……你那天說聽不懂的地方，我改掉了。'],
  /* 第 2 節第 8 點：2029-01-31（三）21:00（醉月湖跨年選過「寫到哪裡？」、交往中）→ 2/1 15:00 Café */
  febMsg:['明天二月了。','計畫本，二月那一頁還是空的。'],
  febOpts:[{t:'明天一起排。',r:'好。Café，下午三點。帶筆。'},{t:'妳先排，我配合。',r:'……不要。說好一起排的。Café，下午三點。'}],
  /* 第 5 節 伴手禮（美國路線、CAME_BACK_TOGETHER、交往中）：5-1 1/3（三）21:00 約；5-3 當晚 21:00、1/7（日）08:00 媽媽（p:mom，不加句號）*/
  giftAsk:['禮拜六中午，阿姨在家嗎。','伴手禮一直放在我桌上。'],
  giftOpts:[{t:'在。來吃中飯。',r:'好。十一點半。'},{t:'在。妳人來就好。',r:'東西已經買了。……十一點半。'}],
  giftNight:['橘子很甜。','今天其實很緊張。'],
  giftNightOpts:[{t:'看不出來。',r:'那就好。'},{t:'我媽很喜歡妳。',r:'……橘子也是這樣說的。'}],
  giftMom:['（照片：一片吐司，塗了一層咖啡色的醬）','真的沒有奶油','很好吃 跟書瑀說謝謝'],
  giftMomOpts:['好','（愛心貼圖）'] };

/* 13-1 交棒那一晚，她也在（AA_497 5-2 的 ev_kv_handover 加她；src/sup497_3d.js 的 S.HAND_EV 接進去）：
   open＝接在 AA_497 開場那句旁白後面、Kevin 介紹佳穎以前；after＝Kevin 交棒以後（記 KV_HANDOVER 以前）。
   沒認識她的（沒有 SIS_W1；同 9/12 家聚 ev_sis_fam_dinner、12-4 的判斷）在這裡認識：Kevin 介紹她那一句記 FIRST_MET（meet），演完記 met_sis、SIS_W1（之後 W1、W1 晚到版不演）*/
const SISB13_HAND=(function(){
  const ID='heroine_05', A=o=>Object.assign(o,{aa512:true});
  const SIS=t=>A({speaker:ID,text:t}), N=t=>A({speaker:null,text:t}), KV=t=>A({speaker:'npc_kevin',name:'Kevin',text:t}), JUN=t=>A({speaker:'family_junior',name:'佳穎',text:t});
  const noW1={flags:['SIS_W1']};
  return {
    open:[ N('（長桌另一頭，一個抱著一疊講義的女生坐得很直，面前的茶還沒喝。）'),
      Object.assign(KV('學弟，這是溫學姊。我們家族最大的。'),{unless:noW1,meet:{id:ID,where:'lane118'}}),
      Object.assign(SIS('……溫書瑀。碩一。'),{unless:noW1}),
      Object.assign(SIS('你是祐廷吧。群組裡的照片，看起來比本人緊張。'),{unless:noW1}),
      Object.assign(SIS('（對你點了一下頭）來了。'),{if:noW1}) ],
    after:[ N('（學姊把一張紙推到佳穎面前。）'),
      SIS('書單。大一上先讀前面三本，後面的不急。'),
      JUN('謝、謝謝學姊！'),
      KV('學姊的書單是傳家寶。我大一也拿到一張。'),
      SIS('你沒讀。'),
      KV('……我讀了第一本。'),
      {unless:noW1,set:{SIS_W1:true,met_sis:true}} ] };
})();

const SISB13_EVENTS=(function(){
  const ID='heroine_05', TA='npc_ta_chen', X=()=>typeof SISB13!=='undefined'?SISB13:null;
  const SIS=t=>({speaker:ID,text:t}), N=t=>({speaker:null,text:t}), ME=t=>({speaker:'player',text:t});
  const KEV=t=>({speaker:'Kevin',text:t}), JUN=t=>({speaker:'family_junior',name:'佳穎',text:t}), CHEN=t=>({speaker:TA,text:t}), MOM=t=>({speaker:'媽媽',text:t});
  const noW1={flags:['SIS_W1']};
  const metTA={memory:[{npc:TA,tag:'FIRST_MET'}]};   /* 這一場開始以前見過陳助教沒（EVENTS.run 的 _preMet：參與的人開場就記 FIRST_MET）*/
  const US={custom:G=>!!X()&&X().route(G)==='US'};
  return [
    /* ---------- 13-2 她新家的咖哩（2027-05-09 週日 12:00，出遊；背景：學姊的新家，沒有圖先用公寓室內，src/sis_b13_3d.js 的 OUT.BG.sis_new_home）---------- */
    { id:'ev_sis13_curry', title:'學姊家的咖哩', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
      dialogue:[ {scene:'學姊的新家',bg:'sis_new_home'},
        N('（學姊的新家。紙箱還沒全部拆完，餐桌上一鍋咖哩。食譜攤在旁邊。）'),
        KEV('（吃一口）好吃！'),
        SIS('你什麼都說好吃。'),
        JUN('學姊，食譜上這兩個字為什麼被圈起來？'),
        SIS('「適量」。……我討厭適量。'),
        {choice:[{text:'「好吃。」',goto:'a'},{text:'（看食譜）',goto:'b'},{text:'「我可以再一碗嗎？」',goto:'c'}]},
        {label:'a'},SIS('……你說的，我比較信。'),KEV('欸！'),{goto:'e'},
        {label:'b'},N('（「適量」被紅筆圈起來，旁邊畫了一個問號。）'),SIS('下次我會寫數字。'),{goto:'e'},
        {label:'c'},SIS('可以。……鍋子在那邊，自己盛。'),N('（Kevin 也站起來。學姊說：「你不行。你帶的水果還沒切。」）'),
        {label:'e'},{set:{SIS13_CURRY:true}},
        {unless:noW1,set:{SIS_W1:true,met_sis:true}} ] },   /* 沒認識她的也可以來（稿 0 節）：她家都去過了，之後不再演 W1 的自我介紹（LAWWW 定，同 12-4；請 AA 確認）*/
    /* ---------- 13-3 論文卡住，出來走一圈（2027-12-06～12-07 週一、二 17:00～18:00；走過霖澤館門口，3D 位置觸發＋2D 旁白）---------- */
    { id:'ev_sis13_walk', title:'出來走一圈', participants:[ID], location:'campus', trigger:'auto', once:true, time:[17,18], near:{x:34,z:-109,r:7}, background:'blur',   /* 霖澤館穿堂的門口（同 sup497_3d.js S.DAD_AT）*/
      prereq:{custom:G=>!!X()&&X().walkOk(G)},
      dialogue:[ N('（學姊從霖澤館走出來，抱著一件外套，看到你，停了一下。）'),
        SIS('論文卡住了。出來走一下。……你要一起嗎？'),
        {choice:[{text:'「好。」',goto:'go'},{text:'「我等一下有課。」',goto:'no'}]},
        {label:'no'},SIS('好。那你去。'),{end:true},   /* 結束，不再演（once）*/
        {label:'go'},{scene:'椰林大道',bg:'ntu_avenue'},
        N('（傍晚的椰林大道。腳踏車一台一台從你們旁邊過去。）'),
        SIS('咖哩的「適量」，我改成兩匙了。我自己決定的。'),
        SIS('我爸寄了一份剪報給我。法律扶助的新聞。旁邊用原子筆寫：「妳寫的這個。」'),
        {choice:[{text:'「他在關心妳。」',goto:'a'},{text:'「剪報上寫什麼？」',goto:'b'}]},
        {label:'a'},SIS('他不會說。……他會寄剪報。'),{goto:'m'},
        {label:'b'},SIS('等的人越來越多。……我的論文寫的就是他們。'),
        {label:'m'},{scene:'霖澤館門口',bg:'ntu_linze'},
        SIS('好。可以回去寫了。'),
        N('（她走上樓梯，走到一半回頭。）'),
        SIS('謝謝你走這一圈。'),
        {set:{SIS13_WALK:true}},{advance:0.5} ] },   /* 走一圈約 30 分鐘（稿沒寫，LAWWW 排）*/
    /* ---------- 13-4 6/2，公館的蛋糕（2028-06-02 週五 18:30～20:30；她和陳助教吃飯＝現有作息、圈子同伴；走近她們那桌）---------- */
    { id:'ev_sis13_cake', title:'公館的蛋糕', participants:[ID,TA], location:'gongguan', trigger:'auto', once:true, time:[18.5,20.5], near:{npc:ID,r:5}, background:'blur',
      prereq:{custom:G=>!!X()&&X().cakeOk(G)},
      dialogue:[ {scene:'公館・小店的窗邊',bg:'gongguan_cake'},
        N('（公館一家小店的窗邊。學姊和陳助教中間放著一個切了一半的小蛋糕。）'),
        CHEN('（看到你）欸，學弟。過來，幫忙吃。'),
        SIS('……研究室的人買的。太大了。'),
        Object.assign(CHEN('我是陳助教。書瑀的……飯友。'),{unless:metTA}),   /* 第一次和陳助教同框的玩家（這一場以前沒見過他）*/
        Object.assign(SIS('同學。'),{unless:metTA}),
        Object.assign(CHEN('同學。'),{unless:metTA}),
        {choice:[{text:'「生日快樂。」',goto:'a'},{text:'（坐下來吃一塊）',goto:'b'}]},
        {label:'a'},SIS('……你怎麼知道？'),CHEN('我剛剛講太大聲了。'),{goto:'e'},
        {label:'b'},N('（三個人把剩下的蛋糕吃完。陳助教要付錢，學姊先把錢放在桌上。）'),SIS('今天我請。……生日的人請。'),
        {label:'e'},{set:{SIS13_CAKE:true}} ] },
    /* ---------- 13-5 6/2，日本那邊的十分鐘（日本路線、朋友以上、沒交往；2028-06-02 臺灣 21:00＝日本 22:00 她打視訊來；接起來＝演，沒接＝照現有那一句）---------- */
    { id:'ev_sis13_jp_bday', title:'十分鐘', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:1/6,
      dialogue:[ {scene:'視訊',bg:'video'},
        N('（視訊。她把一個小蛋糕拿到鏡頭前，上面插著一根蠟燭，已經吹熄了。）'),
        SIS('研究室的人買的。……我吃不完。'),
        SIS('你那邊幾點？'),
        ME('十點。'),
        SIS('……那你早點睡。我只打十分鐘。'),
        {choice:[{text:'「生日快樂。」',goto:'a'},{text:'「許了什麼願？」',goto:'b'}]},
        {label:'a'},SIS('謝謝。……這句當面聽比較好。可是這樣也可以。'),{goto:'e'},
        {label:'b'},SIS('一個。跟論文有關。……你不要笑。'),
        {label:'e'},SIS('好。十分鐘到了。謝謝你接。'),
        {set:{SIS13_JP_BDAY:true}} ],
      outingMissed:(G,GM,q)=>{ const x=X(); if(x) x.jpBdayMissed(G); } },   /* 沒接、先不接：照現有那一句（她的回覆）*/
    /* ---------- 13-6 C 棟的洗衣間（美國路線、挽回中；2028-10-08～10-20 晚上 21:00～22:00 人在社區；洗衣間沒有 3D 場景＝2D）---------- */
    { id:'ev_sis13_laundry', title:'洗衣間', participants:[ID], location:'us_outside', trigger:'auto', once:true, time:[21,22], background:'dark',
      prereq:{custom:G=>!!X()&&X().laundryOk(G)},
      dialogue:[ {scene:'C 棟・地下室的洗衣間',bg:'us_c_laundry'},
        N('（C 棟地下室的洗衣間。烘衣機在轉。學姊坐在摺衣台上，手上一本英文書。）'),
        SIS('……你也來洗衣服。'),
        N('（她挪了一下，讓出摺衣台的一角。）'),
        SIS('這裡的烘衣機要投三次硬幣。我第一次只投一次，衣服還是濕的。'),
        {choice:[{text:'「妳在讀什麼？」',goto:'a'},{text:'（坐在旁邊等）',goto:'b'}]},
        {label:'a'},SIS('下週的報告。……有一個字，我一直念錯。'),N('（她把書翻過來，指給你看。你念了一次。她跟著念了一次。）'),SIS('……謝謝。'),{goto:'e'},
        {label:'b'},N('（你們都沒說話。烘衣機停的時候，她先站起來。）'),
        {label:'e'},SIS('你的還有十分鐘。……我先上去了。'),
        {set:{SIS13_LAUNDRY:true}},{advance:0.5} ] },   /* 不加挽回的數值、不改挽回步驟（稿 13-6）；洗衣服約 30 分鐘（LAWWW 排）*/
    /* ---------- 13-7「歡迎回來」家聚（2028-12-28 週四 18:30，118 巷的定食店，出遊；和 13-1 同一套）---------- */
    { id:'ev_sis13_welcome', title:'歡迎回來', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:1.5,
      dialogue:[ {scene:'118 巷・定食店'},
        N('（長桌那一頭，學姊面前放著一盒美國的餅乾。這一盒是新的。）'),
        KEV('學姊，報告一下美國。'),
        SIS('……冷。'),
        KEV('就這樣？'),
        SIS('圖書館整面都是窗。……然後很冷。'),
        JUN('學姊，美國的研究生也熬夜嗎？'),
        SIS('熬。熬完還去跑步。'),
        {choice:[{text:'「美國好玩嗎？」',goto:'a'},{text:'「餅乾可以吃嗎？」',goto:'b'},{text:'「我們剛回來，又見面了。」',if:US,goto:'c'}]},   /* 美國路線＝同一班回來的（r2y4a_events.js ev_us_return：交往中一起走、挽回中同一班）*/
        {label:'a'},SIS('好玩。……回來比較好。'),{goto:'e'},
        {label:'b'},SIS('可以。很甜。不要一次吃完。'),N('（Kevin 把手收回去。）'),{goto:'e'},
        {label:'c'},SIS('……嗯。這次是在臺灣。'),
        {label:'e'},{set:{SIS13_WELCOME:true}},
        {unless:noW1,set:{SIS_W1:true,met_sis:true}} ] },   /* 沒認識她的在這裡認識（同 13-1；FIRST_MET 由 EVENTS.run 記）*/
    /* ---------- 13-8 游完泳的早上（2029-05-07～05-10 週一～四 08:00～08:40；走過新體育館門口，3D 位置觸發＋2D 旁白）---------- */
    { id:'ev_sis13_pool', title:'游完泳的早上', participants:[ID], location:'campus', trigger:'auto', once:true, weekday:[1,2,3,4], time:[8,8+40/60], near:{x:74,z:58.4,r:7}, background:'blur',   /* 體育館門口（classes3d.js DOORS.gym (74, 59.4)；gym3d.js 走出來站 (74, 58)）*/
      prereq:{custom:G=>!!X()&&X().poolOk(G)},
      dialogue:[ N('（新體育館門口。學姊的頭髮還是濕的，手上拿著泳鏡。）'),
        SIS('……早。你這麼早來體育館？'),
        {choice:[{text:'「來跑步。」',goto:'a'},{text:'「剛好經過。」',goto:'b'}]},
        {label:'a'},SIS('跑完記得吃早餐。'),{goto:'m'},
        {label:'b'},SIS('剛好。我要去法圖，同一個方向。'),
        {label:'m'},{scene:'往法圖的路上',bg:'ntu_avenue'},
        SIS('七月就要上班了。研究單位。'),
        SIS('我上禮拜去看了位子。靠窗。……第一次有一張不用抽籤的桌子。'),
        {choice:[{text:'「恭喜。」',goto:'p'},{text:'「會想念研究室嗎？」',goto:'q'}]},
        {label:'p'},SIS('謝謝。……還沒上班就被恭喜，有點早。'),{goto:'r'},
        {label:'q'},SIS('會想念門口那張。每個人進來都跟我說早。'),
        {label:'r'},{scene:'法圖門口',bg:'law_library_gate'},
        N('（她把泳鏡塞進包包。）'),
        SIS('你要進去嗎？……那一起。'),
        {set:{SIS13_POOL:true}},{advance:0.25} ] },   /* 走到法圖約 15 分鐘（LAWWW 排）*/
    /* ---------- 第 2 節第 5 點：交往中，週一、三 19:00～21:30 她在研究室；走進去她在＝一次（src/lab5f3d.js 晚上那一段開門）---------- */
    { id:'ev_sis13_lab_eve', title:'七點以後', participants:[ID], location:'linze_5f', trigger:'enter', once:true, weekday:[1,3], time:[19,21.5], background:'blur',
      prereq:{custom:G=>!!X()&&X().labEveLine(G)},
      dialogue:[ SIS('七點以後。……你準時。'),{set:{SIS13_LAB_EVE:true}} ] },
    /* ---------- 第 2 節第 3 點：7/20（五）18:30 公館（畢業以後篇用出遊）---------- */
    { id:'ev_sis13_thesis', title:'第二本', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:1,
      dialogue:[ {scene:'公館・陳助教那桌',bg:'gongguan_cake'},   /* 週五晚上她和陳助教吃飯的那家（13-4 同一個背景）*/
        N('（桌上一本裝訂好的論文，封面上寫著你的名字。）'),
        SIS('簽名不用。……我寫了一句在第一頁。你回家再看。'),
        {set:{SIS_THESIS_COPY:true}} ] },
    /* ---------- 第 2 節第 8 點：2/1 15:00 Café（出遊，2D）---------- */
    { id:'ev_sis13_feb_plan', title:'二月那一頁', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
      dialogue:[ {scene:'兩點半 Café',bg:'cafe'},
        N('（她把計畫本攤開在二月那一頁。你們一格一格填。）'),
        N('（填到週日那一格，她先寫了你的名字，看了一下，又在後面加了一個「（全天）」。）'),
        SIS('……這格我先寫了。'),
        {set:{SIS_FEB_PLAN:true}} ] },
    /* ---------- 第 5 節 5-2 家裡的中飯（2029-01-06 週六 11:30～13:30，臺北家裡 2D home_living_day；出遊 2 小時）---------- */
    { id:'ev_sis13_gift', title:'家裡的中飯', participants:[ID], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
      dialogue:[ {scene:'臺北・家裡',bg:'home_living_day'},
        N('（十一點半。門鈴響的時候，媽媽已經站在玄關了。爸爸和你姊都出門了，媽媽說這樣比較不會嚇到人。）'),
        SIS('阿姨好。'),
        N('（她把一個紙袋遞過去。裡面是一罐果醬，標籤是手寫的英文。）'),
        SIS('那邊市集買的。蘋果奶油。'),
        MOM('奶油？'),
        SIS('裡面沒有奶油。只是叫這個名字。……塗吐司。'),
        MOM('好，明天早上就吃。'),
        N('（中飯是媽媽一早去市場買的。桌上的菜，三個人吃不完。）'),
        MOM('書瑀，他在美國有沒有好好吃飯？'),
        SIS('有。……我煮的。'),
        N('（媽媽看了你一眼。你低頭吃飯。）'),
        MOM('那妳研究所呢？什麼時候畢業？'),
        SIS('今年夏天。……論文寫完的話。'),
        {choice:[{text:'「她寫得很快。」',goto:'a'},{text:'「媽，妳不要一直問。」',goto:'b'},{text:'（夾一塊排骨給她）',goto:'c'}]},
        {label:'a'},SIS('……第四章還沒寫完。'),MOM('那就是快寫完了。'),{goto:'e'},
        {label:'b'},MOM('問一下而已。'),SIS('沒關係。阿姨問的，我都答得出來。'),{goto:'e'},
        {label:'c'},N('（她看著碗裡多出來的那塊排骨，沒說什麼，吃掉了。媽媽又夾了一塊給她。）'),
        {label:'e'},N('（一點半。她在玄關穿鞋。）'),
        MOM('下次來吃飯就好，不用帶東西。'),
        SIS('……好。'),
        N('（走的時候，她手上的紙袋換成了媽媽裝的一袋橘子。）'),
        {set:{SIS13_GIFT:true}} ] } ];
})();
for(const e of SISB13_EVENTS){ if(!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e); }
