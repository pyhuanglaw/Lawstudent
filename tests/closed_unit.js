// 關著的空間：霖澤館 101 學姊的助教課（AA_399 第 6 節）、宿舍洗衣間（第 11 節）——不需要瀏覽器。
//   0  src/closed3d.js 載得到、index.html 有接（lab5f3d.js 後面）；學姊作息有助教課兩筆
//   1  助教課：大二上週二 18:30～20:20、第 4～15 週扣期中、放假不算
//   2  小窗：一週一次，三句照次數；同一週再看＝「（她在上課。）」；不是上課時間照舊（門上那一句）
//   3  作息：上課時不在場景（在 101 帶演習課）；20:20～20:40 在 101 門口；之後照舊
//   4  下課第一次找她說話多一句（交往中另一句），只有一次
//   5  洗衣間：「洗衣服」40 分鐘；大一週日 21～22 第一次遇到阿凱一句；之後、大二沒有
//   7  洗衣間有 3D 房間（dorm_laundry）：裡面的「洗衣機」一樣能洗（阿凱那一句、40 分鐘）；「烘衣機」照舊只是看（LAWWW2-B 10-24）
// 修改前（開發分支 892c9a0db）：沒有 src/closed3d.js——全部 FAIL。用法：node tests/closed_unit.js
// 2026-10-28 AA_518 第 4-14 改的（企劃線 973dd1b74，SIS-B15-1028）：演習課第 4 週起（原本第 3 週，和動態 9/29「第一次帶。」對不上）——日子往後一週：第一堂 9/29、下一週 10/6、第三週起 10/13；第 3 週 9/22 沒有。
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify, SIS='heroine_05';
global.SISY23={preTalk:async()=>false};
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CLOSED)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
let ok=true, err=''; try{ load('src/closed3d.js'); }catch(e){ ok=false; err=String(e); }
const X=()=>typeof CLOSED!=='undefined'?CLOSED:null;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const capt=[]; GM.caption=(a,b)=>{ capt.push(b); }; const toasts=[]; GM.toast=t=>{ toasts.push(t); };
const fresh=(key,h,zone)=>{ const G=H.fresh(key,h,zone||'linze'); capt.length=0; toasts.length=0; return G; };
const door101={label:'101 教室',look:'101 教室。今天這個時段沒有課，門鎖著。'};
const LOOK=['（小窗裡：她站在黑板前面。一年級的學弟妹低著頭在寫。她寫字很快，寫完會停下來等。）','（她在黑板上畫了一張圖，有人舉手，她點了一下頭。）','（她在上課。）'];

