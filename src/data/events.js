/* ===== STORY EVENT DATA PACK v1（schema 見 STORY_EVENT_SCHEMA.md）
   trigger: 'auto'（條件成立且玩家在 near 範圍）/ 'interact'（與 participants[0] 對話時）/ 'enter'（進入區域時）
   對話行：{speaker, text, expression, position} / {choice:[{text,hint,consequences,goto,next,set,mem,rel,choiceKey,value}]} / {legal:{context,by,pick|qid,chorus}} / {label} / {goto} / {if} / {set,mem,rel,note,advance}
   所有人物與故事皆為虛構。 ===== */
'use strict';
/* 2026-11-11（使用者 X327 沛珊重寫）：沛珊在這個檔的十場事件 18 列（20 處）照 AA_761_peishan_events_1.json@dbfc596a5 換——ev_ps_w1_room、ev_ps_w1_notes、ev_peishan_why_plg（已停用的 ev_studygroup_wed 同一句一起換）、ev_peishan_why_answer_plg、
   ev_peishan_doubt、ev_peishan_bohan_w4、ev_peishan_table_bench（對話＋after 寫進手機那一句）、ev_peishan_table_mail、ev_peishan_tutoring、ev_peishan_handover。只換她的句子；選項、條件、旗標、數值不動。逐字對稿：tests/peishan_events_1111_unit.js */
/* 群戲「只有認識的人在場」（交接包 v1 交付清單第 0 節第 1 點）：if:EV_KNOWS('id')／if:EV_KNOWS('a','b')＝都認識了（STORY.knows：FIRST_MET；Alison met_yu；阿哲開場就熟）*/
const KX_BDAY_DRINK=60;   /* AA_874 A 版：一杯飲料的錢（LAWWW 定）*/
let KX_END_C=null;   /* ev_kx_y1s1_end：期末最後一科考完的時間（算一次）*/
/* 可昕自己的線（AA_873）：朋友以上（min：FAMILIAR／FRIEND）或交往中、今天在臺北（寒暑假回高雄不算）；不讀 dating_kexin 以外的交往狀態 */
const KX_LINE_OK=(G,min)=>{ if(!G||(G.stage||'law')!=='law'||typeof STORY==='undefined') return false; if(STORY.kxKnown&&!STORY.kxKnown(G)) return false;
  if(STORY.abroad&&STORY.abroad(G)) return false; if(STORY.presence&&!STORY.presence('kexin',G).here) return false;
  if(G.flags&&G.flags.dating_kexin===true) return true; if(typeof SOCIAL==='undefined'||!SOCIAL.STAGES||!SOCIAL.stage) return false;
  return SOCIAL.STAGES.indexOf(SOCIAL.stage('kexin'))>=SOCIAL.STAGES.indexOf(min); };
/* AA_873 ④：大三上人在國外的順延到回來以後的那個學期同樣的週次——現在這一學期以前的學期，那一週人都在國外才算輪到這一學期 */
const KX_LINE_TERM=(G,terms,wk)=>{ if(typeof CALENDAR==='undefined'||typeof STORY==='undefined'||!STORY.termDay) return true; const t=CALENDAR.termOf(G.day); if(!t) return false; const i=terms.indexOf(t.id); if(i<0) return false;
  for(let k=0;k<i;k++){ const d=STORY.termDay(terms[k],wk,1); if(d==null) continue; if(!(STORY.abroad&&STORY.abroad(Object.assign({},G,{day:d})))) return false; } return true; };
const EV_KNOWS=(...ids)=>({custom:G=>typeof STORY!=='undefined'&&!!STORY.knows&&ids.every(id=>STORY.knows(id,G))});
/* 柏翰×沛珊那一段（大一下第 7 週起的 partner、4/15 期中晚餐公開、大二上第 6 週分手、ps_split_group）：認識沛珊、而且沒有和她交往（AA_374 第 11 項）*/
const PS_BH={custom:G=>typeof STORY!=='undefined'&&!!STORY.knows&&STORY.knows('classmate_peishan',G)&&!(G.flags&&G.flags.dating_classmate_peishan)};
const PS_DT=G=>!!(G.flags&&G.flags.dating_classmate_peishan);   /* 和祐廷交往中（AA_409）*/
const PS_DT_BH=G=>PS_DT(G)&&typeof STORY!=='undefined'&&!!STORY.knows&&STORY.knows('classmate_bohan',G);   /* 交往中、認識柏翰＝期中晚餐柏翰算麵錢三句（AA_245 第 1 節、AA_409 c42a0dd3）*/
const PS_TOLD=G=>typeof ROM!=='undefined'&&!!ROM.knowsOf&&(ROM.knowsOf(G,'zhe','classmate_peishan')||ROM.knowsOf(G,'yu','classmate_peishan'));   /* 桌遊團已經知道（之前別的事件公開過）*/
const PS_NOBH={custom:G=>!!(G.flags&&G.flags.dating_classmate_peishan)&&typeof STORY!=='undefined'&&!!STORY.knows&&STORY.knows('classmate_bohan',G)};   /* AA_245（企劃線 2af03a63）：沛珊和柏翰沒在一起（玩家和沛珊交往中，AA_374 第 11 項同一個條件）、認識柏翰＝期中晚餐換柏翰自己的三句 */
/* 沛珊說分手的那一件（AA_374 第 18 項）：看過 P3（ev_peishan_decision）而且有點熟以上＝原本的兩句；沒看過 P3、或還不熟＝短的兩句（附錄 B E6）*/
const PS_SPLIT_FULL={custom:G=>!!(G.events&&G.events.done&&G.events.done.ev_peishan_decision)&&typeof SOCIAL!=='undefined'&&!!SOCIAL.friendLevel&&['FAMILIAR','FRIEND','CLOSE_FRIEND'].includes(SOCIAL.friendLevel('classmate_peishan'))};
/* 沛珊 P2（ev_peishan_doubt）在大一下開學（2026-02-23）以後才演：「…比坐在霖澤館這半年都自在。」；大一上（含寒假）照原句「這一個多月」（AA_373 #24）*/
const PS_DOUBT_Y2=G=>{ const R=typeof CALENDAR!=='undefined'&&CALENDAR.termDays?CALENDAR.termDays('Y2S1'):null; return !!R&&G.day>=R.from; };   /* AA_373 第 6-2 節第 10 題（企劃線 bdab2f42）：大二上（12/17 以前）才第一次演＝「比坐在霖澤館這一年多都自在。」*/
const PS_DOUBT_Y1S2=G=>{ const R=typeof CALENDAR!=='undefined'&&CALENDAR.termDays?CALENDAR.termDays('Y1S2'):null; return !!R&&G.day>=R.from&&!PS_DOUBT_Y2(G); };
/* 可昕來看模 5（BB_97 9-19）：交往中、第 9 週回她「模擬法庭。第 10 週比賽，妳要來嗎？」（KX_MOOT_TOLD）、比賽在週末或平日 18:00 以後（平日白天她有課）*/
/* 她知不知道祐廷現在和可昕交往（knowsGF；BB_191 9-4 #3～#6）：台大角色的台詞、選項、條件讀這個，不讀 dating_kexin */
const GFN=(G,id)=>typeof ROM!=='undefined'&&ROM.gfNow?ROM.gfNow(G,id):!!(G.flags&&G.flags.dating_kexin);
const GF=id=>({custom:G=>GFN(G,id)});
/* AA_554（企劃線，AA-B 2026-10-31；任務 AA554-ZRZQ-DATING-1031）：「和她交往中」＝祐廷和她交往（ROMANCE_WITH 含她：dating_<id>，或 romance[id].status 'dating'；同 y2b_events.js 的 dating）。
   不是上面的 GF（＝祐廷和別人交往、她知道）。BB_187、BB_189 的「和她交往中」版本讀 DH；GFO＝和別人交往中、而且不是和她（兩種都成立的少見情況以「和她交往中」為準；只和別人交往的玩家 GFO＝GF，照舊）*/
const DHN=(G,id)=>{ const F=(G&&G.flags)||{}, R=F.romance||{}; return F['dating_'+id]===true||!!(R[id]&&R[id].status==='dating'); };
const DH=id=>({custom:G=>DHN(G,id)});
const GFO=id=>({custom:G=>GFN(G,id)&&!DHN(G,id)});
const SOLO=id=>({custom:G=>!GFN(G,id)&&!DHN(G,id)});   /* 兩種都不是（原本 unless:GF 的單身版，「和她交往中」另有一版的地方用這個）*/
const ZR_CUP_NOTE_P=0.1;   /* AA_207 §3-3：芷若紙杯上的電影場景，第一次（記 zhiruoCupNote 那次）一定出，之後偶爾一次＝這個機率 */
const KAI_LATE_BEDS=G=>{ const b=typeof STORY!=='undefined'&&STORY.r203Beds?STORY.r203Beds(G):null; return b==null?'both':b; };   /* AA_502 第 6 節第 8 點（AA-C 2026-10-28）：ev_dorm_late_kai 四人房那一行照當下誰在上舖（STORY.r203Beds：both／zhe／bohan／none）；不是 203 四人房的時期＝照原本（兩個都睡了）*/
const KAI_LATE_BUG=G=>!(G.flags&&G.flags.KAI_BUG_TOLD)||(((G.events&&G.events.done&&G.events.done.ev_dorm_late_kai)|0)%2===0);   /* AA_207 附錄 §2（阿凱半夜，隨機重播）：開頭兩句輪流——「bug 追到第三小時」講過（KAI_BUG_TOLD）以後，奇數次換「在等編譯，你先洗澡。」；還沒講過 bug 的照舊（選項「什麼 bug？」要接得上）*/
const KX_MOOT_CAME=G=>{ const F=G.flags||{}; if(!F.dating_kexin||F.KX_MOOT_TOLD!==true) return false; const wd=typeof CALENDAR!=='undefined'?CALENDAR.dateOf(G.day).wd:6; return wd>=6||(G.hour%24)>=18; };
/* Alison 語 2 的最後一個徵兆（交接包 v2 C18、AA_40 語 2 的表）：吉他社的社課後、麵店散場後的騎樓兩個地方共用同一段 */
const YU2_Q=arcade=>[ {speaker:'yu',expression:'neutral',text:'欸，阿哲是不是對每個人都這麼好？'},
  {choice:[{text:'「對每個人都好。」',set:{YU2_PICK:'everyone'},goto:'a'},{text:'「對妳比較好。」',set:{YU2_PICK:'you'},goto:'b'},{text:'「妳自己問他。」',set:{YU2_PICK:'ask'},goto:'c'}]},
  {label:'a'},{speaker:'yu',expression:'neutral',text:'……喔。'},{speaker:null,text:arcade?'她低頭滑手機。':'她低頭調弦。'},{speaker:'yu',expression:'neutral',text:'也是啦。'},{goto:'end'},
  {label:'b'},{speaker:null,text:arcade?'她停住，然後很大聲地哼了一段成發要彈的旋律。':'她停住，然後很大聲地彈了一個和弦。'},{speaker:'yu',expression:'embarrassed',text:'欸你很煩！'},{goto:'end'},
  {label:'c'},{speaker:'yu',expression:'neutral',text:'我才不要。'},{speaker:null,text:'她想了一下。'},{speaker:'yu',expression:'smile',text:'……再看看啦。'},   /* AA_313 5-4（AA_389 第 6 點：照逐場表）：不用「……好啦」反轉 */
  {label:'end'},{mem:[{npc:'yu',tag:'ASKED_ABOUT_ZHE',note:'她問：阿哲是不是對每個人都這麼好？'}]} ];
const YU2_QUESTION=YU2_Q(false);   /* 騎樓版她沒有背吉他（AA 50da3a9）：「調弦」換成「滑手機」、「彈了一個和弦」換成「哼了一段成發要彈的旋律」，台詞不變 */
/* 重訪日 1 的選項（交接包 v2 C20 第 3 節的表）：只從玩家真的經歷過的事裡出，最多三個（照表的順序），再加一個一定有的「每天都差不多。可是我很喜歡。」
   那場演講（C13 的 B4：B4_ATTENDED／出席紀錄）、成發拍手（BB_96 Q5 的 CLAPPED）都已接：有經歷過才會出現 */
const REVISIT_Y1_OPTS=[
  {k:'retake',t:'「再上一次經原，坐回同一間教室。」',ok:G=>{ const A=G.courses&&G.courses.attend||{}; return ((A.econ_principles_1|0)+(A.econ_principles_2|0))>0; }},
  {k:'bbq',t:'「中秋烤肉，借來的烤肉架。」',ok:G=>!!(G.events&&G.events.done&&G.events.done.ev_mid_autumn_bbq)},
  {k:'noodle',t:'「燒臘店的第一盤。」',ok:G=>G.flags.noodleTableDay!=null||(Array.isArray(G.flags.ndlDays)&&G.flags.ndlDays.length>0)},
  {k:'appeal',t:'「幫以安室友寫申訴。」',ok:G=>!!G.flags.AN_APPEAL},
  {k:'rain',t:'「那天下雨，總圖門口。」',ok:G=>G.flags.rain_umbrella!=null},
  {k:'lecture',t:'「那場演講。」',ok:G=>typeof STORY!=='undefined'&&!!STORY.kxB4Told&&STORY.kxB4Told(G)},   /* AA_373 #17（AA_313 #30）：她的回應是「你說講者最後問的那一題…」——只給 5/7 在手機回過她「講者最後問：『…』」的玩家（聽完 B4 才有那個選項）；沒回的不出。原本看出席紀錄（AA_140 G49）*/
  {k:'show',t:'「成發那天，我負責拍手。」',ok:G=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has('heroine_04','CLAPPED')} ];
const REVISIT_Y1_SHOWN=G=>REVISIT_Y1_OPTS.filter(o=>o.ok(G)).slice(0,3).map(o=>o.k);
/* 迎新的第 3 題（AA_177 第 9 節）：第二天 whyLaw 的鍵（舊存檔的 hero→help、ok／family／unknown→own：STORY.whyLawKey）*/
const WHY_KEY=G=>typeof STORY!=='undefined'&&STORY.whyLawKey?STORY.whyLawKey(G.flags):null;
/* （CANON-NO-ECON-1112 第四批：照 AA_905）舊序章那一個答案（鍵 econ）拿掉；舊存檔 whyLaw 是 econ 的，STORY.whyLawKey 當 own；MENTOR_WHY 已經是 econ 的，查不到字＝不說那一句、不寫筆記 */
const MENTOR_WHY_TEXT={curious:'小時候遇到事情就去翻民法。翻得到，看不懂。',help:'想幫身邊的人把事情弄清楚。',own:'還在找怎麼說。但這是我自己選的。'};
/* 學姊 W5（BB_96 2-6）：法服讀書會去過 3 次以上、還沒演過（兩個版本共用一次）；後半段兩個版本相同 */
const W5_OK=G=>{ const A=G.acts&&G.acts.att||{}; const n=Object.keys(A).filter(k=>k.indexOf('lawclub_study@')===0).length; const D=G.events&&G.events.done||{}; return n>=3&&!D.ev_sis_sticky_notes&&!D.ev_sis_sticky_notes_late; };
const W5_REST=[ {speaker:null,text:'會後你回法律系館B拿忘記的東西，看到她一個人坐著，在每份書狀上貼便條。'},
  {speaker:null,text:'（你的書狀上：「第三段的事實整理很好。我剛剛沒說。」）'},
  {speaker:'heroine_05',expression:'serious',text:'（沒有抬頭）檢討會上講缺點，便條上講優點。'},
  {speaker:'heroine_05',expression:'neutral',text:'缺點要在大家面前講，大家才會改。'},
  {speaker:'heroine_05',expression:'neutral',text:'優點要私下講，才不會被當成客套。'},
  {speaker:'heroine_05',expression:'thinking',text:'……我以前的學姊也是這樣對我。'},
  {choice:[{text:'「學姊，有沒有人給妳便條？」',goto:'q'},{text:'（撕一張她的便條紙，寫了貼在她的筆記本上）',goto:'w'},{text:'「謝謝學姊。」（拿了書狀就走）',goto:'t'}]},
  {label:'q'},{speaker:null,text:'她停下筆。'},{speaker:'heroine_05',expression:'neutral',text:'社長沒有人改。'},{speaker:null,text:'她笑了一下。'},{speaker:'heroine_05',expression:'smile',text:'重點是，這樣比較快。'},
    {mem:[{npc:'heroine_05',tag:'NOTICED_HER',note:'問她有沒有人給她便條'}]},{goto:'end'},
  {label:'w'},{choice:[{text:'「今天的檢討很清楚。我剛剛沒說。」',set:{W5_NOTE:'clear'},mem:[{npc:'heroine_05',tag:'GAVE_HER_NOTE',note:'便條：今天的檢討很清楚。我剛剛沒說。'}]},
      {text:'「學姊辛苦了。」',set:{W5_NOTE:'thanks'},mem:[{npc:'heroine_05',tag:'GAVE_HER_NOTE',note:'便條：學姊辛苦了。'}]},
      {text:'（畫一個笑臉）',set:{W5_NOTE:'smile'},mem:[{npc:'heroine_05',tag:'GAVE_HER_NOTE',note:'便條：畫了一個笑臉'}]}]},
    {speaker:null,text:'她看了很久。'},{speaker:'heroine_05',expression:'smile',text:'你學得很快。'},{goto:'end'},
  {label:'t'},{speaker:'heroine_05',expression:'neutral',text:'嗯。下學期見。'},
  {label:'end'} ];
/* 主線 2 親戚的土地資料（一）（交接包 v2 C2；AA_12 主線 2）：除夕在臺北家裡（2D；2026-10-14 使用者：祐廷是臺北人，原本是嘉義老家）。台詞照原文；流程的描述（一桌親戚、拿出謄本、全桌安靜、姊姊憋笑）寫成旁白；
   「祐廷（旁白）」那一句是他心裡的話＝旁白。不寫真實地號或任何真實資料；共有土地怎麼處理不給答案（法律審查：祐廷大一什麼都不說也可以） */
/* 跨年大一的頂樓（AA_204 2-3、2-5，企劃線 27711a39）：ev_nye_roof（直接到頂樓）和 ev_nye_dinner（吃飯以後一起去）共用 */
const NYE_AT=(G,id,min)=>{ if(typeof SOCIAL==='undefined'||!SOCIAL.STAGES||!SOCIAL.has||!SOCIAL.has(id,'FIRST_MET')) return false; const A=SOCIAL.STAGES; return A.indexOf(SOCIAL.stage(id))>=A.indexOf(min); };
const NYE_AN=G=>!!(G.flags&&G.flags.dating_heroine_01)||NYE_AT(G,'heroine_01','FRIEND');   /* 以安 FRIEND 以上（交往中一定是）才上頂樓 */
const NYE_XC=G=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has('classmate_xinci','FIRST_MET');   /* 芯慈在場（認識才寫她）*/
const NYE_KAI=G=>NYE_AT(G,'kai','FAMILIAR');   /* 阿凱有點熟以上才上頂樓（BB_171 第 3 節、AA_432 4-6）*/
/* 大一跨年走「一起去信義區」那條（ev_nye_dinner 選「一起去」→ 搭捷運回頂樓，NYE_Y1＝roof）、而且以安也在（NYE_Y1_AN，在 ev_nye_dinner 記）：大二頂樓她說「去年這時候還在捷運上。」（AA_313 4-3）*/
const NYE_Y1_MRT=G=>!!(G.events&&G.events.done&&G.events.done.ev_nye_dinner)&&!!G.flags&&G.flags.NYE_Y1==='roof'&&!!G.flags.NYE_Y1_AN;
const NYE_ROOF_Y1=[
  {speaker:null,text:'（十一點四十，男生宿舍頂樓。風很大。信義區那邊的天空，亮了一塊。）'},
  {speaker:'classmate_bohan',text:'還有十八分鐘。'},
  {speaker:'yu',text:'好冷好冷好冷。'},
  {speaker:null,text:'（阿哲從樓梯間上來，手上抱著幾罐熱飲。）'},
  {speaker:'zhe',text:'樓下販賣機買的。只剩這種。'},
  /* 阿凱（AA_432 4-6；BB_171 第 3 節：有點熟以上才上頂樓，23:50 提一袋鹹酥雞上來，倒數完回房間打電動）*/
  {if:{custom:G=>NYE_KAI(G)},speaker:null,text:'（23:50，阿凱提著一袋鹹酥雞上來。）'},
  {if:{custom:G=>NYE_KAI(G)},speaker:'kai',text:'所以你們都在這。'},
  {if:{custom:G=>NYE_KAI(G)},speaker:'kai',text:'鹹酥雞，自己拿。'},
  /* 和可昕選了頂樓（BB_95 9-7）：她的視訊——AA_313 第 2 節第 16 列：「零點前一分鐘」打來，排在群戲倒數之前（原本在零點之後）*/
  {unless:{custom:G=>!!(G.flags.KX_NYE&&G.flags.KX_NYE[1]==='roof')},goto:'nye_r_after_kx'},
  {speaker:null,text:'零點前一分鐘，可昕打視訊來。你走到頂樓的角落接。'},
  {speaker:'kexin',expression:'smile',text:'三、二、一——'},
  {speaker:null,text:'訊號慢了一秒，她的「新年快樂」晚到。'},
  {speaker:'kexin',expression:'smile',text:'你那邊卡了一秒啦。新年快樂。'},
  {speaker:null,text:'你轉告阿哲。阿哲對著天空喊——'},
  {speaker:'zhe',expression:'laugh',text:'可昕新年快樂！'},   /* AA_886 第 2 節（CANON-NO-ECON-1112 第四批）：她是同班同學，阿哲認得——兩列合成一列、不看旗標 */
  {label:'nye_r_after_kx'},
  {speaker:null,text:'（倒數是 Alison 起的頭，數到三，大家才跟上。）'},
  {speaker:null,text:'（零點。很遠的地方，煙火亮了。只看得到上半截。）'},
  {speaker:'zhe',expression:'laugh',text:'……我們就說有看到。'},
  {if:{custom:G=>NYE_KAI(G)},speaker:'kai',text:'好，我回去打了。'},   /* AA_432 4-6：倒數完 */
  /* 和語彤交往中（2-5）：00:01 她打電話來 */
  {unless:{flags:['dating_heroine_03']},goto:'nye_r_after_yt'},
  {speaker:null,text:'（零點過一分，手機響了。是語彤。）'},
  {speaker:'heroine_03',text:'新年快樂。'},
  {speaker:'heroine_03',text:'你們在頂樓喔？好吵。'},
  {speaker:null,text:'（她那邊很安靜，只聽得到電視的聲音。）'},
  {choice:[{text:'「幫我跟妳媽媽說新年快樂。」',goto:'nye_r_yt_a'},{text:'「妳們在看什麼？」',goto:'nye_r_yt_b'}]},
  {label:'nye_r_yt_a'},{speaker:'heroine_03',text:'好。'},{speaker:null,text:'（電話那頭，她媽媽的聲音：『新年快樂喔！』）'},{set:{YT_NYE_CALL_Y1:true}},{goto:'nye_r_after_yt'},
  {label:'nye_r_yt_b'},{speaker:'heroine_03',text:'跨年晚會。我媽在跟著唱。'},{set:{YT_NYE_CALL_Y1:true}},
  {label:'nye_r_after_yt'},
  {choice:[{text:'「新年快樂。」',goto:'nye_r_hny'},{text:'（把手機舉起來拍一張）',goto:'nye_r_photo'}]},
  {label:'nye_r_hny'},{speaker:'yu',text:'新年快樂！！'},{if:{custom:G=>NYE_AN(G)},speaker:'heroine_01',text:'新年快樂。'},{goto:'nye_r_down'},
  {label:'nye_r_photo'},{speaker:null,text:'（拍到的是一片黑，和一點點亮的地方。）'},{set:{NYE_Y1_PHOTO:true}},
  {label:'nye_r_down'},
  {speaker:'classmate_bohan',text:'我回房間了。'},
  {speaker:'yu',text:'我要去趕捷運！'},
  {if:{custom:G=>NYE_AN(G)&&!G.flags.dating_heroine_01},speaker:'heroine_01',text:'我也回去了。'},
  {if:{flags:['dating_heroine_01']},speaker:'heroine_01',text:'明天大家都會睡很晚。……午餐一起吃？'},   /* 和以安交往中（2-5）*/
  {if:{flags:['dating_heroine_01']},choice:[{text:'「幾點？」',goto:'nye_r_an_a'},{text:'「我想睡到中午。」',goto:'nye_r_an_b'}]},
  {label:'nye_r_an_a'},{if:{flags:['dating_heroine_01']},speaker:'heroine_01',text:'中午。睡飽再說。'},{if:{flags:['dating_heroine_01']},set:{AN_RUN_NY_Y1:true}},{if:{flags:['dating_heroine_01']},goto:'nye_r_last'},
  {label:'nye_r_an_b'},{if:{flags:['dating_heroine_01']},speaker:'heroine_01',text:'好。那我自己去。'},
  {label:'nye_r_last'},
  {speaker:null,text:'（大家一個一個下樓。阿哲最後一個，把空罐子都收走了。）'},
  {set:{NYE_Y1:'roof',NYE_DONE:'roof'}},{rel:{zhe:{fam:1},yu:{fam:1},classmate_bohan:{fam:1}}},{if:{custom:G=>NYE_AN(G)},rel:{heroine_01:{fam:1}}},{if:{custom:G=>NYE_KAI(G)},rel:{kai:{fam:1}}} ];   /* 在場的人熟悉 +1（阿凱：AA_432 4-6 上頂樓的玩家）*/
const LAND_Y1=[ {scene:'臺北・家裡的客廳',bg:'home_living_cny'},
  {speaker:null,text:'除夕。臺北家裡的客廳，一桌親戚。'},
  {speaker:null,text:'大伯從公事包裡拿出一疊影印的土地謄本。'},
  {speaker:'大伯',text:'{name}念首都帝大法律喔？你不是從小就在看法律？來來來，你幫大伯看一下這個。'},
  {speaker:null,text:'全桌安靜，看著你。'},
  {speaker:'大伯',text:'這塊地是你阿公留下來的，現在登記十四個人，有人要賣、有人不要。這怎麼辦？'},
  {speaker:null,text:'你看了三秒。第一頁就是看不懂的地號。'},
  {speaker:null,text:'小時候我也是這樣，翻得到，看不懂。不一樣的是，現在我知道要先問什麼：這塊地是誰的、他們之間是什麼關係、大家想要什麼。'},
  {speaker:'媽媽',text:'他才大一啦，你不要嚇他。'},
  {speaker:'大伯',text:'大一也是法律系啊。'},
  {speaker:null,text:'姊姊在旁邊憋笑。'},
  {speaker:'姊姊',text:'（小聲）歡迎來到法律系的第一個寒假。'},
  {choice:[{text:'「大伯，我回去問老師。」',set:{FAMILY_LAND_Y1:'teacher'},goto:'t'},{text:'「我現在還看不懂。可是我知道要先問哪幾件事。」',set:{FAMILY_LAND_Y1:'ask'},goto:'a'},{text:'「這要找律師。」',set:{FAMILY_LAND_Y1:'lawyer'},goto:'l'}]},
  {label:'t'},{speaker:null,text:'大伯很高興。'},{speaker:'大伯',text:'好好好，首都帝大的老師！'},{goto:'end'},
  {label:'a'},{speaker:null,text:'你問了三個問題：誰的、什麼關係、大家想要什麼。'},{speaker:null,text:'大伯答到一半，自己說：'},{speaker:'大伯',text:'……原來我們家連誰想賣都沒講清楚。'},{speaker:null,text:'全桌笑。'},
  {scene:'臺北・家裡的陽台',bg:'home_balcony'},{speaker:'姊姊',text:'你從小遇到事情就去翻那本書。現在你會問問題了。'},{goto:'end'},
  {label:'l'},{speaker:'大伯',text:'找律師要錢啊，你不就是嗎？'},
  {label:'end'} ];
const REVISIT_Y1_CHOICE=(pre)=>({choice:REVISIT_Y1_OPTS.map(o=>({text:o.t,if:{custom:G=>REVISIT_Y1_SHOWN(G).includes(o.k)},set:{REVISIT_Y1_PICK:o.k},goto:pre+o.k}))
  .concat([{text:'「每天都差不多。可是我很喜歡。」',set:{REVISIT_Y1_PICK:'daily'},goto:pre+'daily'}])});
/* 聖誕交換禮物（A20）：可能在場的七個人（AA_71 2-6）；在場＝玩家認識的；祐廷抽到誰的：明軒和 Alison 都在時 Alison 的玩偶已經是明軒的，盡量不和抽到祐廷禮物的是同一個人 */
const XMAS_WHO=['heroine_01','heroine_03','zhe','classmate_bohan','classmate_xinci','yu','classmate_mingxuan'];
const XMAS_HERE=G=>typeof STORY==='undefined'||!STORY.knows?[]:XMAS_WHO.filter(id=>STORY.knows(id,G));
/* 明軒抽到 Alison 的玩偶（AA 的「和祐廷無關的一句」）＝明軒和 Alison 都在、抽到祐廷禮物的不是明軒（是明軒的話，他抽到的是祐廷的，Alison 的玩偶祐廷也抽得到）*/
const XMAS_MX_YU=G=>{ const h=XMAS_HERE(G); return h.includes('classmate_mingxuan')&&h.includes('yu')&&G.flags.XMAS_TO!=='classmate_mingxuan'; };
const XMAS_FROM_POOL=G=>{ const h=XMAS_HERE(G); const p=h.filter(id=>!(id==='yu'&&XMAS_MX_YU(G))); const q=p.filter(id=>id!==G.flags.XMAS_TO); return q.length?q:p; };
/* 可昕自己讀書時傳的書桌照片（BB_95 9-5：婉拒、沒回、沒接）*/
/* 學姊的熱水（AA_261 第 3 節 16919f86）：兩次共用的場面，first＝她的第一句 */
function SIS_STUDY_OK(G){ return !!(G.flags&&G.flags.SIS_STUDY); }   /* 一起念書解鎖了（ev_sis_study_invite 記 SIS_STUDY，src/sis_grad3d.js）：不用數值門檻（AA_284 2-3 最後一行；原本熟悉 ≥40、信任 ≥25＋SIS_W1）*/
function SIS_HOT_WATER(first){ return [
  {speaker:null,text:'（九點四十分，閉館的廣播響了。自習室的燈一盞一盞關掉。她站在走廊的飲水機前面，手上拿著保溫瓶，沒有按。）'},
  {speaker:'heroine_05',text:first},{speaker:'heroine_05',text:'算完就不想算了。'},
  {choice:[{text:'「我陪妳等熱水。」',set:{HOT_WATER:true},goto:'hot'},{text:'「我請妳喝一罐。」',goto:'can'}]},
  {label:'hot'},{speaker:null,text:'（她按了下去。飲水機的熱水出得很慢，你站在旁邊陪她等。）'},{speaker:null,text:'（裝滿了。她蓋上蓋子，兩手抱著。）'},{speaker:'heroine_05',text:'好燙。'},
  {speaker:null,text:'（她笑出聲音。你很久沒看過她這樣笑。）'},{cg:'cg_hot_water_heroine05'},
  /* AA_595「AA 處理決定」第 3 節：「上次是黑咖啡」那一句（AA_590 改成「又遇到你了。」，條件 HELPED＝空的保溫瓶選黑咖啡）跟著空保溫瓶那條線拿掉 */
  {speaker:'heroine_05',text:'謝謝。明天八點，一樣的位子？'},{goto:'end'},
  {label:'can'},{speaker:null,text:'（她看了一下販賣機，按了最便宜的那一罐。）'},{speaker:'heroine_05',text:'不用。我自己來。'},{speaker:null,text:'（她投了硬幣。罐子掉下來的聲音，在走廊很響。）'},{speaker:'heroine_05',text:'明天八點。'},
  {label:'end'} ]; }
/* 桌遊團群組的補救（AA_496 第 9 節第 3 點；第 4 節「只在大一上 ev_zhe_long_table 建立，錯過的人到 2030 年才被加進去」）：大一上錯過哲 1、還不在桌遊團的人，
   大一下第 2 週起（之後的學期也算）。兩個入口（ev_zhe_group_late、ev_zhe_group_late_talk）共用這個條件，演過其中一個（記 noodleTableDay）兩個都關 */
/* AA_623 第 2 節：ev_zhe_long_table 不再加群組，演過它也照樣可以補救；補救入口照留，說話的人改明軒 */
const BGN_NOT_IN=G=>{ const F=G.flags||{}; return F.noodleTableDay==null&&!(typeof PHONE!=='undefined'&&PHONE.inGroup&&PHONE.inGroup(G,'noodle_team')); };
const ZHE_GROUP_LATE=G=>{ const F=G.flags||{}, DN=(G.events&&G.events.done)||{}; if((G.stage||'law')!=='law'||F.noodleTableDay!=null||DN.ev_zhe_group_late||DN.ev_zhe_group_late_talk) return false;
  if(typeof PHONE!=='undefined'&&PHONE.inGroup&&PHONE.inGroup(G,'noodle_team')) return false;
  const d=typeof STORY!=='undefined'&&STORY.termDay?STORY.termDay('Y1S2',2,1):null; return d!=null&&G.day>=d; };
/* 第一次併桌（AA_542 1-2，NOODLE-TEAM-SHRINK-1030；使用者 10-30 X144 桌遊團縮小成背景）：原本「規矩很簡單：週二週四，麵店。不用約，來就有人。」。
   約好的（ev_zhe_noodle_invite「好。」）18:30 出遊演 ev_zhe_long_table_out；沒約、沒答應、沒去成的，之後第一次在麵店遇到阿哲演 ev_zhe_long_table。台詞同一份 */
/* AA_606 3-3（使用者 11-03「透過阿哲認識就好」）：大一上第一次和阿哲去麵店（哲 1 第一次併桌：9/4 約的那一頓 ev_zhe_long_table_out，或之後第一次在麵店遇到 ev_zhe_long_table），開頭 Alison 跟著來、認識她（FIRST_MET noodle、熟悉 +1）；
   還不認識 Alison、大一上才演。不記 met_yu：第 3 週憲法下課的初遇（sup497 ev_yu_meet_w3／talkYu）照演，她那句改「……欸，你剛剛講得很好。」（STORY.yuIntroLines）*/
const ZHE_FIRST_TABLE_YU=G=>{ const t=typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(G.day):null; return !!t&&t.id==='Y1S1'&&!(typeof SOCIAL!=='undefined'&&SOCIAL.has('yu','FIRST_MET')); };
const ZHE_FIRST_TABLE=[ {unless:{custom:ZHE_FIRST_TABLE_YU},goto:'zft_main'},
  {speaker:null,text:'（燒臘店。阿哲旁邊多了一個女生，已經在看菜單。）'},
  {speaker:'zhe',expression:'smile',text:'Alison。宿營跟我同一隊，也是法律系。'},
  {speaker:'yu',expression:'smile',text:'嗨！我聽阿哲講過你，撕名牌被他撕掉的那個。'},
  {choice:[{text:'「對，就是我。」',goto:'zft_yu1'},{text:'「他怎麼跟妳說的？」',goto:'zft_yu2'}]},
  {label:'zft_yu1'},{speaker:'yu',expression:'laugh',text:'他說你轉身撞到他，他差點跌倒。'},{goto:'zft_yu3'},
  {label:'zft_yu2'},{speaker:'yu',expression:'smile',text:'他說他偷襲成功。……他很得意。'},
  {label:'zft_yu3'},{speaker:'zhe',expression:'neutral',text:'好了啦，點菜。'},
  {meet:[{id:'yu',where:'noodle'}],rel:{yu:{fam:1}}},
  {label:'zft_main'},
  {speaker:null,text:'（阿哲把兩張桌子併起來。）'},{speaker:'阿姨',text:'你們？法律系的？'},
  {speaker:'zhe',expression:'smile',text:'一年級。阿姨，我們之後會常來。'},{speaker:'阿姨',text:'常來是多常？'},
  {speaker:'zhe',expression:'neutral',text:'（想了一下）想吃燒臘的時候。'},{speaker:'阿姨',text:'那就是常來。'},
  {speaker:'zhe',expression:'smile',text:'（對你）這家便宜，又近。之後想吃飯就來，遇到就一起坐。'} ];
const STORY_EVENTS=[
  // ────────────────────────────────────────── 語彤：雨天圖書館門口（Vertical Slice）
  /* AA_625 第 1 節（使用者 11-03 重寫；AA 定稿 D109，一字照稿）：已經在一盞茶屋認識（YT_MET_JOB，events3d.js X.check 對 participants 有 heroine_03 的事件一律要）。
     她忘了帶傘，祐廷陪她在門口躲雨；雨停，她要回家，在新生南路。記 SHARED_UMBRELLA（名稱照舊；這一版沒有傘，意思是「一起躲過雨」）、rain_umbrella 'wait'。
     原本四個選項的版本（傘給她、便利商店、我也沒帶）作廢；舊存檔演過的照舊（once）。認識她不再從這裡（FIRST_MET 在茶屋第一班記）*/
  { id:'ev_rain_library_door', title:'雨天的總圖門口', participants:['heroine_03'], location:'campus', near:{x:81,z:0,r:7}, trigger:'auto', time:[18,23], weather:'rain', day_min:3, once:true, prereq:{flags:['YT_MET_JOB'],notMemory:[{npc:'heroine_03',tag:'SHARED_UMBRELLA'}]},
    spawn:{npc:'heroine_03',at:{x:80.5,z:2.6},pose:'idle'}, background:'blur', cg_id:'cg_library_rain_heroine03',
    dialogue:[
      {speaker:null,text:'（總圖門口。雨下得很大。語彤站在屋簷下，手上沒有傘。）'},
      {speaker:'heroine_03',expression:'neutral',text:'……嗯。我忘了帶傘。'},
      {choice:[{text:'「我陪妳等一下。」',goto:'wait'},{text:'（站到她旁邊。）',goto:'wait'}]},
      {label:'wait'},
      {speaker:null,text:'（你們站在屋簷下。雨打在台階上，濺起來的水碰到鞋子。）'},
      {speaker:null,text:'（過了二十分鐘，雨停了。）'},
      {speaker:'player',text:'妳要走去捷運站的方向嗎？'},
      {speaker:'heroine_03',expression:'neutral',text:'我要回家。……在新生南路。'},
      {speaker:'player',text:'妳太爽了吧，家裡就住學校對面。'},
      {speaker:null,text:'（語彤沒說什麼。她看了你一眼，往校門走了。）'},
      {consequences:{mem:[{npc:'heroine_03',tag:'SHARED_UMBRELLA',note:'雨天總圖門口，一起躲雨'},{npc:'heroine_03',tag:'RAIN_LIBRARY'}],rel:{heroine_03:{fam:4,comf:3}},flags:{rain_umbrella:'wait'},memo:'雨天在總圖門口陪語彤躲雨'}} ],
    consequences:{goal:'自由行動'}, despawn:20, after:(G,GM,npcs)=>{ const n=npcs[0]; if(n){ n.beh='route'; n.waypoints=[[70,-2.5],[40,-2.5],[30,-6]]; n.pauseAt=false; n.talk=null; } } },
  // 沒下雨的另一種初遇
  /* AA_313 4-4：那行是旁白（原本 speaker:'player'，對話框會變成「祐廷：祐廷看了一下手機……」）；選「點個頭就走」直接結束、不記 FIRST_MET（noMeet：開場不替她記認識，
     另外兩個選項才 meet、接她的自我介紹）——之後還能在雨天的總圖門口、麵店第一次認識她 */
  { id:'ev_library_door_phone', retired:'AA_661 第 15 列（AA_610 第 1 節）：認識語彤一定先在茶屋（YT_MET_JOB）——這一場新玩家不演，定義留給已經演過的舊存檔', title:'總圖門口', participants:['heroine_03'], noMeet:['heroine_03'], location:'campus', near:{x:81,z:0,r:6}, trigger:'auto', time:[17,22], not_weather:'rain', day_min:3, once:true, random_weight:20, prereq:{notMemory:[{npc:'heroine_03',tag:'FIRST_MET'}]}, spawn:{npc:'heroine_03',at:{x:79.5,z:3.2},pose:'idle'}, background:'blur',
    dialogue:[ {speaker:null,text:'總圖門口有個女生一直在看手機，看一眼、收起來、再看一眼。'},{speaker:'heroine_03',expression:'neutral',text:'……不好意思，現在幾點？'},{speaker:null,text:'你看了一下手機，告訴她時間。'},{speaker:'heroine_03',expression:'tired',text:'她又遲到了。高中同學，每次都這樣。'},{choice:[{text:'「要不要先進去等？裡面有冷氣。」',consequences:{meet:'heroine_03',rel:{heroine_03:{fam:4,comf:3}}}},{text:'「妳是社會系的？我好像在三樓看過妳。」',consequences:{meet:'heroine_03',rel:{heroine_03:{fam:5}},mem:[{npc:'heroine_03',tag:'PLAYER_ASKED_QUESTION'}]}},{text:'（點個頭就走）',consequences:{rel:{heroine_03:{fam:1}}},end:true}]},{speaker:'heroine_03',expression:'smile',text:'陳語彤。你是法律系的吧。你們系的人走路都很快。'} ], despawn:30, after:(G,GM,npcs)=>{ const n=npcs[0]; if(n){ n.beh='idle'; n.talk=null; } } },
  // 麵店：語彤在幫忙（她阿姨的店）
  /* 語彤的聯絡方式（AA_70 第 2 節、AA_124 1-7，第②級，2026-10-14）：雨天的總圖門口之後，在麵店遇到她（AA_11 事件 2）——她把手機推過來：「傘的事。……你的聯絡方式。」
     雨天把傘給她（HELPED）：「我還你傘的時候要找你。」（她三年都沒還）；其他：「下次下雨的時候找你。」。沒有雨天、已經有聯絡方式的不說（錯過的到「有點熟」可以當面交換）。
     「很少在這裡看到你。」（AA_358 2-6：原本「圖書館那天之後就沒再看到你。」，在麵店認識她的玩家沒有圖書館那天）只給兩種傘的記憶都沒有的人（notMemory；原本 unless 的兩個記憶要同時有才跳過，撐傘或給傘的人會連問兩句）。*/
  /* 學姊 W1 第一次見面（AA_218 17-3，使用者 07:5x 批准；開頭句「台階」與 Café 版 2dc7f23d；機制 BB-C 798e9b14／BB_122 ★-7）：祐廷先開口、她不會叫住他；只一次。
     地點：總圖門口的台階（作息 9/4～9/29 平日 12:10～12:50，characters.js）或 Café（靠窗的位子）；9/4 分直屬以前不演（還不知道她是直屬）。閱覽室與其他地方：talkSis 一行旁白。
     記 SIS_W1、met_sis、FIRST_MET（只有 W1 記）、rel +3（和舊的初遇一樣）。台階版說完她走進總圖 */
  /* AA_379 第 1 節（企劃線 6a105a4d；使用者 10-21 23:1x 試玩卡關「我在圖書館看到學姊 結果圖書館不能講話 這樣要怎麼觸發認識」、23:2x「就直接可以說話就好」）：
     閱覽室（library）、總圖大廳二樓自習區（library_hall）找她說話也直接演這一場（沒有選項）；開頭、最後一句換閱覽室版，中間照台階版一字不改；記號一樣 */
  { id:'ev_sis_w1', title:'直屬學姊', participants:['heroine_05'], location:['campus','cafe','library','library_hall'], trigger:'interact', priority:9, once:true, background:'blur', term:['Y1S1','Y1S2'],   /* AA_376 #19：大一的初識事件，限大一（大一沒觸發就不演；「法律系大一」）*/
    prereq:{custom:G=>{ const F=G.flags; if(F.met_sis||F.SIS_W1||(G.stage||'law')!=='law'||typeof STORY==='undefined'||G.day<STORY.dayOfKey('2025-09-04')) return false;
      if(G.zone==='campus'){ const P=typeof GAME!=='undefined'&&GAME.E&&GAME.E.player&&GAME.E.player.obj; return !!P&&Math.hypot(P.position.x-83,P.position.z-3)<8; }   /* 校園只在總圖門口的台階那裡 */
      return G.zone==='cafe'||G.zone==='library'||G.zone==='library_hall'; }},
    dialogue:[ {if:{custom:G=>G.zone==='campus'},speaker:null,text:'（她坐在總圖門口的台階上看手機，頭髮綁成馬尾。你認得她——家族群組大頭貼上那個學姊。）'},
      {if:{custom:G=>G.zone==='cafe'},speaker:null,text:'（她坐在靠窗的位子看手機，頭髮綁成馬尾。你認得她——家族群組大頭貼上那個學姊。）'},
      {if:{custom:G=>G.zone==='library'},speaker:null,text:'（她坐在靠窗的位子讀書，頭髮綁成馬尾。你認得她——家族群組大頭貼上那個學姊。）'},
      {if:{custom:G=>G.zone==='library_hall'},speaker:null,text:'（她坐在長桌的一角讀書，頭髮綁成馬尾。你認得她——家族群組大頭貼上那個學姊。）'},
      {if:{custom:G=>G.zone==='library'||G.zone==='library_hall'},speaker:null,text:'（她抬頭看到你，點了一下頭，指了指門外。）'},{if:{custom:G=>G.zone==='library'||G.zone==='library_hall'},speaker:null,text:'（你們走到樓梯間。）',libOut:true},   /* libOut（AA_595 1-B1；AA 11-02 22:30 定稿）*/
      {if:{custom:G=>typeof STORY==='undefined'||!STORY.sisZhishuOut||STORY.sisZhishuOut(G)},speaker:'player',text:'學姊好，我是{name}，妳的直屬學弟。'},
      {unless:{custom:G=>typeof STORY==='undefined'||!STORY.sisZhishuOut||STORY.sisZhishuOut(G)},speaker:'player',text:'學姊好，我是{name}，法律系大一。'},   /* AA_372 第 12 項：9/4 21:00 Kevin 公布直屬以前遇到她（台階 12:10～12:50、Café 19～21 點）不說「直屬學弟」*/
      {speaker:'heroine_05',expression:'neutral',text:'（抬頭）喔，hi。'},
      {speaker:'heroine_05',expression:'neutral',text:'開學還習慣嗎？'},
      {speaker:'player',text:'還可以。'},
      {speaker:'heroine_05',expression:'neutral',text:'民法你選哪個老師？'},
      {speaker:'player',text:'周老師。'},
      {speaker:'heroine_05',expression:'smile',text:'周老師很熱門。位置要很早去佔。'},
      {speaker:'player',text:'真的，前一堂課就要去佔了。'},
      {unless:{custom:G=>G.zone==='library'||G.zone==='library_hall'},speaker:'heroine_05',expression:'smile',text:'（笑了一下）對。我要去圖書館了。有問題再私訊我。'},
      {if:{custom:G=>G.zone==='library'||G.zone==='library_hall'},speaker:'heroine_05',expression:'smile',text:'（笑了一下）對。有問題再私訊我。'} ],   /* 她已經在圖書館（AA_379 1-2）；演完她繼續讀書 */
    consequences:{flags:{met_sis:true,SIS_W1:true}},
    after:(G,GM,npcs)=>{ if(GM.rel) GM.rel('sis',3); const n=npcs&&npcs[0]; if(n&&G.zone==='campus'){ n.beh='route'; n.waypoints=[[86.4,1.2]]; n.pauseAt=false; n.talk=null; if(GM.despawnLater) GM.despawnLater(n,6); } } },
  /* W1 的晚到版（AA_379 第 4 節，企劃線 992b58da；AA 10-22 03:19 定，BB 03:16 讀碼：會記 met_sis 的 W1、家聚、社博都在大一，大一沒找過她的玩家永遠認識不到學姊）：
     大一下結束以後（暑假也算）到 2029-06-01，第一次在 Café、法圖、閱覽室、總圖大廳自習區找她說話。記號同 W1（met_sis、SIS_W1、FIRST_MET、+3），另外記 SIS_W1_LATE；演完她繼續讀書 */
  /* AA_523 6-6（企劃線 0d7b5388b）：照第一次見面那一年換（SOCIAL.playerYear：放假照上一個學期）——大二以前「大一太忙了。」（原本）、大三「之前一直沒遇到。」、大四「四年都沒遇到。」；
     標題「晚了一年／兩年／三年」（title 用 getter，事件開演那一刻照那一年算）*/
  { id:'ev_sis_w1_late', get title(){ let y=2; try{ if(typeof SOCIAL!=='undefined'&&SOCIAL.playerYear) y=SOCIAL.playerYear(); }catch(e){ y=2; } return '直屬學姊（晚了'+(y>=4?'三':(y===3?'兩':'一'))+'年）'; }, participants:['heroine_05'], location:['cafe','lawlib','library','library_hall'], trigger:'interact', priority:9, once:true, background:'blur',
    prereq:{custom:G=>{ const F=G.flags; if(F.met_sis||F.SIS_W1||(G.stage||'law')!=='law'||typeof STORY==='undefined'||typeof CALENDAR==='undefined'||!CALENDAR.termDays) return false;
      const R=CALENDAR.termDays('Y1S2'), last=STORY.dayOfKey('2029-06-01'); return !!R&&last!=null&&G.day>R.to&&G.day<=last; }},
    dialogue:[ {if:{custom:G=>G.zone==='cafe'},speaker:null,text:'（她坐在靠窗的位子，計畫本攤開，旁邊一個保溫瓶。你認得她——家族群組大頭貼上那個學姊。）'},
      {if:{custom:G=>G.zone==='lawlib'},speaker:null,text:'（她坐在法圖最裡面那張桌子，計畫本攤開，旁邊一個保溫瓶。你認得她——家族群組大頭貼上那個學姊。）'},
      {if:{custom:G=>G.zone==='library'},speaker:null,text:'（她坐在靠窗的位子讀書，旁邊一個保溫瓶。你認得她——家族群組大頭貼上那個學姊。）'},
      {if:{custom:G=>G.zone==='library_hall'},speaker:null,text:'（她坐在長桌的一角讀書，旁邊一個保溫瓶。你認得她——家族群組大頭貼上那個學姊。）'},
      {if:{custom:G=>G.zone!=='cafe'},speaker:null,text:'（她抬頭看到你，點了一下頭，指了指門外。）'},{if:{custom:G=>G.zone!=='cafe'},speaker:null,text:'（你們走到樓梯間。）',libOut:true},   /* libOut（AA_595 1-B2：法圖、閱覽室、大廳自習區版；AA 11-02 22:30 定稿）*/
      {speaker:'player',text:'學姊好，我是{name}，妳的直屬學弟。'},
      {speaker:'heroine_05',expression:'neutral',text:'（抬頭）{name}。'},
      {speaker:'heroine_05',expression:'neutral',text:'家族群組裡的那個名字。家聚你一次都沒來。'},
      {speaker:'heroine_05',expression:'neutral',text:'我還以為，你是不需要學姊的那種人。'},
      {choice:[{text:'「大一太忙了。」',if:{custom:G=>(typeof SOCIAL!=='undefined'&&SOCIAL.playerYear?SOCIAL.playerYear():2)<=2},goto:'w1l_a'},{text:'「之前一直沒遇到。」',if:{custom:G=>(typeof SOCIAL!=='undefined'&&SOCIAL.playerYear?SOCIAL.playerYear():2)===3},goto:'w1l_a3',aa523:true},{text:'「四年都沒遇到。」',if:{custom:G=>(typeof SOCIAL!=='undefined'&&SOCIAL.playerYear?SOCIAL.playerYear():2)>=4},goto:'w1l_a4',aa523:true},{text:'「我不知道去哪裡找學姊。」',goto:'w1l_b'}]},
      {label:'w1l_a'},{speaker:'heroine_05',expression:'neutral',text:'大一都很忙。我那時候也是。'},{goto:'w1l_c'},
      {label:'w1l_a3'},{speaker:'heroine_05',expression:'neutral',text:'嗯。……現在遇到了。',aa523:true},{goto:'w1l_c'},
      {label:'w1l_a4'},{speaker:'heroine_05',expression:'neutral',text:'那還來得及。我六月才畢業。',aa523:true},{goto:'w1l_c'},
      {label:'w1l_b'},{speaker:'heroine_05',expression:'neutral',text:'晚上我大多在 Café 或法圖。不難找。'},
      {label:'w1l_c'},
      {speaker:'heroine_05',expression:'neutral',text:'溫書瑀。現在在念研究所。'},
      {speaker:'heroine_05',expression:'smile',text:'以後有問題，私訊我就好。'} ],
    consequences:{flags:{met_sis:true,SIS_W1:true,SIS_W1_LATE:true}},
    after:(G,GM)=>{ if(GM.rel) GM.rel('sis',3); } },
  /* 學姊 W1 到社博之間的接觸 ②③（AA_218 17-6，使用者 10:2x 批准；AA-C e4a8ba67 選 (a)）：
     ② 第 2 週週三 9/10 刑總下課的霖澤館走廊（要 W1、家族群組 9/8 揪過家聚）；不在場就延到週四 9/11 民總下課；再沒遇到就不演。選項只影響下一句、不記。
     ③ 9/12（五）19:00 家聚（公館巷子裡的簡餐店，出遊；story3d.js 排的）：去了記 SIS_FAM_DINNER；還沒做過 W1 的在這裡第一次見到她＝也算 W1（SIS_W1、met_sis、FIRST_MET；和社博的合併版同一個做法，LAWWW-C 定、已請 BB-C 看）*/
  { id:'ev_sis_fam_hall', title:'週五家聚你會來嗎', participants:['heroine_05'], location:'any', trigger:'class', afterClass:'crim_gen1', term:['Y1S1'], weeks:[2], weekday:[3], once:true, priority:6, background:'blur',
    prereq:{flags:['SIS_W1'],custom:G=>!G.flags.SIS_FAM_HALL&&typeof PHONE!=='undefined'&&PHONE.sent(G,'sis_fam_inv')},
    dialogue:[ {speaker:null,text:'（法律系館A的走廊。下課的人往樓梯擠，學姊從另一頭走過來。）'},{speaker:'player',text:'學姊。'},
      {speaker:'heroine_05',expression:'neutral',text:'學弟。剛下課？'},{speaker:'player',text:'對，刑總。'},{speaker:'heroine_05',expression:'neutral',text:'週五家聚你會來嗎？'},
      {choice:[{text:'「會啊。」',goto:'a'},{text:'「還不確定。」',goto:'b'}]},
      {label:'a'},{speaker:'heroine_05',expression:'smile',text:'好，那週五見。'},{goto:'end'},
      {label:'b'},{speaker:'heroine_05',expression:'neutral',text:'可以的話就來。大家都會去。'},
      {label:'end'},{speaker:'heroine_05',expression:'neutral',text:'我先去圖書館了。'},{set:{SIS_FAM_HALL:true}} ] },
  { id:'ev_sis_fam_hall2', title:'週五家聚你會來嗎', participants:['heroine_05'], location:'any', trigger:'class', afterClass:'civ_general', term:['Y1S1'], weeks:[2], weekday:[4], once:true, priority:6, background:'blur',
    prereq:{flags:['SIS_W1'],custom:G=>!G.flags.SIS_FAM_HALL&&typeof PHONE!=='undefined'&&PHONE.sent(G,'sis_fam_inv')},
    dialogue:[ {speaker:null,text:'（法律系館A的走廊。下課的人往樓梯擠，學姊從另一頭走過來。）'},{speaker:'player',text:'學姊。'},
      {speaker:'heroine_05',expression:'neutral',text:'學弟。剛下課？'},{speaker:'player',text:'對，民總。'},{speaker:'heroine_05',expression:'neutral',text:'週五家聚你會來嗎？'},
      {choice:[{text:'「會啊。」',goto:'a'},{text:'「還不確定。」',goto:'b'}]},
      {label:'a'},{speaker:'heroine_05',expression:'smile',text:'好，那週五見。'},{goto:'end'},
      {label:'b'},{speaker:'heroine_05',expression:'neutral',text:'可以的話就來。大家都會去。'},
      {label:'end'},{speaker:'heroine_05',expression:'neutral',text:'我先去圖書館了。'},{set:{SIS_FAM_HALL:true}} ] },
  { id:'ev_sis_fam_dinner', title:'家聚', participants:['heroine_05'], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
    dialogue:[ {scene:'公館・巷子裡的簡餐店',bg:'gg_family_diner'},{speaker:null,text:'（長桌坐了七八個人，大一到大四都有。）'},
      {speaker:'Kevin',text:'來來來，學弟坐這邊。介紹一下，這是我們家的大一，{name}。'},
      {speaker:null,text:'（大家：「嗨——」溫書瑀坐在對面，朝你點了一下頭。）'},
      {unless:{flags:['SIS_W1']},speaker:'player',text:'學姊好，我是{name}。我是妳的直屬。'},   /* 沒做過 W1：祐廷先開口（AA_218 17-1；AA-C 15:59 台詞，BB-C 審口氣中）*/
      {unless:{flags:['SIS_W1']},speaker:'heroine_05',expression:'neutral',text:'我知道。名單上看過你的名字。'},
      {unless:{flags:['SIS_W1']},speaker:'heroine_05',expression:'neutral',text:'我是溫書瑀。課的事可以問我。'},
      {speaker:'Kevin',text:'書瑀學姊很厲害喔，憲法傳奇，張老師給她 95。'},
      {speaker:'heroine_05',expression:'annoyed',text:'你可以不要每年都講這個嗎。'},
      {speaker:'Kevin',text:'要啊，這是我們家的傳統。'},
      {speaker:null,text:'（大家笑。菜上來了。）'},
      {speaker:null,text:'（吃完在店門口，她說要回家念書，先走了。）'},
      {speaker:'heroine_05',expression:'neutral',text:'我先回去了，你們慢慢聊。'},
      {set:{SIS_FAM_DINNER:true}},{unless:{flags:['SIS_W1']},set:{SIS_W1:true,met_sis:true,_W1_AT_DINNER:true}} ],
    after:(G,GM)=>{ if(typeof SOCIAL!=='undefined'&&!SOCIAL.has('heroine_05','FIRST_MET')) SOCIAL.remember('heroine_05','FIRST_MET','家聚'); } },
  /* 社團博覽會・法服的攤位（AA_218 17-3 社博，使用者 07:5x 批准；AA-C 09:50：做過 W1＝主版本、沒做過＝合併版。17-6 的 ④ 9/16 私訊是強制演出，所以做過 W1 的人到社博時一定有 ②～④ 至少一次＝主版本前提成立；家聚第一次見到她的也算 W1）。
     社博那天（新局 9/6（六）10:00～16:00、舊局 9/30、10/1；AA_485 3-2）椰林大道法服的帳篷（src/clubfair3d.js 的互動點；服務台的選單選法服也演這一段）。只一次，記 SIS_CLUB_EXPO；祐廷直接寫報名表＝加入法服（lawclub、CLUB_lawclub_study）。
     社博搬到 9/6 以後在家聚（9/12）、9/16 私訊之前：做過 W1（9/3）＝主版本、沒做過＝合併版，兩條都接得上（AA_485 3-2）；私訊問過「問社博」的照主版本（AA_485 第 4 節，SIS_MSG_EXPO）。
     合併版同時算 W1（SIS_W1、met_sis、FIRST_MET、學姊 +3）。「學姐」「學長」是背景社員，不取名 */
  /* 學姊 A5-1 新版 C1（BB_188 @05571a45 原文，使用者 10:3x 對 LAWWW-C「通過」；實作照 AA_218 17-13 第 3、5 點）：她研究所放榜（3/23，SIS_RESULT_OUT）以後，
     2026-04-08（三）16:30 法學院圖書館外的台階；玩家不在校內就延到下一個週三 16:30（跳過考試週＝大一下第 8～9 週），最晚第 15 週。B 發生過（9/3 加好友）才有；不必交往、沒有好感門檻。
     祐廷說完「……等一下。我高二校慶好像被問過。」以後插播回想 A（BB_188 A 十項回覆版），演完回到台階。CG BCG-49 還沒有：先用操場的一般背景。記 SIS_FESTIVAL_MET（C2 讀）*/
  { id:'ev_sis_c1_festival', title:'高二的校慶', participants:['heroine_05'], location:['campus','linze','classroom','wancai','library','library_hall','lawlib','soclib','boya','putong','gym','gym_b1','gym_arena'], trigger:'auto', term:['Y1S2'], weeks:[7,10,11,12,13,14,15], weekday:[3], time:[16.5,18], once:true, priority:7, background:'blur',
    prereq:{flags:['SIS_CONTACTED','SIS_RESULT_OUT','met_sis'],custom:G=>typeof STORY!=='undefined'&&STORY.dayOfKey&&G.day>=STORY.dayOfKey('2026-04-08')},   /* AA_518 4-12：要見過她（met_sis）；只加過好友、沒見過的玩家不會被她當熟人叫住 */
    dialogue:[ {scene:'首都帝大・法學院圖書館外的台階',bg:'ntu_linze'},{speaker:null,text:'（你走過法學院圖書館外面的台階，學姊坐在最上面一階，旁邊放著一杯咖啡。）'},
      {speaker:'heroine_05',expression:'neutral',text:'你下學期通識選好了嗎？'},
      {speaker:'player',text:'還沒。有推薦的嗎？'},
      {speaker:'heroine_05',expression:'smile',text:'我大一修過一門，還滿好玩的。期末要分組做訪談，還要錄影。'},
      {speaker:'heroine_05',expression:'neutral',text:'我們那組回我高中，校慶那天去找學弟妹，問有沒有人願意之後配合我們錄影。'},
      {speaker:'player',text:'妳高中就是我高中啊。'},
      {speaker:'heroine_05',expression:'neutral',text:'對啊。'},
      {speaker:'player',text:'……等一下。我高二校慶好像被問過。一群大學生，說他們是首都帝大法律的，要錄影、要約好幾次。'},
      {scene:'回想・高二上的校慶',bg:'camp_school'},
      {speaker:null,text:'（高二上，校慶。操場邊排滿攤位，很吵。你手上一碗剉冰，煉乳快要和紅豆化在一起。）'},
      {speaker:null,text:'（三、四個大學生走過來。後面一個長頭髮的女生拿著筆記本，翻開的那頁已經寫了好幾個電話。）'},
      {speaker:'組員',text:'學弟，不好意思打擾一下。我們是首都帝大法律系的，在做通識課的作業。'},
      {speaker:'組員',text:'想找願意之後配合我們訪談的同學，要錄影，大概會約幾次。'},
      {speaker:'player',text:'……要錄影喔。'},
      {speaker:'player',text:'（低頭挖了一口冰）嗯……我想一下。'},
      {speaker:'另一個組員',text:'沒關係，你可以先考慮。留個電話給我們？之後排好時間再打給你。'},
      {speaker:'player',text:'喔，好。'},
      {speaker:null,text:'（你一邊挖冰，一邊把號碼念出來。後面那個女生低頭抄進筆記本。）'},
      {speaker:'溫書瑀',text:'不好意思，最後四個數字再念一次？'},   /* 回想裡不用現在的立繪（她那時長髮放下來、沒綁；BCG-49 之後補）：字串名字、不對到 heroine_05 */
      {speaker:null,text:'（你又念了一次。冰滴到手上，你換一隻手拿。）'},
      {speaker:'組員',text:'好，謝謝學弟！'},
      {speaker:null,text:'（他們往下一攤走。你低頭繼續吃冰。冰已經化掉一半了。）'},
      {scene:'首都帝大・法學院圖書館外的台階',bg:'ntu_linze'},
      {speaker:'heroine_05',expression:'surprised',text:'真的假的？你高二是哪一年？'},
      {speaker:'player',text:'高二上。……那時候妳大一。'},
      {speaker:'heroine_05',expression:'neutral',text:'那就是我們啊。'},
      {speaker:'player',text:'真的假的。'},
      {speaker:'heroine_05',expression:'smile',text:'不然誰會這麼巧。我們那天問了十幾組。'},
      {speaker:'heroine_05',expression:'neutral',text:'你那時候有答應嗎？'},
      {speaker:'player',text:'我在吃冰，說要想一下。他們叫我留電話，我就留了。後來也沒人打來。'},
      {speaker:'heroine_05',expression:'neutral',text:'我們後來好像一個都沒打。……抱歉。'},
      {speaker:'player',text:'所以那天妳也在。'},
      {speaker:'heroine_05',expression:'neutral',text:'應該在。可是我完全不記得你。'},
      {speaker:'player',text:'我也沒看到妳的臉。我一直在看我的冰。'},
      {choice:[{text:'「我們那時候就見過了耶。」',goto:'met'},{text:'「妳那時候長什麼樣子？」',goto:'look'},{text:'「早知道那天就好好看一下。」',goto:'see'}]},
      {label:'met'},{speaker:'heroine_05',expression:'smile',text:'對啊。好神奇。'},{goto:'end'},
      {label:'look'},{speaker:'heroine_05',expression:'neutral',text:'頭髮放下來，沒綁。你呢？'},{speaker:'player',text:'……金色的。'},{speaker:'heroine_05',expression:'surprised',text:'金色？'},{speaker:null,text:'（她笑到停不下來。）'},{goto:'end'},
      {label:'see'},{speaker:'heroine_05',expression:'neutral',text:'看了也不會記得啦。'},{speaker:'heroine_05',expression:'smile',text:'不過真的很巧。'},
      {label:'end'},{set:{SIS_FESTIVAL_MET:true}} ],
    after:G=>{ if(typeof STORY!=='undefined'&&STORY.albumMemory) STORY.albumMemory(G,'sis_hs_festival','高二的校慶','camp_school'); } },   /* Life Album 收「高二的校慶」（AA_218 17-13 第 5 點；BCG-49 還沒有圖，先用操場）*/
  /* C2 她家搬家（BB_188 C2 ①，AA_218 15-7、17-13 第 4 點）：只有和她交往中、C1 演過（SIS_FESTIVAL_MET）才演，日子是 STORY.sisC2Day（7/11 已交往＝當天；之後才交往＝隔 3 天以上的第一個週六）。
     2D 只演她：她的房間（沒有背景圖，暗底）。之後的私訊在 story3d.js（sis_c2_msg，照片＋三個選項）。
     那天沒演到（暑假快轉、整天在外面）：之後第一個能演的時候補，第一句換成「搬家後還有幾箱沒拆。」（AA 給的另一句；LAWWW 只是讓它不會整個錯過）*/
  { id:'ev_sis_c2_room', title:'筆記本', participants:[],   /* 只演她、祐廷不在場：不算期末的「一起在場」*/ location:'any', trigger:'auto', time:[15,23], once:true, priority:7, background:'dark',
    prereq:{flags:['dating_heroine_05','SIS_FESTIVAL_MET'],custom:G=>{ const d=typeof STORY!=='undefined'&&STORY.sisC2Day?STORY.sisC2Day(G):null; return d!=null&&G.day>=d; }},
    dialogue:[ {scene:'溫學姊的房間',bg:'sis_room_moving'},   /* 11-02 使用者生成（搬家的紙箱；原本沒有 bg＝深色底）*/
      {if:{custom:G=>G.day===STORY.dayOfKey('2026-07-11')},speaker:'heroine_05',expression:'neutral',text:'阿公奶奶要搬到小一點的房子。我在幫忙打包。'},   /* AA_611 第 1 節第 11 列（企劃線 3f85566f4）：搬的是阿公奶奶家（原本旁白「（家裡要搬家。她的房間地上好幾個紙箱，一半已經封起來。）」；紙箱在背景 sis_room_moving）*/
      {unless:{custom:G=>G.day===STORY.dayOfKey('2026-07-11')},speaker:null,text:'（搬家後還有幾箱沒拆。）'},
      {speaker:null,text:'（書架最下面一層，一本封面有點皺的筆記本。大一的通識課。她翻開，停在一頁，笑了一下，拿起手機拍照。）'} ],
    after:G=>{ G.flags.SIS_C2_ROOM=G.day; G.flags.SIS_C2_H=Math.min(23.5,Math.max(16,(G.hour%24)+0.25)); if(typeof STORY!=='undefined'&&STORY.albumMemory) STORY.albumMemory(G,'sis_notebook','筆記本那一頁',''); } },   /* Life Album 收「筆記本那一頁」（BB_188 C2）：號碼不能看得清楚，先不放圖 */
  /* 公館的補習班門口：平日 18:00～18:30，Kevin 去上班前招呼一次（AA_241 9-2；BB_198 大一寒假那列 d142d98d：大一寒假每個玩家都有、日本那週 1/24～1/31 除外；大二寒假起只給沒報 C04W 的；一個假期一次；VAC.kevinDoor）*/
  { id:'ev_kevin_cram_door', title:'補習班門口', participants:[], location:'gongguan', trigger:'auto', weekday:[1,2,3,4,5], time:[18,18.5], priority:3, background:'blur',
    prereq:{custom:G=>typeof VAC!=='undefined'&&!!VAC.kevinDoor&&!!VAC.kevinDoor(G)},
    dialogue:[ {speaker:'Kevin',text:'學弟！路過喔？我要上班了，下次聊。',unless:{custom:G=>!!G.flags.KEVIN_DOOR&&Object.keys(G.flags.KEVIN_DOOR).length>0}},
      {speaker:'Kevin',text:'又是你。……真的不報一下？',if:{custom:G=>!!G.flags.KEVIN_DOOR&&Object.keys(G.flags.KEVIN_DOOR).length>0}} ],   /* 第二個假期以後換這一句 */
    after:G=>{ const k=typeof VAC!=='undefined'&&VAC.kevinDoor?VAC.kevinDoor(G):null; if(k) (G.flags.KEVIN_DOOR||(G.flags.KEVIN_DOOR={}))[k]=G.day; } },
  /* 子晴問阿凱（AA_218 17-11 @5063fbaf 台詞；BB_191 9-7 觸發）：上課日 17:00 資工系下課問的（romance3d.js zqAskTick 記 ZQ_ASK_KAI_D、寫 knowsGF.heroine_04 told_by:kai），
     那晚玩家第一次睡覺時演給玩家看（睡覺觸發；字卡「17:00　資工系館」、暗底：走廊的圖還沒有）。祐廷不在場、不知道（ytKnows 不變）*/
  { id:'ev_zq_ask_kai', title:'你室友有女朋友嗎', participants:[],   /* 祐廷不在場：不放 participants（會被算成認識、期末的「一起在場」）；立繪照每一句的 speaker */ location:'any', trigger:'sleep', once:true, priority:6, background:'dark', sleepCard:['17:00','資工系館'],
    prereq:{custom:G=>G.flags.ZQ_ASK_KAI_D!=null&&G.day>=G.flags.ZQ_ASK_KAI_D},
    dialogue:[ {scene:'資工系館・走廊',bg:'csie_corridor'},   /* 11-02 使用者生成（原本暗底）*/
      {speaker:'heroine_04',expression:'neutral',text:'欸，你室友……有女朋友嗎？'},
      {speaker:'kai',text:'有啊，在台中念書。怎樣？'},   /* AA_886 第 2 節 */
      {speaker:'heroine_04',expression:'smile',text:'沒有啊，問問。'} ] },
  { id:'ev_sis_club_expo', title:'社團博覽會・法服', participants:['heroine_05'], location:'campus', trigger:'manual', once:true, background:'blur',
    prereq:{custom:G=>!G.flags.SIS_CLUB_EXPO},
    dialogue:[ {speaker:null,text:'（椰影大道上一整排帳篷。你走到法服的攤位前。）'},
      {speaker:'學姐',text:'學弟，要不要聽一下？我們是法律服務社——'},
      {if:{flags:['SIS_MSG_EXPO']},unless:{flags:['SIS_W1']},set:{SIS_W1:true,met_sis:true,_EXPO_MERGED:true}},   /* MSG-SIS-EARLY-1027（AA_485 第 4 節）：私訊問過「問社博」的玩家照「見過」那一條，不另外加句子；這裡第一次見到她＝也算 W1（同合併版）*/
      {if:{flags:['SIS_W1']},goto:'main'},
      {speaker:null,text:'（帳篷前面站著一個綁馬尾的人，手上拿著一疊傳單。你認得她——家族群組大頭貼上那個學姊。）'},
      {speaker:'player',text:'學姊好，我是{name}，妳的直屬學弟。'},
      {speaker:'heroine_05',expression:'neutral',text:'你好。'},
      {speaker:'heroine_05',expression:'neutral',text:'（對旁邊的學姐）這我直屬學弟，我來跟他講。'},
      {set:{SIS_W1:true,met_sis:true,_EXPO_MERGED:true}},{goto:'common'},
      {label:'main'},{speaker:null,text:'（站在帳篷前面那個綁馬尾的人轉過來，看到你。）'},
      {speaker:'heroine_05',expression:'surprised',text:'學弟？'},
      {speaker:'heroine_05',expression:'neutral',text:'這我直屬學弟，我來跟他講。'},
      {label:'common'},{speaker:'學長',text:'喔，學弟，她是我們前任社長。'},
      {speaker:'heroine_05',expression:'neutral',text:'以前的事了。我現在大四，在準備研究所。'},
      {speaker:'heroine_05',expression:'smile',text:'隔週的禮拜六有法律服務，民眾會來問問題。會累。可是有一些事情，只有在那裡才會知道。'},
      {speaker:null,text:'（你直接拿起報名表寫了名字。）'},
      {speaker:'heroine_05',expression:'smile',text:'這麼快？好啊，歡迎。'} ],
    consequences:{flags:{SIS_CLUB_EXPO:true,lawclub:true,CLUB_lawclub_study:true}},
    after:(G,GM)=>{ if(G.flags._EXPO_MERGED){ delete G.flags._EXPO_MERGED; if(GM.rel) GM.rel('sis',3); } } },
  { id:'ev_noodle_yutong', retired:true, title:'阿鳳麵店', participants:['heroine_03'],   /* retired：AA_610 第 4 節「她原本在麵店見面那場 retired 給新玩家」、AA_624 事件 2 拿掉；舊存檔演過的照留（id、記憶不動）*/ location:'noodle', trigger:'interact', priority:5, once:true, prereq:{memory:[{npc:'heroine_03',tag:'FIRST_MET'}]}, background:'blur',   /* AA_186 第 6 節 A（AA-B 19:1x：不改字的修正照做）：只演一次——原本 cooldown 2 天，每兩天重演一次初見、擋掉她的閒聊階梯 */
    dialogue:[ {speaker:'heroine_03',expression:'surprised',text:'……你？'},{speaker:'heroine_03',expression:'neutral',text:'這是我阿姨的店。二、四晚上我來幫忙。'},{if:{memory:[{npc:'heroine_03',tag:'SHARED_UMBRELLA'}]},speaker:'heroine_03',expression:'smile',text:'說好要還你一把傘，我還沒買。你還記得那天嗎？雨大到看不見校門。'},{if:{memory:[{npc:'heroine_03',tag:'HELPED'}]},speaker:'heroine_03',expression:'smile',text:'你的傘我帶來了，放在櫃台後面。那天你到底有沒有淋濕？'},{if:{notMemory:[{npc:'heroine_03',tag:'SHARED_UMBRELLA'},{npc:'heroine_03',tag:'HELPED'}]},speaker:'heroine_03',expression:'neutral',text:'很少在這裡看到你。你都幾點吃飯？'},{if:{events:['ev_rain_library_door']},unless:{custom:G=>typeof INV!=='undefined'&&INV.hasContact(G,'heroine_03')},speaker:null,text:'（她把手機推過來。）'},{if:{events:['ev_rain_library_door']},unless:{custom:G=>typeof INV!=='undefined'&&INV.hasContact(G,'heroine_03')},speaker:'heroine_03',expression:'neutral',text:'傘的事。……你的聯絡方式。'},{if:{events:['ev_rain_library_door'],memory:[{npc:'heroine_03',tag:'HELPED'}]},unless:{custom:G=>typeof INV!=='undefined'&&INV.hasContact(G,'heroine_03')},speaker:'heroine_03',expression:'neutral',text:'我還你傘的時候要找你。',consequences:{contact:'heroine_03'}},{if:{events:['ev_rain_library_door']},unless:{custom:G=>(typeof INV!=='undefined'&&INV.hasContact(G,'heroine_03'))||(typeof SOCIAL!=='undefined'&&SOCIAL.has('heroine_03','HELPED'))},speaker:'heroine_03',expression:'neutral',text:'下次下雨的時候找你。',consequences:{contact:'heroine_03'}},{choice:[{text:'「乾麵，加滷蛋。」',consequences:{rel:{heroine_03:{fam:3,comf:2}},mem:[{npc:'heroine_03',tag:'SHARED_MEAL',note:'她端來的乾麵'}],money:-75,energy:20,advance:0.5}},{text:'「妳阿姨的店？那妳從小就在公館？」',consequences:{rel:{heroine_03:{fam:4,trust:3}},mem:[{npc:'heroine_03',tag:'TALKED_FAMILY',note:'她從小在麵店長大'}]},goto:'family'},{text:'「今天忙嗎？我改天再來。」',consequences:{rel:{heroine_03:{fam:1}}},end:true}]},{goto:'end'},{label:'family'},{speaker:'heroine_03',expression:'thinking',text:'嗯。我媽身體不太好，我阿姨一個人顧不來。'},{speaker:'heroine_03',expression:'neutral',text:'這個我從小就做了。乾麵？要不要加蛋？'},{speaker:'player',text:'好，加蛋。'},{set:{},rel:{heroine_03:{comf:3}},mem:[{npc:'heroine_03',tag:'SHARED_MEAL'}],advance:0.5},{label:'end'},{speaker:'heroine_03',expression:'smile',text:'慢慢吃。碗放著就好。'} ] },
  // ────────────────────────────────────────── 芷若：咖啡廳店員／通識課
  { id:'ev_cafe_barista_zhiruo', title:'兩點半的店員', participants:['heroine_02'], location:'cafe', trigger:'interact', priority:5, cooldown_days:1, background:'blur',
    prereq:{custom:G=>!(typeof STORY!=='undefined'&&STORY.zrNoShift&&STORY.zrNoShift(G))},   /* AA_375 第 1 項：2027-06-04～09-02 她不上班（在 Café 是客人），和她說話不是點餐 */
    /* 芷若 Z1（BB_95 2-2，交接包 v1，2026-10-14）：點餐次數 CAFE_VISITS（每次點餐 +1；BB_90 芷若支線用同一個）。
       第 1 次才自我介紹（「林芷若，外文二」只說這一次）；已經在經原分組（ev_zhiruo_ge_group）認識的，第 1 次也不說名字；第 2～4 次「老樣子？」（SHARED_SECRET 的開場優先）；
       第 5 次起不問、直接做第一次點的東西（zhiruoFirstOrder；第一次點的東西也寫在 SHARED_MEAL 的備註）；第 5 次給集點卡和店裡的聯絡方式（加了：zhiruoShopContactDay，手機 4-2 照這一天排）。
       舊存檔（點過、沒有計數）：讀檔時補成 1（game3d.js 的 migrate）。
       好朋友以上（SOCIAL.friendLevel＝CLOSE_FRIEND）：點餐之後多一句旁白「紙杯上多了一行字……」——AA_207 §3-3：只有第一次（還沒有 zhiruoCupNote）一定出，之後每次 ZR_CUP_NOTE_P（十分之一）的機率；（BB_120 1-2「固定的改變：點單」，2026-10-14 和 LAWWW 對齊：開場照 Z1、不另寫一套）；
       她只寫場景、不寫台詞原文；記 zhiruoCupNote（尾聲桌上「芷若寫字的紙杯」從這裡開始）。*/
    dialogue:[ {if:{flagNum:{CAFE_VISITS:{max:0}}},unless:{memory:[{npc:'heroine_02',tag:'FIRST_MET'}],events:['ev_zhiruo_ge_group']},speaker:'heroine_02',expression:'smile',text:'歡迎光臨——喔，法律系的？要喝什麼，慢慢看。'},{if:{flagNum:{CAFE_VISITS:{max:0}},memory:[{npc:'heroine_02',tag:'FIRST_MET'}],events:['ev_zhiruo_ge_group']},speaker:'heroine_02',expression:'smile',text:'啊，經原那組的。今天喝什麼？'},{if:{flagNum:{CAFE_VISITS:{min:1,max:3}},memory:[{npc:'heroine_02',tag:'SHARED_SECRET'}]},speaker:'heroine_02',expression:'smile',text:'又來了。今天要「老樣子」嗎？我記得你的。'},{if:{flagNum:{CAFE_VISITS:{min:1,max:3}}},unless:{memory:[{npc:'heroine_02',tag:'SHARED_SECRET'}]},speaker:'heroine_02',expression:'smile',text:'老樣子？'},{if:{flagNum:{CAFE_VISITS:{min:4}}},goto:'auto'},{choice:[{text:'「拿鐵。妳怎麼知道我是法律系？」',consequences:{rel:{heroine_02:{fam:4,comf:2}},money:-120,energy:10,advance:0.15,inc:{CAFE_VISITS:1},setOnce:{zhiruoFirstOrder:'拿鐵'}},goto:'how'},{text:'「手沖。妳推薦哪一支？」',consequences:{rel:{heroine_02:{fam:4,resp:3}},money:-150,energy:12,advance:0.15,inc:{CAFE_VISITS:1},setOnce:{zhiruoFirstOrder:'手沖'}},goto:'rec'},{text:'「檸檬塔。然後——妳是外文系的？」',unless:{memory:[{npc:'heroine_02',tag:'FIRST_MET'}]},consequences:{rel:{heroine_02:{fam:5,trust:3}},money:-110,energy:14,advance:0.15,inc:{CAFE_VISITS:1},setOnce:{zhiruoFirstOrder:'檸檬塔'}},goto:'dept'},{text:'「只是看看。」',consequences:{rel:{heroine_02:{fam:1}}},end:true}]},{goto:'end'},{label:'how'},{speaker:'heroine_02',expression:'smile',text:'你背包上的識別證。'},{unless:{memory:[{npc:'heroine_02',tag:'FIRST_MET'}]},speaker:'heroine_02',expression:'smile',text:'林芷若，外文系的。這裡平日晚上都在，一、三、五中午也在。你想念書的話，窗邊那桌最安靜。'},{goto:'end'},{label:'rec'},{speaker:'heroine_02',expression:'thinking',text:'今天的是衣索比亞，有點像……早場電影散場、走出戲院的那種早上。'},{unless:{memory:[{npc:'heroine_02',tag:'FIRST_MET'}]},speaker:'heroine_02',expression:'embarrassed',text:'抱歉，職業病。外文系的，看太多電影。林芷若。'},{if:{memory:[{npc:'heroine_02',tag:'FIRST_MET'}]},speaker:'heroine_02',expression:'embarrassed',text:'抱歉，職業病。'},{goto:'end'},{label:'dept'},{speaker:'heroine_02',expression:'surprised',text:'……你怎麼知道？'},{speaker:'player',text:'櫃台後面那本《電影理論》。'},{unless:{memory:[{npc:'heroine_02',tag:'FIRST_MET'}]},speaker:'heroine_02',expression:'smile',text:'好，你贏了。林芷若，外文系的。你們法律系，有人看老片嗎？陪審團吵一整晚的那種。'},{if:{memory:[{npc:'heroine_02',tag:'FIRST_MET'}]},speaker:'heroine_02',expression:'smile',text:'好，你贏了。你們法律系，有人看老片嗎？陪審團吵一整晚的那種。'},{set:{zhiruo_film_invite:true},mem:[{npc:'heroine_02',tag:'INVITED_CLUB',note:'問你看不看老片'}]},{goto:'end'},
      {label:'auto'},{unless:{flagIs:{zhiruoFirstOrder:'檸檬塔'}},speaker:'heroine_02',expression:'smile',text:'{flag:zhiruoFirstOrder|拿鐵}。……我已經在做了。'},{if:{flagIs:{zhiruoFirstOrder:'檸檬塔'}},speaker:'heroine_02',expression:'smile',text:'檸檬塔。……我已經在切了。'},{if:{flagIs:{zhiruoFirstOrder:'手沖'}},consequences:{rel:{heroine_02:{fam:3}},money:-150,energy:12,advance:0.15}},{if:{flagIs:{zhiruoFirstOrder:'檸檬塔'}},consequences:{rel:{heroine_02:{fam:3}},money:-110,energy:14,advance:0.15}},{unless:{flagIs:{zhiruoFirstOrder:['手沖','檸檬塔']}},consequences:{rel:{heroine_02:{fam:3}},money:-120,energy:10,advance:0.15}},{inc:{CAFE_VISITS:1}},{if:{flagNum:{CAFE_VISITS:{max:5}}},goto:'card'},{goto:'end'},
      {label:'card'},{speaker:null,text:'她遞過來一張集點卡。集十點送一杯——前四次她也補蓋了，蓋到第五格。'},{speaker:null,text:'卡片背面寫著店裡的聯絡方式：「點餐可以先傳。」'},{choice:[{text:'（加店裡的帳號）',consequences:{stamp:['zhiruoShopContactDay'],memo:'加了兩點半的帳號（點餐可以先傳）'}},{text:'（把卡片收進錢包）'}]},
      {label:'end'},
      /* 芷若 Z3 之後（BB_96 3-1）：點完自己的，多一個「也幫芷若點一杯」→ 飲料（拿鐵／美式／熱可可／紅茶）→ 要不要加一份濃縮。
         點對（熱可可＋加濃縮）：REMEMBERED_HER（之後就不再問）；點錯：她笑出來、不扣分（下次還可以再點）。兩個「加不加」選項畫面一樣，選飲料時看不出對錯。
         「（就這樣）」「不加」是選項的字（LAWWW 加的介面字，已告訴 BB）；她那杯照拿鐵的價錢 120 */
      {if:{memory:[{npc:'heroine_02',tag:'ASKED_HER_DRINK'}]},unless:{memory:[{npc:'heroine_02',tag:'REMEMBERED_HER'}]},goto:'treat_ask'},{goto:'after_treat'},
      {label:'treat_ask'},{choice:[{text:'也幫芷若點一杯',goto:'treat'},{text:'（就這樣）',goto:'after_treat'}]},
      {label:'treat'},{choice:[{text:'拿鐵',goto:'treat_shot'},{text:'美式',goto:'treat_shot'},{text:'熱可可',goto:'treat_cocoa'},{text:'紅茶',goto:'treat_shot'}]},
      {label:'treat_cocoa'},{choice:[{text:'加一份濃縮',goto:'treat_right'},{text:'不加',goto:'treat_wrong'}]},
      {label:'treat_shot'},{choice:[{text:'加一份濃縮',goto:'treat_wrong'},{text:'不加',goto:'treat_wrong'}]},
      {label:'treat_right'},{consequences:{money:-120}},{speaker:null,text:'她把杯子放下，很久以後說：'},{speaker:'heroine_02',expression:'neutral',text:'……你記得。'},{mem:[{npc:'heroine_02',tag:'REMEMBERED_HER',note:'幫她點了那一杯'}]},{goto:'after_treat'},
      {label:'treat_wrong'},{consequences:{money:-120}},{speaker:null,text:'她笑出來：'},{speaker:'heroine_02',expression:'laugh',text:'我不喝這個啦。'},{speaker:'heroine_02',expression:'smile',text:'算了，謝謝。我喝。'},
      {label:'after_treat'},{call:(G,GM)=>typeof FAV!=='undefined'&&FAV.cafe?FAV.cafe(GM):null},   /* 子晴在店裡：12～2 月看到她的杯子、也幫她點（AA_410，src/foodfav3d.js）*/
      {if:{custom:G=>G.flags.Z5_NEXT==='mine'&&!G.flags.Z5_MINE_ASKED&&G.flags.zhiruoFilmSeenDay!=null&&G.day>G.flags.zhiruoFilmSeenDay&&G.day-G.flags.zhiruoFilmSeenDay<=14},set:{Z5_MINE_ASKED:true},speaker:'heroine_02',expression:'smile',text:'你挑好了嗎？'},{if:{custom:G=>typeof SOCIAL!=='undefined'&&!!SOCIAL.friendLevel&&SOCIAL.friendLevel('heroine_02')==='CLOSE_FRIEND'&&(!G.flags.zhiruoCupNote||Math.random()<ZR_CUP_NOTE_P)},set:{zhiruoCupNote:true},speaker:null,text:'（紙杯上多了一行字，寫的是一部電影裡的一個場景。）'},{if:{flagNum:{CAFE_VISITS:{max:1}},flagIs:{zhiruoFirstOrder:'拿鐵'}},mem:[{npc:'heroine_02',tag:'SHARED_MEAL',note:'第一次在兩點半點了拿鐵'}]},{if:{flagNum:{CAFE_VISITS:{max:1}},flagIs:{zhiruoFirstOrder:'手沖'}},mem:[{npc:'heroine_02',tag:'SHARED_MEAL',note:'第一次在兩點半點了手沖'}]},{if:{flagNum:{CAFE_VISITS:{max:1}},flagIs:{zhiruoFirstOrder:'檸檬塔'}},mem:[{npc:'heroine_02',tag:'SHARED_MEAL',note:'第一次在兩點半點了檸檬塔'}]},{speaker:'heroine_02',expression:'smile',text:'杯子放著就好，慢慢來。'} ] },
  /* AA_120 7-5 第 3 項（BB 2026-10-13 的最小改字；已知資訊矛盾）：芷若的經原在週五、和祐廷同一堂，週二、週四在傅鐘附近是剛下外文系的課。經原那個選項要有 Z2（ev_zhiruo_ge_group）之後才有 */
  /* AA 2026-10-13 P1-2：傅鐘這段是「已經認識」的日常（她直接講下課的事），要先見過芷若（兩點半或經原分組）；沒見過時在傅鐘找她說話只有旁白（story3d.js 的 talkCharacter），也不會變成第一次見面 */
  { id:'ev_zhiruo_bell', title:'晨思鐘旁邊', participants:['heroine_02'], location:'campus', trigger:'interact', priority:3, cooldown_days:1, prereq:{memory:[{npc:'heroine_02',tag:'FIRST_MET'}]}, background:'blur',
    dialogue:[ {speaker:'heroine_02',expression:'smile',text:'剛下外文系的課。今天一句詩翻了一整堂。'},{choice:[{text:'「週五的經原，妳聽得懂供給曲線嗎？」',if:{events:['ev_zhiruo_ge_group'],custom:G=>typeof STORY!=='undefined'&&!!STORY.termAt&&STORY.termAt(G.day)==='Y1S1'},consequences:{rel:{heroine_02:{fam:3,comf:3}}},goto:'ge'},{text:'「妳上完課都在這裡發呆？」',consequences:{rel:{heroine_02:{fam:3}}}},{text:'「妳的交換申請交了嗎？」',if:{memory:[{npc:'heroine_02',tag:'SHARED_SECRET'}]},unless:{events:['ev_zhiruo_applied']},consequences:{rel:{heroine_02:{trust:4}}},goto:'ex'}]},{speaker:'heroine_02',expression:'smile',text:'對啊。下一堂三點，懶得走。'},{goto:'end'},{label:'ge'},{speaker:'heroine_02',expression:'smile',text:'圖我看得懂啦，是老師講太快。'},{speaker:'heroine_02',expression:'neutral',text:'上週那張圖我只抄到一半，下次借我看。'},{goto:'end'},{label:'ex'},{speaker:'heroine_02',expression:'embarrassed',text:'……還沒。你不要每次都問這個。'},{speaker:'heroine_02',expression:'serious',text:'我會交啦。這週吧，大概。'},{mem:[{npc:'heroine_02',tag:'IMPORTANT_CONVERSATION',note:'催她交交換申請'}]},{label:'end'} ] },
  /* 芷若 Z4「十點的電話」（BB_96 3-4，交接包 v2；原本的「週末的咖啡廳」改寫）：原本在 Café 週末——她週末不在 Café（週六 14–18 在溫州街），走不到；
     也拿掉企劃組禁用的「我跟你講一件事，你不要跟別人說」、「家裡的事比較重要吧」的 comf:-3（不扣分）。改成大一下第 12 週以後的週六 14～18、溫州街、有點熟以上、只一次。
     交往中：台詞照舊（週六下午街上的偶遇，朋友之間講家裡的事），第一個選項只有 trust:8（沒有 aff）。三個選項都記 SHARED_SECRET（note 不同）＋ Z4_PICK（大二 Z7 回來講第三個選項那一句）*/
  /* 芷若 Z3「妳自己喝什麼」（BB_96 3-1，交接包 v2）：大一下第 3 週起的平日 21:40～22:00（她晚班到 22:00）、Café、和她有點熟以上、只一次。交往中也一樣（店員和客人）。
     店裡只剩祐廷：其他客人 21:40 起身走出去、21:40～22:00 不生成（story3d.js 的 S.z3Pending）；還有客人沒走、或有人跟著你（同行、邀約）時不開始（S.cafeOthers），那天就是平常的點餐。
     沒有選項（問出那一句就是選擇）。「你是——」不說完。記憶 ASKED_HER_DRINK 的名稱、備註、手機筆記、人物資料都不寫她喝什麼（驗收；tests/v2_bb96_z3_unit.js 檢查）。
     表情：surprised →（停久一點）neutral → embarrassed → smile。之後的點餐多一個「也幫芷若點一杯」（ev_cafe_barista_zhiruo 的 treat）*/
  /* AA_207 #4（AA_313 6-5 第 6 點）：「我在這裡兩年」「你室友還活著嗎」「半夜的阿凱」只在大一（term Y1S1、Y1S2；大二阿凱不是室友）*/
  { id:'ev_zhiruo_own_drink', title:'妳自己喝什麼', participants:['heroine_02'], location:'cafe', trigger:'interact', priority:8, once:true, weekday:[1,2,3,4,5], time:[21+40/60,22], term:['Y1S1','Y1S2'],
    prereq:{stage:{npc:'heroine_02',min:'FAMILIAR'},custom:(G,GM)=>{ if(typeof STORY==='undefined'||!STORY.termDay) return false; const d0=STORY.termDay('Y1S2',3,1); return d0!=null&&G.day>=d0&&!G.flags.companion&&!(STORY.cafeOthers&&STORY.cafeOthers(GM).length); }}, background:'blur',
    dialogue:[ {speaker:null,text:'（她在擦吧檯。機器已經關了。）'},
      {speaker:'heroine_02',expression:'smile',text:'最後一杯了喔。老樣子？'},
      {speaker:'player',text:'妳自己都喝什麼？'},
      {speaker:null,text:'（她擦吧檯的手停住了。）'},
      {speaker:'heroine_02',expression:'surprised',text:'……（很久）我在這裡兩年。'},
      {speaker:'heroine_02',expression:'neutral',text:'你是——'},
      {speaker:null,text:'（她停住，搖頭，笑了一下。）'},
      {speaker:'heroine_02',expression:'neutral',text:'熱可可。加一份濃縮。'},
      {cg:'cg_own_drink_heroine02'},   /* BCG-04（BB_117：她說完「熱可可。加一份濃縮。」之後、「不要笑」之前；BB-B 檢查通過）*/
      {speaker:'heroine_02',expression:'embarrassed',text:'很怪吧。'},{speaker:'heroine_02',expression:'smile',text:'加一點苦的，比較不會那麼甜。'},
      {speaker:'heroine_02',expression:'smile',text:'……不要笑。'},
      /* BB_187 1-1（AA_554 核過）：和她交往中，「……不要笑。」之後多兩句（AA_230 Z-14；表情接在 smile 後面照 smile，BB_96 3-1 的表情順序不動）；房間的點單紙在 src/aa554_3d.js（STORY.ROOM_EXTRA） */
      {if:DH('heroine_02'),speaker:'heroine_02',expression:'smile',text:'……我答應你那天，本來想寫這個。'},
      {if:DH('heroine_02'),speaker:'heroine_02',expression:'smile',text:'寫一寫覺得太丟臉，就改寫座位了。'},{if:DH('heroine_02'),set:{ZR_Z3_DH:true}} ],
    consequences:{mem:[{npc:'heroine_02',tag:'ASKED_HER_DRINK',note:'她下班前'}]} },
  /* BB_187 1-2（AA_554 第 2 節：時間定）：和她交往中＝她約的——前一晚（週五）21:00 她私訊「明天下午我在溫州街。……有一件事，我想當面講。」（src/aa554_3d.js，記 ZR_Z4_INV_DAY），
     隔天 15:00 起在溫州街（照原本 Z4 的地點、週六）。還沒收到那則私訊的（例：這週才開始交往）那個週六不演、等下一個週五的私訊。台詞照原文；三個選項的回應換（數字照原本）。
     「交往中的玩家（AA_112 8-1）」那一版＝和別人交往中（GFO），照舊 */
  { id:'ev_zhiruo_secret', title:'十點的電話', participants:['heroine_02'], location:'wenzhou', trigger:'interact', priority:8, once:true, term:['Y1S2'], weeks:[11,12,13,14,15], weekday:[6], time:[14,18], prereq:{stage:{npc:'heroine_02',min:'FAMILIAR'},custom:G=>{ if(!DHN(G,'heroine_02')) return true; const d=G.flags&&G.flags.ZR_Z4_INV_DAY; return typeof d==='number'&&G.day>d&&(G.hour%24)>=15; }}, background:'blur',
    dialogue:[ {speaker:'heroine_02',expression:'neutral',text:'週六我都在溫州街。這裡的人不會問我週末在幹嘛。'},
      {speaker:'heroine_02',expression:'thinking',text:'交換的申請，我拖了兩個月。'},
      {speaker:'heroine_02',expression:'neutral',text:'我媽每天晚上十點打給我。講店裡的事。'},
      {speaker:'heroine_02',expression:'neutral',text:'誰來印考卷、哪一台又卡紙。'},
      {speaker:'heroine_02',expression:'thinking',text:'我去英國的話，那邊是下午三點。'},
      {speaker:'heroine_02',expression:'neutral',text:'……她十點要打給誰？'},
      {if:{memory:[{npc:'heroine_02',tag:'ZR_ASKED_MESSY'}]},speaker:'heroine_02',expression:'neutral',text:'你上學期問我，經原那學期怎麼了。……就是這個。'},   /* AA_524 Z4：大一上閒聊階梯 Z-L3 問過「那學期怎麼了？」（她說「之後再跟你講」）*/
      {choice:[{text:'「妳想去嗎？」',unless:GFO('heroine_02'),set:{Z4_PICK:'want'},consequences:{rel:{heroine_02:{trust:8,aff:3}},mem:[{npc:'heroine_02',tag:'SHARED_SECRET',note:'十點的電話：你問她想不想去'}]},goto:'want'},
        {text:'「妳想去嗎？」',if:GFO('heroine_02'),set:{Z4_PICK:'want'},consequences:{rel:{heroine_02:{trust:8}},mem:[{npc:'heroine_02',tag:'SHARED_SECRET',note:'十點的電話：你問她想不想去'}]},goto:'want'},
        {text:'「先交件再說，錄取了再煩惱。」',set:{Z4_PICK:'apply'},consequences:{rel:{heroine_02:{trust:5,resp:4}},mem:[{npc:'heroine_02',tag:'SHARED_SECRET',note:'十點的電話：先交件再說'}]},goto:'do'},
        {text:'「家裡的事比較重要吧。」',set:{Z4_PICK:'family'},consequences:{rel:{heroine_02:{trust:2}},mem:[{npc:'heroine_02',tag:'SHARED_SECRET',note:'十點的電話：你說家裡的事比較重要'}]},goto:'fam'}]},
      {label:'want'},{speaker:null,text:'她沉默很久。'},{speaker:'heroine_02',expression:'neutral',text:'……想。'},{speaker:null,text:'她用手指捲頭髮，捲了三圈。'},{unless:DH('heroine_02'),speaker:'heroine_02',expression:'smile',text:'好可怕。說出來就變成真的了。'},
        {if:DH('heroine_02'),speaker:'heroine_02',expression:'smile',text:'我本來想先問你。結果你先問了。'},{goto:'end'},   /* BB_187 1-2 和她交往中 */
      {label:'do'},{unless:DH('heroine_02'),speaker:'heroine_02',expression:'smile',text:'你講得好簡單喔。'},/* AA_209 附錄B §2 */{if:DH('heroine_02'),speaker:'heroine_02',expression:'smile',text:'你們法律系都這樣講話嗎？'},{speaker:null,text:'她笑了。'},{unless:DH('heroine_02'),speaker:'heroine_02',expression:'smile',text:'……可是你說得對。'},
        {if:DH('heroine_02'),speaker:'heroine_02',expression:'smile',text:'……交了以後，你要陪我等。'},{goto:'end'},
      {label:'fam'},{speaker:'heroine_02',expression:'neutral',text:'嗯。'},{speaker:null,text:'她點頭。'},{unless:DH('heroine_02'),speaker:'heroine_02',expression:'neutral',text:'我也這樣跟自己說了兩個月。'},
        {if:DH('heroine_02'),speaker:'heroine_02',expression:'neutral',text:'……我以為你會叫我去。'},{if:DH('heroine_02'),speaker:'heroine_02',expression:'neutral',text:'也好。我也這樣跟自己說了兩個月。'},   /* 和她交往中：不扣分（trust:2 照原本）*/
      {label:'end'} ] },
  // ────────────────────────────────────────── 子晴：室友的同學、吉他社
  { id:'ev_zhiruo_ge_final', title:'期末的短片', participants:[], location:['dorm','campus','putong'], trigger:'enter', term:['Y1S1'], once:true, prereq:{flags:['ge_group_zhiruo'],custom:G=>{ if(typeof CALENDAR==='undefined') return false; const t=CALENDAR.termOf(G.day); return !!t&&t.week>=16; }}, background:'freeze',   /* BB_95 2-4 期末：旁白一行帶過（AA_108 第 4 節 #27：不排「第一個」）；16 週制：期末週＝第 16 週（原本第 18 週，AA_198 大一上「必搬」）*/
    dialogue:[ {speaker:null,text:'三分鐘的短片，旁白是你。片尾名單照筆畫排，你的名字後面多了兩個字：（旁白）。'} ] },
  { id:'ev_kai_mentions_ziqing', title:'室友的同學', participants:['kai'], location:'dorm', trigger:'interact', priority:6, once:true, minWeek:{term:'Y1S1',week:4},   /* BB_170 第 18 列：改看週次（第 4 週起；原本 day_min 6）。BB_95 2-3：落在第 4 週（9/22 週一＝第 6 天），社團博覽會（第 5 週）之前；台詞全部保留 */ time:[18,26], prereq:{notMemory:[{npc:'heroine_04',tag:'FIRST_MET'}]}, background:'blur',   /* 已經認識子晴就不用轉述（BB 6-1）*/
    dialogue:[ {speaker:'kai',expression:'smile',text:'欸，我們系有個學姊，高子晴，吉他社的。她說社團缺人，問我有沒有朋友想來。'},{speaker:'kai',expression:'neutral',text:'我說我室友法律系，她說什麼系都可以，來吃東西也行。'},{choice:[{text:'「什麼時候？」',consequences:{flags:{guitar_invite:true},rel:{heroine_04:{fam:2}},goal:'吉他社：第 5 週起，週一、週三 19:00，法律系館B一樓多功能教室'},goto:'when'},{text:'「我不會彈吉他。」',consequences:{flags:{guitar_invite:true}},goto:'no'},{text:'「你去就好。」',consequences:{rel:{kai:{fam:-1}}},end:true}]},{label:'when'},{speaker:'kai',expression:'smile',text:'第五週開始，週一、週三晚上七點，在B館一樓的多功能教室。她說不用會彈。'},{goto:'end'},{label:'no'},{speaker:'kai',expression:'laugh',text:'她說一年級的沒有人會。週一、週三晚上七點，B館。'},{label:'end'} ] },
  /* AA_110 6-8 (a)（AA 暫定）：還沒認識子晴的玩家第一次去吉他社社課，社課一開始自動播這一段的初遇（classes3d.js 的 clubEvent）；之後玩家自己去找她才播「又來了」，最多一週一次（冷卻 1 → 7 天）；
     「阿凱說妳系上第一名」那個選項寫 ARGUED_ABOUT_CAREER（她的劇情點）：整個存檔只出現一次。台詞不動。 */
  { id:'ev_ziqing_club', title:'吉他社', participants:['heroine_04'], location:'wancai', trigger:'interact', priority:5, cooldown_days:7, background:'blur',
    dialogue:[ {if:{flags:['guitar_invite']},unless:{memory:[{npc:'heroine_04',tag:'FIRST_MET'}]},speaker:'heroine_04',expression:'smile',text:'你是阿凱的室友？法律系那個？'},{if:{flags:['YU_CLUB_INVITE'],notFlags:['guitar_invite'],custom:G=>typeof EVENTS!=='undefined'&&!!EVENTS.npcOf&&!!EVENTS.npcOf('yu')},unless:{memory:[{npc:'heroine_04',tag:'FIRST_MET'}]},speaker:'yu',expression:'laugh',text:'欸！你真的來了！'},{if:{flags:['YU_CLUB_INVITE'],notFlags:['guitar_invite'],custom:G=>typeof EVENTS!=='undefined'&&!!EVENTS.npcOf&&!!EVENTS.npcOf('yu')},unless:{memory:[{npc:'heroine_04',tag:'FIRST_MET'}]},speaker:'yu',expression:'smile',text:'學姊，他是我拉來的。'},   /* AA_156 1-2：Alison 在社課（作息）、只有 Alison 的入口才說；子晴的台詞一字不動 */
      {if:{notFlags:['guitar_invite']},unless:{memory:[{npc:'heroine_04',tag:'FIRST_MET'}]},speaker:'heroine_04',expression:'smile',text:'新人？法律系的？坐那邊，零食自己拿。'},{unless:{memory:[{npc:'heroine_04',tag:'FIRST_MET'}]},speaker:'heroine_04',expression:'laugh',text:'我高子晴，資工系的。先講好：我們社團沒有人會彈，都是來吃東西的。'},{unless:{memory:[{npc:'heroine_04',tag:'FIRST_MET'}]},speaker:'heroine_04',expression:'neutral',text:'今天系上有程式比賽，一半的人跑去了，所以人很少。'},{unless:{memory:[{npc:'heroine_04',tag:'FIRST_MET'}]},stamp:['guitarFirstDay']},{if:{memory:[{npc:'heroine_04',tag:'FIRST_MET'}]},speaker:'heroine_04',expression:'smile',text:'又來了。今天要學 C 和弦還是要吃洋芋片？'},{choice:[{text:'「教我一個和弦。」',consequences:{rel:{heroine_04:{fam:5,comf:3}},mem:[{npc:'heroine_04',tag:'INVITED_CLUB'}],energy:-4,advance:1},goto:'chord'},{text:'「上次那個程式比賽，妳怎麼沒去？」',if:{stage:{npc:'heroine_04',min:'FAMILIAR'}},unless:{memory:[{npc:'heroine_04',tag:'ARGUED_ABOUT_CAREER'}]},consequences:{rel:{heroine_04:{fam:3}},mem:[{npc:'heroine_04',tag:'ARGUED_ABOUT_CAREER',note:'問她為什麼不比賽'}]},goto:'why'},{text:'「妳們平常都在幹嘛？」',consequences:{rel:{heroine_04:{fam:3}}},goto:'what'}]},{label:'chord'},{speaker:'heroine_04',expression:'laugh',text:'手指這樣——不對，那是 F，你會痛死。C。壓好。'},{speaker:null,text:'一個小時後你會了一個和弦，還有手指上兩條紅痕。'},{goto:'end'},{label:'why'},{speaker:'heroine_04',expression:'serious',text:'因為大家都覺得我該去。我爸最覺得。'},{speaker:'heroine_04',expression:'neutral',text:'我週末不想再寫程式給評審看。'},{speaker:'heroine_04',expression:'smile',text:'C 和弦再按一次。手指不要放。'},{goto:'end'},{label:'what'},{speaker:'heroine_04',expression:'smile',text:'吃東西、彈錯、笑別人彈錯。成發的時候你負責拍手就好。'},{label:'end'} ] },
  // ────────────────────────────────────────── 溫學姊：法服讀書會（刑訴）＋ 法研所
  /* AA_110 6-8 (a)（AA 暫定）：這個事件就是法服讀書會本身——時間對齊活動（週三 19:00，原本 18:48）、地點研討室 A：玩家在研討室 A 門口參加讀書會（ACTIVITIES 的 lawclub_study）時
     第一次播整段（classes3d.js 的 clubEvent；trigger 'activity'＝不會因為走進萬才館就自己開始），第二次以後只有旁白＋題庫兩三題。學姊研究計畫那段（GRAD_SCHOOL_DISCUSSION）只有一次。台詞不動。 */
  { id:'ev_studygroup_wed', retired:'使用者 2026-10-17（AA_218 17-4）：法服沒有讀書會（AA_236 A1、BB_191 §7）；沛珊 P1／P1b 搬到以安的公法讀書會（方案 A，AA_222）。定義留給已經演過的舊存檔', title:'法服讀書會', participants:['heroine_05','classmate_bohan'], location:'wancai', trigger:'activity', weekday:[3], time:[19,21], cooldown_days:6, prereq:{flags:['lawclub']}, background:'blur', player_seat:null,
    dialogue:[ {speaker:'heroine_05',expression:'neutral',text:'來了？坐。今天讀刑訴——一年級聽不懂沒關係，先聽爭點怎麼吵。'},{speaker:'classmate_bohan',expression:'serious',text:'（小聲）學姊每次都說沒關係，然後每次都點人。'},{legal:{context:'study',by:'heroine_05',pick:{section:'基本原則、法院、當事人'},chorus:'classmate_bohan'}},{unless:{flags:['PEISHAN_ASKED_WHY']},speaker:'classmate_peishan',expression:'thinking',text:'（舉手）我可以問一個會被打的問題嗎？我們為什麼要背這個？'},{unless:{flags:['PEISHAN_ASKED_WHY']},speaker:'classmate_bohan',expression:'serious',text:'因為會考。'},{unless:{flags:['PEISHAN_ASKED_WHY']},speaker:'classmate_peishan',expression:'smile',text:'（笑）好。這是一個答案。'},{unless:{flags:['PEISHAN_ASKED_WHY']},speaker:'heroine_05',expression:'neutral',text:'這個我要查一下。下週回答。'},{unless:{flags:['PEISHAN_ASKED_WHY']},set:{PEISHAN_ASKED_WHY:true,peishanAskedNow:true},stamp:['peishanAskedDay']},{legal:{context:'study',by:'heroine_05',pick:{section:'訊問、自白、緘默權'}}},{legal:{context:'study',by:'heroine_05',pick:{}}},{speaker:'heroine_05',expression:'tired',text:'今天先到這裡。……我二月要交大專生研究計畫。你們大三就會知道那是什麼東西。'},{choice:[{text:'「研究計畫是什麼？」',consequences:{grad:{bump:'學姊提到研究計畫',field:'公法'},rel:{heroine_05:{fam:3,resp:2}},mem:[{npc:'heroine_05',tag:'GRAD_SCHOOL_DISCUSSION'}]},goto:'grad'},{text:'「學姊為什麼想念研究所？」',consequences:{grad:{bump:'問學姊為什麼念研究所'},rel:{heroine_05:{trust:4}},mem:[{npc:'heroine_05',tag:'GRAD_SCHOOL_DISCUSSION'}]},goto:'why'},{text:'（收書包）',consequences:{rel:{heroine_05:{fam:1}}},goto:'end'}]},{label:'grad'},{speaker:'heroine_05',expression:'serious',text:'一份你想研究什麼、為什麼、怎麼做的文件。教授看那個決定要不要你。'},{speaker:'heroine_05',expression:'thinking',text:'大部分人寫不出「為什麼」。'},{goto:'end'},{label:'why'},{speaker:'heroine_05',expression:'thinking',text:'這個問題最近有人問我第三次了。'},{speaker:'heroine_05',expression:'neutral',text:'以前我會說「因為我對公法有興趣」。現在我會說：先不要問我。'},{mem:[{npc:'heroine_05',tag:'IMPORTANT_CONVERSATION',note:'她不確定為什麼念研究所'}]},{label:'end'},{speaker:null,text:'散會時，學姊把你的筆記還給你，裡面夾了一張便條：「一，論點不清。二，引用錯頁。三，字太醜。」'},{if:{flags:['peishanAskedNow']},unless:{memory:[{npc:'classmate_peishan',tag:'FIRST_MET'}]},speaker:'classmate_peishan',expression:'neutral',text:'郭沛珊。法律一。剛剛那個問題是我問的。',meet:'classmate_peishan'},{set:{peishanAskedNow:false},stamp:['studyGroupFirstDay']} ],   /* BB_95 2-5：沛珊 P1（第一次一起出席；PEISHAN_ASKED_WHY 給 ev_studygroup_p1b）、F-W1 便條、散會後 22:30 讀書會群組的訊息（phoneRules）；「大專生研究計畫」的時程需查證 */
    consequences:{mem:[{npc:'heroine_05',tag:'STUDIED_TOGETHER',note:'法服讀書會'},{npc:'classmate_bohan',tag:'STUDIED_TOGETHER'}],rel:{classmate_bohan:{fam:4}},advance:1.5,energy:-8,memo:'參加了法服讀書會（刑訴）'} },
  // ────────────────────────────────────────── 林教授：刑事訴訟法（週二 10:20）
  { id:'ev_class_crimpro', retired:'AA_376 #2（企劃線 69aa3b0c，AA 定）：v7 舊課堂，課表系統已經有刑訴（9:10 開始）；沒有 once、每週二重演（期中考當天、第 9 週沒課也演）——停用，定義留給舊存檔', term:['Y3S1'], minWeek:{term:'Y3S1',week:2}, title:'刑事訴訟法', participants:['prof_lin','classmate_bohan'], location:'classroom', trigger:'enter', weekday:[2], time:[9.9,12.1], cooldown_days:6, background:'freeze', mainSide:'right', player_seat:[1,3],
    dialogue:[ {speaker:null,text:'法律系館A二樓。林教授把判決影本放在講台上，聲音不大，但沒有人講話。'},{speaker:'prof_lin',expression:'neutral',text:'上週我們談了刑事訴訟的目的。有人以為就是『把壞人抓到』——今天我們從被告的位置看一次。'},{legal:{context:'class',by:'prof_lin',pick:{section:'基本原則、法院、當事人'},chorus:'classmate_bohan'}},{speaker:'prof_lin',expression:'neutral',text:'下一個問題比較實務。警察局的訊問室裡發生的事，法院要怎麼看？'},{legal:{context:'class',by:'prof_lin',pick:{section:'訊問、自白、緘默權'}}},{speaker:'prof_lin',expression:'smile',text:'這兩題會出現在期中。不是威脅，是預告。'},{speaker:'classmate_bohan',expression:'serious',text:'（小聲）她每學期都這樣說，然後真的出。'} ],
    consequences:{mem:[{npc:'classmate_bohan',tag:'SHARED_CLASS'},{npc:'prof_lin',tag:'SHARED_CLASS'}],rel:{classmate_bohan:{fam:3}},advance:1.7,energy:-6,memo:'上了刑事訴訟法',flags:{crimpro_attended:true}} },
  // ────────────────────────────────────────── 許教授：研究所的種子（辦公時間）
  /* AA_522 第 2 節（企劃線 fcc93126e，AA-C 定稿；NPC-STORY2-1028）：照祐廷的年級（SOCIAL.playerYear，放假照上一個學期；大五算大四）——第一次見面的自我介紹、之後的招呼、題目都照年級。
     每題問一次（記 XU_ASKED＝{年級:[題]}；舊存檔：大一那兩題有 prof_xu 的 GRAD_SCHOOL_DISCUSSION／book_xu 筆記＝問過），那一年的問題問完就不觸發，下一年有新的。
     地點、冷卻照舊（萬才館，3 天）。大三「溫書瑀學姊是老師的學生？」要認識學姊。許教授只講讀法、比較法、研究所，不講實體法。新題目的教授紀錄照現有的辦公時間題（office +2）。
     第 8 節（f36dfe3cf）：他每週一 14:00～16:00 在萬才館，四個年級都在（story3d.js 的 S.PROF_OFFICE；上他課的那幾天下課後照現有）；和學姊交往中，大三那一題換「學姊的論文，老師覺得怎麼樣？」*/
  ...(()=>{ const XY=G=>Math.max(1,Math.min(4,typeof SOCIAL!=='undefined'&&SOCIAL.playerYear?SOCIAL.playerYear()|0:1)),
      XQ={1:['grad','book'],2:['germany','long'],3:['grad3','sis'],4:['judg']},
      xAsked=(G,y,k)=>{ const A=G.flags&&G.flags.XU_ASKED, L=A&&typeof A==='object'&&Array.isArray(A[y])?A[y]:[]; if(L.includes(k)) return true;
        if(y===1&&k==='grad') return typeof SOCIAL!=='undefined'&&SOCIAL.has('prof_xu','GRAD_SCHOOL_DISCUSSION'); if(y===1&&k==='book') return Array.isArray(G.notes)&&G.notes.some(n=>n&&n.id==='book_xu'); return false; },
      xOk=k=>k!=='sis'||(typeof SOCIAL!=='undefined'&&SOCIAL.has('heroine_05','FIRST_MET')),   /* 認識學姊才有 */
      xCan=(G,k)=>{ const y=XY(G); return (XQ[y]||[]).includes(k)&&xOk(k)&&!xAsked(G,y,k); },
      xLeft=G=>{ const y=XY(G); return (XQ[y]||[]).filter(k=>xOk(k)&&!xAsked(G,y,k)).length; },
      xMark=(G,k)=>{ const y=XY(G), F=G.flags; if(!F.XU_ASKED||typeof F.XU_ASKED!=='object') F.XU_ASKED={}; const L=Array.isArray(F.XU_ASKED[y])?F.XU_ASKED[y]:(F.XU_ASKED[y]=[]); if(!L.includes(k)) L.push(k); },
      MET=y=>({memory:[{npc:'prof_xu',tag:'FIRST_MET'}],custom:G=>XY(G)===y}), CU=f=>({custom:f}), UN={memory:[{npc:'prof_xu',tag:'FIRST_MET'}]},
      GSD={memory:[{npc:'prof_xu',tag:'GRAD_SCHOOL_DISCUSSION'}]};
    return [
  { id:'ev_prof_xu_office', title:'許教授', participants:['prof_xu'], location:'wancai', trigger:'interact', priority:5, cooldown_days:3, background:'blur', prereq:{custom:G=>xLeft(G)>0},
    dialogue:[ {unless:UN,if:CU(G=>XY(G)===1),speaker:'prof_xu',expression:'neutral',text:'一年級的？我是許志遠，教行政法，你們大二會遇到我。'},{unless:UN,if:CU(G=>XY(G)===2),speaker:'prof_xu',expression:'neutral',text:'許志遠。行政法是我教的。你坐在哪一排？'},{unless:UN,if:CU(G=>XY(G)>=3),speaker:'prof_xu',expression:'neutral',text:'許志遠。教公法的。你們這屆我教過。'},
      {if:MET(1),speaker:'prof_xu',expression:'neutral',text:'又是你。有問題？'},{if:MET(2),speaker:'prof_xu',expression:'neutral',text:'行政法的學生。有問題？'},{if:MET(3),speaker:'prof_xu',expression:'neutral',text:'大三了，民訴、刑訴都很重。還來？'},{if:MET(4),speaker:'prof_xu',expression:'neutral',text:'快畢業了。有問題？'},
      {choice:[{text:'「老師，法研所是在做什麼的？」',if:CU(G=>xCan(G,'grad')),consequences:{grad:{bump:'問許教授法研所'},prof:{prof_xu:{kind:'office',delta:2,note:'問法研所'}},mem:[{npc:'prof_xu',tag:'GRAD_SCHOOL_DISCUSSION'}]},goto:'grad'},{text:'「老師推薦一本一年級可以讀的書嗎？」',if:CU(G=>xCan(G,'book')),consequences:{prof:{prof_xu:{kind:'office',delta:2,note:'問推薦書'}},note:{id:'book_xu',title:'許教授推薦的書','body':'《法學方法論》入門——「先學會問問題，再學答案」。'}},goto:'book'},
        {text:'「老師上課一直講德國，為什麼？」',if:CU(G=>xCan(G,'germany')),consequences:{prof:{prof_xu:{kind:'office',delta:2,note:'問比較法'}}},goto:'germany'},{text:'「行政法的考試為什麼那麼長？」',if:CU(G=>xCan(G,'long')),consequences:{prof:{prof_xu:{kind:'office',delta:2,note:'問考試'}}},goto:'long'},
        {text:'「大三要開始想研究所了嗎？」',if:CU(G=>xCan(G,'grad3')),consequences:{prof:{prof_xu:{kind:'office',delta:2,note:'問研究所'}}},goto:'grad3'},{text:'「溫書瑀學姊是老師的學生？」',if:CU(G=>xCan(G,'sis')),unless:{flags:['dating_heroine_05']},consequences:{prof:{prof_xu:{kind:'office',delta:2,note:'問學姊'}}},goto:'sis'},
        {text:'「學姊的論文，老師覺得怎麼樣？」',if:{flags:['dating_heroine_05'],custom:G=>xCan(G,'sis')},consequences:{prof:{prof_xu:{kind:'office',delta:2,note:'問學姊的論文'}}},goto:'sisd'},   /* AA_522 第 8 節第 2 點（f36dfe3cf）：和學姊交往中，大三那一題換這個問法（同一題：記 sis，問過一種就不再出另一種）；沒交往、認識她的照上一個 */
        {text:'「判決要從哪裡開始讀？」',if:CU(G=>xCan(G,'judg')),consequences:{prof:{prof_xu:{kind:'office',delta:2,note:'問判決'}}},goto:'judg'},{text:'「沒事，路過。」',end:true}]},
      {label:'grad'},{call:G=>xMark(G,'grad')},{speaker:'prof_xu',expression:'thinking',text:'讀一個問題讀兩年。大部分人以為是讀更多條文，其實是讀更少、讀更深。'},{speaker:'prof_xu',expression:'smile',text:'你才一年級。先把民總讀好——但如果哪堂課讓你下課還在想，記得那是什麼課。'},{goto:'end'},{label:'book'},{call:G=>xMark(G,'book')},{speaker:'prof_xu',expression:'neutral',text:'先不要讀教科書以外的東西。真的要讀，就讀『怎麼問問題』的書。'},{goto:'end'},
      {label:'germany'},{call:G=>xMark(G,'germany')},{speaker:'prof_xu',expression:'neutral',text:'我們很多制度是從那邊學來的。'},{speaker:'prof_xu',expression:'thinking',text:'看別人怎麼想同一個問題，比較看得出自己的問題在哪。'},{goto:'end'},
      {label:'long'},{call:G=>xMark(G,'long')},{speaker:'prof_xu',expression:'neutral',text:'因為行政法本來就長。'},{speaker:'prof_xu',expression:'smile',text:'……我出題目的時候，也覺得太長。'},{goto:'end'},
      {label:'grad3'},{call:G=>xMark(G,'grad3')},{speaker:'prof_xu',expression:'thinking',text:'想，但不要急著決定。'},{if:GSD,speaker:'prof_xu',expression:'neutral',text:'你大一來的時候，我說過：哪堂課讓你下課還在想，記得那是什麼課。……現在是哪一門？'},{unless:GSD,speaker:'prof_xu',expression:'neutral',text:'哪堂課讓你下課還在想，記得那是什麼課。……現在是哪一門？'},{speaker:null,text:'（你想了一下，說了一門課。他點點頭，沒有追問。）'},{goto:'end'},
      {label:'sis'},{call:G=>xMark(G,'sis')},{speaker:'prof_xu',expression:'neutral',text:'她是我指導的。'},{speaker:'prof_xu',expression:'neutral',text:'她的題目，讓她自己跟你說。'},{goto:'end'},
      {label:'sisd'},{call:G=>xMark(G,'sis')},{speaker:'prof_xu',expression:'neutral',text:'這個問題，你應該問她。'},{speaker:'prof_xu',expression:'neutral',text:'……她自己知道寫得好不好。'},{goto:'end'},
      {label:'judg'},{call:G=>xMark(G,'judg')},{speaker:'prof_xu',expression:'neutral',text:'從事實。很多人跳過事實，直接讀理由。'},{speaker:'prof_xu',expression:'neutral',text:'那樣讀，看不懂法官為什麼那樣寫。'},
      {label:'end'} ] } ]; })(),
  // ────────────────────────────────────────── 熟同學：小事件
  { id:'ev_xinci_notes', title:'借筆記', participants:['classmate_xinci'], location:['classroom','library'], trigger:'interact', priority:4, once:true, term:['Y1S1'], cooldown_days:3, background:'blur', minWeek:{term:'Y1S1',week:7},   /* AA_195 4-7 A9：交接包 v1 的位置（「我上週民總請假」）。AA_372 第 3 項：一次性的事件，只演一次、限大一上（原本每 3 天重演，大一下以後還在說「上週民總請假」；舊存檔演過的不再演）*/
    dialogue:[ {unless:{memory:[{npc:'classmate_xinci',tag:'FIRST_MET'}]},speaker:'classmate_xinci',expression:'neutral',text:'你是……周老師點過的那個？我吳芯慈。同班。'},{speaker:'classmate_xinci',expression:'thinking',text:'我上週民總請假，你筆記可以借我看一下嗎？我明天還你。'},{choice:[{text:'「可以，給。」',consequences:{rel:{classmate_xinci:{fam:5,trust:4}},mem:[{npc:'classmate_xinci',tag:'LENT_NOTES'}]},goto:'yes'},{text:'「我的筆記很亂，妳確定？」',consequences:{rel:{classmate_xinci:{fam:3}}},goto:'messy'},{text:'「不太方便，我自己要用。」',consequences:{rel:{classmate_xinci:{fam:1,trust:-2}},mem:[{npc:'classmate_xinci',tag:'REFUSED_HELP'}]},goto:'no'}]},{label:'yes'},{speaker:'classmate_xinci',expression:'smile',text:'謝謝。我會重新排版再還你，你不要介意。'},{unless:{custom:G=>typeof INV!=='undefined'&&INV.hasContact(G,'classmate_xinci')},speaker:'classmate_xinci',expression:'neutral',text:'筆記還你的時候要找你。',consequences:{contact:'classmate_xinci'}},{goto:'end'},{label:'messy'},{speaker:'classmate_xinci',expression:'laugh',text:'越亂越好，我喜歡整理。'},{rel:{classmate_xinci:{fam:2,trust:2}},mem:[{npc:'classmate_xinci',tag:'LENT_NOTES'}]},{unless:{custom:G=>typeof INV!=='undefined'&&INV.hasContact(G,'classmate_xinci')},speaker:'classmate_xinci',expression:'neutral',text:'筆記還你的時候要找你。',consequences:{contact:'classmate_xinci'}},{goto:'end'},{label:'no'},{speaker:'classmate_xinci',expression:'neutral',text:'好。沒關係。'},{speaker:null,text:'她轉向另一個同學。你不確定她有沒有把這件事記下來。'},{label:'end'} ] },
  /* 交接包 v1 A5 的週次：第 7 週（期中考前）起才問考古題（v1 稽核：原本沒有週次限制）*/
  { id:'ev_bohan_kaogu', title:'考古題', participants:['classmate_bohan'], location:['library','classroom'], trigger:'interact', priority:4, once:true, term:['Y1S1'], cooldown_days:2, background:'blur', minWeek:{term:'Y1S1',week:7},   /* AA_372 第 3 項：只演一次、限大一上 */
    dialogue:[ {unless:{memory:[{npc:'classmate_bohan',tag:'FIRST_MET'}]},speaker:'classmate_bohan',expression:'serious',text:'許柏翰。第一排那個。你有周老師前年的考古題嗎？'},{if:{memory:[{npc:'classmate_bohan',tag:'FIRST_MET'}]},speaker:'classmate_bohan',expression:'serious',text:'你來得正好。我在看刑總的題目，有一題我跟班上的芯慈吵了半小時。'},{speaker:'classmate_bohan',expression:'thinking',text:'……我覺得我念得太慢。你都怎麼念的？'},{choice:[{text:'「先看題目，再回去翻書。」',consequences:{rel:{classmate_bohan:{fam:3,comf:2}}}},{text:'「看心情。」',consequences:{rel:{classmate_bohan:{fam:2,resp:-1}}}},{text:'「你已經很認真了。」',consequences:{rel:{classmate_bohan:{fam:4,trust:3}},mem:[{npc:'classmate_bohan',tag:'HELPED',note:'安慰他'}]}}]},{speaker:'classmate_bohan',expression:'neutral',text:'嗯。……好。'} ] },
  /* 沛珊 P2：為什麼念法律（BB_95 第 2-8 節完整版；使用者 2026-10-14 解除大一上交接包暫緩、AA 轉達）：只發生一次（once）；第一個選項換成 BB 寫好的（祐廷念法律是自己選的）；結尾不再用模板句、三個分支各說一次；週三晚上在萬才館（讀書會那天）才提讀書會。三個選項的數值、選項三的記憶照舊（記憶的備註照 BB_95 改成「她在想別的路」）*/
  { id:'ev_peishan_doubt', title:'為什麼念法律', participants:['classmate_peishan'], location:['library','wancai','campus'], trigger:'interact', priority:4, once:true, cooldown_days:3, background:'blur', minWeek:{term:'Y1S1',week:6},   /* BB_170 第 10 列：第 6 週起（BB_95 一覽表）；沒去宿營的玩家這裡是認識她的備用入口 */
    dialogue:[ {unless:{memory:[{npc:'classmate_peishan',tag:'FIRST_MET'}]},speaker:'classmate_peishan',expression:'neutral',text:'我郭沛珊，同班的，你應該看過我遲到。'},{speaker:'classmate_peishan',expression:'thinking',text:'欸，你為什麼會來念法律？不准說因為考上。'},{choice:[{text:'「我想知道事情『應該』怎麼處理。」',consequences:{rel:{classmate_peishan:{fam:3,comf:3}}},goto:'should'},{text:'「想幫人。」',consequences:{rel:{classmate_peishan:{fam:3,resp:2}}},goto:'help'},{text:'「妳呢？」',consequences:{rel:{classmate_peishan:{fam:4,trust:3}},mem:[{npc:'classmate_peishan',tag:'IMPORTANT_CONVERSATION',note:'她在想別的路'}]},goto:'her'}]},{label:'should'},{speaker:'classmate_peishan',expression:'thinking',text:'應該喔。那是誰決定什麼叫應該？老師嗎？還是考卷？'},{goto:'end'},{label:'help'},{speaker:'classmate_peishan',expression:'thinking',text:'幫人喔。可是社工系也可以幫人吧？而且不用背這麼多。'},{goto:'end'},{label:'her'},{unless:{custom:G=>PS_DOUBT_Y1S2(G)||PS_DOUBT_Y2(G)},speaker:'classmate_peishan',expression:'thinking',text:'我在旁聽哲學系的課。上禮拜坐在那間教室，比坐在A館這一個多月都自在。'},{if:{custom:PS_DOUBT_Y1S2},speaker:'classmate_peishan',expression:'thinking',text:'我在旁聽哲學系的課。上禮拜坐在那間教室，比坐在A館這半年都自在。'},{if:{custom:PS_DOUBT_Y2},speaker:'classmate_peishan',expression:'thinking',text:'我在旁聽哲學系的課。上禮拜坐在那間教室，比坐在A館這一年多都自在。'},{speaker:'classmate_peishan',expression:'neutral',text:'……我還沒跟家裡說。'},{text:'她停了一下。'},{speaker:'classmate_peishan',expression:'thinking',text:'好奇怪。講出來以後，聲音比我想的還大。'},{label:'end'},{text:'她把書包背起來。'},{unless:{custom:G=>G.hour%24>=18||G.hour>=24},speaker:'classmate_peishan',expression:'neutral',text:'我要去上課了。'},{if:{custom:G=>G.hour%24>=18||G.hour>=24},speaker:'classmate_peishan',expression:'neutral',text:'我先回去了。'},{speaker:'classmate_peishan',expression:'smile',text:'剛剛那題你先欠著，想到再跟我說。'} ] },
  { id:'ev_zhe_dinner', title:'公館吃什麼', participants:['zhe'], location:['campus','gongguan'], trigger:'interact', priority:2, time:[17,20], cooldown_days:1, random_weight:0.7, background:'blur', term:['Y1S1'], once:true,   /* AA_313 5-3（AA_389 第 6 點：照逐場表）：原本沒有 once、term，四年天天同一句 */
    dialogue:[ {speaker:'zhe',expression:'smile',text:'晚餐吃什麼？我在燒臘店、滷味、便利商店之間掙扎二十分鐘了。'},{choice:[{text:'「燒臘店。」',consequences:{rel:{zhe:{fam:2}},mem:[{npc:'zhe',tag:'SHARED_MEAL',note:'一起去麵店'}],goal:'公館燒臘'}},{text:'「我還有東西要讀，下次。」',consequences:{rel:{zhe:{fam:0}},mem:[{npc:'zhe',tag:'DECLINED_INVITE'}]}},{text:'「便利商店，快。」',consequences:{rel:{zhe:{fam:1}}}}]},{speaker:'zhe',expression:'laugh',text:'好啦。走。'} ] },
  { id:'ev_mingxuan_ball', title:'系籃', participants:['classmate_mingxuan'], location:'campus', trigger:'interact', priority:3, once:true, term:['Y1S1'], cooldown_days:2, background:'blur', minWeek:{term:'Y1S1',week:2}, prereq:{flags:['classDone']},   /* BB_170 第 17 列：9/4 民總以後（「他說你上課很敢講」）、第 2 週起。AA_372 第 3 項：只演一次、限大一上（原本每 2 天「欸，宿營兩人三腳那個…」）*/
    dialogue:[ {if:{flags:['MX_CAMP_PAIR']},speaker:'classmate_mingxuan',expression:'smile',text:'欸，宿營兩人三腳那個。你也來打球喔？'},{if:{custom:G=>(!!G.flags.CAMP_Y1||(!!G.flags.FRIEND_CARD_classmate_mingxuan&&!G.flags.MX_W1_SEEN))&&!G.flags.MX_CAMP_PAIR},speaker:'classmate_mingxuan',expression:'smile',text:'欸，你也來打球喔？'},   /* AA_205 6-14⑧：新局宿營同隊三天、兩人三腳沒和他一組 */
      {if:{custom:G=>!!G.flags.MX_W1_SEEN&&!G.flags.MX_CAMP_PAIR&&!G.flags.CAMP_Y1},speaker:'classmate_mingxuan',expression:'neutral',text:'欸，你是電影那堂有選到的那個？'},{if:{custom:G=>!!G.flags.MX_W1_SEEN&&!G.flags.MX_CAMP_PAIR&&!G.flags.CAMP_Y1&&typeof STORY!=='undefined'&&G.day<STORY.dayOfKey('2025-09-15')},speaker:'classmate_mingxuan',expression:'neutral',text:'我還在等有人退，大概沒望了。'},{if:{custom:G=>!!G.flags.MX_W1_SEEN&&!G.flags.MX_CAMP_PAIR&&!G.flags.CAMP_Y1&&typeof STORY!=='undefined'&&G.day>=STORY.dayOfKey('2025-09-15')},speaker:'classmate_mingxuan',expression:'neutral',text:'我後來沒加到，去修別的了。'},   /* BB_168 3-1 接回來（9/15 加選截止前後兩版）；有 MX_CAMP_PAIR 只用宿營那句（BB_177 第 12 節）*/   /* BB_177 第 12 節（宿營兩人三腳和他一組）*/
      {unless:{memory:[{npc:'classmate_mingxuan',tag:'FIRST_MET'}]},if:{custom:G=>!G.flags.FRIEND_CARD_classmate_mingxuan},speaker:'classmate_mingxuan',expression:'smile',text:'我江明軒，阿哲的隊友。他說你們同班。'}/* AA 11-03：第 3 週名片場（公館便宜好吃.xlsx）已經認識的不再自我介紹 */,{speaker:'classmate_mingxuan',expression:'neutral',text:'週五練球缺人，來不來？不會打也可以，來當經理。'},{choice:[{text:'「好。」',consequences:{rel:{classmate_mingxuan:{fam:4,comf:3},zhe:{fam:2}},flags:{ball_invite:true}}},{text:'「我運動白痴。」',consequences:{rel:{classmate_mingxuan:{fam:2}}}},{text:'「你上課都不抄筆記喔？」',if:{stage:{npc:'classmate_mingxuan',min:'ACQUAINTANCE'}},consequences:{rel:{classmate_mingxuan:{fam:3,trust:2}}},goto:'study'}]},{goto:'end'},{label:'study'},{speaker:'classmate_mingxuan',expression:'smile',text:'抄啊。回家就不想看了。'},{label:'end'} ] },
  // ────────────────────────────────────────── 生活小事件（auto / enter）
  { id:'ev_rain_no_umbrella', title:'下雨了', participants:[], location:'campus', trigger:'enter', weather:'rain', day_min:3, cooldown_days:2, random_weight:0.6, background:'freeze',
    dialogue:[ {speaker:null,text:'走出建築的瞬間，雨。你的傘在宿舍的桌上。'},{choice:[{text:'跑去便利商店買一把（150 元）',consequences:{money:-150,energy:-3,memo:'買了第三把傘'}},{text:'淋回去',consequences:{energy:-8,memo:'淋雨'}},{text:'在屋簷下等十分鐘',consequences:{advance:0.2}}]} ] },
  { id:'ev_library_outlet', title:'插座', participants:[], location:'library', trigger:'seat', time:[13,21],   /* 坐下才演（原本走進閱覽室就演：還沒坐下就「問旁邊的人能不能分一格」，使用者 2026-10-16）*/ day_min:3, cooldown_days:3, random_weight:0.5, background:'freeze',
    dialogue:[ {speaker:null,text:'閱覽室裡每一個靠插座的位子都有人。有人把充電線拉到桌子中央，像在宣示主權。'},{choice:[{text:'問旁邊的人能不能分一格',consequences:{energy:-1},goto:'ask'},{text:'算了，用電池',consequences:{}}]},{label:'ask'},{speaker:null,text:'對方看了你一眼，把充電線往旁邊挪了三公分。'} ] },
  // ────────────────────────────────────────── 交接包 v1 第 4 批（BB_95 第 3 節：新事件）
  /* 方奕廷 F1：黃金葛（BB_95 3-1）。他平日 12–13 在校園走走（characters.js 的日程）；和他說話就觸發，只一次。植物知識需查證（BB）。
     之後：宿舍書桌旁多一盆黃金葛（POTHOS；story3d.js 的 dormItems、pothosScene：每週澆一次就夠，沒澆也不會枯，只是不長大——v1 只有一個大小）*/
  { id:'ev_fangyt_pothos', title:'黃金葛', participants:['npc_fangyt'], location:'campus', trigger:'interact', priority:6, weekday:[1,2,3,4,5], time:[12,13], once:true, background:'blur', term:['Y1S1','Y1S2'],   /* AA_376 #19：限大一（「你是隔壁房的吧」）*/
    dialogue:[ {unless:{memory:[{npc:'npc_fangyt',tag:'FIRST_MET'}]},speaker:'npc_fangyt',expression:'neutral',text:'你是住我隔壁那間的吧？我方奕廷，森林系二年級。'},{speaker:'npc_fangyt',expression:'neutral',text:'我經過的時候看到，你們房間沒有綠色的東西。'},{speaker:'npc_fangyt',expression:'smile',text:'（從袋子裡拿出一盆小小的黃金葛）黃金葛。天南星科，耐陰，空氣不好也可以活。'},
      {speaker:'npc_fangyt',expression:'neutral',text:'莖節會長氣根，所以可以水耕，也可以土耕，而且——'},{speaker:'npc_fangyt',expression:'neutral',text:'……總之，很好養。忘記澆也不會死。'},{speaker:'npc_fangyt',expression:'smile',text:'跟你室友一樣。'},
      {choice:[{text:'「謝謝學長。」',goto:'thanks'},{text:'「我會養死。」',goto:'die'},{text:'「你袋子裡還有幾盆？」',goto:'bag'}]},
      {label:'thanks'},{speaker:'npc_fangyt',expression:'smile',text:'不用啦。我種太多了，房間放不下。'},{goto:'end'},
      {label:'die'},{speaker:'npc_fangyt',expression:'neutral',text:'不會。我說過了，它很難死。'},{goto:'end'},
      {label:'bag'},{speaker:'npc_fangyt',expression:'laugh',text:'（笑）七盆。整層樓都要有。'},
      {label:'end'},{speaker:'npc_fangyt',expression:'neutral',text:'死掉的話傳照片給我。'} ],
    consequences:{flags:{POTHOS:true},stamp:['pothosDay'],contact:'npc_fangyt'} },   /* BB_95 4-4：送盆栽時留了聯絡方式（之後「新葉。你的。」用）*/
  /* 阿凱 K1：凌晨三點的螢幕（BB_95 3-2）。睡覺觸發（trigger:'sleep'：story3d.js 的 sleepNow 在睡著之後、天亮之前演，畫面是凌晨三點的房間）：
     大一上第 3～4 週、平日晚上、隔天早上真的有課（「你明天第一堂就有課」只在隔天有早上的課時出現：這裡直接當條件；BB 2026-10-14 把「早八」改成「第一堂」，654f5dd）、只一次。
     三個選項都會換鍵盤，不懲罰：說了＝隔天晚上（ev_kai_keyboard_quiet）；蓋棉被、戴耳塞＝一週後他自己發現（ev_kai_dark_circles），再隔天換。現有的「法無明文」（ev_dorm_late_kai）保留 */
  { id:'ev_kai_late_screen', title:'凌晨三點的螢幕', participants:['kai'], location:'dorm', trigger:'sleep', term:['Y1S1'], weeks:[2,3], weekday:[0,1,2,3,4], time:[17.5,27], once:true, background:'blur',   /* BB_170 第 8、9、20 列：住進來的前兩週＝第 2～3 週；day_min 3 換成 introDone；已經換過靜音鍵盤（K-D3／K-D5）的不再演 */
    prereq:{flags:['introDone'],notMemory:[{npc:'kai',tag:'KAI_QUIET_KEYBOARD'}],custom:G=>typeof CLS!=='undefined'&&CLS.dayItems(G,G.day+1).some(it=>!it.exam&&it.t0<12)},   /* introDone、靜音鍵盤：BB_170 */
    dialogue:[ {speaker:null,text:'凌晨三點。阿凱的螢幕很亮，鍵盤很吵。你明天第一堂就有課。'},{if:{flags:['DORM_FOUR']},speaker:null,text:'（阿哲已經睡了，柏翰戴著耳塞。）'},   /* 四人房（AA_208 2-4）*/
      {choice:[{text:'「阿凱，我明天第一堂有課。」',set:{kaiScreenChoice:0},goto:'said'},{text:'（翻身，用棉被蓋住頭）',set:{kaiScreenChoice:1},end:true},{text:'（戴耳塞）',set:{kaiScreenChoice:2},end:true}]},
      {label:'said'},{speaker:'kai',expression:'neutral',text:'（頭沒回）喔。'} ],
    consequences:{stamp:['kaiScreenDay']} },
  /* K1 之後（蓋棉被、戴耳塞）：一週後的晚上，阿凱自己發現。要在房間裡（他的日程 18–32 在宿舍）*/
  { id:'ev_kai_dark_circles', title:'黑眼圈', participants:['kai'], location:'dorm', trigger:'enter', npcPresent:'kai', time:[18,27], once:true, background:'blur',
    prereq:{flagIs:{kaiScreenChoice:[1,2]},custom:G=>G.flags.kaiScreenDay!=null&&G.day>=G.flags.kaiScreenDay+7},
    dialogue:[ {speaker:'kai',expression:'neutral',text:'你黑眼圈好重欸，是不是我昨天太吵？'} ],
    consequences:{stamp:['kaiDarkDay']} },
  /* K1 之後換鍵盤：說了「我明天第一堂有課」的隔天晚上；或黑眼圈的隔天晚上。書桌下的盒子可以看（story3d.js 的 kaiBoxScene：看了才記 HELPED）*/
  { id:'ev_kai_keyboard_quiet', title:'安靜的鍵盤', participants:[], location:'dorm', trigger:'enter', time:[18,27], once:true, background:'blur',
    prereq:{custom:G=>{ const F=G.flags; return (F.kaiScreenChoice===0&&F.kaiScreenDay!=null&&G.day>=F.kaiScreenDay+1)||(F.kaiDarkDay!=null&&G.day>=F.kaiDarkDay+1); }},
    dialogue:[ {speaker:null,text:'螢幕調暗了，鍵盤換成很安靜的一把。'} ],
    consequences:{flags:{KAI_SILENT_KB:true}} },
  /* 讀書會的下一週：學姊的回答（BB_95 3-4）：P1（讀書會上沛珊問「我們為什麼要背這個？」）之後 7 天內的下一次讀書會，讀書會一開始就演（classes3d.js 的 clubEvent；
     沛珊在場、只一次）。學姊四年主題「條列越來越短」的第一個伏筆（BB_90 第 2b 節）。SIS_ANSWERED_WHY：大二上 P3 她決定重考時會讀。
     隔週沒來的玩家沒有這一場：之後第一次去讀書會，沛珊小聲說一句（ev_studygroup_p1b_missed）。舊存檔沒有 P1 的日期（peishanAskedDay）＝當作沒來 */
  { id:'ev_studygroup_p1b', retired:'使用者 2026-10-17（AA_218 17-4）：法服沒有讀書會（AA_236 A1、BB_191 §7）；沛珊 P1／P1b 搬到以安的公法讀書會（方案 A，AA_222）。定義留給已經演過的舊存檔', title:'學姊的回答', participants:['heroine_05','classmate_peishan'], location:'wancai', trigger:'activity', weekday:[3], time:[18,22], once:true, prereq:{flags:['PEISHAN_ASKED_WHY'],custom:G=>{ const d=G.flags.peishanAskedDay; return d!=null&&G.day>d&&G.day-d<=7; }}, background:'blur',
    dialogue:[ {speaker:'heroine_05',expression:'serious',text:'上週的問題。我想了一週。三件事。'},{speaker:'heroine_05',expression:'neutral',text:'一，因為會考。'},{speaker:'heroine_05',expression:'neutral',text:'二，因為背了，才有東西可以吵。'},{speaker:'heroine_05',expression:'neutral',text:'三……'},{speaker:null,text:'她停住。'},
      {speaker:'heroine_05',expression:'neutral',text:'三我還在想。今天讀刑訴。'},{legal:{context:'study',by:'heroine_05',pick:{}}},{legal:{context:'study',by:'heroine_05',pick:{}}},
      {speaker:'classmate_peishan',expression:'thinking',text:'（小聲）她第一次沒講完三件。'} ],
    consequences:{flags:{SIS_ANSWERED_WHY:true}} },
  { id:'ev_studygroup_p1b_missed', retired:'使用者 2026-10-17（AA_218 17-4）：法服沒有讀書會（AA_236 A1、BB_191 §7）；沛珊 P1／P1b 搬到以安的公法讀書會（方案 A，AA_222）。定義留給已經演過的舊存檔', title:'法服讀書會', participants:['classmate_peishan'], location:'wancai', trigger:'activity', weekday:[3], time:[18,22], once:true, prereq:{flags:['PEISHAN_ASKED_WHY'],notEvents:['ev_studygroup_p1b'],custom:G=>{ const d=G.flags.peishanAskedDay; return d==null||G.day-d>7; }}, background:'blur',
    dialogue:[ {speaker:'classmate_peishan',expression:'neutral',text:'（小聲）學姊上週回答了。她說她還在想。'},{legal:{context:'study',by:'heroine_05',pick:{}}},{legal:{context:'study',by:'heroine_05',pick:{}}} ],
    consequences:{flags:{SIS_ANSWERED_WHY:true}} },
  /* 沛珊 P1／P1b 搬到以安的公法讀書會（方案 A；使用者 07:5x；機制 BB_191 §8-7；台詞 AA_222 bb83443d）。classes3d.js 的 clubEvent 在公法讀書會那一次挑：
     P1＝大一上第 11～16 週（沒遇到的：大一下第 7 週以前第一次去讀書會也可以）、已認識沛珊、只一次；記 PEISHAN_ASKED_WHY、peishanAskedDay。
     P1b＝7 天內的下一次讀書會、以安回答，記 PS_WHY_ANSWERED。沒來那一次：沒有獨立場面（AA_222：沛珊之後在閒聊階梯 P-L3 帶一句）*/
  { id:'ev_peishan_why_plg', title:'為什麼要背', participants:['classmate_peishan','heroine_01'], location:'wancai', trigger:'activity', once:true, background:'blur',
    prereq:{memory:[{npc:'classmate_peishan',tag:'FIRST_MET'}],notFlags:['PEISHAN_ASKED_WHY'],custom:G=>{ const t=typeof CALENDAR!=='undefined'&&CALENDAR.termOf(G.day); return !!t&&((t.id==='Y1S1'&&t.week>=11&&t.week<=16)||(t.id==='Y1S2'&&t.week<=7)); }},
    dialogue:[ {speaker:null,text:'（大家在背基本權的審查標準。白板上寫滿了「目的」「手段」「必要」。）'},
      {speaker:'classmate_peishan',expression:'thinking',text:'（舉手）我可以問一個會被打的問題嗎？我們為什麼要背這個？'},
      {speaker:'classmate_bohan',expression:'serious',text:'因為會考。'},
      {speaker:null,text:'（有人笑出來。）'},
      {speaker:'heroine_01',expression:'thinking',text:'（想了一下）……我下次回答妳。現在講會講不清楚。'},
      {set:{PEISHAN_ASKED_WHY:true},stamp:['peishanAskedDay']} ] },
  { id:'ev_peishan_why_answer_plg', title:'以安的回答', participants:['heroine_01','classmate_peishan'], location:'wancai', trigger:'activity', once:true, background:'blur',
    prereq:{flags:['PEISHAN_ASKED_WHY'],notFlags:['PS_WHY_ANSWERED','SIS_ANSWERED_WHY'],custom:G=>{ const d=G.flags.peishanAskedDay; return d!=null&&G.day>d&&G.day-d<=7; }},
    dialogue:[ {speaker:'heroine_01',expression:'neutral',text:'上禮拜沛珊問的，為什麼要背審查標準。'},
      {speaker:'heroine_01',expression:'thinking',text:'不背的話，討論的時候只能說「我覺得不合理」。講不出哪裡不合理。'},
      {speaker:'heroine_01',expression:'neutral',text:'背起來，至少大家吵的時候用的是同一套話。'},
      {speaker:'classmate_peishan',expression:'neutral',text:'好，這個理由我買單。那我背。'},
      {speaker:'heroine_01',expression:'smile',text:'那今天讀比例原則。'} ],
    consequences:{flags:{PS_WHY_ANSWERED:true}} },
  /* 沛珊 P2b：溫州街的三段論（BB_95 3-5）：P2（ev_peishan_doubt）之後、大一上第 6～7 週（期中前），平日 16–19 在總圖和她說話（她的日程本來就在總圖）。
     交往中（v1 一開始都是）：「去外面講」（總圖門口的階梯），她不說「我請你」（AA_112 8-1）；單身：「去 Café？我請你。」。ADV 背景（Café 窗邊、總圖門口的階梯）還沒有，先用目前畫面。
     法律說明 BB-B 審過（BB_115 L442；BB_161 第 3 節）。「我小時候翻民法」只用 AA_12 的原意（翻得到、看不懂）。影響：筆記的第一頁第一次改寫（NOTE_PAGE1，AA_12 0-3 第 3 點；措辭需法律審查）、沛珊記憶 NOT_FOR_ME */
  { id:'ev_peishan_syllogism', title:'三段論', participants:['classmate_peishan'], location:['library','library_hall'], trigger:'interact', priority:5, weekday:[1,2,3,4,5], time:[16,19], term:['Y1S1'], weeks:[6,7], once:true, prereq:{events:['ev_peishan_doubt']}, background:'blur',
    dialogue:[ {if:GF('classmate_peishan'),speaker:'classmate_peishan',expression:'neutral',text:'總圖不能講話。去外面講。'},{unless:GF('classmate_peishan'),speaker:'classmate_peishan',expression:'smile',text:'總圖不能講話。去 Café？我請你。'},
      {speaker:'classmate_peishan',expression:'thinking',text:'老師說法律的推理是三段論。大前提是法條，小前提是事實，結論是……把事實放進法條。',libOut:true},   /* libOut：上一句「去外面講／去 Café」以後在館外（AA_595 Q12「方向對，後面在館外」；AA 11-02 20:54）*/
      {speaker:'player',text:'（在紙上畫了三個框）所以先找規則，再看這件事符不符合，最後才說結果。'},{speaker:'player',text:'……我小時候翻民法，就是少了中間那一步。'},
      {speaker:'classmate_peishan',expression:'smile',text:'（看著那三個框）你講得很開心耶。'},{speaker:'classmate_peishan',expression:'thinking',text:'我聽完的感覺是，人被放進一個框裡。'},{speaker:'classmate_peishan',expression:'thinking',text:'……我是不是不適合念這個。'},
      {choice:[{text:'「框是用來想清楚的，不是用來關人的。」',goto:'frame'},{text:'「妳可以不喜歡。」',goto:'dislike'},{text:'「我們再寫一題。」',goto:'again'}]},
      {label:'frame'},{speaker:'classmate_peishan',expression:'neutral',text:'嗯。'},{speaker:null,text:'她想了很久。'},{speaker:'classmate_peishan',expression:'thinking',text:'我懂你的意思。可是我比較想知道框外面的人在想什麼。'},{goto:'end'},
      {label:'dislike'},{speaker:'classmate_peishan',expression:'surprised',text:'……可以不喜歡？'},{speaker:null,text:'她重複一次，好像第一次聽到有這個選項。'},{speaker:'classmate_peishan',expression:'smile',text:'好，我先記著。'},{goto:'end'},
      {label:'again'},{speaker:null,text:'兩人又寫了一題。她寫得很好。'},{speaker:'classmate_peishan',expression:'thinking',text:'我寫得出來。可是寫的時候一點都不想寫。'},
      {label:'end'} ],
    consequences:{mem:[{npc:'classmate_peishan',tag:'NOT_FOR_ME',note:'三段論那天'}],flags:{NOTE_PAGE1:1},toast:'📓 筆記的第一頁：你改寫了一行'} },
  /* 明軒 M1：公車站的筆記（BB_95 3-6，v1 版）：週二、週四 21–22 點，他家教完剛下公車，在公館騎樓的公車站把民總筆記畫完（characters.js 的日程：linger）。
     和他至少 ACQUAINTANCE、大一上第 7 週（期中前一週）起、只一次。SAW_HIM_STUDY：期中後桌遊團的聚餐（A15）阿哲說「明軒從來不念書」時多一個選項。
     解鎖他的聯絡方式；「公館一百元以內」的店家清單（BB_70 F-M1）那晚 23:00 私訊、進筆記本（地圖上的小標先不做）。公車站的長椅還沒有（站著）——環境細節那一批（D70） */
  /* AA_497 4-1：M1 多一個入口＝總圖 B1 二十四小時自習室，週二、四 22:00～23:30，大一上第 7 週～大一下第 16 週（ev_mingxuan_notes_b1，src/sup497_3d.js 照這一場組）；兩個入口只演一個 */
  { id:'ev_mingxuan_notes', title:'公車站的筆記', participants:['classmate_mingxuan'], location:'gongguan', trigger:'interact', priority:6, weekday:[2,4], time:[21,22], term:['Y1S1'], once:true, prereq:{stage:{npc:'classmate_mingxuan',min:'ACQUAINTANCE'},custom:G=>{ const t=typeof CALENDAR!=='undefined'&&CALENDAR.termOf(G.day); return !!t&&t.week>=7&&!(G.events&&G.events.done&&G.events.done.ev_mingxuan_notes_b1); }}, background:'blur',
    dialogue:[ {speaker:null,text:'明軒戴著耳機，膝蓋上攤著民總的筆記，三種顏色的螢光筆。'},{speaker:null,text:'他看到你，把筆記蓋起來。'},{speaker:'classmate_mingxuan',expression:'embarrassed',text:'……你沒看到。'},{speaker:'classmate_mingxuan',expression:'laugh',text:'（笑）我在看漫畫啦。'},
      {choice:[{text:'「我什麼都沒看到。」',goto:'nothing'},{text:'「你從哪裡回來？」',goto:'where'},{text:'（坐到他旁邊，也拿出筆記）',goto:'sit'}]},
      {label:'nothing'},{speaker:'classmate_mingxuan',expression:'smile',text:'很好。'},{speaker:null,text:'他把筆記打開，繼續畫。'},{speaker:null,text:'走到校門口。'},{speaker:'classmate_mingxuan',expression:'smile',text:'我先回宿舍了。'},{goto:'end'},
      {label:'where'},{speaker:'classmate_mingxuan',expression:'neutral',text:'……家教。三個。'},{speaker:null,text:'他看馬路。'},{speaker:'classmate_mingxuan',expression:'neutral',text:'我爸的店最近生意不太好，我多接一點。'},{speaker:null,text:'然後轉回來，笑了。'},{speaker:'classmate_mingxuan',expression:'smile',text:'好，這個話題結束。你要不要看漫畫？'},{mem:[{npc:'classmate_mingxuan',tag:'SHARED_SECRET',note:'他多接了家教'}]},{goto:'end'},
      {label:'sit'},{speaker:null,text:'兩個人一路沒講話。'},{speaker:'classmate_mingxuan',expression:'laugh',text:'你的螢光筆只有一種顏色？很可憐耶。'},{speaker:null,text:'他給你一支綠色的。'},{set:{GREEN_HIGHLIGHTER:true}},
      {label:'end'} ],
    consequences:{mem:[{npc:'classmate_mingxuan',tag:'SAW_HIM_STUDY'}],contact:'classmate_mingxuan',stamp:['MX_M1_DAY'],memo:'在公館的公車站遇到明軒'} },   /* MX_M1_DAY：那晚 23:00 他傳「公館一百元以內」的清單（story3d.js phoneRules 'mx_fm1'，BB_70 F-M1）*/
  /* 校慶：法服的法律問答攤（BB_95 3-7）：大一上第 11 週週六（11/15，校慶日期需查證）10–12 點，走近椰林大道上法服的帳篷（zones3d.js：校慶那天擺出社團博覽會的同一排帳篷；
     學姊的日程那兩小時站在攤前）。沒加入法服的玩家經過也會被她叫住；攤位上還有阿嬤和法服的人，不是兩個人單獨相處。主線不會主動把玩家帶過去（BB_90 第 1 節）。
     阿嬤的問題只引導到「先溝通、再來法服」，不給法律結論、不引用條號（需法律審查；學生不能獨立給法律意見）。
     小插曲（都可以沒有）：芷若——有她的聯絡方式、FAMILIAR 以上：手機問一題（學姊從旁邊看到螢幕）；子晴——INVITED_CLUB：吉他社群組傳攤位照片（story3d.js 的 phoneRules）*/
  { id:'ev_sis_festival_booth', title:'法律問答攤', participants:['heroine_05'], location:'campus', trigger:'auto', term:['Y1S1'], weeks:[11], weekday:[6], time:[10,12], once:true, npcPresent:'heroine_05', near:{x:-17.8,z:13.0,r:4.5}, background:'blur', prereq:{flags:['met_sis']},   /* AA_207 附錄 §2：還沒見過她的玩家，陌生學姊不會直接叫人顧攤 */
    dialogue:[ {speaker:'heroine_05',expression:'serious',text:'學弟。有空嗎？'},{speaker:'heroine_05',expression:'neutral',text:'幫我顧十分鐘就好。不會的叫我。'},
      {speaker:'阿嬤',text:'少年仔，隔壁的樹長到我家這邊，我可以自己剪嗎？'},
      {choice:[{text:'「阿嬤，我幫妳問學姊。」',consequences:{rel:{heroine_05:{fam:2}}},goto:'ask'},{text:'（翻民總的筆記）',consequences:{rel:{heroine_05:{fam:2}}},goto:'notes'},{text:'「我也還不會，我們一起查。」',consequences:{rel:{heroine_05:{fam:3,resp:2}},mem:[{npc:'heroine_05',tag:'HELPED',note:'一起幫阿嬤查'}]},goto:'search'}]},
      {label:'ask'},{speaker:'heroine_05',expression:'neutral',text:'阿嬤，先跟鄰居講，請他剪。講了一直沒剪，兩週後的週六早上，九點到十二點，來B館。值班的學長姊會幫妳看。'},{goto:'side'},
      {label:'notes'},{speaker:null,text:'翻了半天找不到。學姊探頭。'},{speaker:'heroine_05',expression:'neutral',text:'那是物權。你們大二才上。'},{speaker:'阿嬤',text:'物權是什麼？'},{speaker:'heroine_05',expression:'neutral',text:'……阿嬤，下一次值班，週六早上來。'},{goto:'side'},
      {label:'search'},{speaker:null,text:'你和阿嬤用手機一起查。學姊在旁邊看完。'},{speaker:'heroine_05',expression:'smile',text:'還可以。'},
      {label:'side'},
      {if:{memory:[{npc:'heroine_02',tag:'FIRST_MET'}],stage:{npc:'heroine_02',min:'FAMILIAR'},custom:G=>typeof INV!=='undefined'&&INV.hasContact(G,'heroine_02')},phone:'heroine_02',text:'聽說你在顧法律問答攤。問一題：電影裡偷看別人的信，算犯罪嗎。'},
      {if:{memory:[{npc:'heroine_02',tag:'FIRST_MET'}],stage:{npc:'heroine_02',min:'FAMILIAR'},custom:G=>typeof INV!=='undefined'&&INV.hasContact(G,'heroine_02')},speaker:'heroine_05',expression:'neutral',text:'（從旁邊看到螢幕）哪部電影？'},
      {if:{memory:[{npc:'heroine_02',tag:'FIRST_MET'}],stage:{npc:'heroine_02',min:'FAMILIAR'},custom:G=>typeof INV!=='undefined'&&INV.hasContact(G,'heroine_02')},phone:'heroine_02',text:'……很多部。'},
      {if:{memory:[{npc:'heroine_02',tag:'FIRST_MET'}],stage:{npc:'heroine_02',min:'FAMILIAR'},custom:G=>typeof INV!=='undefined'&&INV.hasContact(G,'heroine_02')},speaker:'heroine_05',expression:'neutral',text:'那要一部一部看。'} ],
    consequences:{stamp:['festivalBoothDay'],memo:'校慶，在法服的攤位顧了十分鐘'} },
  /* 學姊 M1：家族聚餐（BB_95 3-8）：大一上第 14 週週五 18:18–19:00 在公館（學姊週五 18:30–20:30 本來就在公館），阿鳳麵店。ADV 背景（麵店）先用目前畫面。
     前一週 Kevin 在家族群組約（phoneRules）；當晚 22:30 學姊在群組訂正考古題；沒去的玩家：Kevin 貼資料夾照片、學姊說書會留給學弟（phoneRules）。
     「善意」的說明需法律審查。三個選項都有 SHARED_MEAL；問「收到」那一題設 SIS_NO_STICKER（同一學期的跨年夜，她第一次在群組貼貼圖，BB_108）。
     第一個選項接第二天的課堂（被周老師點名）；那天沒去上課的玩家沒有這個選項；第二個選項要在家族群組裡（看得到她都回「收到」） */
  /* 大二下的家族聚餐（AA_258 6-1，AA 定稿「要排一場」；AA258-SIS-GAPS-1031）：2027-03-12（五，大二下第 3 週）19:00 公館的簡餐店，Kevin 揪、新的大一學弟妹第一次來。
     3/9 21:00 家族群組 Kevin 兩則＋學姊「好。」（story3d.js）；走到公館（18:30～20:30）就演，可以不去。學姊 S4-L8 的 linesIf「……你也看到了。」看這一場 */
  { id:'ev_family_dinner_y2s2', title:'家族聚餐（大二下）', participants:['heroine_05'], location:'gongguan', trigger:'auto', term:['Y2S2'], weeks:[3], weekday:[5], time:[18.5,20.5], once:true, background:'blur',
    prereq:{custom:G=>(G.stage||'law')==='law'&&typeof PHONE!=='undefined'&&PHONE.inGroup(G,'family_law')},
    dialogue:[ {speaker:null,text:'（長桌的一頭坐著四個大一的學弟妹。學姊進門的時候，他們同時站了起來。）'},
      {speaker:'Kevin 學長',text:'坐啦坐啦，她又不是教授。'},
      {speaker:'heroine_05',expression:'neutral',text:'坐。我坐下來你們再坐。'},
      {speaker:null,text:'（她坐下來。學弟妹又站了一次，才坐好。）'} ],
    consequences:{memo:'家聚（大二下）'} },
  { id:'ev_sis_family_dinner', title:'家族聚餐', participants:['heroine_05'], location:'gongguan', trigger:'auto', term:['Y1S1'], weeks:[14], weekday:[5], time:[18,19.5], once:true, background:'blur',   /* 窗口放寬到 18:00～19:30（AA_160 3-4 B 表、BB_95 3-8）*/
    dialogue:[ {if:{custom:G=>G.hour%24<18.5},speaker:null,text:'你先到了。燒臘店的阿姨把你們那一桌的椅子擺好。'},{speaker:null,text:'18:31。她跑進來，有點喘。'},{speaker:'heroine_05',expression:'surprised',text:'抱歉。抱歉，我遲到了。'},{speaker:'Kevin 學長',text:'一分鐘。學姊，一分鐘。'},{speaker:'heroine_05',expression:'neutral',text:'一分鐘也是遲到。'},
      {unless:{flags:['SIS_W1']},speaker:'player',text:'學姊好，我是{name}。我是妳的直屬。'},{unless:{flags:['SIS_W1']},speaker:'heroine_05',expression:'neutral',text:'我知道。群組裡那個名字。'},   /* AA_470 5-1：還沒認識她的（沒有 SIS_W1）兩句，演完記 met_sis、SIS_W1（同 9/12 家聚 ev_sis_fam_dinner）*/
      {speaker:null,text:'她坐下，從包包拿出一個資料夾。'},{speaker:'heroine_05',expression:'neutral',text:'周老師歷年的考古題。我整理過，錯的地方用紅筆改了。'},{speaker:'heroine_05',expression:'neutral',text:'下學期的書，開學前我會分。書上標紅的地方是修法了，要查新的。'},{speaker:'heroine_05',expression:'neutral',text:'還有——'},   /* AA_398 第 4 列 */
      {speaker:'Kevin 學長',text:'還有傳統！直屬學姊要講一個自己大一的糗事！'},{speaker:'heroine_05',expression:'neutral',text:'……'},{speaker:'heroine_05',expression:'neutral',text:'我大一第一次被點名，老師問什麼是「善意第三人」。我說：心地善良的第三人。'},{speaker:'heroine_05',expression:'neutral',text:'老師說：「那心地不好的第三人，是不是就不用保護了？」'},
      {speaker:null,text:'全桌笑。她也笑了一下。'},{speaker:'heroine_05',expression:'smile',text:'其實「善意」在法律上是「不知道」的意思。下學期你們就會學到。'},
      {choice:[{text:'「民總第一堂我就被周老師點到，手心都是汗。」',unless:{flagIs:{classAnswer:'absent'}},consequences:{rel:{heroine_05:{comf:3}}},goto:'called'},{text:'「學姊在群組為什麼都只回『收到』？」',if:{custom:G=>typeof PHONE!=='undefined'&&PHONE.inGroup(G,'family_law')},consequences:{rel:{heroine_05:{fam:3}}},set:{SIS_NO_STICKER:true},goto:'sticker'},{text:'（默默把考古題資料夾收進書包）',consequences:{rel:{heroine_05:{resp:2}}},goto:'folder'}]},
      {label:'called'},{speaker:'heroine_05',expression:'smile',text:'那一題大家都會卡。你有回答就很好了。'},{goto:'end'},
      {label:'sticker'},{speaker:'heroine_05',expression:'neutral',text:'因為收到了。'},{speaker:'Kevin 學長',text:'她連過年都回收到。'},{speaker:'heroine_05',expression:'neutral',text:'不然要回什麼？'},{speaker:'Kevin 學長',text:'貼圖啊！'},{speaker:'heroine_05',expression:'neutral',text:'我沒有貼圖。'},{goto:'end'},
      {label:'folder'},{speaker:null,text:'學姊看了一眼。'},{speaker:'heroine_05',expression:'neutral',text:'資料夾回去再看。現在吃飯。'},{speaker:'Kevin 學長',text:'學姊說吃飯耶！'},
      {label:'end'},{speaker:'heroine_05',expression:'smile',text:'下學期的書，我會留給你。'},{unless:{flags:['SIS_W1']},set:{SIS_W1:true,met_sis:true}} ],
    consequences:{mem:[{npc:'heroine_05',tag:'SHARED_MEAL',note:'家族聚餐'}],stamp:['familyDinnerDay'],memo:'直屬家族聚餐（公館燒臘）'} },
  /* 哲 1：不用約，來就有人（AA_40 哲 1；交付清單 A9）：大一上第 4 週週四起（遊戲裡的第二個週四），週二、週四傍晚在阿鳳麵店遇到阿哲（他的日程 17:30–20:30）——
     第 4 週週四沒去的玩家，順延到之後第一次在麵店遇到他（BB_95 第 5 節第 4 點：不能永久錯過）；只一次。麵店的長桌從這裡開始：
     阿哲建「桌遊團」群組（AA_70 2-3），之後每個上課週的週二、週四 17:30 他在群組裡揪（story3d.js 的 phoneRules）。阿姨＝麵店的老闆娘（店員是路人模型，沒有名字）*/
  /* 約（AA_542 1-1）：大一上第一次民總下課（開學 9/1 的局第 2 週週四，舊局第 4 週週四；沒上課的不約）。答應＝18:30 阿鳳麵店（出遊）；不管答應不答應，當天 21:00 建群組（story3d.js phoneRules）。
     classAlso：同一堂下課已經有別的事件（學姊家聚 ev_sis_fam_hall2）也接著演這一件（classes3d.js afterClassEvent）*/
  { id:'ev_zhe_noodle_invite', title:'晚上吃燒臘？', participants:['zhe'], location:'any', trigger:'class', afterClass:'civ_general', classAlso:true, term:['Y1S1'], weekday:[4], once:true, background:'blur',
    prereq:{custom:G=>typeof STORY!=='undefined'&&!!STORY.termDay&&G.day===STORY.termDay('Y1S1',STORY.week1Start&&STORY.week1Start(G)?2:4,4)&&G.flags.classAnswer!=='absent'&&G.flags.noodleTableDay==null&&(!STORY.knows||STORY.knows('zhe',G))},
    dialogue:[ {speaker:'zhe',expression:'smile',text:'晚上吃燒臘？公館那家，阿鳳。'},
      {choice:[{text:'「好。」',goto:'y'},{text:'「今天不行。」',goto:'n'}]},
      {label:'y'},{speaker:'zhe',expression:'smile',text:'六點半，店門口。'},{set:{ZHE_NOODLE_INV:'yes'}},{goto:'end'},
      {label:'n'},{speaker:'zhe',expression:'neutral',text:'好啊，下次。'},{set:{ZHE_NOODLE_INV:'no'}},
      {label:'end'} ],
    consequences:{stamp:['zheNoodleInvDay']} },
  { id:'ev_zhe_long_table_out', title:'第一次併桌', participants:['zhe'], location:'any', trigger:'outing', once:true, background:'blur', hours:1.5,
    dialogue:[ {scene:'公館燒臘',bg:'noodle_table'} ].concat(ZHE_FIRST_TABLE) },   /* 群組照約的那天 21:00 建（story3d.js phoneRules 設 noodleTableDay）*/
  /* AA_684 第 4 項（企劃線 0382b8a34，AA-C 定 D109）：自己走進燒臘店的那一條——原本看麵店日（ndlDay），阿哲的麵店日拿掉（AA_675 1-2）以後演不到；改成看阿哲照作息在燒臘店（npcZone：週二、四 18:00～19:30，characters.js），台詞照舊 */
  { id:'ev_zhe_long_table', title:'第一次併桌', participants:['zhe'], location:'noodle', trigger:'auto', near:{npc:'zhe',r:6}, term:['Y1S1'], weekday:[1,2,3,4,5], npcZone:'zhe', time:[17.5,20.5], once:true, background:'blur',
    prereq:{custom:G=>typeof STORY!=='undefined'&&!!STORY.termDay&&G.day>=STORY.termDay('Y1S1',STORY.week1Start&&STORY.week1Start(G)?2:4,4)&&!(G.events&&G.events.done&&G.events.done.ev_zhe_long_table_out)&&!(G.flags.ZHE_NOODLE_INV==='yes'&&G.day===G.flags.zheNoodleInvDay)},   /* A13（AA_195 4-7）的日子；約好當天晚上的那一頓由出遊演 */
    dialogue:ZHE_FIRST_TABLE.slice() },   /* AA_623 第 2 節：這一頓不再加群組（原本 after 記 noodleTableDay），只留著認識 Alison（AA_606 3-3）*/   /* 沒被約過的（那天沒上民總）：這一場才建群組；約過的已經在約的那天 21:00 建了，不改日子 */
  /* 桌遊團群組的補救（AA_496 第 9 節第 3 點，NPC-STORY-1028）：錯過哲 1 的人（ZHE_GROUP_LATE），大一下第 2 週起第一次在麵店遇到阿哲（同哲 1：麵店、阿哲在旁邊 6 m 內），
     或和阿哲說話、有點熟以上（下一個事件）：阿哲當面一句（當面說的，有標點：口氣表），然後照長桌那一場的做法加進桌遊團——記 noodleTableDay（story3d.js 的 phoneRules 加群組、
     阿哲兩則規矩、之後的揪、期末最後一頓都照它）；NDL_LATE_ADD＝群組早就有了，系統訊息寫「把你加進了」，不寫「建立了」。只一次 */
  { id:'ev_zhe_group_late', title:'拉進群組', participants:['classmate_mingxuan'], location:'noodle', trigger:'auto', near:{npc:'classmate_mingxuan',r:6}, once:true, background:'blur',   /* AA_623 第 2 節：說話的人改明軒 */
    prereq:{custom:G=>ZHE_GROUP_LATE(G)},
    dialogue:[ {speaker:'classmate_mingxuan',text:'欸，你還沒進群組？我拉你。'} ],
    consequences:{stamp:['noodleTableDay'],flags:{NDL_LATE_ADD:true,BGN_JOIN:'late'}} },
  { id:'ev_zhe_group_late_talk', title:'拉進群組', participants:['classmate_mingxuan'], location:'any', trigger:'interact', priority:6, once:true, background:'blur',   /* AA_623 第 2 節：說話的人改明軒 */
    prereq:{stage:{npc:'classmate_mingxuan',min:'FAMILIAR'},custom:G=>ZHE_GROUP_LATE(G)},   /* 有點熟以上＝SOCIAL.STAGES 的 FAMILIAR 起算（AA_497 開頭）*/
    dialogue:[ {speaker:'classmate_mingxuan',text:'欸，你還沒進群組？我拉你。'} ],
    consequences:{stamp:['noodleTableDay'],flags:{NDL_LATE_ADD:true,BGN_JOIN:'late'}} },
  /* 語 1：傅鐘旁邊的早餐（AA_40 語 1；交付清單 A10）：大一上第 3～5 週的早上，Alison 坐在傅鐘旁邊的長椅（她的日程：平日上課前 08:20～09:05，AA_156 第 4 節；原本 9:30–12:00），找她說話時；
     要先認識她（第一次說話是 talkYu 的自我介紹），而且不是認識的同一天（自我介紹已經講過三個社團）；只一次。
     「坐下來一起吃」記憶 BREAKFAST_YU（之後早上經過傅鐘她會先揮手：AA_118，之後再做）。吉他社的入口之一（另一個是阿凱）*/
  { id:'ev_yu_breakfast', title:'晨思鐘旁邊的早餐', participants:['yu'], location:'campus', trigger:'interact', priority:6, term:['Y1S1'], weeks:[2,3,4,5], time:[8+20/60,9+5/60], once:true, background:'blur',   /* A14（AA_195 4-7）：第 2～5 週（舊局的第 2 週在第 1 天以前，等於照舊）*/
    prereq:{flags:['met_yu'],custom:G=>G.flags.metYuDay==null||G.flags.metYuDay<G.day},
    dialogue:[ {speaker:'yu',expression:'smile',text:'欸，你要不要坐？'},{speaker:'yu',expression:'neutral',text:'我一個人吃很怪。……太安靜了。我不喜歡安靜。'},
      {speaker:'yu',expression:'smile',text:'對了，你都這麼早經過喔？我是板橋的車太早到。'},   /* AA_313 5-4：第一次見面剛推過三個社團，這裡不再推一次（選項「三個社團不會累嗎？」照留）*/
      {choice:[{text:'（坐下來一起吃）',consequences:{mem:[{npc:'yu',tag:'BREAKFAST_YU',note:''}],flags:{YU_CLUB_INVITE:true},advance:0.25},goto:'sit'},{text:'「我上課要遲到了。」',goto:'rush'},{text:'「辯論社不會累嗎？」',goto:'tired'}]},   /* AA_497 3-8：這個選項拿掉「三個社團」四個字、換成辯論社（她自我介紹說過；列給 AA 看）*/
      {label:'sit'},{speaker:null,text:'她講了十五分鐘，關於三個社團。'},{unless:{custom:G=>typeof INV!=='undefined'&&INV.hasContact(G,'yu')},speaker:'yu',expression:'smile',text:'欸你有沒有群組？沒有？我拉你。',consequences:{contact:'yu'}},{speaker:'yu',expression:'smile',text:'明天你也會經過嗎？'},{goto:'end'},   /* 聯絡方式的劇情時刻（AA_124 1-7、AA_70 2-4）*/
      {label:'rush'},{speaker:'yu',expression:'smile',text:'喔，好！'},{speaker:null,text:'她揮手。等你走遠，她把耳機戴上。'},{goto:'end'},
      {label:'tired'},{speaker:'yu',expression:'laugh',text:'累啊。'},{speaker:'yu',expression:'smile',text:'可是累就不會想東想西。'},
      {label:'end'} ],
    after:(G,GM)=>{ if(G.flags.YU_CLUB_INVITE&&GM.addNote) GM.addNote('yu_club_guitar','吉他社（Alison 說的）','第 5 週起，週一、週三 19:00，法律系館B一樓多功能教室。'); } },   /* AA_156 1-1：只有「坐下來一起吃」那一支有時間地點（她講了十五分鐘三個社團）；不設 guitar_invite（那是阿凱跟子晴提過你）*/
  /* 以安的報告分工（交接包 v1 第 3 節，AA 2026-10-14 補台詞；交付清單 A12；AA_113 9-1「分組報告是合作」）：大一上第 4 週週四民總下課後（第 4 週沒去上課的話，第 5 週那堂）——
     classes3d.js 的 afterClassEvent：那堂課上完就在教室裡接著演（afterClass＝課的 id；trigger 'class' 不會被別的地方觸發）。
     條件：第二天和以安一起度過下午（Café 或總圖：afternoonDone，cafeView 兩邊都有）；沒有的玩家沒有這一段，以安自己寫。舊存檔已經演過「報告的結論」（她自己寫完了）的也沒有。
     「好，一起寫。」＝記憶 REPORT_PARTNER、照第二天的看法分工；「我已經有組了。」不扣分。之後：沒有一起寫的，她寫完在總圖給你看（ev_an_report_followup）；第 6 週報告發回來兩種都接得上 */
  { id:'ev_an_report_split', title:'民總的報告', participants:['heroine_01'], location:'classroom', trigger:'class', afterClass:'civ_general', term:['Y1S1'], weeks:[4,5], weekday:[4], once:true, npcPresent:'heroine_01', background:'blur',
    prereq:{flags:['afternoonDone'],notEvents:['ev_an_report_followup'],notMemory:[{npc:'heroine_01',tag:'REPORT_PARTNER'}]},   /* AA_587 第 7-2 節 S4：第二天她追出來就分組了（meetAn 記 REPORT_PARTNER）——這一場、_late、_followup 只剩舊存檔會演 */
    dialogue:[ {speaker:'heroine_01',expression:'neutral',text:'（把講義收好）民總的報告兩人一組。我還沒有組。'},
      /* AA_313 第 0 節（X70）：「你那天講的」是第二天 Café 那段——錯過的玩家（沒有 cafeView）換一句：上課回答過（classAnswer）／兩個都沒有 */
      {if:{custom:G=>!!(G.choices&&G.choices.cafeView)},speaker:'heroine_01',expression:'neutral',text:'你那天講的，我想放進去。'},
      {if:{custom:G=>!(G.choices&&G.choices.cafeView)&&!!(G.flags&&G.flags.classAnswer)},speaker:'heroine_01',expression:'neutral',text:'你上課回答的那題，我想放進去。'},
      {if:{custom:G=>!(G.choices&&G.choices.cafeView)&&!(G.flags&&G.flags.classAnswer)},speaker:'heroine_01',expression:'neutral',text:'你呢？'},
      {choice:[{text:'「好，一起寫。」',consequences:{mem:[{npc:'heroine_01',tag:'REPORT_PARTNER',note:'民總'}]},goto:'yes'},{text:'「我已經有組了。」',goto:'no'}]},
      {label:'yes'},{if:{choice:{cafeView:'A'}},speaker:'heroine_01',expression:'smile',text:'那結論你寫。'},{if:{choice:{cafeView:'B'}},speaker:'heroine_01',expression:'smile',text:'那反方你寫。'},
      {if:{choice:{cafeView:'C'}},speaker:'heroine_01',expression:'smile',text:'那判斷標準你寫，你比我會講。'},
      {if:{custom:G=>!(G.choices&&G.choices.cafeView)},speaker:'heroine_01',expression:'smile',text:'好。那分工我來排。'},{goto:'end'},   /* AA_313 第 0 節：沒有 cafeView 的玩家 A／B／C 三句都不出 */
      {label:'no'},{speaker:'heroine_01',expression:'neutral',text:'好。那我自己寫，寫完給你看。'},
      {label:'end'} ] },
  /* 迎新（交接包 v1 A11：AA_71 2-1＋沛珊 P0 BB_95 3-3）：參加法律系迎新的活動時演（src/data/activities.js 的 welcome_y1s1：第 4 週週六傅鐘前；classes3d.js 的 attendActivity 讀活動的 event）。
     只有認識的人在場（交付清單第 0 節第 1 點）：Alison、柏翰沒見過就跳過那兩句。
     自我介紹三個選項照 AA_883（企劃線 db44bb9ab，定稿 BB_422；CANON-NO-ECON-1112 第四批）：都不設旗標、不加減數值；「哥」的來源在宿營打牌（AA_859 ZHE_CALLS_GE），這裡只讀。「學長」是帶隊的學長，沒有名字、立繪。
     沛珊 P0：大地遊戲同一組、「奇怪的問題」只在這裡一次；記 FIRST_MET（participants）＋聯絡方式（迎新的群組）。第一句、「輪到你。」、大地遊戲那句是 LAWWW 加的場景說明（AA_355 第 2 節：AA 看過、照用）*/
  /* 民總報告分組的補救（AA_160 3-4 C、R3，AA-B 2026-10-16 寫的台詞）：第 4、5 週民總都沒去、分組事件沒演過——第 6 週起第一次在教室或總圖遇到以安，
     她說把你寫進她那組了；記同一個 REPORT_PARTNER（備註 assigned_absent）＋REPORT_PARTNER_LATE，後面讀 REPORT_PARTNER 的事件照常接。分組是事實、不是玩家經歷的場面（R4）*/
  { id:'ev_an_report_split_late', title:'民總的報告（分組那天你沒來）', participants:['heroine_01'], location:['classroom','library','library_hall'], trigger:'auto', near:{npc:'heroine_01',r:5}, term:['Y1S1'], weeks:[6,7,8,9,10,11,12,13,14,15], once:true, keep:'must', background:'blur',
    prereq:{flags:['afternoonDone'],notEvents:['ev_an_report_split'],notMemory:[{npc:'heroine_01',tag:'REPORT_PARTNER'}]},
    dialogue:[ {speaker:'heroine_01',expression:'neutral',text:'民總的報告，老師分組那天你沒來。'},{speaker:'heroine_01',expression:'smile',text:'我把你寫在我這組了。剩下的人裡，你最不會遲交。'} ],
    consequences:{mem:[{npc:'heroine_01',tag:'REPORT_PARTNER',note:'分組那天沒來，以安把你寫進她那組'}],flags:{REPORT_PARTNER_LATE:'assigned_absent'}} },
  { id:'ev_welcome_y1s1', title:'迎新', participants:['classmate_peishan'], location:'campus', trigger:'activity', once:true, background:'blur',   /* 不寫 term：8/31 在大一上開學前（AA_310），日期由 activities.js welcome_y1s1 管 */
    dialogue:[ {speaker:null,text:'星期天上午，晨思鐘前面，法律系的迎新。下午就是開學典禮。學長姊帶隊，大家先輪流自我介紹。'},   /* AA_310 第 1 節：8/31（日）上午 */
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('yu',G)},speaker:null,text:'Alison 自我介紹講了三分鐘她的三個社團。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('yu',G)&&STORY.knows('classmate_bohan',G)},speaker:'classmate_bohan',expression:'neutral',text:'（小聲）她剛剛講了四個。'},
      {speaker:null,text:'輪到你。'},
      {choice:[{text:'「我叫{name}，臺北人。」',goto:'game'},{text:'「我叫{name}。從小就想念這裡。」',goto:'here'},{text:'「我叫{name}。……就這樣。」',goto:'short'}]},   /* AA_883（CANON-NO-ECON-1112 第四批）*/
      {label:'here'},{speaker:null,text:'（前面有人回頭看了你一眼。）'},{if:{flags:['ZHE_CALLS_GE']},speaker:'zhe',text:'（小聲）哥講得好認真。'},{unless:{flags:['ZHE_CALLS_GE']},speaker:'旁邊一個男生',text:'（小聲）好認真。'},{goto:'game'},
      {label:'short'},{speaker:null,text:'（全場安靜了一秒，有人笑出來。）'},{speaker:'學長',text:'好，很有效率。下一個。'},{goto:'game'},
      {label:'game'},{speaker:null,text:'大地遊戲，你和沛珊同一組。最後一關：用一句話說為什麼念法律。'},
      {speaker:'classmate_peishan',expression:'neutral',text:'我可以問一個奇怪的問題嗎？如果答不出來，可以算過關嗎？'},
      {choice:[{text:'（替她答）「她想知道法律外面還有什麼。」',goto:'answer'},{text:'「我也還在找。」',goto:'search'}]},
      {label:'answer'},{speaker:null,text:'她看了你一眼。'},{speaker:'classmate_peishan',expression:'surprised',text:'……你怎麼知道。'},{speaker:null,text:'關主讓你們過了。'},{goto:'end'},
      {label:'search'},{speaker:'classmate_peishan',expression:'smile',text:'好。那我們兩個都還在找。'},
      {label:'end'} ],
    consequences:{contact:'classmate_peishan',stamp:['welcomeDay']} },
  /* 可昕 K1 導遊：第一次開車去政大（BB_95 9-1）：出遊事件（trigger 'outing'：src/outings3d.js 在約好的時間問「出發」，出發才演）；政大的 2D 背景還沒有圖（深色底＋地點字幕）。
     影子那一題三個選項都不記憶（BB 2026-10-14）；小吃街記 K1_ORDER（hers／mine／let_her）；記憶 OUR_SHOP_FIRST；NCCU_VISITED。只一次。
     v1 不放經濟系大一的回聲（「上次是假裝的導遊。這次是真的。」）*/
  /* 可昕 K1b 予樂說：及格（BB_95 9-2）：K1 之後第 6～8 週，她在平日下午傳「明天晚上有空嗎？……」（story3d.js 的 phoneRules）；答應＝隔天 19:30、晚一點＝21:00 去政大（出遊）。
     流程照 AA_112 第 12 節：校門 → 山下的小吃街（予樂先到；予樂的第一句三選一＝YL_IMPRESSION）→ 可昕到了 → 河堤（假設題，玩笑、不給結論）→ 圖書館 → 停車場（約下一次）；
     （2026-10-16 AA_137 7-1：政大只做主要校園＋宿舍——河堤→校園裡的路、圖書館→自強十舍樓下、停車場→校門；台詞不改）
     隔天中午她傳予樂的紙條照片「及格。」（phoneRules）。「這週不行」：她自己去，予樂的第一句延到第一次見面（予樂戴紙巾皇冠的照片 AA_503 改成可昕的動態第 3 則，去沒去都出，src/feed3d.js）。
     旁白「可昕到了……」「她在桌下踢你一下……」、圖書館那一句、停車場的兩個選項之後沒有回應，是照 BB 的流程寫成的；BB-B 看過（e0e7a359，第①級）：小吃街加予樂口頭禪那句、宿舍樓下改成讀自己的書、校門加兩句 */
  /* 中秋烤肉（交付清單 A13：AA_71 2-2、AA_109 7-3）＋可昕 K3 第一次見桌遊團（BB_95 9-4）：大一上第 5 週週六 15:00 河濱（出遊；阿哲在桌遊團群組、沒有群組的私訊揪，story3d.js）。
     只有認識的人在場（交付清單第 0 節第 1 點）：AA 的「小事」每一句看那個人認識了沒；語彤不在就沒有阿姨醃的肉那一段。可昕：前一天她問，回「來我們這邊」才來（KX_BBQ_COME）。
     介紹她三選一（BB 2026-10-14）；之後阿哲和她比冷笑話，玩家選誰贏。
     AA 的「小事」是條列，旁白照條列的字寫成句子。AA 2026-10-14：沒有桌遊團群組的玩家第一句是「大家借了」；加「你被分到顧火。火一直熄。」；
     只記 MIDAUTUMN_Y1，不加數值、不記 SHARED_MEAL */
  { id:'ev_mid_autumn_bbq', title:'中秋烤肉', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:3,
    dialogue:[ {scene:'河濱',bg:'riverside'},   /* AA_623 第 3 節（企劃線 ace533a43）：照原本在河濱；只有揪人改成明軒（story3d.js phoneRules）*/
      {if:{custom:G=>typeof PHONE!=='undefined'&&PHONE.inGroup(G,'noodle_team')},speaker:null,text:'中秋節前的河濱。阿哲借了一個烤肉架。'},
      {unless:{custom:G=>typeof PHONE!=='undefined'&&PHONE.inGroup(G,'noodle_team')},speaker:null,text:'中秋節前的河濱。大家借了一個烤肉架。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('yu',G)},speaker:null,text:'阿哲負責烤，Alison 負責吃。'},
      {unless:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('yu',G)},speaker:null,text:'阿哲負責烤。'},
      {cg:'cg_midautumn_riverside'},   /* CG-14 中秋的河濱（BB 2026-10-14 ART_APPROVED）：去烤肉的玩家都有，從這一句起 */
      {speaker:null,text:'你被分到顧火。火一直熄。'},
      {if:{flags:['ZHE_CALLS_GE']},goto:'ge_after'},   /* 到中秋烤肉還沒有「哥」的玩家（沒去宿營、沒打那局牌的）：AA_884 第 1 節（企劃線 db44bb9ab，定稿 BB_422；CANON-NO-ECON-1112 第四批）——來源統一成學測數學滿級分 */
      {speaker:'zhe',text:'欸，你學測數學幾級？'},
      {choice:[{text:'「十五。」',goto:'ge_15'},{text:'「不告訴你。」',goto:'ge_same'}]},
      {label:'ge_15'},{speaker:'zhe',text:'……滿級分？'},{speaker:'zhe',text:'（把剛烤好的那串遞給你）哥，這串給你。'},{set:{ZHE_CALLS_GE:true}},{goto:'ge_after'},   /* AA-B 02:13：烤肉版不說「晚安」*/
      {label:'ge_same'},{speaker:'zhe',text:'好喔。'},
      {label:'ge_after'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('heroine_01',G)},speaker:null,text:'以安帶了一張「烤肉時間表」。'},
      /* YT-BBQ-WHY-1027（AA_486 第 2 節，企劃線 cd824bf41；使用者 10-27「為什麼中秋烤肉會有語彤是法律系還是?」）：原本一句「語彤帶了阿姨醃的肉。全場最好吃。」換三行，交代社會系的她怎麼會在這裡 */
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('heroine_03',G)},speaker:null,text:'語彤也來了，提著一盒秀琴姨醃的肉。前一個週末在茶屋，你跟她說過今天要烤肉。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('heroine_03',G)},speaker:'heroine_03',expression:'neutral',text:'秀琴姨叫我拿來的。她說人多的地方要有肉。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('heroine_03',G)},speaker:null,text:'秀琴姨醃的肉，全場最好吃。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('classmate_bohan',G)},speaker:null,text:'柏翰帶了考古題，被沒收了。'},{if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('classmate_bohan',G)},set:{BBQ_BOHAN_SEIZED:true}},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('npc_fangyt',G)},speaker:null,text:'隔壁房的方奕廷也來了，一直在講河邊的植物。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('heroine_03',G)},speaker:null,text:'秀琴姨醃的肉被搶光了。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('heroine_03',G)},speaker:'zhe',expression:'laugh',text:'可以叫秀琴姨開一個烤肉的菜單嗎？'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('heroine_03',G)},speaker:'heroine_03',expression:'neutral',text:'不行。她會真的開。'},
      {unless:{flags:['KX_BBQ_COME']},goto:'end'},
      {speaker:null,text:'可昕來了。'},
      {choice:[{text:'「這是可昕，我女朋友。」',set:{KX_INTRO:'gf'},goto:'i1'},{text:'「她會出題考你們。」',set:{KX_INTRO:'quiz'},goto:'i2'},{text:'「讓她說我們怎麼認識的。」',set:{KX_INTRO:'story'},goto:'i3'}]},
      {label:'i1'},{speaker:'zhe',expression:'smile',text:'哪間學校的？'},{speaker:'kexin',expression:'smile',text:'木柵大學的。考古題可以交換。'},{goto:'joke'},
      {label:'i2'},{speaker:'kexin',expression:'teasing',text:'刑總第一題。準備好了嗎？'},{speaker:'zhe',expression:'laugh',text:'我拒絕回答。'},{goto:'joke'},
      {label:'i3'},{speaker:'kexin',expression:'smile',text:'杜可昕。木柵大學法律。我們以前是經濟系的同學。……後來一起重考。'},
      {if:{flagIs:{ECON_PAST_SHARED:'full'}},goto:'known'},
      {speaker:'zhe',expression:'surprised',text:'等一下。經濟系？重考？'},{speaker:'player',text:'……嗯。念了一個多月。'},
      {set:{ECON_PAST_SHARED:'full'}},{goto:'joke'},
      {label:'known'},{speaker:'zhe',expression:'laugh',text:'喔——就是那一年。'},
      {label:'joke'},{speaker:null,text:'之後阿哲和她比冷笑話。'},
      {choice:[{text:'（阿哲贏）',set:{KX_JOKE:'zhe'},goto:'zw'},{text:'（可昕贏）',set:{KX_JOKE:'kexin'},goto:'kw'}]},
      {label:'zw'},{speaker:'kexin',expression:'smile',text:'好，我回去練。'},{goto:'end'},
      {label:'kw'},{speaker:'kexin',expression:'laugh',text:'我練過。不要問跟誰。'},   /* AA_305 第 9 節 */
      {label:'end'} ],
    consequences:{flags:{MIDAUTUMN_Y1:true},stamp:['bbqDay'],memo:'中秋烤肉（河濱）'},
    after:(G)=>{ if(G.flags.KX_BBQ_COME) G.flags.KX_MET_NOODLE_TEAM=true; if(typeof ROM!=='undefined'&&ROM.k3Tell) ROM.k3Tell(G); } },   /* KX_MET_NOODLE_TEAM 只給可昕那邊用；選①「這是可昕，我女朋友。」＝在場的人 knowsGF（BB_191 9-4 #2）*/
  /* 以安新 3 宿舍的規則（交付清單 A14；交接包_v1 第 3 節、AA_113 事件 3）：祐廷不在，轉述。桌遊團群組的訊息在 story3d.js 的 phoneRules（第 7 週週二晚上）；
     沒有加入桌遊團群組的玩家，改成沛珊當面說同樣的內容（第 7 週起找她說話；要認識她）。只記旗標 AN_DORM_RULES（聽說，不寫成玩家在場）*/
  { id:'ev_an_dorm_rules_peishan', title:'宿舍的規則', participants:['classmate_peishan'], location:'any', trigger:'interact', priority:3, term:['Y1S1'], once:true, background:'blur',
    prereq:{memory:[{npc:'classmate_peishan',tag:'FIRST_MET'}],custom:G=>{ if(G.flags.AN_DORM_RULES||typeof STORY==='undefined'||!STORY.termDay) return false; const g=G.phone&&G.phone.groups&&G.phone.groups.noodle_team; return !(g&&g.day<=STORY.termDay('Y1S1',7,2))&&G.day>=STORY.termDay('Y1S1',7,1); }},
    dialogue:[ {speaker:'classmate_peishan',expression:'thinking',text:'欸，你們宿舍規則有人全部讀完嗎？'},{speaker:'classmate_peishan',expression:'neutral',text:'我聽說以安讀完了，還寫了三頁意見。'},
      {speaker:'classmate_peishan',expression:'neutral',text:'大家笑她，她說：「規則是我們要住的，總要有人讀完。」'} ],
    consequences:{flags:{AN_DORM_RULES:'peishan'}} },
  /* G1 考完試走出教室（交付清單 A15：AA_13 G1）：大一上民總期末考考完（D118 沒有期中考，AA_578 第 2 節 #9：原本民總期中考），在教室門口接著演（classes3d.js 的 afterClassEvent：afterExam 'final'）；一定會發生。
     只有認識的人在場：柏翰沒見過＝第一句變成旁白（有人在問第二題）、他和芯慈的那段（和祐廷無關的一句）兩個人都認識才有；Alison、明軒、以安沒見過就跳過。
     第一個選項要第一天讀過案例（readCase 不是 none）。只改變誰跟你走；記憶 SHARED_CLASS（在場、認識的同學）。考題不出題庫，只說「第二題」*/
  { id:'ev_midterm_walkout', title:'考完試走出教室', participants:[], location:'any', trigger:'class', afterClass:'civ_general', afterExam:'final', term:['Y1S1'], once:true, background:'blur', /* D118 沒有期中考：AA_578 第 2 節 #9 改到同一門課的期末考（afterExam:'final'）*/
    dialogue:[ {speaker:null,text:'走廊上一群人。有人在翻課本，有人已經在滑手機。'},
      {if:EV_KNOWS('classmate_bohan'),speaker:'classmate_bohan',expression:'neutral',text:'第二題，你們是寫要約之引誘還是要約？'},
      {unless:EV_KNOWS('classmate_bohan'),speaker:null,text:'有人在問：第二題，是寫要約之引誘還是要約？'},
      {speaker:'zhe',expression:'surprised',text:'……有第二題？'},
      {if:EV_KNOWS('yu'),speaker:'yu',expression:'neutral',text:'我寫要約。我覺得是要約。（停）完了，我寫要約。'},
      {if:EV_KNOWS('classmate_xinci','classmate_bohan'),speaker:'classmate_xinci',expression:'neutral',text:'（小聲）我寫引誘，然後補了一段反對意見。'},
      {if:EV_KNOWS('classmate_xinci','classmate_bohan'),speaker:'classmate_bohan',expression:'neutral',text:'反對意見誰的？'},
      {if:EV_KNOWS('classmate_xinci','classmate_bohan'),speaker:'classmate_xinci',expression:'neutral',text:'我自己的。'},
      {if:EV_KNOWS('classmate_xinci','classmate_bohan'),speaker:'classmate_bohan',expression:'neutral',text:'……可以這樣寫嗎？'},
      {if:EV_KNOWS('classmate_mingxuan'),speaker:'classmate_mingxuan',expression:'neutral',text:'不要對了啦，去吃飯。'},
      {if:EV_KNOWS('heroine_01'),speaker:'heroine_01',expression:'neutral',text:'（從教室出來，把筆收進筆袋）對答案又不會加分。'},
      {choice:[{text:'「我寫引誘，第二天那個案子就是這個。」',unless:{flagIs:{readCase:['none',undefined]}},set:{G1_PICK:'case'},goto:'c1'},{text:'「我寫要約。」',set:{G1_PICK:'offer'},goto:'c2'},{text:'「去吃飯。」',set:{G1_PICK:'eat'},goto:'c3'}]},
      {label:'c1'},{if:EV_KNOWS('classmate_bohan'),speaker:'classmate_bohan',expression:'surprised',text:'你也讀了判決？'},{goto:'end'},
      {label:'c2'},{if:EV_KNOWS('yu'),speaker:'yu',expression:'laugh',text:'同一國的！'},{goto:'end'},
      {label:'c3'},{if:EV_KNOWS('classmate_mingxuan'),speaker:'阿哲、明軒',text:'走！'},{unless:EV_KNOWS('classmate_mingxuan'),speaker:'zhe',expression:'laugh',text:'走！'},
      {label:'end'},
      /* 考完的宵夜（A15，AA 2026-10-14）：沒有桌遊團群組的玩家，阿哲當面問；有群組的在群組揪（story3d.js 的 phoneRules）*/
      {unless:{custom:G=>(typeof PHONE!=='undefined'&&PHONE.inGroup(G,'noodle_team'))||(typeof STORY!=='undefined'&&!!STORY.supperLate&&STORY.supperLate(G,'Y1S1','civ_general'))},speaker:'zhe',expression:'smile',text:'晚上日常失速，來不來？'},
      {if:{custom:G=>!(typeof PHONE!=='undefined'&&PHONE.inGroup(G,'noodle_team'))&&typeof STORY!=='undefined'&&!!STORY.supperLate&&STORY.supperLate(G,'Y1S1','civ_general')},speaker:'zhe',expression:'smile',text:'明天晚上日常失速，來不來？'},   /* AA_581 第 70 列：民總期末考是大一上最後一科、宵夜順延到隔天（story3d.js S.supperDay）*/
      {unless:{custom:G=>typeof PHONE!=='undefined'&&PHONE.inGroup(G,'noodle_team')},choice:[{text:'「去。」',set:{SUPPER_MID1:'yes'}},{text:'「這次不行。」',set:{SUPPER_MID1:'no'}}]} ],
    after:G=>{ if(typeof SOCIAL==='undefined'||typeof STORY==='undefined') return; for(const id of ['zhe','classmate_bohan','yu','classmate_xinci','classmate_mingxuan','heroine_01']) if(STORY.knows(id,G)) SOCIAL.remember(id,'SHARED_CLASS','民總期末考'); } },   /* AA_578 #9：「期中」→「期末」*/
  /* 翰 1 你考幾分（交付清單 A16：AA_40 翰 1，接 ev_bohan_kaogu；AA 2026-10-14）：大一上期中放榜——第 10 週的民總下課（第 10 週沒去上課的話第 11 週那堂），霖澤館走廊。
     遊戲不顯示分數（AA_104 第 10 節）：「（告訴他分數）」只有旁白「你說了分數。」，比他高／低照民總的準備程度（很好＝比他高，不錯以下＝比他低：CLS.gradeOf）。
     記憶 TOLD_SCORE（跟他講第三題怎麼寫）、ASKED_BACK（翰 4 多一句）；BOHAN_SCORE：told／unsure／asked（AA_546 1-2；舊存檔的 higher／lower／no 照舊有值）。
     沒見過他：先用 ev_bohan_kaogu 的自我介紹那句 */
  { id:'ev_bohan_score', title:'第三題',   /* AA_546 1-2（NO-COMPARE-1030，D116 不跟別人比）：問寫法、不問分數 */ participants:['classmate_bohan'], location:'classroom', trigger:'class', afterClass:'civ_general', term:['Y1S1'], weeks:[10,11], carryTo:15, once:true, background:'blur',   /* AA_294 ②：第 10～11 週沒去民總，延到下一次出席（到第 15 週）*/
    dialogue:[ {unless:{memory:[{npc:'classmate_bohan',tag:'FIRST_MET'}]},speaker:'classmate_bohan',expression:'serious',text:'許柏翰。第一排那個。'},
      {speaker:'classmate_bohan',expression:'serious',text:'民總那份案例作業，第三題你怎麼寫？'},
      {speaker:'classmate_bohan',expression:'neutral',text:'我問了十四個人。你是第十五個。'},
      {choice:[{text:'（講你怎麼寫的）',set:{BOHAN_SCORE:'told'},goto:'tell'},{text:'「我也不確定。」',set:{BOHAN_SCORE:'unsure'},goto:'unsure'},{text:'「你錯哪裡？」',set:{BOHAN_SCORE:'asked'},consequences:{mem:[{npc:'classmate_bohan',tag:'ASKED_BACK',note:'案例作業發回來'}]},goto:'back'}]},
      {label:'tell'},{speaker:null,text:'你講了你的寫法。'},{speaker:'classmate_bohan',expression:'neutral',text:'……你先從事實看的。好。'},{speaker:null,text:'他寫進手機的備忘錄。'},
      {mem:[{npc:'classmate_bohan',tag:'TOLD_SCORE',note:'案例作業發回來，跟他講第三題你怎麼寫'}]},{goto:'end'},
      {label:'unsure'},{speaker:'classmate_bohan',expression:'neutral',text:'好。不確定也算一種寫法。'},{speaker:null,text:'他也寫進去。'},{goto:'end'},
      {label:'back'},{speaker:null,text:'他停了一下。'},{speaker:'classmate_bohan',expression:'neutral',text:'……第三題。整題。'},{speaker:null,text:'第一次有人反問他。'},
      {label:'end'},{unless:{custom:G=>typeof INV!=='undefined'&&INV.hasContact(G,'classmate_bohan')},speaker:'classmate_bohan',expression:'neutral',text:'考古題我晚上傳給你。',consequences:{contact:'classmate_bohan'}} ] },   /* 聯絡方式的劇情時刻（AA_124 1-7、AA_70 2-5：期中放榜那天）。AA_372 第 16 項：8/29 起同寢，原本「你的聯絡方式。考古題要傳給你。」*/
  /* 考完的宵夜（交付清單 A15：AA_71 2-4、BB_95 3-6，AA 2026-10-14）：民總期中考那天晚上 20:30 公館滷味攤。公館有 3D 區域，滷味攤還沒有：先用出遊（轉場＋深色底，
     背景 gongguan_luwei 在 MISSING_EXTERNAL_ART）。誰揪：有桌遊團群組＝阿哲在群組「考完了。滷味。」；沒有＝G1 結束時當面問。去不去由玩家選，不去不扣分。
     只有認識的人在場：明軒認識才有阿哲那句（考完當晚還沒有成績：「成績出來一定比我高」）；有 SAW_HIM_STUDY 多一個選項「……他有念啦。」→ 明軒瞪你一眼、請你一顆滷蛋；
     柏翰、芯慈、Alison 三個人都認識才有吵第三題那段。AA 的「小事」是條列，旁白照條列的字寫成句子 */
  /* AA_623 第 3 節（使用者 11-03 桌遊團）：A15 改成 AA_618 第 2-4 節第 1 點那一場——日常失速、阿哲在群組揪（「考完了！日常失速，八人桌我先佔。」，story3d.js phoneRules）；
     原本句子裡的「明軒從來不念書」（阿哲那句＋SAW_HIM_STUDY 的選項）照留。日常失速還沒有 3D：2D 背景先用現有的桌遊店 boardgame_gg（BB 跟使用者要日常失速的圖）。
     原本 20:30 公館滷味攤的四句、柏翰和芯慈吵第三題那段（AA_71 2-4）拿掉 */
  { id:'ev_midterm_supper', title:'考完的聚餐', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:3,
    dialogue:[ {scene:'溫州街・日常失速・長桌',bg:'boardgame_gg'},
      {speaker:null,text:'（長桌坐了七個人。）'},
      {speaker:'zhe',expression:'laugh',text:'我民總最後一題寫了一整面。……寫什麼我已經忘了。'},
      {if:EV_KNOWS('classmate_bohan'),speaker:'classmate_bohan',text:'我寫完那題就沒時間了。'},
      {if:EV_KNOWS('classmate_bohan'),speaker:'zhe',text:'那你還好，你至少寫完了。'},
      {if:EV_KNOWS('classmate_mingxuan'),speaker:'zhe',expression:'laugh',text:'明軒說他沒念。……我不信，他筆記比我多。'},
      {if:{memory:[{npc:'classmate_mingxuan',tag:'SAW_HIM_STUDY'}],custom:G=>typeof STORY!=='undefined'&&STORY.knows('classmate_mingxuan',G)},choice:[{text:'「……他有念啦。」',set:{SUPPER_MX_EGG:true},goto:'egg'},{text:'（繼續聽）',goto:'ps'}]},
      {goto:'ps'},
      {label:'egg'},{speaker:null,text:'明軒瞪了你一眼。'},{speaker:null,text:'然後請你一顆滷蛋。'},
      {label:'ps'},
      {if:EV_KNOWS('classmate_peishan'),speaker:'classmate_peishan',text:'我們不要對答案好不好。'},
      {if:EV_KNOWS('classmate_peishan'),speaker:'大家',text:'好。'},
      {if:EV_KNOWS('classmate_peishan'),speaker:null,text:'（安靜三秒）'},
      {if:EV_KNOWS('classmate_peishan'),speaker:'zhe',text:'第二題是不是選 C？'},
      {speaker:null,text:'（十一點，店員來收第三輪的杯子。店長從頭到尾都在旁邊那張椅子上睡覺。）'} ],
    consequences:{stamp:['supperMid1Day'],memo:'考完的聚餐（日常失速）'} },
  /* 期中考完（大一下，交接包 v2 C11、C21 第二個畫面；AA 2026-10-14 64ceb70）：刑總二期中考那天（第 8 週週三 4/15，上午考完）。
     D118 沒有期中考：AA_578 第 2 節 #9、#11 改到刑總二期末考那天（afterExam:'final'；晚上的麵店照舊）。
     G1 大一下版：旁白沿用大一上，加阿哲那句，沒有選項；沒有桌遊團群組的玩家，最後阿哲當面問晚上的麵店（「去。」才排）。
     晚上 19:00 阿鳳麵店長桌（考完的晚餐；大一上是公館滷味，這次換地方）：出遊（到時候問要不要去，不去不扣分）；麵店有 3D 區域，長桌這一幕先用 2D 底＋字幕
     （背景 noodle_table 在 MISSING_EXTERNAL_ART）。開頭不重複大一上（Alison、阿哲：認識 Alison 才有）；明軒的回聲（有 SAW_HIM_STUDY、認識明軒）——
     「（繼續吃麵）」是 LAWWW 照大一上「（繼續吃滷味）」加的選項字；接著沛珊和柏翰（BB_100 2-3：認識沛珊才有；旁白的「她」寫成「沛珊」）。
     AA_588 第 1 節：沛珊和柏翰公開那一段（和沒去的滷蛋照片）搬回 4/15 傍晚麵店（ev_psbh_public_0415），這一頓不演 */
  { id:'ev_midterm_walkout_y1s2', title:'考完試走出教室', participants:[], location:'any', trigger:'class', afterClass:'crim_gen2', afterExam:'final', term:['Y1S2'], once:true, background:'blur', /* D118 沒有期中考：AA_578 第 2 節 #9 改到同一門課的期末考（afterExam:'final'）*/
    dialogue:[ {speaker:null,text:'走廊上一群人。有人在翻課本，有人已經在滑手機。'},
      {speaker:'zhe',expression:'laugh',text:'刑總二比上學期難好多，第三題我整題亂寫。'},   /* AA_209 附錄A §2 */
      {unless:{custom:G=>(typeof PHONE!=='undefined'&&PHONE.inGroup(G,'noodle_team'))||(typeof STORY!=='undefined'&&!!STORY.supperLate&&STORY.supperLate(G,'Y1S2','crim_gen2'))},speaker:'zhe',expression:'smile',text:'晚上燒臘店，七點，來不來？'},
      {if:{custom:G=>!(typeof PHONE!=='undefined'&&PHONE.inGroup(G,'noodle_team'))&&typeof STORY!=='undefined'&&!!STORY.supperLate&&STORY.supperLate(G,'Y1S2','crim_gen2')},speaker:'zhe',expression:'smile',text:'明天晚上燒臘店，七點，來不來？'},   /* AA_581 第 71 列：刑總二期末考是大一下最後一科、晚餐順延到隔天 */
      {unless:{custom:G=>typeof PHONE!=='undefined'&&PHONE.inGroup(G,'noodle_team')},choice:[{text:'「去。」',set:{SUPPER_MID2:'yes'}},{text:'「這次不行。」',set:{SUPPER_MID2:'no'}}]} ],
    after:G=>{ if(typeof SOCIAL==='undefined'||typeof STORY==='undefined') return; for(const id of ['zhe','classmate_bohan','yu','classmate_xinci','classmate_mingxuan','heroine_01']) if(STORY.knows(id,G)) SOCIAL.remember(id,'SHARED_CLASS','刑總二期末考'); } },   /* AA_578 #9：「期中」→「期末」*/
  { id:'ev_midterm_supper_y1s2', title:'考完的晚餐', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:1.5,
    dialogue:[ {scene:'公館燒臘・長桌',bg:'noodle_table'},
      /* AA_679 第 1 列（企劃線 ee055afbe，AA-C 定 D109）：「（阿姨的手好了，今天端麵的還是語彤。）」「（今天端麵的是一個沒見過的女生。）」兩句拿掉——她不在燒臘店端麵；接的「阿姨扭到手」事件已經退場 */
      {if:EV_KNOWS('yu'),speaker:'yu',expression:'neutral',text:'今天不講考試。誰講誰請。'},
      {if:EV_KNOWS('yu'),speaker:'zhe',expression:'smile',text:'那第二題——'},
      {if:EV_KNOWS('yu'),speaker:'yu',expression:'laugh',text:'你請。'},
      {if:EV_KNOWS('yu'),speaker:'zhe',expression:'surprised',text:'我還沒講完！'},
      {if:{memory:[{npc:'classmate_mingxuan',tag:'SAW_HIM_STUDY'}],custom:G=>typeof STORY!=='undefined'&&STORY.knows('classmate_mingxuan',G)},goto:'mx'},{goto:'ps'},
      {label:'mx'},{speaker:'zhe',expression:'neutral',text:'明軒說他這次也沒念。'},
      {choice:[{text:'「……他有念。我看到了。」',set:{SUPPER2_MX:true},goto:'mx2'},{text:'（繼續吃飯）',goto:'ps'}]},
      {label:'mx2'},{speaker:null,text:'（他低頭扒了一口飯）'},{speaker:'classmate_mingxuan',expression:'laugh',text:'……好啦，這次我請。'},   /* AA_209 附錄B §2 */
      {label:'ps'},
      {if:{flags:['DORM_FOUR'],notFlags:['dating_classmate_peishan']},speaker:null,text:'（你想起柏翰這幾週都比較晚回 203。）'},   /* AA_209 第 4 節第 4 點（附錄 B 4-4 採用）：玩家住 203（四人房）才播 */
      /* 沛珊和柏翰公開（滷蛋、「上禮拜的事。」）：AA_588 第 1 節搬回 4/15 傍晚麵店（ev_psbh_public_0415），這一頓拿掉 */
      /* AA_409 第 1 節（企劃線 86016b84；使用者 10-23 選擇題：沛珊大一上期末可以交往）：和祐廷交往中＝滷蛋夾一半給你；桌遊團已經知道（ROM）＝一行旁白。接著柏翰算麵錢三句（AA_245 第 1 節；c42a0dd3 更正：兩個並存）*/
      {if:{custom:G=>PS_DT(G)&&!PS_TOLD(G)},speaker:null,text:'（沛珊坐在你旁邊。她把碗裡的滷蛋夾了一半，放到你碗裡。）'},{if:{custom:G=>PS_DT(G)&&!PS_TOLD(G)},speaker:'zhe',expression:'surprised',text:'……喔。'},{if:{custom:G=>PS_DT(G)&&!PS_TOLD(G)},speaker:null,text:'全桌安靜三秒。'},
      {if:{custom:G=>PS_DT(G)&&!PS_TOLD(G)},speaker:'classmate_peishan',expression:'neutral',text:'對。你們吃你們的。'},{if:{custom:G=>PS_DT(G)&&!PS_TOLD(G)},speaker:null,text:'（Alison 在桌子底下踢了阿哲一腳。）'},
      {if:{custom:G=>PS_DT(G)&&PS_TOLD(G)},speaker:null,text:'（沛珊把碗裡的滷蛋夾了一半，放到你碗裡。沒有人說話。）'},
      {if:{custom:PS_DT_BH},speaker:null,text:'（柏翰把每個人的飯錢算好，寫在餐巾紙上。）'},{if:{custom:PS_DT_BH},speaker:'classmate_bohan',expression:'neutral',text:'一個人一百一十五。阿哲你多一顆蛋，一百二十五。'},{if:{custom:PS_DT_BH},speaker:'zhe',expression:'neutral',text:'……你連這個都算。'},
      {call:async(G,GM)=>{ if(typeof MREL!=='undefined'&&MREL.ycSupper) await MREL.ycSupper(GM); }} ],   /* 沛珊和宥辰的第一次互動（AA_228 3-4 ①，台詞在 multirel_lines.js 的 YC.n1）*/   /* AA_409 第 1 節更正（企劃線 c42a0dd3）：滷蛋那幾行（或公開的那一行）之後接 AA_245 第 1 節柏翰算麵錢三句，兩個並存 */
    after:(G)=>{ if(!PS_DT(G)||typeof ROM==='undefined'||!ROM.learn) return; for(const x of ['zhe','yu','classmate_bohan','classmate_mingxuan']) if(typeof STORY==='undefined'||!STORY.knows||STORY.knows(x,G)) ROM.learn(G,x,'classmate_peishan','present'); },   /* 這一桌的人都知道了 */   /* AA_209 附錄A §2（2-1 第 5 節第 1 點：沛珊前一句接得上，不改）*/
    consequences:{stamp:['supperMid2Day'],memo:'考完的晚餐（公館燒臘長桌）'} },   /* 沒去的滷蛋照片（outingMissed）跟著公開那一段搬到 ev_psbh_public_0415（AA_588 第 1 節）*/
  /* 沛珊和柏翰公開（AA_588 第 1 節，AA 採用 LAWWW 的提案；AA_581 第 11 節第 2 點：留在原來的 4/15 一般麵店晚餐，兩人的關係時間線不變——沛珊的 partner 從 2026-04-06 起，柏翰「上禮拜的事。」）：
     大一下第 8 週週三 4/15 傍晚，在麵店（進店、或已經在店裡）只演 PS_BH 那幾行。4/15 不是固定的麵店日：17:00 桌遊團群組柏翰「今天晚上麵店，有空的來。」、沛珊「我會到。」（story3d.js phoneRules）。
     沒在場、在桌遊團群組、認識沛珊、沒和她交往＝20:30 阿哲的滷蛋照片（missedPhoto，原本考完的晚餐的 outingMissed；tag 照舊 zhe_supper_mid2_egg，舊存檔收過的不重收），記「聽說」（HEARD_ABOUT）。沒去不扣任何東西。
     時間到 20:30 為止（20:30 照片就傳了）*/
  { id:'ev_psbh_public_0415', title:'上禮拜的事', participants:[], location:'noodle', trigger:'auto', term:['Y1S2'], weeks:[8], weekday:[3], time:[17,20.5], once:true, background:'dark', prereq:PS_BH,
    dialogue:[ {scene:'公館燒臘・長桌',bg:'noodle_table'},   /* UX-PSBH-BG（BB 16:49，CC_27）：模糊 3D 看不出在麵店、誰在講話（沛珊、柏翰沒有立繪）＝用麵店的 2D 背景，同 ev_midterm_supper_y1s2 */
      {speaker:null,text:'柏翰幫沛珊把滷蛋切成兩半。'},   /* PS_BH：認識沛珊、沒有和她交往（AA_374 第 11 項：柏翰×沛珊那一段只在玩家沒有和沛珊交往時發生）*/
      {speaker:'zhe',expression:'surprised',text:'……喔。'},
      {speaker:null,text:'全桌安靜三秒。'},
      {speaker:'classmate_peishan',expression:'neutral',text:'對，我們在一起了。你們吃你們的。'},
      {speaker:'classmate_bohan',expression:'neutral',text:'上禮拜的事。'},
      {speaker:null,text:'（他把另一半滷蛋推回她碗裡。）'} ],
    consequences:{memo:'沛珊和柏翰在公館燒臘說了（4/15）'},
    missedPhoto:(G,day)=>{ if(typeof PHONE==='undefined'||!PHONE.inGroup(G,'noodle_team')||!PS_BH.custom(G)) return false;   /* 和沛珊交往中：沒有柏翰那一段（AA_374 第 11 項）*/
      const ok=PHONE.at(G,day,20.5,[{th:'g:noodle_team',from:'zhe',text:'📷（一顆切成兩半的滷蛋）'},{th:'g:noodle_team',from:'zhe',text:'柏翰幫沛珊切的'},{th:'g:noodle_team',from:'zhe',text:'……他們在一起了'}],'zhe_supper_mid2_egg');   /* AA_373 #16：照交接包 v2（2026-10-16 改）——阿哲傳滷蛋照片，配「柏翰幫沛珊切的」「……他們在一起了」（原本只有「……喔。」看不出發生什麼事）*/
      if(ok&&typeof SOCIAL!=='undefined') SOCIAL.remember('classmate_peishan','HEARD_ABOUT','和柏翰在一起了（聽說）'); return ok; } },
  /* 語彤（AA 的角色；AA 2026-10-13 同意）：週一、五 17:20 社會系下課（週三 17:40 她在 118 巷，AA_320），社科院門口（社會系館旁）。一次。
     AA_886 第 2 節（CANON-NO-ECON-1112 第四批）：祐廷來借書，不分支（原本照祐廷說過多少分三支、記 YT_KNOWS_ECON，拿掉）*/
  { id:'ev_b106d2_yutong', title:'', participants:['heroine_03'], location:'campus', trigger:'auto', npcNear:'heroine_03', nearDist:3, term:['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2'], weekday:[1,5], time:[17+20/60,17+50/60], once:true, background:'blur',
    prereq:{custom:G=>typeof STORY!=='undefined'&&!!STORY.b106d2Due&&STORY.b106d2Due(G,'heroine_03')&&typeof SOCIAL!=='undefined'&&SOCIAL.has('heroine_03','FIRST_MET')},
    dialogue:[ {speaker:'heroine_03',text:'你怎麼在我們這一區？'},
      {speaker:'player',text:'我來借書。'},{speaker:'heroine_03',text:'法律系的來這裡借書？'},{speaker:'player',text:'總圖人太多。'},{speaker:'heroine_03',text:'……這裡也不少。坐那邊，那排插座是好的。'},
      {label:'end'} ],
    after:G=>STORY.b106d2Done(G,'heroine_03',null) },
  /* ===== BB_105 大一女舍門口（企劃線 BB_105@68a8479e，AA-C 2026-10-18 審過＝可以實作；白名單 LAWWW-C 10-21 已登記；V1-B105-D2）：D4、D4b（這裡）；D7 宿舍的人們、D9 法服的攤位在 src/crowd3d.js。
     祐廷不進女舍，場景只有門口（5-1）；晚上不排長戲 ===== */
  /* D4 一年後，再走到女舍門口（AA_289 5-4：讀書會第 10 週才開，改成沛珊把借的課堂筆記還給祐廷）：大一上第 4～8 週，12:00～21:00 走到大一女舍門口（長椅一帶）。
     要有沛珊的聯絡方式（第一句是她的私訊）、她在臺北（單數週末回台中）。旁白「一年前，你常在這裡等人。」只出現這一次（所有玩家都有：經濟系那年他和可昕交往、她住這裡，是劇情事實）。
     稿沒有寫怎麼約的（借筆記也沒有另外一場）：走到門口就演，當作已經說好（給 AA 的問題）。一次 */
  { id:'ev_b105_d4_notes', title:'一年後，再走到女舍門口', participants:['classmate_peishan'], portraitLater:true, location:'campus', trigger:'auto', near:{x:-93,z:56,r:5}, term:['Y1S1'], weeks:[4,5,6,7,8], time:[12,21], once:true, tier:'short', building:'fdorm', background:'blur',
    prereq:{custom:G=>typeof INV!=='undefined'&&INV.hasContact&&INV.hasContact(G,'classmate_peishan')&&typeof STORY!=='undefined'&&!!STORY.freeNow&&STORY.freeNow('classmate_peishan',G)},   /* 她照作息沒有別的事（上課、總圖、118 巷的時候不演）*/
    dialogue:[ {phone:'classmate_peishan',text:'我下樓了！你等我一下下'},
      {speaker:null,text:'一年前，你常在這裡等人。'},
      {speaker:'classmate_peishan',text:'（下樓）對不起！你的筆記我找了一下……'},
      {speaker:'classmate_peishan',text:'在我手上。我自己拿著還在找。'},
      {speaker:'classmate_peishan',text:'謝謝你借我！第三章我抄完了。'} ],
    consequences:{memo:'大一女舍門口：沛珊還了借的筆記'} },
  /* D4b 以安準時下樓（背／短，大一上～大一下，可重複）：桌遊團在大一女舍門口集合（STORY.fdormGather：週二麵店日 19:00；同一個集合 BB_106 日常 D1）——她一定是第一個下來的人。
     19:00～19:15 人在長椅旁：「七點。你們遲到兩分鐘。」。隔兩週才再一次（cooldown 14 天）*/
  { id:'ev_b105_d4b_on_time', title:'', participants:['heroine_01'], location:'campus', trigger:'auto', near:{x:-93,z:54.26,r:4}, term:['Y1S1','Y1S2'], weekday:[2], time:[19,19.25], cooldown_days:14, background:'blur',
    prereq:{custom:G=>typeof STORY!=='undefined'&&!!STORY.fdormGather&&STORY.fdormGather(G)},
    dialogue:[ {speaker:'heroine_01',text:'七點。你們遲到兩分鐘。'} ] },
  /* 可玩切片（交接包 v2 C13；AA_115 第 1、2 節、BB_105 4-5）——B4 博雅午後講座「政府可以為了大家，限制一個人嗎？」：第 11 週週四 19:00～20:30 博雅 101（activities.js 的 B4）。
     以安揪人（週二在桌遊團群組，story3d.js phoneRules）；以安、Alison、阿哲照作息在 101（characters.js），散場後以安、Alison 去博雅的圓桌。
     去不去看玩家週四有沒有走進博雅 101：坐下選「聽演講」＝這一段（之後快轉到 20:30）；坐著待到結束也算聽完（沒有這一段）；結束前走出 101＝中途離開（沒有這一段，之後以安說一句）。
     講者虛構、只講比例原則的方向，不給結論（BB_105 4-3）——BB-B 審過（BB_115 L482，BB_161 第 3 節）。（時間往前跳。）＝開場三句之後時鐘往前 45 分鐘（晚到的不跳）*/
  { id:'ev_b4_lecture', title:'政府可以為了大家，限制一個人嗎？', participants:[], location:'boya', trigger:'activity', once:true, background:'blur', 
    dialogue:[ {speaker:null,text:'講者是一位頭髮花白的老師，說話很慢。'},
      {speaker:'講者',text:'政府要限制一個人，要有理由，而且要用最小的手段。'},
      {speaker:'講者',text:'可是「最小」，是誰來量的？'},
      {if:{custom:G=>(G.hour%24)<19.5},advance:0.75},
      {speaker:'講者',text:'最後一個問題，我留給你們。'},
      {speaker:'講者',text:'被限制的那個人，最後可以去哪裡？'},
      {if:EV_KNOWS('heroine_01'),speaker:null,text:'掌聲。以安把最後那一句抄了兩次。'},{unless:EV_KNOWS('heroine_01'),speaker:null,text:'掌聲。'} ],
    consequences:{memo:'博思 101 聽演講：「政府可以為了大家，限制一個人嗎？」'} },
  /* B4 散場（20:30 起 20 分鐘內，activityPhase justEnded）：聽完的玩家（attended:B4，中途離開的不算）、認識以安——以安「要不要去小桌子整理一下？」
     「好。」＝記 B5_GO（今天）：以安、Alison 照作息在博雅的圓桌（characters.js），玩家走過去才開始 B5（ev_b5_table）；
     「我約了人，先走。」＝以安「好。」Alison「明天群組見。」，記 LEFT_AFTER_B4（AA_115 的 left_after:B4；第 12 週以安好奇地問，不懲罰）*/
  { id:'ev_b4_after', title:'散場', participants:['heroine_01'], location:'boya', trigger:'auto', activity:'B4', activityPhase:'justEnded', once:true, background:'blur',
    prereq:{attended:['B4'],memory:[{npc:'heroine_01',tag:'FIRST_MET'}],custom:G=>!(typeof ROM!=='undefined'&&ROM.exOf&&ROM.exOf(G,'heroine_01'))},   /* AA_600 A23：她先開口的這一場，前任不演 */
    dialogue:[ {speaker:'heroine_01',expression:'neutral',text:'要不要去小桌子整理一下？'},
      {choice:[{text:'「好。」',set:{B5_GO:true},goto:'go'},{text:'「我約了人，先走。」',set:{LEFT_AFTER_B4:true},goto:'leave'}]},
      {label:'go'},{goto:'end'},
      {label:'leave'},{speaker:'heroine_01',expression:'neutral',text:'好。'},{if:EV_KNOWS('yu'),speaker:'yu',expression:'smile',text:'明天群組見。'},
      {label:'end'} ],
    after:G=>{ if(G.flags.B5_GO===true) G.flags.B5_GO=G.day; } },
  /* B5 小桌子（BB_105 4-5）：散場說「好。」的玩家，當晚走到博雅圓桌的以安旁邊（npcNear）才開始。先演 4-4「B4 演講之後」的四句，再寫便利貼（三選一，沒有對錯）。
     Alison：認識才在場（只有認識的人在場）；不認識 Alison＝她那兩句不演、便利貼是兩張（LAWWW 改的字，已告訴 BB）。
     記 B5_THOUGHT（ask_them／trade／where；B12 讀它）、B4_DISCUSSED（AA_115 的 discussed:B4）；以安的熟悉度＝參與事件的一般見面（不另加數字）。法律同 B4：BB-B 審過（BB_115 L482，BB_161 第 3 節）*/
  { id:'ev_b5_table', title:'小桌子', participants:['heroine_01'], location:'boya', trigger:'auto', npcNear:'heroine_01', time:[20.5,21.5], once:true, background:'blur', 
    prereq:{custom:G=>{ if(G.flags.B5_GO!==G.day) return false; const n=typeof EVENTS!=='undefined'&&EVENTS.npcOf?EVENTS.npcOf('heroine_01'):null;   /* 她坐到圓桌才開始（小桌子）：散場時坐在她旁邊的話，不在 101 就先演；走不到圓桌（roomFail）就在原地（2026-10-14 story3d.js roomMove）*/
      return !n||(!n.roomGo&&(!!(n.seat&&n.seat.room==='round')||!!n.roomFail)); }},
    dialogue:[ {speaker:'heroine_01',expression:'neutral',text:'他說，限制自由要用最小的手段。'},
      {speaker:'heroine_01',expression:'thinking',text:'可是「最小」，是對誰來說最小？'},
      {if:EV_KNOWS('yu'),speaker:'yu',expression:'neutral',text:'對整個社會吧？'},
      {speaker:'heroine_01',expression:'neutral',text:'對那個被限制的人呢？'},
      {speaker:'heroine_01',expression:'neutral',text:'（把便利貼推過來）你呢？寫一句。不用對。'},
      {choice:[{text:'「最小，要問被限制的人。」',set:{B5_THOUGHT:'ask_them'},goto:'t1'},{text:'「最小，要看大家換到了什麼。」',set:{B5_THOUGHT:'trade'},goto:'t2'},{text:'「我還不知道。我想知道他最後去了哪裡。」',set:{B5_THOUGHT:'where'},goto:'t3'}]},
      {label:'t1'},{speaker:'heroine_01',expression:'thinking',text:'那他說『全部都太多』呢？'},{if:EV_KNOWS('yu'),speaker:'yu',expression:'neutral',text:'那就……再問一次？'},{goto:'end'},
      {label:'t2'},{speaker:'heroine_01',expression:'neutral',text:'好。那換到的東西，要誰來證明？'},{goto:'end'},
      {label:'t3'},{speaker:'heroine_01',expression:'neutral',text:'那就是講者最後那一題。'},
      {label:'end'},
      {if:EV_KNOWS('yu'),speaker:null,text:'她把三張便利貼並排貼在筆記本上：她的、Alison 的、你的。'},{unless:EV_KNOWS('yu'),speaker:null,text:'她把兩張便利貼並排貼在筆記本上：她的、你的。'},
      {speaker:'heroine_01',expression:'smile',text:'九點半了。我回宿舍讀刑總。'} ],
    consequences:{flags:{B4_DISCUSSED:true},mem:[{npc:'heroine_01',tag:'B5_STICKY',note:'演講完在博思的小桌子，三個人各寫一張便利貼'}],memo:'博思的小桌子：演講之後寫了一張便利貼'} },
  /* B4 中途離開（AA_115 第 2 節：attendedAny 但不是 attended）：之後第一次找以安說話（演講後兩週內）——「你後半場不在。最精彩的你錯過了。」*/
  { id:'ev_b4_partial_an', title:'後半場', participants:['heroine_01'], location:'any', trigger:'interact', priority:9, once:true, term:['Y1S2'], background:'blur',
    prereq:{custom:G=>typeof ACTIVITIES!=='undefined'&&ACTIVITIES.attendedAny(G,'B4')&&!ACTIVITIES.attended(G,'B4')&&(()=>{ const d=ACTIVITIES.lastEnded(G,'B4'); return d!=null&&G.day-d<=14; })()},
    dialogue:[ {speaker:'heroine_01',expression:'neutral',text:'你後半場不在。最精彩的你錯過了。'} ] },
  /* B4 散場先走的玩家（AA_115 第 2 節 ②b：left_after:B4）：第 12 週週一憲法（下）下課，以安「你那天聽完就走了。你怎麼想？」——她是好奇，不是怪他；不懲罰（原文沒有玩家的回答，只有這一句；AA_209 附錄A §2 加兩個選項）*/
  { id:'ev_b4_left_an', title:'那天的演講', participants:['heroine_01'], location:'any', trigger:'class', afterClass:'const_2', term:['Y1S2'], weeks:[12], once:true, background:'blur',
    prereq:{flags:['LEFT_AFTER_B4'],memory:[{npc:'heroine_01',tag:'FIRST_MET'}]},
    dialogue:[ {speaker:'heroine_01',expression:'thinking',text:'你那天聽完就走了。你怎麼想？'},
      {choice:[{text:'「最後那題有點難。」',goto:'hard'},{text:'「那天有事先走了。」',goto:'busy'}]},   /* AA_209 附錄A §2（第 6 節第 4 點：加兩個選項）*/
      {label:'hard'},{speaker:'heroine_01',expression:'neutral',text:'對吧，我們在小桌子那邊講到九點半。'},{goto:'end'},
      {label:'busy'},{speaker:'heroine_01',expression:'neutral',text:'講者最後那題我有抄。明天拿給你。'},
      {label:'end'} ] },
  /* 可玩切片的選擇③（AA_115 第 1、2 節；BB_96 3-7）——沛珊的那張表：有沛珊聯絡方式的玩家，週二中午她私訊「刑總二未遂那一章，我做了一張表……週四演講完，來女舍門口拿？」（story3d.js phoneRules）；
     週四 20:40 她傳「對不起。課輔班的作業還沒改完……今天下不去了。」（所有人都收到）。玩家這時候在大一女舍門口的長椅附近＝這一段：手機上她的兩句（只顯示，手機裡已經有），三選一。
     玩家和她的回覆在演完以後照順序寫進手機（after）。「那我等妳十分鐘。」＝十分鐘後她真的下來（她的台詞照 BB）。朋友之間的一張筆記表，沒有「我請你」。記 PS_CANCEL（ok／waited／later）、拿到表＝PS_TABLE_GOT */
  { id:'ev_peishan_table_bench', title:'女舍門口', participants:[], location:'campus', trigger:'auto', near:{x:-93,z:54.26,r:3}, term:['Y1S2'], weeks:[11], weekday:[4], time:[20+40/60,21.5], once:true, background:'blur',
    prereq:{custom:G=>typeof INV!=='undefined'&&!!INV.hasContact&&INV.hasContact(G,'classmate_peishan')},
    dialogue:[ {speaker:'沛珊（手機）',text:'對不起。課輔班的作業還沒改完，明天要發回去。'},{speaker:'沛珊（手機）',text:'今天下不去了。'},
      {choice:[{text:'「沒關係。」',set:{PS_CANCEL:'ok'},goto:'ok'},{text:'「那我等妳十分鐘。」',set:{PS_CANCEL:'waited'},goto:'wait'},{text:'「改天再給我。」',set:{PS_CANCEL:'later'},goto:'later'}]},
      {label:'ok'},{speaker:'沛珊（手機）',text:'好。週一前一定給你。'},{goto:'end'},
      {label:'wait'},{advance:1/6},{speaker:null,text:'十分鐘後她真的下來了，外套沒拉好，手上拿著紅筆。'},
      {speaker:'classmate_peishan',expression:'surprised',text:'你真的在等。'},{speaker:'classmate_peishan',expression:'neutral',text:'表給你。第二頁我還沒畫完，先不要翻。'},
      {speaker:'classmate_peishan',expression:'neutral',text:'我上去了，還有十二本在等我。'},{set:{PS_TABLE_GOT:true}},{goto:'end'},
      {label:'later'},{speaker:'沛珊（手機）',text:'（貼圖：敬禮）'},
      {label:'end'} ],
    after:G=>{ if(typeof PHONE==='undefined') return; const th='p:classmate_peishan', me=t=>PHONE.post(G,{th,from:'player',who:null,text:t}), ps=t=>PHONE.post(G,{th,from:'classmate_peishan',text:t});
      const k=G.flags.PS_CANCEL; if(k==='ok'){ me('沒關係。'); ps('好。週一前一定給你。'); } else if(k==='waited') me('那我等妳十分鐘。'); else if(k==='later'){ me('改天再給我。'); ps('（貼圖：敬禮）'); } } },
  /* 「改天再給我。」（BB_96 3-7）：第 12 週週三法服讀書會散場（afterActivity）她把表拿給他；不是法服的玩家（或那天沒去）：第 12 週週四進 201 上課前 */
  { id:'ev_peishan_table_later_club', retired:'BB_191 §8-7：法服沒有讀書會；只留週四進 201 的版本（ev_peishan_table_later_class）', title:'那張表', participants:['classmate_peishan'], location:'any', trigger:'activity', afterActivity:'lawclub_study', term:['Y1S2'], weeks:[12], once:true, background:'blur',
    prereq:{flagIs:{PS_CANCEL:'later'},notFlags:['PS_TABLE_GOT']},
    dialogue:[ {speaker:'classmate_peishan',expression:'smile',text:'給你。上次說的改天，就是今天。'} ],
    consequences:{flags:{PS_TABLE_GOT:true}} },
  /* AA_294 ②（企劃 b3ec8820）：原本是第 12 週週四 12:00～13:20 走進 201（沒進去就沒有）→ 改成上債總一前（beforeClass），第 12 週沒去就延到下一次出席，到第 14 週；
     第 14 週還沒出席＝走信箱版（ev_peishan_table_mail 加 'later'）*/
  { id:'ev_peishan_table_later_class', title:'那張表', participants:['classmate_peishan'], location:'any', trigger:'class', beforeClass:'oblig_gen1', term:['Y1S2'], weeks:[12], carryTo:14, weekday:[4], once:true, background:'blur',
    prereq:{flagIs:{PS_CANCEL:'later'},notFlags:['PS_TABLE_GOT']},
    dialogue:[ {speaker:'classmate_peishan',expression:'smile',text:'給你。上次說的改天，就是今天。'} ],
    consequences:{flags:{PS_TABLE_GOT:true}} },
  /* 「沒關係。」、沒去女舍（或沒回）（BB_96 3-7）：第 12 週週一起，回宿舍時信箱裡有那張表，附一張便條（旁白照 BB 的描述寫成句子）*/
  { id:'ev_peishan_table_mail', title:'信箱', participants:[], location:['dorm_hall','dorm'], trigger:'enter', term:['Y1S2'], once:true, background:'freeze',
    prereq:{notFlags:['PS_TABLE_GOT'],custom:G=>{ const d=typeof STORY!=='undefined'&&STORY.termDay?STORY.termDay('Y1S2',12,1):null; const k=G.flags.PS_CANCEL;
      const late=k==='later'&&(()=>{ const d14=STORY.termDay('Y1S2',14,4); return d14!=null&&G.day>d14; })();   /* AA_294 ②：「改天再給我。」第 14 週還沒出席債總一＝也走信箱版（第 14 週週四過了）*/
      return d!=null&&G.day>=d&&(k==null||k==='ok'||late)&&typeof PHONE!=='undefined'&&PHONE.sent(G,'ps_table_cancel'); }},
    dialogue:[ {speaker:null,text:'信箱裡有那張表，附一張便條：「對不起啦。這份有畫重點，算我賠罪。」'} ],
    consequences:{flags:{PS_TABLE_GOT:true}} },
  /* 假期活動的關鍵事件（AA_199；vac3d.js）：出遊的 2D；連續好幾天的（營隊、日本）整段在 beforeOuting（中間的日子跳過、手機照時間收）*/
  { id:'ev_vac_key', title:'假期活動', participants:[], location:'any', trigger:'outing', background:'dark', hours:0.5, dialogue:[],
    beforeOuting:async(G,GM,q)=>{ if(typeof VAC!=='undefined') await VAC.outing(GM,q); },
    outingMissed:(G,GM,q)=>{ if(typeof VAC!=='undefined'&&VAC.missed) VAC.missed(GM,q); } },
  /* 學期末的飯帶出的單日小活動（AA_251：C14 事務所參觀、C15 朋友約的單日小事；termend3d.js 的 dayOuting）*/
  /* VA-09 芯慈實習公司樓下的午餐（AA_256 第 1 節；src/vac3d.js 的 va09Phone 排；她只有五十分鐘）。AA_549 2-1（AA 回第 1 題）：證券公司法務部，換掉「事務所」三處 */
  { id:'ev_va09_lunch', title:'實習公司樓下的午餐', participants:['classmate_xinci'], location:'any', trigger:'outing', once:true, get background(){ return typeof OUT!=='undefined'&&OUT.bg?OUT.bg('office_buffet'):'dark'; },   /* 11-02 使用者生成（BB_132 第 96 組第 2 張）*/
    hours:50/60,
    dialogue:[ {speaker:null,text:'（那棟大樓的一樓，自助餐。芯慈的識別證反過來別在衣服上。）'},
      {speaker:'classmate_xinci',text:'我只有五十分鐘。……先拿菜。'},
      {speaker:null,text:'（她夾了三樣，每一樣都很少。）'},
      {speaker:'classmate_xinci',text:'法務部比我想的安靜。大部分的時間，大家都在看合約。'},
      {speaker:'classmate_xinci',text:'（看了一下錶）還有十二分鐘。你吃慢一點沒關係，我先上去。'},
      {set:{VA09_LUNCH:'done'}} ] },
  /* 寒暑假去她的縣市（AA_276 第 5 節；src/hometown3d.js 演，台詞 src/data/hometown_lines.js）：hours＝回程的高鐵（高雄一個半小時、台中一小時）*/
  { id:'ev_hv_kx', title:'去高雄', participants:[], location:'any', trigger:'outing', background:'dark', hours:1.5, dialogue:[],
    beforeOuting:async(G,GM,q)=>{ if(typeof HV!=='undefined') await HV.play(GM,q); } },
  { id:'ev_hv_ps', title:'去台中', participants:[], location:'any', trigger:'outing', background:'dark', hours:1, dialogue:[],
    beforeOuting:async(G,GM,q)=>{ if(typeof HV!=='undefined') await HV.play(GM,q); } },
  /* 沛珊大三、大四的學期中在台南（AA_282 第 3 節，hometown_lines.js 的台南那一組）：回程的高鐵約一小時四十分鐘 */
  { id:'ev_hv_ps_tn', title:'去台南', participants:[], location:'any', trigger:'outing', background:'dark', hours:1.75, dialogue:[],
    beforeOuting:async(G,GM,q)=>{ if(typeof HV!=='undefined') await HV.play(GM,q); } },
  { id:'ev_te_day', title:'假期的一天', participants:[], location:'any', trigger:'outing', background:'dark', hours:2, dialogue:[],
    beforeOuting:async(G,GM,q)=>{ if(typeof TERMEND!=='undefined') await TERMEND.dayOuting(GM,q); },
    outingMissed:(G,GM,q)=>{ if(typeof TERMEND!=='undefined'&&TERMEND.dayMissed) TERMEND.dayMissed(GM,q); } },
  /* 學期末的飯（BB_203；termend3d.js）：一對一，出遊的 2D；整段在 beforeOuting（開場、話題池、飯桌一句、收尾；心意的邀約接回家的路上）*/
  { id:'ev_termend_dinner', title:'學期末的飯', participants:[], location:'any', trigger:'outing', background:'dark', hours:2, dialogue:[],
    beforeOuting:async(G,GM,q)=>{ if(typeof TERMEND!=='undefined') await TERMEND.dinner(GM,q); },
    outingMissed:(G,GM,q)=>{ if(typeof TERMEND!=='undefined'&&TERMEND.missed) TERMEND.missed(GM,q); } },
  /* 聖誕交換禮物（交付清單 A20：AA_71 2-6「大一的實作」，AA 2026-10-14 回 LAWWW）：第 17 週週三 12/24 中午 12:20～13:10 在霖澤館一樓；只有桌遊團的玩家有（阿哲兩天前在群組揪，
     story3d.js 的 phoneRules），沒去不扣分。在場的人＝XMAS_WHO 裡玩家認識的（交付清單第 0 節第 1 條）。祐廷送什麼由玩家選（XMAS_GIFT）；
     抽到祐廷禮物的人（XMAS_TO）、祐廷抽到誰的（XMAS_FROM）從在場的人裡隨機挑（pick）；明軒和 Alison 都在、抽到祐廷禮物的不是明軒＝Alison 的玩偶是明軒抽到（「和祐廷無關的一句」），祐廷就抽不到；
     柏翰的考古題由以安沒收（以安在場才有那一句；旁白的「又」只給中秋烤肉看過沒收的玩家：MIDAUTUMN_Y1＋BBQ_BOHAN_SEIZED，AA 交付清單 A20）；語彤抽到筆記本記 GIFT_NOTEBOOK_YT（AA_11 事件 16）。
     明軒的禮物（BB_95 3-6b，2026-10-14）：三色螢光筆；祐廷抽到＝「多買的。……我用不到啦。」＋（綠色螢光筆）「上次那支綠的還在嗎？……」或（SAW_HIM_STUDY）「……收好啦。」（BB_167 SC4 第 29 列，AA_207 §5），記道具 XMAS_HL3；
     別人抽到＝阿哲、明軒各一句。AA 的「小事」是條列，旁白照條列的字寫成句子 */
  /* 16 週制（AA_198 第 2 節第 1 點、AA_204 第 1 節 @4048e3ec）：改到 12/24（三）18:30 麵店，照出遊（OUT：story3d.js 的 xmas_y1，開始後 15 分鐘還沒到＝沒去）；原本第 17 週週三中午霖澤館一樓 */
  { id:'ev_xmas_exchange', title:'聖誕交換禮物', participants:[], location:'any', trigger:'outing', once:true, keep:'fixed', background:'blur', hours:2,
    prereq:{custom:(G,GM)=>typeof PHONE!=='undefined'&&PHONE.inGroup(G,'noodle_team')&&XMAS_HERE(G).length>0},
    dialogue:[ {scene:'公館燒臘'},{speaker:null,text:'（燒臘店最裡面那張桌子。阿姨多拿了兩張椅子過來。）'},{if:{custom:G=>XMAS_HERE(G).includes('heroine_03')},speaker:null,text:'（語彤今天沒班，坐在客人這一邊。）'},{speaker:null,text:'（禮物先疊在桌子中間，吃完再抽。）'},
      {speaker:null,text:'你帶來的禮物是——'},
      {choice:[{text:'一本小筆記本',set:{XMAS_GIFT:'notebook'}},{text:'一包咖啡豆',set:{XMAS_GIFT:'coffee'}},{text:'一張手寫卡片',set:{XMAS_GIFT:'card'}}]},
      {pick:{flag:'XMAS_TO',from:G=>XMAS_HERE(G)}},
      {if:{flagIs:{XMAS_TO:'heroine_01'}},speaker:null,text:'抽到你禮物的是以安。'},
      {if:{flagIs:{XMAS_TO:'heroine_01',XMAS_GIFT:'notebook'}},speaker:'heroine_01',expression:'smile',text:'剛好。我的快用完了。'},
      {if:{flagIs:{XMAS_TO:'heroine_01',XMAS_GIFT:'coffee'}},speaker:'heroine_01',expression:'neutral',text:'我在 Café 都點茶。開學以後會用到。謝謝。'},   /* AA_313 4-3：她每天下午在 Café 讀書，不說「不太喝咖啡」*/
      {if:{flagIs:{XMAS_TO:'heroine_01',XMAS_GIFT:'card'}},speaker:'heroine_01',expression:'neutral',text:'字比我想的整齊。……謝謝。'},
      {if:{flagIs:{XMAS_TO:'heroine_03'}},speaker:null,text:'抽到你禮物的是語彤。'},
      {if:{flagIs:{XMAS_TO:'heroine_03',XMAS_GIFT:'notebook'}},speaker:'heroine_03',expression:'neutral',text:'嗯。……我還不知道要寫什麼。先收著。'},
      {if:{flagIs:{XMAS_TO:'heroine_03',XMAS_GIFT:'coffee'}},speaker:'heroine_03',expression:'neutral',text:'放茶屋好了。蘇姨會想喝喝看。'},
      {if:{flagIs:{XMAS_TO:'heroine_03',XMAS_GIFT:'card'}},speaker:'heroine_03',expression:'neutral',text:'嗯。回去再看。'},
      {if:{flagIs:{XMAS_TO:'heroine_03',XMAS_GIFT:'notebook'}},mem:[{npc:'heroine_03',tag:'GIFT_NOTEBOOK_YT',note:'聖誕交換禮物：抽到你送的筆記本，還不知道要寫什麼'}]},
      {if:{flagIs:{XMAS_TO:'zhe'}},speaker:null,text:'抽到你禮物的是阿哲。'},
      {if:{flagIs:{XMAS_TO:'zhe',XMAS_GIFT:'notebook'}},speaker:'zhe',expression:'laugh',text:'好，我拿來寫菜單。'},
      {if:{flagIs:{XMAS_TO:'zhe',XMAS_GIFT:'coffee'}},speaker:'zhe',expression:'neutral',text:'可以配滷味嗎？'},
      {if:{flagIs:{XMAS_TO:'zhe',XMAS_GIFT:'card'}},speaker:'zhe',expression:'laugh',text:'你寫這麼多字，我會哭耶。……沒事啦。'},
      {if:{flagIs:{XMAS_TO:'classmate_bohan'}},speaker:null,text:'抽到你禮物的是柏翰。'},
      {if:{flagIs:{XMAS_TO:'classmate_bohan',XMAS_GIFT:'notebook'}},speaker:'classmate_bohan',expression:'neutral',text:'我拿來整理考古題。'},
      {if:{flagIs:{XMAS_TO:'classmate_bohan',XMAS_GIFT:'coffee'}},speaker:'classmate_bohan',expression:'neutral',text:'下學期很需要。謝謝。'},
      {if:{flagIs:{XMAS_TO:'classmate_bohan',XMAS_GIFT:'card'}},speaker:'classmate_bohan',expression:'neutral',text:'……謝謝。我回去看。'},
      {if:{flagIs:{XMAS_TO:'classmate_xinci'}},speaker:null,text:'抽到你禮物的是芯慈。'},
      {if:{flagIs:{XMAS_TO:'classmate_xinci',XMAS_GIFT:'notebook'}},speaker:'classmate_xinci',expression:'neutral',text:'格線的嗎？……空白的也好。謝謝。'},
      {if:{flagIs:{XMAS_TO:'classmate_xinci',XMAS_GIFT:'coffee'}},speaker:'classmate_xinci',expression:'smile',text:'追劇的時候剛好。謝謝。'},
      {if:{flagIs:{XMAS_TO:'classmate_xinci',XMAS_GIFT:'card'}},speaker:'classmate_xinci',expression:'smile',text:'謝謝。你寫好多。'},
      {if:{flagIs:{XMAS_TO:'yu'}},speaker:null,text:'抽到你禮物的是 Alison。'},
      {if:{flagIs:{XMAS_TO:'yu',XMAS_GIFT:'notebook'}},speaker:'yu',expression:'laugh',text:'我要拿來寫三個社團的行事曆！'},
      {if:{flagIs:{XMAS_TO:'yu',XMAS_GIFT:'coffee'}},speaker:'yu',expression:'laugh',text:'我拿去社辦泡給大家喝！'},
      {if:{flagIs:{XMAS_TO:'yu',XMAS_GIFT:'card'}},speaker:'yu',expression:'laugh',text:'卡片！我要貼在牆上！'},
      {if:{flagIs:{XMAS_TO:'classmate_mingxuan'}},speaker:null,text:'抽到你禮物的是明軒。'},
      {if:{flagIs:{XMAS_TO:'classmate_mingxuan',XMAS_GIFT:'notebook'}},speaker:'classmate_mingxuan',expression:'neutral',text:'……我不念書的。'},
      {if:{flagIs:{XMAS_TO:'classmate_mingxuan',XMAS_GIFT:'notebook'}},speaker:null,text:'他很快把它收進書包。'},
      {if:{flagIs:{XMAS_TO:'classmate_mingxuan',XMAS_GIFT:'coffee'}},speaker:'classmate_mingxuan',expression:'neutral',text:'家教的時候喝。謝啦。'},
      {if:{flagIs:{XMAS_TO:'classmate_mingxuan',XMAS_GIFT:'card'}},speaker:'classmate_mingxuan',expression:'neutral',text:'卡片喔。……我帶回家。'},
      {pick:{flag:'XMAS_FROM',from:G=>XMAS_FROM_POOL(G)}},
      {if:{flagIs:{XMAS_FROM:'heroine_01'}},speaker:null,text:'你抽到以安的禮物：一本空白的手帳。'},
      {if:{flagIs:{XMAS_FROM:'heroine_01'}},speaker:'heroine_01',expression:'neutral',text:'我自己也用這一款。'},
      {if:{flagIs:{XMAS_FROM:'heroine_03'}},speaker:null,text:'你抽到語彤的禮物：一包茶屋的烏龍。'},
      {if:{flagIs:{XMAS_FROM:'heroine_03'}},speaker:'heroine_03',expression:'neutral',text:'很辣。不要一次吃完。'},
      {if:{flagIs:{XMAS_FROM:'zhe'}},speaker:null,text:'你抽到阿哲的禮物：一盒滷味。'},
      {if:{flagIs:{XMAS_FROM:'zhe'}},speaker:'zhe',expression:'laugh',text:'冷掉了，但很好吃。'},
      {if:{flagIs:{XMAS_FROM:'classmate_bohan'}},speaker:null,text:'你抽到柏翰的禮物：一疊考古題。'},
      {if:{flagIs:{XMAS_FROM:'classmate_bohan'},custom:G=>XMAS_HERE(G).includes('heroine_01')},speaker:'heroine_01',expression:'neutral',text:'沒收。'},
      {if:{flagIs:{XMAS_FROM:'classmate_xinci'}},speaker:null,text:'你抽到芯慈的禮物：一本空白的筆記本，第一頁的格線已經畫好了。'}   /* AA_497 第 8 節第 3 點（企劃線 60fc3b9a3）：追劇減量，劇單換筆記本 */,
      {if:{flagIs:{XMAS_FROM:'classmate_xinci'}},speaker:'classmate_xinci',expression:'smile',text:'十二部。看完跟我說。'},
      {if:{flagIs:{XMAS_FROM:'yu'}},speaker:null,text:'你抽到 Alison 的禮物：一個巨大的玩偶。'},
      {if:{flagIs:{XMAS_FROM:'yu'}},speaker:'yu',expression:'smile',text:'我一個人在家的時候抱的那種。……送你。'},
      {if:{flagIs:{XMAS_FROM:'classmate_mingxuan'}},speaker:null,text:'你抽到明軒的禮物：一組三色螢光筆，黃、粉紅、藍。'},
      {if:{flagIs:{XMAS_FROM:'classmate_mingxuan'}},speaker:'classmate_mingxuan',expression:'neutral',text:'多買的。……我用不到啦。'},
      {if:{flagIs:{XMAS_FROM:'classmate_mingxuan',GREEN_HIGHLIGHTER:true}},speaker:'classmate_mingxuan',expression:'smile',text:'上次那支綠的還在嗎？……這樣你有四種了。'},
      {if:{flagIs:{XMAS_FROM:'classmate_mingxuan'},memory:[{npc:'classmate_mingxuan',tag:'SAW_HIM_STUDY'}],custom:G=>!G.flags.GREEN_HIGHLIGHTER},speaker:'classmate_mingxuan',expression:'embarrassed',text:'……收好啦。'},
      {if:{flagIs:{XMAS_FROM:'classmate_mingxuan'}},set:{XMAS_HL3:true}},
      {if:{custom:G=>{ const h=XMAS_HERE(G); return h.includes('classmate_bohan')&&h.includes('heroine_01')&&G.flags.XMAS_FROM!=='classmate_bohan'&&!!(G.flags.MIDAUTUMN_Y1&&G.flags.BBQ_BOHAN_SEIZED); }},speaker:null,text:'柏翰送的考古題，又被以安沒收了。'},
      {if:{custom:G=>{ const h=XMAS_HERE(G); return h.includes('classmate_bohan')&&h.includes('heroine_01')&&G.flags.XMAS_FROM!=='classmate_bohan'&&!(G.flags.MIDAUTUMN_Y1&&G.flags.BBQ_BOHAN_SEIZED); }},speaker:null,text:'柏翰送的考古題，被以安沒收了。'},
      {if:{custom:G=>{ const h=XMAS_HERE(G); return h.includes('classmate_mingxuan')&&h.includes('zhe')&&G.flags.XMAS_FROM!=='classmate_mingxuan'; }},speaker:'zhe',expression:'laugh',text:'你送螢光筆？你？'},
      {if:{custom:G=>{ const h=XMAS_HERE(G); return h.includes('classmate_mingxuan')&&h.includes('zhe')&&G.flags.XMAS_FROM!=='classmate_mingxuan'; }},speaker:'classmate_mingxuan',expression:'neutral',text:'多買的啦。'},
      {if:{custom:G=>XMAS_MX_YU(G)},speaker:null,text:'明軒抽到 Alison 的巨大玩偶，揹著它去搭公車。'} ],
    consequences:{flags:{XMAS_Y1:true},memo:'聖誕交換禮物（公館燒臘）'} },
  /* 颱風假 T1a「泡麵之夜」（BB_110 第 2 節、交付清單 B3，2026-10-14 第 2 級 AA×BB）：颱風假（calendar.js 的 TYPHOON：第 7 週週一）晚上 18–23 點在宿舍房間。
     阿凱囤了泡麵；隔壁的方奕廷抱著植物過來——玩家見過他才有和他有關的三句（交付清單第 0 節第 1 條：沒見過的人不出現）。
     「不可抗力」只當玩笑、沒有人下結論（BB 2026-10-14 法律查核，BB_115 L436）。「看情況。」記 SAID_DEPENDS（大二 F2 阿凱的聊天機器人多一句）。
     生活 CG BCG-18「颱風夜的泡麵」（BB 2026-10-14 ART_APPROVED）在方奕廷進來那一句出現、之後的台詞和選項都用同一張；沒見過他的玩家不放（圖裡有他，BB 同意）。
     跳過時間的玩家不補演（BB_110 第 0 節）*/
  { id:'ev_typhoon_noodles_y1', title:'颱風夜的泡麵', participants:['kai'], location:'dorm', trigger:'auto', term:['Y1S1'], weeks:[7], weekday:[1], time:[18,23], once:true, background:'blur',
    prereq:{custom:G=>typeof CALENDAR!=='undefined'&&CALENDAR.typhoon(G.day)},
    dialogue:[ {speaker:'kai',expression:'laugh',text:'我上禮拜就囤了二十包。你看，有用吧。'},
      {if:{flags:['DORM_FOUR']},speaker:'classmate_bohan',expression:'neutral',text:'（在讀張教授寄來的講義）第二十頁了。'},{if:{flags:['DORM_FOUR']},speaker:'zhe',expression:'smile',text:'（拿走一包泡麵）我出熱水。'},   /* 四人房（AA_208 2-3）：接群組 ty1_g3 柏翰「我讀到第十二頁」（10/12）——AA_372 第 17 項：隔天讀到第二十頁 */
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('npc_fangyt',G)},cg:'cg_typhoon_noodles'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('npc_fangyt',G)},speaker:'npc_fangyt',expression:'neutral',text:'（抱著一盆植物進來）放陽台會被吹倒，先放你們這邊一晚。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('npc_fangyt',G)},speaker:'kai',expression:'surprised',text:'……你帶一盆植物來吃泡麵？'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('npc_fangyt',G)},speaker:'npc_fangyt',expression:'neutral',text:'它不用吃啦，放角落就好。'},
      {speaker:'kai',expression:'smile',text:'欸，颱風天泡麵，算不算你們說的那個……不可抗力？'},
      {choice:[{text:'「算。所以你要分我。」',goto:'yes'},{text:'「不算。這是你自己囤的。」',goto:'no'},{text:'「看情況。」',goto:'dep'}]},
      {label:'yes'},{speaker:'kai',expression:'smile',text:'這個推論有問題，但我接受。'},{goto:'end'},
      {label:'no'},{speaker:'kai',expression:'sad',text:'你好無情。……拿去。'},{goto:'end'},
      {label:'dep'},{speaker:'kai',expression:'smile',text:'又來了。……好啦，拿去。'},{mem:[{npc:'kai',tag:'SAID_DEPENDS',note:'颱風夜的泡麵：「不可抗力？」「看情況。」'}]},
      {label:'end'} ],
    consequences:{flags:{TYPHOON_Y1:true},memo:'颱風假：宿舍的泡麵之夜'} },
  /* AA_208 第 2-4 節「返鄉」（AA_204 第 4 節；AA208-L 歷史複核：AA_502 以為做了、其實沒有）：同寢室的阿哲 1/2 回高雄、柏翰 1/9 回新竹（characters.js absentDates 那天起不在）——
     那天人在 203 就多一句旁白；只有大一寒假；那天沒進房間（回家住、整天在外面）就沒有 */
  { id:'ev_y1w_zhe_left', title:'', participants:[], location:'dorm', trigger:'auto', once:true, priority:2, background:'blur',
    prereq:{custom:G=>(G.stage||'law')==='law'&&typeof STORY!=='undefined'&&!!STORY.dayOfKey&&G.day===STORY.dayOfKey('2026-01-02')},
    dialogue:[ {speaker:null,text:'（阿哲的籃球不在了。）'} ] },
  { id:'ev_y1w_bh_left', title:'', participants:[], location:'dorm', trigger:'auto', once:true, priority:2, background:'blur',
    prereq:{custom:G=>(G.stage||'law')==='law'&&typeof STORY!=='undefined'&&!!STORY.dayOfKey&&G.day===STORY.dayOfKey('2026-01-09')},
    dialogue:[ {speaker:null,text:'（柏翰的床鋪捲起來了，桌上只剩檯燈。）'} ] },
  /* 跨年（交付清單 A21：交接包_v1 第 3 節、AA_71 2-7、BB_95 9-7）：12/31（16 週制：寒假裡，AA_204）。一週前可昕問「跨年要不要去人少的地方？」（story3d.js 的 phoneRules）：
     「好。」＝河堤（出遊，和 K1b 的河堤共用背景；回宿舍的路上桌遊團群組傳頂樓的照片）；「我想在臺北跟桌遊團跨年。」＝宿舍頂樓，零點前一分鐘她打視訊來（不扣分；她不在這裡和桌遊團見面）。
     沒有回她、在桌遊團群組裡的玩家照 AA 的群戲去頂樓（沒有視訊）。記 KX_NYE:{1:'river'|'roof'}（BB_107 第 13 節：節日每年一筆）*/
  { id:'ev_nye_river', title:'跨年', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:2.5, kxAway:true,
    outingMissed:(G,GM,q)=>{ G.flags.KX_NYE=Object.assign({},G.flags.KX_NYE||{},{1:'missed'}); if(typeof PHONE!=='undefined'&&q&&q.day!=null) PHONE.at(G,q.day,24+5/60,[{th:'p:kexin',from:'kexin',text:'新年快樂。河邊沒什麼人，我自己看完了。'}],'kx_nye_missed_y1'); },   /* CANON-NO-ECON-1112 第四批（AA_877 #3）：沒去＝她當晚傳一則，不追問 */   /* AA_313 第 2 節第 15 列（2-3 B）：KX_NYE[1]＝missed 同大二～大四（00:05 她打來的電話：CANON-NO-ECON-1112 第三批拿掉）*/   /* kxAway：結尾一個人在回程的高鐵上（AA_309 第 3 列，不接她的閒聊）*/   /* AA_276 第 3 節第 1 點：去高雄跨年；0.5 小時＋凌晨一點的高鐵回臺北 */
    dialogue:[ {scene:'高雄・愛河邊',bg:'kh_river_night'},   /* 愛河邊跨年深夜（ART-KH-BUS，BB-C 23612343；原本暫用河濱 riverside）*/
      {speaker:null,text:'河堤上的人不多。煙火在很遠的地方，聲音晚了好幾秒才到。'},
      {speaker:'kexin',expression:'smile',text:'今年我們不去人多的地方。'},
      {speaker:'kexin',expression:'teasing',text:'明年你最想做什麼？……一件就好。'},
      {choice:[{text:'「跟妳一起把大一念完。」',goto:'a'},{text:'「把民總讀完。」',goto:'b'},{text:'「妳先說。」',goto:'c'}]},   /* CANON-NO-ECON-1112 第四批：選項一照 AA_877 #3 換字 */
      {label:'a'},{speaker:'kexin',expression:'smile',text:'那我先說：新年快樂。'},{goto:'end'},
      {label:'b'},{speaker:'kexin',expression:'smile',text:'好無聊。'},{speaker:null,text:'她數到三。'},{speaker:'kexin',expression:'smile',text:'新年快樂。'},{goto:'end'},
      {label:'c'},{speaker:'kexin',expression:'smile',text:'明年的這個時候，也在這裡看。……新年快樂。'},
      {label:'end'},{speaker:'kexin',expression:'neutral',text:'十分鐘。看完就回去。我媽說十二點半以前要到家。'},   /* AA_369 M5：期末考 12/15～12/19 已經考完，她 12/22 起在高雄放寒假 */
      {speaker:null,text:'（凌晨一點，加開的那班高鐵。你在車上睡著了。）'} ],
    consequences:{flags:{NYE_DONE:'river'},memo:'跨年：去高雄和可昕在愛河邊'} },
  /* 跨年大一（AA_204 第 2 節，企劃線 27711a39；AA_197 1-5）：12/26 阿哲揪（story3d.js）→「我去」＝19:00 麵店（ev_nye_dinner：吃飯 → 21:40 選 → 22:50 信義區管制線 → 23:40 頂樓）；
     「直接到頂樓」「再看看」、和可昕選頂樓＝23:40 頂樓（ev_nye_roof）。記 NYE_Y1：dinner／roof（河堤 river 在 ev_nye_river；沒去＝沒有值）。在場的人熟悉 +1。
     以安：FRIEND 以上（或交往中）才上頂樓；交往中 00:10 那句換成跑步（2-5）。語彤交往中：00:01 打電話來（在頂樓的在這裡演，其他的 story3d.js 排一通電話）*/
  { id:'ev_nye_roof', title:'跨年', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:0.5,
    dialogue:[ {scene:'宿舍頂樓',bg:'dorm_roof'},
      {cg:'cg_nye_rooftop'},   /* CG-15 頂樓的跨年（BB 2026-10-14 ART_APPROVED）*/
      ...NYE_ROOF_Y1 ],
    consequences:{flags:{NYE_DONE:'roof',NYE_Y1:'roof'},memo:'跨年：宿舍頂樓'} },
  { id:'ev_nye_dinner', title:'跨年', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:0.5,
    dialogue:[ {scene:'公館燒臘',bg:'noodle_table'},
      {speaker:null,text:'（十二月三十一日，晚上七點。燒臘店比平常擠，阿姨把門口那張桌子也搬了進來。）'},   /* AA_519 1-1：不再寫「老闆娘」（旁白第一次寫「阿姨（阿鳳）」：src/sup519_3d.js S.narName）*/
      {speaker:'zhe',text:'先點小菜。豆干、海帶、滷蛋，還有什麼？'},
      {speaker:'yu',text:'我要叉燒飯。……不對，今天好冷，我要多一碗例湯。'},
      {speaker:'classmate_bohan',text:'十點半出發，到市府站差不多十一點。'},
      {speaker:'zhe',text:'好，就十點半。'},
      {advance:2.5},
      {if:{custom:G=>NYE_XC(G)},speaker:null,text:'（九點半，芯慈先站起來。）'},
      {if:{custom:G=>NYE_XC(G)&&NYE_AT(G,'classmate_xinci','FRIEND')},speaker:'classmate_xinci',text:'我先走了，家裡有事。你們拍照傳群組。'},
      {if:{custom:G=>NYE_XC(G)&&!NYE_AT(G,'classmate_xinci','FRIEND')},speaker:'classmate_xinci',text:'我先走了，家裡有事。'},
      {advance:1/6},
      {choice:[{text:'「一起去。」',goto:'go'},{text:'「我先回去了。」',goto:'home'}]},
      {label:'home'},{speaker:'zhe',text:'好，新年快樂！'},{set:{NYE_Y1:'dinner',NYE_DONE:'dinner'}},{goto:'end'},
      {label:'go'},
      {if:{custom:G=>!NYE_AN(G)},speaker:'heroine_01',text:'我先回宿舍了。新年快樂。'},
      {if:{custom:G=>NYE_AN(G)},set:{NYE_Y1_AN:true}},   /* 她跟大家一起去信義區（大二頂樓那句看這個，AA_313 4-3）*/   /* 以安 FRIEND 以上才一起去（1-5）*/
      {advance:1.1},{scene:'信義區',bg:'newyear_crowd'},
      {speaker:null,text:'（市府站一出來，人多到走不動。前面拉了管制線，穿背心的工作人員一直在喊：「這邊不能再過去了！」）'},
      {if:{custom:G=>NYE_AT(G,'classmate_mingxuan','ACQUAINTANCE')},speaker:null,text:'（管制線那邊，明軒穿著工作背心，手上拿著擴音器。）'},
      {if:{custom:G=>NYE_AT(G,'classmate_mingxuan','ACQUAINTANCE')},speaker:'classmate_mingxuan',text:'欸？你們也來喔。'},
      {if:{custom:G=>NYE_AT(G,'classmate_mingxuan','ACQUAINTANCE')},speaker:'classmate_mingxuan',text:'前面已經滿了，過不去。我在這站到一點。回去吧，頂樓看得比較清楚。'},   /* AA_432 4-4：BB_171 3-1 的兩句定稿照用（原本 AA_204／AA_313 5-7「欸！你們也來喔！」「這邊真的過不去了啦。……我十二點半下班，你們先走。」）*/
      {unless:{custom:G=>NYE_AT(G,'classmate_mingxuan','ACQUAINTANCE')},speaker:null,text:'（前面的人說，再過去要排一個小時。）'},
      {speaker:'zhe',text:'好喔。撤。'},   /* AA_437 第 9 節（明軒剛說過「頂樓看得比較清楚」）*/
      {speaker:'yu',text:'看得到嗎？'},
      {speaker:'zhe',text:'看得到一點。'},
      {speaker:null,text:'（你們又擠回捷運站。）'},
      {advance:0.83},{scene:'宿舍頂樓',bg:'dorm_roof'},{cg:'cg_nye_rooftop'},
      ...NYE_ROOF_Y1,
      {label:'end'} ],
    consequences:{memo:'跨年：公館燒臘'} },
  /* 和語彤交往中、跨年不在頂樓（AA_204 2-5）：00:01 她打電話來（「在頂樓」那一句不說）*/
  { id:'ev_yt_nye_call_y1', title:'語彤的電話', participants:['heroine_03'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.1,
    dialogue:[ {scene:'電話'}, {speaker:null,text:'（零點過一分，手機響了。是語彤。）'},
      {speaker:'heroine_03',text:'新年快樂。'},
      {speaker:null,text:'（她那邊很安靜，只聽得到電視的聲音。）'},
      {choice:[{text:'「幫我跟妳媽媽說新年快樂。」',goto:'a'},{text:'「妳們在看什麼？」',goto:'b'}]},
      {label:'a'},{speaker:'heroine_03',text:'好。'},{speaker:null,text:'（電話那頭，她媽媽的聲音：『新年快樂喔！』）'},{goto:'end'},
      {label:'b'},{speaker:'heroine_03',text:'跨年晚會。我媽在跟著唱。'},
      {label:'end'},{set:{YT_NYE_CALL_Y1:true}} ] },
  /* 12/29（一）海邊一日遊（AA_204 第 3 節、AA_199 VA-03）：12/26 群組約、08:50 臺北車站集合（story3d.js）；海邊用約會底圖的海邊（不寫真實地名）。記 VA03_BEACH:'went'、VA03_SHOE；在場的人熟悉 +1 */
  { id:'ev_va03_beach', title:'海邊一日遊', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:0.5,
    dialogue:[ {scene:'海邊',bg:'d25_base_sunset'},
      {speaker:null,text:'（放寒假的第二個禮拜。下火車的時候，天陰陰的，風很大。）'},   /* 每年都用這句（AA_264 第 5 節第 4 點，7fa3660d：取代「十二月二十九日」「寒假的第一個禮拜一」）*/
      {speaker:'yu',text:'好冷！！'},
      {speaker:'zhe',text:'來都來了。'},
      {speaker:null,text:'（沙灘上幾乎沒有人。阿哲把鞋子脫了，踩到水，叫了一聲又跑回來。）'},
      {speaker:null,text:'（柏翰站在離浪最遠的地方，鞋子拿在手上。）'},   /* AA_313 5-5：同一週柏翰的精確數字太多 */
      {if:{custom:G=>!!G.flags.VA03_AN},speaker:'heroine_01',text:'你的鞋子。被浪捲走一隻了。'},
      {unless:{custom:G=>!!G.flags.VA03_AN},speaker:'yu',text:'欸你的鞋子！！'},
      {speaker:null,text:'（一隻鞋子在浪裡一上一下。）'},
      {choice:[{text:'（去幫他撿）',goto:'shoe'},{text:'（站在旁邊拍）',goto:'photo'}]},
      {label:'shoe'},{speaker:null,text:'（你撿回來的時候，褲管濕到膝蓋。）'},
      {if:{flags:['ZHE_CALLS_GE']},speaker:'zhe',text:'哥！'},{unless:{flags:['ZHE_CALLS_GE']},speaker:'zhe',text:'謝啦！'},{set:{VA03_SHOE:true}},{goto:'lunch'},
      {label:'photo'},{speaker:null,text:'（照片裡，阿哲單腳在沙灘上跳。）'},
      {label:'lunch'},
      {advance:3},
      {speaker:null,text:'（中午在附近找了一家海產店，大家分兩盤炸的。Alison 點了一碗熱湯，自己喝掉一半。）'},
      {speaker:'yu',text:'欸我們拍一張合照。'},
      {speaker:null,text:'（請路過的阿伯幫忙拍。拍了五張，每一張都有人在眨眼。）'},
      {advance:4},
      {speaker:null,text:'（回程的火車上，大家都睡著了。你醒來的時候，已經過了好幾站。）'},
      {set:{VA03_BEACH:'went'}},{rel:{zhe:{fam:1},yu:{fam:1},classmate_bohan:{fam:1}}},{if:{custom:G=>!!G.flags.VA03_AN},rel:{heroine_01:{fam:1}}} ],
    consequences:{memo:'12/29 海邊一日遊'} },
  /* 2/20 阿哲「開學那天拿去給你們」（AA_204 第 4 節）：2/23 起第一次在教室或麵店遇到他 */
  { id:'ev_zhe_snack_y1', title:'', participants:['zhe'], location:['classroom','noodle'], trigger:'auto', term:['Y1S2'], once:true, background:'blur', near:{npc:'zhe',r:4},
    prereq:{custom:G=>typeof PHONE!=='undefined'&&PHONE.sent(G,'zhe_back_y1')&&!G.flags.ZHE_SNACK_Y1},
    dialogue:[ {speaker:'zhe',text:'拿去，我媽買太多了'},{set:{ZHE_SNACK_Y1:true}} ] },
  /* 期末最後一頓（交付清單 A22：AA_71 2-13）：這學期最後一科考完以後（classes3d.js 的 lastExamEnd），走進阿鳳麵店（傍晚到晚上）；桌遊團才有（哲 1 之後）。只一次。
     「桌遊團一定吃一頓」那句旁白照 2-13 的字；阿姨的一句原文 */
  /* AA_648 第 1 節（企劃線 1ebf7a590，AA 定稿）：期末考完的聚餐取代燒臘店那一場（四場：大一上下、大二上下）——日子不變，地點改日常失速的長桌（wz_offbeat；OFFB.finalZone）；
     開頭的揪人句照 AA_618 2-4 第 2 點（手機群組，src/offbeat_sys3d.js 的 OFFB.phone），結尾旁白一句照學期輪（OFFB.finalNarrOf）。講燒臘、叉燒的句子和燒臘店阿姨的話只在燒臘店那一版演
     （舊存檔已經收到「考完了 七點，燒臘店」的那一晚照舊在燒臘店；換不過來的句子報告 AA）。已經演過的照舊不重演（once）*/
  { id:'ev_term_last_meal', title:'期末最後一頓', participants:[], location:['noodle','wz_offbeat'], trigger:'enter', term:['Y1S1'], time:[17,22], once:true, background:'blur',
    prereq:{custom:G=>{ if(G.flags.noodleTableDay==null||typeof CLS==='undefined'||!CLS.lastExamEnd) return false; const e=CLS.lastExamEnd(G,'Y1S1','final'); return !!e&&(G.day>e.day||(G.day===e.day&&G.hour>=e.h))&&G.zone===(typeof OFFB!=='undefined'&&OFFB.finalZone?OFFB.finalZone(G,'Y1S1'):'noodle'); }},
    dialogue:[ {if:{custom:G=>G.zone==='wz_offbeat'},call:async(G,GM)=>{ if(typeof OFFB!=='undefined'&&OFFB.finalSeat) OFFB.finalSeat(GM,'Y1S1'); }}, {if:{custom:G=>typeof STORY!=='undefined'&&STORY.classPhotoOk&&STORY.classPhotoOk(G)},cg:'cg_class_photo_y1'},   /* BCG-46 期末合照（BB_132 第 69 組；新畫面，不是新事件——拍完去麵店，AA_71 2-13）：其他八人裡至少五位 FRIEND 以上，相簿才存 */
      {speaker:null,text:'期末最後一科考完。阿哲在群組喊了一聲。'},{if:{custom:G=>G.zone==='noodle'},speaker:null,text:'阿姨多送了一盤小菜。'},{if:{custom:G=>G.zone==='noodle'},speaker:'阿姨',text:'考完了，吃好一點。'},{if:{custom:G=>G.zone==='wz_offbeat'},speaker:null,text:'（店員多送了一盤薯條。）'},{if:{custom:G=>G.zone==='wz_offbeat'},speaker:'店員',text:'考完了喔？這盤算店裡的。'},{if:{custom:G=>G.zone==='wz_offbeat'},call:async(G,GM)=>{ if(typeof OFFB!=='undefined'&&OFFB.finalNarrOf) await GM.say(null,OFFB.finalNarrOf('Y1S1')); }},{if:{custom:G=>G.zone==='wz_offbeat'},call:async(G,GM)=>{ if(typeof OFFB!=='undefined'&&OFFB.finalUnseat) OFFB.finalUnseat(GM); }} ],
    consequences:{memo:'期末最後一頓'} },
  /* 學姊 W4：空的保溫瓶（交接包 v2、BB_96 2-5）：大一下第 8～9 週、總圖、平日 14～17（她的作息本來就在總圖）、有點熟以上、once。輕的一場：她不哭、不說累。
     選項 2 之後一週「保溫瓶上貼了一張便條：已裝滿」——遊戲沒有保溫瓶的模型，先沒有（之後做道具時補）*/
  /* BB_207 第 2 節（7b39f636）、AA_261 第 2 節（16919f86）：搬到大一上第 8～9 週（她準備研究所筆試的那一年）、法學院圖書館；旁白第一句「她在讀判決」→「她在寫考古題」，其他照原稿 */
  /* AA_590 第 16 列（使用者 11-02 選擇題：看不出保溫瓶空不空）：整場拿掉——retired，不再觸發；定義留給已經演過的舊存檔（記憶、flaskCoffeeDay 照留）。
     連帶（AA_590 沒寫，照舊）：下面的 ev_sis_flask_full（只有舊存檔選過黑咖啡才會演）、熱水 W5 那一句、ladder.js 大一下 S2-L6／S3-L6 讀這一場的 linesIf／extraIf、postgrad3d 的 helpedCoffee */
  { id:'ev_sis_empty_flask', retired:'AA_590 第 16 列（使用者 2026-11-02 選擇題）：空的保溫瓶那一場整場拿掉；定義留給已經演過的舊存檔', title:'空的保溫瓶', participants:['heroine_05'], location:'lawlib', trigger:'interact', priority:8, once:true, term:['Y1S1'], weeks:[8,9], weekday:[1,2,3,4,5], time:[14,17], prereq:{stage:{npc:'heroine_05',min:'FAMILIAR'}}, background:'blur',
    dialogue:[ {speaker:null,text:'她在寫考古題，左手拿著保溫瓶，喝了一口。又喝了一口。'},{speaker:null,text:'保溫瓶是空的。她已經對著空瓶喝了三次。'},
      {choice:[{text:'「學姊，妳的保溫瓶是空的。」',consequences:{mem:[{npc:'heroine_05',tag:'NOTICED_HER',note:'空的保溫瓶'}]},goto:'tell'},{text:'（去 Café 買一杯黑咖啡，放在她桌上）',consequences:{mem:[{npc:'heroine_05',tag:'HELPED',note:'空的保溫瓶，買了黑咖啡'}],stamp:['flaskCoffeeDay']},goto:'coffee'},{text:'（什麼都不說）',consequences:{mem:[{npc:'heroine_05',tag:'NOTICED_HER',note:'空的保溫瓶'}]},goto:'quiet'}]},
      {label:'tell'},{speaker:null,text:'（她低頭看，搖了一下。）'},{speaker:'heroine_05',expression:'surprised',text:'……喔。'},{speaker:'heroine_05',expression:'neutral',text:'我早上九點裝的。我以為我還沒喝完。'},{speaker:null,text:'（她笑出來。）'},{speaker:'heroine_05',expression:'smile',text:'這件事很蠢。你看到了，就算了。'},{goto:'end'},
      {label:'coffee'},{speaker:'heroine_05',expression:'surprised',text:'你翹課？'},{speaker:'player',text:'下課了。'},{speaker:'heroine_05',expression:'smile',text:'……好。'},{speaker:null,text:'（她把咖啡倒進保溫瓶。）'},{goto:'end'},
      {label:'quiet'},{speaker:null,text:'（她自己發現，起身去裝水。）'},{speaker:'heroine_05',expression:'serious',text:'你看到了吧。'},{speaker:'player',text:'……沒有。'},{speaker:'heroine_05',expression:'smile',text:'說謊的時候，不要看別的地方。'},
      {label:'end'} ] },
  /* 明軒 F-M4 家教的弟弟（BB_96 3-2；AA_72 第 3 節；V2-B32＋SYS-13 最小版）：大一上第 6 週起（11-03；原本大一下第 3 週起）、校園、平日 15:30～18:00（他的作息）、SAW_HIM_STUDY 或和他「熟悉」以上、只一次。
     「好。」＝JOB_TUTOR（每週一次的家教，story3d.js 排出遊 ev_tutor_lesson）；「我先想想。」＝名額留到月底：月底前一週他私訊再問，過了月底「名額給別人了。」。
     哪一天：答應的時候選週二或週四（AA_163 第 2 節①、BB_161 ⑪；TUTOR_WD，舊存檔沒有＝週二）；做多久、沒去那一週等照 AA_163 第 2 節（SYS-13）*/
  { id:'ev_mingxuan_tutor_intro', title:'家教的弟弟', participants:['classmate_mingxuan'], location:'campus', trigger:'interact', priority:6, once:true, term:['Y1S1','Y1S2'], weeks:[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15], minWeek:{term:'Y1S1',week:6},   /* 使用者 11-03「一開始就要有」（AA 確認）：大一上第 6 週起（原本大一下第 3～15 週）；大一上沒遇到的，大一下照樣遇得到 */ weekday:[1,2,3,4,5], time:[15.5,18], background:'blur',
    prereq:{any:[{memory:[{npc:'classmate_mingxuan',tag:'SAW_HIM_STUDY'}]},{stage:{npc:'classmate_mingxuan',min:'FAMILIAR'}}]},
    dialogue:[ {speaker:'classmate_mingxuan',expression:'neutral',text:'欸，你要不要接一個家教？'},{speaker:'classmate_mingxuan',expression:'neutral',text:'我學生的弟弟，國中，要補公民。我排不下了。'},{speaker:'narrator',text:'你想起公園公布欄的那張紙。',if:{custom:G=>typeof PARK!=='undefined'&&PARK.tutorAdEcho(G)}},   /* 看過小公園公布欄的家教廣告（AA_171 第 2 節；一般狀態 G.daily.park.sawTutorAd，只有這句旁白讀）*/
      {speaker:'classmate_mingxuan',expression:'neutral',text:'我們法律系教國中公民應該還行吧？'},/* AA_209 附錄B §2 */{speaker:'classmate_mingxuan',expression:'smile',text:'時薪我幫你談好了。不能比我低。'},
      {choice:[{text:'「好。」',set:{JOB_TUTOR:true},consequences:{stamp:['tutorFromDay']},goto:'y'},{text:'「我先想想。」',consequences:{stamp:['tutorThinkDay']},goto:'n'}]},
      {label:'y'},{speaker:'classmate_mingxuan',expression:'neutral',text:'你哪天方便？'},{choice:[{text:'「週二。」',set:{TUTOR_WD:2}},{text:'「週四。」',set:{TUTOR_WD:4}}]},   /* BB_161 ⑪、AA_163 第 2 節①：答應的時候選週二或週四（19:00～21:00）*/
      {speaker:'classmate_mingxuan',expression:'smile',text:'很好。第一堂我陪你去認門。'},{goto:'end'},
      {label:'n'},{speaker:'classmate_mingxuan',expression:'neutral',text:'好。名額幫你留到月底。'},
      {label:'end'} ] },
  /* 家教的一堂（SYS-13 最小版）：學生家的客廳（2D，圖還沒有）。第一堂：國中生的問題＋旁白（BB_96 3-2，旁白只用 AA_12 0-3 的原意）；
     第二堂：媽媽切的柳丁、你不好意思吃；第三堂：「你不吃，我媽會以為你不喜歡她。」（AA_72 3-3）；之後只有地點字幕。TUTOR_N＝上過幾堂 */
  { id:'ev_tutor_lesson', title:'家教', participants:[], location:'any', trigger:'outing', background:'dark', hours:2,   /* 約好的打工：次數用完也能去；去了那天晚上不能再開始別的主要活動（AA_163、AA_160 2-3）：slotFill 在下面的 after */
    dialogue:[ {scene:'學生家的客廳',bg:'tutor_home'},
      {if:{custom:G=>(G.flags.TUTOR_N|0)===0},speaker:'國中生',text:'老師，課本寫的跟我家發生的事不一樣，那要聽誰的？'},{if:{custom:G=>(G.flags.TUTOR_N|0)===0},speaker:null,text:'你想起自己小時候，也是這樣翻書找答案。'},
      {if:{custom:G=>(G.flags.TUTOR_N|0)===1},speaker:null,text:'（學生的媽媽切了一盤柳丁。你不好意思吃。）'},
      {if:{custom:G=>(G.flags.TUTOR_N|0)===2},speaker:null,text:'（學生的媽媽又切了一盤柳丁。）'},{if:{custom:G=>(G.flags.TUTOR_N|0)===2},speaker:'國中生',text:'你不吃，我媽會以為你不喜歡她。'} ],
    after:G=>{ G.flags.TUTOR_N=(G.flags.TUTOR_N|0)+1; if(typeof CLS!=='undefined'&&CLS.slotFill) CLS.slotFill(G,'ev'); } },   /* 原本有兩個 after，後一個蓋掉前一個（slotFill 沒跑，家教那晚沒佔時段）：合成一個 */
  /* 大一的回聲（BB_134 第 1 節第 4 點、附錄 BB_134a；台詞 BB_96 2-5、BB_108 第 1 節）——W4「已裝滿」便條：空的保溫瓶選了買黑咖啡的玩家，之後一週內在總圖走到學姊旁邊，一句旁白 */
  /* AA_595 第 3 節（3-13；「AA 處理決定」：「已裝滿」那一場跟著空保溫瓶那條線一起拿掉）：retired，不再觸發；定義留給已經演過的舊存檔（flaskCoffeeDay 不再有人讀）*/
  { id:'ev_sis_flask_full', retired:'AA_595 第 3 節（3-13）：空的保溫瓶那條線拿掉，「已裝滿」跟著拿掉；定義留給已經演過的舊存檔', title:'已裝滿', participants:[], location:'lawlib', trigger:'auto', npcNear:'heroine_05', once:true, background:'blur',
    prereq:{custom:G=>G.flags.flaskCoffeeDay!=null&&G.day>G.flags.flaskCoffeeDay&&G.day<=G.flags.flaskCoffeeDay+7},
    dialogue:[ {speaker:null,text:'（她的保溫瓶上貼了一張便條：「已裝滿」。）'} ] },
  /* 學姊「熱水」（BB_207 第 2 節 7b39f636、台詞 AA_261 第 3 節 16919f86）：大一上第 14～15 週（她準備 2026-02-02 研究所筆試），一起念書那晚 21:30～21:45 閉館前（法圖 21:45 閉館會請人出去；AA_284 1-1）、法圖自習室外的走廊；CG BCG-01 沿用。
     「一起念書」＝解鎖了（SIS_STUDY，AA_284 2-3；src/sis_grad3d.js），那晚她在法圖念到閉館（作息：大一上第 14～15 週週一～四 19～21:45 在法圖）、玩家也在法圖。
     「我陪妳等熱水。」＝HOT_WATER；演過空的保溫瓶、選了黑咖啡（HELPED）的「謝謝」前多一句。「我請妳喝一罐。」＝不記；第 16 週以前下一次一起念書的晚上同一個場面再一次（她的第一句「……又空了。」），第二次也沒選就結束 */
  /* loud（D127 小聲講，src/libquiet3d.js）：這一場在法圖自習室外的走廊、飲水機前（AA_595 1-B31：走廊、飲水機旁不算讀書區），不加「（小聲）」*/
  { id:'ev_sis_hot_water', title:'熱水', participants:['heroine_05'], location:'lawlib', trigger:'auto', loud:true, npcNear:'heroine_05', term:['Y1S1'], weeks:[14,15], weekday:[1,2,3,4], time:[21.5,21.75], once:true, priority:9, background:'blur',
    prereq:{custom:G=>SIS_STUDY_OK(G)},
    dialogue:SIS_HOT_WATER('我在算還剩幾天。'),
    consequences:{stamp:['sisHotWaterDay'],memo:'學姊的保溫瓶，熱水'} },
  { id:'ev_sis_hot_water_again', title:'熱水', participants:['heroine_05'], location:'lawlib', trigger:'auto', loud:true, npcNear:'heroine_05', term:['Y1S1'], weeks:[14,15], weekday:[1,2,3,4], time:[21.5,21.75], once:true, priority:9, background:'blur',
    prereq:{custom:G=>SIS_STUDY_OK(G)&&G.flags.sisHotWaterDay!=null&&G.day>G.flags.sisHotWaterDay&&!G.flags.HOT_WATER},
    dialogue:SIS_HOT_WATER('……又空了。') },
  /* 阿凱 K2 的回聲（BB_108 第 1 節 KAI_JOINS_TEST）：K2 之後第二週的晚上回到房間——說好「下次測試我叫你一起」的玩家：「測試。你說好的。」三個小時；其他選項：他自己測，隔天說「你錯過了史上最難的一關」 */
  { id:'ev_kai_test_echo', title:'測試', participants:['kai'], location:'dorm', trigger:'enter', once:true, time:[18,23], background:'blur',
    prereq:{events:['ev_kai_engineer'],custom:G=>{ const d=G.events&&G.events.last&&G.events.last.ev_kai_engineer; return d!=null&&G.day>=d+7&&G.day<=d+14; }},
    dialogue:[ {if:{flags:['KAI_JOINS_TEST']},speaker:'kai',expression:'smile',text:'測試。你說好的。'},{if:{flags:['KAI_JOINS_TEST']},speaker:null,text:'（三個小時，你死了四十次；阿凱記下每一次。）',consequences:{advance:3}},
      {unless:{flags:['KAI_JOINS_TEST']},speaker:'kai',expression:'tired',text:'你錯過了史上最難的一關。'} ] },
  /* 語彤 6：房東來過了（交接包 v2 C12；AA_11 事件 6）：大一下第 10 週以後，第一次在週二或週四晚上去麵店（同班圈固定儀式）；once；玩家一直沒去就不發生。
     流程 1～4 照 AA_11 的字寫成旁白；問的選項只在和語彤有 FIRST_MET 時出現（選項的字 AA 180c8ff 定：「剛剛那個人是誰？」／（不問，低頭吃麵））；問了才記 RENT_RUMOR */
  { id:'ev_yutong_landlord', retired:true /* AA_625 第 6 節（YT-REWRITE-1103）：語彤不在燒臘店——改在一盞茶屋打烊聽她說（src/ytjob3d.js S.rent，記成這一個演過）；定義留給舊存檔 */, title:'房東來過了', participants:['heroine_03'], location:'noodle', trigger:'enter', weekday:[2,4], time:[17.5,20.5], once:true,
    term:['Y1S2'], weeks:[10,11,12,13,14,15], background:'freeze',   /* 只在大一下（AA_11：「事件 6 只在大一下去麵店時發生」）*/
    dialogue:[ {speaker:null,text:'一個穿西裝的中年人拿著捲尺量店面的寬度，跟阿姨講了幾句就走。'},{speaker:null,text:'阿姨把湯勺放下，站著不動，然後又拿起來。'},
      {speaker:'zhe',expression:'neutral',text:'（小聲）那誰？'},{speaker:null,text:'語彤端麵過來。'},{speaker:'阿姨',text:'沒事啦，房東的朋友，來看房子。'},
      {speaker:null,text:'（語彤放下碗）'},{speaker:'heroine_03',expression:'neutral',text:'……嗯。'},
      {unless:{memory:[{npc:'heroine_03',tag:'FIRST_MET'}]},goto:'end'},
      {choice:[{text:'「剛剛那個人是誰？」',goto:'ask'},{text:'（不問，低頭吃麵）',goto:'end'}]},   /* 選項字 AA 180c8ff（玩家說的話）；只有問了才記 RENT_RUMOR */
      {label:'ask'},{speaker:'heroine_03',expression:'neutral',text:'房東想把整棟賣掉。還沒確定。……你吃你的。'},{mem:[{npc:'heroine_03',tag:'RENT_RUMOR',note:'房東想把整棟賣掉，還沒確定'}]},
      {label:'end'} ] },
  /* 以安新 5：舍友的記點申訴（交接包 v2 C8；草稿第 3 節、AA_113 新 5；法律台詞 BB 2026-10-14 查核無誤：學校的內部程序，不寫成行政程序法直接適用）：
     大一下第 5 週平日晚上 19～22 在總圖（她那週的作息），認識以上；四個選項記 AN_APPEAL。結果在第 7 週：總圖見到她就當面說，週五晚上還沒見到就傳訊息（story3d phoneRules）；
     沒遇到的玩家第 7 週在桌遊團群組看到一句（聽說）*/
  { id:'ev_an_dorm_appeal', title:'舍友的記點申訴', participants:['heroine_01'], location:'library', trigger:'interact', priority:9, once:true, term:['Y1S2'], weeks:[5], weekday:[1,2,3,4,5], time:[19,22], prereq:{stage:{npc:'heroine_01',min:'ACQUAINTANCE'}}, background:'blur',
    dialogue:[ {speaker:null,text:'（以安的桌上攤著兩份草稿，劃得很亂。）'},   /* AA_209 附錄A §2 */
      {speaker:null,text:'（她把兩份草稿收起來，指了指外面。你們走到樓梯間。）',libOut:true},   /* libOut（AA_595 1-B6；AA 11-02 22:30 定稿）*/
      {speaker:'heroine_01',expression:'serious',text:'我室友被記點了。晚歸二十分鐘。'},
      {speaker:'heroine_01',expression:'neutral',text:'她陪隔壁寢的同學去急診。記點以前，沒有人問她那天發生什麼事。'},
      {speaker:'heroine_01',expression:'serious',text:'我在幫她寫申訴，寫了兩個版本。你可以幫我看哪裡講不通嗎？直接講沒關係。'},   /* AA_209 附錄A §2 */
      {speaker:'heroine_01',expression:'neutral',text:'一份說規定本身有問題，一份說規定沒問題，只是沒考慮到這種情況。'},   /* AA_209 附錄A §2 */
      {choice:[{text:'「寫第一份。規定錯了，就該改。」',consequences:{flags:{AN_APPEAL:'rule'}},goto:'rule'},{text:'「寫第二份。規定沒錯，是沒想到。」',consequences:{flags:{AN_APPEAL:'case'}},goto:'case'},
        {text:'「先寫一件事：記點以前，應該先問她。」',consequences:{flags:{AN_APPEAL:'ask'}},goto:'ask'},{text:'「我想先聽妳的。」',consequences:{flags:{AN_APPEAL:'listen'}},goto:'listen'}]},
      {label:'rule'},{speaker:'heroine_01',expression:'thinking',text:'可是門禁本身沒錯啊。這樣寫，舍監一看就會擋。'},{speaker:'heroine_01',expression:'thinking',text:'要寫的話，你要證明它對每個人都不合理。'},/* AA_209 第 8 節第 3 點 */{speaker:null,text:'（她在第一份旁邊畫了一個問號。）'},{goto:'end'},   /* AA_209 附錄A §2 */
      {label:'case'},{speaker:'heroine_01',expression:'smile',text:'我也比較想寫這份。那你挑挑看，哪裡會被打回來？'},{goto:'end'},   /* AA_209 附錄A §2 */
      {label:'ask'},{speaker:null,text:'（她停住，在草稿最上面寫了一行。）'},/* AA_209 附錄A §2 */{speaker:'heroine_01',expression:'neutral',text:'先問。……對，要先問。'},{goto:'end'},
      {label:'listen'},{speaker:'heroine_01',expression:'neutral',text:'好，我先說。'},{speaker:'heroine_01',expression:'neutral',text:'我最討厭『規定就是規定』這種話。我家以前很多事都這樣，不解釋。'},   /* AA_209 附錄A §2（AA_194 第 1 節要補的那句）*/
      {label:'end'} ] },
  /* 以安「四年，四張」的第一張（交接包 v2 C7；AA_71 2-9「大一的台詞」）：大一下第 3 週週六上午，椰林大道的杜鵑開了（她那個上午在椰林大道：characters.js 的作息）。
     和她有點熟以上＝她請你拍；還不熟＝她請 Alison 拍、你在旁邊看到。芷若、子晴那兩句只給兩個人都認識的玩家（AA：和祐廷無關的一句）。
     旁白只用 AA 的字（「椰林大道的杜鵑開了」「拿著手機」「她把手機遞給你」「拍完她看了一下」「她請 Alison 拍」「芷若拿著手機在拍花」）。之後三年照 AA_71 2-9（大三、大四以後做）*/
  /* 沛珊和柏翰（交接包 v2 C21 第一個畫面；草稿第 3 節、BB_100 2-3，使用者 2026-10-13 定案：沛珊大一下和柏翰交往，玩家只看到一部分，沒有選項會讓他們在一起或分開）：
     大一下第 4 週法服讀書會結束（afterActivity，classes3d.js 的 afterActEvent）——她和柏翰一起走出萬才館，一路在爭下週誰報告哪一題；祐廷在後面收白板。只有畫面（旁白用原文的描述）。
     還沒認識沛珊的玩家沒有。第二個畫面（期中的麵店長桌）跟大一下期中的宵夜一起做 */
  { id:'ev_peishan_bohan_w4', title:'走出法律系館B', participants:['classmate_peishan','classmate_bohan'], location:'wancai', trigger:'activity', afterActivity:'public_law_group',   /* BB_191 §8-7：大一下第 4 週週四公法讀書會散場（原本週三法服讀書會）*/ term:['Y1S2'], weeks:[4], once:true, prereq:{memory:[{npc:'classmate_peishan',tag:'FIRST_MET'}]}, background:'blur',   /* AA_409 第 2 節：和她交往中＝她等你收白板那一版（原本 AA_245 第 3 節交往中不演）*/
    dialogue:[ {unless:{flags:['dating_classmate_peishan']},speaker:null,text:'（讀書會結束。沛珊和柏翰一起走出法律系館B，一路在爭下週誰報告哪一題。）'},{unless:{flags:['dating_classmate_peishan']},speaker:null,text:'（你在後面收白板。）'},
      {if:{flags:['dating_classmate_peishan']},speaker:null,text:'（讀書會結束。你收白板的時候，沛珊站在門口等。）'},{if:{flags:['dating_classmate_peishan']},speaker:'classmate_peishan',text:'今天那一題你講得很好，我找不到地方吐槽。再多講一點。'},{if:{flags:['dating_classmate_peishan']},speaker:null,text:'（你們一起走出法律系館B。柏翰走在前面，一個人。）'} ] },
  /* 主線 2（交接包 v2 C2）：除夕（STORY.lunarNewYear 的前一天，2026-02-16）。固定節點：除夕 12:00 以後、人有空就演（auto，在哪裡都可以——家裡用 2D）；
     如果除夕還沒演就上床，睡覺時演（sleep）。事件 id 照舊是 ev_chiayi_*（存檔的 events.done 記這個 id，改名會讓舊存檔再演一次）。事件 id 照舊是 ev_chiayi_*（存檔的 events.done 記這個 id，改名會讓舊存檔再演一次）。演完時間往後 2 小時。記全域旗標 FAMILY_LAND_Y1（teacher／ask／lawyer；大三主線 9、大二上物權第 7 週的回想讀它）*/
  { id:'ev_chiayi_land_y1', title:'親戚的土地資料', participants:[], location:'any', trigger:'auto', priority:9, time:[12,24], once:true, background:'dark',
    prereq:{custom:G=>typeof STORY!=='undefined'&&!!STORY.lunarNewYear&&STORY.lunarNewYear()!=null&&G.day===STORY.lunarNewYear()-1&&!G.flags.FAMILY_LAND_Y1&&(typeof HOME==='undefined'||!HOME.lawBreak||!HOME.lawBreak(G)||HOME.at(G))},   /* 16 週制寒假可以留宿舍（AA_197 1-2）：主線 2 在家演——人在宿舍的，17:00 回家以後才演 */
    dialogue:LAND_Y1, consequences:{advance:2} },
  { id:'ev_chiayi_land_y1_bed', title:'親戚的土地資料', participants:[], location:'any', trigger:'sleep', priority:9, once:true, background:'dark',
    prereq:{custom:G=>typeof STORY!=='undefined'&&!!STORY.lunarNewYear&&STORY.lunarNewYear()!=null&&G.day===STORY.lunarNewYear()-1&&!G.flags.FAMILY_LAND_Y1&&!(G.events&&G.events.done&&G.events.done.ev_chiayi_land_y1)},
    dialogue:LAND_Y1 },
  /* 春假三選一（交接包 v2 C9；草稿第 3 節「春假」）——可昕 K8 開車旅行（BB_96 9-5）：第 5 週選了「和可昕開車旅行」＝4/3 早上 8:00 出遊（story3d.js 的 springChoose）。一天來回、不演住宿。
     車上的規則 → 目的地三選一（山上看星星只給第 6 週天文課有去的玩家：CLS.attendedWeek 'Y1S2:ge_y1s2:w6'，那一堂有同學說「連假的時候，我要去山上看星星。」）→ 到了（2D，依目的地）一題假設題、
     怎麼接都可以 → 回程（車上，晚上）。記 KX_TRIP:{Y1S2:'sea'|'oldtown'|'stars'}。旅行的照片（房間物件）：照片上寫的字照 BB-B 定稿，在 story3d.js 的房間物件 */
  { id:'ev_kexin_trip_spring_y1', title:'春假：開車旅行', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:13.5,   /* 07:40 政大校門接她 → 08:00 出發 … 晚上送她回政大、車開回家（AA_147 #1；台詞不改）*/
    dialogue:[ {scene:'女生宿舍樓下',bg:'dark'},{scene:'車上',bg:'car'},   /* CANON-NO-ECON-1112 第四批（AA_877 #4）：早上到女生宿舍樓下接她、晚上送回宿舍 */
      {speaker:'kexin',expression:'smile',text:'規則。我管音樂，你管方向。'},
      {speaker:'kexin',expression:'teasing',text:'誰都不能管對方的。目的地，現在決定。'},   /* AA_373 #11：她傳過「我做了行程表。第二頁是我想吃的，第三頁才是行程。」*/
      {choice:[{text:'海邊',set:{KX_TRIP_Y1S2:'sea'},goto:'d_sea'},{text:'別的城市的老街',set:{KX_TRIP_Y1S2:'oldtown'},goto:'d_old'},
        {text:'山上看星星',if:{custom:G=>typeof CLS!=='undefined'&&!!CLS.attendedWeek&&CLS.attendedWeek(G,'Y1S2:ge_y1s2:w6')},set:{KX_TRIP_Y1S2:'stars'},goto:'d_star'}]},
      {label:'d_sea'},{speaker:'kexin',expression:'smile',text:'好。我要把腳弄濕。'},{scene:'海邊',bg:'trip_sea'},
      {speaker:'kexin',expression:'teasing',text:'水好冰。你要不要下來？'},
      {choice:[{text:'「我在這裡看就好。」',goto:'s1'},{text:'「好，我下去。」',goto:'s2'},{text:'「妳腳濕了。」',goto:'s3'}]},
      {label:'s1'},{speaker:'kexin',expression:'smile',text:'好，那你幫我拿鞋子。'},{speaker:null,text:'她又往海走了兩步。'},{goto:'back'},
      {label:'s2'},{speaker:'kexin',expression:'smile',text:'真的很冰喔。'},{goto:'back'},
      {label:'s3'},{speaker:'kexin',expression:'teasing',text:'對，濕了。好冰。'},/* AA_209 附錄B §2 */{goto:'back'},
      {label:'d_old'},{speaker:'kexin',expression:'smile',text:'每一家都說自己是老店。我們去查證。'},{scene:'老街',bg:'trip_oldtown'},
      {speaker:'kexin',expression:'teasing',text:'你想先吃哪一家？'},
      {choice:[{text:'「牆上照片最舊的那家。」',goto:'o1'},{text:'「人最多的那家。」',goto:'o2'},{text:'「都吃。」',goto:'o3'}]},
      {label:'o1'},{speaker:'kexin',expression:'smile',text:'好。這家的證據是牆上的照片，我信了。'},{goto:'back'},
      {label:'o2'},{speaker:'kexin',expression:'smile',text:'那要排很久。……排就排。'},{goto:'back'},
      {label:'o3'},{speaker:'kexin',expression:'teasing',text:'好。那我們要多吃幾家。'},{goto:'back'},
      {label:'d_star'},{speaker:'kexin',expression:'teasing',text:'看星星？臺北根本看不到幾顆。好，我們去看山上有沒有比較多。'},/* AA_877 #4（BB_419）：不靠通識課 */{scene:'山上',bg:'trip_mountain'},
      {speaker:'kexin',expression:'teasing',text:'今天的月亮好亮。……你上次認真看月亮，是什麼時候？'},
      {choice:[{text:'「中秋吧。」',goto:'m1'},{text:'「現在。」',goto:'m2'},{text:'「跟妳一起看的時候。」',goto:'m3'}]},
      {label:'m1'},{speaker:'kexin',expression:'teasing',text:'那是過節。不算。'},{goto:'back'},
      {label:'m2'},{speaker:'kexin',expression:'smile',text:'好。那現在算第一次。'},{goto:'back'},
      {label:'m3'},{speaker:'kexin',expression:'smile',text:'好。那每天晚上都要一起看。'},
      {label:'back'},{scene:'車上',bg:'car'},
      {speaker:'kexin',expression:'smile',text:'我不睡。我要陪你開車。'},
      {cg:'cg_dont_sleep_kexin'},   /* BCG-29（BB 10-14 通過；cg_approved/README：放在「過了收費站」這句、三個目的地共用）*/
      {speaker:null,text:'過了收費站，她睡著了。音樂還是她選的。'} ],
    after:G=>{ const k=G.flags.KX_TRIP_Y1S2; if(k){ const T=(G.flags.KX_TRIP&&typeof G.flags.KX_TRIP==='object')?G.flags.KX_TRIP:{}; T.Y1S2=k; G.flags.KX_TRIP=T; } } },
  /* 春假桌遊團那一趟（交接包 v2 C9；AA 71186c7）：4/3～4/4，住一晚民宿。地點「海邊的小鎮」（不寫真實地名；字幕「春假・海邊的小鎮」，背景 seaside_town 在 MISSING_EXTERNAL_ART）。
     旁白和台詞照 AA 的六句（括號裡的寫成旁白；「最後阿哲說：」拆成旁白＋他的台詞）；在場的是桌遊團裡玩家認識的人（不認識 Alison：第五句只留「阿哲睡過頭」）。
     兩天一夜：演完以後 STORY.travelOvernight 把時間推到第二天傍晚（住在民宿那一晚不在宿舍，不演宿舍的夜晚事件）*/
  { id:'ev_noodle_trip_spring_y1', title:'春假・小旅行', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:0.5,
    dialogue:[ {scene:'春假・海邊的小鎮',bg:'seaside_town'},
      {speaker:null,text:'火車上，四個位子怎麼坐，討論了一整站。最後阿哲說：'},{speaker:'zhe',expression:'smile',text:'猜拳。'},
      {speaker:null,text:'到的第一天就下雨。'},
      {if:EV_KNOWS('heroine_01'),speaker:'heroine_01',expression:'neutral',text:'好，下午改去室內的地方，我再排一下。'},   /* AA_209 附錄A §2 */
      {if:{flags:['dating_heroine_01']},speaker:'heroine_01',expression:'smile',text:'（她小聲對你說）你想去哪？我照你的排。'},   /* 和以安交往中（AA_71 2-10，AA-C e2bdcece；AA_216 大一下 #7）*/
      {speaker:null,text:'雨停的空檔，大家在堤防上排成一排拍照。'},
      {if:EV_KNOWS('yu'),speaker:null,text:'第二天早上，阿哲睡過頭，Alison 在門外敲了五分鐘。'},{unless:EV_KNOWS('yu'),speaker:null,text:'第二天早上，阿哲睡過頭。'},
      {speaker:null,text:'民宿老闆很熱情，每個人多拿了一顆茶葉蛋。'} ],
    consequences:{memo:'春假：和阿哲他們去海邊的小鎮（兩天一夜）'},
    afterOuting:async(G,GM,q)=>{ if(typeof STORY!=='undefined'&&STORY.travelOvernight) STORY.travelOvernight(GM,q.day+1,16.5); } },
  /* 春假留在宿舍（交接包 v2 C9）：選了留在宿舍的玩家，4/3 白天走進宿舍時出現一次（AA 71186c7）*/
  { id:'ev_spring_dorm_empty_y1', title:'春假', participants:[], location:['dorm','dorm_hall'], trigger:'enter', once:true, background:'freeze',
    prereq:{custom:G=>G.flags.SPRING_Y1==='dorm'&&typeof STORY!=='undefined'&&!!STORY.springDays&&G.day===STORY.springDays().d0&&G.hour>=6&&G.hour<18},
    dialogue:[ {speaker:null,text:'宿舍變得很空。'} ] },
  /* 重訪日 1（交接包 v2 C20；草稿第 3 節、AA_12）——可昕的版本（BB_96 9-10）：大一最後一天（第 18 週最後一天，STORY.revisitDay），交往中的玩家
     她中午傳「最後一天。你說的那張桌子，我六點到。」（story3d.js phoneRules），18:00 以後人在兩點半 Café 就演（auto；早到的等到六點）。
     題目、選項照第 3 節的表（REVISIT_Y1_OPTS：只出經歷過的事，最多三個＋一定有的那一個）；她的回應照 BB 的表；中秋烤肉看 K3 有沒有來（KX_MET_NOODLE_TEAM）；
     她自己的那一件：BB_167 4-3（4-2 附錄第 35 列，1376b5f8）改了句子：「我本來以為我們會一直吵架。」之後，做過 K6 互考（KX_K6_EXAM；舊存檔有 KX_QUIZ 也算）＝「結果都在吵考古題。」，沒有＝「結果都在吵我出的考題。」（AA_295）（AA-C 2026-10-17 04:36 確認保留分支）。記 REVISIT_Y1:{who:'kexin',pick}（大四主線 10 讀它）。
     冷戰（AA_112 第 6 節的裂縫）還沒有系統：目前交往中都算她能來。桌遊團併桌、單身的版本不做（重訪日 2026-10-17 停用；AA_355 第 3 節）*/
  { id:'ev_revisit_y1_kexin', retired:'使用者 2026-10-17 取消重訪日（AA_249：改成學期末聚餐與寒暑假邀約，跟 HOLIDAY-SYS 一起做）：停用，舊存檔的 REVISIT_Y1 留著、不再讀', title:'重訪日', participants:['kexin'], location:'cafe', trigger:'auto', priority:8, term:['Y1S2'], time:[18,22], once:true, background:'blur',
    prereq:{flags:['dating_kexin'],custom:G=>typeof STORY!=='undefined'&&!!STORY.revisitDay&&G.day===STORY.revisitDay()&&!G.flags.REVISIT_Y1},
    dialogue:[ {speaker:'kexin',expression:'smile',text:'（坐下）一年了欸。'},
      {speaker:'kexin',expression:'smile',text:'你這一年，哪一天印象最深？'},   /* BB_167 4-3：只改問法，八段回憶和她的回應照留（AA_192 的例外）*/
      REVISIT_Y1_CHOICE('k_'),
      {label:'k_retake'},{speaker:'kexin',expression:'smile',text:'一年前你也坐在那間教室。……這次你待到最後了。'},{goto:'mine'},
      {label:'k_bbq'},{if:{flags:['KX_MET_NOODLE_TEAM'],custom:G=>G.flags.KX_JOKE!=='zhe'},speaker:'kexin',expression:'teasing',text:'那天阿哲輸給我三個冷笑話。'},{if:{flags:['KX_MET_NOODLE_TEAM'],flagIs:{KX_JOKE:'zhe'}},speaker:'kexin',expression:'teasing',text:'那天我輸給阿哲。我回去練了。'},   /* AA_313 第 2 節第 30 列：中秋選「阿哲贏」（KX_JOKE='zhe'）的換句；可昕贏的照舊（她來過一定有 KX_JOKE）*/{unless:{flags:['KX_MET_NOODLE_TEAM']},speaker:'kexin',expression:'teasing',text:'我只看過照片。玉米還是我們系的好。'},{goto:'mine'},
      {label:'k_noodle'},{speaker:'kexin',expression:'smile',text:'你講了一整年的燒臘。開學帶我去。'},{goto:'mine'},
      {label:'k_appeal'},{speaker:'kexin',expression:'smile',text:'你們系的人，連宿舍的事都寫成申訴書。……我喜歡。'},{goto:'mine'},
      {label:'k_rain'},{speaker:'kexin',expression:'smile',text:'那天的雨很大。你後來有沒有感冒？'},{goto:'mine'},
      {label:'k_lecture'},{speaker:'kexin',expression:'smile',text:'你說講者最後問的那一題，我也想了很久。'},{goto:'mine'},
      {label:'k_show'},{speaker:'kexin',expression:'teasing',text:'你負責拍手喔？那你有拍到手痛嗎？'},{goto:'mine'},   /* SC4 #8 */
      {label:'k_daily'},{speaker:null,text:'她嘴角先動了。'},{speaker:'kexin',expression:'smile',text:'嗯，我也是。'},   /* SC4 #35 */
      {label:'mine'},{speaker:'kexin',expression:'smile',text:'我喔？我本來以為我們會一直吵架。'},{if:{custom:G=>!!G.flags.KX_K6_EXAM||!!(G.flags.KX_QUIZ&&((G.flags.KX_QUIZ.win|0)+(G.flags.KX_QUIZ.lose|0)+(G.flags.KX_QUIZ.draw|0))>0)},speaker:'kexin',expression:'teasing',text:'結果都在吵考古題。'},
      {unless:{custom:G=>!!G.flags.KX_K6_EXAM||!!(G.flags.KX_QUIZ&&((G.flags.KX_QUIZ.win|0)+(G.flags.KX_QUIZ.lose|0)+(G.flags.KX_QUIZ.draw|0))>0)},speaker:'kexin',expression:'teasing',text:'結果都在吵要吃哪一家。'} ],   /* AA_313 第 2 節第 30 列：她不出假設題了，沒做互考的玩家沒看過她出題（原本「結果都在吵我出的考題。」）*/   /* BB_167 4-3（SC4 #35）；分支照 BB_96 9-10 保留（AA-C 2026-10-17 04:36：BB_167 只改了考古題那一支，沒做互考的版本＝「結果都在吵我出的考題。」（AA_295 前是「假設題」），BB-C 審口氣中）*/
    after:G=>{ G.flags.REVISIT_Y1={who:'kexin',pick:G.flags.REVISIT_Y1_PICK||'daily'}; } },
  /* 重訪日 1——桌遊團的群戲（AA_209 第 3 節，AA 分支 096136d2；使用者 AA_193 第 4 節：保留大一最後一天 18:00 的麵店聚會，拿掉「這一年最意外的一件事」）：
     6/12（五）期末最後一科考完，18:00 阿鳳麵店（17:00 阿哲在群組揪，story3d.js phoneRules）。不是輪流報告暑假計畫：有人接話、沒回答、先走。
     在場：阿哲、Alison、柏翰（桌遊團）、語彤（幫忙端麵）；以安、芯慈認識才在；沛珊和柏翰交往中、玩家認識她才有她的那句旁白。
     記 REVISIT_Y1:{who:'noodle_team',pick:'none'}（原本的 8 個回憶選項拿掉，REVISIT_Y1_PICK 記 'none'）；在場的人熟悉 +1 */
  { id:'ev_revisit_y1_noodle', retired:'使用者 2026-10-17 取消重訪日（AA_249：改成學期末聚餐與寒暑假邀約，跟 HOLIDAY-SYS 一起做）：停用，舊存檔的 REVISIT_Y1 留著、不再讀', title:'重訪日', participants:['zhe'], location:'noodle', trigger:'auto', priority:8, term:['Y1S2'], time:[18,22], once:true, background:'blur',
    prereq:{custom:G=>typeof STORY!=='undefined'&&!!STORY.revisitDay&&G.day===STORY.revisitDay()&&!G.flags.REVISIT_Y1&&!G.flags.dating_kexin&&typeof PHONE!=='undefined'&&PHONE.inGroup(G,'noodle_team')},
    dialogue:[ {scene:'公館燒臘・長桌',bg:'noodle_table'},
      {speaker:null,text:'（期末最後一科考完。長桌已經併好了。）'},{speaker:null,text:'（阿姨多放了一碟燙青菜，說是煮多了。）'},   /* AA_519 1-3：送小菜的旁白第二處＝第 1 句（拆成兩句：前面那半句照舊）*/
      {speaker:'zhe',text:'欸暑假誰在臺北？我七月一號就回高雄了。'},
      {speaker:'yu',text:'我七月要去營隊當隊輔，兩個禮拜。'},
      {speaker:'yu',text:'誰要來探班？'},
      {speaker:null,text:'（沒有人回答。柏翰在滑手機。）'},
      {speaker:'classmate_bohan',text:'成績二十九號才出來。'},
      {speaker:'zhe',text:'你很掃興欸。'},
      {if:EV_KNOWS('heroine_01'),speaker:'heroine_01',text:'我暑假想把民總再讀一次。'},
      {if:EV_KNOWS('heroine_01'),speaker:'yu',text:'妳考完第一天就講這個喔。'},
      {if:EV_KNOWS('classmate_xinci'),speaker:'classmate_xinci',text:'我爸問我暑假要不要去事務所幫忙。我還沒回他。'},
      {if:EV_KNOWS('classmate_xinci'),speaker:'zhe',text:'去啊，有冷氣。'},
      {speaker:null,text:'（語彤端著兩碗麵過來。）'},
      {speaker:'heroine_03',text:'誰的乾麵？'},
      {choice:[{text:'「我的。」',goto:'r1'},{text:'「我暑假應該都在臺北。」',goto:'r2'},{text:'（先吃麵）',goto:'rest'}]},
      {label:'r1'},{speaker:null,text:'（她把碗放下，又回廚房了。）'},{goto:'rest'},
      {label:'r2'},{speaker:'zhe',text:'好，那暑假燒臘店就靠你了。'},
      {label:'rest'},
      {if:EV_KNOWS('classmate_peishan'),speaker:null,text:'（沛珊坐在柏翰旁邊，把他碗裡的蔥挑到自己碗裡。）'},
      {speaker:'yu',text:'柏翰你暑假回新竹喔？'},
      {speaker:'classmate_bohan',text:'週四會上來。總圖。'},
      {if:EV_KNOWS('classmate_xinci'),speaker:null,text:'（八點多，芯慈先站起來。）'},
      {if:EV_KNOWS('classmate_xinci'),speaker:'classmate_xinci',text:'我先走了，明天要早起。成績出來再傳群組。'},
      {speaker:null,text:'（後來大家又坐了快一個小時。阿姨收碗的時候，桌上還剩半盤豆干。）'} ],
    after:G=>{ G.flags.REVISIT_Y1_PICK='none'; G.flags.REVISIT_Y1={who:'noodle_team',pick:'none'};
      if(typeof SOCIAL!=='undefined'&&SOCIAL.adjust) for(const id of ['zhe','yu','classmate_bohan','heroine_03','heroine_01','classmate_xinci','classmate_peishan']) if(typeof STORY==='undefined'||!STORY.knows||STORY.knows(id,G)) SOCIAL.adjust(id,{fam:1}); } },
  /* 重訪日 1——單身、不在桌遊團的版本（AA 50da3a9、d1fa44f；BB_96 第 11 節 b7c89d1）：這一年最親近的人（STORY.revisitClosest：先看階段、再看熟悉；學姊、沛珊這時有伴侶，不算）。
     男生：窗邊雙人桌坐他，玩家說完他也說一件。女生：祐廷一個人坐窗邊，她 18:00 傳來訊息（story3d.js phoneRules），之後一樣有題目和選項。
     都還不到「有點熟」：一個人坐窗邊，題目寫在筆記本上；「這張桌子，從今天開始是你的位子。」（旁白照 AA 的描述寫成句子）。
     阿哲、以安、語彤、Alison、芯慈（AA 的人物）的台詞：AA 2100018（2026-10-14 補）。記 REVISIT_Y1:{who,pick} */
  { id:'ev_revisit_y1_single', retired:'使用者 2026-10-17 取消重訪日（AA_249：改成學期末聚餐與寒暑假邀約，跟 HOLIDAY-SYS 一起做）：停用，舊存檔的 REVISIT_Y1 留著、不再讀', title:'重訪日', participants:[], location:'cafe', trigger:'auto', priority:8, term:['Y1S2'], time:[18,22], once:true, background:'blur',
    prereq:{custom:G=>typeof STORY!=='undefined'&&!!STORY.revisitDay&&G.day===STORY.revisitDay()&&!G.flags.REVISIT_Y1&&!G.flags.dating_kexin&&!(typeof PHONE!=='undefined'&&PHONE.inGroup(G,'noodle_team'))},
    dialogue:[ {if:{custom:G=>STORY.revisitClosest(G).kind==='male'},goto:'q'},
      {speaker:null,text:'你一個人坐在窗邊。'},
      {if:{custom:G=>STORY.revisitClosest(G).kind==='none'},speaker:null,text:'你在筆記本上寫了一行。'},
      {label:'q'},   /* AA_209／BB_167 4-3：拿掉「這一年最意外的一件事」和 8 個回憶選項，改聊暑假、回不回家、打工 */
      {if:{custom:G=>STORY.revisitClosest(G).id==='classmate_bohan'},goto:'bohan'},{if:{custom:G=>STORY.revisitClosest(G).id==='zhe'},goto:'zhe'},
      {if:{custom:G=>STORY.revisitClosest(G).id==='kai'},goto:'kai'},
      {if:{custom:G=>STORY.revisitClosest(G).id==='classmate_mingxuan'},goto:'mx'},{if:{custom:G=>STORY.revisitClosest(G).id==='npc_fangyt'},goto:'fy'},
      {if:{custom:G=>STORY.revisitClosest(G).kind==='none'},speaker:null,text:'這張桌子，從今天開始是你的位子。'},{goto:'end'},
      {label:'bohan'},{speaker:'classmate_bohan',expression:'neutral',text:'成績二十九號才出來。'},{speaker:'classmate_bohan',expression:'neutral',text:'我暑假回新竹，禮拜四會上來總圖。你要的話可以一起。'},{goto:'end'},   /* AA-B 02:23 */
      {label:'zhe'},{if:{flags:['ZHE_CALLS_GE']},speaker:'zhe',expression:'smile',text:'哥，我七月一號就回高雄了。'},{unless:{flags:['ZHE_CALLS_GE']},speaker:'zhe',expression:'smile',text:'欸我七月一號就回高雄了。'},{speaker:'zhe',expression:'smile',text:'你暑假在臺北喔？那我回來再找你吃燒臘。'},{goto:'end'},
      {label:'kai'},{if:{custom:G=>!!G.flags.KAI_TAPE&&!(typeof SOCIAL!=='undefined'&&SOCIAL.friendLevel&&SOCIAL.friendLevel('kai')==='CLOSE_FRIEND')},goto:'kai1'},
      {speaker:'kai',expression:'neutral',text:'暑假你回家喔？'},{speaker:'kai',expression:'neutral',text:'我留在臺北，接了一個修電腦的打工。'},{goto:'end'},
      {label:'kai1'},{speaker:'kai',expression:'neutral',text:'暑假要搬了。地上那條膠帶，我拍了一張才撕。'},{goto:'end'},
      {label:'mx'},{speaker:'classmate_mingxuan',expression:'neutral',text:'暑假我接了兩個家教。'},{speaker:'classmate_mingxuan',expression:'laugh',text:'哈哈，這樣就存得到錢了。'},{goto:'end'},
      {label:'fy'},{if:{flags:['POTHOS']},goto:'fy1'},{speaker:'npc_fangyt',expression:'neutral',text:'我暑假要上山做調查，兩個禮拜沒訊號。有事先傳，我下山再回。'},{goto:'end'},
      {label:'fy1'},{speaker:'npc_fangyt',expression:'neutral',text:'我暑假要上山做調查，兩個禮拜沒訊號。'},{speaker:'npc_fangyt',expression:'neutral',text:'黃金葛記得澆，一週一次就好。'},
      {label:'end'} ],
    after:G=>{ const c=STORY.revisitClosest(G); G.flags.REVISIT_Y1_PICK='none'; G.flags.REVISIT_Y1={who:c.id||'alone',pick:'none'}; } },
  /* 學姊 W5「她改的便條」（BB_96 2-6；交接包 v2）：大一下第 15 週週三（6/3，AA_198 第 5 節）的法服學期檢討會（activities.js 的 lawclub_review_y1s2）之後；前置 lawclub、法服讀書會去過 3 次以上、只一次。
     去了檢討會：會後接著演（afterActivity）；沒去的社員：第 17～18 週第一次在晚上走進萬才館（BB_161 ③），開頭兩句換成「（聽說這週的檢討會很安靜。）」「（你經過萬才館的研討室……）」其他照舊。流程的描述寫成旁白。
     記 NOTICED_HER（W8 的伏筆）／GAVE_HER_NOTE（寫了什麼記在備註；回收見 BB_108）*/
  { id:'ev_sis_sticky_notes', retired:'使用者 2026-10-17（AA_218 17-1，AA-C 07:18）：刪除 W5 便條——「大學誰會寫書狀；這種批鬥大會根本不符合她的個性」。舊存檔已經看過的旗標保留（NOTICED_HER、GAVE_HER_NOTE、記憶），不重播', title:'她改的便條', participants:['heroine_05'], location:'wancai', trigger:'activity', afterActivity:'lawclub_review_y1s2', term:['Y1S2'], weeks:[15], once:true, background:'blur',
    prereq:{flags:['lawclub'],custom:G=>W5_OK(G)},
    dialogue:[ {speaker:null,text:'檢討會上，學姊對一年級的書狀列了十二條缺點，大家臉都很僵。'}].concat(W5_REST) },
  /* BB_161 ③：沒去檢討會的社員＝第 15～16 週第一次在晚上（18:00 以後）走進萬才館；開頭兩句換成 BB-B 新寫的，接著從「你的書狀上：……」照原文 */
  { id:'ev_sis_sticky_notes_late', retired:'使用者 2026-10-17（AA_218 17-1，AA-C 07:18）：刪除 W5 便條——「大學誰會寫書狀；這種批鬥大會根本不符合她的個性」。舊存檔已經看過的旗標保留（NOTICED_HER、GAVE_HER_NOTE、記憶），不重播', title:'她改的便條', participants:['heroine_05'], location:'wancai', trigger:'enter', term:['Y1S2'], weeks:[15,16], time:[18,23.5], once:true, background:'blur',
    prereq:{flags:['lawclub'],custom:G=>{ if(!W5_OK(G)) return false; const r=typeof STORY!=='undefined'&&STORY.termDay?STORY.termDay('Y1S2',15,3):null; if(r!=null&&G.day===r&&G.hour<21) return false; return !(typeof ACTIVITIES!=='undefined'&&ACTIVITIES.attendedAny&&ACTIVITIES.attendedAny(G,'lawclub_review_y1s2')); }},   /* 檢討會那天（第 17 週週三）21:00 以前還在開會 */
    dialogue:[ {speaker:null,text:'（聽說這週的檢討會很安靜。）'},{speaker:null,text:'（你經過法律系館B的研討室。學姊一個人坐在裡面，在每份書狀上貼便條。）'}].concat(W5_REST.slice(1)) },
  /* 子晴 Q5「你負責拍手」（BB_96 4-4、AA_13 G3；交接包 v2）：大一下第 14 週週三的吉他社成發（activities.js 的 guitar_show_y1s2，去看就演）；認識子晴才有。
     演出中三選一（介面的動作）：拍手＝CLAPPED（她下台說的那句＋插座貓貼紙：雙方都單身、和她朋友以上＝直接貼在你的手機殼上，其他＝遞給你）／坐著聽完＝她點頭「你有來。」／先走＝隔天手機「你看到一半。後半比較好。」。
     沒去（收到邀請或是吉他社的人）：隔天手機「你沒來」（沒有標點）。記 ZQ_SHOW（clap／came／half／absent；大二 Q9 讀它）。BCG-11（舞台上她按錯和弦後對著麥克風笑）還沒有圖 */
  { id:'ev_ziqing_show', title:'你負責拍手', participants:['heroine_04'], location:'wancai', trigger:'activity', term:['Y1S2'], once:true, background:'blur',
    prereq:{memory:[{npc:'heroine_04',tag:'FIRST_MET'}]},
    dialogue:[ /* AA_13 G3 期末成發的觀眾席（AA13-G3-SHOWCASE-1031；子晴的台詞照 BB_96，這裡只加其他人）：阿凱、Alison（吉他社，她第三首）。芷若（坐後排）「我是被她押來的。」：AA-B 11-01 定條件＝祐廷和芷若有點熟以上 */
      {if:{memory:[{npc:'kai',tag:'FIRST_MET'}]},speaker:null,text:'（阿凱坐第一排，手上拿著手機錄影。）'},{if:{memory:[{npc:'kai',tag:'FIRST_MET'}]},speaker:'kai',text:'我是來錄證據的。她說彈錯要請宵夜。'},
      {if:{memory:[{npc:'yu',tag:'FIRST_MET'}]},speaker:'yu',text:'我等一下第三首。我好緊張，我要吐了。'},
      {if:{custom:G=>typeof SOCIAL!=='undefined'&&['FAMILIAR','FRIEND','CLOSE_FRIEND'].includes(SOCIAL.friendLevel('heroine_02'))},speaker:null,text:'（芷若坐在後排。）'},{if:{custom:G=>typeof SOCIAL!=='undefined'&&['FAMILIAR','FRIEND','CLOSE_FRIEND'].includes(SOCIAL.friendLevel('heroine_02'))},speaker:'heroine_02',text:'我是被她押來的。'},   /* AA-B 11-01：子晴和芷若是摯友（同寢），條件改成祐廷和芷若有點熟以上 */
      {speaker:null,text:'（後台。）'},
      {speaker:'heroine_04',expression:'serious',text:'欸不是，我手在抖。'},
      {speaker:'heroine_04',expression:'neutral',text:'我寫程式從來不抖。'},
      {if:DH('heroine_04'),speaker:'heroine_04',expression:'neutral',text:'你坐第三排，我剛剛看到了。不要換位子。'},   /* BB_187 2-3：和她交往中，後台那句之後多一句（表情不用 embarrassed：她的第一次留給按錯和弦那一秒，BB_96 4-4）*/
      {speaker:'heroine_04',expression:'embarrassed'},{speaker:null,text:'（第二首，她按錯一個和弦。全場安靜一秒。她自己先笑出來。）'},
      {cg:'cg_bug_fix_heroine04'},   /* BCG-11（BB_117：按錯和弦、她自己先笑出來、對著麥克風說話的那一秒；在場就看得到，拍不拍手都算）*/
      {speaker:'heroine_04',expression:'laugh',text:'（對著麥克風）這個 bug 我下次修。'},
      {speaker:null,text:'（全場笑。）'},
      {choice:[{text:'（拍手）',set:{ZQ_SHOW:'clap'},goto:'clap'},{text:'（坐著聽完）',set:{ZQ_SHOW:'came'},goto:'came'},{text:'（先走）',set:{ZQ_SHOW:'half'},goto:'end'}]},
      {label:'clap'},{unless:DH('heroine_04'),speaker:'heroine_04',expression:'laugh',text:'我有看到你。你拍超大聲，很丟臉。……不過謝啦。'},{if:DH('heroine_04'),speaker:'heroine_04',expression:'laugh',text:'我有看到你。很丟臉。……不過謝啦。'},   /* AA-B 11-01：和她交往中拿掉「你拍得超大聲。」，接後面那句「你拍超大聲欸。整個大廳都聽到了。」，不說兩次 */
      /* BB_187 2-3（AA_554 第 2 節：「B館」→「大廳」）：和她交往中，謝幕後、貼紙那段之前多兩句（只在拍手的這一支：「你拍超大聲」）。
         貼紙：和她交往中＝直接貼在手機殼上（大二 Q9「去年那一張旁邊」接得上）；「遞給你」那一版＝和別人交往中，照舊 */
      {if:DH('heroine_04'),speaker:'heroine_04',expression:'laugh',text:'你拍超大聲欸。整個大廳都聽到了。'},{if:DH('heroine_04'),speaker:'heroine_04',expression:'embarrassed',text:'……好啦。我很高興。'},
      {if:{custom:G=>DHN(G,'heroine_04')||(!GFN(G,'heroine_04')&&typeof SOCIAL!=='undefined'&&['FRIEND','CLOSE_FRIEND'].includes(SOCIAL.friendLevel('heroine_04')))},speaker:null,text:'（她把一張插座貓貼紙，直接貼在你的手機殼上。）'},
      {unless:{custom:G=>DHN(G,'heroine_04')||(!GFN(G,'heroine_04')&&typeof SOCIAL!=='undefined'&&['FRIEND','CLOSE_FRIEND'].includes(SOCIAL.friendLevel('heroine_04')))},speaker:null,text:'（她遞給你一張插座貓貼紙。）'},
      {mem:[{npc:'heroine_04',tag:'CLAPPED',note:'大一下的吉他社成發：你拍手'}]},{goto:'end'},
      {label:'came'},{speaker:null,text:'（她下台經過，點個頭。）'},{speaker:'heroine_04',expression:'neutral',text:'你有來。'},
      {label:'end'} ] },
  /* 學姊 W2b 家族聚餐（BB_96 2-1；交接包 v2）：第 4 週週五 18:30 永康街的咖哩（出遊；家族群組回「去。」才排，story3d.js）。2D 背景「永康街・咖哩店」（虛構店名；圖還沒有）。
     有 SAID_TREAT_SIS：「二，飲料學弟請，咖哩我請。」「（把菜單闔上）說好了。」（AA_663 第 8 列，原本「我不是在客氣喔。」）；沒有：「二，今天我請。」「下次誰都不要遲到喔。」（「最後一句」照 W2c 的內容理解成「重點是」那一句；已請 BB 確認）。
     回了「我有。」（SAID_HAS_CAR）：結束時順路載三個人回學校（BB_97 2-9 的描述寫成旁白）。記 FAMILY_DINNER；有 SAID_TREAT_SIS 而且到場＝TREATED_FAMILY */
  { id:'ev_family_dinner', title:'家族聚餐', participants:['heroine_05'], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
    dialogue:[ {scene:'永康街・咖哩店',bg:'yongkang_curry'},
      {unless:{flags:['SIS_W1']},speaker:'player',text:'學姊好，我是{name}。'},{unless:{flags:['SIS_W1']},speaker:'heroine_05',expression:'neutral',text:'我知道。家聚你都沒來，今天來了就好。'},   /* AA_470 5-1：還沒認識她的（沒有 SIS_W1）兩句，點菜之前（這一場沒有開場旁白：接在場景後面）；演完記 met_sis、SIS_W1 */
      {if:{flags:['SAID_TREAT_SIS']},speaker:'heroine_05',expression:'neutral',text:'（看菜單三十秒）我要辣的。……飲料學弟請，咖哩我請。'},
      {unless:{flags:['SAID_TREAT_SIS']},speaker:'heroine_05',expression:'neutral',text:'（看菜單三十秒）我要辣的。今天我請。'},
      {if:{flags:['SAID_TREAT_SIS']},speaker:'heroine_05',expression:'smile',text:'（把菜單闔上）說好了。'},
      {unless:{flags:['SAID_TREAT_SIS']},speaker:'heroine_05',expression:'neutral',text:'下次誰都不要遲到喔。'},
      {speaker:null,text:'Kevin 遲到七分鐘。'},
      {speaker:'heroine_05',expression:'neutral',text:'Kevin，下次的地方你選。'},
      {if:{flags:['SAID_HAS_CAR']},speaker:null,text:'家聚結束，你順路載三個人回學校。學姊坐後座，一路在問學弟妹下學期選什麼課。'},{unless:{flags:['SIS_W1']},set:{SIS_W1:true,met_sis:true}} ],
    after:G=>{ if(typeof SOCIAL==='undefined') return; SOCIAL.remember('heroine_05','FAMILY_DINNER','永康街的咖哩'); if(G.flags.SAID_TREAT_SIS){ G.flags.TREATED_FAMILY=true; SOCIAL.remember('heroine_05','TREATED_FAMILY','說要請全家族飲料，真的請了'); } } },
  /* 沛珊 P3b「課輔班的晚上」（BB_96 3-3，交接包 v2；原本「課輔班的下午」）：大一下第 5～15 週，週三 20:45–21:15 走進溫州街（下課、家長來接），P2（ev_peishan_doubt）之後、只一次。
     AA-B 2026-11-07 21:11～21:12（AA614-CLASSMATE-JOBS-1103；AA_614 第 1 節 a0b8a3e40：課輔班每週三 18:00～21:00）：原本週二、四 16:30–18:00；開頭旁白、「一週兩天」兩句照 AA-B 改，其他台詞不動。
     她不用在 3D 裡出現：直接換成 2D 背景「溫州街・課輔班門口」（圖還沒有＝深色底＋字幕）。第二個選項只給去過法服讀書會的玩家（CLUB_lawclub_study）。
     記 SAW_HER_TEACH（大二 P3「我要重考。去念教育」的伏筆；不寫成憂鬱或逃避）*/
  { id:'ev_peishan_tutoring', title:'課輔班的晚上', participants:['classmate_peishan'], location:'wenzhou', trigger:'enter', term:['Y1S2'], weeks:[5,6,7,8,9,10,11,12,13,14,15], weekday:[3], time:[20.75,21.25], once:true, background:'dark',
    prereq:{events:['ev_peishan_doubt']},
    dialogue:[ {scene:'溫州街・課輔班門口',bg:'wenzhou_tutoring'},
      {speaker:null,text:'她帶著一群國小生從課輔班走出來。門口有幾個家長在等，她手上還拿著一疊作業本。'},   /* AA-B 2026-11-07 改 */
      {speaker:'classmate_peishan',expression:'smile',text:'喔，是你。我在這裡當助教。每個禮拜三。'},   /* AA-B 2026-11-07 改（原本「一週兩天」；22:00 說法統一成「助教」，AA_614 32a5f7e12）：作息週三 18:00～21:00 在溫州街課輔班（characters.js，AA_614 第 1 節）*/
      {speaker:null,text:'一個小孩拉她的衣角。她蹲下來聽他講完，站起來。'},
      {speaker:'classmate_peishan',expression:'thinking',text:'我在這裡都不會看時間。上課的時候我五分鐘看一次。'},
      /* BB_161 ④：第二個選項只給去過讀書會的玩家（出席紀錄，不是博覽會填表的 CLUB_lawclub_study）*/
      {choice:[{text:'「妳看起來很開心。」',goto:'a'},{text:'「讀書會最近比較少看到妳。」',if:{custom:G=>typeof ACTIVITIES!=='undefined'&&(ACTIVITIES.attendedAny(G,'public_law_group')||ACTIVITIES.attendedAny(G,'lawclub_study'))},goto:'b'},{text:'（幫她拿一半的作業本）',goto:'c'}]},
      {label:'a'},{speaker:'classmate_peishan',expression:'thinking',text:'有嗎。'},{speaker:null,text:'她想了一下。'},{speaker:'classmate_peishan',expression:'smile',text:'……有。'},{goto:'end'},
      {label:'b'},{speaker:'classmate_peishan',expression:'neutral',text:'嗯。我還是會去，只是比較少。'},{speaker:null,text:'她不躲這個問題。'},{speaker:'classmate_peishan',expression:'thinking',text:'我在找我比較想待的地方。'},{goto:'end'},
      {label:'c'},{speaker:'classmate_peishan',expression:'smile',text:'謝謝。你走路好慢，跟他們一樣，剛好排一隊。'},{speaker:null,text:'小孩們笑。'},
      {label:'end'},{mem:[{npc:'classmate_peishan',tag:'SAW_HER_TEACH',note:'溫州街的課輔班：她在當助教'}]} ] },
  /* Alison 語 2「剛好路過」（交接包 v2 C18；草稿第 3 節、AA_40 語 2）：大一下第 14～16 週，阿哲和 Alison 的三個徵兆。三個選項都不改變結果（大二上兩人在一起），只記 YU2_PICK（之後 Alison 怎麼跟祐廷說）。
     交往中的玩家也一樣（這是 Alison 和阿哲的事）。只有認識 Alison 的玩家有（met_yu）；阿哲開場就認識。
     「徵兆保證觸發」（AA_40 要開發組評估）的做法：
       ① 傅鐘的早餐：Alison 早上坐在傅鐘旁邊的長椅（她的作息：平日 08:20～09:05，AA_156 第 4 節），走到她附近就演（auto＋near，不用特地找她說話）；
       ② 桌遊夜：Alison 23:00 從戲院趕到的那一次桌遊夜，場景後面一句旁白（AA_675 1-3；原本麵店日走進麵店、桌遊團才有）；
       ③ 最後一個（Alison 問祐廷）：吉他社的玩家在社課結束後（afterActivity），其他玩家在麵店散場後走到騎樓（公館，今天有在麵店；AA_684 第 4 項：今天在燒臘店的時候阿哲照作息在店裡＝週二、四 18:00～19:30）；
          要先看過 ① 或 ② 其中一個——所以看到 ③ 的玩家一定看過兩個以上；桌遊團的玩家同一個晚上 ②＋③ 就湊齊。整個存檔只問一次（YU2_PICK）*/
  { id:'ev_yu_sign_soymilk', title:'剛好路過', participants:['yu','zhe'], location:'campus', trigger:'auto', near:{npc:'yu',r:4}, term:['Y1S2'], weeks:[13,14,15], weekday:[1,2,3,4,5], time:[8+20/60,9+5/60], once:true, background:'blur',
    prereq:{flags:['met_yu']},
    dialogue:[ {speaker:null,text:'阿哲出現，帶著兩杯豆漿。'},{speaker:'zhe',expression:'smile',text:'剛好路過。'},{speaker:'yu',expression:'neutral',text:'你宿舍又不在這邊。'},/* AA_209 附錄A §2（阿哲住 203，AA_208）*/{speaker:'zhe',expression:'neutral',text:'……剛好路過。'} ],
    consequences:{stamp:['yu2SoymilkDay']} },
  /* AA_675 1-3（AA_661 第 64 列，企劃線 920791094，AA-C 定 D109）：② 改成桌遊夜當天的 2D 場，不等 3D——Alison 23:00 從戲院下班趕到的那一次桌遊夜（大一下第 13～15 週的桌遊夜，
     src/bgnight3d.js BGN.yuLate），接在桌遊夜的場景後面演（BGN.yuSign 叫；manual＝不會自己觸發）。台詞照舊（沒有地點字）。原本：麵店日走進麵店、桌遊團才有（noodleTableDay、ndlDay）*/
  { id:'ev_yu_sign_seat', title:'她每次都坐阿哲旁邊', participants:['yu','zhe'], location:'any', trigger:'manual', term:['Y1S2'], weeks:[13,14,15], once:true, background:'freeze',
    prereq:{flags:['met_yu'],custom:G=>typeof BGN!=='undefined'&&!!BGN.yuLate&&BGN.yuLate(G.day)},
    dialogue:[ {speaker:null,text:'Alison 每次都坐阿哲旁邊。'} ],
    consequences:{stamp:['yu2SeatDay']} },
  { id:'ev_yu_sign_question_club', title:'阿哲是不是對每個人都這麼好', participants:['yu'], location:'wancai', trigger:'activity', afterActivity:'club_guitar', term:['Y1S2'], weeks:[13,14,15], once:true, background:'blur',
    prereq:{flags:['met_yu','CLUB_club_guitar'],custom:G=>!G.flags.YU2_PICK&&(G.flags.yu2SoymilkDay!=null||G.flags.yu2SeatDay!=null)},
    dialogue:YU2_QUESTION },
  { id:'ev_yu_sign_question_arcade', title:'阿哲是不是對每個人都這麼好', participants:['yu'], location:'gongguan', trigger:'enter', term:['Y1S2'], weeks:[13,14,15], weekday:[2,4], time:[17.5,22], once:true, background:'blur',
    prereq:{flags:['met_yu'],custom:G=>{ const F=G.flags; return !F.YU2_PICK&&!F.CLUB_club_guitar&&(F.yu2SoymilkDay!=null||F.yu2SeatDay!=null)&&F.zheNdlDay===G.day; }},   /* AA_684 第 4 項：今天有在燒臘店、那時候阿哲照作息在店裡（story3d.js 記 zheNdlDay，STORY.zheAtNoodle）；原本看麵店日的紀錄 ndlDays（只有桌遊團的麵店日才記），阿哲的麵店日拿掉以後演不到 */
    dialogue:YU2_Q(true) },
  /* 以安新 7 前半「和 Alison 吵架」（交接包 v2 C14；草稿第 3 節、AA_113 新 7）：2026-10-17 改到大一下第 12 週週四的公法讀書會（萬才館研討室；AA_238 5-3：阿哲換柏翰計時，CLS.clubEvent 挑）。原本是第 11 週週二晚上的麵店（麵店日）。台詞、選項照原文；好感數字原文沒有，不加。
     記 AN_YU_ARGUMENT（選了哪一個；之後新 8 可以用）。不在場的玩家：那個週四 22:00 Alison 在桌遊團群組連發三則（AA_238 5-4；story3d.js phoneRules，記「聽說」）。
     法律：集會遊行「許可制／報備制」的爭論，只呈現兩邊的理由、不給結論——BB-B 審過（BB_115 L483，BB_161 第 3 節）（原本 LEGAL_REVIEW_REQUIRED）*/
  { id:'ev_an_yu_argument', title:'吵架', participants:['heroine_01','yu','classmate_bohan'], location:'wancai', trigger:'club', priority:9, once:true, term:['Y1S2'], weeks:[12], weekday:[4], prereq:{stage:{npc:'heroine_01',min:'ACQUAINTANCE'},custom:G=>typeof SOCIAL!=='undefined'&&SOCIAL.STAGES.indexOf(SOCIAL.stage('yu'))>=SOCIAL.STAGES.indexOf('ACQUAINTANCE')}, background:'blur',   /* 法律審查：BB-B 第 27 批審過（BB_115 L483，集會遊行法 §8 許可制，以安只講區分、沒有結論；BB_161 第 3 節）。AA_178 ③：以安、Alison 都 ACQUAINTANCE 以上才演；不符合＝在桌遊團群組的照樣收到兩則（story3d.js）*/
    dialogue:[ {speaker:'yu',expression:'serious',text:'上街要先申請？那還叫自由嗎？'},{speaker:'heroine_01',expression:'serious',text:'先分清楚。是要申請許可，還是讓人知道你要用哪一條路。'},
      {speaker:'yu',expression:'annoyed',text:'妳每次都先挑我用詞。'},{speaker:'heroine_01',expression:'neutral',text:'因為用詞不清楚，我們就會在吵兩件不一樣的事。'},{speaker:'classmate_bohan',expression:'neutral',text:'（看了一下手錶）妳們兩個講了十二分鐘了。每人十分鐘。'},   /* AA_238 5-3（原本麵店、阿哲「麵要坨了。」）*/
      {choice:[{text:'「我站 Alison。」',consequences:{flags:{AN_YU_ARGUMENT:'yu'}},goto:'yu'},{text:'「我站以安。」',consequences:{flags:{AN_YU_ARGUMENT:'an'}},goto:'an'},
        {text:'「妳們講的是同一件事的兩邊。」',consequences:{flags:{AN_YU_ARGUMENT:'both'}},goto:'both'},{text:'（先吃 Alison 帶的宵夜）',consequences:{flags:{AN_YU_ARGUMENT:'noodle'}},goto:'noodle'}]},
      {label:'yu'},{speaker:'yu',expression:'laugh',text:'看吧！'},{speaker:'heroine_01',expression:'neutral',text:'那你說說看，哪裡不對？'},{goto:'end'},   /* AA_209 附錄A §2 */
      {label:'an'},{speaker:'heroine_01',expression:'neutral',text:'謝謝。'},{speaker:null,text:'（她轉回去跟 Alison 繼續講，聲音小了一點。）'},{goto:'end'},   /* AA_209 附錄A §2 */
      {label:'both'},{speaker:null,text:'（兩個人同時轉過來看你。）'},{speaker:'yu',expression:'surprised',text:'……幹嘛突然這麼有道理。'},{goto:'end'},
      {label:'noodle'},{speaker:'classmate_bohan',expression:'neutral',text:'明智。……我也要一塊。'},
      {label:'end'} ] },
  /* 以安新 7 後半「公法讀書會第一次」（交接包 v2 C14）：活動「公法讀書會」（activities.js，大一下第 12 週起每週四 20:00，萬才館研討室 A；所有人都收到邀請，AA_115：不懲罰先走、沒去演講的人）。
     第一次去：白板（原文）；加入就每週四有一格（CLUB_public_law_group），記 PUBLIC_LAW_GROUP。不去也照常，之後還是會被邀 */
  { id:'ev_public_law_group', title:'公法讀書會', participants:['heroine_01','yu'], location:'wancai', trigger:'activity', term:['Y1S1','Y1S2'], once:true, background:'blur',   /* 大一上第 10 週開始（AA_218 17-4；BB_191 §8-1）；大一下才第一次來的也演 */
    dialogue:[ {speaker:null,text:'（研討室的白板上寫著「公法讀書會」。下面是以安的字：「每人十分鐘。」）'},{speaker:null,text:'（Alison 在旁邊補：「可以吃東西。」）'},{set:{PUBLIC_LAW_GROUP:true}} ] },
  /* 法四學長姊畢業（交接包 v2 C17；AA_71 2-12「大一：法四學長姊畢業」，寫成慶祝）：大一下第 15 週週六 10～15 在校園（和 ev_sis_festival_booth 同樣的做法：在校園就演）；
     學士帽丟上天、學長請你拍照。法服群組、家族群組那兩則在 story3d.js 的 phoneRules。旁白只用 AA 的字 */
  { id:'ev_grad_seniors_y1', title:'學長姊畢業', participants:[], location:'campus', trigger:'auto', term:['Y1S2'], weeks:[15], weekday:[6], time:[10,15], once:true, background:'blur',
    dialogue:[ {speaker:null,text:'（椰影大道。學士帽丟上天。）'},{speaker:null,text:'（一位學長把手機塞給你。）'},{speaker:'學長',text:'學弟，幫我們拍一張！'},{speaker:null,text:'（拍完。）'},{speaker:'學長',text:'謝啦！三年後換你。'} ] },
  /* 大一的系籃比賽（交接包 v2 C16；AA_71 2-11）：活動「系籃比賽」（activities.js，大一下第 14 週週六 14～16，球場）去看就演；阿哲上場，你選拍手、記分、送水，各一段（原文）；
     都記一筆小記憶 WATCHED_GAME（記在阿哲身上）。旁白只用 AA 的字。好感數字原文沒有，不加 */
  { id:'ev_zhe_game_y1', title:'系籃比賽', participants:['zhe'], location:'campus', trigger:'activity', term:['Y1S2'], once:true, background:'blur',
    dialogue:[ {speaker:null,text:'（系籃比賽。阿哲上場。）'},
      {choice:[{text:'（拍手）',consequences:{mem:[{npc:'zhe',tag:'WATCHED_GAME',note:'大一的系籃比賽：你拍手'}]},goto:'clap'},{text:'（記分）',consequences:{mem:[{npc:'zhe',tag:'WATCHED_GAME',note:'大一的系籃比賽：你記分'}]},goto:'score'},{text:'（送水）',consequences:{mem:[{npc:'zhe',tag:'WATCHED_GAME',note:'大一的系籃比賽：你送水'}]},goto:'water'}]},
      {label:'clap'},{speaker:null,text:'（你在觀眾席拍到手掌發紅。阿哲進球，轉身指著你。）'},{speaker:'zhe',expression:'laugh',text:'有聽到！'},{goto:'end'},
      {label:'score'},{speaker:null,text:'（你坐到記分台，翻牌翻錯一次，裁判看了你一眼。）'},{speaker:'zhe',expression:'smile',text:'沒事啦，多兩分給對面，算我們請客。'},{goto:'end'},
      {label:'water'},{speaker:null,text:'（中場你把一箱水搬到場邊。阿哲一口氣喝掉半瓶。）'},{speaker:'zhe',expression:'smile',text:'謝啦。'},{speaker:null,text:'（他把瓶子丟回給你，又跑回場上。）'},/* AA_209 第 8 節第 2 點 */   /* AA_209 附錄A §2 */
      {label:'end'} ] },
  { id:'ev_an_azalea_y1', title:'四年，四張', participants:['heroine_01'], location:'campus', trigger:'interact', priority:8, once:true, term:['Y1S2'], weeks:[3], weekday:[6], time:[10,12], prereq:{stage:{npc:'heroine_01',min:'ACQUAINTANCE'}}, background:'blur',
    dialogue:[ {speaker:null,text:'（椰影大道的杜鵑開了。以安拿著手機。）'},{speaker:'heroine_01',expression:'neutral',text:'我想每年都在這裡拍一張，拍到畢業。'},   /* AA_209 附錄A §2 */
      {unless:{stage:{npc:'heroine_01',min:'FAMILIAR'}},goto:'yu'},{if:{flags:['EX_heroine_01']},goto:'yu'},   /* 和她分開過的玩家照「不熟」的版本（AA_71，AA-C e2bdcece）*/
      {speaker:null,text:'（她把手機遞給你。）'},{speaker:'heroine_01',expression:'neutral',text:'你幫我拍。……不要叫我笑。'},{speaker:null,text:'（拍完她看了一下。）'},{speaker:'heroine_01',expression:'smile',text:'可以，花有拍到。謝謝。'},
      {if:{flags:['dating_heroine_01']},speaker:null,text:'（她拿回手機，也對著你按了一下。）'},{if:{flags:['dating_heroine_01']},speaker:'heroine_01',expression:'smile',text:'這張我自己留。'},   /* 交往中的第一張（AA_71，AA-C e2bdcece；AA_216 大一下 #6：照片裡還是只有她，兩個人入鏡留給第四張）*/
{set:{AZALEA_Y1:'player'}},{goto:'flowers'},   /* AA_209 附錄A §2 */
      {label:'yu'},{speaker:null,text:'（她請 Alison 拍。）'},{speaker:'yu',expression:'smile',text:'笑一個嘛！'},{speaker:'heroine_01',expression:'neutral',text:'不要。'},{set:{AZALEA_Y1:'yu'}},
      {label:'flowers'},{unless:{memory:[{npc:'heroine_02',tag:'FIRST_MET'},{npc:'heroine_04',tag:'FIRST_MET'}]},goto:'end'},
      {speaker:null,text:'（芷若拿著手機在拍花。）'},{speaker:'heroine_04',expression:'smile',text:'妳也來拍喔？'},{speaker:'heroine_02',expression:'neutral',text:'嗯，今天沒班。'},   /* AA_209 2-1 第 5 節第 2 點（BB_167 SC3 #37）*/
      {label:'end'} ] },
  { id:'ev_an_dorm_appeal_result', title:'申訴的結果', participants:['heroine_01'], location:'library', trigger:'interact', priority:9, once:true, term:['Y1S2'], weeks:[7], prereq:{events:['ev_an_dorm_appeal'],custom:G=>!G.flags.AN_APPEAL_RESULT}, background:'blur',
    dialogue:[ {speaker:null,text:'（她指了指外面。你們走到樓梯間。）',libOut:true},   /* libOut（AA_595 1-B7；AA 11-02 22:30 定稿）*/
      {speaker:'heroine_01',expression:'smile',text:'點數減了一點。宿舍說，以後記點以前會先問。'},{speaker:'heroine_01',expression:'neutral',text:'最後用的是第二份，寫規定沒考慮到急診這種情況。'},   /* AA_209 附錄A §2（當面、手機 an_appeal_result 兩處一起換）*/
      {if:{flagIs:{AN_APPEAL:'ask'}},speaker:'heroine_01',expression:'smile',text:'你說要先問清楚的那句，我放在第一段了。'},{set:{AN_APPEAL_RESULT:'met'}} ] },   /* AA_209 附錄A §2 */
  /* 大一下的期末最後一頓（交接包 v2 C19：AA_71 2-13，同一段原文；只一次）。大一上那一個 id 不改（舊存檔 events.done 相容）*/
  { id:'ev_term_last_meal_y1s2', title:'期末最後一頓', participants:[], location:['noodle','wz_offbeat'], trigger:'enter', term:['Y1S2'], time:[17,22], once:true, background:'blur',   /* AA_648 第 1 節：日常失速（見大一上那一場的說明）*/
    prereq:{custom:G=>{ if(G.flags.noodleTableDay==null||typeof CLS==='undefined'||!CLS.lastExamEnd) return false; const e=CLS.lastExamEnd(G,'Y1S2','final'); return !!e&&(G.day>e.day||(G.day===e.day&&G.hour>=e.h))&&G.zone===(typeof OFFB!=='undefined'&&OFFB.finalZone?OFFB.finalZone(G,'Y1S2'):'noodle'); }},
    dialogue:[ {if:{custom:G=>G.zone==='wz_offbeat'},call:async(G,GM)=>{ if(typeof OFFB!=='undefined'&&OFFB.finalSeat) OFFB.finalSeat(GM,'Y1S2'); }}, {speaker:null,text:'（大一最後一科考完。長桌又併起來了。）'},{if:{custom:G=>G.zone==='noodle'},speaker:null,text:'（每個人的盤子裡，都多了一塊叉燒。）'},{if:{custom:G=>G.zone==='noodle'},speaker:'阿姨',text:'一年了。……今天的湯，算我的。'},{if:{custom:G=>G.zone==='wz_offbeat'},speaker:'店員',text:'你們大一就坐這張長桌了。……今天的飲料，算我的。'},{if:{custom:G=>G.zone==='wz_offbeat'},speaker:null,text:'（店長跳上長桌，在每個人的盤子旁邊都聞了一下。）'},{if:{custom:G=>G.zone==='wz_offbeat'},call:async(G,GM)=>{ if(typeof OFFB!=='undefined'&&OFFB.finalNarrOf) await GM.say(null,OFFB.finalNarrOf('Y1S2')); }},{if:{custom:G=>G.zone==='wz_offbeat'},call:async(G,GM)=>{ if(typeof OFFB!=='undefined'&&OFFB.finalUnseat) OFFB.finalUnseat(GM); }} ],   /* AA_519 1-3：送小菜第三處＝第 2 句；「吃好一點」只留大一上那一次 */   /* AA_467 第 1 節（企劃線 5bbd16ab1）：前三句換字（大一上 ev_term_last_meal 照舊）*/
    consequences:{memo:'大一下期末最後一頓'} },
  /* 可昕 K4 第一次視訊一起讀書（BB_95 9-5）：第 16 週週二 20:00 她問（story3d.js 的 phoneRules）；「好，九點開。」＝當天 21:00 視訊（出遊：接起來）。
     開始前先選讀哪一科（和自學一樣算進期末準備：兩個小時＝兩次）；每半小時她出一題假設題（照順序，玩笑，不給結論），回她＝「你分心了。很好。」、
     不回＝「你今天好認真。我有點寂寞。……繼續。」（各自第一次才說，不重複）。沒接、今天先不要＝23:00 她傳書桌的照片（outingMissed）。記 VIDEO_STUDY（AA_112 第 6 節：和見面一樣算數）*/
  /* 第一份報告交出去的晚上（12/3）：CANON-NO-ECON-1112 第三批拿掉；12/3 那個選項和讀它的條件（生日那場的「我帶了另一個。」）照 AA_900 第 5 節一起拿掉。
     可昕大一下的生日 4/24（CANON-NO-ECON-1112 第四批；企劃線 AA_874 定稿，BB_417）：兩版只會看到一版——
     · B 版（交往中）：ev_kexin_birthday_y1s2（id 留著）。4/24 白天她私訊「晚上八點，映月湖。不要吃太飽。」→ 照約會邀約流程 20:00 映月湖（story3d.js phoneRules）。記 KX_BDAY_Y1 'night'、KX_BDAY_VISIT（舊旗標，讀它的地方照舊）。
       沒赴約：不補場；之後第一次遇到她那一句（ev_kexin_birthday_y1s2_next）。
     · A 版（還沒交往、熟悉以上）：ev_kexin_birthday_y1s2_drink，4/24 下午走進法律系館遇到她 → 校門口的飲料攤（不寫店名，D147）。祐廷付一杯（60 元，LAWWW 定）；錢不夠她自己付、記 'self'、不欠、之後不提。
       聽過 KX2_BDAY_TOLD（她先講過生日）的開頭不一樣。沒遇到她：不出這一場；之後第一次遇到她那一句（ev_kexin_birthday_y1s2_late）。
     兩張舊 CG（冬裝那張、外校校門口的花那張）不掛；新場景的 CG 列給 BB（AA_874 最後一節），不擋。*/
  { id:'ev_kexin_birthday_y1s2', title:'她的生日', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:1.5,
    dialogue:[ {scene:'映月湖',bg:'zuiyue_night'},
      {speaker:null,text:'（晚上的映月湖邊。她提著一個小紙盒。）'},
      {speaker:'kexin',expression:'smile',text:'室友下午幫我過了。蛋糕我留了一塊，最大的那塊。'},
      {speaker:'kexin',expression:'teasing',text:'我跟她們說要留給一個人。她們叫了很久。'},
      {speaker:null,text:'（她把紙盒打開。裡面的蛋糕有一點歪了。）'},
      {choice:[{text:'（拿出準備好的蠟燭）',goto:'a'},{text:'「沒有蠟燭怎麼辦？」',goto:'b'}]},
      {label:'a'},{speaker:'kexin',expression:'surprised',text:'你有帶蠟燭？……只有一根喔。好，一根就一根。'},{speaker:null,text:'（火點著了。她的臉被照得很亮。）'},{speaker:'kexin',expression:'smile',text:'我許好了。不能問。'},{goto:'cake'},
      {label:'b'},{speaker:'kexin',expression:'neutral',text:'用手機的燈。'},{speaker:null,text:'（她把手機的手電筒打開，立在蛋糕旁邊。）'},{speaker:'kexin',expression:'smile',text:'好醜。可是可以。我許好了。'},
      {label:'cake'},
      {speaker:null,text:'（她把蛋糕切成兩半。只有一支叉子，她吃一口，遞給你。）'},
      {speaker:'kexin',expression:'neutral',text:'以前生日都在高雄，我媽會煮一桌。今年第一次不在家。'},
      {speaker:'kexin',expression:'smile',text:'有人陪我吃這一塊，就沒有那麼像在外地。'},
      {speaker:null,text:'（湖面上有風。她把外套的領子拉高一點。）'},
      {speaker:'kexin',expression:'smile',text:'明天八點有課。再坐十分鐘。'} ],
    consequences:{flags:{KX_BDAY_VISIT:true,KX_BDAY_Y1:'night'},memo:'可昕的生日（4/24）'} },
  { id:'ev_kexin_birthday_y1s2_drink', title:'', participants:['kexin'], location:'linze', trigger:'enter', term:['Y1S2'], time:[12,18], once:true, background:'blur',
    prereq:{custom:G=>typeof STORY!=='undefined'&&!!STORY.termDay&&G.day===STORY.termDay('Y1S2',9,5)&&G.flags.dating_kexin!==true&&KX_LINE_OK(G,'FAMILIAR')},
    dialogue:[
      {speaker:null,text:'（系館門口。她今天兩邊都戴了耳環。）'},
      {if:{memory:[{npc:'kexin',tag:'KX2_BDAY_TOLD'}]},goto:'told'},
      {speaker:'kexin',text:'今天我生日。你不知道很正常，我沒講過。'},
      {speaker:'kexin',text:'現在你知道了。請我喝一杯。'},{goto:'drink'},
      {label:'told'},{speaker:'kexin',text:'今天幾號？'},
      {choice:[{text:'「二十四。生日快樂。」',goto:'t1'},{text:'「……幾號？」',goto:'t2'}]},
      {label:'t1'},{speaker:'kexin',text:'……你有記住。好。那一杯呢？'},{goto:'drink'},
      {label:'t2'},{speaker:'kexin',text:'二十四。我講過，記不記得住是你的事。現在是你的事了。走，去買。'},
      {label:'drink'},
      {speaker:null,text:'（飲料攤前面。她看菜單看了很久。）'},
      {speaker:'kexin',text:'我要最貴的那杯。'},
      {speaker:'kexin',text:'開玩笑的。紅茶拿鐵，半糖。'},
      {call:(G,GM)=>{ if((G.money|0)>=KX_BDAY_DRINK){ if(GM&&GM.money) GM.money(-KX_BDAY_DRINK); else G.money-=KX_BDAY_DRINK; G.flags.KX_BDAY_Y1='drink'; } else G.flags.KX_BDAY_Y1='self'; }},   /* 一杯飲料 60 元；錢不夠她自己付（不欠、之後不提）*/
      {if:{flagIs:{KX_BDAY_Y1:'self'}},speaker:'kexin',text:'你沒錢喔？……好，這杯我請我自己。'},
      {speaker:null,text:'（她接過去，喝了一口。）'},
      {speaker:'kexin',text:'今天我收到我媽的訊息、室友的卡片，還有這杯。'},
      {speaker:'kexin',text:'在臺北的第一個生日。我本來以為會很無聊。'},
      {choice:[{text:'「妳今天兩邊都戴了。」',goto:'e'},{text:'「許願了嗎？」',goto:'w'}]},
      {label:'e'},{speaker:'kexin',text:'生日才戴一對。平常一邊就夠了。你有發現，加分。'},{goto:'z'},
      {label:'w'},{speaker:'kexin',text:'還沒。晚上室友說要幫我點蠟燭，到時候再許。現在先喝。'},
      {label:'z'},
      {speaker:null,text:'（她喝到剩一半，把杯子舉起來看了一下。）'},
      {speaker:'kexin',text:'這杯我會記得。走了，我還有課。'} ] },
  /* A 版沒遇到她（4/24 那天這一場沒演）：隔天起第一次和她說話，她只說一句，不扣好感 */
  { id:'ev_kexin_birthday_y1s2_late', title:'', participants:['kexin'], location:'any', trigger:'interact', priority:9, term:['Y1S2'], once:true, background:'blur',
    prereq:{custom:G=>{ const bd=typeof STORY!=='undefined'&&STORY.termDay?STORY.termDay('Y1S2',9,5):null; return bd!=null&&G.day>bd&&G.day<=bd+7&&G.flags.dating_kexin!==true&&!(G.events&&G.events.done&&G.events.done.ev_kexin_birthday_y1s2_drink)&&KX_LINE_OK(G,'FAMILIAR'); }},
    dialogue:[ {speaker:'kexin',text:'昨天我生日。沒事，只是講一下。'} ] },
  /* B 版沒赴約：不補場；隔天起第一次和她說話，她說這一句（AA_874 B 版最後；那一天的短招呼只用「嗨。」那一半沒做，見交接）*/
  { id:'ev_kexin_birthday_y1s2_next', title:'', participants:['kexin'], location:'any', trigger:'interact', priority:9, term:['Y1S2'], once:true, background:'blur',
    prereq:{custom:G=>{ const bd=typeof STORY!=='undefined'&&STORY.termDay?STORY.termDay('Y1S2',9,5):null; return bd!=null&&G.day>bd&&G.day<=bd+7&&G.flags.dating_kexin===true&&G.flags.KX_BDAY_Y1_NOSHOW===bd; }},
    dialogue:[ {speaker:'kexin',text:'昨天那塊蛋糕我自己吃掉了，最大那塊。我有一點不高興。講完了。'} ] },
  /* 期末成績：寒假第一天晚上和可昕視訊一起打開（BB_95 9-8）。等的玩家：她數完以後成績單接著出來；先看的玩家：照樣一起打開。沒接（錯過、今天先不要）：成績隔天早上照常出來 */
  { id:'ev_kexin_grades_open', title:'一起打開', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.25,
    dialogue:[ {scene:'視訊',bg:'video'},
      {speaker:null,text:'（寒假。她在高雄，視訊那頭聽得到她家的電視。）'},   /* CANON-NO-ECON-1112 第四批（AA_875 第 1 節）：開頭加旁白；「你欠我的那一次」那一列拿掉（接的是已經拿掉的視訊一起讀書）*/
      {speaker:'kexin',expression:'smile',text:'三、二、一——'},
      {if:{custom:G=>{ const v=(G=>typeof GRADES!=='undefined'?GRADES.lv(G,'Y1S1'):'mid')(G); return v==='fail_law'||v==='fail_att'; }},speaker:'kexin',expression:'serious',text:'……有一科沒過。'},{if:{custom:G=>{ const v=(G=>typeof GRADES!=='undefined'?GRADES.lv(G,'Y1S1'):'mid')(G); return v==='fail_law'||v==='fail_att'; }},speaker:'kexin',expression:'smile',text:'好。下學期那一科，我陪你念。'},   /* AA_553 第 4 節：被當＝取代「都過了」（現有的錯）*/
      {if:{custom:G=>(G=>typeof GRADES!=='undefined'?GRADES.lv(G,'Y1S1'):'mid')(G)==='high'},speaker:'kexin',expression:'teasing',text:'……你偷念。'},{if:{custom:G=>(G=>typeof GRADES!=='undefined'?GRADES.lv(G,'Y1S1'):'mid')(G)==='high'},speaker:'kexin',expression:'smile',text:'好，這次才是真的放假。'},{if:{custom:G=>(G=>typeof GRADES!=='undefined'?GRADES.lv(G,'Y1S1'):'mid')(G)==='high'},speaker:'kexin',expression:'teasing',text:'你請。'},
      {if:{custom:G=>(G=>typeof GRADES!=='undefined'?GRADES.lv(G,'Y1S1'):'mid')(G)==='low'},speaker:'kexin',expression:'smile',text:'……都過了。'},{if:{custom:G=>(G=>typeof GRADES!=='undefined'?GRADES.lv(G,'Y1S1'):'mid')(G)==='low'},speaker:'kexin',expression:'smile',text:'下學期一起念。你躲的話，我去你宿舍樓下叫。'},
      {if:{custom:G=>{ const v=(G=>typeof GRADES!=='undefined'?GRADES.lv(G,'Y1S1'):'mid')(G); return v!=='fail_law'&&v!=='fail_att'&&v!=='high'&&v!=='low'; }},speaker:'kexin',expression:'smile',text:'……都過了。好，這次才是真的放假。'} ],   /* AA-C 11:23（16 週制：1/5 已經放假兩週）*/
    afterOuting:async(G,GM)=>{ if(typeof CLS!=='undefined'&&CLS.rec&&!CLS.rec(G).grades.Y1S1) await CLS.showGrades(GM,'Y1S1'); },
    outingMissed:(G)=>{ if(typeof CLS!=='undefined'&&CLS.rec){ const R=CLS.rec(G); if(!R.grades.Y1S1) R.note.gradesDue='Y1S1'; } } },
  /* 9-9 大一下 together（AA_157 第 2 節；BB_139 2-1：照大一上兩句，只換「暑假」）：暑假第一天 21:00 視訊一起打開；沒接＝隔天早上照常發成績單 */
  { id:'ev_kexin_grades_open_y1s2', title:'一起打開', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.25,
    dialogue:[ {scene:'視訊',bg:'video'},
      {speaker:null,text:'（暑假第一天。她在高雄，視訊那頭有人在喊她吃水果。）'},   /* CANON-NO-ECON-1112 第四批（AA_875 第 1 節）*/
      {speaker:'kexin',expression:'smile',text:'三、二、一——'},
      {if:{custom:G=>{ const v=(G=>typeof GRADES!=='undefined'?GRADES.lv(G,'Y1S2'):'mid')(G); return v==='fail_law'||v==='fail_att'; }},speaker:'kexin',expression:'serious',text:'……有一科沒過。'},{if:{custom:G=>{ const v=(G=>typeof GRADES!=='undefined'?GRADES.lv(G,'Y1S2'):'mid')(G); return v==='fail_law'||v==='fail_att'; }},speaker:'kexin',expression:'smile',text:'好。下學期那一科，我陪你念。'},   /* AA_553 第 4 節：被當＝取代「都過了」（現有的錯）*/
      {if:{custom:G=>(G=>typeof GRADES!=='undefined'?GRADES.lv(G,'Y1S2'):'mid')(G)==='high'},speaker:'kexin',expression:'teasing',text:'……你偷念。'},{if:{custom:G=>(G=>typeof GRADES!=='undefined'?GRADES.lv(G,'Y1S2'):'mid')(G)==='high'},speaker:'kexin',expression:'smile',text:'好，這下暑假真的開始了。'},{if:{custom:G=>(G=>typeof GRADES!=='undefined'?GRADES.lv(G,'Y1S2'):'mid')(G)==='high'},speaker:'kexin',expression:'teasing',text:'你請。'},
      {if:{custom:G=>(G=>typeof GRADES!=='undefined'?GRADES.lv(G,'Y1S2'):'mid')(G)==='low'},speaker:'kexin',expression:'smile',text:'……都過了。'},{if:{custom:G=>(G=>typeof GRADES!=='undefined'?GRADES.lv(G,'Y1S2'):'mid')(G)==='low'},speaker:'kexin',expression:'smile',text:'下學期一起念。你躲的話，我去你宿舍樓下叫。'},
      {if:{custom:G=>{ const v=(G=>typeof GRADES!=='undefined'?GRADES.lv(G,'Y1S2'):'mid')(G); return v!=='fail_law'&&v!=='fail_att'&&v!=='high'&&v!=='low'; }},speaker:'kexin',expression:'smile',text:'……都過了。好，這下暑假真的開始了。'}   /* AA_209 附錄 B 第 4 節第 2 點（成績 6/29 才公布）*/ ],
    afterOuting:async(G,GM)=>{ if(typeof CLS!=='undefined'&&CLS.rec&&!CLS.rec(G).grades.Y1S2) await CLS.showGrades(GM,'Y1S2'); },
    outingMissed:(G)=>{ if(typeof CLS!=='undefined'&&CLS.rec){ const R=CLS.rec(G); if(!R.grades.Y1S2) R.note.gradesDue='Y1S2'; } } },
  /* 可昕的大一下（BB_96 第 9 節，BB 2026-10-14）——9-1 情人節：寒假 2/14 20:00 視訊（她先問天氣）。記 KX_VDAY:{1:'video'|'missed'}、KX_VDAY_WX:{1:'sunny'|'rain'|'window'}；
     選「我不知道。我想見妳。」記 KX_VDAY_SEE（K5 她多一句，9-3）。沒接：窗戶的照片＋「你那邊的天氣，我自己查了。情人節快樂。」，不扣分、不追問。舞台說明改旁白 */
  { id:'ev_kexin_valentine_y1', title:'情人節', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.5,
    outingMissed:(G,GM,q)=>{ G.flags.KX_VDAY=Object.assign({},G.flags.KX_VDAY||{},{1:'missed'}); if(typeof PHONE==='undefined') return; const late=G.day>q.day||G.hour>=21;
      PHONE.at(G,late?G.day:q.day,late?G.hour:21,[{th:'p:kexin',from:'kexin',text:'📷（她的窗戶）'},{th:'p:kexin',from:'kexin',text:'你那邊的天氣，我自己查了。情人節快樂。'}],'kx_vday1_photo'); },
    dialogue:[ {scene:'視訊',bg:'video'},
      {speaker:null,text:'（寒假。她在高雄，鏡頭後面是她房間的窗戶。）'},   /* CANON-NO-ECON-1112 第四批（AA_877 #10）：開頭加旁白 */
      {speaker:'kexin',expression:'smile',text:'你那邊的天氣？'},
      {choice:[{text:'「晴天。很冷。」',set:{_kxVwx:'sunny'},goto:'w1'},{text:'「下雨。」',set:{_kxVwx:'rain'},goto:'w2'},{text:'（把鏡頭轉向窗外）',set:{_kxVwx:'window'},goto:'w3'}]},
      {label:'w1'},{speaker:'kexin',expression:'smile',text:'臺北的冷是濕的，我這邊是乾的。……你多穿一件。'},{goto:'q'},
      {label:'w2'},{speaker:'kexin',expression:'laugh',text:'我這邊也是。那是同一片雨。……氣象不是這樣講的。算了。'},{goto:'q'},
      {label:'w3'},{speaker:null,text:'她也把手機轉向她的窗戶。'},{speaker:'kexin',expression:'smile',text:'交換。'},
      {label:'q'},{speaker:'kexin',expression:'teasing',text:'情人節我們不在同一個地方。……你今天做了什麼？'},
      {choice:[{text:'「讀民總。」',goto:'a1'},{text:'「傳訊息給妳。」',goto:'a2'},{text:'「我不知道。我想見妳。」',set:{KX_VDAY_SEE:true},goto:'a3'}]},
      {label:'a1'},{speaker:'kexin',expression:'laugh',text:'寒假還在讀民總的人，都這樣回答。'},{speaker:null,text:'她笑。'},{goto:'end'},
      {label:'a2'},{speaker:'kexin',expression:'smile',text:'那開學以後，我們補過一次。'},{set:{KX_VDAY_MAKEUP:true}},{goto:'end'},
      {label:'a3'},{speaker:null,text:'嘴角先動了。'},{speaker:'kexin',expression:'smile',text:'開學第一天，下課不要先走。'},{set:{KX_VDAY_MAKEUP:true}},   /* AA_877 #10：兌現＝大一下開學第一天下課（ev_kexin_vday_makeup_y1）*/   /* AA_373 #10：第一次「我們的日子」在第 2 週（3/2 她才傳；第一個週末 2/28～3/1 已經過了）*/
      {label:'end'},{speaker:'kexin',expression:'smile',text:'情人節快樂。臺北冷，穿厚一點。'} ],
    after:G=>{ const F=G.flags; F.KX_VDAY=Object.assign({},F.KX_VDAY||{},{1:'video'}); if(F._kxVwx){ F.KX_VDAY_WX=Object.assign({},F.KX_VDAY_WX||{},{1:F._kxVwx}); delete F._kxVwx; } } },
  /* 情人節補過（CANON-NO-ECON-1112 第四批，AA_877 #10）：情人節視訊選二、選三的（KX_VDAY_MAKEUP），大一下開學第一週第一次下課，她在教室門口等，一句，然後照一般約會邀約（地點玩家選，INV.flow）*/
  { id:'ev_kexin_vday_makeup_y1', title:'', participants:['kexin'], location:'any', trigger:'class', term:['Y1S2'], weeks:[1], carryTo:2, once:true, background:'blur',
    afterClass:function(it){ return !!(it&&it.c&&!it.exam); },
    prereq:{custom:G=>G.flags.dating_kexin===true&&!!G.flags.KX_VDAY_MAKEUP},
    dialogue:[ {speaker:null,text:'（她在教室門口等。）'},{speaker:'kexin',text:'走。情人節補過。'},
      {call:async(G,GM)=>{ if(typeof INV!=='undefined'&&INV.flow) await INV.flow(GM,'kexin',null,false); }} ] },
  /* 9-3 K5「我們的日子」的第一次（同一週選的那一天）：照選的方式見面，短。沒到：「我等了二十分鐘。……下週同一天。這次不要讓我等。」（只一次；AA_313 第 2 節第 22 列，原本「我等了一下。沒關係，下週同一天。」太溫和）。舞台說明改旁白 */
  /* K5 之後每週的「我們的日子」（AA-B 2026-10-16 裁定）：一句地點字幕，接著 OUT.go 推進她的閒聊階梯（沒有新台詞）。
     第 5 週起第一次（K7 有準備東西的玩家）：字幕之後先說「你送的那個，我放在書桌上。」（只一次）。撞到別的出遊、選了別的＝「好，這週換一天。」；單純略過沒有台詞 */
  /* K7 準備的東西（AA-B 2026-10-16 裁定）：3/21（六）21:00 系統提示一次、四選一、記 K7_GIFT；那時在睡覺或跳過的，3/22 起床時再問；3/22 18:00 前都沒選＝什麼都沒準備（她照「你人來了就好。」，不扣分；AA_209 附錄B §2） */
  { id:'ev_k7_gift_prep', title:'週年的準備', participants:[], location:'any', trigger:'auto', once:true, background:'blur',
    prereq:{custom:G=>{ if(!G.flags.dating_kexin||!G.flags.KX_ANNIV_PLACE||G.flags.K7_GIFT!=null||typeof STORY==='undefined'||!STORY.kxAnnivDay) return false; const a1=STORY.kxAnnivDay(G,1); return a1!=null&&((G.day===a1-1&&G.hour>=21)||(G.day===a1&&G.hour<18.5)); }},
    dialogue:[ {if:{custom:G=>typeof STORY!=='undefined'&&G.day===STORY.kxAnnivDay(G,1)-1},speaker:null,text:'明天是週年。你準備的東西：'},{if:{custom:G=>typeof STORY!=='undefined'&&G.day===STORY.kxAnnivDay(G,1)},speaker:null,text:'今天是週年。你準備的東西：'},
      /* CANON-NO-ECON-1112 第四批（AA_879 第 3 節）：值照舊、意思換——ticket＝在一起那頓飯的發票（只有第一年）、planner＝一副耳環、dumpling＝後門那家的湯餃 */
      {choice:[{text:'在一起那頓飯的發票，背面寫了那天的日期',set:{K7_GIFT:'ticket'}},{text:'一副耳環',set:{K7_GIFT:'planner'}},{text:'後門那家的酸辣湯餃（外帶）',unless:{flagIs:{KX_ANNIV_PLACE:'shop'}},set:{K7_GIFT:'dumpling'}},{text:'什麼都沒準備',set:{K7_GIFT:'none'}}]} ] },   /* AA_313 第 2 節第 10 列：地點選政大山下＝湯餃那個選項不出（在同一家收到同一家的外帶）*/
  /* 9-4 K7 交往週年（2026-03-22）：出門前選準備的東西（K7_GIFT，AA-B 確認中的提案：出發前選）→ 她收到的反應 → 她的卡片第一頁的假設題 → 旁白。記 KX_ANNIV {1:place}。不做 CG。
     沒去（婉拒、沒到）：KX_ANNIV {1:'missed'}，卡片的照片「週年快樂。下次你準備。」隔天中午（AA_313 第 2 節第 10 列；當晚的電話 CANON-NO-ECON-1112 第三批拿掉）。卡片之後變成宿舍的房間物件「她的週年卡片」（AA-B 2026-10-16：說明用卡片第一頁那句，story3d.js roomItemList）*/
  { id:'ev_kexin_anniversary_y1', title:'週年', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:2.5,
    beforeOuting:(G,GM,q)=>{ if(G.flags.K7_GIFT==null) G.flags.K7_GIFT='none'; G.flags._kxEarly=!!(q&&q.early); },   /* AA-B 2026-10-16：準備的東西在前一晚 21:00 選（ev_k7_gift_prep）；18:00 前都沒選＝什麼都沒準備。_kxEarly：提前到學期最後一天（AA_879 第 1 節）*/
    outingMissed:(G,GM,q)=>{ G.flags.KX_ANNIV=Object.assign({},G.flags.KX_ANNIV||{},{1:'missed'}); if(typeof STORY!=='undefined'&&STORY.kxAnnivMissed) STORY.kxAnnivMissed(G,1,q&&q.day!=null?q.day:G.day); },   /* AA_313 第 2 節第 10 列：當晚 21:00 她打來（2-3 A）、卡片的照片改到隔天中午（story3d.js S.kxAnnivMissed）*/
    /* CANON-NO-ECON-1112 第四批：照 AA_879（定稿）重寫——地點 shop＝學校後門・湯餃店（深色底＋字幕）、發票、耳環、卡片第一頁換整組（在一起是那頓飯回去的路上）*/
    dialogue:[ {if:{flagIs:{KX_ANNIV_PLACE:'wheel'}},scene:'摩天輪',bg:'ferris_wheel'},{if:{flagIs:{KX_ANNIV_PLACE:'shop'}},scene:'學校後門・湯餃店',bg:'dark'},{if:{flagIs:{KX_ANNIV_PLACE:'river'}},scene:'河堤',bg:'riverside'},
      {if:{flags:['_kxEarly']},speaker:'kexin',expression:'neutral',text:'提早過。那天我在高雄，這個我不想用視訊。'},
      {if:{flagIs:{K7_GIFT:'ticket'}},goto:'g1'},{if:{flagIs:{K7_GIFT:'planner'}},goto:'g2'},{if:{flagIs:{K7_GIFT:'dumpling'}},goto:'g3'},{goto:'g4'},
      {label:'g1'},{speaker:null,text:'（她把發票翻到背面，看了那個日期很久。）'},{speaker:'kexin',expression:'surprised',text:'你留這個？'},{speaker:'player',text:'夾在我書桌的桌墊下面，夾了一年。'},{speaker:'kexin',expression:'neutral',text:'你有對過獎嗎？'},{speaker:'player',text:'沒有。'},{speaker:'kexin',expression:'smile',text:'（笑了）很好。中了也不要去換。這張歸我。'},{goto:'card'},
      {label:'g2'},{speaker:null,text:'（她當場把原本那一邊拆下來，換上去。）'},{speaker:'kexin',expression:'smile',text:'好看嗎？不用回答，我知道。'},{goto:'card'},
      {label:'g3'},{speaker:'kexin',expression:'surprised',text:'這是禮物？'},{speaker:'player',text:'是。'},{speaker:'kexin',expression:'laugh',text:'這是我收過最燙的禮物。'},{goto:'card'},
      {label:'g4'},{speaker:'kexin',expression:'smile',text:'你人來了就好。'},{speaker:null,text:'（她把卡片推過來）'},   /* AA_209 附錄B §2 */
      {label:'card'},{speaker:'kexin',expression:'smile',text:'（把卡片翻到第一頁）那天吃完飯，回去的路上，我們說好在一起。我還記得是哪一盞路燈。'},{speaker:'kexin',expression:'teasing',text:'一年了。你有沒有後悔過？'},
      {choice:[{text:'「沒有。」',goto:'c1'},{text:'「有一次。妳罵我那次。」',goto:'c2'},{text:'（握住她的手）',goto:'c3'}]},
      {label:'c1'},{speaker:'kexin',expression:'smile',text:'回答太快。可是我收。'},{goto:'end'},
      {label:'c2'},{speaker:'kexin',expression:'surprised',text:'哪一次？我罵很多次。'},{speaker:'kexin',expression:'smile',text:'……好。那次我也記得。我後來有去找你。'},{goto:'end'},
      {label:'c3'},{speaker:null,text:'（她沒有說話。手握緊了一點。）'},
      {label:'end'},{speaker:null,text:'後面幾頁，她說：『回去再看。』'} ],
    after:G=>{ G.flags.KX_ANNIV=Object.assign({},G.flags.KX_ANNIV||{},{1:G.flags.KX_ANNIV_PLACE||'shop'}); delete G.flags._kxEarly; } },
  /* K7 第二～四年（AA_224 2-c，AA-C ff3f2a4b；排程 story3d.js）：結構同第一年。準備的東西：前一晚 21:00 起、當天 18:30 前選，四選一照第一年，記 K7_GIFT_n（STORY.kxAnnivGiftYear 算第幾年）*/
  { id:'ev_k7_gift_prep_n', title:'週年的準備', participants:[], location:'any', trigger:'auto', background:'blur',
    prereq:{custom:G=>typeof STORY!=='undefined'&&!!STORY.kxAnnivGiftYear&&STORY.kxAnnivGiftYear(G)>0},
    dialogue:[ {if:{custom:G=>STORY.kxAnnivGiftYear(G,true)>0},speaker:null,text:'明天是週年。你準備的東西：'},{unless:{custom:G=>STORY.kxAnnivGiftYear(G,true)>0},speaker:null,text:'今天是週年。你準備的東西：'},
      {choice:[/* AA_879 第 3 節：發票只有第一年 */{text:'一副耳環',set:{_K7G:'planner'}},{text:'後門那家的酸辣湯餃（外帶）',unless:{custom:G=>{ const n=STORY.kxAnnivGiftYear(G); return !!n&&G.flags['KX_ANNIV_PLACE_'+n]==='shop'; }},set:{_K7G:'dumpling'}},{text:'什麼都沒準備',set:{_K7G:'none'}}]} ],   /* AA_313 第 2 節第 10 列：那一年地點是政大山下＝湯餃不出 */
    after:G=>{ const n=STORY.kxAnnivGiftYear(G); if(n) G.flags['K7_GIFT_'+n]=G.flags._K7G||'none'; delete G.flags._K7G; } },
  /* K7 第二～四年的週年：地點（q.ap）、第幾年（q.year）由排程帶進來；她收到的反應照第一年；卡片換句：第二年「第二年。」、第三年「第三年。」（AA_259 (b) 第 5 點：原本「第三年。我們好像…」）、第四年「第四年。」（選項同第三年）、第五年「第五年。……明年的卡片，換你寫。」（自己的一組選項，AA_363 T1）、第六年卡片在祐廷手上（y6，AA_472 第 3 節；排程 story3d.js 的 n===6）。
     卡片第一頁「那天在最高的地方，你說在一起吧。我說好。」（AA_303 第 2 節 9）只在第一年。記 KX_ANNIV {n:地點}；沒去＝卡片的照片（同第一年），KX_ANNIV {n:'missed'} */
  { id:'ev_kexin_anniversary_yn', title:'週年', participants:['kexin'], location:'any', trigger:'outing', background:'dark', hours:2.5,
    beforeOuting:(G,GM,q)=>{ const F=G.flags, n=(q&&q.year)||2; F._kxAY=n; F._kxEarly=!!(q&&q.early); F._kxAP=(q&&q.ap)||F['KX_ANNIV_PLACE_'+n]||'shop'; if(F['K7_GIFT_'+n]==null) F['K7_GIFT_'+n]='none'; F._kxAG=F['K7_GIFT_'+n];
      const pg=n-1===1?F.K7_GIFT:F['K7_GIFT_'+(n-1)], pr=F.KX_ANNIV&&F.KX_ANNIV[n-1]; F._kxAGR=['ticket','planner','dumpling'].includes(F._kxAG)&&pg===F._kxAG&&!!pr&&pr!=='missed'&&pr!=='video'; },   /* AA_313 第 2 節第 36 列：和前一年送一樣的（前一年有見到面、她收到了）＝換句 */
    outingMissed:(G,GM,q)=>{ const n=(q&&q.year)||2; G.flags.KX_ANNIV=Object.assign({},G.flags.KX_ANNIV||{},{[n]:'missed'}); if(typeof STORY!=='undefined'&&STORY.kxAnnivMissed) STORY.kxAnnivMissed(G,n,q&&q.day!=null?q.day:G.day); },   /* AA_313 第 2 節第 36 列：同第一年（2-3 A）*/
    dialogue:[ {if:{flagIs:{_kxAP:'wheel'}},scene:'摩天輪',bg:'ferris_wheel'},{if:{flagIs:{_kxAP:'shop'}},scene:'學校後門・湯餃店',bg:'dark'},{if:{flagIs:{_kxAP:'river'}},scene:'河堤',bg:'riverside'},   /* AA_879 第 2 節 */
      {if:{flags:['_kxEarly']},speaker:'kexin',expression:'neutral',text:'提早過。那天我在高雄，這個我不想用視訊。'},
      /* 第五年：地點之後只留一句（AA_879 第 4 節：寫死的年份、放榜、證書月份拿掉）*/
      {if:{flagIs:{_kxAY:5}},speaker:'kexin',expression:'smile',text:'五年。'},
      /* 第六年（AA_472 第 3 節，企劃線 1ebcf530e；2030-10-17）：地點之後一句；第五年選了「寫什麼？」（KX_ANNIV5_WHAT）的換一句 */
      {if:{flagIs:{_kxAY:6}},unless:{flags:['KX_ANNIV5_WHAT']},speaker:'kexin',expression:'smile',text:'六年。……今年是你寫。'},
      {if:{flagIs:{_kxAY:6},flags:['KX_ANNIV5_WHAT']},speaker:'kexin',expression:'smile',text:'六年。……你想好要寫什麼了嗎？'},
      {if:{flagIs:{_kxAG:'ticket'}},goto:'g1'},{if:{flagIs:{_kxAG:'planner'}},goto:'g2'},{if:{flagIs:{_kxAG:'dumpling'}},goto:'g3'},{goto:'g4'},
      {label:'g1'},{speaker:null,text:'（她把發票翻到背面，看了那個日期很久。）'},{speaker:'kexin',expression:'surprised',text:'你留這個？'},{speaker:'player',text:'夾在我書桌的桌墊下面，夾了一年。'},{speaker:'kexin',expression:'neutral',text:'你有對過獎嗎？'},{speaker:'player',text:'沒有。'},{speaker:'kexin',expression:'smile',text:'（笑了）很好。中了也不要去換。這張歸我。'},{goto:'card'},   /* AA_879：發票只有第一年（這裡給舊存檔第二年以後還記著 ticket 的）*/
      {label:'g2'},{if:{flags:['_kxAGR']},speaker:'kexin',expression:'teasing',text:'又是耳環。我本來一年只買一副，現在一年有兩副了。'},{if:{flags:['_kxAGR']},goto:'card'},{speaker:null,text:'（她當場把原本那一邊拆下來，換上去。）'},{speaker:'kexin',expression:'smile',text:'好看嗎？不用回答，我知道。'},{goto:'card'},   /* AA_879 第 3 節：耳環（第一次／前一年也送）*/
      {label:'g3'},{if:{flags:['_kxAGR']},speaker:'kexin',expression:'smile',text:'又是這個。……好，我吃。'},{if:{flags:['_kxAGR']},goto:'card'},{speaker:'kexin',expression:'surprised',text:'這是禮物？'},{speaker:'player',text:'是。'},{speaker:'kexin',expression:'laugh',text:'這是我收過最燙的禮物。'},{goto:'card'},
      {label:'g4'},{speaker:'kexin',expression:'smile',text:'你人來了就好。'},{unless:{flagIs:{_kxAY:6}},speaker:null,text:'（她把卡片推過來）'},   /* 第六年卡片在祐廷手上（卡片那一段換成 y6）：這一句不出 */
      {label:'card'},{if:{flagIs:{_kxAY:3}},goto:'y3'},{if:{flagIs:{_kxAY:4}},goto:'y4'},{if:{flagIs:{_kxAY:5}},goto:'y5'},{if:{flagIs:{_kxAY:6}},goto:'y6'},   /* 第五年：AA_363 T1（卡片第一頁一句＋自己的一組選項）；第六年：AA_472 第 3 節（卡片是祐廷寫的，不加選項）*/
      {speaker:'kexin',expression:'smile',text:'（把卡片翻到第一頁）第二年。'},
      {choice:[{text:'「明年也是。」',goto:'a1'},{text:'「時間好快。」',goto:'a2'},{text:'（握住她的手）',goto:'a3'}]},
      {label:'a1'},{speaker:'kexin',expression:'teasing',text:'你說的喔。'},{goto:'end'},
      {label:'a2'},{speaker:'kexin',expression:'smile',text:'對啊。我還以為你會忘記。'},{speaker:'kexin',expression:'smile',text:'……你沒有。'},{goto:'end'},
      {label:'a3'},{speaker:null,text:'（她沒有說話。手握緊了一點。）'},{goto:'end'},
      /* 第五年（AA_363 T1）：接 3-2 開頭「我們兩個，同一年開始」；不用第三、四年那一組（那組回的是第三年「會一直轉下去」）。數值、旗標照第二～四年（都沒有）*/
      {label:'y5'},{unless:{flags:['KX_CARD_MINE']},speaker:'kexin',expression:'smile',text:'（把卡片翻到第一頁）第五年。……明年的卡片，換你寫。'},{if:{flags:['KX_CARD_MINE']},speaker:'kexin',expression:'smile',text:'（把卡片翻到第一頁）第五年。……明年的卡片，又換你寫。'},   /* AA_525 3-4：KX_CARD_MINE 的「又換你寫」*/
      {choice:[{text:'「好。」',goto:'d1'},{text:'「寫什麼？」',goto:'d2'},{text:'（把卡片收進外套口袋）',goto:'d3'}]},
      {label:'d1'},{speaker:'kexin',expression:'teasing',text:'你說的喔。……錯字我會圈起來。'},{goto:'end'},
      {label:'d2'},{set:{KX_ANNIV5_WHAT:true}},{speaker:'kexin',expression:'laugh',text:'你自己想。……你想五年了吧。'},{goto:'end'},   /* KX_ANNIV5_WHAT：第六年地點之後那一句換（AA_472 第 3 節）*/
      {label:'d3'},{speaker:null,text:'（她看著你收好，嘴角動了一下。）'},{goto:'end'},
      {label:'y3'},{speaker:'kexin',expression:'smile',text:'（把卡片翻到第一頁）第三年。'},{goto:'b0'},   /* AA_259 (b) 第 5 點 K13（AA_312 第 3 節 B-7）：第三年的卡片句、b0 選項與回覆 */
      /* 第四年（AA_378 #10，企劃線 5cd35678；照 BB_209 第 4 節、AA_224 2-c）：自己一組選項；原本接第三年那組（「會啊。」「轉到頭暈怎麼辦？」回的是第三年「會一直轉下去」）*/
      {label:'y4'},{unless:{flags:['KX_CARD_MINE']},speaker:'kexin',expression:'smile',text:'（把卡片翻到第一頁）第四年。'},   /* AA_879 第 4 節：不寫死畢業 */
      /* AA_525 3-4（K-5，企劃線 6081f725f）：第三年說「明年換我寫。」（KX_CARD_MINE）的，第四年（臺灣、日本路線；美國路線第四年是視訊，不改）換這三句，後面接現有的三個選項 */
      {if:{flags:['KX_CARD_MINE']},speaker:null,text:'（這一次，第一張卡片是你寫的。你把它推過去。）'},{if:{flags:['KX_CARD_MINE']},speaker:'kexin',expression:'smile',text:'（翻開，讀完）……你的字。'},{if:{flags:['KX_CARD_MINE']},speaker:'kexin',expression:'smile',text:'第四年。'},
      {choice:[{text:'「明年也一起過。」',goto:'c1'},{text:'「時間好快。」',goto:'c2'},{text:'（不說話，看著她）',goto:'c3'}]},
      {label:'c1'},{speaker:'kexin',expression:'smile',text:'好。你講的。'},{goto:'end'},
      {label:'c2'},{speaker:'kexin',expression:'smile',text:'對啊。那時候在教室，是我先跟你講話的。你不要忘記。'},{goto:'end'},
      {label:'c3'},{speaker:'kexin',expression:'teasing',text:'幹嘛一直看。'},{goto:'end'},
      {label:'b0'},{choice:[{text:'「明年換我寫。」',goto:'b1'},{text:'「每年都寫這麼多？」',goto:'b2'},{text:'（不說話，看著她）',goto:'b3'}]},
      {label:'b1'},{speaker:'kexin',expression:'smile',text:'好。要手寫喔。'},{set:{KX_CARD_MINE:true}},{goto:'end'},   /* AA_525 3-4（K-5）：記 KX_CARD_MINE＝第四年的第一張卡片是祐廷寫的 */
      {label:'b2'},{speaker:'kexin',expression:'teasing',text:'你每年都只看第一頁。'},{goto:'end'},
      {label:'b3'},{speaker:'kexin',expression:'teasing',text:'幹嘛一直看。'},
      {label:'end'},{speaker:null,text:'後面幾頁，她說：『回去再看。』'},{goto:'fin'},
      /* 第六年（AA_472 第 3 節）：卡片在你的外套口袋裡（第五年「明年的卡片，換你寫。」）；不加選項；數值、旗標照第二～五年（KX_ANNIV {6}）*/
      {label:'y6'},{speaker:null,text:'（這一次，卡片在你的外套口袋裡。你把它推過去。）'},{speaker:null,text:'（她翻開第一頁，看了很久。從包包拿出一支紅筆。）'},
      {speaker:'kexin',expression:'teasing',text:'（圈了一個字）……這個字寫錯了。'},{speaker:'kexin',expression:'smile',text:'留著。不要改。'},{speaker:null,text:'（她把卡片收進包包最裡面那一層。）'},
      {label:'fin'} ],
    after:G=>{ const F=G.flags, n=F._kxAY||2; F.KX_ANNIV=Object.assign({},F.KX_ANNIV||{},{[n]:F._kxAP||'shop'}); delete F._kxAY; delete F._kxAP; delete F._kxAG; delete F._kxAGR; delete F._kxEarly; } },
  /* K7 第四年他在美國（交換路線 US、那天在國外；STORY.kxAnnivVideo）：她那邊晚上九點、他那邊早上，視訊（AA_224 2-c）。不選地點與禮物。記 KX_ANNIV {4:'video'}；沒接＝{4:'missed'} */
  /* AA_879 第 1 節：祐廷那天在國外（交換）的那一年都用這一場（原本只有第四年美國）；第幾年由排程帶進來（q.year），沒有＝4。once 拿掉（不同年可以各一次）*/
  { id:'ev_kexin_anniversary_video', title:'週年', participants:['kexin'], location:'any', trigger:'outing', background:'dark', hours:0.5,
    beforeOuting:(G,GM,q)=>{ G.flags._kxAVY=(q&&q.year)||4; },
    outingMissed:(G,GM,q)=>{ G.flags.KX_ANNIV=Object.assign({},G.flags.KX_ANNIV||{},{[(q&&q.year)||4]:'missed'}); },
    dialogue:[ {scene:'視訊',bg:'video'},
      {speaker:'kexin',expression:'smile',text:'週年快樂。你那邊是早上吧。'},{speaker:'kexin',expression:'neutral',text:'卡片我寄了，下禮拜才會到。'},{speaker:'kexin',expression:'smile',text:'……你回來我們再去一次摩天輪。'} ],
    after:G=>{ const n=G.flags._kxAVY||4; G.flags.KX_ANNIV=Object.assign({},G.flags.KX_ANNIV||{},{[n]:'video'}); delete G.flags._kxAVY; } },
  { id:'ev_dorm_late_kai', title:'半夜', participants:['kai'], location:'dorm', trigger:'enter', time:[23.5,26], term:['Y1S1','Y1S2'], cooldown_days:2, random_weight:0.7, background:'blur', prereq:{flags:['introDone']},   /* BB_170 第 21 列：day_min 3 → introDone 以後；AA_209 第 4 節第 11 點：「什麼 bug？」那一段只播一次（KAI_BUG_TOLD），之後只剩另外兩個選項。AA_502 第 6 節第 8 點：23:30 以後（原本 23:00） */
    dialogue:[ {if:{flags:['DORM_FOUR'],custom:G=>KAI_LATE_BEDS(G)==='both'},speaker:null,text:'（阿哲和柏翰都上床了。柏翰戴著耳塞。）'},{if:{flags:['DORM_FOUR'],custom:G=>KAI_LATE_BEDS(G)==='zhe'},speaker:null,text:'（阿哲已經上床了。柏翰的床還是空的。）'},   /* AA_502 第 6 節第 8 點：照誰在床上（都不在＝不說；AA 沒寫只有柏翰的＝不說）；原本一律「（阿哲已經睡了，柏翰戴著耳塞。）」*/{if:{custom:KAI_LATE_BUG},speaker:'kai',expression:'neutral',text:'（頭沒回）欸，你回來了。我這個 bug 追到第三小時。'},{unless:{custom:KAI_LATE_BUG},speaker:'kai',expression:'neutral',text:'在等編譯，你先洗澡。'},   /* 四人房（AA_208 2-4）*/{choice:[{text:'「去睡啦。」',consequences:{rel:{kai:{fam:1,comf:1}}}},{text:'「什麼 bug？」',unless:{flags:['KAI_BUG_TOLD']},consequences:{rel:{kai:{fam:2,trust:1}},flags:{KAI_BUG_TOLD:true}},goto:'bug'},{text:'（戴上耳機）',consequences:{}}]},{goto:'end'},{label:'bug'},{speaker:'kai',expression:'tired',text:'一個值應該是 0 結果是 undefined。……你們法律系有這種東西嗎？'},{speaker:'player',text:'有。叫「法無明文」。'},{speaker:'kai',expression:'laugh',text:'（他笑了一聲，轉回去打字）好啦，你贏。'},{label:'end'} ] },
  /* VA-07 柏翰的週四總圖（AA_241 第 5 節，AA 定稿）：大一暑假第一次在週四的總圖和柏翰說話（ACQUAINTANCE 以上）演一次；「一起讀？」記 BOHAN_SUMMER_THU。
     之後的週四：短招呼（一週一次，接著照一般閒聊）。他在總圖的時間在 characters.js 的作息（STORY.bohanSummer）*/
  { id:'ev_va07_bohan_thu', title:'新竹到這裡', participants:['classmate_bohan'], location:'library', trigger:'interact', priority:8, once:true, weekday:[4], background:'blur',
    prereq:{stage:{npc:'classmate_bohan',min:'ACQUAINTANCE'},custom:G=>!!(typeof STORY!=='undefined'&&STORY.bohanSummer&&STORY.bohanSummer(G))},
    dialogue:[ {speaker:null,text:'（總圖三樓，柏翰坐在靠窗的位子。桌上放著客運的票根。）'},
      {speaker:'classmate_bohan',text:'新竹到這裡，一小時二十分。單程。'},{speaker:'classmate_bohan',text:'在家讀不下去。家裡冷氣太涼，我會睡著。'},
      {choice:[{text:'「每週都來？」',goto:'a'},{text:'「一起讀？」',goto:'b'}]},
      {label:'a'},{speaker:'classmate_bohan',text:'每週四。九點到五點。'},{goto:'end'},
      {label:'b'},{speaker:'classmate_bohan',text:'好。我的計時器五十分鐘響一次，你不要嚇到。'},{set:{BOHAN_SUMMER_THU:true}},
      {label:'end'} ] },
  { id:'ev_va07_bohan_thu_greet', title:'週四的招呼', participants:['classmate_bohan'], location:'library', trigger:'interact', priority:7, weekday:[4], cooldown_days:6, background:'blur',
    prereq:{events:['ev_va07_bohan_thu'],custom:G=>!!(typeof STORY!=='undefined'&&STORY.bohanSummer&&STORY.bohanSummer(G))&&(G.events.last||{}).ev_va07_bohan_thu!==G.day},
    dialogue:[ {speaker:null,text:'（他抬頭點了一下，指了指旁邊的位子。）'} ] },
  { id:'ev_library_closing', title:'閉館', participants:[], location:'library', trigger:'auto', time:[21.6,22.2], cooldown_days:1, background:'freeze',
    dialogue:[ {speaker:null,text:'「本館將於十分鐘後閉館——」廣播響起，整個閱覽室同時發出收東西的聲音。'} ], consequences:{goal:'總圖要閉館了'} },
  /* AA_498 2-9（AA-C 2026-10-28）：①「你確定在教室看過」只給在教室出現的人，其他人換成「在〈他的地點〉看過」（POOL.greetPlace：表上的地點）；
     ②pool_greeted 一次見面用完就清掉（原本設了就一直在，之後選「假裝看手機」也加熟悉）。對象＝這一區第一個看過三次（RECOGNIZABLE）、還沒打過招呼的（POOL.greetTarget，開場記下來、演完照同一個人）*/
  { id:'ev_pool_greet', title:'好像認識的人', participants:[], location:['campus','library'], trigger:'auto', time:[8,22], day_min:3, cooldown_days:1, random_weight:1.2, prereq:{custom:(G,GM)=>{ return Object.keys(GM.npc).some(id=>id.startsWith('pool_')&&SOCIAL.reveal(id)==='RECOGNIZABLE'&&!G.flags['greet_'+id]); }}, background:'freeze',
    dialogue:[ {call:(G,GM)=>{ const P=typeof POOL!=='undefined'?POOL:null; G.flags.POOL_GREET_ID=(P&&P.greetTarget?P.greetTarget(G,GM):null)||Object.keys(GM.npc).find(id=>id.startsWith('pool_')&&SOCIAL.reveal(id)==='RECOGNIZABLE'&&!G.flags['greet_'+id])||null; G.flags.POOL_GREET_AT=P&&P.greetPlace?P.greetPlace(G,GM):'教室'; }},
      {speaker:null,text:'迎面走來一個人，你確定在{flag:POOL_GREET_AT|教室}看過。對方也放慢了一步。'},{choice:[{text:'點頭',consequences:{flags:{pool_greeted:true}}},{text:'假裝看手機',consequences:{}}]},{speaker:null,text:'（有些人就是這樣，從「好像認識」開始的。）'} ],
    after:(G,GM)=>{ const id=G.flags.POOL_GREET_ID||Object.keys(GM.npc).find(k=>k.startsWith('pool_')&&SOCIAL.reveal(k)==='RECOGNIZABLE'&&!G.flags['greet_'+k]); if(id){ G.flags['greet_'+id]=true; if(G.flags.pool_greeted) SOCIAL.adjust(id,{fam:3}); } delete G.flags.pool_greeted; delete G.flags.POOL_GREET_ID; delete G.flags.POOL_GREET_AT; } },
  { id:'ev_an_report_followup', title:'報告的結論', participants:['heroine_01'], location:'library', trigger:'interact', priority:9, once:true, prereq:{flags:['afternoonDone'],events:['ev_an_report_split'],notMemory:[{npc:'heroine_01',tag:'REPORT_PARTNER'}]}, day_min:3, background:'blur',   /* 交接包 v1 A12 之後（LAWWW 2026-10-14；AA_355 第 2 節：AA 看過、照用）：報告分工問過、你說「我已經有組了」——她寫完在總圖給你看。一起寫的、沒有分工那一段的玩家沒有這一場 */
    dialogue:[ {speaker:'heroine_01',expression:'neutral',text:'（小聲）報告我寫完了。'},{if:{choice:{cafeView:'C'}},speaker:'heroine_01',expression:'smile',text:'（小聲）結論用了那天你說的「無過失」。周老師如果打槍我，我就說是你的主意。'},{if:{choice:{cafeView:'B'}},speaker:'heroine_01',expression:'thinking',text:'（小聲）我把你說的「後果自己承擔」寫進反方。寫起來比正方順。'},{if:{choice:{cafeView:'A'}},speaker:'heroine_01',expression:'smile',text:'（小聲）「不能讓人因為一個手誤賠十倍」——我放在結論。'},{if:{custom:G=>!!(G.choices&&(G.choices.cafeView==='A'||G.choices.cafeView==='B'))},speaker:'heroine_01',expression:'neutral',text:'（小聲）那天謝謝。'},
      {if:{custom:G=>!!(G.choices&&G.choices.cafeView)},choice:[{text:'「妳寫得出來，我只是坐在旁邊。」',consequences:{rel:{heroine_01:{comf:4,aff:2}},mem:[{npc:'heroine_01',tag:'HELPED_WITH_REPORT'}]}},{text:'「下次換我請。」',set:{AN_TREAT_OWED:true},consequences:{rel:{heroine_01:{fam:3,aff:3}},mem:[{npc:'heroine_01',tag:'IMPORTANT_CONVERSATION',note:'你說下次換你請'}]}}]},
      /* AA_358 2-4（AA-C 2026-10-21 659d9d81）：拒絕咖啡廳（沒有 cafeView）的玩家沒有「那天」——換一句、換選項（數值照原本兩個選項；第一個不記「幫她寫報告」：沒有一起寫）*/
      {unless:{custom:G=>!!(G.choices&&G.choices.cafeView)},speaker:'heroine_01',expression:'neutral',text:'（小聲）你先看。哪裡不通直接講。'},
      {unless:{custom:G=>!!(G.choices&&G.choices.cafeView)},choice:[{text:'「妳寫得出來的。」',consequences:{rel:{heroine_01:{comf:4,aff:2}}}},{text:'「改天請妳喝咖啡。」',set:{AN_TREAT_OWED:true},consequences:{rel:{heroine_01:{fam:3,aff:3}},mem:[{npc:'heroine_01',tag:'IMPORTANT_CONVERSATION',note:'你說改天請她喝咖啡'}]}}]},
      {speaker:'heroine_01',expression:'smile',text:'（小聲）好。'} ] },
  /* ★E21 除夕的電話（AA_224 3-10 @31708531＝BB_188 A2-1e，最後一句改；交往中的版本）：1/28（二）22:00 在家（寒假／在家模式的選單到這個時間就演，home3d.js；trigger:'home'）。
     她在外婆家、他在家（不在家＝在外面接，ev_y0_e21o）。記 E21_CALLED（兩個只演一個）。原本的 E21_ANSWER 不再寫。
     AA_303 第 2 節 14 整段換：她約你大年初三開車去高雄（兩個選項都記 KH_TRIP，高雄三天兩夜讀它）；阿嬤那段和 KX_THINK_LEAVE 的第三個選項拿掉 */
  /* AA_307 第 12 列：人在外面接，不出「家」字幕 */   /* 不在家（休學後可以出門）也會接到：在外面自動演 */
  /* CANON-1112（AA_856 第 4 節「整場拿掉」）：8/30 開車載她搬宿舍那一場（原本接在這裡）整段拿掉 */
  /* D7（交接包 v3 第 8～9 週）：G1 考完走出教室（大二上版，AA_143 1-4）＋語彤事件 10 期中考那一週（AA_11 事件 10、AA_177 第 5 節）。
     G1：刑法分則期末考考完（D118 沒有期中考，AA_578 第 2 節 #9：原本期中考），在教室門口接著演（classes3d.js 的 afterClassEvent：afterExam 'final'）；有去考才有、翹考＝沒有；只有認識的人；考題只說「第三題」。
     語彤 10：大二上第 10 週起，週二或週四 20:45～21:15 在麵店（打烊的時候）、和語彤「朋友」以上；大二上沒遇到延到大二下，大二下結束還沒遇到＝不演。
       那週去過麵店、阿姨說過扭到手（yutong_hospital，大一下事件 4）的玩家第一句換一句；「我那週有注意到妳的位子空著。」只有大一下期中那兩週真的去過總圖才有（Y1_MID_LIB，story3d.js onEnter 記；舊存檔看習慣記錄）*/
  { id:'ev_midterm_walkout_y2', title:'考完試走出教室', participants:[], location:'any', trigger:'class', afterClass:'crim_spec', afterExam:'final', term:['Y2S1'], once:true, background:'blur', /* D118 沒有期中考：AA_578 第 2 節 #9 改到同一門課的期末考（afterExam:'final'）*/
    dialogue:[ {speaker:'zhe',expression:'neutral',text:'第三題我寫了一整面，寫完才發現是第二題的答案。'},
      {if:EV_KNOWS('classmate_bohan'),speaker:'classmate_bohan',expression:'neutral',text:'第四題時間不夠，我最後一段沒寫。'}   /* AA_428 §2 第 2 點：換成 AA_211 3-3（原本 AA_313 5-5「大家都考幾分？……不對，大家覺得考得怎樣？」：問句沒有選項可以回、自己改口）*/,
      {if:EV_KNOWS('heroine_01'),speaker:'heroine_01',expression:'neutral',text:'考完的題目，不要對答案。改不了。'},
      {if:EV_KNOWS('heroine_01'),speaker:null,text:'（說完，她自己翻開課本查了一題。）'} ] },
  { id:'ev_yutong_midterm_week', retired:true, title:'期中考那一週', participants:['heroine_03'], location:'noodle',   /* retired：AA_624（使用者 11-03）拿掉「阿姨扭到手」這條線（事件 10 換成 10' 爸媽發現，台詞AA_625 再補）；舊存檔演過的照留 */ trigger:'auto', term:['Y1S2'], weekday:[2,4], time:[20.75,21.25], once:true,   /* AA_374 第 9 項：只在大一下（第 10 週起）、和 ev_yutong_thanks 互斥；大一下沒演到就不補（原本 Y2S1、Y2S2）*/
    prereq:{stage:{npc:'heroine_03',min:'FRIEND'},notEvents:['ev_yutong_thanks'],custom:G=>{ const t=typeof CALENDAR!=='undefined'&&CALENDAR.termOf(G.day); return !!t&&t.id==='Y1S2'&&t.week>=10; }},
    spawn:{npc:'heroine_03',at:{x:2.6,z:-3.6},pose:'idle'}, background:'blur',
    dialogue:[ {unless:{flags:['yutong_hospital']},speaker:'heroine_03',expression:'neutral',text:'大一期中考那週，你有沒有發現我不在圖書館？'},
      {if:{flags:['yutong_hospital']},speaker:'heroine_03',expression:'neutral',text:'你那週來過麵店，阿姨跟你講了吧。'},
      {speaker:'heroine_03',expression:'neutral',text:'阿姨扭到手。我每天顧店到打烊，在櫃台念社會學理論。客人都在看我念書。'},
      {speaker:'heroine_03',expression:'smile',text:'後來那科是我考最好的一科。很好笑。'},
      {choice:[{text:'「我那週有注意到妳的位子空著。」',if:{custom:G=>typeof STORY!=='undefined'&&!!STORY.y1MidLib&&STORY.y1MidLib(G)},goto:'seen'},{text:'「妳那時候為什麼不說？」',goto:'why'}]},
      {label:'seen'},{speaker:'heroine_03',expression:'neutral',text:'……你有注意到。'},{mem:[{npc:'heroine_03',tag:'NOTICED_EMPTY_SEAT',note:'大一下期中那週，他注意到她在總圖的位子空著'}]},{goto:'end'},
      {label:'why'},{speaker:'heroine_03',expression:'neutral',text:'說了你要來幫我顧店嗎？'},{speaker:'player',text:'可以啊。'},{speaker:'heroine_03',expression:'smile',text:'你連蔥都不會切。'},
      {label:'end'} ] },
  /* D8（交接包 v3 第 10 週）：校慶法服問答攤大二版（AA_71 2-5，BB 法律查核過：民法 §797、§798；台詞裡沒有人直接說出答案）＋哲 2 三種幫法（AA_40、AA_177 第 5 節）。
     校慶：11/14（六）10:00～16:00 椰林大道同一排攤位、加入法服才在攤位裡（沒加入的＝下面的路過版 ev_fair_booth_y2_pass，AA-B 682d911f；AA_355 1-2 另給的一句旁白版和它重複——AA_355 第 5 節第 5 題（2f1aaa22）：照現在、不換）；阿嬤第一句看大一有沒有遇過她（ev_sis_festival_booth）；
       三選一結果一樣；學姊（和她「有點熟」以上）在攤位後面那一句；記 GRANDMA_TREE_Y2（大四校慶的回聲，交接包 v5 第 3b 節）。
     哲 2：手機與出發選單在 story3d.js phoneRules（v3 D8）；2D 背景 ntu_court_night（ART-BG-COURT，沒有圖時是深色底＋字幕）。三個選項都不是錯的，不扣分 */
  { id:'ev_fair_booth_y2', title:'法律問答攤（大二）', participants:[], location:'campus', trigger:'auto', term:['Y2S1'], weeks:[10], weekday:[6], time:[10,16], once:true, near:{x:-17.8,z:13.0,r:4.5},
    prereq:{custom:G=>typeof STORY!=='undefined'&&!!STORY.fafuMember&&STORY.fafuMember(G)}, background:'blur',   /* 學姊大二以後不回法服（BB_194 §14；AA-C 01:2x）：不出現、她那句拿掉 */
    dialogue:[ {if:{events:['ev_sis_festival_booth']},speaker:'阿嬤',text:'少年欸，去年那棵樹，你記得嗎？'},
      {unless:{events:['ev_sis_festival_booth']},speaker:'阿嬤',text:'少年欸，去年你們這攤有個學姊，幫我看過樹的事。'},
      {speaker:'阿嬤',text:'我照你們學姊講的，先去跟隔壁講。他拖了兩個月才剪。'},{speaker:'阿嬤',text:'剪了以後，長得更好。現在又伸過來了。'},{speaker:'阿嬤',text:'還掉了一堆芭樂在我家。我可以吃嗎？'},
      {choice:[{text:'「芭樂是自己掉下來的，還是還長在樹上？」',set:{GRANDMA_Y2_ASK:'fruit'}},{text:'「樹枝伸過來，有擋到妳什麼嗎？」',set:{GRANDMA_Y2_ASK:'block'}},{text:'「這次妳跟隔壁講了嗎？」',set:{GRANDMA_Y2_ASK:'talk'}}]},
      {speaker:'阿嬤',text:'掉下來的有，樹上的也有。'},{speaker:'阿嬤',text:'樹枝擋到我曬衣服。'},{speaker:'阿嬤',text:'這次……還沒跟隔壁講。'},   /* AA-B 682d911f：原本的旁白改成阿嬤自己的三句 */
      {speaker:'player',text:'這幾件，答案不一樣。我寫下來。'},{speaker:'player',text:'下週六早上，值班的學長姊會在B館一樓。'},   /* AA_428 §2 第 4 點：11/14 是第 10 週，下一次值班 11/21＝下週六 */
      {speaker:'阿嬤',text:'好啦。這顆給你們。'},{speaker:null,text:'（一顆掉下來的芭樂）'},{set:{GRANDMA_TREE_Y2:'asked'}} ] },
  /* 沒加入法服：路過的版本（AA-B 682d911f，AA_71 2-5）：11/14 10:00～16:00 走到攤位附近，沒有選項。記 GRANDMA_TREE_Y2:'heard'（大四阿嬤那句兩種都成立）。
     顧攤的改柏翰（AA-C 2026-10-18 01:2x：語彤不加入法服、學姊大二以後不回法服；柏翰大二是法服社長，AA_71 原稿也是他）：語彤的兩句改由柏翰說、字不變；學姊不出現 */
  { id:'ev_fair_booth_y2_pass', title:'法律問答攤（路過）', participants:[], location:'campus', trigger:'auto', term:['Y2S1'], weeks:[10], weekday:[6], time:[10,16], once:true, near:{x:-17.8,z:13.0,r:4.5},
    prereq:{custom:G=>typeof STORY!=='undefined'&&!!STORY.fafuMember&&!STORY.fafuMember(G)&&!(G.events&&G.events.done&&G.events.done.ev_fair_booth_y2)}, background:'blur',
    dialogue:[ {speaker:null,text:'（法服的攤位前，一個阿嬤在說話。顧攤的是柏翰。）'},
      {speaker:'阿嬤',text:'掉下來的有，樹上的也有。'},{speaker:'阿嬤',text:'樹枝擋到我曬衣服。'},{speaker:'阿嬤',text:'這次……還沒跟隔壁講。'},
      {speaker:'classmate_bohan',expression:'neutral',text:'阿嬤，這三件要分開問，我先記下來。'},{speaker:'classmate_bohan',expression:'neutral',text:'下週六早上，B館一樓，有學長姊值班。'},   /* AA_428 §2 第 4 點 */
      {speaker:'阿嬤',text:'好啦。這顆給你們。'},
      {set:{GRANDMA_TREE_Y2:'heard'}} ] },
  { id:'ev_zhe_court_y2', title:'籃球場', participants:['zhe'], location:'any', trigger:'outing', once:true, background:'ntu_court_night', hours:1,
    dialogue:[ {speaker:'zhe',expression:'neutral',text:'（籃球場，一個人投籃）教授說，期末再沒過，我就要重修。'},{speaker:'zhe',expression:'neutral',text:'重修的時間跟練球撞。'},{speaker:'zhe',expression:'smile',text:'（投進）沒事啦。'},
      {choice:[{text:'「我筆記借你。」',set:{ZHE2:'notes',LENT_NOTES_Y2:true},consequences:{mem:[{npc:'zhe',tag:'LENT_NOTES_Y2',note:''}]},goto:'n'},
        {text:'「我陪你念。念完再去吃燒臘。」',set:{ZHE2:'study',STUDIED_WITH_ZHE:true},consequences:{mem:[{npc:'zhe',tag:'STUDIED_WITH_ZHE',note:'大二上陪他念民法，週二週四麵店念完再吃'}]},goto:'s'},
        {text:'「這個你要自己來。」',set:{ZHE2:'self'},goto:'f'}]},
      {label:'n'},{speaker:'zhe',expression:'laugh',text:'你的筆記？……字好醜。'},{speaker:null,text:'他還是收下了。'},{goto:'end'},
      {label:'s'},{speaker:'zhe',expression:'surprised',text:'你要陪我念？'},{speaker:null,text:'他停了一下。'},{speaker:'zhe',expression:'smile',text:'好。我請。'},{goto:'end'},
      {label:'f'},{speaker:'zhe',expression:'neutral',text:'嗯。我知道。'},{speaker:null,text:'他又投了一球。'},{speaker:'zhe',expression:'neutral',text:'……你講話跟我爸一樣。'},
      {label:'end'} ] },
  { id:'ev_zhe_court_skip', title:'上次沒事啦', participants:['zhe'], location:'noodle', trigger:'auto', term:['Y2S1'], once:true, npcZone:'zhe', npcPresent:'zhe', background:'blur',   /* AA_684 第 4 項：阿哲照作息在燒臘店（npcZone；週二、四 18:00～19:30）——麵店日拿掉以後他不在店裡，演不到 */
    prereq:{custom:G=>{ const F=G.flags||{}, d=typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey('2026-11-17'):null; return d!=null&&G.day>=d&&!!F.ZHE2_ASKED&&!F.ZHE2; }},
    dialogue:[ {speaker:'zhe',expression:'smile',text:'上次沒事啦。'},{set:{ZHE2:'none'}} ] },
  /* D9 以安新 10「家教學生的家（一）」（交接包 v3 第 3b 節、AA_177 4-8；BB 法律查核過：哪一種補助不說；救濟程序：訴願（BB_232；AA_587 第 10 節新10、第 57 列 S3「媽媽生病」））：12/1（二）麵店，桌遊團的時段 17:30～20:30；
     祐廷不在現場（那個家的事他只聽說）。認識語彤＝她在店裡（週二晚上她在幫忙）說社工那一句、選項多「法服週六有值班。」；不認識＝Alison 說法服那句。記 AN_TUTOR_FAMILY:1；沒到＝沒有 */
  { id:'ev_an_tutor_family_1', title:'家教學生的家', participants:['heroine_01'], location:'noodle', trigger:'auto', term:['Y2S1'], weekday:[2], time:[17.5,20.5], once:true, background:'blur',
    prereq:{custom:G=>typeof STORY!=='undefined'&&G.day===STORY.dayOfKey('2026-12-01')&&!!STORY.knows&&STORY.knows('heroine_01',G)},
    dialogue:[ {speaker:'heroine_01',expression:'neutral',text:'我家教的學生家裡，媽媽生病，這學期沒辦法上班。申請了補助，被駁回了。'},{speaker:'heroine_01',expression:'neutral',text:'我在查訴願怎麼寫。'},{speaker:'heroine_01',expression:'thinking',text:'我想幫忙。可是我又不是律師，不能亂講。'},
      {if:EV_KNOWS('heroine_03'),speaker:'heroine_01',expression:'neutral',text:'社會系會教這個嗎？被駁回的家庭，通常先找誰？'},{if:EV_KNOWS('heroine_03'),speaker:'heroine_03',expression:'neutral',text:'通常先找社工吧，我們課上是這樣講的。'},
      {unless:EV_KNOWS('heroine_03'),if:EV_KNOWS('yu'),speaker:'yu',expression:'neutral',text:'法服週六有值班啊。'},{unless:EV_KNOWS('heroine_03'),if:EV_KNOWS('yu'),speaker:'heroine_01',expression:'neutral',text:'我知道。我是怕我講錯。'},
      {choice:[{text:'「法服週六有值班。」',if:EV_KNOWS('heroine_03'),set:{AN10_PICK:'fafu'},goto:'a'},{text:'「妳可以先陪他們看駁回的理由。」',set:{AN10_PICK:'reason'},goto:'b'},{text:'「妳已經在幫了。」',set:{AN10_PICK:'help'},goto:'c'}]},
      {label:'a'},{speaker:'heroine_01',expression:'neutral',text:'我知道。我是怕我講錯。'},{goto:'end'},
      {label:'b'},{speaker:'heroine_01',expression:'thinking',text:'先看駁回的原因。……對。還有寫期限的那一段。'},{speaker:null,text:'（她拿出手機記下來。）'},{goto:'end'},
      {label:'c'},{speaker:'heroine_01',expression:'neutral',text:'這不算。'},{speaker:null,text:'她停了一下。'},{speaker:'heroine_01',expression:'smile',text:'好，算一點。'},
      {label:'end'},{set:{AN_TUTOR_FAMILY:1}} ] },
  /* D10 慈 3「第二名」（AA_40、AA_177 第 5 節：寫成芯慈的作息）：大二上第 14～18 週，週一到週四的深夜（隔天 00:15～00:45）她在溫州街的便利商店，第一次遇到就演；
     第 15 週以後沒遇到＝不演（AA_243 #20：16 週制改第 12～15 週）。記 XINCI_NIGHT（AA_547 2-1，原本 XINCI_SECOND；主線 4 xc_drama「那部劇大結局了」在這之後）*/
  /* AA_497 2-3：多一個地點＝總圖 B1 二十四小時自習室 00:00～00:15（ev_xinci_second_b1，src/sup497_3d.js 照這一場組：前兩句換、「十二點半了」）；
     兩個地點只演一個；第 11 週週一 00:20 有她聯絡方式的收到提示；第 15 週還沒演＝大二下第 2 週她約 Café 演白天版（ev_xinci_second_day）*/
  { id:'ev_xinci_second', title:'凌晨的便利商店', participants:['classmate_xinci'], location:'cvs', trigger:'auto', term:['Y2S1'], weeks:[12,13,14,15], weekday:[1,2,3,4], time:[0.25,0.75], once:true, near:{npc:'classmate_xinci',r:4}, background:'blur',   /* AA_547 2-1（D116）：取代「第二名」；id 照舊 */
    prereq:{custom:G=>typeof XCROM!=='undefined'&&!!XCROM.OLD&&typeof STORY!=='undefined'&&!!STORY.knows&&STORY.knows('classmate_xinci',G)&&!(G.events&&G.events.done&&(G.events.done.ev_xinci_second_b1||G.events.done.ev_xinci_second_day))},
    dialogue:[ {speaker:null,text:'（B1 自習室關燈以後，她在便利商店等一杯熱拿鐵。）'},
      {speaker:'classmate_xinci',expression:'neutral',text:'你也還沒睡。'},
      {speaker:'classmate_xinci',expression:'smile',text:'我在算財管的作業。……我喜歡數字對起來的那一下。'},
      {choice:[{text:'「妳家也是做這個的嗎？」',goto:'a'},{text:'「什麼時候開始喜歡的？」',goto:'b'},{text:'（陪她等咖啡）',goto:'c'}]},
      {label:'a'},{speaker:'classmate_xinci',expression:'neutral',text:'不是。我爸媽都是律師。'},{speaker:'classmate_xinci',expression:'neutral',text:'我從小在他們的會議室寫功課。法律聽得很熟，可是我比較喜歡這個。'},{goto:'end'},
      {label:'b'},{speaker:'classmate_xinci',expression:'thinking',text:'國中。我幫我媽對過一次事務所的帳。'},{speaker:'classmate_xinci',expression:'smile',text:'對起來的時候，好像整間辦公室都安靜了。'},{goto:'end'},
      {label:'c'},{speaker:null,text:'（咖啡好了。她把第二杯推過來。）'},{speaker:'classmate_xinci',expression:'neutral',text:'多按了一杯。不要浪費。'},
      {label:'end'},{mem:[{npc:'classmate_xinci',tag:'XINCI_NIGHT',note:'凌晨的便利商店'}]} ] },   /* 記憶 XINCI_SECOND 改名 XINCI_NIGHT（舊存檔的舊標籤照新字顯示，social3d.js MEMORY_LABEL）*/
  /* 沛珊說她和柏翰分開了（AA_185 3-2；台詞 BB_100 2-3）：大二上第 6 週（P3 之後的第一個上課日起），週一到週五 12:10～12:40 霖澤館二樓走廊，她在窗邊等柏翰下課，走過去就演；沒有選項。
     沒遇到＝第 6 週週五 21:00 桌遊團群組她自己說（story3d.js phoneRules）。都記 HEARD_PS_SPLIT；也是她伴侶期間的 endEvent（characters.js）*/
  /* AA_374 第 18 項（AA_211 附錄第 373 行、附錄 B E6）：和 ev_peishan_bohan_split 合併成這一件——看過 P3（ev_peishan_decision）、有點熟以上＝原本兩句（先說分開了，AA_313 6-5 第 11 點）；
     沒看過 P3、或還不熟＝「跟你說一下，我跟柏翰分開了。」「我們都還好，讀書會照常。」。合併的那一件也記 PEISHAN_BOHAN_SPLIT、日誌（原本 ev_peishan_bohan_split 的後果）；
     第 11 項：和沛珊交往中的玩家沒有這一件（也沒有柏翰那一段）*/
  { id:'ev_peishan_split', title:'我們上週分開了', participants:['classmate_peishan'], location:'linze', trigger:'auto', term:['Y2S1'], weeks:[6], weekday:[1,2,3,4,5], time:[12+10/60,12+40/60], once:true, near:{npc:'classmate_peishan',r:3.5}, background:'blur',
    prereq:{memory:[{npc:'classmate_peishan',tag:'FIRST_MET'}],notEvents:['ev_peishan_bohan_split'],notFlags:['dating_classmate_peishan']},   /* 舊存檔已經演過 ev_peishan_bohan_split 的不再演 */
    dialogue:[ {if:PS_SPLIT_FULL,speaker:'classmate_peishan',expression:'neutral',text:'我們上週分開了。我自己說的。'},{if:PS_SPLIT_FULL,speaker:'classmate_peishan',expression:'neutral',text:'柏翰說他不懂。……他沒有錯。我們想要的東西不一樣。'},
      {unless:PS_SPLIT_FULL,speaker:'classmate_peishan',expression:'neutral',text:'跟你說一下，我跟柏翰分開了。'},{unless:PS_SPLIT_FULL,speaker:'classmate_peishan',expression:'neutral',text:'我們都還好，讀書會照常。'},
      {set:{HEARD_PS_SPLIT:true}} ],
    consequences:{flags:{PEISHAN_BOHAN_SPLIT:true},memo:'沛珊說她和柏翰分開了'} },
  /* 交換說明會（主線 8，大二下第 4 週 3/18 12:20；AA_177 4-2、AA_143 2-3、AA_30 大二下、BB_105 B9）：坐在博雅 101 選「聽說明會」才演（activities.js EXPO_Y2）。
     以安坐第一排（AA_30：「日本。我國中就決定了。」）；你坐哪一區＝EXPO_COUNTRY（日本／美國／台灣；大三上填志願表那天的旁白讀它，AA_30 場景 0）；
     散場柏翰和以安那三句（大二版，AA_143 2-3）只給兩個人都認識的玩家。明軒、采蓁（BB_137 2-3，企劃線 a047e5feb）：明軒在門口兩句（認識明軒）；選區以後——日本＝采蓁兩句（修過日文、日文班認識，
     BBPACK.tookJp＋JP_MET）、美國／台灣＝明軒一句（認識明軒）。沒修日文的「日本那一區，以安已經坐在第一排。」不放（開頭已經有以安坐第一排那一句）；選項的字照遊戲原本的（坐到…那一區）*/
  { id:'ev_exchange_expo_y2', title:'交換學生甄選說明會', participants:[], location:'boya', trigger:'activity', once:true, background:'blur',
    dialogue:[ {if:EV_KNOWS('classmate_mingxuan'),speaker:'classmate_mingxuan',text:'我想去。……交換要先存錢，我算過了。'},{if:EV_KNOWS('classmate_mingxuan'),speaker:'classmate_mingxuan',text:'要再多教兩個家教學生。'},
      {if:EV_KNOWS('heroine_01'),speaker:null,text:'（以安坐在第一排。）'},{if:EV_KNOWS('heroine_01'),speaker:'heroine_01',expression:'neutral',text:'日本。我國中就決定了。'},
      {choice:[{text:'（坐到日本那一區）',set:{EXPO_COUNTRY:'日本'}},{text:'（坐到美國那一區）',set:{EXPO_COUNTRY:'美國'}},{text:'（坐到台灣那一區）',set:{EXPO_COUNTRY:'台灣'}}]},
      {if:{flagIs:{EXPO_COUNTRY:'日本'},custom:G=>!!(G.flags&&G.flags.JP_MET)&&typeof BBPACK!=='undefined'&&BBPACK.tookJp(G)},speaker:'采蓁',text:'欸，日文課的！你也想去日本？'},
      {if:{flagIs:{EXPO_COUNTRY:'日本'},custom:G=>!!(G.flags&&G.flags.JP_MET)&&typeof BBPACK!=='undefined'&&BBPACK.tookJp(G)},speaker:'采蓁',text:'獸醫系走不開。……可是看看也好。'},
      {if:{flagIs:{EXPO_COUNTRY:'美國'},custom:G=>typeof STORY!=='undefined'&&!!STORY.knows&&STORY.knows('classmate_mingxuan',G)},speaker:'classmate_mingxuan',text:'美國區。……我坐這裡，不代表付得起。'},
      {if:{flagIs:{EXPO_COUNTRY:'台灣'},custom:G=>typeof STORY!=='undefined'&&!!STORY.knows&&STORY.knows('classmate_mingxuan',G)},speaker:'classmate_mingxuan',text:'你只是來聽聽？……我也是。聽聽不用錢。'},
      {if:EV_KNOWS('heroine_01','classmate_bohan'),speaker:'classmate_bohan',expression:'neutral',text:'交換要成績多少？'},
      {if:EV_KNOWS('heroine_01','classmate_bohan'),speaker:'heroine_01',expression:'neutral',text:'簡章第三頁有寫，我等一下傳給你。'},
      {if:EV_KNOWS('heroine_01','classmate_bohan'),speaker:'classmate_bohan',expression:'neutral',text:'好。'} ],   /* AA_255 第 4 節第 7 點（附錄 A：原本「我查過了。你夠。」「……我是問妳。」是收尾梗、以安替人打分；AA_375 第 4 節提醒）*/
    consequences:{memo:'博思 101：交換學生甄選說明會'} },
  /* 學姊上榜的家族聚餐（BB_97 2-7b；大二下第 5 週週五 3/26 19:00；家族群組 Kevin 揪、「去。」才排出遊，story3d.js）：有 FAMILY_DINNER 記憶＝永康街那家咖哩，沒有＝公館。
     她的話（AA_398：不數件數）：最後那句看 ASKED_TELL_ME（BB_108 第 1 節）*/
  { id:'ev_sis_results_dinner', title:'學姊上榜聚餐', participants:['heroine_05'], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
    dialogue:[ {if:{custom:G=>typeof SOCIAL!=='undefined'&&SOCIAL.has('heroine_05','FAMILY_DINNER')},scene:'永康街・咖哩店',bg:'yongkang_curry'},{unless:{custom:G=>typeof SOCIAL!=='undefined'&&SOCIAL.has('heroine_05','FAMILY_DINNER')},scene:'公館',bg:'gongguan'},
      {speaker:'heroine_05',expression:'smile',text:'謝謝大家。……這次的題目，是我自己選的。'},
      {if:{custom:G=>typeof SOCIAL!=='undefined'&&SOCIAL.has('heroine_05','ASKED_TELL_ME')},speaker:'heroine_05',expression:'smile',text:'有人叫我考得怎樣都要說。我說了。下次換他。'},
      {unless:{custom:G=>typeof SOCIAL!=='undefined'&&SOCIAL.has('heroine_05','ASKED_TELL_ME')},speaker:'heroine_05',expression:'neutral',text:'還有，今天我請。不要跟我搶。'} ],
    consequences:{memo:'學姊上榜的家族聚餐'} },
  /* 沛珊 P4 交接讀書會（BB_97 4-3；大二下第 1 週週三的法服讀書會，只在這一週；classes3d.js 的 clubEvent）：她休學重考前最後一次；交出去的是每週的題目整理（讀書會本身由研究所學長姐帶）。
     「我接。」只給大一去過法服讀書會 1 次以上的玩家（AA_638 ④-8，原本 5 次）＝STUDYGROUP_LEADER；不說話＝柏翰接（不設）。沒去的：那晚 21:30 讀書會群組她的最後一則（story3d.js）*/
  { id:'ev_peishan_handover', title:'期末前的讀書會', participants:['classmate_peishan'], location:'wancai', trigger:'club', term:['Y2S1'], weeks:[15], weekday:[4], once:true, background:'blur',   /* BB_191 §8-7：公法讀書會（週四）；「我接。」＝大一去公法讀書會 5 次以上。BB_205 第 2 節（64aaaa82）：搬到 2026-12-17（大二上第 15 週週四）*/
    prereq:{memory:[{npc:'classmate_peishan',tag:'FIRST_MET'}]},
    dialogue:[ {speaker:'classmate_peishan',expression:'neutral',text:'下學期的題目我想換人整理。我出的，大家都說太簡單。'},   /* AA_281 第 4 節（使用者 10-18：她什麼都不說，大家放假後才知道她休學）*/{speaker:'classmate_peishan',expression:'neutral',text:'每週的題目整理……（看柏翰，又看你）誰要接？'},
      {speaker:'classmate_peishan',expression:'serious',text:'只有一個條件：要好玩。'},
      {choice:[{text:'「我接。」',if:{custom:G=>typeof STORY!=='undefined'&&STORY.plgY1Count&&STORY.plgY1Count(G)>=1},set:{STUDYGROUP_LEADER:true}},{text:'（不說話）'}]} ] },
  /* 柏翰 翰 3 分數表（AA_40、AA_177 第 5 節；柏翰接題目整理的版本）：第二次聚會＝大二下第 2 週週三 3/3 的讀書會，白板上多了一張分數表；可以去找他談，或什麼都不做（都不改變翰 4）。
     沒去讀書會＝沒有。一個月後（第 6 週起第一次去讀書會）：白板那張表每個人的格子都寫滿了（AA_546 1-4；原本「從八個變四個」）。祐廷接的版本：3/3 21:00 柏翰在全班群組貼白板的照片（story3d.js）*/
  { id:'ev_bohan_scores', title:'白板',   /* AA_546 1-4（D116）：每個人只寫自己的目標 */ participants:['classmate_bohan'], location:'wancai', trigger:'club', term:['Y2S2'], weeks:[2], weekday:[4], once:true, background:'blur',   /* 公法讀書會（週四，BB_191 §8-7）*/
    prereq:{memory:[{npc:'classmate_bohan',tag:'FIRST_MET'}],custom:G=>!G.flags.STUDYGROUP_LEADER},
    dialogue:[ {speaker:null,text:'（白板上多了一張表：每個人寫自己這週要讀到哪裡。）'},{speaker:'classmate_bohan',expression:'neutral',text:'寫下來比較不會忘。只寫自己的。'},{speaker:null,text:'（以安看了白板一眼，在自己那一格寫「刑總 第五章」。）'},
      {choice:[{text:'「我也寫。」',set:{HAN3_TALKED:true},goto:'w'},{text:'「我這週很亂，寫不出來。」',set:{HAN3_TALKED:true},goto:'m'},{text:'（什麼都不做）'}]},{goto:'end'},
      {label:'w'},{speaker:'classmate_bohan',expression:'neutral',text:'好。'},{goto:'end'},
      {label:'m'},{speaker:'classmate_bohan',expression:'neutral',text:'那就寫「很亂」。也是一種進度。'},{label:'end'} ] },   /* AA_255／AA_281；AA_546 1-4 改 */
  { id:'ev_bohan_scores_month', title:'讀書會', participants:[], location:'wancai', trigger:'club', term:['Y2S2'], weeks:[6,7,8,9,10,11,12,13,14,15], weekday:[4], once:true, background:'blur',
    prereq:{custom:G=>!G.flags.STUDYGROUP_LEADER},
    dialogue:[ {speaker:null,text:'（白板那張表，每個人的格子都寫滿了。有人在柏翰那一格畫了一個讚。）'} ] },   /* AA_546 1-4 */
  /* 沛珊 P4b 在 Café 的那一次（BB_97 4-4、AA_177 第 8 節②）：第 8 週週六 4/17，12:30 她傳「總圖滿了。兩點半，靠窗。」（story3d.js）→ 13:00～15:00 走進 Café 就演；可以錯過。
     只有兩個人的版本（祐廷在和別人交往、她也知道＝小組版，照舊在總圖，沒有這一次）。CG BCG-35 放在她把便條推過來的那一拍 */
  { id:'ev_peishan_cafe_42', title:'今天念了 42 頁', participants:['classmate_peishan'], location:'cafe', trigger:'auto', once:true, term:['Y2S2'], time:[13,15], background:'blur',
    prereq:{custom:G=>typeof STORY!=='undefined'&&G.day===STORY.dayOfKey('2027-04-17')&&!G.flags.PS_P4B_GROUP&&!!(G.msgs&&G.msgs.some(m=>m.tag==='ps_p4b_cafe'))},
    spawn:{npc:'classmate_peishan',dist:1.6,pose:'idle'},
    dialogue:[ {cg:'cg_cafe_42pages_peishan'},{speaker:null,text:'（她把便條推過來：「今天念了 42 頁。你呢？」）'} ] },
  /* ===== 模擬法庭（大二下；V3-D16、V3-B07）：系內比賽，每個大二生都參加；祐廷、以安、柏翰同一組（賣家）是劇情事實（AA_177 4-7）。台詞 AA_96 4-3、AA_143 第 3 節（AA-B ee2c901d）、學姊 BB_97 2-6。
     模 1 抽籤 2/25（四）12:20～13:10 霖澤館 201（走進教室就演；學姊玩家到場時一定在）；沒到＝13:30 以安私訊兩則（story3d.js）。
     模 2／3／4：activities.js moot_2～4（門口參加）。模 5 比賽 5/1（六）09:30 201，固定核心：09:45 還沒到＝以安打電話、帶到場。模 6 當晚 19:00 麵店（出遊）。
     準備分（AA_143 3-2）：MOOT_BIKE_SHOP（模 2 機車行）＋MOOT_THIRD（模 3 第三種寫法）＋MOOT_DRILL（模 4 有去）＋MOOT_TOGETHER（第 8～10 週一起準備）；≥3 贏 */
  { id:'ev_moot_1', retired:'使用者 2026-10-17 刪除模擬法庭（「這不符合我在臺大法律的回憶」；AA_252：改成大四專題討論的法院旁聽）：停用，舊存檔的旗標留著、不再讀', title:'抽籤', participants:[], location:'classroom', trigger:'auto', term:['Y2S2'], time:[12+20/60,13+10/60], once:true, background:'blur',
    prereq:{custom:G=>typeof STORY!=='undefined'&&G.day===STORY.dayOfKey('2027-02-25')},
    dialogue:[ {unless:EV_KNOWS('heroine_01'),speaker:'heroine_01',expression:'neutral',text:'沈以安。分工表我先畫了。'},{unless:EV_KNOWS('heroine_01'),mem:[{npc:'heroine_01',tag:'FIRST_MET',note:'模擬法庭抽籤，同一組'}]},
      {unless:EV_KNOWS('classmate_bohan'),speaker:'classmate_bohan',expression:'neutral',text:'許柏翰。……考古題沒有這一題。'},{unless:EV_KNOWS('classmate_bohan'),mem:[{npc:'classmate_bohan',tag:'FIRST_MET',note:'模擬法庭抽籤，同一組'}]},
      {speaker:null,text:'（抽到賣家。）'},{speaker:'classmate_bohan',expression:'neutral',text:'……我們要替說『二手的本來就這樣』的人說話？'},{speaker:null,text:'（以安已經在手帳上畫分工表。）'},
      {speaker:'heroine_05',expression:'neutral',text:'三件事。一，先不要討厭你的當事人。二，找他說的話裡對的地方。三，今天先回家睡覺。'},{set:{MOOT_1:true}} ] },
  { id:'ev_moot_2', retired:'使用者 2026-10-17 刪除模擬法庭（「這不符合我在臺大法律的回憶」；AA_252：改成大四專題討論的法院旁聽）：停用，舊存檔的旗標留著、不再讀', title:'找資料', participants:[], location:'wancai', trigger:'activity', once:true, background:'blur',
    dialogue:[ {speaker:'heroine_01',expression:'neutral',text:'我先列計畫。'},{speaker:'classmate_bohan',expression:'neutral',text:'我先背。'},
      {choice:[{text:'「我先去問機車行老闆。」',goto:'bike'},{text:'「我跟柏翰一起背。」',goto:'mem'},{text:'「我照以安的分工表做。」',goto:'plan'}]},
      {label:'bike'},{speaker:'heroine_01',expression:'surprised',text:'你去問機車行老闆？'},{speaker:'player',text:'當事人會說的話，我想先聽一次。'},
        {speaker:'heroine_01',expression:'neutral',text:'（寫進手帳）……這個我沒想到。理由欄我先空著，你回來填。'},
        {scene:'公館・機車行',bg:'gg_scooter_shop'},{speaker:null,text:'（公館巷子裡的機車行。地上都是機油，老闆蹲著在換輪胎。）'},{speaker:null,text:'（你問二手車通常怎麼賣。他沒抬頭。）'},
        {speaker:'機車行老闆',text:'二手車喔，看人騎的。'},{speaker:'機車行老闆',text:'同一台車，給騎很兇的人騎一年，比給阿伯騎五年還舊。'},{set:{MOOT_BIKE_SHOP:true}},{goto:'end'},
      {label:'mem'},{speaker:'classmate_bohan',expression:'neutral',text:'……你確定？我一天背四十頁。'},{speaker:null,text:'（那天晚上，你背到第十二頁就睡著了。）'},{goto:'end'},
      {label:'plan'},{speaker:'heroine_01',expression:'neutral',text:'好。你負責第三段的資料。'},{speaker:null,text:'（你在法圖找到兩本書，兩本都被借走了。）'},
      {label:'end'} ] },
  { id:'ev_moot_3', retired:'使用者 2026-10-17 刪除模擬法庭（「這不符合我在臺大法律的回憶」；AA_252：改成大四專題討論的法院旁聽）：停用，舊存檔的旗標留著、不再讀', title:'吵架', participants:[], location:'wancai', trigger:'activity', once:true, background:'blur',
    dialogue:[ {speaker:'classmate_bohan',expression:'serious',text:'照考試的寫法比較安全。'},{speaker:'heroine_01',expression:'serious',text:'照考試的寫法，評審會睡著。'},
      {choice:[{text:'「先寫當事人那天知道什麼。評審要先聽到人。」',goto:'an'},{text:'「照考試的格式，至少不會錯。」',goto:'han'},
        {text:'「第一段照考試的格式。第二段，放機車行老闆說的話。」',if:{flags:['MOOT_BIKE_SHOP']},goto:'third'},{text:'「第一段照考試的格式。第二段，講當事人那天的事。」',unless:{flags:['MOOT_BIKE_SHOP']},goto:'third'}]},
      {label:'an'},{speaker:'heroine_01',expression:'smile',text:'謝謝。'},{speaker:'classmate_bohan',expression:'neutral',text:'（沉默三秒）好。那考試的寫法，放附錄。'},{goto:'end'},
      {label:'han'},{speaker:'classmate_bohan',expression:'neutral',text:'對吧。'},{speaker:'heroine_01',expression:'neutral',text:'（把手帳闔起來）好。我去買飲料。'},{speaker:null,text:'（她回來的時候，買了三杯。）'},{goto:'end'},
      {label:'third'},{speaker:'以安、柏翰',text:'……可以。'},{speaker:'heroine_01',expression:'smile',text:'這樣兩個人都不用讓。'},   /* AA_426 第 5 節（企劃線 967b4273a）：原本「理由：兩個人都不用讓。」，AA_143 第 229 行已改 */{speaker:'classmate_bohan',expression:'neutral',text:'……我還是覺得附錄比較安全。'},{set:{MOOT_THIRD:true}},
      {label:'end'} ] },
  { id:'ev_moot_4', retired:'使用者 2026-10-17 刪除模擬法庭（「這不符合我在臺大法律的回憶」；AA_252：改成大四專題討論的法院旁聽）：停用，舊存檔的旗標留著、不再讀', title:'最長的十秒', participants:[], location:'wancai', trigger:'activity', once:true, background:'blur',
    dialogue:[ {speaker:'heroine_05',expression:'smile',text:'一件事。我前陣子放榜了，心情很好。所以今天會問得比較兇。'},
      {speaker:null,text:'（學姊問到第三題，三個人都答不出來。）'},{speaker:null,text:'（研討室安靜了十秒。然後學姊笑了。）'},
      {speaker:'heroine_05',expression:'smile',text:'重點是——你們剛剛那段沉默，在真的法庭裡是最長的十秒。'},{set:{MOOT_DRILL:true}} ] },
  /* 模 5 比賽（固定核心，AA_176 R4）：5/1（六）09:30 起在 201 就演；09:45 還沒到＝以安打電話「你在哪？……十點開庭。」→ 黑幕＋「你一路跑上霖澤館二樓。」（在哪裡都演）。
     開庭前五句（AA_143 3-3）→ 學姊「一件事。你們準備好了。」→ 結辯三選一（故事版要 MOOT_BIKE_SHOP）→ 輸贏照準備分（STORY.mootScore）。散場阿哲當面約晚上麵店（模 6，story3d.js 排出遊）*/
  { id:'ev_moot_5', retired:'使用者 2026-10-17 刪除模擬法庭（「這不符合我在臺大法律的回憶」；AA_252：改成大四專題討論的法院旁聽）：停用，舊存檔的旗標留著、不再讀', title:'比賽那天', participants:[], location:'any', trigger:'auto', term:['Y2S2'], time:[9.5,13], once:true, priority:10, background:'blur',
    prereq:{custom:G=>typeof STORY!=='undefined'&&G.day===STORY.dayOfKey('2027-05-01')&&(G.zone==='classroom'||(G.hour%24)>=9.75)},
    dialogue:[ {unless:{custom:G=>G.zone==='classroom'},speaker:'heroine_01',expression:'serious',text:'你在哪？……十點開庭。'},{unless:{custom:G=>G.zone==='classroom'},speaker:null,text:'（你一路跑上法律系館A二樓。）'},
      {scene:'法律系館A 201'},{speaker:null,text:'（法律系館A 201 的桌子排成兩邊。對面是芯慈那隊。）'},
      {speaker:'classmate_xinci',expression:'neutral',text:'（隔著走道，小聲）你們的分工表，我看到了。很漂亮。'},{speaker:'classmate_bohan',expression:'serious',text:'（小聲）她在心理戰。'},
      {speaker:'heroine_01',expression:'neutral',text:'（小聲）她在說真話。她的分工表比我的漂亮。'},{speaker:'法官',text:'請賣方代理人陳述。'},
      {speaker:'heroine_05',expression:'neutral',text:'一件事。你們準備好了。'},
      {choice:[{text:'（講契約那天，雙方各自知道什麼）',set:{MOOT_CLOSE:'reason'},goto:'r'},{text:'（講我的當事人不是壞人）',set:{MOOT_CLOSE:'gentle'},goto:'g'},{text:'（講機車行老闆說的話）',if:{flags:['MOOT_BIKE_SHOP']},set:{MOOT_CLOSE:'story'},goto:'s'}]},
      {label:'r'},{speaker:'player',text:'契約寫的是『二手』，沒有寫『無瑕疵』。我們請評審看的，是雙方在簽約那一天，各自知道什麼。'},{goto:'end'},
      {label:'g'},{speaker:'player',text:'我的當事人不是壞人。他只是以為『二手』這兩個字，可以說明一切。'},{goto:'end'},
      {label:'s'},{speaker:'player',text:'我去問過機車行的老闆。他說，每一台二手車，都有上一個主人留下的習慣。我的當事人賣的，是他騎了七年的車。'},
      {label:'end'},{advance:2},
      /* 可昕的部分（BB_97 9-19）：交往中、第 9 週告訴她日期、比賽在週末或平日晚上＝她坐最後一排；散場只有這一句（不搶學姊、以安、柏翰的台詞）*/
      {if:{custom:G=>KX_MOOT_CAME(G)},speaker:'kexin',expression:'teasing',text:'你第二個爭點講得比第一個好。第一個你在發抖。'} ],
    after:(G,GM)=>{ const sc=typeof STORY!=='undefined'&&STORY.mootScore?STORY.mootScore(G):0; G.flags.MOOT_SCORE=sc; G.flags.MOOT_WIN=sc>=3; G.flags.MOOT_DAY=G.day;
      if(G.flags.dating_kexin) G.flags.KX_MOOT=KX_MOOT_CAME(G)?'came':(G.flags.KX_MOOT_TOLD===true?'call':'photo');   /* BB_97 9-19：came／call（說了、她有課）／photo（沒說：粉專的照片）——story3d.js phoneRules 發 call、photo 的訊息 */
      if(GM&&GM.memo) GM.memo(sc>=3?'模擬法庭：你們準備得夠，結辯也站得住。':'模擬法庭：芯慈那隊準備得比你們多一步。'); } },
  /* 模 6 結果之後（當晚 19:00 麵店，出遊；可以錯過＝21:30 群組照片）：輸＝阿哲分滷味、學姊「這是最好的輸法」、以安手帳；贏＝芯慈「你們第三段很好」、學姊收評分表（BB_97 2-6）*/
  { id:'ev_moot_6', retired:'使用者 2026-10-17 刪除模擬法庭（「這不符合我在臺大法律的回憶」；AA_252：改成大四專題討論的法院旁聽）：停用，舊存檔的旗標留著、不再讀', title:'結果之後', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
    dialogue:[ {scene:'公館燒臘',bg:'noodle_table'},
      {unless:{flags:['MOOT_WIN']},speaker:null,text:'（阿哲把外帶的滷味分給大家。）'},
      {unless:{flags:['MOOT_WIN']},speaker:'heroine_05',expression:'smile',text:'你們輸給了一個準備得比你們好的隊伍。這是最好的輸法。'},
      {unless:{flags:['MOOT_WIN']},speaker:null,text:'（以安在手帳上寫：「計畫以外：輸了也很開心。」）'},
      {if:{flags:['MOOT_WIN']},speaker:'classmate_xinci',expression:'smile',text:'你們第三段很好。……我們下次會贏。'},
      {if:{flags:['MOOT_WIN']},speaker:'heroine_05',expression:'smile',text:'……好。'},{if:{flags:['MOOT_WIN']},speaker:null,text:'（她把評分表摺起來收進包包。）'},
      {if:{flags:['MOOT_WIN']},speaker:'heroine_05',expression:'smile',text:'這張我要留著。……我帶的第一個隊伍。'},
      /* 可昕在場（BB_97 9-19，KX_MOOT 'came'）：輸、贏都一樣，只有這一句 */
      {if:{flagIs:{KX_MOOT:'came'}},speaker:null,text:'（可昕把自己那份滷味的豆干夾給你。）'},{if:{flagIs:{KX_MOOT:'came'}},speaker:'kexin',expression:'teasing',text:'發抖的人要補充。'} ],
    consequences:{memo:'模擬法庭之後的燒臘店'} },
  /* D11 系籃（大二上，AA_143 1-5、AA_177 4-4）＋語 3「在一起」（AA_40）：12/18（五）21:00 桌遊團群組阿哲揪 → 出發選單「新體育館 12/19 14:00」→ 2D（新體育館室內 3D 做好以前，用 2D＋旁白）；
     祐廷坐觀眾席三選一（拍手、記分、送水；大二版的字 AA-B c2f1c5aa）；記 WATCHED_GAME_Y2；明軒的句子等 BB-B（AB-59）；以安、Alison 在觀眾席（AA_143 1-5 的描述）。
     賽後 18:30～21:00 走進麵店＝語 3（Alison 坐到你對面）。系籃和賽後麵店都沒去：22:00 認識 Alison＝她私訊三則；不認識、在桌遊團＝阿哲的照片（story3d.js phoneRules）*/
  { id:'ev_zhe_game_y2', title:'系籃比賽（大二）', participants:['zhe'], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
    dialogue:[ {scene:'新體育館',bg:'gym_court'},{speaker:null,text:'（系籃比賽。阿哲、明軒上場。）'},   /* 第六批背景（使用者 11-02 生成，BB_132 第 103 組）*/
      {if:EV_KNOWS('heroine_01'),speaker:null,text:'（以安坐在觀眾席第一排。）'},{if:EV_KNOWS('yu'),speaker:null,text:'（Alison 拿著自己寫的加油板。）'},{if:EV_KNOWS('yu'),speaker:null,text:'（Alison 的加油板上寫著：『17 號，不要犯規。』）'},
      {choice:[{text:'（負責拍手）',consequences:{mem:[{npc:'zhe',tag:'WATCHED_GAME_Y2',note:'你拍手'}]},goto:'clap'},{text:'（記分）',consequences:{mem:[{npc:'zhe',tag:'WATCHED_GAME_Y2',note:'你記分'}]},goto:'score'},{text:'（送水）',consequences:{mem:[{npc:'zhe',tag:'WATCHED_GAME_Y2',note:'你送水'}]},goto:'water'}]},   /* 大二版（AA-B c2f1c5aa，AA_143 1-5）*/
      {label:'clap'},{speaker:null,text:'你在觀眾席拍到手掌發紅。阿哲進球，先轉身指 Alison 的加油板，才指你：'},{speaker:'zhe',expression:'laugh',text:'有沒有看到！'},{goto:'end'},
      {label:'score'},{speaker:null,text:'你坐到記分台，今年一次都沒翻錯。'},{if:EV_KNOWS('heroine_01'),speaker:'heroine_01',expression:'neutral',text:'（在觀眾席喊）十七號四犯了！'},{goto:'end'},
      {label:'water'},{speaker:null,text:'中場你把一箱水搬到場邊。阿哲拿了兩瓶，一瓶丟給明軒：'},{speaker:'zhe',expression:'smile',text:'謝啦。'},   /* AA_374 第 16 項（AA_211 第 151 行、BB_181 #3）：「後勤部長」的前情已經改掉 */
        {speaker:'classmate_mingxuan',expression:'laugh',text:'（接住水）謝啦。'},{speaker:'classmate_mingxuan',expression:'smile',text:'這瓶 CP 值最高。……免費的。'},   /* 明軒（BB_97 4-7，BB-B a3b9d427，AB-59）*/
      {label:'end'},{speaker:'classmate_mingxuan',expression:'laugh',text:'（擦汗）我上場六分鐘，摸到球三次。……賺很大。'}   /* AA_313 5-1 第 14 點、5-7：一場只用一次「CP 值」*/,{set:{Y2_BALL_SEEN:true}} ] },
  { id:'ev_yu_together', title:'在一起', participants:['yu'], location:'noodle', trigger:'auto', term:['Y2S1'], weekday:[6], time:[18.5,21], once:true, background:'blur',
    prereq:{custom:G=>typeof STORY!=='undefined'&&G.day===STORY.dayOfKey('2026-12-19')&&!!STORY.knows&&STORY.knows('yu',G)}, spawn:{npc:'yu',at:{x:-0.8,z:0.6},pose:'idle'},
    dialogue:[ {speaker:'yu',expression:'embarrassed',text:'（坐到你對面，壓低聲音）欸，跟你說一件事。你不要叫。'},{speaker:'yu',expression:'embarrassed',text:'我跟阿哲在一起了。'},
      /* AA_497 3-2：語 2 的選擇有後果——「他說『沒事啦，就在一起啊』」那一句前面照 YU2_PICK 多一句（沒有 YU2_PICK＝照舊）*/
      {if:{flagIs:{YU2_PICK:'everyone'}},speaker:'yu',text:'你說他對每個人都好。我後來偷偷看了一個禮拜。……對我比較多。'},
      {if:{flagIs:{YU2_PICK:'you'}},speaker:'yu',text:'你說他對我比較好。我回去想了一整個晚上。'},
      {if:{flagIs:{YU2_PICK:'ask'}},speaker:'yu',text:'你叫我自己問他。我就問了。'},
      {speaker:'yu',expression:'laugh',text:'（看了一眼正在跟阿姨點菜的阿哲）他說「沒事啦，就在一起啊」。哪有人這樣告白的。'},{speaker:'yu',expression:'smile',text:'反正就這樣。以後在燒臘店吃完，他說要陪我走去捷運站。'},{speaker:null,text:'（阿哲端著兩盤飯走過來，她馬上坐正。）'},
      {mem:[{npc:'yu',tag:'IMPORTANT_CONVERSATION',note:'系籃賽後的麵店：她和阿哲在一起了'}]},{set:{YU_ZHE_TOLD:'here'}} ] },
  /* 語 3 沒去系籃、麵店的人（AA_313 5-1 第 4 點）：12/19 22:00 Alison 打電話來（接起來）；沒接＝桌遊團群組阿哲的照片 */
  { id:'ev_yu_together_call', title:'Alison 的電話', participants:['yu'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.15,
    outingMissed:(G,GM,q)=>{ if(typeof PHONE!=='undefined'&&PHONE.inGroup(G,'noodle_team')){ G.flags.YU_ZHE_TOLD=G.flags.YU_ZHE_TOLD||'photo'; PHONE.at(G,q.day,22.25,[{th:'g:noodle_team',from:'zhe',text:'📷（燒臘店的長桌。Alison 比了一個 YA。）'}],'y2_yu_told'); } },
    dialogue:[ {scene:'電話'}, {speaker:null,text:'（電話。她那邊很吵，有人在唱歌。）'},
      {speaker:'yu',text:'欸欸欸你今天怎麼沒來！'},{speaker:'yu',text:'……跟你說一件事。我跟阿哲在一起了。'},
      {if:{flagIs:{YU2_PICK:'everyone'}},speaker:'yu',text:'你說他對每個人都好。我後來偷偷看了一個禮拜。……對我比較多。'},   /* AA_497 3-2：電話版接在「我跟阿哲在一起了。」之後 */
      {if:{flagIs:{YU2_PICK:'you'}},speaker:'yu',text:'你說他對我比較好。我回去想了一整個晚上。'},
      {if:{flagIs:{YU2_PICK:'ask'}},speaker:'yu',text:'你叫我自己問他。我就問了。'},
      {speaker:'yu',text:'你不要笑。我聽得到。'},
      {choice:[{text:'「恭喜。」',goto:'a'},{text:'「我早就知道了。」',goto:'b'}]},
      {label:'a'},{speaker:'yu',text:'謝謝！！阿哲在旁邊，一直要搶電話。'},{goto:'end'},
      {label:'b'},{speaker:'yu',text:'騙人。……你真的知道？'},
      {label:'end'},{mem:[{npc:'yu',tag:'IMPORTANT_CONVERSATION',note:'她打電話來：她和阿哲在一起了'}]},{set:{YU_ZHE_TOLD:'call'}} ] },
  /* D12（交接包 v3 第 16～18 週；AA_143 1-6～1-8、AA_177 第 6 節的日子）：聖誕交換禮物 12/17（四）12:20 霖澤館一樓（AA_313 第 4-1 節第 8 點：原本 12/24＝第 16 週期末考週，提早一週；AA_177 改成中午，晚上是可昕排的行程，不衝突）、
     跨年 12/31（四）23:50 宿舍頂樓十分鐘、期末最後一頓（最後一科考完那天 19:00 麵店）。邀約、出發選單、沒去的照片在 story3d.js（v3 群戲那張表）。
     聖誕：阿哲和 Alison 第一次一起出現、買了一樣的保溫杯；祐廷抽到的禮物看抽到誰（在場、認識的人隨機一位）*/
  { id:'ev_y2_xmas', title:'聖誕交換禮物（大二）', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:1,
    dialogue:[ {scene:'法律系館A一樓',bg:'ntu_linze'},   /* 11-02 LAWWW-B 用現有的圖補黑底 （12:20 A館一樓＝穿堂）*/
      {if:EV_KNOWS('yu'),speaker:null,text:'（阿哲先到。五分鐘後 Alison 也到了。）'},   /* AA_313 5-3（AA_389 第 6 點：照逐場表）：改 12/17 以後他們 12/19 才在一起——還沒在一起、剛好買一樣 */
      {speaker:'拆到的人',text:'……為什麼有兩個一樣的保溫杯？'},{if:EV_KNOWS('yu'),speaker:'阿哲、Alison',text:'不是我們。'},{unless:EV_KNOWS('yu'),speaker:'zhe',expression:'laugh',text:'不是我們。'},
      {pick:{flag:'Y2_XMAS_FROM',from:G=>{ const k=id=>typeof STORY!=='undefined'&&STORY.knows&&STORY.knows(id,G); return ['heroine_01','heroine_03','classmate_xinci','classmate_bohan','zhe'].filter(k); }}},
      {if:{flagIs:{Y2_XMAS_FROM:'heroine_01'}},speaker:null,text:'你抽到以安的：一本空白手帳。'},{if:{flagIs:{Y2_XMAS_FROM:'heroine_01'}},speaker:'heroine_01',expression:'smile',text:'跟我用的同一款。你不用寫得很整齊。'},   /* AA_313 4-3（理由欄不當收尾小句）。AA_428 §2 第 8 點「聖誕以安用 AA_416」：AA_416 的以安聖誕是單獨約會那兩欄（fest_events.js），團體交換禮物這一句 AA_416 沒有寫（開頭：團體事件保留），照現行 */
      {if:{flagIs:{Y2_XMAS_FROM:'heroine_03'}},speaker:null,text:'你抽到語彤的：一包茶屋的茶點。'},
      {if:{flagIs:{Y2_XMAS_FROM:'classmate_xinci'}},speaker:null,text:'你抽到芯慈的：一組螢光筆。'},
      {if:{flagIs:{Y2_XMAS_FROM:'classmate_bohan'}},speaker:null,text:'你抽到柏翰的：考古題索引卡。'},
      {if:{custom:G=>G.flags.Y2_XMAS_FROM==='zhe'&&!(typeof STORY!=='undefined'&&STORY.knows&&STORY.knows('yu',G))},speaker:null,text:'你抽到阿哲的：一個保溫杯。'},
      {if:{custom:G=>G.flags.Y2_XMAS_FROM==='zhe'&&typeof STORY!=='undefined'&&!!STORY.knows&&STORY.knows('yu',G)},speaker:null,text:'你抽到阿哲的：一個保溫杯。Alison 送的那個，一模一樣。'} ] },   /* AA_374 第 15 項（AA_211 4-4）：不認識 Alison 的也聽得懂 */
  /* 跨年大二（AA_210 第 1 節＋第 5 節，AA-C 881ed505；16 週制 12/31 在寒假第 4 天）：23:30 頂樓，人少了兩個（阿哲和 Alison 去信義區）；以安 FRIEND 以上（交往中一定）在場；
     「新年快樂。」／（拍一張傳到群組）＝NYE_Y2_PHOTO；00:10 散；和以安交往中：下樓那段（1-6）。記 NYE_Y2＝'roof'，在場的人熟悉 +1 */
  { id:'ev_y2_newyear', title:'跨年（大二）', participants:[], location:'any', trigger:'outing', once:true, background:'dorm_roof', hours:40/60,
    dialogue:[ {scene:'宿舍頂樓',bg:'dorm_roof'},{speaker:null,text:'（十一點半。頂樓只有幾個人。）'},
      {speaker:'classmate_bohan',text:'樓梯間的燈壞了，下去的時候小心。'},
      {if:{custom:G=>NYE_AN(G)&&NYE_Y1_MRT(G)},speaker:'heroine_01',text:'去年這時候還在捷運上。'},{if:{custom:G=>NYE_AN(G)&&!NYE_Y1_MRT(G)},speaker:'heroine_01',text:'今年風比較小。'},{if:{custom:G=>NYE_AN(G)},speaker:'classmate_bohan',text:'今年不用擠。'},   /* AA_313 4-3：「還在捷運上」只給大一走「一起去信義區」那條、而且她也在的人（NYE_Y1_MRT）；直接上頂樓、去年她不在的換「今年風比較小。」*/
      {if:{custom:G=>!!G.flags.dating_kexin&&(G.flags.KX_NYE||{})[2]==='video'},speaker:null,text:'（十一點五十九分，手機響了。可昕打視訊來。）'},   /* 可昕交往中、選了頂樓（AA_210 5-2 視訊〔在頂樓〕）*/
      {if:{custom:G=>!!G.flags.dating_kexin&&(G.flags.KX_NYE||{})[2]==='video'},speaker:'kexin',expression:'smile',text:'讓我看一下頂樓。'},
      {if:{custom:G=>!!G.flags.dating_kexin&&(G.flags.KX_NYE||{})[2]==='video'},speaker:null,text:'（她那邊的煙火聲，比畫面慢了一秒。）'},   /* AA_313 第 2 節第 37 列：頂樓版不要連著兩次「零點」的旁白（群戲那句照留）*/
      {if:{custom:G=>!!G.flags.dating_kexin&&(G.flags.KX_NYE||{})[2]==='video'},speaker:'kexin',expression:'smile',text:'新年快樂。……好，你們繼續。我掛了。'},
      {if:{custom:G=>!!G.flags.dating_kexin&&(G.flags.KX_NYE||{})[2]==='video'},set:{KX_NYE_VIDEO_Y2:true}},
      {speaker:null,text:'（零點。很遠的地方亮了一下。今年也只看得到上半截。）'},
      {choice:[{text:'「新年快樂。」',goto:'hny'},{text:'（拍一張傳到群組）',goto:'photo'}]},
      {label:'hny'},{if:{custom:G=>NYE_AN(G)},speaker:'heroine_01',text:'新年快樂。'},{speaker:null,text:'（柏翰點了一下頭。）'},{goto:'end'},
      {label:'photo'},{set:{NYE_Y2_PHOTO:true}},
      {label:'end'},{speaker:'classmate_bohan',text:'我回去了。'},{if:{custom:G=>NYE_AN(G)},speaker:'heroine_01',text:'我也回去了。'},
      {if:{custom:G=>!!G.flags.dating_heroine_01},speaker:null,text:'（樓梯間的燈還是壞的。柏翰走在前面，已經轉過彎了。）'},
      {if:{custom:G=>!!G.flags.dating_heroine_01},speaker:'heroine_01',text:'……手給我。'},
      {if:{custom:G=>!!G.flags.dating_heroine_01},speaker:'heroine_01',text:'看不到台階。你走慢一點。'},   /* AA_313 4-3 */
      {if:{custom:G=>!!G.flags.dating_heroine_01},speaker:null,text:'（一直走到你住的那一層，她才放開。）'},
      {set:{NYE_Y2:'roof'}},{rel:{classmate_bohan:{fam:1}}},{if:{custom:G=>NYE_AN(G)},rel:{heroine_01:{fam:1}}} ],
    consequences:{memo:'跨年：宿舍頂樓（大二）'} },
  /* 可昕（交往中）大二～大四的跨年（AA_210 5-2，AA-C 881ed505／28ac4ea3；寒假她在高雄，AA_276）：去高雄＝ev_kx_nye_river_y2～y4（照大一 ev_nye_river；高鐵 2980 出發時扣）；
     留在臺北＝（23:59 的視訊：CANON-NO-ECON-1112 第三批拿掉；大二在頂樓的版本接在 ev_y2_newyear 裡）。台詞一字照 5-2
     AA_467 第 2 節（企劃線 5bbd16ab1）：大三、大四的零點那句、結尾那句換成那一年的事（大二照舊）*/
  { id:'ev_kx_nye_river_y2', title:'跨年（大二・高雄）', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:2.5,
    beforeOuting:(G,GM)=>{ if(GM.money) GM.money(-2980,'交通'); },
    dialogue:[ {scene:'高雄・愛河邊',bg:'kh_river_night'},{speaker:null,text:'（愛河邊。她站在橋下等你，手插在外套口袋裡。）'},
      {if:{custom:G=>(G.flags.KX_NYE||{})[1]==='river'},speaker:'kexin',expression:'teasing',text:'第二年了。你認得路了吧。'},{if:{custom:G=>(G.flags.KX_NYE||{})[1]!=='river'},speaker:'kexin',expression:'smile',text:'這邊人比較少。我小時候都在這裡看。'},
      {speaker:null,text:'（零點。煙火在河的另一邊。）'},{speaker:'kexin',expression:'smile',text:'新年快樂。'},
      {choice:[{text:'「新年快樂。」',goto:'a'},{text:'（牽她的手）',goto:'b'}]},
      {label:'a'},{speaker:'kexin',expression:'embarrassed',text:'嗯。新年快樂。'},{goto:'end'},
      {label:'b'},{speaker:null,text:'（她沒有看你，但手沒有抽回去。）'},
      {label:'end'},{speaker:null,text:'（凌晨一點，加開的那班高鐵。）'},{set:{KX_NYE_DONE:2}} ],
    consequences:{memo:'跨年：高雄・愛河邊（大二）'} },
  { id:'ev_kx_nye_river_y3', title:'跨年（大三・高雄）', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:2.5,
    beforeOuting:(G,GM)=>{ if(GM.money) GM.money(-2980,'交通'); },
    dialogue:[ {scene:'高雄・愛河邊',bg:'kh_river_night'},{speaker:null,text:'（愛河邊。她帶了兩個暖暖包，一個塞進你的外套口袋。）'},{speaker:'kexin',expression:'smile',text:'今年比去年冷。'},
      {speaker:null,text:'（零點。煙火一放，你口袋裡的暖暖包還是熱的。）'},{speaker:'kexin',expression:'smile',text:'新年快樂。'},
      {choice:[{text:'「新年快樂。」',goto:'a'},{text:'「暖暖包還妳。」',goto:'b'}]},
      {label:'a'},{speaker:'kexin',expression:'smile',text:'嗯。'},{goto:'end'},
      {label:'b'},{speaker:'kexin',expression:'teasing',text:'不用。那個本來就是你的。'},
      {label:'end'},{speaker:null,text:'（凌晨一點的高鐵。暖暖包到台中才冷掉。）'},{set:{KX_NYE_DONE:3}} ],
    consequences:{memo:'跨年：高雄・愛河邊（大三）'} },
  { id:'ev_kx_nye_river_y4', title:'跨年（大四・高雄）', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:2.5,
    beforeOuting:(G,GM)=>{ if(GM.money) GM.money(-2980,'交通'); },
    dialogue:[ {scene:'高雄・愛河邊',bg:'kh_river_night'},{speaker:null,text:'（愛河邊。她已經占好了位置，就在橋旁邊。）'},{speaker:'kexin',expression:'laugh',text:'這個位置我從國中就想占。今年終於占到。'},
      {speaker:null,text:'（零點。煙火就在橋的正上方。這個位置，真的看得最清楚。）'},{speaker:'kexin',expression:'smile',text:'新年快樂。'},
      {choice:[{text:'「新年快樂。」',goto:'a'},{text:'「明年也來。」',goto:'b'}]},
      {label:'a'},{speaker:'kexin',expression:'smile',text:'新年快樂。'},{goto:'end'},
      {label:'b'},{speaker:'kexin',expression:'teasing',text:'你先考完再說。'},
      {label:'end'},{speaker:null,text:'（凌晨一點的高鐵。手機亮了一下，是她：「到了說。」）'},{set:{KX_NYE_DONE:4}} ],
    consequences:{memo:'跨年：高雄・愛河邊（大四）'} },
  /* 跨年大三（AA_210 第 2 節＋第 5 節：刪美國路線那句、學姊那行；2027-12-31 寒假第 5 天）：出國前最後一次，大家都不提；以安、芯慈都來（芯慈第一次上頂樓）；
     倒數照大一（Alison 起頭）；00:10 散；和以安交往中＝她留下來「你排一下。」；可昕交往中選視訊＝23:59 視訊接在這一場（5-2 大三）。NYE_Y3＝'roof' */
  /* 1A-02（AA_315 第 3 節；台詞照 AA_253 第 3、4 節，不改字）：大三上第 10 週，同時和以安、學姊交往，兩人都不知道（STORY.twoHeartsDue）——
     ev_an_sis_meet_lawlib：2027-11-10（三）那晚祐廷睡著以後演（trigger 'sleep'；祐廷不在場，participants 不放人；2D「法圖長桌・夜」還沒有＝深色底，MISSING_EXTERNAL_ART），
       演完兩邊 ROM.learn、TWO_HEARTS_MET；
     ev_two_hearts_cafe：11/11 22:00 兩則私訊、22:30 兩點半 Café（出遊 must：只能「出發」，STORY.phoneRules 排），進 Café 就演；只有「學姊。」／「以安。」，
       沒被選的那位分手（STORY.twoHeartsPick：ROM.end、by her），被選的那位之後第一次說話時記得一次（STORY.twoHeartsEcho）。路線在 11/18 12:00 照選的那位定（routeDecide）。*/
  { id:'ev_an_sis_meet_lawlib', title:'法學院圖書館，週三晚上', participants:[], location:'any', trigger:'sleep', priority:8, once:true, get background(){ return typeof OUT!=='undefined'&&OUT.bg?OUT.bg('law_library'):'dark'; },   /* 11-02 LAWWW-B：用法圖的圖（原本深色底）*/
    sleepCard:['週三晚上','法學院圖書館'],
    prereq:{custom:G=>typeof STORY!=='undefined'&&!!STORY.twoHeartsDue&&STORY.twoHeartsDue(G)}, after:(G)=>{ if(typeof STORY!=='undefined'&&STORY.twoHeartsMet) STORY.twoHeartsMet(G); },
    dialogue:[ {speaker:null,text:'（週三晚上的法學院圖書館。長桌只剩一個位子，以安坐下，對面的人在看一本很厚的書。）'},
      {speaker:null,text:'（便利貼：六法借我一下。）'},   /* AA_595 1-B45：借六法改便利貼（原本「……不好意思，可以借一下六法嗎？我的忘在宿舍。」）*/
      {speaker:'heroine_05',expression:'neutral',text:'可以。第幾條？'},
      {speaker:'heroine_01',expression:'neutral',text:'行政程序法。'},
      {speaker:null,text:'（學姊把六法推過去，看了一眼她的筆記。）'},
      {speaker:null,text:'（閉館以後，你們在法圖門口又遇到。）',libOut:true},   /* libOut（AA_595 1-B45；AA 11-02 22:30 定稿）*/
      {speaker:'heroine_05',expression:'neutral',text:'妳在準備交換？'},
      {speaker:'heroine_01',expression:'neutral',text:'日檢。我要去日本。學姊呢？'},
      {speaker:'heroine_05',expression:'neutral',text:'明年夏天，美國。'},
      {speaker:'heroine_01',expression:'neutral',text:'我男朋友也在想交換。他還沒決定去哪裡。'},
      {speaker:'heroine_05',expression:'neutral',text:'我男朋友也是。'},
      {speaker:null,text:'（兩個人都停了一下。）'},
      {speaker:'heroine_01',expression:'serious',text:'他叫什麼名字？'},
      {speaker:null,text:'（學姊說了你的名字。以安把六法闔上，推回去。）'},
      {speaker:'heroine_01',expression:'serious',text:'……謝謝學姊。我想先回去了。'},
      {speaker:'heroine_05',expression:'serious',text:'等一下。'},
      {speaker:'heroine_05',expression:'serious',text:'我們明天一起找他。'} ] },
  { id:'ev_two_hearts_cafe', title:'2:30 AM，打烊後', participants:['heroine_05','heroine_01'], location:'cafe', trigger:'enter', once:true, background:'blur',
    prereq:{custom:G=>typeof STORY!=='undefined'&&!!STORY.twoHeartsCafeDue&&STORY.twoHeartsCafeDue(G)}, after:(G,GM)=>{ if(typeof STORY!=='undefined'&&STORY.twoHeartsPick) STORY.twoHeartsPick(G,GM); },
    dialogue:[ {speaker:null,text:'（學姊和以安坐在同一張桌子的兩邊。你走進去的時候，她們同時抬頭。）'},
      {speaker:'heroine_05',expression:'serious',text:'坐。'},
      {speaker:'heroine_01',expression:'serious',text:'我們昨天在法圖認識的。'},
      {speaker:'heroine_05',expression:'serious',text:'我們不吵。也不想聽你解釋為什麼。'},
      {speaker:'heroine_01',expression:'serious',text:'你只要選一個。'},
      {speaker:null,text:'（店裡很安靜。吧台的冰箱一直在響。）'},
      {choice:[{text:'「學姊。」',unless:{flags:['dating_heroine_05']},set:{TWO_HEARTS_PICK:'heroine_05'},goto:'sis'},{text:'「貝貝。」',if:{flags:['dating_heroine_05']},set:{TWO_HEARTS_PICK:'heroine_05'},goto:'sis'},{text:'「以安。」',set:{TWO_HEARTS_PICK:'heroine_01'},goto:'an'}]},   /* AA_350 R7（裁定 12）：交往當天起祐廷說出口的「學姊。」→「書瑀。」（這一場兩個都在交往中）；AA_591 決7：交往後叫「貝貝」*/
      {label:'sis'},{speaker:'heroine_01',expression:'serious',text:'……好。'},
      {speaker:'heroine_01',expression:'serious',text:'（站起來，把椅子推回去）我知道了。'},
      {speaker:null,text:'（她走出去的時候，門上的鈴響了一聲。）'},
      {speaker:'heroine_05',expression:'neutral',text:'我們也先回去。明天再說。'},{goto:'end'},
      {label:'an'},{speaker:'heroine_05',expression:'serious',text:'……好。'},
      {speaker:'heroine_05',expression:'serious',text:'（把外套拿起來）那就這樣。'},
      {speaker:'heroine_05',expression:'serious',text:'志願表的事，你自己決定。不要因為今天。'},
      {speaker:null,text:'（她走出去。門上的鈴響了一聲。）'},
      {speaker:'heroine_01',expression:'neutral',text:'我們走吧。我不想在這裡待太久。'},
      {label:'end'} ] },
  { id:'ev_y3_newyear', title:'跨年（大三）', participants:[], location:'any', trigger:'outing', once:true, background:'dorm_roof', hours:40/60,
    dialogue:[ {scene:'宿舍頂樓',bg:'dorm_roof'},{speaker:null,text:'（十一點半。阿哲和 Alison 已經在了，地上放著一袋鹹酥雞。）'},
      /* AA_313 5-6：以安、芯慈的句子要認識才有（大一跨年的 NYE_AN、NYE_XC 那樣；芯慈照結尾 rel 的 NYE_XC）*/
      {if:EV_KNOWS('heroine_01'),speaker:'yu',text:'以安，妳行李收了嗎？'},{if:EV_KNOWS('heroine_01'),speaker:'heroine_01',text:'還沒。三月才走。'},{if:EV_KNOWS('heroine_01'),speaker:'yu',text:'那也快了耶。'},{if:EV_KNOWS('heroine_01'),speaker:'heroine_01',text:'嗯。我列了一張清單，還沒開始收。'},
      {if:{custom:G=>G.flags.EXCHANGE_ROUTE==='JP'},speaker:'zhe',text:'你跟以安同一班喔？'},{if:{custom:G=>G.flags.EXCHANGE_ROUTE==='JP'},speaker:'player',text:'對。'},
      {if:{custom:G=>NYE_XC(G)},speaker:null,text:'（十一點五十，芯慈從樓梯間上來，還有點喘。）'},{if:{custom:G=>NYE_XC(G)},speaker:'classmate_xinci',text:'捷運好多人。'},
      {if:{custom:G=>!!G.flags.dating_kexin&&(G.flags.KX_NYE||{})[3]==='video'},speaker:null,text:'（十一點五十九分，可昕打視訊來。）'},{if:{custom:G=>!!G.flags.dating_kexin&&(G.flags.KX_NYE||{})[3]==='video'},speaker:'kexin',expression:'teasing',text:'我數到零就掛。你們繼續。'},
      {speaker:null,text:'（倒數是 Alison 起的頭，數到三，大家才跟上。）'},{speaker:null,text:'（零點。煙火照樣只看得到上半截。鹹酥雞的袋子被風吹得沙沙響。）'},   /* 5-6（d5cf5589）*/
      /* AA_313 第 2 節第 43 列：她的倒數、「新年快樂。」排在群戲零點之後（23:59 打來、「我數到零就掛。你們繼續。」照舊在前）*/
      {if:{custom:G=>!!G.flags.dating_kexin&&(G.flags.KX_NYE||{})[3]==='video'},speaker:null,text:'（她那邊的倒數，晚了一秒。）'},{if:{custom:G=>!!G.flags.dating_kexin&&(G.flags.KX_NYE||{})[3]==='video'},speaker:'kexin',expression:'smile',text:'新年快樂。'},{if:{custom:G=>!!G.flags.dating_kexin&&(G.flags.KX_NYE||{})[3]==='video'},set:{KX_NYE_VIDEO_Y3:true}},
      {if:{custom:G=>NYE_XC(G)},speaker:'classmate_xinci',text:'我要趕捷運。'},{if:{custom:G=>!G.flags.dating_heroine_01&&typeof STORY!=='undefined'&&!!STORY.knows&&STORY.knows('heroine_01',G)},speaker:'heroine_01',text:'我也回去了。'},{speaker:'zhe',text:'下禮拜吃飯喔。'},
      {unless:{flags:['dating_heroine_01']},goto:'y3_end'},
      {speaker:null,text:'（大家下樓以後，她還站在欄杆邊。）'},{speaker:'heroine_01',text:'三月以前，我週末都空著。'},{speaker:'heroine_01',text:'你排一下。'},
      {speaker:null,text:'（她把圍巾拉高，跟你一起下樓。）'},
      {choice:[{text:'「好。」',goto:'y3_an_a'},{text:'「妳不是最會排嗎？」',goto:'y3_an_b'}]},
      {label:'y3_an_a'},{speaker:'heroine_01',text:'排好傳給我。'},{goto:'y3_end'},
      {label:'y3_an_b'},{speaker:'heroine_01',text:'這次換你。'},
      {label:'y3_end'},
      {set:{NYE_Y3:'roof'}},{rel:{zhe:{fam:1},yu:{fam:1},classmate_bohan:{fam:1},heroine_01:{fam:1}}},{if:{custom:G=>NYE_XC(G)},rel:{classmate_xinci:{fam:1}}} ],
    consequences:{memo:'跨年：宿舍頂樓（大三）'} },
  /* 跨年大四（AA_210 第 3 節＋第 5 節；2028-12-31 寒假第 7 天）：芯慈最早到、野餐墊；〔選了考研究所、推甄沒上〕單字卡（Y4_PATH／Y4_PUSH 由大四的升學路線設定，AA_181 2-4）；
     倒數芯慈起頭；00:10 散；和以安交往中「明天中午一起吃飯？」；可昕交往中選視訊＝23:59 視訊接在這一場（5-2 大四）。NYE_Y4＝'roof' */
  { id:'ev_y4_newyear', title:'跨年（大四）', participants:[], location:'any', trigger:'outing', once:true, background:'dorm_roof', hours:40/60,
    dialogue:[ {scene:'宿舍頂樓',bg:'dorm_roof'},   /* AA_313 第 674 行：芯慈的句子要認識才有（同大三 NYE_XC）；不認識＝沒有她開頭那三行和倒數那一行 */
      {if:{custom:G=>NYE_XC(G)},speaker:null,text:'（十一點半。芯慈比你們都早到，已經把野餐墊鋪好了。）'},
      {if:{custom:G=>NYE_XC(G)},speaker:'classmate_xinci',text:'去年我就覺得這裡很冷。'},{if:{custom:G=>NYE_XC(G)},speaker:'zhe',text:'每年都冷。'},{speaker:'yu',text:'今年看得到嗎？'},{speaker:'zhe',text:'看得到一點。'},
      {if:{custom:G=>G.flags.Y4_PATH==='grad'&&G.flags.Y4_PUSH!=='pass'},speaker:null,text:'（你口袋裡有一疊單字卡。二月三號考試。）'},{if:{custom:G=>G.flags.Y4_PATH==='grad'&&G.flags.Y4_PUSH!=='pass'},speaker:'classmate_bohan',text:'帶了？'},
      {if:{custom:G=>G.flags.Y4_PATH==='grad'&&G.flags.Y4_PUSH!=='pass'},speaker:'player',text:'帶了。'},{if:{custom:G=>G.flags.Y4_PATH==='grad'&&G.flags.Y4_PUSH!=='pass'},speaker:'classmate_bohan',text:'今天先不要看。'},
      {if:{custom:G=>!!G.flags.dating_kexin&&(G.flags.KX_NYE||{})[4]==='video'},speaker:null,text:'（十一點五十九分，可昕打視訊來。）'},{if:{custom:G=>!!G.flags.dating_kexin&&(G.flags.KX_NYE||{})[4]==='video'},speaker:'kexin',expression:'smile',text:'你們那邊好冷的樣子。……外套拉起來。'},
      {if:{custom:G=>NYE_XC(G)},speaker:null,text:'（倒數是芯慈起的頭，比電視早了一秒。）'},
      /* AA_313 第 2 節第 47 列：同大三，她的零點、「新年快樂。」排在群戲倒數之後 */
      {if:{custom:G=>!!G.flags.dating_kexin&&(G.flags.KX_NYE||{})[4]==='video'},speaker:null,text:'（零點。兩邊的煙火，一大一小。）'},{if:{custom:G=>!!G.flags.dating_kexin&&(G.flags.KX_NYE||{})[4]==='video'},speaker:'kexin',expression:'smile',text:'新年快樂。'},{if:{custom:G=>!!G.flags.dating_kexin&&(G.flags.KX_NYE||{})[4]==='video'},set:{KX_NYE_VIDEO_Y4:true}},
      {speaker:'zhe',text:'回去睡覺。'},{speaker:'yu',text:'我要趕捷運！'},
      {unless:{flags:['dating_heroine_01']},goto:'y4_end'},
      {speaker:'heroine_01',text:'明天中午一起吃飯？'},
      {choice:[{text:'「好。」',goto:'y4_an_a'},{text:'「我想睡到下午。」',goto:'y4_an_b'}]},
      {label:'y4_an_a'},{speaker:'heroine_01',text:'十二點，宿舍樓下。'},{goto:'y4_end'},
      {label:'y4_an_b'},{speaker:'heroine_01',text:'那一點。'},
      {label:'y4_end'},
      {set:{NYE_Y4:'roof'}},{rel:{zhe:{fam:1},yu:{fam:1},classmate_bohan:{fam:1},heroine_01:{fam:1}}},{if:{custom:G=>NYE_XC(G)},rel:{classmate_xinci:{fam:1}}} ],
    consequences:{memo:'跨年：宿舍頂樓（大四）'} },
  /* 和語彤交往中（AA_210 3-6）：00:01 她打電話來（在家陪媽媽）*/
  { id:'ev_yt_nye_call_y4', title:'語彤的電話（大四跨年）', participants:['heroine_03'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.15,
    dialogue:[ {scene:'電話'}, {speaker:'heroine_03',text:'新年快樂。'},{speaker:'heroine_03',text:'我媽在旁邊。她說新年快樂。'},{speaker:null,text:'（電話那頭，電視的倒數還沒播完。）'},
      {choice:[{text:'「幫我跟妳媽媽說新年快樂。」',goto:'a'},{text:'「妳們在看什麼？」',goto:'b'}]},
      {label:'a'},{speaker:'heroine_03',text:'好。'},{goto:'end'},
      {label:'b'},{speaker:'heroine_03',text:'不知道。她轉到哪台就看哪台。'},
      {label:'end'},{set:{YT_NYE_CALL_Y4:true}} ] },
  /* 芷若在英國的跨年（AA_210 5-3＋5-7，b4e48e0d；英國比臺灣慢 8 小時）：交往中＝12/31 23:59 她先傳、1/1 08:00 視訊（接起來／先不接；沒接＝08:30 一則，不扣分）；
     朋友、好朋友（含曖昧）＝1/1 08:00 私訊；認識、有點熟不收（5-7 第 2 點）。S.zrNye 排 */
  { id:'ev_zr_nye_video_y3', title:'芷若的視訊（大三跨年）', participants:['heroine_02'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.25,
    outingMissed:(G,GM,q)=>{ if(typeof PHONE!=='undefined') PHONE.at(G,q.day,8.5,[{th:'p:heroine_02',from:'heroine_02',text:'沒關係。你那邊早上了，可能還在睡。新年快樂。'}],'zr_nye_miss_y3'); },
    dialogue:[ {scene:'視訊',bg:'video'}, {speaker:'heroine_02',text:'你那邊已經是早上了。'},{speaker:'heroine_02',text:'我這邊剛好跨年。外面在放煙火，你聽得到嗎？'},
      {speaker:null,text:'（她把手機轉向窗外。很遠的地方有煙火，聲音比畫面慢了一點。）'},
      {choice:[{text:'「新年快樂。」',goto:'a'},{text:'「妳那邊冷嗎？」',goto:'b'}]},
      {label:'a'},{speaker:'heroine_02',text:'新年快樂。……你那邊八個小時以前就說過了吧。'},{goto:'end'},
      {label:'b'},{speaker:'heroine_02',text:'冷。可是外面好多人，沒那麼冷。'},
      {label:'end'},{speaker:'heroine_02',text:'我要去睡了。你去吃早餐。'},{speaker:null,text:'（畫面停在她揮手的那一格，才斷掉。）'},{set:{ZR_NYE_VIDEO_Y3:true}} ] },
  /* AA_468 第 1 節（企劃線 cd2dc7646）：大四照表換字（開頭、選項照舊；含沒接的 08:30 那一則）；大三照舊 */
  { id:'ev_zr_nye_video_y4', title:'芷若的視訊（大四跨年）', participants:['heroine_02'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.25,
    outingMissed:(G,GM,q)=>{ if(typeof PHONE!=='undefined') PHONE.at(G,q.day,8.5,[{th:'p:heroine_02',from:'heroine_02',text:'睡吧，新年快樂。醒了再說。'}],'zr_nye_miss_y4'); },
    dialogue:[ {scene:'視訊',bg:'video'}, {speaker:'heroine_02',text:'臺灣的年你跨完了。換我。'},
      {speaker:null,text:'（她把手機轉向窗外。今年的煙火近一點，是從河對岸放的。）'},
      {choice:[{text:'「新年快樂。」',goto:'a'},{text:'「妳那邊冷嗎？」',goto:'b'}]},
      {label:'a'},{speaker:'heroine_02',text:'新年快樂。……第二年了，我還是比你晚。'},{goto:'end'},
      {label:'b'},{speaker:'heroine_02',text:'冷。今年我有買手套了。'},
      {label:'end'},{speaker:'heroine_02',text:'我要去睡了。……八月就回去了。'},{speaker:null,text:'（畫面斷掉以前，她把手機轉回窗外，讓你多看了一秒煙火。）'},{set:{ZR_NYE_VIDEO_Y4:true}} ] },
  /* 和語彤交往中，大三跨年（AA_313 第 4-1 節第 13 點，照大二、大四的格式）：00:01 她打電話來（店裡提早收）*/
  { id:'ev_yt_nye_call_y3', title:'語彤的電話（大三跨年）', participants:['heroine_03'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.15,
    dialogue:[ {scene:'電話'}, {speaker:null,text:'（電話。她那邊很安靜。）'},{speaker:'heroine_03',text:'……新年快樂。'},
      /* AA_524 Y2：大二跨年說了「下次一起看。」（YT_NYE_TOGETHER）——「……新年快樂。」之後開視訊、二選一，接回現有的句子 */
      {unless:{flags:['YT_NYE_TOGETHER']},goto:'yt3_back'},
      {speaker:'heroine_03',text:'說好一起看的。'},{speaker:'heroine_03',text:'我開視訊。'},{speaker:null,text:'（畫面裡是她家的窗戶。遠處的煙火很小，聲音晚了一秒才傳過來。）'},{speaker:'heroine_03',text:'這樣算一起嗎。'},
      {choice:[{text:'「算。」',goto:'yt3_a'},{text:'「不算。」',goto:'yt3_b'}]},
      {label:'yt3_a'},{speaker:'heroine_03',text:'……嗯。'},{goto:'yt3_back'},
      {label:'yt3_b'},{speaker:'heroine_03',text:'我知道。'},
      {label:'yt3_back'},{speaker:'heroine_03',text:'茶屋今天提早收。蘇姨說跨年沒有人喝茶。'},{speaker:'heroine_03',text:'你那邊好吵。……好，你去看。我掛了。'},
      {set:{YT_NYE_CALL_Y3:true}} ] },
  /* 和語彤交往中（AA_210 1-6）：00:01 她打電話來（收完店回家陪媽媽；在頂樓也可以接）*/
  { id:'ev_yt_nye_call_y2', title:'語彤的電話（大二跨年）', participants:['heroine_03'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.15,
    dialogue:[ {scene:'電話'}, {speaker:null,text:'（零點過一分，手機響了。是語彤。）'},{speaker:'heroine_03',text:'新年快樂。'},{speaker:'heroine_03',text:'我媽十點就睡了。我一個人看倒數。'},
      {speaker:null,text:'（電話那頭，電視的聲音開得很小。）'},
      {choice:[{text:'「妳一個人看？」',goto:'a'},{text:'「下次一起看。」',set:{YT_NYE_TOGETHER:true},goto:'b'}]},   /* AA_524 Y2：記 YT_NYE_TOGETHER（大三跨年的電話讀）*/
      {label:'a'},{speaker:'heroine_03',text:'現在沒有了。'},{goto:'end'},
      {label:'b'},{speaker:'heroine_03',text:'……嗯。'},{speaker:null,text:'（她沒有掛電話。你也沒有。）'},
      {label:'end'},{set:{YT_NYE_CALL_Y2:true}} ] },
  { id:'ev_term_last_meal_y2s1', title:'期末最後一頓（大二上）', participants:[], location:['noodle','wz_offbeat'], trigger:'enter', term:['Y2S1'], time:[17,22], once:true, background:'blur',   /* AA_648 第 1 節：日常失速 */
    prereq:{custom:G=>{ if(G.flags.noodleTableDay==null||typeof CLS==='undefined'||!CLS.lastExamEnd) return false; const e=CLS.lastExamEnd(G,'Y2S1','final'); return !!e&&(G.day>e.day||(G.day===e.day&&G.hour>=e.h))&&G.zone===(typeof OFFB!=='undefined'&&OFFB.finalZone?OFFB.finalZone(G,'Y2S1'):'noodle'); }},
    dialogue:[ {if:{custom:G=>G.zone==='wz_offbeat'},call:async(G,GM)=>{ if(typeof OFFB!=='undefined'&&OFFB.finalSeat) OFFB.finalSeat(GM,'Y2S1'); }}, {speaker:null,text:'（大二上最後一科考完。長桌的位子，大家已經不用講就會坐。）'},{if:{custom:G=>G.zone==='noodle'},speaker:null,text:'（桌上多了一碟小黃瓜。沒有人點。）'},{if:{custom:G=>G.zone==='wz_offbeat'},speaker:null,text:'（桌上多了一盤薯條。沒有人點。）'},{if:{custom:G=>G.zone==='noodle'&&(G.weather==='rain'||G.weather==='typhoon')},speaker:'阿姨',text:'吃完再走。外面在下雨。'},{if:{custom:G=>G.zone==='noodle'&&!(G.weather==='rain'||G.weather==='typhoon')},speaker:'阿姨',text:'吃完再走。'},{if:{custom:G=>G.zone==='wz_offbeat'&&(G.weather==='rain'||G.weather==='typhoon')},speaker:'店員',text:'外面在下雨。……我們開到一點，不急。'},{if:{custom:G=>G.zone==='wz_offbeat'&&!(G.weather==='rain'||G.weather==='typhoon')},speaker:'店員',text:'不急。'},   /* AA_519 1-3：送小菜第四處＝第 3 句；「吃好一點」換掉（不下雨的那一版：「吃完再走。」）*/   /* AA_467 第 1 節（企劃線 5bbd16ab1）：前三句換字，後面三句照舊 */
      {if:{custom:G=>!!(G.events&&G.events.done&&G.events.done.ev_yu_together)||!!G.flags.YU_ZHE_TOLD},speaker:null,text:'（Alison 和阿哲坐在一起。）'},
      {if:EV_KNOWS('heroine_01'),speaker:null,text:'（以安在手帳上寫：「大二上：完成」。）'},
      {if:EV_KNOWS('heroine_03'),speaker:'heroine_03',expression:'smile',text:'考完了。今天什麼都不想讀。'}   /* AA_648 第 5 節：秀琴姨是語彤家的煮飯阿姨、「今天我是客人」是舊設定（她在麵店幫忙）——兩個版本都換 */,{if:{custom:G=>G.zone==='wz_offbeat'},call:async(G,GM)=>{ if(typeof OFFB!=='undefined'&&OFFB.finalNarrOf) await GM.say(null,OFFB.finalNarrOf('Y2S1')); }},{if:{custom:G=>G.zone==='wz_offbeat'},call:async(G,GM)=>{ if(typeof OFFB!=='undefined'&&OFFB.finalUnseat) OFFB.finalUnseat(GM); }} ],
    consequences:{memo:'期末最後一頓（大二上）'} },
  /* 期末最後一頓（大二下；AA_143 2-7，AA143-Y2S2-LASTMEAL-1031）：麵店那一頓照 1-8，大二版的一句是阿姨「明年你們大三了。……我記得你們大一的樣子。」。
     最後一科考完那天 17:00 阿哲「考完了 七點，麵店」（同大二上，story3d.js）；走進麵店就演。稿只給阿姨那一句：開頭一句旁白是技術上的場景交代 */
  { id:'ev_term_last_meal_y2s2', title:'期末最後一頓（大二下）', participants:[], location:['noodle','wz_offbeat'], trigger:'enter', term:['Y2S2'], time:[17,22], once:true, background:'blur',   /* AA_648 第 1 節：日常失速 */
    prereq:{custom:G=>{ if(G.flags.noodleTableDay==null||typeof CLS==='undefined'||!CLS.lastExamEnd) return false; const e=CLS.lastExamEnd(G,'Y2S2','final'); return !!e&&(G.day>e.day||(G.day===e.day&&G.hour>=e.h))&&G.zone===(typeof OFFB!=='undefined'&&OFFB.finalZone?OFFB.finalZone(G,'Y2S2'):'noodle'); }},
    dialogue:[ {if:{custom:G=>G.zone==='wz_offbeat'},call:async(G,GM)=>{ if(typeof OFFB!=='undefined'&&OFFB.finalSeat) OFFB.finalSeat(GM,'Y2S2'); }}, {speaker:null,text:'（大二下最後一科考完。）'},{if:{custom:G=>G.zone==='noodle'},speaker:'阿姨',text:'明年你們大三了。……我記得你們大一的樣子。'},{if:{custom:G=>G.zone==='wz_offbeat'},speaker:'店員',text:'明年你們大三了。……我記得你們第一次來，桌遊規則看了一個小時。'},{if:{custom:G=>G.zone==='wz_offbeat'},call:async(G,GM)=>{ if(typeof OFFB!=='undefined'&&OFFB.finalNarrOf) await GM.say(null,OFFB.finalNarrOf('Y2S2')); }},{if:{custom:G=>G.zone==='wz_offbeat'},call:async(G,GM)=>{ if(typeof OFFB!=='undefined'&&OFFB.finalUnseat) OFFB.finalUnseat(GM); }} ],
    consequences:{memo:'期末最後一頓（大二下）'} },
  /* ===================== 大二（交接包 v3）=====================
     D24 社團博覽會大二版（AA_170 第 1 節，AA-B 2026-10-16；第②級）：2026-09-12（六）10:00～16:00（AA_485 3-2；原本 09-16（三）、09-17（四）11:00～17:00），椰林大道同一排攤位（大一 club_expo_y1s1 的 spot），
     窗口內第一次走到攤位那一排。站哪一攤照大一加入的社團（CLUB_<id>）；加入不只一個＝選單選；站一個小時（不扣時段次數）。都沒加入＝走過、柏翰遞傳單（AA_358 2-5：原本語彤，她不進法服）。
     記 Y2_EXPO_BOOTH（攤位 id／'none'）、Y2_EXPO_SENIOR（第一次被叫學長；AA 寫的「記憶」，存成旗標）；在場、認識的同社團的人熟悉 +1。
     只有認識的人說話（AA_143 通則）；子晴、學姊的句子是 BB-B 補的（BB_157 第 1 節）*/
  ...(()=>{ const knows=id=>G=>typeof STORY!=='undefined'&&STORY.knows(id,G), B=v=>({flagIs:{Y2_EXPO_BOOTH:v}}), C=id=>G=>!!G.flags['CLUB_'+id];
    const CLUBS=['lawclub_study','club_guitar','club_debate','club_hiking','dept_basketball'], NAME={lawclub_study:'法服',club_guitar:'吉他社',club_debate:'辯論社',club_hiking:'登山社',dept_basketball:'系籃'};
    const DATES=['2026-09-12'];   /* CLUBFAIR-REAL-1027（AA_485 3-2）：照實際，開學第一週的週六、一天 10:00～16:00（原本 9/16、9/17 11:00～17:00）*/
    return [{ id:'ev_y2_club_expo', title:'社團博覽會（大二）', participants:[], location:'campus', trigger:'auto', term:['Y2S1'], time:[10,16], once:true, background:'blur', near:{x:-39,z:0,r:53},
      prereq:{custom:G=>typeof CALENDAR!=='undefined'&&DATES.includes(CALENDAR.dateOf(G.day).key)&&(()=>{ const P=typeof GAME!=='undefined'&&GAME.E&&GAME.E.player&&GAME.E.player.obj.position; return !P||(Math.abs(P.z)<=12.5&&P.x>=-91&&P.x<=13); })()},   /* 走到攤位那一排＝椰林大道 x −91～13、|z|≤12.5（傅鐘那兩頂的前面 z 11.5 也算；LAWWW2 36 頂沿大道兩邊，CLUBFAIR-REAL-1027；原本傅鐘旁 (-13.5,13.6) 半徑 5）*/
      dialogue:[ {unless:{custom:G=>!!G.flags.CLUB_DOOR&&!G.flags.FAIR_JOIN},speaker:null,text:'去年，你站在這一排攤位前面填表。'},
        {if:{custom:G=>!!G.flags.CLUB_DOOR&&!G.flags.FAIR_JOIN},speaker:null,text:'去年，你是在社課的門口填的表。'},   /* AA_491 B：大一沒在社博填表、在社課填的（clubfair3d.js 的 CLUB_DOOR、FAIR_JOIN）*/
        {if:{custom:G=>CLUBS.some(c=>G.flags['CLUB_'+c])},speaker:null,text:'今年，你站在攤位後面。'},
        {unless:{custom:G=>CLUBS.some(c=>G.flags['CLUB_'+c])},set:{Y2_EXPO_BOOTH:'none'}},{unless:{custom:G=>CLUBS.some(c=>G.flags['CLUB_'+c])},goto:'none'},   /* 帶 goto 的那一行不會執行 set，分兩行 */
        {choice:CLUBS.map(c=>({text:'（在'+NAME[c]+'的攤位站一個小時）',if:{custom:C(c)},set:{Y2_EXPO_BOOTH:c}}))},
        {advance:1},
        {if:B('lawclub_study'),goto:'L'},{if:B('club_guitar'),goto:'GT'},{if:B('club_debate'),goto:'DB'},{if:B('club_hiking'),goto:'HK'},{if:B('dept_basketball'),goto:'BK'},{goto:'end'},
        /* 法服 */
        {label:'L'},{speaker:'新生',text:'學長，法服是做什麼的？'},
        {choice:[{text:'「幫人看法律問題。」',goto:'L1'},{text:'「有人來問問題，我們先聽他把事情講完，再找條文。」',goto:'L2'}]},
        {label:'L1'},{speaker:'新生',text:'那你很厲害耶。'},{speaker:null,text:'你想說「我只是坐在旁邊做紀錄」，最後沒說。'},{goto:'end'},
        {label:'L2'},{if:{custom:knows('classmate_bohan')},speaker:null,text:'攤位後面，柏翰抬頭看了你一眼。'},{if:{custom:knows('classmate_bohan')},speaker:'classmate_bohan',text:'……順序對了。'},   /* AA_374 第 6 項：學姊大二起是碩一、不回法服（S.fafuSisHere=false、口氣表 0-3）——拿掉，換大二的法服社長柏翰 */
        {goto:'end'},   /* AB65-3（AA_211 附錄 A 語彤一列、第 1 節第 4 點；AA_193 第 5 節正式拿掉的回聲）：原本語彤（AA_358 2-5 換柏翰）點破「是學姊的」那一句刪掉 */
        /* 吉他社 */
        {label:'GT'},{if:{custom:knows('yu')},speaker:'yu',text:'欸{name}你負責發傳單！對了你會彈哪首？……三個和弦也行啦。'}   /* AA_313 5-4（AA_389 第 6 點：照逐場表）：不寫死玩家名字、不用「……好啦我知道」反轉 */,
        {speaker:'新生',text:'學長，完全沒碰過可以嗎？'},{speaker:'player',text:'可以。我去年也是。'},
        {if:{custom:knows('heroine_04')},speaker:'heroine_04',text:'可以啊，我們社一半的人進來都不會。'},{if:{custom:knows('heroine_04')},speaker:'heroine_04',text:'先填表，第一次社課教 C 和弦。'},{goto:'end'},
        /* 辯論社 */
        {label:'DB'},{speaker:'新生',text:'學長，辯論社要很會講話嗎？'},{speaker:'player',text:'還好，我進去以前也很怕上台。'},{goto:'end'},
        /* 登山社 */
        {label:'HK'},{speaker:'新生',text:'學長，爬山會很累嗎？'},{speaker:'player',text:'會啊，我第一次爬完腿痠三天。'},{goto:'end'},
        /* 系籃 */
        {label:'BK'},{if:{flags:['ZHE_CALLS_GE']},speaker:'zhe',text:'哥，你站這裡。身高夠，看起來很會打。'},{unless:{flags:['ZHE_CALLS_GE']},speaker:'zhe',text:'欸，你站這裡。身高夠，看起來很會打。'},   /* AA_374 第 7 項：沒有「哥」的玩家（宿營夜談選「跟你們一樣啦」、中秋也沒問）*/{speaker:'新生',text:'學長，系籃要每天練嗎？'},
        {speaker:'zhe',text:'不用每天啦，週五晚上練一次。'},{speaker:'新生',text:'那我可以先去看看嗎？'},{speaker:'zhe',text:'可以啊，球場在映月湖旁邊。'},
        {label:'end'},{speaker:null,text:'一個小時，有人叫了你四次「學長」。'},{speaker:null,text:'第一次，你回頭找是誰在叫別人。'},{goto:'fin'},
        /* 都沒加入 */
        {label:'none'},{if:{custom:knows('classmate_bohan')},speaker:null,text:'（你只是走過。法服的攤位後面，柏翰在發傳單。）'},{unless:{custom:knows('classmate_bohan')},speaker:null,text:'你只是走過。'},   /* AA_358 2-5：語彤換柏翰；不認識柏翰照現在 */
        {if:{custom:knows('classmate_bohan')},speaker:'classmate_bohan',text:'法服的傳單，週六有值班。'},{if:{custom:knows('classmate_bohan')},speaker:null,text:'（他遞一張給你，又想起來，你不是新生。）'},{if:{custom:knows('classmate_bohan')},speaker:'classmate_bohan',text:'……那你幫我拿給大一的。'},
        {label:'fin'} ],
      after:(G,GM)=>{ const F=G.flags, b=F.Y2_EXPO_BOOTH; if(b&&b!=='none'){ F.Y2_EXPO_SENIOR=true; const here={lawclub_study:['classmate_bohan'],club_guitar:['yu','heroine_04'],dept_basketball:['zhe']}[b]||[];   /* 法服攤位：語彤換柏翰（AA_358 2-5）；學姊不在攤位（AA_374 第 6 項：熟悉 +1 只給柏翰）*/
          if(typeof SOCIAL!=='undefined') for(const id of here) if(typeof STORY==='undefined'||STORY.knows(id,G)) SOCIAL.adjust(id,{fam:1}); } } }]; })(),
  /* D3 開學第一頓（AA_143 1-1；日期、邀約、沒去照 AA_177 第 3 節第 1 項、第 6 節）：9/17（四）19:00 阿鳳麵店長桌（2D 出遊）；當天 17:00 阿哲在桌遊團群組（不在群組的私訊）；
     19:15 還沒出發＝沒去，21:30 群組一張照片（story3d.js phoneRules 'y2_first_meal'）。只有認識的人說話 */
  { id:'ev_y2_first_meal', title:'開學第一頓', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:1.5,
    dialogue:[ {scene:'公館燒臘・長桌',bg:'noodle_table'},
      {speaker:null,text:'（暑假以後第一次，長桌又併起來了。）'},   /* AA_428 §2 第 1 點：9/17（四）不是開學第一晚；scene 後面、阿哲第一句前面 */
      {speaker:'zhe',text:'大二了，要有學長的樣子。'},{speaker:'zhe',text:'（三秒後）阿姨，大碗。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('heroine_01',G)},speaker:'heroine_01',text:'我把大家的課表排在一起了，週四晚上大家都沒課。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('heroine_03',G)},speaker:'heroine_03',text:'（倒茶過來）蘇姨說開學，每杯多一塊茶點。'},
      {choice:[{text:'「行政法妳選哪一班？」',if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('heroine_01',G)},goto:'a'},{text:'「先吃。」',goto:'b'}]},
      {label:'a'},{speaker:'heroine_01',text:'許老師那班，聽說他很愛點人。'},{goto:'end'},
      {label:'b'},{speaker:null,text:'（阿哲已經開始吃了。）'},
      {label:'end'} ],
    consequences:{flags:{Y2_FIRST_MEAL:true},memo:'大二的開學第一頓（公館燒臘）'} },
  /* D3 中秋烤肉（大二版；AA_143 1-2；AA_177 第 6 節）：9/25（五）18:00 公館的河濱；前一晚 9/24 21:00 阿哲在桌遊團群組（不在群組的私訊）；
     沒去＝21:30 群組一張照片。祐廷負責借烤肉架：兩個架子、少一支夾子。只有認識的人說話；記 MIDAUTUMN_Y2 */
  { id:'ev_y2_midautumn', title:'中秋烤肉（大二）', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:2.5,
    dialogue:[ {scene:'河濱',bg:'riverside'},
      {speaker:'zhe',text:'夾子呢？'},{speaker:'player',text:'……兩個架子，一支夾子。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('classmate_bohan',G)},speaker:'classmate_bohan',text:'那輪流，一人夾十分鐘。'},
      /* AA_428 §2 第 2 點：以安「我贊成。這樣公平。」刪掉（照 AA_211 3-2「以安這場不說話」）*/
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('yu',G)},speaker:null,text:'（Alison 已經拿筷子在翻肉了。）'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('classmate_xinci',G)},speaker:'classmate_xinci',text:'左邊火比較大，肉先放左邊。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('heroine_03',G)},speaker:null,text:'（語彤從袋子裡拿出一罐秀琴姨做的醬。）'},
      {choice:[{text:'「我去便利商店買一支夾子。」',set:{MA_Y2_TONGS:'buy'},goto:'a'},{text:'「用筷子就好。」',set:{MA_Y2_TONGS:'chop'},goto:'b'}]},
      {label:'a'},{speaker:null,text:'（回來時，大家已經用筷子烤完第一輪。）'},{speaker:'zhe',text:'你回來了喔，第一輪吃完了。'},{goto:'end'},
      {label:'b'},{if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('yu',G)},speaker:'yu',text:'對嘛。'},
      {label:'end'},
      /* 可昕的那一段（AA_325 2-Y2-04；BB_97 9-17）：交往中、大一 K3 她來過（KX_MET_NOODLE_TEAM），炭第二輪才到；冷笑話照 KX_JOKE；選了用筷子的才有筷子三句（取代假設題，裁定 #5）*/
      {if:{custom:G=>!!G.flags.dating_kexin&&!!G.flags.KX_MET_NOODLE_TEAM},speaker:null,text:'（她到的時候，炭已經是第二輪了。她提著一袋玉米。）'},
      {if:{custom:G=>!!G.flags.dating_kexin&&!!G.flags.KX_MET_NOODLE_TEAM&&!!G.flags.KX_JOKE},speaker:'zhe',expression:'laugh',text:'冷笑話，第二回合。'},
      {if:{custom:G=>!!G.flags.dating_kexin&&!!G.flags.KX_MET_NOODLE_TEAM&&!!G.flags.KX_JOKE&&G.flags.KX_JOKE!=='zhe'},speaker:'kexin',expression:'smile',text:'好。今年我帶了新的。'},
      {if:{custom:G=>!!G.flags.dating_kexin&&!!G.flags.KX_MET_NOODLE_TEAM&&G.flags.KX_JOKE==='zhe'},speaker:'kexin',expression:'smile',text:'去年輸你。今年我帶了新的。'},
      {if:{custom:G=>!!G.flags.dating_kexin&&!!G.flags.KX_MET_NOODLE_TEAM&&!!G.flags.KX_JOKE},speaker:'kexin',expression:'teasing',text:'月亮為什麼中秋特別圓？……因為它也吃了月餅。'},
      {if:{custom:G=>!!G.flags.dating_kexin&&!!G.flags.KX_MET_NOODLE_TEAM&&!!G.flags.KX_JOKE},speaker:'zhe',text:'……妳有練。'},
      {if:{custom:G=>!!G.flags.dating_kexin&&!!G.flags.KX_MET_NOODLE_TEAM&&G.flags.MA_Y2_TONGS==='chop'},speaker:'kexin',expression:'teasing',text:'（看了一眼烤肉架）……你們在用筷子烤？'},
      {if:{custom:G=>!!G.flags.dating_kexin&&!!G.flags.KX_MET_NOODLE_TEAM&&G.flags.MA_Y2_TONGS==='chop'},speaker:'zhe',text:'借烤肉架的人，只借到一支夾子。'},
      {if:{custom:G=>!!G.flags.dating_kexin&&!!G.flags.KX_MET_NOODLE_TEAM&&G.flags.MA_Y2_TONGS==='chop'},speaker:null,text:'（她看了你一眼，把玉米放上架子，用筷子翻。）'} ],
    consequences:{flags:{MIDAUTUMN_Y2:true},memo:'大二的中秋烤肉（河濱）'} },
  /* D3 迎新（大二版，小隊輔；AA_143 1-3、AA_177 第 6、9 節；AA_310 第 2 節改到開學前）：9/6（日）14:00 社科院旁的草地（2D 出遊；AA_177 第 9 節：先做 2D，三個背景配三題，3D 帶隊之後再做）。
     邀約：9/4（五）21:00 系學會在「法律系（全班）」群組（law_class）；沒去＝9/6 21:30 同一個群組一張照片。開頭旁白用 AA 寫的照片說明。
     三題：前兩題各兩個選項、都是好答案（只記 MENTOR_STYLE）；第 3 題「為什麼念法律？」三個短版（AA_905：舊序章那一個答案拿掉，CANON-NO-ECON-1112 第四批），第二天選的那一句（whyLaw）排第一，四個都可以選；記 MENTOR_WHY、筆記「我認識的人：迎新的學弟妹」。
     收尾：阿哲（另一隊的小隊輔）在傅鐘下喊口號（沒有傅鐘的 2D 背景：椰林大道）。*/
  { id:'ev_y2_welcome', title:'迎新（小隊輔）', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:2.5,
    dialogue:[ {scene:'社科院旁的草地',bg:'ntu_soc'},{speaker:null,text:'（一群新生圍成一圈，手上拿著名牌。）'},
      {speaker:'新生',text:'學長，大一要先念什麼？'},{choice:[{text:'「民總。」',set:{MENTOR_STYLE_Q1:'civil'}},{text:'「先認識人。」',set:{MENTOR_STYLE_Q1:'people'}}]},
      {scene:'椰影大道',bg:'ntu_avenue'},
      {speaker:'新生',text:'法律系會很難交朋友嗎？'},{choice:[{text:'「去燒臘店就好。」',set:{MENTOR_STYLE_Q2:'noodle'}},{text:'「不會，你看我。」',set:{MENTOR_STYLE_Q2:'me'}}]},
      {scene:'法律系館A前',bg:'ntu_linze'},
      {speaker:'新生',text:'為什麼念法律？'},
      {choice:[{text:'「小時候遇到事情就去翻民法。翻得到，看不懂。」',if:{custom:G=>WHY_KEY(G)==='curious'},set:{MENTOR_WHY:'curious'},goto:'why'},
        {text:'「想幫身邊的人把事情弄清楚。」',if:{custom:G=>WHY_KEY(G)==='help'},set:{MENTOR_WHY:'help'},goto:'why'},
        {text:'「還在找怎麼說。但這是我自己選的。」',if:{custom:G=>WHY_KEY(G)==='own'},set:{MENTOR_WHY:'own'},goto:'why'},
        {text:'「小時候遇到事情就去翻民法。翻得到，看不懂。」',unless:{custom:G=>WHY_KEY(G)==='curious'},set:{MENTOR_WHY:'curious'},goto:'why'},
        {text:'「想幫身邊的人把事情弄清楚。」',unless:{custom:G=>WHY_KEY(G)==='help'},set:{MENTOR_WHY:'help'},goto:'why'},
        {text:'「還在找怎麼說。但這是我自己選的。」',unless:{custom:G=>WHY_KEY(G)==='own'},set:{MENTOR_WHY:'own'},goto:'why'}]},
      {label:'why'},{speaker:'新生',text:'……學長，那我還有四年可以想。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('zhe',G)},scene:'椰影大道・晨思鐘下',bg:'ntu_avenue'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('zhe',G)},speaker:'zhe',text:'我們這隊的口號是：吃飽！'},   /* AA_313 5-3：「大碗」只留大二開學第一頓那一次 */
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('zhe',G)},speaker:'新生',text:'……學長，我們的口號是什麼？'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('zhe',G)},choice:[{text:'「沒有口號。」',set:{MENTOR_SLOGAN:'none'}},{text:'「……也是大碗。」',set:{MENTOR_SLOGAN:'bowl'}}]} ],
    after:(G,GM)=>{ const F=G.flags; F.MENTOR_STYLE={q1:F.MENTOR_STYLE_Q1||null,q2:F.MENTOR_STYLE_Q2||null}; delete F.MENTOR_STYLE_Q1; delete F.MENTOR_STYLE_Q2;
      const t=MENTOR_WHY_TEXT[F.MENTOR_WHY]; if(t&&GM&&GM.addNote) GM.addNote('mentor_why','我認識的人：迎新的學弟妹','學弟問我為什麼念法律。我說：『'+t+'』'); },
    consequences:{flags:{Y2_WELCOME:true},memo:'大二的迎新（小隊輔）'} },
  /* 學姊 W6 交接（BB_97 2-1，BB-B 定稿）：大二上第 1～2 週週三的法服讀書會（萬才館研討室 A，classes3d.js clubEvent 先演這件）；法服社員（lawclub）、只一次。新社長柏翰。
     流程裡的「大家笑了……她也笑了。」用 BB 的字當旁白。沒加入法服的、到第 2 週都沒去的社員：家族群組 Kevin「學姊卸任了！」學姊「收到。」（story3d.js phoneRules 'sis_handover_group'）*/
  { id:'ev_sis_handover', retired:'BB_191 §7-3：學姊在祐廷大一時已經是前任社長（BB_122 ★-5），這場交接刪；定義留給已經演過的舊存檔', title:'交接', participants:['heroine_05'], location:'wancai', trigger:'club', term:['Y2S1'], weeks:[6,7], weekday:[3], once:true, background:'blur',   /* BB-B 75c1b2b1（AA_185 3-1）：社長交接定在大二上第 6 週週三的法服讀書會，到第 7 週為止（第 1～5 週學姊還是社長）*/
    prereq:{custom:G=>!!(G.flags.lawclub||G.flags.CLUB_lawclub_study)},
    dialogue:[ {speaker:'heroine_05',text:'交接三件事。'},{speaker:'heroine_05',text:'一，週六的值班表在雲端。'},{speaker:'heroine_05',text:'二，指導律師的聯絡方式在資料夾。'},{speaker:'heroine_05',text:'三……'},
      {speaker:null,text:'（三個人在等她。）'},{speaker:'heroine_05',text:'……三，我想不起來了。'},
      {speaker:null,text:'大家笑了，以為她在開玩笑。她也笑了。'},{speaker:null,text:'你看見她的手在找保溫瓶。'} ],
    consequences:{flags:{SIS_HANDOVER_SEEN:true},memo:'學姊在法服交接（新社長：柏翰）'} },
  /* 子晴 Q7 實驗室的信（BB_97 3-1，BB-B 定稿）：大二上第 3 週的吉他社社課（萬才館多功能教室，週一或週三 19–21；classes3d.js clubEvent 先演這件）、和她有點熟以上、只一次。
     三個選項都記 LAB_LETTER；「接妳爸的電話。」是 Q8 的伏筆（LAB_LETTER 的備註）*/
  { id:'ev_ziqing_lab_letter', title:'實驗室的信', participants:['heroine_04'], location:'wancai', trigger:'club', term:['Y2S1'], weeks:[3], once:true, background:'blur',
    prereq:{stage:{npc:'heroine_04',min:'FAMILIAR'}},
    dialogue:[ {speaker:'heroine_04',expression:'neutral',text:'（把手機蓋在桌上）教授寄信。叫我進他的實驗室。'},
      {speaker:'heroine_04',expression:'neutral',text:'說我是系上十年來最適合做 AI 的人。'},
      {speaker:'heroine_04',expression:'thinking',text:'（手機又震了）……然後我爸打來。教授是他的高中同學。'},
      {speaker:'heroine_04',expression:'thinking',text:'所以我不知道，教授是覺得我很強，還是我爸叫他寫的。'},
      {speaker:'heroine_04',expression:'neutral',text:'好，這題我不會。你是法律系的，你幫我判。'},
      /* BB_189 1-1（AA_554 核過；AA_230 Q-13 保留）：和她交往中，第五句之後多一句；三個選項的回應換；「接妳爸的電話。」當晚 23:10 手機三則（src/aa554_3d.js，ZQ_LAB_DH_DAY）*/
      {if:DH('heroine_04'),speaker:'heroine_04',expression:'thinking',text:'欸不是，你是我男朋友，你會偏心。……算了，你判。'},
      {choice:[{text:'「妳想進實驗室嗎？」',goto:'a'},{text:'「不管是哪一個，妳都很強。」',goto:'b'},{text:'「接妳爸的電話。」',goto:'c'}]},
      {label:'a'},{speaker:'heroine_04',expression:'thinking',text:'……不想。'},{speaker:null,text:'她想了很久。'},{unless:DH('heroine_04'),speaker:'heroine_04',expression:'neutral',text:'可是不進去的話，我要怎麼回？他是我爸的同學欸。'},
        {if:DH('heroine_04'),speaker:'heroine_04',expression:'neutral',text:'但如果我不想的理由只是因為我爸，那我很蠢。'},{if:DH('heroine_04'),speaker:'heroine_04',expression:'annoyed',text:'……你不要說我不蠢。你一定會說。'},{mem:[{npc:'heroine_04',tag:'LAB_LETTER',note:'問她想不想進實驗室'}]},{goto:'end'},
      {label:'b'},{if:DH('heroine_04'),goto:'bD'},{speaker:null,text:'她沉默，然後很快地說：'},{speaker:'heroine_04',expression:'embarrassed',text:'好，C 和弦，你按給我看。'},{mem:[{npc:'heroine_04',tag:'LAB_LETTER',note:'說她不管怎樣都很強'}]},{goto:'end'},
      /* 「打完還是很強。」稿沒寫誰說：照 BB_187／BB_189 表格裡祐廷接話的寫法（例：Q8「可以。」）當作祐廷說的（已列給 AA）*/
      {label:'bD'},{speaker:'heroine_04',expression:'smile',text:'男朋友的稱讚要打七折。'},{speaker:'player',text:'打完還是很強。'},{speaker:null,text:'她沉默，然後很快地說：'},{speaker:'heroine_04',expression:'embarrassed',text:'好，C 和弦，你按給我看。'},{mem:[{npc:'heroine_04',tag:'LAB_LETTER',note:'說她不管怎樣都很強'}]},{goto:'end'},
      {label:'c'},{speaker:'heroine_04',expression:'annoyed',text:'不要。'},{speaker:null,text:'她把手機調成靜音。'},{unless:DH('heroine_04'),speaker:'heroine_04',expression:'neutral',text:'……改天講給你聽。'},
        {if:DH('heroine_04'),speaker:'heroine_04',expression:'neutral',text:'……今天晚上講給你聽。不是改天。'},{if:DH('heroine_04'),stamp:['ZQ_LAB_DH_DAY']},{mem:[{npc:'heroine_04',tag:'LAB_LETTER',note:'叫她接爸爸的電話'}]},{set:{LAB_LETTER_DAD:true}},
      {label:'end'} ] },
  /* 沛珊 P3 我要重考（BB_97 4-2，BB-B 定稿；CG BCG-16）：大二上第 5 週平日 12–13 下課時，霖澤館走廊（備案：校園的霖澤館前）、前置 P2 或 P2b、和她有點熟以上、只一次。
     她走過來（spawn）。開頭照 NOT_FOR_ME；有 SIS_ANSWERED_WHY 多一句；第三個選項不記標籤（MIRROR_PEISHAN 照 AA_901 第 10 項拿掉，CANON-NO-ECON-1112 第四批；AA_886 第 2 節：「要考的話，我陪妳念。」、她的回覆合成一版、不留約定）。三個選項都不改變她的決定 */
  /* P3「我要重考」只對交往中的玩家（AA_281 第 4 節 B-5，使用者 10-18：她什麼都不說；交往中的才知道）*/
  { id:'ev_peishan_decision', title:'我要重考', participants:['classmate_peishan'], location:['linze','campus'], trigger:'auto', term:['Y2S1'], weeks:[5], weekday:[1,2,3,4,5], time:[12,13], once:true, background:'blur',
    spawn:{npc:'classmate_peishan',dist:2.2},
    prereq:{stage:{npc:'classmate_peishan',min:'FAMILIAR'},flags:['dating_classmate_peishan'],custom:G=>{ const d=G.events&&G.events.done||{}; if(!(d.ev_peishan_doubt||d.ev_peishan_syllogism)) return false; if(G.zone==='linze') return true;
      const P=typeof GAME!=='undefined'&&GAME.E&&GAME.E.player&&GAME.E.player.obj?GAME.E.player.obj.position:null; return !!P&&Math.hypot(P.x-33,P.z+97)<25; }},   /* 校園：霖澤館前 25 m 內 */
    dialogue:[ {if:{memory:[{npc:'classmate_peishan',tag:'NOT_FOR_ME'}]},speaker:'classmate_peishan',expression:'neutral',text:'你記得我說過框的事嗎？……我想了一年。'},
      {unless:{memory:[{npc:'classmate_peishan',tag:'NOT_FOR_ME'}]},speaker:'classmate_peishan',expression:'neutral',text:'我想了很久，到底要不要繼續念法律。'},
      {if:{flags:['SIS_ANSWERED_WHY']},speaker:'classmate_peishan',expression:'neutral',text:'學姊那時候說她還在想。……我好像想好了。'},
      {cg:'cg_peishan_decision'},
      {speaker:'classmate_peishan',expression:'neutral',text:'我決定了。我要重考。去念教育。'},
      {speaker:'classmate_peishan',expression:'thinking',text:'……我還沒跟我爸媽說。'},
      {speaker:'classmate_peishan',expression:'neutral',text:'你覺得呢？'},
      {choice:[{text:'「妳想去就去。」',goto:'a'},{text:'「妳爸媽會怎麼想？」',goto:'b'},{text:'「要考的話，我陪妳念。」',goto:'c'}]},   /* AA_886 第 2 節（CANON-NO-ECON-1112 第四批）*/
      {label:'a'},{speaker:null,text:'她點頭。'},{speaker:'classmate_peishan',expression:'neutral',text:'嗯。考試這件事不難。'},{speaker:'classmate_peishan',expression:'thinking',text:'難的是回家，跟我爸媽講。'},{goto:'end'},   /* AA_428 §2 第 8 點：#a 現行版有後來的來源（AA_313 6-4 換掉 SC4 原句「難的是星期六回家，站在那張榜單前面。」）＝照現行；SC4 #23 的改稿「嗯。考試我不怕。」「我比較怕星期六回家要怎麼開口。」不換 */
      {label:'b'},{speaker:'classmate_peishan',expression:'neutral',text:'我爸會不講話。我媽會一直問我以後要做什麼。'},{speaker:'classmate_peishan',expression:'smile',text:'我會說我想當老師。她應該會再問三次。'},{goto:'end'},
      {label:'c'},{speaker:'classmate_peishan',expression:'neutral',text:'……你自己的書念完了嗎？'},{speaker:null,text:'（她笑了。）'},{speaker:'classmate_peishan',expression:'smile',text:'好。那你先把你的念完。'},
      {label:'end'} ],
    consequences:{flags:{PEISHAN_RETAKE:true},memo:'沛珊說她要重考，去念教育'} },
  /* 學姊 W7「妳自己相信這個題目嗎」（BB_97 2-2，BB-B 定稿；位置照 AA_146／AA_140 G08 統一在霖澤館）：大二上第 6～9 週平日 15–17，經過霖澤館（教授研究室走廊，2D「研究室門口」背景還沒有＝深色底）；
     和學姊有點熟以上、只一次。玩家在門外聽到；兩個選項都接「我要回總圖了。」；記 HEARD_PROF_XU（W8 讀它換一句，不是前置）*/
  { id:'ev_sis_prof_xu_door', retired:'BB_207 第 1 節＋AA_261 第 1 節（7b39f636／16919f86）：W7 綁推甄的研究計畫，推甄整段取消，作廢；定義留給已經演過的舊存檔', title:'妳自己相信這個題目嗎', participants:['heroine_05','prof_xu'], location:'linze', trigger:'auto', term:['Y2S1'], weeks:[6,7,8,9], weekday:[1,2,3,4,5], time:[15,17], once:true, background:'dark',
    prereq:{stage:{npc:'heroine_05',min:'FAMILIAR'}},
    dialogue:[ {scene:'法律系館A・研究室門口',bg:'prof_door'},
      {speaker:'prof_xu',expression:'serious',text:'書瑀，你的研究計畫寫得很完整。'},
      {speaker:'prof_xu',expression:'serious',text:'可是我讀不出來，你為什麼要做這個題目。'},
      {speaker:'prof_xu',expression:'serious',text:'……你自己相信這個題目嗎？'},
      {speaker:null,text:'（很久的沉默）'},
      {speaker:'heroine_05',expression:'serious',text:'重點是，這個題目推甄會過。'},
      {speaker:'prof_xu',expression:'serious',text:'那不是我問的問題。'},
      {speaker:null,text:'她走出研究室，看到門外的你。'},
      {speaker:'heroine_05',expression:'neutral',text:'……你聽到了。'},{speaker:'heroine_05',expression:'neutral',text:'沒事。我改一改就好。'},
      {choice:[{text:'（讓開）'},{text:'（陪她走到樓梯口）'}]},
      {speaker:'heroine_05',expression:'neutral',text:'我要回總圖了。'},
      {mem:[{npc:'heroine_05',tag:'HEARD_PROF_XU',note:'在研究室門外聽到許教授問她'}]} ] },
  /* 沛珊和柏翰分開了（BB_100 2-3，BB-B；交接包 v3 第 6 週）：P3 之後的那一週（大二上第 6 週）平日 12–13，霖澤館走廊（備案：霖澤館前 25 m）；只聽她說，沒有選項 */
  /* AA_374 第 18 項：合併進 ev_peishan_split（同一件事只演一次、台詞照那一件）——這一件不再演；id 留著（舊存檔 events.done 有它的：ev_peishan_split、ps_split_group、手機的「還好嗎」照舊認得）*/
  { id:'ev_peishan_bohan_split', title:'', participants:['classmate_peishan'], location:['linze','campus'], trigger:'auto', term:['Y2S1'], weeks:[6], weekday:[1,2,3,4,5], time:[12,13], once:true, background:'blur',
    spawn:{npc:'classmate_peishan',dist:2.2},
    prereq:{custom:()=>false},   /* 不用 retired：retired 會把舊存檔日誌裡這一件的備註藏起來（events3d.js）*/
    dialogue:[ {speaker:'classmate_peishan',expression:'neutral',text:'柏翰說他不懂。……他沒有錯。我們想要的東西不一樣。'},
      {speaker:'classmate_peishan',expression:'neutral',text:'我們上週分開了。我自己說的。'} ],
    consequences:{flags:{PEISHAN_BOHAN_SPLIT:true},memo:'沛珊說她和柏翰分開了'} },
  /* 柏翰 翰 2 考古題小組（AA_40 翰 2；時間地點照 AA_177 第 5 節）：大二上第 7 週平日 18～21，總圖三樓（閱覽區，他的作息），翰 1 演過、跟他有點熟以上的玩家走到他旁邊（AA_546 1-3：拿掉「只有分數比他高的才邀」）。
     選「好。」＝小組每週六 16:00～18:00，總圖 B1 討論室（出發選單，story3d.js 'bohan_group_<day>'）；第三次的旁白「你第一次在意一個數字。」。沒被邀請的：第 7～8 週第一次在麵店，阿哲一句（ev_bohan_group_heard）*/
  { id:'ev_bohan_exam_group', title:'考古題小組', participants:['classmate_bohan'], location:'library', trigger:'auto', term:['Y2S1'], weeks:[7], weekday:[1,2,3,4,5], time:[18,21], once:true, background:'blur', near:{npc:'classmate_bohan',r:3},
    prereq:{stage:{npc:'classmate_bohan',min:'FAMILIAR'},custom:G=>!!(G.events&&G.events.done&&G.events.done.ev_bohan_score)},
    dialogue:[ {speaker:null,text:'（他收書出來，在總圖門口叫住你。）',libOut:true},   /* libOut（AA_595 1-B11；AA 11-02 22:30 定稿）*/
      {speaker:'classmate_bohan',expression:'neutral',text:'我在組一個考古題小組。每週寫一份，寫完互相看怎麼寫。'},
      {speaker:'classmate_bohan',expression:'neutral',text:'以安說不要。她說她週四有讀書會。'},
      {speaker:'classmate_bohan',expression:'neutral',text:'你要不要來？'},
      {choice:[{text:'「好。」',set:{BOHAN_GROUP:'yes'},goto:'y'},{text:'「不了。」',set:{BOHAN_GROUP:'no'},goto:'n'},{text:'「我寫得很慢，可以嗎？」',set:{BOHAN_GROUP:'slow'},goto:'q'}]},
      {label:'y'},{speaker:null,text:'小組每週六下午，總圖 B1 的討論室。寫完，一個人講一題。'},{goto:'end'},
      {label:'n'},{speaker:'classmate_bohan',expression:'neutral',text:'好。想來再跟我說。'},{goto:'end'},
      {label:'q'},{speaker:null,text:'他愣了一下。'},{speaker:'classmate_bohan',expression:'neutral',text:'……我也是。所以才組的。'},{mem:[{npc:'classmate_bohan',tag:'ASKED_SLOW',note:''}]},
      {label:'end'} ],
    after:G=>{ if(G.flags.BOHAN_GROUP==='yes'||G.flags.BOHAN_GROUP==='slow') G.flags.BOHAN_GROUP_DAY=G.day; } },   /* 「我寫得很慢，可以嗎？」也算加入（AA_546 1-3，企劃線 84b6c298f）*/
  { id:'ev_bohan_group_session', title:'考古題小組', participants:[], location:'any', trigger:'outing', background:'dark', hours:2,
    dialogue:[ {scene:'總圖 B1・討論室',bg:'library_b1'},
      {if:{custom:G=>!(G.flags.BOHAN_GROUP_N|0)},speaker:null,text:'（四個人，一張考古題。柏翰按下手機的計時器。）'},   /* AB65-3（AA_211 附錄 A 第 3 節第 7 點）：第一次補一句旁白 */
      {if:{custom:G=>(G.flags.BOHAN_GROUP_N|0)===2},speaker:null,text:'（寫完，柏翰把每個人的寫法抄在白板上。同一題有四種寫法，都說得通。）'} ],   /* AA_546 1-3 */
    after:G=>{ G.flags.BOHAN_GROUP_N=(G.flags.BOHAN_GROUP_N|0)+1; } },
  { id:'ev_bohan_group_heard', title:'', participants:['zhe'], location:'noodle', trigger:'auto', term:['Y2S1'], weeks:[7,8], once:true, background:'blur', near:{npc:'zhe',r:4}, npcZone:'zhe',   /* AA_684 第 4 項：阿哲照作息在燒臘店（npcZone；週二、四 18:00～19:30）*/
    prereq:{custom:G=>G.flags.BOHAN_GROUP!=='yes'&&G.flags.BOHAN_GROUP!=='slow'},   /* 沒去的玩家（AA_546 1-3；slow 算加入，84b6c298f）*/
    dialogue:[ {speaker:'zhe',expression:'neutral',text:'柏翰組了一個考古題小組。我去了一次。……他講第三題講了四十分鐘。'} ] },
  /* 以安新 8 讀書會的規則太多（交接包 v3 3b，AA；後半照 AA_140 G13、AA_177 撞期 #2）：大二上第 7 週週四 20:00 的公法讀書會（萬才館研討室，classes3d.js clubEvent 先演這件），加入過的玩家在場（PUBLIC_LAW_GROUP）。
     沒加入的、在桌遊團：Alison 在群組傳撕掉一半的規則＋以安一句（記「聽說」）。後半：同一週週六 14:00 期中前的補讀（以安在群組約、出發選單）＝人回來了（CG-2，檔案還沒有）；記 PLG_RULES。
     沒去後半、在群組的玩家看 Alison 傳的照片（CG-2b：Alison 在群組傳的照片＋三則，src/y2r2_3d.js，AA_343 E2；AA_355 第 3 節）*/
  { id:'ev_plg_rules', title:'讀書會的規則太多', participants:['heroine_01'], location:'wancai', trigger:'club', term:['Y2S1'], weeks:[7], weekday:[4], once:true, background:'blur',
    dialogue:[ {speaker:null,text:'研討室的白板旁邊貼著一張 A4：〈公法讀書會規則〉，十二條。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('yu',G)},speaker:'yu',text:'三週前十個人，今天三個。'},
      {speaker:'heroine_01',expression:'neutral',text:'規則是為了讓大家講得完。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('yu',G)},speaker:'yu',text:'（把下半張撕下來）那就留講得完的那一半。'},
      {choice:[{text:'「留三條就好。」',goto:'a'},{text:'「十二條都有理由，可是沒人記得住。」',goto:'b'},{text:'「我覺得十二條很好。」',goto:'c'}]},
      {label:'a'},{speaker:null,text:'以安想了一下，在白板寫：「一、每人十分鐘。二、離題可以，要拉回來。三、不准賴。」'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('yu',G)},speaker:'yu',text:'第三條一定要留嗎？'},{speaker:'heroine_01',expression:'neutral',text:'一定。'},{goto:'end'},
      {label:'b'},{speaker:'heroine_01',expression:'thinking',text:'好啦，我自己也記不住十二條。'},{speaker:null,text:'她寫下同樣的三條。'},{goto:'end'},
      {label:'c'},{if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('yu',G)},speaker:'yu',text:'你是她那邊的？'},{speaker:'heroine_01',expression:'smile',text:'（嘴角動了一下）謝謝。……可是人都走了。'},{speaker:null,text:'她還是重寫成三條。'},
      {label:'end'} ],
    consequences:{flags:{PLG_RULES_SEEN:true},memo:'以安的讀書會規則從十二條變三條'} },
  { id:'ev_plg_rules_after', title:'人回來了', participants:['heroine_01'], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
    dialogue:[ {scene:'法律系館B・研討室',bg:'wancai_seminar'},
      {speaker:null,text:'人回來了。八個人。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('classmate_bohan',G)},speaker:null,text:'柏翰也來了，攤開一本貼滿便利貼的書。'},
      {cg:'cg_plg_rules'},
      {speaker:'heroine_01',expression:'neutral',text:'（回頭看長桌，白板上三行字）好。開始。每人十分鐘。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('yu',G)},speaker:'yu',text:'（舉著撕下來的半張紙）這張我要裱框。'} ],
    consequences:{flags:{PLG_RULES:true},memo:'公法讀書會的週六補讀：人回來了'} },
  /* 颱風假 T2（BB_110，法律系大二上第 7 週週一 2026-10-19；calendar.js TYPHOON）：前一晚 20:30 新聞（story3d.js phoneRules，照大一的做法）。
     T2b 照常上課的喜劇（行政法）：當天早上九點線上會議的通知——9:00～12:00 人醒著時演（在哪裡都可以，手機＋線上）；三個選項；進去聽＝許教授 XU_TYPHOON（兩週內的行政法課前一句，ev_y2_xu_typhoon_front）。
     T2a 泡麵之夜（第二個房間）：當天 21:00 以後人在宿舍房間（宿舍之間的訪客規定需查證，BB 寫「不行的話改在交誼廳」，先照房間）；阿凱的訊息、祐廷的回覆照 BB 的稿；三個選項（拍照傳給方奕廷要認識他）。
     2026-10-28 AA_519 第 9 節第 1 點（企劃線 169130daf）：這一場阿凱帶的換成一袋滷味——標題「滷味之夜」、訊息、遞毛巾那一句、方奕廷的照片、記憶簿一起換；最後一句旁白「各分到一包」子代理照同樣的意思改「各分到一些」（一袋滷味分不出包）；
     開頭「阿哲已經在煮第二包了」是阿哲自己的（AA_313 5-3），照留 */
  { id:'ev_y2_typhoon_xu', title:'照常上課的喜劇', participants:['prof_xu'], location:'any', trigger:'auto', term:['Y2S1'], time:[9,12], once:true, background:'dark',
    prereq:{custom:G=>typeof STORY!=='undefined'&&G.day===STORY.dayOfKey('2026-10-19')&&(G.stage||'law')==='law'},
    dialogue:[ {scene:'視訊',bg:'video'},
      {speaker:null,text:'（早上九點，線上會議的通知）'},
      {speaker:'prof_xu',expression:'serious',text:'今天停課，所以這不是上課。'},
      {speaker:'prof_xu',expression:'serious',text:'這是自願的討論。德國的颱風比較少，我們比較一下。'},
      {speaker:null,text:'（畫面上：許教授、穿著襯衫的柏翰、芯慈。）'},
      {choice:[{text:'（進去聽）',goto:'a'},{text:'（不進去，繼續睡）',goto:'b'},{text:'（私訊柏翰「你為什麼穿襯衫」）',goto:'c'}]},
      {label:'a'},{speaker:'prof_xu',expression:'serious',text:'很好。你對德國的颱風有興趣嗎？'},{speaker:'player',text:'德國有颱風嗎？'},{speaker:'prof_xu',expression:'serious',text:'沒有。這就是重點。'},
      {mem:[{npc:'prof_xu',tag:'XU_TYPHOON',note:''}]},{goto:'end'},
      {label:'b'},{phone:'classmate_bohan',text:'教授點名了，我說你可能在睡覺。'},{goto:'end'},
      {label:'c'},{phoneMe:'classmate_bohan',text:'你為什麼穿襯衫'},{phone:'classmate_bohan',text:'因為是上課。'},{phoneMe:'classmate_bohan',text:'教授說不是上課。'},{phone:'classmate_bohan',text:'他也穿襯衫。'},
      {label:'end'} ] },
  { id:'ev_y2_xu_typhoon_front', title:'', participants:['prof_xu'], location:'any', trigger:'class', beforeClass:'admin_law', term:['Y2S1'], once:true, background:'blur',
    prereq:{memory:[{npc:'prof_xu',tag:'XU_TYPHOON'}],custom:G=>typeof STORY!=='undefined'&&G.day>=STORY.dayOfKey('2026-11-09')&&G.day<=STORY.dayOfKey('2026-11-15')},   /* AA_374 第 13 項：期中考後第一堂（11/2 期中考；第 10 週 11/9 那一堂）；原本 10/20～11/2，只會在期中考那天出 */
    dialogue:[ {speaker:'prof_xu',expression:'serious',text:'颱風那天來討論的同學，今天坐前面。'} ] },
  { id:'ev_y2_typhoon_kai', title:'滷味之夜', participants:['kai'], location:'dorm', trigger:'auto', term:['Y2S1'], time:[21,24], once:true, background:'blur',   /* AA_519 第 9 節第 1 點：標題「泡麵之夜」→「滷味之夜」（id 不改：舊存檔的 events.done）*/
    prereq:{custom:G=>typeof STORY!=='undefined'&&G.day===STORY.dayOfKey('2026-10-19')&&!!G.flags.ROOM_Y2},
    dialogue:[ {speaker:null,text:'（柏翰在讀許教授的講義。阿哲已經在煮第二包了。）'},   /* AA_313 5-3：大二阿哲、柏翰是 312 的室友，颱風天也在房間 */
      {phone:'kai',text:'我要過去'},{phoneMe:'kai',text:'外面在下雨'},
      {phone:'kai',text:'下雨又怎樣 滷味我都買了'},   /* AA_519 第 9 節第 1 點（原本「下雨又怎樣 泡麵我都買了」）*/
      {phone:'kai',text:'就當這週的宵夜提早'},{phoneMe:'kai',text:'今天是週一'},{phone:'kai',text:'所以咧 颱風天誰管星期幾'},
      {advance:1/3},{speaker:null,text:'（二十分鐘後，阿凱全身濕，站在門口，手上這次是一袋滷味。）'},   /* AA_519 5-3：颱風夜不要三年同一個畫面（大一照原句；大三 r2y3a_events.js 是兩杯熱豆漿）*/
      {choice:[{text:'（遞毛巾）',goto:'a'},{text:'「你可以傳訊息就好。」',goto:'b'},{text:'（拍照傳給方奕廷）',if:{custom:G=>typeof STORY!=='undefined'&&STORY.knows('npc_fangyt',G)},goto:'c'}]},
      {label:'a'},{speaker:'kai',text:'先擦頭啦，滷味又不會跑。'},{goto:'end'},   /* AA_519 第 9 節第 1 點（原本「先擦箱子啦，泡麵濕掉就完了。」）*/
      {label:'b'},{speaker:'kai',text:'傳訊息你又不會下來。'},{goto:'end'},
      {label:'c'},{phoneMe:'npc_fangyt',text:'📷（全身濕的阿凱，手上一袋滷味）'},   /* AA_519 第 9 節第 1 點：方奕廷的照片（原本「抱著一箱泡麵」）*/
      {phone:'npc_fangyt',text:'他真的出門了？'},{phone:'npc_fangyt',text:'颱風天欸'},
      {label:'end'},{speaker:null,text:'（阿哲和柏翰也各分到一些。學弟說他不吃辣。）'} ],   /* AB65-3（AA_211 第 2 節【室友】）；AA_519 第 9 節第 1 點「其他泡麵照同樣的意思改」：原本「各分到一包」，一袋滷味分不出包＝子代理改「各分到一些」 */
    consequences:{flags:{TYPHOON_Y2_KAI:true},memo:'颱風假，阿凱帶了一袋滷味來'} },   /* AA_519 第 9 節第 1 點：記憶簿（原本「颱風假，阿凱抱著一箱泡麵來」）*/
  /* 阿凱 K3 的週日宵夜（BB_97 4-1 場面，BB-B 2026-10-16）：宿舍旁的滷味攤（晚上、騎樓下、折疊桌；背景和公館滷味攤共用、字幕換掉）。
     第一次＝夾好的三樣＋三個選項＋「下週日一樣喔。」（AA_428 §2 第 8 點）；第二次以後＝一句旁白＋阿凱輪流一句（筆電那句只在大二上第 13 週 F2 之後）；時間快轉到 00:00。
     story3d.js 的 phoneRules 'kai_sup_<day>' 出發選單。記 habit kai_supper，365 天內 3 次以上＝阿凱 SUNDAY_SUPPER */
  { id:'ev_kai_sunday_supper', title:'週日宵夜', participants:['kai'], location:'any', trigger:'outing', background:'dark', hours:0.5,
    dialogue:[ {scene:'宿舍旁的滷味攤',bg:'gongguan_luwei'},
      {if:{custom:G=>!(G.flags.KAI_SUP_N>0)},goto:'first'},
      {speaker:null,text:'（週日晚上，滷味攤。阿凱的籃子永遠比你的滿。）'},
      {pick:{flag:'KAI_SUP_LINE',from:G=>{ const tid=typeof STORY!=='undefined'&&STORY.termAt?STORY.termAt(G.day):((typeof CALENDAR!=='undefined'&&CALENDAR.termOf(G.day))||{}).id, y2s1=tid==='Y2S1'||!tid;   /* AA_519 5-2（企劃線 d75cd0228）：大二上（含寒假）照舊三句輪，「新室友」那句只出一次、第二次起換「我說話很多，他說還好。」；大二下起換成三句新的輪 */
        const L=y2s1?['今天我多夾了一顆貢丸。',G.flags.KAI_SUP_ROOMIE!=null?'我說話很多，他說還好。':'新室友說我話很多。……真的很多嗎？','這週你們考什麼？……算了，先吃。']:['新室友說我話很多。……他現在也話很多了。','今天的貢丸我數了，比上次少一顆。','下學期我要投實習。……你們法律系的，實習要穿西裝嗎？'];
        const t=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null, f2=t&&(t.id!=='Y2S1'||t.week>=13); if(y2s1&&f2&&G.flags.KAI_F2==='went') L.push('（打開筆電）你看，我的作業會頂嘴了。');   /* AA_328：只給 F2 去過的玩家（大二上；大二下起換成那三句，作業頂嘴的事在資工系館前 AA_519 5-1）*/ const n=(G.flags.KAI_SUP_N|0)-1, s=L[((n%L.length)+L.length)%L.length]; if(s==='新室友說我話很多。……真的很多嗎？') G.flags.KAI_SUP_ROOMIE=G.day; return [s]; }}},
      {speaker:'kai',text:'{flag:KAI_SUP_LINE}'},{goto:'end'},
      {label:'first'},{speaker:null,text:'（週日晚上十一點，宿舍旁的滷味攤。阿凱已經夾好兩籃。）'},
      {speaker:'kai',text:'你的我幫你夾了。豆干、海帶、王子麵。'},{speaker:'kai',text:'你大一每次都點這三樣，對吧？'},
      {choice:[{text:'「你新室友怎麼樣？」',goto:'a'},{text:'「今天的滷味好吃嗎？」',goto:'b'},{text:'（先吃）',goto:'c'}]},
      {label:'a'},{speaker:'kai',text:'十點就睡。'},{speaker:'kai',text:'……我還不習慣有人那麼早關燈。'},{goto:'f_end'},
      {label:'b'},{speaker:'kai',text:'普通啦。'},{speaker:null,text:'（他又從你籃子夾走一塊豆干）'},{goto:'f_end'},
      {label:'c'},{speaker:null,text:'（他講了二十分鐘新室友的鬧鐘。你一句都沒插話，他好像很滿意。）'},
      {label:'f_end'},{speaker:'kai',text:'下週日一樣喔。'},   /* AA_428 §2 第 8 點：收尾照 BB_167 SC4 #13（原本 AA_335 T3「下週日，同一時間。我先去排。」）*/
      {label:'end'},{advance:G=>Math.max(0,24-G.hour)} ],
    after:(G,GM)=>{ const F=G.flags; F.KAI_SUP_N=(F.KAI_SUP_N|0)+1; F.KAI_SUP_LAST=G.day-(G.hour<1?1:0); if(typeof EVENTS!=='undefined'&&EVENTS.habit) EVENTS.habit('kai_supper');
      if(typeof SOCIAL!=='undefined'&&!SOCIAL.has('kai','SUNDAY_SUPPER')&&typeof EVENTS!=='undefined'&&EVENTS.habitCount&&EVENTS.habitCount({key:'kai_supper',withinDays:365})>=3) SOCIAL.remember('kai','SUNDAY_SUPPER','大二的週日宵夜'); } },
  /* D4 語彤事件 7 法服的第一次值班（AA_11 事件 7；AA_177 第 2 節、4-6）：大二上第 3 週週六 9/26 9:00～12:00 萬才館一樓的法服民眾服務。玩家在場（走到圓桌旁）才看得到。
     流程第 2、3 點用 AA 的字當旁白；記 YT_DUTY_SEEN、語彤 SHARED_CLASS（法服）。不在場的玩家：ev_y2_yt_duty_heard */
  { id:'ev_y2_yt_duty', retired:'AA_325 2-Y2-01（AA_11 舊事件 7 已刪、AA_255 第 4 節第 2 點）：換成大二第一次值班之後的麵店閒聊 ev_yt_shift_chat（src/y2r2_3d.js）', title:'法服的第一次值班', participants:['heroine_03'], location:'wancai', trigger:'auto', term:['Y2S1'], time:[9,12], once:true, background:'blur', near:{x:0.5,z:2.2,r:4.5},
    prereq:{custom:G=>typeof STORY!=='undefined'&&!!STORY.ytFafu&&STORY.ytFafu(G)&&G.day===STORY.dayOfKey('2026-09-26')&&!(typeof GAME!=='undefined'&&GAME.E&&GAME.E.player&&(GAME.E.player.lv|0)!==0)},   /* 一樓（二樓迴廊往下看不算）*/
    dialogue:[ {speaker:'heroine_05',text:'這位是社會系的語彤，她會幫我們做初談。'},
      {speaker:null,text:'一位阿伯來諮詢，講了十分鐘還講不到重點；法律系的人都在翻六法。'},
      {speaker:'阿伯',text:'我就是要問那個……那個房子……我兒子……'},
      {speaker:null,text:'語彤倒了一杯水，只問了一個問題。'},
      {speaker:'heroine_03',expression:'neutral',text:'阿伯，你今天來，是擔心你兒子，還是擔心房子？'},
      {speaker:'阿伯',text:'（停很久，笑了）……我兒子啦。房子是藉口。'},
      {speaker:'heroine_05',text:'（散會後）妳剛剛那一句，我們法律系的人學三年都問不出來。'},
      {speaker:'heroine_03',expression:'neutral',text:'嗯。我只是常在麵店聽人講話。'},
      {choice:[{text:'「妳怎麼知道要問那個？」',goto:'a'},{text:'「妳應該轉法律系。」',goto:'b'}]},
      {label:'a'},{speaker:'heroine_03',expression:'thinking',text:'他一直在看門口。他兒子在外面等他。'},{goto:'end'},
      {label:'b'},{speaker:'heroine_03',expression:'smile',text:'不要。你們都在翻書，沒有人在看他。'},
      {label:'end'},{mem:[{npc:'heroine_03',tag:'SHARED_CLASS',note:'法服的第一次值班'}]} ],
    consequences:{flags:{YT_DUTY_SEEN:true,YT_LEGALAID_Y2:true},memo:'語彤第一次在法服值班'} },
  /* 不在場、和語彤「有點熟」以上（AA_177 4-6）：大二上第 4 週第一次在麵店遇到她（她的班），她轉述兩句（AA_160 R4，記 heard＝YT_DUTY_HEARD）*/
  { id:'ev_y2_yt_duty_heard', retired:'AA_325 2-Y2-01：YT_DUTY_HEARD 改由 ev_yt_shift_chat 記', title:'', participants:['heroine_03'], location:'noodle', trigger:'auto', term:['Y2S1'], weeks:[4], once:true, background:'blur', near:{npc:'heroine_03',r:4},
    prereq:{stage:{npc:'heroine_03',min:'FAMILIAR'},custom:G=>!G.flags.YT_DUTY_SEEN&&typeof STORY!=='undefined'&&!!STORY.ytFafu&&STORY.ytFafu(G)},   /* 語彤不在法服（AA_255）：不播 */
    dialogue:[ {speaker:'heroine_03',expression:'neutral',text:'上週六第一次值班。有一個阿伯，講了十分鐘才講到他兒子。'},
      {speaker:'heroine_03',expression:'neutral',text:'……我只問了一句。'} ],
    consequences:{flags:{YT_DUTY_HEARD:true},memo:'聽語彤說了她第一次在法服值班'} },
  /* ===== 杜可昕在法律系：怎麼認識、大一上她自己的四拍（CANON-1112；企劃線 AA_856 第三版 @077a6e501d 定稿）=====
     字逐字照稿（對稿：tests/canon_opening_1112_unit.js）；第 2 節的場面照稿的台詞格式。四拍：CANON-NO-ECON-1112 第四批起照 AA_895 第 3 節（企劃線 a425c0dcb，定稿 BB_430）的台詞版
       （取代 AA_856 第 3 節表格「內容」欄的敘述句）；「男同學」「那個同學」不是人物，沒有名字、立繪（compact）。
     · ev_kx_meet_class：開學後祐廷有去上的第一堂必修開頭（classes3d.js CLS.attend → STORY.kxClassMeet）。那一堂就是這學期第一堂必修＝老師開場那一版；
       前面的必修沒去（或被別的戲佔了）＝順延到下一次有去上的必修、坐下以後老師還沒來那一版（KX_MEET_LATER）。trigger 'class'、沒有 beforeClass／afterClass＝只由 STORY.kxClassMeet 演。
     · ev_kx_meet_hall：保底——大一上第 5 週起還沒認識，第一次走進法律系館A 一樓。
     兩場的最後互加手機＝KX_MET（＋KX_MET_DAY、KX_MET_HOW）＋聯絡方式；在這以前她不在手機、朋友清單、動態牆，也不在場景裡（story3d.js S.kxKnown）。
     · ev_kx_first_out：稿「之後第一次在教室外面遇到」那一句（課堂版認識的才有「會講話的」）——認識以後的另一天早上第一次走進法律系館A 一樓。
     · 四拍：ev_kx_dress（第 3 週早上必修課前，KX_DRESS）、ev_kx_hand_in＋ev_kx_hand（第 6 週必修：課堂中＋下課，KX_HAND）、ev_kx_angry（第 10 週法律系館A 一樓，KX_ANGRY_SEEN／KX_STAYED）、
       ev_kx_y1s1_end（期末最後一科考完那天，男生宿舍門口那一帶，KX_Y1S1_END）。都要 KX_MET。
     · ③b ev_kx_angry_sorry（AA_895 第 3 節 ③b）：看過 ③ 的玩家，③ 的隔天起第一堂早上的必修課前，那個同學在教室門口道歉（KX_ANGRY_SORRY）。
     ④ 大一下開學第一週兌現的那一盒餅（KX_SOUVENIR）：AA_882 給的那兩列（長頸鹿鑰匙圈）接在 ev_kx_souvenir。 */
  { id:'ev_kx_meet_class', title:'', participants:['kexin'], location:'any', trigger:'class', once:true, background:'blur',
    dialogue:[
      {unless:{flags:['KX_MEET_LATER']},speaker:null,text:'（老師說：先跟前後左右的同學認識一下，兩分鐘。教室一下子吵起來。）'},
      {unless:{flags:['KX_MEET_LATER']},speaker:null,text:'（坐你前面的女生沒有馬上轉頭。她把筆蓋蓋好，才轉過來。）'},
      {if:{flags:['KX_MEET_LATER']},speaker:null,text:'（老師還沒來。坐你前面的女生轉過來。）'},
      {speaker:'kexin',text:'我先講，我很不會這種。你會講話吧？'},
      {choice:[{text:'「會。」',goto:'a'},{text:'「看跟誰。」',goto:'b'}]},
      {label:'a'},{speaker:'kexin',text:'好。那你先講，我聽。'},{speaker:null,text:'（你一時不知道要講什麼。）'},{speaker:'kexin',text:'（她笑了。）算了，這樣就算。我杜可昕，高雄來的。你呢？'},
      {speaker:null,text:'（兩分鐘到了。她把手機遞過來。）'},{speaker:'kexin',text:'加一下。以後老師問問題沒人回，我會轉頭看你。'},{goto:'met'},
      {label:'b'},{speaker:'kexin',text:'（她看了你兩秒。）這個回答我喜歡。'},{speaker:'kexin',text:'我杜可昕，高雄來的。你呢？'},
      {speaker:null,text:'（兩分鐘到了。她把手機遞過來。）'},{speaker:'kexin',text:'加一下。我在臺北還沒幾個認識的人，你算一個。'},
      {label:'met'} ],
    consequences:{contact:'kexin'}, after:G=>{ G.flags.KX_MET=true; G.flags.KX_MET_HOW='class'; G.flags.KX_MET_DAY=G.day; } },   /* 先加聯絡方式（手機那一句「加了…的聯絡方式」、G.contacts 記今天）、再記 KX_MET */
  { id:'ev_kx_meet_hall', title:'', participants:['kexin'], location:'linze', trigger:'enter', once:true, background:'blur',
    prereq:{custom:G=>typeof STORY!=='undefined'&&!!STORY.kxMeetOpen&&STORY.kxMeetOpen(G)&&!!STORY.termDay&&G.day>=STORY.termDay('Y1S1',5,1)},
    dialogue:[
      {speaker:null,text:'（有人從後面叫你。是班上坐前排的那個女生，你沒跟她講過話。）'},
      {speaker:'kexin',text:'欸，你是我們班的吧。你都坐很後面。'},
      {speaker:'kexin',text:'我杜可昕。班上的人我差不多都認得了，就差你。手機，加一下。'},
      ],
    consequences:{contact:'kexin'}, after:G=>{ G.flags.KX_MET=true; G.flags.KX_MET_HOW='hall'; G.flags.KX_MET_DAY=G.day; } },
  { id:'ev_kx_first_out', title:'', participants:['kexin'], location:'linze', trigger:'enter', time:[7,11], once:true, background:'blur',
    prereq:{flags:['KX_MET'],flagIs:{KX_MET_HOW:'class'},custom:G=>typeof G.flags.KX_MET_DAY==='number'&&G.day>G.flags.KX_MET_DAY&&typeof STORY!=='undefined'&&!!STORY.presence&&STORY.presence('kexin',G).here},
    dialogue:[ {speaker:'kexin',text:'欸，會講話的。（她指了一下你。）你早餐吃了沒？我要去買，順便。'} ] },
  { id:'ev_kx_dress', title:'', participants:['kexin'], location:'any', trigger:'class', term:['Y1S1'], weeks:[3], once:true, background:'blur',
    beforeClass:function(it){ return !!(it&&it.c&&it.c.kind==='required'&&!it.c.retake&&!it.exam&&it.t0<12); },   /* 排在清單最後面：同一堂課前有別的人物事件就先演別的（CLS.beforeClassPick 挑第一個），這一拍等第 3 週下一堂早上的必修 */
    prereq:{flags:['KX_MET']},
    dialogue:[
      {speaker:null,text:'（全班都剛睡醒的樣子，只有她從頭髮到鞋子都是整理過的。）'},
      {speaker:'男同學',text:'妳上課也穿這樣喔。'},
      {speaker:'kexin',text:'我穿給我自己看的。你也可以試試看。'},
      {speaker:null,text:'（她坐下以後，轉過來小聲說。）'},
      {speaker:'kexin',text:'我六點半就起來了。很累。可是不這樣我一整天都不對。'},
      {set:{KX_DRESS:true}} ] },
  { id:'ev_kx_hand_in', title:'', participants:[], noMeet:['kexin'], location:'any', trigger:'class', background:'blur',   /* 課堂中那一半：STORY.kxHandIn 用 EVENTS.runLines 演（classes3d.js CLS.IN_CLASS）*/
    dialogue:[
      {speaker:null,text:'（老師問了一個問題，全班沒有人出聲。）'},
      {speaker:null,text:'（她舉手，答了。答到一半，老師追問了一句。她停了一下。）'},
      {speaker:'kexin',text:'這個我不確定。我回去查。'} ] },
  { id:'ev_kx_hand', title:'', participants:['kexin'], location:'any', trigger:'class', term:['Y1S1'], once:true, classFirst:true, background:'blur',   /* classFirst：接著課堂中那一半（同一堂下課）*/
    afterClass:function(it){ return !!(it&&it.c&&it.c.kind==='required'&&!it.c.retake&&!it.exam); },
    prereq:{flags:['KX_MET'],custom:G=>G.flags.KX_HAND_DAY===G.day&&!G.flags.KX_HAND},
    dialogue:[
      {speaker:null,text:'（下課，她轉過來。）'},
      {speaker:'kexin',text:'我剛剛是不是很丟臉？'},
      {choice:[{text:'「不會。全班只有妳敢答。」',goto:'a'},{text:'「有一點。」',goto:'b'}]},
      {label:'a'},{speaker:'kexin',text:'那下次你也舉手。不要每次都我。'},{goto:'z'},
      {label:'b'},{speaker:'kexin',text:'（她瞪你）你可以不要這麼誠實。……好啦，謝謝。'},
      {label:'z'},{set:{KX_HAND:true}} ] },
  { id:'ev_kx_angry', title:'', participants:['kexin'], location:'linze', trigger:'enter', term:['Y1S1'], weeks:[10], once:true, background:'blur',
    prereq:{flags:['KX_MET'],custom:G=>typeof STORY!=='undefined'&&!!STORY.presence&&STORY.presence('kexin',G).here},
    dialogue:[
      {speaker:null,text:'（這週的共筆輪到班上一個同學，他昨天晚上才在群組說沒整理。）'},
      {speaker:'kexin',text:'你昨天晚上才講。明天要考的東西，誰整理？'},
      {speaker:'那個同學',text:'……我這週真的很忙。'},
      {speaker:'kexin',text:'大家都很忙。這一週我自己整理，下一週你補兩週。'},
      {speaker:null,text:'（那個同學走了。她還站在原地，把手機上的檔案打開又關上。）'},
      {choice:[{text:'陪她整理到閉館',set:{KX_STAYED:true},goto:'stay'},{text:'去買飲料給她',goto:'z'},{text:'不插手',goto:'z'}]},
      {label:'stay'},{speaker:'kexin',text:'我剛剛很兇。我知道。……可是我沒有講錯。'},
      {label:'z'},{set:{KX_ANGRY_SEEN:true}} ],
    consequences:{stamp:['KX_ANGRY_DAY']} },
  { id:'ev_kx_angry_sorry', title:'', participants:['kexin'], location:'any', trigger:'class', term:['Y1S1'], once:true, background:'blur',   /* AA_895 第 3 節 ③b：③ 的隔天起第一堂早上的必修課前（只有看過 ③ 的玩家）*/
    beforeClass:function(it){ return !!(it&&it.c&&it.c.kind==='required'&&!it.c.retake&&!it.exam&&it.t0<12); },
    prereq:{flags:['KX_MET','KX_ANGRY_SEEN'],custom:G=>typeof G.flags.KX_ANGRY_DAY==='number'&&G.day>G.flags.KX_ANGRY_DAY},
    dialogue:[
      {speaker:null,text:'（隔天早上，那個同學在教室門口等她。）'},
      {speaker:'那個同學',text:'昨天的事，對不起。'},
      {speaker:'kexin',text:'好。'},
      {speaker:null,text:'（她沒有看他，直接進教室了。）'},
      {speaker:null,text:'（坐下以前，她在班群把下週的共筆標給他，後面多打了一句：「有問題問我。」）'},
      {set:{KX_ANGRY_SORRY:true}} ] },
  { id:'ev_kx_y1s1_end', title:'', participants:['kexin'], location:'campus', trigger:'auto', near:{x:20,z:57,r:9}, term:['Y1S1'], once:true, background:'blur',
    prereq:{flags:['KX_MET'],custom:G=>{ if(typeof CALENDAR==='undefined'||typeof CLS==='undefined'||!CLS.lastExamEnd) return false; const t=CALENDAR.termOf(G.day); if(!t||t.id!=='Y1S1'||t.exam!=='final') return false;
      if(!KX_END_C||KX_END_C.g!==G) KX_END_C={g:G,v:CLS.lastExamEnd(G,'Y1S1','final')};   /* 期末最後一科考完的那一刻：只在期末考週算一次 */ const L=KX_END_C.v; return !!L&&G.day===L.day&&G.hour>=L.h; }},
    dialogue:[
      {speaker:null,text:'（宿舍樓下。她在等人，行李箱已經拉出來一個。）'},
      {speaker:'kexin',text:'你寒假在哪？'},
      {choice:[{text:'「臺北。」',set:{KX_Y1S1_END:'taipei'},goto:'a'},{text:'「還沒想。」',set:{KX_Y1S1_END:'unsure'},goto:'b'}]},
      {label:'a'},{speaker:'kexin',text:'那我帶東西上來。你吃不吃辣？高雄的東西都有一點甜，先跟你講。'},{goto:'z'},
      {label:'b'},{speaker:'kexin',text:'想去哪就去。不要到開學才後悔。'},
      {label:'z'} ] },
  /* ===== 可昕自己的線：大一下到大四的六拍（CANON-NO-ECON-1112 第四批；企劃線 AA_873 定稿，BB_416）=====
     不分交往：朋友以上（①②③ 熟悉、④⑥ 朋友；交往中的一樣看得到，台詞兩種都通）＋那一週在校園遇到她（STORY.presence here）；錯過那一週順延到學期末前（carryTo）。
     ②③④ 沿用原本的事件 id（內文整場換，原本的手機邀約、視訊、電話拿掉）；①⑥ 是新事件；⑤ 河濱＝ev_kexin_k20（r2y3b_events.js，日子照 AA_900 第 4 節）。
     ④ 祐廷大三上人在國外的：順延到回來以後的那個學期（大三下或大四上）同樣的週次（KX_LINE_TERM）。「室友」「大一學妹」不是人物：只有名牌、沒有立繪。 */
  { id:'ev_kx_s1_deposit', title:'', participants:['kexin'], location:'campus', trigger:'auto', near:{x:20,z:57,r:9}, term:['Y1S2'], weeks:[12], carryTo:15, time:[16.5,20], once:true, background:'blur',
    prereq:{custom:G=>KX_LINE_OK(G,'FAMILIAR')},
    dialogue:[
      {speaker:null,text:'（宿舍樓下的長椅。可昕旁邊坐著她室友，兩個人中間攤著幾張紙。室友眼睛是紅的。）'},
      {speaker:'kexin',text:'你來得剛好。你看得懂租約嗎？'},
      {speaker:'kexin',text:'她暑假要搬出去住，簽了約、付了押金。現在不想租了，房東說押金一毛都不退。'},
      {choice:[{text:'「我看看。」',goto:'a'},{text:'「這個要問老師吧。」',goto:'b'}]},
      {label:'a'},{speaker:null,text:'（你把那幾張紙看了一遍。有幾行字很小。）'},{speaker:'kexin',text:'你看這麼久，是看懂了還是沒看懂？……我也是。走，去問助教。'},{goto:'z'},
      {label:'b'},{speaker:'kexin',text:'我知道要問。可是她現在就在哭，我不能叫她哭到禮拜一。'},
      {label:'z'},
      {speaker:null,text:'（她把租約拿回去，一行一行用手指著念。念到第三頁她停下來。）'},
      {speaker:'kexin',text:'這裡。「簽約後反悔，押金不退」是房東自己講的。紙上寫的是另一回事，寫的是搬進去以後的事。'},
      {speaker:'kexin',text:'她根本還沒搬進去。'},
      {speaker:'kexin',text:'（對室友）我沒有說妳一定拿得回來。我是說，他講的那句話，紙上沒有。妳明天拿這一頁去問他，叫他指給妳看是哪一行。'},
      {speaker:null,text:'（室友看著那一頁，過了一會兒，把眼淚擦掉了。）'},
      {speaker:'室友',text:'……妳這樣講我就懂了。我本來以為是我笨。'},
      {speaker:'kexin',text:'妳哪裡笨。是字太小。'},
      {speaker:null,text:'（室友先上樓了。可昕把剩下的紙疊好。）'},
      {speaker:'kexin',text:'我剛剛其實很怕講錯。'},
      {speaker:'kexin',text:'可是她聽懂的時候，整個人就不抖了。你有看到嗎。'},
      {set:{KX_S1:true}} ] },
  /* ① 大一下沒遇到的玩家：下學期（大二上）第一次遇到她時用一句帶過（AA_873 ①） */
  { id:'ev_kx_s1_heard', title:'', participants:['kexin'], location:['linze','campus'], trigger:'enter', term:['Y2S1'], once:true, background:'blur',
    prereq:{custom:G=>KX_LINE_OK(G,'FAMILIAR')&&!G.flags.KX_S1&&!(G.events&&G.events.done&&G.events.done.ev_kx_s1_deposit)},
    dialogue:[ {speaker:null,text:'（她說上學期幫室友看了一份租約，押金後來拿回一半。）'},{set:{KX_S1:'heard'}} ] },
  /* 長頸鹿鑰匙圈（CANON-NO-ECON-1112 第四批；企劃線 AA_882 第 1 節，BB_422）：AA_856 ④ 的兌現——大一下開學第一週，她把高雄帶上來的那盒餅給祐廷（KX_SOUVENIR）。
     那一場本身 AA_856 沒有字（見上面 AA_856 那一段的註）；AA_882 給的是「同一個場面多兩列」，先只演這兩列。只有大一上期末選「臺北。」（她說要帶東西上來，KX_Y1S1_END 'taipei'）的有。
     設 GIRAFFE_KEYCHAIN（畢業後 postgrad_lines.js 的 key／kexinKey 讀它）。不分交往 */
  { id:'ev_kx_souvenir', title:'', participants:['kexin'], location:['linze','campus'], trigger:'enter', term:['Y1S2'], weeks:[1], carryTo:2, once:true, background:'blur',
    prereq:{custom:G=>G.flags.KX_Y1S1_END==='taipei'&&!G.flags.KX_SOUVENIR&&KX_LINE_OK(G,'ACQUAINTANCE')},
    dialogue:[
      {speaker:null,text:'（盒子上面用膠帶黏著一個小小的長頸鹿鑰匙圈。）'},
      {speaker:'kexin',text:'那個是附的。我在高雄的動物園買了一袋，班上每個人都有。你的是脖子最短的那隻。'},
      {set:{KX_SOUVENIR:true,GIRAFFE_KEYCHAIN:true}} ] },
  { id:'ev_kexin_bad_exam', title:'', participants:['kexin'], location:'linze', trigger:'enter', term:['Y2S1'], weeks:[11], carryTo:15, time:[12,18], once:true, background:'blur',
    prereq:{custom:G=>KX_LINE_OK(G,'FAMILIAR')},
    dialogue:[
      {speaker:null,text:'（期中考卷發回來。可昕把她那一份對摺，再對摺，塞進包包最底下。）'},
      {speaker:'kexin',text:'不要問我幾分。'},
      {speaker:'kexin',text:'……我每一題都知道在問什麼。老師在旁邊寫了三次「理由？」。'},
      {choice:[{text:'「妳上課都講得出來。」',goto:'a'},{text:'「要不要我問妳？」',set:{KX_S2_ASKED:true},goto:'b'}]},
      {label:'a'},{speaker:'kexin',text:'對。講的時候有人會追問我，我就會往下講。寫的時候沒有人問，我寫完結論就覺得講完了。'},{goto:'z'},
      {label:'b'},{speaker:'kexin',text:'現在？……好。你問。'},
      {speaker:null,text:'（你拿她的考卷，指著第一題問她為什麼。她講了，講得很順。你再問一次為什麼，她又往下講了一層。）'},
      {speaker:'kexin',text:'……剛剛那一段，我考卷上一個字都沒有寫。'},
      {label:'z'},
      {speaker:'kexin',text:'我以前覺得講得出來就是會。'},
      {speaker:'kexin',text:'結果只有一半。另一半是沒有人問的時候，我自己要問自己。'},
      {speaker:null,text:'（她把考卷從包包底下拿出來，攤平，壓在課本下面。）'},
      {speaker:'kexin',text:'這張我要留著。很醜，可是我要留著。'},
      {set:{KX_S2:true}} ] },
  { id:'ev_kexin_tutor_practice', title:'', participants:['kexin'], location:'linze', trigger:'enter', term:['Y2S2'], weeks:[7], carryTo:15, time:[16,19.5], once:true, background:'blur',
    prereq:{custom:G=>KX_LINE_OK(G,'FAMILIAR')},
    dialogue:[
      {speaker:null,text:'（系館一樓的討論桌。可昕對面坐著三個大一的，桌上是攤開的課本。你經過，她抬頭看到你，用下巴指了一下旁邊的空位。）'},
      {speaker:'kexin',text:'坐。他們說有一題看不懂，來問我。我也不知道為什麼是問我。'},
      {speaker:'大一學妹',text:'因為學姊上次在走廊跟人講話，我們聽得懂。'},
      {speaker:'kexin',text:'……我那次是在吵架。'},
      {speaker:null,text:'（她把課本轉過去，不念課本上的字，用自己的話講了一遍。講到一半，一個學弟在滑手機。）'},
      {speaker:'kexin',text:'你。你是來問的還是來坐的？'},
      {speaker:null,text:'（學弟把手機蓋起來。）'},
      {speaker:'kexin',text:'我不會講第二次。我等一下也要念我自己的。'},
      {choice:[{text:'（不插話，聽她講完）',goto:'a'},{text:'「這裡我補一句。」',goto:'b'}]},
      {label:'a'},{speaker:null,text:'（她講完，三個人都在寫。那個學弟寫得最久。）'},{goto:'z'},
      {label:'b'},{speaker:'kexin',text:'好，你補。（你補完）……對，這個我漏了。你們記他講的那句。'},
      {label:'z'},
      {speaker:null,text:'（三個大一的走了。學妹走到門口又回頭。）'},
      {speaker:'大一學妹',text:'學姊，妳講的比課本好懂。'},
      {speaker:'kexin',text:'課本比較對。我只是比較吵。'},
      {speaker:null,text:'（她把課本收起來，過了幾秒。）'},
      {speaker:'kexin',text:'她那句話我會記很久。你不要笑。'},
      {set:{KX_S3:true}} ] },
  { id:'ev_kexin_call_helper', title:'', participants:['kexin'], location:'campus', trigger:'auto', near:{x:20,z:57,r:9}, term:['Y3S1','Y3S2','Y4S1'], weeks:[9], carryTo:15, time:[19,23], once:true, background:'blur',
    prereq:{custom:G=>KX_LINE_OK(G,'FRIEND')&&KX_LINE_TERM(G,['Y3S1','Y3S2','Y4S1'],9)},
    dialogue:[
      {speaker:null,text:'（她在路燈下等你。手上拿著兩杯飲料，一杯遞過來。）'},
      {speaker:'kexin',text:'你這禮拜幫了幾個人？'},
      {speaker:'kexin',text:'搬東西、改報告、修電腦。我都有聽說。'},
      {speaker:'kexin',text:'那你自己的事，誰幫？'},
      {choice:[{text:'「……是我自己。」',set:{KX_HELPER_CALL:'admit'},goto:'c1'},{text:'（轉移話題）',set:{KX_HELPER_CALL:'dodge'},goto:'c2'},{text:'「那妳呢？誰幫妳？」',set:{KX_HELPER_CALL:'ask_back'},goto:'c3'}]},
      {label:'c1'},{speaker:'kexin',text:'我知道。我只是想聽你自己講。'},{goto:'end'},
      {label:'c2'},{speaker:'kexin',text:'好。今天先不問。飲料喝完再走。'},{goto:'end'},
      {label:'c3'},{speaker:'kexin',text:'我？我會開口。我室友、沛珊，被我煩過的都知道。'},{speaker:'kexin',text:'你也可以開口。我不一定幫得上，可是我會罵你為什麼不早講。'},
      {label:'end'},
      {speaker:null,text:'（她把吸管插好，喝了一口。）'},
      {speaker:'kexin',text:'我沒有在念你。'},
      {speaker:'kexin',text:'我看到一個人一直在幫別人，會想知道他自己好不好。這樣而已。'} ] },
  { id:'ev_kx_s6_same', title:'', participants:['kexin'], location:'linze', trigger:'enter', term:['Y4S2'], weeks:[10], carryTo:14, time:[12,18], once:true, background:'blur',
    prereq:{custom:G=>KX_LINE_OK(G,'FRIEND')},
    dialogue:[
      {speaker:null,text:'（系館的布告欄前面。她在看一張國考的時程表，看完把手機收起來。）'},
      {speaker:'kexin',text:'很多人問我要考哪一個。'},
      {speaker:'kexin',text:'我本來也覺得要先選好。律師、司法官，選一個，然後照那個念。'},
      {choice:[{text:'「現在呢？」',goto:'a'},{text:'「妳想當哪一個？」',goto:'b'}]},
      {label:'a'},{speaker:'kexin',text:'現在我覺得那是後面的事。'},{goto:'z'},
      {label:'b'},{speaker:'kexin',text:'都可以。我講真的。'},
      {label:'z'},
      {speaker:'kexin',text:'不管最後坐在哪一邊，我要做的是同一件事——有人拿著一張看不懂的紙站在那裡，我過去，用他聽得懂的話講一遍。'},
      {speaker:'kexin',text:'考不考得上，都可以這樣做。'},
      {speaker:null,text:'（她看了你一眼。）'},
      {speaker:'kexin',text:'這句不准跟阿哲講。他好不容易才不怕我。'},
      {set:{KX_S6:true}} ] },
];
// 同一人物的一般閒聊（沒有事件可觸發時）。一句可以是字串，或 {t:'台詞', if:{條件，和事件的 if 一樣}}；story3d.js 的 S.smallTalk 輪流說、一天一句
/* 閒聊（S.smallTalk）：一句可以是字串，或 {t, 條件}。條件（AA_120 2-2，2026-10-13）：if／unless（EVENTS.cond）、term（學期）、week:[a,b]（學期第幾週）、
   location（區域）、time:[a,b]、weekday、once（true＝一輩子一次；'term'＝每學期一次）。條件照 AA_120 第 1、2 節（第①級：只加條件、不改字）；
   改字（第 5 節：柏翰「二十一天」、芯慈「經濟系」、黃教授「電影」、Alison 的內層引號）等使用者批准，字先不動。 */
/* TEXT-QUOTE-UNIFY-1108 第四批（AA-B 2026-11-08 05:31）：閒聊是 story3d.js S.smallTalk → GM.say(who,…) 有名字說的，句子不加外面的「」（原本「SMALLTALK 的寫法：說的話加「」」）。
   說過了的記號是句子本身：舊存檔記的（有「」）讀檔時 STORY.smallQuoteMigrate 換成現在的句子 */
const SMALLTALK={
  heroine_02:[{t:'今天的豆子很酸，我不推。',location:'cafe'},'你有看過《進城的那一週》嗎？沒有？那我們沒得聊了——開玩笑。',{t:'外文系的期中是報告，法律系呢？……我聽說你們期末要寫到手斷掉。',week:[6,9]}],
  heroine_03:['……嗯。',{t:'三樓靠窗的燈壞了，你知道嗎。',location:'library'},{t:'我阿姨問你什麼時候再來。',if:{events:['ev_noodle_yutong']}}],
  heroine_04:[{t:'你手指好了沒？',term:['Y1S2'],if:{memory:[{npc:'heroine_04',tag:'INVITED_CLUB'}]}},{t:'阿凱說他昨天又寫到四點。你們那間到底幾點關燈？',term:['Y1S1','Y1S2'],if:{events:['ev_ziqing_club']}},{t:'阿凱說他昨天又寫到四點。你看到他，叫他去睡。',term:['Y2S1','Y2S2','Y3S1','Y3S2'],if:{events:['ev_ziqing_club']}},   /* BB_166 1-3：阿凱就是祐廷的室友、大二起不同房 */
              {t:'期末成發你要來。',if:{memory:[{npc:'heroine_04',tag:'INVITED_CLUB'}],stage:{npc:'heroine_04',min:'FAMILIAR'}},term:['Y1S2','Y2S2'],week:[10,13]}],   /* 手指痛＝學過和弦；成發在大一下、大二下第 14 週（AA_120 第 1 節、BB_96 4-4）。大二下的成發（Q9）還沒做，先只在大一下說（BB_134 1-8，AA-B 2026-10-16：先關，和 Q9 一起做時把 'Y2S2' 加回來）——AA_325 2-Y2-19 做了 Q9，'Y2S2' 加回來 */
  heroine_05:[{t:'我大一的時候，判決只背結論。後來都要重讀。',term:['Y1S1','Y1S2']},{t:'總圖三樓靠窗那排，九點前就滿了。',term:['Y1S1']},{t:'……我沒事。只是沒睡。',if:{stage:{npc:'heroine_05',min:'FAMILIAR'}}}],
  classmate_bohan:['我在寫考古題，第二題卡住了。',{t:'期末還有{n}天，我排了一份進度表，要的話傳你。',final:[7,14],once:'term'}],   /* AA_209 附錄A §2 */   /* AA_120 7-1 第 1 項：{n}＝到這學期第一個期末考時段的天數（D118 沒有期中考，AA_578 第 2 節 #1：原本到期中考、「期中」→「期末」；照課表和日曆，story3d.js 的 smallTalk），7～14 天才說、每學期一次 */
  classmate_xinci:[{t:'筆記我還你了，你有收到嗎？',if:{memory:[{npc:'classmate_xinci',tag:'LENT_NOTES'}]},once:true},/* 到了雙主修事件就不再說；AA_886 第 2 節（CANON-NO-ECON-1112 第四批）：只留第一句、拿掉條件，另外兩句刪 */
    {t:'雙主修要多修好多學分，我排了好幾種課表，每一種都好滿。',/* AA_209 附錄A §2 */term:['Y1S1','Y1S2'],if:{notEvents:['ev_xinci_double']}}],
  /* 明軒、宥辰的閒聊（AA_497 4-5、1-10，企劃線 7a38216ca）：取代原本兩句撐四年；每句一次（once）、照學期（term）；說完以後的一句旁白在 STORY.SMALL_AFTER（src/sup497_3d.js）。
     原句：「阿哲說週五練球。」只限大一；「你看起來很累。睡飽比較重要。」照原本的條件（前一晚很晚睡、當天第一次）；宥辰的兩句照原本的條件（8～13 點／DJ 那段之前），稿上那一句沒有「bar」照稿 */
  classmate_mingxuan:[{t:'阿哲說週五練球。',term:['Y1S1','Y1S2'],once:true},{t:'你看起來很累。睡飽比較重要。',if:{lateNight:true},once:true,prio:1},
    {t:'家教那個學生期中考進步了。他媽媽塞給我一袋柳丁。',term:['Y1S2'],once:true},{t:'這學期家教多接了一個。週六早上，小學五年級，很吵。',term:['Y2S1'],once:true},
    {t:'系籃新來的學弟很高。阿哲說他是秘密武器。他不會投籃。',term:['Y2S2'],once:true},{t:'德文課在晚上。下課走出來，公館的店都要關了。',term:['Y3S1'],once:true},
    {t:'冠軍賽那天，我是抱著獎盃去家教的。學生說我很臭。',term:['Y3S2'],if:{custom:G=>typeof STORY!=='undefined'&&STORY.dayOfKey&&G.day>STORY.dayOfKey('2028-04-29')},once:true},   /* M3 之後（冠軍賽 2028-04-29）*/
    {t:'德文的冠詞有三個。我背了一學期，現在只確定一個。',term:['Y4S1'],once:true},{t:'我爸說畢業典禮要上來。他說要關店一天。',term:['Y4S2'],once:true}],
  classmate_youchen:[{t:'……現在幾點？我昨天四點才睡。',time:[8,13],once:true},{t:'公館那間週五我放歌，來嗎？',if:{notEvents:['ev_youchen_dj']},once:true},
    {t:'期末考前一週我會出現。學分要顧。',term:['Y1S2'],once:true},{t:'你有沒有發現，A館的電梯門關起來之前，會停一下。',term:['Y2S1'],once:true},
    {t:'重修的教室在一樓。我到的時候，門還沒開。',term:['Y2S2'],once:true},
    {t:'立群背刑訴是用唱的。我幫他錄起來，現在全班在傳。',term:['Y3S1'],if:{memory:[{npc:'pool_16',tag:'FIRST_MET'}]},once:true},{t:'刑訴的筆記有人用唱的背。你要聽嗎。很難聽。',term:['Y3S1'],unless:{memory:[{npc:'pool_16',tag:'FIRST_MET'}]},once:true},   /* 認識詹立群才說；沒認識的照 BB_113 */
    {t:'立群唱的刑訴，學弟妹拿去用了。他假裝很生氣，其實很開心。',term:['Y3S2'],if:{memory:[{npc:'pool_16',tag:'FIRST_MET'}]},once:true},
    {t:'實習的公司在西門町。下班走出來，整條街都是別人的歌。',term:['Y4S1'],once:true},{t:'畢業以後應該不用再早起了。……這四年我好像也沒早起過。',term:['Y4S2'],once:true}],
  classmate_peishan:[{t:'我今天旁聽了倫理學。',term:['Y1S1','Y1S2','Y2S1']}/* AA_259 (b) 第 5 點：只到大二上 */,{t:'B館的研討室，下午都沒人。你可以去那裡讀書。',if:{notFlags:['lawclub']}}],   /* AA_369 第 4 節：法服沒有週三讀書會（口氣表 0-3）*/
  npc_fangyt:[{t:'下週去溪頭。……第一次一個人上山，我帶了太多襪子。',once:'term',if:{custom:G=>typeof STORY!=='undefined'&&!!STORY.dayOfKey&&G.day<STORY.dayOfKey('2026-09-01')}},{t:'這學期去奧萬大。樣區要自己找。',once:'term',if:{custom:G=>typeof STORY!=='undefined'&&!!STORY.dayOfKey&&G.day>=STORY.dayOfKey('2026-09-01')&&G.day<STORY.dayOfKey('2027-09-01')}},
    {t:'畢業專題的樣區在嘉義。……我可能會留在那邊。',once:'term',if:{custom:G=>typeof STORY!=='undefined'&&!!STORY.dayOfKey&&G.day>=STORY.dayOfKey('2027-09-01')&&G.day<STORY.dayOfKey('2028-07-01')}},   /* AA_519 第 6 節：原本「森林系的野外實習，下週去溪頭。」每學期一次同一句，改成照學年（大一、大二、大三；大四以後不說：AA_357 2-2 第 6 點，2028-07 起他在嘉義）*/{t:'芷若跟你講過我嗎？她高中就這樣，什麼都不講。',if:{events:['ev_fangyt_hint']}}],   /* 第二句在 Z6（BB_96 3-6，大一下）之後才說；Z6 還沒做，先不說（BB 2026-10-13）*/
  npc_huangxh:[],   /* AA_519 4-1（企劃線 d75cd0228）：原本一句撐四年，改成照學年一年兩句（「語彤最近很累」只在大一、大二；src/data/aa519_lines.js hxh.years，src/sup519_3d.js 登記 STORY.SMALL_DAILY）*/
  npc_ta_chen:[],   /* AA_519 2-2（企劃線 d75cd0228）：原本兩句撐四年，改成照學年一年兩句（src/data/aa519_lines.js ta.years，src/sup519_3d.js 登記 STORY.SMALL_DAILY）*/
  prof_zhou:[{t:'有問題可以來研究室。週四下課以後我都在。',term:['Y1S1','Y1S2','Y2S1']},{t:'大四了。你們這一屆，我從民總教到專題。',term:['Y4S2']}]/* AA_522 1-1：研究室是週四他的課下課以後；只在他有課的學期說（其他學期沒有句子＝聊兩句天氣；story3d.js talkProf 同一句同一份學期）。第 9 節第 2 點（a3ea3918e）：大四下他的課在週一、週四沒有研究室，換「大四了……」、不邀研究室 */,prof_lin:['判決要整個讀，不要只讀結論。'],prof_zhang:[{t:'講義第三十頁，自己回去看。',if:{course:{const_1:{min:1}}}}],prof_wu:[{t:'這個概念我們下週再講兩小時。',if:{course:{crim_gen1:{min:1}}},term:['Y1S1','Y1S2','Y2S1']}],prof_huang:['最近在重讀《正義：一場思辨之旅》。每讀一次，我就換一邊站。'],   /* AA_120 7-1 第 4 項：那是書不是電影（AA_522 第 4 節：她只在經濟系那年教法學緒論，這句沒有「上過她的課以後」的條件）*/prof_xu:[{t:'行政法大二再說。先把民總讀好。',if:{course:{admin_law:{max:0}}},term:['Y1S1','Y1S2']}]/* AA_375 第 20 項：只在大一說 */,prof_tsai:['民訴的題目很長，因為人生很長。'],prof_chen:['國際法的新聞，每天都有。只是大部分人不知道那是國際法。']/* AA_522 第 4 節：他沒有開課、沒有研究室事件，不說「來研究室聊」*/,
  kai:[{t:'所以那個賣家可以告嗎？……不能？那法律系在幹嘛。',if:{flags:['classDone']}},{t:'宿舍網路又斷了。你們有教這個嗎？',location:'dorm',if:{notFlags:['GRADUATED']}}],   /* AA_357 2-2 第 2 點：畢業以後不說 */
  zhe:[{t:'系籃週五練球，來坐也可以。',term:['Y1S1','Y1S2','Y2S1','Y2S2'],if:{notFlags:['ball_invite','GRADUATED']}},{t:'這季我是隊長。週五你來記分。',term:['Y3S1','Y3S2','Y4S1','Y4S2'],if:{notFlags:['GRADUATED']}},   /* AA_313 5-3：系籃那句到大二下，大三起他是隊長 */{t:'總圖 B1 的冷氣，比去年冷。',if:{flags:['GRADUATED']}},'公館那家滷味晚上十點後半價。'],   /* AA_357 2-2：畢業以後系籃那句換成總圖 B1 的冷氣 */
  yu:[{t:'辯論社下週辯『網拍標錯價要不要出貨』。',term:['Y1S1'],week:[4,6],once:true,if:{flags:['classDone']}},   /* AA_120 7-1 第 5 項：引號；辯論社第 5 週開始，第 4～6 週說「下週」才對 */'溫州街的貓你有看到嗎？'],
  /* AA_120 7-2（使用者 2026-10-13 批准）：20 位不熟同學各三句，整個存檔各只說一次；第 3 句要對方說過心事（SHARED_SECRET）以後。說完以後只點頭或短招呼（story3d.js 的 smallTalk）。台詞【虛構】 */
  pool_1:[{t:'我在看一本推理小說，兇手是律師。……我還沒看完，你不要猜。',once:true},{t:'總圖那一區的推理小說，我大概看完一半了。剩下那一半都被借走。',once:true},{t:'我寫的那篇卡在第三章：兇手的動機，連我自己都不信。……法律系的課，會教怎麼判斷動機嗎？',once:true,if:{memory:[{npc:'pool_1',tag:'SHARED_SECRET'}]}}],
  pool_2:[{t:'財金系的報告都在算錢，法律系的報告都在算誰要賠錢。差不多。',once:true},{t:'我這學期修了二十五學分。不要學我。',once:true},{t:'我在學日文。五十音背了三次，第三次終於記住了。',once:true,if:{memory:[{npc:'pool_2',tag:'SHARED_SECRET'}]}}],
  pool_3:[{t:'台北的豆花太甜了。……好啦，是台南的太甜，台北的剛好。',once:true},{t:'我媽又寄了一箱虱目魚丸上來。冰箱塞不下，你要不要分一點？',once:true},{t:'每次搭高鐵回台南，過了嘉義就開始想吃早餐。',once:true,if:{memory:[{npc:'pool_3',tag:'SHARED_SECRET'}]}}],
  pool_4:[{t:'系學會又要辦活動了。你有什麼想玩的，可以跟我說。',once:true},{t:'活動組就是：大家在玩的時候，我在數人數。',once:true},{t:'書記官的考試科目，我偷偷查過了。你不要說出去。',once:true,if:{memory:[{npc:'pool_4',tag:'SHARED_SECRET'}]}}],
  pool_5:[{t:'社辦的吉他有一把斷了一根弦，大家都假裝沒看到。',once:true},{t:'我們社課有一半的時間在吃東西，另一半在找誰帶了撥片。',once:true},{t:'上次社辦有一隻蟑螂，我在走廊站了二十分鐘。不要笑。',once:true,if:{memory:[{npc:'pool_5',tag:'SHARED_SECRET'}]}}],
  pool_6:[{t:'椰影大道下午四點的光最好看。你下次經過可以看一下。',once:true},{t:'系上活動的照片，十張裡有八張是我拍的。所以照片裡都沒有我。',once:true},{t:'上次那張映月湖的照片，我拿去投比賽。沒得獎，可是我很開心。',once:true,if:{memory:[{npc:'pool_6',tag:'SHARED_SECRET'}]}}],
  pool_7:[{t:'我六點就到晨思鐘旁邊吃早餐了。那時候的校園很安靜，你應該來看一次。',once:true},{t:'早起的祕訣是早睡。……好，我知道這不算祕訣。',once:true},{t:'我想當律師，可是我還不知道要幫誰。你呢？',once:true,if:{memory:[{npc:'pool_7',tag:'SHARED_SECRET'}]}}],
  pool_8:[{t:'辯論最難的是計時器響的時候閉嘴。我每次都多講半句。',once:true},{t:'下次辯論賽我當計時。……對，我每次都當計時。',once:true},{t:'上台之前我都要去洗三次手。今天洗了四次。',once:true,if:{memory:[{npc:'pool_8',tag:'SHARED_SECRET'}]}}],
  pool_9:[{t:'我最近在聽一個講冷知識的 podcast。昨天那集在講醬油。',once:true},{t:'窗邊這個位子下午很曬，可是我還是會坐這裡。',once:true},{t:'我在查國外的研究所。查了一個月，還沒跟我媽講。',once:true,if:{memory:[{npc:'pool_9',tag:'SHARED_SECRET'}]}}],
  pool_10:[{t:'冠廷學長說，讀書不要只畫重點，要問自己為什麼。他說了三次。',once:true},{t:'助教的研究室有一台很好喝的咖啡機。這是我知道的唯一祕密。',once:true},{t:'我想念研究所。……現在講這個好像太早了，對吧？',once:true,if:{memory:[{npc:'pool_10',tag:'SHARED_SECRET'}]}}],
  pool_11:[{t:'吉他袋很重。可是背著它走在路上，會覺得自己很會彈。',once:true},{t:'B館那邊晚上很安靜，彈錯也沒人聽到。',once:true},{t:'上次跟你說我不會換和弦……我昨天換成功了一次。只有一次。',once:true,if:{memory:[{npc:'pool_11',tag:'SHARED_SECRET'}]}}],
  pool_12:[{t:'系籃的水是我買的，毛巾是我洗的，比分是我記的。球是他們打的。',once:true},{t:'系服我有三件。這樣早上不用想要穿什麼。',once:true},{t:'翹課那幾次，我是去球場幫大家占位子。……好啦，也有一次是睡過頭。',once:true,if:{memory:[{npc:'pool_12',tag:'SHARED_SECRET'}]}}],
  pool_13:[{t:'廣播社這週的節目在講校園裡的貓。你有推薦的貓嗎？',once:true},{t:'錄音的時候最怕咳嗽。剪掉一聲要花十分鐘。',once:true},{t:'上次跟你說我想跑司法新聞。……我現在看新聞，都會先想記者有沒有把判決講錯。',once:true,if:{memory:[{npc:'pool_13',tag:'SHARED_SECRET'}]}}],
  pool_14:[{t:'從校門騎到總圖，我的紀錄是一分四十秒。不要學，很危險。',once:true},{t:'腳踏車社週末要騎去河堤。來的話記得帶水。',once:true},{t:'我一章讀十分鐘，可是隔天就忘了。所以我現在一章讀三次。',once:true,if:{memory:[{npc:'pool_14',tag:'SHARED_SECRET'}]}}],
  pool_15:[{t:'哲學系的課上了一學期，作業都是問題，沒有答案。',once:true},{t:'讀書會上我問了一個問題，大家安靜了五秒。我很喜歡那五秒。',once:true},{t:'我最後沒轉系。法律系的課，也有在問為什麼。',once:true,if:{memory:[{npc:'pool_15',tag:'SHARED_SECRET'}]}}],
  pool_16:[{t:'有人說我混音太吵。他說得對，可是我不改。',once:true},{t:'週五晚上公館那間，我偶爾去幫忙搬音響。',once:true},{t:'我背法條是配節奏的。……你不要叫我唱，我會害羞。',once:true,if:{memory:[{npc:'pool_16',tag:'SHARED_SECRET'}]}}],
  pool_17:[{t:'我的筆記借出去之前都會先拍照。上次有一本回來的時候多了咖啡漬。',once:true},{t:'考前一週，我的筆記會被借走五次。我自己都要排隊。',once:true},{t:'考前我都睡不著。所以才一直寫筆記，寫下來比較不怕。',once:true,if:{memory:[{npc:'pool_17',tag:'SHARED_SECRET'}]}}],
  pool_18:[{t:'早上的課我都坐最後一排。前二十分鐘，我還在開機。',once:true},{t:'刑法的案例很像推理小說，只是兇手都先寫好了。',once:true},{t:'大家說我刑法很強。其實我每次考前都怕得要命。',once:true,if:{memory:[{npc:'pool_18',tag:'SHARED_SECRET'}]}}],
  pool_19:[{t:'我去旁聽社工系的課。有時候跟法律系在講同一件事，只是用不同的字。',once:true},{t:'週末我在社福中心當志工。有個小朋友問我『法律可以保護我嗎』，我還不會回答。',once:true},{t:'我家以前也被社工幫過。所以我想站在另一邊看看。',once:true,if:{memory:[{npc:'pool_19',tag:'SHARED_SECRET'}]}}],
  pool_20:[{t:'法服的攤位每年都擺在同一個位置。因為那裡有插座。',once:true},{t:'法服的器材是我管的。延長線、名牌、那台很老的影印機。影印機最難管。',once:true},{t:'當幹部是抽籤抽到的。……可是我現在不想交出去了。',once:true,if:{memory:[{npc:'pool_20',tag:'SHARED_SECRET'}]}}],
};

// ══════════════════════════════════════ 事件包 v1.1：女主角 arc、教授、同學、生活小事、考試、研究所
const STORY_EVENTS_V11=[
  // ── 小安 arc ──
  { id:'ev_an_library_study', title:'總圖的早上', term:['Y1S1'], participants:['heroine_01'], location:'library', trigger:'interact', priority:6, cooldown_days:2, max_times:2, day_min:3,   /* AA_186 第 6 節 A：最多兩次（第二次的新開場句等使用者確認口語準則）*/   /* 交接包 v1 第 1 節（AA 2026-10-14）：大一沒有刑訴，選項改刑總；兩個選項都是大一上的課 → 只在大一上 */ prereq:{stage:{npc:'heroine_01',min:'ACQUAINTANCE'}}, background:'blur',
    dialogue:[ {speaker:'heroine_01',expression:'neutral',text:'（小聲）這裡有位子。你要讀什麼？'},{choice:[{text:'「民總。周老師說錯誤那段後面才會講。」',consequences:{mem:[{npc:'heroine_01',tag:'STUDIED_TOGETHER',note:'總圖讀民總'}],rel:{heroine_01:{fam:4,comf:3}},energy:-6,advance:1.5,knowledge:{study:null}},goto:'study'},{text:'「刑總。吳老師說會考。」',   /* D118：AA_578 第 3 節第 1 點，刪「期中」——待 AA 看 */consequences:{mem:[{npc:'heroine_01',tag:'STUDIED_TOGETHER',note:'總圖讀刑總'}],rel:{heroine_01:{fam:4,comf:3}},energy:-6,advance:1.5,knowledge:{study:null}},goto:'study'},{text:'「我只是來吹冷氣。」',consequences:{rel:{heroine_01:{fam:1}}},goto:'ac'}]},{label:'study'},{speaker:null,text:'一個半小時。她翻頁的速度是你的兩倍，但每二十分鐘會停下來看窗外一次。'},{if:{memory:[{npc:'heroine_01',tag:'CAFE_AFTERNOON'}]},speaker:'heroine_01',expression:'smile',text:'（小聲）比咖啡廳安靜吧。……但那天比較好玩。'},{goto:'end'},{label:'ac'},{speaker:'heroine_01',expression:'annoyed',text:'（小聲）那你去三樓，那邊冷氣比較強。'},{label:'end'} ] },
  { id:'ev_an_report_feedback', title:'報告發回來了', participants:['heroine_01'], location:['campus','library','cafe'], trigger:'interact', priority:8, once:true, day_min:9, prereq:{memory:[{npc:'heroine_01',tag:'CAFE_AFTERNOON'}],custom:G=>typeof STORY==='undefined'||!STORY.termDay||G.day>=STORY.termDay('Y1S1',6,1)}, background:'blur',   /* 交付清單 A4：第 6 週（報告交出去之後）；舊存檔過了第 6 週的照舊 */
    dialogue:[ {speaker:'heroine_01',expression:'surprised',text:'報告發回來了。周老師在我的結論旁邊寫了一行字。'},{if:{choice:{cafeView:'C'}},speaker:'heroine_01',expression:'laugh',text:'「無過失的判斷標準寫得好。」——所以我說了，是你的主意，他信了。'},{if:{choice:{cafeView:'A'}},speaker:'heroine_01',expression:'smile',text:'「兩邊的利益都有看到。」……那是你那天講的。'},{if:{choice:{cafeView:'B'}},speaker:'heroine_01',expression:'thinking',text:'「反方意見比正方精彩。」——那段是照你講的寫的。'},{choice:[{text:'「這份我學到很多。」',if:{memory:[{npc:'heroine_01',tag:'REPORT_PARTNER'}]},consequences:{rel:{heroine_01:{fam:5,aff:4,trust:3}},mem:[{npc:'heroine_01',tag:'IMPORTANT_CONVERSATION',note:'說從她的報告學到很多'}]}},{text:'「這份我學到很多。」',unless:{memory:[{npc:'heroine_01',tag:'REPORT_PARTNER'}]},consequences:{rel:{heroine_01:{fam:5,aff:4,trust:3}},mem:[{npc:'heroine_01',tag:'IMPORTANT_CONVERSATION',note:'說從她的報告學到很多'}]}},{text:'「那是妳寫的，不是我。」',consequences:{rel:{heroine_01:{resp:4,fam:2}}}}]},{speaker:'heroine_01',expression:'smile',text:'……嗯。'} ] },
  { id:'ev_an_mother', title:'書記官的女兒', retired:'D60（使用者 2026-10-14）：以安新版——母親是法官，停用書記官的舊事件。定義留著：已經演過的舊存檔（events.done、TALKED_FAMILY 記憶）照樣讀得到', participants:['heroine_01'], location:'campus', trigger:'interact', priority:7, once:true, time:[17.5,20.5], prereq:{stage:{npc:'heroine_01',min:'FAMILIAR'}}, background:'blur',
    dialogue:[ {speaker:'heroine_01',expression:'neutral',text:'我媽今天打來，問我期中考幾分。還沒考。'},{speaker:'heroine_01',expression:'thinking',text:'她是書記官。從我小學開始，她每天回家都會講法院發生什麼事——誰哭、誰吵、誰被帶走。'},{speaker:'heroine_01',expression:'serious',text:'我念法律，一半是因為她。另一半是想知道，坐在那個位置上的人，到底看得到什麼。'},{choice:[{text:'「妳現在看到什麼？」',consequences:{rel:{heroine_01:{trust:7,aff:4}},mem:[{npc:'heroine_01',tag:'TALKED_FAMILY',note:'她媽媽是書記官'}]},goto:'see'},{text:'「妳可以不用一直想這個。」',consequences:{rel:{heroine_01:{comf:5,trust:3}},mem:[{npc:'heroine_01',tag:'TALKED_FAMILY',note:'她媽媽是書記官'}]},goto:'rest'},{text:'「書記官很穩定啊。」',consequences:{rel:{heroine_01:{comf:-4}},mem:[{npc:'heroine_01',tag:'TALKED_FAMILY',note:'你說書記官很穩定'}]},goto:'stable'}]},{label:'see'},{speaker:'heroine_01',expression:'sad',text:'看到很多人不是壞人，只是沒有人幫他們把話講清楚。'},{speaker:'heroine_01',expression:'smile',text:'謝謝你問。大家都只問我成績。'},{goto:'end'},{label:'rest'},{speaker:'heroine_01',expression:'tired',text:'我知道。……可是不想的時候，就不知道為什麼要念這些。'},{goto:'end'},{label:'stable'},{speaker:'heroine_01',expression:'annoyed',text:'……我媽也這樣說。'},{speaker:null,text:'她沒有再說話。你們並肩走了一段，她在晨思鐘前面說要回宿舍。'},{label:'end'} ] },
  // ── 芷若 arc ──
  /* 阿哲初遇（AA_195 4-8，AA-B d5b5d188；台詞是 AA 的）：只限開學改 9/1 的局、還沒認識阿哲。9/1（一）憲法第一堂開始前，在 201 坐下以後；
     那天沒遇到（沒去、上課以後才進教室）改 9/3（三）刑總第一堂前（第二句換）。兩堂都沒遇到，9/4 campusMorning 演初遇版（story3d.js zheW1Morning）。
     「叫你哥」留給宿營打牌（AA_884 第 3 節），這一場不提。阿哲從玩家後面那一排出現（spawn dist −1.1）*/
  { id:'ev_zhe_w1_meet', title:'第一堂課前', participants:['zhe'], location:'classroom', trigger:'seat', time:[7,9+10/60], once:true, background:'blur', spawn:{npc:'zhe',dist:-1.1,pose:'idle'},
    prereq:{custom:G=>typeof STORY!=='undefined'&&STORY.week1Start&&STORY.week1Start(G)&&!G.flags.ZHE_W1_DORM&&(!G.flags.MET_ZHE||(STORY.metAtCamp&&STORY.metAtCamp(G,'zhe')))&&(G.day===STORY.dayOfKey('2025-09-01')||G.day===STORY.dayOfKey('2025-09-03'))},   /* 宿營認識的（CAMP-L1）：演宿營版（AA_205 6-2：已經認識，不換名字、不加熟悉）*/
    dialogue:[ {unless:{custom:G=>typeof STORY!=='undefined'&&STORY.metAtCamp&&STORY.metAtCamp(G,'zhe')},speaker:null,text:'（你坐下沒多久，後面的人用筆輕輕戳了一下你的肩膀。）'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.metAtCamp&&STORY.metAtCamp(G,'zhe')},speaker:null,text:'（你坐下沒多久，有人把書包放到你旁邊的位子。）'},
      {if:{custom:G=>(G=>typeof STORY!=='undefined'&&STORY.metAtCamp&&STORY.metAtCamp(G,'zhe'))(G)&&G.flags.ZHE_CALLS_GE},speaker:'zhe',expression:'smile',text:'哥，早。'},
      {if:{custom:G=>(G=>typeof STORY!=='undefined'&&STORY.metAtCamp&&STORY.metAtCamp(G,'zhe'))(G)&&!G.flags.ZHE_CALLS_GE},speaker:'zhe',expression:'smile',text:'欸，早。'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.metAtCamp&&STORY.metAtCamp(G,'zhe')},speaker:'zhe',expression:'neutral',text:'你知道這附近中午都吃什麼嗎？我昨天在公館繞了半小時，最後吃便利商店。'},{if:{custom:G=>typeof STORY!=='undefined'&&STORY.metAtCamp&&STORY.metAtCamp(G,'zhe')},goto:'ask'},
      {speaker:'zhe',expression:'smile',text:'欸，不好意思，你知道這附近中午都吃什麼嗎？'},
      {if:{custom:G=>typeof STORY!=='undefined'&&G.day===STORY.dayOfKey('2025-09-01')},speaker:'zhe',expression:'neutral',text:'我高雄上來的，昨天在公館繞了半小時，最後吃便利商店。'},
      {unless:{custom:G=>typeof STORY!=='undefined'&&G.day===STORY.dayOfKey('2025-09-01')},speaker:'zhe',expression:'neutral',text:'我高雄上來的，這幾天中午都在便利商店解決。'},
      {label:'ask'},{choice:[{text:'「校門對面那排有一間燒臘店，便宜，份量也夠。」',consequences:{flags:{ZHE_W1_NOODLE:true}},goto:'noodle'},{text:'「往捷運站那邊走，店比較多。」',goto:'mrt'},{text:'「我也還在找。」',goto:'still'}]},
      {label:'noodle'},{speaker:'zhe',expression:'smile',text:'燒臘喔，好。在哪？'},{speaker:null,text:'（你跟他講了大概的位置，他打進手機裡。）'},{goto:'name'},
      {label:'mrt'},{speaker:'zhe',expression:'neutral',text:'昨天就是在那邊繞的……好，我再去一次。'},{goto:'name'},
      {label:'still'},{speaker:'zhe',expression:'neutral',text:'好喔，那我中午再問問看別人。'},
      {label:'name'},{if:{custom:G=>typeof STORY!=='undefined'&&STORY.metAtCamp&&STORY.metAtCamp(G,'zhe')},goto:'bell'},{speaker:'zhe',expression:'smile',text:'我阿哲。張哲維。'},{speaker:'player',text:'{name}。'},
      {label:'bell'},{speaker:null,text:'（老師走進來，教室安靜下來。阿哲把手機收進口袋。）'},
      {if:{custom:G=>typeof STORY!=='undefined'&&STORY.metAtCamp&&STORY.metAtCamp(G,'zhe')},set:{MET_ZHE:true,ZHE_W1_CAMP:true}},{if:{custom:G=>!!G.flags.ZHE_W1_CAMP},goto:'end'},
      {set:{MET_ZHE:true},consequences:{rel:{zhe:{fam:1}}}},{label:'end'} ] },
  /* 四人房（AA_208 2-2；使用者 00:5x）：阿哲也住 203，9/1 第一堂課的早上在宿舍約一起走（取代教室裡的宿營版）。三個選項和回應照 AA_195 4-8、ZHE_W1_NOODLE 照記；不換名字、不加熟悉（宿營已經認識）*/
  { id:'ev_zhe_w1_dorm', title:'第一堂課的早上', participants:['zhe'], location:'dorm', trigger:'auto', time:[6,10], once:true, background:'blur', spawn:{npc:'zhe',dist:1.4,pose:'idle'},
    prereq:{custom:G=>typeof STORY!=='undefined'&&STORY.week1Start&&STORY.week1Start(G)&&!!G.flags.DORM_FOUR&&!G.flags.ZHE_W1_CAMP&&G.day===STORY.dayOfKey('2025-09-01')},
    dialogue:[ {speaker:null,text:'（早上，柏翰的床已經整理好了，人不在。）'},
      {if:{flags:['ZHE_CALLS_GE']},speaker:'zhe',expression:'smile',text:'哥，你第一堂什麼？'},{unless:{flags:['ZHE_CALLS_GE']},speaker:'zhe',expression:'smile',text:'欸，你第一堂什麼？'},
      {speaker:'player',text:'憲法。'},{speaker:'zhe',expression:'smile',text:'我也是。一起走。'},{speaker:'zhe',expression:'neutral',text:'中午吃什麼？我這三天都吃便利商店。'},
      {choice:[{text:'「校門對面那排有一間燒臘店，便宜，份量也夠。」',consequences:{flags:{ZHE_W1_NOODLE:true}},goto:'noodle'},{text:'「往捷運站那邊走，店比較多。」',goto:'mrt'},{text:'「我也還在找。」',goto:'still'}]},
      {label:'noodle'},{speaker:'zhe',expression:'smile',text:'燒臘喔，好。在哪？'},{speaker:null,text:'（你跟他講了大概的位置，他打進手機裡。）'},{goto:'end'},
      {label:'mrt'},{speaker:'zhe',expression:'neutral',text:'昨天就是在那邊繞的……好，我再去一次。'},{goto:'end'},
      {label:'still'},{speaker:'zhe',expression:'neutral',text:'好喔，那我中午再問問看別人。'},
      {label:'end'},{set:{MET_ZHE:true,ZHE_W1_CAMP:true,ZHE_W1_DORM:true}} ] },
  /* 到教室（AA_208 2-2）：柏翰坐第一排正中間 */
  { id:'ev_bohan_w1_front', title:'第一排', participants:[], location:'classroom', trigger:'enter', once:true, background:'blur',
    prereq:{custom:G=>!!G.flags.ZHE_W1_DORM&&typeof STORY!=='undefined'&&G.day===STORY.dayOfKey('2025-09-01')},
    dialogue:[ {speaker:null,text:'（柏翰坐在第一排正中間，已經在看課本了。）'} ] },
  /* 9/2（二）國文第一堂：沛珊找教室（BB_168 2-1；BB_177 第 10 節：宿營認識的一律用已認識版、不記 PS_W1_SEEN）。上課前（beforeClass）演、下課接借筆記；不加數值、不出法律題目 */
  { id:'ev_ps_w1_room', title:'找教室', participants:['classmate_peishan'], location:'any', trigger:'class', beforeClass:'chinese_y1', once:true, background:'blur',
    prereq:{custom:G=>typeof STORY!=='undefined'&&STORY.week1Start&&STORY.week1Start(G)&&G.day===STORY.dayOfKey('2025-09-02')},
    dialogue:[ {if:{custom:G=>typeof STORY!=='undefined'&&((STORY.metAtCamp&&STORY.metAtCamp(G,'classmate_peishan'))||(G.flags&&G.flags.welcomeDay!=null))},goto:'camp'},   /* 宿營認識、或 8/31 迎新認識（welcomeDay，AA_310 第 1 節）：走「已認識」那一段 */
      {speaker:'classmate_peishan',expression:'neutral',text:'（拿著手機，對照門口的教室號碼）不好意思，請問這間是大一國文嗎？法律系那班。'},
      {choice:[{text:'「對。」',goto:'u1'},{text:'「我也在找，應該是這間。」',goto:'u2'}]},
      {label:'u1'},{speaker:'classmate_peishan',expression:'smile',text:'喔好，謝謝。'},{speaker:null,text:'（她進去，坐在你斜前面那排。）'},{goto:'useen'},
      {label:'u2'},{speaker:'classmate_peishan',expression:'smile',text:'那我們一起進去好了，錯了一起出來。'},{speaker:null,text:'（她先推門。）'},
      {label:'useen'},{set:{PS_W1_SEEN:true}},{goto:'end'},
      {label:'camp'},{speaker:'classmate_peishan',expression:'smile',text:'（在門口看到你，走過來）欸，{name}。你也是這間嗎？'},{speaker:'classmate_peishan',expression:'neutral',text:'我剛剛跑去另一棟，還很有自信地坐下來了。'},
      {choice:[{text:'「對，這間。」',goto:'c1'},{text:'「我也差點走錯。」',goto:'c2'}]},
      {label:'c1'},{speaker:'classmate_peishan',expression:'smile',text:'好，那我跟你進去。'},{goto:'end'},
      {label:'c2'},{speaker:'classmate_peishan',expression:'neutral',text:'對吧，這邊的門牌小成那樣，是在考我們視力。'},{speaker:null,text:'（她先推門。）'},
      {label:'end'} ] },
  { id:'ev_ps_w1_notes', title:'最後那段', participants:['classmate_peishan'], location:'any', trigger:'class', afterClass:'chinese_y1', once:true, background:'blur',
    prereq:{custom:G=>typeof STORY!=='undefined'&&G.day===STORY.dayOfKey('2025-09-02')&&!!(G.events&&G.events.done&&G.events.done.ev_ps_w1_room)},
    dialogue:[ {speaker:'classmate_peishan',expression:'neutral',text:'（轉過來）剛剛最後那段你有抄到嗎？他講好快。'},
      {choice:[{text:'「有，你要拍嗎？」',goto:'a'},{text:'「我也沒抄完。」',goto:'b'}]},
      {label:'a'},{speaker:null,text:'（她拍了兩張。）'},{speaker:'classmate_peishan',expression:'smile',text:'謝謝！我下次坐你旁邊，直接看比較快。'},{goto:'end'},
      {label:'b'},{speaker:'classmate_peishan',expression:'neutral',text:'那我去問前面那個人。'},{speaker:null,text:'（她真的去問了。）'},
      {label:'end'} ] },
  /* 9/2（二）下午通識「電影與敘事」第一堂門口：明軒碰運氣（BB_168 3-1；114 學年起沒有人工加簽）。宿營認識的：第一句換成點個頭（BB_177 第 12 節），其餘照舊。記 MX_W1_SEEN，不算認識、不加數值 */
  { id:'ev_mx_w1_addclass', title:'通識第一堂門口', participants:['classmate_mingxuan'], location:'any', trigger:'class', beforeClass:'ge_film_y1s1', once:true, background:'blur',
    prereq:{custom:G=>typeof STORY!=='undefined'&&STORY.week1Start&&STORY.week1Start(G)&&G.day===STORY.dayOfKey('2025-09-02')},
    dialogue:[ {if:{custom:G=>typeof STORY!=='undefined'&&STORY.metAtCamp&&STORY.metAtCamp(G,'classmate_mingxuan')},goto:'camp'},
      {speaker:'classmate_mingxuan',expression:'neutral',text:'（站在門口看手機上的選課結果，看到你要進去）這堂你有選到喔？'},{goto:'ask'},
      {label:'camp'},{speaker:'classmate_mingxuan',expression:'neutral',text:'（點個頭）欸。你也加這門？'},
      {label:'ask'},{choice:[{text:'「有，運氣好。」',goto:'yes'},{text:'（點頭，進教室）',goto:'nod'}]},
      {label:'yes'},{speaker:'classmate_mingxuan',expression:'smile',text:'好好喔。我沒抽到。'},{speaker:'classmate_mingxuan',expression:'neutral',text:'想說來第一堂看看，說不定有人退。'},
      {speaker:null,text:'（上課鐘響，老師走到門口。）'},{speaker:'老師',text:'這堂人數已經滿了。沒選到的同學，加選期間有人退就有機會，不用在門口等。'},
      {speaker:'classmate_mingxuan',expression:'neutral',text:'……好吧。'},{speaker:'classmate_mingxuan',expression:'neutral',text:'我去看另一堂，下一節的。'},{speaker:null,text:'（他走了。）'},{goto:'end'},
      {label:'nod'},{speaker:null,text:'（他往旁邊讓了一下，又低頭看手機。）'},
      {label:'end'},{set:{MX_W1_SEEN:true}} ] },
  { id:'ev_zhiruo_ge_group', title:'經原分組', participants:['heroine_02'], location:'putong', term:['Y1S1'], trigger:'auto', near:{npc:'heroine_02',r:5}, time:[12.1,13], weekday:[5], once:true, minWeek:{term:'Y1S1',week:4}, background:'blur',   /* AA_195 4-7 A4：看週次（第 4 週週五起；原本 day_min 10，主線第一天提早以後會跑到 9/12）。AA_120 7-5 第 2 項：使用者已定 Z2 在重修的經原第 4 週週五（AA_110 1-5）——只改觸發：大一上、週五經原下課後、普通教學館、第 4 週起（2025-09-26＝第 10 天）；對話不動 */   /* 可以是第一次見面（BB 6-1、AA_120 3-1）：還沒見過的話她先報名字 */
    dialogue:[ {if:{memory:[{npc:'heroine_02',tag:'FIRST_MET'}]},speaker:'heroine_02',expression:'surprised',text:'欸，是你。你也修經原喔？'},{unless:{memory:[{npc:'heroine_02',tag:'FIRST_MET'}]},speaker:'heroine_02',expression:'neutral',text:'不好意思，你是法律系的嗎？剛剛點名有聽到。'},{unless:{memory:[{npc:'heroine_02',tag:'FIRST_MET'}]},speaker:'heroine_02',expression:'smile',text:'林芷若，外文二。'},{speaker:'heroine_02',expression:'smile',text:'剛剛分組，我們那組缺一個人。要不要？期末報告是「一件你覺得不合理的定價」。'},{choice:[{text:'「好。網拍標錯價算不算？」',consequences:{mem:[{npc:'heroine_02',tag:'SHARED_CLASS',note:'通識經濟學同組'}],rel:{heroine_02:{fam:6,resp:3}},flags:{ge_group_zhiruo:true}},goto:'price'},{text:'「我報告很爛，妳確定？」',consequences:{mem:[{npc:'heroine_02',tag:'SHARED_CLASS',note:'通識經濟學同組'}],rel:{heroine_02:{fam:5,comf:3}},flags:{ge_group_zhiruo:true}}},{text:'「我已經有組了。」',consequences:{rel:{heroine_02:{fam:1}},mem:[{npc:'heroine_02',tag:'DECLINED_INVITE'}]},end:true}]},{goto:'join'},{label:'price'},{speaker:'heroine_02',expression:'surprised',text:'標錯價喔？我看過那種新聞。原來你們上課會講這個。'},{speaker:'heroine_02',expression:'smile',text:'好，這個可以拍成短片。我剪片。你負責講。'},{label:'join'},{speaker:'heroine_02',expression:'smile',text:'好，那我把你拉進群組，報告的事群組講。'},{stamp:['geGroupDay']} ] },   /* BB_95 2-4：「網拍標錯價」之後的接點（法律說法需法律審查：遊戲裡只當報告題目、不給結論）；加入小組群組（geGroupDay，phoneRules）*/
  /* 芷若 Z5 邀約（BB_96 3-5，交接包 v2 改）：大一下第 12～15 週（BB_161 ②）的週五 19–22 在 Café（她週五晚上的班；週六不在）、Z4（ev_zhiruo_secret）之後、有點熟以上、只一次。
     單身：照原文兩句；交往中（AA_108 第 5 節）：改成多人——「……方奕廷也去。……你要來嗎？」，數字沒有 aff。「早場我起不來。」不扣分：「好。那下次有午場再說。」（記 zrDeclineDay；三週後的週六＝午場 ev_zhiruo_matinee，BB_96 3-5b）。
     「幾點？」或劇透那一條都算答應：zhiruo_film_date＋zhiruoFilmDay（隔天週六 10:00 的早場＝出遊 ev_zhiruo_early_show，story3d.js 排）*/
  { id:'ev_zhiruo_film_night', title:'週末看片', participants:['heroine_02'], location:'cafe', trigger:'interact', priority:7, once:true, term:['Y1S2'], weeks:[12,13,14,15], weekday:[5],   /* BB_161 ②：Z4 之後的週五，第 12～15 週（原本只有第 12～13 週，Z4 晚一週就整條沒了）*/ time:[19,22], prereq:{stage:{npc:'heroine_02',min:'FAMILIAR'},memory:[{npc:'heroine_02',tag:'SHARED_SECRET'}],events:['ev_zhiruo_secret']}, background:'blur',
    dialogue:[ {if:SOLO('heroine_02'),speaker:'heroine_02',expression:'smile',text:'明天我沒班，要去看《進城的那一週》重映，早場。'},   /* AA_209 附錄B §2 */
      {if:SOLO('heroine_02'),speaker:'heroine_02',expression:'embarrassed',text:'……你要不要一起？不來也沒關係啦。'},   /* AA_209 附錄B §2 */
      {if:GFO('heroine_02'),speaker:'heroine_02',expression:'smile',text:'明天我沒班。我要去看《進城的那一週》的重映，早場。方奕廷也去。……你要來嗎？'},   /* AA_209 附錄B §2（交往中的版本「店休」也改成「我沒班」）*/
      /* BB_187 1-3（AA_554 第 2 節：片名照遊戲、「店休」→「我沒班」）：和她交往中＝她約兩個人的早場；之後照兩個人的版本（數字照單身版，BB_187 沒寫另外的數字）*/
      {if:DH('heroine_02'),speaker:'heroine_02',expression:'smile',text:'明天我沒班。我要去看《進城的那一週》的重映，早場。'},
      {if:DH('heroine_02'),speaker:'heroine_02',expression:'smile',text:'一起去吧。很早喔。'},
      {choice:[{text:'「幾點？」',unless:GFO('heroine_02'),consequences:{rel:{heroine_02:{aff:6,fam:5,comf:4}},mem:[{npc:'heroine_02',tag:'IMPORTANT_CONVERSATION',note:'答應一起看《進城的那一週》'}],flags:{zhiruo_film_date:true},stamp:['zhiruoFilmDay']},goto:'yes'},
        {text:'「幾點？」',if:GFO('heroine_02'),consequences:{rel:{heroine_02:{fam:5,comf:4}},mem:[{npc:'heroine_02',tag:'IMPORTANT_CONVERSATION',note:'答應一起看《進城的那一週》（三個人）'}],flags:{zhiruo_film_date:true},stamp:['zhiruoFilmDay']},goto:'yes'},
        {text:'「早場我起不來。」',consequences:{rel:{heroine_02:{fam:1}},mem:[{npc:'heroine_02',tag:'DECLINED_INVITE',note:'看片邀約（她說下次有午場再說）'}],stamp:['zrDeclineDay']},goto:'no'},
        {text:'「我看過了。結局是——」',consequences:{rel:{heroine_02:{comf:2}}},goto:'spoil'}]},
      {label:'yes'},{speaker:'heroine_02',expression:'smile',text:'十點。公館的那間。你遲到我就自己進去。'},{goto:'end'},
      {label:'no'},{speaker:'heroine_02',expression:'neutral',text:'好。那下次有午場再說。'},{goto:'end'},
      {label:'spoil'},{speaker:'heroine_02',expression:'annoyed',text:'不准講！'},{speaker:'heroine_02',expression:'laugh',text:'好啦，那部電影沒有結局可以劇透。你這樣算答應了嗎？'},
      {unless:GFO('heroine_02'),set:{zhiruo_film_date:true},stamp:['zhiruoFilmDay'],rel:{heroine_02:{aff:4,fam:4}},mem:[{npc:'heroine_02',tag:'IMPORTANT_CONVERSATION',note:'答應一起看《進城的那一週》'}]},
      {if:GFO('heroine_02'),set:{zhiruo_film_date:true},stamp:['zhiruoFilmDay'],rel:{heroine_02:{fam:4}},mem:[{npc:'heroine_02',tag:'IMPORTANT_CONVERSATION',note:'答應一起看《進城的那一週》（三個人）'}]},{label:'end'} ] },
  /* 芷若 Z5 早場（BB_96 3-5 的新事件 ev_zhiruo_early_show；交接包 v2）：週五答應以後，週六 10:00（出遊）。2D「公館・二輪戲院」（虛構）→ 2D「豆漿店」。台詞照原文；表情 sad 改 thinking。
     單身：兩個人，記 WATCHED_FILM（方奕廷 Z6 的前置）；交往中：三個人（方奕廷），最後問「哪一個爸爸？」的是方奕廷，記 WATCHED_FILM_GROUP（不觸發 Z6）；不出 CG。
     三個「下次」記 Z5_NEXT（hers／mine／roommate；兩週內的回聲：片單、Café 點餐「你挑好了嗎？」、阿凱來 Café）。電影票根（房間物件）：BB_96 3-5c（story3d.js 的 roomItemList）；CG 候選（戲院門口，她拿著兩張票根）還沒有 */
  { id:'ev_zhiruo_early_show', title:'《進城的那一週》的早場', participants:['heroine_02'], location:'any', trigger:'outing', once:true, background:'dark', hours:3,   /* 09:40 碰面 → 約 12:40 回來（10:00～12:00 電影、豆漿店）。戲院門口碰面那一拍：BB-B c86cd8cf（BCG-21 cg_two_tickets_heroine02）*/
    dialogue:[ {scene:'公館・二輪戲院',bg:'gongguan_cinema'},
      {unless:GFO('heroine_02'),speaker:null,text:'九點四十，巷子裡的二輪戲院。她已經到了。'},{unless:GFO('heroine_02'),cg:'cg_two_tickets_heroine02'},   /* BB_187 1-3：和她交往中走兩個人的版本（BCG-21 照放、記 WATCHED_FILM）*/
      {unless:GFO('heroine_02'),speaker:'heroine_02',expression:'smile',text:'（把兩張票舉到臉旁邊）早。票我先買了。'},{unless:GFO('heroine_02'),speaker:'heroine_02',expression:'smile',text:'早場的人比較少。我喜歡。'},
      {if:GFO('heroine_02'),speaker:'heroine_02',expression:'neutral',text:'（看了一下手錶）方奕廷已經進去了。他坐倒數第三排。我教的。'},   /* 戲院門口碰面那一拍（BB_96 3-5，BB-B c86cd8cf）：雙方單身＝BCG-21 疊在這一拍；交往中三個人、不出 CG */
      {scene:'豆漿店',bg:'soymilk_shop'},
      {speaker:'heroine_02',expression:'thinking',text:'我每次看都在想，那個媽媽進城看小孩，大家都很忙。'},
      {speaker:'heroine_02',expression:'thinking',text:'最後對她最好的，是一個不是她小孩的人。'},
      {speaker:'heroine_02',expression:'thinking',text:'……我在想，我媽會不會也是這樣。'},
      {speaker:'heroine_02',expression:'thinking',text:'我在台北，對每個客人都很好。'},
      {speaker:'heroine_02',expression:'smile',text:'（喝豆漿）好了，太沉重了。'},
      {speaker:'heroine_02',expression:'smile',text:'你覺得那個老闆，像不像演爸爸的那個演員？'},
      {unless:GFO('heroine_02'),speaker:'player',text:'誰？'},
      {if:GFO('heroine_02'),speaker:'npc_fangyt',expression:'neutral',text:'哪一個爸爸？'},
      {speaker:'heroine_02',expression:'smile',text:'沒事。下次帶你看別部。'},
      /* BB_187 1-3：和她交往中拿掉「我下次帶我室友來。」，換成「下次我早一點到，買票。」（Z5_NEXT 'early'：沒有回聲）*/
      {choice:[{text:'「下次妳挑。」',set:{Z5_NEXT:'hers'},goto:'h'},{text:'「下次我挑。」',set:{Z5_NEXT:'mine'},goto:'m'},{text:'「我下次帶我室友來。」',unless:DH('heroine_02'),set:{Z5_NEXT:'roommate'},goto:'r'},{text:'「下次我早一點到，買票。」',if:DH('heroine_02'),set:{Z5_NEXT:'early'},goto:'e'}]},
      {label:'h'},{speaker:'heroine_02',expression:'smile',text:'好。我列一張表給你。很長。'},{goto:'end'},
      {label:'m'},{speaker:'heroine_02',expression:'laugh',text:'你？你看過幾部電影？'},{speaker:null,text:'她笑。'},{speaker:'heroine_02',expression:'smile',text:'好，你挑。我不笑你。大概。'},{goto:'end'},
      {label:'e'},{speaker:'heroine_02',expression:'smile',text:'好。……我今天其實八點就到了。'},{goto:'end'},
      {label:'r'},{speaker:'heroine_02',expression:'neutral',text:'……好。'},
      {label:'end'} ],
    after:G=>{ G.flags.zhiruoFilmSeenDay=G.day; if(typeof SOCIAL==='undefined') return; const d=GFN(G,'heroine_02')&&!DHN(G,'heroine_02'); SOCIAL.remember('heroine_02',d?'WATCHED_FILM_GROUP':'WATCHED_FILM',d?'《進城的那一週》的早場（三個人）':'《進城的那一週》的早場'); } },
  /* Z5 的回聲「我下次帶我室友來」（BB_96 3-5）：早場之後兩週內走進 Café，阿凱真的來了一次（只一次）*/
  { id:'ev_kai_cafe_film', title:'聽說這裡有電影', participants:['kai','heroine_02'], location:'cafe', trigger:'enter', once:true, background:'blur',
    prereq:{custom:G=>G.flags.Z5_NEXT==='roommate'&&G.flags.zhiruoFilmSeenDay!=null&&G.day>G.flags.zhiruoFilmSeenDay&&G.day-G.flags.zhiruoFilmSeenDay<=14},
    dialogue:[ {speaker:'kai',expression:'neutral',text:'聽說這裡有電影。'},{speaker:'heroine_02',expression:'neutral',text:'……這裡是咖啡廳。'} ] },
  /* 芷若的午場（BB_96 3-5b，BB-B 2026-10-16 補；Z5 被拒絕的後續）：Z5 選「早場我起不來。」（zrDeclineDay）之後第 3 週的週六 09:30 她傳訊息（story3d.js），「起得來。」＝11:40 公館二輪戲院（出遊）。
     散場（13:30，和 Z5 共用背景）兩個選項：「那下午要做什麼？」comf 3／「下次我早場起得來。」trust 3、ZR_EARLY_PROMISE（大二 Z7 的回聲）。
     單身：WATCHED_FILM（同 Z5 兩人版：Z6、BB_113 照樣出現）＋aff 3；交往中、她也知道（同 Z5 讀 knowsGF）：三個人、WATCHED_FILM_GROUP。ZR_MATINEE_SEEN＝房間的票根是午場那一張 */
  { id:'ev_zhiruo_matinee', title:'《父親的午後》的午場', participants:['heroine_02'], location:'any', trigger:'outing', once:true, background:'dark', hours:2.5,   /* 11:40 開演 → 13:30 散場 → 走到溫州街約 14:00 */
    dialogue:[ {scene:'公館・二輪戲院',bg:'gongguan_cinema'},
      {speaker:null,text:'散場的時候，外面還是白天。'},
      {if:GFO('heroine_02'),speaker:'npc_fangyt',text:'午場出來太陽還在。我每次都覺得被騙。'},{if:GFO('heroine_02'),speaker:'heroine_02',expression:'smile',text:'……我也是。'},   /* BB_187 1-3：和她交往中的午場是兩個人的版本（GFO）*/
      {speaker:'heroine_02',expression:'thinking',text:'（瞇起眼睛）午場最可惜的就是這個。'},
      {speaker:'heroine_02',expression:'thinking',text:'演了兩個小時，出來太陽還是一樣大。'},
      {speaker:'heroine_02',expression:'smile',text:'可是也有好處。看完，還有一整個下午。'},
      {choice:[{text:'「那下午要做什麼？」',consequences:{rel:{heroine_02:{comf:3}}},goto:'a'},{text:'「下次我早場起得來。」',consequences:{rel:{heroine_02:{trust:3}},flags:{ZR_EARLY_PROMISE:true}},goto:'b'}]},
      {label:'a'},{speaker:'heroine_02',expression:'smile',text:'我兩點要去溫州街。……還有半小時。你決定。'},
      {unless:GFO('heroine_02'),speaker:null,text:'你們沿著新生南路慢慢走到溫州街。她一路在講剛剛那個父親說的話，講到一半停下來。'},
      {if:GFO('heroine_02'),speaker:null,text:'你們三個人走到溫州街。她一路在講剛剛那個父親說的話，講到一半停下來。'},
      {speaker:'heroine_02',expression:'laugh',text:'……我講太多了。'},{goto:'end'},
      {label:'b'},{speaker:'heroine_02',expression:'smile',text:'真的？那下次是早場。你說的，我記下來了。'},
      {label:'end'},{speaker:'heroine_02',expression:'smile',text:'今天這部，叫《父親的午後》。你不用記片名。記得是午場就好。'},{set:{ZR_MATINEE_SEEN:true}} ],
    after:G=>{ if(typeof SOCIAL==='undefined') return; const d=!!GFN(G,'heroine_02')&&!DHN(G,'heroine_02'); SOCIAL.remember('heroine_02',d?'WATCHED_FILM_GROUP':'WATCHED_FILM',d?'《父親的午後》的午場（三個人）':'《父親的午後》的午場'); if(!d) SOCIAL.adjust('heroine_02',{aff:3}); } },
  /* 方奕廷 Z6「隔壁房的人記得的事」（BB_96 3-6；交接包 v2）：大一下第 13～15 週（AA_243 #50：16 週制）平日 12–13 在校園找他說話；前置 WATCHED_FILM（兩個人看的那一版）、玩家沒有在交往、只一次。記 FANG_HINT */
  { id:'ev_fangyt_hint', title:'隔壁房的人記得的事', participants:['npc_fangyt'], location:'campus', trigger:'interact', priority:7, once:true, term:['Y1S2'], weeks:[13,14,15], weekday:[1,2,3,4,5], time:[12,13], background:'blur',
    prereq:{memory:[{npc:'heroine_02',tag:'WATCHED_FILM'}],custom:G=>!GFN(G,'heroine_02')&&!DHN(G,'heroine_02')},   /* BB_187 1-4：和她交往中不觸發（方奕廷看得出來她有男友）；改成摘要日方奕廷的一則（src/aa554_3d.js）*/
    dialogue:[ {speaker:'npc_fangyt',expression:'neutral',text:'你最近常去兩點半喔？'},   /* AA_209 2-1 第 4 列（BB_180；取代 AA_209 第 2 節和附錄 B 的版本）*/
      {speaker:'npc_fangyt',expression:'neutral',text:'我跟芷若高中同校。她那時候就常一個人去看二輪。'},
      {speaker:'npc_fangyt',expression:'neutral',text:'好，我先去上課了。'},
      {mem:[{npc:'npc_fangyt',tag:'FANG_HINT',note:''}]} ] },
  /* 芷若 Z7「23:59」（BB_97 3-4，2026-10-16 18:2x 最終版：使用者「不要出現『交了』沒有上下文的台詞」；V3-B18）：外文系交換申請截止 2026-12-10（四）（AA-B b95cea49）。
     那晚 23:59 她私訊三則（英國那一間、十一點五十九分、下次你來店裡再說；story3d.js；祐廷有伴侶而且她知道＝沒有這三則，AA_112 8-1）。
     截止之後第一次走進 Café 就演，到大二上結束（第 16 週）都可以（原本七天）；開頭分「收到深夜訊息／沒收到」兩版。「妳跟妳媽說了嗎？」＝當晚 22:15 再一則（所以只在 22:00 以前演）。
     大二上結束都沒去：寒假第一天 21:00 一則；之後 Z7b（1/28，story3d.js）。之後 ev_zhiruo_bell 的「妳的交換申請交了嗎？」不再出現 */
  { id:'ev_zhiruo_applied', title:'她交件了', participants:['heroine_02'], location:'cafe', trigger:'auto', priority:9, once:true, term:['Y2S1'], time:[11,22], background:'blur',
    prereq:{events:['ev_zhiruo_secret'],memory:[{npc:'heroine_02',tag:'SHARED_SECRET'}],custom:G=>{ if(typeof STORY==='undefined'||!STORY.dayOfKey) return false; const d=STORY.dayOfKey('2026-12-10'); return d!=null&&G.day>d; }},
    spawn:{npc:'heroine_02',dist:1.6,pose:'idle'},
    dialogue:[ /* BB_189 2-1（AA_554 核過）：和她交往中、12/10 23:50 她打來的那通電話接了（ZR_Z7_CALL 'took'，src/aa554_3d.js）＝開頭換兩句（「十一點五十九分」「手在抖」電話裡講過了）；
                 沒接到那通（她改傳原本的三則）＝照原本的開頭 */
      {if:{custom:G=>G.flags.ZR_Z7_CALL==='took'},speaker:'heroine_02',expression:'neutral',text:'（看到你，放下手上的杯子）那天晚上……電話講到幾點，你記得嗎？'},
      {if:{custom:G=>G.flags.ZR_Z7_CALL==='took'},goto:'z7d'},
      {if:{custom:G=>!!(G.msgs&&G.msgs.some(m=>m.tag==='zr_z7_msg'))},speaker:'heroine_02',expression:'neutral',text:'（看到你，放下手上的杯子）那天晚上那則，你看到了吧。'},
      {unless:{custom:G=>!!(G.msgs&&G.msgs.some(m=>m.tag==='zr_z7_msg'))},speaker:'heroine_02',expression:'neutral',text:'（看到你，放下手上的杯子）交換申請，我交了。截止那天晚上，英國那一間。'},
      {speaker:'heroine_02',expression:'serious',text:'十一點五十九分。我差一分鐘，就不交了。'},
      {speaker:'heroine_02',expression:'embarrassed',text:'交完手在抖，抖到十二點半。'},
      {label:'z7d'},
      {speaker:'heroine_02',expression:'thinking',text:'如果沒錄取，就永遠不用跟我媽說。……很膽小吧。'},
      {choice:[{text:'「不會。」',consequences:{rel:{heroine_02:{trust:5,comf:2}},mem:[{npc:'heroine_02',tag:'IMPORTANT_CONVERSATION',note:'她交了交換申請，你說「不會」'}]},goto:'no'},
        {text:'「妳跟妳媽說了嗎？」',set:{ZR_Z7_MOM:true},consequences:{rel:{heroine_02:{trust:4,comf:2}},mem:[{npc:'heroine_02',tag:'IMPORTANT_CONVERSATION',note:'她交了交換申請，你問她跟媽媽說了沒'}]},goto:'mom'},
        {text:'「妳那時候說的家裡……」',if:{flagIs:{Z4_PICK:'family'}},consequences:{rel:{heroine_02:{trust:6}},mem:[{npc:'heroine_02',tag:'IMPORTANT_CONVERSATION',note:'她交了交換申請：她算過時差，媽媽十點打來接得到'}]},goto:'fam'}]},
      {label:'no'},{if:{custom:G=>!DHN(G,'heroine_02')&&!(typeof ROM!=='undefined'&&ROM.knows(G,'heroine_02').length>0)},speaker:'heroine_02',expression:'embarrassed',text:'……你說的喔。'},
        {if:{custom:G=>!DHN(G,'heroine_02')&&typeof ROM!=='undefined'&&ROM.knows(G,'heroine_02').length>0},speaker:'heroine_02',expression:'smile',text:'……嗯。謝謝。'},
        {if:DH('heroine_02'),speaker:'heroine_02',expression:'smile',text:'你每次都這樣講。好啦，謝謝。'},{goto:'end'},   /* BB_189 2-1 和她交往中（AA_230 Z-21）；「妳跟妳媽說了嗎？」、Z4 選過家裡＝原文照用（當晚 22:15 那則和她交往中多一句：story3d.js）*/
      {label:'mom'},{speaker:'heroine_02',expression:'neutral',text:'還沒。今天十點，她會打來。'},{goto:'end'},
      {label:'fam'},{speaker:'heroine_02',expression:'neutral',text:'你那時候說家裡比較重要。'},{speaker:'heroine_02',expression:'neutral',text:'我後來算了一下。她十點打來，英國那邊是下午兩、三點。'},{speaker:'heroine_02',expression:'smile',text:'我那個時間沒課。……接得到。'},   /* AA_360 第 3 節（第②級，採 BB_167 E1）：她自己去算時差，回答 Z4「她十點要打給誰」；「兩、三點」＝英國冬天、夏天差一小時（她在那邊一整年）。原本兩句「……我想了很久。」「後來我發現，我就是家裡的一部分。我去，家也跟著我去。」作廢 */
      {label:'end'},
      /* BB_189 2-1「多一段」：和她交往中（她自己的人生大事，祐廷不替她決定）。「對。」「那就每天來兩次。」照表格是祐廷接話 */
      {unless:DH('heroine_02'),goto:'end2'},
      {speaker:'heroine_02',expression:'thinking',text:'……如果錄取，明年九月我就不在了。一學期。'},
      {choice:[{text:'「一學期而已。」',goto:'zs1'},{text:'「我會寫信給妳。」',goto:'zs2'},{text:'「那這學期我多來店裡。」',goto:'zs3'}]},
      {label:'zs1'},{speaker:'heroine_02',expression:'neutral',text:'嗯。……一學期而已。'},{speaker:null,text:'她重複了一次，像是在練習。'},{goto:'end2'},
      {label:'zs2'},{speaker:'heroine_02',expression:'surprised',text:'真的信？要貼郵票的那種？'},{speaker:'player',text:'對。'},{speaker:'heroine_02',expression:'smile',text:'好。那我回明信片。'},{goto:'end2'},
      {label:'zs3'},{speaker:'heroine_02',expression:'laugh',text:'你已經每天來了。'},{speaker:'player',text:'那就每天來兩次。'},{speaker:'heroine_02',expression:'smile',text:'老闆會以為你是股東。'},
      {label:'end2'},{speaker:'heroine_02',expression:'smile',text:'今天的咖啡我請。'} ],
    consequences:{stamp:['zrAppliedDay']} },
  // ── 語彤 arc ──
  { id:'ev_yutong_customer', retired:true, title:'麵店的糾紛',   /* retired：AA_624 拿掉「客人說要告」（企劃線 ace533a43）；舊存檔演過的照留 */ participants:['heroine_03'], location:'noodle', trigger:'interact', priority:9, once:true, minWeek:{term:'Y1S1',week:15}, term:['Y1S1','Y1S2'],   /* 只在大一（大一上第 15 週～大一下第 16 週；AA_140 G47 AA-B 裁定：沒觸發就不演，大二的事件 7 不依賴它）*/   /* 交接包 v1 A6 的週次：第 15 週起（v1 稽核：原本沒有下限）*/ prereq:{memory:[{npc:'heroine_03',tag:'SHARED_MEAL'}],custom:G=>{ if(typeof STORY==='undefined'||!STORY.fafuSat) return true; const f=STORY.fafuSat(G.day); return !!f&&f.wk<=1; }}, background:'blur',   /* AA-B 2026-10-16（G47 邊界）：下一個法服值班的週六在這週或下週才演；更遠（例如期中考週、寒假前）就先等，等到值班週六進到兩週內 */
    /* 語彤事件 3 改寫版（AA_11 事件 3；交接包 v1 第 1 節，2026-10-14）：大一的祐廷誠實地「不知道」。不出任何法律題目、不給錄音證據的法律結論。
       選「我知道誰會知道」：祐廷第一次私訊學姊（yutongAskSisDay），學姊當晚 22:30 回（BB_95 4-3），截圖轉給語彤：「……法服是什麼？」（大二她加入法服的伏筆；story3d.js 的 phoneRules）。
       裝懂：她記得（BLUFFED；大二第一次在麵店會問「這次你會說不知道嗎？」——AA_236 A4：語彤不加入法服）。結果三種都一樣：阿姨週六去了法服（ev_yutong_customer_after）*/
    dialogue:[ {speaker:'heroine_03',expression:'serious',text:'……你是法律系的，我問你一件事。'},{speaker:'heroine_03',expression:'neutral',text:'上週有客人說他在我們店吃壞肚子，要我阿姨賠三萬。'},{speaker:'heroine_03',expression:'neutral',text:'他還錄了跟我阿姨吵架的聲音，說要拿去告。'},{speaker:'heroine_03',expression:'thinking',text:'我阿姨嚇到睡不著。那個錄音……他自己偷錄的，可以用嗎？'},
      {choice:[{text:'「我不知道。我才大一。但我知道誰會知道。」',consequences:{rel:{heroine_03:{trust:8,resp:5,fam:4}},mem:[{npc:'heroine_03',tag:'HELPED',note:'幫阿姨問了法服的學姊'}],stamp:['yutongAskSisDay']},goto:'know'},{text:'「這種人通常只是嚇人。」',consequences:{rel:{heroine_03:{fam:3,trust:2}},mem:[{npc:'heroine_03',tag:'HELPED',note:'說客人只是嚇人'}]},goto:'scare'},{text:'「我覺得不能用吧……」',consequences:{rel:{heroine_03:{fam:2,trust:2}},mem:[{npc:'heroine_03',tag:'BLUFFED',note:'錄音的事裝懂，被她看出來'}]},goto:'bluff'}]},
      {label:'know'},{speaker:null,text:'你拿出手機，傳訊息給溫學姊。'},{goto:'end'},
      {label:'scare'},{speaker:'heroine_03',expression:'neutral',text:'嗯。我阿姨也這樣說。可是她還是睡不著。'},{goto:'end'},
      {label:'bluff'},{speaker:null,text:'語彤看了你三秒。'},{speaker:'heroine_03',expression:'serious',text:'你剛剛停頓了。'},{speaker:'player',text:'……對，我不知道。'},{speaker:'heroine_03',expression:'neutral',text:'嗯。那你一開始就說不知道就好。'},
      {label:'end'},{speaker:'heroine_03',expression:'smile',text:'今天的麵不用錢。阿姨問的話，我就說你洗了碗。'} ], consequences:{money:0,stamp:['yutongCustomerDay']} },
  /* 語彤事件 3 之後：學姊的回覆，在麵店當面給她看（沒有她的聯絡方式時；有的話是手機截圖，story3d.js 的 phoneRules）*/
  { id:'ev_yutong_fwd', retired:'AA_661 第 16 列（AA_624）：語彤事件 3 已經拿掉（她不在麵店）——這一場不演，定義留給舊存檔', title:'學姊的回覆', participants:['heroine_03'], location:'noodle', trigger:'interact', priority:10, once:true, prereq:{flags:['yutongFwdInPerson']}, background:'blur',
    dialogue:[ {speaker:null,text:'你把學姊的回覆給語彤看。'},{speaker:'heroine_03',expression:'thinking',text:'……法服是什麼？'} ] },
  /* 語彤事件 3 的結果（AA_11：三種選擇都一樣）：那一週的週三之後，第一次走進麵店 */
  { id:'ev_yutong_customer_after', title:'阿姨去了法服', participants:[], location:'noodle', trigger:'enter', once:true, prereq:{events:['ev_yutong_customer'],custom:G=>{ const d=G.flags.yutongCustomerDay; if(d==null||typeof CALENDAR==='undefined') return false; const f=typeof STORY!=='undefined'&&STORY.fafuSat?STORY.fafuSat(d):null, w=CALENDAR.dateOf(d).wd%7, sat=f?f.day:d+(((6-w)+7)%7||7); return G.day>sat; }}   /* 法服方案 A（AA_132 F2，使用者 2026-10-15）：阿姨「那個週六早上」去了法服——之後才出現（原本週三）。G47：是下一個「值班的」週六（單週、第 3 週起、考試週停）*/, background:'freeze',
    dialogue:[ {speaker:null,text:'阿姨那個週六早上去了法服。值班的學長姐幫她把那天的進貨單、發票、監視器的時間整理好。'},{speaker:null,text:'客人看到阿姨準備得這麼齊，就沒有再來了。'} ] },
  /* 博雅小桌的常客（AA_178 ⑤；AA_115 L77、L93）：大一下第 11～12 週，這兩週內第三天在博雅小桌坐下，鄰座不具名的常客一句；只一次、不記旗標 */
  { id:'ev_y1_boya_regular', title:'你又在這裡', participants:[], location:'boya', trigger:'seat', seatRoom:'study', term:['Y1S2'], weeks:[11,12], once:true, background:'blur',
    prereq:{custom:G=>{ const S=typeof STORY!=='undefined'?STORY:null, a=S&&S.termDay?S.termDay('Y1S2',11,1):null; if(a==null) return false; const H=G.habits&&G.habits['seat:boya:study']; return !!H&&(H.days||[]).filter(d=>d>=a&&d<=a+13).length>=3; }},
    dialogue:[ {speaker:'鄰座的常客',text:'你又在這裡。'} ] },
  { id:'ev_yutong_absent', retired:true, title:'她今天沒來', term:['Y1S2'], weeks:[8,9], participants:['heroine_03'],   /* retired：AA_624 拿掉「阿姨扭到手」（事件 4 改成茶屋的班她沒來，台詞 AA_625 再補）*/   /* 交接包 v2（AA_11 事件 4）：大一下期中這兩週的週二、週四晚上；原因改輕＝阿姨扭到手腕（旗標名 yutong_hospital 不改，相容）；AA_178 ①：阿姨兩句的說話人＝阿姨、只在大一下 */ location:'noodle', trigger:'enter', weekday:[2,4], time:[17.5,20.5], once:true, day_min:8, prereq:{memory:[{npc:'heroine_03',tag:'TALKED_FAMILY'}]}, background:'freeze',
    dialogue:[ {speaker:null,text:'櫃台後面沒有語彤。阿姨右手包著護腕，用左手撈麵。'},{speaker:'阿姨',text:'手扭到了，這禮拜都是她在顧，顧到打烊。今天我叫她先回去睡。'},{unless:{flags:['dating_heroine_03']},speaker:'阿姨',text:'你是她同學喔？她喔，累了也不會講。'},/* AA_209 附錄A §2 */
      {if:{flags:['dating_heroine_03']},speaker:'阿姨',text:'（看了你一下）你是語彤那個喔。'},{if:{flags:['dating_heroine_03']},speaker:'阿姨',text:'她沒跟你講齁。她說講了你一定會跑來幫忙。'},{if:{flags:['dating_heroine_03']},speaker:'阿姨',text:'你吃你的。她問的話，就說你自己看到的。'},   /* AA_313 4-4（「不要跟別人說」模板的變形）*/{if:{flags:['dating_heroine_03']},set:{YT_AUNT_KNOWS:true}},   /* 阿姨知道（1B-03 事件 9 讀，AA_316）*/   /* 交往中的版本（AA_11 事件 4，AA-C 2026-10-17 e2bdcece；AA_215／AA_216 大一下 #3：大一就可能交往）*/
      {set:{yutong_hospital:true}},{unless:{flags:['dating_heroine_03']},mem:[{npc:'heroine_03',tag:'IMPORTANT_CONVERSATION',note:'阿姨扭到手腕，那週她顧店到打烊'}]},{if:{flags:['dating_heroine_03']},mem:[{npc:'heroine_03',tag:'IMPORTANT_CONVERSATION',note:'阿姨扭到手腕，那週她顧店到打烊；阿姨說她怕你來幫忙'}]} ] },
  { id:'ev_yutong_thanks', title:'圖書館三樓', term:['Y1S2'], participants:['heroine_03'],   /* 交接包 v1：大一下以後才觸發（AA_11 事件 5 延後）；AA_259 第 4 節第 4 點：收到大二上，不要大三才觸發；AA_374 第 9 項：只在大一下（大二上用現在式講不對）、和 ev_yutong_midterm_week 互斥 */ location:'library', trigger:'interact', priority:9, once:true, prereq:{notEvents:['ev_yutong_midterm_week'],custom:G=>{ const F=G.flags||{}, h=((+G.hour||0)%24+24)%24;
      if(F.YT_JOB_V){ const t=typeof CALENDAR!=='undefined'&&CALENDAR.termOf(G.day), wd=typeof CALENDAR!=='undefined'?CALENDAR.dateOf(G.day).wd%7:-1; return !!F.YT_PARENTS_KNOW&&!!t&&t.id==='Y1S2'&&t.week>=10&&(wd===6||wd===0)&&h>=17.5&&h<19; }   /* AA_643 第 9-1 節（YT-REWRITE-1103）：新遊戲＝新稿——大一下第 10 週以後、週末 17:30～19:00、總圖三樓靠窗、要 YT_PARENTS_KNOW（作息在 characters.js）*/
      return !!F.yutong_hospital&&h>=21&&h<22; }}, background:'blur',   /* 舊存檔（沒有 YT_JOB_V）照原本：阿姨扭到手那一版、21:00～22:00 */   /* AA_624（ace533a43）：阿姨扭到手那條線新遊戲沒有＝YT_JOB_V（這一版的新遊戲）不演，舊存檔照舊 */   /* AA_178 ②＋AA_177：麵店 21:00 打烊以後、總圖閉館以前（「店收了才來的」）*/
    dialogue:[ {if:{flags:['YT_JOB_V']},goto:'v3'},   /* AA_643 第 9-1 節的新稿在最後 */
      {speaker:null,text:'（她看到你，闔上書，指了指外面。）'},{speaker:null,text:'（你們走到樓梯間。）',libOut:true},   /* libOut（AA_595 1-B13；AA 11-02 22:30 定稿）*/
      {speaker:'heroine_03',expression:'tired',text:'……阿姨跟你講了吧。'},{if:{flags:['dating_heroine_03']},speaker:'heroine_03',expression:'neutral',text:'我叫她不要講的。'},{speaker:'heroine_03',expression:'neutral',text:'她每次都這樣。沒事，手腕扭到而已。'},{choice:[{text:'（什麼都不問，把自己的筆記推過去）',consequences:{rel:{heroine_03:{comf:8,trust:5,aff:3}},mem:[{npc:'heroine_03',tag:'HELPED',note:'什麼都沒問，把筆記給她'}]},goto:'notes'},{text:'「妳可以講。講完就算了。」',consequences:{rel:{heroine_03:{trust:6,comf:3}},mem:[{npc:'heroine_03',tag:'TALKED_FAMILY',note:'你說她可以講'}]},goto:'talk'},{text:'「妳看起來很累，回去睡吧。」',consequences:{rel:{heroine_03:{comf:2}}},goto:'sleep'}]},{label:'notes'},{speaker:'heroine_03',expression:'surprised',text:'……'},{speaker:null,text:'（她看了一下，把筆記拉到自己面前。）'},{speaker:'heroine_03',expression:'smile',text:'這頁我抄一下就還你。'},/* AA_209 附錄A §2 */{goto:'end'},{label:'talk'},{speaker:'heroine_03',expression:'sad',text:'講了也沒用啦，她的手又不會比較快好。'},/* AA_209 附錄A §2 */{goto:'end'},{label:'sleep'},{speaker:'heroine_03',expression:'neutral',text:'店收了才來的。這裡比較安靜。'},{label:'end'},
      {if:{flags:['dating_heroine_03']},speaker:null,text:'（她把書推到一邊，趴在桌上。）'},{if:{flags:['dating_heroine_03']},speaker:null,text:'（她趴在桌上，指了指手錶。）'},{end:true},
      /* ---- AA_643 第 9-1 節（企劃線 4862b7139，AA 定稿）：取代舊的「阿姨扭到手腕」那一段 ---- */
      {label:'v3'},{speaker:null,text:'（總圖三樓靠窗。語彤桌上攤著兩本書，一本社會學，一本民法總則。茶屋的圍裙還塞在包包旁邊。）'},
      {speaker:'heroine_03',text:'下班才來的。三樓比較安靜。'},{speaker:'heroine_03',text:'我跟我媽說，成績不會掉。掉了我就不做。'},{speaker:'heroine_03',text:'所以我要念。'},
      {choice:[{text:'「要不要我幫妳看民總？」',goto:'v3a'},{text:'「妳不會掉的。」',goto:'v3b'},{text:'「（坐到她對面，打開自己的書。）」',goto:'v3c'}]},
      {label:'v3a'},{speaker:'heroine_03',text:'好。……意思表示那一章，我看了三遍。'},{set:{YT_STUDY_TOGETHER_HINT:true}},{goto:'v3e'},
      {label:'v3b'},{speaker:'heroine_03',text:'……謝謝。可是我還是要念。'},{goto:'v3e'},
      {label:'v3c'},{speaker:null,text:'（她看了你一眼，沒說話，把檯燈往中間推了一點。）'},
      {label:'v3e'},{speaker:'heroine_03',text:'那天你都沒問我媽的事。'},{speaker:null,text:'（她說完，低頭把你那本講義翻到下一頁。）'},{mem:[{npc:'heroine_03',tag:'TALKED_FAMILY',note:'她說成績不會掉，掉了就不做'}]} ] },   /* AA_595 1-B13 結尾：原本「閉館的時候叫我。」改旁白 */   /* 交往中的版本（AA_11 事件 5，AA-C e2bdcece；AA_216 大一下 #4）*/
  // ── 子晴 arc ──
  { id:'ev_ziqing_gongguan_night', title:'公館的晚上', participants:['heroine_04'], location:'gongguan', trigger:'interact', priority:6, once:true, time:[21,25], term:['Y1S1','Y1S2'], prereq:{memory:[{npc:'heroine_04',tag:'FIRST_MET'}]}, background:'blur',   /* AA_207 §6（AA-B 2026-10-23）：開場「你怎麼這麼晚還在公館？」（原本問他明天是不是有課那一句；「欸不是」每學期合計上限 2，所以不加）。Q3（BB_95 2-7；BB-B 75c1b2b1）：整個事件只一次，之後宵夜不再有拍照 */
    dialogue:[ {speaker:'heroine_04',expression:'laugh',text:'你怎麼這麼晚還在公館？'},{speaker:'heroine_04',expression:'smile',text:'我剛從網咖出來，打了三小時。你室友還活著嗎？他三天沒回訊息。'},{choice:[{text:'「活著。在追 bug。」',consequences:{rel:{heroine_04:{fam:3,comf:2},kai:{fam:1}}}},{text:'「妳們資工系的都不睡覺？」',consequences:{rel:{heroine_04:{fam:3}}},goto:'sleep'},{text:'「要不要吃宵夜？」',if:{stage:{npc:'heroine_04',min:'FAMILIAR'}},consequences:{rel:{heroine_04:{fam:4,comf:4}},mem:[{npc:'heroine_04',tag:'SHARED_MEAL',note:'公館宵夜'}],money:-80,energy:8,advance:0.6},goto:'food'}]},{goto:'end'},{label:'sleep'},{speaker:'heroine_04',expression:'laugh',text:'睡覺是弱者的行為。……我下午睡了四小時。'},{goto:'end'},{label:'food'},{if:{flags:['dating_kexin']},speaker:'heroine_04',expression:'smile',text:'滷味。走。阿凱也在，他在排隊。'},{unless:{flags:['dating_kexin']},speaker:'heroine_04',expression:'smile',text:'滷味。走。巷子裡那家開到兩點。'},{speaker:null,text:'她點的東西是你的三倍。'},{unless:{flags:['ZIQING_MAKING_SOMETHING']},goto:'photo'},{goto:'end'},{label:'photo'},{speaker:null,text:'滷味點完，她拿手機拍了一張照片。'},{speaker:'player',text:'拍什麼？'},{speaker:'heroine_04',expression:'neutral',text:'素材。我在做一個東西。……你不要問。'},{speaker:'heroine_04',expression:'thinking',text:'（三秒後）你可以問一點點。'},{speaker:'heroine_04',expression:'embarrassed',text:'……不行，還是不要問。'},{if:{flags:['dating_kexin']},speaker:'kai',expression:'smile',text:'她每次都拍，從來不給看。'},{set:{ZIQING_MAKING_SOMETHING:true}},{label:'end'} ] },   /* BB_95 2-7：交往中（AA_112 8-1：不放兩個人單獨的夜晚約會型場面）阿凱也在、三個人一起吃；拍照只一次（ZIQING_MAKING_SOMETHING，大一下 Q6 的伏筆）*/
  /* 子晴 Q6「測試我的遊戲。現在。」（BB_96 4-2 改門檻與台詞，交接包 v2）：原本前置要 FRIEND，沒有事件會讓她到朋友，永遠走不到 →
     Q4（CONTEST_DAY）或 Q5（CLAPPED）任一發生過＋有點熟以上；大一下第 11 週以後、週一三晚上吉他社的時段（萬才館；交往中的玩家也是社課時段，旁邊還有社員）。
     Q4 沒遇到的玩家，Q5（第 14 週成發）之後才會有。記 PLAYTESTED（新）；第三個選項 FIRST_BUG（第 5 節「插座修好了」）。表情 serious → laugh（第一次 embarrassed 留給 Q5）。
     id 不改：舊存檔演過的不再演。好感數字、所有玩家都在社課時段、找插座的三句旁白：BB b395706（2026-10-14 補）*/
  { id:'ev_ziqing_secret_game', title:'她在做的東西', participants:['heroine_04'], location:'wancai', trigger:'interact', priority:9, once:true, term:['Y1S2'], weeks:[11,12,13,14,15], weekday:[1,3], time:[19,21],
    prereq:{stage:{npc:'heroine_04',min:'FAMILIAR'},custom:G=>typeof SOCIAL!=='undefined'&&(SOCIAL.has('heroine_04','CONTEST_DAY')||SOCIAL.has('heroine_04','CLAPPED'))}, background:'blur',
    dialogue:[ {if:{memory:[{npc:'heroine_04',tag:'HEARD_HER_SONG'}]},speaker:'heroine_04',expression:'neutral',text:'宜蘭那首，我寫完了一半。'},   /* AA_619 3-1（企劃線 bf0efded8）：宜蘭社遊在民宿頂樓聽過她的歌（記憶 HEARD_HER_SONG，src/guitar3d.js）的玩家，開頭多這一句 */
      {speaker:'heroine_04',expression:'serious',text:'（把筆電轉過來）欸，你幫我玩一下，現在。'},{speaker:'heroine_04',expression:'serious',text:'一隻在校園裡找插座的貓，我做半年了。'},{unless:DH('heroine_04'),speaker:'heroine_04',expression:'neutral',text:'還沒給別人玩過。阿凱看過，可是他是工程師，不算。'},   /* AA_209 附錄B §2 */
      /* BB_187 2-2（AA_554 核過）：和她交往中，第三句換兩句（表情不用 embarrassed：第一次留給 Q5，tests/v2_batch1_unit.js）*/
      {if:DH('heroine_04'),speaker:'heroine_04',expression:'neutral',text:'沒有人知道。……除了阿凱。他是工程師，不算。'},{if:DH('heroine_04'),speaker:'heroine_04',expression:'neutral',text:'還有你。你現在都知道了，也不算客人了。'},
      {speaker:null,text:'（你接過筆電。一隻灰白色的小貓，脖子掛著一支沒電的手機。）'},{speaker:null,text:'（你點了三個地方：文學院的走廊、法律系館A的穿堂、總圖二樓靠窗那排。）'},{speaker:null,text:'（最後一個插座，貓坐下來，手機上的電池滿了。剛好三十秒。）'},
      {choice:[{text:'「貓為什麼要找插座？」',consequences:{rel:{heroine_04:{fam:5,comf:5,aff:3}},mem:[{npc:'heroine_04',tag:'PLAYTESTED',note:''}]},goto:'cat'},
        {text:'「這比比賽有用多了。」',if:{custom:G=>typeof SOCIAL!=='undefined'&&(SOCIAL.has('heroine_04','ARGUED_ABOUT_CAREER')||SOCIAL.has('heroine_04','CONTEST_DAY'))},consequences:{rel:{heroine_04:{trust:5,aff:4}},mem:[{npc:'heroine_04',tag:'PLAYTESTED',note:''}]},goto:'better'},
        {text:'「這比我想的好玩。」',unless:{custom:G=>typeof SOCIAL!=='undefined'&&(SOCIAL.has('heroine_04','ARGUED_ABOUT_CAREER')||SOCIAL.has('heroine_04','CONTEST_DAY'))},consequences:{rel:{heroine_04:{trust:5,aff:4}},mem:[{npc:'heroine_04',tag:'PLAYTESTED',note:''}]},goto:'better'},
        {text:'「總圖二樓靠窗那排的插座是壞的。」',consequences:{rel:{heroine_04:{trust:6,resp:5}},mem:[{npc:'heroine_04',tag:'PLAYTESTED',note:''}],flags:{FIRST_BUG:true}},goto:'bug'}]},
      {label:'cat'},{speaker:'heroine_04',expression:'serious',text:'因為牠的手機沒電了。'},{speaker:'heroine_04',expression:'laugh'},{speaker:null,text:'（她說得很認真，然後自己笑到趴在桌上。）'},{goto:'end'},
      {label:'better'},{if:SOLO('heroine_04'),speaker:'heroine_04',expression:'smile',text:'真的？那第二關做好，你再幫我玩。'}   /* AA_525 1-2：原句「那你下禮拜再來，幫我玩第二關。」（之後是 2026-06-27 期末鉤子的 zq_play）*/,{if:GFO('heroine_04'),speaker:'heroine_04',expression:'smile',text:'好，那我把它做完。做完你再玩一次。'},
        {if:DH('heroine_04'),speaker:'heroine_04',expression:'annoyed',text:'你不要突然講這種話。……我會為了你把它做完。不對，為了它。為了它啦。'},{goto:'end'},   /* BB_187 2-2 第二個選項（AA_230 Q-08）*/
      {label:'bug'},{speaker:null,text:'（她愣住，打開程式碼。）'},{speaker:'heroine_04',expression:'surprised',text:'真的假的。我加進去。'},
      {label:'end'} ] },
  /* 阿凱 K2「工程師也是人」（BB_96 4-3，交接包 v2，新事件）：子晴 Q6 之後第一個在宿舍和他說話的晚上（他 18 點以後都在宿舍）；兩週內沒說到話就不演。
     原稿最後一句「算了。反正名單上不會有我。」刪掉（BB：太消沉）。三個選項各記一個旗標／記憶，之後的 K4（BB_98）、BB_108 回收；好感數字 BB b6b21d6 補 */
  { id:'ev_kai_engineer', title:'工程師也是人', participants:['kai'], location:'dorm', trigger:'interact', priority:7, once:true, time:[18,26],
    prereq:{events:['ev_ziqing_secret_game'],custom:G=>{ const d=G.events&&G.events.last&&G.events.last.ev_ziqing_secret_game; return d!=null&&G.day-d<=14; }}, background:'blur',
    dialogue:[ {speaker:'kai',expression:'neutral',text:'她跟我說，我是工程師，不算玩家。'},{speaker:'kai',expression:'tired',text:'……工程師也是人啊。'},
      {choice:[{text:'「你要跟她說。」',consequences:{rel:{kai:{fam:2,trust:2}},flags:{TOLD_KAI_TELL_HER:true}},goto:'tell'},
        {text:'「你想被寫進去嗎？」',consequences:{rel:{kai:{trust:4,comf:2}},mem:[{npc:'kai',tag:'KAI_WANTS_CREDIT',note:''}]},goto:'want'},
        {text:'「下次測試我叫你一起。」',consequences:{rel:{kai:{fam:3,comf:3}},flags:{KAI_JOINS_TEST:true}},goto:'join'}]},
      {label:'tell'},{speaker:'kai',expression:'neutral',text:'說什麼，「請把我寫進去」？很遜。'},{goto:'end'},
      {label:'want'},{speaker:null,text:'（他想了很久。）'},{speaker:'kai',expression:'neutral',text:'……想。'},{goto:'end'},
      {label:'join'},{speaker:'kai',expression:'smile',text:'好。'},{speaker:null,text:'（他轉回螢幕，打字變快了。）'},
      {label:'end'} ] },
  /* 子晴 Q4 比賽那天（BB_96 4-1 改寫，交接包 v2）：她週六的作息在公館（13–16），原本放在 Café 走不到 → 公館騎樓的長椅、只在比賽那一個週六（大一下第 8 週的週六，
     第 8～9 週之間）、前置 v1 Q2 問過比賽（ARGUED_ABOUT_CAREER）；三個選項都沒有正解（刪掉「有一點。但明年還有。」comf −2）；記 CONTEST_DAY（Q6 的前置之一）。
     id 不改：舊存檔在 Café 演過的不再演。錢（BB 382e9e2）：便利商店的罐裝咖啡一罐 −35（舊版 Café 的第四杯 −120）；選「陪她喝第四罐」的玩家自己也喝了一罐，再 −35 */
  /* 子晴 Q4（BB_96 4-1，BB-B 4ab575c7；AA_140 G05）：週六 15～18 點（她 14:00 起床、15:00 以後才出門）。
     AA_360 第 4 節（第②級，使用者 10-17 回 BB-LOGIC-16）：只有比賽那個週六（第 8 週）；原本錯過延到第 9 週週六「我上週六也坐在這裡」那一版拿掉——她不會為了祐廷再坐一次。
     錯過的玩家：第 9～11 週第一次和她說話，開頭多她一句（CONTEST_HEARD，story3d.js 的 S.contestHeard）。舊存檔演過第 9 週那一版的照舊（記憶的備註照舊） */
  /* BB_187 2-1（AA_554 核過；AA_230 Q-05～Q-07）：和她交往中＝她 13:30 先私訊「我在公館騎樓。不要問為什麼。」「……好啦，你要來就來。」（src/aa554_3d.js，同時把她 13:30～15:00 放在公館：STORY.SCHED_X），
     祐廷來了才演（13:30 起）；三個選項的回應換，影響、錢照原本；17:50 還沒來＝她傳「第四罐我自己喝了。」「……沒事。真的。」（不扣分），之後不再演、下一次見面她不提（STORY.contestHeardDue）。
     其他人照原本 15:00～18:00（time 放寬到 13.5，15:00 的下限搬進 custom）*/
  { id:'ev_ziqing_contest_day', title:'比賽那天', participants:['heroine_04'], location:'gongguan', trigger:'interact', priority:9, once:true, term:['Y1S2'], weeks:[8], weekday:[6], time:[13.5,18], prereq:{memory:[{npc:'heroine_04',tag:'ARGUED_ABOUT_CAREER'}],custom:G=>{ const h=G.hour%24; if(!DHN(G,'heroine_04')) return h>=15; return typeof AA554!=='undefined'&&!!AA554.q4Open&&AA554.q4Open(G); }}, background:'blur',
    dialogue:[ {speaker:null,text:'（她坐在騎樓的長椅，旁邊三個空的咖啡罐。）'},
      {speaker:'heroine_04',expression:'tired',text:'……今天是那個比賽。系上的人現在都在會場。'},{speaker:'heroine_04',expression:'tired',text:'我在這裡喝第三罐咖啡。'},
      {speaker:'heroine_04',expression:'neutral',text:'你說，我是不是很爛。'},
      {choice:[{text:'「妳不想去，就不是爛。」',consequences:{rel:{heroine_04:{trust:8,comf:4}},mem:[{npc:'heroine_04',tag:'CONTEST_DAY',note:'比賽那天，公館騎樓'}]},goto:'brave'},
        {text:'「現在去還來得及嗎？」',consequences:{rel:{heroine_04:{resp:4,trust:3}},mem:[{npc:'heroine_04',tag:'CONTEST_DAY',note:'比賽那天，公館騎樓'}]},goto:'late'},
        {text:'（陪她喝第四罐）',consequences:{rel:{heroine_04:{comf:7}},mem:[{npc:'heroine_04',tag:'CONTEST_DAY',note:'比賽那天，公館騎樓'}],money:-35},goto:'drink'}]},
      {label:'brave'},{if:DH('heroine_04'),goto:'braveD'},{speaker:'heroine_04',expression:'smile',text:'……你這樣講，好像我很勇敢。'},{speaker:null,text:'（她笑。）'},{speaker:'heroine_04',expression:'laugh',text:'我只是怕輸。'},{goto:'end'},
      {label:'late'},{if:DH('heroine_04'),goto:'lateD'},{speaker:'heroine_04',expression:'tired',text:'來不及了。第一輪已經結束了。'},{speaker:null,text:'（她把手機蓋在長椅上。）'},{speaker:'heroine_04',expression:'laugh',text:'……好爽。好爛。兩個都有。'},{goto:'end'},
      /* BB_187 2-1 和她交往中的三個回應（整段照表換）*/
      {label:'braveD'},{speaker:'heroine_04',expression:'smile',text:'你是我男朋友，你當然這樣講。'},{speaker:null,text:'（她把頭靠在你肩上一秒。）'},{speaker:'heroine_04',expression:'neutral',text:'……可是我想聽。我只是怕輸。'},{goto:'end'},
      {label:'lateD'},{speaker:'heroine_04',expression:'tired',text:'來不及了。第一輪結束了。'},{speaker:null,text:'（她把手機蓋在長椅上。）'},{speaker:'heroine_04',expression:'laugh',text:'……好爽。好爛。兩個都有。你都看到了。'},{goto:'end'},
      {label:'drink'},{speaker:'heroine_04',expression:'smile',text:'欸不是，你也喝？'},{speaker:'player',text:'嗯。'},{speaker:'heroine_04',expression:'smile',text:'你很奇怪。'},{unless:DH('heroine_04'),speaker:null,text:'（她第一次沒有吐槽下去。）'},{if:DH('heroine_04'),speaker:'heroine_04',expression:'smile',text:'我喜歡奇怪的。'},   /* 和她交往中：AA_230 Q-07（子晴說的）*/
      {label:'end'},{speaker:'heroine_04',expression:'smile',text:'第四罐。你請。'} ], consequences:{money:-35} },
  // ── 溫學姊 arc ──
  /* W8「今天先不改了」（BB_97 2-3 完整替換舊的「她撐不住的那天」；AA_177 第 8 節①）：大二上第 12 週她在 Café 的每一晚（週一、二、四 19～22），走到她旁邊就開始。
     前置：和她「朋友」以上，或有 NOTICED_HER／HELPED／GAVE_HER_NOTE 其中一個；HEARD_PROF_XU 不是前置（沒有的人「許老師說得對」換成「今天被問了一句話，我答不出來」）。
     四個選項都出必要 CG「熱水」（BCG-01，BB 第二版通過）；不崩潰、不哭、不寫「不想念法律」；表情 tired → smile。後面讀 W8 的條件改讀「第 12 週以後」（STORY.sisW8）。
     沒演到的玩家（不熟或沒到）：11/27（五）21:00 讀書會群組她請假、Kevin 在家族群組問（story3d.js phoneRules）*/
  { id:'ev_sis_collapse', retired:'BB_207 第 1 節（AA_218 第 8 節）：W8 作廢，熱水（BCG-01）移到大一上的 ev_sis_hot_water；定義留給已經演過的舊存檔', title:'今天先不改了', participants:['heroine_05'], location:'cafe', trigger:'auto', term:['Y2S1'], weeks:[12], weekday:[1,2,4], time:[19,22], once:true, priority:10, near:{npc:'heroine_05',r:3.5},
    prereq:{custom:G=>{ if(typeof SOCIAL==='undefined') return false; const r=G.social&&G.social.rel&&G.social.rel.heroine_05; return !!(r&&r.fam>=40&&r.trust>=25)||['NOTICED_HER','HELPED','GAVE_HER_NOTE'].some(t=>SOCIAL.has('heroine_05',t)); }}, background:'blur', cg_id:'cg_hot_water_heroine05',   /* 「朋友」看實際的數值：friendLevel 在 W8 以前把學姊壓在「有點熟」（BB_120 1-1 的台詞上限），不能拿來當 W8 的前置 */
    dialogue:[ {speaker:null,text:'（吧檯旁的單人座。研究計畫攤開，紅筆劃了半頁。保溫瓶是空的。）'},
      {speaker:'heroine_05',expression:'tired',text:'你怎麼會在這。'},{speaker:'heroine_05',expression:'tired',text:'坐吧。我剛好想要一個不是法服的人。'},
      {if:{memory:[{npc:'heroine_05',tag:'HEARD_PROF_XU'}]},speaker:'heroine_05',expression:'tired',text:'我改了七次。許老師說得對。'},
      {unless:{memory:[{npc:'heroine_05',tag:'HEARD_PROF_XU'}]},speaker:'heroine_05',expression:'tired',text:'我改了七次。今天被問了一句話，我答不出來。'},
      {speaker:'heroine_05',expression:'tired',text:'我選這個題目，是因為它會過。'},{speaker:'heroine_05',expression:'tired',text:'我從高中開始，每一步都選會過的。'},
      {speaker:'heroine_05',expression:'tired',text:'三件事。一，這份計畫今天要改完。二……'},
      {speaker:'heroine_05',expression:'tired',text:'（停住，看著保溫瓶）……二，我好像有點累。'},
      {speaker:'heroine_05',expression:'neutral',text:'三，我想試一件從來沒做過的事：今天先不改了。'},
      {choice:[{text:'「那妳想做什麼？」',consequences:{rel:{heroine_05:{trust:9}},mem:[{npc:'heroine_05',tag:'SHARED_SECRET',note:'她說「不知道」的感覺還不錯'}]},set:{SIS_W8:'what'},goto:'a'},
        {text:'「學姊，妳只是累了。」',consequences:{mem:[{npc:'heroine_05',tag:'IMPORTANT_CONVERSATION',note:'「我只是累了。這句話我以前不讓自己說。」'}]},set:{SIS_W8:'tired'},goto:'b'},
        {text:'「今天不要改了。」',consequences:{mem:[{npc:'heroine_05',tag:'TOLD_HER_STOP',note:''}]},set:{SIS_W8:'stop'},goto:'c'},
        {text:'（把她的保溫瓶拿去吧檯，裝滿熱水，不是咖啡）',consequences:{mem:[{npc:'heroine_05',tag:'HELPED',note:'保溫瓶裝了熱水'}]},set:{SIS_W8:'water',HOT_WATER:true},goto:'d'}]},
      {label:'a'},{speaker:null,text:'她想了很久。'},{speaker:'heroine_05',expression:'neutral',text:'我不知道。'},{speaker:null,text:'然後笑了。'},{speaker:'heroine_05',expression:'smile',text:'說『不知道』的感覺，還不錯。'},{goto:'cg'},
      {label:'b'},{speaker:'heroine_05',expression:'neutral',text:'對。'},{speaker:null,text:'她點頭。'},{speaker:'heroine_05',expression:'smile',text:'我只是累了。這句話我以前不讓自己說。'},{goto:'cg'},
      {label:'c'},{speaker:'heroine_05',expression:'smile',text:'我剛剛就這樣說了。'},{speaker:null,text:'她把計畫闔上。'},{speaker:'heroine_05',expression:'neutral',text:'我要回家了。你也早點回去。'},{goto:'cg'},
      {label:'d'},{speaker:null,text:'她喝了一口，愣住。'},{speaker:'heroine_05',expression:'surprised',text:'……是熱水。'},{speaker:'player',text:'嗯。'},{speaker:null,text:'她雙手抱著保溫瓶，笑了。'},{speaker:'heroine_05',expression:'smile',text:'好。今天就喝這個。'},
      {label:'cg'},{cg:'cg_hot_water_heroine05'},
      {speaker:'heroine_05',expression:'smile',text:'明天我還是會列三件事。'},{speaker:'heroine_05',expression:'smile',text:'今天，先列到二。'} ] },
  /* W9「她沒有去面試」（BB_97 2-4；AA_177 第 8 節③）：11/28（六）9:00～10:00 總圖門口的台階（她這一天的作息），和她「有點熟」以上；所有玩家都是偶遇、沒有訊息；
     沒遇到＝沒有這一場（寒假 M2 照樣發生）。記 SKIPPED_INTERVIEW（之後的回聲讀，不是 M2 的前置）。立繪：面試的西裝 heroine_05/formal（LAWWW2-B 4e812ce5、BB-B ART_APPROVED，每句 outfit:'formal'）*/
  { id:'ev_sis_skip_interview', retired:'BB_207 第 1 節：推甄整段取消，W9 作廢；定義留給已經演過的舊存檔', title:'她沒有去面試', participants:['heroine_05'], location:'campus', trigger:'auto', term:['Y2S1'], weeks:[12], weekday:[6], time:[9,10], once:true, near:{npc:'heroine_05',r:4},
    prereq:{stage:{npc:'heroine_05',min:'FAMILIAR'}}, background:'blur',
    dialogue:[ {speaker:'heroine_05',outfit:'formal',expression:'serious',text:'面試九點半。'},{speaker:'heroine_05',outfit:'formal',expression:'serious',text:'我八點就到了。在門口站了二十分鐘，然後走來這裡。'},
      {speaker:'heroine_05',outfit:'formal',expression:'serious',text:'（看著進出總圖的人）我從來沒有不去過任何一件事。'},{speaker:'heroine_05',outfit:'formal',expression:'serious',text:'第一次沒做完一件事。像少穿了一隻鞋。'},
      {choice:[{text:'「現在去還來得及。」',goto:'a'},{text:'「那就不要去。」',goto:'b'},{text:'「我要進去念書。」',goto:'c'}]},
      {label:'a'},{speaker:'heroine_05',outfit:'formal',expression:'serious',text:'我知道。'},{speaker:null,text:'她沒有動。'},{speaker:'heroine_05',outfit:'formal',expression:'serious',text:'我在等自己想去。等了二十分鐘，沒有等到。'},{goto:'end'},
      {label:'b'},{speaker:'heroine_05',outfit:'formal',expression:'smile',text:'你說得好簡單。'},{speaker:null,text:'她笑了。'},{speaker:'heroine_05',outfit:'formal',expression:'smile',text:'可是好像真的這麼簡單。'},{goto:'end'},
      {label:'c'},{speaker:null,text:'她站起來：'},{speaker:'heroine_05',outfit:'formal',expression:'neutral',text:'我也進去。'},{speaker:null,text:'她坐在閱覽室另一排。九點半，她看了一下手錶，把手錶拿下來，放進口袋。'},
      {label:'end'},{speaker:'heroine_05',outfit:'formal',expression:'neutral',text:'我會再考一次。一般考試，二月。'},{speaker:'heroine_05',outfit:'formal',expression:'smile',text:'這次，我要先想好為什麼。'},
      {mem:[{npc:'heroine_05',tag:'SKIPPED_INTERVIEW',note:'11/28 她沒有進面試的門'}]} ] },
  { id:'ev_sis_office_together', title:'許教授的研究室', participants:['heroine_05','prof_xu'], location:'wancai', trigger:'interact', priority:8, once:true, prereq:{memory:[{npc:'heroine_05',tag:'GRAD_SCHOOL_DISCUSSION'}],grad:{min:'CURIOUS'}}, background:'blur',
    dialogue:[ {speaker:'heroine_05',expression:'neutral',text:'我等一下要去許老師那邊。你要跟嗎？他喜歡大學部的來問笨問題。'},{choice:[{text:'「好。」',consequences:{grad:{bump:'跟學姊去許教授研究室',field:'公法'},prof:{prof_xu:{kind:'office',delta:3,note:'跟溫書瑀來研究室'}},mem:[{npc:'heroine_05',tag:'GRAD_SCHOOL_DISCUSSION',note:'一起去研究室'},{npc:'prof_xu',tag:'FIRST_MET'}]},goto:'go'},{text:'「我還沒準備好問問題。」',consequences:{rel:{heroine_05:{fam:1}}},end:true}]},{label:'go'},{speaker:'prof_xu',expression:'neutral',text:'書瑀，這位是？……大學部的。你為什麼來？'},{choice:[{text:'「想知道研究所在做什麼。」',consequences:{prof:{prof_xu:{kind:'research',delta:2}}}},{text:'「學姊叫我來的。」',consequences:{prof:{prof_xu:{kind:'office',delta:1}}}}]},{speaker:'prof_xu',expression:'smile',text:'好。研究所在做的事就是：找到一個你不問會睡不著的問題。你有嗎？'},{speaker:'player',text:'……還沒有。'},{speaker:'prof_xu',expression:'neutral',text:'那就先上課。有了再來。'},{speaker:'heroine_05',expression:'smile',text:'（小聲）他對你算客氣了。'} ] },
  // ── 教授 ──
  /* AA_522（企劃線 fcc93126e，AA-C 定稿；NPC-STORY2-1028）：教授的研究室照學期換。
     第 1 節周教授（ev_prof_zhou_office）：萬才館週四 15:12～16:30、冷卻 6 天照舊；大一上、大一下、大二上（AA_376 #19：大三不演）。每學期的題目各問一次（記 ZHOU_ASKED＝{學期:[題]}；
       舊存檔：大一上原本的兩題有 zhou_88／zhou_book 筆記＝問過），那學期問完就不觸發（不留只剩「沒事。」的選單）；推薦書只有大一上。招呼一次一句，上面的先（1-2 的表）。
       新的民法五題（表見代理、價目表、無因管理、債務不履行三種、消滅時效）都是 LEGAL_REVIEW_REQUIRED，審過才算定稿；筆記內文稿上只寫了 zhou_169，其他四則用周教授那兩句原文。
       1-3 大四下：專題下課後 15:12～16:30 去萬才館研究室，一次（ZHOU_ASKED.Y4S2）；記 mem ZHOU_Y4。他週一下課後在萬才館＝課表（CLS.profWhere）。
         第 8 節第 4 點（f36dfe3cf）：第 10 週專題（「回顧大一的案例」）下課的時候他說一句「{name}，下課來研究室一趟。」（ev_prof_zhou_y4_call）；那天 15:12～16:30 去就演，
         沒去的，第 11～13 週的週一同一時段去也演（原本只有第 11 週週一那一天、沒有提示）。
     第 3 節林教授：3-1 下課後（ev_prof_lin_after）開頭照第幾次輪四種（第五次起從頭）、最後一句第一次照舊、之後「下週見。」（第幾次＝G.events.done，演到第 n 次時是 n−1）；
       3-2 研究室（ev_prof_lin_office，新）：大三上週二 14:00～16:30 萬才館、冷卻 7 天、最多三次、要先演過 3-1；她那個時間在萬才館＝story3d.js 的 S.PROF_OFFICE；題庫抽題照 3-1（使用者提供的刑訴題庫）；
       最後一句照第幾次；第三句以後選了刑事判決研討的，大四上第一次上那堂課旁白一句（ev_prof_lin_nod）。新題目、研究室的教授紀錄照現有的辦公時間題（office +2）*/
  ...(()=>{ const TT=G=>typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(G.day):null, TID=G=>{ const t=TT(G); return t?t.id:null; }, WK=G=>{ const t=TT(G); return t?t.week|0:0; },
      NOTE=(G,id)=>Array.isArray(G.notes)&&G.notes.some(n=>n&&n.id===id), ZNOTES=G=>Array.isArray(G.notes)&&G.notes.some(n=>n&&/^zhou_/.test(String(n.id))),
      ZQ={Y1S1:['q88','book','agency'],Y1S2:['offer','gestio'],Y2S1:['types','prescr'],Y4S2:['y4']}, ZOLD={q88:'zhou_88',book:'zhou_book'},
      zAsked=(G,t,k)=>{ const A=G.flags&&G.flags.ZHOU_ASKED, L=A&&typeof A==='object'&&Array.isArray(A[t])?A[t]:[]; return L.includes(k)||(t==='Y1S1'&&!!ZOLD[k]&&NOTE(G,ZOLD[k])); },
      zCan=(G,k)=>{ const t=TID(G); return !!t&&(ZQ[t]||[]).includes(k)&&!zAsked(G,t,k); },
      zLeft=G=>{ const t=TID(G); return (ZQ[t]||[]).filter(k=>!zAsked(G,t,k)).length; },
      zMark=(G,k)=>{ const t=TID(G), F=G.flags; if(!t) return; if(!F.ZHOU_ASKED||typeof F.ZHOU_ASKED!=='object') F.ZHOU_ASKED={}; const L=Array.isArray(F.ZHOU_ASKED[t])?F.ZHOU_ASKED[t]:(F.ZHOU_ASKED[t]=[]); if(!L.includes(k)) L.push(k); },
      zY4=G=>TID(G)==='Y4S2',
      zFirst=(G,t)=>{ if(TID(G)!==t) return false; const l=G.events&&G.events.last&&G.events.last.ev_prof_zhou_office; if(l==null) return true; const lt=typeof CALENDAR!=='undefined'?CALENDAR.termOf(l):null; return !lt||lt.id!==t; },   /* 這學期第一次來（演完才記 last）*/
      zGreet=G=>G.flags&&G.flags.classAnswerPlus?'plus':(zFirst(G,'Y1S2')?'y1s2':(zFirst(G,'Y2S1')?'y2s1':'else')),
      CU=f=>({custom:f}), Z=(t,ex)=>({speaker:'prof_zhou',expression:ex||'neutral',text:t}), ZOFF=n=>({prof:{prof_zhou:{kind:'office',delta:2,note:n}}}),
      LA=G=>(G.events&&G.events.done&&G.events.done.ev_prof_lin_after)|0, LO=G=>(G.events&&G.events.done&&G.events.done.ev_prof_lin_office)|0,
      L=(t,ex)=>({speaker:'prof_lin',expression:ex||'neutral',text:t}),
      BGD=()=>typeof OUT!=='undefined'&&OUT.bg?OUT.bg('prof_door'):'blur';   /* AA_522 第 7 節：周教授、林教授研究室的 2D 背景共用 prof_door（研究室門口；getter：圖後來才登錄也拿得到）*/
    return [
    { id:'ev_prof_zhou_office', title:'周教授的研究室', participants:['prof_zhou'], location:'wancai', trigger:'interact', priority:6, cooldown_days:6, weekday:[1,4], time:[15.2,16.5], get background(){ return BGD(); }, term:['Y1S1','Y1S2','Y2S1','Y4S2'],   /* AA_376 #19：大三不演；大四下只有 1-3 那一次（週一）*/
      prereq:CU(G=>zY4(G)?(G.weekday===1&&WK(G)>=10&&WK(G)<=13&&zLeft(G)>0):(G.weekday===4&&zLeft(G)>0&&!(typeof STORY!=='undefined'&&STORY.civ1Week&&STORY.civ1Week(G)))),   /* 1-3：第 10～13 週的週一（第 8 節第 4 點）；第 9 節第 1 點（a3ea3918e）：民總第一堂那一週（週一～週日，STORY.civ1Week；這個檔比 story3d.js 早載入，執行時才看）不演，先說 talkProf 那兩句，下一個週四開始 */
      dialogue:[ {if:CU(zY4),goto:'y4'},
        Object.assign({if:CU(G=>zGreet(G)==='plus')},Z('你上次答得不錯。有問題？')),Object.assign({if:CU(G=>zGreet(G)==='y1s2')},Z('債總了。民總讀完了嗎？')),Object.assign({if:CU(G=>zGreet(G)==='y2s1')},Z('債總二上完，你們大四才會再遇到我。有問題？')),Object.assign({if:CU(G=>zGreet(G)==='else')},Z('有問題就問。沒問題就回去讀。')),
        {choice:[{text:'「老師，錯誤的『無過失』要怎麼判斷？」',if:CU(G=>zCan(G,'q88')),consequences:{prof:{prof_zhou:{kind:'office',delta:3,note:'問無過失'}},note:{id:'zhou_88',title:'周教授：無過失的判斷','body':'看表意人有沒有「合理的注意可能」：能不能發現、有沒有時間改、金額落差多大。'},knowledge:{qid:null}},goto:'q'},{text:'「老師推薦一本書？」',if:CU(G=>zCan(G,'book')),consequences:{prof:{prof_zhou:{kind:'office',delta:2,note:'問推薦書'}},note:{id:'zhou_book',title:'周教授推薦','body':'老師推薦的那本民法總則教科書——「先讀例題，再讀本文」。'}},goto:'book'},
          {text:'「老師，代理人自己越權簽約，本人要負責嗎？」',if:CU(G=>zCan(G,'agency')),consequences:Object.assign(ZOFF('問越權代理'),{note:{id:'zhou_169',title:'周教授：越權代理',body:'本人自己的行為讓人相信有代理權、或知道有人以他的名義卻不反對，要負責；對方明知或可得而知就不保護。'}}),goto:'agency'},
          {text:'「店家寄價目表給我，我回信說要買，契約成立了嗎？」',if:CU(G=>zCan(G,'offer')),consequences:Object.assign(ZOFF('問價目表'),{note:{id:'zhou_154',title:'周教授：價目表',body:'寄價目表，法律上不當作要約。你回信說要買，那一封才是要約。店家回你『好』，契約才成立。'}}),goto:'offer'},
          {text:'「室友出國，我幫他繳了電費。可以跟他要回來嗎？」',if:CU(G=>zCan(G,'gestio')),consequences:Object.assign(ZOFF('問無因管理'),{note:{id:'zhou_176',title:'周教授：幫室友繳電費',body:'他沒有拜託你，你也沒有義務。這叫無因管理。繳電費對他有利，也不違反他的意思。你付的錢，可以請他還。'}}),goto:'gestio'},
          {text:'「債務不履行到底有幾種？」',if:CU(G=>zCan(G,'types')),consequences:Object.assign(ZOFF('問債務不履行'),{note:{id:'zhou_types',title:'周教授：三種債務不履行',body:'給付不能、給付遲延、不完全給付。三種的效果不一樣。考試不會問你有幾種。會給你一個故事，問你是哪一種。'}}),goto:'types'},
          {text:'「借錢的人十幾年沒還，還要得回來嗎？」',if:CU(G=>zCan(G,'prescr')),consequences:Object.assign(ZOFF('問時效'),{note:{id:'zhou_125',title:'周教授：時效',body:'請求權的消滅時效，一般是十五年。時效完成以後，對方可以拒絕給付。可以拒絕，債還在。他自己還了，就不能說他不知道時效過了，再要回去。'}}),goto:'prescr'},
          {text:'「沒事。」',end:true}]},
        {label:'q'},{call:G=>zMark(G,'q88')},Z('好問題。看他有沒有『合理注意的可能』。網頁掛三天沒改，跟掛三分鐘，不一樣。','smile'),{goto:'end'},{label:'book'},{call:G=>zMark(G,'book')},Z('一年級不用讀太多。一本，讀三遍。'),{goto:'end'},
        /* LEGAL_REVIEW_REQUIRED（AA_522 1-2，大一上：表見代理；台詞沒寫條號）*/
        {label:'agency'},{call:G=>zMark(G,'agency')},Z('看本人自己做了什麼。他有沒有讓別人以為那個人有代理權？明明知道有人用他的名義，他有沒有出來反對？'),Z('還要看對方。對方明知道沒有代理權，或是稍微注意一下就會知道，就不保護。'),{goto:'end'},
        /* LEGAL_REVIEW_REQUIRED（AA_522 1-2，大一下債總一：價目表不是要約；台詞沒寫條號）*/
        {label:'offer'},{call:G=>zMark(G,'offer')},Z('寄價目表，法律上不當作要約。你回信說要買，那一封才是要約。'),Z('店家回你『好』，契約才成立。'),{goto:'end'},
        /* LEGAL_REVIEW_REQUIRED（AA_522 1-2，大一下債總一：無因管理的費用償還；台詞沒寫條號）*/
        {label:'gestio'},{call:G=>zMark(G,'gestio')},Z('他沒有拜託你，你也沒有義務。這叫無因管理。'),Z('繳電費對他有利，也不違反他的意思。你付的錢，可以請他還。'),{goto:'end'},
        /* LEGAL_REVIEW_REQUIRED（AA_522 1-2，大二上債總二：債務不履行的三種；台詞沒寫條號）*/
        {label:'types'},{call:G=>zMark(G,'types')},Z('給付不能、給付遲延、不完全給付。三種的效果不一樣。'),Z('考試不會問你有幾種。會給你一個故事，問你是哪一種。'),{goto:'end'},
        /* LEGAL_REVIEW_REQUIRED（AA_522 1-2，大二上債總二：消滅時效十五年、時效完成以後的給付；台詞沒寫條號）*/
        {label:'prescr'},{call:G=>zMark(G,'prescr')},Z('請求權的消滅時效，一般是十五年。時效完成以後，對方可以拒絕給付。'),Z('可以拒絕，債還在。他自己還了，就不能說他不知道時效過了，再要回去。'),{goto:'end'},
        /* 1-3 大四下：有 zhou_88（大一問過錯誤的無過失）＝問現在會怎麼答；一則 zhou_* 筆記都沒有＝「四年了，你才來我研究室。」；兩種都接最後兩句 */
        {label:'y4'},{call:G=>zMark(G,'y4')},Z('（他翻了一下你的專題大綱。）'),
        Object.assign({if:CU(G=>NOTE(G,'zhou_88'))},Z('你大一問過我，錯誤的「無過失」怎麼判斷。現在你會怎麼答？')),
        {if:CU(G=>NOTE(G,'zhou_88')),choice:[{text:'「看他有沒有合理注意的可能。」',goto:'y4a'},{text:'「看情況。」',goto:'y4b'},{text:'「我還是不太確定。」',goto:'y4c'}]},
        Object.assign({if:CU(G=>!ZNOTES(G))},Z('四年了，你才來我研究室。')),{goto:'y4z'},
        {label:'y4a'},Z('對。你那時候是用問的。','smile'),{goto:'y4z'},{label:'y4b'},Z('……法律系四年，你學會了這三個字。'),{goto:'y4z'},{label:'y4c'},Z('很好。不確定的人比較會去查。','smile'),
        {label:'y4z'},Z('專題的題目，挑一個你大一就想不通的。'),Z('想不通，才寫得下去。'),{consequences:ZOFF('大四去研究室'),mem:[{npc:'prof_zhou',tag:'ZHOU_Y4'}]},   /* 人物面板的名稱「大四去了周教授的研究室」在 social3d.js MEMORY_LABEL（不另寫備註，免得重複）*/
        {label:'end'} ] },
    /* 1-3 的提示（AA_522 第 8 節第 4 點，f36dfe3cf）：大四下第 10 週專題（「回顧大一的案例」）真的上完、下課的時候周教授一句（classes3d.js afterClassEvent；翹課沒有）。
       研究室那一場還沒演才說（同一學期只有這一堂；一次）*/
    { id:'ev_prof_zhou_y4_call', title:'專題下課', participants:['prof_zhou'], location:'any', trigger:'class', afterClass:'legal_research', term:['Y4S2'], weeks:[10], once:true, background:'blur', prereq:CU(G=>zY4(G)&&zLeft(G)>0),
      dialogue:[ Z('{name}，下課來研究室一趟。') ] },
    { id:'ev_prof_lin_after', term:['Y3S1'], title:'下課後', participants:['prof_lin'], location:'classroom', trigger:'interact', priority:6, cooldown_days:6, weekday:[2], time:[11.8,12.6], background:'blur',
      dialogue:[ Object.assign({if:CU(G=>LA(G)%4===0)},L('你剛剛那題——','smile')),Object.assign({if:CU(G=>LA(G)%4===1)},L('你上課皺眉頭的那一題——','smile')),Object.assign({if:CU(G=>LA(G)%4===2)},L('剛剛那個證人的例子——','smile')),Object.assign({if:CU(G=>LA(G)%4===3)},L('你筆記抄到一半停下來的地方——','smile')),
        {if:{knowledge:[{qid:'Q001',min:'confused'}]},speaker:'prof_lin',expression:'neutral',text:'很多人第一年都以為刑訴只是抓壞人。等你看過一個無罪判決，就會懂。'},{legal:{context:'classmate',by:'prof_lin',pick:{prefer:'confused'},quiet:false}},
        Object.assign({if:CU(G=>LA(G)===0)},L('來研究室也可以。週二下午。')),Object.assign({unless:CU(G=>LA(G)===0)},L('下週見。')) ], consequences:{prof:{prof_lin:{kind:'office',delta:2,note:'下課後問問題'}}} },
    { id:'ev_prof_lin_office', term:['Y3S1'], title:'林教授的研究室', participants:['prof_lin'], location:'wancai', trigger:'interact', priority:6, cooldown_days:7, max_times:3, weekday:[2], time:[14,16.5], get background(){ return BGD(); }, prereq:{events:['ev_prof_lin_after']},
      dialogue:[ L('你來了。'),Object.assign({if:CU(G=>LO(G)===0)},L('上次下課你問的那題，我回去又想了一下。')),{legal:{context:'office',by:'prof_lin',pick:{prefer:'confused'},quiet:false}},
        Object.assign({if:CU(G=>LO(G)===0)},L('我念書的時候也讀不懂判決。後來讀到一份寫錯的，對照著看，才讀懂其他的。')),Object.assign({if:CU(G=>LO(G)===1)},L('無罪判決要讀到最後。最後那幾段，通常寫得最小心。')),Object.assign({if:CU(G=>LO(G)>=2)},L('你大四如果選判決研討，我們還會見面。不選也沒關係。','smile')) ],
      consequences:{prof:{prof_lin:{kind:'office',delta:2,note:'研究室問問題'}}} },
    { id:'ev_prof_lin_nod', title:'', participants:[], location:'any', trigger:'class', beforeClass:'crim_judgment_sem', term:['Y4S1'], once:true, background:'blur', prereq:CU(G=>LO(G)>=3),   /* 3-2 第三句（「我們還會見面」）說過、選了刑事判決研討：第一次上那堂課（翹掉的不算；舊存檔沒有＝不演）*/
      dialogue:[ {speaker:'prof_lin',expression:'neutral'},{speaker:null,text:'（她看到你，點了一下頭。）'} ] } ]; })(),
  // ── 同學 ──
  { id:'ev_zhe_ball', title:'系籃練球', participants:['zhe'], location:'campus', trigger:'interact', priority:5, weekday:[5], time:[16.5,18.5], cooldown_days:6, term:['Y1S1','Y1S2'], prereq:{flags:['ball_invite'],custom:G=>{ const l=G.events&&G.events.last&&G.events.last.ev_zhe_ball; if(l==null||typeof CALENDAR==='undefined') return true; const a=CALENDAR.termOf(l), b=CALENDAR.termOf(G.day); return !a||!b||a.id!==b.id; }}, background:'blur',   /* AA_313 5-1 第 3 點＋5-3：只在大一、每學期一次（原本冷卻 6 天、四年每週重演）*/
    dialogue:[ {speaker:'zhe',expression:'smile',text:'來了？明軒在場上等。你當經理，記分。'},{choice:[{text:'「記分可以。」',consequences:{mem:[{npc:'zhe',tag:'STUDIED_TOGETHER',note:'系籃練球（記分）'},{npc:'classmate_mingxuan',tag:'SHARED_CLASS',note:'系籃練球'}],rel:{zhe:{fam:5,comf:4},classmate_mingxuan:{fam:5}},energy:-10,advance:1.5,memo:'去系籃當了一次記分員'}},{text:'「我上場。」',consequences:{mem:[{npc:'zhe',tag:'STUDIED_TOGETHER',note:'系籃練球（上場被電）'}],rel:{zhe:{fam:6,comf:5},classmate_mingxuan:{fam:6,resp:2}},energy:-22,advance:1.5,memo:'系籃練球被電了一小時'}},{text:'「今天不行。」',consequences:{mem:[{npc:'zhe',tag:'DECLINED_INVITE'}]},end:true}]},{speaker:'zhe',expression:'laugh',text:'結束一起吃燒臘。'} ] },
  /* 宥辰的 DJ（AA_497 1-11）：第一次照現在全文；第二次以後只演第二句起（第一句本來就只給還沒認識的人），最後一句「考前我就會消失，別找我」照順序輪流換成三句
     （G.events.done 在演完才加：演第 n 次的時候是 n−1）。「去。」＝交換聯絡方式（1-4「DJ 那段答應去」收得到週五的歌）*/
  { id:'ev_youchen_dj', title:'週五晚上', participants:['classmate_youchen'], location:'gongguan', trigger:'interact', priority:6, weekday:[5], time:[21,26], cooldown_days:6, background:'blur',
    dialogue:[ {unless:{memory:[{npc:'classmate_youchen',tag:'FIRST_MET'}]},speaker:'classmate_youchen',expression:'smile',text:'你……民總同班的？賴宥辰。你大概沒看過我，我通常在睡覺。'},{speaker:'classmate_youchen',expression:'smile',text:'我十一點在巷子裡那間放歌。來嗎？不用錢，法律系的算朋友價。'},{choice:[{text:'「去。」',consequences:{rel:{classmate_youchen:{fam:6,comf:4}},mem:[{npc:'classmate_youchen',tag:'SHARED_MEAL',note:'去聽他放歌'}],energy:-8,advance:2,memo:'去聽宥辰放歌到凌晨',contact:'classmate_youchen'}},{text:'「明天要早起。」',consequences:{rel:{classmate_youchen:{fam:2}}}}]},
      {unless:{custom:G=>!!(G.events&&G.events.done&&G.events.done.ev_youchen_dj)},speaker:'classmate_youchen',expression:'laugh',text:'考前我就會消失，別找我。'},
      {if:{custom:G=>((G.events&&G.events.done&&G.events.done.ev_youchen_dj)|0)%3===1},speaker:'classmate_youchen',expression:'smile',text:'這週的歌比較慢。適合下雨。'},
      {if:{custom:G=>((G.events&&G.events.done&&G.events.done.ev_youchen_dj)|0)%3===2},speaker:'classmate_youchen',expression:'laugh',text:'你又來了。阿姨說你是常客。'},
      {if:{custom:G=>{ const n=(G.events&&G.events.done&&G.events.done.ev_youchen_dj)|0; return n>0&&n%3===0; }},speaker:'classmate_youchen',expression:'smile',text:'明天早上的課，你幫我看一下有沒有點名。'} ] },
  { id:'ev_xinci_double', title:'雙主修', participants:['classmate_xinci'], location:'library', trigger:'interact', priority:6, once:true, term:['Y1S2'], weeks:[6,7], prereq:{memory:[{npc:'classmate_xinci',tag:'FIRST_MET'}]}, background:'blur',   /* AA_120 7-1 第 3 項：大一下第 6～7 週（2026-03-30～04-12），期中前；債總週四、經原週五。AA_185 3-11：不需要慈 1（借筆記）——認識她就有（祐廷大一下都在重修經原）；沒有慈 1 的玩家第一句換成「……你也在重修經原？」*/
    dialogue:[ {speaker:null,text:'（她在便利貼上寫：『出去一下？』你們走到樓梯間。）',libOut:true},   /* libOut（AA_595 1-B14：取代「（總圖裡，她壓低聲音。）」；AA 11-02 22:30 定稿）*/
      /* AA_209 附錄A §2：開頭一句旁白，其他的（小聲）×11 拿掉 */{if:{memory:[{npc:'classmate_xinci',tag:'LENT_NOTES'}]},speaker:'classmate_xinci',expression:'tired',text:'經濟的期中考，跟債總的小考同一週。兩科我都還沒念完……我可能要放棄一科。'},{unless:{memory:[{npc:'classmate_xinci',tag:'LENT_NOTES'}]},speaker:'classmate_xinci',expression:'surprised',text:'你也有修經原喔？我在後面看到你。'}/* AA_209 附錄A §2 */,{choice:[{text:'「放經濟。妳民法比較強。」',consequences:{rel:{classmate_xinci:{trust:4,resp:2}},mem:[{npc:'classmate_xinci',tag:'IMPORTANT_CONVERSATION',note:'你建議她放經濟'}]}},{text:'「兩科都考，考爛也是經驗。」',consequences:{rel:{classmate_xinci:{fam:3,comf:2}},mem:[{npc:'classmate_xinci',tag:'IMPORTANT_CONVERSATION',note:'你說兩科都考'}]}},{text:'「妳為什麼要雙主修？」',consequences:{rel:{classmate_xinci:{trust:5,fam:3}},mem:[{npc:'classmate_xinci',tag:'TALKED_FAMILY',note:'雙主修財金是她自己要的'}]},goto:'why'},{text:'「經濟那科我陪妳看。」',goto:'econ'}]},{goto:'end'},{label:'why'},{speaker:'classmate_xinci',expression:'smile',text:'我喜歡財金。看財報比看小說好看。'},{speaker:'classmate_xinci',expression:'neutral',text:'……我爸媽都是律師。他們說，念我喜歡的就好。'},   /* AA_547 第 2 節（原本「我爸說法律系畢業沒有第二專長會餓死。他是會計師。」）*/{goto:'end'},
      /* 交接包 v2 第 3 節（慈 2 的新選項）：祐廷也在重修經原（下），所有玩家都有；「第三章」不寫是個體還是總體；以安不在場 */
      {label:'econ'},{if:{flagIs:{ECON_PAST_SHARED:'full'}},goto:'ec_full'},{if:{flagIs:{ECON_PAST_SHARED:'half'}},goto:'ec_half'},
      {speaker:'classmate_xinci',expression:'surprised',text:'……你怎麼這麼熟？'},   /* P4B_SEEN 那一句（設它的事件 CANON-NO-ECON-1112 第三批拿掉）跟著拿掉 */
      {choice:[{text:'「念過。一個多月。」',goto:'ec_told'},{text:'「自學過一點。」',goto:'ec_self'},{text:'「第三章我也還在念。」',goto:'ec_not'}]},
      {label:'ec_told'},{speaker:'classmate_xinci',expression:'smile',text:'我就知道。'},{set:{ECON_PAST_SHARED:'full'}},{goto:'ec_together'},
      {label:'ec_self'},{set:{ECON_PAST_SHARED:'half'}},{goto:'ec_half'},
      {label:'ec_not'},{speaker:'classmate_xinci',expression:'neutral',text:'……好，不說也行。'},{goto:'ec_together'},
      {label:'ec_full'},{speaker:'classmate_xinci',expression:'neutral',text:'你念過的那一個多月，第三章有教嗎？'},{speaker:'player',text:'有教到。我那時候沒聽懂。'},{speaker:'classmate_xinci',expression:'smile',text:'沒關係，我也沒聽懂。等一下一起問老師。'}/* AA_209 第 8 節第 7 點 */,{goto:'ec_together'},
      {label:'ec_half'},{speaker:'classmate_xinci',expression:'neutral',text:'自學的人，第三章懂嗎？'},{speaker:'player',text:'懂一半。'},{speaker:'classmate_xinci',expression:'smile',text:'好，那你懂的那一半先講。'}/* AA_209 附錄A §2 */,
      {label:'ec_together'},{speaker:null,text:'（你們在總圖對經濟題。她列式子，你畫圖。）'},{mem:[{npc:'classmate_xinci',tag:'ECON_TOGETHER',note:'在總圖'}]},
      {label:'end'},{speaker:'classmate_xinci',expression:'smile',text:'謝謝。我要繼續讀了。'} ] },
  { id:'ev_mingxuan_money', title:'家裡的事', off:'交接包 v1 關閉（BB_95 2-9；改寫版在之後的交接包）', participants:['classmate_mingxuan'], location:['campus','gongguan'], trigger:'interact', priority:7, once:true, term:['Y1S1','Y1S2'],   /* AA_207 §3-4：「下學期」只在大一 */ prereq:{stage:{npc:'classmate_mingxuan',min:'FAMILIAR'}}, background:'blur',
    dialogue:[ {speaker:'classmate_mingxuan',expression:'neutral',text:'我下學期家教可能要再多接。家裡……嗯。'},{speaker:'classmate_mingxuan',expression:'smile',text:'只是球可能要少打一點。'},{choice:[{text:'「系辦有工讀，我幫你問。」',consequences:{rel:{classmate_mingxuan:{trust:6,fam:4}},mem:[{npc:'classmate_mingxuan',tag:'HELPED',note:'幫他問工讀'}],flags:{mingxuan_job_ask:true}}},{text:'「阿哲知道嗎？」',consequences:{rel:{classmate_mingxuan:{fam:3}},mem:[{npc:'classmate_mingxuan',tag:'TALKED_FAMILY'}]}},{text:'「加油。」',consequences:{rel:{classmate_mingxuan:{fam:1}}}}]},{speaker:'classmate_mingxuan',expression:'smile',text:'嗯，謝了。'} ] },
  // ── 生活小事 ──
  { id:'ev_wrong_coffee', title:'咖啡買錯', retired:true,   /* 使用者 11-10 選擇題「拿掉」（「這個選項選了很多次有意義嗎」：隨機小事，選了只有體力或 9 分鐘，對關係、劇情都沒影響；WRONG-COFFEE-OFF-1110）：不再出現，定義留給舊存檔 */ participants:[], location:'cafe', trigger:'enter', day_min:3, cooldown_days:4, random_weight:0.35, background:'freeze',
    dialogue:[ {speaker:null,text:'你點了拿鐵，拿到的是手沖。店員說「啊」，然後看著你。'},{choice:[{text:'「沒關係，這杯也好。」',consequences:{energy:5,memo:'喝了一杯不是自己點的咖啡'}},{text:'「我點的是拿鐵。」',consequences:{advance:0.15}}]} ] },
  { id:'ev_almost_late', title:'快遲到', participants:[], location:'campus', trigger:'enter', weekday:[2], time:[9.9,10.25], day_min:3, cooldown_days:6, keep:'defer', background:'freeze',   /* keep：【延】（AA_160 3-4 C：生活小事，一鍵上課路上不攔；有 time 預設會算【固】，所以寫明）*/
    dialogue:[ {speaker:null,text:'等一下還有課。你看了一眼手機，開始用走的假裝自己沒有在跑。'} ], consequences:{goal:'法律系館A：上課'} },   /* AA_372 第 14 項：大一上週二沒有 10:20 的課（原本「十點二十的課。」）*/
  { id:'ev_course_selection', title:'選課結果', retired:true,   /* AA_605 第 2 列（BUG-GE-NOT-SELECTED-1103，使用者 11-03「有一個通識課沒選上到底是什麼 現在遊戲不是一開始課表都訂好了?」）：大一上課表是排好的，拿掉；定義留給舊存檔 */ participants:[], location:'dorm', trigger:'enter', day_min:5, once:true, time:[7,12], background:'freeze',
    dialogue:[ {speaker:null,text:'選課結果出來了。通識「城市與散步」——沒選上。備取十七。'},{choice:[{text:'沒選到的那堂，等第二階段有人退選，再上網加加看。',consequences:{flags:{ge_walk_waitlist:true},memo:'通識「城市與散步」備取，等第二階段退選'}},{text:'算了，下學期再選。',consequences:{memo:'通識「城市與散步」沒選上，下學期再選'}}]} ] },   /* 交接包 v1 第 1 節：祐廷本來就要重修經原（必修），不設 ge_econ */
  /* AA_356 第 2 節：選「我明天拿來。」＝隔天以後第一次進總圖還書、罰款變四十元（原本欠著不用付，當場繳的反而吃虧）；欠著的時候不再跳逾期 */
  { id:'ev_book_return', title:'還書', participants:[], location:['library_hall','library'], trigger:'enter', background:'freeze', prereq:{custom:G=>!!(G.flags&&G.flags.book_overdue)&&G.day>(G.flags.book_overdue_day|0)},
    dialogue:[ {speaker:null,text:'（你把那本《民法總則》還了。多拖一天，罰款變成四十元。）',consequences:{money:-40},set:{book_overdue:false}} ] },
  { id:'ev_forgot_book', title:'忘記還書', retired:true,   /* BUG-BOOK-OVERDUE-1023（使用者 10-23 08:3x「為什麼莫名其妙一直圖書館借書逾期」）：遊戲沒有借書，這一則每 7 天在 3F 閱覽區隨機跳＝沒借過也一直逾期。先關掉；有借書系統再接（問 AA）。ev_book_return 留著，舊存檔欠著的還得掉 */
    participants:[], location:'library', trigger:'enter', day_min:6, cooldown_days:7, random_weight:0.4, background:'freeze', prereq:{custom:G=>!(G.flags&&G.flags.book_overdue)},
    dialogue:[ {speaker:null,text:'櫃台叫住你：「同學，你有一本《民法總則》逾期三天。」'},{choice:[{text:'繳罰款（30 元）',consequences:{money:-30}},{text:'「我明天拿來。」',consequences:{flags:{book_overdue:true},stamp:'book_overdue_day'}}]} ] },
  { id:'ev_midnight_snack', title:'考前宵夜', participants:['zhe'], location:'dorm', trigger:'enter', weeks:[7,8], term:['Y1S1','Y1S2'],   /* AA_313 5-1 第 3 點：只在大一（四年都會重演）*/   /* AA_195 4-7 A5：期中前（第 7～8 週）；期末前那次等 16 週制（E 類）*/ time:[22,24.5], cooldown_days:5, random_weight:0.5, background:'freeze',
    dialogue:[ {speaker:null,text:'手機震了一下。阿哲：「宵夜 滷味攤 現在 明軒也在」'},{choice:[{text:'「來了。」',consequences:{mem:[{npc:'zhe',tag:'SHARED_MEAL',note:'考前宵夜'}],rel:{zhe:{fam:3,comf:3}},energy:-6,money:-90,advance:1,memo:'考前跟阿哲他們去吃宵夜'},goto:'came'},{text:'「我明天要上台報告，下次。」',consequences:{rel:{zhe:{fam:0}},mem:[{npc:'zhe',tag:'DECLINED_INVITE',note:'考前宵夜'}]},goto:'end'},{text:'「我晚點去找你們。」',consequences:{rel:{zhe:{fam:1}},advance:0.5},goto:'end'}]},
      {label:'came'},{speaker:null,text:'（你們在夜市口站著吃完鹹酥雞，十二點才回宿舍。）'},   /* AA_313 5-1 第 3 點：選「來了。」以後原本什麼都沒有 */
      {label:'end'} ] },
  { id:'ev_bike_flat', title:'腳踏車沒氣', participants:[], location:'campus', trigger:'enter', day_min:4, cooldown_days:6, random_weight:0.3, time:[7,20], background:'freeze',
    dialogue:[ {speaker:null,text:'腳踏車架旁邊有人蹲著看自己的後輪。沒氣。他抬頭看你，像在問你有沒有打氣筒。'},{choice:[{text:'「校門口有打氣筒。」',consequences:{energy:-1}},{text:'（假裝沒看到）',consequences:{}}]} ] },
  // ── 考試：刑訴小考（第三週起的週二）──
  { id:'ev_quiz_crimpro', retired:'AA_376 #2（企劃線 69aa3b0c，AA 定）：v7 舊課堂，課表系統已經有刑訴（9:10 開始）；沒有 once、每週二重演（期中考當天、第 9 週沒課也演）——停用，定義留給舊存檔', term:['Y3S1'], title:'刑訴小考', participants:['prof_lin','classmate_bohan'], location:'classroom', trigger:'enter', weekday:[2], time:[9.9,12.1], day_min:13, cooldown_days:13, prereq:{flags:['crimpro_attended']}, background:'freeze', mainSide:'right', player_seat:[1,3], priority:20,
    dialogue:[ {speaker:'prof_lin',expression:'neutral',text:'今天先小考。三題，不算分，但我會記得誰寫對。'},{speaker:'classmate_bohan',expression:'serious',text:'（小聲）她說不算分的時候，都很算分。'},{legal:{context:'quiz',by:'prof_lin',pick:{prefer:'confused'},quiet:true}},{legal:{context:'quiz',by:'prof_lin',pick:{section:'強制處分'},quiet:true}},{legal:{context:'quiz',by:'prof_lin',pick:{},quiet:true}},{speaker:'prof_lin',expression:'smile',text:'收卷。下週講強制處分。'} ],
    consequences:{advance:1.7,energy:-8,memo:'刑訴小考',flags:{crimpro_quiz_done:true}} },
  // ── 研究所：說明會 ──
  { id:'ev_grad_info_session', title:'法研所說明會', participants:['npc_ta_chen','heroine_05'], location:'wancai', trigger:'enter', weekday:[5], time:[14.8,16.2], day_min:5, once:true, background:'blur', term:['Y1S1','Y1S2'], prereq:{flags:['met_sis']},   /* AA_376 #19：限大一（「我是碩二的陳冠廷」「一年級的也可以留下來聽」）；AA_518 4-12：要見過她（met_sis，同 C1）*/
    dialogue:[ {speaker:null,text:'法律系館B大廳擺了二十張椅子。海報：「法律學研究所 招生說明會」。坐了七個人，大部分是大三。'},{speaker:'npc_ta_chen',expression:'neutral',text:'我是碩二的陳冠廷，刑事法組。先講結論：研究所的書，沒有人會幫你畫重點。'},{speaker:'heroine_05',expression:'serious',text:'一年級的也可以留下來聽，不會有人趕你。'},{speaker:'npc_ta_chen',expression:'thinking',text:'筆試考申論，口試問你的研究計畫。最常被問倒的問題是：你為什麼要研究這個？'},{choice:[{text:'留下來聽完',consequences:{grad:{bump:'聽了法研所說明會'},advance:1,energy:-4,mem:[{npc:'npc_ta_chen',tag:'FIRST_MET'},{npc:'heroine_05',tag:'GRAD_SCHOOL_DISCUSSION',note:'說明會'}],memo:'聽了法研所說明會'}},{text:'聽十分鐘就走',consequences:{advance:0.2}}]} ] },
  /* W3（BB_96 2-3，交接包 v2）：落在大一下第 5 週以後（她會在讀書會後給）；台詞、選項照舊；debate 的三個選項多記 W3_STANCE（no／diff／unsure；W3b 第一次的開頭用）*/
  { id:'ev_grad_reading', title:'學姊給的文章', participants:['heroine_05'], location:['library','wancai','cafe'], trigger:'interact', priority:7, once:true, prereq:{grad:{min:'CONSIDERING'},custom:G=>typeof STORY!=='undefined'&&!!STORY.termDay&&G.day>=STORY.termDay('Y1S2',5,1)}, background:'blur',
    dialogue:[ {speaker:'heroine_05',expression:'neutral',text:'你真的在想研究所？……好。這篇，三十頁。讀完我們吵一次。'},{set:{grad_reading:true},note:{id:'grad_reading',title:'學姊給的文章','body':'一篇公法的期刊論文。三十頁。讀書時可以選「讀研究所準備的文章」，讀三次才算讀完。'}},{speaker:'heroine_05',expression:'smile',text:'用鉛筆讀比較好。可以寫你不同意的地方。'},{if:{custom:G=>typeof FAMXMAS!=='undefined'&&FAMXMAS.hasPencil(G)},speaker:'heroine_05',text:'我給你的那支剛好。'} ],   /* AA_406 第 4 節：大一家族聖誕拿到那支刻名字的鉛筆的 */ consequences:{mem:[{npc:'heroine_05',tag:'GRAD_SCHOOL_DISCUSSION',note:'給你一篇文章'}]} },
  { id:'ev_grad_debate', title:'和溫學姊吵一次', participants:['heroine_05'], location:['library','wancai','cafe'], trigger:'interact', priority:9, once:true, prereq:{flags:['grad_read_done']}, background:'blur',
    dialogue:[ {speaker:'heroine_05',expression:'serious',text:'讀完了？好。第二節，作者說比例原則在這個案型「只能」這樣用。你同意嗎？'},
      {choice:[
        {text:'「不同意。他把『必要性』直接跳過了。」',hint:'你的鉛筆字',set:{W3_STANCE:'no'},rel:{heroine_05:{resp:6,fam:3}},mem:[{npc:'heroine_05',tag:'GRAD_SCHOOL_DISCUSSION',note:'跟她吵了必要性審查'}],goto:'agree_no'},
        {text:'「同意，但理由跟他寫的不一樣。」',set:{W3_STANCE:'diff'},rel:{heroine_05:{resp:4,fam:3}},mem:[{npc:'heroine_05',tag:'GRAD_SCHOOL_DISCUSSION',note:'同意結論、不同意理由'}],goto:'agree_diff'},
        {text:'「老實說，我不確定我讀懂了。」',set:{W3_STANCE:'unsure'},rel:{heroine_05:{trust:4,fam:2}},mem:[{npc:'heroine_05',tag:'GRAD_SCHOOL_DISCUSSION',note:'承認沒讀懂'}],goto:'unsure'} ]},
      {label:'agree_no'},{speaker:'heroine_05',expression:'smile',text:'對。他跳過了。我第一次讀的時候沒看出來，是許老師指出來的。'},{speaker:'heroine_05',expression:'serious',text:'下次見面，這一段你來講。'},/* AA_209 附錄B §2 */{consequences:{prof:{prof_xu:{kind:'research',delta:1,note:'學姊提到你讀了那篇文章'}}}},{goto:'end'},
      {label:'agree_diff'},{speaker:'heroine_05',expression:'thinking',text:'那你講講看。'},{speaker:null,text:'（你講了十分鐘。她中間打斷你三次。）'},{speaker:'heroine_05',expression:'smile',text:'三次裡有一次你是對的。這樣就夠了。'},{goto:'end'},
      {label:'unsure'},{speaker:'heroine_05',expression:'neutral',text:'那很誠實。我第一次也沒讀懂。'},{speaker:'heroine_05',expression:'smile',text:'這次我陪你讀第二節。'},{consequences:{advance:1}},
      {label:'end'},{speaker:'heroine_05',expression:'tired',text:'……我自己的研究計畫還沒改完。走了。'} ],
    consequences:{grad:{bump:'和學姊為一篇文章吵了一次',field:'公法'}} }
];
Array.prototype.push.apply(STORY_EVENTS,STORY_EVENTS_V11);
/* ===== 1A-06～1A-15（AA_317、AA_318；AA-C 2026-10-20 定稿，第②級，台詞不改字；e75ebc69 的兩處更正已照改）=====
   大三寒假到大四畢業、搬走。日期、在哪裡演、旗標的流程在 src/story3d.js 的「1A-06～1A-15」那一段；這裡只放台詞。
   ev_sister_hotpot（出遊，1A-06）、ev_family_land_y3／_bed（在家／睡著，1A-07）、ev_y4_path／_again（1A-08，story3d.js 叫）、
   ev_r1_jetlag（1A-10，story3d.js 叫）、ev_grad_envelope／_bed（1A-12 晚上的信封）。家人（姊姊、大伯、媽媽）沒有立繪＝compact。
   測試：tests/sister_hotpot_unit.js、land_data2_unit.js、jetlag_unit.js、grad_family_unit.js */
const Y4_EVENTS=(function(){
  const R=G=>typeof STORY!=='undefined'&&STORY.route?STORY.route(G):null, JP=G=>R(G)==='JP', US=G=>R(G)==='US', TW=G=>!JP(G)&&!US(G);   /* 台灣路線＝不是 JP、也不是 US（未決定也算）*/
  const fam=id=>typeof STORY!=='undefined'&&!!STORY.y4Fam&&STORY.y4Fam(id), all=(...ids)=>()=>ids.every(fam);   /* AA_30 3-4：只有 FAMILIAR 以上的人到場或被提到 */
  const atHome=G=>typeof HOME!=='undefined'&&!!HOME.at&&HOME.at(G);
  /* 1A-06 主線 7「姊姊」（AA_317 第 2 節）：1/12 19:00 公館火鍋店；交換的回答照 EXCHANGE_ROUTE；選項②只給 careerLean C；SISTER_TALK */
  const HOTPOT=[ {scene:'公館・火鍋店',bg:'gongguan_hotpot'},
    {speaker:null,text:'（一月的公館。火鍋店的玻璃起了一層霧。姊姊已經到了，鍋子點好了，兩個人一鍋。）'},
    {speaker:null,text:'（你走進來的時候，她看了一下手機上的時間。）'},
    {speaker:'姊姊',text:'你們法律系的都走這麼快喔？'},
    {speaker:'姊姊',text:'交換的表，你選了哪裡？'},
    {if:{custom:JP},speaker:'player',text:'日本。三月底出發。'},{if:{custom:JP},speaker:'姊姊',text:'三月。……那過年要多吃一點。'},
    {if:{custom:US},speaker:'player',text:'美國。大四上。'},{if:{custom:US},speaker:'姊姊',text:'八月。那還有一個暑假。'},
    {if:{custom:TW},speaker:'player',text:'沒填。留在臺灣。'},{if:{custom:TW},speaker:'姊姊',text:'留下來也是選了一個。'},
    {speaker:'姊姊',text:'我念歷史的時候，親戚說「念那個以後要幹嘛」。我念到研究所又休學。去補習班教書。現在在出版社。'},
    {speaker:'姊姊',text:'你國中就說要念法律。親戚說太早決定，媽那陣子也擔心，只是沒跟你說。'},   /* AA_886 第 2 節（CANON-NO-ECON-1112 第四批）*/
    {speaker:'姊姊',text:'結果你看。你自己選的，你就念得下去。'},
    {speaker:'姊姊',text:'你從小遇到事情就去翻那本書。……你知道嗎，那時候我覺得你很怪。現在覺得還好。'},
    {choice:[{text:'「妳後悔換方向嗎？」',set:{SISTER_TALK:'regret'},goto:'st_regret'},
      {text:'「我在想畢業以後要不要做法律以外的事。」',if:{custom:G=>typeof STORY!=='undefined'&&!!STORY.careerLean&&STORY.careerLean(G).top==='C'},set:{SISTER_TALK:'other'},goto:'st_other'},
      {text:'「我還在找我要幹嘛。」',set:{SISTER_TALK:'search'},goto:'st_search'}]},
    {label:'st_regret'},{speaker:'姊姊',text:'沒有。後悔完還是要吃飯。'},{goto:'st_end'},
    {label:'st_other'},{speaker:'姊姊',text:'那你喜歡什麼？……不用現在講。你換過一次，你知道換方向不會怎樣。爸媽那邊我來。'},{goto:'st_end'},
    {label:'st_search'},{speaker:'姊姊',text:'我二十六歲也還在找。你急什麼。'},
    {label:'st_end'},
    {speaker:null,text:'（鍋底剩一點湯。她把最後一片肉夾到你碗裡。）'},
    {speaker:'姊姊',text:'過年見。'} ];
  /* 1A-07 主線 9「親戚的土地資料（二）」（AA_317 第 2 節；照主線 2 LAND_Y1 的寫法）：主線 2 沒演（沒有 FAMILY_LAND_Y1）＝「又」拿掉、大伯多一句；陽台兩版 */
  const L1=G=>!!(G.flags&&G.flags.FAMILY_LAND_Y1);
  const LAND_Y3=[ {scene:'臺北・家裡的客廳',bg:'home_living_cny'},
    {if:{custom:L1},speaker:null,text:'（大年初一。客廳的桌上擺著年糕和瓜子。大伯又從公事包裡拿出一疊影印的謄本。）'},
    {unless:{custom:L1},speaker:null,text:'（大年初一。客廳的桌上擺著年糕和瓜子。大伯從公事包裡拿出一疊影印的謄本。）'},
    {speaker:'大伯',text:'{name}，那塊地，十四個人變十六個了。'},
    {unless:{custom:L1},speaker:'大伯',text:'你阿公留下來的那塊地。'},
    {speaker:null,text:'（你翻開謄本。這次看得懂了。）'},
    {speaker:null,text:'（你看得懂了。共有、分割、找不到的繼承人。）'},
    {speaker:null,text:'（可是你也看得懂，卡住的不是法律。）'},
    {speaker:null,text:'（是十六個人，十年沒有坐在同一張桌子上。）'},
    {choice:[{text:'「大伯，我幫你們找一個律師，先把大家約出來。」',set:{FAMILY_LAND_Y3:'lawyer'},goto:'l3_lawyer'},
      {text:'「這個要先把繼承人找齊。我先列一張，再請代書確認。」',set:{FAMILY_LAND_Y3:'list'},goto:'l3_list'},
      {text:'「大伯，你們要不要先吃一頓飯？」',set:{FAMILY_LAND_Y3:'meal'},goto:'l3_meal'}]},   /* 三個都一定出現，不加傾向分數（AA_315 1A-01 第 4 節）*/
    {label:'l3_lawyer'},{speaker:'大伯',text:'……約得出來的話，十年前就約了。'},{speaker:null,text:'（他停了一下。）'},{speaker:'大伯',text:'好。你找。'},{goto:'l3_end'},
    {label:'l3_list'},{speaker:'大伯',text:'列一張？'},{speaker:null,text:'（他把謄本推過來。）'},{speaker:'大伯',text:'好。你列。電話我給你。'},{goto:'l3_end'},
    {label:'l3_meal'},{speaker:null,text:'（全桌笑。）'},{speaker:'大伯',text:'這孩子念法律念到變哲學家。'},{speaker:null,text:'（媽媽在旁邊說：「他說得對啊。」）'},
    {label:'l3_end'},
    {scene:'臺北・家裡的陽台',bg:'home_balcony'},
    {speaker:null,text:'（下午，姊姊在陽台剝橘子。）'},
    {if:{custom:L1},speaker:'姊姊',text:'大一那年，你翻得到、看不懂。'},{if:{custom:L1},speaker:'姊姊',text:'現在看得懂了。……看得懂，比較累吧。'},
    {unless:{custom:L1},speaker:'姊姊',text:'你現在看得懂那種東西了喔。'},{unless:{custom:L1},speaker:'姊姊',text:'……看得懂，比較累吧。'} ];
  const CNY=G=>typeof STORY!=='undefined'&&!!STORY.dayOfKey&&(G.stage||'law')==='law'&&G.day===STORY.dayOfKey('2028-01-26')&&!(G.flags&&G.flags.FAMILY_LAND_Y3);   /* 大三寒假大年初一；三條路線同一天（日本 3/25、美國 8/2 才出發）*/
  /* 1A-08「大四要怎麼過？」（AA_317 第 2 節）：宿舍版（台灣、美國路線）、在家版（日本路線 8/5 返台那晚）；一定要選；Y4_PATH、Y4_PATH_DAY。
     台灣、美國路線那晚人在家裡（週末回家）＝只有「（大四，要怎麼過？）」那一句（宿舍那兩句不合）；10/16 再問一次（ev_y4_path_again）也只有那一句 */
  const PATH_Q=[ {choice:[{text:'「準備國考。律師，可以的話司法官也考。」',set:{Y4_PATH:'bar'},goto:'p_bar'},{text:'「準備研究所。」',set:{Y4_PATH:'grad'},goto:'p_grad'},
      {text:'「先不考。去實習，或做別的事。」',set:{Y4_PATH:'other'},goto:'p_other'},{text:'「還沒決定。」',set:{Y4_PATH:'undecided'},goto:'p_und'}]},
    {label:'p_bar'},{speaker:null,text:'（你在桌曆上，把每個禮拜二、四的晚上圈起來。）'},{goto:'p_end'},
    {label:'p_grad'},{unless:{custom:JP},speaker:null,text:'（你打開系上的網頁，找推甄的簡章。十月報名。）'},{if:{custom:JP},speaker:null,text:'（你查了一下。交換回來要多念一學期，推甄趕不上。筆試在後年二月。）'},{goto:'p_end'},
    {label:'p_other'},{speaker:null,text:'（你把國考的簡章收進抽屜最下面，沒有丟。）'},{goto:'p_end'},
    {label:'p_und'},{speaker:null,text:'（你把四個選項寫在便利貼上，貼在檯燈旁邊。）'},
    {label:'p_end'} ];
  const homeBg=G=>JP(G)||atHome(G);
  const y4Late=G=>typeof STORY!=='undefined'&&!!STORY.y4PathLate&&STORY.y4PathLate(G);
  const PATH=[ {if:{custom:homeBg},scene:'臺北・你的房間',bg:'home_room_night'},
    /* Y4PATH-LATE-1031（AA-B 10-31 回 C）：大四上開學以後才演（舊存檔晚讀進來、10/15 以前）＝開頭換成「（大四開學一陣子了。）」「（你在書桌前坐了很久。）」「（大四，要怎麼過？）」，選項照舊；10/16 以後不演（story3d.js S.y4PathAfter 直接記 undecided）*/
    {if:{custom:G=>!homeBg(G)&&!y4Late(G)},speaker:null,text:'（最後一科考完。宿舍很安靜，隔壁在收行李。）'},{if:{custom:y4Late},speaker:null,text:'（大四開學一陣子了。）'},{if:{custom:G=>!homeBg(G)||y4Late(G)},speaker:null,text:'（你在書桌前坐了很久。）'},
    {if:{custom:G=>JP(G)&&!y4Late(G)},speaker:null,text:'（日本的行李還沒拆完。客廳傳來電視的聲音。）'},{if:{custom:G=>JP(G)&&!y4Late(G)},speaker:null,text:'（一個月以後就大四了。）'},
    {speaker:null,text:'（大四，要怎麼過？）'} ].concat(PATH_Q);
  const PATH_AGAIN=[ {if:{custom:atHome},scene:'臺北・你的房間',bg:'home_room_night'},{speaker:null,text:'（大四，要怎麼過？）'} ].concat(PATH_Q);
  /* 1A-10 R1「時差」（AA_318 第 2 節＋e75ebc69 芯慈兩句）：每一段要說話的人、被問到的人都 FAMILIAR 以上（不熟的人不到場、句子跳過）；語彤那三句：日本路線對祐廷、台灣路線對以安；
     台灣路線多「這半年」四選一（只出經歷過的）；子晴晚到（以安、子晴都熟）；芷若那句（芷若、子晴都熟）；芯慈（XINCI_FIRST＝慈 6，AA_326，還沒做＝不出現）。到場的人熟悉度 +1；R1_SEEN 'table' */
  const XC=G=>!!(G.flags&&G.flags.XINCI_FIRST)&&fam('classmate_xinci')&&fam('heroine_01');
  const R1=[ {scene:'公館燒臘・長桌',bg:'noodle_table'},
    {speaker:'zhe',text:'欸，你們回來了。'},
    {if:{custom:G=>fam('heroine_01')&&!fam('heroine_03')&&!!G.flags.AN_FIRST_BOWL},speaker:null,text:'（以安把菜單推到你面前，指甲在「滷蛋」那一格敲了兩下。）'},{if:{custom:G=>fam('heroine_01')&&!fam('heroine_03')&&!!G.flags.AN_FIRST_BOWL},speaker:'heroine_01',text:'說好的。'},   /* AA_524 A1（語彤不到場的版本）*/
    {if:{custom:all('heroine_01','yu')},speaker:'heroine_01',text:'阿哲，Alison 呢？她不是每次都坐你旁邊？'},
    {if:{custom:all('heroine_01','yu')},speaker:'zhe',text:'她在看電影。一個人。'},
    {if:{custom:all('heroine_01','yu')},speaker:'heroine_01',text:'一個人？'},
    {if:{custom:all('heroine_01','yu')},speaker:'zhe',text:'（很得意）她現在會一個人去看電影了。看完會打給我講劇情。講兩個小時。'},
    {if:{custom:all('heroine_01','yu')},speaker:'yu',text:'（剛好進門）我聽到我的名字了。（坐到阿哲旁邊）那部超好看，你們都要去看。'},
    {if:{custom:G=>JP(G)&&fam('heroine_03')},speaker:'heroine_03',text:'你曬黑了。'},{if:{custom:G=>JP(G)&&fam('heroine_03')},speaker:'player',text:'日本的夏天。'},{if:{custom:G=>JP(G)&&fam('heroine_03')},speaker:'heroine_03',text:'那就是吃太多。'},
    {if:{custom:G=>!JP(G)&&fam('heroine_03')&&fam('heroine_01')},speaker:'heroine_03',text:'妳曬黑了。'},{if:{custom:G=>!JP(G)&&fam('heroine_03')&&fam('heroine_01')},speaker:'heroine_01',text:'日本的夏天。'},{if:{custom:G=>!JP(G)&&fam('heroine_03')&&fam('heroine_01')},speaker:'heroine_03',text:'那就是吃太多。'},
    {if:{custom:all('heroine_01','heroine_03')},speaker:'heroine_01',text:'語彤，妳上學期都在幹嘛？'},
    {if:{custom:all('heroine_01','heroine_03')},speaker:'heroine_03',text:'（從背包拿出一本很厚的筆記）訪問了二十三個老闆。……蘇姨是第二十三個。'},
    {if:{custom:all('heroine_01','heroine_03')},speaker:'heroine_03',text:'她一開始說她沒有故事。後來我問她，店為什麼叫一盞，她講了兩個小時。'},   /* AA_677 第 4 節（企劃線 d784b1634）：蘇姨後來答應受訪的原因（改變心意要有原因）*/
    {if:{custom:all('heroine_01','heroine_03')},speaker:'heroine_01',text:'給我看。'},
    {if:{custom:all('heroine_01','heroine_03')},speaker:'heroine_03',text:'吃飯先。'},
    /* AA_524 A1：餞行（y34b3d.js fw_b）或閒聊階梯 A5-L8 說了「回來第一碗我請。」（AN_FIRST_BOWL）——以安在場：放在語彤「吃麵先。」之後；沒有語彤那幾句的放在阿哲第一句之後（上面）*/
    {if:{custom:G=>all('heroine_01','heroine_03')()&&!!G.flags.AN_FIRST_BOWL},speaker:null,text:'（以安把菜單推到你面前，指甲在「滷蛋」那一格敲了兩下。）'},{if:{custom:G=>all('heroine_01','heroine_03')()&&!!G.flags.AN_FIRST_BOWL},speaker:'heroine_01',text:'說好的。'},
    {if:{custom:XC},speaker:null,text:'（芯慈坐到以安旁邊，先開口。）'},{if:{custom:XC},speaker:'classmate_xinci',text:'我跟妳說一部劇。'},{if:{custom:XC},speaker:'heroine_01',text:'好。是上次那部嗎？我看了兩集。'},   /* AA_547 第 4 節（原本「……好。妳說。」）*/
    {unless:{custom:G=>TW(G)&&fam('yu')},goto:'r1_late'},
    {speaker:'yu',text:'欸，你一直在臺灣。這半年發生什麼事？'},
    {choice:[{text:'「語彤每個禮拜四都去市場訪問。我跟過幾次。」',if:{custom:G=>!!G.flags.YT_T1},goto:'r1_yt'},   /* 1B-13 週四的田野（AA_322 YT_T1）*/
      {text:'「子晴的發表會，最後一關有人打過了。」',if:{custom:G=>!!G.flags.ATTENDED_SHOW},goto:'r1_zq'},   /* 1B-15 Q12（AA_322 ATTENDED_SHOW）*/
      {text:'「芷若回來半年，九月又去英國了。這次是念研究所。」',if:{custom:()=>fam('heroine_02')},goto:'r1_zr'},
      {text:'「（先聽大家講）」',goto:'r1_listen'}]},
    {label:'r1_yt'},{speaker:'heroine_03',text:'你只會站在旁邊吃東西。'},{goto:'r1_late'},
    {label:'r1_zq'},{if:{custom:()=>fam('heroine_01')},speaker:'heroine_01',text:'誰？'},{speaker:'player',text:'……她自己講比較好。'},{goto:'r1_late'},
    {label:'r1_zr'},{speaker:'yu',text:'又？'},{speaker:'zhe',text:'她是去念書，不是去旅行。'},{goto:'r1_late'},
    {label:'r1_listen'},{speaker:null,text:'（你把筷子拿起來，讓別人先說。）'},
    {label:'r1_late'},
    {unless:{custom:all('heroine_04','heroine_01')},goto:'r1_end'},
    {speaker:null,text:'（長桌還有一個空位。過了半小時，門口有人喘著氣。）'},{advance:0.5},
    {speaker:'heroine_04',text:'欸不是，我下班了。（坐下，第一句就問以安）日本的貓胖嗎？'},
    {speaker:'heroine_01',text:'胖。很胖。'},
    {if:{custom:()=>fam('heroine_02')},speaker:'heroine_04',text:'（低頭看手機）喔對，芷若說英國在下雨。她每次都這樣說。'},
    {label:'r1_end'},
    {advance:G=>Math.max(0,21-(G.hour%24))},
    {speaker:null,text:'（九點。）'},{speaker:null,text:'（阿姨把滷蛋切成兩半，一人一半。）'},   /* AA_519 1-3：送小菜第五處＝第 4 句（「九點。」照舊，拆成兩句）*/
    {speaker:'zhe',text:'下禮拜四，一樣。'},
    {set:{R1_SEEN:'table'}},{rel:{zhe:{fam:1}}},
    {if:{custom:()=>fam('heroine_01')},rel:{heroine_01:{fam:1}}},{if:{custom:()=>fam('yu')},rel:{yu:{fam:1}}},{if:{custom:()=>fam('heroine_03')},rel:{heroine_03:{fam:1}}},
    {if:{custom:all('heroine_04','heroine_01')},rel:{heroine_04:{fam:1}}},{if:{custom:XC},rel:{classmate_xinci:{fam:1}}} ];
  /* 1A-12 主線 12 晚上的信封（AA_318 第 2 節）：讀 FAMILY_LAND_Y3（1A-07）；最後夾進舊《民法》 */
  const ENVELOPE=[ {speaker:null,text:'（晚上，你打開大伯的信封。）'},
    {if:{flagIs:{FAMILY_LAND_Y3:'lawyer'}},speaker:null,text:'（一張名片。背面是大伯的字：「律師找到了。他說你介紹的，所以算便宜一點。」）'},
    {if:{flagIs:{FAMILY_LAND_Y3:'list'}},speaker:null,text:'（你大三寒假列的那張繼承人名單。大伯在上面打了十六個勾，最下面寫：「都找到了。」）'},
    {if:{flagIs:{FAMILY_LAND_Y3:'meal'}},speaker:null,text:'（一張餐廳的訂位單。十六個人。日期是下個月。）'},
    {unless:{flagIs:{FAMILY_LAND_Y3:['lawyer','list','meal']}},speaker:null,text:'（那塊地最新的謄本。大伯在上面寫了一句：「十六個。慢慢來。」）'},
    {speaker:null,text:'（你把它放回信封裡，夾進舊《民法》。）'} ];
  const envDue=G=>typeof STORY!=='undefined'&&!!STORY.gradEnvelopeDue&&STORY.gradEnvelopeDue(G);
  return [
    { id:'ev_sister_hotpot', title:'姊姊', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:2, dialogue:HOTPOT,
      outingMissed:G=>{ if(typeof PHONE!=='undefined'&&typeof STORY!=='undefined') PHONE.at(G,STORY.dayOfKey('2028-01-12'),19.75,[{th:'p:sister',from:'sister',name:'姊姊',text:'好。那過年見。'}],'y3_sis_hotpot_miss'); } },   /* 答應了沒到：19:45（AA_180 2-7）*/
    { id:'ev_family_land_y3', title:'親戚的土地資料（二）', participants:[], location:'any', trigger:'home', priority:9, time:[7,18], once:true, background:'dark',
      prereq:{custom:CNY}, dialogue:LAND_Y3, consequences:{advance:2} },   /* 在家的第一個時段（home3d.js 的寒假選單：起床後第一輪就演）*/
    { id:'ev_family_land_y3_bed', title:'親戚的土地資料（二）', participants:[], location:'any', trigger:'sleep', priority:9, once:true, background:'dark', sleepCard:['大年初一','家'],
      prereq:{custom:G=>CNY(G)&&!(G.events&&G.events.done&&G.events.done.ev_family_land_y3)}, dialogue:LAND_Y3 },   /* 那天白天都不在家：睡著時演（同主線 2 的 _bed）*/
    { id:'ev_y4_path', title:'大四要怎麼過？', participants:[], location:'any', trigger:'manual', once:true, background:'blur', dialogue:PATH, consequences:{stamp:['Y4_PATH_DAY']} },
    { id:'ev_y4_path_again', title:'大四要怎麼過？', participants:[], location:'any', trigger:'manual', once:true, background:'blur', dialogue:PATH_AGAIN },
    { id:'ev_r1_jetlag', title:'時差', participants:[], location:'any', trigger:'manual', once:true, background:'dark', dialogue:R1 },
    { id:'ev_grad_envelope', title:'大伯的信封', participants:[], location:'any', trigger:'manual', once:true, background:'blur', dialogue:ENVELOPE },
    { id:'ev_grad_envelope_bed', title:'大伯的信封', participants:[], location:'any', trigger:'sleep', priority:9, once:true, background:'blur',
      prereq:{custom:G=>envDue(G)}, dialogue:ENVELOPE } ];   /* 22:00 以後沒回到房間就睡著（例：凌晨 2:30 走回宿舍）：睡著時演 */
})();
Array.prototype.push.apply(STORY_EVENTS,Y4_EVENTS);
/* AA_402（企劃線 235cf61ac；AA_389 第 8 點）：柏翰、芯慈大二起每學期兩句閒聊（取代 AA_313 5-1 第 15 點的閒聊階梯）；每句 once，條件照稿的「條件」欄（柏翰大二是法服社長＝固定設定，那一句不另加條件） */
{ const after=k=>({custom:G=>typeof STORY!=='undefined'&&STORY.dayOfKey&&G.day>=STORY.dayOfKey(k)}), notJP={custom:G=>!(G.flags&&G.flags.EXCHANGE_ROUTE==='JP')};
  SMALLTALK.classmate_bohan.push(
    {t:'法服的值班表，我排到十二月了。',term:['Y2S1'],once:true},
    {t:'這學期我週三晚上空出來了。要讀書的話，可以找我。',term:['Y2S1'],week:[7,99],once:true,unless:{custom:G=>{ if(G.flags&&G.flags.dating_classmate_peishan) return true; const R=typeof ROM!=='undefined'&&ROM.get?ROM.get(G,'classmate_peishan'):null, y=typeof CALENDAR!=='undefined'&&CALENDAR.termDays?CALENDAR.termDays('Y1S2'):null; return !!(R&&R.sinceDay!=null&&y&&R.sinceDay<=y.to); }}},   /* AA_409 第 3 節：只給柏翰和沛珊真的交往過的玩家（大一下和祐廷交往的沒有）*/
    {t:'法服這學期的個案，比上學期多一倍。',term:['Y2S2'],once:true},
    {t:'你下學期修幾學分。我在看要不要多修一門。',term:['Y2S2'],week:[12,99],once:true},
    {t:'社長交出去了。週六早上我還是會去。習慣了。',term:['Y3S1'],once:true},
    {t:'四樓樓梯間，下午兩點以後就沒有人了。',term:['Y3S1'],if:{events:['ev_bohan_third_floor']},once:true},
    {t:'推甄的書面資料，我寫到第四版了。',term:['Y3S2'],once:true},
    {t:'暑假我不回新竹。總圖暑假也開。',term:['Y3S2'],week:[13,99],once:true},
    {t:'面試的問題，我準備了四十題。',term:['Y4S1'],week:[5,8],once:true},
    {t:'推甄上了。……我媽在電話裡哭了，我沒有。',term:['Y4S1'],week:[12,99],once:true},
    {t:'國考讀書會的考古題，我排到七月了。',term:['Y4S2'],if:after('2029-03-01'),once:true},
    {t:'研究所九月開學。國考在那之前。時間剛好。',term:['Y4S2'],once:true});
  SMALLTALK.classmate_xinci.push(
    {t:'財金系的課跟法律系的撞了一堂，我改修晚上那一班。',   /* AA_547 第 4 節 */term:['Y2S1'],if:{events:['ev_xinci_double']},once:true},
    {t:'我每天早上七點的公車。永和過來要四十分鐘。',term:['Y2S1'],if:{notEvents:['ev_xinci_double']},once:true},
    {t:'上禮拜的筆記我做了兩份，一份給以安。……她沒有要，是我自己給的。',term:['Y2S1'],once:true},
    {t:'週四晚上我借了一間討論室。你要來的話，我多印一份。',term:['Y2S2'],once:true},
    {t:'期末考完那天晚上，有空嗎？我先問，你不用現在回答。',term:['Y2S2'],week:[13,99],once:true},
    {t:'我爸說寒假可以去事務所幫忙。……我還沒決定。',term:['Y3S1'],once:true},
    {t:'以安的交換，你知道她選哪裡嗎？……我只是問。',term:['Y3S1'],week:[8,12],once:true},
    {t:'以安不在，她的位子一直空著。我想把書放上去，又沒放。',term:['Y3S2'],if:{custom:G=>after('2028-03-25').custom(G)&&notJP.custom(G)},once:true},   /* 以安去日本以後；日本路線的祐廷這時也不在。AA_497 2-9：她本來就坐第一排，原本的「以安不在，第一排的位子我坐了。……沒有比較好。」換成這一句 */
    {t:'暑假我在我爸的事務所。九點到六點，跟上班一樣。',term:['Y3S2'],week:[13,99],once:true},
    {t:'國考跟研究所，我兩個都報了。本來想先實習再說的。',term:['Y4S1'],once:true},   /* AA_497 2-9：取代「國考跟研究所，我兩個都報了。」（接上大三上「先實習再決定」）*/
    /* AA_497 2-9 追劇減量：大二以後一學期最多一次、保留慈 3、慈 6、R1、尾聲各一句——大四上 R1（「我跟妳說一部劇。」）那一學期的「我最近在追一部日劇。……」拿掉（閒聊池那一句換成下表）*/
    {t:'畢業典禮那天，我媽要請假。她說要坐第一排。',term:['Y4S2'],week:[10,99],once:true},
    {t:'國考那天，我叫我媽不要來。……她說她會在外面等。',term:['Y4S2'],if:after('2029-06-01'),once:true},
    /* AA_497 2-9 新閒聊（企劃線 7a38216ca）：每句一次；大三下、大四下兩句要有 XC5_RECONCILE；句子用完以後的旁白在 STORY.SMALL_AFTER（src/sup497_3d.js）*/
    {t:'永和到這裡要換一次車。我在車上可以看完一章。',term:['Y2S2'],once:true},
    {t:'這學期雙主修的課沒有撞堂。……我把那一格空下來了。',term:['Y3S1'],once:true},
    {t:'以安的手帳跟我用的是同一款。我們兩個都沒說。',term:['Y3S2'],if:{flags:['XC5_RECONCILE']},once:true},
    {t:'最後一堂課，我坐第一排。以安坐我旁邊。',term:['Y4S2'],if:{flags:['XC5_RECONCILE']},once:true}); }
/* AA_403（企劃線 720f32472；AA_389 第 9 點）：ev_grad_debate 選了「不同意」（W3_STANCE 'no'），學姊說「下次見面，這一段你來講。」的兌現——
   演完至少 3 天以後，在總圖、萬才館、Café 找她說話先演（同 ev_grad_debate 的 interact）；只一次；大二上結束以後不演 */
STORY_EVENTS.push({ id:'ev_grad_debate_teach', title:'這一段你來講', participants:['heroine_05'], location:['library','wancai','cafe'], trigger:'interact', priority:9, once:true, background:'blur',
  prereq:{custom:G=>{ const F=G.flags||{}, L=(G.events&&G.events.last)||{}, end=typeof CALENDAR!=='undefined'&&CALENDAR.termDays?CALENDAR.termDays('Y2S1'):null;
    return F.W3_STANCE==='no'&&L.ev_grad_debate!=null&&G.day>=L.ev_grad_debate+3&&!!end&&G.day<=end.to; }},
  dialogue:[ {speaker:null,text:'（她把那篇文章攤開在第二節。你上次用鉛筆寫的字，旁邊多了幾個她的問號。）'},
    {speaker:'heroine_05',text:'上次說好的。這一段，你講給我聽。'},{speaker:'heroine_05',text:'當我沒讀過。'},
    {choice:[{text:'「先講他想保護什麼，再講他跳過哪一步。」',goto:'o'},{text:'「直接講他跳過的那一步。」',goto:'d'}]},
    {label:'o'},{speaker:null,text:'（你講了八分鐘。她一次都沒有打斷。）'},{speaker:'heroine_05',text:'順序對了。'},{speaker:'heroine_05',text:'我第一次講給許老師聽的時候，是先講他錯在哪。老師說，那樣聽的人會先想反駁。'},{set:{W3_TAUGHT:'order'}},{goto:'e'},
    {label:'d'},{speaker:null,text:'（你三分鐘就講完了。）'},{speaker:'heroine_05',text:'快。'},{speaker:'heroine_05',text:'……可是聽的人會問：那他為什麼要跳？'},{set:{W3_TAUGHT:'direct'}},
    {label:'e'},{speaker:null,text:'（她用鉛筆在你的字旁邊，把一個問號擦掉了。）'},{speaker:'heroine_05',text:'好。文章你留著。'},
    {if:{custom:G=>!!(G.flags&&G.flags.dating_heroine_05)},speaker:null,text:'（她把文章推過來的時候，手指在你的鉛筆字上停了一下。）'},
    {mem:[{npc:'heroine_05',tag:'W3_TAUGHT',note:''}]},{consequences:{rel:{heroine_05:{resp:4,fam:2}}}} ] });
/* ===== 好朋友的名片場（AA_606 第 3、4 節，X157 STORY-FRIENDS-EVENTS-1103；使用者 11-03「我除了女主角，連人名都記不起來」）=====
     大一上第 1～5 週每人一場、自動播放（玩家本來就會在的地方：203、上課前的教室、下課；Alison 改在第一次和阿哲去麵店時認識，見 ZHE_FIRST_TABLE）；法律系、大一上、和那個人還沒演過（FRIEND_CARD_<id>）。
     演完記 FRIEND_CARD_<id>、記憶 FRIEND_CARD（note＝場名）、熟悉 +2，不給別的。課堂的那兩場（柏翰、明軒）同一堂撞到別的事件就延到下一次同一門課，最晚第 5 週（carryTo，AA_606 第 5 節「撞到已有場次就往後」）。*/
(function(){ const card=(id,note)=>({set:{['FRIEND_CARD_'+id]:true},mem:[{npc:id,tag:'FRIEND_CARD',note}],rel:{[id]:{fam:2}}}), F=G=>G.flags||{}, dk=k=>typeof STORY!=='undefined'?STORY.dayOfKey(k):null;
    const inDorm=(G,id)=>typeof STORY!=='undefined'&&!!STORY.dormWho&&STORY.dormWho(G).some(w=>w[0]===id);   /* 照 203 的作息現在在房間（書桌前）*/
    /* 課堂的名片場讓位（AA_606 第 5 節「同一天撞到已有場次就往後」）：同一堂課已經有別的上課前／下課後事件可以演＝這一堂不演，延到下一次（carryTo）。
       名片場排在 STORY_EVENTS 比較前面（sup497 的事件比較晚 push），不讓位的話會搶走 ev_yu_meet 那類固定場次的那一堂 */
    let yielding=false; const busyBefore=(it,self)=>{ if(yielding||typeof EVENTS==='undefined') return false; yielding=true; try{ return STORY_EVENTS.some(e=>e!==self&&!e.retired&&(e.beforeClass===it.c.id||(typeof e.beforeClass==='function'&&e.beforeClass(it)))&&EVENTS.check(e,{chain:true})); } finally { yielding=false; } };
    const busyAfter=(it,self)=>{ if(yielding||typeof CLS==='undefined'||!CLS.afterClassOk) return false; yielding=true; try{ const ok=CLS.afterClassOk(it); return STORY_EVENTS.some(e=>e!==self&&!e.retired&&!e.classAlso&&ok(e)); } finally { yielding=false; } };
  STORY_EVENTS.push(
    /* 3-1 阿凱「凌晨的作業」：第 1 週，9/2（二）23:30 以後第一次在 203（阿凱在房間）*/
    { id:'ev_card_kai', title:'凌晨的作業', participants:['kai'], location:'dorm', trigger:'auto', once:true, term:['Y1S1'], weeks:[1], time:[23.5,26], background:'blur',
      prereq:{custom:G=>!F(G).FRIEND_CARD_kai&&G.day>=dk('2025-09-02')&&inDorm(G,'kai')},
      dialogue:[ {speaker:null,text:'（十二點。房間只剩阿凱的螢幕亮著。）'},
        {speaker:'kai',text:'你還沒睡？'},
        {speaker:'kai',text:'我在寫程式作業。資工系的，明天早上交。'},
        {choice:[{text:'「要我關燈嗎？」',goto:'light'},{text:'「寫多久了？」',goto:'long'}]},
        {label:'light'},{speaker:'kai',text:'不用。我戴耳機，你睡你的。'},{goto:'end'},
        {label:'long'},{speaker:'kai',text:'九點開始。……不要跟阿哲說，他會拉我去吃宵夜。'},
        {label:'end'},
        {speaker:null,text:'（隔天早上，你桌上多了一杯豆漿。阿凱已經去上課了。）'},
        card('kai','凌晨寫作業，隔天桌上多了一杯豆漿') ] },
    /* 3-2 柏翰「第一排」：第 2 週民法總則上課前（教室）；9/1 已經有柏翰第一排那場（ev_bohan_w1_front）的，第一句改「{name}。今天也坐這裡。」*/
    { id:'ev_card_bohan', title:'第一排', participants:['classmate_bohan'], location:'any', trigger:'class', yieldClass:true, beforeClass:function(it){ return !!(it&&it.c&&it.c.id==='civ_general')&&!busyBefore(it,this); }, once:true, term:['Y1S1'], weeks:[2], carryTo:5, background:'blur',
      prereq:{custom:G=>!F(G).FRIEND_CARD_classmate_bohan},
      dialogue:[ {speaker:null,text:'（民總。第一排正中間，柏翰已經把課本、筆記本、三支筆排好。）'},
        {unless:{custom:G=>!!(G.events&&G.events.done&&G.events.done.ev_bohan_w1_front)},speaker:'classmate_bohan',text:'{name}。這裡。'},
        {if:{custom:G=>!!(G.events&&G.events.done&&G.events.done.ev_bohan_w1_front)},speaker:'classmate_bohan',text:'{name}。今天也坐這裡。'},
        {speaker:'classmate_bohan',text:'第一排聽得最清楚。我量過，第八排開始，老師的聲音會被冷氣蓋掉。'},
        {choice:[{text:'「你真的量過？」',goto:'q'},{text:'「好，我坐這。」',goto:'sit'}]},
        {label:'q'},{speaker:'classmate_bohan',text:'上週。每一排坐五分鐘。'},{goto:'end'},
        {label:'sit'},{speaker:null,text:'（他把旁邊的桌面擦了一下。）'},
        {label:'end'},
        {speaker:'classmate_bohan',text:'我念得慢。坐前面，回去可以少讀一遍。'},
        card('classmate_bohan','民總坐第一排') ] },
    /* 3-3 Alison：改成第一次和阿哲去麵店時認識（ZHE_FIRST_TABLE 開頭，AA_606 3-3 11-03 版；原本的「第一班捷運」作廢）*/
    /* 3-4 明軒「公館便宜好吃.xlsx」：第 3 週第一次上完法律系的必修下課（明軒和你同班，每一門必修都有修）*/
    { id:'ev_card_mingxuan', title:'公館便宜好吃.xlsx', participants:['classmate_mingxuan'], location:'any', trigger:'class', yieldClass:true, afterClass:function(it){ return !!(it&&it.c&&it.c.kind==='required')&&!busyAfter(it,this); }, once:true, term:['Y1S1'], weeks:[3], carryTo:5, background:'blur',
      prereq:{custom:G=>!F(G).FRIEND_CARD_classmate_mingxuan},
      dialogue:[ {speaker:null,text:'（下課鐘一響，前排一個戴帽子的男生第一個收好書包。是宿營遊覽車上一直在睡的那個人。）'},   /* AA_606 3-4（AA_608 10-1 的回扣）*/
        {speaker:'classmate_mingxuan',text:'欸，{name}，我先走，公車要趕。'},
        {speaker:null,text:'（他把一張摺好的紙塞給你。）'},
        {speaker:'classmate_mingxuan',text:'公館便宜好吃的店，我自己整理的。不要外流喔。'},
        {choice:[{text:'「你要去哪？」',goto:'where'},{text:'「謝了。」',goto:'thx'}]},
        {label:'where'},{speaker:'classmate_mingxuan',text:'家教。國中生，數學。……你什麼都沒看到。'},{goto:'end'},
        {label:'thx'},{speaker:'classmate_mingxuan',text:'下次我請。……一顆滷蛋。'},
        {label:'end'},
        {speaker:null,text:'（你打開那張紙。第一行寫著：「江明軒製」。）'},
        card('classmate_mingxuan','公館便宜好吃的清單') ] },
    /* 3-5 阿哲「四碗麵」：第 4 週，9/23（二）22:00 以後第一次在 203、阿凱和柏翰都在房間（203 四人房，STORY.dormWho）*/
    { id:'ev_card_zhe', title:'四個便當', participants:['zhe','kai','classmate_bohan'], location:'dorm', trigger:'auto', once:true, term:['Y1S1'], weeks:[4], time:[22,26], background:'blur',
      prereq:{custom:G=>!F(G).FRIEND_CARD_zhe&&G.day>=dk('2025-09-23')&&inDorm(G,'kai')&&inDorm(G,'classmate_bohan')},
      dialogue:[ {speaker:null,text:'（晚上十點，阿哲提著四個燒臘便當進門。）'},
        {speaker:'zhe',text:'阿凱、柏翰、{name}。宵夜。我揪的，算我的。'},
        {speaker:'classmate_bohan',text:'一碗六十五。我轉你。'},
        {speaker:'zhe',text:'沒事啦。'},
        {speaker:'kai',text:'那下次我買。……所以下次是什麼時候。'},
        {choice:[{text:'「謝啦，阿哲。」',goto:'thx'},{text:'「我也轉你。」',goto:'pay'}]},
        {label:'thx'},{speaker:'zhe',text:'吃啦，要冷了。'},{goto:'end'},
        {label:'pay'},{unless:{flags:['ZHE_CALLS_GE']},speaker:'zhe',text:'不用啦。'},{if:{flags:['ZHE_CALLS_GE']},speaker:'zhe',text:'不用啦，哥。'},
        {label:'end'},
        {speaker:null,text:'（四個人坐在地板上吃。阿凱的螢幕還亮著，柏翰把湯喝完才開口：「好吃。」）'},
        card('zhe','提了四個便當回來') ] },
    /* 第 4 節 群像「考完吃哪家」：第 13 週最後一堂刑總下課，自動；和阿哲 FRIEND 以上、或演過四碗麵。芯慈不在場（只被提到）。
       選「明軒那家。」記 Y1S1_EXAM_MEAL_PICK 'mx'（之後考完吃飯那則手機邀約照舊；那頓飯的旁白還沒接這個旗標）*/
    { id:'ev_friends_exam_meal', title:'考完吃哪家', participants:['zhe','classmate_bohan','classmate_mingxuan','yu'], location:'any', trigger:'class', afterClass:'crim_gen1', once:true, term:['Y1S1'], weeks:[13], background:'blur',
      prereq:{custom:G=>!!F(G).FRIEND_CARD_zhe||(typeof SOCIAL!=='undefined'&&SOCIAL.STAGES.indexOf(SOCIAL.friendLevel('zhe'))>=SOCIAL.STAGES.indexOf('FRIEND'))},
      dialogue:[ {speaker:null,text:'（刑總下課。走廊上，阿哲已經在點人數。）'},
        {speaker:'zhe',text:'考完那天，吃飯。柏翰、明軒、Alison、{name}。芯慈呢？'},
        {speaker:'yu',text:'她說要提前一天約才算數。我幫她約了！'},
        {speaker:'yu',text:'我姊二月要考研究所，法律的。她最近都在讀書，我傳訊息她都沒回。'},{set:{HEARD_YU_SISTER:true}},   /* AA_609 8-1（AA_606 第 4 節，企劃線 7b9fee50b）：不提學校、不提名字；記 HEARD_YU_SISTER＝礁溪那一場（encounters.js D24）多「你想起 Alison 說過……」那一句旁白 */
        {speaker:'classmate_bohan',text:'最後一科考完是下午三點十分。'},
        {speaker:'classmate_mingxuan',text:'燒臘店四點半才開。……我知道一家三點就開的。'},
        {speaker:'zhe',text:'所以哪家？'},
        {speaker:'classmate_mingxuan',text:'（拿出手機）表上第三列。'},
        {choice:[{text:'「我都可以。」'},{text:'「明軒那家。」',set:{Y1S1_EXAM_MEAL_PICK:'mx'}}]},
        /* AA_623 第 2 節：一直沒去桌遊夜、還不在桌遊團的玩家＝明軒當場加進群組（story3d.js phoneRules 照 noodleTableDay 加；BGN_JOIN 'w13'＝「明軒把你加進了群組」）*/
        {if:{custom:G=>BGN_NOT_IN(G)},speaker:'classmate_mingxuan',text:'你也進來吧。'},
        {call:async(G)=>{ if(BGN_NOT_IN(G)){ G.flags.noodleTableDay=G.day; G.flags.BGN_JOIN='w13'; } }} ] } ); })();
