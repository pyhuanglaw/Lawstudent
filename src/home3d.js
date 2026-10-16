/* ===== 週末回臺北的家（AA_134 第 3 節、AA_137 第 6 節定案；家人台詞池 AA_138 → src/data/home_lines.js）=====
   使用者 2026-10-15：「祐廷是臺北人……假日也可以回家」。週五 17:00 以後到週日，從宿舍房間「回臺北的家」。
   第一版家裡是 2D 背景（OUT.BG.home_living，圖還沒有＝深色底＋地點字幕）＋對話：到家一句 → 晚餐（18:30～20:00：媽媽問、玩家二選一、爸爸收尾；
   每月第一個週末姊姊宜蓁也在，多一句）→ 睡覺（隔天早上在家醒來、早上一句）→ 取車（爸爸一句；G.flags.carWithMe）→ 回宿舍（媽媽一句）。
   週日 21:30 以後提醒該回宿舍（隔天有課）。在家的時候宿舍、校園的事件不會發生（不懲罰，之後照常）；手機照常收訊息。不加、不扣任何人的好感。
   家人群組（g:home）：週四 20:00 媽媽一句＋「會回去／這週不回」；兩小時沒回，爸爸傳「？」。
   存檔 G.home＝{at:true|false, day, eat:{day}, used:{池:[最近用過的序號]}, ate:{序號:第幾天}}（舊存檔沒有＝不在家）。
   測試：node tests/home_unit.js */
