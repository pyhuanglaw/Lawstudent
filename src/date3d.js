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
  return S;
})();
