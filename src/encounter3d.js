/* ===== 自由出行的偶遇（DL-07，AA_160 第 5 節；人物表 src/data/encounters.js＝BB_144＋AA_162）=====
   - 誰會在：照作息（characters.js 掛了 enc:'D04' 的 away 那一筆；STORY.schedEnt 說她現在在那裡才算，所以不會「人在總圖，又在淡水遇到」）＋這一列的條件
     （星期、時段、學期、單雙週、多熟、旗標）。可昕不在台大的作息表，只看這一列的時間。
   - 都不在的時候：期末考週（第 17～18 週）、下雨的戶外景點（D12、D13）、她和祐廷約會的那一天、還不認識（第一次見面只在原本的劇情事件）、經濟系那一年（v0 先不排）。
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
  /* 這一列現在成立嗎：回傳 {row,tier} 或 null（why 給測試看）*/
  S.eligible=function(G,row,why){ const no=w=>{ if(why) why.push(row.who+'@'+row.spot+':'+w); return null; };
    if(G.stage==='econ') return no('econ');
    const T=term(G), h=G.hour;
    if(T&&T.week>=17&&T.week<=18) return no('期末考週');
    const spot=typeof TRIP!=='undefined'&&TRIP.spot?TRIP.spot(row.spot):null; if(spot&&spot.weather==='outdoor'&&G.weather==='rain') return no('下雨');
    if(!row.days.includes(G.weekday)) return no('星期'); if(!(h>=row.from&&h<row.to)) return no('時段');
    if((row.terms||row.weeks)&&!T) return no('不在學期裡'); if(row.terms&&!row.terms.includes(T.id)) return no('學期');
    if(row.weeks&&((T.week%2===1)!==(row.weeks==='odd'))) return no('單雙週');
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
  S.linesFor=function(row,t){ const L=row.lines||{}; if(L.all) return L.all; if(t==='dating') return L.dating||L.friend||L.acq||[]; if(t==='friend') return L.friend||L.acq||[]; return L.acq||L.friend||[]; };
  S.meet=async function(GM,row,tr){ const G=GM.G, R=S.rec(G); R.encMet.who.push(row.who); if(G.trip) G.trip.enc=row.who;
    const who={name:nameOf(row.who),charId:row.who};
    await GM.say(null,row.why);
    if(tr.t==='ex'||tr.t==='catch'){ const i=await GM.choose([{t:'點頭'},{t:'走過去'},{t:'打招呼'}]); if(i!==2) return 'pass';   /* 前任：不加任何關係數值、不留記錄 */
      const k=row.kexin?kxRoute(tr.how):tr.how; const ex=row.ex||{}; const L=tr.t==='ex'?(ex[k]||null):null, N=tr.t==='ex'?(ex[k+'Narr']||null):null;
      if(L) for(const t of L) await GM.say(who,t); if(N) await GM.say(null,N); if(!L&&!N) await GM.say(null,D().NOD); return 'ex'; }
    if(row.busy==='yes'){ await GM.say(null,'（她在講電話，對你揮揮手。）'); return 'busy'; }
    const i=await GM.choose([{t:'打招呼'},{t:'不打擾'}]); if(i!==0) return 'pass';   /* 不打擾：一定可以、沒有任何後果、不留記錄 */
    for(const t of S.linesFor(row,tr.t)) await GM.say(who,t);
    if(tr.t==='dating'&&row.lines&&row.lines.datingAfter){ const a=row.lines.datingAfter; await GM.say({name:a.who},a.text); }
    if(typeof SOCIAL!=='undefined'){ if(SOCIAL.activity) SOCIAL.activity(row.who,'chat');
      if(row.memo&&(!row.memoIf||row.memoIf===tr.t)&&SOCIAL.has&&!SOCIAL.has(row.who,row.memo)&&SOCIAL.remember) SOCIAL.remember(row.who,row.memo); }
    R.encLog.push({day:G.day,h:+(G.hour%24).toFixed(2),spot:row.spot,who:row.who,tier:tr.t}); if(R.encLog.length>30) R.encLog.splice(0,R.encLog.length-30);
    return 'greet'; };
  /* 之後在學校：有那一筆記憶、還沒說過、在對的地方 → 這一次的聊天說這一句（story3d.js talkCharacter，在閒聊階梯之前）。說過記在 G.daily.encSaid */
  S.schoolLine=function(G,id){ const SC=D().school||{}; const said=(G.daily&&G.daily.encSaid)||{};
    for(const tag in SC){ const q=SC[tag]; if(q.who!==id||!q.lines||said[tag]) continue; if(!(typeof SOCIAL!=='undefined'&&SOCIAL.has&&SOCIAL.has(id,tag))) continue; if(q.place&&!q.place.includes(G.zone)) continue;
      const M=G.social&&G.social.mem&&G.social.mem[id]; const m=M&&M.find(x=>x.tag===tag); if(m&&m.day>=G.day) continue;   /* 遇到的那一天不說 */
      const alt=q.linesIfNot; const L=alt&&!(SOCIAL.has(id,alt.memory))?alt.lines:q.lines; return {tag,lines:L}; }
    return null; };
  S.markSaid=(G,tag)=>{ const d=G.daily||(G.daily={}); (d.encSaid||(d.encSaid={}))[tag]=G.day; };
  S.schoolTalk=async function(GM,who,id){ const G=GM.G, q=S.schoolLine(G,id); if(!q) return false; for(const t of q.lines) await GM.say(who,t); S.markSaid(G,q.tag);
    if(typeof SOCIAL!=='undefined'&&SOCIAL.activity){ SOCIAL.activity(id,'chat'); SOCIAL.activity(id,'chatNew'); } return true; };
  /* 手機那幾句（語彤的照片、可昕）：遇到的隔天以後、還沒傳過 */
  S.phoneReady=function(G,tag){ const q=(D().school||{})[tag]; if(!q||!q.phone) return false; const said=(G.daily&&G.daily.encSaid)||{}; if(said[tag]) return false;
    const M=G.social&&G.social.mem&&G.social.mem[q.who]; const m=M&&M.find(x=>x.tag===tag); return !!m&&m.day<G.day; };
  S.phoneLines=tag=>((D().school||{})[tag]||{}).phone||[];
  return S;
})();
