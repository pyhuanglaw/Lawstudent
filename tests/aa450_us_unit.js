// AA_450（企劃線 fb1d8ae45，AA-B 2026-10-24 22:5x；讀 BB-B 美國交換逐日劇本（交往中））：美國篇的十一項修改——不需要瀏覽器。台詞逐字對 AA_450（每一句直接寫在這裡，也對稿）。
//   1-1 亞洲超市「……我在研究室常吃這一種。」　1-2 湖邊「大家在吃早餐了」＋選項 a 的回答　1-3 8/15 迎新週第二天兩句旁白＋還沒演就又快轉＝快轉以前先演
//   1-4 媽媽二十個星期天照日期一則一則（每則一次）　1-5 芝加哥沒去：交往中只傳三張照片、第一張「密西根湖，浪很大」　1-6 約芝加哥「……到了再看。」
//   1-7 期末飯（學姊 Y4S1）：美國路線、US_SNOW_QUIET、沒有 SIS_ASKED_TWICE＝多三句　1-8 交換生群組起頭的改何俊朗（沒見過他＝國際學生會）
//   1-9 感恩節沒去湖邊：「氣象說錯了，沒有下雪。」　1-10 何俊朗 3 選項 a、10/6 聚餐「星期五晚上，」　1-11 何俊朗 3 的行程 10/3 起才排
// 修改前（開發分支 ec3af2865）：每一節至少一項 FAIL。用法：node tests/aa450_us_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const H=require('./pg_harness.js');
const ROOT=H.ROOT, {check,GM,E}=H, J=JSON.stringify, S5='heroine_05';
global.Z3={ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
const EXPORT=/^(EXCH|US3|US_\w+|AIRPORT_T2_LAYOUT|Y34B|R2Y3B|R2Y3B_EVENTS|R2Y4A|R2Y4A_EVENTS|USL|US_LIFE_EVENTS|US208|ROM|PORTRAIT_ONLY)$/;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>EXPORT.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
const loadErr=[];
for(const f of ['src/exchange3d.js','src/data/us_layouts.js','src/us3d.js','src/y34b3d.js','src/data/r2y3b_events.js','src/r2y3b3d.js','src/data/r2y4a_events.js','src/r2y4a3d.js','src/data/us_life_events.js','src/us_life3d.js','src/us208_3d.js','src/data/us_blank_lines.js','src/us_blank3d.js']){
  if(!fs.existsSync(path.join(ROOT,f))){ loadErr.push(f+'：沒有這個檔'); continue; } try{ load(f); }catch(e){ loadErr.push(f+'：'+e.message); } }
let doc=''; try{ doc=cp.execSync('git show 57c81bdac:"docs/story_planning/AA_450_美國交換逐日劇本讀後_交往中.md"',{cwd:ROOT,encoding:'utf8'}); }catch(e){ doc=''; }
const inDoc=t=>doc.indexOf(t)>=0;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const D=k=>STORY.dayOfKey(k), T=(d,h)=>d*24+h;
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
GM.caption=()=>{}; GM.toast=()=>{}; GM.studySession=async()=>{};
GM.spawnCharacter=(id,x,z,o)=>{ const n={id,charId:id,obj:{position:{x,y:0,z},rotation:{y:0}},seat:(o&&o.seat)||null,pose:(o&&o.pose)||'idle'}; GM.npc[id]=n; return n; }; GM.removeNPC=id=>{ delete GM.npc[id]; };
const US=f=>Object.assign({EXCHANGE_ROUTE:'US',EXCH_RULE:1,US_DEPARTED:true,US_ARRIVED:true,US_ARRIVED_DAY:D('2028-08-02'),US1:'together',Y4_PATH:'bar',Y4_PATH_DAY:D('2028-06-08')},f||{});
const fresh=(key,h,zone,flags)=>{ const G=H.fresh(key,h,zone||'us_apartment',US(flags)); G.contacts=G.contacts||{}; G.msgs=G.msgs||[]; G.visited=G.visited||{}; G.vac=G.vac||{reg:{}}; ROM.rec(G); E.player.busy=false; E.paused=false;
  SOCIAL.remember(S5,'FIRST_MET',''); PHONE.join(G,'us_exchange','交換生'); return G; };
const dateSis=()=>{ const G=H.G; G.flags.dating_heroine_05=true; G.flags.CALLED_SHUYU=true; const r=ROM.get(G,S5); r.status='dating'; };
const at=(key,h)=>{ const G=H.G; G.day=D(key); G.hour=h; G.weekday=wdOf(G.day); };
const rules=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const byTag=tag=>(H.G.msgs||[]).filter(m=>m.tag===tag);
const th=t=>(H.G.msgs||[]).filter(m=>m.th===t);
const fm=m=>(m.from||'')+'|'+(m.name||'')+'|'+m.text;
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const said=()=>H.said.map(s=>s.t);
const play=async(id,picks)=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); await EVENTS.run(ev(id),{noTitle:true}); return said(); };
const settle=async()=>{ for(let i=0;i<50&&US_BLANK.isBusy&&US_BLANK.isBusy();i++) await new Promise(r=>setTimeout(r,0)); };
const LG='npc_long|何俊朗|', ISA='us_isa|國際學生會|';

(async()=>{
await sec(0,()=>{
  check('0. 美國篇的檔案都載得到',!loadErr.length,loadErr.join('；'));
  check('0. 讀稿（企劃線 57c81bdac AA_450；fb1d8ae45＋1-8 補註）',doc.length>3000&&inDoc('## 1. 要改的')&&inDoc('### 1-11.')); });

/* ======================= 1-1 亞洲超市 ======================= */
await sec('1-1',async()=>{ const A='……我在研究室常吃這一種。'; fresh('2028-08-02',20.25,'us_asian_market'); dateSis(); const L=await play('ev_us1_asian');
  check('1-1. 稿裡有「'+A+'」',inDoc('學姊：'+A));
  check('1-1. 亞洲超市：旁白之後「……我在研究室常吃這一種。」（不是「……這個不算浪費。這是鄉愁。」）',J(L)===J(['（亞洲超市。她在泡麵那一排停了很久，拿了一包台灣的泡麵，貴三倍。）',A]),J(L)); });

/* ======================= 1-2 湖邊 ======================= */
await sec('1-2',async()=>{ const W=['台灣這時候，大家在吃早餐了。','這附近的晚餐，我只知道超市的熟食區。','（她想了一下。）','……那也算。'];
  for(const t of W) check('1-2. 稿裡有「'+t+'」',inDoc(t));
  fresh('2028-08-05',18.5,'us_outside'); dateSis(); const a=await play('ev_usl_lake1',[0]), O=H.opts[0]||[];
  check('1-2. 湖邊：「台灣這時候，大家在吃早餐了。」→ 選項照舊 →「那我們也去吃。」＝「這附近的晚餐，我只知道超市的熟食區。」「（她想了一下。）」「……那也算。」',
    J(a.slice(1))===J(['這裡天黑得好晚。'].concat(W))&&J(O)===J(['「那我們也去吃。」','「想家嗎？」','（陪她走到湖的另一邊）'])&&!a.some(t=>/宵夜|天快亮了/.test(t))&&H.G.flags.US_LAKE_FIRST===true,J({a,O})); });

/* ======================= 1-3 8/15 迎新週第二天 ======================= */
await sec('1-3',async()=>{ const OR=['（八月十五日，迎新週第二天：學生證、健康保險、選課確認。每一個櫃台前面都是隊伍。）','銀行那條最慢。我排了一個早上。','（那天傍晚，你在法學院圖書館門口等她。她出來的時候，手上拿著新的學生證，照片拍得很嚴肅。）'];
  check('1-3. 稿裡有兩句新旁白',inDoc(OR[0].slice(1,-1))&&inDoc(OR[2].slice(1,-1)));
  fresh('2028-08-15',9,'us_outside',{MET_LONG:true}); dateSis(); H.said=[]; US_BLANK.tick(GM); await settle();
  check('1-3. 交往中、見過何俊朗：「（八月十五日，迎新週第二天：學生證、健康保險、選課確認。……）」「銀行那條最慢。……」「（那天傍晚，你在法學院圖書館門口等她。……）」',J(said())===J(OR)&&!said().some(t=>/銀行帳戶|手機門號/.test(t)),J(said()));
  /* 時機：8/14 12:05 快轉 → 停在 8/18 21:00 她的私訊（要回；手機自動打開，那一格 US_BLANK.tick 沒空）→ 收起手機馬上又快轉 */
  const G=fresh('2028-08-14',12.1,'us_apartment',{MET_LONG:true}); dateSis(); rules(); const why=await USL.jump(GM,T(D('2028-08-21'),9)), stop=CALENDAR.dateOf(G.day).key+' '+G.hour, due=!!G.flags.USB_ORIENT_DUE, done0=US_BLANK.orientDone(G);
  const days=[]; const say0=GM.say; GM.say=async(w,t)=>{ if(t===OR[0]) days.push(CALENDAR.dateOf(H.G.day).key); return say0(w,t); };
  H.said=[]; try{ await USL.jump(GM,T(D('2028-08-21'),9)); } finally { GM.say=say0; }
  check('1-3 時機. 第一次快轉跨過 8/15、停在 8/18 21:00 的私訊（摘要還沒演）',why==='msg'&&stop==='2028-08-18 21'&&due&&!done0,J({why,stop,due,done0}));
  check('1-3 時機. 還沒演就又快轉：那一次快轉以前先演（在 8/18，不是跳到 8/21 才演）；之後不再演',said()[0]===OR[0]&&J(days)===J(['2028-08-18'])&&US_BLANK.orientDone(G)&&!G.flags.USB_ORIENT_DUE&&!US_BLANK.orientDue(G),J({days,s:said().slice(0,2),d:CALENDAR.dateOf(G.day).key}));
  const G2=fresh('2028-08-14',22,'us_apartment',{US2:'repair'}); rules(); H.said=[]; await USL.jump(GM,T(D('2028-08-15'),12));
  check('1-3 時機. 沒有跨過 8/15 18:00 的快轉：快轉以前不演',!said().includes(OR[0])&&!US_BLANK.orientDone(G2)); });

/* ======================= 1-4 媽媽每週日 ======================= */
const MOM=[['2028-08-06','吃飯了沒。'],['2028-08-13','你姊問你那邊缺什麼，她要寄過去。我說不用。'],['2028-08-20','巷口那家早餐店換老闆了。蛋餅變小了。'],['2028-08-27','吃飯了沒。'],
  ['2028-09-03','家裡的冷氣修好了。師傅說還可以用五年。'],['2028-09-10','你爸問你上課聽不聽得懂。我說聽得懂。……聽得懂吧。'],['2028-09-17','吃飯了沒。'],['2028-09-24','你房間我進去開窗了。其他沒動。'],
  ['2028-10-01','禮拜二中秋。你姊會回來。月餅我留一個給你，放冷凍。'],['2028-10-08','吃飯了沒。'],['2028-10-15','天氣預報說你那邊變冷了。外套夠不夠。'],['2028-10-22','你姊寄了一本她編的書回家，說是給你的。我放你桌上。'],
  ['2028-10-29','吃飯了沒。'],['2028-11-05','你那邊今天換時間了吧。我算了一下，現在差十三個小時。'],['2028-11-12','吃飯了沒。'],['2028-11-19','你爸說他看了地圖，那邊離芝加哥很近。'],
  ['2028-11-26','你爸說他過年回來。機票買好了。'],['2028-12-03','吃飯了沒。'],['2028-12-10','你回來那天，我去機場接你。早上五點多對吧。'],['2028-12-17','棉被曬過了。']];
await sec('1-4',async()=>{
  check('1-4. 表上二十則都在稿裡、二十天都是星期天',MOM.every(([k,t])=>inDoc('| '+k.slice(5).replace(/^0/,'').replace('-0','/').replace('-','/')+' | '+t))&&MOM.every(([k])=>wdOf(D(k))===0),J(MOM.filter(([k,t])=>!inDoc(t)).map(x=>x[0])));
  const G=fresh('2028-08-06',8); dateSis(); const got=[];
  for(const [k] of MOM){ at(k,7.5); rules(); const h=(k>='2028-11-05')?8:9; const early=th('p:mom').filter(m=>m.day===D(k)).length; at(k,h); rules(); at(k,22); rules();
    const M=th('p:mom').filter(m=>m.day===D(k)); got.push({k,early,n:M.length,h:M[0]&&M[0].h,t:M[0]&&M[0].text,want:h}); }
  const bad=got.filter((g,i)=>g.early||g.n!==1||g.h!==g.want||g.t!==MOM[i][1]);
  check('1-4. 二十個星期天照日期那一則（當地 09:00、11/5 起 08:00；每一則只發一次）',!bad.length,J(bad.slice(0,4)));
  check('1-4. 一學期收到的：「你姊問你要不要帶什麼回來。我說不用。」一次都沒有；「吃飯了沒。」七次',!th('p:mom').some(m=>m.text==='你姊問你要不要帶什麼回來。我說不用。')&&th('p:mom').filter(m=>m.text==='吃飯了沒。').length===7&&th('p:mom').length===20,J(th('p:mom').map(m=>m.text)));
  fresh('2028-10-29',7); at('2028-11-05',8.1); rules();   /* 讀檔回來：照原本「太舊的不補」，只補前一天以內的 */
  check('1-4. 讀檔跳過一週：10/29 那一則不補，11/5 照日期那一則',J(th('p:mom').map(m=>m.text))===J(['你那邊今天換時間了吧。我算了一下，現在差十三個小時。']),J(th('p:mom').map(m=>m.text)));
  /* BB 逐日劇本 trx_nolong3：旅行用字卡一天跳一天、跳過星期天 → 回來照原本的時間補 */
  fresh('2028-10-06',20,'us_apartment',{US_CANYON:true}); rules(); at('2028-10-14',18.5); rules(); const c8=th('p:mom').filter(m=>m.day===D('2028-10-08'));
  check('1-4. 大峽谷（10/7～10/14）回來：10/8「吃飯了沒。」照 10/8 補一次',c8.length===1&&c8[0].text==='吃飯了沒。',J(th('p:mom').map(m=>[m.day,m.text])));
  fresh('2028-12-15',20,'us_apartment'); rules(); at('2028-12-21',23.9); rules(); const s17=th('p:mom').filter(m=>m.day===D('2028-12-17'));
  check('1-4. 舊金山那一週（12/16～12/21）：12/17「棉被曬過了。」照 12/17 補一次',s17.length===1&&s17[0].text==='棉被曬過了。',J(th('p:mom').map(m=>[m.day,m.text]))); });

/* ======================= 1-5、1-6 芝加哥（交往中）======================= */
await sec('1-5',async()=>{
  check('1-5. 稿裡有「📷（密西根湖，浪很大）」',inDoc('「📷（密西根湖，浪很大）」'));
  fresh('2028-11-03',21.1,'us_apartment',{MET_LONG:true}); dateSis(); rules(); PHONE.answer(H.G,'us_chi',1); rules(); at('2028-11-12',21); rules();
  const P=byTag('us_chi_photos').map(fm);
  check('1-5. 交往中「這週不行」：11/12 21:00 私訊只傳三張照片、第一張「📷（密西根湖，浪很大）」，沒有「下次一起。」',J(P)===J(['heroine_05||📷（密西根湖，浪很大）','heroine_05||📷（博物館的恐龍）','heroine_05||📷（深盤披薩）'])&&byTag('us_chi_photos').every(m=>m.th==='p:heroine_05'&&m.h===21)&&!th('p:heroine_05').some(m=>m.text==='下次一起。'),J(P));
  fresh('2028-11-03',21.1,'us_apartment',{MET_LONG:true}); dateSis(); rules(); at('2028-11-11',7.4); R2Y4A.chicagoMissed(H.G,true); at('2028-11-12',21.1); rules();
  check('1-5. 交往中沒趕上巴士：07:20「巴士要開了。……我們先走。」（她私訊，照舊）＋三張照片，沒有「下次一起。」',J(byTag('us_chi_late').map(fm))===J(['heroine_05||巴士要開了。……我們先走。'])&&byTag('us_chi_photos').length===3&&!th('p:heroine_05').some(m=>m.text==='下次一起。'));
  /* 11/11 21:00 的「……下次一起來。」（US_BLANK.CHI）照舊：兩個晚上只剩一次「下次一起」*/
  fresh('2028-11-03',21.1,'us_apartment',{MET_LONG:true}); dateSis(); rules(); PHONE.answer(H.G,'us_chi',1); rules(); at('2028-11-11',21.1); rules(); at('2028-11-12',21.1); rules();
  check('1-5. 11/11、11/12 兩個晚上：「下次一起」只出現一次（11/11「……下次一起來。」）',th('p:heroine_05').filter(m=>/下次一起/.test(m.text)).map(m=>m.text).join('|')==='……下次一起來。',J(th('p:heroine_05').map(m=>m.text)));
});
await sec('1-6',async()=>{
  check('1-6. 稿裡有「……到了再看。」',inDoc('……到了再看。'));
  fresh('2028-11-03',21.1,'us_apartment',{MET_LONG:true}); dateSis(); rules();
  check('1-6. 交往中、見過何俊朗：11/3 21:00「何俊朗也去。他說他知道哪一家的披薩最好吃。……到了再看。」（「我們去驗證」是可昕的話）',J(byTag('us_chi_ask').map(fm))===J(['heroine_05||下週末去芝加哥。巴士早上七點出發，帶厚外套。','heroine_05||何俊朗也去。他說他知道哪一家的披薩最好吃。……到了再看。'])&&!th('p:heroine_05').some(m=>/驗證/.test(m.text)),J(byTag('us_chi_ask').map(fm)));
});

/* ======================= 1-7 期末飯（學姊 Y4S1）======================= */
await sec('1-7',async()=>{ const B=['時差還沒調好。我現在很想睡。','……可是這頓我不想錯過。'], X3=['去年在研究室說的。剛回來一天。','……我們做到了。'];
  const N=['美國下雪那天，我說回去再跟你說。','……論文還要改兩章。我不知道碩三畢不畢得了業。','還有，我其實不知道自己為什麼要念研究所。以前有人問，我都說「先不要問我」。'];
  for(const t of N) check('1-7. 稿裡有「'+t+'」',inDoc('學姊：'+t));
  const din=async(key,flags)=>{ H.fresh(key,18.5,'campus',Object.assign({met_sis:true},flags||{})); H.CLOSE(S5); H.G.flags.dating_heroine_05=true; ROM.get(H.G,S5).status='dating'; if(STORY._bindGM) STORY._bindGM(GM); H.said=[]; H.picks=[0,0,0];
    await TERMEND.dinner(GM,{id:'te_gf_Y4S1_'+S5,te:{term:'Y4S1',who:S5,kind:'gf'}}); return said(); };
  const tail=(L,x)=>{ const i=L.indexOf(B[1]); return i>0&&L[i-1]===B[0]&&J(L.slice(i+1,i+1+x.length))===J(x)&&!L.slice(i+1+x.length).some(t=>N.includes(t)); };
  const q=await din('2028-12-24',{EXCHANGE_ROUTE:'US',US_SNOW_QUIET:true,SIS_XMAS_Y3:'missed'}), qx=await din('2028-12-24',{EXCHANGE_ROUTE:'US',US_SNOW_QUIET:true,SIS_XMAS_Y3:'there'}), q26=await din('2028-12-26',{EXCHANGE_ROUTE:'US',US_SNOW_QUIET:true});
  check('1-7. 美國路線、US_SNOW_QUIET、沒有 SIS_ASKED_TWICE：「……可是這頓我不想錯過。」後面多三句',tail(q,N),J(q));
  check('1-7. 研究室那兩句也有的（12/24、SIS_XMAS_Y3 there）：三句接在研究室那兩句後面',tail(qx,X3.concat(N)),J(qx));
  check('1-7. 期末飯往後讓到 12/26：哪一天吃就哪一天說',tail(q26,N),J(q26));
  const a2=await din('2028-12-24',{EXCHANGE_ROUTE:'US',US_SNOW_QUIET:true,SIS_ASKED_TWICE:true}), n0=await din('2028-12-24',{EXCHANGE_ROUTE:'US'}), tw=await din('2028-12-24',{EXCHANGE_ROUTE:'TW',US_SNOW_QUIET:true});
  check('1-7. 「再問一次」那一支（SIS_ASKED_TWICE）、雪那天沒有「不問了」、臺灣路線：都不加',[a2,n0,tw].every(L=>tail(L,[])&&!L.some(t=>N.includes(t))),J({a2,n0,tw}));
});

/* ======================= 1-8 交換生群組的寄件人 ======================= */
await sec('1-8',async()=>{
  for(const t of ['何俊朗：明天晚上七點，會所。學期最後一頓。','何俊朗：每個人帶一道菜。泡麵也算。','寄件人「國際學生會」']) check('1-8. 稿裡有「'+t+'」',inDoc(t));
  const noSis=()=>!th('g:us_exchange').some(m=>m.from===S5&&!/^usb_grp_/.test(m.tag||''));   /* 挽回中週六 10:00 她在群組那 16 則（AA_424 第 1 節）不在 1-8 的範圍 */
  for(const [long,dt] of [[true,true],[false,true],[true,false],[false,false]]){ const who=long?LG:ISA, lab=(dt?'交往中':'挽回中')+(long?'、見過何俊朗':'、沒見過何俊朗');
    fresh('2028-12-13',21.1,'us_apartment',long?{MET_LONG:true}:{}); if(dt) dateSis(); rules(); const M=byTag('us_club_ask'), m=PHONE.byAsk(H.G,'us_club');
    check('1-8. 12/13 21:00 '+lab+'：群組兩則「明天晚上七點，會所。學期最後一頓。」「每個人帶一道菜。泡麵也算。」由'+(long?'何俊朗':'國際學生會')+'傳；三個選項掛在最後一則',
      J(M.map(fm))===J([who+'明天晚上七點，會所。學期最後一頓。',who+'每個人帶一道菜。泡麵也算。'])&&!!m&&m===M[1]&&J(m.ask.opts.map(o=>o.t))===J(['滷一鍋茶葉蛋。','最後一包台灣泡麵，煮成一大鍋。','什麼都沒煮，帶了一疊紙盤。'])&&noSis()&&!!OUT.get(H.G,'us_club'),J(M.map(fm))); }
  for(const long of [true,false]){ const who=long?LG:ISA, lab=long?'見過何俊朗':'沒見過何俊朗';
    fresh('2028-11-03',21.1,'us_apartment',long?{MET_LONG:true}:{}); rules();
    check('1-8. 挽回中 11/3 芝加哥的邀約（'+lab+'）：「下週末有人要去芝加哥嗎。巴士早上七點。」由'+(long?'何俊朗':'國際學生會')+'傳；回了照舊算 REPAIR',J(byTag('us_chi_ask').map(fm))===J([who+'下週末有人要去芝加哥嗎。巴士早上七點。'])&&noSis()&&(PHONE.answer(H.G,'us_chi',1),rules(),(H.G.flags.REPAIR||{})[S5]===1));
    at('2028-11-11',7.4); R2Y4A.chicagoMissed(H.G,true); at('2028-11-12',21.1); rules();
    check('1-8. 挽回中沒去芝加哥（'+lab+'）：「巴士要開了。……我們先走。」、三張照片由'+(long?'何俊朗':'國際學生會')+'傳、第一張也是「密西根湖，浪很大」（AA-B 10-24 23:19）；沒有「下次一起。」',J(byTag('us_chi_late').map(fm))===J([who+'巴士要開了。……我們先走。'])&&J(byTag('us_chi_photos').map(fm))===J([who+'📷（密西根湖，浪很大）',who+'📷（博物館的恐龍）',who+'📷（深盤披薩）'])&&noSis()&&!(H.G.msgs||[]).some(m=>m.text==='下次一起。'),J(byTag('us_chi_photos').map(fm)));
    fresh('2028-11-22',21.1,'us_apartment',long?{MET_LONG:true}:{}); rules();
    check('1-8. 挽回中 11/22 21:00（'+lab+'）：「感恩節第一天，大家要去湖邊。九點，會所門口集合。」由'+(long?'何俊朗':'國際學生會')+'傳',J(byTag('us3_ask').map(fm))===J([who+'感恩節第一天，大家要去湖邊。九點，會所門口集合。'])&&noSis()&&!!OUT.get(H.G,'us3_lake'));
    R2Y4A.lakeMissed(H.G); at('2028-11-23',21.6); rules();
    check('1-8. 挽回中沒去湖邊（'+lab+'）：21:30 兩則由'+(long?'何俊朗':'國際學生會')+'傳',J(byTag('us3_missed').map(fm))===J([who+'📷（湖邊一排人，中間空了一個位子。）',who+'大家都在。少你一個。'])&&noSis());
    fresh('2028-12-14',20.5,'us_apartment',long?{MET_LONG:true}:{}); R2Y4A.clubMissed(H.G); at('2028-12-14',21.6); rules();
    check('1-8. 會所晚餐沒去（'+lab+'）：21:30 兩則由'+(long?'何俊朗':'國際學生會')+'傳',J(byTag('us_club_missed').map(fm))===J([who+'📷（會所的長桌，盤子都空了。）',who+'你的那一份，有人幫你留了。'])&&noSis()); }
  check('1-8. 群組裡「國際學生會」顯示的名字',PHONE.who({th:'g:us_exchange',from:'us_isa',name:'國際學生會',text:'x'})==='國際學生會'&&PHONE.who({th:'g:us_exchange',from:'npc_long',name:'何俊朗',text:'x'})==='何俊朗');
});

/* ======================= 1-9 感恩節沒去湖邊（交往中）======================= */
await sec('1-9',async()=>{ const W=['我自己去了。氣象說錯了，沒有下雪。','📷（灰色的湖，岸邊沒有人）'];
  for(const t of W) check('1-9. 稿裡有「'+t+'」',inDoc('學姊：'+t));
  fresh('2028-11-22',21.1,'us_apartment',{MET_LONG:true}); dateSis(); rules(); R2Y4A.lakeMissed(H.G); at('2028-11-23',10); rules();
  check('1-9. 交往中 11/23 10:00 私訊「我自己去了。氣象說錯了，沒有下雪。」「📷（灰色的湖，岸邊沒有人）」（11/23 岸邊不能有雪）',J(byTag('us3_missed').map(fm))===J(W.map(t=>'heroine_05||'+t))&&byTag('us3_missed').every(m=>m.th==='p:heroine_05'&&m.h===10)&&!th('p:heroine_05').some(m=>/下雪了。拍給你|一張照片/.test(m.text)),J(byTag('us3_missed').map(fm))); });

/* ======================= 1-10 何俊朗 3、10/6 聚餐 ======================= */
await sec('1-10',async()=>{ const A=['好。','（他在紙上「誰都」「誰也」的下面，又寫了一行：兩個人。）'], P='（星期五晚上，秋假前的聚餐。何俊朗拿著盤子，一桌一桌問人「誰都」和「誰也」哪裡不一樣。沒有人答得出來。）';
  check('1-10. 稿裡有「'+A[1]+'」「'+P+'」',inDoc('何俊朗：好。')&&inDoc('旁白：'+A[1])&&inDoc(P));
  fresh('2028-10-04',20,'us_outside',{MET_LONG:true}); const a=await play('ev_usl_long3',[0]), i=a.indexOf('我們廣東話……算了，廣東話更麻煩。');
  check('1-10. 何俊朗 3 選「那我們兩個去。」：「好。」＋旁白「（他在紙上「誰都」「誰也」的下面，又寫了一行：兩個人。）」（不是「兩個人，就不是誰都，也不是誰也了。」）',i>0&&J(a.slice(i+1))===J(A)&&H.said[i+1].who==='何俊朗'&&H.said[i+2].who===null&&H.G.flags.LONG_BBQ===true,J(a.slice(i)));
  fresh('2028-10-06',20.5,'us_outside',{MET_LONG:true}); const p=await play('ev_usl_party');
  check('1-10. 10/6 秋假前的聚餐：旁白開頭「星期五晚上，」（隔天早上補演也讀得出日子）',J(p)===J([P]),J(p)); });

/* ======================= 1-11 何俊朗 3 的行程什麼時候排 ======================= */
await sec('1-11',async()=>{
  fresh('2028-08-14',9.8,'us_apartment'); rules(); H.picks=[0]; H.said=[]; await OUT.go(GM,OUT.get(H.G,'usl_long1')); rules(); const met=H.G.flags.MET_LONG===true, a=OUT.get(H.G,'usl_long3');
  check('1-11. 8/14 迎新演完（MET_LONG）：沒有排 10/4 會所自習室（原本 8/14 就跳「排進行程：10/4（三）20:00 會所自習室」）',met&&!a,J({met,a}));
  const seen={}; for(const k of ['2028-09-08','2028-09-27','2028-10-02']){ at(k,23.5); rules(); seen[k]=!!OUT.get(H.G,'usl_long3'); }
  at('2028-10-03',0.25); rules(); const q=OUT.get(H.G,'usl_long3');
  check('1-11. 10/2 以前都沒排；前一天（10/3）才排：10/4 20:00 會所自習室',!Object.values(seen).some(Boolean)&&!!q&&q.state==='planned'&&q.day===D('2028-10-04')&&q.h===20&&q.title==='會所自習室',J({seen,q}));
  /* 快轉跨過 10/3：跳的每一步跑手機規則，排好以後停在出發前 */
  const G=fresh('2028-09-30',21,'us_apartment',{US2:'repair',MET_LONG:true}); rules(); const why=await USL.jump(GM,T(D('2028-10-07'),8.5)), qq=OUT.get(G,'usl_long3');
  check('1-11. 挽回中 9/30 21:00 快轉一週：10/3 排進去、停在 10/4 19:45（出發前 15 分鐘）',why==='out'&&!!qq&&CALENDAR.dateOf(G.day).key==='2028-10-04'&&Math.abs(G.hour-19.75)<1e-6,J({why,d:CALENDAR.dateOf(G.day).key,h:G.hour}));
});

H.done();
})();
