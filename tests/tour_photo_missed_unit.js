// 總圖新生導覽中間遇到出遊（大一第 1 週 16:00 系學會合照 l123_l3_1，late 15 分）＝不能被記成錯過；導覽結束要跳「出發：」，寬限從導覽結束重新算（至少 15 分鐘）。
// BUG-TOUR-PHOTO-MISSED-1103（BB 11-03 18:22，CC tour_tap2：15e78dff7、b267b0534 都是導覽 16:17～16:33 結束時 state:'missed'、due=null）。不需要瀏覽器。修改前 1、2 FAIL。用法：node tests/tour_photo_missed_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
global.window=global; global.document={getElementById:()=>null,addEventListener(){}};
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'src/outings3d.js'),'utf8').replace(/^const OUT\s*=/m,'globalThis.OUT='),{filename:'outings3d.js'});
(async()=>{
  const prompts=[], missed=[]; OUT.prompt=async(GM,q)=>{ prompts.push(q.id+'@'+GM.G.hour); }; OUT.onMissed=(GM,q)=>{ missed.push(q.id); };
  const mk=()=>({G:{flags:{OUT_WORLDREN:true},day:1,hour:15.5,outings:[{id:'l123_l3_1',state:'planned',day:1,h:16,late:0.25,title:'系學會合照',place:'法律系館A',travelH:0}]}});
  const run=async(GM,from,to,tourEnd)=>{ for(let h=from;h<=to+1e-9;h+=1/60){ GM.G.hour=h; global.CLS={touring:h<tourEnd}; const r=OUT.tick(GM); if(r&&r.then) await r; if(prompts.length) break; } };
  // 1. 導覽 15:30～16:20：導覽中不跳也不記錯過；16:20 結束以後跳「出發：」
  let GM=mk(); await run(GM,15.5,17,16+20/60);
  const q=GM.G.outings[0];
  check('1. 導覽 15:30～16:20、合照 16:00 late 15 分：導覽中沒有記成錯過',!missed.length&&q.state!=='missed',JSON.stringify({missed,state:q.state}));
  check('2. 導覽結束以後跳「出發：」（16:20 之後、16:35 以前）',prompts.length===1&&+prompts[0].split('@')[1]>=16+20/60-1e-6&&+prompts[0].split('@')[1]<=16+35/60,JSON.stringify(prompts));
  // 3. 導覽結束以後一直不出發：寬限過了才算錯過（16:20＋15 分＝16:35 以後）
  prompts.length=0; missed.length=0; GM=mk(); OUT.prompt=async()=>{}; await run(GM,15.5,16.5,16+20/60);
  check('3. 結束後 15 分鐘內還沒錯過',GM.G.outings[0].state==='planned'&&!missed.length,GM.G.outings[0].state);
  await run(GM,16.5,17,0);
  check('4. 寬限過了照舊記錯過（onMissed）',GM.G.outings[0].state==='missed'&&missed.length===1,JSON.stringify(missed));
  // 5. 沒有導覽：照舊 16:15 以後錯過（不受影響）
  missed.length=0; GM=mk(); await run(GM,15.9,16.3,0);
  check('5. 沒有導覽：照舊 16:15 以後算錯過',GM.G.outings[0].state==='missed'&&!GM.G.outings[0].lateTo);
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
