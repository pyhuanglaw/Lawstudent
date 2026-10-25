// 互動按鈕：人和互動點誰優先（src/engine3d.js 的 nearestInteractable）——不需要瀏覽器。
// 2026-10-13 v9.6 回歸 flow_class_real 失敗：走路的人玩家走近就停下來（a77f1f9），下課時同學停在教室後門旁邊，
// 玩家走到門口（0.77 m），按鈕卻是「和郭沛珊說話」不是「離開教室」——原本人對所有互動點都先讓 0.5 m（本意只是「人優先於旁邊的椅子」）。
// 檢查：門口 0.8 m、同學 1.2 m → 門；同學 0.6 m（比門近）→ 同學；椅子 0.9 m、同學 1.3 m → 同學（人優先於旁邊的椅子，照舊）；
//       附近只有同學 → 同學；別層的人不算；要離開的人（leaving）不擋出口（第二次失敗：她走在玩家前面到後門）。修改前第 1 項、第 6 項失敗。
// 用法：node tests/interact_priority_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
for(const f of ['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js']){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (THREE|THREE_JSM|P3|ASSETS|W3|E3)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; const obj=(x,z,y)=>({position:{x,y:y||0,z}});
E.player={obj:obj(0,0),lv:0}; E.levels=null;
const npc=(x,z,name,y)=>({obj:obj(x,z,y),name,talk:()=>{},talkLabel:'和'+name+'說話'});
const door={x:0.8,z:0,radius:1.6,label:'離開教室',exit:{to:'linze'}}, chair={x:0.9,z:0,radius:1.2,label:'坐下',seat:{x:0.9,z:0.4,yaw:0}};
const pick=(its,ns)=>{ E.interactables=its; E.npcs=ns; const b=E.nearestInteractable(); return b?b.label:null; };
check('門口 0.8 m、同學 1.2 m：按鈕是「離開教室」（不是和同學說話）',pick([door],[npc(-1.2,0,'郭沛珊')])==='離開教室',pick([door],[npc(-1.2,0,'郭沛珊')]));
check('同學 0.6 m（比門近）：和同學說話',pick([door],[npc(0,-0.6,'郭沛珊')])==='和郭沛珊說話');
check('椅子 0.9 m、同學 1.3 m：人優先於旁邊的椅子（照舊）',pick([chair],[npc(0,1.3,'郭沛珊')])==='和郭沛珊說話');
check('附近只有同學（1.5 m）：和同學說話',pick([],[npc(1.5,0,'郭沛珊')])==='和郭沛珊說話');
check('別層的人（高 4.2 m）不算',pick([door],[npc(0.3,0,'郭沛珊',4.2)])==='離開教室');
{ const lv=npc(0.4,0.1,'郭沛珊'); lv.leaving=true;   /* 第二次失敗（93877e9）：下課時同學和玩家一起走到後門，她走在玩家前面（比門近），按鈕被她蓋掉 */
  check('要離開的同學（時段結束、走向出口）在門口、比門近：按鈕還是「離開教室」（要離開的人不擋出口）',pick([door],[lv])==='離開教室',pick([door],[lv]));
  check('要離開的同學旁邊只有椅子：照舊可以和她說話（只讓出口）',pick([chair],[lv])==='和郭沛珊說話',pick([chair],[lv])); }
{ const fw=npc(0.4,0.1,'沈以安'); fw.beh='follow';   /* BB-B 10-24 RELEASE-9109-TEST flow_library_scene：同行的小安站得比總圖門近，門口按鈕變「和她說話」，要退一步才進得去 */
  check('跟著玩家走的人（beh follow）在門口、比門近：按鈕還是門（跟著的人不擋門口、出口）',pick([door],[fw])==='離開教室',pick([door],[fw]));
  check('跟著玩家走的人旁邊只有椅子／沒有門：照舊可以和她說話',pick([chair],[fw])==='和沈以安說話'&&pick([],[fw])==='和沈以安說話',pick([chair],[fw])); }
{ const bed={x:-1.55,z:1.165,radius:0.9,label:'睡覺'}, bag={x:-1.55,z:1.965,radius:0.6,prio:0.3,label:'收拾背包回臺北的家'}, at=(x,z)=>{ E.player.obj.position.x=x; E.player.obj.position.z=z; return pick([bed,bag],[]); };
  check('宿舍：站在回家背包 0.41 m 內、靠床那一側（離床 0.39 m）：按鈕是「收拾背包回臺北的家」（prio；flow_law_break 21 批）',at(-1.55,1.555)==='收拾背包回臺北的家',at(-1.55,1.555));
  check('宿舍：站在床邊（離床 0.2 m）：照舊是「睡覺」',at(-1.55,1.365)==='睡覺');
  E.player.obj.position.x=0; E.player.obj.position.z=0; }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
