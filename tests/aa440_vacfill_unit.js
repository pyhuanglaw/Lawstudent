// AA_440（企劃線修訂版 edae49ca6，AA-B 2026-10-24 07:2x；原稿 718c06a30；回 BB_303）寒暑假的空白日＋AA_443 第 2 節（企劃線 f93fa3eda，摘要池加寫）：src/data/vacfill_events.js、src/vacfill3d.js。
//   不需要瀏覽器。台詞逐字從稿讀出來比對（git show edae49ca6:…、f93fa3eda:…）。
//   0 讀稿、每一句都在 AA_440（摘要池加寫的在 AA_443）、檔案載得到、掛勾都掛上
//   1 經濟系那年暑假（2025，休學住家裡；8/13 放榜以前不出現「錄取／考上／餞行」）：7/13 對發票、7/16 經濟系群組（7/19 聚餐；E35 南下高雄＝「這週末不在臺北。」）、
//     7/19 姊姊（E35 sleep＝15:30；南下＝7/26「成績出來了？」）、7/22 可昕視訊／姊姊私訊（南下不發）、7/27 10:00 醒來→去學校走一走（校門、霖澤館）、8/4 群組等放榜、
//     8/8 父親節視訊、8/10 可昕視訊／沒交往＝摘要池、8/13 家人群組＋8/16 錄取通知、8/17 群組→8/18 熱炒店餞行
//   2 大二暑假：6/18 群組、6/23 語彤（麵店一鍵）、7/24 以安（台中的第一個週六）、7/28 學姊（7/29 法圖；交往中多「我去找妳。」）、7/31 子晴（8/1 Café）
//   3 大三寒假：2/4 麵店開工、2/8 元宵（阿哲在不在臺北、語彤顧店、不去的照片）、2/12 學姊（2/14 法圖；交往中不發）、2/19 摘要（醒來、快轉日期卡；修訂前是 2/16）
//   4 其他假期：大一寒假 1/23 年貨（住家裡當面／留宿舍私訊）、1/27 家人群組；大一暑假 6/24 阿凱、8/3 語彤、8/5 以安、8/28 姊姊；大二寒假 1/14、1/22；
//     大三寒假 1/6 子晴（1/8 參創）、1/15 學姊；大四寒假 1/11、1/20 以安（之後一週在總圖三樓）、1/27
//   5 摘要池（AA_440 第 5 節＋AA_443 第 2 節：住家裡寒假 14、暑假 16；留宿舍寒假 12、暑假 20）：醒來（家裡的床／宿舍的床）、沒有任何一件的日子才放、照順序、一個假期內用完從頭；有事的日子、快轉停下來的那一天不放
// 修改前（開發分支 HEAD：舊稿 718c06a30 的版本）：修訂的句子、日子、23 個事件、摘要池加寫都對不上——FAIL。用法：node tests/aa440_vacfill_unit.js
// （2026-10-28 AA_519 1-3（企劃線 d75cd0228，NPC-STORY2-1028）：送小菜第七處＝大二寒假 1/16 麵店長桌那一句拆成兩句——前半「（長桌只坐了一半。）」照舊，
//   後半換成 AA_519 的第 6 句「（阿姨沒說話，在你盤子裡多放了一塊叉燒。）」（「人少，吃多一點。」拿掉）。第 0 項、第 4 項 1/16 照這個比：前半要是稿上那一句的開頭、新句要在 AA_519 裡）
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
const load=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); return true; };
let err='', loaded=false;
try{ load('src/holff3d.js'); loaded=load('src/data/vacfill_events.js')&&load('src/vacfill3d.js'); }catch(e){ err=String(e&&e.stack||e); }
/* ---------- 稿 ---------- */
const SHA='fd200c2c6', P440='docs/story_planning/AA_440_寒暑假的空白日_最空三段_住家裡_留宿舍.md';
const DOC0=(()=>{ try{ return cp.execSync('git -c core.quotepath=false show '+SHA+':"'+P440+'"',{cwd:process.env.SPEC_GIT_DIR||H.ROOT,encoding:'utf8',maxBuffer:1<<26,stdio:['ignore','pipe','ignore']}); }catch(e){ return ''; } })();
/* 以安改稿①b（AA_592 第 11、12、13、50 列，企劃線 4162d22e1）改了這份稿上她的四句：讀稿時照改成欄換（每一處都要剛好找到一次；逐列核對在 tests/aa592_an_1b_unit.js）*/
const AN592=[['> 以安：……你呢？','> 以安：你呢？'],['「……嗯。」「我要讀書了。十點半再傳。」','「我在看書。」「……看不太下去了。」'],['「我說是一起讀書的人。……她說好。」','「我說是男朋友。……她說好。」']];
const AN592_BAD=AN592.filter(([o])=>DOC0.split(o).length!==2).map(x=>x[0]);
const DOC=AN592.reduce((d,[o,n])=>d.split(o).join(n),DOC0);
const part=(a,b)=>{ const i=DOC.indexOf(a); if(i<0) return ''; const j=b?DOC.indexOf(b,i+a.length):-1; return DOC.slice(i,j<0?DOC.length:j); };
const Q=s=>s.split('\n').map(l=>/^\s*>\s*(.+?)\s*$/.exec(l)).filter(Boolean).map(m=>m[1]).map(t=>{ const k=t.indexOf('：'); return k>0&&k<8?{sp:t.slice(0,k),text:t.slice(k+1)}:{sp:null,text:t}; });
const rows=s=>s.split('\n').map(l=>l.trim()).filter(l=>/^\|/.test(l)&&!/^\|[-| :]+\|\s*$/.test(l)).map(l=>l.replace(/^\||\|$/g,'').split('|').map(c=>c.trim()));
const qs=s=>{ const out=[]; const re=/「([^「」]*(?:「[^「」]*」[^「」]*)*)」/g; let m; while((m=re.exec(s))) out.push(m[1]); return out; };   /* 一格裡「」包起來的字（照順序）*/
const nar=s=>(String(s).match(/（[^（）]*(?:「[^」]*」[^（）]*)*）/g)||[]);
const inDoc=L=>L.filter(t=>DOC.indexOf(t)<0);
const SP={品妤:'econ_pinyu',唐睿:'econ_tangrui',阿勳:'econ_zhengxun',韋綸:'econ_weilun',阿哲:'zhe',Alison:'yu',柏翰:'classmate_bohan',語彤:'heroine_03',以安:'heroine_01',可昕:'kexin',子晴:'heroine_04',溫學姊:'heroine_05',媽媽:'mom',爸爸:'dad',宜蓁:'sister'};
const S11=part('### 1-1.','### 1-2.'), S12=part('### 1-2.','### 1-3.'), S13=part('### 1-3.','- 那一晚'), S13S=part('- **`E35_PLAN` 是 sea 或 shop 的**（7/19～7/23 在高雄）：7/19 不演','### 1-4.'), S14=part('### 1-4.','### 1-5.'), S15=part('### 1-5.','### 1-5b.'), S15B=part('### 1-5b.','### 1-6.'), S16=part('### 1-6.','### 1-7.'), S17=part('### 1-7.','### 1-8.'), S18=part('### 1-8.','### 1-9.'), S19=part('### 1-9.','### 1-10.'), S110=part('### 1-10.','## 2.');
const S21=part('### 2-1.','### 2-2.'), S22=part('### 2-2.','### 2-3.'), S23=part('### 2-3.','### 2-4.'), S24=part('### 2-4.','### 2-5.'), S25=part('### 2-5.','## 3.');
/* AA_507 0-2 第 2、4 點（企劃線 e4fbd0192，AA-C 10-28）改了這份稿的兩格：3-3 的 2/12 第一句和 2/14 旁白、第 4 節 1/15 學姊那一列（兩句、選項、回覆）。
   只在那兩格裡把稿上的舊句換成新句再比；新句要在 AA_507 裡（check 0、3-3、4）*/
const P507='docs/story_planning/AA_507_女主角自己的生活_大三上與寒假.md';
const DOC507=(()=>{ try{ return cp.execSync('git -c core.quotepath=false show e4fbd0192:"'+P507+'"',{cwd:process.env.SPEC_GIT_DIR||H.ROOT,encoding:'utf8',maxBuffer:1<<26,stdio:['ignore','pipe','ignore']}); }catch(e){ return ''; } })();
const FIX507_33=[['法圖寒假下週一開。','法圖下週一恢復晚上開館。'],['（開館第一天，','（恢復晚上開館的第一天，']];
const FIX507_0115=[['美國那邊的申請，我送出去了。','美國那邊的面試，排在下禮拜。'],['八月去的那一梯。','線上的。八月去的那一梯。'],['還沒上。……上了再恭喜。','嗯。……上了再跟你說。'],['恭喜。','加油。']];   /* 長的先換（「恭喜。」也在回覆那句裡）*/
const fx=(t,F)=>F.reduce((x,[a,b])=>x.split(a).join(b),t);
/* AA_519 1-3（企劃線 d75cd0228）：1/16 麵店長桌那一句（送小菜第七處）拆成兩句 */
const P519='docs/story_planning/AA_519_配角第二批_麵店阿姨_陳助教_Café_黃筱涵_阿凱.md';
const DOC519=(()=>{ try{ return cp.execSync('git -c core.quotepath=false show d75cd0228:"'+P519+'"',{cwd:process.env.SPEC_GIT_DIR||H.ROOT,encoding:'utf8',maxBuffer:1<<26,stdio:['ignore','pipe','ignore']}); }catch(e){ return ''; } })();
const OLD0114='（長桌只坐了一半。阿姨多送了一盤小菜：「人少，吃多一點。」）', NEW0114=['（長桌只坐了一半。）','（阿姨沒說話，在你盤子裡多放了一塊叉燒。）'];
const ok519=t=>(t===NEW0114[0]&&DOC.indexOf(OLD0114)>=0&&OLD0114.indexOf(t.slice(0,-1))===0)||(t===NEW0114[1]&&DOC519.indexOf('6. '+t)>=0);
const NEW507=FIX507_33.concat(FIX507_0115).map(x=>x[1]);
const back507=t=>FIX507_33.concat(FIX507_0115).reduce((x,[a,b])=>x.split(b).join(a),t);   /* 新句換回舊句：舊句要在 AA_440 */
const S31=part('### 3-1.','### 3-2.'), S32=part('### 3-2.','### 3-3.'), S33=fx(part('### 3-3.','### 3-4.'),FIX507_33), S34=part('### 3-4.','## 4.'), S4=part('## 4.','## 5.'), S5=part('## 5.','## 6.');
const row4=k=>{ const r=(rows(S4).find(r=>r.some(c=>c.indexOf(k)>=0))||[]).join('|'); return k==='1/15（六）'?fx(r,FIX507_0115):r; };
const poolOf=(a,b)=>{ const s=part(a,b); return s.split('\n').map(l=>/^\s*\d+\.\s*(（.*）)\s*$/.exec(l)).filter(Boolean).map(m=>m[1]); };
/* AA_443 第 2 節（企劃線 f93fa3eda）：摘要池加寫，接在 AA_440 5-1、5-2 各池最後面 */
const P443='docs/story_planning/AA_443_多媒體中心看的字_摘要池加寫_週四家人群組範圍.md';
const DOC443=(()=>{ try{ return cp.execSync('git -c core.quotepath=false show 540e1d3fb:"'+P443+'"',{cwd:process.env.SPEC_GIT_DIR||H.ROOT,encoding:'utf8',maxBuffer:1<<26,stdio:['ignore','pipe','ignore']}); }catch(e){ return ''; } })();
const poolOf3=(a,b)=>{ const i=DOC443.indexOf(a); if(i<0) return []; const j=DOC443.indexOf(b,i+a.length); return DOC443.slice(i,j<0?DOC443.length:j).split('\n').map(l=>/^\s*\d+\.\s*(（.*）)\s*$/.exec(l)).filter(Boolean).map(m=>m[1]); };
const POOL440={home:{winter:poolOf('### 5-1.','- 暑假：'),summer:poolOf('### 5-1.','### 5-2.').slice(8)},dorm:{winter:poolOf('### 5-2.','- 暑假：'),summer:poolOf('### 5-2.','## 6.').slice(6)}};
const POOL443={home:{winter:poolOf3('### 2-1.','- 暑假（9～16）'),summer:poolOf3('- 暑假（9～16）','### 2-2.')},dorm:{winter:poolOf3('### 2-2.','- 暑假（7～20）'),summer:poolOf3('- 暑假（7～20）','- 沒有寫到過年')}};
const POOL={home:{winter:POOL440.home.winter.concat(POOL443.home.winter),summer:POOL440.home.summer.concat(POOL443.home.summer)},dorm:{winter:POOL440.dorm.winter.concat(POOL443.dorm.winter),summer:POOL440.dorm.summer.concat(POOL443.dorm.summer)}};
/* ---------- 共用 ---------- */
const X=()=>typeof VACFILL!=='undefined'?VACFILL:null, L=()=>VACFILL_LINES;
const D=k=>STORY.dayOfKey(k), ev=id=>STORY_EVENTS.find(e=>e.id===id);
const NG='g:noodle_team', EG='g:econ_friends', AN='heroine_01', YT='heroine_03', ZQ='heroine_04', SIS='heroine_05';
GM.toast=()=>{};
const setT=(k,h)=>{ const G=H.G, d=typeof k==='number'?k:D(k); G.day=d; G.hour=h; G.weekday=CALENDAR.dateOf(d).wd%7; E.hour=h; };
const lawG=(k,h,o)=>{ o=o||{}; const G=H.fresh('2026-09-01',h,o.zone||'dorm',o.flags||{}); setT(k,h); G.outings=[]; G.contacts=G.contacts||{}; G.vacfill=undefined;
  for(const id of (o.fam||[])) H.FAMILIAR(id); for(const id of (o.know||[])) H.rel(id,10,0,0); for(const g of (o.groups||['noodle_team'])) PHONE.join(G,g,g);
  for(const id of (o.date||[])){ H.CLOSE(id); ROM.start(G,id); } if(o.home) G.home={at:true}; return G; };
