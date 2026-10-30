/* ===== 主線 4「被需要的一年」：大二每週日 21:00「這週的訊息」（AA_179 第 2、4 節＝AA 的六個人；BB_97 第 11 節＝BB 的人物，BB-B 44483032／7edab410）=====
   規則在 story3d.js 的 S.neededDue／neededShow（AA_179 第 1 節：一週最多四則、綁事件的先挑、上週沒出現的人先挑、只挑認識的人、回得了兩則、回了信任 +1、沒回下一次見面說一句）。
   每一則：id、who（人物 id）、term（Y2S1／Y2S2）、w［週次起, 迄］、msg（對方的訊息，可以拆幾則）、reply（祐廷那句，固定）、resp（對方的回應）、
     tie（綁在事件前後＝先挑）、cond（條件；沒寫＝和他 FAMILIAR 以上）、anyone（條件成立就算，不另外看熟不熟：交往中的可昕）、every（每幾週可以再出現一次：語彤「阿姨問你週四來不來」）。
   條件還做不到的（模擬法庭同一組、Z7、語彤事件 11；慈 3＝ev_xinci_second、語 3＝ev_yu_together／YU_ZHE_TOLD 已接）：先寫成 false，那幾件做好時改成讀它們的旗標，訊息就會出現。
   法律內容（AA_179 第 5 節、BB_97 11-3）：祐廷都不給法律結論。 */
