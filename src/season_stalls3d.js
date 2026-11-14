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
  S.VENDOR={sea_yam:{name:'阿伯'},sea_aiyu:{name:'阿姨'},sea_mooncake:{name:'店員'},sea_textbook:{name:'店員'},sea_bouquet:{name:'老闆娘'}};   /* AA_793 lawww_1112 ①：畢業花束那一攤是女的 */   /* 稿的旁白裡的稱呼；沒有列的＝NM3.OWNER */
  S.FRUIT={FRUITSPRING:['loquat'],FRUITSUMMER:['mango'],FRUITAUTUMN:['pomelo'],FRUITWINTER:['ponkan','strawberry']};   /* season_deco.js 的那一組 → 稿 looksFruit 的哪幾句 */
  S.who=key=>S.VENDOR[key]||NM().OWNER;
  S.stallOf=key=>{ const d=D(); return d&&d.stalls[key]||null; };
  S.label=key=>{ const st=S.stallOf(key); return st?'看'+st.name:null; };
  S.openNow=function(G,st){ const h=(((+G.hour||0)%24)+24)%24; return h>=st.open.from&&h<st.open.to; };
  S.shown=(zone,q)=>!!zone&&Array.isArray(zone.seasonStalls)&&zone.seasonStalls.indexOf(q)>=0;
  S.interact=async function(GM,zone,q){ const st=S.stallOf(q.key), nm=NM(); if(!st||!nm||!S.shown(zone,q)) return null;
    if(!S.openNow(GM.G,st)){ await GM.say(null,st.closed); return 'closed'; }
    return nm.serve(GM,q.key,st,S.who(q.key),()=>st.look,st.greet); };
  S.rnd=()=>Math.random();
  S.LOOK_SEASON={FNSPRING:'spring',FNMAY:'may',FNJUNE:'summer',FNXMAS:'winter'};   /* 花序門口花台的季節代號（season_deco.js）→ 稿的 key */
  S.lookLines=function(q){ const d=D(); let t=d&&d.looks[q.id]; if(t&&typeof t==='object') t=t[S.LOOK_SEASON[q.code]]||t.spring;   /* 照現在擺的那一季只出一句（AA_793@58c5c2c1bb；沒有對到的用 spring）*/ if(!t) return []; if(q.id==='sea_fruit'){ const fr=(S.FRUIT[q.code]||[]).map(f=>d.looksFruit[f]).filter(Boolean); if(fr.length) return [fr[Math.floor(S.rnd()*fr.length)]]; }   /* AA_793 lawww_1112 ③：只演當季水果那一句（冬天兩種隨機一句）；沒有當季句才演通用句 */ return [t]; };
  S.look=async function(GM,zone,q){ if(!zone||!Array.isArray(zone.seasonLooks)||zone.seasonLooks.indexOf(q)<0) return null; const L=S.lookLines(q); for(const t of L) await GM.say(null,t); return L.length?'look':null; };
  /* 區域建好（SD3.attach 之後）：今天擺的攤、今天有的布置加互動點 */
  S.attach=function(E,zone,zid){ if(!E||!Array.isArray(E.interactables)||!zone||zone._ss3||!D()||!NM()) return 0; zone._ss3=true; let n=0;
    for(const q of zone.seasonStalls||[]){ const label=S.label(q.key); if(!label||!q.at) continue;
      E.interactables.push({x:q.at.x,z:q.at.z,radius:q.at.r||1.0,label,seasonStall:q.key,onInteract:()=>{ const GM=GMof(); return GM?S.interact(GM,zone,q):null; }}); n++; }
    for(const q of zone.seasonLooks||[]){ if(!S.lookLines(q).length) continue; const on=()=>{ const GM=GMof(); return GM?S.look(GM,zone,q):null; };
      const it=E.interactables.find(i=>i.seasonLook===q.id&&i.x===q.x&&i.z===q.z);   /* SD3 已經放了（hidden 拿掉以後）＝只接上按了以後的事 */
      if(it){ if(!it.onInteract) it.onInteract=on; } else E.interactables.push({x:q.x,z:q.z,radius:q.r||1.0,label:q.label,seasonLook:q.id,onInteract:on});
      n++; }
    /* 花序門口的花：四段季節布置以外的日子也有「看門口的花」，念稿的 plain 那一句（AA_793@3cb2939d0；位置、按鈕字照 season_deco.js 那一筆）*/
    { const P=S.plainLook(zone,zid); if(P){ E.interactables.push({x:P.x,z:P.z,radius:P.r||1.0,label:P.label,seasonLook:P.id,plain:true,onInteract:async()=>{ const GM=GMof(); if(!GM) return null; await GM.say(null,P.text); return 'look'; }}); n++; } }
    return n; };
  S.PLAIN_ID='flower_notes_season';   /* plainLook 要知道現在是哪一區（attach 的第三個參數＝S.hook 包 build 時的區域 id）：區域 build 回傳的 z 沒有 id，原本「沒有 id 就放行」讓溫州街也在 (44,20.8) 房子裡放一顆按不到的「看門口的花」（REL76_reach，BB 2026-11-14）；不知道是哪一區就不放 */
  S.plainLook=function(zone,zid0){ const here=zid0||(zone&&zone.id); const d=D(), t=d&&d.looks[S.PLAIN_ID], text=t&&typeof t==='object'?t.plain:null; if(!text||!zone) return null; if((zone.seasonLooks||[]).some(q=>q.id===S.PLAIN_ID)) return null;
    const dc=DECO(); if(!dc||!dc.zones) return null; for(const zid in dc.zones){ const L=dc.zones[zid].looks||{}; for(const c in L){ const q=(L[c]||[]).find(x=>x.id===S.PLAIN_ID); if(q){ if(!here||here!==zid) return null; return {id:q.id,x:q.x,z:q.z,r:q.r,label:q.label,text}; } } } return null; };
  S.hook=function(){ const d=DECO(); if(!d||!D()||typeof Z3==='undefined'||!Z3.ZONES) return 0; let n=0;
    for(const zid of Object.keys(d.zones)){ const zd=Z3.ZONES[zid]; if(!zd||zd._ss3) continue; const b0=zd.build;
      zd.build=function(E){ const z=b0.call(this,E); try{ S.attach(E,z,zid); }catch(e){ console.warn('SS3.attach',zid,e); } return z; }; zd._ss3=true; n++; }
    return n; };
  S.hook();
  return S;
})();
if(typeof window!=='undefined') window.SS3=SS3;
