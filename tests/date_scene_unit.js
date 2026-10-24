// 約會現場的台詞（DATE-S6；src/date3d.js 的 arriveLine／spotLine／closeLine、date_lines.js 的 loc＝lines/Dxx.json 白名單匯入；BB_128 2-6、2-7、2-9）。用法：node tests/date_scene_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|DATE|DATE_DATA|DATE_LINES|ROM)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/classes3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/date3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); said=[]; opts=[]; picks=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; if(STORY._fy) STORY._fy.reset(); };
const R=(id,fam,trust,comf)=>{ const r=SOCIAL.rel(id); r.fam=fam; r.trust=trust||0; r.comf=comf||0; };
const LV={ACQ:[10],FAM:[25],FRI:[45,30],CLO:[65,50,45]};
const run=(h0,h1,st)=>{ st=st||0.05; for(let h=h0;h<=h1+1e-9;h+=st){ G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(G); } };
const termDay=(term,w,wd)=>STORY.termDay(term,w,wd);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
const TH=(th)=>(G.msgs||[]).filter(m=>m.th===th);
GM.money=d=>{ G.money+=d; }; GM.toast=()=>{}; GM.caption=()=>{}; GM.updateHUD=()=>{};
const ADV2=global.ADV; ADV2.active=false;
(async()=>{
  const day=termDay('Y1S2',5,6);
  OUT.BG.d13_base_sunset=OUT.BG.d13_base_sunset||{label:'淡水',image:'x'};
  const go=async(who,picks0,o)=>{ o=o||{}; const b=DATE.book(G,{who,locs:['D13'],transport:'mrt',day:G.day,depart:15}); const q=OUT.get(G,'date_'+b.trip); G.hour=15; said=[]; opts=[]; picks=['出發'].concat(picks0); await OUT.prompt(GM,q); return {b,t:DATE.trip(G,b.trip),L:lines()}; };
  check('0. date_lines.js 有 D01～D32 全部地點的台詞（白名單＠57de1709，AA-C 10-21 32 個地點口語審完；D13 2026-10-23 換 345234b3：AA_389 第 1 點交換回來版，再換 e78814663：AA_426 第 6 節「……開玩笑的」改掉）',Array.from({length:32},(_,k)=>'D'+String(k+1).padStart(2,'0')).every(k=>DATE_LINES.loc&&DATE_LINES.loc[k]&&DATE_LINES.loc[k].lines)&&/D13\.json@(57de1709|345234b3|e78814663)/.test(DATE_LINES.source),Object.keys(DATE_LINES.loc||{}).join(','));
  check('0. 她喜不喜歡讀地點檔（子晴：飲料攤喜歡、長椅不太喜歡）',DATE.likeOf('heroine_04','D13.drink')==='like'&&DATE.likeOf('heroine_04','D13.bench')==='dislike');
  // 芷若第一次去淡水
  fresh(day,9,'dorm',{}); G.money=5000;
  let r=await go('heroine_02',['飲料攤','「我幫妳點？」','河邊欄杆',0,'長椅',0,'差不多了']);
  check('1. 第一次：抵達句「第一次」那套（「淡水好像很多電影來拍過。」）',r.L.some(x=>/淡水好像很多電影來拍過。/.test(x)),r.L.join(' | '));
  check('1. 飲料攤第一次：那一套＋選擇「我幫妳點？」→「好。不要太甜。」；註記不顯示、記 TASTE＝player',r.L.some(x=>/我點最普通的那個/.test(x))&&r.L.some(x=>/好。不要太甜。/.test(x))&&!r.L.some(x=>/記 `?TASTE/.test(x))&&DATE.mem(G,'heroine_02','D13').taste==='player',r.L.join(' | '));
  check('1. 第三個互動點之後她說「差不多了」那一句（BB_128 3-6）',r.L.some(x=>/今天夠了|散場的感覺/.test(x)),r.L.join(' | '));
  check('1. 收尾句「第一次」（「太陽快下去了。」）',r.L.some(x=>/太陽快下去了。/.test(x)),r.L.join(' | '));
  check('1. 記得去過哪些互動點、上一次點的（dateMemory，存檔）',JSON.stringify(DATE.mem(G,'heroine_02','D13').picks)==='["D13.drink","D13.rail","D13.bench"]'&&DATE.mem(G,'heroine_02','D13').last.length===3,JSON.stringify(G.dateMemory));
  // 第二次：沒有第一次那套；飲料攤的「記得上次」有 {lastDrink}，TASTE 的說法還沒有＝跳過、用普通
  G.day+=1; G.weekday=wdOf(G.day); r=await go('heroine_02',['飲料攤',0,'拍照位置',0,'差不多了']);
  check('2. 第二次：抵達句不是「第一次」那套',!r.L.some(x=>/淡水好像很多電影來拍過/.test(x)),r.L.join(' | '));
  check('2. 飲料攤：「記得上次」有 {lastDrink}、TASTE 的說法 AA 還沒給 → 不出現沒填的欄位，用普通那套',!r.L.some(x=>/\{lastDrink\}|上次點，/.test(x))&&!r.L.some(x=>/我點最普通的那個/.test(x)),r.L.join(' | '));
  check('2. 拍照位置是第一次點：用「第一次」那套',r.L.length>3,r.L.join(' | '));
  DATE.TASTE_WORD.player='你幫她點的那杯'; G.day+=1; G.weekday=wdOf(G.day); r=await go('heroine_02',['自己選','飲料攤',0,'差不多了']);   /* 第三次：先問快速約會（AA_128 5-4）→ 自己選 */
  check('2. 有 TASTE 的說法以後：「記得上次」那套照記憶填進去',r.L.some(x=>/你上次點你幫她點的那杯/.test(x)),r.L.join(' | ')); DATE.TASTE_WORD={};
  // 子晴：不太喜歡的互動點（不是第一次）→ 她那一句；一個都沒做就走
  fresh(day,9,'dorm',{}); G.money=5000; DATE.mem(G,'heroine_04','D13').picks=['D13.bench']; DATE.log(G,'heroine_04').byLoc.D13=2; r=await go('heroine_04',['自己選','長椅','差不多了']);
  check('3. 子晴、長椅（不太喜歡、以前點過但上一次沒點、第三次來）：「坐著？才剛到耶。」',r.L.some(x=>/坐著？才剛到耶。/.test(x)),r.L.join(' | '));
  fresh(day,9,'dorm',{}); G.money=5000; r=await go('heroine_04',['就這樣回去']);
  check('3. 一個都沒做就走：子晴那一句（BB_128 3-6）、不算次數',r.L.some(x=>/才剛到？……好。下次補/.test(x))&&!r.L.some(x=>/就這樣？$/.test(x))&&r.t.status==='cancelled',r.L.join(' | '));
  // 語彤：淡水是她的心願地點。心願事件已經做了（wish3d.js，DATE-C4、C5：聊天提到、她主動邀才演整場）；這一項測的是一般的路徑——沒有走心願事件的那一次照普通的抵達句
  fresh(day,9,'dorm',{}); G.money=5000; r=await go('heroine_03',['河邊欄杆',0,'差不多了']);
  check('4. 語彤去淡水、不是心願事件那一次（一般的路徑）：照普通的抵達句（「嗯。淡水。」那一池），不卡住',r.L.some(x=>/淡水|阿姨問我|雲很多/.test(x))&&r.t.status==='done',r.L.join(' | '));
  // 日落時間、最近 3 套不重複
  const ss=DATE.sunset(termDay('Y1S2',5,6)), ws=DATE.sunset(termDay('Y1S1',14,6)); const toM=x=>+x.slice(0,2)*60+ +x.slice(3);
  check('5. {sunset}：淡水的日落時間（三月底 18:00～18:30、十二月 17:00～17:20）',/^\d\d:\d\d$/.test(ss)&&toM(ss)>=18*60&&toM(ss)<=18*60+30&&toM(ws)>=17*60&&toM(ws)<=17*60+20,ss+' '+ws);
  fresh(day,9,'dorm',{}); const t0={locs:['D13'],day}; const pool=DATE_LINES.loc.D13.lines.heroine_02.arrive.normal; const got=[]; for(let i=0;i<4;i++){ const s=DATE.pickSet(G,'heroine_02',pool,t0,'arrive.normal'); got.push(JSON.stringify(s)); }
  check('5. 普通那一池（照階段能用的有 2 套）：輪流、不連續重複（都用過就挑最久以前的）',got.every((x,i)=>!i||x!==got[i-1]),got.map(x=>x.slice(40,70)).join(' / '));
  // 交往中：用交往中那一池
  fresh(day,9,'dorm',{dating_heroine_02:true}); G.money=5000; DATE.log(G,'heroine_02').byLoc.D13=2; r=await go('heroine_02',['自己選','差不多了']);
  check('6. 交往中、不是第一次：抵達句用交往中那一池（「今天走慢一點好不好？」）',r.L.some(x=>/今天走慢一點好不好/.test(x)),r.L.join(' | '));
  // 7 結算、快速約會、相簿（AA_128 5-1、5-4；DATE-S6）
  fresh(day,9,'dorm',{dating_heroine_04:true}); G.money=5000; G.contacts.heroine_04=1; r=await go('heroine_04',['拍照位置',0,'差不多了']);
  check('7. 結算：去了哪裡、做了什麼、花了多少錢（來回車資 100＝地點資料的來回，BUG-DATE-FARE-DOUBLE-1021）、照片存進相簿',r.L.some(x=>/今天去了淡水金色水岸：拍照位置。花了 100 元（含來回車資）。照片存進相簿。/.test(x)),r.L.slice(-2).join(' | '));
  check('7. 相簿：G.album 一張（約會、子晴、D13、交往中＝合照）',Array.isArray(G.album)&&G.album.length===1&&G.album[0].who==='heroine_04'&&G.album[0].loc==='D13'&&G.album[0].both===true&&G.album[0].trip===r.t.trip,JSON.stringify(G.album));
  { const n0=G.album.length; G.day+=1; G.weekday=wdOf(G.day); r=await go('heroine_04',['河邊欄杆','差不多了','差不多了']); check('7. 沒去拍照位置：相簿不加、結算沒有「照片」',G.album.length===n0&&!r.L.some(x=>/照片存進相簿/.test(x))&&r.t.status==='done',JSON.stringify({n:G.album.length,n0,st:r.t&&r.t.status,L:r.L.slice(-2)})); }
  fresh(day,9,'dorm',{}); G.money=5000; DATE.log(G,'heroine_04').byLoc.D13=1; r=await go('heroine_04',['差不多了']);
  check('7. 第二次去：還沒有快速約會',!opts.some(o=>o.includes('快速約會')),JSON.stringify(opts.slice(0,3)));
  fresh(day,9,'dorm',{}); G.money=5000; DATE.log(G,'heroine_04').byLoc.D13=2; const c0=DATE.log(G,'heroine_04').count|0; r=await go('heroine_04',['快速約會']);
  check('7. 第三次：問「自己選／快速約會」，快速約會＝她喜歡的優先（子晴：飲料攤）、不用她不太喜歡的（長椅）、兩個、跳過抵達和收尾、直接結算、算一次',opts.some(o=>o[0]==='自己選'&&o[1]==='快速約會')&&r.t.spots.length===2&&r.t.spots[0]==='D13.drink'&&!r.t.spots.includes('D13.bench')&&r.t.status==='done'&&(DATE.log(G,'heroine_04').count|0)===c0+1&&r.L.filter(x=>!/^（|現在要出發|（手機）：/.test(x)).length===0,JSON.stringify({spots:r.t.spots,L:r.L}));   /* （手機）：出發時間到她傳的那一則（BB_128 3-6 的出發，DATE-C2），不是現場台詞 */
  // 8. DATE-L 第一批（AA-C f21eac3c，2026-10-21）匯入以後：每個有台詞的地點、七位都約得完一次（第一次＝自己選第一個互動點 →「差不多了」），有抵達的一句、沒有例外、錢照扣
  { const H7=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan','kexin'], bad=[];
    const ok=loc=>((DATE.loc(loc)||{}).kinds||['half']).some(k=>DATE.STAY[k]), skip=Object.keys(DATE_LINES.loc||{}).filter(l=>!ok(l));   /* 兩天一夜（overnight，例 D28 臺南）這一版還不能約：不在這一項 */
    for(const loc of Object.keys(DATE_LINES.loc||{}).filter(ok)){ for(const k of Object.keys(OUT.BG)) if(k.startsWith(loc.toLowerCase()+'_base')) OUT.BG[k]=OUT.BG[k]||{image:'x'};
      for(const who of H7){ try{ fresh(day,9,'dorm',{}); G.money=20000; const b=DATE.book(G,{who,locs:[loc],transport:(DATE.loc(loc).transport||[{}])[0].mode||'mrt',day:G.day,depart:13});
          if(!b||!b.trip){ bad.push(loc+' '+who+' 約不了'); continue; } const q=OUT.get(G,'date_'+b.trip); G.hour=13; said=[]; opts=[]; picks=['出發',0,0,'差不多了','差不多了','差不多了']; const m0=G.money; await OUT.prompt(GM,q);
          const L=lines(); if(L.length<3) bad.push(loc+' '+who+' 句子太少：'+L.length); if(G.money>=m0&&((DATE.loc(loc).admission|0)>0)) bad.push(loc+' '+who+' 沒扣錢'); }
        catch(e){ bad.push(loc+' '+who+' 例外：'+e.message); } } }
    check('8. 有台詞、這一版約得了的 '+Object.keys(DATE_LINES.loc||{}).filter(ok).length+' 個地點七位都約得完、沒有例外（兩天一夜的不在內：'+skip.join(' ')+'）',!bad.length&&skip.length<=5,bad.slice(0,8).join('；')); }
  // 9. AA-C 57de1709：「記得上次」不綁上次選哪個——第二次去（visits 1）同一個互動點就播；抽 D24（D30 是兩天一夜，這一版約不了）
  { const loc='D24', who='heroine_01', HS=((DATE_LINES.loc[loc].lines||{})[who]||{}).hotspots||{}, pid=Object.keys(HS).find(k=>HS[k].remember&&(HS[k].remember.lines||[]).length);
    fresh(day,9,'dorm',{}); G.money=20000; const b=DATE.book(G,{who,locs:[loc],transport:(DATE.loc(loc).transport||[{}])[0].mode||'mrt',day:G.day,depart:13}); const t=b&&DATE.trip(G,b.trip);
    let L=[]; if(pid&&t){ DATE.mem(G,who,loc).picks=[pid]; said=[]; await DATE.spotLine(GM,t,pid,1); L=lines(); }
    const want=pid?(HS[pid].remember.lines||[]).map(x=>x.text||x.narr||x).filter(x=>typeof x==='string'):[];
    check('9. D24 第二次去同一個互動點：播「記得上次」（57de1709 的新句子，不看上次選哪個）',!!pid&&!!t&&want.length>0&&want.every(x=>L.some(l=>l.endsWith(x))),JSON.stringify({pid,want,L})); }
  // 10. 台詞組的 if／unless（AA_389 第 1 點：D13 芷若交換回來版 ZR_UK_BACK；D01 語彤 closing 的 YT_TEN_MINUTES 記憶）——修改前 setUsable 不看條件，兩版都會抽到
  { const findPool=(o,txt)=>{ if(Array.isArray(o)){ if(o.some(g=>g&&Array.isArray(g.lines)&&JSON.stringify(g).includes(txt))) return o; for(const x of o){ const r=findPool(x,txt); if(r) return r; } } else if(o&&typeof o==='object'){ for(const k in o){ const r=findPool(o[k],txt); if(r) return r; } } return null; };
    const pool=findPool(DATE_LINES.loc.D13.lines.heroine_02,'英國的河比較窄。'), t0={locs:['D13'],day};
    const hi=id=>{ const r=SOCIAL.rel(id); Object.assign(r,{fam:80,trust:70,comf:70,npcRom:60,rom:40}); };
    const draw=(flags)=>{ fresh(day,9,'dorm',flags); hi('heroine_02'); const out=new Set(); for(let i=0;i<12;i++){ const s=pool&&DATE.pickSet(G,'heroine_02',pool,t0,'d13.rail'); if(s) out.add(JSON.stringify(s.lines)); } return [...out].join('｜'); };
    const a=draw({}), b=draw({ZR_UK_BACK:true});
    check('10. D13 欄杆：還沒交換回來＝不會抽到「英國的河比較窄。」；交換回來（ZR_UK_BACK）＝不會抽到「以後出國，應該會想到這條河吧。」',!!pool&&a.includes('以後出國，應該會想到這條河吧。')&&!a.includes('英國的河比較窄。')&&b.includes('英國的河比較窄。')&&!b.includes('以後出國，應該會想到這條河吧。'),JSON.stringify({tier:DATE.tierOf(G,'heroine_02'),a,b}));
    const yp=findPool(DATE_LINES.loc.D01.lines.heroine_03,'今天的十分鐘，比較長。'), t1={locs:['D01'],day};
    const ydraw=(mem)=>{ fresh(day,9,'dorm',{}); hi('heroine_03'); if(mem) SOCIAL.remember('heroine_03','YT_TEN_MINUTES',''); const out=new Set(); for(let i=0;i<12;i++){ const s=yp&&DATE.pickSet(G,'heroine_03',yp,t1,'d01.close'); if(s) out.add(JSON.stringify(s.lines)); } return [...out]; };
    const ya=ydraw(false), yb=ydraw(true), memLine=JSON.stringify((yp||[]).find(g=>g.if)&&(yp||[]).find(g=>g.if).lines);
    check('10. D01 語彤 closing：沒有「十分鐘」記憶＝不抽 if 那一組；有＝不抽 unless 那一組',!!yp&&!ya.includes(memLine)&&yb.includes(memLine)&&yb.length===1,JSON.stringify({ya,yb})); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
