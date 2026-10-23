// 書卷獎（D44，AA_126 第 2 節）、看出席的課三堂及格（D43，AA_126 1-4）——不需要瀏覽器。
//   0  src/honor3d.js 載得到、index.html 有接；story3d.js 認識的人說話前的掛勾 PRE_TALK
//   1  平均：只算法律課期末考；缺考算 0；題庫不足沒開考的不算；≥ 4 才有
//   2  公告：下學期第 2 週週一 09:00 以後（手機系統提醒、HONOR_<學期>）；好感照表、只算一次；沒拿到＝不公告
//   3  公告以後第一次找以安：「名單上有你。理由？」；柏翰：（柏翰把名單拍下來。）「……好。」；只有一次
//   4  看出席的課：成績單及格／不及格（三堂）；課表寫「出席 n／3 堂（三堂及格）」「已達及格」；服務學習照舊
//   5  第 12 週週一 09:00 還有不到三堂的課＝手機提醒一次
//   6  成績單多一行「書卷獎」
// 修改前（開發分支 700cb0b7f）：沒有 src/honor3d.js、看出席的課照讀書時數給「過了」——FAIL。用法：node tests/honor_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(HONOR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
let ok=true, err=''; try{ load('src/honor3d.js'); }catch(e){ ok=false; err=String(e); }
const X=()=>typeof HONOR!=='undefined'?HONOR:null;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const keyOf=d=>CALENDAR.dateOf(d).key;
const termDay=(id,week,wd)=>{ const r=CALENDAR.termDays(id); for(let d=r.from;d<=r.to;d++){ const t=CALENDAR.termOf(d); if(t&&t.id===id&&t.week===week&&CALENDAR.dateOf(d).wd%7===wd) return d; } return null; };
const at=(d,h)=>{ H.fresh(keyOf(d),h,'campus'); return H.G; };
const lawCs=id=>CLS.termCourses(H.G,id).filter(CLS.isExamCourse);
const setExam=(id,ks)=>{ const R=CLS.rec(H.G); R.exam=R.exam||{}; lawCs(id).forEach((c,i)=>{ const k=ks[i]; if(k==null) return; R.exam[id+':'+c.id+':final']=k==='ins'?{status:'insufficient',n:3}:{status:'done',correct:k,score:CLS.scoreOf(k)}; }); };

