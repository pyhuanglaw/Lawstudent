#!/usr/bin/env node
/* T1 隨機玩家快轉（BB_257 TEST-METHODS-1104，CC-C 寫）——在 Node 跑整個遊戲邏輯，不用瀏覽器、不畫 3D。
 *
 * 用法：
 *   node random_play_sim.js --seeds 20 --from 2025-08-29 --to 2026-06-30      （20 個種子，每個種子一個子程序，同時跑 --jobs 個）
 *   node random_play_sim.js --seed 7                                         （只跑一個種子，印出完整的失敗內容；同一個種子＝同一串操作、同一個失敗）
 *   node random_play_sim.js --seed-list 3,7,12                               （只跑這幾個種子）
 *   其他參數：
 *     --root <遊戲 checkout>   預設：這支腳本往上四層＝repo 根目錄（測舊 commit：git worktree add --detach <dir> <sha>，再 --root <dir>）
 *     --max-steps N            格數上限（一格＝主迴圈一格），預設 6,000,000
 *     --track law|econ         法律系大一（標題「從法律系開始」，預設 2025-08-29 → 2026-06-30）／舊序章系所那一年（「從舊序章系所開始」，2024-08-23 → 2025-08-28）
 *     --procedural             人物模型沒有 VRM 骨架（＝設定「使用正式人物模型」關掉、或 VRM 載不到的程序化人物）
 *     --jobs N（預設 2：雲端只有 4 核、還要跑瀏覽器測試；一個種子一整年約 9～10 分鐘）、--json <結果檔>、--out <心跳檔資料夾>、--hang-ms N（子程序多久沒有輸出算卡死，預設 120000）、-v（印每個動作和遊戲的 console）
 *     --old-forcing YYYY-MM-DD  情境（BB-C T1_FIX ①）：那天 21:00 以後玩家空下來，把自動存檔的旗標放進 _forcing=true（＝舊版存進去的那一份）→ 重新整理頁面、按繼續；
 *                               那一晚玩家不睡（不按床、選單選「再撐一下」），看 04:00 以後會不會照常被送回去睡（STORY.forceHome 真的把日期換到隔天），結束時 _forcing 有沒有清掉
 *     環境變數 RPS_TRACK_OPENING=1：開局（newGame、法律系宿營 S.campY1）還沒演完就檢查「時間只往前」——--from～--to 之間的日子才算（例：--from 2025-08-20 --to 2025-08-26）
 *     --stay-up YYYY-MM-DD      情境（T1_FIX ①的原因）：那天晚上玩家不睡（不改存檔），凌晨被 forceHome 送回去睡以後，馬上看自動存檔裡有沒有 _forcing=true（舊版會存進去）
 *     --start-save <存檔.json>  （SAVE-LZ-1104，BB_384 存檔 B）不開新遊戲：開機後把這份存檔放進自動存檔、按標題的「繼續」從那裡玩（只配 --seed 單一種子）
 *     --save-out <檔>           結束時（到 --to、卡住放棄、步數上限都算）先 GM.autosave(true) 再把自動存檔原文寫到這個檔；印大小（字元數）
 *     --dump-msgs <檔>          （BB_468 HL3）收整段的手機訊息（每個動作掃一次 G.msgs，舊的被刪也留得住），結束時寫 JSON：heroine＝heroine_01～05 傳的、all＝全部；多個種子＝檔名加 _seed<n>
 *   結束碼：全部 PASS＝0，有 FAIL＝1。跑到一半要讓出 CPU：在 --out 資料夾放一個 STOP 檔，還沒開始的種子會直接回報「略過」。
 *
 * 做法（和 tests/pg_harness.js 不一樣：pg_harness 的假 GM 沒有 enter、quickGo、seatMenu、手機、存讀檔，隨機玩家要的這些都得自己再寫一份，所以改成跑真的 game3d.js）：
 *   - 照 index.html 的順序載入 src/ 全部的 script，包括 game3d.js——GM 是遊戲本來的（say、choose、enter、quickGo、seatMenu、doInteract、手機、autosave、applySave、snapshot、validate、migrate）。
 *     game3d.js 只在 IIFE 最後加一行測試出口 GM.__T（validate、migrate、frame、chooseCur…的參照），遊戲程式一個字都沒改。
 *     不載 lib/ 的 three.js：THREE 換成「什麼都接受」的假物件（Vector3 是真的算），區域的 build() 照樣跑——門、座位、床、櫃台、店這些互動點都是遊戲自己建出來的。
 *   - 每次「開頁面」（開機、重新整理頁面）都是一個新的 vm context：模組的狀態清空、舊頁面的計時器不再跑；localStorage（自動存檔）留著。
 *   - 假的東西：①網頁 DOM（照 index.html 建元素；innerHTML 會解析成元素，手機、選單的按鈕 onclick 是遊戲自己掛的）②3D 引擎 E（E3.init 換成假的：走路＝直線走過去、
 *     沒有碰撞和導航、跟著走的人站到玩家旁邊、區域自己的 update（電梯、門）照跑）③CHAR.build（人物＝只有位置、方向的空物件，帶一副假的 VRM 骨架）
 *     ④ASSETS 不下載、A3 音效不出聲、Z3.prewarm／warmup 不做事。⑤效能：CALENDAR 的查詢（只看日期的純函數）記下來。
 *   - 時間：setTimeout／setInterval／requestAnimationFrame／Date／performance.now 全部是虛擬時鐘：一格 100 ms（主迴圈 dt 的上限 0.1 秒）；
 *     玩家空下來、站著「等一下」的時候開 GM.turbo、一格 300 ms（和 ?turbo 一樣），走路、劇情、對話、選單都是一般的格。主迴圈就是 game3d.js 的 frame()。
 *   - 隨機：遊戲的 Math.random＝mulberry32(種子)，玩家的決定用另一顆同種子的。同一個種子、同一個 --root＝完全一樣的一串操作（--seeds 和 --seed 跑出來一樣）。
 *   - 玩家（都是按遊戲本來的按鈕或互動鍵，不直接改旗標）：走到互動點按互動（門＝換區域、座位＝上課／讀書、床＝睡覺或「再撐一下」熬夜、櫃台、店、和人說話；
 *     約好一起走來的人到了常常先找他說話）；打開手機按按鈕（直接去上課、跳過時間、約人、回訊息、傳訊息、快速前往、答應／改天／不了、前往）；一鍵（回去睡覺、到下一堂課）；
 *     等一下；遊戲裡讀自動存檔；重新整理頁面再按標題的「繼續」（劇情演到一半也會）。選單照種子隨機按，只有「上課」「睡覺／再撐一下」照這個種子的個性加權。
 *     黑幕（#fade.on）蓋著的時候按不到底下的東西（對話框、選單要被 overFade 放到黑幕上面才按得到）。
 * 檢查：①沒有例外（含 unhandled rejection、遊戲自己 catch 起來 console.warn／error 的 Error）②選單不是空的 ③遊戲時間只往前（開局演完以後；讀檔重新算）
 *   ④只演一次的事件（STORY_EVENTS 的 once、max_times）沒有重演 ⑤隨機時間點 GM.snapshot→JSON→validate→migrate 和存之前比（補欄位只記注意，改掉、刪掉已有的值才算），
 *   再 applySave 讀回來，日期、時間、地點、錢不變 ⑥錢是有限的數字、關係值（social3d.js 的 fam／trust／aff／resp／comf／rom／npcRom，G.rel）在 0～100 ⑦格數上限
 *   ⑧卡住：劇情鎖著、畫面上沒有對話或選項超過 30 秒（同 game3d.js staleCheck）、鎖著超過 30 分鐘、玩家 300 秒沒有任何東西按得到；子程序沒有輸出（同步的無窮迴圈）由父程序砍掉
 *   ⑨一起走過去的邀約到了約好的地方 15 分鐘還停在 going ⑩過了 04:00 空著沒被送回去睡（forceHome）。卡住以後照玩家的做法重新整理頁面讀自動存檔（最多 8 次）。
 * 結果分類照 BB_256：GAME_BUG（遊戲程式錯）／TEST_BUG（假物件少了東西）／UNKNOWN。自動分類只是初判；KNOWN 表是看過、確定的（照被測版本有沒有那個修正決定套不套）。
 */
'use strict';
const fs=require('fs'), path=require('path'), vm=require('vm'), cp=require('child_process'), os=require('os');
const RealDate=Date, realSetImmediate=setImmediate, realSetTimeout=setTimeout;
const realMs=()=>Number(process.hrtime.bigint()/1000000n);
const RC={log:console.log.bind(console),warn:console.warn.bind(console),error:console.error.bind(console)};
const SELF=__filename;

/* ====================== 參數 ====================== */
function parseArgs(argv){
  const o={seeds:20,seed:null,from:null,to:null,root:path.resolve(__dirname,'../../../..'),maxSteps:6000000,track:'law',jobs:Math.max(1,Math.min(2,os.cpus().length)),child:false,verbose:false,json:null,hangMs:120000,out:null};
  for(let i=0;i<argv.length;i++){ const a=argv[i], nx=()=>argv[++i];
    if(a==='--seeds') o.seeds=+nx(); else if(a==='--seed-list') o.seedList=nx().split(',').map(Number).filter(x=>Number.isFinite(x)); else if(a==='--seed') o.seed=+nx(); else if(a==='--from') o.from=nx(); else if(a==='--to') o.to=nx();
    else if(a==='--root') o.root=path.resolve(nx()); else if(a==='--max-steps') o.maxSteps=+nx(); else if(a==='--track') o.track=nx(); else if(a==='--jobs') o.jobs=+nx();
    else if(a==='--child') o.child=true; else if(a==='-v'||a==='--verbose') o.verbose=true; else if(a==='--json') o.json=nx(); else if(a==='--hang-ms') o.hangMs=+nx(); else if(a==='--out') o.out=nx(); else if(a==='--procedural') o.procedural=true; else if(a==='--old-forcing') o.oldForcing=nx(); else if(a==='--stay-up') o.stayUp=nx(); else if(a==='--start-save'){ const v=nx(), c=[path.resolve(v), path.join(__dirname,v), path.join(__dirname,'fixtures',path.basename(v))]; o.startSave=c.find(f=>{ try{ return fs.existsSync(f); }catch(e){ return false; } })||c[0]; }   /* 11-14 CC-C：電腦上 cwd＝受測版本工作樹，fixtures 在 cc-testing（這支腳本旁邊）——找不到就到腳本旁邊、fixtures/ 找 */ else if(a==='--save-out') o.saveOut=path.resolve(nx()); else if(a==='--dump-msgs') o.dumpMsgs=path.resolve(nx());
    else if(a==='-h'||a==='--help') o.help=true; else throw new Error('不認得的參數：'+a); }
  const TR={law:{from:'2025-08-29',to:'2026-06-30'},econ:{from:'2024-08-23',to:'2025-08-28'}};
  if(!TR[o.track]) throw new Error('--track 只有 law、econ');
  o.from=o.from||TR[o.track].from; o.to=o.to||TR[o.track].to; return o; }

/* ====================== 分類表（看過、確定的）====================== */
/* re 比對「訊息＋stack」；cls 是確定的分類，why 是原因。自動判斷（classify）之前先看這張表。 */
/* kinds：哪幾種失敗；re：比對「為什麼＋內容」；need(F,f)：被測版本的程式有沒有那個修正（F＝src 的特徵）、這一筆失敗的前後（f.lastActions）。
   只在「被測的程式還沒有那個修正」時才套用——同樣的現象出現在已經修好的版本＝新的問題，照舊 UNKNOWN。 */
const KNOWN=[
  {id:'AN-MEAL-STUCK-1027',kinds:['STUCK','STUCK_INVITE'],re:/INV\.S\.(meet|startTogether|arrive|autoStart)/,need:F=>!F.invArriveLock,cls:'GAME_BUG',
   why:'AN-MEAL-STUCK-1027：invites3d.js 的 S.arrive（走進門先等 0.9 秒）／S.autoStart（Promise.then 延後）開演前沒有先 sceneBegin，這段空檔玩家按「和她說話」或別的事件同時開演，兩段一起演、一段的對話被蓋掉永遠等不到（修正：35f8e7fb2／rc2 6aebbb4d8，v9.10.11 c8b9659e5）'},
  {id:'AN-MEAL-STUCK-1027',kinds:['STUCK'],re:/talkCharacter|talkSis|talkAn/,need:(F,f)=>!F.invArriveLock&&(f.lastActions||[]).some(a=>/約在|一起走|和.*約/.test(a))&&(f.lastActions||[]).some(a=>/走了 \d+ 分鐘到|按互動：和/.test(a)),cls:'GAME_BUG',
   why:'AN-MEAL-STUCK-1027（推定）：到了約好的地方、S.autoStart 的見面和玩家按的「和○○說話」同時開演，說話那一段被見面蓋掉（invites3d.js 沒有先 sceneBegin；修正 35f8e7fb2／rc2）'},
  {id:'SAY-COVER-1027',kinds:['STUCK'],re:/./,need:F=>!F.sayStack,cls:'GAME_BUG',
   why:'這一版 game3d.js 的 say 只留一個等點擊的 resolve（沒有 sayStack）：兩段劇情同時說話，先開始的那一段永遠等不到＝停在那一句（同一類在 STUCK-HARDEN-1027 33d24f9db 修好：say 的 sayStack 保底）'},
  {id:'CAMP-Y1-DAY-BEFORE-HOUR',kinds:['TIME_BACK'],re:/./,need:(F,f)=>!!(f.G&&(f.G.busyWho||[]).some(w=>/campY1/.test(w))),cls:'GAME_BUG',
   why:'（輕微）story3d.js S.campY1：換到宿營下一天時先設 G.day、等 1.6 秒日期卡（titleCard）、才設 G.hour——那 1.6 秒是「隔天＋前一段的時刻」（例 8/23 19:30），接著設成 17:30＝時間倒退 2 小時。舊序章系所路線 8/22 從家裡出發去宿營才看得到（法律系開局的宿營在檢查開始以前）；影響：日期卡那 1.6 秒 HUD 的時間是錯的'},
  {id:'FORCING-SAVED',kinds:['NO_FORCEHOME','TIME_BACK'],re:/_forcing=true|./,need:(F,f)=>F.forcingPersist&&(/_forcing=true/.test(f.msg)||(f.kind==='TIME_BACK'&&/之前 G\.day=-?\d+ G\.hour=(2[7-9]|[3-9]\d|\d{3,})\./.test(f.msg))),cls:'GAME_BUG',
   why:'story3d.js S.forceHome 把 G.flags._forcing=true 放在存檔的旗標裡：凌晨被送回去睡（sleepNow 醒來那一下會 GM.autosave）的自動存檔帶著 _forcing=true，醒來後 45 秒內（下一次自動存檔前）重新整理頁面、按繼續，讀回來 _forcing 一直是 true，forceHome 第一行就 return——之後每天都不會在 02:30 被送回去睡，時間一直往上加（29:00、47:00…），睡覺的時候日期只加一天，時間看起來倒退。migrate 沒有清 _forcing'},
  {id:'BADCLIP-NOVRM',kinds:['EXCEPTION'],re:/racketHead|badminton_clip3d/,need:F=>F.procedural,cls:'GAME_BUG',
   why:'羽球片段（badminton_clip3d.js）：人物沒有 VRM 骨架（程序化備用人物：設定「使用正式人物模型」關掉、或 VRM 載不到）時 attachRacket 回傳 null，racketHead(null) 在 requestAnimationFrame 裡丟例外、動畫迴圈停掉、BADCLIP.play 永遠不回來（跳過鈕也沒用）＝卡住。瀏覽器還沒驗'},
];

/* ====================== 父程序：分派種子、收結果 ====================== */
async function parent(o){
  const seeds=o.seed!=null?[o.seed]:(o.seedList&&o.seedList.length?o.seedList:Array.from({length:o.seeds},(_,i)=>i+1));
  const outDir=o.out||path.join(os.tmpdir(),'rps_'+process.pid); fs.mkdirSync(outDir,{recursive:true});
  RC.log('隨機玩家快轉：root='+o.root+'　track='+o.track+'　'+o.from+' → '+o.to+'　種子 '+seeds.join(',')+'　同時 '+o.jobs+' 個');
  try{ RC.log('遊戲版本：'+cp.execSync('git -C '+JSON.stringify(o.root)+' log --oneline -1',{encoding:'utf8'}).trim()); }catch(e){}
  const t0=realMs(); const results=[]; let next=0;
  const runOne=seed=>new Promise(res=>{ const args=[SELF,'--child','--seed',String(seed),'--root',o.root,'--from',o.from,'--to',o.to,'--track',o.track,'--max-steps',String(o.maxSteps),'--out',outDir].concat(o.procedural?['--procedural']:[]).concat(o.oldForcing?['--old-forcing',o.oldForcing]:[]).concat(o.stayUp?['--stay-up',o.stayUp]:[]).concat(o.startSave&&seeds.length===1?['--start-save',o.startSave]:[]).concat(o.saveOut&&seeds.length===1?['--save-out',o.saveOut]:[]).concat(o.dumpMsgs?['--dump-msgs',seeds.length===1?o.dumpMsgs:o.dumpMsgs.replace(/(\.json)?$/,'_seed'+seed+'.json')]:[]);   /* 11-14 CC-C：--start-save／--save-out 也傳給子程序（--seed-list 只給一個種子時）；只配單一種子 */
    const ch=cp.spawn(process.execPath,['--max-old-space-size=3072',...args],{stdio:['ignore','pipe','pipe']}); const ts=realMs(); let buf='', lastHb=realMs(), result=null, hb=null, errTail='';
    ch.stdout.on('data',d=>{ buf+=d; let k; while((k=buf.indexOf('\n'))>=0){ const line=buf.slice(0,k); buf=buf.slice(k+1); lastHb=realMs();
      if(line.startsWith('@@RESULT ')){ try{ result=JSON.parse(line.slice(9)); }catch(e){ errTail+='結果解析失敗 '; } } else if(line.startsWith('@@HB ')){ try{ hb=JSON.parse(line.slice(5)); }catch(e){} } } });
    ch.stderr.on('data',d=>{ errTail=(errTail+d).slice(-3000); lastHb=realMs(); });
    const wd=setInterval(()=>{ if(realMs()-lastHb>o.hangMs){ clearInterval(wd); ch.kill('SIGKILL'); } },2000);
    ch.on('exit',(code,sig)=>{ clearInterval(wd); const ms=realMs()-ts;
      if(!result){ let ring=null; try{ ring=JSON.parse(fs.readFileSync(path.join(outDir,'seed_'+seed+'.ring.json'),'utf8')); }catch(e){}
        result={seed,ok:false,crashed:true,ms,code,sig,hb,fails:[{kind:sig?'HANG':'CRASH',cls:sig?'UNKNOWN':'UNKNOWN',why:sig?('子程序 '+o.hangMs+' ms 沒有任何輸出（同步的無窮迴圈或 Node 本身卡住），被砍掉'):('子程序結束碼 '+code),
          msg:errTail.slice(-800),lastActions:ring&&ring.actions||[],G:ring&&ring.G||null,step:ring&&ring.step,frame:ring&&ring.frame}]}; }
      result.ms=ms; res(result); }); });
  const pool=Array.from({length:Math.min(o.jobs,seeds.length)},async()=>{ while(next<seeds.length){ const s=seeds[next++]; const r=await runOne(s); results.push(r); RC.log(fmtLine(r)); } });
  await Promise.all(pool); results.sort((a,b)=>a.seed-b.seed);
  const tot=realMs()-t0; RC.log('\n================ 總結 ================');
  for(const r of results) RC.log(fmtLine(r));
  const pass=results.filter(r=>r.ok).length; RC.log('PASS '+pass+'／'+results.length+'　總時間 '+(tot/1000).toFixed(1)+' 秒（每個種子平均 '+(results.reduce((a,r)=>a+r.ms,0)/results.length/1000).toFixed(1)+' 秒）');
  for(const r of results) if(!r.ok||r.fails.length){ RC.log('\n---------- 種子 '+r.seed+' ----------'); for(const f of r.fails) RC.log(fmtFail(f,r,o)); }
  const warnAgg={}; for(const r of results) for(const w of (r.notes||[])){ const k=w.k; warnAgg[k]=warnAgg[k]||{k,n:0,seeds:[],ex:w.ex}; warnAgg[k].n+=w.n; warnAgg[k].seeds.push(r.seed); }
  if(Object.keys(warnAgg).length){ RC.log('\n---------- 注意（不算 FAIL：遊戲自己有保底或只是提示）----------'); for(const w of Object.values(warnAgg).sort((a,b)=>b.n-a.n)) RC.log('  '+w.n+' 次（種子 '+w.seeds.join(',')+'）'+w.k+(w.ex?'　例：'+w.ex:'')); }
  if(o.json) fs.writeFileSync(o.json,JSON.stringify({root:o.root,track:o.track,from:o.from,to:o.to,ms:tot,results},null,1));
  process.exit(results.every(r=>r.ok)?0:1); }
function fmtLine(r){ const f=r.fails||[]; const cls=[...new Set(f.map(x=>x.cls+(x.known?':'+x.known:'')))].join('/');
  return '種子 '+String(r.seed).padStart(3)+'  '+(r.ok?'PASS':'FAIL')+'  '+(r.ms/1000).toFixed(1).padStart(6)+' 秒  到 '+(r.reached||'?')+'  步數 '+(r.steps||0)+'  格數 '+(r.frames||0)+(f.length?'  失敗 '+f.length+' 種（'+cls+'）':''); }
function fmtFail(f,r,o){ const L=[];
  L.push('【'+f.cls+(f.known?'：'+f.known:'')+'】'+f.kind+(f.count>1?'（同樣的 '+f.count+' 次）':'')+'　第 '+f.step+' 步、第 '+f.frame+' 格');
  if(f.why) L.push('  為什麼：'+f.why); if(f.msg) L.push('  內容：'+String(f.msg).split('\n').slice(0,8).join('\n         '));
  if(f.G) L.push('  G：'+JSON.stringify(f.G));
  if(f.lastActions&&f.lastActions.length){ L.push('  最後 '+f.lastActions.length+' 個動作：'); for(const a of f.lastActions) L.push('    '+a); }
  L.push('  重現：node '+path.relative(process.cwd(),SELF)+' --seed '+r.seed+' --root '+o.root+' --from '+o.from+' --to '+o.to+(o.track!=='law'?' --track '+o.track:'')+(o.procedural?' --procedural':''));
  return L.join('\n'); }

