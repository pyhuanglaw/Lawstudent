// DL-12：約人的新地點（AA_164 2-1、2-3）——半熟（週六日 08:00～13:00、吃飯、有點熟以上）、一盞（週三～週日 12:00～19:00、安靜說話、朋友以上）。不需要瀏覽器。
// 修改前：INVITE_DATA.places 沒有 brunch（第 1 項就失敗）。用法：node tests/dl12_invite_unit.js
const vm=require('vm'), fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.THREE={Vector3:function(x,y,z){this.x=x;this.y=y;this.z=z;}};
global.P3={CAST:new Proxy({},{get:(t,k)=>({name:String(k)})})};
const mkObj=()=>({position:{x:0,y:0,z:0,set(x,y,z){this.x=x;this.y=y;this.z=z;}},rotation:{y:0},userData:{}});
global.CHAR={build:()=>mkObj(),setExpr(){}}; global.location={search:''}; global.document={getElementById:()=>null,addEventListener(){}};
const STAGE={heroine_02:'FAMILIAR',zhe:'CLOSE_FRIEND',kai:'FRIEND',yu:'FRIEND',heroine_01:'FRIEND',classmate_bohan:'ACQUAINTANCE',heroine_04:'STRANGER'};
const MEM=[], ADJ=[];
global.SOCIAL={STAGES:['STRANGER','ACQUAINTANCE','FAMILIAR','FRIEND','CLOSE_FRIEND','POSSIBLE_ROMANTIC_INTEREST','ROMANTIC_TENSION','RELATIONSHIP'],stage:id=>STAGE[id]||'STRANGER',
  displayName:id=>(CHARACTERS[id]&&(CHARACTERS[id].nickname||CHARACTERS[id].name))||id,remember:(id,tag,note)=>MEM.push([id,tag,note]),memories:id=>MEM.filter(m=>m[0]===id).map(m=>({tag:m[1],note:m[2]})),adjust:(id,d)=>ADJ.push([id,d]),noticed(){},reveal:()=>'ACQUAINTANCE',has:()=>true};
let GM=null; const ALIAS={heroine_01:'an',heroine_05:'sis',prof_zhou:'prof'}; const HAB=[];
global.EVENTS={npcOf:id=>GM.npc[id]||GM.npc[ALIAS[id]]||null,onEnter(){},tick(){},habit:k=>HAB.push(k)};
for(const f of ['src/data/characters.js','src/data/places.js','src/data/calendar.js','src/data/courses.js','src/story3d.js','src/classes3d.js','src/data/invites.js','src/invites3d.js'])
  vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (CHARACTERS|STORY|PLACES|SOCIAL_GRAPH|UNFAMILIAR_POOL|PORTRAITS|CALENDAR|COURSES|CLS|INVITE_DATA|INV)\s*=/mg,'global.$1='),{filename:f});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
const P=id=>INVITE_DATA.places.find(p=>p.id===id);
check('1. 新地點：半熟（wz_brunch、吃飯、有點熟）、一盞（wz_teahouse、有理由的、朋友）',!!P('brunch')&&P('brunch').zone==='wz_brunch'&&P('brunch').kind==='meal'&&P('brunch').minStage==='FAMILIAR'&&!!P('teahouse')&&P('teahouse').zone==='wz_teahouse'&&P('teahouse').minStage==='FRIEND');
if(fails){ console.log('FAILED '+fails); process.exit(1); }
const SAT=dayOf('2025-10-11'), TUE=dayOf('2025-10-14'), WED=dayOf('2025-10-15'), MON=dayOf('2025-10-13');
const mkG=day=>({day,weekday:CALENDAR.dateOf(day).wd%7,hour:9,flags:{afternoonDone:true,classDone:true,metAn:true},social:{},invites:[],contacts:{zhe:1,heroine_01:1,yu:1},weather:'sunny'});
{ const G=mkG(SAT); const r=INV.decide(G,'zhe','brunch',SAT,10); check('2. 週六 10:00 約阿哲去半熟：答應',r.res==='accept',JSON.stringify(r));
  const r2=INV.decide(G,'zhe','brunch',SAT,12.5); check('2. 週六 12:30（吃到 13:15，超過 13:00）：改天',r2.res==='resched'&&r2.why==='closed',JSON.stringify(r2));
  const G2=mkG(TUE); const r3=INV.decide(G2,'zhe','brunch',TUE,10); check('2. 週二（半熟有開，但只能約週末）：改天，附週末的時間',r3.res==='resched'&&r3.why==='closed'&&(!r3.alt||[0,6].includes(CALENDAR.dateOf(r3.alt.day).wd%7)),JSON.stringify(r3));
  const r4=INV.decide(G,'heroine_02','brunch',SAT,10); check('2. 只是有點熟的芷若：半熟可以（吃飯要有點熟）',r4.res!=='decline'||r4.why!=='rel',JSON.stringify(r4)); }
{ const G=mkG(WED); const r=INV.decide(G,'heroine_02','teahouse',WED,14); check('3. 一盞要朋友以上：有點熟的芷若不行',r.res==='decline'&&r.why==='rel',JSON.stringify(r));
  const r2=INV.decide(G,'zhe','teahouse',WED,14); check('3. 週三 14:00 約阿哲去一盞：答應（或照他的作息改天）',r2.res==='accept'||(r2.res==='resched'&&r2.why==='busy'),JSON.stringify(r2));
  const G3=mkG(MON); const r3=INV.decide(G3,'zhe','teahouse',MON,14); check('3. 週一一盞公休：改天',r3.res==='resched'&&r3.why==='closed',JSON.stringify(r3));
  const r4=INV.decide(G,'zhe','teahouse',WED,18.5); check('3. 18:30（喝到 19:45，超過 19:00）：改天',r4.res==='resched'&&r4.why==='closed',JSON.stringify(r4)); }
{ const so=fs.readFileSync(path.join(ROOT,'src/social3d.js'),'utf8'), iv=fs.readFileSync(path.join(ROOT,'src/invites3d.js'),'utf8');
  check('4. 記憶的字「一起去一盞喝茶」；見面的熟悉度：半熟＝一起吃飯、一盞＝一起坐坐（AA_124）',/TEAHOUSE_TEA='一起去一盞喝茶'/.test(so)&&/brunch:'meal',teahouse:'cafe'/.test(iv)); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
