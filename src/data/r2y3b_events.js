/* ===== 第 2 輪之二（大三）後半：AA_326 2-Y3-26～2-Y3-54（AA-C 定稿 e284d601，第②級；台詞照原文、不改字）=====
   這裡是用事件系統演的段落（出遊、在場景裡碰到的、電話、視訊）；手機、時間窗、出發選單、寒暑假的停留日、學期末專屬版在 src/r2y3b3d.js（R2Y3B）。
   2-Y3-26 ev_y3s2_first_meal　27 ev_y3s2_228　28 ev_an_azalea_y3　29 ev_yu_club_money　30 ev_kexin_k18（＋ev_kexin_k18_call）
   2-Y3-31 ev_xun_path　33 ev_yu_alone_breakfast（＋_call）　34 ev_an_konbini　35 ev_liheng_japan　36 ev_y3s2_roof_toast　37 ev_an_sakura_riverbank
   2-Y3-38 ev_far_call_jp　39 ev_yu_alone_movie（傅鐘／麵店／視訊）　40 ev_zhiruo_third_row　41 ev_kexin_birthday_y3　42 ev_xinci_first_place（＋_video）
   2-Y3-43 ev_an_town_notice（＋ev_an_town_notice_repair）　44 ev_kexin_k20（＋_call）　45 ev_fangyt_tickets（電話）、ev_zhiruo_f3_cafe
   2-Y3-51 ev_x1_moveout_us　52 ev_an_abroad_video、ev_an_tanabata、ev_an_airport_y3、ev_an_notebook　53 ev_an_white_day、ev_an_far_video
   2-Y3-54 ev_zhiruo_twelve_slips（BB_165 3-2，AA-C 10-18 審過的台詞）；46、47（學期末專屬版）在 r2y3b3d.js 接 TERMEND。
   不重做：32（AA_322）、48（AA_317）、50（AA_322、AA_323）。測試：node tests/r2y3b_events_unit.js */
'use strict';
const R2Y3B_EVENTS=(function(){
  const knows=(id,G)=>typeof STORY!=='undefined'&&!!STORY.knows&&STORY.knows(id,G);
  const kn=(...ids)=>({custom:G=>ids.every(id=>knows(id,G))});
  const stAt=(G,id,st)=>knows(id,G)&&typeof SOCIAL!=='undefined'&&!!SOCIAL.STAGES&&SOCIAL.STAGES.indexOf(SOCIAL.stage(id))>=SOCIAL.STAGES.indexOf(st);
  const fam=(id,st)=>({custom:G=>stAt(G,id,st||'FAMILIAR')});
  const dating=(G,id)=>{ const F=(G&&G.flags)||{}, R=F.romance||{}; return F['dating_'+id]===true||!!(R[id]&&R[id].status==='dating'); };
  const dt=id=>({custom:G=>dating(G,id)});
  const route=G=>typeof STORY!=='undefined'&&STORY.route?STORY.route(G):null;
  const JP={custom:G=>route(G)==='JP'};
  const hasCG=id=>typeof CG_REGISTRY!=='undefined'&&!!CG_REGISTRY[id];
  const cg=id=>({if:{custom:()=>hasCG(id)},cg:id});   /* CG 登錄了才放（CG_REGISTRY；沒有就照原背景演）*/
  const X=()=>typeof R2Y3B!=='undefined'?R2Y3B:null;
  const fl=(k,v)=>({custom:G=>(G.flags||{})[k]===v});

  /* ---------- 2-Y3-26 開學第一頓（大三下）：2028-02-22（二）19:00 麵店長桌（17:00 阿哲揪；沒去＝21:30 群組照片）---------- */
  const FIRST_MEAL={ id:'ev_y3s2_first_meal', title:'開學第一頓（大三下）', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:1.5,
    dialogue:[ {scene:'阿鳳麵店・長桌',bg:'noodle_table'},
      {speaker:null,text:'（麵店的長桌。語彤在廚房門口，圍裙還沒脫。）'},
      {if:kn('zhe','heroine_01'),speaker:'zhe',text:'這學期以安只吃一個月。'},
      {if:kn('heroine_01'),speaker:'heroine_01',text:'一個月又三天。三月二十五號的飛機。'},
      {if:kn('yu','heroine_01'),speaker:'yu',text:'那三月以前每一頓都要來喔。'},
      {if:kn('heroine_01','yu'),speaker:'heroine_01',text:'……好。週二、週四。'},
      {if:{custom:G=>route(G)==='JP'&&knows('zhe',G)&&knows('heroine_01',G)},speaker:'zhe',text:'（轉向你）你也是。一個月又三天。'},   /* 日本路線多一句 */
      {if:kn('heroine_03'),speaker:'heroine_03',text:'（端麵過來）……今天週二。週四我不在店裡了。'},
      {if:kn('heroine_03','zhe'),speaker:'zhe',text:'她週四有自己的事了。'},
      {choice:[{text:'「先吃。」',goto:'a'},{text:'「週四妳去哪？」',if:kn('heroine_03'),goto:'b'}]},
      {label:'a'},{if:kn('zhe'),speaker:'zhe',text:'對。先吃。'},{goto:'end'},
      {label:'b'},{speaker:'heroine_03',text:'……去問人問題。'},{speaker:null,text:'（她回廚房了。）'},
      {label:'end'} ],
    consequences:{flags:{Y3S2_FIRST_MEAL:true},memo:'大三下的開學第一頓（麵店）'},
    outingMissed:G=>{ const x=X(); if(x) x.firstMealPhoto(G); } };

  /* ---------- 2-Y3-27 228 河濱：2028-02-28（一）14:00～17:00 公館河濱（2/27 21:00 阿哲揪；沒去＝17:30 小語在群組）---------- */
  const R228={ id:'ev_y3s2_228', title:'228 河濱', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:3,
    dialogue:[ {scene:'河濱',bg:'riverside'},
      {speaker:null,text:'（新店溪的河濱。小語的風箏飛了三次，掉了三次。）'},
      {if:kn('yu'),speaker:'yu',text:'風不對！不是我的問題！'},
      {if:kn('zhe','yu'),speaker:'zhe',text:'（躺在草地上）妳的問題。'},
      {if:kn('heroine_01'),speaker:'heroine_01',text:'（坐在階梯上，手帳攤開）三月二十五號以前，還有四個週末。'},
      {if:kn('classmate_bohan','heroine_01'),speaker:'classmate_bohan',text:'三個半。今天放假，不算。'},
      {choice:[{text:'「我來放。」',goto:'k'},{text:'（坐到以安旁邊）',if:kn('heroine_01'),goto:'a'},{text:'（躺到阿哲旁邊）',if:kn('zhe'),goto:'z'}]},
      {label:'k'},{if:kn('yu'),speaker:null,text:'（風箏飛起來了。小語把線搶過去：「看吧！是風的問題！」）'},{goto:'end'},
      {label:'a'},{speaker:'heroine_01',text:'……你也要算嗎？'},{speaker:null,text:'（她把手帳轉過來：四個週末，每一格都還空著。）'},{goto:'end'},
      {label:'z'},{speaker:'zhe',text:'這就對了。放假就是要躺。'},
      {label:'end'} ],
    consequences:{flags:{Y3S2_228:true},memo:'228 的河濱（風箏）'},
    outingMissed:G=>{ const x=X(); if(x) x.r228Photo(G); } };

  /* ---------- 2-Y3-28 杜鵑花第三張：2028-03-09（四）12:00～12:40 椰林大道（以安的作息只有這一天，r2y3b3d.js 加）；和以安 FAMILIAR 以上、走過去和她說話 ---------- */
  const AZALEA={ id:'ev_an_azalea_y3', title:'四年，四張（第三張）', participants:['heroine_01'], location:'campus', trigger:'interact', priority:8, once:true, term:['Y3S2'], weeks:[3], weekday:[4], time:[12,12+40/60], background:'blur',
    prereq:{stage:{npc:'heroine_01',min:'FAMILIAR'}},
    dialogue:[ {speaker:null,text:'（椰林大道的杜鵑開了。以安拿著手機，站在和前兩年同一個位置。）'},
      {speaker:'heroine_01',text:'第三張。你幫我拍。'},
      {speaker:null,text:'（你拍了兩張。她看了一下。）'},
      {speaker:'heroine_01',text:'可以。花有拍到。'},
      {if:dt('heroine_01'),speaker:'heroine_01',text:'出發前我把這三張印出來帶走。'},   /* AA_71 2-9 原文 */
      {mem:[{npc:'heroine_01',tag:'AN3_AZALEA',note:'幫她拍了第三張杜鵑'}]} ] };

  /* ---------- 2-Y3-29 C6 小語的社團經費：3/16（四）12:30～13:00 霖澤館一樓（3/15 21:00 她私訊、回「有。」才約；手機版在 r2y3b3d.js）---------- */
  const C6_OPTS=[{text:'「要學弟賠。」',set:{YU_C6:'pay'},goto:'p'},{text:'「把帳攤開，請大家補單據。」',set:{YU_C6:'open'},goto:'o'},
    {text:'「社團的錢是大家的。先照社團的規則，把收支表和單據放在一起。」',if:{flags:['U_ASSOC']},set:{YU_C6:'rule'},goto:'r'}];   /* U_ASSOC（民總的法人、社團；AA_117 第 2 節）才有第三個 */
  const C6={ id:'ev_yu_club_money', title:'社團的錢', participants:['yu'], location:'linze', trigger:'auto', once:true, npcPresent:'yu', background:'blur',
    prereq:{custom:G=>{ const x=X(); return !!x&&x.c6MeetDue(G); }},
    dialogue:[ {speaker:'yu',text:'欸，成發的錢對不起來。少了三千。經手的是學弟。'},
      {speaker:'yu',text:'我不想讓他覺得我在懷疑他。可是三千塊。'},
      {choice:C6_OPTS},
      {label:'p'},{speaker:'yu',text:'……他是學弟耶。我先不要這樣。'},{goto:'q'},
      {label:'o'},{speaker:'yu',text:'……好。這樣比較不像在抓人。'},{goto:'q'},
      {label:'r'},{speaker:'yu',expression:'laugh',text:'對！我們社團有規則！……我去找出來。'},
      {label:'q'},
      {speaker:'player',text:'妳真正想要的是什麼？'},
      {speaker:'yu',text:'……我想要帳對得起來，學弟也還會來社課。'},
      {speaker:'player',text:'那先找社團的指導老師。這個不用去法服。'},
      {stamp:['YU_C6_DAY']} ] };

  /* ---------- 2-Y3-30 可昕 K18「最輕鬆的一學期」：3/18（六）08:00 政大校門口出發，開車一天（3/15 21:30 她約）；沒到＝08:15 電話 ---------- */
  const wishKx=G=>!!(G.flags&&G.flags.WISH_DONE_kexin)||(typeof DATE!=='undefined'&&!!DATE.log&&!!DATE.log(G,'kexin').wish);   /* 去過外澳（她的心願地點） */
  const K18={ id:'ev_kexin_k18', title:'最輕鬆的一學期', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:11,
    dialogue:[ {scene:'車上',bg:'car_morning'},
      {unless:{custom:wishKx},speaker:'kexin',text:'這次不排行程表。'},
      {if:{custom:wishKx},speaker:'kexin',text:'這次也不排。跟外澳那次一樣。'},
      {scene:'山裡的舊車站',bg:'trip_oldrail'},   /* 2D trip_oldrail 待生成（G5-09）：沒有圖＝深色底＋地點字幕 */
      {speaker:null,text:'（山裡的舊車站。月台還在，鐵軌已經不走火車了。遠一點，是一座只剩橋墩的紅磚橋。）'},
      {speaker:'kexin',text:'這裡的火車，很久以前就不來了。'},
      {speaker:'kexin',text:'……可是月台還在等。'},
      {choice:[{text:'「月台在等誰？」',goto:'a'},{text:'「走到那座斷橋？」',goto:'b'},{text:'（在月台上坐一下）',goto:'c'}]},
      {label:'a'},{speaker:'kexin',text:'……不知道。我亂講的。'},{speaker:null,text:'（她笑了一下。）'},{speaker:'kexin',text:'走啦，去看那座橋。'},{goto:'back'},
      {label:'b'},{speaker:null,text:'（你們走了四十分鐘。她在橋墩下站了很久。）'},{speaker:'kexin',text:'……腳好痠。回去我要在車上睡。'},{goto:'back'},
      {label:'c'},{speaker:null,text:'（她把頭靠在你肩上，說了一句「好安靜」，就沒有再說話。）'},
      {label:'back'},{scene:'車上',bg:'car_night'},
      {speaker:'kexin',text:'下一站要去哪裡，回去再想。……不對，不想。'},
      {set:{KX_K18:'trip'}} ],
    consequences:{memo:'和可昕去山裡的舊車站（一天）'},
    outingMissed:(G,GM,q)=>{ const x=X(); if(x) x.k18Missed(G,GM,q); } };
  /* 答應了、08:15 還沒到：演出來的電話（新寫）*/
  const K18_CALL={ id:'ev_kexin_k18_call', title:'可昕', participants:['kexin'], location:'any', trigger:'outing', once:true, background:'dark', hours:0.05, kxAway:true,
    dialogue:[ {scene:'電話'},
      {speaker:null,text:'（電話。她那邊有車子經過的聲音。）'},
      {speaker:'kexin',text:'你在哪。'},
      {speaker:'player',text:'……還在家。'},
      {speaker:'kexin',text:'……我叫予樂了。'},
      {speaker:null,text:'（她掛掉了。）'} ] };

  return [FIRST_MEAL,R228,AZALEA,C6,K18,K18_CALL];
})();
Array.prototype.push.apply(STORY_EVENTS,R2Y3B_EVENTS);
