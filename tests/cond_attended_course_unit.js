// BUG-TALK-STUCK-1104（使用者 11-04 總圖多媒體中心找芷若說話就卡住；CC 在使用者電腦用使用者存檔重現，線上 main e1603907e、開發分支 a8c485729 都一樣）：
// console「c.attended.every is not a function」——閒聊階梯芷若 Z-L3（src/data/ladder.js）的條件是 attended:{course:'econ_principles_1',min:1}（上過經原幾次），
// EVENTS.cond 只會把 attended 當活動 id 的陣列，呼叫 every 丟例外，talkCharacter 停在 sceneBegin 之後（busyDepth 1、ADV 開著、鏡頭 cinematic、人不能動）。
// 檢查：1. 物件寫法＝課表的出席次數（CLS.rec(G).attend）：0 次不成立、1 次成立、min 2 照算；不丟例外 2. 陣列照舊（活動到場）3. 字串＝一個活動 id，不丟例外
// 4. ladder.js 裡所有 if／skipIf 條件跑 EVENTS.cond 都不丟例外（掃整份資料，防同類）。修改前第 1、3 項丟例外＝FAIL。用法：node tests/cond_attended_course_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'); const ROOT=path.resolve(__dirname,'..'); global.window=global;
for(const f of ['src/data/calendar.js','src/data/activities.js','src/events3d.js','src/data/ladder.js']) vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (CALENDAR|ACTIVITIES|EVENTS|LADDER)\s*=/m,'global.$1='),{filename:f});
let fails=0; const check=(n,ok,i)=>{ console.log((ok?'PASS ':'FAIL ')+n+(i?'　'+i:'')); if(!ok) fails++; };
const att={}; global.CLS={rec:()=>({attend:att})};
const stub=()=>new Proxy(function(){},{get:(t,k)=>k===Symbol.toPrimitive?()=>0:(()=>null),apply:()=>null});   /* 第 4 項只看條件本身會不會丟例外：其他系統（SOCIAL、PHONE…）一律回 null */
global.SOCIAL=new Proxy({},{get:(t,k)=>k==='STAGES'?['STRANGER','ACQUAINTANCE','FAMILIAR','FRIEND','CLOSE_FRIEND']:(()=>null)});
for(const k of ['PHONE','STORY','INV','OUT','ROM','CALENDAR_X','MULTIREL','TERMEND','LEGAL']) if(typeof global[k]==='undefined') global[k]=new Proxy({},{get:()=>()=>null});
const G={day:35,hour:15.4,zone:'library_media',weekday:2,flags:{},events:{done:{},last:{}},acts:{att:{}}}; EVENTS.bind({G,E:{zone:null,player:null}});
const tryC=q=>{ try{ return {v:EVENTS.cond(q)}; }catch(e){ return {err:String(e&&e.message||e)}; } };
{ const q={attended:{course:'econ_principles_1',min:1}}; const r0=tryC(q); att.econ_principles_1=1; const r1=tryC(q); att.econ_principles_1=3; const r2=tryC({attended:{course:'econ_principles_1',min:4}}); const r3=tryC({attended:{course:'econ_principles_1',min:2}});
  check('1. attended:{course,min}＝上過這門課幾次：0 次 false、1 次 true、3 次對 min 4 false、對 min 2 true；不丟例外',r0.v===false&&r1.v===true&&r2.v===false&&r3.v===true,JSON.stringify([r0,r1,r2,r3])); att.econ_principles_1=0; }
{ G.acts.att['B4@30']={h:19,end:'full'}; const a=tryC({attended:['B4']}), b=tryC({attended:['B9']}); check('2. 陣列照舊（活動到場）：聽過 B4 true、沒聽過 B9 false',a.v===true&&b.v===false,JSON.stringify([a,b])); }
{ const a=tryC({attended:'B4'}), b=tryC({missed:'B9'}), c=tryC({notAttended:'B4'}); check('3. 字串＝一個活動 id：不丟例外（attended B4 true、notAttended B4 false）',!a.err&&!b.err&&!c.err&&a.v===true&&c.v===false,JSON.stringify([a,b,c])); }
{ const conds=[]; const walk=o=>{ if(!o||typeof o!=='object') return; if(Array.isArray(o)){ o.forEach(walk); return; } for(const k of ['if','skipIf','unless']) if(o[k]&&typeof o[k]==='object') conds.push([o.id||'?',k,o[k]]); for(const k in o) if(typeof o[k]==='object') walk(o[k]); };
  walk(LADDER); const bad=[]; for(const [id,k,q] of conds){ const r=tryC(q); if(r.err) bad.push(id+'.'+k+': '+r.err); }
  check('4. ladder.js 所有條件（'+conds.length+' 個）跑 EVENTS.cond 都不丟例外',conds.length>50&&!bad.length,bad.slice(0,5).join(' | ')); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
