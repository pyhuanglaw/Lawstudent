// 大四下被當的延畢（D14-T5B；AA_421 第 1 節）——不需要瀏覽器。src/faildelay3d.js＋postgrad3d.js／r2y4b3d.js／y5s1_3d.js／termend3d.js
//   1  6/18 大四下成績單：有一門不及格＝FAIL_DELAY（旁白兩句；已報名國考多一句、BAR_REG＝false；22:00 阿哲兩則）；PG.delayed 成立、PG.exchDelayed 不成立
//   2  沒有不及格＝照常畢業；交換路線又被當＝只記那一門（大五上多一門重修），不另外演
//   3  日期卡：6/18～6/27、9/4 起（first）、10/17～11/19 共通、12/19～12/23 共通、2030-03～04 沒報名照 AA_421 1-4；{課名} 換成那一門
//   4  大五上：重修那一門在原本的時段（今日頁、課表）；週二沒有實習；第一次上課老師一句；12/24 出席三堂＝過，不到三堂＝證書延到 2030-06（兩張日期卡、1/22 證書不出）
//   5  9/3 那一句、證書那一句（被當延畢的版本）；實習的場景不演
// 修改前（開發分支 ed265f872）：沒有 src/faildelay3d.js——FAIL。用法：node tests/faildelay_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM,E}=H, J=JSON.stringify;
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(FD|Y5|R2Y4B)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/r2y4b_events.js','src/r2y4b3d.js','src/y5s1_3d.js']) try{ load(f); }catch(e){ console.log('載入失敗 '+f+'：'+e); }
let ok=true, err=''; try{ load('src/faildelay3d.js'); }catch(e){ ok=false; err=String(e); }
const X=()=>typeof FD!=='undefined'?FD:null;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const D=k=>STORY.dayOfKey(k);
/* 大四下：考試的課都考過（答對 3 題）、看出席的課都三堂；fail＝那一門答對 0 題 */
const y4s2=(failId)=>{ const R=CLS.rec(H.G); R.exam=R.exam||{}; R.attend=R.attend||{}; let first=null;
  for(const c of CLS.termCourses(H.G,'Y4S2')){ if(CLS.isExamCourse(c)){ if(!first) first=c; R.exam['Y4S2:'+c.id+':final']={status:'done',correct:3,score:60}; } if(CLS.attCourse(c)) R.attend[c.id]=3; }
  const f=failId==='first'?first:(failId?CLS.termCourses(H.G,'Y4S2').find(c=>c.id===failId):null); if(f) R.exam['Y4S2:'+f.id+':final']={status:'done',correct:0,score:0}; return f; };
const card=(a,b)=>PG.cardLine(H.G,D(a),D(b));

(async()=>{
await sec(0,()=>{ const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
  check('0. src/faildelay3d.js 載得到、index.html 接在 psresults3d.js 後面',ok&&!!X()&&/psresults3d\.js\?v=[^"]+"><\/script>\n<script src="src\/faildelay3d\.js/.test(html),err);
  check('0. CLS.showGrades 包了一層、PG 停在 6/18 發成績單',!!CLS._fdWrap&&PG.STEPS.some(s=>s.id==='fd_grades_y4s2'&&s.at(H.G||{})===D('2029-06-18')*24+9));
  check('0. PG.exchDelayed 有了；termend3d.js 的「今天恭喜」只看交換',typeof PG.exchDelayed==='function'&&/PG\.exchDelayed\|\|PG\.delayed/.test(fs.readFileSync(path.join(H.ROOT,'src/termend3d.js'),'utf8'))); });
if(!X()){ H.done(); return; }

let fc=null;
await sec(1,async()=>{ H.fresh('2029-06-18',9,'dorm',{BAR_REG:true,Y4_PATH:'bar'}); H.FRIEND('zhe'); fc=y4s2('first');
  check('1. 成績單以前：不是延畢',!PG.delayed(H.G)&&!Y5.delayed(H.G));
  await CLS.showGrades(GM,'Y4S2');
  check('1. 有一門不及格：FAIL_DELAY、FAIL_DELAY_COURSES＝那一門',H.G.flags.FAIL_DELAY===true&&J(H.G.flags.FAIL_DELAY_COURSES)===J([fc.id]),J(H.G.flags.FAIL_DELAY_COURSES));
  const nm=FD.cname(fc.id);
  check('1. 旁白「（{課名}，不及格。）」「（證書要等下學期。九月，你要回學校重修。）」',H.has('（'+nm+'，不及格。）')&&H.has('（證書要等下學期。九月，你要回學校重修。）'),J(H.lines().slice(-4)));
  check('1. 已經報名國考：「（今年的國考，考不成了。明年再報。）」、BAR_REG＝false',H.has('（今年的國考，考不成了。明年再報。）')&&H.G.flags.BAR_REG===false);
  H.G.hour=22; PHONE.tick(H.G); check('1. 22:00 阿哲：「聽說了。」「九月我還在總圖 B1。你來，我幫你占位子。」',J(H.msgs('p:zhe').slice(-2))===J(['聽說了。','九月我還在總圖 B1。你來，我幫你占位子。']),J(H.msgs('p:zhe')));
  check('1. PG.delayed、Y5.delayed 成立；PG.exchDelayed 不成立（交換才有的句子不出）',PG.delayed(H.G)&&Y5.delayed(H.G)&&!PG.exchDelayed(H.G)&&!Y5.exch(H.G));
  const n=H.said.length; await CLS.showGrades(GM,'Y4S2'); check('1. 第二次看成績單不再演',H.said.filter(x=>x.t==='（證書要等下學期。九月，你要回學校重修。）').length===1); });

await sec(2,async()=>{ H.fresh('2029-06-18',9,'dorm'); y4s2(null); await CLS.showGrades(GM,'Y4S2');
  check('2. 沒有不及格：不延畢',!H.G.flags.FAIL_DELAY&&!PG.delayed(H.G)&&J(H.G.flags.FAIL_DELAY_COURSES)===J([]));
  H.fresh('2029-06-18',9,'dorm',{EXCHANGE_ROUTE:'JP'}); const f=y4s2('first'); await CLS.showGrades(GM,'Y4S2');
  check('2. 交換路線又被當：記那一門、不設 FAIL_DELAY、不演旁白；照交換延畢',!H.G.flags.FAIL_DELAY&&J(H.G.flags.FAIL_DELAY_COURSES)===J([f.id])&&!H.has('（證書要等下學期。九月，你要回學校重修。）')&&PG.exchDelayed(H.G)); });

await sec(3,()=>{ H.fresh('2029-06-18',12,'dorm',{FAIL_DELAY:true,FAIL_DELAY_COURSES:[fc.id],Y5_DAYS:'study'}); const nm=FD.cname(fc.id);
  check('3. 6/18～6/27：「（同屆的人都畢業了。你還差'+nm+'，九月再回學校。）」',card('2029-06-17','2029-06-26')==='（同屆的人都畢業了。你還差'+nm+'，九月再回學校。）',card('2029-06-17','2029-06-26'));
  check('3. 交換的「還差一門實習」不出',!PG.rec(H.G).lines.includes('（同屆的人都畢業了。你還差一門實習，九月再回學校。）'));
  check('3. 9/4 起（第一次）：「（重修'+nm+'。教室裡坐的，都是學弟妹。）」',card('2029-09-03','2029-09-09')==='（重修'+nm+'。教室裡坐的，都是學弟妹。）');
  check('3. 10/17～11/19 共通：「（一週一堂'+nm+'。其他的日子，一天和一天很像。）」（不是法扶那句）',card('2029-10-16','2029-10-25')==='（一週一堂'+nm+'。其他的日子，一天和一天很像。）');
  check('3. 12/19～12/23 共通：「（大五上結束了。重修的報告，交出去了。）」',card('2029-12-18','2029-12-21')==='（大五上結束了。重修的報告，交出去了。）');
  H.G.flags.BAR_REG_2030=false; check('3. 2030 四月沒報名：「（四月。你開始寫履歷。寫到畢業那一欄，停了一下。）」',card('2030-03-20','2030-03-28')==='（四月。你開始寫履歷。寫到畢業那一欄，停了一下。）');
  check('3. 1/22 證書那張照原句（三堂過了）',card('2030-01-21','2030-01-30')==='（證書放在書桌上。你媽買了一個框，還沒裝進去。）'); });

await sec(4,async()=>{ H.fresh('2029-09-03',8,'dorm',{FAIL_DELAY:true,FAIL_DELAY_COURSES:[fc.id]}); const nm=FD.cname(fc.id), s=FD.slots(H.G)[0];
  check('4. 大五上（Y5.term）',!!Y5.term(H.G,D('2029-09-04')));
  let d=D('2029-09-03'); while(CALENDAR.dateOf(d).wd!==s.slot.wd||CALENDAR.holiday(d)) d++;
  const its=Y5.classItems(H.G,d); check('4. 那一門原本的時段（'+CLS.WD[s.slot.wd]+' '+s.slot.block+'）：今日頁有「重修：'+nm+'」',its.length===1&&its[0].label==='重修：'+nm&&its[0].fd,J(its.map(x=>x.label)));
  let tue=D('2029-09-03'); while(CALENDAR.dateOf(tue).wd!==2) tue++; if(s.slot.wd!==2) check('4. 週二：沒有法扶實習',!/法扶/.test(Y5.dayLine(H.G,tue)||''),Y5.dayLine(H.G,tue));
  check('4. 課表：有重修那一行、沒有實習',/重修：/.test(CLS.weekHTML(Object.assign(H.G,{day:d})))&&!/法扶/.test(CLS.weekHTML(H.G)));
  check('4. 實習的場景不演（週二實習、12/18 最後一次）',!Y5.internOn(H.G)&&!R2Y4B.STEPS.find(x=>x.id==='r2y4b_y5_intern1').cond(H.G));
  H.G.day=d; H.G.hour=its[0].t0-0.5; await Y5.attend(GM,its[0]); check('4. 第一次上課：老師「延畢的同學，期末交一份報告就好。……課要來。」',H.said.some(x=>x.who==='老師'&&x.t==='延畢的同學，期末交一份報告就好。……課要來。'),J(H.lines()));
  const n=H.said.length; let d2=d+7; while(CALENDAR.holiday(d2)) d2+=7; H.G.day=d2; H.G.hour=its[0].t0-0.5; await Y5.attend(GM,Y5.classItems(H.G,d2)[0]); check('4. 第二次沒有那一句',!H.said.slice(n).some(x=>x.who==='老師'&&/延畢的同學/.test(x.t)));
  H.G.day=D('2029-12-25'); FD.result(H.G); check('4. 12/24 以後：只上了兩堂＝不到三堂、證書延到 2030-06',H.G.flags.FAIL_DELAY_PASS===false&&H.G.flags.FAIL_DELAY_CERT==='2030-06');
  check('4. 不到三堂：「（二月。又一個學期。這次你每一堂都去了。）」、6 月「（證書放在書桌上。你媽這次把框裝上了。）」；1/22 證書那張不出',card('2030-02-19','2030-03-01')==='（二月。又一個學期。這次你每一堂都去了。）'&&card('2030-06-01','2030-06-10')==='（證書放在書桌上。你媽這次把框裝上了。）'&&card('2030-01-21','2030-01-30')!=='（證書放在書桌上。你媽買了一個框，還沒裝進去。）');
  check('4. 1/21 證書的場景不演',!R2Y4B.STEPS.find(x=>x.id==='r2y4b_y5_cert').cond(H.G));
  H.fresh('2029-12-25',8,'dorm',{FAIL_DELAY:true,FAIL_DELAY_COURSES:[fc.id]}); const R=Y5.rec(H.G); for(let k=0;k<3;k++) R.cls[(D('2029-09-10')+7*k)+':'+fc.id]=1; FD.result(H.G); check('4. 出席三堂：過了（證書 1/21 照交換延畢）',H.G.flags.FAIL_DELAY_PASS===true&&!H.G.flags.FAIL_DELAY_CERT&&R2Y4B.STEPS.find(x=>x.id==='r2y4b_y5_cert').cond(H.G)); });

await sec(5,async()=>{ H.fresh('2029-09-03',9,'dorm',{FAIL_DELAY:true,FAIL_DELAY_COURSES:[fc.id]}); H.picks=[0]; await R2Y4B.y5Plan(GM);
  check('5. 9/3 一門：「（這學期，只要重修'+FD.cname(fc.id)+'。其他的日子——）」',H.has('（這學期，只要重修'+FD.cname(fc.id)+'。其他的日子——）')&&!H.said.some(x=>/實習/.test(x.t)),J(H.lines()));
  const two=CLS.termCourses(H.G,'Y4S2').filter(c=>CLS.isExamCourse(c)).slice(0,2).map(c=>c.id);
  H.fresh('2029-09-03',9,'dorm',{FAIL_DELAY:true,FAIL_DELAY_COURSES:two}); H.picks=[0]; await R2Y4B.y5Plan(GM); check('5. 9/3 兩門：「（這學期，要重修兩門課。其他的日子——）」',two.length<2||H.has('（這學期，要重修兩門課。其他的日子——）'));
  H.fresh('2030-01-21',10,'dorm',{FAIL_DELAY:true,FAIL_DELAY_COURSES:[fc.id],FAIL_DELAY_PASS:true}); await R2Y4B.cert(GM);
  check('5. 證書：助教「恭喜。……延了一學期，還是恭喜。」（不是「你們交換回來的」）',H.has('恭喜。……延了一學期，還是恭喜。')&&!H.has('你們交換回來的，今天第三個了。'));
  H.fresh('2030-01-21',10,'dorm',{EXCHANGE_ROUTE:'US'}); await R2Y4B.cert(GM); check('5. 交換延畢的證書照舊',H.has('你們交換回來的，今天第三個了。')); });

H.done();
})();
