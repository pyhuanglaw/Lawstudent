// AA_460 法律系大二上讀一遍（企劃線 b9362f474，AA-B 2026-10-25 11:3x；接 AA_459）——不需要瀏覽器。台詞逐字對 AA_460（從企劃線 git show 讀稿、解析表格）。第 1 節（手機 200 則上限）開發分支已經修好，這裡不測。
//   0 讀稿（2-2 的短句、每月第一個週日那句、2-3 的 32 句、考試的日子、第 3 節四次、4-2、4-3 兩張表、第 5 節七個學期、第 6 節兩句）；STORY.PS_KEEP_ROWS／SHORT／SUN／PS_EXAM、fest_events 的 by、termend_lines 的 KX.invite 照稿
//   2 沛珊重考消失期（交往中）每晚 23:00 以後一則：2026-12-18～2027-08-05 每晚一句；有日子的那天用那一句、週六用那個月的下一句、每月第一個週日「有想到你」、其他晚上短句四句輪（不跟前一晚同一句）；
//     32 句每句一次、原本六句都還在；手機實際收到（tag ps_keep_<日>）；舊存檔（PS_KEEP_N 很大）照日子挑；子代理判斷的三處（7/10 考試那天不用週六那句、2 月「開學了吧」等開學、8 月那句放 7/31）
//   3 阿凱的泡麵評鑑表（kai_sheet）照第幾次換四種；舊存檔照 dpN 接
//   4 節日邀約：以安照節日換整組（by，四個節日；生日那一列照第 9 節當作沒有）；沛珊在臺北那張（4-3）照第 9 節（企劃線 cb5caad65）當作沒有＝照原本（第一句換節日名）；沛珊回家照舊 homeBy＞homeLines；手機實際收到（前一天 21:00）；
//     稿問「以安 2027 生日 herAsks 會不會發」：herAsks 只有情人節、白色情人節、七夕、聖誕（FEST.HER_K），生日不發（2027 中秋那年也不發）＝不用改中午版
//   5 可昕的學期末邀約：地點前寫約會那天（今天／明天／禮拜幾；大二上 12/24 傳、12/26 約＝「禮拜六」）；大一下照舊「禮拜五」；排不到日子＝拿掉 {哪天}
//   6 芷若光典影展兩句換字（date_wish.js，tools/date/import_wish.py 的 REPLACE）
// 修改前（開發分支 a2a423fae）：0、2～6 每一節至少一項 FAIL（實測 22 項 FAIL、第 2、5 節中途丟例外）。第 9 節（4-3 沛珊、4-2 以安生日當作沒有）：c7d701caf 上 FAIL。用法：node tests/aa460_y2s1_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
const EXPORT=/^(FEST|FEST_DATA|FEST_EVENTS|DATE_WISH)$/;
const loadErr=[];
const L3=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)){ loadErr.push(f+'：沒有這個檔'); return false; } try{ let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>EXPORT.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); return true; }catch(e){ loadErr.push(f+'：'+e.message); return false; } };
for(const f of ['src/data/fest_events.js','src/fest3d.js','src/data/date_wish.js']) L3(f);   /* 照 aa457_vac_unit.js、date_wish_unit.js 載的檔 */
GM.toast=()=>{}; GM.caption=()=>{};
const D=k=>STORY.dayOfKey(k), keyOf=d=>CALENDAR.dateOf(d).key, wdOf=d=>CALENDAR.dateOf(d).wd%7;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const at=(d,h)=>{ const G=H.G; G.day=d; G.hour=h; G.weekday=wdOf(d); };
const fresh=(k,h,flags,zone)=>{ const G=H.fresh(typeof k==='number'?keyOf(k):k,h,zone||'dorm',flags||{}); G.outings=[]; G.acts={att:{}}; G.contacts=G.contacts||{}; PHONE.rec(G); E.player.busy=false; E.paused=false; return G; };
const run=(h0,h1,st)=>{ st=st||0.05; for(let h=h0;h<=h1+1e-9;h+=st){ H.G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(H.G); } };
const byTag=tag=>(H.G.msgs||[]).filter(m=>m.tag===tag);
const thread=th=>(H.G.msgs||[]).filter(m=>m.th===th);

/* ---- 讀稿（企劃線 b9362f474）---- */
let doc=''; try{ doc=cp.execSync('git show b9362f474:"docs/story_planning/AA_460_法律系大二上讀一遍_沛珊重考每晚一則_節日邀約_手機上限.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc=''; }
const part=(a,b)=>{ const i=doc.indexOf(a); if(i<0) return ''; const j=b?doc.indexOf(b,i+1):-1; return doc.slice(i,j<0?doc.length:j); };
const rows=t=>t.split('\n').filter(l=>/^\|/.test(l.trim())&&!/^\|\s*-/.test(l.trim())).map(l=>l.trim().replace(/^\||\|$/g,'').split('|').map(c=>c.trim()));
const orig=s=>s.replace(/（原句）$/,'').trim();
const P22=part('### 2-2','### 2-3'), SHORT=P22.split('\n').filter(l=>/^\s{3,}- \S/.test(l)).map(l=>orig(l.trim().slice(2))), SUN=(P22.match(/\*\*每個月第一個週日\*\*：「([^」]+)」/)||[])[1];
const ROWS=rows(part('### 2-3','- **考試的日子**')).filter(r=>/^\d{1,2}$/.test(r[0])).map(r=>{ const m=+r[0], dd=(r[1].match(/^(\d{1,2})\/(\d{1,2})/)||[]); return [m,orig(r[2]),dd[1]?(m===12?'2026':'2027')+'-'+String(dd[1]).padStart(2,'0')+'-'+String(dd[2]).padStart(2,'0'):null]; });
const EXAM=(()=>{ const m=part('- **考試的日子**','- **對過的**').match(/定在 (\d{4})-(\d\d-\d\d)、(\d\d-\d\d)/); return m?[m[1]+'-'+m[2],m[1]+'-'+m[3]]:[]; })();
const KAI=rows(part('## 3.','## 4.')).filter(r=>/^[1-4]$/.test(r[0])).map(r=>orig(r[1]).split('／'));
const FK={'情人節':'vday','白色情人節':'white','三月十四':'white','七夕':'qixi','生日':'bday','聖誕':'xmas'};
const tab4=t=>{ const o={}; for(const r of rows(t)) if(FK[r[0]]) o[FK[r[0]]]=orig(r[1]).split('／'); return o; };
const AN_BY=tab4(part('### 4-2','### 4-3')), PS_BY=tab4(part('### 4-3','### 4-4'));
const TM={'大一下':'Y1S2','大二上':'Y2S1','大二下':'Y2S2','大三上':'Y3S1','大三下':'Y3S2','大四上':'Y4S1','大五上':'Y5S1'}, KXT={}; for(const r of rows(part('## 5.','## 6.'))) if(TM[r[0]]) KXT[TM[r[0]]]=[r[1],r[2]];
const T6=rows(part('## 6.','## 7.')).filter(r=>r.length>=3&&r[0]!=='哪裡');
const AN='heroine_01', PS='classmate_peishan', ZR='heroine_02';
let doc9=''; try{ doc9=cp.execSync('git show cb5caad65:"docs/story_planning/AA_460_法律系大二上讀一遍_沛珊重考每晚一則_節日邀約_手機上限.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc9=''; }   /* 第 9 節：回 LAWWW-B 的施工問題（企劃線 cb5caad65）*/
const P9=(()=>{ const i=doc9.indexOf('## 9.'); return i<0?'':doc9.slice(i); })();
const AN_BY4=Object.fromEntries(Object.entries(AN_BY).filter(([k])=>k!=='bday'));   /* 第 9 節：4-2 生日那一列當作沒有，其他四列照表 */

(async()=>{
/* ---- 0 讀稿、資料照稿 ---- */
await sec(0,()=>{
  check('0. 讀得到稿、檔都載得到（FEST、DATE_WISH）',!!doc&&!loadErr.length&&typeof FEST!=='undefined'&&typeof DATE_WISH!=='undefined',J(loadErr));
  check('0. 稿裡的都讀得到（短句 4、每月第一個週日 1、2-3 共 32 句（有日子的 9 句）、考試兩天、第 3 節四次、4-2、4-3 各五個節日、第 5 節七個學期、第 6 節兩句）',
    SHORT.length===4&&!!SUN&&ROWS.length===32&&ROWS.filter(r=>r[2]).length===9&&ROWS.filter(r=>r[2]).every(r=>D(r[2])!=null)&&J(EXAM)===J(['2027-07-10','2027-07-11'])&&KAI.length===4&&KAI.every(x=>x.length===2)&&Object.keys(AN_BY).length===5&&Object.keys(PS_BY).length===5&&Object.keys(KXT).length===7&&T6.length===2,
    J({SHORT,SUN,ROWS:ROWS.length,EXAM,KAI:KAI.length,AN:Object.keys(AN_BY),PS:Object.keys(PS_BY),KXT:Object.keys(KXT),T6:T6.length}));
  check('0. STORY.PS_KEEP_ROWS＝2-3 的表（月、句子、日子，照稿的順序）',J((STORY.PS_KEEP_ROWS||[]).map(r=>[r[0],r[1],r[2]||null]))===J(ROWS),J((STORY.PS_KEEP_ROWS||[]).length));
  check('0. STORY.PS_KEEP_SHORT＝2-2 的四句短句、PS_KEEP_SUN＝「'+SUN+'」、PS_EXAM＝'+EXAM.join('、'),J(STORY.PS_KEEP_SHORT)===J(SHORT)&&STORY.PS_KEEP_SUN===SUN&&J(STORY.PS_EXAM)===J(EXAM));
  check('0. 第 9 節讀得到：4-3 沛珊在臺北「當作沒有」、4-2 以安「生日」那一列當作沒有、其他四列照表',/4-3 沛珊在臺北的節日邀約：當作沒有/.test(P9)&&/4-2 以安「生日」那一列也當作沒有/.test(P9)&&/其他四列照表/.test(P9),P9.slice(0,120));
  check('0. fest_events：以安 ask.by＝4-2 扣掉生日那一列（四個節日）、沛珊沒有 ask.by（第 9 節）',J((FEST_DATA.PEOPLE[AN].ask||{}).by)===J(AN_BY4)&&Object.keys(AN_BY4).length===4&&(FEST_DATA.PEOPLE[PS].ask||{}).by===undefined,J([(FEST_DATA.PEOPLE[AN].ask||{}).by,(FEST_DATA.PEOPLE[PS].ask||{}).by]));
  const bad=Object.keys(KXT).filter(t=>{ const L=TERMEND_LINES.KX[t].invite, [now,to]=KXT[t]; return to.startsWith('照舊')?!L.includes(now):!(L.includes(to)&&!L.includes(now)); });
  check('0. termend_lines 可昕 KX[學期].invite＝第 5 節（大二上～大五上那一句加 {哪天}；大一下照舊）',!bad.length,J(bad.map(t=>[t,TERMEND_LINES.KX[t].invite])));
});

/* ---- 2 沛珊重考消失期：每晚一則 ---- */
const P=STORY.psKeepPlan?STORY.psKeepPlan():{}, d0=D('2026-12-18'), d1=D('2027-08-06'), L=d=>P[d], K=k=>P[D(k)];
await sec(2,()=>{
  const nights=[]; for(let d=d0;d<d1;d++) nights.push(d);
  check('2. 每晚一句：2026-12-18～2027-08-05 共 '+nights.length+' 晚都有（8/6 放榜那天白天講）',nights.length===231&&nights.every(d=>typeof P[d]==='string'&&P[d])&&Object.keys(P).length===231,J(Object.keys(P).length));
  const cnt={}; for(const d of nights) cnt[P[d]]=(cnt[P[d]]||0)+1;
  check('2. 2-3 的 32 句每句剛好一次（原本一句將近四十次）',ROWS.every(r=>cnt[r[1]]===1),J(ROWS.filter(r=>cnt[r[1]]!==1).map(r=>[r[1],cnt[r[1]]])));
  const OLD6=['今天寫完兩回考古題。地理還是最爛。','我媽煮了一大鍋湯，說喝完才可以去念書。','晚安。今天念書念到一半，有想到你。','模擬考的分數出來了。先不要問。','窗外下雨了。台中很少下這麼大。','今天沒有念完。明天補。晚安。'];
  check('2. 原本六句都還在（2-3 四句、短句一句、每月第一個週日一句）',OLD6.every(t=>cnt[t]>=1),J(OLD6.map(t=>cnt[t])));
  const dated=ROWS.filter(r=>r[2]);
  check('2. ① 有日子的那天用那一句（12/31 煙火、除夕、初一、3/15 生日、母親節、端午、7/9 考前一晚、7/11 考完、8/5 放榜前一晚…）',dated.every(r=>K(r[2])===r[1]),J(dated.filter(r=>K(r[2])!==r[1]).map(r=>[r[2],K(r[2])])));
  const firstSun=nights.filter(d=>wdOf(d)===0&&CALENDAR.dateOf(d).d<=7);
  check('2. ④ 每個月第一個週日「'+SUN+'」（一個月一次：1/3、2/7、3/7、4/4、5/2、6/6、7/4、8/1），其他晚上沒有',firstSun.length===8&&firstSun.every(d=>P[d]===SUN)&&cnt[SUN]===8,J(firstSun.map(keyOf)));
  /* ② 週六：那個月還沒用過的下一句（照表的順序）*/
  const sat=nights.filter(d=>wdOf(d)===6&&!dated.some(r=>r[2]===keyOf(d))), monRows=m=>ROWS.filter(r=>r[0]===m&&!r[2]).map(r=>r[1]);
  const satOk=sat.filter(d=>{ const x=CALENDAR.dateOf(d), M=monRows(x.m); return M.includes(P[d])||(x.m===7&&x.d===31&&P[d]===monRows(8)[0])||STORY.PS_KEEP_SHORT.includes(P[d]); }).length===sat.length;
  const order=[12,1,3,4,5,6].every(m=>{ const got=sat.filter(d=>CALENDAR.dateOf(d).m===m).map(d=>P[d]).filter(t=>monRows(m).includes(t)); return J(got)===J(monRows(m)); });
  check('2. ② 週六用那個月還沒用過的下一句，照表的順序（12 月、1 月、3～6 月照順序用完；用完了＝短句）：12/19「'+K('2026-12-19')+'」、1/2「'+K('2027-01-02')+'」、7/3「'+K('2027-07-03')+'」（稿：7 月「剩一個禮拜」排在 7/3）',
    satOk&&order&&K('2026-12-19')===monRows(12)[0]&&K('2026-12-26')===monRows(12)[1]&&K('2027-01-02')===monRows(1)[0]&&K('2027-01-23')===monRows(1)[3]&&K('2027-01-30')===STORY.PS_KEEP_SHORT.find(t=>t===K('2027-01-30'))&&K('2027-07-03')===monRows(7)[0],J(sat.map(d=>[keyOf(d).slice(5),P[d]])));
  const sh=nights.filter(d=>STORY.PS_KEEP_SHORT.includes(P[d])), adj=nights.filter((d,i)=>i>0&&STORY.PS_KEEP_SHORT.includes(P[d])&&P[d]===P[d-1]);
  check('2. ③ 其他晚上短句四句輪、不跟前一晚同一句（'+sh.length+' 晚；四句各 '+STORY.PS_KEEP_SHORT.map(t=>cnt[t]).join('／')+' 次）',!adj.length&&STORY.PS_KEEP_SHORT.every(t=>cnt[t]>=40)&&sh.length+32+8===231,J(adj.map(keyOf)));
  /* 子代理判斷（稿的排法會碰到、稿沒寫的）*/
  check('2. 子代理判斷：7/10（週六）是考試第一天＝短句（不是「考完以後，我睡了十四個小時。」）；7 月考完的兩句 7/17、7/24',STORY.PS_KEEP_SHORT.includes(K('2027-07-10'))&&K('2027-07-17')===monRows(7)[1]&&K('2027-07-24')===monRows(7)[2],J([K('2027-07-10'),K('2027-07-17'),K('2027-07-24')]));
  check('2. 子代理判斷：「你們開學了吧」等大二下開學（2027-02-22）以後＝2/27；2/13 先用「我媽還是去拜拜了」；2/20 短句',K('2027-02-27')===monRows(2)[0]&&K('2027-02-13')===monRows(2)[1]&&STORY.PS_KEEP_SHORT.includes(K('2027-02-20'))&&keyOf(STORY.termDay('Y2S2',1,1))==='2027-02-22',J([K('2027-02-13'),K('2027-02-20'),K('2027-02-27')]));
  check('2. 子代理判斷：8 月「'+monRows(8)[0]+'」8/6 放榜以前沒有週六＝放在 7/31（前一個月最後一個空著的週六）',K('2027-07-31')===monRows(8)[0]);
  /* 手機實際收到 */
  const setup=k=>{ const G=fresh(k,8,{dating_classmate_peishan:true}); G.flags.romance={[PS]:{status:'dating',sinceDay:d0-30}}; const r=SOCIAL.rel(PS); Object.assign(r,{fam:30,trust:20,comf:20}); SOCIAL.remember(PS,'FIRST_MET',''); G.contacts[PS]=d0-100; return G; };
  const night=k=>{ setup(k); STORY.phoneRules(GM); H.G.hour=23.9; PHONE.tick(H.G); return byTag('ps_keep_'+D(k)); };
  const keys=['2026-12-31','2027-01-02','2027-01-03','2027-01-04','2027-03-15','2027-07-09','2027-08-05'], got=keys.map(k=>{ const m=night(k); return {k,t:m.map(x=>x.text),h:m.map(x=>x.h),ok:m.length===1&&m[0].th==='p:'+PS&&m[0].from===PS&&m[0].h>=23&&m[0].h<23.6&&m[0].text===K(k)}; });
  check('2. 手機（交往中、消失期）：每晚 23:00 以後她傳的那一則＝排好的那句（12/31 煙火、1/2 週六、1/3 第一個週日、1/4 短句、3/15 生日、7/9、8/5）；tag ps_keep_<日>',got.every(g=>g.ok)&&H.G.flags.PS_KEPT===true,J(got.filter(g=>!g.ok)));
  setup('2027-03-15'); H.G.flags.PS_KEEP_N=37; H.G.msgs.push({day:D('2027-03-14'),h:23.2,th:'p:'+PS,from:PS,text:'模擬考的分數出來了。先不要問。',tag:'ps_keep_'+D('2027-03-14')}); STORY.phoneRules(GM); H.G.hour=23.9; PHONE.tick(H.G);
  check('2. 舊存檔（PS_KEEP_N＝37、昨晚用舊的輪法收過）：今晚照日子挑（3/15 生日那一句），昨晚那則不重發',byTag('ps_keep_'+D('2027-03-15')).map(m=>m.text).join('|')===K('2027-03-15')&&byTag('ps_keep_'+D('2027-03-14')).length===1);
  { const G=fresh('2027-03-15',8,{}); const r=SOCIAL.rel(PS); Object.assign(r,{fam:30,trust:20,comf:20}); G.contacts[PS]=d0-100; STORY.phoneRules(GM); G.hour=23.9; PHONE.tick(G);
    check('2. 沒交往：照舊沒有',!thread('p:'+PS).length); }
});

/* ---- 3 阿凱的泡麵評鑑表 ---- */
await sec(3,()=>{
  const dp=(STORY.DAILY_PHONE||[]).find(x=>x.id==='kai_sheet');
  const it=n=>dp?dp.items(H.G,n).map(x=>x.text):null; fresh('2026-09-29',9,{});
  check('3. 照第幾次換四種：第 1 次原句「'+KAI[0].join('」「')+'」、第 2～4 次各自那兩則（口氣、標點照稿）',!!dp&&[0,1,2,3].every(n=>J(it(n))===J(KAI[n])),J([0,1,2,3].map(it)));
  check('3. 每則照舊兩則、照舊隔一分鐘、私訊 p:kai；最多四次（max 4）',!!dp&&dp.max()===4&&[0,1,2,3].every(n=>{ const L=dp.items(H.G,n); return L.length===2&&L.every(x=>x.th==='p:kai'&&x.from==='kai')&&L[1].dt>L[0].dt; }));
  /* 真的從每天的手機小事送出：舊存檔收過兩次（dpN.kai_sheet＝2）→ 這次是第 3 種 */
  const d=D('2026-11-24'); fresh(d,21,{}); H.FAMILIAR('kai'); const F=H.G.flags; F.dpDay=d; F.dpN={kai_sheet:2}; F.dpPick={id:'kai_sheet',day:d}; at(d,21.85); STORY.phoneRules(GM); at(d,21.95); PHONE.tick(H.G);
  const got=(H.G.msgs||[]).filter(m=>/^dp_kai_sheet_2_/.test(m.tag||'')).map(m=>m.text);
  check('3. 每天的手機小事真的送出（舊存檔收過兩次＝dpN 2）：第 3 種「'+KAI[2].join('」「')+'」；tag dp_kai_sheet_2_<k> 照舊',J(got)===J(KAI[2])&&F.dpN.kai_sheet===3,J([got,F.dpN]));
});

/* ---- 4 節日邀約 ---- */
const dating=(id,k)=>{ const G=fresh(k,21.05); const r=SOCIAL.rel(id); Object.assign(r,{fam:65,trust:50,comf:45,npcRom:60,rom:35}); SOCIAL.remember(id,'FIRST_MET',''); INV.addContact(G,id); G.contacts[id]=G.day-60; G.flags['dating_'+id]=true; ROM.get(G,id).status='dating'; return G; };
const dm=id=>(H.G.msgs||[]).filter(m=>m.th==='p:'+id&&m.from===id).map(m=>m.text);
await sec(4,()=>{
  const K5=['vday','white','qixi','bday','xmas'];
  const K4=['vday','white','qixi','xmas'], AL=FEST_DATA.PEOPLE[AN].ask.lines, PL=FEST_DATA.PEOPLE[PS].ask.lines, old=(L,k)=>L.map((t,i)=>i===0&&k!=='vday'?t.replace('情人節',FEST.name(k)):t);
  check('4-2. 以安 herLines 照節日換整組（情人節原句；白色情人節「手帳上這一格」、七夕「農曆的日子」、聖誕「穿暖一點」）',K4.every(k=>J(FEST.herLines(AN,k,false))===J(AN_BY[k])),J(K4.map(k=>FEST.herLines(AN,k,false))));
  check('4-2. 以安生日那一列當作沒有（第 9 節）：沒有「'+AN_BY.bday.join('」「')+'」，照原本（第一句換節日名）',J(FEST.herLines(AN,'bday',false))===J(old(AL,'bday'))&&!AN_BY.bday.some(t=>FEST.herLines(AN,'bday',false).includes(t)),J(FEST.herLines(AN,'bday',false)));
  check('4-3. 沛珊在臺北（不是 home）那張當作沒有（第 9 節）：照原本（第一句換節日名、第二句「'+PL[1]+'」），沒有 4-3 的第二句',K5.every(k=>J(FEST.herLines(PS,k,false))===J(old(PL,k)))&&!K5.some(k=>k!=='vday'&&FEST.herLines(PS,k,false).some(t=>PS_BY[k].includes(t))),J(K5.map(k=>FEST.herLines(PS,k,false))));
  const OLD3='明天你要下來嗎？……不用勉強。', hm=c=>K5.map(k=>FEST.herLines(PS,k,true,c));
  check('4-3. 沛珊回家（home）照舊：台中情人節、七夕 homeBy，三月十四、聖誕在台南 homeBy，其他＝homeLines「'+OLD3+'」（AA_457 3-1，不看 by）',J(hm('台南'))===J([[OLD3],[FEST_DATA.PEOPLE[PS].ask.homeBy.white['台南'][0]],[OLD3],[OLD3],[FEST_DATA.PEOPLE[PS].ask.homeBy.xmas['台南'][0]]])&&J(hm('台中'))===J([[FEST_DATA.PEOPLE[PS].ask.homeBy.vday['台中'][0]],[OLD3],[FEST_DATA.PEOPLE[PS].ask.homeBy.qixi['台中'][0]],[OLD3],[OLD3]]),J([hm('台南'),hm('台中')]));
  /* 手機：交往中、前一天 21:00 */
  const flow=(id,k,y)=>{ const d=FEST.dayOf(id,k,y); dating(id,keyOf(d-1)); FEST.phone(H.G); PHONE.tick(H.G); const m=PHONE.byAsk(H.G,'fest_ask_'+id+'_'+k+'_'+y); return {t:dm(id),o:m?m.ask.opts.map(o=>o.t):null}; };
  const aw=flow(AN,'white',2026), ax=flow(AN,'xmas',2026), aq=flow(AN,'qixi',2026), px=FEST.HER_K.flatMap(k=>FEST.years(PS,k).map(y=>{ const r=flow(PS,k,y), W=FEST.where(H.G,PS,k,y,FEST.dayOf(PS,k,y))||{}; return {k,y,t:r.t,w:W.mode+(W.fixed?'(固定)':'')+(W.city||'')}; }));   /* 沛珊每個她約的節日 */
  check('4. 手機（交往中，前一天 21:00）：以安 2026 白色情人節、七夕、聖誕＝4-2 那一組；選項「好。」「那天不行。」照舊、tag fest_ask_<她>_<節日>_<年> 照舊',
    J(aw.t)===J(AN_BY.white)&&J(aq.t)===J(AN_BY.qixi)&&J(ax.t)===J(AN_BY.xmas)&&[aw,ax,aq].every(r=>J(r.o)===J(['好。','那天不行。'])),J({aw,aq,ax}));
  const PSB=[].concat(...Object.values(PS_BY));
  check('4-3. 沛珊（子代理查的，回報給 AA）：2025～2029 每個她約的節日都在老家／台南（homeBy／homeLines）、固定的那一場（2026 三月十四映月湖）或重考消失期——4-3 的臺北版現在不會從手機發出；回家的句子照舊',px.length>=12&&px.every(r=>!r.t.some(t=>PSB.includes(t)&&!['明天是情人節！！'].includes(t)))&&px.filter(r=>r.t.length).every(r=>/^home/.test(r.w)),J(px.map(r=>[r.k,r.y,r.w,r.t[0]||''])));
  /* 稿 4-2 的問題：以安 2027 生日（中秋，noonOnly）herAsks 會不會發？ */
  const y=2027, bd=FEST.dayOf(AN,'bday',y), cell=FEST.cell(AN,'bday')||{}; dating(AN,keyOf(bd-1)); FEST.phone(H.G); PHONE.tick(H.G); at(bd,11); FEST.phone(H.G); PHONE.tick(H.G);
  const anyBday=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05',PS,'kexin'].some(id=>(H.G.msgs||[]).some(m=>/^fest_ask_.*_bday_/.test(m.tag||'')));
  check('4-2. 稿問「以安 2027 生日 herAsks 會不會發」：不會——herAsks 只跑 FEST.HER_K（情人節、白色情人節、七夕、聖誕），生日不是她約（2027 中秋 noonOnly 那年前一天 21:00、當天都沒有 fest_ask_heroine_01_bday_2027）＝不用改中午版',
    J(FEST.HER_K)===J(['vday','white','qixi','xmas'])&&(cell.noonOnly||[]).includes(y)&&CALENDAR.fest(bd)==='中秋'&&!byTag('fest_ask_'+AN+'_bday_'+y).length&&!anyBday&&!dm(AN).some(t=>AN_BY.bday.includes(t)),J({bd:keyOf(bd),dm:dm(AN)}));
  dating(PS,'2027-12-23'); H.G.msgs.push({day:D('2027-12-23'),h:21,th:'p:'+PS,from:PS,text:'明天是聖誕節！！',tag:'fest_ask_'+PS+'_xmas_2027'}); FEST.phone(H.G); PHONE.tick(H.G);
  check('4. 舊存檔（那一則已經用舊的字收過）：不重發',byTag('fest_ask_'+PS+'_xmas_2027').length===1);
});

/* ---- 5 可昕的學期末邀約：寫哪一天 ---- */
await sec(5,()=>{
  check('5. TERMEND.dayWord：同一天「今天」、隔天「明天」、其他「禮拜幾」；fillDay 排不到日子＝拿掉 {哪天}',!!TERMEND.dayWord&&TERMEND.dayWord(100,100)==='今天'&&TERMEND.dayWord(100,101)==='明天'&&TERMEND.dayWord(D('2026-12-24'),D('2026-12-26'))==='禮拜六'&&TERMEND.dayWord(D('2026-12-24'),D('2026-12-27'))==='禮拜日'&&TERMEND.fillDay('{哪天} 河堤 五點半','')==='河堤 五點半'&&TERMEND.fillDay('這次換山上 {哪天} 木柵大學正門六點','明天')==='這次換山上 明天 木柵大學正門六點');
  fresh(D('2026-12-24'),20.9,{dating_kexin:true}); run(20.9,21); const q=OUT.get(H.G,'te_kx_Y2S1'), m=byTag('te_kx_Y2S1').map(x=>x.text), want=TERMEND_LINES.KX.Y2S1.invite.map(t=>t.replace('{哪天}','禮拜六'));
  check('5. 大二上：12/24 20:45 可昕「'+want.join('」「')+'」（約會 12/26 週六木柵大學正門 18:00；原本「這次換山上 木柵大學正門六點」讀起來像今天）',!!q&&q.day===D('2026-12-26')&&q.h===18&&J(m)===J(want)&&m[1]==='這次換山上 禮拜六 木柵大學正門六點',J([m,q&&keyOf(q.day)]));
  fresh(D('2026-06-11'),20.5,{dating_kexin:true}); run(20.5,21); const m1=byTag('te_kx_Y1S2').map(x=>x.text);
  check('5. 大一下照舊：「期末考完了吧」「禮拜五 河堤 五點半」「我帶你去吃那家」',J(m1)===J(TERMEND_LINES.KX.Y1S2.invite),J(m1));
  const bad=[]; for(const t of ['Y2S2','Y3S1','Y3S2','Y4S1']){ const w=TERMEND.windowOf(t); if(!w){ bad.push(t+' 沒有時段'); continue; } fresh(w.from,20.5,{dating_kexin:true,EXCHANGE_ROUTE:'TW'}); for(let d=w.from;d<=w.from+4;d++){ at(d,20.5); run(20.5,21); }   /* 傳的那天＝時段第一天或玩家考完回來那天（P.back）*/ const ms=byTag('te_kx_'+t), qq=OUT.get(H.G,'te_kx_'+t);
    if(!ms.length||!qq){ bad.push(t+' 沒有邀約或出遊'); continue; } const dw=TERMEND.dayWord(ms[0].day,qq.day), exp=TERMEND_LINES.KX[t].invite.map(x=>x.replace('{哪天}',dw)); if(J(ms.map(x=>x.text))!==J(exp)||ms.some(x=>/\{哪天\}/.test(x.text))) bad.push([t,ms.map(x=>x.text),exp]); }
  check('5. 大二下、大三上、大三下、大四上：那一句照約會那天換（今天／明天／禮拜幾），手機上沒有 {哪天}',!bad.length,J(bad));
  fresh(D('2026-12-24'),20.9,{dating_kexin:true}); H.G.msgs.push({day:D('2026-12-24'),h:20.75,th:'p:kexin',from:'kexin',text:'考完了！',tag:'te_kx_Y2S1'}); run(20.9,21);
  check('5. 舊存檔（已經收過舊的邀約）：不重發',byTag('te_kx_Y2S1').length===1);
});

/* ---- 6 芷若光典影展兩句 ---- */
await sec(6,()=>{
  const I=(DATE_WISH.events[ZR]||{}).herInvite||{}, all=J(DATE_WISH.events[ZR]);
  check('6. 邀約第三句「'+T6[0][2]+'」（原本「'+T6[0][1]+'」）',(I.lines||[]).some(x=>x.text===T6[0][2])&&!all.includes(T6[0][1]),J((I.lines||[]).map(x=>x.text)));
  check('6. 回「好」之後「'+T6[1][2]+'」（原本「'+T6[1][1]+'」）',(I.accept||[]).some(x=>x.text===T6[1][2])&&!all.includes(T6[1][1]),J((I.accept||[]).map(x=>x.text)));
  check('6. 兩句已經改進原稿（AA_460 第 9 節，wish_bb.json@cb5caad65；10-27 AA_475 換到 ab9d70fe0）：DATE_WISH 來源是 ab9d70fe、沒有暫代換字、原稿對不到 0 句',/wish_bb\.json@ab9d70fe/.test(DATE_WISH.source)&&!(DATE_WISH.verify.replaced||[]).length&&(DATE_WISH.verify.miss||[]).length===0,J([DATE_WISH.source,DATE_WISH.verify.replaced]));
});
H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });
