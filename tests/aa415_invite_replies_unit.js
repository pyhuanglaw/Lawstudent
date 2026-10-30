// 邀約回覆照階段變（D14-T9／USER_WANTS D37；AA_415 七位定稿，企劃線 b113e39d）——不需要瀏覽器。
//   0  接線：index.html 在 invites.js 後面載 invite_replies.js；白名單有 AA_415@b113e39d；INV.replyPick／REPLY_ON／REPLY_COND
//   1  資料＝AA_415 的表：七位各自的列數、每一列的原文一字不差、抽查句子；「現有」的答應句和 INVITE_DATA 一樣；學姊沒有件數、編號、「重點是」，
//      子晴沒有「欸不是」「這不是問句」，可昕沒有「假設」；條件都接得上（接不上的標 off）
//   2  七位：第 1～6 階、交往中的答應句來自那一階
//   3  第一次 vs 來過（子晴、沛珊第 3 階溫州街：第一次照現有的 first，第二次換一句；芷若「你上次那杯」要去過）
//   4  晚上、考試週的句子在對的時候出現
//   5  不連續兩次同一句（七位、兩個階段，各連約 10 次）；同一個地點連約三次三句都不一樣（AA_415 第 8 節第 2 點）
//   6  改天、婉拒輪流；改天的句子說「明天」「九點以後」，改天的時間就照那個
//   7  現有的不變：rule（語彤週二週四、學姊筆試前、子晴大四、沛珊大二下、以安大一散步）、here（以安的總圖、芷若上班的 Café）、阿哲；沒有資料檔＝照舊
//   8  存檔：G.invReply（舊存檔沒有＝從空的開始、壞掉的重建、JSON 來回）
//   9  節日：日期判斷；AA_415 第 8 節「沒接上以前不出現」＝REPLY_ON 關著不出現、打開才出現
//   10 可昕：經濟系那一年（7-1）、法律系交往中、分開以後（最多第 4 階、沒有交往中的句子）
//   11 條件的列：語彤續約前後的週四、芷若週六、子晴「昨天才約過」、學姊口試前一週（改到下週）、以安的現有 plan、芷若「上班」
//   12 手機約（INV.flow）：念的是表上的句子，第二次換一句
// 修改前（開發分支 888f3e175）：沒有 src/data/invite_replies.js、INV.replyPick——FAIL。用法：node tests/aa415_invite_replies_unit.js
require('./alison.js');   // 讀企劃稿（git show）照匯入工具同一套換：Alison、虛構校名（WORLD-RENAME-1030，docs/WORLD_NAMING.md）
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H, J=JSON.stringify;
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (INVITE_REPLIES|MSG2_POOL)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
let ok=true, err=''; try{ load('src/data/invite_replies.js'); load('src/data/msg2_pool.js'); }catch(e){ ok=false; err=String(e); }
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const IDS=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan','kexin'];
const NM={heroine_01:'以安',heroine_02:'芷若',heroine_03:'語彤',heroine_04:'子晴',heroine_05:'學姊',classmate_peishan:'沛珊',kexin:'可昕'};
const R=()=>typeof INVITE_REPLIES!=='undefined'?INVITE_REPLIES.people:{};
const ROWS=id=>R()[id]||[];
const txt=ls=>(ls||[]).map(x=>typeof x==='string'?x:x.me).join('');
const rowOf=(id,lines)=>ROWS(id).find(r=>J(r.lines)===J(lines))||null;
const REL={1:{fam:10},2:{fam:25},3:{fam:45,trust:30},4:{fam:65,trust:50,comf:45},5:{fam:45,trust:30,npcRom:30},6:{fam:65,trust:50,comf:45,npcRom:55,rom:30}};
const setSt=(id,s)=>{ const r=SOCIAL.rel(id); Object.assign(r,{fam:0,trust:0,comf:0,npcRom:0,rom:0},REL[s==='d'?4:s]); SOCIAL.remember(id,'FIRST_MET','');
  if(s==='d') H.G.flags['dating_'+id]=true; else delete H.G.flags['dating_'+id]; };
const fresh=(key,id,s,o)=>{ H.fresh(key,(o&&o.hour)||9,'campus'); if(o&&o.econ) H.G.stage='econ'; if(id) setSt(id,s); return H.G; };
const D=k=>PG.DK(k);
const ask=(id,pid,h,day,r0)=>{ const G=H.G; day=day==null?G.day:day; const P=INV.place(pid); const d=r0||INV.decide(G,id,pid,day,h); return INV.personal(G,id,P,day,h,d); };
const doneIv=(id,pid,day)=>{ const G=H.G; INV.rec(G); G.invSeq=(G.invSeq|0)+1; G.invites.push({id:'iv'+G.invSeq,who:id,place:pid,zone:INV.place(pid).zone,day:day==null?G.day-3:day,h:15.5,state:'done',accepted:true,by:'player'}); };
const inSt=(r,n)=>n>=r.st[0]&&n<=r.st[1];
const SPEC='docs/story_planning/AA_415_邀約回覆照階段變_七位定稿.md';

