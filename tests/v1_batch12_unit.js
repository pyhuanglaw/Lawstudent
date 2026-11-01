// 交接包 v1（大一上）第 12 批：AA、BB 2026-10-14 的補字＋CG-14、CG-15——不需要瀏覽器。
// 檢查（修改前都會失敗）：
//   K1（手機）：「週末來政大？我當導遊。」兩個回覆各有她的回應（「好。導遊在校門口等。」／「好。導遊的位子幫你留著。」）；
//     這週不行＝第 4 週週五 19:30 再約一次「這週末呢？導遊還在。」（同樣兩個回覆）；回得比那天晚＝從回覆的下一個週五起；答應過、沒回、第二次也不行＝不再約；
//     第二次答應＝排下一個週六 14:00 去政大。
//   K3（中秋烤肉）：比冷笑話「可昕贏」→「我練過。不要問跟誰。」（AA_305 第 9 節；阿哲贏照舊「好，我回去練。」）。
//   CG-14「中秋的河濱」：去烤肉的玩家都有（只認識阿哲也有），在旁白「你被分到顧火。火一直熄。」那一句出現；檔案 1920×1080。
//   CG-15「頂樓的跨年」：頂樓版在第一句旁白出現（可昕的視訊排在這張之後、只一張）；河堤版（ev_nye_river）不放；檔案 1920×1080。
//   A15 考完的宵夜：明軒那個選項的第二個是「（繼續吃滷味）」（不是「（不說話）」）。
//   A19 以安的第一則訊息：第二天要了聯絡方式（AN_CONTACT_DAY2）的玩家，當晚 21:30 收到「📷（筆記的照片，字很整齊）」；當晚睡著＝隔天補收（時間照舊）；
//     沒和她走的玩家（下午結束時默默加聯絡方式）沒有這則；過了隔天才讀到的存檔不補。
//   A12 分工表：報告「一起寫」（REPORT_PARTNER）而且有她聯絡方式的玩家，那天晚上 21:30 收到「📷（報告的分工表）」；沒一起寫、沒聯絡方式＝沒有。
//   LICENSES.md 記了兩張 CG。
// 用法：node tests/v1_batch12_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|OUT|COURSES|CLS|ACTIVITIES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/classes3d.js']) load(f);
{ const src=fs.readFileSync(path.join(ROOT,'src/adv3d.js'),'utf8'); const m=/^const CG_REGISTRY=(\{.*\});$/m.exec(src); global.CG_REGISTRY=m?eval('('+m[1]+')'):{}; }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
let cgs=[]; global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(id){ cgs.push({id,at:said.length}); return true; },setBg(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], caps=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption:(a,t)=>{ caps.push(t); },sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); said=[]; opts=[]; picks=[]; caps=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; E.player.obj.position.x=0; E.player.obj.position.z=0; };
const keepOn=(day,hour,zone,flags)=>{ const ev=G.events, soc=G.social, msgs=G.msgs, phone=G.phone, contacts=G.contacts, ch=G.choices, act=G.activities; fresh(day,hour,zone,Object.assign({},G.flags,flags||{})); G.events=ev; G.social=soc; SOCIAL.bind(G); if(msgs) G.msgs=msgs; if(phone) G.phone=phone; if(contacts) G.contacts=contacts; G.choices=ch; if(act) G.activities=act; };
const lines=()=>said.map(s=>s.t);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const npc=(id,x,z)=>{ const n={id,charId:id,name:id,obj:{position:{x,y:0,z}},seat:null,lv:0}; GM.npc[id]=n; E.npcs.push(n); return n; };
const tickEv=()=>{ const r=EVENTS.tick(0.1); return r; };
const termDay=(w,wd)=>STORY.termDay('Y1S1',w,wd);
const run=(h0,h1,st)=>{ st=st||0.05; for(let h=h0;h<=h1+1e-9;h+=st){ G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(G); } };
const meet=id=>SOCIAL.remember(id,'FIRST_MET','');
const WHO=['heroine_01','heroine_03','zhe','classmate_bohan','classmate_xinci','yu','classmate_mingxuan'];

