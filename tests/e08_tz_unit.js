// E08 第三輪（AA_478 第 7 節，企劃線 6d9ebd49a，AA-C 2026-10-27）：寒暑假出國途中的時鐘換當地時間——不需要瀏覽器。
//   做法同日本據點（STORY.tzOffset）：登機以後到回國桃園入境，遊戲時鐘（日期卡、X58 停下來那張卡、手機收到的時間）、關鍵事件的觸發都照當地時間；回到臺灣那一刻換回臺灣時間。
//   Z1 C10 加州（−15）：第一堂課在當地 6/23 09:00 演（那時 STORY.tzOffset＝−15）；以安照臺灣 21:30 傳的，手機上是當地 06:30；可昕的週末視訊在當地週六 19:00；回國那一刻換回臺灣時間（7/31 20:00、和原本一樣）
//   Z2 C08 首爾（＋1）：歡迎晚會當地 19:00；登機以後時鐘往後撥 1 小時；X58 停下來那張卡寫的是當地時間；要回的期限也換算；回國 7/24 18:00 不往回撥
//   Z3 C13 歐洲（−6）、日本（＋1）：照 TRAVEL.dest 的時差；Z4 時鐘一路不往回走（每一句、每一張卡的時刻）
//   Z5 臺灣的朋友回訊息（MSG.replyAt）：照臺灣時間算再換回當地；一起去的人照當地
//   Z6 存讀檔：登機以後到了那裡的存檔（在大廳等了 45 分鐘才登機）讀回來接著演、不會被算成沒去；途中（時鐘已經是當地的）存的檔讀回來不會再撥一次；第一、二輪格式的存檔（planned＋登機了）也接著演；
//      時鐘卡在當地、又沒有在途中的那一趟（不該發生）＝換回臺灣時間
//   Z7 沒有 3D 機場：照樣換當地時間
// 修改前（b24bbaa75，第二輪 E08）：Z1、Z2、Z3、Z5、Z6 FAIL（時鐘一直是臺灣時間；讀檔被算成沒去）。用法：node tests/e08_tz_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(EXCH|Y34B|MSG|MSG_POOL|MSG2_POOL|GROUP|GROUP_EVENTS|R2Y3A|R2Y3A_EVENTS|R2Y3B|R2Y3B_EVENTS|HOLFF|JP|JP_EVENTS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/holff3d.js','src/exchange3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/data/group_events.js','src/group3d.js','src/y34b3d.js','src/data/r2y3a_events.js','src/r2y3a3d.js','src/data/r2y3b_events.js','src/r2y3b3d.js','src/data/jp_events.js','src/jp3d.js']) if(fs.existsSync(path.join(H.ROOT,f))) load(f);
/* 單元測試的載入順序（vac3d.js 在 msg3d.js、exchange3d.js 前面）：補登記；遊戲裡照 index.html msg3d.js、exchange3d.js 在 vac3d.js 前面 */
if(typeof VAC!=='undefined'&&VAC.airReg) VAC.airReg();
if(typeof VAC!=='undefined'&&VAC.msgReg) VAC.msgReg();
const {check,GM,E}=H;
const D=k=>STORY.dayOfKey(k), T=(d,h)=>d*24+h, NOW=()=>T(H.G.day,H.G.hour);
const tz=()=>typeof STORY.tzOffset==='function'?(STORY.tzOffset(H.G)||0):0;
GM.memo=()=>{};
/* 每一句、每一張卡、每一次 X58 停下來：記下那一刻的時鐘和 STORY.tzOffset */
const log=[]; const say0=GM.say, tc0=GM.titleCard;
GM.say=async(who,t)=>{ log.push({k:'say',t:String(t),at:NOW(),tz:tz(),day:H.G.day,hour:H.G.hour,wd:H.G.weekday}); return say0(who,t); };
GM.titleCard=async(a,b)=>{ log.push({k:'card',t:a+'｜'+b,at:NOW(),tz:tz()}); return tc0(a,b); };
let onStop=null; GM.phoneThread=async()=>{ log.push({k:'stop',at:NOW(),tz:tz()}); if(onStop) onStop(); };
let snaps=[]; GM.autosave=(force)=>{ if(force) snaps.push(JSON.stringify(H.G)); };
const spawned=[]; GM.spawnCharacter=(id,x,z,o)=>{ const n={id,obj:{position:{x,y:0,z},rotation:{y:o&&o.yaw||0}},beh:o&&o.beh,talk:o&&o.talk,talkLabel:o&&o.talkLabel,greet:o&&o.greet}; GM.npc[id]=n; spawned.push(n); return n; };
const settle=async(ok)=>{ for(let i=0;i<3000&&!(ok&&ok());i++) await new Promise(r=>setImmediate(r)); };
const hall=()=>{ E.interactables=[{x:0,z:-13.8,radius:2.5,label:'登機',airportBoard:true,look:'今天沒有要搭的飛機。'},{x:-4,z:18.6,radius:1.4,label:'搭車離開（回台北）',exit:{to:'gongguan',spawn:{x:-2.5,z:-29,yaw:0}}}]; };
const board=()=>STORY.interact({x:0,z:-13.8,radius:2.5,label:'登機',airportBoard:true,look:'今天沒有要搭的飛機。'},GM);
const said=t=>log.find(x=>x.k==='say'&&x.t===t);
const mono=L=>{ for(let i=1;i<L.length;i++) if(L[i].at<L[i-1].at-1e-6) return {i,a:L[i-1],b:L[i]}; return null; };
const hm=at=>{ const m=Math.round((((at%24)+24)%24)*60); return String(Math.floor(m/60)%24).padStart(2,'0')+':'+String(m%60).padStart(2,'0'); };
const J=x=>JSON.stringify(x);
const clockOf=G=>typeof VAC.clock==='function'?VAC.clock(G):((G&&G.vac&&G.vac.clock)||null);   /* 修改前沒有 VAC.clock：照樣跑完、各自 FAIL */
const FAM=['kai','npc_fangyt','heroine_04','heroine_01','zhe','yu','classmate_bohan'];
/* 從宿舍出發：報名 → 出發前一小時 → OUT.go（出境大廳）→（wait：在大廳待幾小時）→「登機」→ 整趟 */
async function fly(key,day,setup,wait){ H.fresh(day,4,'dorm'); H.G.stage='law'; for(const p of FAM) H.FAMILIAR(p); spawned.length=0; snaps=[]; if(setup) setup();
  VAC.signup(H.G,key,'yes'); const q=OUT.get(H.G,'vac_'+key); if(!q) return {q:null};
  H.G.day=q.day; H.G.hour=q.h-1; hall(); log.length=0; await OUT.go(GM,q); if(wait) H.G.hour+=wait; const b0=NOW(); hall(); log.length=0; await board(); return {q,b0,L:log.slice()}; }
