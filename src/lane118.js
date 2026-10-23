/* 和平東路二段 118 巷（D46；AA_280 @02ed9b0a；使用者 2026-10-18 02:2x 放進 v9.10）：店門口點餐、常客、阿哲週一揪午餐。
   區域（導航、立面、店門互動點、後門）在 zones3d.js 的 buildLane118；店家資料 src/data/lane118_shops.js（tools/lane118/import_lane118.py 從白名單上的 AA_280 產生）。
   - 點餐：沒開＝「（鐵門拉下來一半……）」；一個人＝店員招呼 → 點菜（「（你點了{品名}。）」）→ 吃完的旁白；
     那間店門口有常客（見過面的）＝一起吃：招呼換資料裡的 groupGreet（src/data/lane118_shops.js，現在是「幾位？……那邊那張可以坐。」）、吃完換那個人的一句（照 AA_280 第 3 節）。扣錢；吃飯約 40 分鐘、飲料 5 分鐘。
   - 常客：平日中午照 AA_280 第 3 節站在他那間店門口（寒暑假、第 16 週不出現；人在國外、老家、消失期照 STORY.presence）。
   - 阿哲週一 12:00 揪人（AA_280 第 4 節）：第一次 Y1S1 第 2 週；之後每學期第 2～15 週每週一，店照 noodle2 → dian → korea → home 輪；
     「走。」＝12:15 在那間店門口（出遊 goto，阿哲、Alison 在那裡等）；「今天不行。」＝阿哲「好喔 下次」。不在麵店團群組、和阿哲 FAMILIAR 以上＝私訊（只有阿哲的句子）。
   - AA_311（118 巷每間店的故事）：H1 一一八茶飲 × 學姊（S.h1Due／S.playH1，記 SIS_TEA_ORDER）。其餘 H2～H9、熟客三段招呼還沒做。
   - 順手的事（AA_397，src/sideq3d.js）：點完餐最後叫 SIDEQ.atShop（慢讀咖啡、六張犁麵舖、好家自助餐、蛋包飯研究所）；六張犁麵舖公休那兩週（SQ05）isOpen＝false、點餐＝門上那張紙。
   測試：node tests/lane118_unit.js、node tests/aa397_sideq_unit.js */
