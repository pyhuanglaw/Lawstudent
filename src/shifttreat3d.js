/* ===== 她打工的時候你走進店裡（SHIFT-TREAT-1110；USER_WANTS X302）=====
   使用者 11-10：「可攻略對象在打工的時候 要有什麼她打工的時候才會有的劇情吧? 主動招待一個東西 或者很開心你在她打工來」
   台詞：AA_739（企劃線 5eff96441，AA 定稿 D109）——src/data/shift_treat.js，tools/shift/import_shift_treat.py 產生（不手抄）。這裡只有程式。
   規則（AA_739 rules）：
   - 誰：芷若（兩點半 Café，在吧檯上班＝STORY.ladWorking）、語彤（一盞茶屋，作息那一筆的 label 是「一盞茶屋（打工）」）。沛珊不加（notCovered）。
   - 觸發：玩家走進那家店（進區域；讀檔回到店裡不算），她在上班、人在店裡、不是正在下班（leaving），而且已經認識（FIRST_MET）。
     走進來等兩秒（同 story3d.js 麵店長桌 S.ndlTalkTick），進門的事件（EVENTS.onEnter）、別的劇情先演；畫面上有對話、劇情在跑就等。
   - 不演：玩家自己這一班在這家店上班（JOBS：這家店今天有班、而且現在是開班前 30 分鐘到下班；或班正在跑）；
     那家店今天有她的其他事件（S.otherEv：她在這家店的劇情事件今天演過、或現在成立；語彤 2026-04-25 的 ev_yt_tell_mom；今天才認識她）——
     兩點半每天的點餐「兩點半的店員」（ev_cafe_barista_zhiruo）是點餐，不算；
     今天 rel_lines 的 up 已經說過（SOCIAL relUpDay＝今天；記錄沒有地點，同一天就不演）；同一個人上次演完隔一天以上才再演（今天、明天都不演，第三天起）。
   - 演法：對話框 2～3 句（照稿那一組），不切 CG、不加選項，她在吧台／水屋說（不走過來；店員固定在櫃台）。演完照常點餐、坐下。
     字串以（開頭＝旁白，其他＝她說的（SOCIAL.playSteps）。
   - 階段：交往中＝dating；朋友、好朋友（SOCIAL.friendLevel）＝friend；有點熟＝familiar；其他（認識、熟悉還不到認識的）＝acq。
   - 招待（treat，只有 friend、dating）：friend＝在朋友以上的第 3 次演出起、離上次招待至少隔 3 次、而且離上次招待 7 天以上；
     dating＝離上次招待至少隔 2 次、5 天以上；輪不到就演 happy。「第幾次」數的是朋友以上（friend、dating）那幾次演出（nf），上次招待記 tn、tday。
   - 每一組照順序輪，演完一輪從頭（存檔記每個人每一組的 idx）。
   - 招待的效果：熟悉 +1（SOCIAL.adjust fam，一般關係線；不動戀愛點數 npcRom、不記送禮、不扣錢）；這次點的東西照舊付錢。
     T3（friend.treat 第 3 組：芷若的熱可可、語彤先端來一壺）例外：今天在那家店點的下一樣不扣錢（S.freeTake）——
     兩點半：story3d.js counter() 點餐、「兩點半的店員」事件裡點的第一樣（EVENTS.run 包起來，只在那一場裡免第一筆沒有標籤的扣錢）；一盞：wzshops3d.js buy()。
   存檔：G.flags.SHIFTT＝{p:{人物:{day,n,nf,tn,tday,idx:{組:下一個}}}, free:{pid,zone,day}|null}；舊存檔沒有＝空的（讀的時候補），第一次走進去每一組從 idx 0 開始。
   測試：node tests/shift_treat_unit.js */
'use strict';
const SHIFTT=(function(){
  const S={};
  const X=()=>typeof SHIFT_TREAT!=='undefined'?SHIFT_TREAT:null;
  S.on=()=>!!X();
  S.SHOP={heroine_02:'cafe',heroine_03:'wz_teahouse'};
  S.YT_LABEL='一盞茶屋（打工）';
  S.FREE={heroine_02:2,heroine_03:2};   /* friend.treat 的第幾組（0 起）是 T3：import_shift_treat.py 核對過字（熱可可、端了一壺）*/
  S.GAP=2;   /* 上次演完那天 +2 起（隔一天以上：今天、明天都不演）*/
  S.TREAT={friend:{from:3,every:3,days:7},dating:{from:1,every:2,days:5}};
  S.ROUTINE=['ev_cafe_barista_zhiruo'];   /* 每天的點餐（兩點半的店員），不算「她的其他事件」*/
  S.WAIT=4;   /* 走進來等幾格（STORY.tick 每 0.5 秒一格）＝兩秒 */
  const F=G=>{ const f=G.flags||(G.flags={}); let r=f.SHIFTT; if(!r||typeof r!=='object'||Array.isArray(r)) r=f.SHIFTT={};
    if(!r.p||typeof r.p!=='object'||Array.isArray(r.p)) r.p={}; if(r.free!==null&&(typeof r.free!=='object'||Array.isArray(r.free))) r.free=null; return r; };
  S.rec=F;
  const P=(G,pid)=>{ const R=F(G).p; let o=R[pid]; if(!o||typeof o!=='object'||Array.isArray(o)) o=R[pid]={};
    if(!o.idx||typeof o.idx!=='object'||Array.isArray(o.idx)) o.idx={}; o.n=o.n|0; o.nf=o.nf|0; o.tn=o.tn|0; return o; };
  S.per=P;
  const law=G=>(G.stage||'law')==='law';
  const dating=(G,pid)=>{ const f=(G&&G.flags)||{}, R=f.romance&&f.romance[pid]; return f['dating_'+pid]===true||!!(R&&R.status==='dating'); };
  const known=pid=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(pid,'FIRST_MET');
  const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;

  /* ---------------- 她在上班 ---------------- */
  S.onShift=function(G,pid){ if(!G||G.zone!==S.SHOP[pid]||typeof STORY==='undefined') return false;
    if(pid==='heroine_02') return !!(STORY.ladWorking&&STORY.ladWorking(G,pid));
    if(pid==='heroine_03'){ try{ const e=STORY.schedEnt&&typeof CHARACTERS!=='undefined'?STORY.schedEnt(CHARACTERS[pid],G):null; return !!e&&e.zone==='wz_teahouse'&&e.label===S.YT_LABEL; }catch(e){ return false; } }
    return false; };
  S.here=(GM,pid)=>{ const n=GM&&GM.npc&&GM.npc[pid]; return n&&!n.leaving?n:null; };

  /* ---------------- 玩家自己這一班 ---------------- */
  S.playerShift=function(G,zone){ if(typeof JOBS==='undefined'||!JOBS.ZONE_KEY) return false; const k=JOBS.ZONE_KEY[zone]; if(!k) return false;
    try{ if(JOBS.running&&G.zone===zone) return true; if(!JOBS.active||!JOBS.active(G,k)||!JOBS.due||!JOBS.due(G,k,G.day)) return false;
      const H=JOBS.hrs?JOBS.hrs(k,G.day):null, h=+G.hour||0; if(!H) return true; return h>=H[0]-0.5&&h<H[1]; }catch(e){ return false; } };

  /* ---------------- 她今天在這家店有別的事 ---------------- */
  S.OTHER=[];   /* 事件包登記：fn(G,pid,zone)→true＝今天有她的其他事 */
  S.otherEv=function(G,pid,zone){
    const M=typeof SOCIAL!=='undefined'&&SOCIAL.memories?SOCIAL.memories(pid):[]; if(M.some(m=>m.tag==='FIRST_MET'&&m.day===G.day)) return true;   /* 今天才認識（芷若第一次的「兩點半的店員」、語彤第一班）*/
    if(pid==='heroine_03'&&typeof AA720P!=='undefined'&&AA720P.ytTell&&AA720P.ytTell(G)&&DK(AA720P.YT_DAY)===G.day) return true;   /* 她跟媽媽說的那一天（ev_yt_tell_mom，aa720_3d.js：不在 STORY_EVENTS）*/
    for(const f of S.OTHER){ try{ if(f(G,pid,zone)) return true; }catch(e){} }
    if(typeof STORY_EVENTS==='undefined') return false; const last=(G.events&&G.events.last)||{};
    for(const ev of STORY_EVENTS){ if(!ev||ev.retired||ev.off||S.ROUTINE.includes(ev.id)) continue; if(!(ev.participants||[]).includes(pid)) continue;
      const L=ev.location; if(!(L===zone||(Array.isArray(L)&&L.includes(zone)))) continue;
      if(last[ev.id]===G.day) return true;
      if(!['enter','auto','interact'].includes(ev.trigger)||typeof EVENTS==='undefined'||!EVENTS.check) continue;
      let ok=false; try{ ok=!!EVENTS.check(ev); }catch(e){ ok=false; } if(ok) return true; }
    return false; };
  S.upToday=(G,pid)=>!!(G.social&&G.social.relUpDay&&G.social.relUpDay[pid]===G.day);

  /* ---------------- 演哪一組 ---------------- */
  S.stageKey=function(G,pid){ if(dating(G,pid)) return 'dating'; const s=typeof SOCIAL!=='undefined'&&SOCIAL.friendLevel?SOCIAL.friendLevel(pid):'ACQUAINTANCE';
    return (s==='FRIEND'||s==='CLOSE_FRIEND')?'friend':(s==='FAMILIAR'?'familiar':'acq'); };
  /* 這一次（還沒記）輪不輪到招待：nf＝加上這一次以後朋友以上的第幾次 */
  S.treatDue=function(G,pid,st){ const T=S.TREAT[st]; if(!T) return false; const o=P(G,pid), nf=o.nf+1;
    if(nf<T.from||nf-o.tn<T.every) return false; return o.tday==null||G.day-o.tday>=T.days; };
  S.group=(pid,st,kind)=>{ const L=X()&&X().lines[pid]; if(!L) return null; return kind?(L[st]&&L[st][kind])||null:L[st]||null; };
  /* 挑這一次：{st,kind,key,i,lines,free}（不記）*/
  S.pick=function(G,pid){ const st=S.stageKey(G,pid), kind=(st==='friend'||st==='dating')?(S.treatDue(G,pid,st)?'treat':'happy'):null;
    const L=S.group(pid,st,kind); if(!L||!L.length) return null; const key=kind?st+'.'+kind:st, i=((P(G,pid).idx[key]|0)%L.length+L.length)%L.length;
    return {st,kind,key,i,lines:L[i],free:st==='friend'&&kind==='treat'&&S.FREE[pid]===i}; };

  /* ---------------- 演不演 ---------------- */
  S.due=function(GM,pid){ const G=GM&&GM.G; if(!S.on()||!G||!law(G)||!S.SHOP[pid]||G.zone!==S.SHOP[pid]) return false;
    if(!known(pid)||!S.onShift(G,pid)||!S.here(GM,pid)) return false;
    const o=P(G,pid); if(o.day!=null&&G.day-o.day<S.GAP) return false;
    if(S.playerShift(G,G.zone)||S.upToday(G,pid)||S.otherEv(G,pid,G.zone)) return false;
    return !!S.pick(G,pid); };
  /* 記下這一次（先記再演：演到一半出錯也不會一直重演）*/
  S.mark=function(G,pid,p){ const o=P(G,pid); o.day=G.day; o.n++; if(p.st==='friend'||p.st==='dating') o.nf++; o.idx[p.key]=(p.i+1)%(S.group(pid,p.st,p.kind)||[1]).length;
    if(p.kind==='treat'){ o.tn=o.nf; o.tday=G.day; if(typeof SOCIAL!=='undefined'&&SOCIAL.adjust) SOCIAL.adjust(pid,{fam:1}); }
    if(p.free) F(G).free={pid,zone:S.SHOP[pid],day:G.day}; };
  S.who=(pid,n)=>({name:typeof SOCIAL!=='undefined'&&SOCIAL.npcName?SOCIAL.npcName(pid):pid,obj:n&&n.obj,charId:pid,pose:n&&n.pose});
  S.say=async function(GM,who,pid,lines){ if(typeof SOCIAL!=='undefined'&&SOCIAL.playSteps) return SOCIAL.playSteps(GM,who,pid,lines);
    for(const t of lines||[]){ const s=String(t).replace(/\{name\}/g,(GM.G&&GM.G.name)||'祐廷'); if(/^（/.test(s)) await GM.say(null,s); else await GM.say(who,s); } };
  S.play=async function(GM,pid){ const G=GM.G, p=S.pick(G,pid), n=S.here(GM,pid); if(!p) return null; S.mark(G,pid,p);
    if(GM.sceneBegin) GM.sceneBegin({adv:pid}); try{ await S.say(GM,S.who(pid,n),pid,p.lines); } finally { if(GM.sceneEnd) GM.sceneEnd(); }
    if(GM.autosave) GM.autosave(); return p; };

  /* ---------------- T3：今天在那家店點的下一樣不扣錢 ---------------- */
  S.freeOn=(G,zone)=>{ const f=G&&F(G).free; return !!f&&f.day===G.day&&f.zone===zone&&G.zone===zone; };
  S.freeTake=function(G,zone){ if(!S.freeOn(G,zone)) return false; F(G).free=null; return true; };

  /* ---------------- 每一格（STORY.TICKS）：走進店裡等兩秒 ---------------- */
  let pend=null, busy=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['shifttreat:busy']=()=>{ busy=false; pend=null; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）*/
  S.entered=function(zoneId,GM,opts){ pend=null; if(!S.on()||(opts&&opts.fromLoad)) return; if(!Object.values(S.SHOP).includes(zoneId)) return; pend={zone:zoneId,n:GM&&GM.enterN|0,k:0}; };
  S.pending=()=>pend;
  S.tick=function(GM){ const G=GM&&GM.G; if(!pend||busy||!G) return false; if(G.zone!==pend.zone||(GM.enterN|0)!==pend.n){ pend=null; return false; }
    if(++pend.k<S.WAIT) return false;
    if((GM.D&&GM.D.active)||(typeof ADV!=='undefined'&&ADV.active)||(typeof EVENTS!=='undefined'&&EVENTS.running)||(GM.E&&GM.E.player&&GM.E.player.busy)) return false;
    const pid=Object.keys(S.SHOP).find(id=>S.SHOP[id]===G.zone); pend=null; if(!pid||!S.due(GM,pid)) return false;
    busy=true; Promise.resolve(S.play(GM,pid)).catch(e=>console.warn('SHIFTT.play',e)).finally(()=>{ busy=false; }); return true; };

  /* ---------------- 掛上去 ---------------- */
  if(typeof STORY!=='undefined'&&!STORY._shiftt){ STORY._shiftt=true;
    if(Array.isArray(STORY.TICKS)) STORY.TICKS.push(GM=>S.tick(GM));
    if(typeof STORY.onEnter==='function'){ const o0=STORY.onEnter; STORY.onEnter=function(zoneId,GM,opts){ try{ S.entered(zoneId,GM,opts); }catch(e){ console.warn('SHIFTT.entered',e); } return o0.apply(this,arguments); }; } }
  /* 「兩點半的店員」（點餐那一場）：T3 那天，那一場裡第一筆沒有標籤的扣錢（她做的你那一杯）不扣 */
  if(typeof EVENTS!=='undefined'&&EVENTS.run&&!EVENTS._shiftt){ EVENTS._shiftt=true; const r0=EVENTS.run;
    EVENTS.run=async function(ev){ const gm=typeof GAME!=='undefined'?GAME:null, G=gm&&gm.G;
      if(!(ev&&ev.id==='ev_cafe_barista_zhiruo'&&gm&&typeof gm.money==='function'&&S.freeOn(G,'cafe'))) return r0.apply(this,arguments);
      const m0=gm.money; gm.money=function(d,label){ if(d<0&&label==null&&S.freeTake(gm.G,'cafe')){ gm.money=m0; return; } return m0.apply(this,arguments); };
      try{ return await r0.apply(this,arguments); } finally { if(gm.money!==m0) gm.money=m0; } }; }
  return S;
})();
if(typeof module!=='undefined') module.exports=SHIFTT;
