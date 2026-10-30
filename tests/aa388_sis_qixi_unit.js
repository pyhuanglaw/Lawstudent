// AA_388（企劃線 3a509150；任務 SIS-QIXI-L-1023）：學姊第五批——交往中的七夕（三年）。不需要瀏覽器。
// 使用者 10-21 22:5x（經 AA）：「學姊才是真正的女主角」。台詞一字照稿（D100、D109）。
// 照 AA_388 第 3 節第 4 點（給 BB 的測試）寫：
//   0 讀稿（每一句台詞、選項、地點字幕都在稿裡）、新檔、index.html 接線、劇情匯入白名單、事件不是 once、goto 都有 label
//   1 2026-08-19 交往中：8/17 21:00 邀約 → 19:00 溫州街・定食店演 1-1 → SIS_QIXI[2026] met；中間那個回覆（「妳會過七夕喔？」）＝答應、排出遊；回「那天不行。」不排出遊、關係不扣；沒回、沒到＝missed
//   2 2026 她照作息不在臺北（absentDates）：改 1-3 的視訊版（8/18 21:00 約、8/19 21:00 視訊），拿掉「我這邊是早上。你那邊是七夕。」
//   3 2027-08-08：去年一起過（met）＝8/6 四則照稿；沒有＝第一則換成「七夕。去年你在幹嘛？」（回了以後後面三則照舊）；研究室門口 1-2
//   4 2028-08-26：美國路線＝8/25 17:00 以後在美國的公寓／社區／C 棟 208 當面一句 → 8/26 09:00 週六市集（美國的快轉停在 8/25 17:00）；其他路線＝8/25 21:00 私訊 → 8/26 21:00 視訊；沒接＝21:30「你在忙。那我先去圖書館了。」
//   5 沒在交往：三年都沒有；和可昕交往中：只有可昕的七夕
//   關係（第 2 節）：當面＝熟悉 +3、自在 +6、她的戀愛 +5、這學期的裂縫 -1；視訊＝+2／+3／+3；不進 dateLog
// 修改前（開發分支 17b2c7a8）：沒有 src/data/sis_qixi_events.js、src/sis_qixi3d.js（大多 FAIL）。用法：node tests/aa388_sis_qixi_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H;
const load=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); return true; };
/* 美國那一學期（USL：人在美國、快轉）、可昕的七夕（R2Y3A）照 index.html 的順序先載入 */
const okDeps=['src/data/msg_pool.js','src/data/msg2_pool.js','src/data/msg_kx_y0.js','src/msg3d.js','src/data/hometown_lines.js','src/data/needed_msgs.js','src/exchange3d.js','src/data/us_layouts.js','src/y34b3d.js',
  'src/data/r2y3a_events.js','src/r2y3a3d.js','src/data/r2y4a_events.js','src/r2y4a3d.js','src/data/us_life_events.js','src/us_life3d.js','src/data/sis_y2y3_events.js','src/sis_y2y3_3d.js','src/data/sis_b4_events.js','src/sis_b4_3d.js'].map(load).every(x=>x);
