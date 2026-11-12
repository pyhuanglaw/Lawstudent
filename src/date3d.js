/* ===== 校外單獨約會的核心（DATE-S1、DATE-S2 的資料面；SYS-02 的告白判斷）=====
   規格：企劃線 AA_128（使用者原話三條：公館不計數；至少四次加她的專屬心願地點；到出發時間由玩家決定要不要切到行程）、
   AA_126 4-1（六個階段）、AA_215（2026-10-17 使用者定案：取消各人的故事閘門，告白＝第 6 階＋4 次＋心願地點＋她當時願意）。
   地點與互動點：src/data/date_locations.js（DATE_DATA，tools/date/import_dates.py 照白名單匯入）。
   這個檔只有資料與判斷，不管畫面：預約（DATE-S3）、出發（S4、S5）、半互動畫面（S6）之後接上來，完成一趟時呼叫 DATE.complete。
   存檔（G 的新欄位，舊存檔讀進來時補預設值，不追溯——AA_128 1-3）：
     G.dateLog[id]＝{count, wishKnown, wish, byLoc:{D13:2}, cancels:[], last:{trip,day}}
     G.trips＝[{trip:'T0001', who, locs:['D13'], day, depart, back, transport, fare, by:'player'|'her', wish, status, spots:[], departed}]
     G.groupTrips＝[{loc, day, members:[…]}]（一群人去，不計數）
   兩天一夜（DATE-OVERNIGHT-1021，AA_359）：trip 的 kind:'overnight'、nights:1、lodging、leave、night；G.flags.DATE_OVERNIGHT＝{人物 id:次數}（一趟記一次，AA_359 5-1 B9）。測試：node tests/date_overnight_unit.js */
/* 2026-11-11（使用者 X327 沛珊重寫）：S.T7A_YES、S.HOME_NO 沛珊的兩句照 AA_763_peishan_misc3.json@62460ea75 換（2 列，只換字）。逐字對稿：tests/peishan_misc3_1111_unit.js */
'use strict';
const DATE=(function(){
  const S={};
  const D=()=>typeof DATE_DATA!=='undefined'?DATE_DATA:{locations:{},points:{points:{}},heroineIds:{}};
  S.HEROINES=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan','kexin'];   /* 芯慈（XINCI-ROMANCE-1030）由 src/xcrom3d.js 的 XCROM.setOn(true) 加進來；10-30 17:1x 使用者否決「第一名／第二名」劇情，這條線先關（XCROM.ON false）*/
  /* 舊存檔：補欄位、不改已有的；不追溯以前的出遊、CG、告白 */
  S.rec=function(G){ if(!G) return null; if(!G.dateLog||typeof G.dateLog!=='object') G.dateLog={}; if(!Array.isArray(G.trips)) G.trips=[]; if(!Array.isArray(G.groupTrips)) G.groupTrips=[]; if(!G.dateMemory||typeof G.dateMemory!=='object') G.dateMemory={};
    if(G.flags&&typeof G.flags==='object'&&(!G.flags.DATE_OVERNIGHT||typeof G.flags.DATE_OVERNIGHT!=='object')) G.flags.DATE_OVERNIGHT={};   /* 兩天一夜住過幾次（AA_359 第 4 節；舊存檔＝{}）*/
    for(const t of G.trips){ if(!t||t.fareV) continue; if((t.status==='booked'||t.status==='going')&&typeof t.fare==='number') t.fare=Math.round(t.fare/2); t.fareV=2; }   /* BUG-DATE-FARE-DOUBLE-1021：舊版把來回車資又乘 2。還沒扣的（約好了、在路上）改成照表；已經扣過的（走完的）不退、不改紀錄（不追溯）*/
    for(const t of G.trips){ if(!t||t.fixedV) continue; const fx=t.kind!=='overnight'&&S.fixedOf((t.locs||[])[0]); if(fx&&(t.status==='booked'||t.status==='going')&&typeof t.back==='number') t.back+=(fx.minutes|0)/60; t.fixedV=1; }   /* SYS-03：固定段落（看電影 120 分）算進回程。舊版約好、還沒去的那一趟補上（不然散場以後互動點的時間不夠）*/
    return G; };
  S.log=function(G,id){ S.rec(G); const L=G.dateLog[id]||(G.dateLog[id]={count:0,wishKnown:false,wish:false,byLoc:{},cancels:[],last:null});
    if(!L.byLoc) L.byLoc={}; if(!Array.isArray(L.cancels)) L.cancels=[]; return L; };
  S.loc=id=>D().locations[id]||null;
  S.WISH_X={classmate_xinci:'D04'};   /* 地點表（date_locations.js，匯入的）以外加的心願地點：芯慈＝D04 西門町電影院（AA_537 5-1）*/
  /* 午夜場（芯慈的心願，AA_537b 8-2；AA-B 10-30 16:31 同意擴充：只開這一場）：D04 晚上 22:30 出發、23:30 開演、02:30 以前回到首都帝大（一般約會最晚 23:30 回來）。
     只有這一位、這個地點、22:00 以後出發才算；她的心願只算這一種（七點那一場是一般約會）。回來以後睡到隔天十點（story3d.js bedOptions 問 S.lateWake）*/
  S.MIDNIGHT={classmate_xinci:{loc:'D04',depart:22.5,stay:1.5,maxBack:26.75,label:'午夜場'}};
  S.midnightOf=o=>{ const M=o&&S.MIDNIGHT[o.who]; return M&&(o.locs||[])[0]===M.loc&&(+o.depart||0)>=22?M:null; };
  S.wishTripOk=t=>!S.MIDNIGHT[t&&t.who]||!!S.midnightOf(t);
  S.wishOf=id=>{ if(S.WISH_X[id]) return S.WISH_X[id]; const L=D().locations; for(const k in L) if(L[k].wishOf===id) return k; return null; };   /* 七位各一個專屬心願地點（AA_128 第 6 節） */
  /* 心願地點的名字（人物頁的提示）：沛珊大三起不上來，同一個心願事件改在「台南・美術館」（AA_349 K3；hometown3d.js 的 HV.museum）*/
  S.WISH_AWAY={classmate_peishan:'台南・美術館'};
  S.wishName=function(G,id){ if(S.WISH_AWAY[id]&&S.noNorthOn(G,id,G.day)) return S.WISH_AWAY[id]; const w=S.loc(S.wishOf(id)); return w?w.name:null; };
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
    if(fr>=4&&n(r.npcRom)>=55) return 6;   /* 祐廷自己的戀愛（rom）不當條件（使用者 11-10 17:4x 對 AA：「「你還沒有那樣看她」沒必要吧…玩家自己知道有沒有 不應該有這個數據」；AA_126 5d6d31e3e；ROM-NO-PLAYER-ROM-1110）*/ if(fr>=3&&n(r.npcRom)>=30) return 5; return fr; };

  /* 人物頁的進度條（D36；AA_126 4-1、AA_128 3-2）：友情（往第 4 階好朋友）、戀愛（七位，往第 5、6 階；第 6 階以後是告白的條件），不顯示數字，
     下面一句寫還差哪一種。交往中＝{dating:true}（人物頁只寫「交往中」）；男生朋友只有友情那一條。PROG_HINT 的自在、祐廷的戀愛、先成為好朋友三句：AA 10-21 22:3x 定（企劃線 0b057075，AA_126 4-1；「你還沒有那樣看她」和「她還沒有那樣看你」對著寫）*/
  S.PROG_HINT={fam:'再熟一點',trust:'再多信任一點',comf:'相處再自在一點',npcRom:'現在是朋友的感覺',npcRomAcq:'你們還在互相認識。',close:'先成為好朋友',
    count:'再多一些兩個人出去的時間',wishUnknown:'她好像有一個很想去的地方',wishPlace:'她提過想去{place}',
    npcRomHalf:'她好像開始在意你了',ambi:'你們之間有點曖昧'};   /* 曖昧分三段（ROM-STAGE-TEXT-1110，使用者 11-10 選擇題「照程度寫三段」：「都已經這個程度 她還沒有那樣看我? 要區分曖昧階段吧??」）：戀愛條還沒一半照舊、一半以上「開始在意」、第 6 階多一行「有點曖昧」 */
  S.progress=function(G,id){ if(typeof SOCIAL==='undefined'||!SOCIAL.rel) return null; const F=(G&&G.flags)||{}; if(F['dating_'+id]) return {dating:true};
    const r=SOCIAL.rel(id), n=v=>+v||0, v={fam:n(r.fam),trust:n(r.trust),comf:n(r.comf),npcRom:n(r.npcRom),rom:n(r.rom)};
    const fr=v.fam>=60&&v.trust>=45&&v.comf>=40?4:(v.fam>=40&&v.trust>=25?3:(v.fam>=20?2:1));
    const bar=need=>{ let k=null, lo=1; for(const key in need){ const x=Math.min(1,Math.max(0,v[key]/need[key])); if(x<lo-1e-9){ lo=x; k=key; } } return {pct:lo,hint:k?((k==='npcRom'||k==='rom')&&lo>=0.5?S.PROG_HINT[k+'Half']:S.PROG_HINT[k]):''}; };
    const NEED=[null,{fam:20},{fam:40,trust:25},{fam:60,trust:45,comf:40}];
    const out={fr:fr>=4?{pct:1,hint:''}:bar(NEED[fr]),rom:null};
    if(!S.HEROINES.includes(id)) return out;
    const st=S.stageNum(id);
    if(st<5){ out.rom=bar({npcRom:30}); if(fr<3&&out.rom.hint===S.PROG_HINT.npcRom) out.rom.hint=S.PROG_HINT.npcRomAcq; }   /* 還不是朋友（認識、有點熟）、還沒過一半＝「你們還在互相認識。」（AA 11-10 17:40）*/   /* ROM-PRIVATE-DATE-1110：認識、有點熟也看得到她的戀愛（原本朋友以下一律 0，使用者「都約這麼多次還沒有戀愛?」）*/
    else if(st===5){ const b=bar({npcRom:55}); out.rom=fr<4?{pct:Math.min(b.pct,0.5),hint:S.PROG_HINT.close}:b; }
    else { const L=(G&&G.dateLog&&G.dateLog[id])||{count:0,wishKnown:false,wish:false}, NC=S.COUNT_NEED[id]||4, c=Math.min(NC,L.count|0);   /* 芯慈要 6 次（AA_537 G9）*/
      const pct=(c/NC+(L.wishKnown?0.5:0)+(L.wish?0.5:0))/2;
      const hint=c<NC?S.PROG_HINT.count:(!L.wishKnown?S.PROG_HINT.wishUnknown:(!L.wish?S.PROG_HINT.wishPlace.replace('{place}',S.wishName(G,id)||'一個地方'):''));
      out.rom={pct,hint,mood:S.PROG_HINT.ambi}; }   /* 第 6 階：多一行「你們之間有點曖昧」（game3d.js progHTML）*/
    return out; };

  /* 走完一趟：符合五個條件才 +1（一趟只算一次；同一天去兩個地點也是一趟）；同一個地點記次數（遞減用）；心願地點和她單獨去＝wish */
  S.complete=function(G,t){ S.rec(G); const c=S.counts(t); if(!c.ok) return Object.assign({counted:false},c);
    if(G.trips.some(x=>x.trip===t.trip&&x.counted)) return {counted:false,why:'這一趟已經算過'};
    const L=S.log(G,t.who); L.count++; for(const l of t.locs) L.byLoc[l]=(L.byLoc[l]|0)+1;
    const w=S.wishOf(t.who); const wish=!!w&&t.locs.includes(w)&&S.wishTripOk(t); if(wish){ L.wish=true; L.wishKnown=true; }
    L.last={trip:t.trip,day:t.day}; const rec=Object.assign({},t,{counted:true,wish}); const i=G.trips.findIndex(x=>x.trip===t.trip); if(i>=0) G.trips[i]=rec; else G.trips.push(rec);
    return {counted:true,count:L.count,wish}; };
  /* 一群人去（AA_128 1-2）：另外記，不計數；讓人物記得「上次大家一起去過」 */
  S.group=function(G,loc,day,members){ S.rec(G); G.groupTrips.push({loc,day,members:(members||[]).slice()}); };
  /* 去她的城市那一天＝一次正式校外約會（AA_349 K3：沛珊放榜以後只能私下約，去台南（學期中）、去台中（寒暑假）那一天算一次；告白條件的 4 次可以這樣累積）。
     不是地點表的地點：另外記一筆 trip（kind:'visit'、locs＝城市名，人物頁「一起去過的地方」照寫），只加次數；同一天只算一次。wish＝那一天是心願事件（台南・美術館）*/
  S.countVisit=function(G,id,place,o){ o=o||{}; S.rec(G); const L=S.log(G,id), d=o.day==null?G.day:o.day;
    if(G.trips.some(t=>t.kind==='visit'&&t.who===id&&t.day===d&&t.counted)) return {counted:false,why:'這一天已經算過'};
    L.count++; const t={trip:S.newTripId(G),who:id,locs:[place],day:d,kind:'visit',by:'hv',status:'done',counted:true,wish:!!o.wish,spots:[],departed:true};
    if(o.wish){ L.wish=true; L.wishKnown=true; } G.trips.push(t); L.last={trip:t.trip,day:d}; return {counted:true,count:L.count,wish:!!o.wish}; };
  S.cancel=function(G,id,day){ const L=S.log(G,id); L.cancels.push(day); };
  S.knowWish=function(G,id){ S.log(G,id).wishKnown=true; };
  S.newTripId=function(G){ S.rec(G); return 'T'+String(G.trips.length+1).padStart(4,'0'); };

  /* 她當時願意（AA_128 3-1 第 5 點、AA_215 第 1 節，保留）：不在低潮期；沒有在等你說清楚（paused）；她自己沒有伴侶；她不知道祐廷有伴侶 */
  S.LOW={};   /* 各人的低潮期判斷 {id:G=>bool}（學姊沒有男朋友、沒有分手後的低潮：使用者 2026-10-17 P0；之後別人有再接） */
  S.willing=function(G,id){ const F=G.flags||{};
    if(S.LOW[id]&&S.LOW[id](G)) return {ok:false,why:'low'};
    if(typeof ROM!=='undefined'&&ROM.get){ const R=ROM.get(G,id); if(R&&R.status==='paused') return {ok:false,why:'paused'};
      if(ROM.knows){ const K=ROM.knows(G,id).filter(p=>!(F.OPEN_OK&&F.OPEN_OK[id]&&F.OPEN_OK[id][p])), KO=typeof TERMEND!=='undefined'&&TERMEND.KNOWS_OK?TERMEND.KNOWS_OK[id]:null;
        if(K.length&&!(KO&&KO(G))) return {ok:false,why:'knows'}; } }   /* AA_483 第 1 節第 7 點（七位一樣）：她知道祐廷有別人、她的知情條件（TERMEND.KNOWS_OK）過了＝照樣出告白的選項，進去走知情對話（S.confess → MREL.knowGate）；沒過＝照舊不出 */
    const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[id]; if(c&&c.partner&&typeof STORY!=='undefined'&&(STORY.partnerOn?STORY.partnerOn(G,c.partner):(STORY.inTerms&&STORY.inTerms(G,c.partner)))) return {ok:false,why:'partner'};
    if(F['dating_'+id]) return {ok:false,why:'dating'};
    return {ok:true}; };
  /* 告白的選項出不出現（AA_215：stage≥6 && count≥4 && wish && willing；沒有故事閘門）。
     學姊：沒有男朋友（使用者 2026-10-17 P0）；筆試 2026-02-02 以前婉拒（decline:'preexam'）；筆試後到放榜 2026-03-23 以前也婉拒（decline:'prerank'，使用者同意 BB_190 LOGIC-14、AA_223 第 1 節 @8dac7e49）；放榜以後照一般條件。
     可昕（開場交往中）、已經在交往的：不檢查次數（AA_128 3-3）。 */
  S.HOLD={};   /* 學姊原本在這裡暫停（等分手條件）；使用者 2026-10-17 P0：她一開始就沒有男朋友 → 拿掉，改成下面的筆試前婉拒 */
  /* 學姊：研究所筆試（2026-02-02）結束以前不想交往（BB_122 ★-1、★-2）：條件到齊時告白的選項照樣出現，她婉拒、不鎖線（decline:'preexam'，事件 ev_sis_confess_preexam 照 BB_122 ★-2）；筆試以後照一般條件 */
  S.SIS_EXAM_END='2026-02-02';
  S.SIS_RESULT_DAY='2026-03-23';   /* 學姊研究所放榜（告白的分界，AA_223 第 1 節 @8dac7e49）*/
  S.sisPrerank=G=>{ const d=typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(S.SIS_RESULT_DAY):null; return d!=null&&G.day<d&&!S.sisPreexam(G); };   /* 筆試考完、還沒放榜 */
  S.sisPreexam=G=>{ const d=typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(S.SIS_EXAM_END):null; return d!=null&&(G.day<d||(G.day===d&&(G.hour%24)<17)); };   /* 2/2 考完（當天 17:00）以前都算筆試前 */
  /* 學姊分開以後重新開始（AA_386 第 4 節，src/sis_b4_3d.js）：分開過＝{done（這一次分開演過 ev_sis_three_conditions）, dates（那以後的正式校外約會次數）, ready}；沒分開過、別人＝null（照一般條件）*/
  S.rebuildOf=(G,id)=>id==='heroine_05'&&typeof SISB4!=='undefined'&&SISB4.rebuild?SISB4.rebuild(G):null;
  S.rebuildConfess=(G,id)=>{ const r=S.rebuildOf(G,id); return !!(r&&r.ready); };
  S.COUNT_NEED={classmate_xinci:6};   /* 告白要的正式約會次數（一般 4；芯慈 6，AA_537 G9）*/
  S.canConfess=function(G,id){ if(S.HOLD[id]) return {ok:false,why:'hold',note:S.HOLD[id]};
    if(id==='classmate_xinci'&&!(typeof XCROM!=='undefined'&&XCROM.allGates(G))) return {ok:false,why:'xc'};   /* 芯慈：G1～G10（src/xcrom3d.js）*/
    const L=S.log(G,id), st=S.stageNum(id), rb=S.rebuildOf(G,id);
    if(st<6) return {ok:false,why:'stage',stage:st};
    if(rb){ if(!rb.done) return {ok:false,why:'rebuild'}; if(rb.dates<2) return {ok:false,why:'count',count:rb.dates}; }   /* AA_386 第 4 節：分開過的學姊——演過 ev_sis_three_conditions（SIS_REBUILD）才會再出現告白；之後兩次正式校外約會（不要求四次，AA_128 3-3、BB_122 9-2）*/
    else if(L.count<(S.COUNT_NEED[id]||4)) return {ok:false,why:'count',count:L.count};
    if(!L.wish) return {ok:false,why:'wish'};
    const w=S.willing(G,id); if(!w.ok) return {ok:false,why:w.why}; if(id==='heroine_05'&&S.sisPreexam(G)) return {ok:true,decline:'preexam'}; if(id==='heroine_05'&&S.sisPrerank(G)) return {ok:true,decline:'prerank'}; return {ok:true}; };
  /* 人物頁的進度提示（AA_128 3-2；不寫數字） */
  S.hint=function(G,id){ const L=S.log(G,id); { const rb=S.rebuildOf(G,id); if(rb&&rb.done) return '她在等她說好的那一天'; }   /* AA_386 第 6 節：演過 ev_sis_three_conditions、還沒重新交往的期間 */ if(S.stageNum(id)<5) return null;
    if(L.count<4) return '再多一些兩個人出去的時間';
    if(!L.wish){ if(!L.wishKnown) return '她好像有一個很想去的地方'; const nm=S.wishName(G,id); return nm?`她提過想去${nm}`:null; }
    return null; };
  /* 一起去過的地方（人物頁）：每一次正式校外約會的地點和日期 */
  S.history=function(G,id){ S.rec(G); return G.trips.filter(t=>t.counted&&t.who===id).map(t=>({day:t.day,locs:t.locs.map(l=>(S.loc(l)||{}).name||l)})); };
  /* 人物頁「一起去過的地方」一行一趟（AA_128 第 163 行：每一次正式校外約會的地點和日期；照時間排）：「2026/10/17　淡水金色水岸」。
     畫面在 game3d.js 的 personHTML（progHTML 下面一段），不在這個檔 */
  S.historyText=function(G,id){ const dl=d=>{ const x=typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(d):null; return x&&x.m?x.y+'/'+x.m+'/'+x.d:'第 '+d+' 天'; };
    return S.history(G,id).slice().sort((a,b)=>a.day-b.day).map(h=>dl(h.day)+'　'+h.locs.join('、')); };

  /* ===== 預約與出發（DATE-S3～S5 的第一版；AA_128 第 4 節）＝接在出遊系統（outings3d.js 的 OUT）上：時間到了問、轉場、回程照 OUT =====
     預約時算交通與回程：單程時間照地點資料「從臺大單程」；開車從宿舍直接出發（AA_599，原本 AA_128 4-1 先回家取車、去回各多 30 分，AA 暫定）。 */
  S.STAY={half:2.5,evening:2.5,day:6.5};
  /* 固定段落（AA_128 5-1 第 2 步、date_locations.json _codes.fixed：D04、D05 看電影 120 分、電影票 300／260）：抵達那一句之後先演、照資料推進時間、扣錢，不算互動點；
     散場以後再選互動點——停留時間另外加這 120 分（不吃掉互動點的時間，回程跟著晚；預約畫面的回程、23:30 的檢查、預計花費都算進去）*/
  S.fixedOf=locId=>{ const L=S.loc(locId), f=L&&L.fixed; return f&&(f.minutes|0)>0?f:null; };   /* 當天來回的停留時間（小時，不含交通）；兩天一夜（overnight）另外算（S.OVERNIGHT、S.planOvernight）*/
  /* ===== 兩天一夜（DATE-OVERNIGHT-1021；企劃線 AA_359@e75d1cce（第 5 節：AA 回十三題、5-2 九句改字），大原則 AA_128 第 119 行、第 52 行，AA_126 1-1）=====
     第一天 09:00 出發 → 到達那一句 → 互動點最多 2 個 → 晚上那一句旁白（S.NIGHT）→ 換日不演（STORY.travelOvernight）→ 第二天 08:30「（第二天早上。）」＋她一句（S.MORNING）
     → 互動點最多 2 個（第一天走過的不列）→ 19:00 前離開那一句 → 回程（照當天來回的回程）。D31＋D32 同一趟：第一天日月潭、第二天清境，各用各自的到達、離開句（日月潭的離開句不用）。
     第 6 階或交往中才約得到（S.canOvernight）；兩天都要空、她兩天都在那個地方或臺北（S.overnightWhere）；考試週不能排（AA_126 1-1）；錢＝交通照表＋住宿（地點資料的 lodging，2,500）。
     有時間的三個互動點（5-1 B7）：D28 夕陽、D30 星星只在第一天的第二個點、演完至少到 18:00／20:00；D32 雲海只在第二天的第一個點（S.TIMED）。D28 兩天都用 d28a，選夕陽那一點才換 d28b（B12，S.POINT_BG）。
     D31＋D32 第二天：早上那一句之後「（吃完早餐，你們開車上清境。一個半小時。）」、時間推 1.5 小時，再到清境的到達那一句（B8，S.COMBO_DRIVE）。
     存檔：trip 多 nights:1、lodging、leave（第二天離開的時間）、night（那一晚是哪一種）；G.flags.DATE_OVERNIGHT＝{人物 id:次數}（一趟一次、D31＋D32 也是一次；現在只記，AA_359 第 4 節、5-1 B9；還沒發布，不轉舊存檔）。舊存檔沒有＝當天來回、{}。 */
  S.OVERNIGHT={depart:9,morning:8.5,leave:19,dayEnd:22,maxSpots:2};   /* 第一天出發、第二天早上、第二天最晚離開（AA_359 第 1 節）；第一天互動點做到 22:00（稿沒寫，LAWWW 暫定）；每天最多 2 個 */
  S.lodging=()=>(D().lodging|0)||2500;
  S.canOvernight=(G,id)=>!!(G&&G.flags&&G.flags['dating_'+id])||S.stageNum(id)>=6;   /* 第 6 階或交往中（AA_128 第 119 行）*/
  S.travel=function(locId,mode){ const L=S.loc(locId); if(!L) return null; const T=(L.transport||[]); const tr=T.find(x=>x.mode===mode)||T[0]; if(!tr) return null;
    const label=((D().codes||{}).mode||{})[tr.mode]||tr.mode; return {mode:tr.mode,minutes:tr.minutes|0,fare:tr.fare|0,label:String(label).replace(/（.*$/,'')}; };
  /* DRIVE-PICKUP-1105（AA_704 第 2 節 @55a1c5a53，使用者 11-05 08:0x 選「走去新月台停車場取車」）：開車＝先走到望月台停車場（約 5 分鐘）再開；路程寫「走到望月台停車場約 5 分鐘，開車約 X 分鐘」。
     第一步：時間、路程字、第一次取車的旁白（outings3d.js 出發那一下）；第二步（下一班）：真的走到停車場、在車旁邊按「開車出發」、一起去的人約在停車場入口（Z3.XSG.carSpot） */
  /* 使用者 11-05 11:1x「走去開車不是真的要花時間 主要就是讓玩家真的知道現在是開車」：取車不另外加時間、路程字照原本（AA_704 的「走到望月台停車場約 5 分鐘」那一句不用）；取車旁白、走到停車場照做 */
  S.CAR_PICK_H=0; S.CAR_PICK_TEXT='';
  S.travelText=P=>P.travelLabel+' 約 '+Math.round(P.travelH*60)+' 分鐘';
  S.plan=function(G,o){ const locs=(o.locs||[]).filter(Boolean); if(!locs.length||!locs.every(S.isDateLoc)) return {ok:false,why:'地點不在約會地點表'};
    if(!S.HEROINES.includes(o.who)) return {ok:false,why:'對象不對'}; const L0=S.loc(locs[0]); const kind=o.kind&&(L0.kinds||[]).includes(o.kind)?o.kind:(L0.kinds||['half'])[0];
    if(kind==='overnight') return S.planOvernight(G,o,locs); if(!S.STAY[kind]) return {ok:false,why:'這個地點不能這樣約'};
    const tr=S.travel(locs[0],o.transport); if(!tr) return {ok:false,why:'到不了'}; const fromHome=!!o.fromHome; const pick=tr.mode==='car'?S.CAR_PICK_H:0;   /* DRIVE-PICKUP-1105（AA_704 第 2 節）：開車先走到望月台停車場取車（約 5 分鐘）；AA_599 更正（企劃線 8842d6105，使用者「開車就是為了不要搭捷運」）：開車從宿舍直接出發，不算取車 */
    const fx=S.fixedOf(locs[0]), fixH=fx?(fx.minutes|0)/60:0;
    const MN=S.midnightOf(Object.assign({},o,{locs})), travelH=tr.minutes/60+pick, back=o.depart+travelH+fixH+(MN?MN.stay:S.STAY[kind])+travelH;   /* 午夜場：先吃宵夜、選片，電影，散場就回（停留 1.5 小時）*/
    return {ok:true,locs,kind,transport:tr.mode,travelLabel:tr.label,fare:tr.fare,travelH,depart:o.depart,back,fixedH:fixH}; };   /* fare：地點資料的交通費就是來回（AA_128 第 70 行「交通費：祐廷自己的來回交通」、date_locations.json _codes.fare「祐廷自己的來回交通費」）——不再乘 2（BUG-DATE-FARE-DOUBLE-1021）*/
  /* 兩天一夜的行程：去程照第一個地點、回程照最後一個地點（D31＋D32＝去日月潭、從清境回來；清境要車＝整趟開車）；車資＝去程那一半＋回程那一半（同一個地點＝照表的來回；D31＋D32＝(1000＋1200)÷2）；back＝第二天回到的時間 */
  S.planOvernight=function(G,o,locs){ const O=S.OVERNIGHT, L0=S.loc(locs[0]), Lz=S.loc(locs[locs.length-1]);
    if(locs.length>2||(locs.length===2&&!((L0.combo||[]).includes(locs[1])&&(Lz.kinds||[]).includes('overnight')))) return {ok:false,why:'這兩個地點不能排在同一趟'};
    const mode=locs.some(l=>(S.loc(l)||{}).needsCar)?'car':o.transport, go=S.travel(locs[0],mode), bk=S.travel(locs[locs.length-1],mode);
    if(!go||!bk||(locs.length>1&&go.mode!==bk.mode)) return {ok:false,why:'到不了'}; const pick=go.mode==='car'?S.CAR_PICK_H:0;   /* DRIVE-PICKUP-1105（AA_704）：先走到望月台停車場取車；AA_599 更正：開車從宿舍直接出發 */
    const travelH=go.minutes/60+pick, backH=bk.minutes/60+pick, depart=o.depart!=null?o.depart:O.depart, leave=Math.min(O.leave,23.5-backH);
    return {ok:true,locs,kind:'overnight',nights:1,transport:go.mode,travelLabel:go.label,fare:Math.round((go.fare+bk.fare)/2),lodging:S.lodging(),travelH,backH,depart,leave,back:leave+backH}; };
  S.onDay=(t,day)=>t.day===day||(t.kind==='overnight'&&t.day+(t.nights||1)===day);   /* 這一趟佔不佔這一天（兩天一夜佔兩天）*/
  /* 校外約會佔掉的時間（給別的排程看，BUG-DATE-OVERLAP-1021：校園邀約 INV、對方約你 INV.answer、去她的縣市 HV、畢業後每月一格 PG、寒暑假報名 VAC、118 巷午餐）：
     約好了、在路上的那幾趟；當天來回＝出發到回來，兩天一夜＝第一天出發到第二天回來。tripAt(G,day,h,stay)＝撞到的那一趟或 null；tripOn＝那一天有沒有；tripDays＝佔掉的日子 */
  const liveTrip=t=>!!t&&(t.status==='booked'||t.status==='going');
  S.spanOf=t=>[t.day*24+(+t.depart||0),(t.day+(t.kind==='overnight'?(t.nights||1):0))*24+(+t.back||0)];
  S.tripAt=function(G,day,h,stay){ if(!G||!Array.isArray(G.trips)) return null; const a=day*24+(+h||0), b=a+Math.max(0,+stay||0);
    return G.trips.find(t=>{ if(!liveTrip(t)) return false; const [x,y]=S.spanOf(t); return b>a?(a<y&&x<b):(a>=x&&a<y); })||null; };
  S.tripOn=(G,day)=>S.tripAt(G,day,0,24);
  S.tripDays=G=>{ const out=new Set(); for(const t of (G&&G.trips)||[]) if(liveTrip(t)) for(let d=t.day;d<=t.day+(t.kind==='overnight'?(t.nights||1):0);d++) out.add(d); return out; };
  S.tripTitle=t=>'和'+nameOf(t.who)+'去'+(t.locs||[]).map(l=>(S.loc(l)||{}).name||l).join('、')+(t.kind==='overnight'?'（兩天一夜）':'');
  S.book=function(G,o){ if(o.fromHome==null) o=Object.assign({},o,{fromHome:S.fromHomeOn(G,o.day)}); const P=S.plan(G,o); if(!P.ok) return P; if(P.kind==='overnight'&&!S.canOvernight(G,o.who)) return {ok:false,why:'兩天一夜要第 6 階或交往中'}; S.rec(G); const id=S.newTripId(G);
    const trip={trip:id,who:o.who,locs:P.locs,day:o.day,depart:P.depart,back:P.back,kind:P.kind,transport:P.transport,fare:P.fare,fareV:2,by:o.by||'player',status:'booked',spots:[],departed:false,moves:0,fixedV:1};   /* fareV 2＝車資照表（來回）*/
    if(P.kind==='overnight') Object.assign(trip,{nights:1,lodging:P.lodging,leave:P.leave});
    G.trips.push(trip);
    if(typeof OUT!=='undefined'&&OUT.plan){ const nm=typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(o.who):o.who, names=P.locs.map(l=>S.loc(l).name).join('、');
      OUT.plan(G,{id:'date_'+id,dateTrip:id,ev:null,day:o.day,h:P.depart+P.travelH,travelH:P.travelH,travel:S.travelText(P),place:names,car:P.transport==='car',title:'和'+nm+'去'+names+(P.kind==='overnight'?'（兩天一夜）':''),late:1,back:'回到首都帝大。',alarm:false}); }
    return Object.assign({ok:true},trip); };
  S.trip=(G,id)=>{ S.rec(G); return G.trips.find(t=>t.trip===id)||null; };
  /* ===== 預約（AA_128 4-1；DATE-S3）=====
     玩家約她：地點（有底圖的才列）→ 日期（今天起 7 天）→ 出發時間（照停留類型）→ 交通 → 確認（對象、地點、日期、出發、交通、預計花費、回程）→ 加入行事曆（OUT）。
     衝突的時段直接不能選、寫原因：考試、已經約好的行程（含校園邀約、一天最多兩場、一日遊那天只能一場）、她的作息（上課、打工）、回來超過 23:30、錢不夠。
     祐廷自己的課：可以排，提示錯過哪一堂（法律課不點名）或少一次出席（非法律課，AA_126 1-4）。
     誰約得到：學姊以外照 INV.whyNot（有聯絡方式、不是陌生人）＋AA_126 4-1「第 5 階以後的私下約會」（交往中不看階段）＋她自己沒有伴侶、沒有在等你說清楚；
     任一方有伴侶的完整規則是 DATE-S7（AA_128 4-5）。她指定的交通（DATE_PREFS，BB 填）、改交通時她的一句、改三次她的一句：BB 交了再接。 */
  S.listable=function(locId){ const L=S.loc(locId); if(!L) return false; return S.bgKeys(locId).length>0&&!!((LN().loc||{})[locId]);   /* 有底圖才出現在清單（DATE-L01～L32）；底圖也給自由出行用（DL-06B 的貓空、九份…），約會要等那個地點的台詞審完匯入才列（不然到了現場她一句話都沒有）*/ };
  /* 地點的底圖（OUT.BG 的 dxx_base_*）：dxx 後面多一個字母的（D28 的 d28a、d28b）用第一張（a）——AA_359 5-1 B12：d28b 是夕陽圖，兩天都用 d28a，選「海堤的夕陽」才換（S.POINT_BG）；其他照登記的順序第一張 */
  S.bgKeys=function(locId){ const B=typeof OUT!=='undefined'&&OUT.BG?OUT.BG:{}, re=new RegExp('^'+String(locId).toLowerCase()+'[a-z]?_base'); return Object.keys(B).filter(k=>re.test(k)); };
  S.bgKey=function(locId){ const K=S.bgKeys(locId); if(!K.length) return null; const lt=K.filter(k=>/^d\d\d[a-z]_base/.test(k)).sort(); return lt.length?lt[0]:K[0]; };   /* 第二個參數（第幾天）不再用：兩天同一張（B12）*/
  /* 某個互動點自己的底圖（B12：「海堤的夕陽」＝d28b）：OUT.BG 裡那個字首的第一張；沒有＝null（照原本那一張）*/
  S.POINT_BG={'D28.sunset':'d28b'};
  S.pointBg=function(pid){ const pre=S.POINT_BG[pid]; if(!pre) return null; return S.bgKeys(String(pid).split('.')[0]).find(k=>k.indexOf(pre+'_base')===0)||null; };
  S.kindAt=function(locId,depart){ const K=((S.loc(locId)||{}).kinds||['half']).filter(k=>S.STAY[k]); if(!K.length) return null; return depart>=16&&K.includes('evening')?'evening':(K.includes('half')||K.includes('day')?K.find(k=>k!=='evening'):K[0]); };
  S.TIMES={half:[9,10,13,14,15],evening:[17,18,19],day:[8,9],overnight:[9]};   /* 兩天一夜：第一天 09:00 出發（AA_359 第 1 節）*/
  /* 「兩天一夜…」清單：可以住一晚的地點（D26、D27 一日或兩天一夜都開；D28～D32 只有兩天一夜），有底圖、有台詞的才列 */
  S.overnightLocs=()=>Object.keys(D().locations).filter(k=>((S.loc(k)||{}).kinds||[]).includes('overnight')&&S.listable(k));
  /* 同一趟的第二天（AA_128 第 116 行：D31＋D32）：第二個地點也要能住一晚、而且在清單上（有底圖、有台詞）*/
  S.comboOf=locId=>((S.loc(locId)||{}).combo||[]).find(c=>((S.loc(c)||{}).kinds||[]).includes('overnight')&&S.listable(c)&&S.loc(locId).id<c)||null;
  S.canAsk=function(G,id,o){ if(!S.HEROINES.includes(id)) return {ok:false,why:'不能約'};   /* o.face：當面約（不用聯絡方式；INVITE-MENU-1030 B）*/
    { const last=S.lastDay(); if(last!=null&&G.day>last) return {ok:false,why:'畢業典禮以後不能預約'}; if(S.playerAbroad(G,G.day)) return {ok:false,why:'你在國外'}; }   /* DATE-S8（AA_128 11-1）*/
    if(typeof INV!=='undefined'&&INV.whyNot){ const w=INV.whyNot(G,id,o); if(w) return {ok:false,why:w}; }
    return S.canAskCore(G,id); };
  /* INV.whyNot 以外的條件（第 5 階、她在等你說清楚、她有交往的對象）：INV.whyNot 也用它（AA_350 T7a：她在台中、約得到才打開手機的「約」；不能叫 canAsk，會繞回 whyNot）*/
  /* 出去玩從戀愛條過一半起就能約（使用者 11-10 16:2x 選擇題「戀愛條過一半就可以」：「我不是跟你說曖昧要分階段嗎？應該後期就可以了吧」；
     原本要第 5 階＝她的戀愛 30，戀愛條過一半時人物頁寫「她好像開始在意你了」、出去玩卻寫「她還沒有那樣看你」，前後矛盾）。
     過一半＝人物頁戀愛條（第 5 階以前 bar({npcRom:30})）≥ 0.5＝她的戀愛 ≥ 15；分手後的冷淡期（INV.capStage 壓低了階段）不算。
     還不能約：還不是朋友「你們還沒那麼熟。」、朋友但她的戀愛還沒過一半「你們現在是朋友。再多相處一陣子。」（AA 11-10 16:46，企劃線 08543d6fd；不再寫「她還沒有那樣看你」）*/
  S.ASK_ROM_HALF=15; S.ASK_NOT_YET='你們還沒那麼熟。'; S.ASK_NOT_YET_FRIEND='你們現在是朋友。再多相處一陣子。';   /* AA 11-10 16:46（企劃線 08543d6fd）：還不是朋友／已經是朋友、她的戀愛還沒過一半 */
  S.askHalf=id=>{ if(typeof SOCIAL==='undefined'||!SOCIAL.rel) return false; const r=SOCIAL.rel(id); return (+r.npcRom||0)>=S.ASK_ROM_HALF; };
  S.canAskCore=function(G,id){ const F=G.flags||{}, dating=!!F['dating_'+id];
    const raw=S.stageNum(id), sn=typeof INV!=='undefined'&&INV.capStage?INV.capStage(G,id,raw):raw;   /* 分手後的冷淡期照朋友的階段（AA_434 4-3；INV.capStage）*/
    const cool=typeof INV!=='undefined'&&typeof INV.cool==='function'&&INV.cool(G,id);   /* 分手後的冷淡期（V6EX.cool）：戀愛條過一半也不放行——原本 sn===raw 擋不住「本來就是好朋友 4 階」的人（BB 11-10 17:15 X304 FAIL，day46 存檔以安）*/
    if(!dating&&sn<5&&!(!cool&&sn===raw&&S.askHalf(id))) return {ok:false,why:sn>=3?S.ASK_NOT_YET_FRIEND:S.ASK_NOT_YET};   /* 已經是朋友以上、差她的戀愛（第 5 階要她的戀愛 30）：說清楚差什麼（ROM-STAGE-TEXT-1110，使用者 11-10「而且也不能約校外?」）*/
    if(typeof ROM!=='undefined'&&ROM.get){ const R=ROM.get(G,id); if(R&&R.status==='paused') return {ok:false,why:'她在等你把話說清楚'}; }
    const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[id]; if(c&&c.partner&&typeof STORY!=='undefined'&&(STORY.partnerOn?STORY.partnerOn(G,c.partner):(STORY.inTerms&&STORY.inTerms(G,c.partner)))) return {ok:false,why:'她現在有交往的對象'};
    return {ok:true}; };
  const isLaw=c=>!!c&&!/^Y0/.test(c.term||'')&&c.kind!=='general'&&c.kind!=='service';
  const liveIv=v=>v.state==='accepted'||v.state==='going'||v.state==='offered'||v.state==='changed';
  /* 以安、芷若回台中的日子（presence kind home，AA_350 S6）：校外約會擋掉（和沛珊同一套：約的那一天照那一天算）；約的是她老家那個城市的地點（D26 臺中）不擋——
     「她人在臺中，正好是 D26 檔頭說的『回到自己長大的城市，被你帶著逛』」。婉拒的句子照 S6（她說的話，用「」）。她今天就在台中的話照 T7a（下面的 S.homeOnly），這裡管約到哪一天 */
  S.HOME_NO={heroine_01:'「那幾天我在台中。換一天。」',heroine_02:'「那個禮拜我回台中了。換一天好不好？」',classmate_peishan:'「那幾天我回台中啦！換一天好不好？」'};   /* 沛珊：AA_372 第 7 節（企劃線 da55ec2b，寒暑假、週末共用）*/
  const cityOf=s=>String(s||'').replace(/臺/g,'台').replace(/[市縣]$/,'');
  /* 她那一天在老家的城市：寒暑假（presence kind home）、週末回台中（kind trip「回台中」：以安第 4／8／12 週、沛珊單數週，AA_372 #8；
     AA_372 第 7 節（企劃線 da55ec2b）：週末也照 T7a、S6——BB 10-22 03:16 讀碼：原本只看 home，前一天在臺北約那個週末照常出發、當天手機的約整個關著）*/
  S.HOME_TRIP_ONLY={classmate_peishan:true};   /* 沛珊的寒暑假照她自己那一套（hometown3d.js「我去台中找妳？」、「她在台中。要見她，得去台中。」），這裡只管她週末回台中 */
  const awayCity=(p,id)=>{ if(!p||p.here) return ''; if(p.kind==='home') return !S.HOME_TRIP_ONLY[id]&&!p.keep&&p.home?cityOf(p.home):''; const m=p.kind==='trip'&&/^回(.+)$/.exec(p.away||''); return m?cityOf(m[1]):''; };
  S.homeNo=function(G,id,day,locId){ const w=S.HOME_NO[id]; if(!w||typeof STORY==='undefined'||!STORY.presence) return ''; const p=STORY.presence(id,Object.assign({},G,{day})); const c=p.kind==='home'&&!p.here&&!S.HOME_TRIP_ONLY[id]?cityOf(p.home):awayCity(p,id); if(!c) return '';
    const L=S.loc(locId); if(L&&cityOf(L.area)===c) return ''; return w; };
  /* AA_350 T7a（企劃線 2e255e9a 第 9 節）：「她人在台中時手機的『約』整個關著」→「打開，但只列 D26 臺中」。以安、芷若今天在台中（S6 那幾天，presence kind home）：
     手機的約打開（INV.whyNot、canInvite、flow 只有「去校外…」），約會清單只列她老家那個城市的地點（D26；兩天一夜也只有 D26）。她答應的那一句照 T7a（S.T7A_YES，手抄、照稿逐字）。
     還沒到可以約校外的程度（第 5 階、交往中以外；她在等你說清楚；她有交往的對象）＝沒有可以列的＝照舊關著（「回台中了，不在臺北。」）。
     homeCity：她那一天在老家的城市（S6 的以安、芷若；不在＝''）；homeOnly：今天照 T7a 只能列的地點，不是這種情況＝null */
  S.T7A_YES={heroine_01:'臺中？好。我去車站接你。',heroine_02:'你要來臺中？好，我帶你走。',classmate_peishan:'你要來台中喔？好啊！我去車站接你，這次我會準時！'};   /* 沛珊：AA_372 第 7 節（新寫）*/   /* 芷若：2026-11-11 照 AA_773_zr_date_common.json@e8a33995c 換（使用者 X324；原本「你要來臺中？……好。我帶你走。」）*/
  S.homeCity=function(G,id,day){ if(!S.HOME_NO[id]||typeof STORY==='undefined'||!STORY.presence) return ''; const p=STORY.presence(id,day==null?G:Object.assign({},G,{day})); return awayCity(p,id); };
  S.homeOnly=function(G,id){ const c=S.homeCity(G,id); if(!c) return null; { if(typeof CLS!=='undefined'&&CLS.examNear?CLS.examNear(G,G.day):(()=>{ const T=typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(G.day):null; return !!(T&&T.exam); })()) return null; }   /* AA_638 ①-4 */   /* AA_383 第 2 節（企劃線 98516b51）：考試週的規則優先——一日遊在考試週本來就不能排（S.check「考試週」），T7a 只列的 D26 也約不成：手機照「回台中，不在臺北。」（以安第 8 週 10/25～26 期中考考完回台中）*/ const L=Object.keys(D().locations).filter(k=>cityOf((S.loc(k)||{}).area)===c&&S.listable(k)); return L.length&&S.canAskCore(G,id).ok?L:null; };
  /* T7a 那一句：從 T7a 的清單約的、出發那天她還在台中（她已經回臺北的日子＝一起從臺北出發，照一般答應的那一句）*/
  S.t7aYes=(G,id,only,day)=>only&&S.T7A_YES[id]&&S.homeCity(G,id,day)?S.T7A_YES[id]:null;
  /* 這個時間能不能約（o：who、locs、day、depart、transport、fromHome、skip＝改時間時排除的那一趟）→ {ok, why, warns, plan, cost} */
  S.check=function(G,o){ const kind=o.kind||S.kindAt((o.locs||[])[0],o.depart); const P=S.plan(G,Object.assign({},o,{kind,fromHome:o.fromHome!=null?o.fromHome:S.fromHomeOn(G,o.day)}));   /* 出發地照那一天（AA_128 11-1：寒暑假住家裡，車就在家裡，不加取車的 30 分）*/ const warns=[]; if(!P.ok) return {ok:false,why:P.why,warns};
    const day=o.day, a=P.depart, b=P.back, no=w=>({ok:false,why:w,warns,plan:P}), ov=P.kind==='overnight', O=S.OVERNIGHT;
    if(ov&&!S.canOvernight(G,o.who)) return no('兩天一夜要第 6 階或交往中');   /* AA_128 第 119 行（選單本來就不列；直接呼叫也擋）*/
    if(day<G.day||(day===G.day&&a<G.hour+0.25)) return no('這個時間已經過了');
    if(a<7) return no('太早了');
    if(b>((S.midnightOf(o)||{}).maxBack||23.5)) return no('回來會超過 23:30，來回趕不上');   /* 午夜場到 02:45（S.MIDNIGHT）*/
    { const last=S.lastDay(); if(last!=null&&(ov?day+1:day)>last) return no('畢業典禮以後不能預約'); }   /* AA_128 11-1（DATE-S8）：最後能預約的日子是畢業典禮前一天（2029-06-01）；畢業後篇、交換延畢的大五上都不開放 */
    for(const d of (ov?[day,day+1]:[day])) if(S.playerAbroad(G,d)) return no('你那時候在國外');
    if(!ov) for(const l of P.locs){ const cz=S.closedOn(l,day); if(cz) return no(cz); }   /* 整個地點的休館日（D06、D07 週一休館；AA_128 第 2 節地點表）*/   /* AA_128 11-1：日本、美國路線在國外的期間（STORY.ROUTE_DATES 出發日～返台日）不能預約 D01～D32 */
    /* 要看的時段：當天來回＝出發到回來；兩天一夜＝第一天出發到半夜、第二天到回來（她的作息看第一天到 22:00、第二天 08:30 起）*/
    const span=ov?[[day,a,24,a,O.dayEnd],[day+1,0,b,O.morning,P.leave]]:[[day,a,b,a,b]], dw=d=>d===day?'那天 ':'隔天 ';
    if(ov||P.kind==='day') for(const [d] of span){ if(typeof CLS!=='undefined'&&CLS.examNear?CLS.examNear(G,d):(()=>{ const T=typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(d):null; return !!(T&&T.exam); })()) return no(typeof CLS!=='undefined'&&CLS.EXAM_NEAR_WHY||'那幾天有考試。'); }   /* AA_638 ①-4：只擋自己有考試的那天和前一天（原本整個考試週）*/   /* AA_126 1-1（企劃線第 41 行）：「一日遊和兩天一夜在考試週的日子不能選，行程表上直接標『考試週』」（期中第 8～9 週、期末第 16 週）；半日、晚上照舊（只避開考試時段）——BUG-DATE-EXAMWEEK-DAY-1021 */
    if(typeof CLS!=='undefined'&&CLS.dayItems){ for(const [d,x,y] of span) for(const it of (CLS.dayItems(G,d)||[])){ if(it.t1<=x||it.t0>=y) continue;
      if(it.examMain||(CLS.examAt&&CLS.examAt(G,d,it.t0,it.t1))) return no(dw(d)+hm(it.t0)+' 要考'+it.c.name);
      warns.push((ov&&d!==day?'隔天':'')+(isLaw(it.c)?'會錯過 '+hm(it.t0)+' 的'+it.c.name+'（法律課不點名）':'會少一次出席：'+hm(it.t0)+' 的'+it.c.name)); } }
    const sk=o.skip&&(o.skip.trip||o.skip);   /* skip：改時間的那一趟（物件或行程 id）*/
    for(const [d] of span){ const mine=(G.trips||[]).filter(t=>t.trip!==sk&&t.status==='booked'&&S.onDay(t,d));
      if(ov){ if(mine.length) return no(mine.some(t=>t.kind==='overnight')?dw(d).trim()+'已經有兩天一夜的行程':(mine.some(t=>t.kind==='day')?dw(d).trim()+'已經有一日遊':'兩天一夜那兩天只能排這一場')); continue; }   /* AA_128 4-1：一日遊、兩天一夜那天只能一場 */
      if(mine.length>=2) return no('那天已經約了兩場');
      if(P.kind==='day'&&mine.length) return no('一日遊那天只能排這一場');
      if(mine.some(t=>t.kind==='day')) return no('那天已經有一日遊');
      if(mine.some(t=>t.kind==='overnight')) return no('那天已經有兩天一夜的行程');
      const ovl=mine.find(t=>a<t.back&&t.depart<b); if(ovl) return no('和'+nameOf(ovl.who)+'的約（'+hm(ovl.depart)+' 出發）撞時間'); }
    for(const [d,x,y] of span){ const iv=(G.invites||[]).find(v=>liveIv(v)&&v.day===d&&v.h<y&&v.h+(((typeof INV!=='undefined'&&INV.place&&INV.place(v.place))||{}).stay||1)>x); if(iv) return no(dw(d)+hm(iv.h)+' 已經約了'+nameOf(iv.who));
      const oq=(G.outings||[]).find(q=>q.state==='planned'&&!q.dateTrip&&q.day===d&&q.h<y+0.5&&q.h+1.5>x); if(oq) return no(dw(d)+hm(oq.h)+' 有別的行程：'+(oq.title||oq.place||'')); }
    if(ov){ const w=S.overnightWhere(G,o.who,day,P.locs); if(!w.ok) return no(w.why); }   /* AA_359 第 1 節：她兩天都在那個地方，或在臺北可以一起出發（含 AA_350 S6 回台中的那幾天）*/
    else { const hn=S.homeNo(G,o.who,day,P.locs[0]); if(hn) return no(hn);   /* AA_350 S6：她回台中那幾天（放在她的作息之前：人不在臺北，不是在上班）*/
      if(!S.noTaipei(G,o.who,day,P.locs[0])){ const wd=S.dayWhere(G,o.who,day,P.locs); if(!wd.ok) return no(wd.why); } }   /* AA_128 11-2（DATE-S8）：約的那一天她在國外、聯絡不到、在別的城市＝不能約（原本只看今天）；沛珊不上來照下面 noTaipei 那一句 */
    { const pt=S.partnerOnDay(G,o.who,day); if(pt) return no(pt); const off=S.herOff(G,o.who,day,ov?null:a+P.travelH); if(off) return no(off); }
    { const sw=typeof SISG!=='undefined'&&SISG.tripWhy?SISG.tripWhy(G,{who:o.who,day,depart:a,kind:P.kind,skip:sk}):''; if(sw) return no(sw); }   /* 學姊筆試前（AA_535 1-2）：第 10～13 週和校內共用那一週的一次、只能半天；第 14 週起不出去 */   /* 那一天她有交往的對象（AA_128 4-5）；她自己不約的日子、時段（11-2：學姊出發前、口試前一週；子晴下午三點以後、大四只有週六）*/
    if(typeof INV!=='undefined'&&INV.busyAt){ const awayOn=d=>{ if(typeof STORY==='undefined'||!STORY.presence) return false; const p=STORY.presence(o.who,Object.assign({},G,{day:d})); return !!p&&p.here===false&&p.kind!=='taipei'; };   /* 她那天不在臺北（回老家：D26 去台中找她）＝臺北的作息（Café 班、課）不算（子代理 10-31 讀碼：schedEnt 不看 presence，芷若 7/6 的 D26 被 Café 班擋成「她那時候有事」）*/
      for(const [d,,,x,y] of span){ if(awayOn(d)) continue; let e=null; if(ov){ for(let h=x;h<y-1e-6&&!e;h+=1) e=INV.busyAt(G,o.who,d,h,Math.min(1,y-h)); } else e=INV.busyAt(G,o.who,d,a,b-a);   /* 兩天一夜：一小時一小時看（兩天都要空）*/
      if(e&&o.skipWork&&e.act==='work') e=null;   /* 她請假（AA_626 2-2 語彤 D13 notTeaShift：週六、日茶屋都有班＝「我跟蘇姨請假了。」，src/wish3d.js）*/
      if(e) return no((ov&&d!==day?'隔天她':'她那時候')+(e.act==='class'?'要上課':(e.act==='work'?'要上班':'有事'))); } }
    const nt=S.noTaipei(G,o.who,day,P.locs[0]); if(nt) return no(nt);
    const cost=(P.fare|0)+(P.lodging|0)+P.locs.reduce((s,l)=>s+((S.loc(l)||{}).admission|0)+((S.fixedOf(l)||{}).cost|0),0); if((G.money|0)<cost) return no('錢不夠（預計 '+cost+' 元）');   /* 兩天一夜多住宿 2,500 */
    return {ok:true,why:'',warns,plan:P,cost}; };
  /* 休館日（AA_128 第 2 節地點表的備註；date_locations.json 的 closed）：
     mon＝整個地點週一休館（D06 北美館、D07 景美紀念園區）→ 預約時那一天不能選，寫「週一休館」（地點表的原字）；
     mon_museum／mon1_museum＝只有館（互動點 .museum）週一／每月第一個週一休館，其他照常（D11 溫泉博物館、D26 國美館、D28 文學館；D19 黃金博物館）→ 那一項灰掉，寫「今天休館」（AA_160 自由出行同一批館的寫法）；
     mon_maybe（D09 纜車「週一常停駛維修」）不是固定的日子，還沒有規則，不擋 */
  const wdOn=day=>{ const dt=typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(day):null; return dt?{wd:((dt.wd%7)+7)%7,d:dt.d}:null; };
  S.closedOn=function(locId,day){ const L=S.loc(locId); if(!L||L.closed!=='mon') return ''; const w=wdOn(day); return w&&w.wd===1?'週一休館':''; };
  S.pointClosed=function(G,pid,day){ const loc=String(pid).split('.')[0], L=S.loc(loc); if(!L||!/\.museum$/.test(pid)||(L.closed!=='mon_museum'&&L.closed!=='mon1_museum')) return '';
    const w=wdOn(day==null?G.day:day); if(!w||w.wd!==1||(L.closed==='mon1_museum'&&w.d>7)) return ''; return '今天休館'; };
  /* 她那一天在哪（兩天一夜的排程，AA_359 第 1 節）：{city:'台北'}＝在臺北（學校、上班）；{city,own:'home'}＝在老家（寒暑假、回台中的週末）；{city,own:'rent'}＝在外縣市租的地方（沛珊大三起在台南，PS_TN）；{away}＝在別的地方 */
  S.whereOn=function(G,id,day){ if(typeof STORY==='undefined'||!STORY.presence) return {city:'台北'}; const p=STORY.presence(id,Object.assign({},G,{day}));
    if(p.here||p.kind==='taipei') return {city:'台北'}; if(p.lost||p.kind==='unreachable') return {away:p.away||''};
    if(p.kind==='home'&&p.home) return {city:cityOf(p.home),own:'home'}; if(p.kind==='city'&&p.city) return {city:cityOf(p.city),own:'rent'};
    const m=p.kind==='trip'&&/^回(.+)$/.exec(p.away||''); if(m) return {city:cityOf(m[1]),own:'home'};   /* 以安、沛珊大一回台中的週末（kind trip「回台中」）*/
    return {away:p.away||''}; };
  /* AA_350 T7b（企劃線 2e255e9a 第 9 節）：她出國的日子要擋（和老家同一套），婉拒照 T7b 逐字：以安在日本「那幾天我在日本。」、學姊在美國「那時候我在美國。」、芷若在英國「我那時候在英國。」；
     其他人、其他地方共用「那幾天我不在臺灣。」。出國＝presence kind abroad，或 absent／trip 的地方在國外（以安東京 C11、京都 C12 是 trip；芷若英國是 absent）。不在國外＝''（照原本的「她那時候在……」）*/
  S.ABROAD_NO={heroine_01:[/日本|東京|京都|大阪/,'「那幾天我在日本。」'],heroine_05:[/美國/,'「那時候我在美國。」'],heroine_02:[/英國|倫敦/,'「我那時候在英國。」']};
  S.ABROAD_ANY='「那幾天我不在臺灣。」';
  const FOREIGN=/日本|東京|京都|大阪|美國|英國|倫敦|曼谷|泰國|韓國|首爾|香港|國外/;
  S.abroadNo=function(G,id,day){ if(typeof STORY==='undefined'||!STORY.presence) return ''; const p=STORY.presence(id,Object.assign({},G,{day})); if(!p||p.here||p.kind==='taipei'||p.lost||p.kind==='unreachable') return '';
    const away=String(p.away||''); if(!(p.kind==='abroad'||((p.kind==='absent'||p.kind==='trip')&&FOREIGN.test(away)))) return '';
    const m=S.ABROAD_NO[id]; return m&&m[0].test(away)?m[1]:S.ABROAD_ANY; };
  /* 兩天都在那個地方（她住自己家／租的地方＝own）或臺北（一起出發）才約得到；她回台中（以安、芷若）那幾天約別的地方＝S6 婉拒那一句 */
  S.overnightWhere=function(G,id,day,locs){ const dest=cityOf((S.loc(locs[0])||{}).area); let own=null;
    for(const d of [day,day+1]){ const w=S.whereOn(G,id,d);
      { const an=S.abroadNo(G,id,d); if(an) return {ok:false,why:an}; }   /* AA_350 T7b */
      if(w.city==null||(w.city!=='台北'&&w.city!==dest)) return {ok:false,why:(w.own==='home'&&S.HOME_NO[id])||(w.city?'她那時候在'+w.city+'。':'她那時候'+(/^[在回]/.test(w.away||'')?'':'在')+(w.away||'不在臺北')+'。')};
      if(w.own&&w.city===dest) own=own||w.own; }
    return {ok:true,own}; };
  /* 出發那天她還來不來得了（AA_359 第 4 節「她第一天沒到」）：約好以後才變的——她在等你說清楚、她有了交往的對象、她兩天不在那裡。原因照預約的那幾句；不看今天她人在不在臺北（她可能就在臺中的家等你）*/
  S.stillOn=function(G,t){ const id=t.who; if(typeof ROM!=='undefined'&&ROM.get){ const R=ROM.get(G,id); if(R&&R.status==='paused') return {ok:false,why:'她在等你把話說清楚。'}; }
    const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[id]; if(c&&c.partner&&typeof STORY!=='undefined'&&(STORY.partnerOn?STORY.partnerOn(G,c.partner):(STORY.inTerms&&STORY.inTerms(G,c.partner)))) return {ok:false,why:'她現在有交往的對象。'};
    return S.overnightWhere(G,id,t.day,t.locs); };
  /* ===== 四年裡什麼時候約得到（DATE-S8；AA_128 11-1、11-2）=====
     祐廷：最後能預約的日子是畢業典禮前一天（2029-06-01，交換延畢的也一樣）；日本、美國路線在國外的期間不能預約；寒暑假從家出發（車就在家裡）。
     她：約的那一天在國外（芷若英國、以安日本、學姊美國）、聯絡不到（沛珊）、在別的城市（寒暑假回老家、出遊）＝不能約；那一天有交往的對象＝不能約；
     學姊出發去美國前一週、口試（5/29）前一週不約；子晴下午兩點才醒（三點以後才約得到），大四在工作室上班只有週六。原因照預約畫面的寫法（灰掉、寫原因）*/
  S.LAST_DAY='2029-06-01';
  S.lastDay=()=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(S.LAST_DAY):null;
  S.playerAbroad=(G,day)=>typeof STORY!=='undefined'&&!!STORY.abroad&&!!STORY.abroad(Object.assign({},G,{day}));
  /* 出發地（AA_128 4-1、11-1）：寒暑假住家裡（法律系的寒暑假；經濟系休學以後、畢業退宿以後、交換退宿以後也住家裡）＝不加回家取車的時間 */
  S.fromHomeOn=function(G,day){ if(typeof HOME==='undefined') return false; if((G.stage||'law')==='law'&&HOME.breakOf&&HOME.breakOf(day)) return true;
    if((HOME.pgHome&&HOME.pgHome(G))) return true; return typeof STORY!=='undefined'&&!!STORY.movedOut&&!!STORY.movedOut(Object.assign({},G,{day})); };
  /* 當天來回：那一天她在臺北，或就在那個地點的城市（照 overnightWhere 的一天版）*/
  S.dayWhere=function(G,id,day,locs){ const dest=cityOf((S.loc(locs[0])||{}).area), p=typeof STORY!=='undefined'&&STORY.presence?STORY.presence(id,Object.assign({},G,{day})):{here:true};
    if(!p.here&&(p.lost||p.kind==='unreachable')) return {ok:false,why:'她那時候'+(p.away||'聯絡不到')+'。'};
    const w=S.whereOn(G,id,day); if(w.city==='台北'||(w.city&&w.city===dest)) return {ok:true};
    { const an=S.abroadNo(G,id,day); if(an) return {ok:false,why:an}; }   /* AA_350 T7b */
    return {ok:false,why:(w.own==='home'&&S.HOME_NO[id])||(w.city?'她那時候在'+w.city+'。':'她那時候'+(/^[在回]/.test(w.away||'')?'':'在')+(w.away||'不在臺北')+'。')}; };
  S.partnerOnDay=function(G,id,day){ const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[id]; if(!c||!c.partner||typeof STORY==='undefined') return ''; const G2=Object.assign({},G,{day});
    return (STORY.partnerOn?STORY.partnerOn(G2,c.partner):(STORY.inTerms&&STORY.inTerms(G2,c.partner)))?'她那時候有交往的對象':''; };
  S.HER_OFF={heroine_05:[['2028-07-26','2028-08-01'],['2029-05-22','2029-05-28']]};   /* 學姊：8/2 出發去美國前一週、5/29 口試前一週（AA_128 11-2、BB_128 3-3）*/
  S.herOff=function(G,id,day,arrive){ for(const [a,b] of (S.HER_OFF[id]||[])){ const x=typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(a):null, y=x!=null?STORY.dayOfKey(b):null; if(x!=null&&y!=null&&day>=x&&day<=y) return '她那時候有事'; }
    if(id==='heroine_04'&&arrive!=null){ if(arrive<15-1e-6) return '她那時候有事';   /* 子晴下午兩點才醒，三點以後再約（AA_128 11-2、BB_70、BB_123）*/
      const T=typeof STORY!=='undefined'&&STORY.termAt?STORY.termAt(day):null, wd=typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(day).wd%7:6;
      if(T&&/^Y[45]S/.test(T)&&wd!==6) return '她那時候有事'; }   /* 大四在工作室上班：只有週六 15:00 以後（兩天一夜不看這兩條：AA_359 有她兩天一夜的句子）*/
    return ''; };
  const wdName=d=>'日一二三四五六'[((d%7)+7)%7];
  S.dayLabel=function(G,day){ const k=day-G.day; const dt=typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(day):null; const md=dt?dt.m+'/'+dt.d:'第 '+day+' 天';
    const wd=dt&&dt.wd!=null?dt.wd:(G.weekday+k); return (k===0?'今天 ':k===1?'明天 ':'')+md+'（'+wdName(wd)+'）'; };
  /* 選日期、出發時間（預約、改時間共用）→ {day, depart, kind, check} 或 null */
  S.pickWhen=async function(GM,o){ const G=GM.G; const days=[]; for(let k=0;k<7;k++) days.push(G.day+k); const ov=o.kind==='overnight';   /* 兩天一夜：日期寫兩天、只有 09:00 出發、回程寫第二天 */
    for(;;){ const dOpts=days.map(d=>({t:S.dayLabel(G,d)+(ov?'～'+S.dayLabel(G,d+1).replace(/^(今天|明天) /,''):'')})); dOpts.push({t:'算了'}); const di=await GM.choose(dOpts); if(di>=days.length) return null; const day=days[di];
      const K=ov?['overnight']:((S.loc(o.locs[0])||{}).kinds||['half']).filter(k=>S.STAY[k]); const sd=ov?null:S.sunsetDepart(o.locs[0],day); const hs=[...new Set(K.flatMap(k=>S.TIMES[k]||[]).concat(sd!=null?[sd]:[]))].sort((x,y)=>x-y);   /* 淡水多一個「夕陽前兩小時」的出發時間（DATE-C2）*/
      { const MN=S.MIDNIGHT[o.who]; if(!ov&&MN&&o.locs[0]===MN.loc&&S.log(G,o.who).wishKnown&&!S.log(G,o.who).wish&&!hs.includes(MN.depart)) hs.push(MN.depart); }   /* 她說過想看午夜場、還沒去過：多一個 22:30（午夜場）*/
      const rows=hs.map(h=>({h,c:S.check(G,Object.assign({},o,{day,depart:h,kind:ov?'overnight':undefined}))}));
      const tOpts=rows.map(r=>({t:hm(r.h)+' 出發'+(S.midnightOf(Object.assign({},o,{depart:r.h}))?'（'+S.midnightOf(Object.assign({},o,{depart:r.h})).label+'）':''),hint:r.c.ok?((ov?'住一晚，第二天最晚':'')+'回到首都帝大約 '+hm(r.c.plan.back)+(r.c.warns.length?'。'+r.c.warns.join('；'):'')):r.c.why,dim:!r.c.ok})); tOpts.push({t:'換一天'}); tOpts.push({t:'算了'});
      for(;;){ const ti=await GM.choose(tOpts); if(ti===rows.length) break; if(ti>rows.length) return null; const r=rows[ti]; if(!r.c.ok){ if(GM.toast) GM.toast(r.c.why,2600); continue; } return {day,depart:r.h,kind:r.c.plan.kind,check:r.c}; } } };
  /* 她的句子（DATE-S6；src/data/date_lines.js：BB_128 3-6、3-7、AA_127 1-7、2-7、第 8 節，白名單匯入）：每一格幾句輪流（記在 dateLog 的 lineIdx，讀檔補預設）；一句裡有好幾則＝連發。
     當面約（n）用她的名字講；其他時候是手機訊息（名字後面「（手機）」，同時寫進手機的對話串）。還沒匯入的人或格子＝不說話（只有旁白）。 */
  const LN=()=>typeof DATE_LINES!=='undefined'?DATE_LINES:{lines:{},prefs:{}};
  const noodleOff=day=>typeof PLACES!=='undefined'&&!!PLACES.hours&&!!PLACES.hours.noodle&&!(PLACES.typhoonClosed&&PLACES.typhoonClosed('noodle',day))&&!PLACES.isOpen('noodle',12,day)&&!PLACES.isOpen('noodle',18,day);
  /* AA_535b 1-3（INVITE-OPTS-1030 第二份，AA-B 定稿，企劃線 2dbcc5691；一字照稿）：以安、語彤校外約會缺的四格——depart＝出發時間到了她傳的訊息（三則輪流）、enough＝第三個點之後那一句、
     leaveEarly＝一個點都沒去就回去、noPair＝合照還不到第 6 階。date_lines.js 是匯入工具產生的（不手改），這幾格它沒有的才用這裡（S.lineFor）。
     以安「明天早上有課」（AA_594 第 367 列，原本「明天早上有讀書會」）只在學期中（寒暑假換另一句）；語彤「晚上我要幫阿姨」只在她在臺北、麵店那天有開（不然換另一句）——S.LINE_IF 的 enough。
     2026-11-11（使用者 X324 語彤約會台詞重寫，AA_767_yt_date_common.json@0a2136911）：語彤這六格換字（depart 第二、三句、enough 兩句、leaveEarly、noPair）；enough 第一句保留「秀琴姨煮了飯」這幾個字（S.LINE_IF 認它），條件不動
     2026-11-11（使用者 X324 以安約會台詞重寫的後續，AA_780_an_date_followup.json@248c8e390）：以安這四格換字（enough 兩句、leaveEarly、noPair；depart 三句不動）——enough 第一句不再說「明天早上有課」
     （AA：不綁那個條件），S.LINE_IF.heroine_01.enough 認的字不在了＝寒暑假也輪到這一句（條件那一行留著、不會再擋到任何一句）*/
  S.EXTRA_LINES={
    heroine_01:{depart:['我到了。早到十分鐘。你慢慢來。','出門了。傘帶了。','車上。我在看等一下要去的地方的地圖。'],enough:['今天差不多了。再走下去，我會開始看錶。','排的都走完了。多走的那一段，我很喜歡。'],
      leaveEarly:['這樣就回去了？好。排好的那幾個地方不會跑。'],noPair:['照片？我幫你拍。我拍得比較正。']},
    heroine_03:{depart:['我到了。','出門了。傘有帶，這次有。','快到了。你先找地方站，我看得到你。'],enough:['差不多了。秀琴姨煮了飯，我想回去吃熱的。','我走不動了。到這裡就好。'],leaveEarly:['就這樣？好。那我回去了。'],noPair:['我不用。我幫你拍，你站過去。']} };
  const inTerm=day=>typeof CALENDAR!=='undefined'&&!!CALENDAR.termOf&&!!CALENDAR.termOf(day)&&!(typeof HOME!=='undefined'&&HOME.breakOf&&HOME.breakOf(day));
  const ytShop=(G,day)=>{ const p=typeof STORY!=='undefined'&&STORY.presence?STORY.presence('heroine_03',Object.assign({},G,{day})):{here:true}; return (p.here||p.kind==='taipei')&&!noodleOff(day)&&!(typeof PLACES!=='undefined'&&PLACES.isOpen&&!PLACES.isOpen('noodle',18,day)); };
  /* AA_627 P-25、P-26（AA_624）：「可以。那天我沒有班。」只在那天她茶屋沒有班（週六、日 13～17 以外）說；「晚上我要回去，秀琴姨煮了飯。」只在她那天在臺北 */
  const ytTea=(G,day)=>[13,14,15,16].some(h=>{ const e=typeof STORY!=='undefined'&&STORY.schedEnt&&typeof CHARACTERS!=='undefined'?STORY.schedEnt(CHARACTERS.heroine_03,{day,hour:h,weekday:CALENDAR.dateOf(day).wd%7,flags:G.flags||{},noInvite:true}):null; return !!e&&e.zone==='wz_teahouse'; });
  const ytHere=(G,day)=>{ const p=typeof STORY!=='undefined'&&STORY.presence?STORY.presence('heroine_03',Object.assign({},G,{day})):{here:true}; return !!(p.here||(p.kind==='taipei'&&!p.town)); };   /* AA_675 1-1：寒暑假平日她在淡水（presence 的 town）＝不在臺北，不說「晚上我要回去，秀琴姨煮了飯。」*/
  S.LINE_IF={heroine_03:{accept:(G,t,x)=>!/公休|沒有班/.test(String(x))||(/公休/.test(String(x))?noodleOff(t.day):!ytTea(G,t.day)),enough:(G,t,x)=>!/幫阿姨|秀琴姨煮了飯/.test(String(x))||ytHere(G,t.day!=null?t.day:G.day)},
    heroine_01:{enough:(G,t,x)=>!/讀書會|明天早上有課/.test(String(x))||inTerm(t.day!=null?t.day:G.day)}};   /* 可昕的出發三句都輪流：BB_128 3-6 那一句 AA_432 改成「我到了。你在哪？」（企劃線 1ced2f8b3；原本的「這是告知」先不播，已拿掉）*/   /* 語彤「那天店裡公休」只在麵店已定的公休日（AA_127 第 8 節；沒有固定的每週公休日＝其他日子用第一句）*/
  S.lineFor=function(G,id,kind,t){ let L=((LN().lines||{})[id]||{})[kind]; if(!L||!L.length) L=(S.EXTRA_LINES[id]||{})[kind]; if(!L||!L.length) return null;   /* 匯入的 date_lines.js 沒有的格子＝AA_535b 1-3（S.EXTRA_LINES）*/ const f=(S.LINE_IF[id]||{})[kind]; const ok=L.filter(x=>!f||f(G,t||{},x)); if(!ok.length) return null;
    const lg=S.log(G,id); if(!lg.lineIdx||typeof lg.lineIdx!=='object') lg.lineIdx={}; const k=(lg.lineIdx[kind]|0)%ok.length; lg.lineIdx[kind]=(lg.lineIdx[kind]|0)+1; return [].concat(ok[k]); };
  S.speak=async function(GM,id,kind,t,n){ const G=GM.G, msgs=S.lineFor(G,id,kind,t); if(!msgs) return false; return S.sayLines(GM,id,msgs,n); };
  S.sayLines=async function(GM,id,msgs,n){ const G=GM.G; if(id==='heroine_03') msgs=(msgs||[]).map(m=>Array.isArray(m)?m.map(x=>S.xiuqin(G,id,x)):S.xiuqin(G,id,m));   /* 沒有 YT_FAMILY_HEARD＝「煮飯的阿姨」（AA_630 第 2 節）*/   /* 當面＝她的名字；手機＝「（手機）」＋寫進手機的對話串（T7a 那一句也走這裡）*/
    for(const m of msgs){ if(n) await GM.say({name:nameOf(id),obj:n.obj,charId:id},m); else { if(typeof PHONE!=='undefined'&&PHONE.post) PHONE.post(G,{th:'p:'+id,from:id,text:m}); await GM.say({name:nameOf(id)+'（手機）',charId:id},m); } }
    if(!n&&GM.phoneBadge) GM.phoneBadge(); return true; };
  S.prefOf=(id,locId)=>(((LN().prefs||{})[id]||{})[locId]||{}).transport||null;   /* 她指定的交通（DATE_PREFS）：預約時預設選她的，玩家改了她說一句（不扣分）*/
  /* 玩家約她（手機或當面；入口在 INV.flow 的地點清單「去校外…」）*/
  /* 她不上來的日子（presence.noTaipei＝從哪一天起；沛珊放榜以後學期中在台南、寒暑假在台中，AA_282 第 1、6 節）：北部的校外約會地點全部約不到（AA_349 K3：不只臺北市——臺北、新北（淡水、九份）、基隆、宜蘭……；
     北部照國發會的北部區域，桃園、新竹也算）。「兩個人約在外縣市」作廢（不另外設計第三個城市）；去台南、去台中那一天算一次正式校外約會（S.countVisit）。
     字（AA_349 K11）：清單上灰掉的地點「她現在在台南。」（寒暑假「她現在在台中。」，S.cityNow）；選了、約的時候「她在台南。要見她，得去台南。」（寒暑假台中，S.noTaipei）*/
  S.NORTH=['臺北市','新北市','基隆市','桃園市','新竹市','新竹縣','宜蘭縣'];
  S.noNorthOn=function(G,id,day){ const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[id], k=c&&c.presence&&c.presence.noTaipei; if(!k||typeof STORY==='undefined'||!STORY.dayOfKey) return false; const d0=STORY.dayOfKey(k); return d0!=null&&day>=d0; };
  const awayAt=(G,id,day)=>{ if(!S.noNorthOn(G,id,day)||!STORY.presence) return null; const p=STORY.presence(id,Object.assign({},G,{day})); if(p.here) return null; return {at:p.city||p.home||'',away:p.away||''}; };   /* 不在城市、也不在老家（例：2029-07 山上的營隊）＝照 presence 的 away 那幾個字 */
  S.noTaipei=function(G,id,day,locId){ const L=S.loc(locId); if(!L||!S.NORTH.includes(L.area)) return ''; const a=awayAt(G,id,day); if(!a) return ''; return a.at?'她在'+a.at+'。要見她，得去'+a.at+'。':'她'+a.away+'。'; };
  S.cityNow=function(G,id,day,locId){ const L=S.loc(locId); if(!L||!S.NORTH.includes(L.area)) return ''; const a=awayAt(G,id,day==null?G.day:day); if(!a) return ''; return a.at?'她現在在'+a.at+'。':'她'+a.away+'。'; };
  /* 「出去玩…」的第二層（INVITE-MENU-1030，使用者 10-30 04:2x「如果太多就分階層」：原本 28～30 列平鋪，手機直向要捲三個畫面）：
     AA_535 第 2 節（AA-B 定稿）照 date_locations 的地區和天數分：臺北市；新北市、桃園；一整天；兩天一夜（中南部、花蓮）。臺北市 11 處、新北市＋桃園 12 處一層放不下（一層最多 8 列），
     各再照性質分兩類（地區寫在前面）。一類只有一個＝直接列那個地點、整類都約不了＝灰掉並寫原因（INV.menuTree）；沒分到的地點放「其他」；兩天一夜照舊另一項（D26～D32）；
     她的心願地點（她說過、或沛珊的台南・美術館）另外放一類「她說過想去的」。分類名稱是系統字 */
  S.GROUPS=[
    {id:'tpe_art',t:'臺北市：看展・電影',ids:['D01','D02','D03','D04','D05','D06','D33']},   /* D33 信義區・光年影城（AA_631，院線電影）：看展・電影這一類（S.listable 有底圖才列）*/
    {id:'tpe_out',t:'臺北市：戶外',ids:['D08','D09','D11','D12','D15']},
    {id:'ntp_sea',t:'新北市、桃園：海邊',ids:['D13','D14','D16','D17','D23']},
    {id:'ntp_out',t:'新北市、桃園：老街・山・近郊',ids:['D07','D10','D18','D19','D20','D21','D22']},
    {id:'day',t:'一整天（宜蘭、中南部）',ids:['D24','D25','D26','D27']}];
  S.WISH_LABEL='她說過想去的';
  const flatPick=async(GM,nodes)=>{ const L=[]; for(const x of nodes) if(x.items) L.push(...x.items); else L.push(x); for(;;){ const o=L.map(x=>({t:x.t,hint:x.hint,dim:!!x.dim})); o.push({t:'算了'});   /* 沒有 INV（舊的測試環境）：平鋪 */
      const k=await GM.choose(o); if(!(k>=0&&k<L.length)) return null; const x=L[k]; if(x.dim&&x.why){ await GM.say(null,x.why); continue; } return x; } };
  S.menu=async function(GM,id,n){ const G=GM.G; S.rec(G); const ca=S.canAsk(G,id,n?{face:true}:null); if(!ca.ok){ await GM.say(null,ca.why+'。'); return null; }
    if(id==='heroine_05'&&typeof SISG!=='undefined'&&SISG.dateDecline&&SISG.dateDecline(G)){ await SISG.dateNo(GM,n); return null; }   /* 學姊：大一上第 10 週起到筆試婉拒校外約會：第 10～13 週「等我考完。」、第 14 週～筆試「校外的話，等我考完。……考完我想去很遠的地方。」（AA_284 2-1、AA_339 第 4 題；句子在 src/sis_grad3d.js 的 SISG.DATE_NO）*/
    const only=S.homeOnly(G,id), inOnly=k=>!only||only.includes(k);   /* AA_350 T7a：她今天在台中＝只列 D26（兩天一夜也是）*/
    const half=id==='heroine_05'&&typeof SISG!=='undefined'&&!!SISG.halfOnly&&SISG.halfOnly(G), halfOk=k=>!half||((S.loc(k)||{}).kinds||[]).some(x=>x==='half'||x==='evening');   /* 學姊筆試前第 10～13 週：只能約半天（AA_535 1-2）*/
    const locs=Object.keys(D().locations).filter(k=>S.listable(k)&&S.kindAt(k,10)&&inOnly(k)&&halfOk(k)), ovl=S.canOvernight(G,id)&&!half?S.overnightLocs().filter(inOnly):[];   /* 兩天一夜：第 6 階或交往中才有這一項；沒到條件 D28～D32 不列（AA_359 第 4 節）*/
    if(!locs.length&&!ovl.length){ await GM.say(null,'（還沒有可以約的校外地點。）'); return null; }
    for(;;){ const leaf=k=>{ const L=S.loc(k), tr=S.travel(k), nt=S.noTaipei(G,id,G.day,k); return nt?{t:L.name,hint:S.cityNow(G,id,G.day,k),dim:true,why:nt,loc:k}:{t:L.name,hint:L.area+(tr?'　'+tr.label+' 約 '+tr.minutes+' 分':''),loc:k}; };   /* 她不上來：北部的地點灰掉（AA_349 K3、K11）*/
      const used=new Set(), nodes=S.GROUPS.map(g=>{ const it=g.ids.filter(k=>locs.includes(k)); it.forEach(k=>used.add(k)); return {t:g.t,gid:g.id,items:it.map(leaf)}; });   /* 照地點分類（INVITE-MENU-1030）：整類灰掉＝小字寫原因 */
      { const rest=locs.filter(k=>!used.has(k)); if(rest.length) nodes.push({t:'其他',items:rest.map(leaf)}); }   /* 之後新增、還沒分類的地點 */
      { const W=[], mu=typeof HV!=='undefined'&&HV.museumOffer?HV.museumOffer(G,id):null, wk=S.log(G,id).wishKnown&&S.wishOf(id);
        if(mu) W.push({t:mu.name,hint:mu.ok?mu.hint:mu.why,dim:!mu.ok,why:mu.ok?'':mu.why+'。',go:'mu'});   /* 沛珊大三起的心願地點「台南・美術館」（AA_349 K3：去台南的那一天；hometown3d.js）*/
        else if(wk&&locs.includes(wk)) W.push(leaf(wk));   /* 她說過的心願地點（DATE.knowWish）：原本那一類也照列 */
        nodes.unshift({t:S.WISH_LABEL,items:W}); }   /* 她說過想去的（AA_535 第 2 節）：有才出現，只有一個就直接列 */
      if(ovl.length) nodes.push({t:'兩天一夜…',hint:'中南部、花蓮　住一晚（住宿 '+S.lodging()+' 元）',go:'ov'});
      const pick=async x=>{ if(x.dim&&x.why){ await GM.say(null,x.why); return INV.STAY_MENU; } return x; };   /* 灰掉的地點：說原因、再選一次 */
      const x=typeof INV!=='undefined'&&INV.menuTree?await INV.menuTree(GM,nodes,pick):await flatPick(GM,nodes); if(!x) return null;
      if(x.go==='mu') return HV.museumAsk(GM,id,n);
      let loc, kind, two=null;
      if(x.go==='ov'){ const oo=ovl.map(k=>{ const L=S.loc(k), tr=S.travel(k); return {t:L.name,hint:L.area+(tr?'　'+tr.label+' 約 '+tr.minutes+' 分':'')}; }); oo.push({t:'算了'});   /* 可以住一晚的地點（D26～D32）*/
        const oi=await GM.choose(oo); if(oi>=ovl.length) continue; loc=ovl[oi]; kind='overnight';
        const c2=S.comboOf(loc); if(c2){ const ci=await GM.choose([{t:'只去'+S.loc(loc).name},{t:S.loc(loc).name+'＋'+S.loc(c2).name,hint:'第二天去'+S.loc(c2).name+'（要開車）'}]); if(ci===1) two=c2; } }   /* D31＋D32 同一趟（AA_128 第 116 行）*/
      else loc=x.loc;
      const L=S.loc(loc), names=two?L.name+'、'+S.loc(two).name:L.name; let mode=((L.transport||[])[0]||{}).mode;
      const T=(L.transport||[]).filter(x=>x.mode&&(!two||x.mode==='car')), pref=S.prefOf(id,loc); let prefOff=false; if(two) mode='car'; if(pref&&T.some(x=>x.mode===pref)){ T.sort((a,b)=>(b.mode===pref)-(a.mode===pref)); mode=pref; }   /* 她的偏好排第一、預設選它；D31＋D32 只能開車（清境要車）*/
      if(two&&pref&&pref!=='car') prefOff=true;
      if(T.length>1){ const to=T.map(x=>{ const tr=S.travel(loc,x.mode); return {t:tr.label+(x.mode===pref?'（她想這樣去）':''),hint:'單程約 '+tr.minutes+' 分、來回 '+tr.fare+' 元'}; });   /* 車資是來回（AA_128 第 70 行）*/ const ti=await GM.choose(to); mode=T[ti].mode; prefOff=!!pref&&mode!==pref; }
      const o={who:id,locs:two?[loc,two]:[loc],transport:mode,kind}; const w=await S.pickWhen(GM,o); if(!w) return null;
      const P=w.check.plan, ov=P.kind==='overnight', sum=ov?'和'+nameOf(id)+'去'+names+'（兩天一夜）：'+S.dayLabel(G,w.day).trim()+' '+hm(P.depart)+' 出發，'+P.travelLabel+'單程約 '+Math.round(P.travelH*60)+' 分鐘，住一晚，'+S.dayLabel(G,w.day+1).trim()+' 最晚約 '+hm(P.back)+' 回到首都帝大。預計花費 '+w.check.cost+' 元（含住宿 '+P.lodging+' 元）。'
        :'和'+nameOf(id)+'去'+L.name+'：'+S.dayLabel(G,w.day).trim()+' '+hm(P.depart)+' 出發，'+P.travelLabel+'單程約 '+Math.round(P.travelH*60)+' 分鐘，預計花費 '+w.check.cost+' 元，約 '+hm(P.back)+' 回到首都帝大。';
      await GM.say(null,sum+(w.check.warns.length?'（'+w.check.warns.join('；')+'）':'')); const k=await GM.choose([{t:'就這樣約'},{t:'重新選'},{t:'算了'}]); if(k===2) return null; if(k===1) continue;
      if(n&&GM.caption) GM.caption('','（'+(typeof CHARACTERS!=='undefined'&&CHARACTERS[id]&&CHARACTERS[id].gender==='m'?'他':'她')+'看了一下手機的行事曆，點點頭。）',2000);   /* 和 INV.flow 當面約一樣的動作字幕（AA_134 第 4 節）；她答應的那一句 BB 交了再接 */
      const t=S.book(G,Object.assign(o,{day:w.day,depart:w.depart,kind:w.kind,by:'player'})); if(!t.ok){ await GM.say(null,t.why||'約不成。'); return null; }
      const ty=S.t7aYes(G,id,only,w.day), wl=!ty&&w.kind!=='overnight'&&typeof WISH!=='undefined'&&WISH.playerLines?WISH.playerLines(G,id,loc):null;   /* 約的是她的心願地點（還沒去過）：她回心願那幾句（知道／還不知道；DATE-C4、C5）*/
      if(ty) await S.sayLines(GM,id,[ty],n); else if(wl) await WISH.sayInvite(GM,id,wl,n); else await S.speak(GM,id,G.flags&&G.flags['dating_'+id]?'acceptDating':'accept',t,n); if(prefOff) await S.speak(GM,id,'transport',t,n);   /* 答應（交往中那一句只給和她交往中的玩家；她在台中、約她來臺中＝T7a 那一句）；改掉她的交通偏好她說一句 */
      await GM.say(null,'約好了：'+S.dayLabel(G,w.day).trim()+' '+hm(P.depart)+'，'+names+(ov?'（兩天一夜）':'')+'。'); return t; } };
  /* 每 0.5 秒（OUT.tick 呼叫）：一天一次的 daily；出發前 60 分鐘手機提醒（AA_128 4-1）*/
  S.tick=function(GM){ const G=GM&&GM.G; if(!G) return; S.rec(G); if(G.dateLog._daily!==G.day){ G.dateLog._daily=G.day; S.daily(G); }
    if(G.flags&&!G.flags.SIS_EXAM_DONE&&typeof STORY!=='undefined'&&STORY.dayOfKey&&G.day>=STORY.dayOfKey(S.SIS_EXAM_END)&&!S.sisPreexam(G)) G.flags.SIS_EXAM_DONE=true;   /* 學姊研究所筆試考完（2026-02-02 以後）：學姊心願 D15 的條件（wish_bb.json，BB-C 68f18538，取代 SIS_HEALED）*/
    for(const t of G.trips){ if(t.status!=='booked'||typeof OUT==='undefined'||!OUT.get) continue; const q=OUT.get(G,'date_'+t.trip); if(q&&q.state==='missed') t.status='missed'; }   /* 玩家沒出發（過了出發時間，OUT.expire）＝錯過：不算次數、不扣關係（照一日約會；兩天一夜的住宿是晚上才扣，所以也不扣）；行程不再佔那兩天 */
    const now=G.day*24+G.hour; for(const t of G.trips){ if(t.status!=='booked'||t.reminded) continue; const dep=t.day*24+t.depart; if(now>=dep-1&&now<dep){ t.reminded=true; const L=S.loc(t.locs[0])||{}, msg='手機｜提醒：'+hm(t.depart)+'，你約了'+nameOf(t.who)+'去'+(L.name||'')+'。'; if(GM.toast) GM.toast(msg,3200);
      const q=typeof OUT!=='undefined'&&OUT.get?OUT.get(G,'date_'+t.trip):null; if(q&&q.state==='planned'&&!q.arrived&&GM.choose&&!(GM.E&&GM.E.player&&GM.E.player.busy)&&!(GM.D&&GM.D.active)) return S.early(GM,q,t,msg); } } };   /* 可以提早出發（UX-INV-GO-1023）：OUT.tick 等這個選單結束 */
  /* 出發前 60 分鐘提醒的時候就可以出發（使用者 10-23「現在有提醒有約會快到 應該要新增可以直接到約會地點的功能」，UX-INV-GO-1023）：
     「現在出發」＝和出發時間到的「出發」一樣（OUT.go：抵達不早於約好的時間，中間的時間直接過去）；「到時間再說」＝照舊，出發時間到再問。系統字，不是台詞 */
  /* 開車、從宿舍出發（DRIVE-PICKUP-1105 第二步，AA_704 第 2 節）：選了出發＝先走到望月台停車場，在車旁邊按「開車出發」才真的出發（src/carlot3d.js 的 CARLOT.press 設 departed、going）；從家出發照舊直接走 */
  S.toCar=(GM,q)=>{ if(typeof CARLOT==='undefined'||!CARLOT.need||!CARLOT.need(GM.G,q)) return false; CARLOT.toLot(GM,q); return true; };
  S.early=async function(GM,q,t,msg){ const G=GM.G; if(t.kind==='overnight'&&!S.stillOn(G,t).ok) return 'later';   /* 她第一天沒辦法來：出發時間到 S.prompt 交代 */
    let k; GM.sceneBegin(); try{ await GM.say(null,msg); k=await GM.choose([{t:'現在出發',hint:[q.place,q.travel].filter(Boolean).join('　')},{t:'到時間再說'}]); } finally { GM.sceneEnd(); }
    if(k!==0||q.state!=='planned') return 'later'; if(S.toCar(GM,q)) return 'lot'; t.departed=true; t.status='going'; await OUT.go(GM,q); return 'go'; };
  const hm=h=>typeof INV!=='undefined'&&INV.hhmm?INV.hhmm(h):String(h);
  const nameOf=id=>typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(id):id;
  /* 睡覺的鬧鐘、跳過時間的停點（DATE-S4；AA_128 4-1）：那天約好的校外約會。h＝出發前 30 分鐘（鬧鐘）、dep＝出發時間（story3d.js 的 wakeAlarms、小睡；classes3d.js 的 skipStops 停在出發前 10 分鐘）*/
  S.alarmsFor=function(G,day){ return (G.trips||[]).filter(t=>t.status==='booked'&&t.day===day).map(t=>{ const L=S.loc(t.locs[0])||{}, label='和'+nameOf(t.who)+'去'+(L.name||''); return {h:t.depart-0.5,dep:t.depart,label,why:label+'（'+hm(t.depart)+' 出發）'}; }).sort((a,b)=>a.h-b.h); };
  /* 出發時間到了（AA_128 4-2、4-3）：出發／改時間／今天不去了。晚 60 分鐘以內照常出發；更晚只剩改時間、不去 */
  S.prompt=async function(GM,q){ const G=GM.G, t=S.trip(G,q.dateTrip); if(!t){ q.state='missed'; return 'no'; }
    if(t.kind==='overnight'){ const sc=S.stillOn(G,t); if(!sc.ok){ GM.sceneBegin(); try{ await GM.say(null,'今天 '+hm(t.depart)+'，你約了'+nameOf(t.who)+'去'+q.place+'。'+sc.why); } finally { GM.sceneEnd(); } t.status='missed'; q.state='missed'; return 'no'; } }   /* 她第一天沒辦法來（AA_359 第 4 節）＝錯過：取消、不算次數、不扣關係、住宿費不扣 */
    const now=G.day*24+G.hour, dep=t.day*24+t.depart, late=!q.arrived&&now-dep>1;   /* q.arrived：已經到了那裡（OUT.go 到達時存檔；讀檔後重新演這一段）——不是遲到（車程超過 1 小時的，原本讀檔會變成「這次趕不上了」）*/
    const opts=late?[{t:'改時間'},{t:'今天不去了'}]:[{t:'出發',hint:q.place+'　'+q.travel},{t:'改時間'},{t:'今天不去了'}];
    let k; GM.sceneBegin(); try{ if(!late&&!t.departSaid){ t.departSaid=true; await S.speak(GM,t.who,'depart',t); }   /* 出發時間到：她傳一則訊息（BB_128 2-5 第 1 步、3-6 的「出發」；BB 五位，輪流；一趟一次）*/
      await GM.say(null,'今天 '+hm(t.depart)+'，你約了'+nameOf(t.who)+'去'+q.place+'。'+(late?'……這次趕不上了。':'現在要出發嗎？')); k=await GM.choose(opts); } finally { GM.sceneEnd(); }
    const pick=opts[k]&&opts[k].t;
    if(pick==='出發'){ if(S.toCar(GM,q)) return 'lot'; t.departed=true; t.status='going'; await OUT.go(GM,q); return 'go'; }
    if(pick==='改時間'){ return S.move(GM,q,t); }
    return S.drop(GM,q,t); };
  /* 改時間（第一版：同一天晚一小時、或明天同一時間；完整的日期時間選單是 DATE-S3）；改到第三次她說一句（BB 寫，還沒交）*/
  /* 改時間（BB 帳號 A 10-21 22:54：讀「到達」那次強制存檔以後選改時間，q.arrived 留著＝之後不會趕不上、出發車程 0；三種改法都清掉）*/
  S.move=async function(GM,q,t){ const G=GM.G, ov=t.kind==='overnight'; let k; GM.sceneBegin(); try{ k=await GM.choose((ov?[]:[{t:'晚一個小時'}]).concat([{t:'改到明天同一個時間'},{t:'算了，今天不去了'},{t:'選別的日期和時間'}])); if(ov) k++; } finally { GM.sceneEnd(); }   /* 兩天一夜固定 09:00 出發：沒有「晚一個小時」*/
    if(k===2) return S.drop(GM,q,t);
    if(k===3){ let w; GM.sceneBegin(); try{ w=await S.pickWhen(GM,{who:t.who,locs:t.locs,transport:t.transport,skip:t,kind:ov?'overnight':undefined}); } finally { GM.sceneEnd(); } if(!w) return S.move(GM,q,t);   /* 完整的日期時間選單（DATE-S3）：重新檢查雙方的日程 */
      const P=w.check.plan; t.day=w.day; t.depart=w.depart; t.kind=P.kind; t.back=P.back; if(ov) t.leave=P.leave; t.moves=(t.moves|0)+1; t.status='booked'; t.reminded=false; q.day=w.day; q.h=w.depart+P.travelH; q.ask=null; q.state='planned'; delete q.arrived; await S.movedLine(GM,t); return 'moved'; }
    if(ov){ const c=S.check(G,{who:t.who,locs:t.locs,transport:t.transport,day:t.day+1,depart:t.depart,kind:'overnight',skip:t}); if(!c.ok){ if(GM.toast) GM.toast(c.why,2600); return S.move(GM,q,t); }   /* 兩天一夜改到明天：兩天都重新檢查（考試週、她在哪、她的作息）*/
      t.day+=1; t.back=c.plan.back; t.leave=c.plan.leave; t.moves=(t.moves|0)+1; t.status='booked'; t.reminded=false; q.day=t.day; q.h=t.depart+c.plan.travelH; q.ask=null; q.state='planned'; delete q.arrived; await S.movedLine(GM,t); return 'moved'; }
    const nd=k===1?t.day+1:t.day, nh=k===1?t.depart:Math.max(t.depart,G.hour)+1; const P=S.plan(G,{who:t.who,locs:t.locs,depart:nh,transport:t.transport});
    if(!P.ok||P.back>24.5){ if(GM.toast) GM.toast('這個時間回來太晚了，換一天吧。'); return S.move(GM,q,t); }
    { const hn=S.homeNo(G,t.who,nd,t.locs[0]); if(hn){ if(GM.toast) GM.toast(hn,2600); return S.move(GM,q,t); } }
    { const cz=S.closedOn(t.locs[0],nd); if(cz){ if(GM.toast) GM.toast(cz,2600); return S.move(GM,q,t); } }   /* 改到明天撞到週一休館 */   /* AA_350 S6：改到明天撞到她回台中 */
    t.day=nd; t.depart=nh; t.back=P.back; t.moves=(t.moves|0)+1; t.status='booked'; t.reminded=false; q.day=nd; q.h=nh+P.travelH; q.ask=null; q.state='planned'; delete q.arrived; await S.movedLine(GM,t); return 'moved'; };
  /* 改時間她回一句；同一個行程改到第三次說「第三次」那句（只說一次，之後照一般）*/
  S.movedLine=async function(GM,t){ GM.sceneBegin(); try{ if(t.moves===3&&!t.move3Said){ t.move3Said=true; if(await S.speak(GM,t.who,'move3',t)) return; } await S.speak(GM,t.who,'move',t); } finally { GM.sceneEnd(); } };
  /* 今天不去了（AA_128 4-3）：不加次數；30 天內第二次當天取消＝FLAKED_<id>，自在 -2（只扣這一次）*/
  S.drop=async function(GM,q,t){ const G=GM.G; t.status='cancelled'; q.state='missed'; const L=S.log(G,t.who); const recent=L.cancels.filter(d=>G.day-d<=30).length; S.cancel(G,t.who,G.day); let flaked=false;
    if(recent>=1&&!G.flags['FLAKED_'+t.who]){ G.flags['FLAKED_'+t.who]=G.day; flaked=true; if(typeof SOCIAL!=='undefined'&&SOCIAL.adjust) SOCIAL.adjust(t.who,{comf:-2}); }
    GM.sceneBegin(); try{ await S.speak(GM,t.who,flaked?'flaked':'cancel',t); } finally { GM.sceneEnd(); }   /* 取消她回一句；30 天內第二次＝放鴿子那一句（只說一次，她不追問）*/
    return 'no'; };
  /* 30 天沒有再取消就清掉 FLAKED（每天呼叫一次也可以）*/
  S.daily=function(G){ const F=G.flags||{}; for(const id of S.HEROINES){ const k='FLAKED_'+id; if(F[k]!=null){ const L=S.log(G,id); const last=L.cancels.length?L.cancels[L.cancels.length-1]:F[k]; if(G.day-last>30) delete F[k]; } } };

  /* ===== 半互動約會（第一版：文字選單；2D 底圖＋熱區＋人物圖層是 DATE-S6）＝AA_128 第 5 節 =====
     抵達一句 → 選 2～4 個互動點（時間、花費照 point_specs；時間不夠的灰掉）→ 收尾 → 結算（5-3 的數值；不顯示數字）→ DATE.complete 計次 */
  /* D33 信義區・光年影城（AA_631，2026-11-03）：企劃的 point_specs.json 沒有 D33 的互動點時間、花費——LAWWW 暫定，照 D04 西門町電影院（散場大廳 20 分、美食街照 D04 小吃、天橋 20 分）；
     名字照 D33.json 的 points。底圖 d33_base 還沒有（CG 由使用者處理），S.listable 有底圖才列 */
  S.POINT_X={'D33.lobby':{name:'散場的影城大廳',min:20,cost:0,extra:0,act:'散場後在大廳聊電影',when:'fixed後',src:'AA_631（時間花費 LAWWW 暫定）'},'D33.food':{name:'百貨公司美食街',min:40,cost:180,extra:180,act:'百貨公司美食街',src:'AA_631（時間花費 LAWWW 暫定）'},'D33.bridge':{name:'信義區天橋',min:20,cost:0,extra:0,act:'信義區天橋看夜景',src:'AA_631（時間花費 LAWWW 暫定）'}};
  S.points=function(locId){ const P=Object.assign({},S.POINT_X,(D().points||{}).points||{}); return Object.keys(P).filter(k=>k.startsWith(locId+'.')).map(k=>Object.assign({id:k},P[k])); };
  S.GAIN=[{npcRom:5,rom:4,comf:4,fam:2,trust:2},{npcRom:3,rom:2,comf:2,fam:1,trust:1},{npcRom:2,rom:2,comf:1,fam:1,trust:0}];
  S.LIKE={like:{npcRom:1,comf:1},normal:{comf:1},dislike:{}};
  S.likeOf=(id,spot)=>((((LN().loc||{})[spot.split('.')[0]]||{}).likes||{})[id]||{})[spot]||'normal';   /* 她喜歡哪些互動點（BB／AA 標，lines/Dxx.json；還沒匯入的地點都算普通）*/
  /* ===== 各地點的台詞（DATE-S6；BB_128 2-6、2-7、2-9；lines/Dxx.json 白名單匯入）=====
     選句順序（2-9）：心願事件 → 第一次 → 記得上次（第二次，或上次點過同一個互動點）→ 交往中 → 普通（照階段：低＝剛到第 5 階、中＝第 5 階後段（和她正式出去過兩次以上）、高＝第 6 階；排除最近用過的 3 套）。
     可昕：normal 就是交往中的版本（她開場是女友），分開以後用 afterBreakup。who:'note'＝給開發的註記（不顯示；「記 TASTE＝…」照記）、who:'narr'＝旁白。
     {sunset}＝那天淡水的日落時間（算出來的）；{lastDrink}＝上次點的飲料：TASTE 的說法 AA 還沒給（S.TASTE_WORD），有這個欄位的那一套先跳過。
     心願事件（wishEvent）是另外的整場（AA_127、BB_128 第 3 節）：src/wish3d.js（S.scene 開頭轉過去）；hold 的人（台詞和現行設定衝突，DATE_WISH.hold）照舊走這裡的普通抵達句。 */
  S.TASTE_WORD={};
  /* 稿（BB_128 示範規格 D13）裡寫成旁白或寫在選項後面的開發註記，遊戲不演（AA 2026-11-11 企劃線 82dc74ca7 那一則：「請加進 NOTE_NARR（不顯示）。同一類的請一起擋」）。
     做在顯示這一層、不改資料：date_lines.js 和源稿逐格相同（約會台詞的測試都靠這個比）。匯入工具的 NOTE_NARR（who 改成 note）照舊處理原本那兩句。
     DEV_NOTE＝整句不演；DEV_STRIP＝拿掉句子裡的代號；optText＝選項後面的條件說明拿掉。測試 tests/date_devnote_1111_unit.js */
  S.DEV_NOTE=new Set(['爸爸的事只說到這裡，留給 Q12','你說了']);   /* 子晴 D13 欄杆第 6 階以上那一段第 3 句；以安 D13 飲料選項 2 回覆中間（玩家說了理由的舞台指示）*/
  S.DEV_STRIP={'請路人拍背影，C2':'請路人拍背影'};   /* 芷若 D13 合照：C2 是 CG 代號 */
  /* 選項的字後面寫「（第 N 階以上）」＝到第 N 階或交往中才出現（AA 2026-11-11 企劃線 d501078a3 回覆：「要，請接成第 6 階以上才出現（BB_128 示範規格的本意；…合照那一組也是第 6 階以上，請用同一個條件）」——和 S.spotLine 的 hi 同一個條件）。全部選項都被擋掉＝這一套當作沒有選項（照 CH.length 走） */
  S.optNeed=t=>{ const m=/（第 ?(\d+) ?階以上[^）]*）$/.exec(String(t==null?'':t)); return m?+m[1]:0; };
  S.optOk=(G,id,t)=>{ const n=S.optNeed(t); return !n||!!(G&&G.flags&&G.flags['dating_'+id])||S.stageNum(id)>=n; };
  S.optText=t=>String(t==null?'':t).replace(/（第 ?\d+ ?階以上[^）]*）$/,'');   /* 子晴 D13 拍照選項 3「「一起拍？」（第 6 階以上）」*/
  S.mem=function(G,id,loc){ S.rec(G); const M=G.dateMemory[id]||(G.dateMemory[id]={}); const m=M[loc]||(M[loc]={picks:[],last:[],taste:null,photos:0,recent:[]}); if(!Array.isArray(m.picks)) m.picks=[]; if(!Array.isArray(m.last)) m.last=[]; if(!Array.isArray(m.recent)) m.recent=[]; return m; };   /* picks＝和她在這裡點過的互動點、last＝上一次點的 */
  S.tierOf=function(G,id){ const st=S.stageNum(id); return st>=6?'high':((S.log(G,id).count|0)>=2?'mid':'low'); };
  S.sunset=function(day){ const dt=typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(day):null; if(!dt) return '傍晚';   /* NOAA 簡化公式：淡水 25.17°N、121.44°E、UTC+8 */
    const N=Math.floor((Date.UTC(dt.y,dt.m-1,dt.d)-Date.UTC(dt.y,0,0))/864e5), g=2*Math.PI/365*(N-1), eq=229.18*(0.000075+0.001868*Math.cos(g)-0.032077*Math.sin(g)-0.014615*Math.cos(2*g)-0.040849*Math.sin(2*g)),
      de=0.006918-0.399912*Math.cos(g)+0.070257*Math.sin(g)-0.006758*Math.cos(2*g)+0.000907*Math.sin(2*g)-0.002697*Math.cos(3*g)+0.00148*Math.sin(3*g), la=25.17*Math.PI/180,
      ha=Math.acos(Math.cos(90.833*Math.PI/180)/(Math.cos(la)*Math.cos(de))-Math.tan(la)*Math.tan(de))*180/Math.PI, min=720-4*(121.44-ha)-eq+480; return hm(min/60); };
  /* 夕陽前約兩小時出發（AA_128 第 8 節：淡水示範「出發時間照季節：夕陽前約兩小時出發」；DATE-C2）：那天日落時間減兩小時，取到半點；不是有夕陽收尾的地點＝null */
  S.SUNSET_LOCS={D13:2};
  S.sunsetH=day=>{ const m=/^(\d+):(\d+)$/.exec(S.sunset(day)||''); return m?+m[1]+ +m[2]/60:null; };
  S.sunsetDepart=function(locId,day){ const k=S.SUNSET_LOCS[locId]; if(k==null) return null; const h=S.sunsetH(day); return h==null?null:Math.floor((h-k)*2)/2; };
  /* 台詞組的 if／unless（Dxx.json 原樣匯入的條件：flags＝旗標都要有、memory＝記憶都要有；AA_389 第 1 點 D13 交換回來版 ZR_UK_BACK、D01 語彤 YT_TEN_MINUTES）*/
  const setCond=(G,c)=>{ if(!c) return true; const F=(G&&G.flags)||{}; if(Array.isArray(c.flags)&&c.flags.some(f=>!F[f])) return false;
    if(Array.isArray(c.memory)&&c.memory.some(m=>!(m&&typeof SOCIAL!=='undefined'&&SOCIAL.has&&SOCIAL.has(m.npc,m.tag)))) return false; return true; };
  const setUsable=(G,id,set,t)=>{ if(!set||!Array.isArray(set.lines)) return false; if(set.if&&!setCond(G,set.if)) return false; if(set.unless&&setCond(G,set.unless)) return false; const tx=JSON.stringify(set.lines); if(/\{lastDrink\}/.test(tx)){ const tw=S.TASTE_WORD[S.mem(G,id,t.locs[0]).taste]; if(!tw) return false; } return true; };
  S.pickSet=function(G,id,pool,t,key){ const m=S.mem(G,id,t.locs[0]), tier=S.tierOf(G,id); const all=(pool||[]).map((x,i)=>({x,k:key+'#'+i})).filter(o=>setUsable(G,id,o.x,t));
    let ok=all.filter(o=>!o.x.tier||o.x.tier==='any'||o.x.tier===tier); if(!ok.length) ok=all; if(!ok.length) return null; const fresh=ok.filter(o=>!m.recent.includes(o.k)); const c=fresh.length?fresh[0]:ok.slice().sort((a,b)=>m.recent.indexOf(a.k)-m.recent.indexOf(b.k))[0];   /* 都用過了：挑最久以前用的 */
    m.recent=m.recent.filter(k=>k!==c.k); m.recent.push(c.k); while(m.recent.length>3) m.recent.shift(); return c.x; };
  /* AA_630 第 2 節：沒聽過她家裡的事（沒有 YT_FAMILY_HEARD）的玩家，語彤約會台詞和選項裡的「秀琴姨」換成「煮飯的阿姨」（程式換字，一條規則）*/
  S.xiuqin=(G,id,s)=>id==='heroine_03'&&!(G&&G.flags&&G.flags.YT_FAMILY_HEARD)&&typeof s==='string'?s.replace(/秀琴姨/g,'煮飯的阿姨'):s;
  S.playSet=async function(GM,id,set,t,pid){ if(!set) return false; const G=GM.G, m=S.mem(G,id,t.locs[0]), me={name:nameOf(id),charId:id};   /* pid：正在演哪一個互動點（只有 S.spotLine、S.playOpts 傳；她請客 S.SHE_PAYS 用）*/
    const fill=x=>S.xiuqin(G,id,String(x).replace(/\{sunset\}/g,S.sunset(t.day)).replace(/\{lastDrink\}/g,S.TASTE_WORD[m.taste]||''));
    const run=async L=>{ for(const ln of (L||[])){ if(ln&&S.DEV_NOTE.has(ln.text)) continue;   /* 稿上寫成旁白的開發註記：不演（下面 S.DEV_NOTE）*/ if(!ln||ln.who==='note'){ const mm=ln&&/記 `?TASTE`?＝`?([^`]+)`?/.exec(ln.text||''); if(mm) m.taste=mm[1]==='玩家點的'?'player':mm[1]; continue; }
        const tx=fill(S.DEV_STRIP[ln.text]||ln.text); if(ln.who==='narr') await GM.say(null,/^（/.test(tx)?tx:'（'+tx+'）'); else if(ln.who===id){ if(S.shePays(id,pid,ln.text)) t.shePaid=pid;   /* 她說要請（S.SHE_PAYS）：這個互動點等一下不扣錢 */ S.splitMark(t,id,pid,ln.text);   /* 她說付一部分（S.SPLIT）＝扣一半；同一個互動點兩種都說了＝最後說的那一句算 */ await GM.say(me,tx); } else if(ln.who==='player'||ln.who==='you') await GM.say({name:G.name||'祐廷'},tx); else await GM.say({name:nameOf(ln.who),charId:ln.who},tx); } };
    await run(set.lines); const CH=Array.isArray(set.choice)?set.choice.filter(c=>c&&typeof c.t==='string'&&c.t.trim()&&S.optOk(G,id,c.t)):[];   /* optOk：字後面寫「（第 N 階以上）」的選項，到了才出現 */
    if(CH.length){ const k=await GM.choose(CH.map(c=>({t:S.xiuqin(G,id,S.optText(c.t))}))), c=CH[k]||CH[0]; await run(S.replyOf(id,c)); S.optFx(G,id,c,t); return {pick:c}; } return true; };   /* 有選項＝回傳選了哪一個（請客的 extra）*/
  /* ===== 選項的效果、每次去都有選項（DLG-FX-MECH-1110；使用者 X324；AA_746 第 2 節第 1、2 點）=====
     1. 選項 {t, reply|re, fx}：reply＝原本的格式（[{who,text}]）；re＝她回的話（一句字串或幾句的陣列；整句括號＝旁白）；fx＝{fr:n, love:n}（SOCIAL.applyFx；沒寫＝照舊沒有效果）。
        抵達、互動點、收尾的每一套（first／normal／remember／dating／afterBreakup…）只要有 choice 都會出、都算 fx。
     2. 每個互動點（抵達 arrive、收尾 closing 也一樣）可以多一格 opts＝{first, again, dating}：這一次演的那一套自己沒有 choice 的時候，接著出這一組——
        dating＝交往中；again＝第二次以後到這個互動點（抵達、收尾＝第二次以後到這個地點）；first＝第一次。again、dating 可以寫好幾組＝每次輪一組
        （記在 G.dateMemory[她][地點].optN，舊存檔沒有＝從第一組開始）。一組＝{lines?:[{who,text}], choice:[選項…]}，或直接寫選項的陣列。
        沒有 opts＝和原本一樣（第二次以後沒有選項）。 */
  S.replyOf=(id,c)=>{ if(!c) return []; if(Array.isArray(c.reply)) return c.reply; const L=c.re==null?[]:[].concat(c.re); return L.filter(x=>typeof x==='string'&&x.trim()).map(x=>/^（.*）$/.test(x)?{who:'narr',text:x}:{who:id,text:x}); };
  /* 一次校外約會（那一天、那個地點）她的戀愛合計最多 +2；告白那一晚 +3（FX-LOVE-CAP-1110）。
     告白那一晚＝今天告白的條件都到了（canConfess，選項會出「（告訴她）」的那一晚），或今天她已經答應（G.flags.confessed[她]＝今天）*/
  S.capMax=(G,id)=>{ let on=false; try{ const F=(G&&G.flags)||{}; on=!!(F.confessed&&F.confessed[id]===G.day)||!!S.canConfess(G,id).ok; }catch(e){ on=false; } const SO=typeof SOCIAL!=='undefined'?SOCIAL:{}; return on?(SO.FX_CAP_CONFESS||3):(SO.FX_CAP_MAX||2); };
  S.capOf=(G,id,t)=>({cap:'date:'+(t&&t.day!=null?t.day:G.day)+':'+((t&&t.locs&&t.locs[0])||''),max:S.capMax(G,id)});
  S.optFx=(G,id,c,t)=>c&&c.fx&&typeof SOCIAL!=='undefined'&&SOCIAL.applyFx?SOCIAL.applyFx(G,id,c.fx,S.capOf(G,id,t)):null;
  const isOpt=x=>!!x&&typeof x==='object'&&!Array.isArray(x)&&typeof x.t==='string';
  S.optList=function(g){ if(!g) return []; let L; if(Array.isArray(g)) L=g.length&&isOpt(g[0])?[{choice:g}]:g.map(x=>Array.isArray(x)?{choice:x}:x); else L=[g];
    return L.filter(x=>x&&typeof x==='object'&&Array.isArray(x.choice)&&x.choice.some(isOpt)); };
  S.optGroup=function(G,id,t,key,O,o){ if(!O||typeof O!=='object') return null; const D=S.optList(O.dating), A=S.optList(O.again), F=S.optList(O.first);
    const k=o.dating&&D.length?'dating':(o.before?(A.length?'again':null):(F.length?'first':null)); if(!k) return null; const L=k==='dating'?D:(k==='again'?A:F);
    const m=S.mem(G,id,t.locs[0]), N=(m.optN&&typeof m.optN==='object'&&!Array.isArray(m.optN))?m.optN:(m.optN={}), kk=key+':'+k, n=(N[kk]|0)%L.length; N[kk]=(N[kk]|0)+1; return L[n]; };
  S.playOpts=async function(GM,id,t,key,O,o,played){ if(played&&played.pick) return played; const g=S.optGroup(GM.G,id,t,key,O,o); if(!g) return played;
    if(!played&&!(Array.isArray(g.lines)&&g.lines.length)) return played;   /* 前面沒有任何一句、這一組自己也沒有句子＝不憑空出選項 */
    const r=await S.playSet(GM,id,{lines:Array.isArray(g.lines)?g.lines:[],choice:g.choice},t,key); return r&&r.pick?r:played; };
  const LL=(id,loc)=>((((LN().loc||{})[loc]||{}).lines||{})[id])||null;
  const brokeUp=(G,id)=>id==='kexin'&&!(G.flags&&G.flags.dating_kexin)&&(typeof STORY==='undefined'||!STORY.kxEx||STORY.kxEx(G));   /* CANON-1112：開局不是女朋友——「沒在交往」不再等於「分開了」，交往過（STORY.kxEx）才算 */
  /* 到達那一句的另一版（AA_359 5-3，企劃線 fb5156ab）：照情況換掉第一次那一組裡的幾句（同一個位置），其他句不動 */
  S.ARRIVE_VAR=[{loc:'D28',who:'classmate_peishan',when:(G,t)=>((S.whereOn(G,'classmate_peishan',t.day)||{}).own==='rent'),from:['臺南！太陽好大。','我爸媽說，好好玩，店裡不用擔心。'],to:['歡迎來臺南！今天我帶路。','我住這裡，太陽還是曬不習慣。']},   /* 沛珊大三起住臺南（PS_TN）：她帶路；原句留給還沒搬去的時候 */
    {loc:'D32',who:'kexin',when:(G,t,o)=>!!(o&&o.combo),from:['清境。要開三個多小時，我負責讓你不要睡著。'],to:['清境。從日月潭上來一個半小時，我本來要睡，結果一路在看路。']}];   /* to：AA 2026-11-11 04:09 回 LAWWW 第 4 題（可昕重寫後的新字；祐廷在開車，所以是她沒睡）；舊：「清境。從日月潭上來，一個半小時。我查過了。」 */   /* D31＋D32 同一趟：從日月潭上來（B8）；只去清境的照原句。
       2026-11-11（使用者 X324 可昕約會台詞重寫，源稿 D32.json@f9c1a2b80）：她第一次到清境的第一句新稿是「清境。要開三個多小時，我負責讓你不要睡著。」（原本「清境。山路我查了，要開三個多小時。」）——from 跟著那一格的新字；
       同一趟的那一句（to，AA_359 5-3 的字）沒有新稿、照舊，已列給 AA 確認 */
  S.arriveVar=function(G,t,set,o){ const v=S.ARRIVE_VAR.find(x=>x.loc===t.locs[0]&&x.who===t.who&&x.when(G,t,o)); if(!v||!set||!Array.isArray(set.lines)) return set;
    return Object.assign({},set,{lines:set.lines.map(ln=>{ const i=ln&&v.from.indexOf(ln.text); return i>=0?Object.assign({},ln,{text:v.to[i]}):ln; })}); };
  S.arriveLine=async function(GM,t,visits,o){ const G=GM.G, id=t.who, A=(LL(id,t.locs[0])||{}).arrive; if(!A) return false; const dating=!!(G.flags&&G.flags['dating_'+id]);
    let set=null; if(!visits&&A.first&&!A.first.wishEvent) set=S.arriveVar(G,t,A.first,o); if(!set&&dating&&id!=='kexin'&&(A.dating||[]).length) set=S.pickSet(G,id,A.dating,t,'arrive.dating'); if(!set&&brokeUp(G,id)&&(A.afterBreakup||[]).length) set=S.pickSet(G,id,A.afterBreakup,t,'arrive.after'); if(!set) set=S.pickSet(G,id,A.normal,t,'arrive.normal');
    return S.playOpts(GM,id,t,'arrive',A.opts,{before:!!visits,dating},await S.playSet(GM,id,set,t)); };
  /* 「你來過一次」（AA_160 4-4、AA_271、BB_213；src/data/solo_before.js）：自己（自由出行，G.places.free）去過的地方、第一次和她約會去那裡——抵達句說完以後一句旁白＋她的一兩句。
     同一個人、同一個地方一次（G.places.soloSaid["<id>:<地點>"]）；心願地點的第一次約會是心願事件（wish3d.js 的 freeVisited），這裡不演；她沒有那個地方的台詞＝不演；沒有數值、沒有選項 */
  S.soloBeforeDue=function(G,t,visits){ if(visits||typeof SOLO_BEFORE==='undefined'||!t||!t.who||!t.locs||!t.locs[0]) return false; const id=t.who, loc=t.locs[0];
    const P=G.places&&G.places.free; if(!P||(P[loc]|0)<1) return false; const said=G.places.soloSaid||{}; if(said[id+':'+loc]!=null) return false;
    const A=(LL(id,loc)||{}).arrive; if(A&&A.first&&A.first.wishEvent) return false;
    return !!(SOLO_BEFORE.lines[id]&&SOLO_BEFORE.lines[id][loc]&&SOLO_BEFORE.lines[id][loc].length&&SOLO_BEFORE.narr[loc]); };
  S.soloBefore=async function(GM,t,visits){ const G=GM.G; if(!S.soloBeforeDue(G,t,visits)) return false; const id=t.who, loc=t.locs[0];
    if(!G.places.soloSaid||typeof G.places.soloSaid!=='object') G.places.soloSaid={}; G.places.soloSaid[id+':'+loc]=G.day;   /* 先記：演到一半出錯也不會每次都重來 */
    await GM.say(null,'（'+SOLO_BEFORE.narr[loc]+'）'); await S.playSet(GM,id,{lines:SOLO_BEFORE.lines[id][loc]},t); return true; };
  /* 照時間分兩段的台詞（陣列）：沛珊 D13 欄杆 firstHigh＝[重考以前, 重考以後]（AA_281 第 4 節 B-6；原本當物件讀、播出空的）。重考結束＝她的消失期最後一天的隔天 */
  S.timedSet=function(G,id,v){ if(!Array.isArray(v)) return v; if(!v.length) return null; if(v.length===1) return v[0]; const back=typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey('2027-08-06'):null; return id==='classmate_peishan'&&back!=null&&G.day>=back?v[v.length-1]:v[0]; };
  /* AA_525 1-6、2-4（企劃線 6081f725f）：第一次選了哪一個要記下來（PICK_FLAG）；remember 只給選過對應選項的人（REMEMBER_IF：no＝其他人換的那一組；add＝有旗標的多幾句、once＝演過一次記 'paid'）*/
  S.PICK_FLAG=[{loc:'D06',who:'heroine_04',pid:'D06.cafe',t:'「我請妳。」',flag:'ZQ_D06_TREAT'},   /* 「好。下次我請你吃滷味。」→ remember「我說過要請你吃滷味，等一下去，我知道一間。」（2026-11-11 X324 子晴重寫 date_rewrite/zq_D06.json@02078efc0；原本「上次說要請你吃滷味，十點以後半價那間。」）；2026-11-11 AA_812@f1fab0ec6：回覆改「好。下次我請。」（path_rows）、remember 改「這家我來過兩次了。這次我請，你不要算。」（改稿紀錄 zq_D06.json 第 45 格；那一次她請客 S.SHE_PAYS）——旗標和 REMEMBER_IF 照舊；2026-11-12 X324 第三次重匯（AA_846 late_fix）：回覆 AA 改回「下次我請你吃滷味。」（path_rows 那一列被取代），remember 照舊；2026-11-12 X324 第四次重匯（AA_812 _meta.aa_c_1112）：回覆 AA 在源稿改成「下次我請。」、path_rows 那一列刪掉，remember 照舊 */
    {loc:'D15',who:'heroine_04',pid:'D15.store',t:'「布丁不行。」',flag:'ZQ_D15_NEXT'},   /* 「欸，好啦。布丁下次。」→ remember「說好的布丁，這次我要拿了。」「山上的布丁比較好吃，這是我的理論。」（2026-11-11 X324 子晴重寫 date_rewrite/zq_D15.json@02078efc0；原本「上次的布丁，今天我要。」「……上次說下次的。」）*/
    {loc:'D05',who:'classmate_peishan',pid:'D05.cafe',t:'「我請妳。」',flag:'PS_D05_EGG'}];   /* 「好啊，那下次換我。」（X327 沛珊重寫 2026-11-11：原本「那下次我請你吃蛋餅。說好了。」；旗標名不改）；2026-11-12 回覆現在是「那下次換我。我要挑名字最長的。」（AA_844 late_fix；中間 41f77eab53 那一版是「那我出甜點。…」）*/
  /* 2026-11-11（AA_812@633b7f7d6 _meta.changes，AA 12:4x「子晴 D06.cafe：拿掉 ZQ_D06_TREAT 綁定，所有人聽新句、她請——OK」）：D06.cafe 那一列拿掉＝再訪不分第一次選了什麼，都聽 remember 的新句（她當場請，AA_812 承諾那格）；PICK_FLAG 照記 ZQ_D06_TREAT（不再影響台詞）。舊：沒旗標的人聽「這家的位子我記得，靠牆那桌插座最近。」 */
  S.REMEMBER_IF=[
    {loc:'D15',who:'heroine_04',pid:'D15.store',flag:'ZQ_D15_NEXT',no:[{who:'heroine_04',text:'布丁還在同一格，我要拿了。'}]},   /* 子晴這兩列沒旗標的備用句：2026-11-11 照 AA_775_zq_date_common.json@02078efc0 換（使用者 X324；原本兩列都是「上次也來這裡。」）*/
    {loc:'D05',who:'classmate_peishan',pid:'D05.cafe',flag:'PS_D05_EGG',once:true,add:[{who:'narr',text:'（她把一杯熱紅茶推到你面前。）'},{who:'classmate_peishan',text:'說好的，這次換我。'}]}];   /* X327 沛珊重寫（date_rewrite/peishan_D05.json@2883197b6 的 for_LAWWW）：原本是一盒蛋餅、「說好的！」 */
  S.rememberOf=function(G,t,pid,R){ if(!R) return R; const F=(G&&G.flags)||{}, x=S.REMEMBER_IF.find(r=>r.loc===t.locs[0]&&r.who===t.who&&r.pid===pid); if(!x) return R;
    const has=F[x.flag]!=null&&F[x.flag]!==false&&!(x.once&&F[x.flag]==='paid');
    if(x.no) return has?R:Object.assign({},R,{lines:x.no});
    return has&&x.add?Object.assign({},R,{lines:(R.lines||[]).concat(x.add),aa525:x}):R; };
  S.pickFlag=function(G,t,pid,c){ if(!G||!G.flags||!c) return; const x=S.PICK_FLAG.find(r=>r.loc===t.locs[0]&&r.who===t.who&&r.pid===pid&&r.t===c.t); if(x&&G.flags[x.flag]==null) G.flags[x.flag]=G.day; };
  S.spotLine=async function(GM,t,pid,visits){ delete t.shePaid; delete t.sheSplit;   /* 她請客（S.SHE_PAYS）、平分（S.SPLIT）：每個互動點從頭算 */ const G=GM.G, id=t.who, H=((LL(id,t.locs[0])||{}).hotspots||{})[pid]; if(!H) return false; const m=S.mem(G,id,t.locs[0]), dating=!!(G.flags&&G.flags['dating_'+id]), hi=dating||S.stageNum(id)>=6, before=m.picks.includes(pid);
    let set=null; if(!before&&H.first&&!H.first.wishEvent) set=hi&&H.firstHigh?S.timedSet(G,id,H.firstHigh):H.first;
    if(!set&&(visits===1||m.last.includes(pid))&&H.remember&&setUsable(G,id,H.remember,t)) set=S.rememberOf(G,t,pid,H.remember);   /* 記得上次：第二次，或上一次點過同一個互動點（BB_128 2-6）；AA_525 REMEMBER_IF */
    if(!set&&dating&&id!=='kexin'&&(H.dating||[]).length) set=S.pickSet(G,id,H.dating,t,pid+'.dating');
    if(!set&&brokeUp(G,id)&&(H.afterBreakup||[]).length) set=S.pickSet(G,id,H.afterBreakup,t,pid+'.after');
    if(!set&&S.likeOf(id,pid)==='dislike'){ const dl=((((LN().loc||{})[t.locs[0]]||{}).dislikeLine||{})[id]||{})[pid]; if(dl) set={lines:[{who:id,text:dl}]}; }
    if(!set) set=S.pickSet(G,id,H.normal,t,pid+'.normal');
    const played=await S.playOpts(GM,id,t,pid,H.opts,{before,dating},await S.playSet(GM,id,set,t,pid));   /* 這一套沒有選項＝接 opts 的那一組（DLG-FX-MECH-1110）*/
    if(played&&played.pick) S.pickFlag(G,t,pid,played.pick); if(set&&set.aa525&&set.aa525.once) G.flags[set.aa525.flag]='paid';   /* AA_525：記第一次選的；蛋餅只拿一次 */
    { const c=played&&played.pick, p=c&&S.isTreat(c.t)?S.points(t.locs[0]).find(x=>x.id===pid):null; if(p) t.treated=pid; if(p&&(p.extra|0)>0) await S.pay(GM,t,p.extra|0,p.name+'（請她）'); }   /* t.treated：選了「我請」＝這一份不套平分（AA 11-11 18:58：「我請」＝他付兩個人的）*/   /* 祐廷說要請客的選項＝另外扣她那一份（AA_128 5-1、5-2 的 extra；淡水飲料攤「我請。」60）*/
    if(!hi&&/\.photo$/.test(pid)&&(id!=='kexin'||brokeUp(G,id))) await S.speak(GM,id,'noPair',t,{obj:null});   /* 合照還不到第 6 階：她說一句、只幫她拍（BB_128 2-4、3-6；可昕只有分開以後才說，交往中一定可以合照）*/
    if(hi){ const xk=Object.keys(H).find(k=>k.indexOf('extra:合照')===0); const x=xk&&H[xk]; if(x) await S.playSet(GM,id,Array.isArray(x)?S.pickSet(G,id,x,t,pid+'.extra'):x,t); }   /* 合照：第 6 階以上或交往中才有的那一句 */
    if(!m.picks.includes(pid)) m.picks.push(pid); return played; };
  S.closeLine=async function(GM,t,visits){ const G=GM.G, id=t.who, C=(LL(id,t.locs[0])||{}).closing; if(!C) return false; const dating=!!(G.flags&&G.flags['dating_'+id]);
    let set=null; if(!visits&&C.first&&!C.first.wishEvent) set=C.first; if(!set&&dating&&id!=='kexin'&&(C.dating||[]).length) set=S.pickSet(G,id,C.dating,t,'close.dating'); if(!set&&brokeUp(G,id)&&(C.afterBreakup||[]).length) set=S.pickSet(G,id,C.afterBreakup,t,'close.after'); if(!set) set=S.pickSet(G,id,C.normal,t,'close.normal');
    return S.playOpts(GM,id,t,'close',C.opts,{before:!!visits,dating},await S.playSet(GM,id,set,t)); };
  S.scene=async function(GM,q){ const G=GM.G, t=S.trip(G,q.dateTrip); if(!t) return false; if(t.kind==='overnight') return S.sceneOvernight(GM,q,t);
    if(typeof WISH!=='undefined'&&WISH.due&&WISH.due(G,t)) return WISH.scene(GM,q,t);   /* 心願本人第一次去她的心願地點＝整趟是心願事件（DATE-C4、C5；src/wish3d.js）*/
    const who={name:nameOf(t.who),charId:t.who}; const loc=t.locs[0], L=S.loc(loc);
    const visits=(S.log(G,t.who).byLoc[loc]|0); const endH=t.day*24+t.back-S.travel(loc,t.transport).minutes/60; const spots=[], m0=G.money|0;
    const fx=S.fixedOf(loc), fixH=fx?(fx.minutes|0)/60:0;   /* 固定段落（看電影）：回程已經算進去（S.plan），互動點的時間從散場開始算 */
    const pts=S.points(loc), qk=visits>=2?S.quickPick(G,t.who,pts,endH-fixH):null;   /* 快速約會（AA_128 5-4：同一個地點第三次以後）*/
    await GM.say(null,'（'+L.name+'。）'); if(L.admission) await S.pay(GM,t,L.admission,L.name+' 門票');
    if(qk&&(await GM.choose([{t:'自己選',hint:'照常一個一個選'},{t:'快速約會',hint:'她喜歡的：'+qk.map(p=>p.name).join('、')+'，直接結算'}]))===1){   /* 系統做兩個她喜歡的互動點、跳過介紹（抵達句、反應、收尾），直接結算 */
      if(fx) await S.fixedSeg(GM,L,fx,true,t);   /* 電影照樣看完（時間、電影票），旁白跳過 */
      for(const p of qk){ spots.push(p.id); if(GM.advance) GM.advance((p.min|0)/60); { const c=S.pointCost(p,t); if(c) await S.pay(GM,t,c,p.name); } const lk=S.likeOf(t.who,p.id); if(typeof SOCIAL!=='undefined'&&SOCIAL.adjust&&Object.keys(S.LIKE[lk]).length) SOCIAL.adjust(t.who,S.LIKE[lk]); S.photoAt(GM,t,p); }
      return S.settle(GM,t,spots,pts,visits,m0,{quick:true}); }
    await S.arriveLine(GM,t,visits); await S.soloBefore(GM,t,visits);   /* 抵達句（第一次／普通／交往中）→「你來過一次」*/
    if(fx) await S.fixedSeg(GM,L,fx,false,t);   /* 固定段落：抵達以後先演、散場以後才選互動點（AA_128 5-1 第 2 步）*/
    for(let n=0;n<4;n++){ const now=G.day*24+G.hour; const left=pts.filter(p=>!spots.includes(p.id));
      const opts=left.map(p=>{ const rw=S.spotOff(G,p.id), c=S.pointCost(p,t); return {t:p.name,hint:(p.min|0)+' 分'+(c?'　'+c+' 元':''),dis:!!rw||now+(p.min|0)/60>endH,why:rw||'時間差不多了'}; }).concat([{t:n?'差不多了，回去吧':'就這樣回去'}]);
      const k=await GM.choose(opts.map(o=>o.dis?{t:o.t,hint:o.why,dim:true}:o)); if(k>=left.length) break; if(opts[k].dis){ if(GM.toast) GM.toast(opts[k].why); n--; continue; }   /* 灰掉的（時間不夠、下雨停用）按了只提示，不結束 */
      const p=left[k]; spots.push(p.id); const said=await S.spotLine(GM,t,p.id,visits), half=S.takeSplit(t,p.id)&&t.treated!==p.id, free=S.takeShePaid(t,p.id); delete t.treated; if(!said&&p.act) await GM.say(null,'（'+p.act+'。）'); if(GM.advance) GM.advance((p.min|0)/60); { const c=S.halfOf(free?0:S.pointCost(p,t),half); if(c) await S.pay(GM,t,c,p.name); }   /* 互動點的反應（沒有台詞的地點照舊一句旁白）；free＝她說要請的那一次不扣（S.SHE_PAYS）；half＝她說付一部分的那一次扣一半（S.SPLIT）*/
      const lk=S.likeOf(t.who,p.id); if(typeof SOCIAL!=='undefined'&&SOCIAL.adjust&&Object.keys(S.LIKE[lk]).length) SOCIAL.adjust(t.who,S.LIKE[lk]); S.photoAt(GM,t,p);
      if(spots.length===3&&pts.length>3) await S.speak(GM,t.who,'enough',t,{obj:null});   /* 第三個互動點之後她說一句「差不多了」（BB_128 2-5 第 5 步；不分地點）*/ }
    t.spots=spots; S.mem(G,t.who,loc).last=spots.slice();
    if(!spots.length){ if(typeof SOCIAL!=='undefined'&&SOCIAL.adjust) SOCIAL.adjust(t.who,{fam:1}); t.status='cancelled'; if(!await S.speak(GM,t.who,'leaveEarly',t,{obj:null})) await GM.say(who,'……就這樣？'); return {counted:false}; }   /* 一個都沒做就走：她那一句（BB_128 3-6；沒有的人照 AA_128 5-2 的例句）*/
    await S.closeLine(GM,t,visits);   /* 收尾句（第一次／普通／交往中）*/   /* 做了 0 個就離開：不算次數、熟悉 +1（「就這樣？」是 AA_128 5-2 的例句，各人的句子 BB 寫）*/
    return S.settle(GM,t,spots,pts,visits,m0); };
  /* 結算（AA_128 5-1 第 5 步、5-3）：去了哪裡、做了什麼、花了多少錢（祐廷自己的：門票、互動點、來回車資）、照片存進相簿；不顯示好感數字 */
  S.settle=async function(GM,t,spots,pts,visits,m0,o){ const G=GM.G, loc=t.locs[0], L=S.loc(loc);
    t.spots=spots; S.mem(G,t.who,loc).last=spots.slice(); t.status='done'; const firstWish=S.wishOf(t.who)===loc&&!S.log(G,t.who).wish;
    const r=S.complete(G,t);
    if(r.counted&&typeof SOCIAL!=='undefined'&&SOCIAL.adjust){ SOCIAL.adjust(t.who,S.GAIN[Math.min(visits,2)]); if(firstWish) SOCIAL.adjust(t.who,{npcRom:4,trust:3}); if(t.by==='npc'&&SOCIAL.activity) SOCIAL.activity(t.who,'acceptInvite'); }   /* 她約你的（HEROINE-ASKS-1028）：和日常一樣，對方約的又赴約信任 +1（AA_494 0-6）*/
    if(r.counted&&typeof TERMEND!=='undefined'&&TERMEND.contact) TERMEND.contact(G,t.who,'meet');   /* 學期末的飯：正式約會 +2（BB_202 1-1）*/
    if(r.counted&&r.count===1) G.flags['DATED_1_'+t.who]=true;   /* 第一次之後：當晚她傳一張照片或一句話（AA_128 5-5；訊息內容 BB 寫）*/
    if(r.counted&&!(o&&o.quick)) await S.confessOffer(GM,t);   /* 告白：正式校外約會的結尾（AA_128 5-5、AA_215 第 1 節）*/
    if(r.counted&&typeof SISB12!=='undefined'&&SISB12.bookLate) await SISB12.bookLate(GM,t);   /* 學姊：朋友版「另外一本」之後才交往的，下一次正式約會的結尾補演一次（AA_492 第 3 節，sis_b12_3d.js）*/
    if(r.counted) S.feedPost(G,t);   /* 交往中約會後的動態（AA_515）：告白也演完以後（那時候和她交往中才排）*/
    const spent=Math.max(0,(m0|0)-(G.money|0))+(t.fare|0), ph=(G.album||[]).some(a=>a.trip===t.trip);
    const fx=S.fixedOf(loc);   /* 做了什麼：固定段落（看電影）排第一個 */
    await GM.say(null,'（今天去了'+L.name+'：'+(fx?[fx.label]:[]).concat(spots.map(id=>(pts.find(p=>p.id===id)||{}).name)).join('、')+'。'+(spent?'花了 '+spent+' 元'+(t.fare?'（含來回車資）':'')+'。':'')+(ph?'照片存進相簿。':'')+'）');   /* 結算畫面：去了哪裡、做了什麼、花了多少錢、相簿（不顯示好感數字）*/
    return r; };
  /* 交往中約會後的動態（AA_515，企劃線 aa9bbc46f；src/feed3d.js 的 FEED.dateDone、資料 src/data/feed_dates.js）：結算算一次正式校外約會以後叫（S.settle、S.settleOvernight；心願那一趟也走 S.settle）。
     要不要排（交往中、D07 不貼、一趟一則）、幾點貼都在 FEED。這裡給「兩個人分開的那一刻」＝S.backAt：OUT.go 演完照最後一個地點的單程時間回到臺北（同 outings3d.js 的回程）*/
  S.backAt=function(G,t){ const l=(t.locs||[])[(t.locs||[]).length-1], tr=S.travel(l,t.transport); return G.day*24+(+G.hour||0)+(tr?tr.minutes:30)/60; };
  S.feedPost=function(G,t){ if(typeof FEED==='undefined'||!FEED.dateDone) return null; try{ return FEED.dateDone(G,t,S.backAt(G,t)); }catch(e){ console.warn('FEED.dateDone',e); return null; } };
  /* ===== 兩天一夜的那兩天（AA_359@e75d1cce 第 1～3 節、第 5 節；句子照稿逐字，tests/date_overnight_unit.js 從稿讀出來對）=====
     晚上旁白一句、不演住宿（交往中也不演房間裡的事）；第二天早上旁白「（第二天早上。）」＋她一句。她住自己家、租的地方的那幾種換成 S.MORNING_OWN（沛珊在台中老家的 D26＝S.MORNING_HOME）。 */
  S.NIGHT={single:'（晚上住在車站附近的旅館。兩間房，隔著一道牆。）',dating:'（晚上住在一間小民宿。窗外很安靜。）',home:'（晚上她回家。你住在車站附近的旅館。）',rent:'（晚上她回租的地方。你住在車站附近的旅館。）'};   /* 還沒交往／交往中／她在自己家（D26 以安、芷若在臺中的家）／她在租的地方（D28 沛珊大三起在台南）*/
  S.MORNING_NARR='（第二天早上。）';
  S.MORNING={heroine_01:'早餐我查過了，走路五分鐘。',heroine_02:'我六點就醒了。換地方睡，都這樣。',heroine_03:'早。旅館的早餐我看過了，有稀飯。我在樓下。',heroine_04:'昨天我又弄到兩點。你先去吃早餐，幫我留一個甜的。',
    heroine_05:'（她已經在大廳，頭髮綁好了）早。你慢了七分鐘。',classmate_peishan:'我居然自己醒了，沒有靠鬧鐘。我在大廳等你，快來看奇蹟。',kexin:'第二天的我昨天重排了。你先看，有意見現在講。'};
  /* 2026-11-11（使用者 X324 子晴約會台詞重寫，AA_775_zq_date_common.json@02078efc0）：S.MORNING 子晴那一句換了（原本「昨天我又弄到兩點。……今天你負責叫我。」） */
  /* 2026-11-11（使用者 X324 可昕約會台詞重寫，AA_769_kx_date_common.json@f9c1a2b80）：S.MORNING 可昕那一句換了（原本「行程表我昨天晚上重寫了。……你看一下第二天。」） */
  /* 2026-11-11（使用者 X324 語彤約會台詞重寫，AA_767_yt_date_common.json@0a2136911）：S.MORNING 語彤那一句換了（原本講蛋餅和秀琴姨——秀琴姨傍晚才來煮晚餐，沒有幫她煎早餐） */
  /* 2026-11-11（使用者 X324 學姊約會台詞重寫，date_rewrite/sis_D26.json@82c946ad7 的 for_LAWWW）：S.MORNING 學姊那一句換了（原本「（保溫瓶已經裝好熱茶）……出發前喝一口。」；保溫瓶整份約會稿只留 D02、D09、D13 三處） */
  S.MORNING_OWN={heroine_01:'早。我買了以前上學路上那家的飯糰，兩個，一個是你的。',heroine_02:'我出門的時候，我媽叫我問你吃不吃蛋餅。她已經在煎了。',classmate_peishan:'我在樓下。早餐我買好了，買太多，你要負責吃。'};   /* 芷若：2026-11-11 照 AA_773_zr_date_common.json@e8a33995c 換（使用者 X324；原本「我出門的時候，我媽問我跟誰。……我說回來再講。」——她對媽媽不藏，BB_330 第 4 節）*/   /* 以安、芷若（D26 臺中）、沛珊（D28 臺南）；沛珊三句（MORNING、MORNING_OWN、MORNING_HOME）2026-11-11 照 X327 重寫換（date_rewrite/peishan_D26／D28.json@2883197b6 的 for_LAWWW：新設定早上起不來、家裡是連鎖餐廳） */
  S.MORNING_HOME={classmate_peishan:'我在樓下。我媽叫我帶水果給你，一大袋，我提得好辛苦。'};   /* 沛珊 D26 臺中、她剛好在台中老家（AA_359 第 3 節、5-1 B2：不借 D28 那句）*/
  /* 2026-11-11（AA_769_kx_date_common.json@f9c1a2b80 的 for_LAWWW；BB 提、AA 同意）：過夜晚上那一句補一列——D29 高雄＋可昕＝「（晚上她回家。你住在車站附近的旅館。）」。
     高雄是她老家，不回家說不通；她學期中 presence 在臺北（一起出發），照 own 算不到 home，所以另外列（比照 D26 以安／芷若在臺中的家、D28 沛珊在台南）。只管晚上那一句旁白；早上那一句照 S.MORNING */
  /* 2026-11-11（AA_775_zq_date_common.json@02078efc0；BB 11-11 定的過夜條件，BB_339 最後一段）：再補一列——D26 臺中＋子晴＝同一句「（晚上她回家。你住在車站附近的旅館。）」。
     臺中是她的家鄉（新稿 D26 改成她帶路）；不寫阿嬤家、不寫爸爸。早上那一句照 S.MORNING（她沒有 MORNING_OWN） */
  /* 2026-11-11（使用者 X324 以安約會台詞重寫，AA_777_an_date_common.json@1f88da7cc；BB 11-11 定的過夜條件，BB_340）：再補一列——D26 臺中＋以安＝同一句「（晚上她回家。你住在車站附近的旅館。）」。
     原本只有她人已經在臺中的家（寒暑假、週末，own＝home）才是這一句；學期中從臺北一起出發的那一種算不到 home（交往中＝民宿、沒交往＝兩間房），所以另外列。D26 是她的家鄉；不見媽媽、不寫媽媽在不在家。
     同一份稿另外四格只換字：S.MORNING（原本「早餐我查過了。……走路五分鐘。」）、S.HOME_NO（原本「那幾天我在台中。……換一天。」）、S.T7A_YES（原本「臺中？……好。我去車站接你。」）拿掉刪節號；
     S.MORNING_OWN 換句（原本「我媽多做了一份早餐。……叫我帶給你。」——等於媽媽知道他、還做早餐給他，那是主線的事）。這一列只管晚上那一句旁白（同可昕、子晴那兩列）：隔天早上照 S.morningLine——她人本來就在臺中的家（own）＝S.MORNING_OWN，學期中一起從臺北去＝S.MORNING。
     AA_777 第 9 列的 note 寫「隔天早上的 S.MORNING_OWN 照上面那一列」：學期中那一種要不要也換成 S.MORNING_OWN 是引擎行為，匯入時沒動，已回報 LAWWW */
  S.NIGHT_HOME=[{loc:'D29',who:'kexin'},{loc:'D26',who:'heroine_04'},{loc:'D26',who:'heroine_01'}];
  S.nightKind=(G,t,own)=>own==='home'||S.NIGHT_HOME.some(x=>x.who===t.who&&x.loc===(t.locs||[])[0])?'home':(own==='rent'?'rent':(G.flags&&G.flags['dating_'+t.who]?'dating':'single'));
  S.morningOwn=(own,night)=>own||(night==='home'?'back':null);   /* 她前一晚回自己家（S.NIGHT_HOME：以安 D26、可昕 D29、子晴 D26；own 沒有＝學期中一起從臺北去）＝隔天早上照「從家裡來」的那一句 S.MORNING_OWN（AA_777 第 9 列 note：「隔天早上的 S.MORNING_OWN 照上面那一列」——以安買了以前上學路上的飯糰）；沒有 MORNING_OWN 的人（可昕、子晴）照舊 S.MORNING。'back' 不是 'home'：不用 MORNING_HOME */
  S.morningLine=(id,own)=>(own==='home'&&S.MORNING_HOME[id])||(own&&S.MORNING_OWN[id])||S.MORNING[id]||null;
  /* 有時間的三個互動點（AA_359 5-1 B7：台詞寫死了時間，兩天一夜要限制；一日約會不限）：day＝第幾天、at＝那一天的第幾個點（0 起算）才列；until＝演完至少到幾點（接晚上那一句）。
     第一天只走一個點就「今天先到這裡」＝夕陽、星星那一趟就沒有了，第二天不補 */
  S.TIMED={'D28.sunset':{day:1,at:1,until:18},'D30.stars':{day:1,at:1,until:20},'D32.cloud':{day:2,at:0}};
  S.timedOk=(pid,dayNo,at)=>{ const T=S.TIMED[pid]; return !T||(T.day===dayNo&&T.at===at); };
  /* 同一趟的第二天換地點（AA_359 5-1 B8：日月潭→清境開車約 1 小時 30 分）：早上那一句之後的旁白、時間推幾小時；取代原本第二天的「（清境農場。）」那一行 */
  S.COMBO_DRIVE={'D31+D32':{narr:'（吃完早餐，你們開車上清境。一個半小時。）',h:1.5}};
  /* 一天的互動點（最多 S.OVERNIGHT.maxSpots 個）：時間不夠的灰掉；走過的不列（同一個地點的四個點分兩天走完）。回傳這一天做了哪些 */
  S.dayRound=async function(GM,t,pts,spots,visits,o){ const G=GM.G, day=[];   /* o.dayNo：第一天／第二天（有時間的互動點，S.TIMED）；o.bg：{k} 現在的底圖（互動點換底圖時記下來，S.POINT_BG）*/
    while(day.length<S.OVERNIGHT.maxSpots){ const left=pts.filter(p=>!spots.includes(p.id)&&S.timedOk(p.id,o.dayNo,day.length)); if(!left.length) break; const now=G.day*24+G.hour;
      const opts=left.map(p=>{ const rw=S.spotOff(G,p.id), c=S.pointCost(p,t); return {t:p.name,hint:(p.min|0)+' 分'+(c?'　'+c+' 元':''),dis:!!rw||now+(p.min|0)/60>o.endH,why:rw||'時間差不多了'}; }).concat([{t:o.stop(day.length)}]);   /* 休館的館（第二天是週一的話，G.day 已經換到第二天）、下雨停用的灰掉 */
      const k=await GM.choose(opts.map(x=>x.dis?{t:x.t,hint:x.why,dim:true}:x)); if(k>=left.length) break; if(opts[k].dis){ if(GM.toast) GM.toast(opts[k].why); continue; }
      const p=left[k]; spots.push(p.id); day.push(p.id); { const pb=S.pointBg(p.id); if(pb){ setBg(pb); if(o.bg) o.bg.k=pb; } }   /* 夕陽那一點換 d28b（B12）*/
      const said=await S.spotLine(GM,t,p.id,visits), half=S.takeSplit(t,p.id)&&t.treated!==p.id, free=S.takeShePaid(t,p.id); delete t.treated; if(!said&&p.act) await GM.say(null,'（'+p.act+'。）'); if(GM.advance) GM.advance((p.min|0)/60); { const c=S.halfOf(free?0:S.pointCost(p,t),half); if(c) await S.pay(GM,t,c,p.name); }   /* free＝她說要請的那一次不扣（S.SHE_PAYS）；half＝她說付一部分的那一次扣一半（S.SPLIT）*/
      { const T=S.TIMED[p.id]; if(T&&T.until!=null&&G.hour<T.until&&GM.advance) GM.advance(T.until-G.hour); }   /* 夕陽演完至少到 18:00、星星 20:00（B7），接晚上那一句 */
      const lk=S.likeOf(t.who,p.id); if(typeof SOCIAL!=='undefined'&&SOCIAL.adjust&&Object.keys(S.LIKE[lk]).length) SOCIAL.adjust(t.who,S.LIKE[lk]); S.photoAt(GM,t,p); }
    return day; };
  const setBg=key=>{ if(typeof ADV!=='undefined'&&ADV.setBg&&typeof OUT!=='undefined'&&OUT.bg) ADV.setBg(key?OUT.bg(key):'dark'); };
  /* 兩天：OUT.go 已經轉場到第一個地點（底圖 S.bgKey(第一個地點)）；演完回到 OUT.go 照當天來回的回程（從最後一個地點回來）*/
  S.sceneOvernight=async function(GM,q,t){ const G=GM.G, id=t.who, me={name:nameOf(id),charId:id}, O=S.OVERNIGHT, d1=t.day;
    const l1=t.locs[0], l2=t.locs[t.locs.length-1], two=l2!==l1, Lg=S.log(G,id), v1=Lg.byLoc[l1]|0, v2=two?(Lg.byLoc[l2]|0):v1, m0=G.money|0, spots=[];
    const P1=S.points(l1), P2=two?S.points(l2):P1, t2=Object.assign({},t,{locs:[l2],day:d1+1});   /* 第二天的台詞照第二天的地點、日期（D31＋D32 的第二天是清境）*/
    const L1=S.loc(l1); await GM.say(null,'（'+L1.name+'。）'); if(L1.admission) await S.pay(GM,t,L1.admission,L1.name+' 門票');
    await S.arriveLine(GM,t,v1); await S.soloBefore(GM,t,v1);   /* 第一天：到達那一句 */
    const bg={k:S.bgKey(l1)};   /* 現在的底圖（OUT.go 轉場時用的那一張）*/
    await S.dayRound(GM,t,P1,spots,v1,{endH:d1*24+O.dayEnd,stop:()=>'今天先到這裡',dayNo:1,bg});
    const own=(S.overnightWhere(G,id,d1,t.locs)||{}).own||null; t.night=S.nightKind(G,t,own);
    await GM.say(null,S.NIGHT[t.night]); await S.pay(GM,t,(t.lodging|0)||S.lodging(),'住宿');   /* 第一天晚上：旁白一句，不演；住宿一律 2,500（她回自己家、租的地方也一樣）*/
    if(GM.fade) await GM.fade(true);
    if(typeof STORY!=='undefined'&&STORY.travelOvernight) STORY.travelOvernight(GM,d1+1,O.morning); else { G.day=d1+1; G.weekday=(G.weekday+1)%7; G.hour=O.morning; }   /* 換日不演（出遊住外面一晚：不演宿舍的夜晚事件）*/
    if(!two&&bg.k!==S.bgKey(l1)){ bg.k=S.bgKey(l1); setBg(bg.k); }   /* 第二天早上回到 d28a（前一天傍晚是夕陽那一張，B12）*/
    if(GM.fade) await GM.fade(false);
    await GM.say(null,S.MORNING_NARR); { const ml=S.morningLine(id,S.morningOwn(own,t.night)); if(ml) await GM.say(me,ml); }   /* 第二天 08:30：旁白＋她一句 */
    if(two){ const L2=S.loc(l2), cd=S.COMBO_DRIVE[l1+'+'+l2];   /* D31＋D32：吃完早餐開車上清境（B8：旁白、時間推 1.5 小時；取代「（清境農場。）」那一行），清境的到達那一句 */
      if(cd){ await GM.say(null,cd.narr); if(GM.advance) GM.advance(cd.h); } bg.k=S.bgKey(l2); setBg(bg.k); if(!cd) await GM.say(null,'（'+L2.name+'。）');
      if(L2.admission) await S.pay(GM,t,L2.admission,L2.name+' 門票'); await S.arriveLine(GM,t2,v2,{combo:!!cd}); await S.soloBefore(GM,t2,v2); }
    const n1=spots.length; await S.dayRound(GM,t2,P2,spots,v2,{endH:(d1+1)*24+(t.leave!=null?t.leave:O.leave),stop:n=>n||n1?'差不多了，回去吧':'就這樣回去',dayNo:2,bg});
    t.spots=spots; for(const l of t.locs) S.mem(G,id,l).last=spots.filter(s=>s.indexOf(l+'.')===0);
    if(!spots.length){ if(typeof SOCIAL!=='undefined'&&SOCIAL.adjust) SOCIAL.adjust(id,{fam:1}); t.status='cancelled'; if(!await S.speak(GM,id,'leaveEarly',t,{obj:null})) await GM.say(me,'……就這樣？'); return {counted:false}; }   /* 兩天一個互動點都沒做：照當天來回（不算次數、熟悉 +1）*/
    await S.closeLine(GM,t2,v2);   /* 第二天 19:00 前：離開那一句（D31＋D32 用清境的；日月潭的不用）*/
    return S.settleOvernight(GM,t,spots,P1.concat(two?P2:[]),v1,m0); };
  /* 結算：一趟只算一次（AA_128 第 52 行）；DATE_OVERNIGHT 記和這個人兩天一夜過幾次（一趟一次，D31＋D32 也是一次；AA_359 5-1 B9：地點的次數 dateLog 的 byLoc 已經有）*/
  S.settleOvernight=async function(GM,t,spots,pts,visits,m0){ const G=GM.G, id=t.who, w=S.wishOf(id), firstWish=!!w&&t.locs.includes(w)&&!S.log(G,id).wish;
    t.spots=spots; t.status='done'; const r=S.complete(G,t);
    if(r.counted&&typeof SOCIAL!=='undefined'&&SOCIAL.adjust){ SOCIAL.adjust(id,S.GAIN[Math.min(visits,2)]); if(firstWish) SOCIAL.adjust(id,{npcRom:4,trust:3}); }
    if(r.counted&&typeof TERMEND!=='undefined'&&TERMEND.contact) TERMEND.contact(G,id,'meet');
    if(r.counted&&r.count===1) G.flags['DATED_1_'+id]=true;
    if(r.counted){ const F=G.flags, DO=F.DATE_OVERNIGHT&&typeof F.DATE_OVERNIGHT==='object'?F.DATE_OVERNIGHT:(F.DATE_OVERNIGHT={}); DO[id]=(DO[id]|0)+1; }
    if(r.counted) await S.confessOffer(GM,t);
    if(r.counted&&typeof SISB12!=='undefined'&&SISB12.bookLate) await SISB12.bookLate(GM,t);   /* 同 S.settle（AA_492 第 3 節）*/
    if(r.counted) S.feedPost(G,t);   /* 交往中約會後的動態（AA_515）：兩天一夜在回到臺北那一晚貼（FEED.dateDone 照 t.day＋nights 算）*/
    const spent=Math.max(0,(m0|0)-(G.money|0))+(t.fare|0), ph=(G.album||[]).some(a=>a.trip===t.trip);
    await GM.say(null,'（這兩天去了'+t.locs.map(l=>(S.loc(l)||{}).name).join('、')+'：'+spots.map(s=>(pts.find(p=>p.id===s)||{}).name).join('、')+'。'+(spent?'花了 '+spent+' 元（含來回車資、住宿）。':'')+(ph?'照片存進相簿。':'')+'）');
    return r; };
  /* ===== 告白（ROM-1017-L／SYS-02；AA_215 第 1 節（使用者定案）、AA_128 3-1～3-3、AA_126 4-2）=====
     正式校外約會的結尾、條件到齊（canConfess）＋這一位的台詞已經交付（data/confess_lines.js）才出現「（告訴她）」；不說不扣分。
     答應＝ROM.start（dating_<id>、交往紀錄）；還沒＝記 notYetFlag，不鎖線：兩週後、而且中間再多一次正式校外約會才會再出現；
     答應還是還沒（BB_191 第 10 節 @f3ae0e82，不擲骰）：她願意時，她的戀愛（npcRom）到她的答應線（YES_LINE；第 6 階是 55，AA 可以調）＝答應，沒到＝還沒；
     「還沒」兩次以後的那一次（第三次告白）一定答應（仍然願意、仍是第 6 階）；「還沒」不扣數值、不改階段；
     學姊研究所筆試以前（decline:'preexam'）＝婉拒、記 preexamFlag，一樣不鎖線（筆試前再說還是婉拒）。台詞一律照交付的定稿，這裡不寫字 */
  S.YES_LINE={heroine_04:62,classmate_peishan:65,heroine_03:68,heroine_02:68,heroine_05:70,heroine_01:72,classmate_xinci:75};   /* 芯慈 75（AA_537 第 4 節）*/
  S.confessDecide=function(G,id){ const L=S.log(G,id); if((L.notYetN|0)>=2) return 'yes'; const line=S.YES_LINE[id]; if(line==null) return 'yes'; const CD=typeof CONFESS_LINES!=='undefined'?CONFESS_LINES[id]:null; if(CD&&!CD.notYet) return 'yes';   /* 沒有「還沒」台詞的人（語彤：YT_NOT_YET 作廢）＝答應 */
    const r=typeof SOCIAL!=='undefined'&&SOCIAL.rel?SOCIAL.rel(id):null; return r&&(+r.npcRom||0)>=line?'yes':'notYet'; };
  /* 這一趟有沒有吃東西的互動點（AA_223 第 3 節：餐廳、小吃、甜點、飲料都算；只逛、只玩扭蛋不算）：子晴告白的第一句 */
  /* 請客的選項（AA_128 5-2：「這杯我請。」「茶葉蛋我買。」）：我請、我買給妳、我付；「下次我請」「那我請飲料」（互動點的 extra 不是飲料那一份）不算 */
  S.isTreat=t=>{ const x=String(t||'').replace(/[「」]/g,''); return /我請|我買給妳|我付/.test(x)&&!/下次|飲料/.test(x); };
  /* 錢不夠＝她付（AA 11-11 18:58 回 LAWWW，BB 11-11 18:56 AA_812 BROKE：子晴 D10 錢 55、一份 60，原本照扣成 −5、回程車資再扣到 −55，她也沒說話）：
     約會裡每一筆扣錢（門票、互動點、請她那一份、住宿、固定段落、回程車資）都走 S.pay——錢夠＝照扣；不夠＝那一筆她付、不扣，錢不會變負的。
     這一趟第一次她付：旁白「（你的錢不夠。她先付了。）」＋她一句（七位各一句；其他人只有旁白）；同一趟後面再不夠＝只有旁白。台詞照 AA 原文，不改字 */
  S.BROKE={narr:'（你的錢不夠。她先付了。）',lines:{heroine_01:'我來。你下次記得，我會記。',heroine_02:'（她把錢放上去）……這次我。',heroine_03:'我付啦。你不要這樣看我。',
    heroine_04:'錢包見底了喔？我來，算你欠我一次。',heroine_05:'我付。不用算。',kexin:'沒錢了齁。我來。下次你請早餐。',classmate_peishan:'你錢包在減肥喔？我來啦。'}};
  S.pay=async function(GM,t,amount,label){ const G=GM&&GM.G, c=Math.max(0,Math.round(+amount||0)); if(!c||!G) return 0;
    if((G.money|0)>=c){ if(GM.money) GM.money(-c,label); return c; }
    const first=!(t&&t.brokeSaid); if(t) t.brokeSaid=true; await GM.say(null,S.BROKE.narr);
    const L=first&&t&&S.BROKE.lines[t.who]; if(L) await GM.say({name:nameOf(t.who),charId:t.who},L); return 0; };
  /* 她請客＝這個互動點不扣玩家的錢（AA_780_an_date_followup.json@248c8e390 的 _meta.she_pays；AA 選「做機制、字不改」）：她在這個互動點說了下面這一句的那一次，祐廷那一份（S.pointCost）不扣。
     格式：{她:{互動點 id:[那一句的完整字（照 src/data/date_lines.js 那一格逐字抄；不是選項的字）]}}——之後 AA 給別人的清單照同一個格式加。
     以安三格：D06#43（D06.cafe 的 remember）、D13#23（D13.drink 的 normal 第三套，第 6 階以上才輪得到）、D18#41（D18.teahouse 的 normal 第三套，同上）。
     做法：S.playSet 播到這一句（第 5 個參數 pid＝正在演的互動點；S.spotLine、S.playOpts 才傳）記 t.shePaid＝互動點 id；S.scene、S.dayRound 在 S.spotLine 演完的當下 S.takeShePaid 看一次、清掉，
     是那個互動點才不扣（只是那一趟行程物件上的暫時欄位，演完就拿掉，不是存檔的新欄位；S.spotLine 一開始也清一次）。沒有旁白、沒有提示；選單上的「160 元」照舊；快速約會不演台詞＝照扣；
     祐廷選請客的選項另外扣的那一份（S.isTreat／extra）照舊。測試 tests/date_she_pays_1111_unit.js */
  S.SHE_PAYS={heroine_01:{'D06.cafe':['這家的蛋糕我記得，檸檬的那個。這次我請。'],'D13.drink':['這杯我請。不要跟我搶。'],'D18.teahouse':['這壺茶多少錢？好，不貴，這壺我請。']}};   /* 2026-11-12（AA_832@b84e779563，X324 以安續改第一批）：D18.teahouse normal 第三套那一句 AA 改了字（原本「這壺茶多少錢？好，不貴。我請。」）——同一格（AA_780 _meta.she_pays 的 D18#41）、還是她請，這裡跟著換成新句，不然茶樓那一次會照扣 */
  /* AA_782（企劃線 f7a23d408；X324）：其他人的請客格——學姊七格、沛珊兩格、可昕一格——不手寫：tools/date/import_she_pays.py 從稿產生 src/data/she_pays.js（SHE_PAYS_DATA.pays，同一個格式），
     這裡合進來（index.html 在 date3d.js 前面載）；稿的每一列匯入工具已經對過 date_lines.js 那一格逐字、格號、她那個互動點底下剛好一處 */
  if(typeof SHE_PAYS_DATA!=='undefined'&&SHE_PAYS_DATA&&SHE_PAYS_DATA.pays) for(const id in SHE_PAYS_DATA.pays) for(const pid in SHE_PAYS_DATA.pays[id]){ const o=S.SHE_PAYS[id]||(S.SHE_PAYS[id]={}); o[pid]=(o[pid]||[]).concat(SHE_PAYS_DATA.pays[id][pid].filter(x=>!(o[pid]||[]).includes(x))); }
  S.shePays=(id,pid,text)=>!!pid&&(((S.SHE_PAYS[id]||{})[pid])||[]).includes(text);
  S.takeShePaid=(t,pid)=>{ const y=!!t&&t.shePaid===pid; if(t) delete t.shePaid; return y; };
  /* 她付一部分＝那個互動點祐廷那一份（S.pointCost）扣一半（AA_812_date_pays_promises.json@f1fab0ec6 的 SPLIT；規則 AA 和 LAWWW 定：扣一半）。
     tools/date/import_she_pays.py 從稿產生 src/data/she_pays.js 的 SHE_PAYS_DATA.split（格式同 S.SHE_PAYS），這裡合進 S.SPLIT；稿的每一句匯入工具已經對過 date_lines.js（她那個互動點底下剛好一處、是她說的、同一句不會同時在 SHE_PAYS）。
     做法同 S.SHE_PAYS：S.playSet 播到這一句記 t.sheSplit＝互動點 id；同一個互動點她先說「我請」、後來又說「一人一半」（例：學姊 D22.fish 第一次選「那我請飲料。」）＝最後說的那一句算（S.splitMark 互相清掉）；
     S.scene、S.dayRound 在 S.spotLine 演完的當下 S.takeSplit 看一次、清掉，S.halfOf 扣一半（四捨五入到整數，Math.round）。不是存檔的新欄位；選單上的價錢照舊；快速約會不演台詞＝照扣；請她的那一份（extra）照舊。測試 tests/date_she_pays_812_1111_unit.js */
  S.SPLIT={};
  if(typeof SHE_PAYS_DATA!=='undefined'&&SHE_PAYS_DATA&&SHE_PAYS_DATA.split) for(const id in SHE_PAYS_DATA.split) for(const pid in SHE_PAYS_DATA.split[id]){ const o=S.SPLIT[id]||(S.SPLIT[id]={}); o[pid]=(o[pid]||[]).concat(SHE_PAYS_DATA.split[id][pid].filter(x=>!(o[pid]||[]).includes(x))); }
  S.sheSplits=(id,pid,text)=>!!pid&&(((S.SPLIT[id]||{})[pid])||[]).includes(text);
  S.splitMark=(t,id,pid,text)=>{ if(!t||!pid) return; if(S.shePays(id,pid,text)) delete t.sheSplit; else if(S.sheSplits(id,pid,text)){ t.sheSplit=pid; delete t.shePaid; } };
  S.takeSplit=(t,pid)=>{ const y=!!t&&t.sheSplit===pid; if(t) delete t.sheSplit; return y; };
  S.halfOf=(c,half)=>half?Math.round((c|0)/2):c;
  /* 雨天停用的互動點（BB_128 2-2：淡水「長椅停用（『椅子是濕的』）」；DATE-C2）：灰掉、寫原因 */
  S.RAIN_OFF={'D13.bench':'椅子是濕的'};
  S.rainOff=(G,pid)=>(G&&(G.weather==='rain'||G.weather==='typhoon')&&S.RAIN_OFF[pid])||'';
  /* 互動點灰掉的原因：下雨停用、館的休館日（S.pointClosed）；沒有＝'' */
  S.spotOff=(G,pid)=>S.rainOff(G,pid)||S.pointClosed(G,pid)||'';
  /* 互動點的花費：costByMode＝依交通方式（D09 纜車：捷運的車資已經含纜車來回，開車來的才在這裡扣 120；point_specs G33）*/
  S.pointCost=(p,t)=>{ const m=p&&p.costByMode; return m&&t&&m[t.transport]!=null?(m[t.transport]|0):((p&&p.cost)|0); };
  /* 固定段落的那一段（S.fixedOf）：一句旁白（地點資料的 label）、推進時間、扣祐廷自己那張票；quiet＝快速約會不演旁白 */
  S.fixedSeg=async function(GM,L,fx,quiet,t){ if(!quiet) await GM.say(null,'（'+fx.label+'。）'); if(GM.advance) GM.advance((fx.minutes|0)/60); if((fx.cost|0)>0) await S.pay(GM,t||null,fx.cost|0,L.name+' '+fx.label); };
  S.EAT=['D04.snack','D05.cafe','D06.cafe','D09.tea','D10.snack','D12.tea','D13.drink','D15.store','D16.rest','D18.snack','D18.teahouse','D20.street','D22.fish','D23.cook','D24.street','D25.cafe','D28.alley','D30.stall','D31.egg','D32.stall'];
  S.ate=t=>!!t&&Array.isArray(t.spots)&&t.spots.some(id=>S.EAT.includes(id));
  const CL=id=>(typeof CONFESS_LINES!=='undefined'&&CONFESS_LINES[id])||null;
  const CV=(x,G,...a)=>typeof x==='function'?x(G,...a):x;   /* 台詞表的欄位可以是陣列，或照情況給陣列的函式 (G,t,k) */
  S.confessReady=function(G,id,t){ const c=S.canConfess(G,id), D=CL(id); if(!c.ok) return c; if(!D||!D.yes) return {ok:false,why:'lines'};
    if(c.decline&&!D[c.decline]) return {ok:false,why:'lines'}; if(typeof D.hideIf==='function'&&D.hideIf(G,t)) return {ok:false,why:'hidden'};   /* hideIf：這段期間不走一般告白（例：沛珊重考期，改用特別場面；AA_223 第 4 節 @52702c92）*/ if(typeof D.only==='function'&&!D.only(G,t)) return {ok:false,why:'place'};   /* only：只在某些場合（例：語彤只在淡水收尾）*/
    const L=S.log(G,id), ny=L.notYet; if(ny&&(G.day-ny.day<14||(L.count|0)<=(ny.count|0))) return {ok:false,why:'notYet'}; return c; };
  /* AA_525 2-1（P-1，企劃線 6081f725f）：沛珊說「還沒」（PS_NOT_YET {n,day}）以後，下一次正式校外約會的結尾，告白選項出現以前她先開口（每一次「還沒」一次，PS_NOT_YET_TOLD）。
     她的戀愛到答應線（confessDecide 會答應）＝「……我想好了。好！」→ 照答應走（ROM.start、confessed），這一次不出告白選項；還不到＝「我還在想。……我沒有忘喔。」，
     這一次也不出選項，「還沒」的兩週從今天重算（照現有：兩週後、再一次正式校外約會）。學期末才告白（TERMEND.ON）以後新的玩家不會有 PS_NOT_YET（舊存檔才有）*/
  S.psNotYetDue=function(G,id){ if(id!=='classmate_peishan'||!G||!G.flags) return false; const F=G.flags, ny=F.PS_NOT_YET, L=S.log(G,id), n=ny&&typeof ny==='object'?(ny.n|0)||1:1;
    if(!ny||F['dating_'+id]||(F.PS_NOT_YET_TOLD&&(F.PS_NOT_YET_TOLD.n|0)>=n)) return false; if(L.notYet&&(L.count|0)<=(L.notYet.count|0)) return false; return true; };
  S.psNotYet=async function(GM,t){ const G=GM.G, id='classmate_peishan', F=G.flags, L=S.log(G,id), ny=F.PS_NOT_YET, n=ny&&typeof ny==='object'?(ny.n|0)||1:1, me={name:nameOf(id),charId:id};
    const yes=S.confessDecide(G,id)==='yes'&&S.willing(G,id).ok&&S.stageNum(id)>=6;
    F.PS_NOT_YET_TOLD={n,day:G.day,res:yes?'yes':'still'};
    if(yes){ await GM.say(me,'上次你說的那件事。'); await GM.say(me,'……我想好了。好！');
      if(typeof MREL!=='undefined'&&MREL.knowsOther&&MREL.knowsOther(G,id)){ await MREL.knowGate(GM,id,{said:true,at:'confess'}); return true; }
      if(typeof ROM!=='undefined'&&ROM.start&&ROM.start(G,id)) (F.confessed||(F.confessed={}))[id]=G.day; return true; }
    await GM.say(me,'上次你說的那件事，我還在想。……我沒有忘喔。'); L.notYet={day:G.day,count:L.count|0,n:L.notYetN|0}; return true; };
  S.confessOffer=async function(GM,t){ const G=GM.G, id=t.who; if(S.psNotYetDue(G,id)) return S.psNotYet(GM,t); if(typeof TERMEND!=='undefined'&&TERMEND.ON&&!S.rebuildConfess(G,id)) return false;   /* 告白只在學期末（BB_203；使用者 2026-10-17 11:40）：約會收尾不再有告白，改成期末飯後的回家路上（termend3d.js）；
      例外：分開過的學姊重新開始（AA_386 4-2）——演過 ev_sis_three_conditions以後第二次正式校外約會的結尾告白（「她說好的那天」）*/ const c=S.confessReady(G,id,t); if(!c.ok) return false;
    const k=await GM.choose([{t:'（告訴她）'},{t:'（今天先不說）'}]); if(k!==0) return false; return S.confess(GM,id,c,t); };
  S.confess=async function(GM,id,c,t){ const G=GM.G, D=CL(id), L=S.log(G,id), me={name:nameOf(id),charId:id};
    const run=async lines=>{ for(const ln of (lines||[])){ if(ln==null) continue; const x=typeof ln==='string'?{who:id,text:ln}:ln, o=x.expr?{expr:x.expr}:undefined;
        if(Array.isArray(x.choice)){ const kk=await GM.choose(x.choice.map(q=>({t:q.t}))); await run((x.choice[kk]||{}).say); continue; }   /* 中間的小選擇（例：學姊婉拒以後「好。」／「我知道了。」）*/
        if(x.cg!==undefined){ if(typeof ADV!=='undefined'&&ADV.cg) ADV.cg(x.cg); continue; }   /* {cg:id}：這一拍換成 CG（沒登錄的圖＝不顯示；termend3d.js run 同寫法；以安 yes 的 CG-32）*/
        if(x.who==='narr') await GM.say(null,/^（/.test(x.text)?x.text:'（'+x.text+'）'); else if(x.who==='player') await GM.say({name:G.name||'祐廷'},x.text); else if(x.who===id) await GM.say(me,x.text,o); else await GM.say({name:nameOf(x.who),charId:x.who},x.text,o); } };
    await run(CV(D.say,G,t)); let k=-1; const ch=CV(D.choice,G,t); if(Array.isArray(ch)&&ch.length){ k=await GM.choose(ch.map(q=>({t:q.t}))); await run((ch[k]||{}).say); }
    const res=c.decline?c.decline:(typeof D.unwillingIf==='function'&&D.unwillingIf(G,t)?'unwilling':(typeof D.decide==='function'?D.decide(G,t,k):S.confessDecide(G,id)));   /* unwilling：她當時不願意（AA_223：沛珊重考期等），選項照樣出現、她婉拒、不鎖線 */
    /* AA_474 第 4 節 3b：要開始交往的那一刻她知道祐廷正在和別人交往＝先演她那一節的知情對話（MREL.knowGate；學姊重新開始的告白，AA_386 4-2）：接受＝交往（OPEN_OK）；不交往＝走 L.notYet（她的「還沒」）。
       S.willing 她知道的時候看她的知情條件（AA_483 第 1 節第 7 點：TERMEND.KNOWS_OK 過了才出告白的選項）*/
    if(res==='yes'&&typeof MREL!=='undefined'&&MREL.knowsOther&&MREL.knowsOther(G,id)){ const r=await MREL.knowGate(GM,id,{said:true,at:'confess'}); if(r==='yes') return 'yes'; }
    else if(res==='yes'&&typeof ROM!=='undefined'&&ROM.start&&ROM.start(G,id)){ { const Y=CV(D.yes,G,t,k); await run(typeof CF723!=='undefined'&&CF723.swapYes?CF723.swapYes(G,id,Y):Y); }   /* 第二次告白：AA_723 secondYes 換句 */ (G.flags.confessed||(G.flags.confessed={}))[id]=G.day; return 'yes'; }
    L.notYet={day:G.day,count:L.count|0};
    if(res==='preexam'||res==='prerank'){ await run(CV(D[res],G,t,k)); const fl=D[res+'Flag']; if(fl) G.flags[fl]=G.day; return res; }   /* 學姊：筆試前／放榜前婉拒，不鎖線 */
    if(res==='unwilling'){ await run(CV(D.unwilling,G,t,k)); return 'unwilling'; }
    if(res==='others'){ await run(CV(D.others,G,t,k)); return 'others'; }   /* 芯慈：告白當下祐廷有交往對象（AA_537 第 4 節；學期末那一條在 termend3d.js walkHome）*/
    L.notYetN=(L.notYetN|0)+1; L.notYet.n=L.notYetN; await run(CV(D.notYet,G,t,k)); if(D.notYetFlag) G.flags[D.notYetFlag]={n:L.notYetN,day:G.day}; return 'notYet'; };
  /* 快速約會可以做的兩個：她喜歡的優先，不夠用普通的補（不用她不太喜歡的）；時間要夠。少於兩個就不提供 */
  S.quickPick=function(G,id,pts,endH){ const now=G.day*24+G.hour; let tot=0; const ok=[]; for(const lk of ['like','normal']) for(const p of pts){ if(ok.length>=2) break; if(S.likeOf(id,p.id)!==lk||ok.includes(p)||S.spotOff(G,p.id)) continue; if(now+(tot+(p.min|0))/60>endH) continue; ok.push(p); tot+=p.min|0; } return ok.length>=2?ok:null; };
  /* 相簿（Life Album，AA_128 5-1、5-2 拍照位置）：拍照的互動點存一張（底圖＋她的人物圖層；合照要第 6 階或交往中）。G.album＝[{kind,trip,who,loc,day,h,both}]；手機「相簿」照時間排 */
  S.photoAt=function(GM,t,p){ if(!/\.photo$/.test(p.id)) return false; const G=GM.G; if(!Array.isArray(G.album)) G.album=[]; if(G.album.some(a=>a.trip===t.trip)) return false;
    const both=!!(G.flags&&G.flags['dating_'+t.who])||S.stageNum(t.who)>=6; G.album.push({kind:'date',trip:t.trip,who:t.who,loc:t.locs[0],day:G.day,h:+(G.hour%24).toFixed(2),both}); if(GM.toast) GM.toast('照片存進相簿',2200); return true; };
  return S;
})();
