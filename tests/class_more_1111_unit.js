// 課堂內容多一個欄位 more（AA 2026-11-11，STUDY-EXAM-STORY-1102 課堂內容補寫）：教授在 line 之後接著講的句子，照順序各一個對話框。
// 位置：line 之後、recall／IN_CLASS／react 之前；教授在場用教授名字，不在場照「○老師：」前綴；沒有 more 的週照舊。不需要瀏覽器。
// 修改前（開發分支 e4656573d）：S.content 不帶 more、S.attend 不播 → 1、2、3 FAIL。
// 用法：node tests/class_more_1111_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), path=require('path');
const {check,GM}=H;
const J=JSON.stringify;
const setDay=(d,h)=>{ const G=H.G; G.day=d; G.hour=h; const w=CALENDAR.dateOf(d).wd; G.weekday=w===7?0:w; };
(async()=>{
  /* 找一堂有 syllabus、已審查、一般的課（不是考試、體育、服務學習）*/
  let it=null, G=null, day=0; const d0=STORY.termDayIn('Y1S1',3,1);
  const fresh=(d,h)=>{ const G=H.fresh('2026-01-01',h,'campus',{}); setDay(d,h); G.outings=[]; EVENTS.zoneChanged(); return G; };
  for(let d=d0; d<d0+7&&!it; d++){ G=fresh(d,8); const c=CLS.dayItems(G,d).find(x=>!x.exam&&x.c.kind!=='service'&&x.c.kind!=='pe'&&CLS.content(x).line&&x.c.syllabus&&x.c.syllabus.find(q=>q.w===x.week&&q.line===CLS.content(x).line)); if(c){ it=c; day=d; } }
  check('0. 找得到大一上一堂有課堂內容的課（'+(it?it.c.id+' 第 '+it.week+' 週':'')+'）',!!it,String(day));
  if(!it){ H.done(); return; }
  const sy=it.c.syllabus.find(q=>q.w===it.week), old=sy.more; delete sy.more;   /* 這一週本來就有 more 的（11-11 起大一上三科有）先拿掉當對照 */
  const attend=async()=>{ G=fresh(day,it.start||8); const i2=CLS.dayItems(G,day).find(x=>x.key===it.key); H.said=[]; H.opts=[]; H.picks=[0,0,0,0,0,0]; await CLS.attend(GM,i2,{forced:true}); return H.said.map(s=>s.t); };
  const base=await attend();
  check('1. 沒有 more 的週：照舊播得到 line',base.some(t=>t.indexOf(CLS.unq(sy.line))>=0||t.indexOf(sy.line)>=0),J(base.slice(0,6)));
  sy.more=['第二句甲。','第三句乙。'];
  check('2. S.content 帶 more',J(CLS.content(it).more)===J(sy.more));
  const L=await attend(); const iL=L.findIndex(t=>t.indexOf(CLS.unq(sy.line))>=0||t.indexOf(sy.line)>=0), i1=L.findIndex(t=>/第二句甲。$/.test(t)), i2=L.findIndex(t=>/第三句乙。$/.test(t));
  check('3. more 兩句各一個對話框、照順序、緊接在 line 後面',iL>=0&&i1===iL+1&&i2===iL+2,J(L.slice(Math.max(0,iL),iL+4)));
  check('4. 其他句子不變（多出來的只有那兩句）',J(L.filter((t,i)=>i!==i1&&i!==i2))===J(base),'');
  sy.more=old; if(old===undefined) delete sy.more;
  const imp=fs.readFileSync(path.join(H.ROOT,'tools/syllabus/import_syllabus.py'),'utf8');
  check('5. 匯入工具 KEEP 收 more',/KEEP = \([^)]*'more'\)/.test(imp));
  { const long=[]; for(const id in SYLLABUS.courses) for(const w of SYLLABUS.courses[id]) for(const m of (w.more||[])) if(typeof m!=='string'||[...m].length>40) long.push(id+' W'+w.w+' '+[...String(m)].length);
    check('6. more 每一句是字串、≤40 字（和教授台詞同一條 BB 規則）',!long.length,long.slice(0,6).join('；')); }
  H.done();
})();
