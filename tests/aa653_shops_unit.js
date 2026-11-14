// 公館三間新室內的台詞與買賣（GG-SHOPS-REDO-1104；AA_653，企劃線 d26fecd2f，AA 定稿 D109；src/ggshops_sys3d.js）——不需要瀏覽器（D131）。
// 建出遊戲真正的區域（zones3d.js 真正的程式：公館＋日和便利店＋頁間書屋＋青木茶室），用引擎真正的找路與移動（E.simWalk）檢查互動點；台詞與買賣用假的 GM 跑 src/ggshops_sys3d.js 真正的程式：
//   1 互動點：每間照稿接的互動點都在（位置、字照配置 interact）；按得到（範圍裡站得住、最近的互動就是它）、從進門的地方走得到、不在出口的範圍裡
//   2 青木茶室門口：「外帶」（shop:tea，AA_647 三種茶、key 清葉茶行）＋「進入青木茶室」兩個都在、都按得到、不重疊（相距 ≥ 1.5 m）
//   3 青木茶室可以讀書：照配置 canStudy，吧台高腳椅不能（AA_653 B）
//   4 青木茶室營業：每天 11:00～21:00（10:30、21:30 進不去，11:00、20:59 進得去）；颱風假不開；門口打烊／颱風天那一句；外帶照同一個時間；21:00 人在店裡＝店員一句＋旁白、站到公館門口
//   5 看東西：每一句都是稿上的、隨機不連續同一句；熱食櫃 22:00 以後、冷藏櫃 00:00～06:00 換稿上那一句
//   6 買東西：品項、價錢照稿；扣錢；錢不夠（青木＝店員那一句、其他＝「錢不夠」不扣錢）；點完的句子；頁間店員那句每天第一次才說；便利店吃的登記 EAT
//   7 包裹暫取（有／沒有）、微波（今天買了微波義大利麵＝熱；沒有＝貼紙那一句）
//   8 青木茶室：坐下照位子一句；約會地點（invites.js：地點、答應的一句七人＋一般那句、坐下以後的開場句）
//   9 台詞逐字對照企劃線 AA_653（git show 讀不到就 SKIP）；index.html 載入順序；story_import_allow.json
// 修改前（cb1d84290）：1（沒有這些互動點）、2（門口沒有外帶）、3（青木不能讀書）、4（沒有營業時間、不擋門）、5～9（沒有 src/ggshops_sys3d.js）FAIL。
// 用法：node tests/aa653_shops_unit.js
/* 2026-11-11（X324 D 區，AA_784_invites.json）：invites.js 照覆蓋層拿掉刪節號、換句——答應句的期望包 OE.fwd（舊期望＝裡面的字），逐字對稿時「新字的舊字在稿上」也算（OE.inDoc；tests/overlay_expect.js）*/
const OE=require('./overlay_expect.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node')); console.warn=()=>{};
const T=fs.readFileSync(path.join(ROOT,'tests/nav_buildings_unit.js'),'utf8');
const files=[...new Set([...eval(T.match(/const files=(\[[^\]]+\])/)[1]),'src/data/calendar.js','src/data/places.js','src/data/wz_park_layout.js','src/data/wz_shops_layout.js','src/data/lane118_layout.js','src/data/lane118_shops.js','src/data/l118_redo772.js','src/data/lane118_props.js',
  'src/data/xinsheng_layout.js','src/data/bike_layout.js','src/data/cvs_layout.js','src/data/yejian_layout.js','src/data/aoki_layout.js','src/xinsheng3d.js','src/data/mokuyobi_layout.js','src/mokuyobi3d.js','src/bike3d.js','src/bikeshop3d.js','src/crowd3d.js'])];
