/* ===== 校外單獨約會的核心（DATE-S1、DATE-S2 的資料面；SYS-02 的告白判斷）=====
   規格：企劃線 AA_128（使用者原話三條：公館不計數；至少四次加她的專屬心願地點；到出發時間由玩家決定要不要切到行程）、
   AA_126 4-1（六個階段）、AA_215（2026-10-17 使用者定案：取消各人的故事閘門，告白＝第 6 階＋4 次＋心願地點＋她當時願意）。
   地點與互動點：src/data/date_locations.js（DATE_DATA，tools/date/import_dates.py 照白名單匯入）。
   這個檔只有資料與判斷，不管畫面：預約（DATE-S3）、出發（S4、S5）、半互動畫面（S6）之後接上來，完成一趟時呼叫 DATE.complete。
   存檔（G 的新欄位，舊存檔讀進來時補預設值，不追溯——AA_128 1-3）：
     G.dateLog[id]＝{count, wishKnown, wish, byLoc:{D13:2}, cancels:[], last:{trip,day}}
     G.trips＝[{trip:'T0001', who, locs:['D13'], day, depart, back, transport, fare, by:'player'|'her', wish, status, spots:[], departed}]
     G.groupTrips＝[{loc, day, members:[…]}]（一群人去，不計數） */
