// AA_373 6-1（企劃線 e75d1cce：AA 22:3x 把那一列兩欄都改成整句，羊那句＝AA_359 5-1 B1；原本 bdab2f42；任務 AA373-Y1S2-FIX-1021）：可昕不跟祐廷比輸贏（使用者 10-18「她沒有在跟我比」）——
// date_lines.js 那一列的兩句由 tools/date/import_date_lines.py 疊在 lines/D12.json、D32.json 上匯入。不需要瀏覽器。用法：node tests/date_lines_aa373_unit.js
require('./alison.js');   /* AA_380：企劃線的舊稿還寫「小語」，讀稿的時候照匯入工具換成 Alison */
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..'), GIT=process.env.SPEC_GIT_DIR||ROOT, SHA='e75d1cce', SPEC='docs/story_planning/AA_373_法律系大一下_時間人在哪與作廢設定_修正稿.md';
global.window=global;
vm.runInThisContext(fs.readFileSync(path.join(ROOT,'src/data/date_lines.js'),'utf8').replace(/^const DATE_LINES\s*=/m,'globalThis.DATE_LINES='),{filename:'date_lines.js'});
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+String(info).slice(0,500):'')); if(!ok) fails++; };
const J=x=>JSON.stringify(x);
const all=[]; const walk=(x,p)=>{ if(Array.isArray(x)) x.forEach((v,i)=>walk(v,p+'['+i+']')); else if(x&&typeof x==='object'){ if(typeof x.text==='string') all.push({p,t:x.text}); for(const k in x) walk(x[k],p+'.'+k); } };
walk(DATE_LINES.loc,'loc');
const KX=(loc)=>((DATE_LINES.loc[loc]||{}).lines||{}).kexin||{};
const c12=(KX('D12').closing||{}).first, m32=((((KX('D32').hotspots||{})['D32.meadow'])||{}).normal||[])[0];
// 稿：6-1 表格「date_lines.js」那一列
let md=''; try{ md=cp.execSync('git show '+SHA+':"'+SPEC+'"',{cwd:GIT,encoding:'utf8',maxBuffer:8<<20,stdio:['ignore','pipe','ignore']}); }catch(e){}
const row=md.split('\n').find(l=>/^\|\s*`date_lines\.js`[^|]*\|/.test(l))||'', cells=row.split('|').map(c=>c.trim()), q=s=>(String(s||'').match(/「[^「」]*」/g)||[]).map(x=>x.slice(1,-1));
check('1. 讀得到稿 AA_373@'+SHA+' 6-1「date_lines.js」那一列：現在兩句、AA 定兩句',q(cells[2]).length===2&&q(cells[3]).length===2,J([q(cells[2]),q(cells[3])]));
check('2. 舊句「你走的比我少，你請晚餐。」不見了（所有地點、所有人）',!all.some(x=>x.t==='你走的比我少，你請晚餐。'||/比我少/.test(x.t)),J(all.filter(x=>/比我少/.test(x.t))));
check('2. 新句：可昕 D12 大稻埕第一次的收尾＝「今天走了一萬兩千步，手錶說的。」「今天走好多。晚餐你請，我腳好痠。」（第二句照稿）',!!c12&&J(c12.lines.map(x=>x.text))===J(['今天走了一萬兩千步，手錶說的。',q(cells[3])[0]])&&q(cells[3])[0]==='今天走好多。晚餐你請，我腳好痠。',J(c12));
check('3. 「平手」不見了（date_lines.js 沒有一字不差的「……平手。」；唯一有「平手」的是 D32 大草原可昕那一句）',!all.some(x=>/平手/.test(x.t)),J(all.filter(x=>/平手/.test(x.t))));
check('3. D32 大草原可昕：整句換成稿上的「有一隻羊一直在看我。……牠應該也餓了。走，吃飯。」（AA_359 5-1 B1）',!!m32&&m32.lines.length===1&&m32.lines[0].text===q(cells[3])[1]&&q(cells[3])[1]==='有一隻羊一直在看我。……牠應該也餓了。走，吃飯。',J(m32));
{ const allow=JSON.parse(fs.readFileSync(path.join(ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files, diff=[];
  for(const loc of ['D12','D32']){ const p='docs/story_planning/date_system/lines/'+loc+'.json', e=allow.find(x=>x.path===p&&x.status==='approved'); let src=null; try{ src=JSON.parse(cp.execSync('git show '+e.sha+':'+p,{cwd:GIT,encoding:'utf8',maxBuffer:8<<20,stdio:['ignore','pipe','ignore']})); }catch(x){}
    if(!src){ diff.push(loc+' 讀不到原檔'); continue; } const a=[], b=[]; const w2=(x,o)=>{ if(Array.isArray(x)) x.forEach(v=>w2(v,o)); else if(x&&typeof x==='object'){ if(typeof x.text==='string') o.push(x.text); for(const k in x) w2(x[k],o); } };
    w2(src.lines,a); { const G0=Object.assign({},(DATE_LINES.loc[loc]||{}).lines); delete G0.classmate_xinci; w2(G0,b); }   /* 2026-10-30 AA_537b（芯慈第二份，XINCI-ROMANCE-1030）：D12 多了芯慈的到達／收尾，原檔沒有她，不比（tests/xinci_romance_unit.js 查）*/ a.forEach((t,i)=>{ if(t!==b[i]) diff.push(loc+'：'+t+' → '+b[i]); }); if(a.length!==b.length) diff.push(loc+' 句數 '+a.length+' → '+b.length); }
  let md359=''; try{ md359=cp.execSync('git show fb5156ab:"docs/story_planning/AA_359_兩天一夜的約會_住宿那一段.md"',{cwd:GIT,encoding:'utf8',maxBuffer:8<<20,stdio:['ignore','pipe','ignore']}); }catch(x){}
  const ok359={has:d=>{ const m=/^D\d\d：(.*) → (.*)$/.exec(d); return !!m&&!!md359&&md359.includes('「'+m[1]+'」')&&md359.includes('「'+m[2]+'」'); }};   /* AA_359 5-2、5-3（同一個工具疊的，tests/date_overnight_unit.js 查）：舊句、新句都在 AA_359 的稿裡 */
  let md525=''; try{ md525=cp.execSync('git show 6081f725f:"docs/story_planning/AA_525_說了沒發生_子晴沛珊可昕.md"',{cwd:GIT,encoding:'utf8',maxBuffer:8<<20,stdio:['ignore','pipe','ignore']}); }catch(x){}
  const ok525={has:d=>{ const m=/^D\d\d：(.*) → (.*)$/.exec(d); return !!m&&!!md525&&md525.includes('「'+m[1]+'」')&&md525.includes('「'+m[2]+'」'); }};   /* 2026-10-30 AA_525 1-6（企劃線 6081f725f）：子晴 D12「謝謝，下次換我。」→「謝謝。」（同一個工具疊的，tests/aa525_promises_unit.js 查）*/
  check('4. AA_373 只換了這兩句：D12、D32 和白名單的原檔（57de1709）逐句比，其他句子一字不差（D32 另有 AA_359 5-2、5-3 的幾句；D12 另有 AA_525 1-6 子晴一句）',J(diff.filter(d=>!ok359.has(d)&&!ok525.has(d)))===J(['D12：你走的比我少，你請晚餐。 → 今天走好多。晚餐你請，我腳好痠。','D32：有一隻羊在看我。我在看它。平手。 → 有一隻羊一直在看我。……牠應該也餓了。走，吃飯。']),J(diff)); }
check('5. date_lines.js 的來源寫著 AA_373@'+SHA+'（匯入工具疊上去的，不是手改）',DATE_LINES.source.includes('AA_373_法律系大一下_時間人在哪與作廢設定_修正稿.md@'+SHA),DATE_LINES.source.slice(-120));
{ const al=JSON.parse(fs.readFileSync(path.join(ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files.filter(e=>e.path===SPEC&&e.status==='approved');
  check('6. 匯入白名單：AA_373 只有一筆 approved＝'+SHA+'（同一個檔不能有兩個 approved 版本）',al.length===1&&al[0].sha===SHA&&al[0].task==='AA373-Y1S2-FIX-1021',J(al.map(e=>e.sha))); }
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
