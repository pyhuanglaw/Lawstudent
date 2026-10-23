// AA_392 學姊第六批（企劃線 e81a1afe1；任務 SIS-B6-L-1023；D111「學姊才是真正的女主角」）——不需要瀏覽器。
//   1  第 1 節：交往中（臺灣、日本路線，她在美國）每週日 10:00 視訊（ev_sis_video_gf）：六組照順序、各一次，還沒到那一組的週次只有旁白；T1、SA_X 照片照收，T2 不收；
//      逐字對稿（六組、旁白）；沒接＝「你在忙。下週。」；連兩週沒接，第三週她不打「這週我先不打了。你有空打給我。」，下一週照常；
//      臺灣路線大峽谷才交往：大峽谷那一週不排、下一個週日從第一組開始、中秋那組不演
// 修改前（開發分支 8f9b305c1）：第 1 項 FAIL（交往中整個秋天沒有每週一格）。用法：node tests/aa392_sis_b6_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(NOODLE_CLOSED|R2Y4B|R2Y4B_EVENTS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
const {check,GM}=H;
global.CG_REGISTRY={};
load('src/noodle_closed3d.js'); load('src/data/r2y4b_events.js'); load('src/r2y4b3d.js');
const S=R2Y4B, D=k=>STORY.dayOfKey(k), T=(d,h)=>d*24+h, J=JSON.stringify;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,2).join(' / ')); } };
const fresh=(key,h,route)=>{ const G=H.fresh(key,h,'dorm',{EXCHANGE_ROUTE:route||'TW',EXCH_RULE:1}); G.acts={att:{}}; G.outings=[]; H.at(key,h); return G; };
const th=()=>(H.G.msgs||[]).filter(m=>m.th==='p:heroine_05');
/* 一天一天走：跑手機規則、收訊息；交往版的視訊到了，miss(k) 為真＝沒接（missed＋outingMissed），否則當作接了（done）*/
const walk=(d0,d1,miss)=>{ for(let d=d0;d<=d1;d++) for(const h of [6,7.5,8.5,9.5,10.5,12,20]){ H.at(CALENDAR.dateOf(d).key,h); S.phone(H.G,GM); PHONE.tick(H.G);
  for(const q of OUT.rec(H.G)) if(/^y4_sa_(g|v)_/.test(q.id)&&q.state==='planned'&&T(q.day,q.h)<=T(d,h)){ if(miss&&q.sa&&miss(q.sa.k)){ q.state='missed'; OUT.onMissed(GM,q); } else q.state='done'; } } };
const gv=()=>OUT.rec(H.G).filter(q=>/^y4_sa_g_/.test(q.id)).sort((a,b)=>a.day-b.day);
const keyOf=d=>CALENDAR.dateOf(d).key;

(async()=>{
let doc=''; try{ doc=cp.execSync('git show e81a1afe1:"docs/story_planning/AA_392_學姊第六批_說了沒發生與每週視訊.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc=''; }
/* ---- 1 ---- */
await sec(1,async()=>{ check('1. 讀得到稿（企劃線 e81a1afe1 的 AA_392）',!!doc);
  const ev=STORY_EVENTS.find(e=>e.id==='ev_sis_video_gf'), txt=ev?ev.dialogue.filter(n=>n.text).map(n=>n.text):[];
  const sec13=(doc.split('### 1-3.')[1]||'').split('### 1-4.')[0], lines=[...sec13.matchAll(/^書瑀：(.+)$/mg)].map(m=>m[1]).concat([...sec13.matchAll(/書瑀：「(.+?)」/g)].map(m=>m[1]));
  const narr=(doc.match(/用完以後每週一行旁白：「(.+?)」/)||[])[1];
  check('1. 六組視訊的台詞（書瑀說的）和稿一字不差都在',lines.length>=20&&lines.every(l=>txt.includes(l)||txt.includes(l.replace(/^照片你看到了吧。$/,'照片你看到了吧。'))),J(lines.filter(l=>!txt.includes(l))));
  check('1. 用完以後的旁白和稿一字不差',!!narr&&txt.includes(narr)&&S.SA_VG_NARR===narr,narr);
  /* 臺灣路線、7/29 就交往：8/6～12/17 每週日 10:00 */
  fresh('2028-08-02',20,'TW'); H.G.flags.dating_heroine_05=true; H.FRIEND('heroine_05'); walk(D('2028-08-03'),D('2028-12-20'));
  const V=gv(), sun=V.every(q=>CALENDAR.dateOf(q.day).wd===7&&q.h===10);
  check('1. 交往中（臺灣路線）：8/6 起每週日 10:00 一格視訊「和書瑀視訊（她那邊週六晚上）」，到 12/17',V.length===20&&sun&&keyOf(V[0].day)==='2028-08-06'&&keyOf(V[V.length-1].day)==='2028-12-17'&&V.every(q=>q.ev==='ev_sis_video_gf'),J(V.map(q=>keyOf(q.day)+'@'+q.h)));
  const sets=V.filter(q=>q.sa.gset<6).map(q=>keyOf(q.day)+':V'+(q.sa.gset+1));
  check('1. 六組照順序、各一次：V1 8/13、V2 9/3、V3 10/1（中秋）、V4 11/5（冬令時間）、V5 11/26（感恩節）、V6 12/10',J(sets)===J(['2028-08-13:V1','2028-09-03:V2','2028-10-01:V3','2028-11-05:V4','2028-11-26:V5','2028-12-10:V6']),J(sets));
  const tags=th().filter(m=>m.from==='heroine_05').map(m=>m.tag||'');
  check('1. 交往中：T1、SA_X 照片照收（花生醬、烏龍茶、感恩節…），T2（直屬學姊問近況）不收、朋友版視訊和 10/11 朋友版大峽谷照片不排',tags.some(t=>/^y4_sa_t1_/.test(t))&&tags.some(t=>/^y4_sa_x_/.test(t))&&!tags.some(t=>/^y4_sa_t2_/.test(t))&&!OUT.rec(H.G).some(q=>/^y4_sa_v_/.test(q.id))&&!tags.includes('y4_sa_canyon_photo'),J([...new Set(tags)]));
  /* 演出來：V1、旁白 */
  { const q=V.find(x=>x.sa.gset===0); q.state='planned'; H.at(keyOf(q.day),10); H.said=[]; H.picks=[0]; await OUT.go(GM,q);
    const t=H.said.map(s=>s.t); check('1. V1 演出來：「到這邊一個禮拜了。」→「給我看。」→「三本是今天借的。」',t.includes('到這邊一個禮拜了。')&&t.includes('三本是今天借的。'),J(t)); }
  { const q=V.find(x=>x.sa.gset===6); q.state='planned'; H.at(keyOf(q.day),10); H.said=[]; await OUT.go(GM,q);
    check('1. 沒輪到一組的週次：只有那一行旁白',H.said.length>=1&&H.said[0].t===S.SA_VG_NARR,J(H.said)); }
  /* 沒接 */
  fresh('2028-08-02',20,'TW'); H.G.flags.dating_heroine_05=true; H.FRIEND('heroine_05'); walk(D('2028-08-03'),D('2028-09-12'),k=>k===1||k===2);
  const m=th().filter(x=>x.from==='heroine_05').map(x=>keyOf(x.day)+' '+x.text), V2=gv().map(q=>keyOf(q.day));
  check('1. 沒接（8/13）：她只傳一則「你在忙。下週。」',m.includes('2028-08-13 你在忙。下週。'),J(m));
  check('1. 連兩週沒接（8/13、8/20）：8/27 她不打，傳「這週我先不打了。你有空打給我。」；9/3 照常',!V2.includes('2028-08-27')&&m.includes('2028-08-27 這週我先不打了。你有空打給我。')&&V2.includes('2028-09-03'),J({m,V2}));
  check('1. 沒接的那一組不補（8/13 的 V1 沒接，9/3 是 V2）',(gv().find(q=>keyOf(q.day)==='2028-09-03')||{sa:{}}).sa.gset===1,J(gv().map(q=>keyOf(q.day)+':'+q.sa.gset)));
  /* 日本路線（8/5 回臺灣）：也排 */
  fresh('2028-08-05',20,'JP'); H.G.flags.JP_DEPARTED=D('2028-03-25'); H.G.flags.JP_RETURNED=D('2028-08-05'); H.G.flags.dating_heroine_05=true; H.FRIEND('heroine_05'); walk(D('2028-08-06'),D('2028-08-14'));
  check('1. 日本路線交往中：8/6 起也每週日視訊，8/13 是 V1',gv().length===2&&gv()[1].sa.gset===0,J(gv().map(q=>keyOf(q.day)+':'+q.sa.gset)));
  /* 美國路線：不排（同一班飛機）；前任：不排 */
  fresh('2028-08-02',20,'US'); H.G.flags.dating_heroine_05=true; H.FRIEND('heroine_05'); walk(D('2028-08-03'),D('2028-08-14'));
  check('1. 美國路線：不排每週視訊',!gv().length);
  fresh('2028-08-02',20,'TW'); H.G.flags.EX_heroine_05=true; H.FRIEND('heroine_05'); walk(D('2028-08-03'),D('2028-08-14'));
  check('1. 和學姊分手過：不排',!gv().length&&!th().some(x=>/^y4_sa_/.test(x.tag||'')));
  /* 臺灣路線 10/13 大峽谷才交往 */
  fresh('2028-08-02',20,'TW'); H.rel('heroine_05',60,45,40); walk(D('2028-08-03'),D('2028-10-06'));
  OUT.plan(H.G,{id:'y4_sis_canyon',ev:'ev_sis_canyon',day:D('2028-10-07'),h:7,place:'桃園機場',title:'秋假',travel:'',travelH:1}); OUT.get(H.G,'y4_sis_canyon').state='done';
  H.at('2028-10-13',18); S.canyonAfter(H.G,'tw'); H.at('2028-10-15',21); S.phone(H.G,GM); walk(D('2028-10-15'),D('2028-11-07'));
  const C=gv().map(q=>keyOf(q.day)+':'+(q.sa.gset<6?'V'+(q.sa.gset+1):'旁白'));
  check('1. 大峽谷才交往：大峽谷那一週（10/8、10/15）不排；10/22 起從第一組開始（V1、V2），中秋 V3 不演，11/5 V4',!!H.G.flags.dating_heroine_05&&J(C)===J(['2028-10-22:V1','2028-10-29:V2','2028-11-05:V4']),J(C)); });
H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