const NEEDED_MSGS=(function(){
  const F=G=>G.flags||{}, done=(G,id)=>!!(G.events&&G.events.done&&G.events.done[id]), att=(G,id)=>typeof ACTIVITIES!=='undefined'&&!!ACTIVITIES.attendedAny&&ACTIVITIES.attendedAny(G,id);
  const lawclub=G=>!!(F(G).lawclub||F(G).CLUB_lawclub_study), noodle=G=>{ const H=G.habits&&G.habits['meal:noodle']; return !!(H&&(H.days||[]).length)||F(G).noodleTableDay!=null; };
  const mem=(G,npc,tag)=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(npc,tag), playtested=G=>mem(G,'heroine_04','PLAYTESTED');
  const NOT_YET=()=>false;   /* 那一件還沒做（語彤事件 11）；模擬法庭（an_moot＝在賣家組群組、bh_moot＝模 3 在場、xc_moot＝模 5）、Z7（zr_beans）2026-10-16 接上 */
  const L=[
    // 以安（AA_179 第 2 節；516ba348）。miss＝沒回的那一句（第 4 節，每一則各一句）；missDating＝交往中的版本（第 4-1 節）
    {id:'an_lib',who:'heroine_01',term:'Y2S1',w:[1,6],msg:['今天在總圖嗎？'],reply:'在。三樓。',resp:['好，我四點過去，幫我留個位子。'],
      miss:['上週問你在不在總圖。……沒關係，那本我自己讀完了。'],missDating:['上週問你在不在總圖，你沒回。我多借的那本，還在我桌上。']},
    {id:'an_rules',who:'heroine_01',term:'Y2S1',w:[4,6],tie:true,cond:G=>att(G,'public_law_group'),msg:['讀書會的規則，我寫了一頁。','📷（〈公法讀書會規則〉一頁十二條，第五條「發言超過十分鐘，要先舉手」）','幫我看哪一條可以刪。'],reply:'第五條。',resp:['……我也覺得是第五條。'],
      miss:['讀書會的規則，你上週沒回。……沒關係，先照十二條。'],missDating:['讀書會的規則你沒回。週四以前跟我說，我想聽你的。']},
    {id:'an_admin',who:'heroine_01',term:'Y2S1',w:[13,14],tie:true,cond:G=>done(G,'ev_an_tutor_family_1')&&F(G).AN10_PICK!=='reason',msg:['公文我拿到了。','……先看哪一段？我想先自己看懂。'],reply:'先看理由，再看最後寫期限的那一段。',resp:['好，我先看這兩段。'],
      miss:['家教學生家那份公文，我自己先看了。……看懂一半。'],missDating:['公文那則你沒回。我自己看懂一半了。另一半，今天陪我看。']},   /* AA_374 第 5 項（AA_211、AA_313）：原本 w[12,14]——11/29 私訊說了，12/1 麵店（ev_an_tutor_family_1）又當新消息講；麵店選了「理由」（AN10_PICK）的玩家同一句建議講過了。AA_313 4-3：只在 12/1 麵店（ev_an_tutor_family_1）演過以後送，第一則只說「公文我拿到了。」（駁回的事當面講過）*/
    {id:'an_topics',who:'heroine_01',term:'Y2S2',w:[3,6],cond:G=>att(G,'public_law_group'),msg:['這週讀書會的題目，我排了一版。','📷（一張表，八題）'],reply:'題目好難。',resp:['第三題是 Alison 挑的，我也還沒寫出來。'],   /* 原 an_moot（模擬法庭刪除，AA_252 第 4 節）*/
      miss:['讀書會的題目你沒回。沒關係，我先照那一版。'],missDating:['題目你沒回。……那這週第三題你來講。']},
    {id:'an_lead',who:'heroine_01',term:'Y2S2',w:[10,14],cond:G=>att(G,'public_law_group'),msg:['這週讀書會換你帶，可以嗎？'],reply:'好。',resp:['謝謝。我想試試看坐在下面。'],
      miss:['讀書會換人帶那則，你沒回。……這週我繼續帶。沒關係。'],missDating:['讀書會換人帶那則，你沒回。這週我繼續帶。下週換你，不准躲。']},
    // 語彤（AA_179）
    {id:'yt_auntie',who:'heroine_03',term:'Y2S1',w:[1,16],every:4,cond:noodle,msg:['阿姨問你週四來不來。'],reply:'來。',resp:['好，我跟她說。'],
      miss:['阿姨上週問了你三次。……我說你很忙。'],missDating:['阿姨上週問了你三次。我說你很忙。她說那更要來吃。']},
    {id:'yt_fafu',who:'heroine_03',term:'Y2S1',w:[2,2],msg:['法律系的課，我上禮拜第一次去上。','教室好大。'],   /* AA_374 第 23 項：9/20（週日）發，第一次去上是上禮拜 */reply:'坐我旁邊。',resp:['……我習慣坐最後一排。你坐過來。'],   /* AA_255：語彤不加入法服，改成雙主修第一週（id 照舊，舊存檔收過法服那則的不再收這則）*/
      miss:['上課那則你沒回。……我找到位子了。'],missDating:['上課那則你沒回。……我找到位子了。你忙的時候，回一個『忙』就好。']},
    {id:'yt_floor',who:'heroine_03',term:'Y2S1',w:[8,9],msg:['期中考你在總圖哪一層？我想找一個不會遇到麵店客人的地方。'],reply:'三樓。最裡面。',resp:['好。……阿姨以為我在家讀。'],
      miss:['期中那幾天，我找到一個沒有客人的地方了。……不告訴你。'],missDating:['期中那幾天，我找到一個沒有客人的地方了。……不告訴你。']},
    {id:'yt_rent',who:'heroine_03',term:'Y2S2',w:[10,12],tie:true,cond:G=>done(G,'ev_yutong_landlord')||!!F(G).RENT_RUMOR,msg:['仲介又帶人來店裡看了。','沒事，跟你說一聲。'],reply:'要不要帶阿姨去法服問問看？',resp:['我問問看阿姨。'],
      miss:['仲介那件事，你上週很忙吧。沒事。'],missDating:['仲介那件事，沒事了。……你上週是不是很累？']},
    {id:'yt_dish',who:'heroine_03',term:'Y2S2',w:[15,16],tie:true,cond:G=>mem(G,'heroine_03','APOLOGIZED'),   /* 語彤事件 11 洗完碗（AA_325 2-Y2-22；AA_255 第 4 節第 6 點：w[15,16]）*/
     msg:['阿姨說你上次洗的碗還有油。'],reply:'下次我洗兩次。',resp:['……嗯。'],miss:null},
    // 阿哲（AA_179；沒回的那一句都用「你上週很忙齁。」開頭）
    {id:'zhe_book',who:'zhe',term:'Y2S1',w:[1,4],msg:['債總課本借我 我的還在學長那'],reply:'拿去。',resp:['讚。我請你一碗大的。'],miss:['你上週很忙齁。債總我跟學長拿到了。']},
    {id:'zhe_notes',who:'zhe',term:'Y2S1',w:[9,9],tie:true,   /* AA_313 5-3：只在第 9 週（第 10 週週日是哲 2 之後，可能已經借過筆記）*/msg:['民法借我。筆記。全部。'],reply:'好。週四麵店拿。',resp:['你是神。'],miss:['你上週很忙齁。民法筆記我跟 Alison 借了。……她的字比你的好看。']},
    {id:'zhe_score',who:'zhe',term:'Y2S1',w:[14,14],tie:true,   /* AA_374 第 4 項（AA_211）：12/6 發會指 12/12，系籃是 12/19 */msg:['週六系籃缺一個記分的。你會加減吧？'],reply:'會。',resp:['那就是你了。不准跑。'],miss:['你上週很忙齁。記分的我抓到別人了。你欠我一次。']},
    {id:'zhe_deposit',who:'zhe',term:'Y2S2',w:[4,4],tie:true,msg:['我學長退租，房東說押金要扣一半。','他叫我問你 押金扣一半可以嗎'],reply:'叫他找搬進去那時候拍的照片。',resp:['照片？……我問他有沒有拍。'],miss:['你上週很忙齁。我學長押金那件，他自己去問了。']},   /* AA_255：押金是學長的、只在第 4 週 */
    {id:'zhe_final',who:'zhe',term:'Y2S2',w:[14,15]/* AA_375 第 22 項（AA_255 第 2 節第 5 點）：6/13（第 16 週）已經考完 */,msg:['期末一起讀？我負責滷味，你負責不要讓我睡著。'],reply:'好。',resp:['成交。'],miss:['你上週很忙齁。滷味我自己吃完了。']},
    // Alison（AA_179）
    {id:'yu_expo',who:'yu',term:'Y2S1',w:[1,1],at:{day:'2026-09-10',h:21}/* AA_491 A：社博搬到 9/12（六），第 1 週週四 21:00 發、在社博以前 */,tie:true,   /* AA_374 第 3 項（AA_211 附錄 A 3-5）：原本最早 9/20 才發，博覽會已經過了 */msg:['社團博覽會你站哪一攤？我要去偷看。'],reply:'妳來就知道。',resp:['好神秘。我帶阿哲去。'],miss:['欸，博覽會那則你沒回。我自己找到你那攤了。']},
    {id:'yu_overtime',who:'yu',term:'Y2S1',w:[6,8],msg:['欸，打工的地方不給加班費，這樣可以嗎？我同學問的。'],reply:'我不能判斷。叫她問法服或勞工局。',resp:['……你講話好像法服的學長。好，我叫她去。'],miss:['欸，加班費那則你沒回。我叫我同學去法服問了。']},
    {id:'yu_gift',who:'yu',term:'Y2S1',w:[16,16],tie:true,cond:G=>done(G,'ev_yu_together')||!!F(G).YU_ZHE_TOLD,msg:['聖誕禮物，阿哲跟我買了一樣的。你不准笑。'],reply:'我沒笑。',resp:['你一定在笑。'],miss:['欸，你沒回我。所以你一定在笑。']},
    {id:'yu_clubs',who:'yu',term:'Y2S2',w:[1,3],cond:G=>false/* AA_497 3-4（企劃線 7a38216ca）：她退辯論社改成大二下第 3 週她自己傳的三則（src/sup497_3d.js yu_quit），這一則不再發（不留兩份）*/,msg:['這學期我只剩兩個社團了。你猜我退了哪一個？'],reply:'猜不到。',resp:['辯論社。比賽都在週末，我要念書了。'],miss:['欸，你都沒猜。是辯論社啦。']},
    {id:'yu_exam',who:'yu',term:'Y2S2',w:[12,14],msg:['司法官的考古題，你覺得大二開始看會太早嗎？'],reply:'不會。',resp:['好。那我開始了。……阿哲知道的話，會說我瘋了。'],miss:['欸，考古題那則你沒回。……我已經開始了。阿哲還不知道。']},
    // 柏翰（AA_179）
    {id:'bh_handover',who:'classmate_bohan',term:'Y2S1',w:[1,3],tie:true,cond:lawclub,msg:['社長交接的資料有一百頁。你幫我看第一章就好。'],reply:'好。',resp:['……謝謝。我以為社長只要會排值班表。'],miss:['交接資料第一章，我自己看完了。……一百頁都看完了。']},
    {id:'bh_q3',who:'classmate_bohan',term:'Y2S1',w:[6,8],tie:true,msg:['刑分考古題第三題，你寫哪一說？'],reply:'兩說都寫。',resp:['……考試時間不夠。'],miss:['上週問你刑分第三題……算了，我自己查到了。']},
    {id:'bh_score',who:'classmate_bohan',term:'Y2S1',w:[11,13],tie:true,cond:G=>F(G).BOHAN_GROUP==='ask',msg:['你上次說分數不夠的人。我還在想。'],reply:'想到了跟我說。',resp:['嗯。'],miss:['分數不夠的人那件事……我還在想。']},
    {id:'bh_scores',who:'classmate_bohan',term:'Y2S2',w:[7,9],tie:true,cond:G=>att(G,'public_law_group')&&done(G,'ev_bohan_scores'),msg:['分數表那件，以安都沒說話。她是不是不高興？'],reply:'你自己問她。',resp:['……好。'],miss:['讀書會那則，你沒回也沒關係。']},   /* 原 bh_moot（模擬法庭刪除）；只在 ev_bohan_scores 演過才出現 */
    {id:'bh_final',who:'classmate_bohan',term:'Y2S2',w:[14,15],msg:['期末的考古題整理好了，放在讀書會的雲端。'],reply:'謝謝。',resp:['民法那份少一年，我還在找。'],miss:null},
    // 芯慈（AA_179）
    {id:'xc_econ',who:'classmate_xinci',term:'Y2S1',w:[2,4],tie:true,cond:G=>!!F(G).ECON_TOGETHER,msg:['經濟那邊，這學期你還陪我看嗎？'],reply:'好。',resp:['那週三總圖。'],miss:['經濟那邊，你沒回。……我自己去聽了。']},
    {id:'xc_contract',who:'classmate_xinci',term:'Y2S2',w:[8,10],   /* AA_313 5-6：和 Alison 的 yu_overtime（大二上第 6～8 週）幾乎同一則，兩則不要同一學期——搬到大二下第 8～10 週（xc_grade 第 5～7 週、xc_notes 第 11～13 週中間）*/msg:['幫我看一下這份打工的合約。我朋友要簽的。'],reply:'我只能說我看到什麼。要問的話去法服。',resp:['……好。我照你說的跟她講。'],miss:['合約那則你沒回。……我叫我朋友去法服了。']},
    {id:'xc_drama',who:'classmate_xinci',term:'Y2S1',w:[14,16],tie:true,cond:G=>done(G,'ev_xinci_second')||done(G,'ev_xinci_second_b1'),msg:['永和的公車今天提早到了。……我多讀了一章。'],reply:'恭喜？',resp:['謝謝。很少發生。'],miss:['上次公車那則，你沒回。','……沒關係。那班車隔天又誤點了。']},   /* AA_497 第 8 節後補（企劃線 b70bed855）：沒回的那一句，時機照原本 */   /* AA_497 第 8 節第 3 點（企劃線 60fc3b9a3）：追劇減量，三句照稿換；沒回的那一句（原本「大結局那則你沒回。……很好，代表你沒爆雷。」）稿沒給新句＝先不說（miss:null），請 AA 補 */
    {id:'xc_grade',who:'classmate_xinci',term:'Y2S2',w:[5,7],msg:['期中成績出來，不要跟我說以安考幾分。'],reply:'好。',resp:['謝啦。不然我一定會去算差幾分。'],miss:['以安的分數那件，你沒回。……反正不要跟我說就好。']},
    {id:'xc_notes',who:'classmate_xinci',term:'Y2S2',w:[11,13],msg:['期末的筆記我想換個方式整理。你都怎麼記判決？'],reply:'我只抄爭點跟結論，其他的回去看全文。',resp:['好，我試試看。'],miss:['筆記那則你沒回。……我自己試了。']},   /* 原 xc_moot（模擬法庭刪除）*/
    // 芷若（BB_97 11-1：整年只有這一則、反過來問他「你想」；沒回不提起）
    {id:'zr_beans',who:'heroine_02',term:'Y2S1',w:[14,15],tie:true,cond:G=>done(G,'ev_zhiruo_applied'),msg:['店裡進了新的豆子','比較酸一點 你想喝喝看嗎'],reply:'想。',resp:['好 週四我上班','來的時候跟我說 我幫你留一杯'],miss:null},   /* Café 常客；Z7 之後 */
    // 子晴（BB_97 11-1；BB_205 第 5 節）
    {id:'zq_game',who:'heroine_04',term:'Y2S1',w:[1,3],msg:['你現在有空嗎','幫我測一下遊戲'],vars:[{cond:G=>!playtested(G),msg:['幫我看一個東西','現在','……你有空吧'],resp:['傳了','第三張不要跳過 我就是要問那張'],miss:['那則你沒回','……算了 我自己看']}],   /* AA_428 §2 第 6 點：沒試玩過（沒看過 Q6）的玩家整則換掉——不說破她在做遊戲（回答也不講「第三關」）；試玩過的拿掉「這不是問句」（大二上的配額留給事件），resp、miss 照現行 */reply:'好。連結呢？',resp:['傳了','第三關不要跳 我就是要看那邊'],miss:['測遊戲那則你沒回。','……第三關我自己測了。我自己都卡住。']},
    {id:'zq_dad',who:'heroine_04',term:'Y2S2',w:[12,12]/* AA_375 第 3 項：5/16 發，「下週」＝第 13 週（爸爸第 13～14 週才來；原本 [11,12] 5/9 就先發）*/,tie:true,msg:['欸跟你說','我爸下週要來台北','他說要看我做的遊戲'],vars:[{cond:G=>!playtested(G),msg:['欸跟你說','我爸下週要來台北','他說要來看我']}],reply:'他會喜歡的。',resp:['你又不認識他','好啦 謝啦'],
      miss:['我爸要來那則，你沒回。','……算了，沒差。'],missUnless:G=>done(G,'ev_ziqing_dad_visit')},   /* 沒看過 Q6（PLAYTESTED）的不提遊戲；沒回的那一句 Q8 之前才說 */
    {id:'zq_name',who:'heroine_04',term:'Y2S2',w:[6,8],cond:playtested,msg:['幫我的新遊戲想一個名字。','不要太好聽。'],reply:'『存檔點』。',resp:['哈哈哈好爛','先當暫定的'],miss:['名字還沒取。我自己想。']},   /* AA_507 0-2 第 1 點（e4fbd0192）：大三上她說新的那個「還沒有名字」，這句原本「遊戲名字我自己取了。先不說。」*/   /* 沒看過 Q6 的玩家會從這則知道她在做遊戲（BB_205 第 5 節）*/
    {id:'zq_song',who:'heroine_04',term:'Y2S2',w:[11,13],tie:true,cond:G=>!!F(G).INVITED_CLUB,msg:['成發那首歌的第四句寫不出來。','給我一個詞。'],reply:'『重來』。',resp:['可以欸','先用這個'],miss:['第四句歌詞，我自己寫完了。']},
    // 學姊（BB_97 11-1；BB_205 第 4 節：祐廷大二整年她是碩一，只有法圖那本書）
    /* 'sis_duty'、'sis_typo'：刪（BB_207 第 2 節：學姊大二上是碩一，不回法服、推甄整段取消）；'sis_report'：刪（BB_205 第 4 節：學姊沒接阿姨的案子）*/
    {id:'sis_list',who:'heroine_05',term:'Y2S2',w:[1,3],msg:['法圖那本行政救濟的書被借走了。你們班上有人有嗎？'],reply:'我問問看。',resp:['好。不急。'],miss:['那本書我借到了。']},   /* id 照舊（原本「家族的學弟妹名單」）*/
    // 沛珊（BB_97 11-1）
    {id:'ps_q',who:'classmate_peishan',term:'Y2S1',w:[2,4],tie:true,msg:['讀書會這週的題目，你可以幫我出一題嗎？我出的都太簡單。'],reply:'好。我出一題難的。',resp:['謝謝！不要太難喔 上次大家寫超久'],miss:['讀書會的題目，你上週沒回。我自己出了一題。']},
    {id:'ps_plan',who:'classmate_peishan',term:'Y2S1',w:[6,8],tie:true,cond:G=>done(G,'ev_peishan_decision'),msg:['重考的讀書計畫，我排到明年七月。','你會覺得我瘋了嗎'],reply:'沒有。',resp:['好。那我就照這個走。'],miss:['重考計畫那則你沒回。……沒關係，我先照那個排。']},
    /* 'ps_notes'：搬到 story3d.js 12/17 22:00（BB_205 第 2 節）*/
    /* 'ps_kids'：刪（BB_205 第 3 節：沛珊消失期）*/
    // 明軒（BB_97 11-1）
    {id:'mx_tutor',who:'classmate_mingxuan',term:'Y2S1',w:[3,5],tie:true,cond:()=>false,   /* AA_374 第 22 項：大二上拿掉（大二沒有家教的排程，AA_211 第 6 節第 6 點）；id 留著，舊存檔收過的照舊認得 */msg:['家教那家的媽媽問你下學期還來不來 😂'],reply:'會。',resp:['好 我跟她說 👍 你教得比我好 不要傳出去'],miss:['家教媽媽那邊，我先跟她說你在考慮喔。']},
    {id:'mx_toefl',who:'classmate_mingxuan',term:'Y2S1',w:[9,11],msg:['托福作文題目：規則應該為了多數人嗎 🤔 你會怎麼開頭'],vars:[{cond:G=>!mem(G,'classmate_mingxuan','SAW_HIM_STUDY'),msg:['我朋友在準備托福 叫我問你 🤔','題目是規則應該為了多數人嗎 怎麼開頭']}],   /* AA_374 第 12 項（AA_211 附錄 B P4）*/reply:'先問：哪一個少數。',resp:['哈哈 好 我試試看'],miss:['托福那題，我自己寫了開頭啦。']},
    {id:'mx_seat',who:'classmate_mingxuan',term:'Y2S2',w:[4,4],at:{day:'2027-03-15',h:21}/* AA_375 第 10 項：3/15（一）21:00 發（學校信 3/15 09:00 才公告、以安 09:20 才說坐第一排），不進 3/14 那一組（STORY.neededAt）*/,tie:true,msg:['交換說明會週四中午 幫我佔第一排 我下課跑過去 🏃'],vars:[{cond:G=>!mem(G,'classmate_mingxuan','SAW_HIM_STUDY'),msg:['交換說明會週四中午 你要去嗎','我只是去聽聽 順便吃便當 😂'],resp:['好 那我們第一排見 👍']}],reply:'好。',resp:['以安說她也要坐第一排 那第一排不夠了 😂'],miss:['說明會的位子我自己去佔了，第二排。']},   /* 沒有 SAW_HIM_STUDY：他不讓人看到在念書 */
    {id:'mx_form',who:'classmate_mingxuan',term:'Y2S2',w:[14,16],tie:true,msg:['交換的志願表 我第一志願改了三次 😂 你下學期會填嗎'],reply:'還不知道。',resp:['好 你要填的時候跟我說 我的借你參考 😂'],miss:['志願表我又改了一次。']},
    // 阿凱（BB_97 11-1）
    {id:'kai_net',who:'kai',term:'Y2S1',w:[1,3],tie:true,msg:['所以新宿舍網路爛到不行 你那邊呢'],reply:'還好。',resp:['所以週日我去你那邊打報告 我帶滷味'],miss:['所以你那邊網路到底怎樣？週日我先帶筆電過去。']},
    {id:'kai_bot',who:'kai',term:'Y2S1',w:[8,10],tie:true,msg:['所以我寫了一個會回答法律問題的聊天機器人 你幫我測'],reply:'它不能給法律結論。',resp:['所以我加一句 請去問法服 這樣可以嗎'],miss:['所以機器人我自己測了。怪怪的。']},
    {id:'kai_kb',who:'kai',term:'Y2S2',w:[5,7],tie:true,msg:['所以大一那把少一顆鍵的鍵盤 又壞一顆 是Enter'],vars:[{cond:G=>!mem(G,'kai','KAI_KEYBOARD'),msg:['所以我網拍買的鍵盤 Enter 壞了 賣家是一個阿伯'],resp:['不要 阿伯人很好 都會回我']}],reply:'換一個賣家吧。',resp:['不要 我跟那個阿伯有感情了'],miss:['Enter 我自己修好了，要按很大力。']},   /* KAI_KEYBOARD＝大一下 S-3 幫他查過（BB_154）*/
    // 方奕廷（BB_97 11-1）
    {id:'fy_plant',who:'npc_fangyt',term:'Y2S1',w:[3,5],tie:true,cond:G=>!!F(G).POTHOS,msg:['📷 Epipremnum aureum，黃金葛。','你那盆還活著嗎？'],reply:'活著。',resp:['那就好','黃金葛很難養死 葉子黃了再跟我說'],miss:['黃金葛那則你沒回。它應該還活著吧。']},
    {id:'fy_quiet',who:'npc_fangyt',term:'Y2S1',w:[12,14],msg:['期末想找一個安靜的地方讀書。你知道哪裡沒有人嗎？'],reply:'總圖五樓最裡面。',resp:['你也在那喔','好啊 那我去'],miss:['讀書的地方，我自己找到一個了。']},
    {id:'fy_sign',who:'npc_fangyt',term:'Y2S2',w:[9,11],tie:true,msg:['📷（一塊牌子「私人土地，禁止進入」）','這條山路，是真的不能走嗎？'],reply:'我不能幫你判斷。繞路最保險。',resp:['好 那我走另一條','多一個小時而已'],miss:['那條山路，我後來繞路了。']},
    // 可昕（BB_97 11-1；只有交往中、只放「請他幫忙」的）
    {id:'kx_example',who:'kexin',term:'Y2S1',w:[4,6],tie:true,anyone:true,cond:G=>!!F(G).dating_kexin,msg:['物權報告要一個『好笑但是對的』例子。借我一個。'],reply:'鄰居的樹長過來，掉下來的果子算誰的？',resp:['這個好','答案我自己查'],miss:['物權報告的例子，我自己想了一個。']},
    {id:'kx_yule',who:'kexin',term:'Y2S2',w:[2,4],anyone:true,cond:G=>!!F(G).dating_kexin,msg:['予樂的生日要辦驚喜。我負責騙她出門，你負責想一個理由。'],reply:'說要陪妳去配眼鏡。',resp:['好 就這個'],miss:['予樂那個驚喜，理由我自己編了。']},
    {id:'kx_cv',who:'kexin',term:'Y2S2',w:[6,8],tie:true,anyone:true,cond:G=>!!F(G).dating_kexin,msg:['期中報告的摘要，幫我挑錯字。其他的不要有意見。'],reply:'第一行，『學系』打成『學習』。',resp:['……我已經交出去了。'],miss:['摘要我自己挑了。交出去才看到一個錯字。']} ];   /* id 照舊（原本「暑假實習的履歷」，BB_97 11-1 改成期中報告的摘要）*/
  /* 沒回的那一句：每一則各一句（AA_179 第 4 節、BB_97 11-2），寫在每一則的 miss；null＝那一則沒回也不提（芷若的豆子、語彤洗碗、柏翰考古題）。
     下面這張是舊的「一個人一句」，只給沒寫 miss 的訊息（目前沒有）當備用 */
  const MISS={};
  return {list:L,miss:MISS};
})();
