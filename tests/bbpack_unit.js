// BB 事件包（src/data/bbpack_events.js、src/bbpack3d.js）：BB_105 法律系時期的 P5、日文班 G 系列、博雅 B 系列、女舍 D 系列，BB_106 SK08～SK10、SK14、第 389 行，BB_110 L4。
// 任務：V3-B105-P5、V3-B105-G2、V3-B105-B2、V3-B105（AA_153 的十五件）、V3-SK08、V3-SK09、V3-SK10、V5-SK14、V3-B110-L4、BB106-L389-1022。不需要瀏覽器。
// 檢查：0 讀稿（每一句都在稿裡；稿上沒有字、這裡補的動作或說明列在 COMPOSED）、index.html、沒有「小語」
//   1 日文班：G1（第一次去上日文，第 1 週的點名換成 G1）、G2、G3、G4（期中／期末、日文下多一句）、G4b、G4c（群組、博雅小桌、隔天、沒去）、G5、G6、G7
//   2 博雅：B6（芯慈私訊、阿勳在門口、講座的兩種進場）→ SK09（聽完、ECON_LAW_BRIDGE、沒去的群組）、B7、B8、B10（匯率那一句）、B10b、B12、B13
//   3 女舍：D4c、D5、D6、D8　4 P5　5 SK08、SK10、SK14、可昕和品妤（第 389 行）　6 L4a～c
// 修改前（開發分支 ecffe0ddd）：沒有這兩個檔——全部 FAIL。用法：node tests/bbpack_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H;
const load=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); return true; };
let ok1=false, ok2=false, err=''; try{ ok1=load('src/data/bbpack_events.js'); ok2=load('src/bbpack3d.js'); }catch(e){ err=String(e); }
const X=()=>typeof BBPACK!=='undefined'?BBPACK:null;
const git=(sha,f)=>{ try{ return cp.execSync('git show '+sha+':"docs/story_planning/'+f+'"',{cwd:H.ROOT,encoding:'utf8',maxBuffer:1<<26}); }catch(e){ return ''; } };
const DOCS={ B105:git('3954f9b62','BB_105_四個地點的跨學年故事.md'), B137:git('a047e5feb','BB_137_AB05台詞_日文班博雅女舍十五件.md'), A153:git('c7f4ada86','AA_153_BB105一列事件_規格骨架.md'),
  B106:git('3954f9b62','BB_106_社會科學院與附近教學館_跨學年日常事件.md'), B110:git('3a26e94af','BB_110_日常內容_好玩事件_颱風假_社團_打工.md'), A383:git('bc8a1f5d4','AA_383_回BB_0400_五題_台詞與企劃對不上.md') };
const ALLDOC=Object.values(DOCS).join('\n');
const PS='classmate_peishan', AN='heroine_01', YT='heroine_03', ZR='heroine_02', SIS='heroine_05', XC='classmate_xinci', BH='classmate_bohan', MX='classmate_mingxuan';
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const J=JSON.stringify;
const TD=(t,w,wd)=>STORY.termDayIn(t,w,wd);
const setDay=(d,h)=>{ const G=H.G; G.day=d; G.hour=h; const w=CALENDAR.dateOf(d).wd; G.weekday=w===7?0:w; };
const fresh=(t,w,wd,h,o)=>{ o=o||{}; const d=TD(t,w,wd); const G=H.fresh('2026-01-01',h,o.zone||'campus',o.flags||{}); setDay(d,h); G.outings=[]; G.contacts=G.contacts||{};
  for(const id of (o.know||[])) H.FAMILIAR(id); for(const id of (o.friend||[])) H.FRIEND(id); for(const id of (o.contact||[])) G.contacts[id]=d-30; H.E.zone.roomAt=o.room?()=>o.room:()=>null; EVENTS.zoneChanged(); return G; };
const said=()=>H.said.map(s=>s.t);
const who=()=>H.said.map(s=>(s.who||'')+'：'+s.t);
const run=async(id,picks)=>{ H.said=[]; H.opts=[]; H.bgs=[]; H.picks=(picks||[]).slice(); await EVENTS.run(ev(id)); return said(); };
const chk=id=>EVENTS.check(ev(id));
const rules=()=>{ X().phone(H.G); PHONE.tick(H.G); };
const msgs=th=>H.msgs(th);
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（中斷這一節）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const itOf=(cid,w,o)=>{ const G=H.G, c=CLS.byId(cid); return Object.assign({c,week:w,exam:null,term:c.term,t0:13+20/60,t1:15+10/60,day:G.day,key:G.day+':'+cid+':pm1',room:{}},o||{}); };
const findDay=(t,weeks,wd,salt,p,pred)=>{ for(const w of weeks){ const d=TD(t,w,wd); if(d==null) continue; const G={day:d}; if(X().roll(G,salt)<p&&(!pred||pred(d,w))) return {d,w}; } return null; };

/* 稿上沒有字、這裡補的（稿上的動作或說明改成旁白、選項的動作、場景字幕；每一句的理由寫在事件檔的註解）*/
const COMPOSED=new Set(['（打招呼）','（不打擾）','（柏翰在女舍門口等沛珊。）','「第一個。」','「第二個。」','「第三個。」','學活・自助餐']);   /* 舊序章人物那幾場用的 16 句（CANON-NO-ECON-1112 第三批：這一項拿掉）*/
const norm=t=>String(t).replace(/\{name\}/g,'祐廷').replace(/^（[^）]*）(?=.)/,'').replace(/^[（「]/,'').replace(/[）」]$/,'').replace(/[。：]$/,'');

(async()=>{
  /* ======================= 0 ======================= */
  check('0. 讀稿（企劃線：BB_105／BB_106 @3954f9b62、BB_137 @a047e5feb、AA_153 @c7f4ada86、BB_110 @3a26e94af、AA_383 @bc8a1f5d4）',Object.values(DOCS).every(d=>d.length>2000)&&DOCS.A383.indexOf('## 7. 可昕來首都帝大')>=0&&DOCS.B137.indexOf('### 3-1. D4c')>=0,Object.entries(DOCS).map(([k,v])=>k+':'+v.length).join(' '));
  check('0. 新檔載得到：BBPACK、BBPACK_EVENTS 都進了 STORY_EVENTS',ok1&&ok2&&!!X()&&BBPACK_EVENTS.length>=30&&BBPACK_EVENTS.every(e=>STORY_EVENTS.includes(e)),err);
  if(!X()){ H.done(); return; }
  await sec('0',async()=>{
  /* 2026-11-11（X327 沛珊重寫，AA_763_peishan_misc3.json@62460ea75）：B13 不打擾的旁白、D5 她下樓那一句換字（原本「…畫了一個小小的荷包蛋。」「你來了！……不用謝，我順便印的。」）——這兩句對 AA_763（tests/peishan_misc3_1111_unit.js），不在 BB_105 */
  const PS763=new Set(['沛珊把耳機戴上，在筆記本的邊角畫了一隻很胖的貓。','你來了！不用謝，我順便印的。']);
  /* 2026-11-11（X327 沛珊重寫，AA_766_peishan_leftover2.json@1e647bb05）：D4c「沛珊的問題」四題 25 句換字（她自己就是法律系；第 3 題原本問早餐＝作廢的早餐店設定）——這幾句對 AA_766 的 rows（tests/peishan_leftover2_1111_unit.js），不在 BB_137 */
  const PS766=new Set((()=>{ try{ return JSON.parse(git('1e647bb05','AA_766_peishan_leftover2.json')).rows.filter(r=>r.file==='src/data/bbpack_events.js').map(r=>r.new); }catch(e){ return []; } })());
  { const bad=[], seen=new Set(); const T=t=>{ if(typeof t!=='string'||seen.has(t)) return; seen.add(t); if(COMPOSED.has(t)||PS763.has(t)||PS766.has(t)) return; if(require('./canon1112_ok.js').ok(t)) return;   /* （CANON-NO-ECON-1112 第四批：照 AA_890、AA_894 換字）*/ if(require('./kx_rewrite_1112.js').news('src/data/bbpack_events.js').includes(t)) return;   /* 2026-11-12（X324 可昕續改，AA_827_kx_triple_short_2.json@07d50af2f7：手寫檔七句 old→new，清單在 tests/kx_rewrite_1112.js、逐列對稿在 tests/kx_triple2_1112_unit.js）：可昕來找品妤那一句換字（原本「我來找品妤。……順便找你。順序不要問。」，AA_383 第 7 節）——這一句對 AA_827，不在 AA_383 */ if(ALLDOC.indexOf(t)>=0||ALLDOC.indexOf(norm(t))>=0) return; if(require('./aa600_doc.js').has(t)) return;   /* AA_600 B29（企劃線 031414cad）前任那一句旁白在 AA_600 的稿裡 */ bad.push(t); };
    for(const e of BBPACK_EVENTS.filter(e=>!/^ev_kai_keyboard|^ev_b6b_|^ev_b12_/.test(e.id))) for(const l of (e.dialogue||[])){   /* BB_154 阿凱鍵盤（第二輪）照 BB_154 對字：tests/bbpack_r2_unit.js；B6b、B12 照 AA_430 對字：tests/aa430_b6b_b12_unit.js */ if(l.text!==undefined) T(l.text); if(l.scene!==undefined) T(l.scene); for(const c of (l.choice||[])) T(c.text); }
    check('0. 每一句台詞、旁白、選項都在稿裡（稿上的動作、說明改成旁白的照字比；補的 '+COMPOSED.size+' 句列在 COMPOSED）',bad.length===0,bad.slice(0,8).join('｜'));
    const used=[...COMPOSED].filter(t=>seen.has(t)); check('0. COMPOSED 每一句都真的用到（沒有多列）',used.length===COMPOSED.size,[...COMPOSED].filter(t=>!seen.has(t)).join('｜')); }
  { const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'), a=html.indexOf('src/data/bbpack_events.js'), b=html.indexOf('src/bbpack3d.js'), c=html.indexOf('<script>GAME.boot();</script>');
    /* 2026-10-28 改：AA_497（tests/aa497_supporting_unit.js）的 data/sup497_lines.js、sup497_3d.js 接在 bbpack3d.js 後面、GAME.boot() 前面——中間只能是這兩支 */
    const mid=[...html.slice(b,c).matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>f!=='src/aa524_3d.js');   /* 2026-10-30：AA_524 的 src/aa524_3d.js 接在 sup497_3d.js 後面（tests/aa524_promises_unit.js 查順序）*/
    check('0. index.html：bbpack_events.js、bbpack3d.js 接在 GAME.boot() 前面（中間只有 AA_497 的兩支，後面可以接一鍵 onetap3d.js）',a>0&&b>a&&c>b&&JSON.stringify(mid.slice(0,2))===JSON.stringify(['src/data/sup497_lines.js','src/sup497_3d.js'])&&mid.slice(2).every(f=>['src/onetap3d.js'].includes(f)),JSON.stringify(mid)); }
  { const src=fs.readFileSync(path.join(H.ROOT,'src/data/bbpack_events.js'),'utf8')+fs.readFileSync(path.join(H.ROOT,'src/bbpack3d.js'),'utf8');
    check('0. 沒有「小語」（改名 Alison）、學姊沒有「重點是」、可昕沒有「假設」',src.indexOf('小語')<0&&src.indexOf('重點是')<0&&!/kexin','[^']*假設/.test(src)); }
  check('0. 接線：STORY.PHONE_RULES、CLS.IN_CLASS（G1、G6，各有 due）',STORY.PHONE_RULES.length>0&&CLS.IN_CLASS.includes(X().inClass.g1)&&CLS.IN_CLASS.includes(X().inClass.g6)&&typeof X().inClass.g1.due==='function'&&typeof X().inClass.g6.due==='function');
  check('0. 博思午後講座 B6、B7、B8、B10b、B12 進了活動清單（博思 101，聽演講）',['B6','B7','B8','B10b','B12'].every(id=>{ const a=ACTIVITIES.list.find(q=>q.id===id); return a&&a.zone==='boya'&&a.room==='101'&&a.kind==='lecture'; }));
  { const on=(id,t,w,wd)=>ACTIVITIES.on(ACTIVITIES.list.find(q=>q.id===id),TD(t,w,wd),{flags:{}});
    check('0. 講座的日子：B6 大二上第 6 週週二、B7 大二下第 6 週週三、B10b 大二下第 11 週週二、B8 大三上第 5 週週五、B12 大三上第 10 週週四（AA_430 2-1「週四晚上七點」；原本週二）',on('B6','Y2S1',6,2)&&on('B7','Y2S2',6,3)&&on('B10b','Y2S2',11,2)&&on('B8','Y3S1',5,5)&&on('B12','Y3S1',10,4)&&!on('B6','Y2S1',6,3)); }
  });

  /* ======================= 1 日文班 ======================= */
  await sec('1',async()=>{
  { const G=fresh('Y2S1',1,1,13.3,{zone:'gongtong'}); const it=itOf('japanese_1',1), ct={call:{options:['認真介紹：系級和為什麼來。','搞笑','最短'],follow:['x']},tpl:'C'};
    check('1. G1 due：第一次去上日文（日文上第 1 週）',X().inClass.g1.due(G,it)&&!X().inClass.g6.due(G,it));
    H.said=[]; H.opts=[]; H.picks=['はじめまして。我只會說']; await X().inClass.g1(GM,it,null,ct); const L=said();
    check('1. G1：第 1 週沒有老師開頭那句（課表那句已經說了）、采蓁、立衡、輪到你、三個自我介紹（BB_105 3-3）',L[0]==='はじめまして！獸醫系三年級！我想看懂日劇不用字幕！'&&L[1]==='……機械系四年級。想去日本念書。よろしくお願いします。'&&L[2]==='（輪到祐廷。）'&&J(H.opts[0])===J(['「法律系二年級。……想多會一種語言。」','「はじめまして。我只會說はじめまして。」','「よろしく。」']),J(L));
    check('1. G1 搞笑＝采蓁笑出來；記 JP_MET、加入日文班群組；第 1 週的點名換掉（ct.call 清空、C 改 A）',L.includes('（采蓁笑出來。）')&&G.flags.JP_MET===true&&PHONE.inGroup(G,'jp_class')&&ct.call===null&&ct.tpl==='A');
    check('1. G1 只一次',!X().inClass.g1.due(G,itOf('japanese_1',2)));
    const G2=fresh('Y2S1',3,1,13.3,{zone:'gongtong'}); const ct2={tpl:'A'}; H.said=[]; H.picks=['よろしく。']; await X().inClass.g1(GM,itOf('japanese_1',3),null,ct2);
    check('1. G1 第一次去就不是第 1 週：老師開頭那一句；最短＝老師「……很省。」',said()[0]==='一人ずつ、自己紹介をお願いします。……用中文補充也可以。'&&said().includes('……很省。'),J(said()));
    const G3=fresh('Y2S2',2,1,13.3,{zone:'gongtong'}); check('1. 沒上過日文上的：日文下第一次去也是 G1；G5 不演（沒見過）',X().inClass.g1.due(G3,itOf('japanese_2',2))&&!EVENTS.check(ev('ev_jp_g5'),{chain:true}));
    H.said=[]; H.picks=[0]; const late=CLS.isLateAbsent; CLS.isLateAbsent=()=>true; const r=await X().inClass.g1(GM,itOf('japanese_2',2),null,{}); CLS.isLateAbsent=late;
    check('1. G1：遲到太久（前半堂講完）不演',r===false&&!G3.flags.JP_MET); }
  { const G=fresh('Y2S1',1,1,13.2,{zone:'gongtong'}); const it=CLS.dayItems(G,G.day).find(x=>x.c.id==='japanese_1'); H.said=[]; H.opts=[]; H.picks=[0]; await CLS.attend(GM,it,{inScene:true}); const L=said();
    check('1. 實際上課（CLS.attend）日文上第 1 週：課表那句之後接 G1，課表的自我介紹點名不再問（只有 G1 那一組選項）',L.indexOf('日文老師：一個一個來。用日文說你的名字，中文補充也可以。')>=0&&L.indexOf('はじめまして！獸醫系三年級！我想看懂日劇不用字幕！')>L.indexOf('日文老師：一個一個來。用日文說你的名字，中文補充也可以。')&&H.opts.length===1&&!L.some(t=>/每一種自我介紹/.test(t))&&G.flags.JP_MET===true,J(L));
    const G2=fresh('Y2S2',10,1,13.2,{zone:'gongtong',flags:{JP_MET:true}}); CLS.rec(G2).attend.japanese_2=4; const it2=CLS.dayItems(G2,G2.day).find(x=>x.c.id==='japanese_2'); H.said=[]; H.opts=[]; H.picks=[2]; await CLS.attend(GM,it2,{inScene:true}); const L2=said();
    check('1. 實際上課（CLS.attend）日文下第 10 週：G6（沒有「生活考這個」「所以學語言，是在學看人」）、那一堂記出席（r2y4a 的 G6 回聲讀它）',L2.includes('考試考單字。')&&!L2.some(t=>/生活考這個|是在學看人/.test(t))&&!!CLS.rec(G2).done[it2.key]&&!CLS.rec(G2).abs[it2.key],J(L2)); }
  { const hit=findDay('Y2S1',[2,3,4,5,6],1,'g2',0.4), miss=findDay('Y2S1',[2,3,4,5,6,7],1,'g2',2,(d)=>X().roll({day:d},'g2')>=0.4);
    check('1. G2：找得到擲中和沒擲中的週一（四成）',!!hit&&!!miss);
    const G=fresh('Y2S1',hit.w,1,15.2,{zone:'gongtong',flags:{JP_MET:true}}); const it=itOf('japanese_1',hit.w);
    H.said=[]; H.opts=[]; H.picks=['おばあさん']; await CLS.afterClassEvent(GM,it); let L=said();
    check('1. G2 下課（afterClass）：練習搭檔兩句、第 1 題長音、選おばあさん＝阿嬤那句、第一次多一句記 JP_PARTNER（BB_137 1-1）',L[0]==='練習搭檔！老師說要找人互相聽。'&&L[1]==='兩個字，你選一個念，我們猜你念哪個。'&&L[2]==='おばさん和おばあさん。差一個長音。'&&L.includes('阿嬤！拉得很長，很有誠意。')&&L.includes('以後練習就找你了，搭檔。')&&G.flags.JP_PARTNER===true&&G.flags.JP_FAM_CAIZHEN===1&&G.flags.JP_FAM_LIHENG===1,J(L));
    H.said=[]; H.picks=['きって']; await EVENTS.run(ev('ev_jp_g2')); await EVENTS.run(ev('ev_jp_g2')); L=said();
    check('1. G2 題目照順序（第 2 題ビル、第 3 題きって）、「搭檔」只說一次',L.includes('ビル和ビール。一樣差一個長音。')&&L.includes('きて和きって。中間要停一拍。')&&!L.includes('以後練習就找你了，搭檔。'),J(L));
    setDay(miss.d,15.2); check('1. G2 沒擲中的那週不演',!EVENTS.check(ev('ev_jp_g2'),{chain:true})); }
  { const hit=findDay('Y2S1',[2,3,4,5,6,7,10,11],1,'g3',0.5);
    const G=fresh('Y2S1',hit.w,1,13.0,{zone:'gongtong',flags:{JP_MET:true}}); const it=itOf('japanese_1',hit.w);
    check('1. G3 上課前（beforeClass）：提早到（13:00）才演，13:25 不演',EVENTS.check(ev('ev_jp_g3'),{chain:true})&&(()=>{ G.hour=13.42; const r=!EVENTS.check(ev('ev_jp_g3'),{chain:true}); G.hour=13.0; return r; })());
    H.said=[]; H.opts=[]; H.picks=['「辛苦了。」']; await CLS.beforeClassEvent(GM,it); let L=said();
    check('1. G3 第 1 題お疲れさまです、猜對記 JP_DRAMA_1（BB_137 1-2）',L[0]==='欸，考你。昨天的日劇有一句——'&&L[1]==='お疲れさまです。'&&L.includes('對！日劇裡上班的人，一天說二十次。')&&G.flags.JP_DRAMA_1===true&&J(G.flags.JP_G3_USED)==='[1]',J(L));
    H.picks=['「現在幾點？」']; await EVENTS.run(ev('ev_jp_g3')); H.said=[]; H.picks=['「其實很在意。」']; await EVENTS.run(ev('ev_jp_g3')); L=said();
    check('1. G3 不重複：第 2 題猜錯不記、第 3 題兩個答案都算對',!G.flags.JP_DRAMA_2&&G.flags.JP_DRAMA_3===true&&L.includes('你很懂日劇！說這句的人，九成都很在意。'));
    G.flags.JP_G3_USED=[1,2,3,4,5]; check('1. G3 五題用完就沒有',!EVENTS.check(ev('ev_jp_g3'),{chain:true})); }
  { const d7=TD('Y2S1',7,1); const G=fresh('Y2S1',7,1,15.2,{zone:'gongtong',flags:{JP_MET:true}}); const forceRoll=X().roll; X().roll=()=>0;
    H.said=[]; H.picks=['「一起讀。」']; const h0=G.hour; await CLS.afterClassEvent(GM,itOf('japanese_1',7)); X().roll=forceRoll; const L=said();
    check('1. G4 期中版（第 7 週下課，比 G2 先演）：一起讀＝一個小時、記 JP_VOCAB_期中（BB_137 1-3）',L[0]==='下週期中。我把單字做成卡片了。'&&L.includes('高的那疊是我的。')&&G.flags.JP_VOCAB_期中===true&&Math.abs(G.hour-h0-1)<1e-6&&!L.includes('練習搭檔！老師說要找人互相聽。'),J(L));
    const G2=fresh('Y2S2',16,1,15.2,{zone:'gongtong',flags:{JP_MET:true}}); H.said=[]; H.picks=['「我先走了。」']; await CLS.afterClassEvent(GM,itOf('japanese_2',16,{exam:'final'})); const L2=said();
    check('1. G4 期末版（第 16 週口試考完，afterExam）：日文下多一句「一年了耶」；先走＝采蓁那句',L2[0]==='口試考完了。還有筆試。'&&L2.includes('一年了耶。我們從はじめまして，讀到這裡。')&&L2.includes('好！じゃあね！考試加油！'),J(L2));
    const G3=fresh('Y2S1',16,1,15.2,{zone:'gongtong',flags:{JP_MET:true}}); H.said=[]; await CLS.afterClassEvent(GM,itOf('japanese_1',16,{exam:'final'})); check('1. G4 日文上的期末版沒有「一年了耶」',said()[0]==='口試考完了。還有筆試。'&&!said().includes('一年了耶。我們從はじめまして，讀到這裡。')); }
  { const G=fresh('Y2S1',12,1,15.2,{zone:'gongtong',flags:{JP_MET:true}}); H.said=[]; H.bgs=[]; H.picks=['「一起去。」']; const h0=G.hour; await CLS.afterClassEvent(GM,itOf('japanese_1',12)); const L=said();
    check('1. G4b 第 12 週下課：一起去＝2D 學活（底圖小松）、日文上的兩句、+40 分、宇恆熟悉 +1（BB_137 1-4）',L[0]==='小考考完了。我要吃東西，腦袋沒電。'&&L.includes('我寫了「きのう、ねました」。昨天睡了。')&&L.includes('那是事實吧。')&&Math.abs(G.hour-h0-40/60)<1e-6&&G.flags.JP_FAM_YUHENG===1&&H.bgs.some(b=>b&&b.image&&/xiaofu/.test(b.image)),J(L));
    const G2=fresh('Y2S2',12,1,15.2,{zone:'gongtong',flags:{JP_MET:true}}); H.said=[]; H.picks=['「今天不行。」']; await CLS.afterClassEvent(GM,itOf('japanese_2',12)); G2.hour+=1; PHONE.tick(G2);
    check('1. G4b 不去：日文班群組宇恆一句',msgs('g:jp_class').includes('學活的雞腿飯，我替你吃了。')); }
  { const G=fresh('Y2S1',15,7,20.1,{zone:'boya',room:'study',flags:{JP_MET:true}}); rules();
    check('1. G4c 第 15 週週日 20:00 日文班群組（BB_137 1-5）',msgs('g:jp_class').includes('明天口試，今晚要不要一起練？博思小桌，九點。'));
    G.hour=21.1; check('1. G4c 21:00 走到博思小桌（自習區）才演',chk('ev_jp_g4c1')&&(()=>{ H.E.zone.roomAt=()=>'101'; const r=!chk('ev_jp_g4c1'); H.E.zone.roomAt=()=>'study'; return r; })());
    const L=await run('ev_jp_g4c1',['「客人。」']);
    check('1. G4c 日文上：點餐、扮客人那一段、收尾、記 JP_ORAL_PRACTICE_上',L[0]==='兩個人一組。……宇恆跟我。'&&L.includes('いらっしゃいませ！何名様ですか？')&&L.includes('……ひとりです。')&&L.includes('……那是對的。')&&G.flags.JP_ORAL_PRACTICE_上===true,J(L));
    setDay(TD('Y2S1',16,1),13.2); H.said=[]; await CLS.beforeClassEvent(GM,itOf('japanese_1',16,{exam:'final'}));
    check('1. G4c 隔天口試（第 16 週上課的開頭）：采蓁比讚',said()[0]==='采蓁抽到點餐那題。她回頭對你比了一個讚。');
    const G2=fresh('Y2S2',15,7,20.1,{zone:'campus',flags:{JP_MET:true}}); rules(); setDay(TD('Y2S2',16,1),12.1); rules();
    check('1. G4c 日文下沒去：隔天中午采蓁「我們昨天練了問路那題。」',msgs('g:jp_class').includes('我們昨天練了問路那題。')&&!msgs('g:jp_class').includes('我們昨天練了點餐那題。'));
    const G3=fresh('Y2S2',15,7,21.1,{zone:'boya',room:'study',flags:{JP_MET:true}}); PHONE.at(G3,G3.day,20,[{th:'g:jp_class',text:'x'}],'jp_g4c_Y2S2'); PHONE.tick(G3); const L3=await run('ev_jp_g4c2',['「不知道路的。」']);
    check('1. G4c 日文下：問路、不知道路的那一段、記 JP_ORAL_PRACTICE_下',L3[0]==='三個人一組：問路的、知道路的、不知道路的。'&&L3.includes('すみません、わかりません。')&&L3.includes('老師說要誠實說不知道。你好誠實！')&&L3.includes('明天，說錯了就再說一次。')&&G3.flags.JP_ORAL_PRACTICE_下===true,J(L3)); }
  { const G=fresh('Y2S2',1,1,13.2,{zone:'gongtong',flags:{JP_MET:true}}); H.said=[]; H.picks=['（坐下）']; await CLS.beforeClassEvent(GM,itOf('japanese_2',1)); const L=said();
    check('1. G5 日文下第一次去（上課前）：空出來的位子、坐下＝采蓁和宇恆（BB_105 3-3）',L[0]==='（宇恆坐在第一排。采蓁回頭對你揮手。靠窗那個位子空著。）'&&L.includes('宇恆上學期都坐最後面耶。')&&L.includes('文法跟寫程式很像。有規則。'),J(L));
    const G2=fresh('Y2S2',3,1,13.2,{zone:'gongtong',flags:{JP_MET:true}}); CLS.rec(G2).attend.japanese_2=2; check('1. G5 去上過日文下的不演',!EVENTS.check(ev('ev_jp_g5'),{chain:true})); }
  { const G=fresh('Y2S2',10,1,13.4,{zone:'gongtong',flags:{JP_MET:true}}); const it=itOf('japanese_2',10), ct={tpl:'C',call:{options:['不要。「沒關係，不用了」。','要吧？「沒問題」的意思。','要看說的時候的表情。'],follow:['都有可能。要看前面那一句，和說的人的表情。','考試考單字。生活考這個。']}};
    check('1. G6 due：日文下第 10 週那一堂',X().inClass.g6.due(G,it)&&!X().inClass.g6.due(G,itOf('japanese_2',11)));
    H.said=[]; H.opts=[]; H.picks=[2]; await X().inClass.g6(GM,it,null,ct); const L=said();
    check('1. G6：課表的三個讀法先問，接著 AA-C 審過的五句；課表的收尾（「生活考這個」）不演',L[0]==='老師點到你。'&&J(H.opts[0])===J(['「不要。「沒關係，不用了」。」','「要吧？「沒問題」的意思。」','「要看說的時候的表情。」'])&&L.slice(1).join('｜')==='同一句「大丈夫です」，可以是「沒關係」，也可以是「不用了」。｜要看前面那一句，和說的人的表情。｜所以要看臉？｜……那考試怎麼考？｜考試考單字。'&&ct.call===null,J(L)); }
  { const hit=findDay('Y2S2',[10,11,12,13,14],2,'g7',0.35); const G=fresh('Y2S2',hit.w,2,11,{flags:{JP_MET:true}}); CLS.rec(G).attend.japanese_2=3;
    check('1. G7 日文下後半、經過共同教學館門口、修過日文才演',chk('ev_jp_g7')&&(()=>{ CLS.rec(G).attend.japanese_2=0; const r=!chk('ev_jp_g7'); CLS.rec(G).attend.japanese_2=3; return r; })()&&ev('ev_jp_g7').near.x===2);
    const L=await run('ev_jp_g7',['「恭喜。']);
    check('1. G7：牛皮紙信封、我申請上了、寄照片＝LIHENG_TOLD wish（日本路線 G10 讀它）',L[0]==='（共同教學館門口。立衡手上拿著一個牛皮紙信封。）'&&L[1]==='我申請上了。日本的研究所。'&&L.includes('（他在方格筆記本上寫了一行。）')&&G.flags.LIHENG_TOLD==='wish',J(L)); }
  });

  /* ======================= 2 博雅 ======================= */
  await sec('2',async()=>{
  { const G=fresh('Y2S1',5,6,20.1,{know:[XC],contact:[XC]}); rules();
    check('2. B6 前一個週六 20:00 芯慈私訊兩句（BB_137 2-1）（CANON-NO-ECON-1112 第四批：照 AA_894 換字）',J(msgs('p:'+XC))===J(['週二晚上博思有一場講座。「經濟和法律，在同一張桌子上」。','這場你應該會想聽。']));
    /* B6 門口遇到舊序章人物那幾項（CANON-NO-ECON-1112 第三批：這一項拿掉） */ }
  /* B6 講座裡舊序章人物那幾列、SK09（CANON-NO-ECON-1112 第三批：這一項拿掉） */
  { const G=fresh('Y2S2',6,1,21.1,{know:[YT]}); PHONE.join(G,'noodle_team','桌遊團'); rules();
    check('2. B7 週一 21:00 語彤在桌遊團轉海報',msgs('g:noodle_team').some(t=>/老房子、租屋與城市/.test(t)));
    setDay(TD('Y2S2',6,3),18.9); G.zone='boya'; const a=ACTIVITIES.list.find(q=>q.id==='B7'); H.said=[]; await CLS.attendActivity(GM,a); const L=said();
    check('2. B7 聽演講：提問時間語彤舉手那三句（BB_105 4-4）',L.includes('（提問時間。語彤舉手，停了很久。）')&&L.includes('嗯……老房子拆掉以後，原本在樓下吃麵的人，要去哪裡？')&&L.includes('（講者想了一下：「這是一個很好的問題。我沒有答案。」）')&&G.flags.B7_HEARD===true,J(L));
    fresh('Y2S2',6,3,18.9,{zone:'boya'}); check('2. B7 不認識語彤＝一般的聽演講（沒有她那一段）',CLS.actEvent(H.G,a)===null); }
  { const G=fresh('Y3S1',5,5,17.1,{know:[SIS]}); check('2. B8 大三上第 5 週週五 17:00 博思門口、認識學姊',chk('ev_b8_door'));
    const L=await run('ev_b8_door'); check('2. B8：學姊三句（沛珊那一段拿掉）、記 B8_SEEN',J(L)===J(['（散場的人群裡，學姊抱著筆記走出來，看到你。）','你也來聽？','後半段講法律扶助的教育，我是為那段來的。……先走了，七點還有東西要交。'])&&G.flags.B8_SEEN===true,J(L)); }
  { const X0=X(); const G=fresh('Y4S1',3,2,19.5,{zone:'boya',room:'study',know:['zhe','yu',BH]});
    /* B10 匯率那一句（讀 SK10 的紀錄）（CANON-NO-ECON-1112 第三批：這一項拿掉） */
    G.flags.STUDY_EXCHANGE_RATE=[{t:'Y2S1',r:'two'}]; const roll=X0.roll; X0.roll=()=>0; const okc=chk('ev_b10_table');
    const L=await run('ev_b10_table',['大一民總那一題']); X0.roll=roll;
    check('2. B10 大四平日晚上博思自習區：阿哲開場、懷舊四句（匯率那句（CANON-NO-ECON-1112 第三批：這一項拿掉））（AA_153 第 6 節）',okc&&L[0]==='坐。這桌是國考桌。Alison 說不能講話，所以我們用寫的。'&&!L.some(t=>/^以前這張桌子/.test(t))&&L.includes('網拍標錯價那題，我現在會答了。')&&L.includes('說說看。')&&L.includes('（便利貼）四年了。')&&G.flags.B10_NOSTALGIA===true,J(L));
    setDay(G.day+1,19.5); X0.roll=()=>0; H.said=[]; H.opts=[]; H.picks=['（坐下讀一點）']; await EVENTS.run(ev('ev_b10_table')); X0.roll=roll; const L2=said();
    check('2. B10 第二次：開場輪到 Alison、懷舊選項沒有了、匯率那句不再說',L2[0]==='（推一包餅乾過來，便利貼上寫「吃。不要出聲。」）'&&!H.opts[0].includes('「大一民總那一題……」')&&L2.includes('Alison 在便利貼上寫：「加油。不用回。」')&&!L2.some(t=>/經濟系那幾個/.test(t)),J(L2));
    setDay(TD('Y4S1',12,2),19.5); G.flags.B10_N=2; H.said=[]; await EVENTS.run(ev('ev_b10_table')); check('2. B10 推甄放榜（第 12 週）以後柏翰換那一句',said()[0]==='我上了。我來陪考。……順便讀我自己的。',J(said())); }
  { const G=fresh('Y2S2',11,2,18.4,{zone:'boya',know:[MX,'yu',ZR]}); SOCIAL.rel(ZR).fam=30; const a=ACTIVITIES.list.find(q=>q.id==='B10b');
    H.said=[]; H.picks=['「判決會寫理由。」']; await CLS.attendActivity(GM,a); const L=said();
    check('2. B10b：一百年前的小說、散場明軒、Alison（AA 寫）、芷若（FAMILIAR）兩句＋選項；到場紀錄 attended B10b',L.includes('講者從一本一百年前的小說講起：一個人被審判，到最後都不知道自己犯了什麼罪。')&&L.includes('法律系的聽這個，會坐立難安。')&&L.includes('欸！我中間一直想舉手問，那個人到底犯了什麼？')&&L.includes('我讀的是英文版。德文的我看不懂。')&&L.includes('真好。小說不用寫。')&&ACTIVITIES.attended(G,'B10b'),J(L));
    const G2=fresh('Y2S2',11,2,18.4,{zone:'boya',know:[MX]}); H.said=[]; await CLS.attendActivity(GM,a); check('2. B10b 和芷若不熟＝她不在',!said().includes('我讀的是英文版。德文的我看不懂。')); }
  { const G=fresh('Y3S1',10,1,21.1,{know:[AN]}); PHONE.join(G,'noodle_team','桌遊團'); rules();
    check('2. B12 週一 21:00 桌遊團群組（BB_105 B12 的那句；引號照 AA_430 2-1 用「」）',msgs('g:noodle_team').includes('大一那場「政府可以為了大家，限制一個人嗎」，同一個講者又來了。'));
    setDay(TD('Y3S1',10,4),18.9); G.zone='boya'; SOCIAL.rel(AN).fam=30; G.flags.B5_THOUGHT='trade'; const a=ACTIVITIES.list.find(q=>q.id==='B12'); H.said=[]; await CLS.attendActivity(GM,a); const L=said();
    check('2. B12 散場（沒去過 B4）：以安拿大一的筆記那句（AA_430 2-3 B：B5_THOUGHT 那句只在聽完 B4 的 A 版——B5 要聽完 B4 才有）',L.includes('大一那場你沒來。我把我的筆記給你看——你現在答得出來嗎？')&&!L.some(t=>/你大一寫的是/.test(t)),J(L));
    const G2=fresh('Y3S1',10,4,18.9,{zone:'boya',know:[AN,'yu']}); SOCIAL.rel(AN).fam=5; const k=TD('Y1S2',11,4); ACTIVITIES.rec(G2).att['B4@'+k]={h:19,end:'left'}; H.said=[]; await CLS.attendActivity(GM,a); const L2=who();
    check('2. B12 B4 中途離開、和以安不到 FAMILIAR：Alison 版（AA_430 2-4：「欸，大一那場我也有去。…」；原本 Alison 講以安的「後半場在這裡」）',L2.some(t=>/Alison：欸，大一那場我也有去。那時候我只聽懂一半。$/.test(t))&&!L2.some(t=>/後半場在這裡/.test(t)),J(L2));
    const G3=fresh('Y3S1',10,4,18.9,{zone:'boya',know:[AN]}); ACTIVITIES.rec(G3).att['B4@'+k]={h:19,end:'full'}; check('2. B12 聽完 B4、沒有 B5_THOUGHT：AA_430 2-3 A 有字了，會演',X().b12Due(G3)); }
  { const W=[2,3,4,5,6,7,10,11,12,13,14,15]; let t='Y1S2', hit=findDay(t,W,3,'b13',0.2); if(!hit){ t='Y1S1'; hit=findDay(t,W,3,'b13',0.2); } const G=fresh(t,hit.w,3,16.5,{zone:'boya',room:'study',know:[PS]});
    check('2. B13 週三 16:00～18:00 博思自習區、認識沛珊、兩成',chk('ev_b13_peishan'));
    const L=await run('ev_b13_peishan',['（打招呼）']);
    check('2. B13 打招呼：那學期的三句之一（大一上＝哲學系的講義、大一下＝教育學的書；沒有「七點開始」）、沛珊熟悉 +1',L.length===1&&['你也來這裡。……這裡比總圖安靜。總圖有太多認真的人。','明天讀書會的題目，我先在這裡看一遍。',t==='Y1S1'?'我在讀哲學系的講義。旁聽拿到的。':'我在讀一本教育學的書。……法律的等一下再讀。'].includes(L[0])&&SOCIAL.rel(PS).fam===26,t+' '+J(L));
    EVENTS.zoneChanged(); check('2. B13 一天一次（冷卻）',!chk('ev_b13_peishan'));
    const G2=fresh('Y2S2',3,3,16.5,{zone:'boya',room:'study',know:[PS]}); const roll=X().roll; X().roll=()=>0; check('2. B13 只到大二上（大二下她休學重考，不在學校）',!chk('ev_b13_peishan')&&ev('ev_b13_peishan').term.join()==='Y1S1,Y1S2,Y2S1'); X().roll=roll;
    const L2=await (async()=>{ const G3=fresh('Y1S1',3,3,16.5,{zone:'boya',room:'study',know:[PS]}); H.said=[]; H.picks=['（不打擾）']; await EVENTS.run(ev('ev_b13_peishan')); return said(); })();
    check('2. B13 不打擾：她的一個動作',['沛珊把耳機戴上，在筆記本的邊角畫了一隻很胖的貓。','沛珊抬頭看了你一眼，點點頭，又低頭寫字。'].includes(L2[0]),J(L2)); }
  });

  /* ======================= 3 女舍 ======================= */
  await sec('3',async()=>{
  { const hit=findDay('Y1S1',[10,11,12,13,14,15],4,'d4c',0.5); const G=fresh('Y1S1',hit.w,4,18.4,{know:[PS,AN],flags:{}}); G.events.done.ev_b105_d4_notes=1;
    check('3. D4c 大一上第 10～15 週週四 18:20 女舍門口、參加過 D4、擲中',chk('ev_d4c_question')&&ev('ev_d4c_question').near.x===-93);
    H.said=[]; H.opts=[]; H.picks=[2]; await EVENTS.run(ev('ev_d4c_question')); const L=said();
    check('3. D4c：路燈下、等人的時候、一題（三選一）、以安下樓；熟悉 +1（BB_137 3-1）',L[0]==='（沛珊站在門口的路燈下，抱著講義。）'&&L[1]==='他們還沒下來。等人的時候，我會想一些問題。'&&L[L.length-1]==='門開了，以安下來了。'&&H.opts[0].length===3&&G.flags.D4C_USED.length===1&&SOCIAL.rel(PS).fam===26,J(L));
    G.flags.D4C_USED=[1,2,3]; check('3. D4c 大一上最多三次',!X().d4cDue(G));
    const G2=fresh('Y1S1',hit.w,4,18.4,{know:[PS,AN]}); check('3. D4c 沒參加過 D4 或公法讀書會不演',!chk('ev_d4c_question')); }
  { const d=TD('Y1S1',10,3); const G=fresh('Y1S1',10,3,20.05,{know:[PS]}); PHONE.join(G,'public_law','公法讀書會'); rules();
    const m=(G.msgs||[]).find(q=>q.ask&&q.ask.id==='bb_d5_'+d);
    check('3. D5 公法讀書會前一天（週三）20:00 群組：沛珊（AA_289 5-4、BB_137 3-2）',!!m&&m.text==='講義我先印了，放在女舍一樓的櫃子，誰要拿？'&&J(m.ask.opts.map(o=>o.t))===J(['我去拿。','請別人幫我拿。']));
    PHONE.answer(G,'bb_d5_'+d,0); check('3. D5 我去拿＝當晚走到女舍門口',G.flags.D5_GO===d&&chk('ev_d5_handout'));
    const L=await run('ev_d5_handout'); check('3. D5：櫃子、第一張便利貼、第一次她剛好下樓那句；熟悉 +1',L[0]==='櫃子上一疊講義，最上面一張便利貼。'&&L[1]==='祐廷的。第三題的圖我多印了一頁。'&&L.includes('你來了！不用謝，我順便印的。')&&G.flags.D5_GO===null,J(L));
    setDay(TD('Y1S1',11,3),20.05); rules(); check('3. D5 冷卻四週（下一週不再問）',!(G.msgs||[]).some(q=>q.ask&&q.ask.id==='bb_d5_'+G.day));
    setDay(TD('Y1S1',14,3),20.05); rules(); const m2=(G.msgs||[]).find(q=>q.ask&&q.ask.id==='bb_d5_'+G.day); PHONE.answer(G,'bb_d5_'+G.day,1);
    check('3. D5 四週後再問；請別人拿＝沛珊「好，明天直接給你。」',!!m2&&msgs('g:public_law').includes('好，明天直接給你。')); }
  { const G=fresh('Y1S2',10,4,18.5,{know:[PS,BH]}); check('3. D6 大一下第 10 週週四 18:30 女舍門口、兩個人交往中（partner）',chk('ev_d6_peishan_bohan'));
    const L=await run('ev_d6_peishan_bohan',['「範圍很大。」']);
    check('3. D6：柏翰（AA 寫，到罪數）、選項、沛珊下樓；記 D6_SEEN',L.includes('期末刑總考到共犯。……不對，到罪數。我剛剛查了。')&&L.includes('對。所以我先背目錄。')&&L[L.length-1]==='（下樓）你們兩個在聊考試，我就知道。'&&G.flags.D6_SEEN===true,J(L));
    const G2=fresh('Y1S2',10,4,18.5,{know:[PS,BH],flags:{dating_classmate_peishan:true}}); check('3. D6 和沛珊交往中的玩家沒有（她沒有柏翰那一段）',!chk('ev_d6_peishan_bohan')); }
  { const hit=findDay('Y2S1',[2,3,4,5,6,7,10,11],2,'d8',0.1)||findDay('Y2S2',[2,3,4,5,6,7,10,11,12,13],2,'d8',0.1)||findDay('Y3S1',[2,3,4,5,6,7,10,11,12,13],2,'d8',0.1);
    const t=hit&&(['Y2S1','Y2S2','Y3S1'].find(x=>TD(x,hit.w,2)===hit.d)); const G=fresh(t,hit.w,2,18,{}); check('3. D8 平日傍晚女舍門口、一成',chk('ev_d8_cancel'));
    const L=await run('ev_d8_cancel',['「溫州街']); check('3. D8：開場、指路＝她一句（不是搭訕、沒有記憶）',L.length===3&&L[2]==='……好。一個人去吃麵，也可以。謝謝。'&&(L[0]==='（門口的長椅，一個女生看著手機，嘆了一口氣。）'||L[0]==='（一個女生在門口站了很久。）'),J(L));
    EVENTS.zoneChanged(); check('3. D8 冷卻四週',!chk('ev_d8_cancel')); }
  });

  /* 4 P5（普通教學館前的舊序章人物）、5 社科院（SK08、SK10、SK14、第 389 行）（CANON-NO-ECON-1112 第三批：這一項拿掉）*/

  /* ======================= 6 L4 ======================= */
  await sec('6',async()=>{
  { const G=fresh('Y1S1',6,2,10,{know:[ZR]}); check('6. L4a 大一上第 6 週起週二、四上午文學院門口、和芷若 ACQUAINTANCE 以上',chk('ev_l4a_pencil')&&ev('ev_l4a_pencil').near.z===-21.5&&(()=>{ setDay(TD('Y1S1',5,2),10); const r=!chk('ev_l4a_pencil'); setDay(TD('Y1S1',6,2),10); return r; })());
    H.said=[]; H.opts=[]; H.picks=['「坐下來。」',1]; await EVENTS.run(ev('ev_l4a_pencil')); const L=said();
    check('6. L4a 坐下來：三個版本、她圈起來「好。就這個。」、記 L4A_SAT（BB_110 L4）',L[0]==='文學院門口的長椅上，芷若在讀一本很舊的英文劇本，用鉛筆在空白處寫中文。'&&L.includes('這一句，我翻了三個版本。你聽哪一個比較像人講的話。')&&L.includes('好。就這個。')&&G.flags.L4A_SAT===true,J(L)); }
  { const G=fresh('Y2S1',10,3,11,{know:[ZR]}); check('6. L4b 大二上、12/10 以前',chk('ev_l4b_poster')&&(()=>{ setDay(TD('Y2S1',15,3),11); const r=!chk('ev_l4b_poster'); setDay(TD('Y2S1',10,3),11); return r; })());
    const L=await run('ev_l4b_poster',['（站在旁邊一起看）']); check('6. L4b 一起看：「你也在看字體？」「嗯。」「……騙人。」',L.includes('你也在看字體？')&&L.includes('嗯。')&&L.includes('……騙人。'),J(L)); }
  { const G=fresh('Y3S2',10,3,11,{know:[ZR],flags:{EXCHANGE_ROUTE:'TW',L4A_SAT:true}}); G.events.done.ev_zhiruo_no_sugar=1;
    check('6. L4c 大三下、台灣路線和美國路線（美國 8/2 才出發，AA_508 0-2 第 11 點）、Z11 以後；日本路線不演',chk('ev_l4c_bench')&&(()=>{ G.flags.EXCHANGE_ROUTE='US'; const r=chk('ev_l4c_bench'); G.flags.EXCHANGE_ROUTE='JP'; const j=!chk('ev_l4c_bench'); G.flags.EXCHANGE_ROUTE='TW'; return r&&j; })());
    const L=await run('ev_l4c_bench'); check('6. L4c：回來第一天、椅子還是會晃（AA-C 改過的那句）、坐下來過的多一句',J(L)===J(['我回來第一天就來坐這裡。','……這張椅子還是會晃。','你那時候選的那個版本，我後來交出去了。老師說很像人講的話。']),J(L)); }
  });
  H.done();
})();
