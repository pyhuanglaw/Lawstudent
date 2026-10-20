/* ===== 週末回臺北的家（AA_134 第 3 節、AA_137 第 6 節定案；家人台詞池 AA_138 → src/data/home_lines.js）=====
   使用者 2026-10-15：「祐廷是臺北人……假日也可以回家」。週五 17:00 以後到週日，從宿舍房間「回臺北的家」。
   第一版家裡是 2D 背景（OUT.BG.home_living，圖還沒有＝深色底＋地點字幕）＋對話：到家一句 → 晚餐（18:30～20:00：媽媽問、玩家二選一、媽媽收尾（爸爸在上海，AA_298 第 8 節）；
   每月第一個週末姊姊宜蓁也在，多一句）→ 睡覺（隔天早上在家醒來、早上一句）→ 取車（媽媽一句；G.flags.carWithMe）→ 回宿舍（媽媽一句）。
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
  S.canGo=G=>{ if(S.baseMode(G)||S.breakMode(G)) return true;   /* 放假模式（AA_183）：出門赴約以後隨時可以回家 */ { const B=S.lawBreak(G); if(B&&T(G.day,G.hour)<S.breakEnd(G,B)) return true; }   /* 16 週制寒暑假（AA_197 1-3）：隨時可以回家住、再回宿舍 */ const h=G.hour; if(typeof CALENDAR!=='undefined'&&CALENDAR.typhoon&&CALENDAR.typhoon(G.day)) return false;   /* 颱風假不能回家（AA_160 3-4 D）*/ if(typeof STORY!=='undefined'&&STORY.homeHold&&STORY.homeHold(G)) return false;   /* 經濟系 9/20 E05 演完以前（story3d.js）*/ return (G.weekday===5&&h>=17)||G.weekday===6||(G.weekday===0&&h<21.5); };
  S.at=G=>!!(G.home&&G.home.at);
  const MOM={name:'媽媽'}, DAD={name:'爸爸'}, SIS={name:'宜蓁'};
  /* 池裡挑一句：不連續重複（最近用過的 2 句不選）*/
  S.pick=function(G,pool,key){ const P=(L()||{})[pool]||[]; if(!P.length) return null; const H=S.rec(G), u=H.used[key||pool]||(H.used[key||pool]=[]);
    const skip=S.livesHome&&S.livesHome(G)?(S.HOME_SKIP[pool]||[]):[]; const all=P.map((x,i)=>i).filter(i=>!skip.includes(P[i].t)); if(!all.length) return null;
    const ok=all.filter(i=>!u.slice(-2).includes(i)); const i=(ok.length?ok:all)[(G.day*3+u.length)%(ok.length||all.length)]; u.push(i); if(u.length>6) u.shift(); return P[i]; };
  /* 住在家裡的時候（經濟系休學在家、法律系放假住家裡）不出提宿舍的句子（AA_298 第 4 節）：群組 1、3，到家 2，晚餐 n3、n4。用句子比對（重新匯入順序變了也對得上）*/
  S.HOME_SKIP={group:['這週回來吃飯嗎','回來的話先講 我多煮'],arrive:['宿舍的床睡得習慣嗎？']}; S.DINNER_SKIP=['宿舍的飯好吃嗎？','你室友打電動到幾點？'];
  const who=(x,dflt)=>x&&x.who==='爸爸'?DAD:(x&&x.who==='媽媽'?MOM:dflt);
  const say=async(GM,x,dflt)=>{ if(!x) return; const w=who(x,dflt); if(/^（.*）$/.test(x.t)) await GM.say(null,x.t.replace(/^（/,'（'+w.name)); else await GM.say(w,x.t); };
  const bg=()=>{ if(typeof OUT==='undefined') return 'dark'; const G=typeof GAME!=='undefined'&&GAME.G, hh=G?((G.hour%24)+24)%24:18; const rt=!!(G&&typeof STORY!=='undefined'&&STORY.retakeOn&&STORY.retakeOn(G));   /* 照時段換房間（BG-HOME-1018）：早上房間、白天餐桌、晚餐、晚上客廳；重考期深夜在餐桌開小燈念書，其他人深夜在房間 */
    const k=hh>=5&&hh<7?'home_room_day':hh<17&&hh>=7?(rt?'home_room_day':'home_dining_day'):hh>=17&&hh<21?'home_dining_night':hh>=21&&hh<23?'home_sofa_night':'home_room_night'; return OUT.bg(k); };   /* AA_306（使用者 10-18「在房間書桌念書」）：重考期白天、深夜讀書在你房間的書桌（原本餐桌、深夜餐桌開小燈 home_dining_late）*/   /* 白天（7～17 點）用白天版（LAWWW2-B 2a0a7ff4），其他時間平常版（晚餐）*/
  const hm=h=>{ h=((h%24)+24)%24; const m=Math.round(h*60); return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0'); };
  const phoneTick=GM=>{ const G=GM.G; if(typeof PHONE==='undefined') return; try{ if(typeof STORY!=='undefined'&&STORY.phoneRules) STORY.phoneRules(GM); PHONE.tick(G,out=>{ if(out.length&&GM.toast) GM.toast('手機｜'+PHONE.notice(G,out[0]),3800); if(GM.phoneBadge) GM.phoneBadge(); }); }catch(e){ console.warn('HOME phone',e); } };
  const firstWeekend=G=>{ if(typeof CALENDAR==='undefined') return false; const d=CALENDAR.dateOf(G.day); return d&&d.d<=7; };   /* 每月第一個週末（日期 1～7 號）姊姊在家 */
  /* 晚餐：媽媽問（四週內同一句不重複；第 4 句的第一個選項要 KAI_ROOM_RULES；第 8 句只在第 8～10 週）→ 玩家二選一 → 媽媽收尾 */
  S.dinnerPick=function(G){ let D=(L()||{}).dinner||[];const H=S.rec(G), T=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null;
    const sisHome=firstWeekend(G), okSis=d=>!(sisHome&&/你姊說/.test(d.mom||''));   /* AA_140 G49：「你姊說她下個月回來。」姊姊在家的週末不問 */
    const home=S.livesHome&&S.livesHome(G), D0=D; D=D0.filter(d=>!(home&&S.DINNER_SKIP.includes(d.mom)));
    const ok=D.filter(d=>(!d.weeks||(T&&T.week>=d.weeks[0]&&T.week<=d.weeks[1]))&&okSis(d)&&!(H.ate[d.n]!=null&&G.day-H.ate[d.n]<28));
    const pool=ok.length?ok:D.filter(d=>(!d.weeks||(T&&T.week>=d.weeks[0]&&T.week<=d.weeks[1]))&&okSis(d)); if(!pool.length) return null; return pool[(((G.day+Object.keys(H.ate).length)%pool.length)+pool.length)%pool.length]; };   /* 經濟系那一年 G.day 是負的：取正的餘數 */
  S.dinner=async function(GM){ const G=GM.G, H=S.rec(G), d=S.dinnerPick(G); if(!d) return; H.eat={day:G.day}; H.ate[d.n]=G.day;
    await GM.say(null,firstWeekend(G)?'（晚餐。媽媽煮了一桌，姊姊也回來了。）':'（晚餐。媽媽煮了一桌。）'); await GM.say(MOM,d.mom);   /* 爸爸長期在上海工作，家裡只有媽媽（AA_298 第 8 節）*/
    const opts=d.opts.filter(o=>!o.ifMem||(typeof SOCIAL!=='undefined'&&SOCIAL.has(o.ifMem[0],o.ifMem[1]))); await GM.choose(opts.map(o=>({t:'「'+o.t+'」'})));
    if(/^（.*）$/.test(d.dad)) await GM.say(null,d.dad.replace(/^（/,'（媽媽')); else await GM.say(MOM,d.dad); if(d.dadAct) await GM.say(null,'（媽媽'+d.dadAct.replace(/給他$/,'給你')+'）');   /* 收尾改媽媽（AA_138 2026-10-18；欄位名 dad 照舊）*/
    if(firstWeekend(G)){ const s=S.pick(G,'sisDinner'); if(s) await GM.say(SIS,s.t); }
    GM.advance(1); };
  /* 在家睡覺：隔天早上在家醒來（08:30）；早上一句 */
  S.sleep=async function(GM,wakeH){ const G=GM.G, E=GM.E; if(typeof ECONFF!=='undefined'&&ECONFF.sleepJump&&await ECONFF.sleepJump(GM)) return;   /* 經濟系事件接事件：在家睡覺也＝到下一個事件 */
    { const cw=typeof STORY!=='undefined'&&STORY.coreCallAt?STORY.coreCallAt(G):null; if(cw!=null&&cw>G.hour){ await GM.fade(true); GM.advance(cw-G.hour); await GM.fade(false); if(GM.toast) GM.toast('手機響了。',2400); return; } }   /* 經濟系的固定核心（例：E35 21:30 的電話）：睡著也會被叫醒，下一輪選單接著演 */
    await GM.fade(true); if(G.hour>=25) (G.daily||(G.daily={})).lateNight=G.day+1;   /* 01:00 以後才睡（明軒那句，AA-B 10-16）*/ G.day++; G.weekday=(G.weekday+1)%7; G.energy=100; G.hour=wakeH!=null?wakeH:8.5;   /* wakeH：隔天有學校的固定行程時提早醒（DL-05，AA_160 1-6）*/ if(E) E.hour=G.hour; G.flags.companion=null;
    if(typeof CALENDAR!=='undefined'&&CALENDAR.typhoon&&CALENDAR.typhoon(G.day)) G.weather='rain'; else G.weather=Math.random()<0.7?'clear':'cloudy'; if(E&&E.setWeather) E.setWeather(G.weather);
    if(GM.updateHUD) GM.updateHUD(); if(GM.titleCard) await GM.titleCard(typeof STORY!=='undefined'&&STORY.dayTitle?STORY.dayTitle(G):'第 '+G.day+' 天',['週日','週一','週二','週三','週四','週五','週六'][G.weekday]+' '+hm(G.hour)+'・臺北的家',2200); await GM.fade(false);
    if(typeof STORY!=='undefined'&&STORY.monthlyFunds){ const f=STORY.monthlyFunds(G); if(f){ GM.money(f.amount); if(GM.toast) GM.toast(f.text,3800); } }
    const m=S.pick(G,'morning'); await say(GM,m,MOM);
    if((G.stage||'law')==='law'&&typeof CLS!=='undefined'&&CLS.morning&&typeof CALENDAR!=='undefined'){ try{ await CLS.morning(GM); }catch(e){ console.warn('HOME CLS.morning',e); } }   /* 成績公布、下學期選課：在家醒來也照早上那一套（16 週制寒暑假可以住家裡，AA_197 1-3）*/
    { const Tm=typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(G.day):null, H=S.rec(G); if((G.stage||'law')==='law'&&Tm&&Tm.week===1&&H.note1!==Tm.id&&S.schoolStart(G,G.day)!=null){ H.note1=Tm.id; if(GM.toast) GM.toast('從家裡出發，要早 40 分鐘。',4200); } }   /* 開學那週在家醒來（AA_197 1-3 系統字）*/
    S.rec(G).wakeAsk=G.day; if(GM.autosave) GM.autosave(); };   /* wakeAsk：在家醒來的起床選單（S.loop 下一輪）*/
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
  S.takeCar=async function(GM){ const G=GM.G; G.flags.carWithMe=true; const c=S.pick(G,'car'); await say(GM,c,MOM); };   /* 取車（AA_128 S4：從家裡出發的約會不用再加取車的時間）*/
  /* 在家也要赴約（AA_140 G48，AA-B 2026-10-16；AA_134 第 3 節）：原本人在家時 INV.tick、OUT.tick 不跑，排定的約（例：4/24 可昕 18:45）直接錯過、還被當成爽約。
     出遊（OUT）到了該出發的時間，選單最上面多「出發」——從家裡出發（車在家裡，不加取車時間）；當面約（INV）約定前 1 小時起多「出發」——回到約好的地方。
     會跳過約定時間的選項（睡覺、休息、等晚餐）先問一次「照樣／先不要」。在家錯過當面約＝延後、不扣分（不記 MISSED_DINNER）*/
  const T=(day,h)=>day*24+h;
  S.dueOuting=G=>typeof OUT!=='undefined'&&OUT.due?OUT.due(G):null;
  S.dueInvites=G=>{ if(typeof INV==='undefined'||!Array.isArray(G.invites)) return []; const h=G.hour%24; return G.invites.filter(iv=>iv.state==='accepted'&&iv.day===G.day&&h>=iv.h-1&&h<iv.h+(INV.WAIT_H||0.5)); };
  /* 這個動作做完會到 toH（今天的小時，可以超過 24）：會錯過的約（出遊：約好的時間後 45 分鐘；當面約：約好的時間＋等待）*/
  S.wouldMiss=function(G,toH){ const now=T(G.day,G.hour), to=T(G.day,toH), out=[];
    if(typeof OUT!=='undefined') for(const q of OUT.rec(G)) if(q.state==='planned'){ const lt=T(q.day,q.h)+(q.late!=null?q.late:0.75); if(lt>now&&lt<=to) out.push(hm(q.h)+' '+q.title); }   /* 照那一場自己的遲到容許（E27、E14 是 15 分鐘，BB_214 第 1 點）*/
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
  S.winterStartDue=G=>{ if((G.stage||'law')!=='econ'||!G.flags||G.flags.Y0_WINTER_START||G.flags.Y0_MOVED_OUT) return false;   /* 10/19 退宿以後住在家裡（AA_154 0b-2：412 的寒假安排刪除）：寒假照休學後的在家模式，固定點（F1、E21、E23）照常；寒假模式只留給還住宿舍的舊存檔 */ const a=DK('2025-01-06'), b=DK('2025-02-16'); return a!=null&&b!=null&&(G.day>a||(G.day===a&&G.hour>=6))&&G.day<=b; };
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
      if(G.flags.Y0_STICKY){ await GM.say(null,'（傍晚，回到臺北的家。拆箱的時候，最後一箱上面貼著一張便利貼。阿勳的字。）'); await GM.say({name:'便利貼'},'保齡球欠我一場。'); await GM.say(null,'（下面還有一行小字：「下次有事，先跟室友說。」）'); }   /* AA_305 第 7 節 */ if(GM.autosave) GM.autosave(); }
    finally{ GM.sceneEnd(); }
    await S.loop(GM); };
  /* 回到家、不再轉場（法律系迎新宿營演完，S.campY1 已經有「（回到家……）」那一句；AA_205 2-3）*/
  function backQuiet(GM){ const G=GM.G, H=S.rec(G); H.at=true; H.day=G.day; if(S.baseMode(G)) H.base=true; if(typeof ADV!=='undefined') ADV.begin({background:bg()}); if(GM.autosave) GM.autosave(); return true; }
  S.arriveQuiet=async function(GM){ if(S.at(GM.G)) return false; backQuiet(GM); await S.loop(GM); return true; };   /* 不在家的時候出發去宿營的（3D 裡的出發選單）：演完直接在家 */
  S.bgNow=()=>bg();
  /* 在家的時候 3D 畫面藏起來、底下鋪家裡的背景（2026-10-18 使用者：「為什麼重考的轉換場景會一直有椰林大道」；BB-C n123 在家選單後面是校園）：
     家是 2D（ADV），兩段對話之間、黑幕前後、選單後面原本露出最後一個 3D 區域（大多是校園）。每 0.25 秒照「在不在家」同步一次 */
  let bdOn=null, bdImg=null, prevAt=null, leftAt=-1;
  /* 住在家裡、剛出家門還沒進到新的 3D 地點（2D 出遊、搬家、高雄回來接下一段……）：3D 是上一次留下來的舊區域（常常是醉月湖），一樣藏著（使用者 10-18：「從高雄之後進去陪可昕去休學的劇情中間又跳醉月湖」；出家門的路有十幾條，每一條都是先收 2D 再黑幕）。
     GAME.enterN：真的換了區域（goto 醉月湖、3D 的步驟、回學校）才露出 3D */
  S.backdrop=function(G){ if(typeof document==='undefined') return; const c=document.getElementById('c'); if(!c) return; const at=!!(G&&S.at(G)), n=(typeof GAME!=='undefined'&&GAME.enterN)|0;
    if(prevAt&&!at) leftAt=n; prevAt=at; const lives=!!G&&(S.livesHome?S.livesHome(G):(S.baseMode&&S.baseMode(G)));
    const on=at||(typeof OUT!=='undefined'&&OUT.fromHome)||(lives&&leftAt===n);
    /* 底下鋪的圖跟著 2D 現在的背景（BUG-KH-HOMEFLASH-1018，使用者 10-18：「我在高雄走了一整天……轉場中間又跑出台北的家」）：7/25 客運版從家裡出發、整天演完才回家，
       演的時候還算「在家」，換場景（新圖還在載入、2D 淡出淡入）那一下露出家裡。2D 正在顯示別的圖就鋪同一張、深色底就鋪深色；2D 沒開或是透明的（模糊）而且人真的在家，才鋪家裡 */
    const am=typeof ADV!=='undefined'&&ADV.active?ADV.bgMode:null, aImg=am&&typeof am==='object'&&am.image?am.image:null;
    const b=on&&!aImg&&am!=='dark'&&at?bg():null, img=on&&aImg?aImg:(b&&b.image?b.image:null);
    if(on===bdOn&&img===bdImg) return; bdOn=on; bdImg=img; c.style.visibility=on?'hidden':''; document.body.style.background=on?('#14161a'+(img?' url('+img+') center/cover no-repeat':'')):''; };
  { const iv=typeof setInterval!=='undefined'?setInterval(()=>{ try{ const G=typeof GAME!=='undefined'&&GAME.G; if(G) S.backdrop(G); }catch(e){} },250):null; if(iv&&iv.unref) iv.unref(); }
  /* 從家裡出發去一個出遊、演完回家（休學在家）：baseRound 的「出發」和事件接事件（econff3d.js S.homeStep）共用。回傳 true＝回到家、false＝人留在外面 */
  S.goOut=async function(GM,q){ const G=GM.G, H=S.rec(G); H.at=false; if(typeof ADV!=='undefined'&&ADV.end) ADV.end(); const ok=await OUT.go(GM,q,{fromHome:true});
    if(ok&&q.camp) return backQuiet(GM);
    if(ok&&!q.goto&&S.baseMode(G)){ await GM.fade(true); if(GM.titleCard) await GM.titleCard('回臺北的家','捷運＋公車 約 30 分鐘',2000); GM.advance(0.5); H.at=true; H.day=G.day; if(typeof ADV!=='undefined') ADV.begin({background:bg()}); await GM.fade(false); return true; }
    if(!ok&&!S.at(G)){ H.at=true; if(typeof ADV!=='undefined') ADV.begin({background:bg()}); return true; }
    return false; };
  async function baseRound(GM){ const G=GM.G, H=S.rec(G); const ev=S.homeEvent(G); if(ev){ await EVENTS.run(ev); if(H.at&&typeof ADV!=='undefined') ADV.begin({background:bg()}); return H.at; }
    { const c=typeof STORY!=='undefined'&&STORY.homeCall?STORY.homeCall(G):null; if(c&&c.q){ if(c.line) await GM.say({name:c.who},c.line); if(c.line2) await GM.say({name:c.who},c.line2); H.at=false; if(typeof ADV!=='undefined'&&ADV.end) ADV.end(); c.q.state='planned';   /* 固定核心的電話（例：E37 14:15 可昕）→ 直接出發；宿營（line 空）不打電話 */
      const ok=await OUT.go(GM,c.q,{fromHome:true}); if(ok&&c.q.camp) return backQuiet(GM); if(ok&&!c.q.goto&&S.baseMode(G)){ await GM.fade(true); if(GM.titleCard) await GM.titleCard('回臺北的家','捷運＋公車 約 30 分鐘',2000); GM.advance(0.5); H.at=true; H.day=G.day; if(typeof ADV!=='undefined') ADV.begin({background:bg()}); await GM.fade(false); return true; } if(ok&&c.q.goto&&GM.toast) GM.toast('要回家：手機「地點」→ 回臺北的家（或走到校門口）。',5200); return false; } }
    if(typeof ECONFF!=='undefined'&&ECONFF.on2&&ECONFF.on2(G)){ H.wakeAsk=null; return ECONFF.homeStep(GM); }   /* 事件接事件（D102 ③）：在家選單收起來，跳到下一個事件 */
    if(H.wakeAsk===G.day){ H.wakeAsk=null; if(typeof STORY!=='undefined'&&STORY.retakeOn&&STORY.retakeOn(G)){ const r=await STORY.retakeWake(GM); if(r==='left') return false; } }   /* 重考期的起床選單（AA_154 A39）*/
    const h=G.hour, ateToday=H.eat&&H.eat.day===G.day, O=[], q=S.dueOuting(G);
    if(q){ const tr=OUT.trip?OUT.trip(G,q,true):{travel:q.travel||''}; O.push({t:(q.verb||'出發')+'：'+q.title,hint:'從家裡出發　'+(q.place||'')+'　'+hm(q.h)+(tr.travel?'　'+tr.travel:''),k:'out',q}); }   /* A46 ②：從家裡出發一律 30 分鐘（OUT.trip）*/
    for(const iv of S.dueInvites(G)){ const P=INV.place(iv.place)||{}; O.push({t:'出發：和'+(typeof SOCIAL!=='undefined'?SOCIAL.displayName(iv.who):iv.who)+'約在'+(P.name||''),hint:hm(iv.h)+'　捷運＋公車 約 30 分鐘',k:'inv',iv,P}); }
    /* 「去學校」拿掉（2026-10-18 使用者：「一個休學的人根本不會想再踏入台大，為什麼要保留這個選項」「重考中不要讓我去台大」）：休學在家（10/19～8/29）自己去台大的選項不給；劇情要到校園的事件照舊由事件帶過去 */
    { const sl=S.y0Slot(G); if(sl){ O.push({t:'讀書',hint:sl.name+'：讀到 '+hm(sl.end),k:'study',to:sl.end}); O.push({t:'休息',hint:'到 '+hm(sl.end),k:'rest',to:sl.end}); } }   /* 時段制（使用者 21:5x）：上午、下午、晚上各做一件，做完到下一個時段 */
    if(S.y0DateOpen(G)){ const pe=typeof STORY!=='undefined'&&STORY.rPlayEv?STORY.rPlayEv(G):null; O.push({t:'約可昕出門',hint:(pe&&pe[1]?'去'+pe[1]+'・':'')+'現在就出發'+(h<10?'（她 10:00 有空）':''),k:'date'}); }   /* 2026-10-18 使用者：「約可昕出門是要去哪？按哪個按鈕都會顯示會錯過 10 點」——原本只排一個 10:00 的出遊、人還在家，其他選項都跳「會錯過」；改成寫地點、選了就出發 */
    O.push({t:'看手機',hint:'和朋友聯絡',k:'phone'});
    if(!ateToday&&h>=18.5&&h<20) O.push({t:'吃晚餐',k:'eat'});
    if(S.y0ffOpts(G)) O.push({t:'快轉',hint:'到下一個有事的日子／過三天／過一週',k:'ff'});   /* D99：休學在家十個月，原本只能一天一天睡 */
    O.push({t:'存檔',hint:'存到存檔欄位',k:'save'});   /* 在家也能存檔（2026-10-18 使用者：「在家也不能存檔很麻煩」）*/ O.push({t:'睡覺',hint:'隔天早上在家醒來',k:'sleep'});
    const o=O[await GM.choose(O,{menu:true})]||O[O.length-1];
    if(o.k==='save'){ if(GM.saveMenu) await GM.saveMenu(); return H.at; }
    if(o.k==='ff'){ const F=S.y0ffOpts(G), f=F&&F[await GM.choose(F.map(x=>({t:x.t,hint:x.hint})),{menu:true})]; if(f&&f.to!=null&&f.to>T(G.day,G.hour)) await S.y0Jump(GM,f.to); return H.at; }
    if(o.k==='out'){ H.at=false; if(typeof ADV!=='undefined'&&ADV.end) ADV.end(); const ok=await OUT.go(GM,o.q,{fromHome:true});
      if(ok&&o.q.camp) return backQuiet(GM);   /* 宿營演完已經有「回到家」那一句：不再轉場 */
      if(ok&&!o.q.goto&&S.baseMode(G)){ await GM.fade(true); if(GM.titleCard) await GM.titleCard('回臺北的家','捷運＋公車 約 30 分鐘',2000); GM.advance(0.5); H.at=true; H.day=G.day; if(typeof ADV!=='undefined') ADV.begin({background:bg()}); await GM.fade(false); return true; }   /* 2D 出遊演完回家（休學後住家裡；不是回宿舍）*/
      if(ok&&o.q.goto&&GM.toast) GM.toast('要回家：手機「地點」→ 回臺北的家（或走到校門口）。',5200);   /* 到現場的出遊（goto）演完人留在那裡（2026-10-18 BB-C）*/ return false; }
    if(o.k==='inv'){ await S.leaveTo(GM,o.P); return false; }
    if(o.k==='school'){ await S.toSchool(GM); return false; }
    if(o.k==='study'){ if(await confirmMiss(GM,o.to)){ GM.advance(Math.max(0.5,o.to-G.hour)); const a=DK('2025-02-15'), b=DK('2025-07-10'); if(a!=null&&b!=null&&G.day>=a&&G.day<=b&&typeof EVENTS!=='undefined'&&EVENTS.habit) EVENTS.habit('retake:study');   /* AA_224 6-1：重考讀書從 2/15 開始 */ } return H.at; }
    if(o.k==='rest'){ if(await confirmMiss(GM,o.to)){ GM.advance(Math.max(0.5,o.to-G.hour)); if(GM.energy) GM.energy(15); } return H.at; }
    if(o.k==='date'){ if(typeof STORY!=='undefined'&&STORY.rtPlanPlay) STORY.rtPlanPlay(G); const q=typeof OUT!=='undefined'&&OUT.get?OUT.get(G,'rt_play_'+G.day):null; if(!q) return H.at; if(q.h>G.hour) GM.advance(q.h-G.hour);   /* 她 10:00 才有空：直接到那個時間出發 */
      H.at=false; if(typeof ADV!=='undefined'&&ADV.end) ADV.end(); const ok=await OUT.go(GM,q,{fromHome:true});
      if(ok&&!q.goto&&S.baseMode(G)){ await GM.fade(true); if(GM.titleCard) await GM.titleCard('回臺北的家','捷運＋公車 約 30 分鐘',2000); GM.advance(0.5); H.at=true; H.day=G.day; if(typeof ADV!=='undefined') ADV.begin({background:bg()}); await GM.fade(false); return true; }
      if(!ok){ H.at=true; if(typeof ADV!=='undefined') ADV.begin({background:bg()}); return true; } return false; }
    if(o.k==='phone'){ if(GM.phoneThread){ if(typeof ADV!=='undefined'&&ADV.end) ADV.end(); await GM.phoneThread(null); if(typeof ADV!=='undefined') ADV.begin({background:bg()}); } return H.at; }
    if(o.k==='eat'){ if(await confirmMiss(GM,G.hour+1)) await S.dinner(GM); return H.at; }   /* BB_214 第 1 點：吃晚餐一小時，會錯過約好的出遊、當面約要先問 */
    if(await confirmMiss(GM,24+8.5)){ await S.sleep(GM); } return H.at; }   /* 醒來的下一輪問起床選單（重考期，A39）*/
  async function winterRound(GM){ const G=GM.G, H=S.rec(G); const ev=S.homeEvent(G); if(ev){ await EVENTS.run(ev); if(G.flags.Y0_WINTER_DONE){ await S.winterEnd(GM); return false; } if(H.at&&typeof ADV!=='undefined') ADV.begin({background:bg()}); return H.at; }
    const h=G.hour, ateToday=H.eat&&H.eat.day===G.day, nx=S.winterNext(G), O=[];
    if(!ateToday&&h>=18.5&&h<20) O.push({t:'吃晚餐',k:'eat'});
    if(nx!=null) O.push({t:'過幾天',hint:'跳到 '+dateLabel(nx),k:'skip'});
    O.push({t:'存檔',hint:'存到存檔欄位',k:'save'});   /* 在家也能存檔（2026-10-18 使用者：「在家也不能存檔很麻煩」）*/ O.push({t:'睡覺',hint:'隔天早上在家醒來',k:'sleep'});
    const o=O[await GM.choose(O,{menu:true})]||O[O.length-1];
    if(o.k==='save'){ if(GM.saveMenu) await GM.saveMenu(); return H.at; }
    if(o.k==='eat') await S.dinner(GM); else if(o.k==='skip'){ const first=!H.skipped; H.skipped=true; await S.jumpTo(GM,nx); const l=first?'寒假。你睡到中午，下午幫媽媽跑腿。':S.WINTER_SKIP_LINE(nx); if(l) await GM.say(null,l); if(first&&S.WINTER_SKIP_LINE(nx)) await GM.say(null,S.WINTER_SKIP_LINE(nx)); }
    else { const wake=T(G.day+1,8.5); if(nx!=null&&nx<wake) await S.jumpTo(GM,nx); else await S.sleep(GM); S.rec(G).wakeAsk=null; }   /* 睡覺會經過固定點（E21 22:00 等）：停在那個時間 */
    return H.at; }
  /* ===== 法律系的寒暑假（AA_197 1-1～1-3，16 週制；HOLIDAY-SYS）=====
     **2026-10-17 改**：不再強制回家。寒假宿舍照開（第一天早上系統字 S.breakNote）；暑假最後一天 12:00 問續住／暑假回家住（S.breakPhone）。
     住家裡＝H.lbreak（從選單「回家」或暑假選回家）；家裡的選單有「快轉」「回宿舍住」；宿舍的床也有「快轉」（S.ffMenu：到下一個有事的日子／過三天／過一週／不用了）。
     放假最後一天 21:30 以後照週日晚上那一套（不再有「明天開學。你回宿舍。」字卡）。除夕 15:00 媽媽「幾點回來？」、17:00 以後還在宿舍＝「飯快好了。」→ 回家（S.eveDue）。
     以下是原本 AA_183 的說明（在家模式的部分照用）：
     每一個寒假、暑假都照經濟系寒假的做法：住臺北的家、只演列出來的日子、中間用字卡＋「過幾天」跳過（每次一句旁白，第 4 節輪流）。
     不回宿舍、不能自己回學校；約好的出遊、當面約那一天自動變成要演的日子，從家裡出發（30 分鐘，R9）。手機照常：跳過的時間每小時跑一次手機規則，訊息照時間戳記收進來。
     回家：放假第一天早上起床（成績那一件先演）→ 旁白 → 字卡「回臺北的家」；舊存檔停在放假中間、人在宿舍的＝讀檔後第一次起床才回家（不在讀檔的瞬間傳送）。
     回宿舍：寒假＝開學前一天 17:00「明天開學。你回宿舍。」→ 字卡 → 原本的房間；大一暑假＝9/6 主線 3（STORY.roomY2Due 在選單之前接走）。
     G.home 多三個欄位：lbreak（正在放的假，'Y1W'…）、brk（這個假已經回過家了）、bskip（{key,n} 跳過的旁白輪到第幾句）。舊存檔沒有＝不在放假模式。
     還沒有規格、先只做回家、回宿舍和動態的日子：大二寒假（交接包_v3 第 2 節）、大三（AA_180、交換路線 AA_144 X1～X3）、大四（AA_181）。
     測試：node tests/law_break_unit.js */
  S.breakOf=function(day){ if(typeof CALENDAR==='undefined'||!CALENDAR.TERMS||CALENDAR.termOf(day)) return null; const t=CALENDAR.tOf(day); let prev=null, next=null;
    for(const X of CALENDAR.TERMS){ if(X.t1<=t&&(!prev||X.t1>prev.t1)) prev=X; if(X.t0>t&&(!next||X.t0<next.t0)) next=X; }
    if(!prev||!next||!/^Y[1-4]S[12]$/.test(prev.id)) return null;   /* 經濟系那一年的暑假、大四畢業以後（AA_181 2-9）不是 */
    const dOf=x=>Math.round((x-CALENDAR.tOf(1))/86400000)+1, kind=/S1$/.test(prev.id)?'winter':'summer';
    return {key:prev.id.slice(0,2)+(kind==='winter'?'W':'S'),kind,year:prev.id.slice(0,2),from:dOf(prev.t1),to:dOf(next.t0)-1,next:next.id}; };
  S.lawBreak=G=>!!G&&(G.stage||'law')==='law'?S.breakOf(G.day):null;
  /* 要演的日子（AA_183 第 3 節）：[日期, 幾點, 種類]。sum＝摘要日（只有旁白、手機）；eve＝除夕（主線 2 的 auto 事件在家演）；cny＝初一（拜年的群組）；
     ytbday＝語彤生日（手機）；lottery＝宿舍抽籤（手機＋旁白）；back＝回宿舍；room＝主線的新房間（STORY.roomY2Due）。出遊、當面約不寫在這裡（S.breakNext 動態加）*/
  S.BREAK_PTS={
    Y1W:[['2026-01-20',18.5,'sum'],['2026-02-05',18.5,'sum'],['2026-02-16',12,'eve'],['2026-02-17',11,'cny'],['2026-02-22',17,'back']],
    Y1S:[['2026-07-09',12,'ytbday'],['2026-07-15',10,'lottery'],['2026-07-20',18.5,'sum'],['2026-08-25',18.5,'sum'],['2026-09-06',8.5,'room']],
    Y2W:[['2027-01-20',20,'sum'],['2027-01-28',18.5,'sum'],['2027-02-05',12,'eve'],['2027-02-06',11,'cny'],['2027-02-21',17,'back']],   /* AA_183 3-2b（AA-B acf89d8a）：1/20 20:00 學姊 M2 的家族群組訊息（V3-B06 做好就會收到）、1/28 摘要日；情人節 2/14（交往中）是出遊、動態停 */
    Y2S:[['2027-06-28',18.5,'sum'],['2027-07-15',10,'lottery3'],['2027-07-20',18.5,'sum'],['2027-08-25',18.5,'sum'],['2027-09-05',17,'back']] };   /* AA_170 第 2 節；9/5 主線 5 做好以前照寒假的回宿舍 */
  /* 摘要日跳過（AA_275 第 6 節）：那天人在國外（出國活動期間），或那天有已報名的活動＝不播摘要、快轉也不停 */
  S.sumSkip=function(G,d){ if(typeof VAC!=='undefined'&&VAC.abroadOn&&VAC.abroadOn(G,d)) return true; if(typeof OUT!=='undefined'&&OUT.rec) return OUT.rec(G).some(q=>q.vac&&q.day===d&&(q.state==='planned'||q.state==='done')); return false; };
  S.breakPts=function(G,B){ B=B||S.lawBreak(G); if(!B) return []; const L=(S.BREAK_PTS[B.key]||[]).map(p=>({day:DK(p[0]),h:p[1],k:p[2]})).filter(p=>p.day!=null&&p.day>=B.from&&p.day<=B.to&&!(p.k==='sum'&&S.sumSkip(G,p.day)));
    if(!L.some(p=>p.k==='back'||p.k==='room')) L.push({day:B.to,h:17,k:'back'}); return L.sort((a,b)=>T(a.day,a.h)-T(b.day,b.h)); };
  S.breakEnd=function(G,B){ B=B||S.lawBreak(G); if(!B) return null; const p=S.breakPts(G,B).find(q=>q.k==='room'); return p?T(p.day,p.h):T(B.to,21.5); };   /* AA_197 1-3：開學前一天不再強制回宿舍；21:30 以後在家照週日晚上（「明天有課吧」＋住家裡隔天直接去學校）*/
  /* 正在放假模式：回過家了、還沒到回宿舍的時間（人可能暫時出門赴約）*/
  S.breakMode=function(G){ const H=G&&G.home; if(!H||!H.lbreak) return false; const B=S.lawBreak(G); return !!B&&B.key===H.lbreak&&T(G.day,G.hour)<S.breakEnd(G,B); };
  S.livesHome=G=>S.baseMode(G)||S.breakMode(G);   /* 從家裡出發、出遊演完回家的（休學以後、放假模式）*/
  /* 下一個要停的時間：表上的日子、出遊該出發的時間（出發選單出現的時候）、當面約前 1 小時 */
  S.breakNext=function(G,now){ now=now!=null?now:T(G.day,G.hour); let best=null; const c=x=>{ if(x>now+1e-6&&(best==null||x<best)) best=x; };
    for(const p of S.breakPts(G)) c(T(p.day,p.h));
    { const B=S.lawBreak(G); if(B&&typeof CALENDAR!=='undefined'&&CALENDAR.gradeDay){ const gd=CALENDAR.gradeDay(B.year+(B.kind==='winter'?'S1':'S2')); if(gd!=null) c(T(gd,8.5)); } }   /* 成績公布日（放假後第 3 個週一）早上：AA_197 1-2「一定會演的日子」*/
    if(typeof OUT!=='undefined') for(const q of OUT.rec(G)) if(q.state==='planned'&&!(typeof VAC!=='undefined'&&VAC.repSkip&&VAC.repSkip(G,q))) c(Math.max(T(q.day,q.h)-OUT.trip(G,q,true).travelH-0.25,q.ask!=null?q.ask:-1e9));   /* 第二次以後只有一行的活動不停（AA_275 第 1 節）*/
    if(typeof INV!=='undefined'&&Array.isArray(G.invites)) for(const iv of G.invites) if(iv.state==='accepted') c(T(iv.day,iv.h)-1);
    if(typeof EXCH!=='undefined'&&EXCH.departAt){ const x=EXCH.departAt(G); if(x!=null) c(x); }   /* 交換出發日早上：快轉停在那裡 */
    return best; };
  S.breakStartDue=function(G){ const B=S.lawBreak(G); if(!B) return false; const H=S.rec(G); if(H.brk===B.key||H.lbreak===B.key||H.winter||H.base) return false; if(!(H.stay&&H.stay[B.key]==='home')) return false; return T(G.day,G.hour)<S.breakEnd(G,B)&&G.hour>=5; };   /* 只有暑假選了「暑假回家住」（AA_197 1-3）；寒假不強制 */
  /* 回家（第 2 節）：起床、成績那一件演完以後（story3d.js 的 sleepNow 最後；在家醒來的在 S.loop）*/
  S.BREAK_HOME_LINE={winter:'宿舍的房間留著。你帶了一袋換洗衣服回家。',summer:'暑假回家住。你把一年的東西裝進四個紙箱。'};   /* summer：AA-C 2026-10-17 11:40（可以續住，不寫「到六月底」）*/
  S.breakStart=async function(GM){ const G=GM.G, H=S.rec(G), B=S.lawBreak(G); if(!B||!S.breakStartDue(G)) return false; const home=S.at(G); H.brk=B.key; H.lbreak=B.key; H.bskip={key:B.key,n:0,last:-1}; H.wakeAsk=null; H.stayMon=null; GM.sceneBegin();
    try{ await GM.say(null,S.BREAK_HOME_LINE[B.kind]);
      if(!home){ await GM.fade(true); if(GM.titleCard) await GM.titleCard('回臺北的家','捷運＋公車 約 40 分鐘',2400); GM.advance(0.7); H.at=true; H.day=G.day; if(typeof ADV!=='undefined') ADV.begin({background:bg()}); await GM.fade(false); }
      if(GM.autosave) GM.autosave(); }
    finally{ GM.sceneEnd(); }
    return true; };
  /* 回宿舍（寒假，第 2 節）：17:00 起「明天開學。你回宿舍。」→ 字卡 → 原本的房間 */
  S.breakBack=async function(GM){ const G=GM.G, H=S.rec(G); H.lbreak=null; H.bskip=null; GM.sceneBegin();
    try{ if(typeof ADV!=='undefined') ADV.begin({background:bg()}); await GM.say(null,'明天開學。你回宿舍。'); await GM.fade(true); if(GM.titleCard) await GM.titleCard('回宿舍','捷運＋公車 約 40 分鐘',2400); GM.advance(0.7); H.at=false; H.wakeAsk=null; if(typeof ADV!=='undefined'&&ADV.end) ADV.end();
      if(GM.enter) await GM.enter('dorm',{x:0,z:2.4,yaw:Math.PI}); await GM.fade(false); }
    finally{ GM.sceneEnd(); }
    if(GM.autosave) GM.autosave(); return true; };
  /* 跳過的旁白（第 4 節）：每次跳過一句，照這張輪流（經濟系那一年的四句不重複用）*/
  S.BREAK_SKIP={winter:['寒假的早上，家裡比宿舍安靜。','年前，媽媽把你的房間也算進大掃除。','過年的幾天，親戚來來去去。每個人都問你，法律系是不是都在背條文。','寒假的最後一週，你把下學期的課表抄進手帳。'],
    summer:['暑假的第一週。紙箱靠在牆邊，你一直沒拆。','七月。臺北熱到柏油路會反光。','八月。颱風來的那一晚，你在家把筆記從頭翻了一遍。','暑假的最後幾天，你把紙箱的膠帶重新貼好。']};
  /* 四句照跳過的那一段在放假的哪個時候挑（中間那一天）：寒假＝前 10 天／過年以前／除夕到初二／最後 7 天；暑假＝前 10 天／七月／八月／最後 7 天。
     和上一次跳過同一句＝改說 BREAK_SKIP_EXTRA，那一句也用過了才只有字卡（AA-B acf89d8a 同意這個挑法）*/
  S.breakSkipIdx=function(G,mid,B){ B=B||S.lawBreak(G); if(!B) return -1; if(mid-B.from<10) return 0; const m=typeof CALENDAR!=='undefined'?CALENDAR.dateOf(mid).m:0;
    if(B.kind==='summer') return B.to-mid<7?3:(m===7?1:(m===8?2:(m<7?0:3)));
    let eve=null; for(let d=B.from;d<=B.to;d++){ if(typeof CALENDAR!=='undefined'&&CALENDAR.holiday(d)==='除夕'){ eve=d; break; } } if(eve!=null&&mid>=eve&&mid<=eve+2) return 2;   /* 除夕到初二（大一的過年在寒假最後一週裡）*/
    if(B.to-mid<7) return 3; return eve!=null&&mid<eve?1:3; };
  /* 和上一次同一格（同一句）時改說這一句（AA-B acf89d8a，AA_183 第 4 節）；這一句這個假也用過了＝只有字卡 */
  S.BREAK_SKIP_EXTRA={winter:'棉被曬過一次，又收了起來。',summer:'午後雷陣雨。下完，又出太陽。'};
  /* 宿舍的快轉旁白（AA_183 4-b，AA-C 95c6a870）：挑法一樣，另外記 bskipD；寒假「除夕到初二」那格只給初一、初二回宿舍的（除夕 17:00 照規則先回家）*/
  S.BREAK_SKIP_DORM={winter:['寒假的宿舍。走廊的燈只開一半。','年前，宿舍的公告欄貼了一張紅紙：除夕到初三，餐廳不開。','初二。宿舍的餐廳沒開，你在便利商店買了一份年菜便當。','寒假的最後一週。室友一個一個回來，走廊又有了腳步聲。'],
    summer:['暑假的宿舍。蟬叫得比上課鐘還準時。','七月。冷氣卡要儲值了，你一次加了一千。','八月。颱風那一晚，宿舍停電，整層樓的人都跑到走廊吹風。','暑假的最後幾天。新生的家長推著行李車，從樓下經過。']};
  S.BREAK_SKIP_DORM_EXTRA={winter:'棉被從櫃子裡拿出來，就沒再收回去。',summer:'洗衣間的烘衣機排了三個人。你決定明天再來。'};
  S.breakSkipLine=function(G,t0,t1,o){ o=o||{}; const H=S.rec(G), B=S.lawBreak(G); if(!B) return null; const k=o.dorm?'bskipD':'bskip'; if(!H[k]||H[k].key!==B.key) H[k]={key:B.key,n:0,last:-1}; const R=H[k], i=S.breakSkipIdx(G,Math.floor((t0+t1)/48),B);
    if(i<0) return null; if(i===R.last){ if(R.extra) return null; R.extra=true; R.n++; return (o.dorm?S.BREAK_SKIP_DORM_EXTRA:S.BREAK_SKIP_EXTRA)[B.kind]; }
    R.last=i; R.n++; return (o.dorm?S.BREAK_SKIP_DORM:S.BREAK_SKIP)[B.kind][i]; };
  /* 大一下有在做的打工（家教 JOB_TUTOR；溫州街三家等 DL-10 的 JOBS）*/
  const hasJob=G=>!!(G.flags&&G.flags.JOB_TUTOR)||(typeof JOBS!=='undefined'&&JOBS.any&&!!JOBS.any(G));
  const setTime=(G,E,tt)=>{ const d=Math.floor(tt/24); if(d>G.day){ G.day=d; G.weekday=wdOf(d); G.energy=100; G.flags.companion=null; G.weather=(typeof CALENDAR!=='undefined'&&CALENDAR.typhoon&&CALENDAR.typhoon(d))?'rain':(Math.random()<0.7?'clear':'cloudy'); } G.hour=tt-d*24; if(E) E.hour=G.hour; };
  /* 跳到下一個要停的時間：中間每小時跑一次手機規則（訊息照時間戳記收進來，A44）；中間冒出新的出遊、當面約就停在那裡 */
  S.breakJump=async function(GM,t,o){ o=o||{}; const G=GM.G, E=GM.E; await GM.fade(true); let n=0, tt=T(G.day,G.hour), mo=null; G.flags._repSkipLine=null;
    const repPass=x=>{ if(typeof OUT==='undefined'||typeof VAC==='undefined'||!VAC.repSkip) return; for(const q of OUT.rec(G)){ if(q.state!=='planned'||T(q.day,q.h)>x) continue; const l=VAC.repSkip(G,q); if(l){ VAC.repDone(G,q); G.flags._repSkipLine=l; } } };   /* 跳過的第二次以後的活動：記成去過、旁白換成那一句（AA_275 第 1 節）*/
    while(tt+1<t-1e-6){ tt+=1; setTime(G,E,tt); repPass(tt);
      if(typeof STORY!=='undefined'&&STORY.monthlyFunds){ const f=STORY.monthlyFunds(G); if(f){ GM.money(f.amount); mo=f; } }
      if(typeof PHONE!=='undefined'){ try{ if(typeof STORY!=='undefined'&&STORY.phoneRules) STORY.phoneRules(GM); PHONE.tick(G,out=>{ n+=out.length; }); }catch(e){ console.warn('HOME breakJump phone',e); } }
      const nx=S.breakNext(G,tt); if(nx!=null&&nx<t) t=nx; }
    setTime(G,E,t); repPass(t); if(E&&E.setWeather) E.setWeather(G.weather); if(GM.updateHUD) GM.updateHUD(); if(GM.titleCard) await GM.titleCard(dateLabel(t),o.dorm?'宿舍':'臺北的家',2200); if(!o.dorm&&typeof ADV!=='undefined') ADV.begin({background:bg()}); await GM.fade(false);   /* o.dorm：宿舍的床快轉（AA_197 1-2）*/
    if(mo&&GM.toast) GM.toast(mo.text,3800); if(n&&GM.toast) GM.toast('手機｜跳過的日子收到 '+n+' 則訊息',3800); if(n&&GM.phoneBadge) GM.phoneBadge(); if(GM.autosave) GM.autosave(); return t; };
  /* 到了表上的日子：那一天要做的（旁白、手機在 S.breakPhone）*/
  S.breakArrive=async function(GM){ const G=GM.G, now=T(G.day,G.hour), P=S.breakPts(G).filter(p=>Math.abs(T(p.day,p.h)-now)<1e-6);
    for(const p of P){ if(p.k==='lottery'||p.k==='lottery3'){ phoneTick(GM); await GM.say(null,p.k==='lottery'?'換一層樓，換一個房間。':'換一層樓，換一個房間。三年，第三個房間。'); }   /* AA_183 3-2（大二）；AA_170 第 2 節（大三，2026-10-16 改「換一層樓」）*/
      if(p.k==='sum'&&G.day===DK('2026-07-20')&&hasJob(G)) await GM.say(null,S.at(G)?'暑假的班照排。你從家裡搭捷運去上班。':'暑假的班照排。你從宿舍搭捷運去上班。'); } };   /* 大一暑假 7/20：大一下有打工的玩家多一句（AA_183 3-2）；預設留宿舍，回家住的照原句（AA_275 第 6 節）*/
  /* ===== 經濟系休學在家的時段與序章行事曆（使用者 2026-10-17 21:5x：「退宿後到法律系開學，改成在家生活＋重要日期推進」）=====
     時段：上午（到 12:00）、下午（到 18:00）、晚上（到 22:30）。「讀書」「休息」做到這個時段結束（一個時段一件；22:30 以後只能睡覺）。
     行事曆：照日期一定會有的（衝刺班 6/9～7/9 每天（AA_298：模擬考拿掉）、7/10 考前一晚、8/13 放榜、8/22 法律系宿營、8/29 搬進法律系宿舍）＋已經排定的出遊、答應的邀約；
     手機「今天」「這週」顯示（classes3d.js），快轉停在它們前面。名稱是系統字，不是劇情台詞。*/
  S.y0Slot=function(G){ const h=G.hour; if(h<5) return null; if(h<11.5) return {name:'上午',end:12}; if(h<17.5) return {name:'下午',end:18}; if(h<22) return {name:'晚上',end:22.5}; return null; };
  S.y0DateOpen=function(G){ const F=G.flags||{}; if(!F.dating_kexin||typeof STORY==='undefined'||!STORY.retakeOn||!STORY.retakeOn(G)||G.hour>=16) return false; if(typeof OUT!=='undefined'&&OUT.get&&OUT.get(G,'rt_play_'+G.day)) return false; const r=F.RT_DAY; return !(r&&r.day===G.day&&r.type==='study'); };   /* 重考期（2/15～7/10）、交往中、今天還沒約、不是讀書日 */
  S.Y0_FIXED=[['2025-01-03',21,'',{hide:true,at:0.25}],['2025-01-06',21,'',{hide:true,at:0.25}],   /* 可昕休學理由的三則私訊（AA_272 第 1 節第 6 列、第 9 節：1/3、1/6 不能快轉）：停在訊息收到以後、不寫進行事曆 */
    ['2025-06-09',9,'衝刺班（每天 09:00～21:00，6/9～7/9）',{nostop:true}],['2025-07-10',21,'考試前一晚'],['2025-07-11',7+40/60,'分科測驗',{at:0}],['2025-07-24',21,'',{hide:true,at:0.25}],['2025-08-13',10,'放榜'],['2025-08-22',8,'法律系迎新宿營'],['2025-08-29',15,'搬進法律系宿舍']];
  S.y0Cal=function(G,days){ days=days||14; const out=[], now=T(G.day,G.hour), end=T(G.day+days,24);
    for(const [k,h,t,o] of S.Y0_FIXED){ if(o&&o.hide) continue; const d=DK(k); if(d!=null&&T(d,h)>=now-1&&T(d,h)<end) out.push({day:d,h,t,fixed:true}); }
    if(typeof OUT!=='undefined'&&OUT.rec) for(const q of OUT.rec(G)) if(q.state==='planned'&&T(q.day,q.h)>=now-1&&T(q.day,q.h)<end) out.push({day:q.day,h:q.h,t:q.title||q.place||'出遊'});
    if(Array.isArray(G.invites)) for(const iv of G.invites) if(iv.state==='accepted'&&T(iv.day,iv.h)>=now-1&&T(iv.day,iv.h)<end){ const P=typeof INV!=='undefined'&&INV.place?INV.place(iv.place)||{}:{}; out.push({day:iv.day,h:iv.h,t:'和'+(typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(iv.who):iv.who)+'約在'+(P.name||'')}); }
    return out.sort((a,b)=>T(a.day,a.h)-T(b.day,b.h)); };
  S.y0CalHTML=function(G,days){ const L=S.y0Cal(G,days), esc=t=>String(t).replace(/[&<>]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;'})[c]);
    return '<div class="item"><b>行事曆</b><span class="muted">（接下來 '+(days||14)+' 天）</span>'+(L.length?L.map(q=>'<div style="margin-top:4px">'+esc(dateLabel(T(q.day,q.h)))+'　'+esc(q.t)+'</div>').join(''):'<div class="muted" style="margin-top:4px">沒有排定的事。</div>')+'</div>'; };
  S.y0FixedNext=function(G,now){ let best=null; for(const [k,h,,o] of S.Y0_FIXED){ const d=DK(k); if(d==null||(o&&o.nostop)) continue; const x=T(d,h)+(o&&o.at!=null?o.at:-0.5); if(x>now+1e-6&&(best==null||x<best)) best=x; } return best; };   /* 快轉停在固定日子前 30 分鐘 */
  /* ===== 經濟系休學在家的快轉（D99 第一優先，2026-10-17）：10/19 退宿到 8/29 十個月都住家裡，家裡選單原本只能一天一天「睡覺」。
     選項照法律系放假的快轉（到下一個有事的日子／過三天／過一週／不用了）。每 15 分鐘看一次，有下面任何一件就停在那裡：家裡要演的事件（trigger home）、
     固定核心的電話（STORY.homeCall）、該出發的出遊、當面約、手機收到要回的訊息（有選項的，不讓玩家錯過邀約）；約好的出遊、當面約照 breakNext 提早停。
     手機規則每小時跑一次（訊息照時間戳記收進來）。上限：8/29 早上（轉法律系那天）。跳過只有日期字卡、不加旁白（台詞歸 AA，D79）*/
  S.y0FfEnd=()=>{ const d=DK('2025-08-29'); return d!=null?T(d,5):null; };
  S.y0Stop=function(G,p0){ if(S.homeEvent(G)) return 'event'; const c=typeof STORY!=='undefined'&&STORY.homeCall?STORY.homeCall(G):null; if(c&&c.q) return 'call';
    if(S.dueOuting(G)) return 'out'; if(S.dueInvites(G).length) return 'inv'; if(typeof PHONE!=='undefined'&&PHONE.pending&&PHONE.pending(G).length>p0) return 'msg'; return null; };
  S.y0ffOpts=function(G){ if(!S.baseMode(G)) return null; const now=T(G.day,G.hour), end=S.y0FfEnd(); if(end==null||end<=now+0.5) return null;
    const dn=Math.min(T(G.day+30,8.5),end), d3=Math.min(T(G.day+3,8.5),end), d7=Math.min(T(G.day+7,8.5),end);
    return [{t:'到下一個有事的日子',hint:'有事就停（最多到 '+dateLabel(dn)+'）',to:dn},{t:'過三天',hint:'到 '+dateLabel(d3)+'（中間有事會先停）',to:d3},{t:'過一週',hint:'到 '+dateLabel(d7)+'（中間有事會先停）',to:d7},{t:'不用了',to:null}]; };
  S.y0Jump=async function(GM,t){ const G=GM.G, E=GM.E; await GM.fade(true); let n=0, mo=null, why=null, tt=T(G.day,G.hour); const p0=typeof PHONE!=='undefined'&&PHONE.pending?PHONE.pending(G).length:0;
    { const nx=S.breakNext(G,tt); if(nx!=null&&nx<t) t=nx; const fx=S.y0FixedNext(G,tt); if(fx!=null&&fx<t) t=fx; }
    const ra=DK('2025-02-15'), rb=DK('2025-07-10'); let dPrev=G.day; const cards=[], dStart=G.day, tStart=T(G.day,G.hour);   /* brief：同一天、不到一小時（回完手機接著跳）不再出一次「臺北的家」字卡（BB-C 10-18）*/   /* AA_272 第 2 節：重考期快轉跨過的日子照「讀書日」算（retake:study；E36 的旁白讀它）。cards：跨過的衝刺班日子卡（AA_298 第 1 節）*/
    while(tt+0.25<=t+1e-6){ tt=Math.round((tt+0.25)*4)/4; setTime(G,E,tt);
      if(G.day!==dPrev){ dPrev=G.day; const play=typeof ECONFF!=='undefined'&&ECONFF.on2&&ECONFF.on2(G)&&ECONFF.PLAY_DAYS.some(k=>DK(k)===G.day); if(!play&&ra!=null&&rb!=null&&G.day>ra&&G.day<=rb&&typeof EVENTS!=='undefined'&&EVENTS.habit) EVENTS.habit('retake:study'); const cc=typeof ECONFF!=='undefined'&&ECONFF.cramCard?ECONFF.cramCard(G):null; if(cc) cards.push({t:T(G.day,9),c:cc}); }   /* 事件模式：玩樂日（R3、R6、R7）不記讀書日（AA_292 第 6 節）*/
      if(Math.abs(tt-Math.round(tt))<1e-6){
        if(typeof STORY!=='undefined'&&STORY.monthlyFunds){ const f=STORY.monthlyFunds(G); if(f){ GM.money(f.amount); mo=f; } }
        if(typeof PHONE!=='undefined'){ try{ if(typeof STORY!=='undefined'&&STORY.phoneRules) STORY.phoneRules(GM); PHONE.tick(G,out=>{ n+=out.length; }); }catch(e){ console.warn('HOME y0Jump phone',e); } } }
      const nx=S.breakNext(G,tt); if(nx!=null&&nx<t) t=nx;
      why=S.y0Stop(G,p0); if(why) break; if(n>0){ why='msg'; break; } }   /* 跳的途中收到任何一則訊息就停：直接打開那一段、按「跳過」繼續跳（使用者 10-18 15:4x：「如果中間顯示簡訊跳出來按它可以繼續跳」；原本只有要回的才停、其他跳完才說「收到 N 則」）*/
    if(!why&&T(G.day,G.hour)<t) setTime(G,E,t);
    if(GM.titleCard) for(const x of cards) if(x.t<T(G.day,G.hour)-0.01) await GM.titleCard(dateLabel(x.t),x.c.t,2400);   /* 衝刺班：中間跳過的日子只出日期卡＋cram_cards 那一行 */
    const atCram=typeof ECONFF!=='undefined'&&ECONFF.cramDay&&ECONFF.cramDay(G)&&G.hour>=9&&G.hour<21;
    if(E&&E.setWeather) E.setWeather(G.weather); if(GM.updateHUD) GM.updateHUD(); const cl=typeof ECONFF!=='undefined'&&ECONFF.cardLine?ECONFF.cardLine(G,dStart,G.day):null, brief=G.day===dStart&&T(G.day,G.hour)-tStart<1&&!cl; if(GM.titleCard&&!brief) await GM.titleCard(dateLabel(T(G.day,G.hour)),cl||(atCram?'補習班':'臺北的家'),cl?3200:2200);   /* AA_300 第 4 節：跳過的日子一句 */ if(typeof ADV!=='undefined') ADV.begin({background:atCram&&typeof OUT!=='undefined'&&OUT.bg?OUT.bg('cram_class'):bg()}); await GM.fade(false);
    if(mo&&GM.toast) GM.toast(mo.text,3800); /* 收到 N 則：改成途中一則一則停下來看（上面 why='msg'），跳完不再統計 */ if(n&&GM.phoneBadge) GM.phoneBadge(); if(GM.autosave) GM.autosave(); return why||'end'; };
  /* ===== 快轉（AA_197 1-2）：宿舍的床、家裡的選單。到下一個有事的日子／過三天／過一週／不用了；中間有事（表上的日子、成績公布、出遊、當面約）先停 =====
     快轉的上限：放假最後一天 12:00（主線 3 搬房間那天＝那個時間）。旁白：家裡＝AA_183 第 4 節、宿舍＝4-b */
  S.ffEnd=function(G,B){ B=B||S.lawBreak(G); if(!B) return null; return Math.min(S.breakEnd(G,B),T(B.to,12)); };
  S.ffOpts=function(G){ const B=S.lawBreak(G); if(!B||(G.stage||'law')!=='law') return null; const now=T(G.day,G.hour), end=S.ffEnd(G,B); if(end==null||end<=now+0.5) return null;
    const nx=S.breakNext(G,now), to=nx!=null&&nx<end?nx:end, d3=Math.min(T(G.day+3,8.5),end), d7=Math.min(T(G.day+7,8.5),end);
    return [{t:'到下一個有事的日子',hint:(nx!=null&&nx<end?'跳到 ':'沒有排定的事：到 ')+dateLabel(to),to},{t:'過三天',hint:'到 '+dateLabel(d3)+'（中間有事會先停）',to:d3},{t:'過一週',hint:'到 '+dateLabel(d7)+'（中間有事會先停）',to:d7},{t:'不用了',to:null}]; };
  S.ffMenu=async function(GM,where){ const G=GM.G; if(typeof ECONFF!=='undefined'&&ECONFF.sleepJump&&await ECONFF.sleepJump(GM)) return true; const O=S.ffOpts(G); if(!O) return false; const dorm=where==='dorm'; if(dorm) GM.sceneBegin();
    try{ const o=O[await GM.choose(O.map(x=>({t:x.t,hint:x.hint})),{menu:true})]; if(!o||o.to==null||o.to<=T(G.day,G.hour)) return false;
      const d0=G.day, t0=T(G.day,G.hour), t1=await S.breakJump(GM,o.to,{dorm}); { const rl=G.flags._repSkipLine; G.flags._repSkipLine=null; const l=rl||S.breakSkipLine(G,t0,t1,{dorm}); if(l) await GM.say(null,l); }   /* 宿舍版旁白 AA_183 4-b；跳過第二次以後的活動＝那張卡的一句（AA_275 第 1 節）*/
      await S.breakArrive(GM); if(G.day>d0&&typeof CLS!=='undefined'&&CLS.morning&&typeof CALENDAR!=='undefined'){ try{ await CLS.morning(GM); }catch(e){ console.warn('HOME ff CLS.morning',e); } }   /* 成績、選課（放假最後一天）照早上那一套 */
      return true; }
    finally{ if(dorm) GM.sceneEnd(); } };
  /* 寒假第一天早上在宿舍醒來：系統字一次（AA_197 1-3）*/
  S.BREAK_NOTE='寒假宿舍照常開放。要回家的話，從選單選『回家』。';
  S.breakNote=function(GM){ const G=GM.G, B=S.lawBreak(G); if(!B||B.kind!=='winter'||S.at(G)) return false; const H=S.rec(G); if(H.bnote===B.key) return false; H.bnote=B.key; if(GM.toast) GM.toast(S.BREAK_NOTE,5200); return true; };
  /* 除夕（AA_197 1-2；AA-C 11:40）：15:00 媽媽在家人群組「幾點回來？」；17:00 以後還在宿舍（房間、走廊）＝媽媽「飯快好了。」→ 字卡回家。不在宿舍（約會、校園）等他回宿舍 */
  S.eveDay=function(B){ if(!B||B.kind!=='winter'||typeof CALENDAR==='undefined'||!CALENDAR.holiday) return null; for(let d=B.from;d<=B.to;d++) if(CALENDAR.holiday(d)==='除夕') return d; return null; };
  S.eveDue=function(G){ const B=S.lawBreak(G); if(!B||S.at(G)||S.baseMode(G)) return false; const e=S.eveDay(B); return e!=null&&G.day===e&&G.hour>=17&&(G.zone==='dorm'||G.zone==='dorm_hall'); };
  S.eveGo=async function(GM){ const G=GM.G; if(!S.eveDue(G)) return false; if(typeof PHONE!=='undefined'){ PHONE.join(G,'home','家人'); PHONE.at(G,G.day,G.hour,[{th:'g:home',from:'mom',name:'媽媽',text:'飯快好了。'}],'eve_food_'+G.day); phoneTick(GM); }
    if(GM.sleep) await GM.sleep(1200); return await S.go(GM); };
  /* 在家演的事件：trigger 'home'，和在哪裡都可以演的 auto（location 'any'，例：除夕的主線 2）*/
  S.breakEvent=G=>{ if(typeof STORY_EVENTS==='undefined'||typeof EVENTS==='undefined') return null; return STORY_EVENTS.find(e=>(e.trigger==='home'||(e.trigger==='auto'&&e.location==='any'&&!e.near&&!e.spawn))&&EVENTS.check(e))||null; };
  async function breakRound(GM){ const G=GM.G, H=S.rec(G); const ev=S.breakEvent(G); if(ev){ await EVENTS.run(ev); if(H.at&&typeof ADV!=='undefined') ADV.begin({background:bg()}); return H.at; }
    const h=G.hour, ateToday=H.eat&&H.eat.day===G.day, nx=S.breakNext(G), O=[], q=S.dueOuting(G);
    if(q){ const tr=OUT.trip?OUT.trip(G,q,true):{travel:q.travel||''}; O.push({t:(q.verb||'出發')+'：'+q.title,hint:(q.verb==='接起來'||q.place==='視訊'?'':'從家裡出發　')+(q.place||'')+'　'+hm(q.h)+(tr.travel?'　'+tr.travel:''),k:'out',q}); }
    for(const iv of S.dueInvites(G)){ const P=INV.place(iv.place)||{}; O.push({t:'出發：和'+(typeof SOCIAL!=='undefined'?SOCIAL.displayName(iv.who):iv.who)+'約在'+(P.name||''),hint:hm(iv.h)+'　捷運＋公車 約 30 分鐘',k:'inv',iv,P}); }
    if(!ateToday&&h>=18.5&&h<20) O.push({t:'吃晚餐',k:'eat'});
    if(S.ffOpts(G)) O.push({t:'快轉',hint:'到下一個有事的日子、過三天、過一週',k:'ff'});   /* AA_197 1-2：快轉是玩家自己選的（取代「過幾天」）*/
    O.push({t:'存檔',hint:'存到存檔欄位',k:'save'});
    O.push({t:'睡覺',hint:'隔天早上在家醒來',k:'sleep'});
    O.push({t:'回宿舍住',hint:'捷運＋公車 約 40 分鐘',k:'dorm'});   /* AA_197 1-3：隨時可以再回宿舍（房間還在）*/
    const o=O[await GM.choose(O,{menu:true})]||O.find(x=>x.k==='sleep');
    if(o.k==='save'){ if(GM.saveMenu) await GM.saveMenu(); return H.at; }
    if(o.k==='out'){ H.at=false; if(typeof ADV!=='undefined'&&ADV.end) ADV.end(); const video=o.q.verb==='接起來'||o.q.place==='視訊'; const ok=await OUT.go(GM,o.q,{fromHome:true});
      if(ok&&!o.q.goto&&S.breakMode(G)){ if(!video){ await GM.fade(true); if(GM.titleCard) await GM.titleCard('回臺北的家','捷運＋公車 約 30 分鐘',2000); GM.advance(0.5); } H.at=true; H.day=G.day; if(typeof ADV!=='undefined') ADV.begin({background:bg()}); if(!video) await GM.fade(false); return true; }   /* 出遊演完回家；視訊不用出門 */
      if(ok&&o.q.goto&&GM.toast) GM.toast('要回家：手機「地點」→ 回臺北的家（或走到校門口）。',5200);   /* 到現場的出遊演完人留在那裡（2026-10-18 BB-C）*/
      return false; }
    if(o.k==='inv'){ await S.leaveTo(GM,o.P); return false; }
    if(o.k==='eat'){ if(await confirmMiss(GM,G.hour+1)) await S.dinner(GM); return H.at; }   /* BB_214 第 1 點：吃晚餐一小時，會錯過約好的出遊、當面約要先問 */
    if(o.k==='ff'){ await S.ffMenu(GM,'home'); return H.at; }
    if(o.k==='dorm'){ H.lbreak=null; H.bskip=null; await S.back(GM); return false; }
    { const wake=T(G.day+1,8.5); if(nx!=null&&nx<wake){ await S.breakJump(GM,nx); await S.breakArrive(GM); } else await S.sleep(GM); S.rec(G).wakeAsk=null; }   /* 睡覺會經過要停的時間（例：除夕 12:00 以前不會，出遊的晚上會）：停在那裡 */
    return H.at; }
  /* 放假的手機（AA_183 3-2）：7/9 語彤的生日（12:00 麵店團群組小語；不在群組、和語彤有點熟以上＝她的私訊）、7/15 10:00 大二宿舍抽籤（一定抽中）＋10:05 阿哲。
     story3d.js 的 S.phoneRules 每次呼叫（在家、在外面都一樣；跳過時間的時候每小時一次）*/
  S.breakPhone=function(GM){ const G=GM.G; if(typeof PHONE==='undefined'||(G.stage||'law')!=='law') return; const now=T(G.day,G.hour);
    /* 暑住（AA_197 1-3）：大一～大三下學期最後一天 12:00 宿舍系統問；選的結果記 G.home.stay[暑假]＝'stay'／'home'（沒回＝續住）*/
    { const H=S.rec(G), F=G.flags; if(typeof F.SUMMER_PICK==='string'){ const m=F.SUMMER_PICK.split(':'); if(m.length===2){ (H.stay||(H.stay={}))[m[0]]=m[1]; } delete F.SUMMER_PICK; }
      const T0=typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(G.day):null;
      if(T0&&/^Y[1-3]S2$/.test(T0.id)&&CALENDAR.termDays){ const r=CALENDAR.termDays(T0.id), key=T0.id.slice(0,2)+'S', tag='summer_stay_'+key, nb=S.breakOf(r.to+1);
        if(r&&G.day===r.to&&now>=T(r.to,12)&&!PHONE.sent(G,tag)){ PHONE.join(G,'dorm','宿舍系統'); PHONE.at(G,r.to,12,[{th:'g:dorm',text:'暑假住宿：可以續住到開學前。要續住嗎？',ask:{id:tag,until:nb?T(nb.to,12):T(r.to+60,0),opts:[{t:'續住',set:{SUMMER_PICK:key+':stay'}},{t:'暑假回家住',set:{SUMMER_PICK:key+':home'}}]}}],tag); } } }
    /* 除夕 15:00（AA_197 1-2）：人不在家＝媽媽問「幾點回來？」 */
    { const B=S.lawBreak(G), e=S.eveDay(B); if(e!=null&&G.day===e&&now>=T(e,15)&&!S.at(G)&&!S.baseMode(G)&&!PHONE.sent(G,'eve_ask_'+e)){ PHONE.join(G,'home','家人'); PHONE.at(G,e,15,[{th:'g:home',from:'mom',name:'媽媽',text:'幾點回來？'}],'eve_ask_'+e); } }
    { const d=DK('2026-07-09'); if(d!=null&&now>=T(d,12)&&now<T(d+1,0)&&!PHONE.sent(G,'yt_bday_y1')){ const reply={from:'heroine_03',text:'……謝謝。阿姨說要請你吃滷蛋。下次來。'}, opt={t:'傳一句生日快樂',post:'生日快樂。',say:[reply],set:{YT_BDAY_Y1:true}};
        if(PHONE.inGroup(G,'noodle_team')) PHONE.at(G,d,12,[{th:'g:noodle_team',from:'yu',text:'今天語彤生日！',ask:{id:'yt_bday_y1',until:T(d+1,0),opts:[Object.assign({},opt,{say:[Object.assign({th:'g:noodle_team'},reply)]})]}}],'yt_bday_y1');
        else if(typeof SOCIAL!=='undefined'&&SOCIAL.STAGES.indexOf(SOCIAL.stage('heroine_03'))>=SOCIAL.STAGES.indexOf('FAMILIAR')) PHONE.at(G,d,12,[{th:'p:heroine_03',text:'今天是語彤的生日。',ask:{id:'yt_bday_y1',until:T(d+1,0),opts:[opt]}}],'yt_bday_y1'); } }
    { const d=DK('2026-07-15'), d9=DK('2026-09-07'); if(d!=null&&now>=T(d,10)&&(d9==null||now<T(d9,0))&&!PHONE.sent(G,'dorm_lottery_y2')){   /* 只在那個暑假（9/6 搬進去以前）：之後才讀到的舊存檔不補 */ PHONE.join(G,'dorm','宿舍系統'); PHONE.at(G,d,10,[{th:'g:dorm',text:'大二宿舍抽籤結果：已分配。請於 9/6 前完成入住。'}],'dorm_lottery_y2');
        } }
    /* 每年 7/15 10:05 抽籤的群組訊息（AA_208 第 9 節 7f2cd8d8，回 AA_275 第 11 點）：大二 312 阿哲、柏翰同房；大三 507、大四 409 只有柏翰同房，阿哲同一棟二樓。
       不在麵店團群組、和阿哲 FAMILIAR 以上：阿哲私訊同樣的句子（柏翰那句只在群組）。只在那個暑假（9/7 以前）；舊的「我們還是不同棟」不用了（大一同房） */
    for(const [y,tag] of [[2026,'dorm_lottery_y2_zhe'],[2027,'dorm_lottery_y3_zhe'],[2028,'dorm_lottery_y4_zhe']]){ const d=DK(y+'-07-15'), d9=DK(y+'-09-07'); if(d==null||now<T(d,10+5/60)||(d9!=null&&now>=T(d9,0))||PHONE.sent(G,tag)) continue;
      const ge=!!G.flags.ZHE_CALLS_GE, Z=y===2026?['抽到了！',ge?'哥我們又同一間！！':'欸我們又同一間！！']:y===2027?['抽到了','我二樓','你們兩個五樓 同一棟啦 一樣找得到我']:['抽到了','我又二樓','你們兩個又同一間喔 好啦'], B=y===2026?'我也是。312。':y===2027?'507。':'409。';
      const famZhe=typeof SOCIAL!=='undefined'&&SOCIAL.STAGES&&SOCIAL.has&&SOCIAL.has('zhe','FIRST_MET')&&SOCIAL.STAGES.indexOf(SOCIAL.stage('zhe'))>=SOCIAL.STAGES.indexOf('FAMILIAR');
      if(PHONE.inGroup(G,'noodle_team')) PHONE.at(G,d,10+5/60,Z.map(t=>({th:'g:noodle_team',from:'zhe',text:t})).concat([{th:'g:noodle_team',from:'classmate_bohan',text:B}]),tag);
      else if(famZhe) PHONE.at(G,d,10+5/60,Z.map(t=>({th:'p:zhe',from:'zhe',text:t})),tag); } };
  /* A3 搬家不能錯過（AA_154 A46 ①）：3/29 以後、還沒搬、人在家（週末回家那一套）＝下一輪選單（含起床選單）之前先回宿舍演 A3，演完搬回家（HOME.moveOut）。旁白 AA 寫 */
  S.a3Due=G=>{ const F=G.flags||{}; if((G.stage||'law')!=='econ'||F.LEAVE_WEEK!==6||F.Y0_MOVED_OUT||(G.events&&G.events.done&&G.events.done.ev_y0_a3)) return false; const d=DK(typeof STORY!=='undefined'&&STORY.Y0_MOVE_DAY||'2024-10-31'); return d!=null&&G.day>=d; };   /* 退宿 10/19（AA_218 第 11 節）*/
  S.a3FromHome=async function(GM){ const G=GM.G, H=S.rec(G), d=DK(typeof STORY!=='undefined'&&STORY.Y0_MOVE_DAY||'2024-10-31'), ev=typeof STORY_EVENTS!=='undefined'?STORY_EVENTS.find(e=>e.id==='ev_y0_a3'):null; if(!ev) return false; GM.sceneBegin();
    try{ if(typeof ADV!=='undefined') ADV.begin({background:bg()}); await GM.say(null,G.day===d?'今天要搬出宿舍。阿勳說他十點會在房間。':'宿舍還沒退完。阿勳說，箱子還在房間等你。');
      await GM.fade(true); if(GM.titleCard) await GM.titleCard('回宿舍','捷運＋公車 約 40 分鐘',2400); GM.advance(G.day===d?Math.max(0.7,10-G.hour):0.7); H.at=false; H.wakeAsk=null;   /* 退宿那天（10/19）：阿勳十點才在房間（AA-B 抽查）*/ if(typeof ADV!=='undefined'&&ADV.end) ADV.end();
      if(GM.enter) await GM.enter('dorm',{x:0,z:2.4,yaw:Math.PI}); await GM.fade(false); }
    finally{ GM.sceneEnd(); }
    await EVENTS.run(ev); return true; };   /* A3 的 after 接 HOME.moveOut（搬回家、家裡的選單）*/
  /* ★主線 3 第二個房間（AA_177 第 7 節）：9/6 以後在臺北的家＝旁白一句 → 字卡「回宿舍」→ 新房間 → 拆箱（STORY.unboxY2）*/
  S.roomY2FromHome=async function(GM){ const G=GM.G, H=S.rec(G); GM.sceneBegin();
    try{ if(typeof ADV!=='undefined') ADV.begin({background:bg()}); await GM.say(null,'明天開學。今天搬進新的房間。');
      await GM.fade(true); if(GM.titleCard) await GM.titleCard('回宿舍','捷運＋公車 約 40 分鐘',2400); GM.advance(0.7); H.at=false; H.wakeAsk=null; H.lbreak=null; H.bskip=null; if(typeof ADV!=='undefined'&&ADV.end) ADV.end();
      G.flags.ROOM_Y2_MOVING=true; if(GM.enter) await GM.enter('dorm',{x:0,z:2.4,yaw:Math.PI}); await GM.fade(false); }   /* 房間直接蓋成 312（zones3d.js dormSetKey）*/
    finally{ GM.sceneEnd(); }
    if(typeof STORY!=='undefined'&&STORY.unboxY2) await STORY.unboxY2(GM); return true; };
  /* ★主線 5 第三個房間（1A-03，AA_315）：2027-09-05 以後在臺北的家＝旁白一句 → 字卡「回宿舍」→ 507 → 拆箱（STORY.unboxY3）*/
  S.roomY3FromHome=async function(GM){ const G=GM.G, H=S.rec(G); GM.sceneBegin();
    try{ if(typeof ADV!=='undefined') ADV.begin({background:bg()}); await GM.say(null,'（明天開學。今天搬進第三個房間。）');
      await GM.fade(true); if(GM.titleCard){ await GM.titleCard('回宿舍','捷運＋公車 約 40 分鐘',2400); await GM.titleCard('搬到新的房間','五樓 507 號房',2000); } GM.advance(0.7); H.at=false; H.wakeAsk=null; H.lbreak=null; H.bskip=null; if(typeof ADV!=='undefined'&&ADV.end) ADV.end();
      G.flags.ROOM_Y3_MOVING=true; if(GM.enter) await GM.enter('dorm',{x:0,z:2.4,yaw:Math.PI}); await GM.fade(false); }   /* 房間直接蓋成 507（zones3d.js dormSetKey）、紙箱封好 */
    finally{ GM.sceneEnd(); }
    if(typeof STORY!=='undefined'&&STORY.unboxY3) await STORY.unboxY3(GM); return true; };
  S.loop=async function(GM){ const G=GM.G, H=S.rec(G); if(busy) return; busy=true; GM.sceneBegin(); let a3=false, toLaw=false, roomY2=false, roomY3=false, backB=false, exch=false, coldBack=false;
    try{ if(typeof ADV!=='undefined') ADV.begin({background:bg()});
      for(let guard=0;guard<60&&H.at;guard++){ phoneTick(GM); S.postponeMissed(G); if(S.a3Due(G)){ a3=true; break; } if(typeof STORY!=='undefined'&&STORY.toLawDue&&STORY.toLawDue(G)){ toLaw=true; break; } if(typeof STORY!=='undefined'&&STORY.roomY2Due&&STORY.roomY2Due(G)){ roomY2=true; break; } if(typeof STORY!=='undefined'&&STORY.roomY3Due&&STORY.roomY3Due(G)){ roomY3=true; break; } if(typeof EXCH!=='undefined'&&EXCH.departDue&&EXCH.departDue(G)){ exch=true; break; }   /* 交換出發日（src/exchange3d.js）*/
        if(typeof STORY!=='undefined'&&STORY.coldHomeBackDue&&STORY.coldHomeBackDue(G)){ coldBack=true; break; }   /* 1A-04 感冒的那一週：10/24（日）18:00 還在家＝提早回宿舍（AA_315 3-2）*/
        if(typeof STORY!=='undefined'&&STORY.coldSneezeDue&&STORY.coldSneezeDue(G,true)){ await STORY.coldWeekSneeze(GM); continue; }   /* 1A-04：10/23 在家醒來也打噴嚏（起床選單之前，AA_315 3-1）*/
        if(H.lbreak&&!H.winter&&!H.base){ if(S.breakMode(G)){ if(!(await breakRound(GM))) break; continue; } H.lbreak=null; H.bskip=null; }   /* AA_197 1-3：過了放假最後一天 21:30＝接著照週日晚上那一套（不再強制回宿舍）。舊註解：法律系的寒暑假（AA_183）；過了回宿舍的時間＝回宿舍 */
        if(!H.winter&&!H.base&&S.breakStartDue(G)){ await S.breakStart(GM); continue; }   /* 週末回家住到放假第一天的早上：就地開始放假模式 */
        if(!H.winter&&!H.base&&!H.lbreak){ const B=S.lawBreak(G); if(B&&T(G.day,G.hour)<S.breakEnd(G,B)){ H.lbreak=B.key; H.brk=B.key; if(!H.bskip||H.bskip.key!==B.key) H.bskip={key:B.key,n:0,last:-1}; continue; } }   /* 放假中人在家（週末回家住到放假、讀檔）＝住家裡（AA_197 1-3）*/
        if(H.winter){ if(!(await winterRound(GM))) break; continue; } if(H.base&&S.baseMode(G)){ if(!(await baseRound(GM))) break; continue; } if(H.wakeAsk===G.day){ if(await S.homeWake(GM)) break; continue; } const h=G.hour, late=G.weekday===0&&h>=21.5, ateToday=H.eat&&H.eat.day===G.day;
        const sun=G.weekday===0, wk=S.wakeFor(G,G.day+1,sun?1.5:50/60), monExam=sun&&typeof CLS!=='undefined'&&CLS.dayItems&&CLS.dayItems(Object.assign({},G,{day:G.day+1}),G.day+1).some((q,i)=>i===0&&q.exam==='final');
        if(late){ await GM.say(MOM,'明天有課吧。早點回去。'); if(!monExam&&(await GM.choose([{t:'回宿舍',hint:'捷運＋公車 約 40 分鐘'},{t:'今晚住家裡，明天一早直接去學校',hint:'明天 '+hm(wk!=null?wk:8.5)+' 在家醒來'}]))===1){ H.stayMon=G.day+1; await S.sleep(GM,wk); continue; } await S.back(GM); break; }   /* 週日 21:30 以後：該回宿舍了（DL-05：也可以住家裡，週一直接去學校；週一早上期末考就不行）*/
        const O=[], q=S.dueOuting(G);
        if(q) O.push({t:(q.verb||'出發')+'：'+q.title,hint:'從家裡出發　'+(q.place||'')+'　'+hm(q.h)+(q.travel?'　'+q.travel:''),k:'out',q});   /* G48：出遊從家裡出發（不加取車時間）*/
        for(const iv of S.dueInvites(G)){ const P=INV.place(iv.place)||{}; O.push({t:'出發：和'+(typeof SOCIAL!=='undefined'?SOCIAL.displayName(iv.who):iv.who)+'約在'+(P.name||''),hint:hm(iv.h)+'　捷運＋公車 約 40 分鐘',k:'inv',iv,P}); }
        if(!ateToday&&h>=18.5&&h<20) O.push({t:'吃晚餐',k:'eat'}); else if(!ateToday&&h>=16&&h<18.5) O.push({t:'等吃晚餐',hint:'到 18:30',k:'wait'});
        O.push({t:'存檔',hint:'存到存檔欄位',k:'save'});   /* 在家也能存檔（2026-10-18 使用者：「在家也不能存檔很麻煩」）*/ 
        O.push({t:'睡覺',hint:sun?'明天有課：先回宿舍再睡':(wk!=null?'明天 '+hm(wk)+' 在家醒來（學校有事）':'隔天早上在家醒來'),k:'sleep'});
        if(sun) O.push({t:'今晚住家裡，明天一早直接去學校',hint:monExam?'明天早上期末考，回宿舍睡吧':'明天 '+hm(wk!=null?wk:8.5)+' 在家醒來，坐捷運＋公車約 40 分鐘',dim:monExam,k:'stay'});   /* DL-05（AA_160 1-6）：週日晚上可以住家裡 */ if(!G.flags.carWithMe) O.push({t:'去玄關拿車鑰匙（取車）',k:'car'}); O.push({t:'在家休息一下',hint:'一小時',k:'rest'}); O.push({t:'回宿舍',hint:'捷運＋公車 約 40 分鐘',k:'back'});
        const o=O[await GM.choose(O,{menu:true})]||O[O.length-1];
        if(o.k==='save'){ if(GM.saveMenu) await GM.saveMenu(); continue; }
        if(o.k==='out'){ H.at=false; if(typeof ADV!=='undefined'&&ADV.end) ADV.end(); await OUT.go(GM,o.q); break; }
        else if(o.k==='inv'){ await S.leaveTo(GM,o.P); break; }
        else if(o.k==='eat') await S.dinner(GM); else if(o.k==='wait'){ if(await confirmMiss(GM,18.5)) GM.advance(Math.max(0,18.5-G.hour)); }
        else if(o.k==='sleep'){ if(sun){ await S.back(GM); await S.sleepAtDorm(GM); break; } if(await confirmMiss(GM,24+(wk!=null?wk:8.5))) await S.sleep(GM,wk); }
        else if(o.k==='stay'){ if(o.dim){ if(GM.toast) GM.toast(o.hint,3000); } else if(await confirmMiss(GM,24+(wk!=null?wk:8.5))){ H.stayMon=G.day+1; await S.sleep(GM,wk); } }   /* 宿舍那一晚的夜間事件照「人不在宿舍」不演（和出遊過夜一樣）*/   /* G48：週日晚上在家睡覺＝先回宿舍（不在家睡到週一）*/
        else if(o.k==='car') await S.takeCar(GM);
        else if(o.k==='rest'){ if(await confirmMiss(GM,G.hour+1)){ GM.advance(1); } } else { await S.back(GM); break; } } }
    finally{ busy=false; GM.sceneEnd(); }
    if(a3) await S.a3FromHome(GM); if(toLaw) await STORY.toLaw(GM); if(roomY2) await S.roomY2FromHome(GM); if(roomY3) await S.roomY3FromHome(GM); if(backB) await S.breakBack(GM); if(exch) await EXCH.depart(GM); if(coldBack) await S.coldBack(GM); };   /* 經濟系 → 法律系（8/31 早上，AA_154 2-4b）*/
  /* 1A-04 感冒的那一週（AA_315 3-2）：10/24（日）18:00 人還在家＝旁白「（後天要考試。你提早回宿舍。）」→ 字卡「回宿舍」（AA_176 R8）→ 宿舍房間（21:30 那一晚在 story3d.js）*/
  S.coldBack=async function(GM){ const G=GM.G, H=S.rec(G); GM.sceneBegin(); try{ if(typeof ADV!=='undefined') ADV.begin({background:bg()}); await GM.say(null,'（後天要考試。你提早回宿舍。）');
      await GM.fade(true); if(GM.titleCard) await GM.titleCard('回宿舍','捷運＋公車 約 40 分鐘',2400); GM.advance(0.7); H.at=false; H.wakeAsk=null; H.stayMon=null; if(typeof ADV!=='undefined'&&ADV.end) ADV.end(); }
    finally { GM.sceneEnd(); } await GM.enter('dorm',{x:0,z:2.4,yaw:Math.PI}); await GM.fade(false); };
  /* 回家：轉場 → 到家（媽媽一句）→ 選單 */
  S.go=async function(GM){ const G=GM.G; if(!S.canGo(G)||S.at(G)) return false; const H=S.rec(G); GM.sceneBegin();
    try{ const base=S.livesHome(G); await GM.fade(true); if(GM.titleCard) await GM.titleCard('回臺北的家',base?'捷運＋公車 約 30 分鐘':'捷運＋公車 約 40 分鐘',2400); GM.advance(base?0.5:0.7); H.at=true; H.day=G.day; if(S.baseMode(G)) H.base=true;
      { const B=S.lawBreak(G); if(B&&!H.base&&!H.winter&&T(G.day,G.hour)<S.breakEnd(G,B)){ H.lbreak=B.key; H.brk=B.key; if(!H.bskip||H.bskip.key!==B.key) H.bskip={key:B.key,n:0,last:-1}; } }   /* 放假中回家＝住家裡（AA_197 1-3；選單有「快轉」「回宿舍住」）*/
      if(typeof ADV!=='undefined') ADV.begin({background:bg()}); await GM.fade(false); await GM.say(null,'（臺北的家。'+hm(G.hour)+'。）'); await say(GM,S.pick(G,'arrive'),MOM); if(GM.autosave) GM.autosave(); }
    finally{ GM.sceneEnd(); }
    await S.loop(GM); return true; };
  /* 回宿舍：媽媽一句 → 轉場 → 宿舍房間 */
  S.back=async function(GM){ const G=GM.G, H=S.rec(G); await say(GM,S.pick(G,'back'),MOM); await GM.fade(true); GM.advance(0.7); H.at=false; if(typeof ADV!=='undefined'&&ADV.end) ADV.end();
    if(GM.caption) GM.caption('','回到宿舍。',2200); await GM.enter('dorm',{x:0,z:2.4,yaw:Math.PI}); };
  /* 從家裡去當面約的地方（G48）：轉場（捷運＋公車）→ 那個地方；見面照 INV 原本的流程 */
  S.leaveTo=async function(GM,P){ const G=GM.G, H=S.rec(G), base=S.livesHome(G); await GM.fade(true); if(GM.titleCard) await GM.titleCard(P.name||'出發',base?'捷運＋公車 約 30 分鐘':'捷運＋公車 約 40 分鐘',2000); GM.advance(base?0.5:0.7);   /* 休學以後住家裡＝30 分鐘（AA_154 1-3b、A46 ②）*/ H.at=false; if(typeof ADV!=='undefined'&&ADV.end) ADV.end();
    await GM.enter(P.zone||'campus',P.spawn||undefined); };
  /* 週日晚上回到宿舍以後直接睡（床的「睡覺」第一個選項：明天早上）*/
  S.sleepAtDorm=async function(GM){ if(typeof STORY==='undefined'||!STORY.bedOptions||!STORY.sleepNow) return; const o=STORY.bedOptions(GM.G).find(x=>x.kind==='sleep'); if(o) await STORY.sleepNow(GM,o.wake,o.alarm); };
  /* 讀檔時人在家裡：回到家的選單（story3d.js 的 S.tick）*/
  S.tick=function(GM){ const G=GM.G; if(!S.at(G)||busy) return; S.loop(GM).catch(e=>{ console.warn('HOME.loop',e); busy=false; }); };
  /* 家人群組（週四 20:00）：story3d.js 的 S.phoneRules 每次呼叫 */
  S.phoneRules=function(GM){ const G=GM.G; if(typeof PHONE==='undefined'||!L()) return; const T=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null; if(!T||(typeof STORY!=='undefined'&&STORY.mainDay?STORY.mainDay(G):G.day)<2) return;
    PHONE.join(G,'home','家人'); const th='g:home', tag='home_ask_'+G.day;
    if(G.weekday===4&&G.hour>=20&&!PHONE.sent(G,tag)){ const GL=(L().group||[]).filter(x=>!(S.livesHome(G)&&S.HOME_SKIP.group.includes(x.t))), g=GL[(G.day/7|0)%(GL.length||1)]; const R=L().groupReply||{};   /* 住在家裡不問「這週回來吃飯嗎」（AA_298 第 4 節）*/
      PHONE.at(G,G.day,20,[{th,from:'mom',name:'媽媽',text:g.t,ask:{id:tag,until:G.day*24+20+2,opts:[{t:'會回去',say:[{from:'mom',name:'媽媽',text:(R.yes||['好'])[0]},{from:'mom',name:'媽媽',text:'（愛心貼圖）'}]},{t:'這週不回',say:[{from:'mom',name:'媽媽',text:(R.no||['好 那下週'])[0]}]}]}}],tag); }
    for(const m of (G.msgs||[])){ if(!m.ask||!/^home_ask_/.test(m.ask.id)||m.ans!=null) continue; const due=m.day*24+m.h+2; if(G.day*24+G.hour>=due&&!PHONE.sent(G,m.ask.id+'_dad')) PHONE.at(G,m.day,m.h+2,[{th,from:'dad',name:'爸爸',text:((L().groupReply||{}).none||['？'])[0]}],m.ask.id+'_dad'); } };   /* 兩小時沒回：爸爸「？」（睡著了也會補在那個時間）*/
  return S;
})();
