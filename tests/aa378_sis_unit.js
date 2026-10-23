// AA_378 第 1 節學姊 S1、S2（企劃線 f2de8d1c；任務 AA378-Y4S1-FIX-1021；使用者 10-21 22:5x「學姊才是真正的女主角」）：她在美國那半年（臺灣、日本路線）——不需要瀏覽器。
//   1  逐字對稿：「到了。」、T1 三則、X0～X5 的照片和那一句、T3 用完的旁白、「你去吃早餐。」都和稿一字不差
//   2  T1（第 4 階以下）整學期：（「到了。」不另外傳，AA_378 S1 更正 5cd35678）週一 09:00（11/5 起 10:00）兩週一則：花生醬、圖書館、（9/4 沒有：楓樹 9/25 以前不出、X0 還沒到）、X0、楓樹、X1～X5；沒有任何一則重複
//   3  T2（第 4～5 階）整學期：T2 四則、X0（10/2：X0 四週內，AA 23:11）、X1～X5；沒有重複
//   4  T3（第 5 階以上）：每週臺灣週日 10:00 視訊（「和學姊視訊（她那邊週六晚上）」），不在週一（不撞強制執行法）；三組各一次，第四次起只有旁白
//   5  日本路線（8/3 人還在日本）：也不另外傳「到了。」；美國路線沒有
//   6  舊存檔（AA_378 以前，T1 已經傳了「到了」「花生醬」i1＝2）：下一則是「圖書館」，不跳過；讀檔晚兩天以上不補「到了」
//   7  S3：10/25 推甄前的便條只給 6 月就選了路的（10/16 才選的不傳）；收過那一張的，2/3 考場門口「（便條只有兩個字：「同上。」）」「……同上。」「對。」、照片版「📷（一張手寫的便條：同上。）」選項「同上。」
//   8  S4：期末飯（termend3d.js dinnerDay）不排在那天晚上已經有出遊的日子（12/23 20:30 接學姊的飛機）
// 修改前（開發分支 676954aa）：第 1（X0～X5、旁白、早餐）、2、3、4、6 項 FAIL。用法：node tests/aa378_sis_unit.js
require('./alison.js');   /* AA_380：企劃線的舊稿還寫「小語」，讀稿的時候照匯入工具換成 Alison */
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(NOODLE_CLOSED|R2Y4B|R2Y4B_EVENTS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
const {check,GM}=H;
global.CG_REGISTRY={};
load('src/noodle_closed3d.js'); load('src/data/r2y4b_events.js'); load('src/r2y4b3d.js');
{ const L2=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(R2Y4A|R2Y4A_EVENTS|R3|R3_EVENTS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
  for(const f of ['src/data/r2y4a_events.js','src/r2y4a3d.js','src/data/r3_events.js','src/r3_3d.js']) if(fs.existsSync(path.join(H.ROOT,f))) L2(f); }
const S=R2Y4B, D=k=>STORY.dayOfKey(k), T=(d,h)=>d*24+h;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,2).join(' / ')); } };
const fresh=(key,h,route)=>{ const G=H.fresh(key,h,'dorm',{EXCHANGE_ROUTE:route||'TW',EXCH_RULE:1}); G.acts={att:{}}; G.outings=[]; H.at(key,h); return G; };
const th=()=>(H.G.msgs||[]).filter(m=>m.th==='p:heroine_05');
/* 一天一天走（每天 6、7.5、8.5、9.5、10.5、12、20 點）：跑手機規則、收訊息；視訊到了就當作接了（done） */
const walk=(d0,d1,f)=>{ for(let d=d0;d<=d1;d++) for(const h of [6,7.5,8.5,9.5,10.5,12,20]){ H.at(CALENDAR.dateOf(d).key,h); S.phone(H.G,GM); PHONE.tick(H.G); if(f) f(d,h);
  for(const q of OUT.rec(H.G)) if(/^y4_sa_v_/.test(q.id)&&q.state==='planned'&&T(q.day,q.h)<=T(d,h)) q.state='done'; } };
const keyOf=m=>CALENDAR.dateOf(m.day!=null?m.day:H.G.day).key;
const WEEKLY=/^y4_sa_(arrive$|t1_|t2_|x_)/;   /* 每週那一套（10/11 大峽谷的照片 y4_sa_canyon_photo 是另一件劇情）*/
const seq=()=>{ const L=th(), out=[]; for(const m of L){ if(m.from!=='heroine_05'||!WEEKLY.test(m.tag||'')) continue; if(/^（照片：/.test(m.text)||!out.length||out[out.length-1].tag!==m.tag) out.push({tag:m.tag,day:m.day,h:m.h,L:[m.text]}); else out[out.length-1].L.push(m.text); } return out; };

(async()=>{
/* 1 逐字對稿 */
let doc=''; try{ doc=cp.execSync('git show 8f138c5b:"docs/story_planning/AA_378_法律系大四上_學姊在美國那半年與作息_修正稿.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc=''; }
await sec(1,()=>{ check('1. 讀得到稿（企劃線 8f138c5b 的 AA_378）',!!doc);
  const rows=[...doc.matchAll(/^\| (X\d) \| (\d+)\/(\d+) \| 「(.+?)」「(.+?)」 \|$/mg)].map(m=>({id:m[1],from:'2028-'+m[2].padStart(2,'0')+'-'+m[3].padStart(2,'0'),L:[m[4],m[5]]}));
  const X=(S.SA_X||[]).map(x=>({from:x.from,L:x.L}));
  check('1. 過期：最早那天起兩週內，X0 四週（到 10/8，AA 23:11 確認）',S.SA_X_DAYS===14&&S.SA_X[0].days===28&&S.SA_X.slice(1).every(x=>!x.days));
  check('1. X0～X5（日子、照片、那一句）和稿一字不差',rows.length===6&&JSON.stringify(rows.map(r=>({from:r.from,L:r.L})))===JSON.stringify(X),JSON.stringify({rows,X}).slice(0,600));
  const narr=(doc.match(/之後的視訊只有一行旁白，不重播台詞：「(.+?)」/)||[])[1];
  const evv=STORY_EVENTS.find(e=>e.id==='ev_sis_video'), txt=evv?evv.dialogue.filter(n=>n.text).map(n=>n.text):[];
  check('1. T3 用完的旁白和稿一樣、事件裡有那一句',!!narr&&narr===S.SA_V_NARR&&txt.includes(narr),narr);
  const bk=(doc.match(/都改「(好，我去睡了。你去吃早餐。)」/)||[])[1];
  check('1. 「好，我去睡了。你去上課。」兩句都改「好，我去睡了。你去吃早餐。」',!!bk&&txt.filter(t=>t===bk).length===2&&!txt.includes('好，我去睡了。你去上課。'),JSON.stringify(txt.filter(t=>/睡了/.test(t))));
  let fix=''; try{ fix=cp.execSync('git show 5cd35678:"docs/story_planning/AA_378_法律系大四上_學姊在美國那半年與作息_修正稿.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ fix=''; }
  check('1. 「到了。」拿出每週那一套、不另外傳（AA_378 S1 更正 5cd35678：8/3 09:00 家族群組已經有 US0）',/「到了。」拿出每週那一套，\*\*不另外傳\*\*/.test(fix)&&!S.SA_ARRIVE&&!(S.SA_T1||[]).some(x=>x.includes('到了。'))); });

/* 2 T1 整學期 */
await sec(2,()=>{ fresh('2028-08-02',20,'TW'); H.FAMILIAR('heroine_05'); walk(D('2028-08-03'),D('2028-12-20'));
  const L=seq(), first=L.map(x=>x.L[x.L.length-1]);
  const want=['我買了一罐太大的花生醬。','這邊的圖書館開到半夜兩點。','找到臺灣的烏龍茶了。很貴。我還是買了。','九月底，葉子先紅了一棵。','我在吃三明治。牠在等。……我沒有分。','室友刻的。她說刻的是我。……不像。','冬令時間開始了。五點就天黑。','感恩節。同學的媽媽聽說我是臺灣來的，多煮了一碗飯。','最後一格寫的是回臺灣。'];
  check('2. T1：花生醬、圖書館、X0、楓樹、X1～X5（AA_378 S1 那一列），一則都沒有重複',JSON.stringify(first)===JSON.stringify(want)&&new Set(th().filter(m=>WEEKLY.test(m.tag||'')).map(m=>m.text)).size===th().filter(m=>WEEKLY.test(m.tag||'')).length,JSON.stringify(first));
  const dk=L.map(x=>CALENDAR.dateOf(x.day).key+' '+x.h);
  check('2. T1 的日子：週一 09:00 兩週一則（9/4 那一格沒有）；11/5 起 10:00（8/3 不另外傳「到了。」）',JSON.stringify(dk)===JSON.stringify(['2028-08-07 9','2028-08-21 9','2028-09-18 9','2028-10-02 9','2028-10-16 9','2028-10-30 9','2028-11-13 10','2028-11-27 10','2028-12-11 10']),JSON.stringify(dk));
  const maple=L.find(x=>x.L.includes('九月底，葉子先紅了一棵。'));
  check('2. 楓樹那則 9/25 以後',!!maple&&maple.day>=D('2028-09-25')); });

/* 3 T2 整學期 */
await sec(3,()=>{ fresh('2028-08-02',20,'TW'); H.rel('heroine_05',60,45,40); walk(D('2028-08-03'),D('2028-12-20'));
  const L=seq(), last=L.map(x=>x.L[x.L.length-1]);
  const want=['你大四上的課排得怎樣？','你最近有在開車嗎？','你研究所的事，決定了嗎？不用現在回答。','……你那邊呢？','找到臺灣的烏龍茶了。很貴。我還是買了。','我在吃三明治。牠在等。……我沒有分。','室友刻的。她說刻的是我。……不像。','冬令時間開始了。五點就天黑。','感恩節。同學的媽媽聽說我是臺灣來的，多煮了一碗飯。','最後一格寫的是回臺灣。'];
  check('3. T2：T2 四則、X0（10/2，四週內）、X1～X5；「今天第一次在這邊開車」只有一次',JSON.stringify(last)===JSON.stringify(want)&&th().filter(m=>/今天第一次在這邊開車/.test(m.text)).length===1&&new Set(th().filter(m=>WEEKLY.test(m.tag||'')).map(m=>m.text)).size===th().filter(m=>WEEKLY.test(m.tag||'')).length,JSON.stringify(last)); });

/* 4 T3 視訊 */
await sec(4,async()=>{ fresh('2028-08-02',20,'TW'); H.rel('heroine_05',60,45,40); SOCIAL.rel('heroine_05').npcRom=35;
  const said=[]; walk(D('2028-08-03'),D('2028-09-04'));
  const V=OUT.rec(H.G).filter(q=>/^y4_sa_v_/.test(q.id)).sort((a,b)=>a.day-b.day);
  check('4. T3：每週臺灣週日 10:00 視訊、標題「和學姊視訊（她那邊週六晚上）」，沒有排在週一',V.length>=4&&V.every(q=>CALENDAR.dateOf(q.day).wd===7&&q.h===10&&q.title==='和學姊視訊（她那邊週六晚上）'),JSON.stringify(V.map(q=>CALENDAR.dateOf(q.day).key+' '+q.h+' '+CALENDAR.dateOf(q.day).wd)));
  check('4. 三組各一次，第四次起 set 3（只有旁白）',JSON.stringify(V.slice(0,5).map(q=>q.sa.set))===JSON.stringify([0,1,2,3,3]),JSON.stringify(V.map(q=>q.sa.set)));
  const q=V[3]; q.state='planned'; H.at(CALENDAR.dateOf(q.day).key,10); H.said=[]; await OUT.go(GM,q);
  check('4. 第四次：只有旁白「（視訊。她那邊是週六晚上。這個禮拜的事，你們講了半個小時。）」',H.said.length===1&&H.said[0].t===S.SA_V_NARR,JSON.stringify(H.said)); });

/* 5 日本、美國路線 */
await sec(5,()=>{ fresh('2028-08-02',20,'JP'); H.G.flags.JP_DEPARTED=D('2028-03-25'); H.FAMILIAR('heroine_05'); walk(D('2028-08-03'),D('2028-08-03'));
  check('5. 日本路線（8/3 人還在日本）：也不另外傳「到了。」（AA_378 S1 更正）',!th().some(m=>m.text==='到了。'),JSON.stringify(th().map(m=>m.text)));
  fresh('2028-08-02',20,'US'); H.FAMILIAR('heroine_05'); walk(D('2028-08-03'),D('2028-08-08'));
  check('5. 美國路線：沒有這一套（她和你都在美國）',!th().length); });

/* 6 舊存檔 */
await sec(6,()=>{ fresh('2028-08-20',20,'TW'); H.FAMILIAR('heroine_05'); H.G.flags.SIS_AB={k:1,tier:1,i1:2,i2:0,i3:0,t1k:0,log:[{k:0,kind:'t1',tag:'y4_sa_t1_0'}]}; walk(D('2028-08-21'),D('2028-08-21'));
  const L=seq();
  check('6. 舊存檔（T1 傳過「到了」「花生醬」）：8/21 那一則是「這邊的圖書館開到半夜兩點。」；讀檔晚兩天以上不補「到了。」',L.length===1&&L[0].L.includes('這邊的圖書館開到半夜兩點。')&&!th().some(m=>m.text==='到了。'),JSON.stringify(L)); });

/* 7 S3 便條 */
await sec(7,async()=>{ const note=(ask2)=>{ fresh('2028-10-25',20,'TW'); H.FRIEND('heroine_05'); H.G.flags.Y4_PATH='grad'; if(ask2) H.G.flags.Y4_PATH_ASK2=D('2028-10-16'); H.at('2028-10-25',21); R2Y4A.phone(H.G,GM); PHONE.tick(H.G); return PHONE.sent(H.G,'y4_push_note'); };
  const a=note(false), b=note(true);
  check('7. 10/25 推甄前的便條：6 月就選了路的有、10/16 才選的（Y4_PATH_ASK2）沒有',a===true&&b===false,JSON.stringify({a,b}));
  const door=async(got)=>{ fresh('2029-02-03',8,'TW'); H.FRIEND('heroine_05'); H.G.flags.Y4_PATH='grad'; if(got) PHONE.at(H.G,D('2028-10-25'),21,[{th:'p:heroine_05',from:'heroine_05',text:'📷（一張手寫的便條）'}],'y4_push_note'); PHONE.tick(H.G); H.said=[]; H.at('2029-02-03',8.2); await R3.noteRun(GM); return H.said.map(x=>x.t); };
  const d1=await door(true), d0=await door(false);
  check('7. 收過 10/25 那一張：2/3 考場門口「（便條只有兩個字：「同上。」）」→「……同上。」→「對。」；沒收過照舊',d1.includes('（便條只有兩個字：「同上。」）')&&d1.includes('……同上。')&&d1.includes('對。')&&!d1.includes('（便條：「你可以。」）')&&d0.includes('（便條：「你可以。」）')&&d0.includes('只有一句。')&&d0.includes('一句就夠了。')&&!d0.includes('……同上。'),JSON.stringify({d1,d0}));
  const photo=(got)=>{ fresh('2029-02-02',20,'TW'); H.FRIEND('heroine_05'); H.G.flags.Y4_PATH='grad'; H.G.flags.dating_heroine_02=true; if(got) PHONE.at(H.G,D('2028-10-25'),21,[{th:'p:heroine_05',from:'heroine_05',text:'📷（一張手寫的便條）'}],'y4_push_note'); PHONE.tick(H.G); H.at('2029-02-02',21); R3.phone(H.G,GM); PHONE.tick(H.G); const m=PHONE.byAsk(H.G,'r3_sis_note_photo'); return m?{t:m.text,o:m.ask.opts.map(x=>x.t)}:null; };
  const p1=photo(true), p0=photo(false);
  check('7. 照片版（和別人交往中）：收過的「📷（一張手寫的便條：同上。）」選項「同上。」「謝謝。」；沒收過照舊',!!p1&&p1.t==='📷（一張手寫的便條：同上。）'&&JSON.stringify(p1.o)==='["同上。","謝謝。"]'&&!!p0&&p0.t==='📷（一張手寫的便條：你可以。）'&&JSON.stringify(p0.o)==='["只有一句。","謝謝。"]',JSON.stringify({p1,p0})); });

/* 8 S4 期末飯讓接機 */
await sec(8,()=>{ fresh('2028-12-21',12,'TW'); const w=TERMEND.windowOf('Y4S1'), spec={h:18.5};
  const base=TERMEND.dinnerDay(H.G,w,spec,'heroine_02');
  OUT.plan(H.G,{id:'y4_sis_pickup',ev:'ev_sis_pickup',day:base,h:20.5,late:0.25,place:'桃園機場入境大廳',title:'接機（學姊）',travel:'開車 約 50 分鐘',travelH:5/6});
  const moved=TERMEND.dinnerDay(H.G,w,spec,'heroine_02');
  check('8. 那天晚上有接機：期末飯往後找（不排在同一個晚上）',base!=null&&moved!=null&&moved!==base,JSON.stringify({base:base&&CALENDAR.dateOf(base).key,moved:moved&&CALENDAR.dateOf(moved).key})); });

H.done(); })().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });
