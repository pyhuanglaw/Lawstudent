/* ===== 沛珊沒交往的線：沉默期、她唯一回的那一次、2028-12-29 重聚（AA_723 peishan，企劃線 d8570a14b；AA723-CONFESS-PS-1107）=====
   句子在 src/data/aa723.js（AA723.peishan；tools/story/import_aa723.py 從 AA_723 匯入，一字不改）。
   哪一條線、什麼時候算沉默期在 story3d.js（STORY.psNewLine／psPre／psSilent）；presence（characters.js）、私訊（msg3d.js 只顯示已送達）、
   y2b3d.js 1B-11、二手書店、台南（hometown3d.js）、11/08 試教（r2y4a3d.js）、psReconnected（r2y4b3d.js）、multirel3d.js、ps_class（termend3d.js）、
   她的動態（feed3d.js，2026-12-18～2028-12-28 一則都不發、動態的私訊不回）、柏翰說起她的動態（heard3d.js h506～h509 沒交往的線關掉）在各自的檔案看那幾個判斷。
   這裡做的：
   - 數她沉默期收到幾則私訊（包住 MSG.send；G.msgs 最多 200 則，舊的會被刪：另外記 G.flags.PSSIL.n）。
   - reply1（只一次）：2026-12-18 以後傳過至少 2 則、而且 2027-03-15 當天傳了 → 那天 22:30 她回一串（3/15 22:30 以後才傳的＝傳了 30 分鐘以後）；
     3/15 那一次沒成立＝2027-04-20 起傳的那一則（數起來到 2 則的第一則）30 分鐘以後回。最後一則三個選項（rel 照稿），回了以後 end 兩句（第二句是旁白：灰字）。
   - 重聚：2028-12-26 21:00 公法讀書會群組（public_law；祐廷不在群組＝沒有這幾則、也不排）——Alison 問、阿哲（認識）、她、Alison、以安（認識、在臺灣）；
     排 12/29 18:30 林家乾麵（OUT），那一場照稿（沉默期一則私訊都沒傳＝從「（散場的時候」到最後那 3 行換 last2）。演完、沒去、過了時間都記 PS_REUNION＝12/29（PS_RECONNECT 一起記：資料頁、畢業那天的卡片讀它）。
     70b0b51a9（AA 定：兩張小方桌併在一起）起在 3D 的林家乾麵（區域 wz_lin）演：OUT.STAGE（同 src/b1story3d.js、closed2_3d.js）——演之前換到 wz_lin、畫面用模糊的 3D，
     她坐最裡面那一桌（後排兩張桌子＝S.linSpots：她坐 z 最小的那一張椅子，你坐她對面，Alison 坐她旁邊的紅凳；阿哲、以安（照群組那一條：認識、在臺灣）坐隔壁那一桌），
     那幾個位子先跟路人預約（CROWD.shopSeatTake），演完照 OUT 回到出發的地方。換不進去（沒有 wz_lin、在家出發、騎車、有人跟著、進區域失敗）＝照原本 2D 深色底＋地點字幕。
     plan.place 寫「溫州街（林家乾麵，wz_lin）」：括號裡的區域 id 不給玩家看（S.placeOf）。
   - 不在公法讀書會群組（reunion.noGroup，d8570a14b）：沒有群組訊息、沒有聚餐；2028-12-30 21:00 她私訊你（三則，最後一則三個選項；第二個選項沉默期一則私訊都沒傳＝換 optAlt），
     那一刻記 PS_REUNION＝12/30、PS_RECONNECT（沒有她的聯絡方式＝不傳，照樣記）。沉默期到那一刻為止（STORY.psSilent）。
   - 柏翰（posts.bohan，f5cb310d6）：2027-06-18（大二下期末考完的週五）21:00 他私訊你兩則，一次（認識他和沛珊；沒有他的聯絡方式＝有點熟以上才傳、順便加聯絡方式）。
   - 舊存檔：PSSIL 沒有＝從 0 開始數（G.msgs 裡還在的照樣算）；已經照原本流程排了 8/7 那通電話的，沒交往的線取消。
   存檔：G.flags.PSSIL＝{n, nA, s0315, r1:{day,via,at}, r1ans, ngAns}；G.flags.PS_REUNION＝重聚那天。測試：node tests/ps_silence_unit.js */
'use strict';
const PSSIL=(function(){
  const S={}, PS='classmate_peishan', TH='p:'+PS, OID='pssil_reunion', EV='ev_pssil_reunion';
  const A=()=>(typeof AA723!=='undefined'&&AA723.peishan)||null;
  const dk=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const T=(d,h)=>d*24+h, now=G=>T(G.day,+G.hour||0);
  const F=G=>G.flags||(G.flags={});
  S.rec=G=>{ const f=F(G); if(!f.PSSIL||typeof f.PSSIL!=='object') f.PSSIL={}; const R=f.PSSIL; if(typeof R.n!=='number') R.n=0; if(typeof R.nA!=='number') R.nA=0; return R; };
  const silent=G=>typeof STORY!=='undefined'&&!!STORY.psSilent&&STORY.psSilent(G);
  const pre=G=>typeof STORY!=='undefined'&&!!STORY.psPre&&STORY.psPre(G);
  const newLine=G=>typeof STORY!=='undefined'&&!!STORY.psNewLine&&STORY.psNewLine(G);
  S.D={ from:'2026-12-18', bday:'2027-03-15', late:'2027-04-20', grp:'2028-12-26', noGroup:'2028-12-30', bohan:'2027-06-18' };
  const hasContact=(G,id)=>typeof INV!=='undefined'&&!!INV.hasContact&&INV.hasContact(G,id);
  /* ---------- 她收到幾則（祐廷在她的對話串傳的；from..to 是絕對時間）---------- */
  S.msgsN=function(G,from,to){ let n=0; for(const m of (G.msgs||[])) if(m&&m.th===TH&&m.from==='player'){ const t=T(m.day,+m.h||0); if(t>=from&&t<to) n++; } return n; };
  S.t0=()=>{ const d=dk(S.D.from); return d==null?null:T(d,0); };
  S.count=G=>{ const t0=S.t0(); return t0==null?0:Math.max(S.rec(G).n,S.msgsN(G,t0,Infinity)); };
  S.countA=G=>{ const t0=S.t0(), b=dk(S.D.bday); return t0==null||b==null?0:Math.max(S.rec(G).nA,S.msgsN(G,t0,T(b+1,0))); };
  S.silenceCount=(G,end)=>{ const t0=S.t0(), P=A(), e=P&&dk(P.reunion.plan.day); if(end==null&&e!=null) end=T(e,P.reunion.plan.h); return t0==null||end==null?0:Math.max(S.rec(G).n,S.msgsN(G,t0,end)); };   /* end：到什麼時候（聚餐那一刻；不在群組＝12/30 21:00 她私訊的那一刻）*/
  S.sent0315=G=>{ const R=S.rec(G); if(R.s0315!=null) return R.s0315; const b=dk(S.D.bday); if(b==null) return null; for(const m of (G.msgs||[])) if(m&&m.th===TH&&m.from==='player'&&m.day===b) return T(m.day,+m.h||0); return null; };
  /* ---------- reply1：她唯一回的那一次 ---------- */
  S.reply1Items=function(){ const R=A().reply1, P=t=>({th:TH,from:PS,text:t}), L=R.thread.map(P), last=P(R.text);
    last.ask={id:'pssil:reply1',opts:R.opts.map((o,i)=>({t:o.t,say:o.say.map(t=>({from:PS,text:t})),pssil:i}))}; L.push(last); return L; };
  S.reply1=function(G,at,via){ const R=S.rec(G); if(R.r1||!A()||typeof PHONE==='undefined'||!PHONE.at) return false; const d=Math.floor(at/24+1e-9), h=+(at-d*24).toFixed(4);
    if(PHONE.sent(G,'pssil_reply1')){ R.r1={day:d,via:'sent'}; return false; }   /* 已經排過（旗標不見了）：記下來，不再試 */
    if(!PHONE.at(G,d,h,S.reply1Items(),'pssil_reply1')) return false; R.r1={day:d,via,at}; return true; };
  S.onAnswer=function(G,m,o,k){ if(!G||!m||!m.ask) return; if(m.ask.id==='pssil:nogroup') return S.ngAnswer(G,m,o,k); if(m.ask.id!=='pssil:reply1') return; const P=A(), R=S.rec(G); if(!P||R.r1ans!=null) return; const i=o&&o.pssil!=null?o.pssil:k, op=P.reply1.opts[i];
    R.r1ans=i; if(op&&op.rel&&typeof SOCIAL!=='undefined'&&SOCIAL.adjust) SOCIAL.adjust(PS,Object.assign({},op.rel));
    if(typeof PHONE!=='undefined'&&!PHONE.sent(G,'pssil_reply1_end')){ const E=P.reply1.end; PHONE.post(G,{th:TH,from:PS,text:E[0],tag:'pssil_reply1_end'}); if(E[1]) PHONE.post(G,{th:TH,who:null,text:E[1],narr:true,tag:'pssil_reply1_end'}); } };   /* end 的第二句是旁白（手機畫面一行灰字：narr）*/
  /* 傳出去的那一刻（MSG.send 之後）：記數；4/20 以後還沒回過＝30 分鐘以後回 */
  S.onSend=function(G){ const R=S.rec(G), t=now(G), b=dk(S.D.bday), l=dk(S.D.late); R.n++; if(b!=null&&G.day<=b) R.nA++; if(b!=null&&G.day===b&&R.s0315==null) R.s0315=t;
    if(!R.r1&&l!=null&&G.day>=l&&S.count(G)>=2) S.reply1(G,t+0.5,'late'); };
  if(typeof MSG!=='undefined'&&MSG.send&&!MSG._pssil){ const orig=MSG.send; MSG.send=function(G,id){ const sil=id===PS&&!!G&&silent(G); const r=orig.apply(this,arguments);
      if(sil&&r&&r.ok){ try{ S.onSend(G); }catch(e){ console.warn('PSSIL send',e); } } return r; }; MSG._pssil=true; }
  /* ---------- 重聚 ---------- */
  const knows=(id,G)=>typeof STORY!=='undefined'&&!!STORY.knows&&STORY.knows(id,G);
  const inTW=(id,G)=>{ const p=typeof STORY!=='undefined'&&STORY.presence?STORY.presence(id,G):{here:true}; return !p||p.here!==false||p.kind!=='abroad'; };   /* 在臺灣（以安在日本那段不說，groupNote）*/
  S.groupItems=function(G){ const P=A(), out=[]; for(const [who,text] of P.reunion.group){ if((who==='zhe'||who==='heroine_01')&&!(knows(who,G)&&inTW(who,G))) continue; out.push({th:'g:public_law',from:who,text}); } return out; };   /* Alison、沛珊一定在（最後是她那一句、Alison 接）；阿哲、以安照認不認識、在不在臺灣 */
  S.reunite=function(G,day){ const P=A(), f=F(G); if(f.PS_REUNION!=null) return; const d=day!=null?day:(P?dk(P.reunion.plan.day):null); f.PS_REUNION=d!=null?d:G.day; f.PS_RECONNECT=true; };
  /* 不在群組：12/30 21:00 她私訊你（reunion.noGroup）；第二個選項沉默期一則私訊都沒傳＝換 optAlt */
  S.noGroupItems=function(G,end){ const N=A().reunion.noGroup, P=t=>({th:TH,from:PS,text:t}), L=N.msgs.map(P), alt=N.optAlt&&!(S.silenceCount(G,end)>0)?N.optAlt:null;
    L[L.length-1].ask={id:'pssil:nogroup',opts:N.opts.map((o,i)=>{ const x=alt&&i===alt.replaces?alt:o; return {t:x.t,say:x.say.map(t=>({from:PS,text:t})),pssilNg:i,pssilAlt:x===alt}; })}; return L; };
  S.ngAnswer=function(G,m,o,k){ const N=A()&&A().reunion.noGroup, R=S.rec(G); if(!N||R.ngAns!=null) return; const i=o&&o.pssilNg!=null?o.pssilNg:k, op=o&&o.pssilAlt?N.optAlt:N.opts[i];
    R.ngAns=o&&o.pssilAlt?'alt':i; if(op&&op.rel&&Object.keys(op.rel).length&&typeof SOCIAL!=='undefined'&&SOCIAL.adjust) SOCIAL.adjust(PS,Object.assign({},op.rel)); };
  /* 柏翰：2027-06-18 21:00 他私訊你兩則（posts.bohan.lines：她的動態那幾句換成這一句，沒交往的線）*/
  const stageAt=(id,lv)=>typeof SOCIAL!=='undefined'&&!!SOCIAL.STAGES&&!!SOCIAL.stage&&SOCIAL.STAGES.indexOf(SOCIAL.stage(id))>=SOCIAL.STAGES.indexOf(lv);
  S.bohanDM=function(G){ const BH='classmate_bohan', B=A().posts&&A().posts.bohan, d=dk(S.D.bohan); if(!B||d==null||typeof PHONE==='undefined'||PHONE.sent(G,'pssil_bohan')) return false;
    if(now(G)<T(d,21)||G.day>d+2||!silent(G)||!knows(BH,G)||!knows(PS,G)) return false;   /* 睡過、出遊回來（兩天內）照 21:00 補；再晚就不傳 */
    if(!hasContact(G,BH)){ if(!stageAt(BH,'FAMILIAR')||typeof INV==='undefined'||!INV.addContact) return false; INV.addContact(G,BH); }   /* 他傳訊息給你＝有你的聯絡方式（同 r2y3a3d.js 的 silentContact）*/
    return PHONE.at(G,d,21,B.lines.map(t=>({th:'p:'+BH,from:BH,text:t})),'pssil_bohan'); };
  /* plan.place：「溫州街（林家乾麵，wz_lin）」＝顯示「溫州街（林家乾麵）」、區域 wz_lin；只寫區域 id 也可以（顯示照 PLACES／店名）*/
  S.placeOf=function(place){ const t=String(place||''), m=/[，,]\s*([a-z][a-z0-9_]*)\s*）\s*$/.exec(t);
    if(m) return {label:t.replace(/[，,]\s*[a-z][a-z0-9_]*\s*(?=）\s*$)/,''),zone:m[1]};
    if(/^[a-z][a-z0-9_]*$/.test(t)){ const nm=(typeof PLACES!=='undefined'&&PLACES.names&&PLACES.names[t])||(typeof WZ_SHOPS_LAYOUT!=='undefined'&&WZ_SHOPS_LAYOUT[t.replace(/^wz_/,'')]&&WZ_SHOPS_LAYOUT[t.replace(/^wz_/,'')].name)||t; return {label:nm,zone:t}; }
    return {label:t,zone:null}; };
  S.planOut=function(G){ const P=A().reunion.plan, d=dk(P.day); if(d==null||typeof OUT==='undefined'||!OUT.plan) return false;
    return OUT.plan(G,{id:OID,ev:EV,day:d,h:P.h,late:0.5,place:S.placeOf(P.place).label,title:P.title,travel:P.travel,travelH:1/6}); };   /* 騎車約 10 分鐘 */
  /* ---------- 在 3D 的林家乾麵演（OUT.STAGE）---------- */
  /* 位子（照 wz_lin 的配置 WZ_SHOPS_LAYOUT.lin，不寫死座標）：她＝最裡面（z 最小）那一張可以坐的椅子；那一桌＋離它最近的另一桌＝併在一起的兩張；
     你＝她那一桌離她最遠的那一張（對面）；Alison＝她那一桌剩下的那一張；阿哲、以安＝另一桌（先坐玩家坐得了的椅子，再紅凳）；位子不夠的站在另一桌靠走道那一邊（stand）*/
  S.linSpots=function(L,ids){ L=L||(typeof WZ_SHOPS_LAYOUT!=='undefined'&&WZ_SHOPS_LAYOUT.lin); if(!L||!Array.isArray(L.seats)||!Array.isArray(L.tables)||L.tables.length<2) return null;
    const seat=q=>({x:q.x,z:q.z,yaw:q.yaw||0,lv:0,table:q.table}), of=n=>L.seats.filter(q=>q.table===n), d2=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
    const her=L.seats.filter(q=>!q.npcOnly&&!q.stool).sort((a,b)=>a.z-b.z||a.x-b.x)[0]; if(!her) return null;
    const T1=L.tables.find(t=>t.n===her.table), T2=L.tables.filter(t=>t!==T1).sort((a,b)=>d2(a,T1)-d2(b,T1))[0]; if(!T1||!T2) return null;
    const mine=of(T1.n).filter(q=>q!==her&&!q.npcOnly).sort((a,b)=>d2(b,her)-d2(a,her)), me=mine[0], yu=of(T1.n).find(q=>q!==her&&q!==me);
    const other=of(T2.n).sort((a,b)=>(a.npcOnly?1:0)-(b.npcOnly?1:0)||(a.stool?1:0)-(b.stool?1:0)||d2(a,T1)-d2(b,T1));
    if(!me||!yu) return null; const out={tables:[T1.n,T2.n],me:seat(me),cast:[{id:PS,seat:seat(her)},{id:'yu',seat:seat(yu)}],spare:other.map(seat)};
    const sx=T2.x+(T1.x>T2.x?0.55:-0.55);   /* 站的位置：另一桌靠她那一桌（走道）的那一邊 */
    out.stand={x:+sx.toFixed(2),z:T2.z,yaw:Math.atan2(T1.x-sx,T1.z-T2.z)};
    (ids||['zhe','heroine_01']).forEach((id,i)=>{ const q=out.spare[i]; out.cast.push(q?{id,seat:q}:{id,stand:out.stand}); });
    return out; };
  S.castIds=G=>['zhe','heroine_01'].filter(id=>knows(id,G)&&inTW(id,G));   /* 群組那一條：阿哲、以安認識、在臺灣才在 */
  S.staged=null;
  S.canStage=function(GM,zone){ const G=GM&&GM.G, E=GM&&GM.E; if(!G||!E||!E.player||!GM.enter||!GM.sitAt||!GM.spawnCharacter||typeof Z3==='undefined'||!Z3.ZONES||!Z3.ZONES[zone]) return false;
    if(G.zone!==zone&&!Z3.ZONES[G.zone]) return false; if(typeof OUT!=='undefined'&&OUT.fromHome) return false; if(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G)) return false;
    if(E.player.riding||(G.flags&&G.flags.companion)) return false; return true; };
  const ENTER_O={noFade:true,deferStory:true,noAutosave:true};
  const CRW=()=>typeof CROWD!=='undefined'&&CROWD.shopSeatTake?CROWD:null;
  S.outStage=async function(GM,q,ev){ if(!ev||ev.id!==EV||!A()) return null; const zone=S.placeOf(A().reunion.plan.place).zone; if(!zone||!S.canStage(GM,zone)) return null;
    const G=GM.G, P=GM.E.player, p=P.obj.position, prev={zone:G.zone,x:p.x,z:p.z,yaw:P.obj.rotation.y,lv:P.lv|0}, same=G.zone===zone;
    const L=(typeof WZ_SHOPS_LAYOUT!=='undefined'&&WZ_SHOPS_LAYOUT[zone.replace(/^wz_/,'')])||null, sp=S.linSpots(L,S.castIds(G)); if(!sp||!L.spawn) return null;
    const C=CRW(), seats=sp.cast.filter(c=>c.seat).map(c=>c.seat).concat([sp.me]), until=(+G.hour||0)+3;
    if(C){ for(const st of seats) C.shopSeatTake(zone,st,{G,instant:true,until,whoId:'pssil'}); if(C.shopStandTake&&sp.cast.some(c=>c.stand)) C.shopStandTake(zone,[sp.stand.x,sp.stand.z],{G,until,whoId:'pssil'}); }   /* 路人不坐、不站這幾個位子 */
    const free=()=>{ if(!C) return; for(const st of seats) if(C.shopSeatFree) C.shopSeatFree(zone,st); };
    const spawned=[];
    try{ if(P.seat&&GM.standUp) GM.standUp(P);
      if(!same) await GM.enter(zone,{x:L.spawn.x,z:L.spawn.z,yaw:L.spawn.yaw||0,lv:0},ENTER_O);
      if(G.zone!==zone) throw new Error('沒有進到 '+zone);
      for(const c of sp.cast){ if(GM.npc&&GM.npc[c.id]&&GM.removeNPC) GM.removeNPC(c.id);
        const n=c.seat?GM.spawnCharacter(c.id,c.seat.x,c.seat.z,{seat:c.seat,pose:'sit'}):GM.spawnCharacter(c.id,c.stand.x,c.stand.z,{yaw:c.stand.yaw,pose:'idle'});
        if(n){ n.frozen=true; n.pssil=true; spawned.push(c.id); if(!c.seat) n.pose=n.idlePose='idle'; } }
      GM.sitAt(P,sp.me); }
    catch(e){ console.warn('PSSIL.stage',e); free(); try{ if(P.seat&&GM.standUp) GM.standUp(P); if(!same&&G.zone!==prev.zone&&GM.enter) await GM.enter(prev.zone,{x:prev.x,z:prev.z,yaw:prev.yaw,lv:prev.lv},ENTER_O); }catch(e2){ console.warn('PSSIL.stage back',e2); } S.staged=null; return null; }   /* 換不進去＝照原本 2D（OUT：沒有 stage＝事件的 background）*/
    S.staged={zone,spots:sp,spawned};
    let done=false;
    return {restore:async()=>{ if(done) return; done=true; S.staged=null; free(); if(P.seat&&GM.standUp) GM.standUp(P);
      if(same){ for(const id of spawned) if(GM.npc&&GM.npc[id]&&GM.npc[id].pssil&&GM.removeNPC) GM.removeNPC(id); return; }   /* 本來就在店裡：大家散了 */
      await GM.enter(prev.zone,{x:prev.x,z:prev.z,yaw:prev.yaw,lv:prev.lv},ENTER_O); }}; };   /* 演完：回到出發的地方（OUT 接著把時間往後、出回程的字幕）*/
  if(typeof OUT!=='undefined'){ if(Array.isArray(OUT.STAGE)&&!OUT.STAGE.includes(S.outStage)) OUT.STAGE.push(S.outStage);
    if(OUT.bg&&!OUT._pssilBg){ const b0=OUT.bg; OUT.bg=function(id){ if(id==='pssil_lin') return S.staged?'blur':'dark'; return b0.apply(this,arguments); }; OUT._pssilBg=true; } }   /* 第一句的場景：在 3D 裡演＝模糊的 3D，沒換過去＝深色底 */
  S.tick=function(G){ if(!G||!G.flags||!A()) return false; let did=false;
    if(newLine(G)&&typeof OUT!=='undefined'&&OUT.get){ const q=OUT.get(G,'y3_ps_back_call'); if(q&&q.state==='planned'){ q.state='cancelled'; did=true; } }   /* 舊存檔：照原本的流程已經排了 8/7 那通電話（沒交往的線沒有這一通）*/
    if(!pre(G)) return did; const R=S.rec(G), P=A();
    /* reply1：3/15 21:00 以後 */
    { const b=dk(S.D.bday), l=dk(S.D.late); if(!R.r1&&b!=null&&l!=null&&silent(G)&&now(G)>=T(b,21)&&now(G)<T(l,0)){ const t=S.sent0315(G); if(t!=null&&S.countA(G)>=2) did=S.reply1(G,Math.max(T(b,22.5),t+0.5),'bday')||did; } }   /* 4/20 以後才讀到的舊存檔不補 3/15 那一次（不在對話串裡塞一則過去的回覆）：照 4/20 以後那一條 */
    if(P.posts) did=S.bohanDM(G)||did;
    /* 重聚：12/26 21:00 群組、排 12/29 18:30 */
    const g=dk(S.D.grp), e=dk(P.reunion.plan.day), eh=P.reunion.plan.h, ng=dk(S.D.noGroup); if(g==null||e==null) return did;
    const inG=typeof PHONE!=='undefined'&&!!PHONE.inGroup&&PHONE.inGroup(G,'public_law');
    if(inG){
      if(now(G)>=T(g,21)&&G.day<=e&&!PHONE.sent(G,'pssil_reunion_grp')){ PHONE.at(G,g,21,S.groupItems(G),'pssil_reunion_grp'); if(now(G)<T(e,eh)+0.5) S.planOut(G); did=true; }
      if(now(G)>=T(e,eh)){ const q=typeof OUT!=='undefined'&&OUT.get?OUT.get(G,OID):null, run=!!q&&!!OUT.isRunning&&OUT.isRunning(q.id);
        if(!run&&(!q||q.state!=='planned'||now(G)>(OUT.lateEnd?OUT.lateEnd(q):T(q.day,q.h)+(q.late||0.5)))){ S.reunite(G); did=true; } } }   /* 沒排成（群組那幾則太晚才到）、沒去、過了時間＝她照樣回來了（從那天起照一般的朋友）*/
    else if(ng!=null&&P.reunion.noGroup&&now(G)>=T(ng,21)){   /* 不在群組：12/30 21:00 她私訊你，那一刻記 PS_REUNION、PS_RECONNECT */
      if(hasContact(G,PS)&&typeof PHONE!=='undefined'&&!PHONE.sent(G,'pssil_nogroup')) PHONE.at(G,ng,21,S.noGroupItems(G,T(ng,21)),'pssil_nogroup');
      S.reunite(G,ng); did=true; }
    return did; };
  /* 那一場（2D；OUT.go 演）：（…）是旁白、其他是她；沉默期一則私訊都沒傳＝從「（散場的時候」那一句起換成 last2 */
  S.event=function(){ const P=A().reunion, line=t=>/^（/.test(t)?{speaker:null,text:t}:{speaker:PS,text:t}, C=f=>({custom:f});
    const sent=G=>S.silenceCount(G)>0, cut=P.scene.findIndex(t=>/^（散場的時候/.test(t)), k=cut>=0?cut:Math.max(0,P.scene.length-2);
    const dlg=[{scene:S.placeOf(P.plan.place).label,bg:'pssil_lin'}];
    P.scene.forEach((t,i)=>{ const it=line(t); if(i>=k) it.if=C(sent); dlg.push(it); });
    for(const t of P.last2){ const it=line(t); it.if=C(G=>!sent(G)); dlg.push(it); }
    dlg.push({call:async(G)=>{ S.reunite(G); }});
    const ev={id:EV,title:P.plan.title,participants:[PS],location:'any',trigger:'outing',once:true,hours:1.5,dialogue:dlg,
      outingMissed:G=>{ S.reunite(G); }};
    Object.defineProperty(ev,'background',{enumerable:true,get:()=>S.staged?'blur':'dark'});   /* 在 3D 的林家乾麵演（OUT.STAGE）＝模糊的 3D；沒換過去＝深色底（EVENTS.run 開頭照這個）*/
    return ev; };
  S.install=function(){ if(!A()) return;
    if(typeof STORY_EVENTS!=='undefined'&&!STORY_EVENTS.some(x=>x&&x.id===EV)) STORY_EVENTS.push(S.event());
    if(typeof STORY!=='undefined'&&Array.isArray(STORY.PHONE_RULES)&&!STORY.PHONE_RULES.includes(S.tick)) STORY.PHONE_RULES.push(S.tick);
    if(typeof PHONE!=='undefined'&&Array.isArray(PHONE.ON_ANSWER)&&!PHONE.ON_ANSWER.includes(S.onAnswer)) PHONE.ON_ANSWER.push(S.onAnswer); };
  S.install();
  return S;
})();
