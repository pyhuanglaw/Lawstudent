// 溫州街的補完（AA_420 第 12 節、AA_167 茶席、BB_148 8b／第 7 節、AA_164 WZ-P1）——不需要瀏覽器。src/wzlines3d.js、src/data/wz_events.js、src/invites3d.js 的掛勾
//   1  12-1：1-5 搬走的旁白不露出店位編號（「影印店原本那一間的鐵捲門拉下來了……」）；玩家看得到的台詞裡沒有「A1」
//   2  12-2 WZ-P2 二手市集：每月第一個週六 09:00～13:00（下雨照開、互動點搬到老樹下；颱風天沒有）；「逛二手市集」20 分鐘；
//      買：照月份輪流（9 月小說、10 月辭典、11 月地圖集；輪到的買過了＝下一本）、一次市集一本、每本一次、錢不夠不能買；三本都買過＝那一句旁白；
//      WZ_YE=1 以後第一次逛＝地圖集（不照順序；那次沒買就回到輪流）→ WZ_YE_MAP_BOUGHT → 2-2 下一個週六下午（2-1 以前買的＝2-1 那天不演、下一個週六演；呂老師搬走以後沒有）；
//      書架「看」三句；賣（大二起）：大一的教科書、100～200 元、學弟妹三句輪流、賣掉的不再算有（CLS.hasBook）、大二的書不能賣、舊《民法》「這本不賣。」
//   3  約人：茶席（WZ-T3 以前不列、每月第三個週日下午、見面＝旁白＋蘇姨＋以安／語彤的一句、記憶「一起去過茶席」）；SIS_TEAHOUSE＝學姊的一盞、茶席「有點熟」就能約（別人照舊）
//   4  WZ-P1：第一次在 08:00～11:00 進公園，下象棋的阿伯那一句（一次；11:00 以後、下雨不演）
//   5  芷若在公園：每學年第一次一句（大一、大二、大三下；大三上、大四在英國沒有；不在公園沒有）
// 修改前（開發分支 b68e97874）：沒有 WZL.market、INV.MIN_STAGE——FAIL。用法：node tests/aa420_wz2_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
global.SISY23={preTalk:async()=>false};
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(WZS|EAT|EAT_LINES|JOBS|WZ_JOBS_DATA|WZ_SHOPS_LAYOUT|WZ_PARK_LAYOUT|PARK|WZ_EVENTS|WZL|Y2B_EVENTS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
let ok=true, err=''; try{ for(const f of ['src/data/wz_park_layout.js','src/wzpark3d.js','src/data/wz_shops_layout.js','src/data/eat_lines.js','src/eat3d.js','src/wzshops3d.js','src/data/y2b_events.js','src/data/wz_jobs.js','src/jobs3d.js','src/data/wz_events.js','src/wzlines3d.js']) load(f); }catch(e){ ok=false; err=String(e&&e.stack||e).split('\n').slice(0,3).join(' / '); }
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const toasts=[]; GM.toast=t=>{ toasts.push(t); };
GM.money=d=>{ H.G.money=(H.G.money|0)+d; };
const fresh=(k,h,zone,flags)=>{ const G=H.fresh(k,h,zone||'wenzhou',flags); toasts.length=0; return G; };
const DK=k=>STORY.dayOfKey(k), key=d=>CALENDAR.dateOf(d).key, TD=(t,w,wd)=>STORY.termDayIn(t,w,wd);
const at=(d,h,zone)=>{ H.G.day=d; H.G.hour=h; H.G.weekday=CALENDAR.dateOf(d).wd%7; if(zone) H.G.zone=zone; };
const said=t=>H.said.some(s=>s.t===t);
const saidBy=(who,t)=>H.said.some(s=>s.t===t&&s.who===who);
const L=()=>H.lines();
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const inPark=()=>{ const n=WZ_PARK_LAYOUT.interact.find(q=>q.kind==='notice'); H.E.player.obj.position.x=n.x; H.E.player.obj.position.z=n.z; H.G.zone='wenzhou'; };
const outPark=()=>{ H.E.player.obj.position.x=-20; H.E.player.obj.position.z=0; H.G.zone='wenzhou'; };
const tickUntil=async()=>{ const r=WZL.tick(GM); for(let i=0;i<20&&WZL.playing;i++) await new Promise(r=>setTimeout(r,0)); return r; };
/* 那個月第一個週六、第三個週日 */
const nth=(y,m,wd,n)=>{ let c=0; for(let d=1;d<=31;d++){ const k=y+'-'+String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0'); const day=DK(k); if(day==null) continue; if(CALENDAR.dateOf(day).wd===wd&&++c===n) return day; } return null; };
const sat1=(y,m)=>nth(y,m,6,1), sun3=(y,m)=>nth(y,m,7,3);
const mk=()=>(H.G.daily&&H.G.daily.market)||{};
const browse=async(picks)=>{ H.picks=picks.slice(); H.said=[]; H.opts=[]; return WZL.market(GM); };

(async()=>{
check('0. 載得到（WZL.market、INV.MIN_STAGE、茶席登記進 INVITE_DATA.places）',ok&&typeof WZL!=='undefined'&&typeof WZL.market==='function'&&Array.isArray(INV.MIN_STAGE)&&INVITE_DATA.places.some(p=>p.id==='teahouse_ceremony'),err);

await sec(1,async()=>{ const e=ev('ev_wz_c_lease4m');
  check('1. 12-1：1-5 搬走的開場旁白',e&&e.dialogue[0].speaker==null&&e.dialogue[0].text==='（影印店原本那一間的鐵捲門拉下來了，上面貼著「本店已遷至轉角」。轉角那間店面比原來小一半，玻璃門上的價目表一樣貼得滿滿的。）',J(e&&e.dialogue[0]));
  const vis=WZ_EVENTS.flatMap(x=>(x.dialogue||[]).flatMap(l=>[l.text].concat((l.choice||[]).map(c=>c.text)))).filter(Boolean).concat(Object.values(WZ_JOBS_DATA.shops||{}).map(s=>J(s)));
  check('1. 玩家看得到的事件台詞裡沒有店位編號「A1」',!WZ_EVENTS.some(x=>(x.dialogue||[]).some(l=>/\bA1\b/.test(l.text||''))),vis.filter(t=>/\bA1\b/.test(t)).slice(0,2).join(' / ')); });

await sec(2,async()=>{ const s9=sat1(2025,9), s10=sat1(2025,10), s11=sat1(2025,11), s12=sat1(2025,12);   /* 法律系大一＝2025-09 起 */
  fresh(key(s10),9); check('2. 第一個週六 09:00 開',WZL.marketOn(H.G));
  at(s10,8.9); check('2. 08:54 還沒',!WZL.marketOn(H.G)); at(s10,12.95); check('2. 12:57 還在',WZL.marketOn(H.G)); at(s10,13); check('2. 13:00 收了',!WZL.marketOn(H.G));
  at(s10+7,10); check('2. 第二個週六沒有',!WZL.marketOn(H.G)); at(s10+1,10); check('2. 週日沒有',!WZL.marketOn(H.G));
  at(s10,10); H.G.weather='rain'; check('2. 下雨照開',WZL.marketOn(H.G)); H.G.weather='typhoon'; check('2. 颱風天沒有',!WZL.marketOn(H.G)); H.G.weather='clear';
  /* 互動點 */
  H.E.interactables=[]; WZL.addMarket(GM); const it=H.E.interactables.find(q=>q.wzMarket);
  check('2. 公園多一個「逛二手市集」（市集時間才看得到）',!!it&&it.label==='逛二手市集'&&it.hidden===false); at(s10,14); check('2. 14:00 藏起來',it&&it.hidden===true);
  at(s10,10); H.G.weather='rain'; H.E.interactables=[]; WZL.addMarket(GM); const it2=H.E.interactables.find(q=>q.wzMarket); H.G.weather='clear';
  check('2. 下雨：攤子搬到老樹下（互動點換位置，還在公園裡）',!!it2&&(it2.x!==it.x||it2.z!==it.z)&&PARK.inPark(it2.x,it2.z)&&PARK.inPark(it.x,it.z),J([it.x,it.z,it2.x,it2.z]));
  /* 9 月：小說 */
  fresh(key(s9),9.5); const m0=H.G.money; H.said=[]; H.opts=[]; H.picks=['沒有封面的小說','不逛了']; await STORY.interact({wzMarket:true},GM);
  check('2. 9 月的那一本是沒有封面的小說（50 元）；STORY.interact 走到市集；大一沒有「賣」',!!H.opts[0]&&J(H.opts[0])===J(['買沒有封面的小說（50 元）','不逛了']),J(H.opts));
  check('2. 買小說：攤主「封面不見了，五十。」、-50、20 分鐘',saidBy('攤主','封面不見了，五十。')&&H.G.money===m0-50&&Math.abs(H.G.hour-(9.5+1/3))<1e-6&&mk().bought.novel===s9,J(L())+' '+H.G.hour);
  await browse(['不逛了']); check('2. 同一次市集再逛：沒有第二本',!H.opts[0].some(o=>/^買/.test(o)),J(H.opts));
  /* 10 月：辭典；11 月：地圖集（WZ_YE 還沒有也買得到，不記 2-2 的時間點以外的東西）*/
  at(s10,10); await browse(['不逛了']); check('2. 10 月的那一本是很舊的國語辭典（80 元）；大一上沒有「賣大一的教科書」',H.opts[0][0]==='買很舊的國語辭典（80 元）'&&!H.opts[0].includes('賣大一的教科書'),J(H.opts));
  at(s11,10); await browse(['不逛了']); check('2. 11 月（辭典沒買）：地圖集（150 元）',H.opts[0][0]==='買舊的地圖集（150 元）',J(H.opts));
  at(s12,10); await browse(['不逛了']); check('2. 12 月（輪到小說，已經買了）＝照表往下一本：辭典',H.opts[0][0]==='買很舊的國語辭典（80 元）',J(H.opts));
  /* 錢不夠 */
  H.G.money=60; toasts.length=0; await browse(['很舊的國語辭典','不逛了']); check('2. 錢不夠：不能買（「錢不夠。」）',mk().bought.dict==null&&H.G.money===60&&toasts.includes('錢不夠。'),J(toasts));
  H.G.money=5000; await browse(['很舊的國語辭典','不逛了']); check('2. 買辭典：攤主「字比現在的多。八十。」',saidBy('攤主','字比現在的多。八十。')&&mk().bought.dict===s12);
  /* 1 月（地圖集，WZ_YE 還沒有）：買了記 WZ_YE_MAP_BOUGHT，旁白 */
  const s1=sat1(2026,1); at(s1,10); await browse(['舊的地圖集','不逛了']);
  check('2. 買地圖集：攤主「這本很舊了，一百五。」＋旁白（封面掉了一半……）、WZ_YE_MAP_BOUGHT',saidBy('攤主','這本很舊了，一百五。')&&said('（封面掉了一半。裡面的溫州街，比現在長一截。）')&&H.G.flags.WZ_YE_MAP_BOUGHT===s1,J(L()));
  const k1=H.said.findIndex(s=>s.t==='這本很舊了，一百五。'), k2=H.said.findIndex(s=>s.t==='（封面掉了一半。裡面的溫州街，比現在長一截。）'); check('2. 先攤主、再旁白',k1>=0&&k2>k1);
  const s2=sat1(2026,2); at(s2,10); await browse(['不逛了']); check('2. 三本都買過：（攤子上都是童書和舊雜誌。）、沒有可以買的',said('（攤子上都是童書和舊雜誌。）')&&!H.opts[0].some(o=>/^買/.test(o)),J(L()));
  const R=STORY.roomItemList(H.G).map(r=>r[0]+'｜'+r[1]);
  check('2. 宿舍書架三本，「看」照表',['沒有封面的小說｜沒有封面的小說。你看了三章，還是不知道書名。','很舊的國語辭典｜舊的國語辭典。前一個主人在『溫』那一頁畫了線。','舊的地圖集｜舊的地圖集。溫州街那一頁，你折了一個角。'].every(x=>R.includes(x)),J(R.filter(x=>/小說|辭典|地圖/.test(x))));
  /* 2-1 以前買的：2-1 那天不演 2-2，下一個週六下午演 */
  const sat=TD('Y2S1',4,6); fresh(key(sat),14,'wz_teahouse',{WZ_YE:1,WZ_YE_MAP_BOUGHT:DK('2026-01-03')}); H.G.events.done.ev_wz_t2a=1; H.G.events.last.ev_wz_t2a=sat;
  check('2. 2-1 以前就買了：2-1 演完的那一天不接 2-2',WZL.line2Due(H.G,'visit')!=='ev_wz_t_map',WZL.line2Due(H.G,'visit'));
  at(sat+7,14); check('2. 2-1 演完以後的第一個週六下午：2-2',WZL.line2Due(H.G,'visit')==='ev_wz_t_map');
  H.G.flags.WZ_LU_GONE='missed'; check('2. 呂老師搬走以後：沒有 2-2',WZL.line2Due(H.G,'visit')!=='ev_wz_t_map');
  /* WZ_YE=1 以後第一次逛：地圖集（不照順序）；那次沒買＝回到輪流；買了＝那天下午就接 2-2 */
  const sA=sat1(2027,9); fresh(key(sA),10,'wenzhou',{WZ_YE:1}); H.G.events.done.ev_wz_t2a=1; H.G.events.last.ev_wz_t2a=sA-35;
  await browse(['不逛了']); check('2. WZ_YE=1 以後第一次逛：地圖集一定有（9 月照順序本來是小說）',H.opts[0][0]==='買舊的地圖集（150 元）',J(H.opts));
  const sB=sat1(2027,10); at(sB,10); await browse(['不逛了']); check('2. 那次沒買：下一次回到輪流（10 月＝辭典）',H.opts[0][0]==='買很舊的國語辭典（80 元）',J(H.opts));
  fresh(key(sA),10,'wenzhou',{WZ_YE:1}); H.G.events.done.ev_wz_t2a=1; H.G.events.last.ev_wz_t2a=sA-35; await browse(['舊的地圖集','不逛了']);
  at(sA,14,'wz_teahouse'); check('2. 2-1 以後買的：下一個週六下午（同一天下午）去茶屋就接 2-2',H.G.flags.WZ_YE_MAP_BOUGHT===sA&&WZL.line2Due(H.G,'visit')==='ev_wz_t_map');
  /* 賣 */
  const y1=['Y1S1','Y1S2'].flatMap(t=>CLS.termCourses(H.G,t)).filter(c=>(c.kind==='required'||c.kind==='elective')&&!CLS.BOOK_SKIP.has(c.id)).map(c=>CLS.bookTitle(c));
  const y2=CLS.termCourses(H.G,'Y2S1').filter(c=>c.kind==='required'&&!CLS.BOOK_SKIP.has(c.id)).map(c=>CLS.bookTitle(c)).find(t=>!y1.includes(t));
  const b3=[...new Set(y1)].slice(0,3); const books={}; for(const t of b3) books[t]=true; books[y2]=true;
  const sC=sat1(2027,10); fresh(key(sC),10,'wenzhou',{books});
  await browse(['賣大一的教科書','不賣了','不逛了']); const sellOpts=H.opts[1]||[];
  check('2. 大二起：「賣大一的教科書」；列出大一的書（含價錢）＋舊《民法》；大二的書不列',H.opts[0].includes('賣大一的教科書')&&b3.every(t=>sellOpts.some(o=>o.indexOf('《'+t+'》')===0))&&sellOpts.includes('舊《民法》')&&!sellOpts.some(o=>o.includes('《'+y2+'》')),J(H.opts)+' y2='+y2);
  const prices=sellOpts.filter(o=>/元）$/.test(o)).map(o=>+/（(\d+) 元）$/.exec(o)[1]); check('2. 一本 100～200 元',prices.length===3&&prices.every(p=>p>=100&&p<=200),J(prices));
  const civ=CLS.termCourses(H.G,'Y1S1').find(c=>CLS.bookTitle(c)===b3[0]);
  const m1=H.G.money; await browse(['賣大一的教科書','《'+b3[0]+'》','不逛了']);
  check('2. 賣第一本：學妹「學長，上面的筆記可以留著嗎？」、錢進來、記在 G.daily.market、不再算有',saidBy('學妹','學長，上面的筆記可以留著嗎？')&&H.G.money===m1+WZL.sellPrice(b3[0])&&mk().sold[b3[0]]===sC&&H.G.flags.books[b3[0]]===false&&(!civ||!CLS.hasBook(H.G,civ)),J(L()));
  await browse(['賣大一的教科書','《'+b3[1]+'》','不逛了']); check('2. 第二本：「這本有畫重點耶。……畫得好多。」',said('這本有畫重點耶。……畫得好多。'));
  await browse(['賣大一的教科書','《'+b3[2]+'》','不逛了']); check('2. 第三本：「謝謝學長。我會好好用。」（沒有「……應該會。」）',said('謝謝學長。我會好好用。')&&!H.said.some(s=>/應該會/.test(s.t)));
  await browse(['賣大一的教科書','不賣了']); check('2. 賣掉的不再列出來',!(H.opts[1]||[]).some(o=>b3.some(t=>o.includes('《'+t+'》'))),J(H.opts));
  const m2=H.G.money; await browse(['賣大一的教科書','舊《民法》','不逛了']); check('2. 舊《民法》：「這本不賣。」（祐廷），沒有賣',saidBy('祐廷','這本不賣。')&&H.G.money===m2&&(mk().soldN|0)===3,J(L()));
  fresh(key(sC),10,'wenzhou',{textbook:true}); await browse(['賣大一的教科書','《民法總則》','不逛了']);
  check('2. 舊存檔（只有 F.textbook）：民法總則也能賣；賣了 F.textbook 拿掉',(H.opts[1]||[]).includes('《民法總則》（'+WZL.sellPrice('民法總則')+' 元）')&&H.G.flags.textbook===false&&mk().sold['民法總則']===sC,J(H.opts));
  check('2. 舊存檔沒有 G.daily.market：什麼都沒買、沒賣',(()=>{ const G=fresh(key(sC),10); return !G.daily||!G.daily.market; })()); });

await sec(3,async()=>{ const P=INVITE_DATA.places.find(p=>p.id==='teahouse_ceremony'), Tsun=sun3(2027,3);
  fresh(key(Tsun-1),15,'dorm'); H.FRIEND('heroine_01'); H.FRIEND('heroine_03');
  check('3. 茶席：WZ-T3 以前約不了（decide＝place）',INV.decide(H.G,'heroine_01','teahouse_ceremony',Tsun,14).why==='place');
  H.said=[]; H.opts=[]; H.picks=['算了','算了','算了']; await INV.flow(GM,'heroine_01',null,false);
  check('3. WZ-T3 以前：約人的地點沒有「去一盞的茶席」（分層以後看展開的 all：一盞在「坐坐・喝茶…」裡）',!!H.opts[0]&&!H.opts[0].all.includes('去一盞的茶席')&&H.opts[0].all.includes('去一盞喝茶'),J(H.opts[0].all));
  H.G.flags.WZ_TEA_SEAT=true; H.said=[]; H.opts=[]; H.picks=['去一盞的茶席','算了']; await INV.flow(GM,'heroine_01',null,false);
  check('3. WZ-T3 以後：有「去一盞的茶席」（AA_535：放在「喝咖啡、喝茶…」和「這個時候才有」；這個時候才有只有它＝直接列在第一層）；時間＝下一次茶席（第三個週日）14:00、15:30（地點自己給日子：沒有「其他日子…」）',H.opts[0].includes('去一盞的茶席')&&J(H.opts[1])===J(['明天 14:00','明天 15:30','算了']),J(H.opts));
  const T=INV.timeOptions(H.G,false,P); at(Tsun+1,10); const T2=INV.timeOptions(H.G,false,P); const d2=CALENDAR.dateOf(T2[0].day);
  check('3. 不是茶席的日子：選項是下一個第三個週日',T.length===2&&T[0].day===Tsun&&T2.length===2&&d2.wd===7&&d2.d>=15&&d2.d<=21&&T2[0].t===d2.m+'/'+d2.d+' 14:00',J(T2));
  at(Tsun-1,15); const r=INV.decide(H.G,'heroine_01','teahouse_ceremony',Tsun,14); check('3. 第三個週日 14:00：以安答應（朋友）',r.res==='accept',J(r));
  const r2=INV.decide(H.G,'heroine_01','teahouse_ceremony',Tsun-7,14); check('3. 第二個週日：茶席沒開（不是答應）',r2.res!=='accept',J(r2));
  H.FAMILIAR('heroine_01'); check('3. 有點熟：茶席約不了（最低「朋友」）',INV.decide(H.G,'heroine_01','teahouse_ceremony',Tsun,14).why==='rel'); H.FRIEND('heroine_01');
  /* 見面 */
  at(Tsun,14,'wz_teahouse'); const iv=INV.accept(H.G,'heroine_01','teahouse_ceremony',Tsun,14,{by:'player'}); iv.state='going'; H.said=[]; await INV.meet(GM,iv,null);
  const i0=H.said.findIndex(s=>s.t==='蘇姨在緣側鋪了一塊布，一枝花插在竹筒裡。四個杯子，兩個空位。');
  check('3. 見面：旁白、蘇姨「茶席不說話也可以。說話也可以。」、以安（她把手帳收進包包……）「今天不看了。」',i0>=0&&H.said[i0].who==null&&H.said[i0+1].who==='蘇姨'&&H.said[i0+1].t==='茶席不說話也可以。說話也可以。'&&H.said[i0+2].who==null&&H.said[i0+2].t==='（她把手帳收進包包，拉鍊拉上。）'&&H.said[i0+3].t==='今天不看了。'&&H.said[i0+3].who!=null,J(L()));
  check('3. 記憶「一起去過茶席」（人物頁的名稱）',SOCIAL.has('heroine_01','TEA_CEREMONY')&&SOCIAL.MEMORY_LABEL.TEA_CEREMONY==='一起去過茶席');
  const iv2=INV.accept(H.G,'heroine_03','teahouse_ceremony',Tsun,15.5,{by:'player'}); iv2.state='going'; at(Tsun,15.5); H.said=[]; await INV.meet(GM,iv2,null);
  check('3. 語彤：「……這樣坐著，聽得到院子。」',H.said.some(s=>s.t==='……這樣坐著，聽得到院子。'&&s.who!=null),J(L()));
  /* 學姊 SIS_TEAHOUSE */
  fresh(key(Tsun-1),15,'dorm',{WZ_TEA_SEAT:true}); H.FAMILIAR('heroine_05'); H.FAMILIAR('heroine_01'); const TH=INV.place('teahouse');
  check('3. SIS_TEAHOUSE 以前：學姊有點熟約不了一盞、茶席',INV.placeWhy(H.G,'heroine_05',TH)!==''&&INV.placeWhy(H.G,'heroine_05',P)!=='');
  H.G.flags.SIS_TEAHOUSE=true;
  check('3. SIS_TEAHOUSE：學姊有點熟就能約一盞、茶席',INV.placeWhy(H.G,'heroine_05',TH)===''&&INV.placeWhy(H.G,'heroine_05',P)==='',INV.placeWhy(H.G,'heroine_05',TH)+'｜'+INV.placeWhy(H.G,'heroine_05',P));
  check('3. 別人照舊（以安有點熟還是約不了一盞）、學姊別的地方照舊（溫州街散步）',INV.placeWhy(H.G,'heroine_01',TH)!==''&&INV.placeWhy(H.G,'heroine_05',INV.place('wenzhou'))!=='');
  const r3=INV.decide(H.G,'heroine_05','teahouse',Tsun-1,15); check('3. SIS_TEAHOUSE：學姊一盞的回答不是「關係還不到」',r3.why!=='rel',J(r3)); });

await sec(4,async()=>{ fresh('2026-10-10',9); inPark(); H.said=[]; await tickUntil();
  check('4. WZ-P1：第一次在 08:00～11:00 進公園，下象棋的阿伯那一句',saidBy('下象棋的阿伯','那隻貓有三個名字。阿伯叫牠所長，小孩叫麻糬，Café 那個女孩子叫牠常客。你想叫牠什麼都可以，牠都不會理你。'),J(L()));
  H.said=[]; at(H.G.day+1,9); await tickUntil(); check('4. 只有一次',H.said.length===0,J(L()));
  fresh('2026-10-10',11.5); inPark(); check('4. 11:00 以後不演',!WZL.p1Due(H.G)); at(H.G.day,9); H.G.weather='rain'; check('4. 下雨不演',!WZL.p1Due(H.G)); H.G.weather='clear';
  check('4. 不在公園：tick 不演',(()=>{ outPark(); return !WZL.tick(GM); })());
  fresh(key(TD('Y3S1',10,3)),9); check('4. 大三上第 10 週（貓不見了）不演',!WZL.p1Due(H.G)); });

await sec(5,async()=>{ const w={name:'林芷若',charId:'heroine_02'}; const talk=async()=>{ H.said=[]; await WZL.preTalk(GM,w,'heroine_02'); return H.said.map(s=>s.t); };
  fresh('2025-10-18',15); SOCIAL.remember('heroine_02','FIRST_MET',''); inPark();
  check('5. 大一：「我叫牠『常客』。每天都來，從來不點東西。」',J(await talk())===J(['我叫牠『常客』。每天都來，從來不點東西。']));
  at(H.G.day+7,15); check('5. 同一學年第二次：沒有',(await talk()).length===0);
  H.G.daily.park.catName='所長'; at(DK('2026-03-14'),15); check('5. 大一下也是同一學年：沒有',(await talk()).length===0);
  at(DK('2027-10-16'),15); check('5. 大三上（她在英國）：沒有',(await talk()).length===0);
  fresh('2025-10-18',15); SOCIAL.remember('heroine_02','FIRST_MET',''); outPark(); check('5. 不在公園（溫州街的巷子）：沒有',(await talk()).length===0);
  fresh(key(TD('Y2S1',5,6)),15); SOCIAL.remember('heroine_02','FIRST_MET',''); H.G.daily={park:{catName:'麻糬'}}; inPark();
  check('5. 大二：「常客今天也坐老位子。……牠比我還準時。」（玩家取名麻糬也一樣）',J(await talk())===J(['常客今天也坐老位子。……牠比我還準時。']));
  fresh('2028-03-18',15); SOCIAL.remember('heroine_02','FIRST_MET',''); inPark();
  check('5. 大三下（她從英國回來）：「牠有名牌了。上面沒寫『常客』。……沒關係，我知道是牠。」',J(await talk())===J(['牠有名牌了。上面沒寫『常客』。……沒關係，我知道是牠。']));
  fresh('2028-10-14',15); SOCIAL.remember('heroine_02','FIRST_MET',''); inPark(); check('5. 大四（2028-09 起在英國）：沒有',(await talk()).length===0); });

H.done();
})();
