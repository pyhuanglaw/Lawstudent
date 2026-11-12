/* 118 巷課後午餐邀約（L118-LUNCH-INVITE-1111，使用者 2026-11-11 規格 docs/handoff/user_specs/L118_LUNCH_1111.md，USER_WANTS X339）。
   上午在法律系館上完課，同堂、認識的同學有機會當面約去 118 巷吃午餐：發起的人選店、玩家只選去不去；各付各的、不占行動格、吃完加熟悉度。
   **這個檔沒有任何台詞**：邀約、選項、午餐對話、偶遇、到店／吃完的旁白、錢不夠、快速略過那一行都讀 src/data/l118_lunch.js（L118_LUNCH_DATA；
   tools/story/import_l118_lunch.py 從 AA 的稿產生，格式在那支工具的檔頭）。資料檔不在、或沒有句子（S.dataOk）＝整個系統不開，不用假的句子。
   不取代現有功能：店門口點餐、常客、阿哲週一手機揪午餐（src/lane118.js）照舊；九間店的資料不動（店、菜單、營業時間都讀 LANE118_SHOPS）。

   ---- 什麼時候判（S.afterClass；classes3d.js 的 CLS.afterMenu 一開頭叫，＝課後事件演完、下課選單出來以前）----
   十二點前後下課（下課時間落在資料檔 window 11:30～12:30；十點下課的不算，AA_771 v2 規則）、在法律系館A／B 上的課（S.lawAm：教室那一棟 rm.via／zone 是 linze、wancai——和 classes3d.js destOf 算路程用的同一欄；
   共同、普通、博思、體育館、服務學習、校外實習不算）、那一堂上過了（遲到記缺席、聽後半堂的也算）、不是期末考那一堂、法律系那幾年（經濟系那一年不邀）。
   那一堂下課演了課後劇情（afterClass 事件）＝這一天不邀（S.CFG.skipAfterEvent：剛演完一段劇情，不接一句制式的邀約）。
   每天只判一次（G.l118.inv.day）：不管有沒有中都記；亂數是「G.day＋固定的鹽」算出來的（S.rnd），同一天存讀檔、重進結果一樣。
   阿哲週一手機揪午餐那天已經答應（G.flags.L118_LUNCH／L118_PICK 是今天）＝不當面邀；他今天傳過訊息（還沒回、回了不行）＝其他人照常判定，阿哲自己不再當面約、也不同行。

   ---- 怎麼判（S.plan，不改存檔，測試直接叫）----
   1 有資格的人（S.eligible）：資料檔 who 有、同堂（S.inClass：STORY.schedEnt 在那一堂快下課時回的那一筆是這一堂——法律系同屆的必修照 STORY.classmateClass，
     宥辰沒來的早上、人在國外、約了別人的都自然不算）、認識（STORY.knows）、這學期在學校（STORY.present）。
   2 機率：最熟的那個人的級距（S.tier＝SOCIAL.stage：ACQUAINTANCE 1、FAMILIAR 2、FRIEND 3、CLOSE_FRIEND 以上 4；認識了但還不到 ACQUAINTANCE 算 1）→ 20／40／65／80%。
   3 發起人：有邀約句子、有開著的店、那間店有他自己一個人就能演的午餐對話的人裡加權抽：級距權重 1／2／3／4 × 資料檔 who.weight × 連續婉拒倍率（0、1 次 1；2 次 0.75；3 次 0.5；4 次以上 0.25——不會是 0）。
   4 店：發起人的 prefs 照權重抽，到店時間（下課後 10 分鐘）沒開的不算（＝沒開照權重換下一間）；一一八茶飲不當午餐、慢讀咖啡只有以安會選（S.RULES）。
     店名、菜單、價錢、營業時間都是當下從 LANE118_SHOPS 讀的（店重新設計、重匯以後不用改這裡）；prefs 寫了資料沒有的店、被標成不當午餐的店（S.lunchShop）＝跳過。
     存檔記的是店 id＋品名（L118.rec 的 last）：品名後來不在菜單上＝當作沒點過。
   5 時間：從那間店出發去下一件固定的事（下一堂課的出門時間 CLS.goPlan、已接受的邀約／出遊／有時限的劇情 CLS.skipStops、補考 CLS.hardItems）以前要吃得完：
     走過去 10 分鐘＋至少吃 20 分鐘，不夠＝不邀。吃 30 分鐘，最晚到下一件事的出門時間。不呼叫 slotUse（不占行動格）。
   6 同行：其他有資格的人加權抽 0～2 位（人數權重 S.CFG.mateN）；柏翰、沛珊大二上不同桌（S.RULES.apart）。
   7 玩家吃什麼（S.meal）：上次在這間店點的（還在菜單、買得起）→ 否則最便宜的主餐。菜單沒有「主餐」的欄位：價錢不到菜單第一樣一半的算配菜、加點，不算一餐；
     手搖飲、咖啡店一律菜單第一樣。買不起＝錢不夠（不能去，不扣錢、不算婉拒）。
   8 對話：lunch 裡 who 的人都在這一桌、店對得上、n（含玩家的人數）對得上的組，沒演過的先（人多的組先），都演過＝最久沒演的。
   9 特殊（兩成）：條件成立（S.specialOk／S.whenOk；不認得的條件＝不播）、沒看過的先；看過的隔 30 天才會再出現。talk＝對話之後多一段；meet＝到店以後、對話以前遇到
     （when.at 是 leave 的＝吃完走出去才遇到）。遇到的人要認識、在臺北、那個時間不是在上課／打工（S.meetFree），同一天演過他的 AA_311 H 事件不抽（S.RULES.hWho）。

   ---- 怎麼演（S.run）----
   發起人一句（教室裡他的 3D 人物在就用，不在＝只有名字）→ 選項（字都從資料）：接受／快速略過（資料有 options.skip、看過至少一次普通午餐、這次不是還沒看過的 first 特殊）／婉拒。
   婉拒＝他一句、他的連續婉拒 +1、不加不扣；接受（或略過）＝他的連續婉拒歸零。錢不夠＝旁白 → 選項換成 noMoney.player → 他回一句，不算婉拒。
   接受：淡出 → 走進那間店（3D：GM.enter l118_<id>，黑幕裡玩家和同行的人坐同一桌 S.seatParty；店的區域不在＝深色底的 2D 演）→ 到店旁白 →（偶遇）→ 午餐對話 →（多講一件）→
   結算 → 吃完旁白 → 站起來，同行的人自己走出去（story3d.js 的 until）。人留在那間店裡：接著照常出下課選單（「直接去下一堂」會算從 118 巷走回去的路程）；
   今天吃過了，下課選單不再出「先去吃飯，再去下一堂」（classes3d.js）。
   快速略過：不換場景，時間照樣過（含走回來），結算同一支，顯示 skipLine。

   ---- 結算（S.settle，一次、同步做完）----
   先記 inv.done＝今天（已經記過＝不做第二次），再：扣玩家自己那一份（GM.money 一次）、L118.visit（熟客次數、上次點的）、L118.ate（和誰一起吃的次數）、
   EAT（吃過的；完整演出＝EAT.ordered 含那間店第一次的旁白，略過＝只記）、熟悉度：同行每人 +2、特殊的 bonus（沒寫＝who 每人 +1）——只加熟悉（SOCIAL.adjust fam），
   交往中的也不加戀愛；每人每週（學期週）從午餐最多 +6（inv.wk）。和現有的比：日常「一起吃飯」SOCIAL.activity meal＝熟悉 +3、信任 +1、自在 +3（一天一次）。

   ---- 存檔：G.l118.inv（舊存檔沒有＝從空的開始，L118.rec 的其他欄位不動）----
   { day:上次判定的那一天, hit:那天有沒有邀, done:午餐結算的那一天, n:吃過幾次, seen:完整看過幾次, decl:{人:連續婉拒次數}, dn:{人:一共婉拒幾次（回的那一句輪著用）},
     lg:{lunch 組 id:上次演的那一天}, sp:{special id:上次演的那一天}, wk:{人:{w:'學期:週', pts:這一週午餐加了多少}} }
   測試：node tests/l118_lunch_unit.js（假資料只在測試裡，句子是「〔測試〕…」）*/
