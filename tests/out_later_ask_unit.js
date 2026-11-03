// 出遊選單「晚一點」：再問的時間不能晚過最晚能出發的時候（BUG-OUT-LATER-MISS-1103；BB 11-03 20:16，CC later2：導覽結束後 16:19 按「晚一點」，ask 16:39，但 lateTo 只到 16:34＝16:49 直接 missed、中間沒再問）。
// 不需要瀏覽器。修改前 1、2 FAIL。用法：node tests/out_later_ask_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
global.window=global; global.document={getElementById:()=>null,addEventListener(){}};
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'src/outings3d.js'),'utf8').replace(/^const OUT\s*=/m,'globalThis.OUT='),{filename:'outings3d.js'});
(async()=>{
  const asked=[]; let pick=1, shown=null; const missed=[];
  const GM={G:null,sceneBegin(){},sceneEnd(){},choose:async O=>{ shown=O.map(o=>o.t); asked.push(GM.G.hour); return pick; }}; OUT.onMissed=(g,q)=>missed.push(q.id);
  const mk=(q)=>({flags:{OUT_WORLDREN:true},day:1,hour:16+19/60,outings:[Object.assign({id:'l123_l3_1',state:'planned',day:1,h:16,late:0.25,title:'系學會合照',place:'圓窗館前',travelH:1/6,goto:{zone:'campus',x:0,z:0}},q)]});
  const run=async(from,to)=>{ for(let h=from;h<=to+1e-9;h+=1/60){ GM.G.hour=h; global.CLS={touring:false}; const r=OUT.tick(GM); if(r&&r.then) await r; } };
  // 1. 導覽延長到 16:34（lateTo），16:19 按「晚一點」：16:24（16:34－路上 10 分）以前要再問一次，不會沒問就錯過
  GM.G=mk({lateTo:24+16+34/60}); pick=1; asked.length=0; missed.length=0;
  await run(16+19/60,16+19/60); const q=GM.G.outings[0];
  check('1. 16:19 按「晚一點」：再問的時間不晚於 16:24',q.ask!=null&&q.ask<=24+16+24/60+1e-6,String(q.ask&&(q.ask-24)));
  pick=0; GM.G.hour; const before=asked.length; OUT.go=async()=>{}; const go0=OUT.go;
  pick=2; await run(16+20/60,16+34/60);
  check('2. 16:34 以前又問了一次（還沒錯過之前）',asked.length>before&&asked[asked.length-1]<=16+34/60+1e-6,JSON.stringify(asked.map(h=>h.toFixed(3))));
  // 3. 選單字：不到 20 分鐘寫實際時間
  GM.G=mk({lateTo:24+16+34/60}); pick=2; asked.length=0; await run(16+19/60,16+19/60);
  check('3. 不到 20 分鐘的「晚一點」寫幾點再提醒',shown&&shown.some(t=>/^晚一點（16:24 再提醒）$/.test(t)),JSON.stringify(shown));
  // 4. 最晚能出發的時間已經不到 1 分鐘：不給「晚一點」，「不去了」照舊是不去
  GM.G=mk({lateTo:24+16+30/60}); pick=1; missed.length=0; await run(16+20/60,16+20/60);
  check('4. 只剩不到 1 分鐘：選單沒有「晚一點」；按第二個＝不去了',shown&&!shown.some(t=>/^晚一點/.test(t))&&GM.G.outings[0].state==='missed',JSON.stringify(shown)+' '+GM.G.outings[0].state);
  // 5. 時間還很多：照舊 20 分鐘
  GM.G=mk({h:18,late:0.75}); shown=null; pick=1; await run(17.75,17.75);
  check('5. 時間還很多：照舊「晚一點（20 分鐘後再提醒）」、ask＝現在＋20 分',shown&&shown.includes('晚一點（20 分鐘後再提醒）')&&Math.abs(GM.G.outings[0].ask-(24+17.75+1/3))<1e-6,JSON.stringify(shown));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
