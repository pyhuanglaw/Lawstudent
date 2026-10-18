// 一模一樣的路人站在旁邊（BUG-NPC-DUP-1018；使用者 10-18「蠻常有 2 個一模一樣穿搭的人在附近或者就在旁邊」）——不需要瀏覽器。
// game3d.js 的 GM.dedupAnon＋character3d.js 的 CHAR.anonKeyOf／anonPool.alt／reAnon：
// 1. 4 m 內同一層有兩個人用同一個路人底模 → 換掉一個，換成附近沒人用、已經下載好的；位置、朝向不變；換完附近沒有重複。
// 2. 平常（all=false）只換不在畫面裡的人；換區域的黑幕裡（all=true）全部換。
// 3. 4 m 以外、不同樓層、有名字的人物不動；換的那個記在自己的 buildSpec.anonKey，同一個 id 的另一個人不受影響。
// 修改前：dedupAnon 不存在。用法：node tests/anon_dedup_unit.js
const {preload}=require('../tools/dev_scratch/spring_sim/harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
let fails=0; const check=(n,ok,i)=>{ console.log((ok?'PASS ':'FAIL ')+n+(i?'　'+i:'')); if(!ok) fails++; };
const F=['char.npc_nf1','char.npc_nf2','char.npc_nf3'];
(async()=>{
  await preload(F);
  CHAR.anonPool.cur=F.slice(); CHAR.anonPool.uses={}; CHAR.anonPool.pick={};
  const src=fs.readFileSync(path.join(__dirname,'..','src/game3d.js'),'utf8'); const m=/GM\.dedupAnon=function\(all\)\{[\s\S]*?\n    return n; \};/.exec(src);
  check('game3d.js 有 GM.dedupAnon',!!m); if(!m){ console.log('FAILED: '+fails); process.exit(1); }
  const scene=new THREE.Group(); const E={npcs:[],camera:null,prePose:null}; const GM={};
  vm.runInNewContext(m[0],{GM,E,CHAR,THREE,Math,Set});
  const mk=(id,key,x,z,lv)=>{ const spec=Object.assign({},STORY_SPEC(id),{anonKey:key}); const o=CHAR.build(spec); o.position.set(x,0,z); o.rotation.y=1.2; scene.add(o); const n={obj:o,isExtra:true,lv:lv|0}; E.npcs.push(n); return n; };
  function STORY_SPEC(id){ return {id,name:'',sex:'f',height:1.6}; }
  const a=mk('x0',F[0],0,0), b=mk('x2',F[0],1.5,0), c=mk('x4',F[1],0,1.2), far=mk('x6',F[0],20,0), up=mk('x8',F[1],0.5,0.5,1);
  check('（前提）a、b 用同一個底模',CHAR.anonKeyOf(a.obj)===F[0]&&CHAR.anonKeyOf(b.obj)===F[0],[CHAR.anonKeyOf(a.obj),CHAR.anonKeyOf(b.obj)].join(','));
  // 2. 在畫面裡：不換（鏡頭正對著這群人）
  const cam=new THREE.PerspectiveCamera(50,1,0.1,100); cam.position.set(0,3,8); cam.lookAt(0,1,0); cam.updateMatrixWorld(true); E.camera=cam;
  const n0=GM.dedupAnon(false); check('在畫面裡的人不換（換模型會閃一下）',n0===0&&CHAR.anonKeyOf(a.obj)===F[0]&&CHAR.anonKeyOf(b.obj)===F[0],'換了 '+n0);
  // 1. 換區域的黑幕裡：全部換
  const before=b.obj.position.clone(), ry=b.obj.rotation.y; const n1=GM.dedupAnon(true);
  const keys=()=>E.npcs.map(n=>CHAR.anonKeyOf(n.obj));
  check('黑幕裡換掉重複的那一個',n1>=1,'換了 '+n1+'：'+keys().join(','));
  const near=(p,q)=>p!==q&&(p.lv|0)===(q.lv|0)&&Math.hypot(p.obj.position.x-q.obj.position.x,p.obj.position.z-q.obj.position.z)<4;
  const dup=E.npcs.some(p=>E.npcs.some(q=>near(p,q)&&CHAR.anonKeyOf(p.obj)===CHAR.anonKeyOf(q.obj)));
  check('換完 4 m 內同一層沒有重複',!dup,keys().join(','));
  const moved=[a,b].find(n=>CHAR.anonKeyOf(n.obj)!==F[0]); check('換的人換成附近沒人用的底模（'+F[2]+'）',!!moved&&CHAR.anonKeyOf(moved.obj)===F[2],moved&&CHAR.anonKeyOf(moved.obj));
  check('位置、朝向不變、還在場景裡',!!moved&&moved.obj.position.distanceTo(moved===b?before:new THREE.Vector3(0,0,0))<1e-6&&Math.abs(moved.obj.rotation.y-1.2)<1e-6&&moved.obj.parent===scene);
  check('4 m 以外、不同樓層的人不動',CHAR.anonKeyOf(far.obj)===F[0]&&CHAR.anonKeyOf(up.obj)===F[1]);
  check('記在自己的 buildSpec（不是用 id 換：同一個 id 的別人不受影響）',!!moved&&moved.obj.userData.buildSpec.anonKey===F[2]&&CHAR.anonPool.pick[moved.obj.userData.buildSpec.id]!==F[2]);
  // 3. 有名字的人物不參加
  const named={userData:{buildSpec:{id:'npc_fangyt'},spec:{model:F[0],anonPick:true},driver:'vrm',key:F[0]}}; check('有名字的人物不參加（id 不是 x 編號）',CHAR.anonKeyOf(named)===null);
  // 背面：在畫面外的人（鏡頭轉開）平常也會換
  const d=mk('x10',F[1],30,30), e=mk('x12',F[1],31,30); const n2=GM.dedupAnon(false); check('不在畫面裡的重複，平常也會換',n2>=1&&CHAR.anonKeyOf(d.obj)!==CHAR.anonKeyOf(e.obj),'換了 '+n2);
  console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
