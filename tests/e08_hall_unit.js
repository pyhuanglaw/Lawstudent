// E08 後續（AA_478，企劃線 f1afaf4f1，AA-C 2026-10-27）：3D 桃園機場出境大廳——登機以後的「飛往〇〇」字卡、大廳裡演的「出發」、帶隊的人各一句、日本路線挽回中的以安——不需要瀏覽器。
//   F1 出國活動：登機以後第一張字卡是「飛往〇〇」（AA_478 第 1 節的表，逐字；第二行地名和「約」中間是全形空白），在第一張日期卡以前；接著是深色底（人在飛機上，不露出出境大廳）
//   F2 C13（手機自己排的出國旅遊）：照目的地（1-1 的表：jp、kr、th、vn、hk、eu、us）；和朋友去字卡一樣；F3 VA10 香港
//   H1 C05：「出發」那一幕（早上六點的機場、阿凱的背包）進大廳就演、疊在模糊的大廳上；登機以後不再演；H2 C08：報到櫃台、帶隊老師在大廳演，不用 2D 機場圖；第二次（沒有那一場）兩邊都不演
//   H3 T02：水壺旁白後面接方奕廷兩句（AA_478 第 3 節）；H4 T03：子晴、阿凱各一句，進大廳演一次、不用選項；H5 C10：「抵達」留在下飛機以後（飛往美國 → 抵達（美國的機場大廳圖）→ 6/23 第一堂課）
//   H6 其他（C09、C11、C12、C18、VA10、C13）：大廳裡不加話；H7 大廳演完才存檔，讀檔不會再演一次、登機以後照樣不演；H8 沒有 3D 機場＝照原本（旅程開頭演「出發」、沒有「飛往〇〇」）
//   S1 日本路線挽回中：以安不跟著走，站在大廳另一頭（報到島 A 的櫃台前、面向櫃台）、不能搭話、不揮手；大廳那一段演完才放；存檔、讀檔照放；站不到＝不放（同原本）；S2 交往中照舊跟著走
// 修改前（005358306，第一輪 E08）：F、H1～H5、H7、S1 FAIL（沒有字卡、出發那一幕在登機以後演、沒有那幾句、挽回中大廳裡沒有以安）。用法：node tests/e08_hall_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(EXCH|Y34B|MSG|MSG_POOL|MSG2_POOL|GROUP|GROUP_EVENTS|R2Y3A|R2Y3A_EVENTS|R2Y3B|R2Y3B_EVENTS|HOLFF|JP|JP_EVENTS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/holff3d.js','src/exchange3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/data/group_events.js','src/group3d.js','src/y34b3d.js','src/data/r2y3a_events.js','src/r2y3a3d.js','src/data/r2y3b_events.js','src/r2y3b3d.js','src/data/jp_events.js','src/jp3d.js']) if(fs.existsSync(path.join(H.ROOT,f))) load(f);
if(typeof VAC!=='undefined'&&VAC.airReg) VAC.airReg();   /* 單元測試的載入順序（vac3d.js 在 exchange3d.js 前面）：補登記；遊戲裡照 index.html exchange3d.js 在前 */
const {check,GM,E}=H;
const D=k=>STORY.dayOfKey(k);
const W='　';   /* 全形空白 */
GM.memo=t=>{ (H.G.memo||(H.G.memo=[])).push(t&&typeof t==='object'?Object.assign({day:H.G.day},t):{day:H.G.day,t}); };
const saves=[]; GM.autosave=()=>{ saves.push(H.said.length); };   /* 存檔的時候已經演到第幾句 */
const spawned=[]; GM.spawnCharacter=(id,x,z,o)=>{ const n={id,obj:{position:{x,y:0,z},rotation:{y:o&&o.yaw||0}},beh:o&&o.beh,talk:o&&o.talk,talkLabel:o&&o.talkLabel,greet:o&&o.greet,at:H.said.length}; GM.npc[id]=n; spawned.push(n); return n; };
const settle=async(ok)=>{ for(let i=0;i<400&&!(ok&&ok());i++) await new Promise(r=>setImmediate(r)); };
const hall=()=>{ E.interactables=[{x:0,z:-13.8,radius:2.5,label:'登機',airportBoard:true,look:'今天沒有要搭的飛機。'},{x:-4,z:18.6,radius:1.4,label:'搭車離開（回台北）',exit:{to:'gongguan',spawn:{x:-2.5,z:-29,yaw:0}}}]; };   /* us3d.js 出境大廳的兩個互動點 */
const board=()=>STORY.interact({x:0,z:-13.8,radius:2.5,label:'登機',airportBoard:true,look:'今天沒有要搭的飛機。'},GM);
const tick=()=>typeof EXCH.airTick==='function'?EXCH.airTick(GM):null;
const img=(b,re)=>!!b&&typeof b==='object'&&re.test(b.image||'');
const dateCard=c=>/^\d+\/\d+（.）/.test(c[0]);
/* 從宿舍出發：報名 → 出發前一小時 → OUT.go（字卡 → 出境大廳、大廳那一幕）→ 「登機」→ 整趟。回傳大廳裡和登機以後各自的台詞、背景、字卡 */
const FAM=['kai','npc_fangyt','heroine_04','heroine_01','zhe','yu','classmate_bohan'];
async function fly(key,day,setup){ H.fresh(day,4,'dorm'); H.G.stage='law'; for(const p of FAM) H.FAMILIAR(p); spawned.length=0; saves.length=0; if(setup) setup();
  VAC.signup(H.G,key,'yes'); const q=OUT.get(H.G,'vac_'+key); if(!q) return {q:null};
  H.G.day=q.day; H.G.hour=q.h-1; hall(); H.said=[]; H.cards=[]; H.bgs=[]; H.entered=[];
  await OUT.go(GM,q); const h={said:H.lines(),bgs:H.bgs.slice(),cards:H.cards.slice(),zone:H.G.zone,saves:saves.slice()};
  hall(); H.said=[]; H.cards=[]; H.bgs=[]; await board(); const a={said:H.lines(),bgs:H.bgs.slice(),cards:H.cards.slice(),state:q.state};
  return {q,h,a}; }
