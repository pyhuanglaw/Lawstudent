// AA685-CANON-FIX2-1104：AA_685 回 LAWWW 第二輪十項（企劃線 c96613e51；C 節 91f240e50，AA-C 定稿 D109）——A1、A5、B4 照現在，其餘接進遊戲。不需要瀏覽器。
//   A2  燒臘店過年店休群組 A、D：阿哲傳（from zhe）、句號照 AA_477 第 3 節拿掉；D 2026「阿姨說 今天每盤送一顆滷蛋」、2029「每盤送滷蛋 今年也是」，2027、2028 照字
//   A3  2026 情人節「下次店休也出來。」拿掉、不記 YT_CLOSED_OUT；舊存檔有 YT_CLOSED_OUT 的照樣讀得進來（C 節第 3 點：不另外收尾）
//   A4  語彤 shut.back「茶屋初四開。蘇姨說第一壺留給你。」；觸發的日子照 NOODLE_CLOSED（初三以前休、初四開）
//   A6  1 以安前任版群組「一月口試。」 2 沛珊心願約會拿掉「……今天是我們。」（date_wish.js 重匯） 3 ytjob3d.js「蘇姨的點心是買的。」
//       4 語彤旅行訊息池換茶屋、講店裡的只在週六日（平日換不講店裡的、回來那天平日不傳）、過年店休照 shut  5 語彤結局 yt[2]、yt.away
//   B1  D14 漁人碼頭 18:00～20:00（偶遇那一列、作息那一筆）
//   B2  重逢：她回到臺北的那一天 21:00 約（C08 大二：台東回來那天 7/31）；那天以後第一個她有班的週六 17:15；週一～五「這週六」、週六日「下週六」；「今天我五點下班」拿掉
//   B3  termend_lines.js 心意邀約基本版、期末飯 y1s1 換字
//   B5  桌遊夜長桌閒聊每一則每個存檔只演一次、那一學期的用完就不演；舊的旁白加括號
//   C1  D14 日落以後（寒假 18:00 以後、暑假日落以後）同行「海風與夕陽」換「海風與燈」，語彤兩句照稿（第二句和夕陽版同一句）
//   另外：tools/story/aa685_fix.json 兩份清單（import_guard.py read_fix、tests/alison.js）一樣、排在 aa683 後面；新句逐字在 AA_685（91f240e50，直接讀、不經換字表）
//   AA_686（企劃線 1df3c189e）、AA_685 D 節（2d4d5dc72）後來改了其中幾件，這支照新的決定改（不是放寬）：A6-4 平日多三則、平日的回覆；B2 中間隔了沒班的週六＝回到臺北當天用日期約；
//   C1 源稿補了「海風與燈」（一個人來也出、旁白兩句）。那幾件本身的測試在 tests/aa686_fix3_unit.js
// 修改前（開發分支 284514e47）：每一節都有 FAIL。用法：node tests/aa685_canon_fix2_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H, J=JSON.stringify, YT='heroine_03';
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
const src=f=>fs.readFileSync(path.join(H.ROOT,f),'utf8');
const strip=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:'"\\])\/\/[^\n]*/g,'$1');
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
/* 企劃稿直接讀（spawnSync 不經 tests/alison.js 的換字表：稿上的「現在」欄要看到原字）*/
const AA685=(()=>{ const r=cp.spawnSync('git',['-C',H.ROOT,'show','91f240e50:docs/story_planning/AA_685_回LAWWW_第二輪十項.md'],{encoding:'utf8'}); return r.status===0?r.stdout:''; })();
const inDoc=t=>!!AA685&&AA685.includes(t);
const run=(h0,h1,st)=>{ st=st||0.1; for(let h=h0;h<=h1+1e-9;h+=st){ H.G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(H.G); } };
const byTag=tag=>(H.G.msgs||[]).filter(m=>m.tag===tag);
/* 排好的（PHONE.at 進了佇列、還沒到）＋已經到的：[{day,tag,texts}] */
const sched=th=>{ const o=[]; for(const m of (H.G.msgs||[])) if(m.th===th) o.push({day:m.day,h:m.h,tag:m.tag,t:m.text}); for(const q of PHONE.rec(H.G).q) for(const x of (q.items||[])) if(x.th===th) o.push({day:q.day,h:q.h,tag:q.tag,t:x.text}); return o; };
const byDayTxt=L=>{ const o={}; for(const x of L) (o[K(x.day)]=o[K(x.day)]||[]).push(x.t); return o; };

