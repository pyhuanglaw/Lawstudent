// AA_140 G50 S-2（AA-B 2026-10-16）：以安早上七點的日文課——不加事件，只加日程。
// 大一下～大三上的週一、三、五：07:00～07:50 不在場景裡（人物線索「在上日文課」）、07:50～08:00 在總圖門口（「日文課剛下課（念動詞變化）」）、08:00 以後照原本的總圖；
// 大一上沒有、大三下（在日本）沒有、週二沒有、寒暑假沒有。用法：node tests/g50_an_japanese_unit.js
const vm=require('vm'), fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.THREE={Vector3:function(x,y,z){this.x=x;this.y=y;this.z=z;}};
global.P3={CAST:new Proxy({},{get:(t,k)=>({name:String(k)})})};
const mkObj=()=>({position:{x:0,y:0,z:0,set(x,y,z){this.x=x;this.y=y;this.z=z;}},rotation:{y:0},userData:{}});
global.CHAR={build:()=>mkObj(),setExpr(){}}; global.location={search:''};
global.SOCIAL={displayName:id=>(CHARACTERS[id]&&CHARACTERS[id].name)||id,stage:()=>'ACQ',noticed(){},reveal:()=>'ACQUAINTANCE',has:()=>true};
let GM=null; const ALIAS={heroine_01:'an',heroine_05:'sis',prof_zhou:'prof'};
global.EVENTS={npcOf:id=>GM.npc[id]||GM.npc[ALIAS[id]]||null,onEnter(){},tick(){}};
for(const f of ['src/data/calendar.js','src/data/characters.js','src/data/places.js','src/data/boya_layout.js','src/story3d.js']) vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (CALENDAR|CHARACTERS|STORY|PLACES|SOCIAL_GRAPH|UNFAMILIAR_POOL|PORTRAITS|BOYA_LAYOUT)\s*=/mg,'global.$1='),{filename:f});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const AN=CHARACTERS.heroine_01; const at=(term,wk,wd,hour)=>STORY.schedEnt(AN,{day:STORY.termDay(term,wk,wd),weekday:wd,hour,flags:{},social:{}});
for(const term of ['Y1S2','Y2S1','Y2S2','Y3S1']){ const a=at(term,5,1,7.4), b=at(term,5,3,7.9), c=at(term,5,5,8.5);
  check(term+' 週一 07:24：不在場景裡、「在上日文課」',!!a&&a.zone===null&&a.away==='在上日文課',JSON.stringify(a&&{zone:a.zone,away:a.away}));
  check(term+' 週三 07:54：總圖門口、「日文課剛下課（念動詞變化）」',!!b&&b.zone==='campus'&&b.act==='linger'&&b.label==='日文課剛下課（念動詞變化）'&&b.at[0]===83,JSON.stringify(b&&{zone:b.zone,act:b.act}));
  check(term+' 週五 08:30：照原本的作息（不是日文課那兩筆）',!c||!/日文課/.test((c.away||'')+(c.label||'')),JSON.stringify(c&&{zone:c.zone,act:c.act})); }
{ const a=at('Y1S1',5,1,7.4); check('大一上沒有日文課',!a||a.away!=='在上日文課',JSON.stringify(a)); }
{ const a=at('Y3S2',5,1,7.4); check('大三下（在日本）沒有這兩筆',!a||!/日文課/.test((a.away||'')+(a.label||'')),JSON.stringify(a)); }
{ const a=at('Y1S2',5,2,7.4); check('週二沒有',!a||a.away!=='在上日文課'); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
