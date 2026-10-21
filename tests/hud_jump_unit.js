// 右上角日期跟上劇情裡的跳時間（BB218-P3-1021 ⑥：經濟系宿營 8/23 09:00 → 8/25 16:00「回到家，你倒在床上」那句，右上角還是 8/23 週五 09:00）。
// 原本 game3d.js 的 frame() 只有每 30 幀才 updateHUD；手機慢或雲端測試 1～4 fps 時要等好幾秒。現在換日或差 0.25 小時以上，下一幀就更新。
// 不需要瀏覽器：從 src/game3d.js 拿出 hudStale／updateHUD 開頭那幾行，用假的 G 跑；另外檢查 frame() 有叫、30 幀那一段照舊。
// 改之前這支會失敗（沒有 hudStale）。用法：node tests/hud_jump_unit.js
const fs=require('fs'), path=require('path'), vm=require('vm');
const src=fs.readFileSync(path.join(__dirname,'..','src/game3d.js'),'utf8');
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
const m=src.match(/let hudDay=null, hudHr=null;\s*function hudStale\(\)\{[^\n]*\}\n/);
check('1. game3d.js 有 hudStale（記上次更新的日子、時間）',!!m);
if(!m){ console.log('FAILED '+fails); process.exit(1); }
const ctx={G:null}; vm.createContext(ctx);
vm.runInContext(m[0]+'function upd(){ if(!G) return; hudDay=G.day; hudHr=G.hour; }\nthis.hudStale=hudStale; this.upd=upd;',ctx);
check('2. 還沒有 G：不更新',ctx.hudStale()===false);
ctx.G={day:-387,hour:9}; check('3. 第一次（還沒更新過）：要更新',ctx.hudStale()===true);
ctx.upd(); check('4. 剛更新完：不用',ctx.hudStale()===false);
ctx.G.hour=9.1; check('5. 平常時間流動（差 0.1 小時）：等 30 幀那一次就好',ctx.hudStale()===false);
ctx.G.day+=2; ctx.G.hour=16; check('6. 劇情跳到兩天後 16:00（宿營回家）：下一幀就更新',ctx.hudStale()===true);
ctx.upd(); ctx.G.hour=21; check('7. 同一天跳到 21:00（小隊群組）：也更新',ctx.hudStale()===true);
ctx.upd(); ctx.G.hour=NaN; check('8. 時間壞掉（NaN）也算要更新（不會卡在舊的）',ctx.hudStale()===true);
check('9. updateHUD 一開頭就記 hudDay、hudHr',/function updateHUD\(\)\{ if\(!G\) return; hudDay=G\.day; hudHr=G\.hour;/.test(src));
check('10. frame()：不是第 30 幀時看 hudStale；每 30 幀那一段（updateHUD＋其他）照舊',/if\(E\.frame%30!==0&&hudStale\(\)\) updateHUD\(\); if\(E\.frame%30===0\)\{ updateHUD\(\);/.test(src));
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
