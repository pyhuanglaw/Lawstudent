/* 寒暑假去她的縣市（AA_276 第 1-1、4、5 節，AA-C 13c583c9）：可昕在高雄、沛珊在台中（STORY.presence kind 'home'）的時候，手機約她的清單多一個「我去高雄找妳？」／「我去台中找妳？」。
   - 高鐵來回的錢不夠就不能約（AA_276 第 7 節）；選日子（她在老家的那幾天，最多三個）→ 玩家的那一句 → 她答應（交往中、沛珊重考消失期交往中各有自己的一句）→ 排一趟出遊（OUT.plan，當天來回、高鐵）。
   - 那一天：車站接人 → 一個地方 → 傍晚送上車（2D；第一次演 first，之後 again 三選一輪流；沛珊重考消失期演 keep，只能出來一個下午、一個月最多一次）。結束回臺北（宿舍或家）。
   - 台詞在 src/data/hometown_lines.js。測試：node tests/vac_hometown_unit.js
   - 別的城市那一組（AA_328 3-09，沛珊大三、大四的學期中在台南）：HOMETOWN_LINES['classmate_peishan@台南']，STORY.presence 回 city（或 home）＝'台南' 的時候用（S.key）；
     presence 已改台南（AA_282 第 5 節第 1、3 點，任務 PS-TAINAN-AA282）：學期中「我去台南找妳？」（出遊 ev_hv_ps_tn，回程高鐵約一小時四十分鐘）、寒暑假「我去台中找妳？」。
     沒交往、放榜後還沒重新聯絡上的玩家（presence 的 lost，AA_282 第 2 節：她不先找人）不出現。沒有視訊的選項（沒交往的不開視訊，AA_282 第 3 節）。
   - 閒聊階梯（AA_282 第 3 節）：沛珊大三上～大四下的階梯是 context:'date'，只在私下約推進——去台南那一天演完地方那一段、送上車以前接著聊一層（S.LADDER；一次推進一層，寒暑假沒有學期＝不推進）。
   - 多線交往（src/multirel3d.js MREL.hvMeet）：沛珊那一天（地方那一段演完、閒聊階梯以前）、消失期那個下午、交往中的視訊，演宥辰的第三次、《換我講一件事》、祐廷先坦白、挽回（AA_422 7-3、AA_423 6-1）。
   測試：node tests/r3_events_unit.js 第 16 節、node tests/peishan_tainan_unit.js、node tests/mrel_ps_turn_unit.js */
'use strict';
const HV=(function(){
  const S={};
  const L=id=>typeof HOMETOWN_LINES!=='undefined'?HOMETOWN_LINES[id]:null;
  const pres=(G,id,day)=>typeof STORY!=='undefined'&&STORY.presence?STORY.presence(id,day==null?G:Object.assign({},G,{day})):{here:true};
  const nm=id=>typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(id):((typeof CHARACTERS!=='undefined'&&CHARACTERS[id]&&CHARACTERS[id].name)||id);
  const dating=(G,id)=>!!(G.flags&&G.flags['dating_'+id]===true);
  const ym=day=>{ const d=CALENDAR.dateOf(day); return d.y+'-'+d.m; };
  const WD='日一二三四五六日';
  const label=day=>{ const d=CALENDAR.dateOf(day); return d.m+'/'+d.d+'（週'+WD[d.wd%7]+'）'; };
  /* 同一個人在別的城市的那一組（AA_328 3-09：沛珊大三、大四的學期中在台南）：HOMETOWN_LINES['id@城市']；STORY.presence 的 city（或 home）是那個城市就用它，沒有就用 id 那一組（寒暑假的台中、高雄照舊）*/
  S.key=function(G,id,day){ const p=pres(G,id,day), c=p&&(p.city||p.home); return c&&L(id+'@'+c)?id+'@'+c:id; };
  const away=(G,id,p,day)=>p.here===false&&(p.kind==='home'||S.key(G,id,day)!==id);   /* 寒暑假在老家（kind 'home'），或在有自己那一組的城市 */
  /* 手機約她的清單要不要多這一項：null＝不出現；{ok:false,why}＝出現但不能選（沛珊重考消失期一個月一次）*/
  S.offer=function(G,id){ if(!G||(G.stage||'law')!=='law') return null; const C=L(S.key(G,id)); if(!C) return null; const p=pres(G,id); if(!away(G,id,p)||p.lost) return null;   /* lost：還沒重新聯絡上，玩家不知道她在哪（AA_282 第 2 節）*/
    if(S.planned(G,id)) return {ok:false,why:'已經約好了'};
    if(C.fare&&(G.money|0)<C.fare) return {ok:false,why:'高鐵票錢不夠'};   /* AA_276 第 7 節第 2 點：來回 2980／1400 元，消失期例外也一樣 */
    if(p.keep&&(G.flags.HV_KEEP_M||{})[ym(G.day)]) return {ok:false,why:'這個月已經去過了（她說一個月一次）'};
    if(S.days(G,id).length) return {ok:true}; if(S.days(G,id,true).length) return {ok:false,why:'那幾天你已經約了校外約會'};   /* 她在的那幾天都撞到已經約好的校外約會 */ const to=S.backTo(G,id); return {ok:false,why:to==='台南'?(S.beenIn(G,id,to)?'她這幾天就要回台南了':'她這幾天就要去台南了'):'她這幾天就要回臺北了'}; };
  /* 寒暑假結束她回哪裡（AA_369 L9）：老家那一段結束後的 presence——沛珊大三起在台南念書（city 台南）＝回台南；其他＝回臺北 */
  S.backTo=function(G,id){ for(let d=G.day+1;d<=G.day+21;d++){ const p=pres(G,id,d); if(p&&p.here===false&&(p.kind==='home'||p.kind==='trip')) continue; return p&&p.here===false&&p.city?p.city:'臺北'; } return '臺北'; };
  /* 這一段老家以前她在不在那個城市待過（AA_369 第 7 節第 11 題：2027 暑假尾是她第一次去台南的學校＝「去台南」，之後＝「回台南」）：往回找到這一段老家的第一天，看前一天在哪 */
  S.beenIn=function(G,id,city){ for(let d=G.day;d>G.day-400;d--){ const p=pres(G,id,d-1); if(p&&p.here===false&&(p.kind==='home'||p.kind==='trip')) continue; return !!(p&&p.here===false&&p.city===city); } return false; };   /* backTo、beenIn 都跳過老家（home）和出去幾天（trip：沛珊暑假山上的營隊 2028-07-17～30、2029-07-23～27，AA_508 0-2 第 5 點）——營隊不是她「待過的城市」*/
  S.planned=(G,id)=>typeof OUT!=='undefined'&&OUT.rec(G).some(q=>q.hv&&q.hv.id===id&&q.state==='planned');
  /* 可以去的日子：明天起七天內她還在老家的（重考消失期：同一個月沒去過），最多三個；城市要和今天一樣（skipDays＝那幾天本身是別的事件，例：台南 BB_165 5-1／5-2）*/
  S.days=function(G,id,anyDate){ const out=[]; const p0=pres(G,id), k0=S.key(G,id), C=L(k0)||{}, skip=(C.skipDays||[]).map(k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null);
    for(let d=G.day+1; d<=G.day+7&&out.length<3; d++){ const p=pres(G,id,d); if(!away(G,id,p,d)||S.key(G,id,d)!==k0||skip.includes(d)) continue; if(p0.keep&&(G.flags.HV_KEEP_M||{})[ym(d)]) continue;
      if(!anyDate&&typeof DATE!=='undefined'&&DATE.tripOn&&DATE.tripOn(G,d)) continue;   /* 那一天已經約了校外約會（兩天一夜佔兩天，BUG-DATE-OVERLAP-1021）：和 skipDays 一樣跳過 */ out.push(d); } return out; };
  const msg=(G,id,from,text)=>{ if(typeof PHONE!=='undefined'&&PHONE.post) PHONE.post(G,{th:'p:'+id,from,text}); };
  /* 約（invites3d.js 的 S.flow 選了這一項）*/
  S.ask=async function(GM,id){ const G=GM.G, key=S.key(G,id), C=L(key), o=S.offer(G,id); if(!C||!o) return null; if(!o.ok){ await GM.say(null,o.why+'。'); return null; }
    const D=S.days(G,id), keep=!!pres(G,id).keep, h=keep?14:10.5; const k=await GM.choose(D.map(d=>({t:label(d),hint:'當天來回　'+C.travel+(keep?'　下午三個小時':'')})).concat([{t:'算了'}])); if(k>=D.length) return null;
    const day=D[k], me=G.name||'祐廷'; msg(G,id,'player',C.ask); await GM.say({name:me+'（手機）'},C.ask);
    const yes=keep&&C.yesKeep?C.yesKeep:(dating(G,id)&&C.yesDating?C.yesDating:C.yes); msg(G,id,id,yes); await GM.say({name:nm(id)+'（手機）',charId:id},yes);
    if(keep){ (G.flags.HV_KEEP_M||(G.flags.HV_KEEP_M={}))[ym(day)]=true; }
    OUT.plan(G,{id:'hv_'+id+'_'+day,ev:id==='kexin'?'ev_hv_kx':(key!==id&&C.ev?C.ev:'ev_hv_ps'),day,h,late:1,place:C.city,title:'去'+C.city+'找'+nm(id),travel:C.travel,travelH:C.travelH,back:'回到臺北。',hv:key!==id?{id,keep,key}:{id,keep}});
    await GM.say(null,'約好 '+label(day)+'，去'+C.city+'。'); if(GM.autosave) GM.autosave(); return day; };
  /* 那一天（ev_hv_kx／ev_hv_ps 的 beforeOuting）*/
  const sub=(G,t)=>String(t).replace(/\{name\}/g,G.name||'祐廷');
  const play=async(GM,id,arr)=>{ const G=GM.G, me={name:nm(id),charId:id}; for(const x of arr||[]){ if(typeof x==='string') await GM.say(me,sub(G,x)); else if(x.narr) await GM.say(null,x.narr); } };
  const place=async(GM,P)=>{ if(typeof ADV!=='undefined'&&ADV.setBg) ADV.setBg(typeof OUT!=='undefined'&&OUT.bg?OUT.bg(P.bg):'dark'); if(typeof ADV!=='undefined'&&ADV.log) ADV.log('',P.scene); if(GM.caption) GM.caption('',P.scene,2400); if(GM.sleep) await GM.sleep(700); };
  const toEvening=GM=>{ const G=GM.G; if(G.hour<17) GM.advance(17-G.hour); };   /* 傍晚送上車：17:00；回程的車程是事件的 hours */
  const beforeSend=async(GM,q)=>{ if(typeof OUT!=='undefined'&&OUT.runAfter) await OUT.runAfter(GM,q,null); };   /* 出遊的結尾、分開以前（OUT.AFTER；例：AA_338 第 3 題打賭的宵夜那句）＝送上車以前 */
  /* 多線交往（src/multirel3d.js，AA_422 7-3、AA_423 6-1）：沛珊在台南（消失期在台中）的那幾年，「去找她的那一次」演宥辰的第三次、《換我講一件事》、祐廷先坦白、挽回；視訊也接（宥辰、坦白、挽回）*/
  const mrel=async(GM,id,q,v)=>{ if(typeof MREL==='undefined'||!MREL.hvMeet) return false; try{ return await MREL.hvMeet(GM,id,q,v); }catch(e){ console.warn('HV mrel',e); return false; } };
  S.pickVariant=function(G,id,keep,key){ const k=key||id, C=L(k); if(keep) return 'keep'; const N=G.flags.HV_N||(G.flags.HV_N={}), n=N[k]|0;   /* key：別的城市那一組（台南）各自算第幾次 */
    const seq=q=>q===0?'first':C.again[(q-1)%C.again.length].key;
    /* HV_PRE[k]＝{v,at}：算進 HV_N、但不是在這裡演的那一趟，演的是 again 的哪一版（v）、那時候已經去過幾次（at）。
       例：大二 1/14 高雄那一天（y2r2_3d.js 的 S.khTrip）是夜市（AA_343 A4）：那一趟不佔它那時候的順位，改算用掉第一輪的夜市——
       第一次去就是 1/14 的：下一次先演 first（港邊），again 第一輪跳過夜市、從下雨開始，輪完一圈夜市照常回來 */
    const P=(G.flags.HV_PRE||{})[k]; if(P&&P.v&&n>(P.at|0)){ const s=1+C.again.findIndex(a=>a.key===P.v); let r=n-1; if(s>=1&&s>=(P.at|0)&&r>=s) r++; return seq(r); }
    return seq(n); };
  S.play=async function(GM,q){ const G=GM.G, hv=q&&q.hv, id=hv&&hv.id, key=(hv&&hv.key)||id, C=L(key); if(!C) return false; const dt=dating(G,id), v=S.pickVariant(G,id,hv.keep&&!!C.keep,key);
    if(C.fare&&GM.money) GM.money(-C.fare,'交通');   /* 高鐵來回（出發的時候付）*/
    if(typeof ADV!=='undefined'&&ADV.begin) ADV.begin({background:typeof OUT!=='undefined'&&OUT.bg?OUT.bg((v==='keep'?C.keep.pick:C.pick).bg):'dark'});
    if(v==='keep'){ await play(GM,id,C.keep.pick.lines); await place(GM,C.keep.place); await play(GM,id,C.keep.place.lines); await mrel(GM,id,q,'keep'); toEvening(GM); await beforeSend(GM,q); await play(GM,id,C.keep.send); G.flags.HV_KEEP_LAST=G.day; return true; }
    const n0=(G.flags.HV_N||{})[key]|0, mu=S.museumDue(G,id,key,q);   /* mu：這一趟是心願事件「台南・美術館」（AA_349 K3）*/
    await play(GM,id,(n0>0&&C.pickAgain?C.pickAgain:C.pick).lines);
    if(id==='kexin'&&typeof KXKHH!=='undefined'&&KXKHH.pickLine){ const t=KXKHH.pickLine(G); if(t) await play(GM,id,[t]); }   /* AA_401 第 3 節：學期末約會答應過的那一次寒暑假，第一次去，接人之後多一句 */   /* 第二次以後的接人換句（第 7 節第 1 點）；看去過幾次、不看演哪一版（1/14 去過的下一次演 first，接人照樣是 pickAgain，AA_343 A4）*/
    if(mu) await S.museum(GM,id,C.museum);
    else {
      if(v!=='first'&&C.museum&&S.knownDue(G,id)) await S.museumKnown(GM,id,C.museum);   /* 聊天提到（AA_349 K3：大三起在去台南那天「再去」接人以後）*/
      const P=v==='first'?C.first:C.again.find(a=>a.key===v); await place(GM,P); await play(GM,id,P.lines); if(dt&&P.dating) await play(GM,id,P.dating);
      const O=(P.opts||[]).filter(o=>!o.dating||dt); if(O.length){ const k=await GM.choose(O.map(o=>({t:'「'+o.t+'」'}))); await GM.say({name:G.name||'祐廷'},O[k].t); await play(GM,id,O[k].say); }
      if(typeof C.extra==='function') await play(GM,id,C.extra(G)||[]); }   /* 那一組自己多的一段（台南：沒交往的玩家當面看孩子的作業，AA_328 3-19 裁定 25）*/
    await mrel(GM,id,q,v);
    await S.ladder(GM,id);   /* 私下約接著聊一層閒聊階梯（AA_282 第 3 節；AA_349 K4：去台中那一天也算）*/
    toEvening(GM); await beforeSend(GM,q); { const fx=x=>typeof x==='function'?x(G,n0):x, sn=fx(C.send.narr); if(sn) await GM.say(null,sn); await play(GM,id,fx(dt?C.send.dating:C.send.other)); }   /* 送行句可以照日子換（沛珊：考上台南以前／以後）、照第幾次換（n0＝這一趟以前去過幾次；沛珊台南 AA_447 1-2）*/
    const N=G.flags.HV_N||(G.flags.HV_N={}); N[key]=n0+1; (G.flags.HV_LAST||(G.flags.HV_LAST={}))[key]=G.day;
    if(C.visitsFlag) G.flags[C.visitsFlag]=N[key];
    if(mu) (G.flags.HV_PRE||(G.flags.HV_PRE={}))[key]={v:'museum',at:n0};   /* 美術館那一趟算進去過幾次（之後的接人是 pickAgain），不佔「第一次／再去」的順位（照 HV_PRE 的算法：下一次演它本來那一版）*/
    else if(C.lastFlag&&v!=='first') G.flags[C.lastFlag]=v;   /* 台南：PS_TAINAN_VISITS（去了幾次）、PS_AGAIN_LAST（上一次是哪一版）*/
    if(S.visitCounts(G,id)&&typeof DATE!=='undefined'&&DATE.countVisit) DATE.countVisit(G,id,C.city,{wish:mu});   /* AA_349 K3：去台南、去台中那一天＝一次正式校外約會 */
    return true; };
  /* 沛珊放榜以後（presence.noTaipei 那天起：她不上來）的私下約＝正式校外約會（AA_349 K3）；之前（大一、大二寒暑假去台中、重考期的那一個下午）照舊不算 */
  S.visitCounts=function(G,id){ const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[id], k=c&&c.presence&&c.presence.noTaipei, d=k&&typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null; return d!=null&&G.day>=d; };
  /* ---------- 心願事件「台南・美術館」（AA_349 K3，第②級；BB_128 3-4 大三起改在台南；台詞在 hometown_lines.js 的 museum）----------
     她的心願地點 D06（臺北市立美術館）大三起去不了（她不上來）：同一個心願事件改在去台南的那一天。大二上以前在臺北去過 D06 的照舊算完成（DATE.log 的 wish）。
     - 聊天提到（wishKnown）：去台南「再去」的那幾次（不是第一次），接人以後；第 4 階以上。
     - 她主動約（手機，S.museumPhone）：雙方都單身或她是祐廷的女友、第 5 階以上；學期中第 3 週起的晚上 21:00，每學期最多一次（時間是 LAWWW 暫排）。答應＝下一次去台南就是美術館（PS_MUSEUM 'yes'）。
     - 玩家主動約：校外約會的地點清單多一個「台南・美術館」（date3d.js 的 S.menu；選日子照去台南），她回的那兩句看知不知道。
     - 那一天：接人 → 台南・美術館（抵達、互動點照 D06 的四個、〈無題〉）→ 閒聊階梯 → 送上車。結算照 AA_128 5-3（第一次、心願）：WISH_DONE、記憶 PS_UNTITLED、相簿的明信片 */
  S.wishDone=(G,id)=>!!(G.flags&&G.flags['WISH_DONE_'+id])||!!(typeof DATE!=='undefined'&&DATE.log&&DATE.log(G,id).wish);
  S.museumDue=function(G,id,key,q){ const C=L(key); if(!C||!C.museum||S.wishDone(G,id)) return false; return !!(q&&q.hv&&q.hv.museum)||(G.flags&&G.flags.PS_MUSEUM)==='yes'; };
  S.knownDue=function(G,id){ if(typeof DATE==='undefined'||!DATE.log||S.wishDone(G,id)) return false; return !DATE.log(G,id).wishKnown&&DATE.stageNum(id)>=4; };
  const opt=o=>o.act?o.t:'「'+o.t+'」';   /* 動作的選項（（聽她說完））不加引號、祐廷不說話 */
  const choice=async(GM,id,opts,args)=>{ const G=GM.G; const k=await GM.choose(opts.map(o=>({t:opt(o)}))), o=opts[k]||opts[0]; if(!o.act) await GM.say({name:G.name||'祐廷'},o.t);
    const say=typeof o.say==='function'?o.say.apply(null,[G].concat(args||[])):o.say; await play(GM,id,say); return k; };
  S.museumKnown=async function(GM,id,M){ const G=GM.G; await play(GM,id,M.known.lines); await choice(GM,id,M.known.opts); if(typeof DATE!=='undefined'&&DATE.knowWish) DATE.knowWish(G,id); return true; };
  S.museum=async function(GM,id,M){ const G=GM.G, dt=dating(G,id), st=typeof DATE!=='undefined'&&DATE.stageNum?DATE.stageNum(id):5, hi=dt||st>=6;
    await place(GM,{scene:M.scene,bg:M.bg}); const loc=typeof DATE!=='undefined'&&DATE.loc?DATE.loc(M.loc)||{}:{}; if(loc.admission&&GM.money) GM.money(-loc.admission,M.name+' 門票');   /* 門票照 D06 */
    await play(GM,id,M.arrive); if(dt) await play(GM,id,M.arriveDating); else if(st>=6) await play(GM,id,M.arriveHigh);
    const pts=(typeof DATE!=='undefined'&&DATE.points?DATE.points(M.loc):[]).filter(p=>M.points[p.id]), done=[];
    while(done.length<pts.length){ const left=pts.filter(p=>!done.includes(p.id)); const O=left.map(p=>({t:p.name,hint:(p.min|0)+' 分'+(p.cost?'　'+p.cost+' 元':'')})); if(done.length) O.push({t:'差不多了'});
      const k=await GM.choose(O); if(k>=left.length) break; const p=left[k], X=M.points[p.id]; done.push(p.id);
      await play(GM,id,X.lines); await choice(GM,id,X.opts,[hi]); if(GM.advance) GM.advance((p.min|0)/60); if(p.cost&&GM.money) GM.money(-p.cost,p.name);
      if(typeof DATE!=='undefined'&&DATE.likeOf&&DATE.LIKE&&typeof SOCIAL!=='undefined'&&SOCIAL.adjust){ const lk=DATE.LIKE[DATE.likeOf(id,p.id)]; if(lk&&Object.keys(lk).length) SOCIAL.adjust(id,lk); } }   /* 她喜不喜歡照 D06（DATE-S6）*/
    const X=M.close; await play(GM,id,X.lines); await choice(GM,id,X.opts); await play(GM,id,X.after); await play(GM,id,dt?X.endDating:(st>=6?X.end6:X.end5));   /* 收尾〈無題〉（第一次一定播）：選項的回話 → 大三以後那一句 → 依關係的結尾 */
    G.flags['WISH_DONE_'+id]=true; if(typeof SOCIAL!=='undefined'){ if(SOCIAL.remember) SOCIAL.remember(id,M.mem,M.name); if(SOCIAL.adjust&&typeof DATE!=='undefined'&&DATE.GAIN){ SOCIAL.adjust(id,DATE.GAIN[0]); SOCIAL.adjust(id,{npcRom:4,trust:3}); } }   /* 結算照 AA_128 5-3（DATE.settle：第一次＋心願）*/
    if(typeof STORY!=='undefined'&&STORY.albumMemory) STORY.albumMemory(G,'ps_untitled_card',M.album,'');   /* Life Album：美術館商店買的〈無題〉明信片（沒有人）*/
    if(G.flags.PS_MUSEUM==='yes') G.flags.PS_MUSEUM='done'; return true; };
  if(typeof SOCIAL!=='undefined'&&SOCIAL.MEMORY_LABEL&&!SOCIAL.MEMORY_LABEL.PS_UNTITLED&&L('classmate_peishan@台南')&&L('classmate_peishan@台南').museum) SOCIAL.MEMORY_LABEL.PS_UNTITLED=L('classmate_peishan@台南').museum.memLabel;
  /* 校外約會清單的那一項（date3d.js 的 S.menu）：null＝不出現；{name,ok,why,hint} */
  S.museumOffer=function(G,id){ const key=id+'@台南', C=L(key); if(!C||!C.museum||S.key(G,id)!==key||S.wishDone(G,id)) return null; const o=S.offer(G,id); if(!o) return null; return {name:C.museum.name,ok:!!o.ok,why:o.why||'',hint:'當天來回　'+C.travel}; };
  S.museumAsk=async function(GM,id,n){ const G=GM.G, key=id+'@台南', C=L(key), o=S.museumOffer(G,id); if(!o) return null; if(!o.ok){ await GM.say(null,o.why+'。'); return null; } const M=C.museum;
    const D=S.days(G,id); const k=await GM.choose(D.map(d=>({t:label(d),hint:'當天來回　'+C.travel})).concat([{t:'算了'}])); if(k>=D.length) return null; const day=D[k];
    const known=typeof DATE!=='undefined'&&DATE.log&&DATE.log(G,id).wishKnown; for(const t of (known?M.askKnown:M.askNew)){ if(n) await GM.say({name:nm(id),obj:n.obj,charId:id},t); else { msg(G,id,id,t); await GM.say({name:nm(id)+'（手機）',charId:id},t); } }   /* 還不知道也算完成心願（BB_128 3-4）*/
    G.flags.PS_MUSEUM='yes'; OUT.plan(G,{id:'hv_'+id+'_'+day,ev:C.ev,day,h:10.5,late:1,place:C.city,title:'去'+C.city+'找'+nm(id),travel:C.travel,travelH:C.travelH,back:'回到臺北。',hv:{id,keep:false,key,museum:true}});
    await GM.say(null,'約好 '+label(day)+'，去'+C.city+'。'); if(GM.autosave) GM.autosave(); return day; };
  /* 她主動約（手機；y2b3d.js 的手機規則叫）*/
  const monOf=day=>{ const w=CALENDAR.dateOf(day).wd%7; return day-((w+6)%7); };   /* 那一週的週一 */
  const single=(G,id)=>!Object.keys(G.flags||{}).some(k=>k.indexOf('dating_')===0&&k!=='dating_'+id&&G.flags[k]===true);
  S.museumPhone=function(G){ const id='classmate_peishan', key=id+'@台南', C=L(key), M=C&&C.museum, F=G&&G.flags; if(!M||!F||(G.stage||'law')!=='law'||typeof PHONE==='undefined'||typeof DATE==='undefined'||typeof CALENDAR==='undefined') return;
    if(S.wishDone(G,id)||F.PS_MUSEUM==='yes'||S.key(G,id)!==key||pres(G,id).lost) return; if(typeof INV!=='undefined'&&INV.hasContact&&!INV.hasContact(G,id)) return;
    const t=CALENDAR.termOf(G.day); if(!t||t.week<3||(G.hour%24)<21) return; const tag='ps_museum_'+t.id; if(PHONE.sent(G,tag)) return;
    if(!(dating(G,id)||(single(G,id)&&DATE.stageNum(id)>=5))) return;   /* 雙方都單身（或她是祐廷的女友）、第 5 階以上（她這時候沒有伴侶）*/
    const I=M.invite, P_=t=>({th:'p:'+id,from:id,text:t}); const items=I.lines.map(P_);
    items[items.length-1].ask={id:tag,opts:[{t:'答應',post:false,say:[P_(I.yes)],set:{PS_MUSEUM:'yes'}},{t:'這週不行',post:false,say:[P_(I.no)]}]};   /* 選項是 BB_128 表格的「答應」「這週不行」（她的回話照原文；祐廷不另外說一句）*/
    PHONE.at(G,G.day,21,items,tag); };
  /* ---------- 交往中的視訊（AA_349 K5；台詞在 hometown_lines.js 的 video）：手機約她的清單多「視訊？」（invites3d.js 的 S.flow）——晚上 21:00～22:30、一週最多兩次；她在台南（學期中）。
     開頭三句輪流 → 她那一層閒聊階梯（context:'date'，同一天最多一層）→ 結尾。照可昕視訊的做法（背景 video、深色底＋字幕）。存檔 G.flags.PS_VIDEO＝{wk:那一週的週一, n:這週幾次, rot:輪到第幾句} ---------- */
  S.videoOffer=function(G,id){ const key=id+'@台南', C=L(key), V=C&&C.video; if(!V||!G||(G.stage||'law')!=='law'||!dating(G,id)||S.key(G,id)!==key) return null;
    const R=(G.flags&&G.flags.PS_VIDEO)||{}, n=R.wk===monOf(G.day)?(R.n|0):0, h=G.hour%24;
    if(n>=V.perWeek) return {ok:false,why:'這週已經視訊兩次了'}; if(h<V.from||h>=V.to) return {ok:false,why:'晚上 21:00～22:30 才視訊'}; return {ok:true,hint:'晚上 21:00～22:30　一週最多兩次'}; };
  S.video=async function(GM,id){ const G=GM.G, key=id+'@台南', C=L(key), o=S.videoOffer(G,id); if(!o) return false; if(!o.ok){ await GM.say(null,o.why+'。'); return false; } const V=C.video;
    msg(G,id,'player',V.ask); await GM.say({name:(G.name||'祐廷')+'（手機）'},V.ask);
    const F=G.flags, R=F.PS_VIDEO&&typeof F.PS_VIDEO==='object'?F.PS_VIDEO:(F.PS_VIDEO={}), wk=monOf(G.day); if(R.wk!==wk){ R.wk=wk; R.n=0; } R.n=(R.n|0)+1; const i=(R.rot|0)%V.open.length; R.rot=i+1; R.day=G.day;
    const A=typeof ADV!=='undefined'?ADV:null; if(A&&A.begin) A.begin({background:typeof OUT!=='undefined'&&OUT.bg?OUT.bg('video'):'dark',right:{charId:id,expression:'neutral'}}); if(GM.caption) GM.caption('','視訊',2000);
    try{ await play(GM,id,V.open[i]); await mrel(GM,id,null,'video'); await S.ladder(GM,id,'video'); await play(GM,id,V.close); if(GM.advance) GM.advance(0.5); } finally { if(A&&A.active&&A.end) A.end(); }
    if(GM.autosave) GM.autosave(); return true; };
  /* 閒聊階梯只在私下約推進的人（AA_282 第 3 節：沛珊大三上～大四下的階梯 context:'date'，和可昕一樣；outings3d.js 可昕那段是演完見面接一層）。
     那一學期她的階梯不是 date（大一、大二）＝不在這裡推進（照 3D 搭話）；今天推進過、條件不到＝不聊（不用短招呼）。
     AA_349 K4：當面見到她的那一天都推進一層、同一天最多一層——去台南、去台中（這裡的 S.play）、台南的學期末飯、P6 公開課（OUT.AFTER，下面）、視訊（S.video）；BB_165 5-1、5-2 還沒做。
     寒暑假（去台中、大四下 6/8 台南的期末飯）沒有學期：接剛結束那一學期的階梯，週次當作那學期的最後一週（STORY.termAt；那一學期不是 date＝不推進）*/
  S.LADDER=['classmate_peishan'];
  S.ladder=async function(GM,id,mode){ const G=GM.G; if(!S.LADDER.includes(id)||typeof STORY==='undefined'||!STORY.ladNext||!STORY.ladPlay||!STORY.ladData) return false;
    const so=G.social; if(so&&so.ladderDay&&so.ladderDay[id]===G.day) return false;   /* 同一天最多一層 */
    let G2=G, GM2=GM, D=STORY.ladData(G,id);
    if(!D&&STORY.termAt&&typeof CALENDAR!=='undefined'&&CALENDAR.termDays&&!CALENDAR.termOf(G.day)){ const t=STORY.termAt(G.day), r=t&&CALENDAR.termDays(t);
      if(r){ G2=Object.create(G); G2.day=r.to; G2.weekday=CALENDAR.dateOf(r.to).wd%7; GM2=Object.create(GM); Object.defineProperty(GM2,'G',{get:()=>G2}); D=STORY.ladData(G2,id); } }
    if(!D||!D.L||D.L.context!=='date') return false; const st=STORY.ladNext(G2,id,mode||'meet'); if(!st) return false;
    await STORY.ladPlay(GM2,{name:nm(id),charId:id},id,st); if(G.social&&G.social.ladderDay) G.social.ladderDay[id]=G.day; return true; };
  /* 台南的學期末飯（termend3d.js、r2y4b3d.js 大四下 6/8）、P6 公開課（r2y4b3d.js）：出遊的結尾、分開以前（OUT.AFTER）接一層（AA_349 K4）*/
  S.LADDER_OUTINGS={classmate_peishan:q=>!!q&&!q.hv&&(q.ev==='ev_peishan_open_class'||q.ev==='ev_ps_termend_y4s2'||(q.ev==='ev_termend_dinner'&&!!q.te&&q.te.who==='classmate_peishan'))};
  if(typeof OUT!=='undefined'&&Array.isArray(OUT.AFTER)) OUT.AFTER.push(async(GM,q)=>{ for(const id of S.LADDER){ const f=S.LADDER_OUTINGS[id]; if(f&&f(q)) await S.ladder(GM,id,'meet'); } });
  return S;
})();
