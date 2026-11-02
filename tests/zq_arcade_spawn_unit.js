// 子晴在公館騎樓（插座旁邊）的生成（ZQ-ARCADE-SEAT-1028；story3d.js 坐著讀的那一支＋prop）——不需要瀏覽器。
//   1 有凳子（正式模型登記了座位 15.6,19.8）：她坐在凳子上、姿勢 read、筆電道具打開（CHAR.setProp laptop_lap true）
//   2 沒有凳子（GLB 沒載入＝公館沒有座位）：照原本站在插座旁邊（16,20.6 附近），不要整個人不見、不開筆電
// 修改前（開發分支 0b4acc850）：沒有座位時 return＝子晴不生成——第 2 項 FAIL。用法：node tests/zq_arcade_spawn_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM,E}=H, J=JSON.stringify;
const loadG=(f,names)=>{ let s=fs.readFileSync(path.join(H.ROOT,f),'utf8'); for(const n of names) s=s.replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'='); vm.runInThisContext(s,{filename:f}); };
for(const [f,n] of [['src/sideq3d.js',['SIDEQ']],['src/data/pool_story.js',['POOL_STORY']],['src/pool3d.js',['POOL']],['src/data/heroine_circle.js',['HCIRCLE_DATA']],['src/hcircle3d.js',['HCIRCLE']]]) if(fs.existsSync(path.join(H.ROOT,f))) loadG(f,n);
GM.toast=()=>{}; GM.caption=()=>{};
const props=[]; global.CHAR=Object.assign(global.CHAR||{},{ build:()=>({position:{x:0,y:0,z:0,set(x,y,z){ this.x=x; this.y=y; this.z=z; }},rotation:{y:0},userData:{},visible:true}), setProp:(h,name,on)=>{ props.push([name,on]); return true; }, setExpr(){} });
GM.spawnCharacter=(id,x,z,o)=>{ o=o||{}; const n={id,charId:id,name:id,obj:{position:{x,y:0,z},rotation:{y:o.yaw||0}},seat:o.seat||null,pose:o.pose||'idle',lv:o.lv|0}; GM.npc[id]=n; E.npcs.push(n); return n; };   /* 假的生人物：記位置、座位、姿勢 */
const pop=(seats)=>{ props.length=0; E.q=E.q||{level:'high'}; E.interactables=[]; E.zone={id:'gongguan',seats}; E.npcs.length=0; GM.npc={}; E.addNPC=n=>{ E.npcs.push(n); return n; }; GM.spawnExtra=()=>null; GM.spawnRider=()=>null; STORY.populate('gongguan',GM); return GM.npc.heroine_04||null; };
const d=STORY.dayOfKey('2028-09-05');   /* 大四上（週二）22:30：c509_4_1 */
const set=()=>{ const G=H.fresh('2028-09-05',22.5,'gongguan',{EXCHANGE_ROUTE:'TW',afternoonDone:true}); G.weekday=2; H.FRIEND('heroine_04'); SOCIAL.remember('heroine_04','FIRST_MET',''); return G; };
{ set(); const e=STORY.schedEnt(CHARACTERS.heroine_04,H.G); check('0. 那天 22:30 子晴的作息是公館騎樓（插座旁邊）、坐著讀、筆電',!!e&&e.zone==='gongguan'&&e.act==='read'&&e.prop==='laptop_lap',J(e&&{zone:e.zone,act:e.act,prop:e.prop,hc:e.hc})); }
{ set(); const n=pop([{x:15.6,z:19.8,yaw:0,label:'坐在騎樓的板凳',kind:'stool'}]);
  check('1. 有凳子：坐在凳子上、read、筆電打開',!!n&&!!n.seat&&Math.abs(n.seat.x-15.6)<1e-6&&Math.abs(n.seat.z-19.8)<1e-6&&n.pose==='read'&&props.some(p=>p[0]==='laptop_lap'&&p[1]===true),J({has:!!n,seat:n&&n.seat,pose:n&&n.pose,props})); }
{ set(); const n=pop([]); const p=n&&n.obj&&n.obj.position;
  check('2. 沒有凳子（模型沒載入）：照原本站在插座旁邊、沒開筆電',!!n&&!n.seat&&!!p&&Math.hypot(p.x-16,p.z-20.6)<1.5&&!props.some(q=>q[0]==='laptop_lap'),J({has:!!n,pos:p&&[p.x,p.z],props})); }
H.done();
