// 遊戲中劇情演到一半，從選單讀另一個存檔要擋下來（src/game3d.js 的 loadFrom；LAWWW2 2026-10-14 跑颱風假測試發現：
// 讀檔後舊的劇情流程沒有結束，接著演到讀進來的存檔裡——v9.5 起就有）。不需要瀏覽器：從 game3d.js 抽出 loadFrom 那一行，用假的 D、$、toast、applySave 跑。
//   1. 劇情進行中（D.busyDepth>0）、在遊戲裡（標題畫面藏起來）：不讀、提示「劇情還在進行」，選單不關、標題畫面不動；
//   2. 劇情進行中、但在標題畫面（例如標題畫面的「讀取」）：照常讀；
//   3. 沒有劇情：照常讀、關選單、提示「已讀取」；讀取失敗照舊提示「讀取失敗」；
//   4. 修正前的版本（3d7f068 的上一版）在第 1 項會失敗——這個測試在有 bug 的版本失敗；
//   5. 選單的「回到標題」：劇情進行中也擋下（不然回標題再讀檔是同一個問題），沒有劇情時照常（先自動存檔、關選單、顯示標題畫面）。
// 用法：node tests/load_guard_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
function extract(src){ const i=src.indexOf('  async function loadFrom(s){'); if(i<0) return null; const j=src.indexOf('\n',i); return src.slice(i,j); }
function build(line){
  const st={toasts:[],loaded:[],closed:0,titleHidden:true,busy:0,fail:false};
  const title={classList:{contains:c=>c==='hide'&&st.titleHidden,add:c=>{ if(c==='hide') st.titleHidden=true; }}};
  const $=id=>id==='titleScreen'?title:null;
  const D={get busyDepth(){ return st.busy; }};
  const toast=(m)=>st.toasts.push(m), closeMenu=()=>st.closed++;
  const applySave=async s=>{ if(st.fail) throw new Error('壞掉的存檔'); st.loaded.push(s); };
  const waitChars=async()=>{ st.waited=(st.waited||0)+1; }; // 標題畫面讀檔先等人物下載完（NO-UGLY）；這裡用假的
  const fn=vm.runInThisContext('(function(D,$,toast,closeMenu,applySave,waitChars){'+line+' return loadFrom; })')(D,$,toast,closeMenu,applySave,waitChars);
  return {st,fn};
}
async function cases(line,label){
  const r={};
  { const {st,fn}=build(line); st.busy=1; st.titleHidden=true; await fn({day:3});
    r.blocked=st.loaded.length===0&&st.closed===0&&st.toasts.some(t=>t.includes('劇情還在進行'));
    check(label+'1. 劇情進行中、在遊戲裡：不讀、提示「劇情還在進行」、選單不關',r.blocked,JSON.stringify(st)); }
  { const {st,fn}=build(line); st.busy=2; st.titleHidden=false; await fn({day:4});
    check(label+'2. 劇情進行中、但在標題畫面：照常讀',st.loaded.length===1&&st.toasts.includes('已讀取'),JSON.stringify(st)); }
  { const {st,fn}=build(line); st.busy=0; st.titleHidden=true; await fn({day:5});
    check(label+'3. 沒有劇情：照常讀、關選單、提示「已讀取」',st.loaded.length===1&&st.closed===1&&st.toasts.includes('已讀取'),JSON.stringify(st)); }
  { const {st,fn}=build(line); st.busy=0; st.fail=true; await fn({day:6});
    check(label+'3. 讀取失敗照舊提示',st.toasts.some(t=>t.startsWith('讀取失敗')),JSON.stringify(st)); }
  return r;
}
(async()=>{
  const now=extract(fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8'));
  check('game3d.js 找得到 loadFrom',!!now);
  if(now) await cases(now,'');
  let old=null; try{ old=extract(cp.execSync('git show 3d7f068^:src/game3d.js',{cwd:ROOT,encoding:'utf8',maxBuffer:64<<20,stdio:['ignore','pipe','ignore']})); }catch(e){}
  if(!old) console.log('（略過第 4 項：這個 checkout 沒有 3d7f068 的歷史）');
  else { // 修正前的版本：劇情中照樣讀了（第 1 項會失敗）
    const st0=build(old); st0.st.busy=1; st0.st.titleHidden=true; await st0.fn({day:3}); const blocked=st0.st.loaded.length===0;
    check('4. 修正前的版本（3d7f068^）劇情中照樣讀檔——第 1 項在有 bug 的版本會失敗',!blocked,JSON.stringify(st0.st)); }
  { const src=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8'); const i=src.indexOf("    $('btnTitle').onclick="), line=i<0?null:src.slice(i,src.indexOf('\n',i));
    check('game3d.js 找得到「回到標題」',!!line);
    if(line){ const run=(busy)=>{ const st={toasts:[],saved:0,closed:0,shown:false,running:true}; const btn={};
        const $=id=>id==='btnTitle'?btn:(id==='titleScreen'?{classList:{remove:c=>{ if(c==='hide') st.shown=true; }}}:null);
        const GM={set running(v){ st.running=v; }, get running(){ return st.running; }};
        vm.runInThisContext('(function(D,$,toast,autosave,closeMenu,GM){'+line+'})')({busyDepth:busy},$,m=>st.toasts.push(m),()=>st.saved++,()=>st.closed++,GM); btn.onclick(); return st; };
      const a=run(1); check('5. 劇情進行中按「回到標題」：擋下、提示，不存檔、不關選單、不顯示標題畫面',!a.shown&&a.saved===0&&a.closed===0&&a.running&&a.toasts.some(t=>t.includes('劇情還在進行')),JSON.stringify(a));
      const b=run(0); check('5. 沒有劇情時「回到標題」照常：自動存檔、關選單、顯示標題畫面',b.shown&&b.saved===1&&b.closed===1&&!b.running,JSON.stringify(b)); } }
  { // 6. 換區域（含讀檔）途中不判斷劇情（2026-10-17 回歸 flow_main_day12：applySave 先換上存檔的 G 才 await enter，
    //    這段時間 G.zone 是新區域、玩家還在舊位置；小安「離霖澤館門口 6 m 才追上來」在載入途中就開演，讀檔後搖桿不能動）
    const tickBlock=src=>{ const i=src.indexOf('if(E.frame%30===0){ updateHUD();'); if(i<0) return null; let d=0, j=src.indexOf('{',i); for(let k=j;k<src.length;k++){ if(src[k]==='{') d++; else if(src[k]==='}'){ d--; if(!d) return src.slice(i,k+1); } } return null; };
    const runTick=(blk,entering)=>{ const st={story:0,events:0,home:0}; const E={frame:30,player:{busy:false}}; const G={social:{},hour:27};
      vm.runInThisContext('(function(E,G,GM,STORY,EVENTS,updateHUD,dt,entering){'+blk+'})')(E,G,{},{tick:()=>st.story++,forceHome:()=>st.home++},{tick:()=>st.events++},()=>{},0.016,entering); return st; };
    const cur=tickBlock(fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8')); check('6. game3d.js 找得到主迴圈每 30 幀的劇情判斷',!!cur);
    if(cur){ const a=runTick(cur,true), b=runTick(cur,false);
      check('6. 換區域途中（entering）：不跑 STORY.tick、EVENTS.tick、forceHome',a.story===0&&a.events===0&&a.home===0,JSON.stringify(a));
      check('6. 沒有在換區域：照常跑',b.story===1&&b.events===1&&b.home===1,JSON.stringify(b)); }
    let old6=null; try{ old6=tickBlock(cp.execSync('git show 9264002f:src/game3d.js',{cwd:ROOT,encoding:'utf8',maxBuffer:64<<20,stdio:['ignore','pipe','ignore']})); }catch(e){}
    if(!old6) console.log('（略過第 6 項的舊版比對：這個 checkout 沒有 9264002f 的歷史）');
    else { const o=runTick(old6,true); check('6. 修正前的版本（9264002f）換區域途中照樣跑劇情——這一項在有 bug 的版本會失敗',o.story===1,JSON.stringify(o)); } }
  console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
})();
