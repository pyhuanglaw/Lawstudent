// AA_424 美國篇的空白日（AA-B 2026-10-23 19:0x，企劃線 355980037；回 BB_301）——不需要瀏覽器。台詞逐字對 AA_424：每一句都直接寫在這裡比對（不從程式讀）。
//   0 接線：index.html（us208_3d.js 後面兩行）、事件、掛勾、記憶的面板名稱
//   G 第 1 節 挽回中的週六 10:00 交換生群組 16 則：逐字、三個回法（群組＝REPAIR +1、私訊＝已讀不回不加、不回＝沒有）、之後別人接的那一句（何俊朗見過他才有）、
//     一週最多 +1（和芝加哥的邀約合起來算）、12/2 前回滿三週到得了 REPAIR ≥ 3、照片 9/16 起、11/11 只有沒去芝加哥、12/9 重新交往也有但不加、交往中沒有、舊存檔太舊的不補
//   S 第 3 節 交往中開學前的週六：前一天 21:00 私訊、「好。」排行程／「明天不行。」→「好。」、三場逐字＋記憶、竹葉／圖書館用 3D（模糊）、說話框「書瑀」；挽回中沒有；9/13 以後沒有
//   L 第 3-4 節 9/9 洗衣間：上午選「洗衣服」才演、只看看＝AA_287 的字、平常洗衣服 40 分鐘、快轉停 9/9 11:00；AA_412 3-2 多一句（有 US_ASIAN_MARKET）
//   F 第 2 節 秋假：交往中沒有大峽谷 10/9 私訊 → 10/10 湖邊；大峽谷去了／等出發＝沒有；挽回中 10/12 自習室（第一個選項才記、不加 REPAIR）；六張日期卡（快轉、到時間）
//   O 第 4 節 8/15 迎新週：第一次出門／快轉跳過才演；何俊朗見過才有；交往中多一句
//   C 第 5 節 11/11 交往中沒有去芝加哥：日期卡＋21:00 私訊（她不回）
// 修改前（開發分支 473fdb29f）：沒有 src/us_blank3d.js——全部 FAIL。用法：node tests/aa424_us_blank_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const H=require('./pg_harness.js');
const ROOT=H.ROOT, {check,GM,E}=H, J=JSON.stringify, S5='heroine_05';
global.Z3={ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
const EXPORT=/^(EXCH|US3|US_\w+|AIRPORT_T2_LAYOUT|Y34B|R2Y3B|R2Y3B_EVENTS|R2Y4A|R2Y4A_EVENTS|USL|US_LIFE_EVENTS|US208|ROM|PORTRAIT_ONLY)$/;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>EXPORT.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
const loadErr=[];
for(const f of ['src/exchange3d.js','src/data/us_layouts.js','src/us3d.js','src/y34b3d.js','src/data/r2y3b_events.js','src/r2y3b3d.js','src/data/r2y4a_events.js','src/r2y4a3d.js','src/data/us_life_events.js','src/us_life3d.js','src/us208_3d.js','src/data/us_blank_lines.js','src/us_blank3d.js']){
  if(!fs.existsSync(path.join(ROOT,f))){ loadErr.push(f+'：沒有這個檔'); continue; } try{ load(f); }catch(e){ loadErr.push(f+'：'+e.message); } }
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const D=k=>STORY.dayOfKey(k), T=(d,h)=>d*24+h;
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const capt=[]; GM.caption=(a,b)=>{ capt.push(b); };
const toasts=[]; GM.toast=t=>{ toasts.push(t); };
GM.spawnCharacter=(id,x,z,o)=>{ const n={id,charId:id,obj:{position:{x,y:0,z},rotation:{y:0}},seat:(o&&o.seat)||null,pose:(o&&o.pose)||'idle'}; GM.npc[id]=n; return n; }; GM.removeNPC=id=>{ delete GM.npc[id]; };
GM.studySession=async()=>{};
const US=f=>Object.assign({EXCHANGE_ROUTE:'US',EXCH_RULE:1,US_DEPARTED:true,US_ARRIVED:true,US_ARRIVED_DAY:D('2028-08-02'),US1:'together',Y4_PATH:'bar',Y4_PATH_DAY:D('2028-06-08')},f||{});
const fresh=(key,h,zone,flags)=>{ const G=H.fresh(key,h,zone||'us_apartment',US(flags)); G.contacts=G.contacts||{}; G.msgs=G.msgs||[]; G.visited=G.visited||{}; G.vac=G.vac||{reg:{}}; ROM.rec(G); capt.length=0; toasts.length=0; E.player.busy=false; E.paused=false;
  SOCIAL.remember(S5,'FIRST_MET',''); PHONE.join(G,'us_exchange','交換生'); return G; };
const dateSis=()=>{ const G=H.G; G.flags.dating_heroine_05=true; G.flags.CALLED_SHUYU=true; const r=ROM.get(G,S5); r.status='dating'; };
const at=(key,h)=>{ const G=H.G; G.day=D(key); G.hour=h; G.weekday=wdOf(G.day); };
const rules=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const byTag=tag=>(H.G.msgs||[]).filter(m=>m.tag===tag);
const th=t=>(H.G.msgs||[]).filter(m=>m.th===t);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const L=()=>H.lines(), said=()=>H.said.map(s=>s.t);
const rep=()=>((H.G.flags.REPAIR||{})[S5]|0);
const ans=(id,k)=>PHONE.answer(H.G,id,k);
const settle=async()=>{ for(let i=0;i<50&&US_BLANK.isBusy&&US_BLANK.isBusy();i++) await new Promise(r=>setTimeout(r,0)); };
const go=async id=>{ const q=OUT.get(H.G,id); H.said=[]; H.opts=[]; H.entered=[]; H.bgs=[]; await OUT.go(GM,q); return q; };
const DM='（私訊她）……妳最近好嗎？';

(async()=>{
/* ======================= 0 接線 ======================= */
await sec(0,()=>{ const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
  check('0. 美國篇的檔案都載得到（含 src/data/us_blank_lines.js、src/us_blank3d.js）',!loadErr.length,loadErr.join('；'));
  check('0. index.html：us_blank_lines.js、us_blank3d.js 接在 us208_3d.js 後面',/src\/us208_3d\.js\?v=[^"]+"><\/script>\n<script src="src\/data\/us_blank_lines\.js\?v=[^"]+"><\/script>\n<script src="src\/us_blank3d\.js\?v=[^"]+"><\/script>/.test(html));
  const ids=['ev_usb_fb_lake','ev_usb_fb_study','ev_usb_asian','ev_usb_lake_dog','ev_usb_syllabus','ev_usb_laundry','ev_usb_orient'];
  check('0. 七個事件在 STORY_EVENTS；US_BLANK 掛在手機規則、TICKS、OUT.STAGE；USL 的 sumDue／tick／jump／club／nextStop 包了一層',typeof US_BLANK!=='undefined'&&ids.every(id=>!!ev(id))&&USL._usbSum&&USL._usbJump&&USL._usbClub&&USL._usbStop&&OUT._usbStage&&STORY._usbInteract,ids.filter(id=>!ev(id)).join(' '));
  const ML=SOCIAL.MEMORY_LABEL; check('0. 六個新記憶都有面板名稱',['US_FALLBREAK_LAKE','US_FALLBREAK_STUDY','US_ASIAN_MARKET','US_LAKE_DOG','US_SYLLABUS','US_LAUNDRY'].every(k=>ML[k]&&/[一-鿿]/.test(ML[k]))); });
if(typeof US_BLANK==='undefined'||!US_BLANK.GRP){ H.done(); return; }

/* ======================= G 第 1 節 交換生群組 ======================= */
const GRP=[
  ['2028-08-05',['社區巴士週末的班次比較少。下午那班要早點到站牌。'],'謝謝。差點錯過。',[]],
  ['2028-08-12',['竹葉亞洲超市週日公休。醬油有，冰糖沒有。'],'冰糖去哪裡買？',[],'網路上有。很貴。'],
  ['2028-08-19',['法學院圖書館迎新週也開。三樓靠窗那排有插座。'],'收到。',[]],
  ['2028-08-26',['開學第一週的閱讀很多。先讀每一份的開頭和結尾。'],'好。我試試看。',[]],
  ['2028-09-09',['Legal Writing 的教授改得很細。交之前，大聲念一次。'],'念完就知道哪裡卡了。',[':（她按了一個讚。）']],
  ['2028-09-16',['📷（湖邊的步道，起了霧）','早上的湖。'],'好漂亮。',[]],
  ['2028-09-23',['C 棟的烘衣機，濾網要自己清。不清會烘不乾。'],'我上次就烘不乾。',['heroine_05:我也是。']],
  ['2028-09-30',['市場街週六早上有農夫市集。蘋果很便宜。'],'下禮拜六去看看。',[]],
  ['2028-10-07',['秋假圖書館只開到下午五點。'],'謝謝提醒。',[]],
  ['2028-10-14',['📷（法學院前面的樹，葉子紅了一半）','開始變了。'],'臺灣看不到這個。',['heroine_05:嗯。']],
  ['2028-10-21',['期中報告的格式，教授在課程網站上改過了。看最新的那一版。'],'還好有看到。',[]],
  ['2028-10-28',['萬聖節晚上社區有小孩來敲門。糖果放門口就好。'],'我去買糖。',[],'我買了，買太多。'],
  ['2028-11-04',['冬令時間明天開始。手機會自己改，烤箱的時鐘不會。'],'我的烤箱已經錯了。',[':（她按了一個讚。）']],
  ['2028-11-11',['📷（芝加哥的河，一座接一座的橋）','風很大。'],'看起來很冷。',[]],
  ['2028-11-18',['感恩節那週，圖書館休館。書要先借。'],'謝謝，我去借。',[]],
  ['2028-12-09',['期末考週，會所自習室開到半夜。'],'那裡見。',[':（她已讀了。）']] ];
const gtag=k=>'usb_grp_'+k.slice(5,7)+k.slice(8,10);
await sec('G',async()=>{
  check('G0. 16 個週六、日期照 AA_424 第 1 節的表（每一天都是週六）',J(US_BLANK.GRP.map(r=>r.d))===J(GRP.map(r=>r[0]))&&GRP.every(r=>wdOf(D(r[0]))===6));
  let okAll=true, bad=[];
  for(const [k,post,reply,after,long] of GRP){
    const G=fresh(k,9.75,'us_apartment',{US2:'repair',MET_LONG:true}); if(k==='2028-11-11') G.flags.US_CHICAGO='missed';
    rules(); const early=byTag(gtag(k)).length; at(k,10); rules();
    const M=byTag(gtag(k)), last=M[M.length-1];
    const ok1=early===0&&J(M.map(m=>m.th+'|'+m.from+'|'+m.text))===J(post.map(t=>'g:us_exchange|heroine_05|'+t))&&M.every(m=>m.h===10&&m.day===D(k))&&last&&last.ask&&J(last.ask.opts.map(o=>o.t))===J([reply,DM,'（不回）']);
    const r0=rep(); ans(gtag(k),0); rules();
    const T0=th('g:us_exchange'), i=T0.findIndex(m=>m.from==='player'), tail=T0.slice(i).map(m=>(m.from||'')+':'+m.text);
    const want=['player:'+reply].concat(after).concat(long?['npc_long:'+long]:[]);
    const ok2=J(tail)===J(want)&&rep()===r0+1&&(H.G.flags.REPAIR_LOG||[]).some(q=>q.why===gtag(k).replace('usb_grp_','us_grp_'));
    if(!(ok1&&ok2)){ okAll=false; bad.push(k+' '+J({early,M:M.map(m=>m.text),opts:last&&last.ask&&last.ask.opts.map(o=>o.t),tail,rep:rep()})); } }
  check('G1. 16 則逐字（當地週六 10:00、照片＝兩則）、三個回法的按鈕、在群組回＝玩家那一句＋之後那一句（何俊朗見過他才有）、REPAIR +1',okAll,bad.join('｜'));
  check('G1b. 照片 9/16 起才有（8 月只傳資訊）',GRP.filter(r=>r[1].some(t=>/📷/.test(t))).every(r=>D(r[0])>=D('2028-09-16'))&&GRP.filter(r=>D(r[0])<D('2028-09-01')).every(r=>!r[1].some(t=>/📷/.test(t)))&&US_BLANK.GRP.filter(r=>r.post.some(t=>/📷/.test(t))).map(r=>r.d).join()==='2028-09-16,2028-10-14,2028-11-11');
  /* 何俊朗沒見過：不接 */
  { const G=fresh('2028-10-28',10,'us_apartment',{US2:'repair'}); rules(); ans(gtag('2028-10-28'),0); rules();
    check('G2. 沒見過何俊朗：10/28 回了，群組裡沒有他那一句（照樣 REPAIR +1）',!th('g:us_exchange').some(m=>m.from==='npc_long')&&rep()===1,J(th('g:us_exchange').map(m=>m.text)));
    const G2=fresh('2028-08-12',10,'us_apartment',{US2:'repair'}); rules(); at('2028-08-14',20); G2.flags.MET_LONG=true; ans(gtag('2028-08-12'),0); rules();
    check('G2b. 8/12 那一則 8/14 見過何俊朗以後才回：他接「網路上有。很貴。」（回的當下看）',th('g:us_exchange').some(m=>m.from==='npc_long'&&m.name==='何俊朗'&&m.text==='網路上有。很貴。')); }
  /* 私訊她、不回 */
  { const G=fresh('2028-09-23',10,'us_apartment',{US2:'repair'}); rules(); ans(gtag('2028-09-23'),1); rules();
    const P=th('p:'+S5);
    check('G3. （私訊她）＝私訊串裡玩家「……妳最近好嗎？」、她沒有回（已讀不回）、群組裡沒有玩家的話、不加 REPAIR',J(P.map(m=>m.from+':'+m.text))===J(['player:……妳最近好嗎？'])&&!th('g:us_exchange').some(m=>m.from==='player')&&rep()===0&&G.flags.USB_GRP_0923==='dm',J(P.map(m=>m.text)));
    const G2=fresh('2028-09-23',10,'us_apartment',{US2:'repair'}); rules(); const n0=G2.msgs.length; ans(gtag('2028-09-23'),2); rules();
    check('G3b. （不回）＝什麼都沒傳、不加；這一則不能再回',G2.msgs.length===n0&&rep()===0&&G2.flags.USB_GRP_0923==='none'&&!PHONE.askOpen(G2,byTag(gtag('2028-09-23')).slice(-1)[0])); }
  /* 一週最多 +1（和其他來源合起來算） */
  { const G=fresh('2028-08-05',10,'us_apartment',{US2:'repair'}); rules(); ans(gtag('2028-08-05'),0); rules(); const a=rep();
    at('2028-08-12',10); rules(); ans(gtag('2028-08-12'),0); rules(); const b=rep();
    check('G4. 8/5 當週回（第 1 週）+1、8/12 當週回（第 2 週）再 +1',a===1&&b===2,J([a,b]));
    const G2=fresh('2028-08-12',10,'us_apartment',{US2:'repair'}); at('2028-08-11',10); rules(); at('2028-08-12',10); rules();   /* 8/5 那一則開到 8/12 10:00 */
    ans(gtag('2028-08-12'),0); rules(); const c=rep(); ans(gtag('2028-08-05'),0); rules(); const d=rep();
    check('G4b. 同一週回兩則（8/12 當天回 8/12、再回 8/5 那一則）：第二則不加',c===1&&d===1&&R2Y4A.repairWeek(G2)==='R2',J([c,d,R2Y4A.repairWeek(G2)]));
    const G3=fresh('2028-11-03',21,'us_apartment',{US2:'repair'}); R2Y4A.repairAdd(G3,'chicago_reply'); const e0=rep(); at('2028-11-04',10); rules(); ans(gtag('2028-11-04'),0); rules();
    check('G4c. 11/3 芝加哥的邀約回了（同一週，第 14 週）：11/4 在群組回不再加',e0===1&&rep()===1&&R2Y4A.repairWeek(G3)==='R14',J([e0,rep(),R2Y4A.repairWeek(G3)]));
    const G4=fresh('2028-09-09',10,'us_apartment',{US2:'repair'}); for(const k of ['2028-09-09','2028-09-16','2028-09-23']){ at(k,10); rules(); ans(gtag(k),0); rules(); }
    check('G4d. 12/2 初雪前回滿三週（9/9、9/16、9/23）：REPAIR 3、條件到得了（R2Y4A.repairOK）',rep()===3&&R2Y4A.repairOK(G4),String(rep())); }
  /* 交往中沒有；12/9 重新交往的有、不加 */
  { const G=fresh('2028-08-05',10,'us_apartment',{US2:'dating'}); dateSis(); let n=0; for(const [k] of GRP){ at(k,10.5); rules(); n+=byTag(gtag(k)).length; }
    check('G5. 交往中（一直交往）：16 個週六都沒有群組那一則（12/9 也沒有）',n===0,String(n));
    const G2=fresh('2028-12-09',10,'us_apartment',{US2:'repair',US_RESTART:D('2028-12-02')}); dateSis(); rules();
    const M=byTag(gtag('2028-12-09')); ans(gtag('2028-12-09'),0); rules();
    check('G5b. 12/2 初雪重新交往：12/9 那一則照樣在群組；回「那裡見。」＝（她已讀了。），不加 REPAIR，不排行程',M.length===1&&M[0].text==='期末考週，會所自習室開到半夜。'&&rep()===0&&th('g:us_exchange').slice(-2).map(m=>m.text).join('|')==='那裡見。|（她已讀了。）'&&!OUT.rec(G2).some(q=>/usb/.test(q.id)),J([M.length,rep()])); }
  /* 11/11 */
  { for(const [v,want] of [['missed',1],['went',0],[undefined,0]]){ const G=fresh('2028-11-11',10,'us_apartment',{US2:'repair'}); if(v) G.flags.US_CHICAGO=v; G.flags.US_CHI=v==='went'?'go':undefined; rules();
      check('G6. 11/11 挽回中：US_CHICAGO='+v+' → '+(want?'有':'沒有')+'群組那一則（她去了芝加哥，玩家沒有去才有）',byTag(gtag('2028-11-11')).length===(want?2:0)); } }
  /* 舊存檔：太舊的不補；一週以內照原本的時間補 */
  { const G=fresh('2028-10-20',12,'us_apartment',{US2:'repair'}); rules();
    check('G7. 舊存檔 10/20 讀回來：10/14 那一則補在 10/14 10:00；10/7 那一則（超過一週）不補',byTag(gtag('2028-10-14')).length===2&&byTag(gtag('2028-10-14'))[0].day===D('2028-10-14')&&byTag(gtag('2028-10-07')).length===0);
    const G2=H.fresh('2028-10-20',12,'us_apartment',US({US2:'repair'})); G2.msgs=G2.msgs||[]; delete G2.flags.USB_REC; let err=null; try{ rules(); }catch(e){ err=e; }
    check('G7b. 沒有 USB_REC 的舊存檔照跑、不丟例外（群組是 R2Y4A 補加的）',!err&&PHONE.inGroup(G2,'us_exchange'),String(err)); }
});

/* ======================= S 第 3 節 交往中開學前的週六 ======================= */
const SATS=[
  ['2028-08-11','2028-08-12',15,'明天去竹葉。你幫我提。','usb_sat_0812','ev_usb_asian','us_asian_market'],
  ['2028-08-18','2028-08-19',16,'學期還沒開始。明天去湖邊走走。','usb_sat_0819','ev_usb_lake_dog',null],
  ['2028-08-25','2028-08-26',14,'明天下午圖書館。課表拿來。','usb_sat_0826','ev_usb_syllabus','us_lawlib'] ];
const SCN={
  ev_usb_asian:{lines:['（貨架很窄。她拿起一包八角，看了很久，放進籃子。）','醬油有。冰糖沒有。','……那就以後再說。'],opts:['「妳要煮什麼？」','「籃子給我。」'],a:['還沒決定。先買。'],b:['好。','（她把籃子交給你，又拿了一包米粉。）'],mem:'US_ASIAN_MARKET',scene:'竹葉亞洲超市'},
  ev_usb_lake_dog:{lines:['（湖邊的步道上，有人在遛狗。）','這裡的狗都很大。','……我小時候很怕狗。'],opts:['「現在呢？」','（陪她站著）'],a:['現在只怕大的。'],b:['（一隻大狗經過。她往你這邊靠了一點。）'],mem:'US_LAKE_DOG',scene:'湖邊'},
  ev_usb_syllabus:{lines:['（開學後的第一個週六。一樓中庭的長桌，她把每一門課的 syllabus 攤在桌上。）','第一週的閱讀很多。','你的也拿來。一起排。'],opts:['「好。」','「我自己排。」'],a:['（她在計畫本後面多畫了一頁格子，寫上你的名字。）'],b:['好。排好給我看。'],mem:'US_SYLLABUS',scene:'法學院圖書館'},
  ev_usb_fb_lake:{lines:['（秋假的校園沒什麼人。湖邊的長椅，只有你們兩個。）','好久沒有一個下午不用讀書。','（她把計畫本放在膝上，沒有打開。）'],opts:['「那今天不讀。」','「要不要走一圈？」'],a:['嗯。今天不讀。','（她把計畫本收進包包。）'],b:['好。走慢一點。'],mem:'US_FALLBREAK_LAKE',scene:'湖邊'} };
await sec('S',async()=>{
  for(const [ka,kd,h,msg,tag,evid,zone] of SATS){
    const G=fresh(ka,20.75,'us_apartment',{US2:'dating',MET_LONG:true}); dateSis(); rules(); const early=byTag(tag).length; at(ka,21); rules(); const M=byTag(tag);
    check('S1. '+kd+'：前一天 21:00 她私訊「'+msg+'」、回覆「好。」／「明天不行。」',early===0&&M.length===1&&M[0].th==='p:'+S5&&M[0].from===S5&&M[0].text===msg&&M[0].h===21&&J(M[0].ask.opts.map(o=>o.t))===J(['好。','明天不行。'])&&PHONE.who(M[0])==='書瑀',J(M.map(m=>[m.text,m.h,PHONE.who(m)])));
    ans(tag,0); rules(); const q=OUT.get(G,tag);
    check('S2. '+kd+'：「好。」→ 行事曆 '+kd+' '+h+':00（'+(q&&q.place)+'）',!!q&&q.state==='planned'&&q.day===D(kd)&&q.h===h&&q.ev===evid);
    const S=SCN[evid];
    for(const [k,br] of [[0,'a'],[1,'b']]){ const G2=fresh(kd,h-0.5,'us_apartment',{US2:'dating'}); dateSis(); G2.flags['USB_SAT_'+kd.slice(5,7)+kd.slice(8,10)]='go'; rules(); H.picks=[k]; await go(tag);
      const nm=H.said.filter(s=>S.lines.includes(s.t)&&s.who).map(s=>s.who);
      check('S3. '+evid+' 選「'+S.opts[k]+'」：台詞逐字、記 '+S.mem+'、她的說話框寫「書瑀」',J(said())===J(S.lines.concat(S[br]))&&J(H.opts[0])===J(S.opts)&&SOCIAL.has(S5,S.mem)&&nm.length>0&&nm.every(w=>w==='書瑀'),J(L()));
      if(k===0) check('S4. '+evid+'：'+(zone?'演之前換到 3D 的 '+zone+'（畫面模糊）、演完回到公寓':'2D 湖邊（us_lake 的圖）'),zone?(H.entered[0]===zone&&H.entered[H.entered.length-1]==='us_apartment'&&H.bgs.includes('blur')&&capt.includes(S.scene)):(H.bgs.some(b=>b&&b.image==='assets/bg/us_lake.webp')&&!H.entered.length),J({e:H.entered,b:H.bgs})); }
    const G3=fresh(ka,21,'us_apartment',{US2:'dating'}); dateSis(); rules(); ans(tag,1); rules();
    check('S5. '+kd+'：「明天不行。」→ 書瑀「好。」、不排行程',J(th('p:'+S5).slice(-2).map(m=>m.from+':'+m.text))===J(['player:明天不行。','heroine_05:好。'])&&!OUT.get(G3,tag));
    const G4=fresh(ka,21.5,'us_apartment',{US2:'repair'}); rules(); check('S6. '+kd+'：挽回中沒有這個邀約',byTag(tag).length===0); }
  { const S=SCN.ev_usb_asian; const G=fresh('2028-08-12',14.5,'us_apartment',{US2:'dating'}); dateSis(); G.flags.USB_SAT_0812='go'; rules(); E.zone.seats=[]; await go('usb_sat_0812');
    check('S7. 竹葉：她站在你前面（3D，GM.npc 有學姊）',H.entered[0]==='us_asian_market'); }
});

/* ======================= L 第 3-4 節 9/9 她來借洗衣機（AA_424 第 7-1 節，a4ee6c74a：每一戶自己有洗衣機）、AA_412 3-2 ======================= */
const LAUNDRY=['（門鈴響了。她抱著一袋衣服站在門口。）','室友的衣服在我們那台裡面，放了兩天。','……借一下你的。','（洗衣機轉著。她坐在你的沙發上看書。）','還要一陣子。'];
const DOOR={x:-0.65,z:2.4,radius:0.75,lv:0,label:'洗衣機',look:'洗衣機和烘衣機疊在一起。'};
await sec('L',async()=>{
  for(const [k,opt,tail] of [[0,'「要喝什麼？」',['水就好。']],[1,'（坐到她旁邊）',['（烘衣機停了。她沒有馬上站起來。）']]]){
    const G=fresh('2028-09-09',10,'us_apartment',{US2:'dating'}); dateSis(); at('2028-09-09',10.5); rules();
    const m=(G.msgs||[]).find(x=>x.th==='p:'+S5&&x.text==='你在家嗎？'); check('L0. 9/9 10:30 交往中：她私訊「你在家嗎？」（在。／不在。）',!!m&&J(m.ask.opts.map(o=>o.t))===J(['在。','不在。']),J(m));
    ans('usb_laundry_ask',0); rules(); const q=OUT.get(G,'usb_laundry'); check('L0. 「在。」＝11:00 排「她來借洗衣機」（214）',!!q&&q.h===11&&q.ev==='ev_usb_laundry',J(q));
    at('2028-09-09',10.95); H.picks=[k]; await go('usb_laundry');
    check('L1. 9/9 11:00 在 214（'+opt+'）：台詞逐字、記 US_LAUNDRY',J(said().slice(0,LAUNDRY.length))===J(LAUNDRY)&&J(said().slice(LAUNDRY.length))===J(tail)&&SOCIAL.has(S5,'US_LAUNDRY'),J(L())); }
  { const G=fresh('2028-09-09',10,'us_apartment',{US2:'dating'}); dateSis(); at('2028-09-09',10.5); rules(); ans('usb_laundry_ask',1); rules();
    check('L2. 「不在。」＝她「好。我等她們。」、不演',(G.msgs||[]).some(x=>x.from===S5&&x.text==='好。我等她們。')&&!OUT.get(G,'usb_laundry')); }
  for(const [k,h,dt,why] of [['2028-09-09',13,true,'9/9 下午'],['2028-09-09',10,false,'挽回中'],['2028-09-16',10,true,'9/16']]){
    const G=fresh(k,h,'us_apartment',{US2:dt?'dating':'repair'}); if(dt) dateSis(); H.picks=[0]; H.said=[]; await STORY.interact(DOOR,GM);
    check('L3. '+why+'：公寓「洗衣機」的「洗衣服」只是洗衣服（40 分鐘、衣服洗好了），不演',!H.said.length&&!SOCIAL.has(S5,'US_LAUNDRY')&&Math.abs(G.hour-(h+40/60))<1e-6&&toasts.includes('衣服洗好了。')); }
  { const G=fresh('2028-09-08',22,'us_apartment',{US2:'dating'}); dateSis();
    const a=USL.nextStop(G,T(D('2028-09-08'),22)); G.events.done.ev_usb_laundry=1; const b=USL.nextStop(G,T(D('2028-09-08'),22));
    const G2=fresh('2028-09-08',22,'us_apartment',{US2:'repair'}); const c=USL.nextStop(G2,T(D('2028-09-08'),22));
    check('L4. 快轉：交往中 9/9 10:30 停（她的私訊；演過就不停）；挽回中不停在那裡',a===T(D('2028-09-09'),10.5)&&b!==a&&c!==T(D('2028-09-09'),10.5),J([a,b,c].map(x=>x==null?null:[CALENDAR.dateOf(Math.floor(x/24)).key,x%24]))); }
  /* AA_412 3-2 */
  { const lurou=['（還沒進門就聞到了。醬油、八角，還有一點焦味。）','亞洲超市買得到八角。冰糖沒有，我用一般的糖。'];
    const G=fresh('2028-09-23',15,'us_shared',{US2:'dating'}); dateSis(); SOCIAL.remember(S5,'US_ASIAN_MARKET',''); H.picks=[0]; H.said=[]; await EVENTS.run(ev('ev_us208_lurou'),{noTitle:true});
    const a=said().slice(0,3);
    const G2=fresh('2028-09-23',15,'us_shared',{US2:'dating'}); dateSis(); H.picks=[0]; H.said=[]; await EVENTS.run(ev('ev_us208_lurou'),{noTitle:true});
    check('L5. AA_412 3-2 滷肉：有 US_ASIAN_MARKET 的，開頭（第一句旁白後面）多「（你認得那包八角。）」；沒有的照舊',J(a)===J([lurou[0],'（你認得那包八角。）',lurou[1]])&&J(said().slice(0,2))===J(lurou),J([a,said().slice(0,2)])); }
});

/* ======================= F 第 2 節 秋假 ======================= */
const CARD={d9:'（秋假第一天。社區的停車場空了一半，很多人開車出去玩了。）',d12:'（她白天在圖書館，你也去了。秋假的閱覽室，一整排只有你們。）',d13:'（秋假最後一天。社區停車場的車，一輛一輛開回來了。）',
  r9:'（秋假第一天。交換生群組裡，大家在傳公路旅行的照片。）',r10:'（圖書館五點關門。你走回社區的時候，天還很亮。）',r13:'（秋假最後一天。社區停車場的車，一輛一輛開回來了。）'};
const cardsFor=(G,k0,k1)=>USL.sumDue(G,T(D(k0),0),T(D(k1),23.9)).map(s=>s.d.slice(5)+' '+USL.sumLine(G,s));
await sec('F',async()=>{
  { const G=fresh('2028-10-09',20.75,'us_apartment',{US2:'dating'}); dateSis(); rules(); const e=byTag('usb_sat_1010').length; at('2028-10-09',21); rules(); const M=byTag('usb_sat_1010');
    check('F1. 交往中、沒有大峽谷：10/9 21:00 書瑀「明天圖書館五點就關。下午要不要去湖邊。」、「好。」／「明天不行。」',e===0&&M.length===1&&M[0].text==='明天圖書館五點就關。下午要不要去湖邊。'&&J(M[0].ask.opts.map(o=>o.t))===J(['好。','明天不行。']));
    ans('usb_sat_1010',0); rules(); const q=OUT.get(G,'usb_sat_1010');
    check('F2. 「好。」→ 10/10（二）14:00 湖邊',!!q&&q.day===D('2028-10-10')&&q.h===14&&q.ev==='ev_usb_fb_lake'&&wdOf(q.day)===2);
    const S=SCN.ev_usb_fb_lake;
    for(const [k,br] of [[0,'a'],[1,'b']]){ const G2=fresh('2028-10-10',13.5,'us_apartment',{US2:'dating'}); dateSis(); G2.flags.USB_SAT_1010='go'; rules(); H.picks=[k]; await go('usb_sat_1010');
      check('F3. 秋假的湖邊選「'+S.opts[k]+'」：逐字、us_lake、記 US_FALLBREAK_LAKE、不加數值',J(said())===J(S.lines.concat(S[br]))&&J(H.opts[0])===J(S.opts)&&H.bgs.some(b=>b&&b.image==='assets/bg/us_lake.webp')&&SOCIAL.has(S5,'US_FALLBREAK_LAKE')&&!(G2.flags.REPAIR&&G2.flags.REPAIR[S5]),J(L())); }
    const G3=fresh('2028-10-09',21,'us_apartment',{US2:'dating'}); dateSis(); rules(); ans('usb_sat_1010',1); rules();
    check('F4. 「明天不行。」→「好。」（這一場不演）',th('p:'+S5).slice(-1)[0].text==='好。'&&!OUT.get(G3,'usb_sat_1010')); }
  { const G=fresh('2028-10-09',21,'us_apartment',{US2:'dating',US_CANYON:true}); dateSis(); rules(); const a=byTag('usb_sat_1010').length, ca=cardsFor(G,'2028-10-09','2028-10-13');
    const G2=fresh('2028-10-06',21,'us_apartment',{US2:'dating'}); dateSis(); OUT.plan(G2,{id:'y4_us_canyon',ev:'ev_us_canyon',day:D('2028-10-07'),h:6,late:1,must:true,place:'社區門口',title:'秋假：大峽谷',travel:'',travelH:0}); const b=US_BLANK.noCanyon(G2);
    at('2028-10-09',21); const c=US_BLANK.noCanyon(G2); rules(); const d=byTag('usb_sat_1010').length;
    check('F5. 大峽谷去了（US_CANYON）：沒有 10/9 的私訊、沒有交往中的日期卡；約了大峽谷還在等出發＝不算「沒有大峽谷」，10/7 06:00 沒去成（過了時間）才算',a===0&&!ca.length&&b===false&&c===true&&d===1,J({a,ca,b,c,d})); }
  /* 日期卡 */
  { const G=fresh('2028-10-08',22,'us_apartment',{US2:'dating'}); dateSis(); const cd=cardsFor(G,'2028-10-09','2028-10-13');
    const G2=fresh('2028-10-08',22,'us_apartment',{US2:'repair'}); const cr=cardsFor(G2,'2028-10-09','2028-10-13');
    check('F6. 日期卡（交往中沒有大峽谷）：10/9、10/12、10/13 三張逐字（10/10 是湖邊那天，沒有卡）',J(cd)===J(['10-09 '+CARD.d9,'10-12 '+CARD.d12,'10-13 '+CARD.d13]),J(cd));
    check('F7. 日期卡（挽回中）：10/9、10/10、10/13 三張逐字（10/12 是自習室那天，沒有卡）',J(cr)===J(['10-09 '+CARD.r9,'10-10 '+CARD.r10,'10-13 '+CARD.r13]),J(cr)); }
  { const G=fresh('2028-10-08',22,'us_apartment',{US2:'repair'}); rules(); H.cards=[]; await USL.jump(GM,T(D('2028-10-14'),8)); const c1=H.cards.map(c=>c[1]), at1=[G.day,G.hour];
    H.cards=[]; await USL.jump(GM,T(D('2028-10-14'),8)); const c2=H.cards.map(c=>c[1]);
    check('F8. 挽回中快轉 10/8 → 10/14：先停在 10/12 19:30（自習室），日期卡 10/9、10/10；再快轉出 10/13',at1[0]===D('2028-10-12')&&Math.abs(at1[1]-19.5)<1e-6&&J(c1)===J([CARD.r9,CARD.r10,'公寓'])&&J(c2)===J([CARD.r13,'公寓']),J({at1,c1,c2})); }
  { const G=fresh('2028-10-12',16.9,'us_apartment',{US2:'dating'}); dateSis(); USL.tick(GM,0.5); const a=capt.slice(); at('2028-10-12',17); USL.tick(GM,0.5); const b=capt.slice(); USL.tick(GM,0.5);
    const G2=fresh('2028-10-12',17.5,'us_apartment',{US2:'repair'}); USL.tick(GM,0.5);
    check('F9. 沒跳過的那天到時間出一次（10/12 17:00 交往中）；挽回中那天沒有卡',!a.includes(CARD.d12)&&b.filter(t=>t===CARD.d12).length===1&&capt.filter(t=>t===CARD.d12).length===0&&!capt.some(t=>Object.values(CARD).includes(t)),J({a,b,c:capt})); }
  /* 挽回中 10/12 自習室 */
  const STUDY=['（秋假的自習室只有兩個人。她坐在最裡面那張桌子。）','……你也沒有出去。'];
  for(const [k,tail,mem] of [[0,['嗯。','（她把桌上的書往旁邊推了一點，空出一格。）'],true],[1,['……那你等。我要讀書。'],false]]){
    const G=fresh('2028-10-12',19.5,'us_outside',{US2:'repair',MET_LONG:true}); H.picks=[0,k,0]; H.said=[]; H.opts=[]; H.bgs=[]; await USL.club(GM);
    const s=said(), i=s.indexOf(STUDY[0]);
    check('F10. 挽回中 10/12 19:30 會所→「讀書」＝秋假的自習室（選第 '+(k+1)+' 個）：逐字、'+(mem?'記':'不記')+' US_FALLBREAK_STUDY、不加 REPAIR、說話框不是「書瑀」、何俊朗不在',i>0&&J(s.slice(i))===J(STUDY.concat(tail))&&J(H.opts[1])===J(['「沒有。我留下來讀書。」','「我在等妳跟我說話。」'])&&SOCIAL.has(S5,'US_FALLBREAK_STUDY')===mem&&rep()===0&&H.said.filter(q=>STUDY.includes(q.t)&&q.who).every(q=>q.who!=='書瑀')&&!H.said.some(q=>q.who==='何俊朗')&&H.bgs.some(b=>b&&b.image==='assets/bg/us_club_study.webp'),J(L())); }
  for(const [k,h,dt,why] of [['2028-10-12',18.5,false,'18:30（她還沒到）'],['2028-10-12',19.5,true,'交往中'],['2028-10-10',19.5,false,'10/10（週二：只有 10/12 那一晚）']]){
    const G=fresh(k,h,'us_outside',{US2:dt?'dating':'repair'}); if(dt) dateSis(); const due=US_BLANK.studyDue(G);
    check('F11. '+why+'：不演秋假的自習室',due===false,String(due)); }
});

/* ======================= O 第 4 節 8/15 迎新週 ======================= */
const OR=['（八月十五日，迎新週第二天：學生證、健康保險、選課確認。每一個櫃台前面都是隊伍。）','銀行那條最慢。我排了一個早上。','（那天傍晚，你在法學院圖書館門口等她。她出來的時候，手上拿著新的學生證，照片拍得很嚴肅。）'];   /* AA_450 1-3 */
await sec('O',async()=>{
  for(const [dt,long,want] of [[true,true,[0,1,2]],[false,true,[0,1]],[false,false,[0]],[true,false,[0,2]]]){
    const G=fresh('2028-08-15',9,'us_apartment',{US2:dt?'dating':'repair'}); if(dt) dateSis(); if(long) G.flags.MET_LONG=true;
    const a=US_BLANK.orientDue(G); G.zone='us_outside'; const b=US_BLANK.orientDue(G); H.said=[]; const started=US_BLANK.tick(GM); await settle();
    check('O1. 8/15 '+(dt?'交往中':'挽回中')+(long?'、見過何俊朗':'')+'：在公寓不演、第一次出門演；逐字',!a&&b&&started===true&&J(H.lines())===J(want.map(i=>(i===1?'何俊朗：':'')+OR[i]))&&US_BLANK.orientDone(G)&&!US_BLANK.orientDue(G),J(H.lines())); }
  { const G=fresh('2028-08-16',9,'us_outside',{US2:'repair'}); const a=US_BLANK.orientDue(G); at('2028-08-14',9); const b=US_BLANK.orientDue(G);
    check('O2. 8/14、8/16 出門不演',!a&&!b); }
  { const G=fresh('2028-08-14',22,'us_apartment',{US2:'repair'}); rules(); await USL.jump(GM,T(D('2028-08-17'),8.5)); const a=!!G.flags.USB_ORIENT_DUE, d=G.day; H.said=[]; US_BLANK.tick(GM); await settle();
    check('O3. 快轉跳過 8/15（8/14 → '+CALENDAR.dateOf(d).key+'）：跳完在公寓演那一段摘要',a&&said()[0]===OR[0]&&US_BLANK.orientDone(G),J({a,d:CALENDAR.dateOf(d).key,s:said()}));
    const G2=fresh('2028-08-14',22,'us_apartment',{US2:'repair'}); rules(); await USL.jump(GM,T(D('2028-08-15'),12));
    check('O4. 快轉停在 8/15 中午（那天還沒過）：不先演，等出門',!G2.flags.USB_ORIENT_DUE&&!US_BLANK.orientDue(G2)); }
});

/* ======================= C 第 5 節 11/11 沒有去芝加哥 ======================= */
await sec('C',async()=>{
  { const G=fresh('2028-11-11',20.75,'us_apartment',{US2:'dating',US_CHICAGO:'missed'}); dateSis(); rules(); const e=byTag('usb_chi_1111').length; at('2028-11-11',21); rules(); const M=byTag('usb_chi_1111');
    check('C1. 交往中、11/3「這週不行。」（US_CHICAGO missed）：11/11 21:00 書瑀三則逐字、回覆「好。」／「下次一定。」',e===0&&J(M.map(m=>m.th+'|'+m.text))===J(['📷（河上的橋，一座接一座）','風很大。','……下次一起來。'].map(t=>'p:heroine_05|'+t))&&M.every(m=>m.h===21)&&J(M[2].ask.opts.map(o=>o.t))===J(['好。','下次一定。']),J(M.map(m=>m.text)));
    const n0=th('p:'+S5).length; ans('usb_chi_1111',1); rules(); const P=th('p:'+S5);
    check('C2. 回了以後她不回（已讀）',P.length===n0+1&&P[P.length-1].from==='player'&&P[P.length-1].text==='下次一定。');
    check('C3. 日期卡 11/11：（社區很安靜。交換生群組一整天都是芝加哥的照片。）',J(cardsFor(G,'2028-11-11','2028-11-11'))===J(['11-11 （社區很安靜。交換生群組一整天都是芝加哥的照片。）'])); }
  { const G=fresh('2028-11-11',21.5,'us_apartment',{US2:'dating',US_CHICAGO:'went'}); dateSis(); rules();
    const G2=fresh('2028-11-11',21.5,'us_apartment',{US2:'repair',US_CHICAGO:'missed'}); rules();
    check('C4. 去了芝加哥：沒有私訊、沒有卡；挽回中：沒有私訊、沒有這張卡（挽回中是群組那一則）',!byTag('usb_chi_1111').length&&!cardsFor(G2,'2028-11-11','2028-11-11').length&&byTag(gtag('2028-11-11')).length===2); }
});

/* ======================= Z 給 BB 的工具 ======================= */
await sec('Z',()=>{ const G=fresh('2028-09-09',8,'us_apartment',{US2:'dating'}); dateSis();
  check('Z1. US_BLANK.scenesOn：9/9 改成手機約（不算到那裡才演）；8/15＝迎新摘要；10/12 挽回中＝自習室',US_BLANK.scenesOn(G,D('2028-09-09')).length===0&&US_BLANK.scenesOn(G,D('2028-08-15')).length===1&&US_BLANK.scenesOn(G,D('2028-10-12')).length===0); });

H.done();
})();
