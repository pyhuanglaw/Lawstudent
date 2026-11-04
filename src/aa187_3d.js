/* ===== AA_187 以安、語彤的戀愛線補完：遊戲裡還沒有的五段（任務 AA187-PAIR-GAPS-1031；企劃線 claude/cool-heisenberg-o8kuqx 的 AA_187，AA 的歷史複核確認沒進遊戲）=====
   台詞照稿一字不改（D109）。檔首【文件狀態】作廢的（1-2、2-2 的場合、第 3 節、「還沒」、1-6 總圖版）不做。
   ■ 1-1 新 13b「反駁的次數」ev_an_counted：大三上（Y3S1）、2027-10-21（四）起第一個「她和祐廷都在、她第 5 階以上」的週四公法讀書會散會後（afterActivity public_law_group，同 loans3d.js L2），
       法律系館B 研討室；加入公法讀書會（PUBLIC_LAW_GROUP／CLUB_public_law_group）；只演一次；沒有選項；記 AN_COUNTED。
       「第 5 階」＝DATE.stageNum（AA_126 4-1 的關係階段；date3d.js），不是閒聊階梯的層數（閒聊階梯一學期一個檔、叫「層」）。
       那晚排了裂縫談話（cracktalk3d.js 的「你留一下。」ev_an_talk_plg）＝這一晚先不演、等下一個週四（保守預設：不把兩場疊在同一晚）。
   ■ 1-6 交往中散會後的那段路 ev_an_walk_home：和以安交往中、她那晚在讀書會，散會後多一個選項「（送她回去）」→ 一起走到她宿舍門口，旁白＋對話五組照順序輪；
       「（下雨。她撐傘……）」那一組只在下雨（rain／typhoon）的晚上，下雨而且這一輪還沒用過＝先用它。每個月最多一次（選了送她才算這個月用過；沒送＝下一週再問）。
       走路不另外扣時間。2028-11-30（大四上第 13 週，她交棒那一晚）以後不播（第 14 週起她不去讀書會）。裂縫談話那一晚不出。總圖版作廢，不做。
       （不送的那個選項「（各自回去）」稿上沒有，這裡補的系統選項——要問 AA。）
   ■ 2-1 語彤
       (a) 告白理由句（大四上學期末心意邀約，data/termend_lines.js HEART.heroine_03.over Y4S1）：NOTICED_EMPTY_SEAT 那一版遊戲裡已經有，字是 AA_313 第 4 節（2026-10-20，比 AA_187 2026-10-18 那次改字晚）
           定的「大一期中那週，我的位子空著。……你那時候就看到了。」——不改（以較新的 AA 決定為準；要問 AA 用哪一版）。這裡只有測試。
       (b) ev_yt_umbrella_hook：大三上第一個下雨的週二（下雨＝rain／typhoon、麵店那天有開；遊戲的天氣每天隨機，所以「第一個」＝遊戲裡第一次遇到的那一個，S.umbDay 在 TICKS 記下來），
           有 HELPED（大一把傘給她）的玩家那天走進麵店：旁白一句，只一次。櫃台後面那把傘的 3D 模型不在這裡（3D 美術歸 LAWWW2）。
   ■ 2-3 打烊後的那一桌 ev_yt_family_dinner：2029-04-26（四）20:30～21:00 人在麵店（3D）、和語彤交往中＝演（只一次），記 YT_FAMILY_DINNER；
       當天 17:00 語彤私訊兩則；21:00 還沒演＝兩則（「阿姨說下次」…）。尾聲（postgrad3d.js epilogue）語彤的句子前面多一句旁白（交往中、有 YT_FAMILY_DINNER）。
   ■ 2-4 週四的斜對面 ev_yt_thu_seat：和語彤交往中、事件 13 以後（STORY.ytThuFree）、週四 17:30～18:30 在總圖三樓（zone library）坐下、她在旁邊（npcNear：2.5 m 內或同一張桌子＝「斜對面」），
       四組照順序輪、每個月最多一次（「下雨了」那一組只在下雨）。cracktalk3d.js 已經有的是 12:10 那則「斜對面的位子我留了。」（和輪的四句私訊），坐下以後的這四組遊戲裡沒有，不重複。
       那天是語彤的裂縫談話（ev_yt_talk，人到三樓就演）＝不出。
   存檔：G.flags 的 AN_COUNTED、AN_WALK_M（'YYYY-MM'）、AN_WALK_ROT（{used,last}）、YT_UMB_TUE（日子）、YT_FAMILY_DINNER、YT_SEAT4_M、YT_SEAT4_ROT；舊存檔沒有＝沒演過。
   測試：node tests/aa187_pair_unit.js */
'use strict';
const AA187=(function(){
  const S={}, AN='heroine_01', YT='heroine_03';
  if(typeof STORY==='undefined'||typeof STORY_EVENTS==='undefined'||typeof CALENDAR==='undefined') return S;
  const D=k=>STORY.dayOfKey?STORY.dayOfKey(k):null;
  const law=G=>!!G&&!!G.flags&&(G.stage||'law')==='law';
  const dating=(G,id)=>!!(G&&G.flags&&G.flags['dating_'+id]===true);
  const done=(G,id)=>!!(G&&G.events&&G.events.done&&G.events.done[id]);
  const here=(id,G)=>!STORY.present||STORY.present(id,G);
  const abroad=G=>typeof STORY.abroad==='function'&&!!STORY.abroad(G);
  const wdOf=d=>CALENDAR.dateOf(d).wd%7, monthOf=d=>CALENDAR.dateOf(d).key.slice(0,7);
  const termId=G=>{ const t=CALENDAR.termOf(G.day); return t?t.id:null; };
  const rainy=G=>G.weather==='rain'||G.weather==='typhoon';
  const member=G=>{ const F=(G&&G.flags)||{}; return !!(F.PUBLIC_LAW_GROUP||F.CLUB_public_law_group); };
  const stage=id=>typeof DATE!=='undefined'&&DATE.stageNum?DATE.stageNum(id):0;
  const plgToday=G=>typeof ACTIVITIES!=='undefined'&&!!ACTIVITIES.attendedAny&&ACTIVITIES.attendedAny(G,'public_law_group',G.day);
  /* 那天排了她的裂縫談話（cracktalk3d.js S.build 的 att：以安讀書會散會後 m:'plg'；語彤總圖三樓 m:'zone'）*/
  S.talkToday=function(G,id){ if(typeof CRACKTALK==='undefined'||!CRACKTALK.pr) return false; const r=CRACKTALK.pr(G,id), p=r&&r.plan, a=p&&p.att&&p.att[p.i]; return !!a&&a.day===G.day; };
  const nar=t=>({speaker:null,text:t}), me=t=>({speaker:'player',text:t}), an=t=>({speaker:AN,text:t}), yt=t=>({speaker:YT,text:t}), aunt=t=>({speaker:'阿姨',text:t});
  const DM=(id,t)=>({th:'p:'+id,from:id,text:t});
  const sent=(G,tag)=>typeof PHONE!=='undefined'&&PHONE.sent(G,tag);
  const now=G=>G.day*24+(+G.hour||0);

  /* 輪流（1-6、2-4 共用）：照順序，一輪每組最多一次；rain:true 那一組只在下雨的時候、而且下雨時這一輪還沒用過就先用它；一輪用完重來（不跟上一次同一組）。
     R＝G.flags[key]＝{used:[這一輪用過的], last}；cur＝G.flags[curKey]（這一次播哪一組，台詞的 if 用）*/
  S.rotPick=function(G,key,items){ const F=G.flags; let R=F[key]; if(!R||typeof R!=='object') R=F[key]={used:[],last:null}; if(!Array.isArray(R.used)) R.used=[];
    const wet=rainy(G), all=items.map((x,i)=>i), ok=i=>!items[i].rain||wet;
    let C=all.filter(i=>ok(i)&&!R.used.includes(i));
    if(!C.length){ R.used=[]; C=all.filter(i=>ok(i)&&i!==R.last); if(!C.length) C=all.filter(ok); }
    const i=wet&&C.some(k=>items[k].rain)?C.find(k=>items[k].rain):C[0]; R.used.push(i); R.last=i; return i; };
  const rotLines=(items,curKey)=>{ const out=[]; items.forEach((x,i)=>{ for(const l of x.lines) out.push(Object.assign({},l,{if:{flagIs:{[curKey]:i}}})); }); return out; };

  /* ===================== 1-1 新 13b「反駁的次數」===================== */
  S.COUNTED_FROM='2027-10-21';
  S.countedOk=G=>{ const d=D(S.COUNTED_FROM); return law(G)&&d!=null&&G.day>=d&&member(G)&&plgToday(G)&&here(AN,G)&&stage(AN)>=5&&!S.talkToday(G,AN); };
  S.EV_COUNTED={id:'ev_an_counted',title:'反駁的次數',participants:[AN],location:['wancai','wancai_sema'],trigger:'activity',afterActivity:'public_law_group',once:true,term:['Y3S1'],weekday:[4],background:'blur',
    prereq:{custom:G=>S.countedOk(G)},
    dialogue:[ nar('（其他人都走了。她的筆記本攤在桌上，你看到一頁寫著「反駁」兩個字，下面一排正字。）'),
      me('這是什麼？'),
      an('（把筆記本闔上）統計。'),
      an('讀書會上，有人反駁我的次數。'),
      me('幾次？'),
      an('十七。'),
      an('其他人加起來是三。'),
      nar('（她把筆記本收進包包。拉鍊拉到一半，停住。）'),
      an('……樣本還不夠。'),   /* 2026-10-18 AA-C 改稿（原本兩句併成這一句）*/
      {set:{AN_COUNTED:true}} ]};

  /* ===================== 1-6 交往中散會後的那段路 ===================== */
  S.WALK_END='2028-11-30';   /* 她交棒那一晚（大四上第 13 週）還算；第 14 週起她不去讀書會 */
  S.WALK=[
    {lines:[nar('（路燈下，她把今天的白板拍照存檔。）'),an('第三條我明天要改，今天講不清楚。')]},
    {lines:[nar('（經過總圖，裡面還亮著。）'),an('大一的時候，這條路我都用跑的，怕門禁。')]},
    {lines:[nar('（她走到門口，停下來。）'),an('到了。明天早上的課你不要遲到。')]},
    {rain:true,lines:[nar('（下雨。她撐傘，傘往你這邊歪。）'),an('不要說話。我在算角度。')]},
    {lines:[nar('（她邊走邊背法條，背到一半停住。）'),an('……你剛剛笑什麼？'),me('沒有。'),an('你有。')]} ];
  /* AA-B 11-01 第 6 題：照 AA_503 第 13 節，她身邊有朋友時 1-6、2-4 不出（不等 7 天，那一次就是沒有；PRIVTALK.crowd＝她旁邊有不知道的人）*/
  S.crowd=(G,id)=>typeof PRIVTALK!=='undefined'&&!!PRIVTALK.crowd&&!!PRIVTALK.crowd(G,id,null,typeof GAME!=='undefined'?GAME:null);
  S.walkOk=G=>{ const e=D(S.WALK_END); return law(G)&&dating(G,AN)&&plgToday(G)&&here(AN,G)&&!abroad(G)&&e!=null&&G.day<=e&&G.flags.AN_WALK_M!==monthOf(G.day)&&!S.talkToday(G,AN)&&!S.crowd(G,AN); };
  S.walkPick=G=>{ G.flags.AN_WALK_CUR=S.rotPick(G,'AN_WALK_ROT',S.WALK); G.flags.AN_WALK_M=monthOf(G.day); return G.flags.AN_WALK_CUR; };
  S.WALK_BG=(typeof OUT!=='undefined'&&OUT.BG&&['gdorm_gate','fdorm_gate','girls_dorm_gate','fdorm_night','gdorm_night'].find(k=>OUT.BG[k]&&OUT.BG[k].image))||null;   /* 大一女舍門口的 2D 圖（OUT.BG 有才用；現在沒有＝null）*/
  S.EV_WALK={id:'ev_an_walk_home',participants:[AN],location:['wancai','wancai_sema'],trigger:'activity',afterActivity:'public_law_group',background:'blur',   /* AA-B 11-01 第 7 題：有大一女舍門口的圖就換（送她回去那一段：S.WALK_BG），沒有先 blur */   /* 沒有標題（不送也會跑到這裡：不出字卡、不進日誌；同 2-4、2-1 (b) 的小動作）*/
    prereq:{custom:G=>S.walkOk(G)},
    dialogue:[ {choice:[{text:'（送她回去）',goto:'go'},{text:'（各自回去）',goto:'end'}]},   /* 「（各自回去）」：稿上沒有，補的系統選項 */
      {label:'go'},{call:G=>{ S.walkPick(G); }},{if:{custom:()=>!!S.WALK_BG},scene:'大一女舍門口',get bg(){ return S.WALK_BG; }},
      ...rotLines(S.WALK,'AN_WALK_CUR'),
      {label:'end'} ]};

  /* ===================== 2-1 (b) 那把傘的那一格 ===================== */
  S.ndlOpen=(G,d)=>!(typeof NOODLE_CLOSED!=='undefined'&&NOODLE_CLOSED.closed&&NOODLE_CLOSED.closed(G,d))&&!(typeof PLACES!=='undefined'&&PLACES.typhoonClosed&&PLACES.typhoonClosed('noodle',d));
  S.umbDay=function(G){ if(!law(G)) return null; const F=G.flags; if(F.YT_UMB_TUE!=null) return F.YT_UMB_TUE;
    if(termId(G)==='Y3S1'&&wdOf(G.day)===2&&rainy(G)&&S.ndlOpen(G,G.day)) F.YT_UMB_TUE=G.day; return F.YT_UMB_TUE!=null?F.YT_UMB_TUE:null; };
  S.umbOk=G=>law(G)&&termId(G)==='Y3S1'&&wdOf(G.day)===2&&rainy(G)&&S.ndlOpen(G,G.day)&&typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(YT,'HELPED');   /* AA-B 11-01 第 4 題：放寬成大三上任何一個下雨的週二，第一次走進麵店那次（不只第一個下雨的週二；once）。S.umbDay 照舊記第一個下雨的週二，只當紀錄 */
  S.EV_UMB={id:'ev_yt_umbrella_hook',participants:[],location:'noodle',trigger:'auto',once:true,term:['Y3S1'],weekday:[2],background:'blur',   /* 沒有標題：不出字卡、不進日誌（一句旁白）*/
    prereq:{custom:G=>S.umbOk(G)},
    dialogue:[ nar('（那把傘，掛在只有她拿得到的地方。）') ]};

  /* ===================== 2-3 打烊後的那一桌 ===================== */
  S.FD_DAY='2029-04-26';
  S.FD_MSG=['今天打烊後留下來','阿姨說的 不是我說的'];
  S.FD_MISS=['阿姨說下次','她多煮了一碗 我吃掉了'];
  S.FD_EPI='（語彤的手機桌布，是麵店那張照片：三個人，一張桌子。）';
  S.fdOk=G=>law(G)&&G.day===D(S.FD_DAY)&&dating(G,YT)&&here(YT,G)&&!abroad(G);
  S.EV_FD={id:'ev_yt_family_dinner',title:'打烊後的那一桌',participants:[YT],location:'noodle',trigger:'auto',once:true,time:[20.5,21],background:'blur',
    prereq:{custom:G=>S.fdOk(G)},
    dialogue:[ nar('（鐵門拉下一半。桌上擺了三副碗筷。）'),
      aunt('坐。今天你不是客人。'),
      nar('（語彤把自己那碗推過來一點，又推回去。）'),
      aunt('她以前不讓同學進廚房的。'),
      yt('……阿姨。'),
      aunt('日本的寺廟，我幫你們兩個都拜了。'),
      yt('（低頭吃麵）……我們沒有要你拜。'),
      aunt('我拜我的。'),
      nar('（回去的路上，她說今天的麵比較鹹。你說沒有。她說有。）'),
      {set:{YT_FAMILY_DINNER:true}} ]};
  S.phone=function(G){ if(!law(G)||typeof PHONE==='undefined') return; const d=D(S.FD_DAY); if(d==null||G.day<d||G.day>d+1) return;
    if(G.day===d&&now(G)>=d*24+17&&dating(G,YT)&&here(YT,G)&&!abroad(G)&&!sent(G,'aa187_fd')) PHONE.at(G,d,17,S.FD_MSG.map(t=>DM(YT,t)),'aa187_fd');
    if(now(G)>=d*24+21&&sent(G,'aa187_fd')&&!done(G,'ev_yt_family_dinner')&&dating(G,YT)&&!sent(G,'aa187_fd_miss')) PHONE.at(G,d,21,S.FD_MISS.map(t=>DM(YT,t)),'aa187_fd_miss'); };
  /* 尾聲：語彤的句子前面一句旁白（交往中＋YT_FAMILY_DINNER）——包住 PG.epiLine（epilogue 的同一桌那一圈用 S.epiLine）*/
  S.epiPatch=function(){ if(typeof PG==='undefined'||!PG.epiLine||PG.epiLine._aa187) return false; const e0=PG.epiLine;
    PG.epiLine=function(G,id){ const ln=e0.apply(this,arguments); if(id===YT&&Array.isArray(ln)&&ln.length&&G&&G.flags&&G.flags.YT_FAMILY_DINNER&&PG.dating&&PG.dating(G,YT)) return [S.FD_EPI].concat(ln); return ln; };
    PG.epiLine._aa187=true; return true; };

  /* ===================== 2-4 週四的斜對面 ===================== */
  S.SEAT=[
    {lines:[nar('（她推來一張便條：「你翻頁好大聲。」下面一行小字：「但我不想換位子。」）')]},
    {rain:true,lines:[nar('（她讀累了，用筆輕輕敲你的書兩下，指指窗外：下雨了。）')]},
    {lines:[nar('（收書包的時候，她把你的筆記也收進她的袋子。）'),yt('……拿錯了。'),me('妳拿著吧。'),yt('……嗯。')]},
    {lines:[nar('（六點半，她看錶，又多坐了十分鐘。）')]} ];
  S.seatOk=G=>law(G)&&dating(G,YT)&&!!(STORY.ytThuFree&&STORY.ytThuFree(G))&&!abroad(G)&&G.flags.YT_SEAT4_M!==monthOf(G.day)&&!S.talkToday(G,YT)&&!S.crowd(G,YT);
  S.seatPick=G=>{ G.flags.YT_SEAT4_CUR=S.rotPick(G,'YT_SEAT4_ROT',S.SEAT); G.flags.YT_SEAT4_M=monthOf(G.day); return G.flags.YT_SEAT4_CUR; };
  S.EV_SEAT={id:'ev_yt_thu_seat',participants:[YT],location:'library',trigger:'seat',weekday:[4],time:[17.5,18.5],npcNear:YT,background:'blur',   /* npcNear：她在旁邊（2.5 m 內或同一張桌子）*/
    prereq:{custom:G=>S.seatOk(G)},
    dialogue:[ {call:G=>{ S.seatPick(G); }}, ...rotLines(S.SEAT,'YT_SEAT4_CUR') ]};

  /* ===================== 掛勾 ===================== */
  S.EVENTS=[S.EV_COUNTED,S.EV_WALK,S.EV_UMB,S.EV_FD,S.EV_SEAT];
  for(const e of S.EVENTS) if(!STORY_EVENTS.some(x=>x.id===e.id)){
    /* 坐下的事件（STORY.onSeat 挑清單裡第一個符合的）：排在總圖三樓隨機的「插座」（ev_library_outlet，random_weight 0.5）前面——劇情先演，同 EVENTS.onEnter 的「先劇情、再隨機」*/
    const k=e.trigger==='seat'?STORY_EVENTS.findIndex(x=>x.trigger==='seat'&&x.random_weight!==undefined&&(x.location===e.location||x.location==='any'||!x.location)):-1;
    if(k>=0) STORY_EVENTS.splice(k,0,e); else STORY_EVENTS.push(e); }
  if(Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G));
  if(Array.isArray(STORY.TICKS)) STORY.TICKS.push(GM=>{ const G=GM&&GM.G; if(G&&G.flags) S.umbDay(G); return false; });   /* 大三上第一個下雨的週二：人在哪裡都記 */
  S.epiPatch();
  return S;
})();
if(typeof window!=='undefined') window.AA187=AA187;
