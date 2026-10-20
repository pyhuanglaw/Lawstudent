// 118 巷作息表（AA_320，X68 LANE118-ENC-1020；使用者 10-20「118 巷常客之外的一般偶遇」）——不需要瀏覽器。
//   characters.js 的 daily_schedule 加了 AA_320 的 11 列（118 巷）＋5 列（霖澤館 3F、4F 期中期末週，樓層寫成區域 linze_3f、linze_4f）。
//   1. 每一列在它的日期、時段裡，作息（STORY.schedEnt）就是這一列——不被一般作息蓋掉，也不被同班的課表（CLS）蓋掉；
//   2. 這一列蓋掉的原本那一筆，不是上課、家教、顧店、社課、讀書會（AA 說只蓋「在校園走走、在總圖或 Café 看書」這類一般作息）；
//   3. 不在的時候不出現：第 1、16 週（118 巷那幾列）、國定假日（noHoliday）、畢業以後（GRADUATED）、沛珊大二下、以安大三下第 6 週起；
//   4. 區域都存在（118 巷的店、霖澤館 3F、4F），schedFor 照區域給。
// 修改前 1 FAIL（沒有這些列）。用法：node tests/lane118_sched_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}}; global.THREE={Vector3:function(){}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|COURSES|CLS|ACTIVITIES|L118_SHOP_LAYOUTS|LINZE_UPPER_LAYOUTS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/characters.js','src/data/calendar.js','src/data/places.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/social3d.js','src/events3d.js','src/story3d.js','src/classes3d.js','src/data/l118_shop_layouts.js','src/data/linze_upper_layouts.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const mkG=(d,h,flags)=>{ const G={day:d,hour:h,weekday:CALENDAR.dateOf(d).wd%7,stage:'law',zone:'campus',flags:Object.assign({introDone:true,afternoonDone:true,classDone:true},flags||{}),choices:{},events:{done:{},last:{},count:0},social:null,rel:{}}; SOCIAL.bind(G); EVENTS.bind({get G(){ return G; },E:{player:{obj:{position:{x:0,z:0}}},npcs:[]},npc:{}}); return G; };
const ROWS=[]; for(const id in CHARACTERS) for(const e of (CHARACTERS[id].daily_schedule||[])) if(/^AA_320/.test(e.note||'')) ROWS.push({id,e});
check('0. AA_320 的 16 列都在（118 巷 11、霖澤館樓上 5；以安大三下、大二上大四上（5-1 提早）另兩列、沛珊大二上另一列＝19 筆）', ROWS.length===19, String(ROWS.length));
// 找日期：這一列的學期、週次、星期，不是假日
const D0=STORY.dayOfKey('2025-08-25'), D1=STORY.dayOfKey('2029-06-30');
const sample=(e,pred)=>{ for(let d=D0;d<=D1;d++){ const T=CALENDAR.termOf(d); if(!T||!e.terms.includes(T.id)||(e.weeks&&!e.weeks.includes(T.week))) continue; if(!e.days.includes(CALENDAR.dateOf(d).wd%7)) continue; if(e.noHoliday&&CALENDAR.holiday(d)) continue; if(pred&&!pred(d,T)) continue; return d; } return null; };
const IMPORTANT=/家教|顧店|顧麵店|社課|讀書會|打工|助教/;
const bad1=[], bad2=[], cls=[], hits=[];
for(const {id,e} of ROWS){ const c=CHARACTERS[id]; let shown=0;
  for(let d=D0;d<=D1;d++){ const T=CALENDAR.termOf(d); if(!T||!e.terms.includes(T.id)||(e.weeks&&!e.weeks.includes(T.week))||!e.days.includes(CALENDAR.dateOf(d).wd%7)||(e.noHoliday&&CALENDAR.holiday(d))) continue;
    for(const h of [e.from+0.05,(e.from+e.to)/2,e.to-0.05]){ const G=mkG(d,h); if(c.presence&&!STORY.reachable(id,G)) continue; shown++;
      const got=STORY.schedEnt(c,G); if(got===e) continue;
      if(got&&got.act==='class'&&STORY.classmateClass(c,G)){ cls.push(id+' '+CALENDAR.dateOf(d).key+' '+h.toFixed(2)+' '+(got.course||got.room||got.zone||'')); continue; }   /* 同班同學的課表優先（上課不動，AA_320 開頭）*/
      bad1.push(id+' '+e.note.slice(0,10)+' '+CALENDAR.dateOf(d).key+' '+h.toFixed(2)+' → '+(got?(got.act+'@'+(got.zone||got.away||'')+' '+(got.note||'').slice(0,16)):'null')); }
    const G=mkG(d,e.from+0.05); if(c.presence&&!STORY.reachable(id,G)) continue; const keep=c.daily_schedule; c.daily_schedule=keep.filter(q=>!/^AA_320/.test(q.note||'')); const old=STORY.schedEnt(c,G); c.daily_schedule=keep;
    if(old&&old.act!=='class'&&(['club','barista','help','ta','wait'].includes(old.act)||IMPORTANT.test(old.note||'')||old.activity)) bad2.push(id+' '+CALENDAR.dateOf(d).key+' '+e.from+' 原本：'+old.act+'@'+(old.zone||'')+' '+(old.note||'').slice(0,24)); }
  hits.push(id+':'+shown); }
