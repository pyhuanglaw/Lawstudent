/* ===== 順手的事（店員的支線；AA_397 定稿，企劃線 8f1701b23；任務 SIDEQ-AA397-1023）=====
   台詞、旁白照稿一字不改（D100、D109）；稿裡沒有的句子不自己寫：那一步先不演（資料裡留 null），缺的字列給 AA。
   第 1 節 系統：
   - 店員「認得你」（src/eat3d.js：同一間店點第 5 次起）以後，在那間店點完餐，店員偶爾（S.ROLL）多一句自己的困擾 → 「要我幫忙嗎？」＝掛進「順手的事」；
     「……加油。」＝不掛，這一則這學期不再出現（下學期還可能再出）。一則一學期只出一次；一家店同時只掛一則；同時最多兩則（S.MAX）；一天最多問一次。
   - 手機「今天」那一頁多一格「順手的事」（classes3d.js todayHTML 叫 S.todayHTML）：標題（稿的小標）、下一步、期限。
   - 期限：只有要玩家去做事的那一步有期限（r.by）；過了＝lapsed（不扣任何數值；店員交代後來怎樣的那一句稿裡沒有，q.lapse＝null 先不演）。
     等結果的那一步（下次去那間店就看得到）沒有期限。
   - 做完：店員之後多一句、店裡的變化（「看」或點餐時一次的旁白）、相簿一頁（STORY.albumMemory）；
     有女主角幫忙的那一則照稿加熟悉；其他則做完時，當下在同一區、認識的女主角（最熟的那一位）熟悉 +1（AA_166 4-2：不特別安排人出現）。
   - 存檔 G.side[id]＝{state:'open'|'done'|'lapsed'|'declined', step, day, …}（declined＝「……加油。」，term 記哪一學期；其他欄位是各則自己的進度）。舊存檔沒有＝空物件。
     一天問過一次記在 G.flags.SIDEQ_DAY。
   第 2 節 SQ01～SQ08：各則的 accept（掛進去當下）、visit（之後在那間店）、trace（做完以後的痕跡）；接線：
     lane118.js L118.order／L118.isOpen（慢讀咖啡、六張犁麵舖、好家自助餐、蛋包飯研究所）、wzshops3d.js order364／interact（林家乾麵、巷口茶飲、夏日冰菓室；一盞茶屋的蘇姨）、
     story3d.js counter（公館的便利商店）、wzpark3d.js（公布欄、象棋阿伯）。法服、派出所、社課用出遊（OUT.plan，2D）。
     SQ02、SQ04 有法律的句子：LEGAL_REVIEW_REQUIRED（照 BB_115 送審）。
   第 3 節 公園的貓（SQ09）：PARK.catCold／catGone（wzpark3d.js）；2028-12-14（四）22:10～23:00 在公園、認識子晴、熟悉以上＝那一場（S.CAT_EV）；
     12/15 12:00 她傳照片；12/17 起公布欄換成領養告示（PARK.notices）；不在場＝象棋阿伯一句（wzpark3d.js）；
     2029-01～06 每月第一個週六的照片（有她的聯絡方式）；交往中：那則照片可以回「（去看貓）」＝隔天 14:00 去她家（2D 出遊，不另外寫台詞）。
   第二批 AA_404（企劃線 30bf21de8，SQ10～SQ15）、第三批 AA_405（1fa2b494a，SQ16～SQ20）、過期一句 AA_408 第 1 節（29e41dd8）；系統照第 1 節，不另外改。任務 SIDEQ-AA404-405：
     SQ10 滇香小館（OUT 週六 14:00 中和・華新街，來回 60 元）、SQ11 巷口家常菜（下次去對發票；讀 SQ08／公園「餵」過；貓領養以後紙盒的字換掉）、
     SQ12 Pasta 118（OUT 下週一 19:00；交往中可以約她；下學期起熟客招呼換一句＋她補一句：lane118.js 讀 S.greet／S.greetMore）、
     SQ13 韓食小廚（三次試泡菜：開口那次＋之後兩天各一次）、SQ14 一盞茶屋（公園「看」貓放進外出籠 → OUT 動物醫院 → 回茶屋；AA_397 3-2 的 12/15 訊息、12/17 告示多「（豆花）」）、
     SQ15 舊路書房（下次去整理；三選一；之後找學姊說話先演（SISY23.preTalk 包一層）；房間物品「學姊大一的民法總則」）、
     SQ17 一一八茶飲（三次問一題；給了電話＝四月底她私訊「上了。京都。」，沒給＝四月底以後下一次點飲料當面說；2028-04-20 21:00 以安的訊息）、SQ18 清葉茶行（OUT 下個週日 08:30 小公園；之後公布欄「——里長」的紙、名牌多一行）、
     SQ19 巷子裡定食（還芯慈＝找她說話的 interact 事件；兩週以後芯慈在班上群組約讀書會那三則）、SQ20 半熟早午餐（兩個週六 08:00 的 OUT；柏翰熟悉以上可以找他）。
     SQ16 輪轉單車（AA_405 第 3 節 f923751c）：公館「找車行老闆」（LAWWW2 ed65a78e）一天一次、第 5 次起認得你；普通 201 門口週四晚上「問登山社的人」；回車行做完；車籃紙條（痕跡）、每學期換名字。
     接線：lane118.js（Pasta 招呼）、wzshops3d.js（一盞、半熟點完叫 atShop）、story3d.js（清葉茶行、舊路書房點完叫 atShop、記次數）、
     wzpark3d.js（SQ14 外出籠、告示、名牌）、outings3d.js（2D 背景 hwaxin_street、vet_clinic：還沒有圖＝深色底）。
   第二、三批的缺字 AA_408 第 6 節（企劃線 b0b80a54；任務 SIDEQ-AA408-6-1023）：SQ17 三題的回答（前兩次在前兩題裡選、第三次只有「如果沒上呢？」）＋第三題之後給不給電話
     （聯絡人「一一八茶飲的店員」只登錄名字：PORTRAIT_ONLY，同 us_life_events.js 的何俊朗）、SQ20 自己計時的兩次、SQ19 班上群組三則（取代兩句旁白）、
     SQ10 出遊回來以後下一次來滇香先交乳扇（那時才算做完）、SQ12 帶交往對象去的那一句＋她接的一句（芷若、沛珊大三上不在臺北：不在可選名單）、
     SQ15 房間物品平常「看」那一句、SQ18 掃完落葉以後阿伯那一杯（不給錢）。
   測試：node tests/aa397_sideq_unit.js、node tests/aa404_sideq_unit.js */
