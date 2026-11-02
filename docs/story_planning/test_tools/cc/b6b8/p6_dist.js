// 用法：node p6_dist.js <worktree> <mode real|uniform> <seed0> <n> <out.jsonl>
// 200 個隨機玩家：畢業前的累積（期末、法服、讀書會、通識、交換、Y4_PATH、研究所、子晴線、交往、延畢）直接寫成旗標／紀錄，
// 從 2029-08-04（延畢＝2030-08-03）用 d118_b8_unit 的 sim 一路「跳到下一件事」到尾聲。
const fs=require('fs');
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
const MODE=process.argv[3]||'real', S0=+process.argv[4]||1, N=+process.argv[5]||1, OUTF=process.argv[6]||'p6_out.jsonl';
const rngOf=s=>{ let a=s>>>0||1; return ()=>{ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; };
const TERMS={Y1S1:['const_1','crim_gen1','civ_general'],Y1S2:['const_2','crim_gen2','oblig_gen1'],Y2S1:['admin_law','crim_spec','property','oblig_gen2'],Y2S2:['oblig_spec','family_law','admin_remedy'],
  Y3S1:['civpro_1','crimpro','company_law'],Y3S2:['civpro_2','insurance'],Y4S1:['enforcement','legal_ethics']};
const GE=[['Y1S1','ge_film_y1s1'],['Y1S2','ge_y1s2'],['Y2S1','ge_y2s1'],['Y2S2','ge_y2s2']];
const PARTNERS=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan'];
function gen(seed){ const r=rngOf(seed*2654435761+(MODE==='uniform'?7:0)); const U=MODE==='uniform';
  const nrm=()=>{ let s=0; for(let i=0;i<6;i++) s+=r(); return (s-3)/Math.sqrt(0.5); };   // ~N(0,1)
  const pick=(arr,w)=>{ if(U||!w) return arr[Math.floor(r()*arr.length)]; let x=r()*w.reduce((a,b)=>a+b,0); for(let i=0;i<arr.length;i++){ x-=w[i]; if(x<0) return arr[i]; } return arr[arr.length-1]; };
  const bin=(n,p)=>{ let k=0; for(let i=0;i<n;i++) if(r()<p) k++; return k; };
  const ui=(a,b)=>a+Math.floor(r()*(b-a+1));
  const P={}; P.abil=U?r()*5:Math.max(0,Math.min(5,3+0.9*nrm()));
  P.finals={}; for(const t in TERMS) for(const c of TERMS[t]) P.finals[t+':'+c+':final']=U?ui(0,5):bin(5,P.abil/5);
  P.study=U?ui(0,1500):Math.max(0,Math.round(300+150*nrm()));
  P.lawclub=U?r()<0.5:r()<0.55; P.sat=P.lawclub?(U?ui(0,30):Math.min(15,bin(10,0.35)+(r()<0.1?ui(3,8):0))):0; P.fafu=P.lawclub&&r()<(U?0.5:0.4)?ui(0,6):null;
  P.grp=U?ui(0,12):(r()<0.45?0:Math.min(10,1+bin(8,0.3)));
  P.ge=GE.map(([t,c])=>[t,c,U?pick(['及格','不及格',null]):(r()<0.7?(r()<0.92?'及格':'不及格'):null)]);
  P.vac={}; for(const [id,p] of [['C16',.12],['C09',.08],['C02',.15],['C10',.1],['C08',.08],['C11',.06],['C12',.06]]) P.vac[id]=U?(r()<0.5?1:0):(r()<p?1:0);
  P.gradTalk=U?ui(0,3):(r()<0.3?ui(1,2):0); P.gradRead=r()<(U?0.5:0.25); P.zq=U?ui(0,2):(r()<0.3?ui(1,2):0); P.ytLease=r()<(U?0.5:0.2);
  P.route=pick(['TW','JP','US'],[80,10,10]); P.fd=P.route==='TW'&&r()<(U?0.5:0.05);
  P.y4=pick(['bar','grad','other'],[55,30,15]);
  P.grad=null; if(P.y4==='grad'||(U&&r()<0.3)) P.grad=pick(['push','exam','fail'],[25,35,40]);
  P.reg=P.y4==='bar'?'yes':pick(['yes','no','missed'],[60,30,10]);
  P.exam={}; P.skip=[]; for(let y=2029;y<=2033;y++){ P.exam[y]=U?ui(0,20):Math.max(0,Math.min(20,bin(20,Math.min(0.95,0.3+0.11*P.abil+0.03*(y-2029))))); if(r()<(U?0.15:0.05)) P.skip.push('exam_'+y); }
  if(!U&&r()<0.03) P.exam[2029]=0;
  P.judge={}; for(let y=2029;y<=2033;y++) P.judge[y]=U?ui(0,10):bin(10,Math.min(0.95,0.2+0.11*P.abil+0.04*(y-2029)));
  P.retake=r()<(U?0.5:0.6); P.lateReg={}; for(let y=2030;y<=2033;y++) P.lateReg[y]=r()<(U?0.5:0.75); P.role=r()<0.5?'judge':'pros';
  P.zqContract=r()<(U?0.5:0.25)?pick(['lawyer','legal_aid','honest']):null; P.zqFriend=r()<(U?0.5:0.4);
  P.partner=U?pick([null].concat(PARTNERS)):(r()<0.5?null:pick(PARTNERS));
  return P; }
(async()=>{ for(let seed=S0; seed<S0+N; seed++){ const P=gen(seed); const t0=Date.now(); let R=null, e0=null;
  const delayed=P.route!=='TW'||P.fd;
  const flags={Y4_PATH:P.y4,EXCHANGE_ROUTE:P.route,BAR_REG:delayed?false:(P.reg==='yes'?true:(P.reg==='no'?false:null))};
  if(P.reg==='missed'&&!delayed) flags.BAR_REG_MISSED_2029=true;
  if(delayed) flags.BAR_REG_2030=P.reg!=='no';
  if(P.fd) flags.FAIL_DELAY=true;
  if(P.lawclub){ flags.lawclub=true; flags.CLUB_lawclub_study=true; } flags.LAWCLUB_SAT_VISITS=P.sat; if(P.fafu!=null) flags.FAFU_STORY_SEEN=P.fafu;
  if(P.gradRead) flags.grad_read_done=true; if(P.ytLease) flags.YT_LEASE_HELP=true;
  if(P.grad==='push') flags.Y4_PUSH='pass'; else if(P.grad==='exam') flags.GRAD_ADMIT='exam'; else if(P.grad==='fail'){ flags.GRAD_ADMIT='fail'; flags.GRAD_EXAM_RESULT='fail'; }
  if(P.zqContract) flags.ZQ_CONTRACT=P.zqContract;
  const reg={}; for(const y in P.lateReg) if(!P.lateReg[y]) reg[y]=false;
  const plan={exam:P.exam,judge:P.judge,retake:P.retake,reg,role:P.role,skip:P.skip};
  const setup=G=>{ G.stats.study=P.study; G.flags.STUDY_AT_LAW=0; const C=CLS.rec(G); C.exam=C.exam||{}; for(const k in P.finals) C.exam[k]={status:'done',correct:P.finals[k]};
    G.courses=G.courses||{}; G.courses.grades=G.courses.grades||{}; for(const [t,c,v] of P.ge) if(v){ (G.courses.grades[t]=G.courses.grades[t]||{})[c]=v; }
    G.acts=G.acts||{}; G.acts.att=G.acts.att||{}; for(let i=0;i<P.grp;i++) G.acts.att['public_law_group@'+(200+i*7)]={end:'full'};
    G.vac=G.vac||{}; G.vac.reg=G.vac.reg||{}; for(const id in P.vac) if(P.vac[id]) G.vac.reg[id+'@2027']='done';
    const ids=Object.keys(CHARACTERS); for(let i=0;i<P.gradTalk;i++) SOCIAL.remember(ids[i],'GRAD_SCHOOL_DISCUSSION','');
    if(P.zq>=1) SOCIAL.remember('heroine_04','PLAYTESTED',''); if(P.zq>=2) SOCIAL.remember('heroine_04','CONTEST_DAY','');
    if(P.zqFriend) H.FRIEND('heroine_04'); if(P.partner){ H.FRIEND(P.partner); H.date(P.partner); } };
  try{ R=await sim(delayed?'2030-08-03':'2029-08-04',7,flags,plan,setup); }catch(e){ e0=e; }
  const rec={seed,mode:MODE,P:{abil:+P.abil.toFixed(2),route:P.route,fd:P.fd,y4:P.y4,grad:P.grad,reg:P.reg,partner:P.partner,retake:P.retake,skip:P.skip}};
  if(R){ const G=R.G, F=G.flags; let lean=null, top=null, path=null; try{ lean=STORY.careerLean(G); top=PG.pathTop(G); path=PG.path(G); }catch(e){ rec.leanErr=String(e); }
    Object.assign(rec,{path,lastKey:R.lastKey,top,lean:lean&&{A:lean.A,B:lean.B,C:lean.C,top:lean.top},epi:F.EPILOGUE_DONE===true,it:R.it,stops:R.stops,err:R.err?String(R.err.stack||R.err).slice(0,300):null,warns:warns.slice(0,3),rej:rej.slice(0,2),mono:R.mono,
      F:Object.keys(F).filter(x=>/^(BAR_YEAR|BAR_STAGE_|BAR_SCORE_|JUDGE_|GRAD_ADMIT|Y4_PUSH|BAR_REG)/.test(x)).reduce((o,x)=>(o[x]=F[x],o),{}),
      after:['epiD','epiF','epiGradLic','distance'].filter(k=>R.said.includes(J[k])),order:R.order.join(' ')}); }
  else rec.err=String(e0&&e0.stack||e0).slice(0,300);
  rec.ms=Date.now()-t0; fs.appendFileSync(OUTF,JSON.stringify(rec)+'\n'); console.log(seed,rec.path,rec.lastKey,rec.top,rec.epi,rec.ms+'ms',rec.err?'ERR':''); }
  process.exit(0); })();
