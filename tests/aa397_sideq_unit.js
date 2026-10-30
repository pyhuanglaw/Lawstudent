// AA_397 店員的支線「順手的事」＋公園的貓被子晴收養（企劃線 8f1701b23；任務 SIDEQ-AA397-1023）——不需要瀏覽器。
//   0  新檔載得到、index.html 接在 kx_khh3d.js 後面；每一句台詞、旁白、選項都在稿裡（一字不差；ZQ_CAT_SAID 那句在 AA_400 ce4f34378；第二、三批加進 SIDEQ.LINES 以後，稿也包含 AA_404、AA_405、AA_408 第 6 節 b0b80a54）
//   1  系統：店員認得你（第 5 次）才出；「要我幫忙嗎？」掛進手機「今天」的「順手的事」；「……加油。」不掛、這學期不再出（下學期會）；一天一則；
//      一家店同時一則；同時最多兩則；過期＝lapsed、不扣數值；舊存檔沒有 G.side 不壞
//   2  SQ01～SQ08 各則：照步驟做完、做完的痕跡（店員多一句、店裡的變化、相簿）；接線（林家 order364、118 巷 L118.order、便利商店 counter、公布欄、象棋、蘇姨、冰菓室的價目板）
//   3  公園的貓：SQ08 餵貓表 → 大三上第 10 週貓不見（照舊；AA_420 6-1）→ 寒流（12/11～12/14：石桌下、只能看、表上「沒吃」）→ 12/14 22:10 那一場（認識子晴、熟悉以上、在公園）
//      → 12/15 照片 → 12/17 領養告示；不在場＝告示＋象棋阿伯一句；收養以後摸／餵拿掉、「看圓椅」一次；2029 每月第一個週六六則照片；交往中「去看貓」
// 修改前（開發分支 c822b4efc）：沒有 src/sideq3d.js、PARK 沒有 catCold／catGone、商店沒有接線——全部 FAIL。用法：node tests/aa397_sideq_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, ZQ='heroine_04', J=JSON.stringify;
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(EAT|EAT_LINES|WZS|L118|LANE118_SHOPS|LANE118_LAYOUT|PARK|WZ_PARK_LAYOUT|SIDEQ|ZQTB|MSG|MSG_POOL|MSG2_POOL)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/data/eat_lines.js','src/eat3d.js','src/data/lane118_layout.js','src/data/lane118_shops.js','src/lane118.js','src/data/wz_park_layout.js','src/wzpark3d.js','src/wzshops3d.js']) load(f);
let ok=true, err=''; try{ load('src/sideq3d.js'); }catch(e){ ok=false; err=String(e); }
const X=()=>typeof SIDEQ!=='undefined'?SIDEQ:null;
const D=k=>STORY.dayOfKey(k), keyOf=d=>CALENDAR.dateOf(d).key;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const has=t=>H.said.some(x=>x.t===t), idx=t=>H.said.findIndex(x=>x.t===t), seq=a=>a.every((t,i)=>idx(t)>=0&&(i===0||idx(t)>idx(a[i-1])));
const said=()=>H.said.map(x=>(x.who?x.who+'：':'')+x.t);
let money=[]; GM.money=d=>{ money.push(d); H.G.money+=d; };
const set=(key,h,zone)=>{ const d=D(key); H.G.day=d; H.G.hour=h; H.G.weekday=CALENDAR.dateOf(d).wd%7; if(zone) H.G.zone=zone; };
const fresh=(key,h,zone,flags)=>{ const G=H.fresh(key,h,zone||'wenzhou',Object.assign({EXCHANGE_ROUTE:'TW'},flags||{})); G.outings=[]; set(key,h,zone||'wenzhou'); money=[]; if(X()) X().roll=()=>0; return G; };
const know=(key,n)=>{ EAT.rec(H.G).n[key]=n==null?4:n; };   /* 這一次點完＝第 n+1 次 */
const shop=async(key,picks,o)=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); EAT.rec(H.G).n[key]=(EAT.rec(H.G).n[key]|0)+1; return X().atShop(GM,key,o||{item:'x',price:0}); };
const R=id=>X().get(H.G,id);
const here=(id)=>{ const n={name:SOCIAL.displayName(id),charId:id,obj:{position:{x:0,y:0,z:0}}}; GM.npc[id]=n; E.npcs.push(n); return n; };
const goOut=async(id,picks)=>{ const q=OUT.get(H.G,id); H.said=[]; H.opts=[]; H.picks=picks||[]; if(!q) return false; set(keyOf(q.day),q.h,H.G.zone); await OUT.go(GM,q); return true; };
const ph=()=>{ X().phone(H.G); PHONE.tick(H.G); };
const zqMsgs=()=>(H.G.msgs||[]).filter(m=>m.th==='p:'+ZQ).map(m=>m.text);
const inPark=()=>{ const L=WZ_PARK_LAYOUT.area.back; E.player.obj.position.x=(L.x0+L.x1)/2; E.player.obj.position.z=(L.z0+L.z1)/2+1; return PARK.inPark(E.player.obj.position.x,E.player.obj.position.z); };

(async()=>{
let doc='', doc400='', doc408=''; try{ doc408=cp.execSync('git show 29e41dd8:"docs/story_planning/AA_408_店員支線補字_回LAWWW實作問題.md"',{cwd:H.ROOT,encoding:'utf8'}); doc=cp.execSync('git show 8f1701b23:"docs/story_planning/AA_397_店員的支線_順手的事.md"',{cwd:H.ROOT,encoding:'utf8'})+doc408
  +cp.execSync('git show 30bf21de8:"docs/story_planning/AA_404_店員的支線_第二批.md"',{cwd:H.ROOT,encoding:'utf8'})+cp.execSync('git show f923751c:"docs/story_planning/AA_405_店員的支線_第三批.md"',{cwd:H.ROOT,encoding:'utf8'})
    +cp.execSync('git show b0b80a54:"docs/story_planning/AA_408_店員支線補字_回LAWWW實作問題.md"',{cwd:H.ROOT,encoding:'utf8'})
    +cp.execSync('git show ee0d6b70d:"docs/story_planning/AA_465_法律系大四下讀一遍_畢業那一週的家人群組_子晴的貓_八學期總清單.md"',{cwd:H.ROOT,encoding:'utf8'})   /* AA_465 第 2 節：貓的第 6 張照片換字 */
    +cp.execSync('git show 33189103b:"docs/story_planning/AA_498_法律系同學二十位_共同做法_改名_第一批五位.md"',{cwd:H.ROOT,encoding:'utf8'});   /* AA_498 第 1 節：SQ16 借車名單裡和 pool 撞名的兩個名字換成黃惠玲、鄭文彬 */   /* 第二、三批（SQ10～SQ20）的稿也在 SIDEQ.LINES 裡：逐字對稿在 tests/aa404_sideq_unit.js（AA_408 第 6 節的缺字在 b0b80a54）*/ doc400=cp.execSync('git show ce4f34378:"docs/story_planning/AA_400_子晴的測試版_HOOK_ZQ_GAME.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){}
/* ---- 0 ---- */
await sec(0,()=>{ const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
  check('0. 新檔載得到、index.html 接在 kx_khh3d.js 後面',ok&&!!X()&&/kx_khh3d\.js\?v=[^"]+"><\/script>\n<script src="src\/sideq3d\.js\?v=[^"]+"><\/script>/.test(html),err);
  const out=[]; const walk=v=>{ if(v==null) return; if(typeof v==='string'){ if(!/^[a-z_0-9]+$/.test(v)) out.push(v); } else if(Array.isArray(v)) v.forEach(walk); else if(typeof v==='object') for(const k in v) if(k!=='k') walk(v[k]); };
  walk(X().LINES); walk([X().YES,X().NO]); for(const k of ['CAT_COLD','CAT_FUR','ADOPT_CHESS','ADOPT_NOTICE']) walk(PARK.LINES[k]);
  for(const l of X().CAT_EV.dialogue){ if(l.text&&!/你說過是牠/.test(l.text)) out.push(l.text); if(l.choice) for(const c of l.choice) out.push(c.text); }
  for(const e of [X().FAFU_EV,X().POLICE_EV,X().CLUB_EV,X().SIS_EV]) for(const l of e.dialogue) if(l.text) out.push(l.text);
  out.push('（去看貓）');
  const segs=t=>String(t).replace(/\{cat\}/g,'').split(/[（）「」]/).map(x=>x.replace(/^[。，：、]+|[。，：]+$/g,'').trim()).filter(x=>x.length>=2&&!/^[★☆]+$/.test(x));
  const miss=[...new Set(out)].filter(t=>segs(t).some(s=>doc.indexOf(s)<0));
  check('0. 每一句台詞、旁白、選項都在 AA_397＋AA_408 稿裡（一字不差）',!!doc408&&!!doc&&out.length>70&&!miss.length,out.length+' '+J(miss));
  const said400=X().CAT_EV.dialogue.find(l=>/你說過是牠/.test(l.text||''));
  check('0. ZQ_CAT_SAID 那一句照 AA_400（ce4f34378）',!!said400&&doc400.indexOf(said400.text)>=0&&J(said400.if)===J({flags:['ZQ_CAT_SAID']}));
  check('0. SQ02、SQ04 的法律句子標 LEGAL_REVIEW_REQUIRED',(fs.readFileSync(path.join(H.ROOT,'src/sideq3d.js'),'utf8').match(/LEGAL_REVIEW_REQUIRED/g)||[]).length>=4); });
/* ---- 1 系統 ---- */
await sec(1,async()=>{ fresh('2026-10-05',12,'wz_lin');   /* 大二上 */
  know('林家乾麵',3); let r=await shop('林家乾麵',[0]);
  check('1. 第 4 次（店員還不認得你）：不出',!r&&!R('SQ01')&&!H.said.length);
  r=await shop('林家乾麵',[1]);
  check('1. 第 5 次：老闆「有人給我一顆星。說湯是冷的。」「……我們乾麵沒有湯。」→「要我幫忙嗎？」／「……加油。」',seq(['有人給我一顆星。說湯是冷的。','……我們乾麵沒有湯。'])&&H.said[0].who==='老闆'&&J(H.opts[0])===J(['「要我幫忙嗎？」','「……加油。」']),J(said()));
  check('1. 「……加油。」：不掛（declined、記學期）；手機「今天」沒有「順手的事」',R('SQ01').state==='declined'&&R('SQ01').term==='Y2S1'&&!X().openIds(H.G).length&&X().todayHTML(H.G)==='');
  set('2026-10-06',12); r=await shop('林家乾麵',[0]); set('2026-11-20',12); const r2=await shop('林家乾麵',[0]);
  check('1. 同一學期：隔天、一個多月後都不再出',!r&&!r2&&R('SQ01').state==='declined');
  set('2027-03-01',12); r=await shop('林家乾麵',[0,0]);
  check('1. 下學期（大二下）會再出；「要我幫忙嗎？」→ 掛進（open）；toast；手機「今天」有「順手的事」那一格、標題',!!r&&R('SQ01').state==='open'&&/順手的事/.test(X().todayHTML(H.G))&&/林家乾麵：一星評價/.test(X().todayHTML(H.G)),J(R('SQ01')));
  /* 一天一則：同一天別家店 */
  fresh('2026-10-05',12); know('巷口茶飲',4); know('林家乾麵',4); await shop('林家乾麵',[1]); H.said=[]; r=await shop('巷口茶飲',[0]);
  check('1. 一天最多問一次（同一天別家店不再出）',!r&&!R('SQ02'));
  /* 偶爾：roll 沒中＝不出 */
  fresh('2026-10-05',12); X().roll=()=>0.9; know('林家乾麵',4); r=await shop('林家乾麵',[0]); check('1. 偶爾：沒抽中＝不出、之後還會出',!r&&!R('SQ01')); X().roll=()=>0;
  /* 一家店同時一則（另外掛一則同一家店的假任務）*/
  fresh('2026-10-05',12); know('林家乾麵',4); await shop('林家乾麵',[0,0]); X().Q.SQTEST={shop:'林家乾麵',title:'x',avail:()=>true,accept:async()=>{}}; const one=X().canOffer(H.G,'SQTEST'); delete X().Q.SQTEST;
  check('1. 一家店同時只掛一則',R('SQ01').state==='open'&&!one);
  /* 同時最多兩則 */
  set('2026-10-06',12); know('巷口茶飲',4); await shop('巷口茶飲',[0,0]); set('2026-10-07',12); know('好家自助餐',4); r=await shop('好家自助餐',[0]);
  check('1. 同時最多兩則（已經兩則：第三家不出）',X().openIds(H.G).length===2&&!R('SQ06')&&!r,J(X().openIds(H.G)));
  check('1. 手機「今天」兩則都在、寫下一步',(X().todayHTML(H.G).match(/☐/g)||[]).length===2&&/帶去法服問/.test(X().todayHTML(H.G)));
  /* 過期：不扣數值 */
  fresh('2027-07-10',14,'wenzhou'); know('夏日冰菓室',4); await shop('夏日冰菓室',[0]); const r3=R('SQ03'), rel0=J(H.G.social.rel||{}), m0=H.G.money;
  check('1. SQ03 掛進：期限這個禮拜內（手機「今天」寫到期日）',r3&&r3.state==='open'&&r3.by===D('2027-07-17')&&/這個禮拜內（到 7\/17）/.test(X().todayHTML(H.G)),J(r3));
  set('2027-07-18',14); X().lapse(H.G);
  check('1. 過了期限＝lapsed（不扣錢、不動關係）；手機「今天」不再列',R('SQ03').state==='lapsed'&&H.G.money===m0&&J(H.G.social.rel||{})===rel0&&X().todayHTML(H.G)===''&&!X().canOffer(H.G,'SQ03'));
  /* 舊存檔 */
  const G=fresh('2026-10-05',12); delete G.side; check('1. 舊存檔（沒有 G.side）：手機「今天」不壞、點餐不壞、G.side 補成空物件',X().todayHTML(G)===''&&(await shop('林家乾麵',[1]),true)&&typeof G.side==='object'); });
/* ---- 2 各則 ---- */
await sec('2 SQ01',async()=>{ fresh('2026-03-03',12,'wz_lin'); know('林家乾麵',4);   /* 大一下起（林家週一公休：3/3 週二）*/
  H.said=[]; H.opts=[]; H.picks=[0,0,0]; await WZS.order364(GM,'lin');   /* 真的點餐（乾麵（小））→ 偶爾那一句 → 要我幫忙嗎 → 三選一 */
  check('2. SQ01 從林家點餐出現（order364 接線）；三選一照稿',R('SQ01')&&R('SQ01').state==='open'&&J(H.opts[2])===J(['「謝謝指教，乾麵本來就沒有湯，下次可以點餛飩湯。」','「您點的是乾麵。」','不回。'])&&R('SQ01').reply==='polite',J(H.opts));
  H.said=[]; await shop('林家乾麵',[0]); check('2. SQ01 同一天再去：還沒有結果',R('SQ01').state==='open'&&!H.said.length);
  set('2026-03-04',12); await shop('林家乾麵',[0]);
  check('2. SQ01 第二天以後：「★★★★☆　原來乾麵沒有湯，是我點錯了。老闆回得好有禮貌。」＋（他的上一則評價寫的是：『大一，第一次自己來公館吃飯。』）（AA_408）；做完；相簿一頁',seq(['★★★★☆　原來乾麵沒有湯，是我點錯了。老闆回得好有禮貌。','（他的上一則評價寫的是：『大一，第一次自己來公館吃飯。』）'])&&R('SQ01').state==='done'&&(H.G.album||[]).some(a=>a.id==='side_SQ01'&&a.title==='林家乾麵：一星評價'),J(said()));
  set('2026-03-05',12); H.said=[]; H.opts=[]; H.picks=[0]; await WZS.order364(GM,'lin'); const g1=H.said[0]&&H.said[0].t;
  set('2026-03-06',12); H.said=[]; H.opts=[]; H.picks=[0]; await WZS.order364(GM,'lin'); const g2=H.said[0]&&H.said[0].t;
  check('2. SQ01 痕跡：做完以後的下一次，老闆招呼「小的，不加辣。……字是我寫的，醜。」（一次）；之後照舊',g1==='小的，不加辣。……字是我寫的，醜。'&&g2!==g1,J([g1,g2]));
  H.said=[]; await WZS.interact(GM,{wzShop:'lin',kind:'menu'}); check('2. SQ01 痕跡：看菜單多一行「乾麵沒有湯」',has(WZS.AA364.lin.wall)&&has('「乾麵沒有湯」'));
  for(const [k,want] of [[1,['★★☆☆☆　好吧。']],[2,['（隔天，評價下面多了一則老闆的回覆，三個字：『沒有湯。』）']]]){ fresh('2026-03-03',12,'wz_lin'); know('林家乾麵',4); await shop('林家乾麵',[0,k]); set('2026-03-04',12); await shop('林家乾麵',[0]);
    check('2. SQ01 選「'+['','您點的是乾麵。','不回。'][k]+'」：'+want.join(''),seq(want)&&R('SQ01').state==='done',J(said())); } });
await sec('2 SQ02',async()=>{ fresh('2026-10-05',15,'wenzhou'); know('巷口茶飲',4); await shop('巷口茶飲',[0,0]);
  const q=(H.G.outings||[]).find(x=>x.ev==='ev_sq02_fafu');
  check('2. SQ02 開頭：（她把一張紙壓在收銀機下面。）、店員那句；選「要不要帶去法服問？」→ 排下一次法服初談（單週六上午、萬才館）',seq(['（她把一張紙壓在收銀機下面。）','老闆說上禮拜打破的杯子，要從我薪水扣。三個，四百五。'])&&J(H.opts[1])===J(['「要不要帶去法服問？」','「妳自己覺得呢？」'])&&!!q&&CALENDAR.dateOf(q.day).wd===6&&STORY.fafuDuty(Object.assign({},H.G,{day:q.day}))&&R('SQ02').step==='fafu',J(q));
  await goOut(q.id,[]);
  check('2. SQ02 法服：萬才館・研討室；值班的學長「可以先跟老闆好好談；需要的話，勞工局有免費的諮詢。」',H.said.some(s=>s.who==='值班的學長'&&s.t==='可以先跟老闆好好談；需要的話，勞工局有免費的諮詢。')&&R('SQ02').step==='wait',J(said()));
  set(keyOf(q.day+1),15); money=[]; await shop('巷口茶飲',[0],{item:'紅茶',price:30});
  check('2. SQ02 之後去茶飲：老闆那句（旁白）、「半糖少冰，對吧。……今天不算錢。」、這一杯退錢；做完',seq(['（她回去跟老闆說了。老闆說：「我只是嚇嚇妳，誰叫妳一直講手機。」最後沒扣。）','半糖少冰，對吧。……今天不算錢。'])&&J(money)===J([30])&&R('SQ02').state==='done',J([said(),money]));
  set(keyOf(q.day+2),15); await shop('巷口茶飲',[0]); check('2. SQ02 痕跡：（櫃台貼了一張「工作中手機請放後面」——她自己貼的。）一次',has('（櫃台貼了一張「工作中手機請放後面」——她自己貼的。）'));
  set(keyOf(q.day+3),15); await shop('巷口茶飲',[0]); check('2. SQ02 痕跡只一次',!H.said.length);
  fresh('2026-10-05',15,'wenzhou'); know('巷口茶飲',4); await shop('巷口茶飲',[0,0]); const q2=(H.G.outings||[]).find(x=>x.ev==='ev_sq02_fafu'); q2.state='missed'; OUT.onMissed(GM,q2);
  check('2. SQ02 法服那天沒去＝lapsed（不扣數值）',R('SQ02').state==='lapsed'); });
await sec('2 SQ03',async()=>{ fresh('2027-07-10',14,'wenzhou'); know('夏日冰菓室',4); await shop('夏日冰菓室',[0]);
  const it=WZS.windowItems().find(i=>i.label==='看價目板'); global.GAME={G:H.G};
  check('2. SQ03 老闆娘「價目板曬到看不到了。你們讀書人字好看，幫我寫一下。」；窗口多「看價目板」（掛著才有）',has('價目板曬到看不到了。你們讀書人字好看，幫我寫一下。')&&H.said[0].who==='老闆娘'&&!!it&&!it.hidden);
  SOCIAL.rel('heroine_01').fam=30; SOCIAL.remember('heroine_01','FIRST_MET',''); here('heroine_01'); const f0=SOCIAL.rel('heroine_01').fam;
  H.said=[]; H.opts=[]; H.picks=[1]; await WZS.interact(GM,it);
  check('2. SQ03 以安在溫州街：選「讓以安寫」→「今年芒果貴。……」、（價目板是新的，芒果冰的價錢是舊的。）；以安熟悉 +2；做完；按鈕藏起來',J(H.opts[0])===J(['自己寫','讓以安寫'])&&seq(['今年芒果貴。……可是寫上去不好看，你寫原來的價錢。','（價目板是新的，芒果冰的價錢是舊的。）'])&&SOCIAL.rel('heroine_01').fam===f0+2&&R('SQ03').state==='done'&&R('SQ03').writer==='heroine_01'&&it.hidden,J(said()));
  set('2027-08-01',14); await shop('夏日冰菓室',[0]); const same=has('……字還在。');
  set('2028-07-05',14); await shop('夏日冰菓室',[0]); const y2=has('……字還在。'); set('2028-07-20',14); await shop('夏日冰菓室',[0]); const y2b=has('……字還在。');
  check('2. SQ03 痕跡：以安寫的那一版，之後每年夏天她在溫州街「……字還在。」（一年一次；當年不說）',!same&&y2&&!y2b);
  fresh('2027-07-10',14,'wenzhou'); know('夏日冰菓室',4); await shop('夏日冰菓室',[0]); H.said=[]; H.opts=[]; await X().iceBoard(GM);
  check('2. SQ03 以安不在：自己寫（不問）',!H.opts.length&&R('SQ03').writer==='me'&&R('SQ03').state==='done'); delete global.GAME;
  fresh('2027-03-10',14,'wenzhou'); know('夏日冰菓室',4); check('2. SQ03 大二暑假以前、9 月不出',!X().canOffer(H.G,'SQ03')&&(set('2027-09-02',14),!X().canOffer(H.G,'SQ03'))); });
await sec('2 SQ04',async()=>{ fresh('2027-03-03',11,'l118_cafe2'); know('慢讀咖啡',4); await shop('慢讀咖啡',[0,1]);
  check('2. SQ04 開頭：（店長把一台筆電放在吧檯上。）「這台放在插座那一桌三個禮拜了。」「……要怎麼辦。」；選「再等一下？」＝「……已經三個禮拜了。」「好，再一個禮拜。」（AA_408）還掛著',seq(['（店長把一台筆電放在吧檯上。）','這台放在插座那一桌三個禮拜了。','……要怎麼辦。','……已經三個禮拜了。','好，再一個禮拜。'])&&J(H.opts[1])===J(['「交給派出所。」','「再等一下？」'])&&R('SQ04').step==='again',J(said()));
  set('2027-03-05',11); H.said=[]; await shop('慢讀咖啡',[0]); const early4=!(H.G.outings||[]).some(x=>x.ev==='ev_sq04_police')&&!has('還是沒人來拿。');
  set('2027-03-10',11); H.said=[]; await shop('慢讀咖啡',[0]); const q=(H.G.outings||[]).find(x=>x.ev==='ev_sq04_police');
  check('2. SQ04 一週以內再去：沒事；一週以後：店長「還是沒人來拿。」→ 直接排派出所（2D，不再問）',early4&&has('還是沒人來拿。')&&!H.opts.length&&!!q&&q.place==='派出所'&&R('SQ04').step==='police');
  await goOut(q.id,[]); check('2. SQ04 派出所：（警察登記，說會找失主。）；等兩個禮拜',has('（警察登記，說會找失主。）')&&R('SQ04').step==='wait'&&R('SQ04').wait===D('2027-03-10')+14);
  set('2027-03-17',11); await shop('慢讀咖啡',[0]); const early=R('SQ04').state; set('2027-03-25',11); await shop('慢讀咖啡',[0]);
  check('2. SQ04 兩個禮拜以後：國考生來道謝、店長幫他留位子；做完（之前不演）',early==='open'&&seq(['（兩個禮拜後，一個很瘦的男生來店裡道謝。他是國考生，那天胃出血被送急診，住院兩週。筆電裡是他三年的筆記。）','（他每天來同一個插座位子讀書，店長幫他留。）'])&&R('SQ04').state==='done');
  set('2027-03-26',11); await shop('慢讀咖啡',[0]); const c=has('（那個插座位子的桌上，多了一張手寫的小卡「謝謝」。）');
  set('2027-12-01',11); await shop('慢讀咖啡',[0]); const p0=has('（牆上多了一張剪報大小的紙：「榜單影本」。）'); set('2028-01-20',11); await shop('慢讀咖啡',[0]); const p1=has('（牆上多了一張剪報大小的紙：「榜單影本」。）');
  check('2. SQ04 痕跡：小卡「謝謝」；十個月以後「榜單影本」',c&&!p0&&p1);
  fresh('2027-03-03',11,'l118_cafe2'); know('慢讀咖啡',4); H.said=[]; H.opts=[]; H.picks=[0,0,0]; H.G.hour=11; await L118.order(GM,'cafe2');
  check('2. SQ04 從 118 巷點餐出現（L118.order 接線）',!!R('SQ04')&&R('SQ04').step==='police',J(said())); });
await sec('2 SQ05',async()=>{ fresh('2027-10-04',12,'l118_noodle2'); know('六張犁麵舖',4); PHONE.join(H.G,'noodle_team','麵店團'); SOCIAL.remember('zhe','FIRST_MET','');
  await shop('六張犁麵舖',[0,1]); const r=R('SQ05');
  check('2. SQ05 老闆「膝蓋要開刀。要休兩個禮拜。」「……公休的紙，你幫我寫，寫得好看一點。」；三種寫法（日期填進去）',seq(['膝蓋要開刀。要休兩個禮拜。','……公休的紙，你幫我寫，寫得好看一點。'])&&J(H.opts[1])===J(['「老闆去修膝蓋，兩週後見。」','「本店公休至10月18日。」','「休息一下，大碗加蛋等你。」'])&&r.note==='本店公休至10月18日。'&&r.zhe,J(H.opts));
  set('2027-10-06',12); const closed=!L118.isOpen('noodle2',H.G); H.said=[]; H.opts=[]; await L118.order(GM,'noodle2');
  check('2. SQ05 公休那兩週：關門；去點餐＝門上那張紙「本店公休至10月18日。」',closed&&H.said.length===1&&H.said[0].t==='「本店公休至10月18日。」'&&!H.opts.length);
  set('2027-10-05',20.5); ph(); const m=(H.G.msgs||[]).filter(x=>x.th==='g:noodle_team').map(x=>x.text);
  check('2. SQ05 答應那天 21:00 阿哲揪簽卡片（三則）；開刀那天 20:00 阿哲傳病床的照片「老闆說，這個沒有他煮的好吃」（AA_408）',J(m)===J(['六張犁的老闆要去開膝蓋！','我買了一張卡片，明天中午A館一樓，大家來簽','我帶彩色筆','（照片：病床旁的小桌，卡片立著，旁邊一碗醫院的稀飯）','老闆說，這個沒有他煮的好吃'])&&(H.G.msgs||[]).filter(x=>x.th==='g:noodle_team').every(x=>x.from==='zhe'||x.from==='yu'),J(m));
  set('2027-10-19',12); const op=L118.isOpen('noodle2',H.G); money=[]; await shop('六張犁麵舖',[0],{item:'大碗',price:90});
  check('2. SQ05 重新開店：「大碗加蛋。……今天不收錢。」、退錢；做完',op&&has('大碗加蛋。……今天不收錢。')&&J(money)===J([90])&&R('SQ05').state==='done');
  set('2027-10-20',12); await shop('六張犁麵舖',[0]); check('2. SQ05 痕跡（有阿哲的）：（卡片貼在煮麵台旁邊的牆上。）',has('（卡片貼在煮麵台旁邊的牆上。）'));
  fresh('2027-10-04',12,'l118_noodle2'); know('六張犁麵舖',4); await shop('六張犁麵舖',[0,0]); set('2027-10-05',20.5); ph(); set('2027-10-19',12); await shop('六張犁麵舖',[0]); set('2027-10-20',12); await shop('六張犁麵舖',[0]);
  check('2. SQ05 沒有阿哲：沒有病床的照片、沒有卡片；照樣重新開店、做完',!(H.G.msgs||[]).some(x=>/病床/.test(x.text))&&!has('（卡片貼在煮麵台旁邊的牆上。）')&&R('SQ05').state==='done');
  fresh('2027-03-04',12,'l118_noodle2'); know('六張犁麵舖',4); check('2. SQ05 只在大三上',!X().canOffer(H.G,'SQ05')); });
await sec('2 SQ06',async()=>{ fresh('2026-10-05',12,'l118_self'); know('好家自助餐',4); SOCIAL.remember('classmate_mingxuan','FIRST_MET',''); H.rel(ZQ,25,0,0);
  await shop('好家自助餐',[0]); const r=R('SQ06');
  check('2. SQ06 阿姨「我孫子國二，數學不及格。」「你們有沒有同學在當家教？」；認識明軒＝明軒當家教',seq(['我孫子國二，數學不及格。','你們有沒有同學在當家教？'])&&H.said[0].who==='阿姨'&&r.tutor==='classmate_mingxuan');
  set('2026-10-08',21.2); ph(); const m=(H.G.msgs||[]).filter(x=>x.th==='p:classmate_mingxuan').map(x=>x.text); ph();
  check('2. SQ06 第一次上課以後：明軒「他上課一直在桌子底下彈手指。」',m.includes('他上課一直在桌子底下彈手指。')&&R('SQ06').step==='twist',J(m));
  set('2026-10-09',12); await shop('好家自助餐',[0]); const q=(H.G.outings||[]).find(x=>x.ev==='ev_sq06_club');
  check('2. SQ06 意外：（孫子想學的是吉他…）；認識子晴＝可以帶他去吉他社社課（下一次社課）',has('（孫子想學的是吉他，不是數學。他在網路上看了吉他社成發的影片。）')&&!!q&&q.h===19&&R('SQ06').step==='club',J([said(),q]));
  const f0=SOCIAL.rel(ZQ).fam; await goOut(q.id,[]);
  check('2. SQ06 社課：子晴「……國二？我國二的時候也只會 C。」；熟悉 +2；做完',has('……國二？我國二的時候也只會 C。')&&SOCIAL.rel(ZQ).fam===f0+2&&R('SQ06').state==='done');
  set('2026-12-20',12); await shop('好家自助餐',[0]); const same=has('我孫子數學及格了。……吉他也是。'); set('2027-03-03',12); await shop('好家自助餐',[0]); const nx=has('我孫子數學及格了。……吉他也是。');
  set('2027-03-04',12); await shop('好家自助餐',[0]);
  check('2. SQ06 痕跡：下一個學期起阿姨結帳多一句「我孫子數學及格了。……吉他也是。」（一次）',!same&&nx&&!has('我孫子數學及格了。……吉他也是。'));
  fresh('2026-10-05',12,'l118_self'); know('好家自助餐',4); await shop('好家自助餐',[0]); const t=R('SQ06').tutor; set('2026-10-08',21.2); ph(); set('2026-10-09',12); await shop('好家自助餐',[0]);
  check('2. SQ06 都不認識、不認識子晴：自己去；（家教跟阿姨說了，阿姨買了一把二手吉他。）做完',t==='me'&&seq(['（孫子想學的是吉他，不是數學。他在網路上看了吉他社成發的影片。）','（家教跟阿姨說了，阿姨買了一把二手吉他。）'])&&R('SQ06').state==='done'); });
await sec('2 SQ07',async()=>{ fresh('2028-03-01',12,'l118_omu'); know('蛋包飯研究所',4); H.FRIEND('heroine_05'); await shop('蛋包飯研究所',[0,2]);
  check('2. SQ07 店員「跟你說，我要考研究所。真的那種。」「讀書計畫寫好了，…」；和學姊朋友以上多一個選項；選它＝找學姊',seq(['跟你說，我要考研究所。真的那種。','讀書計畫寫好了，你幫我看。你們法律系的會挑毛病。'])&&J(H.opts[1])===J(['「第二段太長。」','「我看不懂第三段。」','「我認識一個人，很會看這個。」'])&&R('SQ07').step==='sis',J(H.opts));
  set('2028-03-03',15,'cafe'); const n=here('heroine_05'); const f0=SOCIAL.rel('heroine_05').fam; const due=X().sisDue(GM); H.said=[]; await EVENTS.run(X().SIS_EV);
  check('2. SQ07 學姊在 Café：「她第三段想說的，第一句就要說。」；熟悉 +2',due&&has('她第三段想說的，第一句就要說。')&&SOCIAL.rel('heroine_05').fam===f0+2&&R('SQ07').step==='wait'&&!X().sisDue(GM));
  set('2028-03-30',12,'l118_omu'); await shop('蛋包飯研究所',[0]); const a=has('（她考上了，可是要搬去台中。）'); set('2028-04-02',12); await shop('蛋包飯研究所',[0]); const b=R('SQ07').state; set('2028-04-07',12); await shop('蛋包飯研究所',[0]);
  check('2. SQ07 意外（她考上了、要搬去台中）→ 一個禮拜後最後一天：蛋包飯、「本所所長要畢業了。」做完',a&&b==='open'&&seq(['（最後一天她煎了一個寫著你名字的蛋包飯（番茄醬寫的字）。）','本所所長要畢業了。'])&&R('SQ07').state==='done');
  set('2028-04-08',12); await shop('蛋包飯研究所',[0]); const bd=has('（店門口的小黑板：「本所所長赴台中深造。新所長培訓中。」）'); set('2028-04-09',12); await shop('蛋包飯研究所',[0]);
  check('2. SQ07 痕跡：小黑板；新的店員「我是新所長。……還在培訓。」',bd&&has('我是新所長。……還在培訓。'));
  fresh('2028-03-01',12,'l118_omu'); know('蛋包飯研究所',4); await shop('蛋包飯研究所',[0,0]);
  check('2. SQ07 和學姊不熟：只有兩個選項',H.opts[1].length===2&&R('SQ07').step==='wait');
  fresh('2028-03-01',12,'l118_omu'); know('蛋包飯研究所',4); H.FRIEND('heroine_05'); await shop('蛋包飯研究所',[0,2]); set('2028-03-20',12); X().lapse(H.G);
  check('2. SQ07 兩個禮拜都沒遇到學姊：不過期，照自己看往下',R('SQ07').state==='open'&&R('SQ07').step==='wait'); });
await sec('2 SQ08',async()=>{ fresh('2026-10-05',21,'gongguan'); PARK.rec(H.G).catName='麻糬'; H.G.daily.catCansN=2; know('公館的便利商店',4);
  check('2. SQ08 第二罐以前不出；白天不出（夜班）',!X().canOffer(H.G,'SQ08')&&(EAT.rec(H.G).n['公館的便利商店']=5,H.G.daily.catCansN=3,set('2026-10-05',15),!X().canOffer(H.G,'SQ08')));
  set('2026-10-05',21); EAT.rec(H.G).n['公館的便利商店']=4; H.G.daily.catCans=0;   /* 貓罐頭不算吃的（次數不加），店員說過認得你那一句（第 5 次）就算認得 */
  H.said=[]; H.opts=[]; H.picks=[4,0]; await STORY.interact({shop:'cvs'},GM);   /* 真的在櫃台買（第 5 項＝小罐貓罐頭）*/
  check('2. SQ08 便利商店（counter 接線，買貓罐頭也算）：「你也是買給公園那隻的？」「今天你是第四個。」；掛進；買過幾罐有記',seq(['你也是買給公園那隻的？','今天你是第四個。'])&&R('SQ08').step==='board'&&H.G.daily.catCansN===4,J([said(),H.opts]));
  set('2026-10-06',16,'wenzhou'); H.said=[]; H.opts=[]; H.picks=[9]; await PARK.interact(GM,{park:'notice'});
  check('2. SQ08 公布欄：（沒有任何餵貓的說明。）',has('（沒有任何餵貓的說明。）')&&R('SQ08').step==='ask');
  set('2026-10-07',9); H.said=[]; H.picks=[]; await PARK.interact(GM,{park:'chess'}); const a=!!R('SQ08').abo;
  set('2026-10-07',10); H.said=[]; H.picks=[0]; await WZS.interact(GM,{wzShop:'teahouse',kind:'tea'}); const b0=!!R('SQ08').su;
  set('2026-10-08',14,'wenzhou'); H.said=[]; H.picks=[3]; await WZS.interact(GM,{wzShop:'teahouse',kind:'tea'});
  check('2. SQ08 象棋阿伯（早上）、蘇姨（下午，上午不算）各一次 →（大家都在餵。）',a&&!b0&&!!R('SQ08').su&&has('（大家都在餵。）')&&R('SQ08').step==='back',J(R('SQ08')));
  set('2026-10-08',21,'gongguan'); await shop('公館的便利商店',[0]); check('2. SQ08 回店裡：「我做一張表，你拿去貼。」',has('我做一張表，你拿去貼。')&&R('SQ08').step==='post');
  set('2026-10-09',16,'wenzhou'); H.said=[]; H.picks=[9]; await PARK.interact(GM,{park:'notice'}); const n0=PARK.notices(H.G).find(q=>/^餵貓表/.test(q[0]));
  set('2026-10-10',16); const n1=PARK.notices(H.G).find(q=>/^餵貓表/.test(q[0]));
  check('2. SQ08 貼上去：做完；公布欄多「餵貓表（麻糬）」（一格一天，誰餵誰簽名）；第二天最下面多里長那一行',R('SQ08').state==='done'&&!!n0&&n0[0]==='餵貓表（麻糬）'&&J(n0[1])===J(['（一格一天，誰餵誰簽名。）'])&&J(n1[1])===J(['（一格一天，誰餵誰簽名。）','（有人在表的最下面加了一行：「星期日我來。——里長」）']),J([n0,n1]));
  H.said=[]; H.picks=[PARK.notices(H.G).findIndex(q=>/^餵貓表/.test(q[0])),9]; await PARK.interact(GM,{park:'notice'});
  check('2. SQ08 看餵貓表：兩行都唸',seq(['（一格一天，誰餵誰簽名。）','（有人在表的最下面加了一行：「星期日我來。——里長」）'])); });
/* ---- 3 公園的貓 ---- */
await sec(3,async()=>{ const cat=()=>({it:{park:'cat'}});
  fresh('2027-11-09',16,'wenzhou'); PARK.rec(H.G).catName='麻糬';   /* 大三上第 10 週（AA_166 線四；AA_420 6-1 從第 9 週改第 10 週）照舊 */
  check('3. 大三上第 10 週貓不見照舊；寒流、收養都還沒有',PARK.catLost(H.G)&&!PARK.catCold(H.G)&&!PARK.catGone(H.G),keyOf(H.G.day)+' '+J(CALENDAR.termOf(H.G.day)));
  fresh('2028-12-12',16,'wenzhou'); PARK.rec(H.G).catName='麻糬'; H.G.daily.catCans=2; X().rec(H.G).SQ08={state:'done',step:'done',day:1,posted:D('2026-10-09')};
  H.said=[]; H.opts=[]; const r=await PARK.interact(GM,{park:'cat'});
  check('3. 寒流（12/12）：貓縮在石桌下（catCold、catUnder）；「看」＝（牠縮在石桌下面…只聞了一下。）、沒有摸／餵選單；按鈕名字是牠的名字',PARK.catCold(H.G)&&PARK.catUnder(H.G)&&r==='cold'&&has('（牠縮在石桌下面，沒有出來。罐頭放在牠面前，牠只聞了一下。）')&&!H.opts.length&&PARK.catLabel(H.G)==='麻糬'&&H.G.daily.catCans===2);
  check('3. 寒流那一週：餵貓表「沒吃」',(PARK.notices(H.G).find(q=>/^餵貓表/.test(q[0]))||[])[1].includes('（那一週的格子都寫著「沒吃」。）'));
  set('2028-12-14',22+11/60); H.FAMILIAR(ZQ); const ip=inPark(); const due=X().catNightDue(GM);
  set('2028-12-14',22); const early=X().catNightDue(GM); set('2028-12-14',22.5); E.player.obj.position.x=-100; const out=X().catNightDue(GM); inPark();
  const G2=H.G; SOCIAL.rel(ZQ).fam=8; const acq=X().catNightDue(GM); SOCIAL.rel(ZQ).fam=25;
  check('3. 12/14 22:10～23:00、在公園、認識子晴熟悉以上＝那一場；22:00、不在公園、只是剛認識＝沒有',ip&&due&&!early&&!out&&!acq,J([ip,due,early,out,acq]));
  H.said=[]; H.opts=[]; H.picks=[1]; await EVENTS.run(X().CAT_EV);
  check('3. 那一場照稿（選「我幫妳抱。」）；記 ZQ_CAT_NIGHT；之後貓不在了',seq(['（鞦韆旁邊，子晴蹲在石桌前面，手機的手電筒照著桌子底下。）','牠三天沒吃了。我每天都有看那張表。','……我家有電暖器。','（牠很輕。比你記得的輕很多。）','（她把外套脫下來，把牠包起來。牠沒有掙扎。）','我做的那隻貓，是照牠畫的。你知道嗎。','（她沒有等你回答。）'])&&!has('先帶去看醫生。……之後再說。')&&J(H.opts[0])===J(['「妳要帶牠回去？」','「我幫妳抱。」'])&&H.G.flags.ZQ_CAT_NIGHT===true&&PARK.catGone(H.G)&&!X().catNightDue(GM),J(said()));
  H.G.flags.ZQ_CAT_NIGHT=false; H.G.flags.ZQ_CAT_SAID=true; H.said=[]; H.picks=[0]; await EVENTS.run(X().CAT_EV);
  check('3. 測試版那天說過是公園的貓（ZQ_CAT_SAID）：換「我做的那隻貓，你說過是牠。……你是對的。」＋（她沒有看你，一直看著外套裡的貓。）（AA_408）；「妳要帶牠回去？」→「先帶去看醫生。……之後再說。」',seq(['我做的那隻貓，你說過是牠。……你是對的。','（她沒有看你，一直看著外套裡的貓。）'])&&!has('我做的那隻貓，是照牠畫的。你知道嗎。')&&!has('（她沒有等你回答。）')&&has('先帶去看醫生。……之後再說。'));
  ph(); set('2028-12-15',12.1); ph();
  check('3. 12/15 12:00 她傳：獸醫院的照片、「感冒，老了。醫生說冬天不要待在外面。」',J(zqMsgs().slice(-2))===J(['（照片：獸醫院的診療台，牠縮在毛巾裡）','感冒，老了。醫生說冬天不要待在外面。']),J(zqMsgs()));
  set('2028-12-16',16); const before=PARK.notices(H.G).some(q=>q[0]==='領養'); set('2028-12-17',16); const N=PARK.notices(H.G);
  check('3. 12/17 公布欄：餵貓表撕掉、換成「麻糬已經被領養了。…——里長」',!before&&!N.some(q=>/^餵貓表/.test(q[0]))&&(N.find(q=>q[0]==='領養')||[])[1]==='「麻糬已經被領養了。謝謝大家這幾年的照顧。牠現在在一個有電暖器的家。——里長」');
  set('2028-12-18',9); H.said=[]; H.picks=[]; await PARK.interact(GM,{park:'chess'}); check('3. 在場的玩家：象棋阿伯不說「被一個常來盪鞦韆的女生帶走了。」',!has('被一個常來盪鞦韆的女生帶走了。'));
  set('2028-12-16',16); const h16=PARK.catHidden(H.G); H.said=[]; const g16=await PARK.interact(GM,{park:'cat'});
  check('3. 12/15～12/16：圓椅是空的、沒有按鈕、沒有毛那一句（12/17 起才有，AA_408 第 4 節）',h16&&g16==='gone'&&!H.said.length);
  set('2028-12-18',16); H.said=[]; H.opts=[]; const f1=await PARK.interact(GM,{park:'cat'}); const hid=PARK.catHidden(H.G); H.said=[]; const f2=await PARK.interact(GM,{park:'cat'});
  check('3. 收養以後：「看圓椅」（圓椅上有一點橘白色的毛…）一次、之後藏起來；沒有摸／餵選單；按鈕「看圓椅」；3D 照 catAdopted 不顯示',f1==='fur'&&H.opts.length===0&&hid&&f2==='gone'&&!H.said.length&&PARK.catAdopted(H.G)&&!PARK.catUnder(H.G)&&(PARK.rec(H.G).furSeen=null,PARK.catLabel(H.G)==='看圓椅'));
  { const P=PARK.rec(H.G); P.treeDay=null; set('2029-01-10',23.5); H.said=[]; await PARK.interact(GM,{park:'tree',seat:{x:0,z:0,yaw:0}}); const ent=PARK.entryLine(H.G,23.5);
    check('3. 收養以後：樹下、走進公園那一句不提貓在圓椅上',H.said.length===1&&!/麻糬|那隻貓/.test(H.said[0].t)&&ent===null,J([said(),ent])); }
  /* 不認識子晴的玩家 */
  fresh('2028-12-14',22.2,'wenzhou'); PARK.rec(H.G).catName='常客'; inPark(); const nz=X().catNightDue(GM); set('2028-12-15',0.5); const gone=PARK.catGone(H.G); set('2028-12-15',12.5); ph();
  set('2028-12-17',9); const N2=PARK.notices(H.G); H.said=[]; H.picks=[]; await PARK.interact(GM,{park:'chess'}); const c1=has('被一個常來盪鞦韆的女生帶走了。'); set('2028-12-19',9); H.said=[]; await PARK.interact(GM,{park:'chess'});
  check('3. 不認識子晴：沒有那一場、沒有照片；12/15 起貓不在；12/17 只有告示；象棋阿伯「被一個常來盪鞦韆的女生帶走了。」（一次）',!nz&&gone&&!zqMsgs().length&&(N2.find(q=>q[0]==='領養')||[])[1].startsWith('「常客已經被領養了。')&&c1&&!has('被一個常來盪鞦韆的女生帶走了。'));
  /* 收養以後的照片：2029-01～06 每月第一個週六 */
  fresh('2029-01-05',10,'dorm'); H.FRIEND(ZQ); INV.addContact(H.G,ZQ); const got=[]; for(const ym of X().PHOTO_MONTHS){ const d=X().firstSat(ym); set(keyOf(d),12.2); ph(); }
  const P=zqMsgs().filter(t=>!/加了/.test(t));
  check('3. 收養以後：每月第一個週六（1/6、2/3、3/3、4/7、5/5、6/2）照順序六則照片',J(X().PHOTO_MONTHS.map(ym=>keyOf(X().firstSat(ym))))===J(['2029-01-06','2029-02-03','2029-03-03','2029-04-07','2029-05-05','2029-06-02'])&&J(P)===J(['牠霸佔了我的鍵盤。','牠睡在電暖器前面一整天。我也是。','醫生說牠胖回來了一點。','我遊戲裡的貓，換了一個新的動作：睡覺。','牠學會開衣櫃了。我不知道是誰教的。','（照片：貓趴在一張畢業證書上）','去年的。今天借牠拍一張。……畢業快樂。']),J(P));   /* 第 6 張照 AA_465 第 2 節換字（原本「（照片：貓和畢業證書）」「牠比我早一步拿到證書。……是我放上去的。」）*/
  check('3. 沒交往：照片不能回「（去看貓）」',!(H.G.msgs||[]).some(m=>m.ask&&/^sqcat_visit/.test(m.ask.id)));
  fresh('2029-02-03',10,'dorm'); H.FRIEND(ZQ); INV.addContact(H.G,ZQ); H.date(ZQ); set('2029-02-03',12.2); ph(); const m=(H.G.msgs||[]).find(x=>x.ask&&x.ask.id==='sqcat_visit1');
  const a=m&&PHONE.answer(H.G,'sqcat_visit1',0); ph(); const q=OUT.get(H.G,'sq_cat_visit2');
  check('3. 交往中：照片那則可以回「（去看貓）」（不傳字）→ 隔天 14:00「去看貓」2D 出遊（她家）',!!m&&J(m.ask.opts.map(o=>o.t))===J(['（去看貓）'])&&!!a&&a.out.length===0&&!!q&&keyOf(q.day)==='2029-02-04'&&q.h===14&&q.ev==='ev_sq_cat_visit',J(q));
  const f0=SOCIAL.rel(ZQ).fam; await goOut('sq_cat_visit2',[]); check('3. 「去看貓」：她家（不另外寫台詞）；熟悉 +1',H.said.length===0&&SOCIAL.rel(ZQ).fam===f0+1,J(said()));
  fresh('2029-01-06',12.2,'dorm'); ph(); check('3. 不認識子晴：沒有照片',!zqMsgs().length); });
/* ---- 4 AA_408 補字 ---- */
await sec(4,async()=>{
  fresh('2026-03-03',12,'wz_lin'); know('林家乾麵',4); await shop('林家乾麵',[0,0]);
  check('4. SQ01 掛進去以後先看評價（手機畫面）「★☆☆☆☆　湯是冷的。等了十分鐘。不推。」，再三選一',seq(['……我們乾麵沒有湯。','★☆☆☆☆　湯是冷的。等了十分鐘。不推。'])&&H.opts.length===2);
  /* 過期一句：SQ08（期限兩週）過了期限，下一次去那間店，店員一句；之後的痕跡照 AA_408 第 1 節 */
  fresh('2026-10-05',21,'cvs'); know('公館的便利商店',4); H.G.daily={catCansN:3}; PARK.rec(H.G).catName='麻糬'; await shop('公館的便利商店',[0],{item:'小罐貓罐頭',price:35});
  const r8=R('SQ08'); set('2026-10-25',21); H.said=[]; await shop('公館的便利商店',[0]); const l1=H.said.map(x=>x.t); H.said=[]; await shop('公館的便利商店',[0]);
  check('4. 過期以後下一次來：店員「餵貓那張表，我自己貼了。」（一次、不扣分）；公布欄照樣有餵貓表＋里長那一行',r8&&r8.state==='lapsed'&&J(l1)===J(['餵貓那張表，我自己貼了。'])&&!has('餵貓那張表，我自己貼了。')&&(set('2026-10-27',16),(X().parkNotices(H.G)[0]||[])[1]||[]).includes('（有人在表的最下面加了一行：「星期日我來。——里長」）'),J(l1));
  fresh('2026-03-03',12,'wz_lin'); know('林家乾麵',4); await shop('林家乾麵',[0,0]); R('SQ01').by=H.G.day; R('SQ01').step='x'; set('2026-03-05',12); H.said=[]; await shop('林家乾麵',[0]);
  check('4. SQ01 過期：老闆「評價那個，我自己回了。……三個字，『沒有湯』。」；菜單牆那一行照樣有',has('評價那個，我自己回了。……三個字，『沒有湯』。')&&X().wallExtra(H.G,'林家乾麵')==='「乾麵沒有湯」');
  fresh('2026-10-05',15,'wenzhou'); know('巷口茶飲',4); await shop('巷口茶飲',[0,1]);
  check('4. SQ02 選「妳自己覺得呢？」：「……我覺得不合理。可是我不敢跟他說。」「你們學校的法服，可以問這種嗎？」→ 照樣排法服',seq(['……我覺得不合理。可是我不敢跟他說。','你們學校的法服，可以問這種嗎？'])&&(H.G.outings||[]).some(x=>x.ev==='ev_sq02_fafu'));
  fresh('2027-07-10',14,'wenzhou'); know('夏日冰菓室',4); await shop('夏日冰菓室',[0]); H.said=[]; await X().iceBoard(GM);
  check('4. SQ03 寫到一半：（你寫到芒果冰那一行，老闆娘從冰櫃後面探出頭。）再接她那兩句',seq(['（你寫到芒果冰那一行，老闆娘從冰櫃後面探出頭。）','今年芒果貴。……可是寫上去不好看，你寫原來的價錢。']));
  fresh('2026-10-07',12,'l118_buffet'); know('好家自助餐',4); SOCIAL.remember('classmate_mingxuan','FIRST_MET',''); await shop('好家自助餐',[0]); PHONE.tick(H.G);
  check('4. SQ06 問明軒：私訊「國二數學，可以。週幾？」「我本來就在那附近教，順路。這個 CP 值很高。」',J((H.G.msgs||[]).filter(m=>m.th==='p:classmate_mingxuan').map(m=>m.text).slice(-2))===J(['國二數學，可以。週幾？','我本來就在那附近教，順路。這個 CP 值很高。']));
  fresh('2026-10-07',12,'l118_buffet'); know('好家自助餐',4); await shop('好家自助餐',[0]); set('2026-10-10',12); ph(); H.said=[]; await shop('好家自助餐',[0,1]);
  check('4. SQ06 自己去當家教：下一次去先兩行旁白（第一次上課…／他彈的是吉他的和弦）再接原本的轉折',R('SQ06').tutor==='me'&&seq(['（第一次上課。他的數學課本很新，手指一直在桌子底下彈。）','（你看了一下：他彈的是吉他的和弦。）','（孫子想學的是吉他，不是數學。他在網路上看了吉他社成發的影片。）']),J(said()));
  fresh('2028-03-08',12,'l118_omurice'); know('蛋包飯研究所',4); await shop('蛋包飯研究所',[0,1]);
  check('4. SQ07 讀書計畫第一句（第一句寫著…）；選「我看不懂第三段。」→「看不懂才對。我自己也看不懂。」「重寫。」',seq(['（第一句寫著：『我想知道，為什麼同一顆蛋，煎三分鐘和三分半，吃起來是兩種東西。』）','看不懂才對。我自己也看不懂。','重寫。']));
  check('4. SQ07 學姊在 Café：先（學姊在 Café 看了五分鐘…）再「她第三段想說的，第一句就要說。」',X().SIS_EV.dialogue[0].text==='（學姊在 Café 看了五分鐘，在第三段畫了一條線，把它的第一句圈起來，移到最前面。）'&&X().SIS_EV.dialogue[1].text==='她第三段想說的，第一句就要說。');
  check('4. SQ08 象棋阿伯「貓？我每天帶一點魚乾。牠比我準時。」、蘇姨「我中午會放一碗水。……牠不吃我的飯，只喝水。」、貼表（你把表貼在公布欄的角落，用了四個圖釘。）',X().LINES.SQ08.ask.abo==='貓？我每天帶一點魚乾。牠比我準時。'&&X().LINES.SQ08.ask.su==='我中午會放一碗水。……牠不吃我的飯，只喝水。'&&X().LINES.SQ08.post==='（你把表貼在公布欄的角落，用了四個圖釘。）');
  fresh('2027-10-03',12,'l118_noodle'); know('六張犁麵舖',4); PHONE.join&&PHONE.join(H.G,'noodle_team'); SOCIAL.remember('zhe','FIRST_MET',''); await shop('六張犁麵舖',[0,1]); const r5=R('SQ05');
  set('2027-10-04',13,'linze'); const due=X().signDue({G:H.G,E}); set('2027-10-04',13,'campus'); const notL=X().signDue({G:H.G,E}); H.said=[]; set('2027-10-04',13,'linze'); await EVENTS.run(X().SIGN_EV);
  check('4. SQ05 答應的隔天 12:00～18:00 在霖澤館：（你下課經過霖澤館一樓，阿哲把卡片塞給你。）（在別的地方不演）',!!r5&&(!r5.zhe||(due&&!notL&&has('（你下課經過法律系館A一樓，阿哲把卡片塞給你。）')&&!!r5.signed)),J({zhe:r5&&r5.zhe,due,notL}));
});
H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