const webpSize=f=>{ const b=fs.readFileSync(f); if(b.toString('ascii',0,4)!=='RIFF'||b.toString('ascii',8,12)!=='WEBP') return null; const t=b.toString('ascii',12,16);
  if(t==='VP8X') return [1+b.readUIntLE(24,3),1+b.readUIntLE(27,3)]; if(t==='VP8 ') return [b.readUInt16LE(26)&0x3fff,b.readUInt16LE(28)&0x3fff];
  if(t==='VP8L'){ const v=b.readUInt32LE(21); return [1+(v&0x3fff),1+((v>>>14)&0x3fff)]; } return null; };
const cgFile=id=>{ const c=CG_REGISTRY[id]; if(!c) return null; const f=path.join(ROOT,c.file); return fs.existsSync(f)?{file:c.file,size:webpSize(f)}:{file:c.file,missing:true}; };
const KX={dating_kexin:true};

(async()=>{
  /* ---------- K1：導遊（手機）---------- */
  const FRI3=termDay(3,5), FRI4=termDay(4,5), FRI5=termDay(5,5);
  const ask=tag=>(G.msgs||[]).find(m=>m.tag===tag);
  { fresh(FRI3,8,'campus',KX); run(8,20); const m=ask('kx_tour_ask');
    check('K1：第 3 週週五 19:30「週末來木柵大學？我當導遊。」、兩個回覆',!!m&&m.day===FRI3&&Math.abs(m.h-19.5)<0.06&&m.text==='週末來木柵大學？我當導遊。'&&JSON.stringify(m.ask.opts.map(o=>o.t))==='["好，週六下午過去。","這週末不行。"]',m&&JSON.stringify({d:m.day,h:m.h,o:m.ask.opts.map(o=>o.t)}));
    const r=PHONE.answer(G,m.ask.id,0); const out=r&&r.out.map(x=>[x.from,x.text]);
    check('K1：「好，週六下午過去。」→ 她回「好。導遊在校門口等。」（BB 2026-10-14）',JSON.stringify(out)==='[["player","好，週六下午過去。"],["kexin","好。導遊在校門口等。"]]'&&G.flags.KX_TOUR_YES===true,JSON.stringify(out));
    run(20,20.2); fresh(FRI4,8,'campus',Object.assign({},G.flags)); G.msgs=(G.msgs||[]); }
  { fresh(FRI3,8,'campus',KX); run(8,20); const m=ask('kx_tour_ask'); const r=PHONE.answer(G,m.ask.id,1); const out=r&&r.out.map(x=>[x.from,x.text]);
    check('K1：「這週末不行。」→ 她回「好。導遊的位子幫你留著。」',JSON.stringify(out)==='[["player","這週末不行。"],["kexin","好。導遊的位子幫你留著。"]]'&&G.flags.KX_TOUR_NO===true,JSON.stringify(out));
    run(20,23); check('K1：這週不行＝當週沒有第二次邀約',!ask('kx_tour_ask2'));
    keepOn(FRI4,8,'campus'); run(8,19.4); check('K1：第 4 週週五 19:30 以前還沒有第二次邀約',!ask('kx_tour_ask2'));
    run(19.4,20); const m2=ask('kx_tour_ask2');
    check('K1：第 4 週週五 19:30 再約一次「這週末呢？導遊還在。」（同樣兩個回覆）',!!m2&&m2.day===FRI4&&Math.abs(m2.h-19.5)<0.06&&m2.text==='這週末呢？導遊還在。'&&JSON.stringify(m2.ask.opts.map(o=>o.t))==='["好，週六下午過去。","這週末不行。"]',m2&&JSON.stringify({d:m2.day,h:m2.h,t:m2.text}));
    const snap=JSON.stringify({f:G.flags,m:G.msgs,p:G.phone,o:G.outings||null,c:G.contacts||null});
    const r2=PHONE.answer(G,m2.ask.id,0); run(20,20.2); const o=OUT.get(G,'kx_tour'); const SAT4=FRI4+1;
    check('K1：第二次答應＝她回「好。導遊在校門口等。」、排第 4 週週六 14:00 去木柵大學',r2&&r2.out[1].text==='好。導遊在校門口等。'&&!!o&&o.day===SAT4&&o.h===14&&o.ev==='ev_kexin_tour_nccu',JSON.stringify(o));
    const s=JSON.parse(snap); G.flags=s.f; G.msgs=s.m; G.phone=s.p; if(s.o) G.outings=s.o; else delete G.outings;
    const m2b=ask('kx_tour_ask2'); PHONE.answer(G,m2b.ask.id,1); run(20,20.2);
    check('K1：第二次也不行＝記 KX_TOUR_NO2、不排出遊',G.flags.KX_TOUR_NO2===true&&!OUT.get(G,'kx_tour'));
    keepOn(FRI5,8,'campus'); run(8,22); check('K1：兩次都不行＝之後不再約（第 5 週週五沒有新的邀約）',G.msgs.filter(x=>/^kx_tour_ask/.test(x.tag||'')).length===2,JSON.stringify(G.msgs.filter(x=>/^kx_tour/.test(x.tag||'')).map(x=>x.tag))); }
  { fresh(FRI3,8,'campus',KX); run(8,20); const m=ask('kx_tour_ask'); const F0=G.flags, ms=G.msgs, ph=G.phone;
    fresh(FRI4,21,'campus',F0); G.msgs=ms; G.phone=ph; PHONE.answer(G,m.ask.id,1); run(21,21.2);
    check('K1：第 4 週週五晚上才回「這週末不行。」＝第二次邀約不在那天',!ask('kx_tour_ask2'));
    keepOn(FRI5,8,'campus'); run(8,20); const m2=ask('kx_tour_ask2');
    check('K1：回得晚＝從回覆的下一個週五（第 5 週週五）19:30 再約',!!m2&&m2.day===FRI5&&Math.abs(m2.h-19.5)<0.06,m2&&JSON.stringify({d:m2.day,h:m2.h,FRI5})); }
  { fresh(FRI3,8,'campus',KX); run(8,20); keepOn(FRI4,8,'campus'); run(8,21); check('K1：第一次沒回＝不會有第二次邀約',!ask('kx_tour_ask2')); }
  /* ---------- K3、CG-14：中秋烤肉 ---------- */
  const BBQ=ev('ev_mid_autumn_bbq'), SATB=termDay(5,6);
  const bbq=async(flags,setup,pk)=>{ fresh(SATB,15,'campus',Object.assign({},KX,{ZHE_CALLS_GE:true},flags||{}));   /* 已經有「哥」：不問「你幾年次的」（那段另外測）*/ if(setup) setup(); cgs=[]; picks=pk||[]; await EVENTS.run(BBQ); return {L:lines(),cg:cgs.slice()}; };
  { const g=async(f,pk)=>{ const r=await bbq(Object.assign({ZHE_CALLS_GE:false},f||{}),null,pk); return r.L; };
    let L=await g({},['我大一歲']); check('CAMP-FIX-614 程式 7（AA_195 4-9）：中秋烤肉還沒有「哥」→ 阿哲「欸，明軒說你比我們大一屆？」（AA_372 第 10 項：原本「欸，你幾年次的？…」，宿營時明軒問過）→「我大一歲。」→「那我們叫你哥？」…、記 ZHE_CALLS_GE',L.includes('欸，明軒說你比我們大一屆？')&&L.includes('那我們叫你哥？')&&G.flags.ZHE_CALLS_GE===true);
    L=await g({},['跟你們一樣啦']); check('　選「跟你們一樣啦。」→「好喔。」、沒有 ZHE_CALLS_GE',L.includes('好喔。')&&!G.flags.ZHE_CALLS_GE);
    L=await g({ECON_PAST_SHARED:'full'},['我不是說過了嗎']); check('　已經說過念過經濟：「我不是說過了嗎？」→「對齁。哥。」',L.includes('對齁。哥。')&&G.flags.ZHE_CALLS_GE===true);
    L=await g({ZHE_CALLS_GE:true},[]); check('　已經有「哥」的不問',!L.includes('欸，明軒說你比我們大一屆？')); }
  { let r=await bbq({KX_BBQ_COME:true},null,['我女朋友','可昕贏']);
    check('K3：比冷笑話「可昕贏」→「我練過。不要問跟誰。」（BB 2026-10-14；AA_305 第 9 節改句）、沒有「好，我回去練。」',r.L.includes('我練過。不要問跟誰。')&&!r.L.includes('好，我回去練。')&&G.flags.KX_JOKE==='kexin',JSON.stringify(r.L.slice(-3)));
    r=await bbq({KX_BBQ_COME:true},null,['我女朋友','阿哲贏']);
    check('K3：「阿哲贏」照舊「好，我回去練。」、沒有可昕贏的那句',r.L.includes('好，我回去練。')&&!r.L.includes('我練過。不要問跟誰。')&&G.flags.KX_JOKE==='zhe');
    const at=(res)=>res.L.indexOf('你被分到顧火。火一直熄。');
    r=await bbq({},null,[]);
    check('CG-14：只認識阿哲的玩家也有「中秋的河濱」，在「你被分到顧火。火一直熄。」那一句出現、只一張',r.cg.length===1&&r.cg[0].id==='cg_midautumn_riverside'&&r.cg[0].at===at(r)&&at(r)>0,JSON.stringify({cg:r.cg,at:at(r)}));
    r=await bbq({met_yu:true,KX_BBQ_COME:true},()=>{ for(const id of ['heroine_01','heroine_03','classmate_bohan','npc_fangyt']) meet(id); },['我女朋友','阿哲贏']);
    check('CG-14：大家都在（可昕也來）也是同一句、只一張',r.cg.length===1&&r.cg[0].id==='cg_midautumn_riverside'&&r.cg[0].at===at(r),JSON.stringify({cg:r.cg,at:at(r)}));
    const f=cgFile('cg_midautumn_riverside');
    check('CG-14：登錄的是正式檔 assets/cg/zhe/event_midautumn_riverside.webp、1920×1080、標題「中秋的河濱」',!!f&&f.file==='assets/cg/zhe/event_midautumn_riverside.webp'&&!f.missing&&JSON.stringify(f.size)==='[1920,1080]'&&CG_REGISTRY.cg_midautumn_riverside.title==='中秋的河濱',JSON.stringify(f)); }
  /* ---------- CG-15：跨年 ---------- */
  { const ROOF=ev('ev_nye_roof'), RIVER=ev('ev_nye_river'); const D=termDay(16,3);
    fresh(D,23,'campus',KX); cgs=[]; picks=[]; await EVENTS.run(ROOF); let L=lines();
    check('CG-15：頂樓版「頂樓的跨年」在第一句旁白出現、只一張',cgs.length===1&&cgs[0].id==='cg_nye_rooftop'&&cgs[0].at===0&&/^（十一點四十，男生宿舍頂樓。/.test(L[0]||'')   /* AA_204 2-3（27711a39）的頂樓第一句 */,JSON.stringify({cg:cgs,L0:L[0]}));
    fresh(D,23,'campus',Object.assign({},KX,{KX_NYE:{1:'roof'}})); cgs=[]; picks=[]; await EVENTS.run(ROOF); L=lines();
    check('CG-15：和可昕視訊的頂樓版：一樣只一張、在第一句；視訊在這張之後',cgs.length===1&&cgs[0].at===0&&L.length>3,JSON.stringify({cg:cgs,n:L.length}));
    fresh(D,23,'campus',Object.assign({},KX,{KX_NYE:{1:'river'}})); cgs=[]; picks=[]; await EVENTS.run(RIVER);
    check('CG-15：和可昕在河堤跨年（ev_nye_river）不放',!cgs.length&&lines().length>0,JSON.stringify(cgs));
    const f=cgFile('cg_nye_rooftop');
    check('CG-15：登錄的是正式檔 assets/cg/zhe/event_nye_rooftop.webp、1920×1080、標題「頂樓的跨年」',!!f&&f.file==='assets/cg/zhe/event_nye_rooftop.webp'&&!f.missing&&JSON.stringify(f.size)==='[1920,1080]'&&CG_REGISTRY.cg_nye_rooftop.title==='頂樓的跨年',JSON.stringify(f)); }
  /* ---------- A15：考完的宵夜 ---------- */
  { fresh(termDay(9,3),21,'campus',KX); meet('classmate_mingxuan'); SOCIAL.remember('classmate_mingxuan','SAW_HIM_STUDY',''); picks=['繼續吃滷味']; await EVENTS.run(ev('ev_midterm_supper'));
    const o=opts.find(x=>x.includes('「……他有念啦。」'));
    check('A15：明軒那個選項：「……他有念啦。」／（繼續吃滷味）（BB 2026-10-14）',!!o&&JSON.stringify(o)==='["「……他有念啦。」","（繼續吃滷味）"]'&&!G.flags.SUPPER_MX_EGG&&!lines().includes('明軒瞪了你一眼。'),JSON.stringify(o)); }
  /* ---------- A19：以安的第一則訊息 ---------- */
  const anMsgs=()=>(G.msgs||[]).filter(m=>m.tag==='an_first_note'||m.tag==='an_split_table').map(m=>({tag:m.tag,day:m.day,h:m.h,th:m.th,from:m.from,text:m.text}));
  const D2=2;
  { fresh(D2,17.8,'cafe',{afternoonDone:true,AN_CONTACT_DAY2:D2}); INV.rec(G); G.contacts.heroine_01=D2; run(17.8,21.4); check('A19：21:30 以前還沒有',!anMsgs().length);
    run(21.4,22); const M=anMsgs();
    check('A19：第二天要了聯絡方式＝當晚 21:30 以安「📷（筆記的照片，字很整齊）」（AA 2026-10-14）',M.length===1&&M[0].tag==='an_first_note'&&M[0].day===D2&&M[0].h===21.5&&M[0].th==='p:heroine_01'&&M[0].from==='heroine_01'&&M[0].text==='📷（筆記的照片，字很整齊）',JSON.stringify(M));
    run(22,23.5); check('A19：只一則',anMsgs().length===1); }
  { fresh(D2+1,8,'dorm',{afternoonDone:true,AN_CONTACT_DAY2:D2}); INV.rec(G); G.contacts.heroine_01=D2; run(8,8.3); const M=anMsgs();
    check('A19：當晚 21:30 以前就睡了＝隔天早上補收、時間照舊（第二天 21:30）',M.length===1&&M[0].day===D2&&M[0].h===21.5,JSON.stringify(M)); }
  { fresh(D2,17.8,'campus',{afternoonDone:true}); run(17.8,23); check('A19：沒和她走的玩家（下午結束時默默加聯絡方式）有聯絡方式、沒有這則訊息',INV.hasContact(G,'heroine_01')&&!anMsgs().length,JSON.stringify(anMsgs())); }
  { fresh(D2+4,9,'dorm',{afternoonDone:true,AN_CONTACT_DAY2:D2}); INV.rec(G); G.contacts.heroine_01=D2; run(9,22); check('A19：過了隔天才讀到的存檔不補',!anMsgs().length,JSON.stringify(anMsgs())); }
  /* ---------- A12：分工表 ---------- */
  { const DS=termDay(5,4);
    const split=(partner,contact)=>{ fresh(DS,12,'classroom',contact?{afternoonDone:true}:{});   /* 第二天下午結束時大家都會默默拿到她的聯絡方式（silentContact）：「沒有聯絡方式」只能拿掉 afternoonDone 來測這個保險 */ G.events.last.ev_an_report_split=DS; G.events.done.ev_an_report_split=1; if(partner) SOCIAL.remember('heroine_01','REPORT_PARTNER',''); if(contact){ INV.rec(G); G.contacts.heroine_01=2; } run(12,22.5); return anMsgs().filter(m=>m.tag==='an_split_table'); };
    let M=split(true,true);
    check('A12：「好，一起寫。」＋有她聯絡方式＝那天 21:30 以安「📷（報告的分工表）」（AA 2026-10-14）',M.length===1&&M[0].day===DS&&M[0].h===21.5&&M[0].th==='p:heroine_01'&&M[0].text==='📷（報告的分工表）',JSON.stringify(M));
    M=split(false,true); check('A12：沒有一起寫＝沒有分工表',!M.length);
    M=split(true,false); check('A12：沒有她的聯絡方式＝沒有分工表',!M.length); }
  /* ---------- 授權紀錄 ---------- */
  { const lic=fs.readFileSync(path.join(ROOT,'LICENSES.md'),'utf8');
    check('LICENSES.md：記了 CG-14、CG-15（使用者用 AI 生成、BB 檢查通過）',lic.includes('assets/cg/zhe/event_midautumn_riverside.webp')&&lic.includes('assets/cg/zhe/event_nye_rooftop.webp')); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
