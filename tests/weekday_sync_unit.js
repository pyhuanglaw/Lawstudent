// 星期跟著日期（BUG-DATE-TIMETABLE-1020，X76；使用者 2026-10-20：「遊戲中日期跟課表日期對不上」，存檔 9/25（第 9 天、週四）卻記成 weekday 5＝週五）——不需要瀏覽器。
//   G.weekday 是快取，日期（G.day）才是準的：出遊跨日（outings3d.js）原本只改 G.day、沒改星期，之後每天睡覺照樣加一，星期就一直差一天——
//   課表照行事曆、HUD 和作息照 G.weekday，兩邊對不上；女主角的作息也差一天。
//   1. wdOfDay：照行事曆算（週日＝0；CALENDAR 的週日是 7）；
//   2. 讀檔（migrate）照行事曆重算——使用者的存檔讀進來是週四；
//   3. 遊戲進行中每次更新 HUD 先對一次（主迴圈每 30 格、跳時間；syncWeekday），出遊跨日以後馬上對；
//   4. HUD 過了午夜：日期顯示隔天，星期也顯示隔天。
// 修改前 1～4 都 FAIL。用法：node tests/weekday_sync_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global;
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'src/data/calendar.js'),'utf8').replace(/^const CALENDAR\s*=/m,'globalThis.CALENDAR='),{filename:'calendar.js'});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const g=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8');
const grab=re=>{ const m=g.match(re); return m?m[0]:null; };
const fW=grab(/function wdOfDay\(day,fallback\)\{[^\n]*\}/), fS=grab(/function syncWeekday\(\)\{[^\n]*\}/);
check('1. game3d.js 有 wdOfDay、syncWeekday', !!fW&&!!fS);
if(fW&&fS){ const ctx={CALENDAR,console:{warn(){}},G:null}; vm.createContext(ctx); vm.runInContext('var G=null; '+fW+'\n'+fS+'\nthis.wdOfDay=wdOfDay; this.syncWeekday=syncWeekday; this.setG=x=>{ G=x; };',ctx);
  check('1. 第 1 天 9/17 週三、第 5 天 9/21 週日＝0、第 9 天 9/25 週四、8/30 週六', ctx.wdOfDay(1,9)===3&&ctx.wdOfDay(5,9)===0&&ctx.wdOfDay(9,5)===4&&ctx.wdOfDay(-17,9)===6, [ctx.wdOfDay(1),ctx.wdOfDay(5),ctx.wdOfDay(9),ctx.wdOfDay(-17)].join());
  const save=JSON.parse(JSON.stringify({day:9,weekday:5})); ctx.setG(save); ctx.syncWeekday();
  check('3. syncWeekday：使用者的存檔（第 9 天記成週五）改成週四', save.weekday===4, String(save.weekday));
  const ok={day:9,weekday:4}; ctx.setG(ok); ctx.syncWeekday(); check('3. 本來就對的不動', ok.weekday===4); }
{ const m=grab(/function migrate\(s\)\{[\s\S]*?\n    s\.v=SAVE_VER; return s; \}/); let wd=null; if(m){ try{ const ctx={CALENDAR,console:{warn(){}},SAVE_VER:9,defaults:()=>({rel:{}}),ROM:undefined,DATE:undefined}; vm.createContext(ctx); vm.runInContext(m+'\nthis.migrate=migrate;',ctx); wd=ctx.migrate({v:2,day:9,weekday:5,rel:{},flags:{}}).weekday; }catch(e){ wd='例外 '+e.message; } }
  check('2. 讀檔（migrate）照行事曆重算星期：使用者的存檔（第 9 天記成週五）讀進來是週四（migrate 自己算，不靠外面的函式）', wd===4, String(wd)); }
check('3. 每次更新 HUD（主迴圈每 30 格、跳時間）先 syncWeekday（前面可以先記 hudDay／hudHr：跳時間後右上角日期要更新，LAWWW-C 10-21）', /function updateHUD\(\)\{ if\(!G\) return; (hudDay=G\.day; hudHr=G\.hour; )?syncWeekday\(\);/.test(g)&&/if\(E\.frame%30===0\)\{ updateHUD\(\);/.test(g)&&/GM\.syncWeekday=syncWeekday;/.test(g));
const o=fs.readFileSync(path.join(ROOT,'src/outings3d.js'),'utf8'), n=(o.match(/G\.day=Math\.floor\(arrive\/24\); G\.hour=arrive-G\.day\*24; if\(GM\.syncWeekday\) GM\.syncWeekday\(\);/g)||[]).length;
check('3. outings3d.js 出遊跨日（兩處）改完日期馬上對星期', n===2&&!/G\.day=Math\.floor\(arrive\/24\); G\.hour=arrive-G\.day\*24;(?! if\(GM\.syncWeekday\))/.test(o), 'n='+n);
{ const m=grab(/function updateHUD\(\)\{ if\(!G\) return; (?:hudDay=G\.day; hudHr=G\.hour; )?syncWeekday\(\); \{[^}]*\}/); check('4. HUD 的星期照顯示的那一天（過了午夜跟著日期換）', !!m&&/WEEK\[dd&&typeof dd\.wd==='number'\?\(\(dd\.wd%7\)\+7\)%7:G\.weekday\]/.test(m), m&&m.slice(0,200)); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