const J=x=>JSON.stringify(x);
(async()=>{
  check('0. 接線：S.AIR.vac 有 hall（進大廳就演）；EXCH.airStand、AIR_SPOT.checkinA；VAC.flyCard、hallKeys；OUT.go 認得 o.card、OUT.STAGE 的 bg',
    typeof EXCH!=='undefined'&&!!(EXCH.AIR&&EXCH.AIR.vac&&typeof EXCH.AIR.vac.hall==='function')&&typeof EXCH.airStand==='function'&&!!(EXCH.AIR_SPOT&&EXCH.AIR_SPOT.checkinA)&&typeof VAC.flyCard==='function'&&typeof VAC.hallKeys==='function'
    &&/o&&o\.card\) await GM\.titleCard\(o\.card\[0\]/.test(fs.readFileSync(path.join(H.ROOT,'src/outings3d.js'),'utf8'))&&/stg\.bg\|\|'blur'/.test(fs.readFileSync(path.join(H.ROOT,'src/outings3d.js'),'utf8')));

  /* ===================== F1 出國活動的「飛往〇〇」 ===================== */
  const FLY={ 'C05@Y1':['2026-08-24',['飛往日本','東京'+W+'約 3 小時']], 'T02@Y2':['2027-08-01',['飛往日本','約 3 小時']], 'T03@Y3':['2028-07-03',['飛往泰國','曼谷'+W+'約 4 小時']], 'C08@Y1':['2026-07-13',['飛往韓國','首爾'+W+'約 2 小時半']],
    'C09@Y1':['2026-07-27',['飛往柬埔寨','約 4 小時']], 'C10@Y2':['2027-06-21',['飛往美國','加州'+W+'約 12 小時']], 'C11@Y2':['2027-01-17',['飛往日本','東京'+W+'約 3 小時']], 'C12@Y2':['2027-08-09',['飛往日本','關西'+W+'約 3 小時']],
    'C18@Y1':['2026-07-20',['飛往新加坡','約 4 小時半']], 'C18W@Y2':['2027-01-04',['飛往新加坡','約 4 小時半']] };
  const R={};
  for(const key in FLY){ const [day,card]=FLY[key]; const r=await fly(key,day); R[key]=r; const a=r.a||{cards:[],bgs:[]}, i0=a.cards.findIndex(dateCard);
    check('F1. '+key+'：登機以後第一張是「'+card.join('｜')+'」、在第一張日期卡以前；接著是深色底（不是模糊的大廳）；整趟演完',!!r.q&&J(a.cards[0])===J(card)&&i0>0&&a.bgs[0]==='dark'&&a.state==='done',J([a.cards.slice(0,2),a.bgs.slice(0,2),a.state])); }
  check('F1. 字卡一張都沒有寫成「去機場」（登機以後）、第一行都是「飛往」',Object.values(R).every(r=>r.a&&r.a.cards.every(c=>c[1]!=='去機場 約 1 小時')&&/^飛往/.test(r.a.cards[0][0])));

  /* ===================== F2 C13、F3 VA10 ===================== */
  { H.fresh('2026-07-01',10,'dorm'); const V=VAC.rec(H.G), want={jp:['飛往日本','東京'+W+'約 3 小時'],kr:['飛往韓國','首爾'+W+'約 2 小時半'],th:['飛往泰國','曼谷'+W+'約 4 小時'],vn:['飛往越南','河內'+W+'約 3 小時'],hk:['飛往香港','約 1 小時半'],eu:['飛往歐洲','約 14 小時'],us:['飛往美國','約 12 小時']};
    V.t13=Object.keys(want).map((d,i)=>({n:i+1,dest:d,from:H.G.day+3,to:H.G.day+7,with:null,gf:false,season:'summer'})); const fc=q=>typeof VAC.flyCard==='function'?VAC.flyCard(H.G,q):null, bad=Object.keys(want).filter((d,i)=>J(fc({vac:{key:'T13#'+(i+1),k:'trip'}}))!==J(want[d]));   /* 修改前沒有 VAC.flyCard：照樣跑完、各自 FAIL */
    check('F2. C13 照目的地（1-1 的表）：日本 東京、韓國 首爾、泰國 曼谷、越南 河內、香港、歐洲、美國',bad.length===0,J(bad)); }
  { H.fresh('2026-07-01',10,'dorm'); H.FAMILIAR('zhe'); spawned.length=0; H.picks=['日本','和'+SOCIAL.displayName('zhe'),'5 天',0]; await VAC.plan13(GM); const q=OUT.get(H.G,'vac_t13_1');
    H.G.day=q.day; H.G.hour=q.h-1; hall(); H.said=[]; await OUT.go(GM,q); const hallSaid=H.lines(); hall(); H.cards=[]; H.bgs=[]; await board();
    check('F2. C13 和阿哲去日本：大廳裡阿哲跟著、不加話；登機以後字卡一樣是「飛往日本｜東京　約 3 小時」',!!GM.npc.zhe&&GM.npc.zhe.beh==='follow'&&hallSaid.length===0&&J(H.cards[0])===J(['飛往日本','東京'+W+'約 3 小時'])&&H.bgs[0]==='dark',J([hallSaid,H.cards.slice(0,2)])); }
  { H.fresh('2027-08-25',6,'dorm'); for(const p of ['zhe','yu','classmate_bohan']) H.FAMILIAR(p); PHONE.join(H.G,'noodle_team','麵店團'); H.G.flags.VA10='yes'; VAC.va10Phone(H.G); const q=OUT.get(H.G,'vac_va10');
    if(q){ H.G.day=q.day; H.G.hour=q.h-1; hall(); H.said=[]; await OUT.go(GM,q); const hallSaid=H.lines(); hall(); H.cards=[]; H.bgs=[]; await board(); }
    check('F3. VA10 麵店團香港：大廳不加話；登機以後「飛往香港｜約 1 小時半」、深色底',!!q&&J(H.cards[0])===J(['飛往香港','約 1 小時半'])&&H.bgs[0]==='dark'&&H.G.flags.BACK_FROM_VA10!=null,J([q&&q.state,H.cards.slice(0,2)])); }

  /* ===================== H1～H6 大廳裡演的 ===================== */
  { const r=R['C05@Y1'];
    check('H1. C05：進大廳就演「出發」——「（早上六點的機場。阿凱的背包比行李箱還大。）」「裡面是空的。回來會滿。」，疊在模糊的大廳上（不是深色底）；還沒登機',r.h.zone==='airport_dep'&&r.h.said.includes('（早上六點的機場。阿凱的背包比行李箱還大。）')&&r.h.said.some(t=>/裡面是空的。回來會滿。$/.test(t))&&J(r.h.bgs)===J(['blur'])&&r.q.airHall===true,J([r.h.said,r.h.bgs]));
    check('H1. C05：登機以後不再演一次「出發」；秋葉原照演',!r.a.said.includes('（早上六點的機場。阿凱的背包比行李箱還大。）')&&r.a.said.includes('（二手遊戲店的樓梯很窄。一層一層往上，每一層賣的東西都比下面那層舊。）'),J(r.a.said.slice(0,3))); }
  { const r=R['C08@Y1'], all=r.h.bgs.concat(r.a.bgs);
    check('H2. C08：報到櫃台、帶隊老師在大廳演（模糊的大廳）；整趟沒有用 2D 出境機場圖；登機以後不再演',r.h.said.includes('（報到櫃台前，九個不認識的首都帝大學生，每個人的行李都比你小。）')&&r.h.said.some(t=>/法律系的？好，十個到齊了。$/.test(t))&&J(r.h.bgs)===J(['blur'])&&!all.some(b=>img(b,/airport_departure/))&&!r.a.said.includes('（報到櫃台前，九個不認識的首都帝大學生，每個人的行李都比你小。）'),J([r.h.said,all.filter(b=>typeof b==='object').slice(0,3)])); }
  { const r=await fly('C08@Y2','2027-07-13',()=>{ VAC.rec(H.G).reg['C08@Y1']='done'; });
    check('H2. C08 第二次（第二次沒有「出發」那一場）：大廳不演、登機以後也不演；字卡照出',!!r.q&&r.h.said.length===0&&!r.a.said.some(t=>/報到櫃台前/.test(t))&&J(r.a.cards[0])===J(['飛往韓國','首爾'+W+'約 2 小時半']),J([r.h.said,r.a.said.slice(0,2)])); }
  { const r=R['T02@Y2'], L=r.h.said, i=L.indexOf('（早上五點的機場。方奕廷的背包上掛著一個水壺，已經裝滿了。）');
    check('H3. T02：大廳裡水壺旁白後面接方奕廷「山上這幾天有霧。」「……霧裡的樹比較好看。」（照順序）；登機以後不再演',i===0&&/山上這幾天有霧。$/.test(L[1]||'')&&/……霧裡的樹比較好看。$/.test(L[2]||'')&&/^方奕廷：/.test(L[1]||'')&&L.length===3&&!r.a.said.some(t=>/水壺|霧裡的樹/.test(t)),J(L)); }
  { const r=R['T03@Y3'], L=r.h.said;
    check('H4. T03：進大廳演一次——子晴「我在飛機上要睡覺。到了再叫我。」、阿凱「遊戲展第一天要排隊。……我查過了，九點開門。」，不用選項；登機以後不再演',L.length===2&&/^高子晴：我在飛機上要睡覺。到了再叫我。$/.test(L[0])&&/^阿凱：遊戲展第一天要排隊。……我查過了，九點開門。$/.test(L[1])&&J(r.h.bgs)===J(['blur'])&&!r.a.said.some(t=>/九點開門/.test(t)),J([L,r.h.bgs]));
    hall(); const t0=H.said.length; tick(); tick(); check('H4. 在大廳走動（每一格 airTick）不會再演',H.said.length===t0); }
  { const r=R['C10@Y2'], a=r.a, iA=a.said.indexOf('（飛機飛了十二個小時。下飛機的時候，手機的時間往回跳了一天。）'), iC=a.said.findIndex(t=>/教室比法律系館A的小/.test(t)), i623=a.cards.findIndex(c=>/^6\/23（/.test(c[0])), bA=a.bgs.findIndex(b=>img(b,/us_airport/));
    check('H5. C10：大廳不演；登機以後「飛往美國」→「抵達」那一幕（飛機飛了十二個小時…，美國的機場大廳圖 us_airport）→ 6/23 的日期卡 → 第一堂課；沒有出境的 2D 機場圖',r.h.said.length===0&&J(a.cards[0])===J(['飛往美國','加州'+W+'約 12 小時'])&&iA>=0&&iC>iA&&i623>0&&a.bgs[0]==='dark'&&bA===1&&!a.bgs.some(b=>img(b,/airport_departure/)),J([iA,iC,i623,a.cards.slice(0,3),a.bgs.slice(0,3)]));
    const A=VAC_DATA.A.C10.keys[0]; check('H5. C10 第一場的標題「抵達」（原本「出發」）',A.title==='抵達'&&A.bg==='us_airport'); }
  { const quiet=['C09@Y1','C11@Y2','C12@Y2','C18@Y1','C18W@Y2'].filter(k=>R[k]&&R[k].h.said.length===0&&R[k].h.bgs.length===0);
    check('H6. C09、C11、C12、C18、C18W：大廳裡不加話（只跟著走）',quiet.length===5,J(quiet)); }

  /* ===================== H7 存檔、讀檔 ===================== */
  { const r=await (async()=>{ H.fresh('2027-08-01',3,'dorm'); H.G.stage='law'; H.FAMILIAR('npc_fangyt'); saves.length=0; VAC.signup(H.G,'T02@Y2','yes'); const q=OUT.get(H.G,'vac_T02@Y2'); H.G.day=q.day; H.G.hour=q.h-1; hall(); H.said=[];
      await OUT.go(GM,q); return {q,n:H.said.length,s:saves.slice()}; })();
    check('H7. 進大廳的那一次存檔在大廳那一幕演完以後（中途關掉＝讀到出發前，不會停在演到一半）',r.n===3&&r.s.length>0&&r.s[r.s.length-1]===r.n&&!r.s.some(x=>x>0&&x<r.n),J(r.s));
    const saved=JSON.stringify(H.G); H.G=JSON.parse(saved); SOCIAL.bind(H.G); EVENTS.bind(GM); GM.npc={}; hall(); H.said=[]; const q2=OUT.get(H.G,r.q.id); tick();
    const re=H.said.length; await board();
    const L=H.lines(); check('H7. 讀檔（在大廳等登機）：不再演一次；登機以後也不演「出發」，整趟照演',re===0&&q2.airHall===true&&!L.some(t=>/水壺|霧裡的樹/.test(t))&&L.some(t=>/步道上的霧很濃/.test(t))&&q2.state==='done',J([re,L.slice(0,2),q2.state])); }

  /* ===================== H8 沒有 3D 機場 ===================== */
  { const z0=EXCH.airZoneOk; EXCH.airZoneOk=()=>false;
    try{ H.fresh('2027-08-01',3,'dorm'); H.G.stage='law'; H.FAMILIAR('npc_fangyt'); VAC.signup(H.G,'T02@Y2','yes'); const q=OUT.get(H.G,'vac_T02@Y2'); H.G.day=q.day; H.G.hour=q.h-1; H.said=[]; H.cards=[]; H.entered=[]; await OUT.go(GM,q); const L=H.lines();
      check('H8. 沒有 3D 機場：照原本（出發的字卡 → 旅程開頭演「出發」，方奕廷兩句接在後面；沒有「飛往〇〇」、沒進大廳）',!H.entered.includes('airport_dep')&&L[0]==='（早上五點的機場。方奕廷的背包上掛著一個水壺，已經裝滿了。）'&&/山上這幾天有霧。$/.test(L[1]||'')&&!H.cards.some(c=>/^飛往/.test(c[0]))&&H.cards[0][1]==='去機場 約 1 小時'&&q.state==='done',J([H.entered,L.slice(0,3),H.cards.slice(0,2)])); }
    finally{ EXCH.airZoneOk=z0; } }

  /* ===================== S1、S2 日本路線 ===================== */
  const jp=async(dating)=>{ H.fresh('2028-03-25',8,'dorm',{EXCHANGE_ROUTE:'JP',EXCH_RULE:1,X1_JP:D('2028-02-20')}); H.G.acts={att:{}}; H.G.outings=[]; H.G.visited={}; GM.npc={}; spawned.length=0; saves.length=0; HOME.rec(H.G).at=true; H.FAMILIAR('heroine_01'); if(dating) H.date('heroine_01'); H.said=[]; H.cards=[]; H.bgs=[]; H.entered=[];
    await Y34B.departJP(GM); return H.G.flags.AIR_DEP||null; };
  { const A=await jp(false), n=GM.npc.heroine_01, P=EXCH.AIR_SPOT&&EXCH.AIR_SPOT.checkinA, iSay=H.said.findIndex(s=>s.t==='到了再說。');
    check('S1. 挽回中：以安不跟著走——站在大廳另一頭（報到島 A 的櫃台前，面向櫃台）、beh idle、不動、不能搭話、不揮手',!!n&&!!P&&n.beh==='idle'&&n.frozen===true&&n.talk===null&&n.talkLabel===null&&n.greet===false&&n.obj.position.x===P.x&&n.obj.position.z===P.z&&n.obj.rotation.y===P.yaw&&!!A&&A.with.length===0&&J(A.stand)===J([{id:'heroine_01',spot:'checkinA'}]),J([n&&{beh:n.beh,frozen:n.frozen,talk:n.talk,greet:n.greet,x:n.obj.position.x,z:n.obj.position.z},A]));
    check('S1. 挽回中：2D 那幾句照舊（「到了再說。」），大廳那一段演完才放她（EVENTS 不會把鏡頭隔著大廳對過去）；放了以後存檔',iSay>=0&&!!n&&n.at>iSay&&saves.length>0&&saves[saves.length-1]>=n.at,J([iSay,n&&n.at,saves]));
    const P0=P&&Math.hypot(P.x-0,P.z-5); check('S1. 她站的地方離出生點、安檢入口都遠（大廳另一頭）',P0>20&&Math.hypot(P.x-0,P.z+13.8)>20,String(P0));
    const saved=JSON.stringify(H.G); H.G=JSON.parse(saved); SOCIAL.bind(H.G); EVENTS.bind(GM); GM.npc={}; GM.enterN=(GM.enterN|0)+1; hall(); tick(); const n2=GM.npc.heroine_01;
    check('S1. 讀檔（在大廳等登機）：她照樣站在那裡、不跟著',!!n2&&n2.beh==='idle'&&n2.talk===null&&n2.obj.position.x===P.x,J(n2&&{beh:n2.beh,x:n2.obj.position.x}));
    H.G.hour+=1.01; tick(); await settle(()=>H.G.flags.JP_DEPARTED!=null);
    check('S1. 一小時以後自動登機：「（座位分開。）」、進日本的據點',H.G.flags.JP_DEPARTED!=null&&H.has('（座位分開。）')&&H.G.zone==='jp_hub'); }
  { const cs=E.canStand; E.canStand=()=>false; try{ const A=await jp(false); check('S1. 那個位置站不到（臨時場景、配置改了）：不放她（同原本完全不在），照樣等登機',!GM.npc.heroine_01&&!!A&&EXCH.airPending(H.G)); } finally{ if(cs) E.canStand=cs; else delete E.canStand; } }
  { const A=await jp(true), n=GM.npc.heroine_01;
    check('S2. 交往中：照舊跟著走（follow），不是站在另一頭',!!n&&n.beh==='follow'&&!!A&&J(A.with)===J(['heroine_01'])&&!(A.stand&&A.stand.length),J([n&&n.beh,A])); }
  H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
