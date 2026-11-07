// AA_726（企劃線 8255634fb）經濟系序章跳日子的日期卡句子＋E05 之後的三句（BUG-Y0-DAYSKIP-CARD-1107；BB_255 CC 試玩第 1、3 件）——不需要瀏覽器（D131）。
// 檢查：1 9/13 → 9/16（跳過 9/14～9/15 週末）＝新句「保齡球那晚以後的週末…」；2 9/16 → 9/20＝「下課以後，常常是同一群人…」（範圍改成 9/17～9/19，不會被前一跳用掉）
//       3 9/20 同一天 18:30 → 23:00＝「晚上，你在宿舍洗手上的油…」；只跳到 19:00＝不出；4 跨日（9/19 → 9/22）不出那句同一天的
//       5 ev_y0_e05 最後一句「走，去公館。我請你喝飲料。」之後接 AA_726 e05_after 三句。修改前 1、3、5 FAIL。用法：node tests/aa726_cards_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.document={getElementById:()=>null,addEventListener(){}}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CALENDAR|COURSES|CLS|CHARACTERS|ECONFF|STORY_EVENTS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/calendar.js','src/data/characters.js','src/data/courses.js','src/classes3d.js','src/econff3d.js']) load(f);
let fails=0; const check=(n,ok,i)=>{ console.log((ok?'PASS ':'FAIL ')+n+(i?'　'+i:'')); if(!ok) fails++; };
const dayOf=k=>{ for(let d=-600; d<400; d++){ const t=CALENDAR.dateOf(d); if(t&&t.key===k) return d; } return null; };
global.STORY={dayOfKey:dayOf}; global.EVENTS={running:null}; global.PHONE={pending:()=>[],tick(){},at:()=>true};
const W='（保齡球那晚以後的週末，你在宿舍把經原的第一章讀完了。那件制服，還在可昕那裡。）', C='（下課以後，常常是同一群人一起走出教室：韋綸、唐睿、品妤、阿勳，還有她。）', N='（晚上，你在宿舍洗手上的油。洗了三次，指甲縫還是黑的。）';
const AFTER=['（她騎在前面，帶你到公館一間手搖店。她點了兩杯一樣的，一杯塞給你。）','修車的錢。','（喝完，天已經暗了。你們在校門口分開，各自騎回去。）'];
const mkG=k=>({stage:'econ',day:dayOf(k),hour:8,flags:{E01_MORNING:true,ECON_FULL:false,ECONFF:{done:{},lines:[]}},events:{done:{}}});
const G=mkG('2024-09-13');
const a=ECONFF.cardLine(G,dayOf('2024-09-13'),dayOf('2024-09-16')), b=ECONFF.cardLine(G,dayOf('2024-09-16'),dayOf('2024-09-20'));
check('1. 9/13 → 9/16（9/14～9/15 週末）：「保齡球那晚以後的週末…」',a===W,a);
check('2. 9/16 → 9/20（9/17～9/19）：「下課以後，常常是同一群人…」（不會被前一跳用掉）',b===C,b);
const d=dayOf('2024-09-20'); const c0=ECONFF.cardLine(G,d,d,18.5,19), c1=ECONFF.cardLine(G,d,d,18.5,23), c2=ECONFF.cardLine(G,d,d,18.5,23);
check('3. 9/20 同一天 18:30 → 23:00：「晚上，你在宿舍洗手上的油…」；只到 19:00 不出；出過不再出',c0===null&&c1===N&&c2===null,JSON.stringify([c0,c1,c2]));
const G2=mkG('2024-09-19'); const x=ECONFF.cardLine(G2,dayOf('2024-09-19'),dayOf('2024-09-22'));
check('4. 跨日 9/19 → 9/22：不出 9/20 同一天那句',x!==N&&!(x||'').includes(N),x);
global.STORY_EVENTS=[]; const s=fs.readFileSync(path.join(ROOT,'src/data/events.js'),'utf8'); const i=s.indexOf("id:'ev_y0_e05'"), j=s.indexOf('after:',i); const seg=i>0&&j>i?s.slice(i,j):'';
const k=seg.indexOf("走，去公館。我請你喝飲料。"), tail=k>0?seg.slice(k):'';
check('5. ev_y0_e05「走，去公館。我請你喝飲料。」之後接 AA_726 e05_after 三句（照順序）',k>0&&AFTER.every(t=>tail.includes("text:'"+t+"'"))&&tail.indexOf(AFTER[0])<tail.indexOf(AFTER[1])&&tail.indexOf(AFTER[1])<tail.indexOf(AFTER[2]));
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