(async()=>{
await sec(0,()=>{ const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'), st=fs.readFileSync(path.join(H.ROOT,'src/story3d.js'),'utf8');
  check('0. src/honor3d.js 載得到、index.html 接在 closed3d.js 後面',ok&&!!X()&&/closed3d\.js\?v=[^"]+"><\/script>\n<script src="src\/honor3d\.js\?v=[^"]+"><\/script>/.test(html),err);
  check('0. story3d.js：S.PRE_TALK、說話前一個一個問',Array.isArray(STORY.PRE_TALK)&&STORY.PRE_TALK.includes(X()&&X().preTalk)&&/for\(const f of S\.PRE_TALK\)\{ try\{ await f\(GM,who,id\); \}/.test(st)); });
if(!X()){ H.done(); return; }

await sec(1,()=>{ const d=termDay('Y1S2',2,1); at(d,10); const n=lawCs('Y1S1').length;
  check('1. 大一上有法律課（五題期末考）',n>=3,n);
  setExam('Y1S1',Array(n).fill(4)); check('1. 每科答對 4 題：平均 4、有書卷獎',X().avg(H.G,'Y1S1')===4&&X().won(H.G,'Y1S1'));
  at(d,10); setExam('Y1S1',[5,5,null].concat(Array(Math.max(0,n-3)).fill(4)));
  check('1. 一科缺考（算 0）：平均掉下來',X().avg(H.G,'Y1S1')<4||n<=2,X().avg(H.G,'Y1S1'));
  at(d,10); setExam('Y1S1',['ins'].concat(Array(n-1).fill(4)));
  check('1. 題庫不足沒開考的那科不算',X().avg(H.G,'Y1S1')===4,X().avg(H.G,'Y1S1'));
  at(d,10); setExam('Y1S1',Array(n).fill(3)); check('1. 平均 3：沒有',!X().won(H.G,'Y1S1')); });

await sec(2,()=>{ const d=termDay('Y1S2',2,1); at(d,8.5); const n=lawCs('Y1S1').length; setExam('Y1S1',Array(n).fill(5)); H.FRIEND('heroine_01'); H.FRIEND('heroine_05'); H.FRIEND('zhe');
  const r0={an:Object.assign({},SOCIAL.rel('heroine_01')),sis:Object.assign({},SOCIAL.rel('heroine_05')),zhe:Object.assign({},SOCIAL.rel('zhe'))};
  X().phone(H.G); check('2. 第 2 週週一 08:30：還沒公告',H.G.flags.HONOR_Y1S1==null);
  H.G.hour=9.5; X().phone(H.G);
  check('2. 09:30：HONOR_Y1S1、手機系統提醒「系上公告：大一上書卷獎名單。名單上有你。」',H.G.flags.HONOR_Y1S1===true&&(H.G.msgs||[]).some(m=>m.th==='sys'&&m.text==='系上公告：大一上書卷獎名單。名單上有你。'),J(H.msgs('sys')));
  const a=SOCIAL.rel('heroine_01'), s=SOCIAL.rel('heroine_05'), z=SOCIAL.rel('zhe');
  check('2. 以安 +4／+6／戀愛 +6、學姊 +2／+4／+3、阿哲 +2／+1',a.fam-r0.an.fam===4&&a.trust-r0.an.trust===6&&(a.npcRom||0)-(r0.an.npcRom||0)===6&&s.fam-r0.sis.fam===2&&s.trust-r0.sis.trust===4&&(s.npcRom||0)-(r0.sis.npcRom||0)===3&&z.fam-r0.zhe.fam===2&&z.trust-r0.zhe.trust===1,J({an:[a.fam-r0.an.fam,a.trust-r0.an.trust,(a.npcRom||0)-(r0.an.npcRom||0)],zhe:[z.fam-r0.zhe.fam,z.trust-r0.zhe.trust]}));
  const fam=a.fam; X().phone(H.G); H.G.hour=15; X().phone(H.G); check('2. 只算一次',SOCIAL.rel('heroine_01').fam===fam&&H.msgs('sys').length===1);
  at(d,10); setExam('Y1S1',Array(n).fill(2)); X().phone(H.G); check('2. 沒拿到：HONOR_Y1S1 false、沒有公告',H.G.flags.HONOR_Y1S1===false&&!H.msgs('sys').length); });

await sec(3,async()=>{ const d=termDay('Y1S2',3,2); at(d,13); H.G.flags.HONOR_Y1S1=true; H.G.flags.HONOR_LAST='Y1S1';
  await X().preTalk(GM,{name:'沈以安'},'heroine_01'); check('3. 以安：「名單上有你。理由？」',H.has('名單上有你。理由？'));
  const n=H.said.length; await X().preTalk(GM,{name:'沈以安'},'heroine_01'); check('3. 第二次沒有',H.said.length===n);
  await X().preTalk(GM,{name:'柏翰'},'classmate_bohan'); check('3. 柏翰：（柏翰把名單拍下來。）「……好。」',H.has('（柏翰把名單拍下來。）')&&H.has('……好。'));
  at(d,13); H.G.flags.HONOR_Y1S1=false; H.G.flags.HONOR_LAST='Y1S1'; await X().preTalk(GM,{name:'沈以安'},'heroine_01'); check('3. 沒拿到：沒有',!H.said.length); });

await sec(4,()=>{ const d=termDay('Y1S1',5,1); at(d,10); const R=CLS.rec(H.G); const cs=CLS.termCourses(H.G,'Y1S1'), att=cs.filter(CLS.attCourse), sv=cs.find(c=>c.kind==='service');
  check('4. 大一上看出席的課：國文、英文、體育、通識這類（法律課、服務學習不算）',att.length>=3&&att.every(c=>!CLS.isExamCourse(c)&&c.kind!=='service'),att.map(c=>c.name).join('、'));
  const c1=att[0], c2=att[1]; R.attend[c1.id]=2; R.attend[c2.id]=3; const g=CLS.reportFor(H.G,'Y1S1');
  check('4. 成績單：兩堂「不及格（下學期重修）」、三堂「及格」',g[c1.id]==='不及格（下學期重修）'&&g[c2.id]==='及格',J([g[c1.id],g[c2.id]]));
  const h=CLS.weekHTML(H.G);
  check('4. 課表：「出席 2／3 堂（三堂及格）」「已達及格（3 次）」',h.includes(c1.name+' 出席 2／3 堂（三堂及格）')&&h.includes(c2.name+' 已達及格（3 次）'));
  check('4. 服務學習照舊只記次數',!sv||h.includes(sv.name+' '+(R.attend[sv.id]||0)+'／')); });

await sec(5,()=>{ const d=termDay('Y1S1',12,1); at(d,8); const R=CLS.rec(H.G), att=CLS.termCourses(H.G,'Y1S1').filter(CLS.attCourse); for(const c of att) R.attend[c.id]=3; R.attend[att[0].id]=1;
  X().phone(H.G); check('5. 第 12 週週一 08:00 還沒',!PHONE.sent(H.G,'att_warn_Y1S1'));
  H.G.hour=9.2; X().phone(H.G); PHONE.tick(H.G); const m=H.msgs('sys');
  check('5. 09:12：「第 12 週提醒：'+att[0].name+' 出席 1 堂。看出席的課要三堂才及格。」',m.includes('第 12 週提醒：'+att[0].name+' 出席 1 堂。看出席的課要三堂才及格。'),J(m));
  H.G.hour=15; X().phone(H.G); PHONE.tick(H.G); check('5. 只提醒一次',H.msgs('sys').length===1);
  at(d,10); const R2=CLS.rec(H.G); for(const c of CLS.termCourses(H.G,'Y1S1').filter(CLS.attCourse)) R2.attend[c.id]=3; X().phone(H.G); PHONE.tick(H.G); check('5. 都滿三堂：不提醒',!H.msgs('sys').length); });

await sec(6,async()=>{ const d=termDay('Y1S2',1,1); at(d,9); const n=lawCs('Y1S1').length; setExam('Y1S1',Array(n).fill(4)); await CLS.showGrades(GM,'Y1S1');
  const gl=()=>(H.said.find(s=>/：/.test(s.t)&&/　/.test(s.t))||{t:''}).t;   /* 成績那一行（後面可能接重修的說明）*/
  check('6. 成績單最後一項「書卷獎」',/　書卷獎$/.test(gl()),gl().slice(-30));
  at(d,9); setExam('Y1S1',Array(n).fill(2)); await CLS.showGrades(GM,'Y1S1'); check('6. 沒拿到：沒有',!/書卷獎/.test(gl())); });

H.done();
})();
