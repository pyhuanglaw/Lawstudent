// 閒聊階梯 AA_781 通用覆蓋層（DLG-FULL-REVIEW-1110；使用者 X324 閒聊階梯全部重看；AA 2026-11-11 交稿、BB 看過）——不需要瀏覽器（D131）。
// tools/ladder/import_ladder.py 的 AA781 那一段：白名單上每一個 docs/story_planning/AA_781_<人>_ladder_<學期>.json（一檔一筆）疊在所有修正層後面 → src/data/ladder.js。
// 這一次四批 22 檔：大一上 bc4f3f367（6 檔）、大一下 15241f32e（5 檔）、大二上 4c710f37a（5 檔）、大二下 d898cded5（6 檔）。之後 AA 再交的檔加白名單就會被這支測試一起驗。
//   1. 白名單一檔一筆、approved；ladder.js 的來源有寫 AA_781 通用層；重匯（tools/ladder/import_ladder.py --out）和 src/data/ladder.js 一字不差
//   2. steps：那一層的 lines、choices（{t, re, fx}，re 的 {narr} 寫成整句括號的字）一字照稿；選項至少兩個、fx 只有 {fr, love} 非負整數、每個選項都有回話；那一層其他欄位（id、if、week、location、rel、mem、note…）和沒疊以前一樣
//   3. rows：每一列都換到（at 那一層／那一格是新字、舊字不在了），工具的紀錄（--aa781-log）一列一筆
//   4. 零差異：沒疊以前（--no-aa781）和現在逐格比——其他人、其他學期一格都沒變；有疊的那幾格，變的地方都是 steps 那幾層的 lines／choices 或稿上的一列（舊字→新字）
//   5. 選項的字被程式認的層（LADDER_CHOICE_IF、LADDER_REPLY_IF、y3fill3d.js S.LAD.choice、privtalk3d.js choiceIf；含語彤大二下 Y4-L6）：每個學期選項的 t 和沒疊以前一樣
//   6. rel／mem 沒掉：每一層的 rel、mem、linesIf／extraIf 的條件和記憶、選項的 rel／mem 和沒疊以前一樣
//   7. 程式用字認的地方跟著新字走：芷若「要打烊了。」「（她在吧檯後面抬頭）」兩句招呼（STORY.LADDER_GREET_IF：6/4 起不上班不說）、以安大一上「今天的進度我抄完了。」（只在上課日說，src/data/greet_classday.js）
//   8. 演一次：補的選項會出來、回話裡整句括號的字當旁白演
// 稿讀 git show（白名單上的 commit）；讀不到（淺層複本）＝第 2、3 項不比稿，只驗結構。用法：node tests/ladder_aa781_1111_unit.js
'use strict';
const H=require('./pg_harness.js');
const {check,GM}=H; const J=JSON.stringify;
const cp=require('child_process'), fs=require('fs'), path=require('path'), os=require('os');
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); } };
const show=(ref,p)=>{ try{ return cp.execFileSync('git',['show',ref+':'+p],{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore'],maxBuffer:1<<28}); }catch(e){ return null; } };
const WHO={an:'heroine_01',kx:'kexin',zr:'heroine_02',zq:'heroine_04',sis:'heroine_05',yt:'heroine_03'};
const BATCH=[['Y1S1','bc4f3f367',['an','yt','kx','zr','sis','zq']],['Y1S2','15241f32e',['zq','zr','kx','sis','an']],['Y2S1','4c710f37a',['zq','kx','zr','yt','sis']],['Y2S2','d898cded5',['kx','zr','zq','sis','yt','an']]];
const KEYED=['A7-L5','Y6-L3','Y4-L6','A5-L1','A5-L8','K5-L2','Y5-L1','Y5-L6','Y5-L7','Y5-L8'];   /* LAWWW 2026-11-11 列的；另外掃 src（同工具）*/
const TXT=['lines','choices','linesIf','extraIf','t','reply','re'];
const texts=(o,out=[])=>{ if(typeof o==='string') out.push(o); else if(Array.isArray(o)) o.forEach(v=>texts(v,out)); else if(o&&typeof o==='object') for(const k of TXT) if(k in o) texts(o[k],out); return out; };
const cell=(L,term,who)=>((term==='Y1S1'?L.characters:(L.byTerm||{})[term])||{})[who];
const layerOf=(c,id)=>[...((c&&c.steps)||[]),...((c&&c.dating)||[])].find(x=>x.id===id);
const terms=L=>['Y1S1',...Object.keys(L.byTerm||{}).filter(t=>t!=='Y1S1')];
const reOf=x=>typeof x==='string'?x:x.narr;
const diff=(a,b,p,out)=>{ if(J(a)===J(b)) return out; if(a&&b&&typeof a==='object'&&typeof b==='object'&&Array.isArray(a)===Array.isArray(b)&&!(Array.isArray(a)&&a.length!==b.length)){ for(const k of new Set([...Object.keys(a),...Object.keys(b)])) diff(a[k],b[k],p.concat(Array.isArray(a)?+k:k),out); } else out.push([p,a,b]); return out; };
const rm=cs=>(cs||[]).filter(c=>c.rel||c.mem).map(c=>J([c.rel||null,c.mem||null])).sort();
const ell=c=>texts({lines:[...(c.steps||[]),...(c.dating||[])]}).concat((c.greet&&c.greet.base)||[],((c.greet&&c.greet.when)||[]).map(w=>w.t||'')).reduce((n,s)=>n+s.split('……').length-1,0);

(async()=>{
  const allow=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files;
  const F781=allow.filter(e=>/^docs\/story_planning\/AA_781_[A-Za-z0-9]+_ladder_[A-Za-z0-9_]+\.json$/.test(e.path)&&e.status==='approved');
  for(const F of F781){ const raw=show(F.sha,F.path); F.A=raw?JSON.parse(raw):null; F.terms=F.A?[].concat(F.A.term):[]; F.tag=path.basename(F.path,'.json')+'@'+F.sha; }
  const haveDrafts=F781.every(F=>F.A);
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'lad781-')), outA=path.join(tmp,'with.js'), outB=path.join(tmp,'base.js'), logP=path.join(tmp,'log.json');
  const run=args=>cp.spawnSync('python3',[path.join(H.ROOT,'tools/ladder/import_ladder.py'),...args],{encoding:'utf8',timeout:300000});
  const rA=run(['--out',outA,'--aa781-log',logP]), rB=run(['--out',outB,'--no-aa781']);
  const L=LADDER, B=rB.status===0?new Function(fs.readFileSync(outB,'utf8')+';return LADDER;')():null, LOG=rA.status===0&&fs.existsSync(logP)?JSON.parse(fs.readFileSync(logP,'utf8')):[];

  await sec(1,async()=>{
    for(const [term,sha,ws] of BATCH) for(const w of ws){ const p=`docs/story_planning/AA_781_${w}_ladder_${term}.json`, e=allow.filter(x=>x.path===p);
      check(`1. 白名單一筆 ${path.basename(p)}@${sha}、approved、有 approvedBy、task DLG-FULL-REVIEW-1110`,e.length===1&&e[0].sha===sha&&e[0].status==='approved'&&!!e[0].approvedBy&&e[0].task==='DLG-FULL-REVIEW-1110',J(e.map(x=>[x.sha,x.status]))); }
    check('1. 白名單上的 AA_781 階梯檔一共 22 個以上（之後的學期加在後面）',F781.length>=22,F781.length);
    check('1. ladder.js 的來源有寫 AA_781 通用層（'+F781.length+' 檔）',String(L.source).includes('＋AA_781 通用層 '+F781.length+' 檔'),String(L.source).slice(-120));
    check('1. 重匯跑得完（結束碼 0），和 src/data/ladder.js 一字不差',rA.status===0&&fs.readFileSync(outA,'utf8')===fs.readFileSync(path.join(H.ROOT,'src/data/ladder.js'),'utf8'),(rA.stderr||rA.stdout||'').slice(-300));
    check('1. 不疊 AA_781（--no-aa781）也跑得完（零差異的比較基準）',rB.status===0&&!!B,(rB.stderr||'').slice(-300));
    console.log(haveDrafts?'（稿都讀得到：逐字比對）':'（這份 checkout 讀不到企劃線的稿：第 2、3 項只驗結構）'); });

  await sec(2,async()=>{
    for(const F of F781){ if(!F.A) continue; for(const term of F.terms){ const c=cell(L,term,F.A.who), b=B&&cell(B,term,F.A.who);
      for(const s of F.A.steps||[]){ const t=layerOf(c,s.id), t0=b&&layerOf(b,s.id), w=`2. ${F.tag} ${term} ${s.id}`;
        if(!t){ check(w+' 這一層在',false); continue; }
        check(w+' lines 一字照稿',J(t.lines)===J(s.lines),J(t.lines));
        const want=s.choices.map(c=>{ const o={t:c.t,re:c.re.map(reOf)}; if(c.fx&&Object.keys(c.fx).length) o.fx=c.fx; if(c.rel) o.rel=c.rel; if(c.mem) o.mem=c.mem; return o; });
        check(w+' choices 一字照稿（{t, re, fx}）',J(t.choices)===J(want),J(t.choices));
        if(t0){ const o=x=>{ const y=Object.assign({},x); delete y.lines; delete y.choices; return J(y); }; check(w+' 其他欄位（id、if、week、location、rel、mem、note…）和沒疊以前一樣',o(t)===o(t0),o(t)); } } } }
    /* 結構（不用稿）：steps 那幾層的選項 */
    const steps=LOG.filter(x=>x.steps>0);
    for(const F of F781) for(const term of F.terms) for(const s of (F.A&&F.A.steps)||[]){ const t=layerOf(cell(L,term,F.A.who),s.id)||{}, C=t.choices||[], w=`2. ${F.tag} ${term} ${s.id}`;
      check(w+' 選項至少兩個、每個都有字和回話',C.length>=2&&C.every(c=>typeof c.t==='string'&&c.t.trim()&&Array.isArray(c.re)&&c.re.length&&c.re.every(x=>typeof x==='string'&&x.trim())),J(C));
      check(w+' fx 只有 {fr, love}、非負整數（不扣分）',C.every(c=>Object.entries(c.fx||{}).every(([k,v])=>['fr','love'].includes(k)&&Number.isInteger(v)&&v>=0)),J(C.map(c=>c.fx)));
      check(w+' 這一層沒有 linesIf／extraIf（工具遇到會停）',!t.linesIf&&!t.extraIf); }
    check('2. 工具的紀錄有 steps 的層數＝稿的層數',!haveDrafts||steps.reduce((n,x)=>n+x.steps,0)===F781.reduce((n,F)=>n+F.terms.length*(F.A.steps||[]).length,0),J(steps.map(x=>[x.file,x.steps]))); });

  await sec(3,async()=>{
    for(const F of F781){ if(!F.A) continue; for(const term of F.terms){ const c=cell(L,term,F.A.who), w0=`3. ${F.tag} ${term}`;
      const rows=F.A.rows||[], hit=LOG.filter(x=>x.file===F.tag&&x.term===term&&x.hit);
      check(w0+` rows ${rows.length} 列，工具一列一筆（換到哪裡有紀錄）`,hit.length===rows.length,J(hit.map(x=>x.at)));
      for(const r of rows){ const m=/^greet\.(base|when)\[(\d+)\]$/.exec(r.at); let ok, info;
        if(m){ const g=(c.greet||{})[m[1]]||[], v=m[1]==='base'?g[+m[2]]:(g[+m[2]]||{}).t; ok=v===r.new; info=v; }
        else { const T=texts(layerOf(c,r.at)||{}); ok=T.includes(r.new)&&!T.includes(r.old); info=J([T.filter(x=>x===r.new).length,T.filter(x=>x===r.old).length]); }
        check(`${w0} ${r.at}「${r.old}」→「${r.new}」換到了`,ok,info); } } }
    const S=LOG.filter(x=>'steps' in x);
    console.log('　統計（人×學期：steps 層、rows 列、刪節號前→後）：'+S.map(x=>`${x.term} ${x.who} ${x.steps}／${x.rows}／${x.ellipsis[0]}→${x.ellipsis[1]}`).join('；'));
    for(const x of S){ const c=cell(L,x.term,x.who); check(`3. ${x.file} ${x.term} ${x.who} 刪節號 ${x.ellipsis[0]} → ${x.ellipsis[1]}（現在的 ladder.js 數出來一樣、沒有變多）`,c&&ell(c)===x.ellipsis[1]&&x.ellipsis[1]<=x.ellipsis[0],c&&ell(c)); } });

  await sec(4,async()=>{
    if(!B){ check('4. 有比較基準',false); return; }
    const tgt=new Map(); for(const F of F781) for(const term of F.terms) tgt.set(term+'|'+(F.A&&F.A.who),F);
    for(const k of ['terms','kaiDorm','bikeSeat','labels']) check('4. LADDER.'+k+' 和沒疊以前一樣',J(L[k])===J(B[k]));
    let same=0, chg=0;
    for(const term of new Set([...terms(L),...terms(B)])) for(const who of new Set([...Object.keys((term==='Y1S1'?L.characters:L.byTerm[term])||{}),...Object.keys((term==='Y1S1'?B.characters:B.byTerm[term])||{})])){
      const a=cell(B,term,who), b=cell(L,term,who), D=diff(a,b,[],[]), F=tgt.get(term+'|'+who);
      if(!F){ check(`4. ${term} ${who}：沒有稿＝零差異`,D.length===0,J(D.slice(0,2))); same+=D.length===0; continue; }
      chg++;
      const sids=new Set(((F.A&&F.A.steps)||[]).map(s=>s.id)), rows=(F.A&&F.A.rows)||[];
      const bad=D.filter(([p,x,y])=>{ if(p[0]==='steps'&&typeof p[1]==='number'&&sids.has(((a.steps||[])[p[1]]||{}).id)&&(p[2]==='lines'||p[2]==='choices')) return false;
        return !(typeof x==='string'&&typeof y==='string'&&rows.some(r=>r.old===x&&r.new===y)); });
      check(`4. ${term} ${who}：變的 ${D.length} 處都是 steps 那幾層的 lines／choices 或稿上的一列`,F.A?bad.length===0:true,J(bad.slice(0,3))); }
    console.log(`　逐格：沒有稿的 ${same} 格零差異、有稿的 ${chg} 格`); });

  await sec(5,async()=>{
    if(!B) return;
    const keyed=new Set(KEYED);
    for(const f of ['story3d.js','privtalk3d.js','y3fill3d.js']){ const s=fs.readFileSync(path.join(H.ROOT,'src',f),'utf8');
      for(const m of s.matchAll(/'([A-Za-z0-9]+-L\w+)'\]?\s*[:=]\s*\{\s*'/g)) keyed.add(m[1]); for(const m of s.matchAll(/step:'([A-Za-z0-9]+-L\w+)',\s*choice:'/g)) keyed.add(m[1]); }
    for(const k of ['Y4-L6','A-L11','K3-L7','A7-L5','Y6-L3']) check('5. 程式認選項字的層有掃到：'+k,keyed.has(k));
    let n=0;
    for(const term of terms(L)) for(const who of Object.keys((term==='Y1S1'?L.characters:L.byTerm[term])||{})) for(const st of cell(L,term,who).steps||[]){ if(!keyed.has(st.id)) continue; const s0=layerOf(cell(B,term,who),st.id); n++;
      check(`5. ${term} ${who} ${st.id}：選項的 t 和沒疊以前一樣`,s0&&J((st.choices||[]).map(c=>c.t))===J((s0.choices||[]).map(c=>c.t))&&J((st.linesIf||[]).map(x=>(x.choices||[]).map(c=>c.t)))===J((s0.linesIf||[]).map(x=>(x.choices||[]).map(c=>c.t))),J((st.choices||[]).map(c=>c.t))); }
    const y46=layerOf(cell(L,'Y2S2','heroine_03'),'Y4-L6'); check('5. 語彤大二下 Y4-L6（privtalk「妳媽媽還反對嗎？」）選項的字還在',!!y46&&(y46.choices||[]).some(c=>c.t==='「妳媽媽還反對嗎？」'),J(y46&&y46.choices.map(c=>c.t)));
    console.log(`　程式認選項字的層：${keyed.size} 個 id、${n} 格比過`); });

  await sec(6,async()=>{
    if(!B) return;
    for(const F of F781){ if(!F.A) continue; for(const term of F.terms){ const c=cell(L,term,F.A.who), b=cell(B,term,F.A.who), w=`6. ${F.tag} ${term}`;
      const keyOf=s=>J({id:s.id,rel:s.rel,mem:s.mem,if:s.if,week:s.week,ch:rm(s.choices),li:(s.linesIf||[]).map(x=>[x.if,x.mem||null,rm(x.choices)]),ex:(s.extraIf||[]).map(x=>[x.if,x.mem||null])});
      check(w+' 每一層的 rel、mem、條件、linesIf／extraIf 的條件和記憶、選項的 rel／mem 都沒掉',J((c.steps||[]).map(keyOf))===J((b.steps||[]).map(keyOf)));
      const wc=g=>J(((g||{}).when||[]).map(x=>{ const y=Object.assign({},x); delete y.t; return y; }));
      check(w+' 招呼 when 的條件不動、base 句數一樣',wc(c.greet)===wc(b.greet)&&((c.greet||{}).base||[]).length===((b.greet||{}).base||[]).length); } } });

  await sec(7,async()=>{
    const GI=STORY.LADDER_GREET_IF||{};
    for(const t of ['要打烊了。你可以坐到我擦完這張桌子。','（她在吧檯後面抬頭）嗨。']){ const k=Object.keys(GI).filter(k=>t.startsWith(k));
      check('7. 芷若招呼「'+t+'」有 LADDER_GREET_IF（不上班的那段不說）',k.length>0&&k.every(x=>GI[x].test)); }
    const zr=['Y1S2','Y2S1','Y2S2'].map(term=>((cell(L,term,'heroine_02').greet||{}).when||[])).flat().map(w=>w.t);
    check('7. 芷若大一下～大二下的招呼是新字（舊字「要打烊了。……」「（她在吧檯後面抬頭）……嗨。」都不在了）',zr.includes('要打烊了。你可以坐到我擦完這張桌子。')&&!zr.includes('要打烊了。……你可以坐到我擦完這張桌子。')&&!zr.includes('（她在吧檯後面抬頭）……嗨。'),J(zr.filter(t=>/打烊|吧檯後面抬頭/.test(t))));
    const gcS=fs.readFileSync(path.join(H.ROOT,'src/data/greet_classday.js'),'utf8'), GC=JSON.parse(gcS.slice(gcS.indexOf('{'),gcS.lastIndexOf('}')+1));
    check('7. 以安大一上「今天的進度我抄完了。字有點醜，你不要笑。」只在上課日說（greet_classday.js classDay，舊字拿掉）',(GC.classDay.heroine_01||[]).includes('今天的進度我抄完了。字有點醜，你不要笑。')&&!(GC.classDay.heroine_01||[]).includes('今天的進度我抄完了。你要的話晚上傳給你。'));
    const r=cp.spawnSync('python3',[path.join(H.ROOT,'tools/story/import_greet_classday.py'),'--check'],{encoding:'utf8',timeout:120000});
    check('7. greet_classday.js 和重匯一致（tools/story/import_greet_classday.py --check）',r.status===0,(r.stdout||r.stderr||'').slice(-200)); });

  await sec(8,async()=>{
    const play=async(term,id,who,stage,pick,setup)=>{ const G=H.fresh(term==='Y1S1'?'2026-10-20':'2027-03-10',14,'campus',null); if(setup) setup(G); H.said=[]; H.opts=[]; H.picks=[pick];
      await STORY.ladPlay(GM,{name:who,charId:who},who,layerOf(cell(L,term,who),id)); return H.said; };
    let said=await play('Y1S1','Y-L7','heroine_03',null,'「吃了。」',()=>H.FAMILIAR('heroine_03'));
    check('8. 語彤 Y-L7 補的兩個選項會出來',J(H.opts[0])===J(['「吃了。」','「還沒，一起去？」']),J(H.opts));
    check('8. 選「吃了。」：她說「那就好。」、「（她好像只是想問一個人。）」當旁白演',said.some(s=>s.who&&s.t==='那就好。')&&said.some(s=>s.who===null&&s.t==='（她好像只是想問一個人。）'),J(said.slice(-3)));
    said=await play('Y1S1','K-L6','kexin',null,'（把筆放下）',G=>{ G.flags.dating_kexin=true; });
    check('8. 可昕 K-L6 選「（把筆放下）」：「（她的額頭動了一下，好像在笑）」當旁白、「好，念書。」她說',said.some(s=>s.who===null&&s.t==='（她的額頭動了一下，好像在笑）')&&said.some(s=>s.who&&s.t==='好，念書。'),J(said.slice(-3)));
    said=await play('Y2S2','Y4-L7','heroine_03',null,'「什麼事？」',()=>H.FRIEND('heroine_03'));
    check('8. 語彤大二下 Y4-L7：一句 lines、選「什麼事？」回兩句（助教那條線）',said.some(s=>s.t==='下學期系上可能會找我做一點事。還沒確定。')&&said.some(s=>s.t==='訪談課的助教。老師問我要不要。'),J(said)); });

  fs.rmSync(tmp,{recursive:true,force:true});
  H.done();
})();