const ok1=load('src/data/sis_qixi_events.js'), ok2=load('src/sis_qixi3d.js');
const PATH='docs/story_planning/AA_388_學姊第五批_七夕.md';
let doc=''; try{ doc=cp.execSync('git show 3a509150:"'+PATH+'"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc=''; }
let doc479=''; try{ doc479=cp.execSync('git show 02428913b:"docs/story_planning/AA_479_美國交換逐日劇本讀後_交往中第三版.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc479=''; }   /* AA_479 第 2 點（10-27）：美國版「宿舍門口」→「社區門口」，新句在 AA_479 */
const inDoc=t=>doc.indexOf(t)>=0||(t==='明天早上九點，我在社區門口等你。這邊週六有市集。'&&doc479.indexOf('社區門口')>=0);
const J=JSON.stringify, ID='heroine_05', X=()=>typeof SISQX!=='undefined'?SISQX:null;
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const T=(d,h)=>d*24+h;
const setup=(key,h,zone,lv,flags)=>{ const G=H.fresh(key,h,zone||'dorm',Object.assign({met_sis:true,SIS_W1:true},flags||{})); if(lv) H[lv](ID); G.contacts=G.contacts||{}; G.contacts[ID]=G.day-30; G.outings=[]; G.msgs=[]; if(STORY._bindGM) STORY._bindGM(GM); return G; };
const rules=()=>{ const x=X(); if(x) x.phone(H.G); PHONE.tick(H.G); };
const at=(key,h)=>{ const G=H.G; G.day=H.D(key); G.hour=h; const w=CALENDAR.dateOf(G.day).wd; G.weekday=w===7?0:w; };
const dms=()=>H.msgs('p:'+ID);
const said=()=>H.said.map(s=>s.t);
const play=async(id,picks)=>{ H.said=[]; H.opts=[]; H.bgs=[]; H.picks=(picks||[]).slice(); await EVENTS.run(ev(id)); return said(); };
const dateSis=()=>{ H.G.flags['dating_'+ID]=true; ROM.get(H.G,ID).status='dating'; };
const relOf=()=>Object.assign({},SOCIAL.rel(ID));
const dRel=(a,b)=>{ const o={}; for(const k of ['fam','trust','comf','npcRom','rom']) if((b[k]|0)!==(a[k]|0)) o[k]=(b[k]|0)-(a[k]|0); return J(o); };
const QX=y=>{ const R=H.G.flags.SIS_QIXI; return R&&typeof R==='object'&&R[y]!=null?R[y]:null; };
const logN=()=>(H.G.dateLog&&H.G.dateLog[ID]&&H.G.dateLog[ID].count)|0;
const US=f=>Object.assign({EXCHANGE_ROUTE:'US',EXCH_RULE:1,US_DEPARTED:true,US_ARRIVED:true,US_ARRIVED_DAY:H.D('2028-08-02'),US1:'together',Y4_PATH:'bar',Y4_PATH_DAY:H.D('2028-06-08')},f||{});
const VDAY=J({fam:3,comf:6,npcRom:5}), CALL=J({fam:2,comf:3,npcRom:3});
const L11=['（店裡只有兩桌客人。她已經坐在靠牆的位子，菜單沒有翻開。）','這家今天不會客滿。我查過了。','鯖魚。你呢？','好。兩份鯖魚。','（吃到一半，她問你暑假在做什麼，你講了，她聽得很認真。）','我九月開學。研究室的位子已經分好了，靠門。','……開學以後，平日晚上我大概都在那裡。','七點以後。七點以前我不理人。','（巷口的花店門口擺了一排包好的玫瑰。她看了一眼，沒有停。）'];
const L12=['（八點零五分，她從研究室出來，手上拿著一疊印好的稿子。）','第三節寫完了。……第二節被我刪了一半。','（你們坐在法律系館A門口的台階上吃便當。暑假的晚上，校園裡沒什麼人。）','算。刪掉的那一半本來就不該寫。','明年八月，我就在美國了。','（她把便當盒蓋起來，收進袋子裡。）','走吧。我送你到路口。'];
const L13=['（週六早上的市集，攤子上堆著桃子和玉米。）','這邊沒有七夕。','臺灣那邊快過完了。……我早上算過時差。','（她挑了兩顆桃子，捏了一下，放回去一顆。）','這邊的七夕是什麼？','買桃子。','……好。那就買桃子。'];
const LV=['我這邊是早上。你那邊是七夕。','我剛起來。頭髮很亂，不要截圖。','……我說了不要。','（她把鏡頭轉到窗外）','好，你截這個。','十二月我就回去了。','（她那邊有人在敲門。她說室友要出門，掛掉以前，對著鏡頭揮了一下手。）'];
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（中斷這一節）',false,String(e&&e.stack||e).slice(0,300)); } };
(async()=>{
  /* ======================= 0 讀稿、接線 ======================= */
  check('0. 讀稿（企劃線 3a509150 AA_388：三年的表、第 2 節關係、第 3 節給 LAWWW、BB）',doc.length>3000&&inDoc('## 1. 三年的七夕：她在哪裡')&&inDoc('熟悉 +3、自在 +6、她的戀愛 +5')&&inDoc('`ev_sis_qixi`（不是 once'));
  check('0. 現有的模組載得到（USL、R2Y3A、SISB4）',okDeps&&typeof USL!=='undefined'&&typeof R2Y3A!=='undefined'&&typeof SISB4!=='undefined');
  check('0. 新檔載得到：SISQX、SISQX_LINES、SISQX_EVENTS（ev_sis_qixi＋美國路線 8/25 當面約 ev_sis_qixi_us_ask）',ok1&&ok2&&!!X()&&typeof SISQX_LINES!=='undefined'&&Array.isArray(typeof SISQX_EVENTS!=='undefined'?SISQX_EVENTS:null)&&!!ev('ev_sis_qixi')&&!!ev('ev_sis_qixi_us_ask'),J({ok1,ok2}));
  await sec('0',async()=>{
  { const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
    check('0. index.html：sis_qixi_events.js、sis_qixi3d.js 接在 sis_b4_3d.js 後面（?v= 照舊；中間可以是 AA_414 的 an_yt_hol、AA_416 的 fest 兩組檔）',/src\/sis_b4_3d\.js\?v=([^"]+)"><\/script>\n(?:<script src="src\/(?:data\/an_yt_hol_events|an_yt_hol3d|data\/fest_events|fest3d)\.js\?v=\1"><\/script>\n)*<script src="src\/data\/sis_qixi_events\.js\?v=\1"><\/script>\n<script src="src\/sis_qixi3d\.js\?v=\1"><\/script>/.test(html)); }
  { const A=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')), f=(A.files||[]).find(x=>x.path===PATH);
    check('0. 劇情匯入白名單：AA_388 @3a509150 approved（AA-B 2026-10-23 07:0x 交付 DL-AA388-QIXI）、task SIS-QIXI-L-1023、kind text',!!f&&f.sha==='3a509150'&&f.status==='approved'&&/AA-B 2026-10-23 07:0x/.test(f.approvedBy||'')&&/DL-AA388-QIXI/.test(f.approvedBy||'')&&f.task==='SIS-QIXI-L-1023'&&f.kind==='text',J(f)); }
  { const e=ev('ev_sis_qixi');
    check('0. ev_sis_qixi 不是 once（每年同一個 id）、出遊（trigger outing）',!e.once&&e.trigger==='outing'&&Array.isArray(e.participants)&&e.participants[0]===ID); }
  { const bad=[]; const T_=t=>{ if(typeof t==='string'&&!inDoc(t)) bad.push(t); };
    const walk=v=>{ if(typeof v==='string') T_(v); else if(Array.isArray(v)) v.forEach(walk); else if(v&&typeof v==='object') Object.values(v).forEach(walk); };
    for(const k in SISQX_LINES) walk(SISQX_LINES[k]);
    for(const e of SISQX_EVENTS) for(const l of e.dialogue){ if(l.text!==undefined) T_(l.text); if(l.scene!==undefined) T_(l.scene); for(const c of (l.choice||[])) T_(c.text.replace(/^「(.*)」$/,'$1')); }
    check('0. 每一句台詞、私訊、回覆、選項、地點字幕都在稿裡（一字不差）',!bad.length,J(bad)); }
  { const labels=[]; for(const e of SISQX_EVENTS){ const L=new Set(e.dialogue.filter(l=>l.label).map(l=>l.label)); for(const l of e.dialogue){ if(l.goto&&!L.has(l.goto)) labels.push(e.id+':'+l.goto); for(const c of (l.choice||[])) if(c.goto&&!L.has(c.goto)) labels.push(e.id+':'+c.goto); } }
    check('0. 每一個 goto 都有 label',!labels.length,J(labels)); }
  });

  /* ======================= 1 2026-08-19 溫州街・定食店 ======================= */
  await sec('1',async()=>{
  { setup('2026-08-17',20,'dorm','FRIEND'); dateSis(); rules(); const a=dms().length; at('2026-08-17',21.05); rules(); const m=PHONE.byAsk(H.G,'sisqx_2026_ask');
    check('1-1. 2026-08-17（一）21:00 私訊「後天七夕。」「我想去溫州街那家定食。七點。」；回覆「好。」「妳會過七夕喔？」「那天不行。」（20:00 還沒有）',a===0&&J(dms())===J(['後天七夕。','我想去溫州街那家定食。七點。'])&&!!m&&J(m.ask.opts.map(o=>o.t))===J(['好。','妳會過七夕喔？','那天不行。']),J({a,d:dms()}));
    PHONE.answer(H.G,'sisqx_2026_ask',0); rules(); const q=OUT.get(H.G,'sisqx_2026');
    check('1-1. 「好。」＝8/19（三）19:00 溫州街・定食店（出遊、不算正式校外約會）',!!q&&q.day===H.D('2026-08-19')&&q.h===19&&q.ev==='ev_sis_qixi'&&/定食/.test(q.place||'')&&!q.dateTrip&&q.alarm===true,J(q));
    at('2026-08-19',19); H.G.flags.SIS_CRACK=2; const c0=logN(), r0=relOf(); const L=await play('ev_sis_qixi',[0,0]); const r1=relOf();
    check('1-1. 定食店：靠牆的位子、「這家今天不會客滿。我查過了。」「鯖魚。你呢？」；「跟妳一樣。」→「好。兩份鯖魚。」；研究室的位子；「那我去研究室找妳。」→「七點以後。七點以前我不理人。」；巷口的玫瑰',
      J(L)===J(L11)&&J(H.opts)===J([['「跟妳一樣。」','「薑汁燒肉。」'],['「那我去研究室找妳。」','「週末呢？」']]),J({L,O:H.opts}));
    check('1-1. SIS_QIXI[2026] met；節日 熟悉 +3、自在 +6、她的戀愛 +5、裂縫 -1（2→1）；不進 dateLog',QX(2026)==='met'&&dRel(r0,r1)===VDAY&&H.G.flags.SIS_CRACK===1&&logN()===c0,dRel(r0,r1)+' crack '+H.G.flags.SIS_CRACK+' '+J(H.G.flags.SIS_QIXI));
    check('1-1. 1-1 的地點字幕「溫州街・定食店」（定食店裡面沒有 2D 底圖：深色底）',H.bgs.includes('dark')); }
  { setup('2026-08-17',21.05,'dorm','FRIEND'); dateSis(); rules(); PHONE.answer(H.G,'sisqx_2026_ask',1); rules(); const q=OUT.get(H.G,'sisqx_2026');
    check('1-1. 「妳會過七夕喔？」→她回「不太會。所以今年試試看。」，照答應排 19:00 定食店（中間那個選項照稿意＝答應）',J(dms().slice(-2))===J(['妳會過七夕喔？','不太會。所以今年試試看。'])&&!!q&&q.h===19,J({d:dms(),q}));
    at('2026-08-19',19); const L=await play('ev_sis_qixi',[1,1]);
    check('1-1. 「薑汁燒肉。」→「那我吃你一片。」；「週末呢？」→「週末空著。……先跟你說，免得你自己猜。」',L[3]==='那我吃你一片。'&&L[7]==='週末空著。……先跟你說，免得你自己猜。'&&!L.includes('好。兩份鯖魚。')&&!L.includes('七點以後。七點以前我不理人。'),J(L)); }
  { setup('2026-08-17',21.05,'dorm','FRIEND'); dateSis(); rules(); const r0=relOf(), c0=H.G.flags.SIS_CRACK; PHONE.answer(H.G,'sisqx_2026_ask',2); rules(); const a=dms().slice(-1)[0], q=OUT.get(H.G,'sisqx_2026'); at('2026-08-19',21); rules(); const r1=relOf();
    check('1-1. 「那天不行。」→「好。」、不排出遊、記 declined；關係不扣、8/19 沒有其他訊息',a==='好。'&&!q&&QX(2026)==='declined'&&dRel(r0,r1)===J({})&&H.G.flags.SIS_CRACK===c0&&dms().length===4,J({a,q,f:H.G.flags.SIS_QIXI,d:dms()})); }
  { setup('2026-08-17',21.05,'dorm','FRIEND'); dateSis(); rules(); const r0=relOf(); at('2026-08-19',19.3); rules(); const nr=QX(2026), nq=OUT.get(H.G,'sisqx_2026'), r1=relOf();
    setup('2026-08-17',21.05,'dorm','FRIEND'); dateSis(); rules(); PHONE.answer(H.G,'sisqx_2026_ask',0); rules(); at('2026-08-19',19.5); for(const q of OUT.expire(H.G)) OUT.onMissed(GM,q); rules();
    check('1-1. 沒回（過了 19:00）＝missed、不排出遊；說好了沒到＝missed；都不扣關係',nr==='missed'&&!nq&&dRel(r0,r1)===J({})&&QX(2026)==='missed',J({nr,f:H.G.flags.SIS_QIXI})); }
  { setup('2026-08-19',9,'dorm','FRIEND'); dateSis(); rules(); at('2026-08-19',21.05); rules();
    check('1-1. 那一天晚兩天以上才跑手機規則（8/19 才讀到）：不補邀約',!dms().length&&!PHONE.sent(H.G,'sisqx_2026_ask')); }
  });

  /* ======================= 2 2026 她不在臺北：視訊版 ======================= */
  await sec('2',async()=>{
  const P5=CHARACTERS[ID].presence, AD0=P5.absentDates.slice(); P5.absentDates=AD0.concat([['2026-08-15','2026-08-24','測試：不在臺北','home']]);   /* [前置] 假設那年她照作息不在臺北 */
  try{
    setup('2026-08-17',21.05,'dorm','FRIEND'); dateSis(); rules(); const a=dms().length, mode=X().mode(H.G,2026); at('2026-08-18',21.05); rules(); const q=OUT.get(H.G,'sisqx_2026v');
    check('2. 2026 她不在臺北：8/17 沒有定食店的約；8/18 21:00「明天你那邊晚上九點，我視訊給你。」→ 8/19 21:00 視訊（接起來）',a===0&&mode==='video'&&J(dms())===J(['明天你那邊晚上九點，我視訊給你。'])&&!OUT.get(H.G,'sisqx_2026')&&!!q&&q.day===H.D('2026-08-19')&&q.h===21&&q.verb==='接起來'&&q.place==='視訊'&&q.ev==='ev_sis_qixi',J({a,mode,d:dms(),q}));
    at('2026-08-19',21); H.G.flags.SIS_CRACK=2; const r0=relOf(); const L=await play('ev_sis_qixi',[0]); const r1=relOf();
    check('2. 視訊版拿掉「我這邊是早上。你那邊是七夕。」，其他照 1-3 視訊版',J(L)===J(LV.slice(1))&&H.bgs.some(b=>b&&b.image==='assets/bg/video.webp'),J(L));
    check('2. SIS_QIXI[2026] video；電話那一場 熟悉 +2、自在 +3、她的戀愛 +3；裂縫不動',QX(2026)==='video'&&dRel(r0,r1)===CALL&&H.G.flags.SIS_CRACK===2,dRel(r0,r1));
  } finally { P5.absentDates=AD0; }
  });

  /* ======================= 3 2027-08-08 霖澤館・研究室門口 ======================= */
  await sec('3',async()=>{
  { setup('2027-08-06',20,'dorm','FRIEND',{SIS_QIXI:{2026:'met'}}); dateSis(); rules(); const a=dms().length; at('2027-08-06',21.05); rules(); const m=PHONE.byAsk(H.G,'sisqx_2027_ask');
    check('1-2. 2027-08-06（五）21:00（去年一起過）：「週日七夕。」「我那天在研究室寫到八點。」「你可以八點來接我。」「晚餐你帶。」；回覆「好，我帶。」「要吃什麼？」「那天不行。」',a===0&&J(dms())===J(['週日七夕。','我那天在研究室寫到八點。','你可以八點來接我。','晚餐你帶。'])&&!!m&&J(m.ask.opts.map(o=>o.t))===J(['好，我帶。','要吃什麼？','那天不行。']),J(dms()));
    PHONE.answer(H.G,'sisqx_2027_ask',1); rules(); const q=OUT.get(H.G,'sisqx_2027');
    check('1-2. 「要吃什麼？」→「你決定。不要太油。」、照答應排 8/8（日）20:00 法律系館A・研究室門口',dms().slice(-1)[0]==='你決定。不要太油。'&&!!q&&q.day===H.D('2027-08-08')&&q.h===20&&q.ev==='ev_sis_qixi'&&/法律系館A/.test(q.place||''),J({d:dms(),q}));
    at('2027-08-08',20); H.G.flags.SIS_CRACK=1; const c0=logN(), r0=relOf(); const L=await play('ev_sis_qixi',[0]); const r1=relOf();
    check('1-2. 研究室門口（法律系館A前的底圖）：八點零五分、「第三節寫完了。……第二節被我刪了一半。」、台階上吃便當；「刪了一半還算寫完嗎？」→「算。刪掉的那一半本來就不該寫。」；「明年八月，我就在美國了。」收便當、「走吧。我送你到路口。」',
      J(L)===J(L12)&&J(H.opts[0])===J(['「刪了一半還算寫完嗎？」','（把她的稿子拿過來看）'])&&H.bgs.some(b=>b&&b.image==='assets/bg/ntu_linze.webp'),J({L,O:H.opts,bgs:H.bgs}));
    check('1-2. SIS_QIXI[2027] met（2026 那筆還在）；+3／+6／+5、裂縫 1→0；不進 dateLog',QX(2027)==='met'&&QX(2026)==='met'&&dRel(r0,r1)===VDAY&&H.G.flags.SIS_CRACK===0&&logN()===c0,dRel(r0,r1)+' '+J(H.G.flags.SIS_QIXI)); }
  { setup('2027-08-06',21.05,'dorm','FRIEND'); dateSis(); rules(); const first=dms().slice(), m0=PHONE.byAsk(H.G,'sisqx_2027_last'), main0=PHONE.byAsk(H.G,'sisqx_2027_ask');
    check('1-2. 去年沒一起過（SIS_QIXI[2026] 不是 met）：第一則換成「七夕。去年你在幹嘛？」，回覆「不記得了。」「妳呢？」；還沒回以前後面三則不來',J(first)===J(['七夕。去年你在幹嘛？'])&&!!m0&&J(m0.ask.opts.map(o=>o.t))===J(['不記得了。','妳呢？'])&&!main0,J({first}));
    PHONE.answer(H.G,'sisqx_2027_last',1); rules(); const m=PHONE.byAsk(H.G,'sisqx_2027_ask');
    check('1-2. 「妳呢？」→「讀書。」，後面照舊：「我那天在研究室寫到八點。」「你可以八點來接我。」「晚餐你帶。」＋三個回覆',J(dms())===J(['七夕。去年你在幹嘛？','妳呢？','讀書。','我那天在研究室寫到八點。','你可以八點來接我。','晚餐你帶。'])&&!!m&&J(m.ask.opts.map(o=>o.t))===J(['好，我帶。','要吃什麼？','那天不行。']),J(dms()));
    PHONE.answer(H.G,'sisqx_2027_ask',0); rules(); const q=OUT.get(H.G,'sisqx_2027'); at('2027-08-08',20); const L=await play('ev_sis_qixi',[1]);
    check('1-2. 「好，我帶。」排 20:00；「（把她的稿子拿過來看）」→「不要看第七頁。……你已經在看第七頁了。」，後面照舊',!!q&&q.h===20&&L[3]==='不要看第七頁。……你已經在看第七頁了。'&&J(L.slice(4))===J(L12.slice(4))&&QX(2027)==='met',J(L)); }
  { setup('2027-08-06',21.05,'dorm','FRIEND',{SIS_QIXI:{2026:'declined'}}); dateSis(); rules(); PHONE.answer(H.G,'sisqx_2027_last',0); rules(); const d1=dms().slice();
    const r0=relOf(); PHONE.answer(H.G,'sisqx_2027_ask',2); rules(); const a=dms().slice(-1)[0], q=OUT.get(H.G,'sisqx_2027'), r1=relOf();
    check('1-2. 2026 回過不行（declined）也是去年沒一起過；「不記得了。」沒有她的回話、接著三則；「那天不行。」→「好。那我寫到十點。」、不排、記 declined、不扣關係',J(d1)===J(['七夕。去年你在幹嘛？','不記得了。','我那天在研究室寫到八點。','你可以八點來接我。','晚餐你帶。'])&&a==='好。那我寫到十點。'&&!q&&QX(2027)==='declined'&&dRel(r0,r1)===J({}),J({d1,a,f:H.G.flags.SIS_QIXI})); }
  { setup('2027-08-06',21.05,'dorm','FRIEND'); dateSis(); rules(); at('2027-08-08',20.2); rules();
    check('1-2. 第一則也沒回、過了 20:00＝missed',QX(2027)==='missed'&&!OUT.get(H.G,'sisqx_2027'),J(H.G.flags.SIS_QIXI)); }
  });

  /* ======================= 4 2028-08-26 她在美國 ======================= */
  await sec('4',async()=>{
  const E1=ev('ev_sis_qixi_us_ask');
  { setup('2028-08-25',16.5,'us_apartment','CLOSE',US()); dateSis(); const c0=EVENTS.check(E1); at('2028-08-24',18); const c1=EVENTS.check(E1); at('2028-08-25',17.5); const c2=EVENTS.check(E1);
    const z=[]; for(const zn of ['us_outside','us_shared','us_lawlib','us_campus']){ H.G.zone=zn; z.push(EVENTS.check(E1)); } H.G.zone='us_apartment';
    rules(); const noDm=dms().length===0;
    check('1-3 美國. 8/25（五）17:00 以後、人在美國的公寓、社區、C 棟 208＝當面約；16:30、8/24、法學院圖書館／校園不演；沒有私訊',c0===false&&c1===false&&c2===true&&J(z)===J([true,true,false,false])&&noDm,J({c0,c1,c2,z}));
    const L=await play('ev_sis_qixi_us_ask'); const q=OUT.get(H.G,'sisqx_2028');
    check('1-3 美國. 她一句「明天早上九點，我在社區門口等你。這邊週六有市集。」→ 排 8/26（六）09:00（出遊、不算正式校外約會）',J(L)===J(['明天早上九點，我在社區門口等你。這邊週六有市集。'])&&!!q&&q.day===H.D('2028-08-26')&&q.h===9&&q.ev==='ev_sis_qixi'&&!q.dateTrip&&!EVENTS.check(E1),J({L,q}));
    at('2028-08-26',9); H.G.flags.SIS_CRACK=1; const c00=logN(), r0=relOf(); const L2=await play('ev_sis_qixi',[0]); const r1=relOf();
    check('1-3 美國. 週六市集（美國篇沒有市集的圖：先用校園底圖＝小教堂前的台階）：桃子和玉米、「這邊沒有七夕。」；「那我們過這邊的。」→「這邊的七夕是什麼？」祐廷「買桃子。」「……好。那就買桃子。」',
      J(L2)===J(L13)&&J(H.opts[0])===J(['「那我們過這邊的。」','「妳想家嗎？」'])&&H.bgs.some(b=>b&&b.image==='assets/bg/us_chapel_steps.webp')&&H.said[5].who!==null&&H.said[5].who!=='溫書瑀',J({L2,O:H.opts,bgs:H.bgs}));
    check('1-3 美國. SIS_QIXI[2028] met；+3／+6／+5、裂縫 1→0；不進 dateLog',QX(2028)==='met'&&dRel(r0,r1)===VDAY&&H.G.flags.SIS_CRACK===0&&logN()===c00,dRel(r0,r1)); }
  { setup('2028-08-26',9,'us_apartment','CLOSE',US()); dateSis(); const L=await play('ev_sis_qixi',[1]);
    check('1-3 美國. 「妳想家嗎？」→「有一點。昨天打給我媽，講了一個小時。」',L[L.length-1]==='有一點。昨天打給我媽，講了一個小時。'&&!L.includes('買桃子。'),J(L)); }
  { setup('2028-08-24',22,'us_apartment','CLOSE',US()); dateSis(); const d=H.D('2028-08-25'); const a=USL.nextStop(H.G,T(d,8)), b=USL.nextStop(H.G,T(d,17.5));
    setup('2028-08-24',22,'us_apartment','CLOSE',US()); const c=USL.nextStop(H.G,T(d,8));
    check('1-3 美國. 美國的快轉（到下一個有事的時候）停在 8/25 17:00（交往中）；過了 17:00、沒交往不停在那裡',a===T(d,17)&&b!==T(d,17)&&c!==T(d,17),J({a,b,c,want:T(d,17)})); }
  { setup('2028-08-26',9.5,'us_apartment','CLOSE',US()); dateSis(); H.G.day=H.D('2028-08-25'); H.G.hour=18; const r0=relOf(); await play('ev_sis_qixi_us_ask'); at('2028-08-26',9.5); for(const q of OUT.expire(H.G)) OUT.onMissed(GM,q); rules(); const r1=relOf();
    check('1-3 美國. 說好了沒到＝missed、沒有私訊、不扣關係',QX(2028)==='missed'&&!dms().length&&dRel(r0,r1)===J({}),J(H.G.flags.SIS_QIXI)); }
  /* 其他路線：視訊 */
  { setup('2028-08-25',20,'dorm','CLOSE',{EXCHANGE_ROUTE:'TW'}); dateSis(); rules(); const a=dms().length; at('2028-08-25',21.05); rules(); const q=OUT.get(H.G,'sisqx_2028v');
    check('1-3 臺灣路線. 8/25（五）21:00「明天你那邊晚上九點，我視訊給你。」→ 8/26（六）21:00 視訊（接起來；她那邊早上 8:00）；沒有當面那一場',a===0&&J(dms())===J(['明天你那邊晚上九點，我視訊給你。'])&&!!q&&q.day===H.D('2028-08-26')&&q.h===21&&q.verb==='接起來'&&q.place==='視訊'&&q.ev==='ev_sis_qixi'&&!OUT.get(H.G,'sisqx_2028'),J({a,d:dms(),q}));
    H.G.zone='dorm'; at('2028-08-25',21.5); const c=EVENTS.check(E1);
    at('2028-08-26',21); H.G.flags.SIS_CRACK=1; const r0=relOf(); const L=await play('ev_sis_qixi',[0]); const r1=relOf();
    check('1-3 臺灣路線. 視訊：「我這邊是早上。你那邊是七夕。」「我剛起來。頭髮很亂，不要截圖。」；「（截圖）」→「……我說了不要。」（她把鏡頭轉到窗外）「好，你截這個。」；「十二月我就回去了。」敲門、揮手',
      J(L)===J(LV)&&J(H.opts[0])===J(['（截圖）','「妳那邊天氣好嗎？」'])&&H.bgs.some(b=>b&&b.image==='assets/bg/video.webp')&&c===false,J({L,O:H.opts,c}));
    check('1-3 臺灣路線. SIS_QIXI[2028] video；+2／+3／+3；裂縫不動',QX(2028)==='video'&&dRel(r0,r1)===CALL&&H.G.flags.SIS_CRACK===1,dRel(r0,r1));
    at('2028-08-26',21.6); rules(); check('1-3 臺灣路線. 接了：21:30 沒有「你在忙。那我先去圖書館了。」',!dms().includes('你在忙。那我先去圖書館了。')); }
  { setup('2028-08-25',21.05,'dorm','CLOSE',{EXCHANGE_ROUTE:'JP'}); dateSis(); rules(); const q=OUT.get(H.G,'sisqx_2028v'); const L=await (async()=>{ at('2028-08-26',21); return play('ev_sis_qixi',[1]); })();
    check('1-3 日本路線（8/5 已經回臺灣）. 一樣是視訊；「妳那邊天氣好嗎？」→「很好，二十幾度。早上有點涼。」',!!q&&q.h===21&&L[2]==='很好，二十幾度。早上有點涼。'&&L[3]==='十二月我就回去了。',J({q,L})); }
  { setup('2028-08-25',21.05,'dorm','CLOSE',{EXCHANGE_ROUTE:'TW'}); dateSis(); rules(); const r0=relOf(); at('2028-08-26',21.1); const q=OUT.get(H.G,'sisqx_2028v'); q.state='missed'; OUT.onMissed(GM,q); rules(); const early=dms().slice(-1)[0]; at('2028-08-26',21.55); rules(); const r1=relOf();
    check('1-3 臺灣路線. 先不接：記 missed；21:30 她傳「你在忙。那我先去圖書館了。」（21:30 以前沒有）；不扣關係',QX(2028)==='missed'&&early==='明天你那邊晚上九點，我視訊給你。'&&dms().slice(-1)[0]==='你在忙。那我先去圖書館了。'&&dRel(r0,r1)===J({}),J({early,d:dms(),f:H.G.flags.SIS_QIXI}));
    setup('2028-08-25',21.05,'dorm','CLOSE',{EXCHANGE_ROUTE:'TW'}); dateSis(); rules(); at('2028-08-26',21.6); for(const x of OUT.expire(H.G)) OUT.onMissed(GM,x); rules();
    check('1-3 臺灣路線. 沒接（過了 21:30）：記 missed、那一則',QX(2028)==='missed'&&dms().slice(-1)[0]==='你在忙。那我先去圖書館了。'&&dms().filter(t=>t==='你在忙。那我先去圖書館了。').length===1,J({d:dms()})); }
  });

  /* ======================= 5 沒在交往、和可昕交往中 ======================= */
  await sec('5',async()=>{
  const none=()=>!dms().length&&!['sisqx_2026','sisqx_2026v','sisqx_2027','sisqx_2028','sisqx_2028v'].some(id=>OUT.get(H.G,id));
  const runYears=(prep,us)=>{ const r=[];
    for(const [k,h] of [['2026-08-17',21.05],['2026-08-18',21.05],['2027-08-06',21.05],['2028-08-25',21.05]]){ setup(k,h,'dorm','CLOSE',{EXCHANGE_ROUTE:'TW'}); prep(); rules(); r.push(none()); }
    setup('2028-08-25',18,'us_apartment','CLOSE',US()); prep(); rules(); r.push(none()&&!EVENTS.check(ev('ev_sis_qixi_us_ask'))); return r; };
  { const r=runYears(()=>{});
    check('5. 沒在交往（親近也一樣）：2026、2027、2028（臺灣、美國）都沒有私訊、出遊、當面約',r.every(x=>x),J(r)); }
  { const r=runYears(()=>{ dateSis(); ROM.end(H.G,ID,'apart_talk'); });
    check('5. 交往過、現在分開了：三年都沒有',r.every(x=>x),J(r)); }
  { const r=runYears(()=>{ dateSis(); H.G.flags.met_sis=false; });
    check('5. 還沒認識她（met_sis 沒有）：三年都沒有',r.every(x=>x),J(r)); }
  { setup('2026-08-12',12,'dorm','CLOSE'); H.G.flags.dating_kexin=true; ROM.get(H.G,'kexin').status='dating'; R2Y3A.qixiPhone(H.G); at('2026-08-17',21.05); rules(); const kx=OUT.get(H.G,'kx_qixi_2026'), sis=none();
    setup('2026-08-17',21.05,'dorm','CLOSE'); H.G.flags.dating_kexin=true; ROM.get(H.G,'kexin').status='dating'; dateSis(); rules(); const both=none();
    check('5. 和可昕交往中：只有可昕的七夕（2026-08-19 21:00 她的視訊），沒有學姊的；同時也在和學姊交往一樣只有可昕的',!!kx&&kx.h===21&&sis&&both,J({kx,sis,both})); }
  { setup('2026-08-17',21.05,'dorm','CLOSE'); dateSis(); H.G.contacts[ID]=H.G.day; rules();
    check('5. 她的聯絡方式是當天才拿到的（前一天以前沒有）：不傳（同 SISB4；開場的聯絡方式 contacts0 本來就有她）',!dms().length); }
  });
  H.done(); })().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });
