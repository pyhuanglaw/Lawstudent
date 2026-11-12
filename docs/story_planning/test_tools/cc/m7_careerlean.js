// CC M7（B6 準備）：careerLean 加分來源基準表的驗證腳本——不需要瀏覽器。只讀遊戲程式，不改 src/。
// 用法：WT=<受測工作樹根目錄（有 src/、tests/）> node m7_careerlean.js
//   1. 日曆上限：法服週六（S.fafuDuty）、公法讀書會（ACTIVITIES.on）在法律系四年有幾次
//   2. 寒暑假活動（C02 C08 C09 C10 C11 C12 C16）每年的日期、彼此撞期、交換路線擋掉哪幾個
//   3. 代表情境：careerLean 的 A／B／C 和基準表的公式一致
//   4. 疑點重現：不及格／缺考的通識也算、重修又算一次；國文英文體育（kind general）也算
'use strict';
const WT=process.env.WT||process.cwd();
const H=require(WT+'/tests/pg_harness.js');
const {check}=H, J=JSON.stringify;
const D=k=>PG.DK(k), key=d=>CALENDAR.dateOf(d).key;
const LAW=['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'];

/* ---------- 1. 日曆上限 ---------- */
{ const G=H.fresh('2025-09-01',9,'dorm'); let fafu=[], plg=[], lcs=[]; const span=[D('2025-08-01'),D('2029-07-31')];
  const pl=ACTIVITIES.list.find(a=>a.id==='public_law_group'), lc=ACTIVITIES.list.find(a=>a.id==='lawclub_study'), lcNoSkip=Object.assign({},lc,{skip:null});
  for(let d=span[0];d<=span[1];d++){ const t=CALENDAR.termOf(d); if(!t||!LAW.includes(t.id)) continue; G.day=d;
    if(STORY.fafuDuty(G)) fafu.push(t.id); if(ACTIVITIES.on(pl,d,G)) plg.push(t.id); if(ACTIVITIES.on(lcNoSkip,d,G)) lcs.push(t.id); }
  const by=a=>a.reduce((o,k)=>(o[k]=(o[k]||0)+1,o),{});
  console.log('1a 法服週六（fafuDuty）法律系四年：',fafu.length,J(by(fafu)));
  console.log('1b 公法讀書會（public_law_group）場次：',plg.length,J(by(plg)));
  console.log('1c 法服讀書會（lawclub_study，現在 skip:()=>true＝不辦；拿掉 skip 的話）：',lcs.length,J(by(lcs)),'現在 on()：',ACTIVITIES.on(lc,D('2025-10-08'),G));
}

/* ---------- 2. 寒暑假活動 ---------- */
{ const ids=['C02','C08','C09','C10','C11','C12','C16']; const I=VAC.all().filter(x=>ids.includes(x.id));
  for(const x of I) console.log('2a',x.key,key(x.from)+'～'+key(x.to),'place',x.A.place.kind,'trip',!!x.A.trip,'slot',x.A.slot,'work',!!x.A.work);
  /* 撞期：照 VAC.conflicts 的規則（同一天＋任一方不在臺北／有 trip／同 slot）*/
  const G=H.fresh('2026-05-01',9,'dorm'); const out=[];
  for(const a of I) for(const b of I){ if(a.key>=b.key) continue; const ad=new Set(VAC.daysOf(a)); const away=a.A.trip||a.A.place.kind!=='taipei', awayB=b.A.trip||b.A.place.kind!=='taipei';
    const hit=VAC.daysOf(b).filter(d=>ad.has(d)&&(away||awayB||a.A.slot===b.A.slot)); if(hit.length) out.push(a.key+'×'+b.key+'('+hit.map(key).join(',')+')'); }
  console.log('2b 撞期（VAC.conflicts 規則；報名不擋、只寫「會撞到」）：',out.join('  '));
  /* C16 最後一個上班日（done 的那一天）*/
  for(const x of I.filter(x=>x.id==='C16')){ const w=VAC.workDays(x); console.log('2c',x.key,'最後上班日',key(w[w.length-1]),'上班日數',w.length); }
  for(const r of ['JP','US']){ const g=H.fresh('2027-09-01',9,'dorm',{EXCHANGE_ROUTE:r}); console.log('2d 路線',r,'擋掉：',I.filter(x=>VAC.blocked(g,x)).map(x=>x.key).join(' ')); }
}

