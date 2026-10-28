/* ===== 自由出行的偶遇（DL-07，AA_160 第 5 節；人物表 src/data/encounters.js＝BB_144＋AA_162）=====
   - 誰會在：照作息（characters.js 掛了 enc:'D04' 的 away 那一筆；STORY.schedEnt 說她現在在那裡才算，所以不會「人在總圖，又在淡水遇到」）＋這一列的條件
     （星期、時段、學期、單雙週、多熟、旗標）。可昕不在台大的作息表，只看這一列的時間。
   - 都不在的時候：期末考週（第 16 週）、下雨的戶外景點（D12、D13）、她和祐廷約會的那一天、還不認識（第一次見面只在原本的劇情事件）、經濟系那一年（v0 先不排）。
   - 擲一次就固定（防刷，5-1、5-6）：種子＝「日期＋地點＋時段」；有符合條件的人時 60% 遇到；依權重選一位（一般 1、前任 0.5）；在哪一刻遇到（到達、第一次散步後、第二次散步後）三選一。
     結果存在 G.daily.enc['日:地點:時段']，同一天同一個時段進出幾次都一樣。一趟最多一個人；同一個人一天最多被偶遇一次（全部景點合起來，G.daily.encMet）。
   - 第一批只有：打招呼、不打擾（不打擾沒有任何後果、不留記錄）；她在忙（busy:'yes'）只揮手。前任：點頭、走過去、打招呼，不加任何關係數值。
   - 打招呼＝AA_124「聊天（這個人今天第一次）」（SOCIAL.activity 'chat'，受每天上限）；不加戀愛、不算約會次數。
     表上有 memo 的第一次留一筆 ENC_ 記憶；之後她下一次正常聊天時說一句（ENC.schoolTalk；手機那幾句在 story3d.js 的手機小事）。G.daily.encLog：最近 30 筆。
   - 劇情事件不讀 ENC_（R7；tests/dl07_enc_unit.js 會 grep）。
   測試：node tests/dl07_enc_unit.js */
'use strict';
const ENC=(function(){
  const S={};
  const D=()=>typeof ENCOUNTERS!=='undefined'?ENCOUNTERS:{rows:[],school:{},labels:{}};
  /* 阿哲叫「哥」（AA_209 第 4 節第 6 點）：和宿舍、宿營一樣看 ZHE_CALLS_GE；沒有的玩家把「哥」拿掉（「哥！」「哥，」開頭、句中的「哥，」、「哥你」→「你」）。偶遇台詞全部經過這裡 */
  const isZhe=w=>!!w&&(w==='zhe'||w.charId==='zhe'||w.id==='zhe'||w.name==='阿哲');
  S.zheGe=(G,who,t)=>{ if(typeof t!=='string'||!isZhe(who)) return t; if(G&&G.flags&&G.flags.ZHE_CALLS_GE) return t.replace(/^欸你看，那個人在噴火/,'哥，你看，那個人在噴火');   /* 偶遇 D04：叫「哥」的版本開頭「欸」換「哥，」（AA_209 第 8 節第 6 點）*/ return t.replace(/^哥[！，]\s*/,'').replace(/^哥你/,'你').replace(/哥，/g,''); };
  const ESAY=(GM,who,t)=>GM.say(who,S.zheGe(GM.G,who,t));
  if(typeof SOCIAL!=='undefined'&&SOCIAL.MEMORY_LABEL) Object.assign(SOCIAL.MEMORY_LABEL,D().labels||{});
  const ST=()=>typeof SOCIAL!=='undefined'&&SOCIAL.STAGES?SOCIAL.STAGES:['STRANGER','ACQUAINTANCE','FAMILIAR','FRIEND','CLOSE_FRIEND','POSSIBLE_ROMANTIC_INTEREST','ROMANTIC_TENSION','RELATIONSHIP'];
  const term=G=>typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(G.day):null;
  const period=h=>h<12?'am':(h<18?'pm':'ev');
  S.rec=function(G){ const d=G.daily||(G.daily={}); if(!d.enc||typeof d.enc!=='object') d.enc={}; if(!d.encMet||d.encMet.day!==G.day) d.encMet={day:G.day,who:[]}; if(!Array.isArray(d.encLog)) d.encLog=[];
    for(const k in d.enc) if((+k.split(':')[0])<G.day-1) delete d.enc[k];   /* 舊的種子結果不用留 */ return d; };
  S.rows=spot=>(D().rows||[]).filter(r=>!spot||r.spot===spot);
  /* 和她的關係：stranger／acq（認識、有點熟）／friend（朋友以上）／dating（交往中）／ex（前任；how＝分開的方式）／catch（被發現退回朋友、重建以前）*/
  S.tier=function(G,id){ const F=G.flags||{}; if(F['dating_'+id]===true) return {t:'dating'};
    const R=F.romance&&F.romance[id]; if(R&&R.status==='friend_after_catch'&&(R.restartDay==null||G.day<R.restartDay)) return {t:'catch'};
    if(F['EX_'+id]){ const H=Array.isArray(F.ROMANCE_HISTORY)?F.ROMANCE_HISTORY:[]; let how=null; for(let i=H.length-1;i>=0;i--) if(H[i].id===id&&H[i].to!=null){ how=H[i].how||null; break; } return {t:'ex',how}; }
    const st=typeof SOCIAL!=='undefined'&&SOCIAL.stage?SOCIAL.stage(id):'STRANGER'; if(st==='STRANGER') return {t:'stranger',st};
    return {t:ST().indexOf(st)>=ST().indexOf('FRIEND')?'friend':'acq',st}; };
  /* 可昕分開的走向：B（可能回來）／C（自然分開）。分開的事件還沒做，how 寫 kx_b 的是 B，其他都當 C */
  const kxRoute=how=>/kx_b|_b$|route_b/i.test(String(how||''))?'kx_b':'kx_c';
  /* 「選一個人」以後的分開談話（AA_346，how 'apart_choice'）＝apart_talk 的一種：這一列沒有寫 apart_choice 的前任版，就讀 apart_talk 那一句（AA_346 第 5 節）*/
  const exKey=(ex,how)=>how==='apart_choice'&&!(ex&&(ex.apart_choice||ex.apart_choiceNarr))?'apart_talk':how; S.exKey=exKey;
  /* 回老家（presence kind 'home'）的人在不在這個景點的城市：景點的 area（「臺中市」）和 presence 的 home（「台中」）比，臺／台、市／縣不分 */
  const cityOf=s=>String(s||'').replace(/臺/g,'台').replace(/[市縣]$/,'');
  S.atHome=(pr,spot)=>!!(pr&&(pr.kind==='home'||pr.kind==='trip')&&pr.home&&spot&&spot.area)&&cityOf(spot.area)===cityOf(pr.home);   /* trip 帶 home：週末回老家（以安大一上第 4、8、12 週，AA_372 第 6 節第 8 題）——那個城市的偶遇照排 */
  /* 這一列現在成立嗎：回傳 {row,tier} 或 null（why 給測試看）*/
  S.eligible=function(G,row,why){ const no=w=>{ if(why) why.push(row.who+'@'+row.spot+':'+w); return null; };
    if(G.stage==='econ') return no('econ');
    const T=term(G), h=G.hour;
    if(T&&T.exam==='final') return no('期末考週');   /* 16 週制：第 16 週 */
    const spot=typeof TRIP!=='undefined'&&TRIP.spot?TRIP.spot(row.spot):null; if(spot&&spot.weather==='outdoor'&&G.weather==='rain'&&!row.rainOk) return no('下雨');   /* rainOk：戶外景點但有遮（BB_213 可昕 D10 河邊的台階）*/
    if(!((row.termDays&&T&&row.termDays[T.id])||row.days).includes(G.weekday)) return no('星期');   /* termDays：某一學期換星期（作息那一筆同一個 termDays）*/ { const f=(row.termFrom&&T&&row.termFrom[T.id]!=null)?row.termFrom[T.id]:row.from; if(!(h>=f&&h<row.to)) return no('時段'); }   /* termFrom＝某一學期晚一點才開始（AA_507 0-2 第 3 點：學姊大三上 10/16 上午法扶訪談，北投 13:00 起）*/
    if((row.terms||row.weeks)&&!T) return no('不在學期裡'); if(row.terms&&!row.terms.includes(T.id)) return no('學期');
    { const wk=(row.termWeeks&&T&&row.termWeeks[T.id])||row.weeks;   /* termWeeks＝某一學期改用別的週次（AA_373 #5：Alison 烏來大一下改第 8 週 4/18；和 characters.js 的作息一起改）*/
      if(wk&&(Array.isArray(wk)?!wk.includes(T.week):((T.week%2===1)!==(wk==='odd')))) return no('週次'); }   /* 'odd'／'even'＝單雙週；陣列＝學期的第幾週（AA_271 柏翰 D11 第 6、7 週）*/
    if(row.dates&&!(typeof STORY!=='undefined'&&STORY.inDates&&STORY.inDates(G,row.dates))) return no('日期');   /* AA_271：日期區間（含頭尾），以安回台中、阿哲回高雄的日子 */
    if(row.vacation&&!(typeof HOME!=='undefined'&&HOME.breakOf&&HOME.breakOf(G.day))) return no('不是寒暑假');   /* AA_271：語彤 D14 寒暑假的週日 */
    if(row.kexin&&typeof STORY!=='undefined'&&STORY.presence){ const pr=STORY.presence('kexin',G); if(pr&&pr.here===false&&pr.kind==='home') return no('可昕：寒暑假在'+(pr.home||'老家')); }   /* 寒暑假她在高雄，西門町、淡水不會遇到（AA_278 第 2 節第 2 點）*/
    if(!row.kexin&&typeof STORY!=='undefined'&&STORY.presence){ const pr=STORY.presence(row.who,G); if(pr&&pr.here===false&&pr.kind!=='taipei'&&!S.atHome(pr,spot)) return no('不在（'+(pr.away||pr.kind)+'）'); }   /* atHome：回老家（kind home）的日子，在她／他老家那個城市的偶遇照常（以安 D26 臺中、阿哲 D29 高雄，AA_271；HOLIDAY-PRESENCE-1021）*/   /* 交換、出國的日子（以安 2028-03-25～08-05 在日本）不出現；在臺北不在台大的照常（AA_271 第 0 節）*/
    const tr=S.tier(G,row.who);
    if(row.kexin){ if(tr.t!=='dating'&&tr.t!=='ex') return no('可昕：交往中或分開了才有'); if(tr.t==='ex'){ const k=kxRoute(tr.how); if(!(row.ex&&row.ex[k])) return no('可昕：這個走向在這裡沒有台詞'); } }
    else { if(tr.t==='stranger') return no('還不認識'); if((tr.t==='ex'||tr.t==='catch')&&row.noEx) return no('前任不來這裡');
      if(row.stageMin&&tr.t!=='dating'&&tr.t!=='ex'&&tr.t!=='catch'&&ST().indexOf(tr.st)<ST().indexOf(row.stageMin)) return no('還不夠熟'); }
    if(row.flags&&!row.flags.every(f=>G.flags&&G.flags[f])) return no('旗標');
    const R=S.rec(G); if(R.encMet.who.includes(row.who)) return no('今天遇過了');
    if(typeof OUT!=='undefined'&&OUT.rec&&OUT.rec(G).some(q=>q.day===G.day&&q.state!=='missed'&&(q.who===row.who||q.with===row.who||(row.who==='kexin'&&/^kx/.test(String(q.id||'')))))) return no('今天和她有約');
    if(!row.kexin){ const c=typeof CHARACTERS!=='undefined'?CHARACTERS[row.who]:null; const e=c&&typeof STORY!=='undefined'&&STORY.schedEnt?STORY.schedEnt(c,G):null;
      if(!e||e.zone!==null||e.act!=='out'||e.enc!==row.spot) return no('作息不在這裡'); }
    return {row,tier:tr}; };
  S.candidates=(G,spot,why)=>S.rows(spot).map(r=>S.eligible(G,r,why)).filter(Boolean);
  /* 種子（日期＋地點＋時段）→ 三個 0～1 的數（mulberry32）*/
  S.rand=function(key){ let h=1779033703^key.length; for(let i=0;i<key.length;i++){ h=Math.imul(h^key.charCodeAt(i),3432918353); h=h<<13|h>>>19; } let a=h>>>0; const nx=()=>{ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; return [nx(),nx(),nx()]; };
  S.key=(G,spot)=>G.day+':'+spot+':'+period(G.hour%24);
  S.decide=function(G,spot){ const R=S.rec(G), k=S.key(G,spot); if(R.enc[k]) return R.enc[k]; const C=S.candidates(G,spot); if(!C.length) return null;   /* 沒有人符合條件：先不定，晚一點到的人還可以擲 */
    const [r1,r2,r3]=S.rand(k); let who=null; if(r1<0.6){ const W=C.map(c=>c.tier.t==='ex'?0.5:1), sum=W.reduce((a,b)=>a+b,0); let x=r2*sum; for(let i=0;i<C.length;i++){ x-=W[i]; if(x<0){ who=C[i].row.who; break; } } if(!who) who=C[C.length-1].row.who; }
    return (R.enc[k]={who,m:Math.min(2,Math.floor(r3*3))}); };
  /* 到達（idx 0）、第一次散步後（1）、第二次散步後（2）：輪到這一刻、她現在還在，就遇到 */
  S.check=async function(GM,spot,idx){ const G=GM.G, T=G.trip; if(T&&T.enc) return false; const dec=S.decide(G,spot); if(!dec||!dec.who||dec.m!==idx) return false;
    const hit=S.rows(spot).map(r=>r.who===dec.who?S.eligible(G,r):null).find(Boolean); if(!hit) return false; await S.meet(GM,hit.row,hit.tier); return true; };
  S.atArrive=(GM,s)=>S.check(GM,s.id,0);
  S.afterWalk=(GM,s)=>S.check(GM,s.id,Math.min(2,(GM.G.trip&&GM.G.trip.walk)|0));
  const nameOf=id=>typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(id):((typeof CHARACTERS!=='undefined'&&CHARACTERS[id]&&CHARACTERS[id].name)||id);
  /* 旁邊的人說的一句（同行的 intro 寫 speaker:'yule'、淡水的 datingAfter 寫 who:'予樂'）：寫 id 或稱呼都對到人物 id，ADV 才有她的立繪。
     原本只給名字 {name:'予樂'}：game3d.js 的 say 沒有 charId＝ADV.speaker('player')，台上的可昕變暗、予樂沒有立繪（不會變成祐廷的立繪：祐廷沒有立繪檔、'player' 不佔立繪框）。
     只有立繪的人物見 characters.js 的 PORTRAIT_ONLY。對話框的名字：寫稱呼的照原文、寫 id 的用登錄的名字。對不到的（溫媽媽、綁馬尾的小女生）照舊只有名字 */
  const PO=()=>typeof PORTRAIT_ONLY!=='undefined'?PORTRAIT_ONLY:{};
  S.sayer=function(sp){ if(!sp) return null; const C=typeof CHARACTERS!=='undefined'?CHARACTERS:{}, po=PO(), own=k=>Object.prototype.hasOwnProperty.call(po,k);
    let id=typeof EVENTS!=='undefined'&&typeof EVENTS.speakerId==='function'?EVENTS.speakerId(sp):sp;
    if(!C[id]&&!own(id)) for(const k in po) if((po[k].alias||[]).includes(sp)){ id=k; break; }   /* 沒有 EVENTS 的時候（單元測試的替身）也對得到 */
    if(C[id]) return {name:id!==sp?sp:nameOf(id),charId:id};
    if(own(id)) return {name:id!==sp?sp:(po[id].name||sp),charId:id};
    return {name:sp}; };
  S.linesFor=function(row,t){ const L=row.lines||{}; if(L.all) return L.all; if(t==='dating') return L.dating||L.friend||L.acq||[]; if(t==='friend') return L.friend||L.acq||[]; return L.acq||L.friend||[]; };
  S.meet=async function(GM,row,tr){ const G=GM.G, R=S.rec(G); R.encMet.who.push(row.who); if(G.trip) G.trip.enc=row.who;
    const who={name:nameOf(row.who),charId:row.who};
    const exAcq=(tr.t==='ex'||tr.t==='catch')&&!!row.exAsAcq; if(exAcq) tr={t:'acq',st:'ACQUAINTANCE'};   /* exAsAcq：沒有前任版，照「認識」那兩句、不一起走（BB_213 沛珊 D08：課輔班在）*/
    await ESAY(GM,null,row.why);
    if(tr.t==='ex'||tr.t==='catch'){ const i=await GM.choose([{t:'點頭'},{t:'走過去'},{t:'打招呼'}]); if(i!==2) return 'pass';   /* 前任：不加任何關係數值、不留記錄 */
      const k=row.kexin?kxRoute(tr.how):exKey(row.ex,tr.how); const ex=row.ex||{}; const L=tr.t==='ex'?(ex[k]||null):null, N=tr.t==='ex'?(ex[k+'Narr']||null):null;
      if(L) for(const t of L) await ESAY(GM,who,t); if(N) await ESAY(GM,null,N); if(!L&&!N) await ESAY(GM,null,D().NOD); return 'ex'; }
    if(row.busy==='yes'){ await ESAY(GM,null,row.busyLine||'（她在講電話，對你揮揮手。）');   /* busyLine：她在忙的樣子（AA_162 8：語彤在九份做田野，只點頭）*/
      if(row.memo&&typeof SOCIAL!=='undefined'&&SOCIAL.has&&!SOCIAL.has(row.who,row.memo)&&SOCIAL.remember) SOCIAL.remember(row.who,row.memo,S.memoNote(row));   /* 只點頭也留記憶：之後在學校她會說一句 */
      R.encLog.push({day:G.day,h:+(G.hour%24).toFixed(2),spot:row.spot,who:row.who,tier:tr.t}); if(R.encLog.length>30) R.encLog.splice(0,R.encLog.length-30); return 'busy'; }
    const join=!exAcq&&S.canJoin(G,row,tr); const ops=[{t:'打招呼'},{t:'不打擾'}]; if(join) ops.push({t:'一起走一段'});   /* 第三批（DL-08）：朋友以上、不忙、這裡有她的同行台詞 */
    const i=await GM.choose(ops); if(i===1||i<0||i>=ops.length) return 'pass';   /* 不打擾：一定可以、沒有任何後果、不留記錄 */
    for(const t of S.linesFor(row,tr.t)){ if(t&&typeof t==='object'&&t.narr) await ESAY(GM,null,t.narr); else await ESAY(GM,who,t); }   /* {narr:'（…）'}＝旁白（AA_313 5-6 芯慈松菸）*/
    if(tr.t==='dating'&&row.lines&&row.lines.datingAfter){ const a=row.lines.datingAfter; await ESAY(GM,S.sayer(a.who)||{name:a.who},a.text); }
    if(row.extra&&((G.flags&&G.flags[row.extra.if])||(typeof SOCIAL!=='undefined'&&SOCIAL.has&&SOCIAL.has(row.who,row.extra.if)))) await ESAY(GM,{name:row.extra.name},row.extra.text);   /* extra：有那個旗標或記憶才多一句（BB_213：沛珊有 WZ_PS_KIDS 的話，綁馬尾的小女生也在）*/
    if(typeof SOCIAL!=='undefined'){ if(SOCIAL.activity) SOCIAL.activity(row.who,'chat');
      if(row.memo&&(!row.memoIf||row.memoIf===tr.t)&&SOCIAL.has&&!SOCIAL.has(row.who,row.memo)&&SOCIAL.remember) SOCIAL.remember(row.who,row.memo,S.memoNote(row)); }
    R.encLog.push({day:G.day,h:+(G.hour%24).toFixed(2),spot:row.spot,who:row.who,tier:tr.t}); if(R.encLog.length>30) R.encLog.splice(0,R.encLog.length-30);
    { const wk=weekKey(G), k=row.who+'@'+row.spot, W8=R.encWeeks||(R.encWeeks={}); const L=W8[k]||(W8[k]=[]); if(!L.includes(wk)) L.push(wk); (R.encLast||(R.encLast={}))[k]=G.day; }   /* 不同週遇到幾次（小支線）、最後一次在這裡打招呼（重訪）*/
    await S.side(GM,row,tr,who);
    if(i===2&&join){ for(const q of (W().intro||[])) if(q.who===row.who&&q.spot===row.spot) await ESAY(GM,S.sayer(q.speaker)||{name:q.speaker},q.line);
      if(G.trip) G.trip.with={who:row.who,tier:tr.t}; return 'join'; }
    return 'greet'; };
  /* ---------- 第三批（DL-08，AA_160 第 6 節定案；台詞 src/data/enc_walk.js＝aa_walk_v1＋bb_walk_v1）----------
     一起走一段：朋友以上（照每個人的規則）、不忙、這裡有她的同行台詞 → 景點的下一件事（散步或一個互動點）她說她的一句，做完她說離開的一句、去忙她的事；
     那一件事她沒有台詞（例：以安、沛珊不陪「空畫框」）→ 她先走。數值＝AA_124 1-2「一起去 Café 坐坐」（SOCIAL.activity 'cafe'，受每天上限；同一個人一天一次）；不是約會、不加戀愛。前任不一起走。
     重訪：到了景點、這次沒有遇到她，而且上次在這裡和她打過招呼以後還沒說過 → 一句旁白（分開以後用 afterBreakup；空的就不說）；一趟最多一句。
     小支線：不同週在同一個地方打招呼的第幾次 → 那一步的台詞（芷若「同一排」、子晴「碼頭關」、柏翰「第三個小時」）；只留 ENC_ 記憶，不改任何劇情條件。 */
  const W=()=>typeof ENC_WALK!=='undefined'?ENC_WALK:{walk:[],leave:[],intro:[],revisit:[],side:[]};
  const weekKey=G=>{ const T=term(G); return T?T.id+'W'+T.week:'D'+Math.floor(G.day/7); };
  const JOIN={heroine_01:{min:'FRIEND',not:['D06.frame']},heroine_03:{min:'FRIEND'},zhe:{},yu:{spots:['D04','D01']},classmate_bohan:{minBy:{D06:'FRIEND',D09:'FAMILIAR',D11:'FRIEND'}},classmate_xinci:{no:true},
    heroine_02:{min:'FRIEND',fromAt:{D04:19.5}},heroine_04:{},heroine_05:{min:'FRIEND'},classmate_peishan:{not:['D06.frame']},kexin:{dating:true}};   /* aa_walk_v1／bb_walk_v1 的 rules.join（第三批 AA_271 rules.join.batch3：以安 D26、語彤 D14、柏翰 D11 朋友以上；Alison D01、阿哲 D29 不限關係；芯慈 D02 不一起走）*/
  S.JOIN=JOIN;
  const SPEAKER={wen_mother:'溫媽媽',wen_father:'溫爸爸'};   /* 同行台詞裡不是主要人物的說話者 */
  S.busyNow=function(G,row,tr){ const b=row.busy; if(!b||typeof b==='string') return b||'no'; if(b.until!=null) return G.hour<b.until?b.before:b.then; if(b.acq) return tr.t==='acq'?b.acq:b.friend;
    if(b.y12){ const T=term(G); return T&&/^Y[34]/.test(T.id)?b.y3:b.y12; } return 'no'; };
  const condOk=(G,c,tr)=>{ if(!c) return true; const T=term(G); if(c.terms&&!(T&&c.terms.includes(T.id))) return false; if(c.from!=null&&G.hour<c.from) return false;
    if(c.notDating&&tr.t==='dating') return false; if(c.stageMin&&tr.t!=='dating'&&ST().indexOf(tr.st)<ST().indexOf(c.stageMin)) return false; return true; };
  S.walkLine=function(G,who,spot,act,tr){ const e=(W().walk||[]).find(q=>q.who===who&&q.spot===spot&&q.act===act&&condOk(G,q.cond,tr)); if(!e) return null; const L=tr.t==='dating'&&e.dating&&e.dating.length?e.dating:e.friend; return L&&L.length?L:null; };
  S.canJoin=function(G,row,tr){ if(!G.trip||tr.t==='ex'||tr.t==='catch'||row.join===false) return false; const J=JOIN[row.who]; if(!J||J.no) return false; if(J.dating&&tr.t!=='dating') return false;
    if(J.spots&&!J.spots.includes(row.spot)) return false; const mn=J.minBy?J.minBy[row.spot]:J.min; if(mn&&tr.t!=='dating'&&ST().indexOf(tr.st)<ST().indexOf(mn)) return false; { const fr=J.fromAt?J.fromAt[row.spot]:J.from; if(fr!=null&&G.hour<fr) return false; }   /* 芷若「19:30 以後」只在西門町（打工下班才去看電影）；松菸、外澳照朋友以上（BB_213、BB_150）*/
    if(S.busyNow(G,row,tr)==='yes') return false;   /* 「short」不擋：同行規則（aa_walk_v1／bb_walk_v1 的 rules.join）比偶遇表的 busy 新，Alison、子晴、沛珊、可昕「short」也有同行台詞 */ return (W().walk||[]).some(q=>q.who===row.who&&q.spot===row.spot&&condOk(G,q.cond,tr)); };
  S.leave=async function(GM,s){ const G=GM.G, T=G.trip; if(!T||!T.with) return false; const c=T.with; T.with=null; const e=(W().leave||[]).find(q=>q.who===c.who&&q.spot===s.id); const t=e?(c.tier==='dating'&&e.dating?e.dating:e.friend):'';
    if(t) await ESAY(GM,{name:nameOf(c.who),charId:c.who},t); return true; };
  /* 景點的下一件事之前：她有沒有這件事的台詞——沒有就先走 */
  S.companionBefore=async function(GM,s,act){ const G=GM.G, T=G.trip; if(!T||!T.with) return; const c=T.with; const tr=S.tier(G,c.who); if(!S.walkLine(G,c.who,s.id,act,Object.assign({},tr,{t:c.tier}))) await S.leave(GM,s); };
  S.companionAfter=async function(GM,s,act){ const G=GM.G, T=G.trip; if(!T||!T.with) return; const c=T.with; const tr=S.tier(G,c.who); const L=S.walkLine(G,c.who,s.id,act,Object.assign({},tr,{t:c.tier}));
    if(L){ for(const t of L){ if(t&&typeof t==='object') await ESAY(GM,{name:SPEAKER[t.who]||nameOf(t.who)},t.t); else await ESAY(GM,{name:nameOf(c.who),charId:c.who},t); }   /* {who,t}：同行的家人先說（BB_150 學姊 D24：溫媽媽叫你坐）*/ if(typeof SOCIAL!=='undefined'&&SOCIAL.activity) SOCIAL.activity(c.who,'cafe'); } await S.leave(GM,s); };
  S.revisit=async function(GM,s){ const G=GM.G, R=S.rec(G); const dec=S.decide(G,s.id); const last=R.encLast||{}, rv=R.encRev||(R.encRev={});
    for(const e of (W().revisit||[])){ if(e.spot!==s.id) continue; const k=e.who+'@'+e.spot; const ld=last[k]; if(ld==null||ld>=G.day) continue; if(rv[k]!=null&&rv[k]>=ld) continue; if(dec&&dec.who===e.who) continue;
      const tr=S.tier(G,e.who); const t=tr.t==='ex'?e.afterBreakup:e.normal; rv[k]=G.day; if(!t) continue; await ESAY(GM,null,t); return true; }
    return false; };
  /* 子晴在做遊戲是秘密，看過 Q6（PLAYTESTED）以前不能被說破（AA_313 6-5 第 1 點）：大稻埕、華山、九份三個偶遇之後在學校那一句不說、記憶記成「她在畫東西」；碼頭那條小支線（改第三關）不開 */
  const PT=()=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has('heroine_04','PLAYTESTED');
  S.Q6_GATED={ENC_D12_ZQ:1,ENC_D01_ZQ:1,ENC_D18_ZQ:1}; S.Q6_SIDE={side_zq_pier_level:1};
  S.memoNote=row=>S.Q6_GATED[row.memo]&&!PT()?'她在畫東西':undefined;
  S.side=async function(GM,row,tr,who){ const G=GM.G, R=S.rec(G); const sd=(W().side||[]).find(q=>q.who===row.who&&q.spot===row.spot); if(!sd||tr.t==='acq') return false; if(S.Q6_SIDE[sd.id]&&!PT()) return false;
    const n=((R.encWeeks||{})[row.who+'@'+row.spot]||[]).length; const st=sd.steps.find(q=>q.step===n); if(!st) return false; const done=R.encSide||(R.encSide={}); const key=sd.id+':'+n; if(done[key]) return false; done[key]=G.day;
    for(const t of (st.lines||[])) await ESAY(GM,who,t);
    if(st.choices&&st.choices.length){ const j=await GM.choose(st.choices.map(c=>({t:c.t}))); const c=st.choices[j]||st.choices[0]; if(c.r) await ESAY(GM,who,c.r); }
    if(st.mem&&typeof SOCIAL!=='undefined'&&SOCIAL.remember&&!(SOCIAL.has&&SOCIAL.has(row.who,st.mem))) SOCIAL.remember(row.who,st.mem);
    return true; };
  /* 之後在學校：有那一筆記憶、還沒說過、在對的地方 → 這一次的聊天說這一句（story3d.js talkCharacter，在閒聊階梯之前）。說過記在 G.daily.encSaid */
  /* 小支線最後一步的「之後在學校」那一句（芷若 Café、柏翰總圖；enc_walk.js side 的 after）*/
  const sideSchool=()=>{ const o={}; for(const sd of (W().side||[])) for(const st of sd.steps) if(st.mem&&st.after&&st.after.line){ const wh=st.after.where||''; o[st.mem]={who:sd.who,lines:[st.after.line],place:/Café/.test(wh)?['cafe']:(/總圖/.test(wh)?['library','library_hall']:null)}; } return o; };
  S.schoolLine=function(G,id){ const SC=Object.assign({},sideSchool(),D().school||{}); const said=(G.daily&&G.daily.encSaid)||{};
    for(const tag in SC){ const q=SC[tag]; if(q.who!==id||!q.lines||said[tag]) continue; if(!(typeof SOCIAL!=='undefined'&&SOCIAL.has&&SOCIAL.has(id,tag))) continue; if(S.Q6_GATED[tag]&&!PT()) continue; if(q.place&&!q.place.includes(G.zone)) continue;
      const M=G.social&&G.social.mem&&G.social.mem[id]; const m=M&&M.find(x=>x.tag===tag); if(m&&m.day>=G.day) continue;   /* 遇到的那一天不說 */
      const alt=q.linesIfNot; const L=alt&&!(SOCIAL.has(id,alt.memory))?alt.lines:q.lines; return {tag,lines:L}; }
    return null; };
  S.markSaid=(G,tag)=>{ const d=G.daily||(G.daily={}); (d.encSaid||(d.encSaid={}))[tag]=G.day; };
  S.schoolTalk=async function(GM,who,id){ const G=GM.G, q=S.schoolLine(G,id); if(!q) return false; for(const t of q.lines) await ESAY(GM,who,t); S.markSaid(G,q.tag);
    if(typeof SOCIAL!=='undefined'&&SOCIAL.activity){ SOCIAL.activity(id,'chat'); SOCIAL.activity(id,'chatNew'); } return true; };
  /* 手機那幾句（語彤的照片、可昕）：遇到的隔天以後、還沒傳過 */
  S.phoneReady=function(G,tag){ const q=Object.assign({},sideSchool(),D().school||{})[tag]; if(!q||!q.phone) return false; const said=(G.daily&&G.daily.encSaid)||{}; if(said[tag]) return false;
    const M=G.social&&G.social.mem&&G.social.mem[q.who]; const m=M&&M.find(x=>x.tag===tag); return !!m&&m.day<G.day; };
  S.phoneLines=tag=>((D().school||{})[tag]||{}).phone||[];
  return S;
})();
