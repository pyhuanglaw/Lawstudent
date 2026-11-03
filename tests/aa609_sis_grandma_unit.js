// AA_609 學姊的奶奶取代爸爸（使用者 2026-11-03「學姊的爸爸可以都用奶奶取代嗎？」「學姊小時候主要是跟奶奶住」「奶奶很開明，完全不會干涉什麼」
//   「交往後我也有跟奶奶吃飯，不要安排我沒去」；企劃線 4fc0e0095 起，第 9 節 615e981b5；第 8 節礁溪 Alison 還沒做）——不需要瀏覽器。
//   1  3/14 書桌夜當面約（第 1 節）：「我奶奶週六要請吃飯。」「她說叫你一起。六點半，公館。」「好。」→「好。不用穿太正式。」；只有「好。」（第 7 節一定會去）；
//      不在研究室＝21:00 私訊同兩句；兩種都排 3/17 18:30 的出遊（must）
//   2  3/17 ev_sis_y4_father「她奶奶的晚餐」（第 2 節＋協調者 11-03 的修正：開頭三句「你就是{name}？來，多吃一點。」「奶奶，他自己會夾。」「好、好。」）：
//      不 retired、沒有 outingMissed、沒有她爸爸的四句追問；MET_SIS_FATHER＋記憶「三月在公館和她奶奶吃過的那一頓」；出發選單只有「出發」；AA_591 版標成 missed 的舊存檔改回 planned
//   3  祐廷畢業典禮（第 7 節）：交往中＋MET_SIS_FATHER＝她奶奶「{name}，畢業快樂。」＋兩個選項；THERMOS.father 拿掉；沒交往、沒見過的不演
//   4  美國 208 剪報 ev_us208_clipping（第 4 節）：七場回到七場、她奶奶寄的、他→她、記憶名稱
//   5  出來走一圈（第 5 節）：剪報那一段恢復成「我奶奶寄了一份剪報給我。……」
//   6  其他（第 6 節）：pg_dates 照媽媽、礁溪偶遇／重訪／記憶「媽媽、奶奶」、她的畢業典禮「來，拍一張。」給學姊的奶奶、「九月開學？」照媽媽
//   7  第 9 節：學姊升到有點熟的第一句「{name}。法圖四樓比較安靜，考前可以來這裡。」
//   8  這幾場都沒有玩家看得到的「爸」（她爸爸）
// 用法：node tests/aa609_sis_grandma_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, ID='heroine_05', J=JSON.stringify;
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
const PG_FILES=new Set(['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js',
  'src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/data/syllabus.js','src/data/exam_bank.js','src/data/legal_qbank.js','src/classes3d.js','src/data/postgrad_lines.js','src/postgrad3d.js']);
const SKIP=new Set(['src/character3d.js','src/engine3d.js','src/townkit3d.js','src/zones3d.js','src/bike3d.js','src/adv3d.js']);
const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
const ORDER=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>f.startsWith('src/'));
for(const f of ORDER.filter(f=>!PG_FILES.has(f)&&!SKIP.has(f))){ try{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }catch(e){ /* 和這一批無關的檔載不進來就略過 */ } }
GM.toast=()=>{}; GM.caption=()=>{}; GM.studySession=async()=>{}; GM.spawnNPC=()=>null; GM.spawnCharacter=()=>null; GM.phoneBadge=()=>{}; GM.quickGo=async()=>{};
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const said=()=>H.said.map(s=>s.t), who=t=>{ const s=H.said.find(x=>x.t===t); return s?s.who:undefined; };
const setup=(key,h,zone,lv,flags)=>{ const G=H.fresh(key,h,zone||'dorm',Object.assign({met_sis:true,SIS_W1:true},flags||{})); if(lv) H[lv](ID); G.contacts=G.contacts||{}; G.contacts[ID]=G.day-300; G.outings=[]; if(STORY._bindGM) STORY._bindGM(GM); return G; };
const runEv=async(id,picks)=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); await EVENTS.run(ev(id)); return said(); };
const msgs=G=>(G.msgs||[]).filter(m=>m.th==='p:'+ID).map(m=>m.text);
const DAD=/爸/;
const LABEL=k=>SOCIAL.MEMORY_LABEL&&SOCIAL.MEMORY_LABEL[k];

(async()=>{
/* ---------- 1 3/14 的邀約 ---------- */
await sec(1,async()=>{
  { const G=setup('2029-03-14',21,'dorm','CLOSE',{SIS_DESK_NIGHTS:2}); H.date(ID); const L=await runEv('ev_sis_y4_desks',[0]);
    const i=L.indexOf('我奶奶週六要請吃飯。');
    check('1. 3/14 人在研究室：「我奶奶週六要請吃飯。」「她說叫你一起。六點半，公館。」→「好。」→「好。不用穿太正式。」',i>=0&&J(L.slice(i,i+3))===J(['我奶奶週六要請吃飯。','她說叫你一起。六點半，公館。','好。不用穿太正式。']),J(L));
    check('1. 選項只有「好。」（第 7 節一定會去：沒有「那天不行。」、沒有「好。我跟她說。」）',J(H.opts[0])===J(['「好。」'])&&!L.includes('好。我跟她說。'),J(H.opts));
    check('1. 當面說過：SIS_FATHER_ASKED face、SIS_FATHER_GO true；沒有「爸」',G.flags.SIS_FATHER_ASKED==='face'&&G.flags.SIS_FATHER_GO===true&&!L.some(t=>DAD.test(t)));
    G.hour=23.6; R3.father(G); const q=OUT.get(G,'r3_sis_father');
    check('1. 當面說過：手機不再傳；3/17 18:30 出遊、must、標題「她奶奶的晚餐」',!PHONE.sent(G,'r3_sis_father')&&!!q&&q.day===H.D('2029-03-17')&&q.h===18.5&&q.must===true&&q.ev==='ev_sis_y4_father'&&q.title==='她奶奶的晚餐',J(q)); }
  { const G=setup('2029-03-14',21.25,'dorm','CLOSE'); H.date(ID); R3.father(G); PHONE.tick(G); const M=msgs(G), q=OUT.get(G,'r3_sis_father'), m=PHONE.byAsk(G,'r3_sis_father');
    check('1. 3/14 不在研究室：21:00 私訊「我奶奶週六要請吃飯。」「她說叫你一起。六點半，公館。」，回覆只有「好。」',J(M.slice(-2))===J(['我奶奶週六要請吃飯。','她說叫你一起。六點半，公館。'])&&!!m&&J(m.ask.opts.map(o=>o.t))===J(['好。'])&&G.flags.SIS_FATHER_ASKED==='msg',J(M));
    check('1. 私訊還沒回也排好 3/17 18:30 的出遊（must，一定會去）',!!q&&q.must===true&&q.h===18.5,J(q)); }
  { const G=setup('2029-03-14',21.25,'dorm','FRIEND'); R3.father(G);
    check('1. 沒交往：不約、不排',!PHONE.sent(G,'r3_sis_father')&&!OUT.get(G,'r3_sis_father')); }
});

/* ---------- 2 3/17 她奶奶的晚餐 ---------- */
await sec(2,async()=>{
  const e=ev('ev_sis_y4_father');
  check('2. ev_sis_y4_father 不 retired、標題「她奶奶的晚餐」、沒有 outingMissed',!!e&&!e.retired&&e.title==='她奶奶的晚餐'&&typeof e.outingMissed!=='function',J(e&&{r:e.retired,t:e.title}));
  for(const k of [0,1]){ const G=setup('2029-03-17',18.5,'dorm','CLOSE',{SIS_FATHER_ASKED:'face',SIS_FATHER_GO:true}); H.date(ID); G.name='祐廷'; const L=await runEv('ev_sis_y4_father',[k]);
    const head=['（公館的小館子。學姊的奶奶頭髮全白，先替你們夾菜。）','你就是祐廷？來，多吃一點。','奶奶，他自己會夾。','好、好。'];
    check('2. 開頭四行（旁白＋協調者修正的三句），說話人「她奶奶」',J(L.slice(0,4))===J(head)&&who('你就是祐廷？來，多吃一點。')==='她奶奶'&&who('好、好。')==='她奶奶',J(L.slice(0,5)));
    check('2. 選項「奶奶好。」／「謝謝奶奶。」；選 '+k+'＝'+(k?'「謝什麼，吃。」':'「好、好。坐。」'),J(H.opts[0])===J(['「奶奶好。」','「謝謝奶奶。」'])&&L[4]===(k?'謝什麼，吃。':'好、好。坐。'),J(L));
    check('2. 後面照稿：「書瑀從小就自己決定事情。我都不管，她都做得很好。」「……奶奶。」「下次再來。」旁白、「她很久沒有這麼開心了。」',J(L.slice(5))===J(['書瑀從小就自己決定事情。我都不管，她都做得很好。','……奶奶。','下次再來。','（走出來的時候，學姊說：）','她很久沒有這麼開心了。']),J(L.slice(5)));
    check('2. 拿掉的句子都不在：她爸爸的四句追問、「書瑀說你都吃很少」「……我沒有這樣說」「她小時候也是這樣」；沒有「爸」',!L.some(t=>/以後要做什麼|想清楚了就好|妳以前也這樣說過|他還在想|吃很少|我沒有這樣說|她小時候也是這樣|很少請人吃飯/.test(t))&&!L.some(t=>DAD.test(t))&&!H.said.some(s=>DAD.test(s.who||'')),J(L));
    check('2. MET_SIS_FATHER 照記、記憶 MET_SIS_FATHER',G.flags.MET_SIS_FATHER===true&&SOCIAL.has(ID,'MET_SIS_FATHER')); }
  check('2. 記憶名稱「三月在公館和她奶奶吃過的那一頓」',LABEL('MET_SIS_FATHER')==='三月在公館和她奶奶吃過的那一頓',J(LABEL('MET_SIS_FATHER')));
  { const G=setup('2029-03-17',18.2,'dorm','CLOSE',{SIS_FATHER_ASKED:'face',SIS_FATHER_GO:true}); H.date(ID); R3.father(G); const q=OUT.get(G,'r3_sis_father'); H.opts=[]; H.picks=[];
    const realGo=OUT.go; OUT.go=async()=>true; let r; try{ r=await OUT.prompt(GM,q); } finally { OUT.go=realGo; }
    check('2. 出發選單只有「出發」（沒有「晚一點」「不去了」）',H.opts.length===1&&H.opts[0].length===1&&/^出發/.test(H.opts[0][0])&&r==='go',J(H.opts)); }
  { const G=setup('2029-03-17',12,'dorm','CLOSE',{SIS_FATHER_ASKED:'msg'}); H.date(ID); G.outings=[{id:'r3_sis_father',ev:'ev_sis_y4_father',day:G.day,h:18.5,late:1,state:'missed'}]; R3.father(G);
    check('2. 舊存檔（AA_591 那一版把排好的那一趟標成 missed）：3/17 18:30 以前改回 planned、must',G.outings[0].state==='planned'&&G.outings[0].must===true,J(G.outings)); }
  { const G=setup('2029-03-17',12,'dorm','CLOSE',{SIS_FATHER_ASKED:'msg',SIS_FATHER_GO:false}); H.date(ID); R3.father(G);
    check('2. 舊存檔已經說過「那天不行。」：照舊不排（不硬拉玩家去）',!OUT.get(G,'r3_sis_father')); }
  { const G=setup('2029-03-17',20,'dorm','CLOSE',{SIS_FATHER_ASKED:'face',SIS_FATHER_GO:true}); H.date(ID); G.outings=[{id:'r3_sis_father',ev:'ev_sis_y4_father',day:G.day,h:18.5,late:1,must:true,state:'planned'}];
    for(const q of OUT.expire(G)) OUT.onMissed(GM,q); R3.father(G); G.hour=22; PHONE.tick(G);
    check('2. 過了時間（睡過頭）：不傳「我們吃完了。……說下次。」',!msgs(G).some(t=>/吃完了|說下次/.test(t)),J(msgs(G))); }
});

/* ---------- 3 祐廷畢業典禮 ---------- */
await sec(3,async()=>{
  const W=POSTGRAD_LINES.THERMOS;
  check('3. THERMOS.father（「我奶奶叫我跟你說：恭喜。」）拿掉；fatherGrad 在',W.father===undefined&&!!W.fatherGrad);
  for(const k of [0,1]){ const G=setup('2029-06-02',12,'campus','CLOSE',{MET_SIS_FATHER:true,SIS_FATHER_ASKED:'face'}); H.date(ID); G.name='祐廷'; H.said=[]; H.opts=[]; H.picks=[k];
    await PG.thermos(GM); const L=said();
    const want=['（典禮結束，學姊身邊站著她奶奶。）','祐廷，畢業快樂。','（她拍了拍你的手臂。）',k?'書瑀說你今天畢業，我就跟來了。':'好、好。有空再來吃飯。'];
    check('3. 交往中、見過奶奶：保溫瓶前先演她奶奶（選 '+k+'）；說話人「書瑀奶奶」',J(L.slice(0,4))===J(want)&&J(H.opts[0])===J(['「謝謝奶奶。」','「奶奶怎麼也來了？」'])&&who('祐廷，畢業快樂。')==='書瑀奶奶'&&L.includes('恭喜畢業。')&&L.indexOf('恭喜畢業。')>3,J(L));
    check('3. 沒有「爸」、沒有「上次的飯沒吃到」「上次對不起」、沒有轉交的「恭喜。」',!L.some(t=>DAD.test(t)||/上次的飯沒吃到|上次對不起|叫我跟你說：恭喜/.test(t))&&!H.opts.flat().some(o=>/上次對不起|伯父/.test(o))&&H.G.flags.SIS_THERMOS===true,J(L)); }
  for(const [fl,dt,why] of [[{MET_SIS_FATHER:true},false,'見過、沒交往'],[{SIS_FATHER_ASKED:'msg'},true,'交往中、沒見過'],[{MET_SIS_FATHER:'grad'},true,'舊版在典禮見過（grad）']]){
    const G=setup('2029-06-02',12,'campus','CLOSE',fl); if(dt) H.date(ID); H.said=[]; H.picks=[0]; let err=null; try{ await PG.thermos(GM); }catch(e){ err=String(e); } const L=said();
    check('3. '+why+'：不演她奶奶、保溫瓶照演、不丟例外',!err&&!L.some(t=>/奶奶/.test(t))&&L.includes('恭喜畢業。'),J({err,L})); }
});

/* ---------- 4 美國 208 剪報 ---------- */
await sec(4,async()=>{
  const e=ev('ev_us208_clipping'), sc=US208.SCENES.find(s=>s.ev==='ev_us208_clipping');
  check('4. 七場（3-1～3-7）、3-3 剪報回來；ev_us208_clipping 不 retired',J(US208.SCENES.map(s=>s.n))===J(['3-1','3-2','3-3','3-4','3-5','3-6','3-7'])&&!!e&&!e.retired&&!!sc,J(US208.SCENES.map(s=>s.n)));
  check('4. 筆記本那一行／記憶名稱「書瑀的奶奶寄了一張剪報到美國」；私訊「臺灣寄來的東西到了。」、第二次「東西還在客廳。你哪天過來拿。」',sc.label==='書瑀的奶奶寄了一張剪報到美國'&&e.title===sc.label&&LABEL('US208_CLIPPING')===sc.label&&sc.dm==='臺灣寄來的東西到了。'&&J(sc.dmMore)===J(['東西還在客廳。你哪天過來拿。']),J([sc.label,LABEL('US208_CLIPPING')]));
  { setup('2028-10-14',15,'us_shared','CLOSE',{EXCHANGE_ROUTE:'US'}); H.date(ID); const L=await runEv('ev_us208_clipping',[0]);
    check('4. 「我奶奶寄的。」…「她還是一個字都沒寫。」→「妳要回她嗎？」→「回了。我拍照傳給她，說收到了。」「（……她奶奶只回了一個字：好。）」；記憶 US208_CLIPPING',
      L[1]==='我奶奶寄的。'&&L.includes('她還是一個字都沒寫。')&&J(H.opts[0])===J(['「妳要回她嗎？」','「她在等妳回去。」'])&&L.includes('回了。我拍照傳給她，說收到了。')&&L.includes('（她把手機轉過來給你看。她奶奶只回了一個字：好。）')&&SOCIAL.has(ID,'US208_CLIPPING')&&!L.some(t=>DAD.test(t)||/他還是|傳給他/.test(t)),J(L)); }
  { const G=setup('2028-10-14',15,'us_shared','CLOSE',{EXCHANGE_ROUTE:'US'}); H.date(ID); SOCIAL.remember(ID,'SIS4_CLIPPINGS',''); const L=await runEv('ev_us208_clipping',[1]);
    check('4. 聽過 S2-L5（舊存檔 SIS4_CLIPPINGS）：多一句「（你想起她說過，她奶奶以前會把報紙剪下來，放在她的書桌上。）」；「她在等妳回去。」→「……嗯。」',US208.heardClip(G)&&L.includes('（你想起她說過，她奶奶以前會把報紙剪下來，放在她的書桌上。）')&&L.includes('……嗯。')&&!L.some(t=>DAD.test(t)),J(L)); }
});

/* ---------- 5 出來走一圈 ---------- */
await sec(5,async()=>{
  for(const k of [0,1]){ setup('2027-12-06',17,'campus','FRIEND'); const L=await runEv('ev_sis13_walk',[0,k]);
    const i=L.indexOf('咖哩的「適量」，我改成兩匙了。我自己決定的。');
    check('5. 出來走一圈（選 '+k+'）：咖哩之後「我奶奶寄了一份剪報給我。法律扶助的新聞。旁邊用原子筆寫：「妳寫的這個。」」＋「她在關心妳。」／「剪報上寫什麼？」',
      i>=0&&L[i+1]==='我奶奶寄了一份剪報給我。法律扶助的新聞。旁邊用原子筆寫：「妳寫的這個。」'&&J(H.opts[1])===J(['「她在關心妳。」','「剪報上寫什麼？」'])&&L[i+2]===(k?'等的人越來越多。……我的論文寫的就是他們。':'她不會說。……她會寄剪報。')&&L[i+3]==='好。可以回去寫了。'&&!L.some(t=>DAD.test(t)),J(L.slice(i))); }
});

/* ---------- 6 其他 ---------- */
await sec(6,async()=>{
  const pg=J(PG_DATES);
  check('6. pg_dates：「元旦回家，我媽問研究單位在做什麼。……她說：『所以是公務員？』」照媽媽',pg.includes('元旦回家，我媽問研究單位在做什麼。我講了二十分鐘。她說：『所以是公務員？』')&&!pg.includes('元旦回家，我爸問研究單位'));
  const enc=(ENCOUNTERS.list||ENCOUNTERS.encounters||[]); const ej=J(ENCOUNTERS);
  check('6. 礁溪偶遇 why「她和媽媽、奶奶坐在泡腳池邊，褲管捲到膝蓋。」、記憶「在礁溪遇到學姊和她媽媽、奶奶」',ej.includes('"她和媽媽、奶奶坐在泡腳池邊，褲管捲到膝蓋。"')&&ENCOUNTERS.labels.ENC_D24_SIS==='在礁溪遇到學姊和她媽媽、奶奶'&&LABEL('ENC_D24_SIS')!=='在礁溪遇到學姊和她媽媽',J([ENCOUNTERS.labels.ENC_D24_SIS,LABEL('ENC_D24_SIS')]));
  check('6. 礁溪重訪（enc_walk）「泡腳池。上次學姊和她媽媽、奶奶坐在這裡。」',J(ENC_WALK).includes('"泡腳池。上次學姊和她媽媽、奶奶坐在這裡。"')&&!J(ENC_WALK).includes('"泡腳池。上次學姊和她媽媽坐在這裡。"'));
  { const D=ev('ev_sis_graduation').dialogue.filter(l=>l.text), i=D.findIndex(l=>l.text==='來，拍一張。');
    check('6. 她的畢業典禮：「九月開學？」學姊的媽媽；「（媽媽笑了。）」後「來，拍一張。」＝學姊的奶奶',D[0].speaker==='學姊的媽媽'&&D[0].text==='九月開學？'&&i===3&&D[i].speaker==='學姊的奶奶'&&D[2].text==='（媽媽笑了。）'&&!D.some(l=>DAD.test(String(l.speaker))),J(D.slice(0,5))); }
});

/* ---------- 7 第 9 節 ---------- */
await sec(7,()=>{
  const l=REL_LINES.heroine_05&&REL_LINES.heroine_05.up&&REL_LINES.heroine_05.up.FAMILIAR&&REL_LINES.heroine_05.up.FAMILIAR.l;
  check('7. 學姊升到有點熟的第一句「{name}。法圖四樓比較安靜，考前可以來這裡。」（原本「{name}，你最近很常來法圖。」）',J(l)===J(['「{name}。法圖四樓比較安靜，考前可以來這裡。」'])&&!J(REL_LINES).includes('你最近很常來法圖'),J(l));
});

/* ---------- 8 這幾場沒有「爸」 ---------- */
await sec(8,()=>{
  const evs=['ev_sis_y4_desks','ev_sis_y4_father','ev_us208_clipping','ev_sis13_walk','ev_sis_graduation'].map(ev);
  const bad=evs.filter(Boolean).filter(e=>DAD.test(J(e.dialogue))).map(e=>e.id);
  check('8. 3/14 書桌夜、3/17 晚餐、208 剪報、出來走一圈、她的畢業典禮：台詞和說話人都沒有「爸」',evs.every(Boolean)&&!bad.length,J(bad));
  check('8. 畢業典禮（fatherGrad）、3/14 私訊（R3.FATHER_ASK）沒有「爸」',!DAD.test(J(POSTGRAD_LINES.THERMOS))&&!DAD.test(J(R3.FATHER_ASK||'爸')));
  check('8. 記憶名稱 MET_SIS_FATHER、US208_CLIPPING、ENC_D24_SIS 都不提爸爸',['MET_SIS_FATHER','US208_CLIPPING','ENC_D24_SIS'].every(k=>LABEL(k)&&!DAD.test(LABEL(k))&&/奶奶/.test(LABEL(k))),J(['MET_SIS_FATHER','US208_CLIPPING','ENC_D24_SIS'].map(LABEL)));
});

H.done();
})();
