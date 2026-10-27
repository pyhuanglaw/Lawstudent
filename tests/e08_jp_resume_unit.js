// E08 第四輪（D36：玩家不能永久卡住；LAWWW-C 10-27）：日本路線 3/25 一起出發，登機口那一段演完（EVENTS.run 自己存一次檔）到「飛往日本」記下 JP_DEPARTED 中間那幾秒關掉遊戲——
// 讀回來 AN_SENDOFF＝together、JP_DEPARTED 還沒記、也沒有在大廳等登機：原本永遠出發不了。現在接著從「飛往日本」演、記 JP_DEPARTED、進日本的據點（登機口那一段不重演、只接一次）——不需要瀏覽器。
//   J1 3D 出境大廳（交往中、挽回中）：那個存檔讀回來 → EXCH.tick（EXCH.AIR.jp.resume）接著出發 → 3/25 飛往日本、抵達、日本的據點（JP.rec 的 arr、place）；登機口那一段、CG-22 不重演；只接一次
//   J2 沒有 3D 機場（整段 2D 演完才飛，E08 以前就有同樣的缺口）、從臺北的家出發：讀回來在家 → home3d.js 的 loop 問 STORY.y4HomeDue／y4HomeScene → 接著出發
//   J3 其他存檔不受影響：還沒到出發的時間、出發前（AN_SENDOFF 還沒記）、在大廳等登機（AIR_DEP）、已經出發了（JP_DEPARTED）、美國路線
//   J4 美國交換出發（EXCH.fly，登機口 ev_sis_gate_us 也是先存檔）沒有同樣的缺口：US_DEPARTED、還沒 US_ARRIVED＝原本就會接著飛（在大廳一小時、或不在大廳馬上），登機口不重演
// 修改前（673e13527，第三輪合併）：J1、J2 FAIL（讀回來一直在臺灣）。用法：node tests/e08_jp_resume_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(EXCH|Y34B|MSG|MSG_POOL|MSG2_POOL|GROUP|GROUP_EVENTS|R2Y3A|R2Y3A_EVENTS|R2Y3B|R2Y3B_EVENTS|HOLFF|JP|JP_EVENTS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/holff3d.js','src/exchange3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/data/group_events.js','src/group3d.js','src/y34b3d.js','src/data/r2y3a_events.js','src/r2y3a3d.js','src/data/r2y3b_events.js','src/r2y3b3d.js','src/data/jp_events.js','src/jp3d.js']) if(fs.existsSync(path.join(H.ROOT,f))) load(f);
if(typeof VAC!=='undefined'&&VAC.airReg) VAC.airReg();
const {check,GM,E}=H;
const D=k=>STORY.dayOfKey(k), T=(d,h)=>d*24+h;
GM.memo=t=>{ (H.G.memo||(H.G.memo=[])).push(t&&typeof t==='object'?Object.assign({day:H.G.day},t):{day:H.G.day,t}); };
let saves=[]; GM.autosave=()=>{ saves.push(JSON.stringify(H.G)); };   /* 每一次自動存檔（EVENTS.run 演完、出發、進據點）*/
GM.spawnCharacter=(id,x,z,o)=>{ const n={id,obj:{position:{x,y:0,z},rotation:{y:o&&o.yaw||0}},beh:o&&o.beh,talk:o&&o.talk,talkLabel:o&&o.talkLabel,greet:o&&o.greet}; GM.npc[id]=n; return n; };
const settle=async(ok)=>{ for(let i=0;i<1500&&!(ok&&ok());i++) await new Promise(r=>setImmediate(r)); };
const hall=()=>{ E.interactables=[{x:0,z:-13.8,radius:2.5,label:'登機',airportBoard:true,look:'今天沒有要搭的飛機。'},{x:-4,z:18.6,radius:1.4,label:'搭車離開（回台北）',exit:{to:'gongguan',spawn:{x:-2.5,z:-29,yaw:0}}}]; };
const board=()=>STORY.interact({x:0,z:-13.8,radius:2.5,label:'登機',airportBoard:true,look:'今天沒有要搭的飛機。'},GM);
const J=x=>JSON.stringify(x);
const due=G=>typeof Y34B.departResumeDue==='function'?Y34B.departResumeDue(G):false;
const stuck=s=>{ const F=JSON.parse(s).flags||{}; return F.AN_SENDOFF==='together'&&F.JP_DEPARTED==null&&!F.AIR_DEP; };
const jpFresh=(h,dating)=>{ H.fresh('2028-03-25',h,'dorm',{EXCHANGE_ROUTE:'JP',EXCH_RULE:1,X1_JP:D('2028-02-20')}); H.G.acts={att:{}}; H.G.outings=[]; H.G.visited={}; GM.npc={}; HOME.rec(H.G).at=true; H.FAMILIAR('heroine_01'); if(dating) H.date('heroine_01'); H.FAMILIAR('zhe'); PHONE.join(H.G,'noodle_team','麵店團'); H.G.memo=[]; saves=[]; };
const reload=s=>{ H.G=JSON.parse(s); SOCIAL.bind(H.G); EVENTS.bind(GM); GM.npc={}; H.said=[]; H.cards=[]; H.cgs=[]; H.entered=[]; hall(); };
(async()=>{
  check('0. 接線：Y34B.departResume／departResumeDue、EXCH.AIR.jp.resume',typeof Y34B.departResume==='function'&&typeof Y34B.departResumeDue==='function'&&!!(EXCH.AIR&&EXCH.AIR.jp&&typeof EXCH.AIR.jp.resume==='function'));

  /* ===================== J1 3D 出境大廳 ===================== */
  for(const dating of [true,false]){ const who=dating?'交往中':'挽回中';
    jpFresh(8,dating); await Y34B.departJP(GM); hall(); await board();
    const ok0=H.G.flags.JP_DEPARTED===D('2028-03-25')&&H.G.zone==='jp_hub', s=saves.filter(stuck).pop();
    check('J1. '+who+'：正常出發（對照）＋登機口那一段演完的那次自動存檔是「AN_SENDOFF together、JP_DEPARTED 還沒記、沒有在大廳等登機」',ok0&&!!s,J([H.G.flags.JP_DEPARTED,H.G.zone,saves.length]));
    if(!s) continue;
    reload(s); const z0=H.G.zone; const a=EXCH.tick(GM), b=EXCH.tick(GM); await settle(()=>H.G.flags.JP_DEPARTED!=null&&H.G.zone==='jp_hub');
    const R=JP.rec?JP.rec(H.G):{};
    check('J1. '+who+'：那個存檔讀回來（人在 '+z0+'）→ 接著出發：3/25「飛往日本」「抵達」、記 JP_DEPARTED、進日本的據點（日本的日子照常開始：JP.inJapan、arr＝3/25、place＝room）',a===true&&H.G.flags.JP_DEPARTED===D('2028-03-25')&&H.G.zone==='jp_hub'&&STORY.inJapan(H.G)&&H.cards.some(c=>c[0]==='飛往日本')&&H.cards.some(c=>c[0]==='抵達')&&R.arr===D('2028-03-25')&&R.place==='room'&&!HOME.at(H.G),J([a,H.G.flags.JP_DEPARTED,H.G.zone,H.cards.map(c=>c[0]),R.arr,R.place]));
    check('J1. '+who+'：登機口那一段不重演（CG-22、「她靠著窗」「座位分開」都沒有再出現）；只接一次（第二格不再接、字卡只出一次）',b===false&&!H.cgs.length&&!H.has('（她靠著窗，把手帳翻到四月那一頁。）')&&!H.has('（座位分開。）')&&H.cards.filter(c=>c[0]==='飛往日本').length===1,J([b,H.cgs,H.cards.map(c=>c[0])]));
    const t2=EXCH.tick(GM); check('J1. '+who+'：出發以後再一格什麼都不做',t2===false&&!due(H.G)); }

  /* ===================== J2 沒有 3D 機場、從臺北的家出發 ===================== */
  { const z0=EXCH.airZoneOk; EXCH.airZoneOk=()=>false;
    try{ jpFresh(8,true); await Y34B.departJP(GM); const ok0=H.G.flags.JP_DEPARTED===D('2028-03-25'), s=saves.filter(stuck).pop();
      check('J2. 沒有 3D 機場：正常出發（對照）＋整段 2D 演完的那次自動存檔也是同一個狀態（人還在臺北的家）',ok0&&!!s&&JSON.parse(s).phone!==undefined&&(JSON.parse(s).home||{}).at===true,J([ok0,!!s]));
      if(s){ reload(s); const k=STORY.y4HomeDue?STORY.y4HomeDue(H.G):null; if(k==='stay') await STORY.y4HomeScene(GM); await settle(()=>H.G.flags.JP_DEPARTED!=null);
        check('J2. 讀回來在家：家裡的 loop 問 STORY.y4HomeDue＝stay → 接著飛往日本、進日本的據點（不重演出發那一段）',k==='stay'&&H.G.flags.JP_DEPARTED===D('2028-03-25')&&H.G.zone==='jp_hub'&&!HOME.at(H.G)&&H.cards.some(c=>c[0]==='飛往日本')&&!H.has('（她靠著窗，把手帳翻到四月那一頁。）'),J([k,H.G.flags.JP_DEPARTED,H.G.zone,H.cards.map(c=>c[0])]));
        check('J2. 接過一次以後家裡不再問',!(STORY.y4HomeDue&&STORY.y4HomeDue(H.G)==='stay')); } }
    finally{ EXCH.airZoneOk=z0; } }

  /* ===================== J3 其他存檔不受影響 ===================== */
  { jpFresh(7,true); const a=EXCH.tick(GM);
    check('J3. 3/25 07:00 還沒到出發（AN_SENDOFF 還沒記）：不接、不飛',a===false&&!due(H.G)&&H.G.flags.JP_DEPARTED==null&&!H.cards.length);
    jpFresh(8,true); await Y34B.departJP(GM); hall(); const b=EXCH.tick(GM);
    check('J3. 在大廳等登機（AIR_DEP）：不接（照原本等「登機」或一小時自動登機）',b===false&&!due(H.G)&&!!H.G.flags.AIR_DEP&&H.G.flags.JP_DEPARTED==null);
    await board(); check('J3. 已經出發了（JP_DEPARTED）：不接',!due(H.G)&&EXCH.tick(GM)===false);
    H.fresh('2028-07-10',8,'dorm',{EXCHANGE_ROUTE:'US',AN_SENDOFF:'together'}); check('J3. 美國路線（就算旗標長得一樣；還沒到美國出發的日子）：不接',!due(H.G)&&EXCH.tick(GM)===false&&H.G.flags.JP_DEPARTED==null); }

  /* ===================== J4 美國交換出發 ===================== */
  { const d=D('2028-08-02'); H.fresh('2028-08-02',8,'airport_dep',{EXCHANGE_ROUTE:'US',EXCH_RULE:1,US_DEPARTED:true,US_AIRPORT_AT:T(d,7),SIS_SENDOFF:'together',SIS_GATE:true}); H.date('heroine_05'); hall();
    const a=EXCH.tick(GM); await settle(()=>!!H.G.flags.US_ARRIVED);
    check('J4. 美國交換：登機口那一段（ev_sis_gate_us）演完就關掉的存檔（US_DEPARTED、SIS_GATE、還沒 US_ARRIVED）讀回來，原本就會接著飛（大廳一小時到了＝自動登機）、登機口不重演——沒有同樣的缺口',a===true&&H.G.flags.US_ARRIVED===true&&H.cards.some(c=>c[0]==='飛往美國')&&!H.cgs.length,J([a,H.G.flags.US_ARRIVED,H.cards.map(c=>c[0])])); }
  H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
