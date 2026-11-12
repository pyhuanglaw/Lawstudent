// 所有有營業時間、走得進去的店：打烊時人還在店裡＝店員（老闆在顧的店＝老闆）一句「我們今天要打烊了。」、走出店門站到門口外面，不另外出旁白（AA_700，企劃線 4f60052c8；CLOSE-UNIFY-1105）——不需要瀏覽器。
//   0  載得到；那一句逐字在 AA_700；表上的店、說話的人（店員／老闆）
//   1  每一間（XSCLOSE.ZONES）：開著的時候進來 → 最後一段營業結束（+6 分鐘）＝剛好一句（說話的人照表）、走到門口外面（表上的 out 或區域的出口）、沒有別的字
//   2  正在坐著轉暗（場景忙）不打斷：等場景結束（打烊後 1.5 小時）才出那一句
//   3  中午休息（林家乾麵 14:00、118 巷滇香 14:00）：不說那一句，只請你出去、寫開放時間；讀檔回到打烊以後（新的一趟、過了那一刻）：不說、寫開放時間；颱風天：不說
//   4  24 小時的店（日和便利店、大口漢堡）、不是店（總圖）：沒有這一句
//   5  自己有打烊系統的店（afar、Daybreak、青木、日常失速、木曜日、同弦）：打烊那一刻＝剛好一句（店員／老闆），舊的打烊旁白都拿掉了
//   6  舊的打烊字串（AA_645／648／652／653／693／695／699）不在 src 裡
// 修改前（af685344a）：表上只有新生南路六間、字是各家的旁白；溫州街、2:30 AM、慢輪、118 巷、亞洲超市打烊不請你出去——第 0、1、5、6 節 FAIL。
// 用法：node tests/close_unify_unit.js
const H=require('./pg_harness.js'); const {check,GM,E}=H;
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const J=JSON.stringify, LINE='我們今天要打烊了。';
console.warn=()=>{};
const loadErr=[];
const L=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)){ loadErr.push(f+'（沒有這個檔）'); return; } try{ let s=fs.readFileSync(p,'utf8'); s=s.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); }catch(e){ loadErr.push(f+'：'+String(e).slice(0,200)); } };
global.CG_REGISTRY=global.CG_REGISTRY||{};
global.MOK3={OUT:{x:7.4,z:-2.85,yaw:0},IN:{x:-3.75,z:5.4,yaw:Math.PI,lv:0},zone:{id:'wz_mokuyobi',build(){ return {seats:[]}; }}};
global.SH3={streetOut:()=>({x:1,z:2,yaw:0})}; global.NY3={streetOut:()=>({x:3,z:4,yaw:0})}; global.XSS={streetOut:id=>({x:id==='dabu'?5:6,z:0,yaw:0})}; global.XP3={streetOut:()=>({x:7,z:0,yaw:0})};
for(const f of ['src/data/lane118_shops.js','src/data/l118_redo772.js','src/data/l118_shop_layouts.js','src/lane118.js','src/data/afar_layout.js','src/data/daybreak_layout.js','src/data/daily_offbeat_layout.js','src/data/tongxian_layout.js','src/tongxian3d.js',
  'src/mokuyobi_sys3d.js','src/offbeat_sys3d.js','src/gg2shops3d.js','src/ggshops_sys3d.js','src/guitar3d.js','src/xs_close3d.js']) L(f);