const order=f=>f.startsWith('lib/')?0:(f.startsWith('src/data/')?1:(f==='src/zones3d.js'?2:(/xinsheng3d|mokuyobi3d/.test(f)?3:4)));
const pre=files.filter(f=>order(f)<2).concat(['src/zones3d.js']).concat(files.filter(f=>order(f)===3)).concat(files.filter(f=>order(f)===4&&f!=='src/zones3d.js'));
const run=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
for(const f of pre){ if(fs.existsSync(path.join(ROOT,f))) run(f); }
let fails=0, skips=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const J=x=>JSON.stringify(x), rd=p=>fs.readFileSync(path.join(ROOT,p),'utf8'), r2=v=>+(+v).toFixed(2);
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
ASSETS.loadOne=()=>Promise.reject(new Error('no GLB in node'));
const G={zone:'gongguan',day:30,hour:15,flags:{},money:5000,weather:'clear',visited:{}}; global.GAME={G};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.exits=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.nav) E.nav._cm=null;
  E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; if(E.fitSeatRadius) E.fitSeatRadius(); return {z,its:E.interactables.slice()}; }
const walk=(a,b)=>{ for(const dt of [1/30,0.1]){ const r=E.simWalk(a[0],a[1],b[0],b[1],{dt}); if(!r.ok) return Object.assign({dt:r2(dt)},r); } return {ok:true}; };
function touchable(it,from){ const r=(it.radius||1.5)-0.05, P=E.player, c=[];
  for(let dz=-r;dz<=r+1e-6;dz+=0.2) for(let dx=-r;dx<=r+1e-6;dx+=0.2){ const d=Math.hypot(dx,dz); if(d>r) continue; const x=it.x+dx, z=it.z+dz; if(E.canStand(x,z,0.32,0)) c.push([d,x,z]); }
  c.sort((a,b)=>a[0]-b[0]); for(const [,x,z] of c){ P.obj.position.set(x,0,z); if(E.nearestInteractable()!==it) continue; if(from&&!walk(from,[x,z]).ok) continue; return [x,z]; } return null; }
const KINDS={cvs:['hotfood','coffee','parcel','microwave','cooler'],bookstore:['shelf_browse','new_books','cafe_order'],aoki:['bookcase','vitrine','tea_tins','order']};
const LAY={cvs:CVS_LAYOUT.shop,bookstore:YEJIAN_LAYOUT,aoki:AOKI_LAYOUT};

// ---- 1 互動點 ----
for(const k of ['cvs','bookstore','aoki']){ const L=LAY[k], R=loadZone(k), its=R.its, sp=R.z.spawn;
  for(const kind of KINDS[k]){ const q=L.interact.find(x=>x.kind===kind), it=its.find(x=>x.ggs===kind);
    check(`1 ${L.name}：「${q&&q.label}」（ggs:'${kind}'）在配置的位置`,!!it&&!!q&&it.x===q.x&&it.z===q.z&&it.label===q.label,J(it&&[it.label,it.x,it.z]));
    if(!it) continue;
    const tp=touchable(it,[sp.x,sp.z]); check(`1 ${L.name}：「${it.label}」按得到、從進門的地方走得到`,!!tp,J(tp));
    const ex=its.filter(x=>x.exit&&Math.hypot(x.x-it.x,x.z-it.z)<(x.radius||1.8)); check(`1 ${L.name}：「${it.label}」不在出口的範圍裡`,!ex.length,J(ex.map(x=>x.label))); } }

// ---- 2 青木茶室門口 ----
{ const R=loadZone('gongguan'), its=R.its, dr=its.find(q=>q.exit&&q.exit.to==='aoki'), tk=its.filter(q=>q.shop==='tea');
  check('2 青木茶室門口：「外帶」（shop:tea、ggsTake）一個、「進入青木茶室」一個',tk.length===1&&tk[0].label==='外帶'&&tk[0].ggsTake===true&&!!dr,J(tk.map(q=>[q.label,q.x,q.z])));
  if(dr&&tk[0]){ const a=touchable(tk[0],[tk[0].x,15]), b=touchable(dr,[dr.x,15]); check('2 青木茶室門口：兩個都按得到、從人行道走得到',!!a&&!!b,J([a,b]));
    const d=Math.hypot(tk[0].x-dr.x,tk[0].z-dr.z); check('2 青木茶室門口：外帶窗口和門不重疊（相距 ≥ 1.5 m；窗口在門的西邊）',d>=1.5&&tk[0].x<dr.x,d.toFixed(2)+' m');
    const old=rd('src/story3d.js'); check("2 外帶照舊：story3d.js shop:'tea'＝counter(GM,'清葉茶行',…) 三種茶（AA_647 §6）",/if\(it\.shop==='tea'\)\{ await counter\(GM,'清葉茶行',\[\['桂花烏龍奶茶',70,10\],\['柚香綠茶',60,6\],\['春摘白茶',65,6\]\](,'aoki')?\)/.test(old)); } }

// ---- 3 青木茶室可以讀書 ----
{ const R=loadZone('aoki'), seats=R.its.filter(q=>q.seat), L=AOKI_LAYOUT, at=s=>seats.find(q=>q.seat.x===s.x&&q.seat.z===s.z);
  const bar=L.seats.filter(s=>s.table===7), cs=L.seats.filter(s=>s.canStudy&&at(s));
  check('3 青木茶室：canStudy 的座位 17 張都可以讀書（v2c：最裡面四人桌北側兩張也坐得到了）',cs.length===17&&cs.every(s=>at(s).study===true),cs.length+'／'+cs.filter(s=>at(s).study).length);
  check('3 青木茶室：吧台高腳椅 5 張不能讀書',bar.length===5&&bar.every(s=>at(s)&&at(s).study===false),J(bar.map(s=>at(s)&&at(s).study))); }

// ---- 4 營業時間（places.js）----
let TY=null, NT=null; for(let d=1;d<1600;d++){ if(CALENDAR.typhoon(d)&&!TY) TY=d; if(!NT&&d>=40&&[0,1,2,3,4,5,6].every(i=>!CALENDAR.typhoon(d+i))) NT=d; }   /* NT：連續七天沒有颱風假 */
{ const o=(h,d)=>PLACES.isOpen('aoki',h,d==null?NT:d);
  check('4 青木茶室：10:30、21:30 沒開；11:00、20:59 開（每天，一週七天都一樣）',[0,1,2,3,4,5,6].every(i=>!o(10.5,NT+i)&&o(11,NT+i)&&o(20+59/60,NT+i)&&!o(21.5,NT+i)&&!o(21,NT+i)));
  check('4 青木茶室：颱風假那一天不開（typhoonShops）',TY!=null&&!o(15,TY)&&PLACES.typhoonShops.includes('aoki'),'day '+TY);
  check('4 青木茶室：開放時間的字「每天 11:00–21:00」',PLACES.hours.aoki&&PLACES.hours.aoki.text==='每天 11:00–21:00'); }

// ---- 5～8 台詞與買賣（假的 GM，跑真正的 src/ggshops_sys3d.js）----
const ate=[]; let origCalls=0, accOut=null;
global.STORY={TICKS:[],interact:async()=>{ origCalls++; return 'orig'; },onSeat:async()=>false};
global.EAT={ordered:async(GM,k,i)=>{ ate.push([k,i]); return true; }};
global.INV={personal:(G,id,P)=>accOut||{res:'accept',lines:[]}};
global.SOCIAL={MEMORY_LABEL:{}};
let modOK=fs.existsSync(path.join(ROOT,'src/ggshops_sys3d.js'));
try{ run('src/data/invites.js'); }catch(e){ check('8 invites.js 載得起來',false,String(e).slice(0,200)); }
if(modOK){ try{ run('src/ggshops_sys3d.js'); }catch(e){ modOK=false; check('5 src/ggshops_sys3d.js 載得起來',false,String(e).slice(0,200)); } }
check('5 src/ggshops_sys3d.js 存在、載得起來（GGS）',modOK&&typeof GGS!=='undefined');
const log=[], toasts=[], choices=[]; let picks=[], entered=null;
const GM={G, E:{player:{seat:null}}, say:async(w,t)=>{ log.push([w&&w.name||null,t]); }, choose:async(opts)=>{ choices.push(opts); const p=picks.length?picks.shift():opts.length-1; return typeof p==='function'?p(opts):p; },
  money:d=>{ G.money+=d; }, toast:t=>{ toasts.push(t); }, sceneBegin(){}, sceneEnd(){}, advance(h){ G.hour+=h; }, autosave(){}, enter:async(z,sp)=>{ entered=[z,sp]; G.zone=z; }, standUp(P){ P.seat=null; }};
const reset=()=>{ log.length=0; toasts.length=0; choices.length=0; picks=[]; entered=null; ate.length=0; };
const act=async(zone,it,hour,pk)=>{ reset(); G.zone=zone; if(hour!=null) G.hour=hour; if(pk) picks=pk.slice(); return STORY.interact(it,GM); };
const byName=n=>opts=>opts.findIndex(o=>o.t.startsWith(n+'　'));
(async()=>{
 if(modOK){
  const LK=GGS.LOOK, M=GGS.MENU, L=GGS.L;
  // 5 看東西
  { const seq=[]; let r=0; GGS.rand=()=>[0,0.99,0,0.5,0.99,0][r++%6];
    for(let i=0;i<6;i++){ await act('aoki',{ggs:'bookcase'},15); seq.push(log[0]&&log[0][1]); }
    check('5 看書櫃：每一句都是稿上的、同一句不連續出',seq.every(t=>LK.aoki.bookcase.day.includes(t))&&seq.every((t,i)=>i===0||t!==seq[i-1]),J(seq.map(t=>LK.aoki.bookcase.day.indexOf(t))));
    GGS.rand=Math.random;
    const all=[]; for(const [z,ks] of Object.entries({cvs:['cooler'],bookstore:['shelf_browse','new_books'],aoki:['vitrine','tea_tins']})) for(const k of ks){ for(let i=0;i<6;i++){ await act(z,{ggs:k},15); all.push([k,log.length===1&&log[0][0]===null&&LK[z][k].day.includes(log[0][1])]); } }
    check('5 冷藏櫃、書牆、新書、茶具櫃、茶罐：白天一句旁白、都是稿上的',all.every(x=>x[1]),J(all.filter(x=>!x[1])));
    await act('cvs',{ggs:'cooler'},1); check('5 冷藏櫃 01:00＝半夜那一句',log.length===1&&log[0][1]===LK.cvs.cooler.night,J(log));
    await act('cvs',{ggs:'cooler'},6.5); check('5 冷藏櫃 06:30＝白天的',LK.cvs.cooler.day.includes(log[0]&&log[0][1]));
    picks=[]; await act('cvs',{ggs:'hotfood'},15); check('5 熱食櫃白天：先看（兩句隨機）再問要不要買（四樣＋不用了）',LK.cvs.hotfood.day.includes(log[0]&&log[0][1])&&choices[0].length===5,J([log[0],choices[0]&&choices[0].map(o=>o.t)]));
    await act('cvs',{ggs:'hotfood'},22.5); check('5 熱食櫃 22:30：晚上那一句、只剩茶葉蛋、肉包',log[0]&&log[0][1]===LK.cvs.hotfood.night&&J(choices[0].map(o=>o.t))===J(['茶葉蛋　13 元','肉包　25 元','不用了']),J(choices[0]&&choices[0].map(o=>o.t))); }
  // 6 買東西
  { G.money=5000; await act('cvs',{ggs:'hotfood'},15,[byName('烤地瓜')]);
    check('6 熱食櫃買烤地瓜：扣 45 元、店員「要加熱嗎？……那幫你裝袋。」、EAT 記「公館的便利商店」',G.money===4955&&log[1]&&log[1][0]==='店員'&&log[1][1]==='要加熱嗎？……那幫你裝袋。'&&J(ate)===J([['公館的便利商店','烤地瓜']]),J([G.money,log,ate]));
    const prices=J(M['cvs.hotfood'].items)===J([['烤地瓜',45],['茶葉蛋',13],['肉包',25],['關東煮（三樣）',60]])&&J(M['cvs.coffee'].items)===J([['美式',45],['拿鐵',60],['冰美式',45]])&&J(M['bookstore.cafe_order'].items)===J([['美式',90],['拿鐵',110],['紅茶',80],['今日蛋糕',100]])
      &&J(M['aoki.order'].items.map(x=>x[1]))===J([220,260,240,200,120,80,80]);
    /* 2026-11-12（GG-YEJIAN-SHOP-1112）：這支只載 src/ggshops_sys3d.js、沒載 src/yejian_buy3d.js——頁間咖啡吧在這裡是 AA_653 的備用菜單（美式 90、拿鐵 110、紅茶 80、今日蛋糕 100）。遊戲裡開起來的是 AA_853 的（美式 90、拿鐵 120、當日蛋糕 110），在 tests/yejian_buy_1112_unit.js 查；這裡的期望沒有動 */
    check('6 品項、價錢照稿（熱食櫃、日和咖啡、頁間咖啡吧、青木內用）',prices);
    G.money=10; await act('cvs',{ggs:'hotfood'},15,[byName('烤地瓜')]); check('6 便利店錢不夠：「錢不夠」、不扣錢、不登記',G.money===10&&toasts[0]==='錢不夠'&&!ate.length,J([G.money,toasts]));
    G.money=5000; await act('cvs',{ggs:'coffee'},15,[byName('拿鐵')]);
    check('6 日和咖啡：拿鐵扣 60、店員「大杯還是中杯？」→ 咖啡機那一句（集點不做）',G.money===4940&&J(log)===J([['店員','大杯還是中杯？'],[null,'（咖啡機響了一陣，杯子上印著一片小小的葉子。）']]),J(log));
    G.money=5000; G.flags.YJ_CAFE_DAY=null; await act('bookstore',{ggs:'cafe_order'},15,[byName('紅茶')]);
    const l1=log.slice(); await act('bookstore',{ggs:'cafe_order'},16,[byName('今日蛋糕')]); const l2=log.slice();
    check('6 頁間點咖啡：店員那句每天第一次點才說，點完磨豆機那一句；扣 80＋100',G.money===4820&&J(l1)===J([['店員','書可以帶到位子上看喔。……沒買的看完放回去就好。'],[null,'（咖啡吧的磨豆機響了一下。店員把杯子放在一個小木盤上。）']])&&J(l2)===J([[null,'（咖啡吧的磨豆機響了一下。店員把杯子放在一個小木盤上。）']]),J([G.money,l1,l2]));
    G.day+=1; await act('bookstore',{ggs:'cafe_order'},15,[byName('紅茶')]); check('6 頁間點咖啡：隔天第一次又說',log.length===2&&log[0][0]==='店員'); G.day-=1;
    G.money=5000; await act('aoki',{ggs:'order'},15,[byName('東方美人（一壺）')]);
    check('6 青木內用：東方美人一壺扣 260、店員「第一泡我幫你泡……」、點完隨機一句（稿上兩句之一）',G.money===4740&&log[0]&&log[0][1]==='第一泡我幫你泡，之後可以自己加熱水。'&&M['aoki.order'].potAfter.includes(log[1]&&log[1][1])&&log.length===2,J(log));
    await act('aoki',{ggs:'order'},15,[byName('柚香綠茶（冷泡）')]); check('6 青木內用：冷泡扣 120、稿上沒有點完的句子＝只出提示',G.money===4620&&!log.length&&/柚香綠茶/.test(toasts[0]||''),J([log,toasts]));
    G.money=100; await act('aoki',{ggs:'order'},15,[byName('桂花烏龍（一壺）')]); check('6 青木錢不夠：店員「冷泡的柚香綠茶比較便宜喔。」、不扣錢',G.money===100&&J(log)===J([['店員','冷泡的柚香綠茶比較便宜喔。']]),J(log));
    G.money=50; await act('aoki',{ggs:'order'},15,[byName('柚香綠茶（冷泡）')]); check('6 青木錢不夠買冷泡：「錢不夠」（不說叫你買冷泡那句）',G.money===50&&!log.length&&toasts[0]==='錢不夠');
    G.money=5000; }
  // 7 包裹、微波
  { G.flags.CVS_PARCEL=null; await act('cvs',{ggs:'parcel'},15); check('7 包裹暫取沒有包裹：店員「……查不到耶。可能還沒到。」',J(log)===J([['店員','……查不到耶。可能還沒到。']]));
    G.flags.CVS_PARCEL=1; await act('cvs',{ggs:'parcel'},15); check('7 包裹暫取有包裹（G.flags.CVS_PARCEL）：末三碼、搬出箱子；領完清掉',J(log)===J([['店員','末三碼？'],[null,'（你報了手機末三碼。店員從後面搬出一個箱子。）']])&&!G.flags.CVS_PARCEL);
    G.flags.CVS_HEAT=null; await act('cvs',{ggs:'microwave'},15); check('7 微波沒買要熱的：貼紙那一句',J(log)===J([[null,'（微波爐旁邊貼著「請勿加熱鋁箔包裝」。）']]));
    await EAT.ordered(GM,'公館的便利商店','微波義大利麵'); await act('cvs',{ggs:'microwave'},15); const a=log.slice(); await act('cvs',{ggs:'microwave'},15);
    check('7 結帳買了微波義大利麵（EAT.ordered）：微波一次「叮了一聲」，再按＝貼紙',J(a)===J([[null,'（微波爐轉了一分鐘，叮了一聲。）']])&&J(log)===J([[null,'（微波爐旁邊貼著「請勿加熱鋁箔包裝」。）']]),J(a));
    G.flags.CVS_HEAT=G.day-1; await act('cvs',{ggs:'microwave'},15); check('7 昨天買的不算',log[0]&&log[0][1]===L.microNo); }
  // 4 營業：門口、打烊
  { const door={label:'進入青木茶室',exit:{to:'aoki',spawn:{x:1,z:2,yaw:0}}}, take={label:'外帶',shop:'tea',ggsTake:true}; G.day=NT;
    const go=async(it,h,d)=>{ origCalls=0; G.day=d||NT; const r=await act('gongguan',it,h); return {r,orig:origCalls,log:log.slice()}; };
    const res=[]; for(const h of [10.5,21.5]){ const a=await go(door,h), b=await go(take,h); res.push(a.orig===0&&b.orig===0&&J(a.log)===J([[null,L.doorClosed]])&&J(b.log)===J([[null,L.doorClosed]])); }
    check('4 10:30、21:30：「進入青木茶室」「外帶」都不進去、不賣，門口那一句（燈關了……木牌「11:00～21:00」）',res.every(Boolean),J(res));
    const ok=[]; for(const h of [11,20+59/60]){ const a=await go(door,h), b=await go(take,h); ok.push(a.orig===1&&b.orig===1&&!a.log.length); }
    check('4 11:00、20:59：照常進去、外帶照常（交給原本的 STORY.interact）',ok.every(Boolean),J(ok));
    const t=await go(door,15,TY), t2=await go(take,15,TY); check('4 颱風假那一天：門口「颱風天暫停營業」那一句、不進去',t.orig===0&&t2.orig===0&&J(t.log)===J([[null,'（青木茶室的門上貼著「颱風天暫停營業」。）']]),J(t.log));
    G.day=NT; reset(); G.zone='aoki'; G.hour=21.05; GM.E.player.seat={x:1}; const n0=STORY.TICKS.includes(GGS.tick);
    const fired=GGS.tick(GM); await new Promise(r=>setTimeout(r,20));
    check('4 21:00 人還在店裡：店員「我們今天要打烊了。」一句（AA_700，不另外出旁白）、站起來、回公館的青木門口',n0&&fired&&J(log)===J([['店員','我們今天要打烊了。']])&&!L.close&&entered&&entered[0]==='gongguan'&&J(entered[1])===J(Z3.SHOP_IN.aoki.out)&&GM.E.player.seat===null,J([log,entered]));
    reset(); G.zone='aoki'; G.hour=23; GGS.tick(GM); await new Promise(r=>setTimeout(r,20)); check('4 讀檔回到 23:00 在店裡：直接出來、寫開放時間（不說打烊那段）',!log.length&&entered&&entered[0]==='gongguan'&&/青木茶室/.test(toasts[0]||''),J([toasts,entered]));
    reset(); G.zone='aoki'; G.hour=15; check('4 營業中：tick 不動作',GGS.tick(GM)===false&&!entered);
    reset(); G.zone='aoki'; G.hour=15; G.day=TY; GGS.tick(GM); await new Promise(r=>setTimeout(r,20)); check('4 颱風天在店裡：出來',entered&&entered[0]==='gongguan'); G.day=NT; }
  // 8 坐下、約會
  { const L0=AOKI_LAYOUT.seats, want={6:L.seat.window,7:L.seat.bar,3:L.seat.middle,4:L.seat.middle,5:L.seat.middle}; const bad=[];
    for(const s of L0){ reset(); G.zone='aoki'; await STORY.onSeat(GM,{x:s.x,z:s.z}); const w=(s.table===1||s.table===2)?(s.seatH?L.seat.banquette:L.seat.middle):want[s.table]; if(J(log)!==J([[null,w]])) bad.push([s.table,s.x,s.z,log]); }
    check('8 青木坐下照位子一句（窗邊長桌、卡座、中間方桌與最裡面、吧台；卡座前小圓桌的椅子＝中間那句）',!bad.length,J(bad).slice(0,300));
    reset(); G.zone='bookstore'; await STORY.onSeat(GM,{x:-2.6,z:-2.7}); check('8 別的店坐下不說',!log.length);
    const P=INVITE_DATA.places.find(p=>p.id==='aoki');
    check('8 約會地點 aoki：區域 aoki、11～21、可以讀書（cats study）、兩個人坐下、去過才列',!!P&&P.zone==='aoki'&&J(P.hours)===J([11,21])&&P.cats.includes('study')&&P.seatPose==='sit'&&P.show({visited:{}})===false&&P.show({visited:{aoki:true}})===true,J(P));
    const ACC={heroine_01:'好。可以讀書嗎？……可以就好。',heroine_02:'好。我想喝東方美人。',heroine_03:'青木？好。……我想看看別人家的茶怎麼泡。',heroine_04:'茶室？好啊，我沒去過。',heroine_05:'好。那裡的白茶不錯。',classmate_peishan:'好！他們的桂花糕很好吃。',kexin:'好啊。等我到台北。'};
    check('8 答應的一句七人（以安、芷若、語彤、子晴、學姊、沛珊、可昕）',Object.keys(ACC).every(id=>J(INVITE_DATA.people[id].acc.aoki)===J([OE.fwd('invites',id,ACC[id])])),J(Object.keys(ACC).map(id=>(INVITE_DATA.people[id].acc||{}).aoki)));
    accOut=null; const o1=INV.personal(G,'zhe',P,G.day,15); accOut={res:'accept',lines:['「x」']}; const o2=INV.personal(G,'heroine_01',P,G.day,15); accOut={res:'busy',lines:[]}; const o3=INV.personal(G,'zhe',P,G.day,15); accOut=null;
    check('8 沒列的人答應＝一般那句「好。那裡很安靜。」；有自己句子的不換；不答應不換',J(o1.lines)===J(['好。那裡很安靜。'])&&J(o2.lines)===J(['「x」'])&&!o3.lines.length,J([o1,o2,o3]));
    check('8 坐下以後的開場句（seatOpen.aoki、byPlace）',J(INVITE_DATA.seatOpen.aoki)===J([['（店員把茶壺放下，她先幫你倒了第一杯。）','……你先喝。']])&&INVITE_DATA.seatOpen.byPlace.aoki==='aoki');
    check('8 一盞照舊不能讀書（seatMenu 的 teahouse）',/if\(it\.shop==='teahouse'\) opts\.push\(\{t:'讀書',teaNo:true\}\)/.test(rd('src/game3d.js'))); }
  // 9 逐字對照
  { let D=null; try{ const f=cp.execSync("git ls-tree -r -z --name-only origin/claude/story-planning docs/story_planning/",{cwd:ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore'],maxBuffer:64<<20}).split('\0').find(x=>/AA_653/.test(x)); if(f) D=cp.execFileSync('git',['show','origin/claude/story-planning:'+f],{cwd:ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']}); }catch(e){}
    if(!D){ console.log('SKIP 9 讀不到企劃線的 AA_653（git show）'); skips++; }
    else { const lines=[]; for(const z in LK) for(const k in LK[z]){ lines.push(...LK[z][k].day); if(LK[z][k].night) lines.push(LK[z][k].night); }
      for(const k in M){ for(const a of (M[k].after||[])) lines.push(a[1]); if(M[k].first) lines.push(M[k].first[1]); if(M[k].pot) lines.push(M[k].pot[1]); if(M[k].poor) lines.push(M[k].poor[1]); lines.push(...(M[k].potAfter||[])); }
      for(const a of L.parcelYes) lines.push(a[1]); lines.push(L.parcelNo[1],L.microYes,L.microNo,...Object.values(L.seat),L.doorTyphoon,L.doorClosed);
      lines.push(...Object.values(INVITE_DATA.aokiAcc),INVITE_DATA.aokiAcc0,...INVITE_DATA.seatOpen.aoki[0]);
      const miss=lines.filter(t=>!OE.inDoc('invites',null,t,t=>D.includes(t))); check(`9 台詞 ${lines.length} 句逐字在 AA_653 裡`,!miss.length,J(miss));
      const pr=['烤地瓜 45','茶葉蛋 13','肉包 25','關東煮（三樣）60','美式 45','拿鐵 60','冰美式 45','美式 90','拿鐵 110','紅茶 80','今日蛋糕 100','桂花烏龍 220','東方美人 260','春摘白茶 240','包種 200','柚香綠茶 120','綠豆糕 80','桂花糕 80','11:00～21:00'];
      check('9 價錢、營業時間在 AA_653 裡（稿上的寫法）',pr.every(t=>D.includes(t)),J(pr.filter(t=>!D.includes(t)))); } }
 }
 // 9 其他接線
 { const h=rd('index.html'), ix=f=>h.indexOf('src="'+f), g=ix('src/ggshops_sys3d.js');
   check('9 index.html：ggshops_sys3d.js 在 story3d、invites3d、eat3d、places 之後、GAME.boot 之前',g>0&&['src/story3d.js','src/invites3d.js','src/eat3d.js','src/data/places.js','src/data/invites.js','src/zones3d.js'].every(f=>ix(f)>0&&ix(f)<g)&&g<h.indexOf('GAME.boot()'));
   const A=JSON.parse(rd('docs/handoff/story_import_allow.json')), e=(A.allow||A.files||A.entries||Object.values(A).find(Array.isArray)||[]).find(x=>/AA_653/.test(x.path||''));
   check('9 story_import_allow.json：AA_653（approved、AA（D109）、來源 commit）',!!e&&e.status==='approved'&&e.approvedBy==='AA（D109）'&&/^[0-9a-f]{7,40}$/.test(e.sha||''),J(e)); }
 console.log(fails?('FAILED '+fails):('ALL PASS'+(skips?'（SKIP '+skips+'）':'')));
 process.exit(fails?1:0);
})();
