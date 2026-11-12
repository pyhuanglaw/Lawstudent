// 沛珊故事線八拍重寫（PEISHAN-VOICE-1110；使用者 X327；AA_755_peishan_arc@6b5507f8a，2026-11-11）——不需要瀏覽器（D131）。
// tools/story/import_arcs.py 的 overlay_peishan：稿的 classmate_peishan 整段取代 AA_712 匯出來的同名物件 → src/data/heroine_arcs.js。
//   1. 白名單一筆、工具只認這個 SHA；heroine_arcs.js 寫了 overlay；import_arcs.py --check 過
//   2. 整段和稿一字不差（theme、八拍）
//   3. 「應該原樣」的欄位和重寫以前（BASE）一樣：祐廷的選項 t、ansId、rel、tell、toldAlt、need、invite、set、from／until／late、cite 的 key、每拍選項數
//   4. 其他人的故事線沒有被動到
//   5. 沒有重寫前的字（早餐店、蛋餅、端七盤、句尾的「～」、「不好意思，我問太多了」）
//   6. 演一次第 1 拍：她的句子 → 問句 → 選項 → 回話，名字框是她
// 稿、BASE 讀 git show；讀不到（淺層複本）＝不比稿，只驗結構和演出。用法：node tests/peishan_arc_1111_unit.js
const H=require('./pg_harness.js');
const {check,GM}=H; const J=JSON.stringify;
const cp=require('child_process'), fs=require('fs'), path=require('path'), vm=require('vm');
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); } };
const PS='classmate_peishan', SHA='6b5507f8a', F='docs/story_planning/AA_755_peishan_arc.json', BASE='a724370bc';
const show=(ref,p)=>{ try{ return cp.execFileSync('git',['show',ref+':'+p],{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore'],maxBuffer:1<<28}); }catch(e){ return null; } };
const loadArcs=s=>{ try{ return new Function(s.replace("'use strict';",'')+';return HEROINE_ARCS;')(); }catch(e){ return null; } };
const CUR=loadArcs(fs.readFileSync(path.join(H.ROOT,'src/data/heroine_arcs.js'),'utf8'));
const raw=show(SHA,F), A0=raw?JSON.parse(raw).classmate_peishan:null;
const ob=show(BASE,'src/data/heroine_arcs.js'), OLD=ob?loadArcs(ob):null;
/* 2026-11-12 STALE-SOURCES-1112：AA_712 重匯到 abb9609116（上一任 AA 11-11 整理其他六位的台詞），其他人改和重匯那個 commit（224c231f3c）比；舊期望：和 BASE 一樣 */
const ob2=show('224c231f3c','src/data/heroine_arcs.js'), OLD2=ob2?loadArcs(ob2):OLD;
const P=CUR.people[PS];
/* （CANON-NO-ECON-1112 第四批：照 AA_901 換字）以安 beat 6／8 那一層（CANON901）接在 CANON892 後面一起疊 */
/* CANON-NO-ECON-1112 第四批：照 AA_892 換字（tools/story/import_arcs.py 的 CANON892 那一層）——比對的稿和舊版先疊上同一層再比 */
const C892=(()=>{ try{ return JSON.parse(cp.execFileSync('python3',['-c','import sys,json; sys.path.insert(0,"tools/story"); import import_arcs as m; print(json.dumps({"rows":m.CANON892+getattr(m,"CANON901",[]),"theme":m.CANON892_THEME},ensure_ascii=False))'],{cwd:H.ROOT,encoding:'utf8'})); }catch(e){ return {rows:[],theme:{}}; } })();
const ap892=(hid,person)=>{ if(!person) return person; const v=JSON.parse(J(person)); for(const [h,n,f,old,nw] of C892.rows){ if(h!==hid) continue; const b=v.beats.find(x=>x.n===n); if(!b) continue;
    if(f[0]==='lines'||f[0]==='ask'){ if(b[f[0]][f[1]]===old) b[f[0]][f[1]]=nw; } else if(f[0]==='topic'){ if(b.topic===old) b.topic=nw; }
    else if(f[0]==='opt'){ const o=b.opts[f[1]]; if(o&&o.t===old){ if(nw!=null) o.t=nw; delete o.tell; } } else if(f[0]==='reply'){ const o=b.opts[f[1]]; if(o.reply[f[2]]===old) o.reply[f[2]]=nw; }
    else if(f[0]==='cite'){ const L=(b.cite||{})[f[1]]; if(L&&L[f[2]]===old) L[f[2]]=nw; } }
  if(C892.theme[hid]) v.theme=C892.theme[hid]; return v; };

(async()=>{
  await sec(1,async()=>{ const allow=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files.filter(e=>e.path===F);
    check('1. 白名單一筆 AA_755_peishan_arc、sha '+SHA+'、approved；工具寫死只認這一版',allow.length===1&&allow[0].sha===SHA&&allow[0].status==='approved'&&fs.readFileSync(path.join(H.ROOT,'tools/story/import_arcs.py'),'utf8').includes("PS755_SHA = '"+SHA+"'"));
    check('1. heroine_arcs.js 寫了 overlay '+F+'@'+SHA+'；src 照舊是 AA_712',CUR.overlay===F+'@'+SHA&&/^docs\/story_planning\/AA_712_heroine_arcs\.json@/.test(CUR.src),J([CUR.src,CUR.overlay]));
    console.log(A0&&OLD?'（稿和 BASE 都讀得到：逐字比對）':'（這份 checkout 讀不到企劃線的稿或 BASE：不比稿，只驗結構和演出）');
    if(A0){ let ok=false, out=''; try{ out=cp.execFileSync('python3',['tools/story/import_arcs.py','--check'],{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','pipe']}); ok=/^OK/.test(out); }catch(e){ out=String(e.stdout||e.message).slice(0,200); }
      check('1. import_arcs.py --check：heroine_arcs.js 和工具重匯的結果一樣',ok,out.slice(0,160)); } });

  await sec(2,async()=>{ if(!A0) return;
    const A=ap892(PS,A0);   /* （CANON-NO-ECON-1112 第四批：照 AA_892 換字）*/
    check('2. theme 一字照稿',P.theme===A.theme,P.theme);
    const bad=[]; A.beats.forEach((a,i)=>{ if(J(P.beats[i])!==J(a)) bad.push(i+1); });
    check('2. 八拍整段和稿一字不差（lines、ask、topic、opts、cite…）',P.beats.length===8&&A.beats.length===8&&bad.length===0,J(bad)); });

  await sec(3,async()=>{ check('3. 八拍、n 1～8、每拍至少兩個選項、lines／ask 都是非空字串',P.beats.length===8&&P.beats.every((b,i)=>b.n===i+1&&b.opts.length>=2&&b.lines.length&&b.lines.every(t=>typeof t==='string'&&t.trim())&&b.ask.every(t=>typeof t==='string'&&t.trim())));
    if(!OLD) return; const O=ap892(PS,OLD.people[PS]);   /* （CANON-NO-ECON-1112 第四批：照 AA_892 換字）*/
    const KEEP=['n','need','invite','set','from','until','late','after','where','quietOk','keyNote','alt'], OK=['t','rel','ansId','tell','toldAlt','decide','stance','key','opens','closes'];
    const bad=[]; O.beats.forEach((o,i)=>{ const b=P.beats[i]; for(const k of KEEP) if(J(b[k])!==J(o[k])) bad.push('第 '+(i+1)+' 拍 '+k);
      if(J(Object.keys(b.cite||{}).sort())!==J(Object.keys(o.cite||{}).sort())) bad.push('第 '+(i+1)+' 拍 cite 的 key');
      if(b.opts.length!==o.opts.length){ bad.push('第 '+(i+1)+' 拍選項數'); return; }
      o.opts.forEach((y,j)=>{ for(const k of OK) if(J(b.opts[j][k])!==J(y[k])) bad.push('第 '+(i+1)+' 拍選項 '+(j+1)+' '+k); });
      const extra=[...new Set([...Object.keys(b),...Object.keys(o)])].filter(k=>!KEEP.includes(k)&&!['topic','lines','ask','cite','opts'].includes(k)); if(extra.length) bad.push('第 '+(i+1)+' 拍不認得的欄位 '+extra); });
    check('3. 應該原樣的欄位和重寫以前一樣：祐廷的選項 t、ansId、rel、tell、toldAlt；need、invite、set、from／until／late；cite 的 key；每拍選項數',bad.length===0,J(bad));
    const ch=[]; O.beats.forEach((o,i)=>{ const b=P.beats[i]; for(const k of ['topic','lines','ask','cite']) if(J(b[k])!==J(o[k])) ch.push((i+1)+'.'+k); });
    check('3. 換了字的只有 theme、topic（第 1、8 拍）、lines、ask、第 5 拍 cite、opts[].reply',P.theme!==O.theme&&ch.every(x=>/^\d\.(topic|lines|ask|cite)$/.test(x))&&J(ch.filter(x=>/topic/.test(x)))===J(['1.topic','8.topic'])&&J(ch.filter(x=>/cite/.test(x)))===J(['5.cite']),J(ch)); });

  await sec(4,async()=>{ if(!OLD) return; const other=Object.keys(OLD.people).filter(k=>k!==PS);
    check('4. 其他人的故事線（'+other.length+' 位）和重寫以前一樣',J(Object.keys(CUR.people))===J(Object.keys(OLD.people))&&other.every(k=>J(CUR.people[k])===J(ap892(k,k==='kexin'?Object.assign({},OLD2.people[k],{beats:OLD2.people[k].beats.filter(b=>b.n!==4&&b.n!==5)}):OLD2.people[k])))/* （CANON-NO-ECON-1112 第四批：照 AA_892 換字）*//* 可昕第 4、5 拍（CANON-NO-ECON-1112 第三批：這一項拿掉）*/,J(other.filter(k=>J(CUR.people[k])!==J(OLD2.people[k])))); });

  await sec(5,async()=>{ const all=J(P); const old=['早餐店','蛋餅','端七盤','四點半','煎台','不好意思，我問太多了','～'].filter(t=>all.includes(t));
    check('5. 她的故事線沒有重寫前的字（早餐店、蛋餅、端七盤、四點半、煎台、「不好意思，我問太多了」、句尾的「～」）',old.length===0,J(old));
    check('5. 第 1 拍 topic「在店裡長大」、第 8 拍「一整班都在聽」；第 8 拍留著「只是那件事不是法律」',P.beats[0].topic==='在店裡長大'&&P.beats[7].topic==='一整班都在聽'&&J(P.beats[7].lines).includes('只是那件事不是法律'),J([P.beats[0].topic,P.beats[7].topic])); });

  await sec(6,async()=>{ const loadG=f=>{ const s=fs.readFileSync(path.join(H.ROOT,f),'utf8').replace(/^const ([A-Z_][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); };
    for(const f of ['src/data/heroine_arcs.js','src/data/arc_rot.js','src/data/decide_rules.js','src/decide3d.js','src/arcs3d.js']) if(fs.existsSync(path.join(H.ROOT,f))&&!(f==='src/arcs3d.js'&&typeof ARCS!=='undefined')) try{ loadG(f); }catch(e){}
    if(typeof ARCS==='undefined'||!ARCS.play){ check('6. ARCS 載入',false); return; }
    H.fresh('2026-03-05',15,'dorm',{}); H.said=[]; H.picks=[2]; const b=HEROINE_ARCS.people[PS].beats[0]; await ARCS.play(GM,{name:'沛珊',charId:PS},PS,b);
    const T=H.said.map(x=>x.t);
    check('6. 第 1 拍演出來：她的兩句 → 問句「你小時候放學都去哪？」→ 選第三個 → 她的兩句回話；名字框是她',J(T.slice(0,3))===J(b.lines.concat(b.ask))&&H.said.slice(0,3).every(x=>x.who==='沛珊')&&b.opts[2].reply.every(t=>T.includes(t))&&H.said.filter(x=>b.opts[2].reply.includes(x.t)).every(x=>x.who==='沛珊'),J(H.said)); });
  H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