const X=typeof XSCLOSE!=='undefined'?XSCLOSE:null;
const toasts=[]; GM.toast=t=>toasts.push(t); GM.enterN=1; let stood=0; GM.standUp=()=>{ stood++; E.player.seat=null; };
const fresh=(day,h,zone)=>{ const k=CALENDAR.dateOf(day).key; const G=H.fresh(k,h,zone); toasts.length=0; stood=0; E.player.seat=null; E.player.busy=false; return G; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const said=()=>H.said.map(s=>[s.who,s.t]);
const BASE=STORY.dayOfKey('2025-11-05');
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
(async()=>{
await sec(0,()=>{ check('0. 程式載得到（xs_close3d.js 和各家打烊系統）',!loadErr.length&&!!X,loadErr.join(' | '));
  let doc=''; try{ doc=cp.execSync('git show 4f60052c8:"docs/story_planning/AA_700_打烊統一一句.md"',{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']}); }catch(e){}
  if(!doc) console.log('SKIP 0. 讀不到 AA_700（企劃線 4f60052c8）'); else check('0. 那一句逐字在 AA_700：「店員：'+LINE+'」、老闆在顧的店（好拍運動、同弦樂器）＝老闆',X.LINE===LINE&&doc.includes('店員：'+LINE)&&/好拍運動、同弦樂器/.test(doc)&&/＝「老闆」/.test(doc));
  const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
  check('0. index.html 載入 xs_close3d.js（在各家系統後面）',html.indexOf('src/xs_close3d.js')>html.indexOf('src/guitar3d.js')&&html.indexOf('src/guitar3d.js')>0);
  const want={xs_shanlan:'店員',xs_nanyang:'店員',xs_nanyang_hall:'店員',xs_dabu:'店員',xs_haopai:'老闆',xs_xsports:'店員',cafe:'店員',wz_brunch:'店員',wz_print:'老闆',wz_teahouse:'店員',wz_lin:'老闆',wz_teishoku:'老闆',bikeshop:'老闆',us_asian_market:'店員',
    l118_dian:'老闆娘',l118_self:'店員',l118_tea:'店員',l118_home:'老闆娘',l118_cafe2:'店員',l118_pasta:'老闆',l118_korea:'老闆',l118_omu:'店員',l118_noodle2:'老闆',
    noodle:'店員',bookstore:'店員',us_market:'店員',tz_limao:null,   /* AA_831 的四間（SHOP-STANDARD-BACKFILL-1112；禮貌生財店裡沒有人＝不說那一句，細節在 tests/shop_hours_aa831_1112_unit.js）*/
    afar:'店員',daybreak:'店員',aoki:'店員',wz_offbeat:'店員',wz_mokuyobi:'老闆',xs_tongxian:'老闆',yangyang:'老闆',corner_records:'店員'};   /* 洋洋鹹酥雞（YANGYANG-IN-1107）：自己的打烊系統（gg2shops3d.js），說話的人老闆、字照 AA_700（AA_724 第 7 節 bf5c3e6c6）；細節在 tests/yangyang_shop_unit.js */
  const bad=Object.keys(want).filter(z=>X.whoOf(z)!==want[z]);
  check('0. 表上 '+Object.keys(want).length+' 個區域、說話的人（店員／老闆）',!bad.length&&Object.keys(X.ZONES).length+Object.keys(X.PLACE_OF).length===Object.keys(want).length,J(bad.map(z=>[z,X.whoOf(z)])));
  check('0. 118 巷九間都在表上（l118_shop_layouts 的每一間）',Object.keys(L118_SHOP_LAYOUTS).every(id=>!!X.ZONES['l118_'+id]),J(Object.keys(L118_SHOP_LAYOUTS))); });
if(!X){ H.done(); return; }
/* 找一天有開的：那天的最後一段 [a,c]（118 巷的照 lane118_shops.js）*/
const winsOf=(z,day)=>{ const C=X.ZONES[z]; return C.wins?C.wins(day):X.windows(C.place,day); };
const pick=z=>{ for(let d=BASE;d<BASE+14;d++){ const ws=winsOf(z,d); if(!ws||!ws.length) continue; if(PLACES.typhoonClosed&&X.ZONES[z].place&&PLACES.typhoonClosed(X.ZONES[z].place,d)) continue; const last=ws.reduce((a,w)=>w[1]>a[1]?w:a,ws[0]); return {d,a:last[0],c:last[1]}; } return null; };
const at=(d,h)=>h>=24?[d+1,h-24]:[d,h];
const exitIT=z=>{ const C=X.ZONES[z]; return C.out?[]:[{x:0,z:0,radius:1,label:'出口',exit:{to:C.to||'us_market_street',spawn:{x:9,z:8,yaw:1}}}]; };
const tickWait=async()=>{ const r=X.tick(GM); await sleep(5); return r; };
await sec(1,async()=>{ const rows=[]; let ok=0;
  for(const z of Object.keys(X.ZONES)){ if(X.ZONES[z].mute) continue;   /* 禮貌生財：不說那一句（tests/shop_hours_aa831_1112_unit.js 第 3 節）*/ const p=pick(z); if(!p){ rows.push([z,'找不到有開的那一天']); continue; } const C=X.ZONES[z];
    const [d0,h0]=at(p.d,p.a+0.2); fresh(d0,h0,z); GM.enterN=100; E.interactables=exitIT(z); E.player.seat={x:0,z:0};
    const r0=await tickWait(); const [d1,h1]=at(p.d,p.c+0.1); H.G.day=d1; H.G.hour=h1;
    const r1=await tickWait(); const out=C.out?C.out():{x:9,z:8,yaw:1}, to=C.out?(C.to||'xinsheng'):(C.to||'us_market_street');
    const good=r0===false&&r1===true&&J(said())===J([[C.who,LINE]])&&H.entered.length===1&&H.entered[0]===to&&stood===1&&!toasts.length&&H.cards.length===0;
    if(good) ok++; else rows.push([z,{r0,r1,said:said(),entered:H.entered,toasts:toasts.slice(),stood,out}]); }
  check('1. 每一間（'+Object.keys(X.ZONES).filter(z=>!X.ZONES[z].mute).length+'）開著的時候進來、最後一段營業結束：剛好一句（'+LINE+'，店員／老闆照表）、站起來、走到門口外面、沒有別的字',!rows.length,J(rows)); });
await sec(1.1,async()=>{ /* 走到哪：表上的 out（新生南路店門外、118 巷店門口）；有 spawn 的照它 */
  const pos=[]; const orig=GM.enter; GM.enter=async(z,s)=>{ pos.push([z,s]); H.G.zone=z; };
  try{ for(const z of ['xs_haopai','l118_dian','wz_lin']){ const p=pick(z); fresh(...at(p.d,p.a+0.2),z); GM.enterN=110; E.interactables=exitIT(z); await tickWait(); const [d1,h1]=at(p.d,p.c+0.1); H.G.day=d1; H.G.hour=h1; await tickWait(); } }
  finally{ GM.enter=orig; }
  const so=L118_SHOP_LAYOUTS.dian.street.spawn_out;
  check('1. 出去站的地方：好拍＝XSS.streetOut(haopai)、滇香＝118 巷配置的 street.spawn_out、林家＝店裡出口按鈕的 spawn',J(pos)===J([['xinsheng',{x:6,z:0,yaw:0}],['lane118',{x:so.x,z:so.z,yaw:so.yaw}],['wenzhou',{x:9,z:8,yaw:1}]]),J(pos)); });
await sec(2,async()=>{ const z='xs_shanlan', p=pick(z); fresh(...at(p.d,p.a+0.2),z); GM.enterN=200; await tickWait();
  E.player.busy=true; H.G.hour=p.c+0.3; const r1=await tickWait(); const s1=said().length;
  H.G.hour=p.c+1.5; const r2=await tickWait(); E.player.busy=false; const r3=await tickWait();
  check('2. 坐地板轉暗那一段（場景忙）：不打斷；場景結束（打烊後 1.5 小時）才出那一句、走出去',r1===false&&s1===0&&r2===false&&r3===true&&J(said())===J([['店員',LINE]])&&H.entered[0]==='xinsheng',J([r1,r2,r3,said()]));
  const z2='wz_teishoku', p2=pick(z2); fresh(...at(p2.d,p2.a+0.2),z2); GM.enterN=201; E.interactables=exitIT(z2); await tickWait(); E.player.busy=true; const [d1,h1]=at(p2.d,p2.c+0.2); H.G.day=d1; H.G.hour=h1; await tickWait(); H.G.hour=h1+1; E.player.busy=false; const r4=await tickWait();
  check('2. 過了半夜才關的店（小路 02:00）：等到 03:12 才出那一句也一樣',r4===true&&J(said())===J([['老闆',LINE]]),J([r4,said()])); });
await sec(3,async()=>{ /* 2026-11-12（SHOP-LIFE-AUDIT-1112）改期望——舊期望：林家乾麵（11–14、17–21）、118 巷滇香小館中午休息，14:00 被請出去（不說那一句、寫開放時間）。
     現在這兩間的營業時間都併成一段（林家乾麵 11:00–21:00，使用者 11-12；118 巷九間 L118-SHOPS-REDO-1111 改版後都是一段），遊戲裡沒有中午休息的店了：
     14:00 待在店裡＝什麼都不發生（不請出去、不說話）。「中午休息＝只請你出去」那條規則（xs_close3d.js S.gen）還在，之後有兩段營業的店會照它走。*/
  let d=BASE; while(!(winsOf('wz_lin',d)||[]).length) d++;
  check('3. 林家乾麵的營業時間是一段（11:00–21:00；沒有中午休息）',J(winsOf('wz_lin',d))===J([[11,21]]),J(winsOf('wz_lin',d)));
  fresh(d,12,'wz_lin'); GM.enterN=300; E.interactables=exitIT('wz_lin'); await tickWait(); H.G.hour=14.1; const r=await tickWait();
  check('3. 林家乾麵 14:00 待在店裡：不請出去、不說話（沒有中午休息了）',r!==true&&!H.said.length&&!H.entered.length&&!toasts.length,J([r,said(),toasts,H.entered]));
  let d2=BASE; while(!(winsOf('l118_dian',d2)||[]).length) d2++;
  fresh(d2,12,'l118_dian'); GM.enterN=301; await tickWait(); H.G.hour=14.1; const r2=await tickWait();
  check('3. 118 巷 118牛排 14:00 待在店裡：不請出去、不說話（一段營業 11:30～21:30）',r2!==true&&!H.said.length&&!H.entered.length&&!toasts.length,J([r2,said(),toasts,H.entered]));
  const p=pick('wz_brunch'); fresh(p.d,p.c+2,'wz_brunch'); GM.enterN=302; E.interactables=exitIT('wz_brunch'); const r3=await tickWait();
  check('3. 讀檔回到打烊以後（這一趟沒看過開著、過了那一刻）：不說，走出去、寫開放時間',r3===true&&!H.said.length&&H.entered[0]==='wenzhou'&&toasts.length===1&&/SUNNY SIDE/.test(toasts[0]),J([said(),toasts]));
  const p4=pick('wz_teahouse'); fresh(p4.d,p4.c+0.1,'wz_teahouse'); GM.enterN=303; E.interactables=exitIT('wz_teahouse'); const r4=await tickWait();
  check('3. 讀檔剛好在打烊那一刻（打烊後半小時內）：說那一句',r4===true&&J(said())===J([['店員',LINE]]),J(said()));
  const TC=PLACES.typhoonClosed; PLACES.typhoonClosed=z=>PLACES.typhoonShops.includes(z);
  try{ fresh(p.d,10,'wz_brunch'); GM.enterN=304; E.interactables=exitIT('wz_brunch'); const r5=await tickWait();
    check('3. 颱風天（店整天沒開）還在店裡：不說，走出去、寫颱風假',r5===true&&!H.said.length&&toasts.length===1&&/颱風/.test(toasts[0]),J([said(),toasts])); }
  finally{ PLACES.typhoonClosed=TC; } });
await sec(4,async()=>{ const res=[]; for(const [z,h] of [['cvs',3],['xs_dakou',4],['library_hall',23]]){ fresh(BASE,h,z); GM.enterN=400; const r=await tickWait(); res.push(r===false&&!H.said.length&&!H.entered.length); }
  check('4. 24 小時的店（日和便利店 03:00、大口漢堡 04:00）、不是店（總圖 23:00）：沒有這一句、不請你出去',res.every(Boolean)&&!X.ZONES.cvs&&!X.ZONES.xs_dakou&&!X.PLACE_OF.cvs,J(res)); });
await sec(5,async()=>{ const rows=[];
  const sys=[['afar',()=>GG2.closeOut(GM),'gongguan'],['daybreak',()=>GG2.closeOut(GM),'gongguan'],['aoki',()=>GGS.closeOut(GM),'gongguan'],['wz_offbeat',()=>OFFB.closeOut(GM),'wenzhou'],['wz_mokuyobi',()=>MOKS.closeOut(GM),'wenzhou'],['xs_tongxian',()=>GUITAR.closeOut(GM),'xinsheng'],['yangyang',()=>GG2.closeOut(GM),'gongguan'],['corner_records',()=>GG2.closeOut(GM),'gongguan']];   /* 轉角唱片（CORNER-IN-1107）*/   /* 洋洋鹹酥雞（YANGYANG-IN-1107；01:00 打烊＝隔天 01:06）*/
  for(const [z,fn,to] of sys){ const place=X.PLACE_OF[z]; let d=BASE, ws; for(;d<BASE+14;d++){ ws=X.windows(place,d); if(ws&&ws.length) break; } const c=Math.max(...ws.map(w=>w[1]));
    const [d1,h1]=at(d,c+0.1); fresh(d1,h1,z); GM.enterN=500; const r=await fn();
    const good=J(said())===J([[X.whoOf(z),LINE]])&&H.entered[0]===to&&!toasts.length; if(!good) rows.push([z,r,said(),H.entered,toasts.slice()]); }
  check('5. 自己有打烊系統的八間（afar、Daybreak、青木、日常失速、木曜日、同弦、洋洋鹹酥雞、轉角唱片）打烊那一刻：剛好一句（店員／老闆）、走出去、不另外出字',!rows.length,J(rows));
  /* 這一趟進來的時候開著、打烊後過了半小時才輪到（例：坐著讀書轉暗）：一樣說 */
  { const ws=X.windows('afar',BASE), c=Math.max(...ws.map(w=>w[1])); fresh(BASE,c-1,'afar'); GM.enterN=501; X.tick(GM); H.G.hour=c+1.2; await GG2.closeOut(GM);
    check('5. afar：進來時開著、打烊後 1.2 小時才輪到：一樣店員那一句',J(said())===J([['店員',LINE]]),J(said())); }
  check('5. 舊的打烊旁白拿掉了（GG2.L.afar／daybreak.close、GGS.L.close、OFFB.L.close、MOKS.L.close、GUITAR.L.closeBoss）',!GG2.L.afar.close&&!GG2.L.daybreak.close&&!GGS.L.close&&!OFFB.L.close&&!MOKS.L.close&&!GUITAR.L.closeBoss); });
await sec(6,()=>{ const OLD=['我們九點打烊喔。','我們三點休息囉。','我們九點打烊。……茶葉','我們一點打烊喔。','十點了。……要打烊了。','九點半了。明天再來。','今天的營業時間快結束了','今天的場次都結束了，謝謝光臨','店裡的音樂停了。店員把試穿的鞋','老闆把穿線機的燈關掉','我們要打烊了喔。'];
  const files=fs.readdirSync(path.join(H.ROOT,'src')).filter(f=>/\.js$/.test(f)).map(f=>'src/'+f); const hit=[];
  for(const f of files){ const s=fs.readFileSync(path.join(H.ROOT,f),'utf8'); for(const t of OLD) if(s.includes(t)) hit.push(f+'：'+t); }
  check('6. 舊的打烊字串（AA_645／648／652／653／693／695／699）不在 src 裡',!hit.length,J(hit)); });
await sec(7,async()=>{ const had=typeof JOBS!=='undefined'; if(!had) globalThis.JOBS={ZONE_KEY:{wz_print:'copy'},rec:G=>(G.jobs=G.jobs||{}),worked:(G,k,d)=>!!(G.jobs&&G.jobs[k]&&(G.jobs[k].worked||[]).includes(d))};   /* jobs3d.js 要整套配置才載得起來：這一節用它的介面（ZONE_KEY、worked）*/ const J=JOBS;
  const ws=X.windows('wz_print',BASE); if(!ws||!ws.length){ console.log('SKIP 7. 阿德影印這天沒有營業時間'); return; } const c=Math.max(...ws.map(w=>w[1]));
  fresh(BASE,c-1,'wz_print'); GM.enterN=701; X.tick(GM); H.G.hour=c+0.1; const k=J.ZONE_KEY.wz_print; J.rec(H.G); H.G.jobs[k]=Object.assign(H.G.jobs[k]||{},{worked:[H.G.day]});
  check('7. 玩家那天在阿德影印打工（店裡的人）：打烊不說那句（AA-C 11-05 08:10：照打工下班的流程走出去）',X.staffToday(H.G,'wz_print')===true&&X.gen(GM,'wz_print')===false,J.ZONE_KEY.wz_print);
  H.G.jobs[k].worked=[]; check('7. 沒打工的晚上照樣說',X.staffToday(H.G,'wz_print')===false&&X.gen(GM,'wz_print')===true); if(!had) delete globalThis.JOBS; });
H.done();
})();
