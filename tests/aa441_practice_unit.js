// 大四下法律實習每週一句（AA_441，企劃線 70d31d938；src/practice3d.js，走 classes3d.js 的 CLS.OFFSITE_LINES）——不需要瀏覽器。
//   0 每一句在稿裡一字不差；index.html 在 twfill3d.js 後面；OFF 改名「法扶・臺北的辦公室」、黑底 legal_aid_office
//   1 第一次出席那天用第 1 週那一句（不管哪一週）；去過 C16（INTERN_LEGALAID）換另一句
//   2 平常的週二各一句；3/13 照舊是 twfill 的那句
//   3 租屋的大姊：3/20 記 LP_RENT_SEEN；3/27、5/8 照旗標分 A／B（3/27 B 也記）
//   4 4/24 21:00 麵店團：阿哲、柏翰照認不認識；兩位都不認識不發
// 修改前（434dcfd16）：沒有 src/practice3d.js——全部 FAIL。用法：node tests/aa441_practice_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H, J=JSON.stringify;
const L3=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
if(typeof TWFILL_LINES==='undefined'){ try{ L3('src/data/twfill_events.js'); L3('src/twfill3d.js'); }catch(e){} }
let ok=false; try{ L3('src/practice3d.js'); ok=typeof PRACTICE!=='undefined'; }catch(e){ console.log('（載入失敗：'+e.message+'）'); }
let DOC=''; try{ DOC=cp.execSync("git -c core.quotepath=false show '70d31d938:docs/story_planning/AA_441_大四下法律實習_每週一句旁白_法扶韓律師.md'",{cwd:H.ROOT,encoding:'utf8'}); }catch(e){}
const goOn=async(key,flags,attend)=>{ const G=H.fresh(key,8,'dorm'); G.stage='law'; Object.assign(G.flags,flags||{}); const R=CLS.rec(G); if(attend) R.attend.legal_practice=attend; const it=CLS.dayItems(G).find(q=>q.c&&q.c.id==='legal_practice'); H.said=[]; if(it) await CLS.goClass(GM,it,{forced:true}); return {G,it,L:H.lines()}; };
(async()=>{
  const idx=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
  check('0. 載入 src/practice3d.js；index.html 在 twfill3d.js 後面',ok&&idx.indexOf('src/practice3d.js')>idx.indexOf('src/twfill3d.js')&&idx.indexOf('src/twfill3d.js')>0);
  if(!ok){ H.done(); return; }
  const all=[PRACTICE.FIRST,PRACTICE.FIRST_C16,...Object.values(PRACTICE.DAYS),...Object.values(PRACTICE.RENT).flatMap(r=>[r.a,r.b]),...PRACTICE.GROUP.ms.map(m=>m[1])];
  check('0. 每一句都在稿裡（AA_441 @70d31d938）',DOC.length>1000&&all.every(t=>DOC.includes(t)),J(all.filter(t=>!DOC.includes(t))));
  check('0. OFF 改名「法扶・臺北的辦公室」、黑底 legal_aid_office',COURSES&&COURSES.rooms?(COURSES.rooms.OFF.name==='法扶・臺北的辦公室'&&COURSES.rooms.OFF.bg==='legal_aid_office'):/OFF:\{name:'法扶・臺北的辦公室',offsite:true,bg:'legal_aid_office'\}/.test(fs.readFileSync(path.join(H.ROOT,'src/data/courses.js'),'utf8')));
  { const r=await goOn('2029-02-20'); check('1. 第一次出席（2/20）：第 1 週那一句',J(r.L)===J([PRACTICE.FIRST]),J(r.L)); }
  { const r=await goOn('2029-03-06'); check('1. 翹了前兩週、第一次是 3/6：還是第 1 週那一句（3/6 原本的不演）',J(r.L)===J([PRACTICE.FIRST]),J(r.L)); }
  { const r=await goOn('2029-02-20',{INTERN_LEGALAID:true}); check('1. 暑假去過 C16：換那一句',J(r.L)===J([PRACTICE.FIRST_C16]),J(r.L)); }
  { const r=await goOn('2029-02-27',{},1); check('2. 第 2 週（已經出席過）：阿伯那一句',J(r.L)===J([PRACTICE.DAYS['2029-02-27']]),J(r.L)); }
  { const r=await goOn('2029-03-13',{},3); check('2. 3/13：照舊是 twfill 那一句（AA_342 4-2）',J(r.L)===J([TWFILL_LINES.practice0313]),J(r.L)); }
  { const r=await goOn('2029-03-20',{},4); check('3. 3/20：租屋的大姊、記 LP_RENT_SEEN',J(r.L)===J([PRACTICE.DAYS['2029-03-20']])&&r.G.flags.LP_RENT_SEEN===true,J(r.L)); }
  { const a=await goOn('2029-03-27',{LP_RENT_SEEN:true},5), b=await goOn('2029-03-27',{},5);
    check('3. 3/27：有旗標＝A、沒有＝B（B 也記 LP_RENT_SEEN）',J(a.L)===J([PRACTICE.RENT['2029-03-27'].a])&&J(b.L)===J([PRACTICE.RENT['2029-03-27'].b])&&b.G.flags.LP_RENT_SEEN===true,J([a.L,b.L])); }
  { const a=await goOn('2029-05-08',{LP_RENT_SEEN:true},9), b=await goOn('2029-05-08',{},9);
    check('3. 5/8：有旗標＝A、沒有＝B',J(a.L)===J([PRACTICE.RENT['2029-05-08'].a])&&J(b.L)===J([PRACTICE.RENT['2029-05-08'].b]),J([a.L,b.L])); }
  { const r=await goOn('2029-05-29',{},12); check('2. 最後一次（5/29）',J(r.L)===J([PRACTICE.DAYS['2029-05-29']]),J(r.L)); }
  /* 4 群組 */
  const grp=(knowZhe,knowBo)=>{ const G=H.fresh('2029-04-24',21.2,'dorm'); G.stage='law'; PHONE.join(G,'noodle_team','noodle_team'); if(knowZhe) H.FRIEND('zhe'); if(knowBo) H.FRIEND('classmate_bohan'); PRACTICE.phone(G); PHONE.tick(G); return H.msgs('g:noodle_team'); };
  { const a=grp(true,true), b=grp(true,false), c=grp(false,false);
    check('4. 4/24 21:00 麵店團：兩位都認識兩句、只認識阿哲一句、都不認識不發',J(a)===J(['今天影印了三百頁 手好痠','我的書狀改到第三版了。'])&&J(b)===J(['今天影印了三百頁 手好痠'])&&c.length===0,J([a,b,c])); }
  H.done();
})();
