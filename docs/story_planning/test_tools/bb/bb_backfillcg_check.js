// BB：ADV.backfillCG（舊存檔 CG 補記）檢查。用法：node bb_backfillcg_check.js <SHA>...
// 從 git show <SHA>:src/adv3d.js 取出 CG_SEEN_FLAGS、backfillCG 兩行實際執行；再確認 game3d.js migrate 有呼叫、CG_REGISTRY 有登錄、旗標只在播 CG 的那一步設。
const {execSync}=require('child_process');
const show=(sha,p)=>{ try{ return execSync(`git show ${sha}:${p}`,{encoding:'utf8',maxBuffer:1<<28}); }catch(e){ return ''; } };
function run(sha){
  let ok=true; const chk=(n,c,i)=>{ ok=ok&&!!c; console.log((c?'PASS ':'FAIL ')+n+(i?'  '+i:'')); };
  const adv=show(sha,'src/adv3d.js'), gm=show(sha,'src/game3d.js');
  const L1=(adv.match(/^\s*A\.CG_SEEN_FLAGS=.*$/m)||[])[0], L2=(adv.match(/^\s*A\.backfillCG=function.*$/m)||[])[0];
  chk('adv3d.js 有 A.CG_SEEN_FLAGS 和 A.backfillCG',!!(L1&&L2));
  chk('game3d.js migrate 讀檔時呼叫 ADV.backfillCG(s)',/ADV\.backfillCG\(s\)/.test(gm));
  if(!(L1&&L2)){ console.log(`SHA ${sha} FAILED`); return false; }
  const A={}; new Function('A',L1+'\n'+L2)(A);
  const M=A.CG_SEEN_FLAGS, ids=Object.values(M), keys=Object.keys(M);
  const reg=(adv.match(/^const CG_REGISTRY=(\{.*\});$/m)||[])[1]; let R={}; try{ R=new Function('return '+reg)(); }catch(e){}
  for(const id of ids) chk(`CG_REGISTRY 有 ${id}`,!!R[id]);
  // ① 帶旗標的舊存檔補上
  const s1={flags:Object.fromEntries(keys.map(k=>[k,true]))}; const n1=A.backfillCG(s1);
  chk('① 三個旗標都有、沒有 cg 欄位＝補 3 張',n1===3&&JSON.stringify(s1.cg.unlocked.slice().sort())===JSON.stringify(ids.slice().sort()),JSON.stringify(s1.cg));
  const s1b={flags:{[keys[0]]:true},cg:{unlocked:['cg_other']}}; A.backfillCG(s1b);
  chk('① 只有一個旗標＝只補那一張、原本的保留',JSON.stringify(s1b.cg.unlocked)===JSON.stringify(['cg_other',ids[0]]),JSON.stringify(s1b.cg));
  // ② 沒旗標不多補
  const s2={flags:{}}; chk('② 沒有旗標＝0 張、不建 cg 欄位',A.backfillCG(s2)===0&&!('cg' in s2));
  const s2b={flags:Object.fromEntries(keys.map(k=>[k,'yes']))}; chk('② 旗標不是 true（字串）＝不補',A.backfillCG(s2b)===0);
  chk('② 沒有 flags 的存檔＝0、不丟例外',A.backfillCG({})===0&&A.backfillCG(null)===0);
  const s2c={flags:{[keys[0]]:true},cg:'壞掉'}; A.backfillCG(s2c); chk('② cg 欄位壞掉＝重建後補',Array.isArray(s2c.cg.unlocked)&&s2c.cg.unlocked.includes(ids[0]));
  // ③ 重讀不重複
  const s3={flags:Object.fromEntries(keys.map(k=>[k,true])),cg:{unlocked:ids.slice()}}; const n3=A.backfillCG(s3);
  chk('③ 已經有的不重複補（重讀 0 張）',n3===0&&s3.cg.unlocked.length===3);
  A.backfillCG(s1); chk('③ 同一份存檔讀第二次仍是 3 張',s1.cg.unlocked.length===3);
  // 旗標只在播 CG 的那一步設（讀事件原始碼：同一行有 cg 和 set）
  const src=['src/data/an_yt_hol_events.js','src/data/r2y4b_events.js','src/data/fest_events.js'].map(p=>show(sha,p)).join('\n');
  for(const k of keys){ const sets=src.split('\n').filter(l=>new RegExp('set:\\{'+k+':true').test(l)); chk(`旗標 ${k} 只在有 CG 的那一行設（${sets.length} 處）`,sets.length>0&&sets.every(l=>/cg[:(]/.test(l)),''); }
  console.log(`SHA ${sha} ${ok?'ALL PASS':'FAILED'}`); return ok;
}
for(const s of process.argv.slice(2)){ console.log('==== '+s); run(s); }
