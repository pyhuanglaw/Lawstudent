// AA_532 寒暑假（一）（企劃線 ade80d22f；任務 AA532-VAC-FIX-1030；D99 第二優先）——不需要瀏覽器。用法：node tests/aa532_vac_unit.js
//   0  新句都在 AA_532 稿裡（一字不差）；以安的假期計畫在 AA_244 第 1 節（2d3a0735d）；白名單有 AA_532
//   1  除夕前一天～初三七位都不主動約（約的那一天、送出的那一天）；裂縫談話的「顧店」看麵店店休
//   2-1 2027、2029 除夕 18:30 在家的年夜飯（快轉／睡覺停在 18:30）；2-2 四年初一 08:00 家人群組；2-3 麵店團初一 2028、2029；2-4 以安交往中除夕 22:00；2-5 2027 元宵
//   3  她們主動約你的放假版七句、學姊放假改下午；芷若校外答應「好！那到時候見。」（日常照舊）
//   4  留宿舍的寒暑假週四家人群組（回家住的不發）；父親節三年（2028 人在美國照時差）；端午 2026（人不在家才傳）
//   5  子晴 C15：AA-B 10-30 05:12 選 A＝照 AA_525（AA_532 第 5 節作廢；三場的台詞看 tests/aa525_promises_unit.js 1-2）
//   8  AA-B 10-30 05:12 十四點的第 1、5、7 點：學姊放假平日照學期中（總圖五點以後）、週末下午；留宿舍週四爸爸的「？」quiet、除夕～初五不傳；京都交往版的回覆不重複「分班考分的。」
//   6  京都 C12 和以安交往中第一堂換版；曼谷 T03 和子晴交往中多兩處
//   7  總圖兩句、「我還在念書。」、以安的假期計畫（第 15 週週五 21:00 私訊／群組、交往中多問一句）
// 修改前（d531b973f）FAIL 的：除了 0 的「稿讀得到」，全部。
// 2026-10-30 AA_539 1-3（企劃線 c9f6dd6cb，SIS-LEAD-1021）：2026-06-30～09-20 學姊學生證停了、總圖改約慢讀——3、8-1 的學姊總圖改查 2027 暑假（日期以外不變）。
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H, J=JSON.stringify;
const loadG=(f)=>{ const s=fs.readFileSync(path.join(H.ROOT,f),'utf8').replace(/^const ([A-Z_][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); };
let loadErr='';
for(const f of ['src/holff3d.js','src/noodle_closed3d.js','src/data/heroine_asks.js','src/heroine_asks3d.js','src/data/vacfill_events.js','src/data/cracktalk_lines.js','src/cracktalk3d.js']){ try{ loadG(f); }catch(e){ loadErr+=f+'：'+String(e&&e.message||e)+'　'; } }
const git=(ref,p)=>{ try{ return cp.execSync('git -c core.quotepath=false show '+ref+':"'+p+'"',{cwd:H.ROOT,encoding:'utf8',maxBuffer:1<<26}); }catch(e){ return ''; } };
const A532='docs/story_planning/AA_532_D99寒暑假一_過年期間別約_除夕年夜飯_家人群組_她們的放假版.md';
const doc=git('ade80d22f',A532), doc244=git('2d3a0735d','docs/story_planning/AA_244_以安假期計畫_出國旅遊台詞.md');
check('0. AA_532（ade80d22f）、AA_244（2d3a0735d）讀得到；新模組都載得到',doc.length>3000&&doc244.length>3000&&!loadErr,loadErr||'git fetch origin claude/cool-heisenberg-o8kuqx');
const D=H.D, T=(d,h)=>d*24+h, wd=d=>CALENDAR.dateOf(d).wd%7;
const at=(d,h)=>{ H.G.day=d; H.G.hour=h; H.G.weekday=wd(d); };
const strip=t=>String(t).replace(/^「(.*)」$/,'$1');
const notIn=(L,src)=>L.filter(t=>!src.includes(strip(t)));
const has=typeof HOLFF!=='undefined'&&!!HOLFF.CNY_FAM;

/* ================= 0 新句都在稿裡 ================= */
{ const L=[];
  if(typeof HASK_DATA!=='undefined') for(const p of Object.values(HASK_DATA.people)){ if(p.yesOut) L.push(p.yesOut); for(const e of p.daily.concat(p.out)) for(const v of ['pre','dat']) if(e[v]&&e[v].vac) L.push(e[v].vac.line); }
  if(has){ for(const y in HOLFF.CNY_FAM) for(const [,t] of HOLFF.CNY_FAM[y]) L.push(t); for(const y in HOLFF.CNY_NOODLE){ const C=HOLFF.CNY_NOODLE[y]; for(const [,t] of C.ms) L.push(t); for(const o of C.opts){ L.push(o.t); for(const [,t] of o.say) L.push(t); } }
    for(const y in HOLFF.AN_EVE) L.push(...HOLFF.AN_EVE[y]); L.push(HOLFF.LANTERN.card); for(const [,t] of HOLFF.LANTERN.dorm) L.push(t);
    for(const y in HOLFF.FATHER){ for(const [,t] of HOLFF.FATHER[y].ms) L.push(t); const o=HOLFF.FATHER[y].opt; if(o){ L.push(o.t,o.post); for(const [,t] of o.say) L.push(t); } } for(const [,t] of HOLFF.DRAGON.ms) L.push(t);
    for(const e of HOLFF.EVENTS.filter(x=>/^ev_aa532_/.test(x.id))) for(const s of e.dialogue){ if(s.text) L.push(s.text); if(s.choice) for(const c of s.choice) L.push(c.text); } }
  /* 子晴 C15 不算：AA-B 10-30 05:12 選 A（照 AA_525），AA_532 第 5 節作廢 */
  L.push('在總圖。暑假人很少。','（寒假的總圖人很少。你五點出來的時候，天已經黑了。）','我還在念書。','工作室在信義區。……週末我還是回公館。','（回旅館的路上，阿凱走在前面。子晴的手指勾了一下你的。）','……他看不到。','（休息時間，以安在走廊等你。她在中級班。）','分班考分的。我中級，你初級。','……下課我在這裡等你。');
  const bad=notIn(L,doc);
  check('0. 新句都在 AA_532 稿裡（一字不差；'+L.length+' 句）',has&&L.length>=90&&!bad.length,J(bad));
  const L2=[]; if(has){ for(const X of Object.values(HOLFF.AN_PLAN)){ L2.push(X.short,X.r1); if(X.o1) L2.push(X.o1); if(X.r3) L2.push(X.r3); } L2.push('我也想報。','好，加油。','那我們那邊見？',HOLFF.AN_ASK,HOLFF.AN_ASK_OK,HOLFF.AN_ASK_NONE,HOLFF.AN_ASK_LATER); }
  check('0. 以安假期計畫的句子都在 AA_244 第 1 節（'+L2.length+' 句）',L2.length>=25&&!notIn(L2,doc244).length,J(notIn(L2,doc244)));
  const A=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files.find(e=>e.path===A532);
  check('0. 白名單有 AA_532（ade80d22f、approved、AA-B 定稿（D109）、任務 AA532-VAC-FIX-1030）',!!A&&A.sha==='ade80d22f'&&A.status==='approved'&&A.approvedBy==='AA-B 定稿（D109）'&&A.task==='AA532-VAC-FIX-1030',J(A)); }

/* ================= 1 過年不約、店休不顧店 ================= */
const friend=(id,o)=>{ const r=SOCIAL.rel(id); Object.assign(r,{fam:45,trust:30,comf:10,npcRom:0,rom:0},o||{}); SOCIAL.remember(id,'FIRST_MET',''); H.G.contacts[id]=H.G.day-30; };
const fresh=(k,h,flags,zone)=>{ const G=H.fresh(k,h,zone||'dorm',flags); INV.rec(G); if(!G.contacts) G.contacts={}; if(!Array.isArray(G.trips)) G.trips=[]; return G; };
const HAS_HASK=typeof HASK!=='undefined';
{ fresh('2026-02-10',9); const P=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan','kexin'];
  const res={}; for(const [y,eve] of [[2026,'2026-02-16'],[2027,'2027-02-05'],[2028,'2028-01-25'],[2029,'2029-02-12']]){ const e=D(eve); res[y]=[e-2,e-1,e,e+3,e+4].map(d=>P.map(id=>HAS_HASK?HASK.block(H.G,id,d):'?').every(x=>x==='cny')?'cny':'ok'); }
  check('1. HASK.block：除夕前一天～初三七位都是 cny（除夕前兩天、初四不是）',HAS_HASK&&Object.values(res).every(r=>J(r)===J(['ok','cny','cny','cny','ok'])),J(res));
  /* 原本：學姊 2026-02-15 約「明天五點以後，總圖三樓」＝除夕 17:30 */
  fresh('2026-02-15',13); friend('heroine_05'); const c=HAS_HASK?HASK.candidates(H.G,H.G.day):null;
  check('1. 送出的那一天在過年裡（除夕前一天 2/15）：一則都不傳（原本學姊約除夕 17:30 總圖三樓）',!!c&&c.length===0,J(c&&c.map(x=>[x.id,x.place||x.loc])));
  fresh('2026-02-13',13); friend('heroine_05'); const c2=HAS_HASK?HASK.candidates(H.G,H.G.day).filter(x=>x.day>=D('2026-02-15')&&x.day<=D('2026-02-19')):null;
  check('1. 除夕前三天送、約的那一天落在過年裡的：也不傳',!!c2&&c2.length===0,J(c2));
  const yt=typeof CRACKTALK!=='undefined'&&CRACKTALK.ytShop;
  check('1. 裂縫談話 ytShop：2028 除夕 1/25（週二，店休）不顧店；2/1（週二）照常顧店',!!yt&&yt(H.G,D('2028-01-25'))===false&&yt(H.G,D('2028-02-01'))===true&&yt(H.G,D('2028-01-18'))===true,yt?J([yt(H.G,D('2028-01-25')),yt(H.G,D('2028-02-01'))]):'沒有 CRACKTALK.ytShop'); }

/* ================= 3 放假版的句子 ================= */
const VAC_LINES={an_lib:'放假的總圖人很少。明天下午三點半，二樓靠窗。',sis_lib:'明天下午，總圖三樓。放假了，題目照帶。',sis_lib_dat:'明天下午，總圖三樓。放假，不問題目。'};
{ const pick=(id,place,k,h)=>{ fresh(k,h); friend(id); return HAS_HASK?HASK.candidates(H.G,H.G.day).filter(x=>x.id===id&&x.place===place):[]; };
  const a=pick('heroine_01','library','2026-07-14',13), b=pick('heroine_01','library','2026-03-10',13);
  check('3. 以安總圖：暑假（7/14 傳、7/15 約）用放假版「放假的總圖人很少。…」；學期中照舊「…你帶題目。」',a.length===1&&a[0].v.line===VAC_LINES.an_lib&&a[0].vac===true&&b.length===1&&b[0].v.line==='明天下午三點半，總圖二樓靠窗。我帶憲法筆記，你帶題目。'&&!b[0].vac,J([a.map(x=>x.v.line),b.map(x=>x.v.line)]));
  /* 學姊：週五傳、週六約（平日 9～17 在研究室）。2026-10-30 AA_539 1-3（c9f6dd6cb）：2026-06-30～09-20 她學生證停了、總圖進不去，改約慢讀——放假版改用 2027 暑假查（原本 2026-07-17） */
  const s=pick('heroine_05','library','2027-07-16',13);
  check('3. 學姊總圖放假版：下午（15:30），「明天下午，總圖三樓。放假了，題目照帶。」',s.length===1&&s[0].h===15.5&&s[0].v.line===VAC_LINES.sis_lib,J(s.map(x=>[x.h,x.v.line])));
  fresh('2027-07-16',13); friend('heroine_05'); H.G.flags.dating_heroine_05=true; const sd=HAS_HASK?HASK.candidates(H.G,H.G.day).filter(x=>x.id==='heroine_05'&&x.place==='library'):[];
  check('3. 學姊交往中總圖放假版：下午，「明天下午，總圖三樓。放假，不問題目。」',sd.length===1&&sd[0].h===15.5&&sd[0].v.line===VAC_LINES.sis_lib_dat,J(sd.map(x=>[x.h,x.v.line])));
  /* 排好、傳出去：訊息是放假版（sent 記 vac） */
  fresh('2026-07-14',13); friend('heroine_01'); let rec=null; if(HAS_HASK){ HASK.phone(H.G); rec=HASK.rec(H.G).sent[0]; at(H.G.day,23.9); HASK.phone(H.G); PHONE.tick(H.G); }
  const ivMsg=(H.G.msgs||[]).filter(m=>PHONE.th(m)==='p:heroine_01').map(m=>m.text);
  check('3. 真的傳出去的那一則也是放假版（sent 記 vac:true；INV 的邀約訊息）',!!rec&&rec.vac===true&&ivMsg.some(t=>t.includes(rec.place==='library'?VAC_LINES.an_lib:'Café 整理上學期的筆記')),J({rec,ivMsg}));
  const n=Object.values(HASK_DATA.people).reduce((k,p)=>k+p.daily.concat(p.out).reduce((j,e)=>j+(e.pre&&e.pre.vac?1:0)+(e.dat&&e.dat.vac?1:0),0),0);
  check('3. 放假版一共七處（以安四、語彤一、學姊二）',n===7&&!!HASK_DATA.people.heroine_03.daily.find(e=>e.place==='library').pre.vac,String(n));
  /* 芷若：校外答應＝「好！那到時候見。」、日常照舊 */
  fresh('2026-07-15',13); friend('heroine_02'); const said=()=>(H.G.msgs||[]).filter(m=>PHONE.th(m)==='p:heroine_02').map(m=>m.text);
  if(HAS_HASK){ HASK.answered(H.G,{id:'heroine_02',k:'o',loc:'D04'},'yes'); HASK.answered(H.G,{id:'heroine_02',k:'d',place:'cafe'},'yes'); }
  check('3. 芷若答應：校外「好！那到時候見。」、日常「好！那明天見。」',J(said())===J(['好！那到時候見。','好！那明天見。']),J(said())); }

/* ================= 2-1 除夕的年夜飯 ================= */
const atHome=()=>{ const Hm=HOME.rec(H.G); Hm.at=true; Hm.day=H.G.day; const B=HOME.lawBreak(H.G); Hm.lbreak=B.key; Hm.brk=B.key; Hm.bskip={key:B.key,n:0,last:-1}; };
(async()=>{
  for(const [k,y,pick,want] of [['2027-02-05','y2','比第一年難','難是正常的。（他夾了一塊魚到你碗裡）吃。'],['2029-02-12','y4','不知道','（點了一下頭）我在你這個年紀也不知道。']]){
    fresh(k,18,{},'dorm'); atHome(); const e18=HOME.breakEvent(H.G); at(H.G.day,18.5); const ev=HOME.breakEvent(H.G);
    const stops=has?HOLFF.stops(Object.assign({},H.G,{hour:12}),T(D(k),12)):[];
    check('2-1. '+k+' 除夕：18:00 還沒、18:30 在家＝ev_aa532_eve_'+y+'；快轉／睡覺的停點有 18:30',!(e18&&/^ev_aa532/.test(e18.id))&&!!ev&&ev.id==='ev_aa532_eve_'+y&&(stops||[]).includes(T(D(k),18.5)),J([e18&&e18.id,ev&&ev.id]));
    if(ev){ H.picks=[pick]; await EVENTS.run(ev); const L=H.lines();
      check('2-1. '+k+' 演完：開頭、選「'+pick+'」那一句、會合；只演一次',L.length>=4&&L.some(t=>t.includes(want))&&(y==='y2'?L.includes('媽媽：魚不要吃完，留一點。'):L.some(t=>t.includes('四個紅包')))&&!!H.G.events.done[ev.id]&&!(HOME.breakEvent(H.G)||{id:''}).id.startsWith('ev_aa532'),J(L)); } }
  { fresh('2027-02-05',19,{},'dorm'); const ev=HOME.breakEvent(H.G); fresh('2026-02-16',19,{},'dorm'); atHome(); const e26=HOME.breakEvent(H.G);
    check('2-1. 人不在家（宿舍）不演；2026 除夕照主線 2（不是這一場）',!(ev&&/^ev_aa532/.test(ev.id))&&!(e26&&/^ev_aa532/.test(e26.id)),J([ev&&ev.id,e26&&e26.id])); }

  /* ================= 2-2～2-5 ================= */
  const run=(k,h)=>{ const d=D(k); at(d,h); if(has) HOLFF.phone(H.G); PHONE.tick(H.G); };
  const tagMsgs=tag=>(H.G.msgs||[]).filter(m=>m.tag===tag);
  { const out={}; for(const y of [2026,2027,2028,2029]){ fresh(HOLFF&&HOLFF.CNY1?HOLFF.CNY1[y]:y+'-02-01',7.5); run(H.G.day&&CALENDAR.dateOf(H.G.day).key,8); out[y]=tagMsgs('aa532_cny_fam_'+y).map(m=>m.th+'|'+m.from+':'+m.text); }
    check('2-2. 四年初一 08:00 家人群組（爸爸長輩圖；不用回）',has&&J(out[2026])===J(['g:home|dad:（長輩圖：一匹金色的馬，寫著「馬到成功」）','g:home|sister:爸 我們都在客廳'])&&out[2028].length===3&&out[2027][1]==='g:home|mom:你昨天傳過了'&&out[2029][2]==='g:home|sister:他在廁所傳的'&&[2026,2027,2028,2029].every(y=>tagMsgs('aa532_cny_fam_'+y).every(m=>!m.ask)),J(out)); }
  { const out={}; for(const [y,k] of [[2028,'2028-01-26'],[2029,'2029-02-13']]){ fresh(k,10); PHONE.join(H.G,'noodle_team','麵店團'); run(k,11); const M=tagMsgs('aa532_cny_noodle_'+y); out[y]={n:M.length,opts:(M[M.length-1]||{ask:{opts:[]}}).ask.opts.map(o=>o.t)}; }
    fresh('2028-01-26',10); run('2028-01-26',11); const notIn=tagMsgs('aa532_cny_noodle_2028').length;
    check('2-3. 麵店團初一 11:00：2028 七則、2029 六則，祐廷三選一；不在群組沒有',has&&out[2028].n===7&&J(out[2028].opts)===J(['（傳年夜飯的照片）','洗碗加油。','（貼圖）'])&&out[2029].n===6&&J(out[2029].opts)===J(['最後一個寒假。','（傳書桌的照片）','（貼圖）'])&&notIn===0,J(out));
    fresh('2029-02-13',10); PHONE.join(H.G,'noodle_team','麵店團'); run('2029-02-13',11); PHONE.answer(H.G,'aa532_cny_noodle_2029_reply',1);
    check('2-3. 2029 回「（傳書桌的照片）」→ 以安「你的書桌比我的亂。」',(H.G.msgs||[]).some(m=>m.from==='heroine_01'&&m.text==='你的書桌比我的亂。'&&m.th==='g:noodle_team'),''); }
  { const out={}; for(const y of [2026,2027,2028,2029]){ const eve=D(HOLFF&&HOLFF.CNY1?HOLFF.CNY1[y]:'2026-02-17')-1; fresh(CALENDAR.dateOf(eve).key,21,{dating_heroine_01:true}); run(CALENDAR.dateOf(eve).key,22); out[y]=tagMsgs('aa532_an_eve_'+y).map(m=>m.text); }
    fresh('2027-02-05',21); run('2027-02-05',22); const single=tagMsgs('aa532_an_eve_2027').length;
    check('2-4. 和以安交往中：除夕 22:00 她的私訊（2026～2028；2029 沒有；沒交往沒有）',J(out[2026])===J(['除夕。阿嬤家很吵。','我在樓梯間傳的。新年快樂。'])&&out[2027][1]==='寫到第三張，手就不抖了。……新年快樂。'&&out[2028].length===2&&out[2029].length===0&&single===0,J(out)); }
  { fresh('2027-02-20',17); atHome(); const home=has?HOLFF.cardLine(H.G,T(D('2027-02-20'),18.5)):null, st=has?HOLFF.stops(H.G,T(H.G.day,17)):[]; run('2027-02-20',20.5); const hm=tagMsgs('aa532_lantern_dorm').length;
    fresh('2027-02-20',17); const dorm=has?HOLFF.cardLine(H.G,T(D('2027-02-20'),18.5)):'x', st2=has?HOLFF.stops(H.G,T(H.G.day,17)):[]; run('2027-02-20',20.5); const dm=tagMsgs('aa532_lantern_dorm').map(m=>m.text);
    check('2-5. 元宵：回家住＝18:30 日期卡下面一句（快轉停在那裡）、20:00 不傳；留宿舍＝不停、20:00 家人群組三則',home==='（元宵。媽媽煮了湯圓，芝麻的。你吃了三顆，她說太少。）'&&st.includes(T(D('2027-02-20'),18.5))&&hm===0&&dorm==null&&!st2.includes(T(D('2027-02-20'),18.5))&&J(dm)===J(['今天元宵','📷（一碗芝麻湯圓）','留了一碗 回來吃']),J({home,hm,dorm,dm})); }

  /* ================= 4 家人群組 ================= */
  { fresh('2026-07-16',19); H.G.home={at:false}; HOME.phoneRules(GM); at(H.G.day,20); HOME.phoneRules(GM); PHONE.tick(H.G); const dorm=tagMsgs('home_ask_'+H.G.day);
    fresh('2026-07-16',19); atHome(); at(H.G.day,20); HOME.phoneRules(GM); PHONE.tick(H.G); const home=tagMsgs('home_ask_'+H.G.day);
    fresh('2026-03-12',19); at(H.G.day,20); HOME.phoneRules(GM); PHONE.tick(H.G); const term=tagMsgs('home_ask_'+H.G.day);
    check('4. 留宿舍的暑假週四 20:00 家人群組（會回去／這週不回）；回家住的不發；學期中照舊',dorm.length===1&&!!dorm[0].ask&&J(dorm[0].ask.opts.map(o=>o.t))===J(['會回去','這週不回'])&&home.length===0&&term.length===1,J({dorm:dorm.map(m=>m.text),home:home.length,term:term.length}));
    /* 一整個暑假（留宿舍）幾則 */
    fresh('2026-06-16',10); let n=0; for(let d=D('2026-06-16');d<D('2026-09-07');d++){ if(wd(d)!==4) continue; at(d,20); HOME.phoneRules(GM); PHONE.tick(H.G); if(tagMsgs('home_ask_'+d).length) n++; }
    check('4. 大一暑假留宿舍：每個週四都有（12 則）',n===12,String(n)); }
  { const f={}; for(const y of [2026,2027,2028]){ fresh(y+'-08-08',19); run(y+'-08-08',20); f[y]=tagMsgs('aa532_father_'+y).map(m=>m.from+':'+m.text); }
    fresh('2026-08-08',19); run('2026-08-08',20); PHONE.answer(H.G,'aa532_father_2026_reply',0); const rep=(H.G.msgs||[]).filter(m=>m.th==='g:home').slice(-2).map(m=>m.from+':'+m.text);
    fresh('2028-08-08',2,{EXCHANGE_ROUTE:'US'}); const ab=STORY.abroad(H.G); run('2028-08-08',7.5); const us7=tagMsgs('aa532_father_2028').length; run('2028-08-08',8); const us8=tagMsgs('aa532_father_2028').map(m=>m.h);
    check('4. 父親節 8/8 20:00 三年（2026 可以回「（傳一句「父親節快樂」）」→ 爸爸（讚））',J(f[2026])===J(['sister:爸 父親節快樂','dad:（讚）','mom:你們兩個記得打電話給他'])&&f[2027].length===3&&J(f[2028])===J(['mom:父親節 你們爸說不用打電話 他要加班','sister:他每年都這樣說'])&&J(rep)===J(['player:父親節快樂','dad:（讚）']),J({f,rep}));
    check('4. 2028 人在美國：照時差收（當地 08:00＝臺灣 20:00）',ab&&us7===0&&us8.length===2&&us8[0]===8,J({ab,us7,us8})); }
  { fresh('2026-06-19',11); run('2026-06-19',12); const dorm=tagMsgs('aa532_dragon_2026').map(m=>m.text); fresh('2026-06-19',11); atHome(); run('2026-06-19',12); const home=tagMsgs('aa532_dragon_2026').length;
    check('4. 端午 2026-06-19 12:00：不在家＝媽媽兩則；在家＝不傳',J(dorm)===J(['📷（廚房掛著一串粽子）','南部粽北部粽都有 你回來自己挑'])&&home===0,J({dorm,home})); }

  /* ================= 5 子晴 C15 ================= */
  { const C=TERMEND_LINES.C15, L=k=>Array.isArray(C[k].lines)?C[k].lines.map(x=>x.text||x.narr):[];
    check('5. 子晴 C15 照 AA_525（AA-B 選 A）：zq_demo 是「第三關。橋是新的。」那一版，不是 AA_532 第 5 節的「第三關。改了。」',L('zq_demo').includes('第三關。橋是新的。')&&!L('zq_demo').includes('第三關。改了。')&&L('zq_play2').includes('新的東西。還沒有名字。'),J([L('zq_demo'),L('zq_play2')])); }

  /* ================= 6 交往中換版 ================= */
  { const A=VAC_DATA.A, flat=(lines,G)=>{ const out=[]; for(const x of lines){ const v=typeof x==='function'?x(G):x; if(!v) continue; for(const y of [].concat(v)) out.push(y.text||y.narr); } return out; };
    fresh('2027-08-10',9); SOCIAL.rel('heroine_01').fam=30; SOCIAL.remember('heroine_01','FIRST_MET',''); const k12=A.C12.keys[0], fr=flat(k12.lines,H.G); H.G.flags.dating_heroine_01=true; const dt=flat(k12.lines,H.G);
    check('6-1. 京都第一堂：朋友版「你也來了？」照舊；交往中「分班考分的。我中級，你初級。」「……下課我在這裡等你。」（沒有「你也來了？」）；選項照舊',fr.includes('你也來了？')&&!dt.includes('你也來了？')&&J(dt)===J(['（休息時間，以安在走廊等你。她在中級班。）','分班考分的。我中級，你初級。','……下課我在這裡等你。'])&&J(k12.choice.map(c=>c.t))===J(['「妳是中級喔。」','「下課一起吃飯？」']),J({fr,dt}));
    const K=A.T03.keys; fresh('2028-07-05',9); const f5=flat(K[1].lines,H.G), f6=flat(K[2].lines,H.G); H.G.flags.dating_heroine_04=true; const d5=flat(K[1].lines,H.G), d6=flat(K[2].lines,H.G);
    check('6-2. 曼谷：朋友版照舊；交往中夜市多兩句、最後一晚多一句（阿凱照樣三份炒河粉）',f5.length===2&&f6.length===1&&J(d5.slice(2))===J(['（回旅館的路上，阿凱走在前面。子晴的手指勾了一下你的。）','……他看不到。'])&&d5[0]==='（阿凱一個人吃了三份炒河粉。）'&&J(d6)===J(['回去我就要進工作室了。……先吃這一攤。','工作室在信義區。……週末我還是回公館。']),J({d5,d6})); }

  /* ================= 7 小的 ================= */
  { const V=VACFILL_LINES, dorm=V.POOL&&V.POOL.dorm&&V.POOL.dorm.winter||[];
    check('7. 總圖：柏翰「在總圖。暑假人很少。」（阿哲那句照舊）、寒假摘要「（寒假的總圖人很少。…）」；總圖不再「開到五點」',V.y2_0618.ms[2][1]==='在總圖。暑假人很少。'&&V.y2_0618.ms[3][1]==='……柏翰你是不是不知道什麼叫放假'&&dorm.includes('（寒假的總圖人很少。你五點出來的時候，天已經黑了。）')&&!/總圖[^"]*開到五點/.test(JSON.stringify(V)),'');   /* 法圖「法圖暑假開到五點。」（學姊 7/28）不是總圖，照舊 */
    const d7=HOME_LINES.dinner.find(d=>d.n===7);
    check('7. 晚餐第 7 題選項「我還在念書。」（媽媽的收尾「（笑了一下）先把書念好。」照舊）；home_lines.js 由匯入工具產生（來源寫 AA_532）',!!d7&&d7.opts[0].t==='我還在念書。'&&/笑了一下/.test(d7.dad)&&/AA_532 ade80d22f/.test(HOME_LINES.source)&&!JSON.stringify(HOME_LINES).includes('我才大一'),J(d7)); }
  { const fri=has?HOLFF.anPlanDay('Y1S1'):null, key=fri!=null?CALENDAR.dateOf(fri).key:'2025-12-12';
    fresh(key,20); SOCIAL.rel('heroine_01').fam=30; SOCIAL.remember('heroine_01','FIRST_MET',''); run(key,21); const dm=tagMsgs('aa532_an_plan_Y1S1');
    check('7. 以安假期計畫：大一上第 15 週週五（'+key+'）21:00，熟＝私訊短版「寒假先在總圖，1/20 回台中」；選項「我也會去總圖。」「好，加油。」（這個假期沒有③）',fri!=null&&wd(fri)===5&&CALENDAR.termOf(fri).week===15&&dm.length===1&&dm[0].th==='p:heroine_01'&&dm[0].text==='寒假先在總圖，1/20 回台中'&&J(dm[0].ask.opts.map(o=>o.t))===J(['我也會去總圖。','好，加油。']),J(dm));
    PHONE.answer(H.G,'aa532_an_plan_Y1S1',0); check('7. 選①＝她回「三樓。我通常坐靠窗那排。」、記 AN_PLAN_Y1W＝join',H.G.flags.AN_PLAN_Y1W==='join'&&(H.G.msgs||[]).some(m=>m.from==='heroine_01'&&m.text==='三樓。我通常坐靠窗那排。'),'');
    const k2=CALENDAR.dateOf(HOLFF.anPlanDay('Y2S2')).key; fresh(k2,20); SOCIAL.rel('heroine_01').fam=10; SOCIAL.remember('heroine_01','FIRST_MET',''); PHONE.join(H.G,'noodle_team','麵店團'); run(k2,21); const g=tagMsgs('aa532_an_plan_Y2S2');
    check('7. 不熟（ACQUAINTANCE）、在麵店團：群組短版「七月日檢 八月去京都上語言課」，只有①②',SOCIAL.stage('heroine_01')!=='FAMILIAR'&&g.length===1&&g[0].th==='g:noodle_team'&&g[0].text==='七月日檢 八月去京都上語言課'&&g[0].ask.opts.length===2,J(g.map(m=>[m.th,m.text,m.ask.opts.map(o=>o.t)])));
    fresh(k2,20); SOCIAL.rel('heroine_01').fam=30; SOCIAL.remember('heroine_01','FIRST_MET',''); H.G.flags.dating_heroine_01=true; VAC.signup(H.G,'C12@Y2','yes'); run(k2,21); const q=tagMsgs('aa532_an_plan_Y2S2');
    check('7. 交往中：私訊短版（①②③）＋「你這個假期要做什麼？」（照行事曆＝報了的活動名字／「還沒想」）',q.length===2&&q[0].ask.opts.length===3&&q[1].text==='你這個假期要做什麼？'&&J(q[1].ask.opts.map(o=>o.t))===J(['海外語言文化課程（京都）','還沒想']),J(q.map(m=>[m.text,m.ask.opts.map(o=>o.t)])));
    PHONE.answer(H.G,'aa532_an_plan_Y2S2_q',1); check('7. 回「還沒想」→ 她「那我們再排。」',(H.G.msgs||[]).slice(-1)[0].text==='那我們再排。','');
    const k3=CALENDAR.dateOf(HOLFF.anPlanDay('Y1S2')).key; fresh(k3,20); run(k3,21); check('7. 不認識她：沒有',tagMsgs('aa532_an_plan_Y1S2').length===0,''); }
  /* ================= 8 AA-B 10-30 05:12 十四點 ================= */
{ /* 第 1 點：學姊放假平日照學期中（17:30「明天五點以後，總圖三樓。你帶要問的題目。」）、週末放假版下午。AA_539 1-3：2026 暑假（學生證停掉）改慢讀，這裡改查 2027 暑假（原本 2026-07-20） */
  fresh('2027-07-19',13); friend('heroine_05'); const c=HAS_HASK?HASK.candidates(H.G,H.G.day).filter(x=>x.id==='heroine_05'&&x.place==='library'&&x.day===D('2027-07-20')):[];
  check('8-1. 學姊放假、平日（2027-07-19 週一傳、7/20 週二約）：照學期中 17:30「明天五點以後，總圖三樓。你帶要問的題目。」、不記 vac',c.length===1&&c[0].h===17.5&&c[0].v.line==='明天五點以後，總圖三樓。你帶要問的題目。'&&!c[0].vac,J(c.map(x=>[x.h,x.v.line,x.vac]))); }
{ /* 第 5 點：留宿舍週四 22:00 爸爸「？」quiet（快轉不停）；學期中照舊；除夕～初五不傳 */
  const dadQ=()=>{ const P=PHONE.rec(H.G), q=P.q.find(x=>/^home_ask_\d+_dad$/.test(x.tag||'')); return q?q.items[0]:null; };
  fresh('2026-07-16',19); H.G.home={at:false}; at(H.G.day,20); HOME.phoneRules(GM); PHONE.tick(H.G); at(H.G.day,22); HOME.phoneRules(GM); const qv=dadQ();
  fresh('2026-03-12',19); at(H.G.day,20); HOME.phoneRules(GM); PHONE.tick(H.G); at(H.G.day,22); HOME.phoneRules(GM); const qt=dadQ();
  check('8-5. 暑假留宿舍：20:00 沒回、22:00 爸爸「？」quiet（收進手機、快轉不停）；學期中那一則照舊（不 quiet）',!!qv&&qv.text==='？'&&qv.quiet===true&&!!qt&&!qt.quiet,J({qv,qt}));
  const ny=D(HOLFF.CNY1[2026]), thu=[];   /* 2026 除夕 2/16～初五 2/21：週四 2/19（2027 那一段沒有週四）*/ for(let d=ny-6;d<=ny+10;d++) if(wd(d)===4) thu.push(d);
  fresh(CALENDAR.dateOf(ny-8).key,10); H.G.home={at:false}; const got={}; for(const d of thu){ at(d,20); HOME.phoneRules(GM); PHONE.tick(H.G); got[CALENDAR.dateOf(d).key]=tagMsgs('home_ask_'+d).length; }
  const inWk=thu.filter(d=>d>=ny-1&&d<=ny+4), outWk=thu.filter(d=>d<ny-1||d>ny+4);
  check('8-5. 留宿舍：除夕～初五那個週四不傳「這週回來吃飯嗎」，前後週照常',inWk.length>=1&&inWk.every(d=>got[CALENDAR.dateOf(d).key]===0)&&outWk.length>=1&&outWk.every(d=>got[CALENDAR.dateOf(d).key]===1),J(got)); }
{ /* 第 7 點：京都交往版的「妳是中級喔。」回覆 */
  const k12=VAC_DATA.A.C12.keys[0], c0=k12.choice[0].say[0], txt=G=>typeof c0.text==='function'?c0.text(G):c0.text;
  fresh('2027-08-10',9); const fr=txt(H.G); H.G.flags.dating_heroine_01=true; const dt=txt(H.G);
  check('8-7. 京都第一堂「妳是中級喔。」：交往中「你不要叫我老師。」（她剛說過「分班考分的。」）；朋友版照舊',dt==='你不要叫我老師。'&&fr==='分班考分的。……你不要叫我老師。',J({fr,dt})); }
H.done();
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); console.log('FAILED '+(H.fails+1)); process.exit(1); });
