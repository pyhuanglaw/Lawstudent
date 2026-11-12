// 用法：node p3_routes.js <worktree>　動態：晚年第一次到司法官、2033 第一次到司法官、重考年錯過一試、二試放榜錯過、FD 延畢、律師級（12–15）
const WT=process.argv[2]; const H=require(WT+'/tests/pg_harness.js'); const {check}=H;
const warns=[]; console.warn=(...a)=>{ warns.push(a.map(x=>x&&x.stack?x.stack.split('\n').slice(0,3).join(' / '):String(x)).join(' ')); };
const rej=[]; process.on('unhandledRejection',e=>rej.push(String(e&&e.stack||e)));
const GM=H.GM; GM.spawnCharacter=()=>null;
const J=POSTGRAD_LINES.JUDGE||{}, EL=POSTGRAD_LINES.EPI.last;
const graduated=G=>{ G.flags.GRADUATED=PG.gradDay(); PG.rec(G).done.grad=1; if(G.flags.MOVED_OUT==null) G.flags.MOVED_OUT=PG.DK('2029-06-28'); };
const answerK=(qs,k)=>qs.map((q,i)=>{ const o=PG.opts(q); const right=o.findIndex(x=>String(x.v)===String(q.answer)); return i<k?right:(right===0?1:0); });
const FRIENDS=['zhe','yu','classmate_bohan','heroine_01','heroine_03','classmate_peishan'];
const FAMILY=['A_bar','C_zq','B_grad','L_firm'];
/* 從 key 一路跳到尾聲。plan：{exam:{年:一試答對}, judge:{年:二試答對}, retake:true/false（二選一）, reg:{年:false＝不報}, role:'pros'} */
async function sim(key,hour,flags,plan,setup){ const G=H.fresh(key,hour,'dorm',Object.assign({BAR_REG:true,Y4_PATH:'bar'},flags||{})); graduated(G); FRIENDS.forEach(H.FRIEND); if(setup) setup(G);
  PHONE.join(G,'noodle_team','桌遊團'); PHONE.join(G,'home','家人'); warns.length=0; rej.length=0; H.said=[];
  const order=[], stops=[]; let it=0, err=null, mono=true;
  const orun=PG.runStep; PG.runStep=async function(GM,s){ let set=false, m; if(plan.skip&&plan.skip.includes(s.id)&&!PG.done(G,s.id)){ PG.rec(G).done[s.id]='missed'; if(s.onMiss) s.onMiss(G); order.push('MISS:'+s.id); return false; }
    if(!PG.done(G,s.id)){
      if((m=/^exam_(\d{4})$/.exec(s.id))){ H.picks=answerK(PG.draw(G,+m[1]),(plan.exam||{})[m[1]]|0); set=true; }
      else if((m=/^e2b_(\d{4})$/.exec(s.id))&&PG.stage(G,+m[1])==='both'){ H.picks=answerK(PG.drawJudge(G,+m[1]),(plan.judge||{})[m[1]]|0); set=true; }
      else if((m=/^jretake_(\d{4})$/.exec(s.id))){ H.picks=[plan.retake?0:1]; set=true; }
      else if((m=/^j?reg_(\d{4})$/.exec(s.id))){ H.picks=[(plan.reg&&plan.reg[m[1]]===false)?'不報名':'報名']; set=true; }
      else if(s.id==='jrole'){ H.picks=[plan.role==='pros'?1:0]; set=true; } }
    const r=await orun.call(PG,GM,s); if(set) H.picks=[]; if(r) order.push(s.id); return r; };
  try{ for(it=0; it<220&&!G.flags.EPILOGUE_DONE; it++){ const before=G.day*24+G.hour;
      if(OUT.due(G)){ H.picks=[0]; await OUT.tick(GM); H.picks=[]; }
      else { const s=PG.due(G); if(s) await PG.runStep(GM,s);
        else if(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G)){ if(!await PG.sleepJump(GM)){ const t0=G.day*24+G.hour; await HOME.sleep(GM); if(G.day*24+G.hour<=t0){ stops.push('sleep none'); break; } } }
        else if(!await PG.advance(GM)){ stops.push('none '+PG.dateLabel(G.day,G.hour)); break; } }
      if(G.day*24+G.hour<before-1e-6) mono=false; }
  }catch(e){ err=e; } finally { PG.runStep=orun; }
  await new Promise(r=>setTimeout(r,30));
  const lastKey=Object.keys(EL).find(k=>H.has(EL[k]));
  return {G,order,stops,it,err,mono,lastKey,photo:((G.msgs||[]).find(m=>m.tag==='pg_first_day'&&m.from==='player')||{}).text||'',said:H.said.map(x=>x.t)}; }
const okRun=(name,R)=>check(name+'：沒有卡死、不丟例外、時間只往前、演完尾聲（'+R.it+' 步）',!R.err&&!warns.length&&!rej.length&&R.mono&&R.G.flags.EPILOGUE_DONE===true&&R.it<220,
  (R.err&&R.err.stack||'')+warns.slice(0,3).join('｜')+rej.slice(0,2).join('｜')+'　'+R.stops.join(' ')+'　'+R.order.join(' → '));
const sameLast=(R)=>R.lastKey===PG.path(R.G);
const show=(name,R,extra)=>{ const F=R.G.flags; const pick=k=>Object.keys(F).filter(x=>/^(BAR_YEAR|BAR_STAGE_|JUDGE_)/.test(x)).reduce((o,x)=>(o[x]=F[x],o),{});
  console.log('== '+name+' err='+(R.err&&R.err.message)+' warns='+warns.length+' epi='+F.EPILOGUE_DONE+' it='+R.it+' stops='+R.stops.join('|'));
  console.log('   path='+PG.path(R.G)+' lastKey='+R.lastKey+' photo='+R.photo.slice(0,40));
  console.log('   flags='+JSON.stringify(pick()));
  console.log('   order='+R.order.join(' '));
  const tail=['epiD','epiF','epiGradLic','distance'].filter(k=>R.said.includes(J[k])); console.log('   epiAfterLast lines='+tail.join(','));
  if(extra) console.log('   '+extra(R)); };
(async()=>{
  const which=process.argv[3]||'all'; const run=n=>which==='all'||which.split(',').includes(n);
  if(run('A')){ const R=await sim('2029-08-04',7,{},{exam:{2029:5,2030:5,2031:16,2032:16},judge:{2031:2,2032:8},retake:true}); show('A 律師 2031 才到 both（第一次司法官）→重考 2032 答 8',R); }
  if(run('B')){ const R=await sim('2029-08-04',7,{},{exam:{2029:5,2030:5,2031:5,2032:5,2033:16},judge:{2033:9}}); show('B 2033 第一次到 both（沒有下一年）',R); }
  if(run('C')){ const R=await sim('2029-08-04',7,{},{exam:{2029:18,2031:16},judge:{2029:4,2031:9},retake:true,skip:['exam_2030'],reg:{2031:false}}); show('C 重考年 2030 錯過一試、2031 不報',R,R=>'JUDGE_TRIES='+R.G.flags.JUDGE_TRIES); }
  if(run('D')){ const R=await sim('2029-08-04',7,{},{exam:{2029:18},judge:{2029:4},retake:true,skip:['r2_2029']}); show('D 2029 二試放榜錯過（both 18）',R); }
  if(run('E')){ const R=await sim('2029-08-04',7,{},{exam:{2029:14}}); show('E 律師級 14（不會有司法官二試）',R); }
  if(run('F')){ const R=await sim('2030-08-03',7,{FAIL_DELAY:true,BAR_REG_2030:true,BAR_REG:false},{exam:{2030:17,2031:16},judge:{2030:3,2031:7},retake:true}); show('F 被當延畢 FD：2030 第一次→2031 答 7',R); }
  if(run('G')){ const R=await sim('2029-08-04',7,{},{exam:{2029:18,2030:16,2031:16},judge:{2029:4,2030:6,2031:6},retake:true},G=>{ const C=CLS.rec(G); C.exam=C.exam||{}; for(const t of ['Y1S1','Y2S1','Y3S1','Y4S1']) C.exam[t+':civ_general:final']={status:'done',correct:4}; }); show('G basis=4、重考 2030 答 6（門檻減一＋輔助）',R,R=>'basis='+PG.basis(R.G)); }
  if(run('H')){ const R=await sim('2029-08-04',7,{},{exam:{2029:18,2030:16},judge:{2029:4,2030:6},retake:true,reg:{2031:false}}); show('H 無 basis、重考 2030 答 6（門檻減一）',R); }
  await new Promise(r=>setTimeout(r,30)); process.exit(0);
})();
