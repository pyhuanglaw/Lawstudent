// 店員的支線「順手的事」第二、三批：AA_404（企劃線 30bf21de8，SQ10～SQ15）、AA_405（1fa2b494a，SQ16～SQ20）、過期一句 AA_408 第 1 節（29e41dd8）——不需要瀏覽器。
//   0  稿：每一句台詞、旁白、選項都在 AA_404＋AA_405＋AA_408（29e41dd8、b0b80a54；一字不差）；過期一句和 AA_408 第 1 節的表一樣；標題＝稿的小標；SQ16（輪轉單車沒有互動點）不做
//   1  和第一批共用的規則：店員認得你才出、一家店同時一則、同時最多兩則（第一批＋第二批一起算）、一天一次、舊存檔
//   2  各則：出現 → 掛進 → 步驟 → 做完的痕跡；過期一句和過期以後的痕跡（AA_408 第 1 節「之後」那一欄）；接線（118 巷 L118.order、一盞／半熟 WZS.interact、定食 order364、清葉茶行 counter、舊路書房 bookshop、
//      公園的貓「看」、公布欄、名牌、學姊說話前 SISY23.preTalk、芯慈說話的 interact 事件、2D 出遊 OUT）
//   4  AA_408 第 6 節（企劃線 b0b80a54，任務 SIDEQ-AA408-6-1023）：每一句逐字在第 6 節裡；SQ17 三題的順序與回答、給不給電話（聯絡人、四月底私訊）；SQ20 自己計時兩次；
//      SQ19 班上群組三則（取代旁白）；SQ10 回來以後交乳扇才做完；SQ12 帶交往對象的那一句＋五個人各自接的一句（芷若、沛珊不能選）；SQ15 房間物品平常那一句；SQ18 阿伯那一杯、不給錢
//      修改前（開發分支 fdc39c9fc）：第 2 節的 SQ10、SQ12、SQ15、SQ17、SQ18、SQ19、SQ20 共 11 項 FAIL，第 4 節 17 項裡 12 項 FAIL（SQ17 前兩題沒有回答、SQ20 第一次沒有句子、SQ19 是兩句旁白、SQ10 出遊就做完、SQ12 只有「你是他找來的吧。」…）
// 修改前（開發分支 c10ed6d9f）：SIDEQ 沒有 SQ10～SQ20、商店沒有接線（一盞、半熟、清葉茶行、舊路書房不叫 atShop）、公園沒有外出籠、告示沒有「（豆花）」——全部 FAIL。用法：node tests/aa404_sideq_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify, AN='heroine_01', ZQ='heroine_04', SIS='heroine_05', XC='classmate_xinci', BH='classmate_bohan';
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(EAT|EAT_LINES|WZS|L118|LANE118_SHOPS|LANE118_LAYOUT|PARK|WZ_PARK_LAYOUT|SIDEQ|MSG|MSG_POOL|MSG2_POOL|SISY23|SISY23_LINES|SISY23_EVENTS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/data/eat_lines.js','src/eat3d.js','src/data/lane118_layout.js','src/data/lane118_shops.js','src/lane118.js','src/data/wz_park_layout.js','src/wzpark3d.js','src/wzshops3d.js','src/data/sis_y2y3_events.js','src/sis_y2y3_3d.js']) load(f);
let ok=true, err=''; try{ load('src/sideq3d.js'); }catch(e){ ok=false; err=String(e); }
const X=()=>typeof SIDEQ!=='undefined'?SIDEQ:null;
const D=k=>STORY.dayOfKey(k), keyOf=d=>CALENDAR.dateOf(d).key;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const has=t=>H.said.some(x=>x.t===t), idx=t=>H.said.findIndex(x=>x.t===t), seq=a=>a.every((t,i)=>idx(t)>=0&&(i===0||idx(t)>idx(a[i-1])));
const said=()=>H.said.map(x=>(x.who?x.who+'：':'')+x.t), whoOf=t=>(H.said.find(x=>x.t===t)||{}).who;
let money=[]; GM.money=d=>{ money.push(d); H.G.money+=d; };
const set=(key,h,zone)=>{ const d=D(key); H.G.day=d; H.G.hour=h; H.G.weekday=CALENDAR.dateOf(d).wd%7; if(zone) H.G.zone=zone; };
const fresh=(key,h,zone,flags)=>{ const G=H.fresh(key,h,zone||'wenzhou',Object.assign({EXCHANGE_ROUTE:'TW'},flags||{})); G.outings=[]; set(key,h,zone||'wenzhou'); money=[]; if(X()) X().roll=()=>0; return G; };
const know=(key,n)=>{ EAT.rec(H.G).n[key]=n==null?4:n; };   /* 這一次點完＝第 n+1 次 */
const shop=async(key,picks,o)=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); EAT.rec(H.G).n[key]=(EAT.rec(H.G).n[key]|0)+1; return X().atShop(GM,key,o||{item:'x',price:0}); };
const R=id=>X().get(H.G,id);
const here=id=>{ const n={name:SOCIAL.displayName(id),charId:id,obj:{position:{x:0,y:0,z:0}}}; GM.npc[id]=n; E.npcs.push(n); return n; };
const outOf=ev=>(H.G.outings||[]).filter(x=>x.ev===ev&&x.state==='planned').pop()||null;
const goOut=async(q,picks)=>{ H.said=[]; H.opts=[]; H.picks=picks||[]; if(!q) return false; set(keyOf(q.day),q.h,H.G.zone); await OUT.go(GM,q); return true; };
const miss=q=>{ q.state='missed'; OUT.onMissed(GM,q); };
const ph=()=>{ X().phone(H.G); PHONE.tick(H.G); };
const msgs=th=>(H.G.msgs||[]).filter(m=>m.th===th).map(m=>m.text);
const grp=()=>(H.G.msgs||[]).filter(m=>m.tag==='sq19_group'), LC=()=>PHONE.join(H.G,'law_class','法律系（全班）');   /* SQ19 班上群組那三則（AA_408 6）*/
const wd=d=>CALENDAR.dateOf(d).wd%7;
const lapse=(id)=>{ R(id).by=H.G.day; set(keyOf(H.G.day+1),H.G.hour); X().lapse(H.G); return R(id).state; };

(async()=>{
let d404='', d405='', d408='', d408b=''; const sh=(c,f)=>cp.execSync('git show '+c+':"docs/story_planning/'+f+'"',{cwd:H.ROOT,encoding:'utf8'});
try{ d404=sh('30bf21de8','AA_404_店員的支線_第二批.md'); d405=sh('1fa2b494a','AA_405_店員的支線_第三批.md'); d408=sh('29e41dd8','AA_408_店員支線補字_回LAWWW實作問題.md'); d408b=sh('b0b80a54','AA_408_店員支線補字_回LAWWW實作問題.md'); }catch(e){}
const doc=d404+d405+d408+d408b, IDS=['SQ10','SQ11','SQ12','SQ13','SQ14','SQ15','SQ17','SQ18','SQ19','SQ20'];
/* ---- 0 稿 ---- */
await sec(0,()=>{ check('0. sideq3d.js 載得到；第二、三批十則都在（SQ16 不做）',ok&&!!X()&&IDS.every(id=>X().Q[id]&&X().LINES[id])&&!X().Q.SQ16,err||J(Object.keys((X()||{Q:{}}).Q)));
  const out=[]; const walk=v=>{ if(v==null) return; if(typeof v==='string'){ if(!/^[a-z_0-9]+$/.test(v)) out.push(v); } else if(Array.isArray(v)) v.forEach(walk); else if(typeof v==='object') for(const k in v) walk(v[k]); };
  for(const id of IDS) walk(X().LINES[id]);
  const win=PARK.LINES.CHESS.win.map(a=>a[0]);   /* SQ18 下的那一盤：WZ-P3 的象棋（AA_171），不在這兩份稿 */
  for(const e of [X().HWAXIN_EV,X().PASTA_EV,X().VET_EV,X().PARK18_EV,X().XC_EV,X().BRUNCH1_EV,X().BRUNCH2_EV]) for(const l of e.dialogue){ if(l.text&&!win.includes(l.text)) out.push(l.text); if(l.choice) for(const c of l.choice) out.push(c.text); }
  const segs=t=>String(t).split(/[（）「」]/).map(x=>x.replace(/^[。，：、]+|[。，：]+$/g,'').trim()).filter(x=>x.length>=2);
  const miss0=[...new Set(out)].filter(t=>segs(t).some(s=>doc.indexOf(s)<0));
  check('0. 每一句台詞、旁白、選項都在 AA_404＋AA_405＋AA_408（29e41dd8、b0b80a54）稿裡（一字不差）',!!d404&&!!d405&&!!d408&&!!d408b&&out.length>120&&!miss0.length,out.length+' '+J(miss0));
  const T={}; for(const ln of d408b.split('\n')){ const m=/^\| (SQ\d\d) [^|]+\| 「(.+?)」 \|/.exec(ln); if(m) T[m[1]]=m[2]; }
  const bad=IDS.filter(id=>X().LINES[id].lapse!==T[id]);
  check('0. 過期一句（SQ10～SQ20，SQ16 以外）和 AA_408 第 1 節的表一字不差',Object.keys(T).length===19&&!bad.length,J(bad.map(id=>[id,X().LINES[id].lapse,T[id]])));
  const tb=IDS.filter(id=>doc.indexOf('## '+id+'　'+X().Q[id].title)<0);
  check('0. 「順手的事」的標題＝稿的小標',!tb.length,J(tb));
  check('0. 新的 2D 背景登記了（還沒有圖＝深色底）：中和・華新街 hwaxin_street、動物醫院 vet_clinic',OUT.BG.hwaxin_street&&OUT.BG.hwaxin_street.image===null&&OUT.BG.vet_clinic&&OUT.BG.vet_clinic.image===null&&OUT.bg('hwaxin_street')==='dark'); });
/* ---- 1 共用規則 ---- */
await sec(1,async()=>{ fresh('2026-10-05',12,'l118_korea');   /* 大二上（週一） */
  know('韓食小廚',3); let r=await shop('韓食小廚',[0,0]); check('1. 第 4 次（店員還不認得你）：不出',!r&&!R('SQ13')&&!H.said.length);
  r=await shop('韓食小廚',[0,0]); check('1. 第 5 次：老闆開口 →「要我幫忙嗎？」→ 掛進；手機「今天」有這一則',!!r&&R('SQ13').state==='open'&&H.said[0].who==='老闆'&&/韓食小廚：第三罐泡菜/.test(X().todayHTML(H.G)),J(said()));
  X().Q.SQTEST={shop:'韓食小廚',title:'x',avail:()=>true,accept:async()=>{}}; const one=X().canOffer(H.G,'SQTEST'); delete X().Q.SQTEST;
  check('1. 一家店同時只掛一則（第二批的店也一樣）',!one);
  SOCIAL.remember(XC,'FIRST_MET',''); know('巷子裡定食',4); r=await shop('巷子裡定食',[0]); check('1. 一天最多問一次（同一天別家店不出）',!r&&!R('SQ19'));
  set('2026-10-06',12); know('林家乾麵',4); await shop('林家乾麵',[0,0]); set('2026-10-07',12); r=await shop('巷子裡定食',[0]);
  check('1. 同時最多兩則（第一批 SQ01＋第二批 SQ13 已經兩則：定食店 SQ19 不出）',X().openIds(H.G).length===2&&!R('SQ19')&&!r,J(X().openIds(H.G)));
  fresh('2026-10-05',12,'l118_korea'); know('韓食小廚',4); await shop('韓食小廚',[1]);
  check('1. 「……加油。」：不掛、這學期不再出',R('SQ13').state==='declined'&&(set('2026-11-20',12),!X().canOffer(H.G,'SQ13')));
  const G=fresh('2026-10-05',12,'l118_korea'); delete G.side; know('韓食小廚',4); X().roll=()=>0.9;
  check('1. 舊存檔（沒有 G.side）：點餐不壞、手機「今天」不壞',(await shop('韓食小廚',[0]),true)&&typeof G.side==='object'&&X().todayHTML(G)===''); });
/* ---- 2 各則 ---- */
await sec('2 SQ10',async()=>{ fresh('2027-03-01',12,'l118_dian'); know('滇香小館',4);   /* 大二下起（週一）*/
  H.said=[]; H.opts=[]; H.picks=[0,0]; await L118.order(GM,'dian'); const q=outOf('ev_sq10_hwaxin');
  check('2. SQ10 從 118 巷點餐出現（L118.order）：老闆娘「乳扇沒有了。…」「……我這個月走不開。你週末有空嗎？」→ 掛進；（她多給一張摺好的紙條。）「拿給老闆娘。」；週六 14:00 去中和・華新街（捷運約 40 分）',
    !!R('SQ10')&&R('SQ10').state==='open'&&seq(['乳扇沒有了。我們家鄉的那種，臺北只有中和那條街買得到。','……我這個月走不開。你週末有空嗎？','（她多給一張摺好的紙條。）','拿給老闆娘。'])&&whoOf('拿給老闆娘。')==='老闆娘'&&!!q&&keyOf(q.day)==='2027-03-06'&&q.h===14&&q.place==='中和・華新街'&&/40 分鐘/.test(q.travel)&&R('SQ10').by===CALENDAR.termDays('Y2S2').to,J([said(),q]));
  check('2. SQ10 手機「今天」：下一步、期限這學期內',/週末去中和的華新街（3\/6 週六 14:00/.test(X().todayHTML(H.G))&&/到 6\/13/.test(X().todayHTML(H.G)),X().todayHTML(H.G));
  money=[]; await goOut(q,[]);
  check('2. SQ10 華新街（2D hwaxin_street）：雜貨店的老闆娘看了紙條…「阿梅？……她在臺北開店？」、三十年沒聯絡、「乳扇是她的，這包是我的。叫她打給我。」；來回 60 元；還沒做完（AA_408 6：回來以後交乳扇）',
    seq(['（雜貨店的老闆娘看了紙條，愣了一下。）','阿梅？……她在臺北開店？','（她們是小時候在緬甸同一個村子長大的，三十年沒聯絡。）','（雜貨店的老闆娘多塞了一包東西和一張寫了電話的紙。）','乳扇是她的，這包是我的。叫她打給我。'])&&whoOf('阿梅？……她在臺北開店？')==='雜貨店的老闆娘'&&money.includes(-60)&&R('SQ10').state==='open'&&R('SQ10').step==='give'&&!(H.G.album||[]).some(a=>a.id==='side_SQ10'),J([said(),money,R('SQ10')]));
  set('2027-03-08',12); await shop('滇香小館',[0]);
  check('2. SQ10 回來以後下一次來滇香：（你把那包乳扇和紙條交給老闆娘。…）老闆娘「……她還記得我叫阿梅。」；這時才做完、相簿',seq(['（你把那包乳扇和紙條交給老闆娘。她先看紙條，看了很久。）','……她還記得我叫阿梅。'])&&whoOf('……她還記得我叫阿梅。')==='老闆娘'&&R('SQ10').state==='done'&&R('SQ10').doneDay===D('2027-03-08')&&(H.G.album||[]).some(a=>a.id==='side_SQ10'),J(said()));
  set('2027-03-09',12); await shop('滇香小館',[0]); const t1=has('（滇香的菜單多一行手寫「炸乳扇（限量）」。）'); set('2027-03-10',12); await shop('滇香小館',[0]); const t2=has('下禮拜我要去中和。……她說要教我做她媽媽的那道。')&&whoOf('下禮拜我要去中和。……她說要教我做她媽媽的那道。')==='老闆娘';
  set('2027-03-11',12); await shop('滇香小館',[0]);
  check('2. SQ10 痕跡：菜單多一行「炸乳扇（限量）」；之後老闆娘「下禮拜我要去中和。…」（一次）',t1&&t2&&!H.said.length);
  fresh('2027-03-01',12,'l118_dian'); know('滇香小館',4); await shop('滇香小館',[0]); const q1=outOf('ev_sq10_hwaxin'); set('2027-03-06',15.5); miss(q1); const q2=outOf('ev_sq10_hwaxin');
  check('2. SQ10 那個週六沒去：再排下一個週六（還在期限內）',!!q2&&keyOf(q2.day)==='2027-03-13'&&R('SQ10').state==='open',J(q2));
  set('2027-06-12',15.5); q2.state='planned'; R('SQ10').by=D('2027-06-13'); miss(q2);
  check('2. SQ10 下一個週六超過期限：過期（不扣數值）',R('SQ10').state==='lapsed');
  set('2027-06-14',12); await shop('滇香小館',[0]); const l=said(); set('2027-06-15',12); await shop('滇香小館',[0]);
  check('2. SQ10 過期一句：老闆娘「乳扇我託客人去中和買了。……那間店的老闆娘，我沒見到。」（一次）；沒有「炸乳扇（限量）」',J(l)===J(['老闆娘：乳扇我託客人去中和買了。……那間店的老闆娘，我沒見到。'])&&!has('（滇香的菜單多一行手寫「炸乳扇（限量）」。）'),J(l)); });
await sec('2 SQ11',async()=>{ fresh('2026-11-25',12,'l118_home'); know('巷口家常菜',4);   /* 大二上、單數月 25 日以後（週三）*/
  H.said=[]; H.opts=[]; H.picks=[0,0]; await L118.order(GM,'home');
  check('2. SQ11 從 118 巷點餐出現：（老闆娘從櫃台下面拿出一個鞋盒。）「客人不要的發票…」「……字太小了…同學，你幫我對。」；下次去對、期限這學期內',
    !!R('SQ11')&&R('SQ11').step==='check'&&seq(['（老闆娘從櫃台下面拿出一個鞋盒。）','客人不要的發票，我都留著。','……字太小了，我看不到。同學，你幫我對。'])&&whoOf('客人不要的發票，我都留著。')==='老闆娘'&&R('SQ11').by===CALENDAR.termDays('Y2S1').to,J(said()));
  await shop('巷口家常菜',[0]); const same=!H.said.length;
  set('2026-11-26',12); const h0=H.G.hour; money=[]; await shop('巷口家常菜',[0],{item:'排骨飯',price:95});
  check('2. SQ11 下次去：對完一盒（30 分）→（對到一張中了兩百塊。老闆娘看了很久。）「……二十年了，第一次中。」；沒餵過貓＝「兩百塊。今天你的排骨我請。」退這一餐；做完',
    same&&H.G.hour===h0+0.5&&seq(['（對到一張中了兩百塊。老闆娘看了很久。）','……二十年了，第一次中。','兩百塊。今天你的排骨我請。'])&&J(money)===J([95])&&R('SQ11').state==='done'&&!R('SQ11').cat,J([said(),money]));
  set('2026-11-27',12); await shop('巷口家常菜',[0]); check('2. SQ11 痕跡（沒有貓）：（櫃台多一個紙盒…「發票請投這裡」。）、沒有小字',has('（櫃台多一個紙盒，上面手寫「發票請投這裡」。）')&&!has('（下面多一行小字「中了買貓罐頭」。）'));
  fresh('2026-11-25',12,'l118_home'); know('巷口家常菜',4); PARK.rec(H.G).catName='麻糬'; PARK.rec(H.G).feedDay=D('2026-11-01'); await shop('巷口家常菜',[0]); set('2026-11-26',12); money=[]; await shop('巷口家常菜',[0],{item:'排骨飯',price:95});
  check('2. SQ11 在公園餵過貓：「兩百塊，拿去買罐頭。給公園那隻。」「我每天收攤經過，牠都在那張椅子上。」（不退錢）',seq(['兩百塊，拿去買罐頭。給公園那隻。','我每天收攤經過，牠都在那張椅子上。'])&&!has('兩百塊。今天你的排骨我請。')&&!money.length&&R('SQ11').cat);
  set('2026-11-27',12); await shop('巷口家常菜',[0]); const b=seq(['（櫃台多一個紙盒，上面手寫「發票請投這裡」。）','（下面多一行小字「中了買貓罐頭」。）']);
  set('2028-12-16',12); await shop('巷口家常菜',[0]); const a0=has('（那行小字劃掉，改成「中了捐給動物之家」。）'); set('2028-12-18',12); await shop('巷口家常菜',[0]); const a1=has('（那行小字劃掉，改成「中了捐給動物之家」。）');
  check('2. SQ11 痕跡（有貓）：紙盒＋「中了買貓罐頭」；2028-12-17 貓被領養以後那行小字換成「中了捐給動物之家」',b&&!a0&&a1);
  fresh('2026-11-25',12,'l118_home'); know('巷口家常菜',4); X().rec(H.G).SQ08={state:'done',step:'done',day:1}; await shop('巷口家常菜',[0]); set('2026-11-26',12); await shop('巷口家常菜',[0]);
  check('2. SQ11 SQ08 貼過餵貓表也算有貓那一支',has('兩百塊，拿去買罐頭。給公園那隻。'));
  fresh('2026-11-24',12,'l118_home'); know('巷口家常菜',5); const c1=X().canOffer(H.G,'SQ11'); set('2026-12-26',12); const c2=X().canOffer(H.G,'SQ11'); set('2026-01-26',12); const c3=X().canOffer(H.G,'SQ11');
  check('2. SQ11 只在單數月 25 日以後、大二上起',!c1&&!c2&&!c3);
  fresh('2026-11-25',12,'l118_home'); know('巷口家常菜',4); await shop('巷口家常菜',[0]); set('2026-12-28',12); X().lapse(H.G); await shop('巷口家常菜',[0]); const l=said(); set('2026-12-29',12); await shop('巷口家常菜',[0]);
  check('2. SQ11 過期：老闆娘「發票我叫我女兒對了。……都沒中。」；沒有紙盒',R('SQ11').state==='lapsed'&&J(l)===J(['老闆娘：發票我叫我女兒對了。……都沒中。'])&&!has('（櫃台多一個紙盒，上面手寫「發票請投這裡」。）'),J(l)); });
await sec('2 SQ12',async()=>{ fresh('2027-09-28',12,'l118_pasta'); know('Pasta 118',4); H.date(ZQ);   /* 大三上（週二）；交往中 */
  await shop('Pasta 118',[0,1]); const q=outOf('ev_sq12_pasta');
  check('2. SQ12 老闆「下禮拜一公休。……我想請你來當客人。」「我要跟我女朋友求婚。…」；交往中可以約她（一個人去／約她一起去）；下禮拜一 19:00',
    seq(['下禮拜一公休。……我想請你來當客人。','我要跟我女朋友求婚。店裡只有她一個人，她會發現。'])&&whoOf('下禮拜一公休。……我想請你來當客人。')==='老闆'&&J(H.opts[1])===J(['（一個人去）','（約'+SOCIAL.displayName(ZQ)+'一起去）'])&&R('SQ12').partner===ZQ&&!!q&&keyOf(q.day)==='2027-10-04'&&wd(q.day)===1&&q.h===19,J([H.opts,q]));
  const f0=SOCIAL.rel(ZQ).fam; await goOut(q,[]);
  check('2. SQ12 那一晚（帶子晴去）：女朋友「你們是他找來的吧。」、子晴「我們很認真在演耶。」（AA_408 6）、她早就知道、說「好」、「可以幫我們拍一張嗎？」、（老闆那一晚沒收錢。）；她熟悉 +1；做完',
    !has('你是他找來的吧。')&&whoOf('我們很認真在演耶。')===SOCIAL.displayName(ZQ)&&seq(['（女朋友進門，看了一下店裡唯一一桌客人，走過來小聲說。）','你們是他找來的吧。','我們很認真在演耶。','（她早就知道了。她看到他訂了一個戒指盒，盒子放在廚房的抽屜裡兩個禮拜。）','（她坐回吧檯，等甜點上來，打開，說「好」，然後轉頭問你。）','可以幫我們拍一張嗎？','（老闆那一晚沒收錢。）'])&&SOCIAL.rel(ZQ).fam===f0+1&&R('SQ12').state==='done',J(said()));
  set('2027-10-05',12); await shop('Pasta 118',[0]); const w=has('（吧檯後面的牆多一張照片（兩個人，後面是窗邊那一桌）。）'); set('2027-10-06',12); await shop('Pasta 118',[0]);
  check('2. SQ12 痕跡：吧檯後面的照片（一次）',w&&!H.said.length);
  set('2027-10-12',12); H.said=[]; H.opts=[]; H.picks=[0]; await L118.order(GM,'pasta'); const g0=H.said[0]&&H.said[0].t;
  set('2028-03-07',12); H.said=[]; H.opts=[]; H.picks=[0]; await L118.order(GM,'pasta');
  check('2. SQ12 下學期起（大三下）一個人來：老闆「一位嗎？吧檯老位子。」、她補「窗邊也有位子喔。」（這學期還是原本的招呼）',g0==='一位嗎？吧檯可以嗎？'&&H.said[0].t==='一位嗎？吧檯老位子。'&&H.said[1].t==='窗邊也有位子喔。'&&H.said[1].who==='老闆的女朋友',J([g0,said()]));
  fresh('2027-09-28',12,'l118_pasta'); know('Pasta 118',4); await shop('Pasta 118',[0]); const nq=!H.opts[1]; const q2=outOf('ev_sq12_pasta'); set('2027-10-04',20); miss(q2);
  check('2. SQ12 沒交往：不問；那天沒去＝過期',nq&&R('SQ12').state==='lapsed'&&!R('SQ12').partner);
  set('2027-10-05',12); await shop('Pasta 118',[0]); const l=said(); set('2027-10-06',12); await shop('Pasta 118',[0]); const nw=!has('（吧檯後面的牆多一張照片（兩個人，後面是窗邊那一桌）。）');
  set('2028-03-07',12); H.said=[]; H.opts=[]; H.picks=[0]; await L118.order(GM,'pasta');
  check('2. SQ12 過期：老闆「那天我一個人顧店。……她說好。」；牆上沒有照片；下學期她照樣在店裡出餐',J(l)===J(['老闆：那天我一個人顧店。……她說好。'])&&nw&&H.said[1]&&H.said[1].t==='窗邊也有位子喔。',J([l,said()])); });
await sec('2 SQ13',async()=>{ fresh('2026-10-05',12,'l118_korea'); know('韓食小廚',4);
  H.said=[]; H.opts=[]; H.picks=[0,0,2]; await L118.order(GM,'korea');
  check('2. SQ13 從 118 巷點餐出現：老闆「我太太回韓國…」「我照她的方法醃了一罐。……你幫我吃吃看。」；第一次「這罐怎樣？」（比上次好。／比上次差。／一樣。）',
    !!R('SQ13')&&seq(['我太太回韓國照顧她媽媽，要三個月。泡菜都是她醃的。','我照她的方法醃了一罐。……你幫我吃吃看。','這罐怎樣？'])&&J(H.opts[H.opts.length-1])===J(['「比上次好。」','「比上次差。」','「一樣。」'])&&J(R('SQ13').tastes)===J([2])&&R('SQ13').by===CALENDAR.termDays('Y2S1').to,J([said(),H.opts]));
  await shop('韓食小廚',[0]); const same=!H.said.length; set('2026-10-06',12); await shop('韓食小廚',[1]); const t2=has('這罐怎樣？')&&!has('這罐是她從韓國寄來的。');
  set('2026-10-07',12); await shop('韓食小廚',[0]);
  check('2. SQ13 一天一次；第三次選「比上次好。」：「這罐是她從韓國寄來的。」「……你分得出來。」「我分不出來。…」',same&&t2&&seq(['這罐怎樣？','這罐是她從韓國寄來的。','……你分得出來。','我分不出來。我吃了三個月自己的，已經忘記她的是什麼味道了。'])&&R('SQ13').step==='wait'&&R('SQ13').wait===D('2026-10-05')+90,J(said()));
  set('2026-12-20',12); await shop('韓食小廚',[0]); const early=!H.said.length; set(keyOf(D('2026-10-05')+90),12); await shop('韓食小廚',[0]);
  check('2. SQ13 三個月後：（老闆娘回來了。）（櫃台旁邊多一個人在切菜。）；做完',early&&seq(['（老闆娘回來了。）','（櫃台旁邊多一個人在切菜。）'])&&R('SQ13').state==='done');
  const d0=H.G.day; set(keyOf(d0+1),12); await shop('韓食小廚',[0]); const j=has('（小菜櫃多一個玻璃罐，貼著手寫的標籤「她的」。）'); set(keyOf(d0+2),12); await shop('韓食小廚',[0]); const g=has('小菜可以續喔。……那罐不行。');
  check('2. SQ13 痕跡：「她的」玻璃罐；之後老闆「小菜可以續喔。……那罐不行。」（一次）',j&&g);
  fresh('2026-10-05',12,'l118_korea'); know('韓食小廚',4); await shop('韓食小廚',[0,0]); set('2026-10-06',12); await shop('韓食小廚',[0]); set('2026-10-07',12); await shop('韓食小廚',[2]);
  check('2. SQ13 第三次選別的：「……我也分不出來。」（他笑了。）「那就好。我醃得還可以。」',seq(['這罐是她從韓國寄來的。','……我也分不出來。','（他笑了。）','那就好。我醃得還可以。'])&&!has('……你分得出來。'));
  fresh('2026-10-05',12,'l118_korea'); know('韓食小廚',4); await shop('韓食小廚',[0,0]); set('2026-12-28',12); X().lapse(H.G); await shop('韓食小廚',[0]); const l=said();
  set('2026-12-29',12); await shop('韓食小廚',[0]); const lj=has('（小菜櫃多一個玻璃罐，貼著手寫的標籤「她的」。）'); set('2026-12-30',12); await shop('韓食小廚',[0]);
  check('2. SQ13 過期：老闆「泡菜我自己吃完了。……還是分不出來。」；「她的」玻璃罐照樣有（沒有那一句招呼）',R('SQ13').state==='lapsed'&&J(l)===J(['老闆：泡菜我自己吃完了。……還是分不出來。'])&&lj&&!has('小菜可以續喔。……那罐不行。'),J(l)); });
await sec('2 SQ14',async()=>{ fresh('2028-03-08',15,'wenzhou'); PARK.rec(H.G).catName='麻糬'; know('溫州街・一盞',4);   /* 大三下（週三）*/
  H.said=[]; H.opts=[]; H.picks=[0,0]; await WZS.interact(GM,{wzShop:'teahouse',kind:'tea'});
  check('2. SQ14 一盞茶屋喝完茶出現（WZS.interact 接線）：蘇姨「牠的腳好了。…」「……我走不開。外出籠在後面。」；兩週內；貓的按鈕換成「看麻糬」',
    !!R('SQ14')&&R('SQ14').step==='cage'&&seq(['牠的腳好了。獸醫說要回診，順便打預防針。','……我走不開。外出籠在後面。'])&&whoOf('……我走不開。外出籠在後面。')==='蘇姨'&&R('SQ14').by===H.G.day+14&&PARK.catLabel(H.G)==='看麻糬',J(said()));
  H.said=[]; H.opts=[]; const rr=await PARK.interact(GM,{park:'cat'}); const q=outOf('ev_sq14_vet');
  check('2. SQ14 公園「看」貓：（牠沒有掙扎，只是一直看著你。）（沒有摸／餵選單）→ 走路 15 分鐘去動物醫院',rr==='cage'&&has('（牠沒有掙扎，只是一直看著你。）')&&!H.opts.length&&!!q&&q.place==='羅斯福路・動物醫院'&&/15 分鐘/.test(q.travel),J([rr,said(),q]));
  await goOut(q,[]);
  check('2. SQ14 動物醫院（2D vet_clinic）：晶片的登記資料、名字欄寫「豆花」；回到茶屋：蘇姨三句、（蘇姨把那張單子收進櫃台的抽屜…）；做完',
    seq(['（獸醫掃晶片，螢幕上跳出登記資料：十二年前登記的，飼主是一位陳先生，地址就是茶屋那一號。）','（名字欄寫「豆花」。）','（回到茶屋，蘇姨看了單子很久。）','……是我先生。他走了五年了。','他說要帶牠去打晶片。我以為他沒去。','他走了以後，牠不肯待在屋子裡，每天跑去公園。我就讓牠去。','（蘇姨把那張單子收進櫃台的抽屜，請你喝一壺茶，不收錢。）'])&&whoOf('……是我先生。他走了五年了。')==='蘇姨'&&R('SQ14').state==='done'&&PARK.catLabel(H.G)==='摸摸麻糬',J(said()));
  set('2028-03-09',15); H.said=[]; H.picks=[0]; await WZS.interact(GM,{wzShop:'teahouse',kind:'tea'}); const p=has('（茶屋櫃台多一張貓的照片，照片很舊，背景是茶屋的院子。）');
  set('2028-03-10',15); H.said=[]; H.picks=[0]; await WZS.interact(GM,{wzShop:'teahouse',kind:'tea'}); const g=has('豆花今天有去公園嗎？');
  check('2. SQ14 痕跡：櫃台的舊照片；之後蘇姨「豆花今天有去公園嗎？」（一次）',p&&g);
  H.G.flags.ZQ_CAT_NIGHT=true; set('2028-12-15',12.1); ph(); const m=msgs('p:'+ZQ);
  check('2. SQ14 接 AA_397 3-2：12/15 子晴的訊息後面多兩句（晶片、她叫豆花）',J(m.slice(-4))===J(['（照片：獸醫院的診療台，牠縮在毛巾裡）','感冒，老了。醫生說冬天不要待在外面。','牠有晶片。醫生說飼主是茶屋的人。','我去問了。阿姨簽了一張單子給我。……她說牠叫豆花。']),J(m));
  set('2028-12-17',16); const N=PARK.notices(H.G).find(q=>q[0]==='領養');
  check('2. SQ14 12/17 公布欄的領養告示照舊，後面多一行「（豆花）」',!!N&&J(N[1])===J(['「麻糬已經被領養了。謝謝大家這幾年的照顧。牠現在在一個有電暖器的家。——里長」','（豆花）']),J(N));
  H.said=[]; H.picks=[PARK.notices(H.G).findIndex(q=>q[0]==='領養'),9]; await PARK.interact(GM,{park:'notice'}); check('2. SQ14 看告示：兩行都唸',has('（豆花）'));
  fresh('2028-12-15',12.1,'dorm',{ZQ_CAT_NIGHT:true}); PARK.rec(H.G).catName='麻糬'; ph(); const m2=msgs('p:'+ZQ); set('2028-12-17',16); const N2=PARK.notices(H.G).find(q=>q[0]==='領養');
  check('2. SQ14 沒演過：12/15 只有原本兩句；12/17 只有那張紙',J(m2)===J(['（照片：獸醫院的診療台，牠縮在毛巾裡）','感冒，老了。醫生說冬天不要待在外面。'])&&typeof N2[1]==='string',J([m2,N2]));
  fresh('2028-03-08',15,'wenzhou'); know('溫州街・一盞',5); const n1=X().canOffer(H.G,'SQ14'); PARK.rec(H.G).catName='麻糬'; set('2028-02-25',15); const n2=X().canOffer(H.G,'SQ14'); set('2028-06-05',15); const n3=X().canOffer(H.G,'SQ14'); set('2028-04-05',15); const y=X().canOffer(H.G,'SQ14');
  check('2. SQ14 只在大三下 3～5 月、認得那隻貓（取過名字）',!n1&&!n2&&!n3&&y);
  await shop('溫州街・一盞',[0]); set('2028-04-21',15); X().lapse(H.G); await shop('溫州街・一盞',[0]); const l=said(); H.G.flags.ZQ_CAT_NIGHT=true; set('2028-12-15',12.1); ph();
  check('2. SQ14 過期：蘇姨「回診我請隔壁幫忙帶了。」；12/15 照沒演過的版本',R('SQ14').state==='lapsed'&&J(l)===J(['蘇姨：回診我請隔壁幫忙帶了。'])&&!msgs('p:'+ZQ).includes('牠有晶片。醫生說飼主是茶屋的人。'),J(l)); });
await sec('2 SQ15',async()=>{ fresh('2026-10-06',15,'bookstore'); H.FRIEND(SIS); H.G.flags.met_sis=true; know('舊路書房',4);   /* 大二上 10/5～11/27 */
  H.said=[]; H.opts=[]; H.picks=['只是看看',0]; await STORY.bookshop(GM);
  check('2. SQ15 舊路書房（bookshop 接線，來過幾次照樣記）：書店老闆「有人拿來一箱法律系的書。…」「……你是法律系的吧。幫我看一下。」；一週內去整理',
    !!R('SQ15')&&R('SQ15').step==='sort'&&seq(['有人拿來一箱法律系的書。我分不出哪些版本太舊、不能賣了。','……你是法律系的吧。幫我看一下。'])&&whoOf('……你是法律系的吧。幫我看一下。')==='書店老闆'&&R('SQ15').by===H.G.day+7&&EAT.count(H.G,'舊路書房')===5,J(said()));
  set('2026-10-07',15); const h0=H.G.hour; money=[]; H.said=[]; H.opts=[]; H.picks=['只是看看',0]; await STORY.bookshop(GM);
  check('2. SQ15 下次去整理（30 分）：看那一箱、封面內頁「溫書瑀」、問號；書店老闆「一個女生拿來的…」；三選一；「這本我買。」→「八十。……你認識她？」扣 80；做完',
    H.G.hour===h0+0.5&&seq(['（六法全書兩本、刑法總則一本、一本很舊的民法總則。）','（民法總則的封面內頁，寫著「溫書瑀」。）','（每一頁的邊邊都寫滿了字。很多問號，有些問號後來被劃掉了。）','一個女生拿來的，很瘦，講話很快。她說這箱不用算錢。','八十。……你認識她？'])&&!has('（翻到善意第三人那一頁，她用紅筆圈起來，旁邊寫：「善意＝不知道。不是心地善良。」）')
    &&J(H.opts[H.opts.length-1])===J(['「這本我買。」','「幫我留著，我問問她。」','「這幾本修法了，不能賣。」'])&&money.includes(-80)&&R('SQ15').state==='done'&&H.G.flags.SQ15_BOOK==='bought',J([said(),money]));
  const it=STORY.roomItemList(H.G).find(x=>x[0]==='學姊大一的民法總則'); H.said=[]; if(it) await it[2](GM); const look=H.said.map(x=>x.t);
  const ex=CLS.examList(H.G,'Y2S1').find(e=>e.kind==='mid'); set(keyOf(ex.day-1),21,'dorm'); H.said=[]; await it[2](GM); const eve=H.said.map(x=>x.t); H.said=[]; await it[2](GM); const eve2=H.said.map(x=>x.t);
  check('2. SQ15 房間物品「學姊大一的民法總則」：平常＝AA_408 6 那一句（字比現在圓一點）；期中考前一晚＝（最後一頁，她寫了一行小字：『考完了。下次不要熬夜。』）（一次）',!!it&&J(look)===J(['（學姊大一的民法總則。封面內頁寫著『溫書瑀』，字比現在圓一點。）'])&&J(eve)===J(['（最後一頁，她寫了一行小字：『考完了。下次不要熬夜。』）'])&&J(eve2)===J(look),J([look,eve,eve2]));
  set('2026-10-09',16,'cafe'); const f0=SOCIAL.rel(SIS).fam, c0=SOCIAL.rel(SIS).comf; H.said=[]; const pt=await SISY23.preTalk(GM); const pre=said();
  const ps=seq(['（你把那本民法總則放在她桌上。）','……這本怎麼會在你這裡。','我賣掉的時候，以為不會再看到。','裡面的字很醜。問號很多。','……你留著吧。裡面錯的地方，你現在用得到。'])&&!has('書店老闆打電話問我？……不是。是你在那裡整理。')&&whoOf('……這本怎麼會在你這裡。')===SOCIAL.displayName(SIS);
  H.said=[]; const pt2=await SISY23.preTalk(GM);
  check('2. SQ15 之後找學姊說話先演（SISY23.preTalk）：（你把那本民法總則放在她桌上。）「……這本怎麼會在你這裡。」「我賣掉的時候，以為不會再看到。」「裡面的字很醜。問號很多。」「……你留著吧。…」；熟悉 +2、自在 +2；一次',
    pt&&ps&&SOCIAL.rel(SIS).fam===f0+2&&SOCIAL.rel(SIS).comf===c0+2&&!pt2,J([pre,pt,pt2,SOCIAL.rel(SIS).fam-f0,SOCIAL.rel(SIS).comf-c0]));
  fresh('2026-10-06',15,'bookstore'); H.FRIEND(SIS); H.G.flags.met_sis=true; know('舊路書房',4); H.G.events.done.ev_sis_family_dinner=1; await shop('舊路書房',[0]); set('2026-10-08',15); money=[]; await shop('舊路書房',[1]);
  check('2. SQ15 演過大一上家聚：多（翻到善意第三人那一頁…）；「幫我留著，我問問她。」→「好。留一個禮拜。」；一週內找學姊',has('（翻到善意第三人那一頁，她用紅筆圈起來，旁邊寫：「善意＝不知道。不是心地善良。」）')&&has('好。留一個禮拜。')&&!money.length&&R('SQ15').step==='sis'&&H.G.flags.SQ15_BOOK==='asked'&&R('SQ15').by===H.G.day+7);
  set('2026-10-10',16,'cafe'); H.said=[]; await X().sisPre(GM); const pa=has('書店老闆打電話問我？……不是。是你在那裡整理。')&&!has('我賣掉的時候，以為不會再看到。');
  set('2026-10-11',15,'bookstore'); money=[]; await shop('舊路書房',[0]);
  check('2. SQ15「問問她」：學姊那一段換「書店老闆打電話問我？……不是。是你在那裡整理。」；下一次去書店買下來（八十）「她說給你的？好。」；做完、房間物品',pa&&has('她說給你的？好。')&&money.includes(-80)&&R('SQ15').state==='done'&&STORY.roomItemList(H.G).some(x=>x[0]==='學姊大一的民法總則'));
  fresh('2026-10-06',15,'bookstore'); H.FRIEND(SIS); H.G.flags.met_sis=true; know('舊路書房',4); await shop('舊路書房',[0]); set('2026-10-08',15); await shop('舊路書房',[2]); set('2026-10-10',16,'cafe'); const pr=await X().sisPre(GM);
  check('2. SQ15「這幾本修法了，不能賣。」→「那這本我拿去回收。」；照常做完；不能買、學姊那一段不演',has('那這本我拿去回收。')&&R('SQ15').state==='done'&&H.G.flags.SQ15_BOOK==='recycled'&&!pr&&!STORY.roomItemList(H.G).some(x=>x[0]==='學姊大一的民法總則'));
  fresh('2026-10-06',15,'bookstore'); H.FRIEND(SIS); H.G.flags.met_sis=true; know('舊路書房',4); await shop('舊路書房',[0]); set('2026-10-14',15); await shop('舊路書房',[0]); const l=said();
  check('2. SQ15 過期：書店老闆「那箱書，我拿去回收了。」（＝不能賣那一支）',R('SQ15').state==='lapsed'&&J(l)===J(['書店老闆：那箱書，我拿去回收了。'])&&H.G.flags.SQ15_BOOK==='recycled',J(l));
  fresh('2026-10-06',15,'bookstore'); know('舊路書房',5); const nm=X().canOffer(H.G,'SQ15'); H.FRIEND(SIS); set('2026-11-28',15); const late=X().canOffer(H.G,'SQ15'); set('2026-11-27',15); const y=X().canOffer(H.G,'SQ15');
  check('2. SQ15 只在大二上 10/5～11/27、認識學姊',!nm&&!late&&y); });
await sec('2 SQ17',async()=>{ fresh('2027-03-02',12,'l118_tea'); know('一一八茶飲',4);   /* 大二下 3 月（週二）*/
  H.said=[]; H.opts=[]; H.picks=[0,0,0]; await L118.order(GM,'tea');
  check('2. SQ17 從 118 巷點飲料出現：店員「我在申請交換。下禮拜英文面試。」「你可以問我問題嗎？…」；第一次在前兩題裡選（AA_408 6）；「為什麼想去？」→ 中文、英文各一句；期限：那個月',
    !!R('SQ17')&&seq(['我在申請交換。下禮拜英文面試。','你可以問我問題嗎？我一邊做飲料一邊答。','我想去一個沒有人認識我的地方。……先在那邊點一次飲料，看他們會不會記得我。','I want to see if I can start over somewhere no one knows me.'])&&J(H.opts[H.opts.length-1])===J(['「為什麼想去？」','「去了想學什麼？」'])&&R('SQ17').by===D('2027-03-31'),J([said(),H.opts]));
  await shop('一一八茶飲',[0]); const same=!H.said.length; set('2027-03-03',12); await shop('一一八茶飲',[0]); const o2=H.opts[0]; const n2=J(said())===J(['店員：日文。還有……怎麼一個人吃飯。','店員：Japanese. And how to eat alone.']);
  set('2027-03-04',12); await shop('一一八茶飲',[0,1]); const o3=H.opts[0], o4=H.opts[1];
  check('2. SQ17 一天一題、問過的不再出現；第二次只剩「去了想學什麼？」（中文、英文）；第三次只有「如果沒上呢？」→「加油。」＝四月底以後當面說',same&&J(o2)===J(['「去了想學什麼？」'])&&n2&&J(o3)===J(['「如果沒上呢？」'])&&J(o4)===J(['「上了跟我說。」','「加油。」'])&&R('SQ17').step==='result'&&!R('SQ17').phone&&R('SQ17').wait===D('2027-04-25'),J([o2,o3,o4,R('SQ17')]));
  set('2027-04-20',12); await shop('一一八茶飲',[0]); const early=!H.said.length; set('2027-04-26',12); await shop('一一八茶飲',[0]);
  check('2. SQ17 四月底以後下一次點飲料：店員當面說「上了。京都。」；做完',early&&has('上了。京都。')&&R('SQ17').state==='done');
  set('2028-02-25',12); await shop('一一八茶飲',[0]); const b=!H.said.length; set('2028-03-02',12); await shop('一一八茶飲',[0]); const t=has('（窗口換了一個新的店員。牆上貼一張京都的照片，旁邊寫「她說：甜度冰塊記得問清楚」。）');
  check('2. SQ17 痕跡：大三下（2028-03 起）窗口換了新的店員、京都的照片（一次）',b&&t);
  H.FRIEND(AN); INV.addContact(H.G,AN); set('2028-04-20',21.2); ph(); const m=msgs('p:'+AN);
  check('2. SQ17 接以安：2028-04-20 21:00 以安兩句（交流會遇到她、你的人緣比我以為的好）',J(m.slice(-2))===J(['今天在學校的交流會遇到一個臺灣人。她說她以前在一一八茶飲打工。','她說你幫她練過面試。……你的人緣比我以為的好。']),J(m));
  fresh('2027-03-02',12,'l118_tea'); know('一一八茶飲',4); await shop('一一八茶飲',[0,0]); set('2027-04-02',12); await shop('一一八茶飲',[0]); const l=said();
  set('2028-03-02',12); await shop('一一八茶飲',[0]); const nt=!H.said.length; H.FRIEND(AN); INV.addContact(H.G,AN); set('2028-04-20',21.2); ph();
  check('2. SQ17 過期：店員「面試完了。結果四月才知道。」；之後沒有京都的照片、沒有以安那則',R('SQ17').state==='lapsed'&&J(l)===J(['店員：面試完了。結果四月才知道。'])&&nt&&!msgs('p:'+AN).some(t=>/一一八茶飲/.test(t)),J(l));
  fresh('2027-05-03',12,'l118_tea'); know('一一八茶飲',5); check('2. SQ17 只在大二下 3～4 月',!X().canOffer(H.G,'SQ17')&&(set('2027-02-25',12),!X().canOffer(H.G,'SQ17'))); });
await sec('2 SQ18',async()=>{ fresh('2027-03-03',15,'gongguan'); know('清葉茶行',4);   /* 大二下（週三）*/
  H.said=[]; H.opts=[]; H.picks=[0,0]; await STORY.interact({shop:'tea'},GM); const q=outOf('ev_sq18_park');
  check('2. SQ18 清葉茶行買飲料出現（counter 接線，點過幾次照樣記）：茶行老闆娘「週日早上有一張二十杯的訂單…」「我店裡走不開。…」；那個週日 08:30',
    !!R('SQ18')&&seq(['週日早上有一張二十杯的訂單，要送到溫州街的小公園。','我店裡走不開。你幫我送，運費算你一杯。'])&&whoOf('我店裡走不開。你幫我送，運費算你一杯。')==='茶行老闆娘'&&!!q&&keyOf(q.day)==='2027-03-07'&&wd(q.day)===0&&q.h===8.5&&R('SQ18').by===q.day,J([said(),q]));
  money=[]; await goOut(q,[]);
  check('2. SQ18 清掃日：（十幾個人在掃落葉…）（阿伯…戴上一頂寫著「里長」的帽子。）「怎麼，你以為里長是誰？」；沒有 SQ08＝「公布欄那些紙，都是我貼的。」；掃了半小時、下了一盤（贏：「……再一盤。」）；阿伯「這杯是你的。茶行說，運費算你一杯。」（AA_408 6，不給錢）；做完',
    !money.length&&seq(['（公園裡十幾個人在掃落葉、清水溝，是里民的清掃日。）','（訂飲料的是在涼亭下象棋的那位阿伯。他從口袋拿出一疊零錢付給你，戴上一頂寫著「里長」的帽子。）','怎麼，你以為里長是誰？','公布欄那些紙，都是我貼的。','（你留下來掃了半小時落葉。阿伯讓你一子，下了一盤。）','……再一盤。','這杯是你的。茶行說，運費算你一杯。'])&&!has('餵貓那張表，是你貼的吧。……星期日那一格，是我。')&&whoOf('怎麼，你以為里長是誰？')==='阿伯'&&R('SQ18').state==='done',J(said()));
  X().rec(H.G).SQ08={state:'done',step:'done',day:1,posted:D('2026-10-09')}; set('2027-03-10',16,'wenzhou'); const N=PARK.notices(H.G).find(x=>/^餵貓表/.test(x[0]));
  check('2. SQ18 痕跡：公布欄「——里長」的字條「看」多一行（你認得這個字。）',!!N&&N[2]==='（你認得這個字。）'&&!PARK.notices(H.G).filter(x=>!/——里長/.test([].concat(x[1]).join(''))).some(x=>x[2]==='（你認得這個字。）'),J(N));
  H.said=[]; H.picks=[PARK.notices(H.G).findIndex(x=>/^餵貓表/.test(x[0])),9]; await PARK.interact(GM,{park:'notice'}); const nr=has('（你認得這個字。）');
  PARK.rec(H.G).catName='麻糬'; set('2027-10-13',16,'wenzhou'); H.said=[]; H.opts=[]; H.picks=[0]; await PARK.interact(GM,{park:'cat'});
  check('2. SQ18 痕跡：大三起名牌（請不要再餵我…——里長）「看」多一行（阿伯的字。）',nr&&seq(['脖子上的名牌寫著：請不要再餵我，我很胖。——里長','（阿伯的字。）']),J(said()));
  fresh('2027-03-03',15,'gongguan'); know('清葉茶行',4); X().rec(H.G).SQ08={state:'done',step:'done',day:1,posted:D('2026-10-09')}; await shop('清葉茶行',[0]); await goOut(outOf('ev_sq18_park'),[]);
  check('2. SQ18 有 SQ08（餵貓表是你貼的）：「餵貓那張表，是你貼的吧。……星期日那一格，是我。」',has('餵貓那張表，是你貼的吧。……星期日那一格，是我。')&&!has('公布欄那些紙，都是我貼的。'));
  fresh('2028-10-04',15,'gongguan'); know('清葉茶行',4); await shop('清葉茶行',[0]); await goOut(outOf('ev_sq18_park'),[]); check('2. SQ18 大四：阿伯那一盤照 WZ-P3 大四的句子「律師，再一盤。」',has('律師，再一盤。')&&!has('……再一盤。'));
  fresh('2027-03-03',15,'gongguan'); know('清葉茶行',4); X().rec(H.G).SQ08={state:'done',step:'done',day:1,posted:D('2026-10-09')}; await shop('清葉茶行',[0]); const q2=outOf('ev_sq18_park'); set('2027-03-07',10); miss(q2);
  set('2027-03-08',15); await shop('清葉茶行',[0]); const l=said(); set('2027-03-10',16,'wenzhou'); const N2=PARK.notices(H.G).find(x=>/^餵貓表/.test(x[0]));
  check('2. SQ18 那個週日沒去＝過期：茶行老闆娘「那二十杯，我自己送了。」；之後不出現（你認得這個字。）',R('SQ18').state==='lapsed'&&J(l)===J(['茶行老闆娘：那二十杯，我自己送了。'])&&!N2[2],J([l,N2]));
  fresh('2027-02-20',15,'gongguan'); know('清葉茶行',5); check('2. SQ18 大二下起',!X().canOffer(H.G,'SQ18')&&(set('2027-03-01',15),X().canOffer(H.G,'SQ18'))); });
await sec('2 SQ19',async()=>{ fresh('2026-10-07',12,'wz_teishoku'); know('巷子裡定食',4); SOCIAL.remember(XC,'FIRST_MET','');   /* 大二上（週三）*/
  H.said=[]; H.opts=[]; H.picks=[0,0]; await WZS.order364(GM,'teishoku');
  check('2. SQ19 定食店點餐出現（order364）：定食店長「昨天有個女生把筆記本忘在這裡。…」「……你認識嗎？」；「看」筆記本：封面「吳芯慈」、最後一頁那張表、「下次換我先約她。」；一週內還她',
    !!R('SQ19')&&R('SQ19').step==='ret'&&seq(['昨天有個女生把筆記本忘在這裡。封面寫法律系。','……你認識嗎？','（封面寫著「吳芯慈」，裡面每一頁都是三種顏色的筆，像印刷的。）','（筆記本最後一頁不是筆記。是一張兩欄的表，左邊寫「以安」，右邊寫「我」。一格一格是考試、報告、發言的次數。）','（表的最下面另外寫了一行，字比較小：「下次換我先約她。」）'])&&whoOf('……你認識嗎？')==='定食店長'&&R('SQ19').by===H.G.day+7,J(said()));
  set('2026-10-08',12,'campus'); const due=EVENTS.check(X().XC_EV); H.said=[]; H.opts=[]; H.picks=[0]; await EVENTS.run(X().XC_EV);
  check('2. SQ19 找芯慈說話（interact 事件）：（她接過筆記本，第一件事是翻到最後一頁。）「……你看了嗎？」；「看了最後一行。」→「……喔。」（她把那一頁摺起來。）「那一行，我會自己去做。」；做完',
    due&&seq(['（她接過筆記本，第一件事是翻到最後一頁。）','……你看了嗎？','……喔。','（她把那一頁摺起來。）','那一行，我會自己去做。'])&&!has('……謝謝。')&&J(H.opts[0])===J(['「看了最後一行。」','「沒有。」'])&&R('SQ19').state==='done'&&R('SQ19').saw&&!H.G.flags.SQ19_SAW&&!EVENTS.check(X().XC_EV)&&X().XC_EV.participants[0]===XC&&X().XC_EV.trigger==='interact',J(said()));
  LC(); ph(); set('2026-10-22',8.9); ph(); const g0=grp().length; set('2026-10-22',9.1); ph(); const g1=grp().map(m=>[m.from,m.text]); ph(); set('2026-10-23',9.1); ph(); const g2=grp().length;
  check('2. SQ19 兩週以後 09:00：芯慈在班上群組約讀書會三則（AA_408 6，取代兩句旁白；一次）',!g0&&J(g1)===J([[XC,'週四晚上我借了一間討論室，讀這週的進度。要來的跟我說。'],[XC,'@以安 妳要來嗎？'],[AN,'好。']])&&g2===3&&grp().every(m=>m.th==='g:law_class'),J(g1));
  set('2026-10-23',12,'wz_teishoku'); await shop('巷子裡定食',[0]); const b=has('（定食店的櫃台多一個小籃子，寫著「失物」。）'); set('2026-10-24',12); await shop('巷子裡定食',[0]);
  check('2. SQ19 痕跡：櫃台的「失物」籃子；之後定食店長「今天沒有人忘東西。」（一次）',b&&has('今天沒有人忘東西。')&&whoOf('今天沒有人忘東西。')==='定食店長');
  fresh('2026-10-07',12,'wz_teishoku'); know('巷子裡定食',4); SOCIAL.remember(XC,'FIRST_MET',''); await shop('巷子裡定食',[0]); set('2026-10-08',12,'campus'); H.said=[]; H.picks=[1]; await EVENTS.run(X().XC_EV); LC(); ph(); set('2026-10-25',12); ph();
  check('2. SQ19「沒有。」→「……謝謝。」（她看了你一下，好像不太相信。）；沒有讀書會那一則',seq(['……謝謝。','（她看了你一下，好像不太相信。）'])&&!has('……喔。')&&R('SQ19').state==='done'&&!grp().length);
  fresh('2026-10-07',12,'wz_teishoku'); know('巷子裡定食',4); SOCIAL.remember(XC,'FIRST_MET',''); LC(); await shop('巷子裡定食',[0]); set('2026-10-15',12); X().lapse(H.G); const ev=EVENTS.check(X().XC_EV); await shop('巷子裡定食',[0]); const l=said();
  set('2026-10-30',12); ph(); const lg=grp().length===3&&grp()[0].day===D('2026-10-29'); set('2026-10-31',12); await shop('巷子裡定食',[0]);
  check('2. SQ19 過期：不能還了；定食店長「筆記本那個女生，自己回來拿了。」；讀書會那一則照樣有（她自己會約）；沒有籃子',R('SQ19').state==='lapsed'&&!ev&&J(l)===J(['定食店長：筆記本那個女生，自己回來拿了。'])&&lg&&!has('（定食店的櫃台多一個小籃子，寫著「失物」。）'),J(l));
  fresh('2026-10-07',12,'wz_teishoku'); know('巷子裡定食',5); check('2. SQ19 要認識芯慈',!X().canOffer(H.G,'SQ19')); });
await sec('2 SQ20',async()=>{ fresh('2027-09-28',9,'wz_brunch'); know('溫州街・半熟',4); H.FAMILIAR(BH);   /* 大三上（週二）；柏翰熟悉 */
  H.said=[]; H.opts=[]; H.picks=[0,0,1]; await WZS.interact(GM,{wzShop:'brunch',kind:'cashier'}); const q=outOf('ev_sq20_s1');
  check('2. SQ20 半熟點餐出現（WZS.interact 接線）：小米姐「小蕙下個月要考證照，烘焙的。」「她每次練習都超時。…你可以嗎？」；柏翰熟悉以上多「我找一個更會計時的人。」；週六 08:00',
    !!R('SQ20')&&seq(['小蕙下個月要考證照，烘焙的。','她每次練習都超時。我在煎蛋，沒辦法幫她計時。你可以嗎？'])&&whoOf('小蕙下個月要考證照，烘焙的。')==='小米姐'&&J(H.opts[H.opts.length-1])===J(['（自己幫她計時）','「我找一個更會計時的人。」'])&&R('SQ20').bohan&&!!q&&keyOf(q.day)==='2027-10-02'&&q.h===8&&R('SQ20').by===H.G.day+30,J([said(),H.opts,q]));
  await goOut(q,[]); const q2=outOf('ev_sq20_s2');
  check('2. SQ20 第一次：柏翰「每個步驟我分開計。你們看這張表。」（沒有自己計時那三行）；排下一個週六（第二次）',has('每個步驟我分開計。你們看這張表。')&&!has('……超過了嗎？')&&!has('（你用手機的碼錶。小蕙每做完一步，就看你一眼。）')&&whoOf('每個步驟我分開計。你們看這張表。')===SOCIAL.displayName(BH)&&!!q2&&keyOf(q2.day)==='2027-10-09'&&R('SQ20').step==='s2',J([said(),q2]));
  await goOut(q2,[]);
  check('2. SQ20 第二次練完（找了柏翰：沒有自己計時那一行旁白）：（小米姐把圍裙脫下來。）「……我也報了。」「我考過兩次…」「這次跟她一起考。不要告訴她，她會緊張。」',!has('（這次她在烤箱那一步沒有看你。）')&&seq(['（第二個週末練完，小米姐把圍裙脫下來。）','……我也報了。','我考過兩次，都沒過。那時候在上班，沒時間練。','這次跟她一起考。不要告訴她，她會緊張。'])&&whoOf('……我也報了。')==='小米姐'&&R('SQ20').step==='wait');
  set('2027-10-20',9); await shop('溫州街・半熟',[0]); const early=!H.said.length; set('2027-11-08',9); await shop('溫州街・半熟',[0]);
  check('2. SQ20 一個月以後：（兩個人都過了。…是在考場遇到的。）；做完',early&&has('（一個月以後，兩個人都過了。小蕙先知道小米姐也有考，是在考場遇到的。）')&&R('SQ20').state==='done');
  set('2027-11-09',9); await shop('溫州街・半熟',[0]); const c=has('（櫃台後面的牆上多兩張證書，並排掛著，一張寫小米姐的名字，一張寫小蕙的。）'); set('2027-11-10',9); await shop('溫州街・半熟',[0]);
  check('2. SQ20 痕跡：兩張證書；之後小米姐「今天的蛋，三分四十秒。……這是我考試的時候練出來的。」（一次）',c&&has('今天的蛋，三分四十秒。……這是我考試的時候練出來的。'));
  fresh('2027-09-28',9,'wz_brunch'); know('溫州街・半熟',4); await shop('溫州街・半熟',[0]); const no=H.opts.length===1; const s1=outOf('ev_sq20_s1'); await goOut(s1,[]); const self1=said();
  check('2. SQ20 不認識柏翰：不問；第一次自己計時＝AA_408 6 的三行（旁白、小蕙、小米姐）',no&&!R('SQ20').bohan&&J(self1)===J(['（你用手機的碼錶。小蕙每做完一步，就看你一眼。）','小蕙：……超過了嗎？','小米姐：（從煎台那邊）她每次都超過在烤箱那一步。'])&&R('SQ20').step==='s2',J(self1));
  const s2=outOf('ev_sq20_s2'); set(keyOf(s2.day),10); miss(s2); const s3=outOf('ev_sq20_s2');
  check('2. SQ20 第二次沒去：再排下一個週六（一個月以內）',!!s3&&s3.day===s2.day+7&&R('SQ20').state==='open');
  set(keyOf(s3.day),10); R('SQ20').by=s3.day; miss(s3); set(keyOf(s3.day+1),9); await shop('溫州街・半熟',[0]); const l=said(); set(keyOf(s3.day+2),9); await shop('溫州街・半熟',[0]); const lc=has('（櫃台後面的牆上多兩張證書，並排掛著，一張寫小米姐的名字，一張寫小蕙的。）'); set(keyOf(s3.day+3),9); await shop('溫州街・半熟',[0]);
  check('2. SQ20 過了一個月＝過期：小米姐「小蕙自己計時。她說手機的碼錶很吵。」；兩張證書照樣有（沒有那一句招呼）',R('SQ20').state==='lapsed'&&J(l)===J(['小米姐：小蕙自己計時。她說手機的碼錶很吵。'])&&lc&&!has('今天的蛋，三分四十秒。……這是我考試的時候練出來的。'),J(l));
  fresh('2027-06-01',9,'wz_brunch'); know('溫州街・半熟',5); check('2. SQ20 大三上起',!X().canOffer(H.G,'SQ20')&&(set('2027-09-07',9),X().canOffer(H.G,'SQ20'))); });
/* ---- 3 做完時旁邊的女主角 ---- */
await sec(3,async()=>{ fresh('2026-11-25',12,'l118_home'); know('巷口家常菜',4); await shop('巷口家常菜',[0]); H.FAMILIAR(AN); here(AN); const f0=SOCIAL.rel(AN).fam; set('2026-11-26',12); await shop('巷口家常菜',[0]);
  check('3. 在店裡做完（SQ11）：同一區、認識的女主角熟悉 +1',R('SQ11').state==='done'&&SOCIAL.rel(AN).fam===f0+1&&R('SQ11').with===AN);
  fresh('2027-03-03',15,'gongguan'); know('清葉茶行',4); await shop('清葉茶行',[0]); H.FAMILIAR(AN); here(AN); const f1=SOCIAL.rel(AN).fam; await goOut(outOf('ev_sq18_park'),[]);
  check('3. 2D 出遊做完（SQ18 清掃日；SQ10 改成回滇香交乳扇才做完，見第 4 節）：3D 這一區的人不算在旁邊',R('SQ18').state==='done'&&SOCIAL.rel(AN).fam===f1); });
/* ---- 4 AA_408 第 6 節（b0b80a54）---- */
await sec(4,async()=>{ const s6=(d408b.split('\n## 6.')[1]||'').split('\n## ')[0];
  const L=X().LINES, A=v=>v==null?[]:[].concat(v), t2=x=>Array.isArray(x)?x[1]:x;   /* 舊版沒有這些欄位＝少字（這一項 FAIL，不丟例外）*/
  const mine=[].concat(A(L.SQ17.ans).flat(),A(L.SQ17.en),A(L.SQ17.give),A(L.SQ17.call),A(L.SQ17.contact),A(L.SQ20.self1).map(t2),A(L.SQ20.self2),A(L.SQ19.group).map(t2),A(L.SQ10.handN),A(L.SQ10.hand),A(L.SQ12.inPair),Object.values(L.SQ12.pair||{}),A(L.SQ15.shelf),A(L.SQ18.cup));
  const bad6=mine.filter(t=>typeof t!=='string'||s6.indexOf(t)<0);
  check('4. 第 6 節的每一句（整句）都在 b0b80a54 的 AA_408 第 6 節裡：SQ17 三題中英文＋封膜機＋給號碼、SQ20 兩次、SQ19 三則、SQ10 兩行、SQ12 六句、SQ15、SQ18',s6.length>500&&mine.length===28&&!bad6.length,mine.length+' '+J(bad6));
  /* SQ17 */
  fresh('2027-03-02',12,'l118_tea'); know('一一八茶飲',4); await shop('一一八茶飲',[0,1]); const a1=said(), op1=H.opts[1];
  set('2027-03-03',12); await shop('一一八茶飲',[0]); const op2=H.opts[0], a2=said();
  set('2027-03-04',12); await shop('一一八茶飲',[0,0]); const op3=H.opts[0], op4=H.opts[1], a3=said();
  check('4. SQ17 前兩次在前兩題裡選、第三次只有「如果沒上呢？」；每一題店員中文、英文各一句；封膜機那一句（AA_408 的字）只在第三題',
    J(op1)===J(['「為什麼想去？」','「去了想學什麼？」'])&&J(op2)===J(['「為什麼想去？」'])&&J(op3)===J(['「如果沒上呢？」'])
    &&J(a1.slice(-2))===J(['店員：日文。還有……怎麼一個人吃飯。','店員：Japanese. And how to eat alone.'])&&J(a2)===J(['店員：我想去一個沒有人認識我的地方。……先在那邊點一次飲料，看他們會不會記得我。','店員：I want to see if I can start over somewhere no one knows me.'])
    &&J(a3.slice(0,3))===J(['店員：如果沒上，我明年再申請。……這題我本來不想準備，因為我怕。','店員：If I don\'t get in, I\'ll apply again next year.','（她說英文的時候，手上的封膜機停了。）'])&&!a1.concat(a2).some(t=>/封膜機/.test(t)),J([op1,op2,op3,a1,a2,a3]));
  const T=X().TEA, th='p:'+T, tl=()=>PHONE.thread(H.G,th).map(m=>m.text);
  check('4. SQ17 第三題之後多一個選項「上了跟我說。」／「加油。」；選「上了跟我說。」→ 店員「……那你給我電話。」、記聯絡人「一一八茶飲的店員」',
    J(op4)===J(['「上了跟我說。」','「加油。」'])&&a3[a3.length-1]==='店員：……那你給我電話。'&&INV.hasContact(H.G,T)&&PHONE.title(H.G,th)==='一一八茶飲的店員'&&tl().includes('加了一一八茶飲的店員的聯絡方式。')&&R('SQ17').phone&&R('SQ17').step==='result'
    &&!CHARACTERS[T]&&!INV.canInvite(H.G,T)&&typeof INV.whyNot(H.G,T)==='string'&&!(MSG.open(H.G,T)||{}).ok,J([op4,a3,tl(),PHONE.title(H.G,th)]));   /* 只登錄名字：不是人物（不能約、不能主動傳訊息），手機對話串打得開 */
  set('2027-04-25',20.9); ph(); const pre=tl().includes('上了。京都。'); set('2027-04-25',21); ph(); const m=PHONE.thread(H.G,th).find(x=>x.text==='上了。京都。'); ph();
  check('4. SQ17 給了電話：四月底（4/25 21:00）她私訊「上了。京都。」（手機上是「一一八茶飲的店員」）；收到＝做完、相簿',!pre&&!!m&&m.from===T&&m.h===21&&PHONE.who(m)==='一一八茶飲的店員'&&R('SQ17').state==='done'&&(H.G.album||[]).some(a=>a.id==='side_SQ17'),J([tl(),R('SQ17')]));
  set('2027-04-26',12); await shop('一一八茶飲',[0]); const face=has('上了。京都。');
  set('2028-03-02',12); await shop('一一八茶飲',[0]); const tr=has('（窗口換了一個新的店員。牆上貼一張京都的照片，旁邊寫「她說：甜度冰塊記得問清楚」。）');
  check('4. SQ17 給了電話：之後點飲料不再當面說「上了。京都。」（取代那一步）；痕跡照舊',!face&&tr);
  fresh('2027-03-02',12,'l118_tea'); know('一一八茶飲',4); await shop('一一八茶飲',[0,0]); set('2027-03-03',12); await shop('一一八茶飲',[0]); set('2027-03-04',12); await shop('一一八茶飲',[0,1]); const g1=said();
  set('2027-04-25',21.1); ph(); set('2027-04-26',12); await shop('一一八茶飲',[0]);
  check('4. SQ17 選「加油。」：不給號碼、沒有聯絡人、沒有私訊；下一次點飲料當面說「上了。京都。」',!g1.includes('店員：……那你給我電話。')&&!INV.hasContact(H.G,T)&&!PHONE.thread(H.G,th).length&&has('上了。京都。')&&R('SQ17').state==='done',J(g1));
  /* SQ20 自己計時 */
  fresh('2027-09-28',9,'wz_brunch'); know('溫州街・半熟',4); await shop('溫州街・半熟',[0]); await goOut(outOf('ev_sq20_s1'),[]); const w1=said(), who1=[whoOf('……超過了嗎？'),whoOf('（從煎台那邊）她每次都超過在烤箱那一步。')];
  await goOut(outOf('ev_sq20_s2'),[]); const w2=said();
  check('4. SQ20 自己計時：第一次＝旁白、小蕙「……超過了嗎？」、小米姐「（從煎台那邊）她每次都超過在烤箱那一步。」；第二次＝（這次她在烤箱那一步沒有看你。），接著練完那段',
    J(w1)===J(['（你用手機的碼錶。小蕙每做完一步，就看你一眼。）','小蕙：……超過了嗎？','小米姐：（從煎台那邊）她每次都超過在烤箱那一步。'])&&J(who1)===J(['小蕙','小米姐'])&&w2[0]==='（這次她在烤箱那一步沒有看你。）'&&w2[1]==='（第二個週末練完，小米姐把圍裙脫下來。）'&&w2.filter(t=>t==='（這次她在烤箱那一步沒有看你。）').length===1&&R('SQ20').step==='wait',J([w1,w2]));
  /* SQ19 班上群組 */
  fresh('2026-10-07',12,'wz_teishoku'); know('巷子裡定食',4); SOCIAL.remember(XC,'FIRST_MET',''); SOCIAL.remember(AN,'FIRST_MET',''); LC(); await shop('巷子裡定食',[0]); set('2026-10-08',12,'campus'); H.picks=[0]; await EVENTS.run(X().XC_EV);
  set('2026-10-22',9); ph(); const G9=grp();
  check('4. SQ19 選「看了最後一行。」：兩週以後（做完那天＋14）09:00 班上群組（法律系全班）芯慈兩則、以安「好。」；說話的人是芯慈、芯慈、以安',G9.length===3&&G9.every(m=>m.th==='g:law_class'&&m.day===D('2026-10-22')&&m.h===9)&&J(G9.map(m=>m.from))===J([XC,XC,AN])&&G9[1].text==='@以安 妳要來嗎？',J(G9));
  check('4. SQ19 兩句旁白拿掉：不再有讀書會的旁白事件（ev_sq19_group 不在 STORY_EVENTS、tick 不演）',!STORY_EVENTS.some(e=>e.id==='ev_sq19_group')&&!X().XC_GROUP_EV&&!X().xcGroupDue);
  fresh('2026-10-07',12,'wz_teishoku'); know('巷子裡定食',4); SOCIAL.remember(XC,'FIRST_MET',''); LC(); await shop('巷子裡定食',[0]); set('2026-10-08',12,'campus'); H.picks=[0]; await EVENTS.run(X().XC_EV); R('SQ19').groupSaid=D('2026-10-22'); set('2026-10-23',12); ph();
  check('4. SQ19 舊存檔已經演過兩句旁白（groupSaid）：不再傳群組那三則',!grp().length);
  /* SQ10 交乳扇 */
  fresh('2027-03-01',12,'l118_dian'); know('滇香小館',4); await shop('滇香小館',[0]); await goOut(outOf('ev_sq10_hwaxin'),[]); const st0=R('SQ10').state, td=X().todayHTML(H.G);
  H.FAMILIAR(AN); here(AN); const f0=SOCIAL.rel(AN).fam; set('2027-03-06',18); await shop('滇香小館',[0]); const hd=said();
  check('4. SQ10 出遊回來還沒做完（手機「今天」寫下一步）；下一次來滇香（同一天回來也算）：旁白＋老闆娘「……她還記得我叫阿梅。」→ 做完；在店裡做完＝旁邊認識的女主角熟悉 +1',
    st0==='open'&&/把乳扇和紙條交給老闆娘/.test(td)&&J(hd)===J(['（你把那包乳扇和紙條交給老闆娘。她先看紙條，看了很久。）','老闆娘：……她還記得我叫阿梅。'])&&R('SQ10').state==='done'&&SOCIAL.rel(AN).fam===f0+1,J([st0,td,hd]));
  set('2027-03-07',12); await shop('滇香小館',[0]); check('4. SQ10 痕跡照 AA_404（做完的隔天起：菜單多一行）',has('（滇香的菜單多一行手寫「炸乳扇（限量）」。）'));
  /* SQ12 帶交往對象 */
  const P5=[[AN,'……我們很明顯嗎？'],['heroine_03','……對不起。我們演得不好。'],[ZQ,'我們很認真在演耶。'],[SIS,'……我就說點兩份太刻意。'],['kexin','我就說不要坐窗邊。']]; const res=[];
  for(const [id,t] of P5){ fresh('2027-09-28',12,'l118_pasta'); know('Pasta 118',4); SOCIAL.remember(id,'FIRST_MET',''); H.date(id); await shop('Pasta 118',[0,1]); const op=H.opts[1], q=outOf('ev_sq12_pasta'); await goOut(q,[]);
    res.push([id,R('SQ12').partner===id&&J(op)===J(['（一個人去）','（約'+SOCIAL.displayName(id)+'一起去）'])&&seq(['（女朋友進門，看了一下店裡唯一一桌客人，走過來小聲說。）','你們是他找來的吧。',t,'（她早就知道了。她看到他訂了一個戒指盒，盒子放在廚房的抽屜裡兩個禮拜。）'])&&whoOf('你們是他找來的吧。')==='老闆的女朋友'&&whoOf(t)===SOCIAL.displayName(id)&&!has('你是他找來的吧。')&&P5.filter(x=>x[0]!==id).every(x=>!has(x[1])),said()]); }
  check('4. SQ12 帶交往對象去：女朋友「你們是他找來的吧。」、交往對象接她那一句（以安、語彤、子晴、學姊、可昕；說話的人是她）',res.every(x=>x[1]),J(res.filter(x=>!x[1])));
  fresh('2027-09-28',12,'l118_pasta'); know('Pasta 118',4); H.date(ZQ); await shop('Pasta 118',[0,0]); await goOut(outOf('ev_sq12_pasta'),[]);
  check('4. SQ12 交往中但一個人去：原本那句「你是他找來的吧。」、沒有接話',has('你是他找來的吧。')&&!has('你們是他找來的吧。')&&!P5.some(x=>has(x[1]))&&!R('SQ12').partner);
  fresh('2027-09-28',12,'l118_pasta'); know('Pasta 118',4); for(const id of ['heroine_02','classmate_peishan']){ SOCIAL.remember(id,'FIRST_MET',''); H.date(id); } await shop('Pasta 118',[0,0]);
  check('4. SQ12 大三上芷若（英國）、沛珊（台南）交往中也不能選（不問一個人或一起）',!!R('SQ12')&&!H.opts[1]&&!R('SQ12').partner,J(H.opts));
  /* SQ15 房間物品 */
  fresh('2026-10-06',15,'bookstore'); H.FRIEND(SIS); H.G.flags.met_sis=true; know('舊路書房',4); await shop('舊路書房',[0]); set('2026-10-07',15); await shop('舊路書房',[0]);
  const it=STORY.roomItemList(H.G).find(x=>x[0]==='學姊大一的民法總則'); H.said=[]; await it[2](GM); const lk=said(); H.said=[]; await it[2](GM);
  check('4. SQ15 房間物品平常「看」＝（學姊大一的民法總則。封面內頁寫著『溫書瑀』，字比現在圓一點。）（每次）',J(lk)===J(['（學姊大一的民法總則。封面內頁寫著『溫書瑀』，字比現在圓一點。）'])&&J(said())===J(lk),J(lk));
  /* SQ18 那一杯 */
  fresh('2027-03-03',15,'gongguan'); know('清葉茶行',4); await shop('清葉茶行',[0]); const m0=H.G.money; money=[]; await goOut(outOf('ev_sq18_park'),[]); const s18=said();
  check('4. SQ18 掃完落葉以後：阿伯「這杯是你的。茶行說，運費算你一杯。」（最後一句）；不給錢',s18[s18.length-1]==='阿伯：這杯是你的。茶行說，運費算你一杯。'&&idx('這杯是你的。茶行說，運費算你一杯。')>idx('（你留下來掃了半小時落葉。阿伯讓你一子，下了一盤。）')&&!money.length&&H.G.money===m0&&R('SQ18').state==='done',J([s18,money,H.G.money-m0])); });
H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
