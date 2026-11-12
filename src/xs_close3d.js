/* 打烊：所有有營業時間、走得進去的店，到打烊時間人還在店裡＝店員（只有老闆在顧的店＝老闆）一句「我們今天要打烊了。」、走出店門站到門口外面，不另外出旁白
   （AA_700，企劃線 4f60052c8；使用者 11-05 06:4x：「打烊時間到了就直接安排一個店員說我們今天要打烊了然後玩家就出店面」；取代 AA_695 第 4 節、AA_699 第 1 節和各家原本的打烊旁白；CLOSE-UNIFY-1105）。
   - 這裡管的店（S.ZONES）：新生南路（山嵐、南洋兩廳、大步、好拍）、新生運動廣場、2:30 AM、溫州街五間（SUNNY SIDE、阿德影印、一盞、林家乾麵、小路）、慢輪單車、118 巷九間（l118_<id>）、竹葉亞洲超市（美國）。
   - 自己有打烊系統的店照舊走自己的（afar、Daybreak、洋洋鹹酥雞、轉角唱片＝gg2shops3d.js（洋洋是老闆說）；青木＝ggshops_sys3d.js；日常失速＝offbeat_sys3d.js；木曜日＝mokuyobi_sys3d.js；同弦＝guitar3d.js），
     那一句一律叫這裡的 S.say／S.gen（S.PLACE_OF：這裡只記「這一趟進來的時候店開著」）。
   - 24 小時的店（日和便利店 cvs、大口漢堡 xs_dakou）不在表上：沒有這一句。總圖、法圖、社科圖不是店，照舊（story3d.js 的館員那一句）。
   - 什麼時候說那一句（S.gen）：那天最後一段營業結束（中午休息、下午再開的不算：不到 6 小時又開＝只請你出去、寫開放時間），而且
     ①這一趟進來的時候店還開著（S.tick 記；正在坐著轉暗的那一段不打斷，結束以後才出這一句，晚多久都一樣）或 ②現在是打烊那一刻（打烊後半小時內）。
     颱風天、讀檔回到打烊以後、中午休息＝走出去、寫開放時間（PLACES.closedText；118 巷沒有那一句：只走出去）。
   - 走到哪：表上的 out()（新生南路的店門外、118 巷店門口）；沒有的＝那個區域的出口按鈕（E.interactables 的 exit，to 對得上的那一個）。
   - 每 0.5 秒（STORY.TICKS）看一次；場景忙（sceneFree 假）就等；不存檔、不加旗標。測試：node tests/close_unify_unit.js、node tests/xs_close_unit.js */
const XSCLOSE=(function(){
  const S={};
  S.LINE='我們今天要打烊了。';   /* AA_700 原句 */
  S.CLERK='店員'; S.BOSS='老闆'; S.BOSSLADY='老闆娘';   /* 老闆娘顧的店（118 巷滇香、家常菜）說話人寫「老闆娘」，字一樣（AA-C 11-05 08:10）*/
  S.say=function(GM,who){ return GM.say({name:who||S.CLERK},S.LINE); };
  const PL=()=>typeof PLACES!=='undefined'?PLACES:null;
  const hr=G=>(((+G.hour)||0)%24+24)%24;
  const XS=(place,who,out)=>({place,who,to:'xinsheng',out});
  const xs=id=>()=>typeof XSS!=='undefined'&&XSS.streetOut&&XSS.streetOut(id);
  const L118S=id=>typeof L118!=='undefined'&&L118.shop?L118.shop(id):(typeof LANE118_SHOPS!=='undefined'?(LANE118_SHOPS.shops||[]).find(s=>s.id===id)||null:null);
  const wdOf=day=>typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(day).wd%7:null;
  /* 118 巷：營業時間在 src/data/lane118_shops.js（L118.isOpen：公休那兩週也算）；出去＝店門口的人行道（配置的 street.spawn_out）*/
  const l118=(id,who)=>({who,to:'lane118',
    open:G=>typeof L118!=='undefined'&&L118.isOpen?L118.isOpen(id,G):true,
    wins:day=>{ const s=L118S(id); if(!s||!s.hours) return null; const w=wdOf(day); return w!=null&&(s.hours.closed||[]).includes(w)?[]:(s.hours.open||[]); },
    typhoon:()=>false, closedText:()=>'',
    out:()=>{ const L=typeof L118_SHOP_LAYOUTS!=='undefined'&&L118_SHOP_LAYOUTS[id], q=L&&L.street&&L.street.spawn_out; return q?{x:q.x,z:q.z,yaw:q.yaw}:null; }});
  /* 一盞：AA_657 打烊後的那一桌（2029-04-26，門開到 21:00）不請你出去；吃完（YT_FAMILY_DINNER，「回去的路上」）那一晚只走出去、不說 */
  const fdDay=G=>typeof AA187!=='undefined'&&AA187.FD_DAY&&typeof STORY!=='undefined'&&STORY.dayOfKey&&G.day===STORY.dayOfKey(AA187.FD_DAY);
  /* 說話的人：有店員的店＝店員；只有老闆在顧的店（好拍、同弦這種）＝老闆（AA_700）。118 巷照 L118.STAFF：老闆、老闆娘＝老闆；店員、店長、自助餐的阿姨＝店員 */
  S.ZONES={
    xs_shanlan:XS('xs_shanlan',S.CLERK,()=>typeof SH3!=='undefined'&&SH3.streetOut&&SH3.streetOut()),
    xs_nanyang:XS('xs_nanyang',S.CLERK,()=>typeof NY3!=='undefined'&&NY3.streetOut&&NY3.streetOut()),
    xs_nanyang_hall:XS('xs_nanyang',S.CLERK,()=>typeof NY3!=='undefined'&&NY3.streetOut&&NY3.streetOut()),
    xs_dabu:XS('xs_dabu',S.CLERK,xs('dabu')),
    xs_haopai:XS('xs_haopai',S.BOSS,xs('haopai')),
    xs_xsports:XS('xs_xsports',S.CLERK,()=>typeof XP3!=='undefined'&&XP3.streetOut&&XP3.streetOut()),
    cafe:{place:'cafe',who:S.CLERK,to:'wenzhou'},
    wz_brunch:{place:'wz_brunch',who:S.CLERK,to:'wenzhou'},
    wz_print:{place:'wz_print',who:S.BOSS,to:'wenzhou'},   /* 阿德一個人顧（打工的玩家是他請的）*/
    wz_teahouse:{place:'wz_teahouse',who:S.CLERK,to:'wenzhou',
      open:G=>(typeof AA187!=='undefined'&&AA187.fdDoorOpen&&AA187.fdDoorOpen(G))||S.placeOpen('wz_teahouse',G),
      quiet:G=>fdDay(G)&&!!(G.flags&&G.flags.YT_FAMILY_DINNER)},
    wz_lin:{place:'wz_lin',who:S.BOSS,to:'wenzhou'},
    wz_teishoku:{place:'wz_teishoku',who:S.BOSS,to:'wenzhou'},
    bikeshop:{place:'bikeshop',who:S.BOSS,to:'gongguan'},
    us_asian_market:{place:'us_asian_market',who:S.CLERK},
    l118_dian:l118('dian',S.BOSSLADY), l118_self:l118('self',S.CLERK), l118_tea:l118('tea',S.CLERK), l118_home:l118('home',S.BOSSLADY), l118_cafe2:l118('cafe2',S.CLERK),
    l118_pasta:l118('pasta',S.BOSS), l118_korea:l118('korea',S.BOSS), l118_omu:l118('omu',S.CLERK), l118_noodle2:l118('noodle2',S.BOSS) };
  /* 自己有打烊系統的店（這裡只記「進來的時候開著」，給 S.gen 用）；說話的人在各自的檔案（S.WHO 只是對照，測試用）*/
  S.PLACE_OF={afar:'afar',daybreak:'daybreak',aoki:'aoki',wz_offbeat:'wz_offbeat',wz_mokuyobi:'wz_mokuyobi',xs_tongxian:'xs_tongxian',yangyang:'yangyang',corner_records:'corner_records'};
  S.WHO={afar:S.CLERK,daybreak:S.CLERK,aoki:S.CLERK,wz_offbeat:S.CLERK,wz_mokuyobi:S.BOSS,xs_tongxian:S.BOSS,yangyang:S.BOSS,corner_records:S.CLERK};   /* 轉角唱片（CORNER-IN-1107）：店員；正在試聽（場景忙）＝聽完才說（AA_725 第 7 節＝AA_700）*/   /* 洋洋鹹酥雞（YANGYANG-IN-1107）：老闆在顧，說這裡的那一句（AA_724 第 7 節 bf5c3e6c6＝AA_700；gg2shops3d.js 叫 S.say）*/
  S.lineOf=z=>S.ZONES[z]||S.PLACE_OF[z]?S.LINE:null;
  S.whoOf=z=>S.ZONES[z]?S.ZONES[z].who:(S.WHO[z]||null);
  const sceneFree=GM=>{ if(typeof INV!=='undefined'&&INV.sceneFree) return INV.sceneFree(GM); const E=GM&&GM.E, D=GM&&GM.D; return !(E&&E.player&&E.player.busy)&&!(D&&(D.active||(D.busyDepth|0)>0)); };
  S.placeOpen=(k,G)=>{ const P=PL(); return !P||!P.isOpen||P.isOpen(k,G.hour,G.day); };
  S.isOpen=(k,G)=>S.placeOpen(k,G);   /* 舊的介面（place, G）*/
  const entry=z=>S.ZONES[z]||(S.PLACE_OF[z]?{place:S.PLACE_OF[z]}:null);
  const openOf=(C,G)=>C.open?C.open(G):S.placeOpen(C.place,G);
  /* 某一天的營業時段 [[開,關]…]：null＝沒有營業時間（24 小時）*/
  S.windows=function(place,day){ const P=PL(), o=P&&P.hours&&P.hours[place]; if(!o) return null; if(o.rules){ const w=P.windowsOf?P.windowsOf(place,day):null; return Array.isArray(w)?w:[]; }
    return o.open!=null&&o.close!=null?[[o.open,o.close]]:null; };
  const winsOf=(C,day)=>C.wins?C.wins(day):S.windows(C.place,day);
  const typhoonOf=(C,G)=>C.typhoon?C.typhoon(G):!!(PL()&&PL().typhoonClosed&&PL().typhoonClosed(C.place,G.day));
  /* 那天最後一段營業結束了（下一段開門在 6 小時以後、或沒有）＝打烊；中午休息、下午再開＝不是 */
  S.finalClose=function(z,G){ const C=typeof z==='string'?entry(z):z; if(!C) return true; const h=hr(G); let next=Infinity;
    for(const [d,off] of [[G.day,0],[G.day+1,24]]){ for(const w of (winsOf(C,d)||[])){ const a=w[0]+off; if(a>h+1e-6&&a<next) next=a; } }
    return next-h>=6-1e-6; };
  /* 打烊那一刻（最後一段結束後半小時內；過了半夜才關的店算前一天的）*/
  S.closingMoment=function(z,G){ const C=typeof z==='string'?entry(z):z; if(!C) return false; const h=hr(G);
    for(const [d,off] of [[G.day,0],[G.day-1,-24]]){ const ws=winsOf(C,d)||[]; if(!ws.length) continue; const c=Math.max(...ws.map(w=>w[1]))+off; if(h>=c-1e-6&&h<c+0.5) return true; }
    return false; };
  /* 這一趟進來的時候店開著（GM.enterN：換一次區域就是新的一趟；讀檔進來＝新的一趟、還沒看到開著）*/
  const seen={};
  S.markSeen=function(GM){ const G=GM&&GM.G, C=G&&entry(G.zone); if(!C) return false; if(openOf(C,G)){ seen[G.zone]=GM.enterN|0; return true; } return false; };
  S.seenOpen=(GM,z)=>seen[z]===(GM.enterN|0);
  S._resetSeen=()=>{ for(const k in seen) delete seen[k]; };
  /* 要不要說那一句：hourGen＝各家系統自己算的「打烊那一刻」（有就算）*/
  /* 玩家那天在這間店打工（JOBS.ZONE_KEY：阿德影印、SUNNY SIDE、一盞、2:30 AM…）＝店裡的人：下班照打工的流程走出去，不說打烊那句（AA-C 11-05 08:10）*/
  S.staffToday=(G,z)=>{ const J=typeof JOBS!=='undefined'?JOBS:null, k=J&&J.ZONE_KEY&&J.ZONE_KEY[z]; return !!(k&&J.worked&&J.worked(G,k,G.day)); };
  S.gen=function(GM,z,hourGen){ const G=GM.G, C=entry(z); if(!C) return !!hourGen; if(typhoonOf(C,G)||!S.finalClose(C,G)||(C.quiet&&C.quiet(G))||S.staffToday(G,z)) return false;
    return !!hourGen||S.closingMoment(C,G)||S.seenOpen(GM,z); };
  S.closedText=function(z,G){ const C=S.ZONES[z]; if(!C||(C.quiet&&C.quiet(G))) return ''; if(C.closedText) return C.closedText(G); const P=PL(); return P&&P.closedText?P.closedText(C.place,G.hour,G.day):''; };
  /* 出去站哪：表上的 out()；沒有＝這個區域的出口按鈕 */
  S.outOf=function(GM,z){ const C=S.ZONES[z]||{}; const s=C.out&&C.out(); if(s) return {to:C.to||'xinsheng',spawn:Object.assign({},s)};
    const IT=(GM&&GM.E&&GM.E.interactables)||[]; const it=IT.find(q=>q&&q.exit&&q.exit.to&&q.exit.to!==z&&(!C.to||q.exit.to===C.to))||IT.find(q=>q&&q.exit&&q.exit.to&&q.exit.to!==z);
    if(it) return {to:it.exit.to,spawn:it.exit.spawn?Object.assign({},it.exit.spawn):undefined};
    return {to:C.to||'xinsheng',spawn:undefined}; };
  S.outSpawn=z=>{ const C=S.ZONES[z], s=C&&C.out&&C.out(); return s?Object.assign({},s):null; };
  S.closeOut=async function(GM){ const G=GM.G, z=G.zone, C=S.ZONES[z], P=GM.E&&GM.E.player, gen=S.gen(GM,z), txt=gen?'':S.closedText(z,G), o=S.outOf(GM,z);
    GM.sceneBegin(); try{ if(P&&P.seat&&GM.standUp) GM.standUp(P); if(gen) await S.say(GM,C.who); } finally { GM.sceneEnd(); }
    await GM.enter(o.to,o.spawn);
    if(txt&&GM.toast) GM.toast(txt,5000);
    return gen?'close':'out'; };
  let busy=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['xs_close3d:busy']=()=>{ busy=false; };   /* 讀檔時放開 */
  S.tick=function(GM){ const G=GM&&GM.G; if(!G||GM.titleIdle) return false; if(S.markSeen(GM)) return false;
    const C=S.ZONES[G.zone]; if(!C||busy||!sceneFree(GM)||openOf(C,G)) return false;
    if(typeof JOBS!=='undefined'&&JOBS.early&&JOBS.early(G,G.zone)) return false;   /* 開店以前就要上班的班（花序週六 09:00，AA_829）：有班的人不請出去 */
    busy=true; S.closeOut(GM).catch(e=>console.warn('XSCLOSE.tick',e)).finally(()=>{ busy=false; }); return true; };
  if(typeof STORY!=='undefined'&&Array.isArray(STORY.TICKS)&&!STORY.TICKS.includes(S.tick)) STORY.TICKS.push(S.tick);
  return S;
})();
if(typeof globalThis!=='undefined') globalThis.XSCLOSE=XSCLOSE;
