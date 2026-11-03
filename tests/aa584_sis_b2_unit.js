// AA_584（企劃線 14154434b；學姊改稿第二批：閒聊階梯與邀約；AA 定稿（第 9 節，D109）＋BB_230 口氣審＋使用者 2026-11-02 18:0x 選擇題確認（第 11 節））——不需要瀏覽器。
//   0  讀稿 AA_584@14154434b；白名單一筆 approved；ladder.js 的來源寫著 AA_584@14154434b
//   1  閒聊階梯（ladder.js，import_ladder.py 疊稿）：第 2 節表上每一列 # 是數字的（83 列）——刪掉的層、格以外，遊戲資料那個位置＝稿上的「改成」（一字照稿）
//   2  第 11 節使用者的句子（第 9、10、29、48、67、82 列）在稿裡、也在遊戲裡
//   3  刪掉的：爸爸三層 S2-L5、S5-L5、S7-L6（第 9 節第 1 點）；第 11 節大一上 S-L8、大一下 S2-L6（空保溫瓶）、大二上 S3-L3；大二上 S3-L6 的 extraIf[0]（空保溫瓶）；
//      大四上交往中招呼「{name}。……沒事。叫一下。」（第 72 列）；她的階梯沒有「爸」「空的保溫瓶」「不要跟我講話」「叫一下」
//   4  邀約（invites.js 第 79～87 列）、STUDY_YES（sis_grad3d.js 第 88 列）：新句在遊戲裡、舊句不在、新句一字不差在稿裡
//   5  記憶名稱（第 4-4 節連1、連2，第 9 節第 1 點）；修正本私訊（sis_b13_3d.js）不再看 SIS6_FATHER_COPY（第 9 節第 1 點）
//   6  刪層的舊存檔進度（story3d.js S.LAD_DEL）：大一下走過 6 層（下一層是 S2-L7）的舊存檔換算成 4、只換一次；新遊戲不換
// 修改前（int/next1102 48918ca20）：0（白名單、來源）、1（56 列對不上）、2、3、4、5、6 FAIL（稿讀得到、列數那兩項 PASS）。用法：node tests/aa584_sis_b2_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), path=require('path'), cp=require('child_process');
const {check}=H, J=JSON.stringify;
const git=a=>{ try{ return cp.execFileSync('git',['-C',H.ROOT,'-c','core.quotepath=off'].concat(a),{encoding:'utf8',maxBuffer:64*1024*1024}); }catch(e){ return ''; } };
const SHA='14154434b', P584='docs/story_planning/AA_584_學姊改稿_第二批_閒聊階梯與邀約.md', DOC=git(['show',SHA+':'+P584]);
const src=f=>fs.readFileSync(path.join(H.ROOT,f),'utf8');
const ID='heroine_05', BY=Object.assign({},LADDER.byTerm,{Y1S1:LADDER.characters}), SIS=t=>(BY[t]||{})[ID]||{};
const stepOf=(t,sid)=>(SIS(t).steps||[]).find(s=>s.id===sid);
const at=(term,p)=>{ let o, parts=p.split('.'); if(term==='bikeSeat') o=LADDER.bikeSeat; else if(parts[0]==='greet') o=SIS(term); else { o=stepOf(term,parts[0]); parts=parts.slice(1); if(!o) return undefined; }
  for(const x of parts){ const m=/^(\w+)(?:\[(\d+)\])?$/.exec(x); if(!m||o==null) return undefined; o=o[m[1]]; if(m[2]!=null) o=o==null?undefined:o[+m[2]]; } return o; };
const DROP=[['Y1S2','S2-L5'],['Y3S1','S5-L5'],['Y4S2','S7-L6'],['Y1S1','S-L8'],['Y1S2','S2-L6'],['Y2S1','S3-L3']];
const strs=o=>{ const r=[]; const w=(v,k)=>{ if(k==='note'||k==='if') return; if(typeof v==='string') r.push(v); else if(Array.isArray(v)) v.forEach(x=>w(x)); else if(v&&typeof v==='object') for(const kk in v) w(v[kk],kk); }; w(o); return r; };

