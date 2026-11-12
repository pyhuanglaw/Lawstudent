/* ===== 夜市十攤＋背景三攤的「看」「買」（NIGHT-MARKET-1110，使用者 X326；LAWWW 2026-11-10）=====
   字：src/data/night_market.js（NIGHT_MARKET，AA_752 匯入：tools/story/import_night_market.py）——店名、品名、價錢、旁白、老闆的話一字照稿，這裡不寫任何台詞。
   模型、位置、區域：src/tingzhou3d.js（zone.tzStalls 汀州路十攤、zone.ggStalls 公館人行道三攤；每一攤 id、kind、isOpen）＋配置 src/data/tingzhou_layout.js 的 stalls。
   這支做的：
   1 哪一攤是稿上的哪一攤：S.KIND（配置的 kind → 稿的 s01～s10、b12～b14；店名兩邊一樣，測試會比）。
   2 每一攤前面（客人那一面）一個互動點「看＋店名」：
     營業中的十攤＝今天第一次先念 look（s10 夏天、冬天多一句）→ 老闆隨機一句 greet（問句不等回答）→ 選單「品名　價錢 元」（錢不夠變灰）＋「算了」→ 買了扣錢、演那一樣的 buy；
     收攤＝closed 一句；背景三攤（套圈圈、手機殼、襪子）只有 look／closed。
     buy 的句子整句是（…）的＝旁白（沒有名字），其他＝老闆說的。老闆沒有名字（稿的 rules）：說話人寫「老闆」，s10 寫「阿婆」（稿的旁白這樣叫她）。
   3 營業時間以稿的 hours 為準（AA 的 hoursNote；和配置原本的 from／to 不一樣的照稿）：S.sync 把稿的 open（s10 夏天 openSummer）寫進配置的 kinds[kind].from／to，
     模型的開收（TZ3.stallOpen → isOpen）和能不能買看的是同一個 isOpen；背景三攤稿上沒有時間，照配置。
   4 套圈圈只有週五、六、日擺（配置 kinds.ring.days）：其他天 zone.tzStallOff[id]＝true（模型是收攤的樣子、按下去是 closed）。颱風假 zone.tzStallsClosed（汀州路 story3d.js 照舊；公館三攤這裡照同一個 CALENDAR.typhoon 設）。
   5 吃的效果：遊戲沒有體力、飽足的數值（DL-02 體力拿掉了），買吃的＝扣錢、時間過 5 分鐘（S.HRS，和溫州街水果攤、路邊買東西一樣）、演 buy；不記進存檔（今天看過哪一攤只記在記憶體）。
   測試：node tests/night_market_unit.js */
