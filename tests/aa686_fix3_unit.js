// AA686-FIX3-1104：AA_686 回 LAWWW-C「AA_685 接線五件」（企劃線 1df3c189e；第 4 項 72707f636 補新年快樂回覆池）＋ AA_685 D 節第 1 點（企劃線 2d4d5dc72），AA-C 定稿 D109。不需要瀏覽器。
//   1   回來以後最近的週六是過年店休：AA_686 照 LAWWW-C 的做法（前一個週六約）——後來 AA_685 D-1 改了，見 D1
//   2   語彤的期末飯（朋友的邀約）：週六 17:30、溫州街的小路（AA_655 的店名）、期末考完以後的第一個週六（原本週四 19:00 公館燒臘）；舊存檔排好的那一頓照公館燒臘演
//   3a  平日回國不傳「回來了嗎」（照現在）
//   3b  寒暑假的平日（她在淡水）：輪流的多三則「今天在淡水」「📷（診所門口的盆栽…）」「秀琴姨傳訊息問我吃了沒」（各兩句），週末不出現；店休那幾天照 shut
//   3c  平日玩家能回的「淡水冷嗎？」「好好休息。」；週末照「辛苦了。」「想喝茶。」
//   3d  朋友版「📷（茶屋今天的長桌）」只在週六、日傳（中間那天是平日＝這一趟離中間最近的週六、日；沒有＝不傳）；烏龍、茶壺的照片也只在週末
//   3e  傳的時間：週六、日 22:30、平日 21:30（原本週二、四 23:00、其他 22:30）
//   4   「茶屋○○開」照那一年茶屋過年以後第一個開門的日子（2027 初四是週二公休＝初五）；新年快樂 L「初四開店。你要第一個來喝。」也照年份換「初四」（msg2_pool.js 不改，傳的時候換）
//   5   D14「海風與燈」從源稿 spots_v3.json／aa_walk_v1.json@1df3c189e 匯入（白名單換版、EXTRA 拿掉）：一個人來也出這一項；同行照 AA_685 C1
//   D1  語彤重逢中間隔了她沒班的週六：回到臺北那天 21:00 就約、「{月}/{日} 那個週六我五點下班」「你來店裡」、隔掉的是過年茶屋休息＝前面多「茶屋過年休息」；D-2 阿哲的逗號照留
//   AA_687（企劃線 d41750385，AA-C 定 D109）以後：2 的時間 18:00、邀約照 examDay（考完那天 20:30）、小路的開場收尾旁白；3c 暑假的回覆「淡水熱嗎？」；3b 店休的輪流用平日那一組——這幾項照新的規則改（本身的測試在 tests/aa687_fix4_unit.js）
// 修改前（e25149ef0）：FAILED 25（2、3、3d、4、5、D1 每一節都有 FAIL）；用法：node tests/aa686_fix3_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H, J=JSON.stringify, YT='heroine_03', AN='heroine_01';
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
const PG_FILES=new Set(['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js',
  'src/social3d.js','src/events3d.js','src/data/l118_redo772.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js',
  'src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/data/syllabus.js','src/data/exam_bank.js','src/data/legal_qbank.js','src/classes3d.js','src/data/postgrad_lines.js','src/postgrad3d.js']);
const SKIP=new Set(['src/character3d.js','src/engine3d.js','src/townkit3d.js','src/zones3d.js','src/bike3d.js','src/adv3d.js']);
const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
const ORDER=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>f.startsWith('src/'));
for(const f of ORDER.filter(f=>!PG_FILES.has(f)&&!SKIP.has(f))){ try{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }catch(e){} }
GM.toast=()=>{}; GM.caption=()=>{}; GM.studySession=async()=>{}; GM.spawnNPC=()=>null; GM.spawnCharacter=()=>null; GM.phoneBadge=()=>{}; GM.quickGo=async()=>{}; GM.money=d=>{ H.G.money=(H.G.money|0)+d; };
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const DK=k=>STORY.dayOfKey(k), K=d=>d==null?null:CALENDAR.dateOf(d).key, WD=d=>CALENDAR.dateOf(d).wd%7;
const at=(k,h)=>{ const d=typeof k==='number'?k:DK(k); H.G.day=d; H.G.hour=h; H.G.weekday=WD(d); };
const fresh=(k,h,zone,flags)=>{ H.fresh(typeof k==='number'?'2025-09-01':k,h,zone,flags); if(typeof k==='number') at(k,h); return H.G; };
const run=(h0,h1,st)=>{ st=st||0.05; for(let h=h0;h<=h1+1e-9;h+=st){ H.G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(H.G); } };
const rules=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const src=f=>fs.readFileSync(path.join(H.ROOT,f),'utf8');
const strip=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:'"\\])\/\/[^\n]*/g,'$1');
const gshow=(sha,p)=>{ const r=cp.spawnSync('git',['-C',H.ROOT,'show',sha+':'+p],{encoding:'utf8',maxBuffer:32<<20}); return r.status===0?r.stdout:''; };
/* 企劃稿直接讀（不經 tests/alison.js 的換字表）*/
const AA686=gshow('72707f636','docs/story_planning/AA_686_回LAWWW_AA685接線五件.md'), AA685D=gshow('2d4d5dc72','docs/story_planning/AA_685_回LAWWW_第二輪十項.md');
const in686=t=>!!AA686&&AA686.includes(t), in685=t=>!!AA685D&&AA685D.includes(t);
const outOf=id=>OUT.get(H.G,id), dayH=q=>q?[K(q.day),WD(q.day),q.h]:null;
/* 排好的（PHONE.at 進了佇列、還沒到）＋已經到的 */
const sched=th=>{ const o=[]; for(const m of (H.G.msgs||[])) if(m.th===th) o.push({day:m.day,h:m.h,tag:m.tag||'',t:m.text,ask:m.ask?m.ask.opts.map(x=>x.t):null}); for(const q of PHONE.rec(H.G).q) for(const x of (q.items||[])) if(x.th===th) o.push({day:q.day,h:q.h,tag:q.tag||'',t:x.text,ask:x.ask?x.ask.opts.map(y=>y.t):null}); return o; };
const P3=()=>VAC_DATA.TRIP_MSG.gf.heroine_03, F3=()=>VAC_DATA.TRIP_MSG.friend.heroine_03[0];
/* 語彤（交往中或朋友）在玩家出國那幾天傳的：sd 出發、ed 回來 */
const ytTrip=(sdK,edK,dating,season)=>{ fresh(sdK,7,'dorm',dating?{dating_heroine_03:true}:{}); if(dating) H.CLOSE(YT); else H.FAMILIAR(YT);
  const I={key:'T686',A:{id:'T686',place:{kind:'abroad'},season:season||'summer',trip:{sd:DK(sdK),ed:DK(edK),start:{h:8},end:{h:18}}},yk:null}; VAC.tripMsgs(H.G,I); return sched('p:heroine_03'); };
