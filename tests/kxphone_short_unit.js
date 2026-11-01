// V0-KXPHONE 30 分鐘版（BB-B 歷史複核第 1 批，BB_218 b3bf2bd74：三輪 qa_play 可昕經濟系那年的手機小事一則都沒收到）。不需要瀏覽器。
// 原因：story3d.js dailyPhone 30 分鐘版（ECONFF.short）照「快過期的先排」，可昕那幾則（9 月底～10/17 都能排）永遠排在別人後面，格子很少（至少隔 3 天）就被搶光。
// 改法：上一則不是可昕的、今天有她的可以排＝先排她的；一人一則輪流（她的幾則之間照舊快過期的先排）。
//   1 每 3 天停一次（接近 30 分鐘版的跳法）9/16～10/16：可昕至少兩則；阿勳「星期三的微積分」（AA_368 M6）照舊收得到
//   2 每 1～4 天停一次：可昕的不會連著兩則（有別人可以排的時候）、每種停法可昕都至少一則
// 修改前（開發分支 c2e5fbf16）：1、2 FAIL（可昕 0 則）。用法：node tests/kxphone_short_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM,E}=H, J=JSON.stringify;
{ const src=fs.readFileSync(path.join(H.ROOT,'src/econff3d.js'),'utf8').replace(/^const ECONFF\s*=/m,'globalThis.ECONFF='); vm.runInThisContext(src,{filename:'src/econff3d.js'}); }
GM.toast=()=>{}; GM.caption=()=>{};
const D=k=>STORY.dayOfKey(k), wdOf=d=>CALENDAR.dateOf(d).wd%7, keyOf=d=>CALENDAR.dateOf(d).key;
const sim=every=>{ const G=H.fresh('2024-09-16',8,'dorm',{E01_MORNING:true,E06_DONE:true}); G.stage='econ'; G.outings=[]; G.acts={att:{}}; E.player.busy=false; E.paused=false;
  for(let d=D('2024-09-16');d<=D('2024-10-16');d+=every){ G.day=d; G.weekday=wdOf(d); for(const h of [8,12,18,20,21,21.2,21.5,22,22.3,23.5]){ G.hour=h; STORY.phoneRules(GM); PHONE.tick(G); } }
  const seq=[]; for(const m of G.msgs||[]){ const t=/^dp_(.+?)_\d+_(\d+)$/.exec(m.tag||''); if(t&&t[2]==='0') seq.push([t[1],keyOf(m.day)]); } return seq; };
check('0. 30 分鐘版開著（ECONFF.short）',typeof ECONFF!=='undefined'&&ECONFF.short({stage:'econ',flags:{E01_MORNING:true}}));
const s3=sim(3), kx=s=>s.filter(x=>/^y0_kx_/.test(x[0]));
check('1. 每 3 天停一次：可昕至少兩則；阿勳「星期三的微積分」照舊收得到',kx(s3).length>=2&&s3.some(x=>x[0]==='y0_xu_calc'),J(s3));
const all=[1,2,3,4].map(e=>[e,sim(e)]);
const noRun=s=>!s.some((x,i)=>i>0&&/^y0_kx_/.test(x[0])&&/^y0_kx_/.test(s[i-1][0]));
check('2. 每 1～4 天停一次：可昕每種都至少一則、不會連著兩則',all.every(([e,s])=>kx(s).length>=1&&noRun(s)),J(all.map(([e,s])=>[e,s.map(x=>x[0])])));
H.done();