'use strict';
const HOME=(function(){
  const S={};
  const L=()=>typeof HOME_LINES!=='undefined'?HOME_LINES:null;
  S.rec=G=>{ if(!G.home||typeof G.home!=='object') G.home={at:false}; const H=G.home; if(!H.used||typeof H.used!=='object') H.used={}; if(!H.ate||typeof H.ate!=='object') H.ate={}; return H; };
  /* 回得了家的時間：週五 17:00 以後、週六、週日 21:30 以前 */
  /* 經濟系大一下休學以後（AA_154 1-3b；A3 3/29 搬出宿舍）：住在臺北的家，每天從家裡出發（H.base）。法律系的存檔不受影響 */
  S.baseMode=G=>(G.stage||'law')==='econ'&&!!(G.flags&&G.flags.Y0_MOVED_OUT);
  S.canGo=G=>{ if(S.baseMode(G)) return true; const h=G.hour; if(typeof CALENDAR!=='undefined'&&CALENDAR.typhoon&&CALENDAR.typhoon(G.day)) return false;   /* 颱風假不能回家（AA_160 3-4 D）*/ return (G.weekday===5&&h>=17)||G.weekday===6||(G.weekday===0&&h<21.5); };
  S.at=G=>!!(G.home&&G.home.at);
  const MOM={name:'媽媽'}, DAD={name:'爸爸'}, SIS={name:'宜蓁'};
  /* 池裡挑一句：不連續重複（最近用過的 2 句不選）*/
  S.pick=function(G,pool,key){ const P=(L()||{})[pool]||[]; if(!P.length) return null; const H=S.rec(G), u=H.used[key||pool]||(H.used[key||pool]=[]);
    const ok=P.map((x,i)=>i).filter(i=>!u.slice(-2).includes(i)); const i=(ok.length?ok:P.map((x,i)=>i))[(G.day*3+u.length)%(ok.length||P.length)]; u.push(i); if(u.length>6) u.shift(); return P[i]; };
  const who=(x,dflt)=>x&&x.who==='爸爸'?DAD:(x&&x.who==='媽媽'?MOM:dflt);
  const say=async(GM,x,dflt)=>{ if(!x) return; const w=who(x,dflt); if(/^（.*）$/.test(x.t)) await GM.say(null,x.t.replace(/^（/,'（'+w.name)); else await GM.say(w,x.t); };
  const bg=()=>{ if(typeof OUT==='undefined') return 'dark'; const G=typeof GAME!=='undefined'&&GAME.G, hh=G?((G.hour%24)+24)%24:18; return OUT.bg(hh>=7&&hh<17?'home_living_day':'home_living'); };   /* 白天（7～17 點）用白天版（LAWWW2-B 2a0a7ff4），其他時間平常版（晚餐）*/
  const hm=h=>{ h=((h%24)+24)%24; const m=Math.round(h*60); return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0'); };
  const phoneTick=GM=>{ const G=GM.G; if(typeof PHONE==='undefined') return; try{ if(typeof STORY!=='undefined'&&STORY.phoneRules) STORY.phoneRules(GM); PHONE.tick(G,out=>{ if(out.length&&GM.toast) GM.toast('手機｜'+PHONE.notice(G,out[0]),3800); if(GM.phoneBadge) GM.phoneBadge(); }); }catch(e){ console.warn('HOME phone',e); } };
  const firstWeekend=G=>{ if(typeof CALENDAR==='undefined') return false; const d=CALENDAR.dateOf(G.day); return d&&d.d<=7; };   /* 每月第一個週末（日期 1～7 號）姊姊在家 */
  /* 晚餐：媽媽問（四週內同一句不重複；第 4 句的第一個選項要 KAI_ROOM_RULES；第 8 句只在第 8～10 週）→ 玩家二選一 → 爸爸收尾 */
  S.dinnerPick=function(G){ const D=(L()||{}).dinner||[], H=S.rec(G), T=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null;
    const sisHome=firstWeekend(G), okSis=d=>!(sisHome&&/你姊說/.test(d.mom||''));   /* AA_140 G49：「你姊說她下個月回來。」姊姊在家的週末不問 */
    const ok=D.filter(d=>(!d.weeks||(T&&T.week>=d.weeks[0]&&T.week<=d.weeks[1]))&&okSis(d)&&!(H.ate[d.n]!=null&&G.day-H.ate[d.n]<28));
    const pool=ok.length?ok:D.filter(d=>(!d.weeks||(T&&T.week>=d.weeks[0]&&T.week<=d.weeks[1]))&&okSis(d)); if(!pool.length) return null; return pool[(G.day+Object.keys(H.ate).length)%pool.length]; };
  S.dinner=async function(GM){ const G=GM.G, H=S.rec(G), d=S.dinnerPick(G); if(!d) return; H.eat={day:G.day}; H.ate[d.n]=G.day;
    await GM.say(null,'（晚餐。'+(firstWeekend(G)?'爸爸、媽媽，姊姊也回來了。':'爸爸、媽媽都在。')+'）'); await GM.say(MOM,d.mom);
    const opts=d.opts.filter(o=>!o.ifMem||(typeof SOCIAL!=='undefined'&&SOCIAL.has(o.ifMem[0],o.ifMem[1]))); await GM.choose(opts.map(o=>({t:'「'+o.t+'」'})));
    if(/^（.*）$/.test(d.dad)) await GM.say(null,d.dad.replace(/^（/,'（爸爸')); else await GM.say(DAD,d.dad); if(d.dadAct) await GM.say(null,'（爸爸'+d.dadAct.replace(/給他$/,'給你')+'）');
    if(firstWeekend(G)){ const s=S.pick(G,'sisDinner'); if(s) await GM.say(SIS,s.t); }
    GM.advance(1); };
  /* 在家睡覺：隔天早上在家醒來（08:30）；早上一句 */
  S.sleep=async function(GM,wakeH){ const G=GM.G, E=GM.E; await GM.fade(true); if(G.hour>=25) (G.daily||(G.daily={})).lateNight=G.day+1;   /* 01:00 以後才睡（明軒那句，AA-B 10-16）*/ G.day++; G.weekday=(G.weekday+1)%7; G.energy=100; G.hour=wakeH!=null?wakeH:8.5;   /* wakeH：隔天有學校的固定行程時提早醒（DL-05，AA_160 1-6）*/ if(E) E.hour=G.hour; G.flags.companion=null;
    if(typeof CALENDAR!=='undefined'&&CALENDAR.typhoon&&CALENDAR.typhoon(G.day)) G.weather='rain'; else G.weather=Math.random()<0.7?'clear':'cloudy'; if(E&&E.setWeather) E.setWeather(G.weather);
    if(GM.updateHUD) GM.updateHUD(); if(GM.titleCard) await GM.titleCard(typeof STORY!=='undefined'&&STORY.dayTitle?STORY.dayTitle(G):'第 '+G.day+' 天',['週日','週一','週二','週三','週四','週五','週六'][G.weekday]+' '+hm(G.hour)+'・臺北的家',2200); await GM.fade(false);
    if(typeof STORY!=='undefined'&&STORY.monthlyFunds){ const f=STORY.monthlyFunds(G); if(f){ GM.money(f.amount); if(GM.toast) GM.toast(f.text,3800); } }
    const m=S.pick(G,'morning'); await say(GM,m,MOM); S.rec(G).wakeAsk=G.day; if(GM.autosave) GM.autosave(); };   /* wakeAsk：在家醒來的起床選單（S.loop 下一輪）*/
  /* 從家裡出發（DL-05，AA_160 1-6）：捷運＋公車約 40 分鐘（腳踏車在宿舍）；學校的固定行程（課、約在學校的見面）開始前 50 分鐘醒，最早 06:30 */
  S.MRT_MIN=40;
  S.schoolStart=function(G,day){ const out=[]; if(typeof CLS!=='undefined'&&CLS.dayItems){ for(const it of CLS.dayItems(Object.assign({},G,{day}),day)) if(!(CLS.storyClass&&CLS.storyClass(G,it))) out.push(it.t0); }
    for(const iv of (G.invites||[])) if(iv.day===day&&(iv.state==='accepted'||iv.accepted)&&!iv.done) out.push(iv.h); return out.length?Math.min(...out):null; };
  S.wakeFor=(G,day,lead)=>{ const s=S.schoolStart(G,day); return s==null?null:Math.max(6.5,s-lead); };
  /* 在家醒來的起床選單（1-6、1-2）：直接去上課（捷運＋公車）／今天不去／先在家；期末考只有直接去考場／先在家 */
  S.homeWake=async function(GM){ const G=GM.G, H=S.rec(G); H.wakeAsk=null; if(typeof CLS==='undefined'||!CLS.goList||(GM.S&&GM.S.wakeMenu===false)) return false; const list=CLS.goList(G).filter(it=>!CLS.planSkip(G,it)); if(!list.length) return false;
    const it=list[0], exam=it.exam==='final', inner=!!(it.room&&(it.room.zone==='classroom'||it.room.room)), mins=S.MRT_MIN+(inner?3:0), depart=it.t0-1/6-mins/60, arr=Math.max(G.hour,depart)+mins/60, late=Math.round((arr-it.t0)*60);
    const hint='捷運＋公車約 40 分鐘，'+(late<=0?hm(arr)+' 到教室':(late<=15?'現在出門會遲到 '+late+' 分鐘':'會遲到 '+late+' 分鐘，進去會記缺席'));
    await GM.say(null,'早安。今天的課：'+list.slice(0,3).map(q=>hm(q.t0)+'　'+q.c.name+'　'+(q.room.name||'')).join('　／　'));
    const opts=exam?[{t:'直接去考場：'+it.c.name,hint},{t:'先在家',hint:'考試前記得出門'}]:[{t:'直接去上課：'+it.c.name,hint},{t:'今天不去',hint:'記沒去，不扣分。這堂課裡的事你會錯過。'},{t:'先在家',hint:'手機的「今天」隨時可以直接去'}]; const k=await GM.choose(opts);
    if(k===0){ if(G.hour<depart-0.02){ if(!(await confirmMiss(GM,depart))) return false; GM.advance(depart-G.hour); } await say(GM,S.pick(G,'back'),MOM); H.at=false; if(typeof ADV!=='undefined'&&ADV.end) ADV.end(); await CLS.goClass(GM,it,{fromHome:true,mins}); return true; }
    if(!exam&&k===1) CLS.rec(G).note['plan_skip_'+it.key]=1; return false; };
  S.takeCar=async function(GM){ const G=GM.G; G.flags.carWithMe=true; const c=S.pick(G,'car'); await say(GM,c,DAD); };   /* 取車（AA_128 S4：從家裡出發的約會不用再加取車的時間）*/
  /* 在家也要赴約（AA_140 G48，AA-B 2026-10-16；AA_134 第 3 節）：原本人在家時 INV.tick、OUT.tick 不跑，排定的約（例：4/24 可昕 18:45）直接錯過、還被當成爽約。
     出遊（OUT）到了該出發的時間，選單最上面多「出發」——從家裡出發（車在家裡，不加取車時間）；當面約（INV）約定前 1 小時起多「出發」——回到約好的地方。
     會跳過約定時間的選項（睡覺、休息、等晚餐）先問一次「照樣／先不要」。在家錯過當面約＝延後、不扣分（不記 MISSED_DINNER）*/
  const T=(day,h)=>day*24+h;
  S.dueOuting=G=>typeof OUT!=='undefined'&&OUT.due?OUT.due(G):null;
  S.dueInvites=G=>{ if(typeof INV==='undefined'||!Array.isArray(G.invites)) return []; const h=G.hour%24; return G.invites.filter(iv=>iv.state==='accepted'&&iv.day===G.day&&h>=iv.h-1&&h<iv.h+(INV.WAIT_H||0.5)); };
  /* 這個動作做完會到 toH（今天的小時，可以超過 24）：會錯過的約（出遊：約好的時間後 45 分鐘；當面約：約好的時間＋等待）*/
  S.wouldMiss=function(G,toH){ const now=T(G.day,G.hour), to=T(G.day,toH), out=[];
    if(typeof OUT!=='undefined') for(const q of OUT.rec(G)) if(q.state==='planned'&&T(q.day,q.h)+0.75>now&&T(q.day,q.h)+0.75<=to) out.push(hm(q.h)+' '+q.title);
    if(typeof INV!=='undefined'&&Array.isArray(G.invites)) for(const iv of G.invites) if(iv.state==='accepted'&&T(iv.day,iv.h)+(INV.WAIT_H||0.5)>now&&T(iv.day,iv.h)+(INV.WAIT_H||0.5)<=to){ const P=INV.place(iv.place)||{}; out.push(hm(iv.h)+' 和'+(typeof SOCIAL!=='undefined'?SOCIAL.displayName(iv.who):iv.who)+'約在'+(P.name||'')); }
    return out; };
  /* 在家的時候過了時間的當面約：延後、不扣分（INV.tick 回宿舍以後才跑，原本會記成沒赴約）*/
  S.postponeMissed=function(G){ if(typeof INV==='undefined'||!Array.isArray(G.invites)) return; const now=T(G.day,G.hour);
    for(const iv of G.invites) if(iv.state==='accepted'&&now>=T(iv.day,iv.h)+(INV.WAIT_H||0.5)){ iv.state='postponed'; const P=INV.place(iv.place)||{}; if(INV.msg) INV.msg(G,iv.who,'在臺北的家，和'+(typeof SOCIAL!=='undefined'?SOCIAL.displayName(iv.who):iv.who)+'約在'+(P.name||'')+'的事延後了（不算沒赴約）。',iv); } };
  const confirmMiss=async(GM,toH)=>{ const M=S.wouldMiss(GM.G,toH); if(!M.length) return true; await GM.say(null,'會錯過：'+M.join('、')+'。'); return (await GM.choose([{t:'照樣'},{t:'先不要'}]))===0; };
  /* 在家：選單一直到回宿舍 */
  let busy=false;
  /* 經濟系大一的寒假（AA_154 A16；2025-01-06～02-16）：在臺北的家，只演 F1（1/27 21:00 手機）、E21（1/28 22:00）、E24 那一晚（手機）、E23（2/16 18:00）；其他跳過。
     H.winter＝寒假模式：1/6 06:00 以後第一次能動的時候轉場（字卡「寒假／臺北的家」）；選單只有吃晚餐、「過幾天」（直接跳到下一個固定點，字卡寫日期）、睡覺（會經過固定點就停在固定點）；
     沒有「回宿舍」。trigger:'home' 的事件（E21、E23）在選單每一輪檢查、到了就演；E23 演完記 Y0_WINTER_DONE，選單接著 S.winterEnd 回宿舍（吃過晚飯 20:00 出門，約 20:40 到宿舍）。E24 那一晚的日期暫定（等 AA-B）*/
  const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  S.WINTER_PTS=()=>[['2025-01-27',21],['2025-01-28',22],['2025-02-08',23],['2025-02-16',18]].map(p=>[DK(p[0]),p[1]]).filter(p=>p[0]!=null);
  S.winterStartDue=G=>{ if((G.stage||'law')!=='econ'||!G.flags||G.flags.Y0_WINTER_START) return false; const a=DK('2025-01-06'), b=DK('2025-02-16'); return a!=null&&b!=null&&(G.day>a||(G.day===a&&G.hour>=6))&&G.day<=b; };
  S.winterNext=G=>{ const now=T(G.day,G.hour); for(const p of S.WINTER_PTS()){ const t=T(p[0],p[1]); if(t>now+1e-6) return t; } return null; };
  const wdOf=d=>{ const w=typeof CALENDAR!=='undefined'?CALENDAR.dateOf(d).wd:((d%7)+7)%7; return w===7?0:w; };
  const dateLabel=t=>{ const d=Math.floor(t/24); if(typeof CALENDAR==='undefined') return hm(t-d*24); const D=CALENDAR.dateOf(d); return D.m+'/'+D.d+'（'+['日','一','二','三','四','五','六'][wdOf(d)]+'）'+hm(t-d*24); };
  S.homeEvent=G=>{ if(typeof STORY_EVENTS==='undefined'||typeof EVENTS==='undefined') return null; return STORY_EVENTS.find(e=>e.trigger==='home'&&EVENTS.check(e))||null; };
  /* 跳到某個時間（寒假的「過幾天」）：中間的日子不演；換日照 S.sleep 的做法（天氣、每月零用錢），字卡寫日期 */
  /* 跳過的時候字卡後面的一句（AA_154 A44）：照跳到哪一個固定點（第一次跳＝寒假剛開始）*/
  S.WINTER_SKIP_LINE=t=>{ const P=S.WINTER_PTS().map(p=>T(p[0],p[1])); const k=P.findIndex(x=>Math.abs(x-t)<1e-6);
    return k===0?'年前的家裡，一直有人在打掃。':(k===2?'過年的幾天，親戚來來去去。每個人都問你經濟系好不好玩。':(k===3?'寒假的最後一週，你把房間的書架整理了一遍。':null)); };
  S.jumpTo=async function(GM,t){ const G=GM.G, E=GM.E; await GM.fade(true); const d=Math.floor(t/24); if(d>G.day){ G.day=d; G.weekday=wdOf(d); G.energy=100; G.flags.companion=null; G.weather=Math.random()<0.7?'clear':'cloudy'; if(E&&E.setWeather) E.setWeather(G.weather); }
    G.hour=t-d*24; if(E) E.hour=G.hour; if(GM.updateHUD) GM.updateHUD(); if(GM.titleCard) await GM.titleCard(dateLabel(t),'臺北的家',2200); await GM.fade(false);
    if(typeof STORY!=='undefined'&&STORY.monthlyFunds){ const f=STORY.monthlyFunds(G); if(f){ GM.money(f.amount); if(GM.toast) GM.toast(f.text,3800); } } if(GM.autosave) GM.autosave(); };
  S.winterStart=async function(GM){ const G=GM.G, H=S.rec(G); if(busy||S.at(G)) return; G.flags.Y0_WINTER_START=true; GM.sceneBegin();
    try{ await GM.fade(true); if(GM.titleCard) await GM.titleCard('寒假','臺北的家',2400); H.at=true; H.winter=true; H.day=G.day; if(typeof ADV!=='undefined') ADV.begin({background:bg()}); await GM.fade(false); if(GM.autosave) GM.autosave(); }
    finally{ GM.sceneEnd(); }
    await S.loop(GM); };
  S.winterEnd=async function(GM){ const G=GM.G, H=S.rec(G); G.flags.Y0_WINTER_DONE=true; H.winter=false; if(G.hour<20) GM.advance(20-G.hour); await GM.fade(true); if(GM.titleCard) await GM.titleCard('回宿舍','捷運＋公車 約 40 分鐘',2000); GM.advance(0.7); H.at=false; if(typeof ADV!=='undefined'&&ADV.end) ADV.end();
    if(GM.enter) await GM.enter('dorm',{x:0,z:2.4,yaw:Math.PI}); await GM.fade(false); if(GM.autosave) GM.autosave(); };
  /* 休學以後住在家裡（AA_154 1-3b）：選單＝去學校（捷運＋公車約 30 分鐘，到校門）／在家讀書（兩小時；重考的讀書照樣算 habit retake:study）／吃晚餐／睡覺；
     出遊、約好的見面照常從家裡出發。沒有「回宿舍」（412 已經是阿勳一個人的）。起床的讀書日／玩樂日選單（A39）之後接 */
  S.toSchool=async function(GM){ const G=GM.G, H=S.rec(G); await GM.fade(true); if(GM.titleCard) await GM.titleCard('臺大','捷運＋公車 約 30 分鐘',2000); GM.advance(0.5); H.at=false; if(typeof ADV!=='undefined'&&ADV.end) ADV.end();
    if(GM.enter) await GM.enter('campus',{x:-117,z:0.5,yaw:Math.PI/2}); await GM.fade(false); };
  S.moveOut=async function(GM){ const G=GM.G, H=S.rec(G); G.flags.Y0_MOVED_OUT=true; G.flags.Y0_STICKY_HOME=!!G.flags.Y0_STICKY; GM.sceneBegin();
    try{ await GM.fade(true); if(GM.titleCard) await GM.titleCard('搬回臺北的家','捷運＋公車 約 30 分鐘',2400); GM.advance(Math.max(0.5,18-G.hour)); H.at=true; H.base=true; H.day=G.day; if(typeof ADV!=='undefined') ADV.begin({background:bg()}); await GM.fade(false);
      if(G.flags.Y0_STICKY) await GM.say(null,'回到臺北的家拆箱時，檯燈上那張便利貼還在：「保齡球欠我一場。」'); if(GM.autosave) GM.autosave(); }
    finally{ GM.sceneEnd(); }
    await S.loop(GM); };
  async function baseRound(GM){ const G=GM.G, H=S.rec(G); const ev=S.homeEvent(G); if(ev){ await EVENTS.run(ev); if(H.at&&typeof ADV!=='undefined') ADV.begin({background:bg()}); return H.at; }
    if(H.wakeAsk===G.day) H.wakeAsk=null;
    const h=G.hour, ateToday=H.eat&&H.eat.day===G.day, O=[], q=S.dueOuting(G);
    if(q) O.push({t:(q.verb||'出發')+'：'+q.title,hint:'從家裡出發　'+(q.place||'')+'　'+hm(q.h)+(q.travel?'　'+q.travel:''),k:'out',q});
    for(const iv of S.dueInvites(G)){ const P=INV.place(iv.place)||{}; O.push({t:'出發：和'+(typeof SOCIAL!=='undefined'?SOCIAL.displayName(iv.who):iv.who)+'約在'+(P.name||''),hint:hm(iv.h)+'　捷運＋公車 約 30 分鐘',k:'inv',iv,P}); }
    if(h<22) O.push({t:'去學校',hint:'捷運＋公車 約 30 分鐘',k:'school'});
    O.push({t:'在家讀書',hint:'兩小時',k:'study'});
    if(!ateToday&&h>=18.5&&h<20) O.push({t:'吃晚餐',k:'eat'});
    O.push({t:'睡覺',hint:'隔天早上在家醒來',k:'sleep'});
    const o=O[await GM.choose(O)]||O[O.length-1];
    if(o.k==='out'){ H.at=false; if(typeof ADV!=='undefined'&&ADV.end) ADV.end(); await OUT.go(GM,o.q); return false; }
    if(o.k==='inv'){ await S.leaveTo(GM,o.P); return false; }
    if(o.k==='school'){ await S.toSchool(GM); return false; }
    if(o.k==='study'){ if(await confirmMiss(GM,G.hour+2)){ GM.advance(2); const a=DK('2025-03-28'), b=DK('2025-07-10'); if(a!=null&&b!=null&&G.day>=a&&G.day<=b&&typeof EVENTS!=='undefined'&&EVENTS.habit) EVENTS.habit('retake:study'); } return H.at; }
    if(o.k==='eat'){ await S.dinner(GM); return H.at; }
    if(await confirmMiss(GM,24+8.5)){ await S.sleep(GM); S.rec(G).wakeAsk=null; } return H.at; }
  async function winterRound(GM){ const G=GM.G, H=S.rec(G); const ev=S.homeEvent(G); if(ev){ await EVENTS.run(ev); if(G.flags.Y0_WINTER_DONE){ await S.winterEnd(GM); return false; } if(H.at&&typeof ADV!=='undefined') ADV.begin({background:bg()}); return H.at; }
    const h=G.hour, ateToday=H.eat&&H.eat.day===G.day, nx=S.winterNext(G), O=[];
    if(!ateToday&&h>=18.5&&h<20) O.push({t:'吃晚餐',k:'eat'});
    if(nx!=null) O.push({t:'過幾天',hint:'跳到 '+dateLabel(nx),k:'skip'});
    O.push({t:'睡覺',hint:'隔天早上在家醒來',k:'sleep'});
    const o=O[await GM.choose(O)]||O[O.length-1];
    if(o.k==='eat') await S.dinner(GM); else if(o.k==='skip'){ const first=!H.skipped; H.skipped=true; await S.jumpTo(GM,nx); const l=first?'寒假。你睡到中午，下午幫媽媽跑腿。':S.WINTER_SKIP_LINE(nx); if(l) await GM.say(null,l); if(first&&S.WINTER_SKIP_LINE(nx)) await GM.say(null,S.WINTER_SKIP_LINE(nx)); }
    else { const wake=T(G.day+1,8.5); if(nx!=null&&nx<wake) await S.jumpTo(GM,nx); else await S.sleep(GM); S.rec(G).wakeAsk=null; }   /* 睡覺會經過固定點（E21 22:00 等）：停在那個時間 */
    return H.at; }
  S.loop=async function(GM){ const G=GM.G, H=S.rec(G); if(busy) return; busy=true; GM.sceneBegin();
    try{ if(typeof ADV!=='undefined') ADV.begin({background:bg()});
      for(let guard=0;guard<60&&H.at;guard++){ phoneTick(GM); S.postponeMissed(G); if(H.winter){ if(!(await winterRound(GM))) break; continue; } if(H.base&&S.baseMode(G)){ if(!(await baseRound(GM))) break; continue; } if(H.wakeAsk===G.day){ if(await S.homeWake(GM)) break; continue; } const h=G.hour, late=G.weekday===0&&h>=21.5, ateToday=H.eat&&H.eat.day===G.day;
        const sun=G.weekday===0, wk=S.wakeFor(G,G.day+1,sun?1.5:50/60), monExam=sun&&typeof CLS!=='undefined'&&CLS.dayItems&&CLS.dayItems(Object.assign({},G,{day:G.day+1}),G.day+1).some((q,i)=>i===0&&q.exam==='final');
        if(late){ await GM.say(MOM,'明天有課吧。早點回去。'); if(!monExam&&(await GM.choose([{t:'回宿舍',hint:'捷運＋公車 約 40 分鐘'},{t:'今晚住家裡，明天一早直接去學校',hint:'明天 '+hm(wk!=null?wk:8.5)+' 在家醒來'}]))===1){ H.stayMon=G.day+1; await S.sleep(GM,wk); continue; } await S.back(GM); break; }   /* 週日 21:30 以後：該回宿舍了（DL-05：也可以住家裡，週一直接去學校；週一早上期末考就不行）*/
        const O=[], q=S.dueOuting(G);
        if(q) O.push({t:(q.verb||'出發')+'：'+q.title,hint:'從家裡出發　'+(q.place||'')+'　'+hm(q.h)+(q.travel?'　'+q.travel:''),k:'out',q});   /* G48：出遊從家裡出發（不加取車時間）*/
        for(const iv of S.dueInvites(G)){ const P=INV.place(iv.place)||{}; O.push({t:'出發：和'+(typeof SOCIAL!=='undefined'?SOCIAL.displayName(iv.who):iv.who)+'約在'+(P.name||''),hint:hm(iv.h)+'　捷運＋公車 約 40 分鐘',k:'inv',iv,P}); }
        if(!ateToday&&h>=18.5&&h<20) O.push({t:'吃晚餐',k:'eat'}); else if(!ateToday&&h>=16&&h<18.5) O.push({t:'等吃晚餐',hint:'到 18:30',k:'wait'});
        O.push({t:'睡覺',hint:sun?'明天有課：先回宿舍再睡':(wk!=null?'明天 '+hm(wk)+' 在家醒來（學校有事）':'隔天早上在家醒來'),k:'sleep'});
        if(sun) O.push({t:'今晚住家裡，明天一早直接去學校',hint:monExam?'明天早上期末考，回宿舍睡吧':'明天 '+hm(wk!=null?wk:8.5)+' 在家醒來，坐捷運＋公車約 40 分鐘',dim:monExam,k:'stay'});   /* DL-05（AA_160 1-6）：週日晚上可以住家裡 */ if(!G.flags.carWithMe) O.push({t:'去玄關拿車鑰匙（取車）',k:'car'}); O.push({t:'在家休息一下',hint:'一小時',k:'rest'}); O.push({t:'回宿舍',hint:'捷運＋公車 約 40 分鐘',k:'back'});
        const o=O[await GM.choose(O)]||O[O.length-1];
        if(o.k==='out'){ H.at=false; if(typeof ADV!=='undefined'&&ADV.end) ADV.end(); await OUT.go(GM,o.q); break; }
        else if(o.k==='inv'){ await S.leaveTo(GM,o.P); break; }
        else if(o.k==='eat') await S.dinner(GM); else if(o.k==='wait'){ if(await confirmMiss(GM,18.5)) GM.advance(Math.max(0,18.5-G.hour)); }
        else if(o.k==='sleep'){ if(sun){ await S.back(GM); await S.sleepAtDorm(GM); break; } if(await confirmMiss(GM,24+(wk!=null?wk:8.5))) await S.sleep(GM,wk); }
        else if(o.k==='stay'){ if(o.dim){ if(GM.toast) GM.toast(o.hint,3000); } else if(await confirmMiss(GM,24+(wk!=null?wk:8.5))){ H.stayMon=G.day+1; await S.sleep(GM,wk); } }   /* 宿舍那一晚的夜間事件照「人不在宿舍」不演（和出遊過夜一樣）*/   /* G48：週日晚上在家睡覺＝先回宿舍（不在家睡到週一）*/
        else if(o.k==='car') await S.takeCar(GM);
        else if(o.k==='rest'){ if(await confirmMiss(GM,G.hour+1)){ GM.advance(1); } } else { await S.back(GM); break; } } }
    finally{ busy=false; GM.sceneEnd(); } };
  /* 回家：轉場 → 到家（媽媽一句）→ 選單 */
  S.go=async function(GM){ const G=GM.G; if(!S.canGo(G)||S.at(G)) return false; const H=S.rec(G); GM.sceneBegin();
    try{ const base=S.baseMode(G); await GM.fade(true); if(GM.titleCard) await GM.titleCard('回臺北的家',base?'捷運＋公車 約 30 分鐘':'捷運＋公車 約 40 分鐘',2400); GM.advance(base?0.5:0.7); H.at=true; H.day=G.day; if(base) H.base=true;
      if(typeof ADV!=='undefined') ADV.begin({background:bg()}); await GM.fade(false); await GM.say(null,'（臺北的家。'+hm(G.hour)+'。）'); await say(GM,S.pick(G,'arrive'),MOM); if(GM.autosave) GM.autosave(); }
    finally{ GM.sceneEnd(); }
    await S.loop(GM); return true; };
  /* 回宿舍：媽媽一句 → 轉場 → 宿舍房間 */
  S.back=async function(GM){ const G=GM.G, H=S.rec(G); await say(GM,S.pick(G,'back'),MOM); await GM.fade(true); GM.advance(0.7); H.at=false; if(typeof ADV!=='undefined'&&ADV.end) ADV.end();
    if(GM.caption) GM.caption('','回到宿舍。',2200); await GM.enter('dorm',{x:0,z:2.4,yaw:Math.PI}); };
  /* 從家裡去當面約的地方（G48）：轉場（捷運＋公車）→ 那個地方；見面照 INV 原本的流程 */
  S.leaveTo=async function(GM,P){ const G=GM.G, H=S.rec(G); await GM.fade(true); if(GM.titleCard) await GM.titleCard(P.name||'出發','捷運＋公車 約 40 分鐘',2000); GM.advance(0.7); H.at=false; if(typeof ADV!=='undefined'&&ADV.end) ADV.end();
    await GM.enter(P.zone||'campus',P.spawn||undefined); };
  /* 週日晚上回到宿舍以後直接睡（床的「睡覺」第一個選項：明天早上）*/
  S.sleepAtDorm=async function(GM){ if(typeof STORY==='undefined'||!STORY.bedOptions||!STORY.sleepNow) return; const o=STORY.bedOptions(GM.G).find(x=>x.kind==='sleep'); if(o) await STORY.sleepNow(GM,o.wake,o.alarm); };
  /* 讀檔時人在家裡：回到家的選單（story3d.js 的 S.tick）*/
  S.tick=function(GM){ const G=GM.G; if(!S.at(G)||busy) return; S.loop(GM).catch(e=>{ console.warn('HOME.loop',e); busy=false; }); };
  /* 家人群組（週四 20:00）：story3d.js 的 S.phoneRules 每次呼叫 */
  S.phoneRules=function(GM){ const G=GM.G; if(typeof PHONE==='undefined'||!L()) return; const T=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null; if(!T||G.day<2) return;
    PHONE.join(G,'home','家人'); const th='g:home', tag='home_ask_'+G.day;
    if(G.weekday===4&&G.hour>=20&&!PHONE.sent(G,tag)){ const g=(L().group||[])[(G.day/7|0)%((L().group||[]).length||1)]; const R=L().groupReply||{};
      PHONE.at(G,G.day,20,[{th,from:'mom',name:'媽媽',text:g.t,ask:{id:tag,until:G.day*24+20+2,opts:[{t:'會回去',say:[{from:'mom',name:'媽媽',text:(R.yes||['好'])[0]},{from:'mom',name:'媽媽',text:'（愛心貼圖）'}]},{t:'這週不回',say:[{from:'mom',name:'媽媽',text:(R.no||['好 那下週'])[0]}]}]}}],tag); }
    for(const m of (G.msgs||[])){ if(!m.ask||!/^home_ask_/.test(m.ask.id)||m.ans!=null) continue; const due=m.day*24+m.h+2; if(G.day*24+G.hour>=due&&!PHONE.sent(G,m.ask.id+'_dad')) PHONE.at(G,m.day,m.h+2,[{th,from:'dad',name:'爸爸',text:((L().groupReply||{}).none||['？'])[0]}],m.ask.id+'_dad'); } };   /* 兩小時沒回：爸爸「？」（睡著了也會補在那個時間）*/
  return S;
})();
