// 總圖研究小間、5F 書庫的劇情（AA_399 第 3 節，企劃線 5d09bb725；src/lupstory3d.js）——不需要瀏覽器。
//   1 預約：大四起 1F 服務台多「預約研究小間（三小時）」；一天一次；三小時以後 08 關門；大三沒有
//   2 學姊：2028-02～2029-05 平日 14～17 在 03；美國那學期（她不在臺北）不在；03 的門「敲玻璃」＝便利貼照關係一句（一天一次、同一天再敲同一張）；還沒到有點熟沒有
//   3 方奕廷：大二上第 12～14 週週二 15～17 在 5F 最裡面那一排；說話前多一句（一次）；別的週、別的時間不在
//   4 index.html：lupstory3d.js 在 library_upper3d.js、loans3d.js、story3d.js 後面
// 修改前（2bf7ff242）：沒有 src/lupstory3d.js——全部 FAIL。用法：node tests/lupstory_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
if(typeof P3==='undefined') global.P3={M:()=>({})}; if(typeof Z3==='undefined') global.Z3={ZONES:{}}; if(!Z3.ZONES) Z3.ZONES={}; if(typeof ASSETS==='undefined') global.ASSETS={manifest:{}};
const L3=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); return true; };
for(const f of ['src/data/library_upper_layouts.js','src/library_upper3d.js','src/data/sis_b8_events.js','src/loans3d.js']) L3(f);
let ok=false, err=''; try{ ok=L3('src/lupstory3d.js'); }catch(e){ err=String(e); }
const X=()=>typeof LUPS!=='undefined'?LUPS:null, D=k=>STORY.dayOfKey(k);
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,2).join(' / ')); } };
const SIS='heroine_05', FY='npc_fangyt';
const lv=(id,st)=>{ const r=SOCIAL.rel(id); const n={ACQUAINTANCE:{fam:10},FAMILIAR:{fam:25},FRIEND:{fam:45,trust:30},CLOSE_FRIEND:{fam:65,trust:50,comf:45}}[st]||{}; Object.assign(r,{fam:0,trust:0,comf:0,npcRom:0,rom:0},n); SOCIAL.remember(id,'FIRST_MET',''); };
const fresh=(key,h,zone)=>{ const G=H.fresh(key,h,zone||'library_carrels'); GM.E.interactables=[]; GM.npc={}; spawned=[]; return G; };
let spawned=[]; GM.spawnCharacter=(id,x,z,o)=>{ spawned.push({id,x,z,o}); const n={id,obj:{position:{x,z}}}; GM.npc[id]=n; return n; };
const door03=()=>({id:'door03',label:'研究小間 03',look:'霧面玻璃門。'});