check('0. 讀得到 AA_584@'+SHA,DOC.length>5000&&DOC.includes('## 11. 使用者確認'));
{ const al=JSON.parse(src('docs/handoff/story_import_allow.json')).files.filter(e=>e.path===P584);
  check('0. 匯入白名單：AA_584 一筆 approved＝'+SHA,al.length===1&&al[0].sha===SHA&&al[0].status==='approved'&&!!al[0].approvedBy,J(al.map(e=>[e.sha,e.status]))); }
check('0. ladder.js 的來源寫著 AA_584@'+SHA,/AA_584@14154434b/.test(src('src/data/ladder.js').split('\n')[0]));

// ===== 1 第 2 節的表 =====
const rows=[];
for(const line of DOC.split('\n')){ const m=/^\|\s*(\d+)\s*\|\s*ladder\.js:3 (\S+)(?: (\S+))?\s*\|[^|]*\|([^|]*)\|([^|]*)\|/.exec(line); if(!m) continue;
  const bs=m[2].startsWith('bikeSeat.'); rows.push({n:+m[1],term:bs?'bikeSeat':m[2],path:bs?m[2].slice(9):m[3],old:m[4].trim(),nw:m[5].trim().replace(/^（AA 定：甲）/,'')}); }
{ const want=[]; for(let i=1;i<=78;i++) want.push(i); for(let i=89;i<=93;i++) want.push(i);
  check('1. 稿上 ladder.js 的列＝第 1～78、89～93 列',J(rows.map(r=>r.n).sort((a,b)=>a-b))===J(want),rows.length); }
{ const bad=[], skip=[]; let ok=0;
  for(const r of rows){ const inDrop=DROP.some(([t,s])=>t===r.term&&r.path.split('.')[0]===s)||(r.term==='Y2S1'&&/^S3-L6\.extraIf\[0\]/.test(r.path))||r.nw==='（刪這一格）';
    if(inDrop){ skip.push(r.n); continue; }
    const v=at(r.term,r.path); if(v===r.nw&&DOC.includes(r.nw)) ok++; else bad.push([r.n,r.term,r.path,v,r.nw]); }
  check('1. 刪掉的層、格以外，每一列遊戲資料那個位置＝稿上的「改成」（'+ok+' 列）',bad.length===0&&ok===rows.length-skip.length,J(bad));
  check('1. 在刪掉的層、格裡的列（不用換）：第 5、6、16～25、34、35、38、39、53～57、72～77 列',J(skip.sort((a,b)=>a-b))===J([5,6,16,17,18,19,20,21,22,23,24,25,34,35,38,39,53,54,55,56,57,72,73,74,75,76,77]),J(skip)); }

// ===== 2 第 11 節使用者的句子 =====
{ const U=[[29,'Y1S2','greet.when[0].t','（她抬頭看到你，點了一下頭，又低頭繼續寫。）'],[10,'bikeSeat','heroine_05.onFirst','還是我載你？'],[9,'Y1S1','greet.when[1].t','大一就這麼拼喔。'],
    [48,'Y2S2','S4-Lx.choices[1].reply','那系上的交換要早點查。我可以幫你看。'],[67,'Y3S2','S6-L7.choices[1].reply','好。我想坐靠窗那邊。']];
  const bad=U.filter(([n,t,p,s])=>!(DOC.includes('「'+s+'」')||DOC.includes(s))||at(t,p)!==s);
  check('2. 第 11 節使用者的句子（第 9、10、29、48、67 列）在稿裡、也在遊戲裡（第 82 列在第 4 項）',bad.length===0,J(bad));
  check('2. 第 11 節的字樣：第 29 列「（她抬頭看到你，點了一下頭，又低頭繼續寫。）」、第 10 列「還是我載你？」、第 9 列「大一就這麼拼喔。」、第 48 列、第 67 列、第 82 列「好。我在三樓。」都在第 11 節',
    ['（她抬頭看到你，點了一下頭，又低頭繼續寫。）','「還是我載你？」','「大一就這麼拼喔。」','「那系上的交換要早點查。我可以幫你看。」','「好。我想坐靠窗那邊。」','「好。我在三樓。」'].every(t=>DOC.split('## 11. 使用者確認')[1].includes(t))); }

