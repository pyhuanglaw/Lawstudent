// D124（使用者 2026-11-02 10:4x 經 BB：海商法與海洋法改成選修）——不需要瀏覽器。
//   a. 大四下選了海商法、被當：只記成績，不延畢、不排補考，國考報名照舊
//   b. 大四下選「不修」：課表、期末考、法律頁、海商法期末考那一句旁白都沒有
//   c. 舊存檔（沒選過，default）：照舊有海商法
//   d. 舊存檔救援（BB 只救這一種）：6/18～6/25 排了補考還沒考、補考的課是選修＝取消補考、照常畢業（FD_RESCUE_ELECTIVE、前一天的提醒拿掉）；
//      補考的課有必修／重修＝只拿掉選修；舊延畢改的補考（mig）照舊；補考已經考了／沒去照舊
// 修改前（a3d80d47a）：a、b、d FAIL。用法：node tests/d124_maritime_elective_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
const load=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return; const src=fs.readFileSync(p,'utf8').replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/study_units.js','src/study3d.js','src/data/r2y4b_events.js','src/r2y4b3d.js','src/y5s1_3d.js','src/faildelay3d.js']) try{ load(f); }catch(e){ console.log('載入失敗 '+f+'：'+e); }
const D=k=>PG.DK(k), J2=x=>J(x).slice(0,200);
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
GM.caption=()=>{}; GM.toast=()=>{};
const fresh=(key,h,fl)=>{ const G=H.fresh(key,h,'dorm',Object.assign({BAR_REG:true,Y4_PATH:'bar',GRADUATED:PG.gradDay()},fl||{})); PG.rec(G).done.grad=1; return G; };
const has=(G,id)=>CLS.termCourses(G,'Y4S2').some(c=>c.id===id);
(async()=>{
await sec('a',async()=>{ const G=fresh('2029-06-18',9); check('a0. 前置：預設有海商法',has(G,'maritime'));
  const R=CLS.rec(G); R.exam=R.exam||{}; for(const c of CLS.termCourses(G,'Y4S2')) if(CLS.isExamCourse(c)) R.exam['Y4S2:'+c.id+':final']={status:'done',correct:c.id==='maritime'?0:3,score:c.id==='maritime'?0:60};
  await CLS.showGrades(GM,'Y4S2'); const g=R.grades.Y4S2||{};
  check('a1. 海商法被當：成績單記不及格、不延畢、不排補考、國考報名照舊',/不及格/.test(String(g.maritime||''))&&!G.flags.FAIL_DELAY&&!G.flags.FD_MAKEUP&&G.flags.BAR_REG===true&&!PG.pending(G).some(x=>x.s.id==='fd_makeup'),J2({g:g.maritime,FD:G.flags.FAIL_DELAY,mk:G.flags.FD_MAKEUP,bar:G.flags.BAR_REG})); });
await sec('b',async()=>{ const G=fresh('2029-03-05',9); CLS.rec(G).electives.y4s2_mar='none';
  let wed=D('2029-03-07'); const items=CLS.dayItems(Object.assign(G,{day:wed})).filter(it=>it.c.id==='maritime');
  const exams=[]; const r=CALENDAR.termDays('Y4S2'); for(let d=r.from;d<=r.to;d++) for(const it of CLS.dayItems(Object.assign(G,{day:d}))) if(it.c.id==='maritime') exams.push(d);
  G.day=D('2029-03-05'); const legal=typeof STUDY!=='undefined'?STUDY.courses(G).some(e=>e.c.id==='maritime'):null;
  check('b1. 選「不修」：大四下課表沒有海商法、一整學期沒有那門課（含期末考那一堂）、法律頁沒有',!has(G,'maritime')&&!items.length&&!exams.length&&legal===false,J2({has:has(G,'maritime'),items:items.length,exams:exams.length,legal}));
  const groups=CLS.choiceGroups('Y4S2'); check('b2. 大四下開學選課：有一組 y4s2_mar（可以不修、預設修）',groups.some(g=>g.group==='y4s2_mar'&&g.none&&g.def==='maritime'),J2(groups.map(g=>g.group))); });
await sec('c',async()=>{ const G=fresh('2029-03-05',9); delete CLS.rec(G).electives.y4s2_mar; check('c1. 舊存檔（沒選過）：照舊有海商法',has(G,'maritime')); });
await sec('d',async()=>{ const day=D('2029-06-20');
  const mk=(courses,extra)=>({day,hour:10,stage:'law',flags:Object.assign({FAIL_DELAY_COURSES:[],FAIL_DELAY_V:2,FD_MAKEUP:{v:1,courses:courses.slice(),status:'pending',res:{}}},extra||{}),courses:{retake:[]},phone:{q:[{day:D('2029-06-25'),h:20,items:[{th:'sys',text:'x'}],tag:'fd_mk_remind'},{day:D('2029-06-25'),h:21,items:[],tag:'other'}]}});
  let s=mk(['maritime']); FD.migrate(s);
  check('d1. 只有海商法的補考（還沒考）：取消、FD_RESCUE_ELECTIVE、前一天的補考提醒拿掉（別的訊息不動）',s.flags.FD_MAKEUP.status==='cancelled'&&s.flags.FD_RESCUE_ELECTIVE===true&&!s.phone.q.some(q=>q.tag==='fd_mk_remind')&&s.phone.q.some(q=>q.tag==='other'),J2(s.flags));
  s=mk(['maritime','enforcement']); s.courses.retake=[{id:'enforcement',from:'Y4S1',term:'Y4S2',slots:[]}]; FD.migrate(s);
  check('d2. 海商法＋重修的強制執行法：只拿掉海商法、補考照考',s.flags.FD_MAKEUP.status==='pending'&&J(s.flags.FD_MAKEUP.courses)===J(['enforcement']),J2(s.flags.FD_MAKEUP));
  s=mk(['maritime']); s.flags.FD_MAKEUP.mig=day; FD.migrate(s); check('d3. 舊延畢改的補考（mig）：照舊',s.flags.FD_MAKEUP.status==='pending'&&!s.flags.FD_RESCUE_ELECTIVE);
  s=mk(['maritime']); s.flags.FD_MAKEUP.status='fail'; FD.migrate(s); check('d4. 補考已經考了沒過：照舊',s.flags.FD_MAKEUP.status==='fail'&&!s.flags.FD_RESCUE_ELECTIVE);
  const G=fresh('2029-06-20',10); Object.assign(G.flags,mk(['maritime']).flags); G.phone=mk(['maritime']).phone; FD.migrate(G);
  check('d5. 救回來以後：沒有補考停點、不延畢',!FD.mkPending(G)&&!PG.pending(G).some(x=>x.s.id==='fd_makeup')&&!G.flags.FAIL_DELAY); });
H.done();
})();
