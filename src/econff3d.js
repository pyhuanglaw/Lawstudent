/* ===== 經濟系在學期間：事件接事件（D102；使用者 2026-10-18 06:0x 選擇題；規格 AA_292，企劃 98c0bfa1）=====
   使用者原話：「經濟系你現在安排是什麼？完全沒有朋友可約，為什麼要度過每一天」→ 選「事件接事件」、經濟系同學的邀約「不用」。
   - 範圍：9/2 E01 早上以後～10/17 便利貼（ev_y0_e30_note）。8/23 宿營開局、9/1 宿舍第一晚、9/2 早上照原本的流程；10/19 以後休學在家另一張表（等 AA）。
   - 玩家空下來 1.5 秒（沒有對話、沒有選單、沒坐著、手機沒開）就跳到下一個事件：黑幕 → 換時間（中間經濟系的課自動算出席，不發翹課訊息）
     → 換區域、站好 → 日期字卡（隔兩天以上多一句 AA_292 第 2 節的旁白）→ 演。
   - 「一定」的照時間帶過去；「條件」的用 EVENTS.check（或 prereq）判斷，不成立就跳下一個。出遊型（系烤、即興劇、聚會、車上）走 OUT.go。
   - 跳的途中手機規則照時間跑（每小時一次）；收到要回的訊息（可昕的邀約、群組問去不去）就停在那一刻、打開手機，回完再繼續。
   - 兩堂有劇情的課（9/5 會計第一堂 P1、9/9 第一次經原 E03）：帶到教室坐好、上課；講到話的同學（阿勳、韋綸、品妤、可昕）坐在附近。
   - 存檔：G.flags.ECONFF＝{done:{n:1}, lines:[用過的旁白]}；讀檔後從下一個沒做的接。網址加 ?nofastecon 關掉（測試舊流程用）。
   測試：node tests/econ_ff_unit.js */
'use strict';
const ECONFF=(()=>{
  const S={};
  const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const evOf=id=>typeof STORY_EVENTS!=='undefined'?STORY_EVENTS.find(e=>e.id===id):null;
  const done=(G,id)=>!!(G.events&&G.events.done&&G.events.done[id]);
  const WD=['日','一','二','三','四','五','六'];
  const wdOf=d=>typeof CALENDAR!=='undefined'?CALENDAR.dateOf(d).wd%7:0;
  /* AA_292 第 1 節（#1～#3 照原本的流程；手機那幾列在跳的途中照時間收；h≥24＝前一天的深夜，例 #25 10/15 24:30）*/
  S.STEPS=[
    {n:4, key:'2024-09-02',h:12.25,ev:'ev_y0_e02'},
    {n:5, key:'2024-09-05',cls:'acct_y0',with:['econ_zhengxun','econ_weilun','econ_pinyu','kexin']},
    {n:6, key:'2024-09-09',cls:'econ_principles_y0',with:['econ_zhengxun','kexin']},
    {n:7, key:'2024-09-18',h:10,zone:'campus',at:{x:-3,z:12,yaw:0},ev:'ev_y0_e07'},
    {n:8, key:'2024-09-19',h:15.17,zone:'putong',ev:'ev_y0_p2'},
    {n:9, key:'2024-09-20',h:17,ev:'ev_y0_e05'},
    {n:12,key:'2024-09-21',h:17,ev:'ev_y0_e08'},
    {n:13,key:'2024-09-23',h:12.17,zone:'campus',ev:'ev_y0_e09'},
    {n:14,key:'2024-09-26',h:15.17,zone:'putong',ev:'ev_y0_p1b1',then:'ev_y0_p2'},
    {n:16,key:'2024-09-30',h:19,zone:'dorm',ev:'ev_y0_t0a'},
    {n:17,key:'2024-10-01',h:12.17,zone:'campus',ev:'ev_y0_t1'},
    {n:18,key:'2024-10-03',h:15.17,zone:'putong',ev:'ev_y0_p2'},
    {n:19,key:'2024-10-07',h:12,zone:'boya',ev:'ev_y0_p2b',then:'ev_y0_b2'},
    {n:20,key:'2024-10-07',h:19,ev:'ev_y0_c1'},
    {n:21,key:'2024-10-12',h:14,zone:'cafe',ev:'ev_y0_l5a'},
    {n:22,key:'2024-10-14',h:12,zone:'boya',ev:'ev_y0_p2b'},
    {n:23,key:'2024-10-15',h:19,ev:'ev_y0_gather'},
    {n:25,key:'2024-10-15',h:24.5,zone:'dorm',ev:'ev_y0_a1'},
    {n:26,key:'2024-10-16',h:19,zone:'library',ev:'ev_y0_e10',then:'ev_y0_e10b'},
    {n:27,key:'2024-10-17',h:14.67,ev:'ev_y0_e30'},
    {n:28,key:'2024-10-17',h:17.67,ev:'ev_y0_e26'},
    {n:29,key:'2024-10-17',h:22.5,zone:'dorm',ev:'ev_y0_e30_note'}];
  /* AA_292 第 2 節：兩個事件隔兩天以上，日期字卡下面一句（跳過的期間落在哪一段就用那一句；同一句不重複；只隔一天沒有）*/
  S.LINES=[['2024-09-03','2024-09-08','（課表貼在書桌前面。你還在記哪一間教室在哪一棟。）'],
           ['2024-09-10','2024-09-17','（博雅、普通、共同，三棟樓之間的路，你已經不用看地圖了。）'],
           ['2024-09-22','2024-09-25','（晚上十點半左右，手機常常會亮一下。）'],
           ['2024-09-27','2024-09-29','（教師節連假。你回臺北的家，帶了一袋要洗的衣服。）'],
           ['2024-10-02','2024-10-06','（中秋過了。宿舍走廊上，還有人在分沒吃完的月餅。）'],
           ['2024-10-08','2024-10-11','（期中考的範圍公布了。阿勳把考試日期寫在一張紙上，貼在桌前。）'],
           [null,null,'（這幾天都在上課。）']];
  S.rec=G=>{ const F=G.flags=G.flags||{}; const r=F.ECONFF=F.ECONFF||{}; r.done=r.done||{}; r.lines=r.lines||[]; return r; };
  S.off=()=>typeof location!=='undefined'&&/[?&]nofastecon\b/.test(location.search||'');
  S.on=function(G){ if(!G||G.stage!=='econ'||S.off()) return false; const F=G.flags||{}; if(!F.E01_MORNING||F.Y0_STICKY||done(G,'ev_y0_e30_note')) return false;
    const a=DK('2024-09-02'), b=DK('2024-10-18'); return a!=null&&b!=null&&G.day>=a&&G.day<b; };
  S.clsItem=(G,day,cid)=>typeof CLS==='undefined'?null:((CLS.dayItems(G,day)||[]).find(it=>it.c&&it.c.id===cid)||null);
  S.tOf=(G,s)=>{ const d=DK(s.key); if(d==null) return null; if(s.cls){ const it=S.clsItem(G,d,s.cls); return it?d*24+it.t0-1/12:d*24+9; } return d*24+s.h; };
  S.stepDone=function(G,s){ const r=S.rec(G); if(r.done[s.n]) return true; if(s.cls){ const d=DK(s.key), it=S.clsItem(G,d,s.cls); return !!(it&&typeof CLS!=='undefined'&&CLS.rec(G).done[it.key]); }
    return !!s.ev&&done(G,s.ev)&&(!s.then||done(G,s.then)); };
  /* 下一個要做的：時間還沒過太久（過了 6 小時就算錯過、跳過）、還沒做完 */
  S.next=function(G){ const now=G.day*24+G.hour; for(const s of S.STEPS){ if(S.stepDone(G,s)) continue; const t=S.tOf(G,s); if(t==null) continue; if(t<now-6){ S.rec(G).done[s.n]='missed'; continue; } return s; } return null; };
  S.lineFor=function(G,d0,d1){ if(d1-d0<2) return null; const r=S.rec(G); const k0=d0+1, k1=d1-1;
    for(const [a,b,t] of S.LINES){ if(r.lines.includes(t)) continue; if(a==null){ return t; } const da=DK(a), db=DK(b); if(da!=null&&db!=null&&da<=k1&&db>=k0) return t; } return null; };
  S.dateLabel=(day,h)=>{ const D=typeof CALENDAR!=='undefined'?CALENDAR.dateOf(day):{m:0,d:0}; const hh=Math.floor(h%24), mm=Math.round((h%1)*60)%60; return D.m+'/'+D.d+'（'+WD[wdOf(day)]+'）'+String(hh).padStart(2,'0')+':'+String(mm).padStart(2,'0'); };
  /* 跳過的課：自動算出席（不發翹課的轉述）*/
  S.attendBetween=function(G,t1){ if(typeof CLS==='undefined') return 0; const R=CLS.rec(G); let n=0; const d1=Math.floor(t1/24);
    for(let d=G.day;d<=d1;d++) for(const it of (CLS.dayItems(G,d)||[])){ if(R.done[it.key]||d*24+it.t1>t1+1e-6) continue; if(it.exam) continue; R.done[it.key]=1; R.attend[it.c.id]=(R.attend[it.c.id]||0)+1; R.prep[it.c.id]=(R.prep[it.c.id]||0)+1; R.note['skip_'+it.key]=1; n++; }
    return n; };
  const setT=(G,E,day,h)=>{ if(day!==G.day){ G.day=day; G.weekday=wdOf(day)||7; G.energy=100; if(G.flags) G.flags.companion=null; G.weather=(typeof CALENDAR!=='undefined'&&CALENDAR.typhoon&&CALENDAR.typhoon(day))?'rain':'clear'; } G.hour=h; if(E) E.hour=G.hour; };
  /* 往前跳到 (day,h)：每 15 分鐘走一格，整點跑手機規則；收到要回的訊息就停（回傳 'msg'）*/
  S.jumpTo=function(GM,day,h){ const G=GM.G, E=GM.E; const target=day*24+h; const p0=typeof PHONE!=='undefined'&&PHONE.pending?PHONE.pending(G).length:0; let t=G.day*24+G.hour;
    while(t+0.25<=target+1e-6){ t=Math.round((t+0.25)*4)/4; const d=(h>=24&&t>=day*24)?day:Math.floor(t/24); setT(G,E,d,t-d*24);   /* h≥24：深夜還算前一天（遊戲的「過了午夜還是晚上」）*/
      if(Math.abs(t-Math.round(t))<1e-6&&typeof PHONE!=='undefined'){ try{ if(typeof STORY!=='undefined'&&STORY.phoneRules) STORY.phoneRules(GM); PHONE.tick(G,()=>{}); }catch(e){ console.warn('ECONFF phone',e); }
        if(PHONE.pending&&PHONE.pending(G).length>p0) return 'msg'; } }
    setT(G,E,day,h); return 'ok'; };
  async function sitIn(GM,it){ const E=GM.E, P=E.player; const room=it.room&&it.room.room; const seats=((E.zone&&E.zone.seats)||[]).filter(q=>!room||q.room===room);
    const free=seats.filter(q=>!GM.freeSeat||GM.freeSeat(q)===q); const st=free[Math.floor(free.length/2)]||seats[0]; if(st&&GM.sitAt) GM.sitAt(P,st); return {st,free}; }
  /* 有劇情的課：帶到教室坐好，講到話的同學坐在附近，上課 */
  async function storyClass(GM,s){ const G=GM.G, it=S.clsItem(G,G.day,s.cls); if(!it) return; const z=it.room.zone;
    if(z&&G.zone!==z&&GM.enter) await GM.enter(z,undefined,{noFade:true});
    const {st,free}=await sitIn(GM,it); let k=0;
    for(const id of (s.with||[])){ if(GM.npc&&GM.npc[id]) continue; const q=free.filter(f=>f!==st)[k++]; if(!q||!GM.spawnCharacter) break; GM.spawnCharacter(id,q.x,q.z,{seat:q,pose:'sit'}); }
    if(typeof CLS!=='undefined') await CLS.attend(GM,it,{});
    if(GM.standUp&&GM.E.player.seat) GM.standUp(GM.E.player); }
  async function runEv(GM,id){ const G=GM.G, e=evOf(id); if(!e||done(G,id)) return false;
    if(e.trigger==='outing'&&typeof OUT!=='undefined'){ const q=(G.outings||[]).find(o=>o.ev===id&&o.state==='planned'); if(q){ await OUT.go(GM,q); return true; } }
    const ok=EVENTS.check(e)||(EVENTS.cond&&EVENTS.cond(e.prereq)&&e.trigger!=='outing');
    if(!ok) return false; await EVENTS.run(e); return true; }
  S.busy=false;
  S.advance=async function(GM){ const G=GM.G, E=GM.E; const s=S.next(G); if(!s) return false; const r=S.rec(G); const t=S.tOf(G,s), now=G.day*24+G.hour;
    const day=DK(s.key); let h=s.cls?(t-day*24):s.h;
    if(t>now+0.05){ const d0=G.day; await GM.fade(true);
      const res=S.jumpTo(GM,day,h);
      S.attendBetween(G,G.day*24+G.hour);
      if(res==='msg'){ if(GM.updateHUD) GM.updateHUD(); await GM.fade(false); if(GM.openPhone) GM.openPhone(); return true; }   /* 收到要回的訊息：先回，回完下一次再接 */
      if(s.zone&&G.zone!==s.zone&&GM.enter) await GM.enter(s.zone,s.at?Object.assign({lv:0},s.at):undefined,{noFade:true});
      else if(s.at&&E&&E.placeAt){ E.placeAt(E.player,s.at.x,s.at.z,0); E.player.obj.rotation.y=s.at.yaw||0; }
      const line=S.lineFor(G,d0,G.day); if(line) r.lines.push(line);
      if(GM.updateHUD) GM.updateHUD(); if(E&&E.setWeather) E.setWeather(G.weather);
      if(GM.titleCard&&G.day!==d0) await GM.titleCard(S.dateLabel(G.day,G.hour),line||'',line?3200:1800);
      await GM.fade(false); }
    try{ if(s.cls) await storyClass(GM,s);
      else { await runEv(GM,s.ev); if(s.then) await runEv(GM,s.then); } }
    catch(e){ console.warn('ECONFF step '+s.n,e); }
    r.done[s.n]=r.done[s.n]||1; if(GM.autosave) GM.autosave(); return true; };
  /* 睡覺、快轉＝直接到下一個事件（2026-10-18 使用者：「我每天睡覺到休學，還可以跟可昕告白，中間我們根本沒遇到」——一定要演的事件不能被睡過去）。
     story3d.js 的 sleepNow、home3d.js 的 sleep／ffMenu 先問這裡：事件模式而且還有下一個事件＝跳過去、回傳 true */
  S.sleepJump=async function(GM){ const G=GM.G; if(!S.on(G)||!S.next(G)) return false; if(S.busy) return true; S.busy=true;
    try{ if(GM.E&&GM.E.player&&GM.E.player.seat&&GM.standUp) GM.standUp(GM.E.player); await S.advance(GM); } catch(e){ console.warn('ECONFF sleepJump',e); } finally { S.busy=false; } return true; };
  /* 每 0.5 秒（story3d.js S.tick）：空下來 1.5 秒就接下一個 */
  let idleSince=0;
  S.tick=function(GM){ const G=GM.G; if(!S.on(G)||S.busy){ idleSince=0; return; } const E=GM.E, P=E&&E.player;
    const free=!!P&&!E.paused&&!P.busy&&!P.seat&&!(GM.D&&GM.D.active)&&!GM.titleIdle&&!(P.path&&P.path.length)&&!(typeof EVENTS!=='undefined'&&EVENTS.running);
    if(!free){ idleSince=0; return; } const now=Date.now(); if(!idleSince){ idleSince=now; return; } if(now-idleSince<1500) return;
    idleSince=0; S.busy=true; S.advance(GM).catch(e=>console.warn('ECONFF',e)).finally(()=>{ S.busy=false; }); };
  return S;
})();
