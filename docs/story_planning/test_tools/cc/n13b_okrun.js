// CC 任務 #13：以安改稿第一批（AA_576）接進遊戲後的核對——不需要瀏覽器，只用 Node。
// 用法：
//   node n13_an_rewrite.js <ROOT> [SPEC_MD] [--seeds N] [--days D]
//     ROOT    ：有 src/、tests/ 的資料夾（例：git -C <repo> archive <sha> src tests | tar -x -C <ROOT>）。
//               會 require <ROOT>/tests/pg_harness.js 載入遊戲資料與系統。
//     SPEC_MD ：AA_576 的 markdown（例：git show origin/claude/story-planning:docs/story_planning/AA_576_...md > aa576.md）；
//               不給就只印 src 實際句子、不比對。
//     --seeds ：② 邀約模擬每種情境跑幾個種子（預設 20）；--days：模擬幾天（預設 30）。
// 輸出：① 38 列逐句比對 ② 「好。」連續最長與比例、回覆池 ③ 禁用詞次數 ④ 空句／undefined 掃描。結尾印 SUMMARY JSON。
// 只讀檔案，不改任何東西。
const path=require('path'), fs=require('fs');
const argv=process.argv.slice(2); const ROOT=path.resolve(argv[0]||'.');
const SPEC=argv[1]&&!argv[1].startsWith('--')?argv[1]:null;
const opt=(k,d)=>{ const i=argv.indexOf(k); return i>=0?+argv[i+1]:d; };
const SEEDS=opt('--seeds',20), DAYS=opt('--days',30);
// 固定亂數（遊戲裡用到 Math.random 的地方也跟著固定）
let _s=1; const rnd=()=>{ _s|=0; _s=_s+0x6D2B79F5|0; let t=Math.imul(_s^_s>>>15,1|_s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };
Math.random=rnd;
const H=require(path.join(ROOT,'tests/pg_harness.js'));
const vm=require('vm');
const loadG=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (INVITE_REPLIES|MSG2_POOL|MSG_POOL|EAT_LINES)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/invite_replies.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/data/eat_lines.js']) if(typeof globalThis[{'src/data/invite_replies.js':'INVITE_REPLIES','src/data/msg_pool.js':'MSG_POOL','src/data/msg2_pool.js':'MSG2_POOL','src/data/eat_lines.js':'EAT_LINES'}[f]]==='undefined') loadG(f);
const J=JSON.stringify, ID='heroine_01';
const FILES={msg_pool:'src/data/msg_pool.js',msg2_pool:'src/data/msg2_pool.js',invite_replies:'src/data/invite_replies.js',invites:'src/data/invites.js',rel_lines:'src/data/rel_lines.js',eat_lines:'src/data/eat_lines.js'};
const TXT={}; for(const k in FILES) TXT[k]=fs.readFileSync(path.join(ROOT,FILES[k]),'utf8').split('\n');
const lineOf=(k,s)=>{ if(!s) return []; const out=[]; TXT[k].forEach((l,i)=>{ if(l.includes(s)) out.push(i+1); }); return out; };

/* ================= ① 逐句核對 ================= */
const MP=MSG_POOL.people?MSG_POOL.people[ID]:MSG_POOL[ID];
const MR=(MP&&MP.replies)||[];
const M2=(MSG2_POOL.people||MSG2_POOL)[ID]; const M2R=(M2&&(M2.replies||M2.rows))||[];
const IR=INVITE_REPLIES.people[ID]; const an=n=>IR.find(r=>r.id==='an'+n)||{lines:[]};
const RL=REL_LINES[ID]; const ET=EAT_LINES.together[ID];
const IP=INVITE_DATA.people[ID];
const s=v=>v==null?String(v):(typeof v==='string'?v:(v.me!=null?'{me:'+v.me+'}':J(v)));
const joinL=a=>(a||[]).map(s).join('／');
// 每一列：在 src 裡實際取出的句子（檔案 key、取法說明、實際字串）
const ACT={
 1:['msg_pool','chat R 傍晚、晚上',()=>joinL((MR.find(r=>r.topic==='chat'&&r.tier==='R'&&(r.tags||[]).includes('傍晚、晚上'))||{}).msgs)],
 2:['msg_pool','chat L 回問「在想妳」r',()=>{ for(const r of MR){ const o=r.ask&&r.ask.opts&&r.ask.opts.find(o=>o.t==='在想妳'); if(o) return joinL(o.r); } }],
 3:['msg_pool','share_food R（L 同 R）',()=>{ const R=MR.find(r=>r.topic==='share_food'&&r.tier==='R'&&!r.ask), L=MR.find(r=>r.topic==='share_food'&&r.tier==='L'&&!r.ask); return joinL(R&&R.msgs)+(L&&joinL(L.msgs)!==joinL(R&&R.msgs)?' ≠L '+joinL(L.msgs):''); }],
 4:['msg2_pool','thanks L',()=>joinL((M2R.find(r=>r.topic==='thanks'&&r.tier==='L'&&!r.cond)||{}).msgs)],
 5:['invite_replies','an1',()=>joinL(an(1).lines)],6:['invite_replies','an3',()=>joinL(an(3).lines)],7:['invite_replies','an5',()=>joinL(an(5).lines)],
 8:['invite_replies','an6',()=>joinL(an(6).lines)],9:['invite_replies','an7',()=>joinL(an(7).lines)],10:['invite_replies','an8',()=>joinL(an(8).lines)],
 11:['invite_replies','an10 第 1 則（遊戲照 invites.js rule 說）',()=>s(an(10).lines[0])],12:['invite_replies','an10 第 2 則',()=>s(an(10).lines[1])],
 13:['invite_replies','an11',()=>joinL(an(11).lines)],14:['invite_replies','an14',()=>joinL(an(14).lines)],15:['invite_replies','an15',()=>joinL(an(15).lines)],
 16:['invite_replies','an16',()=>joinL(an(16).lines)],17:['invite_replies','an18 第 2 則',()=>s(an(18).lines[1])],18:['invite_replies','an19',()=>joinL(an(19).lines)],
 19:['invite_replies','an24 全部（旁白應已刪）',()=>joinL(an(24).lines)],20:['invite_replies','an27',()=>joinL(an(27).lines)],21:['invite_replies','an28',()=>joinL(an(28).lines)],
 22:['invite_replies','an30',()=>joinL(an(30).lines)],23:['invite_replies','an34',()=>joinL(an(34).lines)],24:['invite_replies','an35',()=>joinL(an(35).lines)],
 25:['rel_lines','up.FAMILIAR l[0]',()=>s(RL.up.FAMILIAR.l[0])],26:['rel_lines','up.FAMILIAR l[1]',()=>s(RL.up.FAMILIAR.l[1])],
 27:['rel_lines','up.FRIEND l[0]',()=>s(RL.up.FRIEND.l[0])],28:['rel_lines','up.FRIEND l[1]',()=>s(RL.up.FRIEND.l[1])],
 29:['rel_lines','up.CLOSE_FRIEND（PUBLIC_LAW_GROUP）l[0]',()=>s(RL.up.CLOSE_FRIEND[0].l[0])],30:['rel_lines','up.CLOSE_FRIEND（沒有讀書會）l[0]',()=>s(RL.up.CLOSE_FRIEND[1].l[0])],
 31:['rel_lines','bye.base[0]',()=>s(RL.bye.base[0])],32:['rel_lines','meet.cafe.A',()=>s(RL.meet.cafe.A)],33:['rel_lines','meet.cafe.F',()=>s(RL.meet.cafe.F)],
 34:['rel_lines','meet.cafe.R',()=>s(RL.meet.cafe.R)],35:['rel_lines','meet.wenzhou.R',()=>s(RL.meet.wenzhou.R)],
 36:['eat_lines','together.ACQ[0]',()=>s(ET.ACQ[0][1])],37:['eat_lines','together.ACQ[1]',()=>s(ET.ACQ[1][1])],38:['eat_lines','together.FAM[1]',()=>s(ET.FAM[1][1])]};
// 刪除列／指定版本：期望值另外寫
const OVERRIDE={19:{want:'「好。」',why:'（刪）＝an24 只剩「好。」'},25:{want:'（她坐到你旁邊。）',why:'第 26 列新版：旁白改成「（她坐到你旁邊。）」'},26:{want:'「早。」',why:'使用者 11-02 改選'},30:{want:'「下次考試前一起讀吧。我先跟你約好。」',why:'BB 小修'}};
let rows=[];
if(SPEC){ const md=fs.readFileSync(SPEC,'utf8');
  for(const ln of md.split('\n')){ const m=/^\| (\d+) \| ([^|]*) \| ([^|]*) \| ([^|]*) \| ([^|]*) \|/.exec(ln); if(!m) continue; const n=+m[1]; if(n<1||n>38) continue;
    rows.push({n,pos:m[2].trim(),who:m[3].trim(),orig:m[4].trim(),to:m[5].trim()}); } }
else rows=Object.keys(ACT).map(n=>({n:+n,pos:'',who:'',orig:'',to:''}));
const R1=[];
for(const r of rows){ const [fk,how,get]=ACT[r.n]; let act; try{ act=get(); }catch(e){ act='ERR '+e.message; }
  const want=OVERRIDE[r.n]?OVERRIDE[r.n].want:r.to; const ok=act===want;
  const lns=lineOf(fk,String(act).split('／')[0].replace(/^「|」$/g,'').slice(0,18));
  const origLeft=r.orig&&r.orig!=='（刪）'?r.orig.split('／').filter(p=>p.length>3&&TXT[fk].some(l=>l.includes(p.replace(/^「|」$/g,'')))):[];
  R1.push({n:r.n,orig:r.orig,to:r.to,want,act,file:FILES[fk],how,lines:lns.slice(0,4),ok,origLeft,note:OVERRIDE[r.n]?OVERRIDE[r.n].why:''}); }
// 連動（invites.js）
const ruleOut=(year,first)=>{ try{ const o=IP.rule(H.G||{flags:{}},{pid:'wenzhou',P:{kind:'walk'},r:{res:'accept'},year,first,wd:1,h:15},{nextFree:()=>({day:1,h:10})}); return o?{res:o.res||'accept',lines:joinL(o.lines),hasMe:(o.lines||[]).some(x=>x&&x.me)}:null; }catch(e){ return 'ERR '+e.message; } };
const LINK=[
 {k:'連1 acc.cafe.A',act:joinL(IP.acc.cafe.A),want:'「好啊。我本來就想去。」'},
 {k:'連2 acc.noodle.A',act:joinL(IP.acc.noodle.A),want:'「好。」'},
 {k:'連3 rule 大一第一次散步',act:J(ruleOut(1,true)),want:J({res:'resched',lines:'「好。」／「……今天不行，明天。」',hasMe:false})},
 {k:'連3b rule 大一第二次以後',act:J(ruleOut(1,false)),want:J({res:'accept',lines:'「好。」',hasMe:false})},
 {k:'連4 rule 大二起',act:J(ruleOut(2,false)),want:J({res:'accept',lines:'「好。」',hasMe:false})}];
LINK.forEach(x=>x.ok=x.act===x.want);
console.log('=== ① 逐句核對 ===');
for(const x of R1) console.log((x.ok?'OK  ':'DIFF')+' #'+x.n+' '+x.file+':'+x.lines.join(',')+' ['+x.how+'] 實際='+x.act+(x.ok?'':' 期望='+x.want)+(x.origLeft.length?' ※原句仍在檔內:'+x.origLeft.join('／'):''));
for(const x of LINK) console.log((x.ok?'OK  ':'DIFF')+' '+x.k+' 實際='+x.act+(x.ok?'':' 期望='+x.want));

/* ================= ② 「好。」重複：模擬一個月的邀約 ================= */
const REL={1:{fam:10},2:{fam:25},3:{fam:45,trust:30},4:{fam:65,trust:50,comf:45},5:{fam:45,trust:30,npcRom:30},6:{fam:65,trust:50,comf:45,npcRom:55,rom:30}};
const setSt=st=>{ const r=SOCIAL.rel(ID); Object.assign(r,{fam:0,trust:0,comf:0,npcRom:0,rom:0},REL[st===7?4:st]); SOCIAL.remember(ID,'FIRST_MET','');
  if(st===7) H.G.flags['dating_'+ID]=true; else delete H.G.flags['dating_'+ID]; };
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const PLACES=INVITE_DATA.places.map(p=>p.id);
const HOURS=[8,9.5,10,12,12.5,13,14,15.5,16,17,18,18.5,19,19.5,20,21];
const OK_ONLY='「好。」';
const shown=r=>{ if(r.lines&&r.lines.length) return r.lines.map(s).join(''); return '［旁白］'+INV.reply(H.G,ID,r.pid||'',r); };
const SCEN=[];
for(const st of [1,2,3,4,5,6,7]) SCEN.push({name:'固定第 '+(st===7?'交往中':st+' 階'),st:()=>st,key:'2025-10-06'});
for(const st of [3]) SCEN.push({name:'固定第 3 階（大二）',st:()=>st,key:'2026-10-05'});
SCEN.push({name:'一個月由第 1 階升到第 4 階',st:d=>1+Math.min(3,Math.floor(d/8)),key:'2025-10-06'});
const CORE=['cafe','library','noodle','wenzhou'], CH=[15.5,16,18.5,19];
for(const st of [1,2,4,6]) SCEN.push({name:'常約（Café／總圖／麵店／溫州街，下午或傍晚）第 '+st+' 階',st:()=>st,key:'2025-10-06',pl:CORE,hrs:CH});
SCEN.push({name:'常約，一個月由第 1 階升到第 4 階',st:d=>1+Math.min(3,Math.floor(d/8)),key:'2025-10-06',pl:CORE,hrs:CH});
const R2=[]; const pool={}; const empties=[];
for(const sc of SCEN){ let agg={inv:0,acc:0,okOnly:0,okOnlyAcc:0,maxRun:0,maxRunAcc:0,runs:[],ex:[]};
  for(let seed=1;seed<=SEEDS;seed++){ _s=seed*7919+sc.name.length;
    H.fresh(sc.key,9,'campus'); const day0=H.G.day; let run=0, runA=0, maxR=0, maxRA=0, cur=[], curAll=[];
    for(let d=0; d<DAYS; d++){ const day=day0+d; H.G.day=day; H.G.weekday=wdOf(day); H.G.weather=rnd()<0.2?'rain':'clear';
      setSt(sc.st(d));
      const nInv=rnd()<0.25?2:1;
      for(let k=0;k<nInv;k++){ const PL=sc.pl||PLACES, HR=sc.hrs||HOURS; const pid=PL[Math.floor(rnd()*PL.length)], h=HR[Math.floor(rnd()*HR.length)]; H.G.hour=h;
        let r; try{ const dcs=INV.decide(H.G,ID,pid,day,h); r=INV.personal(H.G,ID,INV.place(pid),day,h,dcs); r.pid=pid; }catch(e){ r={res:'ERR',lines:['ERR '+e.message]}; }
        const t=shown(r); agg.inv++; (pool[r.res]||(pool[r.res]={}))[t]=((pool[r.res]||{})[t]||0)+1;
        if(r.lines) for(const x of r.lines){ const v=typeof x==='string'?x:(x&&x.me); if(v==null||v===''||/undefined|null|^「」$|^（）$/.test(String(v))) empties.push({sc:sc.name,pid,res:r.res,v:J(x)}); }
        const isOk=t===OK_ONLY; const tag='d'+d+' st'+sc.st(d)+' '+pid+'@'+h+(r.res==='accept'?'':'('+r.res+')'); if(isOk&&sc.st(d)>=3&&pid!=='wenzhou'){ (agg.oddOk||(agg.oddOk=[])).push(tag+' '+JSON.stringify(Object.assign({},r,{lines:undefined}))+' t='+JSON.stringify(((H.G.invReply||{})[ID]||{}).t)); } if(isOk){ agg.okOnly++; run++; curAll.push(tag); } else { run=0; curAll=[]; } if(run>maxR){ maxR=run; } if(run>=3){ (agg.long3||(agg.long3=[])).push('seed'+seed+': '+curAll.join(' → ')); } if(run>maxR-1&&run>(agg.exAllN||0)){ agg.exAllN=run; agg.exAll=curAll.slice(); }
        if(r.res==='accept'||r.res==='resched'&&r.lines&&r.lines[0]===OK_ONLY){ agg.acc++; if(isOk){ agg.okOnlyAcc++; runA++; cur.push('d'+d+' '+pid+'@'+h+(r.res==='accept'?'':'('+r.res+')')); } else { runA=0; cur=[]; } if(runA>maxRA){ maxRA=runA; if(runA>agg.ex.length) agg.ex=cur.slice(); } }
        // 改天且有時間：玩家接受改天的時間（記成那一天去過；這樣「第一次」才會過去，例：大一第一次散步）
        if(r.res==='resched'&&r.alt&&r.alt.day!=null){ INV.rec(H.G); H.G.invSeq=(H.G.invSeq|0)+1; H.G.invites.push({id:'iv'+H.G.invSeq,who:ID,place:r.alt.place||pid,zone:INV.place(r.alt.place||pid).zone,day:r.alt.day,h:r.alt.h,state:'done',accepted:true,by:'player'}); }
        if(r.res==='accept'){ INV.rec(H.G); H.G.invSeq=(H.G.invSeq|0)+1; H.G.invites.push({id:'iv'+H.G.invSeq,who:ID,place:pid,zone:INV.place(pid).zone,day,h,state:'done',accepted:true,by:'player'}); }
      } }
    agg.maxRun=Math.max(agg.maxRun,maxR); agg.maxRunAcc=Math.max(agg.maxRunAcc,maxRA); agg.runs.push(maxRA); }
  agg.runs.sort((a,b)=>a-b); const med=agg.runs[Math.floor(agg.runs.length/2)];
  R2.push({oddOk:(agg.oddOk||[]).slice(0,6),long3:[...new Set((agg.long3||[]))].filter((x,i,a)=>!a.some(y=>y!==x&&y.startsWith(x))).slice(0,12),exAll:(agg.exAll||[]).join(' → '),sc:sc.name,inv:agg.inv,acc:agg.acc,okOnly:agg.okOnly,ratioAll:+(agg.okOnly/agg.inv).toFixed(3),ratioAcc:+(agg.okOnlyAcc/Math.max(1,agg.acc)).toFixed(3),maxRun:agg.maxRun,maxRunAcc:agg.maxRunAcc,medRunAcc:med,longest:agg.ex.join(' → ')}); }
console.log('\n=== ② 「好。」：每情境 '+SEEDS+' 種子 × '+DAYS+' 天（每天 1～2 次邀約，地點、時間隨機）===');
for(const x of R2) console.log(J(x));
console.log('-- 模擬中實際出現的回覆（res：句子 × 次數，前 40）--');
for(const res in pool){ const L=Object.entries(pool[res]).sort((a,b)=>b[1]-a[1]); console.log('['+res+'] '+L.length+' 種'); L.slice(0,40).forEach(([t,c])=>console.log('   '+c+'\t'+t)); }
// 表上以安的答應句池（照階段）
console.log('-- invite_replies 以安答應句（off 除外）照階段 --');
const ACCPOOL={}; for(let st=1;st<=7;st++){ const L=IR.filter(r=>r.k==='acc'&&!r.off&&st>=r.st[0]&&st<=r.st[1]); ACCPOOL[st]=L.map(r=>r.id+(r.tags.length?'['+r.tags.join(',')+']':'')+'='+r.lines.map(s).join('')); console.log(' 第'+st+'階 '+L.length+' 句，「好。」 '+L.filter(r=>J(r.lines)===J([OK_ONLY])).length+' 句：'+ACCPOOL[st].join('｜')); }

/* ================= ③ 禁用詞 ================= */
// 「台詞」＝遊戲會拿去 say／顯示的字串（以安的資料欄位：msgs、ask.q、ask.opts[].r、wakeLine、lines、walk/acc/here/plan/rule 的字串、up/bye/meet、together）。
// 不算：說明欄（*Text、notes、src、say、off、copyNote、rowLabel）、註解。rule 是函式：取函式原始碼裡的字串常值（去掉 /*…*/ 註解）。
const BAN=['手帳','跑步','理由','條件：'];
const lines3=[];  // {file, where, text, displayed}
const walk=(fk,where,v)=>{ if(v==null) return; if(typeof v==='string'){ lines3.push({fk,where,text:v}); return; } if(typeof v==='function'){ const src=String(v).replace(/\/\*[\s\S]*?\*\//g,''); const re=/'((?:[^'\\]|\\.)*)'/g; let m; while((m=re.exec(src))) if(/[「（]/.test(m[1])) lines3.push({fk,where:where+'(函式字串)',text:m[1]}); return; }
  if(Array.isArray(v)){ v.forEach((x,i)=>walk(fk,where+'['+i+']',x)); return; } if(typeof v==='object'){ if(v.me!=null){ walk(fk,where+'.me',v.me); return; } for(const k in v){ if(['if'].includes(k)) continue; walk(fk,where+'.'+k,v[k]); } } };
for(const r of MR){ walk('msg_pool','replies.'+r.topic+'.'+r.tier,r.msgs); if(r.ask){ if(r.ask.q) walk('msg_pool','ask.q',r.ask.q); (r.ask.opts||[]).forEach(o=>walk('msg_pool','ask.r('+o.t+')',o.r)); } }
if(MP&&MP.rules) walk('msg_pool','rules.wakeLine',MP.rules.wakeLine);
for(const k in MP) if(!['replies','rules','name'].includes(k)&&MP[k]&&typeof MP[k]==='object') walk('msg_pool',k,MP[k]);
for(const r of M2R){ walk('msg2_pool','rows.'+r.topic+'.'+r.tier,r.msgs); if(r.ask){ if(r.ask.q) walk('msg2_pool','ask.q',r.ask.q); (r.ask.opts||[]).forEach(o=>walk('msg2_pool','ask.r',o.r)); } }
for(const k in M2) if(!['replies','rows','name','birthday','birthdayText','style','conds'].includes(k)&&M2[k]&&typeof M2[k]==='object') walk('msg2_pool',k,M2[k]);
for(const r of IR) walk('invite_replies',r.id+(r.off?'(off)':''),r.lines);
for(const k of ['walk','acc','first','here','plan','rule','reply']) if(IP[k]) walk('invites','people.heroine_01.'+k,IP[k]);
for(const k of ['up','bye','meet']) if(RL[k]) walk('rel_lines',k,RL[k]);
walk('eat_lines','together',ET);
const R3={}; for(const w of BAN){ R3[w]={}; for(const fk in FILES){ const hits=lines3.filter(x=>x.fk===fk&&x.text.includes(w)); const raw=TXT[fk].filter(l=>l.includes(w)).length; R3[w][fk]={dialog:hits.length,raw,hits:hits.map(x=>x.where+'：'+x.text)}; } }
console.log('\n=== ③ 禁用詞（以安台詞；raw＝整個檔案逐行 grep，含註解、說明欄、其他角色）===  台詞字串共 '+lines3.length+' 筆');
for(const w of BAN){ console.log(w+'：'+Object.entries(R3[w]).map(([k,v])=>k+' 台詞'+v.dialog+'／raw'+v.raw).join('，')); for(const k in R3[w]) R3[w][k].hits.forEach(h=>console.log('    '+k+' '+h)); }

/* ================= ④ 空句／undefined ================= */
const bad=lines3.filter(x=>!x.text||/undefined|null|NaN|^「」$|^（）$|^\s+$/.test(x.text));
const irBad=IR.filter(r=>!r.lines||!r.lines.length||r.lines.some(x=>x==null||(typeof x==='string'&&!x.trim())));
const notes=IR.filter(r=>r.lines.some(x=>typeof x==='string'&&/AA_\d|第 \d+ 列|刪/.test(x))).map(r=>r.id+(r.off?'(off，不播)':'(會播!)')+'：'+r.lines.filter(x=>typeof x==='string'&&/AA_\d|第 \d+ 列|刪/.test(x)).join(''));
const typ=[]; const chk=(nm,v)=>{ if(v==null||v==='') typ.push(nm+'='+J(v)); };
R1.forEach(x=>chk('#'+x.n,x.act==='undefined'?undefined:x.act));
console.log('\n=== ④ 空句／undefined ===');
console.log('台詞字串中空的／含 undefined：'+bad.length+(bad.length?' '+J(bad):''));
console.log('invite_replies 以安 lines 空：'+irBad.length);
console.log('#1～38 取出值空：'+typ.length+(typ.length?' '+typ.join(','):''));
console.log('模擬播出的句子空／undefined：'+empties.length+(empties.length?' '+J(empties.slice(0,5)):''));
console.log('lines 裡夾帶企劃說明文字：'+(notes.join('；')||'0'));
const SUMMARY={diff:R1.filter(x=>!x.ok).map(x=>x.n),linkDiff:LINK.filter(x=>!x.ok).map(x=>x.k),okRun:R2.map(x=>[x.sc,x.maxRunAcc,x.ratioAcc]),ban:Object.fromEntries(BAN.map(w=>[w,Object.values(R3[w]).reduce((a,v)=>a+v.dialog,0)])),empty:bad.length+irBad.length+typ.length+empties.length,notes};
console.log('\nSUMMARY '+J(SUMMARY));
