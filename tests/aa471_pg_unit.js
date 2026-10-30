// AA_471 第 3～7 節（企劃線 763993620；任務 PG-FIX-471-473-1027）——不需要瀏覽器。第 1、2 節在 tests/pg_jpon_termkey_unit.js（f54a35ec4）。
//   3 國考放榜（麵店團）：2029-09-07 原句、2029-12-14、2030-09-06、2030-12-13 各一版（原本四次同樣三行）；接下來誰上了的那幾則不動
//   4 畢業以後的中秋（2029-09-22、2030-09-12）：住家裡的 20:00 家人群組照表（爸爸的照片＋媽媽一句；不發「蛋黃的 留給你」）；住在外面的照年份換（AA_476 A-8：18:00 媽媽兩則、21:00 爸爸）；學期裡照舊
//   5 被當延畢、重修不到三堂：12/26（三）09:00 旁白兩句；2030-06-17（一）10:00 系辦領證書（手機「畢業證書已可領取。」）；6 月字卡改 06-18 起
//   6 芷若在英國，17:00 那一版的收尾三句輪（照順序、不跟上一週同一句）；美國那學期換字
//   7 交往中、2029 跨年的字卡換句（沒在交往的照原句）
// 每一節都逐字對稿（從 git 讀企劃線 763993620 的 AA_471）。修改前（243db0938）的結果見檔尾。用法：node tests/aa471_pg_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
global.CG_REGISTRY=global.CG_REGISTRY||{};
const NAMES=/^(NOODLE_CLOSED|R2Y4B|R2Y4B_EVENTS|Y5|FD|MSG|MSG_POOL|MSG2_POOL|ZRUK)$/;
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/noodle_closed3d.js','src/data/r2y4b_events.js','src/r2y4b3d.js','src/y5s1_3d.js','src/faildelay3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/zr_uk3d.js']) if(fs.existsSync(path.join(H.ROOT,f))) load(f);
const SHA='763993620', SRC='docs/story_planning/AA_471_大五讀一遍_日本路線家人群組不停_學期判斷過了220天_放榜四次.md';
let DOC=''; try{ DOC=cp.execFileSync('git',['-C',H.ROOT,'-c','core.quotepath=false','show',SHA+':'+SRC],{encoding:'utf8'}); }catch(e){ DOC=''; }
const sec=n=>{ const a=DOC.indexOf('\n## '+n+'.'), b=DOC.indexOf('\n## ',a+4); return a<0?'':DOC.slice(a,b<0?undefined:b); };
/* AA_476（企劃線 6ad997806，AA-C 10-27 回九題）A 節：2 擋「畢業以後的第一個禮拜」、7 阿哲不加句號、8 住在外面的中秋照年份換 */
let D476=''; try{ D476=cp.execFileSync('git',['-C',H.ROOT,'-c','core.quotepath=false','show','6ad997806:docs/story_planning/AA_476_回LAWWW_PGFIX九題_抓包CG_AA290白名單.md'],{encoding:'utf8'}); }catch(e){ D476=''; }
const a476=n=>{ const a=D476.indexOf('\n'+n+'. **'), b=D476.indexOf('\n'+(n+1)+'. **',a+3); return a<0?'':D476.slice(a,b<0?D476.indexOf('\n## B',a):b); };
const row=(s,k)=>(s.split('\n').find(l=>l.startsWith('| '+k))||'').split('|').map(x=>x.trim());
const NAME={'阿哲':'zhe','Alison':'yu','爸爸':'dad','媽媽':'mom'};
const cellMsgs=c=>String(c||'').split('／').filter(Boolean).map(x=>{ const i=x.indexOf('：'); return [NAME[x.slice(0,i)]||x.slice(0,i),x.slice(i+1)]; });
const D=H.D, T=(k,h)=>D(k)*24+h;
const tsec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
/* 畢業後篇的存檔（6/2 撥穗、6/28 退宿回臺北的家）*/
const grad=(key,h,flags)=>{ const G=H.fresh(key,h==null?10:h,'dorm',Object.assign({GRADUATED:D('2029-06-02'),GRAD_DONE:true,MOVED_OUT:D('2029-06-28'),HOME_AFTER:'home',Y4_PATH:'other',PACKED_Y4:D('2029-06-01'),ROOM_Y2:true,ROOM_Y3:true,ROOM_Y4:true},flags||{}));
  G.acts={att:{}}; G.outings=[]; PG.rec(G).done.grad=1; for(const e of ['ev_grad_family','ev_grad_lunch','ev_grad_envelope','ev_y4_path','ev_move_out_y4']) G.events.done[e]=1; return G; };
const grpMsgs=(G,th)=>(G.msgs||[]).filter(m=>m.th===th).map(m=>[m.from||null,m.text]);

(async()=>{
check('0. 讀得到企劃線 '+SHA+' 的 AA_471',DOC.length>1000&&DOC.includes('## 3. 國考放榜'));

/* ======================= 3. 國考放榜（麵店團）======================= */
await tsec(3,async()=>{ const S3=sec(3), want={};
  for(const k of ['2029-12-14','2030-09-06','2030-12-13']) want[k]=cellMsgs(row(S3,k)[2]);
  want['2029-09-07']=[['yu','一試放榜了。'],[null,'（群組安靜了三秒。）'],['zhe','宵夜。']];   /* 原句（稿：「原句」）*/
  /* AA_476 A-7（企劃線 6ad997806）：阿哲照口氣表不加句號——2030-09-06「宵夜」、2030-12-13「最後一次宵夜」、2029-09-07 原句也拿掉；Alison 的句號照稿 */
  check('3. 稿：AA_476 A-7 阿哲不加句號（「宵夜」「最後一次宵夜」、9/7 原句也拿掉）',a476(7).includes('「宵夜」')&&a476(7).includes('「最後一次宵夜」')&&/2029-09-07 原句「宵夜。」也拿掉句號/.test(a476(7))&&/Alison 的句號照稿/.test(a476(7)));
  for(const k in want) want[k]=want[k].map(x=>x[0]==='zhe'?[x[0],x[1].replace(/。$/,'')]:x);
  check('3. 稿：三個日子各一版（阿哲／Alison）',['2029-12-14','2030-09-06','2030-12-13'].every(k=>want[k].length>=2&&want[k].every(x=>x[0]==='zhe'||x[0]==='yu'))&&/Alison：一試放榜了。/.test(S3),J(want));
  /* 考兩年的玩家（2029 一試不到 12 題、2030 再考）：四次都在群組 */
  const G=grad('2029-09-07',14.6,{BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:5}); PHONE.join(G,'noodle_team','麵店團');
  const got={}; let n0=0; const at=(k,h)=>{ H.at(k,h); H.tick(); };
  for(const [k,h] of [['2029-09-07',15.02],['2029-12-14',15.02],['2030-09-06',15.02],['2030-12-13',15.02]]){ at(k,h-0.4); n0=(G.msgs||[]).length; at(k,h); got[k]=(G.msgs||[]).slice(n0).filter(m=>m.th==='g:noodle_team'&&(m.tag||'').startsWith('pg_r')).map(m=>[m.from||null,m.text]); }
  check('3. 考兩年：2029 一試沒過、2030 再考（S.sits）',PG.sits(G,2030)&&PG.retaker(G));
  for(const k of ['2029-09-07','2029-12-14','2030-09-06','2030-12-13'])
    check('3. '+k+' 15:00 麵店團：'+want[k].map(x=>(x[0]||'旁白')+'「'+x[1]+'」').join(''),J(got[k])===J(want[k]),J(got[k]));
  const all=grpMsgs(G,'g:noodle_team').map(x=>x[1]);
  check('3. 原本那一版（「國考放榜了。」）不再出現；「（群組安靜了三秒。）」只在 2029-09-07 一次',!all.includes('國考放榜了。')&&all.filter(t=>t==='（群組安靜了三秒。）').length===1,J(all));
  /* 接下來誰上了的那幾則照舊（2030-12-13 阿哲、Alison）*/
  H.at('2030-12-13',15.3); H.tick(); const after=grpMsgs(G,'g:noodle_team').map(x=>x[1]), zw=PG.zhe2030(G).map(m=>m.text);
  check('3. 2030-12-13 後面的阿哲「'+zw.join('」「')+'」、Alison「司法官還是沒上。……」照舊，接在放榜那兩行後面',J(after.slice(-1-zw.length))===J(zw.concat([POSTGRAD_LINES.Y2030.yu]))&&after.indexOf('最後一次宵夜')>=0&&after.indexOf('最後一次宵夜')<after.indexOf(zw[0]),J(after.slice(-6)));
  /* 只考 2029 一年的：只有前兩次 */
  const G2=grad('2029-12-14',14.6,{BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:14,BAR_STAGE_2029:'lawyer'}); PHONE.join(G2,'noodle_team','麵店團'); H.tick(); H.at('2029-12-14',15.02); H.tick();
  check('3. 只考 2029：12/14 那一版',J(grpMsgs(G2,'g:noodle_team').filter(x=>/放榜|洗澡|洗完/.test(x[1])))===J(want['2029-12-14']),J(grpMsgs(G2,'g:noodle_team'))); });

/* ======================= 4. 畢業以後的中秋（家人群組）======================= */
await tsec(4,async()=>{ const S4=sec(4), want={2029:cellMsgs(row(S4,'2029')[2]),2030:cellMsgs(row(S4,'2030')[2])};
  check('4. 稿：2029 兩則、2030 三則（爸爸先）',want[2029].length===2&&want[2030].length===3&&want[2029][0][0]==='dad'&&want[2030][2][0]==='mom',J(want));
  const famAt=(key,flags,hs)=>{ const G=grad(key,hs[0],flags); PHONE.join(G,'home','家人'); const out={}; for(const h of hs){ H.at(key,h); STORY.phoneRules(GM); PHONE.tick(G); out[h]=grpMsgs(G,'g:home').filter(x=>x[0]==='dad'||x[0]==='mom'); } return {G,out}; };
  for(const [y,key] of [[2029,'2029-09-22'],[2030,'2030-09-12']]){
    const {G,out}=famAt(key,{},[17.5,19.9,20.05,21.5,23.9]);
    check('4. '+key+' 中秋（住家裡）：20:00 以前沒有',out[19.9].length===0&&out[17.5].length===0,J(out[19.9]));
    check('4. '+key+' 20:00 家人群組：'+want[y].map(x=>x[1]).join('／'),J(out[20.05])===J(want[y]),J(out[20.05]));
    check('4. '+key+' 之後不再多（沒有 18:00 媽媽兩則、21:00 爸爸那一則、「蛋黃的 留給你」）；不用回',J(out[23.9])===J(want[y])&&!(G.msgs||[]).some(m=>m.th==='g:home'&&m.ask),J(out[23.9]));
    const m=(G.msgs||[]).find(x=>x.tag==='home_moon_pg_'+D(key)); check('4. '+key+' 那一則的時間是 20:00（那一天）、名字是爸爸／媽媽',!!m&&m.day===D(key)&&m.h>=20&&m.h<20.25&&(G.msgs||[]).filter(x=>x.tag==='home_moon_pg_'+D(key)).every(x=>x.name===(x.from==='dad'?'爸爸':'媽媽')),J(m)); }
  { const {out}=famAt('2029-09-22',{EXCHANGE_ROUTE:'JP'},[20.05]); check('4. 交換延畢（日本路線）大五上的中秋：一樣（住家裡）',J(out[20.05])===J(want[2029]),J(out[20.05])); }
  { const {out}=famAt('2029-09-22',{FAIL_DELAY:true,FAIL_DELAY_COURSES:['x']},[20.05]); check('4. 被當延畢：一樣（住家裡）',J(out[20.05])===J(want[2029]),J(out[20.05])); }
  /* AA_476 A-8：住在外面的（公館的套房）也照年份換（不用 2025 的原句）；18:00 媽媽兩則、21:00 爸爸，不用回 */
  { const A8=a476(8), tw={}; for(const y of ['2029','2030']){ const r=row(A8,y), sp=c=>String(c||'').split('／').filter(Boolean); tw[y]={mom:sp(r[2]).map(t=>['mom',t]),dad:sp(r[3]).map(t=>['dad',t])}; }
    check('4. 稿：AA_476 A-8 住在外面的照年份換（表：2029、2030 媽媽兩則、爸爸一／兩則）、不用 FAM_DAYS 原句',/這個解讀不要用/.test(A8)&&tw[2029].mom.length===2&&tw[2029].dad.length===1&&tw[2030].mom.length===2&&tw[2030].dad.length===2,J(tw));
    for(const [y,key] of [['2029','2029-09-22'],['2030','2030-09-12']]){ const {G,out}=famAt(key,{HOME_AFTER:'gongguan',Y4_PATH:'bar'},[17.9,18.05,20.95,21.05,23.9]), F=HOME.FAM_DAYS;
      check('4. '+key+' 還住在外面（公館的套房）：18:00 媽媽「'+tw[y].mom.map(x=>x[1]).join('／')+'」、21:00 爸爸「'+tw[y].dad.map(x=>x[1]).join('／')+'」；不是 2025 那三則、沒有住家裡那一版',
        out[17.9].length===0&&J(out[18.05])===J(tw[y].mom)&&J(out[20.95])===J(tw[y].mom)&&J(out[21.05])===J(tw[y].mom.concat(tw[y].dad))&&J(out[23.9])===J(tw[y].mom.concat(tw[y].dad))&&!F.moon.concat(F.moonDad).some(x=>out[23.9].some(o=>o[1]===x[1]))&&!(G.msgs||[]).some(m=>/^home_moon_pg_/.test(m.tag||''))&&!(G.msgs||[]).some(m=>m.th==='g:home'&&m.ask),J(out)); }
    check('4. 爸爸的照片和住家裡那一版同一張（同一個晚上）',tw[2029].dad[0][1]===want[2029][0][1]&&tw[2030].dad[0][1]===want[2030][0][1]); }
  { const {G,out}=famAt('2029-09-22',{},[20.05]); H.at('2029-09-24',1); STORY.phoneRules(GM); PHONE.tick(G);
    check('4. 第二天以後不再補發、不重複',grpMsgs(G,'g:home').filter(x=>x[0]==='dad'||x[0]==='mom').length===want[2029].length); }
  /* BUG-PG-MOON-STOP（BB-B 10-30 R43 r43_moon 瀏覽器 FAIL：只停 13:25、23:00）：中秋那幾則要當 PG 的停點（HOME.moonPgStop 登記在 PG.stops）。修改前 FAIL */
  { const d=D('2029-09-22'), G=grad('2029-09-22',13.4,{}); PHONE.join(G,'home','家人'); STORY.phoneRules(GM); const reg=(PG.stops||[]).some(f=>f&&f._moonPg), t1=HOME.moonPgStop&&HOME.moonPgStop(G), ns=PG.nextStop(G);
    H.at('2029-09-22',20.05); STORY.phoneRules(GM); PHONE.tick(G); const t2=HOME.moonPgStop(G);
    check('4. 停點（住家裡）：13:24 的下一個停點不晚於 20:00、中秋那一格＝20:00；發了以後下一格是隔年',reg&&t1===d*24+20&&ns!=null&&ns<=d*24+20&&t2!=null&&t2>d*24+48,J({reg,t1,ns,t2,want:d*24+20})); }
  { const d=D('2029-09-22'), G=grad('2029-09-22',13.4,{HOME_AFTER:'gongguan',Y4_PATH:'bar'}); PHONE.join(G,'home','家人'); STORY.phoneRules(GM); const t1=HOME.moonPgStop(G);
    H.at('2029-09-22',18.05); STORY.phoneRules(GM); PHONE.tick(G); const t2=HOME.moonPgStop(G); H.at('2029-09-22',21.05); STORY.phoneRules(GM); PHONE.tick(G); const t3=HOME.moonPgStop(G);
    check('4. 停點（住公館套房）：18:00 媽媽、21:00 爸爸各停一次；發完下一格是隔年',t1===d*24+18&&t2===d*24+21&&t3!=null&&t3>d*24+48,J({t1,t2,t3,want:[d*24+18,d*24+21]})); }
  { const G=grad('2029-09-23',10,{}); PHONE.join(G,'home','家人'); STORY.phoneRules(GM); PHONE.tick(G);
    check('4. 睡過頭、隔天早上才讀檔：照 20:00 補（同學期裡的做法，兩天內）',J(grpMsgs(G,'g:home').filter(x=>x[0]==='dad'||x[0]==='mom'))===J(want[2029]),J(grpMsgs(G,'g:home'))); }
  { const G=H.fresh('2027-09-15',20.05,'dorm',{}); PHONE.join(G,'home','家人'); const d=D('2027-09-15'), fest=CALENDAR.fest(d); STORY.phoneRules(GM); H.at('2027-09-15',21.05); STORY.phoneRules(GM); PHONE.tick(G);
    check('4. 學期裡的中秋照舊（2027：FAM_MOON 那一年的句子，18:00 媽媽、21:00 爸爸）',fest!=='中秋'||J(grpMsgs(G,'g:home').filter(x=>x[0]==='dad'||x[0]==='mom').map(x=>x[1]))===J(HOME.FAM_MOON[2027].moon.concat(HOME.FAM_MOON[2027].moonDad).map(x=>x[1])),fest+' '+J(grpMsgs(G,'g:home'))); }
  { const G=grad('2029-09-22',20.05,{}); STORY.phoneRules(GM); PHONE.tick(G); check('4. 不在家人群組：不發',!(G.msgs||[]).some(m=>m.th==='g:home')); } });

/* ======================= 5. 被當延畢、重修不到三堂：證書延到六月 ======================= */
await tsec(5,async()=>{ const S5=sec(5), Lx=(typeof FD!=='undefined'&&FD.LINES)||{};
  const NOTE=['（{課名}的重修，出席不到三堂。）','（證書，要等到六月。）'], NARR='（系辦的助教把證書遞給你。）', TA='延了兩個學期。……這次是真的恭喜。';
  check('5. 稿：旁白兩句、助教那一句、手機「畢業證書已可領取。」、6 月字卡 06-18～06-30',NOTE.every(t=>S5.includes('> '+t))&&S5.includes('> '+NARR)&&S5.includes('> 助教：'+TA)&&S5.includes('「畢業證書已可領取。」')&&S5.includes('06-18～06-30'));
  check('5. FD.LINES 照稿',J(Lx.lateNote)===J(NOTE)&&Lx.lateCert===TA,J([Lx.lateNote,Lx.lateCert]));
  const c=CLS.termCourses(H.fresh('2029-06-18',9,'dorm'),'Y4S2').find(x=>CLS.isExamCourse(x)), nm=FD.cname(c.id);
  const fdSave=(key,h,att)=>{ const G=grad(key,h,{FAIL_DELAY:true,FAIL_DELAY_DAY:D('2029-06-18'),FAIL_DELAY_COURSES:[c.id],Y5_DAYS:'study',BAR_REG_2030:false}); PG.rec(G).done.reg_2030=1;
    const R=Y5.rec(G); for(let k=0;k<att;k++) R.cls[(D('2029-09-10')+7*k)+':'+c.id]=1; return G; };
  /* 跳到下一件事（照畢業後篇：場景到了就演）直到 id 演完；回傳演的時候的時間 */
  const advanceUntil=async(G,id,n)=>{ let at=null; const run0=PG.runStep; PG.runStep=async function(GM_,s){ if(s&&s.id===id) at=[G.day,G.hour]; return run0.apply(this,arguments); };
    try{ for(let i=0;i<(n||25)&&!PG.done(G,id);i++){ E.player.busy=false; H.picks=[]; for(const q of OUT.expire(G)) OUT.onMissed(GM,q); const s=PG.due(G); if(s){ await PG.runStep(GM,s); continue; } if(!await PG.advance(GM)) break; } } finally { PG.runStep=run0; } return at; };
  { const G=fdSave('2029-12-23',20,2); H.said=[]; const at=await advanceUntil(G,'fd_late_note');
    check('5. 出席兩堂：12/24 記 FAIL_DELAY_CERT 2030-06',G.flags.FAIL_DELAY_PASS===false&&G.flags.FAIL_DELAY_CERT==='2030-06');
    check('5. 跳到下一件事：停在 12/26（三）09:00 演旁白兩句（記號記下以後第一次停）',!!at&&at[0]===D('2029-12-26')&&Math.abs(at[1]-9)<1e-6,J(at));
    check('5. 12/26 那一停的日期卡不出跨年那張（AA_477 第 2 節：跨年字卡從 2030-01-01 起；修改前 12-24 起，被當延畢的會在跨年以前看到）',!(PG.rec(G).lines||[]).some(t=>/^（跨年那天晚上/.test(t)),J(PG.rec(G).lines));
    const want=NOTE.map(t=>t.replace('{課名}',nm)); check('5. 旁白「'+want.join('」「')+'」',J(H.said.filter(x=>x.who===null&&want.includes(x.t)).map(x=>x.t))===J(want),J(H.lines().slice(-4)));
    check('5. 1/21 的證書不演（不到三堂）',!PG.done(G,'r2y4b_y5_cert')||PG.rec(G).done.r2y4b_y5_cert==='missed'||!R2Y4B.STEPS.find(x=>x.id==='r2y4b_y5_cert').cond(G)); }
  { const G=fdSave('2029-12-23',20,3); H.said=[]; await advanceUntil(G,'fd_late_note',6);
    check('5. 出席三堂：沒有那兩句、沒有 12/26 的停點',G.flags.FAIL_DELAY_PASS===true&&!PG.done(G,'fd_late_note')&&!H.said.some(x=>x.t==='（證書，要等到六月。）')&&!PG.STEPS.find(s=>s.id==='fd_late_note').cond(G)); }
  { const G=grad('2029-12-23',20,{EXCHANGE_ROUTE:'JP'}); check('5. 交換延畢：沒有這兩個場景',!PG.STEPS.find(s=>s.id==='fd_late_note').cond(G)&&!PG.STEPS.find(s=>s.id==='fd_late_cert').cond(G)); }
  /* 2030-06-17（一）10:00 系辦 */
  { const G=fdSave('2030-06-10',9,2); G.flags.FAIL_DELAY_PASS=false; G.flags.FAIL_DELAY_CERT='2030-06'; PG.rec(G).done.fd_late_note=1; H.said=[]; const at=await advanceUntil(G,'fd_late_cert');
    check('5. 2030-06-17（一）10:00 系辦領證書（跳到下一件事停在那裡）',!!at&&at[0]===D('2030-06-17')&&Math.abs(at[1]-10)<1e-6&&CALENDAR.dateOf(D('2030-06-17')).wd===1,J(at));
    check('5. 「'+NARR+'」助教「'+TA+'」',H.said.some(x=>x.who===null&&x.t===NARR)&&H.said.some(x=>x.who==='助教'&&x.t===TA)&&!H.has('恭喜。……延了一學期，還是恭喜。'),J(H.lines().slice(-3)));
    check('5. 手機「畢業證書已可領取。」（10:00）',(G.msgs||[]).some(m=>m.th==='sys'&&m.text==='畢業證書已可領取。'&&m.day===D('2030-06-17')),J(H.msgs('sys').slice(-3)));
    H.at('2030-06-17',12.1); PHONE.tick(G); check('5. 照 S.cert：12:00 媽媽「照片傳給我。我要傳給你爸。」、CERT_DAY 那一天',H.msgs('p:mom').includes('照片傳給我。我要傳給你爸。')&&G.flags.CERT_DAY===D('2030-06-17'),J(H.msgs('p:mom')));
    const card=(a,b)=>PG.cardLine(G,D(a),D(b));
    check('5. 6 月字卡「（證書放在書桌上。你媽這次把框裝上了。）」06-18 起：6/17 以前的跳不出、6/18 以後的跳才出',card('2030-06-01','2030-06-17')!=='（證書放在書桌上。你媽這次把框裝上了。）'&&card('2030-06-17','2030-06-22')==='（證書放在書桌上。你媽這次把框裝上了。）'); }
  /* AA_476 A-2：FAIL_DELAY_CERT 有值的不出「（畢業以後的第一個禮拜……）」（他的「畢業以後」從 6/17 才開始）；報了 2030 國考的那一版「（畢業以後，你還是每天八點起床……）」同一段一起擋 */
  { const WEEK='（畢業以後的第一個禮拜，你每天睡到自然醒。……然後就睡不著了。）', EIGHT='（畢業以後，你還是每天八點起床。不用上課，就去總圖。）', FRAME='（證書放在書桌上。你媽這次把框裝上了。）';
    check('5. 稿：AA_476 A-2「擋」、「（畢業以後的第一個禮拜……）」、6/17 領證書才開始',/\*\*擋\*\*/.test(a476(2))&&a476(2).includes('（畢業以後的第一個禮拜……）')&&a476(2).includes('FAIL_DELAY_CERT')&&a476(2).includes('6/17'));
    const june=(fl)=>{ const G=fdSave('2030-06-30',12,2); Object.assign(G.flags,{FAIL_DELAY_PASS:false,FAIL_DELAY_CERT:'2030-06'},fl||{}); const c=(a,b)=>PG.cardLine(G,D(a),D(b)); return [c('2030-05-31','2030-06-17'),c('2030-06-17','2030-06-22'),c('2030-06-22','2030-06-27'),c('2030-06-27','2030-07-01')]; };
    const a=june({BAR_REG_2030:false}), b=june({BAR_REG_2030:true});
    check('5. 證書延到六月、沒報 2030 國考：6 月一路跳都不出「第一個禮拜」那張；6/18 以後照樣出「框裝上了」',!a.includes(WEEK)&&a.includes(FRAME),J(a));
    check('5. 證書延到六月、報了 2030 國考：一樣不出「八點起床」那張（同一段）',!b.includes(EIGHT)&&b.includes(FRAME),J(b));
    const G2=fdSave('2030-06-30',12,3); Object.assign(G2.flags,{FAIL_DELAY_PASS:true,BAR_REG_2030:false}); const c2=PG.cardLine(G2,D('2030-05-31'),D('2030-06-17'));
    const G3=grad('2030-06-30',12,{EXCHANGE_ROUTE:'JP',BAR_REG_2030:false}); const c3=PG.cardLine(G3,D('2030-05-31'),D('2030-06-17'));
    check('5. 重修過了（一月就拿證書）、交換延畢：照舊出「第一個禮拜」',c2===WEEK&&c3===WEEK,J([c2,c3])); } });

/* ======================= 6. 芷若在英國，17:00 那一版的收尾三句輪 ======================= */
await tsec(6,async()=>{ const S6=sec(6), UK=['你要去吃晚餐了吧。……去吧。','你那邊天要黑了。……去吃飯。','好。我這邊要出門了。'], US=['你要去吃午餐了吧。……去吧。','你那邊中午了。……去吃飯。','好。我這邊要出門了。'];
  check('6. 稿：三句（第一句原句）、美國那一版三句',UK.every((t,i)=>S6.includes('  - '+t+(i===0?'（原句）':'')))&&S6.includes(US.map(t=>'「'+t+'」').join('／')));
  check('6. ZRUK 的兩組照稿',typeof ZRUK!=='undefined'&&J(ZRUK.FIX_CLOSE)===J(UK)&&J(ZRUK.US_FIX_CLOSE)===J(US),typeof ZRUK!=='undefined'?J([ZRUK.FIX_CLOSE,ZRUK.US_FIX_CLOSE]):'沒有 ZRUK');
  const ZR='heroine_02', zr=(key,h,flags)=>{ const G=H.fresh(key,h,'dorm',flags); G.outings=[]; INV.addContact(G,ZR); H.CLOSE(ZR); SOCIAL.rel(ZR).npcRom=35; H.date(ZR); return G; };
  const last=L=>{ const x=L[L.length-1]; return x&&x.text; };
  { const G=zr('2028-11-05',9,{ZR_WEEKLY_FIX:true}), d=D('2028-11-05'); const got=[0,1,2,3,4].map(i=>last(ZRUK.weekLines(G,d+7*i,true)));
    check('6. 修補以後（17:00）的收尾照順序輪：原句 → 天要黑了 → 要出門了 → 原句……',J(got)===J([UK[0],UK[1],UK[2],UK[0],UK[1]]),J(got));
    check('6. 不跟上一週同一句',got.every((t,i)=>i===0||t!==got[i-1]));
    const nf=last(ZRUK.weekLines(G,d+35,false)); check('6. 22:00 那一版照舊（不輪、不動計數）',nf!==UK[2]&&last(ZRUK.weekLines(G,d+42,true))===UK[2],nf); }
  { const G=zr('2028-11-05',9,{ZR_WEEKLY_FIX:true}); delete ZRUK.rec(G).w.fc; const R=G.flags.ZR_UK_CALLS; delete R.w.fc;
    check('6. 舊存檔（沒有 w.fc）從原句開始',last(ZRUK.weekLines(G,D('2028-11-05'),true))===UK[0]); }
  { const G=zr('2028-11-05',6,{ZR_WEEKLY_FIX:true,EXCHANGE_ROUTE:'US'}), d=D('2028-11-05'); const got=[0,1,2].map(i=>last(ZRUK.weekLines(G,d+7*i,true)));
    check('6. 美國那學期：同樣三句換字（午餐、中午、出門）',J(got)===J(US),J(got)); }
  /* 實際接起來（出遊）：三週接、一週沒接——沒接的那週不算，下一次接著輪 */
  { const G=zr('2029-06-03',9,{ZR_WEEKLY_FIX:true}), d0=D('2029-06-03'), seen=[];
    const setT=(d,h)=>{ G.day=d; G.hour=h; G.weekday=CALENDAR.dateOf(d).wd%7; };
    for(let i=0;i<4;i++){ const d=d0+7*i; setT(d,9); STORY.phoneRules(GM); PHONE.tick(G); const q=OUT.get(G,'zruk_w_'+CALENDAR.dateOf(d).key); if(!q){ seen.push('沒排'); continue; }
      if(i===1){ setT(d,q.h+0.3); for(const x of OUT.expire(G)) OUT.onMissed(GM,x); seen.push('沒接'); continue; }
      H.said=[]; H.picks=[]; setT(q.day,q.h-1/6); await OUT.go(GM,q); seen.push((H.said[H.said.length-1]||{}).t); }
    check('6. 畢業以後的夏天（2029-06，她還在英國）：接了的三次照順序輪、沒接的那一週不算',J(seen)===J([UK[0],'沒接',UK[1],UK[2]]),J(seen)); } });

/* ======================= 7. 交往中，2029 跨年的字卡 ======================= */
await tsec(7,async()=>{ const S7=sec(7), OLD='（跨年那天晚上，你在家。煙火是從電視上看的。）', NEW='（跨年那天晚上，你沒有在家。煙火很遠，她說這樣剛好。）';
  check('7. 稿：原句、交往中換的那一句',S7.includes(OLD)&&S7.includes('> '+NEW));
  const card=(G,a,b)=>PG.cardLine(G,D(a),D(b));
  for(const [route,who] of [['JP','heroine_01'],['US','heroine_05'],[null,'kexin']]){ const fl=route?{EXCHANGE_ROUTE:route}:{FAIL_DELAY:true,FAIL_DELAY_COURSES:['x']};
    const G=grad('2030-01-05',10,fl); H.FRIEND(who); H.date(who);
    check('7. '+(route||'被當延畢')+'、和'+who+'交往中：12/23→1/5 的跳出「'+NEW+'」',card(G,'2029-12-23','2030-01-05')===NEW,String(card(H.G,'2029-12-23','2030-01-05'))); }
  { const G=grad('2030-01-05',10,{EXCHANGE_ROUTE:'JP'}); check('7. 沒在交往：原句',card(G,'2029-12-23','2030-01-05')===OLD); }
  { const G=grad('2030-01-05',10,{EXCHANGE_ROUTE:'JP'}); H.FRIEND('heroine_01'); H.date('heroine_01'); ROM.end(G,'heroine_01'); check('7. 分手了（前任）：原句',card(G,'2029-12-23','2030-01-05')===OLD); }
  { const G=grad('2030-01-05',10,{EXCHANGE_ROUTE:'JP'}); H.FRIEND('heroine_03'); H.date('heroine_03'); OUT.rec(G).push({id:'nye_test',ev:'x',day:D('2029-12-31'),h:23.5,state:'done',who:'heroine_03'});
    check('7. 那天另外排了她的跨年場次：原句（不換）',card(G,'2029-12-23','2030-01-05')===OLD); }
  { const G=grad('2030-01-05',10,{}); H.FRIEND('heroine_01'); H.date('heroine_01'); check('7. 沒有延畢（2029 畢業的）：這一段沒有跨年字卡（照舊）',![OLD,NEW].includes(card(G,'2029-12-23','2030-01-05'))); } });

H.done();
})();
// 修改前（243db0938，開工檢查點＝開發分支 129540766＋AA_470）：FAILED 32（第 3 節 7、第 4 節 12、第 5 節 4（中途沒有 fd_late_note 丟例外）、第 6 節 6、第 7 節 3；含 AA_476 A-2、A-7、A-8 的期待值）；改完 ALL PASS。
