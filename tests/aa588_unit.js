// AA_588（企劃線 1edea905f；AA 2026-11-02 定稿 D109；任務 AA588-AA581-TAIL-1102）AA_581 收尾＋交換延畢又被當（K1）——不需要瀏覽器。
//   0  讀稿：AA_588 的句子（4/15 群組兩則、記憶標籤、K1 七句＋新卡）一字不差在稿裡
//   1  沛珊和柏翰公開搬回 4/15 傍晚麵店（ev_psbh_public_0415；AA_581 第 11 節第 2 點）：只演 PS_BH 那幾行、只在 4/15 17:00～20:30 的麵店、交往中不演；
//      17:00 桌遊團群組柏翰「今天晚上燒臘店，有空的來。」沛珊「我會到。」；沒到＝20:30 阿哲滷蛋照片（聽說）；到過＝沒有照片；隔天才回到遊戲的補；期末那頓（考完的晚餐）沒有公開、沒去也沒有照片
//   2  記憶標籤 AN_L8_MIDTERM＝「和她聊過期中週讀書的進度」（id 不動）
//   3  課堂內容照 AA 改過的源稿重匯（claude/story-planning@1edea905f）：第 7 週黑板三門、柏翰缺課訊息兩門；經濟系會計學那句不動；AA_389 第 9 點勞動法那句一起進來；白名單
//   4  home_lines：import_home_lines.py 讀的是 AA_138；晚餐第 8 題換成 AA_588 的三句（週次 8～10 不動）
//   5  K1 交換延畢又被當：postgrad3d.js CARDS_DELAY 六處、r2y4b3d.js y5Plan 兩處；沒被當的照原句
// 修改前（int/next1102 db76e4881）：第 1 項（沒有 ev_psbh_public_0415、期末那頓還有公開）、第 2 項、第 3 項（白名單、勞動法、source）、第 4 項（白名單）、第 5 項 FAIL。用法：node tests/aa588_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H, J=JSON.stringify;
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(FD|Y5|R2Y4B|R2Y4B_EVENTS|STUDY|STUDY_UNITS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.CG_REGISTRY=global.CG_REGISTRY||{};
for(const f of ['src/data/study_units.js','src/study3d.js','src/data/r2y4b_events.js','src/r2y4b3d.js','src/y5s1_3d.js','src/faildelay3d.js']) try{ load(f); }catch(e){ console.log('載入失敗 '+f+'：'+e); }
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const git=a=>{ try{ return cp.execFileSync('git',['-C',H.ROOT].concat(a),{encoding:'utf8',maxBuffer:64*1024*1024}); }catch(e){ return ''; } };
const P588='docs/story_planning/AA_588_回LAWWW_AA581收尾與交換延畢又被當.md', DOC=require('./alison.js').ndl(git(['show','1edea905f:'+P588]));   /* 讀稿照 tools/story/*_fix.json 換字 */
const ALLOW=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files;
const allow=(p,s)=>ALLOW.some(e=>e.path===p&&e.sha===s&&e.status==='approved'&&!!e.approvedBy);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const termDay=(t,w,wd)=>STORY.termDay(t,w,wd);
const D415=termDay('Y1S2',8,3);
const ASK=['今天晚上燒臘店，有空的來。','我會到。'], EGG=['📷（一顆切成兩半的滷蛋）','柏翰幫沛珊切的','……他們在一起了'];
const PUB=['柏翰幫沛珊把滷蛋切成兩半。','……喔。','全桌安靜三秒。','對，我們在一起了。你們吃你們的。','上禮拜的事。','（他把另一半滷蛋推回她碗裡。）'];
const K1={exJP:'（同屆的人都畢業了。你還差一門實習，還有{課名}要重修。九月再回學校。）',exUS:'（同屆的人都畢業了。你還差一門實習、兩門補修，還有{課名}要重修。九月再回學校。）',
  y5US:'（週一、週三補修兩門課，{課名}照課表重修。教室裡坐的，都是學弟妹。）',y5JP:'（這學期，{課名}重修。教室裡坐的，都是學弟妹。）',fafu:'（週二去法扶，一週一堂{課名}。其他的日子，一天和一天很像。）',
  planJP:'（這學期，週二要去實習，還有{課名}要重修。其他的日子——）',planUS:'（這學期，週二去實習，週一、週三補兩門課，還有{課名}要重修。其他的日子——）'};   /* AA 13:53 (a)：拿掉「一堂」*/
const ORIG={exJP:'（同屆的人都畢業了。你還差一門實習，九月再回學校。）',exUS:'（同屆的人都畢業了。你還差一門實習和兩門課，九月再回學校。）',y5US:'（週一、週三補修兩門課。教室裡坐的，都是大四的學弟妹。）',
  fafu:'（週二去法扶。其他的日子，一天和一天很像。）',planJP:'（這學期，只有週二要去實習。其他的日子——）',planUS:'（這學期，週二去實習，週一、週三補兩門課。其他的日子——）'};
const psKnow=(dating)=>{ H.FAMILIAR('zhe'); H.FRIEND('classmate_peishan'); H.FAMILIAR('classmate_bohan'); if(dating) H.G.flags.dating_classmate_peishan=true; };
const tickAt=h=>{ H.G.hour=h; STORY.phoneRules(GM); PHONE.tick(H.G); };
const grp=()=>(H.G.msgs||[]).filter(m=>m.th==='g:noodle_team');

(async()=>{
await sec(0,()=>{ check('0. 讀得到 AA_588@1edea905f',DOC.length>500);
  const AA1353=new Set([K1.planJP,K1.planUS]);   /* AA 2026-11-02 13:53 訊息選 (a)：y5Plan 兩句拿掉「一堂」（稿裡是「還有一堂{課名}」）；稿裡比對拿掉「一堂」前的版本 */
  const miss=[...ASK,'和她聊過期中週讀書的進度',...Object.values(K1).map(t=>AA1353.has(t)?t.replace('還有{課名}','還有一堂{課名}'):t)].filter(t=>!DOC.includes(t.replace(/^（|）$/g,'')));
  check('0. AA_588 的句子一字不差在稿裡（群組兩則、記憶標籤、K1 七句＋新卡）',miss.length===0,J(miss));
  check('0. 白名單：AA_588@1edea905f approved',allow(P588,'1edea905f')); });

/* ---------- 1 ---------- */
await sec(1,async()=>{ const e=ev('ev_psbh_public_0415'), sup=ev('ev_midterm_supper_y1s2');
  check('1. ev_psbh_public_0415 在；4/15＝2026-04-15（大一下第 8 週週三）',!!e&&CALENDAR.dateOf(D415).m===4&&CALENDAR.dateOf(D415).d===15&&(CALENDAR.dateOf(D415).y===2026),J(CALENDAR.dateOf(D415)));
  if(!e) return;
  const at=(day,h,zone,dating)=>{ H.G=null; const G=H.fresh(PG.dateKey?PG.dateKey(day):CALENDAR.dateOf(day).y+'-'+String(CALENDAR.dateOf(day).m).padStart(2,'0')+'-'+String(CALENDAR.dateOf(day).d).padStart(2,'0'),h,zone,{}); psKnow(dating); return EVENTS.check(e); };
  const ok=at(D415,18,'noodle',false), early=at(D415,16.5,'noodle',false), late=at(D415,20.6,'noodle',false), d14=at(D415-1,18,'noodle',false), d16=at(D415+1,18,'noodle',false), other=at(D415,18,'campus',false), dt=at(D415,18,'noodle',true);
  check('1. 4/15 傍晚在麵店（17:00～20:30）才演；16:30、20:36、4/14、4/16、不在麵店、和沛珊交往中都不演',ok&&!early&&!late&&!d14&&!d16&&!other&&!dt,J({ok,early,late,d14,d16,other,dt}));
  check('1. trigger auto（進店、或已經在店裡）、只一次',e.trigger==='auto'&&e.location==='noodle'&&e.once===true);
  at(D415,18,'noodle',false); H.said=[]; H.bgs=[]; await EVENTS.run(e); const L=H.said.map(s=>s.t);
  check('1. UX-PSBH-BG（BB 16:49）：不用模糊 3D，用麵店的 2D 背景 noodle_table（沛珊、柏翰沒有立繪，看得出是麵店）',e.background!=='blur'&&e.dialogue[0].bg==='noodle_table'&&JSON.stringify(H.bgs).includes('noodle_table'),J({bg:e.background,bgs:H.bgs}));
  check('1. 只演 PS_BH 那幾行（滷蛋、「……喔。」、安靜三秒、沛珊、柏翰「上禮拜的事。」、推回滷蛋）',J(L)===J(PUB),J(L));
  check('1. 期末那頓（考完的晚餐）拿掉公開那一段、沒有 outingMissed（照片搬走）',!JSON.stringify(sup.dialogue.map(l=>l.text||'')).match(/滷蛋切成兩半|對，我們在一起了|上禮拜的事/)&&typeof sup.outingMissed!=='function');
  /* 群組 17:00 */
  const day=CALENDAR.dateOf(D415), key=day.y+'-'+String(day.m).padStart(2,'0')+'-'+String(day.d).padStart(2,'0');
  const ph=(o)=>{ H.fresh(key,15,'dorm',{}); psKnow(!!o.dating); if(o.group!==false) PHONE.join(H.G,'noodle_team','桌遊團'); tickAt(16); tickAt(16.9); const before=grp().length; tickAt(17); const at17=grp().map(m=>[m.from,m.text,m.h]); return {before,at17}; };
  const a=ph({}), b=ph({group:false}), c=ph({dating:true});
  check('1. 17:00 桌遊團群組：柏翰「今天晚上燒臘店，有空的來。」、沛珊「我會到。」（17:00 以前沒有）',a.before===0&&J(a.at17.map(x=>[x[0],x[1]]))===J([['classmate_bohan',ASK[0]],['classmate_peishan',ASK[1]]])&&a.at17.every(x=>x[2]===17),J(a));
  check('1. 不在群組、和沛珊交往中＝沒有那兩則',b.at17.length===0&&c.at17.length===0,J([b,c]));
  /* 20:30 照片 */
  const eggOf=()=>grp().filter(m=>m.tag==='zhe_supper_mid2_egg').map(m=>m.text);
  H.fresh(key,15,'dorm',{}); psKnow(false); PHONE.join(H.G,'noodle_team','桌遊團'); tickAt(17); tickAt(20.4); const e0=eggOf().length; tickAt(20.5); tickAt(20.6);
  check('1. 沒到麵店：20:30 阿哲的滷蛋照片三則（照舊）、記聽說；20:30 以前沒有',e0===0&&J(eggOf())===J(EGG)&&SOCIAL.has('classmate_peishan','HEARD_ABOUT'),J(eggOf()));
  H.fresh(key,15,'dorm',{}); psKnow(false); PHONE.join(H.G,'noodle_team','桌遊團'); tickAt(17); H.G.events.done.ev_psbh_public_0415=true; H.G.events.last.ev_psbh_public_0415=D415; tickAt(20.5); tickAt(21);
  check('1. 到過麵店（演過）：沒有照片、沒有聽說',eggOf().length===0&&!SOCIAL.has('classmate_peishan','HEARD_ABOUT'));
  H.fresh(key,15,'dorm',{dating_classmate_peishan:true}); psKnow(true); PHONE.join(H.G,'noodle_team','桌遊團'); tickAt(21);
  check('1. 和沛珊交往中：沒有照片',eggOf().length===0);
  { const n=CALENDAR.dateOf(D415+1), k2=n.y+'-'+String(n.m).padStart(2,'0')+'-'+String(n.d).padStart(2,'0'); H.fresh(k2,9,'dorm',{}); psKnow(false); PHONE.join(H.G,'noodle_team','桌遊團'); tickAt(9); tickAt(9.1);
    check('1. 4/15 晚上沒在玩、隔天才回到遊戲：照片補上（沒有約的那兩則）',J(eggOf())===J(EGG)&&!grp().some(m=>m.tag==='psbh_0415_ask'),J(grp().map(m=>m.text))); }
  /* 期末那頓沒去：沒有照片 */
  { H.fresh(key,15,'dorm',{}); psKnow(false); PHONE.join(H.G,'noodle_team','桌遊團'); const fin=termDay('Y1S2',16,3); H.G.events.done.ev_psbh_public_0415=true; H.G.day=fin; H.G.hour=18; H.G.weekday=3;
    OUT.plan(H.G,{id:'supper_mid2',ev:'ev_midterm_supper_y1s2',day:fin,h:19,place:'阿鳳麵店',title:'考完的晚餐',travelH:1/6}); H.G.hour=20; OUT.tick(GM); tickAt(21);
    check('1. 期末那頓（考完的晚餐）沒去：沒有滷蛋照片',eggOf().length===0,J(grp().map(m=>m.text))); }
  /* 誰是誰：4/15 演過＝那一句（沛珊×柏翰） */
  if(STORY.WHOIS||typeof WHOIS!=='undefined'){ /* whois3d.js 不在這個 harness，略過 */ } });

/* ---------- 2 ---------- */
await sec(2,()=>{ check('2. AN_L8_MIDTERM＝「和她聊過期中週讀書的進度」（id 不動，ladder.js 還用這個 id）',SOCIAL.MEMORY_LABEL.AN_L8_MIDTERM==='和她聊過期中週讀書的進度'&&JSON.stringify(LADDER).includes('"AN_L8_MIDTERM"'),SOCIAL.MEMORY_LABEL.AN_L8_MIDTERM); });

/* ---------- 3 ---------- */
await sec(3,()=>{ const C=SYLLABUS.courses, w=(c,n)=>(C[c]||[]).find(x=>x.w===n)||{};
  check('3. 第 7 週黑板第三行（民總、刑法分則、債總二）＝「下週、下下週：前七週整理＋案例作業」',['civ_general','crim_spec','oblig_gen2'].every(c=>(w(c,7).board||[])[2]==='下週、下下週：前七週整理＋案例作業'));
  check('3. 柏翰缺課訊息（行政法、債各）＝「（群組）柏翰：期末考範圍表更新了。」',['admin_law','oblig_spec'].every(c=>(SYLLABUS.skip[c]||[]).includes('（群組）柏翰：期末考範圍表更新了。')),J([SYLLABUS.skip.admin_law,SYLLABUS.skip.oblig_spec]));
  /* 3. 舊序章那一年的會計學那句（CANON-NO-ECON-1112 第三批：這一項拿掉） */
  check('3. AA_389 第 9 點（企劃線 b30766683）勞動法阿哲翹課訊息一起進來',(SYLLABUS.skip.labor_law||[]).includes('（群組）阿哲：老師今天講加班費，舉了超商店員的例子。全班都在算自己以前打工被扣多少。')&&!JSON.stringify(SYLLABUS.skip).includes('聽起來好像我打工的店'));
  check('3. source＝claude/story-planning 80ed4ea06（2026-11-11 16:3x 沒有期中考的四句換字：Y1S1、Y1S2、Y4S2、JP 白名單 80ed4ea06；之前 ba322d6ae 大四下兩科＋日文上下，BB_372～374。舊期望 ba322d6ae、96eb06e4f、50e653270、d501078a3、d3a22505b、1edea905f）（CANON-NO-ECON-1112 第四批：照 AA_888／AA_891 重匯，source＝claude/magical-albattani-bk7b4n 3f6c7d3bb9）',/^claude\/magical-albattani-bk7b4n (3f6c7d3bb9|6dbfe10d7e)/.test(SYLLABUS.source)/* 2026-11-12 CANON-NO-ECON-1112 第五批：Y1S2 芯慈那一句（AA_920）換 6dbfe10d7e，整批讀同一版（其他學期檔內容一樣） */,SYLLABUS.source.slice(0,60));
  const T=['Y1S1','Y2S1','Y2S2','Y3S2'].filter(t=>!allow('docs/story_planning/syllabus/'+t+'.json',(t==='Y1S1'||t==='Y2S1')?'3f6c7d3bb9'/* （CANON-NO-ECON-1112 第四批：照 AA_888／AA_891）*/:(t==='Y2S2'||t==='Y3S2')?'96eb06e4f':'1edea905f'));   /* 2026-11-11 13:1x：Y2S1 換 96eb06e4f（大二上法律四科課堂內容，BB_348～351）；舊期望 1edea905f */   /* Y1S1：2026-11-11 06:5x 起 d501078a3（刑總第 7／13 週換句）；之前 d3a22505b（大一上三科課堂內容補寫，BB_332～334）；history 仍記 1edea905f、57b2a7b39 */
  check('3. 白名單：syllabus/Y1S1、Y2S1、Y2S2、Y3S2.json @1edea905f approved（history 記舊基準 57b2a7b39）',T.length===0&&ALLOW.filter(e=>/syllabus\/Y\dS\d\.json$/.test(e.path)&&!/Y1S2\.json$|Y3S1\.json$|Y4S1\.json$|Y4S2\.json$/.test(e.path)).every(e=>(e.history||[]).some(h=>h.sha==='57b2a7b39'))&&allow('docs/story_planning/syllabus/Y1S2.json','6dbfe10d7e')/* 2026-11-12 第五批（舊 3f6c7d3bb9） */,J(T)); });   /* Y1S2：96eb06e4f → 80ed4ea06（2026-11-11 16:3x 國文「期中」改「期末」）*/   /* 2026-11-11（STUDY-EXAM-STORY-1102）：Y1S2 白名單是 11-11 新加的（大一下五科，50e653270），沒有 57b2a7b39 那段歷史——另外檢查 @50e653270 approved。舊期望：所有學期檔都有 57b2a7b39 */

/* ---------- 4 ---------- */
await sec(4,()=>{ const src=fs.readFileSync(path.join(H.ROOT,'tools/home/import_home_lines.py'),'utf8');
  check('4. import_home_lines.py 讀的是 AA_138（PATH）',src.includes("PATH = 'docs/story_planning/AA_138_回家_家人台詞池.md'"));
  const q=(HOME_LINES.dinner||[]).find(d=>d.n===8)||{};
  check('4. 晚餐第 8 題：「這學期報告多不多？」／「還好。」「有一份不太順。」／「不順的先放著，先吃飯。」，週次 8～10',q.mom==='這學期報告多不多？'&&J((q.opts||[]).map(o=>o.t))===J(['還好。','有一份不太順。'])&&q.dad==='不順的先放著，先吃飯。'&&J(q.weeks)===J([8,10]),J(q));
  check('4. home_lines source＝claude/story-planning 1edea905f；白名單 AA_138@1edea905f approved（history ea43bd9a0）',/^claude\/story-planning 1edea905f/.test(HOME_LINES.source)&&allow('docs/story_planning/AA_138_回家_家人台詞池.md','1edea905f')&&ALLOW.some(e=>e.path==='docs/story_planning/AA_138_回家_家人台詞池.md'&&(e.history||[]).some(h=>h.sha==='ea43bd9a0')),HOME_LINES.source); });

/* ---------- 5 ---------- */
await sec(5,async()=>{ const D=k=>PG.DK(k);
  const US={EXCHANGE_ROUTE:'US',US_DEPARTED:true,US_ARRIVED:true,US_RETURNED:D('2028-12-23')}, JP={EXCHANGE_ROUTE:'JP'};
  const G0=(key,h,route,fail)=>H.fresh(key,h,'dorm',Object.assign({GRADUATED:D('2029-06-02'),GRAD_DONE:true,MOVED_OUT:D('2029-06-28'),HOME_AFTER:'home',Y4_PATH:'other',FAIL_DELAY_V:2},route,fail?{FAIL_DELAY_COURSES:['crimpro']}:{FAIL_DELAY_COURSES:[]}));
  const name=FD.cname('crimpro'), fill=t=>t.replace(/\{課名\}/g,name);
  const card=(route,fail,a,b)=>{ G0(a,9,route,fail); if(a>='2029-10-01'){ const R=PG.rec(H.G); R.lines=(R.lines||[]).concat([K1.y5JP,K1.y5US,ORIG.y5US]); }   /* 9/4～12/17 那張 first 已經出過（大五上第一次跳就出）*/ return PG.cardLine(H.G,D(a),D(b)); };
  check('5. 前提：交換延畢又被當刑訴＝FD.retakeOn；沒被當的不是',(G0('2029-06-20',9,JP,true),FD.retakeOn(H.G))&&!(G0('2029-06-20',9,JP,false),FD.retakeOn(H.G))&&(G0('2029-06-20',9,US,true),FD.retakeOn(H.G)));
  const r=[['6/3～6/27 交換（非美國）',JP,'2029-06-19','2029-06-28','exJP'],['6/3～6/27 美國',US,'2029-06-19','2029-06-28','exUS'],['9/4～12/17 美國（first）',US,'2029-09-03','2029-09-12','y5US'],['10/17～11/19 交換',JP,'2029-10-16','2029-10-25','fafu'],['10/17～11/19 美國',US,'2029-10-16','2029-10-25','fafu']];
  for(const [n,route,a,b,k] of r){ const y=card(route,true,a,b), o=card(route,false,a,b);
    check('5. CARDS_DELAY '+n+'：又被當＝K1 版本（{課名}＝'+name+'）；沒被當＝原句',y===fill(K1[k])&&o===ORIG[k],J([y,o])); }
  { const y=card(JP,true,'2029-09-03','2029-09-12'), o=card(JP,false,'2029-09-03','2029-09-12');
    check('5. 9/4～12/17 交換（非美國）新增一張（first）：「（這學期，'+name+'重修。教室裡坐的，都是學弟妹。）」；沒被當的沒有這張',y===fill(K1.y5JP)&&o!==fill(K1.y5JP)&&!(o||'').includes('重修'),J([y,o])); }
  const row=PG.CARDS_DELAY.find(x=>x[3]===K1.y5JP); check('5. 新卡 first:true（同美國那張）、範圍 9/4～12/17',!!row&&row[0]==='2029-09-04'&&row[1]==='2029-12-17'&&!!row[4]&&row[4].first===true);
  for(const [n,route,k] of [['交換（非美國）',JP,'plan'+'JP'],['美國',US,'planUS']]){ const run=async fail=>{ G0('2029-09-03',9,route,fail); H.said=[]; H.picks=[0]; await R2Y4B.y5Plan(GM); return H.said.map(s=>s.t); };
    const y=await run(true), o=await run(false);
    check('5. y5Plan（9/3）'+n+'：又被當＝「'+fill(K1[k])+'」；沒被當＝原句',y[0]===fill(K1[k])&&o[0]===ORIG[k],J([y[0],o[0]])); }
  { H.fresh('2029-09-03',9,'dorm',{FAIL_DELAY:true,FAIL_DELAY_COURSES:['crimpro'],GRADUATED:D('2029-06-02')}); H.said=[]; H.picks=[0]; await R2Y4B.y5Plan(GM);
    check('5. 對照：被當延畢（沒有交換）照舊 FD.LINES.plan1',H.said[0]&&H.said[0].t===FD.fill(H.G,FD.LINES.plan1),J(H.said[0])); }
  /* AA 13:53 選 (a)：兩門以上用「和」連接；10/17～11/19 兩門以上換句 */
  { const two=['crimpro','civ_general'], nm=FD.cname('crimpro')+'和'+FD.cname('civ_general');
    const G2=(key,route)=>{ G0(key,9,route,true); H.G.flags.FAIL_DELAY_COURSES=two.slice(); };
    G2('2029-06-20',JP); check('6. 前提：兩門也是 FD.retakeOn、namesAnd＝「A和B」',FD.retakeOn(H.G)&&FD.namesAnd(H.G)===nm,FD.namesAnd(H.G));
    G2('2029-06-19',JP); let y=PG.cardLine(H.G,D('2029-06-19'),D('2029-06-28')); check('6. 6/3～6/27 交換兩門：「還有'+nm+'要重修」',y===K1.exJP.replace('{課名}',nm),J(y));
    G2('2029-10-16',JP); { const R=PG.rec(H.G); R.lines=(R.lines||[]).concat([K1.y5JP,K1.y5US,ORIG.y5US]); } y=PG.cardLine(H.G,D('2029-10-16'),D('2029-10-25'));
    check('6. 10/17～11/19 兩門：「（週二去法扶，還有'+nm+'的重修。其他的日子，一天和一天很像。）」',y==='（週二去法扶，還有'+nm+'的重修。其他的日子，一天和一天很像。）',J(y));
    G2('2029-09-03',JP); H.said=[]; H.picks=[0]; await R2Y4B.y5Plan(GM); check('6. y5Plan 交換兩門：「還有'+nm+'要重修」',H.said[0]&&H.said[0].t===K1.planJP.replace('{課名}',nm),J(H.said[0]));
    G2('2029-09-03',US); H.said=[]; H.picks=[0]; await R2Y4B.y5Plan(GM); check('6. y5Plan 美國兩門',H.said[0]&&H.said[0].t===K1.planUS.replace('{課名}',nm),J(H.said[0])); }
  });

H.done();
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });
