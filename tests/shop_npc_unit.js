// 新店面裡遇得到有名字的人（AA_705 第一批：大一上；SHOP-NAMED-NPC-1105，USER_WANTS X251；src/data/shop_npc.js、src/shopnpc3d.js）——不需要瀏覽器。
//   0 載得到、index.html 的位置、STORY.SCHED_X 排在最後、劇情匯入白名單登記 AA_705／AA_615 @ ebea3a2b0
//   1 照稿：從企劃線 git show ebea3a2b0 讀 AA_705 的三張表，每一列的店、誰、星期、時間、週次、在哪、聽一句一字不差；AA_615 第 4 節（送爆米花）每一句一字不差
//   2 作息：每一列在大一上（第 2 週起）的每一個符合的日子、時段開頭／中間／結尾——沒撞到原本的作息＝STORY.schedEnt 就是這間店、這個 act；撞到＝照原本的（不出現）；
//     時段外、第 1 週、別的學期、經濟系那一年、店沒開（颱風天）、人不在＝不在；撞到的次數列出來（AA 要那張表）
//   3 撞到的規則：上課、讀書、在外面、有劇情標記的「走走」＝原本的優先；只有單純「在某一區走走」不算撞到；學姊同一週只留青木；子晴偶遇演完就走；Alison 照原本的打工作息在櫃檯
//   4 聽一句：走到旁邊（2.5 m、同一層）、認識她才出；每個人每學期一次（學姊兩列合起來一次）；不認識、太遠、在演、沒照這張表在店裡＝不出；字照稿
//   5 Alison 送爆米花：第一次那一段（兩個選項）＋NY_POPCORN；同一學期不再；下一學期隨機一句；KNOWS_SIS_ALISON 那一句一學期一次
//   6 位置（子程序：真的建區域）：站的點站得住、不壓在按鈕上；坐的列是那間店真的座位（同一層）；留給約好的人那一組、有人坐＝換最近的空位；學姊坐在地上、那個按鈕藏起來
// 修改前（開發分支 2258988a5）：沒有 src/shopnpc3d.js——FAIL。用法：node tests/shop_npc_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');
if(process.argv[2]==='--zones') return zonesPhase();
const H=require('./pg_harness.js');
const {check,GM}=H;
const loadErr=[];
const L3=f=>{ const p=path.join(ROOT,f); if(!fs.existsSync(p)){ loadErr.push(f+'：沒有這個檔'); return; } try{ vm.runInThisContext(fs.readFileSync(p,'utf8').replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='),{filename:f}); }catch(e){ loadErr.push(f+'：'+e); } };
/* 會加作息（STORY.SCHED_X、SCHED_WITH）的模組都載進來（index.html 的順序），撞到的次數才是遊戲裡真的次數 */
for(const f of ['src/ytjob3d.js','src/grades3d.js','src/bgnight3d.js','src/pool3d.js','src/data/heroine_circle.js','src/hcircle3d.js','src/aa554_3d.js','src/guitar3d.js','src/data/examlib_lines.js','src/examlib3d.js']) if(fs.existsSync(path.join(ROOT,f))) L3(f);
const nOther=loadErr.length;
L3('src/data/shop_npc.js'); L3('src/shopnpc3d.js');
const ok0=loadErr.length===nOther&&typeof SHOPNPC!=='undefined'&&typeof SHOP_NPC!=='undefined';
check('0. 載得到 src/data/shop_npc.js、src/shopnpc3d.js',ok0,loadErr.join('；'));
if(!ok0){ console.log('FAILED '+H.fails); process.exit(1); }
const J=JSON.stringify, D=k=>STORY.dayOfKey(k), keyOf=d=>CALENDAR.dateOf(d).key, wdOf=d=>CALENDAR.dateOf(d).wd%7;
const git=(sha,f)=>{ try{ return cp.execSync('git show '+sha+':"docs/story_planning/'+f+'"',{cwd:ROOT,encoding:'utf8',maxBuffer:1<<26,stdio:['ignore','pipe','ignore']}); }catch(e){ return ''; } };
const sec=(n,f)=>{ try{ f(); }catch(e){ check(n+'. 丟出例外',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); } };
const asec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); } };
const ROWS=SHOP_NPC.rows, row=id=>ROWS.find(r=>r.id===id);
const NAME={heroine_01:'以安',heroine_02:'芷若',heroine_03:'語彤',heroine_04:'子晴',heroine_05:'學姊',zhe:'阿哲',yu:'Alison',classmate_bohan:'柏翰',classmate_xinci:'芯慈',classmate_mingxuan:'明軒',classmate_peishan:'沛珊',kai:'阿凱'};
const fresh=(d,h,flags)=>{ const G=H.fresh(keyOf(d),h,'campus',Object.assign({afternoonDone:true,MET_ZHE:true},flags||{})); G.hour=h; G.weekday=wdOf(d); SHOPNPC._reset(); return G; };
/* 大一上符合這一列的日子（不看撞不撞）*/
const daysOf=(r,termId)=>{ const out=[]; for(let d=D('2025-08-25');d<=D('2027-02-28');d++){ const T=CALENDAR.termOf(d); if(!T||T.id!==(termId||'Y1S1')) continue; if(r.days.includes(wdOf(d))) out.push(d); } return out; };

