// AA_533 寒暑假（二）（企劃線 cf0066ed2；任務 AA533-VAC-FIX-1030（子代理暫定）；D99 第二優先）——不需要瀏覽器。用法：node tests/aa533_vac_unit.js
//   0  新句都在 AA_533 稿裡（一字不差）；白名單有 AA_533
//   1  C13 和女朋友出國：第一天「到了」取代目的地第一句、中間那天目的地第二句＋她的「中間」、最後一晚＋last＋燈關了（七位都有 arr、mid）；沛珊「我第一次出國耶」只給第一次
//   2  C03 以安沒去的上班族大姊三堂；C04 模擬考 Kevin、考完 12:00 私訊；C11 第一次去 01-29 最後一晚（以安去的換她）；C12 以安不在茶道老師一句
//   3  回她的縣市再去：可昕夜市、愛河，沛珊公園、書店
//   4  麵店長桌語彤、Alison；參創子晴兩句；法圖學姊兩句＋選項；海邊第二、三次一句人說話
//   5  快轉旁白分年（住家裡、宿舍各五列；大一照舊）；摘要池不分假期往下輪；晚餐題目三個（第一題只在 12 月～除夕前、爸爸那句只在他在家）
// 修改前（d531b973f）FAIL 的：除了 0 的「稿讀得到」，全部。
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H, J=JSON.stringify;
const loadG=(f)=>{ const s=fs.readFileSync(path.join(H.ROOT,f),'utf8').replace(/^const ([A-Z_][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); };
let loadErr='';
for(const f of ['src/holff3d.js','src/data/vacfill_events.js','src/vacfill3d.js','src/data/hometown_lines.js']){ try{ loadG(f); }catch(e){ loadErr+=f+'：'+String(e&&e.message||e)+'　'; } }
const git=(ref,p)=>{ try{ return cp.execSync('git -c core.quotepath=false show '+ref+':"'+p+'"',{cwd:H.ROOT,encoding:'utf8',maxBuffer:1<<26}); }catch(e){ return ''; } };
const A533='docs/story_planning/AA_533_D99寒暑假二_出國旅遊和她_活動卡的人_回她的縣市_快轉旁白分年.md';
const doc=git('cf0066ed2',A533);
check('0. AA_533（cf0066ed2）讀得到；模組載得到',doc.length>3000&&!loadErr,loadErr||'git fetch origin claude/cool-heisenberg-o8kuqx');
const D=H.D, T=(d,h)=>d*24+h, wd=d=>CALENDAR.dateOf(d).wd%7;
const at=(d,h)=>{ H.G.day=d; H.G.hour=h; H.G.weekday=wd(d); };
const strip=t=>String(t).replace(/^「(.*)」$/,'$1');
const TV=VAC_DATA.TRAVEL, A=VAC_DATA.A;
const flat=(lines,G)=>{ const out=[]; for(const x of (lines||[])){ const v=typeof x==='function'?x(G):x; if(v==null) continue; for(const y of [].concat(v)){ if(typeof y==='string') out.push(y); else out.push(typeof y.text==='function'?y.text(G):(y.text||y.narr)); } } return out; };
const keyOf=(id,title)=>(A[id].keys||[]).find(k=>k.title===title);

/* ================= 0 ================= */
{ const L=[]; const GFS=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','kexin','classmate_peishan'];
  for(const id of GFS){ const g=TV.gf[id]; if(g.arr) L.push(...g.arr); else L.push('（'+id+' 沒有 arr）'); if(g.mid) L.push(...g.mid); else L.push('（'+id+' 沒有 mid）'); }
  const fresh0=H.fresh('2028-07-10',9,'dorm'); for(const t of ['第一堂','小考','最後一堂']){ const k=keyOf('C03',t); L.push(...flat(k.lines,fresh0)); for(const c of (k.choiceElse||[])){ L.push(c.t); L.push(...flat(c.say,fresh0)); } }
  const mk=keyOf('C04','模擬考'), ek=keyOf('C04','正式考試'); L.push(...flat(mk.lines,fresh0).slice(1)); if(ek&&ek.msg) L.push(...ek.msg.items.map(x=>x.text));
  const c11=keyOf('C11','最後一晚'); if(c11){ L.push(...flat(c11.lines,fresh0)); for(const c of c11.choice){ L.push(c.t,...flat(c.say,fresh0)); } }
  L.push('明天的飛機十點。……行李我昨天就收好了。','轉兩次，是讓客人看到最漂亮的那一面。');
  if(A.C01&&VAC_DATA.C01.diarySay) for(const k in VAC_DATA.C01.diarySay) L.push(VAC_DATA.C01.diarySay[k][1]);
  const HT=HOMETOWN_LINES; for(const [who,key] of [['kexin','night'],['kexin','river'],['classmate_peishan','park'],['classmate_peishan','books']]){ const x=HT[who].again.find(a=>a.key===key); L.push(...flat(x.lines.slice(1),fresh0)); }
  for(const id of ['ev_vf_y2w_0116','ev_vf_y3w_0108','ev_vf_y3_0214']){ const ev=STORY_EVENTS.find(e=>e.id===id); for(const s of (ev?ev.dialogue:[])){ if(s.text&&s.text.indexOf('X.')<0&&!Object.values(VACFILL_LINES).some(v=>v&&typeof v==='object'&&Object.values(v).includes(s.text))) L.push(s.text); if(s.choice) for(const c of s.choice) L.push(c.text); } }
  if(HOME.BREAK_SKIP_Y) for(const k in HOME.BREAK_SKIP_Y) L.push(...HOME.BREAK_SKIP_Y[k],...HOME.BREAK_SKIP_DORM_Y[k]);
  for(const d of HOME_LINES.dinner.filter(x=>x.n>=9)){ L.push(d.mom,d.dad,...d.opts.map(o=>o.t)); }
  const bad=L.filter(t=>!doc.includes(strip(t)));
  check('0. 新句都在 AA_533 稿裡（一字不差；'+L.length+' 句）',L.length>=110&&!bad.length,J(bad));
  const Al=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files.find(e=>e.path===A533);
  check('0. 白名單有 AA_533（cf0066ed2、approved、AA-B 定稿（D109））',!!Al&&Al.sha==='cf0066ed2'&&Al.status==='approved'&&Al.approvedBy==='AA-B 定稿（D109）',J(Al)); }

(async()=>{
  /* ================= 1 C13 和女朋友 ================= */
  const trip=async(who,dest,from,days,prev)=>{ const G=H.fresh(from,7,'dorm'); G.flags['dating_'+who]=true; const V=VAC.rec(G); V.t13=(prev||[]).concat([{n:(prev||[]).length+1,dest,from:D(from),to:D(from)+days,with:who,gf:true,season:'summer'}]); H.said=[]; await VAC.trip13(GM,'T13#'+V.t13.length,null); return H.lines(); };
  { const De=TV.dest.eu, L=await trip('heroine_01','eu','2027-07-12',9), nm=SOCIAL.displayName('heroine_01'), g=TV.gf.heroine_01;
    const want=[g.arr[0],nm+'：'+g.arr[1],De.keys[1],g.mid[0],nm+'：'+g.mid[1],De.keys[2],nm+'：'+g.last,'（燈關了。）'];
    check('1. 和以安去歐洲十天：到了（取代目的地第一句）→ 中間（目的地第二句＋她）→ 最後一晚（目的地第三句＋last）→ 燈關了',J(L)===J(want)&&!L.includes(De.keys[0]),J(L)); }
  { const ok=[]; for(const id of ['heroine_02','heroine_03','heroine_04','heroine_05','kexin','classmate_peishan']){ const L=await trip(id,'jp','2027-07-12',4), g=TV.gf[id]; ok.push([id,L.length>=7&&L[0]===g.arr[0]&&L.some(t=>t.endsWith('：'+g.mid[1]))&&!L.includes(TV.dest.jp.keys[0])]); }
    check('1. 其他六位：第一天是她的「到了」、中間有她那一句（不再有一個人旅行的第一句）',ok.every(x=>x[1]),J(ok)); }
  { const L1=await trip('classmate_peishan','kr','2026-08-03',3), L2=await trip('classmate_peishan','hk','2027-07-12',3,[{n:1,dest:'kr',from:D('2026-08-03'),to:D('2026-08-06'),with:'classmate_peishan',gf:true,done:true,season:'summer'}]);
    check('1. 沛珊「我第一次出國耶。……好好玩。」只給第一次和她出國的',L1.some(t=>t.endsWith('我第一次出國耶。……好好玩。'))&&!L2.some(t=>t.includes('我第一次出國耶')),J([L1.slice(-2),L2.slice(-2)])); }
  { const G=H.fresh('2027-07-12',7,'dorm'); const V=VAC.rec(G); V.t13=[{n:1,dest:'jp',from:D('2027-07-12'),to:D('2027-07-16'),with:'kai',season:'summer'}]; H.said=[]; await VAC.trip13(GM,'T13#1',null); const L=H.lines();
    check('1. 和朋友去照舊（目的地三句＋最後一晚朋友一句）',L[0]===TV.dest.jp.keys[0]&&L.length===4&&L[3].endsWith('下次換你排行程。'),J(L)); }

  /* ================= 2 活動卡 ================= */
  const play=async(k,I,picks)=>{ H.said=[]; H.picks=picks||[]; await VAC.key(GM,k,I); return H.lines(); };
  { const G=H.fresh('2028-07-11',18,'dorm'); const I=VAC.inst('C03','Y3'); const L1=await play(keyOf('C03','第一堂'),I,['想去日本交換']), opt=H.opts[0];
    const L2=await play(keyOf('C03','小考'),I), L3=await play(keyOf('C03','最後一堂'),I);
    check('2-1. C03 以安沒去（大三）：第一堂上班族大姊＋「我也是。」「想去日本交換。」→「那你要比我認真。」',J(opt)===J(['「我也是。」','「想去日本交換。」'])&&L1[0]==='（教室很小，十二個位子。你旁邊坐著一個上班族大姊，筆記本上已經寫滿了平假名。）'&&L1[1]==='上班族大姊：我是為了看日劇才來的。你呢？'&&L1[2]==='上班族大姊：那你要比我認真。',J([opt,L1]));
    check('2-1. 小考、最後一堂也有大姊（原本沒有句子、不開畫面）',J(L2)===J(['（小考發回來。大姊比你多錯兩題，她把考卷折起來，收進包包。）','上班族大姊：……下次。'])&&J(L3)===J(['（下課的時候，大姊說她下一期要上中級班。）','上班族大姊：中級班，我們看誰先去。'])&&VAC.hasLines(G,keyOf('C03','小考')),J([L2,L3]));
    const G2=H.fresh('2026-07-07',18,'dorm'); SOCIAL.remember('heroine_01','FIRST_MET',''); const La=await play(keyOf('C03','第一堂'),VAC.inst('C03','Y1'),[0]);
    check('2-1. 以安有去的照舊（「你也來了。」，沒有大姊）',La.some(t=>t.endsWith('你也來了。'))&&!La.some(t=>t.includes('上班族大姊')),J(La)); }
  { const G=H.fresh('2026-07-20',19,'dorm'); const I=VAC.inst('C04','Y1'), L=await play(keyOf('C04','模擬考'),I);
    check('2-2. C04 模擬考：旁白後面 Kevin「聽力不要一邊聽一邊翻成中文。來不及的。」',J(L)===J(['第一次模擬考。聽力的速度比你想的快很多。','Kevin：聽力不要一邊聽一邊翻成中文。來不及的。']),J(L));
    const ek=keyOf('C04','正式考試'); at(D('2026-08-12'),9.5); await play(ek,I); at(D('2026-08-12'),11.9); PHONE.tick(H.G); const before=(H.G.msgs||[]).filter(m=>m.from==='kevin').length; at(D('2026-08-12'),12); PHONE.tick(H.G); const km=(H.G.msgs||[]).filter(m=>m.from==='kevin').map(m=>m.th+'|'+m.text+'|'+m.h);
    check('2-2. 正式考試：考完 12:00 Kevin 私訊「考完了吧？今天不要再看單字了。」',before===0&&J(km)===J(['p:kevin|考完了吧？今天不要再看單字了。|12']),J(km));
    const rep=VAC.repKey(H.G,Object.assign({},I),3,ek); check('2-2. 第二次以後照 AA_264 一句（rep 沒有私訊）',true&&(()=>{ const V=VAC.rec(H.G); V.reg['C04W@Y2']='done'; V.nth=V.nth||{}; const I2=VAC.inst('C04','Y2'); V.nth[I2.key]=2; const r=VAC.repKey(H.G,I2,3,ek); return !!r&&!r.msg&&r.lines.length===1; })()); }
  { const c11=keyOf('C11','最後一晚'); const G=H.fresh('2027-01-29',19,'dorm'); SOCIAL.remember('heroine_01','FIRST_MET',''); const La=c11?await play(c11,VAC.inst('C11','Y2')):[]; const oa=H.opts.length;
    const G3=H.fresh('2028-01-29',19,'dorm'); const Lb=c11?await play(c11,VAC.inst('C11','Y3'),['會吧']):[]; const ob=H.opts[0];
    check('2-3. C11 第一次去：01-29 20:00 最後一晚（交誼廳煮泡麵）＋同團的學生「你明年還要來嗎？」＋「看情況。」「會吧。」→「……你是真的喜歡這裡。」',!!c11&&c11.day==='01-29'&&c11.h===20&&J(Lb)===J(['（最後一晚。同團的人在交誼廳煮泡麵，有人帶了一包臺灣的辣椒醬。）','同團的學生：你明年還要來嗎？','同團的學生：……你是真的喜歡這裡。'])&&J(ob)===J(['「看情況。」','「會吧。」']),J([Lb,ob]));
    check('2-3. 以安也去（大二）：換成她「明天的飛機十點。……行李我昨天就收好了。」、沒有選項',La.length===2&&La[1].endsWith('明天的飛機十點。……行李我昨天就收好了。')&&oa===0,J(La));
    const I3=VAC.inst('C11','Y3'), V=VAC.rec(H.G); V.nth=V.nth||{}; V.nth[I3.key]=2; check('2-3. 第二次以後：這一場不演（rep.keys2 照舊兩句）',c11&&VAC.repKey(H.G,I3,2,c11)===null&&A.C11.rep.keys2.length===2); }
  { const k=keyOf('C12','文化課：茶道'); const G=H.fresh('2028-08-19',13,'dorm'); const L=await play(k,VAC.inst('C12','Y3'));
    const G2=H.fresh('2027-08-19',13,'dorm'); SOCIAL.rel('heroine_01').fam=30; SOCIAL.remember('heroine_01','FIRST_MET',''); const La=await play(k,VAC.inst('C12','Y2'));
    check('2-4. C12 以安不在：茶道課後面老師「轉兩次，是讓客人看到最漂亮的那一面。」；以安在的那一年沒有',L.length===3&&L[2]==='茶道老師：轉兩次，是讓客人看到最漂亮的那一面。'&&La.length===2,J([L,La])); }

  /* ================= 3 回她的縣市 ================= */
  { const HT=HOMETOWN_LINES, g=(w,k)=>flat(HT[w].again.find(a=>a.key===k).lines,H.G);
    check('3. 再去：可昕夜市、愛河，沛珊公園、書店各加旁白＋一句（接在原本那一句後面）',J(g('kexin','night'))===J(['這攤我從小吃到大。……你吃得完再說。','（她點了三樣，每一樣都先吃一口，再推過來。）','這樣你每一樣都吃得到。'])&&g('kexin','river').length===3&&g('kexin','river')[2]==='我國中的時候，在這裡跟朋友說要去臺北念大學。……她們都不信。'&&g('classmate_peishan','park')[2]==='就是這裡。我第一次自己騎到這裡，回頭看，我爸站在很遠的地方。'&&g('classmate_peishan','books')[2]==='……還太早了。我先看小說。'&&J(HT.kexin.again.find(a=>a.key==='river').dating)===J(['……下次住一晚啦。']),''); }

  /* ================= 4 小出遊、海邊 ================= */
  const runEv=async(id,picks)=>{ H.said=[]; H.picks=picks||[]; await EVENTS.run(STORY_EVENTS.find(e=>e.id===id)); return H.lines(); };
  { H.fresh('2027-01-16',18,'dorm'); const L=await runEv('ev_vf_y2w_0116'), yt=SOCIAL.displayName('heroine_03');
    check('4-1. 麵店長桌：兩句旁白中間「（語彤端麵過來…）」、語彤「寒假人少。阿姨煮得比較慢。」、Alison「慢沒關係！我餓到可以等！」',L.length===5&&L[1]==='（語彤端麵過來，順手把你的筷子擺正。）'&&L[2]===yt+'：寒假人少。阿姨煮得比較慢。'&&/：慢沒關係！我餓到可以等！$/.test(L[3])&&L[0]===VACFILL_LINES.y2w_0114.narr&&L[4]===VACFILL_LINES.y2w_0114.narr2,J(L));
    H.fresh('2028-01-08',15,'dorm'); const L2=await runEv('ev_vf_y3w_0108');
    check('4-2. 參創：旁白後面子晴兩句',L2.length===3&&/：這台是我學長做的。他去年也在這裡排隊，排到最後一個。$/.test(L2[1])&&/：……明年我也要有一台。$/.test(L2[2]),J(L2));
    H.fresh('2028-02-14',10,'dorm'); const L3=await runEv('ev_vf_y3_0214',['補上學期']); const o3=H.opts[0]; H.fresh('2028-02-14',10,'dorm'); const L4=await runEv('ev_vf_y3_0214',['預習']);
    check('4-3. 法圖：學姊兩句＋「補上學期的。」「預習下學期的。」兩種回覆',J(o3)===J(['「補上學期的。」','「預習下學期的。」'])&&/：……你是哪一種？$/.test(L3[2])&&/：（把一本書從書架抽出來，放在你手上）這本。$/.test(L3[3])&&L3.length===4&&/：嗯。那你比我大二的時候好。$/.test(L4[3])&&L4.length===4,J([L3,L4])); }
  { const out={}; for(const [yk,n] of [['Y2',1],['Y3',2]]){ const G=H.fresh(yk==='Y2'?'2026-08-20':'2027-08-20',8,'dorm'); G.flags.VA03_BEACH='went'; if(n===2) VAC.rec(G).c01={Y2:'done'}; H.said=[]; await VAC.outing(GM,{vac:{key:'C01#'+yk}}); out[yk]=H.lines(); }
    check('4-5. 海邊第二次：第一句後面阿哲「防曬跟乳液，差很多嗎？」；第三次：Alison「去年那塊石頭！大家站好，我數到三！」；三句旁白照舊',out.Y2.length===4&&/：防曬跟乳液，差很多嗎？$/.test(out.Y2[1])&&out.Y2[0]===VAC_DATA.C01.diary[2][0]&&out.Y3.length===4&&/：去年那塊石頭！大家站好，我數到三！$/.test(out.Y3[1])&&out.Y3[2]===VAC_DATA.C01.diary[3][1],J(out)); }

  /* ================= 5 快轉旁白、摘要池、晚餐 ================= */
  { const L=(k,mid,dorm)=>{ const G=H.fresh(k,10,'dorm'); const B=HOME.lawBreak(G); HOME.rec(G).bskip=null; HOME.rec(G).bskipD=null; return HOME.breakSkipLine(G,T(D(mid),10),T(D(mid),10),dorm?{dorm:true}:{}); };
    const y1=L('2025-12-25','2025-12-25'), y2=L('2027-01-01','2027-01-01'), y2e=L('2027-01-01','2027-02-06'), y4l=L('2029-01-01','2029-02-15'), y3s=L('2027-07-01','2027-07-15'), d4=L('2029-01-01','2029-01-02',true), d2s=L('2027-07-01','2027-08-10',true);
    check('5-1. 快轉旁白：大一照舊；大二起照那一年（住家裡、宿舍各五列；四格的挑法照舊）',y1===HOME.BREAK_SKIP.winter[0]&&y2==='寒假的早上。姊姊的房間空著，媽媽每天還是開窗。'&&y2e==='過年的幾天，親戚問的換成：交女朋友了沒。'&&y4l==='寒假的最後一週。書桌上的燈，每天開到十二點。'&&y3s==='七月。巷口的冰店排隊排到隔壁。'&&d4==='寒假的宿舍。409 只剩你一個，連冰箱的聲音都聽得到。'&&d2s==='八月。颱風假，宿舍的人都待在交誼廳看新聞。',J([y1,y2,y2e,y4l,y3s,d4,d2s])); }
  { const G=H.fresh('2026-01-20',8,'dorm'); const P=VACFILL_LINES.POOL.dorm.winter; const a=VACFILL.poolNext(G,'Y1W','dorm','winter'), b=VACFILL.poolNext(G,'Y1W','dorm','winter'), c=VACFILL.poolNext(G,'Y2W','dorm','winter');
    const G2=H.fresh('2027-01-20',8,'dorm'); VACFILL.rec(G2).pool={'Y1W:dorm':5,'Y1S:dorm':3}; const d=VACFILL.poolNext(G2,'Y2W','dorm','winter');
    check('5-2. 摘要池不分假期：大二寒假接著大一寒假往下輪（不從第 1 句重來）；舊存檔照舊的同一季計數接下去',a===P[0]&&b===P[1]&&c===P[2]&&d===P[5%P.length],J([a,b,c,d])); }
  { const dn=HOME_LINES.dinner, n9=dn.find(d=>d.n===9), n10=dn.find(d=>d.n===10), n11=dn.find(d=>d.n===11);
    check('5-3. 晚餐題目加三個（n 9～11；第一題 winter、爸爸那一句 dadOnly）；home_lines.js 由匯入工具產生（來源寫 AA_533）',!!n9&&n9.mom==='你姊說她過年可能要加班。'&&J(n9.opts.map(o=>o.t))===J(['出版社也加班？','那年夜飯呢？'])&&n9.winter===true&&n9.dadOnly===true&&!!n10&&n10.dad==='（點了一下頭）先讀書。'&&!!n11&&n11.dad==='（笑了一下）她動了。'&&/AA_533 cf0066ed2/.test(HOME_LINES.source),'');
    const can=(k)=>{ const G=H.fresh(k,19,'dorm'); const seen=new Set(); for(let i=0;i<40;i++){ const Hm=HOME.rec(G); Hm.ate={}; Object.assign(Hm.ate,Object.fromEntries([...Array(i)].map((_,j)=>[100+j,0]))); const d=HOME.dinnerPick(G); if(d) seen.add(d.n); } return seen; };
    const dec=can('2026-12-12'), jan=can('2027-01-25'), feb=can('2027-02-10'), jul=can('2027-07-10');
    check('5-3. 第一題只在寒假（12 月～除夕前）會被挑到；其他兩題平常也會',dec.has(9)&&jan.has(9)&&!feb.has(9)&&!jul.has(9)&&jul.has(10)&&jul.has(11),J([[...dec],[...jan],[...feb],[...jul]]));
    const eat=async(k,n)=>{ const G=H.fresh(k,19,'dorm'); const real=HOME.dinnerPick; HOME.dinnerPick=()=>HOME_LINES.dinner.find(d=>d.n===n); H.said=[]; H.picks=[0]; try{ await HOME.dinner(GM); } finally{ HOME.dinnerPick=real; } return H.lines(); };
    const away=await eat('2027-07-10',11), home=await eat('2027-02-05',11), old=await eat('2027-07-10',7);
    check('5-3. 爸爸在上海＝爸爸那一句不出（不改成媽媽說）；過年爸爸在家＝「爸爸：（笑了一下）她動了。」；舊的題目照舊媽媽收尾',!away.some(t=>t.includes('她動了'))&&away.some(t=>t==='媽媽：你的房間我幫你整理了，抽屜沒動。')&&home.includes('爸爸：（笑了一下）她動了。')&&old.some(t=>/^媽媽：（笑了一下）先把書念好。$/.test(t)),J({away,home,old})); }
  H.done();
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); console.log('FAILED '+(H.fails+1)); process.exit(1); });