/* ====================== 子程序：跑一個種子 ====================== */
async function child(o){
  /* --out 資料夾裡有 STOP 檔＝這一批先不要再開新的種子（別的測試要 CPU）：還沒開始的種子直接回報「略過」，正在跑的照跑 */
  if(o.out&&fs.existsSync(path.join(o.out,'STOP'))){ const r={seed:o.seed,ok:false,skipped:true,reached:null,steps:0,frames:0,fails:[{kind:'SKIPPED',cls:'—',why:'--out 裡有 STOP（暫停開新的種子），沒有跑',msg:'',lastActions:[]}]}; process.stdout.write('@@RESULT '+JSON.stringify(r)+'\n'); return r; }
  const R={seed:o.seed,ok:true,fails:[],sig:new Map(),notes:new Map(),actions:[],step:0,frame:0,reached:null,steps:0,frames:0,pages:0};
  const t0=realMs();
  /* ---------- 種子、虛擬時鐘 ---------- */
  const mulberry32=a=>()=>{ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };
  const rngGame=mulberry32(o.seed*2654435761>>>0), rngPlay=mulberry32((o.seed*40503+12345)>>>0);
  const rnd=()=>rngPlay(), ri=(a,b)=>a+Math.floor(rnd()*(b-a+1)), pick=a=>a[Math.floor(rnd()*a.length)];
  const wpick=list=>{ const tot=list.reduce((s,x)=>s+x[0],0); if(tot<=0) return null; let r=rnd()*tot; for(const x of list){ r-=x[0]; if(r<=0) return x[1]; } return list[list.length-1][1]; };
  const EPOCH=RealDate.UTC(2026,10,4,12,0,0);
  const VC={now:0,seq:0,timers:new Map(),heap:[]};
  const hLess=(a,b)=>a.at<b.at||(a.at===b.at&&a.id<b.id);
  const hPush=t=>{ const H=VC.heap; H.push(t); let i=H.length-1; while(i>0){ const p=(i-1)>>1; if(hLess(H[i],H[p])){ [H[i],H[p]]=[H[p],H[i]]; i=p; } else break; } };
  const hPop=()=>{ const H=VC.heap; const top=H[0]; const last=H.pop(); if(H.length){ H[0]=last; let i=0; for(;;){ const l=2*i+1, r=l+1; let m=i; if(l<H.length&&hLess(H[l],H[m])) m=l; if(r<H.length&&hLess(H[r],H[m])) m=r; if(m===i) break; [H[i],H[m]]=[H[m],H[i]]; i=m; } } return top; };
  /* 計時器記在哪一個「頁面」：重新整理頁面＝舊頁面的計時器全部不再跑（和瀏覽器一樣）*/
  const vSetTimeout=(pg,fn,ms,args)=>{ const id=++VC.seq; const t={id,at:VC.now+Math.max(0,+ms||0),fn,args,iv:0,pg}; VC.timers.set(id,t); hPush(t); return id; };
  const vSetInterval=(pg,fn,ms,args)=>{ const id=++VC.seq; const iv=Math.max(1,+ms||0); const t={id,at:VC.now+iv,fn,args,iv,pg}; VC.timers.set(id,t); hPush(t); return id; };
  const vClear=id=>{ VC.timers.delete(id); };
  const flush=()=>new Promise(r=>realSetImmediate(r));
  async function vAdvance(ms){ const end=VC.now+ms; for(;;){ const H=VC.heap; while(H.length&&!VC.timers.has(H[0].id)) hPop(); const t=H[0]; if(!t||t.at>end) break; hPop();
      if(VC.timers.get(t.id)!==t) continue; if(t.pg&&t.pg.dead){ VC.timers.delete(t.id); continue; } VC.now=Math.max(VC.now,t.at); if(t.iv){ t.at=VC.now+t.iv; hPush(t); } else VC.timers.delete(t.id);
      try{ if(typeof t.fn==='function') t.fn(...(t.args||[])); }catch(e){ onExc(e,'計時器（setTimeout）裡丟出'); } await flush(); }
    VC.now=end; }
  class VDate extends RealDate{ constructor(a,b,c,d,e,f,g){ const n=arguments.length; if(n===0) super(EPOCH+VC.now); else if(n===1) super(a); else if(n===2) super(a,b); else if(n===3) super(a,b,c); else super(a,b,c,d===undefined?0:d,e===undefined?0:e,f===undefined?0:f,g===undefined?0:g); } static now(){ return EPOCH+VC.now; } }
  VDate.UTC=RealDate.UTC; VDate.parse=RealDate.parse;
  const PERF={now:()=>VC.now,mark(){},measure(){},getEntriesByName:()=>[],timeOrigin:EPOCH,memory:{usedJSHeapSize:0}};

  /* ---------- 目前的頁面（重新整理頁面＝換一個新的 vm context）---------- */
  let P=null, GM=null, T=null, E=null, E0=null, D=null, W=null, getById=()=>null, DOC=null;
  function bindPage(pg){ P=pg; GM=pg.GM; T=GM?GM.__T:null; E=pg.E; E0=pg.E0; D=GM?GM.D:null; W=pg.ctx; getById=pg.getById; DOC=pg.DOC; }

  /* ---------- 紀錄：失敗、注意、動作 ---------- */
  const dayKey=d=>{ try{ return W.CALENDAR.dateOf(d).key; }catch(e){ return 'day'+d; } };
  const fmtH=h=>{ h=+h||0; const m=Math.round(h*60); return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0'); };
  const gSum=()=>{ const g=GM&&GM.G; if(!g) return null; const F=g.flags||{}; const iv=(g.invites||[]).filter(v=>['offered','accepted','going','changed'].includes(v.state)).map(v=>v.id+':'+v.who+'@'+v.place+':'+v.state);
    return {day:g.day,date:dayKey(g.day),hour:+(+g.hour).toFixed(3),zone:g.zone,stage:g.stage,money:g.money,energy:g.energy,weekday:g.weekday,busy:!!(E&&E.player&&E.player.busy),depth:D&&D.busyDepth,busyWho:D&&D.busyWho&&D.busyWho.slice(0,3),
      evRunning:W&&W.EVENTS?W.EVENTS.running||null:null,companion:F.companion||null,dating_kexin:F.dating_kexin,invites:iv.slice(0,4),evDone:g.events&&g.events.count,page:P&&P.id}; };
  /* 11-14 CC-C（BB_468 HEROINE-LIFE-1028 HL3）：--dump-msgs <檔>＝收手機訊息（G.msgs 最多 200 則、舊的會刪＝每個動作掃一次，新的記下來），結束時寫成 JSON（預設不開，不影響原本） */
  const MSGS=new Map(); const scanMsgs=()=>{ if(!o.dumpMsgs) return; const g=GM&&GM.G; if(!g||!Array.isArray(g.msgs)) return; for(const m of g.msgs){ if(!m) continue; const k=[m.day,m.h,m.th||'',m.from||'',m.who||'',m.text||''].join('|'); if(!MSGS.has(k)) MSGS.set(k,{date:dayKey(m.day),day:m.day,h:m.h,th:m.th||(m.who?'p:'+m.who:'sys'),from:m.from||null,who:m.who||null,text:m.text,tag:m.tag||null,ask:m.ask?(m.ask.id||true):null}); } };
  const act=t=>{ scanMsgs(); const g=GM&&GM.G; const s='#'+R.step+' f'+R.frame+' '+(g?dayKey(g.day)+' '+fmtH(g.hour)+' '+g.zone:'')+'｜'+t; R.actions.push(s); if(R.actions.length>20) R.actions.shift(); if(o.verbose) RC.log(s); };
  function fail(kind,cls,why,msg,extra){ const sig=kind==='TIME_BACK'?kind:kind+'|'+String(msg).split('\n')[0].slice(0,200); if(R.sig.has(sig)){ R.sig.get(sig).count++; return R.sig.get(sig); }
    const f={kind,cls,why,msg:String(msg).slice(0,4000),step:R.step,frame:R.frame,G:gSum(),lastActions:R.actions.slice(),extra:extra||null,count:1};
    if(f.cls==='UNKNOWN'||kind==='EXCEPTION'){ for(const k of KNOWN){ if(!k.kinds.includes(kind)) continue; if(!k.re.test(f.why+'\n'+f.msg)) continue; try{ if(k.need&&!k.need(FEAT,f)) continue; }catch(e){ continue; } f.cls=k.cls; f.known=k.id; f.why=k.why+'｜（原本的判斷：'+why+'）'; break; } }
    R.fails.push(f); R.sig.set(sig,f); R.ok=false; if(o.verbose||o.single) RC.log('\n!!! FAIL '+kind+'（'+f.cls+'）'+String(msg).split('\n').slice(0,o.verbose?6:1).join('\n    ').slice(0,900)); return f; }
  function note(k,ex){ const n=R.notes.get(k)||{k,n:0,ex:null}; n.n++; if(!n.ex&&ex) n.ex=String(ex).slice(0,240)+(GM&&GM.G?'（'+dayKey(GM.G.day)+' '+fmtH(GM.G.hour)+' '+GM.G.zone+'）':'');
    /* CC-C 11-04（BB-C 17:30）：BUG-TALK-STUCK 每一次都留（在哪裡、誰、前一個動作），總表列最常出現的情境 */
    if(/TALK-STUCK/.test(k)&&GM&&GM.G){ if(!n.all) n.all=[]; if(n.all.length<60) n.all.push({at:dayKey(GM.G.day)+' '+fmtH(GM.G.hour), zone:GM.G.zone, msg:String(ex||'').slice(0,160), last:(R.actions||[]).slice(-3)}); }
    R.notes.set(k,n); }
  /* 例外的初判（KNOWN 表優先）*/
  const FEAT={};   // 被測版本的特徵（KNOWN 表用）
  const missing=new Map();   // 假引擎 E 被讀了、但沒有的屬性（TEST_BUG 的線索）
  function classify(err,where){ const msg=String(err&&err.message||err), st=String(err&&err.stack||''); const both=msg+'\n'+st;
    const frames=st.split('\n').slice(1).map(s=>s.trim()).filter(Boolean); const top=frames[0]||'';
    if(/random_play_sim\.js/.test(top)) return {cls:'TEST_BUG',why:'例外丟在假物件（random_play_sim.js）裡：'+top};
    const mm=msg.match(/(?:\b(\w+) is not a function|reading '(\w+)'|setting '(\w+)')/); const key=mm&&(mm[1]||mm[2]||mm[3]);
    if(key&&missing.has(key)) return {cls:'TEST_BUG',why:'假引擎 E 沒有 '+key+'（遊戲讀了 E.'+key+'）'};
    const src=frames.find(f=>/src\//.test(f));
    if(src) return {cls:'UNKNOWN',why:'例外在遊戲程式（'+src.replace(/^at /,'')+'），'+where+'；還沒確認是不是假物件不夠真'};
    return {cls:'UNKNOWN',why:where+'；stack 裡沒有 src/ 的檔案'}; }
  function onExc(e,where){ const c=classify(e,where); fail('EXCEPTION',c.cls,c.why,(e&&e.stack)||String(e)); }
  process.on('unhandledRejection',e=>onExc(e,'unhandled rejection（沒有人接的 Promise 錯誤）'));
  process.on('uncaughtException',e=>onExc(e,'uncaught exception'));
  /* 遊戲的 console：Error 物件＝遊戲 catch 起來的例外（照樣算 FAIL）；其他字串照類別記成「注意」 */
  const NOISE=/正式模型載入失敗|assets failed|載入失敗，用|Failed to parse URL|NO_NET|shader|GLB|glb|貼圖|texture|模型/;
  const NOTABLE=[[/一句話還沒點，另一段的話蓋上來/,'對話重疊：一句話還沒點，另一段的話蓋上來（game3d.js 會在演完後放回去）'],[/選單蓋在另一個還沒選的選單上/,'選單重疊：一個選單蓋在另一個還沒選的選單上'],
    [/劇情鎖住沒有結束/,'game3d.js staleCheck：劇情鎖住沒有結束（BUG-BOWL-STUCK-1018 那一個保底）'],[/walkTo 卡住/,'walkTo 卡住 → 放到目的地（走路保底）'],[/說話結束時還有沒結束的段落/,'說話結束時還有沒結束的段落（BUG-TALK-STUCK-1104 的 warn）'],
    [/星期和日期對不上/,'星期和日期對不上（syncWeekday 改回來）'],[/spawn was inside|spawn relocated|relocated spot/,'出生點落在擋住的格子（假引擎沒有導航網格，不算）'],[/portrait missing/,'立繪缺檔 → 用 neutral（素材，不算）']];
  const isErr=x=>!!x&&typeof x==='object'&&typeof x.stack==='string'&&typeof x.message==='string';
  const conWrap=(lvl)=>(...a)=>{ if(o.verbose) RC[lvl==='log'?'log':'warn']('  [game '+lvl+']',...a.map(x=>isErr(x)?x.stack.split('\n').slice(0,3).join(' | '):x));
    if(lvl==='log') return; const err=a.find(isErr); const head=a.filter(x=>typeof x==='string').join(' ');
    if(err){ if(NOISE.test(head+' '+err.message)) { note('3D／素材相關的例外（不算，假的 THREE）：'+head.slice(0,40),err.message); return; } onExc(err,'遊戲自己 catch 起來、console.'+lvl+'（'+head.slice(0,60)+'）'); return; }
    if(NOISE.test(head)) return; for(const [re,k] of NOTABLE) if(re.test(head)){ note(k,head); return; } note('console.'+lvl+'：'+head.slice(0,50),head); };
  const CON={log:conWrap('log'),info:conWrap('log'),debug:conWrap('log'),warn:conWrap('warn'),error:conWrap('error'),trace(){},group(){},groupEnd(){},groupCollapsed(){},table(){},time(){},timeEnd(){},assert(){},count(){}};

  /* ---------- 假的網頁（DOM）：照 index.html 建，innerHTML 會解析 ---------- */
  const VOID=new Set(['area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr']);
  const dec=s=>String(s).replace(/&(amp|lt|gt|quot|#39|nbsp|#(\d+));/g,(m,k,n)=>n?String.fromCharCode(+n):({amp:'&',lt:'<',gt:'>',quot:'"','#39':"'",nbsp:' '})[k]);
  const camel=s=>s.replace(/-([a-z])/g,(m,c)=>c.toUpperCase());
  class ClassList{ constructor(el){ this.el=el; this.s=new Set(); } add(...c){ for(const x of c) this.s.add(x); } remove(...c){ for(const x of c) this.s.delete(x); } contains(c){ return this.s.has(c); }
    toggle(c,f){ const on=f===undefined?!this.s.has(c):!!f; if(on) this.s.add(c); else this.s.delete(c); return on; } replace(a,b){ if(this.s.has(a)){ this.s.delete(a); this.s.add(b); } } get length(){ return this.s.size; } toString(){ return [...this.s].join(' '); } }
  class Txt{ constructor(t){ this.nodeType=3; this.data=String(t); this.parentNode=null; } get textContent(){ return this.data; } }
  let CUR_DOM=null;   // 正在建的頁面（El 的 id 登記到這一頁）
  class El{ constructor(tag){ this.tagName=String(tag).toUpperCase(); this.nodeName=this.tagName; this.nodeType=1; this.childNodes=[]; this.parentNode=null; this.attrs={}; this.dataset={}; this.style={setProperty(){},removeProperty(){},getPropertyValue:()=>''}; this.classList=new ClassList(this); this._id=''; this._dom=CUR_DOM;
      this.listeners={}; this.scrollTop=0; this.scrollLeft=0; this.scrollHeight=0; this.clientHeight=0; this.clientWidth=0; this.offsetWidth=100; this.offsetHeight=30; this.value=''; this.checked=false; this.disabled=false; this.width=300; this.height=150; this.onclick=null; }
    get id(){ return this._id; } set id(v){ this._id=String(v); if(v&&this._dom) this._dom.idMap.set(String(v),this); }
    get className(){ return this.classList.toString(); } set className(v){ this.classList.s=new Set(String(v).split(/\s+/).filter(Boolean)); }
    get children(){ return this.childNodes.filter(n=>n.nodeType===1); } get firstElementChild(){ return this.children[0]||null; } get lastElementChild(){ const c=this.children; return c[c.length-1]||null; }
    get firstChild(){ return this.childNodes[0]||null; } get lastChild(){ return this.childNodes[this.childNodes.length-1]||null; }
    get nextElementSibling(){ const p=this.parentNode; if(!p) return null; const c=p.children; return c[c.indexOf(this)+1]||null; }
    get textContent(){ return this.childNodes.map(n=>n.textContent).join(''); } set textContent(v){ for(const n of this.childNodes) n.parentNode=null; this.childNodes=v===''||v==null?[]:[new Txt(v)]; this.childNodes.forEach(n=>n.parentNode=this); }
    get innerText(){ return this.textContent; } set innerText(v){ this.textContent=v; }
    get innerHTML(){ return this._html!=null?this._html:this.textContent; } set innerHTML(v){ for(const n of this.childNodes) n.parentNode=null; this.childNodes=[]; this._html=String(v); const keep=CUR_DOM; CUR_DOM=this._dom; try{ parseHTML(String(v),this); } finally { CUR_DOM=keep; } }
    set outerHTML(v){} get outerHTML(){ return this.innerHTML; }
    appendChild(c){ if(c.parentNode&&c.parentNode.removeChild) c.parentNode.removeChild(c); c.parentNode=this; this.childNodes.push(c); return c; } append(...cs){ for(const c of cs) this.appendChild(typeof c==='string'?new Txt(c):c); } prepend(...cs){ for(const c of cs.reverse()){ const n=typeof c==='string'?new Txt(c):c; n.parentNode=this; this.childNodes.unshift(n); } }
    insertBefore(c,ref){ if(c.parentNode&&c.parentNode.removeChild) c.parentNode.removeChild(c); const i=this.childNodes.indexOf(ref); c.parentNode=this; if(i<0) this.childNodes.push(c); else this.childNodes.splice(i,0,c); return c; }
    removeChild(c){ const i=this.childNodes.indexOf(c); if(i>=0) this.childNodes.splice(i,1); c.parentNode=null; return c; } remove(){ if(this.parentNode) this.parentNode.removeChild(this); } replaceWith(n){ const p=this.parentNode; if(p){ p.insertBefore(n,this); p.removeChild(this); } }
    replaceChildren(...cs){ this.childNodes=[]; this.append(...cs); }
    /* CC-C 11-14：SAVE_LZ_growB 種子 1 TEST_BUG——game3d.js openMenu（存檔選單、物品清單 GG3.ownHTML）用 insertAdjacentHTML，假 DOM 沒有＝例外（真瀏覽器有） */
    insertAdjacentHTML(pos,html){ const keep=CUR_DOM; CUR_DOM=this._dom; const t=new El('div'); try{ parseHTML(String(html),t); } finally { CUR_DOM=keep; } const ns=t.childNodes.slice(), p=String(pos).toLowerCase();
      if(p==='beforeend'){ for(const n of ns) this.appendChild(n); if(this._html!=null) this._html+=String(html); }
      else if(p==='afterbegin'){ for(let i=ns.length-1;i>=0;i--) this.insertBefore(ns[i],this.childNodes[0]); if(this._html!=null) this._html=String(html)+this._html; }
      else { const par=this.parentNode; if(!par) return; const ref=p==='beforebegin'?this:(par.childNodes[par.childNodes.indexOf(this)+1]||null); for(const n of ns){ if(ref) par.insertBefore(n,ref); else par.appendChild(n); } } }
    setAttribute(k,v){ v=String(v); this.attrs[k]=v; if(k==='id') this.id=v; else if(k==='class') this.className=v; else if(k.startsWith('data-')) this.dataset[camel(k.slice(5))]=v; else if(k==='value') this.value=v; }
    getAttribute(k){ if(k==='id') return this._id||null; if(k==='class') return this.className; return k in this.attrs?this.attrs[k]:null; } hasAttribute(k){ return k in this.attrs||(k==='id'&&!!this._id); } removeAttribute(k){ delete this.attrs[k]; if(k.startsWith('data-')) delete this.dataset[camel(k.slice(5))]; }
    toggleAttribute(k,f){ const on=f===undefined?!(k in this.attrs):!!f; if(on) this.attrs[k]=''; else delete this.attrs[k]; return on; }
    addEventListener(t,f){ (this.listeners[t]=this.listeners[t]||[]).push(f); } removeEventListener(t,f){ const L=this.listeners[t]; if(L){ const i=L.indexOf(f); if(i>=0) L.splice(i,1); } }
    dispatchEvent(ev){ for(const f of (this.listeners[ev.type]||[]).slice()) f.call(this,ev); const h=this['on'+ev.type]; if(typeof h==='function') h.call(this,ev); return true; }
    click(){ const ev=mkEv('click',this); const r=typeof this.onclick==='function'?this.onclick.call(this,ev):undefined; for(const f of (this.listeners.click||[]).slice()) f.call(this,ev); return r; }
    focus(){} blur(){} select(){} scrollIntoView(){} scrollTo(){} animate(){ return {finished:Promise.resolve(),cancel(){},onfinish:null}; } requestFullscreen(){ return Promise.resolve(); }
    getBoundingClientRect(){ return {left:0,top:0,right:100,bottom:30,width:100,height:30,x:0,y:0}; } getClientRects(){ return []; }
    getContext(){ return CTX; } toDataURL(){ return 'data:,'; } toBlob(f){ f&&f(null); } setPointerCapture(){} releasePointerCapture(){}
    contains(n){ for(let x=n;x;x=x.parentNode) if(x===this) return true; return false; }
    closest(sel){ for(let x=this;x&&x.nodeType===1;x=x.parentNode) if(matches(x,sel)) return x; return null; } matches(sel){ return matches(this,sel); }
    querySelectorAll(sel){ const out=[]; const walk=n=>{ for(const c of n.childNodes){ if(c.nodeType!==1) continue; if(matches(c,sel,this)) out.push(c); walk(c); } }; walk(this); return out; }
    querySelector(sel){ return this.querySelectorAll(sel)[0]||null; } getElementsByTagName(t){ return this.querySelectorAll(t); } getElementsByClassName(c){ return this.querySelectorAll('.'+c); }
    cloneNode(){ const e=new El(this.tagName); e.className=this.className; return e; } get isConnected(){ for(let x=this;x;x=x.parentNode) if(x._isDoc) return true; return false; } }
  const mkEv=(type,target)=>({type,target,currentTarget:target,preventDefault(){},stopPropagation(){},stopImmediatePropagation(){},clientX:0,clientY:0,touches:[],changedTouches:[],button:0,key:''});
  const CANVAS0=new El('canvas'); CANVAS0.width=224; CANVAS0.height=160;
  const CTX=new Proxy({},{get:(t,k)=>{ if(k in t) return t[k]; if(k==='canvas') return CANVAS0; if(k==='measureText') return ()=>({width:10}); if(k==='getImageData'||k==='createImageData') return (x,y,w,h)=>({data:new Uint8ClampedArray(Math.max(4,(w|0)*(h|0)*4)),width:w|0,height:h|0}); if(k==='createLinearGradient'||k==='createRadialGradient'||k==='createPattern') return ()=>({addColorStop(){}}); return ()=>{}; },set:(t,k,v)=>{ t[k]=v; return true; }});
  /* 選擇器：tag、#id、.class、[attr]、[attr="v"]、子孫（空白）、逗號 */
  const selCache=new Map();
  function parseSel(sel){ if(selCache.has(sel)) return selCache.get(sel); const groups=sel.split(',').map(g=>g.trim()).filter(Boolean).map(g=>g.split(/\s+/).map(part=>{ const c={tag:null,id:null,cls:[],attrs:[]}; const re=/([a-zA-Z][\w-]*)|#([\w-]+)|\.([\w-]+)|\[([\w-]+)(?:([*^$]?=)"?([^"\]]*)"?)?\]|(:[\w-]+(?:\([^)]*\))?)/g; let m; while((m=re.exec(part))){ if(m[1]) c.tag=m[1].toUpperCase(); else if(m[2]) c.id=m[2]; else if(m[3]) c.cls.push(m[3]); else if(m[4]) c.attrs.push([m[4],m[5]||null,m[6]]); } return c; })); selCache.set(sel,groups); return groups; }
  function attrOf(el,k){ if(k==='id') return el._id||null; if(k==='class') return el.className; if(k.startsWith('data-')){ const v=el.dataset[camel(k.slice(5))]; return v===undefined?null:v; } return k in el.attrs?el.attrs[k]:null; }
  function cmatch(el,c){ if(c.tag&&el.tagName!==c.tag) return false; if(c.id&&el._id!==c.id) return false; for(const k of c.cls) if(!el.classList.contains(k)) return false;
    for(const [k,op,v] of c.attrs){ const a=attrOf(el,k); if(a==null) return false; if(op==='='&&a!==v) return false; if(op==='*='&&!a.includes(v)) return false; if(op==='^='&&!a.startsWith(v)) return false; if(op==='$='&&!a.endsWith(v)) return false; } return true; }
  function matches(el,sel,root){ for(const chain of parseSel(sel)){ if(!cmatch(el,chain[chain.length-1])) continue; let i=chain.length-2, x=el.parentNode; while(i>=0&&x&&x!==root&&x.nodeType===1){ if(cmatch(x,chain[i])) i--; x=x.parentNode; } if(i<0) return true; } return false; }
  function parseHTML(html,root){ const st=[root]; const re=/<!--[\s\S]*?-->|<\/([a-zA-Z][\w-]*)\s*>|<([a-zA-Z][\w-]*)((?:[^>"']|"[^"]*"|'[^']*')*)>|([^<]+)|</g; let m;
    while((m=re.exec(html))){ const cur=st[st.length-1];
      if(m[1]){ const t=m[1].toUpperCase(); for(let i=st.length-1;i>0;i--) if(st[i].tagName===t){ st.length=i; break; } continue; }
      if(m[2]){ const el=new El(m[2]); const ar=/([^\s=\/]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g; let a; const s=m[3]||''; while((a=ar.exec(s))){ if(a[1]==='/') continue; el.setAttribute(a[1],dec(a[2]!=null?a[2]:a[3]!=null?a[3]:a[4]!=null?a[4]:'')); }
        if(el.attrs.checked!=null) el.checked=true; cur.appendChild(el); if(!VOID.has(m[2].toLowerCase())&&!/\/\s*$/.test(s)){ if(/^(script|style|textarea)$/i.test(m[2])){ const end=html.toLowerCase().indexOf('</'+m[2].toLowerCase(),re.lastIndex); if(end>=0){ el.childNodes=[new Txt(html.slice(re.lastIndex,end))]; re.lastIndex=end; } } st.push(el); } continue; }
      if(m[4]!=null){ const t=new Txt(dec(m[4])); t.parentNode=cur; cur.childNodes.push(t); } } }
  const idxHtml=fs.readFileSync(path.join(o.root,'index.html'),'utf8');
  const bodyHtml=(()=>{ const b=idxHtml.indexOf('<body'), e=idxHtml.lastIndexOf('</body>'); return idxHtml.slice(idxHtml.indexOf('>',b)+1,e>0?e:undefined).replace(/<script[\s\S]*?<\/script>/gi,''); })();
  function makeDom(){ const dom={idMap:new Map()}; CUR_DOM=dom; const DOCx=new El('#document'); DOCx._isDoc=true; const HTML=new El('html'); DOCx.appendChild(HTML); const HEAD=new El('head'), BODY=new El('body'); HTML.appendChild(HEAD); HTML.appendChild(BODY);
    parseHTML(bodyHtml,BODY); const getByIdx=id=>{ const el=dom.idMap.get(String(id)); return el&&el.isConnected?el:null; };
    const documentObj={nodeType:9,body:BODY,head:HEAD,documentElement:HTML,hidden:false,visibilityState:'visible',readyState:'complete',fonts:{ready:Promise.resolve(),load:()=>Promise.resolve()},
      getElementById:getByIdx,querySelector:s=>DOCx.querySelector(s),querySelectorAll:s=>DOCx.querySelectorAll(s),createElement:t=>{ const k=CUR_DOM; CUR_DOM=dom; try{ return new El(t); } finally { CUR_DOM=k; } },createElementNS:(ns,t)=>documentObj.createElement(t),createTextNode:t=>new Txt(t),createDocumentFragment:()=>new El('#fragment'),
      addEventListener(t,f){ (DOCx.listeners[t]=DOCx.listeners[t]||[]).push(f); },removeEventListener(){},dispatchEvent(){ return true; },activeElement:null,elementFromPoint:()=>null,exitFullscreen:()=>Promise.resolve(),fullscreenElement:null,
      get cookie(){ return ''; },set cookie(v){} };
    return {DOC:DOCx,BODY,documentObj,getById:getByIdx,dom}; }
  const store=()=>{ const m=new Map(); return {getItem:k=>m.has(String(k))?m.get(String(k)):null,setItem:(k,v)=>{ m.set(String(k),String(v)); },removeItem:k=>{ m.delete(String(k)); },clear:()=>m.clear(),key:i=>[...m.keys()][i]||null,get length(){ return m.size; },_m:m}; };
  const LS=store();   // localStorage：重新整理頁面照樣留著（自動存檔在這裡）

  /* ---------- 假的 THREE：什麼都接受（區域、模型的 build 照跑），向量是真的算 ---------- */
  class Vector3{ constructor(x,y,z){ this.x=+x||0; this.y=+y||0; this.z=+z||0; this.isVector3=true; } set(x,y,z){ this.x=+x||0; this.y=+y||0; this.z=+z||0; return this; } setScalar(s){ this.x=this.y=this.z=s; return this; }
    copy(v){ this.x=+v.x||0; this.y=+v.y||0; this.z=+v.z||0; return this; } clone(){ return new Vector3(this.x,this.y,this.z); } add(v){ this.x+=+v.x||0; this.y+=+v.y||0; this.z+=+v.z||0; return this; } sub(v){ this.x-=+v.x||0; this.y-=+v.y||0; this.z-=+v.z||0; return this; }
    addVectors(a,b){ return this.set(a.x+b.x,a.y+b.y,a.z+b.z); } subVectors(a,b){ return this.set(a.x-b.x,a.y-b.y,a.z-b.z); } multiplyScalar(s){ this.x*=s; this.y*=s; this.z*=s; return this; } divideScalar(s){ return this.multiplyScalar(1/(s||1)); }
    addScaledVector(v,s){ this.x+=v.x*s; this.y+=v.y*s; this.z+=v.z*s; return this; } length(){ return Math.hypot(this.x,this.y,this.z); } lengthSq(){ return this.x*this.x+this.y*this.y+this.z*this.z; }
    normalize(){ const l=this.length()||1; return this.multiplyScalar(1/l); } negate(){ this.x=-this.x; this.y=-this.y; this.z=-this.z; return this; } distanceTo(v){ return Math.hypot(this.x-v.x,this.y-v.y,this.z-v.z); } distanceToSquared(v){ const d=this.distanceTo(v); return d*d; }
    lerp(v,t){ this.x+=(v.x-this.x)*t; this.y+=(v.y-this.y)*t; this.z+=(v.z-this.z)*t; return this; } lerpVectors(a,b,t){ return this.copy(a).lerp(b,t); } dot(v){ return this.x*v.x+this.y*v.y+this.z*v.z; }
    cross(v){ const x=this.y*v.z-this.z*v.y, y=this.z*v.x-this.x*v.z, z=this.x*v.y-this.y*v.x; return this.set(x,y,z); } crossVectors(a,b){ return this.copy(a).cross(b); } equals(v){ return v.x===this.x&&v.y===this.y&&v.z===this.z; }
    applyAxisAngle(ax,a){ if(ax&&ax.y){ const c=Math.cos(a), s=Math.sin(a); const x=this.x*c+this.z*s, z=-this.x*s+this.z*c; this.x=x; this.z=z; } return this; } applyMatrix4(){ return this; } applyQuaternion(){ return this; } applyEuler(){ return this; } project(){ return this; } unproject(){ return this; }
    setFromMatrixPosition(){ return this; } toArray(){ return [this.x,this.y,this.z]; } fromArray(a,o){ o=o||0; return this.set(a[o],a[o+1],a[o+2]); } min(v){ this.x=Math.min(this.x,v.x); this.y=Math.min(this.y,v.y); this.z=Math.min(this.z,v.z); return this; } max(v){ this.x=Math.max(this.x,v.x); this.y=Math.max(this.y,v.y); this.z=Math.max(this.z,v.z); return this; }
    angleTo(v){ const d=this.length()*v.length(); return d?Math.acos(Math.max(-1,Math.min(1,this.dot(v)/d))):0; } setLength(l){ return this.normalize().multiplyScalar(l); } floor(){ this.x=Math.floor(this.x); this.y=Math.floor(this.y); this.z=Math.floor(this.z); return this; } }
  class Vector2{ constructor(x,y){ this.x=+x||0; this.y=+y||0; } set(x,y){ this.x=x; this.y=y; return this; } copy(v){ this.x=v.x; this.y=v.y; return this; } clone(){ return new Vector2(this.x,this.y); } length(){ return Math.hypot(this.x,this.y); } lengthSq(){ return this.x*this.x+this.y*this.y; } normalize(){ const l=this.length()||1; this.x/=l; this.y/=l; return this; } multiplyScalar(s){ this.x*=s; this.y*=s; return this; } add(v){ this.x+=v.x; this.y+=v.y; return this; } sub(v){ this.x-=v.x; this.y-=v.y; return this; } distanceTo(v){ return Math.hypot(this.x-v.x,this.y-v.y); } }
  class Euler{ constructor(x,y,z){ this.x=+x||0; this.y=+y||0; this.z=+z||0; } set(x,y,z){ this.x=x; this.y=y; this.z=z; return this; } copy(e){ this.x=e.x; this.y=e.y; this.z=e.z; return this; } clone(){ return new Euler(this.x,this.y,this.z); } }
  /* 什麼都接受的假物件：讀任何屬性都得到另一個假物件（同一個物件讀同一個名字＝同一個），呼叫、new 都得到新的假物件，轉成數字是 0 */
  const TOP=()=>0, NOIT=function*(){};
  const DH={get(t,k){ if(typeof k==='symbol') return k===Symbol.toPrimitive?TOP:(k===Symbol.iterator?NOIT:undefined); if(k==='then'||k==='toJSON'||k==='nodeType'||k==='isConnected') return undefined; if(k==='length') return 0;
      const c=t.c; const v=c.get(k); if(v!==undefined) return v; const n=deep(); c.set(k,n); return n; }, apply(){ return deep(); }, construct(){ return deep(); }, set(t,k,v){ t.c.set(k,v); return true; }, has(){ return true; }};
  function deep(){ const f=function(){}; f.c=new Map(); return new Proxy(f,DH); }
  /* 人物、玩家的 3D 物件：只有位置、方向、子物件（CHAR.build 的替身）；預設帶一副假的 VRM 骨架（羽球片段掛球拍用），--procedural＝沒有骨架（同遊戲設定「使用正式人物模型」關掉的程序化人物）*/
  class FakeObj{ constructor(bone){ this.position=new Vector3(); this.rotation=new Euler(); this.scale=new Vector3(1,1,1); this.userData={}; this.children=[]; this.visible=true; this.parent=null; this.isObject3D=true; this.quaternion=deep('quat'); this.matrixWorld=deep('mw'); this.matrixAutoUpdate=true;
      if(!bone&&!o.procedural){ const bones={}; const me=this; this.userData.vrm={humanoid:{getRawBoneNode:n=>bones[n]||(bones[n]=(()=>{ const b=new FakeObj(true); b.name=n; me.add(b); return b; })()),getNormalizedBoneNode:n=>this.userData.vrm.humanoid.getRawBoneNode(n)},scene:this,expressionManager:null,lookAt:null}; } }
    add(...c){ for(const x of c){ if(x&&typeof x==='object'){ try{ x.parent=this; }catch(e){} this.children.push(x); } } return this; } remove(...c){ for(const x of c){ const i=this.children.indexOf(x); if(i>=0) this.children.splice(i,1); } return this; }
    traverse(f){ f(this); for(const c of this.children){ if(c instanceof FakeObj) c.traverse(f); } } getObjectByName(){ return null; } lookAt(){} updateMatrixWorld(){} updateWorldMatrix(){} updateMatrix(){} getWorldPosition(v){ return (v||new Vector3()).copy(this.position); } getWorldScale(v){ return (v||new Vector3()).set(1,1,1); } getWorldDirection(v){ return (v||new Vector3()).set(Math.sin(this.rotation.y),0,Math.cos(this.rotation.y)); }
    clone(){ const c=new FakeObj(true); c.position.copy(this.position); c.rotation.copy(this.rotation); return c; } removeFromParent(){ return this; } }
  const THREE=deep('THREE'); THREE.Vector3=Vector3; THREE.Vector2=Vector2; THREE.Euler=Euler; THREE.MathUtils={clamp:(v,a,b)=>Math.max(a,Math.min(b,v)),lerp:(a,b,t)=>a+(b-a)*t,degToRad:d=>d*Math.PI/180,radToDeg:r=>r*180/Math.PI,smoothstep:(x,a,b)=>{ const t=Math.max(0,Math.min(1,(x-a)/(b-a))); return t*t*(3-2*t); },euclideanModulo:(n,m)=>((n%m)+m)%m,generateUUID:()=>'u'+(++VC.seq)};
  const THREE_JSM=deep('THREE_JSM'), THREE_VRM=deep('THREE_VRM');

  /* ---------- 遊戲的 script（照 index.html 的順序；先編譯一次，每次「開頁面」在新的 context 裡跑）---------- */
  const files=[...idxHtml.matchAll(/<script[^>]*src="(src\/[^"?]+)/g)].map(m=>m[1]);
  const compiled=[], loadFail=[]; let g3src='';
  const EXPORT='\n  GM.__T={ get E(){ return E; }, get G(){ return G; }, validate:typeof validate==="function"?validate:null, migrate:typeof migrate==="function"?migrate:null, defaults:typeof defaults==="function"?defaults:null,'+
    ' frame:typeof frame==="function"?frame:null, get phoneOpen(){ return typeof phoneOpen!=="undefined"?phoneOpen:false; }, get menuOpen(){ return typeof menuOpen!=="undefined"?menuOpen:false; },'+
    ' get chooseCur(){ return typeof chooseCur!=="undefined"?chooseCur:undefined; }, get sayStack(){ return typeof sayStack!=="undefined"?sayStack:null; }, get walks(){ return typeof walks!=="undefined"?walks:null; },'+
    ' loadFrom:typeof loadFrom==="function"?loadFrom:null, KEY_AUTO:typeof KEY_AUTO!=="undefined"?KEY_AUTO:null };\n  return GM;\n})();\n';
  for(const f of files){ const p=path.join(o.root,f); if(!fs.existsSync(p)){ loadFail.push([f,'不存在']); continue; }
    let src=fs.readFileSync(p,'utf8'); src=src.replace(/^(const|let) (\w+)\s*=/mg,(m,k,n)=>'globalThis.'+n+'=');
    if(/(^|\/)game3d\.js$/.test(f)){ g3src=src; const tail=/\n\s*return GM;\s*\n\}\)\(\);\s*$/; if(!tail.test(src)) loadFail.push([f,'找不到 GAME IIFE 結尾的「return GM; })();」，無法加測試出口']); src=src.replace(tail,EXPORT); }
    try{ compiled.push([f,new vm.Script(src,{filename:f})]); }catch(e){ loadFail.push([f,'語法錯誤：'+String(e&&e.message||e).slice(0,200)]); } }
  if(loadFail.length) for(const [f,e] of loadFail) fail('LOAD','TEST_BUG','照 index.html 載入時失敗（檔案不在或語法錯）',f+'：'+e);
  const SAY_STACK=/sayStack/.test(g3src), CHOOSE_STACK=/chooseStack/.test(g3src);
  const srcOf=f=>{ try{ return fs.readFileSync(path.join(o.root,f),'utf8'); }catch(e){ return ''; } };
  FEAT.forcingPersist=!/_forcing/.test(g3src);   /* game3d.js（migrate／applySave）沒有處理 _forcing＝讀檔不會清掉 */
  FEAT.sayStack=SAY_STACK; FEAT.invArriveLock=/S\.arriveDue/.test(srcOf('src/invites3d.js')); FEAT.procedural=!!o.procedural;
  const pageFail=new Set();

  /* ---------- 開一個頁面：新的 context、DOM、假引擎，跑全部 script ---------- */
  function newPage(){ const pg={id:++R.pages,dead:false,rafQ:[]};
    const dm=makeDom(); pg.DOC=dm.DOC; pg.getById=dm.getById;
    class FakeImage extends El{ constructor(){ super('img'); this.complete=false; this.naturalWidth=0; } set src(v){ this._src=v; vSetTimeout(pg,()=>{ if(this.onerror) this.onerror(mkEv('error',this)); },0,[]); } get src(){ return this._src||''; } decode(){ return Promise.reject(new Error('NO_NET')); } }
    const sb={document:dm.documentObj,navigator:{userAgent:'Mozilla/5.0 (node random_play_sim)',maxTouchPoints:0,vibrate(){ return false; },onLine:true,language:'zh-TW',hardwareConcurrency:4,deviceMemory:4,storage:{estimate:()=>Promise.resolve({usage:0,quota:1e9}),persist:()=>Promise.resolve(false)}},
      location:{search:'',href:'http://localhost/index.html',hash:'',pathname:'/index.html',origin:'http://localhost',host:'localhost',protocol:'http:',reload(){} },history:{replaceState(){},pushState(){}},
      localStorage:LS,sessionStorage:store(),innerWidth:844,innerHeight:390,devicePixelRatio:2,screen:{width:844,height:390,orientation:{type:'landscape-primary',angle:90,addEventListener(){}}},
      addEventListener(){},removeEventListener(){},dispatchEvent(){ return true; },matchMedia:()=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}}),getComputedStyle:()=>({getPropertyValue:()=>'',display:'block'}),
      Image:FakeImage,HTMLElement:El,HTMLCanvasElement:El,Element:El,Node:El,Event:class{ constructor(t){ this.type=t; } },CustomEvent:class{ constructor(t,o){ this.type=t; this.detail=o&&o.detail; } },
      ResizeObserver:class{ observe(){} unobserve(){} disconnect(){} },MutationObserver:class{ observe(){} disconnect(){} takeRecords(){ return []; } },IntersectionObserver:class{ observe(){} disconnect(){} },
      fetch:()=>Promise.reject(new Error('NO_NET（random_play_sim 不下載素材）')),alert(){},confirm:()=>true,prompt:()=>null,open:()=>null,scrollTo(){},focus(){},
      setTimeout:(fn,ms,...a)=>vSetTimeout(pg,fn,ms,a),setInterval:(fn,ms,...a)=>vSetInterval(pg,fn,ms,a),clearTimeout:vClear,clearInterval:vClear,requestAnimationFrame:cb=>{ pg.rafQ.push(cb); return pg.rafQ.length; },cancelAnimationFrame:()=>{},
      queueMicrotask,structuredClone,URL,URLSearchParams,Blob,TextEncoder,TextDecoder,AbortController,btoa,atob,Date:VDate,performance:PERF,console:CON,
      THREE,THREE_JSM,THREE_VRM,P3:{CAST:{}},__rand:()=>rngGame()};
    const ctx=vm.createContext(sb); vm.runInContext('globalThis.window=globalThis; globalThis.self=globalThis; Math.random=globalThis.__rand; delete globalThis.__rand;',ctx);
    for(const [f,sc] of compiled){ try{ sc.runInContext(ctx); }catch(e){ const k=f+'：'+String(e&&e.message||e).slice(0,200); if(!pageFail.has(k)){ pageFail.add(k); fail('LOAD','TEST_BUG','照 index.html 載入時丟例外（假的 THREE／DOM 不夠）',k); } } }
    pg.ctx=ctx;
    if(!ctx.GAME||!ctx.GAME.__T){ fail('LOAD','TEST_BUG','game3d.js 沒有載進來／沒有測試出口','GAME 不存在'); return pg; }
    /* 載入後的替身：人物模型、素材下載、音效、3D 小工具 */
    const C=ctx;
    if(C.CHAR){ C.CHAR.build=()=>{ const ob=new FakeObj(); ob.userData.driver=null; return ob; }; C.CHAR.headY=()=>1.55; C.CHAR.setExpr=()=>{}; C.CHAR.release=()=>{}; C.CHAR.useModels=false; }
    if(C.ASSETS){ C.ASSETS.ensure=async()=>{}; C.ASSETS.manifest={}; C.ASSETS.bytes={done:0,total:0}; C.ASSETS.errors=[]; C.ASSETS.reqStart=()=>{}; C.ASSETS.reqTake=()=>[]; C.ASSETS.waitLoaded=async()=>({ms:0,missing:[]}); }
    if(C.A3){ for(const k of Object.keys(C.A3)) if(typeof C.A3[k]==='function') C.A3[k]=()=>{}; }
    if(C.Z3){ C.Z3.prewarm=async()=>{}; C.Z3.warmup=()=>{}; }
    if(C.W3){ C.W3.releaseViews=()=>{}; }
    C.GAME.upgradeModels=()=>{};
    /* 效能：行事曆（data/calendar.js）的查詢只看日期、結果固定，記下來（回傳複本，呼叫的地方改了也不影響下一次）*/
    if(C.CALENDAR){ const K=C.CALENDAR; for(const fn of ['dateOf','termOf','holiday','typhoon','fest','mark','kind','weekend','termOfDelayed']){ const f0=K[fn]; if(typeof f0!=='function') continue; const m=new Map();
      K[fn]=function(day){ if(arguments.length!==1||typeof day!=='number') return f0.apply(K,arguments); const k=day|0; let v=m.get(k); if(v===undefined){ v=f0.call(K,day); m.set(k,v===undefined?null:v); } return v&&typeof v==='object'?Object.assign({},v):v; }; } }
    /* 假的 3D 引擎 E（E3.init 換成這個）*/
    const e0={frame:0,time:0,w:844,h:390,canvas:new El('canvas'),npcs:[],extras:[],interactables:[],colliders:[],seats:[],exits:[],lampGlows:[],roadMats:[],zone:null,levels:null,nav:null,indoor:false,hour:12,weather:'clear',paused:false,lampsOn:false,
      q:{level:'medium',far:200,shadows:false,pr:1,forcePR:null},input:{joy:{x:0,y:0,active:false},runToggle:false,keys:{}},prefNpc:null,spawnHint:null,lastSpawn:null,
      cam:{mode:'follow',yaw:0,pitch:0.22,pitchAdd:0,distTarget:6,target:new Vector3(),blend:null,ctl:false,swingAcc:0,dragging:false,manualT:0,seeThru:false,look:new Vector3(),cine:null},
      camera:{position:new Vector3(0,2,5),quaternion:deep('q'),projectionMatrix:deep('pm'),matrixWorldInverse:deep('mwi'),lookAt(){},updateProjectionMatrix(){},fov:55,aspect:2},
      renderer:{info:{render:{calls:0,triangles:0},memory:{geometries:0,textures:0}},capabilities:{getMaxAnisotropy:()=>1},localClippingEnabled:false,domElement:new El('canvas'),setPixelRatio(){},setSize(){},render(){},compile(){},dispose(){}},
      scene:{add(){},remove(){},traverse(){},getObjectByName:()=>null,getObjectById:()=>null,children:[]},player:null,sky:null,skyline:null,sun:deep('sun'),hemi:deep('hemi'),fill:deep('fill'),rain:null,toneK:1,
      setPlayer(obj){ this.player={obj,speed:0,path:null,target:null,pose:'idle',run:false,busy:false,radius:0.32,lv:0}; },
      loadZone(def,spawn){ const E=this; E.npcs=[]; E.extras=[]; E.colliders=[]; E.interactables=[]; E.lampGlows=[]; E.seats=[]; E.exits=[]; E.spawnHint=spawn||null;
        const tb=realMs(); const z=def.build(E); const bms=realMs()-tb; R.buildMs=(R.buildMs||0)+bms; R.builds=(R.builds|0)+1; (R.bz||(R.bz={}))[def.id]=((R.bz[def.id]||[0,0])[0]+bms)+','+(((R.bz[def.id]||'0,0').split?+(R.bz[def.id]||'0,0').split(',')[1]:0)+1); z.def=def; E.zone=z; E.levels=z.levels||null; E.nav=z.nav||null; E.indoor=!!def.indoor; E.cam.distTarget=E.indoor?(def.camDist||3.8):(def.camDist||6);
        if(E.player){ const sp=spawn||z.spawn||{x:0,z:0,yaw:0}; E.player.lv=E.levels?Math.max(0,Math.min(E.levels.length-1,sp.lv|0)):0; E.player.obj.position.set(+sp.x||0,0,+sp.z||0); E.player.obj.rotation.y=+sp.yaw||0; E.player.path=null; E.player.target=null; E.lastSpawn={zone:def.id,x:sp.x,z:sp.z,lv:E.player.lv|0}; }
        return z; },
      addNPC(n){ n.path=null; n.speed=0; n.pose=n.pose||'idle'; n.radius=0.32; n.timer=0; n.lodPhase=this.npcs.length; n.lv=n.lv|0; if(n.seat&&n.seat.y!=null&&n.obj) n.obj.position.y=n.seat.y; this.npcs.push(n); return n; },
      removeNPC(n){ const i=this.npcs.indexOf(n); if(i>=0) this.npcs.splice(i,1); },
      addExtra(x){ this.extras.push(x); return x; },
      placeAt(ent,x,z,lv){ if(!ent||!ent.obj) return; ent.obj.position.x=+x||0; ent.obj.position.z=+z||0; if(lv!=null) ent.lv=lv|0; },
      moveTo(ent,x,z,onArrive,lv){ if(!ent) return false; ent.path=[[+x||0,+z||0]]; ent.onArrive=onArrive||null; ent._toLv=lv; return true; },
      pathTo:(x0,z0,l0,x1,z1)=>[[x1,z1]], canStand:()=>true, unstick:()=>false,
      navOf(lv){ const L=this.levels; return L?(L[lv|0]||L[0]):this.nav; },   /* 同 engine3d.js navOf：區域 build 建的導航格（真的 E3.NavGrid）*/
      heightAt(x,z,lv){ const n=this.navOf(lv===undefined?(this.player?this.player.lv|0:0):lv); try{ return n&&typeof n.heightAt==='function'?(+n.heightAt(x,z)||0):0; }catch(e){ return 0; } },
      setLv(ent,lv){ if(ent) ent.lv=lv|0; }, prePose(){}, recenter(){}, freeScore:()=>0, setQuality(){}, applyViewFar(){}, settleY(){},
      setWeather(w){ this.weather=w; }, applyTime(h){ this.hour=h; }, setLamps(on){ this.lampsOn=!!on; }, endCinematic(){ this.cam.mode='follow'; this.cam.cine=null; }, cinematic(){ this.cam.mode='cine'; }, snapCinematic(){}, tapRedirect:null, rideMode(){}, render(){}, renderSkip:null,
      /* 每一格：照路徑直線走（走路 1.4 m/s、跑 3.4 m/s），到了叫 onArrive；跟著走的人站到玩家旁邊；區域自己的 update（電梯、門）照跑 */
      update(dt){ const E=this; E.frame++; E.time+=dt; const Pl=E.player; const step=ent=>{ if(!ent||!ent.path||!ent.path.length||ent.frozen) return; const [tx,tz]=ent.path[0]; const p=ent.obj.position; const dx=tx-p.x, dz=tz-p.z, d=Math.hypot(dx,dz); const sp=(ent.run?3.4:(ent.walkSpeed||1.4))*dt;
          if(d<=sp||d<0.05){ p.x=tx; p.z=tz; ent.path.shift(); if(!ent.path.length){ ent.path=null; if(ent._toLv!=null){ ent.lv=ent._toLv|0; ent._toLv=null; } if(ent.pose==='walk'||ent.pose==='run') ent.pose=ent.idlePose||'idle'; const cb=ent.onArrive; ent.onArrive=null; if(cb){ try{ cb(); }catch(e){ onExc(e,'走到了（onArrive）'); } } } }
          else { p.x+=dx/d*sp; p.z+=dz/d*sp; if(ent.obj.rotation) ent.obj.rotation.y=Math.atan2(dx,dz); if(ent.pose!=='sit') ent.pose=ent.run?'run':'walk'; } };
        if(E.zone&&typeof E.zone.update==='function'){ try{ E.zone.update(dt,E); }catch(e){ onExc(e,'區域的 update（電梯、門的動畫）'); } }
        step(Pl); for(const n of E.npcs.slice()){ if(n.beh==='follow'&&Pl&&!n.path&&!n.seat&&n.obj){ const pp=Pl.obj.position, q=n.obj.position, d=Math.hypot(pp.x-q.x,pp.z-q.z); const off=n.followOff||1.2; if(d>off+0.3){ q.x=pp.x-(pp.x-q.x)/d*off; q.z=pp.z-(pp.z-q.z)/d*off; n.lv=Pl.lv|0; } } step(n); } },
      /* 互動鍵：遊戲引擎的判斷（engine3d.js nearestInteractable）的簡化版——範圍內最近的互動點；人（有 talk）在 2.2 m 內 */
      nearestInteractable(){ const E=this, Pl=E.player; if(!Pl) return null; const px=Pl.obj.position.x, pz=Pl.obj.position.z, plv=Pl.lv|0; let best=null, bd=1e9; const occupied=st=>E.npcs.some(n=>n.seat&&Math.hypot(n.seat.x-st.x,n.seat.z-st.z)<0.35);
        for(const it of E.interactables){ if(it.hidden) continue; if(it.seat&&(occupied(it.seat)||it.seat.taken)) continue; if(E.levels&&it.lv!==undefined&&(it.lv|0)!==plv) continue; const d=Math.hypot((+it.x||0)-px,(+it.z||0)-pz); if(d<(it.radius||1.8)&&d-(it.prio||0)<bd){ bd=d-(it.prio||0); best=it; } }
        if(E.__want&&E.__want.it&&E.interactables.includes(E.__want.it)&&!E.__want.it.hidden){ const it=E.__want.it; const d=Math.hypot((+it.x||0)-px,(+it.z||0)-pz); if(d<(it.radius||1.8)) best=it; }
        for(const n of E.npcs){ if(!n.talk||n.hidden||!n.obj) continue; const d=Math.hypot(n.obj.position.x-px,n.obj.position.z-pz); const bias=(!best||best.seat?0.5:0)+(E.__want&&E.__want.npc===n?9:0); if(d<2.2&&d-bias<bd){ bd=d-bias; best={npc:n,label:n.talkLabel||('和'+n.name+'說話'),x:n.obj.position.x,z:n.obj.position.z,onInteract:()=>n.talk(n)}; } }
        return best; } };
    pg.E0=e0; pg.E=new Proxy(e0,{get:(t,k)=>{ if(k in t) return t[k]; if(typeof k==='string'&&k!=='then'&&k!=='toJSON'&&!k.startsWith('__')){ missing.set(k,(missing.get(k)||0)+1); } return undefined; }});
    if(C.E3) C.E3.init=()=>pg.E; else C.E3={init:()=>pg.E};
    pg.GM=C.GAME; return pg; }

  /* 跑到 Promise 結束（每一格照樣跑主迴圈）*/
  async function pump(p,maxMs,label){ let done=false, val, err; p.then(v=>{ done=true; val=v; },e=>{ done=true; err=e; }); const t0v=VC.now; while(!done){ await vAdvance(100); runRaf(); await flush(); if(VC.now-t0v>maxMs){ fail('STUCK','UNKNOWN',label+' 超過 '+(maxMs/1000)+' 秒（虛擬時間）沒有結束',label); return undefined; } } if(err) throw err; return val; }
  function runRaf(){ if(!P) return; const q=P.rafQ; P.rafQ=[]; for(const cb of q){ try{ cb(VC.now); }catch(e){ onExc(e,'主迴圈（requestAnimationFrame）'); } } }
  const $text=id=>{ const el=getById(id); return el?el.textContent:''; };
  /* 開機（GAME.boot，和瀏覽器一樣）*/
  async function boot(){ if(P){ P.dead=true; P.rafQ=[]; } const pg=newPage(); bindPage(pg); if(!GM) return false;
    try{ await pump(Promise.resolve().then(()=>GM.boot()),60000,'GAME.boot'); }catch(e){ onExc(e,'GAME.boot'); }
    if(!GM.E||!GM.G){ fail('BOOT','TEST_BUG','開機沒有完成（GM.E 或 GM.G 是空的）',$text('loadMsg')); return false; }
    if(/載入失敗/.test($text('loadMsg'))) fail('BOOT','TEST_BUG','GAME.boot 丟例外（畫面寫載入失敗）',$text('loadMsg'));
    GM.charsMain=true; GM.charsAll=true; GM.charsMainP=Promise.resolve(); GM.charsAllP=Promise.resolve(); return true; }

  R.phase='boot'; if(!await boot()) return finish();
  const dayOfKey=k=>{ if(W.STORY&&W.STORY.dayOfKey) return W.STORY.dayOfKey(k); const t=RealDate.UTC(...k.split('-').map((x,i)=>i===1?x-1:+x)); return Math.round((t-RealDate.UTC(2025,8,17))/864e5)+1; };
  const D_FROM=dayOfKey(o.from), D_TO=dayOfKey(o.to);
  /* ---------- 開新遊戲：按標題畫面的按鈕 ---------- */
  let ngDone=false;
  if(o.startSave){   /* --start-save：把存檔放進自動存檔 → 標題「繼續」（玩家讀檔接著玩的同一條路）*/
    let sv; try{ sv=JSON.parse(fs.readFileSync(o.startSave,'utf8')); }catch(e){ fail('BOOT','TEST_BUG','--start-save 讀不到或不是 JSON',String(e)); return finish(); }
    LS.setItem((T&&T.KEY_AUTO)||'fatiao3d_auto',JSON.stringify(sv)); act('讀存檔 '+path.basename(o.startSave)+'（'+dayKey(sv.day)+' '+fmtH(sv.hour)+' '+sv.zone+'）→ 標題「繼續」');
    const bc=getById('btnContinue'); if(!bc||typeof bc.onclick!=='function'){ fail('BOOT','TEST_BUG','標題畫面的「繼續」沒有掛 onclick',''); return finish(); }
    Promise.resolve().then(()=>bc.onclick(mkEv('click',bc))).then(()=>{ ngDone=true; },e=>{ ngDone=true; onExc(e,'標題「繼續」（--start-save）'); }); }
  else { act('按標題畫面「'+(o.track==='econ'?'從舊序章系所開始':'從法律系開始')+'」');
  const btn=getById(o.track==='econ'?'btnNew':'btnNewLaw'); if(!btn||typeof btn.onclick!=='function'){ fail('BOOT','TEST_BUG','標題畫面的按鈕沒有掛 onclick（bindUI 沒跑？）',o.track); return finish(); }
  Promise.resolve().then(()=>btn.onclick(mkEv('click',btn))).then(()=>{ ngDone=true; },e=>{ ngDone=true; onExc(e,'開新遊戲（STORY.newGame）'); }); }
  let track=null;   // 時間只往前：{abs}（開局演完才開始；讀檔重設）

  /* ---------- 玩家的「個性」（每個種子不一樣）---------- */
  const persona={classP:0.35+rnd()*0.6,lateP:rnd()*0.5,phoneP:0.15+rnd()*0.25,talkP:0.2+rnd()*0.3,reloadP:rnd()<0.5?0.0004:0.002,snapP:0.0025,midReloadP:rnd()<0.5?0.0002:0.001};
  act('個性：上課 '+persona.classP.toFixed(2)+'、熬夜 '+persona.lateP.toFixed(2)+'、手機 '+persona.phoneP.toFixed(2)+'、說話 '+persona.talkP.toFixed(2));

  /* ---------- 每一格的檢查 ---------- */
  const DIMS=['fam','trust','aff','resp','comf','rom','npcRom'];
  let staleV=0, busyV=0, lastDay=null, lastToast=''; const goingAt=new Map(), goingFail=new Set(), goingSeen=new Set(); let lateV=0; const lateFail=new Set();
  function abs(g){ return g.day*24+(+g.hour); }
  let tracedG=null;
  function checkFrame(){ const g=GM.G; if(!g) return;
    if(process.env.RPS_TRACE_DAY&&g!==tracedG){ tracedG=g; let dv=g.day; Object.defineProperty(g,'day',{configurable:true,enumerable:true,get:()=>dv,set:v=>{ if(v!==dv) RC.log('[day] '+dv+' → '+v+' hour='+g.hour+'\n   '+String(new Error().stack).split('\n').slice(2,9).join('\n   ')); dv=v; }}); }
    if(track&&!R.loading){ const a=abs(g); if(a<track.abs-1e-6){ const d0=Math.floor(track.abs/24), h0=track.abs-d0*24; fail('TIME_BACK','UNKNOWN','遊戲時間倒退','從 '+dayKey(d0)+' '+fmtH(h0)+' 退到 '+dayKey(g.day)+' '+fmtH(g.hour)+'（'+(track.abs-a).toFixed(2)+' 小時；之前 G.day='+track.day+' G.hour='+(+track.hour).toFixed(2)+'）'); } track.abs=a; track.day=g.day; track.hour=+g.hour; }
    if(!Number.isFinite(g.money)) fail('MONEY_NAN','UNKNOWN','錢不是有限的數字','G.money='+g.money);
    if(!Number.isFinite(+g.hour)||!Number.isFinite(g.day)) fail('TIME_NAN','UNKNOWN','日期或時間不是數字','day='+g.day+' hour='+g.hour);
    { const te=getById('toast'); if(te){ const t=te.textContent||''; if(t&&t!==lastToast&&!te.classList.contains('hide')){ lastToast=t; act('（提示）'+t.slice(0,60)); } else if(!t) lastToast=''; } }
    /* ⑧ 卡住（同 game3d.js staleCheck：劇情鎖著、沒有對話、選項、事件、淡入淡出、日期卡、走路）*/
    const Pl=E.player; const busy=!!(Pl&&(Pl.busy||D.busyDepth>0)); const fe=getById('fade'), gc=getById('goConfirm');
    const live=D.active||!!T.chooseCur||(W.EVENTS&&!!W.EVENTS.running)||T.phoneOpen||T.menuOpen||(fe&&fe.classList.contains('on'))||(T.walks&&T.walks.size>0)||!!(Pl&&Pl.path&&Pl.path.length)||(W.STORY&&!!W.STORY._bedBusy)||(gc&&!gc.classList.contains('hide'));
    if(busy&&!live){ staleV+=0.1; if(staleV>30&&!R.stuckNow){ R.stuckNow=true; fail('STUCK','UNKNOWN','劇情鎖住、畫面上沒有對話或選項超過 30 秒（虛擬時間；game3d.js staleCheck 會說「畫面好像停住了」）','busyDepth='+D.busyDepth+' busy='+(Pl&&Pl.busy)+' by='+JSON.stringify(D.busyWho||[])+' ADV='+(W.ADV&&W.ADV.active)); } } else { staleV=0; }
    if(busy) busyV+=0.1; else busyV=0;
    if(busyV>1800&&!R.stuckNow){ R.stuckNow=true; fail('STUCK','UNKNOWN','劇情鎖住超過 30 分鐘（虛擬時間；一直有東西在演、玩家沒有對話或選項可以按）','by='+JSON.stringify(D.busyWho||[])+' EVENTS.running='+(W.EVENTS&&W.EVENTS.running)); }
    /* ⑨ 一起走過去（invites3d.js going）、人已經在約好的地方、玩家空下來 15 分鐘（遊戲時間）還沒開始見面＝她一直跟著（AN-MEAL-STUCK ②那一種）*/
    if(Array.isArray(g.invites)) for(const iv of g.invites) if(iv.state==='going') goingSeen.add(iv.id+'@'+iv.day);
    if(Array.isArray(g.invites)&&free()){ for(const iv of g.invites){ if(iv.state==='going'&&iv.zone===g.zone&&iv.day===g.day){ const k=iv.id+'@'+g.day; const tg=goingAt.get(k); if(tg==null){ goingAt.set(k,abs(g)); R.goingArrived=(R.goingArrived|0)+1; } else if(abs(g)-tg>0.25&&!goingFail.has(k)){ goingFail.add(k); fail('STUCK_INVITE','UNKNOWN','一起走過去的邀約已經到了約好的地方，玩家空下來 15 分鐘（遊戲時間）還停在 going：人一直跟著、見面沒開始',JSON.stringify({id:iv.id,who:iv.who,place:iv.place,zone:iv.zone,h:iv.h,state:iv.state})); } } } }
    /* ⑩ 過了 04:00 還空著到處走、沒有被送回去睡（story3d.js forceHome 在 02:30 以後、玩家空下來就會送回宿舍）*/
    if(g.hour>=28&&free()&&track){ lateV+=0.1; if(lateV>60&&!lateFail.has(g.day)){ lateFail.add(g.day); fail('NO_FORCEHOME','UNKNOWN','過了 04:00、玩家空下來 60 秒還沒被送回去睡（STORY.forceHome）','hour='+(+g.hour).toFixed(2)+' flags._forcing='+JSON.stringify(g.flags&&g.flags._forcing)); } } else lateV=0;
    if(g.day!==lastDay){ lastDay=g.day; R.reached=dayKey(g.day); heartbeat(true); checkDaily(); } }
  function checkDaily(){ const g=GM.G; if(!g) return;
    const so=g.social&&g.social.rel; if(so) for(const id in so){ const r=so[id]; for(const k of DIMS){ if(r[k]==null) continue; if(typeof r[k]!=='number'||!Number.isFinite(r[k])||r[k]<0||r[k]>100){ fail('REL_RANGE','UNKNOWN','關係值超出 0～100 或不是數字（social3d.js S.adjust 的範圍）',id+'.'+k+'='+r[k]); } } for(const k of ['seen','talked']) if(r[k]!=null&&!(Number.isFinite(r[k])&&r[k]>=0)) fail('REL_RANGE','UNKNOWN','關係的次數不是非負數',id+'.'+k+'='+r[k]); }
    if(g.rel) for(const id in g.rel){ const v=g.rel[id]; if(!(Number.isFinite(v)&&v>=0&&v<=100)) fail('REL_RANGE','UNKNOWN','舊版關係 G.rel 超出 0～100（game3d.js rel）',id+'='+v); }
    if(g.money<0) note('錢是負的（不算 FAIL，看要不要擋）','money='+g.money);
    /* ④ 只演一次的事件 */
    if(W.STORY_EVENTS&&g.events&&g.events.done){ for(const ev of W.STORY_EVENTS){ const n=g.events.done[ev.id]|0; if(!n) continue; if(ev.once&&n>1) fail('EVENT_REPEAT','UNKNOWN','once 的事件演了 '+n+' 次（events3d.js G.events.done）',ev.id); else if(ev.max_times&&n>ev.max_times) fail('EVENT_REPEAT','UNKNOWN','max_times '+ev.max_times+' 的事件演了 '+n+' 次',ev.id); } } }
  let hbT=realMs();
  function heartbeat(force){ const now=realMs(); if(!force&&now-hbT<3000) return; hbT=now; const g=GM&&GM.G;
    process.stdout.write('@@HB '+JSON.stringify({seed:o.seed,day:g&&dayKey(g.day),step:R.step,frame:R.frame})+'\n');
    if(o.out){ try{ fs.writeFileSync(path.join(o.out,'seed_'+o.seed+'.ring.json'),JSON.stringify({actions:R.actions,G:gSum(),step:R.step,frame:R.frame})); }catch(e){} } }

  /* ---------- ⑤ 存讀檔：GM.snapshot → JSON → validate → migrate → 比；再 applySave 讀回來 ---------- */
  const norm=s=>{ const c=JSON.parse(JSON.stringify(s)); delete c.pos; delete c.savedAt; delete c.v; delete c._busy; delete c._stuck; c.hour=+(+c.hour).toFixed(3); return c; };
  function diffs(a,b,p,out){ if(out.length>12) return out; if(a===b) return out; const ta=typeof a, tb=typeof b; if(ta!==tb||a===null||b===null||ta!=='object'){ if(!(ta==='number'&&tb==='number'&&Math.abs(a-b)<1e-9)) out.push(p+'：'+JSON.stringify(a)+' → '+JSON.stringify(b)); return out; }
    if(Array.isArray(a)!==Array.isArray(b)){ out.push(p+'：型別不同'); return out; } const ks=new Set([...Object.keys(a),...Object.keys(b)]); for(const k of ks) diffs(a[k],b[k],p+'.'+k,out); return out; }
  async function snapCheck(){ const g=GM.G; if(!g||!T.validate||!T.migrate){ if(!R.noVM){ R.noVM=true; fail('SAVE','TEST_BUG','抽不到 game3d.js 的 validate／migrate','validate='+typeof T.validate+' migrate='+typeof T.migrate); } return; }
    const before=norm(g); let s; try{ s=JSON.parse(JSON.stringify(GM.snapshot())); }catch(e){ onExc(e,'GM.snapshot'); return; }
    const err=T.validate(s); if(err){ fail('SAVE','UNKNOWN','validate 不接受剛存的檔',err); return; }
    let m; try{ m=T.migrate(JSON.parse(JSON.stringify(s))); if(GM.firstMetMigrate) m=GM.firstMetMigrate(m,s); }catch(e){ onExc(e,'migrate'); return; }
    const d0=diffs(before,norm(m),'G',[]).filter(x=>!/^G\.energy：/.test(x)); const add=d0.filter(x=>/：undefined → /.test(x)), d=d0.filter(x=>!/：undefined → /.test(x));
    for(const x of add) note('migrate 補了存檔裡沒有的欄位（不算 FAIL）：'+x.split('：')[0],x);   /* 補欄位＝migrate 本來就該做的；改掉、刪掉已經有的值才算 */
    if(d.length) fail('SAVE_DIFF','UNKNOWN','存檔 → validate → migrate 以後，已經有的值被改掉或刪掉（照理只會補缺的欄位）',d.join('\n'));
    act('存讀檔檢查：snapshot→validate→migrate'+(d.length?'（不一樣 '+d.length+' 處）':'一樣')+' → applySave 讀回');
    R.loading=true; try{ await pump(Promise.resolve().then(()=>GM.applySave(s)),60000,'applySave（讀回剛存的檔）'); }catch(e){ onExc(e,'applySave'); } R.loading=false;
    const g2=GM.G; const k=['day','zone','money','stage']; const dd=k.filter(x=>JSON.stringify(g2[x])!==JSON.stringify(before[x])); const dh=(+g2.hour)-before.hour; if(dh<-0.002||dh>0.25) dd.push('hour');   /* 讀檔的淡入淡出那幾秒時間照樣在走（主迴圈）：往前 15 分鐘以內不算 */
    if(dd.length) fail('LOAD_DIFF','UNKNOWN','applySave 讀回剛存的檔以後，'+dd.join('、')+' 變了',dd.map(x=>x+'：'+JSON.stringify(before[x])+' → '+JSON.stringify(g2[x])).join('；'));
    if(track) track={abs:abs(g2)}; }
  /* 讀自動存檔：page＝重新整理頁面（新的 context）→ 標題的「繼續」；否則＝遊戲裡的讀檔（loadFrom，劇情中會被擋）*/
  async function reloadAuto(page){ const raw=LS.getItem((T&&T.KEY_AUTO)||'fatiao3d_auto'); if(!raw){ act('讀自動存檔：沒有'); return; } let s; try{ s=JSON.parse(raw); }catch(e){ fail('SAVE','UNKNOWN','自動存檔不是 JSON',String(e)); return; }
    act((page?'重新整理頁面 → 標題「繼續」':'遊戲裡讀自動存檔')+'（'+dayKey(s.day)+' '+fmtH(s.hour)+' '+s.zone+'）');
    R.loading=true;
    try{ if(page){ if(await boot()){ const bc=getById('btnContinue'); if(!bc||typeof bc.onclick!=='function') fail('BOOT','TEST_BUG','標題畫面的「繼續」沒有掛 onclick',''); else await pump(Promise.resolve().then(()=>bc.onclick(mkEv('click',bc))),60000,'標題「繼續」（loadFrom）'); } }
      else if(T.loadFrom) await pump(Promise.resolve().then(()=>T.loadFrom(s)),60000,'讀自動存檔（loadFrom）'); else await pump(Promise.resolve().then(()=>GM.applySave(s)),60000,'applySave'); }
    catch(e){ onExc(e,'讀自動存檔'); }
    R.loading=false; if(track&&GM.G) track={abs:abs(GM.G)}; R.stuckNow=false; staleV=0; busyV=0; noActV=0; want=null; wait=0; react=2; pendingPhoneClick=null; goingAt.clear(); }

  /* ---------- 情境 --old-forcing（BB-C T1_FIX ①：舊存檔帶著 _forcing=true）---------- */
  const SC={day:null,inj:false,injDay:null,calls:0,sent:0,res:null,log:[],inFH:null,saved:[],savedTrue:0};
  const SCEN=o.oldForcing||o.stayUp; const stayUp=()=>!!SCEN&&SC.inj&&!SC.res;
  async function scenTick(){ const g=GM.G; if(!g||!track||R.loading) return; if(SC.day==null) SC.day=dayOfKey(SCEN);
    if(W&&W.STORY&&!W.STORY.__ccFH&&typeof W.STORY.forceHome==='function'){ const orig=W.STORY.forceHome; W.STORY.forceHome=async function(gm){ const G0=gm&&gm.G; SC.calls++; const me={d0:G0&&G0.day,h0:G0&&+G0.hour,z0:G0&&G0.zone}; SC.inFH=me;
        try{ return await orig.apply(this,arguments); } finally{ if(SC.inFH===me) SC.inFH=null; try{ const raw=LS.getItem((T&&T.KEY_AUTO)||'fatiao3d_auto'), sv=raw&&JSON.parse(raw); const v=sv&&sv.flags&&('_forcing' in sv.flags)?sv.flags._forcing:'（沒有）'; SC.saved.push(v); if(v===true) SC.savedTrue++; }catch(e){} } };   /* 送回去睡、醒來那一下的自動存檔（同一格就讀，下一次 45 秒的自動存檔還沒蓋掉）*/   /* 換日在 sleepNow 裡面（forceHome 還沒 return）：scenTick 看到日期換了、這一次還在跑＝送回去睡了 */ W.STORY.__ccFH=true; }   /* 每次開頁面（新的 context）重新包一次 */
    if(!SC.inj&&o.stayUp&&!o.oldForcing){ if(g.day<SC.day||(+g.hour)<21||!free()) return; SC.inj=true; SC.injDay=g.day; act('【情境 --stay-up】'+dayKey(g.day)+' '+fmtH(g.hour)+' 起這一晚不睡，看凌晨被送回去睡以後的自動存檔'); return; }
    if(!SC.inj){ if(g.day<SC.day||(+g.hour)<21||!free()) return; SC.inj=true;
      try{ GM.autosave&&GM.autosave(true); }catch(e){ onExc(e,'情境：存自動存檔'); }
      const key=(T&&T.KEY_AUTO)||'fatiao3d_auto', raw=LS.getItem(key); if(!raw){ fail('SCEN','TEST_BUG','情境 --old-forcing：沒有自動存檔可以改',''); SC.res='skip'; return; }
      const sv=JSON.parse(raw); sv.flags=Object.assign({},sv.flags||{},{_forcing:true}); LS.setItem(key,JSON.stringify(sv));
      act('【情境 --old-forcing】自動存檔（'+dayKey(sv.day)+' '+fmtH(sv.hour)+' '+sv.zone+'）的旗標放進 _forcing=true → 重新整理頁面、按「繼續」；這一晚不睡');
      await reloadAuto(true); const G2=GM.G; SC.injDay=G2.day; SC.after=G2.flags&&('_forcing' in G2.flags)?G2.flags._forcing:'（沒有）'; act('【情境】讀進來以後 '+dayKey(G2.day)+' '+fmtH(G2.hour)+' G.flags._forcing='+JSON.stringify(SC.after)); return; }
    if(SC.res) return;
    if(SC.inFH&&!SC.inFH.counted&&g.day!==SC.inFH.d0){ SC.inFH.counted=true; SC.sent++; SC.log.push(dayKey(SC.inFH.d0)+' '+fmtH(SC.inFH.h0)+' '+SC.inFH.z0+' → '+dayKey(g.day)+' '+fmtH(g.hour)+' '+g.zone); }
    const done=g.day>SC.injDay&&!SC.inFH&&free(), over=g.day===SC.injDay&&(+g.hour)>=30;
    if(!done&&!over) return;
    const fl=g.flags&&('_forcing' in g.flags)?g.flags._forcing:'（沒有）', noFH=R.fails.some(f=>f.kind==='NO_FORCEHOME');
    const ok=o.oldForcing?(SC.sent>0&&!noFH&&fl==='（沒有）'):(SC.sent>0&&SC.savedTrue===0); SC.res=ok?'PASS':'FAIL';
    const msg=(o.oldForcing?'讀進 _forcing=true 的舊存檔以後':'這一晚不睡')+'：forceHome 叫了 '+SC.calls+' 次、真的送回去睡 '+SC.sent+' 次'+(SC.log.length?'（'+SC.log.join('；')+'）':'')+'；NO_FORCEHOME '+(noFH?'有':'沒有')+'；現在 '+dayKey(g.day)+' '+fmtH(g.hour)+' '+g.zone+'；G.flags._forcing='+JSON.stringify(fl)+'；送回去睡以後自動存檔裡的 _forcing '+JSON.stringify(SC.saved);
    if(ok){ act('【情境】PASS：'+msg); R.scenPass=msg; } else if(o.oldForcing) fail('OLD_FORCING','GAME_BUG','情境 --old-forcing：讀進 _forcing=true 的舊存檔，04:00 以後沒有照常送回去睡（或 _forcing 沒清掉）',msg); else fail('FORCING_SAVED','GAME_BUG','情境 --stay-up：凌晨被送回去睡以後，自動存檔裡帶著 _forcing=true（讀這份檔＝再也不會送回去睡）',msg); }

  /* ---------- 玩家：看畫面上有什麼可以按 ---------- */
  const vis=el=>{ for(let x=el;x&&!x._isDoc;x=x.parentNode){ if(x.classList&&x.classList.contains('hide')) return false; if(x.style&&x.style.display==='none') return false; } return !!el&&el.isConnected; };
  const clickables=root=>root?root.querySelectorAll('button,[data-ask],[data-ans],[data-go],[data-skip],[data-inv],[data-th],[data-msgto],[data-msgt],[data-place],[data-fgo],[data-invgo],[data-tact],[data-gact],[data-person],[data-vac],[data-vac13],[data-gok],[data-fd],[data-fav],[data-thback],[data-personback],[data-gohome],[data-y5go],[data-msg]').filter(b=>typeof b.onclick==='function'&&vis(b)&&!b.disabled):[];
  const label=b=>(b.textContent||'').replace(/\s+/g,' ').trim().slice(0,40)||JSON.stringify(b.dataset).slice(0,40);
  function clickEl(b,why){ act(why+'：'+label(b)); let r; try{ r=b.click(); }catch(e){ onExc(e,'按「'+label(b)+'」'); } if(r&&typeof r.then==='function') r.then(null,e=>onExc(e,'按「'+label(b)+'」之後')); }
  let react=0, wait=0, want=null, phoneClicks=0, emptyMenuSeen=null, pendingPhoneClick=null;
  /* 黑幕（#fade.on：z-index 9、pointer-events:auto）蓋著的時候按不到底下的東西；對話框、選單要被 game3d.js overFade 放到黑幕上面（z-index 10）才按得到。日期卡 #title3 是 pointer-events:none，不擋 */
  const covered=()=>{ const fe=getById('fade'); return !!(fe&&fe.classList.contains('on')); };
  const overFadeOk=el=>!covered()||(!!el&&+el.style.zIndex>=10);
  const free=()=>{ const Pl=E.player; return Pl&&!Pl.busy&&!E.paused&&!covered()&&!D.active&&!T.chooseCur&&!(GM.isEntering&&GM.isEntering())&&!GM.titleIdle&&!T.phoneOpen&&!T.menuOpen; };
  /* 選單的按鈕：大部分平均（隨機玩家），只有「上課」「睡覺／熬夜」照這個種子的個性加權；灰掉的少按 */
  function optW(b){ const t=label(b), g=GM.G, h=(+g.hour)%24, night=h>=22||g.hour>=24; let w=b.classList.contains('dim')?0.25:1;
    if(/^上課：|直接去上課|去上課|進教室/.test(t)) w*=0.3+persona.classP*8; else if(/^(聽演講|參加)：/.test(t)) w*=2;
    else if(/睡到明天|^睡覺|回去睡覺/.test(t)) w*=stayUp()?0.001:(night?3*(1-persona.lateP*0.8):0.6); else if(/再撐一下/.test(t)) w*=stayUp()?200:(night?0.3+persona.lateP*3:1); else if(/^起身$/.test(t)) w*=0.6; return w; }
  /* 回傳 true＝這一格做了事 */
  async function ui(){
    /* 劇情演到一半（對話、選單）：很少數的時候重新整理頁面、按「繼續」（使用者 10-27 AN-MEAL-STUCK 就是這樣讀回來的）*/
    if((D.active||T.chooseCur)&&track&&rnd()<persona.midReloadP){ R.step++; act('（劇情中途）重新整理頁面'); await reloadAuto(true); return true; }
    /* 選單 */
    const cc=T.chooseCur; const box=getById('choices');
    if(cc){ const opts=(cc.options||[]); const shown=opts.filter(q=>q&&!q.hidden);
      if(!shown.length){ if(emptyMenuSeen!==cc){ emptyMenuSeen=cc; fail('EMPTY_MENU','UNKNOWN','GM.choose 收到的選單沒有可以按的選項','選項：'+JSON.stringify(opts).slice(0,300)); } return false; }
      if(react>0){ react--; return false; } if(!overFadeOk(box)) return false; const btns=box?clickables(box):[]; if(!btns.length){ if(!R.chooseNoBtn){ R.chooseNoBtn=true; note('選單出來了但畫面上沒有按鈕（假 DOM？）',JSON.stringify(shown.map(q=>q.t)).slice(0,200)); } return false; }
      const b=wpick(btns.map(x=>[optW(x),x])); R.step++; busyV=0; clickEl(b,'選單（'+shown.length+' 個）'); react=ri(1,6); return true; }
    if(D.active){ if(react>0){ react--; return false; } if(!overFadeOk(getById('dlg'))) return false; R.step++; busyV=0; act('點對話：'+String(D.full||$text('dlgText')||'').slice(0,36)); try{ GM.dlgAdvance(); if(D.active&&D.typing) GM.dlgAdvance(); }catch(e){ onExc(e,'點對話（dlgAdvance）'); } react=ri(0,4); return true; }
    /* 羽球片段的「跳過」*/
    const bs0=getById('badclipSkip'); if(bs0&&vis(bs0)&&rnd()<0.02){ R.step++; clickEl(bs0,'跳過片段'); return true; }
    /* 一鍵的確認框、選單 */
    const gc=getById('goConfirm'); if(gc&&vis(gc)){ if(react>0){ react--; return false; } const y=getById('goCfYes'), n=getById('goCfNo'); R.step++; clickEl(rnd()<0.85?y:n,'一鍵確認'); react=ri(1,4); return true; }
    const pop=getById('goPop'); if(pop&&vis(pop)){ if(react>0){ react--; return false; } const bs=clickables(pop); R.step++; if(bs.length&&rnd()<0.9) clickEl(wpick(bs.map(b=>[b.classList.contains('dim')?0.2:1,b])),'一鍵選單'); else clickEl(getById('btnGo'),'一鍵（收起來）'); react=ri(1,4); return true; }
    /* 手機開著 */
    if(T.phoneOpen){ if(react>0){ react--; return false; } R.step++;
      if(pendingPhoneClick){ const b=pendingPhoneClick; pendingPhoneClick=null; if(b.isConnected){ clickEl(b,'手機'); react=ri(1,4); return true; } }
      if(phoneClicks<=0||rnd()<0.15){ act('收起手機'); try{ GM.closePhone(); }catch(e){ onExc(e,'收起手機'); } return true; }
      phoneClicks--; const body=getById('phoneBody'); const bs=clickables(body), tabs=clickables(getById('phoneTabs'));
      const Wt=bs.map(b=>{ const k=Object.keys(b.dataset)[0]||''; const w={go:6,skip:4,inv:4,ans:5,ask:6,th:3,msgto:3,msgt:4,place:3,fgo:2,invgo:6,tact:2,gact:2,vac:2,vac13:1,person:0.6,fav:0.2,fd:0.6,thback:0.8,personback:0.8,gohome:2,y5go:1,msg:2}[k]; return [w==null?0.5:w,b]; });
      const b=wpick(Wt.concat(tabs.map(t=>[0.8,t]))); if(b) clickEl(b,'手機'); else { act('手機：沒有可以按的 → 收起來'); GM.closePhone(); } react=ri(1,5); return true; }
    /* 整張地圖、💾 小選單：收起來（地圖上的點不按）*/
    for(const [id,cl] of [['bigmap','bmClose'],['quickPop','btnQuick']]){ const el=getById(id); if(el&&vis(el)){ if(react>0){ react--; return false; } R.step++; const c=getById(cl); if(c){ clickEl(c,'收起'+(id==='bigmap'?'地圖':'💾 選單')); } else { el.classList.add('hide'); act('收起 #'+id+'（沒有關閉鈕）'); } if(id==='bigmap'&&vis(el)){ el.classList.add('hide'); E.paused=false; } react=ri(1,4); return true; } }
    /* 筆記本（選單）開著：直接收起來（存檔欄位、設定、回標題都不按）*/
    if(T.menuOpen){ if(react>0){ react--; return false; } R.step++; act('收起筆記本（選單）'); try{ GM.closeMenu(); }catch(e){ onExc(e,'收起選單'); } react=ri(1,4); return true; }
    if(!free()){ want=null; return false; }
    /* 走路中（要去按某個互動點）*/
    if(want){ const Pl=E.player; if(Pl.path&&Pl.path.length) return false; const tgt=want; want=null; E0.__want=tgt; const it=E.nearestInteractable(); R.step++;
      act('按互動：'+(it?(it.label||(Object.getOwnPropertyDescriptor(it,'exit')&&Object.getOwnPropertyDescriptor(it,'exit').value?'往 '+it.exit.to:Object.keys(it).filter(k=>!['x','z','y','lv','radius','prio','label'].includes(k)).join('+'))):'（旁邊沒有東西）')+(tgt.npc?'（想找 '+(tgt.npc.name||tgt.npc.talkLabel||tgt.npc.id||'路人')+'）':''));
      try{ const r=GM.doInteract(); if(r&&r.then) r.then(null,e=>onExc(e,'互動（doInteract）之後')); }catch(e){ onExc(e,'互動（doInteract）'); } E0.__want=null; react=ri(1,5); return true; }
    if(wait>0){ wait--; return false; }
    if(react>0){ react--; return false; }
    return decide(); }
  /* 自由行動的時候：決定下一件事 */
  function decide(){ const g=GM.G, h=(+g.hour)%24, late=g.hour>=24, night=h>=22||late; R.step++;
    if(track&&rnd()<persona.snapP){ act('（隨機時間點）存讀檔檢查'); return snapCheck().then(()=>true); }
    if(track&&rnd()<persona.reloadP){ return reloadAuto(rnd()<0.5).then(()=>true); }
    /* 不讀 getter（例：CLS.addActHints 的 look 是 getter，玩家按下去才算）：用屬性描述判斷有沒有 */
    const IKEYS=['exit','seat','sleep','shop','counter','eat','onInteract','deskStudy','home','mrt','look','notice','wzShop','shop118','ggs','gg2','mokOrder','offOrder','roomItems','cafeRota','elevator','park','teaTable','board'];
    const hasK=(it,k)=>{ const d=Object.getOwnPropertyDescriptor(it,k); return !!d&&(d.get?true:!!d.value); };
    const its=E.interactables.filter(it=>!it.hidden&&IKEYS.some(k=>hasK(it,k)));
    const npcs=E.npcs.filter(n=>n.talk&&!n.hidden&&n.obj);
    const CLS=W.CLS; const todays=(CLS&&CLS.dayItems)?CLS.dayItems(g).filter(it=>!CLS.storyClass(g,it)):[]; const upcoming=todays.filter(it=>{ const s=CLS.status(g,it); return s==='open'||s==='upcoming'; });
    const sleepIt=its.find(it=>hasK(it,'sleep'));
    const here=upcoming.filter(it=>it.room&&it.room.zone===g.zone&&it.t0-h<0.5); const seatsHere=here.length?its.filter(q=>hasK(q,'seat')&&!q.seat.taken&&(!here[0].room.room||q.seat.room===here[0].room.room)):[];
    const choices=[];
    const wantSleep=night?(late?0.6:0.25)*(1-persona.lateP):0;
    if(sleepIt&&!stayUp()) choices.push([night?40*(1-persona.lateP*0.7):1,'bed']);
    if(!stayUp()) choices.push([night?wantSleep*60:0.5,'onetap']);
    if(upcoming.length) choices.push([persona.classP*12,'goclass']);
    if(seatsHere.length) choices.push([persona.classP*30,'sitclass']);
    choices.push([persona.phoneP*20,'phone']);
    if(npcs.length) choices.push([persona.talkP*14,'talk']);
    const followers=npcs.filter(n=>n.beh==='follow'); if(followers.length) choices.push([persona.talkP*30,'talkf']);
    /* 約好的人就在這裡、差不多到約好的時間：玩家多半直接走過去找他（INVITE：時間到了兩個人都在＝INV.autoStart 自己開始；玩家同時按「和他說話」）*/
    const invitees=(g.invites||[]).filter(iv=>(iv.state==='accepted'||iv.state==='going')&&iv.day===g.day&&iv.zone===g.zone&&h>=iv.h-0.5&&h<iv.h+1).map(iv=>npcs.find(n=>n.charId===iv.who||n.id===iv.who)).filter(Boolean);
    if(invitees.length) choices.push([persona.talkP*30,'talki']);   /* 一起走的人（約好現在一起過去、同行）：玩家常常一到就找他說話（BB_218：進門 2.9 秒按「和沈以安說話」）*/
    if(its.length) choices.push([8,'interact']);
    choices.push([night?2:5,'skip']);
    choices.push([10,'wait']);
    const c=wpick(choices);
    if(c==='wait'){ wait=ri(10,rnd()<0.2?1500:300); act('等一下（'+(wait/10).toFixed(0)+' 秒）'); return true; }
    if(c==='bed'){ walkTo({it:sleepIt},'床'); return true; }
    if(c==='sitclass'){ const it=pick(seatsHere); walkTo({it},'教室的座位（'+here[0].c.name+'）'); return true; }
    if(c==='talki'){ const n=pick(invitees); walkTo({npc:n},(n.name||n.charId||'約好的人')+'（約好的）'); return true; }
    if(c==='talkf'){ const n=pick(followers); walkTo({npc:n},(n.name||n.charId||'同行的人')+'（一起走來的）'); return true; }
    if(c==='talk'){ const n=pick(npcs); walkTo({npc:n},n.name||n.talkLabel||n.charId||n.id||'路人'); return true; }
    if(c==='interact'){ const wt=its.map(it=>[hasK(it,'exit')?3:hasK(it,'seat')?3:['shop','counter','eat','wzShop','shop118','mokOrder','offOrder'].some(k=>hasK(it,k))?2.5:hasK(it,'sleep')?0.5:1,it]); const it=wpick(wt); walkTo({it},it.label||(hasK(it,'exit')?'往 '+it.exit.to:'互動點')); return true; }
    if(c==='onetap'){ const b=getById('btnGo'); if(b&&typeof b.onclick==='function'){ clickEl(b,'一鍵'); react=ri(2,6); } return true; }
    if(c==='phone'||c==='goclass'||c==='skip'){ const tab=c==='goclass'||c==='skip'?'today':pick(['today','today','msg','msg','friends','friends','places','events','week','feed']); act('打開手機（'+tab+'）'+(c!=='phone'?'想'+(c==='goclass'?'直接去上課':'跳過時間'):''));
      try{ GM.openPhone(tab); }catch(e){ onExc(e,'打開手機'); return true; } phoneClicks=c==='phone'?ri(1,5):0;
      if(c!=='phone'){ const bs=clickables(getById('phoneBody')).filter(b=>c==='goclass'?b.dataset.go!=null:b.dataset.skip!=null); if(bs.length) pendingPhoneClick=pick(bs); }
      react=ri(1,4); return true; }
    return true; }
  function walkTo(tgt,name){ const Pl=E.player; const x=tgt.npc?tgt.npc.obj.position.x:(+tgt.it.x||0), z=tgt.npc?tgt.npc.obj.position.z:(+tgt.it.z||0); const d=Math.hypot(x-Pl.obj.position.x,z-Pl.obj.position.z);
    act('走去'+name+'（'+d.toFixed(1)+' m）'); Pl.run=d>16; const r=tgt.npc?0.9:Math.min(0.6,(tgt.it.radius||1.8)*0.4); const tx=x+(d>0.01?(Pl.obj.position.x-x)/d*r:0), tz=z+(d>0.01?(Pl.obj.position.z-z)/d*r:0);
    if(tgt.it&&tgt.it.lv!=null) Pl.lv=tgt.it.lv|0; E.moveTo(Pl,tx,tz); want=tgt; }

  /* ---------- 主迴圈 ---------- */
  /* 一格的長度：一般 100 ms（game3d.js 主迴圈 dt 的上限 0.1 秒）；玩家空下來、站著不動在「等一下」的時候開 GM.turbo、一格 300 ms（和 ?turbo 一樣：dt 上限 0.3 秒），
     只是讓閒著的時間走快一點；走路、劇情、對話、選單都用一般的格（不影響劇情的計時，例：invites3d.js S.arrive 的 0.9 秒）*/
  let turboFrames=0, noActV=0;
  while(true){
    const idle=GM&&E&&E.player&&wait>0&&!want&&!(E.player.path&&E.player.path.length)&&free()&&!(T.walks&&T.walks.size); GM.turbo=!!idle; const FRAME_MS=idle?300:100; if(idle){ turboFrames++; wait-=2; }
    if(R.frame>=o.maxSteps){ fail('STEP_LIMIT','UNKNOWN','到了步數上限（--max-steps '+o.maxSteps+' 格）還沒玩到 '+o.to,'reached '+R.reached); break; }
    await vAdvance(FRAME_MS); runRaf(); await flush(); R.frame++;
    const g=GM.G; if(!track&&ngDone&&g&&g.day>=D_FROM){ track={abs:abs(g)}; act('開局演完，從這裡開始檢查時間只往前（'+dayKey(g.day)+' '+fmtH(g.hour)+'）'); }
    else if(!track&&process.env.RPS_TRACK_OPENING&&g&&g.day>=D_FROM&&g.day<=D_TO){ track={abs:abs(g)}; act('（RPS_TRACK_OPENING）開局還沒演完就開始檢查時間只往前（'+dayKey(g.day)+' '+fmtH(g.hour)+'；給宿營 S.campY1 換日用，--from／--to 要包住宿營那幾天）'); }
    checkFrame(); heartbeat(false);
    if(SCEN){ await scenTick(); if(SC.res) break; }
    if(track&&g&&g.day>D_TO){ act('到了 '+o.to+' 的隔天，結束'); break; }
    if(R.stuckNow){ R.stuckRecover=(R.stuckRecover|0)+1; if(R.stuckRecover>8){ fail('STUCK_GIVEUP','UNKNOWN','卡住、重新整理頁面讀檔 8 次以後還是卡住，放棄這個種子','reached '+R.reached); break; } act('卡住了 → 重新整理頁面、讀自動存檔（玩家會這樣做）'); await reloadAuto(true); continue; }
    if(R.fails.length>60){ act('失敗太多種，停下來'); break; }
    let r=false; try{ r=ui(); if(r&&r.then) r=await r; }catch(e){ fail('HARNESS','TEST_BUG','random_play_sim.js 自己的程式丟例外（不是遊戲的錯）',(e&&e.stack)||String(e)); if(R.fails.filter(x=>x.kind==='HARNESS').length>5) break; }
    /* ⑧-2 玩家完全沒有東西可以按（不是空下來、也沒有對話、選項、手機）超過 120 秒（虛擬時間）：例如換區域的淡出淡入一直沒結束（GM.isEntering）、E.paused 一直開著 */
    if(r||(wait>0&&free())) noActV=0; else { noActV+=FRAME_MS/1000; if(noActV>300&&!R.stuckNow){ R.stuckNow=true; const Pl=E.player; fail('STUCK','UNKNOWN','玩家超過 300 秒（虛擬時間）沒有按到任何東西（不是在「等一下」；走路走不到、畫面停住、換區域沒結束…）',JSON.stringify({want:want?(want.npc?'npc '+(want.npc.name||want.npc.id):'it '+(want.it.label||'')):null,path:!!(E.player&&E.player.path),busy:Pl&&Pl.busy,depth:D.busyDepth,by:D.busyWho,dlg:D.active,choose:!!T.chooseCur,entering:GM.isEntering&&GM.isEntering(),titleIdle:GM.titleIdle,phone:T.phoneOpen,menu:T.menuOpen,paused:E.paused,fade:getById('fade')&&getById('fade').classList.contains('on'),evRunning:W.EVENTS&&W.EVENTS.running})); } }
  }
  return finish();

  function finish(){ R.steps=R.step; R.frames=R.frame; if(GM&&GM.G) R.reached=dayKey(GM.G.day);
    if(o.dumpMsgs){ try{ scanMsgs(); const all=[...MSGS.values()].sort((a,b)=>(a.day*24+a.h)-(b.day*24+b.h)); const her=all.filter(m=>/^heroine_0[1-5]$/.test(m.from||'')||(!m.from&&/^heroine_0[1-5]$/.test(m.who||'')));
      fs.writeFileSync(o.dumpMsgs,JSON.stringify({seed:R.seed,from:o.from,to:o.to,reached:GM&&GM.G?dayKey(GM.G.day):null,n:all.length,heroine:her,all},null,1)); RC.log('--dump-msgs：'+o.dumpMsgs+'　全部 '+all.length+' 則、heroine_01～05 傳的 '+her.length+' 則'); }catch(e){ RC.log('--dump-msgs 寫不出來：'+e); } }
    if(o.saveOut){ try{ if(GM&&GM.G&&GM.autosave) GM.autosave(true); const raw=LS.getItem((T&&T.KEY_AUTO)||'fatiao3d_auto'); if(raw){ fs.writeFileSync(o.saveOut,raw); RC.log('--save-out：'+o.saveOut+'　'+raw.length+' 字元（'+(GM&&GM.G?dayKey(GM.G.day):'?')+'）'); } else RC.log('--save-out：沒有自動存檔'); }catch(e){ RC.log('--save-out 寫不出來：'+e); } }
    const missTop=[...missing.entries()].sort((a,b)=>b[1]-a[1]).slice(0,15).map(([k,n])=>k+'×'+n);
    const out={seed:R.seed,scen:SCEN?{mode:o.oldForcing?'old-forcing':'stay-up',day:SCEN,savedTrue:SC.savedTrue,res:SC.res,pass:R.scenPass||null,calls:SC.calls,sent:SC.sent,log:SC.log}:undefined,ok:R.ok&&R.fails.length===0,reached:R.reached,steps:R.steps,frames:R.frames,vms:VC.now,pages:R.pages,fails:R.fails,notes:[...R.notes.values()],missingE:missTop,persona,sayStack:SAY_STACK,chooseStack:CHOOSE_STACK,
      g:GM&&GM.G?{attended:(()=>{ try{ return Object.keys(W.CLS.rec(GM.G).done||{}).length; }catch(e){ return null; } })(),day:GM.G.day,date:dayKey(GM.G.day),evDone:GM.G.events&&GM.G.events.count,money:GM.G.money,stage:GM.G.stage,contacts:Object.keys(GM.G.contacts||{}).length,invites:(GM.G.invites||[]).length,invDone:(GM.G.invites||[]).filter(v=>v.state==='done').length,goingSeen:goingSeen.size,msgs:(GM.G.msgs||[]).length}:null};
    for(const f of out.fails) delete f.extra;
    if(o.single) printSingle(out); process.stdout.write('@@RESULT '+JSON.stringify(out)+'\n'); return out; }
  function printSingle(out){ RC.log('\n================ 種子 '+out.seed+'：'+(out.ok?'PASS':'FAIL')+' ================');
    RC.log('區域 build '+(R.builds|0)+' 次、'+((R.buildMs|0)/1000).toFixed(1)+' 秒；turbo 格 '+turboFrames); if(o.verbose||process.env.RPS_BZ) RC.log(JSON.stringify(R.bz));
    RC.log('到 '+out.reached+'　步數 '+out.steps+'　格數 '+out.frames+'　虛擬時間 '+(out.vms/3600000).toFixed(1)+' 小時　開頁面 '+out.pages+' 次　真實 '+((realMs()-t0)/1000).toFixed(1)+' 秒　（game3d.js：'+(out.sayStack?'對話有 sayStack':'對話沒有 sayStack（新的一句蓋掉沒點的那一句）')+'）');
    if(out.g) RC.log('結束時：'+JSON.stringify(out.g)); RC.log('個性：'+JSON.stringify(out.persona));
    if(out.missingE.length) RC.log('假引擎 E 被讀但沒有的屬性：'+out.missingE.join('、'));
    for(const f of out.fails) RC.log('\n'+fmtFail(f,{seed:out.seed},o));
    if(out.notes.length){ RC.log('\n注意（不算 FAIL）：'); for(const n of out.notes.sort((a,b)=>b.n-a.n)) RC.log('  '+n.n+' 次　'+n.k+(n.ex?'　例：'+n.ex:'')); } }
}

/* ====================== 入口 ====================== */
(async()=>{ let o; try{ o=parseArgs(process.argv.slice(2)); }catch(e){ RC.error(e.message); process.exit(2); }
  if(o.help){ RC.log(fs.readFileSync(SELF,'utf8').split('*/')[0]); return; }
  const run=async()=>{ try{ return await child(o); }catch(e){ RC.error('random_play_sim.js 自己丟例外：',e&&e.stack||e); process.stdout.write('@@RESULT '+JSON.stringify({seed:o.seed,ok:false,fails:[{kind:'HARNESS',cls:'TEST_BUG',why:'random_play_sim.js 自己的程式丟例外',msg:String(e&&e.stack||e),lastActions:[]}]})+'\n'); return null; } };
  if(o.child){ const r=await run(); process.exit(r&&r.ok?0:1); }
  if(o.seed!=null){ o.single=true; const t0=realMs(); const r=await run(); RC.log('（'+((realMs()-t0)/1000).toFixed(1)+' 秒）'); process.exit(r&&r.ok?0:1); }
  await parent(o); })();
