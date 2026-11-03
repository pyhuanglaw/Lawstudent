/* ===== 一鍵（ONE-TAP-GO-1103，USER_WANTS X189）=====
   使用者 2026-11-03：「下一個版本新增一個 回宿舍睡覺 按了 直接回宿舍直接睡覺 要有防誤觸的確認」「一鍵睡覺 一鍵到下一堂課教室 一鍵下一個約會地點」。
   HUD 右上角（📱 左邊）一顆「一鍵」→ 小選單三項 → 點一項先跳確認框（要去哪、現在幾點、花多久、會跳到幾點、會錯過什麼；「取消」「確定」，預設焦點在取消）→ 確定才走。
   三項都照遊戲現有的流程走，不另外寫一套：
     1. 回去睡覺：住的地方照 STORY.forceHome（凌晨 2:30 強制回去睡）那幾段——日本（JP.bedFromRoom：回據點，據點的選單照舊睡）、住家裡（HOME.go，回到家的選單直接選「睡覺」）、
        美國（公寓）、公館套房、其他＝宿舍 203（GM.enter dorm）；到了以後 STORY.bedScene(GM,{auto:true})：床前面的劇情優先（除夕回家、典禮、8/30 電話、第一天讀案例）照舊，
        床的選單不問、直接選第一個睡覺（kind sleep；今晚還有鬧鐘＝「睡一下（幾點叫醒你）」）；爬上床、熄燈、睡覺的演出照舊（goToBed、sleepNow）。
        晚上（17:30 以後、過半夜）才能按；白天寫原因（白天回去用床可以小睡）。經濟系事件模式、畢業後「睡覺＝到下一件事」的時候白天也可以（床本來就是到下一件事）。
     2. 到下一堂課的教室：CLS.goClass（手機「今天」的「直接去上課」同一個）；時間還早＝照跳過時間的規則等到出門時間（中途有約、劇情會先停）；到了以後直接坐老位子（沒有就中間的位子）。
     3. 到下一個約會地點：今天約好的出遊、校外約會（OUT，OUT.go＝「出發」）、當面約（INV.goNow＝「前往」）最早的一個；
        還早（離出發超過 15 分鐘）＝先照跳過時間的規則等到出發時間（CLS.skipTo，中途有事會先停），再出發；約會本身的劇情照舊演。
   不能按：劇情在演、對話中、在換場、有人跟著你（G.flags.companion）、睡著、在家的選單裡。存檔格式不變（不存任何新欄位）。
   測試：node tests/onetap_unit.js */
