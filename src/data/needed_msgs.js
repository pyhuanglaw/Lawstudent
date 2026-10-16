/* ===== 主線 4「被需要的一年」：大二每週日 21:00「這週的訊息」（AA_179 第 2、4 節＝AA 的六個人；BB_97 第 11 節＝BB 的人物，BB-B 44483032／7edab410）=====
   規則在 story3d.js 的 S.neededDue／neededShow（AA_179 第 1 節：一週最多四則、綁事件的先挑、上週沒出現的人先挑、只挑認識的人、回得了兩則、回了信任 +1、沒回下一次見面說一句）。
   每一則：id、who（人物 id）、term（Y2S1／Y2S2）、w［週次起, 迄］、msg（對方的訊息，可以拆幾則）、reply（祐廷那句，固定）、resp（對方的回應）、
     tie（綁在事件前後＝先挑）、cond（條件；沒寫＝和他 FAMILIAR 以上）、anyone（條件成立就算，不另外看熟不熟：交往中的可昕）、every（每幾週可以再出現一次：語彤「阿姨問你週四來不來」）。
   條件還做不到的（模擬法庭同一組、語 3、慈 3、Z7、語彤事件 11）：先寫成 false，那幾件做好時改成讀它們的旗標，訊息就會出現。
   法律內容（AA_179 第 5 節、BB_97 11-3）：祐廷都不給法律結論。 */
const NEEDED_MSGS=(function(){
  const F=G=>G.flags||{}, done=(G,id)=>!!(G.events&&G.events.done&&G.events.done[id]), att=(G,id)=>typeof ACTIVITIES!=='undefined'&&!!ACTIVITIES.attendedAny&&ACTIVITIES.attendedAny(G,id);
  const lawclub=G=>!!(F(G).lawclub||F(G).CLUB_lawclub_study), noodle=G=>{ const H=G.habits&&G.habits['meal:noodle']; return !!(H&&(H.days||[]).length)||F(G).noodleTableDay!=null; };
  const NOT_YET=()=>false;   /* 那一件還沒做（模擬法庭 SYS-09、語 3、慈 3、Z7、語彤事件 11）*/
  const L=[
    // 以安（AA_179）
    {id:'an_lib',who:'heroine_01',term:'Y2S1',w:[1,6],msg:['今天在總圖嗎？'],reply:'在。三樓。',resp:['好。我帶兩本。一本給你。']},
    {id:'an_rules',who:'heroine_01',term:'Y2S1',w:[7,9],tie:true,cond:G=>att(G,'public_law_group'),msg:['讀書會的規則，我寫了一頁。幫我看哪一條可以刪。'],reply:'第五條。',resp:['……我也覺得是第五條。']},
    {id:'an_admin',who:'heroine_01',term:'Y2S1',w:[12,14],tie:true,msg:['駁回的公文，要先看哪一段？我想先自己看懂。'],reply:'先看理由，再看最後寫期限的那一段。',resp:['理由、期限。好，我寫進理由欄。']},
    {id:'an_moot',who:'heroine_01',term:'Y2S2',w:[3,6],tie:true,cond:NOT_YET,msg:['分工表第二版。你的格子我畫大了一點。'],reply:'為什麼？',resp:['因為你寫得最慢。……我是說，最仔細。']},
    {id:'an_lead',who:'heroine_01',term:'Y2S2',w:[10,14],cond:G=>att(G,'public_law_group'),msg:['這週讀書會換你帶，可以嗎？'],reply:'好。',resp:['謝謝。我想試試看坐在下面。']},
    // 語彤（AA_179）
    {id:'yt_auntie',who:'heroine_03',term:'Y2S1',w:[1,18],every:4,cond:noodle,msg:['阿姨問你週四來不來。'],reply:'來。',resp:['嗯。她會多切一顆滷蛋。']},
    {id:'yt_fafu',who:'heroine_03',term:'Y2S1',w:[2,2],tie:true,msg:['法服的初談，社會系可以去嗎？'],reply:'可以。妳很適合。',resp:['……嗯。我週六去看看。']},
    {id:'yt_floor',who:'heroine_03',term:'Y2S1',w:[8,9],msg:['期中考你在總圖哪一層？我想找一個不會遇到麵店客人的地方。'],reply:'四樓。最裡面。',resp:['好。……不要跟阿姨說。']},
    {id:'yt_rent',who:'heroine_03',term:'Y2S2',w:[10,12],tie:true,cond:G=>done(G,'ev_yutong_landlord')||!!F(G).RENT_RUMOR,msg:['房東的朋友又來了。……沒事，只是跟你說一聲。'],reply:'要不要我陪阿姨去法服？',resp:['……我再想想。']},
    {id:'yt_dish',who:'heroine_03',term:'Y2S2',w:[15,17],tie:true,cond:NOT_YET,msg:['阿姨說你上次洗的碗還有油。'],reply:'下次我洗兩次。',resp:['……嗯。']},
    // 阿哲（AA_179）
    {id:'zhe_book',who:'zhe',term:'Y2S1',w:[1,4],msg:['債總的課本借我。我的還在學長那。'],reply:'拿去。',resp:['讚。我請你一碗大的。']},
    {id:'zhe_notes',who:'zhe',term:'Y2S1',w:[9,10],tie:true,msg:['民法借我。筆記。全部。'],reply:'好。週四麵店拿。',resp:['你是神。']},
    {id:'zhe_score',who:'zhe',term:'Y2S1',w:[13,14],tie:true,msg:['週六系籃缺一個記分的。你會加減吧？'],reply:'會。',resp:['那就是你了。不准跑。']},
    {id:'zhe_deposit',who:'zhe',term:'Y2S2',w:[3,4],tie:true,msg:['房東說押金要扣一半。……我週二麵店問你。'],reply:'好。帶租約。',resp:['租約？……我找找。']},
    {id:'zhe_final',who:'zhe',term:'Y2S2',w:[14,16],msg:['期末一起讀？我負責滷味，你負責不要讓我睡著。'],reply:'好。',resp:['成交。']},
    // 小語（AA_179）
    {id:'yu_expo',who:'yu',term:'Y2S1',w:[2,3],tie:true,msg:['社團博覽會你站哪一攤？我要去偷看。'],reply:'妳來就知道。',resp:['好神秘。我帶阿哲去。']},
    {id:'yu_overtime',who:'yu',term:'Y2S1',w:[6,8],msg:['欸，打工的地方不給加班費，這樣可以嗎？我同學問的。'],reply:'我不能幫她判斷。叫她去問法服，或打勞工局的專線。',resp:['……你好像學姊喔。好啦，我叫她去。']},
    {id:'yu_gift',who:'yu',term:'Y2S1',w:[16,17],tie:true,cond:NOT_YET,msg:['聖誕禮物，阿哲跟我買了一樣的。你不准笑。'],reply:'我沒笑。',resp:['你一定在笑。']},
    {id:'yu_clubs',who:'yu',term:'Y2S2',w:[1,3],msg:['這學期我只剩兩個社團了。你猜我退了哪一個？'],reply:'猜不到。',resp:['我退了最不想退的那個。……因為要念書了。']},
    {id:'yu_exam',who:'yu',term:'Y2S2',w:[12,14],msg:['司法官的考古題，你覺得大二開始看會太早嗎？'],reply:'不會。',resp:['好。那我開始了。……不要跟阿哲說，他會說我瘋了。']},
    // 柏翰（AA_179）
    {id:'bh_handover',who:'classmate_bohan',term:'Y2S1',w:[1,3],tie:true,cond:lawclub,msg:['社長交接的資料有一百頁。你幫我看第一章就好。'],reply:'好。',resp:['……謝謝。我以為社長只要會排值班表。']},
    {id:'bh_q3',who:'classmate_bohan',term:'Y2S1',w:[6,8],tie:true,msg:['刑分考古題第三題，你寫哪一說？'],reply:'兩說都寫。',resp:['……考試時間不夠。']},
    {id:'bh_score',who:'classmate_bohan',term:'Y2S1',w:[11,13],tie:true,cond:G=>F(G).BOHAN_GROUP==='ask',msg:['你上次說分數不夠的人。我還在想。'],reply:'想到了跟我說。',resp:['嗯。']},
    {id:'bh_moot',who:'classmate_bohan',term:'Y2S2',w:[7,9],tie:true,cond:NOT_YET,msg:['模 3 那天我講話太衝。……沒事。'],reply:'我知道。',resp:['嗯。……下次我先聽以安講完。']},
    {id:'bh_final',who:'classmate_bohan',term:'Y2S2',w:[16,17],msg:['期末的考古題整理好了。要的話自己拿，不用跟我說謝謝。'],reply:'謝謝。',resp:['……我說不用。']},
    // 芯慈（AA_179）
    {id:'xc_econ',who:'classmate_xinci',term:'Y2S1',w:[2,4],tie:true,cond:G=>!!F(G).ECON_TOGETHER,msg:['經濟那邊，這學期你還陪我看嗎？'],reply:'好。',resp:['那週三總圖。']},
    {id:'xc_contract',who:'classmate_xinci',term:'Y2S1',w:[10,12],msg:['幫我看一下這份打工的合約。我朋友要簽的。'],reply:'我只能說我看到什麼。要問的話去法服。',resp:['……法律系的人都這樣講話嗎。好啦。']},
    {id:'xc_drama',who:'classmate_xinci',term:'Y2S1',w:[14,16],tie:true,cond:NOT_YET,msg:['那部劇大結局了。你不准爆雷。'],reply:'我沒看。',resp:['那最好。']},
    {id:'xc_grade',who:'classmate_xinci',term:'Y2S2',w:[5,7],tie:true,msg:['這次期中，我不想先看以安的成績。你幫我記著。'],reply:'好。',resp:['如果我問你，你就說你忘了。']},
    {id:'xc_moot',who:'classmate_xinci',term:'Y2S2',w:[11,13],tie:true,cond:NOT_YET,msg:['模擬法庭，你們隊比我們多準備了什麼？'],reply:'我們去問了一個人。',resp:['……下次我也去問。']},
    // 芷若（BB_97 11-1：整年只有這一則、反過來問他「你想」；沒回不提起）
    {id:'zr_beans',who:'heroine_02',term:'Y2S1',w:[15,17],tie:true,cond:NOT_YET,msg:['新的豆子。你想喝喝看嗎？'],reply:'想。',resp:['……你很少說『想』。週四來。']},   /* Café 常客；Z7 之後（Z7 做好再接）*/
    // 子晴（BB_97 11-1）
    {id:'zq_game',who:'heroine_04',term:'Y2S1',w:[1,3],msg:['測試我的遊戲。現在。','……這不是問句。'],reply:'好。連結呢？',resp:['已經傳了。第三關不准跳過。']},
    {id:'zq_dad',who:'heroine_04',term:'Y2S1',w:[11,12],tie:true,msg:['欸不是','我爸下週要來台北','他說要看我做的遊戲'],reply:'他會喜歡的。',resp:['你又不認識他。……好啦。謝謝。']},
    {id:'zq_name',who:'heroine_04',term:'Y2S2',w:[6,8],msg:['幫我的新遊戲想一個名字。','不要太好聽。'],reply:'『存檔點』。',resp:['……好爛。我要用。']},
    {id:'zq_song',who:'heroine_04',term:'Y2S2',w:[11,13],tie:true,cond:G=>!!F(G).INVITED_CLUB,msg:['成發那首歌的第四句寫不出來。','給我一個詞。'],reply:'『重來』。',resp:['……可以。這個可以。']},
    // 學姊（BB_97 11-1；大二下第 15 週畢業後照碩一）
    {id:'sis_duty',who:'heroine_05',term:'Y2S1',w:[2,4],tie:true,cond:lawclub,msg:['法服週六缺人。單週，上午。你可以嗎？'],reply:'可以。',resp:['好。兩件事：一，帶筆。二，不要給結論，記下來就好。']},
    {id:'sis_typo',who:'heroine_05',term:'Y2S1',w:[9,11],tie:true,msg:['推甄的資料，幫我看錯字。只看錯字，不要看內容。'],reply:'第二頁第三行。',resp:['……謝謝。內容你也不准記得。']},
    {id:'sis_list',who:'heroine_05',term:'Y2S2',w:[1,3],msg:['家族的學弟妹名單，幫我核一次。交出去以前，我想確定沒有漏掉誰。'],reply:'沒有漏。',resp:['好。……那我放心交了。']},
    {id:'sis_report',who:'heroine_05',term:'Y2S2',w:[16,18],tie:true,cond:G=>lawclub(G)&&!!F(G).RENT_CONSULTATION,msg:['碩一第一份報告想寫租約。法服那個阿姨的案子，我可以拿來當例子嗎？匿名。'],reply:'先問阿姨。',resp:['……對。先問當事人。你學會了。']},
    // 沛珊（BB_97 11-1）
    {id:'ps_q',who:'classmate_peishan',term:'Y2S1',w:[2,4],tie:true,msg:['讀書會這週的題目，你可以幫我出一題嗎？我出的都太簡單。'],reply:'好。我出一題難的。',resp:['謝謝。……不要難到大家想退出。']},
    {id:'ps_plan',who:'classmate_peishan',term:'Y2S1',w:[6,8],tie:true,cond:G=>done(G,'ev_peishan_decision'),msg:['重考的讀書計畫，我排到明年七月。','……你覺得我瘋了嗎？'],reply:'沒有。',resp:['好。那我就照這個走。']},
    {id:'ps_notes',who:'classmate_peishan',term:'Y2S2',w:[1,1],tie:true,cond:G=>!!F(G).STUDYGROUP_LEADER,msg:['讀書會的交接筆記，我放在萬才館櫃子的第二格。'],reply:'收到。',resp:['……謝謝你接住。']},
    {id:'ps_kids',who:'classmate_peishan',term:'Y2S2',w:[9,11],msg:['課輔班的小孩問我：法律是不是都在規定不准做什麼。我要怎麼回答？'],reply:'說規定也有在保護他。',resp:['……我改成小學生聽得懂的版本。']},
    // 明軒（BB_97 11-1）
    {id:'mx_tutor',who:'classmate_mingxuan',term:'Y2S1',w:[3,5],tie:true,cond:G=>!!F(G).JOB_TUTOR,msg:['家教那家的媽媽問你下學期還來不來 😂'],reply:'會。',resp:['好 我跟她說 👍 你教得比我好 不要傳出去']},
    {id:'mx_toefl',who:'classmate_mingxuan',term:'Y2S1',w:[9,11],msg:['托福作文題目：規則應該為了多數人嗎 🤔 你會怎麼開頭'],reply:'先問：哪一個少數。',resp:['這個開頭會被扣分 哈哈 可是我要用']},
    {id:'mx_seat',who:'classmate_mingxuan',term:'Y2S2',w:[3,4],tie:true,msg:['交換說明會週四中午 幫我佔第一排 我下課跑過去 🏃'],reply:'好。',resp:['以安說她也要坐第一排 那第一排不夠了 😂']},
    {id:'mx_form',who:'classmate_mingxuan',term:'Y2S2',w:[15,17],tie:true,msg:['交換的志願表 我第一志願改了三次 😂 你明年會填嗎'],reply:'還不知道。',resp:['不知道也是一種答案 👍']},
    // 阿凱（BB_97 11-1）
    {id:'kai_net',who:'kai',term:'Y2S1',w:[1,3],tie:true,msg:['所以新宿舍網路爛到不行 你那邊呢'],reply:'還好。',resp:['所以週日我去你那邊打報告 我帶滷味']},
    {id:'kai_bot',who:'kai',term:'Y2S1',w:[8,10],tie:true,msg:['所以我寫了一個會回答法律問題的聊天機器人 你幫我測'],reply:'它不能給法律結論。',resp:['所以我加一句 請去問法服 這樣可以嗎']},
    {id:'kai_kb',who:'kai',term:'Y2S2',w:[5,7],tie:true,msg:['所以網拍那把鍵盤又壞一顆 是Enter'],reply:'換一個賣家吧。',resp:['不要 我跟那個阿伯有感情了']},
    // 方奕廷（BB_97 11-1）
    {id:'fy_plant',who:'npc_fangyt',term:'Y2S1',w:[3,5],tie:true,cond:G=>!!F(G).POTHOS,msg:['📷 Epipremnum aureum，黃金葛。','你那盆還活著嗎？'],reply:'活著。',resp:['好。它不會長不好。……我只是想確認。']},
    {id:'fy_quiet',who:'npc_fangyt',term:'Y2S1',w:[12,14],msg:['期末想找一個安靜的地方讀書。你知道哪裡沒有人嗎？'],reply:'總圖五樓最裡面。',resp:['……那裡有你。算了，也可以。']},
    {id:'fy_sign',who:'npc_fangyt',term:'Y2S2',w:[9,11],tie:true,msg:['📷（一塊牌子「私人土地，禁止進入」）','這條山路，是真的不能走嗎？'],reply:'我不能幫你判斷。繞路最保險。',resp:['……好。繞路比較遠，可是會看到別的樹。']},
    // 可昕（BB_97 11-1；只有交往中、只放「請他幫忙」的）
    {id:'kx_example',who:'kexin',term:'Y2S1',w:[4,6],tie:true,anyone:true,cond:G=>!!F(G).dating_kexin,msg:['物權報告要一個『好笑但是對的』例子。借我一個。'],reply:'鄰居的樹長過來，掉下來的果子算誰的？',resp:['……這個好。答案我自己查。']},
    {id:'kx_yule',who:'kexin',term:'Y2S2',w:[2,4],anyone:true,cond:G=>!!F(G).dating_kexin,msg:['予樂的生日要辦驚喜。我負責騙她出門，你負責想一個理由。'],reply:'說要陪妳去配眼鏡。',resp:['……太合理了。她一定會來。']},
    {id:'kx_cv',who:'kexin',term:'Y2S2',w:[6,8],tie:true,anyone:true,cond:G=>!!F(G).dating_kexin,msg:['暑假實習的履歷，幫我挑錯字。其他的不准有意見。'],reply:'第一行，『學系』打成『學習』。',resp:['……我已經寄出去三家了。']} ];
  /* 沒回的那一句（下一次見面，兩週內第一次和他說話；同一個人兩週最多一次）。芷若沒有（她就不再問了）*/
  const MISS={heroine_01:['你上週很忙？……沒關係，理由欄我先空著。'],heroine_03:['阿姨上週問了你三次。……我說你很忙。'],zhe:['你上週很忙齁。'],yu:['欸，你上週沒回我。我原諒你。這次。'],
    classmate_bohan:['上週那個……算了，我自己查到了。'],classmate_xinci:['上週的訊息你沒回。……我自己決定了。'],heroine_04:['欸不是，你上週沒回。','……好啦，遊戲我自己測完了。'],
    heroine_05:['一，你上週沒回。二，沒關係，我找到人了。'],classmate_peishan:['上週那個……沒關係。我自己想了一半。'],classmate_mingxuan:['你上週很忙齁 哈哈 沒事 我自己搞定了 👍'],
    kai:['所以上週那個不重要啦 好啦有一點重要'],npc_fangyt:['上週沒訊號？……我也常常沒有。'],kexin:['你上週沒回。……我就當你在認真念書。']};
  return {list:L,miss:MISS};
})();
