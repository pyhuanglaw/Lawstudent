// PERF-XS-NPC-1108：坐著、在畫面外的 NPC 動畫＋彈簧骨降頻（LAWWW2-B 2026-11-09，LAWWW-B 派工）——不需要瀏覽器。
//   PERFAB（docs/art-rebuild/second_ai/wip/perf_xs_1108）：新生南路山嵐 1F／2F、大口 2F 店裡 9～11 個人，拿掉 NPC 39.7→57.9、33.2→57.8、45.1→57.2 fps。
//   做法（engine3d.js 的 updateNPC＋seatOff）：畫面外 16 m 內原本每一幀都跑 CHAR.animate；坐著（sit、read）、沒在走、不是後座／跟著走、沒在揮手、離玩家 3 m 以上的，
//   改成每 E.SEAT_OFF_EVERY（4）幀一次，沒跑的時間累加（n._skipDt）下一次一起補。
//   這支測試把 engine3d.js 裡真正的 updateNPC（和 seatOff）拿出來，用假的鏡頭、視錐、CHAR.animate 跑 60 幀（dt 1/60）：
//   1. 畫面外坐著（離玩家 8 m）：60 幀只更新 15 次；交給 CHAR.animate 的時間加上還沒補的時間＝60 幀的時間（不丟）
//   2. 畫面外 30 幀以後進畫面：進畫面那一幀就更新（而且 o.visible 已經是 true、補上累加的時間），之後每一幀都更新；時間不丟
//   3. 不受影響（每一幀都更新）：畫面外走路的、畫面外站著的、畫面外坐著但離玩家 2.5 m、畫面裡坐著的
//   4. seatOff 排除：載在你後座（passenger）、跟著你走（follow）、正在揮手、有路線的；E.SEAT_OFF_EVERY=1 ＝關掉（每一幀）
//   5. 8 個畫面外坐著的人分散在不同幀更新（每一幀 1～3 次，不會 8 個擠同一幀）
//   6. 原本就有的：畫面外 16 m 以外照舊不更新；畫面裡 28 m 外照舊隔一幀
//   修改前 0、1、4、5 FAIL（開發分支 f8b0e30d1：FAILED 5）；2、3、6 是不能改壞的部分，修改前後都要過。用法：node tests/seat_off_throttle_unit.js [engine3d.js 路徑]
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const src=fs.readFileSync(process.argv[2]||path.join(ROOT,'src/engine3d.js'),'utf8');
const mU=src.match(/  function updateNPC\(n,dt\)\{[\s\S]*?CHAR\.animate\(o,adt,[^\n]*\}\n/);
const mS=src.match(/  E\.SEAT_OFF_EVERY=[^\n]*\n  function seatOff\([^\n]*\n/);
check('0. engine3d.js 有 updateNPC',!!mU);
check('0. engine3d.js 有 seatOff、E.SEAT_OFF_EVERY、E.SEAT_OFF_NEAR',!!mS);
if(!mU){ console.log('FAILED '+fails); process.exit(1); }
const DT=1/60, close=(a,b)=>Math.abs(a-b)<1e-9;
/* 假的世界：鏡頭在 (0,1.6,0)；visFn 決定誰在畫面裡（視錐用 _frS 的球心）*/
function world(){
  const calls=[]; let visFn=()=>false;
  const E={frame:0,q:{level:'medium'},zone:{},indoor:true,npcs:[],player:{obj:{position:{x:0,y:0,z:0}},lv:0,busy:false}};
  const ctx={E,Math,camera:{position:{x:0,y:1.6,z:0}},
    _frS:{center:{x:0,y:0,z:0,set(x,y,z){ this.x=x; this.y=y; this.z=z; }},radius:1},
    _fr:{intersectsSphere:s=>visFn(s.center)},
    CHAR:{animate:(o,dt,st)=>calls.push({id:o.id,dt,pose:st.pose,vis:o.visible,f:E.frame}),setFar(){},setExpr(){}},
    farWant:()=>false, groundFn:()=>null, flatYaw(){}, wpReached:()=>false, stepSp:sp=>sp, npcStall:()=>false, followStep:()=>false,
    stepEntity:(n,dx,dz,ss,dt)=>{ n.obj.position.x+=dx*ss*dt; n.obj.position.z+=dz*ss*dt; }};
  vm.createContext(ctx); vm.runInContext((mS?mS[0]:'')+mU[0]+'\nthis.updateNPC=updateNPC;',ctx);
  const mk=(id,x,z,extra)=>{ const n=Object.assign({obj:{id,position:{x,y:0,z},rotation:{x:0,y:0,z:0,set(){}},visible:true,userData:{}},pose:'sit',idlePose:'sit',speed:0,timer:0,lv:0,lodPhase:E.npcs.length},extra||{}); E.npcs.push(n); return n; };
  const step=()=>{ E.frame++; for(const n of E.npcs) ctx.updateNPC(n,DT); };
  return {E,ctx,calls,mk,step,setVis:f=>{ visFn=f; }};
}
const of=(calls,id)=>calls.filter(c=>c.id===id);
const sumDt=a=>a.reduce((s,c)=>s+c.dt,0);
/* 1 */
{ const W=world(); const n=W.mk('a',8,0); for(let i=0;i<60;i++) W.step(); const c=of(W.calls,'a');
  check('1. 畫面外坐著（離玩家 8 m）：60 幀只更新 15 次',c.length===15,c.length+' 次');
  check('1. 時間不丟：交給 CHAR.animate 的＋還沒補的＝60 幀',close(sumDt(c)+(n._skipDt||0),60*DT),(sumDt(c)+(n._skipDt||0)).toFixed(6)+' s');
  check('1. 每一次補的是 4 幀的時間（第一次以外）',c.slice(1).every(x=>close(x.dt,4*DT)),c.slice(0,4).map(x=>x.dt.toFixed(4)).join('、')); }
/* 2 */
{ const W=world(); const n=W.mk('b',8,0); let on=false; W.setVis(()=>on);
  for(let i=0;i<30;i++) W.step(); const before=of(W.calls,'b').length; const pending=n._skipDt||0;
  on=true; W.step(); const c=of(W.calls,'b'), first=c[before];
  check('2. 進畫面那一幀就更新',!!first&&first.f===W.E.frame,first?'第 '+first.f+' 幀':'沒有更新');
  check('2. 那一次 o.visible 已經是 true（同一幀先補再畫）',!!first&&first.vis===true);
  check('2. 那一次補上累加的時間（'+(pending/DT).toFixed(0)+' 幀＋這一幀）',!!first&&close(first.dt,pending+DT)&&!(n._skipDt),first&&first.dt.toFixed(4));
  for(let i=0;i<29;i++) W.step(); const c2=of(W.calls,'b');
  check('2. 在畫面裡之後每一幀都更新',c2.length-before===30,(c2.length-before)+'／30');
  check('2. 時間不丟（60 幀）',close(sumDt(c2)+(n._skipDt||0),60*DT)); }
/* 3 */
{ const W=world(); W.mk('walk',8,0,{pose:'walk',idlePose:'idle',path:[[8,40]],speed:1.35}); W.mk('stand',8,2,{pose:'idle',idlePose:'idle'});
  W.mk('near',2.5,0); W.mk('seen',6,6); W.setVis(c=>Math.abs(c.x-6)<0.01&&Math.abs(c.z-6)<0.01);
  for(let i=0;i<60;i++) W.step();
  for(const [id,what] of [['walk','畫面外走路的'],['stand','畫面外站著的'],['near','畫面外坐著、離玩家 2.5 m'],['seen','畫面裡坐著的']]) check('3. '+what+'：每一幀都更新',of(W.calls,id).length===60,of(W.calls,id).length+'／60'); }
/* 4 */
{ const W=world(); const seatOff=W.ctx.seatOff; const o={position:{x:8,y:0,z:0}};
  check('4. seatOff 存在',typeof seatOff==='function');
  if(typeof seatOff==='function'){
    check('4. 坐著、離 8 m：降頻',seatOff({pose:'sit'},o,false)===true&&seatOff({pose:'read'},o,false)===true);
    check('4. 載在你後座的不降頻',seatOff({pose:'sit',beh:'passenger'},o,false)===false);
    check('4. 跟著你走的不降頻',seatOff({pose:'sit',beh:'follow'},o,false)===false);
    check('4. 正在揮手的不降頻',seatOff({pose:'sit',waveT:1.2},o,false)===false);
    check('4. 有路線、這一幀在走的不降頻',seatOff({pose:'sit',path:[[0,0]]},o,false)===false&&seatOff({pose:'sit'},o,true)===false);
    check('4. 躺著、站著、健身的不降頻（只限 sit、read）',['lie','idle','talk','gym_row'].every(p=>seatOff({pose:p},o,false)===false));
    check('4. 離玩家 2.9 m 不降頻、3.0 m 降頻',seatOff({pose:'sit'},{position:{x:2.9,y:0,z:0}},false)===false&&seatOff({pose:'sit'},{position:{x:3.0,y:0,z:0}},false)===true); }
  const W2=world(); W2.E.SEAT_OFF_EVERY=1; W2.mk('c',8,0); for(let i=0;i<60;i++) W2.step();
  check('4. E.SEAT_OFF_EVERY=1：關掉（每一幀更新）',of(W2.calls,'c').length===60,of(W2.calls,'c').length+'／60'); }
/* 5 */
{ const W=world(); for(let k=0;k<8;k++) W.mk('s'+k,8,k-4); const per={}; for(let i=0;i<60;i++){ const n0=W.calls.length; W.step(); per[i]=W.calls.length-n0; }
  const v=Object.values(per), mx=Math.max(...v), mn=Math.min(...v);
  check('5. 8 個畫面外坐著的人分散在不同幀（每一幀 1～3 次）',mn>=1&&mx<=3,'最少 '+mn+'、最多 '+mx+'、60 幀共 '+W.calls.length+' 次'); }
/* 6 */
{ const W=world(); W.mk('far',20,0); W.mk('farseen',30,0); W.setVis(c=>c.x>25); for(let i=0;i<60;i++) W.step();
  check('6. 原本就有：畫面外 16 m 以外不更新',of(W.calls,'far').length===0,of(W.calls,'far').length+' 次');
  check('6. 原本就有：畫面裡 28 m 外隔一幀',of(W.calls,'farseen').length===30,of(W.calls,'farseen').length+'／60'); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
