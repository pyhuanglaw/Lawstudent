// MSG2-GEN-DRIFT-1104：手機回覆池的產生器重產要和遊戲檔一字不差（msg_pool.js、msg2_pool.js），讀稿換字表 aa630_fix.json 也要重產得出來。
// 起因：產生器（build_pool.py／build_msg2.py → to_js.py／to_js2.py）的句子是照原稿抄的字面值，沒經過讀稿換字表（import_guard.read_fix）；
// 遊戲檔照 AA_612（麵店→燒臘店）、AA_630／AA_627（語彤新背景）、AA_661 改過，重產會把 msg2_pool 8 行、msg_pool 4 行退回舊句。
// 另外 aa630_fix.json 有一組收壞了（「選項「生日快樂。回去請妳吃麵。」：表上那一格前面有「選項」，對不到遊戲的字），選項「回去請妳喝茶。」換不到。
// 修法：to_js*.py 寫檔前，句子（msgs、ask；msg_pool 另外 rules 的說明）照 read_fix 換；gen_aa630_fix.py 先拿掉格子前面的「選項」；build_pool.py 的 AA_202 來源和白名單一樣（3b5043eef，第 6 節和 b10d0567f 相同）。
// 修改前：重產和遊戲檔差 12 行；修改後：一字不差。
'use strict';
const fs=require('fs'), path=require('path'), cp=require('child_process'), os=require('os');
const ROOT=path.join(__dirname,'..');
let fails=0; const check=(name,ok,detail)=>{ console.log((ok?'ok  ':'FAIL ')+name+(ok?'':'　'+JSON.stringify(detail))); if(!ok) fails++; };
const src=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const TMP=fs.mkdtempSync(path.join(os.tmpdir(),'msggen-'));
const run=(args,env)=>cp.spawnSync('python3',args,{cwd:ROOT,encoding:'utf8',timeout:240000,env:Object.assign({},process.env,env||{})});

// 1. 讀稿換字表 aa630_fix.json 重產得出來；沒有「選項「」開頭的壞組；選項那一句收對了
{ const r=run([path.join(ROOT,'tools/story/gen_aa630_fix.py'),'--out',path.join(TMP,'aa630_fix.json')]);
  check('1a. tools/story/gen_aa630_fix.py 跑得完',r.status===0,(r.stderr||'').slice(-300));
  check('1b. 重產的 aa630_fix.json 和 tools/story/aa630_fix.json 一字不差',fs.existsSync(path.join(TMP,'aa630_fix.json'))&&fs.readFileSync(path.join(TMP,'aa630_fix.json'),'utf8')===src('tools/story/aa630_fix.json'));
  const P=JSON.parse(src('tools/story/aa630_fix.json')).pairs;
  check('1c. 沒有「選項「」開頭的組（對不到遊戲的字）',!P.some(([a,b])=>/^選項「/.test(a)||/^選項「/.test(b)),P.filter(([a])=>/^選項/.test(a)));
  check('1d. 選項「生日快樂。回去請妳吃麵。」→「生日快樂。回去請妳喝茶。」（AA_630，語彤生日國外版的回問）',P.some(([a,b])=>a==='生日快樂。回去請妳吃麵。'&&b==='生日快樂。回去請妳喝茶。')); }

// 2. 回覆池重產：msg_pool.js、msg2_pool.js 和遊戲檔一字不差
const env={MSG_POOL_OUT:TMP,MSG_JS_OUT:TMP};
for(const [b,t,f] of [['build_pool.py','to_js.py','msg_pool.js'],['build_msg2.py','to_js2.py','msg2_pool.js']]){
  const r1=run(['-I',path.join(ROOT,'tools/msg',b)],env), r2=r1.status===0?run([path.join(ROOT,'tools/msg',t)],env):{status:-1,stderr:'build failed'};
  check('2a. '+b+' → '+t+' 跑得完',r1.status===0&&r2.status===0,((r1.stderr||'')+(r2.stderr||'')).slice(-300));
  const out=path.join(TMP,f);
  check('2b. 重產的 '+f+' 和 src/data/'+f+' 一字不差（MSG_JS_OUT 寫到別的資料夾，不碰遊戲檔）',fs.existsSync(out)&&fs.readFileSync(out,'utf8')===src('src/data/'+f));
}
// 3. 原本會退回舊句的那幾則（重產的結果裡是新句）
{ const m2=fs.existsSync(path.join(TMP,'msg2_pool.js'))?fs.readFileSync(path.join(TMP,'msg2_pool.js'),'utf8'):'', m1=fs.existsSync(path.join(TMP,'msg_pool.js'))?fs.readFileSync(path.join(TMP,'msg_pool.js'),'utf8'):'';
  for(const [s,o] of [['今天燒臘店我請','今天麵店我請'],['（照片：茶屋拉下來的木門，貼著紅紙）','（照片：麵店拉下來的鐵門，貼著紅紙）'],['生日快樂。回去請妳喝茶。','生日快樂。回去請妳吃麵。'],['謝謝。秀琴姨今天幫我煮了豬腳麵線。','謝謝。阿姨今天幫我煮了豬腳麵線。'],['……不太好。你可以來我家樓下坐一下嗎。','……不太好。你可以來店裡坐一下嗎。'],['（照片：一杯烏龍，旁邊一塊茶點）','（照片：一碗乾麵，加了蛋）']])
    check('3a. msg2_pool 重產：「'+s+'」（不是舊句「'+o+'」）',m2.includes(s)&&!m2.includes(o));
  for(const [s,o] of [['在燒臘店 哥要來嗎','在麵店 哥要來嗎'],['（語音訊息，背景很吵）在燒臘店啦！','（語音訊息，背景很吵）在麵店啦！'],['週六、週日下午在茶屋上班，17:00 以後才回','週二、週四麵店時間，20:30 以後才回'],['芯慈：追劇和財金；','芯慈：追劇和經濟學；']])
    check('3b. msg_pool 重產：「'+s+'」（不是舊句「'+o+'」）',m1.includes(s)&&!m1.includes(o)); }

// 4. msg_pool 的 AA_202 來源＝白名單（3b5043eef）
{ const allow=JSON.parse(src('docs/handoff/story_import_allow.json')).files.find(e=>e.path==='docs/story_planning/AA_202_玩家主動傳訊息_規格.md');
  const sm=src('src/data/msg_pool.js').match(/"source":(\{[^}]*\})/), S=sm?JSON.parse(sm[1]):{};
  check('4. msg_pool.js 的 source.AA_202＝白名單上的 '+(allow&&allow.sha),!!allow&&S.AA_202===allow.sha,{pool:S.AA_202,allow:allow&&allow.sha}); }

console.log(fails?'FAILED '+fails:'ALL PASS');
process.exit(fails?1:0);
