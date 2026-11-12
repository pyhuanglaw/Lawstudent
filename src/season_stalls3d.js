/* ===== 季節攤販六攤的「看」「買」＋季節落地布置的「看」（SEASON3-LINES-1111；2026-11-12）=====
   字：src/data/season_stalls.js（SEASON_STALLS，AA_793 匯入：tools/story/import_season_stalls.py）——名字、品名、價錢、旁白、攤販的話一字照稿，這裡不寫任何台詞。
   位置、哪一天擺：src/data/season_deco.js（stalls 的 key／at、looks 的 id）＋src/season_deco3d.js（SD3：進區域那一刻決定，今天擺的攤記在 z.seasonStalls、今天有的布置記在 z.seasonLooks）。
   這支做的：
   1 今天擺出來的攤（z.seasonStalls）才有互動點：客人站的位置（at），按鈕＝夜市的寫法「看＋稿的 name」（NM3.label 同一個做法；D147 不取店名）。
     流程用夜市那一套（NM3.serve：今天第一次先念 look → 攤販一句 greet → 選單「品名　價錢 元」＋「算了」→ 扣錢、時間過 5 分鐘、演 buy）；
     sea_textbook（noVendor，沒有攤販）greet 是空的＝不說，直接出選單。現在的鐘點不在稿的 hours 裡＝closed 一句。
   2 說話人：夜市的做法是「老闆沒有名字，寫『老闆』；s10 寫『阿婆』（稿的旁白這樣叫她）」。這裡照同一個做法：稿的旁白怎麼叫就怎麼寫（S.VENDOR，字都是稿上的），稿上沒有稱呼的（畢業花束只有「她」）用夜市的「老闆」。
   3 落地布置的「看」：z.seasonLooks 裡稿上有字的，放互動點（按鈕＝season_deco.js 原本寫好的 label），按了念稿的那一句；
     sea_fruit 再念今天那一箱水果的那一句（照 season_deco.js 今天顯示的是哪一組 FRUIT…：S.FRUIT；冬天那一組是椪柑和草莓，兩句都念）。
   不記進存檔（今天看過哪一攤只記在記憶體，和夜市同一份 NM3._seen）。
   測試：node tests/season3_lines_1112_unit.js */
const SS3=(function(){
  const S={};
  const D=()=>typeof SEASON_STALLS!=='undefined'?SEASON_STALLS:null;
  const DECO=()=>typeof SEASON_DECO!=='undefined'?SEASON_DECO:null;
  const NM=()=>typeof NM3!=='undefined'?NM3:null;
  const GMof=()=>typeof GAME!=='undefined'?GAME:null;
  S.VENDOR={sea_yam:{name:'阿伯'},sea_aiyu:{name:'阿姨'},sea_mooncake:{name:'店員'},sea_textbook:{name:'店員'}};   /* 稿的旁白裡的稱呼；沒有列的＝NM3.OWNER */
  S.FRUIT={FRUITSPRING:['loquat'],FRUITSUMMER:['mango'],FRUITAUTUMN:['pomelo'],FRUITWINTER:['ponkan','strawberry']};   /* season_deco.js 的那一組 → 稿 looksFruit 的哪幾句 */
  S.who=key=>S.VENDOR[key]||NM().OWNER;
  S.stallOf=key=>{ const d=D(); return d&&d.stalls[key]||null; };
  S.label=key=>{ const st=S.stallOf(key); return st?'看'+st.name:null; };
  S.openNow=function(G,st){ const h=(((+G.hour||0)%24)+24)%24; return h>=st.open.from&&h<st.open.to; };
  S.shown=(zone,q)=>!!zone&&Array.isArray(zone.seasonStalls)&&zone.seasonStalls.indexOf(q)>=0;
  S.interact=async function(GM,zone,q){ const st=S.stallOf(q.key), nm=NM(); if(!st||!nm||!S.shown(zone,q)) return null;
    if(!S.openNow(GM.G,st)){ await GM.say(null,st.closed); return 'closed'; }
    return nm.serve(GM,q.key,st,S.who(q.key),()=>st.look,st.greet); };
  S.lookLines=function(q){ const d=D(), t=d&&d.looks[q.id]; if(!t) return []; const out=[t]; if(q.id==='sea_fruit') for(const f of (S.FRUIT[q.code]||[])) if(d.looksFruit[f]) out.push(d.looksFruit[f]); return out; };
  S.look=async function(GM,zone,q){ if(!zone||!Array.isArray(zone.seasonLooks)||zone.seasonLooks.indexOf(q)<0) return null; const L=S.lookLines(q); for(const t of L) await GM.say(null,t); return L.length?'look':null; };
  /* 區域建好（SD3.attach 之後）：今天擺的攤、今天有的布置加互動點 */
  S.attach=function(E,zone){ if(!E||!Array.isArray(E.interactables)||!zone||zone._ss3||!D()||!NM()) return 0; zone._ss3=true; let n=0;
    for(const q of zone.seasonStalls||[]){ const label=S.label(q.key); if(!label||!q.at) continue;
      E.interactables.push({x:q.at.x,z:q.at.z,radius:q.at.r||1.0,label,seasonStall:q.key,onInteract:()=>{ const GM=GMof(); return GM?S.interact(GM,zone,q):null; }}); n++; }
    for(const q of zone.seasonLooks||[]){ if(!S.lookLines(q).length) continue; const on=()=>{ const GM=GMof(); return GM?S.look(GM,zone,q):null; };
      const it=E.interactables.find(i=>i.seasonLook===q.id&&i.x===q.x&&i.z===q.z);   /* SD3 已經放了（hidden 拿掉以後）＝只接上按了以後的事 */
      if(it){ if(!it.onInteract) it.onInteract=on; } else E.interactables.push({x:q.x,z:q.z,radius:q.r||1.0,label:q.label,seasonLook:q.id,onInteract:on});
      n++; }
    return n; };
  S.hook=function(){ const d=DECO(); if(!d||!D()||typeof Z3==='undefined'||!Z3.ZONES) return 0; let n=0;
    for(const zid of Object.keys(d.zones)){ const zd=Z3.ZONES[zid]; if(!zd||zd._ss3) continue; const b0=zd.build;
      zd.build=function(E){ const z=b0.call(this,E); try{ S.attach(E,z); }catch(e){ console.warn('SS3.attach',zid,e); } return z; }; zd._ss3=true; n++; }
    return n; };
  S.hook();
  return S;
})();
if(typeof window!=='undefined') window.SS3=SS3;
