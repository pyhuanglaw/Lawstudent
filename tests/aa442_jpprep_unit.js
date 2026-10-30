// AA_442（企劃線 d94d259ec，AA-B 2026-10-24）第 1、2 節＋AA_443 第 3 節（企劃線 f93fa3eda，週四家人群組的範圍更正）：src/data/jpprep_events.js、src/jpprep3d.js、home3d.js 的 HOME.LIVE_GROUP。
//   不需要瀏覽器。台詞逐字從稿讀出來比對（git show d94d259ec:…、f93fa3eda:…）。
//   0 讀稿、每一句都在 AA_442、檔案載得到、掛勾
//   1 住家裡的週四 20:00 家人群組：住家裡版 H1～H6（照 G.day/7 輪、不問、不用回、爸爸不傳「？」）；學期中住家裡（日本路線出發前、畢業以後學期表還在算＝延畢）換；
//     寒暑假（放假住家裡、日本路線回來以後）維持不發（AA_443 第 3 節）；住宿舍照舊問「會回去／這週不回」；過年爸爸在家不發；日本路線 3/23 換成三句；經濟系照舊不發
//   2 日本路線出發前 2/20～3/24：2-1 兩種存檔都有的（2/21、2/25、2/26、3/1、3/4、3/5、3/8、3/10、3/12、3/14、3/17、3/18、3/19、3/21）、
//     2-2 九點的日文電話（AN_JP_CALL、九個晚上、20:30～21:30 有別的就跳過、3/18 行李箱照片）、2-3 挽回中 3/11、沒有電話的五個早上、快轉停點；不是日本路線、出發了都沒有
// 修改前（開發分支 HEAD）：沒有這兩個檔、home3d.js 沒有 LIVE_GROUP——FAIL。用法：node tests/aa442_jpprep_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
const load=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(EXCH|Y34B|MSG|MSG_POOL|MSG2_POOL|GROUP|GROUP_EVENTS|R2Y3A|R2Y3A_EVENTS|R2Y3B|R2Y3B_EVENTS|HOLFF|JP|JP_EVENTS|JPPREP|JPPREP_LINES|JPPREP_EVENTS|ECONFF|RETAKE_HOME)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); return true; };
GM.caption=()=>{}; GM.toast=()=>{};
let err='', loaded=false;
try{ for(const f of ['src/holff3d.js','src/exchange3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/data/group_events.js','src/group3d.js','src/y34b3d.js','src/data/r2y3a_events.js','src/r2y3a3d.js','src/data/r2y3b_events.js','src/r2y3b3d.js','src/data/jp_events.js','src/jp3d.js']) load(f);
  loaded=load('src/data/jpprep_events.js')&&load('src/jpprep3d.js'); }catch(e){ err=String(e&&e.stack||e); }
/* ---------- 稿 ---------- */
const SHA='d94d259ec', P442='docs/story_planning/AA_442_國外學期盤點_日本出發前五週_住家裡的家人群組.md';
const DOC=(()=>{ try{ return cp.execSync('git -c core.quotepath=false show '+SHA+':"'+P442+'"',{cwd:process.env.SPEC_GIT_DIR||H.ROOT,encoding:'utf8',maxBuffer:1<<26,stdio:['ignore','pipe','ignore']}); }catch(e){ return ''; } })();
const part=(a,b)=>{ const i=DOC.indexOf(a); if(i<0) return ''; const j=b?DOC.indexOf(b,i+a.length):-1; return DOC.slice(i,j<0?DOC.length:j); };
const rows=s=>s.split('\n').filter(l=>/^\|/.test(l)&&!/^\|[-| :]+\|\s*$/.test(l)).map(l=>l.trim().replace(/^\||\|$/g,'').split('|').map(c=>c.trim()));
const Q=s=>s.split('\n').map(l=>/^\s*>\s*(.+?)\s*$/.exec(l)).filter(Boolean).map(m=>m[1]).map(t=>{ const k=t.indexOf('：'); return k>0&&k<8?{sp:t.slice(0,k),text:t.slice(k+1)}:{sp:null,text:t}; });
const qs=s=>{ const out=[]; const re=/「([^「」]*(?:「[^「」]*」[^「」]*)*)」/g; let m; while((m=re.exec(s))) out.push(m[1]); return out; };
const DOC466=(()=>{ try{ return cp.execSync('git -c core.quotepath=false show 30cc3235a:"docs/story_planning/AA_466_日本路線讀一遍_家人群組在日本_語彤的田野照片.md"',{cwd:process.env.SPEC_GIT_DIR||H.ROOT,encoding:'utf8',maxBuffer:1<<26,stdio:['ignore','pipe','ignore']}); }catch(e){ return ''; } })();   /* AA_466 第 1 節（十二則）*/
const P443='docs/story_planning/AA_443_多媒體中心看的字_摘要池加寫_週四家人群組範圍.md';
const DOC443=(()=>{ try{ return cp.execSync('git -c core.quotepath=false show 540e1d3fb:"'+P443+'"',{cwd:process.env.SPEC_GIT_DIR||H.ROOT,encoding:'utf8',maxBuffer:1<<26,stdio:['ignore','pipe','ignore']}); }catch(e){ return ''; } })();
const S1=part('## 1.','## 2.'), S21=part('### 2-1.','### 2-2.'), S22=part('### 2-2.','### 2-3.'), S23=part('### 2-3.','### 2-4.');
const cell=(s,key)=>{ const r=rows(s).find(x=>x[0].indexOf(key)>=0); return r?r[r.length-1]:''; };
const brs=c=>c.split('<br>').map(t=>{ t=t.trim(); const k=t.indexOf('：'); return k>0&&k<8?{sp:t.slice(0,k),text:t.slice(k+1)}:{sp:null,text:t}; });   /* 「誰：字」一行一行 */
const SP={爸爸:'dad',媽媽:'mom',宜蓁:'sister',以安:'heroine_01',Alison:'yu',芯慈:'classmate_xinci',阿哲:'zhe'};
/* ---------- 共用 ---------- */
const X=()=>typeof JPPREP!=='undefined'?JPPREP:null, L=()=>JPPREP_LINES;
const D=k=>STORY.dayOfKey(k), T=(d,h)=>d*24+h, AN='heroine_01', ev=id=>STORY_EVENTS.find(e=>e.id===id);
const setT=(k,h)=>{ const G=H.G, d=typeof k==='number'?k:D(k); G.day=d; G.hour=h; G.weekday=CALENDAR.dateOf(d).wd%7; E.hour=h; };
const jpG=(k,h,o)=>{ o=o||{}; const G=H.fresh('2028-02-20',h,'dorm',Object.assign({EXCHANGE_ROUTE:'JP',EXCH_RULE:1,X1_JP:D('2028-02-20')},o.flags||{})); setT(k,h); G.acts={att:{}}; G.outings=[]; G.visited={}; GM.npc={}; HOME.rec(G).at=true;
  H.FAMILIAR(AN); H.date(AN); if(o.repair) ROM.end(G,AN,'test'); for(const id of (o.know||[])) H.rel(id,10,0,0); for(const g of (o.groups||['noodle_team'])) PHONE.join(G,g,g); return G; };
const lawG=(k,h,o)=>{ o=o||{}; const G=H.fresh('2026-09-01',h,o.zone||'dorm',o.flags||{}); setT(k,h); G.outings=[]; if(o.home){ const R=HOME.rec(G); R.at=true; if(o.lbreak) R.lbreak=o.lbreak; } return G; };
const rules=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const tagged=tag=>(H.G.msgs||[]).filter(m=>m.tag===tag);
const pairs=tag=>tagged(tag).map(m=>(m.from||'-')+':'+m.text);
const optsOf=tag=>{ const m=tagged(tag).find(x=>x.ask); return m?m.ask.opts.map(o=>o.t):[]; };
const answer=(tag,k)=>{ const r=PHONE.answer(H.G,tag,k); return r?r.out.map(m=>(m.from||'-')+':'+m.text).slice(r.o.post===false?0:1):null; };
const said=()=>H.said.map(s=>s.t);
const stop=async(picks)=>{ const st=JP.dueStop(H.G,'home'); H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); if(st) await JP.playStop(GM,st,'home'); return st; };
const run=async(id,picks)=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); await EVENTS.run(ev(id)); return said(); };
const homeGrp=day=>(H.G.msgs||[]).filter(m=>m.th==='g:home'&&m.day===day);
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };

(async()=>{
  check('0. 讀稿（企劃線 AA_442 @d94d259ec）',DOC.indexOf('# AA_442')>=0&&S21.indexOf('2/21')>=0);
  check('0. 檔案載得到（src/data/jpprep_events.js、src/jpprep3d.js）；home3d.js 有 HOME.LIVE_GROUP',loaded&&!err&&!!X()&&typeof HOME.LIVE_GROUP==='function',err.split('\n')[0]);
  if(!X()||!DOC){ H.done(); return; }
  await sec(0,async()=>{
    const all=[]; const walk=v=>{ if(typeof v==='string') all.push(v); else if(Array.isArray(v)) v.forEach(walk); else if(v&&typeof v==='object') Object.values(v).forEach(walk); };
    walk(L()); const ids=/^(dad|mom|sister|heroine_01|yu|classmate_xinci|zhe|abroad|home|20\d\d-\d\d-\d\d)$/;
    const bad=all.filter(t=>!ids.test(t)&&DOC.indexOf(t)<0&&DOC466.indexOf(t)<0);   /* AA_466 第 1 節加的六則、第 4 則國外版在 AA_466 */
    check('0. JPPREP_LINES 的每一句都在 AA_442 或 AA_466（人物 id、日期、國外／在家的標記除外）',bad.length===0,bad.join('｜'));
    check('0. 事件進了 STORY_EVENTS；JP.SCH 多了這一包的列；JP.STOPS、PHONE_RULES 掛上',JPPREP_EVENTS.every(e=>STORY_EVENTS.includes(e))&&X().SCH.every(s=>JP.SCH.includes(s))&&JP.STOPS.length>0&&STORY.PHONE_RULES.length>0);
    const days=['2028-02-21',1,'2028-02-25',5,'2028-02-26',6,'2028-02-29',2,'2028-03-01',3,'2028-03-04',6,'2028-03-05',0,'2028-03-08',3,'2028-03-10',5,'2028-03-11',6,'2028-03-12',0,'2028-03-14',2,'2028-03-17',5,'2028-03-18',6,'2028-03-19',0,'2028-03-21',2,'2028-03-22',3,'2028-03-23',4];
    let wdOK=true; for(let i=0;i<days.length;i+=2) if(CALENDAR.dateOf(D(days[i])).wd%7!==days[i+1]) wdOK=false; check('0. 稿上的星期和遊戲的日曆一樣',wdOK);
  });

  /* ======================= 1 住家裡的週四家人群組 ======================= */
  await sec(1,async()=>{
    const HR=rows(S1).filter(r=>/^H\d$/.test(r[0])).map(r=>brs(r[1]).map(x=>SP[x.sp]+':'+x.text));
    check('1. 稿的 H1～H6（六則）和 HOME_GROUP 的前六則一樣（AA_466 加到十二則，tests/aa466_jp_unit.js）',HR.length===6&&J(L().HOME_GROUP.slice(0,6).map(g=>g.map(([w,t])=>w+':'+t)))===J(HR),J(HR).slice(0,200));
    let G=jpG('2028-02-24',20.05); rules(); const d=G.day, idx=0, M=homeGrp(d);   /* AA_466 第 1 節：照順序一輪用完才從頭，新的存檔從第 1 則開始（原本照 G.day/7）*/
    check('1. 日本路線出發前（住家裡，學期中）2/24（四）20:00：住家裡版 H'+(idx+1)+'；沒有「這週回來吃飯嗎」那一套、沒有選項',J(M.map(m=>m.from+':'+m.text))===J(HR[idx])&&M.every(m=>!m.ask&&m.tag==='home_live_'+d&&m.h>=20)&&!tagged('home_ask_'+d).length,J(M.map(m=>m.text)));
    check('1. 手機上的名字：爸爸／媽媽／姊姊',M.every(m=>m.name===({dad:'爸爸',mom:'媽媽',sister:'姊姊'})[m.from]));
    setT(d,22.5); rules(); check('1. 兩個小時以後爸爸不傳「？」',!homeGrp(d).some(m=>m.text==='？'));
    setT('2028-03-02',20.05); rules(); const d2=H.G.day; check('1. 下一週輪到下一則',J(homeGrp(d2).map(m=>m.from+':'+m.text))===J(HR[(idx+1)%6]));
    G=jpG('2028-03-23',20.05); rules(); const j23=Q(part('- 日本路線 3/23','## 2.')).map(x=>SP[x.sp]+':'+x.text);
    check('1. 日本路線 3/23（四）換成：爸爸「禮拜六的飛機？」、媽媽「早上」、爸爸「到了在群組說一聲」',J(homeGrp(G.day).map(m=>m.from+':'+m.text))===J(j23)&&j23.length===3,J(homeGrp(G.day).map(m=>m.text)));
    check('1. AA_443 第 3 節（範圍更正）：寒暑假維持不發；用到的是學期中卻住家裡',DOC443.indexOf('寒暑假維持現在（不發）')>=0&&DOC443.indexOf('學期中、人卻住家裡')>=0);
    G=lawG('2026-07-16',20.05,{home:true,lbreak:'Y1S'}); rules(); check('1. 法律系放假住家裡（breakMode，暑假）的週四：不發（AA_443 第 3 節：寒暑假維持現在）',HOME.breakMode(G)&&!homeGrp(G.day).length&&!(H.G.msgs||[]).some(m=>m.th==='g:home'));
    G=lawG('2026-01-29',20.05,{home:true,lbreak:'Y1W'}); rules(); check('1. 法律系放假住家裡（寒假）：不發',HOME.breakMode(G)&&!homeGrp(G.day).length);
    G=lawG('2026-07-16',20.05); rules(); check('1. 放假留宿舍：AA_532 第 4 節（企劃線 ade80d22f）起照常發，同學期中那一套（問「會回去／這週不回」；原本放假整段不發）',tagged('home_ask_'+G.day).length===1&&J(optsOf('home_ask_'+G.day))===J(['會回去','這週不回'])&&!tagged('home_live_'+G.day).length);
    G=lawG('2026-10-15',20.05); rules(); check('1. 學期中住宿舍：照舊問「會回去／這週不回」',tagged('home_ask_'+G.day).length===1&&J(optsOf('home_ask_'+G.day))===J(['會回去','這週不回'])&&!tagged('home_live_'+G.day).length);
    const pg=k=>{ const G=lawG(k,20.05,{home:true,flags:{MOVED_OUT:true}}); return G; };
    G=pg('2029-03-01'); rules(); const i4=0;   /* AA_466：新的存檔從第 1 則開始 */
    check('1. 學期中住家裡（pgHome，學期表還在算：延畢那種）2029-03-01（四）：住家裡版、沒有問句',HOME.pgHome(G)&&!!CALENDAR.termOf(G.day)&&J(homeGrp(G.day).map(m=>m.from+':'+m.text))===J(HR[i4])&&!tagged('home_ask_'+G.day).length);
    G=pg('2029-02-22'); rules(); check('1. 過年爸爸在家（2029 他待到元宵 2/26；2/22 是學期中）：不發，也不發問句版',HOME.pgHome(G)&&!!CALENDAR.termOf(G.day)&&!homeGrp(G.day).length&&!tagged('home_ask_'+G.day).length);
    G=pg('2029-03-01'); setT('2029-02-27',20.05); rules(); check('1. 學期中住家裡、不是週四：只加入家人群組（同原本），不發',PHONE.inGroup(G,'home')&&!(G.msgs||[]).some(m=>m.th==='g:home'));
    G=jpG('2028-08-10',20.05,{flags:{JP_DEPARTED:D('2028-03-25'),JP_RETURNED:D('2028-08-05')}}); rules(); check('1. 日本路線回來以後住家裡（8/5～9/3，暑假）的週四：AA_466 第 5 節改成照發住家裡版（原本 AA_443 第 3 節不發；tests/aa466_jp_unit.js 1-b）、沒有問句版',JP.homeOn(G)&&homeGrp(G.day).length>0&&homeGrp(G.day).every(m=>m.tag==='home_live_'+G.day&&!m.ask)&&!tagged('home_ask_'+G.day).length);
    G=lawG('2025-03-06',20.05,{home:true}); G.stage='econ'; G.flags.Y0_MOVED_OUT=true; rules(); check('1. 經濟系休學在家：照舊不發（那一年 STORY.mainDay 是負的，home3d.js 原本就整則不發；只換、不新增）',HOME.baseMode(G)&&!homeGrp(G.day).length);
  });

  /* ======================= 2 日本路線出發前 ======================= */
  await sec(2,async()=>{
    const want=(key,o)=>brs(cell(S21,key)).filter(x=>!(o&&o.skip&&o.skip.test(x.sp||''))).map(x=>x.text);
    /* 2/21 */
    let G=jpG('2028-02-21',7.9); const a0=JP.dueStop(G,'home'); setT('2028-02-21',8); let st=await stop();
    check('2-1 2/21（一）08:00 家裡：旁白、媽媽「你在家正好。…」、旁白（稿那一格）',!(a0&&a0.k==='jpp_0221')&&st&&st.k==='jpp_0221'&&J(said())===J(want('2/21'))&&H.said[1].who==='媽媽',J(said()));
    /* 2/25 系統 → 3/1 */
    G=jpG('2028-02-25',10.05); rules(); const c25=cell(S21,'2/25');
    check('2-1 2/25（五）10:00 手機（系統）：出國交換行前說明會：3/1（三）14:00，國際事務處。',J(tagged('jpp_0225_info').map(m=>m.th+':'+m.text))===J(['sys:'+c25])&&!!c25);
    rules(); const q=OUT.get(G,'jpp_0301'); check('2-1 3/1（三）14:00 國際事務處：一鍵的出遊（家裡的選單「出發」）',!!q&&q.day===D('2028-03-01')&&q.h===14&&q.ev==='ev_jpp_0301'&&q.state==='planned');
    const c01=brs(cell(S21,'3/1'));
    setT('2028-03-01',14); let Ls=await run('ev_jpp_0301'); check('2-1 3/1 交往中：兩句旁白＋（以安坐在你旁邊，每一頁都拍照。…）',J(Ls)===J([c01[0].text,c01[1].text,c01.find(x=>x.sp==='交往中').text]),J(Ls));
    G=jpG('2028-03-01',14,{repair:true}); Ls=await run('ev_jpp_0301'); check('2-1 3/1 挽回中：最後一句（以安坐在第一排。你坐在最後面。散會的時候，她先走了。）',J(Ls)===J([c01[0].text,c01[1].text,c01.find(x=>x.sp==='挽回中').text]),J(Ls));
    /* 2/26 */
    G=jpG('2028-02-26',11); st=await stop(); check('2-1 2/26（六）11:00 大賣場：旁白、媽媽「日本的藥很貴。」、旁白',st&&st.k==='jpp_0226'&&J(said())===J(want('2/26')),J(said()));
    /* 3/4 */
    G=jpG('2028-03-04',22.05); rules(); const c04=cell(S21,'3/4'), b04=brs(c04);
    check('2-1 3/4（六）22:00 宜蓁私訊：「你房間那箱書 我下個月回去拿」「你不在 我自己進去喔」＋「好。」「不要動我的桌子。」',J(tagged('jpp_0304').map(m=>m.text))===J([b04[0].text,b04[1].text])&&J(optsOf('jpp_0304'))===J(qs(c04)));
    let rep=answer('jpp_0304',0); check('2-1 「好。」→ 宜蓁（OK 的貼圖）',J(rep)===J(['sister:（OK 的貼圖）'])&&c04.indexOf('（OK 的貼圖）')>=0);
    G=jpG('2028-03-04',22.05); rules(); rep=answer('jpp_0304',1); check('2-1 「不要動我的桌子。」→ 宜蓁「我只動書」',J(rep)===J(['sister:我只動書']));
    /* 3/5 */
    G=jpG('2028-03-05',20.05,{know:['yu','classmate_xinci']}); rules(); const g05=brs(cell(S21,'3/5')).filter(x=>SP[x.sp]).map(x=>SP[x.sp]+':'+x.text);
    check('2-1 3/5（日）20:00 麵店團：Alison、芯慈、阿哲、以安（都認識）',J(pairs('jpp_0305'))===J(g05)&&g05.length===4,J(pairs('jpp_0305')));
    G=jpG('2028-03-05',20.05,{know:['yu']}); rules(); check('2-1 3/5 不認識芯慈：她那一句不出現（照 STORY.knows）',J(pairs('jpp_0305'))===J(g05.filter(p=>!/^classmate_xinci:/.test(p))));
    /* 3/8、3/10、3/12、3/14 */
    G=jpG('2028-03-08',14); st=await stop(); check('2-1 3/8（三）14:00 旁白一段：（簽證要的照片。…你就沒有笑。）',st&&st.k==='jpp_0308'&&J(said())===J(want('3/8')),J(said()));
    G=jpG('2028-03-10',10.05); rules(); check('2-1 3/10（五）10:00 手機（系統）：出國交換的學分抵免申請表，請於出發前交到系辦。',J(tagged('jpp_0310').map(m=>m.th+':'+m.text))===J(['sys:'+cell(S21,'3/10')]));
    G=jpG('2028-03-12',10); st=await stop(); check('2-1 3/12（日）10:00 家裡：媽媽「行李箱打開給我看。」、旁白（多了兩包暖暖包）',st&&st.k==='jpp_0312'&&J(said())===J(want('3/12')),J(said()));
    const c14=brs(cell(S21,'3/14'));
    G=jpG('2028-03-14',10); st=await stop(); check('2-1 3/14（二）10:00 日本台灣交流協會：旁白＋交往中多一句（以安的號碼在你後面三號。…）',st&&st.k==='jpp_0314'&&J(said())===J([c14[0].text,c14[1].text]),J(said()));
    G=jpG('2028-03-14',10,{repair:true}); st=await stop(); check('2-1 3/14 挽回中：只有第一句',J(said())===J([c14[0].text]));
    /* 3/17 */
    const c17=cell(S21,'3/17'), b17=brs(c17);
    const r17=[...c17.matchAll(/→ 助教：([^／]+)/g)].map(m=>m[1].trim());
    G=jpG('2028-03-17',11); st=await stop([0]); check('2-1 3/17（五）11:00 系辦：旁白、助教「必修抵不了喔。選修的可以。」→「好。」→「那就這樣，我收了。」',st&&st.k==='jpp_0317'&&J(said())===J([b17[0].text,b17[1].text,r17[0]])&&J(qs(c17))===J(['好。','那回來要補修？'])&&J(H.opts[0])===J(['「好。」','「那回來要補修？」'])&&H.said[1].who==='助教',J(said()));
    G=jpG('2028-03-17',11); await stop([1]); check('2-1 「那回來要補修？」→ 助教「大部分的人都延一學期。」',said()[2]===r17[1]&&r17.length===2);
    /* 3/18、3/19、3/21 */
    G=jpG('2028-03-18',15); st=await stop(); check('2-1 3/18（六）15:00 家裡：（你把書架上的書收進紙箱，…）',st&&st.k==='jpp_0318'&&J(said())===J(want('3/18')));
    G=jpG('2028-03-19',20.5); st=await stop(); check('2-1 3/19（日）20:30 家人群組視訊：旁白、爸爸、宜蓁、爸爸（稿那一格）',st&&st.k==='jpp_0319'&&J(said())===J(want('3/19'))&&J(H.said.slice(1).map(s=>s.who))===J(['爸爸','宜蓁','爸爸']),J(said()));
    const c21=cell(S21,'3/21');
    const r21=[...c21.matchAll(/→ 媽媽：([^→／]+)/g)].map(m=>m[1].trim()), n21=(c21.match(/→ 旁白：(（[^）]*）)/)||[])[1];
    G=jpG('2028-03-21',18.5); st=await stop([0]); check('2-1 3/21（二）18:30 晚餐：媽媽「禮拜六的飛機，幾點？」→「早上。」→「那我五點起來。」→（你說不用。她說她本來就五點起來。）',st&&st.k==='jpp_0321'&&J(said())===J([brs(c21)[0].text,r21[0],n21])&&J(H.opts[0])===J(qs(c21).map(t=>'「'+t+'」'))&&c21.indexOf(L().d0321.morning[1])>=0,J(said()));
    G=jpG('2028-03-21',18.5); await stop([1]); check('2-1 「妳不用送。」→「我沒有要送。我要煮早餐。」',said()[1]===r21[1]&&r21.length===2);
    /* 2-2 日文電話 */
    const ask=Q(part('- **2/25（五）21:00 以安私訊**','- 選項：'));
    G=jpG('2028-02-25',21.05); rules();
    check('2-2 2/25（五）21:00 以安私訊（交往中）：「出發前，平日晚上講十分鐘日文。」「電話。九點。連假完開始。」＋三個選項',J(tagged('jpp_0225_call').map(m=>m.text))===J(ask.map(x=>x.text))&&J(optsOf('jpp_0225_call'))===J(['好。','十分鐘夠嗎？','我自己練就好。']));
    for(const [k,r,v] of [[0,'好。',true],[1,'不夠再加。',true],[2,'好。',false]]){ G=jpG('2028-02-25',21.05); rules(); rep=answer('jpp_0225_call',k);
      check('2-2 回第 '+(k+1)+' 個 → 以安「'+r+'」，AN_JP_CALL='+v,J(rep)===J([AN+':'+r])&&G.flags.AN_JP_CALL===v&&part('- 選項：','- **有 `AN_JP_CALL`').indexOf('以安：'+r)>=0); }
    G=jpG('2028-02-25',21.05,{repair:true}); rules(); check('2-2 挽回中：沒有這一則',!tagged('jpp_0225_call').length);
    const CR=rows(S22).filter(r=>/^\d+\/\d+/.test(r[0])); let callOK=CR.length===9, info='';
    for(const r of CR){ const [m,dd]=r[0].replace(/（.*/,'').split('/').map(Number), key='2028-'+String(m).padStart(2,'0')+'-'+String(dd).padStart(2,'0');
      const narr=(r[1].match(/^（[^）]*(?:「[^」]*」[^）]*)*）/)||[''])[0], an=r[1].slice(narr.length).replace(/^以安：/,'');
      G=jpG(key,21,{flags:{AN_JP_CALL:true}}); for(const s of X().SCH) if(!/^jpp_call_/.test(s.k)) JP.rec(G).done[s.k]=1; const h0=G.hour; st=await stop(); const w=[narr].concat(an?[an]:[]);
      if(!(st&&/^jpp_call_/.test(st.k)&&J(said())===J(w)&&Math.abs(G.hour-h0-1/6)<1e-6)){ callOK=false; info=key+' '+J(said())+' vs '+J(w); break; } }
    check('2-2 九個晚上 21:00 的日文電話（稿那張表：一段旁白、最多一句以安；時間過 10 分鐘）',callOK,info);
    G=jpG('2028-03-07',21,{flags:{AN_JP_CALL:true}}); OUT.plan(G,{id:'x',ev:'ev_jpp_0301',day:G.day,h:21,title:'x'}); check('2-2 那天 21:00 排了別的（出遊）：那一晚跳過',!(JP.dueStop(G,'home')||{k:''}).k.startsWith('jpp_call'));
    G=jpG('2028-03-07',21,{flags:{AN_JP_CALL:false}}); check('2-2 回「我自己練就好。」：沒有電話',!(JP.dueStop(G,'home')||{k:''}).k.startsWith('jpp_call'));
    G=jpG('2028-03-18',21.05); rules(); const bagQ=Q(part('- **3/18（六）21:00 以安私訊**','### 2-3.')), bagL=part('- **3/18（六）21:00 以安私訊**','### 2-3.');
    check('2-2 3/18（六）21:00 以安（交往中，不論有沒有打電話）：（照片：攤開的行李箱，…）「好了。你的呢？」＋「還沒。」「好了。」',J(tagged('jpp_0318_bag').map(m=>m.text))===J(bagQ.map(x=>x.text))&&J(optsOf('jpp_0318_bag'))===J(['還沒。','好了。']));
    rep=answer('jpp_0318_bag',1); check('2-2 「好了。」→「照片。」→（你拍了一張傳過去。）→「……充電器呢？」',J(rep)===J([AN+':照片。','-:（你拍了一張傳過去。）',AN+':……充電器呢？'])&&bagL.indexOf('（你拍了一張傳過去。）')>=0);
    G=jpG('2028-03-18',21.05); rules(); rep=answer('jpp_0318_bag',0); check('2-2 「還沒。」→「明天收。收完拍給我。」',J(rep)===J([AN+':明天收。收完拍給我。']));
    G=jpG('2028-03-18',21.05,{repair:true}); rules(); check('2-2 挽回中：沒有行李箱的照片',!tagged('jpp_0318_bag').length);
    /* 2-3 */
    const r11=Q(part('- 挽回中的 3/11','- 下面五天'))[0];
    G=jpG('2028-03-11',14,{repair:true}); st=await stop(); check('2-3 挽回中 3/11（六）14:00：（你一個人去公館買行李箱。…你買了第二便宜的。）',st&&st.k==='jpp_0311'&&J(said())===J([r11.text]),J(said()));
    G=jpG('2028-03-11',14); st=JP.dueStop(G,'home'); check('2-3 交往中 3/11：沒有（那天是和她去買）',!st||st.k!=='jpp_0311');
    const MR=rows(S23).filter(r=>/^\d+\/\d+/.test(r[0])); let amOK=MR.length===5;
    for(const r of MR){ const [m,dd]=r[0].replace(/（.*/,'').split('/').map(Number), key='2028-'+String(m).padStart(2,'0')+'-'+String(dd).padStart(2,'0');
      for(const o of [{repair:true},{flags:{AN_JP_CALL:false}},{}]){ G=jpG(key,10,o); st=await stop(); if(!(st&&/^jpp_am_/.test(st.k)&&J(said())===J([r[1]]))) amOK=false; } }
    check('2-3 沒有電話的（挽回中、交往中沒打電話）：2/29、3/3、3/7、3/15、3/22 早上 10:00 一句（稿那張表）',amOK);
    G=jpG('2028-03-15',10,{flags:{AN_JP_CALL:true}}); st=JP.dueStop(G,'home'); check('2-3 有打電話的：早上那一句不出',!st||!/^jpp_am_/.test(st.k));
    /* 快轉停點 */
    const hmT=x=>CALENDAR.dateOf(Math.floor(x/24)).key.slice(5)+' '+(x%24);
    const walk=G=>{ const out=[]; let t=T(G.day,G.hour); for(let i=0;i<80;i++){ const nx=JP.nextStop(G,t,'home'); if(nx==null||nx>=T(D('2028-03-25'),0)) break; out.push(hmT(nx)); t=nx; } return out; };
    G=jpG('2028-02-20',18,{flags:{AN_JP_CALL:true}}); const S1=walk(G);
    const need=['02-21 8','02-25 10','02-25 21','02-26 11','02-29 21','03-04 22','03-05 20','03-08 14','03-10 10','03-12 10','03-14 10','03-17 11','03-18 15','03-18 21','03-19 20.5','03-21 18.5','03-22 21'];
    check('2. 快轉（住臺北的家）會停在每一件（JP.nextStop）：場景、電話、手機訊息',need.every(x=>S1.includes(x)),J(need.filter(x=>!S1.includes(x))));
    setT('2028-02-25',10.05); rules(); rules(); const S2=walk(G);
    check('2. 2/25 的通知送到以後：3/1 的出遊也停（出發前 45 分鐘＝13:15）；送到的那一則不再停',S2.includes('03-01 13.25')&&!S2.includes('02-25 10'),J(S2));
    G=jpG('2028-02-20',18,{repair:true}); const S3=walk(G); check('2. 挽回中：3/11 14:00、五個早上 10:00 也停',['03-11 14','02-29 10','03-03 10','03-07 10','03-15 10','03-22 10'].every(x=>S3.includes(x))&&!S3.includes('02-29 21'),J(S3));
    /* 不是日本路線、出發了 */
    G=jpG('2028-02-25',21.05,{flags:{EXCHANGE_ROUTE:'TW'}}); rules(); check('2. 不是日本路線：手機、場景都沒有',!tagged('jpp_0225_info').length&&!tagged('jpp_0225_call').length&&!JP.homeOn(G));
    G=jpG('2028-03-22',21,{flags:{AN_JP_CALL:true,JP_DEPARTED:D('2028-03-22')}}); check('2. 出發了：不演',!(JP.dueStop(G,'home')||{k:''}).k.startsWith('jpp_'));
  });
  H.done();
})();
