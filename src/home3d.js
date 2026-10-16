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
  S.canGo=G=>{ const h=G.hour; return (G.weekday===5&&h>=17)||G.weekday===6||(G.weekday===0&&h<21.5); };
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
  S.sleep=async function(GM){ const G=GM.G, E=GM.E; await GM.fade(true); G.day++; G.weekday=(G.weekday+1)%7; G.energy=100; G.hour=8.5; if(E) E.hour=G.hour; G.flags.companion=null;
    if(typeof CALENDAR!=='undefined'&&CALENDAR.typhoon&&CALENDAR.typhoon(G.day)) G.weather='rain'; else G.weather=Math.random()<0.7?'clear':'cloudy'; if(E&&E.setWeather) E.setWeather(G.weather);
    if(GM.updateHUD) GM.updateHUD(); if(GM.titleCard) await GM.titleCard('第 '+G.day+' 天',['週日','週一','週二','週三','週四','週五','週六'][G.weekday]+' '+hm(G.hour)+'・臺北的家',2200); await GM.fade(false);
    if(typeof STORY!=='undefined'&&STORY.monthlyFunds){ const f=STORY.monthlyFunds(G); if(f){ GM.money(f.amount); if(GM.toast) GM.toast(f.text,3800); } }
    const m=S.pick(G,'morning'); await say(GM,m,MOM); if(GM.autosave) GM.autosave(); };
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
  S.loop=async function(GM){ const G=GM.G, H=S.rec(G); if(busy) return; busy=true; GM.sceneBegin();
    try{ if(typeof ADV!=='undefined') ADV.begin({background:bg()});
      for(let guard=0;guard<60&&H.at;guard++){ phoneTick(GM); S.postponeMissed(G); const h=G.hour, late=G.weekday===0&&h>=21.5, ateToday=H.eat&&H.eat.day===G.day;
        if(late){ await GM.say(MOM,'明天有課吧。早點回去。'); await S.back(GM); break; }   /* 週日 21:30 以後：該回宿舍了 */
        const O=[], q=S.dueOuting(G);
        if(q) O.push({t:(q.verb||'出發')+'：'+q.title,hint:'從家裡出發　'+(q.place||'')+'　'+hm(q.h)+(q.travel?'　'+q.travel:''),k:'out',q});   /* G48：出遊從家裡出發（不加取車時間）*/
        for(const iv of S.dueInvites(G)){ const P=INV.place(iv.place)||{}; O.push({t:'出發：和'+(typeof SOCIAL!=='undefined'?SOCIAL.displayName(iv.who):iv.who)+'約在'+(P.name||''),hint:hm(iv.h)+'　捷運＋公車 約 40 分鐘',k:'inv',iv,P}); }
        if(!ateToday&&h>=18.5&&h<20) O.push({t:'吃晚餐',k:'eat'}); else if(!ateToday&&h>=16&&h<18.5) O.push({t:'等吃晚餐',hint:'到 18:30',k:'wait'});
        const sun=G.weekday===0; O.push({t:'睡覺',hint:sun?'明天有課：先回宿舍再睡':'隔天早上在家醒來',k:'sleep'}); if(!G.flags.carWithMe) O.push({t:'去玄關拿車鑰匙（取車）',k:'car'}); O.push({t:'在家休息一下',hint:'一小時',k:'rest'}); O.push({t:'回宿舍',hint:'捷運＋公車 約 40 分鐘',k:'back'});
        const o=O[await GM.choose(O)]||O[O.length-1];
        if(o.k==='out'){ H.at=false; if(typeof ADV!=='undefined'&&ADV.end) ADV.end(); await OUT.go(GM,o.q); break; }
        else if(o.k==='inv'){ await S.leaveTo(GM,o.P); break; }
        else if(o.k==='eat') await S.dinner(GM); else if(o.k==='wait'){ if(await confirmMiss(GM,18.5)) GM.advance(Math.max(0,18.5-G.hour)); }
        else if(o.k==='sleep'){ if(sun){ await S.back(GM); await S.sleepAtDorm(GM); break; } if(await confirmMiss(GM,24+8.5)) await S.sleep(GM); }   /* G48：週日晚上在家睡覺＝先回宿舍（不在家睡到週一）*/
        else if(o.k==='car') await S.takeCar(GM);
        else if(o.k==='rest'){ if(await confirmMiss(GM,G.hour+1)){ GM.advance(1); } } else { await S.back(GM); break; } } }
    finally{ busy=false; GM.sceneEnd(); } };
  /* 回家：轉場 → 到家（媽媽一句）→ 選單 */
  S.go=async function(GM){ const G=GM.G; if(!S.canGo(G)||S.at(G)) return false; const H=S.rec(G); GM.sceneBegin();
    try{ await GM.fade(true); if(GM.titleCard) await GM.titleCard('回臺北的家','捷運＋公車 約 40 分鐘',2400); GM.advance(0.7); H.at=true; H.day=G.day;
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
