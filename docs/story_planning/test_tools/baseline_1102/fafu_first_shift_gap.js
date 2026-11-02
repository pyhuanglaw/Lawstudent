// 唯讀基準：社員大二第一次到法服是「陪阿德」（wzlines 線一 1-3，lease2），之後的一般值班會不會記 FAFU_FIRST_SHIFT_Y2（語彤事件 7 新版 ev_yt_shift_chat 讀它）
const LW='/tmp/claude-0/-home-user-Lawstudent/a08a2075-8dd6-5be2-9e44-b63f69067248/scratchpad/lw';
require(LW+'/tests/alison.js'); const H=require(LW+'/tests/pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'); const {GM}=H;
global.SISY23={preTalk:async()=>false};
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(WZS|EAT|EAT_LINES|JOBS|WZ_JOBS_DATA|WZ_SHOPS_LAYOUT|WZ_PARK_LAYOUT|PARK|WZ_EVENTS|WZL|Y2B_EVENTS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/wz_park_layout.js','src/wzpark3d.js','src/data/wz_shops_layout.js','src/data/eat_lines.js','src/eat3d.js','src/wzshops3d.js','src/data/y2b_events.js','src/data/wz_jobs.js','src/jobs3d.js','src/data/wz_events.js','src/wzlines3d.js']) load(f);
GM.money=()=>{}; GM.toast=()=>{};
const TD=(t,w,wd)=>STORY.termDayIn(t,w,wd);
const at=(d,h,zone)=>{ H.G.day=d; H.G.hour=h; H.G.weekday=CALENDAR.dateOf(d).wd%7; if(zone) H.G.zone=zone; };
(async()=>{
  const w3=TD('Y2S1',3,6), w7=TD('Y2S1',7,6), w11=TD('Y2S1',11,6);
  // 社員（lawclub）、阿德那條線到 1-3（WZ_COPY_LEASE 1）
  H.fresh('2026-10-20',10,'dorm',{lawclub:true,WZ_COPY_LEASE:1,WZ_C_L1:w3-10});
  WZL.phone(H.G); const R=H.G.flags.WZ_LINE_L; console.log('WZ_LINE_L',JSON.stringify(R),'w7',w7,'fafuDuty(w7)',STORY.fafuDuty({day:w7,flags:{},stage:'law'}));
  at(w7,9.5,'wancai'); console.log('lineToday',!!WZL.lineToday(H.G),'fafuShiftable before',STORY.fafuShiftable(H.G));
  const fired=WZL.tick(GM); for(let i=0;i<50&&WZL.playing;i++) await new Promise(r=>setTimeout(r,0));
  const F=H.G.flags; console.log('tick fired',fired,'done lease2',!!H.G.events.done.ev_wz_c_lease2,'LAWCLUB_SAT_VISITS',F.LAWCLUB_SAT_VISITS,'FAFU_SHIFT_N',F.FAFU_SHIFT_N,'FAFU_FIRST_SHIFT_Y2',F.FAFU_FIRST_SHIFT_Y2,'fafuShiftable same day',STORY.fafuShiftable(H.G));
  at(w11,9.5,'wancai'); H.said=[]; H.picks=[0,1]; const ok=await STORY.fafuShift(GM);
  console.log('w11 fafuShift ran',ok,'FAFU_SHIFT_N',F.FAFU_SHIFT_N,'FAFU_FIRST_SHIFT_Y2',F.FAFU_FIRST_SHIFT_Y2,'saw 隔壁桌阿伯 narration',H.said.some(s=>/隔壁桌/.test(s.t)));
  // 對照：沒有阿德那條線，第一次就是 w7 一般值班
  H.fresh('2026-10-24',9.5,'wancai',{lawclub:true}); H.picks=[0,1]; await STORY.fafuShift(GM); console.log('control: FAFU_SHIFT_N',H.G.flags.FAFU_SHIFT_N,'FAFU_FIRST_SHIFT_Y2',H.G.flags.FAFU_FIRST_SHIFT_Y2);
  process.exit(0);
})();
