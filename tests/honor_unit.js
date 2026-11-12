// 書卷獎（D44，AA_126 第 2 節）、看出席的課三堂及格（D43，AA_126 1-4）——不需要瀏覽器。
//   0  src/honor3d.js 載得到、index.html 有接；story3d.js 認識的人說話前的掛勾 PRE_TALK
//   1  平均：只算法律課期末考；缺考算 0；題庫不足沒開考的不算；≥ 4 才有
//   2  公告：下學期第 2 週週一 09:00 以後（手機系統提醒、HONOR_<學期>）；好感照表、只算一次；沒拿到＝不公告
//   3  公告以後第一次找以安：「名單上有你。……卷哥。」（AA_587 第 27 列，使用者 11-02 選；原本「名單上有你。理由？」）；柏翰：（柏翰把名單拍下來。）「……好。」；只有一次
//   4  看出席的課：成績單及格／不及格（三堂）；課表寫「出席 n／3 堂（三堂及格）」「已達及格」；服務學習照舊
//   5  第 12 週週一 08:00 還有不到三堂的課＝一門一則系統通知（AA_418）；5b 第一堂課老師說的規定（AA_418 第 1 節）
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
  check('0. story3d.js：S.PRE_TALK、說話前一個一個問',Array.isArray(STORY.PRE_TALK)&&STORY.PRE_TALK.includes(X()&&X().preTalk)&&/for\(const f of S\.PRE_TALK\)\{ (?:if\([^)]*\) continue; )?try\{ await f\(GM,who,id\); \}/.test(st)); });
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
  await X().preTalk(GM,{name:'沈以安'},'heroine_01'); check('3. 以安：「名單上有你。……卷哥。」（AA_587 第 27 列）；舊句「理由？」不出',H.has('名單上有你。……卷哥。')&&!H.has('名單上有你。理由？'));
  const n=H.said.length; await X().preTalk(GM,{name:'沈以安'},'heroine_01'); check('3. 第二次沒有',H.said.length===n);
  await X().preTalk(GM,{name:'柏翰'},'classmate_bohan'); check('3. 柏翰：（柏翰把名單拍下來。）「……好。」',H.has('（柏翰把名單拍下來。）')&&H.has('……好。'));
  at(d,13); H.G.flags.HONOR_Y1S1=false; H.G.flags.HONOR_LAST='Y1S1'; await X().preTalk(GM,{name:'沈以安'},'heroine_01'); check('3. 沒拿到：沒有',!H.said.length); });

await sec(4,()=>{ const d=termDay('Y1S1',5,1); at(d,10); const R=CLS.rec(H.G); const cs=CLS.termCourses(H.G,'Y1S1'), att=cs.filter(CLS.attCourse), sv=cs.find(c=>c.kind==='service');
  check('4. 大一上看出席的課：國文、英文、體育、通識這類（法律課、服務學習不算）',att.length>=3&&att.every(c=>!CLS.isExamCourse(c)&&c.kind!=='service'),att.map(c=>c.name).join('、'));
  const c1=att[0], c2=att[1]; R.attend[c1.id]=2; R.attend[c2.id]=3; const g=CLS.reportFor(H.G,'Y1S1');
  check('4. 成績單：兩堂「不及格（下學期重修）」、三堂「及格」',g[c1.id]==='不及格（下學期重修）'&&g[c2.id]==='及格',J([g[c1.id],g[c2.id]]));
  const h=CLS.weekHTML(H.G).replace(/<[^>]+>/g,' ').replace(/\s+/g,' ');   /* 2026-11-10 ATTEND-TIDY-1110：出席改成一門課一行（課名、次數分開兩格），比對前先拿掉標籤 */
  check('4. 課表（ATTEND-ROLLCALL-1102）：看出席的課寫「點過 n 次名（缺 m 次）」，只算已經點過的',new RegExp(c1.name.replace(/[()（）]/g,'.')+' 點過 \\d 次名').test(h)&&!/三堂及格/.test(h),h.slice(h.indexOf('出席'),h.indexOf('出席')+200));
  check('4. 服務學習照舊只記次數',!sv||h.includes(sv.name+' '+(R.attend[sv.id]||0)+'／')); });

await sec(5,()=>{ const d=termDay('Y1S1',12,1); at(d,7.5); const R=CLS.rec(H.G), att=CLS.termCourses(H.G,'Y1S1').filter(CLS.attCourse); for(const c of att) R.attend[c.id]=3; R.attend[att[0].id]=1; R.attend[att[1].id]=2;
  X().phone(H.G); check('5. 第 12 週週一 07:30 還沒',!PHONE.sent(H.G,'att_warn_Y1S1'));
  H.G.hour=8.1; X().phone(H.G); PHONE.tick(H.G); const m=H.msgs('sys');
  const e0='【出席】'+att[0].name+'：這學期出席 1／3 堂。三堂及格，還有 5 週。', e1='【出席】'+att[1].name+'：這學期出席 2／3 堂。三堂及格，還有 5 週。';
  const risk=att.filter(c=>CLS.rollStat(H.G,c,'Y1S1',H.G.day).missed>=2); check('5. 08:06（ATTEND-ROLLCALL-1102）：點名已經缺 2 次以上的每門一則「這學期點過 n 次名，你缺了 m 次。」',m.length===risk.length&&m.length>0&&m.every(x=>/^【出席】.+：這學期點過 \d 次名，你缺了 \d 次。$/.test(x)),J({m,risk:risk.map(c=>c.id)}));
  H.G.hour=15; X().phone(H.G); PHONE.tick(H.G); check('5. 只提醒一次',H.msgs('sys').length===risk.length);
  at(d,10); const R2=CLS.rec(H.G); for(let dd=d-90;dd<d;dd++) for(const it of CLS.dayItems(H.G,dd)) if(CLS.attCourse(it.c)) R2.done[it.key]=1; X().phone(H.G); PHONE.tick(H.G); check('5. 點名都到了：不提醒',!H.msgs('sys').length); });

await sec('5b',()=>{ const d=termDay('Y1S1',3,1); at(d,9); const L=id=>CLS.attRuleLines(H.G,Object.assign({},CLS.byId(id)));
  check('5b. 國文：老師兩句（ATTEND-ROLLCALL-1102 AA 定稿）',J(L('chinese_y1'))===J([['老師','這門課我會點名，不會事先講。'],['老師','……可是我希望你們不是因為點名才來。']]),J(L('chinese_y1')));
  check('5b. 日文：日文那句＋中文',L('japanese_1')[0][1]==='この授業は、ときどき出席を取ります。');
  // CANON-NO-ECON-1112：經濟系那一年拿掉（5b「演過經濟系（Y0_LEFT）＝多一句旁白」那一半）
  check('5b. 經濟學原理：沒演過經濟系＝兩句；演過（Y0_LEFT）＝多一句旁白',L('econ_principles_1').length===2);
  check('5b. 重修的學期：多「重修的同學，這學期一樣會點名。」（AA_578 第 5 節定稿）',CLS.attRuleLines(H.G,Object.assign({},CLS.byId('pe_y1s1'),{rt:{from:'Y1S1'}})).slice(-1)[0][1]==='重修的同學，這學期一樣會點名。');
  const src=fs.readFileSync(path.join(H.ROOT,'src/classes3d.js'),'utf8');
  check('5b. CLS.attend：看出席的課、這一學期第一次出席才說（R.attRule）',/if\(S\.attCourse\(c\)\)\{ const rk=it\.term\+':'\+c\.id;[^\n]*if\(!R\.attRule\[rk\]\)/.test(src)); });

await sec(6,async()=>{ const d=termDay('Y1S2',1,1); at(d,9); const n=lawCs('Y1S1').length; setExam('Y1S1',Array(n).fill(4)); await CLS.showGrades(GM,'Y1S1');
  const gl=()=>(H.said.find(s=>/：/.test(s.t)&&/　/.test(s.t))||{t:''}).t;   /* 成績那一行（後面可能接重修的說明）*/
  check('6. 成績單最後一項「書卷獎」',/　書卷獎$/.test(gl()),gl().slice(-30));
  at(d,9); setExam('Y1S1',Array(n).fill(2)); await CLS.showGrades(GM,'Y1S1'); check('6. 沒拿到：沒有',!/書卷獎/.test(gl())); });

H.done();
})();
