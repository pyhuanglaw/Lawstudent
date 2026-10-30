/* ===== 1B 大二～大三上的人物事件（AA_316 1B-01～07、AA_321 1B-08～11；AA-C 定稿，第②級，台詞照原文、不改字）=====
   這裡是用事件系統演的段落（出遊、人在場景裡碰到的、下課後）；手機、時間窗、明信片、法服 5/22、債各第 6 週的課堂段、沛珊在 src/y2b3d.js。
   1B-01 ev_kexin_bad_exam（出遊：政大宿舍樓下 11/19 20:30）　1B-02 ev_yt_lease_text（債各第 6 週下課後傳訊息；課堂段在 y2b3d.js）
   1B-03 ev_yt_aunt_retell（不在場：之後第一次在麵店或總圖和語彤說話；在場版在 y2b3d.js 的法服 5/22）　1B-04 ev_an_mother_map（麵店）
   1B-05 ev_ziqing_dad_visit（公館騎樓＋河堤）、ev_ziqing_dad_sorry（選了「一定會懂」：兩週內吉他社社課）　1B-06 ev_zhiruo_last_shift（Café 6/3）
   1B-07 ev_kexin_two_circles（出遊：麵店 3/25 18:00）　1B-08 ev_yt_ta_news／ev_yt_ta_news_lib（13b）、ev_yt_umbrella_y3（事件 12）
   1B-09 ev_ziqing_capstone（Café 11/9）　1B-10 ev_zhiruo_xmas_video（和芷若交往：12/25 視訊；明信片在 y2b3d.js）、ev_zhiruo_bday_video（9/28 她的生日，打過去的視訊；AA_336 B6）
   1B-11 ev_peishan_back_call（沛珊回來：2027-08-07 21:00 她打來，AA_296 2-3-1 ④；排在 y2b3d.js S.psBackPhone）
   CG（BCG-02、BCG-15、CG-6）：圖在企劃分支 cg_approved/，開發分支還沒登錄（CG_REGISTRY 沒有就不放，照原背景演；MISSING_EXTERNAL_ART.md）。測試：node tests/y2b_events_unit.js */
'use strict';
const Y2B_EVENTS=(function(){
  const D=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const has=(id,tag)=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(id,tag);
  const knows=(id,G)=>typeof STORY!=='undefined'&&!!STORY.knows&&STORY.knows(id,G);
  const done=(G,id)=>!!(G.events&&G.events.done&&G.events.done[id]);
  const dating=(G,id)=>{ const F=(G&&G.flags)||{}, R=F.romance||{}; return F['dating_'+id]===true||!!(R[id]&&R[id].status==='dating'); };
  const LOVE=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan','kexin'];
  const datingOther=(G,id)=>LOVE.filter(x=>x!==id&&dating(G,x));
  /* 「她知道祐廷和別人交往」：可昕看 ROM.knowsGF，其他人看 ROM.knowsOf（BB_191 第 9 節）*/
  const knowsOther=(G,id)=>typeof ROM!=='undefined'&&datingOther(G,id).some(p=>p==='kexin'?(ROM.knowsGF&&ROM.knowsGF(G,id)):(ROM.knowsOf&&ROM.knowsOf(G,id,p)));
  const hasCG=id=>typeof CG_REGISTRY!=='undefined'&&!!CG_REGISTRY[id];
  const at=(G,key,h0,h1)=>{ const d=D(key), hh=((G.hour%24)+24)%24; return d!=null&&G.day===d&&hh>=h0&&hh<h1; };
  const toH=h=>G=>{ const hh=((G.hour%24)+24)%24; return h>hh?h-hh+1e-6:0; };   /* advance：跳到當天的某個時間（已經過了就不動）*/
  const Q6=G=>done(G,'ev_ziqing_secret_game')||has('heroine_04','PLAYTESTED');   /* 看過 Q6（Q8b 還沒做，同 story3d.js 的期末飯）*/

  /* ---- 1B-01 可昕 K10c「她第一次考壞一科」（AA_316；BB_97 9-4、AA_177 第 8 節②）：11/19 20:30 政大自強十舍樓下的長椅 ---- */
  const BAD_EXAM={ id:'ev_kexin_bad_exam', title:'她第一次考壞一科', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:2/3, kxAway:true,
    dialogue:[ {scene:'政大・宿舍樓下',bg:'nccu_dorm'},
      {speaker:null,text:'（她坐在長椅上，膝蓋上攤著物權的課本。看到你，把課本闔起來一半。）'},
      {speaker:'kexin',expression:'surprised',text:'你真的來了。'},
      {speaker:'kexin',expression:'serious',text:'先說好，你一安慰我就回去。'},
      {choice:[{text:'「我幫妳出題，答對才吃宵夜。」',set:{KX_BAD_EXAM:'quiz'},goto:'q'},{text:'「我陪妳把那一章再讀一次。」',set:{KX_BAD_EXAM:'study'},goto:'s'},{text:'「沒關係。物權又不會跑。它有一半是不動產。」',set:{KX_BAD_EXAM:'joke'},goto:'j'}]},
      {label:'q'},{speaker:'kexin',expression:'smile',text:'……好。出難一點。'},{goto:'end'},
      {label:'s'},{speaker:'kexin',expression:'neutral',text:'好。'},{speaker:null,text:'（她停了一下）'},{speaker:'kexin',expression:'teasing',text:'你不要先翻答案。'},{goto:'end'},
      {label:'j'},{speaker:null,text:'（她沒笑。三秒後，笑了。）'},{speaker:'kexin',expression:'smile',text:'……好。我收下。'},
      {label:'end'},{advance:toH(21.5)},
      {speaker:null,text:'（九點半。她把課本收進包包，站起來。）'},
      {speaker:'kexin',expression:'smile',text:'好了。你回去開車小心。'},
      {speaker:'kexin',expression:'smile',text:'……今天這樣剛好。'} ],   /* AA_316（2026-10-21 AA-C）：原「……謝謝你沒有安慰我。」是口氣表 0-3 的模板句 */
    consequences:{mem:[{npc:'kexin',tag:'HELPED',note:'物權考壞那晚'}]},
    /* 答應了但沒到：20:50 兩則、記 'self'（之後不追問，不扣分）；11/22 那則由 y2b3d.js 照 'self' 發 */
    outingMissed:(G)=>{ if(!G.flags.KX_BAD_EXAM) G.flags.KX_BAD_EXAM='self'; const d=D('2026-11-19'); if(typeof PHONE!=='undefined'&&d!=null) PHONE.at(G,d,20+50/60,[{th:'p:kexin',from:'kexin',text:'……你沒來。'},{th:'p:kexin',from:'kexin',text:'沒關係。我自己讀。'}],'y2_kx_bad_missed'); } };

  /* ---- 1B-02 語彤事件 8「買賣不破租賃」：下課後（手機，要有她的聯絡方式；課堂那一段在 y2b3d.js，演過記 Y2B_LEASE_DAY）---- */
  const LEASE_TEXT={ id:'ev_yt_lease_text', title:'買賣不破租賃', participants:[], location:'any', trigger:'manual', afterClass:'oblig_spec', classFirst:true, once:true, term:['Y2S2'], weeks:[6], background:'blur',
    prereq:{custom:G=>G.flags.Y2B_LEASE_DAY===G.day&&knows('heroine_03',G)&&typeof INV!=='undefined'&&INV.hasContact(G,'heroine_03')},
    dialogue:[ {choice:[{text:'（傳訊息給語彤）',goto:'send'},{text:'（不傳）',end:true}]},
      {label:'send'},
      {if:{memory:[{npc:'heroine_03',tag:'RENT_RUMOR'}]},phoneMe:'heroine_03',text:'阿姨的租約還有多久？'},
      {unless:{memory:[{npc:'heroine_03',tag:'RENT_RUMOR'}]},phoneMe:'heroine_03',text:'妳剛剛一直在寫筆記。阿姨的店，是不是也有這種事？'},
      {phone:'heroine_03',text:'兩年'},
      {if:{memory:[{npc:'heroine_03',tag:'RENT_RUMOR'}]},phone:'heroine_03',text:'你也在想剛剛那一條？'},
      {unless:{memory:[{npc:'heroine_03',tag:'RENT_RUMOR'}]},phone:'heroine_03',text:'……房東想把整棟賣掉。還沒確定。'},
      {if:{custom:G=>(+G.flags.WZ_COPY_LEASE||0)>=2},speaker:null,text:'（你想起阿德那封信。學長第一個問的，是租約寫了幾年。）'},   /* AA_420 3-4：陪阿德去過法服（線一 1-3，src/wzlines3d.js）*/
      {speaker:null,text:'（你傳了一張課本那一頁的照片。）'},
      {unless:{memory:[{npc:'heroine_03',tag:'RENT_RUMOR'}]},mem:[{npc:'heroine_03',tag:'RENT_RUMOR',note:'她說房東想把整棟賣掉'}]},   /* 沒有的這時候補上（她說了）*/
      {set:{YT_LEASE_HELP:true},stamp:['YT_LEASE_TEXT_DAY'],mem:[{npc:'heroine_03',tag:'LAW_MEETS_LIFE',note:'債各第 6 週'}]} ] };   /* YT_LEASE_TEXT_DAY：當天 21:30 那兩則（y2b3d.js）*/

  /* ---- 1B-03 語彤事件 9「陪阿姨來」不在場版：之後第一次在麵店或總圖和語彤說話（5/22 中午以後～6/13）；在場版在 y2b3d.js ---- */
  const AUNT_RETELL={ id:'ev_yt_aunt_retell', title:'陪阿姨來', participants:['heroine_03'], location:['noodle','library','library_hall'], trigger:'interact', priority:9, once:true, background:'blur',
    prereq:{custom:G=>{ const a=D('2027-05-22'), b=D('2027-06-13'); return a!=null&&b!=null&&(G.day>a||(G.day===a&&G.hour>=12))&&G.day<=b&&!done(G,'ev_yt_aunt_consult')&&!has('heroine_03','RENT_CONSULTATION')&&knows('heroine_03',G); }},
    dialogue:[ {speaker:'heroine_03',text:'上次我陪阿姨去法服。'},   /* AA_375 第 9 項：三週後還說「禮拜六」不對 */
      {speaker:'heroine_03',text:'裡面的人說，租約到期以前，他不能趕我們。'},
      {speaker:'heroine_03',text:'阿姨出來的時候在笑。'},
      {if:{custom:G=>dating(G,'heroine_03')},speaker:'heroine_03',text:'那時候很想打給你。後來沒打，阿姨在旁邊。'},
      {if:{memory:[{npc:'heroine_03',tag:'LAW_MEETS_LIFE'}]},speaker:'heroine_03',text:'就是你那天傳的那一頁。'},
      {mem:[{npc:'heroine_03',tag:'RENT_CONSULTATION',note:''}]} ] };

  const anAdminHeard=G=>!!(G.needed&&G.needed.shown&&G.needed.shown.an_admin!=null);   /* 大二上「這週的訊息」an_admin 發過＝聽過（story3d.js 的 S.neededRules 記 shown；AA_375 第 17 項）*/
  /* ---- 1B-04 以安新 12「媽媽的晚餐（二）」：大二下第 10～14 週，第一個週二或週四晚上的麵店（週四 20:00 她有公法讀書會：只到 19:30）---- */
  const MOTHER_MAP={ id:'ev_an_mother_map', title:'媽媽的晚餐（二）', participants:['heroine_01'], location:'noodle', trigger:'auto', once:true, term:['Y2S2'], weeks:[10,11,12,13,14], weekday:[2,4], time:[17.5,20.5], background:'blur',
    prereq:{stage:{npc:'heroine_01',min:'FAMILIAR'},custom:G=>knows('heroine_01',G)&&!(G.weekday===4&&((G.hour%24)+24)%24>=19.5)},
    dialogue:[ {unless:{flags:['AN_TUTOR_FAMILY']},if:{custom:G=>!anAdminHeard(G)},speaker:'heroine_01',text:'我家教的學生，家裡申請的補助被駁回了。我在幫他們看那份公文。'},
      {unless:{flags:['AN_TUTOR_FAMILY']},if:{custom:anAdminHeard},speaker:'heroine_01',text:'上次那份公文，你還記得嗎？我後來陪他們寫了申覆。'},   /* AA_375 第 17 項：大二上 an_admin 發過的（聽過）不再當新消息講 */
      {set:{AN_TUTOR_FAMILY:1}},
      {speaker:'heroine_01',text:'我寫了一頁流程，用白話寫的。拿給我媽看。'},
      {speaker:'heroine_01',text:'我媽說，我寫的是地圖，不是答案。'},
      {speaker:null,text:'（她停了一下。）'},
      {speaker:'heroine_01',text:'……她說這樣很好。'},
      {choice:[{text:'「地圖也很難畫。」',set:{AN_MAP:'hard'},goto:'h'},{text:'「妳媽媽說得對。」',set:{AN_MAP:'right'},goto:'r'},{text:'「那答案誰給？」',set:{AN_MAP:'who'},goto:'w'}]},
      {label:'h'},{speaker:'heroine_01',text:'嗯。畫錯一條路，人家就走錯。'},{goto:'end'},
      {label:'r'},{speaker:'heroine_01',text:'她常常對。很煩。'},{speaker:null,text:'（她笑了。）'},{goto:'end'},
      {label:'w'},{speaker:'heroine_01',text:'機關跟法院。還有他們自己。'},
      {label:'end'},{if:{custom:G=>dating(G,'heroine_01')},speaker:'heroine_01',text:'你不要跟我媽說我說她很煩。'},
      {mem:[{npc:'heroine_01',tag:'TALKED_FAMILY',note:'媽媽說地圖不是答案'}]} ] };

  /* ---- 1B-05 子晴 Q8「爸爸來了」：大二下第 13～14 週平日 22:00～23:00，人在公館；FRIEND 以上、看過 Q6 ---- */
  const DAD_VISIT={ id:'ev_ziqing_dad_visit', title:'爸爸來了', participants:['heroine_04'], location:'gongguan', trigger:'auto', once:true, term:['Y2S2'], weeks:[13,14], weekday:[1,2,3,4,5], time:[22,23], background:'blur',
    prereq:{stage:{npc:'heroine_04',min:'FRIEND'},custom:G=>Q6(G)},
    dialogue:[ {speaker:null,text:'（公館的騎樓下，子晴和一個穿西裝的中年男人站在一起。兩個人都不太會開口。）'},
      {speaker:null,text:'（男人說了一句話，有點笨拙地攔了一台計程車，走了。）'},
      {speaker:null,text:'（她站在原地，看到你。）'},
      {speaker:'heroine_04',text:'……你都看到了。'},
      {speaker:'heroine_04',text:'陪我走一下。河堤。'},
      {scene:'河濱',bg:'riverside'},
      {if:{custom:()=>hasCG('cg_riverbank_heroine04')},cg:'cg_riverbank_heroine04'},   /* BCG-02（企劃分支 cg_approved/，還沒登錄）*/
      {speaker:'heroine_04',text:'他說：「妳在做遊戲？……做好了，給我玩。」'},
      {speaker:'heroine_04',text:'我五歲的時候，他會陪我打電動。他很爛。每次都輸我。'},
      {speaker:'heroine_04',text:'後來他很忙，就沒有再打了。'},
      {speaker:'heroine_04',text:'……我在做一個遊戲。不是那隻貓。'},
      {speaker:'heroine_04',text:'一個小孩，每天晚上等一個人回家，一起打一場。'},
      {speaker:'heroine_04',text:'做了一年半，還沒做完。'},
      {speaker:'heroine_04',text:'做完就要給他看。……我好怕他玩了說不好玩。'},
      {choice:[{text:'「做完了，可以不給他看。」',mem:[{npc:'heroine_04',tag:'SHARED_SECRET',note:'河堤那晚，她說了爸爸和那個遊戲'}],goto:'a'},
        {text:'「我想玩玩看。」',set:{TESTER:true},mem:[{npc:'heroine_04',tag:'SHARED_SECRET',note:'河堤那晚，她說了爸爸和那個遊戲'}],goto:'b'},
        {text:'「妳很有天分。他一定會懂。」',consequences:{stamp:['ZQ_DAD_ARGUED_DAY']},mem:[{npc:'heroine_04',tag:'ARGUED',note:'河堤那晚，你說「他一定會懂」'}],goto:'c'}]},
      {label:'a'},{speaker:null,text:'（她停下來。）'},{speaker:'heroine_04',text:'……可以嗎？'},{speaker:'player',text:'可以。'},{speaker:'heroine_04',text:'……欸不是，你好會講話。'},{speaker:null,text:'（她的語氣回來了。）'},{goto:'end'},
      {label:'b'},{speaker:'heroine_04',text:'不行。還沒做完。'},{speaker:null,text:'（很久以後）'},{speaker:'heroine_04',text:'……做完，你們先幫我測。阿凱抓 bug，你抓劇情的漏洞。測完，再給他。'},{goto:'end'},
      {label:'c'},{speaker:null,text:'（她轉過來。）'},{speaker:'heroine_04',text:'……『一定會』。'},{speaker:null,text:'（她把耳機戴上。那天沒有再說話。）'},
      {label:'end'},{speaker:null,text:'（你們走到河堤的盡頭，又走回來。她的耳機一直掛在脖子上。）'},
      {set:{ZQ_DAD_HEARD:true}} ] };
  /* 選「他一定會懂」：兩週內在吉他社社課遇到她，她先說（classes3d.js 的 clubEvent：clubEvent:'club_guitar'）*/
  const DAD_SORRY={ id:'ev_ziqing_dad_sorry', title:'那天', participants:['heroine_04'], location:'any', trigger:'manual', clubEvent:'club_guitar', once:true, background:'blur',
    prereq:{custom:G=>{ const d=G.flags.ZQ_DAD_ARGUED_DAY; return typeof d==='number'&&G.day>d&&G.day-d<=14; }},
    dialogue:[ {speaker:'heroine_04',text:'我那天很兇。……但你不要再說『一定』。'} ] };

  /* ---- 1B-06 芷若 Z9「最後一個班」：2027-06-03（四）21:00～22:00 兩點半 Café；FAMILIAR 以上 ---- */
  const LAST_SHIFT={ id:'ev_zhiruo_last_shift', title:'最後一個班', participants:['heroine_02'], location:'cafe', trigger:'auto', once:true, background:'blur',
    prereq:{stage:{npc:'heroine_02',min:'FAMILIAR'},custom:G=>at(G,'2027-06-03',21,22)},
    dialogue:[ {if:{custom:G=>!done(G,'ev_zhiruo_applied')&&!done(G,'ev_zhiruo_admitted')},speaker:'heroine_02',text:'我下學期要去英國。……現在你知道了。'},   /* 不知道她要出國（Z7、Z8 都沒有）*/
      {if:{flagNum:{CAFE_VISITS:{min:3}}},speaker:'heroine_02',text:'（對新店員）這位是法律系的。老樣子。'},
      {if:{flagNum:{CAFE_VISITS:{min:3}}},speaker:'heroine_02',text:'（對祐廷）我教她了。你的點法。'},
      {unless:{flagNum:{CAFE_VISITS:{min:3}}},speaker:'heroine_02',text:'（對新店員）這位是法律系的。他點什麼，問他。'},
      {if:{custom:G=>!dating(G,'heroine_02')&&datingOther(G,'heroine_02').length>0},goto:'gf'},   /* BB_97 3-6「交往中的玩家」＝祐廷在和別人交往（AA_338 第 0 節更正 AA_336 B2）：一疊票根給常客，不單獨給他；和芷若交往中、單身＝主版（只給他一張） */
      {if:{custom:()=>hasCG('cg_last_shift_heroine02')},cg:'cg_last_shift_heroine02'},   /* BCG-15（企劃分支 cg_approved/，還沒登錄；交往中不放）*/
      {speaker:'heroine_02',text:'（從包包拿出一張電影票根）幫我做一件事。'},
      {speaker:'heroine_02',text:'我不在的時候，去看一部電影。'},
      {speaker:'heroine_02',text:'看完，寫一句話給我。一句就好。'},
      {if:{memory:[{npc:'heroine_02',tag:'ASKED_HER_DRINK'}]},speaker:'heroine_02',text:'……我的那杯，我沒有教她。'},
      {goto:'close'},
      {label:'gf'},{speaker:null,text:'（她從圍裙口袋拿出一疊電影票根。）'},
      {speaker:'heroine_02',text:'常客一人一張。我不在的時候，去看一部電影。看完寫一句話，寄到店裡。我會回。'},
      {label:'close'},{advance:toH(22)},
      {speaker:null,text:'（十點。她把圍裙摺好，放進櫃台下面的抽屜。）'},
      {speaker:'heroine_02',text:'九月二號。……我會寫。'},
      {choice:[{text:'「我會去看。」',goto:'o1'},{text:'「妳要寫什麼？」',goto:'o2'}]},
      {label:'o1'},{speaker:'heroine_02',text:'嗯。看完再說。'},{goto:'fin'},
      {label:'o2'},{speaker:'heroine_02',text:'到了再想。……你先想你的那一句。'},
      {label:'fin'},{set:{ZR_LAST_SHIFT:'seen'},mem:[{npc:'heroine_02',tag:'TICKET_STUB',note:'最後一個班，她給的電影票根'}]} ] };

  /* ---- 1B-07 可昕 K12「兩邊的朋友第一次一起吃飯」：2027-03-25（四）18:00 阿鳳麵店（出遊；3/21 21:00 的邀約答應了才有）---- */
  const yuBh=G=>knows('yu',G)&&knows('classmate_bohan',G);   /* AA_375 第 15 項：Alison 拉著柏翰去讀書會（兩個都在場）*/
  const TWO_CIRCLES={ id:'ev_kexin_two_circles', title:'兩邊的朋友', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.25,
    dialogue:[ {scene:'阿鳳麵店',bg:'noodle_table'},
      {if:{flags:['KX_MET_NOODLE_TEAM']},speaker:'kexin',expression:'smile',text:'上次是烤肉，這次是麵。'},
      {unless:{flags:['KX_MET_NOODLE_TEAM']},speaker:'kexin',expression:'surprised',text:'你們就是麵店團？我聽了一年半。'},
      {if:{flagIs:{KX_INTRO:'gf'}},goto:'yl'},   /* K3 已經說了「我女朋友」：大家已經知道，不另外介紹 */
      {choice:[{text:'「這是可昕。我女朋友。」',set:{KX_CIRCLES_INTRO:'gf'},goto:'ig'},{text:'「這是可昕，政大法律。」',set:{KX_CIRCLES_INTRO:'school'},goto:'is'}]},
      {label:'ig'},{speaker:'zhe',text:'……喔。'},{if:{custom:G=>knows('yu',G)},speaker:'yu',text:'你都不講！'},{goto:'yl'},
      {label:'is'},{speaker:null,text:'（可昕看了你一眼，沒說什麼。）'},
      {label:'yl'},
      {if:{flagIs:{YL_IMPRESSION:['funny','honest','polite']}},speaker:'予樂',text:'司機你們都認識了。……今天換他當客人。'},   /* AA_519 第 6 節：「這是很好笑／老實／客氣的司機。」和電影夜（y2r2_3d.js，2026-12-11）重複，第二場改這一句 */
      {unless:{flagIs:{YL_IMPRESSION:['funny','honest','polite']}},speaker:'kexin',expression:'teasing',text:'這是我的司機。'},
      {speaker:'予樂',text:'你就是阿哲？可昕說你的民法筆記是借來的。'},
      {speaker:'zhe',text:'……誰說的。是「暫時保管」。'},
      {speaker:'予樂',text:'那我叫你「保管人」。'},
      {speaker:'zhe',text:'那妳是「副駕」。……司機的副駕。'},
      {choice:[{text:'「予樂，夠了。」',goto:'n1'},{text:'「阿哲，夠了。」',goto:'n2'},{text:'（不阻止）',goto:'n3'}]},
      {label:'n1'},{speaker:'予樂',text:'你是司機，你沒有投票權。'},{goto:'an'},
      {label:'n2'},{speaker:'zhe',text:'我被法律系的自己人背叛了。'},{goto:'an'},
      {label:'n3'},{if:{custom:G=>knows('yu',G)},speaker:null,text:'（兩個人的綽號貼滿整桌，Alison 在旁邊幫忙記。）'},   /* Alison 不在場就不出這一句（AA_316 第 3 節「沒在的就不出他們的句子」）*/
      {label:'an'},
      {if:{custom:G=>knows('heroine_01',G)||yuBh(G)},advance:toH(19+40/60)},
      {if:{custom:G=>knows('heroine_01',G)},speaker:'heroine_01',text:'我們八點讀書會。……很高興認識妳。'},   /* AA_375 第 15 項：Alison、柏翰也是讀書會的 */
      {if:{custom:yuBh},speaker:'yu',text:'（拉著柏翰站起來）可昕下次見！'},
      {if:{custom:G=>knows('heroine_01',G)||yuBh(G)},speaker:'kexin',expression:'neutral',text:'嗯。下次見。'},
      {advance:toH(20.5)},
      {speaker:null,text:'（八點半。予樂說要開一個群組，名字她來取。）'},
      {speaker:'予樂',text:'「麵店分店」。不准改。'},
      {speaker:'kexin',expression:'laugh',text:'……她取名字一向這樣。'},
      {set:{KX_MET_NOODLE_TEAM:true,KX_CIRCLES_MET:true}} ],
    /* 介紹說了「女朋友」：在場的人知道（阿哲一定在；Alison、柏翰、以安認識才在）；群組「麵店分店」 */
    after:(G)=>{ const here=['zhe'].concat(['yu','classmate_bohan','heroine_01'].filter(id=>knows(id,G)));
      if(G.flags.KX_CIRCLES_INTRO==='gf'&&typeof ROM!=='undefined'&&ROM.learn) for(const id of here){ ROM.learn(G,id,'kexin','ev_kexin_two_circles'); if(ROM.tellYt) ROM.tellYt(G,id,'kexin'); }
      if(typeof PHONE!=='undefined'&&PHONE.join) PHONE.join(G,'noodle_branch','麵店分店'); G.flags.NOODLE_BRANCH_MEMBERS=['kexin','yule','zhe']; } };   /* AA_375 第 15 項：20:30 開的群組不算 Alison、柏翰（19:40 去讀書會了）*/

  /* ---- 1B-08 語彤事件 13b「助教」：大三上第 1 週第一次在麵店遇到她（週二、四 17:30～20:30）；沒遇到＝第 2 週週一總圖 ---- */
  const TA_LINES=[ {speaker:'heroine_03',text:'系上老師叫我當助教。質性研究方法。'},
    {speaker:'heroine_03',text:'他說我訪談的時候，受訪者會多講十分鐘。……我不知道那是什麼意思。'},
    {choice:[{text:'「意思是妳很會聽。」',goto:'t1'},{text:'「妳不知道？」',goto:'t2'}]},
    {label:'t1'},{speaker:null,text:'（她看了你一眼，沒說話。）'},{goto:'t3'},
    {label:'t2'},{speaker:'heroine_03',text:'……不知道。'},
    {label:'t3'},{speaker:'heroine_03',text:'下週二第一次上台。我要講二十分鐘。'},
    {set:{YT_TA:true}} ];
  const TA_NEWS={ id:'ev_yt_ta_news', title:'助教', participants:['heroine_03'], location:'noodle', trigger:'auto', once:true, term:['Y3S1'], weeks:[1], weekday:[2,4], time:[17.5,20.5], background:'blur',
    prereq:{stage:{npc:'heroine_03',min:'FRIEND'},notFlags:['YT_TA']}, dialogue:TA_LINES };
  const TA_NEWS_LIB={ id:'ev_yt_ta_news_lib', title:'助教', participants:['heroine_03'], location:['library','library_hall'], trigger:'auto', once:true, term:['Y3S1'], weeks:[2], weekday:[1], npcZone:'heroine_03', background:'blur',
    prereq:{stage:{npc:'heroine_03',min:'FRIEND'},notFlags:['YT_TA']}, dialogue:TA_LINES.map(l=>l.text==='下週二第一次上台。我要講二十分鐘。'?Object.assign({},l,{text:'明天第一次上台。我要講二十分鐘。'}):l) };   /* AA_376 #3：第 2 週週一（9/13）在總圖，隔天 9/14 就上台（麵店那一版第 1 週照舊「下週二」）*/

  /* ---- 1B-08 語彤事件 12「那把傘」：2027-09-14（二）17:30～18:30 總圖門口（大一下雨的那個門口），那天傍晚一定下雨（y2b3d.js）---- */
  const RU=v=>({flagIs:{rain_umbrella:v}});
  const friendOnly=G=>!dating(G,'heroine_03')&&knowsOther(G,'heroine_03');   /* 和別人交往、她知道：只用友情版，不說「你的傘」「跟你一樣的傘」 */
  const herMate=G=>{ const c=typeof CHARACTERS!=='undefined'&&CHARACTERS.heroine_03; return !!(c&&c.partner&&typeof STORY!=='undefined'&&STORY.partnerOn&&STORY.partnerOn(G,c.partner)); };
  const bothSingle=G=>!datingOther(G,'heroine_03').length&&!dating(G,'heroine_03')&&!herMate(G);   /* 兩人都單身 */
  const UMBRELLA={ id:'ev_yt_umbrella_y3', title:'那把傘', participants:['heroine_03'], location:'campus', near:{x:81,z:0,r:7}, trigger:'auto', once:true, background:'blur',
    prereq:{stage:{npc:'heroine_03',min:'FRIEND'},custom:G=>at(G,'2027-09-14',17.5,18.5)},
    dialogue:[ {if:{custom:G=>G.flags.rain_umbrella!=='none'&&hasCG('cg_umbrella_heroine03')},cg:'cg_umbrella_heroine03'},   /* CG-6（企劃分支 cg_approved/，還沒登錄；「我也沒帶」不放 CG）*/
      {if:{custom:G=>friendOnly(G)&&['give','share'].includes(G.flags.rain_umbrella)},speaker:'heroine_03',text:'我今天有帶傘。'},
      {if:{custom:G=>friendOnly(G)&&['give','share'].includes(G.flags.rain_umbrella)},goto:'talk'},
      {if:RU('give'),speaker:null,text:'（她撐著你兩年前那把傘。）'},
      {if:RU('give'),speaker:'heroine_03',text:'……這把是你的。在櫃台後面放了兩年，你一直沒拿。'},
      {if:RU('give'),speaker:'heroine_03',text:'今天想帶一個……會帶來好運的東西。'},
      {if:RU('share'),speaker:'heroine_03',text:'我後來買了一把跟你那天一樣的。很蠢吧。'},
      {if:RU('cvs'),speaker:'heroine_03',text:'我今天有帶傘。我從那天以後都有帶。'},
      {if:RU('none'),speaker:'heroine_03',text:'你有帶嗎？……我也沒有。'},
      {if:RU('none'),speaker:null,text:'（她笑了一下。）'},
      {if:RU('none'),speaker:'heroine_03',text:'我們兩個還是很慘。'},
      {unless:{flagIs:{rain_umbrella:['give','share','cvs','none']}},speaker:'heroine_03',text:'我今天有帶傘。氣象說會下。'},   /* 大一沒碰到雨天事件（AA 新寫，第①級）*/
      {label:'talk'},
      {speaker:'heroine_03',text:'今天第一次站在講台上。講了二十分鐘。'},
      {speaker:'heroine_03',text:'……沒有人睡著。'},
      {if:{custom:G=>dating(G,'heroine_03')},goto:'gf'},
      {choice:[{text:'「恭喜。」',goto:'c1'},{text:'「去麵店慶祝？」',goto:'c2'},{text:'（陪她走到麵店，不說話）',goto:'c3'}]},
      {label:'c1'},{speaker:'heroine_03',text:'嗯。'},{speaker:null,text:'（她低頭，嘴角一直往上。）'},
      {if:{custom:G=>bothSingle(G)},speaker:'heroine_03',text:'……可以再說一次嗎。'},   /* AA_338 第 6 節（禁用模板句「你是第一個」的變形）*/
      {unless:{custom:G=>bothSingle(G)},speaker:'heroine_03',text:'謝謝。阿姨等一下一定會說第二次。'},{goto:'end'},
      {label:'c2'},{speaker:'heroine_03',text:'今天週二。本來就要去。'},{speaker:null,text:'（停了一下。）'},{speaker:'heroine_03',text:'……可是今天我不切蔥。我坐著吃。'},{goto:'end'},
      {label:'c3'},{speaker:null,text:'（一路上她講了二十分鐘助教課的事，比她這兩年講過的話加起來都多。）'},{goto:'end'},
      {label:'gf'},{if:{flags:['YT12_CHEER']},speaker:'heroine_03',text:'中午你傳的那三個驚嘆號，我上台前看了一下。'},
      {choice:[{text:'「恭喜。」',goto:'g1'},{text:'「去麵店慶祝？」',goto:'g2'},{text:'（陪她走到麵店，不說話）',goto:'g3'}]},
      {label:'g1'},{if:{flags:['YT12_CHEER']},speaker:'heroine_03',expression:'embarrassed',text:'嗯。……中午說加油，現在說恭喜。'},{if:{flags:['YT12_CHEER']},speaker:'heroine_03',expression:'embarrassed',text:'……都收到了。'},
      {unless:{flags:['YT12_CHEER']},speaker:'heroine_03',expression:'embarrassed',text:'嗯。'},{unless:{flags:['YT12_CHEER']},speaker:'heroine_03',expression:'embarrassed',text:'……再說一次也可以。'},{goto:'end'},
      {label:'g2'},{speaker:'heroine_03',text:'今天週二。本來就要去。'},{speaker:'heroine_03',text:'……今天我不切蔥。你坐我旁邊。'},{goto:'end'},
      {label:'g3'},{speaker:null,text:'（一路上她講了二十分鐘助教課的事。走到一半，她把傘換到你那一邊。）'},
      {label:'end'},
      {if:RU('give'),mem:[{npc:'heroine_03',tag:'HELPED',note:'兩年後她撐著那把傘'}]},
      {unless:RU('give'),mem:[{npc:'heroine_03',tag:'SHARED_UMBRELLA',note:''}]},
      {set:{YT_UMBRELLA_Y3:'seen'}} ] };

  /* ---- 1B-09 子晴 Q10「畢業專題要交哪一個」：2027-11-09（二）19:15～20:00 兩點半 Café；FRIEND 以上 ---- */
  const TOLD=G=>has('heroine_04','TOLD_HER_CHANGE');
  const CAPSTONE={ id:'ev_ziqing_capstone', title:'畢業專題要交哪一個', participants:['heroine_04'], location:'cafe', trigger:'auto', once:true, background:'blur',
    prereq:{stage:{npc:'heroine_04',min:'FRIEND'},custom:G=>at(G,'2027-11-09',19.25,20)},
    dialogue:[ {unless:{custom:G=>Q6(G)||done(G,'ev_ziqing_dad_stuck')},speaker:'heroine_04',text:'……你應該不知道。我在做遊戲，大一就開始了。上個月丟到網路上。'},   /* AA_376 #4：Q8b（10/6～10/8 爸爸卡關，含三天都沒去的手機版）已經說過的不再當新消息（同閒聊階梯 Q5-L1 的判斷）*/
      {if:{custom:G=>done(G,'ev_ziqing_dad_stuck')},speaker:'heroine_04',text:'……上次跟你說的那個遊戲。'},
      {speaker:'heroine_04',text:'畢業專題。我要交那隻貓。'},
      {speaker:'heroine_04',text:'安全。好玩。一定會過。'},
      {speaker:null,text:'（她看著筆電上兩個資料夾，一個叫「cat」，一個沒有名字。）'},
      {speaker:'heroine_04',text:'……另一個還沒做完。交了會被打很爛的分數。'},
      {speaker:'heroine_04',text:'你覺得呢？不要幫我決定。你只要講你覺得。'},
      {choice:[{text:'「我覺得妳想交沒有名字的那個。」',set:{ZQ_Q10:'nameless'},goto:'q1'},{text:'「交貓。貓很好。」',set:{ZQ_Q10:'cat'},goto:'q2'},{text:'「我不講。這次妳自己決定。」',set:{ZQ_Q10:'both'},goto:'q3'},
        {text:'「我念過一個多月經濟，後來重考進法律。換的時候很怕，換完就不怕了。」',unless:{custom:G=>TOLD(G)},set:{ZQ_Q10:'nameless'},mem:[{npc:'heroine_04',tag:'TOLD_HER_CHANGE',note:'畢業專題那晚，你說你換過一次方向'}],goto:'q4'},
        {text:'「我上次說換跑道的事——換的時候也很怕。」',if:{custom:G=>TOLD(G)},set:{ZQ_Q10:'nameless'},goto:'q5'}]},
      {label:'q1'},{speaker:'heroine_04',text:'……你很煩。'},{speaker:null,text:'（她把沒有名字的那個資料夾打開，又關掉。又打開。）'},{goto:'music'},
      {label:'q2'},{speaker:'heroine_04',text:'對吧。'},{speaker:null,text:'（她點頭。然後很小聲：）'},{speaker:'heroine_04',text:'……可是你剛剛停了一下。'},{goto:'music'},
      {label:'q3'},{speaker:null,text:'（她看著你，很久。）'},{speaker:'heroine_04',text:'好。'},{speaker:null,text:'（她把兩個資料夾都拖進「畢業專題」裡。）'},{speaker:'heroine_04',text:'我兩個都交。看誰先做完。'},{goto:'music'},
      {label:'q4'},{speaker:'heroine_04',text:'……你換過？'},{speaker:'player',text:'嗯。'},{speaker:'heroine_04',text:'你家裡說什麼？'},{speaker:'player',text:'一開始不太懂。後來就懂了。'},
        {speaker:null,text:'（她看著那個沒有名字的資料夾，很久。）'},{speaker:'heroine_04',text:'……好。'},{speaker:null,text:'（她把沒有名字的那個資料夾拖到桌面正中間。）'},{goto:'music'},   /* AA_321（2026-10-21 AA-C）：原「……好。我記住了。這不是問句。」是口氣表 0-3 的模板句 */
      {label:'q5'},{speaker:'heroine_04',text:'……你這樣講，我比較不怕了。'},
      {label:'music'},
      {speaker:'heroine_04',text:'還有一件事。我要請吉他社的學妹做配樂。'},
      {speaker:'heroine_04',text:'我要簽什麼？我會不會被告？'},
      {speaker:'player',text:'法律上大概是：要她同意、講清楚怎麼用。……可是妳真正想要的是什麼？'},
      {speaker:null,text:'（她想了很久。）'},
      {speaker:'heroine_04',text:'……我想要她的歌在我的遊戲裡，而且她很開心。'},
      {speaker:'player',text:'那妳們先把說好的事寫下來。誰做什麼、做完歸誰、可不可以放在別的地方。'},
      {speaker:'heroine_04',text:'……你們法律系講話都這樣嗎？'},
      {speaker:'player',text:'這次是大三的講法。'},
      {speaker:null,text:'（她當天晚上就去找學妹。學妹開心到尖叫，兩個人寫了一頁「說好的事」。）'},
      {set:{ZQ_MUSIC_CREDIT:true}} ] };

  /* ---- 1B-10 芷若 Z10：和她交往中＝12/17 那張背面「12/25，台灣晚上八點。打給我。」→ 12/25 20:00 視訊（倫敦中午 12:00；BB_124 第 1 節聖誕「她在國外」大三上那一格）---- */
  const XMAS_VIDEO={ id:'ev_zhiruo_xmas_video', title:'聖誕的視訊', participants:['heroine_02'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.5,
    dialogue:[ {scene:'視訊',bg:'video'},
      {speaker:'heroine_02',text:'這裡的聖誕節，店都關了。'},
      {speaker:'heroine_02',text:'我很想做一杯給你。'} ] };

  /* ---- 1B-10 芷若英國的生日（AA_336 B6；BB_124 第 1 節「她在國外」2027）：9/24 那張背面「9/28，台灣晚上十點。打給我。」→ 9/28 21:55 選「打給她。」（y2b3d.js S.bdayCall）＝22:00 視訊（倫敦 15:00）。
     前兩句 BB_124、第三句是 AA_336 新寫的收尾；ZR_BDAY_CALL 在選的時候記 ---- */
  const BDAY_VIDEO={ id:'ev_zhiruo_bday_video', title:'生日的視訊', participants:['heroine_02'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.5,
    dialogue:[ {scene:'視訊',bg:'video'},
      {speaker:'heroine_02',text:'今天我一個人看了一部電影。'},
      {speaker:'heroine_02',text:'……你打來了，所以不算一個人。'},
      {speaker:'heroine_02',text:'好了。去睡。你那邊很晚了。'} ] };

  /* ---- 1B-11 沛珊回來（AA_296 2-3-1 ④，企劃線 3f406dbc；新寫，原本兩則私訊的兩句都在裡面）：2027-08-07 21:00 她打來（y2b3d.js S.psBackPhone 排）；沒接＝原本那兩則私訊 ---- */
  const Y2=()=>typeof Y2B!=='undefined'?Y2B:null;
  const PS_BACK_CALL={ id:'ev_peishan_back_call', title:'電話', participants:['classmate_peishan'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.25,
    dialogue:[ {scene:'電話'},
      {speaker:null,text:'（晚上九點。手機響了。來電的名字，你半年沒看到了。）'},
      {speaker:'classmate_peishan',text:'……喂。'},
      {speaker:'classmate_peishan',text:'這半年，我都沒看手機。你傳的，我今天才一則一則看完。'},
      {speaker:'classmate_peishan',text:'對不起。'},
      {choice:[{text:'「妳還好嗎？」',goto:'a'},{text:'「妳現在在哪？」',goto:'b'},{text:'（先不說話）',goto:'c'}]},
      {label:'a'},{speaker:'classmate_peishan',text:'我現在很好。真的。'},{goto:'e'},
      {label:'b'},{speaker:'classmate_peishan',text:'台中。在家。'},{goto:'e'},   /* AA_296 ④ 台中版（企劃線 ed0daea9：8/7 她在台中老家，同 AA_350 P1）*/
      {label:'c'},{speaker:'classmate_peishan',text:'……你可以生氣。我只是想先打給你。'},
      {label:'e'},{speaker:'classmate_peishan',text:'開學以後，我在台南。你要來的話，跟我說。'},
      {speaker:null,text:'（她等了一下，才掛電話。）'} ],
    after:G=>{ const y=Y2(); if(y&&y.psBackAnswered) y.psBackAnswered(G); },
    outingMissed:G=>{ const y=Y2(); if(y&&y.psBackMissed) y.psBackMissed(G); } };

  return [BAD_EXAM,LEASE_TEXT,AUNT_RETELL,MOTHER_MAP,DAD_VISIT,DAD_SORRY,LAST_SHIFT,TWO_CIRCLES,TA_NEWS,TA_NEWS_LIB,UMBRELLA,CAPSTONE,XMAS_VIDEO,BDAY_VIDEO,PS_BACK_CALL];
})();
Array.prototype.push.apply(STORY_EVENTS,Y2B_EVENTS);
