// CC 任務 #17：學姊改稿第一批（AA_579）＋以安改稿第二批（AA_580）接進遊戲後的核對——不需要瀏覽器，只用 Node。
// 用法：
//   node n17_aa579_580.js <ROOT> <AA_579.md> <AA_580.md> [--seeds N]
//     ROOT   ：有 src/、tests/ 的資料夾（例：git -C <repo> archive <sha> src tests | tar -x -C <ROOT>）。
//              會 require <ROOT>/tests/pg_harness.js 載入遊戲資料與系統；另外載入 invite_replies／msg_pool／msg2_pool／eat_lines。
//     AA_579 ：git show origin/claude/story-planning:docs/story_planning/AA_579_學姊改稿_第一批_手機與邀約.md > aa579.md
//     AA_580 ：git show origin/claude/story-planning:docs/story_planning/AA_580_以安改稿_第二批_閒聊階梯與邀約.md > aa580.md
//     --seeds：③ 邀約模擬每種組合跑幾個種子（預設 6）。
// 做法：從「載入後的資料結構」取出每一個字串（含 rule 等函式裡的字串常值，去掉註解），記下路徑與誰說的；
//   台詞＝會播出的欄位。不算：說明欄（src、note(s)、say、off、cond、tags、rowLabel、*Text、conds、bdayInfo…）、條件欄、註解。
// 輸出：① 逐列比對（AA_579 57 列＋連1～6、AA_580 59 列＋新1～3）② 禁用詞 ③ 空句／undefined（資料＋模擬）。結尾印 SUMMARY JSON。
// 只讀檔案，不改任何東西。
const path=require('path'), fs=require('fs'), vm=require('vm');
const argv=process.argv.slice(2); const ROOT=path.resolve(argv[0]||'.');
const MD579=argv[1], MD580=argv[2];
const opt=(k,d)=>{ const i=argv.indexOf(k); return i>=0?+argv[i+1]:d; };
const SEEDS=opt('--seeds',6);
let _s=1; const rnd=()=>{ _s|=0; _s=_s+0x6D2B79F5|0; let t=Math.imul(_s^_s>>>15,1|_s); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };
Math.random=rnd;
const H=require(path.join(ROOT,'tests/pg_harness.js'));
const loadG=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (INVITE_REPLIES|MSG2_POOL|MSG_POOL|EAT_LINES)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
for(const [f,n] of [['src/data/invite_replies.js','INVITE_REPLIES'],['src/data/msg_pool.js','MSG_POOL'],['src/data/msg2_pool.js','MSG2_POOL'],['src/data/eat_lines.js','EAT_LINES']]) if(typeof globalThis[n]==='undefined') loadG(f);
const J=JSON.stringify;
const FILES={msg_pool:'src/data/msg_pool.js',msg2_pool:'src/data/msg2_pool.js',invite_replies:'src/data/invite_replies.js',invites:'src/data/invites.js',rel_lines:'src/data/rel_lines.js',eat_lines:'src/data/eat_lines.js',ladder:'src/data/ladder.js'};
const TXT={}; for(const k in FILES) TXT[k]=fs.readFileSync(path.join(ROOT,FILES[k]),'utf8').split('\n');
const lineOf=(fk,s)=>{ const out=[]; if(!s) return out; TXT[fk].forEach((l,i)=>{ if(l.includes(s)) out.push(i+1); }); return out; };
const rawCount=(fk,s)=>{ let c=0; for(const l of TXT[fk]){ let i=-1; while((i=l.indexOf(s,i+1))>=0) c++; } return c; };

