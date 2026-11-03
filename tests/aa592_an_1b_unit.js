// AA_592 以安改稿①b（手機訊息＋一般閒聊）：企劃線 4162d22e1 的表逐列核對（AA592-AN-1B-1102）——不需要瀏覽器。
//   1  稿讀得到；白名單有這一份（sha 4162d22e1、approved、task AA592-AN-1B-1102）
//   2  表上第 1～55 列（第 9 節：原決1～決6＝第 50～55 列）：「改成」在位置欄那個檔裡（字串常數的整格，'…' 或 "…" 或 「…」）、原句不在；
//      第 1 列照 BB_238 退回原句；原句出現多次的第 11、12、15、16、26、29、32、48 列只換那一處（逐處驗）
//   3  新1：開學第二天 21:30 第一則私訊，照片後面多一則「（兔子揮手）」（tag an_first_note 不變）
//   4  第 53 列：date_wish.js 是產生檔——tools/date/import_wish.py 疊 AA_592 第 53 列重匯；源稿 wish_aa.json 沒改（白名單照舊）
// 修改前（173a4df9b 的 src、白名單放進這支測試實際跑，AA592_ROOT）：FAIL 12、PASS 4；修改後 ALL PASS（16 項）。
// 用法：node tests/aa592_an_1b_unit.js
const fs=require('fs'), path=require('path'), cp=require('child_process');
const GITDIR=path.join(__dirname,'..'), ROOT=path.resolve(process.env.AA592_ROOT||GITDIR);
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(ok||info===undefined?'':'　'+info)); if(!ok) fails++; };
const J=JSON.stringify, R=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const SHA='4162d22e1', SPEC='docs/story_planning/AA_592_以安改稿_1b_手機訊息與一般閒聊.md';
const DOC=(()=>{ try{ return cp.execSync('git show '+SHA+':"'+SPEC+'"',{cwd:GITDIR,encoding:'utf8',maxBuffer:1<<26}); }catch(e){ return ''; } })();
const SRC={}; (function walk(d){ for(const f of fs.readdirSync(path.join(ROOT,d))){ const p=d+'/'+f; if(fs.statSync(path.join(ROOT,p)).isDirectory()) walk(p); else if(/\.js$/.test(f)&&!/chars3d/.test(f)) SRC[p]=R(p); } })('src');
const stripC=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/mg,'');
const CODE={}; for(const p in SRC) CODE[p]=stripC(SRC[p]);
const lit=t=>/^「.*」$/.test(t)?[t]:["'"+t+"'",'"'+t+'"'];   /* 字串常數的整格（invites.js 的同行聊天本身帶「」）*/
const inLit=(code,t)=>lit(t).some(x=>code.includes(x));
const litWhere=t=>Object.keys(CODE).filter(p=>inLit(CODE[p],t));
const fileOf=where=>{ const m=where.match(/^`?([\w.]+\.js)/); if(!m) return null; return Object.keys(SRC).find(p=>p.endsWith('/'+m[1]))||null; };
const rows=[]; for(const line of DOC.split('\n')){ const m=line.match(/^\|\s*([0-9]+)\s*\|(.*)\|\s*$/); if(!m) continue; const c=m[2].split('|').map(x=>x.trim()); if(c.length<5) continue; rows.push({n:+m[1],where:c[0],who:c[1],old:c[2],nw:c[3],why:c[4]}); }
// ---------- 1 ----------
check('1. 讀得到稿（AA_592 @'+SHA+'：第 9、10 節）',DOC.length>30000&&/## 10\. 第 6 節 10 句/.test(DOC)&&/本批全部可以交 LAWWW 整合/.test(DOC),String(DOC.length));
{ const A=JSON.parse(R('docs/handoff/story_import_allow.json')).files.filter(e=>e.path===SPEC);
  check('1. 白名單有 AA_592（sha '+SHA+'、approved、AA592-AN-1B-1102）',A.length===1&&A[0].sha===SHA&&A[0].status==='approved'&&A[0].task==='AA592-AN-1B-1102',J(A)); }
// ---------- 2 ----------
check('2. 表上第 1～55 列都讀到',rows.length===55&&new Set(rows.map(r=>r.n)).size===55,rows.length);
const MULTI=[11,12,15,16,26,29,32,48], GEN=[53];
{ const bad=[]; for(const r of rows){ if(MULTI.includes(r.n)||GEN.includes(r.n)) continue; const f=fileOf(r.where);
    if(!f||!inLit(CODE[f],r.nw)) bad.push('#'+r.n+' 改成不在 '+f+'：'+r.nw);
    if(r.old!==r.nw&&litWhere(r.old).length) bad.push('#'+r.n+' 原句還在 '+litWhere(r.old).join('、')+'：'+r.old); }
  check('2. 一般列（'+(55-MULTI.length-GEN.length)+' 列）：改成是位置欄那個檔的字串常數、原句的字串常數不在 src',!bad.length,J(bad)); }
check('2. 第 1 列照 BB_238 退回原句「三頁是因為字很大。」（後半句沒有加）',rows.find(r=>r.n===1).old===rows.find(r=>r.n===1).nw&&inLit(CODE['src/story3d.js'],'三頁是因為字很大。')&&!/其實都在講吹風機/.test(CODE['src/story3d.js']));
{ const V=CODE['src/data/vacfill_events.js'], i=V.indexOf('y2_0724:{'), y=V.slice(i,V.indexOf('},',V.indexOf('photo:',i)));
  check('2. 第 11、12、13 列（7/24 從台中，交往中）：ms 最後一則「你呢？」；「在想妳。」→「我在看書。」「……看不太下去了。」（只換這一處的「……你呢？」「……嗯。」）',
    y.includes("冷氣只開一台。','你呢？']")&&y.includes("miss:'在想妳。',missSay:['我在看書。','……看不太下去了。']")&&!y.includes('十點半再傳'),y.slice(0,300)); }
check('2. 第 15、16 列（送機沒來兩處：日本 3/25、紐約）：「要登機了。」「到了再傳。」',/DM\('heroine_01','要登機了。'\),DM\('heroine_01','到了再傳。'\)/.test(CODE['src/y34b3d.js'])&&/\['（照片：登機證）','要登機了。','到了再傳。'\]/.test(CODE['src/r2y4b3d.js'])&&!/'要登機了'|'到了再傳'/.test(CODE['src/y34b3d.js']+CODE['src/r2y4b3d.js']));
check('2. 第 25、26 列（大四上 R1 之後）：「明天把那一頁帶來。」「我要看。」',/DM\('heroine_01','明天把那一頁帶來。'\),DM\('heroine_01','我要看。'\)/.test(CODE['src/y34b3d.js']));
check('2. 第 28、29 列（大四下 2/2 考前一晚）：「明天考完，一起去麵店。」「大碗。」',/A\('明天考完，一起去麵店。'\),A\('大碗。'\)/.test(CODE['src/r2y4a3d.js']));
check('2. 第 32、33 列（杜鵑第四張）：「杜鵑開了。」「十二點半，老位置。」',/P_\('heroine_01','杜鵑開了。'\),P_\('heroine_01','十二點半，老位置。'\)/.test(CODE['src/r2y4b3d.js']));
check('2. 第 48、49 列（溫州街 媽媽到過茶屋那天）：「今天謝謝你。」「我媽回家路上問，那間茶屋週末都有開嗎？」',/A\('今天謝謝你。'\),A\('我媽回家路上問，那間茶屋週末都有開嗎？'\)/.test(CODE['src/wzlines3d.js']));
check('2. 第 38 列（七月最後一次的邀約私訊）：「六點半，同一家。」（「……手帳我帶著。」拿掉）',/inv:\['明天晚上有空嗎。','六點半，同一家。'\]/.test(CODE['src/r2y4b3d.js'])&&!/手帳我帶著/.test(CODE['src/r2y4b3d.js']));
// ---------- 3 新1 ----------
check('3. 新1：第一則私訊（an_first_note）＝照片＋「（兔子揮手）」',/PHONE\.at\(G,F\.AN_CONTACT_DAY2,21\.5,\[\{th:'p:heroine_01',from:'heroine_01',text:'📷（筆記的照片，字很整齊）'\},\{th:'p:heroine_01',from:'heroine_01',text:'（兔子揮手）'\}\],'an_first_note'\)/.test(CODE['src/story3d.js'])&&DOC.includes('| 新1 |')&&DOC.includes('| （兔子揮手） |'));
// ---------- 4 第 53 列 ----------
{ const W=R('src/data/date_wish.js'), r=rows.find(x=>x.n===53), tool=fs.readFileSync(path.join(GITDIR,'tools/date/import_wish.py'),'utf8');
  check('4. 第 53 列（心願約會 法庭）：date_wish.js 是「我媽說，坐在上面的人，要先把兩邊都講得比他們自己還好，再決定。」、舊句不在；source 寫明疊了 AA_592',W.includes(J(r.nw))&&!W.includes(r.old)&&W.includes('AA_592@'+SHA+'（以安 D07 法庭 1 句）'));
  check('4. 產生器 import_wish.py 疊 AA_592 第 53 列（白名單 AA_592_；稿上要找得到那一列；整句相同才換）',/A592 = G\.approved_files\(ALLOW, SP \+ 'AA_592_'\)/.test(tool)&&tool.includes("if f'| {OLD53} | {NEW53} |' not in md592:")); }
// ---------- 5 連動 ----------
check('5. 第 54、55 列：臺灣路線讀書會旁白（twfill_events.js）、記憶面板 PLG_LAST_RULE 都是「每個人講完。」，兩處都沒有「說理由」（其他人物、④b 的「說理由」不在本批）',/只留最上面那一行沒擦：每個人講完。）/.test(CODE['src/data/twfill_events.js'])&&!/說理由/.test(CODE['src/data/twfill_events.js'])&&/PLG_LAST_RULE:'讀書會交棒那天，白板上只剩一條：「每個人講完。」'/.test(CODE['src/social3d.js']));
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
