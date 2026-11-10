// FIXLIGHTS／PINPROG 實驗（PERF-WZ-SHADERS，LAWWW2-B 2026-11-07；engine3d.js 換區域那一段）——不需要瀏覽器。
//   three.js 的 shader 照「看得見的點光源有幾盞」分版本：區域之間點光源數不一樣，換區域時人物、陰影、共用材質全部重編。
//   1. 網址沒加參數：E.fixLightsN 0、E.pinProg false；E.fixLights() 不做事、場景裡沒有 FIXLIGHT_ 燈（預設完全照舊）
//   2. 原始碼：loadZone 釋放舊區域前先 pinPrograms（有開才做）；setLamps 之後重數；換區域後 1 s、4 s 再數一次
//   3. 開了（fixlights=3）：照遊戲換區域的順序（拿掉舊區域、建新區域、放進場景、開關燈）走過每一個區域：
//      區域自己 ≤ 3 盞的，場景裡看得見的點光源永遠是 3 盞（three.js 的 numPointLights 不變＝不重編）；超過 3 盞的列出來（照舊）
//   4. 空燈：強度 0、不投影、放在很遠；開燈、關燈以後還是 3 盞
//   5. pinPrograms：每個 program 的 usedTimes 只加一次（第二次換區域不再加）
// 修改前：沒有 E.fixLights（第 1 項就失敗）。用法：node tests/fixlights_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const out=[]; const check=(name,ok,info)=>{ out.push((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
const el=()=>({getContext:()=>ctx2d,style:{},classList:{add(){},remove(){},toggle(){},contains(){ return false; }},appendChild(){},addEventListener(){},setAttribute(){},querySelector:()=>null,querySelectorAll:()=>[],width:1,height:1});
global.document={ createElementNS:el, createElement:el, getElementById:()=>null, querySelector:()=>null, querySelectorAll:()=>[], addEventListener(){}, body:el(), documentElement:el() };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
global.localStorage={getItem:()=>null,setItem(){},removeItem(){}}; global.requestAnimationFrame=()=>0;
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
const log=console.log; console.warn=()=>{}; console.log=()=>{}; console.error=()=>{};
const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
const files=[...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map(m=>m[1].split('?')[0]).filter(f=>!/^https?:/.test(f));
for(const f of files){ const p=path.join(ROOT,f); if(!fs.existsSync(p)) continue; let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); try{ vm.runInThisContext(src,{filename:f}); }catch(e){} }
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
const done=()=>{ out.push(fails?'FAILED '+fails:'ALL PASS'); log(out.join('\n')); process.exit(fails?1:0); };
// 1
const has=typeof E.fixLights==='function'&&typeof E.pinPrograms==='function';
check('1. 有 E.fixLights、E.pinPrograms', has); if(!has) done();
check('1. 網址沒加參數：fixLightsN 0、pinProg false', E.fixLightsN===0&&E.pinProg===false, E.fixLightsN+' '+E.pinProg);
check('1. 沒開時 E.fixLights() 不做事、場景沒有 FIXLIGHT_', E.fixLights()===null&&!E.scene.getObjectByName('FIXLIGHT_0'));
// 2
const src=fs.readFileSync(path.join(ROOT,'src/engine3d.js'),'utf8'), lz=src.slice(src.indexOf('E.loadZone=function'), src.indexOf('function disposeGroup('));
check('2. loadZone：釋放舊區域前先 pinPrograms（有開才做）', /if\(E\.pinProg\) E\.pinPrograms\(\);\s*scene\.remove\(E\.zone\.group\); disposeGroup/.test(lz));
check('2. setLamps 之後重數；換區域後 1 s、4 s 再數', /E\.setLamps=function\(on\)\{[^\n]*if\(E\.fixLightsN\) E\.fixLights\(\); \};/.test(src)&&/for\(const ms of \[1000,4000\]\) setTimeout\(\(\)=>\{ if\(E\.zone===z\) E\.fixLights\(\); \},ms\)/.test(lz));
// 3、4
E.fixLightsN=3;
const visPL=()=>{ let n=0; E.scene.traverse(o=>{ if(!o.isPointLight) return; for(let p=o;p;p=p.parent) if(!p.visible) return; n++; }); return n; };
let prev=null; const over=[], wrong=[], per={}; let built=0;
for(const id of Object.keys(Z3.ZONES)){ if(prev){ E.scene.remove(prev.group); }
  E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.exits=[]; E.spawnHint=null;
  let z; try{ z=Z3.ZONES[id].build(E); }catch(e){ continue; } z.def=Z3.ZONES[id]; E.zone=z; E.scene.add(z.group); built++;
  for(const on of [false,true]){ E.setLamps(on); const st=E.fixLights(); const v=visPL(); per[id]=st.zone;
    if(st.zone>3){ if(!over.some(x=>x.startsWith(id+'（'))) over.push(id+'（'+st.zone+'）'); if(v!==st.zone) wrong.push(id+' '+v); }
    else if(v!==3) wrong.push(id+(on?' 開燈':' 關燈')+' '+v); }
  prev=z; }
const cnt={}; for(const id in per) cnt[per[id]]=(cnt[per[id]]||0)+1;
check('3. 走過 '+built+' 個區域（開燈、關燈）：自己 ≤ 3 盞的，場景看得見的點光源都是 3 盞', built>=80&&!wrong.length, wrong.slice(0,8).join('、'));
check('3. 區域自己的點光源數分布（盞數：區域數）', true, JSON.stringify(cnt)+(over.length?'；超過 3 盞照舊：'+over.join('、'):''));
const KEY=['campus','wenzhou','gongguan','lane118','xinsheng','dorm','dorm_hall','linze','wancai','library_hall','library','cafe','cvs','noodle','bookstore','classroom','gym','lawlib','soclib'];
check('3. 常去的區域各幾盞', true, KEY.filter(k=>k in per).map(k=>k+' '+per[k]).join('、'));
const dummies=[]; E.scene.traverse(o=>{ if(o.userData&&o.userData.fixDummy) dummies.push(o); });
check('4. 空燈 3 盞：強度 0、不投影、在很遠', dummies.length===3&&dummies.every(l=>l.isPointLight&&l.intensity===0&&!l.castShadow&&l.position.y<=-100), dummies.length+' 盞');
// 5
const fake={info:{programs:[{usedTimes:1},{usedTimes:2}]}};
const k1=E.pinPrograms(fake), k2=E.pinPrograms(fake);
check('5. pinPrograms：每個 program 只加一次', k1===2&&k2===0&&fake.info.programs[0].usedTimes===2&&fake.info.programs[1].usedTimes===3, k1+' '+k2);
done();
