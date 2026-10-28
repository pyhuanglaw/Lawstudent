// 自由出行第三批景點的偶遇：AA 六位（AA_271，AA-C 01e9d706／aa_walk_v1.json 0b478a53）＋BB 五位（BB_213＋bb_walk_v1.json batch:3，b0c20f70）：
//   1. 資料：六列、作息同一筆（dates、vacation、weeks 也一樣）、followUp＝之後在學校的一句、同行／離開／重訪的台詞都在、互動點都在景點上；
//   2. 新條件：dates（含頭尾；以安回台中、阿哲回高雄，除夕～初三不排）、vacation（語彤 D14 寒暑假）、weeks 陣列（柏翰第 6、7 週、Alison 第 3、6、11、14 週、芯慈第 4、12 週）；
//   3. 同行：Alison D01、阿哲 D29 不限關係；柏翰 D11 朋友以上；芯慈不一起走；
//   4. BB 五位（第 8 項）：學期、週次、下雨（D08 沒有、D10 台階有遮照常）、沛珊沒有前任版、可昕的予樂讓位句、大四上學姊不在北投；
//   5. 修改前（9264002f）：沒有這些列、weeks 陣列被當成單雙週。
// 用法：node tests/enc_batch3_unit.js
require('./alison.js');   /* AA_380：企劃線的舊稿還寫「小語」，讀稿的時候照匯入工具換成 Alison */
const vm=require('vm'), fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.location={search:''}; global.document={getElementById:()=>null,addEventListener(){}};
global.THREE={Vector3:function(x,y,z){this.x=x;this.y=y;this.z=z;}}; global.P3={CAST:new Proxy({},{get:(t,k)=>({name:String(k)})})};
global.CHAR={build:()=>({position:{x:0,y:0,z:0,set(){}},rotation:{y:0},userData:{}}),setExpr(){}};
let GG=null; const STAGE={};
global.SOCIAL={STAGES:['STRANGER','ACQUAINTANCE','FAMILIAR','FRIEND','CLOSE_FRIEND','POSSIBLE_ROMANTIC_INTEREST','ROMANTIC_TENSION','RELATIONSHIP'],MEMORY_LABEL:{},
  stage:id=>GG.flags['dating_'+id]?'RELATIONSHIP':(STAGE[id]||'ACQUAINTANCE'),displayName:id=>(CHARACTERS[id]&&CHARACTERS[id].name)||id,
  has:(id,tag)=>!!(GG.social.mem[id]&&GG.social.mem[id].some(m=>m.tag===tag)),remember:(id,tag)=>{ (GG.social.mem[id]||(GG.social.mem[id]=[])).push({tag,day:GG.day}); },activity:()=>({})};
global.EVENTS={cond:c=>(c.flags||[]).every(f=>GG.flags[f]),npcOf:()=>null,onEnter(){},tick(){}};
for(const f of ['src/data/calendar.js','src/data/characters.js','src/data/places.js','src/story3d.js','src/home3d.js','src/outings3d.js','src/data/free_trips.js','src/freetrip3d.js','src/data/encounters.js','src/data/enc_walk.js','src/encounter3d.js'])
  vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (CALENDAR|CHARACTERS|STORY|HOME|PLACES|SOCIAL_GRAPH|UNFAMILIAR_POOL|PORTRAITS|OUT|FREE_TRIPS|TRIP|ENCOUNTERS|ENC_WALK|ENC)\s*=/mg,'global.$1='),{filename:f});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const B3={heroine_01:'D26',heroine_03:'D14',classmate_bohan:'D11',yu:'D01',classmate_xinci:'D02',zhe:'D29'};
const BB3={heroine_04:'D01',heroine_02:'D02',heroine_05:'D11',classmate_peishan:'D08'};   /* 可昕 D10 不在台大的作息表（kexin:true）*/
const rowOf=(who,spot)=>ENCOUNTERS.rows.find(r=>r.who===who&&r.spot===spot);
const K=k=>STORY.dayOfKey(k);
const mk=(day,hour,o)=>{ const G=Object.assign({day,hour,weekday:CALENDAR.dateOf(day).wd%7,zone:'gongguan',flags:{},social:{mem:{}},courses:{},invites:[],money:5000,weather:'clear',stage:'law'},o||{}); GG=G; return G; };
const at=(G,spot)=>ENC.candidates(G,spot).map(c=>c.row.who).sort().join(',');
const why=(G,spot)=>{ const w=[]; ENC.candidates(G,spot,w); return w.join(' '); };
(async()=>{
// 1. 資料
{ const bad=[], sch=[];
  for(const [who,spot] of Object.entries(B3)){ const r=rowOf(who,spot); if(!r){ bad.push(who+'@'+spot+':沒有這一列'); continue; }
    const e=(CHARACTERS[who].daily_schedule||[]).find(q=>q.enc===spot);
    if(!e||e.zone!==null||e.act!=='out'||e.away!==r.away||e.from!==r.from||e.to!==r.to||e.days.join()!==r.days.join()) { bad.push(who+'@'+spot+':作息'); continue; }
    for(const k of ['terms','weeks','dates','vacation']) if(JSON.stringify(e[k]||null)!==JSON.stringify(r[k]||null)) bad.push(who+'@'+spot+':'+k);
    const sp=TRIP.spot(spot); if(!sp) bad.push(spot+':沒有景點');
    const W=ENC_WALK.walk.filter(q=>q.who===who&&q.spot===spot); for(const q of W) if(q.act!=='walk'&&!(sp&&sp.points.some(p=>p.id===q.act))) bad.push(q.act+':互動點不在景點上');
    if(r.join!==false&&!W.length) bad.push(who+'@'+spot+':沒有同行台詞'); if(r.join!==false&&!ENC_WALK.leave.some(q=>q.who===who&&q.spot===spot)) bad.push(who+'@'+spot+':沒有離開');
    if(!ENC_WALK.revisit.some(q=>q.who===who&&q.spot===spot)) bad.push(who+'@'+spot+':沒有重訪');
    const s=ENCOUNTERS.school[r.memo]; if(!s||s.who!==who||!ENCOUNTERS.labels[r.memo]) sch.push(r.memo); }
  check('1. 六列都在、作息同一筆（時段、星期、terms、weeks、dates、vacation）、景點和互動點對得上、同行／離開／重訪都有',!bad.length,bad.join(' '));
  check('1. 每列的 memo 有人物頁的字和之後在學校的一句（aa_walk_v1 followUp）',!sch.length,sch.join(' '));
  const fu=JSON.parse(require('child_process').execSync('git show 0b478a53:docs/story_planning/free_trip/aa_walk_v1.json',{cwd:ROOT,encoding:'utf8',maxBuffer:8<<20,stdio:['ignore','pipe','ignore']})||'{}').followUp||[];
  const diff=fu.filter(q=>Object.values(B3).some(sp=>q.mem==='ENC_'+sp+q.mem.slice(7))&&ENCOUNTERS.school[q.mem]&&ENCOUNTERS.school[q.mem].lines[0]!==q.line);
  check('1. 之後在學校的一句和 aa_walk_v1.json 的 followUp 一字不差',fu.length>0&&!diff.length,diff.map(q=>q.mem).join(' ')); }
// 2. 以安 D26：她回台中的日子的週六 14～17
{ STAGE.heroine_01='FRIEND';
  let G=mk(K('2026-01-24'),15); check('2. 以安 D26：2026-01-24（大一寒假）週六 15:00 在臺中',G.weekday===6&&at(G,'D26')==='heroine_01',at(G,'D26')+' '+why(G,'D26'));
  G=mk(K('2026-02-21'),15); check('2. 2026-02-21 週六：過了她回台中的日子（2/20 為止）',G.weekday===6&&at(G,'D26')==='');
  G=mk(K('2028-01-29'),15); check('2. 大三寒假 2028-01-29 週六：她留臺北，不在臺中',G.weekday===6&&at(G,'D26')==='');
  G=mk(K('2026-01-24'),17.5); check('2. 17:30：她回家了（14～17）',at(G,'D26')==='');
  check('2. dates 含頭尾：2026-01-20、2026-02-20 都算，2026-02-21 不算',STORY.inDates(mk(K('2026-01-20'),9),rowOf('heroine_01','D26').dates)&&STORY.inDates(mk(K('2026-02-20'),9),rowOf('heroine_01','D26').dates)&&!STORY.inDates(mk(K('2026-02-21'),9),rowOf('heroine_01','D26').dates));
  G=mk(K('2026-01-24'),15); const sv=STORY.schedEnt(CHARACTERS.heroine_01,G); check('2. 那個時段作息是「在台中」（朋友頁的位置照它；不會又在 Café）',!!sv&&sv.away==='在台中'&&sv.enc==='D26',JSON.stringify(sv&&{z:sv.zone,a:sv.away})); delete STAGE.heroine_01; }
// 3. 阿哲 D29：寒假 1/2～2/19、暑假 7/1～8/20，除夕～初三不排
{ let G=mk(K('2026-02-14'),15); check('3. 阿哲 D29：2026-02-14（除夕前兩天）週六 15:00 在高雄',G.weekday===6&&at(G,'D29')==='zhe',at(G,'D29')+' '+why(G,'D29'));
  G=mk(K('2027-02-06'),15); check('3. 2027-02-06 春節初一（週六）：在家，不排',G.weekday===6&&at(G,'D29')==='');
  G=mk(K('2028-07-08'),15); check('3. 大三暑假 2028-07-08 週六：在高雄',G.weekday===6&&at(G,'D29')==='zhe',why(G,'D29'));
  G=mk(K('2029-07-07'),15); check('3. 畢業以後的暑假 2029-07-07：沒有（大四寒假為止）',at(G,'D29')===''); }
// 4. 語彤 D14：心願以後、寒暑假的週日 15～19、雨天沒有
{ STAGE.heroine_03='FRIEND'; const sun=K('2026-07-05');
  let G=mk(sun,16,{flags:{WISH_DONE_heroine_03:true}}); check('4. 語彤 D14：大一暑假 2026-07-05 週日 16:00、心願完成、朋友',G.weekday===0&&at(G,'D14')==='heroine_03',at(G,'D14')+' '+why(G,'D14'));
  G=mk(sun,16); check('4. 心願還沒完成：不在',at(G,'D14')==='');
  G=mk(sun,16,{flags:{WISH_DONE_heroine_03:true},weather:'rain'}); check('4. 下雨：沒有偶遇',at(G,'D14')==='');
  G=mk(STORY.termDay('Y1S2',5,7),16,{flags:{WISH_DONE_heroine_03:true}}); check('4. 學期中的週日：不在（照 AA_162 在 D12／D13）',at(G,'D14')==='',why(G,'D14'));
  STAGE.heroine_03='FAMILIAR'; G=mk(sun,16,{flags:{WISH_DONE_heroine_03:true}}); check('4. 還沒到朋友：不在',at(G,'D14')===''); delete STAGE.heroine_03; }
// 5. weeks 陣列
{ STAGE.classmate_bohan='FAMILIAR';
  let G=mk(STORY.termDay('Y1S2',6,7),11); check('5. 柏翰 D11：大一下第 6 週週日 11:00',at(G,'D11')==='classmate_bohan',why(G,'D11'));
  G=mk(STORY.termDay('Y1S2',8,7),11); check('5. 第 8 週：不在（只有第 6、7 週）',at(G,'D11')==='');
  G=mk(STORY.termDay('Y1S1',6,7),11); check('5. 大一上第 6 週：不在（大一下～大二下）',at(G,'D11')==='');
  G=mk(STORY.termDay('Y3S1',3,7),14); check('5. Alison D01：大三上第 3 週週日 14:00',at(G,'D01')==='yu',why(G,'D01'));
  G=mk(STORY.termDay('Y3S1',5,7),14); check('5. 第 5 週：不在（子晴那一週）',at(G,'D01')==='');
  G=mk(STORY.termDay('Y2S1',3,7),14); check('5. 大二：不在（大三起）',at(G,'D01')==='');
  G=mk(STORY.termDay('Y1S1',4,7),14); check('5. 芯慈 D02：第 4 週週日 14:00',at(G,'D02')==='classmate_xinci',why(G,'D02'));
  G=mk(STORY.termDay('Y1S1',5,7),14); check('5. 第 5 週：不在（第 4、12 週）',at(G,'D02')===''); delete STAGE.classmate_bohan; }
// 6. 同行
{ const tr=(who,st)=>{ STAGE[who]=st; return ENC.tier(GG,who); };
  let G=mk(STORY.termDay('Y3S1',3,7),14); G.trip={}; check('6. Alison D01：認識就能一起走一段（不限關係）',ENC.canJoin(G,rowOf('yu','D01'),tr('yu','ACQUAINTANCE')));
  G=mk(STORY.termDay('Y1S2',6,7),11); G.trip={}; check('6. 柏翰 D11：有點熟不一起走、朋友才一起走',!ENC.canJoin(G,rowOf('classmate_bohan','D11'),tr('classmate_bohan','FAMILIAR'))&&ENC.canJoin(G,rowOf('classmate_bohan','D11'),tr('classmate_bohan','FRIEND')));
  G=mk(STORY.termDay('Y1S1',4,7),14); G.trip={}; check('6. 芯慈 D02：不一起走',!ENC.canJoin(G,rowOf('classmate_xinci','D02'),tr('classmate_xinci','FRIEND')));
  G=mk(K('2026-02-14'),15); G.trip={}; check('6. 阿哲 D29：認識就能一起走一段',ENC.canJoin(G,rowOf('zhe','D29'),tr('zhe','ACQUAINTANCE')));
  for(const k in STAGE) delete STAGE[k]; }
// 8. BB 五位（BB_213）
{ const bad=[];
  for(const [who,spot] of Object.entries(BB3)){ const r=rowOf(who,spot); const e=r&&(CHARACTERS[who].daily_schedule||[]).find(q=>q.enc===spot);
    if(!r||!e||e.away!==r.away||e.from!==r.from||e.to!==r.to||JSON.stringify(e.terms)!==JSON.stringify(r.terms)||JSON.stringify(e.weeks)!==JSON.stringify(r.weeks)) bad.push(who+'@'+spot);
    else if(!ENCOUNTERS.school[r.memo]||!ENCOUNTERS.labels[r.memo]) bad.push(r.memo); }
  const kx=rowOf('kexin','D10'); if(!kx||!kx.kexin||!ENCOUNTERS.school.ENC_D10_KX||!ENCOUNTERS.school.ENC_D10_KX.phone) bad.push('kexin@D10');
  check('8. BB 五列都在、作息同一筆、之後的一句和人物頁的字都有（可昕碧潭是手機那一句）',!bad.length,bad.join(' '));
  const sp=s=>TRIP.spot(s).points.map(p=>p.id), off=ENC_WALK.walk.filter(q=>q.batch===3&&q.act!=='walk'&&!sp(q.spot).includes(q.act));
  check('8. BB 第三批同行台詞的互動點都在景點上（芷若生態池那句是散步）',!off.length,off.map(q=>q.act).join(' '));
  STAGE.heroine_04='FRIEND'; let G=mk(STORY.termDay('Y2S1',10,7),16); check('8. 子晴 D01：大二上第 10 週週日 16:00（雙週 4、10，避開她單週的大稻埕）',at(G,'D01')==='heroine_04',why(G,'D01'));
  G=mk(STORY.termDay('Y2S1',5,7),16); check('8. 子晴第 5 週（單週）：在大稻埕，不在華山',at(G,'D01')===''&&ENC.candidates(G,'D12').some(c=>c.row.who==='heroine_04'),why(G,'D01'));
  G=mk(STORY.termDay('Y4S1',5,7),16); check('8. 子晴大四：不在（她上班只有週六）',at(G,'D01')===''); delete STAGE.heroine_04;
  G=mk(STORY.termDay('Y1S1',3,6),14); check('8. 芷若 D02：大一上第 3 週週六 14:00',at(G,'D02')==='heroine_02',why(G,'D02'));
  G=mk(STORY.termDay('Y3S1',3,6),14); check('8. 芷若大三上（在英國）：不在',at(G,'D02')==='');
  G=mk(STORY.termDay('Y2S1',6,6),11); check('8. 學姊 D11：大二上第 6 週週六 11:00',at(G,'D11')==='heroine_05',why(G,'D11'));
  G=mk(STORY.termDay('Y4S1',6,6),11); check('8. 學姊大四上（在美國）：不在北投',at(G,'D11')==='');
  G=mk(STORY.termDay('Y1S2',9,6),10); check('8. 沛珊 D08：大一下第 9 週週六 10:00',at(G,'D08')==='classmate_peishan',why(G,'D08'));
  G=mk(STORY.termDay('Y1S2',9,6),10,{weather:'rain'}); check('8. 下雨：課輔班不出遊，沒有偶遇',at(G,'D08')==='');
  G=mk(STORY.termDay('Y3S2',9,6),10); check('8. 沛珊大三下：她在台南、不回臺北，動物園沒有她（AA_282 第 5 節第 1 點、AA_342 C2；原本 taipei:both 照樣在動物園）',at(G,'D08')==='',why(G,'D08'));
  G=mk(STORY.termDay('Y2S2',9,6),10); check('8. 沛珊大二下（聯絡不到）：不在',at(G,'D08')==='');
  G=mk(STORY.termDay('Y1S1',10,7),17,{flags:{dating_kexin:true}}); check('8. 可昕 D10：交往中、第 10 週週日 17:00',at(G,'D10')==='kexin',why(G,'D10'));
  G=mk(STORY.termDay('Y1S1',10,7),17,{flags:{dating_kexin:true},weather:'rain'}); check('8. 下雨：台階有遮，照常（rainOk）',at(G,'D10')==='kexin');
  G=mk(STORY.termDay('Y1S1',10,7),17); check('8. 沒有交往、也沒分開：沒有可昕',at(G,'D10')==='');
  // 沛珊分開以後：照認識那兩句、不一起走（沒有前任版）
  { G=mk(STORY.termDay('Y1S2',9,6),10,{flags:{EX_classmate_peishan:true,ROMANCE_HISTORY:[{id:'classmate_peishan',to:'Y1S2W3',how:'apart_talk'}]}}); G.trip={};
    const L=[], menus=[]; const gm={G,say:async(w,t)=>L.push((w?(w.name||w)+'：':'')+t),choose:async o=>{ menus.push(o.map(x=>x.t)); return 0; }};
    await (ENC.meet(gm,rowOf('classmate_peishan','D08'),ENC.tier(G,'classmate_peishan')));
    check('8. 沛珊（前任）：選單是打招呼／不打擾（沒有點頭、沒有一起走），說認識的那兩句',!!menus[0]&&menus[0].join()==='打招呼,不打擾'&&L.some(t=>t.includes('我們課輔班來校外教學')),JSON.stringify({menus,L})); }
  // 可昕一起走：予樂的讓位句（intro batch:3）
  { G=mk(STORY.termDay('Y1S1',10,7),17,{flags:{dating_kexin:true}}); G.trip={};
    const L=[]; const gm={G,say:async(w,t)=>L.push((w?(w.name||w)+'：':'')+t),choose:async o=>o.findIndex(x=>x.t==='一起走一段')};
    await (ENC.meet(gm,rowOf('kexin','D10'),ENC.tier(G,'kexin')));
    check('8. 可昕（交往中）在碧潭一起走：予樂「我先回去了。可昕，玉米你自己吃完。」',L.includes('予樂：我先回去了。可昕，玉米你自己吃完。'),JSON.stringify(L)); } }
// 9. 第二批景點（AA_162 第 8 節＋BB_150，aca122d2）＋共用的規則
{ const bad=[];
  for(const r of ENCOUNTERS.rows){ if(r.kexin) continue; const e=(CHARACTERS[r.who].daily_schedule||[]).find(q=>q.enc===r.spot&&q.from===r.from&&q.to===r.to);
    if(!e){ bad.push(r.who+'@'+r.spot+':沒有作息'); continue; } for(const k of ['terms','weeks','dates','vacation']){ if(k==='weeks'&&typeof r.weeks==='string'){ if(!Array.isArray(e.weeks)||!e.weeks.every(w=>(w%2===1)===(r.weeks==='odd'))) bad.push(r.who+'@'+r.spot+':單雙週'); continue; } if(JSON.stringify(e[k]||null)!==JSON.stringify(r[k]||null)&&!(k==='terms'&&!r.terms&&e.terms)) bad.push(r.who+'@'+r.spot+':'+k); } }
  check('9. 全部的列（可昕以外）作息同一筆：terms、weeks、dates、vacation 一樣',!bad.length,bad.join(' '));
  const off=ENC_WALK.walk.filter(q=>q.act!=='walk'&&!(TRIP.spot(q.spot)&&TRIP.spot(q.spot).points.some(p=>p.id===q.act)));
  check('9. 所有同行台詞的互動點都在景點上',!off.length,off.map(q=>q.who+':'+q.act).join(' '));
  const n2=ENCOUNTERS.rows.filter(r=>['D09','D18','D20','D24','D25'].includes(r.spot)).length; check('9. 第二批 10 列（AA 六位＋BB 五位；沛珊 D20 烏來那一列拿掉，AA_282、AA_342 C2）',n2===10,String(n2));
  STAGE.heroine_01='FAMILIAR'; let G=mk(STORY.termDay('Y2S1',10,6),16); check('9. 以安 D09：大二上第 10 週週六 16:00',at(G,'D09')==='heroine_01',why(G,'D09'));
  G=mk(STORY.termDay('Y2S1',16,6),16); check('9. 第 16 週（期末考週）：不在',at(G,'D09')==='');
  const jp=STORY.termDay('Y3S2',10,6); G=mk(jp,16); check('9. 大三下第 10 週（'+CALENDAR.dateOf(jp).key+'）以安在日本：不出現（AA_508 0-2 第 11 點：那一學期的列拿掉＝學期；presence 也擋）',at(G,'D09')===''&&/學期|不在/.test(why(G,'D09')),why(G,'D09')); delete STAGE.heroine_01;
  G=mk(STORY.termDay('Y3S1',12,6),11); const L=[], menus=[]; const gm={G,say:async(w,t)=>L.push((w?(w.name||w)+'：':'')+t),choose:async o=>{ menus.push(o.map(x=>x.t)); return 0; }};
  const hit=ENC.candidates(G,'D18').find(c=>c.row.who==='heroine_03'); if(hit) await ENC.meet(gm,hit.row,hit.tier);
  check('9. 語彤 D18（在做田野）：只點頭的旁白、沒有選單，照樣留 ENC_D18_YT（之後在學校說一句）',!!hit&&!menus.length&&L.includes('（她看到你，點了一下頭，繼續聽阿嬤說話。）')&&SOCIAL.has('heroine_03','ENC_D18_YT'),JSON.stringify({L,menus}));
  STAGE.heroine_02='FRIEND'; G=mk(STORY.termDay('Y1S1',4,6),15); G.trip={}; check('9. 芷若 D25 朋友：15:00 就能一起走（「19:30 以後」只在西門町）',ENC.canJoin(G,rowOf('heroine_02','D25'),ENC.tier(G,'heroine_02')));
  G=mk(STORY.termDay('Y1S1',3,6),14); G.trip={}; check('9. 芷若 D02（第三批）朋友：14:00 也能一起走',ENC.canJoin(G,rowOf('heroine_02','D02'),ENC.tier(G,'heroine_02')));
  G=mk(STORY.termDay('Y1S1',5,6),19); G.trip={}; check('9. 芷若 D04 照舊：19:00 還不一起走（19:30 以後）',!ENC.canJoin(G,rowOf('heroine_02','D04'),ENC.tier(G,'heroine_02'))); delete STAGE.heroine_02;
  STAGE.heroine_05='FRIEND'; G=mk(STORY.termDay('Y3S1',3,7),11); G.trip={}; check('9. 學姊 D24 朋友：能一起泡腳',ENC.canJoin(G,rowOf('heroine_05','D24'),ENC.tier(G,'heroine_05')));
  G=mk(STORY.termDay('Y3S1',3,7),11,{flags:{dating_heroine_05:true}}); G.trip={}; check('9. 學姊 D24 交往中：不一起泡（正式見家長不在這裡演）',!ENC.canJoin(G,rowOf('heroine_05','D24'),ENC.tier(G,'heroine_05')));
  G=mk(STORY.termDay('Y3S1',3,7),11); G.trip={with:{who:'heroine_05',tier:'friend'}}; const L2=[]; await ENC.companionAfter({G,say:async(w,t)=>L2.push((w?(w.name||w)+'：':'')+t)},TRIP.spot('D24'),'D24.footbath');
  check('9. 泡腳：溫媽媽先說「學弟，坐。」，再換學姊',L2[0]==='溫媽媽：學弟，坐。水很燙，慢慢放。'&&/^溫書瑀：/.test(L2[1]||''),JSON.stringify(L2)); delete STAGE.heroine_05;
  G=mk(STORY.termDay('Y4S1',13,1),12); G.social={mem:{classmate_bohan:[{tag:'ENC_D09_BH',day:G.day-3}]}}; const q1=ENC.schoolLine(G,'classmate_bohan');
  G.social.mem.classmate_bohan.push({tag:'ENC_D06_BH',day:G.day-30}); G.daily={}; const q2=ENC.schoolLine(G,'classmate_bohan');
  check('9. 柏翰貓空之後的一句（AA_389 第 3 點，企劃線 345234b3：兩句合成一句、不分美術館那句）：「貓空那天回來，我腿痠了兩天。……下次找不用爬的地方。」',!!q1&&q1.lines[0]==='貓空那天回來，我腿痠了兩天。……下次找不用爬的地方。'&&!!q2&&(q2.tag==='ENC_D06_BH'||q2.lines[0]===q1.lines[0]),JSON.stringify([q1,q2]));
  G=mk(STORY.termDay('Y1S1',7,7),16,{flags:{dating_kexin:true}}); G.trip={}; const L3=[]; await ENC.meet({G,say:async(w,t)=>L3.push((w?(w.name||w)+'：':'')+t),choose:async o=>o.findIndex(x=>x.t==='一起走一段')},rowOf('kexin','D09'),ENC.tier(G,'kexin'));
  const yl=ENC_WALK.intro.find(q=>q.who==='kexin'&&q.spot==='D09'); check('9. 可昕 D09 一起走：予樂先帶邵鈞走（intro 第二批）',!!yl&&L3.includes('予樂：'+yl.line),JSON.stringify(L3)); }
// 7. 修改前
{ let old=null; try{ old=require('child_process').execSync('git show 9264002f:src/data/encounters.js',{cwd:ROOT,encoding:'utf8',maxBuffer:8<<20,stdio:['ignore','pipe','ignore']}); }catch(e){}
  if(!old) console.log('（略過第 7 項：沒有 9264002f 的歷史）'); else check('7. 修改前（9264002f）：沒有第三批景點的偶遇',!/spot:'D26'|spot:'D29'|spot:'D11'/.test(old)); }
console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });
