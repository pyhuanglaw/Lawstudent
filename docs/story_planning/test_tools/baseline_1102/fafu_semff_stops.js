// 唯讀基準（反查補）：學期中快轉（SEMFF）會不會每兩週被法服值班的出發選單打斷（社員 vs 非社員）
const LW='/tmp/claude-0/-home-user-Lawstudent/a08a2075-8dd6-5be2-9e44-b63f69067248/scratchpad/lw';
require(LW+'/tests/alison.js'); const H=require(LW+'/tests/pg_harness.js'); const {GM}=H;
const fs=require('fs'),vm=require('vm'),path=require('path');
const load=f=>{ let src=fs.readFileSync(path.join(LW,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(LOANS|SEMFF)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/loans3d.js','src/y2b3d.js','src/r2y3a3d.js','src/r2y4b3d.js','src/semff3d.js']) load(f);
GM.toast=()=>{}; GM.phoneThread=async()=>{};
const T=(d,h)=>d*24+h;
(async()=>{
 for(const member of [true,false]){
  const d0=STORY.termDayIn('Y2S1',4,5); // 第4週週五
  H.fresh(CALENDAR.dateOf(d0).key,21,'dorm',Object.assign({EXCHANGE_ROUTE:'TW'},member?{lawclub:true,CLUB_lawclub_study:true,SIS_CLUB_EXPO:true}:{}));
  const stops=[]; const end=STORY.termDayIn('Y2S1',16,1);
  for(let k=0;k<60&&H.G.day<end;k++){ const to=Math.min(T(H.G.day+7,7.5),T(end,7.5)); let r; try{ r=await SEMFF.jump(GM,to); }catch(e){ stops.push('ERR '+e.message); break; }
    if(r.why==='out'){ const q=OUT.due(H.G); stops.push(CALENDAR.dateOf(H.G.day).key+' '+H.G.hour.toFixed(2)+' out:'+(q&&q.title)); if(q){ q.state='missed'; } }
    else if(r.why==='msg'){ PHONE.tick(H.G); for(const m of (PHONE.pending?PHONE.pending(H.G):[])) m.answered=true; stops.push(CALENDAR.dateOf(H.G.day).key+' msg'); }
    else if(r.why!=='end') stops.push(CALENDAR.dateOf(H.G.day).key+' '+r.why+(r.stop?':'+r.stop.why:''));
    if(now()<=0){} }
  const fafu=stops.filter(s=>/法服/.test(s));
  console.log(member?'社員':'非社員','停下來',stops.length,'次，其中法服值班',fafu.length,'次'); console.log('  '+fafu.join('\n  ')); console.log('  ALL: '+stops.slice(0,12).join(' | '));
  console.log('  FAFU_TRK',JSON.stringify(H.G.flags.FAFU_TRK),'bohan sent',PHONE.sent(H.G,'fafu_bohan_Y2S1'));
 }
 process.exit(0);
})();
function now(){return 1;}
