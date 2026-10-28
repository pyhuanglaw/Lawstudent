/* 她們主動約你：七位女主角的地點、時間、台詞（HEROINE-ASKS-1028；AA_494，企劃線 claude/magical-albattani-bk7b4n b3ecc563c；台詞一字不差，系統在 src/heroine_asks3d.js）
   使用者 2026-10-28 00:0x：「為什麼都要我主動約女生 如果變熟好感度高 他們不能自己約我嗎 戶外景點也可阿」「超沒有互動感」（USER_WANTS X118★）
   send＝她傳訊息的時間（日常：前一天晚上；校外：週三晚上，AA_494 0-3）；sendOff＝芷若沒班的日子
   daily：INV 的地點（invites.js 的 id）；th＝門檻（DATE.stageNum 3＝朋友、5＝朋友＋她的戀愛 ≥30；交往中全部都約）；
     pre／dat＝交往前／交往中那一句：d＝約哪一天（next 明天、sat 週六、sun 週日、today 今天晚上：句子寫「今天晚上」「晚上要不要」的，那天 17:00 傳）、
     h＝幾點（句子寫了鐘點就照句子；沒寫的照 AA_494 0-3 從 INV.times 挑，第一個不行換下一個）；off＝句子說「明天沒班」（那天整天沒有咖啡廳的班才約）
     here＝她本來就在那裡（語彤顧店的麵店、週六的溫州街）：只問一聲，答應了玩家直接去（INV 的 here，AA_494 第 3 節）
   out：DATE 的地點；pre＝第 6 階、交往前才有（沒有 pre＝交往中才約）；d＝週六／週日（句子寫的那一天；「這個週末」＝週六）；
     depart＝出發時間（AA_494 0-3：半日 13:00、晚上 18:00、一日 09:00；子晴週末兩點以前不約＝14:00；金瓜石句子寫「九點四十分那一班」＝09:00 出發；學姊碧潭「傍晚」＝15:00）
   later、no、yes＝玩家選「改天」「不了」「答應」以後她回的那一句；yesBy＝某個地點換一句（語彤的麵店）*/
