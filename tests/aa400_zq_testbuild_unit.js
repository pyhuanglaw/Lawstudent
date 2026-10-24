// AA_400 子晴的測試版（企劃線 ce4f34378；任務 AA389-REST-L-1023）——不需要瀏覽器。
//   0  逐字對稿、新檔載得到
//   1  誰有：Q6＋（HOOK_ZQ_GAME 或九份 ENC_D18_ZQ）；都沒有＝沒有
//   2  3/7 21:00 私訊兩個回覆 → 3/8 12:10 總圖二樓；照稿（FIRST_BUG、九份、公園的貓三種變化；交往中最後一行）；記 ZQ_TESTBUILD
//   3  沒回＝3/8 11:00「那我放在 Café 櫃台。」；答應了沒到＝12:40；Café 店員給隨身碟
//   4  房間「玩子晴的測試版」：旁白三段、傳她一則（照她的回覆時間回）、ZQ_TB_FB；3/14 沒玩＝3/15「玩了沒。」；房間物件
//   5  發表會 roof 多一句；期末選項打開（termend_unit 12）
// 修改前（開發分支 846f66e56）：沒有 src/zq_testbuild3d.js（全部 FAIL）。用法：node tests/aa400_zq_testbuild_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H, ZQ='heroine_04', J=JSON.stringify;
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(EXCH|Y34B|MSG|MSG_POOL|MSG2_POOL|PARK|ZQTB)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/exchange3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/y34b3d.js','src/wzpark3d.js']) load(f);
let ok=true; try{ load('src/zq_testbuild3d.js'); }catch(e){ ok=false; }
const D=k=>STORY.dayOfKey(k), keyOf=d=>CALENDAR.dateOf(d).key;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,2).join(' / ')); } };
const has=t=>H.said.some(x=>x.t===t), idx=t=>H.said.findIndex(x=>x.t===t), seq=a=>a.every((t,i)=>idx(t)>=0&&(i===0||idx(t)>idx(a[i-1])));
const th=()=>(H.G.msgs||[]).filter(m=>m.th==='p:'+ZQ).map(m=>m.text);
const X=()=>typeof ZQTB!=='undefined'?ZQTB:null;
const fresh=(key,h,flags,mems)=>{ const G=H.fresh(key,h,'dorm',Object.assign({EXCHANGE_ROUTE:'TW'},flags||{})); H.FRIEND(ZQ); G.events.done.ev_ziqing_secret_game=1; for(const m of mems||[]) SOCIAL.remember(ZQ,m,''); G.outings=[]; H.at(key,h); return G; };
const ph=()=>{ X().phone(H.G); PHONE.tick(H.G); };
const goOut=async(id,picks)=>{ const q=OUT.get(H.G,id); H.said=[]; H.opts=[]; H.picks=picks||[]; if(!q) return false; q.state='planned'; await OUT.go(GM,q); return true; };

