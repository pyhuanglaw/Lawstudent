/* ===== 公館三間新室內的台詞與買賣（GG-SHOPS-REDO-1104；AA_653，企劃線 d26fecd2f，AA 定稿 D109）=====
   區域：日和便利店 cvs、頁間書屋 bookstore、青木茶室 aoki（場景 src/zones3d.js 的 ggRoom；配置 src/data/cvs_layout.js、yejian_layout.js、aoki_layout.js）。
   台詞一字照抄（S.L）；稿裡沒有的句子不寫——稿上沒寫的地方用系統提示（toast：「錢不夠」「買了○○」），不自己補台詞。
   互動點：zones3d.js 的 ggLooks 照配置 interact 放（帶 ggs＝配置的 kind）；這裡接 STORY.interact。
   - 看東西（S.LOOK）：每次隨機一句、同一句不連續出（記在這個檔，不進存檔）。熱食櫃 22:00～06:00、冷藏櫃 00:00～06:00 是稿上那一句（換掉白天的）。
   - 買東西（S.MENU）：品項、價錢照稿；扣錢、時間 +0.15 小時（照 story3d.js 的 counter）；錢不夠＝稿上有那一句就說（青木），沒有＝「錢不夠」。
     便利店吃的照舊登記在 EAT（店名 key「公館的便利商店」，和結帳同一個）；頁間、青木的內用不是 EAT 的店（不登記）。
   - 日和咖啡的集點：不做（AA_653 第 1 節：LAWWW 可以不做，只留第一句）。
   - 包裹暫取：G.flags.CVS_PARCEL 有值＝有包裹（領完清掉）；現在沒有任何事件寄包裹，所以一律「查不到」（劇情、網購事件要寄的時候設這個旗標）。
   - 微波：今天在便利店買了「微波義大利麵」（結帳；EAT.ordered 那一刻記 G.flags.CVS_HEAT＝那一天）還沒熱＝熱；沒有＝看貼紙那一句。
   - 頁間的點咖啡：店員那句每天第一次點才說（G.flags.YJ_CAFE_DAY）。
   - 青木：內用點茶（熱茶一壺＝店員那句＋點完隨機一句；冷泡、茶點稿上沒有點完的句子＝只出「買了○○」）；坐下照位子一句（STORY.onSeat）；
     營業每天 11:00～21:00、颱風假不開（places.js hours.aoki、typhoonShops）：門口「進入青木茶室」「外帶」打烊／颱風天＝門口那一句（AA_653 §0）、不進去不賣；
     21:00 人還在店裡＝店員一句＋旁白、站到公館門口（STORY.TICKS）；讀檔、颱風天在店裡＝直接出來、寫開放時間。
   - 約去青木茶室：src/data/invites.js 的地點 aoki（答應的一句七人＋一般那句 INVITE_DATA.aokiAcc0；坐下以後的開場句 seatOpen.aoki）。
   - 頁間書屋的人物動作（BUG-YEJIAN-NO-VISUAL-1110，使用者 11-10 00:3x「在頁間書屋點任何東西都只有對話?沒有畫面?」→ 選擇題答「人物沒有動作」；USER_WANTS X269）：台詞一句都不改（AA_653），只加動作——
       看看書牆、看新書：祐廷走到書牆／斜面書架前、面向它，出那一句（照舊隨機）；不是「一本也沒拿」那一句＝拿一本走到最近的空位（閱讀桌、沙發；窗邊高腳椅不拿書過去）坐下翻（pose read：手上捧著打開的書，character3d.js readIK），
         接著照一般的座位選單（讀書、坐一下、起身…；GM.seatMenu）——要走就按「起身」，人不會卡在位子上。沒有空位＝只站在書架前看（不拿書）。
       點咖啡：走到咖啡吧前、面向吧檯點（點完那幾句照舊），點了東西＝走到最近的空位坐下（高腳椅最後才挑）：飲料＝坐著喝（坐在桌前做事的片段 Drink＋手上的杯子，CHAR.sitTaskFit；
         片段、配件還沒載好或這張桌子合不上＝一般坐姿），蛋糕＝坐下；錢不夠、不用了＝不走。起身（座位選單的「起身」）就把喝的片段拿掉。
       走路用 GM.walkTo（劇情自動走路；卡住 4 秒有保險放到目的地），站的點照導航格找站得住的（互動點本身站不住就往外退，最多 1 m）。測試：node tests/yejian_actions_1110_unit.js
   測試：node tests/aa653_shops_unit.js */
'use strict';
const GGS=(function(){
  const S={}, CLERK={name:'店員'};
  /* ---------- 台詞（AA_653，一字照抄）---------- */
  /* TEXT-QUOTE-UNIFY-1108 第四批（AA-B 2026-11-08 05:31）：店員說的（sayL → GM.say({name:'店員'},…)）不加外面的「」；旁白裡的「」照留 */
  S.LOOK={
    cvs:{
      hotfood:{day:['（熱食櫃裡有烤地瓜、茶葉蛋、兩種包子。烤地瓜的牌子寫著「剛出爐」。）','（關東煮的鍋子在冒煙。白蘿蔔已經賣掉一半了。）'],night:'（熱食櫃剩下兩顆茶葉蛋和一個肉包。）',nightAt:[22,6]},
      cooler:{day:['（冷藏櫃裡一整排飲料，最下面一層是牛奶。有一瓶豆漿被人放到茶的那一格。）','（冷藏櫃的玻璃起了一層霧。你拉開門，冷氣撲到臉上。）'],night:'（冷藏櫃最上面那層的飯糰只剩鮪魚口味。）',nightAt:[0,6]} },
    bookstore:{
      shelf_browse:{day:['（書牆一直頂到天花板，最上面那層要用梯子才拿得到。類別牌寫著「大學生活」。）','（「法律」那一格有一本書夾著一張便條：「第三章很重要」。不知道是誰留的。）','（你在「散文・人文」那一格停了很久。最後一本也沒拿。）']},
      new_books:{day:['（斜面書架上擺著這個月的新書。有一本的封面是一扇開著的窗。）','（新書架旁邊的小卡寫著店員的推薦：「適合下雨天。」）']} },
    aoki:{
      bookcase:{day:['（書櫃裡多半是茶的書，也有幾本旅行的書和一本《民法總則》，不知道是誰留下的。）','（書櫃中間那一層放著一個小盆栽，葉子垂到下一層的書上。）']},
      vitrine:{day:['（玻璃櫃裡擺著白瓷茶壺和幾盒茶葉禮盒。最上面那盒用麻繩綁著。）','（茶具櫃的燈打在一只淺綠色的茶壺上。旁邊的小卡寫著「非賣品」。）']},
      tea_tins:{day:['（後牆一整排深綠色的茶罐，每一罐都貼著手寫的標籤：烏龍、綠茶、白茶、包種、鐵觀音……）','（有一罐的標籤寫著「今年第一批」。店員說那是春天的白茶。）']} } };
  S.MENU={
    'cvs.hotfood':{items:[['烤地瓜',45],['茶葉蛋',13],['肉包',25],['關東煮（三樣）',60]],after:[['店員','要加熱嗎？……那幫你裝袋。']],eat:'公館的便利商店',night:['茶葉蛋','肉包'],nightAt:[22,6]},
    'cvs.coffee':{items:[['美式',45],['拿鐵',60],['冰美式',45]],after:[['店員','大杯還是中杯？'],[null,'（咖啡機響了一陣，杯子上印著一片小小的葉子。）']],eat:'公館的便利商店'},
    'bookstore.cafe_order':{items:[['美式',90],['拿鐵',110],['紅茶',80],['今日蛋糕',100]],first:['店員','書可以帶到位子上看喔。……沒買的看完放回去就好。'],after:[[null,'（咖啡吧的磨豆機響了一下。店員把杯子放在一個小木盤上。）']]},
    'aoki.order':{items:[['桂花烏龍（一壺）',220,'pot'],['東方美人（一壺）',260,'pot'],['春摘白茶（一壺）',240,'pot'],['包種（一壺）',200,'pot'],['柚香綠茶（冷泡）',120,'cold'],['綠豆糕',80,'snack'],['桂花糕',80,'snack']],hint:{pot:'熱茶一壺，可以回沖',cold:'冷泡',snack:'茶點'},
      pot:['店員','第一泡我幫你泡，之後可以自己加熱水。'],potAfter:['（店員把茶壺、公道杯、兩個小杯放在木盤上，端到你的位子。）','（第一泡的茶很香。店員說：「三十秒就好，不要泡太久。」）'],
      poor:['店員','冷泡的柚香綠茶比較便宜喔。']} };
  S.L={
    parcelYes:[['店員','末三碼？'],[null,'（你報了手機末三碼。店員從後面搬出一個箱子。）']], parcelNo:['店員','……查不到耶。可能還沒到。'],
    microYes:'（微波爐轉了一分鐘，叮了一聲。）', microNo:'（微波爐旁邊貼著「請勿加熱鋁箔包裝」。）',
    seat:{window:'（窗外的騎樓有人走過。茶杯的影子落在桌上。）',banquette:'（綠色的卡座很軟，旁邊的書櫃伸手就拿得到。）',middle:'（茶的香味很淡，店裡只聽得到熱水壺的聲音。）',bar:'（吧台前面看得到店員秤茶葉，一克一克地放。）'},
    /* 打烊的字（AA_653 的 close）作廢，照 AA_700 一句：XSCLOSE.say（下面 S.closeOut）*/
    doorTyphoon:'（青木茶室的門上貼著「颱風天暫停營業」。）', doorClosed:'（青木茶室的燈關了，外帶窗口也拉下來了。門上的木牌寫著「11:00～21:00」。）' };
  S.HEAT_ITEM='微波義大利麵';   /* story3d.js 便利商店結帳的那一樣（要微波的）*/

  /* ---------- 共用 ---------- */
  const hr=G=>(((+G.hour||0)%24)+24)%24;
  S.rand=()=>Math.random();
  const lastPick={};
  S.pickLine=function(key,arr){ if(!arr||!arr.length) return null; const prev=lastPick[key]; const pool=arr.map((t,i)=>i).filter(i=>arr.length<2||i!==prev); const i=pool[Math.min(pool.length-1,Math.floor(S.rand()*pool.length))]; lastPick[key]=i; return arr[i]; };
  const inWin=(h,w)=>w[0]<=w[1]?(h>=w[0]&&h<w[1]):(h>=w[0]||h<w[1]);
  S.lookLine=function(G,zone,kind){ const D=S.LOOK[zone]&&S.LOOK[zone][kind]; if(!D) return null; if(D.night&&D.nightAt&&inWin(hr(G),D.nightAt)) return D.night; return S.pickLine(zone+'.'+kind,D.day); };
  const sayL=async(GM,L)=>{ for(const [w,t] of L) await GM.say(w==null?null:(w==='店員'?CLERK:{name:w}),t); };

  /* ---------- 青木茶室的營業 ---------- */
  S.AOKI='aoki';
  S.typhoon=G=>typeof PLACES!=='undefined'&&!!PLACES.typhoonClosed&&PLACES.typhoonClosed(S.AOKI,G.day);
  S.aokiOpen=G=>typeof PLACES==='undefined'||!PLACES.isOpen||PLACES.isOpen(S.AOKI,hr(G),G.day);
  S.doorLine=G=>S.aokiOpen(G)?null:(S.typhoon(G)?S.L.doorTyphoon:S.L.doorClosed);

  /* ---------- 買東西 ---------- */
  S.buy=async function(GM,key){ const G=GM.G, M=S.MENU[key]; if(!M) return null;
    const IT=M.night&&M.nightAt&&inWin(hr(G),M.nightAt)?M.items.filter(m=>M.night.includes(m[0])):M.items;   /* 熱食櫃晚上只剩茶葉蛋、肉包（稿上晚上那一句）*/
    const hO=key==='aoki.order'&&typeof GIFTH!=='undefined'&&GIFTH.shopOpt?GIFTH.shopOpt(G,'aoki'):null;   /* 青木茶室的買禮物（GIFT-HOLIDAY-1110，src/gifthol3d.js）*/
    const opts=IT.map(m=>Object.assign({t:m[0]+'　'+m[1]+' 元',dim:(G.money|0)<m[1]},M.hint&&M.hint[m[2]]?{hint:M.hint[m[2]]}:{})).concat(hO?[hO]:[],[{t:'不用了'}]);
    const gO=typeof GIFT!=='undefined'&&GIFT.shopOpt?GIFT.shopOpt(G,key):null; if(gO) opts.push(gO);   /* 買一份帶走送人（GIFT-ALL-DRINK-SHOPS-1112，src/gift3d.js GIFT.SHOPS）：放在最後，原本的選項位置不動 */
    const i=await GM.choose(opts); if(gO&&i===opts.length-1){ await GIFT.buy(GM,key); return 'gift'; } if(hO&&i===IT.length){ await GIFTH.pick(GM,hO); return 'gift'; } if(i==null||i<0||i>=IT.length) return null;
    const [nm,p,tag]=IT[i];
    if((G.money|0)<p){ if(M.poor&&tag!=='cold') await sayL(GM,[M.poor]); else GM.toast('錢不夠'); return 'poor'; }
    GM.money(-p); if(GM.advance) GM.advance(0.15);
    if(M.first){ const F=G.flags||(G.flags={}); if(F.YJ_CAFE_DAY!==G.day){ F.YJ_CAFE_DAY=G.day; await sayL(GM,[M.first]); } }
    if(M.after) await sayL(GM,M.after);
    if(M.pot){ if(tag==='pot'){ await sayL(GM,[M.pot]); await GM.say(null,S.pickLine(key+'.pot',M.potAfter)); } else GM.toast('買了'+nm,2400); }   /* 冷泡、茶點：稿上沒有點完的句子 */
    if(M.eat&&typeof EAT!=='undefined'&&EAT.ordered){ try{ await EAT.ordered(GM,M.eat,nm); }catch(e){ console.warn('EAT.ordered',e); } }
    if(GM.autosave) GM.autosave(); return nm; };

  /* ---------- 互動 ---------- */
  S.interact=async function(it,GM){ const G=GM&&GM.G; if(!it||!G) return false;
    /* 青木茶室的門口：打烊、颱風天不進去、不外帶（門口那一句）*/
    if((it.exit&&it.exit.to===S.AOKI)||it.ggsTake){ const dl=S.doorLine(G); if(!dl) return false; GM.sceneBegin(); try{ await GM.say(null,dl); } finally { GM.sceneEnd(); } return true; }
    if(!it.ggs) return false; const z=G.zone, k=it.ggs, key=z+'.'+k, yj=z===S.YJ&&!!S.YJ_FACE[k]; let then=null;
    GM.sceneBegin(); try{
      if(yj) await S.yjGo(GM,it,k);   /* 頁間：先走過去、面向書牆／書架／咖啡吧（BUG-YEJIAN-NO-VISUAL-1110）*/
      if(S.MENU[key]){ if(z==='cvs'&&k==='hotfood') await GM.say(null,S.lookLine(G,z,k)); const got=await S.buy(GM,key); if(yj&&got&&got!=='poor'&&got!=='gift') then={act:S.YJ_DRINKS.includes(got)?'drink':'sit',item:got}; }   /* 熱食櫃：先看（白天兩句隨機、晚上那一句），再問要不要買 */
      else if(key==='cvs.parcel'){ const F=G.flags||(G.flags={}); if(F.CVS_PARCEL){ F.CVS_PARCEL=null; await sayL(GM,S.L.parcelYes); } else await sayL(GM,[S.L.parcelNo]); }
      else if(key==='cvs.microwave'){ const F=G.flags||(G.flags={}); if(F.CVS_HEAT===G.day){ F.CVS_HEAT=null; if(GM.advance) GM.advance(1/60); await GM.say(null,S.L.microYes); } else await GM.say(null,S.L.microNo); }
      else { const l=S.lookLine(G,z,k); if(l) await GM.say(null,l); if(yj&&l&&!S.YJ_NO_TAKE.test(l)) then={act:'read'}; }
    } finally { GM.sceneEnd(); }
    if(then){ try{ await S.yjSit(GM,it,then); }catch(e){ console.warn('GGS.yjSit',e); } }   /* 拿書／端著咖啡去坐（場景結束以後：照一般坐下的流程，座位選單可以起身離開）*/
    return true; };

  /* ---------- 頁間書屋：人物的動作（BUG-YEJIAN-NO-VISUAL-1110；上面開頭的說明）---------- */
  S.YJ='bookstore';
  S.YJ_FACE={shelf_browse:'bookwall',new_books:'display_rack',cafe_order:'cafe_counter'};   /* 互動點 → 面向配置裡哪一件家具 */
  S.YJ_NO_TAKE=/一本也沒拿/;   /* 「（你在「散文・人文」那一格停了很久。最後一本也沒拿。）」：不拿書 */
  S.YJ_DRINKS=['美式','拿鐵','紅茶'];
  S.YJ_READ_TABLES=[1,2,4];   /* 拿書去看：閱讀桌、沙發（窗邊高腳椅不拿書過去）*/
  const YL=()=>typeof YEJIAN_LAYOUT!=='undefined'?YEJIAN_LAYOUT:null;
  /* 面向哪一點：書牆＝正對（同一個 x、書牆的 z）；斜面書架＝最近那一座的中心；咖啡吧＝同一個 z、吧檯的 x */
  S.yjFaceAt=function(k,it){ const L=YL(), kind=S.YJ_FACE[k]; if(!L||!kind||!it) return null; const its=(L.items||[]).filter(q=>q.kind===kind&&typeof q.x==='number'); if(!its.length) return null;
    const q=its.reduce((a,b)=>Math.hypot(b.x-it.x,b.z-it.z)<Math.hypot(a.x-it.x,a.z-it.z)?b:a);
    if(kind==='bookwall') return [it.x,q.z]; if(kind==='cafe_counter') return [q.x,it.z]; return [q.x,q.z]; };
  /* 站的點：互動點本身站得住就站那裡；站不住就往外（背對家具的方向）退，每 10 cm 試一次、最多 1 m；都不行＝null（不走，只轉身）*/
  S.yjStand=function(E,it,f){ const ok=(x,z)=>!E||!E.canStand||E.canStand(x,z,0.32,0); if(ok(it.x,it.z)) return [it.x,it.z];
    let dx=it.x-(f?f[0]:it.x), dz=it.z-(f?f[1]:it.z); const d=Math.hypot(dx,dz); if(d<1e-6) return null; dx/=d; dz/=d;
    for(let s=0.1;s<=1.0+1e-6;s+=0.1){ const x=+(it.x+dx*s).toFixed(2), z=+(it.z+dz*s).toFixed(2); if(ok(x,z)) return [x,z]; } return null; };
  S.yjGo=async function(GM,it,k){ const E=GM.E, P=E&&E.player; if(!P||!P.obj||!P.obj.position) return false; const f=S.yjFaceAt(k,it);
    if(P.seat&&GM.standUp) GM.standUp(P);
    const at=S.yjStand(E,it,f), p=P.obj.position; if(at&&GM.walkTo&&Math.hypot(p.x-at[0],p.z-at[1])>0.25) await GM.walkTo(P,at[0],at[1],{lv:0});
    if(f&&GM.face) GM.face(P,f[0],f[1]); if(GM.sleep) await GM.sleep(250); return true; };
  /* 去哪一個位子坐：店裡空著的座位（座位的互動點；GM.freeSeat 沒人坐、原樣回來的）裡離這個互動點最近的；拿書＝只挑閱讀桌、沙發；端咖啡＝高腳椅最後才挑 */
  S.yjSeatIt=function(GM,it,act){ const E=GM.E, L=YL(); if(!E||!L) return null; const tab=s=>{ const q=(L.seats||[]).find(q=>Math.hypot(q.x-s.x,q.z-s.z)<0.05); return q?q.table:null; };
    let best=null, bd=1e9; for(const q of (E.interactables||[])){ if(!q||!q.seat||q.hidden||q.exHeld||(q.shop&&q.shop!==S.YJ)) continue; const t=tab(q.seat); if(t==null) continue;
      if(act==='read'&&!S.YJ_READ_TABLES.includes(t)) continue; if(GM.freeSeat&&GM.freeSeat(q.seat)!==q.seat) continue; if(q.seat.taken) continue;
      const d=Math.hypot(q.seat.x-it.x,q.seat.z-it.z)+((+q.seat.lift||0)>0.02?3:0); if(d<bd){ bd=d; best=q; } }
    return best; };
  let pend=null; (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['ggshops:yjPend']=()=>{ pend=null; };   /* 坐下那一刻要做的（STORY.onSeat）：{act:'read'|'drink'|'sit'}；讀檔時放開（LOADGEN-LOCKS-1028）*/
  S.yjSit=async function(GM,it,then){ const E=GM.E, P=E&&E.player; if(!P||!P.obj||!GM.seatMenu) return null; const si=S.yjSeatIt(GM,it,then.act); if(!si) return null;
    pend={act:then.act}; try{ await GM.seatMenu(si); } finally { pend=null; S.yjDrinkOff(P); } return si.seat; };
  /* 坐下：拿書＝捧著書（pose read）；喝飲料＝做事的片段 Drink（量這張桌子合不合得上；合不上＝一般坐姿）*/
  S.yjDrinkOff=function(P){ const o=P&&P.obj, u=o&&o.userData; if(!u||!u.ggsDrink) return; u.ggsDrink=false; if(typeof CHAR!=='undefined'&&CHAR.setSitTask) CHAR.setSitTask(o,null); };
  S.yjOnSeat=function(GM,seat){ const G=GM&&GM.G, P=GM&&GM.E&&GM.E.player; if(!P) return false; const a=pend; pend=null;
    if(!a||!G||G.zone!==S.YJ){ S.yjDrinkOff(P); return false; }   /* 別的坐下：上一次喝的片段沒拿掉（讀檔打斷）＝拿掉 */
    if(a.act==='read'){ P.pose='read'; P.idlePose='read'; if(typeof CHAR!=='undefined'&&CHAR.setReadItem&&P.obj) CHAR.setReadItem(P.obj,'book'); return 'read'; }
    if(a.act==='drink'&&P.obj&&typeof CHAR!=='undefined'&&CHAR.sitTaskFit&&CHAR.setSitTask){ let fit=null;
      try{ const tb=typeof SEATACT!=='undefined'&&SEATACT.probe?SEATACT.probe(GM.E,seat):null; if(tb&&!((+seat.lift||0)>0.02)) fit=CHAR.sitTaskFit(P.obj,'drink',{h:tb.h,edge:tb.edge,depth:tb.depth},true); }catch(e){ fit=null; }
      if(fit){ CHAR.setSitTask(P.obj,fit); P.obj.userData.ggsDrink=true; return 'drink'; } }
    return 'sit'; };

  /* ---------- 青木茶室：坐下照位子一句 ---------- */
  const AL=()=>typeof AOKI_LAYOUT!=='undefined'?AOKI_LAYOUT:null;
  S.seatKind=function(seat){ const L=AL(); if(!L||!seat) return null; const s=(L.seats||[]).find(q=>Math.hypot(q.x-seat.x,q.z-seat.z)<0.3); if(!s) return null;
    if(s.table===7) return 'bar'; if(s.table===6) return 'window'; if((s.table===1||s.table===2)&&s.seatH&&s.seatH<0.6) return 'banquette'; return 'middle'; };   /* 卡座前小圓桌的椅子（稿上沒有分）＝中間那一句 */
  S.onSeat=async function(GM,seat){ const G=GM&&GM.G; if(!G||G.zone!==S.AOKI) return false; const k=S.seatKind(seat); if(!k) return false; await GM.say(null,S.L.seat[k]); return true; };

  /* ---------- 青木茶室：21:00 打烊（人還在店裡）---------- */
  let busy=false; (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['ggshops:busy']=()=>{ busy=false; };
  const sceneFree=GM=>{ if(typeof INV!=='undefined'&&INV.sceneFree) return INV.sceneFree(GM); const E=GM&&GM.E, D=GM&&GM.D; return !(E&&E.player&&E.player.busy)&&!(D&&(D.active||(D.busyDepth|0)>0)); };
  S.closingNow=G=>{ const h=hr(G); return !S.typhoon(G)&&h>=21-1e-6&&h<21.5; };
  S.outSpawn=()=>{ const q=typeof Z3!=='undefined'&&Z3.SHOP_IN&&Z3.SHOP_IN.aoki; return q&&q.out?Object.assign({},q.out):{x:-54.05,z:18,yaw:Math.PI}; };
  /* AA_700：這一趟進來時開著、或打烊那一刻＝店員「我們今天要打烊了。」（不另外出旁白；src/xs_close3d.js 的 XSCLOSE）*/
  S.closeOut=async function(GM){ const G=GM.G, P=GM.E&&GM.E.player, h=G.hour, d=G.day, g0=S.closingNow(G), gen=typeof XSCLOSE!=='undefined'&&XSCLOSE.gen?XSCLOSE.gen(GM,S.AOKI,g0):g0;
    if(gen){ GM.sceneBegin(); try{ if(P&&P.seat&&GM.standUp) GM.standUp(P); if(typeof XSCLOSE!=='undefined'&&XSCLOSE.say) await XSCLOSE.say(GM,'店員'); else await GM.say(CLERK,'我們今天要打烊了。'); } finally { GM.sceneEnd(); } }
    else if(P&&P.seat&&GM.standUp) GM.standUp(P);
    await GM.enter('gongguan',S.outSpawn());
    if(!gen&&typeof PLACES!=='undefined'&&PLACES.closedText) GM.toast(PLACES.closedText(S.AOKI,h,d),5000);
    return gen?'close':'out'; };
  S.tick=function(GM){ const G=GM&&GM.G; if(!G||G.zone!==S.AOKI||busy||GM.titleIdle||!sceneFree(GM)||S.aokiOpen(G)) return false;
    busy=true; S.closeOut(GM).catch(e=>console.warn('GGS.tick',e)).finally(()=>{ busy=false; }); return true; };

  /* ---------- 微波：今天買了微波義大利麵（便利店結帳 → EAT.ordered）---------- */
  if(typeof EAT!=='undefined'&&EAT.ordered&&!EAT._ggs){ EAT._ggs=true; const o0=EAT.ordered; EAT.ordered=function(GM,key,item){ try{ if(key==='公館的便利商店'&&item===S.HEAT_ITEM&&GM&&GM.G){ (GM.G.flags||(GM.G.flags={})).CVS_HEAT=GM.G.day; } }catch(e){} return o0.apply(this,arguments); }; }

  /* ---------- 約去青木茶室：沒有自己句子的人＝一般那句（AA_653 第 3 節）---------- */
  if(typeof INV!=='undefined'&&INV.personal&&!INV._ggs){ INV._ggs=true; const p0=INV.personal; INV.personal=function(G,id,P,day,h,r){ const out=p0.apply(this,arguments);
      if(P&&P.id==='aoki'&&out&&out.res==='accept'&&!(Array.isArray(out.lines)&&out.lines.length)&&typeof INVITE_DATA!=='undefined'&&INVITE_DATA.aokiAcc0) return Object.assign({},out,{lines:[INVITE_DATA.aokiAcc0]}); return out; }; }
  if(typeof SOCIAL!=='undefined'&&SOCIAL.MEMORY_LABEL) SOCIAL.MEMORY_LABEL.AOKI_TOGETHER=SOCIAL.MEMORY_LABEL.AOKI_TOGETHER||'一起去青木茶室';

  /* ---------- 接到遊戲 ---------- */
  if(typeof STORY!=='undefined'){
    if(Array.isArray(STORY.TICKS)&&!STORY.TICKS.includes(S.tick)) STORY.TICKS.push(S.tick);
    if(!STORY._ggs){ STORY._ggs=true;
      if(STORY.interact){ const oi=STORY.interact; STORY.interact=async function(it,GM){ if(await S.interact(it,GM)) return true; return oi.apply(this,arguments); }; }
      const os=STORY.onSeat; STORY.onSeat=async function(GM,seat){ try{ S.yjOnSeat(GM,seat); }catch(e){ console.warn('GGS.yjOnSeat',e); }   /* 頁間：坐下就捧書／喝（在其他坐下的事件之前套好姿勢）*/
        const r=os?await os.apply(this,arguments):false; try{ if(GM&&GM.G&&GM.G.zone===S.AOKI) await S.onSeat(GM,seat); }catch(e){ console.warn('GGS.onSeat',e); } return r; }; } }
  return S;
})();
