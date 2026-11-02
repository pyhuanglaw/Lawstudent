// CC（帳號 A）11-02 BB_245 第二批 #2：BUG-05 沛珊穿和路人一樣的紅衣（Node，不開瀏覽器、不改 src/）。
// LAWWW 驗法（BB245_LAWWW_REPLY_1102.md 第一節）：探針 ASSETS.manifest['char.classmate_peishan']＝bl_classmate_peishan.vrm；撞不撞路人紅衣由 LAWWW 看截圖（D128）。
// 做法：照 tests/nav_buildings_unit.js 的方式在 Node 載 lib/three*.bundle.js、src/people3d.js、src/assets3d.js、src/character3d.js，
//   location.search＝''（玩家的網址，沒有 ?blchar）：assets3d.js 載入時會刪掉 blOnly 的人物——要看的是刪完以後的 manifest（玩家實際用的）。
// 檢查：① 沒有 ?blchar 時 manifest 有 char.classmate_peishan ② url 是 …/bl_classmate_peishan.vrm、type vrm、沒有 blOnly
//       ③ CHAR.CAST.classmate_peishan.model＝char.classmate_peishan（人物 id 綁到這個模型） ④ 那個 .vrm 在受測 commit 裡真的有（git cat-file，稀疏工作樹也能查）
// 修正 commit：tasks.json 寫 d54bc731（第一版接進來，但 blOnly：只有 ?blchar 才載）；真正改成預設的是 cdbf12493（ART-05，BB_131 第 9 節）。
// 對照：cdbf12493^（預期 FAIL：blOnly，玩家網址載不到）、d54bc7316^（預期 FAIL：manifest 根本沒有）。
// 用法：cd <受測工作樹> && node <本檔>
'use strict';
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=process.cwd();
let fails=0; const FL=[];
const check=(n,ok,i)=>{ console.log((ok?'PASS ':'FAIL ')+n+(i?'　'+i:'')); if(!ok){ fails++; FL.push(n); } };
const info=s=>console.log('INFO '+s);
let sha='?'; try{ sha=cp.execSync('git rev-parse --short HEAD',{cwd:ROOT}).toString().trim(); }catch(e){}
console.log('cc_b245_peishan　受測 '+ROOT+'（'+sha+'）');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
Object.defineProperty(global,'navigator',{value:{userAgent:'node'},configurable:true,writable:true}); global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390;
global.location={search:''};   /* 玩家的網址：沒有 ?blchar */
const errs=[];
for(const f of ['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/character3d.js']){
  let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1=');
  try{ vm.runInThisContext(src,{filename:f}); }catch(e){ errs.push(f+'：'+e.message); } }
check('載入 three、people3d、assets3d、character3d 沒有例外',!errs.length,errs.join('｜'));
const K='char.classmate_peishan', m=(typeof ASSETS!=='undefined'&&ASSETS.manifest)?ASSETS.manifest[K]:undefined;
check('① 玩家網址（沒有 ?blchar）的 manifest 有 '+K,!!m,m?'':'沒有這一筆（不存在，或 blOnly 被刪掉）');
const url=m&&m.url||'';
check('② url＝…/bl_classmate_peishan.vrm、type vrm、不是 blOnly',/(^|\/)bl_classmate_peishan\.vrm$/.test(url)&&m.type==='vrm'&&!m.blOnly,JSON.stringify(m?{url:m.url,type:m.type,blOnly:!!m.blOnly}:null));
const cast=typeof CHAR!=='undefined'&&CHAR.CAST?CHAR.CAST.classmate_peishan:undefined;
check('③ CHAR.CAST.classmate_peishan.model＝'+K,!!cast&&cast.model===K,JSON.stringify(cast||null));
let has=false; if(url){ try{ cp.execSync('git cat-file -e HEAD:'+JSON.stringify(url),{cwd:ROOT,stdio:'ignore'}); has=true; }catch(e){} }
check('④ 受測 commit 裡有這個模型檔（git cat-file HEAD:'+(url||'?')+'）',has);
/* 只記：?blchar 時會不會載到（對照版 blOnly 的情況）、玩家網址下其他用這個模型的人 */
info('manifest 裡用 bl_classmate_peishan.vrm 的 key：'+JSON.stringify(Object.keys((typeof ASSETS!=='undefined'&&ASSETS.manifest)||{}).filter(k=>/bl_classmate_peishan\.vrm$/.test(ASSETS.manifest[k].url||''))));
console.log(fails?('FAILED '+fails+'：'+FL.join('、')):'ALL PASS');
process.exit(fails?1:0);
