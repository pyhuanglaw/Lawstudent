/* ===== 好朋友的自動劇情第二批（AA_637，企劃線 b1ad8aa99；X157 STORY-FRIENDS-EVENTS-1103；AA 定稿 D109，台詞一字照稿）=====
   使用者 11-03 08:1x：「我覺得主角好朋友應該要有一些事件 甚至自動撥放的劇情 老實說我除了女主角連人名都記不起來」——接 AA_606 第一批（events.js 的 ev_card_*）。
   - 九場（F2-01～F2-09，大一上第 9～15 週；第 8、16 週考試週不排）：203 的三場（trigger auto、進房間那個時段）、教室的三場（上課前、下課，trigger class）、桌遊團群組的三則（PHONE_RULES）。
   - 共同規則（AA_637 第 0 節）：自動；同一天已經演過女主角或主線的事件＝往後延到下一個同樣的時段，最多延 3 天，延不到就不演（不提示）；
     演完記 FRIEND_AUTO_F2_0n、熟悉度 +1（場裡有名字的朋友）；沒演過第一批名片場的照樣演。群組那三則：還沒在桌遊團群組（noodle_team）的不發。
   - 第 3 節名字卡（LAWWW 決定做）：A 層朋友（阿哲、阿凱、柏翰、明軒、Alison、宥辰、芯慈、沛珊）第一次在對話框說話時，畫面上方淡入一行「阿哲｜張哲維・法律系一年級」
     （名字、全名照 characters.js 的 name／fullname，科系年級照 SOCIAL.yearTag），3 秒淡出、每人一次（NAMECARD_<id>）；舊存檔已經認識的不出現；經濟系那一年不出現。
   - 沒做（照 AA_637 原文要另外的東西）：F2-01「隔天早上 9:00 以前進 203 阿凱還在睡（床上）」的 3D 站位。F2-06 民法第 71 條原文請 BB 照法律審查核對。
   測試：node tests/aa637_friends2_unit.js */
'use strict';
const FRIENDS2=(function(){
  const S={};
  const ZHE='zhe', KAI='kai', BH='classmate_bohan', MX='classmate_mingxuan', YU='yu', YC='classmate_youchen', XC='classmate_xinci', NG='g:noodle_team';
  const F=G=>(G&&G.flags)||{};
  const name=G=>(G&&G.name)||'祐廷';
  /* ---------- 時段：第幾週、星期幾（CALENDAR.dateOf 的 wd：1＝週一…7＝週日）、時間（超過 24＝半夜，同一個遊戲日）---------- */
  S.SLOT={
    F2_01:{week:9,wd:4,time:[22,26]}, F2_02:{week:9,wd:6,time:[18,24]}, F2_03:{week:11,wd:2,time:[23.5,26]}, F2_04:{week:12,wd:1,course:'const_1',before:true},
    F2_05:{week:14,wd:7,time:[21,24]}, F2_06:{week:15,wd:4,course:'civ_general',before:true}, F2_07:{week:15,wd:6,time:[24.5,27]},   /* 週日 00:30＝週六那個遊戲日的 24:30 */
    F2_08:{week:10,wd:4,course:'civ_general',after:true}, F2_09:{week:14,wd:6,time:[24+40/60,27]} };   /* 週六 00:40＝週五那一晚過了半夜；AA 寫「第 14 週週六 00:40」＝週五遊戲日的 24:40 → 下面 slotDay 往前一天 */
  S.MIDNIGHT={F2_07:true,F2_09:true};   /* 寫的是「週日／週六 00:xx」：遊戲日是前一天 */
  S.DELAY=3;
  const dayOf=(term,week,wd)=>{ if(typeof CALENDAR==='undefined'||!CALENDAR.termDays) return null; const T=CALENDAR.termDays(term); if(!T) return null;
    for(let d=T.from;d<=T.to;d++){ const t=CALENDAR.termOf(d), x=CALENDAR.dateOf(d); if(t&&t.id===term&&t.week===week&&x&&x.wd===wd) return d; } return null; };
  S.slotDay=function(code){ const s=S.SLOT[code]; if(!s) return null; let d=dayOf('Y1S1',s.week,s.wd); if(d==null) return null; if(S.MIDNIGHT[code]) d-=1; return d; };
  const examDay=d=>{ if(typeof CALENDAR==='undefined') return false; const t=CALENDAR.termOf(d); return !!t&&(t.week===8||t.week===16||!!t.exam); };
  /* 同一天已經演過女主角或主線的事件（AA_637 第 0 節第 3 點）：G.events.last＝事件 id → 最後演的那一天 */
  const HER=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan','kexin'];
  let EVMAP=null; const evOf=id=>{ if(!EVMAP||EVMAP.n!==STORY_EVENTS.length){ EVMAP={n:STORY_EVENTS.length,m:new Map()}; for(const e of STORY_EVENTS) if(e&&e.id) EVMAP.m.set(e.id,e); } return EVMAP.m.get(id); };
  S.busyToday=function(G){ const L=(G&&G.events&&G.events.last)||{}; for(const id in L){ if(L[id]!==G.day||/^ev_f2_/.test(id)) continue; const e=typeof STORY_EVENTS!=='undefined'?evOf(id):null; if(!e) continue;
      if(e.main||e.mainline||(e.participants||[]).some(p=>HER.includes(p))) return true; } return false; };
  /* 這一場今天可以演：法律系、大一上、還沒演過、在 [時段那天, +3 天]、不是考試週、今天沒有女主角或主線的事件 */
  S.due=function(G,code){ if(!G||(G.stage||'law')!=='law'||F(G)['FRIEND_AUTO_'+code]) return false; const d0=S.slotDay(code); if(d0==null) return false;
    if(G.day<d0||G.day>d0+S.DELAY||examDay(G.day+(S.MIDNIGHT[code]?1:0))) return false; return !S.busyToday(G); };
  const done=(code,ids)=>({set:{['FRIEND_AUTO_'+code]:true},rel:Object.fromEntries(ids.map(id=>[id,{fam:1}]))});
  const inDorm=(G,id)=>typeof STORY!=='undefined'&&!!STORY.dormWho&&STORY.dormWho(G).some(w=>w[0]===id);
  const evDone=(G,id)=>!!(G&&G.events&&G.events.done&&G.events.done[id]);
  const timeOk=(G,code)=>{ const t=S.SLOT[code].time; if(!t) return true; const h=G.hour; return h>=t[0]&&h<t[1]; };   /* 過了午夜＝同一個遊戲日的 24 以上（story3d.js：G.hour 到 24 以上才換日）*/
  /* 課堂那幾場：撞到同一堂別的上課前／下課事件就讓位（同 AA_606 的 busyBefore／busyAfter）*/
  let yielding=false;
  const busyBefore=(it,self)=>{ if(yielding||typeof EVENTS==='undefined') return false; yielding=true; try{ return STORY_EVENTS.some(e=>e!==self&&!e.retired&&(e.beforeClass===it.c.id||(typeof e.beforeClass==='function'&&e.beforeClass(it)))&&EVENTS.check(e,{chain:true})); } finally { yielding=false; } };
  const busyAfter=(it,self)=>{ if(yielding||typeof CLS==='undefined'||!CLS.afterClassOk) return false; yielding=true; try{ const ok=CLS.afterClassOk(it); return STORY_EVENTS.some(e=>e!==self&&!e.retired&&!e.classAlso&&ok(e)); } finally { yielding=false; } };
  const C=f=>({custom:f});

  /* ---------- 第 2 節 台詞（一字照稿）---------- */
  S.EVENTS=[
    /* F2-01 阿凱「交了」：第 9 週週四 22:00 以後，第一次進 203；阿凱在。前置：演過 ev_card_kai 或第 3 週以後（第 9 週一定是第 3 週以後）*/
    { id:'ev_f2_kai_submit', title:'交了', participants:[KAI,ZHE], location:'dorm', trigger:'auto', once:true, term:['Y1S1'], background:'blur',
      prereq:C(G=>S.due(G,'F2_01')&&timeOk(G,'F2_01')&&inDorm(G,KAI)),
      dialogue:[ {speaker:null,text:'（阿凱的螢幕停在一個上傳完成的畫面。他盯著看了兩秒。）'},
        {speaker:ZHE,text:'阿凱？'},
        {speaker:KAI,text:'交了。'},
        {speaker:KAI,text:'十點前截止。九點五十八。'},
        {speaker:ZHE,text:'你幾天沒睡？'},
        {speaker:KAI,text:'……不算。'},
        {speaker:null,text:'（他關掉螢幕，直接倒在床上。鞋子還沒脫。）'},
        {speaker:ZHE,text:'（小聲）燈幫他關一下。'},
        done('F2_01',[KAI]) ] },
    /* F2-03 阿哲、柏翰「第幾頁」：第 11 週週二 23:30 以後，第一次進 203；兩人都在 */
    { id:'ev_f2_zhe_bohan_page', title:'第幾頁', participants:[ZHE,BH], location:'dorm', trigger:'auto', once:true, term:['Y1S1'], background:'blur',
      prereq:C(G=>S.due(G,'F2_03')&&timeOk(G,'F2_03')&&inDorm(G,ZHE)&&inDorm(G,BH)),
      dialogue:[ {speaker:null,text:'（阿哲坐在地上，頭髮還是濕的，民法課本攤在腿上。球鞋丟在門口。）'},
        {speaker:ZHE,text:'柏翰。'},
        {speaker:BH,text:'嗯。'},
        {speaker:ZHE,text:'禮拜四周老師講的那個，第幾頁？'},
        {speaker:BH,text:'一百一十二頁。第三段。'},
        {speaker:ZHE,text:'……你連第幾段都記得。'},
        {speaker:BH,text:'我抄的時候有寫。'},
        {speaker:ZHE,text:'（對你）哥，練球練到九點半，回來還要念這個。沒事啦，念得完。'},
        {if:{flags:['ball_invite']},speaker:ZHE,text:'你下禮拜也來啊。練完一起念。'},   /* 有 ball_invite（玩家有去系籃）多一句 */
        done('F2_03',[ZHE,BH]) ] },
    /* F2-07 柏翰「檯燈」：第 15 週週日 00:30 以後，在 203 睡覺時（睡覺前自動演，演完照常睡）；柏翰在 */
    { id:'ev_f2_bohan_lamp', title:'檯燈', participants:[BH], location:'dorm', trigger:'auto', once:true, term:['Y1S1'], background:'blur',
      prereq:C(G=>S.due(G,'F2_07')&&timeOk(G,'F2_07')&&inDorm(G,BH)),
      dialogue:[ {speaker:null,text:'（燈關了。只剩柏翰桌上的檯燈，壓得很低。阿哲在打呼，阿凱的螢幕也暗了。）'},
        {speaker:BH,text:'（小聲）吵到你？'},
        {choice:[{text:'「沒有。你還在念？」',goto:'a'},{text:'「有一點。」',goto:'b'}]},
        {label:'a'},{speaker:BH,text:'再一章。'},{goto:'c'},
        {label:'b'},{speaker:BH,text:'抱歉。（把檯燈轉向牆壁）再一章。'},
        {label:'c'},{speaker:BH,text:'我念得慢。所以要早一點開始。'},
        {speaker:BH,text:'……晚安，{name}。'},
        done('F2_07',[BH]) ] },
    /* F2-04 Alison「輸了」：第 12 週週一，憲法上課前（教室；Alison 在場）*/
    { id:'ev_f2_yu_debate_lose', title:'輸了', participants:[YU,ZHE], location:'any', trigger:'class', yieldClass:true, once:true, term:['Y1S1'], background:'blur',
      beforeClass:function(it){ return !!(it&&it.c&&it.c.id==='const_1')&&!busyBefore(it,this); },
      prereq:C(G=>S.due(G,'F2_04')),
      dialogue:[ {speaker:null,text:'（Alison 坐在後面一點，罕見地沒有在講話。）'},
        {speaker:ZHE,text:'Alison，昨天咧？'},
        {speaker:YU,text:'輸了。'},
        {speaker:YU,text:'八強。我們抽到反方。'},
        {speaker:ZHE,text:'反方怎樣？'},
        {speaker:YU,text:'反方要說「不要廢點名」。我自己都不信。'},
        {speaker:YU,text:'……好啦，沒事！明年再來。今天中午吃什麼？'},
        done('F2_04',[YU]) ] },
    /* F2-06 宥辰「我回來了」：第 15 週週四，民總上課前（教室）；前置：演過第 2 週宥辰坐旁邊那場（ev_yc_meet_after）。下課那一段在同一場 */
    { id:'ev_f2_youchen_back', title:'我回來了', participants:[YC,ZHE,BH], location:'any', trigger:'class', yieldClass:true, once:true, term:['Y1S1'], background:'blur',
      beforeClass:function(it){ return !!(it&&it.c&&it.c.id==='civ_general')&&!busyBefore(it,this); },
      prereq:C(G=>S.due(G,'F2_06')&&evDone(G,'ev_yc_meet_after')),
      dialogue:[ {speaker:null,text:'（很久沒在白天看到的人，坐在你旁邊。）'},
        {speaker:YC,text:'嗨。我回來了。'},
        {speaker:ZHE,text:'賴宥辰？你還活著喔。'},
        {speaker:YC,text:'考前了嘛。晚上不放歌了。'},
        {speaker:YC,text:'……有人有第七週以後的筆記嗎？'},
        {speaker:BH,text:'（從前面回頭）第一排有。影印一份五塊。'},
        {speaker:YC,text:'成交。'},
        {speaker:YC,text:'（翻了兩頁筆記）第七十一條。'},
        {speaker:YC,text:'「法律行為，違反強制或禁止之規定者，無效。」'},   /* 民法第 71 條（現行條文）：BB 照法律審查核對一字不差 */
        {speaker:YC,text:'「但其規定並不以之為無效者，不在此限。」'},
        {speaker:ZHE,text:'……你剛剛才看第一次欸。'},
        {speaker:YC,text:'記性好。其他都不好。'},
        done('F2_06',[YC]) ] },
    /* F2-08 芯慈「提前一天」：第 10 週週四，民總下課（教室）；芯慈、阿哲在 */
    { id:'ev_f2_xc_report', title:'提前一天', participants:[XC,ZHE], location:'any', trigger:'class', yieldClass:true, once:true, term:['Y1S1'], background:'blur',
      afterClass:function(it){ return !!(it&&it.c&&it.c.id==='civ_general')&&!busyAfter(it,this); },
      prereq:C(G=>S.due(G,'F2_08')),
      dialogue:[ {speaker:null,text:'（下課鐘一響，芯慈已經把筆電收進包包。）'},
        {speaker:ZHE,text:'芯慈，等一下一起吃飯？'},
        {speaker:XC,text:'今天不行。財金系的報告，五點要交。'},
        {speaker:XC,text:'而且你們要提前一天約。我說過了。'},
        {speaker:ZHE,text:'好啦。那明天中午？'},
        {speaker:XC,text:'明天可以。十二點，燒臘店。'},
        {speaker:null,text:'（她已經走到門口，回頭補一句。）'},
        {speaker:XC,text:'{name} 也來。'},
        done('F2_08',[XC]) ] } ];

  /* ---------- 桌遊團群組那三則（還沒在 noodle_team 的不發；照 PHONE.at 的時間傳，同一天有女主角或主線的事件＝延到隔天同一時間，最多 3 天）---------- */
  const g=(from,text)=>({th:NG,from,text});
  S.MSG={
    F2_02:{tag:'msg_f2_yu_debate1',ids:[YU],items:G=>{ const L=[g(YU,'新生盃第一場！！贏了！！'),g(YU,'（照片：四個人拿著計時器，Alison 在最中間）'),g(ZHE,'我就說'),g(BH,'題目是什麼。'),g(YU,'大學應不應該廢除點名！我們正方！'),g(ZHE,'妳自己每堂都有到嗎'),g(YU,'有！……大部分！')];
        L[L.length-1].ask={id:'msg_f2_yu_debate1_r',opts:[{t:'恭喜！',say:[{from:YU,text:'謝謝'+name(G)+'！！'}]},{t:'下一場什麼時候？',say:[{from:YU,text:'兩個禮拜後！不准來看，我會緊張'}]}]}; return L; },
      set:{YU_DEBATE_R1:true}},
    F2_05:{tag:'msg_f2_mx_xlsx2',ids:[MX],items:G=>[g(MX,evDone(G,'ev_card_mingxuan')?'（檔案：公館便宜好吃_v2.xlsx）':'之前做的清單，更新了。'),g(MX,'新增三家。刪掉一家，漲價了。'),g(ZHE,'明軒你是去吃了幾家'),g(MX,'家教回來的路上順便吃的。'),g(BH,'第七列那家，週一沒開。'),g(MX,'……已改。不要外流。')]},
    F2_09:{tag:'msg_f2_xc_wrong',ids:[XC],items:G=>{ const L=[g(XC,'他到最後一集才說出口 我真的會瘋掉'),g(XC,'……傳錯群組了。'),g(YU,'哪一部！！'),g(ZHE,'誰說出口'),g(XC,'晚安。')];
        L[L.length-1].ask={id:'msg_f2_xc_wrong_r',opts:[{t:'哪一部？',say:[{from:XC,text:'（隔了十分鐘）明天跟你說。現在不行，還有兩集。'}]}]}; return L; },
      after:{at:7+10/60,items:[g(BH,'一點了還不睡。')],tag:'msg_f2_xc_wrong_am'}} };   /* 早上 07:10 同一個群組多一則 */
  const inGrp=G=>typeof PHONE!=='undefined'&&!!PHONE.inGroup&&PHONE.inGroup(G,'noodle_team');
  S.phone=function(G){ if(!G||!G.flags||typeof PHONE==='undefined'||!PHONE.at) return;
    for(const code in S.MSG){ const M=S.MSG[code], fl='FRIEND_AUTO_'+code;
      if(!F(G)[fl]&&!PHONE.sent(G,M.tag)&&inGrp(G)&&S.due(G,code)&&timeOk(G,code)){
        const it=M.items(G); PHONE.at(G,G.day,G.hour,it,M.tag); Object.assign(G.flags,M.set||{}, {[fl]:true}); G.flags['FRIEND_AUTO_'+code+'_DAY']=G.day;
        if(typeof SOCIAL!=='undefined'&&SOCIAL.rel) for(const id of M.ids){ try{ SOCIAL.rel(id).fam+=1; }catch(e){} } }
      if(M.after&&F(G)[fl]&&!PHONE.sent(G,M.after.tag)){ const d=F(G)['FRIEND_AUTO_'+code+'_DAY']; if(d!=null&&G.day===d+1&&G.hour>=M.after.at) PHONE.at(G,G.day,G.hour,M.after.items,M.after.tag); } } };   /* 00:40 那一則是前一個遊戲日的 24:40；07:10 是隔天 */

  /* ---------- 第 3 節 名字卡 ---------- */
  S.CARD_IDS=[ZHE,KAI,BH,MX,YU,YC,XC,'classmate_peishan'];
  S.CARD_NOTE={kai:'（203 室友）',classmate_bohan:'（203 室友）'};   /* AA_637 第 3 節的建議寫法 */
  S.cardText=function(id){ const c=typeof CHARACTERS!=='undefined'?CHARACTERS[id]:null; if(!c) return ''; const tag=typeof SOCIAL!=='undefined'&&SOCIAL.yearTag?SOCIAL.yearTag(id):(c.department||'');
    return c.name+'｜'+(c.fullname||c.name)+'・'+String(tag).replace('・','')+(S.CARD_NOTE[id]||''); };
  const idOfWho=who=>{ if(!who) return null; if(typeof who==='string') return S.CARD_IDS.find(id=>CHARACTERS[id]&&CHARACTERS[id].name===who)||null;
    if(who.charId&&S.CARD_IDS.includes(who.charId)) return who.charId; const n=String(who.name||'').replace(/（.*）$/,''); return S.CARD_IDS.find(id=>CHARACTERS[id]&&CHARACTERS[id].name===n)||null; };
  S.shown=null;
  S.onSay=function(G,who){ if(!G||!G.flags||(G.stage||'law')!=='law') return null; const id=idOfWho(who); if(!id||G.flags['NAMECARD_'+id]) return null;
    if(String((who&&who.name)||'').includes('（手機）')) return null;   /* 對話框裡的手機訊息不算「說話」 */
    G.flags['NAMECARD_'+id]=true; const t=S.cardText(id); S.shown=t; S.show(t); return t; };
  S.show=function(t){ if(typeof document==='undefined') return; let el=document.getElementById('nameCard'); if(!el){ el=document.createElement('div'); el.id='nameCard'; (document.getElementById('ui')||document.body).appendChild(el); }
    el.textContent=t; el.classList.remove('nc-out'); el.classList.add('nc-in'); clearTimeout(S._t); S._t=setTimeout(()=>{ el.classList.remove('nc-in'); el.classList.add('nc-out'); },3000); };
  /* 舊存檔：已經認識的（記憶 FIRST_MET、熟悉度不是陌生人、演過名片場）不出現；NAMECARD_V＝這一版以後的新遊戲不用看（game3d.js defaults）*/
  S.known=function(s,id){ const F0=s.flags||{}; if(F0['FRIEND_CARD_'+id]) return true; const M=s.social&&s.social.mem&&s.social.mem[id]; if(Array.isArray(M)&&M.length) return true;
    const R=s.social&&s.social.rel&&s.social.rel[id]; return !!(R&&((R.fam|0)>=5||(R.trust|0)>0)); };
  S.migrate=function(s){ if(!s||!s.flags||typeof s.flags!=='object'||s.flags.NAMECARD_V) return false; s.flags.NAMECARD_V=1; let n=0; for(const id of S.CARD_IDS) if(S.known(s,id)){ s.flags['NAMECARD_'+id]=true; n++; } return n>0; };

  S.install=function(){ if(typeof STORY_EVENTS!=='undefined') for(const e of S.EVENTS) if(!STORY_EVENTS.some(x=>x&&x.id===e.id)) STORY_EVENTS.push(e);
    if(typeof STORY!=='undefined'&&Array.isArray(STORY.PHONE_RULES)&&!STORY._f2Phone){ STORY.PHONE_RULES.push(G=>{ try{ S.phone(G); }catch(e){ console.warn('FRIENDS2.phone',e); } }); STORY._f2Phone=true; } };
  S.install();
  return S;
})();
if(typeof window!=='undefined') window.FRIENDS2=FRIENDS2;
