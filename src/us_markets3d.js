/* ===== 美國兩間超市買東西（US-MARKETS-BUY-1112；SHOP-STANDARD-BACKFILL-1112 草原超市 us_market、竹葉亞洲超市 us_asian_market 的「買得到／錢不夠／字」）=====
   字：src/data/us_markets_buy.js（US_MARKETS_BUY；tools/story/import_us_markets.py 從 AA_850 匯入，企劃線 b039356f5，AA 定稿、BB_397 聽過）——品名、標價、店員的話、旁白一字照稿，這支不寫任何台詞。
     每個貨架「看」的字沿用 src/data/us_life_events.js 現有的那一句（AA_287；USL.lookFor）。
   稿上沒有的系統字（S.SYS；回報給 AA）：選單「不用了」「結帳」「要」、提示「推車：…　共 $…」、說話的人的名字（S.WHO：收銀員、店員、阿姨——都是稿的旁白裡出現的稱呼）。
   做法（稿 _meta.flow：推車到結帳才付）：
   - 貨架（S.shelf）＝「看」那一句旁白 →（熟食櫃台：抽號碼牌、店員 Half or whole?；日用品：輪到你買衛生紙那一句，這個月買過就不說）→ 這個貨架的東西「品名　$美金」＋「不用了」
       → 選了＝放進推車（還沒扣錢；一樣一趟最多一份、拿過的不再列，和汀州路雜貨店 GG3.groceryShelf 一樣）。沒有東西賣的點（推車、飲料、罐頭、烘焙、個人用品走道）照舊只有「看」。
   - 推車只記這一趟進店（區域＋GM.enterN；不進存檔）：沒結帳就走出去、讀檔＝東西沒了（稿沒寫離店怎麼辦，照汀州路雜貨店「手上的東西」的做法）。
   - 結帳（S.pay）：推車是空的＝只有「看」的字（草原超市多稿的 cart_empty 那一句）。有東西：
       草原超市「結帳」＝收銀員 checkout_greet →「結帳」（提示：東西、共 $美金（幾元））／「不用了」→ 扣錢 → checkout_bag →「要」（$0.10＝3 元）／「不用了」→ checkout_done。
       草原超市「自助結帳」＝旁白 self_checkout（一半的機會多 self_checkout_help）→ 同一個選單 → 扣錢。
       竹葉亞洲超市「結帳櫃台」＝那天第一次：阿姨 greet（去過三天以上 USL_ASIA_N>=3＝greet_regular）→ 同一個選單 → 扣錢 → 阿姨 checkout_done。
     錢不夠：草原超市＝旁白 no_money（「把最貴的那一樣……請她先拿掉」）、推車裡最貴的那一樣拿掉；剩下的付得起就付剩下的，還是不夠＝這次不付（東西留在推車，再按一次再拿掉一樣）。
             竹葉＝阿姨 no_money（「先拿水餃，其他下次。」）：推車裡有水餃而且付得起＝只買水餃，其他放回去；沒有水餃或連水餃都不夠＝什麼都不買、推車清空。
     錢：畫面標美金；實際扣遊戲裡的錢（資料檔的 p＝美金 × 32 四捨五入，一樣一樣算）。時間 +20 分鐘（和原本「買一樣東西」一樣）。
   - 買回去的東西：eat＝帶回公寓吃掉（遊戲沒有體力、飽足，和其他吃的一樣只有扣錢、時間）；own＝進選單「物品」（G.flags.GG3_OWN[區域][id]，GG3.ownAdd／GG3.OWN_X）；
       gift（鳳梨酥、烏龍茶、月餅）＝放進「包包裡的禮物」（GIFTH 的包包；稿：照 AA_732 的規則算一般禮物——節日、生日當面送，反應是一般的 ok 那一格）。
       做法：開遊戲的時候把這三樣登記進 GIFT_HOLIDAY.items（名字、價錢照稿；love／no 都空＝ok）、店 GIFT_HOLIDAY.shops.us_asian_market（items 空的＝那一套的「買禮物…」不會在這裡出現）。
       包包滿了（10 樣）＝貨架上拿不了禮物（GIFTH 現有的那一句提示）。
   - 季節：火雞胸只有 11 月；月餅 9/15～中秋那一天（CALENDAR.fest），放在竹葉的結帳櫃台——按結帳櫃台先演稿的 mooncake 那一句（一趟一次）、問要不要拿一顆。
   - 沙茶醬只有一罐：拿了＝旁白 satay_last；買了以後 14 天內醬料那一格「看」的字換成 satay_gone、不賣（G.flags.USM_SATAY＝買的那一天）。
   - 多帶一顆月餅給學姊（稿 notes）：人在美國、包包裡有月餅、當面和學姊說話＝多一個「送她月餅」（STORY.TALK_OPTS）→ 她那一句（lines.mooncake_give）、月餅從包包拿掉、好感照一般禮物 ok；只出一次（G.flags.USM_MOON_GIVEN）。
   - 竹葉週日公休：關著的時候按店門多一句稿的 closed_sunday 旁白（開放時間的提示照舊）。
   這支包在 STORY.interact 最外面，只接這兩區有 usMarket 的互動點（US1 抵達那晚是劇情帶進去的，不經過互動點）；原本 us_life3d.js 的「買一樣東西／只看看」（S.shop）這兩區不再走到。
   存檔只多 G.flags 的 USM_SATAY、USM_TP（買衛生紙的年月）、USM_GREET（阿姨今天招呼過）、USM_MOON_GIVEN，買的東西記在現有的 GG3_OWN、GIFTH.bag；舊存檔沒有＝都還沒發生，不用遷移。
   測試：node tests/us_markets_buy_unit.js；地點關卡 node tests/place_gate_unit.js */
