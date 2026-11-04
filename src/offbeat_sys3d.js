/* ===== 日常失速的遊戲系統與台詞（區域 wz_offbeat，溫州街靠新生南路那一頭的轉角一樓；場景 zones3d.js 的 wzShop('offbeat')、配置 src/data/daily_offbeat_layout.js 是 LAWWW2 的）=====
   企劃：AA_617 第 3、4 節的日常失速（使用者 11-03 同意：「日常失速是吃飯打屁桌遊」）、AA_618 第 2 節（台詞，AA 定稿 D109，企劃線 ca876b23d）。台詞一字照抄（S.L）；稿裡沒有的句子不寫。做法照木曜日（src/mokuyobi_sys3d.js）。
   - 營業 13:00～01:00 每天開（PLACES.hours.wz_offbeat，跨午夜照兩點半 Café 的 open／close 寫法）、颱風天關（typhoonShops）；關門時按「進去日常失速」寫開放時間；打烊（01:00）人還在店裡＝請你出來（稿上沒有句子：只寫開放時間）。
   - 不給「讀書」（座位本來就沒有 study）。
   - 2-1 第一次進去（一個人）：進門那一刻兩句旁白＋店員一句；只一次（G.offbeat.first）。
   - 2-2 點東西：吧檯「點東西吃」＋每一趟第一次坐下（和木曜日同一個做法）；價錢照稿扣錢，點完那一樣的旁白（稿上三句各對一樣：肉桂捲、明太子厚片、檸檬氣泡美式；冰拿鐵稿上沒有＝不說）；吃過的登記到 EAT（「溫州街・日常失速」）。
   - 2-3 店長（貓）：「看看店長／摸摸店長」→「看看」：每天第一次一句、之後另一句；「摸摸」：三句隨機、同一句不連續出。
   - 2-4 群聚事件：第 1 點期中考完那天（ev_midterm_supper，story3d.js phoneRules）、第 3 點明軒的桌遊夜（src/bgnight3d.js）已經有了（2D，AA_623），這裡不重做；
     第 2 點期末考完的聚餐（每學期第 17 週、誰揪照學年）沒有做：日曆只有 16 週，而且各學期最後一科考完已經有燒臘店的那一場（story3d.js y2_final_ask 等）——報告 LAWWW 轉問 AA。
   - 2-5 偶遇（一個人去的時候）：沛珊（週三 21:30 以後、大一大二、外帶）、Alison（週日 14:00～17:00、坐靠窗寫作業）、阿哲（大一上系籃練完的週五 19:15、和明軒來吃厚片）的作息在日常失速，
     人在店裡、她（他）的作息是這一筆＝說稿上那一句（一天一次；G.offbeat.enc）。
   - 2-6 八卦：長桌（table 1）坐下，隔壁桌的一句；一學期最多兩句、一天一句，四句接著輪（G.offbeat.gos）。
   - 約人：src/data/invites.js 的地點 offbeat（吃飯；見面照邀約一般的旁白——AA_618 沒有寫）。說話照一般音量（不加小聲）。
   - 店員站在吧檯裡面（STORY.populate；路人底模，不說話）。
   存檔：G.offbeat＝{n:來過幾次, first, catDay, pet:上一次摸摸那句, gos:{t:學期, n:這學期幾句, k:下一句, day}, enc:{人物:那天}}；舊存檔沒有＝game3d.js defaults 補 {n:0}，壞掉的欄位 S.rec 重設。
   看公告板、看社團佈告欄、看桌遊櫃、玩桌遊（配置的 interact flyers／boardgame_shelf／boardgame）：稿上沒有台詞，不放按鈕（報告「缺台詞」）。
   測試：node tests/offbeat_aa618_unit.js */
'use strict';
const OFFB=(function(){
  const S={}, ZONE='wz_offbeat';
  S.ZONE=ZONE;
  const LAY=()=>typeof DAILY_OFFBEAT_LAYOUT!=='undefined'?DAILY_OFFBEAT_LAYOUT:null;
  const CLERK={name:'店員'};
  /* ---------- 台詞（AA_618 第 2 節，一字照抄）---------- */
  S.L={
    first:[[null,'（玻璃門一推開，裡面很吵。中間的長桌坐滿了人，在玩一個要拍桌子的遊戲。）'],[null,'（一隻虎斑貓趴在空椅子上睡覺。椅子上貼著一張紙：「店長，請勿打擾」。）'],['店員','一位嗎？靠窗那邊！貓不用理他，他很習慣。']],   /* 2-1 */
    menu:[['冰拿鐵',120,null],['檸檬氣泡美式',130,'（檸檬氣泡美式。第一口很奇怪，第二口就習慣了。）'],['肉桂捲',110,'（肉桂捲是熱的，糖霜一直滴下來。）'],['明太子厚片',140,'（明太子厚片烤得很脆。你吃到最後一口才發現嘴角都是。）']],   /* 2-2：品項、價錢、點完的那一句 */
    catLook:'看看', catPet:'摸摸', catFirst:'（店長睜開一隻眼睛看你，又閉上。）', catAgain:'（店長在睡覺。）',   /* 2-3 */
    pet:['（店長讓你摸了兩下，起身換了一張椅子。）','（店長把頭靠過來。店員說：『他今天心情很好。』）','（店長看了你一眼，沒動。你決定不摸了。）'],
    gossip:['（隔壁桌：『聽說那個教授期末考只考一題。』『哪一個？』『不知道，聽說的。』）','（隔壁桌：『系籃今年要拿冠軍。』『去年也這樣說。』）','（隔壁桌：『你有看到社博那個魔術社嗎？』『有，他猜錯我的牌。』）','（隔壁桌：『兩點半的老闆說他要換菜單。』『不要換鬆餅就好。』）'],   /* 2-6 */
    enc:{classmate_peishan:[['classmate_peishan','「你也在這！……我買個肉桂捲就走，明天早八。」']],   /* 2-5 */
      yu:[['yu','「欸！坐這邊。……我在寫報告，你不要讓我分心。」'],[null,'（三分鐘後）'],['yu','「……你覺得這段要怎麼寫？」']],
      zhe:[['zhe','「練完好餓。你要不要一起？」']]} };
  S.HOURS={open:13,close:25,text:'每天 13:00–01:00'};   /* places.js 的 PLACES.hours.wz_offbeat 同一份 */

  /* ---------- 共用 ---------- */
  const T_=G=>typeof CALENDAR!=='undefined'&&CALENDAR.termOf?CALENDAR.termOf(G.day):null;
  S.termKey=G=>{ const t=T_(G); if(t) return t.id; const d=typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(G.day):{y:0,m:1}; return 'B'+d.y+(d.m>=6&&d.m<=8?'S':'W'); };
  const nameOf=id=>(typeof SOCIAL!=='undefined'&&SOCIAL.displayName)?SOCIAL.displayName(id):((typeof CHARACTERS!=='undefined'&&CHARACTERS[id]&&CHARACTERS[id].name)||id);
  const whoOf=(GM,id)=>{ const n=GM&&GM.npc&&GM.npc[id]; return {name:nameOf(id),charId:id,obj:n&&n.obj}; };
  const sayAll=async(GM,L)=>{ for(const [w,t] of L) await GM.say(w==null?null:(w==='店員'?CLERK:whoOf(GM,w)),t); };
  S.isOpen=G=>typeof PLACES==='undefined'||!PLACES.isOpen||PLACES.isOpen(ZONE,G.hour,G.day);
  /* 關門的說明（店家說「開門」：places.js 的 closedText 沒有 rules 的地點寫「開館」，只有 cafe 寫「開門」）；颱風照 PLACES.closedText */
  S.closedText=function(G){ if(typeof PLACES!=='undefined'&&PLACES.typhoonClosed&&PLACES.typhoonClosed(ZONE,G.day)) return PLACES.closedText(ZONE,G.hour,G.day);
    const h=((G.hour%24)+24)%24, o=(typeof PLACES!=='undefined'&&PLACES.hours[ZONE])||S.HOURS, later=h<o.open&&h>=o.close-24; return '日常失速 開放時間 '+o.text+'。現在沒有開，'+(later?'今天 ':'明天 ')+String(o.open).padStart(2,'0')+':00 開門。'; };
  S.rec=function(G){ let r=G.offbeat; if(!r||typeof r!=='object'||Array.isArray(r)) r=G.offbeat={n:0};
    if(typeof r.n!=='number'||!(r.n>=0)) r.n=0; if(!r.enc||typeof r.enc!=='object'||Array.isArray(r.enc)) r.enc={}; if(!r.gos||typeof r.gos!=='object'||Array.isArray(r.gos)) r.gos={t:null,n:0,k:0,day:null}; return r; };
  const sceneFree=GM=>{ if(typeof INV!=='undefined'&&INV.sceneFree) return INV.sceneFree(GM); const E=GM&&GM.E, D=GM&&GM.D; return !(E&&E.player&&E.player.busy)&&!(D&&(D.active||(D.busyDepth|0)>0)); };
  S.alone=function(G){ const h=G.hour%24; if(G.flags&&G.flags.companion) return false; return !(G.invites||[]).some(iv=>iv&&iv.zone===ZONE&&iv.day===G.day&&(iv.state==='going'||iv.state==='done'||(iv.state==='accepted'&&h>=iv.h-0.5&&h<iv.h+1.25))); };
  S.rand=()=>Math.random();
  const pickNoRepeat=(n,prev)=>{ const pool=[]; for(let i=0;i<n;i++) if(n<2||i!==prev) pool.push(i); return pool[Math.min(pool.length-1,Math.floor(S.rand()*pool.length))]; };

  /* ---------- 2-2 點東西 ---------- */
  let orderedVisit=null;
  S.eatReg=function(){ if(typeof EAT==='undefined'||!EAT.addShop) return null; if(!(EAT.SHOPS_X&&EAT.SHOPS_X['日常失速'])) EAT.addShop('日常失速',{shop:'溫州街・日常失速',staff:{who:'店員',line5:null,same:null,alt:null},first:null,door:false}); return EAT; };
  S.order=async function(GM){ const G=GM.G; orderedVisit=GM.enterN|0; const M=S.L.menu;
    const opts=M.map(m=>({t:m[0]+'　'+m[1]+' 元',dim:(G.money|0)<m[1]})).concat([{t:'不用了'}]); const i=await GM.choose(opts);
    if(i==null||i<0||i>=M.length) return null;
    const [nm,p,line]=M[i]; if((G.money|0)<p){ GM.toast('錢不夠'); return null; }
    GM.money(-p); if(line) await GM.say(null,line); const E_=S.eatReg(); if(E_&&E_.ordered){ try{ await E_.ordered(GM,'日常失速',nm); }catch(e){ console.warn('EAT.ordered',e); } }
    if(GM.autosave) GM.autosave(); return nm; };

  /* ---------- 2-3 店長 ---------- */
  S.cat=async function(GM){ const G=GM.G, r=S.rec(G); const k=await GM.choose([{t:S.L.catLook},{t:S.L.catPet}]);
    if(k===0){ const f=r.catDay!==G.day; r.catDay=G.day; await GM.say(null,f?S.L.catFirst:S.L.catAgain); return f?'first':'again'; }
    const i=pickNoRepeat(S.L.pet.length,r.pet); r.pet=i; await GM.say(null,S.L.pet[i]); return 'pet'; };

  /* ---------- 2-6 八卦（長桌坐下）---------- */
  S.LONG_TABLE=1;
  S.gossip=function(G,seat){ const L=LAY(); if(!L||!seat) return null; const s=L.seats.find(q=>Math.hypot(q.x-seat.x,q.z-seat.z)<0.3); if(!s||s.table!==S.LONG_TABLE) return null;
    const r=S.rec(G), g=r.gos, k=S.termKey(G); if(g.t!==k){ g.t=k; g.n=0; } if(g.n>=2||g.day===G.day) return null; const i=(g.k|0)%S.L.gossip.length; g.k=(g.k|0)+1; g.n++; g.day=G.day; return S.L.gossip[i]; };

  /* ---------- 坐下（STORY.onSeat）：這一趟第一次坐下＝點東西；長桌＝八卦 ---------- */
  S.onSeat=async function(GM,seat){ const G=GM.G; if(!G||G.zone!==ZONE) return false; const gl=S.gossip(G,seat); if(gl) await GM.say(null,gl);
    if(orderedVisit!==(GM.enterN|0)) await S.order(GM); return true; };

  /* ---------- 2-5 偶遇的作息 ---------- */
  const W16=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16], LAW_TERMS=['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'];
  const ent=o=>Object.assign({zone:ZONE,weeks:W16,noHoliday:true,offbeat:true,if:{custom:G=>!(typeof PLACES!=='undefined'&&PLACES.typhoonClosed&&PLACES.typhoonClosed(ZONE,G&&G.day))}},o);
  S.REGULARS=[
    {id:'classmate_peishan',ent:ent({days:[3],from:21.5,to:22,act:'linger',at:[-1.6,-2.2,Math.PI],terms:['Y1S1','Y1S2','Y2S1','Y2S2'],label:'在日常失速買外帶',note:'AA_618 2-5：週三 21:30 以後（大一、大二；AA_614 課輔班下課），外帶'})},
    {id:'yu',ent:ent({days:[0],from:14,to:17,act:'read',terms:LAW_TERMS,label:'在日常失速寫作業',note:'AA_618 2-5：週日 14:00～17:00（不在戲院上班的日子：戲院的班有寫學期，排在前面先算），坐靠窗寫作業'})},
    {id:'zhe',ent:ent({days:[5],from:19.25,to:20,act:'eat',terms:['Y1S1'],activity:'dept_basketball',label:'在日常失速吃厚片',note:'AA_618 2-5：系籃練完（大一上練球的週）19:15，和明軒來吃厚片'})},
    {id:'classmate_mingxuan',ent:ent({days:[5],from:19.25,to:20,act:'eat',terms:['Y1S1'],activity:'dept_basketball',label:'在日常失速吃厚片',note:'AA_618 2-5：和阿哲一起（明軒沒有句子）'}),quiet:true}];
  S.apply=function(){ let n=0; for(const R of S.REGULARS){ const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[R.id]; if(!c) continue; const L=c.daily_schedule||(c.daily_schedule=[]); if(L.some(e=>e&&e.offbeat)) continue; L.push(Object.assign({},R.ent)); n++; } return n; };   /* 接在最後面、寫學期 */
  S.apply();
  S.slotNow=function(G,id){ const c=typeof CHARACTERS!=='undefined'&&CHARACTERS[id]; if(!c||typeof STORY==='undefined'||!STORY.schedEnt) return null; const e=STORY.schedEnt(c,G); return e&&e.offbeat?e:null; };
  const knows=(G,id)=>typeof STORY!=='undefined'&&STORY.knows?!!STORY.knows(id,G):(typeof SOCIAL!=='undefined'&&SOCIAL.stage?SOCIAL.stage(id)!=='STRANGER':true);
  S.encDue=function(G){ if(!G||G.zone!==ZONE||!S.alone(G)) return null; const r=S.rec(G); for(const id of Object.keys(S.L.enc)){ if(r.enc[id]===G.day) continue; if(S.slotNow(G,id)&&knows(G,id)) return id; } return null; };
  S.enc=async function(GM,id){ const G=GM.G, r=S.rec(G); r.enc[id]=G.day; GM.sceneBegin(); try{ await sayAll(GM,S.L.enc[id]); } finally { GM.sceneEnd(); } return id; };

  /* ---------- 進門：2-1 第一次 ---------- */
  let doorVisit=null, busy=false;
  (globalThis.LOADLOCKS=globalThis.LOADLOCKS||{})['offbeat:busy']=()=>{ busy=false; };   /* 讀檔時放開（LOADGEN-LOCKS-1028）*/
  S.doorDue=GM=>{ const G=GM.G; return !!G&&G.zone===ZONE&&doorVisit!==(GM.enterN|0)&&S.isOpen(G); };
  S.door=async function(GM){ const G=GM.G, r=S.rec(G); doorVisit=GM.enterN|0; r.n=(r.n|0)+1; if(!S.alone(G)) return 'together';
    if(!r.first){ r.first=G.day; GM.sceneBegin(); try{ await sayAll(GM,S.L.first); } finally { GM.sceneEnd(); } return 'first'; } return null; };
  /* ---------- 打烊（01:00）、還沒開：請你出來（稿上沒有句子）---------- */
  S.closeOut=async function(GM){ const G=GM.G, P=GM.E&&GM.E.player, L=LAY(); if(P&&P.seat&&GM.standUp) GM.standUp(P); const t=S.closedText(G);
    await GM.enter('wenzhou',Object.assign({},(L&&L.exit&&L.exit.spawn)||{x:-34.8,z:-9.6,yaw:Math.PI/2})); GM.toast(t,5000); return 'out'; };
  /* ---------- 每 0.5 秒（STORY.TICKS）：打烊 → 進門 → 偶遇 ---------- */
  S.tick=function(GM){ const G=GM&&GM.G; if(!G||G.zone!==ZONE||busy||GM.titleIdle||!sceneFree(GM)) return false;
    let p=null; if(!S.isOpen(G)) p=S.closeOut(GM); else if(S.doorDue(GM)) p=S.door(GM); else { const id=S.encDue(G); if(id) p=S.enc(GM,id); } if(!p) return false;
    busy=true; p.catch(e=>console.warn('OFFB.tick',e)).finally(()=>{ busy=false; }); return true; };

  /* ---------- 接到遊戲 ---------- */
  /* 吧檯「點東西吃」、「看看店長／摸摸店長」（配置的 interact order、cat；其他沒有台詞，不放）。wzShop('offbeat') 的 CUST 沒有 offbeat＝區域本身不放這些按鈕 */
  const ZB=typeof Z3!=='undefined'&&Z3.ZONES&&Z3.ZONES[ZONE];
  if(ZB&&!ZB._offb){ ZB._offb=true; const b0=ZB.build; ZB.build=function(E){ const z=b0.apply(this,arguments); const L=LAY();
      for(const q of ((L&&L.interact)||[])){ if(q.kind==='order') E.interactables.push({x:q.x,z:q.z,radius:1.0,label:q.label,offOrder:true}); else if(q.kind==='cat') E.interactables.push({x:q.x,z:q.z,radius:1.0,label:q.label,offCat:true}); }
      return z; }; }
  if(typeof STORY!=='undefined'){
    if(Array.isArray(STORY.TICKS)&&!STORY.TICKS.includes(S.tick)) STORY.TICKS.push(S.tick);
    if(!STORY._offb){ STORY._offb=true;
      const os=STORY.onSeat; STORY.onSeat=async function(GM,seat){ const r=os?await os.apply(this,arguments):false; try{ if(GM&&GM.G&&GM.G.zone===ZONE) await S.onSeat(GM,seat); }catch(e){ console.warn('OFFB.onSeat',e); } return r; };
      if(STORY.interact){ const oi=STORY.interact; STORY.interact=async function(it,GM){ const G=GM&&GM.G;
        if(it&&it.offOrder&&G){ GM.sceneBegin(); try{ await S.order(GM); } finally { GM.sceneEnd(); } return true; }
        if(it&&it.offCat&&G){ GM.sceneBegin(); try{ await S.cat(GM); } finally { GM.sceneEnd(); } return true; }
        if(it&&it.exit&&G&&it.exit.to===ZONE&&!S.isOpen(Object.assign({},G))){ GM.toast(S.closedText(G),4500); return true; }   /* 「進去日常失速」：關門＝開放時間 */
        return oi.apply(this,arguments); }; }
      if(STORY.populate){ const p0=STORY.populate; STORY.populate=function(zoneId,GM){ const r=p0.apply(this,arguments); try{ if(zoneId===ZONE) S.populate(GM); }catch(e){ console.warn('OFFB.populate',e); } return r; }; } } }
  /* 店員：吧檯裡面（配置：員工在 z −4.4～−3.55），面向客人（+z） */
  S.CLERK_AT={x:-3.0,z:-3.95,yaw:0};
  S.populate=function(GM){ const G=GM&&GM.G, E=GM&&GM.E; if(!G||!E||!E.addNPC||typeof CHAR==='undefined'||!CHAR.build||!S.isOpen(G)) return null; if((E.npcs||[]).some(n=>n&&n.offClerk)) return null;
    const sp=typeof STORY!=='undefined'&&STORY.extraSpec?STORY.extraSpec(92):{}; const o=CHAR.build(sp); if(!o) return null; o.position.set(S.CLERK_AT.x,0,S.CLERK_AT.z); o.rotation.y=S.CLERK_AT.yaw;
    return E.addNPC({obj:o,lv:0,name:'',beh:'idle',pose:'idle',idlePose:'idle',frozen:true,isExtra:true,clerk:true,offClerk:true}); };
  return S;
})();
