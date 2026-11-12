/* ===== 花序 Flower Notes 的買花、花藝師、營業時間、各區的「看」（FLOWER-NOTES-1110，USER_WANTS X325）=====
   字：AA_792（企劃線 8475a3b85）——src/data/flower_notes_text.js（FLOWER_NOTES_TEXT：staff、looks）和 src/data/gift_holiday.js（shops.gg_flower 十樣商品），
     都是 tools/gift/import_gift_holiday.py 產生的。這裡不寫句子；按鈕的字用原本就有的（配置的「看永生花」那幾個、其他店配置用的「看看」、送禮系統的「買禮物…」那一套）。
   店面：區域 flower_notes（src/flower_notes3d.js；配置 src/data/flower_notes_layout.js）。
   - 買花：一樓收銀櫃檯前（kind gg_flower）＝花藝師一句 greet（三句輪流）→ 送禮系統原本的買禮物清單（GIFTH.buy：十樣、價錢、說明、錢不夠灰掉、包包 10 樣滿）
       → 付了錢、放進包包 → 那一樣的 buy 句子（花藝師；（）開頭的是旁白）→ GIFTH 原本的「你買了…，放進包包。」。不扣時段。
       新的八樣（g_fn_*）love、no 是空的＝送出去照對方的 ok 那一格（GIFTH.cat），不另外寫反應（X325）。
   - 營業時間：稿的 staff.hours（10:00～21:00）登記成 PLACES.hours.flower_notes（每天、店家；稿沒寫公休、颱風天＝不關）。
       沒開：公館 G11 門口「進入花序」不進去，演 staff.closed（門外看到的），再照其他店寫開放時間（PLACES.closedText）。
       人還在店裡到了打烊：照 AA_700（src/xs_close3d.js）花藝師「我們今天要打烊了。」、走到公館門口（XSCLOSE.ZONES.flower_notes）。
   - 「看」：稿的 looks 13 個 key＝配置的 kind。配置原本有位置的五個（永生花、鮮花花束、冷藏花櫃、黑板、示範桌）照配置的位置和按鈕；
       其他八個（兩個展示台、櫃檯、包裝紙牆、樓梯口的牌子、花器層架、矮櫃、大盆植物）的位置在這裡（S.EXTRA，站在那樣東西旁邊），按鈕「看看」。
       配置的「看中央展示台」稿沒有句子＝不放。二樓只有看和坐（稿：這一版沒有上課的流程）。
   存檔：沒有新欄位（買的東西照舊在 G.flags.GIFTH.bag）。測試：node tests/flower_notes_aa792_1112_unit.js、node tests/flower_notes_unit.js */
'use strict';
const FNS=(function(){
  const S={};
  const X=()=>typeof FLOWER_NOTES_TEXT!=='undefined'?FLOWER_NOTES_TEXT:null;
  const LAY=()=>typeof FLOWER_NOTES_LAYOUT!=='undefined'?FLOWER_NOTES_LAYOUT:null;
  const PL=()=>typeof PLACES!=='undefined'?PLACES:null;
  S.ZONE='flower_notes'; S.SHOP='gg_flower';
  S.on=()=>!!X()&&typeof GIFTH!=='undefined'&&GIFTH.on();
  const WHO=()=>({name:X().staff.who});

  /* ---------- 營業時間（稿的 staff.hours → PLACES.hours；原本就有的那一套）---------- */
  S.hours=function(){ const m=X()&&/^(\d\d):(\d\d)～(\d\d):(\d\d)$/.exec(X().staff.hours||''); return m?[+m[1]+m[2]/60,+m[3]+m[4]/60]:null; };
  S.register=function(){ const P=PL(), w=S.hours(); if(!P||!P.hours||!w) return false;
    if(!P.hours[S.ZONE]) P.hours[S.ZONE]={shop:true,rules:{week:[0,1,2,3,4,5,6].map(()=>w.slice())},text:'每天 '+P.hhmm(w[0])+'–'+P.hhmm(w[1])};   /* 寫法同青木茶室（每天、沒有公休）*/
    if(P.names&&!P.names[S.ZONE]&&LAY()) P.names[S.ZONE]=LAY().name;
    if(typeof XSCLOSE!=='undefined'&&XSCLOSE.ZONES&&!XSCLOSE.ZONES[S.ZONE]) XSCLOSE.ZONES[S.ZONE]={place:S.ZONE,who:X().staff.who,to:'gongguan'};   /* AA_700：打烊人還在店裡 */
    return true; };
  S.open=function(G){ const P=PL(), w=S.hours(); if(!G||!w) return true; const h=(((+G.hour)||0)%24+24)%24;
    if(P&&P.isOpen&&P.hours&&P.hours[S.ZONE]) return P.isOpen(S.ZONE,h,G.day); return h>=w[0]-1e-6&&h<w[1]-1e-6; };

  /* ---------- 公館門口：沒開 ---------- */
  S.door=async function(GM){ const G=GM.G, P=PL(), txt=P&&P.closedText&&P.hours&&P.hours[S.ZONE]?P.closedText(S.ZONE,G.hour,G.day):'';
    GM.sceneBegin(); try{ await GM.say(null,X().staff.closed); } finally { GM.sceneEnd(); }
    if(txt&&GM.toast) GM.toast(txt,4500); return 'closed'; };

  /* ---------- 收銀櫃檯：買花 ---------- */
  let greetN=0, busy=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['flower_notes_sys3d:busy']=()=>{ busy=false; };   /* 讀檔時放開 */
  S.greet=function(){ const L=X().staff.greet; return L[(greetN++)%L.length]; };
  S._reset=()=>{ greetN=0; busy=false; };
  S.counter=async function(GM){ const G=GM.G; if(busy) return true; if(!S.open(G)) return true;   /* 打烊了人還在櫃檯前：不賣，XSCLOSE 下一拍請你出去 */
    const o=GIFTH.shopOpt(G,S.SHOP); if(!o) return false;
    busy=true; GM.sceneBegin(); try{ await GM.say(WHO(),S.greet());
      if(o.dim){ GM.toast&&GM.toast(o.hint); return true; }   /* 包包滿了（GIFTH.pick 的那一句）*/
      await GIFTH.buy(GM,S.SHOP,{bought:gid=>GIFTH.play(GM,WHO(),X().staff.buy[gid])});
    } finally { busy=false; GM.sceneEnd(); } return true; };

  /* ---------- 各區的「看」 ---------- */
  S.LOOK_LABEL='看看';   /* 其他店配置用的那個按鈕（新生運動廣場、好拍、大步）*/
  S.LAYOUT_KIND={preserved:'preserved_shelf',bouquet:'bouquet_stand',cold:'cold_case',blackboard:'blackboard',demo:'demo_table'};   /* 配置 looks 的 id → 稿的 key（配置的 kind）*/
  /* 配置沒有排位置的八個：站在那樣東西旁邊（走得到：tests/flower_notes_unit.js 4b）。收銀櫃檯的「看」在配置的 counter.wrapAt（包裝那一頭），買花在 buyAt */
  S.EXTRA=[{kind:'plinth_dome',lv:0,x:-3.5,z:5.5,r:0.75},{kind:'plinth_giftbox',lv:0,x:-3.5,z:6.35,r:0.75},{kind:'wrap_shelf',lv:0,x:2.45,z:5.7,r:0.65},
    {kind:'stair_sign',lv:0,x:2.9,z:1.9,r:0.7},{kind:'plant_big',lv:0,x:2.1,z:6.4,r:0.8},
    {kind:'vase_shelf',lv:1,x:-3.3,z:-6.0,r:0.8},{kind:'low_cabinet',lv:1,x:-3.9,z:-3.4,r:0.8},{kind:'plant_big',lv:1,x:-3.8,z:-0.4,r:0.8}];
  S.lookPoints=function(L){ L=L||LAY(); const T=X()&&X().looks, out=[]; if(!L||!T) return out;
    for(const q of L.looks||[]){ const k=S.LAYOUT_KIND[q.id]; if(k&&T[k]) out.push({kind:k,lv:q.lv|0,x:q.x,z:q.z,r:q.r,label:q.label}); }
    const C=L.counter; if(C&&C.wrapAt&&T.counter) out.push({kind:'counter',lv:0,x:C.wrapAt.x,z:C.wrapAt.z,r:0.65,label:S.LOOK_LABEL});
    for(const q of S.EXTRA) if(T[q.kind]) out.push(Object.assign({label:S.LOOK_LABEL},q));
    return out; };
  /* 包住區域的 build：互動點加上去（look＝稿的那一句；game3d.js 原本的「看」會顯示）*/
  S.hookZone=function(){ if(typeof Z3==='undefined'||!Z3.ZONES||!Z3.ZONES[S.ZONE]||Z3.ZONES[S.ZONE]._fns||!X()) return false; const zd=Z3.ZONES[S.ZONE], b0=zd.build;
    zd.build=function(E){ const z=b0.call(this,E), T=X().looks; for(const q of S.lookPoints()) E.interactables.push({x:q.x,z:q.z,radius:q.r,lv:q.lv,label:q.label,look:T[q.kind],fnLook:q.kind}); return z; };
    zd._fns=true; return true; };

  /* ---------- 掛上去 ---------- */
  if(X()){ S.register(); S.hookZone(); }
  if(X()&&typeof STORY!=='undefined'&&STORY.interact&&!STORY._fns){ STORY._fns=true; const oi=STORY.interact;
    STORY.interact=async function(it,GM){ const G=GM&&GM.G;
      if(it&&G&&S.on()){ if(it.fnDoor&&!S.open(G)) return S.door(GM);
        if(it.kind===S.SHOP&&G.zone===S.ZONE){ const r=await S.counter(GM); if(r) return true; } }
      return oi.apply(this,arguments); }; }
  return S;
})();
