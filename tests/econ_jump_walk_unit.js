// 經濟系事件接事件跳日子：不在玩家走路中跳、同一天往後跳兩小時以上也出日期卡（BUG-Y0-DAYSKIP-CARD-1107；BB-B 11-07 BB_255 CC 試玩第 1 件）——不需要瀏覽器（D131）。
// 起因：9/2→9/12 21:00、9/13→9/16、9/16→9/20、9/20 18:30 按「走出房間」→23:00「沒有過場字卡、有時跳在玩家正在走路的時候」。
// 檢查：1 ECONFF.walking：搖桿按著、剛停下不到 1 秒、自動走路＝在走；停了 1 秒以上＝沒在走；2 S.tick 的「空下來」用 walking（不是只看 path）
//       3 同一天 18:30 → 23:00：出日期卡（9/20（五）23:00）；4 同一天只差半小時：不出；跨日照舊出。修改前 1、2、3 FAIL。
// 用法：node tests/econ_jump_walk_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.document={getElementById:()=>null,addEventListener(){}}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CALENDAR|COURSES|CLS|CHARACTERS|ECONFF)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/calendar.js','src/data/characters.js','src/data/courses.js','src/classes3d.js','src/econff3d.js']) load(f);
let fails=0; const check=(n,ok,i)=>{ console.log((ok?'PASS ':'FAIL ')+n+(i?'　'+i:'')); if(!ok) fails++; };
const dayOf=k=>{ for(let d=-600; d<400; d++){ const t=CALENDAR.dateOf(d); if(t&&t.key===k) return d; } return null; };
global.STORY={dayOfKey:dayOf,phoneRules(){}}; global.STORY_EVENTS=[]; global.EVENTS={running:null};
global.PHONE={pending:()=>[],tick(){},at:()=>true};
const mkG=(k,h)=>({stage:'econ',day:dayOf(k),hour:h,weekday:CALENDAR.dateOf(dayOf(k)).wd,flags:{E01_MORNING:true,ECON_FULL:false,ECONFF:{done:{},lines:[]}},events:{done:{}}});
(async()=>{
  { const W=ECONFF.walking; const ok=typeof W==='function';
    const r=ok?[W({input:{joy:{active:true}},time:10},{lastMoveT:1}),W({input:{joy:{active:false}},time:10},{lastMoveT:9.5}),W({time:10},{path:[{x:1,z:1}],lastMoveT:1}),W({input:{joy:{active:false}},time:10},{lastMoveT:8.5}),W({time:10},{})]:[];
    check('1. walking：搖桿按著、剛停 0.5 秒、自動走路＝在走；停 1.5 秒、沒動過＝沒在走',ok&&JSON.stringify(r)===JSON.stringify([true,true,true,false,false]),JSON.stringify(r)); }
  { const src=fs.readFileSync(path.join(ROOT,'src/econff3d.js'),'utf8'), m=src.match(/S\.tick=function\(GM\)\{[^\n]*\n[^\n]*/);
    check('2. S.tick 的「空下來」看 S.walking（搖桿、剛停下都不跳）',!!m&&/!S\.walking\(E,P\)/.test(m[0]),m&&m[0].slice(0,160)); }
  const run=async(k,h0,h1)=>{ const G=mkG(k,h0), cards=[]; const s={n:'t1',key:k,h:h1,ev:'ev_none_test'}; const n0=ECONFF.next, t0=ECONFF.tOf;
    ECONFF.next=()=>G.flags.ECONFF.done.t1?null:s; ECONFF.tOf=()=>dayOf(k)*24+h1;
    try{ await ECONFF.advance({G,E:null,sceneBegin(){},sceneEnd(){},fade:async()=>{},titleCard:async(a,b)=>{ cards.push(a); },autosave(){},updateHUD(){}}); } finally { ECONFF.next=n0; ECONFF.tOf=t0; }
    return {cards,G}; };
  { const {cards,G}=await run('2024-09-20',18.5,23); check('3. 同一天 18:30 → 23:00：出日期卡「9/20（五）23:00」',cards.length===1&&/^9\/20（.）23:00$/.test(cards[0])&&G.hour===23,JSON.stringify({cards,h:G.hour})); }
  { const {cards}=await run('2024-09-20',18.5,19); check('4. 同一天只差半小時：不出日期卡',cards.length===0,JSON.stringify(cards)); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); console.log('FAILED (exception)'); process.exit(1); });
