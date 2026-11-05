// 山嵐書店、南洋戲院打烊時人還在店裡＝一句旁白＋走到新生南路店門外（AA_695 第 4 節，企劃線 491357209）
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.join(__dirname,'..'); let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(ok?'':'　'+(info||''))); if(!ok) fails++; };
const ctx={console,Math,Date,JSON,Object,Array,Promise,setTimeout,globalThis:null}; ctx.globalThis=ctx; vm.createContext(ctx);
const run=f=>vm.runInContext(fs.readFileSync(path.join(ROOT,f),'utf8'),ctx,{filename:f});
run('src/data/calendar.js'); run('src/data/places.js');
vm.runInContext('var STORY={TICKS:[]}; var SH3={streetOut:()=>({x:1,z:2,yaw:0})}; var NY3={streetOut:()=>({x:3,z:4,yaw:0})}; var XSS={streetOut:id=>({x:id==="dabu"?5:6,z:0,yaw:0})}; var XP3={streetOut:()=>({x:7,z:0,yaw:0})};',ctx);
const has=fs.existsSync(path.join(ROOT,'src/xs_close3d.js')); check('0. src/xs_close3d.js 存在、index.html 載入',has&&/src\/xs_close3d\.js/.test(fs.readFileSync(path.join(ROOT,'index.html'),'utf8')));
if(!has){ console.log('FAILED '+fails); process.exit(1); }
run('src/xs_close3d.js'); const X=vm.runInContext('XSCLOSE',ctx);
check('1. 掛進 STORY.TICKS',vm.runInContext('STORY.TICKS.length',ctx)===1);
let doc=''; try{ doc=cp.execSync('git show 491357209:"docs/story_planning/AA_695_山嵐書店互動點與坐地板的字.md"',{cwd:ROOT,encoding:'utf8'}); }catch(e){}
check('2. 兩句旁白逐字在 AA_695 第 4 節',!!doc&&['xs_shanlan','xs_nanyang'].every(z=>X.ZONES[z].lines.every(l=>doc.indexOf(l[1])>=0)),doc?'':'讀不到稿（只檢查字串）');
let doc699=''; try{ doc699=cp.execSync('git show 0e112816a:"docs/story_planning/AA_699_新生運動廣場互動點與三間打烊.md"',{cwd:ROOT,encoding:'utf8'}); }catch(e){}
check('2b. 大步、好拍、運動廣場的字逐句在 AA_699（企劃線 0e112816a）',!!doc699&&['xs_dabu','xs_haopai','xs_xsports'].every(z=>X.ZONES[z].lines.every(l=>doc699.indexOf(l[1])>=0)),JSON.stringify(['xs_dabu','xs_haopai','xs_xsports'].map(z=>X.ZONES[z].lines.filter(l=>doc699.indexOf(l[1])<0))));
const mk=(zone,hour,day,busy)=>{ const L={say:[],enter:null}; return {L,GM:{G:{zone,hour,day,flags:{}},E:{player:{busy:!!busy}},D:{active:false},sceneBegin(){},sceneEnd(){},say:async(w,t)=>L.say.push(t),enter:async(z,s)=>{L.enter=[z,s];}}}; };
const day=vm.runInContext('typeof CAL!=="undefined"&&CAL.dayOf?CAL.dayOf("2025-11-05"):30',ctx)||30;
(async()=>{
  let a=mk('xs_shanlan',15,day); check('3. 山嵐營業中不動',X.tick(a.GM)===false&&!a.L.say.length);
  a=mk('xs_shanlan',23.2,day); const r=X.tick(a.GM); await new Promise(f=>setTimeout(f,10));
  const open22=vm.runInContext('PLACES.isOpen("xs_shanlan",23.2,'+day+')',ctx);
  check('4. 山嵐打烊後還在店裡：一句旁白、到新生南路店門外',!open22&&(r===true&&a.L.say[0]===X.ZONES.xs_shanlan.lines[0][1]&&a.L.enter&&a.L.enter[0]==='xinsheng'&&a.L.enter[1].x===1),JSON.stringify([open22,r,a.L]));
  a=mk('xs_shanlan',23.2,day,true); check('5. 坐地板轉暗那一小時（場景忙）不打斷',X.tick(a.GM)===false&&!a.L.say.length);
  a=mk('xs_nanyang_hall',0.3,day+1); const r2=X.tick(a.GM); await new Promise(f=>setTimeout(f,10));
  check('6. 南洋 1 廳過了 24:00：一句、到店門外',r2===true&&a.L.say[0]===X.ZONES.xs_nanyang_hall.lines[0][1]&&a.L.enter[0]==='xinsheng'&&a.L.enter[1].x===3,JSON.stringify(a.L));
  a=mk('xs_nanyang',20,day); check('7. 南洋 20:00 營業中不動',X.tick(a.GM)===false);
  a=mk('gongguan',23,day); check('8. 其他區域不管',X.tick(a.GM)===false);
  a=mk('xs_haopai',21.3,day); const r3=X.tick(a.GM); await new Promise(f=>setTimeout(f,10));
  check('9. 好拍 21:00 以後：三句（旁白、老闆、旁白）、到店門外',r3===true&&a.L.say.length===3&&a.L.say[1]==='明天再來。'&&a.L.enter[1].x===6,JSON.stringify(a.L));
  a=mk('xs_dabu',22.2,day); const r4=X.tick(a.GM); await new Promise(f=>setTimeout(f,10));
  check('10. 大步 22:00 以後：一句、到店門外',r4===true&&a.L.say.length===1&&a.L.enter[1].x===5,JSON.stringify(a.L));
  a=mk('xs_xsports',22.2,day); const r5=X.tick(a.GM); await new Promise(f=>setTimeout(f,10));
  check('11. 運動廣場 22:00 以後：三句、到店門外',r5===true&&a.L.say.length===3&&a.L.say[1]==='我們要打烊了喔。'&&a.L.enter[1].x===7,JSON.stringify(a.L));
  a=mk('xs_xsports',15,day); check('12. 運動廣場 15:00 營業中不動',X.tick(a.GM)===false);
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})();
