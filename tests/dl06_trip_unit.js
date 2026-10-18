// DL-06 捷運自由出行第一批（AA_160 第 4 節、AA_161 的四個景點：西門町、北美館、大稻埕、淡水）——不需要瀏覽器。
// 檢查：景點清單與底圖；能不能去（還沒開、待不到一小時、休館日、颱風假、次數用完、錢不夠、太晚回不來、期末考）；
//       出發扣這個時段 1 次、車資去回各一半、到達時間；景點選單（第一次來的台詞、散步一趟最多 2 次、互動點做過變灰、夕陽時間、下雨、拍一張照）；
//       跨進下一個時段 30 分鐘以上扣下一個時段、沒有次數＝只剩回去；回公館（捷運站口）／直接回宿舍；會錯過的課先問；途中存檔讀回來接著選單；去過幾次（第二次來換台詞）。
// 修改前：沒有 TRIP（第 1 項就失敗）。用法：node tests/dl06_trip_unit.js
const vm=require('vm'), fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.location={search:''}; global.document={getElementById:()=>null,addEventListener(){}};
for(const f of ['src/data/characters.js','src/data/places.js','src/data/calendar.js','src/data/courses.js','src/classes3d.js','src/outings3d.js','src/data/free_trips.js','src/freetrip3d.js'])
  vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (CHARACTERS|PLACES|SOCIAL_GRAPH|UNFAMILIAR_POOL|PORTRAITS|CALENDAR|COURSES|CLS|OUT|FREE_TRIPS|TRIP)\s*=/mg,'global.$1='),{filename:f});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
check('1. 有 TRIP.menu、go、loop、back、check、tick，第一批四個景點＋第二批五個（DL-06B）＋第三批十八個（DL-06C spots_v3 3b599624；開車的 D15、D16、D22、D23、D32 不收）',typeof TRIP!=='undefined'&&['menu','go','loop','back','check','tick','at'].every(k=>typeof TRIP[k]==='function')&&TRIP.list().map(s=>s.id).join()==='D04,D06,D12,D13,D09,D18,D20,D24,D25,D01,D02,D03,D05,D07,D08,D10,D11,D14,D17,D19,D21,D26,D27,D28,D29,D30,D31',TRIP.list().map(s=>s.id).join());
if(fails){ console.log('FAILED '+fails); process.exit(1); }
check('1. 每個景點的底圖都接上（OUT.BG 有圖、檔案在 repo 裡）',TRIP.list().every(s=>OUT.BG[s.bg]&&OUT.BG[s.bg].image&&fs.existsSync(path.join(ROOT,OUT.BG[s.bg].image))));
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
const SAT=dayOf('2025-10-04'), MON=dayOf('2025-10-06'), TUE=dayOf('2025-10-07');
const mkG=(day,hour,o)=>Object.assign({day,hour,weekday:CALENDAR.dateOf(day).wd%7,zone:'gongguan',flags:{},courses:{},invites:[],money:5000,weather:'clear'},o||{});
/* 假的 GM：選單照 ans 依序回答（函式＝看選項決定），記下所有台詞、選單、提示、進入的區域 */
const mkGM=(G,ans)=>{ const q=(ans||[]).slice(); const L={says:[],menus:[],toasts:[],enters:[],cards:[],saves:0};
  const GM={G,L,E:{player:{obj:{position:{x:0,y:0,z:0}}}},sceneBegin(){},sceneEnd(){},fade:async()=>{},titleCard:async(a,b)=>{ L.cards.push(a+'｜'+b); },
    say:async(who,t)=>{ L.says.push(t); },toast(t){ L.toasts.push(t); },advance(h){ G.hour+=h; },money(d){ G.money+=d; },autosave(){ L.saves++; },
    enter:async(z,sp)=>{ G.zone=z; L.enters.push(z+'@'+(sp?sp.x+','+sp.z:'')); },
    choose:async o=>{ const m=o.map(x=>x.t+(x.dim?'〔灰：'+(x.hint||'')+'〕':'')); L.menus.push(m); if(!q.length) return o.length-1; const a=q.shift(); return typeof a==='function'?a(o):(typeof a==='string'?o.findIndex(x=>x.t===a):a); } };
  return GM; };
const sp=id=>TRIP.spot(id);
// 2. 能不能去
{ check('2. 週六 10:00 去西門町（17:00 開）：「現在去還沒開（17:00 開）」',TRIP.check(mkG(SAT,10),sp('D04')).why==='現在去還沒開（17:00 開）',TRIP.check(mkG(SAT,10),sp('D04')).why);
  check('2. 週六 16:00 去西門町：16:15 到、等 45 分鐘開門也行',TRIP.check(mkG(SAT,16),sp('D04')).ok);
  check('2. 週六 22:30 去西門町（23:00 關）：「現在去，待不到一小時就關了」',TRIP.check(mkG(SAT,22.5),sp('D04')).why==='現在去，待不到一小時就關了');
  check('2. 週一去北美館：「今天休館」',TRIP.check(mkG(MON,10),sp('D06')).why==='今天休館');
  check('2. 錢不夠來回車資（淡水 100 元，身上 80）：「錢不夠」',TRIP.check(mkG(SAT,15,{money:80}),sp('D13')).why==='錢不夠');
  const G=mkG(SAT,13); CLS.slotUse(G,['pm']); CLS.slotUse(G,['pm']); check('2. 下午的次數用完：「這個下午已經排滿了」',TRIP.check(G,sp('D12')).why==='這個下午已經排滿了');
  let ty=null; for(let d=-400;d<400&&ty==null;d++) if(CALENDAR.typhoon(d)) ty=d;
  check('2. 颱風假：「颱風假，捷運停駛」',ty!=null&&TRIP.check(mkG(ty,14),sp('D12')).why==='颱風假，捷運停駛',String(ty));
  let ex=null; for(let d=SAT;d<SAT+140&&!ex;d++){ const G2=mkG(d,8); const it=CLS.dayItems(G2).find(i=>i.exam==='final'&&i.t0>=10&&i.t0<=16); if(it&&CALENDAR.dateOf(d).wd%7!==1) ex={d,it}; }   /* 北美館週一休：找不是週一的 */
  if(ex){ const G3=mkG(ex.d,ex.it.t0-1); const ks=TRIP.list().map(q=>TRIP.check(G3,q).why); check('2. 期末考那一段時間：灰掉寫「期末考（時間 科目）」',ks.some(w=>/^期末考（/.test(w)),JSON.stringify(ks)); }
  else check('2. 找得到期末考的日子',false); }
// 2b. 第二批（DL-06B，spots_v2＠32d11245）的規則
{ check('2b. free_trips.js 第二批來自匯入白名單 spots_v2.json＠32d11245',/spots_v2\.json@32d11245/.test(FREE_TRIPS.source||''),FREE_TRIPS.source);
  check('2b. 貓空週一：「纜車今天停駛」（不是「今天休館」）',TRIP.check(mkG(MON,14),sp('D09')).why==='纜車今天停駛',TRIP.check(mkG(MON,14),sp('D09')).why);
  check('2b. 貓空下雨、颱風天氣：「下雨，纜車停了」',TRIP.check(mkG(SAT,14,{weather:'rain'}),sp('D09')).why==='下雨，纜車停了'&&TRIP.check(mkG(SAT,14,{weather:'typhoon'}),sp('D09')).why==='下雨，纜車停了');
  check('2b. 九份下雨照樣能去',TRIP.check(mkG(SAT,14,{weather:'rain'}),sp('D18')).ok,TRIP.check(mkG(SAT,14,{weather:'rain'}),sp('D18')).why);
  let xw=null; for(let d=SAT;d<SAT+80&&xw==null;d++){ if(CLS.examWeek(mkG(d,9))&&CALENDAR.dateOf(d).wd%7===6) xw=d; }
  check('2b. 礁溪、外澳考試週不能去：「考試週，太遠了」；烏來照常',xw!=null&&TRIP.check(mkG(xw,10),sp('D24')).why==='考試週，太遠了'&&TRIP.check(mkG(xw,14),sp('D25')).why==='考試週，太遠了'&&TRIP.check(mkG(xw,10),sp('D20')).why!=='考試週，太遠了',String(xw));
}
// 3. 出發：扣次數、車資、到達時間；選單、回程
(async()=>{
  { const G=mkG(SAT,14), gm=mkGM(G,['回去','回公館']); await TRIP.go(gm,sp('D09')); if(TRIP.at(G)) await TRIP.loop(gm);
    check('2b. 兩段交通（legs）：出發的標題卡「捷運到動物園站→貓空纜車｜公館 → 貓空纜車與茶館　60 分鐘」、回程反過來',gm.L.cards[0]==='捷運到動物園站→貓空纜車｜公館 → 貓空纜車與茶館　60 分鐘'&&/貓空纜車與茶館 → 公館/.test(gm.L.cards[gm.L.cards.length-1]||''),JSON.stringify(gm.L.cards)); }
  { const G=mkG(SAT,13); const gm=mkGM(G,[1, '到館外的草地走走', '看展', '看展', '回去', '回公館']);
    // 選單第 2 項（index 1）是北美館
    const r=await TRIP.menu(gm);
    check('3. 「捷運公館站。要去哪裡？」二十七個景點（第一批四、第二批五、第三批十八）＋不去了',gm.L.says[0]==='捷運公館站。要去哪裡？'&&gm.L.menus[0].length===28&&gm.L.menus[0][27]==='不去了',JSON.stringify(gm.L.menus[0].length));
    check('3. 出發扣下午 1 次',CLS.slotRec(G).used.pm===1,JSON.stringify(CLS.slotRec(G).used));
    check('3. 標題卡「捷運（中正紀念堂轉淡水信義線）｜公館 → 圓山　30 分鐘」',gm.L.cards[0]==='捷運（中正紀念堂轉淡水信義線）｜公館 → 圓山　30 分鐘',gm.L.cards[0]);
    check('3. 第一次來：arrive[0]',gm.L.says[1]===sp('D06').arrive[0],gm.L.says[1]);
    const m2=gm.L.menus[1]; check('3. 景點選單：散步、三個互動點、拍一張照、回去',m2.length===6&&m2[0]==='到館外的草地走走'&&m2[4]==='拍一張照'&&m2[5]==='回去',JSON.stringify(m2));
    const m4=gm.L.menus[3]; check('3. 看過展以後「看展」變灰「做過了」；散步還可以（2 次）',m4.some(t=>t==='看展〔灰：做過了〕')&&m4[0]==='到館外的草地走走',JSON.stringify(m4));
    check('3. 選了變灰的：提示「做過了」，不重複扣錢',gm.L.toasts.includes('做過了'));
    check('3. 回去：回公館（捷運站口 -35.6,13.2）、G.trip 清掉、去過北美館 1 次',r===true&&gm.L.enters[0]==='gongguan@-35.6,13.2'&&G.trip===null&&G.places.free.D06===1,JSON.stringify(gm.L.enters));
    check('3. 錢：車資 60（去 30、回 30）＋看展 30＝少 90 元',G.money===5000-90,String(G.money));
    check('3. 時間：13:00 出發＋30 分＋散步 30＋看展 60＋回程 30＝15:30',Math.abs(G.hour-15.5)<1e-6,String(G.hour));
    check('3. 結束時有存檔（途中也存）',gm.L.saves>=3,String(gm.L.saves));
    // 第二次來換台詞；直接回宿舍多 10 分鐘
    G.hour=13; const gm2=mkGM(G,[1,'回去','直接回宿舍']); await TRIP.menu(gm2);
    check('4. 第二次來北美館：arrive[1]',gm2.L.says[1]===sp('D06').arrive[1],gm2.L.says[1]);
    check('4. 直接回宿舍：進宿舍、多 10 分鐘（13:00＋30＋30＋10＝14:10）',gm2.L.enters[0].startsWith('dorm@')&&Math.abs(G.hour-(14+10/60))<1e-6,gm2.L.enters[0]+' '+G.hour);
    check('4. 第二趟：下午用掉第 2 次（2／2）',CLS.slotRec(G).used.pm===2);
    G.hour=14.5; const gm3=mkGM(G,[1]); await TRIP.menu(gm3);
    check('4. 第三次想去：灰掉「這個下午已經排滿了」，不出發',gm3.L.menus[0][1]==='臺北市立美術館〔灰：這個下午已經排滿了　（捷運 30 分鐘・來回 60 元・09:30–17:30（週一休））〕'&&gm3.L.toasts[0]==='這個下午已經排滿了'&&!G.trip,JSON.stringify(gm3.L.menus[0][1])); }
  // 5. 夕陽、下雨、跨時段、沒有次數＝只剩回去
  { const G=mkG(SAT,15); const ss=TRIP.sunset(G); // 10 月 17.58
    const gm=mkGM(G,[2,o=>{ const i=o.findIndex(x=>x.t==='在河邊看夕陽'); return i; },'回去','回公館']); await TRIP.menu(gm);
    check('5. 10 月大稻埕 15:30 到：「在河邊看夕陽」灰掉「還沒到夕陽的時間」',gm.L.menus[1].includes('在河邊看夕陽〔灰：還沒到夕陽的時間〕')&&gm.L.toasts.includes('還沒到夕陽的時間'),JSON.stringify(gm.L.menus[1])+' ss='+ss);
    const G2=mkG(SAT,15.2,{weather:'rain'}); const gm2=mkGM(G2,[2,'沿著迪化街走','回去','回公館']); await TRIP.menu(gm2);
    check('5. 下雨：碼頭、夕陽（outdoor）灰掉「下雨」；老茶行（室內）照常',gm2.L.menus[1].includes('大稻埕碼頭〔灰：下雨〕')&&gm2.L.menus[1].includes('老茶行'),JSON.stringify(gm2.L.menus[1]));
    check('5. 下雨散步用 rain 那一句',gm2.L.says.includes([].concat(sp('D12').walk.rain)[0]),JSON.stringify(gm2.L.says));
    // 16:40 出發去大稻埕：17:10 到；夕陽 16:55～17:45 之間可以選
    const G3=mkG(SAT,16.7); const gm3=mkGM(G3,[2,'在河邊看夕陽','回去','回公館']); await TRIP.menu(gm3);
    check('5. 17:10 到大稻埕：可以看夕陽（10 月日落約 17:35）',gm3.L.says.includes(sp('D12').points.find(p=>p.id==='D12.sunset').lines[0])&&!gm3.L.menus[1].some(t=>t.startsWith('在河邊看夕陽〔')),JSON.stringify(gm3.L.menus[1]));
    // 跨進晚上：晚上的次數已經用完 → 「差不多該回去了」只剩回去
    const G4=mkG(SAT,17); G4.slots={day:SAT,used:{am:0,pm:0,ev:2}}; const gm4=mkGM(G4,[2,'沿著迪化街走','沿著迪化街走']); await TRIP.menu(gm4);
    const last=gm4.L.menus[gm4.L.menus.length-1];
    check('5. 17:00 出發、散步到 18:30：晚上沒有次數 →「差不多該回去了」、選單只剩回去',gm4.L.says.includes('差不多該回去了。')&&gm4.L.menus.some(m=>m.length===1&&m[0]==='回去'),JSON.stringify(gm4.L.menus));
    const G5=mkG(SAT,17); const gm5=mkGM(G5,[2,'沿著迪化街走','沿著迪化街走','回去','回公館']); await TRIP.menu(gm5);
    check('5. 晚上還有次數：跨進晚上 30 分鐘以上，下午、晚上各扣 1 次',CLS.slotRec(G5).used.pm===1&&CLS.slotRec(G5).used.ev===1,JSON.stringify(CLS.slotRec(G5).used)); }
  // 6. 拍照：淡水的拍照點本身就是拍照（沒有另外的「拍一張照」）；西門町有「拍一張照」，一趟一張
  { const G=mkG(SAT,16); const gm=mkGM(G,[0,'拍一張照','回去','回公館']); await TRIP.menu(gm);
    check('6. 西門町有「拍一張照」：存進相簿、選單上不再出現',G.places.photos.length===1&&G.places.photos[0].spot==='D04'&&!gm.L.menus[2].includes('拍一張照'),JSON.stringify(gm.L.menus[2]));
    const G2=mkG(SAT,15); const gm2=mkGM(G2,[3,'回去','回公館']); await TRIP.menu(gm2);
    check('6. 淡水有拍照的互動點：沒有另外的「拍一張照」',!gm2.L.menus[1].includes('拍一張照')&&gm2.L.menus[1].some(t=>t.startsWith('在拍照的位置看夕陽')),JSON.stringify(gm2.L.menus[1])); }
  // 7. 會錯過的課先問
  { const G=mkG(TUE,9); const it=CLS.dayItems(G).find(i=>i.t0>9.5&&i.t0<16); const gm=mkGM(G,[o=>o.findIndex(x=>x.t==='臺北市立美術館'),'先不要']);
    const s=sp('D06'); G.hour=Math.max(9,(it?it.t0:12)-1); const k=TRIP.check(G,s);
    if(it&&k.ok){ await TRIP.menu(gm); check('7. 週二出發會錯過課：先問「這一趟會錯過：…」，選「先不要」就不出發、不扣次數',gm.L.says.some(t=>/^這一趟會錯過：/.test(t))&&!G.trip&&!(G.slots&&G.slots.used&&(G.slots.used.am||G.slots.used.pm)),JSON.stringify(gm.L.says)); }
    else check('7. 找得到週二出發會錯過的課',false,JSON.stringify({it:it&&it.c.name,k})); }
  // 8. 途中存檔讀回來：TRIP.at、TRIP.tick 接著選單（不再說一次到達的台詞）
  { const G=mkG(SAT,18); G.trip={spot:'D04',depart:17,arrive:17.25,done:['D04.redhouse'],walk:1,photo:false,p:['pm'],from:'gongguan',said:true}; G.places={free:{D04:1},soloSaid:{},photos:[]};
    const snap=JSON.parse(JSON.stringify(G)); const gm=mkGM(snap,['回去','回公館']);
    check('8. 讀回來的存檔在景點：TRIP.at 是 true',TRIP.at(snap));
    TRIP.tick(gm); await new Promise(r=>setTimeout(r,20));
    check('8. TRIP.tick 接著景點的選單：紅樓做過了、不再說到達的台詞；回公館',gm.L.menus[0].includes('西門紅樓〔灰：做過了〕')&&!gm.L.says.includes(sp('D04').arrive[0])&&gm.L.enters[0]==='gongguan@-35.6,13.2'&&snap.trip===null,JSON.stringify(gm.L));
    const old=mkG(SAT,18); delete old.places; check('8. 舊存檔沒有 G.trip、G.places：不在景點、記錄自動補上',!TRIP.at(old)&&TRIP.rec(old).free&&Array.isArray(TRIP.rec(old).photos)); }
  // 9. 第一、二天（開場劇情）不扣次數；捷運站的互動接到 TRIP.menu
  { const G=mkG(2,15); const gm=mkGM(G,[2,'回去','回公館']); await TRIP.menu(gm); check('9. 開場劇情的日子不扣次數',!G.slots||!(G.slots.used.pm),JSON.stringify(G.slots));
    const st=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'); check('9. 公館「捷運公館站入口」→ TRIP.menu；S.tick 有 TRIP.tick',/if\(it\.mrt\)\{ if\(typeof TRIP!=='undefined'\)\{ await TRIP\.menu\(GM\)/.test(st)&&/TRIP\.at\(G\)\)\{ TRIP\.tick\(GM\)/.test(st));
    const ih=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'); check('9. index.html 載入 free_trips.js、freetrip3d.js（在 outings3d 之後）',ih.indexOf('src/outings3d.js')<ih.indexOf('src/data/free_trips.js')&&ih.indexOf('src/data/free_trips.js')<ih.indexOf('src/freetrip3d.js')); }
  // 2c. 第三批（DL-06C，spots_v3 rulesV3）
  { const run=async(day,h,id,ans,o)=>{ const G=mkG(day,h,o), gm=mkGM(G,ans); const ch=gm.choose; gm.choose=async O=>{ const k=O.findIndex(x=>x.t==='照樣出發'); return k>=0?k:ch(O); };   /* 平日有課：先回答「這一趟會錯過…」*/ await TRIP.go(gm,sp(id)); if(TRIP.at(G)) await TRIP.loop(gm); return {G,gm}; };
    const m0=(r)=>r.gm.L.menus[0]||[];
    const MON2=dayOf('2025-10-20');   /* 10/13 是遊戲裡的颱風假 */
    // 門票
    { const s=sp('D08'); check('2c. D08 動物園：錢只夠車資、不夠門票＝「錢不夠」',TRIP.check(mkG(SAT,8.5,{money:s.transit.fareRound+s.admission-1}),s).why==='錢不夠');
      const r=await run(SAT,8.5,'D08',['回去','回公館']); check('2c. D08：抵達時扣門票 60（加上來回車資，總共 120）',5000-r.G.money===s.transit.fareRound+60,String(5000-r.G.money)); }
    // 週末市集
    { const r1=await run(TUE,11,'D01',['回去','回公館']); const r2=await run(SAT,11,'D01',['回去','回公館']);
      check('2c. D01 華山：週二「逛週末市集」灰掉寫「只有週末」；週六可以',m0(r1).includes('逛週末市集〔灰：只有週末〕')&&m0(r2).includes('逛週末市集'),JSON.stringify(m0(r1))); }
    // 每月第一個週一
    { const r1=await run(MON,7.5,'D19',['回去','回公館']); const r2=await run(MON2,7.5,'D19',['回去','回公館']);
      check('2c. D19 金瓜石：每月第一個週一（10/6）黃金博物館休館；10/20 照常；抵達扣門票 80',m0(r1).includes('黃金博物館〔灰：今天休館〕')&&m0(r2).includes('黃金博物館')&&5000-r2.G.money===sp('D19').transit.fareRound+80,JSON.stringify([m0(r2),5000-r2.G.money,r2.gm.L.toasts])); }
    // 這一項自己的關門時間、休館日；考試週
    { const r1=await run(TUE,15,'D26',['回去','回公館']); const r2=await run(MON,12.5,'D26',['回去','回公館']); const r3=await run(TUE,12.5,'D26',['回去','回公館']);
      check('2c. D26 臺中：16:30 抵達，美術館 40 分鐘會超過 17:00＝「關門了」；週一「今天休館」；14:00 抵達照常',m0(r1).includes('國立臺灣美術館〔灰：關門了〕')&&m0(r2).includes('國立臺灣美術館〔灰：今天休館〕')&&m0(r3).includes('國立臺灣美術館'),JSON.stringify([m0(r1),m0(r2)]));
      let xw=null; for(let d=SAT;d<SAT+120;d++){ const G=mkG(d,10); if(typeof CLS!=='undefined'&&CLS.examWeek&&CLS.examWeek(G)){ xw=d; break; } }
      check('2c. 外縣市（D26～D31）考試週不能去：「考試週」',xw!=null&&['D26','D27','D28','D29','D30','D31'].every(id=>TRIP.check(mkG(xw,8),sp(id)).why==='考試週'),String(xw)); }
    // 看第一顆星
    { const r=await run(SAT,13.3,'D30',['回去','回公館']); check('2c. D30 七星潭：15:30 抵達，「看第一顆星」灰掉寫「天還沒黑」',m0(r).includes('看第一顆星〔灰：天還沒黑〕'),JSON.stringify(m0(r))); }
    // 固定段落（看電影）
    { const r=await run(SAT,15,'D05',['看一場電影','回去','回公館']);
      check('2c. D05 光典臺北：選單有「看一場電影」（120 分鐘・260 元），看了扣 260、旁白照第一次那句、之後不再出現',m0(r).includes('看一場電影')&&r.gm.L.says.includes(sp('D05').fixed.lines[0])&&!(r.gm.L.menus[1]||[]).includes('看一場電影')&&5000-r.G.money===sp('D05').transit.fareRound+260,JSON.stringify(r.gm.L.menus[1])); }
    // 下雨的底圖
    check('2c. D02 松山：下雨換雨後的底圖 d02_base_rain',TRIP.bgOf({weather:'rain'},sp('D02'))==='d02_base_rain'&&TRIP.bgOf({weather:'clear'},sp('D02'))==='d02_base_overcast'&&!!OUT.BG.d02_base_rain);
    // 兩張底圖＋坐公車去安平
    { const r=await run(SAT,8,'D28',['坐公車去安平','回去','回公館']); const a=m0(r), b=r.gm.L.menus[1]||[];
      check('2c. D28 臺南：10:15 抵達在文學館（a）：有「坐公車去安平」、沒有安平那邊的點',a.includes('坐公車去安平')&&a.includes('文學館的大廳')&&!a.includes('安平老巷的小吃'),JSON.stringify(a));
      check('2c. D28：坐公車以後換到安平（b）：老巷、海堤出現，文學館和公車不再出現；旁白照第一次那句',b.includes('安平老巷的小吃')&&!b.includes('文學館的大廳')&&!b.includes('坐公車去安平')&&r.gm.L.says.includes(sp('D28').move.lines[0]),JSON.stringify(b)); }
    { const r=await run(SAT,14,'D28',['回去','回公館']); check('2c. D28：16:00 以後才到＝直接在安平（交通卡多一段「坐公車去安平」）',!m0(r).includes('坐公車去安平')&&m0(r).includes('安平老巷的小吃')&&r.gm.L.cards.some(c=>c.startsWith('坐公車去安平')),JSON.stringify(r.gm.L.cards)); }
    check('2c. 第三批的底圖都登錄了（OUT.BG）',TRIP.list().every(s=>!!OUT.BG[s.bg]&&(!s.bases||Object.values(s.bases).every(b=>!!OUT.BG[b]))),TRIP.list().filter(s=>!OUT.BG[s.bg]).map(s=>s.id).join());
  }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
