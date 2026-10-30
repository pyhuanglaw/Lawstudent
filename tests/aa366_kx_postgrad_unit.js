// AA_366（第二版，企劃線 a7bd9741，AA_382 改四句以後 e6d4a198；任務 AA366-KX-POSTGRAD-1021）可昕「我們的日子」畢業以後——不需要瀏覽器。
//   0  載入：src/data/pg_dates.js（產生器 tools/story/import_pg_dates.py）、src/pgdates3d.js；index.html 在 postgrad3d.js、r2y4b3d.js、y5s1_3d.js 後面；掛上 PG.MSGS／stops／RULES、25 個事件
//   1  逐字對稿：從 git 讀 e6d4a198 的稿（第 1 節開頭那一則、第 2 節每一格那一句），和資料、事件、手機訊息一字一字比
//   2  格子的日子：P1 6/17、7/1、7/15，P2 8/12～10/7 隔週日 19:00，P3 照 KX_OUR_DAY.day（週五 19:00／週六、週日 14:00），P4 三通電話（週六 21:00），P5 每月第一個週日（2 月 2/10）
//   3  不排：一試當週、二試兩天、10/14～10/20 沒有；讀書小組有她的沒有 P1（開頭那一則也不傳）；P5 那個月有一對一接觸的四種
//   4  地點：公館、河濱、政大小吃街輪流；P4 字幕「電話」、祐廷打給她
//   5  開頭那一則：21:00 兩則、KX_OD_PG、P3 的 {星期}；那一段第一週內才傳（舊存檔第 4 天讀＝補在 21:00；第 8 天＝不補）
//   6  長跳停在格子上：該問的時間（約好的時間減車程再減 15 分鐘）就是下一站；出發＝地點字幕＋那一句；一路跳到 2030-12-13 每一格都停、順序對、一句不差
//   7  分手：排好的改 skipped、之後不排、不再有停點
//   8  舊存檔：2029-09-12 讀檔＝從 9/23 開始，8/12～9/9 不補；排的時候不跳「排進行程」的提示
//   9  和 AA_351 接（只和她一位交往）：準時 −1（最低 0）、遲到超過 15 分鐘 ＋1、說了「晚一點」最後沒到 ＋1、「不去了」不算；兩位交往不算
//   10 沒交往、沒有 KX_OUR_DAY、還沒畢業（不是畢業後篇）、不是法律系：沒有格子、沒有開頭那一則；同時和別人交往，她的日子不變
// 修改前（開發分支 2eba2fab）：沒有 pg_dates.js、pgdates3d.js——每一節照樣跑（用空的替身），全部 FAIL（第 1 節讀稿那兩項除外）。用法：node tests/aa366_kx_postgrad_unit.js
require('./alison.js');   /* AA_380：企劃線的舊稿還寫「小語」，讀稿的時候照匯入工具換成 Alison */
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H;
const NAMES=/^(NOODLE_CLOSED|R2Y4B|R2Y4B_EVENTS|Y5|PG_DATES|PGDATE)$/;
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.CG_REGISTRY={};
const FILES=['src/noodle_closed3d.js','src/data/r2y4b_events.js','src/r2y4b3d.js','src/y5s1_3d.js','src/data/pg_dates.js','src/pgdates3d.js'];   /* index.html 的順序（畢業後篇的事件包、大五上、固定格）*/
for(const f of FILES) if(fs.existsSync(path.join(H.ROOT,f))) load(f);
const ok0=typeof PG_DATES!=='undefined'&&typeof PGDATE!=='undefined';
/* 修改前沒有的：空的替身（每一節照樣跑、照樣 FAIL，不在第 0 項就停）*/
if(typeof PG_DATES==='undefined') global.PG_DATES={kexin:{segs:{},slots:[]},six:{}};
if(typeof PGDATE==='undefined') global.PGDATE={kxList:()=>[],upcoming:()=>[],stop:()=>null,askAt:()=>NaN,outOf:()=>({}),MSGS:[],OPEN_H:null};
const caps=[]; GM.caption=(a,b)=>{ caps.push(b); };
const toasts=[]; GM.toast=t=>{ toasts.push(t); };
const D=k=>PG.DK(k), T=(d,h)=>d*24+h;
const lab=(d,h)=>PG.dateLabel(d,h);
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,2).join(' / ')); } };
const SRC='docs/story_planning/AA_366_可昕我們的日子_畢業以後.md', SHA='e6d4a198';   /* AA_382 第 2 節：AA 改了四句（受訓、週日開庭「這禮拜」），白名單改成 e6d4a198 */
const idx=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'), at=s=>idx.indexOf(s);
const dataSrc=fs.existsSync(path.join(H.ROOT,'src/data/pg_dates.js'))?fs.readFileSync(path.join(H.ROOT,'src/data/pg_dates.js'),'utf8'):'';
check('0. 載入 pg_dates.js（開頭寫「自動產生……不要手改」）、pgdates3d.js；index.html 在 postgrad3d.js、r2y4b3d.js、y5s1_3d.js 後面；PG.MSGS 有五則開頭、PG.stops／PG.RULES 有掛、25 個事件（每一格一個）',
  ok0&&/自動產生：tools\/story\/import_pg_dates\.py/.test(dataSrc)&&/不要手改/.test(dataSrc)&&at('src/data/pg_dates.js')>at('src/y5s1_3d.js')&&at('src/pgdates3d.js')>at('src/data/pg_dates.js')&&at('src/y5s1_3d.js')>at('src/r2y4b3d.js')&&at('src/r2y4b3d.js')>at('src/postgrad3d.js')
  &&['p1','p2','p3','p4','p5'].every(s=>PG.MSGS.some(m=>m.tag==='kx_od_pg_'+s))&&Array.isArray(PG.RULES)&&PG.RULES.includes(PGDATE.rulesFn)&&PG.stops.includes(PGDATE.stopFn)
  &&STORY_EVENTS.filter(e=>/^ev_kx_od_pg_/.test(e.id)).length===25);
/* ---------- 稿（從 git 讀；測試自己的讀法，不用產生器）---------- */
let doc=''; try{ doc=cp.execFileSync('git',['-C',process.env.PG_DOC_REPO||H.ROOT,'show',SHA+':'+SRC],{encoding:'utf8'}); }catch(e){ doc=''; }
const rows=n=>{ const L=doc.split('\n'), i=L.findIndex(l=>l.startsWith('## '+n+'.')), out=[]; if(i<0) return out; for(let k=i+1;k<L.length&&!L[k].startsWith('## ');k++) if(L[k].startsWith('| P')) out.push(L[k].trim().replace(/^\||\|$/g,'').split('|').map(c=>c.trim())); return out; };
const DOC_OPEN={}, DOC_SLOT=[];
for(const c of rows(1)){ const seg=c[0].split(' ')[0].toLowerCase(); DOC_OPEN[seg]={md:(c[3].match(/^(\d+\/\d+)/)||[])[1],lines:[...c[3].matchAll(/「([^」]*)」/g)].map(m=>m[1]),days:c[2]}; }
for(const c of rows(2)) DOC_SLOT.push({seg:c[0].toLowerCase(),md:c[1].replace(' 那週',''),week:/那週/.test(c[1]),line:c[2].replace(/^「/,'').replace(/」$/,'')});
const yr=(seg,md)=>seg==='p5'||(seg==='p4'&&+md.split('/')[0]<6)?2030:2029, iso=(seg,md)=>{ const [m,d]=md.split('/'); return yr(seg,md)+'-'+String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0'); };
const evLine=id=>{ const ev=STORY_EVENTS.find(e=>e.id===id), ln=ev&&(ev.dialogue||[]).find(l=>l.speaker==='kexin'); return ln?ln.text:null; };
/* ---------- 存檔 ---------- */
const grad=G=>{ G.flags.GRADUATED=PG.gradDay(); G.flags.GRAD_DONE=true; PG.rec(G).done.grad=1; return G; };
const fresh=(key,h,flags,od)=>{ const G=H.fresh(key,h,'dorm',Object.assign({MOVED_OUT:D('2029-06-28'),HOME_AFTER:'home',Y4_PATH:'other',PACKED_Y4:D('2029-06-01'),ROOM_Y2:true,ROOM_Y3:true,ROOM_Y4:true},flags||{}));
  G.acts={att:{}}; G.outings=[]; grad(G); for(const e of ['ev_grad_family','ev_grad_lunch','ev_grad_envelope','ev_y4_path','ev_move_out_y4']) G.events.done[e]=1;
  if(od!==null){ H.FRIEND('kexin'); H.date('kexin'); G.flags.KX_OUR_DAY=od||{day:'sat',mode:'mid'}; } caps.length=0; toasts.length=0; return G; };
const keys=G=>PGDATE.kxList(G).map(s=>s.key);
const when=G=>PGDATE.kxList(G).map(s=>lab(s.day,s.h));
const y4=async GM=>{ const G=GM.G; if(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G)) return null;   /* 照 story3d.js S.y4Tick（同 tests/postgrad_days_unit.js）*/
  if(STORY.packDue(G)){ await STORY.packY4(GM); return 'pack'; } if(STORY.gradMorningDue(G)){ await STORY.gradFamily(GM); return 'family'; } if(STORY.gradLunchDue(G)){ await STORY.gradLunch(GM); return 'lunch'; }
  if(G.zone==='dorm'&&STORY.gradEnvelopeDue(G)){ await STORY.gradEnvelope(GM); return 'envelope'; } if(STORY.moveOutDue(G)){ await STORY.moveOutY4(GM); return 'moveout'; } return null; };
/* 跳到下一件事，直到有出遊要問「出發」（最多 n 次）*/
const untilOut=async(G,n)=>{ for(let i=0;i<(n||30)&&!OUT.due(G);i++){ const s=PG.due(G); if(s){ H.picks=[]; await PG.runStep(GM,s); continue; } E.player.busy=false; if(!await PG.advance(GM)) break; } return OUT.due(G); };
(async()=>{
  await sec('1',async()=>{
    check('1. 讀得到企劃線 '+SHA+' 的 AA_366',doc.length>1000&&doc.includes('第二版'));
    check('1. 稿：五段的開頭各兩則、每一格 25 句',Object.keys(DOC_OPEN).length===5&&Object.values(DOC_OPEN).every(o=>o.lines.length===2)&&DOC_SLOT.length===25,JSON.stringify(Object.keys(DOC_OPEN))+' '+DOC_SLOT.length);
    const K=PG_DATES.kexin, bad=[];
    DOC_SLOT.forEach((s,i)=>{ const d=K.slots[i]; if(!d||d.seg!==s.seg||d.key!==iso(s.seg,s.md)||d.line!==s.line||!!d.week!==s.week) bad.push(s.md); if(evLine('ev_kx_od_pg_'+iso(s.seg,s.md))!==s.line) bad.push('事件 '+s.md); });
    for(const seg in DOC_OPEN){ const a=K.segs[seg]; if(!a||a.open!==iso(seg,DOC_OPEN[seg].md)||JSON.stringify(a.lines)!==JSON.stringify(DOC_OPEN[seg].lines)) bad.push('開頭 '+seg); }
    check('1. 逐字對稿：25 格的日子、那一句（資料、事件裡她說的那一句），五段開頭那一則的日子與兩句，一字不差',!bad.length&&DOC_SLOT.length===25,bad.join('、'));
    const S=K.segs;
    check('1. 稿上的時間＝程式的時間：P1、P2、P5 19:00、P4 21:00（電話）、P3「週五 19:00／週六、週日 14:00」；開頭那一則 21:00',
      /19:00/.test(DOC_OPEN.p1.days)&&/19:00/.test(DOC_OPEN.p2.days)&&/19:00/.test(DOC_OPEN.p5.days)&&/21:00，電話/.test(DOC_OPEN.p4.days)&&/週五 19:00／週六、週日 14:00/.test(DOC_OPEN.p3.days)&&/開頭那一則（她私訊，21:00）/.test(doc)
      &&S.p1?.h===19&&S.p2?.h===19&&S.p5?.h===19&&S.p4?.h===21&&S.p4?.call===true&&JSON.stringify(S.p3?.h)==='{"fri":19,"sat":14,"sun":14}'&&PGDATE.OPEN_H===21); });
  /* ---------- 2 格子的日子 ---------- */
  await sec('2',async()=>{ const G=fresh('2029-06-03',10); const L=PGDATE.kxList(G), wd=s=>CALENDAR.dateOf(s.day).wd;
    const docDays=seg=>{ const t=DOC_OPEN[seg].days.split('：')[1].replace(/（[^）]*）/g,'').replace('那三週',''); return t.split('、').map(x=>x.trim()).filter(x=>/^\d+\/\d+$/.test(x)).map(x=>iso(seg,x)); };
    const want=['p1','p2','p3','p4','p5'].flatMap(docDays);
    check('2. 25 格的日子照稿第 1 節（哪幾天）：'+want.length+' 格',want.length===25&&JSON.stringify(L.map(s=>s.key))===JSON.stringify(want),JSON.stringify(L.map(s=>s.key)));
    const by=seg=>L.filter(s=>s.seg===seg);
    check('2. P1、P2、P5 都是週日 19:00；P4 都是週六 21:00、電話',L.length===25&&[...by('p1'),...by('p2'),...by('p5')].every(s=>wd(s)===7&&s.h===19&&s.kind==='meet')&&by('p4').length===3&&by('p4').every(s=>wd(s)===6&&s.h===21&&s.kind==='call'),when(G).join(' '));
    check('2. P1 是 6/17、7/1、7/15；P2 是 8/12、8/26、9/9、9/23、10/7（隔週）；P5 2 月是 2/10（2/3 是初一）、之後每月第一個週日',
      JSON.stringify(by('p1').map(s=>lab(s.day,s.h)))==='["6/17（日）19:00","7/1（日）19:00","7/15（日）19:00"]'&&by('p2').length===5&&by('p2').map(s=>s.day).every((d,i,a)=>i===0||d-a[i-1]===14)&&lab(by('p2')[0].day,19)==='8/12（日）19:00'
      &&by('p5').length===11&&lab(by('p5')[0].day,19)==='2/10（日）19:00'&&by('p5').slice(1).every(s=>CALENDAR.dateOf(s.day).d<=7)&&CALENDAR.holiday(D('2030-02-03'))==='春節',when(G).join(' '));
    const p3=od=>{ const G2=fresh('2029-06-03',10,{},{day:od,mode:'mid'}); return PGDATE.kxList(G2).filter(s=>s.seg==='p3').map(s=>lab(s.day,s.h)).join(' '); };
    const f=p3('fri'), s=p3('sat'), u=p3('sun');
    check('2. P3 照 KX_OUR_DAY.day 落在 10/29、11/12、11/26 那三週（隔週）：週五 19:00／週六 14:00／週日 14:00',f==='11/2（五）19:00 11/16（五）19:00 11/30（五）19:00'&&s==='11/3（六）14:00 11/17（六）14:00 12/1（六）14:00'&&u==='11/4（日）14:00 11/18（日）14:00 12/2（日）14:00',[f,s,u].join('｜')); });
  /* ---------- 3 不排 ---------- */
  await sec('3',async()=>{ const G=fresh('2029-06-03',10); const L=PGDATE.kxList(G), inR=(a,b)=>L.some(s=>s.day>=D(a)&&s.day<=D(b));
    check('3. 一試當週（7/29～8/4）、二試兩天（10/20～21）、第五年週年那一週（10/14～10/20）沒有格子',L.length===25&&!inR('2029-07-29','2029-08-04')&&!inR('2029-10-14','2029-10-21'));
    const Ls=keys(fresh('2029-06-03',10,{BAR_STUDY_GROUP:['kexin']}));
    check('3. 讀書小組有她（BAR_STUDY_GROUP 有 kexin；三個人也一樣）：沒有 P1 的三格，P2 起照排',Ls.length===22&&!Ls.some(k=>k<'2029-08-01')&&Ls[0]==='2029-08-12'&&!keys(fresh('2029-06-03',10,{BAR_STUDY_GROUP:['kexin','yutong']})).includes('2029-06-17')&&keys(fresh('2029-06-03',10,{BAR_STUDY_GROUP:['yutong']})).includes('2029-06-17'),JSON.stringify(Ls));
    fresh('2029-06-10',20.9,{BAR_STUDY_GROUP:['kexin']}); H.at('2029-06-10',21.2); H.tick(); const m1=H.msgs('p:kexin');
    fresh('2029-08-05',20.9,{BAR_STUDY_GROUP:['kexin']}); H.at('2029-08-05',21.2); H.tick(); const m2=H.msgs('p:kexin');
    check('3. 讀書小組有她：6/10 P1 的開頭那一則不傳；8/5 P2 的照傳',!m1.includes(DOC_OPEN.p1.lines[0])&&m2.includes(DOC_OPEN.p2.lines[0]),JSON.stringify([m1,m2]));
    const p5=flags=>{ const G=fresh('2030-01-21',10,flags); return keys(G).filter(k=>k>='2030-02').map(k=>k.slice(0,7)); };
    const all=p5({}), a=p5({EXCHANGE_ROUTE:'JP',GRAD_EXAM_2030:true}), b=p5({BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:9,BAR_STAGE_2029:'none'}), c=p5({KX_SHELF:true}), d=p5({EXCHANGE_ROUTE:'US',BAR_REG_2030:true});
    const miss=(L,...ym)=>ym.every(m=>!L.includes(m))&&L.length===all.length-ym.length;
    check('3. P5 平常 11 格（2 月～12 月）；那個月已經有她的一對一接觸就不排：延畢、研究所筆試有結果＝沒有 3 月；重考＝沒有 8 月（重考也是 2030 年考的：12 月也沒有）；KX_SHELF＝沒有 10 月；2030 年考的（交換延畢報了名）＝沒有 12 月',
      all.length===11&&miss(a,'2030-03')&&miss(b,'2030-08','2030-12')&&miss(c,'2030-10')&&miss(d,'2030-12'),JSON.stringify({all,a,b,c,d})); });
  /* ---------- 4 地點 ---------- */
  await sec('4',async()=>{ const G=fresh('2029-06-03',10); const L=PGDATE.kxList(G), meet=L.filter(s=>s.kind==='meet'), call=L.filter(s=>s.kind==='call');
    const R=['公館','河濱','木柵大學・山下的小吃街'];
    check('4. 見面的地點照稿「公館、河濱、木柵大學小吃街輪流」（一格換一個）',meet.length===22&&meet.every((s,i)=>s.place===R[i%3]),meet.map(s=>s.place).join(' '));
    check('4. P4 是電話：地點字幕「電話」、手機的選項「打給她」、不用出門',call.length===3&&call.every(s=>s.place==='電話'&&PGDATE.outOf(G,s).verb==='打給她'&&PGDATE.outOf(G,s).call===true&&PGDATE.outOf(G,s).travelH===0)); });
  /* ---------- 5 開頭那一則 ---------- */
  await sec('5',async()=>{ { const G=fresh('2029-06-10',20.9); H.at('2029-06-10',21); H.tick(); const K=(G.msgs||[]).filter(m=>m.th==='p:kexin');
      check('5. 6/10 21:00 她私訊兩則（照稿）、記 KX_OD_PG＝p1',K.length===2&&K[0].text===DOC_OPEN.p1.lines[0]&&K[1].text===DOC_OPEN.p1.lines[1]&&K[0].h===21&&G.flags.KX_OD_PG==='p1',JSON.stringify(K.map(m=>[m.h,m.text]))); }
    { const out={}; for(const od of ['fri','sat','sun']){ fresh('2029-10-22',20.9,{},{day:od,mode:'ntu'}); H.at('2029-10-22',21.1); H.tick(); out[od]=H.msgs('p:kexin'); }
      check('5. P3 10/22：「考完了。這次是真的考完了。」「{星期}照舊，隔週。」——{星期} 照 KX_OUR_DAY 換成週五／週六／週日',out.fri[1]==='週五照舊，隔週。'&&out.sat[1]==='週六照舊，隔週。'&&out.sun[1]==='週日照舊，隔週。'&&out.sat[0]===DOC_OPEN.p3.lines[0]&&DOC_OPEN.p3.lines[1]==='{星期}照舊，隔週。',JSON.stringify(out)); }
    { const one=(key,h)=>{ const G=fresh(key,h); H.tick(); const m=(G.msgs||[]).filter(x=>x.th==='p:kexin'); return {m:m.map(x=>x.text),at:m.length?lab(m[0].day,m[0].h):null,seg:G.flags.KX_OD_PG}; };
      const a=one('2029-06-14',9), b=one('2029-06-18',9), c=one('2029-12-16',21.05), e=one('2030-01-20',21.05);
      check('5. 舊存檔：那一段的第一週內讀檔（6/14）＝補上那一則（時間照 6/10 21:00）；過了一週（6/18）＝不補',a.m.join('｜')===DOC_OPEN.p1.lines.join('｜')&&a.at==='6/10（日）21:00'&&b.m.length===0,JSON.stringify([a,b]));
      check('5. P4 12/16（日）21:00、P5 1/20 21:00 照稿',c.m.join('｜')===DOC_OPEN.p4.lines.join('｜')&&c.seg==='p4'&&e.m.join('｜')===DOC_OPEN.p5.lines.join('｜')&&e.seg==='p5',JSON.stringify([c,e])); } });
  /* ---------- 6 長跳停在格子上 ---------- */
  await sec('6',async()=>{ { const G=fresh('2029-06-11',10); H.tick(); STORY.phoneRules(GM); PHONE.tick(G);   /* 讀檔那一下先把 6/10 的開頭那一則補進來（第一週內）；[前置] 測試存檔缺的舊訊息（經濟系那一年……）先送完，不讓它們在跳的第一步停下來 */
      const ask=T(D('2029-06-17'),19)-1/6-0.25, ns=PG.nextStop(G); H.said=[]; E.player.busy=false; await PG.advance(GM); const q=OUT.due(G);
      check('6. 6/11 10:00：下一站＝6/17 18:35（19:00 減騎車 10 分鐘、再減 15 分鐘；不是整點），跳過去剛好停在那裡',ns!=null&&Math.abs(ns-ask)<1e-6&&Math.abs(G.day*24+G.hour-ask)<1e-6,lab(G.day,G.hour)+' ns='+ns+' ask='+ask);
      check('6. 停下來就排成出遊（kx_od_<day>、planned、不跳「排進行程」的提示），手機問「出發」',!!q&&q.state==='planned'&&q.id==='kx_od_'+D('2029-06-17')&&!toasts.some(t=>/排進行程/.test(t)),JSON.stringify(q)+' '+JSON.stringify(toasts));
      H.picks=[0]; H.said=[]; caps.length=0; H.opts=[]; if(q) await OUT.tick(GM);
      check('6. 出發：選單是「出發：我們的日子：約在公館／晚一點／不去了」→ 地點字幕「公館」→ 她說「書桌上那疊考古題……」；沒有別的台詞、沒有選項',!!q&&(H.opts[0]||[])[0]==='出發：我們的日子：約在公館'&&caps.includes('公館')&&H.said.length===1&&H.said[0].t===DOC_SLOT[0].line&&H.opts.length===1&&q.state==='done',JSON.stringify(H.opts)+JSON.stringify(caps)+JSON.stringify(H.said)); }
    /* 一路跳：6/10 晚上到 2030-12-13（沒報國考、只和可昕交往、KX_OUR_DAY 週日）*/
    { const G=fresh('2029-06-10',22,{},{day:'sun',mode:'nccu'}); PHONE.join(G,'noodle_team','麵店團');
      const seen=[], bad=[], warns=[], ow=console.warn; let it=0, err=null; const end=T(D('2030-12-13'),24); console.warn=(...a)=>{ warns.push(a.map(x=>x&&x.stack?x.stack.split('\n')[0]:String(x)).join(' ')); };
      try{ for(it=0;it<400&&G.day*24+G.hour<end;it++){ const before=G.day*24+G.hour;
          const y=await y4(GM); if(y) continue;
          const q=OUT.due(G); if(q){ H.said=[]; H.picks=[0]; await OUT.tick(GM); if(/^kx_od_/.test(q.id)) seen.push({id:q.id,at:before,slot:T(q.day,q.h),t:(H.said[0]||{}).t,cap:caps[caps.length-2]}); continue; }
          const s=PG.due(G); if(s){ H.picks=[]; await PG.runStep(GM,s); continue; }
          E.player.busy=false; if(!await PG.advance(GM)) break;
          if(G.day*24+G.hour<before-1e-6) bad.push('倒退 '+lab(G.day,G.hour)); } }catch(e){ err=e; } finally { console.warn=ow; }
      check('6. 一路跳的途中不丟例外、沒有警告（被吞掉的錯誤）',!err&&!warns.length,(err&&err.stack||'')+warns.slice(0,3).join('｜'));
      const want=DOC_SLOT.map(s=>{ const d=D(iso(s.seg,s.md))+(s.week?6:0); return 'kx_od_'+d; });   /* P3：週日（那一週的週一＋6）*/
      const TRAVEL={'公館':1/6,'河濱':0.25,'木柵大學・山下的小吃街':2/3,'電話':0};
      for(const x of seen){ const tr=TRAVEL[x.cap]; if(tr==null||Math.abs(x.at-(x.slot-tr-0.25))>1e-6) bad.push(x.id+' 停在 '+lab(Math.floor(x.at/24),x.at%24)+'（'+x.cap+'）'); }
      check('6. 一路「跳到下一件事」到 2030-12-13：25 格每一格都停（停的時間就是該問的時間：約好的時間減車程再減 15 分鐘）、照順序、每一句照稿',!err&&!bad.length&&want.length===25&&JSON.stringify(seen.map(x=>x.id))===JSON.stringify(want)&&seen.every((x,i)=>x.t===DOC_SLOT[i].line),(err&&err.stack||'')+bad.join('、')+' '+seen.length+'/'+want.length+' it='+it);
      check('6. 五段的開頭那一則都在 21:00 傳到了（KX_OD_PG 最後是 p5）',['p1','p2','p3','p4','p5'].every(sg=>PHONE.sent(G,'kx_od_pg_'+sg))&&G.flags.KX_OD_PG==='p5'); } });
  /* ---------- 7 分手 ---------- */
  await sec('7',async()=>{ const G=fresh('2029-06-17',18.6); H.tick(); const q=OUT.get(G,'kx_od_'+D('2029-06-17')); const was=q&&q.state;
    ROM.end(G,'kexin','apart_talk'); H.tick(); const p2=PG.MSGS.find(m=>m.tag==='kx_od_pg_p2');
    check('7. 分手：已經排好的那一格改成 skipped（不會再問、不會過期算沒去），之後沒有格子、不再有停點、P2 的開頭那一則不傳',was==='planned'&&q.state==='skipped'&&!OUT.due(G)&&PGDATE.upcoming(G).length===0&&PGDATE.stop(G)==null&&!!p2&&!p2.cond(G),was+'→'+(q&&q.state)); });
  /* ---------- 8 舊存檔 ---------- */
  await sec('8',async()=>{ const G=fresh('2029-09-12',10); H.tick(); const before=(G.outings||[]).filter(q=>/^kx_od_/.test(q.id)).length;
    const q=await untilOut(G,20), pl=(G.outings||[]).filter(q=>/^kx_od_/.test(q.id));
    check('8. 舊存檔 2029-09-12 讀檔：從下一格 9/23 開始（8/12～9/9 不補、不一次排一堆），讀檔當下什麼都不排；開頭那一則（8/5）已經過了一週，不補',before===0&&!!q&&q.id==='kx_od_'+D('2029-09-23')&&pl.length===1&&!PHONE.sent(G,'kx_od_pg_p2')&&!PHONE.sent(G,'kx_od_pg_p1'),(q&&q.id)+' '+JSON.stringify(pl.map(q=>q.id)));
    check('8. 舊存檔：新的旗標都有預設（沒有 KX_OD_PG、沒有 PG_DATE_*，照樣排）',G.flags.KX_OD_PG==null&&!Object.keys(G.flags).some(k=>/^PG_DATE_/.test(k))&&!!q); });
  /* ---------- 9 AA_351 ---------- */
  await sec('9',async()=>{ const setup=(crack,two)=>{ const G=fresh('2029-06-17',18.6); if(two){ H.FRIEND('heroine_01'); H.date('heroine_01'); } G.flags.KX_CRACK=crack; H.tick(); return [G,OUT.get(G,'kx_od_'+D('2029-06-17'))]; };   /* 18:36：該問了（18:35 起）*/
    let [G,q]=setup(2); H.picks=[0]; await OUT.tick(GM); const a=G.flags.KX_CRACK, q0=!!q;
    [G,q]=setup(0); H.picks=[0]; await OUT.tick(GM); const b=G.flags.KX_CRACK;
    [G,q]=setup(1); H.picks=[1]; await OUT.tick(GM); G.hour+=1/3; H.picks=[1]; await OUT.tick(GM); G.hour+=1/3; H.picks=[0]; await OUT.tick(GM); const c=G.flags.KX_CRACK, cLate=q&&q.state;
    [G,q]=setup(1); H.picks=[1]; await OUT.tick(GM); G.hour+=1/3; H.picks=[1]; await OUT.tick(GM); G.hour+=1/3; H.picks=[1]; await OUT.tick(GM); G.hour=19.6; await OUT.tick(GM); const d=G.flags.KX_CRACK, dSt=q&&q.state;
    [G,q]=setup(1); H.picks=[2]; await OUT.tick(GM); const e=G.flags.KX_CRACK;
    [G,q]=setup(1); G.hour=19.6; await OUT.tick(GM); const f=G.flags.KX_CRACK;
    [G,q]=setup(2,true); H.picks=[1]; await OUT.tick(GM); G.hour+=1/3; H.picks=[1]; await OUT.tick(GM); G.hour+=1/3; H.picks=[0]; await OUT.tick(GM); const g=G.flags.KX_CRACK;
    check('9. AA_351（只和她一位交往）：準時到 −1（2→1）、已經是 0 就不往下（最低 0）',q0&&a===1&&b===0,JSON.stringify([q0,a,b]));
    check('9. AA_351：說了兩次「晚一點」才出發（到的時候晚 25 分鐘，超過 15 分鐘）＋1',c===2&&cLate==='done',JSON.stringify([c,cLate]));
    check('9. AA_351：說了「晚一點」最後過了時間沒到＋1；「不去了」、沒有回答就過了＝略過，不算',d===2&&dSt==='missed'&&e===1&&f===1,JSON.stringify([d,dSt,e,f]));
    check('9. AA_351：同時和兩位交往（不是只和她一位）不算',q0&&g===2,JSON.stringify(g)); });
  /* ---------- 10 不排的玩家 ---------- */
  await sec('10',async()=>{ const A=fresh('2029-06-10',21.1,{},null); H.tick(); const a=H.msgs('p:kexin').length+PGDATE.upcoming(A).length;   /* 沒交往 */
    const B=fresh('2029-06-10',21.1,{},null); H.date('kexin'); H.tick(); const b=H.msgs('p:kexin').length+PGDATE.upcoming(B).length;   /* 交往中、沒有 KX_OUR_DAY */
    const C=fresh('2029-06-01',21.1); delete C.flags.GRADUATED; delete C.flags.GRAD_DONE; PG.rec(C).done.grad=0; H.tick(); const c=H.msgs('p:kexin').length+PGDATE.upcoming(C).length+(PGDATE.stop(C)==null?0:1)+(PG.on(C)?1:0);   /* 還沒畢業（6/2 以前）＝不是畢業後篇 */
    const Dg=fresh('2029-06-10',21.1); Dg.stage='econ'; H.tick(); const d=H.msgs('p:kexin').length+PGDATE.upcoming(Dg).length;   /* 不是法律系 */
    const E2=fresh('2029-06-10',21.1); H.tick(); const e=H.msgs('p:kexin').length;   /* 對照：交往中、有 KX_OUR_DAY＝有 */
    check('10. 沒交往、交往中但沒有 KX_OUR_DAY、不是畢業後篇（還沒畢業）、不是法律系：沒有開頭那一則、沒有格子（對照組有）',a===0&&b===0&&c===0&&d===0&&e===2,JSON.stringify([a,b,c,d,e]));
    const G=fresh('2029-06-03',10); H.FRIEND('heroine_01'); H.date('heroine_01'); const G1=fresh('2029-06-03',10);
    check('10. 同時和以安交往：可昕的 25 格照排、日子不變（她的日子是固定的）',keys(G).length===25&&JSON.stringify(keys(G))===JSON.stringify(keys(G1))); });
  H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