const pool=L=>L.filter(x=>/_p\d+$/.test(x.tag));
const byDay=L=>{ const o={}; for(const x of L) (o[K(x.day)]=o[K(x.day)]||[]).push(x.t); return o; };
const WE=d=>[0,6].includes(WD(d));
const hookFor0=TERMEND.hookFor;

(async()=>{
await sec(0,()=>{ check('0. 載得到 VAC、TERMEND、NOODLE_CLOSED、MSG、TRIP、FREE_TRIPS；AA_686（72707f636）、AA_685 D 節（2d4d5dc72）讀得到',
  typeof VAC!=='undefined'&&typeof TERMEND!=='undefined'&&typeof NOODLE_CLOSED!=='undefined'&&typeof MSG!=='undefined'&&typeof TRIP!=='undefined'&&typeof FREE_TRIPS!=='undefined'&&in686('| 4 |')&&in685('## D.')); });

/* ---------- 2 語彤的期末飯：週六 17:30、溫州街的小路 ---------- */
await sec('2',async()=>{
  const f=TERMEND_LINES.FRIEND[YT], PL=TERMEND_LINES.PLACE.teishoku;
  check('2. 資料：期末飯 wd 6（週六）、地點 teishoku＝「溫州街・小路」、背景 teishoku_night（小路的 2D）；店名照 AA_655（wzshops3d.js、places.js 的「小路」）；稿：「期末飯排**週六 17:30，地點溫州街的小路**」——時間 AA_687 第 3 項（企劃線 d41750385）改 18:00（h 18，見 tests/aa687_fix4_unit.js）',
    f.wd===6&&f.h===18&&f.place==='teishoku'&&!!PL&&PL.name==='溫州街・小路'&&PL.bg==='teishoku_night'&&!!OUT.BG.teishoku_night&&PLACES.names.wz_teishoku==='小路'&&/teishoku:\{zone:'wz_teishoku',key:'巷子裡定食',name:'小路'/.test(src('src/wzshops3d.js'))&&in686('期末飯排**週六 17:30，地點溫州街的小路**'),J({wd:f.wd,h:f.h,place:f.place,PL}));
  /* 每一學期：她那一則傳來的那一刻答應，排在哪裡——AA_687 第 5 項（企劃線 d41750385）以後照心意邀約的規則：最後一科考完的那天 20:30 傳（S.heartFrom；原本最後一科考完的隔天 P.back）*/
  const day=term=>{ const w=TERMEND.windowOf(term); fresh(w.from,9,'campus',{}); H.G.stage='law'; H.rel(YT,30,10,5); H.G.termend={contact:{[term]:{[YT]:{pts:9,k:{}}}},think:{}};
    const P=TERMEND.plan(H.G,w), d0=TERMEND.heartFrom(H.G,w,YT,TERMEND.friend(YT,term)); at(d0,20.5); const d=TERMEND.dinnerDay(H.G,w,Object.assign({},TERMEND.friend(YT,term),{h:TERMEND.dinnerH(term,'friend',TERMEND.friend(YT,term))}),YT);
    return {fr:P.friend.includes(YT),exam:K(TERMEND.examDay(H.G,w)),inv:K(d0),d:K(d),wd:d!=null?WD(d):null,h:TERMEND.dinnerH(term,'friend',TERMEND.friend(YT,term))}; };
  const T={}; for(const t of ['Y1S1','Y2S1','Y3S1','Y3S2','Y1S2','Y2S2','Y4S1']) T[t]=day(t);
  check('2. 週四考完的學期：期末考完以後的第一個週六（AA_687 第 3 項起 18:00）——大一上 12/20、大二上 12/26、大三上 12/25、大三下 6/10（原本下一個週四）',
    ['Y1S1','Y2S1','Y3S1','Y3S2'].every(t=>T[t].fr&&T[t].wd===6&&T[t].h===18)&&T.Y1S1.d==='2025-12-20'&&T.Y2S1.d==='2026-12-26'&&T.Y3S1.d==='2027-12-25'&&T.Y3S2.d==='2028-06-10',J(T));
  check('2. 大一下：她 6/18 雙主修筆試以前不來（AA_250 第 2 節，照舊）＝那以後的第一個週六 6/20',T.Y1S2.d==='2026-06-20'&&T.Y1S2.wd===6,J(T.Y1S2));
  check('2. 最後一科在週五的學期（大二下 6/11、大四上 12/22）：原本隔天（週六）20:30 傳＝下一個週六（6/19、12/30；記給 AA）——AA_687 第 5 項改：考完那天（週五）20:30 傳、隔天週六（6/12、12/23）',T.Y2S2.inv==='2027-06-11'&&T.Y2S2.d==='2027-06-12'&&T.Y4S1.inv==='2028-12-22'&&T.Y4S1.d==='2028-12-23',J([T.Y2S2,T.Y4S1]));
  /* 實際走一次：大一上 12/18 20:30 她傳「禮拜六我上到五點。下班以後，要吃飯嗎？」→ 好。→ 12/20（六）溫州街・小路（AA_687 第 3 項起 18:00）*/
  { const w=TERMEND.windowOf('Y1S1'); fresh(w.from,9,'campus',{}); H.G.stage='law'; H.rel(YT,30,10,5); H.G.termend={contact:{Y1S1:{[YT]:{pts:9,k:{}}}},think:{}}; TERMEND.plan(H.G,w); at('2025-12-18',20); run(20,21);
    const m=PHONE.byAsk(H.G,'te_Y1S1_'+YT);
    check('2. 大一上 12/18（四）20:30：「禮拜六我上到五點。下班以後，要吃飯嗎？」',!!m&&m.text==='禮拜六我上到五點。下班以後，要吃飯嗎？'&&K(m.day)==='2025-12-18',J(m&&[m.text,K(m.day),m.h]));
    PHONE.answer(H.G,'te_Y1S1_'+YT,0); rules(); const q=outOf('te_Y1S1');
    check('2. 答應：出遊 12/20（六）、地點「溫州街・小路」、標題「學期末的飯：語彤（溫州街・小路）」（原本 12/25 週四 19:00 公館燒臘；時間 AA_687 第 3 項起 18:00）',!!q&&J(dayH(q))===J(['2025-12-20',6,18])&&q.place==='溫州街・小路'&&q.title==='學期末的飯：'+SOCIAL.displayName(YT)+'（溫州街・小路）'&&q.te.kind==='friend',J(q&&{d:dayH(q),place:q.place,title:q.title}));
    TERMEND.hookFor=()=>null; H.said=[]; H.bgs=[]; H.picks=[0,0,0,0]; await TERMEND.dinner(GM,q); const L=H.lines();
    check('2. 那一頓：開場照小路（AA_686 沒有稿＝「（溫州街・小路。）」；AA_687 第 4 項起 PLACE.teishoku.open「（六點，小路的布簾剛掛出來。…）」）、背景小路的 2D（teishoku_night）；沒有公館燒臘的旁白（阿姨端碗、收碗）',L[0]===PL.open&&/^（六點，小路的布簾剛掛出來。/.test(L[0])&&H.bgs.some(b=>b&&b.image&&/teishoku_night/.test(b.image))&&!L.some(t=>/阿姨端了兩碗|阿姨來收碗/.test(t)),J({L:L.slice(0,3),bg:H.bgs})); }
  /* 舊存檔：更新以前已經排好的那一頓（出遊寫公館燒臘、週四 19:00）＝照排好的演，不改到一半 */
  { const w=TERMEND.windowOf('Y1S1'); fresh('2025-12-25',18,'dorm',{}); H.G.stage='law'; H.rel(YT,30,10,5);
    H.G.termend={contact:{},think:{},Y1S1:{plan:{back:w.from,heart:[],friend:[YT],fallback:null,gf:[],nope:{},kx:false},picked:{who:YT,kind:'friend',day:DK('2025-12-18')}}};
    OUT.plan(H.G,{id:'te_Y1S1',ev:'ev_termend_dinner',day:DK('2025-12-25'),h:19,late:0.25,place:'公館燒臘',title:'學期末的飯：語彤（公館燒臘）',travel:'走過去約 15 分鐘',travelH:0.25,te:{term:'Y1S1',who:YT,kind:'friend'}});
    H.G=JSON.parse(J(H.G)); SOCIAL.bind(H.G); const q=outOf('te_Y1S1'); H.said=[]; H.bgs=[]; H.picks=[0,0,0,0]; await TERMEND.dinner(GM,q); const L=H.lines();
    check('2. 舊存檔已經排好的那一頓（12/25 週四 19:00、公館燒臘）：照排好的演——開場、收尾是公館燒臘那兩句、背景 noodle_table；沒有被搬到小路',J(dayH(q))===J(['2025-12-25',4,19])&&L[0]===TERMEND_LINES.PLACE.noodle.open&&L.includes(TERMEND_LINES.PLACE.noodle.close)&&H.bgs.some(b=>b&&b.image&&/noodle_table/.test(b.image))&&!L.includes('（溫州街・小路。）')&&!L.includes(PL.open)&&!L.includes(PL.close),J({L:[L[0],L[L.length-1]],bg:H.bgs})); }
  TERMEND.hookFor=hookFor0;
});

/* ---------- 3a、3b、3c、3e 交往中的旅行訊息 ---------- */
await sec('3',()=>{
  const P=P3(), OW=P.offWd||{}, NEU=[['你那邊在吃什麼'],['晚安']];
  check('3b. 資料：平日輪流多的三則照稿（各兩句）、平日的回覆「淡水冷嗎？」「好好休息。」（offWd.rep；AA_687 第 6 項起這是寒假的，暑假 repSummer「淡水熱嗎？」，見 tests/aa687_fix4_unit.js）；週末的回覆照舊「辛苦了。」「想喝茶。」',
    J(OW.pool)===J([['今天在淡水','河邊的風很大'],['📷（診所門口的盆栽，土是濕的）','我媽澆的 她每天都叫我澆'],['秀琴姨傳訊息問我吃了沒','我說吃了 其實還沒']])&&J(OW.rep)===J(['淡水冷嗎？','好好休息。'])&&J(P.rep)===J(['辛苦了。','想喝茶。'])
    &&['「今天在淡水」／「河邊的風很大」','「📷（診所門口的盆栽，土是濕的）」／「我媽澆的 她每天都叫我澆」','「秀琴姨傳訊息問我吃了沒」／「我說吃了 其實還沒」','「淡水冷嗎？」／「好好休息。」'].every(in686),J(OW));
  /* 2026-07-13（一）～08-02（日）三週：每天一則的是 7/14～8/1（平日 14 天、週末 5 天；中間那天 7/23 是週四＝也是平日輪流的那一則）*/
  const L=ytTrip('2026-07-13','2026-08-02',true), Pl=pool(L), D=byDay(Pl), wk=Object.keys(D).filter(k=>!WE(DK(k))), we=Object.keys(D).filter(k=>WE(DK(k)));
  const NEW=[].concat(...OW.pool), ALLWK=NEW.concat(...NEU), SHOP=[].concat(...[0,1,2,3,4,5].map(i=>P.pool[i])).concat(P.mid,P.back.slice(1));
  check('3b. 平日：只有「今天在淡水」那三則和不講店裡的那兩則，照順序輪流（先新的三則：7/14 今天在淡水、7/15 盆栽、7/16 秀琴姨、7/17 你那邊在吃什麼、7/20 ……晚安、7/21 又從今天在淡水開始）',
    wk.length===14&&wk.every(k=>D[k].every(t=>ALLWK.includes(t)))&&J(D['2026-07-14'])===J(OW.pool[0])&&J(D['2026-07-15'])===J(OW.pool[1])&&J(D['2026-07-16'])===J(OW.pool[2])&&J(D['2026-07-17'])===J(NEU[0])&&J(D['2026-07-20'])===J(NEU[1])&&J(D['2026-07-21'])===J(OW.pool[0]),J(wk.map(k=>[k,D[k]])));
  check('3b. 週末：新的三則不出現（她在茶屋）；照舊講店裡的那幾則',we.length===5&&we.every(k=>!D[k].some(t=>NEW.includes(t)))&&we.every(k=>D[k].some(t=>SHOP.includes(t))),J(we.map(k=>[k,D[k]])));
  const M=Pl.filter(x=>x.ask), wkA=M.filter(x=>!WE(x.day)), weA=M.filter(x=>WE(x.day));
  check('3c. 平日她傳的，玩家能回「淡水冷嗎？」「好好休息。」——這一趟是暑假：AA_687 第 6 項（企劃線 d41750385）起換「淡水熱嗎？」「好好休息。」；週末照「辛苦了。」「想喝茶。」',wkA.length===14&&weA.length===5&&wkA.every(x=>J(x.ask)===J(['淡水熱嗎？','好好休息。']))&&weA.every(x=>J(x.ask)===J(['辛苦了。','想喝茶。'])),J([wkA[0]&&wkA[0].ask,weA[0]&&weA[0].ask]));
  check('3e. 傳的時間：週六、日 22:30、平日 21:30（原本週二、四 23:00、其他 22:30）；資料 freq {h:21.5, we:22.5}、沒有 tt',J(P.freq)===J({h:21.5,we:22.5})&&Pl.filter(x=>WE(x.day)).every(x=>x.h===22.5)&&Pl.filter(x=>!WE(x.day)).every(x=>x.h===21.5)&&!Pl.some(x=>x.h===23)&&in686('**改**：週六、日 22:30（下班、吃完飯以後）；平日 21:30'),J([...new Set(Pl.map(x=>WD(x.day)+'@'+x.h))]));
  check('3d. 交往中：烏龍的照片（📷（一壺泡好的烏龍…））、茶壺（📷（茶屋的茶壺））只在週六、日',L.filter(x=>/烏龍|茶屋的茶壺/.test(x.t)).length>0&&L.filter(x=>/烏龍|茶屋的茶壺/.test(x.t)).every(x=>WE(x.day)),J(L.filter(x=>/烏龍|茶屋的茶壺/.test(x.t)).map(x=>[K(x.day),x.t])));
  /* 中間那天是週六（7/13～7/24：7/18）＝茶壺那則照傳、22:30 */
  const L2=ytTrip('2026-07-13','2026-07-24',true), mid=L2.filter(x=>/_mid$/.test(x.tag));
  check('3e. 中間那則（7/18 週六）「📷（茶屋的茶壺）」「今天也有開」22:30',J(mid.map(x=>x.t))===J(['📷（茶屋的茶壺）','今天也有開'])&&mid.every(x=>K(x.day)==='2026-07-18'&&x.h===22.5),J(mid));
  check('3a. 平日回國（7/24 週五）不傳「回來了嗎」（照現在）；週日回國（8/2）照傳',!L2.some(x=>/_back$/.test(x.tag))&&J(L.filter(x=>/_back$/.test(x.tag)).map(x=>x.t))===J(['回來了嗎','蘇姨說幫你留一杯']));
  /* 過年店休那幾天照 shut：AA_686 時店休的輪流照舊只用不講店裡的那兩則（新的三則不放進店休）——AA_687 第 7 項（企劃線 d41750385）改：店休的輪流也用平日那一組（新的三則＋那兩則，不管星期幾）*/
  const W=ytTrip('2028-01-17','2028-01-30',true,'winter'), WD_=byDay(pool(W)), sk=Object.keys(WD_).filter(k=>NOODLE_CLOSED.closed(H.G,DK(k)));
  check('3b. 過年店休那幾天照 shut（第一天、兩句）；之後的輪流 AA_687 第 7 項起用平日那一組（新的三則也會出現，不講店裡；見 tests/aa687_fix4_unit.js）；店休以前的平日（1/18）照舊是新的三則',sk.length===10&&sk.every(k=>WD_[k].every(t=>ALLWK.concat(P.shut.first,...P.shut.pool).includes(t)))&&sk.some(k=>WD_[k].some(t=>NEW.includes(t)))&&J(WD_['2028-01-19'])===J(P.shut.first)&&(WD_['2028-01-18']||[]).every(t=>NEW.includes(t))&&WD_['2028-01-18'].length>0,J([WD_['2028-01-18'],sk.map(k=>[k,WD_[k]])]));
  check('3c. 店休那幾天玩家能回的照舊「好好休息。」「開店我第一個去。」',pool(W).filter(x=>x.ask&&NOODLE_CLOSED.closed(H.G,x.day)).every(x=>J(x.ask)===J(P.shut.rep))&&pool(W).filter(x=>x.ask&&NOODLE_CLOSED.closed(H.G,x.day)).length>=5);
});

/* ---------- 3d 朋友版「茶屋今天的長桌」只在週六、日 ---------- */
await sec('3d',()=>{
  const F=F3(); check('3d. 資料：朋友版那一則寫 wd [6,0]（照片、shut 那張照舊）；稿「**改**：只在週六、日傳」',J(F.wd)===J([6,0])&&J(F.ms)===J(['📷（茶屋今天的長桌）'])&&J(F.shut)===J(['📷（茶屋的木門關著，門上貼著紅紙）'])&&in686('朋友版「茶屋今天的長桌」照片沒有限週末'));
  const fr=(a,b)=>ytTrip(a,b,false).filter(x=>/_f_heroine_03_/.test(x.tag)).map(x=>[K(x.day),WD(x.day),x.h,x.t]);
  const a=fr('2026-07-13','2026-07-24'), b=fr('2026-07-06','2026-07-12'), c=fr('2026-08-24','2026-08-28'), d=fr('2028-01-19','2028-01-23'), e=fr('2027-01-17','2027-01-29');
  check('3d. 中間那天是週六（7/13～7/24：7/18）＝照傳那一天 22:30',J(a)===J([['2026-07-18',6,22.5,'📷（茶屋今天的長桌）']]),J(a));
  check('3d. 中間那天是平日（7/6～7/12：7/9 週四）＝改在離中間最近的週六（7/11）',J(b)===J([['2026-07-11',6,22.5,'📷（茶屋今天的長桌）']]),J(b));
  check('3d. 這一趟沒有週六、日（8/24 週一～8/28 週五）＝不傳',J(c)===J([]),J(c));
  check('3d. 中間那天是平日的店休（2028-01-21 週五）＝照舊那一天換 shut 那張（木門關著）',J(d)===J([['2028-01-21',5,22.5,'📷（茶屋的木門關著，門上貼著紅紙）']]),J(d));
  check('3d. 2027 大二寒假（1/17～1/29：中間 1/23 週六、有開）＝長桌照傳',J(e)===J([['2027-01-23',6,22.5,'📷（茶屋今天的長桌）']]),J(e));
});

/* ---------- 4 茶屋過年以後第一個開門的日子 ---------- */
await sec('4',async()=>{
  const Y={}; for(const y of ['2026','2027','2028','2029']){ const c=DK(NOODLE_CLOSED.CNY[y]), o=NOODLE_CLOSED.teaOpen(c); Y[y]=[K(o),WD(o),NOODLE_CLOSED.chu(o)]; }
  check('4. 茶屋過年以後第一個開門的日子（初四起、週一週二公休）：2026 初四（2/20 五）、2027 初五（2/10 三；初四 2/9 週二公休）、2028 初四（1/29 六）、2029 初四（2/16 五）；稿「2027＝初五」',
    J(Y)===J({2026:['2026-02-20',5,'初四'],2027:['2027-02-10',3,'初五'],2028:['2028-01-29',6,'初四'],2029:['2029-02-16',5,'初四']})&&in686('照那一年茶屋過年以後第一個開門的日子算（2027＝初五）'),J(Y));
  check('4. 只換「初四」那兩個字、只認那兩整句（其他句子原樣）',NOODLE_CLOSED.teaText('茶屋初四開。蘇姨說第一壺留給你。',DK('2027-01-30'))==='茶屋初五開。蘇姨說第一壺留給你。'&&NOODLE_CLOSED.teaText('初四開店。你要第一個來喝。',DK('2027-02-06'))==='初五開店。你要第一個來喝。'&&NOODLE_CLOSED.teaText('這週店休，初四開',DK('2027-02-06'))==='這週店休，初四開'&&NOODLE_CLOSED.teaText('茶屋初四開。蘇姨說第一壺留給你。',DK('2027-03-01'))==='茶屋初四開。蘇姨說第一壺留給你。');
  const back=(a,b)=>ytTrip(a,b,true,'winter').filter(x=>/_back$/.test(x.tag)).map(x=>x.t);
  check('4. 回國那天是店休：2027（1/30 回來）「茶屋初五開。蘇姨說第一壺留給你。」、2028（1/28 回來）「茶屋初四開。…」；資料的字照舊（AA_685 A4 的句子）',
    J(back('2027-01-25','2027-01-30'))===J(['回來了嗎','茶屋初五開。蘇姨說第一壺留給你。'])&&J(back('2028-01-22','2028-01-28'))===J(['回來了嗎','茶屋初四開。蘇姨說第一壺留給你。'])&&J(P3().shut.back)===J(['回來了嗎','茶屋初四開。蘇姨說第一壺留給你。']),J([back('2027-01-25','2027-01-30'),back('2028-01-22','2028-01-28')]));
  /* 新年快樂（手機，MSG2 語彤 L）：照片那一則不動、「初四」照年份換；msg2_pool.js 照舊是原句 */
  const ny=k=>{ fresh(k,12,'campus',{dating_heroine_03:true}); H.CLOSE(YT); INV.addContact(H.G,YT); const r=MSG.send(H.G,YT,'newyear'); const q=PHONE.rec(H.G).q; return {ok:!!(r&&r.ok),t:q.length?q[q.length-1].items.map(x=>x.text):[]}; };
  const n26=ny('2026-02-17'), n27=ny('2027-02-06'), n28=ny('2028-01-26'), n29=ny('2029-02-13');
  check('4. 新年快樂（交往中，初一傳）：2027「（照片：茶屋拉下來的木門，貼著紅紙）」「初五開店。你要第一個來喝。」；2026、2028、2029「初四開店。…」（稿：「初四」照年份換，其他字不動）',
    n27.ok&&J(n27.t)===J(['（照片：茶屋拉下來的木門，貼著紅紙）','初五開店。你要第一個來喝。'])&&[n26,n28,n29].every(n=>n.ok&&J(n.t)===J(['（照片：茶屋拉下來的木門，貼著紅紙）','初四開店。你要第一個來喝。']))&&in686('「初四開店。你要第一個來喝。」：「初四」照年份換，其他字不動'),J([n26,n27,n28,n29]));
  check('4. msg2_pool.js（產生的檔）沒有改：回覆池的原句照舊「初四開店。你要第一個來喝。」；換字在 src/msg3d.js S.teaSwap（只有語彤）',MSG2_POOL.people[YT].replies.some(e=>J(e.msgs)===J(['（照片：茶屋拉下來的木門，貼著紅紙）','初四開店。你要第一個來喝。']))&&/S\.teaSwap=\(G,id,L\)=>id==='heroine_03'/.test(src('src/msg3d.js'))&&!/初五開店/.test(src('src/data/msg2_pool.js')));
});

/* ---------- 5 D14「海風與燈」從源稿匯入 ---------- */
await sec('5',async()=>{
  const A=JSON.parse(src('docs/handoff/story_import_allow.json')).files, sp3=A.find(e=>e.path==='docs/story_planning/free_trip/spots_v3.json'), wk=A.find(e=>e.path==='docs/story_planning/free_trip/aa_walk_v1.json');
  check('5. 白名單：spots_v3.json、aa_walk_v1.json 換 1df3c189e（approved），舊的（3b599624、b5acbaad）放在 history',!!sp3&&sp3.sha==='1df3c189e'&&sp3.status==='approved'&&(sp3.history||[]).some(h=>h.sha==='3b599624')&&!!wk&&wk.sha==='1df3c189e'&&wk.status==='approved'&&(wk.history||[]).some(h=>h.sha==='b5acbaad'),J([sp3&&[sp3.sha,sp3.history],wk&&[wk.sha,wk.history]]));
  const S3=JSON.parse(gshow('1df3c189e','docs/story_planning/free_trip/spots_v3.json')||'{}'), s14=(S3.spots||[]).find(s=>s.id==='D14'), p14=s14&&s14.points.find(p=>p.id==='D14.lights'), g14=TRIP.spot('D14'), q14=g14&&g14.points.find(p=>p.id==='D14.lights');
  check('5. free_trips.js 的 D14.lights＝源稿那一項（一字不差：night:true、一個人的旁白兩句）；沒有 nightOf；source 寫 spots_v3.json@1df3c189e',!!p14&&!!q14&&J(q14)===J(p14)&&q14.night===true&&!q14.nightOf&&J(q14.lines)===J(['天黑以後，情人橋上的燈一排一排亮起來。你找了一段沒有人的欄杆靠著。','今天風很大，橋上的燈一直被吹得晃來晃去。'])&&/spots_v3\.json@1df3c189e/.test(FREE_TRIPS.source),J(q14));
  const imp=src('tools/freetrip/import_spots.py');
  check('5. tools/freetrip/import_spots.py 的 EXTRA（AA_685 C1 補的那一項）拿掉了；匯入工具照白名單讀',!/EXTRA\s*=/.test(imp)&&!/nightOf/.test(strip(imp).replace(/#[^\n]*/g,''))&&/G\.allowed\(p, APPROVED\.get\(p, ''\), ALLOW\)/.test(imp));
  const W1=JSON.parse(gshow('1df3c189e','docs/story_planning/free_trip/aa_walk_v1.json')||'{}'), w1=((W1.walk)||[]).find(q=>q.who===YT&&q.act==='D14.lights'), e1=(ENC_WALK.walk||[]).find(q=>q.who===YT&&q.act==='D14.lights');
  check('5. 語彤 D14.lights 的兩句：源稿 aa_walk_v1.json@1df3c189e 和 enc_walk.js 一樣',!!w1&&!!e1&&J(w1.friend)===J(e1.friend)&&J(w1.dating)===J(e1.dating),J([w1,e1&&{friend:e1.friend,dating:e1.dating}]));
  const menu=async(k,h,who,tier,o)=>{ o=o||{}; fresh(k,h,'dorm',Object.assign({WISH_DONE_heroine_03:true},tier==='dating'?{['dating_'+who]:true}:{})); if(who){ H.FRIEND(who); if(tier==='dating') H.CLOSE(who); }
    H.G.trip={spot:'D14',depart:h,arrive:h,done:o.done||[],walk:0,photo:false,p:[CLS.periodAt(h)],from:'dorm',said:true,with:who?{who,tier}:null};
    if(o.visits) TRIP.rec(H.G).free.D14=o.visits;
    const menus=[]; const ch=GM.choose; let n=0; GM.choose=async O=>{ n++; if(n===1){ menus.push(O.map(x=>({t:x.t,hint:x.hint,dim:!!x.dim}))); const i=o.pick?O.findIndex(x=>x.t===o.pick):-1; if(i>=0) return i; }
      const b=O.findIndex(x=>x.t==='回去'); if(b>=0) return b; return 0; };
    H.said=[]; try{ await TRIP.loop(GM); } finally { GM.choose=ch; }
    const m=menus[0]||[]; return {lab:m.map(x=>x.t),pt:x=>m.find(y=>y.t===x)||null,said:H.said.map(s=>(s.who?s.who+'：':'')+s.t)}; };
  const s1=await menu('2026-02-01',18,null,null,{pick:'海風與燈',visits:1}), s2=await menu('2026-02-01',18,null,null,{pick:'海風與燈',visits:2});
  check('5. 一個人來（寒假的週日 18:00）：選單有「海風與燈」（可以選）、沒有灰掉的「海風與夕陽」；選了＝旁白（第一次來那一句、之後那一句，照其他互動點的寫法）',
    !!s1.pt('海風與燈')&&!s1.pt('海風與燈').dim&&!s1.pt('海風與夕陽')&&s1.said.includes(q14.lines[0])&&s2.said.includes(q14.lines[1]),J([s1.lab,s1.said,s2.said]));
  const su=await menu('2026-07-12',18.3,null,null), sn=await menu('2026-07-12',19.2,null,null), rn=await menu('2026-02-01',18,null,null,{rain:true});
  check('5. 一個人來：暑假日落以前（18:18）照舊「海風與夕陽」、沒有「海風與燈」；日落以後（19:12）換「海風與燈」',!!su.pt('海風與夕陽')&&!su.pt('海風與夕陽').dim&&!su.pt('海風與燈')&&!!sn.pt('海風與燈')&&!sn.pt('海風與夕陽'),J([su.lab,sn.lab]));
  const an=await menu('2026-02-01',18,AN,'friend');
  check('5. 同行的人沒有這一項的台詞（以安）：照 AA_685 C1 原本的做法（不列「海風與燈」、夕陽那一項灰掉「太陽已經下山了」）',!an.pt('海風與燈')&&!!an.pt('海風與夕陽')&&an.pt('海風與夕陽').hint==='太陽已經下山了',J(an.lab));
  const yt=await menu('2026-02-01',18,YT,'friend',{pick:'海風與燈'});
  check('5. 和語彤（朋友）：「海風與燈」照舊；旁白之後她那一句「橋上的燈亮了。要拍的話就是現在。」',yt.said.some(t=>t.endsWith('：橋上的燈亮了。要拍的話就是現在。'))&&yt.said.indexOf(q14.lines[0])>=0&&yt.said.indexOf(q14.lines[0])<yt.said.findIndex(t=>t.endsWith('：橋上的燈亮了。要拍的話就是現在。')),J(yt.said));
  { /* AA_694（DATE-ELLIPSIS-1105）以後 date_lines.js 整份拿掉了沒必要的「……」：漁人碼頭（loc.D14）＝e25149ef0 那一版照同一條規則換過，其他字不變 */
    const DL=t=>JSON.parse(t.slice(t.indexOf('const DATE_LINES=')+17,t.lastIndexOf(';')));
    const was=DL(cp.execFileSync('git',['-C',H.ROOT,'show','e25149ef0:src/data/date_lines.js'],{encoding:'utf8',maxBuffer:64*1024*1024})), now=DL(fs.readFileSync(path.join(H.ROOT,'src/data/date_lines.js'),'utf8'));
    /* 2026-11-11（X327 沛珊重寫，源稿 D14.json@2883197b6）：D14 沛珊的格子整組換了（逐字對稿在 tests/peishan_dates_1111_unit.js）——這裡比其他人的格子，沛珊那一組拿掉再比 */
    for(const x of [was,now]) for(const k of ['lines','likes','dislikeLine']) if(x.loc.D14[k]){ delete x.loc.D14[k].classmate_peishan; delete x.loc.D14[k].heroine_05; delete x.loc.D14[k].heroine_03; delete x.loc.D14[k].kexin; delete x.loc.D14[k].heroine_02; delete x.loc.D14[k].heroine_04; delete x.loc.D14[k].heroine_01;   /* 2026-11-11（X324 以安約會台詞重寫，AA bd1ce5be0）：D14 以安的格子也重寫了（逐字對稿在 tests/an_dates_1111_unit.js），一樣拿掉再比——七個人都另外驗了，這裡剩互動點名稱、芯慈的格子 */   /* 2026-11-11（X324 子晴約會台詞重寫，AA 02078efc0）：D14 子晴的格子也重寫了（逐字對稿在 tests/zq_dates_1111_unit.js），一樣拿掉再比 */   /* 2026-11-11（X324 芷若約會台詞重寫，AA a29a8aba0）：D14 芷若的格子也重寫了（逐字對稿在 tests/zr_dates_1111_unit.js），一樣拿掉再比 */   /* 2026-11-11（X324 可昕約會台詞重寫，AA f9c1a2b80）：D14 可昕的格子也重寫了（逐字對稿在 tests/kx_dates_1111_unit.js），一樣拿掉再比 */   /* 2026-11-11（X324 語彤約會台詞重寫，AA 0a2136911）：D14 語彤的格子也重寫了（逐字對稿在 tests/yt_dates_1111_unit.js），一樣拿掉再比 */ }   /* 2026-11-11（X324 學姊約會台詞重寫，AA 82c946ad7）：D14 學姊的格子也重寫了（逐字對稿在 tests/sis_dates_1111_unit.js），一樣拿掉再比 */
    check('5. 正式約會的漁人碼頭照舊（date_locations.js、date3d.js 沒有改；date_lines.js 的 D14 只有 AA_694 拿掉「……」；沛珊的格子 X327 重寫，另外驗）',cp.spawnSync('git',['-C',H.ROOT,'diff','--quiet','e25149ef0','--','src/data/date_locations.js']).status===0&&!/D14|漁人碼頭/.test(cp.spawnSync('git',['-C',H.ROOT,'diff','e25149ef0','--','src/date3d.js']).stdout.toString())   /* date3d.js 之後有別的修改（DRIVE-PICKUP-1105 開車先取車）：只要 diff 沒碰到 D14／漁人碼頭就算照舊 */&&JSON.stringify(require('./ellipsis694.js').deep(was.loc.D14))===JSON.stringify(now.loc.D14)); }
});

/* ---------- D1 重逢中間隔了她沒班的週六（AA_685 D 節）---------- */
await sec('D1',async()=>{
  const R=VAC_DATA.TRIP_MSG.reunion[YT];
  check('D1. 資料：inviteDate「{月}/{日} 那個週六我五點下班」／「你來店裡」、inviteShut「茶屋過年休息」（稿逐字）；invite、inviteNext 照舊',J(R.inviteDate)===J(['{月}/{日} 那個週六我五點下班','你來店裡'])&&J(R.inviteShut)===J(['茶屋過年休息'])&&J(R.invite)===J(['這週六我五點下班','你來店裡'])&&J(R.inviteNext)===J(['下週六我五點下班','你來店裡'])&&in685('`{月}/{日} 那個週六我五點下班`')&&in685('「茶屋過年休息」'),J(R));
  fresh('2027-01-20',12,'dorm',{dating_heroine_03:true}); H.CLOSE(YT); const G=H.G, ri=(k,g)=>{ const x=VAC.reInvite(R,DK(k),21,g===undefined?G:g,YT); return [K(x.at),K(x.day),x.invite]; };
  check('D1. 2027-01-27（三）回來：1/30、2/6 過年茶屋休息＝見面 2/13；當天就約：「茶屋過年休息」「2/13 那個週六我五點下班」「你來店裡」',J(ri('2027-01-27'))===J(['2027-01-27','2027-02-13',['茶屋過年休息','2/13 那個週六我五點下班','你來店裡']]),J(ri('2027-01-27')));
  check('D1. 1/30（六，店休第一天）回來：當天約、一樣三則；2/7（日，初二）回來：那天以後第一個週六 2/13 有班＝沒有隔掉＝照 B2「下週六我五點下班」',J(ri('2027-01-30'))===J(['2027-01-30','2027-02-13',['茶屋過年休息','2/13 那個週六我五點下班','你來店裡']])&&J(ri('2027-02-07'))===J(['2027-02-07','2027-02-13',['下週六我五點下班','你來店裡']]),J([ri('2027-01-30'),ri('2027-02-07')]));
  check('D1. 沒有隔掉的週六照 B2：週三約「這週六」、週日約「下週六」（2026-08-05、2028-01-30）',J(ri('2026-08-05'))===J(['2026-08-05','2026-08-08',['這週六我五點下班','你來店裡']])&&J(ri('2028-01-30'))===J(['2028-01-30','2028-02-05',['下週六我五點下班','你來店裡']]),J([ri('2026-08-05'),ri('2028-01-30')]));
  { const s0=VAC.reShift, skip=DK('2026-08-08'); VAC.reShift=function(g,id,r,d){ return d===skip?false:s0.apply(this,arguments); };   /* 測試用：8/8 她因為別的原因沒班（不是過年）*/
    try{ check('D1. 隔掉的週六不是過年（別的原因沒班）＝不加「茶屋過年休息」：8/5 約、8/8 沒班＝「8/15 那個週六我五點下班」「你來店裡」',J(ri('2026-08-05'))===J(['2026-08-05','2026-08-15',['8/15 那個週六我五點下班','你來店裡']]),J(ri('2026-08-05'))); } finally{ VAC.reShift=s0; } }
  check('D1. 程式：S.reInvite 不再挪到見面前一個週六（拿掉 send=day-7；at＝約的那一天＝她回到臺北那天）',!/send=day-7/.test(strip(src('src/vac3d.js')))&&/return \{day,invite,ns,at:inv\}/.test(strip(src('src/vac3d.js'))));
  /* 實際走：C11@Y2 東京 1/30（六）回來 */
  { const I=VAC.inst('C11','Y2'); fresh(I.to,17.9,'dorm',{dating_heroine_03:true}); H.CLOSE(YT); VAC.rec(H.G).reg[I.key]='done'; run(17.9,21.5,0.05);
    const t=(H.G.msgs||[]).filter(m=>m.tag==='vac_re_'+I.key+'_'+YT).map(m=>[K(m.day),m.text]), q=outOf('vac_'+I.key+'_re_'+YT);
    check('D1. C11@Y2（東京，1/30 週六回到臺北）：1/30 21:00 三則「茶屋過年休息」「2/13 那個週六我五點下班」「你來店裡」、出遊 2/13（六）17:15 一盞茶屋（原本 2/6 才約）',
      K(I.to)==='2027-01-30'&&J(t)===J([['2027-01-30','茶屋過年休息'],['2027-01-30','2/13 那個週六我五點下班'],['2027-01-30','你來店裡']])&&!!q&&J(dayH(q))===J(['2027-02-13',6,17.25])&&q.place==='一盞茶屋',J({t,q:dayH(q)}));
    for(let k=1;k<=8;k++){ at(I.to+k,20.95); run(20.95,21.3,0.05); }
    check('D1. 之後幾天（到 2/7）不再約一次（同一個 tag 只傳一次）',(H.G.msgs||[]).filter(m=>m.tag==='vac_re_'+I.key+'_'+YT).length===3); }
  /* D-2：阿哲訊息拿掉句號以後的逗號照留（照現在）*/
  check('D2. 阿哲的群組訊息：逗號照留（「阿姨說要大掃除 想吃燒臘的，初四以後」）',NOODLE_CLOSED.L.a[2026][1]==='阿姨說要大掃除 想吃燒臘的，初四以後'&&in685('逗號、問號、驚嘆號、「……」都留'));
});

/* ---------- 1 AA_686 第 1 項（照 LAWWW-C 的做法）＝後來被 AA_685 D-1 取代 ---------- */
await sec('1',()=>{ check('1. AA_686 第 1 項「照 LAWWW-C 的做法」（見面前一個週六約）：AA_685 D-1（2d4d5dc72，時間在後）改成回到臺北當天約、用日期講——照 D-1（上面 D1 那幾項）',in686('**照 LAWWW-C 的做法**')&&in685('不再往後挪到見面前一個週六')); });

H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
