// AA_469 長期輪流的短句（企劃線 9f465dcef，AA-B 2026-10-25 16:2x）——不需要瀏覽器。台詞逐字對 AA_469（從企劃線讀稿、解析表格與條列）。
//   0 讀稿（第 1 節四句＋「還好嗎」、2-1 第二輪八列＋第三輪三句、2-2 三句、2-3 三句、第 3 節三列各四句）；STORY.NDL_PINGS／NDL_OK、FAFU_OPEN／FAFU_BACK／FAFU_LOG／FAFU_YT、
//     WZ_JOBS_DATA 的 withLines（Café、書店）、night 照稿；原本的句子都還在、在前面；BB 查過的 FAFU_CASES 一字不動（對 c7d701caf 的原始碼）
//   1 阿哲揪麵店：八句照順序輪（輪完回第一句）；連續揪三次你都沒來＝下一個麵店日「你最近都沒來 還好嗎」，之後不揪（換學期也不揪）；去了一次麵店從頭算；
//     「還好嗎」一學期最多一次（同一學期第二次連三次沒來＝安靜停）；舊存檔（沒有 ndlMiss）照手機裡連續揪過幾次接著算、照 ndlPingN 接著輪
//   2 法服值班：開場六句照順序各一次、用完不說；民眾第一輪八件（照舊問「你先問什麼？」）→ 第二輪同一批人回來講後續（不問）→ 第三輪起一句旁白三句輪；
//     語彤六句照順序各一次、用完不說（暫時打開 YT_FAFU 測）；舊存檔 FAFU_ROT 照原本的次數接著算、缺欄位不壞
//   3 打工的收尾：Café 芷若、書店沛珊、便利商店夜班最後一句，六句照順序輪（實際上班）；舊存檔 withN／nightN 接著輪
// 修改前（c7d701caf）：0～3 每一節至少一項 FAIL。用法：node tests/aa469_rot_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H, J=JSON.stringify;
global.SISY23=global.SISY23||{preTalk:async()=>false};
const loadErr=[];
const L3=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)){ loadErr.push(f+'：沒有這個檔'); return false; } try{ let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(WZS|EAT|EAT_LINES|JOBS|WZ_JOBS_DATA|WZ_SHOPS_LAYOUT|WZ_PARK_LAYOUT|PARK|WZ_EVENTS|WZL|Y2B_EVENTS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); return true; }catch(e){ loadErr.push(f+'：'+e.message); return false; } };
for(const f of ['src/data/wz_park_layout.js','src/wzpark3d.js','src/data/wz_shops_layout.js','src/data/eat_lines.js','src/eat3d.js','src/wzshops3d.js','src/data/y2b_events.js','src/data/wz_jobs.js','src/jobs3d.js','src/data/wz_events.js','src/wzlines3d.js']) L3(f);   /* 照 aa431_jobs_unit.js、aa433_jobs_unit.js 載的檔 */
const toasts=[]; GM.toast=t=>{ toasts.push(t); }; GM.caption=()=>{}; GM.money=d=>{ H.G.money=(H.G.money|0)+d; };
const D=k=>STORY.dayOfKey(k), keyOf=d=>CALENDAR.dateOf(d).key, wdOf=d=>CALENDAR.dateOf(d).wd%7, TD=(t,w,wd)=>STORY.termDay(t,w,wd);
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const at=(d,h,zone)=>{ const G=H.G; G.day=d; G.hour=h; G.weekday=wdOf(d); if(zone) G.zone=zone; };
const BASE={introDone:true,afternoonDone:true,classDone:true,metAn:true,MET_ZHE:true};
const fresh=(k,h,zone,flags)=>{ const G=H.fresh(typeof k==='number'?keyOf(k):k,h,zone||'dorm',Object.assign({},BASE,flags||{})); G.outings=[]; G.acts={att:{}}; G.contacts=G.contacts||{}; PHONE.rec(G); toasts.length=0; return G; };

/* ---- 讀稿（企劃線 9f465dcef）---- */
let doc=''; try{ doc=cp.execSync('git'+' show 9f465dcef:"docs/story_planning/AA_469_長期輪流的短句_阿哲揪麵店_法服值班_打工收尾.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc=''; }
let base=''; try{ base=cp.execSync('git'+' show c7d701caf:src/story3d.js',{cwd:H.ROOT,encoding:'utf8',maxBuffer:64<<20}); }catch(e){ base=''; }   /* 修改前的原始碼：原本的句子、BB 查過的 FAFU_CASES */
const part=(a,b)=>{ const i=doc.indexOf(a); if(i<0) return ''; const j=b?doc.indexOf(b,i+1):-1; return doc.slice(i,j<0?doc.length:j); };
const rows=t=>t.split('\n').filter(l=>/^\|/.test(l.trim())&&!/^\|\s*-/.test(l.trim())).map(l=>l.trim().replace(/^\||\|$/g,'').split('|').map(c=>c.trim()));
const sub=(t,ind)=>t.split('\n').filter(l=>l.startsWith(ind+'- ')&&!l.startsWith(ind+' ')).map(l=>l.slice(ind.length+2).trim());
const sp=q=>{ const i=q.indexOf('：'); return [q.slice(0,i),q.slice(i+1)]; };
const P1=part('## 1.','## 2.'), NEW_P=sub(part('**加四句**','2. **連續'),'     '), OKQ=(P1.match(/> 阿哲：(.+)/)||[])[1];
const T21=rows(part('### 2-1','- **第三輪起**')).filter(r=>r.length>=2&&r[0]!=='第一輪的人').map(r=>r[1].split('／').map(sp));
const LOG=sub(part('- **第三輪起**','- 第二輪的句子'),'  ');
const OPEN3=sub(part('### 2-2','### 2-3'),'  ').map(sp), YT3=sub(part('### 2-3','- 口氣照她'),'  ');
const T3={}; for(const r of rows(part('## 3.','## 4.'))){ const k=/^Café/.test(r[0])?'cafe':/^書店/.test(r[0])?'books':/^便利商店/.test(r[0])?'cvs':null; if(k) T3[k]=r[1].split('／'); }
const arr=(src,name)=>{ const m=src.match(new RegExp('(?:const |S\\.)'+name+'=(\\[[^;]*?\\]);')); if(!m) return null; try{ return vm.runInNewContext(m[1]); }catch(e){ return null; } };
const OLD={P:arr(base,'NDL_PINGS'),OPEN:arr(base,'FAFU_OPEN'),YT:arr(base,'FAFU_YT'),CASES:(base.match(/S\.FAFU_CASES=\[[\s\S]*?\]\];/)||[''])[0]};

(async()=>{
/* ---- 0 讀稿、資料照稿 ---- */
await sec(0,()=>{
  check('0. 讀得到稿、修改前的原始碼；打工的檔載得到',!!doc&&!!base&&!loadErr.length&&typeof WZ_JOBS_DATA!=='undefined'&&typeof JOBS!=='undefined',J(loadErr));
  check('0. 稿裡的都讀得到（第 1 節四句＋「還好嗎」、2-1 八列各三句＋第三輪三句、2-2 三句、2-3 三句、第 3 節三列各四句）',NEW_P.length===4&&!!OKQ&&T21.length===8&&T21.every(r=>r.length===3&&r[0][0]==='旁白'&&r[1][0]==='民眾')&&LOG.length===3&&OPEN3.length===3&&YT3.length===3&&['cafe','books','cvs'].every(k=>(T3[k]||[]).length===4)&&!!OLD.P&&!!OLD.OPEN&&!!OLD.YT&&!!OLD.CASES,
    J({NEW_P,OKQ,T21:T21.length,LOG,OPEN3,YT3,T3:Object.keys(T3),OLD:[!!OLD.P,!!OLD.OPEN,!!OLD.YT,!!OLD.CASES]}));
  check('0. STORY.NDL_PINGS＝原本四句＋第 1 節四句（八句，照順序）、NDL_OK＝「'+OKQ+'」',J(STORY.NDL_PINGS)===J((OLD.P||[]).concat(NEW_P))&&STORY.NDL_OK===OKQ,J([STORY.NDL_PINGS,STORY.NDL_OK]));
  check('0. STORY.FAFU_OPEN＝原本三句＋2-2 三句；FAFU_YT＝原本三句＋2-3 三句',J(STORY.FAFU_OPEN)===J((OLD.OPEN||[]).concat(OPEN3))&&J(STORY.FAFU_YT)===J((OLD.YT||[]).concat(YT3)),J([STORY.FAFU_OPEN,STORY.FAFU_YT]));
  check('0. STORY.FAFU_BACK＝2-1 第二輪八列（旁白、民眾、誰、回的話）、FAFU_LOG＝第三輪三句',J((STORY.FAFU_BACK||[]).map(b=>[['旁白',b[0]],['民眾',b[1]],[b[2],b[3]]]))===J(T21)&&J(STORY.FAFU_LOG)===J(LOG),J([STORY.FAFU_BACK,STORY.FAFU_LOG]));
  const cur=(fs.readFileSync(path.join(H.ROOT,'src/story3d.js'),'utf8').match(/S\.FAFU_CASES=\[[\s\S]*?\]\];/)||[''])[0];
  check('0. BB 查過的法律句子（FAFU_CASES 第一輪八件）一字不動',!!cur&&cur===OLD.CASES&&STORY.FAFU_CASES.length===8);
  const X=WZ_JOBS_DATA.x, sk=k=>k==='cvs'?X.cvs.night:X[k].withLines;
  check('0. wz_jobs：Café（芷若）、書店（沛珊）withLines、便利商店 night＝原本兩句＋第 3 節四句（六句）',['cafe','books','cvs'].every(k=>sk(k).length===6&&J(sk(k).slice(2))===J(T3[k]))&&X.cafe.withLines[0]==='（她把最後一盞燈關掉，說「明天見」。）'&&X.books.withLines[0]==='（她蹲在最下面一排，小聲念書名給自己聽。）'&&X.cvs.night[0]==='（兩點，換班的人來了。外面的路燈下沒有人。）'&&X.cvs.night.slice(2).every(t=>t.startsWith('（兩點。')),J(['cafe','books','cvs'].map(sk)));
});

/* ---- 1 阿哲揪麵店 ---- */
const W4THU=TD('Y1S1',4,4), P=()=>STORY.NDL_PINGS||(OLD.P||[]).concat(NEW_P), OK=()=>STORY.NDL_OK||OKQ;   /* 修改前沒有 STORY.NDL_PINGS：用稿的八句比（照樣 FAIL，不丟例外）*/
const pings=()=>(H.G.msgs||[]).filter(m=>m.th==='g:noodle_team'&&m.from==='zhe'&&/^rt_zhe_ndl_/.test(m.tag||'')).map(m=>({d:m.day,t:m.text,h:m.h}));
const pr=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const start=(flags)=>{ fresh(W4THU,18,'noodle',Object.assign({noodleTableDay:W4THU},flags||{})); for(let h=18;h<=19;h+=0.25){ at(W4THU,h,'noodle'); pr(); } };
const day=(d,came)=>{ at(d,8,'dorm'); pr(); if(came){ at(d,18,'noodle'); pr(); at(d,18.5,'noodle'); pr(); } at(d,22,'dorm'); pr(); };
const NDs=(a,b)=>{ const L=[]; for(let d=a;d<=b;d++) if(STORY.noodleDay(d)) L.push(d); return L; };
await sec(1,()=>{
  const R1=CALENDAR.termDays('Y1S1'), R2=CALENDAR.termDays('Y1S2'), ND=NDs(W4THU+1,R1.to), NE=NDs(R2.from,R2.to);
  /* A：一直沒來 */
  start(); for(let d=W4THU+1;d<=TD('Y1S2',5,7);d++) day(d,false); const A=pings();
  check('1. 一直沒來：揪三次（'+P().slice(0,3).join('／')+'）→ 第三次也沒來的下一個麵店日「'+OK()+'」→ 之後不揪（大一上剩下的、大一下前五週都安靜）',J(A.map(x=>x.t))===J(P().slice(0,3).concat([OK()]))&&J(A.map(x=>x.d))===J(ND.slice(1,5))&&A.every(x=>Math.abs(x.h-17.5)<0.01),J(A.map(x=>[keyOf(x.d),x.t])));
  check('1. 停了以後 ndlMiss＝4（停）、這學期問過（ndlOkT＝Y1S1）',H.G.flags.ndlMiss===4&&H.G.flags.ndlOkT==='Y1S1',J([H.G.flags.ndlMiss,H.G.flags.ndlOkT]));
  /* B：去一次從頭算、一學期最多一次、八句輪完回第一句 */
  const came=new Set([ND[6],NE[0]]); start(); for(let d=W4THU+1;d<=NE[7];d++) day(d,came.has(d)); const B=pings(), Bt=B.map(x=>x.t);
  check('1. 去了一次麵店（'+keyOf(ND[6])+'）從頭算：再揪三次接著輪（第 4～6 句）',J(Bt.slice(0,7))===J(P().slice(0,3).concat([OK()],P().slice(3,6)))&&J(B.slice(4,7).map(x=>x.d))===J(ND.slice(8,11)),J(B.map(x=>[keyOf(x.d),x.t])));
  check('1. 同一學期第二次連三次沒來：不再問「還好嗎」（一學期最多一次），安靜停到學期結束',B.filter(x=>x.t===OK()&&(CALENDAR.termOf(x.d)||{}).id==='Y1S1').length===1&&!B.some(x=>x.d>ND[10]&&x.d<=R1.to),J(B.map(x=>[keyOf(x.d),x.t])));
  check('1. 下學期去一次（'+keyOf(NE[0])+'）再連三次沒來：第 7、8 句、輪回第 1 句，再「還好嗎」（新學期可以再問一次）',J(Bt.slice(7))===J([P()[6],P()[7],P()[0],OK()])&&J(B.slice(7).map(x=>x.d))===J(NE.slice(2,6)),J(B.slice(7).map(x=>[keyOf(x.d),x.t])));
  check('1. 一天最多一則、只在麵店日、17:30、阿哲不加句號',new Set(B.map(x=>x.d)).size===B.length&&B.every(x=>STORY.noodleDay(x.d)&&Math.abs(x.h-17.5)<0.01)&&P().concat([OK()]).every(t=>!/。$/.test(t)));
  /* C：舊存檔（沒有 ndlMiss）*/
  const old=(tags,n)=>{ fresh(ND[4],7,'dorm',{noodleTableDay:W4THU,ndlTrack0:W4THU,ndlDays:[W4THU],ndlPingN:n}); PHONE.join(H.G,'noodle_team','麵店團'); for(const d of tags) H.G.msgs.push({day:d,h:17.5,th:'g:noodle_team',from:'zhe',text:OLD.P[(tags.indexOf(d)+n-tags.length)%4],tag:'rt_zhe_ndl_'+d}); day(ND[4],false); return pings().filter(x=>x.d===ND[4]).map(x=>x.t); };
  const c3=old([ND[1],ND[2],ND[3]],3), cm=H.G.flags.ndlMiss, c2=old([ND[2],ND[3]],5), cm2=H.G.flags.ndlMiss;
  check('1. 舊存檔（沒有 ndlMiss）：前三個麵店日都揪過、都沒來＝這次「'+OK()+'」（照手機裡的接著算）',J(c3)===J([OK()])&&cm===4,J([c3,cm]));
  check('1. 舊存檔：前兩個麵店日揪過、ndlPingN＝5＝這次第 6 句「'+P()[5]+'」（八句照原本的次數接著輪），ndlMiss＝3',J(c2)===J([P()[5]])&&cm2===3,J([c2,cm2]));
  const ab=()=>{ start({abroad:true}); for(const d of ND.slice(0,4)) day(d,false); return pings().length; };
  check('1. 人在國外（F.abroad）照舊不揪',ab()===0);
});

/* ---- 2 法服值班 ---- */
const SAT=TD('Y2S1',7,6), MEM={lawclub:true,CLUB_lawclub_study:true};
const shift=async()=>{ const G=H.G; G.flags.LAWCLUB_SAT_LAST=null; at(SAT,9,'wancai'); H.said=[]; H.opts=[]; H.picks=[]; await STORY.fafuShift(GM); return H.said.map(s=>({w:s.who,t:s.t})); };
await sec(2,async()=>{
  fresh(SAT,9,'wancai',MEM); H.G.stage='law'; const S=[], O=[]; for(let i=0;i<20;i++){ S.push(await shift()); O.push(H.opts.slice()); }
  const has=(L,w,t)=>L.some(x=>x.t===t&&(w==null||x.w===w)), Q='你先問什麼？', OP=STORY.FAFU_OPEN.map(x=>x[1]);
  check('2-2. 開場：第 1～6 次照順序各一句（'+OP.length+' 句）',S.slice(0,6).every((L,i)=>!!STORY.FAFU_OPEN[i]&&L[0].w===STORY.FAFU_OPEN[i][0]&&L[0].t===STORY.FAFU_OPEN[i][1]),J(S.slice(0,6).map(L=>L[0])));
  check('2-2. 第 7 次起不說開場（直接接民眾）',S.slice(6).every(L=>!L.some(x=>OP.includes(x.t))),J(S.slice(6,9).map(L=>L.slice(0,2))));
  check('2-1. 第一輪（第 1～8 次）：八件照順序、照舊問「你先問什麼？」、民眾和 BB 查過的回覆照舊',S.slice(0,8).every((L,i)=>{ const c=STORY.FAFU_CASES[i]; return has(L,null,'（'+c[0]+'。）')&&has(L,null,Q)&&has(L,'民眾',c[1])&&has(L,c[2],c[3]); })&&O.slice(0,8).every(o=>o.length===2),J(S[0]));
  check('2-1. 第二輪（第 9～16 次）：同樣八個人照順序回來（2-1 的表：旁白、民眾、學長／學姊），不問「你先問什麼？」、只剩「再待到十二點／先走」',S.slice(8,16).every((L,i)=>{ const r=T21[i]; return has(L,null,r[0][1])&&has(L,'民眾',r[1][1])&&has(L,r[2][0],r[2][1])&&!has(L,null,Q)&&!STORY.FAFU_CASES.some(c=>has(L,null,'（'+c[0]+'。）')); })&&O.slice(8,16).every(o=>o.length===1&&J(o[0])===J(['再待到十二點。','先走。'])),J([S[8],O[8]]));
  check('2-1. 第三輪起（第 17 次～）：只有一句旁白，三句輪（'+LOG.map(t=>t.slice(1,6)).join('／')+'…），沒有民眾、不問',S.slice(16).every((L,i)=>has(L,null,LOG[i%3])&&!L.some(x=>x.w==='民眾')&&!has(L,null,Q))&&has(S[19],null,LOG[0]),J(S.slice(16).map(L=>L.filter(x=>LOG.includes(x.t)).map(x=>x.t))));
  check('2. 結尾照舊（初談紀錄、學長簽名）；FAFU_ROT 記到第 20 次（cs）、開場停在 6',S.every(L=>has(L,null,'（初談紀錄，一頁。學長在最下面簽名。）'))&&H.G.flags.FAFU_ROT.cs===20&&H.G.flags.FAFU_ROT.open===6,J(H.G.flags.FAFU_ROT));
  /* 語彤（S.YT_FAFU 固定 no；暫時打開）*/
  const yf=STORY.YT_FAFU; let Y=[];
  try{ STORY.YT_FAFU='yes'; fresh(SAT,9,'wancai',Object.assign({YT_LEGALAID_Y2:true},MEM)); H.G.stage='law'; SOCIAL.remember('heroine_03','FIRST_MET',''); H.FRIEND('heroine_03'); for(let i=0;i<8;i++){ const L=await shift(); Y.push(L.filter(x=>STORY.FAFU_YT.includes(x.t)).map(x=>x.t)); } } finally { STORY.YT_FAFU=yf; }
  check('2-3. 語彤在法服（暫時打開 YT_FAFU）：第 1～6 次照順序各一句，第 7 次起她在、不說話',J(Y)===J(STORY.FAFU_YT.map(t=>[t]).concat([[],[]])),J(Y));
  check('2-3. 遊戲裡語彤照舊不在法服（STORY.YT_FAFU＝no）',STORY.YT_FAFU==='no');
  /* 舊存檔 */
  fresh(SAT,9,'wancai',Object.assign({FAFU_ROT:{open:4,cs:10,stay:1,yt:2,bh:0}},MEM)); H.G.stage='law'; const L1=await shift();
  check('2. 舊存檔（FAFU_ROT open 4、cs 10）：開場第 5 句「'+(STORY.FAFU_OPEN[4]||OPEN3[1])[1]+'」、民眾＝第二輪第 3 位（冰箱那位先生）',!!STORY.FAFU_OPEN[4]&&L1[0].t===STORY.FAFU_OPEN[4][1]&&has(L1,null,T21[2][0][1])&&has(L1,'民眾',T21[2][1][1]),J(L1.slice(0,4)));
  fresh(SAT,9,'wancai',Object.assign({FAFU_ROT:{open:0,cs:0}},MEM)); H.G.stage='law'; let L2=null; try{ L2=await shift(); }catch(e){ L2=null; }
  check('2. 舊存檔 FAFU_ROT 少欄位（沒有 yt、stay、bh）：照常演、不丟例外',!!L2&&L2[0].t===STORY.FAFU_OPEN[0][1]&&H.G.flags.FAFU_ROT.cs===1);
});

/* ---- 3 打工的收尾 ---- */
const hire=(k,days,o)=>{ const J0=JOBS.rec(H.G); J0[k]=Object.assign({since:H.G.day-1,from:(H.G.day-1)*24,day:days,shifts:0,skill:0,missedRun:0,quit:null,gone:null,missPend:false,missN:0,worked:[],chk:H.G.day-1,wk:{},brk:{},ot:{}},o||{}); return J0[k]; };
const sl0=STORY.sleepNow; STORY.sleepNow=async()=>{};   /* 夜班回宿舍睡：不用真的睡 */
const work=async(k,d)=>{ const h0=JOBS.hrs(k,d)[0]; at(d,h0-0.1,k==='cafe'?'cafe':k==='books'?'bookstore':'cvs'); H.said=[]; H.opts=[]; H.picks=[]; toasts.length=0; await JOBS.runShift(GM,k); return H.said.map(s=>s.t); };
await sec(3,async()=>{
  const X=WZ_JOBS_DATA.x;
  const seq=async(k,wd,term,weeks,pool,o)=>{ const ds=weeks.map(w=>TD(term,w,wd)); fresh(ds[0],8,'dorm'); const j=hire(k,[wd===0?7:wd],o); const out=[]; for(const d of ds){ const L=await work(k,d); out.push(L.filter(t=>pool.includes(t))); } return {out,j}; };
  const C=await seq('cafe',6,'Y1S2',[3,4,5,6,7,10,11],X.cafe.withLines);
  check('3. Café 芷若在班上（週六）：打烊之後那一句，六句照順序輪、第 7 班回第一句',J(C.out)===J(X.cafe.withLines.map(t=>[t]).concat([[X.cafe.withLines[0]]])),J(C.out));
  const B=await seq('books',6,'Y1S2',[3,4,5,6,7,10,11],X.books.withLines);
  check('3. 書店沛珊在班上（週六）：整理書架之後那一句，六句照順序輪、第 7 班回第一句',J(B.out)===J(X.books.withLines.map(t=>[t]).concat([[X.books.withLines[0]]])),J(B.out));
  const N=await seq('cvs',5,'Y1S2',[3,4,5,6,7,10,11],X.cvs.night);
  check('3. 便利商店夜班的最後一句：六句照順序輪（「兩點。」開頭的四句接原本兩句）、第 7 班回第一句',J(N.out)===J(X.cvs.night.map(t=>[t]).concat([[X.cvs.night[0]]])),J(N.out));
  const O=await seq('cafe',6,'Y1S2',[3],X.cafe.withLines,{withN:3}), ON=await seq('cvs',5,'Y1S2',[3],X.cvs.night,{nightN:5});
  check('3. 舊存檔（withN 3、nightN 5）：照原本的次數接著輪（第 4 句、第 6 句）',J(O.out)===J([[X.cafe.withLines[3]]])&&J(ON.out)===J([[X.cvs.night[5]]]),J([O.out,ON.out]));
});
STORY.sleepNow=sl0;
H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });
