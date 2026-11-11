// 選單防連點（BUG-GOCLASS-SKIPPED-1111，使用者 2026-11-11 day57 存檔）——不需要瀏覽器。
//   使用者：「我早上選去上課 結果直接跳到法律服務圖書館 打開手機還說我沒去上課」。存檔記到刑法總則 plan_skip（翹課）、服務學習有上：
//   起床選單「翹這堂課」→ 確認「翹」→「再睡一下」三個選單被連著點掉（對話點太快，選項一出現就在手指底下），第二次起床選單的第一項已經是下午的服務學習。
//   修法（game3d.js tapTooSoon）：選單出現後 TAP_GUARD 毫秒內「按下去」（pointerdown）的那一下不算；程式直接呼叫 onclick（測試、探針）不受影響；
//   自動化瀏覽器（navigator.webdriver）預設不擋，網址 ?tapguard 才擋。
// 做法同 tests/choose_cover_unit.js：從 src/game3d.js 抽出 choose 原樣執行，假的 DOM、可以撥的時鐘。用法：node tests/tap_guard_1111_unit.js [game3d.js 路徑]
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
const SRC=fs.readFileSync(process.argv[2]||path.join(ROOT,'src/game3d.js'),'utf8');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const a=SRC.indexOf('  /* 選單疊在另一個還沒選的選單上')>=0?SRC.indexOf('  /* 選單疊在另一個還沒選的選單上'):SRC.indexOf('  function choose(options,opt)');
const b=SRC.indexOf('  GM.choose=choose;');
check('0. 抽得到 choose；裡面有 tapTooSoon',a>=0&&b>a&&SRC.slice(a,b).includes('function tapTooSoon(shownAt)'));
if(fails){ console.log('FAILED '+fails); process.exit(1); }
function mk(o){ o=o||{}; let now=1000; const listeners={};
  function el(id){ const cls=new Set(); return {id,style:{},children:[],_html:'',offsetHeight:40,scrollTop:0,clientHeight:300,scrollHeight:300,onscroll:null,textContent:'',
    classList:{add:(...c)=>c.forEach(x=>cls.add(x)),remove:(...c)=>c.forEach(x=>cls.delete(x)),contains:c=>cls.has(c),toggle:(c,on)=>{ if(on===undefined) on=!cls.has(c); if(on) cls.add(c); else cls.delete(c); return on; }},
    set innerHTML(v){ this._html=v; if(v==='') this.children=[]; }, get innerHTML(){ return this._html; }, appendChild(c){ this.children.push(c); return c; } }; }
  const els={}; const $=id=>els[id]||(els[id]=el(id)); $('choices').classList.add('hide'); $('dlg').classList.add('hide');
  const ctx={ $, D:{active:false,resolve:null,typing:false,full:'',shown:0,timer:0,busyDepth:0,busyWho:[],stale:false}, GM:{}, A3:{blip(){}}, ADV:{active:false,skip:false,end(){}}, SOCIAL:undefined,
    E:{player:{busy:false,path:null,target:null,pose:'idle',obj:{position:{}}},npcs:[],endCinematic(){}},
    uncover(){}, overFade(){}, skipBtnSync(){}, subst:t=>t, hideHUD(){}, letterbox(){}, toast(){}, performance:{now:()=>now}, requestAnimationFrame:f=>f(), sayRestore(){}, sayRestoreSoon(){}, sayStack:[],
    navigator:{userAgent:'x',webdriver:!!o.webdriver}, location:{search:o.search||''},
    document:{createElement:()=>{ const x=el('btn'); x.onclick=null; return x; }, addEventListener:(t,f)=>{ (listeners[t]=listeners[t]||[]).push(f); }}, console:{warn(){},log:console.log} };
  vm.createContext(ctx); vm.runInContext(SRC.slice(a,b)+'\n  GM.choose=choose;',ctx,{filename:'game3d.js(抽出)'});
  const box=$('choices');
  return { GM:ctx.GM, box, adv:ms=>{ now+=ms; }, down:()=>{ for(const f of listeners.pointerdown||[]) f({}); }, up:()=>{ for(const f of listeners.pointerup||[]) f({}); }, tap(i){ this.down(); this.up(); box.children[i].onclick(); }, has:()=>!box.classList.contains('hide')&&box.children.length>0, n:()=>(listeners.pointerdown||[]).length }; }
const tick=()=>new Promise(r=>setImmediate(r));
(async()=>{
  { const H=mk(); let got='還沒'; H.GM.choose([{t:'直接去上課'},{t:'翹這堂課'},{t:'先起床再說'}]).then(i=>{ got=i; });
    await tick(); check('1. 有登記 pointerdown；TAP_GUARD 在 250～500 毫秒之間',H.n()>=1&&H.GM.TAP_GUARD>=250&&H.GM.TAP_GUARD<=500,String(H.GM.TAP_GUARD));
    H.adv(60); H.tap(1); await tick(); check('1. 選單出現 60 毫秒就按到「翹這堂課」：不算，選單還在',got==='還沒'&&H.has(),String(got));
    H.adv(200); H.tap(1); await tick(); check('1. 260 毫秒再按一次：還是不算',got==='還沒'&&H.has(),String(got));
    H.adv(200); H.tap(0); await tick(); check('1. 460 毫秒（看過了）按「直接去上課」：算，收到第 0 項',got===0&&!H.has(),String(got)); }
  { const H=mk(); let got='還沒'; H.down();   /* 上一句對話那一下（選單出現以前按的）*/ H.GM.choose([{t:'翹'},{t:'還是去'}]).then(i=>{ got=i; }); await tick();
    H.box.children[0].onclick(); await tick(); check('2. 程式直接呼叫 onclick（沒有新的 pointerdown；測試、探針的寫法）：照常算',got===0,String(got)); }
  { const H=mk(); const seq=[]; const p1=H.GM.choose([{t:'A'},{t:'B'}]).then(i=>{ seq.push(i); return H.GM.choose([{t:'翹'},{t:'還是去'}]); }).then(i=>{ seq.push(i); });
    await tick(); H.adv(500); H.tap(1); await tick(); await tick(); H.adv(40); H.tap(0); await tick(); const blocked=seq.length===1&&H.has(); H.adv(400); H.tap(1); await p1;
    check('3. 第一個選單正常選了以後，第二個選單 40 毫秒內連著點到的不算；等一下再點才算（每個選單各自從出現的時間算）',blocked&&seq.join()==='1,1',seq.join()); }
  { const H=mk({webdriver:true}); let got='還沒'; H.GM.choose([{t:'A'},{t:'B'}]).then(i=>{ got=i; }); await tick(); H.adv(10); H.tap(1); await tick();
    check('4. 自動化瀏覽器（navigator.webdriver）預設不擋：探針一出現就點也收得到',got===1,String(got)); }
  { const H=mk({webdriver:true,search:'?dev&tapguard'}); let got='還沒'; H.GM.choose([{t:'A'},{t:'B'}]).then(i=>{ got=i; }); await tick(); H.adv(10); H.tap(1); await tick(); const blocked=got==='還沒'; H.adv(400); H.tap(1); await tick();
    check('5. 網址加 ?tapguard：自動化瀏覽器也擋（給 CC 驗這個功能）',blocked&&got===1,String(got)); }
  /* 6～8：連點到底（BB 2026-11-11 CHOOSE_SCAN）——選單出現以前就開始的一串連點，整串都不算，手停下來再點才算 */
  { const H=mk(); const seq=[]; const p=H.GM.choose([{t:'下一堂不去'},{t:'去上課'}]).then(i=>{ seq.push(i); return H.GM.choose([{t:'翹'},{t:'還是去'}]); }).then(i=>{ seq.push(i); });
    await tick(); H.adv(600); H.tap(0); await tick(); await tick();   /* 這一下選了第一個選單，第二個選單同時出現 */
    let blocked=0; for(let n=0;n<12;n++){ H.adv(150); H.tap(0); await tick(); if(seq.length===1&&H.has()) blocked++; }   /* 每 0.15 秒一下、連點 12 下（1.8 秒）：都超過 350 毫秒了，還是同一串 */
    check('6. 每 0.15 秒連點 12 下：第二個選單一下都沒被點掉（舊的只擋前 350 毫秒）',blocked===12,String(blocked)+' '+seq.join());
    H.adv(450); H.tap(1); await p; check('6. 手停 0.45 秒以後再點：算，收到那一項',seq.join()==='0,1',seq.join()); }
  { const H=mk(); let got='還沒'; H.down(); H.adv(100); H.down(); H.adv(20);   /* 翻對話連點兩下，最後一下之後 20 毫秒選單出現 */ H.GM.choose([{t:'A'},{t:'B'}]).then(i=>{ got=i; }); await tick();
    H.adv(360); H.tap(0); await tick(); const b1=got==='還沒';   /* 選單出現已經 360 毫秒（過了 350），可是和前一下只隔 380＝同一串 */ H.adv(420); H.tap(1); await tick();
    check('7. 翻對話的連點延續到選單上（間隔不到 0.4 秒）：不算；停一下再點才算',b1&&got===1,String(got)); }
  { const H=mk(); let got='還沒'; H.down(); H.GM.choose([{t:'A'},{t:'B'}]).then(i=>{ got=i; }); await tick();
    let n=0; while(got==='還沒'&&n<60){ H.adv(200); H.tap(0); await tick(); n++; }
    check('8. 保險：一直不停地點（每 0.2 秒）最多擋 '+H.GM.TAP_BURST_MAX+' 毫秒，之後收得到，不會永遠選不到',got===0&&n*200>=H.GM.TAP_BURST_MAX&&n*200<=H.GM.TAP_BURST_MAX+400,n+' 下'); }
  /* 8b：按下去的時候選單還沒出來、放開的時候已經出來（BB／CC 2026-11-11 課堂「略過 »」連點把考題點掉的第 2 下：按下早 182 ms） */
  { const H=mk(); let got='還沒'; H.adv(500); H.down(); H.adv(182); H.GM.choose([{t:'A'},{t:'B'}]).then(i=>{ got=i; }); await tick(); H.adv(30); H.up(); H.box.children[1].onclick(); await tick();
    const blocked=got==='還沒'&&H.has(); H.adv(600); H.tap(0); await tick();
    check('8b. 手指按下去以後選單才出現、放開時點到新選項：不算；之後正常點一下才算',blocked&&got===0,String(got)); }
  { const H=mk(); let got='還沒'; H.adv(500); H.down(); H.up(); H.adv(300); H.GM.choose([{t:'A'},{t:'B'}]).then(i=>{ got=i; }); await tick(); H.adv(50); H.box.children[1].onclick(); await tick();
    check('8c. 很久以前點過、現在程式直接呼叫 onclick（沒有剛放開的紀錄）：照常算',got===1,String(got)); }
  /* 9、10：BB CHOOSE_SCAN ①②——選單從下緣往上排，不可逆的那一項不要和上一層被點的那一項同一個「從下面數的位置」 */
  { const fs2=require('fs'), path2=require('path'), R=f=>fs2.readFileSync(path2.join(__dirname,'..',f),'utf8'), CL=R('src/classes3d.js'), JB=R('src/jobs3d.js');
    check('9. 下課選單「下一堂不去」（最下面）→ 翹課確認用 flip：最下面是「還是去」；起床選單照舊「翹」在最下面、「還是去」倒數第二',/c==='skip'\) await S\.skipClass\(GM,nx,\{flip:true\}\)/.test(CL)&&/GM\.choose\(flip\?\[\{t:'翹'\},\{t:'還是去'\}\]:\[\{t:'還是去'\},\{t:'翹'\}\]\)/.test(CL)&&/if\(k!==SK\)\{ await S\.goClass\(GM,it\); return false; \}/.test(CL)&&/k===1&&await S\.skipClass\(GM,it\)\)/.test(CL));
    check('10. 打工櫃台非上班時間「找老闆」：「（算了）」在前（互動鍵那個高度）、「（辭職）」在最下面，選第 1 個才辭職',/GM\.choose\(\[\{t:'（算了）'\},\{t:'（辭職）',hint:[^\]]*\}\]\); if\(c===1\) await S\.quit\(GM,k\);/.test(JB)); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });
