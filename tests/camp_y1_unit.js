// 開學前迎新宿營 8/22～24（CAMP-L1；AA_205、BB_177 第五版）——不需要瀏覽器。在 Node 裡用遊戲自己的事件引擎跑 STORY.campY1 整段：
// 2026-11-11（X327 沛珊重寫，AA_762_peishan_events_2.json@1fc9a6658）：這支裡寫死的沛珊的句子照新稿改期望（逐字對稿在 tests/peishan_events_1111_unit.js）。
// 2026-11-11（X327 沛珊重寫，AA_761_peishan_events_1.json@dbfc596a5）：這支裡寫死的沛珊在 events.js 的句子照新稿改期望（逐字對稿在 tests/peishan_events_1111_unit.js）。
//   A 預設選項（都選第一個）：8 段都演（AA_608 第 10 節：迎新晚會、夜遊、法律闖關、水大地、夜談 retired；多自由時間打牌）、時間照 8/22 08:30 → 8/24、演完回家旁白；宿營只認識阿哲、芯慈、沛珊（FIRST_MET note 'camp'）、MET_ZHE、CAMP_Y1；
//     手機：「法律系 114 新生（系學會）」有 8/15 公告與 8/21 名單、第七小隊群組排好 8/24 21:00 合照與 8/29 18:00 阿哲；接著 8/29 搬宿舍（startLawWeek1：錢 7,000、第 −18 天）。
//   B AA_608 第 10 節（10-1～10-7）：遊覽車（坐窗邊、明軒一句印象）、破冰（只有芯慈、Alison 一句印象）、撕名牌（認識阿哲）、自由時間打牌（學測十五級分／哥／為什麼重考，三個分支）、營火（小隊輔帶沛珊來）、早餐（沛珊問「哥？」）；明軒、柏翰、Alison、Kevin 沒有台詞。
//   D 中途讀檔：新版存檔（campSeqV 2）從 campStep 接著演；舊版存檔（12 段的表）照最後演完那一段的時間換到新表。
//   E 宿營之後：9/1 ev_zhe_w1_meet 宿營版（AA_205 6-2：書包放旁邊、「欸，早。」／有 ZHE_CALLS_GE「哥，早。」、不換名字、不加熟悉）；明軒系籃開頭（BB_177 第 12 節）；9/27 舊迎新不排（有 CAMP_Y1）。
//   A2b 換日的日期卡那一刻日期和時間一起換（CAMP-DAYHOUR-1104；修改前 37c354189 FAIL 2）。
// 修改前（沒有 camp_y1.js、沒有 STORY.campY1）全部 FAIL。用法：node tests/camp_y1_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:'?start1'};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|CAMP_Y1_EVENTS|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|ACTIVITIES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/activities.js','src/data/characters.js','src/data/events.js','src/data/camp_y1.js','src/social3d.js','src/events3d.js','src/data/l118_redo772.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/story3d.js']) load(f);
global.ADV={active:false,preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},setBg(){},hide(){},slots:{}}; global.CHAR={setExpr(){}};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
let G=null, sayHr={}, said=[], cards=[], picks=[], entered=[], optsSeen=[];
const P={busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0};
const GM={get G(){ return G; },E:{q:{level:'medium'},player:P,zone:{roomAt:()=>null,seats:[]},npcs:[],extras:[],interactables:[{deskStudy:true,seat:{x:1.8,z:-1.9,yaw:Math.PI}}],levels:null,setWeather(){},endCinematic(){},cam:{distTarget:0}},D:{active:false,busyDepth:0},npc:{},
  advance(h){ G.hour+=h; },sitAt(p,seat){ GM.sat=seat; },standUp(){ GM.stood=true; },rel(id,n){ GM.rels=(GM.rels||[]).concat([[id,n]]); },
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){ GM.saves=(GM.saves|0)+1; },energy(){},money(){},setGoal(g){ G.goal=g; },toast(){},updateHUD(){},letterbox(){},fade:()=>Promise.resolve(),
  titleCard:async(a,b)=>{ cards.push(a+'｜'+(b||'')); },
  say:async(who,t)=>{ said.push(typeof who==='string'?who+'：'+t:(who&&who.name?who.name+'：'+t:t)); if(G&&/下午的大地遊戲是撕名牌|晚餐後是自由時間|營火晚會開始沒多久|十二點半，遊覽車停在校門口/.test(t)) sayHr[t.slice(0,6)]=G.hour; },
  choose:async opts=>{ optsSeen.push(opts.map(o=>o.t).join('/')); if(GM.prefer){ const k=opts.findIndex(o=>GM.prefer.some(w=>o.t.indexOf(w)>=0)); if(k>=0) return k; } const want=picks.shift(); if(want==null) return 0; const k=opts.findIndex(o=>o.t.indexOf(want)>=0); return k<0?0:k; },
  enter:async(z,sp)=>{ entered.push(z); G.zone=z; },
  spawnNPC(id,spec,x,z,o){ GM.spawnLog=(GM.spawnLog||[]).concat([[id,o&&o.seat]]); return null; },spawnCharacter(id,x,z,o){ GM.spawnLog=(GM.spawnLog||[]).concat([[id,o&&o.seat]]); return null; }};   /* 只記下來、回傳 null（不放進 GM.npc，事件照舊當作人物沒生出來；後面的段落不受影響）*/
const fresh=()=>{ G={day:1,weekday:3,hour:21.2,zone:'dorm',stage:'law',name:'祐廷',money:22000,flags:{},choices:{},events:{done:{},last:{},count:0},rel:{},social:null,msgs:[],goal:''};
  SOCIAL.bind(G); EVENTS.bind(GM); if(INV.bind) INV.bind(G); said=[]; sayHr={}; cards=[]; picks=[]; entered=[]; GM.saves=0; };
const flush=()=>new Promise(r=>setTimeout(r,10));
const day=k=>STORY.dayOfKey(k);
(async()=>{
  const R5=['ev_camp_d1_party','ev_camp_d1_walk','ev_camp_d2_quiz','ev_camp_d2_water'];   /* CANON-1112：舊序章拿掉／可昕開局不認識（AA_859「一起拿掉的」）：夜談的定義整段拿掉了（原本第五個 retired）*/
  { const camp=STORY_EVENTS.filter(e=>e.trigger==='camp'), seq=STORY.CAMP_SEQ.map(x=>x[0]);
    check('0. STORY.campY1 存在；AA_608 第 10 節：camp 事件 12 個（4 個 retired 留給舊存檔：迎新晚會、夜遊、法律闖關、水大地；夜談的定義拿掉了——CANON-1112：舊序章拿掉／可昕開局不認識，原本 13 個、5 個 retired），CAMP_SEQ 8 段＝遊覽車、破冰、撕名牌、自由時間｜第二天、營火｜早餐、結業',typeof STORY.campY1==='function'&&camp.length===12&&!camp.some(e=>e.id==='ev_camp_d2_talk')&&R5.every(id=>camp.find(e=>e.id===id&&e.retired))&&camp.filter(e=>!e.retired).length===8
      &&seq.join()==='ev_camp_d1_bus,ev_camp_d1_ice,ev_camp_d1_field,ev_camp_d1_free,ev_camp_d2_bbq,ev_camp_d2_fire,ev_camp_d3_quiz,ev_camp_d3_end'&&!seq.some(id=>R5.includes(id)),seq.join()); }
  // ---------- A 預設選項 ----------
  fresh(); await STORY.campY1(GM);
  const F=G.flags, met=id=>(G.social.mem[id]||[]).find(m=>m.tag==='FIRST_MET');
  const ids=['zhe','classmate_xinci','classmate_peishan'];
  check('A1. 8 段都演完（events.done）、retired 的五段沒演、CAMP_Y1、沒有 campStep／campSeqV',STORY.CAMP_SEQ.every(([id])=>G.events.done[id])&&!R5.some(id=>G.events.done[id])&&F.CAMP_Y1===true&&F.campStep==null&&F.campSeqV==null,STORY.CAMP_SEQ.filter(([id])=>!G.events.done[id]).join());
  check('A2. 字卡：8/22 迎新宿營、第 2 天、第 3 天',cards[0]==='2025 年 8 月 22 日（五）｜迎新宿營'&&cards.some(c=>/8 月 23 日（六）｜迎新宿營 第 2 天/.test(c))&&cards.some(c=>/8 月 24 日（日）｜迎新宿營 第 3 天/.test(c)),cards.join(' / '));
  check('A3. AA_608 第 10 節：宿營只認識阿哲、芯慈、沛珊（FIRST_MET note camp）；MET_ZHE；明軒、柏翰、Kevin、Alison 宿營不記認識（搬宿舍時柏翰才記 dorm）',ids.every(id=>met(id)&&met(id).note==='camp')&&F.MET_ZHE===true&&!['classmate_mingxuan','kevin','yu'].some(id=>met(id))&&(!met('classmate_bohan')||met('classmate_bohan').note==='dorm'),['zhe','classmate_xinci','classmate_peishan','classmate_mingxuan','classmate_bohan','kevin','yu'].map(id=>id+':'+(met(id)?met(id).note:'-')).join(' '));
  check('A3d. 宿營時間：撕名牌 13:30、自由時間 19:30、營火 20:00（第二天）、回校門 12:30（6-14 程式 4）',Object.values(sayHr).length===4&&Math.abs(sayHr['（下午的大地']-13.5)<0.01&&Math.abs(sayHr['（晚餐後是自']-19.5)<0.01&&Math.abs(sayHr['（營火晚會開']-20)<0.01&&Math.abs(sayHr['（十二點半，']-12.5)<0.01,JSON.stringify(sayHr));
  check('A3b. 阿哲熟悉：ACQUAINTANCE 的 5、自由時間 +1；Kevin 宿營不認識（不再有臥底）',!met('kevin')&&SOCIAL.rel('zhe').fam>=6,JSON.stringify([met('kevin'),SOCIAL.rel('zhe').fam]));
  check('A3c. 6-14 程式 3：人物面板記憶顯示日期（8/22）、地點中文（宿營）',SOCIAL.dayLabel(met('zhe').day)==='8/22'&&SOCIAL.noteShown('zhe',met('zhe'))==='宿營'&&SOCIAL.noteShown('kai',{tag:'FIRST_MET',note:'dorm'})==='宿舍',SOCIAL.dayLabel(met('zhe').day)+' '+SOCIAL.noteShown('zhe',met('zhe')));
  check('A4. AA_608 第 10 節：新局不設 Kevin 的旗標（CAMP_MOLE_*、CAMP_CLUE*、CAMP_KEVIN）、CAMP_SEEN（10-1：Alison 只有印象）；CAMP_BUS 固定 win',F.CAMP_MOLE_REVEALED==null&&F.CAMP_MOLE_CLUE==null&&!F.CAMP_CLUE0&&!F.CAMP_KEVIN&&F.CAMP_SEEN==null&&F.CAMP_BUS==='win',JSON.stringify({s:F.CAMP_SEEN,b:F.CAMP_BUS}));
  check('A5. 沒有大地遊戲三關（CAMP_FIELD_N、CAMP_F1～3）、不設 MX_CAMP_PAIR；營火認識沛珊＝有她的聯絡方式',F.CAMP_FIELD_N==null&&!F.CAMP_F1&&!F.CAMP_F2&&!F.CAMP_F3&&!F.MX_CAMP_PAIR&&INV.hasContact(G,'classmate_peishan'),JSON.stringify({n:F.CAMP_FIELD_N,mx:F.MX_CAMP_PAIR}));
  check('A6. 回家旁白（AA_205 2-2）在最後',said.some(t=>t==='（回到家，你把營地帶回來的衣服丟進洗衣機。）'));
  const grpNew=G.msgs.filter(m=>m.th==='g:law_new');
  check('A7. 手機：系學會新生群組有 8/15 公告與 8/21 小隊名單（AA 11-03：旁白一句、不列名字）',PHONE.inGroup(G,'law_new')&&grpNew.some(m=>m.day===day('2025-08-15')&&/新生都要參加/.test(m.text))&&grpNew.some(m=>m.day===day('2025-08-21')&&m.text==='（小隊名單貼出來了。第七小隊七個人，你認得的只有自己的名字。）'&&!m.from)&&!grpNew.some(m=>/凱文|江明軒|許柏翰|張哲維/.test(m.text)),grpNew.map(m=>m.day+':'+m.text.slice(0,12)).join(' | '));
  const q=(G.phone.q||[]).map(x=>x.tag+'@'+x.day+'/'+x.h);
  check('A8. 第七小隊群組：8/24 21:00 合照、8/29 17:30 阿哲「我在高鐵上了」（AA_205 6-14①）',PHONE.inGroup(G,'camp_squad_y1')&&q.includes('camp_squad_photo@'+day('2025-08-24')+'/21')&&q.includes('camp_squad_829@'+day('2025-08-29')+'/17.5'),q.join(' '));
  check('A9. 接著 8/29 搬宿舍：第 −18 天、錢 7,000、進宿舍',G.day===day('2025-08-29')&&G.money===7000&&entered.includes('dorm')&&cards.some(c=>/8 月 29 日/.test(c)),G.day+' '+G.money+' '+entered.join());
  check('A10. 每段演完都自動存檔（8 次以上）',GM.saves>=8,String(GM.saves));
  // ---------- F 8/29 搬進宿舍（AA_195 4-2＋BB_168 第 1 節 ev_kai_movein）----------
  { const ix=t=>said.findIndex(x=>x.indexOf(t)>=0), km=(G.social.mem.kai||[]).find(m=>m.tag==='FIRST_MET');
    check('F1. 日期卡「8 月 29 日（五）｜16:05 · 男生宿舍」',cards.includes('8 月 29 日（五）｜16:05 · 男生宿舍'),cards.slice(-2).join(' / '));
    const o=[ix('行李箱的輪子在宿舍走廊上一直卡到地磚的縫。'),ix('（靠窗那張書桌已經有人用了。'),ix('柏翰：（從書裡抬頭）你也住這間？'),ix('柏翰：門口那張床是你的。我早上就來了。'),ix('（另一張書桌前也有人。'),ix('阿凱：（回頭）喔，嗨。'),ix('阿凱：你那組在門口那邊喔？我東西先放了一點過去，等一下拿走。'),ix('阿凱：好，謝謝。'),ix('（門被撞開。阿哲拖著一個超大的行李箱'),Math.max(ix('阿哲：欸？撕名牌那個！你也住這間喔？'),ix('阿哲：哥！撕名牌那個就是你嘛，你也住這間喔？')),ix('阿凱：（戴著耳機，頭沒有回，舉了一下手）'),ix('阿凱：門關一下，冷氣會跑掉。'),ix('（你們各自整理到快十點。'),ix('以前遇到事情，你會去翻民法。'),ix('這次不一樣。這次有人要教你怎麼讀。'),ix('（十點四十，手機響了一聲。是阿凱傳的。他人就坐在你後面兩公尺。）'),ix('阿凱（手機）：你的冷氣遙控器在我這'),ix('（阿哲說他都可以，柏翰已經戴上耳塞了。）'),ix('（遙控器最後放在你和阿凱的書桌中間。）')];
    check('F2. 順序：行李箱 → 柏翰已在（AA_208 2-1）→ 阿凱初遇（預設選第一個「好，謝謝」）→ 19:00 阿哲到（ZHE_CALLS_GE「哥！」／沒有「欸！」）→ 整理到快十點 → DAY1_NARR 兩句（CANON-1112：舊序章拿掉／可昕開局不認識：原本的第三句在講舊序章，拿掉了）→ 十點四十的旁白 → 22:40 冷氣訊息 → 阿哲、柏翰那句 → 遙控器',o.every((v,k)=>v>=0&&(k===0||v>o[k-1])),o.join(','));
    check('F3. MET_KAI、KAI_MOVEIN、阿凱 FIRST_MET＝dorm、ACQUAINTANCE、手機聯絡人有阿凱',F.MET_KAI===true&&F.KAI_MOVEIN===true&&km&&km.note==='dorm'&&SOCIAL.stage('kai')==='ACQUAINTANCE'&&G.contacts.kai!=null,JSON.stringify({km,st:SOCIAL.stage('kai')}));
    { const bm=(G.social.mem.classmate_bohan||[]).find(m=>m.tag==='FIRST_MET'), i1=ix('柏翰：（從書裡抬頭）你也住這間？'), i2=ix('柏翰：許柏翰。新竹。'), i3=ix('柏翰：門口那張床是你的。我早上就來了。');
      check('F3b. AA_608 10-3：柏翰宿營不出場，搬進 203 時以室友身分認識——「許柏翰。新竹。」接在「你也住這間？」後面（AA 11-03）、記 FIRST_MET dorm；對話框寫「柏翰」',i1>=0&&i2===i1+1&&i3===i2+1&&bm&&bm.note==='dorm',JSON.stringify([i1,i2,i3,bm])); }
    check('F4. 坐到書桌前（第一次）、站起來；22:40 以後、冷氣 27 度、目標「整理行李。缺的東西明天去公館買。」',GM.sat&&GM.sat.x===1.8&&GM.stood&&G.hour>=22+40/60-1e-6&&F.DORM_AC===27&&G.goal==='整理行李。缺的東西明天去公館買。'&&F.DAY1_NARR_SEEN===true,G.hour+' '+G.goal);
    { const want=[['kai','R2'],['classmate_bohan','R1'],['zhe','L1']], log=GM.spawnLog||[], at=id=>log.find(x=>x[0]===id);   /* QA-HANDOFF-B1：原本判斷 E.zone.id（區域物件沒有 id），三個室友一直沒生出來；替身的 E.zone 一樣沒有 id */
      check('F4b. 轉場後三個室友坐在四人房自己的書桌前：阿凱 R2、柏翰 R1、阿哲 L1（AA_208）',want.every(([id,u])=>{ const r=at(id), s=STORY.dormSeat(u); return r&&r[1]&&Math.abs(r[1].x-s.x)<1e-6&&Math.abs(r[1].z-s.z)<1e-6; }),JSON.stringify(log)); }
    const km2=G.msgs.filter(m=>m.th==='p:kai');
    check('F5. 手機：阿凱的對話串有冷氣訊息和回覆',km2.some(m=>m.text==='你的冷氣遙控器在我這')&&km2.some(m=>/27 可以嗎|懶得拿下來/.test(m.text)),km2.map(m=>m.text).join(' | '));
    const n0=said.length; await STORY.lawMoveIn(GM);
    check('F6. 演過就不再演（KAI_MOVEIN）',said.length===n0); }
  // ---------- G 家族群組 W0：8/30 21:00（BB_168 6-3、BB_177 11-1）----------
  { const fam=()=>G.msgs.filter(m=>m.th==='g:family_law'), q=(G.phone.q||[]).map(x=>x.tag+'@'+x.day+'/'+x.h);
    check('G1. 搬宿舍以後：已在家族群組；Kevin 的置頂和宿營那幾句排在 8/30 21:00（還沒發；學姊 8/25 那則刪，AA_218 L512、17-12）',PHONE.inGroup(G,'family_law')&&!fam().some(m=>m.from==='heroine_05')&&q.includes('fam_w0@'+day('2025-08-30')+'/21')&&!fam().some(m=>m.from==='kevin'),q.join(' '));
    G.day=day('2025-08-30'); G.hour=21.05; PHONE.tick(G); const kv=fam().filter(m=>m.from==='kevin'), last=kv[kv.length-1];
    check('G2. 去過宿營的版本（AA 11-03：Kevin 不在宿營，和沒去的同一版）：Kevin 的置頂排第一（AA_218 L512），接著兩則、最後一則可以回「（舉手）／我在。」；沒有「臥底」「騙了自己家的學弟」',kv.length===3&&kv[0].pin&&kv[1].text==='新的家族學弟妹都進群了嗎？'&&kv[2].text==='有進來的舉個手，考古題茶會那天給你們。'&&!kv.some(m=>/臥底|騙了自己家/.test(m.text))&&last.ask&&last.ask.opts.map(o=>o.t).join('/')==='（舉手）/我在。',kv.map(m=>m.text).join(' | '));
    const r=PHONE.answer(G,last.ask.id,1);
    check('G3. 回了 → FAM_GROUP_REPLIED、Kevin「好，收到一個。」',G.flags.FAM_GROUP_REPLIED===true&&fam().some(m=>m.text==='好，收到一個。'),JSON.stringify(r&&r.out&&r.out.map(m=>m.text)));
    const n1=G.msgs.length; await STORY._v1.familyGroupD1(GM);
    check('G4. 9/3 introDorm 不再發舊的「第三週了」（已經發過）',G.msgs.length===n1&&!G.msgs.some(m=>/第三週了/.test(m.text))); }
  // ---------- I 8/30 新手教學三個目標（AA_195 4-3、AA-B 00:46）----------
  { const G0=G; G.day=day('2025-08-30'); G.weekday=6; G.hour=9; G.zone='dorm'; said=[]; STORY.tut830Tick(GM);
    check('I1. 8/30 早上任務欄：「去公館買缺的東西：延長線、衣架、拖鞋」',G.goal==='去公館買缺的東西：延長線、衣架、拖鞋',G.goal);
    const it=STORY.tut830Items(G);
    check('I2. 便利商店多三樣：三孔延長線 299、衣架一包 49、拖鞋 99（合計 447）',it.map(x=>x[0]+x[1]).join('/')==='三孔延長線299/衣架一包49/拖鞋99'&&it.reduce((a,x)=>a+x[1],0)===447,it.map(x=>x[0]+x[1]).join('/'));
    it[0][3](G); it[1][3](G); check('I3. 只買兩樣還不算完成、還剩一樣可以買',!G.flags.T830_BUY&&STORY.tut830Items(G).length===1);
    STORY.tut830Items(G)[0][3](G); STORY.tut830Tick(GM); await flush();
    check('I4. 三樣都買了 → 完成句①、任務欄換成「走一次椰影大道到總圖」',said.includes('（延長線買了三孔的。阿凱的主機插頭是三孔的。）')&&G.goal==='走一次椰影大道到總圖'&&STORY.tut830Items(G).length===0,G.goal);
    G.zone='linze'; P.lv=1; P.obj.position.x=-2; P.obj.position.z=-6.3; STORY.tut830Tick(GM); await flush(); P.lv=0; P.obj.position.x=0; P.obj.position.z=0;
    check('I5. 先找到 201 也算（每項各自算）→ 完成句③、任務欄還是「走一次椰影大道到總圖」',said.includes('（法律系館A 201 在二樓。去年一整年，你從來沒有走進這棟。）')&&G.goal==='走一次椰影大道到總圖',G.goal);
    G.zone='library_hall'; STORY.tut830Tick(GM); await flush();
    check('I6. 進總圖 → 完成句②；三項都完成，任務欄換回一般的',said.includes('（椰影大道還是那麼長。總圖門口有新生在拍照。）')&&!['去公館買缺的東西：延長線、衣架、拖鞋','走一次椰影大道到總圖','找到法律系館A 201：星期一第一堂憲法在那裡'].includes(G.goal),G.goal);
    const n=said.length; STORY.tut830Tick(GM); await flush(); check('I7. 完成句不重複',said.length===n); }
  // ---------- H 8/31：開學典禮 14:00、班群（系學會茶會公告）、可昕開學前一晚 22:10（AA_195 4-4、BB_168 6-2）----------
  { const q=(G.phone.q||[]).map(x=>x.tag);
    check('H1. 搬宿舍時不再排 8/31 22:10 她開學前一晚的訊息（CANON-1112：舊序章拿掉／可昕開局不認識；原本期望排了 kx_eve、記 KX_EVE_MSG）',!q.includes('kx_eve')&&G.flags.KX_EVE_MSG===undefined,q.join(' '));
    G.day=day('2025-08-31'); G.weekday=0; G.hour=7.5;
    check('H0. BUG-CER831-SLEEP-1031（BB-B n36 ②）：8/31 典禮還沒演＝ceremonyDue；早上睡覺（睡到傍晚）在 14:00 被叫醒（lawWakeAt＝14）',STORY.ceremonyDue(G)&&STORY.lawWakeAt(G)===14,String(STORY.lawWakeAt(G)));
    G.hour=9; { const st=STORY.outStopsToday(G,9), bo=(STORY.bedOptions(G)||[]).find(o=>o.t==='睡到傍晚（不設鬧鐘）');
      check('H0b. BB-B 10-31 cer831：8/31 09:00 上床——停點有 14:00「開學典禮」、「睡到傍晚」寫 14:00 會叫醒你（小睡、跳過時間走 CLS.STOP_FNS／outStopsToday）',st.some(o=>o.h===14&&/開學典禮/.test(o.why))&&!!bo&&/14:00/.test(bo.hint),JSON.stringify([st,bo&&bo.hint])); }
    G.hour=18; check('H0. 14:00 以後不再叫醒（睡下去前床先演典禮：bedScene）',STORY.lawWakeAt(G)==null&&STORY.ceremonyDue(G));
    G.hour=14.05; said=[]; cards=[]; await STORY.ceremonyY1(GM);
    check('H2. 典禮：日期卡「8 月 31 日（日）｜14:00 · 綜合體育館」、三句旁白照順序、演完 15:30',cards.includes('8 月 31 日（日）｜14:00 · 綜合體育館')&&said.join('|')==='四千多個新生，每個人都穿著同一件新生上衣。|法律系的位置在二樓看台的右邊。旁邊的人在對手冊上的流程，前面的人在傳訊息問晚上要不要一起吃飯。|校長致詞講到一半，手機震了一下。你被加進一個群組。'&&Math.abs(G.hour-15.5)<1e-6&&G.flags.CEREMONY_Y1===true,cards.join('/')+' '+said.join('|'));
    PHONE.tick(G); const lc=G.msgs.filter(m=>m.th==='g:law_class').map(m=>(m.name||'')+':'+m.text);
    check('H3. 班群：加入的系統字、系學會「新生茶會：9/2（二）18:30，法律系館B一樓大廳。會說家族怎麼分，有點心。」（AA_372 第 12 項：原本「會公布直屬」）「不用報名，來就好。」、不具名的同學問系服',PHONE.inGroup(G,'law_class')&&lc.join('|')===':你被加進「法律系（全班）」。|系學會:新生茶會：9/2（二）18:30，法律系館B一樓大廳。會說家族怎麼分，有點心。|系學會:不用報名，來就好。|同學:請問要穿系服嗎|同學:我們還沒有系服吧',lc.join(' | '));
    const n0=said.length; await STORY.ceremonyY1(GM); check('H4. 典禮只演一次',said.length===n0);
    { const h0=G.hour; G.hour=7.5; check('H4. 演完以後：ceremonyDue 關掉、不再叫醒',!STORY.ceremonyDue(G)&&STORY.lawWakeAt(G)==null); G.hour=h0; }
    G.hour=22.2; PHONE.tick(G); const kx=G.msgs.filter(m=>m.th==='p:kexin');
    check('H5. 22:10 沒有她的訊息（CANON-1112：舊序章拿掉／可昕開局不認識；原本 H5、H6 期望她傳「明天開學了。」兩則＋三個回覆）',kx.length===0,kx.map(m=>m.text).join(' | ')); }
  /* CANON-1112：舊序章拿掉／可昕開局不認識：H7（玩過舊序章的版本多一句）、H8（9/3 讀案例那晚她的訊息）兩項拿掉——那兩支函式（開學前一晚、第一則訊息）整段不在了 */
  check('H7. story3d.js 沒有開學前一晚、第一則訊息那兩支函式了',typeof STORY.kexinEve==='undefined'&&!(STORY._v1&&STORY._v1.kexinFirstMsg));
  fresh(); G.flags.MAIN_D1=STORY.MAIN_D1_NEW; G.flags.LAW_START_DAY=day('2025-08-29'); G.day=day('2025-09-03'); STORY.familyW0(G,{now:true});
  { const kv=G.msgs.filter(m=>m.th==='g:family_law'&&m.from==='kevin');
    check('G5. 沒去宿營的版本（BB_168 6-3）：Kevin 的置頂排第一（AA_218 L512）、「有進來的舉個手，考古題茶會那天給你們。」、回「（舉手）／我在。」',kv.length===3&&kv[0].pin&&/^學弟妹好～我是 Kevin，大二。/.test(kv[0].text)&&kv[2].text==='有進來的舉個手，考古題茶會那天給你們。'&&kv[2].ask.opts.map(o=>o.t).join('/')==='（舉手）/我在。',kv.map(m=>m.text).join(' | ')); }
  fresh(); G.flags.CAMP_Y1=true; G.day=day('2025-08-29'); G.hour=9; picks=['我是']; await STORY.startLawWeek1(GM,null,{day:G.day,hour:15,econ:true});
  { const ix=t=>said.findIndex(x=>x.indexOf(t)>=0);
    // CANON-NO-ECON-1112：經濟系那一年拿掉（F7 經濟系轉過來的那一句）
    check('F8. 選「我是祐廷，法律系。」→「阿凱。資工系的。」（AA_606 第 2 節，原本「阿凱。資工。」）「法律系喔，那你書應該很多。衣櫃大的那格給你。」（AA_208：櫃子→衣櫃）',said.includes('阿凱：阿凱。資工系的。')&&said.includes('阿凱：法律系喔，那你書應該很多。衣櫃大的那格給你。')); }
  // ---------- B AA_608 第 10 節（10-1～10-5）：宿營只認識芯慈、阿哲、沛珊 ----------
  { const is=(s,t)=>s===t||(s||'').endsWith('：'+t), at=(t,from)=>{ for(let k=from|0;k<said.length;k++) if(is(said[k],t)) return k; return -1; };
    const inOrder=list=>{ let k=-1; for(const t of list){ const j=at(t,k+1); if(j<0) return 'missing: '+t; k=j; } return ''; };
    const block=list=>{ const i0=at(list[0]); if(i0<0) return 'missing: '+list[0]; for(let k=0;k<list.length;k++) if(!is(said[i0+k],list[k])) return 'at '+k+': '+said[i0+k]; return ''; };   /* 一句不多一句不少、照順序 */
    const camp0=()=>said.slice(0,said.indexOf('（回到家，你把營地帶回來的衣服丟進洗衣機。）')+1);
    fresh(); optsSeen=[]; await STORY.campY1(GM,{next:false});
    const bus=['（早上八點半，校門口停了兩台遊覽車。小隊名單前一天晚上貼出來了，你那一隊有七個人。）','（早上八點半，遊覽車從校門口出發。你坐在靠窗的位子，一路看著窗外。）','（後面一排有個戴帽子的男生，一上車就靠著窗睡著，到營地才醒。）'];
    check('B1. 遊覽車（10 第 1 點、10-1）：不給選項、坐窗邊，明軒只有一句印象旁白（不寫名字）',!block(bus)&&!optsSeen.some(o=>/坐阿哲旁邊|坐明軒旁邊|自己坐窗邊/.test(o)),block(bus));
    const ice=['（營地的空地上，每個小隊圍成一圈，輪流報名字和從哪裡來。）','（隔壁小隊喊隊呼，帶頭的女生聲音大到整個營地都聽得到。）','吳芯慈，永和。我應該是全隊住最近的。','（另外幾個人也報了名字，你一下子記不住。輪到你。）','好，七個人都記住了吧。','還有一個沛珊，她明天晚上才到。','（你們小隊七個人，你只記住了芯慈。）'];
    check('B2. 破冰（10 第 2 點、10-1、10-3）：只有芯慈報名字、Alison 一句印象旁白、沛珊明天才到；祐廷的選項照原本',!block(ice)&&optsSeen.includes('「臺北。我家就在這附近。」/「臺北人。」')&&said.includes('芯慈：吳芯慈，永和。我應該是全隊住最近的。'),block(ice));
    const tag=['（下午的大地遊戲是撕名牌。每個人背後貼一張寫著自己名字的貼紙，被撕掉就出局。你們第七小隊對隔壁的第八小隊。）','（你躲在樹後面。背後忽然有腳步聲——你一轉身，跟一個男生撞個正著。）','（兩個人都晃了一下。他的手還是比較快。）','（嘶——你背後的名牌被撕走了。）','（看著手上的貼紙）祐廷……出局！','撕名牌本來就是偷襲啊。','張哲維，叫我阿哲。高雄上來的。','（對面有人在喊：「阿哲！後面！」）','……我先走了！','（他轉身就跑。下一秒，他背後的名牌被芯慈撕掉了。）'];
    check('B3. 撕名牌認識阿哲（10-4，預設「你偷襲。」）',!block(tag)&&optsSeen.includes('「你偷襲。」/（揉一下被撞到的肩膀）')&&said.includes('阿哲：……我先走了！'),block(tag));
    const free=['（晚餐後是自由時間。你坐在寢室外面的走廊，芯慈拿著一副撲克牌走過來。）','祐廷，我們在玩大老二，三缺一。你要不要來？','（交誼廳的角落，阿哲也在，看到你就笑了。）','下午那個！……來來來，坐。','（玩了三局。芯慈贏了兩局，阿哲一直說牌不好。）','我通勤，平常很少跟同學玩到這麼晚。……其實有點羨慕你們住宿舍的。',
      '（打牌，第三局。阿哲又拿到一手爛牌。）','今年運氣都很差。學測數學也是，難到我想哭。你數學幾級分？','十五級分。','……滿級分？厲害欸。'];   /* CANON-1112：舊序章拿掉／可昕開局不認識：「滿級分？」以後照 AA_859 換了（逐字對稿：tests/canon_opening_1112_unit.js 第 4 節）；這裡只看到這一句為止＋新的選單出現 */
    const freeCh=(STORY_EVENTS.find(e=>e.id==='ev_camp_d1_free').dialogue.filter(l=>l.choice)[1]||{choice:[]}).choice.map(c=>c.text).join('/');
    check('B4. 自由時間打牌（10 第 4 點、10-5；預設「好啊。」→ 十五級分 → 滿級分？→ 兩個選項的新選單）：ZHE_CALLS_GE；沒有「不想講」、沒有舊的三個分支（CANON-1112：舊序章拿掉／可昕開局不認識；原本期望 old 分支和「那你算學長？」「是哥。」）',!block(free)&&G.flags.ZHE_CALLS_GE===true&&optsSeen.includes('「好啊。」/「我不太會玩。」')&&freeCh.split('/').length===2&&optsSeen.includes(freeCh)&&!optsSeen.some(o=>/不想講|嗯。/.test(o))&&said.includes('祐廷：十五級分。')&&!said.some(t=>/那你算學長|第二次？/.test(t))&&!('ECON_PAST_SHARED' in G.flags)&&!('WHY_RETAKE_ASKED' in G.flags),block(free));
    const fire=['（第二天的活動排得很滿。你們小隊在水大地被潑得最慘。）','（營火晚會開始沒多久，小隊輔帶著一個揹大背包的女生走過來。）','這是沛珊。妳先坐這邊。','（她在你旁邊坐下，把背包放在腳邊。）','嗨！我是不是錯過很多？我是遲到一天半的那個沛珊。','那還好。我先跑了一場中友會的宿營，台中同學辦的，今天中午才結束。','（營火那邊開始喊各小隊的名字。）','我們小隊有群組嗎？拉我拉我，我要補進度。','（你把她拉進小隊的群組。她傳了一個貼圖。）'];
    check('B5. 第二天一句旁白、營火沛珊到了（10 第 5 點、10-7；預設「還好，昨天主要在玩遊戲。」）；沒有 Kevin 揭曉、「抱歉抱歉」「你加我一下好不好」',!block(fire)&&said.includes('小隊輔：這是沛珊。妳先坐這邊。')&&optsSeen.includes('「還好，昨天主要在玩遊戲。」/「妳怎麼今天才來？」')&&!said.some(t=>/臥底|就有人是假的|抱歉抱歉|你加我一下好不好|比較像新生/.test(t)),block(fire));
    const bkf=['（隔著桌子）哥，你的蛋。','哥？','（芯慈「喔」了一聲，繼續吃。）'];   /* CANON-1112：舊序章拿掉／可昕開局不認識：阿哲回答沛珊的那一句在講舊序章、稿沒有新字，拿掉了（列給 AA）*/
    check('B6. 早餐（10 第 8 點、10-5）：「哥？」是沛珊問、沒有明軒要蛋、沒有金頭腦',!block(bkf)&&said.includes('沛珊：哥？')&&!said.some(t=>/那顆蛋你不吃|他大我們一歲|水大地總共用了幾桶/.test(t)),block(bkf));
    const sp=camp0().filter(t=>/^(明軒|江明軒|柏翰|許柏翰|Alison|凱文|Kevin|主持的學長)：/.test(t));
    check('B7. 宿營裡明軒、柏翰、Alison、Kevin 都沒有台詞（10：不出場）',camp0().length>20&&sp.length===0,sp.join(' / '));
    check('B8. retired 的段落沒演（迎新晚會、夜遊、法律闖關、水大地、夜談：10-5 阿哲不同寢室）；沒有「睡你隔壁床」',!said.some(t=>/晚會是學長姐的場子|九點半，小隊輔帶小隊走|這關很簡單|三大桶水球|睡你隔壁床|燈關了/.test(t)));
    check('B9. next:false 不接 8/29（還在 8/24）',G.day===day('2025-08-24'),String(G.day));
    fresh(); GM.prefer=['「我不太會玩。」','（揉一下被撞到的肩膀）','「妳怎麼今天才來？」']; await STORY.campY1(GM,{next:false}); GM.prefer=null;
    check('B10. 另一組選項：撕名牌「欸，撞很大力喔？……抱歉抱歉。」；打牌「我教你。很快。」；營火「中友會也辦宿營，日期撞到了。……」',
      !inOrder(['欸，撞很大力喔？……抱歉抱歉。','張哲維，叫我阿哲。高雄上來的。','我教你。很快。','（交誼廳的角落，阿哲也在，看到你就笑了。）','嗨！我是不是錯過很多？我是遲到一天半的那個沛珊。','中友會也辦宿營，日期撞在一起。那邊中午一結束我就衝過來，行李都還沒打開。','我們小隊有群組嗎？拉我拉我，我要補進度。'])
      &&!said.some(t=>/撕名牌本來就是偷襲|那還好。我先去中友會/.test(t)),said.filter(t=>/抱歉抱歉|很快|中友會/.test(t)).join(' / '));
    /* CANON-1112：舊序章拿掉／可昕開局不認識：B11（econ 分支）、B12（said 分支）、B13（why_h 長句）三項拿掉——那四個分支照 AA_859 不在了；兩個新選項各自的字在 tests/canon_opening_1112_unit.js 第 4 節 */
    const fam=id=>SOCIAL.rel(id).fam|0; fresh(); SOCIAL.meet('zhe','camp'); SOCIAL.meet('classmate_xinci','camp'); const b0=[fam('zhe'),fam('classmate_xinci')]; await EVENTS.run(STORY_EVENTS.find(e=>e.id==='ev_camp_d1_free'));
    check('B14. 自由時間結尾熟悉 +1（芯慈、阿哲）',fam('zhe')-b0[0]===1&&fam('classmate_xinci')-b0[1]===1,JSON.stringify([b0,fam('zhe'),fam('classmate_xinci')])); }
  // ---------- D 中途讀檔 ----------
  fresh(); G.flags.CAMP_Y1_ON=true; G.flags.campStep=4; G.flags.campSeqV=2; G.day=day('2025-08-22'); await STORY.campY1(GM,{next:false});
  check('D1. 新版存檔 campStep=4：第一天四段不重演，從第二天接著演到結束',!said.some(t=>/遊覽車從校門口出發|撕名牌。每個人|晚餐後是自由時間/.test(t))&&said.some(t=>/第二天的活動排得很滿/.test(t))&&G.flags.CAMP_Y1===true&&!G.events.done.ev_camp_d1_bus);
  fresh(); G.flags.CAMP_Y1_ON=true; G.flags.campStep=5; G.day=day('2025-08-22'); await STORY.campY1(GM,{next:false});
  check('D2. 舊版存檔 campStep=5（演完夜遊 21:30）：從第二天接著演，沒有第一天的段落、沒有法律闖關',!said.some(t=>/遊覽車從校門口出發|撕名牌。每個人|晚餐後是自由時間|這關很簡單/.test(t))&&said.some(t=>/營火晚會開始沒多久/.test(t))&&G.flags.CAMP_Y1===true,said.slice(0,2).join(' / '));
  fresh(); G.flags.CAMP_Y1_ON=true; G.flags.campStep=2; G.day=day('2025-08-22'); let seqV=[]; const as0=GM.autosave; GM.autosave=()=>{ seqV.push(G.flags.campSeqV); as0(); }; await STORY.campY1(GM,{next:false}); GM.autosave=as0;
  check('D3. 舊版存檔 campStep=2（演完破冰）：接撕名牌、破冰不重演；接著演的存檔記 campSeqV 2，演完拿掉',said.some(t=>/撕名牌。每個人/.test(t))&&!said.some(t=>/輪流報名字/.test(t))&&seqV.length>0&&seqV.every(v=>v===2)&&G.flags.campSeqV==null,JSON.stringify(seqV));
  fresh(); G.flags.CAMP_Y1_ON=true; G.flags.campStep=3; G.day=day('2025-08-22'); await STORY.campY1(GM,{next:false});
  check('D4. 舊版存檔 campStep=3（演完舊的大地遊戲 13:30）：接自由時間（19:30）',!said.some(t=>/撕名牌。每個人/.test(t))&&said.some(t=>/晚餐後是自由時間/.test(t)));
  fresh(); G.flags.CAMP_Y1_ON=true; G.flags.campStep=10; G.day=day('2025-08-24'); await STORY.campY1(GM,{next:false});
  check('D5. 舊版存檔 campStep=10（演完夜談）：只剩早餐、結業',!said.some(t=>/營火晚會開始沒多久/.test(t))&&said.some(t=>/第三天早上/.test(t))&&said.some(t=>/十二點半，遊覽車停在校門口/.test(t))&&G.flags.CAMP_Y1===true);
  /* BUG-CAMP-RESUME-824-1103（BB 11-03）：最後一段演完的那一份自動存檔（campStep 8；ev_camp_d3_end 自己已經設了 CAMP_Y1）讀回來，要接著演「回到家」→ 8/29 搬宿舍 */
  { fresh(); const n=STORY.CAMP_SEQ.length; Object.assign(G.flags,{CAMP_Y1_ON:true,CAMP_Y1:true,campStep:n,campSeqV:2}); G.day=day('2025-08-24'); G.hour=12+56/60; let w1=0; const sw=STORY.startLawWeek1; STORY.startLawWeek1=async()=>{ w1++; };
    const ok=await STORY.campY1(GM,{resume:true}); STORY.startLawWeek1=sw;
    check('D6. campStep '+n+'＋CAMP_Y1 true＋CAMP_Y1_ON true：不重演任何一段、演「回到家」、接 8/29 搬宿舍（startLawWeek1）；收尾後 CAMP_Y1_ON false、沒有 campStep',ok===true&&said.some(t=>/回到家，你把營地帶回來的衣服/.test(t))&&!said.some(t=>/十二點半，遊覽車停在校門口|遊覽車從校門口出發/.test(t))&&w1===1&&G.flags.CAMP_Y1===true&&G.flags.CAMP_Y1_ON===false&&G.flags.campStep==null,JSON.stringify({ok,w1,said:said.slice(0,3)}));
    fresh(); G.flags.CAMP_Y1=true; G.flags.CAMP_Y1_ON=false; const ok2=await STORY.campY1(GM,{resume:true});
    check('D7. 宿營已經收尾（CAMP_Y1 true、CAMP_Y1_ON false）：不再演',ok2===false&&!said.length);
    const g3=require('fs').readFileSync(require('path').join(ROOT,'src/game3d.js'),'utf8');
    check('D8. 讀檔（game3d applySave）：CAMP_Y1 已經 true 但 campMidway 也會接著演',/CAMP_Y1_ON&&\(!G\.flags\.CAMP_Y1\|\|\(STORY\.campMidway&&STORY\.campMidway\(G\.flags\)\)\)&&STORY\.campY1/.test(g3)); }
  // ---------- E 宿營之後 ----------
  fresh(); picks=[]; await STORY.campY1(GM,{next:false}); delete G.flags.ZHE_CALLS_GE; const evZ=STORY_EVENTS.find(e=>e.id==='ev_zhe_w1_meet'); G.day=day('2025-09-01'); G.flags.LAW_START_DAY=day('2025-08-29'); G.flags.MAIN_D1=-13;
  check('E1. 9/1 宿營認識阿哲：ev_zhe_w1_meet 的條件成立（已經 MET_ZHE 也演宿營版；AA_608 10-6 起新局一定有 ZHE_CALLS_GE，這裡拿掉旗標＝沒被叫哥的舊存檔）',EVENTS.cond(evZ.prereq)===true||(evZ.prereq.custom&&evZ.prereq.custom(G)===true));
  const fam0=JSON.stringify(G.rel.zhe||null); said=[]; await EVENTS.run(evZ);
  check('E2. 宿營版：書包放旁邊、「欸，早。」、問中午吃什麼；不換名字、不加熟悉、記 ZHE_W1_CAMP',said.includes('（你坐下沒多久，有人把書包放到你旁邊的位子。）')&&said.includes('阿哲：欸，早。')&&said.some(t=>/我昨天在公館繞了半小時/.test(t))&&!said.some(t=>/我阿哲。張哲維。/.test(t))&&!said.some(t=>/用筆輕輕戳/.test(t))&&JSON.stringify(G.rel.zhe||null)===fam0&&G.flags.ZHE_W1_CAMP===true,said.join(' / '));
  fresh(); picks=[]; await STORY.campY1(GM,{next:false}); G.day=day('2025-09-01'); said=[]; await EVENTS.run(STORY_EVENTS.find(e=>e.id==='ev_zhe_w1_meet'));
  check('E3. 有 ZHE_CALLS_GE：「哥，早。」',said.includes('阿哲：哥，早。'));
  said=[]; await EVENTS.run(STORY_EVENTS.find(e=>e.id==='ev_mingxuan_ball'));
  check('E4. 新局宿營（沒有兩人三腳）：系籃開頭「欸，你也來打球喔？」（events.js 原本的另一句；明軒宿營沒認識，接著自我介紹）；對話框寫「明軒」（AA_606 第 2 節）',said[0]==='明軒：欸，你也來打球喔？'&&!said.some(t=>/兩人三腳/.test(t)),said.slice(0,2).join(' / '));
  { const mx0=G.flags.MX_CAMP_PAIR; G.flags.MX_CAMP_PAIR=true; delete G.events.done.ev_mingxuan_ball; said=[]; await EVENTS.run(STORY_EVENTS.find(e=>e.id==='ev_mingxuan_ball')); if(mx0===undefined) delete G.flags.MX_CAMP_PAIR; else G.flags.MX_CAMP_PAIR=mx0;
    check('E4b. 舊存檔（宿營兩人三腳和明軒一組，MX_CAMP_PAIR）：系籃照舊「欸，宿營兩人三腳那個。你也來打球喔？」',said[0]==='明軒：欸，宿營兩人三腳那個。你也來打球喔？',said.slice(0,2).join(' / ')); }
  { G.flags.DORM_FOUR=true; delete G.flags.ZHE_W1_CAMP; delete G.flags.ZHE_W1_DORM; G.flags.LAW_START_DAY=day('2025-08-29'); G.flags.MAIN_D1=-13; G.day=day('2025-09-01');
    const evD=STORY_EVENTS.find(e=>e.id==='ev_zhe_w1_dorm'), evM=STORY_EVENTS.find(e=>e.id==='ev_zhe_w1_meet'), evB=STORY_EVENTS.find(e=>e.id==='ev_bohan_w1_front');
    check('E6. 四人房（DORM_FOUR）：9/1 早上宿舍版的條件成立',!!evD&&evD.location==='dorm'&&evD.prereq.custom(G)===true);
    const fam1=JSON.stringify(G.rel.zhe||null); said=[]; picks=['校門對面那排有一間燒臘店'];   /* AA_313 5-3（AA_389 第 6 點照逐場表）：阿鳳麵店在公館那排店面，不在溫州街 */ await EVENTS.run(evD);
    check('E7. 宿舍版（AA_208 2-2）：柏翰的床已整理好 → 哥，你第一堂什麼？→ 憲法。→ 一起走 → 這三天都吃便利商店 → 麵店；ZHE_W1_NOODLE、不加熟悉',said.join('|').indexOf('（早上，柏翰的床已經整理好了，人不在。）|阿哲：哥，你第一堂什麼？|祐廷：憲法。|阿哲：我也是。一起走。|阿哲：中午吃什麼？我這三天都吃便利商店。|阿哲：燒臘喔，好。在哪？')===0&&G.flags.ZHE_W1_NOODLE===true&&G.flags.ZHE_W1_DORM===true&&JSON.stringify(G.rel.zhe||null)===fam1,said.join(' / '));
    check('E8. 宿舍版演過：教室的宿營版不再演；到教室「柏翰坐在第一排正中間」',evM.prereq.custom(G)===false&&evB.prereq.custom(G)===true);
    said=[]; await EVENTS.run(evB); check('E9. 到教室的旁白',said[0]==='（柏翰坐在第一排正中間，已經在看課本了。）',said.join(' / ')); }
  const wel=ACTIVITIES.list.find(a=>a.id==='welcome_y1s1'), d831=day('2025-08-31');   /* AA_310：備用的迎新改到開學前 8/31 上午（原本 9/27）*/
  check('E5. 有宿營（CAMP_Y1）的局 8/31 備用迎新不排；沒有宿營的（開發起點）照排',ACTIVITIES.on(wel,d831,G)===false&&ACTIVITIES.on(wel,d831,{flags:{}})===true);
  { fresh(); G.flags.introDone=true; G.flags.DORM_FOUR=true; said=[]; await EVENTS.run(STORY_EVENTS.find(e=>e.id==='ev_typhoon_noodles_y1'));
    check('E10. 四人房的颱風夜（AA_208 2-3）：柏翰「（在讀張教授寄來的講義）……第二十頁了。」（AA_372 第 17 項：10/12 群組說第十二頁）、阿哲「（拿走一包泡麵）我出熱水。」',said.some(t=>/柏翰：（在讀張教授寄來的講義）……第二十頁了。$/.test(t))&&said.includes('阿哲：（拿走一包泡麵）我出熱水。'),said.slice(0,4).join(' / '));
    said=[]; G.hour=23.75; await EVENTS.run(STORY_EVENTS.find(e=>e.id==='ev_dorm_late_kai'));   /* 2026-10-28：AA_502 第 6 節第 8 點，這個事件改成 23:30 以後（原本 23:00）、四人房那一行照誰在床上——用 23:45（9/17 週三，阿哲、柏翰 23:30 都上床了）；原本在 21:12 直接演 */
    check('E11. 四人房的阿凱深夜（AA_208 2-4）：「（阿哲和柏翰都上床了。柏翰戴著耳塞。）」——2026-10-28 改：AA_502 第 6 節第 8 點（AA-C）四人房那一行照誰在床上，兩個都在＝這一句（原本一律「（阿哲已經睡了，柏翰戴著耳塞。）」；只有阿哲、都不在的版本在 tests/aa502_dorm203_unit.js 第 9 項）',said[0]==='（阿哲和柏翰都上床了。柏翰戴著耳塞。）',said.slice(0,2).join(' / '));
    fresh(); G.flags.introDone=true; said=[]; await EVENTS.run(STORY_EVENTS.find(e=>e.id==='ev_dorm_late_kai'));
    check('E12. 沒有四人房的舊局不加',!said.some(t=>/柏翰戴著耳塞/.test(t))); }
  // ---------- J 9/2 國文沛珊、通識明軒（BB_168 2-1、3-1；BB_177 第 10、12 節）----------
  { const ev=id=>STORY_EVENTS.find(e=>e.id===id), w1=()=>{ G.flags.MAIN_D1=STORY.MAIN_D1_NEW; G.flags.LAW_START_DAY=day('2025-08-29'); G.day=day('2025-09-02'); G.weekday=2; };
    fresh(); w1(); SOCIAL.meet('classmate_peishan','camp'); said=[]; picks=['我也差點走錯'];
    check('J1. 9/2 國文找教室：上課前（beforeClass chinese_y1）、只在 9/2',ev('ev_ps_w1_room').beforeClass==='chinese_y1'&&ev('ev_ps_w1_room').prereq.custom(G)===true);
    await EVENTS.run(ev('ev_ps_w1_room'));
    check('J2. 宿營認識的版本：「（在門口看到你，走過來）欸，{name}。你也是這間嗎？」→「我也差點走錯。」→「對吧，這邊的門牌小成那樣，是在考我們視力。」（她先推門）；不記 PS_W1_SEEN',said.some(t=>/沛珊：（在門口看到你，走過來）欸，(\{name\}|祐廷)。你也是這間嗎？$/.test(t))&&said.some(t=>/沛珊：對吧，這邊的門牌小成那樣，是在考我們視力。$/.test(t))&&said.includes('（她先推門。）')&&!G.flags.PS_W1_SEEN,said.join(' / '));
    said=[]; picks=['有，你要拍嗎']; check('J3. 下課借筆記的條件（同一天、找教室演過）',ev('ev_ps_w1_notes').afterClass==='chinese_y1'&&ev('ev_ps_w1_notes').prereq.custom(G)===true); await EVENTS.run(ev('ev_ps_w1_notes'));
    check('J4. 下課：「剛剛最後那段你有抄到嗎？他講好快。」→ 拍兩張 →「謝謝！我下次坐你旁邊，直接看比較快。」',said.some(t=>/（轉過來）剛剛最後那段你有抄到嗎？他講好快。$/.test(t))&&said.includes('（她拍了兩張。）')&&said.some(t=>/謝謝！我下次坐你旁邊，直接看比較快。$/.test(t)),said.join(' / '));
    fresh(); w1(); said=[]; picks=['我也在找']; await EVENTS.run(ev('ev_ps_w1_room'));
    check('J5. 沒去宿營的版本：「不好意思，請問這間是大一國文嗎？法律系那班。」→ 一起進去；記 PS_W1_SEEN',said.some(t=>/不好意思，請問這間是大一國文嗎？法律系那班。$/.test(t))&&said.some(t=>/那我們一起進去好了，錯了一起出來。$/.test(t))&&G.flags.PS_W1_SEEN===true,said.join(' / '));
    fresh(); w1(); SOCIAL.meet('classmate_mingxuan','camp'); said=[]; picks=['有，運氣好']; await EVENTS.run(ev('ev_mx_w1_addclass'));
    check('J6. 通識門口明軒（宿營認識）：「（點個頭）欸。你也加這門？」→ 沒抽到 → 老師「這堂人數已經滿了…」→「我去看另一堂，下一節的。」；記 MX_W1_SEEN',ev('ev_mx_w1_addclass').beforeClass==='ge_film_y1s1'&&said.some(t=>/（點個頭）欸。你也加這門？$/.test(t))&&said.includes('老師：這堂人數已經滿了。沒選到的同學，加選期間有人退就有機會，不用在門口等。')&&said.some(t=>/我去看另一堂，下一節的。$/.test(t))&&G.flags.MX_W1_SEEN===true,said.join(' / '));
    G.day=day('2025-09-10'); said=[]; await EVENTS.run(ev('ev_mingxuan_ball'));
    check('J7. 系籃（有 MX_W1_SEEN、沒有兩人三腳）開頭「欸，你是電影那堂有選到的那個？」、9/15 前「我還在等有人退，大概沒望了。」',/欸，你是電影那堂有選到的那個？$/.test(said[0]||'')&&/我還在等有人退，大概沒望了。$/.test(said[1]||''),said.slice(0,3).join(' / '));
    G.day=day('2025-09-20'); G.events.done={}; said=[]; await EVENTS.run(ev('ev_mingxuan_ball'));
    check('J8. 9/15 以後：「我後來沒加到，去修別的了。」',/我後來沒加到，去修別的了。$/.test(said[1]||''),said.slice(0,3).join(' / ')); }
  // ---------- K 9/2 新生茶會（AA_195 4-5、BB_168 第 7 節；學姊不在茶會：使用者 08:2x、BB-C 798e9b14）＋Kevin 群組訊息 ----------
  { const setup=(o)=>{ fresh(); Object.assign(G.flags,{MAIN_D1:STORY.MAIN_D1_NEW,LAW_START_DAY:day('2025-08-29'),KAI_MOVEIN:true,CAMP_Y1:true,FAM_GROUP_SENT:true},o||{}); G.day=day('2025-09-02'); G.weekday=2; G.zone='wancai'; GM.E.interactables=[{deskStudy:true,seat:{x:1.8,z:-1.9,yaw:Math.PI}}]; GM.rels=[]; said=[]; };
    const has=re=>said.some(t=>re.test(t)), sisFirst=()=>(G.social.mem.heroine_05||[]).find(m=>m.tag==='FIRST_MET');
    setup(); G.hour=17.6; STORY.teaTick(GM);
    check('K1. 9/2 17:30 手機提醒＋任務欄「18:30 新生茶會（法律系館B一樓大廳）」',G.flags.TEA_REMIND===true&&G.goal==='18:30 新生茶會（法律系館B一樓大廳）',G.goal);
    G.hour=18.6; STORY.teaTick(GM); await flush();
    check('K2. 18:30 進萬才館＝簽到桌 Kevin（AA 11-03：第一次見面）：「我 Kevin，大二，系學會的。有事找我。」、家族那一桌在窗邊；不說直屬是誰（9/4 才分直屬）；認識 Kevin；任務欄、互動點',said.includes('Kevin：我 Kevin，大二，系學會的。有事找我。')&&!has(/這次是真的學長/)&&said.includes('Kevin：家族那一桌在窗邊，我等一下過去。')&&!has(/直屬|溫書瑀|學姊/)&&G.flags.TEA_STEP===1&&(G.social.mem.kevin||[]).some(m=>m.tag==='FIRST_MET')&&G.goal==='走到窗邊家族那一桌'&&GM.E.interactables.some(i=>i.teaTable),said.slice(0,4).join(' / '));
    check('K3. 學姊不在茶會（使用者 08:2x；BB-C 798e9b14）：沒有「學姊說她會來」的挽留、沒有 19:10 招手',typeof STORY.teaLeave==='undefined'&&typeof STORY.teaWave==='undefined'&&typeof STORY.teaSis==='undefined');
    setup({FAM_GROUP_REPLIED:true}); G.hour=18.6; await STORY.teaSignIn(GM); said=[]; picks=['要，謝謝學長']; await STORY.teaTable(GM);
    const q=(G.phone&&G.phone.q||[]).map(x=>x.tag+'@'+x.day+'/'+x.h);
    check('K4. 家族那一桌：Kevin 坐過來問考古題 → 選①「好，晚上丟群組。」、排 21:00 家族群組考古題',has(/Kevin：群組說的考古題，民總跟憲法的，去年的。你要先看嗎？/)&&said.includes('Kevin：好，晚上丟群組。')&&G.flags.TEA_EXAM===1&&q.includes('kevin_exam@'+day('2025-09-02')+'/21'),q.join(' '));
    check('K5. 家族那一桌演完就結束（TEA_STEP 3）：學姊沒有出現、沒有記認識（FIRST_MET／met_sis 只有 W1 記）',G.flags.TEA_STEP===3&&!has(/溫書瑀|溫學姊|直屬|她是我的/)&&!G.flags.met_sis&&!sisFirst()&&!GM.rels.some(r=>r[0]==='sis'),said.join(' / '));
    setup(); G.hour=18.7; await STORY.teaSignIn(GM); G.hour=19.3; said=[]; STORY.teaTick(GM); await flush();
    check('K6. 19:10 以後還沒走到那一桌：不會被叫過去（招手是學姊到了那一拍，拿掉）',said.length===0&&G.flags.TEA_STEP===1,said.join(' / '));
    setup(); G.hour=19.5; const n0={obj:{position:{x:0,z:0}},seat:true}; said=[]; await STORY._v1.talkSis(GM,n0);
    check('K8. 9/4 分直屬以前跟學姊說話：只有「（她在看手機，沒有抬頭。）」（AA-C 2026-10-18 SIS-W1 第 ① 點），不記認識',said.join('|')==='（她在看手機，沒有抬頭。）'&&!G.flags.met_sis&&!sisFirst(),said.join(' / '));
    G.day=day('2025-09-03'); G.weekday=3; G.hour=15; said=[]; await STORY._v1.talkSis(GM,n0);
    check('K9. 9/3（還沒分直屬）：一樣只有那一行旁白，沒有舊的備用初遇',said.join('|')==='（她在看手機，沒有抬頭。）'&&!G.flags.met_sis&&!has(/學號尾數|三件事|讀書會/),said.join(' / '));
    fresh(); G.flags.MAIN_D1=STORY.MAIN_D1_NEW; G.flags.LAW_START_DAY=day('2025-08-29'); G.day=day('2025-08-29'); STORY.familyW0(G); G.day=day('2025-09-05'); G.hour=20.1; PHONE.tick(G);
    const kb=G.msgs.filter(m=>m.th==='g:family_law'&&m.from==='kevin'&&m.day===day('2025-09-05')), last=kb[kb.length-1];
    check('K10. 9/5 20:00 Kevin 的舊書（所有在群組的人）：三則、可以回「我要。」→ KEVIN_OLD_BOOK、「下禮拜一放系學會辦公室」',kb.length===3&&last.ask&&last.ask.opts.map(o=>o.t).join('/')==='我要。'&&(PHONE.answer(G,last.ask.id,0),G.flags.KEVIN_OLD_BOOK===true)&&G.msgs.some(m=>m.text==='好，下禮拜一放系學會辦公室，寫你名字。'),kb.map(m=>m.text).join(' | ')); }
  // ---------- L 第一週其餘（W1_AUDIT 第 7、16、17、19 項）----------
  { fresh(); Object.assign(G.flags,{MAIN_D1:STORY.MAIN_D1_NEW,LAW_START_DAY:day('2025-08-29'),MET_ZHE:true}); G.day=day('2025-09-01'); G.weekday=1; G.hour=9.5;
    const CLS0=global.CLS; global.CLS={dayItems:G=>G.hour>=9&&G.hour<12.2?[{c:{kind:'required',id:'const_1'},room:{zone:'linze',room:'201'},t0:9+10/60,t1:12+10/60,key:'const_1'}]:[],live:()=>true};   /* 課表的替身：9/1 憲法 9:10～12:10 */
    const z=STORY.whereIs(GM,'zhe'); check('L1. 新局、認識阿哲以後：9/1 上課時間在教室（同班必修，AA_195 4-8：LEGACY_IDS 只對上課時間放寬）',!!(z&&z.zone==='linze'),JSON.stringify(z));
    G.hour=20; const z2=STORY.whereIs(GM,'zhe'); check('L2. 下課以後（主線第一天下午之前）照舊不猜',z2===null,JSON.stringify(z2));
    G.flags.MET_ZHE=false; G.hour=9.5; check('L3. 還沒認識阿哲：照舊不猜',STORY.whereIs(GM,'zhe')===null); global.CLS=CLS0;
    fresh(); Object.assign(G.flags,{MAIN_D1:STORY.MAIN_D1_NEW,LAW_START_DAY:day('2025-08-29')}); G.day=day('2025-08-31'); G.hour=14.2; STORY.lawClassJoinY1(G); G.day=day('2025-09-09'); G.hour=22.1; PHONE.tick(G);
    const lc=G.msgs.filter(m=>m.th==='g:law_class'&&m.day===day('2025-09-09')).map(m=>m.name+':'+m.text);
    check('L4. 第 2 週 9/9 22:00 班群（BB_168 2-2）：沛珊問民總教科書、阿哲「我有學長的舊版」',lc.join('|')==='沛珊:請問有人知道民總的指定教科書要買哪一本嗎|沛珊:老師說了兩本 我只抄到一本|阿哲:我有學長的舊版 你要的話我拍給你|沛珊:好 謝謝！',lc.join(' | '));
    check('L5. 校慶 11/15、運動會 11/21 停課（AA_195 第 3 節：CALENDAR.SCHOOL）',CALENDAR.holiday(day('2025-11-21'))==='運動會（停課）'&&CALENDAR.holiday(day('2025-11-15'))==='校慶'&&CALENDAR.kind(day('2025-11-21'))==='holiday');
    const sk01=STORY_EVENTS.find(e=>e.id==='ev_sk01_soc'), n1=STORY_EVENTS.find(e=>e.id==='ev_sk04_note1');
    fresh(); Object.assign(G.flags,{MAIN_D1:STORY.MAIN_D1_NEW,LAW_START_DAY:day('2025-08-29')}); G.day=day('2025-09-10');
    /* AA_294 ②（企劃 b3ec8820）：第一張延到下一次出席，到第 12 週（原本新局第 1～3 週、第 4 週不行）*/
    check('L6. SK01 第 1～6 週；SK04 第一張便利貼新局第 2 週可以、第 4 週也可以（AA_294 ②：到第 12 週）、第 13 週不行',JSON.stringify(sk01.weeks)==='[1,2,3,4,5,6]'&&!!n1&&(()=>{ const ok2=n1.prereq.custom(G); G.day=day('2025-09-24'); const ok4=n1.prereq.custom(G); G.day=STORY.termDay('Y1S1',13,4); const ok13=n1.prereq.custom(G); return ok2!==false&&ok4!==false&&ok13===false; })()); }
    { /* A2b（CAMP-DAYHOUR-1104，BB-C 11-04 17:30／CC T1 隨機快轉）：換到下一天的日期卡那一刻，日期和時間要一起換——原本先設 G.day、等 1.6 秒字卡才設 G.hour（8/23 配上 8/22 晚上 19:30，接著退回 17:30）*/
    const tc0=GM.titleCard, at=[]; GM.titleCard=async(a,b)=>{ at.push({b:b||'',day:G.day,h:G.hour}); };
    fresh(); await STORY.campY1(GM,{next:false}); GM.titleCard=tc0; const d0=day('2025-08-22');
    for(const off of [1,2]){ const c=at.find(x=>x.b==='迎新宿營 第 '+(off+1)+' 天'), first=STORY.CAMP_SEQ.find(x=>x[1]===off);
      check('A2b. 第 '+(off+1)+' 天的日期卡那一刻：日期＝8/'+(22+off)+'、時間＝那天第一段的 '+first[2]+'（不是前一晚的時間）',!!c&&c.day===d0+off&&Math.abs(c.h-first[2])<1e-9,JSON.stringify(c)); } }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
