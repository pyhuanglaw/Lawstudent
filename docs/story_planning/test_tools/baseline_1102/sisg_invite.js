require('/tmp/claude-0/-home-user-Lawstudent/a08a2075-8dd6-5be2-9e44-b63f69067248/scratchpad/lw/tests/alison.js');
const H=require('/tmp/claude-0/-home-user-Lawstudent/a08a2075-8dd6-5be2-9e44-b63f69067248/scratchpad/lw/tests/pg_harness.js');
const fs=require('fs'),vm=require('vm'),path=require('path');
let s=fs.readFileSync(path.join(H.ROOT,'src/sis_grad3d.js'),'utf8'); s=s.replace(/^const SISG\s*=/m,'globalThis.SISG='); vm.runInThisContext(s,{filename:'sis_grad3d.js'});
// 大一上第 7 週週二解鎖（SISG_STUDY_DAY），之後幾個星期日 21:30 會不會傳「這週三晚上，法圖。」
let tue=null; for(let d=0;d<300;d++){ const t=CALENDAR.termOf(d); if(t&&t.id==='Y1S1'&&t.week===7&&CALENDAR.dateOf(d).wd===2){ tue=d; break; } }
function run(sat){ const G=H.fresh('2025-09-01',9,'dorm'); G.flags.SIS_STUDY=true; G.flags.SISG_STUDY_DAY=tue; if(sat!=null) G.flags.SISG_SAT_DAY=sat; const out=[];
  for(const sun of [tue+5,tue+12,tue+19]){ G.day=sun; G.weekday=0; G.hour=21.6; const now=sun*24+21.6; SISG.wedInvite(G,now); out.push(CALENDAR.dateOf(sun).m+'/'+CALENDAR.dateOf(sun).d+':'+(PHONE.sent(G,'sisg_wed_'+(sun+3))?'傳了':'沒傳')); } return out.join(' '); }
console.log('解鎖後都沒去法圖：',run(null));
console.log('第一個週三去法圖坐過（SISG_SAT_DAY=tue+8）：',run(tue+8));
process.exit(0);
