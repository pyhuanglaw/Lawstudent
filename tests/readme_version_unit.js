// README 的版本＝index.html 的版本（REL-PACKAGING-1111，USER_WANTS X340：「版本資訊應盡量建立單一來源，避免 README 每次發布後繼續過時」）。
// 單一來源是 index.html 標題畫面的「版本 vX（日期）」；README 兩個標記之間那一段由 tools/release/sync_version.py 產生。
// FAIL 的時候：python3 tools/release/sync_version.py（發布樹腳本 tools/handoff/mk_release_tree.sh 會自己跑）。
// 用法：node tests/readme_version_unit.js
'use strict';
const fs=require('fs'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'), readme=fs.readFileSync(path.join(ROOT,'README.md'),'utf8');
const m=html.match(/版本 v([0-9][0-9.]*)（([0-9]{4}-[0-9]{2}-[0-9]{2})）/);
check('1. index.html 有「版本 vX（日期）」',!!m,m?m[0]:'');
const blk=readme.match(/<!-- VERSION:START[^>]*-->([\s\S]*?)<!-- VERSION:END -->/);
check('2. README.md 有 VERSION:START／VERSION:END 標記',!!blk);
if(m&&blk){ const want='**v'+m[1]+'（'+m[2]+'）**';
  check('3. README 版本區塊寫的是 index.html 的版本 '+want,blk[1].includes(want),blk[1].trim().slice(0,120));
  const others=[...blk[1].matchAll(/v[0-9]+\.[0-9]+(?:\.[0-9]+)*/g)].map(x=>x[0]).filter(v=>v!=='v'+m[1]);
  check('4. 版本區塊裡沒有別的版號',others.length===0,others.join('、'));
  // 標記以外不准再手寫「目前的發布版本是 vX」「現在玩得到什麼（vX）」這種會過時的句子
  const outside=readme.replace(blk[0],''); const stale=[...outside.matchAll(/(目前(?:線上)?的?發布版本[^\n]{0,12}v[0-9]+\.[0-9]+[0-9.]*|現在玩得到什麼（v[0-9.]+）)/g)].map(x=>x[0]);
  check('5. 標記以外沒有手寫的「目前發布版本 vX」',stale.length===0,stale.join('、')); }
console.log(fails?('FAIL：'+fails+' 項'):'ALL PASS'); process.exit(fails?1:0);