'use strict';
const DATE=(function(){
  const S={};
  const D=()=>typeof DATE_DATA!=='undefined'?DATE_DATA:{locations:{},points:{points:{}},heroineIds:{}};
  S.HEROINES=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan','kexin'];
  /* 舊存檔：補欄位、不改已有的；不追溯以前的出遊、CG、告白 */
  S.rec=function(G){ if(!G) return null; if(!G.dateLog||typeof G.dateLog!=='object') G.dateLog={}; if(!Array.isArray(G.trips)) G.trips=[]; if(!Array.isArray(G.groupTrips)) G.groupTrips=[]; return G; };
  S.log=function(G,id){ S.rec(G); const L=G.dateLog[id]||(G.dateLog[id]={count:0,wishKnown:false,wish:false,byLoc:{},cancels:[],last:null});
    if(!L.byLoc) L.byLoc={}; if(!Array.isArray(L.cancels)) L.cancels=[]; return L; };
  S.loc=id=>D().locations[id]||null;
  S.wishOf=id=>{ const L=D().locations; for(const k in L) if(L[k].wishOf===id) return k; return null; };   /* 七位各一個專屬心願地點（AA_128 第 6 節） */
  /* 第 1 條：目的地在地點表裡（學校周邊日常生活圈以外）；公館、溫州街、Café、校園……不在表裡＝不計數 */
  S.isDateLoc=id=>!!S.loc(id);

  /* 一趟算不算一次正式校外單獨約會（AA_128 1-2：五個條件全部成立） */
  S.counts=function(t){ if(!t) return {ok:false,why:'沒有行程'};
    const locs=(t.locs||[]).filter(Boolean);
    if(!locs.length||!locs.every(S.isDateLoc)) return {ok:false,why:'目的地不在地點表（學校周邊不計數）'};
    if(!t.who||Array.isArray(t.who)||!S.HEROINES.includes(t.who)) return {ok:false,why:'要和一位女主角單獨去'};
    if(t.day==null||!t.depart||!t.back||!t.transport) return {ok:false,why:'行程要有日期、出發時間、交通、回程時間'};
    if(!t.departed) return {ok:false,why:'到了出發時間沒有選「出發」'};
    if(t.status!=='done'||!(t.spots||[]).length) return {ok:false,why:'要走完行程、至少做一個互動點'};
    return {ok:true}; };
  /* 第 6 階（AA_126 4-1）：好朋友（熟悉 ≥60、信任 ≥45、自在 ≥40），她的戀愛（npcRom）≥55、祐廷的戀愛（rom）≥30 */
  S.stageNum=function(id){ if(typeof SOCIAL==='undefined'||!SOCIAL.rel) return 0; const r=SOCIAL.rel(id), n=v=>+v||0;
    const fr=n(r.fam)>=60&&n(r.trust)>=45&&n(r.comf)>=40?4:(n(r.fam)>=40&&n(r.trust)>=25?3:(n(r.fam)>=20?2:1));
    if(fr>=4&&n(r.npcRom)>=55&&n(r.rom)>=30) return 6; if(fr>=3&&n(r.npcRom)>=30) return 5; return fr; };

  /* 走完一趟：符合五個條件才 +1（一趟只算一次；同一天去兩個地點也是一趟）；同一個地點記次數（遞減用）；心願地點和她單獨去＝wish */
  S.complete=function(G,t){ S.rec(G); const c=S.counts(t); if(!c.ok) return Object.assign({counted:false},c);
    if(G.trips.some(x=>x.trip===t.trip&&x.counted)) return {counted:false,why:'這一趟已經算過'};
    const L=S.log(G,t.who); L.count++; for(const l of t.locs) L.byLoc[l]=(L.byLoc[l]|0)+1;
    const w=S.wishOf(t.who); const wish=!!w&&t.locs.includes(w); if(wish){ L.wish=true; L.wishKnown=true; }
    L.last={trip:t.trip,day:t.day}; const rec=Object.assign({},t,{counted:true,wish}); const i=G.trips.findIndex(x=>x.trip===t.trip); if(i>=0) G.trips[i]=rec; else G.trips.push(rec);
    return {counted:true,count:L.count,wish}; };
  /* 一群人去（AA_128 1-2）：另外記，不計數；讓人物記得「上次大家一起去過」 */
  S.group=function(G,loc,day,members){ S.rec(G); G.groupTrips.push({loc,day,members:(members||[]).slice()}); };
  S.cancel=function(G,id,day){ const L=S.log(G,id); L.cancels.push(day); };
  S.knowWish=function(G,id){ S.log(G,id).wishKnown=true; };
  S.newTripId=function(G){ S.rec(G); return 'T'+String(G.trips.length+1).padStart(4,'0'); };

  /* 她當時願意（AA_128 3-1 第 5 點、AA_215 第 1 節，保留）：不在低潮期；沒有在等你說清楚（paused）；她自己沒有伴侶；她不知道祐廷有伴侶 */
  S.LOW={};   /* 各人的低潮期判斷 {id:G=>bool}（學姊分手後 6 週等，AA_218／BB_122 批准後接；2026-10-17 學姊相關暫停） */
  S.willing=function(G,id){ const F=G.flags||{};
    if(S.LOW[id]&&S.LOW[id](G)) return {ok:false,why:'low'};
    if(typeof ROM!=='undefined'&&ROM.get){ const R=ROM.get(G,id); if(R&&R.status==='paused') return {ok:false,why:'paused'}; if(ROM.knows&&ROM.knows(G,id).length) return {ok:false,why:'knows'}; }
    const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[id]; if(c&&c.partner&&typeof STORY!=='undefined'&&(STORY.partnerOn?STORY.partnerOn(G,c.partner):(STORY.inTerms&&STORY.inTerms(G,c.partner)))) return {ok:false,why:'partner'};
    if(F['dating_'+id]) return {ok:false,why:'dating'};
    return {ok:true}; };
  /* 告白的選項出不出現（AA_215：stage≥6 && count≥4 && wish && willing；沒有故事閘門）。
     學姊：分手、陪伴、分手後 6 週等條件在 AA_218 批准前暫停（2026-10-17 使用者人生主線修訂），先一律不出現。
     可昕（開場交往中）、已經在交往的：不檢查次數（AA_128 3-3）。 */
  S.HOLD={heroine_05:'AA_218 批准前暫停（學姊的分手時間與條件要重定）'};
  S.canConfess=function(G,id){ if(S.HOLD[id]) return {ok:false,why:'hold',note:S.HOLD[id]};
    const L=S.log(G,id), st=S.stageNum(id);
    if(st<6) return {ok:false,why:'stage',stage:st}; if(L.count<4) return {ok:false,why:'count',count:L.count}; if(!L.wish) return {ok:false,why:'wish'};
    const w=S.willing(G,id); if(!w.ok) return {ok:false,why:w.why}; return {ok:true}; };
  /* 人物頁的進度提示（AA_128 3-2；不寫數字） */
  S.hint=function(G,id){ const L=S.log(G,id); if(S.stageNum(id)<5) return null;
    if(L.count<4) return '再多一些兩個人出去的時間';
    if(!L.wish){ if(!L.wishKnown) return '她好像有一個很想去的地方'; const w=S.loc(S.wishOf(id)); return w?`她提過想去${w.name}`:null; }
    return null; };
  /* 一起去過的地方（人物頁）：每一次正式校外約會的地點和日期 */
  S.history=function(G,id){ S.rec(G); return G.trips.filter(t=>t.counted&&t.who===id).map(t=>({day:t.day,locs:t.locs.map(l=>(S.loc(l)||{}).name||l)})); };

  /* ===== 預約與出發（DATE-S3～S5 的第一版；AA_128 第 4 節）＝接在出遊系統（outings3d.js 的 OUT）上：時間到了問、轉場、回程照 OUT =====
     預約時算交通與回程：單程時間照地點資料「從臺大單程」；開車從宿舍出發要先回家取車，去回各多 30 分（AA_128 4-1，AA 暫定）。 */
  S.STAY={half:2.5,evening:2.5,day:6.5};   /* 停留時間（小時，不含交通）；overnight（兩天一夜）第一版不開放預約 */
  S.travel=function(locId,mode){ const L=S.loc(locId); if(!L) return null; const T=(L.transport||[]); const tr=T.find(x=>x.mode===mode)||T[0]; if(!tr) return null;
    const label=((D().codes||{}).mode||{})[tr.mode]||tr.mode; return {mode:tr.mode,minutes:tr.minutes|0,fare:tr.fare|0,label:String(label).replace(/（.*$/,'')}; };
  S.plan=function(G,o){ const locs=(o.locs||[]).filter(Boolean); if(!locs.length||!locs.every(S.isDateLoc)) return {ok:false,why:'地點不在約會地點表'};
    if(!S.HEROINES.includes(o.who)) return {ok:false,why:'對象不對'}; const L0=S.loc(locs[0]); const kind=(L0.kinds||['half'])[0]; if(!S.STAY[kind]) return {ok:false,why:'兩天一夜的行程這一版還不能約'};
    const tr=S.travel(locs[0],o.transport); if(!tr) return {ok:false,why:'到不了'}; const fromHome=!!o.fromHome; const pick=tr.mode==='car'&&!fromHome?0.5:0;
    const travelH=tr.minutes/60+pick, back=o.depart+travelH+S.STAY[kind]+travelH;
    return {ok:true,locs,kind,transport:tr.mode,travelLabel:tr.label,fare:tr.fare*2,travelH,depart:o.depart,back}; };
  S.book=function(G,o){ const P=S.plan(G,o); if(!P.ok) return P; S.rec(G); const id=S.newTripId(G);
    const trip={trip:id,who:o.who,locs:P.locs,day:o.day,depart:P.depart,back:P.back,transport:P.transport,fare:P.fare,by:o.by||'player',status:'booked',spots:[],departed:false,moves:0};
    G.trips.push(trip);
    if(typeof OUT!=='undefined'&&OUT.plan){ const nm=typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(o.who):o.who, L0=S.loc(P.locs[0]);
      OUT.plan(G,{id:'date_'+id,dateTrip:id,ev:null,day:o.day,h:P.depart+P.travelH,travelH:P.travelH,travel:P.travelLabel+' 約 '+Math.round(P.travelH*60)+' 分鐘',place:L0.name,title:'和'+nm+'去'+L0.name,late:1,back:'回到台大。'}); }
    return Object.assign({ok:true},trip); };
  S.trip=(G,id)=>{ S.rec(G); return G.trips.find(t=>t.trip===id)||null; };
  const hm=h=>typeof INV!=='undefined'&&INV.hhmm?INV.hhmm(h):String(h);
  const nameOf=id=>typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(id):id;
  /* 出發時間到了（AA_128 4-2、4-3）：出發／改時間／今天不去了。晚 60 分鐘以內照常出發；更晚只剩改時間、不去 */
  S.prompt=async function(GM,q){ const G=GM.G, t=S.trip(G,q.dateTrip); if(!t){ q.state='missed'; return 'no'; }
    const now=G.day*24+G.hour, dep=t.day*24+t.depart, late=now-dep>1;
    const opts=late?[{t:'改時間'},{t:'今天不去了'}]:[{t:'出發',hint:q.place+'　'+q.travel},{t:'改時間'},{t:'今天不去了'}];
    let k; GM.sceneBegin(); try{ await GM.say(null,'今天 '+hm(t.depart)+'，你約了'+nameOf(t.who)+'去'+q.place+'。'+(late?'……這次趕不上了。':'現在要出發嗎？')); k=await GM.choose(opts); } finally { GM.sceneEnd(); }
    const pick=opts[k]&&opts[k].t;
    if(pick==='出發'){ t.departed=true; t.status='going'; await OUT.go(GM,q); return 'go'; }
    if(pick==='改時間'){ return S.move(GM,q,t); }
    return S.drop(GM,q,t); };
  /* 改時間（第一版：同一天晚一小時、或明天同一時間；完整的日期時間選單是 DATE-S3）；改到第三次她說一句（BB 寫，還沒交）*/
  S.move=async function(GM,q,t){ const G=GM.G; let k; GM.sceneBegin(); try{ k=await GM.choose([{t:'晚一個小時'},{t:'改到明天同一個時間'},{t:'算了，今天不去了'}]); } finally { GM.sceneEnd(); }
    if(k===2) return S.drop(GM,q,t);
    const nd=k===1?t.day+1:t.day, nh=k===1?t.depart:Math.max(t.depart,G.hour)+1; const P=S.plan(G,{who:t.who,locs:t.locs,depart:nh,transport:t.transport});
    if(!P.ok||P.back>24.5){ if(GM.toast) GM.toast('這個時間回來太晚了，換一天吧。'); return S.move(GM,q,t); }
    t.day=nd; t.depart=nh; t.back=P.back; t.moves=(t.moves|0)+1; t.status='booked'; q.day=nd; q.h=nh+P.travelH; q.ask=null; q.state='planned'; return 'moved'; };
  /* 今天不去了（AA_128 4-3）：不加次數；30 天內第二次當天取消＝FLAKED_<id>，自在 -2（只扣這一次）*/
  S.drop=async function(GM,q,t){ const G=GM.G; t.status='cancelled'; q.state='missed'; const L=S.log(G,t.who); const recent=L.cancels.filter(d=>G.day-d<=30).length; S.cancel(G,t.who,G.day);
    if(recent>=1&&!G.flags['FLAKED_'+t.who]){ G.flags['FLAKED_'+t.who]=G.day; if(typeof SOCIAL!=='undefined'&&SOCIAL.adjust) SOCIAL.adjust(t.who,{comf:-2}); }
    return 'no'; };
  /* 30 天沒有再取消就清掉 FLAKED（每天呼叫一次也可以）*/
  S.daily=function(G){ const F=G.flags||{}; for(const id of S.HEROINES){ const k='FLAKED_'+id; if(F[k]!=null){ const L=S.log(G,id); const last=L.cancels.length?L.cancels[L.cancels.length-1]:F[k]; if(G.day-last>30) delete F[k]; } } };

  /* ===== 半互動約會（第一版：文字選單；2D 底圖＋熱區＋人物圖層是 DATE-S6）＝AA_128 第 5 節 =====
     抵達一句 → 選 2～4 個互動點（時間、花費照 point_specs；時間不夠的灰掉）→ 收尾 → 結算（5-3 的數值；不顯示數字）→ DATE.complete 計次 */
  S.points=function(locId){ const P=(D().points||{}).points||{}; return Object.keys(P).filter(k=>k.startsWith(locId+'.')).map(k=>Object.assign({id:k},P[k])); };
  S.GAIN=[{npcRom:5,rom:4,comf:4,fam:2,trust:2},{npcRom:3,rom:2,comf:2,fam:1,trust:1},{npcRom:2,rom:2,comf:1,fam:1,trust:0}];
  S.LIKE={like:{npcRom:1,comf:1},normal:{comf:1},dislike:{}};
  S.likeOf=(id,spot)=>((S.LINES&&S.LINES[spot.split('.')[0]]&&S.LINES[spot.split('.')[0]].likes||{})[id]||{})[spot]||'normal';   /* 她喜歡哪些互動點（BB／AA 標，lines/Dxx.json；還沒匯入時都算普通）*/
  S.scene=async function(GM,q){ const G=GM.G, t=S.trip(G,q.dateTrip); if(!t) return false; const who={name:nameOf(t.who),charId:t.who}; const loc=t.locs[0], L=S.loc(loc);
    const visits=(S.log(G,t.who).byLoc[loc]|0); const endH=t.day*24+t.back-S.travel(loc,t.transport).minutes/60; const spots=[];
    await GM.say(null,'（'+L.name+'。）'); if(L.admission&&GM.money) GM.money(-L.admission,L.name+' 門票');
    const pts=S.points(loc);
    for(let n=0;n<4;n++){ const now=G.day*24+G.hour; const left=pts.filter(p=>!spots.includes(p.id));
      const opts=left.map(p=>({t:p.name,hint:(p.min|0)+' 分'+(p.cost?'　'+p.cost+' 元':''),dis:now+(p.min|0)/60>endH,why:'時間差不多了'})).concat([{t:n?'差不多了，回去吧':'就這樣回去'}]);
      const k=await GM.choose(opts.map(o=>o.dis?{t:o.t,hint:o.why,dim:true}:o)); if(k>=left.length) break; if(opts[k].dis){ if(GM.toast) GM.toast('時間差不多了'); n--; continue; }   /* 灰掉的（時間不夠）按了只提示，不結束 */
      const p=left[k]; spots.push(p.id); if(p.act) await GM.say(null,'（'+p.act+'。）'); if(GM.advance) GM.advance((p.min|0)/60); if(p.cost&&GM.money) GM.money(-p.cost,p.name);
      const lk=S.likeOf(t.who,p.id); if(typeof SOCIAL!=='undefined'&&SOCIAL.adjust&&Object.keys(S.LIKE[lk]).length) SOCIAL.adjust(t.who,S.LIKE[lk]); }
    t.spots=spots;
    if(!spots.length){ if(typeof SOCIAL!=='undefined'&&SOCIAL.adjust) SOCIAL.adjust(t.who,{fam:1}); t.status='cancelled'; await GM.say(who,'……就這樣？'); return {counted:false}; }   /* 做了 0 個就離開：不算次數、熟悉 +1（「就這樣？」是 AA_128 5-2 的例句，各人的句子 BB 寫）*/
    t.status='done'; const firstWish=S.wishOf(t.who)===loc&&!S.log(G,t.who).wish;
    const r=S.complete(G,t);
    if(r.counted&&typeof SOCIAL!=='undefined'&&SOCIAL.adjust){ SOCIAL.adjust(t.who,S.GAIN[Math.min(visits,2)]); if(firstWish) SOCIAL.adjust(t.who,{npcRom:4,trust:3}); }
    if(r.counted&&r.count===1) G.flags['DATED_1_'+t.who]=true;   /* 第一次之後：當晚她傳一張照片或一句話（AA_128 5-5；訊息內容 BB 寫）*/
    await GM.say(null,'（今天去了'+L.name+'：'+spots.map(id=>(pts.find(p=>p.id===id)||{}).name).join('、')+'。）');   /* 結算畫面第一版：去了哪裡、做了什麼（不顯示好感數字）*/
    return r; };
  return S;
})();
