/* ===== 子晴的測試版（AA_400 定稿，企劃線 ce4f34378；任務 AA389-REST-L-1023／AA389-ZQ-GAME-1023）=====
   大三上期末「做出來給我玩。」（termend_lines.js HOOK_ZQ_GAME）＋九份偶遇「下次給你玩。」（記憶 ENC_D18_ZQ）的下文。台詞照稿一字不改（D100、D109）。
   - 誰有（S.cond）：看過 Q6（ev_ziqing_secret_game 或記憶 PLAYTESTED），而且有 HOOK_ZQ_GAME 或記憶 ENC_D18_ZQ；三條路線都有（3/25 以前）。
   - 手機（STORY.PHONE_RULES）：2028-03-07（二）21:00 她私訊兩個回覆（都排 3/8 12:10 總圖二樓）；3/8 11:00 還沒回＝「那我放在 Café 櫃台。」；
     答應了 12:40 還沒到＝「我去上課了。隨身碟在 Café 櫃台。」；3/14 還沒玩＝3/15 21:00「玩了沒。」（「今天玩。」＝那天還可以玩）。
   - Café 櫃台（S.tick）：3/8～3/14 走進 Café，店員給隨身碟（芷若大二下以後不在 Café 上班，不寫她）。
   - 玩測試版：拿到以後第一次在自己房間「看看房間裡的東西」多一格「玩子晴的測試版」（60 分；story3d.js roomItems 的第三欄＝動作）；
     玩完可以傳她一則（照她的回覆時間回）。房間物件「子晴的測試版（貓貼紙的隨身碟）」。
   - 接到後面：發表會（ev_ziqing_q12）ZQ_TB_FB roof 多一句（y34b3d.js）；期末選項打開（termend_lines.js 拿掉 noOpt）；
     12/14 收養那晚（AA_397 3-2）讀 ZQ_CAT_SAID：她那句換成「我做的那隻貓，你說過是牠。……你是對的。」（src/sideq3d.js 的 SIDEQ.CAT_EV）。
   測試：node tests/aa400_zq_testbuild_unit.js */
'use strict';
const ZQTB=(function(){
  const S={}, ZQ='heroine_04';
  const D=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const T=(d,h)=>d*24+h, now=G=>G.day*24+(+G.hour||0);
  const law=G=>!!G&&!!G.flags&&(G.stage||'law')==='law';
  const sent=(G,tag)=>typeof PHONE!=='undefined'&&PHONE.sent(G,tag);
  const done=(G,id)=>!!(G.events&&G.events.done&&G.events.done[id]);
  const mem=(id,tag)=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(id,tag);
  const dm=t=>({th:'p:'+ZQ,from:ZQ,text:t});
  S.dating=G=>{ const F=(G&&G.flags)||{}, R=F.romance||{}; return F['dating_'+ZQ]===true||!!(R[ZQ]&&R[ZQ].status==='dating'); };
  S.DAYS={ask:'2028-03-07',day:'2028-03-08',last:'2028-03-14',ask2:'2028-03-15'};
  S.q6=G=>done(G,'ev_ziqing_secret_game')||mem(ZQ,'PLAYTESTED')||!!(G.flags&&G.flags.PLAYTESTED);
  S.jiufen=G=>mem(ZQ,'ENC_D18_ZQ');
  S.cond=G=>law(G)&&S.q6(G)&&(!!G.flags.HOOK_ZQ_GAME||S.jiufen(G))&&!(typeof STORY!=='undefined'&&STORY.abroad&&STORY.abroad(G));
  S.parkCat=G=>{ const P=typeof PARK!=='undefined'&&PARK.rec?PARK.rec(G):null; return !!P&&(P.petDay!=null||P.feedDay!=null); };   /* 在溫州街公園摸過或餵過貓 */
  S.phone=function(G){ if(!G||!G.flags||!law(G)||typeof PHONE==='undefined') return; const F=G.flags, a=D(S.DAYS.ask), d=D(S.DAYS.day), z=D(S.DAYS.last), a2=D(S.DAYS.ask2); if(a==null) return;
    if(!sent(G,'zqtb_ask')&&F.ZQ_TESTBUILD==null&&G.day>=a&&now(G)<T(d,11)&&(G.day>a||G.hour>=21)&&S.cond(G)){
      const L=[dm('測試版好了。'),dm('明天中午，總圖二樓。靠窗那排。')]; L[1].ask={id:'zqtb_ask',until:T(d,11),opts:[{t:'好。',set:{ZQ_TB_GO:true},say:[{from:ZQ,text:'十二點十分。我下午有課。'}]},{t:'傳檔案給我就好？',set:{ZQ_TB_GO:true},say:[{from:ZQ,text:'不要。我要看你第一關卡在哪裡。'}]}]};
      PHONE.at(G,G.day===a?a:G.day,G.day===a?21:G.hour,L,'zqtb_ask'); }
    if(!sent(G,'zqtb_ask')) return;
    if(F.ZQ_TB_GO&&F.ZQ_TESTBUILD==null&&typeof OUT!=='undefined'&&!OUT.get(G,'zqtb_lib')&&now(G)<T(d,12+40/60))
      OUT.plan(G,{id:'zqtb_lib',ev:'ev_zq_testbuild',day:d,h:12+10/60,late:0.5,place:'總圖二樓',title:'總圖二樓：子晴的測試版',travel:'走路 約 10 分鐘',travelH:1/6,alarm:true,back:'回到總圖一樓。'});
    if(!F.ZQ_TB_GO&&F.ZQ_TESTBUILD==null&&now(G)>=T(d,11)&&G.day<=z&&!sent(G,'zqtb_cafe')){ F.ZQ_TB_CAFE=true; PHONE.at(G,d,11,[dm('那我放在 Café 櫃台。')],'zqtb_cafe'); }   /* 沒回 */
    if(F.ZQ_TESTBUILD==null&&!F.ZQ_TB_CAFE&&OUT.get(G,'zqtb_lib')&&OUT.get(G,'zqtb_lib').state==='missed'&&!sent(G,'zqtb_cafe2')){ F.ZQ_TB_CAFE=true; PHONE.at(G,d,12+40/60,[dm('我去上課了。隨身碟在 Café 櫃台。')],'zqtb_cafe2'); }   /* 答應了沒到 */
    if(F.ZQ_TESTBUILD&&!F.ZQ_TB_PLAYED&&a2!=null&&G.day>=a2&&G.day<=a2+1&&now(G)>=T(a2,21)&&!sent(G,'zqtb_ask2')){
      const m=dm('玩了沒。'); m.ask={id:'zqtb_ask2',until:T(a2,24),opts:[{t:'還沒。',set:{ZQ_TB_LATE:'no'},say:[{from:ZQ,text:'……好。'}]},{t:'今天玩。',set:{ZQ_TB_LATE:'today'}}]}; PHONE.at(G,a2,21,[m],'zqtb_ask2'); } };
  /* Café 櫃台（3/8～3/14）*/
  S.cafeDue=G=>{ const d=D(S.DAYS.day), z=D(S.DAYS.last); return !!G&&!!G.flags&&G.flags.ZQ_TB_CAFE&&G.flags.ZQ_TESTBUILD==null&&G.zone==='cafe'&&d!=null&&G.day>=d&&G.day<=z; };
  S.CAFE_EV={ id:'ev_zq_testbuild_cafe', title:'櫃台', participants:[], location:'cafe', trigger:'manual', once:true, background:'blur',
    dialogue:[{speaker:'店員',text:'子晴放的。她說你一定會忘記來拿。'},{set:{ZQ_TESTBUILD:true,ZQ_TB_FROM:'cafe'}},{mem:[{npc:ZQ,tag:'ZQ_TESTBUILD',note:''}]}] };
  /* 玩測試版（房間）*/
  S.canPlay=G=>{ const F=G&&G.flags; if(!F||!F.ZQ_TESTBUILD||F.ZQ_TB_PLAYED) return false; const z=D(S.DAYS.last), a2=D(S.DAYS.ask2); return G.day<=z||(F.ZQ_TB_LATE==='today'&&G.day===a2); };
  S.play=async function(GM){ const G=GM.G, F=G.flags; if(!S.canPlay(G)) return false; F.ZQ_TB_PLAYED=G.day; if(GM.advance) GM.advance(1);
    if(F.FIRST_BUG) await GM.say(null,'（第一關，總圖二樓那排插座全部是亮的。）');
    if(S.jiufen(G)) await GM.say(null,'（第三關是九份。燈籠一個一個亮起來，貓要在燈全部熄掉以前爬到最上面。你掉下去六次。）');
    await GM.say(null,'（第四關是一個沒有路的屋頂。你卡了很久，才發現貓可以跳到旁邊的招牌上。）');
    await GM.say(null,'（最後一關還沒做。畫面上寫著：「這裡還沒有路。」）');
    const O=[{t:'第四關的屋頂，我卡了二十分鐘。',k:'roof',r:['……那是設計。','好啦，那是 bug。謝謝。']}].concat(S.jiufen(G)?[{t:'九份那關最好玩。',k:'jiufen',r:['那關我做最久。燈籠的光調了三十幾次。']}]:[],[{t:'好玩。',k:'fun',r:['我說不要跟我說好玩。','……好啦。謝謝。']}]);
    const k=GM.choose?await GM.choose(O.map(o=>({t:'傳給她：「'+o.t+'」'})).concat([{t:'（不傳）'}])):O.length; const o=O[k];
    if(o&&typeof PHONE!=='undefined'){ F.ZQ_TB_FB=o.k; PHONE.post(G,{th:'p:'+ZQ,from:'player',who:null,text:o.t}); const at=typeof MSG!=='undefined'&&MSG.replyAt?MSG.replyAt(G,ZQ):{day:G.day,h:G.hour+1};
      PHONE.at(G,at.day,at.h,o.r.map(dm),'zqtb_fb_r'); if(typeof SOCIAL!=='undefined') SOCIAL.adjust(ZQ,{fam:1,comf:2}); }
    return true; };
  S.EVENT={ id:'ev_zq_testbuild', title:'子晴的測試版', participants:[ZQ], location:'any', trigger:'outing', once:true, background:'dark', hours:1,
    dialogue:[ {scene:'總圖・二樓',bg:'ntu_library_2f'},
      {speaker:null,text:'（她坐在靠窗那排。筆電開著，旁邊插著一個貼了貓貼紙的隨身碟。）'},
      {speaker:ZQ,text:'你坐。用我的筆電，玩第一關就好。'},
      {speaker:null,text:'（螢幕上，一隻橘白色的貓在總圖二樓走來走去。牠走到窗邊，聞了一下插座。）'},
      {if:{flags:['FIRST_BUG']},speaker:null,text:'（插座亮了。）'},{if:{flags:['FIRST_BUG']},speaker:ZQ,text:'你說壞的那個，我在遊戲裡修好了。現實的還沒。'},
      {if:{custom:G=>S.jiufen(G)},speaker:ZQ,text:'第三關是九份，燈籠那關。你回去自己玩。'},
      {choice:[{text:'「這隻貓是公園那隻？」',if:{custom:G=>S.parkCat(G)},goto:'c'},{text:'「第一關好難。」',goto:'h'},{text:'「可以上架了吧。」',goto:'u'}]},
      {label:'c'},{speaker:ZQ,text:'……你看出來了。'},{speaker:ZQ,text:'我每天晚上經過那個公園。牠都在那張圓椅上。'},{set:{ZQ_CAT_SAID:true}},{goto:'e'},
      {label:'h'},{speaker:ZQ,text:'欸不是，你才玩兩分鐘。'},{speaker:ZQ,text:'……好，我記下來。第一關太難。'},{goto:'e'},
      {label:'u'},{speaker:ZQ,text:'還差很多。音效是暫時的，存檔會壞。'},{speaker:ZQ,text:'五月發表會以前要弄好。'},
      {label:'e'},{speaker:ZQ,text:'隨身碟給你。全部玩完，跟我說哪裡卡住。'},{speaker:ZQ,text:'不要跟我說好玩。'},
      {unless:{custom:G=>S.dating(G)},speaker:null,text:'（她把隨身碟放進你手心。貓貼紙有一角翹起來了。）'},
      {if:{custom:G=>S.dating(G)},speaker:null,text:'（她把隨身碟放進你手心，手指在你掌心停了一下才收回去。）'},
      {set:{ZQ_TESTBUILD:true,ZQ_TB_FROM:'lib'}},{mem:[{npc:ZQ,tag:'ZQ_TESTBUILD',note:''}]},{consequences:{rel:{[ZQ]:{fam:2,trust:2}}}} ] };
  let busy=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['zq_testbuild3d:busy']=()=>{ busy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）：讀檔凍住的舊劇情走不到 finally，只把旗標設回初始值 */
  S.tick=function(GM){ const G=GM&&GM.G; if(busy||!S.cafeDue(G)||typeof EVENTS==='undefined'||!EVENTS.run) return false; busy=true;
    if(GM.sceneBegin) GM.sceneBegin(); Promise.resolve().then(()=>EVENTS.run(S.CAFE_EV)).catch(e=>console.warn('ZQTB',e)).finally(()=>{ busy=false; if(GM.G===G){ if(GM.sceneEnd) GM.sceneEnd(); if(GM.autosave) GM.autosave(); } }); return true; };   /* 決定開演的那一刻就鎖住（STUCK-HARDEN-1027，同 invites3d.js S.autoStart）：延後開演的空檔裡，玩家按的「說話」、同一格的 EVENTS.tick 都進不來；演完放開再自動存檔 */
  if(typeof STORY_EVENTS!=='undefined') for(const e of [S.EVENT,S.CAFE_EV]) if(!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e);
  if(typeof STORY!=='undefined'){ if(Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G)); if(Array.isArray(STORY.TICKS)) STORY.TICKS.push(GM=>S.tick(GM));
    if(Array.isArray(STORY.ROOM_EXTRA)) STORY.ROOM_EXTRA.push((G,Lr)=>{ if(!G||!G.flags||!G.flags.ZQ_TESTBUILD) return; if(S.canPlay(G)) Lr.push(['玩子晴的測試版（60 分）',[],GM=>S.play(GM)]); Lr.push(['子晴的測試版（貓貼紙的隨身碟）','（貓貼紙有一角翹起來了。）']); }); }
  return S;
})();
