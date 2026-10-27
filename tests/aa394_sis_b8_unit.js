// AA_394 學姊第八批：大二整年＋兩個暑假（企劃線 e81a1afe1；任務 SIS-B8-L-1023；D111）——不需要瀏覽器。
//   0  逐字對稿、新檔載得到、說話前接演包了這一層
//   1  有約的三場：8/12 → 8/14 Café（「我已經排好了」也排、「不行」＝8/14 20:00 一句）；11/4 → 11/6 自助餐（交往中最後一句不同）；7/20 → 7/22 研究室（「不行」＝7/25 一則、mail）
//   2  說話前接演五場：法圖、週三、指定週次與時間；2-3 要 AA_386 1-2 演過、不同一天；3-1 經濟系念完的才有第一個選項；教她的那一版之後 Café 熱拿鐵；3-3 那天她在法圖到 21:45
//   3  同一天只演一場；前任、只是認識、人在國外：都沒有
// 修改前（開發分支 c90fc5187）：沒有 src/sis_b8_3d.js（全部 FAIL）。用法：node tests/aa394_sis_b8_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H, ID='heroine_05', J=JSON.stringify;
const L3=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); return true; };
for(const f of ['src/data/sis_y2y3_events.js','src/sis_y2y3_3d.js','src/data/sis_b4_events.js','src/sis_b4_3d.js','src/data/sis_jp_events.js','src/sis_jp3d.js']) L3(f);
const ok1=L3('src/data/sis_b8_events.js'), ok2=L3('src/sis_b8_3d.js');
const D=k=>STORY.dayOfKey(k), T=(d,h)=>d*24+h, keyOf=d=>CALENDAR.dateOf(d).key;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,2).join(' / ')); } };
const has=t=>H.said.some(x=>x.t===t), idx=t=>H.said.findIndex(x=>x.t===t), seq=a=>a.every((t,i)=>idx(t)>=0&&(i===0||idx(t)>idx(a[i-1])));
const th=()=>(H.G.msgs||[]).filter(m=>m.th==='p:'+ID).map(m=>m.text);
const X=()=>typeof SISB8!=='undefined'?SISB8:null;
const fresh=(key,h,lv,flags)=>{ const G=H.fresh(key,h,'dorm',Object.assign({EXCHANGE_ROUTE:'TW',EXCH_RULE:1,met_sis:true,SIS_W1:true},flags||{})); (H[lv||'FRIEND'])(ID); G.contacts={[ID]:G.day-60}; G.outings=[]; G.acts={att:{}}; H.at(key,h); return G; };
const ph=()=>{ X().phone(H.G); PHONE.tick(H.G); };
const goOut=async(id,picks)=>{ const q=OUT.get(H.G,id); H.said=[]; H.opts=[]; H.picks=picks||[]; if(!q) return false; q.state='planned'; await OUT.go(GM,q); return true; };
const talk=async(key,h,zone,picks)=>{ H.at(key,h); H.G.zone=zone||'lawlib'; H.said=[]; H.opts=[]; H.picks=picks||[]; return SISY23.preTalk(GM); };

(async()=>{
let doc=''; try{ doc=cp.execSync('git show e81a1afe1:"docs/story_planning/AA_394_學姊第八批_大二整年與兩個暑假.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc=''; }
await sec(0,()=>{ const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
  check('0. 新檔載得到、index.html 接在 sis_jp3d.js 後面',ok1&&ok2&&!!X()&&/sis_jp3d\.js\?v=[^"]+"><\/script>\n<script src="src\/data\/sis_b8_events\.js\?v=[^"]+"><\/script>\n<script src="src\/sis_b8_3d\.js\?v=[^"]+"><\/script>/.test(html));
  const all=J(SISB8_EVENTS)+J(SISB8_LINES), q=[...all.matchAll(/text":"([^"]+)"/g)].map(m=>m[1]).concat(Object.values(SISB8_LINES).flat().filter(x=>typeof x==='string'));
  const notIn=[...new Set(q)].filter(t=>doc.indexOf(t.replace(/^「|」$/g,''))<0&&!['兩點半 Café','公館・自助餐','霖澤館・研究室','我大一的時候，我的學姊也請過我。'].includes(t));   /* 「我大一的時候，我的學姊也請過我。」：AA_470 4-3（企劃線 5f54b6545）換掉的那一句 */
  check('0. 每一句台詞、選項都在稿裡（一字不差）',!!doc&&!notIn.length,J(notIn));
  check('0. SISY23.preTalk 包了這一層（_sisb8），前面幾層的記號還在',!!SISY23.preTalk._sisb8&&!!SISY23.preTalk._sisb4&&!!SISY23.preTalk._sisjp); });
/* ---- 1 ---- */
await sec(1,async()=>{ fresh('2026-08-12',20); H.at('2026-08-12',21); ph(); const a=(H.G.msgs||[]).find(m=>m.ask&&m.ask.id==='sisb8_course_ask');
  check('1. 8/12 21:00「選課系統下禮拜開。」「週五下午三點，Café。課表帶來，我幫你看。」三個回覆',J(th())===J(['選課系統下禮拜開。','週五下午三點，Café。課表帶來，我幫你看。'])&&!!a&&J(a.ask.opts.map(o=>o.t))===J(['好。','我已經排好了。','那天不行。']));
  PHONE.answer(H.G,'sisb8_course_ask',1); ph(); PHONE.tick(H.G); const q=OUT.get(H.G,'sisb8_course');
  check('1. 「我已經排好了。」→「那帶來給我看。排好的最需要看。」；排 8/14（五）15:00 Café',th().includes('那帶來給我看。排好的最需要看。')&&!!q&&keyOf(q.day)==='2026-08-14'&&q.h===15&&CALENDAR.dateOf(q.day).wd===5,J(q));
  const r0=Object.assign({},SOCIAL.rel(ID)); H.at('2026-08-14',14.6); await goOut('sisb8_course',[0]); const r1=SOCIAL.rel(ID);
  check('1. 選課那一場照稿；「那堂很好過。」→「好過，可是你起不來。……我說錯了嗎？」祐廷「……沒有。」；SIS_COURSE_Y2、熟悉 +2',seq(['（她把你的課表印出來，用紅筆在上面畫。）','債總選周老師那班。他會點人，你會被逼著想。','好過，可是你起不來。……我說錯了嗎？','……沒有。','剩下的你自己決定。我只看我看得出來的。'])&&H.G.flags.SIS_COURSE_Y2===true&&r1.fam-r0.fam===2,J(H.said.map(x=>x.t)));
  fresh('2026-08-12',21); ph(); PHONE.answer(H.G,'sisb8_course_ask',2); ph(); H.at('2026-08-14',20); ph();
  check('1. 「那天不行。」→「好。截圖傳給我。」；8/14 20:00「債總選周老師那班。他會點人，你會被逼著想。」；不排出遊',th().includes('好。截圖傳給我。')&&th().includes('債總選周老師那班。他會點人，你會被逼著想。')&&!OUT.get(H.G,'sisb8_course'));
  fresh('2026-11-04',21); ph(); PHONE.answer(H.G,'sisb8_lunch_ask',0); ph(); const ql=OUT.get(H.G,'sisb8_lunch'); H.at('2026-11-06',12); await goOut('sisb8_lunch',[0]);
  check('1. 2-2 11/4 約 → 11/6（五）12:20 公館的自助餐；「債總。」；最後「我大一的時候，我的學姊也請過我。」（AA_470 4-3 換句，原本「下次你當直屬的時候，記得也要請。」）；熟悉 +2 自在 +2',!!ql&&keyOf(ql.day)==='2026-11-06'&&Math.abs(ql.h-(12+20/60))<1e-6&&has('對。債總是第一個讓人覺得自己不會讀書的科目。……過了就好了。')&&has('我大一的時候，我的學姊也請過我。')&&!has('下次你當直屬的時候，記得也要請。')&&H.G.flags.SIS_LUNCH_Y2===true,J(H.said.map(x=>x.t)));
  fresh('2026-11-06',12,'FRIEND'); H.date(ID); OUT.plan(H.G,{id:'sisb8_lunch',ev:'ev_sis_lunch_y2',day:D('2026-11-06'),h:12.33,place:'x',title:'x',travel:'',travelH:0}); await goOut('sisb8_lunch',[1]);
  check('1. 2-2 交往中：最後一句「……下次你請。」',has('……下次你請。')&&!has('下次你當直屬的時候，記得也要請。')&&!has('我大一的時候，我的學姊也請過我。'));
  fresh('2026-11-04',21); ph(); PHONE.answer(H.G,'sisb8_lunch_ask',1); ph(); check('1. 2-2「那天不行。」→「好。下次。」，不排',th().includes('好。下次。')&&!OUT.get(H.G,'sisb8_lunch'));
  fresh('2027-07-20',21); ph(); PHONE.answer(H.G,'sisb8_ch1_ask',1); ph(); const qc=OUT.get(H.G,'sisb8_ch1'); H.at('2027-07-22',14.6); await goOut('sisb8_ch1',[1]);
  check('1. 第 4 節「我看得懂嗎？」→「看不懂的地方，就是我要改的地方。」；7/22（四）15:00 研究室；「其他的都看得懂。」→「看得懂不夠。……你想讀下去嗎？」「想。」「好。」；SIS_CH1_READ went',th().includes('看不懂的地方，就是我要改的地方。')&&!!qc&&keyOf(qc.day)==='2027-07-22'&&seq(['看得懂不夠。……你想讀下去嗎？','想。','好。'])&&H.G.flags.SIS_CH1_READ==='went',J(H.said.map(x=>x.t)));
  fresh('2027-07-20',21); ph(); PHONE.answer(H.G,'sisb8_ch1_ask',2); ph(); H.at('2027-07-25',21); ph();
  check('1. 第 4 節「那天不行。」→「好。我寄給你，看不懂的劃起來。」；7/25「收到了。你劃的三個地方，我改了兩個。」；SIS_CH1_READ mail',th().includes('好。我寄給你，看不懂的劃起來。')&&th().includes('收到了。你劃的三個地方，我改了兩個。')&&H.G.flags.SIS_CH1_READ==='mail'&&!OUT.get(H.G,'sisb8_ch1')); });
/* ---- 2 ---- */
await sec(2,async()=>{ fresh('2026-10-14',19,'FRIEND');
  const a0=await talk('2026-10-14',19.4), a1=await talk('2026-10-14',19.5,'cafe'), a2=await talk('2026-10-14',19.5,'lawlib',[0]);
  check('2. 2-1 大二上第 5 週週三 19:30 以後在法圖：找判決（19:24 不演、Café 不演）；「為什麼要看前後兩審？」；SIS_DB_TAUGHT',!a0&&!a1&&a2===true&&has('你們刑分的報告要找判決吧。……坐。')&&has('一份判決只是結果。前後放在一起，才看得出來誰在哪裡改變了想法。')&&H.G.flags.SIS_DB_TAUGHT===true,J([a0,a1,a2]));
  fresh('2026-12-09',19.5,'FRIEND'); await talk('2026-12-09',19.6); const b0=!!H.G.events.done.ev_sis_adv_exch&&!H.G.events.done.ev_sis_ta_papers; const b1=await talk('2026-12-09',19.7);
  H.G.events.last.ev_sis_adv_exch=H.G.day-7; const b2=await talk('2026-12-09',19.8,'lawlib',[1]);
  check('2. 2-3 第 14 週：AA_386 1-2 還沒演＝先演 1-2（sis_b4），同一天不再演；下一次「右邊。」→「嗯。右邊寫得比較像在跟人講話。」「謝謝。……這不算洩題，你們大二早就考過了。」',b0&&b1!==true&&b2===true&&has('嗯。右邊寫得比較像在跟人講話。')&&has('謝謝。……這不算洩題，你們大二早就考過了。')&&H.G.flags.SIS_TA_PAPERS===true,J([b0,b1,b2]));
  fresh('2027-03-10',19.5,'FRIEND',{Y0_LEFT:D('2024-10-17')}); await talk('2027-03-10',19.6,'lawlib',[0]);
  check('2. 3-1 大二下第 3 週，經濟系念完的：兩個選項，「（講給她聽…）」→「好。我懂了。……我欠你一杯咖啡。」；SIS_ECON_GRAPH taught',H.opts[0]&&H.opts[0].length===2&&has('好。我懂了。……我欠你一杯咖啡。')&&H.G.flags.SIS_ECON_GRAPH==='taught',J(H.opts));
  const c0=await talk('2027-03-10',20,'cafe'); const c1=await talk('2027-03-11',14,'cafe');
  check('2. 教她的那一版：之後（不是同一天）第一次在 Café 找她說話「（桌上多一杯熱拿鐵。她說：『上次的。』）」',!c0&&c1===true&&has('（桌上多一杯熱拿鐵。她說：『上次的。』）'),J([c0,c1]));
  fresh('2027-03-10',19.5,'FRIEND'); await talk('2027-03-10',19.6,'lawlib',[0]);
  check('2. 3-1 沒念過經濟系那一年：只有「我也忘得差不多了。」→「那一起看。」；together',H.opts[0]&&H.opts[0].length===1&&H.opts[0][0]==='「我也忘得差不多了。」'&&has('那一起看。')&&H.G.flags.SIS_ECON_GRAPH==='together',J(H.opts));
  fresh('2027-04-07',19.5,'FRIEND'); await talk('2027-04-07',19.6,'lawlib',[0]); const topicFirst=!!H.G.events.done.ev_sis_topic&&!H.G.events.done.ev_sis_old_notes;
  await talk('2027-04-14',19.6,'lawlib',[1]);
  check('2. 3-2 第 7 週那天先演了 AA_379 2-3（ev_sis_topic）＝下一個週三（第 8 週）才演',topicFirst&&!!H.G.events.done.ev_sis_old_notes,J(H.said.map(x=>x.t)));
  fresh('2027-04-07',19.5,'FRIEND'); SOCIAL.remember(ID,'SIS_TOPIC',''); H.G.events.done.ev_sis_topic=1; H.G.events.last.ev_sis_topic=H.G.day-7; await talk('2027-04-07',19.6,'lawlib',[1]);
  check('2. 3-2 第 7 週：「我大二債各的筆記。字很醜。」→「考完還妳。」→「不用還。……傳給你下一個直屬。」；SIS_OLD_NOTES、記憶',has('我大二債各的筆記。字很醜。')&&has('不用還。……傳給你下一個直屬。')&&H.G.flags.SIS_OLD_NOTES===true&&SOCIAL.has(ID,'SIS_OLD_NOTES'));
  const sch=CHARACTERS.heroine_05.daily_schedule.find(r=>r.dates&&J(r.dates)===J([['2027-05-26','2027-05-26']]));
  fresh('2027-05-26',21,'FRIEND'); const d0=await talk('2027-05-26',21.2); const r0=Object.assign({},SOCIAL.rel(ID)); const d1=await talk('2027-05-26',21.5,'lawlib',[0]); const r1=SOCIAL.rel(ID);
  check('2. 3-3 第 14 週週三：那天她在法圖到 21:45（作息）；21:30 以後才演；裝熱水 →「……熱水。」…；自在 +3、她的戀愛 +1；water',!!sch&&sch.zone==='lawlib'&&sch.to===21.75&&!d0&&d1===true&&has('……熱水。')&&H.G.flags.SIS_HOT_WATER_BACK==='water'&&r1.comf-r0.comf===3&&r1.npcRom-r0.npcRom===1&&!has('（她把你的手拉過去，在手背上寫了一個『謝』，用手指。）'),J([d0,d1]));
  fresh('2027-05-26',21.5,'FRIEND'); H.date(ID); await talk('2027-05-26',21.5,'lawlib',[0]); check('2. 3-3 交往中：多「（她把你的手拉過去，在手背上寫了一個『謝』，用手指。）」',has('（她把你的手拉過去，在手背上寫了一個『謝』，用手指。）'));
  fresh('2027-05-26',21.5,'FRIEND'); await talk('2027-05-26',21.5,'lawlib',[1]); check('2. 3-3 敲桌子：「……我沒睡。我在想第二節。」；knock',has('……我沒睡。我在想第二節。')&&H.G.flags.SIS_HOT_WATER_BACK==='knock'); });
/* ---- 3 ---- */
await sec(3,async()=>{ fresh('2026-10-14',19.5,'FRIEND'); H.G.events.done.ev_sis_topic=1; H.G.events.last.ev_sis_topic=H.G.day; const a=await talk('2026-10-14',19.6);
  check('3. 同一天她已經有別的說話前接演（例：ev_sis_topic）：這裡不演',a!==true);
  for(const [nm,f] of [['前任',G=>{ G.flags.EX_heroine_05=true; }],['只是認識',G=>{ SOCIAL.rel(ID).fam=5; SOCIAL.rel(ID).trust=0; }]]){ fresh('2026-10-14',19.5,'FRIEND'); f(H.G); const r=await talk('2026-10-14',19.6); H.at('2026-11-04',21); ph();
    const mine=['ev_sis_db_taught','ev_sis_ta_papers','ev_sis_econ_graph','ev_sis_old_notes','ev_sis_hot_water_back'].filter(id=>H.G.events.done[id]);
    check('3. '+nm+'：這一批的說話前接演、私訊都沒有',!mine.length&&!(H.G.msgs||[]).some(m=>/^sisb8_/.test(m.tag||'')),J({r,mine})); } });
H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
