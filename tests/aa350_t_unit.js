// AA_350 第 9 節 T 節＋9-1 缺的字（企劃線 2e255e9a；任務 AA-Q-1021-SR）——不需要瀏覽器。用法：node tests/aa350_t_unit.js
//   T1 回來那天算臺北：柏翰 S1、S2 的新段落＝離開那天起算新竹、回來那天算臺北（src/data/characters.js；tests/aa350_s_unit.js 的 S1、S2 照改）；
//   T7b 她出國的日子約不到，婉拒照稿逐字：以安在日本「那幾天我在日本。」、學姊在美國「那時候我在美國。」、芷若在英國「我那時候在英國。」、其他人／其他地方「那幾天我不在臺灣。」（src/date3d.js S.abroadNo）；
//   T8 D29 偶遇阿哲的暑假：回高雄的隔天～回臺北的前一天＝2027-07-02～08-20、2028-07-02～08-20（2028-07-01 週六遇不到、7/8 遇得到；encounters.js、characters.js 兩邊一樣）；
//   T9b「欠你的，下週。」便當照片改 13:00（12:40 還沒有）；T9c 沒見過阿勳走 R2（學活那一條）＝自我介紹＋「坐。」、不說「你今天沒來上課」；
//   9-1 R2 開頭的旁白「（學活二樓，靠窗那一桌。阿勳已經坐在那裡了。）」；9-1 柏翰 2027-08-24 20:00 桌遊團「回來了。明天香港。」（src/holff3d.js）。
// 修改前（開發分支 87cc42021）實際跑過：FAILED 13——T1 1 項、T7b 5 項、T8 2 項、T9b 1 項、9-1 旁白 1 項、T9c 2 項（見過阿勳那一項也查旁白在前）、柏翰 1 項；PASS 2 項是防回歸（D26 臺中照 T7a、19:48 還沒有）。
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(ENC|ENCOUNTERS|ENC_WALK|HOLFF|TRIP|FREE_TRIPS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
const {check,GM}=H;
for(const f of ['src/data/free_trips.js','src/freetrip3d.js','src/data/encounters.js','src/data/enc_walk.js','src/encounter3d.js','src/holff3d.js']) if(fs.existsSync(path.join(H.ROOT,f))) load(f);
const D=k=>STORY.dayOfKey(k);
(async()=>{
  /* ===== T7b 她出國的日子 ===== */
  const ask=(id,todayK,dayK,loc,dep,flags)=>{ H.fresh(todayK,9,'dorm',flags); H.CLOSE(id); H.G.contacts=Object.assign(H.G.contacts||{},{[id]:1}); return DATE.check(H.G,{who:id,locs:[loc],day:D(dayK),depart:dep}); };
  { const a=ask('heroine_01','2028-03-01','2028-05-10','D13',10,{dating_heroine_01:true}); check('T7b. 以安在日本（交換 2028-05-10）：「那幾天我在日本。」',!a.ok&&a.why==='「那幾天我在日本。」',JSON.stringify(a.why)); }
  { const a=ask('heroine_01','2027-01-10','2027-01-20','D13',10,{dating_heroine_01:true}); check('T7b. 以安在東京（C11 2027-01-20，出國）：「那幾天我在日本。」',!a.ok&&a.why==='「那幾天我在日本。」',JSON.stringify(a.why)); }
  { const a=ask('heroine_05','2028-07-20','2028-09-10','D13',10,{dating_heroine_05:true}); check('T7b. 學姊在美國（2028-09-10）：「那時候我在美國。」',!a.ok&&a.why==='「那時候我在美國。」',JSON.stringify(a.why)); }
  { const a=ask('heroine_02','2028-08-20','2028-09-10','D13',10,{dating_heroine_02:true}); check('T7b. 芷若在英國（2028-09-10）：「我那時候在英國。」',!a.ok&&a.why==='「我那時候在英國。」',JSON.stringify(a.why)); }
  { const g=DATE.abroadNo?DATE.abroadNo({flags:{},stage:'law'},'heroine_03',D('2028-05-10')):'x', o=DATE.abroadNo?(()=>{ const P0=STORY.presence; STORY.presence=()=>({here:false,kind:'trip',away:'在曼谷',signal:true}); try{ return DATE.abroadNo({flags:{},stage:'law'},'heroine_01',D('2028-05-10')); } finally { STORY.presence=P0; } })():'';
    check('T7b. 以安在曼谷（其他地方）＝共用那一句「那幾天我不在臺灣。」；語彤那天在臺灣＝不擋（空字串）',o==='「那幾天我不在臺灣。」'&&g==='',JSON.stringify([o,g])); }
  { const a=ask('heroine_01','2026-07-23','2026-07-28','D26',8,{dating_heroine_01:true}); check('T7b. 防回歸：以安回台中（S6）約 D26 臺中照 T7a 不擋、不是出國那一句',!/日本|不在臺灣/.test(a.why||''),JSON.stringify([a.ok,a.why])); }
  /* ===== T1 回來那天算臺北（柏翰 S1、S2 的新段落）===== */
  { const P=(k)=>STORY.presence('classmate_bohan',{day:D(k),flags:{},stage:'law'}), nz=p=>p.here===false&&p.kind==='home'&&p.home==='新竹', tp=p=>p.here===true;
    const R=[['2027-06-27',nz],['2027-08-23',nz],['2027-08-24',tp],['2028-01-25',nz],['2028-01-27',nz],['2028-01-28',tp],['2028-06-27',nz],['2028-07-01',nz],['2028-07-02',tp]].map(([k,f])=>[k,f(P(k))]);
    check('T1. 柏翰：離開那天起算新竹（2027-06-27、2028-01-25、2028-06-27）、回來那天算臺北（2027-08-24、2028-01-28、2028-07-02）',R.every(x=>x[1]),JSON.stringify(R.filter(x=>!x[1]).map(x=>x[0]))); }
  /* ===== T8 D29 偶遇阿哲的暑假 ===== */
  const encAt=(key,h)=>{ H.fresh(key,h,'gongguan'); H.FAMILIAR('zhe'); H.G.contacts=Object.assign(H.G.contacts||{},{zhe:1}); return ENC.candidates(H.G,'D29').map(c=>c.row.who); };
  { const a=encAt('2028-07-01',15), b=encAt('2028-07-08',15);
    check('T8. 2028-07-01（週六，他那天才回高雄）遇不到；7/8（週六）遇得到',!a.includes('zhe')&&b.includes('zhe'),JSON.stringify([a,b])); }
  { const z=(ENCOUNTERS.rows||[]).find(x=>x.spot==='D29'&&x.who==='zhe'), s=(CHARACTERS.zhe.daily_schedule||[]).find(x=>x.enc==='D29'), J=JSON.stringify(z&&z.dates);
    check('T8. encounters.js 的暑假三段＝2026／2027／2028-07-02～08-20，characters.js 作息同一組',!!z&&!!s&&JSON.stringify(z.dates)===JSON.stringify(s.dates)&&['2026','2027','2028'].every(y=>J.includes('["'+y+'-07-02","'+y+'-08-20"]'))&&!/-07-01"/.test(J),J); }
  /* ===== T9b 便當照片 13:00 ===== */
  const F11=STORY.termDay('Y1S2',11,5), W11T=STORY.termDay('Y1S2',11,4), K=d=>CALENDAR.dateOf(d).key;
  const photo=h=>{ H.fresh(K(F11),h,'putong',{XUN_NIGHT:true,XUN_DAY:W11T,MET_XUN:true,SK03_FIRST:true}); STORY.phoneRules(GM); PHONE.tick(H.G); return (H.G.msgs||[]).some(m=>m.th==='g:econ_friends'&&m.text==='欠你的，下週。'); };
  { const a=photo(12.7), b=photo(13.05); check('T9b. 第 11 週週五 12:42 還沒有便當照片；13:03 有（AA_350 T9b：改到 13:00）',!a&&b,JSON.stringify([a,b])); }
  /* ===== T9c、9-1 R2 學活那一條 ===== */
  const ev=STORY_EVENTS.find(e=>e.id==='ev_sk03_lunch');
  const r2=async flags=>{ const F13=STORY.termDay('Y1S2',13,5); H.fresh(K(F13),12.3,'putong',Object.assign({SK03_HUODA:F13,SK03_FIRST:true},flags)); H.said=[]; await EVENTS.run(ev); return H.lines(); };
  { const L=await r2({});
    check('9-1. R2 開頭旁白「（學活二樓，靠窗那一桌。阿勳已經坐在那裡了。）」',L[0]==='（學活二樓，靠窗那一桌。阿勳已經坐在那裡了。）',JSON.stringify(L.slice(0,3)));
    check('T9c. 沒見過阿勳：自我介紹「盧正勳。你經濟系那年的室友。……你該不會連我都忘了。」＋「坐。」，不說「你今天沒來上課」',L[1]==='阿勳：盧正勳。你經濟系那年的室友。……你該不會連我都忘了。'&&L[2]==='阿勳：坐。'&&!L.some(t=>t.includes('你今天沒來上課')),JSON.stringify(L.slice(0,4))); }
  { const L=await r2({P4D_ANSWER:'retake',MET_XUN:true});
    check('T9c. 防回歸：見過阿勳＝旁白以後「……你今天沒來上課。坐。」、沒有自我介紹',L[1]==='阿勳：……你今天沒來上課。坐。'&&!L.some(t=>t.includes('盧正勳')),JSON.stringify(L.slice(0,3))); }
  /* ===== 9-1 柏翰 2027-08-24 ===== */
  { H.fresh('2027-08-24',20.2,'dorm'); PHONE.join(H.G,'noodle_team','桌遊團'); if(typeof HOLFF!=='undefined') HOLFF.homeMsgs(H.G); PHONE.tick(H.G);
    const m=(H.G.msgs||[]).filter(x=>x.th==='g:noodle_team'&&x.from==='classmate_bohan').map(x=>x.text);
    check('9-1. 柏翰 2027-08-24 20:00 桌遊團「回來了。明天香港。」',m.includes('回來了。明天香港。'),JSON.stringify(m)); }
  { H.fresh('2027-08-24',19.8,'dorm'); PHONE.join(H.G,'noodle_team','桌遊團'); if(typeof HOLFF!=='undefined') HOLFF.homeMsgs(H.G); PHONE.tick(H.G);
    check('9-1. 19:48 還沒有',!(H.G.msgs||[]).some(x=>x.text==='回來了。明天香港。')); }
  H.done();
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });
