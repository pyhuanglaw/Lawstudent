// AA_466 日本路線讀一遍（企劃線 30cc3235a，AA-B 2026-10-25 15:0x；第①、②級）——不需要瀏覽器。台詞逐字對稿（git show 讀稿、解析表格）。
//   0 讀稿：1-2 的十二則（誰、什麼時候、字；第 4 則在家／國外兩版）、第 2 節兩週一張的日子、第 7、8 張；JPPREP_LINES.HOME_GROUP／HOME_GROUP_WHEN／HOME_GROUP_ABROAD、Y34B.YT_JP 照稿一字不差
//   1 住家裡版家人群組（src/jpprep3d.js）：
//     1-a 住家裡、人在臺灣（畢業以後住家裡 pgHome，學期表還在算＝延畢那種）一個學期的週四：照順序 1→12，「國外」兩則（8、11）跳過、跳過的這一輪不補，一輪用完才從頭；第 4 則是在家版「你兒子在家 叫他去問」
//     1-b 人在國外（STORY.abroad）的週四：「國外」兩則照順序出（同 AA 的 term_sweep：日本路線、沒有演出發）；出發前那幾週在家、3/23 那三句不佔位置
//     1-c 從第 1 則開始、全部人在國外（3/30～學期表結束，十一個週四）：照順序一則都不跳；第 4 則國外版；同一則兩次至少隔十二週
//     1-d 舊存檔（沒有 HOME_LIVE_N）：照手機裡已經收過的住家裡版則數接著算；已經發過的那一週不再發
//     1-e 照舊：出發以後（JP_DEPARTED）人在日本，家人群組整個不發（jp3d.js J-S14 擋 HOME.phoneRules；這次沒改）
//   2 語彤的田野照片（src/y34b3d.js S.ytJPPhone）：日本路線 3/25～8/12 每天跑：只在 3/30、4/13、4/27、5/11、5/25、6/8、6/22、7/6 各一張，照順序 1～8、各一次；
//     沒有字、不用回；跳過時間的補那一張；舊存檔（每週一張收過三張）接第 4 張、不重發
// 修改前（開發分支 661423a71）：1-a、1-b、1-c、1-d、2 都 FAIL。用法：node tests/aa466_jp_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
const load=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(EXCH|Y34B|MSG|MSG_POOL|MSG2_POOL|GROUP|GROUP_EVENTS|R2Y3A|R2Y3A_EVENTS|R2Y3B|R2Y3B_EVENTS|HOLFF|JP|JP_EVENTS|JPPREP|JPPREP_LINES|JPPREP_EVENTS|ECONFF|RETAKE_HOME)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); return true; };
GM.caption=()=>{}; GM.toast=()=>{};
let err='';
try{ for(const f of ['src/holff3d.js','src/exchange3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/data/group_events.js','src/group3d.js','src/y34b3d.js','src/data/r2y3a_events.js','src/r2y3a3d.js','src/data/r2y3b_events.js','src/r2y3b3d.js','src/data/jp_events.js','src/jp3d.js','src/data/jpprep_events.js','src/jpprep3d.js']) load(f); }catch(e){ err=String(e&&e.stack||e); }
/* ---------- 稿 ---------- */
const SHA='30cc3235a', P466='docs/story_planning/AA_466_日本路線讀一遍_家人群組在日本_語彤的田野照片.md';
const DOC=(()=>{ try{ return cp.execSync('git -c core.quotepath=false show '+SHA+':"'+P466+'"',{cwd:process.env.SPEC_GIT_DIR||H.ROOT,encoding:'utf8',maxBuffer:1<<26,stdio:['ignore','pipe','ignore']}); }catch(e){ return ''; } })();
const part=(a,b)=>{ const i=DOC.indexOf(a); if(i<0) return ''; const j=b?DOC.indexOf(b,i+a.length):-1; return DOC.slice(i,j<0?DOC.length:j); };
const rows=s=>s.split('\n').filter(l=>/^\|/.test(l.trim())&&!/^\|[-| :]+\|\s*$/.test(l.trim())).map(l=>l.trim().replace(/^\||\|$/g,'').split('|').map(c=>c.trim()));
const SP={爸爸:'dad',媽媽:'mom',姊姊:'sister'};
/* 1-2 的表：[順序, 什麼時候, 家人群組]；「（原本）」「（1-1）」是註記；第 4 則「…（在家）；…（國外）」兩版 */
const T12=rows(part('### 1-2','- 對過的')).filter(r=>/^\d+$/.test(r[0])).map(r=>{ const when=r[1]==='國外'?'abroad':(r[1]==='在家'?'home':null);
  const cellTxt=r[2].replace(/（原本）$/,'').replace(/（1-1）$/,''); let home=[], abroad=null;
  const segs=cellTxt.split('／').map(s=>{ const k=s.indexOf('：'); return [SP[s.slice(0,k)],s.slice(k+1)]; });
  const last=segs[segs.length-1]; const m=/^(.*)（在家）；(.*)（國外）$/.exec(last[1]);
  if(m){ home=segs.slice(0,-1).concat([[last[0],m[1]]]); abroad=segs.slice(0,-1).concat([[last[0],m[2]]]); } else home=segs;
  return {n:+r[0],when,home,abroad}; });
const Q11=(part('### 1-1','### 1-2').match(/人在國外的時候，媽媽那句換成\*\*：\s*\n\s*>\s*媽媽：(.+)/)||[])[1];
const PHOTO_DAYS=((part('## 2.','## 3.').match(/兩週一張（([^）]+)）/)||[])[1]||'').split('、').filter(Boolean);
const PHOTO_NEW=rows(part('## 2.','## 3.')).filter(r=>/^[78]$/.test(r[0])).map(r=>r[1]);
const OLD6=['📷（水源市場的菜攤，阿嬤背對鏡頭在算錢）','📷（老書店門口的傘桶，插滿了傘）','📷（鐘錶行的玻璃櫃，每一支錶停在不同的時間）','📷（修鞋店的牆，掛滿了鞋楦）','📷（她的田野筆記，第一頁只寫了一行，字太小看不清楚）','📷（巷口的公布欄，貼著一張手寫的「收舊家電」）'];   /* 原本六張（開發分支 661423a71 的 y34b3d.js，照原本順序）*/
/* ---------- 共用 ---------- */
const X=()=>typeof JPPREP!=='undefined'?JPPREP:null, L=()=>JPPREP_LINES;
const D=k=>STORY.dayOfKey(k), AN='heroine_01', keyOf=d=>CALENDAR.dateOf(d).key;
const setT=(k,h)=>{ const G=H.G, d=typeof k==='number'?k:D(k); G.day=d; G.hour=h; G.weekday=CALENDAR.dateOf(d).wd%7; E.hour=h; };
const jpG=(k,h,o)=>{ o=o||{}; const G=H.fresh('2028-02-20',h,'dorm',Object.assign({EXCHANGE_ROUTE:'JP',EXCH_RULE:1,X1_JP:D('2028-02-20')},o.flags||{})); setT(k,h); G.acts={att:{}}; G.outings=[]; G.visited={}; GM.npc={}; HOME.rec(G).at=true;
  H.FAMILIAR(AN); H.date(AN); return G; };
const pgG=(k,h)=>{ const G=H.fresh('2026-09-01',h,'dorm',{MOVED_OUT:true}); setT(k,h); G.outings=[]; G.acts={att:{}}; const R=HOME.rec(G); R.at=true; return G; };
const rules=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const homeGrp=day=>(H.G.msgs||[]).filter(m=>m.th==='g:home'&&m.day===day);
const pairs=day=>homeGrp(day).map(m=>m.from+':'+m.text);
const P=g=>g.map(([w,t])=>w+':'+t);
const which=day=>{ const pp=J(pairs(day)); if(pp===J(P(L().JP_0323))) return {i:'0323',v:'0323'}; for(let i=0;i<T12.length;i++){ if(J(P(T12[i].home))===pp) return {i,v:'home'}; if(T12[i].abroad&&J(P(T12[i].abroad))===pp) return {i,v:'abroad'}; } return pp==='[]'?null:{i:-1,v:pp}; };
/* 每個週四 20:05 跑一次規則，回傳 [{day, i（第幾則，0 起）, v（home／abroad）, abroad（那天 STORY.abroad）}] */
const thursdays=(a,b)=>{ const out=[]; for(let d=D(a);d<=D(b);d++){ if(CALENDAR.dateOf(d).wd%7!==4) continue; setT(d,20.05); rules(); const w=which(d); if(w) out.push({day:d,k:keyOf(d),i:w.i,v:w.v,abroad:!!STORY.abroad(H.G)}); } return out; };
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };

(async()=>{
  check('0. 讀稿（企劃線 AA_466 @'+SHA+'）：1-2 十二則、1-1 國外那句、第 2 節八個日子、第 7、8 張',DOC.indexOf('# AA_466')>=0&&T12.length===12&&T12.map(r=>r.n).join()==='1,2,3,4,5,6,7,8,9,10,11,12'&&Q11==='換了 上個月就換了'&&PHOTO_DAYS.length===8&&PHOTO_NEW.length===2,J({T12:T12.length,Q11,PHOTO_DAYS,PHOTO_NEW}));
  check('0. 檔案載得到（jpprep、jp3d、y34b3d）',!err&&!!X()&&typeof JP!=='undefined'&&typeof Y34B!=='undefined',err.split('\n')[0]);
  if(!X()||!DOC){ H.done(); return; }
  await sec(0,()=>{
    check('0. HOME_GROUP＝1-2 的十二則（第 4 則在家版），一字不差、照順序',J(L().HOME_GROUP.map(P))===J(T12.map(r=>P(r.home))),J(L().HOME_GROUP.length));
    check('0. HOME_GROUP_WHEN＝「什麼時候」那一欄（8、11＝國外，其他都可以）',J(L().HOME_GROUP_WHEN||null)===J(T12.map(r=>r.when)),J(L().HOME_GROUP_WHEN||null));
    const ab=L().HOME_GROUP_ABROAD||{}; check('0. HOME_GROUP_ABROAD＝第 4 則的國外版（媽媽「換了 上個月就換了」），只有這一則',J(Object.keys(ab))===J(['3'])&&J(P(ab[3]||[]))===J(P(T12[3].abroad||[]))&&(ab[3]||[]).slice(-1)[0][1]===Q11,J(ab));
    check('0. 第 1～6 則和原本（AA_442 H1～H6）一樣、7～12 是新的',J(L().HOME_GROUP.slice(0,6).map(P))===J(T12.slice(0,6).map(r=>P(r.home))));
    check('0. Y34B.YT_JP＝原本六張（原本的順序）＋第 7、8 張（稿的表）',J(Y34B.YT_JP)===J(OLD6.concat(PHOTO_NEW)),J(Y34B.YT_JP));
    const ds=PHOTO_DAYS.map(s=>{ const [m,d]=s.split('/').map(Number); return D('2028-'+String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0')); });
    check('0. 稿的八個日子都是週四、從 3/30 起每兩週一次',ds.every((d,i)=>CALENDAR.dateOf(d).wd%7===4&&d===D('2028-03-30')+14*i),J(PHOTO_DAYS));
  });

  /* ======================= 1-a 住家裡、人在臺灣 ======================= */
  await sec('1-a',()=>{
    pgG('2029-03-01',20.05); const R=thursdays('2029-03-01','2029-06-21');
    const want=[0,1,2,3,4,5,6,8,9,11,0,1,2,3,4,5,6,8,9,11];
    check('1-a 畢業以後住家裡（學期中）'+R.length+' 個週四：照順序 1→12、「國外」的 8、11 跳過，一輪用完才從頭',R.length>=12&&J(R.map(r=>r.i))===J(want.slice(0,R.length))&&R.every(r=>!r.abroad),J(R.map(r=>r.k+'#'+(r.i+1))));
    check('1-a 第 4 則是在家版「你兒子在家 叫他去問」（不是國外版）',R.filter(r=>r.i===3).length>=1&&R.filter(r=>r.i===3).every(r=>r.v==='home'));
    check('1-a 照舊不問、不用回（沒有選項）',(H.G.msgs||[]).filter(m=>m.th==='g:home').every(m=>!m.ask));
    const first=R.findIndex(r=>r.i===0), again=R.findIndex((r,j)=>j>first&&r.i===0);
    check('1-a 同一則兩次之間：在家（跳過國外兩則）隔十週，前十則各一次',again-first===10&&new Set(R.slice(0,10).map(r=>r.i)).size===10,J([first,again]));
    const pos=(()=>{ let p=0; for(const r of R){ let j=p; while(j%12!==r.i) j++; p=j+1; } return p; })();
    check('1-a 存檔記走過幾個位置（F.HOME_LIVE_N，跳過的也算）',H.G.flags.HOME_LIVE_N===pos,J([H.G.flags.HOME_LIVE_N,pos]));
  });

  /* ======================= 1-b 人在國外（同 AA 的 term_sweep：日本路線、沒有演出發）======================= */
  await sec('1-b',()=>{
    jpG('2028-02-24',20.05); const R=thursdays('2028-02-24','2028-08-03');
    const home=R.filter(r=>!r.abroad&&r.i!=='0323'), abr=R.filter(r=>r.abroad), d23=R.find(r=>r.k==='2028-03-23');
    check('1-b 出發前在臺灣的週四（2/24、3/2、3/9、3/16）：第 1、2、3、4 則（第 4 則在家版）',J(home.map(r=>r.k))===J(['2028-02-24','2028-03-02','2028-03-09','2028-03-16'])&&J(home.map(r=>r.i+':'+r.v))===J(['0:home','1:home','2:home','3:home']),J(home.map(r=>r.k+'#'+(r.i+1)+r.v)));
    check('1-b 3/23 那三句（JP_0323）照舊，不佔位置（下一個週四接第 5 則）',!!d23&&d23.i==='0323'&&J(pairs(D('2028-03-23')))===J(P(L().JP_0323))&&!!abr[0]&&abr[0].i===4);
    check('1-b 人在國外（STORY.abroad）的週四：接著第 5 則照順序；「國外」的 8（你那邊幾點）、11（日本那邊冷不冷）有出',abr.length>=6&&J(abr.slice(0,8).map(r=>r.i))===J([4,5,6,7,8,9,10,11].slice(0,Math.min(8,abr.length))),J(abr.map(r=>r.k+'#'+(r.i+1))));
    check('1-b 「國外」的兩則只在人在國外的時候出',R.filter(r=>r.i===7||r.i===10).every(r=>r.abroad));
    check('1-b 整段沒有連兩週同一則；同一則兩次至少隔十週',R.every((r,j)=>{ const k=R.findIndex((x,jj)=>jj>j&&x.i===r.i); return k<0||k-j>=10; }));
  });

  /* ======================= 1-c 從第 1 則開始、全部在國外 ======================= */
  await sec('1-c',()=>{
    jpG('2028-03-30',20.05); H.G.flags.HOME_LIVE_N=0; const R=thursdays('2028-03-30','2028-08-03').filter(r=>r.abroad);
    check('1-c 人在國外的連續 '+R.length+' 個週四（3/30～大三下學期表結束）：從第 1 則照順序、一則都不跳（國外的 8、11 也出）',R.length>=11&&J(R.map(r=>r.i))===J([0,1,2,3,4,5,6,7,8,9,10,11].slice(0,R.length)),J(R.map(r=>r.k+'#'+(r.i+1))));
    const ab4=R.filter(r=>r.i===3);
    check('1-c 人在國外輪到第 4 則：媽媽換成「換了 上個月就換了」',ab4.length===1&&ab4[0].v==='abroad'&&J(pairs(ab4[0].day))===J(P(T12[3].abroad)),J(ab4.map(r=>r.k+r.v)));
    check('1-c 同一則兩次至少隔十二週',R.every((r,j)=>{ const k=R.findIndex((x,jj)=>jj>j&&x.i===r.i); return k<0||k-j>=12; }));
  });

  /* ======================= 1-d 舊存檔 ======================= */
  await sec('1-d',()=>{
    const G=pgG('2029-03-01',20.05); delete G.flags.HOME_LIVE_N;
    for(const k of ['2028-03-02','2028-03-09','2028-03-16']){ const d=D(k); G.msgs.push({th:'g:home',from:'dad',text:'（舊的）',day:d,h:20,tag:'home_live_'+d}); }
    G.msgs.push({th:'g:home',from:'dad',text:L().JP_0323[0][1],day:D('2028-03-23'),h:20,tag:'home_live_'+D('2028-03-23')});   /* 3/23 那三句不算 */
    rules(); check('1-d 舊存檔（沒有 HOME_LIVE_N、手機裡收過三則住家裡版＋3/23）：接第 4 則',J(pairs(G.day))===J(P(T12[3].home))&&G.flags.HOME_LIVE_N===4,J(pairs(G.day)));
    const n0=(G.msgs||[]).length; setT('2029-03-01',22); rules(); check('1-d 已經發過的那一週不再發',(G.msgs||[]).length===n0);
    const G2=pgG('2029-03-01',20.05); delete G2.flags.HOME_LIVE_N; rules(); check('1-d 新的存檔（什麼都沒收過）從第 1 則開始',J(pairs(G2.day))===J(P(T12[0].home)));
  });

  /* ======================= 1-e 照舊：出發以後人在日本不發 ======================= */
  await sec('1-e',()=>{
    jpG('2028-04-20',20.05,{flags:{JP_DEPARTED:D('2028-03-25')}}); PHONE.join(H.G,'home','家人'); const R=thursdays('2028-03-30','2028-08-03');
    check('1-e 照舊（這次沒改）：出發以後（JP_DEPARTED）人在日本，家人群組整個不發（jp3d.js J-S14）',JP.inJapan(H.G)&&R.length===0,J(R.map(r=>r.k)));
  });

  /* ======================= 2 語彤的田野照片 ======================= */
  await sec(2,()=>{
    const mk=()=>{ const G=H.fresh('2028-03-25',20,'jp_hub',{EXCHANGE_ROUTE:'JP',EXCH_RULE:1,X1_JP:D('2028-02-20'),JP_DEPARTED:D('2028-03-25')}); G.acts={att:{}}; G.outings=[]; H.FRIEND('heroine_03'); return G; };
    const ph=()=>(H.G.msgs||[]).filter(m=>m.th==='p:heroine_03'&&/^📷（/.test(m.text));
    let G=mk(); for(let d=D('2028-03-25');d<=D('2028-08-12');d++){ for(const h of [12,23.5]){ setT(d,h); Y34B.phone(G); PHONE.tick(G); } }
    const got=ph(), days=got.map(m=>keyOf(m.day)), want=PHOTO_DAYS.map(s=>{ const [m,d]=s.split('/').map(Number); return '2028-'+String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0'); });
    check('2. 3/25～8/12 每天跑：只在 3/30、4/13、4/27、5/11、5/25、6/8、6/22、7/6 各一張（兩週一張）',J(days)===J(want),J(days));
    check('2. 照順序 1～8 各一次（原本六張＋巷子裡的腳踏車＋田野筆記第二十頁）',J(got.map(m=>m.text))===J(OLD6.concat(PHOTO_NEW))&&new Set(got.map(m=>m.text)).size===8,J(got.map(m=>m.text)));
    check('2. 照舊：沒有字、不用回；當地 22:00（台灣 21:00）',got.every(m=>!m.ask&&Math.abs(m.h-22)<1e-6));
    check('2. 4/6（不是那兩週的週四）沒有；8/5 回來以後沒有',!days.includes('2028-04-06')&&got.every(m=>m.day<=D('2028-08-05')));
    G=mk(); setT('2028-03-29',23); Y34B.phone(G); PHONE.tick(G); setT('2028-04-20',12); Y34B.phone(G); PHONE.tick(G); const sk=ph();
    check('2. 跳過時間（3/29 → 4/20）：補最近的 4/13 那一張；照順序是第 1 張（3/30 那一次沒收到，不補兩張）',sk.length===1&&keyOf(sk[0].day)==='2028-04-13'&&sk[0].text===OLD6[0],J(sk.map(m=>keyOf(m.day)+m.text)));
    G=mk(); for(const [k,i] of [['2028-03-30',0],['2028-04-06',1],['2028-04-13',2]]){ const d=D(k); G.msgs.push({th:'p:heroine_03',from:'heroine_03',text:OLD6[i],day:d,h:22,tag:'y3_yt_jp_'+d}); }
    for(let d=D('2028-04-13');d<=D('2028-04-28');d++){ setT(d,23.5); Y34B.phone(G); PHONE.tick(G); } const old=ph();
    check('2. 舊存檔（每週一張，已經收過 3/30、4/6、4/13 三張）：4/27 接第 4 張（修鞋店），不重發',old.length===4&&keyOf(old[3].day)==='2028-04-27'&&old[3].text===OLD6[3],J(old.map(m=>keyOf(m.day)+m.text)));
  });

  H.done();
})();
