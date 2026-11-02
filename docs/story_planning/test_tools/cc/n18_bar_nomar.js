// CC #18（BB 10:24）：c2d0c24bc 一試抽題排除 Y4MAR_（海商法）；舊存檔已抽好的照舊
// 用法：WT=<受測資料夾> [EXCL=Y4MAR,Y4IP,Y4LSO,Y4TAX] node n18_bar_nomar.js   （BB 10:26：四組都要排除；EXCL=Y4MAR 只驗海商法）
'use strict';
const WT=process.env.WT||process.cwd();
const H=require(WT+'/tests/pg_harness.js');
const {check}=H, J=JSON.stringify;
const EXCL=(process.env.EXCL||'Y4MAR,Y4IP,Y4LSO,Y4TAX').split(','), exRe=new RegExp('^('+EXCL.join('|')+')_');
(async()=>{
  const years=[2029,2030,2031,2032,2033], seeds=[1,2,3,12345,99999,424242,7,8,9,10]; let bad=[], cnt={}, total=0, seen={}, xdup=[];
  const subj=id=>(String(id).match(/^(Y4[A-Z]+|[A-Z]+)/)||[''])[0];
  for(const s of seeds){ const G=H.fresh('2029-08-01',9,'dorm',{examSeed:s});
    for(const y of years){ const d=PG.draw(G,y); const qs=(d&&d.qs?d.qs:d)||[]; const ids=qs.map(q=>q.id||q); total++;
      if(ids.length!==20) bad.push(['len',s,y,ids.length]); if(new Set(ids).size!==ids.length) bad.push(['dup',s,y]);
      if(ids.some(i=>exRe.test(i))) bad.push(['excl',s,y,ids.filter(i=>exRe.test(i))]);
      seen[s]=seen[s]||new Set(); for(const i of ids){ if(seen[s].has(i)) xdup.push([s,y,i]); seen[s].add(i); }
      for(const i of ids) cnt[subj(i)]=(cnt[subj(i)]||0)+1; } }
  console.log('抽了',total,'份；各前綴出現次數',J(cnt));
  check('1. 2029～2033 × 10 個 examSeed：每份 20 題、不重複、沒有 '+EXCL.join('／')+'_',bad.length===0,J(bad.slice(0,5)));
  const rest4=['Y4MAR','Y4IP','Y4LSO','Y4TAX'].filter(k=>!EXCL.includes(k));
  check('2. 沒排除的大四選試科目照舊會出現（'+(rest4.join('／')||'無')+'）',rest4.every(k=>cnt[k]>0),J(Object.fromEntries(rest4.map(k=>[k,cnt[k]]))));
  const pool=PG.pool(), all=PG.pool(true); const bySub={}; for(const q of pool) bySub[subj(q.id)]=(bySub[subj(q.id)]||0)+1;
  console.log('抽題池 '+pool.length+' 題（全部 '+all.length+'，排除 '+(all.length-pool.length)+'）；各前綴',J(bySub));
  check('2b. 同一個存檔五年（2029～2033）題目彼此不重複（需要 100 題；池子 '+pool.length+' 題）',xdup.length===0,J(xdup.slice(0,5)));
  check('2c. 池子 ≥100 題，五年各 20 題夠不重複',pool.length>=100,'pool='+pool.length);
  check('3. 抽題池（PG.pool()）沒有 '+EXCL.join('／')+'_；PG.pool(true) 都有',!PG.pool().some(q=>exRe.test(q.id))&&EXCL.every(k=>PG.pool(true).some(q=>q.id.indexOf(k+'_')===0)),'');
  /* 4. 舊存檔：R.exam[2029].qs 已經有 Y4MAR_ 的題目 → 照舊 */
  { const G=H.fresh('2029-08-01',9,'dorm',{examSeed:5}); const all=PG.pool(true); const mar=all.filter(q=>/^Y4MAR_/.test(q.id)).slice(0,3).map(q=>q.id), rest=all.filter(q=>!/^Y4MAR_/.test(q.id)).slice(0,17).map(q=>q.id);
    const R=PG.rec(G); R.exam=R.exam||{}; R.exam[2029]={qs:mar.concat(rest),ans:[]}; const d=PG.draw(G,2029); const ids=((d&&d.qs?d.qs:d)||[]).map(q=>q.id||q);
    check('4. 舊存檔已抽好的 20 題（含 3 題 Y4MAR_）照舊、不重抽，題目物件拿得到',J(ids)===J(mar.concat(rest))&&((d&&d.qs?d.qs:d)||[]).every(q=>typeof q==='object'?!!q.id:true),J({ids:ids.slice(0,4),n:ids.length})); }
  /* 5. 同一份存檔再抽一次同一年＝同一份 */
  { const G=H.fresh('2029-08-01',9,'dorm',{examSeed:77}); const a=J(PG.draw(G,2030)), b=J(PG.draw(G,2030)); check('5. 同一年再抽一次＝同一份',a===b,''); }
  H.done();
})();
