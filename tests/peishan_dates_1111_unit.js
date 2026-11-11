// 沛珊重寫（PEISHAN-VOICE-1110；使用者 X327）：校外約會台詞 D01～D33（AA_756；源稿 date_system/lines@2883197b6，2026-11-11）——不需要瀏覽器（D131）。
//   1. 白名單 D01～D33 都是 2883197b6；tools/date/import_date_lines.py 重匯（--out 另存）的結果和 src/data/date_lines.js 一樣；修正層跳過的沛珊的列
//   2. 沛珊在 33 個地點的格子（lines／likes／dislikeLine 底下 classmate_peishan）和源稿一字不差
//   3. 別人的格子、預約句、交通偏好和重匯以前（BASE）一樣——修正層只對沛珊放寬，別人沒有漏套
//   4. src/date3d.js 四處照改稿紀錄的 for_LAWWW（REMEMBER_IF D05.cafe、MORNING、MORNING_OWN、MORNING_HOME）；舊句不在了
//   5. ARRIVE_VAR：D28 到達第一次那兩格還是 from 的兩句（源稿沒動，另一版照舊換得到）
//   6. 用選項文字當 key 的地方（PICK_FLAG 的 t）在那一格的選項裡找得到
// AA_757_peishan_wish_hometown.json@052644c58（美術館心願事件「不用接話的一天」＋去她的縣市）：
//   7. date_wish.js：白名單、import_wish.py 重匯一樣；沛珊的事件＝稿的 wish_event；wish_rows 69 列的 new 都在、old 不在；別人的事件和重匯以前一樣
//   8. hometown_lines.js：hometown_rows 31 列（台中／台南 yes、yesDating 同字各兩處）的 new 在、old 不在；sendFlag 那一句不動；整個檔和 BASE 比只差這 31 列＋台南美術館那一段
//   9. 台南美術館那一段的字照稿的 tainan_museum（結構、旗標、mem、album、loc、旁白、「框外面呢？」的回話照舊；points_note 三點）
// 稿、BASE 讀 git show；讀不到（淺層複本）＝不比稿，只驗結構。用法：node tests/peishan_dates_1111_unit.js
const H=require('./pg_harness.js');
const {check}=H; const J=JSON.stringify;
const cp=require('child_process'), fs=require('fs'), path=require('path'), os=require('os');
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); } };
const PS='classmate_peishan', SHA='2883197b6', BASE='7cfb90cd7', SP='docs/story_planning/';
const show=(ref,p)=>{ try{ return cp.execFileSync('git',['show',ref+':'+p],{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore'],maxBuffer:1<<28}); }catch(e){ return null; } };
const read=f=>fs.readFileSync(path.join(H.ROOT,f),'utf8');
const DL=t=>JSON.parse(t.slice(t.indexOf('const DATE_LINES=')+17,t.lastIndexOf(';')));
const LOCS=Array.from({length:33},(_,k)=>'D'+String(k+1).padStart(2,'0'));
const leaves=(x,p,o)=>{ if(Array.isArray(x)) x.forEach((v,i)=>leaves(v,p+'/'+i,o)); else if(x&&typeof x==='object') for(const k in x) leaves(x[k],p+'/'+k,o); else o[p]=x; return o; };
const texts=(x,o)=>{ if(Array.isArray(x)) x.forEach(v=>texts(v,o)); else if(x&&typeof x==='object'){ if(typeof x.text==='string') o.push(x.text); for(const k in x) if(k!=='text') texts(x[k],o); } return o; };
const NOW=DL(read('src/data/date_lines.js'));
const SRC={}; for(const k of LOCS){ const t=show(SHA,SP+'date_system/lines/'+k+'.json'); if(t) SRC[k]=JSON.parse(t); }
const haveSrc=Object.keys(SRC).length===33;

(async()=>{
  await sec(1,async()=>{ const allow=JSON.parse(read('docs/handoff/story_import_allow.json')).files;
    const bad=LOCS.filter(k=>{ const e=allow.filter(x=>x.path===SP+'date_system/lines/'+k+'.json'); return !(e.length===1&&e[0].sha===SHA&&e[0].status==='approved'&&(e[0].history||[]).some(h=>/^(1b095a239|9aa8ec40c)$/.test(h.sha))); });
    check('1. 白名單 D01～D33 都是 '+SHA+'、approved，上一版（1b095a239／9aa8ec40c）留在 history',bad.length===0,J(bad));
    check('1. date_lines.js 的來源寫著 33 個地點 @'+SHA,LOCS.every(k=>NOW.source.includes(k+'.json@'+SHA)),NOW.source.slice(0,200));
    console.log(haveSrc?'（稿讀得到：逐字比對）':'（這份 checkout 讀不到企劃線 '+SHA+' 的稿：不比稿，只驗結構）');
    if(haveSrc){ const tmp=path.join(os.tmpdir(),'date_lines_ps1111_'+process.pid+'.js'); let out='', ok=false;
      try{ out=cp.execFileSync('python3',['tools/date/import_date_lines.py','--out',tmp],{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','pipe'],maxBuffer:1<<26}); ok=fs.readFileSync(tmp,'utf8')===read('src/data/date_lines.js'); }catch(e){ out=String(e.stderr||e.stdout||e.message).slice(0,300); }
      try{ fs.unlinkSync(tmp); }catch(e){}
      check('1. tools/date/import_date_lines.py 重匯（--out 另存）的結果和 src/data/date_lines.js 一樣',ok,ok?'':out.slice(0,300));
      const m=/沛珊重寫（PEISHAN-VOICE-1110）跳過的改句 (\d+) 列：(.*)/.exec(out)||[], sk=String(m[2]||'').split('；');
      const drop=sk.filter(x=>x.includes('AA 指明新稿不用再套')), miss=sk.filter(x=>x.includes('原句對不到'));
      check('1. 修正層跳過的沛珊的列：AA 指明不再套的剛好四列（AA_359 5-3 D31、AA_525 2-4 P-6 的 D15／D08／D18）；另外「原句對不到」的 0 列',
        drop.length===4&&['AA_359 5-3 D31','AA_525 2-4 P-6 D15','AA_525 2-4 P-6 D08','AA_525 2-4 P-6 D18'].every(t=>drop.some(x=>x.startsWith(t+'「')))&&miss.length===0,J(sk));
      check('1. AA_694 第 3 節逐列核對：只有沛珊重寫掉的句子跳過（第 127 列「我家的早餐比這個好吃！」＝AA_525 P-6 那一列的新句）',sk.filter(x=>x.startsWith('AA_694 ')).every(x=>x.includes('沛珊的句子，新稿重寫了'))&&sk.some(x=>x.startsWith('AA_694 第 3 節第 127 列')),J(sk.filter(x=>x.startsWith('AA_694 ')))); }
    const tool=read('tools/date/import_date_lines.py');
    check('1. 工具只對 classmate_peishan 放寬（ps_skip 先看 who；別人的列照舊 sys.exit）',/def ps_skip\(layer, loc, who, old, drop=False, new=None\):[\s\S]{0,400}if who != PS or not ps756\(loc\):\s+return False/.test(tool)&&tool.includes("sys.exit(f'AA_525 {item}：{loc} {who} 找不到")); });

  await sec(2,async()=>{ let n=0; const bad=[];
    for(const k of LOCS){ const A=NOW.loc[k]; if(!A){ bad.push(k+' 不在 date_lines.js'); continue; }
      check('2. '+k+'：沛珊有台詞（到達、互動點、收尾）',!!(A.lines&&A.lines[PS]&&A.lines[PS].arrive&&A.lines[PS].hotspots&&A.lines[PS].closing));
      if(!haveSrc) continue; const S=SRC[k], fs_={}, fg={};
      for(const part of ['lines','likes','dislikeLine']){ if(S[part]&&S[part][PS]!=null) leaves(S[part][PS],part,fs_); if(A[part]&&A[part][PS]!=null) leaves(A[part][PS],part,fg); }
      const ks=Object.keys(fs_), kg=Object.keys(fg); if(J(ks.slice().sort())!==J(kg.slice().sort())) bad.push(k+'：格子不一樣多（稿 '+ks.length+'、遊戲 '+kg.length+'）');
      for(const p of ks){ n++; if(fs_[p]!==fg[p]) bad.push(k+' '+p+'：稿「'+fs_[p]+'」遊戲「'+fg[p]+'」'); } }
    if(haveSrc) check('2. 沛珊 33 個地點的每一格（'+n+' 格：台詞、選項的字、tier、喜好、不喜歡那一句）和源稿 '+SHA+' 一字不差',n>4000&&bad.length===0,J(bad.slice(0,8)));
    const all=LOCS.reduce((a,k)=>a.concat(texts(NOW.loc[k].lines[PS],[])),[]).join('\n');
    check('2. 約會台詞裡沒有重寫前的字（早餐店、蛋餅、煎台、四點半）',!/早餐店|蛋餅|煎台|四點半/.test(all),(all.match(/.*(早餐店|蛋餅|煎台|四點半).*/g)||[]).slice(0,5).join(' | ')); });

  await sec(3,async()=>{ const ob=show(BASE,'src/data/date_lines.js'); if(!ob){ console.log('（讀不到 '+BASE+' 的 date_lines.js：不比別人的格子）'); return; }
    const strip=D=>{ const x=JSON.parse(J(D)); delete x.source; if(x.lines) delete x.lines[PS]; for(const k in x.loc) for(const part of ['lines','likes','dislikeLine']) if(x.loc[k][part]) delete x.loc[k][part][PS]; return x; };
    const a=leaves(strip(DL(ob)),'',{}), b=leaves(strip(NOW),'',{}); const ka=Object.keys(a), diff=ka.filter(p=>a[p]!==b[p]).concat(Object.keys(b).filter(p=>!(p in a)));
    check('3. 別人的格子、預約句、交通偏好、互動點（'+ka.length+' 格）和重匯以前（'+BASE+'）一樣：修正層沒有因為放寬而漏套',ka.length>25000&&diff.length===0,J(diff.slice(0,6).map(p=>p+'：'+a[p]+' → '+b[p]))); });

  await sec(4,async()=>{ const src=read('src/date3d.js'), code=src.replace(/\/\*[\s\S]*?\*\//g,'');
    const R=DATE.REMEMBER_IF.find(r=>r.loc==='D05'&&r.who===PS&&r.pid==='D05.cafe');
    check('4. REMEMBER_IF D05.cafe（旗標 PS_D05_EGG 不改名、once）：多演「（她把一杯熱紅茶推到你面前。）」「說好的，這次換我。」',!!R&&R.flag==='PS_D05_EGG'&&R.once===true&&J(R.add)===J([{who:'narr',text:'（她把一杯熱紅茶推到你面前。）'},{who:PS,text:'說好的，這次換我。'}]),J(R));
    check('4. S.MORNING 沛珊：「我居然自己醒了，沒有靠鬧鐘。我在大廳等你，快來看奇蹟。」',DATE.MORNING[PS]==='我居然自己醒了，沒有靠鬧鐘。我在大廳等你，快來看奇蹟。',DATE.MORNING[PS]);
    check('4. S.MORNING_OWN 沛珊（D28）：「我在樓下。早餐我買好了，買太多，你要負責吃。」',DATE.MORNING_OWN[PS]==='我在樓下。早餐我買好了，買太多，你要負責吃。',DATE.MORNING_OWN[PS]);
    check('4. S.MORNING_HOME 沛珊（D26）：「我在樓下。我媽叫我帶水果給你，一大袋，我提得好辛苦。」',DATE.MORNING_HOME[PS]==='我在樓下。我媽叫我帶水果給你，一大袋，我提得好辛苦。',DATE.MORNING_HOME[PS]);
    check('4. date3d.js（註解以外）沒有舊句：一盒蛋餅、「說好的！」、四點半就醒了、早餐從我家店裡帶來的',!/一盒蛋餅|'說好的！'|四點半就醒了|早餐從我家店裡帶來的|'我在樓下。早餐我買好了。'/.test(code));
    for(const [k,t] of [['D05',"（她把一杯熱紅茶推到你面前。）"],['D05','說好的，這次換我。'],['D26','我在樓下。我媽叫我帶水果給你，一大袋，我提得好辛苦。'],['D26','我居然自己醒了，沒有靠鬧鐘。我在大廳等你，快來看奇蹟。'],['D28','我在樓下。早餐我買好了，買太多，你要負責吃。']]){
      const rw=show(SHA,SP+'date_rewrite/peishan_'+k+'.json'); if(rw) check('4. 「'+t+'」在改稿紀錄 date_rewrite/peishan_'+k+'.json 的 for_LAWWW 裡',String((JSON.parse(rw)._meta||{}).for_LAWWW||'').includes(t)); }
    const cafe=NOW.loc.D05.lines[PS].hotspots['D05.cafe'];
    check('4. D05 咖啡館「我請妳。」的回話是新稿的「好啊，那下次換我。」（多演的兩句接得上）',cafe.first.choice[0].t==='「我請妳。」'&&cafe.first.choice[0].reply[0].text==='好啊，那下次換我。',J(cafe.first.choice)); });

  await sec(5,async()=>{ const V=DATE.ARRIVE_VAR.find(x=>x.loc==='D28'&&x.who===PS), F=NOW.loc.D28.lines[PS].arrive.first;
    check('5. ARRIVE_VAR D28 沛珊的 from＝「臺南！太陽好大。」「我爸媽說，好好玩，店裡不用擔心。」、to 照舊',!!V&&J(V.from)===J(['臺南！太陽好大。','我爸媽說，好好玩，店裡不用擔心。'])&&J(V.to)===J(['歡迎來臺南！今天我帶路。','我住這裡，太陽還是曬不習慣。']),J(V&&[V.from,V.to]));
    check('5. 匯入後 D28 到達第一次那兩格還是這兩句（一字不差）',!!V&&J(F.lines.map(x=>x.text))===J(V.from),J(F.lines));
    const G={flags:{}}, t={who:PS,locs:['D28'],day:1}; const w0=DATE.whereOn; DATE.whereOn=()=>({own:'rent'}); let a; try{ a=DATE.arriveVar(G,t,F); } finally { DATE.whereOn=w0; }
    check('5. 她住臺南（租的地方）那天：兩格都換成另一版；還沒搬去＝原句',J(a.lines.map(x=>x.text))===J(V.to)&&J(F.lines.map(x=>x.text))===J(V.from),J(a.lines)); });

  await sec(6,async()=>{ const bad=[]; for(const r of DATE.PICK_FLAG){ const h=((((NOW.loc[r.loc]||{}).lines||{})[r.who]||{}).hotspots||{})[r.pid], c=h&&h.first&&h.first.choice||[]; if(!c.some(x=>x.t===r.t)) bad.push(r.loc+' '+r.who+' '+r.pid+' '+r.t+'：選項裡沒有（'+c.map(x=>x.t).join('、')+'）'); }
    check('6. PICK_FLAG 用選項文字當 key 的三筆（含沛珊 D05「我請妳。」）在那一格的選項裡都找得到',DATE.PICK_FLAG.length>=3&&bad.length===0,J(bad));
    const treat=LOCS.reduce((a,k)=>{ const hs=NOW.loc[k].lines[PS].hotspots||{}; for(const pid in hs) for(const c of ((hs[pid].first||{}).choice||[])) if(DATE.isTreat(c.t)) a.push(pid+c.t); return a; },[]);
    check('6. 請客的選項（DATE.isTreat 看選項的字，另外扣她那一份）和重寫以前同一組五個',J(treat)===J(['D03.gacha「我請妳轉。」','D05.cafe「我請妳。」','D15.store「我請妳。」','D18.snack「這碗我請。」','D25.cafe「我請妳。」']),J(treat)); });
  /* ======================= AA_757 ======================= */
  const P757=SP+'AA_757_peishan_wish_hometown.json', S757='052644c58'; const r757=show(S757,P757), A757=r757?JSON.parse(r757):null;
  const sortJ=o=>J(o,(k,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.keys(v).sort().reduce((a,x)=>(a[x]=v[x],a),{}):v);
  const DW=t=>JSON.parse(t.slice(t.indexOf('const DATE_WISH=')+16,t.lastIndexOf(';')));
  const lit=s=>{ const out=[]; s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/'((?:[^'\\]|\\.)*)'/g,(m,t)=>{ out.push(t); return m; }); return out; };
  const loadHT=src=>{ const vm=require('vm'), ctx=vm.createContext({console,STORY:undefined}); vm.runInContext(src.replace(/^const HOMETOWN_LINES\s*=/m,'globalThis.HOMETOWN_LINES='),ctx); return ctx.HOMETOWN_LINES; };
  await sec(7,async()=>{ const e=JSON.parse(read('docs/handoff/story_import_allow.json')).files.filter(x=>x.path===P757), W=DW(read('src/data/date_wish.js'));
    check('7. 白名單一筆 AA_757_peishan_wish_hometown.json、sha '+S757+'、approved；date_wish.js 的來源寫著 AA_757@'+S757,e.length===1&&e[0].sha===S757&&e[0].status==='approved'&&W.source.includes('AA_757@'+S757),W.source.slice(-60));
    console.log(A757?'（AA_757 讀得到：逐字比對）':'（這份 checkout 讀不到 AA_757@'+S757+'：不比稿）');
    const ev=W.events[PS]; check('7. 沛珊的心願事件：id、地點 D06、記憶 PS_UNTITLED 照舊；標題「不用接話的一天」',ev.id==='wish_classmate_peishan'&&ev.loc==='D06'&&J(ev).includes('PS_UNTITLED')&&ev.title==='不用接話的一天',J([ev.id,ev.loc,ev.title]));
    if(A757){ const tmp=path.join(os.tmpdir(),'date_wish_ps1111_'+process.pid+'.js'); let ok=false, out='';
      try{ out=cp.execFileSync('python3',['tools/date/import_wish.py','--out',tmp],{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','pipe']}); ok=fs.readFileSync(tmp,'utf8')===read('src/data/date_wish.js'); }catch(x){ out=String(x.stderr||x.stdout||x.message).slice(0,300); }
      try{ fs.unlinkSync(tmp); }catch(x){}
      check('7. tools/date/import_wish.py 重匯（--out 另存）的結果和 src/data/date_wish.js 一樣',ok,ok?'':out.slice(0,300));
      const a=JSON.parse(J(ev)), b=JSON.parse(J(A757.wish_event)); delete a.src; delete b.src;
      check('7. 沛珊的事件和稿的 wish_event 逐欄相同（一字不差）',sortJ(a)===sortJ(b));
      const vals=Object.values(leaves(ev,'',{})), olds=A757.wish_rows.filter(r=>!A757.wish_rows.some(q=>q.new===r.old));
      check('7. wish_rows 69 列：new 都在她的事件裡、old 都不在了',A757.wish_rows.length===69&&A757.wish_rows.every(r=>vals.includes(r.new))&&olds.every(r=>!vals.includes(r.old)),J(A757.wish_rows.filter(r=>!vals.includes(r.new)||(olds.includes(r)&&vals.includes(r.old))).map(r=>r.path)));
      check('7. 選項的字換了四處（聊天提到第 1 個、咖啡廳三個）：照稿',ev.mention.choices[0].t==='「妳撐不過十分鐘。」'&&J(ev.hotspots['D06.cafe'].choices.map(c=>c.t))===J(['「記下來了。」','「忍得很辛苦？」','「下次去妳家的店坐。」']),J(ev.hotspots['D06.cafe'].choices.map(c=>c.t))); }
    const ob=show(BASE,'src/data/date_wish.js'); if(ob){ const O=DW(ob), ids=Object.keys(O.events).filter(k=>k!==PS);
      check('7. 別人的心願事件（'+ids.length+' 位）和重匯以前（'+BASE+'）一樣；hold、verify.miss 照舊是空的',ids.length===6&&ids.every(k=>J(O.events[k])===J(W.events[k]))&&J(O.hold)===J(W.hold)&&W.verify.miss.length===0&&W.verify.freeVisited.length===O.verify.freeVisited.length);
      const a=leaves(O.events[PS],'',{}), b=leaves(ev,'',{}), d=Object.keys(b).filter(k=>a[k]!==b[k]);
      check('7. 沛珊的事件和重匯以前比：格子一樣多、不一樣的 69 格都是字的欄位（條件、旗標、時間、花費、選項數沒動）',J(Object.keys(a))===J(Object.keys(b))&&d.length===69&&d.every(k=>/\/(text|t|title|wish|note|costNote)$/.test(k)),J(d.filter(k=>!/\/(text|t|title|wish|note|costNote)$/.test(k)))); } });

  await sec(8,async()=>{ const cur=read('src/data/hometown_lines.js'), L=lit(cur), n=t=>L.filter(x=>x===t).length;
    check('8. sendFlag 那一句不動（旗標 PS_SCHOOLROAD）',cur.includes("sendFlag:[['下次來，我帶你去我國中走路上學那條路。','PS_SCHOOLROAD']]"));
    check('8. hometown_lines.js（註解以外）沒有早餐店、沙漏、標準答案、一百六',!/早餐店|沙漏|標準答案|一百六/.test(cur.replace(/\/\*[\s\S]*?\*\//g,'')));
    if(A757){ const bad=[]; for(const r of A757.hometown_rows){ const want=/兩處同字/.test(r.where)?2:1; if(n(r.new)!==want) bad.push(r.where+' new '+n(r.new)+' 處'); if(n(r.old)!==0) bad.push(r.where+' old 還有 '+n(r.old)+' 處'); }
      check('8. hometown_rows 31 列：每一列的 new 剛好在那幾處（台中／台南 yes、yesDating 各兩處，其他一處）、old 不在了',A757.hometown_rows.length===31&&bad.length===0,J(bad)); }
    const ob=show(BASE,'src/data/hometown_lines.js'); if(ob){ const O=lit(ob), d=O.map((t,i)=>[t,L[i]]).filter(([x,y])=>x!==y);
      const rowOf=A757?new Set(A757.hometown_rows.map(r=>r.old+'→'+r.new)):null, other=d.filter(([x,y])=>!rowOf||!rowOf.has(x+'→'+y));
      check('8. 整個檔的字串和 BASE 逐個比：一樣多（'+O.length+' 個），不一樣的 88 個＝hometown_rows 33 處＋台南美術館 55 處',O.length===L.length&&d.length===88&&other.length===55,J([O.length,L.length,d.length,other.length]));
      const a=ob.indexOf("    museum:{name:'台南・美術館'"), b=ob.indexOf("      mem:'PS_UNTITLED'",a), mus=lit(ob.slice(a,b));
      check('8. 那 55 處都在台南美術館那一段裡（別的角色、別的段落沒有動）',other.every(([x])=>mus.includes(x)),J(other.filter(([x])=>!mus.includes(x)).slice(0,5)));
      const skel=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/'((?:[^'\\]|\\.)*)'/g,"''").replace(/\s+/g,'');
      check('8. 骨架（條件、旗標、bg、scene 的結構、函式）和 BASE 一樣',skel(ob)===skel(cur)); } });

  await sec(9,async()=>{ const HT=loadHT(read('src/data/hometown_lines.js')), M=HT[PS+'@台南'].museum; const T=x=>typeof x==='string'?x:(x&&x.narr), F=a=>a.map(T);
    check('9. 台南美術館：name、loc D06、mem PS_UNTITLED、memLabel、album 照舊',M.name==='台南・美術館'&&M.loc==='D06'&&M.mem==='PS_UNTITLED'&&M.memLabel==='她說〈無題〉是傍晚'&&M.album==='〈無題〉明信片');
    if(!A757) return; const D=A757.tainan_museum, bad=[]; const eq=(n,a,b)=>{ if(J(a)!==J(b)) bad.push(n+'：'+J(a)+' ≠ 稿 '+J(b)); };
    eq('known.lines',M.known.lines,D.known.lines); M.known.opts.forEach((o,i)=>{ eq('known.opts['+i+'].t',o.t,D.known.opts[i].t); eq('known.opts['+i+'].say',o.say,D.known.opts[i].say); });
    eq('invite.lines',M.invite.lines,D.invite.lines); eq('invite.yes',M.invite.yes,D.invite.yes); eq('invite.no',M.invite.no,D.invite.no); eq('askKnown',M.askKnown,D.askKnown); eq('askNew',M.askNew,D.askNew);
    eq('arrive（旁白照舊，後兩句）',[typeof M.arrive[0]==='object'&&M.arrive[0].narr==='（白色的建築，屋頂一片一片疊起來，裡面很亮。）'].concat(M.arrive.slice(1)),[true].concat(D.arrive.slice(1))); eq('arriveHigh',M.arriveHigh,D.arriveHigh); eq('arriveDating',M.arriveDating,D.arriveDating);
    const G0={events:{done:{}},flags:{}}, G1={events:{done:{ev_peishan_syllogism:true}},flags:{}};
    for(const pid of ['D06.gallery','D06.frame','D06.cafe','D06.lawn']){ const p=M.points[pid], d=D.points[pid]; eq(pid+'.lines',F(p.lines),d.lines); eq(pid+' 選項的字',p.opts.map(o=>o.t),d.opts.map(o=>o.t));
      p.opts.forEach((o,i)=>{ const ds=d.opts[i].say; if(pid==='D06.frame'&&i===2) return eq(pid+' 第三個選項的旁白照舊',F(o.say),['（玻璃門的倒影剛好落在框裡，是你們兩個。她笑了一下：「我們剛好在框裡。」）']);
        if(pid==='D06.frame'&&i===1){ eq(pid+'「框外面呢？」',o.say(G0),ds); return eq(pid+'「框外面呢？」看過三段論多一句（照舊）',o.say(G1),ds.concat(['你記得我說過。'])); }
        if(pid==='D06.cafe'&&i===2){ eq(pid+' 第三個選項（第 5 階）',o.say(G0,false),[ds[0]]); return eq(pid+' 第三個選項（hi＝第 6 階以上或交往中）',o.say(G0,true),ds[1].hi); }
        eq(pid+'.opts['+i+'].say',F(o.say),ds); }); }
    eq('close.lines',F(M.close.lines),D.close.lines); M.close.opts.forEach((o,i)=>{ eq('close.opts['+i+'].t',o.t,D.close.opts[i].t); eq('close.opts['+i+'].say',o.say,D.close.opts[i].say); });
    for(const k of ['after','end5','end6','endDating']) eq('close.'+k,M.close[k],D.close[k]);
    check('9. 台南美術館那一段的每一句、每一個選項照稿的 tainan_museum（一字不差；旁白、act 的結構照舊）',bad.length===0,J(bad.slice(0,6)));
    const W=DW(read('src/data/date_wish.js')).events[PS];
    check('9. points_note：草地第三個選項和心願事件同一句；咖啡廳第三個選項 hi＝「台中很遠喔。」「好。我叫我爸留位子。」、其他＝「我爸會出來跟你聊天，你會走不掉。」',M.points['D06.lawn'].opts[2].say[0]===W.hotspots['D06.lawn'].choices[2].reply[0].text&&M.points['D06.lawn'].opts[2].say[0]==='雲走得好慢。今天什麼都不用趕。'&&J(M.points['D06.cafe'].opts[2].say(G0,true))===J(['台中很遠喔。','好。我叫我爸留位子。'])&&J(M.points['D06.cafe'].opts[2].say(G0,false))===J(['我爸會出來跟你聊天，你會走不掉。'])); });
  H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
