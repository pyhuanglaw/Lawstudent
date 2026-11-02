// 「你來過一次」（AA_160 4-4、AA_271、BB_213；任務 ENC-B3-1017；src/data/solo_before.js、src/date3d.js S.soloBefore）——不需要瀏覽器。
//   1 自己去過（G.places.free[地點]≥1）、第一次和她約會去那裡：抵達句以後一句旁白（括號）＋她的台詞（逐字照資料）；記 G.places.soloSaid["<id>:<地點>"]
//   2 同一人同一地一次；和她去過（visits>0）、自己沒去過、她沒有那個地方的台詞＝不演；心願地點第一次（wishEvent）＝不演（wish3d.js freeVisited 演）
//   3 舊存檔沒有 soloSaid 也演；date3d.js 三個抵達點都接了；index.html 在 date3d.js 前面載；資料來自白名單的版本
// 修改前（開發分支 b43392084）：沒有 src/data/solo_before.js、沒有 DATE.soloBefore——FAIL。用法：node tests/solo_before_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
let err=''; try{ vm.runInThisContext(fs.readFileSync(path.join(H.ROOT,'src/data/solo_before.js'),'utf8').replace(/^const SOLO_BEFORE\s*=/m,'globalThis.SOLO_BEFORE='),{filename:'src/data/solo_before.js'}); }catch(e){ err=String(e); }
GM.toast=()=>{}; GM.caption=()=>{};
const ok0=typeof SOLO_BEFORE!=='undefined'&&!err&&typeof DATE!=='undefined'&&typeof DATE.soloBefore==='function';
check('0. src/data/solo_before.js 載得到、DATE.soloBefore 存在',ok0,err);
if(!ok0) H.done();
const nm=id=>SOCIAL.displayName?SOCIAL.displayName(id):id, said=()=>H.said.map(s=>({w:s.who,t:s.t}));   /* pg_harness 的 say 只記名字 */
const mk=(free,flags)=>{ const G=H.fresh('2026-03-14',14,'gongguan',flags||{}); G.places=G.places||{}; G.places.free=Object.assign({},free||{}); return G; };
(async()=>{
  { const G=mk({D04:1}); delete G.places.soloSaid; H.said=[]; const t={who:'heroine_01',locs:['D04'],day:G.day}; const r=await DATE.soloBefore(GM,t,0); const L=said();
    const want=[{w:null,t:'（'+SOLO_BEFORE.narr.D04+'）'}].concat(SOLO_BEFORE.lines.heroine_01.D04.map(x=>({w:nm('heroine_01'),t:x.text})));
    check('1. 以安 D04：自己來過、第一次和她來＝「（你來過一次。上次是一個人，從六號出口走出來。）」＋她的台詞；舊存檔沒有 soloSaid 也演',r===true&&J(L)===J(want)&&SOLO_BEFORE.narr.D04==='你來過一次。上次是一個人，從六號出口走出來。'&&SOLO_BEFORE.lines.heroine_01.D04[0].text==='你來過？……好。那電影院你帶路。我只記得出口。',J(L));
    check('1. 記 G.places.soloSaid["heroine_01:D04"]＝那一天',G.places.soloSaid&&G.places.soloSaid['heroine_01:D04']===G.day,J(G.places.soloSaid));
    H.said=[]; const r2=await DATE.soloBefore(GM,t,0); check('2. 同一人同一地第二次＝不演',r2===false&&H.said.length===0);
    H.said=[]; const t2={who:'heroine_02',locs:['D04'],day:G.day}; const r3=await DATE.soloBefore(GM,t2,0); check('2. 換一個人（芷若 D04）＝她自己的一次照演（BB 檔）',r3===true&&said()[1].t===SOLO_BEFORE.lines.heroine_02.D04[0].text&&said()[1].w===nm('heroine_02'),J(said())); }
  { const G=mk({D04:1}); const a=DATE.soloBeforeDue(G,{who:'heroine_01',locs:['D04']},1); const G2=mk({}); const b=DATE.soloBeforeDue(G2,{who:'heroine_01',locs:['D04']},0);
    const G3=mk({D05:2}); const c=DATE.soloBeforeDue(G3,{who:'heroine_02',locs:['D05']},0);
    check('2. 和她去過（visits 1）、自己沒去過、她沒有那個地方的台詞（芷若 D05）＝不演',!a&&!b&&!c&&!(SOLO_BEFORE.lines.heroine_02.D05),J({a,b,c})); }
  { const LN=typeof DATE_LINES!=='undefined'?DATE_LINES:null; const wish=[]; if(LN&&LN.loc) for(const [loc,v] of Object.entries(LN.loc)) for(const [id,x] of Object.entries((v&&v.lines)||{})) if(x&&x.arrive&&x.arrive.first&&x.arrive.first.wishEvent) wish.push([id,loc]);
    const all={}; wish.forEach(([,l])=>all[l]=1); const G=mk(all); const bad=wish.filter(([id,loc])=>DATE.soloBeforeDue(G,{who:id,locs:[loc]},0));
    check('2. 心願地點的第一次（arrive.first.wishEvent）＝這裡不演（'+wish.length+' 處）',wish.length>0&&bad.length===0,J({n:wish.length,bad})); }
  { const src=fs.readFileSync(path.join(H.ROOT,'src/date3d.js'),'utf8'); const n=(src.match(/await S\.arriveLine\([^;]*\); await S\.soloBefore\(/g)||[]).length;
    const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'); const i=html.indexOf('src/data/solo_before.js'), j=html.indexOf('src/date3d.js');
    const A=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files.filter(e=>/free_trip\/solo_before_(aa|bb)_v1\.json$/.test(e.path)&&e.status==='approved');
    check('3. date3d.js 三個抵達點（一般、多天第一天、同日第二地）都接 soloBefore；index.html 在 date3d.js 前載',n===3&&i>0&&i<j,J({n,i,j}));
    check('3. 資料來自白名單（aa、bb 兩檔 approved 的版本）',A.length===2&&A.every(e=>SOLO_BEFORE.source.includes('@'+e.sha)),SOLO_BEFORE.source); }
  H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
