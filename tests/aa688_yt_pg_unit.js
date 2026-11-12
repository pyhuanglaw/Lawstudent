// AA_688（企劃線 7cc729232＝8dce2f94c 加第 6 節；AA-C 定 D109；任務 CANON-PURGE-SRC-1104）語彤畢業以後還留著的舊設定（延畢、2030 才考、麵店）——不需要瀏覽器。
//   現行設定（AA_629）：語彤 2029-06-02 和祐廷同一天畢業、2029 年考律師（一試 9/7 放榜過、二試 12/14 放榜上了），2030-08 起在事務所當律師，週末回一盞茶屋。
//   1  第 2 節：pg_dates.js 語彤十八格逐字＝表上「改成」（2029-08 照留）、事件裡她說的那一句一樣；2029-10「事務所的實習……」搬到 2030-03（字不動）；
//      AA_367@8dce2f94c 第 3 節＝AA_688 第 2 節；白名單 AA_367 換到 8dce2f94c（history 留 1ebcf530）；照白名單重跑 import_pg_dates.py＝現在的 pg_dates.js（沒有手改）；
//      其他五位、可昕的格子和開發分支 3666310f8 一樣
//   2  第 2 節方式：週六 17:30 一盞茶屋（地點字幕、出遊標題「一盞茶屋」）；6/9 17:00 問出發 → 字幕＋她 2029-06 那一句
//   3  第 3 節：「一試過了。」2029-09-07 15:10、「上了。」「蘇姨已經在寫紅紙了。」2029-12-14 15:10（桌遊團，排在阿哲「放榜了」那幾則後面）；2030-09-06、2030-12-13 沒有她那兩則；
//      R2_2030.yt 紅紙兩句（阿哲那一句照接）、FIRST.friends 語彤（2030-10-01 那一場真的傳）、B1_2030.yt 照留
//   4  第 4 節：多段感情《今天不用幫忙》REPAIR.heroine_03 六處；舊字都不在 MULTIREL_LINES；talk1、ask、結果 B、D 真的演
//   5  第 6 節：R2_2030.base 旁白「（燒臘店的長桌。…）」；2030 放榜那一頓的出遊卡片「出發：公館燒臘・長桌」（place、title 照 2029 那一頓）、演出來是新旁白
//   6  舊存檔：已經收過 2030 那兩則的不再收、原本的留著；2029-09-07／12-14 之後 48 小時內讀檔＝補一次（不重複）；過了 48 小時＝不補（不會到 2030 才收到）
//   （第 5 節 AA_530 語彤那一列：AA530-PG-CONFESS-1030 還沒做（待開工、要新的停點），這裡不測）
// 修改前（開發分支 3666310f8）：FAILED 30（共 36 項；照樣通過的 6 項＝載入、源稿和 AA_688 對得上、重跑匯入＝檔案、其他五位不動、B1_2030 照留、已經收過 2030 那兩則的舊存檔）；修改後 ALL PASS。
// 期待值一律從 git 讀企劃線的稿（AA688_DOC_REPO＝讀稿的 repo，預設這個 repo）。用法：node tests/aa688_yt_pg_unit.js
'use strict';
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H, J=JSON.stringify;
const REPO=process.env.AA688_DOC_REPO||H.ROOT;
const SHEET_SHA='7cc729232', SHEET='docs/story_planning/AA_688_語彤畢業以後的舊設定_延畢2030考試麵店.md';
const P367='docs/story_planning/AA_367_畢業以後的交往節奏_六位.md', SHA367='8dce2f94c', OLD367='1ebcf530', BASE='3666310f8';
const git=(sha,p)=>{ try{ return cp.execFileSync('git',['-C',REPO,'show',sha+':'+p],{encoding:'utf8',maxBuffer:64*1024*1024}); }catch(e){ return ''; } };
/* ---------- 載入（同 tests/aa367_pg_dates_unit.js、tests/mrel_aa429_aa185_unit.js）---------- */
const NAMES=/^(NOODLE_CLOSED|R2Y4B|R2Y4B_EVENTS|Y5|PG_DATES|PGDATE|MREL|MULTIREL_LINES|HV|HOMETOWN_LINES)$/;
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.ZRUK={W_FROM:'2028-09-01',playW:async()=>'orig'};
{ const adv=fs.readFileSync(path.join(H.ROOT,'src/adv3d.js'),'utf8'), m=/^const CG_REGISTRY=(\{.*\});/m.exec(adv); global.CG_REGISTRY=m?vm.runInThisContext('('+m[1]+')'):{}; }
let loadErr='';
for(const f of ['src/noodle_closed3d.js','src/data/r2y4b_events.js','src/r2y4b3d.js','src/y5s1_3d.js','src/data/pg_dates.js','src/pgdates3d.js','src/data/hometown_lines.js','src/hometown3d.js','src/data/multirel_lines.js','src/multirel3d.js']){
  try{ if(fs.existsSync(path.join(H.ROOT,f))) load(f); }catch(e){ loadErr+=f+'：'+String(e&&e.message||e)+'；'; } }
const X=()=>typeof MREL!=='undefined'?MREL:null, Lm=()=>MULTIREL_LINES, L=()=>POSTGRAD_LINES;
const caps=[]; GM.caption=(a,b)=>{ caps.push(b); };
const D=k=>PG.DK(k), lab=(d,h)=>PG.dateLabel(d,h);
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const YT='heroine_03', KX='kexin';
/* ---------- 稿 ---------- */
const doc=git(SHEET_SHA,SHEET), doc367=git(SHA367,P367);
const part=(t,a,b)=>{ const i=t.indexOf('\n## '+a+'.'); if(i<0) return ''; const j=b?t.indexOf('\n## '+b+'.',i+1):-1; return t.slice(i,j<0?undefined:j); };
const rows=s=>s.split('\n').filter(l=>/^\|/.test(l)&&!/^\|-/.test(l)).map(l=>l.trim().replace(/^\||\|$/g,'').split('|').map(x=>x.trim()));
const S2=rows(part(doc,2,3)).filter(r=>/^20\d\d-\d\d$/.test(r[0]));   /* [月, 原本, 改成] */
const S3=rows(part(doc,3,4)), S4=rows(part(doc,4,5)), S6=rows(part(doc,6));
const row=(R,k)=>R.find(r=>r[0].includes(k))||[];
const sl=s=>String(s||'').split('／');
const NEW2={}; for(const r of S2) NEW2[r[0]]=r[2]==='照留'?r[1]:r[2];   /* 照留＝原本那一句（2029-08）*/
const DOC367={}; { let on=false; for(const l of doc367.split('\n')){ if(/^## /.test(l)){ on=/（heroine_03）\s*$/.test(l); continue; } const m=on&&l.match(/^\| (20\d\d-\d\d) \| 「(.*)」 \|$/); if(m) DOC367[m[1]]=m[2]; } }
/* ---------- 存檔 ---------- */
const graduated=G=>{ G.flags.GRADUATED=PG.gradDay(); PG.rec(G).done.grad=1; };
const freshPG=(key,h,flags,who)=>{ const G=H.fresh(key,h,'dorm',Object.assign({MOVED_OUT:D('2029-06-28'),HOME_AFTER:'home',Y4_PATH:'other',PACKED_Y4:D('2029-06-01'),ROOM_Y2:true,ROOM_Y3:true,ROOM_Y4:true},flags||{}));
  G.acts={att:{}}; G.outings=[]; G.flags.GRADUATED=PG.gradDay(); G.flags.GRAD_DONE=true; PG.rec(G).done.grad=1; for(const e of ['ev_grad_family','ev_grad_lunch','ev_grad_envelope','ev_y4_path','ev_move_out_y4']) G.events.done[e]=1;
  for(const id of [].concat(who||[])){ H.FRIEND(id); H.date(id); } caps.length=0; return G; };   /* 同 tests/aa367_pg_dates_unit.js 的 fresh */
const plan=G=>{ const busy=PGDATE.busyDays(G,G.day,D('2030-12-14')), out={}; for(const ym of PGDATE.MONTHS){ const M=PGDATE.sixMonth(G,ym,busy); for(const id in M) (out[id]||(out[id]={}))[ym]=lab(M[id].day,M[id].h); } return out; };
/* 桌遊團裡的存檔（認識語彤、畢業了）*/
const grpSave=(key,h,flags)=>{ const G=H.fresh(key,h,'dorm',Object.assign({},flags||{})); graduated(G); PHONE.join(G,'noodle_team','桌遊團'); H.FAMILIAR(YT); H.FAMILIAR('zhe'); H.FAMILIAR('yu'); return G; };
const ytG=G=>(G.msgs||[]).filter(m=>m.th==='g:noodle_team'&&m.from===YT);   /* 語彤在群組的訊息 */
const grpOn=(G,key)=>(G.msgs||[]).filter(m=>m.th==='g:noodle_team'&&m.day===D(key));
const MSG=tag=>(PG.MSGS||[]).find(m=>m.tag===tag);
const Y1=sl(row(S3,'Y2030.yt1')[1]), Y2=sl(row(S3,'Y2030.yt2')[1]);
(async()=>{
  check('0. 載入 pg_dates.js、pgdates3d.js、multirel_lines.js、multirel3d.js；讀得到企劃線 '+SHEET_SHA+' 的 AA_688（第 2 節 18 列、第 3 節 5 列、第 4 節 6 列、第 6 節 2 列）、'+SHA367+' 的 AA_367（語彤 18 句）',
    !loadErr&&typeof PG_DATES!=='undefined'&&typeof PGDATE!=='undefined'&&!!X()&&S2.length===18&&S3.length===6&&S4.length===7&&S6.length===3&&Object.keys(DOC367).length===18,loadErr+J([S2.length,S3.length,S4.length,S6.length,Object.keys(DOC367).length]));
  /* ---------------- 1. 第 2 節：每月格子 ---------------- */
  await sec(1,async()=>{
    const cells=(PG_DATES.six||{})[YT]||[], bad=[];
    for(const r of S2){ const c=cells.find(x=>x.ym===r[0]); if(!c||c.line!==NEW2[r[0]]) bad.push(r[0]+' 資料'); const ev=STORY_EVENTS.find(e=>e.id==='ev_pg_date_'+YT+'_'+r[0]), ln=ev&&ev.dialogue.find(l=>l.speaker===YT); if(!ln||ln.text!==NEW2[r[0]]) bad.push(r[0]+' 事件'); }
    check('1. pg_dates.js 語彤十八格＝AA_688 第 2 節「改成」一字不差（2029-08 照留）、事件裡她說的那一句一樣；沒有多出表上沒有的月份',!bad.length&&cells.length===18&&cells.every(c=>NEW2[c.ym]!=null),bad.join('、'));
    const chg=S2.filter(r=>r[2]!=='照留'), was=r=>r[1].replace(/（.*$/,'').split('……').filter(Boolean)[0]||'', same=chg.filter(r=>{ const c=cells.find(x=>x.ym===r[0]); return !c||!was(r)||c.line.includes(was(r)); });
    check('1. 換掉的十七個月，那個月都不是原本那一句（延畢、2030 才考、阿姨的店）；語彤的格子裡沒有阿姨、乾麵、店休、延畢、「最後一個學期」「國考我要考」',chg.length===17&&!same.length&&!cells.some(c=>/阿姨|乾麵|店休|延畢|最後一個學期|國考我要考/.test(c.line)),J(same.map(r=>r[0]))+J(cells.filter(c=>/阿姨|乾麵|店休|延畢|最後一個學期|國考我要考/.test(c.line)).map(c=>c.ym)));
    const c10=cells.find(x=>x.ym==='2029-10'), c03=cells.find(x=>x.ym==='2030-03');
    check('1. 2029-10「事務所的實習……」搬到 2030-03、字不動（她 2029-10 在準備二試）：2030-03＝「事務所的實習，第一天就跟去開庭。…」；2029-10 換成二試前的那一句',!!c03&&/^事務所的實習，第一天就跟去開庭。/.test(c03.line)&&/字不動/.test(part(doc,2,3))&&!!c10&&!/事務所/.test(c10.line)&&/^二試前兩個禮拜/.test(c10.line),J([c10,c03]));
    check('1. AA_367@'+SHA367+' 第 3 節（源稿）十八句＝AA_688 第 2 節「改成」',S2.every(r=>DOC367[r[0]]===NEW2[r[0]]),J(S2.filter(r=>DOC367[r[0]]!==NEW2[r[0]]).map(r=>r[0])));
    const A=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')), e=(A.files||[]).filter(x=>x.path===P367);
    check('1. 白名單：AA_367 一筆、approved、sha '+SHA367+'（approvedBy、task CANON-PURGE-SRC-1104）；history 第一筆是原本的 '+OLD367+'；pg_dates.js 的 source 寫 @'+SHA367,
      /* 11-08 AA_593 學姊①b（企劃線 9aa8ec40c）以後白名單是 9aa8ec40c：AA_688 那一版（SHA367）留在 history；語彤那一節兩版一樣（上一項對的是 SHA367 的稿） */
      e.length===1&&e[0].status==='approved'&&(e[0].sha===SHA367||(e[0].history||[]).some(y=>y.sha===SHA367))&&!!e[0].approvedBy&&e[0].task==='CANON-PURGE-SRC-1104'&&((e[0].history||[])[0]||{}).sha===OLD367&&(PG_DATES.source||{}).AA_367===P367+'@'+e[0].sha,J(e.map(x=>[x.sha,x.status,x.task,(x.history||[]).map(y=>y.sha)])));
    /* 照白名單重跑匯入工具（寫檔攔下來，不改 repo 裡的檔）＝現在的 pg_dates.js */
    const PY=["import builtins,io,os,sys","ROOT=sys.argv[1]; T=os.path.join(ROOT,'src','data','pg_dates.js'); R=builtins.open; V={}",
      "class W(io.StringIO):","  def __init__(s,p): io.StringIO.__init__(s); s.p=p","  def write(s,x): n=io.StringIO.write(s,x); V[s.p]=s.getvalue(); return n",
      "def fo(p,mode='r',*a,**k):","  if isinstance(p,str) and os.path.abspath(p)==T:","    if 'w' in mode: return W(T)","    if T in V: return io.StringIO(V[T])","  return R(p,mode,*a,**k)",
      "builtins.open=fo; P=os.path.join(ROOT,'tools','story','import_pg_dates.py'); sys.argv=[P]; o=sys.stdout; sys.stdout=io.StringIO()",
      "exec(compile(R(P,encoding='utf-8').read(),P,'exec'),{'__file__':P,'__name__':'__main__'})","sys.stdout=o; print('SAME' if V.get(T)==R(T,encoding='utf-8').read() else 'DIFF')"].join('\n');
    const r=cp.spawnSync('python3',['-c',PY,H.ROOT],{encoding:'utf8',maxBuffer:64*1024*1024});
    check('1. 照白名單重跑 tools/story/import_pg_dates.py 的結果＝現在的 src/data/pg_dates.js（自動產生、沒有手改）',r.status===0&&r.stdout.trim()==='SAME',(r.stdout||'').trim()+(r.stderr||'').split('\n').slice(-3).join(' '));
    let B=null; try{ B=new Function(git(BASE,'src/data/pg_dates.js').replace(/^'use strict';/m,'')+';return PG_DATES;')(); }catch(e){ B=null; }
    const others=['heroine_01','heroine_02','heroine_04'];   /* 學姊後來 AA_593①b（9aa8ec40c）改了，那一節在 aa367_pg_dates_unit 對稿；沛珊 2026-11-11（X327 沛珊重寫，AA_759_peishan_misc2.json@987845b7c） 改了 12 格（ym、note、格數不動，下一條），逐字對稿在 aa367_pg_dates_unit、peishan_dates_1111_unit */
    /* 2026-11-11（X324 G 區，AA_367@4adf447e5）：源稿換版重匯——芷若 2029-12、2030-05、2030-08、2030-11 四格「店長」→「老闆」（2030-05、08 的「她」→「他」）。BASE 的格子先照 AA_367 9aa8ec40c→4adf447e5 那幾格換（BASE 那一格＝舊稿那一格才換）再比；芷若剛好換 4 格。舊期望：三位和 BASE 一字不差 */
    const cell367=sha=>{ const o={}; let who=null; for(const l of git(sha,P367).split('\n')){ const m=l.match(/^## (\d)\. .*（(\w+)）\s*$/); if(m){ who=m[2]; continue; } if(l.startsWith('## ')){ who=null; continue; } const r=l.match(/^\| (20\d\d-\d\d) \| 「(.*)」(（[^）]*）)? \|$/); if(r&&who) (o[who]||(o[who]={}))[r[1]]=r[2]; } return o; };
    const C0=cell367('9aa8ec40c'), C1=cell367('4adf447e5'), fix367=(id,a)=>(a||[]).map(x=>{ const o=(C0[id]||{})[x.ym], n=(C1[id]||{})[x.ym]; return o&&n&&o!==n&&x.line===o?Object.assign({},x,{line:n}):x; });
    const nZR=B?fix367('heroine_02',B.six.heroine_02).filter((x,i)=>x.line!==B.six.heroine_02[i].line).map(x=>x.ym):[];
    check('1. 其他五位（AA_688 第 6 節：對過、沒有要改的）、可昕的格子和開發分支 '+BASE+' 一樣（pg_dates.js 只改了語彤；X324 G 區 AA_367@4adf447e5 芷若四格店長→老闆照稿換過再比）',!!B&&others.every(id=>J(PG_DATES.six[id])===J(fix367(id,B.six[id])))&&J(nZR)===J(['2029-12','2030-05','2030-08','2030-11'])&&J(PG_DATES.kexin)===J({segs:{},slots:[]})/* 可昕畢業以後的格子（AA_366）：CANON-NO-ECON-1112 第三批拿掉 */,others.filter(id=>!B||J(PG_DATES.six[id])!==J(fix367(id,B.six[id]))).join(',')+' '+J(nZR));
    { const a=PG_DATES.six.classmate_peishan, b=B&&B.six.classmate_peishan||[]; check('1. 沛珊的格子（X327 重寫）：17 格、月份和註（視訊／台南）和 '+BASE+' 一樣，只有 12 格的句子不同',a.length===17&&b.length===17&&a.every((x,i)=>x.ym===b[i].ym&&x.note===b[i].note)&&a.filter((x,i)=>x.line!==b[i].line).length===12,J(a.filter((x,i)=>!b[i]||x.line!==b[i].line).map(x=>x.ym))); } });
  /* ---------------- 2. 第 2 節：方式 ---------------- */
  await sec(2,async()=>{
    const md=PGDATE.MODE[(PGDATE.sixMode(YT,'2029-06')||{}).m]||{}, all=PGDATE.MONTHS.map(ym=>PGDATE.sixMode(YT,ym)||{});
    check('2. 方式（稿：「週六 17:30，一盞茶屋」）：每個月都是週六 17:30（off 0、h 17.5）、地點字幕「一盞茶屋」、背景 wenzhou_teahouse',/\*\*方式\*\*：週六 17:30，一盞茶屋。/.test(part(doc,2,3))&&/週六 17:30，\*\*一盞茶屋\*\*/.test(doc367)
      &&all.every(m=>m.m==='noodle'&&m.off===0&&m.h===17.5)&&md.place==='一盞茶屋'&&md.bg==='wenzhou_teahouse'&&md.kind==='meet',J([all[0],md]));
    const P=plan(freshPG('2029-06-03',10,{},YT))[YT]||{}, ks=Object.keys(P);
    check('2. 只和語彤交往（沒有讀書小組）：表上十八個月都排、都是週六 17:30（6/2 畢業典禮→6/9；2029-09 中秋那個月表上沒有）',ks.length===18&&!ks.includes('2029-09')&&ks.every(k=>/（六）17:30$/.test(P[k]))&&P['2029-06']==='6/9（六）17:30',J(P));
    const G=freshPG('2029-06-09',17,{},YT); H.tick(); const q=OUT.due(G), nm=SOCIAL.displayName(YT); H.picks=[0]; H.said=[]; H.opts=[]; caps.length=0; if(q) await OUT.tick(GM);
    check('2. 6/9 17:00 問出發（17:30 減走路 15 分鐘、再減 15 分鐘）：「出發：和'+nm+'：一盞茶屋」→ 字幕「一盞茶屋」→ 她說 2029-06 那一句（「一試以前，週末我還是在茶屋。…」）',
      !!q&&q.id==='pg_date_heroine_03_2029-06'&&lab(q.day,q.h)==='6/9（六）17:30'&&q.title==='和'+nm+'：一盞茶屋'&&caps.includes('一盞茶屋')&&H.said.length===1&&H.said[0].t===NEW2['2029-06']&&q.state==='done',J([q&&q.id,q&&q.title,H.opts[0],caps,H.said])); });
  /* ---------------- 3. 第 3 節：postgrad_lines.js、postgrad3d.js ---------------- */
  await sec(3,async()=>{
    const r1=MSG('pg_yt_2030_r1')||{}, r2=MSG('pg_yt_2030_r2')||{};
    check('3. 「一試過了。」「上了。／蘇姨已經在寫紅紙了。」字不動（稿「現在」欄）；排的日子搬到 2029-09-07 15:10、2029-12-14 15:10（tag pg_yt_2030_r1／r2 照舊）',J(L().Y2030.yt1)===J(Y1)&&J(L().Y2030.yt2)===J(Y2)&&Y1.length===1&&Y2.length===2
      &&/搬到 2029-09-07/.test(row(S3,'Y2030.yt1')[2])&&/搬到 2029-12-14/.test(row(S3,'Y2030.yt2')[2])&&J(r1.at)===J(['2029-09-07',15+10/60])&&J(r2.at)===J(['2029-12-14',15+10/60]),J([L().Y2030.yt1,L().Y2030.yt2,r1.at,r2.at]));
    { const G=grpSave('2029-09-07',14.6,{BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:14,BAR_STAGE_2029:'lawyer'}); PG.rules(GM); H.at('2029-09-07',15.3); H.tick();
      const M=grpOn(G,'2029-09-07'), iy=M.findIndex(m=>m.from===YT&&m.text===Y1[0]), iz=M.findIndex(m=>m.from==='zhe'&&m.text==='宵夜');
      check('3. 2029-09-07（一試放榜）：桌遊團 15:10 語彤「一試過了。」，在 15:00 那幾則（Alison「一試放榜了。」…阿哲「宵夜」）後面',iy>=0&&iz>=0&&iz<iy&&M[iy].h>15.16&&M[iy].h<15.31&&ytG(G).length===1,J(M.map(m=>[m.from||m.who,m.text,m.h]))); }
    { const G=grpSave('2029-12-14',14.6,{BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:14,BAR_STAGE_2029:'lawyer'}); PG.rules(GM); H.at('2029-12-14',15.3); H.tick();
      const M=grpOn(G,'2029-12-14'), iy=M.findIndex(m=>m.from===YT&&m.text===Y2[0]), iz=M.findIndex(m=>m.from==='zhe'&&m.text==='放榜了');
      check('3. 2029-12-14（二試放榜）：桌遊團 15:10 語彤「上了。」「蘇姨已經在寫紅紙了。」，排在阿哲「放榜了」那幾則後面',iy>0&&iz>=0&&iz<iy&&(M[iy+1]||{}).text===Y2[1]&&(M[iy+1]||{}).from===YT&&J(ytG(G).map(m=>m.text))===J(Y2)&&M.slice(iy+2).every(m=>m.from!=='zhe'||!/放榜/.test(m.text)),J(M.map(m=>[m.from||m.who,m.text,m.h]))); }
    { const G=grpSave('2029-12-14',14.6,{BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:14,BAR_STAGE_2029:'lawyer',BAR_STUDY_GROUP:['kexin','yutong']}); PG.rules(GM); H.at('2029-12-14',15.3); H.tick();
      check('3. 同一天有讀書小組那一場（三個人）：群組那兩則照樣傳（群組不算見面）',J(ytG(G).map(m=>m.text))===J(Y2)); }
    { const G=grpSave('2030-09-06',14.6,{EXCHANGE_ROUTE:'JP',BAR_REG_2030:true}); PG.rules(GM); H.at('2030-09-06',15.4); H.tick(); H.at('2030-09-07',12); H.tick();
      const z=grpOn(G,'2030-09-06').some(m=>m.from==='zhe'&&/今年換我先講/.test(m.text));
      check('3. 2030-09-06（2030 年考的人一試放榜）：群組照樣有阿哲「一試放榜了 今年換我先講」，沒有語彤「一試過了。」（那則拿掉）',z&&!ytG(G).length,J(grpOn(G,'2030-09-06').map(m=>[m.from,m.text]))); }
    { const G=grpSave('2030-12-13',14.6,{EXCHANGE_ROUTE:'JP',BAR_REG_2030:true,BAR_SIT_2030:true,BAR_SCORE_2030:13,BAR_STAGE_2030:'lawyer'}); PG.rules(GM); H.at('2030-12-13',15.4); H.tick(); H.at('2030-12-14',12); H.tick();
      const a=grpOn(G,'2030-12-13').some(m=>m.from==='yu'&&m.text===L().Y2030.yu);
      check('3. 2030-12-13（2030 年考的人二試放榜）：群組照樣有 Alison 那一則，沒有語彤「上了。」「蘇姨已經在寫紅紙了。」（那則拿掉）',a&&!ytG(G).length,J(grpOn(G,'2030-12-13').map(m=>[m.from,m.text]))); }
    { const r=row(S3,'R2_2030.yt'), want=sl(r[2].replace(/（阿哲那一句照接）\s*$/,'')), Y=L().R2_2030.yt;
      check('3. R2_2030.yt（2030-12-13，讀書小組有她）：第一行旁白「…寫的是你的名字。」、語彤「蘇姨寫的。去年貼我的，今年換你。」，阿哲那一句照接',want.length===2&&J(Y)===J([[null,want[0]],[YT,want[1]],['zhe','（舉起碗）去年沒吃到的，今年一起吃。']])&&J(Y.slice(0,2).map(x=>x[1]))!==J(sl(r[1])),J(Y));
      const G=H.fresh('2030-12-13',17,'dorm',{BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:10,BAR_STAGE_2029:'none',BAR_STUDY_GROUP:['yutong']}); graduated(G);
      check('3. 演的時候（PG.noodle2030Lines，讀書小組有語彤）：就是這三行',J(PG.noodle2030Lines(G).map(x=>x[1]))===J([want[0],want[1],'（舉起碗）去年沒吃到的，今年一起吃。']),J(PG.noodle2030Lines(G))); }
    { const r=row(S3,'FIRST.friends'), want=sl(r[2]), f=(L().FIRST.friends||[]).find(x=>x[0]===YT);
      check('3. FIRST.friends 語彤（2030-10-01「我的第一天」）：「（照片：事務所的桌子，旁邊一個茶屋的保溫杯）」「我的第一天是八月。現在才傳。」',want.length===2&&J(f)===J([YT,want[0],want[1]]),J(f));
      const G=H.fresh('2030-10-01',21,'dorm',{BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:14,BAR_STAGE_2029:'lawyer',BAR_YEAR:2029}); graduated(G); H.FAMILIAR(YT); H.said=[]; await H.run('first');
      const T=ytG(G).map(m=>m.text);
      check('3. 2030-10-01 21:00 那一場真的傳：語彤照片「📷'+want[0]+'」＋「'+want[1]+'」，原本的「二試還沒考。在店裡讀。」不在',J(T)===J(['📷'+want[0],want[1]])&&!H.msgs('g:noodle_team').some(t=>t===sl(r[1])[1]),J(T)); }
    { const r=row(S3,'B1_2030.yt');
      check('3. B1_2030.yt（2030-07-11 總圖 B1）照留',/^照留/.test(r[2])&&J(L().B1_2030.yt)===J([[YT,r[1]]]),J(L().B1_2030.yt)); }
    const all=J(L());
    check('3. 舊字（寫的是她自己的名字、燒臘店那邊貼了、茶屋的角落的六法、二試還沒考）都不在 POSTGRAD_LINES',!/寫的是她自己的名字|她說燒臘店那邊貼了|茶屋的角落，一本攤開的六法|二試還沒考。在店裡讀。/.test(all)); });
  /* ---------------- 4. 第 4 節：多段感情《今天不用幫忙》 ---------------- */
  await sec(4,async()=>{
    const R=(Lm().REPAIR||{})[YT]||{}, T1=((((R.talk1||[]).find(x=>x&&x.c)||{}).c||[]).find(o=>o.t==='「好。我等妳。」')||{}).then||[];
    const tx=x=>typeof x==='string'?x:(x&&x.n!=null?x.n:null);
    const w1=sl(row(S4,'talk1')[2]), a2=row(S4,'ask 第 2 句')[2], a4=row(S4,'ask 第 4 句')[2], rb=row(S4,'result B')[2], d2=row(S4,'result D 第 2 句')[2], d3=row(S4,'result D 第 3 句')[2];
    check('4. talk1 選「好。我等妳。」：「嗯。」→「'+w1[0]+'」（旁白）→「'+w1[1]+'」',w1.length===2&&J(T1.map(tx))===J(['嗯。',w1[0],w1[1]])&&!!T1[1]&&T1[1].n===w1[0],J(T1));
    check('4. ask 第 2、4 句：「'+a2+'」「'+a4+'」（第 1、3 句不動）',J(R.ask)===J(['我想講一件事。',a2,'……我想要你來的時候，是來找我。',a4]),J(R.ask));
    check('4. 結果 B：旁白「'+rb+'」',J(((R.result||{}).B||[]).map(tx))===J(['我想過了。我想繼續。',rb])&&((R.result||{}).B||[])[1].n===rb,J((R.result||{}).B));
    check('4. 結果 D 第 2、3 句：「'+d2+'」「'+d3+'」',J((R.result||{}).D)===J(['我想把時間留給自己。',d2,d3]),J((R.result||{}).D));
    const olds=S4.filter(r=>r[0]!=='欄').flatMap(r=>sl(r[1])), all=J(Lm());
    check('4. 稿「現在」欄的七句（一碗麵、這碗我請、收碗、阿姨、吃麵）都不在 MULTIREL_LINES',olds.length===7&&!olds.some(o=>all.includes(o)),J(olds.filter(o=>all.includes(o))));
    H.fresh('2027-04-07',15,'campus',{}); X()._gm=GM; H.CLOSE(YT); ROM.start(H.G,YT); H.G.flags.dating_kexin=true; const c=X().ctx(H.G,YT,KX);
    H.said=[]; H.picks=[0]; await X().run(GM,YT,R.talk1,c); const t1=H.said.map(s=>s.t);
    H.said=[]; await X().run(GM,YT,R.ask,c); const ta=H.said.map(s=>s.t); H.said=[]; await X().run(GM,YT,R.result.B,c); const tb=H.said.map(s=>s.t); H.said=[]; await X().run(GM,YT,R.result.D,c); const td=H.said.map(s=>s.t);
    check('4. 真的演（MREL.run）：talk1 選「好。我等妳。」最後兩句是烏龍那兩句；ask、結果 B、結果 D 照上面的字',J(t1.slice(-2))===J(w1)&&J(ta)===J(R.ask)&&J(tb)===J(['我想過了。我想繼續。',rb])&&J(td)===J(['我想把時間留給自己。',d2,d3]),J([t1.slice(-3),ta,tb,td])); });
  /* ---------------- 5. 第 6 節：燒臘店的長桌、2030 那一頓 ---------------- */
  await sec(5,async()=>{
    const r=row(S6,'R2_2030.base'), base=L().R2_2030.base;
    check('5. R2_2030.base 旁白「'+r[2]+'」（原本「（麵店的長桌。…）」），阿哲那一句照舊',J(base)===J([[null,r[2]],['zhe','（舉起碗）去年沒吃到的，今年一起吃。']])&&r[1]!==r[2]&&!J(L()).includes(r[1]),J(base));
    const G=H.fresh('2030-12-13',14.6,'dorm',{BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:10,BAR_STAGE_2029:'none'}); graduated(G); PHONE.join(G,'noodle_team','桌遊團');
    G.flags.BAR_SIT_2030=true; G.flags.BAR_SCORE_2030=8; G.flags.BAR_STAGE_2030='lawyer'; for(const k of ['exam_2030','r1_2030','e2a_2030','e2b_2030']) PG.rec(G).done[k]=1;   /* [前置] 同 tests/bar_exam_unit.js 第 12 組：2030 一試過了 */
    PG.rules(GM); H.at('2030-12-13',15.1); await H.run('r2_2030'); const q=OUT.get(G,'pg_bar_noodle_2030');
    check('5. 2030-12-13 放榜那一頓（出遊）：place「公館燒臘」、title「公館燒臘・長桌」（同 2029 那一頓；稿：出遊卡片上的地點「公館燒臘」）',/公館燒臘/.test(row(S6,'postgrad3d.js')[2])&&!!q&&q.place==='公館燒臘'&&q.title==='公館燒臘・長桌'&&q.h===18,J(q));
    H.at('2030-12-13',17.5); H.tick(); const due=OUT.due(G); H.picks=[0]; H.opts=[]; H.said=[]; if(due) await OUT.tick(GM);
    check('5. 卡片「出發：公館燒臘・長桌」（小字不再寫「阿鳳麵店」）；出發 → 演「'+r[2]+'」',!!due&&due.id==='pg_bar_noodle_2030'&&(H.opts[0]||[])[0]==='出發：公館燒臘・長桌'&&!J(H.opts).includes('阿鳳麵店')&&H.said.some(s=>s.t===r[2]),J([due&&due.id,H.opts[0],H.said.slice(0,2)])); });
  /* ---------------- 6. 舊存檔 ---------------- */
  await sec(6,async()=>{
    { const G=grpSave('2030-12-14',10,{EXCHANGE_ROUTE:'JP',BAR_REG_2030:true}); PHONE.postAt(G,{th:'g:noodle_team',from:YT,text:Y1[0],tag:'pg_yt_2030_r1'},D('2030-09-06'),15+10/60);
      Y2.forEach((t,i)=>PHONE.postAt(G,{th:'g:noodle_team',from:YT,text:t,tag:'pg_yt_2030_r2'},D('2030-12-13'),15+10/60+i*0.01)); const was=J(ytG(G));   /* [前置] 舊版本：2030-09-06、2030-12-13 已經收過那兩則 */
      H.tick(); H.at('2030-12-15',12); H.tick();
      check('6. 舊存檔已經收過 2030 那兩則（tag pg_yt_2030_r1／r2）：不再收、原本的三則留著（不刪、不改）',J(ytG(G))===was&&ytG(G).length===3,J(ytG(G).map(m=>[m.text,m.day]))); }
    { const G=grpSave('2029-09-08',12,{}); H.tick(); const a=ytG(G).map(m=>[m.text,m.day,m.h]); H.at('2029-09-08',20); H.tick(); H.at('2029-09-09',9); H.tick();
      check('6. 2029-09-07 之後 48 小時內讀檔（9/8 12:00）：補一則「一試過了。」、時間照原本的 9/7 15:10；再跑不重複',J(a)===J([[Y1[0],D('2029-09-07'),15.17]])&&ytG(G).length===1,J([a,ytG(G).length])); }
    { const G=grpSave('2029-12-15',9,{}); H.tick(); H.tick();
      check('6. 2029-12-14 之後 48 小時內讀檔（12/15 09:00）：補「上了。」「蘇姨已經在寫紅紙了。」一次（12/14 15:10）',J(ytG(G).map(m=>m.text))===J(Y2)&&ytG(G).every(m=>m.day===D('2029-12-14')),J(ytG(G).map(m=>[m.text,m.day,m.h]))); }
    { const G=grpSave('2029-09-10',12,{}); H.tick(); H.at('2029-12-17',12); H.tick(); H.at('2030-09-06',15.5); H.tick(); H.at('2030-12-13',15.5); H.tick(); H.at('2030-12-15',12); H.tick();
      check('6. 過了 48 小時才讀檔（2029-09-10 讀、之後到 2030 年底）：不補，也不會在 2030-09-06、12-13 收到（舊的那兩則已經拿掉）',!ytG(G).length,J(ytG(G).map(m=>[m.text,m.day]))); } });
  H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });
