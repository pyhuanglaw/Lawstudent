// 沛珊放榜那天：交往中的版本（PS-RESULTS-1018；BB_119 1b-3、9-2；AA_276 6-2）——不需要瀏覽器。src/psresults3d.js
//   1  2027-08-06 和她交往中：10:00「你現在在哪？」→「我現在去搭客運。」「到總圖外面的台階。我中午到。」、排 12:00 總圖外面的台階（不能不去）
//   2  12:15 還沒到：「我到了。台階這邊，樹蔭下面。」
//   3  12:00 以前到：CG＋「上了。我要去當老師了。」＋PS_KEPT 那一句＋「……你幫我想想，第一堂課要講什麼。」＋三個回答（「講框外面的人。」要 NOT_FOR_ME）
//   4  12:00 以後才到、13:00 帶到場：先旁白「（八月的午後。她坐在台階上，看到你，才站起來。）」；PS_RECONNECT
//   5  沒交往、別的日子：沒有
// 修改前（開發分支 74667bd2b）：沒有 ev_peishan_results——FAIL。用法：node tests/psresults_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM,E}=H, J=JSON.stringify;
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(PSR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
let ok=true, err=''; try{ load('src/psresults3d.js'); }catch(e){ ok=false; err=String(e); }
const X=()=>typeof PSR!=='undefined'?PSR:null;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const ID='classmate_peishan', D=STORY.dayOfKey('2027-08-06');
const setup=(h,o)=>{ o=o||{}; H.fresh('2027-08-06',h,'campus',Object.assign({PS_KEPT:true},o.flags||{})); H.FRIEND(ID); if(o.dating!==false) H.G.flags['dating_'+ID]=true; };
const step=h=>{ H.G.hour=h; X().phone(H.G); PHONE.tick(H.G); };
const ev=()=>STORY_EVENTS.find(e=>e.id==='ev_peishan_results');

(async()=>{
await sec(0,()=>{ const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
  check('0. src/psresults3d.js 載得到、index.html 在 b1story3d.js 後面（中間可以有別的包）',ok&&!!X()&&html.indexOf('src/b1story3d.js')>0&&html.indexOf('src/psresults3d.js')>html.indexOf('src/b1story3d.js'),err);
  check('0. 事件 ev_peishan_results（出遊、一次）、手機規則、tick、在家的停點都接上',!!ev()&&ev().trigger==='outing'&&ev().once&&STORY.PHONE_RULES.includes(X().phone)&&STORY.TICKS.includes(X().tick)&&!!STORY._psrHome&&HOME.STOPS.length>0); });
if(!X()){ H.done(); return; }

await sec(1,()=>{ setup(9.5); step(9.9); check('1. 09:54 還沒',!H.msgs('p:'+ID).length);
  step(10); check('1. 10:00「你現在在哪？」',J(H.msgs('p:'+ID))===J(['你現在在哪？']),J(H.msgs('p:'+ID)));
  { const m=(H.G.msgs||[]).find(x=>x.text==='你現在在哪？'); check('1. 兩個選項「在家。」「在家。怎麼了？」（AA_416 第 11 節第 4 點）',!!m&&!!m.ask&&J(m.ask.opts.map(o=>o.t))===J(['在家。','在家。怎麼了？']),J(m&&m.ask)); }
  step(10.05); check('1. 10:02「我現在去搭客運。」「到總圖外面的台階。我中午到。」',J(H.msgs('p:'+ID))===J(['你現在在哪？','我現在去搭客運。','到總圖外面的台階。我中午到。']),J(H.msgs('p:'+ID)));
  const q=OUT.get(H.G,'ps_results'); check('1. 排 12:00 總圖外面的台階、不能選不去（must）',!!q&&q.day===D&&q.h===12&&q.must&&q.ev==='ev_peishan_results'&&q.place==='總圖外面的台階',J(q));
  step(12.1); check('1. 12:06 還沒有「我到了」',!H.msgs('p:'+ID).includes('我到了。台階這邊，樹蔭下面。'));
  step(12.3); check('2. 12:18 還沒到：「我到了。台階這邊，樹蔭下面。」',H.msgs('p:'+ID).includes('我到了。台階這邊，樹蔭下面。')); });

await sec(3,async()=>{ setup(11.97); await EVENTS.run(ev());
  const L=H.lines();
  check('3. 12:00 以前到：沒有「坐在台階上」的旁白',!H.has('（八月的午後。她坐在台階上，看到你，才站起來。）'),J(L));
  check('3. BCG-22（cg_results_day_peishan）放在「上了。我要去當老師了。」',H.cgs.includes('cg_results_day_peishan')&&H.has('上了。我要去當老師了。'));
  check('3. PS_KEPT：「那半年，每天晚上十一點，我都傳一則給你。……現在可以白天講了。」',H.has('那半年，每天晚上十一點，我都傳一則給你。……現在可以白天講了。'));
  check('3. 「……你幫我想想，第一堂課要講什麼。」；沒有 NOT_FOR_ME＝兩個回答',H.has('……你幫我想想，第一堂課要講什麼。')&&J(H.opts[0])===J(['「先講妳為什麼想當老師。」','「先睡覺。明天再想。」']),J(H.opts));
  check('3. 「先講妳為什麼想當老師。」→「……好。那我第一堂就講這個。講不好的話，第二堂再講一次。」',H.has('……好。那我第一堂就講這個。講不好的話，第二堂再講一次。'));
  check('3. 演完：PS_RESULTS met、PS_RECONNECT',H.G.flags.PS_RESULTS==='met'&&H.G.flags.PS_RECONNECT===true);
  setup(11.97); SOCIAL.remember(ID,'NOT_FOR_ME','三段論那天'); H.picks=['框外面']; await EVENTS.run(ev());
  check('3. 有 NOT_FOR_ME：三個回答；「講框外面的人。」→「……你還記得。好。那第一堂課，我先畫三個框。」',H.opts[0].length===3&&H.has('……你還記得。好。那第一堂課，我先畫三個框。'),J(H.opts));
  setup(11.97); H.picks=['先睡覺']; await EVENTS.run(ev()); check('3. 「先睡覺。明天再想。」→「好。……睡不著。我要先去跟早餐店的牆說。」',H.has('好。……睡不著。我要先去跟早餐店的牆說。')); });

await sec(4,async()=>{ setup(12.4); await EVENTS.run(ev());
  check('4. 12:24 才到：先旁白「（八月的午後。她坐在台階上，看到你，才站起來。）」，再「上了。」',H.said[0]&&H.said[0].who===null&&H.said[0].t==='（八月的午後。她坐在台階上，看到你，才站起來。）'&&H.has('上了。我要去當老師了。'),J(H.lines()));
  setup(9.5); step(10.05); H.G.hour=12.9; check('4. 12:54 還不帶到場',!X().bringDue(H.G));
  H.G.hour=13; check('4. 13:00 還沒到：帶到場',X().bringDue(H.G));
  check('4. 在家的選單也接得到（y4HomeDue＝psr_bring）',STORY.y4HomeDue(H.G)==='psr_bring');
  const st=[].concat(...HOME.STOPS.map(f=>{ try{ return [].concat(f(H.G,H.G.day*24+H.G.hour)||[]); }catch(e){ return []; } })); check('4. 放假在家的快轉停在 10:00、12:15、13:00',[10,12.25,13].every(h=>st.includes(D*24+h)),J(st.filter(v=>v>=D*24&&v<D*24+24)));
  await X().bring(GM); const q=OUT.get(H.G,'ps_results');
  check('4. 帶到場：旁白＋「上了。」、出遊記成 done、PS_RESULTS brought、PS_RECONNECT',H.has('（八月的午後。她坐在台階上，看到你，才站起來。）')&&H.has('上了。我要去當老師了。')&&q.state==='done'&&H.G.flags.PS_RESULTS==='brought'&&H.G.flags.PS_RECONNECT===true,J(H.lines()));
  check('4. 演完不再帶第二次',!X().bringDue(H.G)); });

await sec(5,()=>{ setup(10.1,{dating:false}); step(10.1); check('5. 沒交往：10:00 沒有她的訊息、沒有排出遊',!H.msgs('p:'+ID).length&&!OUT.get(H.G,'ps_results'));
  H.fresh('2027-08-05',10.1,'campus',{PS_KEPT:true}); H.G.flags['dating_'+ID]=true; X().phone(H.G); PHONE.tick(H.G); check('5. 前一天：沒有',!H.msgs('p:'+ID).length);
  setup(9); H.G.stage='econ'; X().phone(H.G); H.G.hour=10.2; X().phone(H.G); PHONE.tick(H.G); check('5. 不是法律系的局：沒有',!H.msgs('p:'+ID).length); });

H.done();
})();
