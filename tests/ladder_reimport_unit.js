// LADDER-IMPORT-AA657-1104：閒聊階梯重匯（tools/ladder/import_ladder.py）要跑得完、而且和遊戲的 src/data/ladder.js 一字不差。
// 起因：AA_657 補二（企劃線 65a1b2fe9）把一盞的「三號桌的阿伯」改成「常來的阿伯」八句，遊戲 src 照表改了、ladder_aa_y3s1 的源稿也改了，
// 可是 AA_630 的列經 aa630_fix.json 讀出來還是「三號桌」，重匯停在 AA_630 L-134（「現在是『常來的那個阿伯…』，不是原句『三號桌的阿伯…』」）。
// 修法：tools/story/aa657_fix.json（八句，讀稿時換），import_guard.py read_fix、tests/alison.js 兩份清單都排在 aa630_fix.json 後面。
// 修改前：重匯失敗（結束碼 1，L-134）；修改後：重匯成功、輸出和 ladder.js 相同。
'use strict';
const fs=require('fs'), path=require('path'), cp=require('child_process'), os=require('os');
const ROOT=path.join(__dirname,'..');
let fails=0; const check=(name,ok,detail)=>{ console.log((ok?'ok  ':'FAIL ')+name+(ok?'':'　'+JSON.stringify(detail))); if(!ok) fails++; };
const src=p=>fs.readFileSync(path.join(ROOT,p),'utf8');

// 1. aa657_fix.json＝AA_657 補二的八列（第 7 列只放字的部分）
const md=cp.execFileSync('git',['-C',ROOT,'show','65a1b2fe9:docs/story_planning/AA_657_一盞茶屋_劇情對位置的決定.md'],{encoding:'utf8'});
const rows=[]; for(const line of md.split('\n')){ const m=line.match(/^\|\s*(\d)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*(.+?)\s*\|\s*$/); if(m) rows.push([m[3],m[4]]); }
const want=rows.map(([a,b])=>a.startsWith('語彤：')&&b.startsWith('語彤：')?[a.slice(3),b.slice(3)]:[a,b]);
const F=JSON.parse(src('tools/story/aa657_fix.json')).pairs;
const key=p=>JSON.stringify(p);
check('1. aa657_fix.json 八句＝AA_657 補二的表（65a1b2fe9），長的先換',rows.length===8&&F.length===8&&want.every(w=>F.some(f=>key(f)===key(w)))&&F.every((f,i)=>i===0||F[i-1][0].length>=f[0].length),{rows:rows.length,F:F.length});

// 2. 兩份清單一樣，aa657 排在 aa630 後面
const list=s=>{ const m=s.match(/\[?\(?((?:'(?:ndl542|nocmp|d118|aa\d+)_fix\.json',\s*)+'aa\d+_fix\.json')/); return m?m[1].split(/,\s*/).map(x=>x.replace(/'/g,'')):[]; };
const A=list(src('tools/story/import_guard.py')), B=list(src('tests/alison.js'));
check('2. import_guard.py read_fix、tests/alison.js 兩份清單一樣，aa657_fix.json 排在 aa630_fix.json 後面',A.length>0&&key(A)===key(B)&&A.indexOf('aa657_fix.json')>A.indexOf('aa630_fix.json')&&A.indexOf('aa630_fix.json')>=0,{A,B});

// 3. 讀稿換字：AA_630 的原句先換成「三號桌」、再換成 AA_657 的定稿；2:30 AM 有桌號的兩句不換
const rf=s=>cp.execFileSync('python3',[path.join(ROOT,'tools/story/import_guard.py'),'read_fix'],{input:s,encoding:'utf8'});
check('3a. 「點乾麵的那個阿伯講最久…」讀出來是「常來的那個阿伯講最久…」（aa630 → aa657）',rf('點乾麵的那個阿伯講最久，講了一個多小時，都在講他太太。')==='常來的那個阿伯講最久，講了一個多小時，都在講他太太。');
check('3b. 「第一個。每天點乾麵的阿伯。」→「第一個。店裡常來的阿伯。」',rf('第一個。每天點乾麵的阿伯。')==='第一個。店裡常來的阿伯。');
for(const s of ['三號桌說要跟上次一樣','三號桌那位是不是都點熱美式']) check('3c. 2:30 AM 有桌號，不換：'+s,rf(s)===s,rf(s));

// 4. 重匯跑得完、和遊戲的 ladder.js 一字不差
const tmp=path.join(fs.mkdtempSync(path.join(os.tmpdir(),'ladre-')),'ladder.js');
const r=cp.spawnSync('python3',[path.join(ROOT,'tools/ladder/import_ladder.py'),'--out',tmp],{encoding:'utf8',timeout:240000});
check('4a. tools/ladder/import_ladder.py 跑得完（結束碼 0）',r.status===0,(r.stderr||r.stdout||'').slice(-300));
check('4b. 重匯結果和 src/data/ladder.js 一字不差',fs.existsSync(tmp)&&fs.readFileSync(tmp,'utf8')===src('src/data/ladder.js'));
check('4c. 沒有加 --out 的時候寫回 src/data/ladder.js（加了就不碰遊戲檔）',/OUT = sys\.argv\[sys\.argv\.index\('--out'\) \+ 1\] if '--out' in sys\.argv else dst/.test(src('tools/ladder/import_ladder.py')));

console.log(fails?'FAILED '+fails:'ALL PASS');
process.exit(fails?1:0);
