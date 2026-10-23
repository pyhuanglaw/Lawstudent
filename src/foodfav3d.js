/* ===== 她們各自喜歡吃的東西（FOOD-FAV-1023；使用者 2026-10-23 原本抱怨「點食物和飲料有點跟沒點都沒差別」，選擇題選 C）=====
   台詞照抄 AA_410（企劃線 86016b84，src/data/food_fav_lines.js）；這裡只有程式。吃東西不加體力照舊（DL-02），不做短效加成。
   格式照芷若的「熱可可加濃縮」（src/data/events.js 的 ev_cafe_barista_zhiruo：treat）：點完自己的，多一個「也幫她點」→ 品項 →（有的話）小選項。
   - 選對（品項對、小選項選對的那個；沛珊沒有小選項）：她的兩句（以安交往中多一行旁白；學姊演過 AA_284 2-3 第 5 段＝換「又是她說的。」那兩句）、
     熟悉 +2、她的戀愛 +1、記憶 REMEMBERED_HER（每人一次），之後不再問。
   - 只點品項（小選項選另一個）：那一句；點錯品項：那一句。不扣分、不加分，下次還可以再點。錢照那一樣的價錢扣（Café 照拿鐵 120，和芷若那一杯一樣）。
   - 小選項對的那個放在第一個（照芷若：「加一份濃縮」「不加」），品項選了哪一樣、小選項的畫面都一樣。
   - 第一次知道（知道以前照樣可以點，只是要靠猜）：以安、沛珊＝在蛋包飯研究所一起吃、她說了現有那句（AA_280 第 3 節，L118.order 的常客那一句）；
     語彤＝大二上起和她在滇香一起吃過一次以後，玩家下一次（別天）自己來，老闆娘兩句（KNOW_FAV_YT；稿上說排在 AA_311 H8 之後，H8 還沒做）；
     子晴＝12～2 月在 Café、她在店裡，點餐的時候「看」到她的杯子（一句旁白，KNOW_FAV_ZQ）；學姊＝AA_311 H1 店員那兩句（SIS_TEA_ORDER）；
     芷若＝Z3（ASKED_HER_DRINK）；可昕＝第一次帶了有糖的青茶（她那兩句，KNOW_FAV_KX）。知道了（或選對了）＝筆記本記第 1 節那一行（GM.addNote，id fav_<人>）。
   - 在哪裡問：以安、沛珊、語彤、學姊＝118 巷那間店門口的常客一起進來吃（L118.order 的 companions：以安週五、沛珊週三到 2026-12-16 在蛋包飯研究所；語彤大二上起週一在滇香；
     學姊大一平日 12:30 在一一八茶飲）；子晴＝她在 Café 的時候點餐（story3d.js 的 counter，芷若在班的點餐事件也接在最後）；
     可昕＝她沒有日常作息：學期末約會（termend3d.js 的 kexinDinner）出發前一小時內，在溫州街的巷口茶飲多一個「帶一杯給可昕」，約會開頭、她的第一句之前演她的反應。
   - 以安、沛珊、語彤、學姊選對的那一次，店裡吃完的常客那一句不說（她剛才那兩句代替；不然以安會在「那這一半給你」之後又說一次「只吃得下半份」）。
   存檔：G.fav＝{know:{人:第幾天}, right:{人:第幾天}, ytWith:和語彤在滇香一起吃的那一天, kx:{id 出遊, term, item, oi, day}}（帶給可昕、還沒到約會的那一杯）；舊存檔沒有＝從空的開始。
   接線（各一兩行）：lane118.js 的 order、story3d.js 的 counter、events.js 芷若點餐事件的 after_treat（{call}，events3d.js）、wzshops3d.js 的 order364（巷口茶飲）、
   termend3d.js 的 kexinDinner、sis_grad3d.js 的 playSeg（第 5 段記 SISG_SEG5）。測試：node tests/aa410_food_fav_unit.js */
'use strict';
const FAV=(function(){
  const S={};
  const L=()=>typeof FOOD_FAV_LINES!=='undefined'?FOOD_FAV_LINES:null;
  const nm=id=>typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(id):id;
  const has=(id,tag)=>{ try{ return typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(id,tag); }catch(e){ return false; } };
  /* 每個人：店（118 巷的店 id／cafe／wz_tea）、對的品項、小選項（第一個是對的；null＝沒有）、選項上的稱呼、一份／一杯。品項＝那間店的菜單（Café 照芷若那一杯的四樣）*/
  S.CAFE_ITEMS=[['拿鐵',120],['美式',120],['熱可可',120],['紅茶',120]];
  S.CFG={
    heroine_01:{shop:'omu',right:'咖哩蛋包飯',opt:['多要一個盤子','不用'],short:'以安',unit:'份'},
    classmate_peishan:{shop:'omu',right:'番茄醬蛋包飯',opt:null,short:'沛珊',unit:'份'},
    heroine_03:{shop:'dian',right:'酸辣河粉',opt:['多加辣','不加'],short:'語彤',unit:'份'},
    heroine_05:{shop:'tea',right:'無糖綠茶',opt:['去冰','正常冰'],short:'學姊',unit:'杯'},
    heroine_04:{shop:'cafe',right:'美式',opt:['冰的','熱的'],short:'子晴',unit:'杯'},
    kexin:{shop:'wz_tea',right:'青茶',opt:['無糖','半糖'],short:'可昕',label:'帶一杯給可昕'}
  };
  S.KNOW_TAG={heroine_03:'KNOW_FAV_YT',heroine_04:'KNOW_FAV_ZQ',kexin:'KNOW_FAV_KX'};
  S.rec=function(G){ const R=G.fav&&typeof G.fav==='object'?G.fav:(G.fav={}); for(const k of ['know','right']) if(!R[k]||typeof R[k]!=='object'||Array.isArray(R[k])) R[k]={}; return R; };
  S.lines=id=>(L()&&L()[id])||null;
  /* 知道了沒（以安、沛珊、語彤、子晴、可昕記在 G.fav.know；語彤、子晴、可昕也有記憶；芷若＝ASKED_HER_DRINK；學姊＝SIS_TEA_ORDER）*/
  S.know=function(G,id){ const R=S.rec(G); if(R.know[id]!=null) return true; const F=G.flags||{};
    if(id==='heroine_02') return has(id,'ASKED_HER_DRINK'); if(id==='heroine_05') return !!F.SIS_TEA_ORDER;
    const T=S.KNOW_TAG[id]; return !!(T&&has(id,T)); };
  /* 選對過沒（記憶一個人最多留 80 筆，G.fav.right 另外記一份）*/
  S.right=(G,id)=>S.rec(G).right[id]!=null||has(id,'REMEMBERED_HER');
  /* 筆記本那一行（同一個 id 只記一次：GM.addNote 自己會擋）*/
  S.note=function(GM,id){ const t=L()&&L().note&&L().note[id]; if(!t||!GM||!GM.addNote) return false; if(GM.hasNote&&GM.hasNote('fav_'+id)) return false; return GM.addNote('fav_'+id,t,''); };
  S.learn=function(GM,id){ const G=GM.G, R=S.rec(G); if(R.know[id]==null) R.know[id]=G.day; const T=S.KNOW_TAG[id]; if(T&&typeof SOCIAL!=='undefined'&&!has(id,T)) SOCIAL.remember(id,T,''); S.note(GM,id); };
  /* 別的地方記下「知道」的（芷若 Z3、學姊 H1）、舊存檔：補筆記本那一行（STORY.TICKS，每 0.5 秒；已經有的不重複）*/
  S.sync=function(GM){ const G=GM&&GM.G; if(!G||!L()) return 0; let n=0; for(const id of Object.keys(L().note)) if(S.know(G,id)||S.right(G,id)){ if(S.note(GM,id)) n++; } return n; };
  S.items=function(id){ const C=S.CFG[id]; if(!C) return [];
    if(C.shop==='cafe') return S.CAFE_ITEMS.slice();
    if(C.shop==='wz_tea') return typeof WZS!=='undefined'&&WZS.AA364&&WZS.AA364.tea?WZS.AA364.tea.menu.map(m=>[m[0],m[1]]):[];
    const s=typeof L118!=='undefined'&&L118.shop?L118.shop(C.shop):null; return s?s.menu.map(m=>[m[0],m[1]]):[]; };
  S.outcome=function(id,item,oi){ const C=S.CFG[id]; if(!C||item!==C.right) return 'wrong'; return (!C.opt||oi===0)?'right':'itemOnly'; };
  const sp=(GM,w,me)=>{ if(w==null) return null; if(me&&me.charId===w) return me; if(typeof CHARACTERS!=='undefined'&&CHARACTERS[w]) return (GM.npc&&GM.npc[w])||{name:nm(w),charId:w}; return {name:w}; };
  S.play=async function(GM,arr,me){ if(!Array.isArray(arr)||!arr.length) return false; for(const [w,t] of arr) await GM.say(sp(GM,w,me),t); return true; };
  /* 「也幫她點」→ 品項 → 小選項 → 扣錢；回傳 {item,oi}，沒點＝null */
  S.pick=async function(GM,id){ const G=GM.G, C=S.CFG[id]; if(!C) return null;
    const k=await GM.choose([{t:C.label||('也幫'+C.short+'點一'+C.unit)},{t:'（就這樣）'}]); if(k!==0) return null;
    const items=S.items(id); if(!items.length) return null;
    const io=await GM.choose(items.map(([n,p])=>({t:n+'　'+p+' 元',dim:(G.money|0)<p}))); const it=items[io]||items[0];
    if((G.money|0)<it[1]){ if(GM.toast) GM.toast('錢不夠'); return null; }
    let oi=-1; if(C.opt) oi=await GM.choose(C.opt.map(t=>({t})));
    if(GM.money) GM.money(-it[1],'餐費');
    return {item:it[0],oi}; };
  S.gotRight=function(GM,id,item,oi){ const G=GM.G, R=S.rec(G), C=S.CFG[id]; if(S.right(G,id)) return false; R.right[id]=G.day;   /* 每人一次 */
    if(typeof SOCIAL!=='undefined'){ SOCIAL.adjust(id,{fam:2,npcRom:1}); if(!has(id,'REMEMBERED_HER')) SOCIAL.remember(id,'REMEMBERED_HER',item+(C&&C.opt&&oi===0?'，'+C.opt[0]:'')); }
    S.note(GM,id); return true; };
  /* 她的反應：選對／只點品項（可昕還不知道＝第一次知道那兩句）／點錯；稿裡沒有的組合（null）不說話 */
  S.react=async function(GM,id,res,item,oi,me){ const G=GM.G, F=G.flags||{}, D=S.lines(id)||{}; let arr=null;
    if(res==='right'){ arr=(id==='heroine_05'&&F.SISG_SEG5!=null&&D.rightAgain)?D.rightAgain:D.right; if(id==='heroine_01'&&F.dating_heroine_01&&D.rightDating) arr=(arr||[]).concat(D.rightDating); }
    else if(res==='itemOnly'){ if(id==='kexin'&&D.know&&!S.know(G,id)){ arr=D.know; S.learn(GM,id); } else arr=D.itemOnly||null; }
    else { const W=D.wrong||{}; arr=Object.prototype.hasOwnProperty.call(W,item)?W[item]:(W['*']||null); }
    await S.play(GM,arr,me);
    if(res==='right') S.gotRight(GM,id,item,oi);
    return res; };
  S.treat=async function(GM,id,me){ const r=await S.pick(GM,id); if(!r) return null; return S.react(GM,id,S.outcome(id,r.item,r.oi),r.item,r.oi,me); };

  /* ---- 118 巷（lane118.js 的 order：點完自己的那一句之後）：一起來的常客＝也幫她點；一個人來滇香＝老闆娘那兩句（語彤）。回傳這一次選對的人 ---- */
  S.l118=async function(GM,shopId,comp){ const G=GM.G, R=S.rec(G), out=new Set(); comp=comp||[]; if(!G||!L()) return out;
    if(shopId==='dian'&&comp.includes('heroine_03')) R.ytWith=G.day;   /* 和語彤在滇香一起吃（第一次知道要先有這一次）*/
    if(!comp.length) await S.ytKnow(GM,shopId);
    for(const id of comp){ const C=S.CFG[id]; if(!C||C.shop!==shopId||S.right(G,id)) continue; if(await S.treat(GM,id)==='right') out.add(id); }
    return out; };
  S.ytKnow=async function(GM,shopId){ const G=GM.G, R=S.rec(G), id='heroine_03'; if(shopId!=='dian'||(G.stage||'law')!=='law'||S.know(G,id)||R.ytWith==null||R.ytWith>=G.day) return false;
    await S.play(GM,S.lines(id).know); S.learn(GM,id); return true; };
  /* 常客吃完的那一句說了（lane118.js）：以安、沛珊在蛋包飯研究所的那一句就是「知道」*/
  S.heard=function(GM,id,shopId){ if(shopId!=='omu'||(id!=='heroine_01'&&id!=='classmate_peishan')) return false; const G=GM.G, R=S.rec(G); if(R.know[id]!=null) return false; S.learn(GM,id); return true; };

  /* ---- 兩點半 Café（story3d.js 的 counter；芷若在班的點餐事件最後）：子晴在店裡＝12～2 月先「看」到她的杯子（一次），再也幫她點 ---- */
  S.winter=G=>{ const m=typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(G.day).m:0; return m===12||m===1||m===2; };
  S.here=function(GM,id){ const n=GM.npc&&GM.npc[id]; if(!n||n.leaving) return false; const E=GM.E; if(E&&Array.isArray(E.npcs)&&!E.npcs.includes(n)) return false; return true; };
  S.cafe=async function(GM){ const G=GM&&GM.G, id='heroine_04'; if(!G||!L()||G.zone!=='cafe'||!S.here(GM,id)||!has(id,'FIRST_MET')) return false; const kn=!S.know(G,id)&&S.winter(G), ask=!S.right(G,id); if(!kn&&!ask) return false;
    GM.sceneBegin(); try{ if(kn){ await S.play(GM,S.lines(id).know); S.learn(GM,id); } if(ask) await S.treat(GM,id); } finally { GM.sceneEnd(); } return true; };

  /* ---- 可昕：學期末約會出發前一小時內，巷口茶飲（wzshops3d.js 的 order364）多一個「帶一杯給可昕」；約會開頭（termend3d.js 的 kexinDinner）演她的反應 ---- */
  S.kxTrip=function(G){ if(typeof OUT==='undefined'||!OUT.rec||!G.flags||!G.flags.dating_kexin) return null; const now=G.day*24+G.hour;
    for(const q of OUT.rec(G)){ if(q.state!=='planned'||!q.te||q.te.kind!=='kexin') continue; const at=q.day*24+q.h, tr=OUT.trip?OUT.trip(G,q).travelH:(q.travelH||0), dep=at-tr, end=at+(q.late!=null?q.late:0.75);
      if(now>=dep-1&&now<=end) return q; } return null; };   /* 該出發的時間（約好的時間減車程）前一小時起；晚一點出發的也還可以買 */
  S.wzTea=async function(GM){ const G=GM&&GM.G, id='kexin'; if(!G||!L()) return false; const q=S.kxTrip(G); if(!q||S.right(G,id)) return false; const R=S.rec(G); if(R.kx&&R.kx.id===q.id) return false;   /* 這一趟已經帶了一杯 */
    const r=await S.pick(GM,id); if(!r) return false; R.kx={id:q.id,term:q.te.term,item:r.item,oi:r.oi,day:G.day}; return true; };
  S.kexinDate=async function(GM,te,me){ const G=GM.G, R=S.rec(G), c=R.kx; if(!c||!te||c.term!==te.term) return false; R.kx=null; if(S.right(G,'kexin')||!L()) return false;
    await S.react(GM,'kexin',S.outcome('kexin',c.item,c.oi),c.item,c.oi,me||{name:nm('kexin'),charId:'kexin'}); return true; };

  if(typeof STORY!=='undefined'&&Array.isArray(STORY.TICKS)) STORY.TICKS.push(GM=>{ try{ S.sync(GM); }catch(e){} return false; });
  return S;
})();