(async()=>{
await sec(0,()=>{ const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
  check('0. src/data/invite_replies.js 載得到（INVITE_REPLIES 七位）',ok&&IDS.every(id=>ROWS(id).length>0),err||J(Object.keys(R())));
  check('0. index.html：invites.js 的下一行就是 invite_replies.js',/src="src\/data\/invites\.js\?v=[^"]+"><\/script>\n<script src="src\/data\/invite_replies\.js\?v=[^"]+"><\/script>/.test(html));
  check('0. INV.replyPick、INV.replyMark、INV.REPLY_ON、INV.REPLY_COND',typeof INV.replyPick==='function'&&typeof INV.replyMark==='function'&&!!INV.REPLY_ON&&!!INV.REPLY_COND);
  check('0. 節日、外出、開車先關（AA_415 第 8 節：D38 節日系統、外出的邀約接上才用）',INV.REPLY_ON['節日']===false&&INV.REPLY_ON['外出']===false&&INV.REPLY_ON['開車']===false);
  const A=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files.filter(e=>e.path===SPEC);
  check('0. 白名單：AA_415@b113e39d approved、AA-B 2026-10-23 20:2x 定稿（D109）、D14-T9、text',A.length===1&&A[0].sha==='b113e39d'&&A[0].status==='approved'&&A[0].approvedBy==='AA-B 2026-10-23 20:2x 定稿（D109）'&&A[0].task==='D14-T9'&&A[0].kind==='text',J(A));
  check('0. 產生器 tools/invite/build_replies.py；資料檔寫著來源 commit',fs.existsSync(path.join(H.ROOT,'tools/invite/build_replies.py'))&&INVITE_REPLIES.sha==='b113e39d'&&INVITE_REPLIES.src===SPEC); });
if(!ok){ H.done(); return; }

await sec(1,()=>{ let md=''; try{ md=cp.execSync('git -C "'+H.ROOT+'" show b113e39d:"'+SPEC+'"',{encoding:'utf8'}); }catch(e){ md=''; }
  check('1. 讀得到企劃線 b113e39d 的 AA_415',md.length>1000);
  const cnt={}; let who=null;
  for(const ln of md.split('\n')){ const m=/^## \d+\. .*（(\w+)[，）]/.exec(ln); if(m){ who=m[1]; continue; } if(/^## /.test(ln)){ who=null; continue; }
    if(who&&ln.startsWith('|')&&!/^\|\s*階段\s*\|/.test(ln)&&!/^\|[-\s|:]+\|$/.test(ln)) cnt[who]=(cnt[who]||0)+1; }
  const WANT={heroine_01:36,heroine_02:38,heroine_03:32,heroine_04:37,heroine_05:34,classmate_peishan:32,kexin:38};
  for(const id of IDS){ const n=new Set(ROWS(id).map(r=>r.n)).size;
    check('1. '+NM[id]+'：表上 '+WANT[id]+' 列＝資料 '+n+' 列（企劃線算出來 '+cnt[id]+'）',n===WANT[id]&&cnt[id]===WANT[id]); }
  const bad=[]; for(const id of IDS) for(const r of ROWS(id)){ if(!md.includes(r.say)) bad.push(r.id+' say'); if(r.ex==='rule'||r.ex==='plan') continue; for(const x of r.lines){ const s=typeof x==='string'?x:x.me; if(!r.say.includes(s)) bad.push(r.id+' '+s); } }
  check('1. 每一列的原文、台詞都在 AA_415 裡一字不差',!bad.length,bad.slice(0,6).join('、'));
  const has=(id,s)=>ROWS(id).some(r=>r.lines.some(x=>x===s));
  const SPOT=[['heroine_01','「好。我帶商法的書，你念你的。」'],['heroine_01','「考試週？好。各念各的，坐同一張桌子。」'],['heroine_02','「好。你決定地方。我負責記得我們去過哪裡。」'],['heroine_02','（她把吧檯又擦了一遍，才回你。）'],
    ['heroine_03','（她只回一個字，可是三秒就回了。）'],['heroine_03','「週四是我的。……分你。」'],['heroine_04','「好。……我為什麼在緊張。」'],['heroine_04','「今天不想出門。……不是你的問題，是我的被子。」'],
    ['heroine_05','「好。今天計畫本那一格，剛好是空的。」'],['heroine_05','「好。研究室九點關燈。九點十分，樓下。」'],['classmate_peishan','「好啊！！幾點？」'],['classmate_peishan','「讀書會。九點以後可以。」'],
    ['kexin','「那天你敢排別的試試看。……好。」'],['kexin','「好。予樂說我不應該答應。我答應了。」']];
  const miss=SPOT.filter(([id,s])=>!has(id,s)); check('1. 抽查 14 句（七位各兩句）一字不差',!miss.length,J(miss));
  const exBad=[]; for(const id of IDS) for(const r of ROWS(id)){ if(r.ex!=='acc'&&r.ex!=='first') continue; const p=INVITE_DATA.people[id]||{}, pid=r.tags.find(t=>INV.place(t));
    const v=r.ex==='first'?(p.first||{})[pid]:(p.acc||{})[pid], want=Array.isArray(v)?v:(v&&v[r.band]); if(J(want)!==J(r.lines)) exBad.push(r.id); }
  check('1. 「現有」的答應句（acc、first）和 INVITE_DATA.people 一樣',!exBad.length,exBad.join('、'));
  const all=id=>ROWS(id).map(r=>r.say).join('');
  check('1. 學姊：沒有件數、編號、「重點是」',!/重點是|三件事|一件事：|三選一|第[一二三]件/.test(all('heroine_05')));
  check('1. 子晴：沒有「欸不是」「這不是問句」',!/欸不是|這不是問句/.test(all('heroine_04')));
  check('1. 可昕：沒有「假設」；全體沒有「騙你的」「我是說」',!/假設/.test(all('kexin'))&&!IDS.some(id=>/騙你的|我是說/.test(all(id))));
  const tags=new Set(['cafe','library','noodle','wenzhou','brunch','teahouse','第一次','來過','外出','開車','晚上','考試週','節日','大一','大二起']);
  const unk=[], noC=[]; for(const id of IDS) for(const r of ROWS(id)){ r.tags.forEach(t=>{ if(!tags.has(t)) unk.push(r.id+':'+t); }); if(r.cond&&!r.off&&!INV.REPLY_COND[r.cond]) noC.push(r.id+':'+r.cond); }
  check('1. 標籤都認得、條件都接得上（接不上的有 off）',!unk.length&&!noC.length,J(unk.concat(noC)));
  const offs=IDS.map(id=>NM[id]+' off '+ROWS(id).filter(r=>r.off).length+'（'+ROWS(id).filter(r=>r.off&&!/^現有/.test(r.off)).map(r=>r.id).join(',')+'）').join('；');
  check('1. 不出現的列：here、rule、partnerSay 照原本的程式；以安「家教的時間」、外出的「看電影」「第二次外出」',ROWS('heroine_01').find(r=>r.cond==='家教的時間').off&&ROWS('heroine_05').find(r=>r.cond==='第二次外出').off,offs); });

await sec(2,()=>{ const COMBO=[['cafe',15.5],['library',15.5],['noodle',15.5],['wenzhou',15.5],['cafe',12+10/60],['noodle',12+10/60],['library',12+10/60],['cafe',17.5],['noodle',17.5]];
  for(const id of IDS){ const res=[];
    for(const s of [1,2,3,4,5,6,'d']){ let got=null;
      for(const key of (id==='kexin'?(s==='d'?['2026-03-11']:['2025-03-12']):['2026-03-14','2026-03-11','2026-03-12'])){ for(const [pid,hh] of COMBO){
        fresh(key,id,s,{econ:id==='kexin'&&s!=='d'}); const n=INV.replyStage(H.G,id); const P=INV.place(pid);
        const r=id==='kexin'?INV.personal(H.G,id,P,H.G.day,hh,{res:'accept'}):ask(id,pid,hh); if(r.res!=='accept'||!r.lines) continue; const row=rowOf(id,r.lines); if(!row||row.off) continue;
        got={n,row,pid,hh,key}; break; } if(got) break; }
      const want=s==='d'?7:s, lab=s==='d'?'交往中':String(s); res.push(s+':'+(got?got.row.id+'('+got.pid+')':'—'));
      check('2. '+NM[id]+' 第 '+(s==='d'?'交往中':s+' 階')+'：答應句來自那一階（'+(got?got.row.id+' 「'+txt(got.row.lines).slice(0,18)+'」':'找不到')+'）',!!got&&got.n===want&&inSt(got.row,want));
      if(!got) continue; const more=[got.row]; for(let i=0;i<3;i++){ const P=INV.place(got.pid), r=id==='kexin'?INV.personal(H.G,id,P,H.G.day,got.hh,{res:'accept'}):ask(id,got.pid,got.hh); more.push(rowOf(id,r.lines||[])); }
      check('2. '+NM[id]+' 第 '+(s==='d'?'交往中':s+' 階')+'：再約三次，有表上寫「'+lab+'」的句子、沒有低兩階以上的',more.some(r=>r&&r.stage.replace(/（.*）/,'')===lab)&&more.every(r=>r&&r.st[1]>=want-1),more.map(r=>r?r.id:'—').join(',')); } } });

await sec(3,()=>{ for(const [id,after,key] of [['heroine_04','「好。今天我要看那隻橘貓還在不在。」','2026-03-14'],['classmate_peishan','「好啊！今天我少問一點問題。」','2026-03-11']]){   /* 沛珊 3/14 週末回台中 */
    fresh(key,id,3); const r1=ask(id,'wenzhou',15.5);
    check('3. '+NM[id]+' 第 3 階第一次約溫州街：照現有的 first（第一次優先）',r1.res==='accept'&&J(r1.lines)===J(INVITE_DATA.people[id].first.wenzhou),txt(r1.lines));
    doneIv(id,'wenzhou'); const r2=ask(id,'wenzhou',15.5);
    check('3. '+NM[id]+' 去過以後第二次：換一句、不是第一次的那句',r2.res==='accept'&&txt(r2.lines)!==txt(r1.lines)&&txt(r2.lines)===after,txt(r2.lines)); }
  fresh('2026-03-11','heroine_02',2); const seen=[]; for(let i=0;i<6;i++) seen.push(txt(ask('heroine_02','cafe',15.5).lines));
  check('3. 芷若第 2 階約 Café：沒去過不說「你上次那杯」',!seen.includes('「好。你上次那杯，今天換一杯試試？」'),J(seen));
  doneIv('heroine_02','cafe'); const seen2=[]; for(let i=0;i<3;i++) seen2.push(txt(ask('heroine_02','cafe',15.5).lines));
  check('3. 去過以後三次裡有「你上次那杯」',seen2.includes('「好。你上次那杯，今天換一杯試試？」'),J(seen2));
  fresh('2026-03-14','heroine_05',3); const b1=ask('heroine_05','brunch',10);
  check('3. 學姊第 3 階第一次約半熟：不說「這次我點鬆餅」（表上要「來過」；原本的 acc 也不繞回來）',b1.res==='accept'&&txt(b1.lines)!=='「好。……這次我點鬆餅。」',b1.res+' '+txt(b1.lines));
  doneIv('heroine_05','brunch'); const b2=ask('heroine_05','brunch',10);
  check('3. 去過半熟以後：「好。……這次我點鬆餅。」',txt(b2.lines)==='「好。……這次我點鬆餅。」',txt(b2.lines)); });

await sec(4,()=>{ fresh('2026-03-11','heroine_01',3); const n1=ask('heroine_01','cafe',19);
  check('4. 以安第 3 階 19:00 約 Café：「好。十點前結束。我十一點要睡。」（晚上）',txt(n1.lines)==='「好。十點前結束。我十一點要睡。」',txt(n1.lines));
  fresh('2026-03-11','heroine_01',3); const d1=ask('heroine_01','cafe',15.5);
  check('4. 下午 15:30：不說晚上那句',d1.res==='accept'&&txt(d1.lines)!=='「好。十點前結束。我十一點要睡。」',txt(d1.lines));
  fresh('2026-04-14','heroine_01',4); const e1=ask('heroine_01','library',15.5);
  check('4. 以安第 4 階期中考週（4/14，第 8 週）約總圖：「考試週？……一個小時。……」',CALENDAR.termOf(H.G.day).exam==='mid'&&txt(e1.lines)==='「考試週？……一個小時。一個小時以後各自回去念。」',txt(e1.lines));
  fresh('2026-03-10','heroine_01',4); const e2=ask('heroine_01','library',15.5);
  check('4. 不是考試週（3/10）：一般那句「好。你決定地方，我決定幾點。」',txt(e2.lines)==='「好。你決定地方，我決定幾點。」',txt(e2.lines));
  fresh('2026-06-09','classmate_peishan',4); const e3=ask('classmate_peishan','library',15.5);
  check('4. 沛珊第 4 階期末考週（6/9，第 16 週）約總圖：「考試週？好。我們互問，問到會為止。」',CALENDAR.termOf(H.G.day).exam==='final'&&txt(e3.lines)==='「考試週？好。我們互問，問到會為止。」',e3.res+' '+txt(e3.lines));
  fresh('2026-03-14','heroine_04','d'); const z1=ask('heroine_04','cafe',21);
  check('4. 子晴交往中 21:00：「好。十一點以後我最清醒。」',txt(z1.lines)==='「好。十一點以後我最清醒。」',z1.res+' '+txt(z1.lines)); });

await sec(5,()=>{ /* [階段, 地點, 時間, 那一階合用的句子有沒有三句以上（有＝前三次三句都不一樣）, 日期] */
  const PLAN=[['heroine_01',[[2,'cafe',15.5,true],[5,'noodle',15.5,false],[4,'cafe',19,true,'2026-03-11']]],['heroine_02',[[2,'cafe',15.5,true],['d','noodle',15.5,false]]],
    ['heroine_03',[[2,'library',15.5,false],[4,'noodle',19,true],[6,'library',15.5,false]]],['heroine_04',[[2,'cafe',15.5,true],[4,'noodle',19,true]]],
    ['heroine_05',[[4,'noodle',19,true],[6,'noodle',19,false]]],['classmate_peishan',[[3,'cafe',15.5,false,'2026-03-11'],[4,'cafe',19,true,'2026-03-11'],['d','cafe',19,true,'2026-03-11']]],
    ['kexin',[[2,'cafe',15.5,false],['d','cafe',15.5,true,'2026-04-14']]]];
  for(const [id,L] of PLAN) for(const [s,pid,hh,three,key] of L){ fresh(key||(id==='kexin'&&s!=='d'?'2025-03-12':'2026-03-14'),id,s,{econ:id==='kexin'&&s!=='d'}); const out=[];
    for(let i=0;i<10;i++){ const r=id==='kexin'?INV.personal(H.G,id,INV.place(pid),H.G.day,hh,{res:'accept'}):ask(id,pid,hh); out.push(txt(r.lines)); }
    const rep=out.findIndex((t,i)=>i>0&&t===out[i-1]), n3=new Set(out.slice(0,3)).size;
    check('5. '+NM[id]+' 第 '+(s==='d'?'交往中':s+' 階')+'連約 '+pid+' '+hh+' 10 次：都有台詞、沒有連續兩次同一句'+(three?'、前三次三句都不一樣':''),out.every(t=>t)&&rep<0&&(!three||n3===3),J(out.slice(0,4))+'…'); } });

await sec(6,()=>{ fresh('2026-03-10','classmate_peishan',3); const out=[];
  for(let i=0;i<4;i++){ const r=ask('classmate_peishan','cafe',12+10/60); out.push({t:txt(r.lines),res:r.res,alt:r.alt}); }
  check('6. 沛珊 12:10 在上課：改天（busy）四次輪流、沒有連續兩次同一句',out.every(o=>o.res==='resched'&&o.t)&&out.every((o,i)=>!i||o.t!==out[i-1].t),J(out.map(o=>o.t)));
  const g=out.find(o=>o.t==='「讀書會。九點以後可以。」'), m=out.find(o=>o.t==='「今天要寫心得。明天？」');
  check('6. 「讀書會。九點以後可以。」＝同一天 21:00 以後；「今天要寫心得。明天？」＝明天',!!g&&g.alt.day===H.G.day&&g.alt.h>=21&&!!m&&m.alt.day===H.G.day+1,J([g&&g.alt,m&&m.alt]));
  fresh('2026-03-10','heroine_04',3); const zq=[]; for(let i=0;i<3;i++){ const r=ask('heroine_04','cafe',15.5,null,{res:'resched',why:'booked',alt:{day:H.G.day,h:17.5}}); zq.push({t:txt(r.lines),alt:r.alt}); }
  check('6. 子晴和別人約了（booked）：改天兩句輪流（「今天不行。明天。……」「在趕作業。明天。」），改天的時間是明天',zq.every((o,i)=>o.t&&(!i||o.t!==zq[i-1].t))&&zq.every(o=>o.alt&&o.alt.day===H.G.day+1),J(zq));
  /* 婉拒（階段還不到 rel）：節日沒打開時每人只有一句一般的（外出、節日的列等接上），打開節日（3/14）以安輪流兩句 */
  fresh('2026-03-14','heroine_01',1); const d1=ask('heroine_01','noodle',15.5);
  check('6. 以安第 1 階約吃飯（rel）：她自己婉拒「今天不行。我想一個人念。」',d1.res==='decline'&&d1.why==='rel'&&txt(d1.lines)==='「今天不行。我想一個人念。」',d1.res+'/'+d1.why+' '+txt(d1.lines));
  INV.REPLY_ON['節日']=true; try{ fresh('2026-03-14','heroine_01',1); const dd=[]; for(let i=0;i<4;i++) dd.push(txt(ask('heroine_01','noodle',15.5).lines));
    check('6. 打開節日（3/14）：婉拒兩句輪流（節日那句先）',dd[0]==='「那天我排了讀書會。不是藉口，是真的排了。」'&&dd[1]==='「今天不行。我想一個人念。」'&&dd.every((t,i)=>!i||t!==dd[i-1]),J(dd)); } finally { INV.REPLY_ON['節日']=false; } });

await sec(7,()=>{ fresh('2026-03-10','heroine_03',3); const y1=ask('heroine_03','noodle',19), y2=ask('heroine_03','cafe',19), y3=ask('heroine_03','noodle',19);
  check('7. 語彤週二晚上：約麵店＝「我就在店裡。你來。」（兩次都一樣）、約別的＝「麵店。」「你來店裡就好。」',y1.res==='here'&&txt(y1.lines)==='「我就在店裡。你來。」'&&txt(y3.lines)==='「我就在店裡。你來。」'&&y2.res==='decline'&&txt(y2.lines)==='「麵店。」「你來店裡就好。」',[y1.res,txt(y1.lines),y2.res,txt(y2.lines)].join(' '));
  fresh('2026-01-14','heroine_05',3); const s1=ask('heroine_05','wenzhou',15.5,null,{res:'accept'});
  check('7. 學姊筆試（2026-02-02）以前約散步：「散步的話，等我考完。」「週三晚上我在法圖。……」',s1.res==='decline'&&txt(s1.lines)==='「散步的話，等我考完。」「週三晚上我在法圖。要讀書的話，可以一起。」',txt(s1.lines));
  fresh('2028-10-11','heroine_04',3); const q1=ask('heroine_04','library',15.5,null,{res:'accept'});
  check('7. 子晴大四約總圖：「我畢業了啦。總圖要辦校友證，我還沒辦。……兩點半？」',q1.res==='decline'&&txt(q1.lines)==='「我畢業了啦。總圖要辦校友證，我還沒辦。……兩點半？」',q1.res+' '+txt(q1.lines));
  fresh('2027-03-10','classmate_peishan',3); const p1=ask('classmate_peishan','brunch',10);   /* AA_255 (b-1) 第 20 條：消失期約她一律沒有回覆、不顯示她的句子（原本「我在念書。……考完再去。你先幫我記住菜單。」）*/
  check('7. 沛珊大二下（消失期）約半熟：沒有她的句子，系統「沒有回覆。」（AA_255 (b-1) 第 20 條）',p1.res==='decline'&&p1.why==='away'&&!p1.lines&&/沒有回覆。$/.test(INV.reply(H.G,'classmate_peishan','brunch',p1)),JSON.stringify(p1));
  fresh('2025-10-14','heroine_01',3); const a1=ask('heroine_01','wenzhou',15.5,null,{res:'accept'});
  check('7. 以安大一約散步：rule 的「散步的目的是？」祐廷「沒有目的。」……（改天）',a1.res==='resched'&&txt(a1.lines)==='「散步的目的是？」「沒有目的。」「……好。我在手帳排一個『沒有目的』的時段。」',a1.res+' '+txt(a1.lines));
  fresh('2026-03-10','heroine_01',3); const h1=ask('heroine_01','library',9), h2=ask('heroine_01','library',9);
  check('7. 以安早上在總圖（作息）：here「我本來就在總圖。二樓靠窗。」（照舊，兩次一樣）',h1.res==='here'&&txt(h1.lines)==='「我本來就在總圖。二樓靠窗。」'&&txt(h2.lines)===txt(h1.lines),h1.res+' '+txt(h1.lines));
  fresh('2026-03-10','heroine_02',3); const c1=ask('heroine_02','cafe',19);
  check('7. 芷若週二晚上上班：here「我會在 Café 啊，你直接過來，我幫你做一杯。」（BB_172 Z16；AA_415 沒有這一格）',c1.res==='here'&&txt(c1.lines)==='「我會在 Café 啊，你直接過來，我幫你做一杯。」',c1.res+' '+txt(c1.lines));
  fresh('2026-03-10','zhe',3); const z1=ask('zhe','noodle',12+10/60), z2=ask('zhe','noodle',17.5);
  check('7. 阿哲（沒有 AA_415 的表）：照舊同一句「好啊！那家的乾麵我可以吃兩碗。」（AA_194 第 4 節）、不記 G.invReply',txt(z1.lines)==='「好啊！那家的乾麵我可以吃兩碗。」'&&txt(z2.lines)==='「好啊！那家的乾麵我可以吃兩碗。」'&&!(H.G.invReply&&H.G.invReply.zhe),txt(z1.lines)+' '+txt(z2.lines));
  const keep=globalThis.INVITE_REPLIES; globalThis.INVITE_REPLIES=undefined;
  try{ fresh('2026-03-11','heroine_01',2); const o1=ask('heroine_01','cafe',15.5), o2=ask('heroine_01','cafe',17.5);
    check('7. 沒有資料檔：照原本 INVITE_DATA（以安有點熟約 Café 兩次都是「可以。條件：……」）',txt(o1.lines)==='「可以。條件：我會帶東西來寫。」'&&txt(o2.lines)==='「可以。條件：我會帶東西來寫。」'); }
  finally { globalThis.INVITE_REPLIES=keep; } });

await sec(8,()=>{ fresh('2026-03-11','heroine_01',2); delete H.G.invReply; const r1=ask('heroine_01','cafe',15.5);
  const m=H.G.invReply&&H.G.invReply.heroine_01;
  check('8. 舊存檔沒有 G.invReply：照樣選句，建一個 {h, u, n}',!!r1.lines&&!!m&&Array.isArray(m.h)&&m.h.length===1&&m.n===1&&m.u[m.h[0]]===1,J(H.G.invReply));
  ask('heroine_01','cafe',15.5); ask('heroine_01','cafe',15.5); check('8. h 只留最近兩句',H.G.invReply.heroine_01.h.length===2&&H.G.invReply.heroine_01.n===3);
  const G2=JSON.parse(JSON.stringify(H.G)); check('8. JSON 來回一樣',J(G2.invReply)===J(H.G.invReply));
  H.G.invReply='壞掉'; let okk=true; try{ ask('heroine_01','cafe',15.5); }catch(e){ okk=false; } check('8. G.invReply 壞掉：重建、不丟例外',okk&&typeof H.G.invReply==='object'&&H.G.invReply.heroine_01.n===1);
  H.G.invReply={heroine_01:{h:'x',u:null}}; okk=true; try{ ask('heroine_01','cafe',15.5); }catch(e){ okk=false; } check('8. 某一位的紀錄壞掉：補好',okk&&Array.isArray(H.G.invReply.heroine_01.h)); });

await sec(9,()=>{ fresh('2026-03-14');
  const F=(id,k)=>INV.replyFestival(H.G,id,D(k));
  check('9. 節日：2/14、3/14、七夕（2026-08-19）、12/24、12/25；2/15 不是',F('heroine_01','2026-02-14')&&F('heroine_01','2026-03-14')&&F('heroine_01','2026-08-19')&&F('heroine_01','2026-12-24')&&F('heroine_01','2026-12-25')&&!F('heroine_01','2026-02-15'));
  check('9. 她的生日（msg2_pool.js）：以安 9/15 是、芷若 9/15 不是；可昕 4/24',F('heroine_01','2026-09-15')&&!F('heroine_02','2026-09-15')&&F('kexin','2027-04-24'));
  const fest=['「你知道那天是什麼日子。」「……好。我不排別的。」','「那天我本來要讀書。」「……改了。」'];
  fresh('2026-03-14','heroine_01',6); const o=[]; for(let i=0;i<4;i++) o.push(txt(ask('heroine_01','cafe',15.5).lines));
  check('9. REPLY_ON 關著（AA_415 第 8 節）：3/14 第 6 階也不說節日的句子',!o.some(t=>fest.includes(t)),J(o));
  INV.REPLY_ON['節日']=true; try{ fresh('2026-03-14','heroine_01',6); const a=txt(ask('heroine_01','cafe',15.5).lines), b=txt(ask('heroine_01','cafe',15.5).lines);
    check('9. 打開以後：3/14 第 6 階先說節日的兩句（節日最優先、輪流）',fest.includes(a)&&fest.includes(b)&&a!==b,a+' / '+b);
    fresh('2026-03-13','heroine_01',6); const c=txt(ask('heroine_01','cafe',15.5).lines); check('9. 前一天（3/13）不是節日',!fest.includes(c),c); }
  finally { INV.REPLY_ON['節日']=false; } });

await sec(10,()=>{ fresh('2025-03-12','kexin',1,{econ:true}); const k1=INV.personal(H.G,'kexin',INV.place('library'),H.G.day,15.5,{res:'accept'});
  check('10. 可昕經濟系那一年第 1 階約總圖：「總圖？好。……你是會計課坐我斜前面的那個？」',txt(k1.lines)==='「總圖？好。……你是會計課坐我斜前面的那個？」',txt(k1.lines));
  fresh('2026-03-11','kexin','d'); const k2=INV.personal(H.G,'kexin',INV.place('cafe'),H.G.day,15.5,{res:'accept'});
  check('10. 法律系交往中約 Café：「首都帝大的 Café？好。我要坐你平常坐的那張。」',txt(k2.lines)==='「首都帝大的 Café？好。我要坐你平常坐的那張。」',txt(k2.lines));
  fresh('2026-03-11','kexin',6); H.G.flags.EX_kexin=true; const st=INV.replyStage(H.G,'kexin'); const ex=[]; for(let i=0;i<4;i++) ex.push(INV.personal(H.G,'kexin',INV.place('cafe'),H.G.day,19,{res:'accept'}));
  const rows=ex.map(r=>rowOf('kexin',r.lines));
  check('10. 分開以後：最多第 4 階、只用「4（分開以後）」的句子（沒有交往中、第 5、6 階）',st===4&&rows.every(r=>r&&r.apart&&r.st[0]===4),st+' '+J(ex.map(r=>txt(r.lines))));
  fresh('2025-03-12','kexin','d',{econ:true}); const k3=INV.personal(H.G,'kexin',INV.place('cafe'),H.G.day,15.5,{res:'accept'});
  check('10. 經濟系那一年交往中：7-1 沒有交往中的句子＝不用表（不會說「你終於約了」）',!rowOf('kexin',k3.lines||[]),txt(k3.lines));
  fresh('2026-03-11','kexin',3); const k4=INV.personal(H.G,'kexin',INV.place('cafe'),H.G.day,15.5,{res:'accept'});
  check('10. 法律系沒交往、沒分開：7-2 沒有句子',!rowOf('kexin',k4.lines||[]),txt(k4.lines)); });

await sec(11,()=>{ fresh('2027-12-23','heroine_03','d'); const y1=ask('heroine_03','cafe',15.5);
  check('11. 語彤交往中、續約以後（事件 13 以後）的週四：「週四是我的。……分你。」',H.G.weekday===4&&txt(y1.lines)==='「週四是我的。……分你。」',y1.res+' '+txt(y1.lines));
  fresh('2027-12-09','heroine_03','d'); const y2=ask('heroine_03','cafe',15.5);
  check('11. 續約以前的週四（今天）：「今天我在店裡。你來吃麵，我收完店再陪你。」',txt(y2.lines)==='「今天我在店裡。你來吃麵，我收完店再陪你。」',y2.res+' '+txt(y2.lines));
  fresh('2027-12-08','heroine_03','d'); const y3=ask('heroine_03','cafe',15.5,H.G.day+1);
  check('11. 前一天約明天（週四）：不說「今天我在店裡」',txt(y3.lines)!=='「今天我在店裡。你來吃麵，我收完店再陪你。」',txt(y3.lines));
  fresh('2026-03-14','heroine_02','d'); const z1=ask('heroine_02','noodle',12+10/60);
  check('11. 芷若交往中週六：「好。週六我本來就沒班。……整天都是你的。」',txt(z1.lines)==='「好。週六我本來就沒班。……整天都是你的。」',z1.res+' '+txt(z1.lines));
  fresh('2026-03-15','heroine_02','d'); const zz=[]; for(let i=0;i<4;i++) zz.push(txt(ask('heroine_02','noodle',12+10/60).lines));
  check('11. 週日：不說「週六我本來就沒班」、不說「週六不去溫州街了」',!zz.includes('「好。週六我本來就沒班。……整天都是你的。」')&&!zz.includes('「好。週六不去溫州街了。改去你說的地方。」'),J(zz));
  fresh('2026-03-14','heroine_04','d'); doneIv('heroine_04','cafe',H.G.day-1); const q1=ask('heroine_04','cafe',15.5);
  check('11. 子晴交往中、昨天約過：「你昨天才約過。……好啦。今天也要。」',txt(q1.lines)==='「你昨天才約過。……好啦。今天也要。」',txt(q1.lines));
  fresh('2029-05-24','heroine_05',4); const s1=ask('heroine_05','cafe',15.5,null,{res:'resched',why:'booked',alt:{day:H.G.day,h:17.5}});
  check('11. 學姊口試（5/29）前一週改天：「這週不行。不是不想。」，改到下週一以後',txt(s1.lines)==='「這週不行。不是不想。」'&&!!s1.alt&&s1.alt.day>=D('2029-05-28')&&CALENDAR.dateOf(s1.alt.day).wd===1,txt(s1.lines)+' '+J(s1.alt));
  fresh('2025-09-23','heroine_01',3); const p1=ask('heroine_01','noodle',12+10/60,null,{res:'resched',why:'booked',alt:{day:H.G.day,h:17.5}});
  fresh('2025-11-25','heroine_01',3); const p2=ask('heroine_01','noodle',12+10/60,null,{res:'resched',why:'booked',alt:{day:H.G.day,h:17.5}});
  check('11. 以安改天（現有 plan）：大一上第 10 週以前「一起寫憲法作業」、以後「讀書會的事」',txt(p1.lines)==='「我跟 Alison 約了一起寫憲法作業。{明天？}」'&&txt(p2.lines)==='「我跟 Alison 約了讀書會的事。{明天？}」',txt(p1.lines)+' / '+txt(p2.lines));
  fresh('2026-03-11','heroine_02',3); const w1=ask('heroine_02','library',15.5,null,{res:'resched',why:'busy',act:'barista',alt:{day:H.G.day+1,h:15.5}});
  const w2=ask('heroine_02','library',15.5,null,{res:'resched',why:'busy',act:'class',alt:{day:H.G.day+1,h:15.5}});
  check('11. 芷若改天：在 Café 上班＝「我在上班。十點下班，總圖也十點關。……」；在上課（不是上班）＝不說「我在上班」（旁白）',txt(w1.lines)==='「我在上班。十點下班，總圖也十點關。……你自己加油。」'&&!w2.lines,txt(w1.lines)+' / '+txt(w2.lines)); });

await sec(12,async()=>{ fresh('2026-03-11','heroine_01',2); H.G.hour=9; H.said=[]; H.picks=['去兩點半 Café 坐坐','今天 15:30'];
  await INV.flow(GM,'heroine_01',null,false); const a=H.said.map(s=>s.t);
  H.said=[]; H.picks=['去兩點半 Café 坐坐','今天 17:30']; await INV.flow(GM,'heroine_01',null,false); const b=H.said.map(s=>s.t);
  const la=a.find(t=>/^「/.test(t)), lb=b.find(t=>/^「/.test(t));
  check('12. 手機約以安兩次 Café：念的是表上的句子、兩次不一樣',!!la&&!!lb&&!!rowOf('heroine_01',[la])&&!!rowOf('heroine_01',[lb])&&la!==lb,la+' / '+lb); });

H.done();
})();
