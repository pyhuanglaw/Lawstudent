// 四間店的營業時間（AA_831，企劃線 8e41821f4a 第二版；第一版 b84e779563；SHOP-STANDARD-BACKFILL-1112，CLAUDE.md §12 第 5 點）——不需要瀏覽器。
//   0  資料檔和稿一樣（匯入工具 --check）；門口那四句逐字在 AA_831；places.js 的時間、公休和稿一樣；index.html 有載
//   1  PLACES.isOpen：公館燒臘 11:00～21:30 週一休、頁間書屋每天 11:00～21:30、禮貌生財 14:00～21:00 週一休、草原超市每天 08:00～22:00
//   2  門口（SH831.door）：關著＝稿的那一句旁白＋開放時間、不進去；開著＝不擋；那天在店裡有約（約的時間前一小時起）、有班＝不擋；颱風假交給原本那一句
//   3  打烊人還在店裡（XSCLOSE）：開著的時候進來 → 打烊＝店員一句「我們今天要打烊了。」（AA_700）走出去；禮貌生財店裡沒有人＝不說、走出去、寫開放時間
//   4  舊存檔：讀檔時人站在已經關門的店裡＝不卡住，走出去（不說那一句、寫開放時間）；場景忙＝等；有約＝不請出去
//   5  禮貌生財的算命桌（LM.openAt）照同一份時間；店員（SH831.staffed）關著不站人
// 修改前（f8a00372bb）：四間都沒有營業時間（整天開、沒有打烊）——第 0～5 節 FAIL。
// 用法：node tests/shop_hours_aa831_1112_unit.js
const H=require('./pg_harness.js'); const {check,GM,E}=H;
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const J=JSON.stringify, LINE='我們今天要打烊了。';
console.warn=()=>{};
const loadErr=[];
const L=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)){ loadErr.push(f+'（沒有這個檔）'); return; } try{ let s=fs.readFileSync(p,'utf8'); s=s.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); }catch(e){ loadErr.push(f+'：'+String(e).slice(0,200)); } };
for(const f of ['src/data/shop_hours_aa831.js','src/shop_hours831_3d.js','src/xs_close3d.js']) if(!(f==='src/xs_close3d.js'&&typeof XSCLOSE!=='undefined')) L(f);
const D=typeof SHOP_HOURS_AA831!=='undefined'?SHOP_HOURS_AA831:null, S=typeof SH831!=='undefined'?SH831:null, X=typeof XSCLOSE!=='undefined'?XSCLOSE:null;
const toasts=[]; GM.toast=t=>toasts.push(t); GM.enterN=1; GM.standUp=()=>{ E.player.seat=null; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const said=()=>H.said.map(s=>[s.who&&s.who.name!==undefined?s.who.name:s.who,s.t]);
const fresh=(key,h,zone)=>{ const G=H.fresh(key,h,zone); toasts.length=0; E.player.seat=null; E.player.busy=false; if(X&&X._resetSeen) X._resetSeen(); return G; };
const EXIT={noodle:'gongguan',bookstore:'gongguan',tz_limao:'tingzhou',us_market:'us_market_street'};
const exitIT=z=>[{x:0,z:0,radius:1,label:'出口',exit:{to:EXIT[z],spawn:{x:9,z:8,yaw:1}}}];
const tickWait=async()=>{ const r=X.tick(GM); await sleep(5); return r; };
const ZS=['noodle','bookstore','tz_limao','us_market'];
/* 2025-11-10＝週一、11-11＝週二、11-09＝週日 */
const MON='2025-11-10', TUE='2025-11-11', SUN='2025-11-09';
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
(async()=>{
await sec(0,()=>{ check('0. 載得到（資料檔、shop_hours831_3d.js、xs_close3d.js）',!loadErr.length&&!!D&&!!S&&!!X,loadErr.join(' | '));
  check('0. 那幾天的星期（週一／週二／週日）',CALENDAR.dateOf(H.D(MON)).wd%7===1&&CALENDAR.dateOf(H.D(TUE)).wd%7===2&&CALENDAR.dateOf(H.D(SUN)).wd%7===0);
  let r=null; try{ cp.execSync('python3 tools/shops/import_shop_hours_aa831.py --check',{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','pipe']}); r=true; }catch(e){ r=String(e.stderr||e.stdout||e).slice(0,200); }
  if(r!==true&&/unknown revision|bad object|fatal:/.test(r)) console.log('SKIP 0. 讀不到企劃線的 AA_831（'+r.trim()+'）'); else check('0. 資料檔和稿一樣（import_shop_hours_aa831.py --check）',r===true,r===true?'':r);
  let doc=''; try{ doc=cp.execSync('git show '+D.src.split('@')[1]+':"'+D.src.split('@')[0]+'"',{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']}); }catch(e){}
  if(!doc) console.log('SKIP 0. 讀不到 AA_831'); else { const bad=ZS.filter(z=>!doc.includes('| '+D.shops[z].name+' | '+D.shops[z].hours)||!doc.includes(' | '+D.shops[z].door+' |')); check('0. 四間的店名、時間、門口那一句逐字在 AA_831 的表上',!bad.length,J(bad)); }
  const bad=[]; for(const z of ZS){ const d=D.shops[z], o=PLACES.hours[z], w=o&&o.rules&&o.rules.week; if(!w||!o.shop){ bad.push([z,'places.js 沒有']); continue; }
    for(let i=0;i<7;i++){ const want=d.off.includes(i)?null:[d.open,d.close]; if(J(w[i])!==J(want)) bad.push([z,i,w[i],want]); }
    const hh=x=>PLACES.hhmm(x); if(!o.text.includes(hh(d.open)+'–'+hh(d.close))) bad.push([z,'text',o.text]); if(d.off.length!==(/公休/.test(o.text)?1:0)) bad.push([z,'text 公休',o.text]); }
  check('0. places.js 的時間、公休和稿一樣（四間）',!bad.length,J(bad));
  const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'), i1=html.indexOf('src/data/shop_hours_aa831.js'), i2=html.indexOf('src/shop_hours831_3d.js');
  check('0. index.html 載入資料檔、shop_hours831_3d.js',i1>0&&i2>i1);
  check('0. 四間都在 XSCLOSE 的表上；說話的人：店員（禮貌生財店裡沒有人＝不說）',ZS.every(z=>!!X.ZONES[z])&&X.whoOf('noodle')==='老闆娘'&&X.whoOf('bookstore')==='老闆'&&X.whoOf('us_market')==='店員'&&X.ZONES.tz_limao.who==='上師'&&X.ZONES.tz_limao.line===D.limaoClose.line&&!X.ZONES.tz_limao.mute);   /* 第二版 8e41821f4a：誰說那一句；禮貌生財＝上師說稿的一句 */ });
if(!D||!S||!X){ H.done(); return; }
await sec(1,()=>{ const o=(z,key,h)=>PLACES.isOpen(z,h,H.D(key));
  const rows=[['noodle',TUE,11,true],['noodle',TUE,10.9,false],['noodle',TUE,22.9,true],['noodle',TUE,23,false],['noodle',MON,12,true],['noodle',MON,21.5,true],['noodle',SUN,22.5,true],   /* 第二版：每天 11:00～23:00 */
    ['bookstore',MON,10,true],['bookstore',MON,9.9,false],['bookstore',SUN,21.4,true],['bookstore',SUN,21.5,false],['bookstore',TUE,2,false],
    ['tz_limao',TUE,19,true],['tz_limao',TUE,18.9,false],['tz_limao',TUE,23.4,true],['tz_limao',TUE,23.5,false],['tz_limao',MON,20,true],['tz_limao',SUN,15,false],
    ['us_market',MON,8,true],['us_market',MON,7.9,false],['us_market',SUN,21.9,true],['us_market',SUN,22,false],['us_market',TUE,19.5,true]];
  const bad=rows.filter(r=>o(r[0],r[1],r[2])!==r[3]); check('1. PLACES.isOpen 照稿（'+rows.length+' 個時刻）',!bad.length,J(bad));
  check('1. 關門的說明寫得出開放時間（PLACES.closedText）',ZS.every(z=>{ const t=PLACES.closedText(z,3,H.D(TUE)); return typeof t==='string'&&t.includes(PLACES.names[z]||z)&&/開門/.test(t); }),J(ZS.map(z=>PLACES.closedText(z,3,H.D(TUE))))); });
await sec(2,async()=>{ const rows=[];
  for(const [z,key,h] of [['noodle',MON,10],['noodle',TUE,23.5],['bookstore',TUE,9],['tz_limao',MON,15],['us_market',TUE,23]]){ fresh(key,h,'gongguan'); const r=await S.door(GM,z);
    if(!(r===true&&J(said())===J([[null,D.shops[z].door]])&&toasts.length===1&&toasts[0]===PLACES.closedText(z,h,H.D(key)))) rows.push([z,key,h,r,said(),toasts.slice()]); }
  check('2. 關著（公休、還沒開、打烊以後）到門口：稿的那一句旁白＋開放時間，不進去',!rows.length,J(rows));
  const rows2=[]; for(const [z,key,h] of [['noodle',TUE,12],['bookstore',MON,21],['us_market',SUN,8],['cafe',TUE,5],['cvs',TUE,3]]){ fresh(key,h,'gongguan'); const r=await S.door(GM,z); if(r!==false||H.said.length||toasts.length) rows2.push([z,r,said()]); }
  check('2. 開著、不是這四間：不擋、沒有字',!rows2.length,J(rows2));
  { const G=fresh(MON,18,'gongguan'); G.invites=[{who:'zhe',place:'noodle',day:G.day,h:18.5,state:'accepted'}]; const r=await S.door(GM,'noodle'); const due=S.due(G,'noodle');
    G.invites[0].h=21; const early=S.due(G,'noodle'); G.invites[0].h=18.5; G.invites[0].state='done'; const done=S.due(G,'noodle'); G.invites[0].state='accepted'; const other=S.due(G,'bookstore');
    check('2. 那天在店裡有約（答應了、約的時間前一小時起）：門照常開；太早、約完了、別間店＝不算',r===false&&!H.said.length&&due===true&&early===false&&done===false&&other===false,J({r,due,early,done,other,said:said()})); }
  { const G=fresh('2025-11-08',10.2,'gongguan'); const J0=global.JOBS; global.JOBS=Object.assign({},J0||{},{early:(g,z)=>z==='bookstore'}); let r,r2; try{ r=await S.door(GM,'bookstore'); r2=await S.door(GM,'noodle'); } finally { global.JOBS=J0; }
    check('2. 那天在店裡有班（JOBS.early：頁間書屋週六 10:00 的班）：門照常開；別間店照擋',r===false&&r2===true,J({r,r2})); }
  { const G=fresh(TUE,12,'gongguan'); const t0=PLACES.typhoonClosed; PLACES.typhoonClosed=()=>true; let r; try{ r=await S.door(GM,'noodle'); } finally { PLACES.typhoonClosed=t0; }
    check('2. 颱風假：這裡不出字（原本那一句在 story3d.js）',r===false&&!H.said.length,J({r,said:said()})); }
  const st=fs.readFileSync(path.join(H.ROOT,'src/story3d.js'),'utf8'), us=fs.readFileSync(path.join(H.ROOT,'src/us_life3d.js'),'utf8'), tz=fs.readFileSync(path.join(H.ROOT,'src/tingzhou3d.js'),'utf8');
  check('2. 接在門口：story3d.js（過年店休那一句後面）、us_life3d.js（草原超市）、tingzhou3d.js（禮貌生財的「看」）',st.indexOf('SH831.door(GM,it.exit.to)')>st.indexOf('NOODLE_CLOSED.door(GM)')&&st.indexOf('NOODLE_CLOSED.door(GM)')>0&&us.includes("SH831.door(GM,'us_market')")&&tz.includes('SH831.line(LM.zone)')); });
await sec(3,async()=>{ const rows=[];
  for(const z of ZS){ const d=D.shops[z]; fresh(TUE,d.close-0.5,z); GM.enterN=300; E.interactables=exitIT(z); E.player.seat={x:0,z:0};
    const r0=await tickWait(); H.G.hour=d.close+0.1; const r1=await tickWait();
    const WHO={noodle:'老闆娘',bookstore:'老闆',us_market:'店員'}, want=z==='tz_limao'?[['上師',D.limaoClose.line]]:[[WHO[z],LINE]], tw=[];
    if(!(r0===false&&r1===true&&J(said())===J(want)&&J(H.entered)===J([EXIT[z]])&&J(toasts)===J(tw))) rows.push([z,{r0,r1,said:said(),entered:H.entered,toasts:toasts.slice()}]); }
  check('3. 開著的時候進來、打烊：店員一句「'+LINE+'」走到店外（禮貌生財：不說、走出去、寫開放時間）',!rows.length,J(rows)); });
await sec(4,async()=>{ const rows=[];
  for(const [z,key,h] of [['noodle',MON,9],['noodle',TUE,2],['bookstore',TUE,8],['tz_limao',MON,15],['us_market',TUE,23.5]]){ fresh(key,h,z); GM.enterN=400+rows.length; E.interactables=exitIT(z);
    const r=await tickWait(); if(!(r===true&&!H.said.length&&J(H.entered)===J([EXIT[z]])&&toasts.length===1&&toasts[0]===PLACES.closedText(z,h,H.D(key)))) rows.push([z,key,h,{r,said:said(),entered:H.entered,toasts:toasts.slice()}]); }
  check('4. 舊存檔：讀檔時人在已經關門的店裡＝走出去、寫開放時間、不說打烊那一句（不卡住）',!rows.length,J(rows));
  { fresh(MON,9,'noodle'); GM.enterN=450; E.interactables=exitIT('noodle'); E.player.busy=true; const r=await tickWait(); E.player.busy=false; const r2=await tickWait();
    check('4. 場景忙（正在演）不請出去；演完才走出去',r===false&&r2===true&&J(H.entered)===J(['gongguan']),J({r,r2,entered:H.entered})); }
  { const G=fresh(MON,9.5,'noodle'); GM.enterN=460; E.interactables=exitIT('noodle'); G.invites=[{who:'zhe',place:'noodle',day:G.day,h:9.5,state:'going'}]; const r=await tickWait(); G.invites[0].state='done'; const r2=await tickWait();
    check('4. 公休日在店裡有約：不請出去；約完了才走出去',r===false&&r2===true,J({r,r2,entered:H.entered})); }
  { fresh(TUE,12,'noodle'); GM.enterN=470; E.interactables=exitIT('noodle'); const r=await tickWait(); check('4. 開著的時候：不動',r===false&&!H.entered.length&&!H.said.length); } });
await sec(5,()=>{ const G=fresh(TUE,12,'gongguan'); const at=(key,h,z)=>S.staffed(z,Object.assign({},G,{day:H.D(key),hour:h,invites:[]}));
  check('5. 店員：開著站人、關著不站（公館燒臘週一、頁間書屋早上、草原超市半夜）',at(TUE,12,'noodle')&&!at(MON,9,'noodle')&&at(MON,12,'bookstore')&&!at(MON,9,'bookstore')&&at(MON,9,'us_market')&&!at(MON,23,'us_market'));
  const lm=fs.readFileSync(path.join(H.ROOT,'src/limao3d.js'),'utf8'), tz=fs.readFileSync(path.join(H.ROOT,'src/tingzhou3d.js'),'utf8');
  check('5. 禮貌生財的算命桌、街上的模型照 places.js 的同一份時間（LM.openAt、TZ S.limaoOpen）',/S\.openAt=function[^]{0,260}PLACES\.isOpen\('tz_limao'/.test(lm)&&/S\.limaoOpen=function[^]{0,220}PLACES\.isOpen\(q\.zone/.test(tz));
  const cr=fs.readFileSync(path.join(H.ROOT,'src/crowd3d.js'),'utf8'); check('5. 公休日沒有客人（crowd3d.js S.shopWindows）',/z==='noodle'\|\|z==='bookstore'\)&&[^\n]*windowsOf\(z,G\.day\)\) return \[\]/.test(cr)); });
H.done();
})();
