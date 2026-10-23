// 店員支線做完以後店裡的痕跡（SQ-TRACES-1023；LAWWW2 ed65a78e 的 3D 道具＋SIDEQ.traceOn）——不需要瀏覽器。
//   1 五個正式模型裡有 TRACE_SQxx 節點（l118_pasta SQ12、l118_korea SQ13、wz_teahouse_interior SQ14、wz_teishoku_interior SQ19、wz_brunch_interior SQ20）
//   2 SIDEQ.traceOn：沒做＝沒有；做完當天沒有、隔天起有（和旁白同一個時間）；SQ13、SQ20 過期（店員交代過）照樣有，其他過期沒有；經濟系沒有
//   3 接線：zones3d.js traceVis（attachRoomGLB 照名字接、SQ16 紙條）、公館「找車行老闆」SIDEQ.bikeShop 有了才顯示、story3d.js 的 it.shop==='bike'
// 修改前（開發分支 0352762ee）：沒有 SIDEQ.traceOn、模型沒有痕跡節點——FAIL。用法：node tests/sq_traces_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check}=H, J=JSON.stringify;
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(EAT|EAT_LINES|WZS|L118|LANE118_SHOPS|LANE118_LAYOUT|PARK|WZ_PARK_LAYOUT|SIDEQ|MSG|MSG_POOL|MSG2_POOL)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/data/eat_lines.js','src/eat3d.js','src/data/lane118_layout.js','src/data/lane118_shops.js','src/lane118.js','src/data/wz_park_layout.js','src/wzpark3d.js','src/wzshops3d.js','src/sideq3d.js']) load(f);
const glbNodes=f=>{ const b=fs.readFileSync(path.join(H.ROOT,'assets/models/env/second_ai/'+f+'.glb')); return JSON.parse(b.slice(20,20+b.readUInt32LE(12)).toString()).nodes.map(n=>n.name||''); };
for(const [f,id] of [['l118_pasta','SQ12'],['l118_korea','SQ13'],['wz_teahouse_interior','SQ14'],['wz_teishoku_interior','SQ19'],['wz_brunch_interior','SQ20']]){ const N=glbNodes(f).filter(n=>n.startsWith('TRACE_'+id)); check('1. '+f+'.glb 有 TRACE_'+id+' 節點',N.length>0,J(N)); }
const S=typeof SIDEQ!=='undefined'?SIDEQ:null;
check('2. SIDEQ.traceOn 存在',!!(S&&S.traceOn));
if(S&&S.traceOn){ const D=k=>STORY.dayOfKey(k); const G=H.fresh('2027-10-05',12,'dorm',{EXCHANGE_ROUTE:'TW'}); G.side={};
  check('2. 沒做：SQ12 沒有',!S.traceOn(G,'SQ12'));
  G.side.SQ12={state:'done',step:'done',doneDay:G.day}; check('2. 做完當天沒有、隔天起有',!S.traceOn(G,'SQ12')&&(G.day++,S.traceOn(G,'SQ12')));
  G.side.SQ19={state:'lapsed',told:G.day-3}; check('2. SQ19 過期：沒有失物籃',!S.traceOn(G,'SQ19'));
  G.side.SQ13={state:'lapsed',told:G.day-1}; G.side.SQ20={state:'lapsed',told:G.day-1}; check('2. SQ13、SQ20 過期（店員交代過）：罐子、證書照樣有',S.traceOn(G,'SQ13')&&S.traceOn(G,'SQ20'));
  G.side.SQ16={state:'lapsed',told:G.day-1}; check('2. SQ16 過期：沒有紙條',!S.traceOn(G,'SQ16'));
  G.stage='econ'; check('2. 經濟系：沒有',!S.traceOn(G,'SQ12')); }
const z=fs.readFileSync(path.join(H.ROOT,'src/zones3d.js'),'utf8'), st=fs.readFileSync(path.join(H.ROOT,'src/story3d.js'),'utf8');
check('3. zones3d.js：traceVis（SIDEQ.traceOn 每一格看）、attachRoomGLB 接 TRACE_SQxx、SQ16 紙條 TRACE_SQ16_note',/function traceVis\(o,id\)/.test(z)&&/\^TRACE_\(SQ\\d\+\)/.test(z)&&/TRACE_SQ16_note/.test(z));
check('3. 公館「找車行老闆」shop:bike：SIDEQ.bikeShop 有了才顯示；story3d.js 接 it.shop===\'bike\'',/label:'找車行老闆',shop:'bike',get hidden\(\)\{ return !\(typeof SIDEQ!=='undefined'&&SIDEQ\.bikeShop\); \}/.test(z)&&/it\.shop==='bike'\)\{ if\(typeof SIDEQ!=='undefined'&&SIDEQ\.bikeShop\) await SIDEQ\.bikeShop\(GM\)/.test(st));
check('3. SQ16 還沒有劇本：SIDEQ.bikeShop 先不定義（按鈕不出現）',!!S&&typeof S.bikeShop==='undefined');
H.done();