// CANON-NO-ECON-1112：經濟系那一年拿掉（econG 經濟系那年暑假的假存檔）
const rules=()=>{ X().phone(H.G); PHONE.tick(H.G); };
const msgs=th=>(H.G.msgs||[]).filter(m=>m.th===th);
const tagged=tag=>(H.G.msgs||[]).filter(m=>m.tag===tag);
const pairs=tag=>tagged(tag).map(m=>(m.from||'-')+':'+m.text);
const qPairs=list=>list.map(x=>(x.sp&&SP[x.sp]||'-')+':'+x.text);
const optsOf=tag=>{ const m=tagged(tag).find(x=>x.ask); return m?m.ask.opts.map(o=>o.t):[]; };
const answer=(tag,k)=>{ const r=PHONE.answer(H.G,tag,k); return r?r.out.map(m=>(m.from||'-')+':'+m.text).slice(r.o.post===false?0:1):null; };
const run=async(id,picks)=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); await EVENTS.run(ev(id)); return H.said.map(s=>s.t); };
const out=id=>OUT.get(H.G,id);
const isAt=(q,k,h)=>!!q&&q.day===D(k)&&q.h===h&&q.state==='planned';
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const stopsAt=(G,k)=>{ const d=D(k); const nx=HOME.breakNext(G,d*24-1e-3); return nx; };
const stopList=G=>X().stops(G,-1e9)||[];
const hmT=t=>CALENDAR.dateOf(Math.floor(t/24)).key+' '+(t%24);
const wake=async(G)=>{ CLS.rec(G); const T0=CALENDAR.TERMS; for(const t of T0) CLS.rec(G).grades[t.id]=CLS.rec(G).grades[t.id]||{}; H.said=[]; await CLS.morning(GM); return H.said.map(s=>s.t); };

/* AA_532 第 7 節（企劃線 ade80d22f）：總圖兩句換字（不改開館時間）——和 AA_440 的原句比的時候換回原句；新句在 tests/aa532_vac_unit.js 對 AA_532 */
const AA532={'在總圖。暑假人很少。':'在總圖。暑假開到五點。','（寒假的總圖人很少。你五點出來的時候，天已經黑了。）':'（總圖寒假開到五點。你五點出來的時候，天已經黑了。）'};
const b532=t=>typeof t==='string'&&AA532[t]?AA532[t]:t;
/* AA_533 第 4 節（企劃線 cf0066ed2）：三場一鍵出遊後面加的人說話（新句在 tests/aa533_vac_unit.js 對 AA_533）*/
const AA533={y2w_0116:['（語彤倒茶過來，順手把你的杯墊擺正。）','寒假人少。蘇姨泡得比較慢。','慢沒關係！我餓到可以等！'],y3w_0108:['這台是我學長做的。他去年也在這裡排隊，排到最後一個。','……明年我也要有一台。'],
  y3_0214:['開學前來借的人，通常是要補上學期的。','……你是哪一種？','（把一本書從書架抽出來，放在你手上）這本。']};
