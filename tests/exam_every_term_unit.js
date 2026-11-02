// BUG-Y4S2-NOFINAL-1102（BB_218 6879，CC 397609ca）：每個學期、每門考五題的課都有期末考日——不需要瀏覽器。
//   原本 EXAM_WEEKS.final 寫死第 16 週，大四下只有 15 週＝海商法、日本補修兩門沒有期末考日 → failedIn 判缺考 → 6/18 延畢、國考報名取消。
// 修改前（82f8d28c5）：Y4S2 FAIL。用法：node tests/exam_every_term_unit.js
'use strict';
const H=require('./pg_harness.js'); const {check}=H;
const terms=['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'];
for(const route of [null,'JP']){
  const G=H.fresh('2025-09-01',8,'dorm',route?{EXCHANGE_ROUTE:route}:{}); const miss=[];
  for(const T of terms){ for(const c of COURSES.list.filter(c=>c.term===T&&CLS.isExamCourse(c)&&(!c.route||c.route.includes(route)))){ const d=CLS.examDay(G,c,T,'final'); const t=d&&CALENDAR.termOf(d.day); if(!d||!t||t.id!==T||t.exam!=='final') miss.push(T+':'+c.id); } }
  check('每個學期每門考五題的課都有期末考日、而且在那學期的期末週（'+(route||'沒交換')+'）',!miss.length,JSON.stringify(miss)); }
{ const G=H.fresh('2029-05-20',8,'dorm',{}); const c=COURSES.list.find(x=>x.id==='maritime'); const d=CLS.examDay(G,c,'Y4S2','final'); const t=d&&CALENDAR.termOf(d.day);
  check('大四下海商法期末考在第 15 週（大四下最後一週）',!!d&&t.week===15,JSON.stringify({d,t})); }
/* 舊存檔救援：6/18 以後被誤判延畢（海商法沒有期末紀錄）*/
{ const fs=require('fs'),vm=require('vm'),path=require('path'); if(typeof FD==='undefined'){ let src=fs.readFileSync(path.join(H.ROOT,'src/faildelay3d.js'),'utf8').replace(/^const FD\s*=/m,'globalThis.FD='); vm.runInThisContext(src,{filename:'faildelay3d.js'}); }
  const s1={flags:{FAIL_DELAY_COURSES:['maritime'],FAIL_DELAY:true,FAIL_DELAY_DAY:1,BAR_REG:false,FAIL_DELAY_BARCANCEL:true},courses:{exam:{}}};
  const s2={flags:{FAIL_DELAY_COURSES:['maritime'],FAIL_DELAY:true,FAIL_DELAY_DAY:1,BAR_REG:false},courses:{exam:{}}};
  const s3={flags:{FAIL_DELAY_COURSES:['maritime'],FAIL_DELAY:true,FAIL_DELAY_DAY:1,BAR_REG:false},courses:{exam:{'Y4S2:maritime:final':{status:'done',correct:0}}}};
  const d510=PG.DK('2029-05-10'); const s4={flags:{FAIL_DELAY_COURSES:['maritime'],FAIL_DELAY:true,BAR_REG:false},acts:{att:{['act_bar_study@'+(d510+5)]:{end:'full'}}},courses:{exam:{}}};
  const s5={flags:{FAIL_DELAY_COURSES:['maritime'],FAIL_DELAY:true,BAR_REG:false,Y4_PATH:'bar'},courses:{exam:{}}};
  const s6={flags:{FAIL_DELAY_COURSES:['maritime'],FAIL_DELAY:true,BAR_REG:false},acts:{att:{['act_bar_study@'+(d510-20)]:{end:'full'}}},courses:{exam:{}}};
  FD.migrate(s1); FD.migrate(s2); FD.migrate(s3); FD.migrate(s4); FD.migrate(s5); FD.migrate(s6);
  check('救援（BB 06:35）：有報名痕跡——5/10 以後去過國考讀書會＝恢復報名',!s4.flags.FAIL_DELAY&&s4.flags.BAR_REG===true&&s4.flags.FD_RESCUE_BAR==='restored',JSON.stringify(s4.flags));
  check('救援：有報名痕跡——大四選了國考那條路（5/10 自動報名）＝恢復報名',s5.flags.BAR_REG===true,JSON.stringify(s5.flags));
  check('救援：沒有痕跡（只在 5/10 以前去過讀書會）＝報名照舊 false、記 FD_RESCUE_BAR_UNKNOWN',s6.flags.BAR_REG===false&&s6.flags.FD_RESCUE_BAR_UNKNOWN===true,JSON.stringify(s6.flags));
  check('救援：海商法沒有期末紀錄＝取消延畢；報名是被延畢取消的＝恢復報名',!s1.flags.FAIL_DELAY&&s1.flags.BAR_REG===true&&!s1.flags.FAIL_DELAY_COURSES.length,JSON.stringify(s1.flags));
  check('救援：更舊的存檔（分不出報名是不是被取消）＝取消延畢、報名不動、記 FD_RESCUE_BAR_UNKNOWN',!s2.flags.FAIL_DELAY&&s2.flags.BAR_REG===false&&s2.flags.FD_RESCUE_BAR_UNKNOWN===true,JSON.stringify(s2.flags));
  check('真的考了、0 題＝照舊延畢',s3.flags.FAIL_DELAY===true&&s3.flags.FAIL_DELAY_COURSES.length===1,JSON.stringify(s3.flags)); }
H.done();