'use strict';
const LUNCH118=(function(){
  const S={};
  let busy=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['l118_lunch3d:busy']=()=>{ busy=false; };
  S.CFG={ window:{from:11.5,to:12.5}, lawBld:['linze','wancai'],
    prob:{1:0.20,2:0.40,3:0.65,4:0.80}, weight:{1:1,2:2,3:3,4:4}, declMul:[1,1,0.75,0.5,0.25], mateN:[0.45,0.35,0.2],
    walkH:10/60, eatH:30/60, minEatH:20/60,
    pts:2, talkPts:1, meetPts:1, weekCap:6, specialP:0.2, spRepeatDays:30, talkReplaces:false, skipAfterEvent:true,
    sideRatio:0.5, firstItemTypes:['手搖飲','咖啡'], meetBusy:['class','barista','ta','club','help','follow','wait'] };
  /* AA_771 _meta.rules（文字）照這裡做；稿的規則改了匯入工具會停下來（RULES_KNOWN）。noLunch、onlyFor 是預設值：資料檔有 shopRules 就用資料檔的（S.shopRules）*/
  S.RULES={ noLunch:['tea'], onlyFor:{cafe2:['heroine_01']}, apart:[{ids:['classmate_bohan','classmate_peishan'],terms:['Y2S1']}], zhe:'zhe',
    hWho:{H1:['heroine_05'],H2:['classmate_peishan'],H3:['heroine_01'],H4:['zhe'],H5b:['zhe','yu'],H6:['classmate_bohan'],H7a:['classmate_xinci'],H7c:['classmate_xinci'],H8:['heroine_03']} };
  const TERMS=['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'];
  const D=()=>typeof L118_LUNCH_DATA!=='undefined'&&L118_LUNCH_DATA&&typeof L118_LUNCH_DATA==='object'?L118_LUNCH_DATA:null;
  const hr=G=>(((+G.hour||0)%24)+24)%24;
  const atHour=(G,h)=>Object.assign({},G,{hour:Math.floor((+G.hour||0)/24)*24+h});
  const term=G=>{ const T=typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(G.day):null; return T&&T.week>=1?T:null; };
  const CH=id=>typeof CHARACTERS!=='undefined'&&CHARACTERS?CHARACTERS[id]:null;
  const dn=id=>typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(id):id;
  const knows=(G,id)=>typeof STORY!=='undefined'&&STORY.knows?!!STORY.knows(id,G):(typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(id,'FIRST_MET'));
  const present=(G,id)=>typeof STORY==='undefined'||!STORY.present||!!STORY.present(id,G);
  const reachable=(G,id)=>typeof STORY==='undefined'||!STORY.reachable?present(G,id):!!STORY.reachable(id,G);
  /* 資料夠不夠開：兩個選項的字、至少一個人有邀約的句子、至少一組午餐對話 */
  S.dataOk=function(){ const d=D(); return !!(d&&d.options&&d.options.accept&&d.options.decline&&d.who&&d.invite&&Array.isArray(d.lunch)&&d.lunch.some(g=>g&&Array.isArray(g.lines)&&g.lines.length)
    &&Object.keys(d.invite).some(id=>d.who[id]&&d.invite[id]&&Array.isArray(d.invite[id].lines)&&d.invite[id].lines.length)); };
  S.on=G=>!!G&&(G.stage||'law')==='law'&&typeof L118!=='undefined'&&typeof CLS!=='undefined'&&S.dataOk();
  S.rec=function(G){ const R=L118.rec(G); let I=R.inv; if(!I||typeof I!=='object'||Array.isArray(I)) I=R.inv={}; for(const k of ['decl','dn','lg','sp','wk']) if(!I[k]||typeof I[k]!=='object'||Array.isArray(I[k])) I[k]={}; if(typeof I.seen!=='number') I.seen=0; if(typeof I.n!=='number') I.n=0; return I; };
  S.doneToday=G=>{ const I=G&&G.l118&&G.l118.inv; return !!I&&typeof I==='object'&&I.done===G.day; };
  /* 決定性亂數：只看哪一天＋用途（鹽），0 ≤ r < 1。不用 Math.random：同一天存讀檔、重進不會重抽 */
  function h32(s){ let h=2166136261>>>0; for(let i=0;i<s.length;i++){ h^=s.charCodeAt(i); h=Math.imul(h,16777619); } h^=h>>>16; h=Math.imul(h,0x85ebca6b); h^=h>>>13; h=Math.imul(h,0xc2b2ae35); h^=h>>>16; return h>>>0; }
  S.rnd=(G,salt)=>h32('L118-LUNCH|'+Math.trunc(+G.day||0)+'|'+salt)/4294967296;
  const pickW=(list,wOf,r)=>{ const W=list.map(x=>Math.max(0,+wOf(x)||0)), sum=W.reduce((a,b)=>a+b,0); if(!list.length) return null; if(!(sum>0)) return list[Math.min(list.length-1,Math.floor(r*list.length))];
    let t=r*sum; for(let i=0;i<list.length;i++){ t-=W[i]; if(t<0) return list[i]; } return list[list.length-1]; };
  /* 熟悉程度的級距：SOCIAL.STAGES 的序號，1～4（CLOSE_FRIEND 以後的階段都算 4）；raw＝不墊底（條件用）*/
  S.tierRaw=function(id){ if(typeof SOCIAL==='undefined'||!SOCIAL.stage||!SOCIAL.STAGES) return 0; return Math.max(0,Math.min(4,SOCIAL.STAGES.indexOf(SOCIAL.stage(id)))); };
  S.tier=id=>Math.max(1,S.tierRaw(id));
  /* 上午、法律系館的課（不是考試、不是服務學習、不是劇情課）*/
  S.window=()=>{ const d=D(), w=d&&d.window; return w&&typeof w.from==='number'&&typeof w.to==='number'?w:S.CFG.window; };   /* 「十二點前後下課」的時間窗：資料檔的 window（匯入工具補的 11:30～12:30）*/
  S.lawAm=function(G,it){ const W=S.window(); if(!it||!it.c||it.exam||it.c.kind==='service'||!(it.t1>=W.from-1e-6&&it.t1<=W.to+1e-6)) return false; if(typeof CLS!=='undefined'&&CLS.storyClass&&CLS.storyClass(G,it)) return false;
    const rm=it.room||{}; if(rm.offsite) return false; const bld=rm.via||(rm.zone==='classroom'?'linze':rm.zone); return !!bld&&S.CFG.lawBld.includes(bld); };
  /* 同堂：那一堂快下課的時候，他照作息（STORY.schedEnt：同屆必修＝classmateClass、約好的時間、出遊、在不在臺北都算進去了）人在這一堂 */
  S.inClass=function(G,id,it){ const c=CH(id); if(!c||typeof STORY==='undefined'||!STORY.schedEnt) return false; let e=null; try{ e=STORY.schedEnt(c,atHour(G,it.t1-0.05)); }catch(err){ return false; } if(!e) return false;
    if(e.cls!=null) return e.cls===it.key; const rm=it.room||{}; return e.act==='class'&&!!rm.zone&&e.zone===rm.zone&&(e.room==null||rm.room==null||e.room===rm.room); };
  S.eligible=function(G,it){ const d=D(); if(!d) return []; return Object.keys(d.who).filter(id=>CH(id)&&knows(G,id)&&present(G,id)&&S.inClass(G,id,it)); };
  /* 阿哲週一手機揪午餐（lane118.js S.phone／S.tick）：今天答應了；今天傳過訊息 */
  S.zheToday=function(G){ const F=G.flags||{}, L=F.L118_LUNCH; if(L&&L.day===G.day) return true; return typeof F.L118_PICK==='string'&&+F.L118_PICK.split(':')[0]===G.day; };
  S.zhePhoned=G=>typeof PHONE!=='undefined'&&!!PHONE.sent&&!!PHONE.sent(G,'l118_lunch_'+G.day);
  /* 這個人會選、到店那一刻開著的店 */
  /* 能當午餐的店：LANE118_SHOPS 有這間（prefs 寫了資料沒有的 id＝跳過，不報錯）、有菜單、沒被標成不當午餐（店的資料 noLunch／takeout／lunch:false——九間店重新設計以後多的外帶飲料店；S.shopRules().noLunch 的 id）*/
  S.shopRules=function(){ const d=D(), r=d&&d.shopRules; return {noLunch:r&&Array.isArray(r.noLunch)?r.noLunch:S.RULES.noLunch,onlyFor:r&&r.onlyFor&&typeof r.onlyFor==='object'?r.onlyFor:S.RULES.onlyFor}; };   /* 店的規則：資料檔的 shopRules（匯入工具從 _meta.rules 第一條對出來的；九間店重新設計以後重匯就換），沒有＝S.RULES */
  S.lunchShop=function(id){ const s=L118.shop(id); return !!s&&Array.isArray(s.menu)&&s.menu.length>0&&!s.noLunch&&!s.takeout&&s.lunch!==false&&!S.shopRules().noLunch.includes(id); };
  S.shopsOf=function(G,id,gA){ const d=D(), P=(d&&d.who[id]&&d.who[id].prefs)||{}, R=S.shopRules(); return Object.keys(P).filter(s=>+P[s]>0&&S.lunchShop(s)&&(!R.onlyFor[s]||R.onlyFor[s].includes(id))&&L118.isOpen(s,gA)); };
  /* 這一桌、這間店能演的午餐對話 */
  S.groupsFor=function(party,shop){ const d=D(); return ((d&&d.lunch)||[]).filter(g=>g&&g.id&&Array.isArray(g.who)&&g.who.length&&g.who.every(id=>party.includes(id))&&(g.n==null||g.n===party.length+1)&&(!g.shop||g.shop.includes(shop))&&Array.isArray(g.lines)&&g.lines.length); };   /* n＝含玩家的人數要剛好 */
  S.pickGroup=function(G,party,shop){ const L=S.groupsFor(party,shop); if(!L.length) return null; const lg=S.rec(G).lg, key=g=>lg[g.id]==null?[0,-g.who.length]:[1,lg[g.id]];
    return L.map(g=>({g,k:key(g),r:S.rnd(G,'grp:'+g.id)})).sort((a,b)=>a.k[0]-b.k[0]||a.k[1]-b.k[1]||a.r-b.r)[0].g; };
  /* 玩家吃什麼：{item, price, ok（買得起）}；店沒有菜單＝null */
  S.meal=function(G,shopId){ const s=L118.shop(shopId); if(!s||!Array.isArray(s.menu)||!s.menu.length) return null; const C=S.CFG, base=s.menu[0][1], money=G.money|0, first=(typeof L118!=='undefined'&&L118.isDrink?L118.isDrink(shopId):!!s.drink)||C.firstItemTypes.includes(s.type);   /* 飲料店＝點菜單第一樣：照店家資料的 drink（和 lane118.js「飲料 5 分鐘」同一個來源，L118-SHOPS-REDO-1111）；firstItemTypes（照類型的字）留給資料沒有標的舊資料 */
    const mains=first?[s.menu[0]]:s.menu.filter(m=>m[1]>=base*C.sideRatio), R=L118.rec(G), last=R.last[shopId]!=null?R.last[shopId]:(G.eat&&G.eat.last?G.eat.last[s.name]:null);
    const lm=last!=null?(first?s.menu:mains).find(m=>m[0]===last):null, cheap=mains.slice().sort((a,b)=>a[1]-b[1])[0], m=lm&&money>=lm[1]?lm:cheap;
    return {item:m[0],price:m[1],ok:money>=m[1]}; };
  /* 下一件固定的事最早幾點要動身（人在 zoneAt 的話；沒給＝現在的位置）。沒有＝24 */
  S.limit=function(GM,zoneAt){ const G=GM.G, h=hr(G), C=S.CFG, moved=!!zoneAt&&zoneAt!==G.zone, gm=moved?{G:Object.assign({},G,{zone:zoneAt}),E:null,D:GM.D}:GM; let t=24; const add=x=>{ if(typeof x==='number'&&isFinite(x)&&x<t) t=x; };
    try{ const R=CLS.rec(G); for(const it of CLS.goList(G)){ if(R.done[it.key]||(CLS.planSkip&&CLS.planSkip(G,it))) continue; let pl=null; try{ pl=CLS.goPlan(gm,it); }catch(e){} add(pl?pl.depart:it.t0-1/6); } }catch(e){ console.warn('LUNCH118.limit classes',e); }
    try{ if(CLS.hardItems) for(const x of CLS.hardItems(G)){ const s=x.t!=null?x.t:x.start; if(s>h) add(s); } }catch(e){}
    try{ if(CLS.skipStops) for(const s of CLS.skipStops(GM,Math.min(23.99,h+2*C.walkH+C.eatH+0.5))) add(s.h); }catch(e){ console.warn('LUNCH118.limit stops',e); }
    try{ if(typeof OUT!=='undefined'&&OUT.rec) for(const q of OUT.rec(G)){ if(!q||q.state!=='planned'||q.day!==G.day||!(q.h>h)) continue; add(q.h-(+q.travelH||0)-1/6); } }catch(e){}
    return t; };
  /* special 的 when（匯入工具從 cond 文字拆的）；不認得的鍵＝不成立 */
  S.whenOk=function(G,W,sp,ctx){ if(!W) return true; if(typeof W!=='object') return false; const T=term(G), F=G.flags||{}, all=(v,f)=>Array.isArray(v)&&v.every(f);
    for(const k of Object.keys(W)){ const v=W[k];
      if(k==='inParty'){ if(!all(v,id=>ctx.party.includes(id))) return false; }
      else if(k==='minTier'){ const ids=Array.isArray(W.inParty)&&W.inParty.length?W.inParty:(sp.who||[]); if(!ids.length||!ids.every(id=>S.tierRaw(id)>=v)) return false; }
      else if(k==='termFrom'){ const i=TERMS.indexOf(v); if(!T||i<0||TERMS.indexOf(T.id)<i) return false; }
      else if(k==='terms'){ if(!T||!Array.isArray(v)||!v.includes(T.id)) return false; }
      else if(k==='knows'){ if(!all(v,id=>knows(G,id))) return false; }
      else if(k==='present'){ if(!all(v,id=>present(G,id))) return false; }
      else if(k==='reachable'){ if(!all(v,id=>reachable(G,id))) return false; }
      else if(k==='notH'){ const O=L118.rec(G).once; if(!Array.isArray(v)||v.some(x=>O[x]===G.day)) return false; }
      else if(k==='flags'){ if(!all(v,f=>!!F[f])) return false; }
      else if(k==='weekday'){ const wd=typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(G.day).wd%7:G.weekday%7; if(v!==true||wd<1||wd>5) return false; }
      else if(k==='inTerm'){ if(v!==true||!T) return false; }
      else if(k==='weekFrom'){ if(!T||!(T.week>=v)) return false; }
      else if(k==='shopOpen'){ if(!all(v,s=>L118.isOpen(s,ctx.gA||G))) return false; }
      else if(k==='at'){ if(v!=='leave') return false; }
      else return false; }
    return true; };
  /* 偶遇的人那個時間有沒有空：照作息，在上課、打工、社團、和人有約，或不在遊戲的場景裡（旅行、回老家）＝不會遇到 */
  S.meetFree=function(G,id,gA){ const c=CH(id); if(!c||typeof STORY==='undefined'||!STORY.schedEnt) return true; let e=null; try{ e=STORY.schedEnt(c,gA||G); }catch(err){ return false; } if(!e) return true;
    if(e.zone==null) return false; return !S.CFG.meetBusy.includes(e.act); };
  S.hToday=function(G,id){ const O=L118.rec(G).once, H=S.RULES.hWho; return Object.keys(H).some(k=>O[k]===G.day&&H[k].includes(id)); };
  S.specialOk=function(G,sp,ctx){ if(!sp||!sp.id||!Array.isArray(sp.lines)||!sp.lines.length||!Array.isArray(sp.who)) return false; if(sp.shop&&!sp.shop.includes(ctx.shop)) return false;
    if(sp.kind==='talk'){ if(!sp.who.length||!sp.who.every(id=>ctx.party.includes(id))) return false; }
    else if(sp.kind==='meet'){ for(const id of sp.who){ if(ctx.party.includes(id)||!CH(id)||!knows(G,id)||!reachable(G,id)||!S.meetFree(G,id,ctx.gA)||S.hToday(G,id)) return false; } }
    else return false;
    return S.whenOk(G,sp.when,sp,ctx); };
  S.pickSpecial=function(G,ctx){ const d=D(), I=S.rec(G), ok=((d&&d.special)||[]).filter(sp=>S.specialOk(G,sp,ctx)); if(!ok.length) return null;
    const un=ok.filter(sp=>I.sp[sp.id]==null), pool=un.length?un:ok.filter(sp=>G.day-I.sp[sp.id]>=S.CFG.spRepeatDays); if(!pool.length) return null; return pool[Math.min(pool.length-1,Math.floor(S.rnd(G,'spPick')*pool.length))]; };
  const apartHit=(ids,T)=>S.RULES.apart.some(a=>(!a.terms||(T&&a.terms.includes(T.id)))&&a.ids.every(x=>ids.includes(x)));
  /* 今天這一堂下課的午餐（不改存檔、不看「今天判過了沒」）：{no:'原因'} 或整份計畫 */
  S.plan=function(GM,it){ const G=GM&&GM.G, C=S.CFG, d=D(), no=(why,x)=>Object.assign({no:why},x||{}); if(!G||!S.on(G)) return no('off'); if(!S.lawAm(G,it)) return no('notLawAm');
    if(!CLS.rec(G).done[it.key]) return no('notAttended'); const h=hr(G); if(G.hour>=24||h>S.window().to+1e-6) return no('late'); if(S.zheToday(G)) return no('zheLunch');
    let el=S.eligible(G,it); if(S.zhePhoned(G)) el=el.filter(id=>id!==S.RULES.zhe); if(!el.length) return no('nobody');
    const top=Math.max.apply(null,el.map(S.tier)), p=+C.prob[top]||0; if(!(S.rnd(G,'hit')<p)) return no('roll',{el,top,p});
    const hA=h+C.walkH, gA=atHour(G,hA), I=S.rec(G), T=term(G);
    const shops=id=>S.shopsOf(G,id,gA).filter(s=>S.groupsFor([id],s).length>0);
    const cands=el.filter(id=>d.invite[id]&&Array.isArray(d.invite[id].lines)&&d.invite[id].lines.length&&shops(id).length>0); if(!cands.length) return no('noShop',{el,top,p});
    const who=pickW(cands,id=>(+C.weight[S.tier(id)]||1)*(d.who[id].weight!=null?+d.who[id].weight:1)*C.declMul[Math.min(C.declMul.length-1,I.decl[id]|0)],S.rnd(G,'who'));
    const shop=pickW(shops(who),s=>+d.who[who].prefs[s],S.rnd(G,'shop')), s=L118.shop(shop), meal=S.meal(G,shop); if(!meal) return no('noMenu',{who,shop});
    const lim=S.limit(GM,'l118_'+shop); if(lim-h<C.walkH+C.minEatH-1e-6) return no('noTime',{who,shop,lim});
    const pool=el.filter(id=>id!==who), nWant=pickW([0,1,2].filter(n=>n<=pool.length),n=>C.mateN[n],S.rnd(G,'n')), mates=[];
    for(let k=0;k<nWant;k++){ const c=pool.filter(id=>!mates.includes(id)&&!apartHit([who].concat(mates,[id]),T)); if(!c.length) break; mates.push(pickW(c,id=>+C.weight[S.tier(id)]||1,S.rnd(G,'mate'+k))); }
    const party=[who].concat(mates), grp=S.pickGroup(G,party,shop); if(!grp) return no('noLines',{who,shop,party});
    const ctx={party,shop,who,gA}, sp=S.rnd(G,'sp')<C.specialP?S.pickSpecial(G,ctx):null;
    const IL=d.invite[who].lines, LV=Array.isArray(d.leave)?d.leave:[], pickL=(L,salt)=>L.length?L[Math.min(L.length-1,Math.floor(S.rnd(G,salt)*L.length))]:null;
    return {day:G.day,key:it.key,el,top,p,who,mates,party,shop,shopName:s.name,item:meal.item,price:meal.price,poor:!meal.ok,grp,sp,inviteLine:pickL(IL,'inv'),
      arrive:(d.arrive&&d.arrive[shop])||null,leave:pickL(LV,'leave'),h0:h,hA,lim,hEnd:Math.max(hA,Math.min(hA+C.eatH,lim))}; };
  /* 句子裡的 {店名}{name}{發起人}{同行}{品名}{金額} */
  const short=id=>{ const d=D(); return (d&&d.who[id]&&d.who[id].name)||dn(id); };
  S.fill=function(t,P,G){ return String(t).replace(/\{店名\}/g,P.shopName).replace(/\{name\}/g,(G&&G.name)||'').replace(/\{發起人\}/g,short(P.who)).replace(/\{同行\}/g,P.party.map(short).join('、')).replace(/\{品名\}/g,P.item).replace(/\{金額\}/g,String(P.price)); };
  /* 說話的人：null＝旁白、'player'＝祐廷、人物 id＝那個人（3D 人物在這一區就用）、其他字＝路人的稱呼 */
  S.speaker=function(GM,w){ if(w==null) return null; if(w==='player') return {name:GM.G.name}; if(CH(w)) return (GM.npc&&GM.npc[w])||{name:dn(w),charId:w}; return {name:String(w)}; };
  S.sayAll=async function(GM,lines,P){ for(const row of lines||[]){ if(!Array.isArray(row)||row[1]==null) continue; await GM.say(S.speaker(GM,row[0]),S.fill(row[1],P,GM.G)); } };
  /* 熟悉度（只加熟悉；每人每週從午餐最多 weekCap）。回傳實際加的 */
  S.weekKey=G=>{ const T=term(G); return T?T.id+':'+T.week:'d'+Math.floor(G.day/7); };
  S.give=function(G,id,n){ const I=S.rec(G), wk=S.weekKey(G); let e=I.wk[id]; if(!e||typeof e!=='object'||e.w!==wk) e=I.wk[id]={w:wk,pts:0}; const g=Math.max(0,Math.min(Math.trunc(+n)||0,S.CFG.weekCap-(e.pts|0)));
    if(g>0){ e.pts=(e.pts|0)+g; if(typeof SOCIAL!=='undefined'&&SOCIAL.adjust) SOCIAL.adjust(id,{fam:g}); } return g; };
  /* 結算：一天一次（先記再做，全部同步）。o.skip＝快速略過（不演特殊、不演那間店第一次的旁白）；o.sp＝這一次演了的特殊 */
  S.settle=function(GM,P,o){ o=o||{}; const G=GM.G, I=S.rec(G), C=S.CFG; if(I.done===G.day||P.settled) return null; I.done=G.day; P.settled=true; I.n=(I.n|0)+1;
    const s=L118.shop(P.shop), out={price:P.price,item:P.item,pts:{},eatP:null};
    GM.money(-P.price,'餐費');   /* 只扣玩家自己那一份 */
    L118.visit(G,P.shop,P.item); for(const id of P.party) L118.ate(G,id,P.shop);
    if(typeof EAT!=='undefined'&&s){ try{ if(o.skip){ const R=EAT.rec(G); R.n[s.name]=(R.n[s.name]|0)+1; R.last[s.name]=P.item; if(EAT.isFood(s.name)&&EAT.note) EAT.note(GM,s.name,P.item); }
        else out.eatP=Promise.resolve(EAT.ordered(GM,s.name,P.item)).catch(e=>{ console.warn('LUNCH118 EAT.ordered',e); }); }catch(e){ console.warn('LUNCH118 EAT',e); } }   /* EAT.ordered 的紀錄在第一個 await 以前就寫完；那間店第一次的旁白由 S.show 等它 */
    const pts={}; for(const id of P.party) pts[id]=C.pts;
    if(o.sp){ const B=o.sp.bonus&&typeof o.sp.bonus==='object'?o.sp.bonus:null, ids=B?Object.keys(B):(o.sp.who||[]); for(const id of ids){ if(!CH(id)) continue; pts[id]=(pts[id]|0)+(B?Math.max(0,B[id]|0):(o.sp.kind==='meet'?C.meetPts:C.talkPts)); } I.sp[o.sp.id]=G.day; }
    for(const id of Object.keys(pts)) out.pts[id]=S.give(G,id,pts[id]);
    if(typeof SOCIAL!=='undefined'&&SOCIAL.onActivity) for(const id of P.party){ try{ SOCIAL.onActivity(G,id,'meal'); }catch(e){} }   /* 學期末「這學期常接觸」照一起吃飯算（termend3d.js，一天一次）*/
    if(!o.skip){ I.seen=(I.seen|0)+1; if(P.grp) I.lg[P.grp.id]=G.day; }
    return out; };
  /* 3D：黑幕裡（GM.enter 的 onLoaded）玩家和同行的人坐同一桌。位子不夠＝坐得下的先坐；回傳坐下的同行人數 */
  S.TOGETHER_GAIN=0.5;   /* 併桌的桌數一樣時，請路人讓位要能近多少才值得（m；最遠那張桌子到中心桌的距離）*/
  S.seatParty=function(GM,P){ const E=GM.E, G=GM.G; if(!E||!E.zone||!E.player||!GM.sitAt) return 0; const seats=E.zone.seats||[], need=P.party.length+1;
    const mine=q=>!!q&&P.party.includes(q.charId), busyNpc=st=>(E.npcs||[]).some(n=>n&&!mine(n)&&(n.seat===st||n.seatTarget===st||((n.seat||n.seatTarget)&&Math.hypot((n.seat||n.seatTarget).x-st.x,(n.seat||n.seatTarget).z-st.z)<0.35)));
    const isFree=st=>!st.taken&&!busyNpc(st); let free=seats.filter(isFree);
    if(free.length<need&&typeof CROWD!=='undefined'&&CROWD.shopMakeRoom){ try{ CROWD.shopMakeRoom(GM,need); }catch(e){} free=seats.filter(isFree); }
    if(!free.length) return 0;
    const L=typeof L118_SHOP_LAYOUTS!=='undefined'&&L118_SHOP_LAYOUTS?L118_SHOP_LAYOUTS[P.shop]:null, tk=st=>{ const q=L&&Array.isArray(L.seats)?L.seats.find(s=>Math.abs(s.x-st.x)<0.02&&Math.abs(s.z-st.z)<0.02):null; return q&&Array.isArray(q.table)?q.table.join(','):null; };
    /* 空位照桌子分組（沒有桌號的位子自己一組）：從每一張桌子出發，由近到遠併桌到坐得下；挑「坐得下 → 用的桌子最少 → 不是吧檯高腳椅 → 併的桌子靠得最近」的那一組 */
    const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
    const choose=(pool,cost)=>{ const byT={}; for(const st of pool){ const k=tk(st)||('s:'+st.x+','+st.z); (byT[k]=byT[k]||[]).push(st); }
      const TB=Object.keys(byT).map(k=>{ const a=byT[k].slice().sort((p,q)=>cost(p)-cost(q)); return {a,x:a.reduce((t,q)=>t+q.x,0)/a.length,z:a.reduce((t,q)=>t+q.z,0)/a.length,lift:a.some(q=>q.lift)?1:0}; });
      let best=null; for(const t0 of TB){ const list=[]; let tabs=0, span=0; for(const t of TB.slice().sort((p,q)=>dist(p,t0)-dist(q,t0))){ if(list.length>=need) break; for(const q of t.a){ if(list.length<need) list.push(q); } tabs++; span=dist(t,t0); }
        const sc=[need-list.length,tabs,list.filter(q=>q.lift).length,Math.round(span*100)/100,list.reduce((n,q)=>n+cost(q),0)], better=!best||sc.some((v,i)=>v!==best.sc[i]&&sc.slice(0,i).every((w,j)=>w===best.sc[j])&&v<best.sc[i]); if(better) best={sc,list}; }
      return best; };
    let best=choose(free,()=>0);
    /* 路人客人讓位：把路人坐著的位子也算進來再挑一次（有名字的人的位子不算）；那樣挑到的比只用空位的好（坐得下的人多、用的桌子少、或桌數一樣但近 S.TOGETHER_GAIN 以上）才用，
       挑到的位子上有路人＝那一桌路人整組離開（CROWD.shopYield；只在進門的黑幕裡、和 shopMakeRoom 同一個時機）。BB 2026-11-11 雲端自檢：柏翰、芯慈和玩家隔 3～4 m 兩桌（中間的桌子被路人坐掉）。 */
    if(typeof CROWD!=='undefined'&&CROWD.shopYield){ const crowdOn=st=>(E.npcs||[]).some(n=>n&&typeof n.crowd==='string'&&/^shop_/.test(n.crowd)&&!n.leaving&&[n.seat,n.seatTarget].some(q=>q&&(q===st||Math.hypot(q.x-st.x,q.z-st.z)<0.35)));
      const named=st=>(E.npcs||[]).some(n=>n&&!mine(n)&&!(typeof n.crowd==='string'&&/^shop_/.test(n.crowd))&&[n.seat,n.seatTarget].some(q=>q&&(q===st||Math.hypot(q.x-st.x,q.z-st.z)<0.35)));
      const pool=seats.filter(st=>!st.taken&&!named(st)), b2=choose(pool,st=>crowdOn(st)?1:0);
      if(b2&&b2.sc[4]>0&&(!best||b2.sc[0]<best.sc[0]||(b2.sc[0]===best.sc[0]&&(b2.sc[1]<best.sc[1]||(b2.sc[1]===best.sc[1]&&best.sc[3]-b2.sc[3]>S.TOGETHER_GAIN))))){   /* 路人讓位才坐得下／用的桌子比較少／一樣多桌但近很多，才請路人讓 */ let gone=0; try{ gone=CROWD.shopYield(GM,b2.list.filter(crowdOn)); }catch(e){ console.warn('LUNCH118 shopYield',e); }
        if(b2.list.every(isFree)) best=b2; else { free=seats.filter(isFree); best=choose(free,()=>0)||best; } } }
    if(!best) return 0;
    const pick=best.list;
    GM.sitAt(E.player,pick[0]); let k=1, n=0;
    for(const id of P.party){ const st=pick[k]; if(!st) break; let c=GM.npc&&GM.npc[id]; if(c){ c.seatTarget=null; c.path=null; if(c.seat!==st) GM.sitAt(c,st); } else if(GM.spawnCharacter) c=GM.spawnCharacter(id,st.x,st.z,{seat:st,pose:'sit'});
      if(!c) continue; k++; n++; c.pose=c.idlePose='sit'; c.frozen=true; c.l118Shop=P.shop; c.lunch118=G.day; c.until=P.hEnd; }
    P.seated=true; return n; };
  S.stage3d=async function(GM,P){ const zone='l118_'+P.shop; if(typeof Z3==='undefined'||!Z3.ZONES||!Z3.ZONES[zone]||!GM.enter) return false;
    try{ await GM.enter(zone,undefined,{deferStory:true,noAutosave:true,onLoaded:()=>{ try{ S.seatParty(GM,P); }catch(e){ console.warn('LUNCH118.seatParty',e); } }}); }
    catch(e){ console.warn('LUNCH118.stage3d',e); if(GM.G.zone===zone&&GM.fade) await GM.fade(false); }
    return GM.G.zone===zone; };
  /* 吃完：玩家站起來；同行的人時段到了，自己走出去（story3d.js refreshSchedule 的 until）*/
  S.unstage=function(GM,P){ const E=GM.E; if(!E||!E.player) return; if(P.seated&&E.player.seat&&GM.standUp) GM.standUp(E.player); const h=hr(GM.G); for(const id of P.party){ const c=GM.npc&&GM.npc[id]; if(c&&c.lunch118!=null&&(c.until==null||c.until>h)) c.until=h; } };
  /* 完整演出 */
  S.show=async function(GM,P){ const G=GM.G, C=S.CFG, sp=P.sp, late=!!(sp&&sp.when&&sp.when.at==='leave'); let staged=false, adv=false;
    GM.sceneBegin();
    try{ if(GM.fade) await GM.fade(true); if(P.hA>hr(G)) GM.advance(P.hA-hr(G));
      staged=await S.stage3d(GM,P);
      if(!staged){ if(typeof ADV!=='undefined'&&ADV.begin){ ADV.begin({background:'dark'}); adv=true; } if(GM.caption) GM.caption('',P.shopName,2400); if(GM.fade) await GM.fade(false); }   /* 店的 3D 區域不在：深色底＋店名（同 classes3d.js lunchBreak 沒有圖的店）*/
      if(P.arrive) await GM.say(null,S.fill(P.arrive,P,G));
      if(sp&&sp.kind==='meet'&&!late) await S.sayAll(GM,sp.lines,P);
      if(P.grp&&!(sp&&sp.kind==='talk'&&C.talkReplaces)) await S.sayAll(GM,P.grp.lines,P);
      if(sp&&sp.kind==='talk') await S.sayAll(GM,sp.lines,P);
      if(P.hEnd>hr(G)) GM.advance(P.hEnd-hr(G));
      const st=S.settle(GM,P,{sp}); if(st&&st.eatP) await st.eatP;
      if(P.leave) await GM.say(null,S.fill(P.leave,P,G));
      if(sp&&late) await S.sayAll(GM,sp.lines,P);
    } finally { try{ if(staged) S.unstage(GM,P); }catch(e){ console.warn('LUNCH118.unstage',e); } if(adv&&typeof ADV!=='undefined'&&ADV.active&&ADV.end) ADV.end(); GM.sceneEnd(); }
    if(GM.autosave) GM.autosave(); return 'done'; };
  /* 快速略過：不換場景；時間照樣過（走過去、吃、走回來，不超過下一件事），結算同一支 */
  S.quick=async function(GM,P){ const G=GM.G, C=S.CFG, d=D(), h=hr(G), end=Math.min(h+2*C.walkH+C.eatH,S.limit(GM,null));
    GM.sceneBegin();
    try{ if(GM.fade) await GM.fade(true); if(end>h) GM.advance(end-h); const st=S.settle(GM,P,{skip:true}); if(GM.fade) await GM.fade(false); if(st&&d.skipLine) await GM.say(null,S.fill(d.skipLine,P,G)); }
    finally { GM.sceneEnd(); }
    if(GM.autosave) GM.autosave(); return 'skip'; };
  S.canSkip=function(G,P){ const d=D(), I=S.rec(G); return !!(d&&d.options.skip)&&(I.seen|0)>=1&&!(P.sp&&P.sp.first&&I.sp[P.sp.id]==null); };
  /* 邀約那一段：回傳 'decline'／'poor'／'done'／'skip' */
  S.run=async function(GM,P){ const G=GM.G, d=D(), I=S.rec(G), N=d.noMoney||{}, inviter=S.speaker(GM,P.who); let mode=null;
    GM.sceneBegin();
    try{ if(P.inviteLine) await GM.say(inviter,S.fill(P.inviteLine,P,G));
      const O=[]; if(P.poor){ if(N.narr) await GM.say(null,S.fill(N.narr,P,G)); O.push(N.player?{k:'poor',t:S.fill(N.player,P,G)}:{k:'poor',t:S.fill(d.options.accept,P,G),dim:true}); }
      else { O.push({k:'accept',t:S.fill(d.options.accept,P,G)}); if(S.canSkip(G,P)) O.push({k:'skip',t:S.fill(d.options.skip,P,G)}); }
      O.push({k:'decline',t:S.fill(d.options.decline,P,G)});
      const i=await GM.choose(O.map(o=>o.dim?{t:o.t,dim:true}:{t:o.t})), c=(O[i]||O[O.length-1]).k;
      if(c==='decline'){ const DL=(d.invite[P.who]&&d.invite[P.who].declineReply)||[], k=I.dn[P.who]|0; I.decl[P.who]=(I.decl[P.who]|0)+1; I.dn[P.who]=k+1;
        if(DL.length) await GM.say(inviter,S.fill(DL[k%DL.length],P,G)); return 'decline'; }   /* 婉拒：不加不扣，只記他的連續次數；回的那一句輪著用（婉拒他的第幾次，dn 不歸零）*/
      if(c==='poor'){ if(N.reply) await GM.say(inviter,S.fill(N.reply,P,G)); return 'poor'; }   /* 錢不夠：不扣錢、不算婉拒 */
      I.decl[P.who]=0; mode=c;
    } finally { GM.sceneEnd(); }
    return mode==='skip'?S.quick(GM,P):S.show(GM,P); };
  /* 下課選單以前（CLS.afterMenu）。a＝classes3d.js 的 afterP（a.ev＝這一堂下課演了課後劇情）。回傳 false＝沒有邀 */
  S.afterClass=async function(GM,key,a){ const G=GM&&GM.G; if(!G||busy||!S.on(G)||!CLS.dayItems) return false; const it=CLS.dayItems(G).find(q=>q.key===key); if(!it||!S.lawAm(G,it)||!CLS.rec(G).done[key]) return false;
    const I=S.rec(G); if(I.day===G.day) return false; I.day=G.day; I.hit=false;   /* 今天判過了（不管中不中）*/
    if(a&&a.ev&&S.CFG.skipAfterEvent) return false;
    const P=S.plan(GM,it); if(!P||P.no) return false; I.hit=true;
    busy=true; try{ return await S.run(GM,P); } finally { busy=false; } };
  return S;
})();
