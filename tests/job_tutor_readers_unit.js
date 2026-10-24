// 「有沒有在打工」讀家教的地方（home3d.js 的 hasJob、r2y3b3d.js 的 S.hasJob）：改讀 JOBS.at(G,'tutor')——家教停了、會考以後（AA_163 第 2 節）就不算有打工；
// 沒有載入 jobs3d.js 的舊測試環境照舊看 JOB_TUTOR。不需要瀏覽器。
//   A  沒有 JOBS：JOB_TUTOR＝有打工（大一暑假 7/20 那一句、大三下暑假預設「打工」）
//   B  有 JOBS：家教還在＝有；停了（TUTOR_STOP）＝沒有；大三下（會考以後）只剩 JOB_TUTOR＝沒有（暑假預設「讀書」）
// 修改前（開發分支 HEAD）：B 的「停了」「會考以後」照樣算有打工——FAIL。用法：node tests/job_tutor_readers_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H;
const load=(f,re)=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>re.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
let ok=true, err=''; try{ for(const f of ['src/data/r2y3b_events.js','src/r2y3b3d.js']) if(fs.existsSync(path.join(H.ROOT,f))) load(f,/^(R2Y3B|R2Y3B_EVENTS)$/); }catch(e){ ok=false; err=String(e&&e.stack||e).split('\n').slice(0,3).join(' / '); }
const SUM='暑假的班照排。你從宿舍搭捷運去上班。';
/* 大一暑假 7/20 那一句（HOME.breakArrive；表上的點換成只有那一個）*/
const arrive=async()=>{ const bp=HOME.breakPts; HOME.breakPts=G=>[{day:G.day,h:G.hour,k:'sum'}]; H.said=[]; try{ await HOME.breakArrive(GM); } finally { HOME.breakPts=bp; } return H.said.some(s=>s.t===SUM||s.t==='暑假的班照排。你從家裡搭捷運去上班。'); };
const fr=(k,h,flags)=>H.fresh(k,h,'dorm',flags);

(async()=>{
check('0. 載得到（R2Y3B.hasJob、HOME.breakArrive）',ok&&typeof R2Y3B!=='undefined'&&typeof R2Y3B.hasJob==='function'&&typeof HOME.breakArrive==='function',err);

await sec('A',async()=>{ check('A. 沒有 JOBS（舊的測試環境）',typeof JOBS==='undefined');
  fr('2026-07-20',10,{JOB_TUTOR:true,TUTOR_STOP:150}); check('A. 沒有 JOBS：照 JOB_TUTOR（大三下暑假預設「打工」）',R2Y3B.hasJob(H.G)===true&&R2Y3B.summerDefault(H.G)==='work');
  check('A. 大一暑假 7/20：有 JOB_TUTOR＝「暑假的班照排」那一句',await arrive());
  fr('2026-07-20',10,{}); check('A. 沒有 JOB_TUTOR＝沒有那一句',!(await arrive())&&R2Y3B.hasJob(H.G)===false); });

await sec('B',async()=>{ for(const f of ['src/data/wz_park_layout.js','src/wzpark3d.js','src/data/wz_shops_layout.js','src/data/eat_lines.js','src/eat3d.js','src/wzshops3d.js','src/data/wz_jobs.js','src/jobs3d.js']) load(f,/^(WZS|EAT|EAT_LINES|JOBS|WZ_JOBS_DATA|WZ_SHOPS_LAYOUT|WZ_PARK_LAYOUT|PARK)$/);
  check('B. 載入 JOBS',typeof JOBS!=='undefined'&&typeof JOBS.at==='function');
  fr('2026-07-20',10,{JOB_TUTOR:true,TUTOR_WD:2}); check('B. 家教還在（大一暑假，放假停課但沒有停）：有打工、7/20 那一句',R2Y3B.hasJob(H.G)===true&&await arrive());
  fr('2026-07-20',10,{JOB_TUTOR:true,TUTOR_WD:2,TUTOR_STOP:PG.DK('2026-05-12')}); check('B. 家教停了（TUTOR_STOP）：沒有打工、沒有那一句',R2Y3B.hasJob(H.G)===false&&!(await arrive()));
  fr('2028-06-20',21,{JOB_TUTOR:true,TUTOR_WD:2}); check('B. 大三下（會考以後）只剩 JOB_TUTOR：沒有打工、暑假預設「讀書」',R2Y3B.hasJob(H.G)===false&&R2Y3B.summerDefault(H.G)==='study'&&JOBS.at(H.G,'tutor')===null);
  fr('2028-06-20',21,{JOB_TUTOR:true,TUTOR_DONE:PG.DK('2027-05-16')}); check('B. 會考以後學生傳過訊息（TUTOR_DONE）：沒有打工',R2Y3B.hasJob(H.G)===false);
  const src=fs.readFileSync(path.join(H.ROOT,'src/home3d.js'),'utf8')+fs.readFileSync(path.join(H.ROOT,'src/r2y3b3d.js'),'utf8');
  check('B. 兩個檔的 hasJob 都先看 JOBS.at(G,\'tutor\')',(src.match(/JOBS\.at\(G,'tutor'\)/g)||[]).length>=2); });

H.done();
})();
