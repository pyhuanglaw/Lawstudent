// 新店面裡遇得到有名字的人（AA_705 第一批：大一上＋第二批：大一下～大四下、可昕；SHOP-NAMED-NPC-1105，USER_WANTS X251；src/data/shop_npc.js、src/shopnpc3d.js）——不需要瀏覽器。
//   0 載得到、index.html 的位置、STORY.SCHED_X 排在最後、劇情匯入白名單登記 AA_705／AA_615 @ ebea3a2b0
//   1 照稿：從企劃線 git show ebea3a2b0 讀 AA_705 的三張表，每一列的店、誰、星期、時間、週次、在哪、聽一句一字不差；AA_615 第 4 節（送爆米花）每一句一字不差
//   2 作息：每一列在大一上（第 2 週起）的每一個符合的日子、時段開頭／中間／結尾——沒撞到原本的作息＝STORY.schedEnt 就是這間店、這個 act；撞到＝照原本的（不出現）；
//     時段外、第 1 週、別的學期、經濟系那一年、店沒開（颱風天）、人不在＝不在；撞到的次數列出來（AA 要那張表）
//   3 撞到的規則：上課、讀書、在外面、有劇情標記的「走走」＝原本的優先；只有單純「在某一區走走」不算撞到；學姊同一週只留青木；子晴偶遇演完就走；Alison 照原本的打工作息在櫃檯
//   4 聽一句：走到旁邊（2.5 m、同一層）、認識她才出；每個人每學期一次（學姊兩列合起來一次）；不認識、太遠、在演、沒照這張表在店裡＝不出；字照稿
//   5 Alison 送爆米花：第一次那一段（兩個選項）＋NY_POPCORN；同一學期不再；下一學期隨機一句；KNOWS_SIS_ALISON 那一句一學期一次
//   6 位置（子程序：真的建區域）：站的點站得住、不壓在按鈕上；坐的列是那間店真的座位（同一層）；留給約好的人那一組、有人坐＝換最近的空位；學姊坐在地上、那個按鈕藏起來
//   7 第二批（AA_705 最後一節 @ 44af68368）：照稿（第二批那一節、AA_621 第 2 節柏翰那一句）；第一批每一列大一下～大四下都排（同一間、同一時段），人不在臺北照 presence 不出；
//     子晴同弦只有大一上；柏翰大口考試那兩週照 AA_621（02:30～05:00）；可昕頁間書屋（大一下起雙數週週六 14:00～15:30；交往中、那一天有約＝不出）；學姊一週最多一次（每一學期）
//   8 第二批的聽一句：只在大一上（大一下起照樣在那裡、不出）；學姊山嵐大二起判決評釋那一句（一次）；可昕、柏翰考試週那一句（一次）
//   9 第三批（AA_705 @ 2c62cdf1e）：表照稿＋「補：回 LAWWW-C 09:25」兩列換時段（大步阿凱週日 16:30～17:15）＋「補：回 LAWWW-C 10:06」好拍柏翰週六 14:00～14:30（原本週四 17:15～17:45 也永遠撞總圖）；撞時段表（0/N＝永遠撞＝FAIL）；阿凱週日慢輪→大步不重疊
//   10 AA_621 第 2 節阿哲（大一上期末考週 00:00～02:00）、芯慈（考試那兩週的週日 22:00～01:00，跨午夜）照稿、作息、那一句只出一次（AA_705 補 4f71f7719「也做」）；可昕交往中也出、交往版那一句
//   撞到的次數：大一上一張、大一下～大四下一張（每一列在店裡幾格、撞到什麼；AA 要那張表）
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
const B2=['xs_dakou_bh_exam','bookstore_kx'], B3=['xs_dabu_kai','xs_haopai_bh','xs_xsports_yu'], B4=['xs_dakou_zhe_exam','xs_dakou_xc_exam'], ROWS1=ROWS.filter(r=>!B2.includes(r.id)&&!B3.includes(r.id)&&!B4.includes(r.id));   /* B4：AA_621 第 2 節阿哲、芯慈（AA_705 補 4f71f7719「也做」）*/   /* 第三批（AA_705 @ a0f562527，AA_620 3-4 三列）*/   /* 第一批的列（第二批多的兩列：柏翰考試週 AA_621、可昕）*/
const LATER=['Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'];
const NAME={kexin:'可昕',heroine_01:'以安',heroine_02:'芷若',heroine_03:'語彤',heroine_04:'子晴',heroine_05:'學姊',zhe:'阿哲',yu:'Alison',classmate_bohan:'柏翰',classmate_xinci:'芯慈',classmate_mingxuan:'明軒',classmate_peishan:'沛珊',kai:'阿凱'};
const fresh=(d,h,flags)=>{ const G=H.fresh(keyOf(d),h,'campus',Object.assign({afternoonDone:true,MET_ZHE:true},flags||{})); G.hour=h; G.weekday=wdOf(d); SHOPNPC._reset(); return G; };
/* 大一上符合這一列的日子（不看撞不撞）*/
const daysOf=(r,termId)=>{ const out=[]; for(let d=D('2025-08-25');d<=D('2029-07-31');d++){ const T=CALENDAR.termOf(d); if(!T||T.id!==(termId||'Y1S1')) continue; if(r.days.includes(wdOf(d))) out.push(d); } return out; };

// ---------- 0. index.html、SCHED_X、白名單 ----------
sec(0,()=>{ const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'), a=f=>html.indexOf(f);
  check('0. index.html：shop_npc.js → shopnpc3d.js，在 story3d、shopenc3d、nanyang3d、guitar3d、examlib3d 以後、GAME.boot() 以前',
    a('src/data/shop_npc.js')>0&&a('src/data/shop_npc.js')<a('src/shopnpc3d.js')&&['src/story3d.js','src/shopenc3d.js','src/nanyang3d.js','src/guitar3d.js','src/examlib3d.js','src/shanlan3d.js'].every(f=>a(f)>0&&a(f)<a('src/data/shop_npc.js'))&&a('src/shopnpc3d.js')<a('GAME.boot()'));
  check('0. STORY.SCHED_X 有 SHOPNPC.sched、排在最後（別的模組加的作息都比較優先）；STORY.TICKS 有 SHOPNPC.tick',STORY.SCHED_X[STORY.SCHED_X.length-1]===SHOPNPC.sched&&STORY.TICKS.includes(SHOPNPC.tick),String(STORY.SCHED_X.length));
  const A=JSON.parse(fs.readFileSync(path.join(ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files;
  const f705=A.find(x=>/AA_705_/.test(x.path)), f615=A.find(x=>/AA_615_/.test(x.path));
  const f621=A.find(x=>/AA_621_/.test(x.path));
  check('0. 劇情匯入白名單：AA_705 @ 2c62cdf1e（補 10:06：柏翰好拍週六、阿哲宵夜；舊的 ebea3a2b0、f8bd25439、4e6755340、44af68368、a0f562527、15eb48dfa 在 history）、AA_615 @ ebea3a2b0、AA_621 @ 52e3d83a8 approved（SHOP_NPC.src 同一個 commit）',!!f705&&!!f615&&!!f621&&f705.sha==='2c62cdf1e'&&f621.sha==='52e3d83a8'&&['ebea3a2b0','f8bd25439','4e6755340','44af68368','a0f562527','15eb48dfa'].every(k=>(f705.history||[]).some(h=>h.sha===k))&&f615.sha==='ebea3a2b0'&&f705.status==='approved'&&f615.status==='approved'&&f621.status==='approved'&&SHOP_NPC.src.AA_705===f705.sha&&SHOP_NPC.src.AA_615===f615.sha&&SHOP_NPC.src.AA_621===f621.sha);
  check('0. 白名單的檔在那個 commit 找得到',!!git('2c62cdf1e',path.basename(f705.path))&&!!git('15eb48dfa',path.basename(f705.path))&&!!git('a0f562527',path.basename(f705.path))&&!!git('44af68368',path.basename(f705.path))&&!!git('ebea3a2b0',path.basename(f615.path))&&!!git('52e3d83a8',path.basename(f621.path))); });

// ---------- 1. 照稿 ----------
const DOC=git('44af68368','AA_705_新店面裡遇得到的人_第一批作息.md'), DOC621=git('52e3d83a8','AA_621_大口漢堡_24小時速食.md'), DOC615=git('ebea3a2b0','AA_615_新生南路那一側_公館二輪戲院_爆米花.md');
sec(1,()=>{ check('1. 讀得到企劃線的 AA_705（git show 44af68368）、AA_615（ebea3a2b0）、AA_621（52e3d83a8）',!!DOC&&!!DOC615&&!!DOC621);
  const WD={'日':0,'一':1,'二':2,'三':3,'四':4,'五':5,'六':6};
  const hm=s=>{ const [a,b]=s.split(':').map(Number); return a+b/60; };
  const tab=[]; let area=null; for(const ln of DOC.split('\n')){ const m=/^## (.+)$/.exec(ln); if(m){ area=m[1]; continue; } if(!/^\| /.test(ln)||/^\| 店 /.test(ln)||/^\|---/.test(ln)) continue; const c=ln.split('|').slice(1,-1).map(s=>s.trim()); if(c.length===6) tab.push({area,shop:c[0],who:c[1],day:c[2],time:c[3],place:c[4],hear:c[5]}); }
  check('1. 三張表共 18 列（新生南路 8、公館 6、溫州街 4）',tab.length===18&&tab.filter(t=>t.area==='新生南路').length===8&&tab.filter(t=>t.area==='公館').length===6&&tab.filter(t=>t.area==='溫州街').length===4,String(tab.length));
  const bad=[]; let n=0;
  /* AA_705 補一節（f8bd25439）：兩列換時段（表格本身沒改）——照補一節那張表的「改成」蓋過去 */
  const REV={'山嵐書店|以安':{day:'週六',time:'19:30～20:30',src:'**週六 19:30～20:30**'},'青木茶室|學姊':{day:'單數週週日',time:'16:30～18:00',src:'16:30～18:00'}};
  for(const t of tab){ const rv=REV[t.shop+'|'+t.who]; if(rv){ if(!DOC.includes(rv.src)) bad.push(t.shop+' 補一節找不到 '+rv.src); t.day=rv.day; t.time=rv.time; } }
  for(const t of tab){ const asIs=/^照現在/.test(t.place)||t.day==='—'; const r=ROWS1.find(q=>q.shop===t.shop&&NAME[q.who]===t.who);
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
  check('1. 每一列的店、誰、星期、時間、週次、在哪、聽一句照稿一字不差（'+n+' 列；照現在的 '+(SHOP_NPC.asIs||[]).length+' 位不另排）',!bad.length&&n===ROWS1.length,bad.slice(0,5).join('｜'));
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
  for(const r of ROWS){ if(r.hearBy==='alison'||B4.includes(r.id)) continue; const c=CHARACTERS[r.who]; const ds=daysOf(r);   /* B4（AA_621 考試週阿哲、芯慈）在第 10 節 */
    const T=d=>CALENDAR.termOf(d); const dOk=ds.find(d=>SHOPNPC.on(fresh(d,(r.from+r.to)/2),r)); if(dOk==null) continue;
    const at=(d,h,f)=>{ const G=fresh(d,h,f); const e=STORY.schedEnt(c,G); return !!(e&&e.shopNpc===r.id); };
    if(at(dOk,r.from-0.05)) off.push(r.id+' 時段前'); if(at(dOk,r.to+0.01)) off.push(r.id+' 時段後');
    const d1=ds.find(d=>T(d).week===1); if(d1!=null&&at(d1,(r.from+r.to)/2)) off.push(r.id+' 第 1 週');
    if((r.terms||SHOPNPC.TERMS).includes('Y1S2')!==(r.id!=='xs_tongxian_zq')) off.push(r.id+' 大一下的學期設定');   /* 第二批：子晴同弦以外都延到大一下（第 7 節）*/
    { const dS2=daysOf(r,'Y1S2').find(d=>T(d).week>=2); if(r.id==='xs_tongxian_zq'&&dS2!=null&&at(dS2,(r.from+r.to)/2)) off.push(r.id+' 大一下'); }
    // CANON-NO-ECON-1112：經濟系那一年拿掉（第 2 項裡「經濟系那一年不在」那一格）
    { const iso=PLACES.isOpen; PLACES.isOpen=(z,h,d)=>z===r.zone?false:iso.call(PLACES,z,h,d); try{ if(at(dOk,(r.from+r.to)/2)) off.push(r.id+' 店沒開'); } finally { PLACES.isOpen=iso; } } }
  check('2. 不在：時段前後、第 1 週、經濟系那一年、店沒開（颱風天、店休）；子晴同弦大一下不在（其他列大一下起照排，第 7 節）',!off.length,off.slice(0,6).join('｜'));
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
  for(const r of ROWS1){ if(!r.hear) continue; const d=daysOf(r).find(d=>SHOPNPC.on(fresh(d,(r.from+r.to)/2),r)); if(d==null){ continue; } const h=(r.from+r.to)/2;
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

// ---------- 7. 第二批：大一下～大四下、可昕、柏翰考試週（AA_705 最後一節 @ 44af68368）----------
const CLASH2={};
sec(7,()=>{ const s2=(DOC.split('## 第二批')[1]||''); const bad=[];
  check('7. 讀得到 AA_705 第二批那一節（44af68368）',!!s2&&/第一批的每一列延到大一下～大四下/.test(s2)&&/\*\*「聽一句」只在大一上\*\*（每人一次）/.test(s2));
  /* 照稿 */
  { const m=/大二起她已經考上，那一列的旁白（如果 LAWWW 那邊大一下以後也要出）換成：(（[^）]+）)/.exec(s2), L=row('xs_shanlan_sis').hearLater;
    if(!m||!L||L.from!=='Y2S1'||L.hear.who!==null||L.hear.t!==m[1]) bad.push('學姊大二起那一句'); }
  if(!/子晴 同弦：照 `AA_619`，只有大一上第 6、10、14 週/.test(s2)||J(row('xs_tongxian_zq').terms)!==J(['Y1S1'])||J(row('xs_tongxian_zq').weeks)!==J([6,10,14])) bad.push('子晴同弦只有大一上');
  { const ok=/柏翰 大口：照舊考試那兩週以外；考試那兩週照 `AA_621`/.test(s2), m=/- 柏翰：02:30～05:00（兩點半關門後過來；[^）]*）。柏翰：「([^」]+)」/.exec(DOC621), r=row('xs_dakou_bh_exam'), r0=row('xs_dakou_bh');
    if(!ok||!m||!r||r.from!==2.5||r.to!==5||!r.examOnly||J(r.days)!==J([0,1,2,3,4,5,6])||r.hear.who!=='classmate_bohan'||r.hear.t!==m[1]||!r.hearAny||r.src!=='AA_621'||!r0.noExam||J(r.seat)!==J(r0.seat)||r.zone!==r0.zone) bad.push('柏翰考試週照 AA_621'); }
  { const tl=s2.split('\n').find(l=>/^\| 頁間書屋 \|/.test(l)); const c=tl?tl.split('|').slice(1,-1).map(x=>x.trim()):[]; const r=row('bookstore_kx');
    const hs=/^可昕：(.+)$/.exec(c[4]||'');
    if(c.length!==5||c[1]!=='雙數週週六'||c[2]!=='14:00～15:30'||c[3]!==r.place||!hs||r.hear.who!=='kexin'||r.hear.t!==hs[1]||r.weeks!=='even'||J(r.days)!==J([6])||r.from!==14||r.to!==15.5||r.zone!=='bookstore'||r.act!=='read'||!r.hearAny) bad.push('可昕那一列 '+J(c));
    if(!/## 2\. 可昕（大一下起）/.test(s2)||J(r.terms)!==J(LATER)) bad.push('可昕大一下起');
    if(!/和她交往中、或她那一天跟你有約，照約的走，這一列不出/.test(s2)||!r.notDating||!r.noPlanDay) bad.push('可昕交往中、有約不出'); }
  check('7. 照稿：學姊大二起的旁白、子晴同弦只有大一上、柏翰考試週（AA_621 第 2 節 02:30～05:00 那一句）、可昕頁間書屋那一列（星期、時間、在哪、聽一句）一字不差',!bad.length,bad.join('｜'));

  /* 第一批每一列延到大一下～大四下＋撞到的次數 */
  const bad2=[], pres=[], noTerm=[]; let shown=0, tot=0, presN=0;
  for(const r of ROWS){ if(r.hearBy==='alison') continue; const c=CHARACTERS[r.who]; const st={cal:0,on:0,why:{},term:{}};
    for(const tid of LATER) for(const d of daysOf(r,tid)) for(const h of [r.from+0.03,(r.from+r.to)/2,r.to-0.03]){ const G=fresh(d,h); if(!SHOPNPC.calOk(G,r)) continue; st.cal++; tot++; const tt=st.term[tid]||(st.term[tid]=[0,0]); tt[1]++;
      const why=[]; const on=SHOPNPC.on(G,r,why); const e=STORY.schedEnt(c,G); const pr=STORY.presence(r.who,G);
      if(pr&&pr.here===false){ presN++; if(on||(e&&e.shopNpc===r.id)) pres.push(r.id+' '+keyOf(d)+' 人不在還在店裡'); }
      if(on){ st.on++; shown++; tt[0]++; const act=r.pose==='stand'?'linger':(r.act==='eat'?'eat':(r.act==='sit'?'sit':'read')); if(!e||e.shopNpc!==r.id||e.zone!==r.zone||e.act!==act) bad2.push(r.id+' '+keyOf(d)+' '+h.toFixed(2)+' 應在店裡：'+(e?e.zone+'/'+e.act:'null')); }
      else { if(e&&e.shopNpc===r.id) bad2.push(r.id+' '+keyOf(d)+' 撞到了還在店裡'); const b=SHOPNPC.base(c,G); const k=why[0]==='clash'&&b?(b.zone||b.away||'')+'／'+b.act+(b.note?'（'+String(b.note).slice(0,18)+'）':(b.label?'（'+b.label+'）':'')):why.join(','); st.why[k]=(st.why[k]||0)+1; } }
    CLASH2[r.id]=st; if(r.id!=='xs_tongxian_zq'){ const miss=LATER.filter(t=>(r.terms||LATER).includes(t)&&!(st.term[t]&&st.term[t][1]>0)); if(miss.length) noTerm.push(r.id+' '+miss.join('、')); } }
  check('7. 第一批每一列（子晴同弦以外）大一下～大四下每一學期都排（同一間、同一時段、週次照每學期）；可昕大一下起每一學期都排',!noTerm.length,noTerm.join('｜'));
  check('7. 大一下～大四下：沒撞到＝作息就是這間店、這個 act；撞到＝照原本的（'+shown+'/'+tot+' 格在店裡）',!bad2.length&&shown>0,bad2.slice(0,5).join('｜'));
  check('7. 人不在臺北（presence：交換、回老家、畢業以後…）的日子不出現（'+presN+' 格人不在）',!pres.length&&presN>0,pres.slice(0,5).join('｜'));
  check('7. 子晴同弦：大一下～大四下都不排（AA_619 只有大一上）',CLASH2.xs_tongxian_zq.cal===0,J(CLASH2.xs_tongxian_zq));
  check('7. 第一批的時段沒變（同一間、同一時段）：每一列的 terms 沒寫（＝大一上～大四下）或只有子晴同弦是大一上',ROWS1.every(r=>r.terms==null||r.id==='xs_tongxian_zq')&&J(SHOPNPC.TERMS)===J(['Y1S1'].concat(LATER)));
  /* 第 2 週起只在大一上 */
  { const r=row('xs_dabu_zhe'); const d1=daysOf(r,'Y1S2').find(d=>CALENDAR.termOf(d).week===1); const dY1=daysOf(r,'Y1S1').find(d=>CALENDAR.termOf(d).week===1);
    check('7. 「第 2 週起」只在大一上（開學第一週大家還不熟這些店）：大一下第 1 週照排',d1!=null&&SHOPNPC.calOk(fresh(d1,16),r)&&(dY1==null||!SHOPNPC.calOk(fresh(dY1,16),r))); }
  /* 學姊一週最多一次（每一學期）*/
  { const s=row('xs_shanlan_sis'), a=row('aoki_sis'); const wk={}, cnt=[0,0];
    for(const tid of ['Y1S1'].concat(LATER)) for(const [k,r] of [[0,s],[1,a]]) for(const d of daysOf(r,tid)){ const T=CALENDAR.termOf(d); const G=fresh(d,(r.from+r.to)/2); if(SHOPNPC.on(G,r)){ cnt[k]++; const key=T.id+'#'+T.week; (wk[key]=wk[key]||[]).push(k); } }
    const dup=Object.keys(wk).filter(w=>wk[w].length>1); check('7. 學姊一週最多一次：大一上～大四下山嵐、青木都出現過，沒有一週兩個都出現',cnt[0]>0&&cnt[1]>0&&!dup.length,J({cnt,dup:dup.slice(0,4)})); }
  /* 柏翰考試週 */
  { const r=row('xs_dakou_bh_exam'), r0=row('xs_dakou_bh'), c=CHARACTERS.classmate_bohan; const res=[];
    for(const tid of ['Y1S1'].concat(LATER)){ const ex=daysOf(r,tid).filter(d=>CALENDAR.termOf(d).exam), non=daysOf(r,tid).filter(d=>!CALENDAR.termOf(d).exam&&CALENDAR.termOf(d).week>=2);
      const inX=ex.filter(d=>(STORY.schedEnt(c,fresh(d,3.5))||{}).shopNpc==='xs_dakou_bh_exam').length, inN=non.filter(d=>(STORY.schedEnt(c,fresh(d,3.5))||{}).shopNpc).length;
      const late=ex.filter(d=>(STORY.schedEnt(c,fresh(d,5.2))||{}).shopNpc).length+ex.filter(d=>(STORY.schedEnt(c,fresh(d,2.3))||{}).shopNpc).length;
      const normalInExam=ex.filter(d=>r0.days.includes(wdOf(d))&&(STORY.schedEnt(c,fresh(d,22.5))||{}).shopNpc).length;
      res.push(tid+' '+inX+'/'+ex.length+(inN?' 平常週 '+inN:'')+(late?' 時段外 '+late:'')+(normalInExam?' 考試週22:10 '+normalInExam:'')); if(inN||late||normalInExam||!inX) bad.push(tid); }
    check('7. 柏翰大口：考試那兩週 02:30～05:00 在（AA_621 第 2 節），02:30 以前、05:00 以後、平常週不在這一列；考試那兩週 22:10 那一列不在（照舊）',res.every(x=>!/平常週|時段外|考試週22/.test(x))&&res.every(x=>!/ 0\//.test(x)),res.join('；')); }
  /* 可昕 */
  { const r=row('bookstore_kx'), c=CHARACTERS.kexin; const sat=LATER.map(t=>daysOf(r,t).find(d=>CALENDAR.termOf(d).week%2===0&&SHOPNPC.on(fresh(d,14.5),r))); const d0=sat[0];
    const inS=(d,h,f,pre)=>{ const G=fresh(d,h,f); if(pre) pre(G); SHOPNPC._reset(); const e=STORY.schedEnt(c,G); return !!(e&&e.shopNpc==='bookstore_kx'&&e.zone==='bookstore'&&e.act==='linger'); };
    const odd=daysOf(r,'Y1S2').find(d=>CALENDAR.termOf(d).week%2===1&&CALENDAR.termOf(d).week>1), y1=daysOf(r,'Y1S1').filter(d=>CALENDAR.termOf(d).week%2===0);
    // CANON-NO-ECON-1112：經濟系那一年拿掉（第 7 項可昕頁間書屋「經濟系那一年不在」那一格）
    const o={every:sat.every(d=>d!=null),in:inS(d0,14.5),before:inS(d0,13.9),after:inS(d0,15.6),odd:inS(odd,14.5),y1:y1.some(d=>inS(d,14.5)),
      dating:inS(d0,14.5,{dating_kexin:true}),ex:inS(d0,14.5,{dating_kexin:false,EX_kexin:true}),
      inv:inS(d0,14.5,null,G=>{ G.invites=[{id:'iv1',who:'kexin',day:d0,h:19,place:'cafe',state:'accepted'}]; }),
      invOther:inS(d0,14.5,null,G=>{ G.invites=[{id:'iv1',who:'heroine_01',day:d0,h:19,place:'cafe',state:'accepted'}]; }),
      invDeclined:inS(d0,14.5,null,G=>{ G.invites=[{id:'iv1',who:'kexin',day:d0,h:19,place:'cafe',state:'missed'}]; }),
      trip:inS(d0,14.5,null,G=>{ G.trips=[{trip:1,who:'kexin',day:d0,depart:9,back:20,kind:'day',status:'booked'}]; }),
      tripYday:inS(d0,14.5,null,G=>{ G.trips=[{trip:1,who:'kexin',day:d0-1,depart:9,back:20,kind:'day',status:'done'}]; }),
      outing:inS(d0,14.5,null,G=>{ G.outings=[{id:'hv_kexin_'+d0,ev:'ev_hv_kx',day:d0,h:18,state:'planned'}]; }),
      pres:(()=>{ const ds=[]; for(const t of LATER) for(const d of daysOf(r,t)) if(SHOPNPC.calOk(fresh(d,14.5),r)&&STORY.presence('kexin',fresh(d,14.5)).here===false) ds.push(d); return ds.length?ds.every(d=>!inS(d,14.5)):'none'; })()};
    check('7. 可昕頁間書屋：大一下～大四下雙數週週六 14:00～15:30 在法律書那一櫃前面（站著）；時段外、單數週、大一上、經濟系那一年不在',o.every&&o.in&&!o.before&&!o.after&&!o.odd&&!o.y1,J(o));
    { const D4=git('15eb48dfa','AA_705_新店面裡遇得到的人_第一批作息.md')||''; const okDoc=/\*\*改\*\*：交往中也會在頁間遇到，只有那一天跟你有約才不出。/.test(D4);
      const datInv=inS(d0,14.5,{dating_kexin:true},G=>{ G.invites=[{id:'iv1',who:'kexin',day:d0,h:19,place:'cafe',state:'accepted'}]; });
      check('7. 可昕（AA_705 補 4f71f7719）：和她交往中（dating_kexin）也照排（SHOPNPC.KX_DATING_OFF=false）；交往中那一天跟你有約＝不出；分開以後（EX_kexin）照排',okDoc&&SHOPNPC.KX_DATING_OFF===false&&o.dating&&!datInv&&o.ex,J({okDoc,datInv,o})); }
    check('7. 可昕：那一天跟你有約（邀約答應了、校外約會、去她的縣市那種出遊）＝整天不出（約的時間以外也不出）；約的是別人、邀約沒成、前一天的約會＝照排',!o.inv&&!o.trip&&!o.outing&&o.invOther&&o.invDeclined&&o.tripYday,J(o));
    check('7. 可昕：回高雄（presence）的日子不出',o.pres===true||o.pres==='none',J(o.pres));
    { const G=fresh(d0,19); G.invites=[{id:'iv1',who:'kexin',day:d0,h:19,place:'cafe',state:'accepted'}]; SHOPNPC._reset(); const e=STORY.schedEnt(c,G); check('7. 可昕有約的那一天，約的時間照約（INV.entryFor），不是書店',!(e&&e.shopNpc),J(e&&{z:e.zone,a:e.act})); } } });

// ---------- 8. 第二批的聽一句 ----------
sec(8,()=>{ const bad=[]; let n=0;
  /* 大一下起照樣在那裡、不出同一句 */
  for(const r of ROWS1){ if(!r.hear) continue; for(const tid of LATER){ const d=daysOf(r,tid).find(d=>SHOPNPC.on(fresh(d,(r.from+r.to)/2),r)); if(d==null) continue; const h=(r.from+r.to)/2;
      setup(r,d,h,true); const there=SHOPNPC.rowNow(H.G,r.who)===r; SHOPNPC.hear(GM); if(!there) bad.push(r.id+' '+tid+' 不在店裡'); else n++;
      if(caps.length&&!(r.hearLater&&LATER.indexOf(tid)>=LATER.indexOf(r.hearLater.from)&&caps[0]===r.hearLater.hear.t)) bad.push(r.id+' '+tid+' 出了 '+J(caps)); } }
  check('8. 聽一句只在大一上：大一下～大四下照樣在店裡（rowNow）、認識、走到旁邊＝不出同一句（'+n+' 格）',!bad.length&&n>=12*5,bad.slice(0,5).join('｜'));
  /* 學姊山嵐：大一上考古題、大一下沒有、大二起判決評釋（一次）*/
  { const s=row('xs_shanlan_sis'), c5=CHARACTERS.heroine_05, k5=c5.daily_schedule; const out=[]; let F=null;
    const one=(tid,keep)=>{ const d=daysOf(s,tid).find(d=>SHOPNPC.on(fresh(d,11.5),s)); if(d==null) return 'none'; const G=setup(s,d,11.5,true); if(keep) G.flags.SHOPNPC_HEAR1=JSON.parse(J(keep)); SHOPNPC.hear(GM); F=G.flags.SHOPNPC_HEAR1||null; return caps.slice(); };
    const a=one('Y1S1'), b=one('Y1S2'), c=one('Y2S1'), F2=F, dd=one('Y2S2',F2), e=one('Y3S1');
    check('8. 學姊山嵐：大一上＝考古題那一句；大一下不出；大二起＝判決評釋那一句（旁白），只出一次（G.flags.SHOPNPC_HEAR1）；沒聽過的存檔大三也出',J(a)===J([s.hear.t])&&J(b)===J([])&&J(c)===J([s.hearLater.hear.t])&&!!F2&&F2['xs_shanlan_sis@Y2S1']!=null&&J(dd)===J([])&&J(e)===J([s.hearLater.hear.t]),J([a,b,c,dd,e])); }
  /* 可昕 */
  { const r=row('bookstore_kx'); const ds=daysOf(r,'Y1S2').filter(d=>SHOPNPC.on(fresh(d,14.5),r)); const want=SOCIAL.npcName('kexin')+'：'+r.hear.t;
    let G=setup(r,ds[0],14.5,true); G.flags.EX_kexin=true; SHOPNPC.hear(GM); const c1=caps.slice(), F=JSON.parse(J(G.flags.SHOPNPC_HEAR1||{}));
    G=setup(r,ds[1],14.5,true); G.flags.SHOPNPC_HEAR1=JSON.parse(J(F)); SHOPNPC.hear(GM); const c2=caps.slice();
    const d3=daysOf(r,'Y2S1').find(d=>SHOPNPC.on(fresh(d,14.5),r)); G=setup(r,d3,14.5,true); G.flags.SHOPNPC_HEAR1=JSON.parse(J(F)); SHOPNPC.hear(GM); const c3=caps.slice();
    G=setup(r,d3,14.5,true); G.flags.SHOPNPC_HEAR1={}; SHOPNPC.hear(GM); const c4=caps.slice();
    G=setup(r,ds[0],14.5,false); SOCIAL.rel('kexin'); G.social.mem.kexin=[]; SHOPNPC.hear(GM); const c5=caps.slice();
    check('8. 可昕：走到旁邊＝「'+r.hear.t+'」（她說的）；只出一次（下一次、下學期都不出）；沒聽過的存檔大二上也出；不認識（沒交往過、沒見過）不出',J(c1)===J([want])&&!!F.bookstore_kx&&J(c2)===J([])&&J(c3)===J([])&&J(c4)===J([want])&&J(c5)===J([]),J([c1,c2,c3,c4,c5])); }
  /* 柏翰考試週 */
  { const r=row('xs_dakou_bh_exam'); const ds=daysOf(r,'Y1S2').filter(d=>CALENDAR.termOf(d).exam&&SHOPNPC.on(fresh(d,3.5),r)); const want=SOCIAL.npcName('classmate_bohan')+'：'+r.hear.t;
    let G=setup(r,ds[0],3.5,true); SHOPNPC.hear(GM); const c1=caps.slice(), F=JSON.parse(J(G.flags.SHOPNPC_HEAR1||{}));
    const d2=daysOf(r,'Y2S1').find(d=>CALENDAR.termOf(d).exam&&SHOPNPC.on(fresh(d,3.5),r)); G=setup(r,d2,3.5,true); G.flags.SHOPNPC_HEAR1=F; SHOPNPC.hear(GM); const c2=caps.slice();
    const d0=daysOf(r,'Y1S1').find(d=>CALENDAR.termOf(d).exam&&SHOPNPC.on(fresh(d,3.5),r)); G=setup(r,d0,3.5,true); SHOPNPC.hear(GM); const c3=caps.slice();
    check('8. 柏翰考試週（AA_621）：02:30～05:00 走到旁邊＝「'+r.hear.t+'」；只出一次（下一次考試週不出）；大一上也可以（不限大一上）',J(c1)===J([want])&&J(c2)===J([])&&J(c3)===J([want]),J([c1,c2,c3])); } });

// ---------- 9. 第三批（AA_705 @ 2c62cdf1e；使用者 11-05 09:2x「不要新的人物」：只補 AA_620 3-4 三列；「補：回 LAWWW-C 09:25」兩列換時段；「補：回 LAWWW-C 10:06」柏翰好拍再換週六 14:00～14:30）----------
sec(9,()=>{ const DOC3=git('2c62cdf1e','AA_705_新店面裡遇得到的人_第一批作息.md')||''; const s3=(DOC3.split('## 第三批')[1]||'').split('\n## ')[0]; const bad=[];
  const s925=(DOC3.split('## 補：回 LAWWW-C 09:25')[1]||'').split('\n## ')[0];
  check('9. 讀得到 AA_705 第三批那一節（2c62cdf1e）：只用主要角色、二十位同學不排、不再加時段',!!s3&&/法律系二十位同學不排進店裡/.test(s3)&&/不再加時段、不加人/.test(s3));
  const WD={'日':0,'一':1,'二':2,'三':3,'四':4,'五':5,'六':6}, hm=x=>{ const [a,b]=x.split(':').map(Number); return a+b/60; };
  const TERM0={'大一上起':'Y1S1','大一下起':'Y1S2','大二起':'Y2S1'};
  const lines=s3.split('\n').filter(l=>/^\| /.test(l)&&!/^\| 店 /.test(l)&&!/^\|---/.test(l));
  check('9. 第三批的表三列＝SHOP_NPC 的三列（'+B3.join('、')+'）',lines.length===3&&B3.every(id=>!!row(id)),String(lines.length));
  /* 09:25 那張表（選 A 換時段）：「原本」要對得上第三批的表，「改成」（粗體）蓋過去 */
  const REV3={}; for(const l of s925.split('\n').filter(l=>/^\| /.test(l)&&!/^\| 列 /.test(l)&&!/^\|---/.test(l))){ const c=l.split('|').slice(1,-1).map(x=>x.trim()); const k=/^(\S+) (\S+)$/.exec(c[0]), m=/^\*\*(週[日一二三四五六]) (\d+:\d+～\d+:\d+)\*\*/.exec(c[2]||''); if(!k||!m){ bad.push('09:25 表看不懂 '+l); continue; } REV3[k[1]+'|'+k[2]]={orig:c[1],day:m[1],time:m[2]}; }
  check('9. 讀得到 2c62cdf1e「補：回 LAWWW-C 09:25」：大步阿凱、好拍柏翰兩列換時段（句子照舊、Alison 照現在）',Object.keys(REV3).length===2&&!!REV3['大步|阿凱']&&!!REV3['好拍|柏翰']&&/句子照舊；Alison 照現在/.test(s925),J(REV3));
  /* 最新的補（10:06）：「**好拍 柏翰**：……改 **週六 14:00～14:30**（大一下起；……）。句子照舊。」蓋過 09:25 那一格的「改成」（「原本」照舊對第三批的表）*/
  const s1006=(DOC3.split('## 補：回 LAWWW-C 10:06')[1]||'').split('\n## ')[0]; let n1006=0;
  for(const l of s1006.split('\n')){ const m=/^\d+\. \*\*(\S+) (\S+)\*\*：.*改 \*\*(週[日一二三四五六]) (\d+:\d+～\d+:\d+)\*\*（(大一上起|大一下起|大二起)/.exec(l); if(!m) continue; const k=m[1]+'|'+m[2]; if(!REV3[k]){ bad.push('10:06 的列在 09:25 表找不到 '+k); continue; } if(!/句子照舊/.test(l)) bad.push('10:06 '+k+' 沒寫句子照舊'); REV3[k].day=m[3]; REV3[k].time=m[4]; REV3[k].from=m[5]; n1006++; }
  check('9. 讀得到 2c62cdf1e「補：回 LAWWW-C 10:06」第 1 點：好拍柏翰改週六 14:00～14:30（大一下起、句子照舊）',n1006===1&&REV3['好拍|柏翰'].day==='週六'&&REV3['好拍|柏翰'].time==='14:00～14:30'&&REV3['好拍|柏翰'].from==='大一下起',J(REV3['好拍|柏翰']));
  for(const l of lines){ const c=l.split('|').slice(1,-1).map(x=>x.trim()); const r=ROWS.find(q=>B3.includes(q.id)&&q.shop===c[0]&&NAME[q.who]===c[1]); if(!r){ bad.push(c[0]+' '+c[1]+' 沒有這一列'); continue; }
    { const k=Object.keys(REV3).find(k=>c[0].startsWith(k.split('|')[0])&&c[1]===k.split('|')[1]); if(k){ const v=REV3[k]; if(!v.orig.startsWith(c[3]+' '+c[4].split('（')[0])) bad.push(r.id+' 09:25 的「原本」對不上第三批的表 '+v.orig); c[3]=v.day; c[4]=v.time; } }
    const t0=TERM0[c[2]], want=t0?['Y1S1'].concat(LATER).slice(['Y1S1'].concat(LATER).indexOf(t0)):null; if(!want||J(r.terms||['Y1S1'].concat(LATER))!==J(want)) bad.push(r.id+' 學期 '+c[2]);
    const days=[...c[3].matchAll(/週([日一二三四五六])/g)].map(m=>WD[m[1]]); if(J(days)!==J(r.days)) bad.push(r.id+' 星期');
    const tm=/^(\d+:\d+)～(\d+:\d+)/.exec(c[4]); if(!tm||Math.abs(hm(tm[1])-r.from)>1e-6||Math.abs(hm(tm[2])-r.to)>1e-6) bad.push(r.id+' 時間 '+c[4]);
    if(c[5]!==r.place) bad.push(r.id+' 在哪 '+c[5]+'≠'+r.place);
    const sm=/^([^（：]+)：(.+)$/.exec(c[6]); if(!sm||NAME[r.hear.who]!==sm[1]||r.hear.t!==sm[2]||!r.hearAny) bad.push(r.id+' 聽一句 '+c[6]); }
  check('9. 三列的店、誰、學期起點、星期、時間（大步阿凱照 09:25、好拍柏翰照 10:06 換過的）、在哪、聽一句（一次＝hearAny）照稿一字不差',!bad.length,bad.join('｜'));
  /* 撞時段（全部學期；撞到＝原本優先）*/
  const info=[]; let shown=0; const wrong=[];
  for(const id of B3){ const r=row(id), c=CHARACTERS[r.who]; const st={on:0,cal:0,why:{}};
    for(const tid of (r.terms||['Y1S1'].concat(LATER))) for(const d of daysOf(r,tid)) { const h=(r.from+r.to)/2; const G=fresh(d,h); if(!SHOPNPC.calOk(G,r)) continue; st.cal++; const why=[]; const on=SHOPNPC.on(G,r,why); const e=STORY.schedEnt(c,G);
      if(on){ st.on++; shown++; if(!e||e.shopNpc!==r.id||e.zone!==r.zone) wrong.push(id+' '+keyOf(d)); } else { const b=SHOPNPC.base(c,G); const k=why[0]==='clash'&&b?(b.zone||b.away||'')+'／'+b.act:why.join(','); st.why[k]=(st.why[k]||0)+1; } }
    info.push(r.shop+' '+NAME[r.who]+' '+st.on+'/'+st.cal+(Object.keys(st.why).length?' 撞到 '+Object.entries(st.why).map(([k,v])=>k+'×'+v).join('；'):'')); }
  console.log('INFO 第三批撞到原本作息（時段中間一格／每一天；2c62cdf1e 換時段以後）：'); for(const x of info) console.log('INFO   '+x);
  for(const x of info) if(/ 0\/\d+/.test(x)) console.log('WARN   永遠撞（要請 AA 再換時段）：'+x);
  check('9. 第三批三列都遇得到（沒有永遠撞的列；2c62cdf1e 柏翰好拍改週六以後）',info.length===3&&info.every(x=>!/ 0\/\d+/.test(x)),info.filter(x=>/ 0\/\d+/.test(x)).join('｜'));
  check('9. 沒撞到＝作息就是那間店（Alison 不在戲院的日子也照表，SHOPNPC.sched 的 yu 先看戲院再看表）',!wrong.length&&shown>0,wrong.slice(0,4).join('｜'));
  /* 大一上不排柏翰好拍、大一上～大一下不排 Alison */
  { const bh=row('xs_haopai_bh'), yu=row('xs_xsports_yu'); const y1=daysOf(bh,'Y1S1').some(d=>SHOPNPC.calOk(fresh(d,(bh.from+bh.to)/2),bh)), y1y=['Y1S1','Y1S2'].some(t=>daysOf(yu,t).some(d=>SHOPNPC.on(fresh(d,13.5),yu)));
    check('9. 柏翰好拍大一下起（大一上不排）、Alison 運動廣場大二起（大一不排）',!y1&&!y1y&&daysOf(bh,'Y1S2').some(d=>SHOPNPC.calOk(fresh(d,(bh.from+bh.to)/2),bh))); }
  /* 阿凱同一個週日：慢輪 15:00～16:00 → 大步 16:30～17:15，不重疊 */
  { const a=row('bikeshop_kai'), b=row('xs_dabu_kai'); const ov=a.days.some(w=>b.days.includes(w))&&a.from<b.to&&b.from<a.to; const both=daysOf(b,'Y2S1').filter(d=>SHOPNPC.on(fresh(d,15.5),a)&&SHOPNPC.on(fresh(d,16.9),b)).length;
    const gap=daysOf(b,'Y2S1').filter(d=>{ const e=STORY.schedEnt(CHARACTERS.kai,fresh(d,16.2)); return e&&e.shopNpc; }).length;
    check('9. 阿凱週日：慢輪 15:00～16:00、大步 16:30～17:15 時段不重疊，同一天兩間都遇得到（'+both+' 天）；16:00～16:30 中間不在任何一間',!ov&&both>0&&gap===0,J({ov,both,gap})); }
  /* Alison 週五週六照舊在戲院 */
  { const r0=row('xs_nanyang_yu'), d=daysOf(r0,'Y2S1').find(d=>wdOf(d)===5&&CALENDAR.termOf(d).week===5); const e=d!=null?STORY.schedEnt(CHARACTERS.yu,fresh(d,19)):null;
    check('9. Alison 週五晚上照舊在南洋戲院（第三批沒蓋掉戲院那一列）',!!e&&e.shopNpc==='xs_nanyang_yu',e?e.zone:'null'); } });

// ---------- 10. AA_621 第 2 節阿哲、芯慈（AA_705 補 4f71f7719「也做」）＋可昕交往中那一句 ----------
sec(10,()=>{ const D4=git('4f71f7719','AA_705_新店面裡遇得到的人_第一批作息.md')||'', bad=[];
  check('10. 讀得到 AA_705 補（4f71f7719）：AA_621 第 2 節的阿哲、芯慈和她們的句子「也做」',/`AA_621` 第 2 節的阿哲（大一上期末考週 00:00～02:00）、芯慈（考試那幾週的週日 22:00～01:00）和她們的句子/.test(D4)&&/\*\*也做\*\*，照 `AA_621` 原稿/.test(D4));
  const mz=/- 阿哲：00:00～02:00，大一上期末考週（([^）]+)）。阿哲：「([^」]+)」/.exec(DOC621), mx=/- 芯慈：考試那兩週的週日 22:00～01:00。芯慈：「([^」]+)」/.exec(DOC621);
  const z=row('xs_dakou_zhe_exam'), x=row('xs_dakou_xc_exam'), bh=row('xs_dakou_bh_exam');
  if(!mz||!z||z.src!=='AA_621'||z.who!=='zhe'||z.zone!=='xs_dakou'||z.from!==0||z.to!==2||z.examOnly!=='final'||J(z.terms)!==J(['Y1S1'])||J(z.days)!==J([0,1,2,3,4,5,6])||z.place!=='大一上期末考週（'+mz[1]+'）'||z.hear.who!=='zhe'||z.hear.t!==mz[2]||!z.hearAny) bad.push('阿哲 '+J(mz));
  if(!mx||!x||x.src!=='AA_621'||x.who!=='classmate_xinci'||x.zone!=='xs_dakou'||x.from!==22||x.to!==25||x.examOnly!==true||x.terms!=null||J(x.days)!==J([0])||x.hear.who!=='classmate_xinci'||x.hear.t!==mx[1]||!x.hearAny) bad.push('芯慈 '+J(mx));
  if(!z||!x||z.pose!=='seat'||x.pose!=='seat'||z.seat[2]!==1||x.seat[2]!==1||J(z.seat)===J(bh.seat)||J(x.seat)===J(bh.seat)||J(z.seat)===J(x.seat)) bad.push('位子（二樓、三個人各一張）');
  check('10. 照稿：阿哲（大一上期末考週 00:00～02:00、他從宿舍下來…、那一句）、芯慈（考試那兩週的週日 22:00～01:00、那一句）一字不差；都坐二樓、和柏翰那張錯開',!bad.length,bad.join('｜'));
  /* 可昕交往中那一句 */
  { const r=row('bookstore_kx'); const m=/交往中的那一句：可昕：(.+?)（沒交往照原句）/.exec(D4); const ds=daysOf(r,'Y1S2').filter(d=>SHOPNPC.on(fresh(d,14.5),r)); const nm=SOCIAL.npcName('kexin')+'：';
    let G=setup(r,ds[0],14.5,true); G.flags.dating_kexin=true; SHOPNPC.hear(GM); const c1=caps.slice(), F=JSON.parse(J(G.flags.SHOPNPC_HEAR1||{}));
    G=setup(r,ds[1],14.5,true); G.flags.dating_kexin=true; G.flags.SHOPNPC_HEAR1=JSON.parse(J(F)); SHOPNPC.hear(GM); const c2=caps.slice();
    G=setup(r,ds[0],14.5,true); G.flags.EX_kexin=true; SHOPNPC.hear(GM); const c3=caps.slice();
    check('10. 可昕（AA_705 補 4f71f7719）：交往中走到旁邊＝交往版那一句「'+(m&&m[1])+'」（一字不差）；只出一次；沒交往（分開以後）照原句',!!m&&!!r.hearDating&&r.hearDating.who==='kexin'&&r.hearDating.t===m[1]&&J(c1)===J([nm+m[1]])&&F.bookstore_kx!=null&&J(c2)===J([])&&J(c3)===J([nm+r.hear.t]),J([m&&m[1],c1,c2,c3])); }
  if(!z||!x) return;
  /* 阿哲：日曆上期末考週那幾天的 00:00～02:00（還沒睡＝前一天的 24～26 點也算）*/
  { const c=CHARACTERS.zhe, inZ=(d,h)=>{ const G=fresh(d,h); const e=STORY.schedEnt(c,G); return !!(e&&e.shopNpc==='xs_dakou_zhe_exam'&&e.zone==='xs_dakou'&&e.act==='read'); };
    const fin=daysOf(z).filter(d=>CALENDAR.termOf(d).exam==='final'), mid=daysOf(z).filter(d=>CALENDAR.termOf(d).exam==='mid'), w15=daysOf(z).filter(d=>CALENDAR.termOf(d).week===15);
    const fin2=daysOf(z,'Y1S2').filter(d=>CALENDAR.termOf(d).exam==='final');
    const o={fin:fin.length, in1:fin.filter(d=>inZ(d,1)).length, up:fin.filter(d=>inZ(d-1,25)).length, at0:fin.filter(d=>inZ(d,0.02)).length, after:fin.filter(d=>inZ(d,2.05)).length, before:fin.filter(d=>inZ(d,23.9)).length,
      mid:mid.filter(d=>inZ(d,1)).length, w15:w15.filter(d=>inZ(d,1)).length, y1s2:fin2.filter(d=>inZ(d,1)).length};
    check('10. 阿哲：大一上期末考週每一天 00:00～02:00 在大口二樓讀書（沒撞到原本的作息；還沒睡的 G.hour 25 也算）；02:00 以後、23:59、期中週、第 15 週、大一下期末考週都不在',o.fin===7&&o.in1===7&&o.up===7&&o.at0===7&&!o.after&&!o.before&&!o.mid&&!o.w15&&!o.y1s2,J(o)); }
  /* 芯慈：考試那兩週（term.exam：第 8、9、16 週）的週日 22:00～隔天 01:00 */
  { const c=CHARACTERS.classmate_xinci, inX=(d,h)=>{ const G=fresh(d,h); const e=STORY.schedEnt(c,G); return !!(e&&e.shopNpc==='xs_dakou_xc_exam'&&e.zone==='xs_dakou'); };
    const res=[]; for(const tid of ['Y1S1'].concat(LATER)){ const sun=daysOf(x,tid).filter(d=>CALENDAR.termOf(d).exam), non=daysOf(x,tid).filter(d=>!CALENDAR.termOf(d).exam&&CALENDAR.termOf(d).week>=2);
      const o={n:sun.length, in:sun.filter(d=>inX(d,22.5)&&inX(d,24.5)&&inX(d+1,0.5)).length, early:sun.filter(d=>inX(d,21.9)).length, late:sun.filter(d=>inX(d+1,1.1)||inX(d,25.1)).length, non:non.filter(d=>inX(d,22.5)||inX(d+1,0.5)).length};
      res.push(tid+' '+J(o)); if(o.n!==3||o.in!==o.n||o.early||o.late||o.non) bad.push(tid); }
    { const sat=daysOf(x,'Y1S1').filter(d=>CALENDAR.termOf(d).exam).map(d=>d-1); if(sat.some(d=>inX(d,24.5))) bad.push('週六晚上'); }   /* 週六 24:30（週日 00:30）不是她那一列 */
    check('10. 芯慈：考試那兩週（第 8、9、16 週）的週日 22:00～隔天 01:00 在大口（跨午夜：週日 24:30、週一 00:30 都算）；21:54、01:06 以後、平常週的週日、週六深夜都不在；大一上～大四下每學期都排',!bad.length,res.join('；')); }
  /* 那一句只出一次（不限大一上）*/
  for(const [r,h,tA,tB] of [[z,1,'Y1S1',null],[x,23,'Y1S1','Y2S1']]){ const ds=daysOf(r,tA).filter(d=>SHOPNPC.on(fresh(d,h),r)); const want=SOCIAL.npcName(r.who)+'：'+r.hear.t;
    let G=setup(r,ds[0],h,true); SHOPNPC.hear(GM); const c1=caps.slice(), F=JSON.parse(J(G.flags.SHOPNPC_HEAR1||{}));
    G=setup(r,ds[1],h,true); G.flags.SHOPNPC_HEAR1=JSON.parse(J(F)); SHOPNPC.hear(GM); const c2=caps.slice(); let c3=[];
    if(tB){ const d3=daysOf(r,tB).find(d=>SHOPNPC.on(fresh(d,h),r)); G=setup(r,d3,h,true); G.flags.SHOPNPC_HEAR1=JSON.parse(J(F)); SHOPNPC.hear(GM); c3=caps.slice(); }
    G=setup(r,ds[0],h,false); SOCIAL.rel(r.who); G.social.mem[r.who]=[]; delete G.flags.MET_ZHE; SHOPNPC.hear(GM); const c4=STORY.knows(r.who,G)?[]:caps.slice();
    check('10. '+NAME[r.who]+'（大口考試週）：走到旁邊＝「'+r.hear.t+'」；只出一次（同一學期下一天、下一學期都不出）；不認識不出',J(c1)===J([want])&&F[r.id]!=null&&J(c2)===J([])&&J(c3)===J([])&&J(c4)===J([]),J([c1,c2,c3,c4])); }
 });

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
for(const r of ROWS){ const st=CLASH[r.id]; if(!st||!st.cal) continue; const w=Object.entries(st.why).sort((a,b)=>b[1]-a[1]).map(([k,v])=>k+' ×'+v).join('；'); console.log('INFO   '+r.shop+' '+NAME[r.who]+(/_exam$/.test(r.id)?'（考試週）':'')+'：在店裡 '+st.on+'/'+st.cal+(w?'　撞到：'+w:'')); }
console.log('INFO 撞到原本作息的次數（大一下～大四下，同一個算法；presence＝人不在臺北、sis_week＝學姊同一週青木那一次有出現、dating／plan＝可昕交往中／那一天有約；括號是每一學期 在店裡/符合的格數）：');
for(const r of ROWS){ const st=CLASH2[r.id]; if(!st) continue; const w=Object.entries(st.why).sort((a,b)=>b[1]-a[1]).map(([k,v])=>k+' ×'+v).join('；'); const tm=LATER.map(t=>st.term[t]?t+' '+st.term[t][0]+'/'+st.term[t][1]:t+' —').join('、');
  console.log('INFO   '+r.shop+' '+NAME[r.who]+(/_exam$/.test(r.id)?'（考試週）':'')+'：在店裡 '+st.on+'/'+st.cal+(w?'　撞到：'+w:'')+'　（'+tm+'）'); }
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
      if(!stand) bad.push(r.id+' 站不住 ('+x+','+zz+')'); if(onBtn.length) bad.push(r.id+' 壓在按鈕上：'+onBtn.join('、'));
      if(r.id==='bookstore_kx'){ const law=(E.interactables||[]).find(i=>i.label==='看看法律書與文具'); if(!law||Math.hypot(law.x-x,law.z-zz)>1.0) bad.push(r.id+' 不在「看看法律書與文具」那一櫃前面 '+J(law&&{x:law.x,z:law.z})); else info.push(r.id+'＝離法律書那一櫃 '+Math.hypot(law.x-x,law.z-zz).toFixed(2)+' m'); } } }
  check('6. 站的列：那個點站得住（導航格）、不壓在按鈕上；學姊山嵐＝二樓法律區的坐地板位置；可昕＝頁間書屋法律書那一櫃前面',!bad.length,bad.join('｜')||info.filter(t=>/bookstore_kx/.test(t)).join(''));
  check('6. 坐的列：配置裡那間店真的座位（同一層）',!seatBad.length,seatBad.join('｜')||info.filter(t=>!/bookstore_kx/.test(t)).join('、'));
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
