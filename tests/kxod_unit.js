// AA_354（企劃線 86c104df；任務 AA354-KX-OURDAYS-1021）可昕「我們的日子」大二到大四——不需要瀏覽器。
//   1  逐字對稿：第 2 節每學期開學那一則（大三下、大四上各兩條路線；大四下帶選項「好。」「隔週就好。」和她的回答）
//   2  週次：大二上、大二下每週；大三上起隔週（單週）；第 2 週起；期中考（第 8、9 週）、期末考週沒有；寒暑假沒有；她的那一週（週年 10/17、生日 4/24）沒有
//   3  地點：照大一下（約在中間＝公館、溫州街、河濱輪流；視訊＝每個月第一次改見面）；事件 ev_kexin_our_day_wk、odPlace
//   4  日本路線的大三下：一律視訊，臺灣時間 19:00（人在日本＝當地 20:00）；美國路線的大四上：一律視訊，臺灣週六 08:00＝美國週五 20:00（11/5 起 19:00）；開學那一則換成當地時間
//   5  大四下：不回＝隔週；選「好。」＝每週（KX_OD_Y4S2）；第 1 週她那一則到了才排第一格（不會在她說以前就排好）
//   6  分手：已排的改 skipped、之後不排；沒交往、沒有 KX_OUR_DAY、不是法律系＝沒有
//   7  舊存檔：大二上第 5 週讀檔＝從第 5 週排、開學那一則不補
//   8  那一週後來有了她的出遊（排好以後才約）＝那一格改 skipped
//   9  大一下那段（story3d.js）不會把大二以後、畢業以後的 kx_od_ 改成 skipped（修改前會：大一下的 K5 之後每週那段只認 Y1S2）
//   10 和 AA_351 接（只和她一位交往）：準時 −1（最低 0）、遲到超過 15 分鐘 ＋1、說了「晚一點」沒到 ＋1、「不去了」不算；兩位交往不算
// 修改前（開發分支 c30d7a79）：沒有 src/kxod3d.js——第 1～8、10 項 FAIL；第 9 項 FAIL（畢業後的格子被改成 skipped）。用法：node tests/kxod_unit.js
require('./alison.js');   /* AA_380：企劃線的舊稿還寫「小語」，讀稿的時候照匯入工具換成 Alison */
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H;
const NAMES=/^(NOODLE_CLOSED|R2Y4B|R2Y4B_EVENTS|Y5|PG_DATES|PGDATE|KXOD)$/;
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.CG_REGISTRY={};
for(const f of ['src/noodle_closed3d.js','src/data/r2y4b_events.js','src/r2y4b3d.js','src/y5s1_3d.js','src/data/pg_dates.js','src/pgdates3d.js','src/kxod3d.js']) if(fs.existsSync(path.join(H.ROOT,f))) load(f);
const has=typeof KXOD!=='undefined'&&typeof KXOD.rule==='function';
const K=has?KXOD:{rule(){},MSG:{},TERMS:[]};
const T=(d,h)=>d*24+h, D=k=>STORY.dayOfKey(k), wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const key=d=>CALENDAR.dateOf(d).key;
const sec=(n,f)=>{ try{ f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,2).join(' / ')); } };
/* 交往中的可昕（大一下選過 K5）：KX_OUR_DAY {day, mode}；路線 EXCHANGE_ROUTE */
const fresh=(k,h,od,more)=>{ const G=H.fresh(k,h,'dorm',Object.assign({dating_kexin:true,KX_OUR_DAY:od||{day:'sat',mode:'mid'}},more||{})); OUT.plan(G,{id:'kx_our_day1',ev:'ev_kexin_our_day',day:D('2026-03-07'),h:14,place:'公館',title:'我們的日子'}); OUT.get(G,'kx_our_day1').state='done'; return G; };
const setT=(G,d,h)=>{ G.day=d; G.hour=h; G.weekday=wdOf(d); };
const HOURS=[0,8,13,18,22];
/* 一天一天走（每天 0、8、13、18、22 點）：跑規則、收訊息；時間過了的固定格當作去了（done）*/
const walk=(G,d0,d1,f)=>{ for(let d=d0;d<=d1;d++) for(const h of HOURS){ setT(G,d,h); K.rule(G); PHONE.tick(G); if(f) f(G,d,h);
  for(const q of OUT.rec(G)) if(q.kxod&&q.state==='planned'&&T(q.day,q.h)<=T(d,h)) q.state='done'; } };
const slots=(G,term)=>OUT.rec(G).filter(q=>/^kx_od_/.test(q.id)&&q.state==='done'&&(!term||(CALENDAR.termOf(q.day)||{}).id===term)).sort((a,b)=>T(a.day,a.h)-T(b.day,b.h));
const weeks=(G,term)=>slots(G,term).map(q=>CALENDAR.termOf(q.day).week);
const span=term=>{ const R=CALENDAR.termDays(term); return [R.from-3,R.to+10]; };
const msgsOf=(G,tag)=>(G.msgs||[]).filter(m=>m.tag===tag);
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

/* 1 逐字對稿 */
sec(1,()=>{ let doc=''; try{ doc=cp.execSync('git show 86c104df:"docs/story_planning/AA_354_可昕我們的日子_大二到大四.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc=''; }
  check('1. 讀得到稿（企劃線 86c104df 的 AA_354）',!!doc);
  const sec2=doc.slice(doc.indexOf('## 2.'),doc.indexOf('## 3.')), rows={};
  for(const ln of sec2.split('\n')){ const m=ln.match(/^\|\s*([^|]+?)\s*\|\s*(.+?)\s*\|\s*$/); if(!m||/學期|---/.test(m[1])) continue; rows[m[1]]=[...m[2].matchAll(/「(.+?)」/g)].map(x=>x[1]); }
  const MAP={'大二上':'Y2S1','大二下':'Y2S2','大三上':'Y3S1','大三下・臺灣路線':'Y3S2','大三下・日本路線':'Y3S2_JP','大四上・臺灣路線':'Y4S1','大四上・美國路線':'Y4S1_US'};
  const bad=[]; for(const [lab,k] of Object.entries(MAP)){ if(!eq(rows[lab],K.MSG[k])) bad.push(lab+'：稿 '+JSON.stringify(rows[lab])+'／程式 '+JSON.stringify(K.MSG[k])); }
  check('1. 第 2 節七列開學那一則和程式（KXOD.MSG）一字不差',Object.keys(rows).length===8&&!bad.length,bad.join('　')||Object.keys(rows).join('、'));
  const y4=rows['大四下']||[], opts=(K.Y4S2_OPTS||[]).map(o=>[o.t,o.r]);
  check('1. 大四下：「最後一個學期。」「我想改回每週。可以嗎？」→「好。」→「好。」／「隔週就好。」→「……好。」',eq(y4,['最後一個學期。','我想改回每週。可以嗎？','好。','好。','隔週就好。','……好。'])&&eq(K.MSG.Y4S2,y4.slice(0,2))&&eq(opts,[[y4[2],y4[3]],[y4[4],y4[5]]]),JSON.stringify({y4,opts})); });

/* 2、3 週次、地點（臺灣路線，約在中間、週六 14:00）*/
const EXPECT={Y2S1:[2,3,4,5,7,10,11,12,13,14,15],Y2S2:[2,3,4,5,6,7,10,11,12,13,14,15],Y3S1:[3,5,7,11,13,15],Y3S2:[3,5,7,11,13,15],Y4S1:[3,5,11,13,15],Y4S2:[3,5,7,11,13]};
sec(2,()=>{ const G=fresh('2026-09-01',12,{day:'sat',mode:'mid'},{EXCHANGE_ROUTE:'TW'}); const [a]=span('Y2S1'), [,b]=span('Y4S2'); walk(G,a,b);
  for(const term of Object.keys(EXPECT)){ const w=weeks(G,term), d=slots(G,term);
    check('2. '+term+'：第 '+EXPECT[term].join('、')+' 週（'+(term<'Y3'?'每週':'隔週・單週')+'；考試週、她的那一週沒有）',eq(w,EXPECT[term]),JSON.stringify(w));
    check('2. '+term+'：每一格都是週六 14:00、事件 ev_kexin_our_day_wk',d.length>0&&d.every(q=>wdOf(q.day)===6&&q.h===14&&q.ev==='ev_kexin_our_day_wk'),JSON.stringify(d.map(q=>key(q.day)+' '+q.h))); }
  const gap=OUT.rec(G).filter(q=>/^kx_od_/.test(q.id)&&q.kxod&&!CALENDAR.termOf(q.day));
  check('2. 寒暑假沒有（每一格都在學期裡）',!gap.length&&slots(G).length>0,JSON.stringify(gap.map(q=>key(q.day))));
  const pl=slots(G,'Y2S1').map(q=>q.place);
  check('3. 約在中間：公館、溫州街、河濱輪流（接著大一下的那一輪）',pl.length>=6&&eq(pl.slice(0,6),['溫州街','河濱','公館','溫州街','河濱','公館']),JSON.stringify(pl));
  const op=msgsOf(G,'kx_od_open_Y2S1').map(m=>m.text);
  check('2. 大二上開學那一則：第 1 週週一 21:00、{星期}＝週六',eq(op,['這學期還是週六。','你的課表我看過了。那天下午你沒課。']),JSON.stringify(op)); });
sec(3,()=>{ const G=fresh('2026-09-01',12,{day:'fri',mode:'video'},{EXCHANGE_ROUTE:'TW'}); const [a,b]=span('Y2S1'); walk(G,a,b);
  const d=slots(G,'Y2S1'), byM={}; for(const q of d){ const m=CALENDAR.dateOf(q.day).m; (byM[m]=byM[m]||[]).push(q.odPlace); }
  const okM=Object.values(byM).every(L=>L[0]!=='video'&&L.slice(1).every(x=>x==='video'));
  check('3. 視訊：每個月第一次改見面（約在中間那一輪）、其他是視訊；週五 19:00',d.length>0&&okM&&d.every(q=>wdOf(q.day)===5&&q.h===19),JSON.stringify(byM));
  const v=d.find(q=>q.odPlace==='video');
  check('3. 視訊那一格：「接起來」「今天先不要」「視訊結束。」',!!v&&v.verb==='接起來'&&v.no==='今天先不要'&&v.back==='視訊結束。',JSON.stringify(v)); });

/* 4 日本、美國路線 */
sec(4,()=>{ const G=fresh('2028-02-01',12,{day:'sun',mode:'nccu'},{EXCHANGE_ROUTE:'JP'}); const [a,b]=span('Y3S2'); walk(G,a,b);
  const d=slots(G,'Y3S2'), dep=D('2028-03-25');
  const okT=d.every(q=>q.odPlace==='video'&&wdOf(q.day)===0&&q.h===(q.day>=dep?20:19));
  check('4. 日本路線的大三下：第 3、5、7、11、13、15 週，全部視訊，週日臺灣 19:00（出發以後當地 20:00）',eq(weeks(G,'Y3S2'),EXPECT.Y3S2)&&okT,JSON.stringify(d.map(q=>key(q.day)+' '+q.h+' '+q.odPlace)));
  const op=msgsOf(G,'kx_od_open_Y3S2').map(m=>m.text);
  check('4. 日本路線的開學那一則',eq(op,K.MSG.Y3S2_JP||[1]),JSON.stringify(op)); });
sec(4,()=>{ const G=fresh('2028-08-20',12,{day:'fri',mode:'mid'},{EXCHANGE_ROUTE:'US'}); const [a,b]=span('Y4S1'); let at8=null, at13=null; const mon=STORY.termDayIn('Y4S1',1,1);
  walk(G,a,b,(G,d,h)=>{ if(d===mon&&h===8) at8=msgsOf(G,'kx_od_open_Y4S1').length; if(d===mon&&h===13) at13=msgsOf(G,'kx_od_open_Y4S1').length; });
  const d=slots(G,'Y4S1'), std=D('2028-11-05'), back=D('2028-12-23');
  const okT=d.every(q=>q.odPlace==='video'&&(q.day>=back||(wdOf(q.day)===5&&q.h===(q.day+1>=std?19:20))));
  check('4. 美國路線的大四上：第 3、5、11、13、15 週，全部視訊，臺灣週六 08:00＝當地週五 20:00（11/5 起 19:00）',eq(weeks(G,'Y4S1'),EXPECT.Y4S1)&&okT,JSON.stringify(d.map(q=>key(q.day)+' '+q.h+' '+q.odPlace)));
  const op=msgsOf(G,'kx_od_open_Y4S1').map(m=>m.text);
  check('4. 美國路線的開學那一則：臺灣週一 21:00＝當地週一 09:00 才到（08:00 還沒有、13:00 有）',eq(op,K.MSG.Y4S1_US||[1])&&at8===0&&at13===2,JSON.stringify({op,at8,at13})); });

/* 5 大四下 */
sec(5,()=>{ const G=fresh('2029-02-01',12,{day:'sat',mode:'mid'},{EXCHANGE_ROUTE:'TW'}); const [a,b]=span('Y4S2'); walk(G,a,b);
  check('5. 大四下不回：隔週（第 3、5、7、11、13 週；生日 4/24 那一週、第 15 週畢業典禮那一週沒有）',eq(weeks(G,'Y4S2'),EXPECT.Y4S2)&&G.flags.KX_OD_Y4S2==null,JSON.stringify(weeks(G,'Y4S2'))); });
sec(5,()=>{ const G=fresh('2029-02-01',12,{day:'sat',mode:'mid'},{EXCHANGE_ROUTE:'TW'}); const [a,b]=span('Y4S2'); const mon=STORY.termDayIn('Y4S2',1,1); let ans=null, firstAt=null;
  walk(G,a,b,(G,d,h)=>{ if(firstAt==null&&OUT.rec(G).some(q=>q.kxod==='Y4S2')) firstAt=T(d,h); if(ans==null&&d===mon&&h===22){ const m=(G.msgs||[]).find(x=>x.tag==='kx_od_open_Y4S2'&&x.ask); ans=m?PHONE.answer(G,m.ask.id,0):false; } });
  const reply=(G.msgs||[]).filter(m=>m.th==='p:kexin').map(m=>m.text);
  check('5. 第 1 週：她那一則（週一 21:00）到了以前沒有排任何一格',firstAt==null||firstAt>=T(mon,21),String(firstAt));
  check('5. 大四下選「好。」：KX_OD_Y4S2＝weekly、她回「好。」；每週（第 2～7、11～14 週）',!!ans&&G.flags.KX_OD_Y4S2==='weekly'&&reply.includes('好。')&&eq(weeks(G,'Y4S2'),[2,3,4,5,6,7,11,12,13,14]),JSON.stringify({w:weeks(G,'Y4S2'),f:G.flags.KX_OD_Y4S2})); });

/* 6 分手、沒有條件 */
sec(6,()=>{ const G=fresh('2026-09-01',12,{day:'sat',mode:'mid'}); walk(G,D('2026-09-07'),D('2026-09-20'));
  const p=OUT.rec(G).filter(q=>q.kxod&&q.state==='planned'); G.flags.dating_kexin=false; walk(G,D('2026-09-21'),D('2026-12-31'));
  check('6. 分手：已經排好的那一格改 skipped，之後不再排',p.length===1&&p[0].state==='skipped'&&!OUT.rec(G).some(q=>q.kxod&&q.state!=='skipped'&&q.day>D('2026-09-21')),JSON.stringify(p.map(q=>q.state)));
  const none=[]; for(const [lab,f] of [['沒交往',{dating_kexin:false}],['沒有 KX_OUR_DAY',{KX_OUR_DAY:null}],['經濟系',{}]]){ const G2=fresh('2026-09-01',12,null,f); if(lab==='經濟系') G2.stage='econ'; walk(G2,D('2026-09-07'),D('2026-10-10')); if(OUT.rec(G2).some(q=>q.kxod)||msgsOf(G2,'kx_od_open_Y2S1').length) none.push(lab); }
  check('6. 沒交往、沒有 KX_OUR_DAY、不是法律系：沒有格子、沒有開頭那一則',!none.length,none.join('、')); });

/* 7 舊存檔 */
sec(7,()=>{ const G=fresh('2026-10-07',10,{day:'sat',mode:'mid'}); walk(G,D('2026-10-07'),D('2026-11-15'));
  const w=weeks(G,'Y2S1');
  check('7. 大二上第 5 週週三讀檔：從第 5 週那一格開始，開學那一則不補',w[0]===5&&!msgsOf(G,'kx_od_open_Y2S1').length,JSON.stringify(w)); });

/* 8 排好以後才有她的出遊 */
sec(8,()=>{ const G=fresh('2026-09-01',12,{day:'sat',mode:'mid'}); walk(G,D('2026-09-07'),D('2026-09-13'));
  const q=OUT.rec(G).find(x=>x.kxod&&x.state==='planned'); OUT.plan(G,{id:'kx_test_trip',ev:'ev_kexin_our_day',day:q?q.day-1:0,h:10,place:'九份',title:'和可昕去九份'}); setT(G,D('2026-09-14'),9); K.rule(G);
  check('8. 那一週後來排了她的出遊：那一格改 skipped，下一格排下一週',!!q&&q.state==='skipped'&&OUT.rec(G).some(x=>x.kxod&&x.state==='planned'&&CALENDAR.termOf(x.day).week===CALENDAR.termOf(q.day).week+1),JSON.stringify(OUT.rec(G).filter(x=>x.kxod).map(x=>key(x.day)+':'+x.state))); });

/* 9 大一下那段不碰大二以後、畢業以後的格子 */
sec(9,()=>{ const G=fresh('2026-09-14',10,{day:'sat',mode:'mid'}); K.rule(G);
  const pg=D('2029-08-19'); OUT.plan(G,{id:'kx_od_'+pg,ev:'ev_kx_od_pg_test',day:pg,h:19,place:'公館',title:'我們的日子（畢業以後）'});
  const y1=D('2026-06-20'); OUT.plan(G,{id:'kx_od_'+y1,ev:'ev_kexin_our_day_wk',day:y1,h:14,place:'公館',title:'舊存檔排在暑假的那一格'});
  STORY.phoneRules(GM); H.G=G; STORY.phoneRules({G,E:H.E,D:{active:false},toast(){},phoneBadge(){}});
  const mine=OUT.rec(G).filter(q=>q.kxod), pgq=OUT.get(G,'kx_od_'+pg), y1q=OUT.get(G,'kx_od_'+y1);
  check('9. 跑完 STORY.phoneRules（大一下那段＋這一段）：大二的那一格、畢業以後的那一格還是 planned；舊存檔排在大一下暑假的那一格照舊拿掉（AA_373 #1）',mine.length===1&&mine[0].state==='planned'&&pgq.state==='planned'&&y1q.state==='skipped',JSON.stringify({mine:mine.map(q=>q.state),pg:pgq.state,y1:y1q.state})); });

/* 10 和 AA_351 接 */
sec(10,()=>{ const mk=()=>{ const G=fresh('2026-09-14',10,{day:'sat',mode:'mid'}); H.G=G; K.rule(G); return [G,OUT.rec(G).find(q=>q.kxod&&q.state==='planned')]; };
  const hook=(OUT.BEFORE||[]).find(f=>/kxod/.test(String(f)));
  let [G,q]=mk(); G.flags.KX_CRACK=2; setT(G,q.day,q.h+0.1); if(hook) hook(GM,q,null); const a=G.flags.KX_CRACK;
  setT(G,q.day,q.h+0.5); if(hook) hook(GM,q,null); const b=G.flags.KX_CRACK;
  [G,q]=mk(); q.ask=1; q.late=0.5; setT(G,q.day,q.h+1); q.state='missed'; OUT.onMissed(GM,q); const c=+G.flags.KX_CRACK||0;
  [G,q]=mk(); setT(G,q.day,q.h-1); q.state='missed'; OUT.onMissed(GM,q); const d=+G.flags.KX_CRACK||0;
  [G,q]=mk(); G.flags.dating_heroine_02=true; setT(G,q.day,q.h+0.5); if(hook) hook(GM,q,null); const e=+G.flags.KX_CRACK||0;
  check('10. 和 AA_351 接：準時 2→1、遲到 30 分鐘 1→2；說了「晚一點」沒到 0→1；「不去了」0→0；同時和芷若交往＝不算',!!hook&&a===1&&b===2&&c===1&&d===0&&e===0,JSON.stringify({hook:!!hook,a,b,c,d,e})); });

H.done();
