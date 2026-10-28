// 店員支線做完以後店裡的痕跡（SQ-TRACES-1023；LAWWW2 ed65a78e 的 3D 道具＋SIDEQ.traceOn）——不需要瀏覽器。
//   1 五個正式模型裡有 TRACE_SQxx 節點（l118_pasta SQ12、l118_korea SQ13、wz_teahouse_interior SQ14、wz_teishoku_interior SQ19、wz_brunch_interior SQ20）
//   2 SIDEQ.traceOn：沒做＝沒有；做完當天沒有、隔天起有（和旁白同一個時間）；SQ13、SQ20 過期（店員交代過）照樣有，其他過期沒有；經濟系沒有
//   3 接線：zones3d.js traceVis（attachRoomGLB 照名字接、SQ16 紙條）、公館「找車行老闆」SIDEQ.bikeShop 有了才顯示、story3d.js 的 it.shop==='bike'
//   4 SQ16 輪轉單車（AA_405＋第 3 節 f923751c＋AA_408 第 1 節）：一天一次、第 5 次起開口；平常招呼兩句輪流；普通 201 門口週四晚上「問登山社的人」；
//     回車行做完；隔天紙條旁白＋3D 紙條；下學期換名字＋「第一個」；過期＝「那台車我拆了」、沒有紙條；每一句照稿
// 修改前（開發分支 0352762ee）：沒有 SIDEQ.traceOn、模型沒有痕跡節點、沒有 SQ16——FAIL。用法：node tests/sq_traces_unit.js
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
check('3. SQ16 劇本到了（AA_405 第 3 節）：SIDEQ.bikeShop 有了（按鈕出現）',!!S&&typeof S.bikeShop==='function');
(async()=>{ if(!S||!S.bikeShop){ H.done(); return; }
  const cp=require('child_process'), sh=c=>{ try{ return cp.execSync(c,{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ return ''; } };
  const doc=sh('git -c core.quotepath=false show f923751c:"docs/story_planning/AA_405_店員的支線_第三批.md"')+sh('git -c core.quotepath=false show b0b80a54:"docs/story_planning/AA_408_店員支線補字_回LAWWW實作問題.md"')
    +sh('git -c core.quotepath=false show 33189103b:"docs/story_planning/AA_498_法律系同學二十位_共同做法_改名_第一批五位.md"');   /* AA_498 第 1 節：借車名單和 pool 撞名的兩個名字換成黃惠玲、鄭文彬 */
  const L=S.LINES.SQ16, all=[].concat(L.open,[L.look,L.ask],L.club,L.msg,[L.back,L.note],L.greet,[L.rename.split('{名字}')[0],L.lent.split('{N}')[0],L.lapse],L.names);
  const strip=t=>t.replace(/^（|）$/g,'');
  const bad=all.filter(t=>doc.indexOf(t)<0&&doc.indexOf(strip(t))<0);
  check('4. SQ16 每一句照稿（AA_405、第 3 節 f923751c、AA_408 第 1 節）',!!doc&&!bad.length,J(bad));
  const D=k=>STORY.dayOfKey(k), GM=H.GM, said=()=>H.said.map(x=>(x.who?x.who+'：':'')+x.t);
  const go=(key,h,zone)=>{ const d=D(key); H.G.day=d; H.G.hour=h; H.G.weekday=CALENDAR.dateOf(d).wd%7; H.G.zone=zone||'gongguan'; H.said=[]; H.opts=[]; };
  const G=H.fresh('2026-09-28',15,'gongguan',{EXCHANGE_ROUTE:'TW'}); S.roll=()=>0;
  for(const k of ['2026-09-28','2026-09-29','2026-09-30','2026-10-01']){ go(k,15); await S.bikeShop(GM); }
  check('4. 前四次（一天一次）：平常的招呼兩句輪流，沒有開口',S.bikeN(G)===4&&!S.get(G,'SQ16'));
  go('2026-10-01',16); await S.bikeShop(GM); check('4. 同一天再按：不多算一次',S.bikeN(G)===4);
  go('2026-10-02',15); const g0=(G.flags.BIKE_SHOP.g|0); await S.bikeShop(GM); const ga=said();
  go('2026-10-02',16); await S.bikeShop(GM); const gb=said();
  check('4. 招呼：「打氣筒在門口，自己來。」「今天沒什麼車要修。……坐一下可以。」輪流（或第 5 次開口）',(S.get(G,'SQ16')&&S.get(G,'SQ16').state==='open')||(ga.length===1&&gb.length===1&&ga[0]!==gb[0]),J([ga,gb]));
  /* 第 5 次＝認得你：開口 */
  const G2=H.fresh('2026-10-05',15,'gongguan',{EXCHANGE_ROUTE:'TW'}); G2.flags.BIKE_SHOP={n:4,day:D('2026-10-04'),g:0}; H.picks=[0]; await S.bikeShop(GM); const r=S.get(G2,'SQ16');
  check('4. 大二上、第 5 次：車行老闆兩句開口 →「要我幫忙嗎？」→ 看車架的旁白；掛進順手的事（兩週內）',!!r&&r.state==='open'&&r.step==='ask'&&r.by===G2.day+14&&H.said[0].who==='車行老闆'&&H.said[0].t===L.open[0]&&H.said.some(x=>x.t===L.look),J(said()));
  check('4. 手機「今天」：輪轉單車那一則＋下一步「問登山社的人」',/輪轉單車：兩年沒人來牽的車/.test(S.todayHTML(G2))&&/問登山社的人/.test(S.todayHTML(G2)));
  /* 普通 201：週四 19:30～21:00、第 5～15 週 */
  go('2026-10-08',19.75,'putong'); const due=S.hikeAskDue(G2); go('2026-10-08',18,'putong'); const early=S.hikeAskDue(G2); go('2026-10-07',19.75,'putong'); const wed=S.hikeAskDue(G2);
  check('4. 普通 201 門口：週四 19:45 可以問；18:00、週三不行',due&&!early&&!wed);
  const IT=[{x:0,z:0,room:'201',label:'看看 201 教室',look:'x'}]; GM.E.interactables=IT; S.populate('putong',GM); go('2026-10-08',19.75,'putong');
  check('4. 門口的字：那段時間是「問登山社的人」，平常照舊',IT[0].label==='問登山社的人'&&(H.G.hour=18,IT[0].label==='看看 201 教室'));
  go('2026-10-08',19.75,'putong'); H.picks=[0]; const ok=await STORY.interact(IT[0],GM);
  check('4. 問：「請問一下，這張貼紙是你們社團的嗎？」→ 登山社的學姊兩句 → 她手機的兩句旁白；下一步回車行',ok===true&&J(H.opts[0])===J(['「'+L.ask+'」','（先不要）'])&&J(H.said.map(x=>x.t))===J(L.club.concat(L.msg))&&H.said[0].who==='登山社的學姊'&&r.step==='back'&&r.by==null,J(said()));
  go('2026-10-09',15); await S.bikeShop(GM);
  check('4. 回車行：「送給新生？……好。那我把它修好。」＝做完；當天還沒有紙條',r.state==='done'&&H.said.some(x=>x.who==='車行老闆'&&x.t===L.back)&&!S.traceOn(G2,'SQ16'),J(said()));
  go('2026-10-10',15); await S.bikeShop(GM);
  check('4. 下一次來：「（車頭掛了一張紙：『免費借給新生，一學期』。）」；3D 紙條出現（traceOn）',H.said.some(x=>x.t===L.note)&&S.traceOn(G2,'SQ16'),J(said()));
  go('2026-10-20',15); await S.bikeShop(GM); check('4. 同一學期之後：平常的招呼',H.said.length===1&&L.greet.includes(H.said[0].t),J(said()));
  go('2027-02-23',15); await S.bikeShop(GM);
  check('4. 下學期開學以後第一次來：「（車籃那張紙上，借車的名字換成了：陳品叡。）」＋「那台車這學期也借出去了。……第一個。」',J(said())===J(['（車籃那張紙上，借車的名字換成了：陳品叡。）','車行老闆：那台車這學期也借出去了。……第一個。']),J(said()));
  go('2027-03-01',15); await S.bikeShop(GM); check('4. 同一學期第二次：不再換',!H.said.some(x=>/借車的名字/.test(x.t)));
  /* 過期：兩週內沒去問 */
  const G3=H.fresh('2026-10-05',15,'gongguan',{EXCHANGE_ROUTE:'TW'}); G3.flags.BIKE_SHOP={n:4,day:D('2026-10-04'),g:0}; H.picks=[0]; await S.bikeShop(GM);
  go('2026-10-26',15); await S.bikeShop(GM); const r3=S.get(G3,'SQ16');
  check('4. 過期（兩週內沒問）：下一次來「那台車我拆了，零件給別台用。」；沒有紙條',!!r3&&r3.state==='lapsed'&&H.said.some(x=>x.who==='車行老闆'&&x.t===L.lapse)&&!S.traceOn(G3,'SQ16')&&(G3.day+=3,!S.traceOn(G3,'SQ16')),J(said()));
  const G4=H.fresh('2026-04-06',15,'gongguan',{EXCHANGE_ROUTE:'TW'}); G4.flags.BIKE_SHOP={n:9,day:D('2026-04-05'),g:0}; await S.bikeShop(GM);
  check('4. 大一：不開口（大二起）',!S.get(G4,'SQ16'));
  H.done(); })();
