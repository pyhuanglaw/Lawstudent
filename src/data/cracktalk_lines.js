/* ===== 多段感情 v6：裂縫到 3 → 談話（V6-S5、A2、A5、B4）的台詞：照原文、不改字 =====
   來源（企劃線 claude/cool-heisenberg-o8kuqx @ d805bceee）：
   - AA_123 4-2 以安 ev_an_talk、5-2 語彤 ev_yt_talk（談話、三種結果、不回答的訊息與麵店那句）；
   - AA_182 第 1 節（以安、語彤的到場：哪一天、怎麼知道、沒到；語彤裂縫①的週四 12:10 那一則）；
   - BB_119 2-1 沛珊、2-3 芷若、2-4 子晴（談話、選項、不回答、分開時的最後一句）＋第 2 節開頭「我們再試一個月」＋9-1（到場的訊息）。
     2-2 學姊整段作廢（BB_119 檔首、00_文件狀態表）；可昕的裂縫和談話照 AA_351（src/kxdrift3d.js），不在這裡。
   什麼時候演、計數、結果在 src/cracktalk3d.js（CRACKTALK）。說話的人照人物 id：交往中學姊才有「書瑀」，這裡沒有學姊。
   AA、BB 稿沒有、照實補的字（回報 AA，CRACKTALK.GAPS）：選項「（給一個真的理由）」「（不回答）」、兩句文件裡的動作描寫改成旁白（以安的手帳、規則；「給他看」改「給你看」）、
     芷若不回答那個信封的旁白、「我們再試一個月」加句號、子晴的貼圖寫法「（貼圖：……）」、語彤裂縫①的回覆「今天不行」。
   測試：node tests/v6_crack_unit.js */
'use strict';
const CRACKTALK_LINES=(function(){
  const AN='heroine_01', YT='heroine_03', PS='classmate_peishan', ZR='heroine_02', ZQ='heroine_04';
  const say=id=>t=>({speaker:id,text:t}), nar=t=>({speaker:null,text:t});
  const an=say(AN), yt=say(YT), ps=say(PS), zr=say(ZR), zq=say(ZQ);
  const IF=(fn,l)=>Object.assign({if:{custom:fn}},l);
  const RES=r=>({set:{CT_RES:r}});
  const NONE='（不回答）';
  /* 談話的本體（AA_123 4-2、5-2；BB_119 2-1、2-3、2-4）。CT_RES：mend（修補）／apart_talk（好好分開：談話後分開）／apart_life（生活差異，雙方同意）／drift（不回答，慢慢淡）／commit_*（修補，之後要做到）*/
  const BODY={
    [AN]:[
      an('你最近都說『都可以』。'),
      an('我不要『都可以』。我要理由。'),
      {choice:[{text:'（給一個真的理由）',goto:'r'},{text:'「我想我們要的不一樣。」',goto:'s'},{text:NONE,goto:'n'}]},
      {label:'r'},{choice:[{text:'「我累了，但我不想放棄。」',goto:'r2'},{text:'「我怕說了妳會反駁。」',goto:'r2'},{text:'「我在想我自己要什麼。」',goto:'r2'}]},
      {label:'r2'},an('……這個理由我收下。'),nar('（她把兩個人的規則改成一條：「有事，要說理由。」）'),RES('mend'),{goto:'e'},
      {label:'s'},nar('（以安翻開手帳，在理由欄寫一行給你看：「分開。理由：我們都沒有錯。」）'),an('這樣寫，可以嗎？'),RES('apart_talk'),{goto:'e'},
      {label:'n'},RES('drift'),
      {label:'e'} ],
    [YT]:[
      yt('我分給你的時間，你好像不太需要。……沒關係，我只是想問清楚。'),
      {choice:[{text:'「我需要。週四我都來。」',goto:'a'},{text:'「我們好像都太忙了。」',goto:'b'},{text:NONE,goto:'n'}]},
      {label:'a'},yt('好。那斜對面，我繼續留。'),RES('mend'),{goto:'e'},
      {label:'b'},yt('嗯。那我把這段時間，還給我自己。……謝謝你教我分時間。'),RES('apart_talk'),{goto:'e'},
      {label:'n'},RES('drift'),
      {label:'e'} ],
    [PS]:[
      ps('我們都在往前走，可是方向越來越不一樣。'),
      ps('……這次我不想等到吵架才說。'),
      {label:'q'},
      {choice:[{text:'「每個月留一天給溫州街。」',goto:'a'},{text:'「我也有感覺。」',goto:'b'},{text:'「妳想好了嗎？」',goto:'c',unless:{flags:['CT_ASKED']}},{text:NONE,goto:'n'}]},
      {label:'a'},ps('好。我會記得你說過。'),RES('commit_ps'),{goto:'e'},
      {label:'b'},ps('嗯。……那我們好好說再見。'),IF(G=>!!(G.flags&&G.flags.CT_PS_RETAKE),ps('謝謝你在我重考那年陪我。那一年，我不會忘。')),RES('apart_life'),{goto:'e'},   /* 分開時她的最後一句：重考那年交往中的才說（不然和事實不合）*/
      {label:'c'},{set:{CT_ASKED:true}},ps('我想了一個月。我只是想聽你說。'),{goto:'q'},   /* 回到上面兩個選項 */
      {label:'n'},RES('drift'),
      {label:'e'} ],
    [ZR]:[
      zr('我在想，我們是不是都在等對方先說累。'),
      zr('……我先說好了。我有一點累。'),
      {choice:[{text:'「寒假我去英國找妳。」',goto:'a',if:{flags:['CT_ZR_TRIP_OK']}},{text:'「每週固定一個時間。」',goto:'b'},{text:'「我好像撐不住遠距。」',goto:'c'},{text:NONE,goto:'n'}]},   /* 第一個：大四下（寒假以後）沒有（AA_263 C19）；寒假去英國那一趟（1c-1）進遊戲以前也不出 */
      {label:'a'},zr('真的？……那我先排好要看的片。'),RES('commit_zr_trip'),{goto:'e'},
      {label:'b'},IF(G=>!!(G.flags&&G.flags.CT_ZR_WINTER),zr('好。我那邊的早上九點，你那邊的晚上五點。')),IF(G=>!(G.flags&&G.flags.CT_ZR_WINTER),zr('好。我那邊早上十點，你那邊晚上五點。')),RES('commit_zr_weekly'),{goto:'e'},   /* 英國夏令時間（2028-10-29 以前、2029-03-25 以後）換句（AA_263 ZR5）*/
      {label:'c'},zr('嗯。我也是。……我們好好說。'),zr('回去以後，我還是在吧檯後面。你點什麼，我都記得。'),RES('apart_life'),{goto:'e'},
      {label:'n'},RES('drift'),
      {label:'e'} ],
    [ZQ]:[
      zq('我有話要說。'),
      zq('我們最近一直在錯過。我不想變成你在等的人。'),
      {label:'q'},
      {choice:[{text:'「那妳來決定時間。」',goto:'a'},{text:'「我等，是因為我想等。」',goto:'b',unless:{flags:['CT_ASKED']}},{text:'「我們都太忙了。」',goto:'c'},{text:NONE,goto:'n'}]},
      {label:'a'},zq('……好。這次換我約你。'),RES('commit_zq'),{goto:'e'},
      {label:'b'},{set:{CT_ASKED:true}},zq('我知道。……可是我不想。'),{goto:'q'},   /* 回到另外兩個選項 */
      {label:'c'},zq('嗯。……我們先不要了。'),zq('之後還是朋友。……我說真的。'),RES('apart_life'),{goto:'e'},
      {label:'n'},RES('drift'),
      {label:'e'} ] };
  /* 到場的訊息（AA_182 第 1 節、BB_119 9-1）。陣列＝連續幾則 */
  const MSG={
    an_cafe:['明天下午四點，兩點半窗邊。','理由：有一件事，要當面說。'], an_cafe_wait:['我在窗邊。'], an_stay:'你留一下。',
    an_video:['今晚九點，視訊。我有一件事要說理由。'], an_jp:['明天下午三點，我那裡。','理由：有一件事，要當面說。'],
    yt_thu:['今天週四。我在三樓。','……我想問你一件事。'], yt_next:['沒關係。下週四。'], yt_video:['今晚九點，可以視訊嗎。'],
    ps_video:['今晚九點，可以視訊嗎？','……有一件事，我想好好說。'],
    zr_ask:['明天你那邊下午五點，可以視訊嗎？','……有一件事，我想看著你說。'], zr_tea:['我泡好茶了。……我等你半小時。'],
    zq_ask:['明天晚上七點，河堤。','……你會來吧。這次是問句。'], zq_wait:['我在河堤','等到八點'], zq_next:['明天。一樣七點。'] };
  /* 不回答（慢慢淡）：幾天以後她傳的（AA_123 4-2、5-2；BB_119 2-1、2-3、2-4）；retry＝第 2 節開頭「避不掉的那一件剛好讓計數到 3」那一次 */
  const DRIFT={
    [AN]:{days:14,msgs:['我們先回到讀書會的同學。理由欄我先空著。']},
    [YT]:{days:7,noodle:'加滷蛋。……這個不會變。'},   /* 她不再留位子；一週後的麵店，她照常端麵來 */
    [PS]:{days:14,msgs:['溫州街那天說的事，我想到一個奇怪的答案。','我們先當朋友。……這樣你就不用回答了。'],video:['我們先當朋友。……這樣你就不用回答了。']},   /* 視訊談的：第一句提到溫州街，不送（和事實不合，回報 AA）*/
    [ZR]:{days:14,letter:{nar:'（英國寄來一個信封。裡面一張明信片、一張只寫給你的小卡。）',card:'我們先當朋友。片單我還是會寄。'}},   /* 她不說，她寫；不寫在給常客們的明信片上 */
    [ZQ]:{days:7,msgs:['（貼圖：插座貓，一隻貓自己在充電）','我們先當朋友']} };
  const RETRY={[PS]:'我們再試一個月。',[ZR]:'我們再試一個月。',[ZQ]:'我們再試一個月'};   /* 她不提先當朋友（BB_119 第 2 節開頭）；子晴不加標點（她的口氣）*/
  /* 修補沒做到＝分開（芷若的八週六次）：分開時她的最後一句，用私訊 */
  const LAST={[ZR]:'回去以後，我還是在吧檯後面。你點什麼，我都記得。'};
  /* 裂縫的小事件 */
  const SRC={
    yt_seat:'今天週四。總圖三樓，斜對面的位子我留了。', yt_seat_no:'今天不行',   /* AA_182 1-2：交往中每週四 12:10（作息，不是邀約）；回「今天不行」的不算 */
    zr_pc:'上一張你沒回。……沒關係，這張也不用。' };   /* BB_119 2-3 ②：連兩個月沒回寄，下一張的最後一行 */
  const PRE={
    plg:[an(MSG.an_stay),{scene:'萬才館研討室',bg:'wancai_seminar'}],   /* 讀書會散會後（AA_182 1-1）*/
    video:[{scene:'視訊',bg:'video'}], river:[{scene:'河堤',bg:'riverside'}], jp:[{scene:'國際學生宿舍',bg:'jp_lounge'}] };
  return {AN,YT,PS,ZR,ZQ,BODY,MSG,DRIFT,RETRY,LAST,SRC,PRE,NONE,
    yt_noodle:[yt(DRIFT[YT].noodle)]};
})();
