// 校外約會：四年裡什麼時候約得到（DATE-S8；AA_128 11-1、11-2）＋淡水示範的系統面（DATE-C2；AA_128 第 8 節）＋淡水七位反應的顯示（DATE-C3；BB_128 第 2 節）。不需要瀏覽器。
// 檢查：
//   1 祐廷：最後能預約的是畢業典禮前一天（2029-06-01）、畢業以後不開放；日本／美國路線在國外不能預約；寒暑假從臺北的家出發（開車不加回家取車的 30 分）
//   2 她：約的那一天在國外、聯絡不到、在老家＝不能約（原本只看今天）；那一天有交往的對象；學姊出發前、口試前一週；子晴下午三點以後、大四只有週六
//   3 淡水：多一個「夕陽前兩小時」的出發時間；出發時間到她傳一則（BB_128 3-6 的出發）；合照不到第 6 階她說「合照還不行」那一句（可昕只有分開以後）；
//     說要請客的選項另外扣她那一份（AA_128 5-2 的 extra）；下雨長椅停用（「椅子是濕的」）
//   4 地點檔裡寫成旁白的開發說明（「第 6 階以上」「第 3 節她的心願的伏筆」）不再演出來（tools/date/import_date_lines.py 的 NOTE_NARR）
// 修改前（開發分支 dd96391c2）：第 1～4 節全部 FAIL。用法：node tests/date_s8_c2_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), path=require('path');
const {check,GM}=H;
const J=JSON.stringify, AN='heroine_01', ZR='heroine_02', YT='heroine_03', ZQ='heroine_04', SIS='heroine_05', PS='classmate_peishan', KX='kexin';
GM.money=d=>{ H.G.money+=d; };
const toasts=[]; GM.toast=t=>{ toasts.push(t); };
{ const ch=GM.choose; let n=0; GM.choose=async o=>{ if(++n>3000) throw new Error('選單無限迴圈：'+J(o.map(x=>x.t))); return ch(o); }; GM._reset=()=>{ n=0; }; }
const lv=(id,n)=>{ const r=SOCIAL.rel(id); Object.assign(r,{fam:n>=4?65:(n>=3?45:25),trust:n>=4?50:(n>=3?30:0),comf:n>=4?45:0,npcRom:n>=6?60:(n>=5?35:0),rom:n>=6?35:0}); SOCIAL.remember(id,'FIRST_MET',''); };
const setup=(key,h,o)=>{ o=o||{}; const G=H.fresh(key,h,o.zone||'dorm',o.flags||{}); G.outings=[]; G.contacts=G.contacts||{}; G.money=9000;
  for(const [id,n] of Object.entries(o.lv||{})){ lv(id,n==='dt'?6:n); if(n==='dt') ROM.start(G,id); G.contacts[id]=G.day-60; } if(STORY._bindGM) STORY._bindGM(GM); return G; };
const ck=(id,key,dep,locs,o)=>{ o=o||{}; const G=H.G; const loc=(locs||['D13'])[0]; return DATE.check(G,Object.assign({who:id,locs:locs||['D13'],day:H.D(key),depart:dep,transport:o.tr||((DATE.loc(loc).transport||[])[0]||{}).mode},o.kind?{kind:o.kind}:{})); };
const said=()=>H.said.map(s=>s.t);
const goDate=async(id,loc,depart,picks)=>{ const G=H.G; GM._reset(); const b=DATE.book(G,{who:id,locs:[loc],transport:((DATE.loc(loc).transport||[])[0]||{}).mode,day:G.day,depart}); if(!b.ok) return {b,L:[],O:[]};
  const q=OUT.get(G,'date_'+b.trip); G.hour=depart; H.said=[]; H.opts=[]; H.picks=['出發'].concat(picks||[]); await OUT.prompt(GM,q); return {b,t:DATE.trip(G,b.trip),L:said(),O:H.opts.slice()}; };
const LN=DATE_LINES;

(async()=>{
  /* ======================= 1 祐廷在哪裡（AA_128 11-1）======================= */
  setup('2029-05-28',9,{lv:{[YT]:5}});
  { const a=ck(YT,'2029-06-01',15), b=ck(YT,'2029-06-02',15);
    check('1. 最後能預約的是畢業典禮前一天：2029-06-01 可以、06-02（畢業典禮）以後不行（「畢業典禮以後不能預約」）',a.ok&&!b.ok&&b.why==='畢業典禮以後不能預約',J([a.why,b.why])); }
  setup('2029-06-05',9,{lv:{[YT]:5}});
  check('1. 畢業以後：校外約會整個不開放（「畢業典禮以後不能預約」）',DATE.canAsk(H.G,YT).ok===false&&DATE.canAsk(H.G,YT).why==='畢業典禮以後不能預約');
  setup('2029-05-28',9,{lv:{[YT]:6}}); { const ov=ck(YT,'2029-06-01',9,['D26'],{kind:'overnight',tr:'car'}); check('1. 兩天一夜的第二天跨過畢業典禮也不行',!ov.ok&&ov.why==='畢業典禮以後不能預約',ov.why); }
  setup('2028-04-10',9,{lv:{[YT]:5},flags:{EXCHANGE_ROUTE:'JP'}});
  check('1. 日本路線在日本（2028-03-25～08-05）：不能預約、清單打不開（「你在國外」）',!ck(YT,'2028-04-15',15).ok&&ck(YT,'2028-04-15',15).why==='你那時候在國外'&&DATE.canAsk(H.G,YT).why==='你在國外');
  setup('2028-03-18',9,{lv:{[YT]:5},flags:{EXCHANGE_ROUTE:'JP'}});
  check('1. 日本路線出發以前（3/22）照常；約到出發以後那天不行',ck(YT,'2028-03-22',15).ok&&ck(YT,'2028-03-25',15).why==='你那時候在國外');
  setup('2028-09-10',9,{lv:{[YT]:5},flags:{EXCHANGE_ROUTE:'US'}});
  check('1. 美國路線在美國（2028-08-02～12-23）：不能預約',ck(YT,'2028-09-16',15).why==='你那時候在國外'&&!DATE.canAsk(H.G,YT).ok);
  setup('2028-09-10',9,{lv:{[YT]:5},flags:{EXCHANGE_ROUTE:'TW'}});
  check('1. 台灣路線照常',ck(YT,'2028-09-16',15).ok&&DATE.canAsk(H.G,YT).ok);
  setup('2026-07-10',9,{lv:{[YT]:5}}); const brk=ck(YT,'2026-07-15',9,['D25'],{tr:'car'}); setup('2026-10-05',9,{lv:{[YT]:5}}); const term=ck(YT,'2026-10-07',9,['D25'],{tr:'car'});
  check('1. 寒暑假從臺北的家出發：開車去外澳單程 80 分、不加回家取車的 30 分；學期中從宿舍出發多 30 分',brk.ok&&Math.abs(brk.plan.travelH-80/60)<1e-6&&Math.abs(term.plan.travelH-(80/60+0.5))<1e-6,J([brk.plan&&brk.plan.travelH,term.plan&&term.plan.travelH,term.why]));
  setup('2026-07-10',9,{lv:{[YT]:5}}); { const b=DATE.book(H.G,{who:YT,locs:['D25'],transport:'car',day:H.D('2026-07-15'),depart:9}); const q=b.ok&&OUT.get(H.G,'date_'+b.trip);
    check('1. 寒暑假訂下的那一趟也照家裡出發（行程的抵達時間沒有多 30 分）',b.ok&&!!q&&Math.abs(q.h-(9+80/60))<1e-6,J(q&&{h:q.h,travel:q.travel})); }

  /* ======================= 2 她那一天在哪裡（AA_128 11-2）======================= */
  setup('2027-08-30',9,{lv:{[ZR]:5}}); { const r=ck(ZR,'2027-09-05',15); check('2. 今天約、那一天她已經在英國（大三上交換）：不行「她那時候在英國。」',!r.ok&&r.why==='她那時候在英國。',r.why); }
  setup('2028-03-20',9,{lv:{[AN]:5}}); { const r=ck(AN,'2028-03-26',15); check('2. 以安 3/25 去日本：約 3/26 不行「她那時候在日本。」；3/24 可以',!r.ok&&r.why==='她那時候在日本。'&&ck(AN,'2028-03-24',15).ok,r.why); }
  setup('2028-08-28',9,{lv:{[SIS]:5},flags:{SIS_EXAM_DONE:true}}); { const r=ck(SIS,'2028-09-02',15); check('2. 學姊在美國（2028-08-02～12-23）：「她那時候在美國。」',!r.ok&&r.why==='她那時候在美國。',r.why); }
  setup('2026-12-14',9,{lv:{[PS]:5}}); { const r=ck(PS,'2026-12-19',15); check('2. 沛珊聯絡不到的日子：「她那時候聯絡不到。」',!r.ok&&r.why==='她那時候聯絡不到。',r.why); }
  setup('2027-01-12',9,{lv:{[KX]:'dt'}}); { const r=ck(KX,'2027-01-16',15); check('2. 可昕寒假回高雄：臺北的地點不行「她那時候在高雄。」',!r.ok&&r.why==='她那時候在高雄。',r.why); }
  setup('2026-04-02',9,{lv:{[PS]:5}}); { const a=ck(PS,'2026-04-04',13), b=ck(PS,'2026-04-07',13); check('2. 沛珊 4/6 起和柏翰交往：約 4/4 可以、約 4/7 不行「她那時候有交往的對象」（原本只看今天）',a.ok&&!b.ok&&b.why==='她那時候有交往的對象',J([a.why,b.why])); }
  setup('2029-05-18',9,{lv:{[SIS]:5},flags:{SIS_EXAM_DONE:true}}); { const a=ck(SIS,'2029-05-23',15), b=ck(SIS,'2029-05-20',15); check('2. 學姊口試（5/29）前一週不約；再前一天可以',!a.ok&&a.why==='她那時候有事'&&b.ok,J([a.why,b.why])); }
  setup('2028-07-22',9,{lv:{[SIS]:5},flags:{SIS_EXAM_DONE:true}}); { const a=ck(SIS,'2028-07-27',15), b=ck(SIS,'2028-07-24',15); check('2. 學姊 8/2 出發前一週不約',!a.ok&&a.why==='她那時候有事'&&b.ok,J([a.why,b.why])); }
  setup('2026-10-05',9,{lv:{[ZQ]:5}}); { const a=ck(ZQ,'2026-10-10',10,['D03']), b=ck(ZQ,'2026-10-10',14,['D03']), c=ck(ZQ,'2026-10-10',15,['D03']); check('2. 子晴下午兩點才醒：見面在 15:00 以前不行（10:00、14:00 出發），15:00 出發可以',!a.ok&&!b.ok&&c.ok,J([a.why,b.why,c.why])); }
  setup('2028-10-02',9,{lv:{[ZQ]:5}}); { const a=ck(ZQ,'2028-10-08',15,['D03']), b=ck(ZQ,'2028-10-07',15,['D03']); check('2. 子晴大四在工作室上班：只有週六 15:00 以後（週日不行、週六可以）',!a.ok&&b.ok,J([a.why,b.why])); }

  /* ======================= 3 淡水示範（AA_128 第 8 節、BB_128 第 2 節）======================= */
  setup('2026-10-05',9,{lv:{[ZR]:5}}); { const day=H.D('2026-10-10'), sd=DATE.sunsetDepart('D13',day); H.said=[]; H.opts=[]; H.picks=[5,'算了']; GM._reset(); const w=await DATE.pickWhen(GM,{who:ZR,locs:['D13'],transport:'mrt'});
    check('3. 淡水的出發時間多一個「夕陽前約兩小時」（那天日落 '+DATE.sunset(day)+'，取到半點＝'+INV.hhmm(sd)+'）；別的地點沒有',sd===15.5&&(H.opts[1]||[]).includes('15:30 出發')&&DATE.sunsetDepart('D07',day)===null&&DATE.sunsetDepart('D13',H.D('2026-06-20'))===16.5,J(H.opts)); }
  setup('2026-10-10',9,{lv:{[ZR]:5}}); let r=await goDate(ZR,'D13',15,['飲料',0,'拍照',0,'差不多',0]);
  const dep=LN.lines[ZR].depart, msgs=H.msgs('p:'+ZR);
  check('3. 出發時間到：她傳一則（BB_128 3-6 的「出發」，輪流）、寫進手機',dep.some(d=>[].concat(d).every(t=>msgs.includes(t)))&&r.L.indexOf([].concat(dep[0])[0])<r.L.findIndex(t=>/現在要出發嗎/.test(t)),J(msgs));
  check('3. 合照不到第 6 階：拍照位置之後她說「合照還不行」那一句（芷若「拍照？……我拍你就好。我不上鏡。」）',r.L.includes(LN.lines[ZR].noPair[0]),J(r.L));
  setup('2026-10-10',9,{lv:{[ZR]:6}}); r=await goDate(ZR,'D13',15,['拍照',0,'差不多',0]);
  check('3. 第 6 階以上：沒有那一句',!r.L.includes(LN.lines[ZR].noPair[0]));
  setup('2026-10-10',9,{lv:{[KX]:'dt'}}); r=await goDate(KX,'D13',15,['拍照',0,'差不多',0]);
  check('3. 可昕交往中：一定可以合照，沒有「先不要。……等我們又是那樣了。」',!r.L.includes(LN.lines[KX].noPair[0]));
  setup('2026-10-10',9,{lv:{[ZQ]:5}}); const m0=H.G.money; r=await goDate(ZQ,'D13',15,['飲料','「我請。」','差不多',0]);
  check('3. 說要請客（子晴飲料攤「我請。」）：另外扣她那一份 60（飲料 60＋她的 60＋車資 100）',r.O.some(o=>o.includes('「我請。」'))&&m0-H.G.money===60+60+100,String(m0-H.G.money)+' '+J(r.O.slice(0,4)));
  { setup('2026-10-10',9,{lv:{[KX]:'dt'}}); const got=[]; for(let i=0;i<6;i++) got.push(J(DATE.lineFor(H.G,KX,'depart',{day:H.G.day})));
    check('3. 可昕的出發訊息不播「我到了。這是告知。」（AA_426：可昕不用「這是告知」；BB_128 3-6 那一句列給 AA），另外兩句輪流',!got.some(x=>x.includes('這是告知'))&&new Set(got).size===2,J(got)); }
  check('3. 請客的選項：我請、我買給妳、我付；「下次我請」「那我請飲料」不算',DATE.isTreat('「這杯我請。」')&&DATE.isTreat('「我買給妳。」')&&DATE.isTreat('「我付。」')&&!DATE.isTreat('「下次換我請。」')&&!DATE.isTreat('「那我請飲料。」')&&!DATE.isTreat('「那我買另一隻。」'));
  setup('2026-10-10',9,{lv:{[ZQ]:5}}); H.G.weather='rain'; toasts.length=0; r=await goDate(ZQ,'D13',15,['長椅','就這樣回去']);
  check('3. 下雨：長椅灰掉「椅子是濕的」，按了只提示、不做',H.opts.some(o=>o.includes('長椅'))&&toasts.includes('椅子是濕的')&&!(r.t.spots||[]).includes('D13.bench'),J({t:toasts,s:r.t&&r.t.spots}));
  check('3. 雨天停用只有淡水長椅（BB_128 2-2）；快速約會也不選它',DATE.rainOff({weather:'rain'},'D13.bench')==='椅子是濕的'&&DATE.rainOff({weather:'clear'},'D13.bench')===''&&DATE.rainOff({weather:'rain'},'D13.rail')==='');

  /* ======================= 4 寫成旁白的開發說明不演 ======================= */
  const NL=LN.loc.D13.lines;
  check('4. date_lines.js：D13 以安、學姊合照前的「第 6 階以上」、可昕欄杆選項②的「第 3 節她的心願的伏筆」是註記（who:note）',NL[AN].hotspots['D13.photo']['extra:合照'][0].lines[0].who==='note'&&NL[SIS].hotspots['D13.photo']['extra:合照'][0].lines[0].who==='note'&&NL[KX].hotspots['D13.rail'].first.choice[1].reply[1].who==='note');
  setup('2026-10-10',9,{lv:{[AN]:6}}); r=await goDate(AN,'D13',15,['拍照',0,'差不多',0]);
  check('4. 以安第 6 階拍照：有「好。拍背影就好，正面我會緊張。」、沒有「（第 6 階以上）」',r.L.includes('好。拍背影就好，正面我會緊張。')&&!r.L.some(t=>/第 6 階以上/.test(t)),J(r.L));
  setup('2026-10-10',9,{lv:{[KX]:'dt'}}); r=await goDate(KX,'D13',15,['欄杆',1,'差不多',0]);
  check('4. 可昕欄杆第一次選②：沒有「（第 3 節她的心願的伏筆）」',!r.L.some(t=>/伏筆/.test(t))&&r.L.length>3,J(r.L));
  { const src=fs.readFileSync(path.join(H.ROOT,'tools/date/import_date_lines.py'),'utf8'); check('4. 產生器照白名單重算（NOTE_NARR：整句相同才改）',/NOTE_NARR = \{'第 6 階以上', '第 3 節她的心願的伏筆'\}/.test(src)); }

  H.done();
})();
