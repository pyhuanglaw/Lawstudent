// 開學典禮、畢業典禮換成體育館 3F 的 3D（AA_399 第 4 節；src/gymcer3d.js）——不需要瀏覽器。
//   1 開學典禮 2025-08-31：進 gym_arena、玩家坐 spots.me；宿營認識的以安、阿哲、Alison 坐在旁邊（沒認識的不放）；旁白三句一字不改、加進全班群組、演完 15:30 起身
//   2 布置沒有（體育館區域不在／那天不是典禮日）：照原本的 2D（S.ceremonyY1 原本那一版）
//   3 畢業典禮 2029-06-02：gradStage 進 gym_arena、玩家坐下、家人兩位坐在 spots.family；story3d.js gradFamily 叫 GYMCER.gradStage、ADV 用 'blur'
//   4 index.html：gymcer3d.js 在 story3d.js、gym3d.js 後面
// 修改前（9569c4dd1）：沒有 src/gymcer3d.js——全部 FAIL。用法：node tests/gymcer_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
const SPOTS={me:{x:1.2,z:-0.95,yaw:Math.PI},an:{x:1.82,z:-0.95,yaw:Math.PI},zhe:{x:2.44,z:-0.95,yaw:Math.PI},alison:{x:1.82,z:0.1,yaw:Math.PI},family:[{x:4.0,z:20.05,y:1.86,yaw:Math.PI},{x:4.5,z:20.05,y:1.86,yaw:Math.PI},{x:5.0,z:20.05,y:1.86,yaw:Math.PI}]};
let cerDay=null; global.Z3=global.Z3||{}; Z3.ZONES=Z3.ZONES||{}; Z3.ZONES.gym_arena={id:'gym_arena'}; global.GY3={ceremonyDay:()=>cerDay};
let origCalls=0; const o0=STORY.ceremonyY1; STORY.ceremonyY1=async function(){ origCalls++; return true; };   /* 原本的 2D 版（這裡只記有沒有叫）*/ STORY._gymcer=false;
const L3=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); return true; };
let ok=false, err=''; try{ ok=L3('src/gymcer3d.js'); }catch(e){ err=String(e); }
const X=()=>typeof GYMCER!=='undefined'?GYMCER:null;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,2).join(' / ')); } };
let sat=[], spawned=[], npcs=[], stood=0;
const setup=(key,h,camp)=>{ const G=H.fresh(key,h,'dorm'); sat=[]; spawned=[]; npcs=[]; stood=0; GM.npc={};
  GM.E.player=GM.E.player||{}; GM.E.player.seat=null;
  GM.enter=async(z,sp)=>{ H.entered.push(z); G.zone=z; GM.E.zone=cerDay?{id:z,ceremonyOn:cerDay,cerSpots:SPOTS}:{id:z}; };
  GM.sitAt=(ent,st)=>{ sat.push(st); ent.seat=st; }; GM.standUp=ent=>{ stood++; ent.seat=null; };
  GM.spawnCharacter=(id,x,z,o)=>{ spawned.push({id,x,z,o}); return GM.npc[id]={id}; };
  GM.spawnNPC=(id,sp,x,z,o)=>{ npcs.push({id,name:sp.name,x,z,o}); return {id}; };
  for(const id of camp||[]){ SOCIAL.remember(id,'FIRST_MET','camp'); }
  return G; };

(async()=>{
await sec(0,()=>{ const idx=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'), at=s=>idx.indexOf(s);
  check('0. 載入 src/gymcer3d.js；index.html 在 story3d.js、gym3d.js 後面；包住 STORY.ceremonyY1',ok&&!!X()&&at('src/gymcer3d.js')>at('src/story3d.js')&&at('src/gymcer3d.js')>at('src/gym3d.js')&&STORY.ceremonyY1!==o0,err); });
if(!X()){ H.done(); return; }

await sec(1,async()=>{ cerDay='open'; const G=setup('2025-08-31',14,['heroine_01','yu']); H.said=[];
  await STORY.ceremonyY1(GM);
  check('1. 進體育館 3F（gym_arena），玩家坐法律學院走道邊（spots.me）',H.entered.includes('gym_arena')&&sat.length>=1&&sat[0].x===1.2&&sat[0].z===-0.95,J({entered:H.entered,sat}));
  check('1. 宿營認識的以安、Alison 坐旁邊；沒認識的阿哲不放',J(spawned.map(s=>s.id).sort())===J(['heroine_01','yu'])&&spawned.find(s=>s.id==='heroine_01').x===1.82,J(spawned));
  check('1. 旁白三句一字不改（照原本的 2D 版）',J(H.said.map(s=>s.t))===J(['四千多個新生，每個人都穿著同一件新生上衣。','法律系的位置在二樓看台的右邊。旁邊的人在對手冊上的流程，前面的人在傳訊息問晚上要不要一起吃飯。','校長致詞講到一半，手機震了一下。你被加進一個群組。']),J(H.lines()));
  check('1. 演完：CEREMONY_Y1、15:30、起身、沒有叫原本的 2D',G.flags.CEREMONY_Y1===true&&Math.abs(G.hour-15.5)<1e-6&&stood===1&&origCalls===0,J({h:G.hour,stood,origCalls}));
  check('1. 加進全班群組',typeof PHONE==='undefined'||!PHONE.inGroup||PHONE.inGroup(G,'law_class')); });

await sec(2,async()=>{ cerDay=null; setup('2025-08-31',14); origCalls=0; await STORY.ceremonyY1(GM);
  check('2. 那天沒有典禮布置（舊版、載入失敗）：照原本的 2D',origCalls===1&&!H.entered.includes('gym_arena'));
  const z0=Z3.ZONES.gym_arena; delete Z3.ZONES.gym_arena; cerDay='open'; setup('2025-08-31',14); origCalls=0; await STORY.ceremonyY1(GM); Z3.ZONES.gym_arena=z0;
  check('2. 沒有體育館區域：照原本的 2D',origCalls===1); });

await sec(3,async()=>{ cerDay='grad'; setup('2029-06-02',9); const r=await X().gradStage(GM);
  check('3. 畢業典禮：進 gym_arena、玩家坐下、家人兩位（媽媽、爸爸）坐南看台（y 1.86）',r===true&&H.entered.includes('gym_arena')&&sat.length===1&&J(npcs.map(n=>n.name))===J(['媽媽','爸爸'])&&npcs.every(n=>n.o&&n.o.seat&&n.o.seat.y===1.86),J({r,npcs}));
  X().gradEnd(GM); check('3. gradEnd：起身',stood===1);
  cerDay=null; setup('2029-06-02',9); check('3. 沒有布置：gradStage 回 false（照 2D）',(await X().gradStage(GM))===false);
  const src=fs.readFileSync(path.join(H.ROOT,'src/story3d.js'),'utf8');
  check('3. story3d.js gradFamily 叫 GYMCER.gradStage、ADV 用 blur、進霖澤館前 gradEnd',/GYMCER\.gradStage\(GM\)/.test(src)&&/background:g3\?'blur':bgOf\('ntu_gym_ceremony'\)/.test(src)&&/if\(g3&&GYMCER\.gradEnd\) GYMCER\.gradEnd\(GM\);/.test(src)); });

H.done();
})();
