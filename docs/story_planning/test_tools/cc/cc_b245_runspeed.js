// CC（帳號 A）11-02 BB_245 第二批 #6：RUN-SPEED-1020 跑步太慢（Node，不開瀏覽器、不改 src/）。
// LAWWW 驗法（BB245_LAWWW_REPLY_1102.md 第一節）：探針鎖 E.SPD.run＝6.2；p0_movement、movement_regression 看滑步（瀏覽器的部分不在這支）。
// 做法：照 tests/nav_buildings_unit.js 在 Node 載 lib/three*.bundle.js、src/people3d.js、assets3d.js、world3d.js、engine3d.js，讀 E3.SPD。
// 檢查：① E3.SPD.run＝6.2 ② 走路 1.8、腳踏車 8.5 沒有跟著動（cb207d08d 的 commit 說只改跑步）
//       ③ 跑步動畫照速度加快：src/character3d.js 有 run 的 timeScale＝速度/4.1（讀原始碼，只找寫法，不跑動畫）
// 修正 commit：cb207d08d（4.8 → 6.2）；對照＝cb207d08d^（預期 ① FAIL：4.8。③ 的 spd/4.1 修正前就有，跑得快動畫就跟著快，兩版都 PASS）。
// 用法：cd <受測工作樹> && node <本檔>
'use strict';
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=process.cwd();
let fails=0; const FL=[];
const check=(n,ok,i)=>{ console.log((ok?'PASS ':'FAIL ')+n+(i?'　'+i:'')); if(!ok){ fails++; FL.push(n); } };
let sha='?'; try{ sha=cp.execSync('git rev-parse --short HEAD',{cwd:ROOT}).toString().trim(); }catch(e){}
console.log('cc_b245_runspeed　受測 '+ROOT+'（'+sha+'）');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
Object.defineProperty(global,'navigator',{value:{userAgent:'node'},configurable:true,writable:true}); global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const errs=[];
for(const f of ['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js']){
  let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1=');
  try{ vm.runInThisContext(src,{filename:f}); }catch(e){ errs.push(f+'：'+e.message); } }
check('載入 three、engine3d 沒有例外',!errs.length,errs.join('｜'));
const SPD=typeof E3!=='undefined'&&E3.SPD;
check('① E3.SPD.run＝6.2',!!SPD&&SPD.run===6.2,JSON.stringify(SPD||null));
check('② 走路 1.8、腳踏車 8.5 不變',!!SPD&&SPD.walk===1.8&&SPD.bike===8.5,JSON.stringify(SPD||null));
const c3=fs.readFileSync(path.join(ROOT,'src/character3d.js'),'utf8');
const m=/run[^\n;]{0,200}timeScale[^\n;]{0,80}\/\s*4\.1|timeScale[^\n;]{0,120}\/\s*4\.1/.exec(c3);
check('③ character3d.js 跑步動畫 timeScale 照速度（…/4.1）',!!m,m?m[0].slice(0,160):'找不到');
console.log(fails?('FAILED '+fails+'：'+FL.join('、')):'ALL PASS');
process.exit(fails?1:0);