const NM3=(function(){
  const S={};
  const D=()=>typeof NIGHT_MARKET!=='undefined'?NIGHT_MARKET:null;
  const LAY=()=>typeof TINGZHOU_LAYOUT!=='undefined'?TINGZHOU_LAYOUT:null;
  const GMof=()=>typeof GAME!=='undefined'?GAME:null;
  S.KIND={milk:'s01',pepper:'s02',wheelcake:'s03',ball:'s04',scallion:'s05',stinky:'s06',corn:'s07',eggcake:'s08',cane:'s09',jelly:'s10',ring:'b12',phonecase:'b13',socks:'b14'};
  S.HRS=5/60;            // 買一樣東西時間過多久
  S.OWNER={name:'老闆'}; S.OWNER_X={s10:{name:'阿婆'}};
  S.rand=()=>Math.random();
  S._seen={}; S._prev={};   // 今天念過 look 的攤、上一次的 greet（只在記憶體，不進存檔）
  S.stallOf=kind=>{ const d=D(), k=S.KIND[kind]; return d&&k?(d.stalls[k]||null):null; };
  S.bgOf=kind=>{ const d=D(), k=S.KIND[kind]; return d&&k?(d.background[k]||null):null; };
  S.owner=key=>S.OWNER_X[key]||S.OWNER;
  S.month=G=>{ try{ if(G&&typeof CALENDAR!=='undefined'&&CALENDAR.dateOf) return CALENDAR.dateOf(G.day).m; }catch(e){} return null; };
  S.wd=G=>{ if(!G) return null; try{ if(typeof CALENDAR!=='undefined'&&CALENDAR.dateOf){ const w=CALENDAR.dateOf(G.day).wd; if(typeof w==='number') return ((w%7)+7)%7; } }catch(e){} return typeof G.weekday==='number'?G.weekday:null; };
  S.season=m=>{ const d=D(); if(!d||m==null) return null; return d.season.summer.includes(m)?'summer':(d.season.winter.includes(m)?'winter':null); };
  /* 稿的營業時間（鐘點）；s10 夏天另外一組 */
  S.hoursOf=function(key,m){ const d=D(), st=d&&d.stalls[key]; if(!st) return null; return st.openSummer&&S.season(m)==='summer'?st.openSummer:st.open; };
  S.lookLines=function(key,m){ const st=D().stalls[key], sn=S.season(m), x=sn==='summer'?st.lookSummer:(sn==='winter'?st.lookWinter:null); return st.look.concat(x?[x]:[]); };
  S.greetPool=function(key,m){ const st=D().stalls[key], sn=S.season(m), x=sn==='summer'?st.greetSummer:(sn==='winter'?st.greetWinter:null); return st.greet.concat(x||[]); };
  S.isNarr=t=>{ if(typeof t!=='string'||t[0]!=='（') return false; let dep=0; for(let i=0;i<t.length;i++){ const c=t[i]; if(c==='（') dep++; else if(c==='）'){ dep--; if(dep===0) return i===t.length-1; } } return false; };
  /* 稿的時間寫進配置（模型的開收照這個）；回傳改了哪幾個 kind */
  S.syncHours=function(G,L){ L=L||LAY(); const ST=L&&L.stalls, out=[]; if(!ST||!ST.kinds||!D()) return out; const m=S.month(G);
    for(const kind in S.KIND){ const K=ST.kinds[kind], h=S.hoursOf(S.KIND[kind],m); if(!K||!h) continue; if(K.from!==h.from||K.to!==h.to){ K.from=h.from; K.to=h.to; out.push(kind); } }
    return out; };
  /* 今天不擺的攤（配置 kinds[kind].days＝星期幾才擺，0＝星期日）*/
  S.offOf=function(G,L,list){ L=L||LAY(); const ST=L&&L.stalls, off={}, w=S.wd(G); if(!ST||w==null) return off;
    for(const q of list||[]){ const K=ST.kinds&&ST.kinds[q.kind]; if(K&&Array.isArray(K.days)&&!K.days.includes(w)) off[q.id]=true; } return off; };
  S.listOf=zone=>(zone&&(zone.tzStalls||[]).concat(zone.ggStalls||[]))||[];
  S.sync=function(zone,G,L){ S.syncHours(G,L); if(!zone||!G) return; zone.tzStallOff=S.offOf(G,L,S.listOf(zone));
    if(zone.ggStalls&&typeof CALENDAR!=='undefined'&&CALENDAR.typhoon){ try{ zone.tzStallsClosed=!!CALENDAR.typhoon(G.day); }catch(e){} } };   /* 颱風假：公館這三攤也不擺（汀州路那一邊 story3d.js 進區域的時候設）*/
  /* 這一攤現在開著嗎：先照今天的日期、星期對好，再讓區域照現在的鐘點切一次（模型和 isOpen 一起換）*/
  S.openNow=function(GM,zone,q){ const G=GM.G; S.sync(zone,G);
    if(zone&&zone.applyTimeOutdoor){ try{ zone.applyTimeOutdoor((((+G.hour||0)%24)+24)%24,null);   /* 不傳引擎：只切攤位，不動燈光（引擎自己每次重算）*/ }catch(e){ console.warn('NM3.openNow',e); } }
    return !!q.isOpen; };

  S.menu=function(G,st){ return st.items.map(it=>({t:it.name+'　'+it.price+' 元',dim:(G.money|0)<it.price})).concat([{t:'算了'}]); };
  S.interact=async function(GM,zone,q){ const G=GM.G, key=S.KIND[q.kind], d=D(); if(!d||!key) return null;
    const open=S.openNow(GM,zone,q), bg=d.background[key];
    if(bg){ await GM.say(null,open?bg.look:bg.closed); return open?'look':'closed'; }
    const st=d.stalls[key]; if(!st) return null;
    if(!open){ await GM.say(null,st.closed); return 'closed'; }
    const m=S.month(G); return S.serve(GM,q.id,st,S.owner(key),()=>S.lookLines(key,m),S.greetPool(key,m)); };
  /* 營業中的一攤（夜市十攤、季節攤販 src/season_stalls3d.js 共用）：今天第一次先念 looks()，greets 有句子就說一句，再出選單、買。greets 空的（沒有攤販）＝不說 */
  S.serve=async function(GM,id,st,who,looks,greets){ const G=GM.G; if(GM.sceneBegin) GM.sceneBegin();
    try{
      if(S._seen[id]!==G.day){ S._seen[id]=G.day; for(const t of looks()) await GM.say(null,t); }
      if(greets.length){ const P=greets, pool=P.map((t,i)=>i).filter(i=>P.length<2||i!==S._prev[id]), i=pool[Math.min(pool.length-1,Math.floor(S.rand()*pool.length))]; S._prev[id]=i; await GM.say(who,P[i]); }
      const mo=S.menu(G,st), gO=typeof GIFT!=='undefined'&&GIFT.shopOpt?GIFT.shopOpt(G,st.name):null; if(gO) mo.push(gO);   /* 買一份帶走送人（GIFT-ALL-DRINK-SHOPS-1112，src/gift3d.js GIFT.SHOPS）：放在最後，原本的選項位置不動 */
      const i=await GM.choose(mo); if(gO&&i===st.items.length+1){ await GIFT.buy(GM,st.name); return 'gift'; } if(i==null||i<0||i>=st.items.length) return 'no';
      const it=st.items[i]; if((G.money|0)<it.price){ if(GM.toast) GM.toast('錢不夠'); return 'poor'; }
      GM.money(-it.price); if(GM.advance) GM.advance(S.HRS);
      for(const t of it.buy) await GM.say(S.isNarr(t)?null:who,t);
      if(GM.autosave) GM.autosave(); return it.id;
    } finally { if(GM.sceneEnd) GM.sceneEnd(); } };

  /* 互動點站在攤子前面（客人那一面）：從攤體前緣往外找第一個站得住的格子 */
  S.spot=function(nav,q,L){ const b=(typeof TZ3!=='undefined'&&TZ3.stallBlock)?TZ3.stallBlock(q,L):{d:1.5,back:0.25}, sn=Math.sin(q.yaw), c=Math.cos(q.yaw), e=b.d/2-b.back;
    const free=(x,z)=>{ if(!nav||!nav.b) return true; const cx=Math.floor((x-nav.ox)/nav.cell), cz=Math.floor((z-nav.oz)/nav.cell); return cx>=0&&cz>=0&&cx<nav.cols&&cz<nav.rows&&!nav.b[nav.idx(cx,cz)]; };
    let first=null; for(const dd of [0.55,0.75,0.95,1.2]){ const p={x:q.x+sn*(e+dd),z:q.z+c*(e+dd)}; if(!first) first=p; if(free(p.x,p.z)) return p; } return first; };
  S.label=function(q){ const st=S.stallOf(q.kind), bg=S.bgOf(q.kind); return st?'看'+st.name:(bg?'看'+bg.sign:null); };
  S.addPoints=function(E,zone,list,L){ let n=0; if(!E||!zone||!D()) return n;
    for(const q of list||[]){ const label=S.label(q); if(!label) continue; const p=S.spot(zone.nav,q,L);
      E.interactables.push({x:p.x,z:p.z,radius:1.2,label,nmStall:q.id,nmKind:q.kind,onInteract:()=>{ const GM=GMof(); return GM?S.interact(GM,zone,q):null; }}); n++; }
    return n; };
  /* 區域建好以後：加互動點；每次照時間切換以前先對日期（s10 夏天的時間、套圈圈星期幾）*/
  S.attach=function(E,zone,list){ if(!zone||zone._nm||!D()) return zone; zone._nm=true; const L=LAY(); S.addPoints(E,zone,list,L);
    const t0=zone.applyTimeOutdoor; if(t0) zone.applyTimeOutdoor=function(h,E2){ const GM=GMof(), G=GM&&GM.G; if(G) S.sync(zone,G,L); return t0.call(this,h,E2); };
    return zone; };
  S.hook=function(){ if(typeof Z3==='undefined'||!Z3.ZONES||!D()) return false; let n=0;
    for(const [id,key] of [['tingzhou','tzStalls'],['gongguan','ggStalls']]){ const zd=Z3.ZONES[id]; if(!zd||zd._nm) continue; const b0=zd.build;
      zd.build=function(E){ const z=b0.call(this,E); try{ S.attach(E,z,z&&z[key]); }catch(e){ console.warn('NM3.attach',id,e); } return z; }; zd._nm=true; n++; }
    return n>0; };
  S.syncHours(null); S.hook();
  return S;
})();
