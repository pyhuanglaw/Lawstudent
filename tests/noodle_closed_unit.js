// 阿鳳麵店過年店休（AA_333，AA-C 56b6f64e；HOL-VA 最後一項 VA-08）——不需要瀏覽器。
//   0. 店休的日子照 AA_333 第 1 節的表（2026～2029，除夕前 6 天到初三；初四開門）
//   N1 2026-02-12 下午去麵店、在麵店團、和語彤是朋友：鐵門＋「初四見」；語彤刷椅子腳；選「我來幫忙」：熟悉 +1、滷蛋；記 NOODLE_CLEAN_2026
//   N2 同一年再去一次：只有鐵門的旁白
//   N3 2/10 21:00 群組「這週店休，到初三。」；N4 2/20 12:00「開了。」「阿姨說，今天第一碗加蛋。」
//   另外：不在麵店團＝沒有 A、D，B 只有旁白；不是朋友／17:00 以後＝只有旁白；那天在麵店有約＝照常進去；店休以外照常；
//   C 店休期間約語彤＝時間排到 18:00 以後、答應那句換掉（別人、店休以外不換）；接線（story3d.js、invites3d.js、index.html）
// 修改前：沒有 NOODLE_CLOSED（第 0 項 FAIL）。用法：node tests/noodle_closed_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|CG_REGISTRY|NOODLE_CLOSED)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/story3d.js','src/classes3d.js','src/noodle_closed3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
check('0. 有 NOODLE_CLOSED',typeof NOODLE_CLOSED!=='undefined');
if(fails){ console.log('FAILED '+fails); process.exit(1); }
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(){ return true; },setBg(){}}; global.CHAR={setExpr(){}};
let said=[], opts=[], picks=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},sceneBegin(){},sceneEnd(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},setGoal(){},toast(){},updateHUD(){},phoneBadge(){},titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t)); const w=picks.shift(); if(typeof w==='string'){ const k=o.findIndex(q=>q.t.includes(w)); return k<0?0:k; } return w||0; }};
const D=k=>STORY.dayOfKey(k);
const fresh=(key,hour,flags)=>{ const day=D(key); G={v:3,day,hour,zone:'gongguan',stage:'law',weekday:CALENDAR.dateOf(day).wd%7,weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,introDone:true,afternoonDone:true,classDone:true,metAn:true},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); ROM.rec(G); said=[]; opts=[]; picks=[]; return G; };
const FRIEND=()=>{ const r=SOCIAL.rel('heroine_03'); r.fam=45; r.trust=30; r.comf=0; SOCIAL.remember('heroine_03','FIRST_MET',''); };
const group=()=>PHONE.join(G,'noodle_team','麵店團');
// 0
{ const T={2026:['2026-02-10','2026-02-19','2026-02-20'],2027:['2027-01-30','2027-02-08','2027-02-09'],2028:['2028-01-19','2028-01-28','2028-01-29'],2029:['2029-02-06','2029-02-15','2029-02-16']}; let ok=true, info=[];
  for(const y in T){ const [a,b,o]=T[y].map(D), W=NOODLE_CLOSED.window(a); if(!W||W.from!==a||W.to!==b||W.open!==o||NOODLE_CLOSED.window(a-1)||NOODLE_CLOSED.window(b+1)){ ok=false; info.push(y); } }
  check('0. 店休的日子照 AA_333 第 1 節的表（四年；前一天、初四不是店休）',ok,info.join()); }
// N1
fresh('2026-02-12',14); group(); FRIEND(); const fam0=SOCIAL.rel('heroine_03').fam; picks=['我來幫忙']; const r1=(async()=>NOODLE_CLOSED.door(GM))();
(async()=>{ const handled=await r1;
  check('N1. 鐵門的旁白、語彤刷椅子腳、選項兩個',handled===true&&said[0].t===NOODLE_CLOSED.L.door&&said[1].t===NOODLE_CLOSED.L.inside&&said[2].t===NOODLE_CLOSED.L.offer&&JSON.stringify(opts[0])==='["「我來幫忙。」","「那我初四再來。」"]',JSON.stringify(said.map(s=>s.t)));
  check('N1.「我來幫忙」：「好。抹布在那邊。你刷這一排。」＋滷蛋、熟悉 +1、記 NOODLE_CLEAN_2026',said.some(s=>s.t==='好。抹布在那邊。你刷這一排。')&&said.some(s=>s.t==='（刷完一排椅子，阿姨塞給你一袋滷蛋。）')&&SOCIAL.rel('heroine_03').fam===fam0+1&&G.flags.NOODLE_CLEAN_2026===true);
  // N2
  said=[]; opts=[]; await NOODLE_CLOSED.door(GM);
  check('N2. 同一年再去：只有鐵門的旁白',said.length===1&&said[0].t===NOODLE_CLOSED.L.door&&opts.length===0);
  // 不是朋友、17:00 以後、不在群組
  fresh('2026-02-12',14); group(); said=[]; await NOODLE_CLOSED.door(GM); check('不是朋友：只有旁白',said.length===1);
  fresh('2026-02-12',18); group(); FRIEND(); said=[]; await NOODLE_CLOSED.door(GM); check('17:00 以後：只有旁白',said.length===1);
  fresh('2026-02-12',14); FRIEND(); said=[]; await NOODLE_CLOSED.door(GM); check('不在麵店團：只有旁白',said.length===1);
  // 那天在麵店有約
  fresh('2026-02-12',14); group(); FRIEND(); OUT.plan(G,{id:'t_noodle',day:G.day,h:18,place:'阿鳳麵店',title:'阿鳳麵店・長桌'}); said=[]; const h2=await NOODLE_CLOSED.door(GM);
  check('那天在麵店有約（出遊）：照常進去（門不擋）',h2===false&&said.length===0);
  // 店休以外
  fresh('2026-02-20',14); group(); FRIEND(); said=[]; const h3=await NOODLE_CLOSED.door(GM); check('初四：照常進去',h3===false&&said.length===0);
  fresh('2025-02-01',14,{}); G.stage='econ'; check('經濟系那一年：沒有店休（只有法律系四年）',!NOODLE_CLOSED.closed(G));
  // N3、N4
  fresh('2026-02-10',21.1); group(); STORY.phoneRules(GM); PHONE.tick(G);
  const M=()=>(G.msgs||[]).filter(m=>m.th==='g:noodle_team').map(m=>m.text);
  check('N3. 2/10 21:00 群組：「這週店休，到初三。」「阿姨說要大掃除。想吃麵的，初四以後。」（語彤）',JSON.stringify(M())===JSON.stringify(NOODLE_CLOSED.L.a[2026])&&/* AA_456 1-2：L.a 改成照年份，2026 是原句 */(G.msgs||[]).filter(m=>m.th==='g:noodle_team').every(m=>m.from==='heroine_03'),JSON.stringify(M()));
  G.day=D('2026-02-20'); G.hour=12.1; STORY.phoneRules(GM); PHONE.tick(G);
  check('N4. 2/20 12:00「開了。」「阿姨說，今天第一碗加蛋。」',M().slice(-2).join('|')==='開了。|阿姨說，今天第一碗加蛋。',JSON.stringify(M()));
  fresh('2026-02-10',21.1); STORY.phoneRules(GM); PHONE.tick(G); check('不在麵店團：沒有群組訊息',!(G.msgs||[]).some(m=>m.th==='g:noodle_team'));
  // C
  fresh('2026-02-11',10); const W={day:D('2026-02-12'),h:15}, a=NOODLE_CLOSED.inviteAdjust(G,'heroine_03',W), b=NOODLE_CLOSED.inviteAdjust(G,'heroine_01',W), c=NOODLE_CLOSED.inviteAdjust(G,'heroine_03',{day:D('2026-02-21'),h:15}), d=NOODLE_CLOSED.inviteAdjust(G,'heroine_03',{day:W.day,h:19});
  check('C. 店休期間約語彤：15:00 排到 18:00、換那一句；19:00 不動；別人、店休以外不換',a&&a.h===18&&a.line===NOODLE_CLOSED.L.invite&&!b&&!c&&d&&d.h===19);
  // 接線
  { const s=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'), iv=fs.readFileSync(path.join(ROOT,'src/invites3d.js'),'utf8'), ix=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
    check('接線：麵店門口（S.interact）、邀約（invites3d.js）、index.html、手機規則（STORY.PHONE_RULES）',/if\(it\.exit&&it\.exit\.to==='noodle'&&typeof NOODLE_CLOSED!=='undefined'&&await NOODLE_CLOSED\.door\(GM\)\) return true;/.test(s)&&/NOODLE_CLOSED\.inviteAdjust\(G,id,W\)/.test(iv)&&/if\(NC\)\{ await GM\.say\(who,'「'\+NC\.line\+'」'\)/.test(iv)&&/src\/noodle_closed3d\.js/.test(ix)&&STORY.PHONE_RULES.length>=1); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });
