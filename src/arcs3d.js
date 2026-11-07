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
   測試：node tests/heroine_arcs_unit.js */
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
  S.cond=(G,c)=>{ if(!c) return true; if(c.indexOf('flag:')===0){ const v=F(G)[c.slice(5)]; return v!=null&&v!==false; } const f=S.COND[c]; return f?!!f(G):false; };
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
    for(let guard=0;guard<10&&r.k<=T.beats.length;guard++){ const b=T.beats[r.k-1]; if(!b) return null;
      const until=b.until?S.dayOf(b.until):null; if(until!=null&&G.day>until){ if(b.late==='skip'||!b.late){ if(!r.missed.includes(b.n)) r.missed.push(b.n); r.k+=1; continue; } }   /* 過了 until：跳過，接著看下一拍 */
      if(stage(id)<(b.need|0)) return null;
      const from=b.from?S.dayOf(b.from):null; if(from!=null&&G.day<from) return null;
      if(b.after&&!S.cond(G,b.after)) return null;
      if(b.where&&b.where!=='any'&&ctx.kind&&b.where!==ctx.kind) return null;
      if(b.quietOk===false&&ctx.quiet) return null;
      return S.resolve(G,id,b); }
    return null; };
  S.resolve=function(G,id,b){ const o=Object.assign({},b); delete o.alt; if(b.alt&&S.cond(G,b.alt.cond)){ if(b.alt.lines) o.lines=b.alt.lines; if(b.alt.ask) o.ask=b.alt.ask; }
    o.opts=b.opts.map(q=>{ if(q.tell&&q.toldAlt&&S.told(G,q.tell,id)){ const A=typeof q.toldAlt==='string'?{t:q.toldAlt}:q.toldAlt; return Object.assign({},q,A,{told:true}); } return q; });
    return o; };
  S.text=(G,t)=>String(t).replace(/\{name\}/g,(G&&G.name)||'祐廷');
  const play=async(GM,who,lines)=>{ for(const t of lines||[]){ const s=S.text(GM.G,t); if(/^（/.test(s)) await GM.say(null,s); else await GM.say(who,s); } };
  /* 演一拍：回傳選了哪一個 */
  S.play=async function(GM,who,id,b){ const G=GM.G; await play(GM,who,b.lines); await play(GM,who,b.ask);
    const k=GM.choose?await GM.choose(b.opts.map(o=>({t:S.text(G,o.t)}))):0; const o=b.opts[k]||b.opts[0];
    if(typeof SOCIAL!=='undefined'&&SOCIAL.adjust&&o.rel&&Object.keys(o.rel).length){ const d=Object.assign({},o.rel); if(stage(id)<3) delete d.npcRom; SOCIAL.adjust(id,d); }   /* 她的戀愛只在朋友以上才算（和送東西、念書選項一樣）*/
    await play(GM,who,o.reply); return k; };
  /* 演完：下一拍、今天演過、記答案和講過的事、旗標、邀約 */
  S.done=function(G,id,b,k){ const r=S.rec(G,id), f=F(G), o=b.opts[k]||b.opts[0]; r.k=Math.max(r.k,b.n+1); r.last=G.day;
    if(o.mem) r.ans[o.mem]={opt:k,day:G.day};
    if(o.tell){ const T=f.YT_TOLD||(f.YT_TOLD={}), t=T[o.tell]||(T[o.tell]={}); if(t[id]==null) t[id]=G.day; }
    if(b.set&&f[b.set]==null) f[b.set]=G.day;
    if(b.invite){ const I=f.ARC_INVITE||(f.ARC_INVITE={}), m=I[id]||(I[id]={}); if(m[b.n]==null) m[b.n]=G.day; }
    return r; };
  /* 一起的活動演這一拍（INV.meet 呼叫）：演完才記；中途出錯照丟，沒記＝下次重演 */
  S.run=async function(GM,who,id,b){ const k=await S.play(GM,who,id,b); S.done(GM.G,id,b,k); return k; };
  return S;
})();