(async()=>{
await sec(0,()=>{ check('0. 載得到：NOODLE_CLOSED、VAC、VAC_DATA、TRIP、ENC、ENC_WALK、BGN、NOODLE_TABLE、DATE_WISH、YTJOB、TERMEND；AA_685 讀得到（git show 91f240e50，含 C 節）',
  typeof NOODLE_CLOSED!=='undefined'&&typeof VAC!=='undefined'&&typeof VAC_DATA!=='undefined'&&typeof TRIP!=='undefined'&&typeof ENC!=='undefined'&&typeof ENC_WALK!=='undefined'&&typeof BGN!=='undefined'&&typeof NOODLE_TABLE!=='undefined'&&typeof DATE_WISH!=='undefined'&&typeof YTJOB!=='undefined'&&typeof TERMEND!=='undefined'&&/## C\. /.test(AA685)); });

/* ---------- A2 店休群組：阿哲傳、句號照 AA_477 ---------- */
await sec('A2',()=>{
  const L=NOODLE_CLOSED.L;
  const WANT={a:{2026:['這週店休，到初三','阿姨說要大掃除 想吃燒臘的，初四以後'],2027:['店休，到初三','阿姨說今年要把招牌擦乾淨 初四見'],2028:['這週店休，初四開','阿姨回老家三天'],2029:['這週店休，到初三','你們今年過年還在臺北嗎']},
    d:{2026:['開了','阿姨說 今天每盤送一顆滷蛋'],2027:['開了','招牌真的擦了 很亮'],2028:['開了','阿姨從老家帶了一箱橘子，吃飯送一顆'],2029:['開了','每盤送滷蛋 今年也是']}};
  check('A2. 資料：A、D 四年照 AA_685（2026「阿姨說 今天每盤送一顆滷蛋」、2029「每盤送滷蛋 今年也是」逐字在稿裡）；其他照字拿掉句號（AA_477：結尾拿掉、中間換一個空格）',
    J(L.a)===J(WANT.a)&&J(L.d)===J(WANT.d)&&inDoc('2026「阿姨說 今天每盤送一顆滷蛋」')&&inDoc('2029「每盤送滷蛋 今年也是」')&&inDoc('換成**阿哲**傳'),J({a:L.a,d:L.d}));
  check('A2. 沒有一則有句號、沒有「第一碗」（麵店的說法）',![].concat(...Object.values(L.a),...Object.values(L.d)).some(t=>/。|第一碗/.test(t)));
  const got={};
  for(const y of ['2026','2027','2028','2029']){ const W=NOODLE_CLOSED.window(DK(NOODLE_CLOSED.CNY[y])); fresh(W.from,20.9,'dorm'); PHONE.join(H.G,'noodle_team','桌遊團'); run(20.9,21.2);
    at(W.open,11.9); run(11.9,12.2); const M=byTag('noodle_closed_a_'+y).concat(byTag('noodle_closed_d_'+y)); got[y]=M.map(m=>m.from+':'+m.text); }
  const ok=Object.keys(got).every(y=>J(got[y])===J(WANT.a[y].concat(WANT.d[y]).map(t=>'zhe:'+t)));
  check('A2. 實際演：四年的店休第一天 21:00、初四 12:00，群組裡是阿哲傳的那兩則（不是語彤）',ok,J(got));
  { const W=NOODLE_CLOSED.window(DK(NOODLE_CLOSED.CNY['2027'])); fresh(W.from,21.2,'dorm'); PHONE.join(H.G,'noodle_team','桌遊團');
    (H.G.msgs=H.G.msgs||[]).push({th:'g:noodle_team',from:'heroine_03',text:'店休，到初三。',day:W.from,h:21,tag:'noodle_closed_a_2027'}); PHONE.sent(H.G,'noodle_closed_a_2027'); (PHONE.rec(H.G).sent||(PHONE.rec(H.G).sent={}))['noodle_closed_a_2027']=true; run(21.2,21.5);
    check('A2. 舊存檔：2027 店休那一則已經收過（語彤傳的舊字）＝不重發',byTag('noodle_closed_a_2027').length===1&&byTag('noodle_closed_a_2027')[0].from==='heroine_03',J(byTag('noodle_closed_a_2027'))); }
});

/* ---------- A3 情人節的選項 ---------- */
await sec('A3',async()=>{
  const e=ev('ev_yt_vday_y1'), dj=J(e.dialogue);
  check('A3. ev_yt_vday_y1（2026 情人節，已退場、定義留給舊存檔）：沒有「下次店休也出來。」「下次店休是明年。」「……那明年也出來。」、不記 YT_CLOSED_OUT；選項只剩「冷嗎？」',
    !!e&&e.retired===true&&!/下次店休也出來|下次店休是明年|那明年也出來|YT_CLOSED_OUT/.test(dj)&&J(e.dialogue.filter(l=>l&&l.choice).map(l=>l.choice.map(c=>c.text)))===J([['「冷嗎？」']])&&inDoc('這個選項拿掉'),dj.slice(0,80));
  for(const fl of [{},{YT_CLOSED_OUT:true}]){ fresh('2026-02-14',17,'dorm',fl); H.FRIEND(YT); H.said=[]; H.opts=[]; H.picks=['下次店休也出來']; await EVENTS.run(e);
    const L=H.said.map(s=>s.t);
    check('A3. 演一次（'+(fl.YT_CLOSED_OUT?'舊存檔有 YT_CLOSED_OUT':'新存檔')+'）：「冷嗎？」→「……有一點。」、她把手縮進袖子；沒有那兩句'+(fl.YT_CLOSED_OUT?'；旗標照留（不另外收尾，C 節第 3 點）':'、不記 YT_CLOSED_OUT'),
      J(H.opts.map(o=>[...o]))===J([['「冷嗎？」']])&&L.includes('……有一點。')&&L.includes('（她把手縮進袖子。你們又走了一段。）')&&!L.includes('下次店休是明年。')&&(fl.YT_CLOSED_OUT?H.G.flags.YT_CLOSED_OUT===true:!('YT_CLOSED_OUT' in H.G.flags)),J({o:H.opts,L})); }
  const users=ORDER.concat(['src/data/an_yt_hol_events.js']).filter(f=>fs.existsSync(path.join(H.ROOT,f))&&strip(src(f)).includes('YT_CLOSED_OUT'));
  check('A3. 程式裡沒有人讀或寫 YT_CLOSED_OUT（只剩註解）＝舊存檔裡的旗標讀得進來、不影響任何事',!users.length,J(users));
  fresh('2027-02-01',11,'dorm',{YT_CLOSED_OUT:true}); H.FRIEND(YT); PHONE.join(H.G,'noodle_team','桌遊團'); H.said=[]; H.opts=[]; const r=await NOODLE_CLOSED.door(GM);
  check('A3. 舊存檔有 YT_CLOSED_OUT、2027 店休去按門：只有鐵門的旁白',r===true&&J(H.said.map(s=>s.t))===J([NOODLE_CLOSED.L.door])&&!H.opts.length);
});

/* ---------- A4、A6-4 語彤的旅行訊息 ---------- */
const P3=()=>VAC_DATA.TRIP_MSG.gf.heroine_03;
const ytTrip=(sdK,edK,season)=>{ fresh(sdK,7,'dorm',{dating_heroine_03:true}); H.CLOSE(YT);
  const I={key:'T685',A:{id:'T685',place:{kind:'abroad'},season:season||'summer',trip:{sd:DK(sdK),ed:DK(edK),start:{h:8},end:{h:18}}},yk:null}; VAC.tripMsgs(H.G,I); return sched('p:heroine_03'); };
await sec('A4',()=>{
  const SH=P3().shut;
  check('A4. shut.back：「回來了嗎」「茶屋初四開。蘇姨說第一壺留給你。」（稿逐字）',J(SH.back)===J(['回來了嗎','茶屋初四開。蘇姨說第一壺留給你。'])&&inDoc('「茶屋初四開。蘇姨說第一壺留給你。」'),J(SH.back));
  const okW=['2026','2027','2028','2029'].every(y=>{ const c=DK(NOODLE_CLOSED.CNY[y]), W=NOODLE_CLOSED.window(c); return W.to===c+2&&W.open===c+3&&!NOODLE_CLOSED.window(W.open); });
  check('A4. 日子照 NOODLE_CLOSED：四年都是初三（初一+2）最後一天休、初四（初一+3）開',okW);
  const a=ytTrip('2028-01-17','2028-01-28','winter'), b=ytTrip('2028-01-17','2028-01-29','winter');
  const back=L=>L.filter(x=>x.tag==='vac_tm_T685_heroine_03_back').map(x=>x.t);
  check('A4. 2028 回國那天是初三（1/28，店休最後一天）＝「茶屋初四開。…」；初四（1/29 週六，開了）＝照原本「蘇姨說幫你留一杯」',J(back(a))===J(['回來了嗎','茶屋初四開。蘇姨說第一壺留給你。'])&&J(back(b))===J(['回來了嗎','蘇姨說幫你留一杯']),J([back(a),back(b)]));
});
await sec('A6-4',()=>{
  const P=P3();
  check('A6-4. 池子 [0]、[1]、[3]、回覆換成茶屋（稿逐字）；[2]、[4]～[7]、miss、dark、back 照留',
    J(P.pool)===J([['店裡很忙','蘇姨問你什麼時候回來'],['📷（一壺泡好的烏龍，旁邊兩個杯子）','不是你的 是客人的'],['店裡來了一個修鞋的阿伯','他講了四十分鐘'],['你不在 前院的貓碗都是我在洗'],['收店了','好累'],['下雨 沒什麼客人'],['你那邊在吃什麼'],['晚安']])
    &&J(P.rep)===J(['辛苦了。','想喝茶。'])&&J(P.back)===J(['回來了嗎','蘇姨說幫你留一杯'])&&J(P.miss)===J(['今天收店的時候 我把你的位子擦了兩次'])&&J(P.dark)===J(['你今天怎麼沒回','沒事就好'])
    &&['今天店裡很忙／蘇姨問你什麼時候回來','📷（一壺泡好的烏龍，旁邊兩個杯子）／不是你的 是客人的','你不在 前院的貓碗都是我在洗','辛苦了。／想喝茶。'].every(inDoc),J({pool:P.pool,rep:P.rep}));
  check('A6-4. shopOpen：講店裡的那幾則（中間那則、池子 0～5、回來那天）只在週六、日（wd [6,0]）',J(P.shopOpen)===J({mid:true,pool:[0,1,2,3,4,5],back:true,wd:[6,0]})&&inDoc('**只在週六、日傳**'));
  /* 2026-07-13（一）出發、07-24（五）回來：中間 7/18（六）是 mid；7/19（日）池子第 1 則；平日只有不講店裡的那幾則；回來那天是平日＝那一則不傳
     AA_686 第 3b、3c 項（企劃線 1df3c189e，AA-C 定 D109）：平日輪流的多三則（今天在淡水、診所門口的盆栽、秀琴姨，排在前面），玩家能回的平日換「淡水冷嗎？」「好好休息。」——下面兩項照新的規則（本身的測試在 tests/aa686_fix3_unit.js）*/
  const L=ytTrip('2026-07-13','2026-07-24'), D=byDayTxt(L.filter(x=>/_p\d+$|_mid$|_back$/.test(x.tag||''))), NEU=['你那邊在吃什麼','晚安'], WKP=[].concat(...((P.offWd||{}).pool||[])).concat(NEU);
  const shopIdx=new Set([0,1,2,3,4,5]), SHOP=[].concat(...[...shopIdx].map(i=>P.pool[i])).concat(P.mid,P.back.slice(1));
  const wk=Object.keys(D).filter(k=>![0,6].includes(WD(DK(k))));
  check('A6-4. 平日（7/14～7/17、7/20～7/23）：只傳不講店裡的那幾則輪流（AA_686 第 3b 項：先「今天在淡水」那三則，再「你那邊在吃什麼」「晚安」）',wk.length===8&&wk.every(k=>D[k].every(t=>WKP.includes(t)))&&D['2026-07-14'][0]==='今天在淡水'&&D['2026-07-17'][0]==='你那邊在吃什麼'&&D['2026-07-20'][0]==='晚安',J(wk.map(k=>[k,D[k]])));
  check('A6-4. 週六 7/18（中間那則）「📷（茶屋的茶壺）」「今天也有開」；週日 7/19 池子第 1 則「店裡很忙」「蘇姨問你什麼時候回來」',J(D['2026-07-18'])===J(['📷（茶屋的茶壺）','今天也有開'])&&J(D['2026-07-19'])===J(['店裡很忙','蘇姨問你什麼時候回來']),J([D['2026-07-18'],D['2026-07-19']]));
  check('A6-4. 回來那天（7/24 週五）：「蘇姨說幫你留一杯」那一則不傳；平日沒有任何講店裡的句子',!L.some(x=>x.tag==='vac_tm_T685_heroine_03_back')&&!wk.some(k=>D[k].some(t=>SHOP.includes(t))),J(D['2026-07-24']||null));
  const L2=ytTrip('2026-07-13','2026-07-25'); const bk=L2.filter(x=>x.tag==='vac_tm_T685_heroine_03_back').map(x=>x.t);
  check('A6-4. 對照：週六（7/25）回來＝照傳「回來了嗎」「蘇姨說幫你留一杯」',J(bk)===J(['回來了嗎','蘇姨說幫你留一杯']),J(bk));
  const asks=L.filter(x=>/_p\d+$/.test(x.tag||'')), M=(H.G.msgs||[]).concat(...PHONE.rec(H.G).q.map(q=>q.items||[])).filter(m=>m.ask&&m.th==='p:heroine_03'&&/^vac_tm_T685_heroine_03_p/.test(m.ask.id||''));
  const wkM=M.filter(m=>![0,6].includes(WD(Math.floor(+String(m.ask.id).split('_p').pop())))), weM=M.filter(m=>[0,6].includes(WD(Math.floor(+String(m.ask.id).split('_p').pop()))));   /* ask.id＝vac_tm_T685_heroine_03_p<那一天> */
  check('A6-4. 週末玩家能回的是「辛苦了。」「想喝茶。」（不是「想吃乾麵。」）；平日換「淡水冷嗎？」「好好休息。」（AA_686 第 3c 項）——這一趟是暑假：AA_687 第 6 項（企劃線 d41750385）起「淡水熱嗎？」「好好休息。」',asks.length>0&&weM.length>0&&wkM.length>0&&weM.every(m=>J(m.ask.opts.map(o=>o.t))===J(['辛苦了。','想喝茶。']))&&wkM.every(m=>J(m.ask.opts.map(o=>o.t))===J(['淡水熱嗎？','好好休息。']))&&!M.some(m=>m.ask.opts.some(o=>o.t==='想吃乾麵。')),J([weM.slice(0,1),wkM.slice(0,1)].map(a=>a.map(m=>m.ask.opts.map(o=>o.t)))));
  /* 過年店休照 shut：2028-01-17（一）～01-28（五）：1/19 起店休 */
  const W=ytTrip('2028-01-17','2028-01-27','winter'), WDx=byDayTxt(W);
  check('A6-4. 過年店休那幾天照 shut（1/19 第一天「茶屋過年休息。…」、1/20、1/21 那兩句）；店休前的平日（1/18）不講店裡（AA_686 第 3b 項：平日的那幾則）',J(WDx['2028-01-19'])===J([P.shut.first[0]])&&J(WDx['2028-01-20'])===J(P.shut.pool[0])&&J(WDx['2028-01-21'])===J(P.shut.pool[1])&&(WDx['2028-01-18']||[]).length>0&&(WDx['2028-01-18']||[]).every(t=>WKP.includes(t)),J([WDx['2028-01-18'],WDx['2028-01-19'],WDx['2028-01-20']]));
});

/* ---------- A6-1、A6-2、A6-3、A6-5 ---------- */
await sec('A6',()=>{
  const PL=typeof POSTGRAD_LINES!=='undefined'?POSTGRAD_LINES:null, AN=PL&&PL.AN;
  check('A6-1. 以安前任版群組：阿哲「以安二試過了」→ 以安「一月口試。」（同 AA_674 第 1 列的 call1）',!!AN&&J(AN.exGroup1)===J(['以安二試過了','一月口試。'])&&J(AN.call1)===J(['謝謝。一月口試。'])&&inDoc('「一月口試。」'),J(AN&&AN.exGroup1));
  const ps=DATE_WISH.events.classmate_peishan, fr=ps&&ps.hotspots&&ps.hotspots['D06.frame'], c=fr&&fr.choices&&fr.choices.find(x=>x.t==='「框外面呢？」');
  check('A6-2. 沛珊心願約會「框外面呢？」→「框外面，是看框的人。」（拿掉「……今天是我們。」）；看過三段論的多一句照舊；沛珊的心願約會沒有「今天是我們」',
    !!c&&J(c.reply.map(r=>r.text))===J(['框外面，是看框的人。'])&&J(c.extraIf[0].reply.map(r=>r.text))===J(['你記得我說過。'])&&!/今天是我們/.test(J(ps))&&inDoc('拿掉「……今天是我們。」'),J(c&&c.reply));
  check('A6-2. date_wish.js 照匯入工具的格式（source 照舊、verify.miss 是空的：每一句都在換過字的稿裡）',/^白名單 wish_aa\.json@/.test(DATE_WISH.source)&&DATE_WISH.verify&&Array.isArray(DATE_WISH.verify.miss)&&!DATE_WISH.verify.miss.length);
  const b=YTJOB.CATS.b.map(x=>x[1]);
  check('A6-3. ytjob3d.js 找貓那一段：「……她煮的比茶屋的點心好吃。蘇姨的點心是買的。」（不要跟別人說是模板句）；:142 那一句照舊「蘇姨聽到會難過」',
    b.includes('晚上有一個阿姨會來煮飯。秀琴姨。……她煮的比茶屋的點心好吃。蘇姨的點心是買的。')&&!J(YTJOB.CATS).includes('不要跟蘇姨說')&&src('src/ytjob3d.js').includes('嗯。比茶屋的點心好吃。……蘇姨聽到會難過。')&&inDoc('「……她煮的比茶屋的點心好吃。蘇姨的點心是買的。」'),J(b.slice(3,4)));
  const Y=PL&&PL.EPI&&PL.EPI.yt;   /* 尾聲（postgrad_lines.js EPI.yt）*/
  check('A6-5. 語彤結局：yt[2]「……論文寫溫州街的小店，燒臘店的阿鳳阿姨是第一個受訪的。」、yt.away「（一盞茶屋還開著。吧檯最旁邊那個位子空著。）」',
    !!Y&&J(Y[2])===J(['我白天在事務所，晚上念社會所。論文寫溫州街的小店，燒臘店的阿鳳阿姨是第一個受訪的。'])&&Y.away==='（一盞茶屋還開著。吧檯最旁邊那個位子空著。）'&&inDoc('論文寫溫州街的小店，燒臘店的阿鳳阿姨是第一個受訪的。')&&inDoc('「（一盞茶屋還開著。吧檯最旁邊那個位子空著。）」'),J(Y&&[Y[2],Y.away]));
});

/* ---------- B1 D14 到 20:00 ---------- */
await sec('B1',()=>{
  const row=ENCOUNTERS.rows.find(r=>r.who===YT&&r.spot==='D14'), ent=CHARACTERS[YT].daily_schedule.find(e=>e&&e.enc==='D14');
  check('B1. D14 那一列、作息那一筆：18:00～20:00（景點開到 20:00）',!!row&&row.from===18&&row.to===20&&!!ent&&ent.from===18&&ent.to===20&&J(TRIP.spot('D14').open)===J([15,20])&&inDoc('**時段延長到 18:00～20:00**'),J([row&&[row.from,row.to],ent&&[ent.from,ent.to]]));
  const sz=(k,h)=>{ fresh(k,h,'dorm',{WISH_DONE_heroine_03:true}); H.FRIEND(YT); const e=STORY.schedEnt(CHARACTERS[YT],H.G); return e?(e.zone||('out:'+e.enc)):null; };
  const el=(k,h)=>{ fresh(k,h,'dorm',{WISH_DONE_heroine_03:true}); H.FRIEND(YT); const w=[]; return ENC.eligible(H.G,row,w)?'ok':w.join('|'); };
  check('B1. 寒暑假的週日（2026-07-12、寒假 2026-02-01）19:30 她還在漁人碼頭、遇得到；20:00 以後不在、遇不到',sz('2026-07-12',19.5)==='out:D14'&&sz('2026-02-01',19.5)==='out:D14'&&el('2026-07-12',19.5)==='ok'&&el('2026-02-01',19.9)==='ok'&&sz('2026-07-12',20.1)!=='out:D14'&&el('2026-07-12',20)!=='ok',
    J([sz('2026-07-12',19.5),sz('2026-02-01',19.5),el('2026-07-12',19.5),el('2026-02-01',19.9),sz('2026-07-12',20.1),el('2026-07-12',20)]));
});

/* ---------- B2 重逢 ---------- */
await sec('B2',()=>{
  const R=VAC_DATA.TRIP_MSG.reunion[YT];
  check('B2. 資料：invite「這週六我五點下班」／「你來店裡」、inviteNext「下週六我五點下班」／「你來店裡」、沒有 inviteToday、meetWd 6、shift 一盞茶屋、17:15',
    J(R.invite)===J(['這週六我五點下班','你來店裡'])&&J(R.inviteNext)===J(['下週六我五點下班','你來店裡'])&&!('inviteToday' in R)&&R.meetWd===6&&R.h===17.25&&J(R.shift)===J({zone:'wz_teahouse',h:15})&&['＝「這週六我五點下班」','＝「下週六我五點下班」','「今天我五點下班」那一句不用了'].every(inDoc),J(R));
  const ri=(k,G)=>{ const x=VAC.reInvite(R,DK(k),21,G||null,YT); return [K(x.at),K(x.day),x.invite[0]]; };
  check('B2. ③ 約的那天週一～週五＝「這週六」（那個週六）；週六、週日＝「下週六」（那天以後的第一個週六）',
    J(ri('2026-08-03'))===J(['2026-08-03','2026-08-08','這週六我五點下班'])&&J(ri('2026-08-07'))===J(['2026-08-07','2026-08-08','這週六我五點下班'])&&J(ri('2026-08-08'))===J(['2026-08-08','2026-08-15','下週六我五點下班'])&&J(ri('2026-08-09'))===J(['2026-08-09','2026-08-15','下週六我五點下班']),
    J([ri('2026-08-03'),ri('2026-08-07'),ri('2026-08-08'),ri('2026-08-09')]));
  fresh('2027-01-20',12,'dorm',{dating_heroine_03:true}); H.CLOSE(YT); const G=H.G;
  check('B2. ② 她有班的週六：一般的寒假週六有（2027-01-23）；過年茶屋休息（1/30、2/6）沒有；開了以後的週六（2/13）有',VAC.reShift(G,YT,R,DK('2027-01-23'))&&!VAC.reShift(G,YT,R,DK('2027-01-30'))&&!VAC.reShift(G,YT,R,DK('2027-02-06'))&&VAC.reShift(G,YT,R,DK('2027-02-13')));
  { const x=VAC.reInvite(R,DK('2027-01-27'),21,G,YT);   /* AA_685 D-1（企劃線 2d4d5dc72，AA-C 定 D109）：不再挪到見面前一個週六；用日期講、過年多一句（本身的測試在 tests/aa686_fix3_unit.js）*/
    check('B2. ② 中間隔了她沒有班的週六（2027-01-27 週三約，1/30、2/6 過年店休）＝見面 2/13；AA_685 D-1：照樣 1/27 當天約，「茶屋過年休息」「2/13 那個週六我五點下班」「你來店裡」',K(x.at)==='2027-01-27'&&K(x.day)==='2027-02-13'&&J(x.invite)===J(['茶屋過年休息','2/13 那個週六我五點下班','你來店裡']),J([K(x.at),K(x.day),x.invite])); }
  check('B2. ① 她回到臺北的那一天：大二暑假 7/19～7/30 在台東，7/24 起算＝7/31（S.reBack）；平常＝那一天',K(VAC.reBack(G,YT,DK('2027-07-24')))==='2027-07-31'&&K(VAC.reBack(G,YT,DK('2026-08-05')))==='2026-08-05');
  /* 實際走：交往中、出國回來，每天晚上跑一次手機規則 */
  const yre=(id,yk,days)=>{ const I=VAC.inst(id,yk); fresh(I.to,17.9,'dorm',{dating_heroine_03:true}); H.CLOSE(YT); VAC.rec(H.G).reg[I.key]='done'; run(17.9,21.5,0.25);
    for(let k=1;k<=(days||0);k++){ at(I.to+k,20.95); run(20.95,21.3,0.05); }
    const q=OUT.get(H.G,'vac_'+I.key+'_re_'+YT); return {to:K(I.to),t:byTag('vac_re_'+I.key+'_'+YT).map(m=>[K(m.day),m.h,m.text]),q:q&&[K(q.day),q.h,q.place]}; };
  const c8=yre('C08','Y2',9);
  check('B2. ① C08 大二（她 7/31 從台東回來）：7/31 21:00 才約（不在台東時傳）、「下週六我五點下班」「你來店裡」，出遊 8/7（六）17:15 一盞茶屋',
    J(c8.t)===J([['2027-07-31',21,'下週六我五點下班'],['2027-07-31',21,'你來店裡']])&&J(c8.q)===J(['2027-08-07',17.25,'一盞茶屋']),J(c8));
  const c9=yre('C09','Y1');
  check('B2. 對照：C09 大一 8/5（三）回來＝當晚 21:00「這週六我五點下班」，8/8（六）17:15',J(c9.t.map(x=>x[2]))===J(['這週六我五點下班','你來店裡'])&&c9.t[0][0]==='2026-08-05'&&J(c9.q)===J(['2026-08-08',17.25,'一盞茶屋']),J(c9));
  const c10=yre('C10','Y2');
  check('B2. 週六（2027-07-31 C10）回來＝當晚 21:00「下週六我五點下班」、8/7',c10.to==='2027-07-31'&&J(c10.t.map(x=>x[2]))===J(['下週六我五點下班','你來店裡'])&&J(c10.q)===J(['2027-08-07',17.25,'一盞茶屋']),J(c10));
  const c11=yre('C11','Y2',8);
  check('B2. 大二寒假東京 1/30（六，過年店休第一天）回來：AA_685 D-1＝1/30 當晚 21:00 就約「茶屋過年休息」「2/13 那個週六我五點下班」「你來店裡」（原本 2/6 才約）、出遊 2/13（店休結束以後第一個週六）',
    c11.to==='2027-01-30'&&J(c11.t.map(x=>[x[0],x[2]]))===J([['2027-01-30','茶屋過年休息'],['2027-01-30','2/13 那個週六我五點下班'],['2027-01-30','你來店裡']])&&c11.t.every(x=>x[1]>=21&&x[1]<21.5)&&J(c11.q)===J(['2027-02-13',17.25,'一盞茶屋']),J(c11));
  check('B2. 程式裡沒有「今天我五點下班」、inviteToday',!/今天我五點下班|inviteToday/.test(strip(src('src/vac3d.js'))+strip(src('src/data/vac_activities.js'))));
});

/* ---------- B3 期末的兩句 ---------- */
await sec('B3',()=>{
  const L=TERMEND_LINES, h=L.HEART.heroine_03, f=L.FRIEND.heroine_03;
  check('B3. 心意邀約基本版「禮拜六我上班到五點。下班以後，我泡茶。只有我們。」；期末飯 y1s1「禮拜六我上到五點。下班以後，要吃飯嗎？」（稿逐字）',
    h.invite==='禮拜六我上班到五點。下班以後，我泡茶。只有我們。'&&f.y1s1==='禮拜六我上到五點。下班以後，要吃飯嗎？'&&inDoc('「禮拜六我上班到五點。下班以後，我泡茶。只有我們。」')&&inDoc('「禮拜六我上到五點。下班以後，要吃飯嗎？」')&&!/禮拜六我沒排班/.test(J(L)),J([h.invite,f.y1s1]));
});

/* ---------- B5 桌遊夜的長桌閒聊 ---------- */
await sec('B5',async()=>{
  const narr=Object.values(NOODLE_TABLE).flatMap(L=>L.flatMap(e=>(e.dialogue||[]).filter(l=>l.speaker==null).map(l=>l.text)));
  check('B5. 旁白一律有括號（舊的五句也加上）',narr.length>=8&&narr.every(t=>/^（[^（）]+）$/.test(t))&&['（長桌已經坐了一半。阿哲把菜單推給你，雖然大家都只點那幾樣。）','（他把表放在桌子中間。三個人同時拿出手機拍。）','（芯慈一坐下就趴在桌上。）','（你還沒回答，他已經在記事本上寫了你的名字。）','（憲法課老師今天點了阿哲兩次。整桌都在學那個語氣。）'].every(t=>narr.includes(t))&&inDoc('舊的旁白也加上括號'),J(narr.filter(t=>!/^（[^（）]+）$/.test(t))));
  const keys=Object.entries(NOODLE_TABLE).flatMap(([k,L])=>L.map((e,i)=>BGN.talkKey(k,i,e)));
  check('B5. 每一則有自己的 key（noodle_table.js 的 id、heard3d.js 的 once），不重複',keys.length===new Set(keys).size&&Object.values(NOODLE_TABLE).every(L=>L.every(e=>e.id||e.once)),J(keys));
  const NIGHTS=term=>BGN.weeks(term).map(w=>STORY.termDayIn(term,w,5)).filter(d=>d!=null&&BGN.isNight(d));
  const ALL=['zhe','yu','classmate_bohan','classmate_xinci','classmate_mingxuan'];
  const season=async(terms,flags0)=>{ const seq=[]; let flags=flags0?JSON.parse(J(flags0)):null, soc=null;
    for(const d of [].concat(...terms.map(NIGHTS))){ fresh(d,23.2,'dorm',Object.assign({afternoonDone:true},flags||{})); if(soc){ H.G.social=soc; SOCIAL.bind(H.G); } PHONE.join(H.G,'noodle_team','桌遊團'); for(const id of ALL) SOCIAL.remember(id,'FIRST_MET',''); H.G.flags.met_yu=true;
      H.said=[]; const r=await BGN.talk(GM); seq.push(r?H.said[0].t:null); flags=H.G.flags; soc=H.G.social; }
    return {seq,flags}; };
  const y1=await season(['Y1S1','Y1S2']), played=y1.seq.filter(Boolean);
  check('B5. 大一一整年的桌遊夜：六則各演一次（大一上五則、大一下 Alison 趕到那一晚憲法課那一則），其他晚上不演、不從頭輪',played.length===6&&new Set(played).size===6&&played[5]==='（憲法課老師今天點了阿哲兩次。整桌都在學那個語氣。）'&&y1.seq.length>6&&y1.seq.slice(5).filter(Boolean).length===1,J(y1.seq));
  check('B5. 記在 G.flags.ndlTalkOnce（key＝id）',['nt_y1_menu','nt_y1_sticky','nt_y1_range','nt_y1_nap','nt_y1_bball','nt_y1_const'].every(k=>typeof y1.flags.ndlTalkOnce[k]==='number'),J(y1.flags.ndlTalkOnce));
  const y3=await season(['Y3S1']), p3=y3.seq.filter(Boolean);
  check('B5. 大三上（只有一則）：第一個桌遊夜演明軒那一則，之後每一次都不演（原本每次都演同一則）',J(p3)===J(['（明軒把新的盒子翻過來，看背面的人數。）'])&&y3.seq[0]===p3[0]&&y3.seq.length>=3,J(y3.seq));
  const old=await season(['Y1S1'],{ndlTalkN:{Y1:3},ndlTalkOnce:{h503_zhe_garlic:100}});
  check('B5. 舊存檔（ndlTalkN 記到第 4 則、ndlTalkOnce 只有 heard3d.js 那一則）：沒有演過的紀錄＝從第 4 則開始、每一則各一次；heard3d.js 那一則照舊不演',
    old.seq[0]==='（芯慈一坐下就趴在桌上。）'&&new Set(old.seq.filter(Boolean)).size===old.seq.filter(Boolean).length&&old.flags.ndlTalkOnce.h503_zhe_garlic===100,J(old.seq));
});

/* ---------- C1 D14「海風與燈」---------- */
await sec('C1',async()=>{
  const sp=TRIP.spot('D14'), lt=sp&&sp.points.find(p=>p.id==='D14.lights'), ss=sp&&sp.points.find(p=>p.id==='D14.sunset');
  /* AA_686 第 5 項（企劃線 1df3c189e，AA-C 定 D109）：源稿補了這一項（night:true、一個人的旁白兩句），匯入工具的 EXTRA（nightOf、沒有句子）拿掉——下面幾項照新的（本身的測試在 tests/aa686_fix3_unit.js）*/
  check('C1. D14 有「海風與燈」那一項（接在「海風與夕陽」後面、取代它：AA_686 第 5 項起源稿寫 night:true、有一個人的旁白兩句）；名稱照稿',!!lt&&lt.label==='海風與燈'&&lt.night===true&&!lt.nightOf&&(lt.lines||[]).length===2&&sp.points.indexOf(lt)===sp.points.indexOf(ss)+1&&!lt.sunset&&lt.outdoor===true&&inDoc('換成「海風與燈」那一項'),J(lt));
  const W=(ENC_WALK.walk||[]).find(q=>q.who===YT&&q.spot==='D14'&&q.act==='D14.lights'), Ws=(ENC_WALK.walk||[]).find(q=>q.who===YT&&q.spot==='D14'&&q.act==='D14.sunset');
  check('C1. 她的兩句照稿：朋友「橋上的燈亮了。要拍的話就是現在。」、交往中「你站過去一點。好，不要動。」（和夕陽版同一句）',!!W&&J(W.friend)===J(['橋上的燈亮了。要拍的話就是現在。'])&&J(W.dating)===J(['你站過去一點。好，不要動。'])&&J(W.dating)===J(Ws.dating)&&inDoc('語彤：橋上的燈亮了。要拍的話就是現在。')&&inDoc('語彤：你站過去一點。好，不要動。'),J(W));
  /* 選單：同行（或一個人）在 D14，看第一個選單有什麼；選「海風與燈」就照演 */
  const menu=async(k,h,tier,o)=>{ o=o||{}; fresh(k,h,'dorm',Object.assign({WISH_DONE_heroine_03:true},tier==='dating'?{dating_heroine_03:true}:{})); H.FRIEND(YT); if(tier==='dating') H.CLOSE(YT); if(o.rain) H.G.weather='rain';
    H.G.trip={spot:'D14',depart:h,arrive:h,done:o.done||[],walk:0,photo:false,p:[CLS.periodAt(h)],from:'dorm',said:true,with:tier?{who:YT,tier}:null};
    const menus=[]; const ch=GM.choose; let n=0; GM.choose=async O=>{ n++; if(n===1){ menus.push(O.map(x=>({t:x.t,hint:x.hint,dim:!!x.dim}))); const i=o.pick?O.findIndex(x=>x.t===o.pick):-1; if(i>=0) return i; }
      const b=O.findIndex(x=>x.t==='回去'); if(b>=0) return b; const g=O.findIndex(x=>x.t==='回公館'); return g>=0?g:0; };
    H.said=[]; try{ await TRIP.loop(GM); } finally { GM.choose=ch; }
    const m=menus[0]||[]; return {lab:m.map(x=>x.t),pt:x=>m.find(y=>y.t===x)||null,said:H.said.map(s=>(s.who?s.who+'：':'')+s.t)}; };
  const sayIs=(L,t)=>L.some(x=>/語彤：/.test(x)&&x.endsWith('：'+t));   /* 同行的台詞用人物的全名（encounter3d.js ESAY）*/
  const w=await menu('2026-02-01',18,'friend');
  check('C1. 寒假的週日 18:00、和語彤一起（朋友）：選單有「海風與燈」（可以選）、沒有「海風與夕陽」',!!w.pt('海風與燈')&&!w.pt('海風與燈').dim&&!w.pt('海風與夕陽'),J(w.lab));
  const wp=await menu('2026-02-01',18,'friend',{pick:'海風與燈'});
  check('C1. 選「海風與燈」：旁白（AA_686 第 5 項，第一次來那一句，同其他互動點同行也照演）→ 語彤「橋上的燈亮了。要拍的話就是現在。」，之後她先走（離開那一句照舊）',sayIs(wp.said,'橋上的燈亮了。要拍的話就是現在。')&&wp.said[0]===lt.lines[0]&&wp.said[1].endsWith('橋上的燈亮了。要拍的話就是現在。')&&!wp.said.some(t=>/太陽落進海裡|夕陽/.test(t)),J(wp.said));
  const wd=await menu('2026-02-01',18,'dating',{pick:'海風與燈'});
  check('C1. 交往中：「你站過去一點。好，不要動。」',sayIs(wd.said,'你站過去一點。好，不要動。')&&!sayIs(wd.said,'橋上的燈亮了。要拍的話就是現在。'),J(wd.said));
  const solo=await menu('2026-02-01',18,null);
  check('C1. 一個人來（寒假 18:00）：AA_686 第 5 項起也出「海風與燈」（可以選）、沒有「海風與夕陽」（原本夕陽那一項灰掉、沒有這一項）',!!solo.pt('海風與燈')&&!solo.pt('海風與燈').dim&&!solo.pt('海風與夕陽'),J(solo.lab));
  const su=await menu('2026-07-12',18.3,'friend'), sn=await menu('2026-07-12',19.2,'friend');
  check('C1. 暑假：日落以前（18:18）照舊「海風與夕陽」、沒有「海風與燈」；日落以後（19:12）也換「海風與燈」',!!su.pt('海風與夕陽')&&!su.pt('海風與夕陽').dim&&!su.pt('海風與燈')&&!!sn.pt('海風與燈')&&!sn.pt('海風與夕陽'),J([su.lab,sn.lab]));
  const rn=await menu('2026-02-01',18,'friend',{rain:true}), dn=await menu('2026-07-12',19.2,'friend',{done:['D14.sunset']});
  check('C1. 下雨（夕陽那一項灰掉「下雨」）、已經看過夕陽（做過了）：不換，夕陽那一項照原本灰掉',!!rn.pt('海風與夕陽')&&rn.pt('海風與夕陽').hint==='下雨'&&!rn.pt('海風與燈')&&!!dn.pt('海風與夕陽')&&dn.pt('海風與夕陽').hint==='做過了'&&!dn.pt('海風與燈'),J([rn.lab,dn.lab]));
  check('C1. 所有同行台詞的互動點都在景點上（海風與燈 在 D14 的點裡）',!(ENC_WALK.walk||[]).some(q=>q.act!=='walk'&&!(TRIP.spot(q.spot)&&TRIP.spot(q.spot).points.some(p=>p.id===q.act))));
  check('C1. free_trips.js 是匯入工具產生的：AA_686 第 5 項起這一項從源稿 spots_v3.json@1df3c189e 匯入（tools/freetrip/import_spots.py 的 EXTRA 拿掉；重匯不會不見）',!/EXTRA = \{/.test(src('tools/freetrip/import_spots.py'))&&/spots_v3\.json@1df3c189e/.test(FREE_TRIPS.source)&&!/AA_685 C1（D14\.lights）/.test(FREE_TRIPS.source));
});

/* ---------- 換字表 ---------- */
await sec('fix',()=>{
  const ig=src('tools/story/import_guard.py'), al=src('tests/alison.js');
  const li=(ig.match(/for fn in \(([^)]*)\)/)||[])[1]||'', la=(al.match(/for\(const fn of \[([^\]]*)\]/)||[])[1]||'';
  const A=[...li.matchAll(/'([a-z0-9_]+\.json)'/g)].map(m=>m[1]), B=[...la.matchAll(/'([a-z0-9_]+\.json)'/g)].map(m=>m[1]);
  check('fix. aa685_fix.json 在 import_guard.py read_fix、tests/alison.js 兩份清單裡、排在 aa683_fix.json 後面，兩份一樣',A.length>0&&J(A)===J(B)&&A[A.length-1]==='aa685_fix.json'&&A[A.length-2]==='aa683_fix.json',J([A.slice(-3),B.slice(-3)]));
  const F=JSON.parse(src('tools/story/aa685_fix.json')), game=ORDER.concat(['src/data/date_wish.js']).filter(f=>fs.existsSync(path.join(H.ROOT,f))).map(src).join('\n');
  const miss=F.pairs.filter(([a,b])=>!b.replace(/^旁白：/,'').split('／').map(x=>x.replace(/^「|」$/g,'')).every(x=>game.includes(x)));
  check('fix. 每一對的新字都在遊戲裡（旁白那幾對去掉「旁白：」；稿的格子「」／分開看）；新字不含舊字（讀兩次不會換兩次）',F.pairs.length>=10&&!miss.length&&F.pairs.every(([a,b])=>!b.includes(a)),J(miss));
  const r=require('./alison.js'), old='（燒臘店還開著。牆上的紅紙又多了好幾張。）';
  check('fix. 讀稿換字串起來：AA_612 以前的「（麵店還開著。…）」→ 燒臘店（aa612）→ 一盞茶屋（aa685）',r.ndl('（麵店還開著。牆上的紅紙又多了好幾張。）')==='（一盞茶屋還開著。吧檯最旁邊那個位子空著。）'&&r.ndl('店休。阿姨說等開店，第一碗留給你。')==='茶屋初四開。蘇姨說第一壺留給你。'&&r.ndl(old)!==old);
});

H.done();
})();
