// 新生南路的店打烊時人還在店裡＝店員（好拍＝老闆）一句「我們今天要打烊了。」＋走到新生南路店門外（AA_700，企劃線 4f60052c8；取代 AA_695 第 4 節、AA_699 第 1 節）
// 全部的店：tests/close_unify_unit.js
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
let doc=''; try{ doc=cp.execSync('git show 4f60052c8:"docs/story_planning/AA_700_打烊統一一句.md"',{cwd:ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']}); }catch(e){}
check('2. 那一句逐字在 AA_700（企劃線 4f60052c8）',doc?doc.indexOf('店員：'+X.LINE)>=0:X.LINE==='我們今天要打烊了。',doc?'':'讀不到稿（只檢查字串）');
check('2b. 說話的人：山嵐、南洋、大步、運動廣場＝店員；好拍＝老闆（AA_700）',['xs_shanlan','xs_nanyang','xs_nanyang_hall','xs_dabu','xs_xsports'].every(z=>X.whoOf(z)==='店員')&&X.whoOf('xs_haopai')==='老闆');
const mk=(zone,hour,day,busy)=>{ const L={say:[],enter:null}; return {L,GM:{G:{zone,hour,day,flags:{}},E:{player:{busy:!!busy}},D:{active:false},sceneBegin(){},sceneEnd(){},say:async(w,t)=>L.say.push((w&&w.name?w.name+'：':'')+t),toast:t=>L.toast=t,enter:async(z,s)=>{L.enter=[z,s];}}}; };
const day=vm.runInContext('typeof CAL!=="undefined"&&CAL.dayOf?CAL.dayOf("2025-11-05"):30',ctx)||30;
(async()=>{
  let a=mk('xs_shanlan',15,day); check('3. 山嵐營業中不動',X.tick(a.GM)===false&&!a.L.say.length);
  a=mk('xs_shanlan',23.2,day); const r=X.tick(a.GM); await new Promise(f=>setTimeout(f,10));
  const open22=vm.runInContext('PLACES.isOpen("xs_shanlan",23.2,'+day+')',ctx);
  check('4. 山嵐（進來時開著）打烊後還在店裡：店員一句、到新生南路店門外、不另外出字',!open22&&(r===true&&a.L.say.length===1&&a.L.say[0]==='店員：我們今天要打烊了。'&&a.L.enter&&a.L.enter[0]==='xinsheng'&&a.L.enter[1].x===1&&!a.L.toast),JSON.stringify([open22,r,a.L]));
  a=mk('xs_shanlan',23.2,day,true); check('5. 坐地板轉暗那一小時（場景忙）不打斷',X.tick(a.GM)===false&&!a.L.say.length);
  a=mk('xs_nanyang_hall',0.3,day+1); const r2=X.tick(a.GM); await new Promise(f=>setTimeout(f,10));
  check('6. 南洋 1 廳過了 24:00（打烊那一刻）：店員一句、到店門外',r2===true&&a.L.say.length===1&&a.L.say[0]==='店員：我們今天要打烊了。'&&a.L.enter[0]==='xinsheng'&&a.L.enter[1].x===3,JSON.stringify(a.L));
  a=mk('xs_nanyang',20,day); check('7. 南洋 20:00 營業中不動',X.tick(a.GM)===false);
  a=mk('gongguan',23,day); check('8. 其他區域不管',X.tick(a.GM)===false);
  a=mk('xs_haopai',21.3,day); const r3=X.tick(a.GM); await new Promise(f=>setTimeout(f,10));
  check('9. 好拍 21:00 以後（打烊那一刻）：老闆一句、到店門外',r3===true&&a.L.say.length===1&&a.L.say[0]==='老闆：我們今天要打烊了。'&&a.L.enter[1].x===6,JSON.stringify(a.L));
  a=mk('xs_dabu',22.2,day); const r4=X.tick(a.GM); await new Promise(f=>setTimeout(f,10));
  check('10. 大步 22:00 以後：店員一句、到店門外',r4===true&&a.L.say.length===1&&a.L.say[0]==='店員：我們今天要打烊了。'&&a.L.enter[1].x===5,JSON.stringify(a.L));
  a=mk('xs_xsports',22.2,day); const r5=X.tick(a.GM); await new Promise(f=>setTimeout(f,10));
  check('11. 運動廣場 22:00 以後：店員一句、到店門外',r5===true&&a.L.say.length===1&&a.L.say[0]==='店員：我們今天要打烊了。'&&a.L.enter[1].x===7,JSON.stringify(a.L));
  a=mk('xs_xsports',15,day); check('12. 運動廣場 15:00 營業中不動',X.tick(a.GM)===false);
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})();