'use strict';
const SIDEQ=(function(){
  const S={}, ZQ='heroine_04', SIS='heroine_05', AN='heroine_01', MX='classmate_mingxuan', XC='classmate_xinci', BH='classmate_bohan';
  const TERMS=['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'];
  const HEROINES=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05'];
  const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const law=G=>!!G&&!!G.flags&&(G.stage||'law')==='law';
  const T_=G=>typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(G.day):null;
  const dateOf=d=>typeof CALENDAR!=='undefined'?CALENDAR.dateOf(d):{y:2027,m:6,d:1,wd:1};
  const month=G=>dateOf(G.day).m;
  const hr=G=>(((+G.hour||0)%24)+24)%24;
  const now=G=>G.day*24+(+G.hour||0);
  const md=d=>{ const q=dateOf(d); return q.m+'/'+q.d; };
  const wdTxt=d=>'日一二三四五六日'[dateOf(d).wd%7];
  const has=(id,tag)=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(id,tag);
  const met=id=>has(id,'FIRST_MET');
  const stageAt=(id,st)=>typeof SOCIAL!=='undefined'&&!!SOCIAL.STAGES&&!!SOCIAL.stage&&SOCIAL.STAGES.indexOf(SOCIAL.stage(id))>=SOCIAL.STAGES.indexOf(st);
  const nm=id=>typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(id):id;
  const npcOf=(GM,id)=>(GM.npc&&GM.npc[id])||null;
  const here=(GM,id)=>{ const n=npcOf(GM,id); return !!n&&!n.leaving&&!(GM.E&&Array.isArray(GM.E.npcs)&&!GM.E.npcs.includes(n)); };   /* 在這一區（真的建出來了、沒有要走）*/
  const who=(GM,id)=>npcOf(GM,id)||{name:nm(id),charId:id};
  const sent=(G,tag)=>typeof PHONE!=='undefined'&&PHONE.sent(G,tag);
  const dm=(id,t)=>({th:'p:'+id,from:id,text:t});
  const fam=(id,n)=>{ if(typeof SOCIAL!=='undefined'&&SOCIAL.adjust) SOCIAL.adjust(id,{fam:n}); };
  S.dating=(G,id)=>{ const F=(G&&G.flags)||{}, R=F.romance||{}; return F['dating_'+id]===true||!!(R[id]&&R[id].status==='dating'); };

  /* 現在在第幾學期（寒暑假＝前一個學期之後，brk）*/
  S.termPos=function(G){ if(typeof CALENDAR==='undefined'||!CALENDAR.termDays) return {i:-1,brk:true,id:null};
    for(let i=TERMS.length-1;i>=0;i--){ const r=CALENDAR.termDays(TERMS[i]); if(r&&G.day>=r.from) return {i,brk:G.day>r.to,id:TERMS[i]}; } return {i:-1,brk:true,id:null}; };
  S.termKey=G=>{ const p=S.termPos(G); return p.id?(p.brk?'B'+p.id:p.id):'B0'; };   /* 「一學期只出一次」的學期（寒暑假算一段）*/
  const ti=G=>{ const p=S.termPos(G); return p.i; };
  const inTerm=(G,id)=>{ const T=T_(G); return !!T&&T.id===id; };
  const lastDay=()=>{ const r=typeof CALENDAR!=='undefined'&&CALENDAR.termDays?CALENDAR.termDays('Y4S2'):null; return r?r.to:Infinity; };   /* 畢業（大四下最後一天）以後不再出 */
  /* 第二、三批的期限：「這學期內」＝這學期最後一天（寒暑假裡＝下學期開學前一天）；下一個星期幾（今天以後）；「那個月」＝這個月最後一天 */
  const termEnd=G=>{ if(typeof CALENDAR==='undefined'||!CALENDAR.termDays) return G.day+30; const p=S.termPos(G); if(p.id&&!p.brk){ const r=CALENDAR.termDays(p.id); if(r) return r.to; }
    const nx=TERMS[p.i+1], r=nx?CALENDAR.termDays(nx):null; return r?r.from-1:G.day+30; };
  const nextWd=(G,wd,from)=>{ for(let d=(from!=null?from:G.day+1);d<=G.day+14;d++) if(dateOf(d).wd%7===wd) return d; return null; };   /* wd：0＝週日、1＝週一、6＝週六 */
  const monthEnd=d=>{ const m=dateOf(d).m; let e=d; while(e<d+31&&dateOf(e+1).m===m) e++; return e; };
  const pres=(G,id)=>!(typeof STORY!=='undefined'&&STORY.presence&&STORY.presence(id,G).here===false);
  const metSis=G=>met(SIS)||!!(G&&G.flags&&G.flags.met_sis);

  /* ---------- 稿（AA_397 第 2 節＋AA_408 補字，企劃線 29e41dd8；第 6 節第二、三批的缺字 b0b80a54）：照抄；null＝稿裡沒有，先不演 ---------- */
  const SHOP_NAME={'林家乾麵':'林家乾麵','巷口茶飲':'巷口茶飲','夏日冰菓室':'夏日冰菓室','慢讀咖啡':'慢讀咖啡（118 巷）','六張犁麵舖':'六張犁麵舖（118 巷）','好家自助餐':'好家自助餐（118 巷）','蛋包飯研究所':'蛋包飯研究所（118 巷）','公館的便利商店':'公館的便利商店',
    '滇香小館':'滇香小館（118 巷）','巷口家常菜':'巷口家常菜（118 巷）','Pasta 118':'Pasta 118（118 巷）','韓食小廚':'韓食小廚（118 巷）','溫州街・一盞':'一盞茶屋（溫州街）','舊路書房':'舊路書房（公館）',
    '一一八茶飲':'一一八茶飲（118 巷）','清葉茶行':'清葉茶行（公館）','巷子裡定食':'巷子裡定食（溫州街）','溫州街・半熟':'半熟早午餐（溫州街）'};
  /* 店名（key）＝各店點餐時記次數用的名字（src/eat3d.js 的 EAT.count）：一盞茶屋、半熟早午餐是「溫州街・一盞」「溫州街・半熟」（wzshops3d.js 的 buy）；清葉茶行、舊路書房沒有吃過的，story3d.js 點完一樣記次數 */
  const STAFF={'林家乾麵':'老闆','巷口茶飲':'店員','夏日冰菓室':'老闆娘','慢讀咖啡':'店長','六張犁麵舖':'老闆','好家自助餐':'阿姨','蛋包飯研究所':'店員','公館的便利商店':'店員',
    '滇香小館':'老闆娘','巷口家常菜':'老闆娘','Pasta 118':'老闆','韓食小廚':'老闆','溫州街・一盞':'蘇姨','舊路書房':'書店老闆','一一八茶飲':'店員','清葉茶行':'茶行老闆娘','巷子裡定食':'定食店長','溫州街・半熟':'小米姐','輪轉單車':'車行老闆'};   /* 說話框（AA_404、AA_405 的「誰」）*/
  S.STAFF=STAFF; S.SHOP_NAME=SHOP_NAME;
  S.YES='要我幫忙嗎？'; S.NO='……加油。';
  const L={
    SQ01:{open:['有人給我一顆星。說湯是冷的。','……我們乾麵沒有湯。'],review:'★☆☆☆☆　湯是冷的。等了十分鐘。不推。',   /* 手機畫面（AA_408 2）*/
      reply:[{k:'polite',t:'謝謝指教，乾麵本來就沒有湯，下次可以點餛飩湯。'},{k:'curt',t:'您點的是乾麵。'},{k:'none',t:'不回。'}],
      result:{polite:['★★★★☆　原來乾麵沒有湯，是我點錯了。老闆回得好有禮貌。','（他的上一則評價寫的是：『大一，第一次自己來公館吃飯。』）'],curt:['★★☆☆☆　好吧。'],none:['（隔天，評價下面多了一則老闆的回覆，三個字：『沒有湯。』）']},   /* AA_408 2：評價原文、大一新生那一行、老闆自己回 */
      wall:'「乾麵沒有湯」',greet:'小的，不加辣。……字是我寫的，醜。',lapse:'評價那個，我自己回了。……三個字，『沒有湯』。'},
    SQ02:{open:[[null,'（她把一張紙壓在收銀機下面。）'],['店員','老闆說上禮拜打破的杯子，要從我薪水扣。三個，四百五。']],
      ask:['要不要帶去法服問？','妳自己覺得呢？'],askReply:[null,['……我覺得不合理。可是我不敢跟他說。','你們學校的法服，可以問這種嗎？']],   /* AA_408 2：「妳自己覺得呢？」接第 2 步 */
      fafu:'可以先跟老闆好好談；需要的話，勞工局有免費的諮詢。',   /* LEGAL_REVIEW_REQUIRED（BB_115）*/
      back:'（她回去跟老闆說了。老闆說：「我只是嚇嚇妳，誰叫妳一直講手機。」最後沒扣。）',treat:'半糖少冰，對吧。……今天不算錢。',
      trace:'（櫃台貼了一張「工作中手機請放後面」——她自己貼的。）',lapse:'杯子的錢，還是扣了。……算了，下次小心一點。'},
    SQ03:{open:['價目板曬到看不到了。你們讀書人字好看，幫我寫一下。'],midN:'（你寫到芒果冰那一行，老闆娘從冰櫃後面探出頭。）',mid:'今年芒果貴。……可是寫上去不好看，你寫原來的價錢。',end:'（價目板是新的，芒果冰的價錢是舊的。）',echo:'……字還在。',lapse:'價目板我叫我兒子寫了。字很醜，看得到就好。'},
    SQ04:{open:[[null,'（店長把一台筆電放在吧檯上。）'],['店長','這台放在插座那一桌三個禮拜了。'],['店長','……要怎麼辦。']],ask:['交給派出所。','再等一下？'],askReply:[null,['……已經三個禮拜了。','好，再一個禮拜。']],again:'還是沒人來拿。',   /* AA_408 2：一週以後再來＝直接接第 2 步 */
      police:'（警察登記，說會找失主。）',   /* LEGAL_REVIEW_REQUIRED（BB_115）：只有「交給派出所」，拾得物的規定不展開 */
      thanks:'（兩個禮拜後，一個很瘦的男生來店裡道謝。他是國考生，那天胃出血被送急診，住院兩週。筆電裡是他三年的筆記。）',after:'（他每天來同一個插座位子讀書，店長幫他留。）',
      card:'（那個插座位子的桌上，多了一張手寫的小卡「謝謝」。）',pass:'（牆上多了一張剪報大小的紙：「榜單影本」。）',lapse:'那台筆電，我送去派出所了。'},
    SQ05:{open:['膝蓋要開刀。要休兩個禮拜。','……公休的紙，你幫我寫，寫得好看一點。'],notes:['老闆去修膝蓋，兩週後見。','本店公休至○月○日。','休息一下，大碗加蛋等你。'],
      zheCard:[['zhe','六張犁的老闆要去開膝蓋！'],['zhe','我買了一張卡片，明天中午A館一樓，大家來簽'],['yu','我帶彩色筆']],sign:'（你下課經過A館一樓，阿哲把卡片塞給你。）',   /* AA_408 2：答應那天 21:00 麵店團群組 */
      photo:[['zhe','（照片：病床旁的小桌，卡片立著，旁邊一碗醫院的稀飯）'],['zhe','老闆說，這個沒有他煮的好吃']],reopen:'大碗加蛋。……今天不收錢。',card:'（卡片貼在煮麵台旁邊的牆上。）',lapse:'公休的紙我自己寫了。『休息兩週』。……四個字。'},
    SQ06:{open:['我孫子國二，數學不及格。','你們有沒有同學在當家教？'],askTutor:{[MX]:['國二數學，可以。週幾？','我本來就在那附近教，順路。這個 CP 值很高。'],[AN]:['國二數學。好。週四以外都可以。']},   /* AA_408 2（明軒的「CP 值」這一場算一次）*/
      report:'他上課一直在桌子底下彈手指。',selfReport:['（第一次上課。他的數學課本很新，手指一直在桌子底下彈。）','（你看了一下：他彈的是吉他的和弦。）'],
      twist:'（孫子想學的是吉他，不是數學。他在網路上看了吉他社成發的影片。）',zq:'……國二？我國二的時候也只會 C。',noZq:'（家教跟阿姨說了，阿姨買了一把二手吉他。）',
      trace:'我孫子數學及格了。……吉他也是。',lapse:'家教找到了，我自己問的。……我孫子還是一直彈手指。'},
    SQ07:{open:['跟你說，我要考研究所。真的那種。','讀書計畫寫好了，你幫我看。你們法律系的會挑毛病。'],plan:'（第一句寫著：『我想知道，為什麼同一顆蛋，煎三分鐘和三分半，吃起來是兩種東西。』）',ask:['第二段太長。','我看不懂第三段。','我認識一個人，很會看這個。'],askReply:[['第二段是我最想寫的。……好，砍一半。'],['看不懂才對。我自己也看不懂。','重寫。'],null],sisN:'（學姊在 Café 看了五分鐘，在第三段畫了一條線，把它的第一句圈起來，移到最前面。）',
      sis:'她第三段想說的，第一句就要說。',pass:'（她考上了，可是要搬去台中。）',last:'（最後一天她煎了一個寫著你名字的蛋包飯（番茄醬寫的字）。）',bye:'本所所長要畢業了。',
      board:'（店門口的小黑板：「本所所長赴台中深造。新所長培訓中。」）',newbie:'我是新所長。……還在培訓。',lapse:'讀書計畫我自己改了。考不考得上，五月才知道。'},
    SQ08:{open:['你也是買給公園那隻的？','今天你是第四個。'],none:'（沒有任何餵貓的說明。）',ask:{abo:'貓？我每天帶一點魚乾。牠比我準時。',su:'我中午會放一碗水。……牠不吃我的飯，只喝水。'},   /* AA_408 2（阿伯就是里長，SQ18 才揭曉，這裡不提）*/
      all:'（大家都在餵。）',table:'我做一張表，你拿去貼。',post:'（你把表貼在公布欄的角落，用了四個圖釘。）',
      sheet:'（一格一天，誰餵誰簽名。）',chief:'（有人在表的最下面加了一行：「星期日我來。——里長」）',cold:'（那一週的格子都寫著「沒吃」。）',lapse:'餵貓那張表，我自己貼了。'},
    /* 第二批（AA_404，30bf21de8）＋過期一句（AA_408 第 1 節）。描述句加括號當旁白（AA_408 第 3 節）；「某某：「…」」的冒號拆成旁白＋說話框（同 SQ02 的開頭）*/
    SQ10:{open:['乳扇沒有了。我們家鄉的那種，臺北只有中和那條街買得到。','……我這個月走不開。你週末有空嗎？'],noteN:'（她多給一張摺好的紙條。）',note:'拿給老闆娘。',
      read:'（雜貨店的老闆娘看了紙條，愣了一下。）',who:'阿梅？……她在臺北開店？',past:'（她們是小時候在緬甸同一個村子長大的，三十年沒聯絡。）',
      giveN:'（雜貨店的老闆娘多塞了一包東西和一張寫了電話的紙。）',give:'乳扇是她的，這包是我的。叫她打給我。',
      handN:'（你把那包乳扇和紙條交給老闆娘。她先看紙條，看了很久。）',hand:'……她還記得我叫阿梅。',   /* AA_408 6：出遊回來以後，下一次來滇香 */
      menu:'（滇香的菜單多一行手寫「炸乳扇（限量）」。）',greet:'下禮拜我要去中和。……她說要教我做她媽媽的那道。',lapse:'乳扇我託客人去中和買了。……那間店的老闆娘，我沒見到。'},
    SQ11:{open:[[null,'（老闆娘從櫃台下面拿出一個鞋盒。）'],['老闆娘','客人不要的發票，我都留著。'],['老闆娘','……字太小了，我看不到。同學，你幫我對。']],
      winN:'（對到一張中了兩百塊。老闆娘看了很久。）',win:'……二十年了，第一次中。',cat:['兩百塊，拿去買罐頭。給公園那隻。','我每天收攤經過，牠都在那張椅子上。'],noCat:'兩百塊。今天你的排骨我請。',
      box:'（櫃台多一個紙盒，上面手寫「發票請投這裡」。）',boxCat:'（下面多一行小字「中了買貓罐頭」。）',adopt:'（那行小字劃掉，改成「中了捐給動物之家」。）',lapse:'發票我叫我女兒對了。……都沒中。'},
    SQ12:{open:['下禮拜一公休。……我想請你來當客人。','我要跟我女朋友求婚。店裡只有她一個人，她會發現。'],
      inN:'（女朋友進門，看了一下店裡唯一一桌客人，走過來小聲說。）',in:'你是他找來的吧。',inPair:'你們是他找來的吧。',   /* AA_408 6：帶交往對象一起去＝對兩個人說，她接一句 */
      pair:{[AN]:'……我們很明顯嗎？',heroine_03:'……對不起。我們演得不好。',[ZQ]:'我們很認真在演耶。',[SIS]:'……我就說點兩份太刻意。',kexin:'我就說不要坐窗邊。'},knew:'（她早就知道了。她看到他訂了一個戒指盒，盒子放在廚房的抽屜裡兩個禮拜。）',
      yesN:'（她坐回吧檯，等甜點上來，打開，說「好」，然後轉頭問你。）',photo:'可以幫我們拍一張嗎？',free:'（老闆那一晚沒收錢。）',
      wall:'（吧檯後面的牆多一張照片（兩個人，後面是窗邊那一桌）。）',greet:'一位嗎？吧檯老位子。',her:'窗邊也有位子喔。',lapse:'那天我一個人顧店。……她說好。'},
    SQ13:{open:['我太太回韓國照顧她媽媽，要三個月。泡菜都是她醃的。','我照她的方法醃了一罐。……你幫我吃吃看。'],ask:'這罐怎樣？',opts:['比上次好。','比上次差。','一樣。'],reveal:'這罐是她從韓國寄來的。',
      better:['……你分得出來。','我分不出來。我吃了三個月自己的，已經忘記她的是什麼味道了。'],other:[['老闆','……我也分不出來。'],[null,'（他笑了。）'],['老闆','那就好。我醃得還可以。']],
      back:['（老闆娘回來了。）','（櫃台旁邊多一個人在切菜。）'],jar:'（小菜櫃多一個玻璃罐，貼著手寫的標籤「她的」。）',greet:'小菜可以續喔。……那罐不行。',lapse:'泡菜我自己吃完了。……還是分不出來。'},
    SQ14:{open:['牠的腳好了。獸醫說要回診，順便打預防針。','……我走不開。外出籠在後面。'],cage:'（牠沒有掙扎，只是一直看著你。）',
      chip:['（獸醫掃晶片，螢幕上跳出登記資料：十二年前登記的，飼主是一位陳先生，地址就是茶屋那一號。）','（名字欄寫「豆花」。）'],
      backN:'（回到茶屋，蘇姨看了單子很久。）',back:['……是我先生。他走了五年了。','他說要帶牠去打晶片。我以為他沒去。','他走了以後，牠不肯待在屋子裡，每天跑去公園。我就讓牠去。'],
      tea:'（蘇姨把那張單子收進櫃台的抽屜，請你喝一壺茶，不收錢。）',photo:'（茶屋櫃台多一張貓的照片，照片很舊，背景是茶屋的院子。）',greet:'豆花今天有去公園嗎？',
      zq:['牠有晶片。醫生說飼主是茶屋的人。','我去問了。阿姨簽了一張單子給我。……她說牠叫豆花。'],notice:'（豆花）',lapse:'回診我請隔壁幫忙帶了。'},   /* 法律內容沒有（掃晶片、登記資料、簽單子，不寫寵物登記的規定）*/
    SQ15:{open:['有人拿來一箱法律系的書。我分不出哪些版本太舊、不能賣了。','……你是法律系的吧。幫我看一下。'],look:'（六法全書兩本、刑法總則一本、一本很舊的民法總則。）',
      find:['（民法總則的封面內頁，寫著「溫書瑀」。）','（每一頁的邊邊都寫滿了字。很多問號，有些問號後來被劃掉了。）'],dinner:'（翻到善意第三人那一頁，她用紅筆圈起來，旁邊寫：「善意＝不知道。不是心地善良。」）',
      who:'一個女生拿來的，很瘦，講話很快。她說這箱不用算錢。',opts:['這本我買。','幫我留著，我問問她。','這幾本修法了，不能賣。'],reply:['八十。……你認識她？','好。留一個禮拜。','那這本我拿去回收。'],
      sis:{put:'（你把那本民法總則放在她桌上。）',how:'……這本怎麼會在你這裡。',bought:'我賣掉的時候，以為不會再看到。',asked:'書店老闆打電話問我？……不是。是你在那裡整理。',ugly:'裡面的字很醜。問號很多。',keep:'……你留著吧。裡面錯的地方，你現在用得到。'},
      buy:'她說給你的？好。',item:'學姊大一的民法總則',shelf:'（學姊大一的民法總則。封面內頁寫著『溫書瑀』，字比現在圓一點。）',   /* AA_408 6：房間物品平常「看」*/ eve:'（最後一頁，她寫了一行小字：『考完了。下次不要熬夜。』）',lapse:'那箱書，我拿去回收了。'},
    /* 第三批（AA_405，1fa2b494a）。SQ16 輪轉單車：AA_405 第 3 節補充（f923751c）；店門口互動點 LAWWW2 ed65a78e；過期一句 AA_408 第 1 節 */
    SQ16:{open:['這台送來修，兩年了，沒人來牽。','……電話打不通。你是首都帝大的吧，幫我看看那張貼紙。'],
      look:'（一張很舊的校內停車證，只看得到一半的號碼，旁邊貼著一張社團的貼紙「登山社」。）',   /* AA_405 SQ16 步驟 1 的「看」車架（稿的描述照抄成旁白）*/
      ask:'請問一下，這張貼紙是你們社團的嗎？',club:['……這是我們以前社長的車。他畢業了，在新竹上班。','我問他。'],
      msg:['（她傳了訊息。過了一下，她的手機震了，她把畫面轉給你看。）','（「那台車我以為被偷了。……修好就好。送給學弟妹吧，新生沒車很麻煩。」）'],
      back:'送給新生？……好。那我把它修好。',note:'（車頭掛了一張紙：『免費借給新生，一學期』。）',
      greet:['打氣筒在門口，自己來。','今天沒什麼車要修。……坐一下可以。'],
      names:['陳品叡','黃惠玲','張宇翔','劉思妤','鄭文彬'],   /* AA_498 第 1 節：借車名單第 2、5 個名字和法律系同學（pool）撞名，換成黃惠玲、鄭文彬（存檔只記第幾個，不用換字）*/
      rename:'（車籃那張紙上，借車的名字換成了：{名字}。）',lent:'那台車這學期也借出去了。……第{N}個。',
      lapse:'那台車我拆了，零件給別台用。'},
    SQ17:{open:['我在申請交換。下禮拜英文面試。','你可以問我問題嗎？我一邊做飲料一邊答。'],qs:['為什麼想去？','去了想學什麼？','如果沒上呢？'],
      ans:[['我想去一個沒有人認識我的地方。……先在那邊點一次飲料，看他們會不會記得我。','I want to see if I can start over somewhere no one knows me.'],['日文。還有……怎麼一個人吃飯。','Japanese. And how to eat alone.'],
        ['如果沒上，我明年再申請。……這題我本來不想準備，因為我怕。','If I don\'t get in, I\'ll apply again next year.']],en:'（她說英文的時候，手上的封膜機停了。）',   /* AA_408 6：每一題中文、英文各一句；封膜機那一句只在第三題 */
      give:['上了跟我說。','加油。'],call:'……那你給我電話。',contact:'一一八茶飲的店員',   /* AA_408 6：第三題之後給不給號碼 */
      result:'上了。京都。',trace:'（窗口換了一個新的店員。牆上貼一張京都的照片，旁邊寫「她說：甜度冰塊記得問清楚」。）',
      an:['今天在學校的交流會遇到一個臺灣人。她說她以前在一一八茶飲打工。','她說你幫她練過面試。……你的人緣比我以為的好。'],lapse:'面試完了。結果四月才知道。'},
    SQ18:{open:['週日早上有一張二十杯的訂單，要送到溫州街的小公園。','我店裡走不開。你幫我送，運費算你一杯。'],clean:'（公園裡十幾個人在掃落葉、清水溝，是里民的清掃日。）',
      chief:'（訂飲料的是在涼亭下象棋的那位阿伯。他從口袋拿出一疊零錢付給你，戴上一頂寫著「里長」的帽子。）',who:'怎麼，你以為里長是誰？',sheet:'餵貓那張表，是你貼的吧。……星期日那一格，是我。',papers:'公布欄那些紙，都是我貼的。',
      stay:'（你留下來掃了半小時落葉。阿伯讓你一子，下了一盤。）',cup:'這杯是你的。茶行說，運費算你一杯。',   /* AA_408 6：掃完落葉以後（不給錢）*/ knows:'（你認得這個字。）',tag:'（阿伯的字。）',lapse:'那二十杯，我自己送了。'},
    SQ19:{open:['昨天有個女生把筆記本忘在這裡。封面寫法律系。','……你認識嗎？'],look:'（封面寫著「吳芯慈」，裡面每一頁都是三種顏色的筆，像印刷的。）',
      last:['（筆記本最後一頁不是筆記。是一張兩欄的表，左邊寫「以安」，右邊寫「我」。一格一格是考試、報告、發言的次數。）','（表的最下面另外寫了一行，字比較小：「下次換我先約她。」）'],
      ret:'（她接過筆記本，第一件事是翻到最後一頁。）',ask:'……你看了嗎？',opts:['看了最後一行。','沒有。'],seen:[['xc','……喔。'],[null,'（她把那一頁摺起來。）'],['xc','那一行，我會自己去做。']],no:[['xc','……謝謝。'],[null,'（她看了你一下，好像不太相信。）']],
      group:[['xc','週四晚上我借了一間討論室，讀這週的進度。要來的跟我說。'],['xc','@以安 妳要來嗎？'],['an','好。']],basket:'（定食店的櫃台多一個小籃子，寫著「失物」。）',greet:'今天沒有人忘東西。',lapse:'筆記本那個女生，自己回來拿了。'},
    SQ20:{open:['小蕙下個月要考證照，烘焙的。','她每次練習都超時。我在煎蛋，沒辦法幫她計時。你可以嗎？'],bohanOpt:'我找一個更會計時的人。',bohan:'每個步驟我分開計。你們看這張表。',
      self1:[[null,'（你用手機的碼錶。小蕙每做完一步，就看你一眼。）'],['小蕙','……超過了嗎？'],['小米姐','（從煎台那邊）她每次都超過在烤箱那一步。']],self2:'（這次她在烤箱那一步沒有看你。）',   /* AA_408 6：自己計時（沒找柏翰）的第一次、第二次 */
      apronN:'（第二個週末練完，小米姐把圍裙脫下來。）',apron:['……我也報了。','我考過兩次，都沒過。那時候在上班，沒時間練。','這次跟她一起考。不要告訴她，她會緊張。'],
      pass:'（一個月以後，兩個人都過了。小蕙先知道小米姐也有考，是在考場遇到的。）',certs:'（櫃台後面的牆上多兩張證書，並排掛著，一張寫小米姐的名字，一張寫小蕙的。）',greet:'今天的蛋，三分四十秒。……這是我考試的時候練出來的。',lapse:'小蕙自己計時。她說手機的碼錶很吵。'},
    CAT:{vet:['（照片：獸醫院的診療台，牠縮在毛巾裡）','感冒，老了。醫生說冬天不要待在外面。'],
      photos:[['牠霸佔了我的鍵盤。'],['牠睡在電暖器前面一整天。我也是。'],['醫生說牠胖回來了一點。'],['我遊戲裡的貓，換了一個新的動作：睡覺。'],['牠學會開衣櫃了。我不知道是誰教的。'],['（照片：貓趴在一張畢業證書上）','去年的。今天借牠拍一張。……畢業快樂。']]}   /* 第 6 張（2029-06-02，你的畢業典禮那天 12:00）：AA_465 第 2 節（企劃線 ee0d6b70d）——子晴自己 2028 就畢業了，原本的「牠比我早一步拿到證書」對不起來 */
  };
  S.LINES=L;
  /* SQ17 給了電話的聯絡人：不在 CHARACTERS（沒有 3D、作息、關係）；只登錄名字（手機的對話串、「加了…的聯絡方式」）＝PORTRAIT_ONLY，同 us_life_events.js 的何俊朗 */
  const TEA='tea118_staff'; S.TEA=TEA;
  if(typeof PORTRAIT_ONLY!=='undefined'&&!PORTRAIT_ONLY[TEA]) PORTRAIT_ONLY[TEA]={id:TEA,name:L.SQ17.contact,alias:[],gender:'f'};
  /* UI 的字（不是台詞）：選項的動作描述、說話框的名字 */
  S.UI={alone:'（一個人去）',invite:n=>'（約'+n+'一起去）',self20:'（自己幫她計時）',gf:'老闆的女朋友',grocer:'雜貨店的老闆娘'};

  /* ---------- 存檔 ---------- */
  S.rec=function(G){ if(!G.side||typeof G.side!=='object'||Array.isArray(G.side)) G.side={}; return G.side; };
  S.get=(G,id)=>{ const r=S.rec(G)[id]; return r&&typeof r==='object'?r:null; };
  /* 店裡看得到的痕跡（3D 模型的 TRACE_SQxx_* 節點，zones3d.js traceVis 每一格問；LAWWW2 10-23 SQ-TRACES-1023）：和各則 trace 的旁白同一個時間——
     做完的隔天起（SQ12 吧檯照片、SQ14 貓照片、SQ19 失物籃）；SQ13「她的」罐子、SQ20 兩張證書過期（店員交代過）也照樣有（AA_408 第 1 節）。SQ16 紙條：過期＝沒有那張紙（AA_408 第 1 節）*/
  S.TRACE_LAPSE={SQ13:1,SQ20:1};
  S.traceOn=function(G,id){ if(!law(G)) return false; const r=S.get(G,id); if(!r) return false; const base=r.state==='done'?r.doneDay:(S.TRACE_LAPSE[id]&&r.state==='lapsed'&&r.told?r.told:null); return base!=null&&G.day>base; };
  S.isOpen=(G,id)=>{ const r=S.get(G,id); return !!r&&r.state==='open'; };
  S.openIds=G=>Object.keys(S.rec(G)).filter(id=>Q[id]&&S.isOpen(G,id));
  S.MAX=2; S.ROLL=0.35; S.roll=()=>Math.random();   /* 「偶爾」：點完餐 35%（測試換掉 S.roll）*/
  S.known=(G,key)=>key==='輪轉單車'?S.bikeN(G)>=5:(typeof EAT!=='undefined'&&!!EAT.count&&(EAT.count(G,key)>=5||!!(EAT.rec&&EAT.rec(G).l5[key]!=null)));   /* 車行沒有點餐：「找車行老闆」第 5 次（一天一次）＝認得你（AA_405 第 3 節）*/   /* 店員認得你（eat3d.js：第 5 次起、或店員已經說過認得你的那一句；在點完那一刻判斷，這一次也算）*/

  /* ---------- 各則 ---------- */
  const say=async(GM,w,t)=>{ if(t==null) return; if(Array.isArray(t)){ for(const x of t) await say(GM,w,x); return; } await GM.say(w?{name:w}:null,t); };   /* 陣列＝連續幾句（AA_408 補的回話）*/
  const sayAll=async(GM,w,a)=>{ for(const t of a) await say(GM,w,t); };
  const q2=t=>'「'+t+'」';
  const setWait=(r,step,day)=>{ r.step=step; r.wait=day; r.by=null; };
  const setAct=(r,step,by)=>{ r.step=step; r.by=by; };
  const refund=(GM,o)=>{ if(o&&o.price>0&&GM.money) GM.money(+o.price); };
  const Q={
    SQ01:{shop:'林家乾麵',title:'林家乾麵：一星評價',avail:G=>ti(G)>=1,
      accept:async(GM,r)=>{ await say(GM,null,L.SQ01.review); const R=L.SQ01.reply, k=await GM.choose(R.map(o=>({t:o.k==='none'?o.t:q2(o.t)}))); r.reply=(R[k]||R[2]).k; setWait(r,'wait',GM.G.day+1); },
      visit:async(GM,r)=>{ if(r.step!=='wait'||GM.G.day<r.wait) return false; await sayAll(GM,null,L.SQ01.result[r.reply]||L.SQ01.result.none); S.finish(GM,'SQ01',r); return true; }},
    SQ02:{shop:'巷口茶飲',title:'巷口茶飲：打破的杯子',avail:G=>ti(G)>=2,
      accept:async(GM,r)=>{ const k=await GM.choose(L.SQ02.ask.map(t=>({t:q2(t)}))); r.ask=k; await say(GM,'店員',L.SQ02.askReply[k]); S.planFafu(GM.G,r); },
      visit:async(GM,r,o)=>{ if(r.step!=='wait'||GM.G.day<r.wait) return false; await say(GM,null,L.SQ02.back); await say(GM,'店員',L.SQ02.treat); refund(GM,o); r.free=o&&o.price||0; S.finish(GM,'SQ02',r); return true; },
      trace:async(GM,r)=>{ if(r.state!=='done'||r.t1||GM.G.day<=r.doneDay) return false; r.t1=GM.G.day; await say(GM,null,L.SQ02.trace); return true; }},
    SQ03:{shop:'夏日冰菓室',title:'夏日冰菓室：褪色的價目板',avail:G=>{ const r=typeof CALENDAR!=='undefined'&&CALENDAR.termDays?CALENDAR.termDays('Y2S2'):null, m=month(G); return !!r&&G.day>r.to&&m>=5&&m<=8; },
      accept:async(GM,r)=>{ setAct(r,'board',GM.G.day+7); },
      trace:async(GM,r)=>{ const G=GM.G, y=dateOf(G.day).y, m=month(G); if(r.state!=='done'||r.writer!==AN||m<5||m>8||y<=dateOf(r.doneDay).y||r.echoY===y||G.zone!=='wenzhou'||!here(GM,AN)) return false;
        r.echoY=y; await GM.say(who(GM,AN),L.SQ03.echo); return true; }},   /* 以安寫的那一版：之後每年夏天，她在溫州街（一年一次）*/
    SQ04:{shop:'慢讀咖啡',title:'慢讀咖啡：一台沒人拿的筆電',avail:G=>ti(G)>=3,
      accept:async(GM,r)=>S.ask04(GM,r),
      visit:async(GM,r)=>{ const G=GM.G; if(r.step==='again'){ if(G.day<r.again) return false; await say(GM,'店長',L.SQ04.again); S.police04(GM,r); return true; }   /* 「再等一下？」一週以後：還是沒人來拿 → 一起送去派出所（AA_408 2）*/
        if(r.step==='ask'){ await say(GM,'店長',L.SQ04.open[2][1]); await S.ask04(GM,r); return true; }
        if(r.step!=='wait'||G.day<r.wait) return false; await say(GM,null,L.SQ04.thanks); await say(GM,null,L.SQ04.after); S.finish(GM,'SQ04',r); return true; },
      trace:async(GM,r)=>{ const G=GM.G, base=r.state==='done'?r.doneDay:(r.state==='lapsed'&&r.told?r.told:null); if(base==null||G.day<=base) return false; if(!r.t1){ r.t1=G.day; await say(GM,null,L.SQ04.card); return true; }
        if(!r.t2&&G.day>=base+300){ r.t2=G.day; await say(GM,null,L.SQ04.pass); return true; } return false; }},   /* 十個月以後：榜單影本；過期（店長自己送去）的小卡、榜單照樣有（AA_408 1）*/
    SQ05:{shop:'六張犁麵舖',title:'六張犁麵舖：要公休兩個禮拜',avail:G=>inTerm(G,'Y3S1'),
      accept:async(GM,r)=>{ const G=GM.G; r.closeFrom=G.day+1; r.closeTo=G.day+14; r.reopen=G.day+15; const c=dateOf(r.closeTo);
        const N=L.SQ05.notes.map(t=>t.replace('○月○日',c.m+'月'+c.d+'日')); const k=await GM.choose(N.map(t=>({t:q2(t)}))); r.note=N[k]||N[0];
        r.zhe=!!(typeof PHONE!=='undefined'&&PHONE.inGroup(G,'noodle_team')&&met('zhe')); setWait(r,'closed',r.reopen);
        if(r.zhe){ const M=L.SQ05.zheCard.map(x=>({th:'g:noodle_team',from:x[0],text:x[1]})); M[M.length-1].ask={id:'sq05_sign',until:(G.day+1)*24+12,opts:[{t:'我去。'}]}; PHONE.at(G,G.day,21,M,'sq05_card'); } },   /* 答應那天 21:00 阿哲在麵店團群組揪簽卡片；回不回都照樣簽到（隔天霖澤館一樓那一行旁白）*/
      visit:async(GM,r,o)=>{ if(r.step!=='closed'||GM.G.day<r.reopen) return false; await say(GM,'老闆',L.SQ05.reopen); refund(GM,o); r.free=o&&o.price||0; S.finish(GM,'SQ05',r); return true; },
      trace:async(GM,r)=>{ if(r.state!=='done'||!r.zhe||r.t1||GM.G.day<=r.doneDay) return false; r.t1=GM.G.day; await say(GM,null,L.SQ05.card); return true; }},
    SQ06:{shop:'好家自助餐',title:'好家自助餐：阿姨的孫子',avail:G=>ti(G)>=2,
      accept:async(GM,r)=>{ const G=GM.G; r.tutor=met(MX)?MX:(met(AN)?AN:'me'); setWait(r,'lesson',G.day+3);
        const T=L.SQ06.askTutor[r.tutor]; if(T&&typeof PHONE!=='undefined') PHONE.at(G,G.day,+G.hour,T.map(t=>dm(r.tutor,t)),'sq06_ask'); },   /* 問明軒／以安（AA_408 2：私訊回你）*/
      visit:async(GM,r)=>{ const G=GM.G; if(r.step!=='twist') return false; if(r.tutor==='me'&&!r.selfSaid){ r.selfSaid=G.day; await say(GM,null,L.SQ06.selfReport); }   /* 自己去當家教：第一次上課的兩行旁白（取代家教回報）*/ await say(GM,null,L.SQ06.twist);
        const c=S.clubNext(G); if(c&&met(ZQ)){ const k=await GM.choose([{t:'帶孫子去吉他社社課看一次',hint:md(c.day)+'（'+wdTxt(c.day)+'）'+c.t0+':00　'+c.room},{t:'不用了'}]);
          if(k===0){ if(typeof OUT!=='undefined') OUT.plan(G,{id:'sq06_club',ev:'ev_sq06_club',day:c.day,h:c.t0,late:1,place:c.room,title:'吉他社社課：阿姨的孫子',travel:'走路 約 10 分鐘',travelH:1/6}); setAct(r,'club',c.day); return true; } }
        await say(GM,null,L.SQ06.noZq); S.finish(GM,'SQ06',r); return true; },
      trace:async(GM,r)=>{ if(r.state!=='done'||r.t1||S.termKey(GM.G)===r.doneTerm) return false; r.t1=GM.G.day; await say(GM,'阿姨',L.SQ06.trace); return true; }},   /* 及格那學期以後（做完的下一個學期起，一次）*/
    SQ07:{shop:'蛋包飯研究所',title:'蛋包飯研究所：真的研究所',avail:G=>inTerm(G,'Y3S2'),
      accept:async(GM,r)=>{ const G=GM.G, A=L.SQ07.ask, sis=met(SIS)&&stageAt(SIS,'FRIEND'); await say(GM,null,L.SQ07.plan);   /* 讀書計畫的第一句（AA_408 2）*/ const O=[{t:q2(A[0])},{t:q2(A[1])}].concat(sis?[{t:q2(A[2])}]:[]); const k=await GM.choose(O); r.ask=k;
        await say(GM,'店員',L.SQ07.askReply[k]); if(k===2) setAct(r,'sis',G.day+14); else setWait(r,'wait',G.day+21); },
      visit:async(GM,r)=>{ const G=GM.G; if(r.step==='wait'&&G.day>=r.wait){ await say(GM,null,L.SQ07.pass); setWait(r,'last',G.day+7); return true; }
        if(r.step==='last'&&G.day>=r.wait){ await say(GM,null,L.SQ07.last); await say(GM,'店員',L.SQ07.bye); S.finish(GM,'SQ07',r); return true; } return false; },
      trace:async(GM,r)=>{ const G=GM.G; if(r.state!=='done'||G.day<=r.doneDay) return false; if(!r.t1){ r.t1=G.day; await say(GM,null,L.SQ07.board); return true; }
        if(!r.t2&&G.day>r.t1){ r.t2=G.day; await say(GM,'店員',L.SQ07.newbie); return true; } return false; },
      onBy:(G,r)=>{ setWait(r,'wait',G.day+21); return true; }},   /* 兩個禮拜都沒在 Café 遇到學姊：不算過期，照「自己看」往下 */
    SQ08:{shop:'公館的便利商店',title:'便利商店：誰在餵公園的貓',avail:G=>{ const h=hr(G); return ti(G)>=2&&(h>=20||h<6)&&((G.daily&&G.daily.catCansN)|0)>=3&&typeof PARK!=='undefined'&&!!PARK.catName(G)&&!(PARK.catGone&&PARK.catGone(G)); },   /* 夜班（20:00～06:00）；第三次買貓罐頭以後 */
      accept:async(GM,r)=>{ setAct(r,'board',GM.G.day+14); },
      visit:async(GM,r)=>{ if(r.step!=='back') return false; await say(GM,'店員',L.SQ08.table); setAct(r,'post',GM.G.day+14); return true; }},
    /* ---------- 第二批（AA_404）---------- */
    SQ10:{shop:'滇香小館',title:'滇香小館：華新街的乳扇',avail:G=>ti(G)>=3,   /* 大二下起 */
      accept:async(GM,r)=>{ const G=GM.G; await say(GM,null,L.SQ10.noteN); await say(GM,'老闆娘',L.SQ10.note); setAct(r,'go',termEnd(G)); S.plan10(G,r); },   /* 期限：這學期內；週六 14:00 去（沒去＝下一個週六，到期限為止）*/
      visit:async(GM,r)=>{ if(r.step!=='give') return false; await say(GM,null,L.SQ10.handN); await say(GM,'老闆娘',L.SQ10.hand); S.finish(GM,'SQ10',r); return true; },   /* 從華新街回來以後下一次來：交乳扇和紙條，這時才算做完（AA_408 6）*/
      trace:async(GM,r)=>{ const G=GM.G; if(r.state!=='done'||G.day<=r.doneDay) return false; if(!r.t1){ r.t1=G.day; await say(GM,null,L.SQ10.menu); return true; }
        if(!r.t2&&G.day>r.t1){ r.t2=G.day; await say(GM,'老闆娘',L.SQ10.greet); return true; } return false; }},   /* 菜單多一行；之後老闆娘多一句（一次）。過期＝沒有「炸乳扇（限量）」 */
    SQ11:{shop:'巷口家常菜',title:'巷口家常菜：對發票',avail:G=>{ const q=dateOf(G.day); return ti(G)>=2&&q.m%2===1&&q.d>=25; },   /* 大二上起、單數月 25 日以後（開獎）*/
      accept:async(GM,r)=>{ setAct(r,'check',termEnd(GM.G)); },
      visit:async(GM,r,o)=>{ const G=GM.G; if(r.step!=='check'||G.day<=r.day) return false; if(GM.advance) GM.advance(0.5);   /* 下次來：在店裡對完一盒（30 分）*/
        await say(GM,null,L.SQ11.winN); await say(GM,'老闆娘',L.SQ11.win); r.cat=S.fedCat(G);
        if(r.cat) await sayAll(GM,'老闆娘',L.SQ11.cat); else { await say(GM,'老闆娘',L.SQ11.noCat); refund(GM,o); r.free=o&&o.price||0; }   /* 有餵過公園的貓／沒有（排骨我請＝這一餐退錢）*/
        S.finish(GM,'SQ11',r); return true; },
      trace:async(GM,r)=>{ const G=GM.G; if(r.state!=='done'||G.day<=r.doneDay) return false; if(!r.t1){ r.t1=G.day; await say(GM,null,L.SQ11.box); if(r.cat) await say(GM,null,L.SQ11.boxCat); return true; }
        if(r.cat&&!r.t2&&G.day>r.t1&&typeof PARK!=='undefined'&&PARK.adoptNotice&&PARK.adoptNotice(G)){ r.t2=G.day; await say(GM,null,L.SQ11.adopt); return true; } return false; }},   /* 2028-12-17 貓被領養以後：那行小字換掉 */
    SQ12:{shop:'Pasta 118',title:'Pasta 118：週一公休的那一晚',avail:G=>inTerm(G,'Y3S1'),   /* 大三上 */
      accept:async(GM,r)=>{ const G=GM.G, C=PASTA_PARTNERS().filter(id=>S.dating(G,id)&&pres(G,id));
        if(C.length){ const k=await GM.choose([{t:S.UI.alone}].concat(C.map(id=>({t:S.UI.invite(nm(id))})))); r.partner=k>0?C[k-1]:null; }   /* 交往中可以約對方一起來（AA_311 H9：兩個人坐窗邊）；可選＝AA_408 6 有接話的五人（芷若大三上在英國、沛珊在台南）*/
        const d=nextWd(G,1); setAct(r,'go',d); r.outDay=d; if(d!=null&&typeof OUT!=='undefined') OUT.plan(G,{id:'sq12_pasta_'+d,ev:'ev_sq12_pasta',day:d,h:19,late:0.5,place:'118 巷・Pasta 118',title:'Pasta 118：週一公休的那一晚',travel:'走路 約 5 分鐘',travelH:1/12}); },
      trace:async(GM,r)=>{ if(r.state!=='done'||r.t1||GM.G.day<=r.doneDay) return false; r.t1=GM.G.day; await say(GM,null,L.SQ12.wall); return true; }},   /* 吧檯後面的照片（一次）；下學期起的招呼：S.greet／S.greetMore */
    SQ13:{shop:'韓食小廚',title:'韓食小廚：第三罐泡菜',avail:G=>ti(G)>=2,   /* 大二上起 */
      accept:async(GM,r)=>{ setAct(r,'taste',termEnd(GM.G)); r.tastes=[]; await S.taste13(GM,r); },   /* 第一次：開口那天就端出來（「你幫我吃吃看」）；之後兩次，各一天 */
      visit:async(GM,r)=>{ const G=GM.G; if(r.step==='taste'){ if(r.lastTaste===G.day) return false; await S.taste13(GM,r); return true; }
        if(r.step==='wait'&&G.day>=r.wait){ await sayAll(GM,null,L.SQ13.back); S.finish(GM,'SQ13',r); return true; } return false; },   /* 三個月後老闆娘回來了 */
      trace:async(GM,r)=>{ const G=GM.G, base=r.state==='done'?r.doneDay:(r.state==='lapsed'&&r.told?r.told:null); if(base==null||G.day<=base) return false;
        if(!r.t1){ r.t1=G.day; await say(GM,null,L.SQ13.jar); return true; } if(r.state==='done'&&!r.t2&&G.day>r.t1){ r.t2=G.day; await say(GM,'老闆',L.SQ13.greet); return true; } return false; }},   /* 過期：「她的」玻璃罐照樣有（AA_408 1）*/
    SQ14:{shop:'溫州街・一盞',title:'一盞茶屋：回診',avail:G=>{ const m=month(G); return inTerm(G,'Y3S2')&&m>=3&&m<=5&&typeof PARK!=='undefined'&&!!PARK.catName(G)&&!(PARK.catGone&&PARK.catGone(G)); },   /* 大三下 3～5 月；玩家認得那隻貓（取過名字）*/
      accept:async(GM,r)=>{ setAct(r,'cage',GM.G.day+14); },   /* 開口那天起兩週內 */
      trace:async(GM,r)=>{ const G=GM.G; if(r.state!=='done'||G.day<=r.doneDay) return false; if(!r.t1){ r.t1=G.day; await say(GM,null,L.SQ14.photo); return true; }
        if(!r.t2&&G.day>r.t1&&!(typeof PARK!=='undefined'&&PARK.catGone&&PARK.catGone(G))){ r.t2=G.day; await say(GM,'蘇姨',L.SQ14.greet); return true; } return false; }},
    SQ15:{shop:'舊路書房',title:'舊路書房：一箱法律系的舊書',avail:G=>{ const a=DK('2026-10-05'), b=DK('2026-11-27'); return a!=null&&b!=null&&G.day>=a&&G.day<=b&&metSis(G); },   /* 大二上 10/5～11/27；認識學姊 */
      accept:async(GM,r)=>{ setAct(r,'sort',GM.G.day+7); },   /* 一週內去整理 */
      visit:async(GM,r)=>{ const G=GM.G; if(r.step==='sort'&&G.day>r.day) return S.sort15(GM,r);
        if(r.step==='buy'&&G.day>=r.wait){ if((G.money|0)<80) return false; if(GM.money) GM.money(-80,'書'); await say(GM,'書店老闆',L.SQ15.buy); r.owned=G.day; S.finish(GM,'SQ15',r); return true; } return false; },   /* 問過她以後：下一次去把書買下來（八十）*/
      onTold:G=>{ G.flags.SQ15_BOOK='recycled'; }},   /* 過期＝同「這幾本修法了，不能賣」那一支 */
    /* ---------- 第三批（AA_405）---------- */
    SQ16:{shop:'輪轉單車',title:'輪轉單車：兩年沒人來牽的車',avail:G=>ti(G)>=2,   /* 大二起 */
      accept:async(GM,r)=>{ await say(GM,null,L.SQ16.look); setAct(r,'ask',GM.G.day+14); },   /* 「看」車架；兩週內去問登山社（AA_405 第 3 節第 6 點）*/
      visit:async(GM,r)=>{ if(r.step!=='back') return false; await say(GM,'車行老闆',L.SQ16.back); S.finish(GM,'SQ16',r); return true; },   /* 問到了，回車行 */
      trace:async(GM,r)=>{ const G=GM.G; if(r.state!=='done'||G.day<=r.doneDay) return false; if(!r.t1){ r.t1=G.day; r.lentTerm=S.termKey(G); await say(GM,null,L.SQ16.note); return true; }   /* 下一次來：車頭的紙條 */
        const p=S.termPos(G), T=T_(G); if(!p.id||p.brk||!T||T.week<1||r.lentTerm===p.id) return false; const n=(r.lent|0); if(n>=L.SQ16.names.length) return false;   /* 每學期開學第一週以後第一次來（名字用完就不再換）*/
        r.lent=n+1; r.lentTerm=p.id; await say(GM,null,L.SQ16.rename.replace('{名字}',L.SQ16.names[n])); await say(GM,'車行老闆',L.SQ16.lent.replace('{N}','一二三四五六七八九十'[n]||String(n+1))); return true; }},
    SQ17:{shop:'一一八茶飲',title:'一一八茶飲：英文面試',avail:G=>{ const m=month(G); return inTerm(G,'Y2S2')&&(m===3||m===4); },   /* 大二下 2027-03～04 */
      accept:async(GM,r)=>{ setAct(r,'ask',monthEnd(GM.G.day)); r.asked=[]; await S.ask17(GM,r); },   /* 期限：那個月；第一題：開口那天（一邊做飲料一邊答）*/
      visit:async(GM,r)=>{ const G=GM.G; if(r.step==='ask'){ if(r.lastAsk===G.day) return false; await S.ask17(GM,r); return true; }
        if(r.step==='result'&&!r.phone&&G.day>=r.wait){ await say(GM,'店員',L.SQ17.result); S.finish(GM,'SQ17',r); return true; } return false; },   /* 四月底以後下一次點飲料：當面說（選「加油。」、沒有給她電話的那一版；給了電話＝S.phone 的私訊）*/
      trace:async(GM,r)=>{ const G=GM.G, d=DK('2028-03-01'); if(r.state!=='done'||r.t1||d==null||G.day<d) return false; r.t1=G.day; await say(GM,null,L.SQ17.trace); return true; }},   /* 大三下（2028-03 起）一次 */
    SQ18:{shop:'清葉茶行',title:'清葉茶行：二十杯的訂單',avail:G=>ti(G)>=3,   /* 大二下起（沒有 SQ08 的玩家照樣有）*/
      accept:async(GM,r)=>{ const G=GM.G, d=nextWd(G,0); setAct(r,'go',d); r.outDay=d; if(d!=null&&typeof OUT!=='undefined') OUT.plan(G,{id:'sq18_park_'+d,ev:'ev_sq18_park',day:d,h:8.5,late:0.5,place:'溫州街・小公園',title:'週日早上：二十杯飲料送到小公園',travel:'走路 約 10 分鐘',travelH:1/6}); }},   /* 期限：那個週日 */
    SQ19:{shop:'巷子裡定食',title:'巷子裡定食：忘在桌上的筆記本',avail:G=>ti(G)>=2&&met(XC),   /* 大二上起；認識芯慈 */
      accept:async(GM,r)=>{ await say(GM,null,L.SQ19.look); await sayAll(GM,null,L.SQ19.last); setAct(r,'ret',GM.G.day+7); },   /* 「看」筆記本（封面、最後一頁）；一週內還她（找她說話：S.XC_EV）*/
      trace:async(GM,r)=>{ const G=GM.G; if(r.state!=='done'||G.day<=r.doneDay) return false; if(!r.t1){ r.t1=G.day; await say(GM,null,L.SQ19.basket); return true; }
        if(!r.t2&&G.day>r.t1){ r.t2=G.day; await say(GM,'定食店長',L.SQ19.greet); return true; } return false; }},
    SQ20:{shop:'溫州街・半熟',title:'半熟早午餐：計時',avail:G=>ti(G)>=4,   /* 大三上起 */
      accept:async(GM,r)=>{ const G=GM.G; if(met(BH)&&stageAt(BH,'FAMILIAR')){ const k=await GM.choose([{t:S.UI.self20},{t:q2(L.SQ20.bohanOpt)}]); r.bohan=k===1; }   /* 認識柏翰、熟悉以上 */
        setAct(r,'s1',G.day+30); S.plan20(G,r); },   /* 期限：一個月；兩個週六的早上 08:00～09:30 */
      visit:async(GM,r)=>{ if(r.step!=='wait'||GM.G.day<r.wait) return false; await say(GM,null,L.SQ20.pass); S.finish(GM,'SQ20',r); return true; },   /* 一個月以後 */
      trace:async(GM,r)=>{ const G=GM.G, base=r.state==='done'?r.doneDay:(r.state==='lapsed'&&r.told?r.told:null); if(base==null||G.day<=base) return false;
        if(!r.t1){ r.t1=G.day; await say(GM,null,L.SQ20.certs); return true; } if(r.state==='done'&&!r.t2&&G.day>r.t1){ r.t2=G.day; await say(GM,'小米姐',L.SQ20.greet); return true; } return false; }}   /* 過期：兩張證書照樣有（AA_408 1）*/
  };
  S.Q=Q;
  const PASTA_PARTNERS=()=>Object.keys(L.SQ12.pair);   /* SQ12 一起去的交往對象：以安、語彤、子晴、學姊、可昕（AA_408 6）*/
  const HINT={SQ01:{wait:'下次去林家乾麵'},SQ02:{fafu:r=>'帶去法服問（'+(r.fafuDay!=null?md(r.fafuDay)+' 週六上午，':'')+'法律系館B）',wait:'下次去巷口茶飲'},SQ03:{board:'在夏日冰菓室的窗口「看價目板」'},
    SQ04:{ask:'下次去慢讀咖啡（118 巷）',again:r=>md(r.again)+' 以後再去慢讀咖啡（118 巷）',police:'送筆電去派出所',wait:'下次去慢讀咖啡（118 巷）'},SQ05:{closed:r=>'六張犁麵舖公休到 '+md(r.closeTo)+'；之後再去'},
    SQ06:{lesson:'等家教第一次上課',twist:'下次去好家自助餐（118 巷）',club:r=>'帶孫子去吉他社社課（'+md(r.by)+'）'},SQ07:{sis:'找學姊看讀書計畫（兩點半 Café）',wait:'下次去蛋包飯研究所（118 巷）',last:'下次去蛋包飯研究所（118 巷）'},
    SQ08:{board:'去溫州街的公園看公布欄',ask:r=>'問象棋阿伯（早上）'+(r.abo?'✓':'')+'、一盞茶屋的蘇姨（下午）'+(r.su?'✓':''),back:'回公館的便利商店說',post:'把餵貓表貼到公園的公布欄'},
    SQ10:{go:r=>'週末去中和的華新街'+(r.outDay!=null?'（'+md(r.outDay)+' 週六 14:00，捷運南勢角站）':''),give:'下次去滇香小館（118 巷），把乳扇和紙條交給老闆娘'},SQ11:{check:'下次去巷口家常菜（118 巷）幫老闆娘對發票'},
    SQ12:{go:r=>(r.outDay!=null?md(r.outDay)+'（一）':'下禮拜一')+' 19:00 去 Pasta 118（118 巷）當客人'},
    SQ13:{taste:r=>'再去韓食小廚（118 巷）吃吃看泡菜（'+((r.tastes||[]).length)+'／3）',wait:'等老闆娘回來'},
    SQ14:{cage:'去溫州街的公園，把貓放進外出籠',vet:'帶牠去羅斯福路上的動物醫院'},
    SQ16:{ask:'週四 19:30～21:00 去普通教學館 201 門口「問登山社的人」（第 5～15 週）',back:'回公館的輪轉單車跟老闆說'},
    SQ15:{sort:'去舊路書房（公館）後面整理那一箱書',sis:'找學姊說那本民法總則',buy:'去舊路書房把那本民法總則買下來（80 元）'},
    SQ17:{ask:r=>'再去一一八茶飲（118 巷）問她一題（'+((r.asked||[]).length)+'／3）',result:r=>r.phone?'等她傳訊息（四月底）':'四月底以後再去一一八茶飲（118 巷）'},
    SQ18:{go:r=>(r.outDay!=null?md(r.outDay)+'（日）':'週日')+' 08:30 把飲料送到溫州街的小公園'},SQ19:{ret:'把筆記本還給芯慈（在學校，或週二、四中午的巷口家常菜）'},
    SQ20:{s1:r=>(r.outDay!=null?md(r.outDay)+'（六）':'週六')+' 08:00 去半熟早午餐幫小蕙計時（第 1 次）',s2:r=>(r.outDay!=null?md(r.outDay)+'（六）':'週六')+' 08:00 去半熟早午餐幫小蕙計時（第 2 次）',wait:'等小蕙的證照考試'}};
  S.hint=(id,r)=>{ const h=HINT[id]&&HINT[id][r.step]; return typeof h==='function'?h(r):(h||''); };

  /* ---------- 系統 ---------- */
  S.canOffer=function(G,id){ const q=Q[id], r=S.get(G,id); if(!law(G)||!q||G.day>lastDay()) return false;
    if(r&&r.state!=='declined') return false; if(r&&r.term===S.termKey(G)) return false;   /* 做完、過期＝結束；「……加油。」＝這學期不再出 */
    const open=S.openIds(G); if(open.length>=S.MAX||open.some(x=>Q[x].shop===q.shop)) return false;
    return S.known(G,q.shop)&&!!q.avail(G); };
  S.offer=async function(GM,id){ const G=GM.G, q=Q[id], R=S.rec(G), st=STAFF[q.shop];
    const O=L[id].open; for(const x of O){ if(Array.isArray(x)) await say(GM,x[0],x[1]); else await say(GM,st,x); }
    const k=await GM.choose([{t:q2(S.YES)},{t:q2(S.NO)}]); if(k!==0){ R[id]={state:'declined',term:S.termKey(G),day:G.day}; return 'no'; }
    const r=R[id]={state:'open',step:'start',day:G.day,term:S.termKey(G)}; if(GM.toast) GM.toast('📝 順手的事：'+q.title,2600);
    await q.accept(GM,r); return 'yes'; };
  /* 做完：痕跡的起點、相簿、旁邊的女主角 */
  S.finish=function(GM,id,r,o){ const G=GM.G; r.state='done'; r.step='done'; r.doneDay=G.day; r.doneTerm=S.termKey(G); r.by=null;
    if(typeof STORY!=='undefined'&&STORY.albumMemory) STORY.albumMemory(G,'side_'+id,Q[id].title,'');
    if(!(o&&(o.helped||o.away))&&!r.helped) S.nearby(GM,r); if(GM.toast) GM.toast('📝 順手的事：'+Q[id].title+'（做完了）',2600); return true; };   /* away：在別的地方（2D 出遊）做完的，3D 這一區的人不算在旁邊 */
  S.nearby=function(GM,r){ const C=HEROINES.filter(id=>met(id)&&here(GM,id)); if(!C.length) return null; const st=id=>typeof SOCIAL!=='undefined'&&SOCIAL.STAGES?SOCIAL.STAGES.indexOf(SOCIAL.stage(id)):0;
    C.sort((a,b)=>st(b)-st(a)); fam(C[0],1); if(r) r.with=C[0]; return C[0]; };
  /* 點完餐（各店的點餐流程最後叫）：這間店的進度 → 做完的痕跡 → 偶爾一則新的；一次只演一件 */
  S.atShop=async function(GM,key,o){ const G=GM&&GM.G; if(!law(G)) return false; o=o||{}; S.lapse(G);
    if(key==='公館的便利商店'&&o.item==='小罐貓罐頭'){ G.daily=G.daily||{}; G.daily.catCansN=(G.daily.catCansN|0)+1; }   /* 買過幾罐（SQ08「第三次買貓罐頭以後」；舊存檔從 0 算）*/
    for(const id in Q){ const q=Q[id], r=S.get(G,id); if(q.shop!==key||!r) continue; if(r.state==='open'&&q.visit&&await q.visit(GM,r,o)) return true; }
    for(const id in Q){ const q=Q[id], r=S.get(G,id); if(q.shop!==key||!r) continue;
      if(r.state==='lapsed'&&!r.told&&L[id].lapse){ r.told=G.day; await say(GM,STAFF[q.shop],L[id].lapse); if(q.onTold) q.onTold(G,r); return true; }   /* 過期以後下一次來：店員交代後來怎樣（AA_408 第 1 節；一次、不扣分）*/
      if(q.trace&&await q.trace(GM,r,o)) return true; }
    if(G.flags.SIDEQ_DAY===G.day) return false;
    for(const id in Q){ if(Q[id].shop!==key||!S.canOffer(G,id)) continue; if(S.roll()>=S.ROLL) return false; G.flags.SIDEQ_DAY=G.day; return !!(await S.offer(GM,id)); }
    return false; };
  /* 期限：要玩家去做的那一步過了期限＝lapsed（不扣數值）；SQ07 找學姊那一步改成照「自己看」往下 */
  S.lapse=function(G){ if(!G||!G.side) return 0; let n=0; for(const id of S.openIds(G)){ const r=S.get(G,id); if(r.by==null||G.day<=r.by) continue; if(Q[id].onBy&&Q[id].onBy(G,r)) continue; r.state='lapsed'; r.lapseDay=G.day; n++; } return n; };

  /* ---------- SQ16 輪轉單車（AA_405；第 3 節 f923751c）：公館「找車行老闆」（zones3d.js shop:'bike'，story3d.js 叫 S.bikeShop）----------
     一天算一次（G.flags.BIKE_SHOP={n,day,g}）；第 5 次起＝認得你（S.known）。進度、痕跡、偶爾開口照 S.atShop；什麼都沒有＝平常的招呼兩句輪流。*/
  S.bikeN=G=>{ const B=G&&G.flags&&G.flags.BIKE_SHOP; return B?(B.n|0):0; };
  S.bikeShop=async function(GM){ const G=GM.G, F=G.flags||(G.flags={}), B=F.BIKE_SHOP||(F.BIKE_SHOP={n:0,day:null,g:0}); if(B.day!==G.day){ B.day=G.day; B.n=(B.n|0)+1; }
    GM.sceneBegin(); try{ if(await S.atShop(GM,'輪轉單車',{})) return true; const L2=L.SQ16.greet; await say(GM,'車行老闆',L2[(B.g|0)%L2.length]); B.g=(B.g|0)+1; return true; } finally { GM.sceneEnd(); } };
  /* 普通 201 門口「問登山社的人」：SQ16 進行中、大二起每學期第 5～15 週週四 19:30～21:00（AA_405 第 3 節第 3 點：沒入社也能問；不是社團活動、不佔時段）。
     門口原本的「看看教室」（teach3d.js）在這段時間換成這個字；按下去 STORY.interact（下面包一層）*/
  S.hikeAskDue=function(G){ if(!law(G)||G.zone!=='putong') return false; const r=S.get(G,'SQ16'); if(!r||r.state!=='open'||r.step!=='ask'||(r.by!=null&&G.day>r.by)) return false;
    const T=T_(G); if(!T||T.week<5||T.week>15||dateOf(G.day).wd!==4) return false; const h=hr(G); return h>=19.5&&h<21; };
  S.HIKE_LABEL='問登山社的人';
  S.hikeAsk=async function(GM){ const G=GM.G, r=S.get(G,'SQ16'); if(!S.hikeAskDue(G)) return false; GM.sceneBegin();
    try{ const k=await GM.choose([{t:q2(L.SQ16.ask)},{t:'（先不要）'}]); if(k!==0) return true; await sayAll(GM,'登山社的學姊',L.SQ16.club); await sayAll(GM,null,L.SQ16.msg); setWait(r,'back',G.day); } finally { GM.sceneEnd(); }
    return true; };
  S.populate=function(zoneId,GM){ if(zoneId!=='putong'||!GM||!GM.E) return; for(const it of GM.E.interactables){ if(it.room!=='201'||it._sq16) continue; const lab=it.label; it._sq16=true;
    Object.defineProperty(it,'label',{configurable:true,get(){ return S.hikeAskDue(GM.G)?S.HIKE_LABEL:lab; },set(v){ /* 不改 */ }}); } };
  if(typeof STORY!=='undefined'){
    if(STORY.populate&&!STORY._sq16Populate){ const p0=STORY.populate; STORY.populate=function(zoneId,GM){ const r=p0.apply(this,arguments); try{ S.populate(zoneId,GM); }catch(e){ console.warn('SIDEQ.populate',e); } return r; }; STORY._sq16Populate=true; }
    if(STORY.interact&&!STORY._sq16Interact){ const o0=STORY.interact; STORY.interact=async function(it,GM){ if(it&&it.room==='201'&&GM&&GM.G&&S.hikeAskDue(GM.G)) return S.hikeAsk(GM); return o0.apply(this,arguments); }; STORY._sq16Interact=true; } }

  /* ---------- 手機「今天」：順手的事 ---------- */
  const esc=s=>String(s).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[ch]);
  S.limitText=(G,r)=>{ if(r.by==null) return ''; const d=r.by-G.day; return (d<=0?'今天以內':(d<=7?'這個禮拜內':(d<=14?'兩個禮拜內':'這個月內')))+'（到 '+md(r.by)+'）'; };
  S.todayHTML=function(G){ if(!G||!G.side) return ''; S.lapse(G); const ids=S.openIds(G); if(!ids.length) return '';
    return '<div class="item"><b>順手的事</b><span class="muted">（最多兩件，不做也沒關係）</span>'+ids.map(id=>{ const r=S.get(G,id), lt=S.limitText(G,r);
      return '<div style="margin-top:4px">☐ '+esc(Q[id].title)+'<div class="muted">'+esc(S.hint(id,r))+(lt?'・'+esc(lt):'')+'</div></div>'; }).join('')+'</div>'; };

  /* ---------- SQ01：林家的招呼、菜單牆 ---------- */
  /* wzshops3d.js order364：做完以後，下一次熟客的招呼換成這句（一次）*/
  S.greet=function(G,key){ if(key==='Pasta 118') return S.pastaPair(G)?L.SQ12.greet:null; if(key!=='林家乾麵') return null; const r=S.get(G,'SQ01'); if(!r||r.state!=='done'||r.greeted||G.day<=r.doneDay) return null; if(typeof EAT!=='undefined'&&EAT.count&&EAT.count(G,key)<4) return null; r.greeted=G.day; return L.SQ01.greet; };
  /* SQ12（lane118.js 一個人點餐的招呼）：做完或過期以後，下學期起老闆的招呼換「一位嗎？吧檯老位子。」，她補一句「窗邊也有位子喔。」（每次；過期的照樣在店裡出餐，AA_408 1）*/
  S.pastaPair=G=>{ const r=G&&S.get(G,'SQ12'); return !!r&&(r.state==='done'||r.state==='lapsed')&&ti(G)>TERMS.indexOf(String(r.term||'Y3S1').replace(/^B/,'')); };
  S.greetMore=(G,key)=>key==='Pasta 118'&&S.pastaPair(G)?[[S.UI.gf,L.SQ12.her]]:null;
  S.wallExtra=(G,key)=>{ if(key!=='林家乾麵') return null; const r=S.get(G,'SQ01'); return r&&(r.state==='done'||r.state==='lapsed'&&r.told)?L.SQ01.wall:null; };   /* 過期（老闆自己回了）：菜單牆那一行照樣有（AA_408 1）*/

  /* ---------- SQ02：法服（單週六上午的初談；2D 出遊）---------- */
  S.planFafu=function(G,r){ const s=typeof STORY!=='undefined'&&STORY.fafuSat?STORY.fafuSat(G.day):null; if(!s||typeof OUT==='undefined'){ setAct(r,'fafu',G.day+14); return false; }
    r.fafuDay=s.day; setAct(r,'fafu',s.day); return OUT.plan(G,{id:'sq02_fafu_'+r.day,ev:'ev_sq02_fafu',day:s.day,h:9.5,late:2,place:'法律系館B',title:'法服初談：巷口茶飲的店員',travel:'走路 約 10 分鐘',travelH:1/6}); };
  S.FAFU_EV={ id:'ev_sq02_fafu', title:'法服初談', participants:[], location:'any', trigger:'outing', background:'dark', hours:0.75,
    dialogue:[{scene:'法律系館B・研討室',bg:'wancai_seminar'},{speaker:'值班的學長',text:L.SQ02.fafu}],   /* LEGAL_REVIEW_REQUIRED */
    after:(G)=>{ const r=S.get(G,'SQ02'); if(r&&r.state==='open'&&r.step==='fafu') setWait(r,'wait',G.day+1); },
    outingMissed:(G)=>{ const r=S.get(G,'SQ02'); if(r&&r.state==='open'&&r.step==='fafu'){ r.state='lapsed'; r.lapseDay=G.day; } } };

  /* ---------- SQ03：冰菓室窗口「看價目板」（wzshops3d.js windowItems／interact）---------- */
  S.boardOpen=G=>{ const r=G&&S.get(G,'SQ03'); return !!r&&r.state==='open'&&r.step==='board'; };
  S.iceBoard=async function(GM){ const G=GM.G, r=S.get(G,'SQ03'); if(!S.boardOpen(G)) return false; S.lapse(G); if(r.state!=='open') return false;
    const an=G.zone==='wenzhou'&&met(AN)&&here(GM,AN);   /* 當下在溫州街、認識的女主角：以安（她的字最工整）；不在就自己寫 */
    const k=an?await GM.choose([{t:'自己寫'},{t:'讓以安寫'}]):0; r.writer=k===1?AN:'me'; if(GM.advance) GM.advance(1/3);
    await say(GM,null,L.SQ03.midN); await say(GM,'老闆娘',L.SQ03.mid); await say(GM,null,L.SQ03.end);
    if(r.writer===AN){ fam(AN,2); r.helped=true; } S.finish(GM,'SQ03',r); return true; };

  /* ---------- SQ04：派出所（2D）---------- */
  S.ask04=async function(GM,r){ const G=GM.G, k=await GM.choose(L.SQ04.ask.map(t=>({t:q2(t)}))); r.ask=k; await say(GM,'店長',L.SQ04.askReply[k]);
    if(k!==0){ r.again=G.day+7; setAct(r,'again',G.day+21); return false; }   /* 再等一個禮拜（AA_408 2）*/
    return S.police04(GM,r); };
  S.police04=function(GM,r){ const G=GM.G; setAct(r,'police',G.day+1); if(typeof OUT!=='undefined') OUT.plan(G,{id:'sq04_police',ev:'ev_sq04_police',day:G.day,h:+G.hour+0.25,late:1,place:'派出所',title:'送筆電去派出所',travel:'走路 約 10 分鐘',travelH:1/6}); return true; };
  S.POLICE_EV={ id:'ev_sq04_police', title:'派出所', participants:[], location:'any', trigger:'outing', background:'dark', hours:0.5,
    dialogue:[{scene:'派出所'},{speaker:null,text:L.SQ04.police}],   /* 派出所只用 2D 背景＋旁白（還沒有圖＝深色底）；LEGAL_REVIEW_REQUIRED */
    after:(G)=>{ const r=S.get(G,'SQ04'); if(r&&r.state==='open'&&r.step==='police') setWait(r,'wait',G.day+14); },
    outingMissed:(G)=>{ const r=S.get(G,'SQ04'); if(r&&r.state==='open'&&r.step==='police'){ r.state='lapsed'; r.lapseDay=G.day; } } };

  /* ---------- SQ05：公休（lane118.js 的 isOpen、order 照這裡）---------- */
  S.closedNote=function(G,shopId){ if(shopId!=='noodle2'||!G) return null; const r=S.get(G,'SQ05'); if(!r||r.closeFrom==null||(r.state!=='open'&&r.state!=='done')) return null; return G.day>=r.closeFrom&&G.day<=r.closeTo?q2(r.note):null; };

  /* ---------- SQ06：吉他社社課（下一次社課，ACTIVITIES club_guitar）---------- */
  S.clubNext=function(G){ if(typeof ACTIVITIES==='undefined'||!ACTIVITIES.list||!ACTIVITIES.on) return null; const a=ACTIVITIES.list.find(x=>x.id==='club_guitar'); if(!a) return null;
    for(let d=G.day+1;d<=G.day+21;d++) if(ACTIVITIES.on(a,d)) return {day:d,t0:a.t0,room:a.roomName||'法律系館B'}; return null; };
  S.CLUB_EV={ id:'ev_sq06_club', title:'吉他社社課', participants:[ZQ], location:'any', trigger:'outing', background:'dark', hours:1,
    dialogue:[{scene:'法律系館B 多功能教室'},{speaker:ZQ,text:L.SQ06.zq},{consequences:{rel:{[ZQ]:{fam:2}}}}],
    after:(G,GM)=>{ const r=S.get(G,'SQ06'); if(r&&r.state==='open'&&r.step==='club'){ r.helped=true; S.finish(GM||{G},'SQ06',r); } },
    outingMissed:(G)=>{ const r=S.get(G,'SQ06'); if(r&&r.state==='open'&&r.step==='club'){ r.state='lapsed'; r.lapseDay=G.day; } } };

  /* ---------- SQ07：學姊在 Café 看讀書計畫（S.tick）---------- */
  S.SIS_EV={ id:'ev_sq07_sis', title:'讀書計畫', participants:[SIS], location:'cafe', trigger:'manual', background:'blur',
    dialogue:[{speaker:null,text:L.SQ07.sisN},{speaker:SIS,text:L.SQ07.sis},{consequences:{rel:{[SIS]:{fam:2}}}}],
    after:(G)=>{ const r=S.get(G,'SQ07'); if(r&&r.state==='open'&&r.step==='sis'){ r.helped=true; setWait(r,'wait',G.day+21); } } };
  S.sisDue=(GM)=>{ const G=GM&&GM.G, r=G&&S.get(G,'SQ07'); return !!r&&r.state==='open'&&r.step==='sis'&&G.zone==='cafe'&&here(GM,SIS)&&!(GM.E&&GM.E.player&&GM.E.player.busy); };

  /* ---------- SQ08：公園的公布欄、象棋阿伯、蘇姨（wzpark3d.js、wzshops3d.js 叫）---------- */
  /* 看完公布欄：board＝沒有餵貓的說明；post＝把表貼上去（貼的那一句稿裡沒有）*/
  S.onNotice=async function(GM){ const G=GM.G, r=S.get(G,'SQ08'); if(!r||r.state!=='open') return false; S.lapse(G); if(r.state!=='open') return false;
    if(r.step==='board'){ await say(GM,null,L.SQ08.none); setAct(r,'ask',G.day+14); return true; }
    if(r.step==='post'){ await say(GM,null,L.SQ08.post); r.posted=G.day; S.finish(GM,'SQ08',r); return true; } return false; };
  /* 象棋阿伯（早上 08:00～11:00，下象棋）、一盞茶屋的蘇姨（下午 12:00～18:00）各說一次：那一句稿裡沒有，先用手機的提示 */
  S.ask8=async function(GM,k){ const G=GM.G, r=S.get(G,'SQ08'); if(!r||r.state!=='open'||r.step!=='ask'||r[k]) return false; const h=hr(G);
    if(k==='abo'&&(h<8||h>=11)) return false; if(k==='su'&&(h<12||h>=18)) return false; r[k]=G.day; await say(GM,k==='abo'?'阿伯':'蘇姨',L.SQ08.ask[k]);
    if(GM.toast) GM.toast('📝 順手的事：'+(k==='abo'?'問過象棋阿伯':'問過蘇姨'),2400);
    if(r.abo&&r.su){ await say(GM,null,L.SQ08.all); setAct(r,'back',G.day+14); } return true; };
  /* 公布欄上的餵貓表（PARK.notices）：貼上去以後一直在；第二天起多里長那一行；寒流那一週「沒吃」；12/17 起換成領養告示（PARK）*/
  S.parkNotices=function(G){ const r=G&&S.get(G,'SQ08'); if(!r) return []; if(r.state==='lapsed'&&r.told&&r.posted==null) r.posted=r.told;   /* 過期（店員自己貼了）：餵貓表照樣在（AA_408 1）*/ if((r.state!=='done'&&r.state!=='lapsed')||r.posted==null) return []; if(typeof PARK!=='undefined'&&PARK.adoptNotice&&PARK.adoptNotice(G)) return [];
    const nmC=typeof PARK!=='undefined'&&PARK.catName?PARK.catName(G):null, L8=L.SQ08, lines=[L8.sheet]; if(G.day>=r.posted+1) lines.push(L8.chief); if(typeof PARK!=='undefined'&&PARK.coldWeek&&PARK.coldWeek(G)) lines.push(L8.cold);
    return [['餵貓表'+(nmC?'（'+nmC+'）':''),lines]]; };

  /* ---------- 第 3 節：公園的貓 ---------- */
  const CAT_D=()=>({night:DK('2028-12-14'),vet:DK('2028-12-15')});
  S.CAT_EV={ id:'ev_sq_cat_night', title:'寒流', participants:[ZQ], location:'wenzhou', trigger:'manual', once:true, background:'blur', spawn:{npc:ZQ,dist:2.2,pose:'idle'}, despawn:20,
    dialogue:[ {speaker:null,text:'（鞦韆旁邊，子晴蹲在石桌前面，手機的手電筒照著桌子底下。）'},
      {speaker:ZQ,text:'牠三天沒吃了。我每天都有看那張表。'},{speaker:ZQ,text:'……我家有電暖器。'},
      {choice:[{text:'「妳要帶牠回去？」',goto:'a'},{text:'「我幫妳抱。」',goto:'b'}]},
      {label:'a'},{speaker:ZQ,text:'先帶去看醫生。……之後再說。'},{goto:'c'},
      {label:'b'},{speaker:null,text:'（牠很輕。比你記得的輕很多。）'},
      {label:'c'},{speaker:null,text:'（她把外套脫下來，把牠包起來。牠沒有掙扎。）'},
      {unless:{flags:['ZQ_CAT_SAID']},speaker:ZQ,text:'我做的那隻貓，是照牠畫的。你知道嗎。'},
      {if:{flags:['ZQ_CAT_SAID']},speaker:ZQ,text:'我做的那隻貓，你說過是牠。……你是對的。'},   /* AA_400 第 3 節：測試版那天說過「這隻貓是公園那隻？」的（ZQ_CAT_SAID）換這句 */
      {unless:{flags:['ZQ_CAT_SAID']},speaker:null,text:'（她沒有等你回答。）'},
      {if:{flags:['ZQ_CAT_SAID']},speaker:null,text:'（她沒有看你，一直看著外套裡的貓。）'},   /* AA_408 2：她那句不是問句 */
      {set:{ZQ_CAT_NIGHT:true}} ] };
  S.catNightDue=function(GM){ const G=GM&&GM.G, E=GM&&GM.E; if(!law(G)||G.flags.ZQ_CAT_NIGHT) return false; const D=CAT_D(); if(D.night==null||G.day!==D.night) return false; const h=hr(G); if(h<22+10/60||h>=23) return false;
    if(G.zone!=='wenzhou'||!E||!E.player||!E.player.obj||E.player.busy) return false; const p=E.player.obj.position; if(typeof PARK!=='undefined'&&PARK.inPark&&!PARK.inPark(p.x,p.z)) return false;
    return met(ZQ)&&stageAt(ZQ,'FAMILIAR')&&!(typeof STORY!=='undefined'&&STORY.abroad&&STORY.abroad(G)); };
  /* 收養以後每月第一個週六的照片（2029-01～06，照順序各一次）*/
  S.PHOTO_MONTHS=['2029-01','2029-02','2029-03','2029-04','2029-05','2029-06'];
  S.firstSat=function(ym){ const d0=DK(ym+'-01'); if(d0==null) return null; for(let d=d0;d<d0+7;d++) if(dateOf(d).wd%7===6) return d; return null; };
  S.catPhone=function(G){ if(!G||!G.flags||typeof PHONE==='undefined') return; const F=G.flags, D=CAT_D();
    if(F.ZQ_CAT_NIGHT&&D.vet!=null&&G.day<=D.vet&&!sent(G,'sqcat_vet')) PHONE.at(G,D.vet,12,L.CAT.vet.concat(S.sq14Done(G)?L.SQ14.zq:[]).map(t=>dm(ZQ,t)),'sqcat_vet');   /* 演過 SQ14（AA_404）：後面多兩句（晶片、她叫豆花）*/
    const know=met(ZQ)&&(typeof INV==='undefined'||!INV.hasContact||INV.hasContact(G,ZQ));
    if(know) S.PHOTO_MONTHS.forEach((ym,n)=>{ const d=S.firstSat(ym); if(d==null||G.day<d||G.day>d+1||sent(G,'sqcat_ph'+n)) return;
      const M=L.CAT.photos[n].map(t=>dm(ZQ,t)); if(S.dating(G,ZQ)) M[M.length-1].ask={id:'sqcat_visit'+n,until:(d+6)*24+22,opts:[{t:'（去看貓）',post:false,set:{SQ_CAT_VISIT:n+1}}]};
      PHONE.at(G,d,12,M,'sqcat_ph'+n); });
    if(F.SQ_CAT_VISIT){ const n=F.SQ_CAT_VISIT; delete F.SQ_CAT_VISIT; if(typeof OUT!=='undefined') OUT.plan(G,{id:'sq_cat_visit'+n,ev:'ev_sq_cat_visit',day:G.day+1,h:14,late:1,place:'子晴的家',title:'去看貓',travel:'捷運 約 30 分鐘',travelH:0.5}); } };
  S.VISIT_EV={ id:'ev_sq_cat_visit', title:'去看貓', participants:[ZQ], location:'any', trigger:'outing', background:'dark', hours:2,
    dialogue:[{scene:'子晴的家'},{consequences:{rel:{[ZQ]:{fam:1}}}}] };   /* 2D 出遊，每月一次（照片那一則的回覆）；她媽媽在家，不另外寫台詞（AA_397 3-3）*/

  /* ===================== 第二、三批的步驟（AA_404、AA_405）===================== */
  /* 週末的出遊：下一個週六（今天以後、期限以內）；沒去＝再排下一個週六，過了期限＝過期 */
  S.planWeekend=function(G,r,o){ const d=nextWd(G,6); if(d==null||(r.by!=null&&d>r.by)||typeof OUT==='undefined') return false; r.outDay=d; return OUT.plan(G,Object.assign({},o,{id:o.id+'_'+d,day:d})); };
  const lapseNow=(G,r)=>{ r.state='lapsed'; r.lapseDay=G.day; };
  const missedAt=(id,step,replan)=>G=>{ const r=S.get(G,id); if(!r||r.state!=='open'||r.step!==step) return; if(replan&&replan(G,r)) return; lapseNow(G,r); };

  /* SQ10：週六 14:00 中和・華新街（2D；hwaxin_street 還沒有圖＝深色底）；來回 60 元 */
  S.plan10=(G,r)=>S.planWeekend(G,r,{id:'sq10_hwaxin',ev:'ev_sq10_hwaxin',h:14,late:1,place:'中和・華新街',title:'中和・華新街：滇香小館的乳扇',travel:'捷運 約 40 分鐘（南勢角站）',travelH:2/3});
  S.HWAXIN_EV={ id:'ev_sq10_hwaxin', title:'華新街', participants:[], location:'any', trigger:'outing', background:'dark', hours:1.5,
    dialogue:[{scene:'中和・華新街',bg:'hwaxin_street'},{speaker:null,text:L.SQ10.read},{speaker:S.UI.grocer,text:L.SQ10.who},{speaker:null,text:L.SQ10.past},{speaker:null,text:L.SQ10.giveN},{speaker:S.UI.grocer,text:L.SQ10.give},{consequences:{money:-60}}],   /* 來回 60 元 */
    after:(G)=>{ const r=S.get(G,'SQ10'); if(r&&r.state==='open'&&r.step==='go') setWait(r,'give',G.day); },   /* 還沒做完：下一次來滇香把乳扇交給老闆娘（AA_408 6；沒有期限）*/
    outingMissed:missedAt('SQ10','go',(G,r)=>S.plan10(G,r)) };

  /* SQ11：有沒有餵過公園的貓（SQ08 貼了餵貓表，或在公園選過「餵」）；貓被領養以後不算（那一支講的是「公園那隻」）*/
  S.fedCat=function(G){ if(typeof PARK==='undefined') return false; if(PARK.catGone&&PARK.catGone(G)) return false; const r8=S.get(G,'SQ08'); return !!(r8&&r8.state==='done')||(PARK.rec&&PARK.rec(G).feedDay!=null); };

  /* SQ12：下禮拜一 19:00 Pasta 118（2D；店裡還沒有夜晚的 2D 圖＝深色底）；帶她去的熟悉 +1（陪你去的女主角，AA_397 第 1 節） */
  /* 帶交往對象去的（AA_408 6）：女朋友那句換成對兩個人說、交往對象接一句（她的那一句）；一個人去＝原本那句 */
  S.pastaPartner=G=>{ const r=G&&S.get(G,'SQ12'); return r&&r.partner&&L.SQ12.pair[r.partner]?r.partner:null; };
  S.PASTA_EV={ id:'ev_sq12_pasta', title:'週一公休的那一晚', participants:[], location:'any', trigger:'outing', background:'dark', hours:1.5,
    dialogue:[{scene:'118 巷・Pasta 118'},{speaker:null,text:L.SQ12.inN},{unless:{custom:G=>!!S.pastaPartner(G)},speaker:S.UI.gf,text:L.SQ12.in},{if:{custom:G=>!!S.pastaPartner(G)},speaker:S.UI.gf,text:L.SQ12.inPair}]
      .concat(Object.keys(L.SQ12.pair).map(id=>({if:{custom:G=>S.pastaPartner(G)===id},speaker:id,text:L.SQ12.pair[id]})),
        [{speaker:null,text:L.SQ12.knew},{speaker:null,text:L.SQ12.yesN},{speaker:S.UI.gf,text:L.SQ12.photo},{speaker:null,text:L.SQ12.free}]),
    after:(G,GM)=>{ const r=S.get(G,'SQ12'); if(!r||r.state!=='open'||r.step!=='go') return; if(r.partner){ fam(r.partner,1); r.helped=true; } S.finish(GM||{G},'SQ12',r,{away:true}); },
    outingMissed:missedAt('SQ12','go') };

  /* SQ13：一次試吃（第三次＝她從韓國寄來的那一罐）；三個月後（開口那天起）老闆娘回來 */
  S.taste13=async function(GM,r){ const G=GM.G; await say(GM,'老闆',L.SQ13.ask); const k=await GM.choose(L.SQ13.opts.map(t=>({t:q2(t)}))); (r.tastes=r.tastes||[]).push(k); r.lastTaste=G.day;
    if(r.tastes.length<3) return; await say(GM,'老闆',L.SQ13.reveal);
    if(k===0) await sayAll(GM,'老闆',L.SQ13.better); else for(const [w,t] of L.SQ13.other) await say(GM,w,t);
    setWait(r,'wait',Math.max(r.day+90,G.day+1)); };

  /* SQ14：公園「看」貓（wzpark3d.js 的貓，在其他選單之前）→ 放進外出籠 → 走路 15 分鐘的動物醫院（2D，vet_clinic 還沒有圖）→ 回茶屋 */
  S.cageOpen=G=>{ const r=G&&S.get(G,'SQ14'); return !!r&&r.state==='open'&&r.step==='cage'&&(r.by==null||G.day<=r.by); };   /* 貓的按鈕名字換成「看」（wzpark3d.js catLabel）*/
  S.cage14=async function(GM){ const G=GM&&GM.G, r=G&&S.get(G,'SQ14'); if(!r||r.state!=='open'||r.step!=='cage') return false; S.lapse(G); if(r.state!=='open') return false;
    await say(GM,null,L.SQ14.cage); setAct(r,'vet',G.day+1);
    if(typeof OUT!=='undefined') OUT.plan(G,{id:'sq14_vet_'+G.day,ev:'ev_sq14_vet',day:G.day,h:+G.hour+0.25,late:1,place:'羅斯福路・動物醫院',title:'回診：帶牠去動物醫院',travel:'走路 約 15 分鐘',travelH:0.25}); return true; };
  S.VET_EV={ id:'ev_sq14_vet', title:'回診', participants:[], location:'any', trigger:'outing', background:'dark', hours:1,
    dialogue:[{scene:'羅斯福路・動物醫院',bg:'vet_clinic'}].concat(L.SQ14.chip.map(t=>({speaker:null,text:t})),[{scene:'溫州街・一盞茶屋'},{speaker:null,text:L.SQ14.backN}],L.SQ14.back.map(t=>({speaker:'蘇姨',text:t})),[{speaker:null,text:L.SQ14.tea}]),
    after:(G,GM)=>{ const r=S.get(G,'SQ14'); if(r&&r.state==='open'&&r.step==='vet') S.finish(GM||{G},'SQ14',r,{away:true}); },
    outingMissed:missedAt('SQ14','vet') };
  S.sq14Done=G=>{ const r=G&&S.get(G,'SQ14'); return !!r&&r.state==='done'; };   /* 演過 SQ14（過期＝照沒演過，AA_408 1）*/
  S.adoptExtra=G=>S.sq14Done(G)?[L.SQ14.notice]:null;   /* 12/17 公布欄的領養告示，後面多一行（wzpark3d.js notices）*/

  /* SQ15：下次去書店整理那一箱（30 分）→ 三選一 */
  S.sort15=async function(GM,r){ const G=GM.G; if(GM.advance) GM.advance(0.5); await say(GM,null,L.SQ15.look); await sayAll(GM,null,L.SQ15.find);
    if(G.events&&G.events.done&&G.events.done.ev_sis_family_dinner) await say(GM,null,L.SQ15.dinner);   /* 演過大一上家聚（善意第三人那個糗事）*/
    await say(GM,'書店老闆',L.SQ15.who);
    let k=await GM.choose(L.SQ15.opts.map((t,i)=>i===0?{t:q2(t),hint:'80 元',dim:(G.money|0)<80}:{t:q2(t)})); if(k===0&&(G.money|0)<80){ if(GM.toast) GM.toast('錢不夠'); k=1; }   /* 錢不夠買：當成「幫我留著」*/
    await say(GM,'書店老闆',L.SQ15.reply[k]||L.SQ15.reply[2]);
    if(k===0){ if(GM.money) GM.money(-80,'書'); r.book='bought'; r.owned=G.day; G.flags.SQ15_BOOK='bought'; r.helped=true; S.finish(GM,'SQ15',r); }   /* 書變成房間物品；下一次找學姊說話先演那一段 */
    else if(k===1){ r.book='asked'; G.flags.SQ15_BOOK='asked'; r.helped=true; setAct(r,'sis',G.day+7); }   /* 留一個禮拜：一週內找學姊說 */
    else { r.book='recycled'; G.flags.SQ15_BOOK='recycled'; S.finish(GM,'SQ15',r); }   /* 照常整理完；民總拿去回收（不能買了）*/
    return true; };
  /* 之後找學姊說話先演（SISY23.preTalk 包一層，同 loans3d.js）：學姊熟悉 +2、自在 +2（演了這一段才加）*/
  S.sisPreDue=function(G){ const r=G&&S.get(G,'SQ15'); if(!r||r.sisSaid) return null; if(r.book==='bought'&&r.state==='done') return r; if(r.book==='asked'&&r.state==='open'&&r.step==='sis'&&(r.by==null||G.day<=r.by)) return r; return null; };
  S.sisPre=async function(GM){ const G=GM&&GM.G; if(!law(G)||typeof EVENTS==='undefined'||!EVENTS.runLines) return false; S.lapse(G); const r=S.sisPreDue(G); if(!r) return false; r.sisSaid=G.day; const A=L.SQ15.sis;
    await EVENTS.runLines([{speaker:null,text:A.put},{speaker:SIS,text:A.how},{speaker:SIS,text:r.book==='bought'?A.bought:A.asked},{speaker:SIS,text:A.ugly},{speaker:SIS,text:A.keep},{consequences:{rel:{[SIS]:{fam:2,comf:2}}}}],{id:'sq15_sis',participants:[SIS]});
    if(r.book==='asked') setWait(r,'buy',G.day); return true; };
  /* 房間物品「學姊大一的民法總則」：期中、期末考前一晚（明天有考試、18:00 以後）「看」＝最後一頁那一行（一次）；平常＝AA_408 6 那一句（封面內頁、字比現在圓一點）*/
  S.examEve=function(G){ if(typeof CLS==='undefined'||!CLS.examList||typeof CALENDAR==='undefined'||hr(G)<18) return false; const t=CALENDAR.termOf(G.day+1); return !!t&&!!t.exam&&CLS.examList(G,t.id).some(e=>e.day===G.day+1); };
  S.bookLine=function(G){ const r=S.get(G,'SQ15'); if(r&&!r.eve&&S.examEve(G)){ r.eve=G.day; return L.SQ15.eve; } return L.SQ15.shelf; };
  S.room15=function(G,Lst){ const r=G&&S.get(G,'SQ15'); if(!r||r.owned==null) return; Lst.push([L.SQ15.item,[],async GM=>{ await GM.say(null,S.bookLine(GM.G)); }]); };

  /* SQ17（AA_408 6）：一次問一題（問過的不再出現）；前兩次在「為什麼想去？」「去了想學什麼？」裡選，第三次只有「如果沒上呢？」（意外那一句固定在第三題）。
     每一題她先說中文、再說英文（店員兩句）；第三題後面多封膜機那一句旁白。第三題之後：「上了跟我說。」＝她要電話（記聯絡人、四月底私訊）；「加油。」＝下一次點飲料當面說 */
  S.ask17=async function(GM,r){ const G=GM.G, A=r.asked=r.asked||[], rem=[0,1,2].filter(i=>!A.includes(i)); if(!rem.length) return false;
    const left=rem.length>1?rem.filter(i=>i!==2):rem;   /* 舊存檔先問過第三題的：照剩下的問完 */
    const k=left[await GM.choose(left.map(i=>({t:q2(L.SQ17.qs[i])})))]; const q=k==null?left[0]:k; A.push(q); r.lastAsk=G.day;
    await sayAll(GM,'店員',L.SQ17.ans[q]); if(q===2) await say(GM,null,L.SQ17.en);
    if(A.length<3) return true;
    const w0=DK(dateOf(G.day).y+'-04-25'), w=Math.max(G.day+1,w0!=null?w0:G.day+1);   /* 四月底（4/25 起）*/
    const g=await GM.choose(L.SQ17.give.map(t=>({t:q2(t)}))); setWait(r,'result',w);
    if(g===0){ await say(GM,'店員',L.SQ17.call); if(typeof INV!=='undefined'&&INV.addContact) INV.addContact(G,TEA);
      if(typeof PHONE!=='undefined'){ r.phone=true; PHONE.at(G,w,21,[dm(TEA,L.SQ17.result)],'sq17_result'); } }   /* 4/25 21:00 她傳「上了。京都。」（取代下一次點飲料當面說；收到＝做完，S.phone）*/
    return true; };

  /* SQ18：下個週日 08:30 小公園（2D，溫州街的圖暫代；之後可以改成 3D 公園）*/
  S.sq08Done=G=>{ const r=G&&S.get(G,'SQ08'); return !!r&&r.state==='done'; };
  S.knowsChief=G=>{ const r=G&&S.get(G,'SQ18'); return !!r&&r.state==='done'; };   /* 知道里長是誰：之後公布欄「——里長」的紙、名牌多一行（wzpark3d.js）*/
  const chessWin=()=>{ const C=typeof PARK!=='undefined'&&PARK.LINES&&PARK.LINES.CHESS; return C&&C.win?C.win:null; };   /* WZ-P3 的象棋：贏（AA_171 的句子，照年級）*/
  S.PARK18_EV={ id:'ev_sq18_park', title:'清掃日', participants:[], location:'any', trigger:'outing', background:'dark', hours:1,
    dialogue:[{scene:'溫州街・小公園',bg:'wenzhou'},{speaker:null,text:L.SQ18.clean},{speaker:null,text:L.SQ18.chief},{speaker:'阿伯',text:L.SQ18.who},
      {if:{custom:G=>S.sq08Done(G)},speaker:'阿伯',text:L.SQ18.sheet},{unless:{custom:G=>S.sq08Done(G)},speaker:'阿伯',text:L.SQ18.papers},{speaker:null,text:L.SQ18.stay}]
      .concat(chessWin()?[{unless:{custom:G=>typeof PARK!=='undefined'&&PARK.year&&PARK.year(G)>=4},speaker:'阿伯',text:chessWin()[0][0]},{if:{custom:G=>typeof PARK!=='undefined'&&PARK.year&&PARK.year(G)>=4},speaker:'阿伯',text:chessWin()[1][0]}]:[],
        [{speaker:'阿伯',text:L.SQ18.cup}]),   /* 掃完落葉以後，阿伯從袋子裡拿出最後一杯（AA_408 6）：運費＝一杯，不給錢 */
    after:(G,GM)=>{ const r=S.get(G,'SQ18'); if(r&&r.state==='open'&&r.step==='go') S.finish(GM||{G},'SQ18',r,{away:true}); },
    outingMissed:missedAt('SQ18','go') };

  /* SQ19：還芯慈（找她說話；在學校、或她週二、四中午在巷口家常菜都一樣）*/
  const xcL=a=>a.map(([w,t])=>({speaker:w==='xc'?XC:w,text:t}));
  S.XC_EV={ id:'ev_sq19_return', title:'筆記本', participants:[XC], location:'any', trigger:'interact', priority:60, background:'blur',
    prereq:{custom:G=>{ const r=S.get(G,'SQ19'); return law(G)&&!!r&&r.state==='open'&&r.step==='ret'&&(r.by==null||G.day<=r.by); }},
    dialogue:[{speaker:null,text:L.SQ19.ret},{speaker:XC,text:L.SQ19.ask},{choice:[{text:q2(L.SQ19.opts[0]),set:{SQ19_SAW:true},goto:'a'},{text:q2(L.SQ19.opts[1]),goto:'b'}]},
      {label:'a'}].concat(xcL(L.SQ19.seen),[{goto:'c'},{label:'b'}],xcL(L.SQ19.no),[{label:'c'}]),
    after:(G,GM)=>{ const r=S.get(G,'SQ19'); const saw=!!G.flags.SQ19_SAW; delete G.flags.SQ19_SAW; if(!r||r.state!=='open') return; r.saw=saw; S.finish(GM||{G},'SQ19',r); } };
  /* 兩週以後：芯慈在班上群組約讀書會（選「看了最後一行。」的；過期的照樣有，她自己會約，AA_408 1）——AA_408 6 的三則（芯慈兩則、以安「好。」），取代原本兩句旁白。
     時間＝原本旁白最早出現的時候（那一天 09:00）；S.phone 排。舊存檔已經演過兩句旁白的（groupSaid）不再傳 */
  S.xcGroupDay=function(G){ const r=G&&S.get(G,'SQ19'); if(!r||r.groupSaid) return null; if(r.state==='done'&&r.saw) return r.doneDay+14; if(r.state==='lapsed') return (r.lapseDay!=null?r.lapseDay:r.day)+14; return null; };
  S.XC_GROUP_H=9;
  S.xcGroup=function(G){ const d=S.xcGroupDay(G); if(d==null||typeof PHONE==='undefined'||!PHONE.inGroup(G,'law_class')||sent(G,'sq19_group')) return false;
    return PHONE.at(G,d,S.XC_GROUP_H,L.SQ19.group.map(([w,t])=>({th:'g:law_class',from:w==='xc'?XC:AN,text:t})),'sq19_group'); };

  /* SQ20：兩個週六 08:00～09:30（2D，店裡後面）；第二次練完＝小米姐那三句；一個月以後兩個人都過了 */
  S.plan20=(G,r)=>S.planWeekend(G,r,{id:'sq20_'+r.step,ev:'ev_sq20_'+r.step,h:8,late:0.5,place:'溫州街・半熟早午餐',title:'半熟早午餐：幫小蕙計時（第 '+(r.step==='s2'?2:1)+' 次）',travel:'走路 約 10 分鐘',travelH:1/6});
  const bohanOn=G=>!!(S.get(G,'SQ20')||{}).bohan;
  S.BRUNCH1_EV={ id:'ev_sq20_s1', title:'計時', participants:[], location:'any', trigger:'outing', background:'dark', hours:1.5,
    dialogue:[{scene:'半熟早午餐・店裡後面'},{if:{custom:bohanOn},speaker:BH,text:L.SQ20.bohan}].concat(L.SQ20.self1.map(([w,t])=>({unless:{custom:bohanOn},speaker:w,text:t}))),   /* 柏翰來了（他這學期的「精確數字」算這一次）；自己計時＝AA_408 6 的三行（旁白、小蕙、小米姐）*/
    after:G=>{ const r=S.get(G,'SQ20'); if(!r||r.state!=='open'||r.step!=='s1') return; r.step='s2'; if(!S.plan20(G,r)) lapseNow(G,r); },
    outingMissed:missedAt('SQ20','s1',(G,r)=>S.plan20(G,r)) };
  S.BRUNCH2_EV={ id:'ev_sq20_s2', title:'計時', participants:[], location:'any', trigger:'outing', background:'dark', hours:1.5,
    dialogue:[{scene:'半熟早午餐・店裡後面'},{unless:{custom:bohanOn},speaker:null,text:L.SQ20.self2},{speaker:null,text:L.SQ20.apronN}].concat(L.SQ20.apron.map(t=>({speaker:'小米姐',text:t}))),   /* 自己計時的第二次：一行旁白（AA_408 6），之後練完 */
    after:G=>{ const r=S.get(G,'SQ20'); if(r&&r.state==='open'&&r.step==='s2') setWait(r,'wait',G.day+30); },
    outingMissed:missedAt('SQ20','s2',(G,r)=>S.plan20(G,r)) };

  /* ---------- 手機（STORY.PHONE_RULES）：期限、SQ05 病床的照片、SQ06 家教回報、貓 ---------- */
  S.phone=function(G){ if(!G||!G.flags||!G.side&&!G.flags.ZQ_CAT_NIGHT&&!met(ZQ)) return; S.lapse(G);
    if(typeof PHONE!=='undefined'){
      const r5=S.get(G,'SQ05'); if(r5&&r5.zhe&&r5.closeFrom!=null&&G.day>=r5.closeFrom&&G.day<=r5.closeFrom+1&&!sent(G,'sq05_photo')) PHONE.at(G,r5.closeFrom,20,L.SQ05.photo.map(x=>({th:'g:noodle_team',from:x[0],text:x[1]})),'sq05_photo');   /* 開刀那天 20:00 阿哲在群組傳病床的照片（AA_408 2）*/
      const r6=S.get(G,'SQ06'); if(r6&&r6.state==='open'&&r6.step==='lesson'&&G.day>=r6.wait){
        if(r6.tutor!=='me'&&!sent(G,'sq06_report')){ if(G.day>r6.wait||hr(G)>=21) PHONE.at(G,r6.wait,21,[dm(r6.tutor,L.SQ06.report)],'sq06_report'); }
        if(r6.tutor==='me'||sent(G,'sq06_report')&&now(G)>=r6.wait*24+21){ if(r6.tutor===AN){ fam(AN,1); r6.helped=true; } r6.step='twist'; } }   /* 以安當家教：幫忙的女主角熟悉 +1（做完時不再加旁邊的人）*/
      const r17=S.get(G,'SQ17'), d17=DK('2028-04-20');   /* SQ17（AA_405）：演過、認識以安（有她的聯絡方式）＝2028-04-20（四）21:00 她從京都傳（不分路線）*/
      if(r17&&r17.state==='open'&&r17.step==='result'&&r17.phone&&(G.msgs||[]).some(m=>m&&m.tag==='sq17_result')) S.finish({G},'SQ17',r17,{away:true});   /* 給了電話：四月底她的私訊「上了。京都。」到了＝做完（AA_408 6）*/
      if(r17&&r17.state==='done'&&d17!=null&&G.day>=d17&&G.day<=d17+1&&met(AN)&&(typeof INV==='undefined'||!INV.hasContact||INV.hasContact(G,AN))&&!sent(G,'sq17_an')) PHONE.at(G,d17,21,L.SQ17.an.map(t=>dm(AN,t)),'sq17_an');
      S.xcGroup(G); }   /* SQ19：兩週以後芯慈在班上群組約讀書會（AA_408 6）*/
    S.catPhone(G); };
  /* SQ05：答應的隔天 12:00～18:00 在霖澤館裡＝阿哲把卡片塞給你（群組回不回都一樣，AA_408 2）*/
  S.SIGN_EV={ id:'ev_sq05_sign', title:'卡片', participants:[], location:'linze', trigger:'manual', background:'blur', dialogue:[{speaker:null,text:L.SQ05.sign}],
    after:(G)=>{ const r=S.get(G,'SQ05'); if(r) r.signed=G.day; } };
  S.signDue=function(GM){ const G=GM&&GM.G, r=G&&S.get(G,'SQ05'); if(!r||!r.zhe||r.signed||r.closeFrom==null||G.day!==r.closeFrom||G.zone!=='linze') return false; const h=hr(G); return h>=12&&h<18&&!(GM.E&&GM.E.player&&GM.E.player.busy); };
  let busy=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['sideq3d:busy']=()=>{ busy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  S.tick=function(GM){ const G=GM&&GM.G; if(busy||!law(G)||typeof EVENTS==='undefined'||!EVENTS.run) return false;
    let ev=null; if(S.signDue(GM)) ev=S.SIGN_EV; else if(S.catNightDue(GM)){ ev=S.CAT_EV; const L0=typeof WZ_PARK_LAYOUT!=='undefined'?WZ_PARK_LAYOUT:null, pav=L0&&L0.items&&L0.items.find(i=>i.kind==='pavilion'); if(pav) ev.spawn.at={x:pav.x+1.1,z:pav.z+0.6}; }   /* 她蹲在涼亭的石桌前面 */
    else if(S.sisDue(GM)) ev=S.SIS_EV;
    if(!ev) return false; busy=true; if(GM.sceneBegin) GM.sceneBegin(); Promise.resolve().then(()=>EVENTS.run(ev)).catch(e=>console.warn('SIDEQ',e)).finally(()=>{ busy=false; if(GM.G===G){ if(GM.sceneEnd) GM.sceneEnd(); if(GM.autosave) GM.autosave(); } }); return true; };   /* 決定開演的那一刻就鎖住（STUCK-HARDEN-1027，同 invites3d.js S.autoStart）：延後開演的空檔裡，玩家按的「說話」、同一格的 EVENTS.tick 都進不來；演完放開再自動存檔 */
  if(typeof STORY_EVENTS!=='undefined') for(const e of [S.FAFU_EV,S.POLICE_EV,S.CLUB_EV,S.SIS_EV,S.CAT_EV,S.VISIT_EV,S.SIGN_EV,S.HWAXIN_EV,S.PASTA_EV,S.VET_EV,S.PARK18_EV,S.XC_EV,S.BRUNCH1_EV,S.BRUNCH2_EV]) if(!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e);
  if(typeof STORY!=='undefined'){ if(Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G)); if(Array.isArray(STORY.TICKS)) STORY.TICKS.push(GM=>S.tick(GM));
    if(Array.isArray(STORY.ROOM_EXTRA)) STORY.ROOM_EXTRA.push((G,Lst)=>S.room15(G,Lst)); }   /* SQ15：學姊大一的民法總則 */
  /* SQ15：找學姊說話先演（talkSis、talkCharacter 本來就問 SISY23.preTalk——包一層，前面那幾層沒演才問這裡；照 loans3d.js 的做法，舊的旗標一起帶過去）*/
  if(typeof SISY23!=='undefined'&&typeof SISY23.preTalk==='function'&&!SISY23.preTalk._sideq){ const p0=SISY23.preTalk;
    SISY23.preTalk=Object.assign(async function(GM){ const r=await p0.apply(this,arguments); return r||await S.sisPre(GM); },p0,{_sideq:true}); }
  return S;
})();