// ---------- 0. index.html、SCHED_X、白名單 ----------
sec(0,()=>{ const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'), a=f=>html.indexOf(f);
  check('0. index.html：shop_npc.js → shopnpc3d.js，在 story3d、shopenc3d、nanyang3d、guitar3d、examlib3d 以後、GAME.boot() 以前',
    a('src/data/shop_npc.js')>0&&a('src/data/shop_npc.js')<a('src/shopnpc3d.js')&&['src/story3d.js','src/shopenc3d.js','src/nanyang3d.js','src/guitar3d.js','src/examlib3d.js','src/shanlan3d.js'].every(f=>a(f)>0&&a(f)<a('src/data/shop_npc.js'))&&a('src/shopnpc3d.js')<a('GAME.boot()'));
  check('0. STORY.SCHED_X 有 SHOPNPC.sched、排在最後（別的模組加的作息都比較優先）；STORY.TICKS 有 SHOPNPC.tick',STORY.SCHED_X[STORY.SCHED_X.length-1]===SHOPNPC.sched&&STORY.TICKS.includes(SHOPNPC.tick),String(STORY.SCHED_X.length));
  const A=JSON.parse(fs.readFileSync(path.join(ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files;
  const f705=A.find(x=>/AA_705_/.test(x.path)), f615=A.find(x=>/AA_615_/.test(x.path));
  check('0. 劇情匯入白名單：AA_705、AA_615 @ ebea3a2b0 approved（SHOP_NPC.src 同一個 commit）',!!f705&&!!f615&&f705.sha==='4e6755340'&&(f705.history||[]).some(h=>h.sha==='ebea3a2b0')&&f615.sha==='ebea3a2b0'&&f705.status==='approved'&&f615.status==='approved'&&SHOP_NPC.src.AA_705===f705.sha&&SHOP_NPC.src.AA_615===f615.sha);
  check('0. 白名單的檔在那個 commit 找得到',!!git('4e6755340',path.basename(f705.path))&&!!git('ebea3a2b0',path.basename(f615.path))); });

// ---------- 1. 照稿 ----------
const DOC=git('4e6755340','AA_705_新店面裡遇得到的人_第一批作息.md'), DOC615=git('ebea3a2b0','AA_615_新生南路那一側_公館二輪戲院_爆米花.md');
sec(1,()=>{ check('1. 讀得到企劃線的 AA_705、AA_615（git show ebea3a2b0）',!!DOC&&!!DOC615);
  const WD={'日':0,'一':1,'二':2,'三':3,'四':4,'五':5,'六':6};
  const hm=s=>{ const [a,b]=s.split(':').map(Number); return a+b/60; };
  const tab=[]; let area=null; for(const ln of DOC.split('\n')){ const m=/^## (.+)$/.exec(ln); if(m){ area=m[1]; continue; } if(!/^\| /.test(ln)||/^\| 店 /.test(ln)||/^\|---/.test(ln)) continue; const c=ln.split('|').slice(1,-1).map(s=>s.trim()); if(c.length===6) tab.push({area,shop:c[0],who:c[1],day:c[2],time:c[3],place:c[4],hear:c[5]}); }
  check('1. 三張表共 18 列（新生南路 8、公館 6、溫州街 4）',tab.length===18&&tab.filter(t=>t.area==='新生南路').length===8&&tab.filter(t=>t.area==='公館').length===6&&tab.filter(t=>t.area==='溫州街').length===4,String(tab.length));
  const bad=[]; let n=0;
  /* AA_705 補一節（f8bd25439）：兩列換時段（表格本身沒改）——照補一節那張表的「改成」蓋過去 */
  const REV={'山嵐書店|以安':{day:'週六',time:'19:30～20:30',src:'**週六 19:30～20:30**'},'青木茶室|學姊':{day:'單數週週日',time:'16:30～18:00',src:'16:30～18:00'}};
  for(const t of tab){ const rv=REV[t.shop+'|'+t.who]; if(rv){ if(!DOC.includes(rv.src)) bad.push(t.shop+' 補一節找不到 '+rv.src); t.day=rv.day; t.time=rv.time; } }
  for(const t of tab){ const asIs=/^照現在/.test(t.place)||t.day==='—'; const r=ROWS.find(q=>q.shop===t.shop&&NAME[q.who]===t.who);
    if(asIs){ const ok=t.who.split('、').every(w=>(SHOP_NPC.asIs||[]).some(q=>q.shop===t.shop&&NAME[q.who]===w))&&!r; if(!ok) bad.push(t.shop+' 照現在那一列沒有記在 asIs、或多排了'); continue; }
    if(!r){ bad.push(t.shop+' '+t.who+' 沒有這一列'); continue; } n++;
    /* 星期 */ const days=[...t.day.matchAll(/週([日一二三四五六])/g)].map(m=>WD[m[1]]); const want=(r.moved&&r.moved.days)||r.days;
    if(J(days)!==J(want)) bad.push(t.shop+' 星期 '+J(days)+'≠'+J(want)); if(/雙數週/.test(t.day)!==(r.weeks==='even')) bad.push(t.shop+' 雙數週'); if(/單數週/.test(t.day)!==(r.weeks==='odd')) bad.push(t.shop+' 單數週');
    /* 時間 */ const tm=/^(\d+:\d+)～(\d+:\d+)/.exec(t.time); if(!tm||Math.abs(hm(tm[1])-r.from)>1e-6||Math.abs(hm(tm[2])-r.to)>1e-6) bad.push(t.shop+' 時間 '+t.time);
    const wk=/第 ([\d、]+) 週）/.exec(t.time); if(wk&&!/起/.test(t.time)&&J(wk[1].split('、').map(Number))!==J(r.weeks)) bad.push(t.shop+' 週次'); if(/第 4 週起/.test(t.time)!==(r.dateFrom==='2025-09-26')) bad.push(t.shop+' 第 4 週起');
    if(/考試那兩週以外/.test(t.time)!==!!r.noExam) bad.push(t.shop+' 考試週');
    /* 在哪 */ if(t.place!==r.place) bad.push(t.shop+' 在哪 '+t.place+'≠'+r.place);
    /* 聽一句 */ if(/^照 `AA_615` 第 4 節/.test(t.hear)){ if(r.hearBy!=='alison'||r.hear) bad.push(t.shop+' 聽一句應照 AA_615'); continue; } if(/^照 `AA_619` 第 1 節/.test(t.hear)){ if(r.hearBy!=='guitar'||r.hear) bad.push(t.shop+' 聽一句應照 AA_619'); continue; }
    const hs=t.hear.split('——')[0]; const sm=/^([^（：]+)：(.+)$/.exec(hs); const got=r.hear||{};
    if(sm){ if(NAME[got.who]!==sm[1]||got.t!==sm[2]) bad.push(t.shop+' 聽一句 '+hs+' ≠ '+J(got)); } else if(got.who!==null||got.t!==hs) bad.push(t.shop+' 旁白 '+hs+' ≠ '+J(got)); }
  check('1. 每一列的店、誰、星期、時間、週次、在哪、聽一句照稿一字不差（'+n+' 列；照現在的 '+(SHOP_NPC.asIs||[]).length+' 位不另排）',!bad.length&&n===ROWS.length,bad.slice(0,5).join('｜'));
  check('1. 芷若：週二不是她的休假（2:30 AM 週二晚上有班、週二下午在總圖多媒體中心）＝照稿「給 LAWWW」改成她沒排班的那一天下午（週日）',/芷若：2:30 AM 的班表裡週二如果不是休假，那一列改成她沒排班的那一天下午/.test(DOC)&&J(row('wz_offbeat_zr').days)===J([0])&&CHARACTERS.heroine_02.daily_schedule.some(e=>e.act==='barista'&&e.days.includes(2))&&!CHARACTERS.heroine_02.daily_schedule.some(e=>e.act==='barista'&&e.days.includes(0)));
  /* AA_615 第 4 節 */
  const s4=(DOC615.split('## 4.')[1]||'').split('\n## ')[0]; const A=SHOP_NPC.alison, miss=[];
  for(const l of A.first){ if(l.text&&!(l.speaker?(s4.includes('Alison：'+l.text)||s4.includes('Alison「'+l.text+'」')):s4.includes(l.text))) miss.push(l.text); if(l.choice) for(const c of l.choice) if(!s4.includes(c.text)) miss.push(c.text); }
  for(const t of A.again) if(!s4.includes('Alison「'+t+'」')) miss.push(t);
  if(!s4.includes('「'+A.sis+'」')) miss.push(A.sis); if(!s4.includes('「'+A.movieLine+'」')) miss.push(A.movieLine);
  if(!s4.includes('「謝啦。」→ Alison「好好看喔。第二部比較好看。」')||!s4.includes('「這樣可以嗎？」→ Alison「多做的本來就要丟。拿去。」')) miss.push('選項的回話');
  if(!s4.includes('旁白：「（你拿到一桶爆米花。）」')) miss.push('拿到爆米花');
  check('1. AA_615 第 4 節（送爆米花）：第一次的旁白、Alison 四句、兩個選項和回話、拿到爆米花、之後三句、姊姊那一句、看電影那一句，一字不差',!miss.length&&A.first.filter(l=>l.text).length===8&&A.again.length===3,miss.join('｜')); });

// ---------- 2. 作息 ----------
const CLASH={};
sec(2,()=>{ const bad=[], out=[]; let shown=0, tot=0;
  for(const r of ROWS){ if(r.hearBy==='alison') continue; const c=CHARACTERS[r.who]; const st={cal:0,on:0,why:{}};
    for(const d of daysOf(r)) for(const h of [r.from+0.03,(r.from+r.to)/2,r.to-0.03]){ const G=fresh(d,h); if(!SHOPNPC.calOk(G,r)) continue; st.cal++; tot++;
      const why=[]; const on=SHOPNPC.on(G,r,why); const e=STORY.schedEnt(c,G);
      if(on){ st.on++; shown++; const act=r.pose==='stand'?'linger':(r.act==='eat'?'eat':(r.act==='sit'?'sit':'read')); if(!e||e.shopNpc!==r.id||e.zone!==r.zone||e.act!==act) bad.push(r.id+' '+keyOf(d)+' '+h.toFixed(2)+' 應在店裡：'+(e?e.zone+'/'+e.act:'null')); }
      else { if(e&&e.shopNpc) bad.push(r.id+' '+keyOf(d)+' 撞到了還在店裡'); const b=SHOPNPC.base(c,G); const k=why[0]==='clash'&&b?(b.zone||b.away||'')+'／'+b.act+(b.note?'（'+String(b.note).slice(0,18)+'）':''):why.join(','); st.why[k]=(st.why[k]||0)+1; } }
    CLASH[r.id]=st; out.push(r.id+' '+st.on+'/'+st.cal); }
  check('2. 每一列在大一上符合的每一天、時段開頭中間結尾：沒撞到＝作息就是這間店、這個 act；撞到＝照原本的（'+shown+'/'+tot+' 格在店裡）',!bad.length&&shown>0,bad.slice(0,5).join('｜')||out.join(' '));
  /* 不在的時候 */ const off=[];
  for(const r of ROWS){ if(r.hearBy==='alison') continue; const c=CHARACTERS[r.who]; const ds=daysOf(r);
    const T=d=>CALENDAR.termOf(d); const dOk=ds.find(d=>SHOPNPC.on(fresh(d,(r.from+r.to)/2),r)); if(dOk==null) continue;
    const at=(d,h,f)=>{ const G=fresh(d,h,f); const e=STORY.schedEnt(c,G); return !!(e&&e.shopNpc===r.id); };
    if(at(dOk,r.from-0.05)) off.push(r.id+' 時段前'); if(at(dOk,r.to+0.01)) off.push(r.id+' 時段後');
    const d1=ds.find(d=>T(d).week===1); if(d1!=null&&at(d1,(r.from+r.to)/2)) off.push(r.id+' 第 1 週');
    const dS2=daysOf(r,'Y1S2').find(d=>T(d).week>=2); if(dS2!=null&&at(dS2,(r.from+r.to)/2)) off.push(r.id+' 大一下');
    { const G=fresh(dOk,(r.from+r.to)/2); G.stage='econ'; if(SHOPNPC.sched(c,G)) off.push(r.id+' 經濟系'); }
    { const iso=PLACES.isOpen; PLACES.isOpen=(z,h,d)=>z===r.zone?false:iso.call(PLACES,z,h,d); try{ if(at(dOk,(r.from+r.to)/2)) off.push(r.id+' 店沒開'); } finally { PLACES.isOpen=iso; } } }
  check('2. 不在：時段前後、第 1 週、大一下、經濟系那一年、店沒開（颱風天、店休）',!off.length,off.slice(0,6).join('｜'));
  { const r=row('xs_dakou_bh'); const de=daysOf(r).find(d=>CALENDAR.termOf(d).exam); const G=de!=null?fresh(de,22.5):null; check('2. 柏翰：考試那兩週不在大口漢堡',de!=null&&!SHOPNPC.calOk(G,r)&&!(STORY.schedEnt(CHARACTERS.classmate_bohan,G)||{}).shopNpc,de!=null?keyOf(de):'沒有考試週'); }
  { const r=row('xs_shanlan_sis'); const odd=daysOf(r).filter(d=>CALENDAR.termOf(d).week%2===1&&CALENDAR.termOf(d).week>1); check('2. 學姊山嵐、沛珊 Daybreak：單數週不在',odd.length>0&&odd.every(d=>!SHOPNPC.calOk(fresh(d,11.5),r))&&daysOf(row('daybreak_ps')).filter(d=>CALENDAR.termOf(d).week%2===1).every(d=>!SHOPNPC.calOk(fresh(d,11),row('daybreak_ps')))); }
  { const r=row('xs_tongxian_zq'); const ws=daysOf(r).filter(d=>SHOPNPC.calOk(fresh(d,15.5),r)).map(d=>CALENDAR.termOf(d).week); check('2. 子晴同弦：只有第 6、10、14 週',J(ws)===J([6,10,14]),J(ws)); }
  { const r=row('xs_shanlan_sis'); const d=daysOf(r).find(d=>CALENDAR.termOf(d).week===4); check('2. 學姊山嵐：山嵐 11:00 才開門＝10:30～11:00 不在、11:00～12:00 在',!SHOPNPC.calOk(fresh(d,10.75),r)&&SHOPNPC.calOk(fresh(d,11.25),r)); }
  { const r=row('xs_shanlan_an'); const d=daysOf(r).find(d=>CALENDAR.termOf(d).week>=2); const G=fresh(d,14.5); const pr=STORY.presence('heroine_01',G);
    const ds=daysOf(r).filter(d=>CALENDAR.termOf(d).week>=2&&STORY.presence('heroine_01',fresh(d,14.5)).here===false); check('2. 人不在（presence：以安回臺南那幾個週日）＝不在',ds.length===0||ds.every(d=>!SHOPNPC.on(fresh(d,14.5),r)),ds.length+' 天'); } });

// ---------- 3. 撞到的規則 ----------
sec(3,()=>{ const r=row('xs_dabu_zhe'), c=CHARACTERS.zhe; const d=daysOf(r).find(d=>SHOPNPC.on(fresh(d,16),r)); const keep=c.daily_schedule;
  const tryE=e=>{ c.daily_schedule=[e].concat(keep); try{ const G=fresh(d,16); return !!(STORY.schedEnt(c,G)||{}).shopNpc; } finally { c.daily_schedule=keep; } };
  const base={days:[6],from:15,to:17};
  check('3. 原本的優先：同時段有讀書（library read）、上課（class）、在外面（away）、社課（club）＝不出現',d!=null&&!tryE(Object.assign({zone:'library',act:'read'},base))&&!tryE(Object.assign({zone:'classroom',act:'class'},base))&&!tryE(Object.assign({zone:null,act:'out',away:'回高雄'},base))&&!tryE(Object.assign({zone:'wancai',act:'club'},base)));
  check('3. 有劇情標記的走走（talkEvent、pri、spot、if、只有幾天的 dates）＝也是原本的優先',!tryE(Object.assign({zone:'campus',act:'wander',talkEvent:'ev_x'},base))&&!tryE(Object.assign({zone:'campus',act:'wander',pri:true},base))&&!tryE(Object.assign({zone:'campus',act:'wander',if:{notFlags:['NO_SUCH_FLAG']}},base))&&!tryE(Object.assign({zone:'campus',act:'wander',dates:[['2025-09-01','2025-12-31']].map(x=>[keyOf(d),keyOf(d)])},base)));
  check('3. 單純「在某一區走走」（作息表的 wander／walk）不算撞到＝在店裡',tryE(Object.assign({zone:'campus',act:'wander'},base))&&tryE(Object.assign({zone:'gongguan',act:'walk'},base)));
  { const y=SHOPNPC.YIELD_ACTS; SHOPNPC.YIELD_ACTS=[]; try{ check('3. S.YIELD_ACTS=[]（最嚴的讀法）＝連走走也算撞到',!tryE(Object.assign({zone:'campus',act:'wander'},base))); } finally { SHOPNPC.YIELD_ACTS=y; } }
  /* 學姊一週一次（AA_705 補一節 f8bd25439：青木改單數週週日、山嵐雙數週週六，本來就錯開；同一週兩個都出現＝錯）*/
  { const s=row('xs_shanlan_sis'), a=row('aoki_sis'); const wk={}, cnt=[0,0];
    for(const [k,r] of [[0,s],[1,a]]) for(const d of daysOf(r)){ const T=CALENDAR.termOf(d); if(!T||T.week<2) continue; const G=fresh(d,(r.from+r.to)/2); if(SHOPNPC.on(G,r)){ cnt[k]++; (wk[T.week]=wk[T.week]||[]).push(k); } }
    const dup=Object.keys(wk).filter(w=>wk[w].length>1);
    check('3. 學姊一週最多一次：大一上山嵐（雙數週週六）、青木（單數週週日）都會出現，而且沒有一週兩個都出現',cnt[0]>0&&cnt[1]>0&&!dup.length,J({cnt,dup})); }
  /* 子晴偶遇演完 */
  { const r7=row('xs_tongxian_zq'); const d7=daysOf(r7).find(d=>SHOPNPC.on(fresh(d,15.5),r7)); const G=fresh(d7,15.5); const a1=!!(STORY.schedEnt(CHARACTERS.heroine_04,G)||{}).shopNpc; G.guitar={items:{},enc:d7}; SHOPNPC._reset(); const a2=!!(STORY.schedEnt(CHARACTERS.heroine_04,G)||{}).shopNpc;
    check('3. 子晴同弦：在櫃台前；偶遇（AA_619 第 1 節）演完那一天＝不在了（她拿了一包弦就走）',a1&&!a2); }
  /* Alison */
  { const r3=row('xs_nanyang_yu'), c=CHARACTERS.yu; const fri=daysOf(r3).filter(d=>wdOf(d)===5); const w4=fri.find(d=>CALENDAR.termOf(d).week===4), w3=fri.find(d=>CALENDAR.termOf(d).week===3);
    const e4=STORY.schedEnt(c,fresh(w4,19)), e3=STORY.schedEnt(c,fresh(w3,19)), e4b=STORY.schedEnt(c,fresh(w4,23.2));
    check('3. Alison：大一上第 4 週起週五、週六 18:00～23:00＝在南洋戲院大廳櫃檯後面（原本的「在南洋戲院打工」）；第 3 週、23:00 以後不在',!!e4&&e4.zone==='xs_nanyang'&&e4.act==='linger'&&J(e4.at)===J(r3.at)&&!(e3&&e3.zone==='xs_nanyang')&&!(e4b&&e4b.zone==='xs_nanyang'),J(e4&&{z:e4.zone,a:e4.act})+' '+J(e3&&{z:e3.zone,a:e3.away}));
    const s2=daysOf(r3,'Y2S1').find(d=>wdOf(d)===6&&CALENDAR.termOf(d).week===5); const e5=s2!=null?STORY.schedEnt(c,fresh(s2,20)):null;
    check('3. Alison：之後的學期照她的打工作息一樣在櫃檯（AA_615 第 4 節沒有限學期）',!!e5&&e5.zone==='xs_nanyang',J(e5&&{z:e5.zone,a:e5.away})); } });

// ---------- 4. 聽一句 ----------
const caps=[]; GM.caption=(who,t)=>{ caps.push((who?who+'：':'')+t); };
const npcAt=(id,x,z,lv)=>{ const n={obj:{position:{x,y:0,z},visible:true},lv:lv|0,charId:id}; GM.npc[id]=n; return n; };
const putPlayer=(x,z,lv)=>{ GM.E.player.obj.position.x=x; GM.E.player.obj.position.z=z; GM.E.player.lv=lv|0; GM.E.player.busy=false; };
const setup=(r,d,h,met)=>{ const G=fresh(d,h); G.zone=r.zone; GM.npc={}; if(met) H.rel(r.who,20,5,5); const p=r.pose==='seat'?r.seat:r.at; npcAt(r.who,p[0],p[1],r.pose==='seat'?p[2]:p[3]); putPlayer(p[0]+1.2,p[1],r.pose==='seat'?p[2]:p[3]); caps.length=0; GM.D.active=false; if(typeof HCIRCLE!=='undefined') HCIRCLE._capBusy=false; return G; };
sec(4,()=>{ const bad=[]; let n=0;
  for(const r of ROWS){ if(!r.hear) continue; const d=daysOf(r).find(d=>SHOPNPC.on(fresh(d,(r.from+r.to)/2),r)); if(d==null){ continue; } const h=(r.from+r.to)/2;
    let G=setup(r,d,h,false); delete G.flags.MET_ZHE; SHOPNPC.hear(GM); if(caps.length&&!STORY.knows(r.who,G)) bad.push(r.id+' 不認識也出了');   /* 阿哲：不是從第一週開始的存檔一律算認識（STORY.knows 的舊存檔規則）*/
    G=setup(r,d,h,true); SHOPNPC.hear(GM); const want=(r.hear.who?SOCIAL.npcName(r.hear.who)+'：':'')+r.hear.t; if(caps.length!==1||caps[0]!==want) bad.push(r.id+' 認識了：'+J(caps)); else n++;
    caps.length=0; if(typeof HCIRCLE!=='undefined') HCIRCLE._capBusy=false; SHOPNPC.hear(GM); if(caps.length) bad.push(r.id+' 同一學期第二次'); }
  check('4. 認識她、走到旁邊＝畫面下方一句（照稿）；不認識沒有；同一學期只有一次（'+n+' 列）',!bad.length&&n>=8,bad.slice(0,5).join('｜'));
  /* 太遠、別的樓層、在演 */
  { const r=row('xs_dakou_bh'); const d=daysOf(r).find(d=>SHOPNPC.on(fresh(d,22.5),r)); let G=setup(r,d,22.5,true); putPlayer(r.seat[0]+3,r.seat[1],1); SHOPNPC.hear(GM); const far=caps.length;
    G=setup(r,d,22.5,true); putPlayer(r.seat[0]+1,r.seat[1],0); SHOPNPC.hear(GM); const lv=caps.length; G=setup(r,d,22.5,true); GM.E.player.busy=true; SHOPNPC.hear(GM); const busy=caps.length; GM.E.player.busy=false;
    G=setup(r,d,22.5,true); G.hour=23.1; SHOPNPC.hear(GM); const late=caps.length;
    check('4. 太遠（3 m）、不同樓層、在演（busy）、時段過了（她不照這張表在店裡）＝不出',far===0&&lv===0&&busy===0&&late===0,J([far,lv,busy,late])); }
  /* 學姊兩列合起來一學期一次 */
  { const s=row('xs_shanlan_sis'), a=row('aoki_sis'), c5=CHARACTERS.heroine_05, k5=c5.daily_schedule; c5.daily_schedule=[]; try{
      const wed=daysOf(a).find(d=>CALENDAR.termOf(d).week===3), sat=daysOf(s).find(d=>CALENDAR.termOf(d).week===4);
      let G=setup(a,wed,(a.from+a.to)/2,true); SHOPNPC.hear(GM); const c1=caps.slice();   /* 青木的時段照表（AA_705 補一節：單數週週日 16:30～18:00）*/ const F=G.flags.SHOPNPC_HEAR;
      c5.daily_schedule=k5;   /* 山嵐那一次：照真的作息（青木那一週撞到總圖＝山嵐照常）*/
      G=setup(s,sat,11.5,true); G.flags.SHOPNPC_HEAR=F; SHOPNPC.hear(GM); const c2=caps.slice();
      G=setup(s,sat,11.5,true); SHOPNPC.hear(GM); const c3=caps.slice();
      check('4. 學姊：青木聽過＝同一學期山嵐不再出（每個人每學期一次）；沒聽過＝山嵐出',c1.length===1&&c2.length===0&&c3.length===1&&c3[0]===s.hear.t,J([c1,c2,c3])); } finally { c5.daily_schedule=k5; } }
  /* 存檔 */
  { const r=row('afar_yt'); const d=daysOf(r).find(d=>SHOPNPC.on(fresh(d,16),r)); const G=setup(r,d,16,true); SHOPNPC.hear(GM); const T=CALENDAR.termOf(d).id;
    check('4. 記在 G.flags.SHOPNPC_HEAR＝{學期:{人物:那一天}}；舊存檔沒有＝沒聽過',!!G.flags.SHOPNPC_HEAR&&G.flags.SHOPNPC_HEAR[T]&&G.flags.SHOPNPC_HEAR[T].heroine_03===d&&!SHOPNPC.heard(fresh(d,16),'heroine_03')); } });

// ---------- 5. Alison 送爆米花 ----------
(async()=>{
await asec(5,async()=>{ const r=row('xs_nanyang_yu'); const fri=daysOf(r).find(d=>wdOf(d)===5&&CALENDAR.termOf(d).week===5);
  const enc=async(d,h,flags,picks)=>{ const G=fresh(d,h,flags); G.zone='xs_nanyang'; GM.npc={}; H.rel('yu',20,5,5); npcAt('yu',r.at[0],r.at[1],0); putPlayer(-2.6,-2.8,0); GM.D.active=false; H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); return G; };
  let G=await enc(fri,19,{},['「這樣可以嗎？」']); const due=SHOPNPC.alisonDue(GM); await SHOPNPC.alison(GM); const s1=H.said.map(s=>(s.who?s.who+'：':'')+s.t);
  const A=SHOP_NPC.alison, want=['（爆米花櫃檯後面的人戴著戲院的帽子。抬頭，是 Alison。）','Alison：欸！你怎麼來了？','Alison：我禮拜五禮拜六都在這裡。……你看哪一場？','（她把一桶爆米花推過來。）','Alison：剛剛多做的，不用錢。不要跟別人說。','Alison：多做的本來就要丟。拿去。','（你拿到一桶爆米花。）'];
  check('5. 第一次：走到櫃檯前（她 2.6 m 內）、認識她＝那一段；選「這樣可以嗎？」的回話；拿到爆米花（NY_POPCORN、SHOPNPC.popcorn）',due&&J(s1)===J(want)&&J(H.opts[0])===J(['「謝啦。」','「這樣可以嗎？」'])&&G.flags.NY_POPCORN===fri&&SHOPNPC.popcorn(G),J(s1));
  const F=G.flags.NY_ALISON;
  G=await enc(fri,19,{NY_ALISON:F},['「謝啦。」']); check('5. 同一學期再去＝不再演',!SHOPNPC.alisonDue(GM));
  G=await enc(fri+7,19,{NY_ALISON:JSON.parse(J(F))}); check('5. 同一學期下一週也不再演',!SHOPNPC.alisonDue(GM));
  /* 下一學期 */ const s2=daysOf(r,'Y1S2').find(d=>wdOf(d)===5&&CALENDAR.termOf(d).week===3);
  G=await enc(s2,19,{NY_ALISON:JSON.parse(J(F))}); const due2=SHOPNPC.alisonDue(GM); await SHOPNPC.alison(GM); const s2l=H.said.map(s=>s.t);
  check('5. 下一學期：隨機一句（三句之一，Alison 說），不是第一次那一段',due2&&s2l.length===1&&A.again.includes(s2l[0])&&H.said[0].who==='Alison',J(s2l));
  /* 姊姊那一句 */ let sisDays=0, sisOk=true; for(let k=0;k<12;k++){ const d=s2+7*0+k*0; }
  const cand=[]; for(let d=s2;d<s2+70;d++) if(wdOf(d)===5||wdOf(d)===6){ const T=CALENDAR.termOf(d); if(T&&T.id==='Y1S2') cand.push(d); }
  const picks=cand.map(d=>{ const g=fresh(d,19,{KNOWS_SIS_ALISON:true,NY_ALISON:{first:fri,terms:{},sis:{}}}); return SHOPNPC.alisonPick(g); });
  check('5. 有 KNOWS_SIS_ALISON：偶爾（約一半）換成姊姊那一句；沒有就不會',picks.includes('sis')&&picks.some(p=>p!=='sis')&&cand.every(d=>SHOPNPC.alisonPick(fresh(d,19,{NY_ALISON:{first:fri,terms:{},sis:{}}}))!=='sis'));
  const dS=cand[picks.indexOf('sis')]; G=await enc(dS,19,{KNOWS_SIS_ALISON:true,NY_ALISON:{first:fri,terms:{},sis:{}}}); await SHOPNPC.alison(GM); const sl=H.said.map(s=>s.t);
  check('5. 姊姊那一句照稿、記在這一學期（一學期最多一次）',J(sl)===J([A.sis])&&G.flags.NY_ALISON.sis.Y1S2===dS&&SHOPNPC.alisonPick(Object.assign({},G,{day:dS,flags:Object.assign({},G.flags,{NY_ALISON:{first:fri,terms:{},sis:{Y1S2:dS}}})}))!=='sis');
  /* 不認識、不在班 */ G=await enc(fri,19,{}); SOCIAL.rel('yu'); G.social.mem.yu=[]; check('5. 不認識 Alison＝不演',!SHOPNPC.alisonDue(GM));
  G=await enc(fri,17,{}); check('5. 不在她的班（17:00）＝不演',!SHOPNPC.alisonDue(GM));
  G=await enc(fri,19,{}); putPlayer(3,4,0); check('5. 太遠（大廳門口）＝不演',!SHOPNPC.alisonDue(GM)); });

// ---------- 6. 位置（子程序：真的建區域）----------
sec(6,()=>{ const r=cp.spawnSync(process.execPath,[__filename,'--zones'],{cwd:ROOT,encoding:'utf8',maxBuffer:1<<24,timeout:240000}); const outp=(r.stdout||'')+(r.stderr||'');
  for(const ln of outp.split('\n')){ const m=/^(PASS|FAIL) (.*)$/.exec(ln); if(m) check(m[2].split('　')[0],m[1]==='PASS',m[2].split('　')[1]||''); }
  check('6. 子程序跑完',r.status===0||/FAIL /.test(outp),r.status===0||/FAIL /.test(outp)?'':outp.slice(-300)); });

// ---------- 撞到的次數（給 AA）----------
console.log('INFO 撞到原本作息的次數（大一上，每一天看時段的開頭、中間、結尾三格；撞到＝那一格照原本的、不在店裡）：');
for(const r of ROWS){ const st=CLASH[r.id]; if(!st) continue; const w=Object.entries(st.why).sort((a,b)=>b[1]-a[1]).map(([k,v])=>k+' ×'+v).join('；'); console.log('INFO   '+r.shop+' '+NAME[r.who]+'：在店裡 '+st.on+'/'+st.cal+(w?'　撞到：'+w:'')); }
console.log(H.fails?('FAILED '+H.fails):'ALL PASS'); process.exit(H.fails?1:0);
})();

// ================= 子程序：真的建區域 =================
function zonesPhase(){ const J=JSON.stringify;
  global.window=global; global.self=global;
  const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
  global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
  global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
  console.warn=()=>{}; process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
  global.CHAR={build:spec=>{ const g=new THREE.Group(); g.userData.spec=spec; return g; },release(){},setProp(){ return false; }};
  global.STORY={extraSpec:i=>({id:'x'+i,sex:'f',i}),CROWD_X:2,noodleDay:()=>false,SCHED_X:[],dayOfKey:()=>0};
  let NPC={}; global.EVENTS={npcOf:id=>NPC[id]||null,running:false};
  let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
  const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'), srcs=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]);
  const want=new Set(['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/calendar.js','src/data/places.js','src/bike3d.js','src/data/shop_npc.js','src/shopnpc3d.js']);
  for(const s of srcs) if(/_layouts?\.js$/.test(s)||/(nanyang|shanlan|tongxian|dakou|xsshop|xsports|mokuyobi|bikeshop|gg2shops)3d\.js$/.test(s)) want.add(s);
  const errs=[]; for(const f of srcs.filter(s=>want.has(s))){ try{ vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (\w+)\s*=/mg,'globalThis.$1='),{filename:f}); }catch(e){ errs.push(f+'：'+String(e).slice(0,100)); } }
  check('6. 子程序載得到區域（店的配置與區域）',!errs.length&&typeof SHOPNPC!=='undefined',errs.join('；'));
  ASSETS.loadOne=()=>new Promise(()=>{});
  const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
  E.addNPC=n=>{ n.lv=n.lv|0; E.npcs.push(n); return n; };
  const build=id=>{ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(z.nav) z.nav._cm=null;
    E.player={obj:{position:new THREE.Vector3(z.spawn?z.spawn.x:0,0,z.spawn?z.spawn.z:0),rotation:{y:0}},radius:0.32,lv:0,seat:null}; return z; };
  const bad=[], seatBad=[], info=[];
  for(const r of SHOP_NPC.rows){ let z=null; try{ z=build(r.zone); }catch(e){ bad.push(r.zone+' 建不起來 '+e); continue; }
    if(r.pose==='seat'){ const [x,zz,lv]=r.seat; const st=(z.seats||[]).find(s=>Math.hypot(s.x-x,s.z-zz)<0.12&&(s.lv|0)===(lv|0)); if(!st) seatBad.push(r.id+' 不是店裡的座位'); else info.push(r.id+'＝'+(st.label||'座位')); }
    else { const [x,zz,yaw,lv]=r.at; const stand=r.clerk||!E.canStand||E.canStand(x,zz,0.3,lv|0);   /* 櫃檯後面（NY3.CLERK）是店員站的地方，導航格是櫃檯：玩家走不進去、她站著不動 */ const onBtn=(E.interactables||[]).filter(i=>!i.seat&&(i.lv|0)===(lv|0)&&Math.hypot(i.x-x,i.z-zz)<0.45).map(i=>i.label);
      if(r.pose==='floor'){ const L=typeof SHANLAN_LAYOUT!=='undefined'?SHANLAN_LAYOUT:null; if(!L||!L.floorSit.some(q=>Math.hypot(q.x-x,q.z-zz)<0.05&&(q.lv|0)===(lv|0)&&q.section==='法律')) bad.push(r.id+' 不是山嵐二樓法律區的坐地板位置'); continue; }
      if(!stand) bad.push(r.id+' 站不住 ('+x+','+zz+')'); if(onBtn.length) bad.push(r.id+' 壓在按鈕上：'+onBtn.join('、')); } }
  check('6. 站的列：那個點站得住（導航格）、不壓在按鈕上；學姊山嵐＝二樓法律區的坐地板位置',!bad.length,bad.join('｜'));
  check('6. 坐的列：配置裡那間店真的座位（同一層）',!seatBad.length,seatBad.join('｜')||info.join('、'));
  { const r=SHOP_NPC.rows.find(q=>q.hearBy==='alison'); const c=typeof NY3!=='undefined'&&NY3.CLERK; check('6. Alison：站在 NY3.CLERK（櫃檯後面）',!!c&&Math.abs(c.x-r.at[0])<1e-6&&Math.abs(c.z-r.at[1])<1e-6&&Math.abs(c.yaw-r.at[2])<1e-6,J(c)); }
  /* 位子：留給約好的人那一組、有人坐＝換最近的空位 */
  { const r=SHOP_NPC.rows.find(q=>q.id==='daybreak_ps'); const z=build(r.zone); const G={day:40,hour:11,zone:r.zone,flags:{}}; SHOPNPC._bindGM({G,E}); SHOPNPC._reset(); NPC={};
    const s0=SHOPNPC.seatFor(G,r); const me=z.seats.find(s=>Math.hypot(s.x-r.seat[0],s.z-r.seat[1])<0.12); const mate=z.seats.find(s=>s!==me&&s.table===me.table);
    global.CROWD={shopKeepSeats:()=>[me,mate]}; SHOPNPC._reset(); const s1=SHOPNPC.seatFor(G,r); const dist=s1?Math.hypot(s1.x-me.x,s1.z-me.z):99;
    const others=z.seats.filter(s=>s!==me&&s!==mate&&(s.lv|0)===0).map(s=>Math.hypot(s.x-me.x,s.z-me.z)); const nearest=Math.min(...others);
    delete global.CROWD; SHOPNPC._reset(); E.npcs=[{seat:{x:me.x,z:me.z,lv:0},obj:{position:{x:me.x,z:me.z}}}]; const s2=SHOPNPC.seatFor(G,r); E.npcs=[];
    E.player.seat={x:me.x,z:me.z}; SHOPNPC._reset(); const s3=SHOPNPC.seatFor(G,r); E.player.seat=null;
    check('6. Daybreak 沛珊：平常坐配置的靠窗兩人桌；那一組今天留給約好的兩個人（CROWD.shopKeepSeats）＝換最近的空位、也不坐那一組的另一張；有人坐、玩家坐著＝換位子',
      Math.hypot(s0.x-me.x,s0.z-me.z)<0.01&&!!mate&&Math.abs(dist-nearest)<1e-6&&Math.hypot(s1.x-mate.x,s1.z-mate.z)>0.1&&Math.hypot(s2.x-me.x,s2.z-me.z)>0.1&&Math.hypot(s3.x-me.x,s3.z-me.z)>0.1,J([s0,s1,s2,s3])); }
  /* 學姊坐在地上 */
  { const r=SHOP_NPC.rows.find(q=>q.id==='xs_shanlan_sis'); build(r.zone); SHOPNPC.spotsFor(E,r.zone); const sp=E.zone.spots&&E.zone.spots['shopnpc_'+r.id]; const [x,zz,yaw,lv]=r.at;
    const it={x,z:zz,lv:1,label:'坐在法律區看書',shlSit:{},get hidden(){ return false; }}; E.interactables.push(it);
    const n={seat:{x,z:zz,yaw,lv:1},obj:{position:{x,z:zz}},lv:1}; NPC={heroine_05:n}; let sat=null; const GMz={G:{zone:r.zone,day:40,hour:11,flags:{}},E,sitAt:(m,s)=>{ m.seat=s; sat=s; }};
    SHOPNPC.fixFloor(GMz); const h1=it.hidden; n.leaving=true; const h2=it.hidden; n.leaving=false; NPC={}; const h3=it.hidden;
    check('6. 學姊山嵐：區域的 spots 有她的位置；生出來以後坐在地上（floor）；她在的時候「坐在法律區看書」那一個按鈕藏起來、走了就回來',!!sp&&sp.lv===1&&!!sat&&sat.floor>0&&h1===true&&h2===false&&h3===false,J([sp,sat,h1,h2,h3])); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
}