(async()=>{
await sec(0,()=>{ const idx=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'), at=s=>idx.indexOf(s);
  check('0. 載入 src/lupstory3d.js；index.html 在 library_upper3d.js、loans3d.js、story3d.js 後面',ok&&!!X()&&at('src/lupstory3d.js')>at('src/loans3d.js')&&at('src/lupstory3d.js')>at('src/library_upper3d.js')&&at('src/lupstory3d.js')>at('src/story3d.js'),err); });
if(!X()){ H.done(); return; }

await sec(1,async()=>{ const G=fresh('2028-09-12',10,'library_hall');
  const O=LOANS.deskOptions(G); check('1. 大四（2028-09-12）：服務台有「預約研究小間（三小時）」',O.some(o=>o.t==='預約研究小間（三小時）'),J(O.map(o=>o.t)));
  H.picks=['預約研究小間']; await LOANS.desk(GM); check('1. 預約了：今天 10:00 起三小時（08 開門）',LUP.booked(G)&&G.flags.carrelDay===G.day&&G.flags.carrelUntil===13,J(G.flags));
  check('1. 一天一次：再去服務台沒有預約的選項',!LOANS.deskOptions(G).some(o=>/研究小間/.test(o.t)));
  G.hour=13.1; check('1. 三小時以後 08 關門',!LUP.booked(G));
  G.day+=1; G.hour=10; check('1. 隔天又可以預約',LOANS.deskOptions(G).some(o=>/研究小間/.test(o.t)));
  const G2=fresh('2028-03-14',10,'library_hall'); check('1. 大三下：沒有',!LOANS.deskOptions(G2).some(o=>/研究小間/.test(o.t))); });

await sec(2,async()=>{ const G=fresh('2028-03-14',15,'library_carrels'); lv(SIS,'FRIEND');
  check('2. 2028-03-14（二）15:00：學姊在 03（燈亮）、能敲玻璃',LUP.sisHere(G)&&X().knockOk(G));
  STORY.populate('library_carrels',GM); check('2. 進研究小間：學姊放在 03 的座位（看書）',spawned.some(s=>s.id===SIS&&s.o&&s.o.pose==='read'),J(spawned));
  H.said=[]; await STORY.interact(Object.assign(door03(),{lupKnock:true}),GM); check('2. 朋友：便利貼「五點出去。」',J(H.lines())===J(['便利貼：五點出去。'])&&G.flags.carrelNoteDay===G.day,J(H.lines()));
  H.said=[]; await STORY.interact(Object.assign(door03(),{lupKnock:true}),GM); check('2. 同一天再敲：同一張（次數不再加）',J(H.lines())===J(['便利貼：五點出去。'])&&G.flags.CARREL_NOTES.FRIEND===1);
  const rows=[['FAMILIAR','便利貼：圖書館裡不能講話。'],['CLOSE_FRIEND','便利貼：我在寫第五章。你去念你的。']]; const got=[];
  for(const [st,want] of rows){ const G1=fresh('2028-03-15',15); lv(SIS,st); H.said=[]; await X().knock(GM); got.push([st,H.lines()[0]===want]); }
  { const G1=fresh('2028-03-15',15); lv(SIS,'FRIEND'); G1.flags['dating_'+SIS]=true; H.said=[]; await X().knock(GM); got.push(['dating',J(H.lines())===J(['（便利貼上畫了一個時鐘，指著五點。）'])]); }
  check('2. 有點熟、很熟、交往中各一句（交往中是旁白）',got.every(x=>x[1]),J(got));
  { fresh('2028-03-15',15); lv(SIS,'ACQUAINTANCE'); check('2. 還沒到有點熟：不能敲',!X().knockOk(H.G)); }
  { const G1=fresh('2028-03-18',15); lv(SIS,'FRIEND'); check('2. 週六：不在',!LUP.sisHere(G1)); G1.day=D('2028-03-14'); G1.hour=17.2; check('2. 17:00 以後：不在',!LUP.sisHere(G1)); }
  { const G1=fresh('2028-10-17',15); lv(SIS,'FRIEND'); check('2. 2028-10（她在美國）：不在、03 沒有她的東西',!LUP.sisPeriod(G1)&&!LUP.sisHere(G1)); }
  { const G1=fresh('2027-10-12',15); lv(SIS,'FRIEND'); check('2. 2027（還沒開始寫論文）：不在',!LUP.sisPeriod(G1)); }
  { const G1=fresh('2028-07-31',15); lv(SIS,'FRIEND'); const e=STORY.schedEnt(CHARACTERS[SIS],{day:G1.day,hour:15,weekday:G1.weekday,flags:G1.flags,noInvite:true}); check('2. 2028-07-31 15:00：作息在總圖三樓（AA_392）＝不在 03',!!e&&e.zone!=='library_carrels'&&!LUP.sisHere(G1),JSON.stringify(e&&{zone:e.zone})); G1.day=STORY.dayOfKey('2028-03-14'); G1.weekday=CALENDAR.dateOf(G1.day).wd; check('2. 平常的 14～17（作息是空的）：在 03',LUP.sisHere(G1)); } });

await sec(3,async()=>{ const d=D('2026-11-24'); const t=CALENDAR.termOf(d); check('3. 前提：2026-11-24 是大二上第 12～14 週的週二',!!t&&t.id==='Y2S1'&&t.week>=12&&t.week<=14&&CALENDAR.dateOf(d).wd===2,J(t));
  const G=fresh('2026-11-24',15.5,'library_stacks'); H.FRIEND(FY);
  STORY.populate('library_stacks',GM); check('3. 週二 15:30 在 5F 書庫：方奕廷在最裡面那一排',spawned.some(s=>s.id===FY&&Math.abs(s.x+11)<0.01),J(spawned));
  H.said=[]; for(const f of STORY.PRE_TALK) await f(GM,{name:'方奕廷'},FY); check('3. 說話前多一句「這本借不出去，只能在這裡看。……所以我每個禮拜二來。」',H.has('這本借不出去，只能在這裡看。……所以我每個禮拜二來。'),J(H.lines()));
  H.said=[]; for(const f of STORY.PRE_TALK) await f(GM,{name:'方奕廷'},FY); check('3. 第二次不再說',!H.has('這本借不出去，只能在這裡看。……所以我每個禮拜二來。'));
  for(const [k,h,why] of [['2026-11-25',15.5,'週三'],['2026-11-24',17.5,'17:30'],['2026-12-15',15.5,'第 16 週'],['2027-11-16',15.5,'大三']]){ fresh(k,h,'library_stacks'); H.FRIEND(FY); STORY.populate('library_stacks',GM); check('3. '+why+'：不在',!spawned.some(s=>s.id===FY)); } });

H.done();
})();