const b532all=v=>typeof v==='string'?b532(v):Array.isArray(v)?v.map(b532all):(v&&typeof v==='object')?Object.fromEntries(Object.entries(v).map(([k,x])=>[k,b532all(x)])):v;
(async()=>{
  /* ======================= 0 ======================= */
  check('0. 讀稿（企劃線 AA_440 修訂版 @edae49ca6）',DOC.indexOf('# AA_440')>=0&&DOC.indexOf('## 5. 摘要池')>=0&&DOC.indexOf('### 1-10.')>=0);
  check('0. 檔案載得到（src/data/vacfill_events.js、src/vacfill3d.js）',loaded&&!err&&!!X(),err.split('\n')[0]);
  if(!X()||!DOC){ H.done(); return; }
  await sec(0,async()=>{
    const all=[]; const walk=v=>{ if(typeof v==='string') all.push(v); else if(Array.isArray(v)) v.forEach(walk); else if(v&&typeof v==='object') Object.values(v).forEach(walk); };
    walk(L()); const ids=/^(econ_[a-z]+|zhe|yu|classmate_bohan|heroine_0\d|kexin|kai|mom|dad|sister)$/;
    const bad=all.map(b532).filter(t=>!ids.test(t)&&DOC.indexOf(t)<0&&!POOL443.home.winter.concat(POOL443.home.summer,POOL443.dorm.winter,POOL443.dorm.summer).includes(t)&&!(DOC507&&NEW507.some(n=>t.indexOf(n)>=0&&DOC507.indexOf(n)>=0)&&DOC.indexOf(back507(t))>=0)&&!ok519(t));
    check('0. AA_592 第 11～13、50 列：AA_440 稿上那四句都找得到（剛好一次），讀稿時換成改成欄',!AN592_BAD.length,JSON.stringify(AN592_BAD));
    check('0. VACFILL_LINES 的每一句都在 AA_440（摘要池加寫的在 AA_443 第 2 節；人物 id 除外；1/16 那一句照 AA_519 1-3 拆兩句）',bad.length===0,bad.join('｜'));
    check('0. 稿沒有寫字的兩則照片（VACFILL_UI）：括號裡的字取自稿',['上海下大雨','燈'].every(t=>DOC.indexOf(t)>=0)&&VACFILL_UI.photoTyphoon==='📷（上海下大雨）'&&VACFILL_UI.photoLantern==='📷（燈）');
    check('0. 摘要池：AA_440 住家裡寒假 8、暑假 8；留宿舍各 6',POOL440.home.winter.length===8&&POOL440.home.summer.length===8&&POOL440.dorm.winter.length===6&&POOL440.dorm.summer.length===6);
    check('0. 摘要池加寫（AA_443 第 2 節）：住家裡寒假 +6、暑假 +8；留宿舍寒假 +6、暑假 +14',DOC443.indexOf('## 2. 寒暑假摘要池加寫')>=0&&POOL443.home.winter.length===6&&POOL443.home.summer.length===8&&POOL443.dorm.winter.length===6&&POOL443.dorm.summer.length===14);
    check('0. 摘要池＝AA_440 的接 AA_443 的（住家裡寒假 14、暑假 16；留宿舍寒假 12、暑假 20），和稿一樣、照順序',J(b532all(L().POOL))===J(POOL)&&L().POOL.home.winter.length===14&&L().POOL.home.summer.length===16&&L().POOL.dorm.winter.length===12&&L().POOL.dorm.summer.length===20,J(L().POOL).slice(0,200));
    const src=fs.readFileSync(path.join(H.ROOT,'src/data/vacfill_events.js'),'utf8');
    check('0. 沒有「小語」（改名 Alison，AA_380）',src.indexOf('小語')<0);
    check('0. 事件進了 STORY_EVENTS（24 個 ev_vf_*；1-5b 7/31 加一個；AA_556 再加 4 個＝28，tests/aa556_vacgap2_unit.js）',VACFILL_EVENTS.length===14   /* CANON-NO-ECON-1112：第 1 節經濟系那年暑假 14 個拿掉（原本 28）*/ &&VACFILL_EVENTS.every(e=>STORY_EVENTS.includes(e)));
    // CANON-NO-ECON-1112：經濟系那一年拿掉（日誌不留事件 id 那一項用的是 ev_vf_y0_0713、ev_vf_y0_0727_gate）
    check('0. 掛勾：PHONE_RULES、TICKS、HOME.STOPS、HOME.CARD_LINES；CLS.morning、HOME.ffMenu、ECONFF.tick2 外面包一層',!!CLS.morning._vacfill&&!!HOME.ffMenu._vacfill&&HOME.STOPS.length>0&&HOME.CARD_LINES.length>0&&STORY.PHONE_RULES.length>0&&STORY.TICKS.length>0);
  });

  // CANON-NO-ECON-1112：經濟系那一年拿掉（第 1 節 經濟系那年暑假 1-1～1-10）

  /* ======================= 2 大二暑假 ======================= */
  await sec(2,async()=>{
    let G=lawG('2027-06-18',21.05); rules(); const q21=Q(S21);
    check('2-1. 6/18（五）21:00 桌遊團：阿哲、Alison、柏翰、阿哲（稿 2-1 引文）＋「在家。」「在宿舍。」「在總圖。」',J(pairs('vf_y2_0618').map(p=>{ const i=p.indexOf(':'); return p.slice(0,i+1)+b532(p.slice(i+1)); }))===J(qPairs(q21))&&J(optsOf('vf_y2_0618'))===J(['在家。','在宿舍。','在總圖。']),J(pairs('vf_y2_0618')));
    let rep=answer('vf_y2_0618',2); check('2-1. 「在總圖。」→ 柏翰「三樓。我在窗邊。」',J(rep)===J(['classmate_bohan:三樓。我在窗邊。']),J(rep));
    G=lawG('2027-06-18',21.05); rules(); rep=answer('vf_y2_0618',0); check('2-1. 「在家。」→ 阿哲「好喔」',J(rep)===J(['zhe:好喔']));
    G=lawG('2027-06-18',21.05,{groups:[]}); rules(); check('2-1. 不在桌遊團：沒有',!tagged('vf_y2_0618').length);
    G=lawG('2027-06-23',15.05,{fam:[YT]}); rules(); const t23=qs(part('- **6/23','## 2-2')||part('- **6/23','### 2-2.'));
    check('2-1. 6/23（三）15:00 語彤（在臺北、FAMILIAR 以上）：「燒臘店暑假開始送冰的酸梅湯了。」「蘇姨說你上次喝很快。」＋「我去吃。」「下次。」',J(tagged('vf_y2_0623').map(m=>m.text))===J(t23.slice(0,2))&&J(optsOf('vf_y2_0623'))===J(['我去喝。',t23[3]])   /* AA_630 Z-158：選項「我去吃。」→「我去喝。」*/,J(t23));
    answer('vf_y2_0623',0); rules(); const q=out('vf_y2_0623'); check('2-1. 「我去吃。」＝當天 18:00 一鍵到麵店（照麵店一般的吃飯）',isAt(q,'2027-06-23',18)&&q.goto&&q.goto.zone==='noodle',J(q));
    G=lawG('2027-06-23',15.05,{fam:[YT]}); rules(); rep=answer('vf_y2_0623',1); check('2-1. 「下次。」→「嗯。」',J(rep)===J([YT+':'+t23[4]]),J(rep));
    G=lawG('2027-06-23',15.05,{know:[YT]}); rules(); check('2-1. 和語彤只是認識：沒有',!tagged('vf_y2_0623').length);
    /* 2-2 */
    G=lawG('2027-07-24',21.55,{date:[AN]}); rules(); const q22=Q(S22), r22=rows(S22).slice(1);
    check('2-2. 7/24（六）21:30 和以安交往中（她在台中家的第一個週六＝7/24）：三則（稿 2-2 引文）＋「在家，也在讀書。」「在想妳。」',X().anTcSat(G)===D('2027-07-24')&&J(pairs('vf_y2_0724'))===J(qPairs(q22))&&J(optsOf('vf_y2_0724'))===J(r22.map(r=>qs(r[0])[0])),J(pairs('vf_y2_0724')));
    rep=answer('vf_y2_0724',0); const w22a=r22[0][1];
    check('2-2. 「在家，也在讀書。」→「讀哪一科？」→（你說了。）→「好。我也讀那一科。明天對進度。」（旁白是對話串裡的一行）',J(rep)===J([AN+':'+qs(w22a)[0],'-:'+nar(w22a)[0],AN+':'+qs(w22a)[1]])&&msgs('p:'+AN).some(m=>m.text==='（你說了。）'&&m.who===null&&!m.from),J(rep));
    G=lawG('2027-07-24',21.55,{date:[AN]}); rules(); rep=answer('vf_y2_0724',1); rules(); const before=tagged('vf_y2_0724_photo').length; setT('2027-07-24',22.55); rules(); const w22b=r22[1][1];
    check('2-2. 「在想妳。」→「……嗯。」「……看不太下去了。」；22:30（十點半她傳了一張課本的照片，旁邊空白處畫了一個小小的箭頭。）',J(rep)===J(qs(w22b).map(t=>AN+':'+t))&&before===0&&J(tagged('vf_y2_0724_photo').map(m=>m.text))===J(nar(w22b))&&tagged('vf_y2_0724_photo')[0].h>=22.5&&tagged('vf_y2_0724_photo')[0].h<22.6,J(rep));
    G=lawG('2027-07-24',21.55,{fam:[AN]}); rules(); check('2-2. 沒交往：沒有',!tagged('vf_y2_0724').length);
    /* 2-3 */
    G=lawG('2027-07-28',16.05,{fam:[SIS]}); rules(); const q23=Q(S23);
    check('2-3. 7/28（三）16:00 學姊（在臺北、FAMILIAR 以上）：「法圖暑假開到五點。」「冷氣很強，要帶外套。」＋「我明天去。」「謝謝學姊。」',J(pairs('vf_y2_0728'))===J(qPairs(q23))&&J(optsOf('vf_y2_0728'))===J(['我明天去。','謝謝學姊。']),J(pairs('vf_y2_0728')));
    answer('vf_y2_0728',0); rules(); check('2-3. 「我明天去。」＝7/29（四）14:00 法圖一鍵',isAt(out('vf_y2_0729'),'2027-07-29',14)&&out('vf_y2_0729').ev==='ev_vf_y2_0729');
    const l23=part('- 回「我明天去。」','- 朋友以上'), n23=nar(l23), want23=[n23[0].replace(/^（旁白：/,'')].concat([]);
    let Ls=await run('ev_vf_y2_0729');
    check('2-3. 法圖：（暑假的法圖只有三個人。…一件外套。）、溫學姊「坐。……外套你沒帶。」、她把自己的推過來一半。',J(Ls)===J([L().y2_0728.narr,qs(l23).find(t=>t.indexOf('坐。')===0),'她把自己的推過來一半。'])&&l23.indexOf(L().y2_0728.narr)>=0&&l23.indexOf('她把自己的推過來一半。')>=0&&H.said[1].who===SOCIAL.npcName(SIS),J(Ls));
    G=lawG('2027-07-28',16.05,{fam:[SIS]}); rules(); rep=answer('vf_y2_0728',1); check('2-3. 「謝謝學姊。」→「嗯。」',J(rep)===J([SIS+':嗯。'])&&(rules(),!out('vf_y2_0729')));
    G=lawG('2027-07-28',16.05,{date:[SIS]}); rules(); check('2-3. 和學姊交往中：多一個「我去找妳。」',J(optsOf('vf_y2_0728'))===J(['我明天去。','謝謝學姊。','我去找妳。']));
    answer('vf_y2_0728',2); rules(); Ls=await run('ev_vf_y2_0729'); const two=qs(part('- 和學姊交往中的（她碩一','## 2-4')||part('- 和學姊交往中的（她碩一','### 2-4.')).pop();
    check('2-3. 「我去找妳。」＝同一場，最後一句換成溫學姊「……下次我帶兩件。」',isAt(out('vf_y2_0729'),'2027-07-29',14)&&Ls[Ls.length-1]===two&&Ls.indexOf('她把自己的推過來一半。')<0,J(Ls));
    G=lawG('2027-07-28',16.05,{know:[SIS]}); rules(); check('2-3. 和學姊只是認識：沒有',!tagged('vf_y2_0728').length);
    /* 2-4 */
    G=lawG('2027-07-31',20.05,{fam:[ZQ]}); rules(); const q24=Q(S24), r24=rows(S24).slice(1);
    check('2-4. 7/31（六）20:00 子晴（在臺北、FAMILIAR 以上）：三則（稿 2-4 引文）＋「好。」「我不會看。」',J(pairs('vf_y2_0731'))===J(qPairs(q24))&&J(optsOf('vf_y2_0731'))===J(r24.map(r=>qs(r[0])[0])),J(pairs('vf_y2_0731')));
    rep=answer('vf_y2_0731',0); rules(); const w24=r24[0][1];
    check('2-4. 「好。」→「明天下午」「Café」；8/1（日）15:00 2:30 AM 一鍵',J(rep)===J(qs(w24).slice(0,2).map(t=>ZQ+':'+t))&&isAt(out('vf_y2_0801'),'2027-08-01',15),J(rep));
    Ls=await run('ev_vf_y2_0801'); const n24=nar(w24)[0].replace(/^（旁白：/,'');
    check('2-4. Café：AA_549 3-3 那一句旁白（她的筆電轉過來給你看，…）換成子晴的場景（第一句「（下午的 2:30 AM。…）」；台詞照 AA_549，tests/aa549_vacgap_unit.js 3-3）',Ls[0]==='（下午的 2:30 AM。子晴坐在最裡面，筆電貼滿貼紙，桌上兩杯冰美式。）'&&Ls.indexOf(L().y2_0731.narr)<0&&w24.indexOf(L().y2_0731.narr)>=0,J(Ls));
    G=lawG('2027-07-31',20.05,{fam:[ZQ]}); rules(); rep=answer('vf_y2_0731',1); check('2-4. 「我不會看。」→「不用會」「看就好」「……算了 下次」',J(rep)===J(qs(r24[1][1]).map(t=>ZQ+':'+t)),J(rep));
    G=lawG('2027-07-31',20.05,{fam:[ZQ]}); SOCIAL.remember(ZQ,'PLAYTESTED',''); rules();
    check('2-4. 試玩過（PLAYTESTED）：第一則換成「新的那個 第二關做好了」',tagged('vf_y2_0731')[0].text===qs(part('- 已經有 `PLAYTESTED`','- 和子晴交往中'))[0]&&tagged('vf_y2_0731').length===3);
    /* 2-5 */
    G=lawG('2027-08-04',21.05,{flags:{VA10:'yes'}}); rules(); const q25=Q(S25);
    check('2-5. 8/4（三）21:00 桌遊團：香港的機票（稿 2-5 引文）；參加那一團的回「買了。」「還沒。」',J(pairs('vf_y2_0804'))===J(qPairs(q25))&&J(optsOf('vf_y2_0804'))===J(['買了。','還沒。']),J(pairs('vf_y2_0804')));
    rep=answer('vf_y2_0804',1); check('2-5. 「還沒。」→ 阿哲「今天買 明天會漲」',J(rep)===J(['zhe:今天買 明天會漲']));
    G=lawG('2027-08-04',21.05,{flags:{VA10:'yes'}}); rules(); rep=answer('vf_y2_0804',0); check('2-5. 「買了。」→ 阿哲「好喔」',J(rep)===J(['zhe:好喔']));
    G=lawG('2027-08-04',21.05); rules(); check('2-5. 沒參加：只看得到，不用回',tagged('vf_y2_0804').length===4&&!optsOf('vf_y2_0804').length);
    /* 停點 */
    G=lawG('2027-06-16',9,{fam:[YT,SIS,ZQ],date:[AN]}); const S=stopList(G).map(hmT);
    check('2. 快轉停點：6/18 21:00、6/23 15:00、7/24 21:30、7/28 16:00、7/31 20:00、8/4 21:00（AA_440 第 6 節：每一件都會停）',['2027-06-18 21','2027-06-23 15','2027-07-24 21.5','2027-07-28 16','2027-07-31 20','2027-08-04 21'].every(t=>S.includes(t)),J(S));
    setT('2027-06-18',8.5); rules(); check('2. 那一天一開始就排好、還沒送到：照樣停在 21:00；HOME.breakNext 停在那裡',PHONE.sent(G,'vf_y2_0618')&&!tagged('vf_y2_0618').length&&stopList(G).map(hmT).includes('2027-06-18 21')&&hmT(HOME.breakNext(G))==='2027-06-18 21');
    setT('2027-06-18',21.05); rules(); check('2. 送到了就不再停',!stopList(G).map(hmT).includes('2027-06-18 21'));
  });

  /* ======================= 3 大三寒假 ======================= */
  await sec(3,async()=>{
    let G=lawG('2028-02-04',17.05,{fam:[YT]}); rules(); const q31=Q(S31);
    check('3-1. 2/4（五）17:00 語彤（FAMILIAR 以上）：「阿姨今天開工。」「開工第一天，每碗多一顆滷蛋。」＋「我去吃。」「下次。」',J(tagged('vf_y3_0204').map(m=>m.text))===J(q31.slice(0,2).map(x=>x.text))&&J(optsOf('vf_y3_0204'))===J(['我去吃。','下次。']));
    answer('vf_y3_0204',0); rules(); check('3-1. 「我去吃。」＝18:30 麵店一鍵',isAt(out('vf_y3_0204'),'2028-02-04',18.5));
    let Ls=await run('ev_vf_y3_0204'); check('3-1. 麵店：（店門口貼了新的春聯。…「開工啦！」）、語彤「（端麵過來）……兩顆。」、（她把碗放下，回去收下一桌。）',J(Ls)===J(q31.slice(2).map(x=>x.text))&&H.said[1].who===SOCIAL.npcName(YT),J(Ls));
    G=lawG('2028-02-04',17.05,{fam:[YT]}); rules(); let rep=answer('vf_y3_0204',1); check('3-1. 「下次。」→「嗯。」',J(rep)===J([YT+':嗯。']));
    /* 3-2 */
    const q32=Q(S32);
    G=lawG('2028-02-08',21.05); rules(); const zheAway=!STORY.presence('zhe',Object.assign({},G,{day:D('2028-02-09')})).here===false?false:STORY.presence('zhe',Object.assign({},G,{day:D('2028-02-09')})).here===false;
    check('3-2. 2/8（二）21:00 桌遊團：2/9 阿哲在高雄（BB_303 第 3 節）＝他那一句拿掉：Alison「明天元宵！！去看燈！！」「所以才要去！！」＋「去。」「不去。」',zheAway&&J(pairs('vf_y3_0208'))===J(qPairs(q32.slice(0,3)).filter(p=>!/^zhe:/.test(p)))&&J(optsOf('vf_y3_0208'))===J(['去。','不去。']),J(pairs('vf_y3_0208')));
    const pres0=STORY.presence; STORY.presence=(id,g)=>id==='zhe'?{here:true}:pres0(id,g);
    G=lawG('2028-02-08',21.05); rules(); const withZhe=J(pairs('vf_y3_0208'))===J(qPairs(q32.slice(0,3)));
    answer('vf_y3_0208',0); rules(); const q2=out('vf_y3_0209'); setT('2028-02-09',19); Ls=await run('ev_vf_y3_0209'); STORY.presence=pres0;
    check('3-2. 阿哲在臺北：群組三句（稿 3-2 引文）；「去。」＝2/9 19:00 出遊（地點字幕「元宵的燈會」）：旁白、Alison、阿哲「每年都是龍吧。」、回程（Alison 靠著阿哲睡著了）',withZhe&&isAt(q2,'2028-02-09',19)&&ev('ev_vf_y3_0209').dialogue[0].scene==='元宵的燈會'&&J(Ls)===J(q32.slice(3,7).map(x=>x.text))&&G.flags.VF_Y3_LANTERN==='went',J(Ls));
    G=lawG('2028-02-08',21.05,{know:[YT]}); rules(); answer('vf_y3_0208',0); setT('2028-02-09',19); Ls=await run('ev_vf_y3_0209'); setT('2028-02-09',21.05); rules(); const back2=nar(part('- 阿哲大三寒假','- 回「不去。」')).find(t=>t.indexOf('回程')>=0);
    check('3-2. 阿哲不在臺北：他的句子拿掉、回程旁白換（回程的捷運上，Alison 一直在傳照片給阿哲。）；認識語彤的：她那天顧店，群組「今天店裡賣很多湯圓。」',J(Ls)===J([q32[3].text,q32[4].text,back2])&&J(pairs('vf_y3_0209_yt'))===J([YT+':今天店裡賣很多湯圓。']),J(Ls));
    G=lawG('2028-02-08',21.05); rules(); answer('vf_y3_0208',0); setT('2028-02-09',21.05); rules(); check('3-2. 不認識語彤：沒有她那一句',!tagged('vf_y3_0209_yt').length);
    G=lawG('2028-02-08',21.05); rules(); answer('vf_y3_0208',1); rules(); setT('2028-02-09',21.4); rules(); const b32=tagged('vf_y3_0209_miss').length; setT('2028-02-09',21.55); rules();
    check('3-2. 「不去。」＝2/9 21:30 Alison 傳一張燈的照片「你錯過一隻龍！！」；不排出遊',b32===0&&J(pairs('vf_y3_0209_miss'))===J(['yu:'+VACFILL_UI.photoLantern,'yu:'+qs(part('- 回「不去。」','### 3-3.'))[1]])&&!out('vf_y3_0209'),J(pairs('vf_y3_0209_miss')));
    /* 3-3 */
    G=lawG('2028-02-12',14.05,{fam:[SIS]}); rules(); const q33=Q(S33);
    check('3-3. 2/12（六）14:00 學姊（FAMILIAR 以上、沒交往）：「法圖下週一恢復晚上開館。」（AA_507 0-2 第 4 點）「你開學以前要借書的話，那天人最少。」＋「我那天去。」',J(pairs('vf_y3_0212'))===J(qPairs(q33))&&J(optsOf('vf_y3_0212'))===J(['我那天去。']));
    answer('vf_y3_0212',0); rules(); Ls=await run('ev_vf_y3_0214'); const n33=fx(nar(part('- 回「我那天去。」','- 2/14 是情人節'))[1]||'',FIX507_33);
    check('3-3. 「我那天去。」＝2/14（一）10:00 法圖一鍵：（開館第一天，借書櫃台前面只有你。…點了一下頭。）',isAt(out('vf_y3_0214'),'2028-02-14',10)&&J(Ls)===J([n33,'（借完書出來，在法圖門口。）'].concat(AA533.y3_0214)),J(Ls)+J(n33));   /* 「（借完書出來，在法圖門口。）」：AA_595 1-B44（AA 11-02 22:30 定稿）*/   /* AA_533 4-3：後面加學姊兩句＋選項（預設第一個）*/
    G=lawG('2028-02-12',14.05,{date:[SIS]}); rules(); check('3-3. 和學姊交往中：不發',!tagged('vf_y3_0212').length);
    G=lawG('2028-02-12',14.05,{fam:[SIS],date:[AN]}); rules(); check('3-3. 和別人交往中：照發（只是借書，不和情人節衝突）',tagged('vf_y3_0212').length===2);
    /* 3-4 */
    const h34=nar(part('- 住家裡','- 留宿舍'))[0], d34=nar(part('- 留宿舍','## 4.'))[0];
    G=lawG('2028-02-12',9); check('3-4. 2/19（六）18:30 是快轉的停點（修訂：原本 2/16）',stopList(G).map(hmT).includes('2028-02-19 18.5')&&!stopList(G).map(hmT).includes('2028-02-16 18.5'));
    check('3-4. 快轉停在 2/19 18:30：日期卡下面那一行（宿舍的床＝留宿舍、在家＝住家裡）',HOME.cardLine(G,D('2028-02-19')*24+18.5,{dorm:true})===d34&&(G.home={at:true},HOME.cardLine(G,D('2028-02-19')*24+18.5,{}))===h34&&!!h34&&!!d34);
    G=lawG('2028-02-19',8.5,{home:true}); Ls=await wake(G);
    check('3-4. 2/19 在家醒來：（明天回宿舍。媽媽把你的冬天的外套洗好、摺好，放在行李箱最上面。）；放過了 18:30 不再停、日期卡不再寫',J(Ls)===J([h34])&&!stopList(G).map(hmT).includes('2028-02-19 18.5')&&HOME.cardLine(G,D('2028-02-19')*24+18.5,{})!==h34,J(Ls));
    G=lawG('2028-02-19',7.5,{zone:'dorm'}); Ls=await wake(G); check('3-4. 2/19 在宿舍醒來：（宿舍的走廊開始有人拖著行李進來。隔壁的人回來了，在敲門借吹風機。）',J(Ls)===J([d34]),J(Ls));
  });

  /* ======================= 4 其他假期 ======================= */
  await sec(4,async()=>{
    const r0123=row4('1/23（五）'), m0123=qs(r0123);
    let G=lawG('2026-01-23',15.05); rules();
    check('4. 大一寒假 1/23（五）15:00 留宿舍：媽媽私訊「明天陪我去迪化街。你拿東西。」＋「去」',J(tagged('vf_y1w_0123').map(m=>m.from+':'+m.text))===J(['mom:'+m0123[0]])&&J(optsOf('vf_y1w_0123'))===J(['去'])&&!EVENTS.check(ev('ev_vf_y1w_0123')));
    answer('vf_y1w_0123',0); rules(); check('4. 「去」＝1/24 迪化街（從宿舍出發；10:00）',isAt(out('vf_y1w_0124'),'2026-01-24',10)&&out('vf_y1w_0124').ev==='ev_vf_y1w_0124');
    let Ls=await run('ev_vf_y1w_0124'); check('4. 迪化街：（迪化街的人擠到走不動。…一包烏魚子。）、媽媽「你爸過年要吃這個。」',J(Ls)===J([nar(r0123)[0].replace(/^（旁白：/,'（'),m0123[1]].map(t=>t))||J(Ls)===J([L().y1w_0123.narr,m0123[1]]),J(Ls));
    check('4. 迪化街兩句在稿上的那一格裡',r0123.indexOf(L().y1w_0123.narr)>=0&&r0123.indexOf(L().y1w_0123.fish)>=0);
    G=lawG('2026-01-23',14.95,{home:true}); const h0=EVENTS.check(ev('ev_vf_y1w_0123')); setT('2026-01-23',15.05); rules(); const h1=EVENTS.check(ev('ev_vf_y1w_0123'));
    Ls=await run('ev_vf_y1w_0123'); rules();
    check('4. 住家裡：15:00 媽媽當面說（家裡的事件），沒有私訊；說完排 1/24 迪化街',!h0&&h1&&!tagged('vf_y1w_0123').length&&J(Ls)===J([m0123[0]])&&H.said[0].who==='媽媽'&&isAt(out('vf_y1w_0124'),'2026-01-24',10),J(Ls));
    G=lawG('2026-01-20',9); check('4. 1/23 15:00 是停點（住家裡、留宿舍都是）',stopList(G).map(hmT).includes('2026-01-23 15'));
    const r0127=row4('1/27（二）');
    G=lawG('2026-01-27',21.05); rules(); check('4. 1/27（二）21:00 家人群組：爸爸「我 2/14 的飛機。」、姊姊「爸你要記得去機場前先吃東西」＋「好。」',J(pairs('vf_y1w_0127'))===J(['dad:'+qs(r0127)[0],'sister:'+qs(r0127)[1]])&&J(optsOf('vf_y1w_0127'))===J([qs(r0127)[2]])&&tagged('vf_y1w_0127').every(m=>m.th==='g:home'&&m.name)&&PHONE.inGroup(G,'home'));
    const r0624=row4('6/24（三）');
    G=lawG('2026-06-24',21.05,{know:['kai']}); rules(); check('4. 大一暑假 6/24（三）阿凱：「所以你暑假在幹嘛」「我在打一款很難的遊戲 打不過」＋「我也來打。」',J(tagged('vf_y1s_0624').map(m=>m.text))===J(qs(r0624).slice(0,2))&&J(optsOf('vf_y1s_0624'))===J([qs(r0624)[2]]));
    let rep=answer('vf_y1s_0624',0); check('4. 「我也來打。」→ 阿凱「所以今晚 線上」（AA_556 第 4 節：對話串那一句旁白換成當晚 22:00 的線上語音，tests/aa556_vacgap2_unit.js）',J(rep)===J(['kai:'+qs(r0624)[3]]),J(rep));
    G=lawG('2026-06-24',21.05); rules(); check('4. 不認識阿凱：沒有',!tagged('vf_y1s_0624').length);
    const r0803=row4('8/3（一）');
    G=lawG('2026-08-03',21.05,{fam:[YT]}); rules(); check('4. 8/3（一）語彤（FAMILIAR 以上）「阿姨問你暑假有沒有回來吃飯。」＋「明天去。」',J(tagged('vf_y1s_0803').map(m=>m.text))===J([qs(r0803)[0]])&&J(optsOf('vf_y1s_0803'))===J([qs(r0803)[1]]));
    answer('vf_y1s_0803',0); rules(); check('4. 「明天去。」＝8/4 麵店一鍵（18:00）',isAt(out('vf_y1s_0804'),'2026-08-04',18)&&out('vf_y1s_0804').goto.zone==='noodle');
    G=lawG('2026-08-05',21.55,{date:[AN]}); rules(); check('4. 交往以安的：8/5 21:30 她從台中「我媽今天問你是誰。」「我說是男朋友。……她說好。」（不用回）',J(tagged('vf_y1s_0805').map(m=>m.text))===J(qs(r0803).slice(2,4))&&!optsOf('vf_y1s_0805').length);
    G=lawG('2026-08-05',21.55,{fam:[AN]}); rules(); check('4. 沒交往：沒有',!tagged('vf_y1s_0805').length);
    const r0828=row4('8/28（五）');
    G=lawG('2026-08-28',18,{home:true}); const e28=ev('ev_vf_y1s_0828'); setT('2026-08-28',17.9); const c28=EVENTS.check(e28); setT('2026-08-28',18); Ls=await run('ev_vf_y1s_0828');
    check('4. 8/28（五）姊姊回家住兩天（在家演）：（姊姊把你的房間當倉庫，堆了三箱書。）、宜蓁「台南的房子太小。先放你這裡。……你開學就不用了吧？」',!c28&&J(Ls)===J([nar(r0828).find(t=>t.indexOf('倉庫')>=0),qs(r0828)[0]])&&H.said[1].who==='宜蓁',J(Ls));
    G=lawG('2026-08-20',9,{home:true}); const s28=stopList(G).map(hmT).includes('2026-08-28 18'); G.home={at:false}; check('4. 住家裡的停在 8/28 18:00；留宿舍的不停（回家的時候才演，到 8/29）',s28&&!stopList(G).map(hmT).includes('2026-08-28 18'));
    const r0114=row4('1/14（四）');
    G=lawG('2027-01-14',21.05); rules(); check('4. 大二寒假 1/14（四）21:00 桌遊團：阿哲「寒假還有誰在臺北」、語彤「我在。週末有班。」（AA_630 Z-159）、Alison「我！！」＋「我也在。」',J(pairs('vf_y2w_0114'))===J(['zhe:'+qs(r0114)[0],YT+':我在。週末有班。','yu:'+qs(r0114)[2]])&&J(optsOf('vf_y2w_0114'))===J([qs(r0114)[3]]),J(pairs('vf_y2w_0114')));
    answer('vf_y2w_0114',0); rules(); Ls=await run('ev_vf_y2w_0116');
    check('4. 「我也在。」＝1/16（六）18:00 麵店長桌一鍵：（長桌只坐了一半。）（阿姨沒說話，在你盤子裡多放了一塊叉燒。）（AA_519 1-3：稿上的「（長桌只坐了一半。阿姨多送了一盤小菜：「人少，吃多一點。」）」拆兩句、後半換第 6 句）',
      isAt(out('vf_y2w_0116'),'2027-01-16',18)&&J(Ls)===J([NEW0114[0]].concat(AA533.y2w_0116,[NEW0114[1]]))&&J([L().y2w_0114.narr,L().y2w_0114.narr2])===J(NEW0114)&&r0114.indexOf(OLD0114)>=0&&ok519(NEW0114[0])&&ok519(NEW0114[1]),J(Ls));
    const r0122=row4('1/22（五）');
    G=lawG('2027-01-22',21.05); rules(); rep=answer('vf_y2w_0122',0);
    check('4. 1/22（五）姊姊私訊「我 2/3 回去」「媽說你又在睡」→「沒有。」→「她說你會這樣講」',J(tagged('vf_y2w_0122').slice(0,2).map(m=>m.text))===J(qs(r0122).slice(0,2))&&J(rep)===J(['sister:'+qs(r0122)[3]])&&qs(r0122)[2]==='沒有。',J(rep));
    const r0708=row4('7/8（四）');
    G=lawG('2027-07-08',21.05); rules(); check('4. 大二暑假 7/8（四）家人群組：爸爸傳一張上海下大雨的照片「颱風。」、媽媽「你那邊有颱風？」、爸爸「這邊叫颱風。」（不用回）',J(pairs('vf_y2s_0708'))===J(['dad:'+VACFILL_UI.photoTyphoon,'dad:'+qs(r0708)[0],'mom:'+qs(r0708)[1],'dad:'+qs(r0708)[2]])&&!optsOf('vf_y2s_0708').length,J(pairs('vf_y2s_0708')));
    const r0106=row4('1/6（四）');
    G=lawG('2028-01-06',21.05,{know:[ZQ]}); rules(); check('4. 大三寒假 1/6（四）子晴（在臺北）：「期末考完了 我要去參創」「你要的話 下午三點」＋「好。」',J(tagged('vf_y3w_0106').map(m=>m.text))===J(qs(r0106).slice(0,2))&&J(optsOf('vf_y3w_0106'))===J([qs(r0106)[2]]));
    answer('vf_y3w_0106',0); rules(); Ls=await run('ev_vf_y3w_0108');
    check('4. 「好。」＝1/8（六）15:00 參創一鍵（不算校外約會）：（她帶你繞了一圈試玩區，在一台前面停了很久，什麼都沒說。）',isAt(out('vf_y3w_0108'),'2028-01-08',15)&&!out('vf_y3w_0108').dateTrip&&J(Ls)===J([L().y3w_0106.narr].concat(AA533.y3w_0108))&&r0106.indexOf(L().y3w_0106.narr)>=0,J(Ls));
    const r0115=row4('1/15（六）');
    G=lawG('2028-01-15',21.05,{fam:[SIS]}); rules(); rep=answer('vf_y3w_0115',0);
    check('4. 1/15（六）學姊（FAMILIAR 以上）「美國那邊的面試，排在下禮拜。」「線上的。八月去的那一梯。」→「加油。」→「嗯。……上了再跟你說。」（AA_507 0-2 第 2 點）',J(tagged('vf_y3w_0115').slice(0,2).map(m=>m.text))===J(qs(r0115).slice(0,2))&&J(rep)===J([SIS+':'+qs(r0115)[3]]),J(rep));
    const r0111=row4('1/11（四）');
    G=lawG('2029-01-11',21.05); rules(); check('4. 大四寒假 1/11（四）桌遊團：Alison、柏翰、阿哲、Alison',J(pairs('vf_y4w_0111'))===J(['yu:'+qs(r0111)[0],'classmate_bohan:'+qs(r0111)[1],'zhe:'+qs(r0111)[2],'yu:'+qs(r0111)[3]]),J(pairs('vf_y4w_0111')));
    const r0120=row4('1/20（六）');
    G=lawG('2029-01-20',21.05,{date:[AN]}); rules(); check('4. 1/20（六）以安（交往中、在臺北）「二月要考了。」「這週我每天在總圖三樓。……你要來的話，坐我對面。」＋「我去。」',J(tagged('vf_y4w_0120').map(m=>m.text))===J(qs(r0120).slice(0,2))&&J(optsOf('vf_y4w_0120'))===J([qs(r0120)[2]]));
    const c=CHARACTERS[AN]; setT('2029-01-23',14); const before=STORY.schedEnt(c,G); setT('2029-01-20',21.1); answer('vf_y4w_0120',0); setT('2029-01-23',14); const after=STORY.schedEnt(c,G); setT('2029-01-28',14); const later=STORY.schedEnt(c,G);
    check('4. 「我去。」＝之後一週（1/21～1/27）每天 9:00～17:00 她在總圖三樓（照總圖的座位系統）',before!==X().AN_LIB&&after===X().AN_LIB&&after.zone==='library'&&later!==X().AN_LIB,J(after&&after.zone));
    G=lawG('2029-01-20',21.05,{fam:[AN]}); rules(); check('4. 沒交往：沒有',!tagged('vf_y4w_0120').length);
    const r0127b=row4('1/27（六）');
    G=lawG('2029-01-27',21.05); rules(); check('4. 1/27（六）家人群組：爸爸「我 2/10 的飛機。今年待到元宵。」、媽媽「真的？」、爸爸「真的。」',J(pairs('vf_y4w_0127'))===J(['dad:'+qs(r0127b)[0],'mom:'+qs(r0127b)[1],'dad:'+qs(r0127b)[2]]),J(pairs('vf_y4w_0127')));
    G=lawG('2029-01-01',9,{date:[AN]}); const S4=stopList(G).map(hmT); check('4. 大四寒假的停點：1/11、1/20、1/27 21:00',['2029-01-11 21','2029-01-20 21','2029-01-27 21'].every(t=>S4.includes(t)),J(S4));
    G=lawG('2026-08-05',21.55,{date:[AN],flags:{}}); G.flags.EXCHANGE_ROUTE=null; check('4. 第 4 節的每一則都標了停點（訊息）',X().MSGS.filter(m=>!m.stage&&!m.stop).map(m=>m.tag).sort().join(',')==='vf_y1w_0123,vf_y3_0209_miss,vf_y3_0209_yt');
  });

  /* ======================= 5 摘要池 ======================= */
  await sec(5,async()=>{
    let G=lawG('2027-01-12',8.5,{home:true}); let Ls=await wake(G);
    check('5. 大二寒假 1/12 在家醒來、沒有任何一件：住家裡・寒假第一句',J(Ls)===J([POOL.home.winter[0]]),J(Ls));
    setT('2027-01-13',8.5); Ls=await wake(G); check('5. 隔天 1/13：第二句（照順序、不重複）',J(Ls)===J([POOL.home.winter[1]]),J(Ls));
    Ls=await wake(G); check('5. 同一天醒來兩次：只放一次',Ls.length===0);
    setT('2027-01-14',8.5); Ls=await wake(G); check('5. 1/14 有事（21:00 桌遊團群組）：不放',Ls.length===0,J(Ls));
    setT('2027-01-11',8.5); Ls=await wake(G); check('5. 成績公布日（快轉的停點）：不放',Ls.length===0);
    setT('2026-12-28',8.5); Ls=await wake(G); check('5. 放假第一天：不放',Ls.length===0);
    G.home={at:false}; G.zone='dorm'; setT('2027-01-15',7.5); Ls=await wake(G); check('5. 留宿舍（宿舍的床）：留宿舍・寒假第一句（和住家裡分開算）',J(Ls)===J([POOL.dorm.winter[0]]),J(Ls));
    G.zone='campus'; setT('2027-01-16',7.5); G.outings=[]; Ls=await wake(G); check('5. 不是在家裡或宿舍的床：不放',Ls.length===0);
    G=lawG('2027-01-12',8.5,{home:true}); const R=X().rec(G); R.pool['Y2W:home']=8; Ls=await wake(G); check('5. 第九句起是 AA_443 加寫的（住家裡・寒假 9「（你在陽台曬棉被。…）」）',J(Ls)===J([POOL443.home.winter[0]])&&POOL.home.winter[8]===POOL443.home.winter[0],J(Ls));
    G=lawG('2027-01-12',8.5,{home:true}); X().rec(G).pool['Y2W:home']=14; Ls=await wake(G); check('5. 一個假期內 14 句用完從頭',J(Ls)===J([POOL.home.winter[0]]));
    G=lawG('2027-07-05',8.5,{zone:'dorm'}); Ls=await wake(G); check('5. 暑假：留宿舍・暑假第一句',J(Ls)===J([POOL.dorm.summer[0]]),J(Ls));
    G=lawG('2027-07-05',8.5,{home:true}); Ls=await wake(G); check('5. 暑假：住家裡・暑假第一句',J(Ls)===J([POOL.home.summer[0]]),J(Ls));
    G=lawG('2027-01-12',8.5,{home:true}); G.outings=[{id:'x',ev:'ev_x',day:D('2027-01-12'),h:15,state:'planned',travelH:0.5}]; Ls=await wake(G); check('5. 今天有出遊：不放',Ls.length===0);
    G=lawG('2027-01-12',8.5,{home:true}); PHONE.at(G,G.day,16,[{th:'p:kai',from:'kai',text:'x'}],'x_test'); Ls=await wake(G); check('5. 今天有排好的訊息：不放',Ls.length===0);
    G=lawG('2026-10-14',8.5,{zone:'dorm'}); Ls=await wake(G); check('5. 學期中：不放',Ls.length===0);
    G=lawG('2027-01-12',8.5,{home:true}); G.home={at:true,lbreak:'Y2W'}; H.picks=[1]; H.said=[]; await HOME.ffMenu(GM,'home'); const ffL=H.said.map(s=>s.t);
    check('5. 快轉停下來的那一天不放（快轉自己有旁白）',G.day>D('2027-01-12')&&!ffL.some(t=>POOL.home.winter.includes(t))&&X().rec(G).wake==null,J(ffL)+' day '+CALENDAR.dateOf(G.day).key);
    G=lawG('2027-01-12',8.5,{home:true,flags:{}}); const ab=VAC.abroadOn; VAC.abroadOn=()=>true; Ls=await wake(G); VAC.abroadOn=ab; check('5. 人在國外（假期出國的活動）：不放',Ls.length===0);
  });
  H.done();
})();