'use strict';
const ONETAP=(function(){
  const S={};
  const hm=x=>{ const m=Math.round((((+x||0)%24)+24)%24*60); return String(Math.floor(m/60)%24).padStart(2,'0')+':'+String(m%60).padStart(2,'0'); };
  const WEEK=['週日','週一','週二','週三','週四','週五','週六'];
  const now=G=>G.day*24+G.hour;
  const dur=h=>{ const m=Math.max(0,Math.round(h*60)); return m<60?m+' 分鐘':Math.floor(m/60)+' 小時'+(m%60?' '+(m%60)+' 分':''); };
  const nameOf=id=>typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(id):id;
  S.ITEMS=[{k:'sleep',t:'回去睡覺'},{k:'cls',t:'到下一堂課的教室'},{k:'date',t:'到下一個約會地點'}];
  /* 三項共同的「現在不能按」 */
  S.busyWhy=function(GM){ const G=GM&&GM.G, E=GM&&GM.E; if(!G||!E||!E.player||GM.titleIdle) return '現在不能用';
    if(S.running) return '正在前往';
    if(E.player.busy||(GM.D&&GM.D.active)||(GM.D&&GM.D.busyDepth>0)) return '劇情進行中';
    if(GM.isEntering&&GM.isEntering()) return '正在換場';
    if(typeof STORY!=='undefined'&&(STORY._sleeping||STORY._bedBusy)) return '正在睡覺';
    if(G.flags&&G.flags.companion) return '有人跟你一起走，先把這段走完';
    if(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G)) return '你在家：用家裡的選單';
    return ''; };
  const nowLine=G=>'現在：'+WEEK[((G.weekday|0)%7+7)%7]+' '+hm(G.hour);
  /* ---------- 1. 回去睡覺 ---------- */
  S.where=function(G){ if(typeof JP!=='undefined'&&JP.inJapan&&JP.inJapan(G)) return {k:'jp',name:'日本的宿舍'};
    if(typeof HOME!=='undefined'&&((HOME.breakMode&&HOME.breakMode(G))||(HOME.baseMode&&HOME.baseMode(G))||(HOME.pgHome&&HOME.pgHome(G))||(typeof JP!=='undefined'&&JP.homeOn&&JP.homeOn(G)))) return {k:'home',name:'家'};   /* 放假住家裡、經濟系休學住家裡、畢業後住家裡、日本路線出發前後住家裡（forceHome＋jp3d.js 包的那一段）*/
    if(typeof EXCH!=='undefined'&&EXCH.inUS&&EXCH.inUS(G)) return {k:'us',name:'公寓',zone:'us_apartment'};
    if(typeof HOME!=='undefined'&&HOME.suite&&HOME.suite(G)) return {k:'suite',name:'公館的套房',zone:'gongguan'};
    return {k:'dorm',name:'宿舍 203',zone:'dorm'}; };
  const trav=(G,E,zone)=>{ if(G.zone===zone) return 0; const pos=E&&E.player&&E.player.obj?E.player.obj.position:null; return typeof CLS!=='undefined'&&CLS.travelMinutes?CLS.travelMinutes(G,G.zone,zone,pos,null):15; };
  S.sleepPlan=function(GM){ const G=GM.G, E=GM.E, why=S.busyWhy(GM); if(why) return {k:'sleep',ok:false,why};
    const w=S.where(G), jump=typeof STORY!=='undefined'&&STORY.sleepJumpMode&&STORY.sleepJumpMode(G), hh=((G.hour%24)+24)%24, night=G.hour>=24||hh>=17.5||hh<5;
    if(!night&&!jump) return {k:'sleep',ok:false,why:'晚上（17:30 以後）才能直接睡；白天可以回去用床小睡'};
    if(w.k==='home'&&typeof HOME!=='undefined'&&HOME.canGo&&!HOME.canGo(G)) return {k:'sleep',ok:false,why:'現在回不了家'};
    const mins=w.k==='home'?(typeof HOME!=='undefined'&&HOME.livesHome&&HOME.livesHome(G)?30:40):(w.k==='jp'?0:trav(G,E,w.zone));
    let o=null; if(w.k!=='home'&&w.k!=='jp'&&typeof STORY!=='undefined'&&STORY.bedOptions){ const k0=G.hour; G.hour=k0+mins/60; try{ const L=STORY.bedOptions(G); o=L[STORY.autoBedIdx?STORY.autoBedIdx(L):L.findIndex(x=>x.kind==='sleep')]||null; } catch(e){ console.warn('ONETAP.sleepPlan',e); } finally { G.hour=k0; } }   /* 到了床邊那一刻的床選項（路上花的時間算進去）*/
    const lines=['去：'+w.name+(w.k==='dorm'?'（爬上床直接睡）':'，直接睡'),nowLine(G),mins?'路程：約 '+mins+' 分鐘':(w.k==='jp'?'回到據點':'你就在這裡')];
    if(w.k==='home') lines.push('回到家直接選「睡覺」（隔天早上在家醒來；會錯過的事，回到家會再問一次）');
    else if(w.k==='jp') lines.push('回到據點直接睡（會錯過約好的事，據點會再問一次）');
    else if(o) lines.push('睡：'+o.t+(o.hint?'。'+o.hint:''));
    return {k:'sleep',ok:true,w,mins,opt:o,title:'回去睡覺',lines}; };
  /* 住家裡：回到家的第一個選單直接選「睡覺」（GAME.choose 的 menu:true、有 k:'sleep' 的那一個；有該出發的約（out、inv）就不代選，讓玩家看選單）*/
  S._autoSleep=false;
  S.pickSleep=function(options,opt){ if(!S._autoSleep||!opt||!opt.menu||!Array.isArray(options)) return -1; if(options.some(o=>o&&(o.k==='out'||o.k==='inv'))){ S._autoSleep=false; return -1; } const i=options.findIndex(o=>o&&o.k==='sleep'); if(i>=0) S._autoSleep=false; return i; };
  if(typeof GAME!=='undefined'&&GAME&&typeof GAME.choose==='function'&&!GAME._onetapWrap){ const c0=GAME.choose; GAME.choose=function(options,opt){ const i=S.pickSleep(options,opt); if(i>=0) return Promise.resolve(i); return c0.apply(this,arguments); }; GAME._onetapWrap=true; }
  S.goSleep=async function(GM,p){ const G=GM.G, w=p.w; if(typeof ACTIVITIES!=='undefined'&&ACTIVITIES.leave) ACTIVITIES.leave(G);   /* 活動中＝中途離開（同快速前往）*/
    if(w.k==='jp') return JP.bedFromRoom(GM);   /* 回據點：據點的選單照舊睡（pendingSleep；會錯過約好的事先問一次）*/
    if(w.k==='home'){ S._autoSleep=true; try{ return await HOME.go(GM); } finally { S._autoSleep=false; } }
    if(G.zone!==w.zone||w.k==='suite'){ GM.sceneBegin(); try{ await GM.fade(true); if(w.k==='suite'&&GM.titleCard) await GM.titleCard('公館的套房','',1800); else GM.caption('',(w.k==='us'?'回到公寓。':'回到宿舍。'),2200); if(p.mins) GM.advance(p.mins/60); } finally { GM.sceneEnd(); }
      await GM.enter(w.zone,w.k==='dorm'?{x:0,z:2.4,yaw:Math.PI}:(w.k==='us'?Object.assign({},EXCH.SPAWN&&EXCH.SPAWN.us_apartment||{x:0,z:2,yaw:Math.PI}):(STORY.SUITE_SPAWN?STORY.SUITE_SPAWN():undefined)));   /* 落點同 forceHome */
      if(GM.fade) await GM.fade(false); if(GM.sleep) await GM.sleep(60); }
    if(GM.E.player.busy||(GM.D&&GM.D.active)){ GM.toast('到了。先處理眼前的事。',3000); return false; }   /* 進房間就演的劇情（onEnter）先演 */
    await STORY.bedScene(GM,{auto:true}); return true; };
  /* ---------- 2. 到下一堂課的教室 ---------- */
  S.classPlan=function(GM){ const G=GM.G, why=S.busyWhy(GM); if(why) return {k:'cls',ok:false,why}; if(typeof CLS==='undefined'||!CLS.goList) return {k:'cls',ok:false,why:'沒有課表'};
    const cw=CLS.canGo?CLS.canGo(GM):''; if(cw) return {k:'cls',ok:false,why:cw};
    const R=CLS.rec(G), it=CLS.goList(G).find(q=>!R.done[q.key]); if(!it){ const any=CLS.dayItems(G).length; return {k:'cls',ok:false,why:any?'今天的課已經上完了':'今天沒有課'}; }
    const pl=CLS.goPlan?CLS.goPlan(GM,it):null; if(!pl&&!(it.room&&it.room.offsite)) return {k:'cls',ok:false,why:'找不到'+it.c.name+'的教室'};
    const h=G.hour, wait=pl&&pl.depart-h>0.06?pl.depart-h:0, room=(it.room&&it.room.name)||'教室', exam=it.exam?(CLS.examName?CLS.examName(it):'考試')+'：':'';
    const lines=['去：'+room+'（'+exam+it.c.name+'，'+hm(it.t0)+'–'+hm(it.t1)+'）',nowLine(G)];
    if(it.room&&it.room.offsite) lines.push('校外上課：直接過去，時間跳到下課');
    else { lines.push(pl.mins?'路程：'+(pl.bike?'騎腳踏車':'走路')+' '+pl.mins+' 分鐘':'你就在這一棟');
      if(wait) lines.push('會先跳過時間到 '+hm(pl.depart)+' 出門（等 '+dur(wait)+'；中途有約好的事、劇情會先停下來）');
      lines.push('到教室：'+hm(pl.arrive)+(pl.late>0?'。'+CLS.planHint(GM,it,pl):'')+'，直接坐'+(R.seat&&R.seat[it.c.id]?'老位子':'中間的位子')); }
    const ms=typeof STORY!=='undefined'&&STORY.missText&&wait?STORY.missText(G,G.day,h,pl.depart):''; if(ms) lines.push(ms);
    return {k:'cls',ok:true,it,pl,wait,title:'到下一堂課的教室',lines}; };
  S.goClassNow=async function(GM,p){ return CLS.goClass(GM,p.it,{autoSeat:true}); };
  /* ---------- 3. 到下一個約會地點 ---------- */
  const callLike=q=>!!(q.call||q.verb==='接起來'||q.place==='視訊');   /* 視訊、電話：不用出門 */
  S.dateList=function(GM){ const G=GM.G, t=now(G), out=[];
    if(typeof OUT!=='undefined'&&OUT.rec) for(const q of OUT.rec(G)){ if(q.state!=='planned'||callLike(q)||q.day<G.day) continue; const tr=OUT.trip?OUT.trip(G,q):{travelH:q.travelH||0,travel:q.travel||''}, dep=q.day*24+q.h-(tr.travelH||0), late=q.day*24+q.h+(q.late!=null?q.late:0.75);
      if(t>late) continue; if(q.dateTrip&&typeof DATE!=='undefined'&&DATE.trip){ const tp=DATE.trip(G,q.dateTrip); if(!tp||tp.status!=='booked'||t>q.day*24+q.h+1) continue; }   /* 校外約會：晚 60 分鐘以上＝DATE.prompt 的「趕不上了」，不給一鍵 */
      out.push({kind:'out',q,day:q.day,h:q.h,dep,travel:tr.travel||'',travelH:tr.travelH||0,label:(typeof OUT!=='undefined'&&OUT.tt?OUT.tt(q.title):q.title)||q.place||'出遊',place:q.place||''}); }
    if(typeof INV!=='undefined') for(const iv of (G.invites||[])){ if(iv.state!=='accepted'||iv.day<G.day) continue; const P=INV.place?INV.place(iv.place)||{}:{}; if(iv.day===G.day&&(G.hour%24)>=iv.h+(INV.WAIT_H||0.5)) continue;
      const tg=INV.goTarget?INV.goTarget(G,iv):{zone:P.zone,name:P.name||'',spawn:null}, pos=GM.E&&GM.E.player&&GM.E.player.obj?GM.E.player.obj.position:null, mins=G.zone===tg.zone?0:(typeof CLS!=='undefined'&&CLS.travelMinutes?CLS.travelMinutes(G,G.zone,tg.zone,pos,tg.spawn):15);
      out.push({kind:'inv',iv,tg,day:iv.day,h:iv.h,dep:iv.day*24+iv.h-0.25-mins/60,mins,label:'和'+nameOf(iv.who)+'約在'+(P.name||tg.name||''),place:P.name||tg.name||''}); }
    return out.sort((a,b)=>(a.day*24+a.h)-(b.day*24+b.h)); };
  S.datePlan=function(GM){ const G=GM.G, why=S.busyWhy(GM); if(why) return {k:'date',ok:false,why};
    if(typeof JP!=='undefined'&&JP.inJapan&&JP.inJapan(G)) return {k:'date',ok:false,why:'在日本：從宿舍的選單出發'};
    const L=S.dateList(GM), c=L.find(x=>x.day===G.day);
    if(!c){ const nx=L[0]; if(!nx) return {k:'date',ok:false,why:'今天沒有約'}; const d=typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(nx.day):null; return {k:'date',ok:false,why:'今天沒有約（下一個：'+(d?d.m+'/'+d.d+' ':'')+hm(nx.h)+' '+nx.label+'）'}; }
    if(c.kind==='inv'&&G.zone===c.tg.zone) return {k:'date',ok:false,why:'你已經在約好的地方了（'+c.place+'）'};
    const t=now(G), wait=c.dep-t>0.25?c.dep-t-(c.kind==='out'?0.25:0):0;   /* 出遊：出發時間前 15 分鐘就可以出發（OUT.due 的窗口）；當面約：她從約好的時間前 15 分鐘就在那裡 */
    if(wait&&typeof CLS!=='undefined'&&CLS.canSkip){ const cs=CLS.canSkip(GM); if(cs) return {k:'date',ok:false,why:cs}; }
    if(wait&&(t+wait)>=G.day*24+23.99) return {k:'date',ok:false,why:'時間還早，跳不過半夜'};
    const leave=t+wait, arrive=c.kind==='out'?Math.max(leave+c.travelH,G.day*24+c.h-((c.q&&c.q.early)||0)):leave+c.mins/60;
    const lines=['去：'+c.label+'（'+hm(c.h)+'）'+(c.kind==='out'&&c.place&&!String(c.label).includes(c.place)?'，'+c.place:''),nowLine(G)];
    lines.push('路程：'+(c.kind==='out'?(c.travel||('約 '+Math.round(c.travelH*60)+' 分鐘')):(c.mins?'約 '+c.mins+' 分鐘':'你就在附近')));
    if(wait) lines.push('現在去會太早：先跳過時間到 '+hm(leave)+' 出發（等 '+dur(wait)+'；中途有約好的事、劇情會先停下來）');
    if(c.kind==='out'&&arrive-t>(c.travelH||0)+wait+0.02) lines.push('到了以後時間直接到 '+hm(arrive)+'（約好的時間）');
    lines.push('約會本身照常演');
    const ms=typeof STORY!=='undefined'&&STORY.missText?STORY.missText(G,G.day,G.hour,arrive-G.day*24):''; if(ms) lines.push(ms);
    return {k:'date',ok:true,c,wait,leave,title:'到下一個約會地點',lines}; };
  S.goDate=async function(GM,p){ const G=GM.G, c=p.c;
    if(p.wait>0.02){ if(typeof CLS==='undefined'||!CLS.skipTo) return false; const target=p.leave-G.day*24; const ok=await CLS.skipTo(GM,target); if(!ok||now(G)<p.leave-0.02) return false; }   /* 中途停下來（有事、取消）＝停在那裡，之後再按一次 */
    if(typeof ACTIVITIES!=='undefined'&&ACTIVITIES.leave) ACTIVITIES.leave(G);
    if(c.kind==='inv') return INV.goNow(GM,c.iv);
    const q=c.q; if(q.state!=='planned') return false;
    if(q.dateTrip&&typeof DATE!=='undefined'&&DATE.trip){ const tp=DATE.trip(G,q.dateTrip); if(tp&&tp.kind==='overnight'&&DATE.stillOn&&!DATE.stillOn(G,tp).ok) return !!(await DATE.prompt(GM,q)); if(tp){ tp.departed=true; tp.status='going'; } }   /* 同 DATE.early 的「現在出發」*/
    return OUT.go(GM,q); };
  /* ---------- 共同 ---------- */
  S.plan=function(GM,k){ try{ return k==='sleep'?S.sleepPlan(GM):k==='cls'?S.classPlan(GM):S.datePlan(GM); }catch(e){ console.warn('ONETAP.plan',k,e); return {k,ok:false,why:'現在不能用'}; } };
  S.plans=GM=>({sleep:S.plan(GM,'sleep'),cls:S.plan(GM,'cls'),date:S.plan(GM,'date')});
  S.exec=async function(GM,p){ return p.k==='sleep'?S.goSleep(GM,p):p.k==='cls'?S.goClassNow(GM,p):S.goDate(GM,p); };
  /* 確認框：Promise<boolean>。測試可以換掉 S.confirmUI */
  S.confirmUI=null;
  S.run=async function(GM,k){ const p=S.plan(GM,k); if(!p.ok){ if(GM.toast) GM.toast(p.why,3200); return false; }
    const ok=await (S.confirmUI||domConfirm)(GM,p); if(!ok) return false;
    const p2=S.plan(GM,k); if(!p2.ok){ if(GM.toast) GM.toast(p2.why,3200); return false; }   /* 確認框開著的時候狀態變了（劇情開始、時間到了）*/
    S.running=true; try{ await S.exec(GM,p2); return true; } catch(e){ console.warn('ONETAP.exec',k,e); return false; } finally { S.running=false; } };
  /* ---------- 畫面（index.html 的 #btnGo、#goPop、#goConfirm）---------- */
  const $=id=>typeof document!=='undefined'&&document.getElementById?document.getElementById(id):null;
  const esc=s=>String(s).replace(/[&<>"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[ch]);
  let shownAt=0, pausedBefore=false;
  function domConfirm(GM,p){ return new Promise(res=>{ const box=$('goConfirm'); if(!box){ res(false); return; }
      $('goCfTitle').textContent=p.title; $('goCfBody').innerHTML=p.lines.map(l=>'<div>'+esc(l)+'</div>').join('');
      box.classList.remove('hide'); shownAt=Date.now(); pausedBefore=!!(GM.E&&GM.E.paused); if(GM.E) GM.E.paused=true;   /* 確認框開著的時候時間停住 */
      const no=$('goCfNo'), yes=$('goCfYes'); const done=v=>{ box.classList.add('hide'); if(GM.E) GM.E.paused=pausedBefore; no.onclick=yes.onclick=null; res(v); };
      no.onclick=ev=>{ if(ev) ev.stopPropagation(); done(false); };
      yes.onclick=ev=>{ if(ev) ev.stopPropagation(); if(Date.now()-shownAt<450) return; done(true); };   /* 防誤觸：剛跳出來 0.45 秒內的點擊不算（連點兩下不會直接走）*/
      box.onclick=ev=>{ if(ev.target===box) done(false); };   /* 點外面＝取消 */
      try{ no.focus({preventScroll:true}); }catch(e){ no.focus(); } }); }   /* 預設焦點在「取消」（按 Enter／空白鍵＝取消）*/
  function renderPop(GM){ const pop=$('goPop'); if(!pop) return; const P=S.plans(GM);
    pop.innerHTML=S.ITEMS.map(it=>{ const p=P[it.k]; const sub=p.ok?(p.lines[0]||'').replace(/^去：/,''):p.why; return '<button class="btn goItem'+(p.ok?'':' dim')+'" data-gok="'+it.k+'"'+(p.ok?'':' aria-disabled="true"')+'><b>'+esc(it.t)+'</b><small>'+esc(sub)+'</small></button>'; }).join('');
    pop.querySelectorAll('[data-gok]').forEach(b=>b.onclick=async ev=>{ ev.stopPropagation(); const k=b.dataset.gok; const p=S.plan(GM,k); if(!p.ok){ if(GM.toast) GM.toast(p.why,3200); return; } closePop(); await S.run(GM,k); }); }
  function closePop(){ const pop=$('goPop'); if(pop) pop.classList.add('hide'); const b=$('btnGo'); if(b) b.classList.remove('on'); }
  S.openPop=function(GM){ const pop=$('goPop'); if(!pop) return; renderPop(GM); pop.classList.remove('hide'); const b=$('btnGo'); if(b) b.classList.add('on'); const qp=$('quickPop'); if(qp) qp.classList.add('hide'); };
  S.closePop=closePop;
  S.bind=function(GM){ const b=$('btnGo'), pop=$('goPop'); if(!b||!pop||b._bound) return; b._bound=true;
    b.onclick=ev=>{ ev.stopPropagation(); if(!pop.classList.contains('hide')){ closePop(); return; } const why=S.busyWhy(GM); if(why==='劇情進行中'||why==='正在換場'){ if(GM.toast) GM.toast('現在不能用（'+why+'）',2400); return; } S.openPop(GM); };
    { const bq=$('btnQuick'); if(bq) bq.addEventListener('click',()=>closePop()); }   /* 💾 的小選單打開＝這個收起來 */
    for(const el of [b,pop,$('goConfirm')]) if(el) el.addEventListener('pointerup',ev=>ev.stopPropagation());   /* 劇情對話中按不要順便翻下一句（同 💾）*/
    if(typeof document!=='undefined') document.addEventListener('pointerdown',ev=>{ if(pop.classList.contains('hide')) return; if(pop.contains(ev.target)||b.contains(ev.target)) return; closePop(); },true); };   /* 點選單外面＝收起來 */
  if(typeof document!=='undefined'&&typeof GAME!=='undefined'&&document.getElementById&&document.getElementById('btnGo')) S.bind(GAME);
  return S;
})();
