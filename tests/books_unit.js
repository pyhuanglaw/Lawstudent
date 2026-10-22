// 書店照課賣教科書（SYS-BOOKS-1018；使用者 10-18 選擇題 D102、USER_WANTS X15：「經濟系那年還是賣《民法總則》（不對）」「每一門法律課的書都可以買，買了讀那一科的效果變好」）——不需要瀏覽器。
// 檢查：1. 經濟系那一年的書店賣經濟系的書（經濟學原理、初等會計學、微積分），不賣《民法總則》；2. 法律系大一上賣憲法、刑法總則、民法總則…，不賣國文、體育、服務學習；
//       3. 上下學期同一本（刑法總則（一）（二））；舊存檔買過民總（F.textbook）算有；4. 買了：扣錢、記下來、不重複買；5. 自學那一科多一分準備；
//       6. 那一科的期末考（五題）第一次選錯可以再選一次（沒買的不行）。修改前：書店只有《民法總則》、沒有 CLS.bookList，第 1 項就 FAIL。用法：node tests/books_unit.js
const vm=require('vm'), fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.THREE={Vector3:function(x,y,z){this.x=x;this.y=y;this.z=z;}};
global.P3={CAST:new Proxy({},{get:(t,k)=>({name:String(k)})})};
const mkObj=()=>({position:{x:0,y:0,z:0,set(x,y,z){this.x=x;this.y=y;this.z=z;}},rotation:{y:0},userData:{}});
global.CHAR={build:()=>mkObj(),setExpr(){}}; global.location={search:''}; global.document={getElementById:()=>null,addEventListener(){}};
global.SOCIAL={displayName:id=>(CHARACTERS[id]&&CHARACTERS[id].name)||id,stage:()=>'ACQ',noticed(){},reveal:()=>'ACQUAINTANCE',has:()=>true};
global.EVENTS={npcOf:()=>null,onEnter(){},tick(){}};
for(const f of ['src/data/characters.js','src/data/places.js','src/data/calendar.js','src/data/courses.js','src/story3d.js','src/classes3d.js']) vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (CHARACTERS|STORY|PLACES|SOCIAL_GRAPH|UNFAMILIAR_POOL|PORTRAITS|CALENDAR|COURSES|CLS)\s*=/mg,'global.$1='),{filename:f});
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
const DK=k=>STORY.dayOfKey(k);
const mkG=(key,stage,flags)=>({day:DK(key),hour:14,stage,flags:Object.assign({},flags||{}),money:5000,zone:'bookstore'});
if(typeof CLS.bookList!=='function'){ check('1. 有 CLS.bookList',false); console.log('FAILED '+fails); process.exit(1); }
{ const t=CLS.bookList(mkG('2024-09-10','econ')).map(b=>b.title);
  check('1. 經濟系那一年（2024-09-10）：書店賣經濟學原理、初等會計學、微積分，不賣《民法總則》',['經濟學原理','初等會計學','微積分'].every(x=>t.includes(x))&&!t.includes('民法總則'),t.join('、')); }
{ const t=CLS.bookList(mkG('2025-09-15','law')).map(b=>b.title);
  check('2. 法律系大一上：憲法、刑法總則、民法總則、經濟學原理都有；國文、英文、體育、通識、服務學習沒有',['憲法','刑法總則','民法總則','經濟學原理'].every(x=>t.includes(x))&&!t.some(x=>/國文|英文|體育|通識|服務學習/.test(x)),t.join('、')); }
{ const g=mkG('2026-03-02','law',{books:{'刑法總則':true}}), c2=COURSES.list.find(c=>c.id==='crim_gen2'), g2=mkG('2025-09-15','law',{textbook:true}), cv=COURSES.list.find(c=>c.id==='civ_general');
  check('3. 上下學期同一本：大一上買的《刑法總則》大一下的刑法總則（二）也算有；舊存檔買過民總（textbook）算有《民法總則》',CLS.hasBook(g,c2)&&CLS.hasBook(g2,cv)&&!CLS.hasBook(mkG('2025-09-15','law'),cv)); }
(async()=>{
  { const g=mkG('2025-09-15','law'), said=[], toasts=[]; let pick='《憲法》'; const GM={G:g,sceneBegin(){},sceneEnd(){},money(d){ g.money+=d; },memo(){},toast:t=>toasts.push(t),say:async(w,t)=>{ said.push(t); },choose:async o=>{ const k=o.findIndex(x=>x.t.startsWith(pick)); return k<0?o.length-1:k; }};
    await STORY.bookshop(GM); const m1=g.money; pick='《憲法》'; await STORY.bookshop(GM);
    check('4. 買《憲法》：扣 650 元、記在 books、出提示；再買一次不扣錢（已經有了）',m1===4350&&g.flags.books&&g.flags.books['憲法']===true&&g.money===4350&&toasts.some(t=>/《憲法》/.test(t)),JSON.stringify({m1,m:g.money,books:g.flags.books,toasts}));
    pick='《民法總則》'; await STORY.bookshop(GM);
    check('4b. 買《民法總則》：照舊那一句旁白、也記 textbook（開學待辦照舊打勾）',g.flags.textbook===true&&said.some(t=>/大部分人到期末都只翻到第三章/.test(t)));
    pick='《刑法總則》'; await STORY.bookshop(GM); pick='《經濟學原理》'; await STORY.bookshop(GM);
    const B1='（書比想像中重。你把它塞進背包，拉鍊差一點拉不起來。）', B2='（新書的味道。你翻了兩頁，又闔上，留到上課再看。）', got=said.filter(t=>t===B1||t===B2);
    check('4c. 買民法總則以外的書：AA 的兩句旁白輪流（憲法＝第一句、第二本＝第二句、第三本又是第一句）；民法總則不算',JSON.stringify(got)===JSON.stringify([B1,B2,B1]),JSON.stringify({got,books:g.flags.books})); }
  { const g=mkG('2025-09-15','law',{books:{'憲法':true}}), GM={G:g,choose:async o=>o.findIndex(x=>/^憲法/.test(x.t))}; await CLS.studyPick(GM); const a=CLS.rec(g).prep.const_1;
    const g2=mkG('2025-09-15','law'), GM2={G:g2,choose:async o=>o.findIndex(x=>/^憲法/.test(x.t))}; await CLS.studyPick(GM2); const b=CLS.rec(g2).prep.const_1;
    check('5. 自學憲法：有教科書多一分準備（2 對 1）',a===2&&b===1,JSON.stringify({a,b})); }
  { const q={id:'t1',q:'測試題',options:{A:'甲',B:'乙',C:'丙',D:'丁'},answer:'C'}, qs=[q,q,q,q,q]; const orig=CLS.drawExam; CLS.drawExam=G=>{ const R=CLS.rec(G); R.exam=R.exam||{}; return {ok:true,qs,key:'k_const_final'}; };   /* 真的 drawExam 會建 R.exam */
    const run=async books=>{ const g=mkG('2026-01-05','law',books?{books:{'憲法':true}}:{}); let n=0; const toasts=[], said=[]; const GM={G:g,say:async(w,t)=>{ said.push(t); },toast:t=>toasts.push(t),choose:async o=>{ n++; const w=o.findIndex(x=>/（A）/.test(x.t)), r=o.findIndex(x=>/（C）/.test(x.t)); return n===1?w:r; }};
      const res=await CLS.runExam(GM,{c:COURSES.list.find(c=>c.id==='const_1'),exam:'final',term:'Y1S1'}); return {res,toasts,said}; };
    const a=await run(true), b=await run(false); CLS.drawExam=orig;
    check('6. 期末考：有《憲法》的第一次選錯（A）可以再選一次＝第 1 題算對、之後照常；沒買的第 1 題就是錯的',a.res.correct===5&&b.res.correct===4,JSON.stringify({a:a.res,b:b.res}));
    const R1='（你想起課本上那一段。旁邊還有你自己畫的線。）';
    check('6b. 再選一次那一刻：AA 的旁白「（你想起課本上那一段。旁邊還有你自己畫的線。）」一次（原本只有提示）；沒買書的沒有',a.said.filter(t=>t===R1).length===1&&!b.said.includes(R1),JSON.stringify({a:a.said.filter(t=>/課本/.test(t)),toasts:a.toasts})); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