/* ---------- 3. 代表情境 ---------- */
const L=G=>STORY.careerLean(G);
(async()=>{
  { const G=H.fresh('2027-03-01',10,'dorm'); G.stats.study=0; check('S0 空存檔：A0 B0 C0 → B',J(L(G))===J({A:0,B:0,C:0,top:'B'}),J(L(G))); }

  { const G=H.fresh('2027-09-01',10,'dorm',{LAWCLUB_SAT_VISITS:7,YT_LEASE_HELP:true}); VAC.rec(G).reg={'C16@Y2':'done','C09@Y1':'done','C02@Y1':'done','C02@Y2':'yes','C09@Y2':'missed','C16@Y3':'rejected'};
    const c=L(G); check('S1 A＝7＋5（C16）＋5（C09）＋3（C02）＋3（租約）＝23；yes／missed／rejected 不算',c.A===23&&c.top==='A',J(c)); }

  { const G=H.fresh('2027-09-01',10,'dorm',{STUDY_AT_LAW:20,grad_read_done:true}); G.stats.study=125; const A=ACTIVITIES.rec(G).att;
    A['public_law_group@100']={h:20,end:'full'}; A['public_law_group@107']={h:20}; A['public_law_group@114']={h:20,end:'left',lh:20.6}; A['public_law_group@121']={h:20,end:'in'}; A['lawclub_study@30']={h:19,end:'full'}; A['B4@50']={h:14,end:'full'};
    SOCIAL.remember('heroine_05','GRAD_SCHOOL_DISCUSSION',''); SOCIAL.remember('heroine_05','GRAD_SCHOOL_DISCUSSION','第二次'); SOCIAL.remember('prof_xu','GRAD_SCHOOL_DISCUSSION','');
    VAC.rec(G).reg={'C10@Y2':'done'};
    const c=L(G); /* grp：full 2（舊 {h} 算 full）＋lawclub 1＝3；study floor(105/10)＝10；GSD 2 人×2＝4；文章 2；C10 4 → 23 */
    check('S2 B＝讀書會 3（left／in 不算、B4 不算）＋自習 10＋研究所 2 人 4＋文章 2＋C10 4＝23；同一人兩條 GSD 只算一次',c.B===23,J(c)); }

  { const G=H.fresh('2028-08-05',10,'dorm',{EXCHANGE_ROUTE:'JP'}); SOCIAL.remember('heroine_04','PLAYTESTED',''); SOCIAL.remember('heroine_04','CONTEST_DAY','');
    VAC.rec(G).reg={'C08@Y1':'done','C11@Y2':'done','C12@Y3':'done'}; const c0=L(G);
    G.day=D('2028-08-04'); const c1=L(G);
    check('S3 C＝子晴 4＋（C08＋C11＋C12）9＋JP 返台當天起 6＝19；前一天 13',c0.C===19&&c1.C===13,J({c0,c1})); }

  /* 通識：成績單字串一律 truthy */
  { const G=H.fresh('2027-09-01',10,'dorm'); const R=CLS.rec(G);
    R.grades={Y0S1:{ge_y0s1:'及格',chinese_y0:'及格'},Y1S1:{ge_film_y1s1:'及格',chinese_y1:'不及格（下學期重修）',english_y1:'及格',pe_y1s1:'及格',civil_intro:'80 分'},Y1S2:{chinese_y1:'及格',ge_y1s2:'缺考'}};
    const c=L(G);
    check('S4 疑點重現：Y0 不算；Y1S1 四門（含不及格的國文）＋Y1S2 重修國文＋缺考的通識＝C 6（基準表「及格的通識每門 1」應是 4）',c.C===6,J(c)); }

  /* 平手 */
  { const G=H.fresh('2028-12-01',10,'dorm',{LAWCLUB_SAT_VISITS:5}); VAC.rec(G).reg={'C08@Y2':'done'}; G.stats.study=20; G.flags.STUDY_AT_LAW=0;
    SOCIAL.remember('heroine_04','PLAYTESTED','');   /* A5 B2 C5 */
    const t0=L(G).top; G.flags.CAREER_Y4_BASE={A:5,B:0,C:0}; const t1=L(G).top; G.flags.CAREER_Y4_BASE={A:1,B:0,C:1}; const t2=L(G).top;
    check('S5 平手：A5＝C5 → 沒有 Y4 基準＝B→A→C 順序取 A；Y4 基準 A5＝大四 C 多 → C；兩邊大四一樣多 → A',t0==='A'&&t1==='C'&&t2==='A',J({t0,t1,t2,c:L(G)})); }

  /* careerTick 起點 */
  { const G=H.fresh('2025-09-10',10,'dorm'); G.stage='econ'; G.stats.study=33; delete G.flags.STUDY_AT_LAW; STORY.careerTick(G); const e=G.flags.STUDY_AT_LAW;
    G.stage='law'; STORY.careerTick(G); check('S6 careerTick：舊序章系所不記；第一次法律系記 STUDY_AT_LAW＝當下 33',e===undefined&&G.flags.STUDY_AT_LAW===33,J({e,s:G.flags.STUDY_AT_LAW}));
    const w1=CALENDAR.termDays('Y4S1').from; const g2=H.fresh(key(w1),10,'dorm',{STUDY_AT_LAW:0,LAWCLUB_SAT_VISITS:9}); STORY.careerTick(g2); const b=g2.flags.CAREER_Y4_BASE;
    g2.flags.LAWCLUB_SAT_VISITS=12; STORY.careerTick(g2);
    check('S7 CAREER_Y4_BASE：大四上第 1 週記一次（之後不覆寫）',J(b)===J({A:9,B:0,C:0})&&J(g2.flags.CAREER_Y4_BASE)===J(b),J({b,now:g2.flags.CAREER_Y4_BASE,term:CALENDAR.termOf(w1)})); }

  /* 讀它的地方（靜態）*/
  { const fs=require('fs'), path=require('path'); const hits=[];
    const walk=d=>{ for(const f of fs.readdirSync(d)){ const p=path.join(d,f); if(fs.statSync(p).isDirectory()) walk(p); else if(/\.js$/.test(f)){ fs.readFileSync(p,'utf8').split('\n').forEach((l,i)=>{ if(/careerLean\(|S\.lean\(|pathTop\(|S\.path\(|zqLine\(/.test(l)) hits.push(path.relative(WT,p)+':'+(i+1)); }); } } };
    walk(path.join(WT,'src')); console.log('R 讀取點（careerLean／S.lean／pathTop／S.path／zqLine 呼叫）：\n  '+hits.join('\n  ')); }
  H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