/* ================= 字串索引 ================= */
const SKIP=new Set(['src','note','notes','say','off','cond','tags','tag','if','unless','skipIf','flagIs','flags','mem','memory','events','rel','location','time','weekday','week','weather','stage','npc','min','id','one','where','k','n','st','ex','band','variant','version','topic','tier','goto','need','knownFlag','key','style','tierLabels','bdayInfo','conds','name','birthday','rowLabel','copyNote','dayMin','EXCHANGE_ROUTE','fam','trust','comf','years','zone','kind']);
const LEAVES=[];
const isId=s=>/^[A-Za-z0-9_\-.:]+$/.test(s);
function fnStrings(f){ const src=String(f).replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/[^\n]*/g,''); const out=[]; const re=/'((?:[^'\\]|\\.)*)'/g; let m; while((m=re.exec(src))) if(/[㐀-鿿「（]/.test(m[1])) out.push(m[1]); return out; }
function walk(fk,who,p,v,ctx){
  if(v==null) return;
  if(typeof v==='string'){ if(isId(v)&&v.length<40) return; LEAVES.push({fk,who,path:p,v,ctx:ctx||''}); return; }
  if(typeof v==='function'){ fnStrings(v).forEach((s,i)=>LEAVES.push({fk,who,path:p+'(函式字串#'+i+')',v:s,ctx:'fn'})); return; }
  if(Array.isArray(v)){
    // eat_lines 的 [說話者, 句子]
    if(v.length===2&&(v[0]===null||typeof v[0]==='string'&&isId(v[0]))&&typeof v[1]==='string'){ walk(fk,v[0]==='me'?'祐廷':v[0]===null?'旁白':who,p+'[1]',v[1],ctx); return; }
    v.forEach((x,i)=>{ let tag=''; if(x&&typeof x==='object'&&!Array.isArray(x)){ if(x.id) tag='{'+x.id+'}'; else if(x.topic) tag='{'+x.topic+'/'+x.tier+(x.cond?'/'+x.cond:'')+(x.tags&&x.tags.length?'/'+x.tags.join(','):'')+'}'; else if(x.one) tag='{'+x.one+'}'; else if(x.t&&typeof x.t==='string') tag='{'+x.t+'}'; }
      walk(fk,who,p+'['+i+']'+tag,x,ctx); }); return; }
  if(typeof v==='object'){
    for(const k in v){ if((SKIP.has(k)&&!(k==='note'&&/REL_LINES\.[^.]+\.cafe$/.test(p)))||/Text$/.test(k)) continue;   /* rel_lines 的 cafe.note 是會播的便條旁白，其他地方的 note 是說明 */
      let w=who; if(k==='t'&&/choices\[\d+\][^.]*$/.test(p)) w='祐廷（選項）'; if(k==='t'&&/(opts|ch)\[\d+\][^.]*$/.test(p)) w='祐廷（選項）';
      walk(fk,w,p+'.'+k,v[k],ctx); } }
}
const ID5='heroine_05', ID1='heroine_01';
// 學姊（批次範圍：AA_579 五個檔＋invites.js 連動）
walk('msg_pool','學姊','MSG_POOL.people.heroine_05',MSG_POOL.people[ID5]);
walk('msg2_pool','學姊','MSG2_POOL.people.heroine_05',(MSG2_POOL.people||MSG2_POOL)[ID5]);
walk('invite_replies','學姊','INVITE_REPLIES.people.heroine_05',INVITE_REPLIES.people[ID5]);
walk('invites','學姊','INVITE_DATA.people.heroine_05',INVITE_DATA.people[ID5]);
for(const k of ['slowreadLines','lawlibLines','lakeLines']) if(INVITE_DATA[k]&&INVITE_DATA[k][ID5]) walk('invites','學姊','INVITE_DATA.'+k+'.heroine_05',INVITE_DATA[k][ID5]);
walk('rel_lines','學姊','REL_LINES.heroine_05',REL_LINES[ID5]);
walk('eat_lines','學姊','EAT_LINES.together.heroine_05',EAT_LINES.together[ID5]);
// 以安（AA_580 範圍：ladder 八學期、invites.js、invite_replies；另外把第一批的檔也掃，禁用詞用）
for(const t in LADDER.byTerm) if(LADDER.byTerm[t][ID1]) walk('ladder','以安','LADDER.byTerm.'+t+'.heroine_01',LADDER.byTerm[t][ID1]);
walk('invites','以安','INVITE_DATA.people.heroine_01',INVITE_DATA.people[ID1]);
for(const k of ['slowreadLines','lawlibLines','lakeLines']) if(INVITE_DATA[k]&&INVITE_DATA[k][ID1]) walk('invites','以安','INVITE_DATA.'+k+'.heroine_01',INVITE_DATA[k][ID1]);
if(INVITE_DATA.walk118&&INVITE_DATA.walk118[ID1]) walk('invites','以安','INVITE_DATA.walk118.heroine_01',INVITE_DATA.walk118[ID1]);
walk('invite_replies','以安','INVITE_REPLIES.people.heroine_01',INVITE_REPLIES.people[ID1]);
walk('msg_pool','以安','MSG_POOL.people.heroine_01',MSG_POOL.people[ID1]);
walk('msg2_pool','以安','MSG2_POOL.people.heroine_01',(MSG2_POOL.people||MSG2_POOL)[ID1]);
walk('rel_lines','以安','REL_LINES.heroine_01',REL_LINES[ID1]);
walk('eat_lines','以安','EAT_LINES.together.heroine_01',EAT_LINES.together[ID1]);
// 走過去聊天：walk118 在 people.walk 裡用 {one} 引用；確認一下 people.heroine_01.walk 的 one 是不是都找得到
const CH={'學姊':ID5,'以安':ID1};
const charOf=l=>/heroine_05/.test(l.path)?ID5:ID1;
const WMSG=s=>s.who!=='祐廷'&&s.who!=='祐廷（選項）';   // 她（或旁白）的句子；選項、祐廷的句子另算

/* ================= ① 逐列比對 ================= */
function parseRows(md,maxN){ const rows=[]; for(const ln of fs.readFileSync(md,'utf8').split('\n')){ const m=/^\| (\d+|新\d+) \| ([^|]*) \| ([^|]*) \| ([^|]*) \| ([^|]*) \|/.exec(ln); if(!m) continue; if(/^\d+$/.test(m[1])&&+m[1]>maxN) continue; rows.push({n:m[1],pos:m[2].trim(),who:m[3].trim(),orig:m[4].trim(),to:m[5].trim()}); } return rows; }
const fileOfPos=pos=>{ const m=/^`?([a-z_0-9]+)\.js/.exec(pos); return m?m[1]:(/AA_415|invite_replies/.test(pos)?'invite_replies':null); };
const parts=s=>s.split('／').map(x=>x.trim()).filter(Boolean);
// 找一串連續的句子（同一陣列、索引相連）
function findSeq(fk,cid,ps){ const cand=LEAVES.filter(l=>l.fk===fk&&charOf(l)===cid&&l.v===ps[0]); const hits=[];
  for(const c of cand){ if(ps.length===1){ hits.push(c.path); continue; } const m=/^(.*)\[(\d+)\]([^\[\]]*)$/.exec(c.path); if(!m) continue; const base=m[1], i0=+m[2]; let ok=true;
    for(let j=1;j<ps.length;j++){ const re=new RegExp('^'+base.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\['+(i0+j)+'\\]'); if(!LEAVES.some(l=>l.fk===fk&&re.test(l.path)&&l.v===ps[j])) { ok=false; break; } }
    if(ok) hits.push(c.path); } return hits; }
// 位置提示 → 路徑必須含的字串（ladder：學期＋層 id＋欄位；其他檔：位置欄的英文字樣，括號裡的說明不算；有 sisN／anN／w118_an_N 時只看它）
const normP=p=>p.replace(/\{[^}]*\}/g,m=>/^\{[A-Z]\d*-L\d+\}$/.test(m)?m:'');
function hintToks(fk,pos){
  if(/^新/.test(pos)||/AA_415/.test(pos)) return null;
  if(fk==='ladder'){ const m=/ladder\.js:\d+ (Y\dS\d) (\S+)/.exec(pos); if(!m) return null; const f=m[2]; const k=f.indexOf('.');
    return {ladder:true,want:'byTerm.'+m[1]+'.heroine_01.'+(/^greet\./.test(f)?f:'steps[*]{'+f.slice(0,k)+'}'+f.slice(k))}; }
  const body=pos.replace(/^`?[a-z_0-9]+\.js:\d+(–\d+)?`?/,'').replace(/（[^）]*）/g,'').replace(/「[^」]*」/g,'');
  const toks=body.match(/[A-Za-z_][A-Za-z_0-9]*/g)||[]; const idt=toks.find(t=>/^(sis\d+|an\d+|w118_an_\d+)$/.test(t));
  let nth=null; const m2=/第 (\d+) 則/.exec(pos); if(m2) nth=+m2[1]-1;
  return {toks:idt?[idt]:toks.filter(t=>!/^(js)$/.test(t)),nth,idt}; }
function hintOK(h,p){ if(!h) return true; const q=normP(p);
  if(h.ladder){ const w=h.want.replace('steps[*]',''); const qq=q.replace(/steps\[\d+\]/,''); return qq.endsWith(w.replace(/^byTerm\.[^.]+\.heroine_01\./,'.').slice(1))&&q.includes(h.want.split('.heroine_01')[0]); }
  if(!h.toks.every(t=>new RegExp('(^|[.\\[{])'+t+'([.\\]}\\[]|$)').test(q))) return false;
  return true; }
const OVR579={7:{want:'考試週先複習就好。',why:'BB_228：第 7 列只留前半句'}};
function checkRow(batch,r){
  const fk=fileOfPos(r.pos)||'invite_replies'; const cid=batch==='579'?ID5:ID1; const out={batch,n:r.n,pos:r.pos,who:r.who,orig:r.orig,to:r.to,file:FILES[fk],fk};
  // 特殊列
  if(batch==='579'&&r.n==='36'){ const L=REL_LINES[ID5].up.FAMILIAR.l; out.want='（刪）：up.FAMILIAR.l 只剩一則'; out.act=J(L); out.paths=['REL_LINES.heroine_05.up.FAMILIAR.l']; out.ok=Array.isArray(L)&&L.length===1; }
  else if(batch==='579'&&r.n==='39'){ const c=REL_LINES[ID5].contact; out.want="contact.DATING='貝貝'（手機聯絡人）、對話框名另欄＝'溫書瑀'"; out.act='DATING='+J(c.DATING)+'，DATING_NAME='+J(c.DATING_NAME); out.paths=['REL_LINES.heroine_05.contact']; out.ok=c.DATING==='貝貝'&&c.DATING_NAME==='溫書瑀'; }
  else { let want=OVR579[r.n]&&batch==='579'?OVR579[r.n].want:r.to; if(OVR579[r.n]&&batch==='579') out.note=OVR579[r.n].why; out.want=want;
    const ps=parts(want); const all=findSeq(fk,cid,ps); const h=hintToks(fk,r.pos); const hits=all.filter(p=>hintOK(h,p));
    out.paths=hits; out.others=all.length-hits.length; out.ok=hits.length>0; out.hintTok=h;
    out.act=hits.length?want:(all.length?'（字串在，但不在位置欄指的地方：'+all.join(' ; ')+'）':'（遊戲資料裡找不到）'); }
  // 行號
  const first=parts(out.want||'')[0]||''; const tok=out.hintTok&&out.hintTok.toks&&out.hintTok.toks.length?out.hintTok.toks[out.hintTok.toks.length-1]:null;
  const key=first.length>24?first.slice(0,24):first; let ln=first&&!/^（刪|contact/.test(first)?lineOf(fk,key):[];
  if(ln.length>1&&tok){ const l2=ln.filter(i=>TXT[fk][i-1].includes(tok)); if(l2.length) ln=l2; }
  out.lines=out.n==='39'?lineOf('rel_lines',"DATING:'貝貝'"):out.n==='36'&&batch==='579'?lineOf('rel_lines','你最近很常來法圖'):ln;
  // 原句還在不在（她的台詞欄位裡完全相同的字串；另列整個檔逐行 grep 的次數，含註解）
  const op=r.orig&&!/^（新）$/.test(r.orig)?parts(r.orig):[];
  out.origLeft=[]; out.origRaw=[];
  for(const o of op){ // 和改成相同的那一則（例：同一列只改後一則）不算
    if(parts(out.want||'').includes(o)) continue;
    const left=LEAVES.filter(l=>l.fk===fk&&charOf(l)===cid&&l.v===o); if(left.length) out.origLeft.push(o+' @ '+left.map(l=>l.path).join(' , '));
    const core=o.replace(/^「|」$/g,''); const rc=rawCount(fk,core); if(rc) out.origRaw.push(o+' ×'+rc+'（行 '+lineOf(fk,core).join(',')+'）'); }
  return out;
}
const rows579=parseRows(MD579,57), rows580=parseRows(MD580,59);
const R1=[...rows579.map(r=>checkRow('579',r)),...rows580.map(r=>checkRow('580',r))];
// 連動：invites.js 裡學姊同一句的副本（AA_579 第 3-2 節）
const IS=INVITE_DATA.people[ID5];
const get579=n=>{ const x=R1.find(y=>y.batch==='579'&&y.n===String(n)); return x&&x.want; };
const ruleStr=fnStrings(IS.rule);
const LINK=[
 {k:'連1 invites.js acc.cafe.A ← 第 14 列',act:J(IS.acc.cafe&&IS.acc.cafe.A),want:J([get579(14)])},
 {k:'連2 invites.js rule（平日 9～17 約總圖 here）← 第 15 列',act:ruleStr.includes(get579(15).replace(/^「|」$/g,''))||ruleStr.includes(get579(15))?'rule 的字串常值含此句':'rule 裡找不到：'+J(ruleStr.filter(s=>/總圖/.test(s))),want:'rule 的字串常值含此句'},
 {k:'連3 invites.js acc.noodle.A ← 第 17 列',act:J(IS.acc.noodle&&IS.acc.noodle.A),want:J([get579(17)])},
 {k:'連4 invites.js acc.brunch.A ← 第 18 列',act:J(IS.acc.brunch&&IS.acc.brunch.A),want:J([get579(18)])},
 {k:'連5 invites.js acc.noodle.R ← 第 21 列',act:J(IS.acc.noodle&&IS.acc.noodle.R),want:J([get579(21)])},
 {k:'連6 invites.js partnerSay.teahouse ← 第 35 列',act:J(IS.partnerSay&&IS.partnerSay.teahouse),want:J([get579(35)])}];
LINK.forEach(x=>x.ok=x.act===x.want);
// rule 原句（第 15 列原句）還在不在
const rule15old='我就在總圖。三樓。不要講話，傳訊息。'; LINK.push({k:'連2b rule 原句已不存在',act:ruleStr.some(s=>s.includes(rule15old))?'還在':'不在',want:'不在'}); LINK[LINK.length-1].ok=LINK[LINK.length-1].act==='不在';
// invite_replies 的 say 欄（說明欄，不播）是否和 lines 同步——只報告
const SAY=[]; for(const cid of [ID5,ID1]) for(const r of INVITE_REPLIES.people[cid]) if(r.say!=null&&r.say!==r.lines.join('')&&r.say!==r.lines.join('／')) SAY.push(cid+' '+r.id+' say='+J(r.say)+' lines='+J(r.lines));
// 新1～3 的階段、標籤
const NEWSPEC={'新1':{st:[1,1],tags:['library','晚上']},'新2':{st:[1,2],tags:['noodle']},'新3':{st:[4,4],tags:['wenzhou'],note:'AA_580 第 8 節：階段 4、wenzhou、下午；st 照 an14'}};
const NEW=[]; for(const n in NEWSPEC){ const x=R1.find(y=>y.batch==='580'&&y.n===n); const r=INVITE_REPLIES.people[ID1].find(q=>J(q.lines)===J([x.want])); NEW.push({n,want:x.want,found:r?r.id:null,st:r&&r.st,tags:r&&r.tags,k:r&&r.k,off:r&&r.off,src:r&&r.src,spec:NEWSPEC[n]}); }

console.log('=== ① 逐列比對 ===');
for(const x of R1){
  console.log((x.ok?'OK  ':'DIFF')+' AA_'+x.batch+' #'+x.n+' '+x.file+':'+(x.lines||[]).join(',')+' 取法='+(x.paths||[]).join(' ; ')+(x.others?'（同字串另有 '+x.others+' 處，非本列位置）':'')+' 實際='+x.act+(x.ok?'':' 期望='+x.want)+(x.origLeft.length?' ※原句仍在台詞:'+x.origLeft.join('／'):'')+(x.origRaw.length?' （檔內原句字串:'+x.origRaw.join('／')+'）':'')); }
for(const x of LINK) console.log((x.ok?'OK  ':'DIFF')+' '+x.k+' 實際='+x.act+(x.ok?'':' 期望='+x.want));
console.log('-- 新增答應句 --'); NEW.forEach(x=>console.log(J(x)));
console.log('-- invite_replies say 欄和 lines 不同步（說明欄，只報告）：'+SAY.length); SAY.forEach(s=>console.log('   '+s));

/* ================= ② 禁用詞 ================= */
const BAN={[ID1]:['手帳','理由','跑步','條件'],[ID5]:['計畫本','便條']};
const EXC={手帳:l=>l.v.includes('想去的店'),便條:l=>/便條上(只)?寫/.test(l.v)};
const R2=[];
for(const cid of [ID1,ID5]) for(const w of BAN[cid]){ const hits=LEAVES.filter(l=>charOf(l)===cid&&l.v.includes(w));
  for(const h of hits) R2.push({cid,w,fk:h.fk,file:FILES[h.fk],line:lineOf(h.fk,h.v.slice(0,20)).join(','),who:h.who,path:h.path,v:h.v,exc:EXC[w]?EXC[w](h):false}); }
console.log('\n=== ② 禁用詞（台詞欄位；說明欄、註解不算）===  索引字串共 '+LEAVES.length+' 筆');
for(const cid of [ID1,ID5]) for(const w of BAN[cid]){ const L=R2.filter(x=>x.cid===cid&&x.w===w); const byF={}; L.forEach(x=>{ const k=x.fk+(WMSG(x)?'':'(祐廷/選項)'); byF[k]=(byF[k]||0)+1; });
  console.log(cid+' 「'+w+'」 '+L.length+' 筆 '+J(byF)); L.forEach(x=>console.log('    '+(x.exc?'[例外] ':'')+x.file+':'+x.line+' '+x.who+' '+x.path+'：'+x.v)); }

/* ================= ③ 空句／undefined ================= */
const badV=v=>v==null||v===''||/undefined|\bnull\b|NaN|^「」$|^（）$|^\s+$/.test(String(v));
const bad=LEAVES.filter(l=>badV(l.v));
const rowBad=R1.filter(x=>badV(x.want)||x.ok&&badV(x.act));
// 模擬：兩人各階段 × 地點 × 時間 × 年級，INV.decide → INV.personal，收集播出的句子
const REL={1:{fam:10},2:{fam:25},3:{fam:45,trust:30},4:{fam:65,trust:50,comf:45},5:{fam:45,trust:30,npcRom:30},6:{fam:65,trust:50,comf:45,npcRom:55,rom:30}};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const PLACES=INVITE_DATA.places.map(p=>p.id); const HOURS=[8,10,12.5,14,15.5,17,18.5,19.5,21];
const KEYS=['2025-10-06','2025-12-15','2026-03-09','2026-10-05','2027-03-08','2027-10-04'];
const sim={n:0,lines:0,empty:[],err:{},shown:{}};
const sv=x=>typeof x==='string'?x:(x&&x.me!=null?x.me:x);
for(const cid of [ID1,ID5]) for(const key of KEYS) for(let st=1;st<=7;st++) for(let seed=1;seed<=SEEDS;seed++){ _s=seed*7919+st*31+key.length;
  H.fresh(key,9,'campus'); const r0=SOCIAL.rel(cid); Object.assign(r0,{fam:0,trust:0,comf:0,npcRom:0,rom:0},REL[st===7?4:st]); SOCIAL.remember(cid,'FIRST_MET',''); if(st===7) H.G.flags['dating_'+cid]=true;
  const day=H.G.day+Math.floor(rnd()*5); H.G.day=day; H.G.weekday=wdOf(day);
  for(const pid of PLACES){ const h=HOURS[Math.floor(rnd()*HOURS.length)]; H.G.hour=h; let r;
    try{ const dcs=INV.decide(H.G,cid,pid,day,h); r=INV.personal(H.G,cid,INV.place(pid),day,h,dcs); }catch(e){ const k=cid+' '+e.message; sim.err[k]=(sim.err[k]||0)+1; continue; }
    sim.n++; if(r&&r.lines){ for(const x of r.lines){ sim.lines++; const v=sv(x); (sim.shown[cid]||(sim.shown[cid]=new Set())).add(String(v)); if(badV(v)) sim.empty.push({cid,key,st,pid,h,res:r.res,v:J(x)}); } } } }
// 走過去聊天（walk）、慢讀／法圖／映月湖的 first/firstAt/walk 都是資料陣列，已在索引裡逐筆掃過
console.log('\n=== ③ 空句／undefined ===');
console.log('索引台詞字串中空的／含 undefined、null：'+bad.length+(bad.length?' '+J(bad.slice(0,10)):''));
console.log('逐列期望／實際值空：'+rowBad.length);
console.log('模擬：邀約 '+sim.n+' 次、播出句子 '+sim.lines+' 則（以安 '+(sim.shown[ID1]?sim.shown[ID1].size:0)+' 種、學姊 '+(sim.shown[ID5]?sim.shown[ID5].size:0)+' 種），空／undefined：'+sim.empty.length+(sim.empty.length?' '+J(sim.empty.slice(0,5)):'')+'；例外：'+J(sim.err));
// 模擬播出的句子裡有沒有這兩批的新句子（抽查）
const newIn=cid=>R1.filter(x=>x.ok&&(x.batch==='579'?ID5:ID1)===cid&&/^「/.test(x.want)&&sim.shown[cid]&&parts(x.want).every(p=>sim.shown[cid].has(p))).map(x=>'AA_'+x.batch+'#'+x.n);
console.log('模擬中實際播到的改稿句：以安 '+J(newIn(ID1))+'；學姊 '+J(newIn(ID5)));

const SUMMARY={rows579:rows579.length,rows580:rows580.length,diff:R1.filter(x=>!x.ok).map(x=>'AA_'+x.batch+'#'+x.n),origLeft:R1.filter(x=>x.origLeft.length).map(x=>'AA_'+x.batch+'#'+x.n),linkDiff:LINK.filter(x=>!x.ok).map(x=>x.k),
  ban:Object.fromEntries([ID1,ID5].flatMap(cid=>BAN[cid].map(w=>[cid+':'+w,{all:R2.filter(x=>x.cid===cid&&x.w===w).length,herNonExc:R2.filter(x=>x.cid===cid&&x.w===w&&WMSG(x)&&!x.exc).length}]))),
  empty:bad.length+rowBad.length+sim.empty.length,simInvites:sim.n,simLines:sim.lines,newRows:NEW.map(x=>[x.n,x.found,J(x.st),J(x.tags)])};
console.log('\nSUMMARY '+J(SUMMARY));
