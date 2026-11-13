// AA_938 第 3 節（CANON-NO-ECON-1112 收尾；AA-C 2026-11-13 定、BB-C 照用）：大四寒假情人節視訊可昕說「情人節禮物我開學給你。是吃的。」——大四下開學第一週兌現（src/r2y4b3d.js）。不需要瀏覽器。
//   1. 情人節那一場：那一句還在、演完記 KX_VDAY[4]='video'（＝收到了）
//   2. 當面：第一週（2029-02-19 起）第一次跟她說話（STORY.PRE_TALK）開頭插旁白＋「高雄的。情人節的。」，一次；記 KX_VDAY_Y4_GIVEN='face'；之後週五 21:00 不傳
//   3. 約好的見面坐下以後（INV.ON_SEATED）也算當面
//   4. 第一週到週五 21:00 都沒遇到：她傳「芭樂乾我放在你宿舍的管理室了。」「高雄的。情人節的。」；記 'msg'；之後再遇到不演（兩條路只走一條）；20:59 還不傳
//   5. 不演也不傳：沒在交往、沒收到那一句（情人節沒去＝missed、沒有紀錄）、開學以前（第一週週一以前）
// 修改前：R2Y4B.kxGuavaFace／kxGuavaPhone 不存在（第 2～5 項 FAIL）。用法：node tests/kx_vday_guava_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(NOODLE_CLOSED|R2Y4B|R2Y4B_EVENTS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
const {check,GM,E}=H;
load('src/noodle_closed3d.js'); load('src/data/r2y4b_events.js'); load('src/r2y4b3d.js');
const S=R2Y4B, J=JSON.stringify;
const NARR='（她從包包裡拿出一個夾鏈袋，塞進你手裡。是芭樂乾。）', SAY='高雄的。情人節的。', MSG=['芭樂乾我放在你宿舍的管理室了。','高雄的。情人節的。'];
const fresh=(key,h,flags,dating)=>{ const G=H.fresh(key,h,'campus',Object.assign({EXCHANGE_ROUTE:'TW',EXCH_RULE:1},flags||{})); G.acts={att:{}}; G.outings=[]; H.at(key,h); G.zone='campus'; if(dating!==false) H.date('kexin'); return G; };
const VIDEO={KX_VDAY:{4:'video'}};
const who={name:'杜可昕',charId:'kexin'};
const talk=async()=>{ H.said=[]; const f=STORY.PRE_TALK.find(x=>/kxGuavaFace/.test(String(x))); await f(GM,who,'kexin'); return H.said.map(s=>s.t); };
const phone=()=>{ S.phone(H.G,GM); PHONE.tick(H.G); };
const th=()=>(H.G.msgs||[]).filter(m=>m.th==='p:kexin').map(m=>m.text);
const gave=()=>H.G.flags.KX_VDAY_Y4_GIVEN;

(async()=>{
  // 1
  { const src=fs.readFileSync(path.join(H.ROOT,'src/data/r2y4a_events.js'),'utf8'), i=src.indexOf("id:'ev_kexin_valentine_y4'"), j=src.indexOf('EV.push',i+10), blk=i>0?src.slice(i,j):'';
    check('1. 情人節視訊（ev_kexin_valentine_y4）有「情人節禮物我開學給你。是吃的。」、演完記 KX_VDAY[4]=video',blk.includes("kx('情人節禮物我開學給你。是吃的。')")&&/merge\(G,'KX_VDAY',\{4:'video'\}\)/.test(blk)); }

  // 2 當面（3D 裡說話）
  check('2. 掛勾登記：STORY.PRE_TALK、INV.ON_SEATED 各一個',STORY.PRE_TALK.filter(x=>/kxGuavaFace/.test(String(x))).length===1&&INV.ON_SEATED.filter(x=>/kxGuavaFace/.test(String(x))).length===1);
  { fresh('2029-02-20',10.5,VIDEO); const L=await talk();
    check('2. 第一週週二跟她說話：旁白＋她一句（照 AA_938 第 3 節），記 face',J(L)===J([NARR,SAY])&&H.said[1].who==='杜可昕'&&H.said[0].who===null&&gave()==='face',J(H.said));
    const L2=await talk(); check('2. 再跟她說話：不再演',L2.length===0,J(L2));
    H.at('2029-02-23',21.5); phone(); check('2. 週五 21:00 以後不傳（已經給了）',!PHONE.sent(H.G,'y4_kx_vday_guava')&&!th().includes(MSG[0])&&gave()==='face',J(th())); }
  { fresh('2029-02-23',20.5,VIDEO); const L=await talk(); check('2. 週五 20:30 第一次遇到：照樣演',J(L)===J([NARR,SAY])&&gave()==='face'); }

  // 3 約好的見面
  { fresh('2029-02-21',15,VIDEO); H.said=[]; const f=INV.ON_SEATED.find(x=>/kxGuavaFace/.test(String(x)));
    await f(GM,{who:'heroine_02'},{name:'王芷若',charId:'heroine_02'}); const a=H.said.length;
    await f(GM,{who:'kexin'},who);
    check('3. 約好的見面（INV.ON_SEATED）：和別人的不演；和可昕的坐下以後演，記 face',a===0&&J(H.said.map(s=>s.t))===J([NARR,SAY])&&gave()==='face',J(H.said)); }

  // 4 第一週都沒遇到
  { fresh('2029-02-19',9,VIDEO); H.at('2029-02-23',20.9); phone();
    check('4. 週五 20:54 還不傳',!PHONE.sent(H.G,'y4_kx_vday_guava')&&!gave());
    H.at('2029-02-23',21); phone();
    check('4. 週五 21:00 她傳兩則（照 AA_938 第 3 節），記 msg',J(th().slice(-2))===J(MSG)&&PHONE.sent(H.G,'y4_kx_vday_guava')&&gave()==='msg',J(th()));
    H.at('2029-02-23',21.5); const L=await talk(); check('4. 傳了以後再遇到：不演（兩條路只走一條）',L.length===0,J(L));
    H.at('2029-02-24',10); phone(); check('4. 隔天不再傳',th().filter(t=>t===MSG[0]).length===1); }
  { fresh('2029-02-24',10,VIDEO); const L=await talk(); phone();
    check('4. 週五 21:00 以後才第一次見面（週六）：不演；她照樣傳（一則都不漏）',L.length===0&&gave()==='msg'&&th().includes(MSG[0]),J([L,th()])); }

  // 5 不演也不傳
  { fresh('2029-02-20',10,VIDEO,false); const L=await talk(); H.at('2029-02-23',21.5); phone();
    check('5. 沒在交往：不演、不傳',L.length===0&&!gave()&&!PHONE.sent(H.G,'y4_kx_vday_guava')); }
  { fresh('2029-02-20',10,{KX_VDAY:{4:'missed'}}); const L=await talk(); H.at('2029-02-23',21.5); phone();
    check('5. 情人節沒去（missed，沒聽到那一句）：不演、不傳',L.length===0&&!gave()&&!PHONE.sent(H.G,'y4_kx_vday_guava')); }
  { fresh('2029-02-20',10,{}); const L=await talk(); H.at('2029-02-23',21.5); phone();
    check('5. 沒有情人節的紀錄：不演、不傳',L.length===0&&!gave()&&!PHONE.sent(H.G,'y4_kx_vday_guava')); }
  { fresh('2029-02-18',15,VIDEO); const L=await talk();
    check('5. 開學以前（第一週週一以前）：不演',L.length===0&&!gave()); }

  console.log(H.fails?'FAILED '+H.fails:'ALL PASS'); process.exit(H.fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
