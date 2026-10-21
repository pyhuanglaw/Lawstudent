// AA_342 第 5 節（企劃線 c56d4241）盤點時看到的錯：LAWWW 自己改的那幾項。不需要瀏覽器。
//   C4：大四下第 16 週還算期末週，可是 6/2 已經畢業 → 大四下 15 週（第 15 週＝期末考週 5/28～6/1，6/2 畢業典禮），6/4 起不算學期。
// 修改前（Y4S2 weeks:16）C4 的四項會失敗。
// 用法：node tests/aa342_fixes_unit.js
const fs=require('fs'), path=require('path'), vm=require('vm');
const ROOT=path.resolve(__dirname,'..');
global.window=global;
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'src/data/calendar.js'),'utf8').replace(/^const CALENDAR\s*=/m,'global.CALENDAR='),{filename:'calendar.js'});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
const C=CALENDAR, T=s=>C.termOf(dayOf(s));
{ const a=T('2029-05-28'), b=T('2029-06-01'), g=T('2029-06-02'), x=T('2029-06-04'), y=T('2029-06-08');
  check('C4. 2029-05-28（一）＝大四下第 15 週、期末考週',!!a&&a.id==='Y4S2'&&a.week===15&&a.exam==='final',JSON.stringify(a));
  check('C4. 2029-06-01（五）還是期末考週（6/1 收拾）',!!b&&b.id==='Y4S2'&&b.exam==='final',JSON.stringify(b));
  check('C4. 2029-06-02（六）畢業典禮在第 15 週',!!g&&g.id==='Y4S2'&&g.week===15,JSON.stringify(g));
  check('C4. 2029-06-04～06-08（原本的第 16 週）不算學期＝畢業後篇',x===null&&y===null,JSON.stringify([x,y]));
  const r=C.termDays('Y4S2'); check('C4. termDays(Y4S2) 到 6/3（週日）為止',!!r&&r.to===dayOf('2029-06-03'),JSON.stringify(r));
  const m=T('2029-04-16'); check('C4. 期中考週照舊（第 8～9 週）',!!m&&m.exam==='mid',JSON.stringify(m));
  const o=T('2028-12-18'); check('C4. 別的學期照舊 16 週（大四上第 16 週是期末考週）',!!o&&o.id==='Y4S1'&&o.week===16&&o.exam==='final',JSON.stringify(o)); }
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