'use strict';
const USMKT=(function(){
  const S={};
  const X=()=>typeof US_MARKETS_BUY!=='undefined'?US_MARKETS_BUY:null;
  S.ZONES=['us_market','us_asian_market'];
  S.WHO={us_market:'收銀員',deli:'店員',us_asian_market:'阿姨'};   /* 稿的旁白裡的稱呼（「拿給收銀員」「店員走過來」「阿姨抬頭看了你一眼」）*/
  S.SYS={no:'不用了',pay:'結帳',bag:'要',cart:'推車：',total:'　共 '};
  S.PAY={us_market:{checkout:'clerk',self_checkout:'self'},us_asian_market:{asia_checkout:'asia'}};   /* 哪一個互動點是結帳 */
  S.HRS=1/3;   /* 結帳一次 +20 分鐘（原本 us_life3d.js S.shop「買一樣東西」的時間）*/
  S.BAG_USD=0.10; S.SATAY_DAYS=14; S.REGULAR=3;
  S.ID={satay:'usa_satay',dumpling:'usa_dumpling',mooncake:'usa_mooncake',turkey:'usm_turkey',tp:'usm_tp'};
  S.rand=()=>Math.random();
  const shop=z=>{ const d=X(); return d&&d.shops?d.shops[z]||null:null; };
  const F_=G=>G.flags||(G.flags={});
  const W=w=>w?{name:w}:null;
  const ymd=day=>{ try{ return typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(day):null; }catch(e){ return null; } };
  const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  S.usd=v=>'$'+(Math.round(v*100)/100).toFixed(2);
  S.twd=usd=>Math.round(usd*((X()&&X().rate)||32));
  /* 短的品名（「月餅（一顆，九月中到中秋）」→「月餅」）：只用在「送她○○」那個選項 */
  S.short=n=>String(n).replace(/（[^）]*）$/,'');

  /* ---------- 推車：只記這一趟進店（區域＋GM.enterN）；不進存檔。走出去、讀檔＝沒有了 ---------- */
  let cart=null;   /* null＝沒有推車 */
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['us_markets3d:cart']=()=>{ cart=null; };
  S.cart=function(GM){ const k=GM.G.zone, n=GM.enterN|0; if(!cart||cart.k!==k||cart.n!==n) cart={k,n,ids:[],moon:false}; return cart; };
  S.cartGoods=function(GM){ const T=shop(GM.G.zone), C=S.cart(GM); return T?C.ids.map(id=>T.goods.find(g=>g.id===id)).filter(Boolean):[]; };
  const sumUsd=gs=>gs.reduce((a,g)=>a+Math.round(g.usd*100),0)/100, sumP=gs=>gs.reduce((a,g)=>a+g.p,0);
  S.cartHint=gs=>gs.map(g=>g.n).join('、')+S.SYS.total+S.usd(sumUsd(gs));
  S.payHint=gs=>S.cartHint(gs)+'（'+sumP(gs)+' 元）';

  /* ---------- 季節、只有一罐 ---------- */
  S.moonDay=function(y){ const c=S._moon||(S._moon={}); if(y in c) return c[y]; let r=null; const a=DK(y+'-09-01');
    if(a!=null&&typeof CALENDAR!=='undefined'&&CALENDAR.fest) for(let d=a;d<a+50;d++){ try{ if(CALENDAR.fest(d)==='中秋'){ r=d; break; } }catch(e){ break; } }
    return c[y]=r; };
  S.mooncakeOn=function(G){ const x=ymd(G.day); if(!x) return false; const a=DK(x.y+'-09-15'), b=S.moonDay(x.y); return a!=null&&b!=null&&G.day>=a&&G.day<=b; };   /* 9/15～中秋那一天 */
  S.satayGone=function(G){ const d=(G.flags||{}).USM_SATAY; return typeof d==='number'&&G.day>=d&&G.day-d<S.SATAY_DAYS; };   /* 買了以後兩週補貨 */
  S.tpKey=G=>{ const x=ymd(G.day); return x?x.y*100+x.m:null; };
  S.sells=function(G,g){ if(g.id===S.ID.turkey){ const x=ymd(G.day); return !!x&&x.m===11; } if(g.id===S.ID.mooncake) return S.mooncakeOn(G); if(g.id===S.ID.satay) return !S.satayGone(G); return true; };
  S.goodsAt=function(G,z,at){ const T=shop(z); return T?T.goods.filter(g=>g.at===at&&S.sells(G,g)):[]; };
  S.hasShelf=(z,at)=>{ const T=shop(z); return !!T&&T.goods.some(g=>g.at===at); };

  /* ---------- 「看」的字（沿用 us_life_events.js；沙茶醬買走以後那一格換稿的 satay_gone）---------- */
  S.look=function(G,it){ const z=G.zone, T=shop(z); if(z==='us_asian_market'&&it.usMarket==='asia_sauce'&&T&&S.satayGone(G)) return T.lines.satay_gone;
    let t=null; try{ if(typeof USL!=='undefined'&&USL.lookFor) t=USL.lookFor(G,it); }catch(e){ t=null; } return t||null; };

  /* ---------- 禮物（鳳梨酥、烏龍茶、月餅）：登記進節日送禮那一套的包包（AA_732 一般禮物）---------- */
  S.giftReg=function(){ const H=typeof GIFT_HOLIDAY!=='undefined'?GIFT_HOLIDAY:null, d=X(); if(!H||!H.items||!H.shops||!d) return 0; let n=0;
    for(const z of S.ZONES){ const T=shop(z); if(!T) continue; const gs=T.goods.filter(g=>g.kind==='gift'); if(!gs.length) continue;
      if(!H.shops[z]) H.shops[z]={name:T.name,items:[]};
      for(const g of gs) if(!H.items[g.id]){ H.items[g.id]={name:g.n,price:g.p,line:'',love:[],no:[],shop:z}; n++; } }
    return n; };
  S.giftReg();
  const giftOn=()=>typeof GIFTH!=='undefined'&&!!GIFTH.rec&&!!GIFTH.item&&!!GIFTH.item(S.ID.mooncake);
  S.bagRoom=function(GM){ if(!giftOn()) return 99; return GIFTH.MAX-GIFTH.bag(GM.G).length-S.cartGoods(GM).filter(g=>g.kind==='gift').length; };
  /* 拿一樣放進推車（禮物：包包放不下＝拿不了）*/
  S.take=async function(GM,g){ const C=S.cart(GM), T=shop(GM.G.zone);
    if(g.kind==='gift'&&S.bagRoom(GM)<=0){ if(GM.toast) GM.toast('包包已經放了 '+GIFTH.MAX+' 樣了'); return false; }   /* gifthol3d.js 現有的那一句 */
    C.ids.push(g.id); if(g.id===S.ID.satay) await GM.say(null,T.lines.satay_last); return true; };

  /* ---------- 貨架 ---------- */
  S.shelf=async function(GM,it){ const G=GM.G, z=G.zone, T=shop(z), at=it.usMarket, t=S.look(G,it); const C=S.cart(GM);
    const left=()=>S.goodsAt(G,z,at).filter(g=>!C.ids.includes(g.id));
    if(!left().length){ if(t&&GM.caption) GM.caption('',t,4600); return t||null; }   /* 沒有東西可以拿（不賣東西的點、這一趟都拿了、沙茶醬賣完）＝只有看 */
    const took=[]; GM.sceneBegin();
    try{ if(t) await GM.say(null,t);
      if(z==='us_market'&&at==='deli'){ await GM.say(null,T.lines.deli_number); await GM.say(W(S.WHO.deli),T.lines.deli_staff); }
      if(z==='us_market'&&at==='aisle_household'&&F_(G).USM_TP!==S.tpKey(G)) await GM.say(null,T.lines.tp_roommate);   /* 這個月買過衛生紙就不說 */
      for(;;){ const its=left(); if(!its.length) break; const gs=S.cartGoods(GM), no={t:S.SYS.no}; if(gs.length) no.hint=S.SYS.cart+S.cartHint(gs);
        const c=await GM.choose(its.map(g=>({t:g.n+'　'+S.usd(g.usd)})).concat([no])); if(!(c>=0&&c<its.length)) break;
        if(await S.take(GM,its[c])) took.push(its[c].n); else break; } }
    finally{ GM.sceneEnd(); }
    return took.length?took.join('、'):(t||null); };

  /* ---------- 結帳 ---------- */
  S.give=function(G,z,g){ const F=F_(G);
    if(g.kind==='own'){ if(typeof GG3!=='undefined'&&GG3.ownAdd) GG3.ownAdd(G,z,g.id); }
    else if(g.kind==='gift'){ if(giftOn()) GIFTH.rec(G).bag.push({id:g.id,day:G.day,shop:z}); else if(typeof GG3!=='undefined'&&GG3.ownAdd) GG3.ownAdd(G,z,g.id); }
    if(g.id===S.ID.satay) F.USM_SATAY=G.day; if(g.id===S.ID.tp) F.USM_TP=S.tpKey(G); };
  S.pay=async function(GM,it,mode){ const G=GM.G, z=G.zone, T=shop(z), L=T.lines, C=S.cart(GM), F=F_(G);
    if(mode==='asia'&&!C.moon&&!C.ids.includes(S.ID.mooncake)&&S.goodsAt(G,z,it.usMarket).some(g=>g.id===S.ID.mooncake)){ C.moon=true;   /* 櫃台上的月餅（一趟問一次）*/
      const g=T.goods.find(q=>q.id===S.ID.mooncake); GM.sceneBegin();
      try{ await GM.say(null,L.mooncake); const c=await GM.choose([{t:g.n+'　'+S.usd(g.usd)},{t:S.SYS.no}]); if(c===0) await S.take(GM,g); } finally { GM.sceneEnd(); } }
    let gs=S.cartGoods(GM);
    if(!gs.length){ const t=S.look(G,it); if(L.cart_empty){ GM.sceneBegin(); try{ if(t) await GM.say(null,t); await GM.say(null,L.cart_empty); } finally { GM.sceneEnd(); } } else if(t&&GM.caption) GM.caption('',t,4600); return 'empty'; }
    const B=W(S.WHO[z]); let r=null; GM.sceneBegin();
    try{
      if(mode==='clerk') await GM.say(B,L.checkout_greet);
      else if(mode==='self'){ await GM.say(null,L.self_checkout); if(S.rand()<0.5) await GM.say(null,L.self_checkout_help); }
      else if(F.USM_GREET!==G.day){ F.USM_GREET=G.day; await GM.say(B,(F.USL_ASIA_N|0)>=S.REGULAR?L.greet_regular:L.greet); }
      const c=await GM.choose([{t:S.SYS.pay,hint:S.payHint(gs),dim:(G.money|0)<sumP(gs)},{t:S.SYS.no}]);
      if(c!==0) return null;   /* 不用了：東西還在推車裡 */
      if((G.money|0)<sumP(gs)){
        if(mode==='asia'){ await GM.say(B,L.no_money); const d=gs.find(g=>g.id===S.ID.dumpling); C.ids.length=0; if(!d||(G.money|0)<d.p) return 'short'; gs=[d]; }   /* 先拿水餃，其他下次 */
        else { await GM.say(null,L.no_money); const top=gs.reduce((a,g)=>g.p>a.p?g:a,gs[0]); C.ids.splice(C.ids.indexOf(top.id),1); gs=S.cartGoods(GM); if(!gs.length||(G.money|0)<sumP(gs)) return 'short'; } }   /* 最貴的那一樣先拿掉 */
      const total=sumP(gs); GM.money(-total,T.name); if(GM.advance) GM.advance(S.HRS); for(const g of gs) S.give(G,z,g); C.ids.length=0; S.last={zone:z,day:G.day,items:gs.map(g=>g.id),total};
      if(mode==='clerk'){ await GM.say(B,L.checkout_bag); const p=S.twd(S.BAG_USD), k=await GM.choose([{t:S.SYS.bag,hint:S.usd(S.BAG_USD)},{t:S.SYS.no}]); if(k===0&&(G.money|0)>=p) GM.money(-p,T.name); await GM.say(B,L.checkout_done); }
      else if(mode==='asia') await GM.say(B,L.checkout_done);
      r=gs.map(g=>g.n).join('、'); }
    finally{ GM.sceneEnd(); }
    if(r&&GM.autosave) GM.autosave(); return r; };

  /* ---------- 互動（包在 STORY.interact 最外面）---------- */
  S.handles=(G,it)=>!!it&&!!G&&S.ZONES.includes(G.zone)&&!!it.usMarket&&!it.exit&&!!shop(G.zone);
  S.interact=async function(it,GM){ const G=GM.G, z=G.zone, mode=(S.PAY[z]||{})[it.usMarket];
    if(mode){ await S.pay(GM,it,mode); return true; }
    if(S.hasShelf(z,it.usMarket)){ await S.shelf(GM,it); return true; }
    { const t=S.look(G,it); if(t&&GM.caption){ GM.caption('',t,4600); return true; } }   /* 不賣東西的點（推車、飲料、罐頭、烘焙、個人用品走道）＝只有「看」那一句 */
    return false; };
  /* 竹葉週日公休：關著的時候按店門多一句稿的旁白（開放時間的提示照舊由 us_life3d.js 出）*/
  S.sundayDoor=function(it,GM){ const G=GM&&GM.G, T=shop('us_asian_market'); if(!it||!G||!T||!it.exit||it.exit.to!=='us_asian_market'||G.weekday!==0) return false;
    if(typeof PLACES==='undefined'||!PLACES.isOpen||PLACES.isOpen('us_asian_market',(((+G.hour||0)%24)+24)%24,G.day)) return false; if(GM.caption) GM.caption('',T.lines.closed_sunday,4600); return true; };
  if(typeof STORY!=='undefined'&&STORY.interact&&!STORY._usmktInteract){ const o0=STORY.interact;
    STORY.interact=async function(it,GM){ const G=GM&&GM.G; if(S.handles(G,it)&&await S.interact(it,GM)) return true; try{ S.sundayDoor(it,GM); }catch(e){ console.warn('USMKT.sundayDoor',e); } return o0.apply(this,arguments); };
    STORY._usmktInteract=true; }

  /* ---------- 「物品」：own 的東西列在 GG3 的那一格 ---------- */
  if(typeof GG3!=='undefined'&&Array.isArray(GG3.OWN_X)&&X()) for(const z of S.ZONES){ const T=shop(z); if(T&&!GG3.OWN_X.some(q=>q.zone===z)) GG3.OWN_X.push({zone:z,name:T.name,goods:T.goods.filter(g=>g.kind!=='eat').map(g=>({id:g.id,n:g.n}))}); }

  /* ---------- 多帶一顆月餅給學姊（稿 notes：她在美國的那個學期、當面遇到她，只出一次）---------- */
  S.SIS='heroine_05';
  S.moonGiveOn=function(G,id){ const f=G&&G.flags; if(id!==S.SIS||!f||!giftOn()||f.USM_MOON_GIVEN!=null) return false; if(typeof USL!=='undefined'&&USL.here&&!USL.here(G)) return false;
    const B=f.GIFTH&&f.GIFTH.bag; return Array.isArray(B)&&B.some(b=>b&&b.id===S.ID.mooncake); };   /* 只讀（不替舊存檔補欄位）*/
  S.moonGive=async function(GM,who){ const G=GM.G, R=GIFTH.rec(G), k=R.bag.findIndex(b=>b&&b.id===S.ID.mooncake), T=shop('us_asian_market'); if(k<0||!T) return false;
    R.bag.splice(k,1); F_(G).USM_MOON_GIVEN=G.day; (R.given[S.SIS]||(R.given[S.SIS]=[])).push(S.ID.mooncake);
    await GM.say(who||(GIFTH.who?GIFTH.who(S.SIS):null),T.lines.mooncake_give); if(GIFTH.adjust) GIFTH.adjust(G,S.SIS,'ok'); if(GM.autosave) GM.autosave(); return true; };
  S.talkOpts=function(G,id){ if(!S.moonGiveOn(G,id)) return []; const g=shop('us_asian_market').goods.find(q=>q.id===S.ID.mooncake); return [{t:'送她'+S.short(g.n),run:async(GM,who)=>{ await S.moonGive(GM,who); }}]; };
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.TALK_OPTS)&&!STORY._usmktTalk){ STORY.TALK_OPTS.push((G,id)=>S.talkOpts(G,id)); STORY._usmktTalk=true; }
  return S;
})();
if(typeof module!=='undefined') module.exports=USMKT;