'use strict';
const HASK_DATA={
  source:'AA_494 b3ecc563c',
  people:{
    heroine_01:{ send:21.5,
      daily:[
        {place:'library',th:3,pre:{d:'next',h:[15.5],line:'明天下午三點半，總圖二樓靠窗。我帶憲法筆記，你帶題目。'},dat:{d:'next',h:[15.5,17.5],line:'明天下午總圖。我幫你留了位子，在我旁邊。'}},
        {place:'cafe',th:3,pre:{d:'next',h:[15.5,17.5],line:'明天下午我要去 Café 寫報告。你要寫東西的話，一起。'},dat:{d:'next',h:[15.5,17.5],line:'明天 Café。今天不寫報告，就喝咖啡。'}},
        {place:'noodle',th:5,pre:{d:'next',h:[18],line:'明天六點，阿鳳麵店。吃完我要回去寫報告，所以準時。'},dat:{d:'next',h:[19,17.5],line:'明天晚上，阿鳳。我想吃乾麵。'}},
        {place:'wenzhou',th:5,pre:{d:'next',h:[16],line:'我在手帳排了一個「沒有目的」的時段。明天下午四點，溫州街。'},dat:{d:'next',h:[16,15.5],line:'明天下午，溫州街。這次手帳上什麼都沒寫。'}},
        {place:'run_avenue',th:5,pre:{d:'next',h:[6.5],line:'明天六點半，椰林大道。起得來就來。'},dat:{d:'next',h:[6.5],line:'明天六點半。我在傅鐘前面。'}}],
      out:[
        {loc:'D12',pre:{d:'sat',depart:13,line:'週六下午有空嗎？我想去大稻埕。我查了，碼頭的夕陽是五點四十分。'},dat:{d:'sat',depart:13,line:'週六，大稻埕。夕陽五點四十分。你負責準時。'}},
        {loc:'D01',pre:{d:'sun',depart:13,line:'華山這個月有一個展。週日下午一點半，門口。'},dat:{d:'sun',depart:13,line:'週日下午，華山。展我查好了，看完去吃東西。'}},
        {loc:'D26',kind:'day',dat:{d:'sat',depart:9,line:'這個週末我回臺中。……你要不要一起？我帶你走草悟道。'}}],
      later:'好。我在手帳上改一格。', no:'好。那下次換你約。', yes:'好。我記在手帳上了。' },
    heroine_02:{ send:22+40/60, sendOff:20,
      daily:[
        {place:'cafe',th:3,pre:{d:'next',h:[15],off:true,line:'欸我明天沒班，可是我想去店裡當客人。你要不要來？下午三點。'},dat:{d:'next',h:[15,15.5],off:true,line:'明天我沒班。我們去當客人，換我點你的那一杯。'}},
        {place:'brunch',th:5,pre:{d:'sat',h:[10,9],line:'週六早上要不要去半熟？我想偷學他們的蛋。'},dat:{d:'sat',h:[10,9],line:'週六早上半熟。我點和上次一樣的，你點不一樣的，我要吃你的。'}},
        {place:'teahouse',th:5,pre:{d:'sun',h:[15.5,14],line:'一盞那家你去過嗎？週日下午。我想試試看能不能等三分鐘。'},dat:{d:'sun',h:[15.5,14],line:'週日下午一盞。這次我不看手機，等它泡好。'}},
        {place:'wenzhou',th:5,pre:{d:'next',h:[22.5],line:'明天下班以後走一段？十點半，店門口。'},dat:{d:'next',h:[22.5],line:'下班以後，溫州街。走到公園就好。'}}],
      out:[
        {loc:'D04',pre:{d:'sat',depart:18,line:'這週有一部老片重映。週六晚上七點，西門。……你不要在中間睡著喔。'},dat:{d:'sat',depart:18,line:'週六晚上，西門。老片。我買好兩張了。'}},
        {loc:'D14',pre:{d:'sun',depart:17,line:'週日傍晚要不要去漁人碼頭？聽說橋的燈很好看。'},dat:{d:'sun',depart:17,line:'週日去漁人碼頭。我想看燈亮起來的那一下。'}},
        {loc:'D18',dat:{d:'sat',depart:13,line:'週六去九份。坐客運，我要看山。'}}],
      later:'好啦，那下次。', no:'喔。好啦。', yes:'好！那明天見。' },
    heroine_03:{ send:21+40/60,
      daily:[
        {place:'noodle',th:3,here:true,pre:{d:'next',h:[19,17.5],line:'阿姨說明天有滷牛腱。……她叫我問你要不要來。'},dat:{d:'next',h:[21],line:'明天晚上來店裡。我顧到九點，九點以後一起吃。'}},
        {place:'library',th:3,pre:{d:'next',h:[15.5,17.5],line:'明天下午我在總圖寫報告。三樓。……你要來的話，旁邊有位子。'},dat:{d:'next',h:[15.5,17.5],line:'明天下午總圖。三樓，我旁邊。'}},
        {place:'wenzhou',th:5,here:true,pre:{d:'sat',h:[15.5,14],line:'週六下午我在溫州街。你來的話，我們走到公園。'},dat:{d:'sat',h:[15.5,14],line:'週六下午溫州街。我帶你去一家你沒去過的。'}},
        {place:'run_avenue',th:5,pre:{d:'next',h:[6.5],line:'明天早上六點半。跑完我要去備料。'},dat:{d:'next',h:[6.5],line:'明天六點半。跑完一起吃早餐，再去備料。'}}],
      out:[
        {loc:'D21',pre:{d:'sun',depart:13,line:'週日我沒有顧店。三峽，你去過嗎？'},dat:{d:'sun',depart:13,line:'週日去三峽。搭捷運再轉公車，我查好了。'}},
        {loc:'D09',dat:{d:'sun',depart:13,line:'週日下午，貓空。我想坐纜車。……我沒坐過。'}}],
      later:'好。', no:'嗯。沒關係。', yes:'好。', yesBy:{noodle:'好。……我跟阿姨說。'} },
    heroine_04:{ send:23.5,
      daily:[
        {place:'gym_badminton',th:3,pre:{d:'next',h:[15.5,17.5],line:'明天下午打羽球 我需要報仇'},dat:{d:'next',h:[15.5,17.5],line:'明天羽球 這次我要贏一球'}},
        {place:'cafe',th:3,pre:{d:'next',h:[16],line:'兩點半 明天四點 我要點最甜的那個 你陪我'},dat:{d:'next',h:[15.5,17.5],line:'明天兩點半 我點最甜的 你點最苦的 交換'}},
        {place:'library',th:5,pre:{d:'next',h:[15.5,17.5],line:'總圖 二樓靠窗有插座那排 明天下午 我寫 code 你念書'},dat:{d:'next',h:[15.5,17.5],line:'總圖 明天下午 插座那排 位子我先佔'}},
        {place:'teahouse',th:5,pre:{d:'sun',h:[15.5,14],line:'一盞 週日下午 挑戰模式'},dat:{d:'sun',h:[15.5,14],line:'一盞 週日下午 挑戰模式第二關'}}],
      out:[
        {loc:'D02',pre:{d:'sat',depart:14,line:'週六下午松菸有一個設計展 一起去 我要去偷看別人怎麼排版'},dat:{d:'sat',depart:14,line:'週六下午松菸 看展 看完吃東西 我請'}},
        {loc:'D14',pre:{d:'sat',depart:18,line:'週六晚上淡水 看橋的燈 我查過了 不會下雨'},dat:{d:'sat',depart:18,line:'週六晚上淡水 我想看燈亮的那一下 你陪我'}},
        {loc:'D04',dat:{d:'sat',depart:18,line:'週六晚上西門 看電影 爆米花你負責'}}],
      later:'好 那下次', no:'喔 好', yes:'好 不准遲到' },
    heroine_05:{ send:22.5,
      daily:[
        {place:'library',th:3,pre:{d:'next',h:[17.5],line:'明天五點以後，總圖三樓。你帶要問的題目。'},dat:{d:'next',h:[17],line:'明天五點，總圖三樓。今天不問題目。'}},
        {place:'brunch',th:3,pre:{d:'sun',h:[9],line:'週日九點，半熟。不要遲到。'},dat:{d:'sun',h:[9],line:'週日九點，半熟。你點什麼，我點一樣的。'}},
        {place:'cafe',th:5,pre:{d:'sat',h:[15.5,14],line:'週六下午，Café。帶你的筆記。'},dat:{d:'sat',h:[15.5,14],line:'週六下午，Café。不帶筆記。'}},
        {place:'teahouse',th:5,pre:{d:'sat',h:[14],line:'週六下午兩點，一盞。那一壺，我想再喝一次。'},dat:{d:'sat',h:[15.5,14],line:'週六下午，一盞。這次你點。'}},
        {place:'run_avenue',th:5,pre:{d:'next',h:[6.5],line:'明天六點半，傅鐘前面。跑一圈就好。'},dat:{d:'next',h:[6.5],line:'明天六點半。跑完一起去吃早餐，再去研究室。'}}],
      out:[
        {loc:'D19',pre:{d:'sat',depart:9,line:'週六，金瓜石。客運九點四十分那一班。'},dat:{d:'sat',depart:9,line:'週六，金瓜石。九點四十分那一班。路線我排好了。'}},
        {loc:'D11',pre:{d:'sun',depart:13,line:'週日下午，北投。圖書館那棟木頭的，我想進去坐一下。'},dat:{d:'sun',depart:13,line:'週日下午，北投。先去圖書館，再去泡腳。'}},
        {loc:'D10',dat:{d:'sun',depart:15,line:'週日傍晚，碧潭。我想坐一下船。……你划。'}}],
      later:'好。哪天可以，告訴我。', no:'知道了。', yes:'好。' },
    classmate_peishan:{ send:21,
      daily:[
        {place:'library',th:3,pre:{d:'next',h:[15.5,17.5],line:'明天下午要不要一起去總圖？我有一題想問你！'},dat:{d:'next',h:[15.5,17.5],line:'明天下午總圖！我坐你旁邊，不吵你。'}},
        {place:'brunch',th:3,pre:{d:'sat',h:[10,9],line:'週六早上半熟！我上次沒看清楚他們怎麼翻蛋。'},dat:{d:'sat',h:[10,9],line:'週六早上半熟！我想跟你說我家的蛋怎麼翻。'}},
        {place:'wenzhou',th:5,pre:{d:'today',h:[19,21],line:'晚上要不要走一下溫州街？我有很多問題，走路比較好問。'},dat:{d:'today',h:[19,21],line:'今天晚上溫州街好不好？我想走慢一點。'}},
        {place:'run_avenue',th:5,pre:{d:'next',h:[6.5],line:'明天早上要不要跑步？我五點就醒了……六點半等你！'},dat:{d:'next',h:[6.5],line:'明天六點半！我先到，你慢慢來。'}}],
      out:[
        {loc:'D17',pre:{d:'sat',depart:13,line:'週六去野柳好不好？客運很便宜！我想看女王頭還在不在。'},dat:{d:'sat',depart:13,line:'週六野柳！我查了客運，一個人來回不到兩百。'}},
        {loc:'D21',pre:{d:'sun',depart:13,line:'週日要不要去三峽？我想吃金牛角，然後問老闆為什麼叫金牛角。'},dat:{d:'sun',depart:13,line:'週日三峽！這次換我帶路。'}},
        {loc:'D08',dat:{d:'sun',depart:13,line:'週日去動物園！我想看大貓熊睡覺。'}}],
      later:'好！那你想好哪天跟我說喔。', no:'好喔……那下次！', yes:'好！！' },
    kexin:{ send:21.5,
      daily:[   /* 交往中不另外約日常：已經有每週的「我們的日子」（KX_OUR_DAY，kxod3d.js）；表上只有交往前的句子（AA_494 第 7 節）*/
        {place:'noodle',th:3,pre:{d:'next',h:[18],line:'明天我去台大辦事。六點，阿鳳麵店。你沒事就來。'}},
        {place:'cafe',th:3,pre:{d:'next',h:[15],line:'明天下午我在公館。三點，兩點半。'}},
        {place:'wenzhou',th:5,pre:{d:'next',h:[19,21],line:'明天晚上我在公館。吃完走一段，溫州街。'}}],
      out:[
        {loc:'D09',pre:{d:'sat',depart:13,line:'週六下午，貓空。從我們學校後山上去，我帶路。'},dat:{d:'sat',depart:13,line:'週六下午，貓空。從後山上去。這次換你帶路。'}},
        {loc:'D10',pre:{d:'sun',depart:13,line:'週日，碧潭。我要划船，你負責划。'},dat:{d:'sun',depart:13,line:'週日，碧潭。船我划，你坐好。'}},
        {loc:'D20',dat:{d:'sun',depart:13,line:'週日去烏來。泡腳，然後吃山豬肉香腸。'}}],
      later:'好。哪天。', no:'……好。', yes:'好。' }
  }
};
