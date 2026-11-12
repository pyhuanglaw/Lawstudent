// 公館燒臘過年店休（AA_333，AA-C 56b6f64e；HOL-VA 最後一項 VA-08；AA_683 第 1 節，企劃線 ef5c6c742）——不需要瀏覽器。
//   0. 店休的日子照 AA_333 第 1 節的表（2026～2029，除夕前 6 天到初三；初四開門）
//   N1 2026-02-12 下午去店門口、在群組、和語彤是朋友（原本她在裡面刷椅子腳的條件）：只有鐵門的旁白＋「初四見」、沒有選項、熟悉度不變、不記 NOODLE_CLEAN_2026
//   N1′ AA_683 拿掉的：店裡那一段（inside、offer、opts「我來幫忙。」「那我初四再來。」、2027 約好出去那一版 out）、NOODLE_CLEAN_<年>、C（店休期間約語彤：答應那一句、排到 18:00 以後）
//       ——資料、程式、invites3d.js 的接線都沒有了；YT_CLOSED_OUT 的 2027 店休也只有旁白
//   N2 同一年再去一次：只有鐵門的旁白
//   N3 2/10 21:00 群組「這週店休，到初三。」「阿姨說要大掃除。想吃燒臘的，初四以後。」（AA_612 A-311）；N4 2/20 12:00「開了。」「阿姨說，今天第一碗加蛋。」（照留）
//   AA_685 A2（企劃線 c96613e51，AA-C 定 D109）：A、D 改阿哲傳（from zhe），句號照 AA_477 第 3 節拿掉（中間的換一個空格）；D 2026「阿姨說 今天每盤送一顆滷蛋」、2029「每盤送滷蛋 今年也是」——N3、N4 照新字（決定改了，不是放寬）
//   另外：不在群組＝沒有 A、D，B 只有旁白；不是朋友／17:00 以後＝只有旁白；那天在店裡有約＝照常進去；店休以外照常；接線（story3d.js、index.html）
// 修改前：沒有 NOODLE_CLOSED（第 0 項 FAIL）。AA_683 以前的 src（89d78a186 的 src、index.html 放進這一支實際跑過）：FAILED 8（N1 兩項、N1′ 三項、N3、N4 的 2028、接線）；修改後 ALL PASS。用法：node tests/noodle_closed_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|CG_REGISTRY|NOODLE_CLOSED)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/l118_redo772.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/story3d.js','src/classes3d.js','src/noodle_closed3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
check('0. 有 NOODLE_CLOSED',typeof NOODLE_CLOSED!=='undefined');
if(fails){ console.log('FAILED '+fails); process.exit(1); }
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(){ return true; },setBg(){}}; global.CHAR={setExpr(){}};
let said=[], opts=[], picks=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},sceneBegin(){},sceneEnd(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},setGoal(){},toast(){},updateHUD(){},phoneBadge(){},titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t)); const w=picks.shift(); if(typeof w==='string'){ const k=o.findIndex(q=>q.t.includes(w)); return k<0?0:k; } return w||0; }};
const D=k=>STORY.dayOfKey(k);
const fresh=(key,hour,flags)=>{ const day=D(key); G={v:3,day,hour,zone:'gongguan',stage:'law',weekday:CALENDAR.dateOf(day).wd%7,weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,YT_MET_JOB:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,introDone:true,afternoonDone:true,classDone:true,metAn:true},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); ROM.rec(G); said=[]; opts=[]; picks=[]; return G; };
const FRIEND=()=>{ const r=SOCIAL.rel('heroine_03'); r.fam=45; r.trust=30; r.comf=0; SOCIAL.remember('heroine_03','FIRST_MET',''); };
const group=()=>PHONE.join(G,'noodle_team','桌遊團');
// 0
{ const T={2026:['2026-02-10','2026-02-19','2026-02-20'],2027:['2027-01-30','2027-02-08','2027-02-09'],2028:['2028-01-19','2028-01-28','2028-01-29'],2029:['2029-02-06','2029-02-15','2029-02-16']}; let ok=true, info=[];
  for(const y in T){ const [a,b,o]=T[y].map(D), W=NOODLE_CLOSED.window(a); if(!W||W.from!==a||W.to!==b||W.open!==o||NOODLE_CLOSED.window(a-1)||NOODLE_CLOSED.window(b+1)){ ok=false; info.push(y); } }
  check('0. 店休的日子照 AA_333 第 1 節的表（四年；前一天、初四不是店休）',ok,info.join()); }
