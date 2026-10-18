// 溫州街三家店的客人選單（DL-09；AA-B AA_172 定稿；src/wzshops3d.js 的 WZS）——不需要瀏覽器。
// 檢查：半熟三個品項、扣錢正確、各 40 分鐘、吃完的旁白；黑板照星期幾（週日兩行）；一盞三種茶的價錢與時間、焙茶只在 12～2 月、喝完的季節旁白、選單沒有讀書；
//       影印：報告（第 6 週起）、海報（上學期第 2～5 週、下學期第 10～14 週）只在對的週次、10 分鐘、{科目}＝這學期有修的課、同一週不重複、考試週的旁白、22:00 以後那一句；
//       文具四樣（0 分鐘、不放進背包）；錢不夠灰掉、選了也不扣；不扣時段次數；打工的句子要等 DL-10（沒有 JOBS 時不播，有 JOBS.at 熟練 3 時播）。
// 修改前：沒有 WZS（第 1 項就失敗）。用法：node tests/dl09_shop_menu_unit.js
const vm=require('vm'), fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.location={search:''};
for(const f of ['src/data/calendar.js','src/wzshops3d.js']) vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (CALENDAR|WZS)\s*=/mg,'global.$1='),{filename:f});
global.CLS={termCourses:(G,id)=>[{name:'民法總則'},{name:'憲法'}]};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
check('1. 有 WZS.interact、BRUNCH、TEA、printMenu、printLine、STATIONERY',typeof WZS!=='undefined'&&typeof WZS.interact==='function'&&WZS.BRUNCH.length===3&&WZS.TEA.length===3&&WZS.STATIONERY.length===4);
if(fails){ console.log('FAILED '+fails); process.exit(1); }
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
const termDay=(id,wk,wd)=>{ for(let d=-400;d<1500;d++){ const t=CALENDAR.termOf(d); if(t&&t.id===id&&t.week===wk&&CALENDAR.dateOf(d).wd===wd) return d; } return null; };
const mk=(day,hour,money)=>({day,hour,weekday:CALENDAR.dateOf(day).wd%7,flags:{},daily:{},money:money==null?2000:money,zone:'wz_brunch'});
const mkGM=(G,ans)=>{ const q=(ans||[]).slice(); const L={says:[],menus:[],toasts:[],adv:0,spent:0}; return {G,L,sceneBegin(){},sceneEnd(){},advance(h){ L.adv+=h; G.hour+=h; },toast(t){ L.toasts.push(t); },
  money(d){ G.money+=d; L.spent-=d; },say:async(w,t)=>{ L.says.push(t); },choose:async o=>{ L.menus.push(o.map(x=>x.t+(x.dim?'〔灰〕':''))); const a=q.shift(); return a==null?o.length-1:a; }}; };
const near=(a,b)=>Math.abs(a-b)<1e-6;
(async()=>{
  // 半熟
  { const G=mk(termDay('Y1S1',4,3),10); const g=mkGM(G,[0]); await WZS.interact(g,{wzShop:'brunch',kind:'cashier'});
    check('2. 半熟點餐：選單三個品項＋價錢（190／260／220）＋「不用了」',g.L.menus[0].join('|')==='半熟蛋吐司套餐（附沙拉、紅茶）　190 元|班尼迪克蛋（附紅茶）　260 元|法式吐司（附熱拿鐵）　220 元|不用了');
    check('2. 選半熟蛋吐司：扣 190、花 40 分鐘、吃完那一句',g.L.spent===190&&near(g.L.adv,40/60)&&g.L.says[0]==='蛋黃剛好流到吐司邊。你終於知道，三分四十秒是什麼意思。'&&g.L.says.length===1,JSON.stringify(g.L));
    const g2=mkGM(G,[1]); await WZS.interact(g2,{wzShop:'brunch',kind:'cashier'}); const g3=mkGM(G,[2]); await WZS.interact(g3,{wzShop:'brunch',kind:'cashier'});
    check('2. 班尼迪克蛋 260、法式吐司 220，各 40 分鐘、各自的旁白',g2.L.spent===260&&g3.L.spent===220&&near(g2.L.adv,40/60)&&near(g3.L.adv,40/60)&&g2.L.says[0]==='醬汁很濃。你把最後一口麵包留下來擦盤子。'&&g3.L.says[0]==='甜的。窗外的騎樓有人在排隊，你吃得很慢。');
    const Gp=mk(G.day,10,200); const gp=mkGM(Gp,[1]); await WZS.interact(gp,{wzShop:'brunch',kind:'cashier'});
    check('2. 錢不夠（200 元）：班尼迪克蛋、法式吐司灰掉；選了也不扣錢、不花時間',gp.L.menus[0][1].endsWith('〔灰〕')&&gp.L.menus[0][2].endsWith('〔灰〕')&&!gp.L.menus[0][0].endsWith('〔灰〕')&&gp.L.spent===0&&gp.L.adv===0&&gp.L.toasts[0]==='錢不夠'); }
  { const want={2:'蛋是三分四十秒',3:'蛋是三分四十秒',4:'醬是早上現打的',5:'醬是早上現打的',6:'週末，甜一點也沒關係'}; let ok=true, info=[];
    for(const [w,frag] of Object.entries(want)){ const G=mk(termDay('Y1S1',5,+w),10); const g=mkGM(G); await WZS.interact(g,{wzShop:'brunch',kind:'chalkboard'}); if(!(g.L.says.length===1&&g.L.says[0].includes(frag)&&g.L.adv===0)) ok=false; info.push(w+':'+g.L.says.join('/')); }
    const Gs=mk(termDay('Y1S1',5,7),10); const gs=mkGM(Gs); await WZS.interact(gs,{wzShop:'brunch',kind:'chalkboard'});
    check('3. 黑板照星期幾（週二三、週四五、週六）、0 分鐘；週日「老闆娘決定」＋小字',ok&&gs.L.says.join('|')==='今日推薦：老闆娘決定。|（下面一行小字：她今天心情很好。）',info.join(' ')+' / '+gs.L.says.join('|')); }
  // 一盞
  { const G=mk(dayOf('2025-10-15'),14); const g=mkGM(G,[0]); await WZS.interact(g,{wzShop:'teahouse',kind:'tea'});
    check('4. 一盞（10 月）：凍頂烏龍 280、東方美人 330；沒有焙茶、沒有讀書',g.L.menus[0].join('|')==='凍頂烏龍（附一碟茶點）　280 元|東方美人（附一碟茶點）　330 元|不用了'&&!g.L.menus[0].some(t=>/讀書|六法/.test(t)));
    check('4. 凍頂烏龍：60 分鐘、喝完那一句＋秋天那一句',g.L.spent===280&&near(g.L.adv,1)&&g.L.says[0]==='第三泡的時候，茶的味道變甜了。蘇姨說，這是茶在說話。'&&g.L.says[1]==='竹掃把靠在牆邊。院子裡的落葉，蘇姨說明天再掃。',JSON.stringify(g.L.says));
    const g2=mkGM(G,[1]); await WZS.interact(g2,{wzShop:'teahouse',kind:'tea'}); check('4. 東方美人：330、90 分鐘',g2.L.spent===330&&near(g2.L.adv,1.5)&&g2.L.says[0]==='茶湯是琥珀色的。你一直等到它涼了一點才喝。');
    const Gw=mk(dayOf('2026-01-07'),14); const gw=mkGM(Gw,[2]); await WZS.interact(gw,{wzShop:'teahouse',kind:'tea'});
    check('4. 1 月：有焙茶 260（60 分鐘）、冬天那一句',gw.L.menus[0][2]==='焙茶　260 元'&&gw.L.spent===260&&near(gw.L.adv,1)&&gw.L.says[0]==='焙過的香味，一進門就聞得到。手是暖的。'&&gw.L.says[1]==='下午三點的陽光，剛好照到緣側的坐墊上。你不想起來。');
    const ss=[['2026-04-08','院子的老樟樹在換葉子'],['2026-07-08','緣側的風鈴一直在響'],['2025-12-10','下午三點的陽光']]; let ok=true;
    for(const [d,f] of ss){ if(!WZS.teaSeason(mk(dayOf(d),14)).startsWith(f)) ok=false; }
    check('4. 四季的旁白（3～5、6～8、9～11、12～2 月）；焙茶只有 12～2 月',ok&&WZS.teaMenu(mk(dayOf('2025-12-01'),14)).length===3&&WZS.teaMenu(mk(dayOf('2026-02-28'),14)).length===3&&WZS.teaMenu(mk(dayOf('2026-03-01'),14)).length===2&&WZS.teaMenu(mk(dayOf('2025-11-30'),14)).length===2); }
  // 影印
  { const names=G=>WZS.printMenu(G).map(x=>x[0].replace(/（.*/,'')+x[1]).join(',');
    const a=names(mk(termDay('Y1S1',3,3),10)), b=names(mk(termDay('Y1S1',6,3),10)), c=names(mk(termDay('Y1S2',3,3),10)), d=names(mk(termDay('Y1S2',12,3),10)), e=names(mk(termDay('Y1S1',1,3),10));
    check('5. 影印的選單：上學期第 3 週＝筆記＋海報；第 6 週＝筆記＋報告；下學期第 3 週＝只有筆記；第 12 週＝筆記＋報告＋海報；第 1 週＝只有筆記；沒有「整本書」',a==='印筆記30,彩色海報80'&&b==='印筆記30,印報告＋釘書50'&&c==='印筆記30'&&d==='印筆記30,印報告＋釘書50,彩色海報80'&&e==='印筆記30',[a,b,c,d,e].join(' / '));
    const G=mk(termDay('Y1S1',4,2),15); const seen=[]; let ok=true; for(let i=0;i<4;i++){ const g=mkGM(G,[0]); await WZS.interact(g,{wzShop:'print',kind:'print'}); if(!(g.L.spent===30&&near(g.L.adv,1/6))) ok=false; seen.push(g.L.says[0]); G.hour=15; }
    check('5. 印筆記：30 元、10 分鐘；同一週四次，四句都不一樣、都是「平常」的池；{科目} 換成這學期的課',ok&&new Set(seen).size===4&&seen.every(t=>!/\{科目\}/.test(t)&&!/考古題|打了一個哈欠/.test(t))&&seen.some(t=>/民法總則|憲法/.test(t)),seen.join(' / '));
    const Gn=mk(termDay('Y1S1',5,2),15); const gn=mkGM(Gn,[0]); await WZS.interact(gn,{wzShop:'print',kind:'print'}); check('5. 下一週重新輪（池重置）',WZS.PRINT_LINES.some(l=>l.replace('{科目}','民法總則')===gn.L.says[0]||l.replace('{科目}','憲法')===gn.L.says[0]));
    const Ge=mk(termDay('Y1S1',8,2),15); const ex=[]; for(let i=0;i<2;i++){ const g=mkGM(Ge,[0]); await WZS.interact(g,{wzShop:'print',kind:'print'}); ex.push(g.L.says[0]); }
    check('5. 期中考週（第 8 週）：考試週的兩句（考古題、「這週大家都在印{科目}」）',new Set(ex).size===2&&ex.some(t=>/考古題/.test(t))&&ex.some(t=>/^阿德：「這週大家都在印(民法總則|憲法)。」$/.test(t)),ex.join(' / '));
    const Gl=mk(termDay('Y1S1',16,3),22.5); const lates=[]; for(let i=0;i<3;i++){ const g=mkGM(Gl,[0]); await WZS.interact(g,{wzShop:'print',kind:'print'}); lates.push(g.L.says[0]); Gl.hour=22.5; }
    check('5. 期末考週 22:00 以後：多「店裡只剩你和影印機的聲音」那一句',lates.includes(WZS.PRINT_LATE),lates.join(' / '));
    const gs=mkGM(mk(termDay('Y1S1',4,2),15),[0]); await WZS.interact(gs,{wzShop:'print',kind:'stationery'});
    check('6. 文具：四樣（35／20／30／15）、0 分鐘、只有旁白',gs.L.menus[0].slice(0,4).map(t=>t.replace(/.*　/,'')).join(',')==='35 元,20 元,30 元,15 元'&&gs.L.spent===35&&gs.L.adv===0&&gs.L.says[0]==='新的螢光筆。你在想第一個要畫的是哪一條。'); }
  // 打工（DL-10 之前不播；有 JOBS.at 熟練 3 時播）
  { const G=mk(dayOf('2025-10-15'),14); const g=mkGM(G,[0]); await WZS.interact(g,{wzShop:'teahouse',kind:'tea'}); const none=g.L.says.length===2;
    global.JOBS={at:(G,k)=>k==='teahouse'?{lv:3}:null}; const g2=mkGM(G,[0]); await WZS.interact(g2,{wzShop:'teahouse',kind:'tea'}); delete global.JOBS;
    check('7. 打工的那一句：沒有打工系統時不播；在一盞打工、熟練 3 時，喝完多蘇姨那一句',none&&g2.L.says[2]===WZS.TEA_WORK); }
  { const G=mk(dayOf('2025-10-15'),14); const a=mkGM(G), b=mkGM(G); await WZS.interact(a,{wzShop:'teahouse',kind:'garden'}); await WZS.interact(b,{wzShop:'teahouse',kind:'garden'}); G.hour=19; const c=mkGM(G); await WZS.interact(c,{wzShop:'teahouse',kind:'garden'});
    const t1=mkGM(G), t2=mkGM(G); await WZS.interact(t1,{wzShop:'teahouse',kind:'tokonoma'}); await WZS.interact(t2,{wzShop:'teahouse',kind:'tokonoma'});
    check('7b. 一盞：看院子白天兩句輪流、18:00 以後石燈籠那一句；看掛軸兩句輪流；都是 0 分鐘（AA_172 2-2）',a.L.says[0]!==b.L.says[0]&&WZS.GARDEN.slice(0,2).includes(a.L.says[0])&&WZS.GARDEN.slice(0,2).includes(b.L.says[0])&&c.L.says[0]===WZS.GARDEN[2]&&t1.L.says[0]!==t2.L.says[0]&&WZS.TOKONOMA.includes(t1.L.says[0])&&a.L.adv+c.L.adv+t1.L.adv===0); }
  { const src=fs.readFileSync(path.join(ROOT,'src/wzshops3d.js'),'utf8'); check('8. 不扣時段次數（WZS 不呼叫 slotUse／slotPlan）',!/slotUse|slotPlan/.test(src)); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });
