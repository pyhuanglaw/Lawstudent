// 校外約會核心剩下的系統面（SYS-03／DATE-S2～S5 的缺口；DATE-S1 人物頁「一起去過的地方」的資料）
// 檢查：
//   1 固定段落（AA_128 5-1 第 2 步、date_locations.json _codes.fixed：D04、D05 看電影 120 分、電影票 300／260）：
//     預約的回程多 120 分（不吃掉互動點的時間）、預計花費含電影票、晚上 19:00 出發回來超過 23:30 灰掉；
//     那一天：抵達那一句之後一句旁白「（看電影。）」、時間推 2 小時、扣電影票，不算互動點；散場以後才選互動點；結算寫「看電影」；
//     心願事件（芷若 D05）也扣電影票（稿：「票各自付（AA_128 定價）」）；舊版約好、還沒去的那一趟讀檔時補上回程
//   2 休館日（AA_128 第 2 節地點表、date_locations.json closed）：D06、D07 週一不能約（「週一休館」）、改到明天撞到週一也不行；
//     D11、D26、D28 的館週一、D19 的館每月第一個週一灰掉（「今天休館」），其他互動點照常；D09（mon_maybe）不擋
//   3 互動點依交通方式的花費（point_specs costByMode，G33）：D09 纜車開車來扣 120、搭捷運不另扣
//   4 人物頁「一起去過的地方」一行一趟（AA_128 第 163 行）：DATE.historyText
// 修改前（開發分支 05e8583b2）：17 項 FAIL（第 1 節「看電影不算互動點」「散場以後的時間夠」兩項是防呆，修改前也 PASS）。用法：node tests/date_sys03_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const {check,GM}=H;
const fs=require('fs'), vm=require('vm'), path=require('path');
const load=f=>{ const p=path.join(H.ROOT,f); let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
if(typeof WISH==='undefined'){ load('src/data/date_wish.js'); load('src/wish3d.js'); }   /* 心願事件（date_wish_unit.js 同一種載法）*/
const J=JSON.stringify, ZR='heroine_02', YT='heroine_03', ZQ='heroine_04', PS='classmate_peishan';
GM.money=d=>{ H.G.money+=d; };
const toasts=[]; GM.toast=t=>{ toasts.push(t); };
const hours=[]; { const ch=GM.choose; let n=0; GM.choose=async o=>{ if(++n>3000) throw new Error('選單無限迴圈：'+J(o.map(x=>x.t))); hours.push({h:H.G.hour,o:o.map(x=>({t:x.t,hint:x.hint,dim:!!x.dim}))}); return ch(o); }; GM._reset=()=>{ n=0; hours.length=0; toasts.length=0; }; }
const lv=(id,n)=>{ const r=SOCIAL.rel(id); Object.assign(r,{fam:n>=4?65:(n>=3?45:25),trust:n>=4?50:(n>=3?30:0),comf:n>=4?45:0,npcRom:n>=6?60:(n>=5?35:0),rom:n>=6?35:0}); SOCIAL.remember(id,'FIRST_MET',''); };
const setup=(key,h,o)=>{ o=o||{}; const G=H.fresh(key,h,o.zone||'dorm',o.flags||{}); G.outings=[]; G.contacts=G.contacts||{}; G.money=9000;
  for(const [id,n] of Object.entries(o.lv||{})){ lv(id,n); G.contacts[id]=G.day-60; } if(STORY._bindGM) STORY._bindGM(GM); return G; };
const ck=(id,key,dep,locs,o)=>{ o=o||{}; const loc=locs[0]; return DATE.check(H.G,Object.assign({who:id,locs,day:H.D(key),depart:dep,transport:o.tr||((DATE.loc(loc).transport||[])[0]||{}).mode},o.kind?{kind:o.kind}:{})); };
const said=()=>H.said.map(s=>s.t);
const goDate=async(id,loc,depart,picks,tr)=>{ const G=H.G; GM._reset(); const b=DATE.book(G,{who:id,locs:[loc],transport:tr||((DATE.loc(loc).transport||[])[0]||{}).mode,day:G.day,depart}); if(!b.ok) return {b,L:[],O:[]};
  const q=OUT.get(G,'date_'+b.trip); G.hour=depart; H.said=[]; H.opts=[]; H.picks=['出發'].concat(picks||[]); const m0=G.money; await OUT.prompt(GM,q); return {b,t:DATE.trip(G,b.trip),L:said(),O:H.opts.slice(),spent:m0-G.money}; };
const pointMenus=()=>hours.filter(x=>x.o.some(o=>/^\d+ 分/.test(o.hint||'')));

(async()=>{
  /* ======================= 1 固定段落：看電影（AA_128 5-1）======================= */
  setup('2026-10-05',9,{lv:{[ZR]:5}});
  { const p=DATE.plan(H.G,{who:ZR,locs:['D04'],kind:'half',depart:13,transport:'mrt'}), p13=DATE.plan(H.G,{who:ZR,locs:['D13'],kind:'half',depart:13,transport:'mrt'});
    check('1. 預約：西門町電影院 13:00 出發＝回到台大 18:00（捷運 15 分×2＋看電影 120 分＋互動點 2.5 小時）；沒有固定段落的淡水照舊',p.ok&&Math.abs(p.back-18)<1e-6&&p13.ok&&Math.abs(p13.back-(13+2*DATE.travel('D13','mrt').minutes/60+2.5))<1e-6,J({back:p.back,b13:p13.back})); }
  { const c=ck(ZR,'2026-10-10',13,['D04']), c5=ck(ZR,'2026-10-10',13,['D05']);
    check('1. 預計花費含電影票：D04＝車資 50＋電影票 300；D05＝車資＋電影票 260',c.ok&&c.cost===50+300&&c5.ok&&c5.cost===DATE.travel('D05','mrt').fare+260,J({c:c.cost,c5:c5.cost,why:c.why})); }
  { const a=ck(ZR,'2026-10-10',19,['D04']), b=ck(ZR,'2026-10-10',18,['D04']);
    check('1. 晚上 19:00 出發看電影：回來超過 23:30 灰掉；18:00 可以（約 23:00 回到台大）',!a.ok&&a.why==='回來會超過 23:30，來回趕不上'&&b.ok&&Math.abs(b.plan.back-23)<1e-6,J({a:a.why,b:b.plan&&b.plan.back,bw:b.why})); }
  setup('2026-10-10',9,{lv:{[ZR]:5}});
  { const r=await goDate(ZR,'D04',13,['小吃',0,'大廳',0,'紅樓',0,'差不多',0,0]); const iM=r.L.indexOf('（看電影。）'), arr=((((DATE_LINES.loc.D04||{}).lines||{})[ZR]||{}).arrive||{}).first, iA=arr?r.L.indexOf(arr.lines[arr.lines.length-1].text):-1;
    const pm=pointMenus(); const fin=r.L.find(t=>/^（今天去了西門町電影院：/.test(t))||'';
    check('1. 那一天：抵達那一句之後才演「（看電影。）」（一句旁白，地點資料的 label）',iA>=0&&iM>iA,J(r.L.slice(0,8)));
    check('1. 散場以後才選互動點：第一次選互動點的時間＝13:15 到＋120 分＝15:15',!!pm.length&&Math.abs(pm[0].h-(13.25+2))<1e-6,J(pm.map(x=>x.h)));
    check('1. 看電影不算互動點（spots 只有選的那幾個）、這一趟照算（counted）',!!r.t&&r.t.status==='done'&&r.t.counted===true&&r.t.spots.length>=2&&r.t.spots.every(s=>/^D04\.(lobby|street|redhouse|snack)$/.test(s)),J(r.t&&{s:r.t.spots,st:r.t.status,c:r.t.counted}));
    check('1. 散場以後的互動點時間夠（電影沒有吃掉互動點的時間）：大廳、徒步區、紅樓、小吃都沒有灰掉',!!pm.length&&pm[0].o.filter(o=>/^\d+ 分/.test(o.hint||'')).every(o=>!o.dim),J(pm[0]&&pm[0].o));
    const pts=r.t?r.t.spots.reduce((s,id)=>s+((DATE.points('D04').find(p=>p.id===id)||{}).cost|0),0):-1;
    check('1. 扣電影票 300（加上互動點、車資 50）；結算寫「看電影」排第一個、花費含電影票',r.spent===300+pts+50&&/^（今天去了西門町電影院：看電影、/.test(fin)&&fin.includes('花了 '+(300+pts+50)+' 元'),J({spent:r.spent,pts,fin})); }
  /* 快速約會（同一個地點第三次以後）：電影照樣看完（時間、電影票），旁白跳過 */
  setup('2026-10-17',9,{lv:{[ZR]:5}}); DATE.log(H.G,ZR).byLoc.D04=2;
  { const r=await goDate(ZR,'D04',13,['快速']); const pm=hours.find(x=>x.o.some(o=>o.t==='快速約會'));
    check('1. 快速約會：電影照扣 300、時間照推（互動點從 15:15 起算）、不演「（看電影。）」',!!r.t&&r.t.status==='done'&&!r.L.includes('（看電影。）')&&r.spent>=300+50&&!!pm,J({spent:r.spent,L:r.L.slice(0,4),st:r.t&&r.t.status})); }
  /* 舊版約好、還沒去的那一趟（回程沒有算電影）：讀檔時補上 120 分；已經去過的不動 */
  setup('2026-10-05',9,{lv:{[ZR]:5}});
  { const G=H.G; G.trips=[{trip:'T0001',who:ZR,locs:['D04'],day:H.D('2026-10-10'),depart:13,back:16,kind:'half',transport:'mrt',fare:50,fareV:2,status:'booked',spots:[]},
      {trip:'T0002',who:ZR,locs:['D04'],day:H.D('2026-10-03'),depart:13,back:16,kind:'half',transport:'mrt',fare:50,fareV:2,status:'done',spots:['D04.snack']},
      {trip:'T0003',who:ZR,locs:['D13'],day:H.D('2026-10-11'),depart:13,back:17,kind:'half',transport:'mrt',fare:60,fareV:2,status:'booked',spots:[]}];
    DATE.rec(G); DATE.rec(G);
    check('1. 舊存檔：約好的 D04 回程 16:00→18:00（只補一次）；去過的、淡水不動',G.trips[0].back===18&&G.trips[1].back===16&&G.trips[2].back===17&&G.trips.every(t=>t.fixedV===1),J(G.trips.map(t=>[t.back,t.fixedV]))); }
  /* 心願事件（芷若 D05）：稿的兩句旁白之後扣電影票 260 */
  setup('2026-10-17',9,{lv:{[ZR]:6}}); SOCIAL.remember(ZR,'WATCHED_FILM','');
  { const r=await goDate(ZR,'D05',13,['院子',1,'書店',1,'片單',0,'咖啡',1,0]); const ev=WISH.ev(ZR);
    check('1. 芷若心願 D05：照稿的看電影旁白（不另外加「（看電影。）」），電影票 260 照扣',r.L.includes(ev.fixed.lines[0].text)&&!r.L.includes('（看電影。）')&&r.spent>=260&&!!r.t&&r.t.status==='done',J({spent:r.spent,st:r.t&&r.t.status})); }

  /* ======================= 2 休館日 ======================= */
  setup('2026-07-08',9,{lv:{[ZQ]:5,[YT]:5}});
  { const mon='2026-07-13', tue='2026-07-14'; const a=ck(ZQ,mon,15,['D06']), b=ck(ZQ,tue,15,['D06']), c=ck(ZQ,mon,15,['D07']), d=ck(ZQ,mon,15,['D13']);
    check('2. D06 北美館、D07 景美紀念園區週一不能約（「週一休館」）；週二可以；淡水週一照常',!a.ok&&a.why==='週一休館'&&b.ok&&!c.ok&&c.why==='週一休館'&&d.ok,J({a:a.why,b:b.why,c:c.why,d:d.why})); }
  { const day=H.D('2026-07-12'), G=H.G; G.day=day; G.hour=9; const b=DATE.book(G,{who:ZQ,locs:['D06'],transport:'mrt',day,depart:15}); const q=b.ok&&OUT.get(G,'date_'+b.trip); GM._reset(); H.picks=[1];
    const res=b.ok?await DATE.move(GM,q,DATE.trip(G,b.trip)).catch(e=>'ERR '+e.message):null; const t=b.ok&&DATE.trip(G,b.trip);
    check('2. 週日約北美館，「改到明天同一個時間」＝週一：不行（提示「週一休館」），行程還在週日',b.ok&&toasts.includes('週一休館')&&!!t&&t.day===day,J({b:b.ok,toasts,day:t&&t.day,res})); }
  { const G=H.G, m=H.D('2026-07-13'), tu=H.D('2026-07-14'), m1=H.D('2026-08-03'), m2=H.D('2026-08-10');
    const pc=(pid,d)=>DATE.pointClosed?DATE.pointClosed(G,pid,d):'(沒有 pointClosed)';
    check('2. D11 溫泉博物館、D26 國美館、D28 文學館週一灰掉「今天休館」，週二照常；同一個地點的其他互動點照常',pc('D11.museum',m)==='今天休館'&&pc('D26.museum',m)==='今天休館'&&pc('D28.museum',m)==='今天休館'&&pc('D11.museum',tu)===''&&pc('D11.valley',m)===''&&pc('D26.path',m)==='',J([pc('D11.museum',m),pc('D11.museum',tu),pc('D11.valley',m)]));
    check('2. D19 黃金博物館只有每月第一個週一（8/3）休館，8/10 照常；D09（纜車週一「常」停駛）不擋',pc('D19.museum',m1)==='今天休館'&&pc('D19.museum',m2)===''&&pc('D09.gondola',m)===''&&(DATE.closedOn?DATE.closedOn('D09',m)==='':false),J([pc('D19.museum',m1),pc('D19.museum',m2)])); }
  setup('2026-07-13',9,{lv:{[YT]:5}});
  { const r=await goDate(YT,'D11',13,['溫泉博物館','地熱谷',0,'差不多',0,0]); const pm=pointMenus(); const mu=pm.length&&pm[0].o.find(o=>o.t==='溫泉博物館');
    check('2. 週一在北投：溫泉博物館灰掉、寫「今天休館」，按了只提示；地熱谷照常',!!r.t&&!!mu&&mu.dim&&mu.hint==='今天休館'&&toasts.includes('今天休館')&&!r.t.spots.includes('D11.museum')&&r.t.spots.includes('D11.valley'),J({mu,toasts,spots:r.t&&r.t.spots,why:r.b&&r.b.why})); }

  /* ======================= 3 依交通方式的花費（D09 纜車）======================= */
  setup('2026-10-10',9,{lv:{[ZQ]:5}});
  { const g=DATE.points('D09').find(p=>p.id==='D09.gondola'), pc=DATE.pointCost||(()=>null);
    check('3. D09 纜車：開車來扣 120（捷運的車資 180 已經含纜車來回）、搭捷運 0',pc(g,{transport:'car'})===120&&pc(g,{transport:'mrt'})===0,J([pc(g,{transport:'car'}),pc(g,{transport:'mrt'})])); }
  { const r=await goDate(ZQ,'D09',15,['纜車',0,'差不多',0,0],'car'); const pm=pointMenus(); const go=pm.length&&pm[0].o.find(o=>o.t==='纜車車廂');
    check('3. 開車去貓空：選纜車的提示寫「30 分　120 元」、真的扣 120（加車資 100）',!!r.t&&!!go&&go.hint==='30 分　120 元'&&r.t.spots.includes('D09.gondola')&&r.spent===120+100+(r.t.spots.filter(s=>s!=='D09.gondola').reduce((s,id)=>s+((DATE.points('D09').find(p=>p.id===id)||{}).cost|0),0)),J({go,spent:r.spent,spots:r.t&&r.t.spots,why:r.b&&r.b.why})); }

  /* ======================= 4 人物頁「一起去過的地方」======================= */
  setup('2026-10-10',9,{lv:{[ZR]:5}});
  { await goDate(ZR,'D04',13,['小吃',0,'差不多',0,0]); H.G.day=H.D('2026-10-17'); H.G.hour=9; await goDate(ZR,'D13',13,[0,0,'差不多',0,0]);
    const h=DATE.historyText?DATE.historyText(H.G,ZR):null;
    check('4. 一行一趟、照時間排：「2026/10/10　西門町電影院」「2026/10/17　淡水金色水岸」',J(h)===J(['2026/10/10　西門町電影院','2026/10/17　淡水金色水岸']),J(h)); }

  H.done();
})();
