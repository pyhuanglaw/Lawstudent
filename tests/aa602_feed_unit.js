// AA_602 以安、學姊改稿①c：動態與零星台詞（企劃線 e648d5b31；任務 AA602-FEED-1C-1102；AA 第 8 節審查決定）——不需要瀏覽器。
//   1 第 2 節 32 個數字列（含 AA 定案的決1→第 20～29 列、決3→第 30 列、決2→第 31 列、第 32 列 an_mom2）：改成在遊戲裡、原句不在（逐列讀稿，git show e648d5b31）
//   2 讀稿比對用的 tools/story/aa602_fix.json＝那 32 列（舊稿 AA_503～AA_511、AA_504 6-4 讀進來照這張表換）
//   3 第 8 節 (a)：動態裡她先傳的私訊（以安 an_mom、an_list、an_mom2、an_done；學姊 sis_ch3、sis_cap、sis_chishang、sis_rest）分手以後一律不送（FEED.dmBlocked＝'ex'，不走 V6EX.coolSkip 每兩則送一則）
//   4 第 8 節 (b)：以安期末飯旁白「有幾家已經打了勾」（ec2814492）照在
// 修改前（int/m591 4d84930c4）：第 1、2、3 項 FAIL。用法：node tests/aa602_feed_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check}=H, J=JSON.stringify;
const loadErr=[];
const load=f=>{ try{ let s=fs.readFileSync(path.join(H.ROOT,f),'utf8'); s=s.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,(m,n)=>'globalThis.'+n+'='); vm.runInThisContext(s,{filename:f}); }catch(e){ loadErr.push(f+'：'+String(e&&e.message||e).slice(0,120)); } };
const FEEDS=['y1s1','y1s2','y2s1','y2s2','y3s1','y3s2','y4s1','y4s2','pg'];
for(const f of ['src/data/v6ex_lines.js','src/v6ex3d.js'].concat(FEEDS.map(k=>'src/data/feed_'+k+'.js'),['src/feed3d.js'])) load(f);
const RAW=f=>fs.readFileSync(path.join(H.ROOT,f),'utf8');
check('0. 檔案都載得到',!loadErr.length,J(loadErr));

/* ---- 1 逐列 ---- */
const SPEC='docs/story_planning/AA_602_以安學姊改稿_1c_動態與零星台詞.md', SHA='e648d5b31';
let doc=''; try{ doc=(cp.__worldEf||cp.execFileSync).call(cp,'git',['show',SHA+':'+SPEC],{cwd:H.ROOT,encoding:'utf8'}); }catch(e){}   /* 本檔的稿不套 aa602_fix.json（原句、改成兩欄都要原樣）*/
const rows=[]; for(const line of doc.split('\n')){ const m=/^\|\s*([0-9]+)\s*\|(.*)\|\s*$/.exec(line); if(!m) continue; const c=m[2].split('|').map(x=>x.trim()); if(c.length<5) continue; rows.push({n:+m[1],where:c[0],who:c[1],old:c[2],nw:c[3]}); }
check('1. 讀得到稿（'+SHA+'）：數字列 32 列（第 1～32 列）、第 8 節 AA 審查決定在',rows.length===32&&J(rows.map(r=>r.n).sort((a,b)=>a-b))===J(Array.from({length:32},(_,i)=>i+1))&&doc.includes('## 8. AA 審查決定'),doc?String(rows.length):'git fetch origin claude/story-planning');
const fileOf=r=>'src/data/'+(/^([a-z0-9_]+\.js)/.exec(r.where)||[])[1];
const strip=s=>s.replace(/\/\*[\s\S]*?\*\//g,'');   /* 註解裡的舊句不算（第 19 列的註解也順手改了，見下面）*/
const miss=[], still=[];
for(const r of rows){ const f=fileOf(r); if(!fs.existsSync(path.join(H.ROOT,f))){ miss.push('#'+r.n+' 沒有 '+f); continue; } const s=strip(RAW(f));
  if(!s.includes(r.nw)) miss.push('#'+r.n+' '+r.nw);
  if(!r.nw.includes(r.old)&&s.includes(r.old)) still.push('#'+r.n+' '+r.old); }
check('1. 32 列的「改成」一字不差在遊戲裡（那一列寫的檔案）',!miss.length,J(miss));
check('1. 32 列的原句不在遊戲裡（不算註解）',!still.length,J(still));
check('1. 第 19 列：學姊「八點你們有讀書會。我先下線了。」；原句（含註解）都不在',RAW('src/data/r2y3a_events.js').includes("text:'八點你們有讀書會。我先下線了。'")&&!RAW('src/data/r2y3a_events.js').includes('下線吧。'));
check('1. 第 32 列（AA 第 8 節第 5 點）：an_mom2「我把課表傳給她。她說：好。」；「我說公司法。」不在',RAW('src/data/feed_y1s2.js').includes("'我把課表傳給她。她說：好。'")&&!RAW('src/data/feed_y1s2.js').includes('我說公司法。'));
check('1. 第 30 列（決3）：路過版「（抱著一疊訪談稿，從攤位前面經過，看到你）人好多。我回研究室了。」；「今年不抓你」不在',RAW('src/data/r2y3a_events.js').includes('（抱著一疊訪談稿，從攤位前面經過，看到你）人好多。我回研究室了。')&&!RAW('src/data/r2y3a_events.js').includes('今年不抓你'));
{ const her=[], pics=new Set(); const T=x=>x==null?[]:(typeof x==='object'?['yes','no','nar'].map(k=>x[k]).filter(v=>v!=null).map(String):[String(x)]);
  for(const k of FEEDS){ const F=globalThis['FEED_'+k.toUpperCase()]; if(!F) continue;
    for(const p of F.posts||[]){ if(p.who!=='heroine_01') continue; if(T(p.pic).some(t=>t.includes('手帳'))) pics.add(p.id); her.push(...T(p.say)); if(p.cm) her.push(...T(p.cm[1])); if(p.dm) her.push(...T(p.dm[1])); }
    for(const q of F.dms||[]){ if(q.who!=='heroine_01') continue; for(const l of q.lines||[]) her.push(...T(l)); if(q.ask) for(const o of q.ask.opts||[]) for(const r of o.r||[]) her.push(...T(r)); } }
  const bad=her.filter(t=>t.includes('手帳'));
  check('1. 以安在動態裡說出口、傳出來的「手帳」0；照片拍到手帳的剩 6 則（an1、an7b、an1c、an7d、an4f、an5h，AA 第 8 節第 1 點 A 案）',her.length>100&&!bad.length&&J([...pics].sort())===J(['an1','an1c','an4f','an5h','an7b','an7d']),J({bad,pics:[...pics],n:her.length})); }

/* ---- 2 fix 表 ---- */
{ let F=null; try{ F=JSON.parse(RAW('tools/story/aa602_fix.json')); }catch(e){}
  const P=F?F.pairs:[]; const want=rows.map(r=>[r.old,r.nw]);
  /* 改成包含原句的那一列（第 3 列「七家。這是第一家。」→「想去的店，有七家。這是第一家。」）在表上連「」一起換：稿以後改成新句也不會換兩次 */
  const same=(p,w)=>w[1].includes(w[0])?(p[0]==='「'+w[0]+'」'&&p[1]==='「'+w[1]+'」'):(p[0]===w[0]&&p[1]===w[1]);
  check('2. tools/story/aa602_fix.json＝第 2 節 32 列（舊句→改成；改成包含原句的連「」一起換）',!!F&&P.length===32&&want.every(w=>P.some(p=>same(p,w)))&&P.every(p=>!p[1].includes(p[0])),J(want.filter(w=>!P.some(p=>same(p,w)))));
  check('2. tests/alison.js、tools/story/import_guard.py 讀稿時都套 aa602_fix.json',/'aa602_fix\.json'/.test(RAW('tests/alison.js'))&&/'aa602_fix\.json'/.test(RAW('tools/story/import_guard.py')));
  let a503=''; try{ a503=cp.execSync('git show d13ab3ab7:"docs/story_planning/AA_503_女主角自己的生活_大一上_動態頁_圈子_她的事.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){}
  check('2. 舊稿 AA_503 讀進來已經是新句（an_mom「我媽昨天看到我寫的「想去的店」。」），舊句「我媽昨天把我的手帳從頭翻到尾。」不在',a503.includes('我媽昨天看到我寫的「想去的店」。')&&!a503.includes('我媽昨天把我的手帳從頭翻到尾。')); }

/* ---- 3 第 8 節 (a) ---- */
{ const AN='heroine_01', SIS='heroine_05';
  const G=H.fresh('2027-03-10',10,'dorm'); G.flags.AN_LIST=true; G.contacts=G.contacts||{}; G.contacts[AN]=G.day; G.contacts[SIS]=G.day; for(const id of [AN,SIS]){ H.CLOSE(id); }
  const ALL=[].concat(...['FEED_Y1S1','FEED_Y1S2','FEED_Y2S1','FEED_Y3S1'].map(k=>(globalThis[k]&&globalThis[k].dms)||[]));
  const Q=['an_mom','an_list','an_mom2','an_done','sis_ch3','sis_cap','sis_chishang','sis_rest'].map(id=>ALL.find(q=>q.id===id));
  check('3. 八則她先傳的私訊都找得到',Q.every(Boolean),J(Q.map(q=>q&&q.id)));
  ROM.start(G,AN); ROM.start(G,SIS); ROM.end(G,AN,'apart_talk'); ROM.end(G,SIS,'apart_talk');
  const r=Q.filter(Boolean).map(q=>[q.id,FEED.dmBlocked(G,q)]);
  const okEx=x=>x[1]==='ex'||(x[0]==='sis_rest'&&x[1]==='stage');   /* sis_rest 本來就只給交往中（st 交往中）*/
  check('3. 分手以後：八則都不送（\'ex\'；sis_rest 只給交往中＝stage）——不是 cool 的每兩則送一則',r.every(okEx),J(r));
  G.day+=400; const r2=Q.filter(Boolean).map(q=>[q.id,FEED.dmBlocked(G,q)]); check('3. 一年以後還是不送（直到重新交往）',r2.every(okEx),J(r2));
  ROM.start(G,AN); const a=FEED.dmBlocked(G,Q[0]); check('3. 和以安重新交往：以安那幾則不再是 ex',a!=='ex',a);
  check('3. feed3d.js S.dmBlocked 先問 V6EX.noContact、再問 coolSkip',/V6EX\.noContact\(G,q\.who\)\) return 'ex';[\s\S]{0,400}V6EX\.coolSkip/.test(RAW('src/feed3d.js'))); }

/* ---- 4 第 8 節 (b) ---- */
check('4. 以安期末飯旁白「有幾家已經打了勾，今天這一家也勾了。」（ec2814492）；「前面的都打了勾」不在',RAW('src/data/termend_lines.js').includes('有幾家已經打了勾，今天這一家也勾了。')&&!RAW('src/data/termend_lines.js').includes('前面的都打了勾'));

/* 白名單 */
{ const A=JSON.parse(RAW('docs/handoff/story_import_allow.json')), L=Array.isArray(A)?A:(A.files||A.allow||[]); const e=L.find(x=>x&&x.path===SPEC);
  check('白名單：AA_602@e648d5b31（AA602-FEED-1C-1102，approved）',!!e&&e.sha===SHA&&e.task==='AA602-FEED-1C-1102'&&e.status==='approved'); }
H.done();