// ===== 3 刪掉的 =====
{ const left=DROP.filter(([t,s])=>!!stepOf(t,s));
  check('3. 整層刪：大一下 S2-L5、大三上 S5-L5、大四下 S7-L6（爸爸）；大一上 S-L8、大一下 S2-L6、大二上 S3-L3（第 11 節）',left.length===0,J(left));
  check('3. 其他層還在（大一上 8 層、大一下 6、大二上 7、大三上 7、大四下 7；大二下、大三下、大四上照舊 9、8、8）',J(['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'].map(t=>(SIS(t).steps||[]).length))===J([8,6,7,9,7,8,8,7]));
  const s36=stepOf('Y2S1','S3-L6');
  check('3. 大二上 S3-L6 還在、extraIf[0]（空保溫瓶）刪了',!!s36&&!(s36.extraIf||[]).length&&s36.lines[0]==='保溫瓶我換了新的蓋子。舊的會漏。',J(s36&&s36.extraIf));
  const W=SIS('Y4S1').greet.when.map(w=>w.t);
  check('3. 大四上交往中招呼「{name}。……沒事。叫一下。」那一格刪了（第 72 列），其他五格照舊',W.length===5&&!W.some(t=>/叫一下/.test(t)),J(W));
  const all=Object.keys(BY).flatMap(t=>strs(SIS(t))).concat(strs(LADDER.bikeSeat[ID]));
  const hit=['爸','空的保溫瓶','不要跟我講話','一句可以','叫一下','你騎慢一點','不要回頭'].map(w=>[w,all.filter(t=>t.includes(w))]).filter(x=>x[1].length);
  check('3. 她的階梯、坐後座（不算註解、條件）沒有「爸」「空的保溫瓶」「不要跟我講話」「一句可以」「叫一下」「你騎慢一點」「不要回頭」',hit.length===0,J(hit)); }

// ===== 4 邀約、STUDY_YES =====
{ const inv=src('src/data/invites.js'), sg=src('src/sis_grad3d.js');
  const R=[];
  for(const line of DOC.split('\n')){ const m=/^\|\s*(\d+)\s*\|\s*(\S*(?:invites\.js|sis_grad3d\.js)\S*)[^|]*\|[^|]*\|([^|]*)\|([^|]*)\|/.exec(line); if(m) R.push({n:+m[1],f:/sis_grad/.test(m[2])?sg:inv,old:m[3].trim(),nw:m[4].trim()}); }
  check('4. 稿上邀約、STUDY_YES 的列＝第 79～88 列',J(R.map(r=>r.n))===J([79,80,81,82,83,84,85,86,87,88]));
  const q=(r,s)=>r.n===88?"'「"+s+"」'":"'"+s+"'";
  const bad=R.filter(r=>!r.f.includes(q(r,r.nw))||r.f.includes(q(r,r.old))||!DOC.includes(r.nw));
  check('4. 第 79～88 列：新句在 src（invites.js、sis_grad3d.js）、舊句不在、新句一字不差在稿裡',bad.length===0,J(bad.map(r=>r.n)));
  const L=INVITE_DATA.lawlibLines[ID], K=INVITE_DATA.lakeLines[ID];
  check('4. 法圖：first「好。我在三樓。」（第 82 列，使用者）、acc.A、here、walk；映月湖 acc「好啊。」、firstAt 第 1 則',J(L.first)===J(['「好。我在三樓。」'])&&J(L.acc.A)===J(['「好。我平常的位子旁邊有空位。」'])&&J(L.here)===J(['「好啊，我在法圖三樓。到了跟我說。」'])
    &&J(L.walk)===J(['「法圖的樓梯很陡。我大一常常爬到一半就喘。」'])&&J(K.acc)===J(['「好啊。」'])&&K.firstAt[0]==='（她站在湖邊，手上什麼都沒拿。）',J({L,K}));
  check('4. STUDY_YES＝「好。我帶刑訴。」（第 88 列）',/S\.STUDY_YES='「好。我帶刑訴。」';/.test(sg)); }

