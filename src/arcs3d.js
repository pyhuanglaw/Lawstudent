/* ===== 女主角自己的故事線（8 拍，所有一起的活動共用；STUDY-DATE-PROGRESS-1107、USER_WANTS X263）=====
   使用者 11-07 03:2x：「每次念書都講一樣的話……就算一起念書五次還是覺得很不熟啊 我希望每一次念書或者一起活動都要有不同 進展的感覺 會觸發劇情」
   使用者 11-07 05:1x 對 BB-B：「我要真的玩起來有戀愛遊戲的感覺不要很像在跟機器人說話」「他有他的故事，他有他的煩惱還有他的生活他有他的目標夢想……這些都是要聊天的」
   台詞：AA_712（src/data/heroine_arcs.js，tools/story/import_arcs.py 產生）。規則：BB_305（企劃線 elegant-brown c6678f264）。
   - 一起做任何事（念書、吃飯、咖啡、看電影、逛書店；INV.meet）都可能演下一拍，取代那一次的「中途那件事」；坐下、收東西、道別照活動自己的（AA_707／708）。
   - 同一個人一天最多一拍；條件不夠就等、不跳拍（下一次再看）：need（DATE.stageNum）、from、after、where、quietOk（在圖書館讀書區不演吵的那一拍）。
     過了 until 還沒演＝late（skip：記 missed，接著看下一拍，不擋）。
   - 一拍＝她說的事（lines）→ 她問你（ask）→ 你選（opts）→ 她回（reply）；記住答案 BEATS[id].ans[mem]；講了自己的事（tell）記 YT_TOLD[topic][id]，
     同一件事她已經聽你講過＝用那個選項的 toldAlt；set 記旗標；invite 記 ARC_INVITE（地點照 INVITE-PLACES 補）。
   - 演到一半出錯或被打斷（例外）＝這一拍不算演過，下次重演（S.done 在演完以後才叫）。
   - 活動的次數（STUDYN）、第 6 場算一次約會、DATE.log、告白條件都不動。
   存檔：G.flags.BEATS＝{人物:{k:下一拍, last:最後演的那天, ans:{mem:{opt,day}}, missed:[拍]}}、G.flags.YT_TOLD＝{topic:{人物:那天}}、G.flags.ARC_INVITE＝{人物:{拍:那天}}；舊存檔沒有＝從第 1 拍開始。
   輪換句（AA_717）：S.rotPick／rotRun；存檔 BEATS[id].rot（最近 3 個）、rotSrc（'arc'／'act'）；她記得你說過的（AA_712 cite）：BEATS[id].citeUsed[ansId]（用過幾句）、citeDay。
   測試：node tests/heroine_arcs_unit.js、node tests/arc_rot_unit.js、node tests/arc_cite_unit.js */
'use strict';
const ARCS=(function(){
  const S={};
  const D=()=>(typeof HEROINE_ARCS!=='undefined'&&HEROINE_ARCS.people)||{};
  const F=G=>G.flags||(G.flags={});
  S.rec=(G,id)=>{ const f=F(G), B=f.BEATS&&typeof f.BEATS==='object'?f.BEATS:(f.BEATS={}); let r=B[id]; if(!r||typeof r!=='object') r=B[id]={k:1,last:null,ans:{},missed:[]}; if(!(r.k>=1)) r.k=1; r.ans=r.ans||{}; r.missed=r.missed||[]; return r; };
  S.told=(G,topic,id)=>{ const T=F(G).YT_TOLD; return !!(T&&T[topic]&&T[topic][id]!=null); };
  S.has=id=>!!D()[id];
  /* 條件名（tools/story/import_arcs.py 的 COND、ALT_IF）*/
  S.COND={
    ytCats:G=>{ const f=F(G); return !!(f.YT_CATS||f.YT_FAMILY_HEARD); },   /* 找公園的貓（src/ytjob3d.js S.cats）；沒去找貓、之後在別的地方聽到家裡的事也算（不卡死）*/
    ytMomKnows:G=>{ const f=F(G); return !!(f.YT_MOM_HERE||f.YT_MOM_TOLD||f.YT_MOM_BACK); },   /* AA_624 事件 10' */
  };
  S.cond=(G,c)=>{ if(!c) return true; if(c.indexOf('dec:')===0) return typeof DECIDE!=='undefined'&&DECIDE.cond(G,c); if(c.indexOf('flag:')===0){ const v=F(G)[c.slice(5)]; return v!=null&&v!==false; } const f=S.COND[c]; return f?!!f(G):false; };
  /* 日期：YYYY-MM-DD 或 Y1S2W8（那一學期第幾週的第一天）→ 第幾天 */
  S.dayOf=function(s){ if(!s||typeof CALENDAR==='undefined') return null; let m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if(m){ if(typeof STORY!=='undefined'&&STORY.dayOfKey) return STORY.dayOfKey(s); return null; }
    m=/^(Y\d+S[12])W(\d+)$/.exec(s); if(m&&Array.isArray(CALENDAR.TERMS)){ const T=CALENDAR.TERMS.find(t=>t.id===m[1]); if(!T||typeof STORY==='undefined'||!STORY.dayOfKey) return null; const d0=STORY.dayOfKey(T.start); return d0==null?null:d0+(+m[2]-1)*7; }
    return null; };
  const stage=id=>typeof DATE!=='undefined'&&DATE.stageNum?DATE.stageNum(id):1;
  /* 這一次是什麼活動（BB_305 where）：念書／吃飯／咖啡／電影／書店 */
  S.kindOf=function(iv,P,study){ if(study) return 'study'; if(!P) return 'any'; const c=(typeof INV!=='undefined'&&INV.catsOf?INV.catsOf(P):P.cats)||[]; if(P.id==='xs_nanyang') return 'movie'; if(c.includes('fun')) return 'book'; if(c.includes('sport')) return 'gym'; if(P.kind==='meal'||c.includes('meal')) return 'eat'; if(c.includes('study')&&!c.includes('sit')) return 'study'; return 'cafe'; };
  /* 這一次演哪一拍：null＝不演（今天演過、沒有稿、條件不夠、全部演完）*/
  S.pick=function(G,id,ctx){ ctx=ctx||{}; const T=D()[id]; if(!T||!G) return null; const r=S.rec(G,id); if(r.last===G.day) return null;
    const LAST=T.beats.reduce((m,x)=>Math.max(m,(x&&x.n)|0),0);   /* 照 n 找（CANON-NO-ECON-1112 第三批：可昕第 4、5 拍整拍拿掉，n 不重排）*/
    for(let guard=0;guard<10&&r.k<=LAST;guard++){ const b=T.beats.find(x=>x&&x.n===r.k); if(!b){ r.k+=1; continue; }
      if(r.missed.includes(b.n)){ r.k+=1; continue; }   /* 被你的選項錯過的那一拍（DECIDE closes）：不演，接著看下一拍 */
      const until=b.until?S.dayOf(b.until):null; if(until!=null&&G.day>until){ if(b.late==='skip'||!b.late){ if(!r.missed.includes(b.n)) r.missed.push(b.n); r.k+=1; continue; } }   /* 過了 until：跳過，接著看下一拍 */
      if(stage(id)<(b.need|0)) return null;
      const from=b.from?S.dayOf(b.from):null; if(from!=null&&G.day<from) return null;
      if(b.after&&!S.cond(G,b.after)) return null;
      if(b.where&&b.where!=='any'&&ctx.kind&&b.where!==ctx.kind) return null;
      if(b.quietOk===false&&ctx.quiet) return null;
      return S.resolve(G,id,b); }
    return null; };
  S.resolve=function(G,id,b){ const o=Object.assign({},b); delete o.alt; if(b.alt&&S.cond(G,b.alt.cond)){ if(b.alt.lines) o.lines=b.alt.lines; if(b.alt.ask) o.ask=b.alt.ask; }
    { const DR=typeof DECIDE!=='undefined'&&DECIDE.beatRule?DECIDE.beatRule(id,b.n):null; if(DR){ o.opts=b.opts.map((q,i)=>{ const so=DR.opts.find(x=>x.i===i); return Object.assign({},q,{stance:so?so.stance:q.stance,decideBeat:DR.key},DR.keyTrue?{key:true}:null); }); if(DR.keyNote) o.keyNote=DR.keyNote; b={...b,opts:o.opts}; } }   /* 決定拍（AA_719）：選項帶 stance、關鍵的那一組小心選擇 */
    o.opts=b.opts.map(q=>{ if(q.tell&&q.toldAlt&&S.told(G,q.tell,id)){ const A=typeof q.toldAlt==='string'?{t:q.toldAlt}:q.toldAlt; return Object.assign({},q,A,{told:true}); } return q; });
    return o; };
  S.text=(G,t)=>String(t).replace(/\{name\}/g,(G&&G.name)||'祐廷');
  /* 整句是一對（…）才是旁白（同 pool3d.js POOL.narrWhole、invites3d.js S.narrLine）；「（她說完，馬上笑著說：）不好意思，我問太多了～」是她說的（動作＋說的話），原本「（ 開頭＝旁白」會變成沒有名字（BB-B 11-08 12:39，f01f54039 起；heroine_arcs 五句）*/
  S.narrWhole=t=>{ if(typeof t!=='string'||t[0]!=='（') return false; let d=0; for(let i=0;i<t.length;i++){ const ch=t[i]; if(ch==='（') d++; else if(ch==='）'){ d--; if(d===0) return i===t.length-1; } } return false; };
  const play=async(GM,who,lines)=>{ for(const t of lines||[]){ const s=S.text(GM.G,t); if(S.narrWhole(s)) await GM.say(null,s); else await GM.say(who,s); } };
  /* 演一拍：回傳選了哪一個 */
  S.play=async function(GM,who,id,b){ const G=GM.G; await play(GM,who,b.lines); await play(GM,who,b.ask);
    const k=!GM.choose?0:(typeof DECIDE!=='undefined'?await DECIDE.choose(GM,b.opts,{text:t=>S.text(G,t),note:b.keyNote,ask:b.ask&&b.ask.length?S.text(G,b.ask[b.ask.length-1]):null}):await GM.choose(b.opts.map(o=>({t:S.text(G,o.t)})))); const o=b.opts[k]||b.opts[0];   /* key:true 的那一組：上方一行字＋選完確認（BB_305 10-5）*/
    { const said=S.text(G,o.t); if(said&&k<b.opts.length) await GM.say(/^（/.test(said)?null:{name:G.name||'祐廷'},said); }   /* 祐廷說的那一句（使用者 11-10：「我選了 學姊旁邊 的選項 沒顯示我說什麼」；括號的動作照旁白）*/
    if(typeof SOCIAL!=='undefined'&&SOCIAL.adjust&&o.rel&&Object.keys(o.rel).length){ const d=Object.assign({},o.rel); if(!(typeof SOCIAL!=='undefined'&&SOCIAL.romOk&&SOCIAL.romOk(id))) delete d.npcRom; SOCIAL.adjust(id,d); }   /* 她的戀愛只在朋友以上才算（和送東西、念書選項一樣）*/
    await play(GM,who,o.reply); return k; };
  /* 演完：下一拍、今天演過、記答案和講過的事、旗標、邀約 */
  S.done=function(G,id,b,k){ const r=S.rec(G,id), f=F(G), o=b.opts[k]||b.opts[0]; r.k=Math.max(r.k,b.n+1); r.last=G.day;
    if(o.ansId) r.ans[o.ansId]={opt:k,day:G.day};   /* 你選了什麼（AA_712 的 mem；只記在這裡，不進人物面板）*/
    if(o.tell){ const T=f.YT_TOLD||(f.YT_TOLD={}), t=T[o.tell]||(T[o.tell]={}); if(t[id]==null) t[id]=G.day; }
    if(b.set&&f[b.set]==null) f[b.set]=G.day;
    if(b.invite){ const I=f.ARC_INVITE||(f.ARC_INVITE={}), m=I[id]||(I[id]={}); if(m[b.n]==null) m[b.n]=G.day; }
    if(typeof DECIDE!=='undefined'&&(o.decide||o.opens||o.closes)) DECIDE.apply(G,id,o);   /* 她的決定、打開／錯過（BB_305 第 10 節）*/
    if(o.decideBeat&&typeof DECIDE!=='undefined'&&DECIDE.byKey) DECIDE.decideBeat(G,DECIDE.byKey(id,o.decideBeat),k);   /* 決定拍：她最後怎麼決定照 AA_719 的規則（不是照你選的）*/
    return r; };
  /* ===== 故事線那一拍不演的時候：輪換句跟著日期和故事走＋她的生活自己往前（AA_717，src/data/arc_rot.js；BB_305 第 5、6 節）=====
     挑法：條件具體的優先——when（期末週、颱風當天或隔天、過年前兩週、開學第一週、某月）＞beat／if／life（故事線走到哪、你選過什麼、她的生活到哪）＞沒條件；
     最近 3 次見面用過的不挑（G.flags.BEATS[id].rot＝最近用過的編號，最多 3 個）；都用過了＝挑最久以前用過的。
     life 只看日期（沒約她，她的生活照樣往前）；lifeMax＝到那一階以前才說。
     沒條件那一層：活動自己也有輪換句（AA_707／708 rot）的，兩邊輪流（BEATS[id].rotSrc 記上次用哪一邊）。 */
  const R=()=>(typeof ARC_ROT!=='undefined'&&ARC_ROT)||{rot:{},life:{}};
  const dating=(G,id)=>{ const f=F(G), RM=f.romance||{}; return f['dating_'+id]===true||!!(RM[id]&&RM[id].status==='dating'); };
  S.lifeStage=function(G,id){ const L=R().life[id]; if(!L||!G) return 0; let s=0; for(const l of L){ const d=S.dayOf(l.from); if(d!=null&&G.day>=d) s=Math.max(s,l.s); } return s; };
  S.lifeState=function(G,id){ const L=R().life[id], s=S.lifeStage(G,id); const l=L&&L.find(x=>x.s===s); return l?l.state:null; };
  const cny=G=>{ if(typeof CALENDAR==='undefined'||!CALENDAR.dateOf||!CALENDAR.LUNAR) return null; const y=CALENDAR.dateOf(G.day).y; for(const yy of [y,y+1]){ const L=CALENDAR.LUNAR[yy]; const d=L&&L.cny?S.dayOf(L.cny):null; if(d!=null&&G.day<d&&G.day>=d-14) return d; } return null; };
  S.whenOk=function(G,w){ if(!w) return true; if(typeof CALENDAR==='undefined') return false; const T=CALENDAR.termOf?CALENDAR.termOf(G.day):null;
    if(w==='final') return !!(T&&T.exam==='final');
    if(w==='week1') return !!(T&&T.week===1);
    if(w==='typhoon') return !!(CALENDAR.typhoon&&(CALENDAR.typhoon(G.day)||CALENDAR.typhoon(G.day-1)));
    if(w==='cny2w') return cny(G)!=null;
    const m=/^month:(\d+)$/.exec(w); if(m) return CALENDAR.dateOf(G.day).m===+m[1];
    return false; };
  S.ifOk=function(G,id,c){ if(!c) return true; if(c==='dating') return dating(G,id); if(c.indexOf('ans:')===0){ const r=S.rec(G,id); return !!(r.ans&&r.ans[c.slice(4)]); } return S.cond(G,c); };
  /* altIntern（AA_717 ee689cfb8，子晴第 14、15 則）：[{if:[條件…（全部成立；「!」開頭＝不成立）], lines}]，第一個成立的換那幾句；條件名 zqQuitIntern 在 src/aa720_3d.js 註冊 */
  S.altIntern=function(G,id,x){ const A=x&&x.altIntern; if(!Array.isArray(A)) return null; const ok=c=>c[0]==='!'?!S.ifOk(G,id,c.slice(1)):S.ifOk(G,id,c); const a=A.find(a=>Array.isArray(a.if)&&a.if.every(ok)); return a?a.lines:null; };
  /* 這一則現在能不能說：回傳 0（沒條件）／1（beat、if、life）／2（when）；不能說＝-1 */
  S.rotTier=function(G,id,x){ const r=S.rec(G,id);
    if(x.from){ const d=S.dayOf(x.from); if(d!=null&&G.day<d) return -1; } if(x.until){ const d=S.dayOf(x.until); if(d!=null&&G.day>d) return -1; }
    if(x.when&&!S.whenOk(G,x.when)) return -1;
    if(x.beat!=null&&!(r.k>x.beat)) return -1;
    if(x.if&&!S.ifOk(G,id,x.if)) return -1;
    const ls=S.lifeStage(G,id); if(x.life!=null&&ls<x.life) return -1; if(x.lifeMax!=null&&ls>x.lifeMax) return -1;
    return x.when?2:(x.beat!=null||x.if||x.life!=null||x.lifeMax!=null?1:0); };
  /* 她記得你說過的（AA712-CITE-LATER-1108；AA_712 cite_later → heroine_arcs.js 每一拍的 cite：{ansId:[句…]}；AA_712 _meta「輪換句、訊息、偶遇用；每句用一次」）：
     那一拍你選的答案（BEATS[id].ans[ansId]）記了、而且過了 5 天以上＝下一次一起做事、輪到中途那一句的時候，先說這一句（一次活動最多一句：rotPick 一次只給一則）。
     每句只用一次（BEATS[id].citeUsed[ansId]＝用過幾句）；同一個答案有兩句＝先第一句，下一次輪到再第二句。那一拍沒演（關掉、late）＝沒有 ans＝沒有。舊存檔有 ans 的照這個規則（ans 沒有記日子＝當作夠久了）。
     照拍的順序、那一拍 cite 的順序挑第一個；訊息、偶遇這一版不做（AA-B 03:00）。*/
  S.CITE_DAYS=5;
  S.citePick=function(G,id){ const P=D()[id]; if(!G||!P||!Array.isArray(P.beats)) return null; const r=S.rec(G,id), U=r.citeUsed&&typeof r.citeUsed==='object'?r.citeUsed:{};
    for(const b of P.beats){ if(!b||!b.cite||typeof b.cite!=='object') continue;
      for(const mem of Object.keys(b.cite)){ const a=r.ans[mem]; if(!a) continue; const d=typeof a==='object'&&typeof a.day==='number'?a.day:null; if(d!=null&&G.day-d<S.CITE_DAYS) continue;
        const Lc=Array.isArray(b.cite[mem])?b.cite[mem]:[], n=U[mem]|0; if(n>=Lc.length) continue; return {cite:mem,n,beat:b.n,tier:3,lines:[Lc[n]]}; } }
    return null; };
  /* 這一次的中途說哪一則：{rot:編號, tier, lines}；null＝沒有（沒有稿；或沒條件那一層輪到活動自己的輪換句，ctx.alt）*/
  S.rotPick=function(G,id,ctx){ ctx=ctx||{}; const L=R().rot[id]; if(!G) return null; if(!L||!L.length) return S.citePick(G,id); const r=S.rec(G,id), used=Array.isArray(r.rot)?r.rot:[];
    const C=L.map((x,i)=>({x,i,t:S.rotTier(G,id,x)})).filter(c=>c.t>=0);
    const top=C.length?Math.max(...C.map(c=>c.t)):-1;
    if(top<2&&typeof ARCINV!=='undefined'&&ARCINV.np){ const np=ARCINV.np(G,id); if(np) return {np:np.key,tier:1,lines:np.lines}; }   /* 故事線約她、沒排成（AA_716 noPlan）：說一次；when 那幾句還是優先 */
    { const ci=S.citePick(G,id); if(ci) return ci; }   /* 她記得你說過的（AA_712 cite_later）：比輪換句優先（when 也是）；noPlan 照舊在前面 */
    if(!C.length) return null;
    const out=c=>({rot:c.i,tier:c.t,lines:S.altIntern(G,id,c.x)||(c.x.alt&&S.ifOk(G,id,c.x.alt.if)?c.x.alt.lines:c.x.lines)});
    for(let t=top;t>=0;t--){ const fresh=C.filter(c=>c.t===t&&!used.includes(c.i)); if(!fresh.length) continue;
      if(t===0&&ctx.alt&&r.rotSrc==='arc') return null;   /* 沒條件那一層：上次用了這一份，這次輪活動自己的 */
      return out(fresh[0]); }
    if(ctx.alt&&r.rotSrc==='arc') return null;   /* 能說的都在最近 3 次裡：活動自己有輪換句就先輪那邊 */
    return out(C.slice().sort((a,b)=>used.indexOf(a.i)-used.indexOf(b.i))[0]); };   /* 都用過：最久以前用過的 */
  S.rotDone=function(G,id,x){ const r=S.rec(G,id); if(x&&x.cite){ const U=r.citeUsed&&typeof r.citeUsed==='object'?r.citeUsed:(r.citeUsed={}); U[x.cite]=Math.max(U[x.cite]|0,(x.n|0)+1); r.citeDay=G.day; r.rotSrc='arc'; return r; }
    if(x&&x.np){ if(typeof ARCINV!=='undefined'&&ARCINV.npDone) ARCINV.npDone(G,x.np); r.rotSrc='arc'; return r; } if(x&&x.rot!=null){ const u=(Array.isArray(r.rot)?r.rot:[]).filter(i=>i!==x.rot); u.push(x.rot); r.rot=u.slice(-3); r.rotSrc='arc'; } else r.rotSrc='act'; return r; };
  S.rotRun=async function(GM,who,id,x){ await play(GM,who,x.lines); S.rotDone(GM.G,id,x); };
  /* 一起的活動演這一拍（INV.meet 呼叫）：演完才記；中途出錯照丟，沒記＝下次重演 */
  S.run=async function(GM,who,id,b){ const k=await S.play(GM,who,id,b); S.done(GM.G,id,b,k); if(typeof DECIDE!=='undefined'&&DECIDE.due){ const x=DECIDE.due(GM.G,id); if(x) await DECIDE.playDue(GM,who,id,x); } return k; };   /* 決定拍 delay 0 有 say：演完馬上說 */
  return S;
})();
