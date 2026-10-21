// AA_350 N9（AA-C 02bf44d2，2026-10-21）：人物面板記憶的備註——舊存檔裡已經記下的舊備註（露出開發代號 W8：、M2：、K-D5…，或和正式名稱重複）照 NOTE_RENAMED_N9 顯示新的；新的是空字串＝不顯示備註——不需要瀏覽器。
//   修改前：noteShown 只認 NOTE_RENAMED 的兩筆，而且只在新字是真值時才換（空字串照樣顯示舊備註）。用法：node tests/note_n9_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process'); const ROOT=path.resolve(__dirname,'..');
global.window=global;
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'src/social3d.js'),'utf8').replace(/^const SOCIAL\s*=/m,'globalThis.SOCIAL='),{filename:'social3d.js'});
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
const sh=(id,tag,note)=>SOCIAL.noteShown(id,{tag,note});
check('1. 露出開發代號的舊備註換掉、和名稱重複的清空（三個例子）',sh('heroine_02','ZHIRUO_MET_YU','告訴她戲院旁邊的女生是小語')===''&&sh('heroine_02','ASKED_HER_DRINK','她下班前，你問她自己都喝什麼')==='她下班前'&&sh('yu','BREAKFAST_YU','傅鐘旁邊的早餐')==='');
check('2. 原本的兩筆照舊（沛珊、語彤）',sh('classmate_peishan','IMPORTANT_CONVERSATION','她在考慮轉系')==='她在想別的路'&&sh('heroine_03','IMPORTANT_CONVERSATION','阿姨說她帶媽媽去醫院')==='阿姨扭到手腕，那週她顧店到打烊');
check('3. 沒在表上的備註照原樣',sh('heroine_01','FIRST_MET','總圖三樓')==='總圖三樓');
// 4. 02bf44d2 改掉的每一筆舊備註，現在顯示的都是新的（從 git 讀 diff；沒有 git 歷史的環境略過）
let diff=''; try{ diff=cp.execSync('git show 02bf44d2 --unified=0 -- src',{cwd:ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']}); }catch(e){}
if(diff){ const P1=/npc:'([a-z_0-9]+)',\s*tag:'([A-Z_0-9]+)'(?:,\s*note:'((?:[^'\\]|\\.)*)')?/g, P2=/SOCIAL\.remember\('([a-z_0-9]+)','([A-Z_0-9]+)'(?:,'((?:[^'\\]|\\.)*)')?/g;
  const ext=l=>{ const o=[]; for(const re of [P1,P2]){ re.lastIndex=0; let m; while((m=re.exec(l))) o.push([m[1],m[2],m[3]||'']); } return o; };
  let n=0, bad=[]; for(const h of diff.split(/\n@@/)){ let rem=[], add=[]; for(const l of h.split('\n')){ if(/^-(?!--)/.test(l)) rem=rem.concat(ext(l)); else if(/^\+(?!\+\+)/.test(l)) add=add.concat(ext(l)); }
    const used=add.map(()=>false); for(const [a,t,o] of rem){ const k=add.findIndex((x,i)=>!used[i]&&x[0]===a&&x[1]===t); if(k<0) continue; used[k]=true; if(o===add[k][2]) continue; n++; if(sh(a,t,o)!==add[k][2]) bad.push(a+' '+t+' '+o); } }
  check('4. 02bf44d2 的每一筆舊備註（'+n+' 筆）顯示成新的',n>=40&&!bad.length,bad.slice(0,5).join(' | ')); }
else console.log('（略過第 4 項：沒有 git 歷史）');
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
