/* ===== 五位配角改稿（AA_497，企劃線 7a38216ca；任務 NPC-STORY-1028、USER_WANTS X119）=====
   使用者 10-28 對 LAWWW-C：配角「全部留著，每個都補故事」「他們可以不能攻略 但有支線任務阿 例如請我幫忙什麼 邀請我去社團」。
   台詞在 src/data/sup497_lines.js（一字不差）；改在現有事件裡的句子寫在各自的檔（語 2、語 4、慈 3、慈 6、M1、M2、DJ、閒聊、Kevin 的群組…，各處註解寫 AA_497 第幾節）。
   第 0 節共同規則：
   - 手機：這一份的訊息都是各人那條線上的（劇情），不算在「劇情以外一天兩則、一個人一週一則」的上限裡；考試週不送的是閒聊型，這裡沒有閒聊型的。
   - 熟悉度：私訊和邀約都要「有點熟以上」（SOCIAL.STAGES 的 FAMILIAR）＋有聯絡方式；週五的歌照 1-4「有他的聯絡方式」就收得到（1-3 的「我欠你一首歌」）。
   - 人不在臺北：訊息照時差（STORY.tzOffset，同 POOL.story）；要當面的那幾場在國外不演（各節沒寫改視訊的）。
   - 舊存檔：過了的場景、訊息不補（訊息只在那一天的前一天到後一天之間排）；旗標沒有＝照「沒選」那一版；家族的學妹讀檔換名（S.migrate）。
   各節的接法：
   1 宥辰  1-3 認識＝CLS.IN_CLASS（課堂那一句後面）＋下課事件（afterClass 函式）；那一堂他晚十分鐘到（STORY.classmateClass 讀 S.ycLate）
           1-4 週五的歌＝STORY.PHONE_RULES（那個月第一個週五 23:30；開學前、考試週往後延一週）；回覆 PHONE.ON_ANSWER
           1-5 電梯＝SIDEQ 的順手的事（YQ_ELEV；手機「今天」那一格、期限那一週的週五）；1-6 地下室＝OUT 出遊（11/9 班級群組貼、麵店團阿哲再貼）
           1-7 被當一科、叫起床；1-8 合約（公館，週五 20:30～21:00）；1-9 明軒路口；1-10 閒聊（events.js SMALLTALK＋STORY.SMALL_AFTER）；1-11 DJ（events.js）
   2 芯慈  2-1 開學那天＝課前事件（beforeClass 函式）；2-2 影印機（總圖一樓）；2-3 慈 3 的 B1、提示、補救（INV 約 Café，iv.ev＝白天版）；2-4 她爸爸；
           2-5 慈 6（r2y3b_events.js）＋沒演到的私訊；2-6 她約（INV.offer）；2-7 讀書會（INV 約 B1 討論室）；2-8 挑一本筆記（房間物品）；2-9 閒聊
   3 Alison 3-1 第 3 週保證認識；3-2 YU2_PICK（events.js）；3-3 一個人的早餐＋語 4（r2y3b_events.js）；3-4 退社；3-5 車禍那晚；3-6 C6 的後果；3-7 法圖＋尾聲
   4 明軒  4-1 B1 版 M1、提示；4-2 傘、咖啡、位子＋M2 那一句（y2r2_3d.js）；4-3 德文（INV 約 B1 討論室）；4-4 存摺；4-5 閒聊
   5 Kevin 5-2 交棒（OUT 出遊 9/17 18:30，118 巷的定食店）、宜蓁私訊；5-3 國考、錯題本、事務所；5-4 梗（sis_b12_events.js、y34b3d.js、story3d.js、y1fill_events.js）
   測試：node tests/aa497_supporting_unit.js */
'use strict';
const SUP497=(function(){
  const S={};
  const L=typeof SUP497_LINES!=='undefined'?SUP497_LINES:{yc:{},xc:{},yu:{},mx:{},kv:{}};
  const YC='classmate_youchen', XC='classmate_xinci', AN='heroine_01', YU='yu', MX='classmate_mingxuan', ZHE='zhe', SIS='heroine_05', LQ='pool_16', ZJW='pool_7', KV='kevin', YZ='family_junior';
  S.IDS={YC,XC,AN,YU,MX,ZHE,SIS,LQ,ZJW,KV,YZ};
  let GMr=null;
  S.bind=gm=>{ if(gm) GMr=gm; return GMr; };
  const curG=()=>(GMr&&GMr.G)||(typeof GAME!=='undefined'&&GAME&&GAME.G)||null;

  /* ---------- 小工具 ---------- */
  const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const dateOf=d=>typeof CALENDAR!=='undefined'?CALENDAR.dateOf(d):{y:2026,m:1,d:1,wd:1,key:''};
  const wdOf=d=>dateOf(d).wd%7;   /* 0＝週日 … 6＝週六（同 G.weekday）*/
  const hr=G=>(((+G.hour||0)%24)+24)%24;
  const now=G=>G.day*24+(+G.hour||0);
  const T=(d,h)=>d*24+h;
  const law=G=>!!G&&!!G.flags&&(G.stage||'law')==='law';
  const termOf=d=>typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(d):null;
  const termDay=(t,w,wd)=>typeof STORY!=='undefined'&&STORY.termDay?STORY.termDay(t,w,wd):null;   /* wd：1＝週一 … 7＝週日 */
  const termDays=t=>typeof CALENDAR!=='undefined'&&CALENDAR.termDays?CALENDAR.termDays(t):null;
  const inTerm=(G,id)=>{ const t=termOf(G.day); return !!t&&t.id===id; };
  const week=G=>{ const t=termOf(G.day); return t?t.week:0; };
  const tid=G=>{ const t=termOf(G.day); return t?t.id:null; };
  const has=(id,tag)=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(id,tag);
  const met=(G,id)=>typeof STORY!=='undefined'&&STORY.knows?!!STORY.knows(id,G):has(id,'FIRST_MET');
  const contact=(G,id)=>typeof INV!=='undefined'&&!!INV.hasContact&&INV.hasContact(G,id);
  const stageAt=(id,st)=>typeof SOCIAL!=='undefined'&&!!SOCIAL.STAGES&&SOCIAL.STAGES.indexOf(SOCIAL.stage(id))>=SOCIAL.STAGES.indexOf(st);
  const fam=id=>stageAt(id,'FAMILIAR');
  const dmOK=(G,id)=>fam(id)&&contact(G,id);   /* 第 0 節：私訊要有點熟以上＋聯絡方式 */
  const sent=(G,tag)=>typeof PHONE!=='undefined'&&PHONE.sent(G,tag);
  const done=(G,id)=>!!(G.events&&G.events.done&&G.events.done[id]);
  const inGrp=(G,g)=>typeof PHONE!=='undefined'&&!!PHONE.inGroup&&PHONE.inGroup(G,g);
  const abroad=(G,d)=>typeof STORY!=='undefined'&&!!STORY.abroad&&STORY.abroad(Object.assign({},G,{day:d==null?G.day:d}));
  const route=G=>G&&G.flags&&G.flags.EXCHANGE_ROUTE;
  const nameOf=id=>typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(id):id;
  const evOf=id=>typeof STORY_EVENTS!=='undefined'?STORY_EVENTS.find(e=>e.id===id)||null:null;
  /* 那一學期第 w 週、星期 wd（1～7）的那一天；不在那一學期（寒暑假）＝null */
  const tdIn=(t,w,wd)=>typeof STORY!=='undefined'&&STORY.termDayIn?STORY.termDayIn(t,w,wd):termDay(t,w,wd);
  const examWeek=d=>{ const t=termOf(d); return !!t&&!!t.exam; };
  /* 臺灣時間 → 玩家的當地時間（國外照時差；同 POOL.story）*/
  const tz=(G,d)=>typeof STORY!=='undefined'&&STORY.tzOffset?(+STORY.tzOffset(G,d)||0):0;
  const loc=(G,d,h)=>{ const t=d*24+h+tz(G,d), dd=Math.floor(t/24); return {day:dd,h:t-dd*24}; };
  /* 劇情的訊息：d、h＝臺灣時間；那一天的前一天到後一天之間才排（過了不補）；o.noContact＝群組那種、不用聯絡方式 */
  S.at=function(G,id,d,h,items,tag,o){ o=o||{}; if(d==null||typeof PHONE==='undefined'||sent(G,tag)) return false; if(!o.noContact&&!contact(G,id)) return false;
    const l=loc(G,d,h); if(G.day<l.day-1||G.day>l.day+1) return false; return PHONE.at(G,l.day,l.h,items,tag); };
  const dm=(id,t,x)=>Object.assign({th:'p:'+id,from:id,text:t},x||{});
  const gm=(g,id,name,t,x)=>Object.assign({th:'g:'+g,from:id,name,text:t},x||{});
  const askOf=(id,opts,x)=>Object.assign({id,opts},x||{});
  const say1=(id,t)=>({from:id,text:t});
  /* 台詞 [誰, 字] → 事件引擎的一行 */
  const SP={yc:YC,xc:XC,an:AN,yu:YU,mx:MX,zhe:ZHE,dad:'芯慈的爸爸',kv:'npc_kevin',yz:YZ};
  const NM={kv:'Kevin',yz:'宜蓁'};
  const ln=(w,t,x)=>Object.assign(w==null?{speaker:null,text:t}:(w==='player'?{speaker:'player',text:t}:Object.assign({speaker:SP[w]||w,text:t},NM[w]?{name:NM[w]}:{})),x||{});
  const lns=(A,x)=>(A||[]).map(([w,t])=>ln(w,t,x));
  const plan=(G,o)=>typeof OUT!=='undefined'&&OUT.plan&&!OUT.get(G,o.id)?OUT.plan(G,o):false;
  /* 和這個人有沒有約好、正在進行的（INV）*/
  const liveIv=(G,id)=>(G.invites||[]).some(iv=>iv.who===id&&['offered','accepted','going','changed'].includes(iv.state));

  /* ===================================================================== 1 宥辰 ===================================================================== */
  /* 1-3 認識：大一上第 2 週起、第一堂他在的下午必修（民總，週四 13:20；「意思表示」是民總；法律系開局第二天的民總是劇情課，所以是第 4 週週四）、還沒認識他（週五先在公館遇到＝FIRST_MET，不演）。
     課堂那一句後面（CLS.IN_CLASS）：他晚十分鐘從後門進來坐你旁邊；下課（afterClass）他說名字。一次（YC_MEET）。法律：民法第 86～98 條意思表示、第 88 條錯誤（LEGAL_REVIEW_REQUIRED，只有條號）*/
  S.ycMeetDue=function(G,it){ if(!law(G)||!it||!it.c||it.exam||it.c.kind!=='required'||!(it.t0>=12)) return false; if(it.term!=='Y1S1'||(it.week|0)<2||it.c.id!=='civ_general') return false;
    if(typeof CLS!=='undefined'&&CLS.storyClass&&CLS.storyClass(G,it)) return false;   /* 第二天的民總是劇情課（story3d.js，不走 CLS 的上課流程）：法律系開局＝下一週的民總才演 */
    const F=G.flags||{}; if(F.YC_MEET!=null||has(YC,'FIRST_MET')) return false; if(typeof STORY!=='undefined'&&STORY.youchenAway&&STORY.youchenAway(it)) return false; return !S.classBusy(G,it); };
  /* 這一堂已經有別的戲＝往後一週（自己排：同一堂下課只演一件，classes3d.js afterClassEvent；主線、女主角的先）。例：新局第 2 週週四的民總下課＝學姊問家聚（ev_sis_fam_hall2，
     沒在走廊問過的）→ 第 3 週；舊存檔（9/17 開局）第 4 週週四＝周教授借書（loans3d.js L1，課堂中）＋以安的報告分工（ev_an_report_split 下課）→ 第 5 週。
     看事件寫死的條件（課、考試、學期、週（carryTo）、星期、一次）＋前置條件（EVENTS.cond(prereq)），不看當下的區域、時間、誰在場（快轉判斷的時候還沒進教室）*/
  S.classBusy=function(G,it){ if(!G||!it||!it.c) return false; const safe=f=>{ try{ return !!f(); }catch(e){ return false; } };
    if(typeof CLS!=='undefined'&&Array.isArray(CLS.IN_CLASS)&&CLS.IN_CLASS.some(f=>f&&!f.sup497&&typeof f.due==='function'&&safe(()=>f.due(G,it)))) return true;
    if(typeof STORY_EVENTS==='undefined') return false; const wd=wdOf(it.day);
    return STORY_EVENTS.some(e=>{ if(!e||e===S.MEET_AFTER||e.retired||e.off||(e.stage||'law')!==(G.stage||'law')) return false;
      if(!(e.afterClass===it.c.id||(typeof e.afterClass==='function'&&safe(()=>e.afterClass(it))))) return false;
      if(e.afterExam?e.afterExam!==it.exam:!!it.exam) return false; if(e.once&&done(G,e.id)) return false;
      if(e.term&&[].concat(e.term).indexOf(it.term)<0) return false; if(e.weekday&&[].concat(e.weekday).indexOf(wd)<0) return false;
      if(e.weeks){ if(e.carryTo!=null?(it.week<Math.min.apply(null,e.weeks)||it.week>e.carryTo):e.weeks.indexOf(it.week)<0) return false; }
      return !(typeof EVENTS!=='undefined'&&EVENTS.cond&&e.prereq)||safe(()=>EVENTS.cond(e.prereq,{})); }); };
  /* 那一堂他晚十分鐘到（story3d.js classmateClass：作息從上課十分鐘起）*/
  S.ycLate=(G,it)=>!!G&&!!it&&S.ycMeetDue(G,it);
  const MEET_IN={ id:'ev_yc_meet_in', participants:[], title:'', background:'blur', dialogue:[], noMeet:[YC] };
  S.meetLines=function(){ const M=L.yc.meet||{}; return lns(M.open).concat([{choice:(M.opts||[]).map((t,k)=>({text:t,set:{YC_MEET:k+1},goto:'r'+(k+1)}))}],
    ...(M.r||[]).map((R,k)=>[{label:'r'+(k+1)}].concat(lns(R),[{goto:'end'}])),[{label:'end'}]); };
  /* 坐到你旁邊（3D 座位上課的時候）：同一排左右的空位，沒有就後一排；找不到就只有旁白 */
  S.sitBeside=function(GM){ try{ const E=GM&&GM.E, P=E&&E.player, n=GM.npc&&GM.npc[YC]; if(!E||!P||!P.seat||!E.zone||!Array.isArray(E.zone.seats)||!GM.sitAt) return false;
      const busy=st=>st===P.seat||st.taken||(E.npcs||[]).some(m=>m&&m!==n&&(m.seat===st||(m.seat&&Math.hypot(m.seat.x-st.x,m.seat.z-st.z)<0.35)));
      const r=P.seat.row, c=P.seat.col, find=(rr,cc)=>E.zone.seats.find(st=>st.row===rr&&st.col===cc&&!busy(st));
      const st=find(r,c+1)||find(r,c-1)||find(r+1,c)||find(r+1,c+1)||find(r+1,c-1); if(!st||!n) return !!st;
      if(n.seat&&GM.standUp) GM.standUp(n); GM.sitAt(n,st); n.pose=n.idlePose='sit'; n.frozen=true; return true; }catch(e){ console.warn('SUP497.sitBeside',e); return false; } };
  S.meetIn=async function(GM,it){ const G=GM.G; if(!S.ycMeetDue(G,it)||typeof EVENTS==='undefined'||!EVENTS.runLines) return false; S.bind(GM);
    S.sitBeside(GM); await EVENTS.runLines(S.meetLines(),MEET_IN); if(G.flags.YC_MEET==null) G.flags.YC_MEET=1; G.flags.YC_MEET_KEY=it.key; G.flags.YC_MEET_DAY=G.day; return true; };
  S.MEET_AFTER={ id:'ev_yc_meet_after', title:'賴宥辰', participants:[YC], location:'any', trigger:'class', once:true, classFirst:true, background:'blur',   /* classFirst：接著課堂中那一段（只在那一堂）*/
    afterClass:it=>{ const G=curG(); return !!G&&!!it&&G.flags&&G.flags.YC_MEET_KEY===it.key&&G.flags.YC_MEET!=null; },
    dialogue:[ {if:{flagIs:{YC_MEET:[1,2]}},goto:'a'},{goto:'c'},
      {label:'a'} ].concat(lns((L.yc.meet||{}).after12),[{set:{YC_OWE_SONG:true}},{goto:'end'},{label:'c'}],lns((L.yc.meet||{}).after3),[{label:'end'}]),
    after:G=>{ if(G.flags.YC_MEET===1||G.flags.YC_MEET===2){ if(typeof INV!=='undefined'&&INV.addContact) INV.addContact(G,YC); } } };   /* 1、2＝交換聯絡方式；3＝不交換（之後 DJ 那段答應去、地下室那場去了才有）*/

  /* 1-4 週五的歌：大一下起，表上那個月的第一個週五 23:30（開學前的週五往後推到開學後第一個週五；考試週順延一週；寒暑假不發）。第 13 則＝畢業典禮前一天 23:30 */
  S.songDay=function(row){ if(row.day) return DK(row.day); const [y,m]=row.ym.split('-').map(Number); const d0=DK(row.ym+'-01'); if(d0==null) return null;
    let d=d0; while(wdOf(d)!==5) d++; let guard=0; while(guard++<6){ const t=termOf(d), cur=dateOf(d); if(cur.m!==m&&!t) return null; if(!t){ d+=7; continue; } if(t.exam){ d+=7; continue; } return d; } return null; };
  S.songOf=n=>((L.yc.songs)||[]).find(r=>r.n===n)||null;
  S.songItems=function(G,row,priv){ const items=[], rec=row.noRec?null:Object.assign(priv?dm(YC,row.rec||L.yc.rec):gm('law_class',YC,'宥辰',row.rec||L.yc.rec),{fold:[row.hear],play:true});
    const says=(row.say||[]).map(t=>priv?dm(YC,t):gm('law_class',YC,'宥辰',t));
    if(row.sayFirst){ items.push(...says); if(rec) items.push(rec); } else { if(rec) items.push(rec); items.push(...says); }
    if(priv&&!row.noReply){ const O=[{t:L.yc.songOpts[0],song:'good'}]; if(!row.noWhere){ const w=row.whereZJW&&has(ZJW,'FIRST_MET')?row.whereZJW:row.where; O.push({t:L.yc.songOpts[1],say:[say1(YC,w)]}); } O.push({t:L.yc.songOpts[2],say:[say1(YC,L.yc.sticker)]});
      items[items.length-1].ask=askOf('yc_song_'+row.n,O); }
    return items; };
  S.songs=function(G){ for(const row of (L.yc.songs||[])){ const d=S.songDay(row); if(d==null) continue; const tag='yc_song_'+row.n;
      if(sent(G,tag)) continue; if(row.n===6&&!(d>DK('2026-11-14'))) continue;   /* 第 6 則：地下室那場之後才發（沒去的也收得到）*/
      if(contact(G,YC)) S.at(G,YC,d,23.5,S.songItems(G,row,true),tag);   /* 有聯絡方式：私訊 */
      else if(row.grp&&inGrp(G,'law_class')) S.at(G,YC,d,23.5,S.songItems(G,row,false),tag,{noContact:true}); } };   /* 沒有：第 1、4、7、12、13 則貼班級群組（BB_113 原本就是班群），其他不發 */
  /* 回「（聽完）好聽。」：輪流「謝了。」「下個月見。」「你有聽完喔。」；第 13 則「謝了。這首不賣。」*/
  S.onSong=function(G,m,o,k){ const id=m&&m.ask&&m.ask.id; if(!id||id.indexOf('yc_song_')!==0||!o||o.song!=='good') return; const row=S.songOf(+id.slice(8)); if(!row) return;
    let t=row.good; if(!t){ const n=G.flags.YC_GOOD_N|0; t=L.yc.goodRot[n%L.yc.goodRot.length]; G.flags.YC_GOOD_N=n+1; } PHONE.post(G,dm(YC,t)); };

  /* 1-5 順手的事：霖澤館的電梯（大二上第 6～9 週；有點熟以上、有聯絡方式、收過第 5 則）。下午課下課（15:10 以後）在霖澤館一樓電梯前開口。
     答應＝掛「順手的事」（SIDEQ：手機「今天」那一格、期限那一週的週五、拒絕不扣分）；那一週任何一天 12:10～12:20 到霖澤館一樓＝做完（YC_ELEVATOR）。
     「我等一下有課。」＝他再錄三天（和地下室散場第 ② 個回答對得上）；答應了、過期沒去＝那個週五 23:00 他傳「錄到了。……」 */
  S.QID='YQ_ELEV';
  S.ELEV_AT={x:4.6,z:-4.3};   /* 霖澤館一樓電梯門前（linze_layout.js elevator：門在 z −3.2、叫車鈕 z −3.9）*/
  S.qRec=G=>typeof SIDEQ!=='undefined'&&SIDEQ.get?SIDEQ.get(G,S.QID):null;
  S.qState=G=>{ const r=S.qRec(G); return r?r.state:null; };
  S.fri=d=>{ let x=d; while(wdOf(x)!==5) x++; return x; };
  S.elevAskDue=function(G){ if(!law(G)||S.qState(G)||!inTerm(G,'Y2S1')||week(G)<6||week(G)>9) return false; const w=wdOf(G.day); if(w<1||w>4) return false; const h=hr(G); if(h<15+10/60||h>=18) return false;   /* 週一～週四（期限是那一週的週五：開口以後至少還有一天的 12:10）*/
    return dmOK(G,YC)&&sent(G,'yc_song_5')&&(typeof SIDEQ==='undefined'||!SIDEQ.openIds||SIDEQ.openIds(G).length<SIDEQ.MAX); };
  S.ELEV_ASK={ id:'ev_yc_elev_ask', title:'霖澤館的電梯', participants:[YC], location:'linze', trigger:'auto', once:true, background:'blur', near:{x:4.6,z:-4.3,r:3},
    prereq:{custom:G=>S.elevAskDue(G)&&!!(GMr&&GMr.E&&GMr.E.player&&(GMr.E.player.lv|0)===0)},
    dialogue:lns((L.yc.elev||{}).open).concat([{choice:[{text:(L.yc.elev||{}).opts[0],set:{YC_ELEV_ASK:'yes'},goto:'y'},{text:(L.yc.elev||{}).opts[1],set:{YC_ELEV_ASK:'no'},goto:'n'}]},
      {label:'n'}],lns((L.yc.elev||{}).no),[{goto:'end'},{label:'y'},{label:'end'}]),
    after:(G,GM)=>{ if(G.flags.YC_ELEV_ASK==='yes') S.acceptElev(GM&&GM.G===G?GM:{G}); else S.declineElev(G); } };
  S.acceptElev=function(GM){ const G=GM.G; if(typeof SIDEQ==='undefined') return null; const by=S.fri(G.day);
    const r=SIDEQ.rec(G)[S.QID]={state:'open',step:'block',day:G.day,by,term:SIDEQ.termKey?SIDEQ.termKey(G):'Y2S1'}; if(GM.toast) GM.toast('📝 順手的事：'+L.yc.elev.title,2600); return r; };
  S.declineElev=G=>{ if(typeof SIDEQ!=='undefined') SIDEQ.rec(G)[S.QID]={state:'declined',term:SIDEQ.termKey?SIDEQ.termKey(G):'Y2S1',day:G.day}; };
  S.elevOpen=G=>{ const r=S.qRec(G); return !!r&&r.state==='open'&&r.step==='block'&&G.day<=r.by; };   /* 答應了、還沒過期限（characters.js 宥辰 12:10～12:20 在電梯前的作息也讀這個）*/
  S.elevDoneDue=function(G){ if(!S.elevOpen(G)||G.zone!=='linze') return false; const w=wdOf(G.day); if(w<1||w>5) return false; const h=hr(G); return h>=12+10/60&&h<12+20/60; };
  S.ELEV_DONE={ id:'ev_yc_elev_done', title:'霖澤館的電梯', participants:[YC], location:'linze', trigger:'auto', once:true, background:'blur',
    prereq:{custom:G=>S.elevDoneDue(G)&&!!(GMr&&GMr.E&&GMr.E.player&&(GMr.E.player.lv|0)===0)},
    dialogue:lns((L.yc.elev||{}).done).concat([{set:{YC_ELEVATOR:true}}]),
    after:(G,GM)=>{ const r=S.qRec(G); if(!r||r.state!=='open') return; if(typeof SIDEQ!=='undefined'&&SIDEQ.finish) SIDEQ.finish(GM&&GM.G===G?GM:{G},S.QID,r,{helped:true}); else { r.state='done'; r.doneDay=G.day; }
      if(typeof SOCIAL!=='undefined'&&SOCIAL.adjust) SOCIAL.adjust(YC,{fam:6,trust:6}); } };
  S.elevPhone=function(G){ const r=S.qRec(G); if(!r||r.by==null) return; if(r.state==='open'&&now(G)>=T(r.by,23)&&!(G.flags&&G.flags.YC_ELEVATOR)){ r.state='lapsed'; r.lapseDay=G.day; }
    if(r.state==='lapsed') S.at(G,YC,r.by,23,(L.yc.elev.lapse||[]).map(t=>dm(YC,t)),'yc_elev_lapse'); };
  S.register=function(){ if(typeof SIDEQ==='undefined'||!SIDEQ.Q) return false; if(!SIDEQ.Q[S.QID]) SIDEQ.Q[S.QID]={shop:'sup:'+YC,title:L.yc.elev.title,avail:()=>false,accept:async()=>{}};
    if(!SIDEQ.hint._sup){ const h0=SIDEQ.hint; SIDEQ.hint=Object.assign((id,r)=>id===S.QID?S.elevHint(r):h0(id,r),{_sup:true}); } return true; };
  S.elevHint=r=>{ const d=r&&r.by!=null?dateOf(r.by):null; return '平日 12:10～12:20 到霖澤館一樓的樓梯口幫宥辰擋人'+(d?'（到 '+d.m+'/'+d.d+' 週五）':''); };   /* 介面的字 */

  /* 1-6 地下室的第一場（BB_70 7b，AA 定稿；2026-11-14（六）20:00）：11/9（一）21:00 班級群組宥辰貼、麵店團阿哲再貼一次（看到的人排進行程；「出發」才去）*/
  S.GIG='2026-11-14'; S.GIG_ASK='2026-11-09';
  S.gigPhone=function(G){ const d=DK(S.GIG_ASK), g=DK(S.GIG); if(d==null||g==null||!law(G)) return;
    if(G.day>=d-1&&now(G)<T(g,20.5)&&!sent(G,'yc_gig_ask')&&(inGrp(G,'law_class')||inGrp(G,'noodle_team'))){ const it=[];   /* 班級群組（同班的人都看得到）＋阿哲在麵店團再貼一次（11/14 開場以後才進群組的不補）*/
      if(inGrp(G,'law_class')) it.push(gm('law_class',YC,'宥辰',L.yc.gig.invite)); if(inGrp(G,'noodle_team')) it.push({th:'g:noodle_team',from:ZHE,text:L.yc.gig.invite});
      if(PHONE.at(G,d,21,it,'yc_gig_ask')) G.flags.YC_GIG_INV=true; }
    if(G.flags.YC_GIG_INV&&now(G)>=T(d,21)&&now(G)<T(g,20.5)) plan(G,{id:'yc_gig',ev:'ev_yc_gig',day:g,h:20,late:0.5,place:'公館・地下室',title:'宥辰的第一場（公館的地下室 20:00）',travel:'走過去約 15 分鐘',travelH:0.25,hours:2.5,back:'散場了。'}); };   /* 看到的人排進行程；時間到「出發」才去（不去＝沒去的那一版）*/
  S.GIG_EV={ id:'ev_yc_gig', title:'地下室的第一場', participants:[YC,ZHE], location:'any', trigger:'outing', once:true, background:'dark', hours:2.5,
    dialogue:[ {scene:'公館・地下室'},
      Object.assign(ln.apply(null,L.yc.gig.lq),{if:{memory:[{npc:LQ,tag:'FIRST_MET'}]}}),   /* 認識詹立群的開場多一句旁白（第 1-6 節）*/
      {choice:L.yc.gig.pos.map((t,k)=>({text:t,set:{YC_GIG_POS:['front','back','box'][k]}}))},
      Object.assign(ln.apply(null,L.yc.gig.elev),{if:{flags:['YC_ELEVATOR']}}),   /* 有 YC_ELEVATOR：他上台前經過你旁邊 */
      Object.assign(ln.apply(null,L.yc.gig.front),{if:{flagIs:{YC_GIG_POS:'front'}}}),
      Object.assign(ln.apply(null,L.yc.gig.back),{if:{flagIs:{YC_GIG_POS:'back'}}}) ].concat(lns(L.yc.gig.song),[
      Object.assign(ln.apply(null,L.yc.gig.count),{if:{flagIs:{YC_GIG_POS:'box'}}}),   /* 散場他數錢 */
      ln.apply(null,L.yc.gig.ask),
      {choice:L.yc.gig.ans.map((t,k)=>({text:t,set:{YC_GIG_ANS:k+1},goto:'g'+(k+1)}))} ],
      ...L.yc.gig.rep.map((r,k)=>[{label:'g'+(k+1)},ln(r[0],r[1]),{goto:'end'}]),[{label:'end'},{set:{YC_GIG:true}}]),
    after:G=>{ if(typeof INV!=='undefined'&&INV.addContact) INV.addContact(G,YC); },   /* 1-4：地下室那場去了＝有聯絡方式 */
    outingMissed:(G,GM,q)=>S.gigMissed(G,q) };
  /* 沒去：當天晚上 22:30 群組一段 30 秒的錄影，阿哲那一句（麵店團；不在麵店團＝班級群組）*/
  S.gigMissed=function(G){ const g=DK(S.GIG); if(g==null||G.flags.YC_GIG) return false; const grp=inGrp(G,'noodle_team')?'noodle_team':(inGrp(G,'law_class')?'law_class':null); if(!grp) return false;
    return PHONE.at(G,g,22.5,[{th:'g:'+grp,from:ZHE,text:L.yc.gig.video},{th:'g:'+grp,from:ZHE,text:L.yc.gig.missed}],'yc_gig_missed'); };

  /* 1-7 被當一科：大二上第 1 週週三 21:00（有點熟以上、有聯絡方式）；大二下三個週四 07:40 手機問要不要叫他起床；大三上第 1 週週三 21:00 過了 */
  S.failPhone=function(G){ const F=G.flags, A=L.yc.fail;
    { const d=termDay('Y2S1',1,3); if(d!=null&&dmOK(G,YC)){ const items=A.msg.map(t=>dm(YC,t));
        items[items.length-1].ask=askOf('yc_fail',A.opts.map((t,k)=>({t,set:{YC_FAIL:['wake','when','ok'][k]},say:A.rep[k].map(r=>say1(YC,r))}))); S.at(G,YC,d,21,items,'yc_fail'); } }
    if(F.YC_FAIL==='wake') F.YC_WAKE=true; if(F.YC_FAIL==='when') F.YC_WHEN=true;
    if(F.YC_WAKE){ const W=S.wakeDays(); W.forEach((d,k)=>{ S.at(G,YC,d,7+40/60,[{th:'sys',text:A.wakeAsk,ask:askOf('yc_wake_'+(k+1),[{t:A.wakeOpt,post:false,wake:true}],{until:T(d,9)})}],'yc_wake_'+(k+1)); }); }   /* 手機（通知）跳一則，回了才傳給他 */
    { const d=termDay('Y3S1',1,3); if(d!=null&&dmOK(G,YC)) S.at(G,YC,d,21,A.passed.map(t=>dm(YC,t)).concat(F.YC_WHEN?[dm(YC,A.passedWhen)]:[]),'yc_passed'); } };   /* 大三上第 1 週週三 21:00（大二下重修過了）*/
  /* 大二下的三個週四（第 1～3 週；放假的那一週往後找）*/
  S.wakeDays=function(){ const out=[]; for(let w=1;w<=8&&out.length<3;w++){ const d=tdIn('Y2S2',w,4); if(d==null) continue; if(typeof CALENDAR!=='undefined'&&CALENDAR.holiday&&CALENDAR.holiday(d)) continue; out.push(d); } return out; };
  S.onWake=function(G,m,o){ const id=m&&m.ask&&m.ask.id; if(!id||id.indexOf('yc_wake_')!==0||!o||!o.wake) return; const n=G.flags.YC_WAKE_N|0; G.flags.YC_WAKE_N=n+1;
    PHONE.post(G,{th:'p:'+YC,from:'player',who:null,text:L.yc.fail.wakePost}); PHONE.post(G,dm(YC,L.yc.fail.wakeRep[Math.min(n,L.yc.fail.wakeRep.length-1)])); };

  /* 1-8 樂團的合約（大三上第 6～10 週，有點熟以上；週五 20:30～21:00 公館巷口，他去上班前；一次）。著作權法第 36、37 條（讓與、授權；台詞沒寫條號，LEGAL_REVIEW_REQUIRED）*/
  S.DEAL={ id:'ev_yc_deal', title:'樂團的合約', participants:[YC], location:'gongguan', trigger:'auto', once:true, term:['Y3S1'], weeks:[6,7,8,9,10], weekday:[5], time:[20.5,21], background:'blur', near:{npc:YC,r:5},
    prereq:{custom:G=>law(G)&&fam(YC)&&!abroad(G)},
    dialogue:lns(L.yc.deal.open).concat([{choice:L.yc.deal.opts.map((t,k)=>({text:t,set:{YC_CONTRACT:['KEY','NO','LAWYER'][k]},goto:'d'+(k+1)}))}],
      ...L.yc.deal.r.map((R,k)=>[{label:'d'+(k+1)}].concat(lns(R),[{set:{['YC_CONTRACT_'+['KEY','NO','LAWYER'][k]]:true}},{goto:'end'}])),[{label:'end'}]) };
  S.dealPhone=function(G){ const F=G.flags, A=L.yc.deal, v=F.YC_CONTRACT;
    if(v&&A.after[v]){ const d=termDay('Y3S2',4,3); if(d!=null){ const items=A.after[v].map(t=>dm(YC,t)); if(v==='NO') items[items.length-1].ask=askOf('yc_deal_no',A.noOpts.map(([t,r])=>({t,say:[say1(YC,r)]}))); S.at(G,YC,d,21,items,'yc_deal_after'); } }   /* 大三下第 4 週 */
    if(dmOK(G,YC)){ S.at(G,YC,termDay('Y4S1',3,3),21,[dm(YC,A.y4a)],'yc_y4a'); S.at(G,YC,termDay('Y4S2',6,3),21,[dm(YC,A.y4b)],'yc_y4b'); } };   /* BB_113 原句：大四上第 3 週、大四下第 6 週（LAWWW 排；第 11 則「實習公司的影印機」在大四上 10 月，實習那一則排在它前面）*/

  /* 1-9 明軒：大一下起，週二、四 21:00 前後兩個人都在公館（明軒在公車站、宥辰在公館）＝點明軒聽一句（一次）*/
  S.NOD={ id:'ev_mx_yc_nod', title:'公館的路口', participants:[MX], location:'gongguan', trigger:'interact', priority:7, once:true, weekday:[2,4], time:[20.75,21.5], background:'blur', npcZone:YC,
    term:['Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'], prereq:{custom:G=>law(G)&&has(YC,'FIRST_MET')&&has(MX,'FIRST_MET')},
    dialogue:lns(L.yc.mxNod) };

  /* ===================================================================== 2 芯慈 ===================================================================== */
  const xcMet=G=>has(XC,'FIRST_MET');
  /* 2-1 開學那天（以安同框 1）：大一上第 1 週第一堂必修、上課前（課前事件；新局＝9/1（一）的憲法，玩家沒去就是第 1 週下一堂去上的必修）。一次、只是看到（noMeet：不算認識兩個人）。
     照稿：旁白直接寫「以安」（新局玩家 9/4 第二天才正式認識她；慈 3「開學第一天」、慈 5「開學那天」對得上）。宿營已經認識芯慈的，「那個女生」改「芯慈」。舊存檔（9/17 開局）沒有第 1 週＝不演 */
  const XCM={custom:G=>xcMet(G)}, swapGirl=t=>t.split('那個女生').join('芯慈');
  S.DAY1={ id:'ev_xc_day1', title:'第一排', participants:[AN,XC], noMeet:[AN,XC], location:'any', trigger:'class', once:true, background:'blur',
    beforeClass:it=>{ const G=curG(); return !!G&&law(G)&&!!it&&!!it.c&&it.c.kind==='required'&&!it.exam&&it.term==='Y1S1'&&it.week===1; },
    dialogue:[].concat(...(L.xc.day1||[]).map(([w,t])=>w==null&&t.indexOf('那個女生')>=0?[ln(w,t,{unless:XCM}),ln(w,swapGirl(t),{if:XCM})]:[ln(w,t)])) };
  /* 2-2 影印機（以安同框 2）：大一下期中考前一週（稿寫第 9 週＝期中考的第二週；照「期中考前一週」到第 9 週都算）、總圖一樓的影印機、中午 12:10～13:00；兩個人都認識才演（旁白寫了名字）。
     兩個人的作息（characters.js 最前面那一筆）：這三週的週一、三、四、五中午站在影印機前，演過就不來（週二中午以安在 118 巷＝不排、不演；週四 13:20 民總，13:05 起在教室）*/
  S.COPY_AT={x:8.0,z:2.6};   /* 總圖一樓服務台南邊（library_layout.js 的 desk (7.8,4.4)）；影印機的實體物件：LAWWW2 */
  S.copyDue=G=>law(G)&&inTerm(G,'Y1S2')&&week(G)>=7&&week(G)<=9&&[1,3,4,5].indexOf(wdOf(G.day))>=0&&!(typeof CALENDAR!=='undefined'&&CALENDAR.holiday(G.day))&&hr(G)>=12+10/60&&hr(G)<13&&met(G,AN)&&xcMet(G)&&!done(G,'ev_xc_copy');
  S.COPY={ id:'ev_xc_copy', title:'影印機', participants:[XC,AN], noMeet:[AN,XC], location:'library_hall', trigger:'auto', once:true, background:'blur', near:{x:8.0,z:2.6,r:2.2},
    prereq:{custom:G=>S.copyDue(G)&&!!(GMr&&GMr.E&&GMr.E.player&&(GMr.E.player.lv|0)===0)},
    dialogue:lns(L.xc.copy.open).concat([{choice:L.xc.copy.opts.map((t,k)=>({text:t,goto:'c'+(k+1)}))}],
      ...L.xc.copy.r.map((R,k)=>[{label:'c'+(k+1)}].concat(lns(R),k===0?[{set:{XC_COPY:true}}]:(k===2?[{set:{XC_RPS:true}}]:[]),[{goto:'end'}])),[{label:'end'}]) };
  /* 2-3 慈 3：B1 二十四小時自習室的版本（events.js 的 ev_xinci_second 照舊在便利商店；兩個版本只演一個）、提示、補救 */
  S.SECOND_B1=null;   /* 載入時照 ev_xinci_second 組（S.buildSecond）*/
  S.secondDone=G=>done(G,'ev_xinci_second')||done(G,'ev_xinci_second_b1')||done(G,'ev_xinci_second_day');
  S.buildSecond=function(){ const base=evOf('ev_xinci_second'); if(!base) return null; const D=base.dialogue.slice(), N0=D.findIndex(l=>l&&l.speaker===null&&/^（芯慈在買咖啡/.test(l.text||''));
    const B1=D.map(l=>Object.assign({},l)); if(N0>=0){ B1[N0]=ln(null,L.xc.secondB1[0]); B1[N0+1]=ln(null,L.xc.secondB1[1]); }
    for(const l of B1) if(l&&typeof l.text==='string'&&l.text.indexOf('十二點四十了')===0) l.text=L.xc.secondB1End;   /* B1 的版本早一點：「十二點半了」*/
    return { id:'ev_xinci_second_b1', title:base.title, participants:[XC], location:'library_b1', trigger:'auto', term:base.term.slice(), weeks:base.weeks.slice(), weekday:base.weekday.slice(), time:[0,0.25], once:true, near:{npc:XC,r:4}, background:'blur',
      prereq:{custom:G=>!!STORY.knows&&STORY.knows(XC,G)&&!S.secondDone(G)}, dialogue:B1 }; };
  /* 補救的白天版（大二下第 2 週週二 16:00 Café，INV 的約）：前兩句換一句、拿掉「（把手機轉靜音）這部很重要，真的。」、結尾換「四點半了。我要去上經濟。」，記 XINCI_SECOND（她第一次主動約人）*/
  S.buildDay=function(){ const base=evOf('ev_xinci_second'); if(!base) return null; const D=base.dialogue.map(l=>Object.assign({},l)), N0=D.findIndex(l=>l&&l.speaker===null&&/^（芯慈在買咖啡/.test(l.text||''));
    if(N0>=0) D.splice(N0,2,ln(null,L.xc.fix.open)); const mi=D.findIndex(l=>l&&/^（把手機轉靜音）/.test(l.text||'')); if(mi>=0) D.splice(mi,1);
    for(const l of D) if(l&&typeof l.text==='string'&&l.text.indexOf('十二點四十了')===0) l.text=L.xc.fix.end;
    return { id:'ev_xinci_second_day', title:base.title, participants:[XC], location:'any', trigger:'meet', once:true, background:'blur', dialogue:D }; };
  S.secondPhone=function(G){ const F=G.flags;
    { const d=termDay('Y2S1',11,1); if(d!=null&&dmOK(G,XC)&&!S.secondDone(G)) S.at(G,XC,d,24+20/60,L.xc.hint.map(t=>dm(XC,t)),'xc_second_hint'); }   /* 提示：第 11 週週一 00:20（慈 3 的「週一深夜」那一格）*/
    { const D1=done(G,'ev_xinci_second')||done(G,'ev_xinci_second_b1'), d=done(G,'ev_xinci_second')?G.events.last.ev_xinci_second:(done(G,'ev_xinci_second_b1')?G.events.last.ev_xinci_second_b1:null);
      if(D1&&d!=null&&dmOK(G,XC)&&inTerm(Object.assign({},G,{day:d}),'Y2S1')) S.at(G,XC,d,25+5/60,L.xc.ask.night.map(t=>dm(XC,t)),'xc_second_night'); }   /* 2-6：慈 3 當晚 01:05 */
    { const mon=termDay('Y2S2',2,1); if(mon!=null&&!S.secondDone(G)&&dmOK(G,XC)&&!F.XC_FIX_ASKED){ const tue=mon+1;   /* 補救：第 15 週還沒演（Y2S1 已經結束）、大二下第 2 週週一 21:00 她約 */
        if(S.at(G,XC,mon,21,[dm(XC,L.xc.fix.ask,{ask:askOf('xc_fix',[{t:L.xc.fix.opts[0],fix:'yes'},{t:L.xc.fix.opts[1],say:[say1(XC,L.xc.fix.no)],set:{XC_FIX:'no'}}],{until:T(tue,15.5)})})],'xc_fix')) F.XC_FIX_ASKED=G.day; } } };
  S.onFix=function(G,m,o){ if(!m||!m.ask||m.ask.id!=='xc_fix'||!o||o.fix!=='yes'||typeof INV==='undefined'||!INV.accept) return; G.flags.XC_FIX='yes'; const tue=m.day+1;
    const iv=INV.accept(G,XC,'cafe',tue,16,{by:'npc'}); if(iv){ iv.ev='ev_xinci_second_day'; iv.label='和'+nameOf(XC)+'約在兩點半 Café'; } };
  /* 2-4 她爸爸（2027-04-23（五）17:30～18:00，霖澤館門口，有點熟以上；一次）；當晚 22:00 私訊 */
  S.DAD_AT={x:34,z:-109};   /* 霖澤館穿堂的門口（zones3d.js：進入霖澤館 (34＋lobby.x, −112＋lobby.z)）*/
  S.DAD={ id:'ev_xc_dad', title:'銀色的車', participants:[XC], location:'campus', trigger:'auto', once:true, time:[17.5,18], background:'blur', near:{x:34,z:-109,r:7},
    prereq:{custom:G=>law(G)&&G.day===DK('2027-04-23')&&fam(XC)&&!abroad(G)},
    dialogue:lns(L.xc.dad.open).concat([{choice:L.xc.dad.opts.map((t,k)=>({text:t,set:{XC_DAD:['AN','XC','NO'][k],['XC_DAD_'+['AN','XC','NO'][k]]:true},goto:'p'+(k+1)}))}],
      ...L.xc.dad.r.map((R,k)=>[{label:'p'+(k+1)}].concat(lns(R),[{goto:'end'}])),[{label:'end'}]) };
  S.dadPhone=G=>{ const v=G.flags.XC_DAD, d=DK('2027-04-23'); if(v&&d!=null&&dmOK(G,XC)) S.at(G,XC,d,22,[dm(XC,L.xc.dad.night[v])],'xc_dad_night'); };
  /* 2-5 沒演到慈 6（那一小時不在麵店、或那條路線不演）：有點熟以上、有聯絡方式，隔天 12:00 私訊 */
  S.firstMissPhone=function(G){ const d=DK('2028-05-04'); if(d==null||done(G,'ev_xinci_first_place')||done(G,'ev_xinci_first_place_video')||G.flags.XINCI_FIRST) return;
    if(G.day>=d&&dmOK(G,XC)){ const A=L.xc.first, items=A.miss.map(t=>dm(XC,t)); items[items.length-1].ask=askOf('xc_first_miss',A.missOpts.map(([t,r])=>({t,say:[say1(XC,r)]}))); S.at(G,XC,d+1,12,items,'xc_first_miss'); } };
  /* 2-6 她主動約（照年份變多；都提前一天約，不說「我變了」）*/
  S.askPhone=function(G){ const F=G.flags, A=L.xc.ask;
    { const d=G.events&&G.events.last&&G.events.last.ev_xinci_notes; if(d!=null&&has(XC,'LENT_NOTES')&&contact(G,XC)) S.at(G,XC,d+1,21,A.notes.map(t=>dm(XC,t)),'xc_notes_fix'); }   /* 大一上慈 1 隔天 21:00（借過筆記）*/
    if(dmOK(G,XC)&&typeof INV!=='undefined'&&INV.offer){
      { const wed=termDay('Y3S1',4,3); if(wed!=null&&G.day===wed&&hr(G)>=21&&!F.XC_ASK_READ&&!abroad(G)){ F.XC_ASK_READ=G.day; if(!liveIv(G,XC)) INV.offer(G,XC,'library',wed+1,19,A.read); } }   /* 大三上第 4 週週三 21:00：總圖、週四 19:00 */
      { const sun=termDay('Y3S1',15,7); if(sun!=null&&G.day===sun&&hr(G)>=21&&!F.XC_ASK_DINNER&&!abroad(G)){ F.XC_ASK_DINNER=G.day; const ex=S.examEnd(G,'Y3S1');   /* 大三上第 15 週週日 21:00：期末考完那天 18:30 麵店；現有的期末飯邀約已經是她＝不發 */
          if(ex&&!S.termendIsHer(G)&&!liveIv(G,XC)) INV.offer(G,XC,'noodle',ex.day,18.5,A.dinner); } }
      { const tue=termDay('Y4S1',3,2); if(tue!=null&&G.day===tue&&hr(G)>=21&&!F.XC_ASK_GROUP&&!abroad(G)&&!abroad(Object.assign({},G,{day:tue+1}))){ F.XC_ASK_GROUP=G.day;   /* 大四上第 3 週週二 21:00：隔天 19:00 B1 討論室（2-7）*/
          if(!liveIv(G,XC)){ const iv=INV.offer(G,XC,'lib_b1',tue+1,19,A.group); if(iv){ iv.ev='ev_xc_y4_group'; } } } } }
    if(route(G)==='JP'&&fam(XC)&&contact(G,XC)){ const d=DK('2028-04-19'); if(d!=null&&abroad(G,d)) S.at(G,XC,d,21,[dm(XC,A.jp,{ask:askOf('xc_jp',[{t:A.jpOpt,say:[say1(XC,A.jpRep)]}])})],'xc_jp'); }   /* 大三下（日本路線、祐廷在日本）：出發後第四週的週三 21:00（LAWWW 排）*/
    { const d=DK('2029-05-27'); if(d!=null&&dmOK(G,XC)){ const P=L.xc.pick, O=[{t:P.opts[0].slice(1,-1),say:[say1(XC,P.r[0])],set:{XC_NOTE_PICK:'civ'}}];   /* 大四下畢業前一週（6/2 典禮的前一個週日）21:00：挑一本 */
        if(G.flags.XC5_RECONCILE) O.push({t:P.opts[1].slice(1,-1),say:[say1(XC,P.r[1])],set:{XC_NOTE_PICK:'crimpro'}}); O.push({t:P.opts[2].slice(1,-1),say:[say1(XC,P.r[2])],set:{XC_NOTE_PICK:'keep'}});
        S.at(G,XC,d,21,[dm(XC,A.notes4,{ask:askOf('xc_notes4',O)})],'xc_notes4'); } } };
  /* 期末考完那天（這學期最後一科期末考考完的那一天；CLS.lastExamEnd）*/
  S.examEnd=(G,term)=>typeof CLS!=='undefined'&&CLS.lastExamEnd?CLS.lastExamEnd(G,term,'final'):null;
  /* 現有的期末飯邀約（TERMEND）是不是已經是她 */
  S.termendIsHer=function(G){ const R=G.termend&&typeof G.termend==='object'?G.termend.Y3S1:null;   /* TERMEND 的那一學期（已經排好的邀約、已經傳出的）；不呼叫 TERMEND.plan（會提早定下名單）*/
    if(R&&typeof R==='object'){ const P=R.plan||{}; if([].concat(P.heart||[],P.friend||[]).some(x=>x===XC||(x&&x.id===XC))||P.fallback===XC||(P.fallback&&P.fallback.id===XC)) return true; if(R.asks&&R.asks[XC]) return true; }
    return (G.invites||[]).some(iv=>iv.who===XC&&iv.te&&iv.te.term==='Y3S1'); };
  /* 2-7 大四上的讀書會（INV 約好的 B1 討論室，iv.ev）*/
  S.GROUP={ id:'ev_xc_y4_group', title:'讀書會的表', participants:[XC], location:'any', trigger:'meet', once:true, background:'blur',
    dialogue:lns(L.xc.group).concat([Object.assign(ln.apply(null,L.xc.groupAn),{if:{custom:G=>!!G.flags.XC5_RECONCILE&&!!(typeof STORY==='undefined'||!STORY.present||STORY.present(AN,G))}}),{set:{XC_Y4_GROUP:true}}]) };   /* 以安那一句：有 XC5_RECONCILE、以安在臺灣 */

  /* ===================================================================== 3 Alison ===================================================================== */
  /* 3-1 保證認識：第 2 週結束還沒認識她（met_yu）＝第 3 週第一次上完霖澤館的必修、走出來（進校園）自動演一次；接 talkYu 的自我介紹原文 */
  S.yuMeetDue=function(G){ if(!law(G)||!inTerm(G,'Y1S1')||week(G)!==3||(G.flags&&G.flags.met_yu)||typeof CLS==='undefined'||!CLS.dayItems||!CLS.rec) return false; const R=CLS.rec(G), h=hr(G);
    return CLS.dayItems(G).some(it=>it.c&&it.c.kind==='required'&&!it.exam&&it.room&&(it.room.zone==='classroom'||it.room.zone==='linze')&&R.done&&R.done[it.key]&&!(R.abs&&R.abs[it.key])&&h>=it.t1-0.05&&h<=it.t1+0.75); };   /* 霖澤館 201（憲法、刑總、民總）*/
  S.YU_MEET={ id:'ev_yu_meet_w3', title:'Alison', participants:[YU], location:'campus', trigger:'enter', once:true, background:'blur',
    prereq:{custom:G=>S.yuMeetDue(G)},
    dialogue:[ ln(null,L.yu.tap),{call:async(G,GM)=>{ const I=typeof STORY!=='undefined'?STORY.YU_INTRO:null; if(!I) return; const who={name:nameOf(YU),charId:YU};
        if(Array.isArray(G.flags.CAMP_SEEN)&&G.flags.CAMP_SEEN.includes('yu')) await GM.say(null,I.camp); for(const t of I.lines) await GM.say(who,t,{expr:'smile'}); }} ],
    after:(G,GM)=>{ G.flags.met_yu=true; if(G.flags.metYuDay==null) G.flags.metYuDay=G.day; if(GM&&GM.rel) GM.rel('yu',2); if(typeof SOCIAL!=='undefined'&&SOCIAL.talkedTo) SOCIAL.talkedTo('yu'); } };   /* 同 talkYu 第一次說話（met_yu、metYuDay、熟悉 +2）*/
  /* 3-3 一個人的早餐（大二下第 4～6 週，平日 08:20～09:05 傅鐘長椅，有點熟以上，已經在一起以後；一次）*/
  S.BKF={ id:'ev_yu_bkf', title:'一個人的早餐', participants:[YU], location:'campus', trigger:'auto', once:true, term:['Y2S2'], weeks:[4,5,6], weekday:[1,2,3,4,5], time:[8+20/60,9+5/60], npcNear:YU, background:'blur',
    prereq:{stage:{npc:YU,min:'FAMILIAR'},custom:G=>law(G)&&!!(typeof STORY!=='undefined'&&STORY.zheYu&&STORY.zheYu(G))},
    dialogue:lns(L.yu.bkf.open).concat([{choice:L.yu.bkf.opts.map((t,k)=>({text:t,set:{YU_BKF:['STAY','WAKE','ALONE'][k],['YU_BKF_'+['STAY','WAKE','ALONE'][k]]:true},goto:'b'+(k+1)}))}],
      ...L.yu.bkf.r.map((R,k)=>[{label:'b'+(k+1)}].concat(lns(R),[{goto:'end'}])),[{label:'end'}]) };
  /* 3-4、3-5、3-6、3-7 的手機 */
  S.yuPhone=function(G){ const F=G.flags, Y=t=>dm(YU,t);
    { const d=termDay('Y2S2',3,3); if(d!=null&&dmOK(G,YU)){ const items=L.yu.quit.msg.map(Y); items[items.length-1].ask=askOf('yu_quit',L.yu.quit.opts.map(([t,r])=>({t,say:[say1(YU,r)]}))); S.at(G,YU,d,21,items,'yu_quit'); } }   /* 3-4 大二下第 3 週週三 21:00（她說禮拜三晚上空下來）*/
    { const d=DK('2027-11-19'); if(d!=null&&sent(G,'y3_c4')&&dmOK(G,YU)){ const items=L.yu.c4.msg.map(Y); items[items.length-1].ask=askOf('yu_c4',L.yu.c4.opts.map(([t,R],k)=>({t,say:R.map(r=>say1(YU,r)),set:{YU_C4:['visit','her','leave'][k]}}))); S.at(G,YU,d,23+40/60,items,'yu_c4'); } }   /* 3-5 C4 阿哲那則之後，當晚 23:40 */
    { const d0=F.YU_C6_DAY, v=F.YU_C6; if(d0!=null&&v&&dmOK(G,YU)&&!sent(G,'y3_yu_c6_bear')){ const A=L.yu.c6, rows=v==='pay'||v==='open'?A.soft:(v==='rule'?A.rule:A.teacher); S.at(G,YU,d0+14,21,rows.map(Y),'yu_c6_after'); } }   /* 3-6 C6 之後第 14 天 21:00（照走的那一路：要學弟賠／把帳攤開＝第 1 列、社團的規則＝第 2 列、其他＝第 3 列；r2y3b3d.js 原本 7 天後那一則熊拿掉，舊存檔收過熊的不再收）*/
    { const d=DK('2028-10-14'); if(d!=null&&route(G)==='US'&&abroad(G,d)&&dmOK(G,YU)) S.at(G,YU,d,15,L.yu.lib.us.map(Y),'yu_lib_us'); }   /* 3-7 美國路線：臺灣時間 15:00 */
    { const d=termDay('Y4S1',10,3); if(d!=null&&dmOK(G,YU)) S.at(G,YU,d,22.5,L.yu.lib.w10.map(Y),'yu_lib_w10'); } };   /* 3-7 大四上第 10 週 22:30（LAWWW 排週三）*/
  /* 3-7 法圖（大四上第 5～8 週，平日 14:00～17:00，法圖二樓最角落，有點熟以上，人在臺灣；一次）*/
  S.LIB={ id:'ev_yu_lawlib', title:'一個人念書', participants:[YU], location:'lawlib', trigger:'auto', once:true, term:['Y4S1'], weeks:[5,6,7,8], weekday:[1,2,3,4,5], time:[14,17], npcNear:YU, background:'blur',
    prereq:{stage:{npc:YU,min:'FAMILIAR'},custom:G=>law(G)&&!abroad(G)},
    dialogue:lns(L.yu.lib.open).concat([{choice:L.yu.lib.opts.map((t,k)=>({text:t,goto:'l'+(k+1)}))}],
      ...L.yu.lib.r.map((R,k)=>[{label:'l'+(k+1)}].concat(lns(R),k===2?[{set:{YU_Y4_LIB:true}}]:[],[{goto:'end'}])),[{label:'end'}]) };

  /* ===================================================================== 4 明軒 ===================================================================== */
  /* 4-1 秘密的入口放寬：總圖 B1 二十四小時自習室，週二、四 22:00～23:30（家教完回來），大一上第 7 週～大一下第 16 週；同一場 M1（events.js ev_mingxuan_notes 的對話，前兩句換、「走到校門口」換「走出總圖」）*/
  S.buildM1B1=function(){ const base=evOf('ev_mingxuan_notes'); if(!base) return null; const D=base.dialogue.map(l=>Object.assign({},l));
    if(D[0]&&D[0].speaker===null) D[0]=ln(null,L.mx.b1[0]); if(D[1]&&D[1].speaker===null) D[1]=ln(null,L.mx.b1[1]);
    for(const l of D) if(l&&l.text==='走到校門口。') l.text=L.mx.b1Out;
    return { id:'ev_mingxuan_notes_b1', title:'B1 的筆記', participants:[MX], location:'library_b1', trigger:'interact', priority:6, weekday:[2,4], time:[22,23.5], term:['Y1S1','Y1S2'], once:true,
      prereq:{stage:{npc:MX,min:'ACQUAINTANCE'},custom:G=>{ const t=termOf(G.day); if(!t) return false; if(done(G,'ev_mingxuan_notes')) return false; return t.id==='Y1S2'?t.week<=16:t.week>=7; }}, background:'blur',
      dialogue:D, consequences:Object.assign(JSON.parse(JSON.stringify(base.consequences||{})),{memo:'在總圖 B1 的自習室遇到明軒'}) }; };   /* 記憶、聯絡方式、MX_M1_DAY（那晚 23:00 的清單）照 M1 */
  S.mxHint=function(G){ const d=termDay('Y1S1',9,2); if(d==null||!inGrp(G,'noodle_team')||has(MX,'SAW_HIM_STUDY')) return; S.at(G,ZHE,d,23.5,L.mx.hint.map(t=>gm('noodle_team',ZHE,null,t)).map(x=>{ delete x.name; return x; }),'mx_b1_hint',{noContact:true}); };   /* 大一上第 9 週週二 23:30 麵店團 */
  /* 4-2 (a) 傘：大一下第 6～10 週、下雨的平日；必修課下課 15 分鐘內（霖澤館 201 的課：12:10、15:10 下課）；祐廷在霖澤館的穿堂。一次 */
  S.UMB={ id:'ev_mx_umbrella', title:'折疊傘', participants:[AN], noMeet:[AN], location:'campus', trigger:'auto', once:true, term:['Y1S2'], weeks:[6,7,8,9,10], weekday:[1,2,3,4,5], weather:'rain', background:'blur', near:{x:33,z:-110,r:7},
    prereq:{custom:G=>law(G)&&met(G,AN)&&has(MX,'FIRST_MET')&&S.afterL201(G,0.25)},
    dialogue:lns(L.mx.umb.open).concat([{choice:L.mx.umb.opts.map((t,k)=>({text:t,set:{MX_UMB:k===0?'TOLD':'SILENT',['MX_UMB_'+(k===0?'TOLD':'SILENT')]:true},goto:k===0?'u1':'u2'}))}],
      [{label:'u1'}],lns(L.mx.umb.r[0]),[{goto:'end'},{label:'u2'}],lns(L.mx.umb.r[1]),[{label:'end'}]) };
  /* 今天霖澤館 201 的必修剛下課（w 小時內）：那一堂上不上都算（以安、明軒都在霖澤館）*/
  S.afterL201=function(G,w){ if(typeof CLS==='undefined'||!CLS.dayItems) return false; const h=hr(G); return CLS.dayItems(G).some(it=>it.c&&it.c.kind==='required'&&!it.exam&&it.room&&it.room.zone==='classroom'&&h>=it.t1-0.02&&h<=it.t1+w); };
  /* (b) 咖啡：大二上第 8 週（期中考週），總圖三樓，以安在、祐廷走近。一次，沒有選項 */
  S.COFFEE={ id:'ev_mx_coffee', title:'熱咖啡', participants:[AN], noMeet:[AN], location:'library', trigger:'auto', once:true, term:['Y2S1'], weeks:[8], npcNear:AN, background:'blur',
    prereq:{custom:G=>law(G)&&met(G,AN)&&has(MX,'FIRST_MET')}, dialogue:lns(L.mx.coffee) };
  /* (c) 位子：大二下第 3～8 週，民法課上課前（債各週一、身分法週二），第一排。一次（他這學期那一次「你什麼都沒看到」）*/
  S.SEAT={ id:'ev_mx_seat', title:'第一排的位子', participants:[MX], location:'any', trigger:'class', once:true, background:'blur',
    beforeClass:it=>{ const G=curG(); return !!G&&law(G)&&!!it&&!!it.c&&!it.exam&&it.term==='Y2S2'&&it.week>=3&&it.week<=8&&(it.c.id==='oblig_spec'||it.c.id==='family_law')&&met(G,AN)&&has(MX,'FIRST_MET'); },
    dialogue:lns(L.mx.seat) };
  /* 4-3 德文（大三上第 12 週，校園，有點熟以上；一次）：「好。」＝這一週週四 21:00 總圖 B1 討論室（INV 的約，iv.ev）；第 13 週私訊 */
  S.GERMAN_ASK={ id:'ev_mx_german_ask', title:'德文口說', participants:[MX], location:'campus', trigger:'auto', once:true, term:['Y3S1'], weeks:[12], weekday:[1,2,3,4], near:{npc:MX,r:4}, background:'blur',
    prereq:{stage:{npc:MX,min:'FAMILIAR'},custom:G=>law(G)&&!(wdOf(G.day)===4&&hr(G)>=20)},
    dialogue:lns(L.mx.german.ask).concat([{choice:L.mx.german.opts.map((t,k)=>({text:t,set:{MX_GERMAN_ASK:k===0?'yes':'no'},goto:k===0?'g1':'g2'}))},{label:'g2'}],lns(L.mx.german.no),[{goto:'end'},{label:'g1'},{label:'end'}]),
    after:G=>{ if(G.flags.MX_GERMAN_ASK!=='yes'||typeof INV==='undefined'||!INV.accept) return; let thu=G.day; while(wdOf(thu)!==4) thu++; const iv=INV.accept(G,MX,'lib_b1',thu,21,{by:'npc'}); if(iv){ iv.ev='ev_mx_german'; G.flags.MX_GERMAN_IV=iv.id; } } };
  S.GERMAN={ id:'ev_mx_german', title:'古騰塔格', participants:[MX], location:'any', trigger:'meet', once:true, background:'blur', dialogue:lns(L.mx.german.scene).concat([{set:{MX_GERMAN:true}}]) };
  S.mxPhone=function(G){ const F=G.flags, M=t=>dm(MX,t);
    S.mxHint(G);
    { const d=termDay('Y3S1',13,3); if(d!=null&&F.MX_GERMAN_ASK&&dmOK(G,MX)) S.at(G,MX,d,21,(F.MX_GERMAN?L.mx.german.passed:L.mx.german.zhe).map(M),'mx_german_after'); }   /* 第 13 週（LAWWW 排週三 21:00）；答應了沒到＝他去找阿哲那一版 */
    { const d=termDay('Y4S1',10,3); if(d!=null&&dmOK(G,MX)){ const items=L.mx.bank.msg.map(M); items[items.length-1].ask=askOf('mx_bank',L.mx.bank.opts.map(([t,r])=>({t,say:[say1(MX,r)]}))); S.at(G,MX,d,22,items,'mx_bank'); } } };   /* 4-4 大四上第 10 週 22:00（LAWWW 排週三）*/

  /* ===================================================================== 5 Kevin ===================================================================== */
  /* 5-2 交棒：9/14 21:10 家族群組 Kevin 揪（回「去。」才演）→ 9/17（四）18:30 118 巷的定食店（2D）；沒去＝9/18 21:00 群組一句。宜蓁問考古題改成私訊祐廷（2027-03-08 21:00）*/
  S.HAND='2026-09-17';
  const KVg=t=>gm('family_law',KV,'Kevin',t), YZg=t=>gm('family_law',YZ,L.kv.junior,t), SISg=t=>gm('family_law',SIS,'溫學姊',t);
  S.kvPhone=function(G){ const F=G.flags, A=L.kv; if(!law(G)) return; const fam_=inGrp(G,'family_law');
    { const d=DK('2026-09-14'), h=DK(S.HAND); if(d!=null&&h!=null&&fam_&&!F.KV_HAND_ASKED&&G.day>=d-1&&G.day<=h){ if(PHONE.at(G,d,21+10/60,[KVg(A.invite)].map((x,i,a)=>i===a.length-1?Object.assign(x,{ask:askOf('kv_hand',[{t:A.go,hand:true}],{until:T(h,18)})}):x),'kv_hand_ask')) F.KV_HAND_ASKED=G.day; } }
    { const h=DK(S.HAND); if(h!=null&&fam_&&!F.KV_HANDOVER&&now(G)>=T(h+1,21)&&G.day<=h+2&&!sent(G,'kv_hand_missed')) PHONE.at(G,h+1,21,[KVg(A.missed)],'kv_hand_missed'); }   /* 沒去 */
    { const d=DK('2027-03-08'); if(d!=null&&fam_) S.at(G,YZ,d,21,[dm(YZ,A.yz.ask,{ask:askOf('kv_yz',[{t:A.yz.opt,say:[say1(YZ,A.yz.rep)]}])})],'kv_yz_ask',{noContact:true}); }   /* 去了、沒去都傳（宜蓁從家族群組拿到你的帳號）*/
    /* 5-3 國考（日期照考選部當年公告的月份；LAWWW 排：一試放榜 9 月、二試放榜 12 月）*/
    if(fam_){ S.at(G,KV,DK('2028-09-22'),21,A.bar1.map(KVg),'kv_bar1',{noContact:true});
      S.at(G,KV,DK('2028-12-15'),21,A.bar2.map(KVg).concat([SISg(A.bar2Sis),YZg(A.bar2Yz)]),'kv_bar2',{noContact:true});
      S.at(G,KV,DK('2029-12-14'),21,A.bar3.map(KVg),'kv_bar3',{noContact:true});
      S.at(G,KV,DK('2030-10-01'),21,A.firm.map(KVg),'kv_firm',{noContact:true}); }
    { const d=DK('2029-03-11'); if(d!=null&&S.barPath(G)&&fam_) S.at(G,KV,d,21,A.book.map(t=>dm(KV,t)),'kv_book',{noContact:true}); } };   /* 祐廷走國考的（大四下讀國考那一條）：2029-03 第 2 週週日 21:00 */
  S.barPath=G=>{ const F=G.flags||{}; return F.Y4_PATH==='bar'||F.Y4_PATH==='both'||!!F.BAR_REG; };
  S.onKv=function(G,m,o){ if(!m||!m.ask||m.ask.id!=='kv_hand'||!o||!o.hand) return; const h=DK(S.HAND); if(h==null) return; G.flags.KV_HAND_GO=true;
    plan(G,{id:'kv_hand',ev:'ev_kv_handover',day:h,h:18.5,late:0.5,place:'118 巷・定食店',title:'家族聚餐（118 巷的定食店 18:30）',travel:'走過去約 10 分鐘',travelH:1/6,hours:1.5,back:'家聚散了。'}); };
  S.HAND_EV={ id:'ev_kv_handover', title:'考古題的資料夾', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:1.5,
    dialogue:[{scene:'118 巷・定食店'}].concat(lns(L.kv.hand.open),[{choice:L.kv.hand.opts.map((t,k)=>({text:t,goto:'h'+(k+1)}))}],
      ...L.kv.hand.r.map((R,k)=>[{label:'h'+(k+1)}].concat(R.map(t=>ln('kv',t)),[{goto:'end'}])),[{label:'end'},{set:{KV_HANDOVER:true}}]) };

  /* ===================================================================== 房間物品、尾聲、讀檔 ===================================================================== */
  S.room=function(G,Lst){ const F=G.flags||{}, P=L.xc.pick.room;
    if(F.XC_NOTE_PICK==='civ') Lst.push(P[0]); if(F.XC_NOTE_PICK==='crimpro') Lst.push(P[1]);
    if(sent(G,'kv_book')&&(G.msgs||[]).some(m=>m&&m.tag==='kv_book')) Lst.push(L.kv.bookRoom); };
  /* 尾聲（2034）：宥辰「五年後」那一句（BB_70 7b；YC_GIG 多一句）、Alison 法圖（YU_Y4_LIB，接在「一個人吃滷肉飯」後面）——postgrad3d.js S.epiLine 叫 */
  S.epiYc=G=>[[YC,L.yc.gig.epi]].concat(G.flags&&G.flags.YC_GIG?[[YC,L.yc.gig.epiGig]]:[]);
  S.epiYuLib=G=>G&&G.flags&&G.flags.YU_Y4_LIB?[[YU,L.yu.lib.epi]]:[];
  /* 讀檔：家族的學妹統一叫宜蓁（舊存檔存下的「家族的學妹」「學妹」帳號名稱換字；同 Alison 改名的做法）*/
  S.migrate=function(s){ if(!s||typeof s!=='object') return 0; let n=0; const fx=m=>{ if(m&&typeof m==='object'&&m.from===YZ&&m.name!==L.kv.junior){ m.name=L.kv.junior; n++; } };
    if(Array.isArray(s.msgs)) s.msgs.forEach(fx); const P=s.phone; if(P&&typeof P==='object'&&Array.isArray(P.q)) for(const q of P.q){ fx(q); if(q&&Array.isArray(q.items)) q.items.forEach(fx); }
    return n; };

  /* ===================================================================== 每一輪 ===================================================================== */
  S.phone=function(G){ if(!law(G)||typeof PHONE==='undefined'||typeof CALENDAR==='undefined') return;
    for(const f of [S.songs,S.elevPhone,S.gigPhone,S.failPhone,S.dealPhone,S.secondPhone,S.dadPhone,S.firstMissPhone,S.askPhone,S.yuPhone,S.mxPhone,S.kvPhone]){ try{ f(G); }catch(e){ console.warn('SUP497.phone',f&&f.name,e); } } };
  S.onAnswer=function(G,m,o,k){ for(const f of [S.onSong,S.onWake,S.onFix,S.onKv]){ try{ f(G,m,o,k); }catch(e){ console.warn('SUP497.onAnswer',e); } } };

  /* ---------- 接線（載入時一次）---------- */
  S.wire=function(){
    if(typeof PORTRAIT_ONLY!=='undefined'){ if(!PORTRAIT_ONLY[KV]) PORTRAIT_ONLY[KV]={id:KV,name:'Kevin',alias:[],gender:'m'}; if(!PORTRAIT_ONLY[YZ]) PORTRAIT_ONLY[YZ]={id:YZ,name:L.kv.junior,alias:[],gender:'f'}; }   /* 手機的對話串名字（不在 CHARACTERS；同 sideq3d.js 的一一八茶飲）；沒有 alias：家裡的姊姊也叫宜蓁，不能把 speaker '宜蓁' 對到學妹 */
    /* 1-1 personality「在錄音室待過一年」、3-7 Alison 法圖二樓、4-1 明軒 B1 自習室、第 6 節陳助教：寫在 src/data/characters.js */
    if(typeof INVITE_DATA!=='undefined'&&Array.isArray(INVITE_DATA.places)&&!INVITE_DATA.places.some(p=>p.id==='lib_b1'))
      INVITE_DATA.places.push({id:'lib_b1',zone:'library_b1',name:'總圖 B1 討論室',verb:'去總圖 B1 討論室',kind:'reason',minStage:'FAMILIAR',stay:1,memory:'STUDIED_TOGETHER',sitAct:'read',show:()=>false});   /* 她（他）約的 B1 討論室（2-7、4-3）：自己約的清單不列 */
    if(typeof STORY_EVENTS!=='undefined'){ const second=S.buildSecond(), day=S.buildDay(), m1=S.buildM1B1();
      for(const e of [S.MEET_AFTER,S.ELEV_ASK,S.ELEV_DONE,S.GIG_EV,S.DEAL,S.NOD,S.DAY1,S.COPY,second,day,S.DAD,S.GROUP,S.YU_MEET,S.BKF,S.LIB,m1,S.UMB,S.COFFEE,S.SEAT,S.GERMAN_ASK,S.GERMAN,S.HAND_EV]) if(e&&!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e);
      S.SECOND_B1=second; }
    S.register();
    if(typeof PHONE!=='undefined'&&Array.isArray(PHONE.ON_ANSWER)&&!PHONE.ON_ANSWER._sup497){ PHONE.ON_ANSWER.push((G,m,o,k)=>S.onAnswer(G,m,o,k)); PHONE.ON_ANSWER._sup497=true; }
    if(typeof STORY!=='undefined'){ if(Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G)); if(Array.isArray(STORY.ROOM_EXTRA)) STORY.ROOM_EXTRA.push((G,Lst)=>S.room(G,Lst));
      if(STORY.SMALL_AFTER){ STORY.SMALL_AFTER[YC]=L.yc.after; STORY.SMALL_AFTER[XC]=L.xc.after; STORY.SMALL_AFTER[MX]=L.mx.after; } }
    if(typeof CLS!=='undefined'&&Array.isArray(CLS.IN_CLASS)){ const f=(GM,it)=>S.meetIn(GM,it); f.due=(G,it)=>S.ycMeetDue(G,it); f.sup497=true; CLS.IN_CLASS.push(f); } };
  S.wire();
  return S;
})();