// N1
fresh('2026-02-12',14); group(); FRIEND(); const fam0=SOCIAL.rel('heroine_03').fam; picks=['我來幫忙']; const r1=(async()=>NOODLE_CLOSED.door(GM))();
(async()=>{ const handled=await r1;
  check('N1. 在群組、和語彤是朋友、下午 2 點（原本她在裡面的條件）：只有鐵門的旁白「（鐵門拉下來一半，門上貼著阿姨寫的紙：「過年休息，初四見。」）」、沒有選項、不進去',handled===true&&said.length===1&&said[0].who===null&&said[0].t==='（鐵門拉下來一半，門上貼著阿姨寫的紙：「過年休息，初四見。」）'&&said[0].t===NOODLE_CLOSED.L.door&&opts.length===0,JSON.stringify(said.map(s=>s.t)));
  check('N1. 熟悉度不變、不記 NOODLE_CLEAN_2026',SOCIAL.rel('heroine_03').fam===fam0&&!('NOODLE_CLEAN_2026' in G.flags));
  { const stripC=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/mg,'');   /* 註解（檔頭寫了拿掉了什麼）不算，只看程式和資料 */
    const src=stripC(fs.readFileSync(path.join(ROOT,'src/noodle_closed3d.js'),'utf8')), iv=stripC(fs.readFileSync(path.join(ROOT,'src/invites3d.js'),'utf8')), L=NOODLE_CLOSED.L;
    const gone=['刷椅子腳','冰箱有昨天的滷蛋','「我來幫忙。」','「那我初四再來。」','抹布在那邊','阿姨塞給你一袋滷蛋','嗯。初四見。','說好要出去的','刷完這一排就走','我在外面等妳','河濱走了一圈','NOODLE_CLEAN','YT_CLOSED_OUT','店休這週我比較有空','約晚上','inviteAdjust','friendLevel'];
    check('N1′. AA_683 拿掉的：L 沒有 inside／offer／opts／invite／out，NOODLE_CLOSED 沒有 inviteAdjust；noodle_closed3d.js 裡沒有那幾句、NOODLE_CLEAN、YT_CLOSED_OUT、18:00 的規則',
      ['inside','offer','opts','invite','out'].every(k=>!(k in L))&&typeof NOODLE_CLOSED.inviteAdjust==='undefined'&&gone.every(s=>src.indexOf(s)<0)&&!/Math\.max\(W\.h,18\)/.test(src),JSON.stringify(gone.filter(s=>src.indexOf(s)>=0)));
    check('N1′. invites3d.js 沒有店休期間約語彤的接線（NOODLE_CLOSED、NC）',iv.indexOf('NOODLE_CLOSED')<0&&!/\bNC\b/.test(iv));
    check('N1′. 照留的：A、D 照年份、鐵門的旁白、店休的判斷（window、closed）、那天在店裡有約（storyDue）、門口（door）',Object.keys(L.a).length===4&&Object.keys(L.d).length===4&&typeof L.door==='string'&&['window','closed','storyDue','door','phone'].every(k=>typeof NOODLE_CLOSED[k]==='function')); }
  // N2
  said=[]; opts=[]; await NOODLE_CLOSED.door(GM);
  check('N2. 同一年再去：只有鐵門的旁白',said.length===1&&said[0].t===NOODLE_CLOSED.L.door&&opts.length===0);
  // N1′：2027 店休、有 YT_CLOSED_OUT（原本約好出去那一版）
  fresh('2027-02-01',11,{YT_CLOSED_OUT:true}); group(); FRIEND(); said=[]; opts=[]; picks=[0]; const h27=await NOODLE_CLOSED.door(GM);
  check('N1′. 2027 店休、有 YT_CLOSED_OUT（原本約好出去那一版）：也只有鐵門的旁白',h27===true&&said.length===1&&said[0].t===NOODLE_CLOSED.L.door&&opts.length===0,JSON.stringify(said.map(s=>s.t)));
  // 不是朋友、17:00 以後、不在群組
  fresh('2026-02-12',14); group(); said=[]; await NOODLE_CLOSED.door(GM); check('不是朋友：只有旁白',said.length===1);
  fresh('2026-02-12',18); group(); FRIEND(); said=[]; await NOODLE_CLOSED.door(GM); check('17:00 以後：只有旁白',said.length===1);
  fresh('2026-02-12',14); FRIEND(); said=[]; await NOODLE_CLOSED.door(GM); check('不在桌遊團：只有旁白',said.length===1);
  // 那天在麵店有約
  fresh('2026-02-12',14); group(); FRIEND(); OUT.plan(G,{id:'t_noodle',day:G.day,h:18,place:'阿鳳麵店',title:'阿鳳麵店・長桌'}); said=[]; const h2=await NOODLE_CLOSED.door(GM);
  check('那天在麵店有約（出遊）：照常進去（門不擋）',h2===false&&said.length===0);
  // 店休以外
  fresh('2026-02-20',14); group(); FRIEND(); said=[]; const h3=await NOODLE_CLOSED.door(GM); check('初四：照常進去',h3===false&&said.length===0);
  fresh('2025-02-01',14,{}); G.stage='econ'; check('經濟系那一年：沒有店休（只有法律系四年）',!NOODLE_CLOSED.closed(G));
  // N3、N4
  fresh('2026-02-10',21.1); group(); STORY.phoneRules(GM); PHONE.tick(G);
  const M=()=>(G.msgs||[]).filter(m=>m.th==='g:noodle_team').map(m=>m.text);
  check('N3. 2/10 21:00 群組：阿哲「這週店休，到初三」「阿姨說要大掃除 想吃燒臘的，初四以後」（AA_612 A-311；AA_685 A2：阿哲傳、句號照 AA_477 拿掉）',JSON.stringify(M())===JSON.stringify(['這週店休，到初三','阿姨說要大掃除 想吃燒臘的，初四以後'])&&JSON.stringify(M())===JSON.stringify(NOODLE_CLOSED.L.a[2026])&&/* AA_456 1-2：L.a 改成照年份，2026 是原句 */(G.msgs||[]).filter(m=>m.th==='g:noodle_team').every(m=>m.from==='zhe'),JSON.stringify(M()));
  G.day=D('2026-02-20'); G.hour=12.1; STORY.phoneRules(GM); PHONE.tick(G);
  check('N4. 2/20 12:00 阿哲「開了」「阿姨說 今天每盤送一顆滷蛋」（AA_685 A2：「第一碗加蛋」是麵店的說法）',M().slice(-2).join('|')==='開了|阿姨說 今天每盤送一顆滷蛋'&&(G.msgs||[]).filter(m=>m.tag==='noodle_closed_d_2026').every(m=>m.from==='zhe'),JSON.stringify(M()));
  fresh('2026-02-10',21.1); STORY.phoneRules(GM); PHONE.tick(G); check('不在桌遊團：沒有群組訊息',!(G.msgs||[]).some(m=>m.th==='g:noodle_team'));
  check('N4. 2028 初四：「開了」「阿姨從老家帶了一箱橘子，吃飯送一顆」（AA_612 A-312；AA_685 A2 照字拿掉句號）',JSON.stringify(NOODLE_CLOSED.L.d[2028])===JSON.stringify(['開了','阿姨從老家帶了一箱橘子，吃飯送一顆']));
  // 接線
  { const s=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'), iv=fs.readFileSync(path.join(ROOT,'src/invites3d.js'),'utf8'), ix=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
    check('接線：店門口（S.interact）、index.html、手機規則（STORY.PHONE_RULES）；邀約（invites3d.js）的接線 AA_683 拿掉了（N1′）',/if\(it\.exit&&it\.exit\.to==='noodle'&&typeof NOODLE_CLOSED!=='undefined'&&await NOODLE_CLOSED\.door\(GM\)\) return true;/.test(s)&&iv.indexOf('NOODLE_CLOSED.inviteAdjust')<0&&/src\/noodle_closed3d\.js/.test(ix)&&STORY.PHONE_RULES.length>=1); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });
