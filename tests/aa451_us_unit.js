// AA_451（企劃線 14ee5d2a7，AA-B 2026-10-25 02:2x；讀 BB-B 美國交換逐日劇本（交往中、沒見過何俊朗）29b4e87a7）——不需要瀏覽器。台詞逐字對 AA_451。
//   1-1 沒見過何俊朗：芝加哥巴士上認識他（MET_LONG＋LONG_CHI）；12/16「還好。」換「……還好？你學我。」；過期的何俊朗行程、訊息不補
//   1-2 一直沒見過：「同一組的交換生」→「一個香港來的交換生」「坐你前面的交換生」
//   1-3 舊金山那一週（一個劇情跑完就飛回臺灣）：每一天先跑手機規則，媽媽 12/17 在舊金山收到
// 修改前（開發分支 4982359e1）：每一節至少一項 FAIL。用法：node tests/aa451_us_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const H=require('./pg_harness.js');
const ROOT=H.ROOT, {check,GM,E}=H, J=JSON.stringify, S5='heroine_05';
global.Z3={ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
const EXPORT=/^(EXCH|US3|US_\w+|AIRPORT_T2_LAYOUT|Y34B|R2Y3B|R2Y3B_EVENTS|R2Y4A|R2Y4A_EVENTS|USL|US_LIFE_EVENTS|US208|ROM|PORTRAIT_ONLY)$/;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>EXPORT.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
const loadErr=[];
for(const f of ['src/exchange3d.js','src/data/us_layouts.js','src/us3d.js','src/y34b3d.js','src/data/r2y3b_events.js','src/r2y3b3d.js','src/data/r2y4a_events.js','src/r2y4a3d.js','src/data/us_life_events.js','src/us_life3d.js','src/us208_3d.js','src/data/us_blank_lines.js','src/us_blank3d.js']){
  if(!fs.existsSync(path.join(ROOT,f))){ loadErr.push(f+'：沒有這個檔'); continue; } try{ load(f); }catch(e){ loadErr.push(f+'：'+e.message); } }
let doc=''; try{ doc=cp.execSync('git show 14ee5d2a7:"docs/story_planning/AA_451_美國交換讀後_沒見過何俊朗.md"',{cwd:ROOT,encoding:'utf8'}); }catch(e){ doc=''; }
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


const BUS=['（巴士上，坐在你們前面的是一個戴圓框眼鏡的男生。車子一開，他就回頭。）','臺灣來的？我聽你們講話聽出來的。','香港。何俊朗。叫我 Long 就好。','祐廷。','（學姊點了一下頭，報了自己的名字。他轉回去以前，把手機上一家披薩店的地址給你們看。）'];
(async()=>{
await sec(0,()=>{
  check('0. 美國篇的檔案都載得到',!loadErr.length,loadErr.join('；'));
  check('0. 讀稿（企劃線 14ee5d2a7 AA_451）',doc.length>2000&&inDoc('### 1-1.')&&inDoc('### 1-2.')); });

/* ======================= 1-1 芝加哥：沒見過的，在巴士上認識他 ======================= */
await sec('1-1',async()=>{
  for(const t of [BUS[0],BUS[1],BUS[2],BUS[4],'……還好？你學我。']) check('1-1. 稿裡有「'+t+'」',inDoc(t.replace(/^（|）$/g,'')));
  let G=fresh('2028-11-11',7,'us_outside'); dateSis(); H.G.name=H.G.name||'祐廷'; let L=await play('ev_us_chicago');
  check('1-1. 沒見過何俊朗：芝加哥最前面巴士上五句（他、他、你報名字、旁白），之後「一路上，何俊朗說了好幾次『還好』」',J(L.slice(0,5).map((t,i)=>i===3?t.replace(H.G.name,'祐廷'):t))===J(BUS)&&L.some(t=>t.indexOf('一路上，何俊朗說了好幾次')>=0)&&!L.some(t=>t.indexOf('同行的人說了好幾次')>=0),J(L.slice(0,7)));
  check('1-1. 記 MET_LONG＋LONG_CHI',G.flags.MET_LONG===true&&G.flags.LONG_CHI===true,J({m:G.flags.MET_LONG,c:G.flags.LONG_CHI}));
  rules(); at('2028-11-12',9); rules();
  const q3=typeof OUT!=='undefined'&&OUT.get?OUT.get(G,'usl_long3'):null;
  check('1-1. 11/11 才認識：過期的 10/4 會所自習室不補排、10/24「明天晚上去中餐館？」不補發',!q3&&!byTag('usl_long_1024').length,J({q3,m:byTag('usl_long_1024').map(m=>m.text)}));
  G=fresh('2028-11-11',7,'us_outside',{MET_LONG:true}); dateSis(); L=await play('ev_us_chicago');
  check('1-1. 見過他的：沒有巴士那五句、不記 LONG_CHI',!L.some(t=>BUS.indexOf(t)>=0)&&!G.flags.LONG_CHI&&L[0]&&L[0].indexOf('她排了一張行程表')>=0,J(L.slice(0,2)));
  fresh('2028-12-16',7,'us_outside',{MET_LONG:true,LONG_CHI:true}); L=await play('ev_us_leave',[1]);
  check('1-1. 12/16 選「還好。」：芝加哥才認識的＝「……還好？你學我。」＋（他笑了一下，上了車。）',J(L.slice(-2))===J(['……還好？你學我。','（他笑了一下，上了車。）'])&&L.indexOf('……你又來了。')<0,J(L));
  fresh('2028-12-16',7,'us_outside',{MET_LONG:true}); L=await play('ev_us_leave',[1]);
  check('1-1. 12/16 選「還好。」：9/8 就認識的照舊「……你又來了。」',J(L.slice(-2))===J(['……你又來了。','（他笑了一下，上了車。）']),J(L));
  fresh('2028-12-16',7,'us_outside'); L=await play('ev_us_leave');
  check('1-1. 芝加哥也沒去（一直沒見過）：照舊「社區門口停著機場巴士」',J(L)===J(['（天還沒亮。社區門口停著機場巴士。）']),J(L)); });

/* ======================= 1-2 一直沒見過的：「同一組的交換生」改掉 ======================= */
await sec('1-2',async()=>{ const A='（一個香港來的交換生念的那一句，沒有 however。全班拍手。）', B='坐你前面的交換生交出去的作業，被圈出三個『however』。';
  check('1-2. 稿裡有兩句',inDoc(A.slice(1,-1))&&inDoc('坐你前面的交換生交出去的作業'));
  fresh('2028-12-08',8); let L=await play('ev_usl_lastclass');
  check('1-2. 12/8 最後一堂（沒見過）：「一個香港來的交換生」',L.indexOf(A)>=0&&!L.some(t=>t.indexOf('同一組')>=0),J(L));
  fresh('2028-12-08',8,'us_apartment',{MET_LONG:true}); L=await play('ev_usl_lastclass');
  check('1-2. 見過的照舊「何俊朗念的那一句」',L.indexOf('（何俊朗念的那一句，沒有 however。全班拍手。）')>=0,J(L));
  const w=US_LIFE_EVENTS.DATA.classLines.us_writing[1];
  check('1-2. Legal Writing 第二句（沒見過）：「坐你前面的交換生」；見過＝Long',typeof w==='function'&&w({flags:{}})===B&&w({flags:{MET_LONG:true}})==='Long 交出去的作業，被圈出三個『however』。',typeof w==='function'?w({flags:{}}):String(w)); });

/* ======================= 1-3 舊金山那一週：媽媽 12/17 在舊金山收到 ======================= */
await sec('1-3',async()=>{
  const G=fresh('2028-12-16',7,'us_outside',{MET_LONG:true}); dateSis(); rules();
  const ex=EXCH.returnHome; let back=null; EXCH.returnHome=async()=>{ back={day:H.G.day,mom:th('p:mom').filter(m=>m.day===D('2028-12-17')).map(m=>m.text)}; return true; };
  const days=[]; const run0=EVENTS.run; EVENTS.run=async(e,o)=>{ if(e&&e.id==='ev_sf_photo17') days.push(th('p:mom').filter(m=>m.day===D('2028-12-17')).length); return run0.call(EVENTS,e,o); };
  H.picks=[0,0,0,0,0,0,0,0]; try{ await R2Y4A.leave(GM); } finally { EXCH.returnHome=ex; EVENTS.run=run0; }
  check('1-3. 舊金山那一週：12/17「棉被曬過了。」飛回臺灣以前就收到（日期 12/17、只有一則；12/17 那張照片以前就在）',!!back&&J(back.mom)===J(['棉被曬過了。'])&&days[0]===1,J({back,days})); });

H.done();
})();
