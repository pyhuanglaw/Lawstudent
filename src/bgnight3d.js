/* ===== 明軒的桌遊夜（AA_623 麵店團改成桌遊團＋AA_618 第 2-4 節第 3 點；使用者 11-03「明軒是會主動約大家玩桌遊 固定在其中一家新的店裡」「要有慈昕」「沛珊偶爾也會去桌遊」）=====
   - 什麼時候：大一上第 5 週起，隔週週五 20:00～23:30，溫州街日常失速的八人長桌（AA_618 2-4 第 3 點，企劃線 ace533a43：大一上第 5、7、10、12、14 週——第 6 週國慶照隔週跳過，期中第 8、9 週停、考完那一週接著辦）；
     其他學期從第 2 週起隔週；碰到考試週（term.exam）就停、考完的第一週接著；那個週五是國定假日就停那一次（不補、不改隔週）；一直辦到大四下。S.weeks(學期)＝那一學期辦的週次。
   - 誰約：明軒，當天 12:00 傳（已經認識明軒）。還不在群組＝私訊（第一次兩句）；在桌遊團群組（noodle_team）＝群組一句（三句輪流）。回「好。」才排出遊（20:00）；「這次不行。」明軒「好，兩個禮拜後還有。」
   - 群組裡的回覆（在群組才有、認識的人才說；不用玩家回）：Alison（週五晚上在戲院打工，AA_615；只在群組回）、阿哲、柏翰（第一次）、芯慈（固定成員，兩句輪流）、沛珊（大約三次來一次：那一晚有來才說；大三去台南以後不來）。
   - 去了（2D，日常失速還沒有 3D；背景先用現有的桌遊店 boardgame_gg，BB 跟使用者要日常失速的圖）：開場旁白、明軒第一次那句、芯慈第一次兩句、阿凱（大二起，問過「要不要找阿凱？」以後一學期一次）、結束旁白四句輪流。
     第一次去、還不在群組＝結束時明軒「我開個群組，之後在這裡約。」把玩家加進桌遊團（noodleTableDay＋BGN_JOIN 'night'；群組在 story3d.js phoneRules 建）。
   - 作息：桌遊夜 20:00～23:30 明軒、阿哲、芯慈、柏翰在日常失速（沒有 3D＝不在遊戲的場景裡，away 字），沛珊、阿凱有來的那一晚也是（STORY.SCHED_X）。原本「麵店日長桌」的作息（characters.js ndlDay）拿掉。
   - 沒去不懲罰。去過三次以上（BGN_N），明軒的人物頁多一行（src/whois3d.js）。
   旗標：BGN_GO（答應的那一晚＝日子）、BGN_N（去過幾次）、BGN_INV_N（約過幾次）、BGN_BH（柏翰那句說過）、BGN_KAI_ASKED（問過要不要找阿凱的那一天）、BGN_JOIN（明軒加群組：'night'｜'w13'｜'late'）。
   測試：node tests/aa623_boardgame_unit.js */
'use strict';
const BGN=(function(){
  const S={};
  const MX='classmate_mingxuan', NG='g:noodle_team', PM='p:'+MX;
  S.EV='ev_bgnight'; S.PLACE='日常失速'; S.BG='boardgame_gg'; S.SCENE='溫州街・日常失速・長桌';
  S.TERMS=['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'];
  S.H0=20; S.H1=23.5;
  const hasCal=()=>typeof CALENDAR!=='undefined'&&!!CALENDAR.termOf;
  const knows=(id,G)=>typeof STORY!=='undefined'&&!!STORY.knows&&STORY.knows(id,G);
  const inGrp=G=>typeof PHONE!=='undefined'&&!!PHONE.inGroup&&PHONE.inGroup(G,'noodle_team');
  const law=G=>(G.stage||'law')==='law';
  const L=S.LINES={
    first:['今天晚上八點，日常失速。我帶了一款新的桌遊。','四個人以上才好玩。你來的話剛好。'],
    group:['今晚桌遊，八點，老位子。','今天玩新的，規則我先看過了。','今晚缺一個，誰來？'],
    no:'好，兩個禮拜後還有。',
    yu:'我在戲院啦……幫我留一局。', zhe:'我練完就過去。幫我點厚片。',
    bh:'我不太會玩。', bhMx:'我教你，五分鐘。',
    xc:['我報告寫到一段落就過去。','這次我不要當銀行。'],
    ps:'我九點才到可以嗎？', psMx:'可以，第二局算你。',
    open:'（長桌上已經擺好了。明軒在發牌，旁邊放著規則書。）',
    mxFirst:'這款是交換資源蓋房子的。……先玩一輪，邊玩邊懂。',
    xcFirst:'規則書給我。……好，我懂了，你們先玩。', xcFirstN:'（她看完規則，第二輪就贏了。）',
    kai:'我研究過了，這款有必勝法。', kaiN:'（他輸了。）', kaiAsk:'「要不要找阿凱？」', kaiNo:'「（先玩這一局）」',
    end:['（你們玩了三輪。最後一輪明軒輸了，他說是規則書寫得不清楚。）','（玩到第二局，店長跳上桌子，坐在牌堆上。大家只好等牠走。）','（十一點半，店員來問要不要最後點餐。你們又加了一份薯條。）','（明軒把每一局的分數記在手機裡。他說期末要結算。）'],
    group1:'我開個群組，之後在這裡約。',
    away:'在日常失速玩桌遊',
    yuIn:'（十一點多，門口的風鈴響了一聲。Alison 還穿著戲院的外套，手上抱著一袋爆米花。）' };   /* AA_684 第 5 項（企劃線 0382b8a34，AA-C 定 D109）：Alison 23:00 從戲院趕到的那一晚，她進門的旁白（S.yuSign）*/
  S.natHoliday=d=>{ const h=CALENDAR.holiday&&CALENDAR.holiday(d); if(!h) return false; const k=CALENDAR.dateOf(d).key; if(CALENDAR.SCHOOL&&CALENDAR.SCHOOL[k]) return false; if(CALENDAR.typhoon&&CALENDAR.typhoon(d)) return false; return true; };   /* 同 JOBS.natHoliday（勞基法的休假日；校定的不算）*/
  /* 那一天是不是桌遊夜 */
  S.isNight=function(d){ if(!hasCal()||d==null) return false; const t=CALENDAR.termOf(d); if(!t||!S.TERMS.includes(t.id)||t.exam) return false;
    if(S.natHoliday(d)) return false;   /* 國定假日停（校定的停課日，例如運動會、颱風假不算國定假日：照辦）*/
    if(CALENDAR.dateOf(d).wd!==5) return false; return S.weeks(t.id).includes(t.week); };
  const WK={};
  S.START={Y1S1:5};
  S.weeks=function(tid){ if(WK[tid]) return WK[tid]; const out=[]; if(typeof STORY==='undefined'||!STORY.termDayIn) return out;
    const ex=w=>{ const d=STORY.termDayIn(tid,w,5); if(d==null) return null; const t=CALENDAR.termOf(d); return !!(t&&t.exam); };
    let w=S.START[tid]||2; for(let guard=0;guard<30;guard++){ const e=ex(w); if(e==null) break; if(e){ while(ex(w)===true) w++; if(ex(w)==null) break; } out.push(w); w+=2; }
    return (WK[tid]=out); };
  S.yearOf=d=>{ const t=hasCal()?CALENDAR.termOf(d):null, m=t&&/^Y(\d)/.exec(t.id); return m?+m[1]:0; };
  /* 沛珊：大約三次來一次（固定挑法，讀檔不會變）；大一、大二（大三去台南以後不來）*/
  S.psOn=d=>S.isNight(d)&&S.yearOf(d)<=2&&(Math.floor(d/14)%3)===0;
  /* 阿凱：大二起、問過以後，問過之後那一學期起每學期第一個桌遊夜 */
  S.kaiOn=function(G,d){ const a=G&&G.flags&&G.flags.BGN_KAI_ASKED; if(a==null||!S.isNight(d)||d<=a||S.yearOf(d)<2) return false; const t=CALENDAR.termOf(d);
    for(let x=d-1;x>d-140;x--){ const u=CALENDAR.termOf(x); if(!u||u.id!==t.id) break; if(x>a&&S.isNight(x)) return false; } return true; };
  S.CAST=['classmate_mingxuan','zhe','classmate_xinci','classmate_bohan'];
  S.here=function(G,id,d){ if(d==null) d=G.day; if(!S.isNight(d)) return false; if(S.CAST.includes(id)) return true; if(id==='classmate_peishan') return S.psOn(d); if(id==='kai') return S.kaiOn(G,d); return false; };
  /* AA_675 1-3（AA_661 第 64 列）：Alison 23:00 從戲院下班趕到的那一次＝大一下第 13～15 週的桌遊夜（照隔週排＝第 14 週）。那一晚 23:00 以後她也在日常失速 */
  S.YU_LATE={term:'Y1S2',weeks:[13,14,15],h:23};
  S.yuLate=d=>{ if(!hasCal()||d==null||!S.isNight(d)) return false; const t=CALENDAR.termOf(d); return !!t&&t.id===S.YU_LATE.term&&S.YU_LATE.weeks.includes(t.week); };
  /* 作息：桌遊夜 20:00～23:30 在日常失速（沒有 3D）*/
  const pres=(G,id)=>{ if(typeof STORY==='undefined'||!STORY.presence) return true; const p=STORY.presence(id,G); return !(p&&p.here===false); };   /* 那一天人不在（出遠門、回老家）＝不來 */
  S.sched=function(c,G){ if(!c||!G||!law(G)) return null; const hr=G.hour%24; if(c.id==='yu'&&S.yuLate(G.day)&&hr>=S.YU_LATE.h&&hr<S.H1) return pres(G,'yu')?{days:[5],from:S.YU_LATE.h,to:S.H1,zone:null,act:'out',away:L.away,note:'AA_675 1-3 桌遊夜（戲院下班趕到）'}:null;
    if(hr<S.H0||hr>=S.H1||!S.here(G,c.id)) return null;
    if(typeof STORY!=='undefined'&&STORY.presence){ const p=STORY.presence(c.id,G); if(p&&p.here===false) return null; }
    return {days:[5],from:S.H0,to:S.H1,zone:null,act:'out',away:L.away,note:'AA_623 桌遊夜'}; };
  /* 那一晚玩家沒空（AA_828 第 3 節＋第 4 節第 1、2 點，SHOP-JOBS-1112）：那一晚有打工的班和桌遊夜重疊（JOBS.bgnBusy：南洋戲院週五晚場、便利商店週五夜班……所有打工都一樣）——
     明軒照樣約、群組的回覆照舊；**不用玩家回**（沒有可以回的選項），系統自動當沒空、不排出遊；先答應了才排到班的（答應以後才應徵）＝那一晚的出遊取消，不要兩個都演。
     2026-11-12 以前：玩家只有「這次不行。」可以回（明軒回「好，兩個禮拜後還有。」）——AA 第 4 節第 1 點改成不用回 */
  S.busy=(G,d)=>{ try{ return typeof JOBS!=='undefined'&&!!JOBS.bgnBusy&&!!JOBS.bgnBusy(G,d); }catch(e){ return false; } };
  /* 手機：當天 12:00 明軒約 */
  S.phone=function(G){ if(!G||!G.flags||!law(G)||typeof PHONE==='undefined'||!hasCal()) return; const F=G.flags, d=G.day, busy=S.isNight(d)&&S.busy(G,d);
    if(busy&&F.BGN_GO===d){ F.BGN_GO=null; const q=typeof OUT!=='undefined'&&OUT.get?OUT.get(G,'bgn_'+d):null; if(q&&q.state==='planned') q.state='cancelled'; }
    if(S.isNight(d)&&G.hour>=12&&G.hour<S.H0&&knows(MX,G)&&!PHONE.sent(G,'bgn_inv_'+d)){
      const grp=inGrp(G), th=grp?NG:PM, n=F.BGN_INV_N|0, h=Math.max(12,G.hour), opts=[{t:'好。',set:{BGN_GO:d}},{t:'這次不行。',say:[{from:MX,text:L.no}]}];
      const items=(!grp&&n===0?L.first.map(t=>({th,from:MX,text:t})):[{th,from:MX,text:L.group[n%L.group.length]}]);
      if(!busy) items[items.length-1].ask={until:d*24+S.H0,opts};   /* 沒空的那一晚：不問 */
      if(grp){ const R=(id,t)=>({th,from:id,text:t,dt:2/60});
        if(knows('yu',G)) items.push(R('yu',L.yu));
        if(knows('zhe',G)) items.push(R('zhe',L.zhe));
        if(knows('classmate_bohan',G)&&!F.BGN_BH){ items.push(R('classmate_bohan',L.bh),R(MX,L.bhMx)); F.BGN_BH=d; }
        if(knows('classmate_xinci',G)) items.push(R('classmate_xinci',L.xc[n%L.xc.length]));
        if(knows('classmate_peishan',G)&&S.psOn(d)) items.push(R('classmate_peishan',L.ps),R(MX,L.psMx)); }
      F.BGN_INV_N=n+1; PHONE.at(G,d,h,items,'bgn_inv_'+d); }
    if(F.BGN_GO===d&&typeof OUT!=='undefined'&&!OUT.get(G,'bgn_'+d)&&G.day*24+G.hour<d*24+S.H0+0.5)
      OUT.plan(G,{id:'bgn_'+d,ev:S.EV,day:d,h:S.H0,late:0.5,place:S.PLACE,title:'桌遊夜（日常失速）',travel:'走過去約 15 分鐘',travelH:0.25}); };
  /* ===== AA_675（AA_661 第 42、64 列，企劃線 920791094，AA-C 定 D109；任務 AA675-CANON-FOLLOWUP-1104）=====
     1-2 長桌閒聊（NOODLE_TABLE，含 src/heard3d.js 加進來的「別人說起她」AA_503～505）搬到桌遊夜：玩家有去的那一次，場景演完、散場以前照原本的順序演一則——
       挑法同 story3d.js 的 S.ndlTalkPick：一年一組（STORY.ndlTalkGroup）、照 ndlTalkN 輪到第幾則（舊存檔記下的照讀、接著輪）、once／pri、那一則的條件（STORY.ndlTalkIf）、
       about＝她本人在旁邊就不說；只有在桌遊團群組的玩家才有；在場＝那一晚在桌遊夜的人（S.here；Alison 只有 S.yuLate 那一晚），旁白沒有點名的那幾則＝至少一位認識的長桌常客在；
       句子裡有燒臘店的東西換不了的（noodle_table.js 標 bgn:false）跳過——AA_684 第 11 項那 10 則已經刪掉、補了四則桌遊夜版（bgn:false 照認，之後再有換不了的照樣標）。在場的人熟悉 +1（SOCIAL 的 classmate），同燒臘店那一套。
     1-3 ev_yu_sign_seat（events.js，「Alison 每次都坐阿哲旁邊。」）：Alison 23:00 趕到的那一次桌遊夜，接在場景後面演（2D，不等 3D）；條件照事件（認識 Alison、大一下第 13～15 週、只一次），
       記 yu2SeatDay（第三個徵兆 ev_yu_sign_question_* 照舊讀）、記成演過。 */
  const REG=['zhe','yu','classmate_bohan','classmate_xinci'];   /* 長桌常客（story3d.js NDL_REGULARS）*/
  /* AA_685 B5（企劃線 c96613e51，AA-C 定 D109）：每一則每個存檔只演一次，那一學期的用完就不演（不再從頭輪）。演過的記在 G.flags.ndlTalkOnce[key]＝那一天：
     key＝once（heard3d.js 加的那幾則，原本就只演一次）、id（noodle_table.js 的那幾則）、都沒有＝組＋第幾則。舊存檔沒有這些 key＝一則都還沒演（ndlTalkN 照舊決定從第幾則開始找）*/
  S.talkKey=(k,i,e)=>(e&&(e.once||e.id))||('bgn_'+k+'_'+i);
  S.talkHere=(G,id)=>(S.here(G,id,G.day)||(id==='yu'&&S.yuLate(G.day)))&&pres(G,id);
  S.talkPick=function(G){ if(!G||!G.flags||typeof NOODLE_TABLE==='undefined'||typeof STORY==='undefined'||!STORY.ndlTalkGroup||!inGrp(G)) return null; const k=STORY.ndlTalkGroup(G), T=k&&NOODLE_TABLE[k]; if(!T||!T.length) return null;
    const F=G.flags, N=F.ndlTalkN||{}, i0=(N[k]|0)%T.length, O=F.ndlTalkOnce||{}, kn=id=>knows(id,G);
    const ok=(e,i)=>!!e&&!e.retired&&e.bgn!==false&&O[S.talkKey(k,i,e)]==null&&(e.who||[]).concat(e.know||[]).every(kn)&&(!STORY.ndlTalkIf||STORY.ndlTalkIf(G,e.if))
      &&((e.who&&e.who.length)?e.who.every(id=>S.talkHere(G,id)):REG.some(id=>kn(id)&&S.talkHere(G,id)))
      &&!(e.about&&typeof HEARD!=='undefined'&&HEARD&&HEARD.herNear&&HEARD.herNear(G,e.about,(e.who||[])[0]));
    for(let i=0;i<T.length;i++){ const e=T[i]; if(e&&e.pri&&ok(e,i)) return {k,i,e}; }
    for(let n=0;n<T.length;n++){ const i=(i0+n)%T.length, e=T[i]; if(!e||e.pri||!ok(e,i)) continue; return {k,i,e}; }
    return null; };
  S.talk=async function(GM){ const G=GM.G, F=G.flags, p=S.talkPick(G); if(!p) return false; const t=hasCal()?CALENDAR.termOf(G.day):null;
    F.ndlTalkDay=G.day; if(t) F.ndlTalkWk=t.id+':'+t.week;
    const NN=F.ndlTalkN&&typeof F.ndlTalkN==='object'?F.ndlTalkN:(F.ndlTalkN={}); if(!p.e.pri) NN[p.k]=p.i+1;
    { const O=F.ndlTalkOnce&&typeof F.ndlTalkOnce==='object'?F.ndlTalkOnce:(F.ndlTalkOnce={}); O[S.talkKey(p.k,p.i,p.e)]=G.day; }   /* AA_685 B5：每一則都只演一次（原本只有 once 的那幾則）*/
    const here=(p.e.who&&p.e.who.length)?p.e.who:REG.filter(id=>knows(id,G)&&S.talkHere(G,id));
    if(typeof ADV!=='undefined'&&ADV.preload) ADV.preload(p.e.who||[]);
    if(typeof EVENTS!=='undefined'&&EVENTS.runLines) await EVENTS.runLines(p.e.dialogue||[],{id:'bgn_table_'+p.k+'_'+(p.i+1)});
    if(typeof SOCIAL!=='undefined'&&SOCIAL.activity) for(const id of here){ try{ SOCIAL.activity(id,'classmate'); }catch(e){} }
    return true; };
  /* AA_684 第 5 項：那一晚 Alison 進門先一句旁白（L.yuIn）——她真的有來（S.yuLate、那一天人在）、玩家認識她（旁白寫她的名字）就演，徵兆已經演過（舊存檔）也一樣；接著才是「Alison 每次都坐阿哲旁邊。」 */
  S.yuSign=async function(GM){ const G=GM.G; if(!S.yuLate(G.day)||!pres(G,'yu')) return false;
    if(knows('yu',G)&&GM.say) await GM.say(null,L.yuIn);
    if(typeof STORY_EVENTS==='undefined'||typeof EVENTS==='undefined'||!EVENTS.check) return false;
    const ev=STORY_EVENTS.find(e=>e&&e.id==='ev_yu_sign_seat'); if(!ev) return false; let ok=false; try{ ok=!!EVENTS.check(ev,{chain:true}); }catch(e){ ok=false; } if(!ok) return false;
    if(typeof ADV!=='undefined'&&ADV.preload) ADV.preload(ev.participants||[]);
    if(EVENTS.runLines) await EVENTS.runLines(ev.dialogue||[],ev); if(EVENTS.applyConsequences) EVENTS.applyConsequences(ev.consequences);
    const E=G.events||(G.events={done:{},last:{},count:0}); E.done=E.done||{}; E.last=E.last||{}; E.done[ev.id]=(E.done[ev.id]||0)+1; E.last[ev.id]=G.day; E.count=(E.count|0)+1; if(GM.memo&&ev.title) GM.memo(ev.title);
    return true; };
  const N=t=>({speaker:null,text:t}), C=f=>({custom:f});
  const first=G=>!(G.flags.BGN_N|0);
  S.EVENT={ id:S.EV, title:'桌遊夜', participants:[MX], location:'any', trigger:'outing', once:false, background:'dark', hours:S.H1-S.H0,
    dialogue:[ {scene:S.SCENE,bg:S.BG}, N(L.open),
      {if:C(first),speaker:MX,text:L.mxFirst},
      {if:C(G=>first(G)&&knows('classmate_xinci',G)),speaker:'classmate_xinci',text:L.xcFirst},
      {if:C(G=>first(G)&&knows('classmate_xinci',G)),speaker:null,text:L.xcFirstN},
      {if:C(G=>knows('kai',G)&&S.kaiOn(G,G.day)),speaker:'kai',text:L.kai},
      {if:C(G=>knows('kai',G)&&S.kaiOn(G,G.day)),speaker:null,text:L.kaiN},
      {if:C(G=>S.yearOf(G.day)>=2&&knows('kai',G)&&G.flags.BGN_KAI_ASKED==null),choice:[{text:L.kaiAsk,goto:'kai_y'},{text:L.kaiNo,goto:'kai_n'}]},
      {goto:'kai_n'},
      {label:'kai_y'},{call:async G=>{ G.flags.BGN_KAI_ASKED=G.day; }},
      {label:'kai_n'},
      {call:async(G,GM)=>{ const n=G.flags.BGN_N|0; await GM.say(null,L.end[n%L.end.length]); }},
      {call:async(G,GM)=>{ await S.yuSign(GM); await S.talk(GM); }},   /* AA_675 1-3（Alison 每次都坐阿哲旁邊）、1-2（長桌閒聊一則）：場景演完、散場以前 */
      {if:C(G=>G.flags.noodleTableDay==null&&!inGrp(G)),speaker:MX,text:L.group1},
      {call:async G=>{ const F=G.flags; if(F.noodleTableDay==null&&!inGrp(G)){ F.noodleTableDay=G.day; F.BGN_JOIN='night'; }
        F.BGN_N=(F.BGN_N|0)+1; if(typeof SOCIAL!=='undefined'&&SOCIAL.rel){ try{ SOCIAL.rel(MX).fam+=1; }catch(e){} } }} ],
    consequences:{memo:'桌遊夜（日常失速）'} };
  S.install=function(){ if(typeof STORY_EVENTS!=='undefined'&&!STORY_EVENTS.some(e=>e&&e.id===S.EV)) STORY_EVENTS.push(S.EVENT);
    if(typeof STORY!=='undefined'){ if(Array.isArray(STORY.PHONE_RULES)&&!STORY._bgnPhone){ STORY.PHONE_RULES.push(G=>{ try{ S.phone(G); }catch(e){ console.warn('BGN.phone',e); } }); STORY._bgnPhone=true; }
      if(Array.isArray(STORY.SCHED_X)&&!STORY._bgnSched){ STORY.SCHED_X.push(S.sched); STORY._bgnSched=true; } } };
  S.install();
  return S;
})();
if(typeof window!=='undefined') window.BGN=BGN;