check('1. 每一列在它的日期時段裡（每一天的開頭、中間、結尾）就是作息，不被一般作息蓋掉', bad1.length===0, bad1.slice(0,6).join('｜')||('次數 '+hits.join(' ')));
check('2. 蓋掉的原本那一筆不是家教、顧店、社課、讀書會（上課另外算，見 2b）', bad2.length===0, bad2.slice(0,6).join('｜'));
{ const days=[...new Set(cls.map(x=>x.split(' ').slice(0,2).join(' ')))]; console.log('INFO 2b. 撞到同班同學課表的（上課優先，這一格不去 118 巷；回報 AA）：'+(days.length?days.length+' 天，例：'+days.slice(0,4).join('、'):'沒有')); }
// 3. 不在的時候
const row=(id,note)=>ROWS.find(r=>r.id===id&&r.e.note.startsWith(note)).e;
{ const e=row('zhe','AA_320 L1'); const d1=sample(Object.assign({},e,{weeks:[1]})), d16=sample(Object.assign({},e,{weeks:[16]})); const z=(d,h,f)=>{ const G=mkG(d,h,f); const q=STORY.schedEnt(CHARACTERS.zhe,G); return q===e; };
  const dOk=sample(e); check('3. 阿哲週日家常菜：第 1、16 週不在、畢業以後不在、平常在', d1!=null&&d16!=null&&!z(d1,12.1)&&!z(d16,12.1)&&z(dOk,12.1)&&!z(dOk,12.1,{GRADUATED:true})); }
{ const e=row('heroine_04','AA_320 L12'); const dh=(()=>{ for(let d=D0;d<=D1;d++){ const T=CALENDAR.termOf(d); if(T&&e.terms.includes(T.id)&&e.weeks.includes(T.week)&&e.days.includes(CALENDAR.dateOf(d).wd%7)&&CALENDAR.holiday(d)) return d; } return null; })();
  if(dh!=null){ const G=mkG(dh,18.1); check('3. 子晴週二韓式：國定假日不在（noHoliday）', STORY.schedEnt(CHARACTERS.heroine_04,G)!==e, CALENDAR.dateOf(dh).key); } else check('3. 子晴週二：找不到落在假日的週二（跳過）', true); }
{ const e=row('classmate_peishan','AA_320 L6'); check('3. 沛珊週一點：只有大一、大二上', e.terms.join()==='Y1S1,Y1S2,Y2S1'); }
{ const es=ROWS.filter(r=>r.id==='heroine_01'&&r.e.note.startsWith('AA_320 L3')).map(r=>r.e); const y32=es.find(e=>e.terms.includes('Y3S2')); check('3. 以安週二點：大三下只到第 5 週（3/25 去日本）；大二上、大四上 11:45～12:30（AA_320 5-1）；大四下不排（上課優先）', !!y32&&y32.weeks.join()==='2,3,4,5'&&es.length===3&&es.some(e=>e.terms.join()==='Y2S1,Y4S1'&&e.from===11.75&&e.to===12.5)&&!es.some(e=>e.terms.includes('Y4S2')));
  console.log('INFO 2b. 以安週二點新時段還撞到的課（AA_320 5-1：照上課優先、不出現，不用再問 AA）：'+(cls.filter(x=>/^heroine_01 /.test(x)).length||'沒有')); }
{ const e=row('heroine_05','AA_320 L9'); check('3. 學姊週六點：每學期第 6 週不排（北投圖書館）、大四上不排（美國）', !e.weeks.includes(6)&&!e.terms.includes('Y4S1')&&!e.terms.includes('Y1S1')); }
// 4. 區域
{ const zs=new Set(ROWS.map(r=>r.e.zone)); const known=z=>z==='lane118'||/^linze_[34]f$/.test(z)&&LINZE_UPPER_LAYOUTS[z.slice(6)]||(typeof L118_SHOP_LAYOUTS!=='undefined'&&Object.values(L118_SHOP_LAYOUTS).some(q=>q.zone===z));
  check('4. 區域都存在：118 巷、店（l118_*）、霖澤館 3F、4F', [...zs].every(known), [...zs].join(' ')); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
