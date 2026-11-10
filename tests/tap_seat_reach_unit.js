// 點椅子走過去一定看得到「坐下」（TAP-SEAT-REACH-1105；BB-C 08:28 SEATSCAN：山嵐靠窗長椅 6 張，最好的走近點離互動點 0.80 m、按鈕範圍 0.75 m，
//   點椅子走過去永遠看不到「坐靠窗長椅」；電腦 GPU 點地常停偏 0.2 m）。src/engine3d.js nearestInteractable：點的是椅子（P.tapPref 離那張座位 0.45 m 內）＝那張的範圍多 E.TAP_SEAT_REACH（0.5 m）。
//   修改前第 1 項 FAIL；推搖桿（tapPref 清掉）、點別的地方照舊。用法：node tests/tap_seat_reach_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
for(const f of ['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js']){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (THREE|THREE_JSM|P3|ASSETS|W3|E3)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; const obj=(x,z)=>({position:{x,y:0,z}}); E.levels=null; E.npcs=[]; E.zone={id:'xs_shanlan'};
/* 山嵐靠窗長椅（BB SEATSCAN 的數字）：互動點在座位上、範圍 0.75 m；人停在 0.80 m（走近點）＋點地停偏 0.2 m */
const bench={x:0,z:0,radius:0.75,label:'坐靠窗長椅',seat:{x:0,z:0,yaw:0}}, other={x:1.6,z:0,radius:0.75,label:'坐靠窗長椅',seat:{x:1.6,z:0,yaw:0}};
const at=(x,z,tap)=>{ E.player={obj:obj(x,z),lv:0,tapPref:tap?{x:tap[0],z:tap[1],lv:0,zone:'xs_shanlan'}:null}; E.interactables=[bench,other]; const b=E.nearestInteractable(); return b; };
check('1. 點這張長椅走過去、停在走近點 0.80 m：看得到「坐靠窗長椅」（這一張）',at(0,0.8,[0.05,0.1])===bench);
check('1. 停偏 0.2 m（1.0 m）：還是這一張',at(0.1,0.99,[0.05,0.1])===bench);
check('2. 推搖桿走到 0.80 m（沒有 tapPref）：照舊沒有按鈕（範圍 0.75 m）',at(0,0.8,null)===null);
check('3. 點的是旁邊那張（1.6, 0）：這一張不多給範圍（停在這張 0.8 m 外＝沒有）',at(0,0.8,[1.6,0.05])===null);
check('4. 停太遠（1.3 m）：點了也沒有（只多 0.5 m）',at(0,1.3,[0,0])===null);
check('5. E.TAP_SEAT_REACH＝0.5',E.TAP_SEAT_REACH===0.5);
/* TAP-SEAT-NPC-1105（BB-C 10:38 Daybreak 窗邊 #2、長桌 #15）：點椅子走過去、旁邊 0.6 m 站著路人（聽一句）／有名字的人：按鈕還是那張椅子；推搖桿（沒有 tapPref）照舊人優先 */
{ const pass={talk:()=>{},talkLabel:'聽一句',yieldIt:true,obj:{position:{x:0.4,y:0,z:0.9}},name:'路人'}, named={talk:()=>{},talkLabel:'和沛珊說話',obj:{position:{x:0.4,y:0,z:0.9}},name:'沛珊',charId:'classmate_peishan'};
  const run=(n,tap)=>{ E.npcs=[n]; const r=at(0,0.8,tap); E.npcs=[]; return r; };
  check('6. 點這張椅子、旁邊站著路人（聽一句）：按鈕是椅子',run(pass,[0.05,0.1])===bench);
  check('6. 點這張椅子、旁邊站著有名字的人：按鈕還是椅子',run(named,[0.05,0.1])===bench);
  const r=run(named,null); check('6. 推搖桿走過去（沒有 tapPref）：照舊人優先（和沛珊說話）',!!(r&&r.npc===named));
  E.prefNpc='classmate_peishan'; const r2=run(named,[0.05,0.1]); E.prefNpc=null; check('6. 「帶我去」找的人（E.prefNpc）：點椅子也是她',!!(r2&&r2.npc===named)); }
/* DAYBREAK-BOOTH21-1105：有人正走過去要坐（seatTarget）的單人座位不出「坐下」（game3d.js freeSeat 也不讓坐）；長椅（label）照舊 */
{ const walker={obj:{position:{x:3,y:0,z:3}},seatTarget:{x:0,z:0}}; E.npcs=[walker]; const r1=at(0,0.5,null); bench.seat.label='長椅'; const r2=at(0,0.5,null); delete bench.seat.label; E.npcs=[]; const r3=at(0,0.5,null);
  check('7. 有人正走向這張（seatTarget）：不出「坐下」；長椅（label）照舊出；沒人走過來照舊出',r1!==bench&&r2===bench&&r3===bench,JSON.stringify([r1&&r1.label,r2&&r2.label,r3&&r3.label])); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
