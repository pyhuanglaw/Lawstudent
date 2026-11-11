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
    uncover(){}, overFade(){}, subst:t=>t, hideHUD(){}, letterbox(){}, toast(){}, performance:{now:()=>now}, requestAnimationFrame:f=>f(), sayRestore(){}, sayRestoreSoon(){}, sayStack:[],
    navigator:{userAgent:'x',webdriver:!!o.webdriver}, location:{search:o.search||''},
    document:{createElement:()=>{ const x=el('btn'); x.onclick=null; return x; }, addEventListener:(t,f)=>{ (listeners[t]=listeners[t]||[]).push(f); }}, console:{warn(){},log:console.log} };
  vm.createContext(ctx); vm.runInContext(SRC.slice(a,b)+'\n  GM.choose=choose;',ctx,{filename:'game3d.js(抽出)'});
  const box=$('choices');
  return { GM:ctx.GM, box, adv:ms=>{ now+=ms; }, down:()=>{ for(const f of listeners.pointerdown||[]) f({}); }, tap(i){ this.down(); box.children[i].onclick(); }, has:()=>!box.classList.contains('hide')&&box.children.length>0, n:()=>(listeners.pointerdown||[]).length }; }
const tick=()=>new Promise(r=>setImmediate(r));
(async()=>{
  { const H=mk(); let got='還沒'; H.GM.choose([{t:'直接去上課'},{t:'翹這堂課'},{t:'先起床再說'}]).then(i=>{ got=i; });
    await tick(); check('1. 有登記 pointerdown；TAP_GUARD 在 250～500 毫秒之間',H.n()===1&&H.GM.TAP_GUARD>=250&&H.GM.TAP_GUARD<=500,String(H.GM.TAP_GUARD));
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
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });
