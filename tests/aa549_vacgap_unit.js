// AA_549 寒暑假空白缺口表＋第一批稿（企劃線 claude/cool-heisenberg-o8kuqx；VAC-GAP-1031；D99 第二優先）——不需要瀏覽器。用法：node tests/aa549_vacgap_unit.js
//   2-1 芯慈大二暑假：作息平日 9～17「在證券公司實習」、VA-09 第二則換證券公司版（c14 版也換）
//   2-2 阿凱 2027-08-01～08-20 回宜蘭　2-3 Alison 2027-07-12～07-21 營隊（7/17 探班照舊）　2-7 語彤 2027-07-19～07-30 台東田野＋兩則私訊
//   2-4／3-2 2028 除夕的年夜飯　2-5／3-3 語彤 2/7 麵店、子晴 8/1 Café 的場景　2-6 C13 帶朋友出國：那幾天不在臺北、有活動卡的朋友婉拒
//   3-1 大三暑假三選一的九個小場景　3-4 回家住「出門」、晚餐多十二題　3-5 C04W、C18W 大一寒假開　3-6 女主角假期版邀約（她傳、見面第一句）
// 台詞一字不差照 AA_549（企劃線）；每一項在修改前（caabccf30）都會 FAIL（第 0 節「稿讀得到」除外）。
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H, J=JSON.stringify;
const loadG=(f)=>{ const s=fs.readFileSync(path.join(H.ROOT,f),'utf8').replace(/^const ([A-Z_][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); };
let loadErr='';
for(const f of ['src/holff3d.js','src/data/y1fill_events.js','src/y1fill3d.js','src/data/vacfill_events.js','src/vacfill3d.js','src/r2y3b3d.js','src/data/heroine_asks.js','src/heroine_asks3d.js']){ try{ loadG(f); }catch(e){ loadErr+=f+'：'+String(e&&e.message||e)+'　'; } }
const git=(ref,p)=>{ try{ return cp.execSync('git -c core.quotepath=false show '+ref+':"'+p+'"',{cwd:H.ROOT,encoding:'utf8',maxBuffer:1<<26,stdio:['ignore','pipe','ignore']}); }catch(e){ return ''; } };
const A549='docs/story_planning/AA_549_寒暑假空白缺口表_第一批稿.md';
const doc=git('origin/claude/cool-heisenberg-o8kuqx',A549);
check('0. AA_549（企劃線）讀得到；模組都載得到',doc.length>3000&&!loadErr,loadErr||'git fetch origin claude/cool-heisenberg-o8kuqx');
const inDoc=t=>!doc||doc.includes(String(t).replace(/^「(.*)」$/,'$1'));
const notIn=L=>L.filter(t=>!inDoc(t));
const D=H.D, T=(d,h)=>d*24+h, wd=d=>CALENDAR.dateOf(d).wd%7;
const at=(k,h)=>{ const d=typeof k==='number'?k:D(k); H.G.day=d; H.G.hour=h; H.G.weekday=wd(d); };
const pres=(id,k)=>STORY.presence(id,Object.assign({},H.G,{day:D(k)}));
const fresh=(k,h,zone,flags)=>{ const G=H.fresh(k,h,zone||'dorm',flags); if(!G.contacts) G.contacts={}; if(!Array.isArray(G.trips)) G.trips=[]; return G; };
const txt=th=>(H.G.msgs||[]).filter(m=>PHONE.th(m)===th).map(m=>m.text);

/* ================= 2-1 芯慈：證券公司實習 ================= */
{ const xc=CHARACTERS.classmate_xinci;
  fresh('2027-07-06',16); const e1=STORY.schedEnt(xc,H.G);
  at('2027-07-06',17.5); const e2=STORY.schedEnt(xc,H.G);
  at('2027-07-10',10); const e3=STORY.schedEnt(xc,H.G);
  at('2027-08-30',16); const e4=STORY.schedEnt(xc,H.G);
  check('2-1. 芯慈 2027-07-06（二）16:00「在證券公司實習」（不在總圖）；17:30 以後照原本的作息；週六、8/27 以後照舊',!!e1&&e1.zone==null&&e1.away==='在證券公司實習'&&!!e2&&e2.zone==='library'&&!(e3&&e3.away==='在證券公司實習')&&!!e4&&e4.zone==='library',J([e1&&(e1.away||e1.zone),e2&&e2.zone,e3&&(e3.away||e3.zone),e4&&e4.zone]));
  const M=VAC_DATA.VA09.msgs, m2=M.find(m=>m.tag==='va09_2');
  check('2-1. VA-09 第二則：「今天幫忙整理一份併購的時程表。很長。」「主管說排得很清楚。我很高興。」；c14 版「跟你上次在我家事務所看到的白板很像。現在換我排。」',
    J(m2.ms)===J(['今天幫忙整理一份併購的時程表。很長。','主管說排得很清楚。我很高興。'])&&J(m2.c14)===J(['今天幫忙整理一份併購的時程表。很長。','跟你上次在我家事務所看到的白板很像。現在換我排。']),J(m2));
  check('2-1. VA-09 第一則照舊；四則都沒有「我爸」',J(M[0].ms)===J(['第一天。我負責影印。','影印機會卡紙，卡在第三格。我已經會修了。'])&&!M.some(m=>m.ms.concat(m.c14||[]).some(t=>/我爸/.test(t))),J(M.map(m=>m.ms))); }

/* ================= 2-2 阿凱、2-3 Alison、2-7 語彤 的不在日期 ================= */
{ fresh('2027-07-01',10);
  const k=['2027-07-31','2027-08-01','2027-08-20','2027-08-21'].map(d=>{ const p=pres('kai',d); return p.here?'here':p.away+'/'+p.kind; });
  check('2-2. 阿凱 2027-08-01～08-20「回宜蘭」（home）、7/31 和 8/21 在臺北',J(k)===J(['here','回宜蘭/home','回宜蘭/home','here']),J(k));
  const y=['2027-07-11','2027-07-12','2027-07-17','2027-07-21','2027-07-22'].map(d=>{ const p=pres('yu',d); return p.here?'here':p.away+'/'+p.kind+(p.signal?'+signal':''); });
  check('2-3. Alison 2027-07-12～07-21「在營隊當小隊長」（trip，有訊號）；7/11、7/22 在臺北',J(y)===J(['here','在營隊當小隊長/trip+signal','在營隊當小隊長/trip+signal','在營隊當小隊長/trip+signal','here']),J(y));
  const c=TERMEND_LINES.C15.yu_camp2; at('2027-06-20',12); TERMEND.c15Plan(H.G,'yu_camp2'); const q=OUT.get(H.G,'c15_yu_camp2');
  check('2-3. 7/17 探班（C15 yu_camp2）照舊排得進行事曆',!!c&&!!q&&q.day===D('2027-07-17')&&q.state==='planned',J(q));
  const t=['2027-07-18','2027-07-19','2027-07-30','2027-07-31'].map(d=>{ const p=pres('heroine_03',d); return p.here?'here':p.away+'/'+p.kind+(p.signal?'+signal':''); });
  check('2-7. 語彤 2027-07-19～07-30「田野調查（台東）」（trip，有訊號）；7/18、7/31 在臺北',J(t)===J(['here','田野調查（台東）/trip+signal','田野調查（台東）/trip+signal','here']),J(t));
  check('2-7. 不在日期的字照稿（「回宜蘭」「在營隊當小隊長」「田野調查（台東）」）',!notIn(['回宜蘭','在營隊當小隊長','田野調查（台東）']).length); }
{ const yt='heroine_03', run=(k,h)=>{ at(k,h); STORY.phoneRules(GM); PHONE.tick(H.G); };
  fresh('2027-07-20',20); H.FRIEND(yt); H.G.contacts[yt]=H.G.day-200; run('2027-07-21',21.1); const a=txt('p:'+yt); run('2027-07-28',21.1); const b=txt('p:'+yt);
  const L1='這裡的阿嬤說話很快。我錄音錄了兩小時，聽懂一半。', L2='明天最後一天。阿嬤問我要不要留下來嫁給她孫子。我說要回去顧店。';
  check('2-7. 和語彤朋友以上：7/21 21:00、7/28 21:00 她傳兩則私訊（台詞照稿）',a.includes(L1)&&!a.includes(L2)&&b.includes(L2)&&!notIn([L1,L2]).length,J(b));
  fresh('2027-07-20',20); H.FAMILIAR(yt); H.G.contacts[yt]=H.G.day-200; run('2027-07-21',21.1); run('2027-07-28',21.1);
  check('2-7. 只有有點熟（FAMILIAR）：收不到',!txt('p:'+yt).length,J(txt('p:'+yt))); }

H.done();
