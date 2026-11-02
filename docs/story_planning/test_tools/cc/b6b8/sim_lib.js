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
  PHONE.join(G,'noodle_team','麵店團'); PHONE.join(G,'home','家人'); warns.length=0; rej.length=0; H.said=[];
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