(async()=>{
  check('0. 接線：VAC.tzAt／clock／airResume、EXCH.AIR.vac.resume；STORY.tzOffset 先問 VAC（出國途中＝當地時差）',typeof VAC.tzAt==='function'&&typeof VAC.clock==='function'&&typeof VAC.airResume==='function'&&!!(EXCH.AIR&&EXCH.AIR.vac&&typeof EXCH.AIR.vac.resume==='function')
    &&(()=>{ H.fresh('2027-07-01',10,'dorm'); VAC.rec(H.G).clock={q:'x',tz:-15,end:T(H.G.day+3,18),with:[]}; const a=STORY.tzOffset(H.G), b=STORY.tzOffset(H.G,H.G.day+5); delete VAC.rec(H.G).clock; return a===-15&&b===0&&STORY.tzOffset(H.G)===0; })());

  /* ===================== Z1 C10 加州（−15）===================== */
  { const r=await fly('C10@Y2','2027-06-21',()=>{ H.date('heroine_01'); H.G.flags.dating_kexin=true; }), L=r.L, c=said('（教室比法律系館A的小。教授穿短褲，第一句話是「叫我名字就好」。）'), a=said('（飛機飛了十二個小時。下飛機的時候，手機的時間往回跳了一天。）');
    check('Z1. C10：第一堂課在當地 6/23 09:00 演（那一刻 STORY.tzOffset＝−15：臺灣已經是 6/24 00:00）；「抵達」在第一堂課以前、登機那一刻以後',!!c&&c.day===D('2027-06-23')&&Math.abs(c.hour-9)<0.01&&c.tz===-15&&!!a&&a.tz===-15&&a.at>=r.b0-1e-6&&a.at<c.at,J([c,a&&{at:a.at,tz:a.tz},r.b0]));
    const an=(H.G.msgs||[]).filter(m=>m.from==='heroine_01'&&m.ask&&/^vac_tm_C10@Y2_heroine_01_p/.test(m.ask.id||'')), p=an[0];
    check('Z1. 以安照臺灣 21:30 傳的（每天一則），手機上是當地 06:30；要回的期限也換成當地（臺灣隔天 24:00−15）',an.length>0&&an.every(m=>Math.abs(m.h-6.5)<0.05)&&!!p&&p.ask.until===T(p.day+1,24)-15,J(an.slice(0,2).map(m=>({day:m.day,h:m.h,until:m.ask.until}))));
    const vk=L.find(x=>x.k==='say'&&VAC_DATA.TRIP_MSG.gf.kexin.video.includes(x.t));
    check('Z1. 可昕的週末視訊（臺灣週日 10:00）在當地週六 19:00 演',!!vk&&vk.wd===6&&Math.abs(vk.hour-19)<0.01,J(vk&&{day:vk.day,hour:vk.hour,wd:vk.wd}));
    check('Z1. 回國那一刻換回臺灣時間：7/31 20:00（和原本一樣）＋OUT 的半小時；沒有 G.vac.clock、STORY.tzOffset＝0；BACK_FROM_C10＝7/31；整趟演完',!clockOf(H.G)&&tz()===0&&H.G.day===D('2027-07-31')&&Math.abs(H.G.hour-20.5)<0.01&&H.G.flags.BACK_FROM_C10===D('2027-07-31')&&r.q.state==='done',J([H.G.day,H.G.hour,clockOf(H.G),r.q.state]));
    check('Z4. C10 整趟時鐘不往回走（每一句、每一張卡、每一次停下來）',!mono(L),J(mono(L)));
    const st=L.filter(x=>x.k==='stop'); check('Z1. X58 停下來的那幾次都在途中（當地時間，tzOffset −15）',st.length>0&&st.every(x=>x.tz===-15),J(st.slice(0,3))); }

  /* ===================== Z2 C08 首爾（＋1）===================== */
  { let stopCard=null; const r=await fly('C08@Y1','2026-07-13',()=>{ H.date('heroine_01'); }), L=r.L, w=said('（長桌上擺了一整排小菜。對面的女生拿起一個小碟子，放到你前面。）');
    check('Z2. C08：歡迎晚會在當地 7/13 19:00 演（那一刻 tzOffset＝+1）',!!w&&w.day===D('2026-07-13')&&Math.abs(w.hour-19)<0.01&&w.tz===1,J(w));
    const i=L.findIndex(x=>x.k==='stop'), s=L[i], cd=i>0?L.slice(0,i).reverse().find(x=>x.k==='card'):null;
    check('Z2. X58 停下來那張卡寫當地時間（卡上的時:分＝當地的時鐘，比臺灣快 1 小時）',!!s&&s.tz===1&&!!cd&&cd.t.includes(hm(s.at)),J([s,cd]));
    const an=(H.G.msgs||[]).filter(m=>m.from==='heroine_01'&&m.ask&&/^vac_tm_C08@Y1_heroine_01_p/.test(m.ask.id||''));
    check('Z2. 以安臺灣 21:30 傳的，手機上是當地 22:30（兩則一組的第二則差 0.01：PHONE.tick 補進去的照順序）',an.length>0&&an.every(m=>Math.abs(m.h-22.5)<0.05),J(an.map(m=>({day:m.day,h:m.h,id:m.ask.id}))));
    const first=L.find(x=>x.k==='stop'||x.k==='say'); check('Z2. 登機以後時鐘往後撥 1 小時（當地＝臺灣＋1）：第一次停下來就是當地時間（tzOffset +1）',!!first&&first.tz===1&&first.at>=r.b0+1-1e-6,J([first,r.b0]));
    check('Z2. 回國 7/24 18:00（＋OUT 的半小時）、時鐘沒有往回撥；整趟不往回走',!clockOf(H.G)&&H.G.day===D('2026-07-24')&&Math.abs(H.G.hour-18.5)<0.01&&!mono(L),J([H.G.day,H.G.hour,mono(L)])); }

  /* ===================== Z3 C13 照目的地的時差 ===================== */
  for(const [dest,want,pick] of [['eu',-6,'歐洲'],['jp',1,'日本']]){ H.fresh('2027-07-01',10,'dorm'); H.FAMILIAR('zhe'); snaps=[]; H.picks=[pick,'和'+SOCIAL.displayName('zhe'),dest==='eu'?'7 天':'5 天',0]; await VAC.plan13(GM); const rec=(VAC.rec(H.G).t13||[])[0], q=OUT.get(H.G,'vac_t13_1');
    if(q){ H.G.day=q.day; H.G.hour=q.h-1; hall(); await OUT.go(GM,q); hall(); log.length=0; await board(); }
    const sc=log.filter(x=>x.k==='say'), first=sc[0];
    check('Z3. C13 '+pick+'：途中每一場 tzOffset＝'+want+'；第一場在當地 15:00；回國 '+(rec?CALENDAR.dateOf(rec.to).m+'/'+CALENDAR.dateOf(rec.to).d:'')+' 18:00（＋半小時）、時鐘不往回走',!!q&&sc.length>0&&sc.every(x=>x.tz===want)&&!!first&&Math.abs(first.hour-15)<0.01&&first.day===rec.from&&H.G.day===rec.to&&Math.abs(H.G.hour-18.5)<0.01&&!mono(log)&&!clockOf(H.G),J([first,H.G.day,H.G.hour,mono(log)])); }

  /* ===================== Z5 臺灣的朋友回訊息 ===================== */
  { H.fresh('2027-07-02',14,'dorm'); for(const p of FAM) H.FAMILIAR(p); const G=H.G, C={q:'x',tz:-15,end:T(G.day+5,18),with:['kai']}; VAC.rec(G).clock=C;
    const r=MSG.replyAt(G,'zhe'), k=MSG.replyAt(G,'kai'); delete VAC.rec(G).clock;
    const t=T(G.day,G.hour)+15, tw=Object.assign({},G,{day:Math.floor(t/24),hour:t-Math.floor(t/24)*24,weekday:CALENDAR.dateOf(Math.floor(t/24)).wd%7}), b=MSG.replyAt(tw,'zhe'), kb=MSG.replyAt(G,'kai');
    check('Z5. 出國途中（加州）阿哲回訊息：照臺灣時間算（當地 14:00＝臺灣 05:00）再換回當地；tz 記 −15（msg3d.js 照她那邊挑句子）；一起去的阿凱照當地算',!!r&&!!b&&Math.abs(T(r.day,r.h)-(T(b.day,b.h)-15))<1e-6&&r.tz===-15&&!!k&&!!kb&&Math.abs(T(k.day,k.h)-T(kb.day,kb.h))<1e-6&&k.tz==null,J([r,b,k,kb])); }

  /* ===================== Z6 存讀檔 ===================== */
  const reload=s=>{ H.G=JSON.parse(s); SOCIAL.bind(H.G); EVENTS.bind(GM); GM.npc={}; hall(); };
  const run=async()=>{ log.length=0; for(let i=0;i<5;i++){ const a=EXCH.tick(GM); if(!a){ const p=OUT.tick(GM); if(p&&p.then) await p; } await settle(()=>{ const q=OUT.get(H.G,'vac_C08@Y1'); return !!q&&(q.state==='done'||q.state==='missed'); }); const q=OUT.get(H.G,'vac_C08@Y1'); if(q&&(q.state==='done'||q.state==='missed')) break; } };
  { const r=await fly('C08@Y1','2026-07-13',null,0.75), arr=snaps[snaps.length-1];   /* 在大廳待 45 分鐘才登機：到了那裡的存檔比出發時間晚 */
    reload(arr); const q0=OUT.get(H.G,'vac_C08@Y1'), st0=q0&&q0.state; await run(); const q=OUT.get(H.G,'vac_C08@Y1'), V=VAC.rec(H.G);
    check('Z6. 登機以後到了那裡的存檔（等了 45 分鐘）讀回來：接著演完（歡迎晚會照演），不會被算成沒去；回國換回臺灣時間',st0==='flying'&&!!q&&q.state==='done'&&V.reg['C08@Y1']==='done'&&!!said('（長桌上擺了一整排小菜。對面的女生拿起一個小碟子，放到你前面。）')&&!clockOf(H.G)&&Math.abs(H.G.hour-18.5)<0.01,J([st0,q&&q.state,V.reg['C08@Y1'],H.G.day,H.G.hour]));
    /* 第一、二輪的格式：登機以後 state 還是 planned、沒有 G.vac.clock */
    const old=JSON.parse(arr); (old.outings||[]).forEach(x=>{ if(x.id==='vac_C08@Y1'){ x.state='planned'; } }); if(old.vac) delete old.vac.clock; reload(JSON.stringify(old)); await run(); const q2=OUT.get(H.G,'vac_C08@Y1');
    check('Z6. 第一、二輪格式的存檔（planned＋登機了＋到了）讀回來也接著演完，不是沒去',!!q2&&q2.state==='done'&&VAC.rec(H.G).reg['C08@Y1']==='done'&&!clockOf(H.G),J([q2&&q2.state,VAC.rec(H.G).reg['C08@Y1']])); }
  { let mid=null; onStop=()=>{ if(!mid&&clockOf(H.G)) mid=JSON.stringify(H.G); }; await fly('C08@Y1','2026-07-13'); onStop=null;
    const C=mid&&JSON.parse(mid).vac.clock, at0=mid&&(JSON.parse(mid).day*24+JSON.parse(mid).hour); reload(mid||'{}'); await run(); const q=OUT.get(H.G,'vac_C08@Y1'), L=log.filter(x=>x.k==='say');
    check('Z6. 途中（時鐘已經是當地的）存的檔讀回來：接著演完、不會再撥一次（還是 +1：回國 18:00＋半小時）',!!mid&&!!C&&C.tz===1&&!!q&&q.state==='done'&&Math.abs(H.G.hour-18.5)<0.01&&H.G.day===D('2026-07-24')&&L.length>0&&L.every(x=>x.tz===1)&&L[0].at>=at0-1e-6,J([C,q&&q.state,H.G.day,H.G.hour,L[0]])); }
  { H.fresh('2027-07-10',9,'dorm'); VAC.rec(H.G).clock={q:'vac_gone',tz:-15,end:T(D('2027-07-12'),18),with:[]}; const a0=NOW(); EXCH.tick(GM);
    check('Z6. 時鐘卡在當地、又沒有在途中的那一趟（不該發生）：換回臺灣時間（往後撥 15 小時）',!clockOf(H.G)&&Math.abs(NOW()-(a0+15))<1e-6&&tz()===0,J([a0,NOW()])); }
  { H.fresh('2027-07-10',9,'dorm'); const a0=NOW(); const a=EXCH.tick(GM); check('Z6. 舊存檔（沒有 G.vac.clock、沒有在途中的出國）：什麼都不動、STORY.tzOffset＝0',!a&&NOW()===a0&&tz()===0); }

  /* ===================== Z7 沒有 3D 機場 ===================== */
  { const z0=EXCH.airZoneOk; EXCH.airZoneOk=()=>false;
    try{ H.fresh('2026-08-24',4,'dorm'); H.G.stage='law'; H.FAMILIAR('kai'); VAC.signup(H.G,'C05@Y1','yes'); const q=OUT.get(H.G,'vac_C05@Y1'); H.G.day=q.day; H.G.hour=q.h-1; log.length=0; await OUT.go(GM,q); const k=said('（二手遊戲店的樓梯很窄。一層一層往上，每一層賣的東西都比下面那層舊。）');
      check('Z7. 沒有 3D 機場（2D 一口氣演完）：照樣換當地時間（秋葉原當地 8/25 14:00、tzOffset +1）；回國 8/28 18:00＋半小時',!!k&&k.tz===1&&Math.abs(k.hour-14)<0.01&&k.day===D('2026-08-25')&&!clockOf(H.G)&&H.G.day===D('2026-08-28')&&Math.abs(H.G.hour-18.5)<0.01&&q.state==='done',J([k,H.G.day,H.G.hour,q.state])); }
    finally{ EXCH.airZoneOk=z0; } }
  H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