(async()=>{
let doc=''; try{ doc=cp.execSync('git show ce4f34378:"docs/story_planning/AA_400_子晴的測試版_HOOK_ZQ_GAME.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc=''; }
await sec(0,()=>{ const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'), src=fs.readFileSync(path.join(H.ROOT,'src/zq_testbuild3d.js'),'utf8');
  check('0. 新檔載得到、index.html 接在 family_xmas3d.js 後面',ok&&!!X()&&/family_xmas3d\.js\?v=[^"]+"><\/script>\n<script src="src\/zq_testbuild3d\.js\?v=[^"]+"><\/script>/.test(html));
  const q=[...J(X().EVENT).matchAll(/"text":"([^"]+)"/g)].map(m=>m[1]).concat([...src.matchAll(/(?:dm|say\(null,)\('([^']+)'\)/g)].map(m=>m[1]),[...src.matchAll(/text:'([^']+)'/g)].map(m=>m[1]),[...src.matchAll(/\{t:'([^']+)',k:/g)].map(m=>m[1]));
  const notIn=[...new Set(q)].filter(t=>doc.indexOf(t.replace(/^「|」$/g,''))<0);
  check('0. 每一句台詞、選項都在稿裡（一字不差）',!!doc&&q.length>25&&!notIn.length,J(notIn)); });
/* ---- 1 ---- */
await sec(1,()=>{ fresh('2028-03-07',21,{HOOK_ZQ_GAME:1}); const a=X().cond(H.G); fresh('2028-03-07',21,{},['ENC_D18_ZQ']); const b=X().cond(H.G); fresh('2028-03-07',21); const c=X().cond(H.G);
  const G=H.fresh('2028-03-07',21,'dorm',{HOOK_ZQ_GAME:1}); H.FRIEND(ZQ); const d=X().cond(G);
  check('1. 誰有：Q6＋期末那句、或 Q6＋九份；Q6 沒有那兩個＝沒有；沒看過 Q6＝沒有',a&&b&&!c&&!d,J([a,b,c,d])); });
/* ---- 2 ---- */
await sec(2,async()=>{ fresh('2028-03-07',20,{HOOK_ZQ_GAME:1}); H.at('2028-03-07',21); ph(); const m=(H.G.msgs||[]).find(x=>x.ask&&x.ask.id==='zqtb_ask');
  check('2. 3/7 21:00「測試版好了。」「明天中午，總圖二樓。靠窗那排。」；「好。」／「傳檔案給我就好？」',J(th())===J(['測試版好了。','明天中午，總圖二樓。靠窗那排。'])&&!!m&&J(m.ask.opts.map(o=>o.t))===J(['好。','傳檔案給我就好？']));
  PHONE.answer(H.G,'zqtb_ask',1); ph(); const q=OUT.get(H.G,'zqtb_lib');
  check('2. 「傳檔案給我就好？」→「不要。我要看你第一關卡在哪裡。」；3/8（三）12:10「總圖二樓：子晴的測試版」',th().includes('不要。我要看你第一關卡在哪裡。')&&!!q&&keyOf(q.day)==='2028-03-08'&&Math.abs(q.h-(12+10/60))<1e-6&&q.title==='總圖二樓：子晴的測試版',J(q));
  const r0=Object.assign({},SOCIAL.rel(ZQ)); H.at('2028-03-08',12); await goOut('zqtb_lib',[0]); const r1=SOCIAL.rel(ZQ);
  check('2. 一般（沒有 FIRST_BUG、九份、公園的貓）：照稿；兩個選項（沒有公園那個）；「第一關好難。」→「欸不是，你才玩兩分鐘。」；ZQ_TESTBUILD、記憶；熟悉 +2、信任 +2',seq(['（她坐在靠窗那排。筆電開著，旁邊插著一個貼了貓貼紙的隨身碟。）','你坐。用我的筆電，玩第一關就好。','欸不是，你才玩兩分鐘。','……好，我記下來。第一關太難。','隨身碟給你。全部玩完，跟我說哪裡卡住。','不要跟我說好玩。','（她把隨身碟放進你手心。貓貼紙有一角翹起來了。）'])&&!has('（插座亮了。）')&&H.opts[0].length===2&&H.G.flags.ZQ_TESTBUILD===true&&SOCIAL.has(ZQ,'ZQ_TESTBUILD')&&r1.fam-r0.fam===2&&r1.trust-r0.trust===2,J({s:H.said.map(x=>x.t),o:H.opts}));
  fresh('2028-03-08',12,{HOOK_ZQ_GAME:1,FIRST_BUG:true,ZQ_TB_GO:true},['ENC_D18_ZQ']); PARK.rec(H.G).petDay=D('2027-10-01'); H.date(ZQ); PHONE.at(H.G,D('2028-03-07'),21,[{th:'p:'+ZQ,from:ZQ,text:'x'}],'zqtb_ask'); PHONE.tick(H.G); ph(); await goOut('zqtb_lib',[0]);
  check('2. FIRST_BUG＋九份＋摸過公園的貓、交往中：「（插座亮了。）」「你說壞的那個…」「第三關是九份…」；「這隻貓是公園那隻？」→ ZQ_CAT_SAID；最後一行換交往版',seq(['（插座亮了。）','你說壞的那個，我在遊戲裡修好了。現實的還沒。','第三關是九份，燈籠那關。你回去自己玩。','……你看出來了。','我每天晚上經過那個公園。牠都在那張圓椅上。','（她把隨身碟放進你手心，手指在你掌心停了一下才收回去。）'])&&H.G.flags.ZQ_CAT_SAID===true,J(H.said.map(x=>x.t))); });
/* ---- 3 ---- */
await sec(3,async()=>{ fresh('2028-03-07',21,{HOOK_ZQ_GAME:1}); ph(); H.at('2028-03-08',11.1); ph();
  check('3. 3/8 11:00 還沒回：「那我放在 Café 櫃台。」；沒有總圖那一場',th().includes('那我放在 Café 櫃台。')&&!OUT.get(H.G,'zqtb_lib'));
  H.at('2028-03-10',15); H.G.zone='cafe'; const due=X().cafeDue(H.G); H.said=[]; await EVENTS.run(STORY_EVENTS.find(e=>e.id==='ev_zq_testbuild_cafe'));
  check('3. 3/10 走進 Café：店員「子晴放的。她說你一定會忘記來拿。」；ZQ_TESTBUILD',due&&has('子晴放的。她說你一定會忘記來拿。')&&H.G.flags.ZQ_TESTBUILD===true&&!X().cafeDue(H.G));
  fresh('2028-03-07',21,{HOOK_ZQ_GAME:1}); ph(); PHONE.answer(H.G,'zqtb_ask',0); ph(); const q=OUT.get(H.G,'zqtb_lib'); q.state='missed'; H.at('2028-03-08',12.7); ph();
  check('3. 答應了沒到：「我去上課了。隨身碟在 Café 櫃台。」',th().includes('我去上課了。隨身碟在 Café 櫃台。')&&!!H.G.flags.ZQ_TB_CAFE);
  fresh('2028-03-15',15,{HOOK_ZQ_GAME:1,ZQ_TB_CAFE:true}); H.G.zone='cafe'; check('3. 過了 3/14：Café 不給',!X().cafeDue(H.G)); });
/* ---- 4 ---- */
await sec(4,async()=>{ const room=()=>{ const L=STORY.roomItemList(H.G); return L; };
  fresh('2028-03-09',20,{ZQ_TESTBUILD:true,FIRST_BUG:true},['ENC_D18_ZQ']); PHONE.at(H.G,D('2028-03-07'),21,[{th:'p:'+ZQ,from:ZQ,text:'x'}],'zqtb_ask'); PHONE.tick(H.G);
  const L=room(), it=L.find(r=>r[0]==='玩子晴的測試版（60 分）'), usb=L.find(r=>r[0]==='子晴的測試版（貓貼紙的隨身碟）');
  check('4. 房間多「玩子晴的測試版（60 分）」（動作）、物件「子晴的測試版（貓貼紙的隨身碟）」',!!it&&typeof it[2]==='function'&&!!usb,J(L.map(r=>r[0])));
  const h0=H.G.hour, r0=Object.assign({},SOCIAL.rel(ZQ)); H.said=[]; H.opts=[]; H.picks=[1]; await it[2](GM); const r1=SOCIAL.rel(ZQ);
  check('4. 旁白三段照順序（FIRST_BUG、九份、屋頂、最後一關）；花 60 分；選項有九份那個；傳「九份那關最好玩。」；ZQ_TB_FB jiufen；熟悉 +1、自在 +2',seq(['（第一關，總圖二樓那排插座全部是亮的。）','（第三關是九份。燈籠一個一個亮起來，貓要在燈全部熄掉以前爬到最上面。你掉下去六次。）','（第四關是一個沒有路的屋頂。你卡了很久，才發現貓可以跳到旁邊的招牌上。）','（最後一關還沒做。畫面上寫著：「這裡還沒有路。」）'])&&Math.abs(H.G.hour-h0-1)<1e-6&&H.opts[0].length===4&&H.G.flags.ZQ_TB_FB==='jiufen'&&r1.fam-r0.fam===1&&r1.comf-r0.comf===2,J({s:H.said.map(x=>x.t),o:H.opts}));
  H.at('2028-03-11',13); PHONE.tick(H.G); check('4. 她照回覆時間回「那關我做最久。燈籠的光調了三十幾次。」；之後房間沒有「玩」那一格',th().includes('那關我做最久。燈籠的光調了三十幾次。')&&!room().some(r=>r[0]==='玩子晴的測試版（60 分）'));
  fresh('2028-03-09',20,{ZQ_TESTBUILD:true}); H.said=[]; H.opts=[]; H.picks=[0]; await X().play(GM); check('4. 沒有 FIRST_BUG、九份：只有屋頂和最後一關兩段；選項兩個＋不傳；「第四關的屋頂…」→ roof',!has('（第一關，總圖二樓那排插座全部是亮的。）')&&has('（第四關是一個沒有路的屋頂。你卡了很久，才發現貓可以跳到旁邊的招牌上。）')&&H.opts[0].length===3&&H.G.flags.ZQ_TB_FB==='roof',J(H.opts));
  fresh('2028-03-07',21,{HOOK_ZQ_GAME:1,ZQ_TESTBUILD:true}); PHONE.at(H.G,D('2028-03-07'),21,[{th:'p:'+ZQ,from:ZQ,text:'x'}],'zqtb_ask'); PHONE.tick(H.G); H.at('2028-03-15',21); ph(); const m=(H.G.msgs||[]).find(x=>x.ask&&x.ask.id==='zqtb_ask2');
  check('4. 3/14 還沒玩：3/15 21:00「玩了沒。」「還沒。」／「今天玩。」',!!m&&m.text==='玩了沒。'&&J(m.ask.opts.map(o=>o.t))===J(['還沒。','今天玩。']));
  PHONE.answer(H.G,'zqtb_ask2',1); ph(); check('4. 「今天玩。」＝3/15 還可以玩；「還沒。」＝不能',X().canPlay(H.G)&&(H.G.flags.ZQ_TB_LATE='no',!X().canPlay(H.G))); });
/* ---- 5 ---- */
await sec(5,()=>{ const ev=STORY_EVENTS.find(e=>e.id==='ev_ziqing_q12'); const n=ev&&ev.dialogue.find(x=>x.text==='第四關的屋頂，我加了一條路。');
  check('5. 發表會：ZQ_TB_FB roof 的多「第四關的屋頂，我加了一條路。」',!!n&&n.if.custom({flags:{ZQ_TB_FB:'roof'}})&&!n.if.custom({flags:{ZQ_TB_FB:'fun'}}));
  check('5. 期末「做出來給我玩。」選項打開（沒有 noOpt）',!TERMEND_LINES.HOOK.Y3S1.heroine_04.noOpt); });
H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