'use strict';
const L118=(function(){
  const S={};
  const D=()=>typeof LANE118_SHOPS!=='undefined'?LANE118_SHOPS:null;
  const LAY=()=>typeof LANE118_LAYOUT!=='undefined'?LANE118_LAYOUT:null;
  const TERMS=['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'];
  const DK=k=>typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey(k):null;
  const nm=id=>typeof SOCIAL!=='undefined'&&SOCIAL.displayName?SOCIAL.displayName(id):id;
  S.shop=id=>(D()&&D().shops.find(s=>s.id===id))||null;
  /* 店門口（人行道上，和 zones3d.js 的互動點同一個位置）；side W 的店門朝東（+x） */
  S.door=function(id){ const L=LAY(), s=L&&L.shops.find(q=>q.id===id); if(!s) return null; return {x:s.side==='W'?L.facade.west+0.9:L.facade.east-0.9, z:(s.z0+s.z1)/2, side:s.side, yaw:s.side==='W'?Math.PI/2:-Math.PI/2}; };
  const wdOf=G=>typeof CALENDAR!=='undefined'?CALENDAR.dateOf(G.day).wd%7:G.weekday%7;
  S.isOpen=function(id,G){ const s=S.shop(id); if(!s) return false; if(typeof SIDEQ!=='undefined'&&SIDEQ.closedNote&&SIDEQ.closedNote(G,id)) return false;   /* 六張犁麵舖老闆開刀公休（AA_397 SQ05）*/ const h=G.hour%24; if(s.hours.closed.includes(wdOf(G))) return false; return s.hours.open.some(([a,b])=>h>=a&&h<b); };
  /* 這學期第幾週（寒暑假＝null）*/
  const termNow=G=>{ const T=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null; return T&&T.week>=1?T:null; };
  S.regActive=function(r,G){ if(!G||(G.stage||'law')!=='law') return false; const T=termNow(G); if(!T||T.week>15) return false;
    const i=TERMS.indexOf(T.id), i0=TERMS.indexOf(r.term); if(i<0||i0<0||i<i0||(i===i0&&T.week<r.week)) return false;
    if(r.untilTerm&&i>TERMS.indexOf(r.untilTerm)) return false; if(r.until){ const u=DK(r.until); if(u!=null&&G.day>u) return false; }
    if(!r.days.includes(wdOf(G))) return false; const h=G.hour%24; if(h<r.from||h>=r.to) return false;
    const p=typeof STORY!=='undefined'&&STORY.presence?STORY.presence(r.id,G):{here:true}; return p.here!==false; };
  S.regularsAt=(G,shopId)=>((D()&&D().regulars)||[]).filter(r=>(!shopId||r.shop===shopId)&&S.regActive(r,G));
  /* 約好的午餐（阿哲週一揪的）：那一天 12:00～14:00 在那間店門口 */
  S.lunchNow=function(G){ const L=G.flags&&G.flags.L118_LUNCH; if(!L||L.day!==G.day) return null; const h=G.hour%24; return h>=12&&h<14?L:null; };
  /* 一起吃的人：店門口真的站著、見過面的常客＋約好的午餐那幾個人 */
  S.companions=function(GM,shopId){ const G=GM.G, out=[]; const met=id=>typeof SOCIAL==='undefined'||!SOCIAL.has||SOCIAL.has(id,'FIRST_MET');
    const L=S.lunchNow(G); if(L&&L.shop===shopId) for(const id of L.with) if(met(id)&&!out.includes(id)) out.push(id);
    for(const r of S.regularsAt(G,shopId)) if(GM.npc&&GM.npc[r.id]&&met(r.id)&&!out.includes(r.id)) out.push(r.id);
    return out; };
  const lineOf=(id,shopId)=>{ const rs=((D()&&D().regulars)||[]).filter(r=>r.id===id); return (rs.find(r=>r.shop===shopId)||rs[0]||{}).line||null; };
  /* 進到 118 巷、待在巷子裡（story3d.js refreshSchedule 每幾秒叫一次）：時段到了的常客、約好的午餐站到店門口；已經在的不重複 */
  S.populate=function(GM){ const G=GM.G; if(!GM||!GM.spawnCharacter||!LAY()) return 0; let n=0; const at={};
    for(const id in GM.npc){ const q=GM.npc[id]; if(q&&q.l118Shop) at[q.l118Shop]=(at[q.l118Shop]|0)+1; }
    const put=(id,shopId,until)=>{ if(GM.npc[id]) return; const d=S.door(shopId); if(!d) return; const k=at[shopId]=(at[shopId]|0)+1; const x=d.x+(d.side==='W'?0.7:-0.7), z=d.z+(k-1)*0.85-0.4;
      const c=GM.spawnCharacter(id,x,z,{yaw:d.yaw,pose:'idle'}); if(c){ c.idlePose='idle'; c.l118Shop=shopId; c.until=until; n++; } };   /* until：時段結束（story3d.js refreshSchedule 讓他走開） */
    const L=S.lunchNow(G); if(L) for(const id of L.with) put(id,L.shop,14);
    for(const r of S.regularsAt(G)) put(r.id,r.shop,r.to);
    return n; };
  /* 走進店裡（l118_<id>，LANE118-SHOPS-1020）：在店門口等的常客、約好的午餐一起進來，坐在店裡——不然點餐的時候他們還站在巷子裡，一起吃的那段（S.companions）演不到。
     座位照店裡的配置（E.zone.seats）由前往後，有人坐的跳過；已經在的不重複。story3d.js 進區域（S.populate）、待在店裡（refreshSchedule）都叫它 */
  S.populateShop=function(GM,shopId){ const G=GM&&GM.G, E=GM&&GM.E; if(!G||!E||!E.zone||!GM.spawnCharacter||!S.shop(shopId)) return 0; const seats=E.zone.seats||[]; let n=0, k=0;
    const busy=st=>(E.npcs||[]).some(q=>q&&(q.seat===st||q.seatTarget===st))||(E.player&&E.player.seat===st);
    const put=(id,until)=>{ if(GM.npc[id]) return; let st=null; while(k<seats.length&&!st){ const q=seats[k++]; if(!busy(q)) st=q; } if(!st) return;
      const c=GM.spawnCharacter(id,st.x,st.z,{seat:st,pose:'sit'}); if(c){ c.idlePose='sit'; c.l118Shop=shopId; c.until=until; n++; } };
    const L=S.lunchNow(G); if(L&&L.shop===shopId) for(const id of L.with) put(id,14);
    for(const r of S.regularsAt(G,shopId)) put(r.id,r.to);
    return n; };
  /* AA_311 H1（第②級，118 巷店員那一批）：一一八茶飲 × 學姊「她的老樣子」。大一上第 3 週～大一下第 16 週的平日 12:20～12:45 在 tea 點飲料、已經認識學姊（met_sis／FIRST_MET）、
     當天學姊來過 tea（AA_280 第 3 節的常客 12:30～12:40：那一天她照作息在，而且飲料做好的時候她的時段已經開始）→ 店員兩句＋兩選一，記 SIS_TEA_ORDER
     （學姊備考那一年「一起念書的日常」⑤ 才排得到，src/sis_grad3d.js）。只一次；不加數值（店員不是人物，AA_311 第 2 節）。台詞照 AA_311 H1 */
  S.H1={lines:['剛剛那個學姊，你認識喔？','她每天這個時間來。無糖綠茶，去冰。從來沒換過。'],
    opts:[{t:'「她很固定。」',say:[['店員','對啊。我都在她走到窗口以前就做好了。']]},{t:'「……謝謝。」',say:[[null,'（店員笑了一下，沒有再說。）']]}]};
  S.h1Due=function(G,shopId,h0){ const F=G.flags||{}; if(shopId!=='tea'||F.SIS_TEA_ORDER||(G.stage||'law')!=='law') return false;
    const T=typeof CALENDAR!=='undefined'?CALENDAR.termOf(G.day):null; if(!T||!((T.id==='Y1S1'&&T.week>=3)||(T.id==='Y1S2'&&T.week>=1&&T.week<=16))) return false;
    const wd=wdOf(G); if(wd<1||wd>5) return false; const h=((h0!=null?h0:G.hour)%24); if(h<12+20/60||h>12.75) return false;   /* 點的那一刻 */
    const met=typeof SOCIAL!=='undefined'&&SOCIAL.metD?SOCIAL.metD('heroine_05'):!!F.met_sis; if(!met) return false;
    const r=((D()&&D().regulars)||[]).find(x=>x.id==='heroine_05'&&x.shop==='tea'); if(!r||(G.hour%24)<r.from) return false;   /* 她已經來過（飲料做好的時候）*/
    return S.regActive(r,Object.assign({},G,{hour:r.from})); };   /* 那一天她照作息會來（學期第 2～15 週、平日、人在臺北）*/
  S.playH1=async function(GM,clerk){ const G=GM.G, H=S.H1; for(const t of H.lines) await GM.say(clerk,t);
    const k=await GM.choose(H.opts.map(o=>({t:o.t}))); for(const [w,t] of (H.opts[k]||H.opts[0]).say) await GM.say(w?clerk:null,t);
    G.flags.SIS_TEA_ORDER=true; };
  /* 店門口點餐 */
  S.order=async function(GM,shopId){ const G=GM.G, s=S.shop(shopId), Dd=D(); if(!s||!Dd) return false; GM.sceneBegin();
    try{ const sqClosed=typeof SIDEQ!=='undefined'&&SIDEQ.closedNote?SIDEQ.closedNote(G,shopId):null; if(sqClosed){ await GM.say(null,sqClosed); return true; }   /* 公休的紙（玩家寫的那一張，AA_397 SQ05）*/
      if(!S.isOpen(shopId,G)){ await GM.say(null,Dd.closedLine); return true; }
      const comp=S.companions(GM,shopId), clerk={name:s.greet.who||'店員'}, h0=G.hour;
      await GM.say(clerk,comp.length?Dd.groupGreet:s.greet.text);
      const opts=s.menu.map(([n,p])=>({t:n+'　'+p+' 元',dim:(G.money|0)<p})).concat([{t:'不用了'}]);
      const k=typeof EAT!=='undefined'?await EAT.choose(GM,s.name,opts,s.menu.map(m=>m[0]),s.menu.map(m=>m[1])):await GM.choose(opts);   /* 第 5 次起店員認得你、「老樣子」（src/eat3d.js，AA_329 第 3 節）*/
      if(k>=s.menu.length) return true; const [item,price]=s.menu[k];
      if((G.money|0)<price){ GM.toast('錢不夠'); return true; }
      GM.money(-price,'餐費'); await GM.say(null,Dd.orderLine.replace('{品名}',item));
      GM.advance(s.type==='手搖飲'?5/60:40/60); if(typeof EAT!=='undefined') await EAT.ordered(GM,s.name,item);   /* 吃過的、第一次的旁白（AA_329 第 2 節）*/
      const h1=S.h1Due(G,shopId,h0);   /* AA_311 H1：飲料做好、拿到手的時候（一起來的人那一句之後、走回巷口以前）*/
      if(comp.length){ for(const id of comp){ const t=lineOf(id,shopId); if(t) await GM.say(GM.npc&&GM.npc[id]||{name:nm(id),charId:id},t); if(typeof SOCIAL!=='undefined'&&SOCIAL.activity) SOCIAL.activity(id,'meal'); } }
      if(h1) await S.playH1(GM,clerk);
      if(!comp.length&&!(typeof EAT!=='undefined'&&await EAT.together(GM,s.name))) await GM.say(null,s.done);   /* 店裡有認識的人在吃：坐過去一起吃（AA_329 第 1 節）*/
      const L=S.lunchNow(G); if(L&&L.shop===shopId) L.done=true;
      if(typeof SIDEQ!=='undefined'&&SIDEQ.atShop){ try{ await SIDEQ.atShop(GM,s.name,{item,price}); }catch(e){ console.warn('SIDEQ',e); } }   /* 順手的事：店員偶爾多一句（AA_397）*/
      if(GM.autosave) GM.autosave(); return true;
    } finally { GM.sceneEnd(); } };
  /* 阿哲週一 12:00 揪午餐（PHONE 規則，每個 tick 叫一次）*/
  S.lunchShop=function(T){ const R=D()&&D().lunch&&D().lunch.rotation; return R?R[((T.week-2)%R.length+R.length)%R.length]:null; };
  S.firstMonday=()=>{ const r=typeof CALENDAR!=='undefined'&&CALENDAR.termDays?CALENDAR.termDays('Y1S1'):null; if(!r) return null; for(let d=r.from+7;d<r.from+14;d++) if(CALENDAR.dateOf(d).wd%7===1) return d; return null; };
  S.phone=function(G){ if(typeof PHONE==='undefined'||!D()||(G.stage||'law')!=='law') return; const F=G.flags, now=G.day*24+G.hour, Lc=D().lunch, T=termNow(G);
    if(!T||T.week<2||T.week>15||wdOf(G)!==1||G.hour<12||G.hour>=12.25) return;   /* 那個週一 12:00～12:15 才發（之後讀檔不補發過去的週）*/
    const d1=S.firstMonday(); if(d1==null||G.day<d1) return; const tag='l118_lunch_'+G.day; if(PHONE.sent(G,tag)) return;
    const zp=typeof STORY!=='undefined'&&STORY.presence?STORY.presence('zhe',G):{here:true}; if(zp.here===false) return;
    if(typeof DATE!=='undefined'&&DATE.tripAt&&DATE.tripAt(G,G.day,12.25,1)) return;   /* 12:15 那段時間已經約了校外約會：這週不揪（BUG-DATE-OVERLAP-1021；第一次那則順延到下一個週一）*/
    const inG=PHONE.inGroup(G,'noodle_team'), famZhe=typeof SOCIAL!=='undefined'&&SOCIAL.STAGES&&SOCIAL.has&&SOCIAL.has('zhe','FIRST_MET')&&SOCIAL.STAGES.indexOf(SOCIAL.stage('zhe'))>=SOCIAL.STAGES.indexOf('FAMILIAR');
    if(!inG&&!famZhe) return;
    const first=!F.L118_FIRST_SENT, shop=first?'noodle2':S.lunchShop(T); if(!shop) return; const th=inG?'g:noodle_team':'p:zhe';
    let L=first?Lc.first.slice():[['zhe',Lc.weekly[shop]]];
    const paired=DK('2026-12-19'); if(!first&&inG&&paired!=null&&G.day>=paired) L.push(['yu',Lc.pairedYu]);   /* 阿哲和 Alison 交往以後（大二上 12/19 起）*/
    if(!inG) L=L.filter(([w])=>w==='zhe');
    const M=L.map(([w,t])=>({th,from:w,text:t})); const last=M[M.length-1];
    last.ask={id:tag,until:now+1.5,opts:[{t:Lc.yes,set:{L118_PICK:G.day+':'+shop},say:[{th,from:'zhe',text:Lc.yesReply}]},{t:Lc.no,say:[{th,from:'zhe',text:Lc.noReply}]}]};
    PHONE.at(G,G.day,12,M,tag); F.L118_FIRST_SENT=true; };
  /* 回了「走。」：排 12:15 那間店門口（出遊 goto）；阿哲、Alison 在那裡等 */
  S.tick=function(G){ const F=G.flags; if(typeof F.L118_PICK!=='string') return; const [ds,shop]=F.L118_PICK.split(':'); delete F.L118_PICK; const day=+ds; const d=S.door(shop), s=S.shop(shop); if(!d||!s) return;
    const withs=['zhe']; const yp=typeof STORY!=='undefined'&&STORY.presence?STORY.presence('yu',G):{here:true}; if(yp.here!==false) withs.push('yu');
    F.L118_LUNCH={day,shop,with:withs};
    if(typeof OUT!=='undefined'&&!OUT.get(G,'l118_lunch_'+day)&&G.day<=day) OUT.plan(G,{id:'l118_lunch_'+day,ev:null,day,h:12.25,late:0.5,place:'118 巷',title:'中午 118 巷（'+s.name+'）',travel:'走路約 5 分鐘',travelH:1/12,goto:{zone:'lane118',x:d.x+(d.side==='W'?1.6:-1.6),z:d.z+1.2,yaw:d.yaw}}); };
  return S;
})();