// ===== 5 記憶名稱、修正本私訊 =====
{ const M=SOCIAL.MEMORY_LABEL, want={SIS_PARENTS_HEARD:'聽學姊說她媽媽一直覺得考上司法官很好',SIS_PUBLIC_LAW_FAN:'跟學姊說公法不無聊（她說你是少數）',SIS4_CLIPPINGS:'學姊說過法律扶助的剪報',SIS6_FATHER_COPY:'學姊說過論文要印一本',SIS7_PAGES:'論文一百四十二頁'};
  const bad=Object.keys(want).filter(k=>M[k]!==want[k]||!DOC.includes(want[k]));
  check('5. 記憶名稱（第 4-4 節連1、連2，第 9 節第 1 點；id 不動）',bad.length===0,J(bad.map(k=>[k,M[k]])));
  const b13=src('src/sis_b13_3d.js');
  check('5. 修正本私訊（sis_b13_3d.js S.thesis）不再看 SIS6_FATHER_COPY，改朋友以上（friendUp）',!/has\(ID,'SIS6_FATHER_COPY'\)/.test(b13)&&/G\.day<=a\+1&&friendUp\(G\)&&!exAny\(G\)&&!!F\.met_sis/.test(b13)); }   /* AA_600 B20（企劃線 031414cad）：朋友以上之外再擋前任（!exAny）——原本的式子照 AA_600 換，friendUp 的條件照查 */

// ===== 6 刪層的舊存檔進度 =====
{ const day='2026-04-22'; H.fresh(day,15,'campus',{met_sis:true}); H.FRIEND(ID); const T=CALENDAR.termOf(H.G.day);
  H.G.social.ladder={'heroine_05@Y1S2':6,'heroine_05@Y2S1':5,'heroine_05@Y3S1':3,'heroine_05':9,'heroine_01@Y1S2':6}; delete H.G.social.ladDel;
  STORY.ladNext(H.G,ID); const L1=Object.assign({},H.G.social.ladder);
  check('6. 舊存檔（大一下學姊走過 6 層＝下一層 S2-L7）：換算成 4（S2-L5、S2-L6 在前面）；其他學期照 S.LAD_DEL 換（大二上 5→4、大三上 3 不變、大一上 9→8）；別人不動；記 ladDel.aa584',
    !!T&&T.id==='Y1S2'&&J(L1)===J({'heroine_05@Y1S2':4,'heroine_05@Y2S1':4,'heroine_05@Y3S1':3,'heroine_05':8,'heroine_01@Y1S2':6})&&H.G.social.ladDel&&H.G.social.ladDel.aa584===1&&SIS('Y1S2').steps[4].id==='S2-L7',J({T:T&&T.id,L1}));
  STORY.ladNext(H.G,ID); check('6. 只換一次（再讀一次不變）',J(H.G.social.ladder)===J(L1));
  H.fresh(day,15,'campus',{met_sis:true}); H.G.social.ladder={}; delete H.G.social.ladDel; STORY.ladNext(H.G,ID); H.G.social.ladder['heroine_05@Y1S2']=4; STORY.ladNext(H.G,ID);
  check('6. 新遊戲：第一次用到階梯就記成換算過，之後的進度不再換',H.G.social.ladder['heroine_05@Y1S2']===4&&H.G.social.ladDel.aa584===1); }
H.done();
