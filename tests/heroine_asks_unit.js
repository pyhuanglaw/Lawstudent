// 她們主動約你（HEROINE-ASKS-1028；AA_494 b3ecc563c；使用者 2026-10-28 00:0x「為什麼都要我主動約女生 如果變熟好感度高 他們不能自己約我嗎 戶外景點也可阿」「超沒有互動感」）——不需要瀏覽器。
//   src/data/heroine_asks.js（地點、時間、台詞）、src/heroine_asks3d.js（HASK）；INV.offer 的 at、INV.ON_ANSWER、PHONE.ON_ANSWER、DATE.settle 的 acceptInvite
//   0  載得到、index.html 在 story3d.js 以後、事件包（bbpack_events.js）前面；每一句都在 AA_494 稿裡（一字不差）；心願地點不在任何一位的校外表裡
//   1  以安朋友（第 3 階）：兩週內收到一則總圖或 Café 的邀約；訊息在前一天 21:30（睡過也照這個時間）；答應→排進行程（INV accepted、by npc）→她回「好。我記在手帳上了。」
//   2  同一週四位都夠格：一週最多 3 則、一天最多 1 則
//   3  考試週（第 8 週）、考前一週（第 7 週）沒有
//   4  學期末心意邀約的窗口沒有
//   5  學姊筆試（2026-02-02）以前沒有
//   6  可昕交往中只有校外（週三晚上傳、約週六或週日）；答應＝DATE.book（by:'npc'）、她回「好。」；排不進＝系統一句
//   7  心願地點從來不出現在她的邀約裡
//   8  連續兩次「不了」以後暫停（交往前 4 週）；「改天」＝3 天後同一個地點再約一次（只再一次），不打開自己選時間
//   10 經濟系那一年（G.stage econ）不約（AA_529 第 1 點，企劃線 881029f98）：HASK.block＝'econ'
//   9  個人：子晴週末兩點以前不約；芷若沒班 20:00 傳、上班 22:40 傳；語彤的麵店＝問一聲（here），答應回「好。……我跟阿姨說。」
// 修改前（開發分支 f534dcc4a）：沒有 src/heroine_asks3d.js——第 0 項 FAIL、結束碼 1。用法：node tests/heroine_asks_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H, J=JSON.stringify;
let ok=true, err='';
try{ for(const [f,n] of [['src/data/heroine_asks.js','HASK_DATA'],['src/heroine_asks3d.js','HASK']]){ const s=fs.readFileSync(path.join(H.ROOT,f),'utf8').replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'='); vm.runInThisContext(s,{filename:f}); } }catch(e){ ok=false; err=String(e&&e.message||e); }
const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
check('0. 載得到；index.html：data/heroine_asks.js → heroine_asks3d.js（相鄰）在 story3d.js 以後、事件包（bbpack）前面（中間可以有別的新模組，例 dorm203）',ok&&typeof HASK!=='undefined'&&/<script src="src\/data\/heroine_asks\.js\?v=[^"]+"><\/script>\n<script src="src\/heroine_asks3d\.js\?v=[^"]+"><\/script>\n/.test(html)&&html.indexOf('src/heroine_asks3d.js')<html.indexOf('src/data/bbpack_events.js')&&html.indexOf('src/story3d.js')<html.indexOf('src/heroine_asks3d.js'),err);
if(!ok){ H.done(); }
let doc=''; try{ doc=cp.execSync('git show b3ecc563c:"docs/story_planning/AA_494_女主角主動約你_七位的門檻頻率地點時間台詞.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){}
{ const bad=[]; let n=0; for(const [id,p] of Object.entries(HASK_DATA.people)){ const L=[p.later,p.no,p.yes].concat(Object.values(p.yesBy||{})); for(const e of p.daily.concat(p.out)) for(const v of ['pre','dat']) if(e[v]) L.push(e[v].line); for(const t of L){ n++; if(!doc.includes(t)) bad.push(id+'：'+t); } }
  check('0. 每一句都在 AA_494 稿裡（一字不差；'+n+' 句）',doc.length>1000&&!bad.length&&n>=100,doc?J(bad):'git fetch origin claude/magical-albattani-bk7b4n'); }
{ const W=DATE.HEROINES.map(h=>DATE.wishOf(h)).filter(Boolean), hit=[]; for(const [id,p] of Object.entries(HASK_DATA.people)) for(const e of p.out) if(W.includes(e.loc)) hit.push(id+' '+e.loc);
  check('0. 心願地點（七位的）不在任何一位的校外表裡',W.length>=5&&!hit.length,J({W,hit})); }

const wd=d=>CALENDAR.dateOf(d).wd%7;
const at=(d,h)=>{ H.G.day=d; H.G.hour=h; H.G.weekday=wd(d); };
const R=()=>HASK.rec(H.G);
const sent=()=>R().sent.filter(x=>x.state!=='dropped'&&x.state!=='planned');
const friend=(id,o)=>{ const r=SOCIAL.rel(id); Object.assign(r,{fam:45,trust:30,comf:10,npcRom:0,rom:0},o||{}); SOCIAL.remember(id,'FIRST_MET',''); H.G.contacts[id]=H.G.day-1; };
const STAGE6={fam:70,trust:50,comf:45,npcRom:60,rom:35}, STAGE5={fam:45,trust:30,comf:10,npcRom:35};
const fresh=(k,h,flags)=>{ const G=H.fresh(k,h,'dorm',flags); INV.rec(G); if(!G.contacts) G.contacts={}; if(!Array.isArray(G.trips)) G.trips=[]; return G; };
/* 一天：12:00 決定、23:59 把該傳的傳出去 */
const day=d=>{ at(d,12); HASK.phone(H.G); at(d,23.98); HASK.phone(H.G); };
const ivOf=x=>x&&x.iv?INV.byId(H.G,x.iv):null;
const thread=id=>(H.G.msgs||[]).filter(m=>PHONE.th(m)==='p:'+id);

/* ---- 1 以安朋友 ---- */
{ const G=fresh('2025-09-22',9); friend('heroine_01'); const d0=G.day; let got=null;
  for(let d=d0;d<d0+14&&!got;d++){ day(d); got=sent().find(x=>x.id==='heroine_01'); }
  const iv=ivOf(got), m=iv&&G.msgs.find(q=>q.iv===iv.id);
  check('1. 以安朋友（第 3 階）：兩週內收到一則總圖或 Café 的邀約（INV、by npc、答應／改天／不了）',!!got&&got.k==='d'&&['library','cafe'].includes(got.place)&&!!iv&&iv.state==='offered'&&iv.by==='npc'&&iv.hask===got.sid,J(got));
  check('1. 訊息是她 21:30 傳的、約隔天（句子照稿）',!!m&&m.h===21.5&&m.day===got.send.day&&got.day===got.send.day+1&&HASK_DATA.people.heroine_01.daily.some(e=>e.pre.line===m.text),J(m));
  const r=INV.answer(G,iv.id,'yes'); const last=thread('heroine_01').slice(-1)[0];
  check('1. 答應：排進行程（accepted）、她回「好。我記在手帳上了。」',r&&r.res==='accept'&&iv.state==='accepted'&&!!last&&last.text==='好。我記在手帳上了。'&&last.from==='heroine_01',J({r,last})); }
{ const G=fresh('2025-09-22',9); friend('heroine_01'); const d0=G.day; let x=null;
  for(let d=d0;d<d0+14&&!x;d++){ at(d,12); HASK.phone(G); x=R().sent.find(q=>q.id==='heroine_01'&&q.state==='planned'); if(!x){ at(d,23.98); HASK.phone(G); } }
  at(x.send.day+1,8); HASK.phone(G); const iv=ivOf(x), m=iv&&G.msgs.find(q=>q.iv===iv.id);
  check('1. 睡過 21:30（隔天早上才醒）：訊息照原本的時間（前一天 21:30）放進手機',!!m&&m.day===x.send.day&&m.h===21.5&&x.state==='sent',J({x,m})); }

/* ---- 2 一週最多 3 則、一天 1 則 ---- */
{ const G=fresh('2025-09-22',9); for(const id of ['heroine_01','heroine_03','classmate_peishan','heroine_04']) friend(id); const d0=G.day;
  for(let d=d0;d<d0+7;d++) day(d);
  const S=sent().filter(x=>x.send.day>=d0&&x.send.day<d0+7), per={}; for(const x of S) per[x.send.day]=(per[x.send.day]|0)+1;
  check('2. 同一週四位都夠格：最多 3 則、一天最多 1 則',S.length===3&&Object.values(per).every(n=>n===1),J(S.map(x=>[x.id,x.send.day,x.place||x.loc]))); }

/* ---- 3 考試週、考前一週 ---- */
{ const G=fresh('2025-10-13',9); for(const id of ['heroine_01','heroine_03','classmate_peishan']) friend(id); const d0=G.day;   /* 第 7 週一 */
  for(let d=d0;d<d0+14;d++) day(d);
  check('3. 第 7～8 週（考前一週、期中考週）：一則都沒有',sent().length===0&&HASK.examish(d0)&&HASK.examish(d0+7),J(sent())); }

/* ---- 4 心意邀約的窗口 ---- */
{ const w=TERMEND.windowOf('Y1S1'); const G=fresh(CALENDAR.dateOf(w.from).key,9); for(const id of ['heroine_01','heroine_03']) friend(id);
  for(let d=w.from;d<=w.to;d++) day(d);
  check('4. 學期末心意邀約的窗口（'+CALENDAR.dateOf(w.from).key+'～'+CALENDAR.dateOf(w.to).key+'）：一則都沒有（窗口最後一天也不傳隔天的）',sent().length===0,J(sent())); }

/* ---- 5 學姊筆試以前 ---- */
{ const G=fresh('2025-09-22',9); friend('heroine_05',STAGE5); const d0=G.day; for(let d=d0;d<d0+21;d++) day(d);
  const a=sent().filter(x=>x.id==='heroine_05').length;
  const G2=fresh('2026-02-23',9); friend('heroine_05',STAGE5); const d1=G2.day; for(let d=d1;d<d1+21;d++) day(d); const b=sent().filter(x=>x.id==='heroine_05');
  check('5. 學姊：筆試（2026-02-02）以前一則都沒有；之後（大一下第 1 週起三週）會約',a===0&&b.length>=1,J({before:a,after:b.map(x=>[x.place||x.loc,x.day])})); }

/* ---- 6 可昕交往中只有校外 ---- */
{ const G=fresh('2025-09-22',9,{dating_kexin:true}); friend('kexin',STAGE6); const d0=G.day; for(let d=d0;d<d0+42;d++) day(d);
  const K=sent().filter(x=>x.id==='kexin');
  check('6. 可昕交往中：六週內只有校外（週三晚上傳、約週六或週日）、沒有日常；兩則至少隔 28 天',K.length>=1&&K.every(x=>x.k==='o'&&wd(x.send.day)===3&&[6,0].includes(wd(x.day)))&&K.every((x,i)=>!i||x.send.day-K[i-1].send.day>=28),J(K.map(x=>[x.loc,x.send.day,x.day]))); }
{ const G=fresh('2025-09-22',9,{dating_kexin:true}); friend('kexin',STAGE6); const d0=G.day; let x=null; for(let d=d0;d<d0+14&&!x;d++){ day(d); x=sent().find(q=>q.id==='kexin'); }
  const m=x&&G.msgs.find(q=>q.ask&&q.ask.id===x.ask); const r=m&&PHONE.answer(G,x.ask,0); const t=(G.trips||[]).find(q=>q.who==='kexin'&&q.by==='npc');
  check('6. 答應：排進校外約會（DATE.book，by npc、她說的那一天、出發時間照表）、她回「好。」',!!m&&!!r&&!!t&&t.day===x.day&&t.depart===x.depart&&t.status==='booked'&&x.trip===t.trip&&thread('kexin').slice(-1)[0].text==='好。',J({x,t:t&&{day:t.day,depart:t.depart,locs:t.locs}})); }
{ const G=fresh('2025-09-22',9,{dating_kexin:true}); friend('kexin',STAGE6); const d0=G.day; let x=null; for(let d=d0;d<d0+14&&!x;d++){ day(d); x=sent().find(q=>q.id==='kexin'); }
  DATE.book(G,{who:'heroine_01',locs:['D01'],day:x.day,depart:x.depart,kind:'half'});   /* 回之前你自己先排了同一個時間 */
  PHONE.answer(G,x.ask,0); const sys=(G.msgs||[]).filter(m=>PHONE.th(m)==='sys').slice(-1)[0];
  check('6. 排不進（那時候已經有行程）：不排、系統一句，她不回「好。」',!(G.trips||[]).some(q=>q.who==='kexin')&&!!sys&&/排不進行程/.test(sys.text)&&x.ans==='fail',J({sys:sys&&sys.text,ans:x.ans})); }

/* ---- 7 心願地點 ---- */
{ const G=fresh('2025-09-22',9); const W=new Set(DATE.HEROINES.map(h=>DATE.wishOf(h)).filter(Boolean)); for(const id of DATE.HEROINES){ friend(id,STAGE6); G.flags['dating_'+id]=true; }
  const d0=G.day; for(let d=d0;d<d0+56;d++) day(d); const O=sent().filter(x=>x.k==='o');
  check('7. 七位都交往中、八週：校外邀約有、沒有一則是心願地點',O.length>=3&&!O.some(x=>W.has(x.loc)),J(O.map(x=>[x.id,x.loc]))); }

/* ---- 8 不了、改天 ---- */
{ const G=fresh('2025-09-22',9); friend('heroine_01'); let d=G.day; const got=[];
  for(let k=0;k<2;k++){ let x=null; for(let n=0;n<20&&!x;n++,d++){ day(d); x=sent().find(q=>q.id==='heroine_01'&&!got.includes(q)); } got.push(x); INV.answer(G,x.iv,'no'); }
  const s=R().st.heroine_01, last=thread('heroine_01').slice(-1)[0];
  check('8. 不了：她回「好。那下次換你約。」；連續兩次＝暫停 4 週',!!last&&last.text==='好。那下次換你約。'&&s.pause===G.day+28,J({pause:s.pause,day:G.day,last:last&&last.text}));
  const p0=d; let more=0; for(;d<p0+20;d++){ day(d); } more=sent().filter(q=>q.id==='heroine_01'&&!got.includes(q)).length;
  check('8. 暫停期間不約',more===0,more); }
{ const G=fresh('2025-09-22',9); friend('heroine_01'); let d=G.day, x=null; for(let n=0;n<20&&!x;n++,d++){ day(d); x=sent().find(q=>q.id==='heroine_01'); }
  const r=INV.answer(G,x.iv,'later'); const last=thread('heroine_01').slice(-1)[0], rd=R().redo.find(q=>q.sid===x.sid);
  check('8. 改天：她回「好。我在手帳上改一格。」、不打開自己選時間（noFlow）、3 天後同一個地點',!!r&&r.noFlow===true&&last.text==='好。我在手帳上改一格。'&&!!rd&&rd.due===G.day+3&&rd.place===x.place,J({r,rd}));
  let y=null; for(let n=0;n<12&&!y;n++,d++){ day(d); y=sent().find(q=>q.id==='heroine_01'&&q.sid!==x.sid); }
  check('8. 改天以後：同一個地點再約一次（標 redo）',!!y&&y.place===x.place&&y.redo===x.sid&&y.send.day>=rd.due,J(y));
  INV.answer(G,y.iv,'later'); check('8. 再約的那一次又改天：不會再排第三次',!R().redo.some(q=>q.sid===y.sid),J(R().redo)); }

/* ---- 9 個人 ---- */
{ const G=fresh('2025-09-27',9); friend('heroine_04'); const e={place:'cafe'}, v={h:[13]}; const sat=G.day;
  check('9. 子晴：週六 13:00 不約（在睡覺）、15:30 可以',HASK.dailyOk(G,'heroine_04',e,v,sat,13)===false&&HASK.dailyOk(G,'heroine_04',e,v,sat,15.5)===true); }
{ const G=fresh('2025-09-22',9); friend('heroine_02'); let wk=null, off=null; const d0=G.day; for(let d=d0;d<d0+7;d++){ at(d,9); if(HASK.works(G,'heroine_02',d)) wk=wk==null?d:wk; else off=off==null?d:off; }
  check('9. 芷若：上班的日子 22:40 傳、沒班 20:00 傳',wk!=null&&off!=null&&Math.abs(HASK.sendH(G,'heroine_02',wk)-(22+40/60))<1e-9&&HASK.sendH(G,'heroine_02',off)===20,J({wk,off})); }
{ const G=fresh('2025-09-22',9); friend('heroine_03'); const d0=G.day; let x=null; for(let d=d0;d<d0+28&&!x;d++){ day(d); x=sent().find(q=>q.id==='heroine_03'&&q.place==='noodle'); }
  if(x){ const m=G.msgs.find(q=>q.ask&&q.ask.id===x.ask); PHONE.answer(G,x.ask,0); const last=thread('heroine_03').slice(-1)[0];
    check('9. 語彤的麵店（here）：手機問一聲（不是 INV 的邀約）；答應回「好。……我跟阿姨說。」',x.here===true&&!x.iv&&!!m&&last.text==='好。……我跟阿姨說。',J({x,last:last&&last.text})); }
  else { const e=HASK_DATA.people.heroine_03.daily.find(q=>q.place==='noodle'); let okd=false; for(let d=d0+1;d<d0+28&&!okd;d++){ at(d-1,12); for(const h of e.pre.h) if(HASK.dailyOk(G,'heroine_03',e,e.pre,d,h)) okd=true; }
    check('9. 語彤的麵店（here）：四週內她在麵店的時間都約不到（沒有可以測的那一天）',false,J({okd,sent:sent().map(q=>[q.id,q.place])})); } }
{ const st0=H.G.stage; H.G.stage='econ'; const b=HASK.block(H.G,'kexin',H.G.day); H.G.stage=st0; const b2=HASK.block(H.G,'kexin',H.G.day);
  check('10. 經濟系那一年（stage econ）可昕不主動約：block＝econ；法律系照舊不是 econ（AA_529 第 1 點）',b==='econ'&&b2!=='econ',J({b,b2})); }
H.done();
