/* ===== 一起念書第 N 次（STUDY-DATE-PROGRESS-1107；USER_WANTS X263）=====
   使用者 11-07 03:2x（對 LAWWW-B）：「總部的每次念書都講一樣的話吧……就算一起念書五次還是覺得很不熟啊 我希望每一次念書或者一起活動都要有不同 進展的感覺 會觸發劇情 然後看第幾次可以告白?」
   使用者 11-07 03:4x（對 AA-B 選擇題，UA-AA-1107-04）：「第6次算一次約會」——一起念書第 6 場算一次正式約會、計入告白要的 4 次。
   台詞：AA_707（src/data/study_scenes.js，tools/story/import_study_scenes.py 產生）；規則：AA_706 第 1 節。
   - 每位女主角各自一個「一起念書次數」n：真的坐下念完才算，一天最多算一次（同一天第二次＝一般句、不算）。
   - 第 1～6 場依序演（k＝下一場）：第 k 場要關係階段 ≥ need（DATE.stageNum）；不夠＝這次演一般句（AA_649 第 2 節），次數照算，下次再看——不會跳過還沒演的那一場。
   - 一場＝坐下的句子（取代她坐下那一句）→ 中途那件事（取代隨機那一則；有選項的照選項加減好感，SOCIAL.adjust，不受每天上限）→ 收書 → 道別。
   - set：記旗標 G.flags[名字]＝那一天（之後的輪換、閒聊可以回扣）；unlock：記 G.flags.STUDY_UNLOCK[地點 key]＝那一天（地點接在 INVITE-PLACES-1107）。
   - 第 6 場演完＝DATE.log(G,id).count +1（正式約會一次；不算心願地點）、記 L.study6＝那一天。
   - 第 7 次以後：輪換池（六則；寫 if 的要那個旗標記過）照順序輪，不連續重複。
   - alt：條件成立時換掉那幾個欄位（語彤第 5 場＝媽媽發現她打工以後；學姊＝上了法研所以後）。
   - {name}＝玩家的名字。（小聲）不用寫：在圖書館讀書區 GM.say 會自動加（src/libquiet3d.js）。
   存檔：G.flags.STUDYN＝{人物 id:{n, k, last, rot}}；舊存檔沒有＝從第 1 場開始（已經約過幾次的舊存檔也從第 1 場開始，因為那幾次沒有演過這些戲）。
   測試：node tests/study_scenes_unit.js */
'use strict';
const STUDYN=(function(){
  const S={};
  const D=()=>(typeof STUDY_SCENES!=='undefined'&&STUDY_SCENES.people)||{};
  S.rec=G=>{ const F=G.flags||(G.flags={}); const R=F.STUDYN&&typeof F.STUDYN==='object'?F.STUDYN:(F.STUDYN={}); return R; };
  S.of=(G,id)=>{ const R=S.rec(G); let r=R[id]; if(!r||typeof r!=='object') r=R[id]={n:0,k:1,last:null,rot:-1}; if(!(r.k>=1)) r.k=1; if(typeof r.n!=='number') r.n=0; if(typeof r.rot!=='number') r.rot=-1; return r; };
  S.has=id=>!!D()[id];
  S.count=(G,id)=>S.of(G,id).n;
  /* alt 的條件（AA 寫的中文條件 → 這裡；對照在 tools/story/import_study_scenes.py 的 ALT_COND）*/
  S.ALT={
    ytMomKnows:G=>{ const F=G.flags||{}; return !!(F.YT_MOM_HERE||F.YT_MOM_TOLD||F.YT_MOM_BACK); },   /* AA_624 事件 10'（src/ytjob3d.js：媽媽在茶屋出現／蘇姨轉述／她回來上班）*/
    sisGrad:G=>{ if(typeof CALENDAR==='undefined'||!CALENDAR.dateOf) return false; const d=CALENDAR.dateOf(G.day); return !!d&&(d.y>2026||(d.y===2026&&d.m>=8)); },   /* 學姊上了法研所（2026-08 起）*/
  };
  const stage=id=>typeof DATE!=='undefined'&&DATE.stageNum?DATE.stageNum(id):1;
  const flagOn=(G,f)=>!f||!!(G.flags&&G.flags[f]!=null&&G.flags[f]!==false);
  /* 這一次演什麼：{k, seat, mid, opts, pack, bye, set, unlock} 或 {rot:i, …}；null＝照一般句（沒有稿、今天已經算過、階段不夠）*/
  S.pick=function(G,id){ const T=D()[id]; if(!T||!G) return null; const r=S.of(G,id); if(r.last===G.day) return null;
    if(r.k<=6){ const sc=T.scenes&&T.scenes[String(r.k)]; if(!sc||stage(id)<(sc.need|0)) return {generic:true}; return S.resolve(G,sc,{k:r.k}); }
    const L=(T.rot||[]).map((x,i)=>[x,i]).filter(([x])=>flagOn(G,x.if)); if(!L.length) return {generic:true};
    const nx=L.find(([,i])=>i>r.rot)||L[0]; return Object.assign({rot:nx[1]},nx[0]); };
  S.resolve=function(G,sc,o){ const A=sc.alt, on=!!(A&&S.ALT[A.cond]&&S.ALT[A.cond](G)); const out=Object.assign({},sc,o); delete out.alt;
    if(on) for(const k of ['seat','mid','pack','bye','opts']) if(A[k]) out[k]=A[k];
    return out; };
  S.text=(G,t)=>String(t).replace(/\{name\}/g,(G&&G.name)||'祐廷');
  /* 播一段：（…）＝旁白；其他＝她說 */
  S.play=async function(GM,who,lines){ for(const t of lines||[]){ const s=S.text(GM.G,t); if(/^（/.test(s)) await GM.say(null,s); else await GM.say(who,s); } };
  /* 中途那件事＋選項（有的話）*/
  S.mid=async function(GM,who,id,sc){ if(!sc) return false; await S.play(GM,who,sc.mid);
    if(sc.opts&&sc.opts.length&&GM.choose){ const k=await GM.choose(sc.opts.map(o=>({t:S.text(GM.G,o.t)}))); const o=sc.opts[k]||sc.opts[0];
      if(o){ if(typeof SOCIAL!=='undefined'&&SOCIAL.adjust) SOCIAL.adjust(id,o.rel); await S.play(GM,who,o.reply); } }
    return true; };
  /* 念完：次數 +1（一天一次）；演了第 k 場＝下一場、記旗標；第 6 場＝正式約會一次 */
  S.done=function(G,id,sc){ if(!G||!S.has(id)) return null; const r=S.of(G,id); if(r.last===G.day) return null; r.n+=1; r.last=G.day; const F=G.flags||(G.flags={});
    if(sc&&sc.k){ r.k=sc.k+1; if(sc.set) F[sc.set]=G.day; if(sc.unlock){ const U=F.STUDY_UNLOCK||(F.STUDY_UNLOCK={}); if(U[sc.unlock]==null) U[sc.unlock]=G.day; }
      if(sc.k===6&&typeof DATE!=='undefined'&&DATE.log){ const L=DATE.log(G,id); if(L.study6==null){ L.count=(L.count|0)+1; L.study6=G.day; } } }
    else if(sc&&sc.rot!=null) r.rot=sc.rot;
    return r; };
  return S;
})();