(async()=>{
await sec(0,()=>{ const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
  check('0. src/closed3d.js 載得到、index.html 接在 lab5f3d.js 後面',ok&&!!X()&&/lab5f3d\.js\?v=[^"]+"><\/script>\n<script src="src\/closed3d\.js\?v=[^"]+"><\/script>/.test(html),err);
  const sc=CHARACTERS[SIS].daily_schedule, a=sc.find(q=>q.away==='在法律系館A 101 帶演習課'), b=sc.find(q=>q.zone==='linze'&&q.act==='linger'&&q.terms&&q.terms.includes('Y2S1'));
  check('0. 學姊作息：週二 18:30～20:20 在 101 帶演習課、20:20～20:40 在 101 門口（Y2S1、第 4～15 週扣期中；AA_518 4-14）',!!a&&!!b&&a.from===18.5&&Math.abs(a.to-(20+20/60))<1e-9&&J(a.weeks)===J([4,5,6,7,10,11,12,13,14,15])&&J(b.weeks)===J([4,5,6,7,10,11,12,13,14,15])&&Math.abs(b.from-(20+20/60))<1e-9&&Math.abs(b.to-(20+40/60))<1e-9,J([a,b].map(q=>q&&{f:q.from,t:q.to,w:q.weeks})));
  check('0. SISY23.preTalk 包了一層',!!SISY23.preTalk._closed); });
if(!X()){ H.done(); return; }

await sec(1,()=>{ const on=(k,h)=>{ fresh(k,h); return X().taNow(H.G); };
  check('1. 2026-09-29（二，大二上第 4 週）19:00：有課；第 3 週（9/22）沒有（AA_518 4-14）',on('2026-09-29',19)===true&&on('2026-09-22',19)===false);
  check('1. 18:29 還沒、20:20 下課',on('2026-09-29',18.48)===false&&on('2026-09-29',20+20/60)===false);
  check('1. 第 2 週（9/15）沒有、期中第 8 週（10/27）沒有、第 15 週（12/15）有',on('2026-09-15',19)===false&&on('2026-10-27',19)===false&&on('2026-12-15',19)===true);
  check('1. 週三沒有、大三上（2027-09-21）沒有',on('2026-09-23',19)===false&&on('2027-09-21',19)===false); });

await sec(2,async()=>{ fresh('2026-09-29',19); await STORY.interact(door101,GM);
  check('2. 第一次看：「'+LOOK[0].slice(0,12)+'…」',H.said.slice(-1)[0]&&H.said.slice(-1)[0].t===LOOK[0],J(H.lines()));
  await STORY.interact(door101,GM); check('2. 同一週再看：「（她在上課。）」',H.said.slice(-1)[0].t===LOOK[2]);
  const F=Object.assign({},H.G.flags); fresh('2026-10-06',19); Object.assign(H.G.flags,{TA101_N:F.TA101_N,TA101_WK:F.TA101_WK}); await STORY.interact(door101,GM);
  check('2. 下一週：第二句',H.said.slice(-1)[0].t===LOOK[1],J(H.lines()));
  const F2=Object.assign({},H.G.flags); fresh('2026-10-13',19); Object.assign(H.G.flags,{TA101_N:F2.TA101_N,TA101_WK:F2.TA101_WK}); await STORY.interact(door101,GM);
  check('2. 第三週起：「（她在上課。）」',H.said.slice(-1)[0].t===LOOK[2]);
  fresh('2026-09-29',15); const r=await X().interact(door101,GM);
  check('2. 不是上課時間：不接（交回原本的「看」）',r===false&&H.said.length===0); });

await sec(3,()=>{ const at=(k,h)=>{ fresh(k,h); return STORY.schedEnt(CHARACTERS[SIS],H.G); };
  const e1=at('2026-09-29',19), e2=at('2026-09-29',20.5), e3=at('2026-09-29',21);
  check('3. 19:00 不在場景（在 101 帶演習課）',!!e1&&e1.zone===null&&e1.away==='在法律系館A 101 帶演習課',J(e1&&{z:e1.zone,a:e1.away}));
  check('3. 20:30 在霖澤館 101 門口（linger）',!!e2&&e2.zone==='linze'&&e2.act==='linger'&&J(e2.at)===J([-3,-5.4,0,0]),J(e2&&{z:e2.zone,act:e2.act}));
  check('3. 21:00 照舊（不是 101）',!e3||e3.zone!=='linze',J(e3&&{z:e3.zone,act:e3.act}));
  const e4=at('2026-10-27',19); check('3. 期中週照舊（不在 101）',!e4||e4.away!=='在法律系館A 101 帶演習課'); });

await sec(4,async()=>{ fresh('2026-09-29',20.4); H.FRIEND(SIS); await SISY23.preTalk(GM);
  check('4. 下課第一次說話：「……你在外面看了多久。」',H.has('……你在外面看了多久。'),J(H.lines()));
  const n=H.said.length; await SISY23.preTalk(GM); check('4. 第二次沒有',H.said.length===n);
  fresh('2026-09-29',20.4); H.FRIEND(SIS); H.date(SIS); await SISY23.preTalk(GM);
  check('4. 交往中：「我在上課的時候，不要從窗戶看我。……我會分心。」',H.has('我在上課的時候，不要從窗戶看我。……我會分心。'),J(H.lines()));
  fresh('2026-09-29',21,'linze'); H.FRIEND(SIS); await SISY23.preTalk(GM); check('4. 21:00（不是剛下課）沒有',H.said.length===0); });

await sec(5,async()=>{ const it={label:'洗衣間',look:'洗衣間。投幣式洗衣機、烘衣機各四台。現在沒有要洗的衣服。'};
  fresh('2025-10-05',21.2,'dorm_hall'); H.picks=['洗衣服']; const h0=H.G.hour; await STORY.interact(it,GM);
  check('5. 洗衣間：選項「洗衣服／算了」',J(H.opts[0])===J(['洗衣服','算了']),J(H.opts));
  check('5. 40 分鐘；大一週日 21:12 第一次：阿凱「這台烘衣機要投兩次。第一次是騙你的。」',Math.abs(H.G.hour-h0-40/60)<1e-9&&H.has('這台烘衣機要投兩次。第一次是騙你的。'),J({dh:H.G.hour-h0,said:H.lines()}));
  H.G.hour=21.2; H.said.length=0; H.picks=['洗衣服']; await STORY.interact(it,GM); check('5. 第二次沒有阿凱、提示「衣服洗好了。」',H.said.length===0&&toasts.includes('衣服洗好了。'));
  fresh('2026-10-04',21.2,'dorm_hall'); H.picks=['洗衣服']; await STORY.interact(it,GM); check('5. 大二的週日沒有阿凱',!H.has('這台烘衣機要投兩次。第一次是騙你的。'));
  fresh('2025-10-05',21.2,'dorm_hall'); H.picks=['算了']; const h1=H.G.hour; await STORY.interact(it,GM); check('5. 「算了」：時間沒動',H.G.hour===h1); });

await sec(6,()=>{ const E=H.E; /* 阿忠水果的老闆（LAWWW2-B 5437ec936 的 owner 站位）：營業時間站在攤子後面，22:00 以後離開 */
  global.WZS={AA413:{fruit:{open:[9,22],owner:{x:34.9,z:-6.15,yaw:0}}},fruitOpen:G=>{ const h=G.hour%24; return h>=9&&h<22; }};
  const built=[]; global.CHAR=global.CHAR||{}; const cb0=CHAR.build; CHAR.build=()=>({position:{set(x,y,z){ this.x=x; this.z=z; }},rotation:{y:0}});
  const es0=STORY.extraSpec; STORY.extraSpec=STORY.extraSpec||(()=>({})); const a0=E.addNPC, r0=E.removeNPC; E.addNPC=n=>{ E.npcs.push(n); built.push(n); return n; }; E.removeNPC=n=>{ E.npcs=E.npcs.filter(m=>m!==n); };
  fresh('2026-03-10',15,'wenzhou'); E.npcs=[];
  const k=CLOSED.fruitOwner(GM); const o=E.npcs.find(n=>n.fruitOwner);
  check('6. 15:00 在溫州街：老闆站在 (34.9,−6.15)',k===1&&!!o&&o.obj.position.x===34.9&&o.obj.position.z===-6.15&&o.frozen);
  check('6. 再叫一次不重複放',CLOSED.fruitOwner(GM)===0&&E.npcs.filter(n=>n.fruitOwner).length===1);
  H.G.hour=22.2; check('6. 22:00 以後離開',CLOSED.fruitOwner(GM)===-1&&!E.npcs.some(n=>n.fruitOwner&&!n.leaving));
  H.G.zone='campus'; H.G.hour=15; E.npcs=[]; check('6. 不在溫州街：不放',CLOSED.fruitOwner(GM)===0&&!E.npcs.length);
  CHAR.build=cb0; STORY.extraSpec=es0; E.addNPC=a0; E.removeNPC=r0; delete global.WZS; });

await sec(7,async()=>{ const it={label:'洗衣機',look:'洗衣機'};
  fresh('2025-10-12',21.2,'dorm_laundry'); H.picks=['洗衣服']; const h0=H.G.hour; await STORY.interact(it,GM);
  check('7. 洗衣間裡面的洗衣機：選項「洗衣服／算了」、40 分鐘、大一週日第一次阿凱那一句',J(H.opts[0])===J(['洗衣服','算了'])&&Math.abs(H.G.hour-h0-40/60)<1e-9&&H.has('這台烘衣機要投兩次。第一次是騙你的。'),J({opts:H.opts,dh:H.G.hour-h0}));
  fresh('2025-10-12',21.2,'dorm_laundry'); H.opts.length=0; const r=await CLOSED.interact({label:'烘衣機',look:'烘衣機'},GM); check('7. 烘衣機不是洗衣服（照舊只是看）',r===false&&!H.opts.length); });

H.done();
})();
