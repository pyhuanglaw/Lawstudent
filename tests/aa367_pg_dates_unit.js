// AA_367（企劃線 a7bd9741，AA_382 改十句以後 e6d4a198；任務 AA367-PG-DATES-1021）畢業以後交往中的六位每月一格（以安、芷若、語彤、子晴、學姊、沛珊）——不需要瀏覽器。
//   0  載入：src/data/pg_dates.js、src/pgdates3d.js；102 個事件（每一格一個）
//   1  逐字對稿：從 git 讀 e6d4a198 的稿（第 1～6 節的月份表），和資料、事件裡她說的那一句比；句子後面的（視訊）（打烊後）（電影）（台南）＝程式的方式
//   2  時間、地點照各節：以安週六 15:00 總圖 B1、紐約＝臺灣週日 08:00 視訊；芷若雙月週六 22:00 打烊後、單月週日 10:00 早場電影；語彤 21:30 麵店打烊；子晴 23:00 公館宵夜；
//      學姊 18:30 法圖旁邊那家；沛珊週六 22:00 視訊、四個月去台南（當天來回、高鐵）
//   3  日子：每月第一個週六；撞到別的停點（稿上舉的四天、PG 的場景、別的出遊、可昕的格子、排在前面的另一位）往後找同月的下一個週六；整個月排不到就跳過；2030-12 只有 12/7
//   4  不排：表上沒有的月份；語彤、學姊照路線的那幾條；交換延畢的 2029-12（大五上其他月份照排，AA_367 第 10 節 A4）
//   5  長跳停在格子上；出發＝地點字幕＋她那一句；一路跳到 2030-12-13（以安、芷若、沛珊同時交往）每一格都停、一句不差；PG_DATE_<id>
//   6  分手（ROM.end）、AA_346 選了另一位：排好的改 skipped、之後不排；被選的那一位照排
//   7  舊存檔：讀檔那個月開始（那個月的第一個週六過了＝同月下一個週六），過去的月份不補、讀檔當下不一次排一堆
//   8  沒交往：沒有格子
// 修改前（開發分支 2eba2fab）：沒有 pg_dates.js、pgdates3d.js——每一節照樣跑（用空的替身），全部 FAIL（第 1 節讀稿那兩項除外）。用法：node tests/aa367_pg_dates_unit.js
// 2026-10-28 AA_523 第 6-5 點改的（企劃線 0d7b5388b，SIS-B16-1028）：學姊 2029-06 那一句「論文送進圖書館了。……」（早於 6/20「交了。」）換成 AA_523 第 6 節 6-5 那一列「改成」的那一句——
//   讀稿以後，學姊 2029-06 那一格照 AA_523 6-5 換（同 tools/story/import_pg_dates.py；多一項查換了、舊句子真的是那一句）；第 1、5 項照換過的稿比（檢查沒有拿掉）
require('./alison.js');   /* AA_380：企劃線的舊稿還寫「小語」，讀稿的時候照匯入工具換成 Alison */
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H;
const NAMES=/^(NOODLE_CLOSED|R2Y4B|R2Y4B_EVENTS|Y5|PG_DATES|PGDATE)$/;
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.CG_REGISTRY={};
for(const f of ['src/noodle_closed3d.js','src/data/r2y4b_events.js','src/r2y4b3d.js','src/y5s1_3d.js','src/data/pg_dates.js','src/pgdates3d.js']) if(fs.existsSync(path.join(H.ROOT,f))) load(f);
const ok0=typeof PG_DATES!=='undefined'&&typeof PGDATE!=='undefined';
/* 修改前沒有的：空的替身（每一節照樣跑、照樣 FAIL，不在第 0 項就停）*/
if(typeof PG_DATES==='undefined') global.PG_DATES={kexin:{segs:{},slots:[]},six:{}};
if(typeof PGDATE==='undefined') global.PGDATE={upcoming:()=>[],stop:()=>null,wants:()=>false,busyDays:()=>new Set(),sixMonth:()=>({}),MONTHS:[],MODE:{},sixMode:()=>({}),SIX:[]};
const caps=[]; GM.caption=(a,b)=>{ caps.push(b); };
let paid=[]; GM.money=(n,why)=>{ paid.push([n,why]); };
const D=k=>PG.DK(k), T=(d,h)=>d*24+h, lab=(d,h)=>PG.dateLabel(d,h);
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,2).join(' / ')); } };
const SRC='docs/story_planning/AA_367_畢業以後的交往節奏_六位.md', SHA='1ebcf530';   /* AA_472 第 6 節：沛珊 2030-06 前面加「說好的，運河一圈。」，白名單改成 1ebcf530（原本 e6d4a198）*/   /* AA_382 第 3 節：AA 改了十句（哪一個週六都說得通），白名單改成 e6d4a198 */
const SIX=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan'];
check('0. 載入 pg_dates.js、pgdates3d.js；102 個事件（每一格一個）、PG.stops／PG.RULES 有掛',ok0&&STORY_EVENTS.filter(e=>/^ev_pg_date_/.test(e.id)).length===102&&PG.stops.includes(PGDATE.stopFn)&&Array.isArray(PG.RULES)&&PG.RULES.includes(PGDATE.rulesFn));
/* ---------- 稿（從 git 讀；測試自己的讀法）---------- */
let doc=''; try{ doc=cp.execFileSync('git',['-C',process.env.PG_DOC_REPO||H.ROOT,'show',SHA+':'+SRC],{encoding:'utf8'}); }catch(e){ doc=''; }
const DOC={}, SECT={}; { let who=null; for(const l of doc.split('\n')){ const m=l.match(/^## (\d)\. .*（(\w+)）\s*$/); if(m){ who='123456'.includes(m[1])?m[2]:null; if(who) SECT[who]=[]; continue; } if(l.startsWith('## ')){ who=null; continue; }
    if(!who) continue; SECT[who].push(l); const r=l.match(/^\| (20\d\d-\d\d) \| 「(.*)」(（[^）]*）)? \|$/); if(r) (DOC[who]||(DOC[who]=[])).push({ym:r[1],line:r[2],note:(r[3]||'').replace(/[（）]/g,'')}); } }
/* AA_523 6-5（企劃線 0d7b5388b）：學姊 2029-06 那一格換成第 6 節 6-5 那一列「改成」欄的那一句（稿上原本那一句要以「論文送進圖書館了。」開頭）*/
let doc523=''; try{ doc523=cp.execFileSync('git',['-C',process.env.AA523_DOCREPO||process.env.PG_DOC_REPO||H.ROOT,'show','0d7b5388b:docs/story_planning/AA_523_學姊第十六批_回臺灣以後的最後半年.md'],{encoding:'utf8'}); }catch(e){ doc523=''; }
const R65={}; { const row=doc523.split('\n').find(l=>l.startsWith('| 6-5 |'))||'', c=row.split('|').map(x=>x.trim()), m=/^「([^」]+)」/.exec(c[4]||''), cell=(DOC.heroine_05||[]).find(r=>r.ym==='2029-06');
  R65.ok=!!m&&/2029-06/.test(c[3]||'')&&!!cell&&cell.line.startsWith('論文送進圖書館了。'); R65.old=cell&&cell.line; if(R65.ok){ R65.line=m[1]; cell.line=m[1]; } }
const docLine=(id,ym)=>((DOC[id]||[]).find(r=>r.ym===ym)||{}).line;
/* ---------- 存檔 ---------- */
const fresh=(key,h,flags,who)=>{ const G=H.fresh(key,h,'dorm',Object.assign({MOVED_OUT:D('2029-06-28'),HOME_AFTER:'home',Y4_PATH:'other',PACKED_Y4:D('2029-06-01'),ROOM_Y2:true,ROOM_Y3:true,ROOM_Y4:true},flags||{}));
  G.acts={att:{}}; G.outings=[]; G.flags.GRADUATED=PG.gradDay(); G.flags.GRAD_DONE=true; PG.rec(G).done.grad=1; for(const e of ['ev_grad_family','ev_grad_lunch','ev_grad_envelope','ev_y4_path','ev_move_out_y4']) G.events.done[e]=1;
  for(const id of [].concat(who||[])){ H.FRIEND(id); H.date(id); if(id==='kexin'&&!G.flags.KX_OUR_DAY) G.flags.KX_OUR_DAY={day:'sat',mode:'mid'}; } caps.length=0; paid=[]; return G; };   /* 交往中的人一定認識（名字照 SOCIAL.displayName：學姊＝書瑀）*/
/* 某一位整段的格子（從那一天起往後每個月；不排、排不到的月份不在裡面）*/
const plan=G=>{ const busy=PGDATE.busyDays(G,G.day,D('2030-12-14')), out={}; for(const ym of PGDATE.MONTHS){ const M=PGDATE.sixMonth(G,ym,busy); for(const id in M) (out[id]||(out[id]={}))[ym]=lab(M[id].day,M[id].h); } return out; };
const months=(G,id)=>Object.keys(plan(G)[id]||{});
const y4=async GM=>{ const G=GM.G; if(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G)) return null;   /* 照 story3d.js S.y4Tick（同 tests/postgrad_days_unit.js）*/
  if(STORY.packDue(G)){ await STORY.packY4(GM); return 'pack'; } if(STORY.gradMorningDue(G)){ await STORY.gradFamily(GM); return 'family'; } if(STORY.gradLunchDue(G)){ await STORY.gradLunch(GM); return 'lunch'; }
  if(G.zone==='dorm'&&STORY.gradEnvelopeDue(G)){ await STORY.gradEnvelope(GM); return 'envelope'; } if(STORY.moveOutDue(G)){ await STORY.moveOutY4(GM); return 'moveout'; } return null; };
/* 跳到下一件事，直到有出遊要問「出發」（最多 n 次）*/
const untilOut=async(G,n)=>{ for(let i=0;i<(n||30)&&!OUT.due(G);i++){ const s=PG.due(G); if(s){ H.picks=[]; await PG.runStep(GM,s); continue; } E.player.busy=false; if(!await PG.advance(GM)) break; } return OUT.due(G); };
(async()=>{
  await sec('1',async()=>{
    check('1. 讀得到企劃線 '+SHA+' 的 AA_367',doc.length>1000&&doc.includes('## 0. 共通規格'));
    check('1. 稿：六位的月份表一共 102 句',SIX.every(id=>DOC[id])&&SIX.reduce((n,id)=>n+DOC[id].length,0)===102,SIX.map(id=>(DOC[id]||[]).length).join(','));
    { const d=(PG_DATES.six.heroine_05||[]).find(x=>x.ym==='2029-06');
      check('1. AA_523 6-5（0d7b5388b）：學姊 2029-06 那一格照第 6 節 6-5 換成「'+R65.line+'」；稿上舊的那一句（「論文送進圖書館了。……」）不在資料裡',R65.ok&&R65.line==='修正本改完了。這禮拜印，下禮拜交。'&&!!d&&d.line===R65.line&&d.line!==R65.old,JSON.stringify(R65)); }
    const bad=[]; for(const id of SIX) for(const r of (DOC[id]||[])){ const d=(PG_DATES.six[id]||[]).find(x=>x.ym===r.ym); if(!d||d.line!==r.line) bad.push(id+' '+r.ym+' 資料');
      const ev=STORY_EVENTS.find(e=>e.id==='ev_pg_date_'+id+'_'+r.ym), ln=ev&&ev.dialogue.find(l=>l.speaker===id); if(!ln||ln.text!==r.line) bad.push(id+' '+r.ym+' 事件'); }
    for(const id of SIX) if((PG_DATES.six[id]||[]).length!==(DOC[id]||[]).length) bad.push(id+' 數量');
    check('1. 逐字對稿：102 句（資料、事件裡她說的那一句）一字不差；資料沒有多出稿上沒有的月份',!bad.length,bad.slice(0,8).join('、')+(bad.length>8?'…（'+bad.length+'）':''));
    const mode=(id,ym)=>{ const m=PGDATE.sixMode(id,ym)||{}; return (PGDATE.MODE[m.m]||{}).kind+':'+m.m; }, bad2=[];
    for(const r of DOC.heroine_01) if((r.note==='視訊')!==(mode('heroine_01',r.ym)==='video:ny')) bad2.push('以安 '+r.ym);
    for(const r of DOC.heroine_02) if((r.note==='打烊後'?'meet:cafe':(r.note==='電影'?'meet:movie':'?'))!==mode('heroine_02',r.ym)) bad2.push('芷若 '+r.ym);
    for(const r of DOC.classmate_peishan) if((r.note==='台南'?'tn:tn':(r.note==='視訊'?'video:video':'?'))!==mode('classmate_peishan',r.ym)) bad2.push('沛珊 '+r.ym);
    check('1. 稿上句子後面的註＝程式的方式：以安（視訊）＝紐約視訊；芷若（打烊後）＝雙月 Café、（電影）＝單月早場電影；沛珊（台南）＝去台南、（視訊）＝視訊',!bad2.length,bad2.slice(0,6).join('、')); });
  /* ---------- 2 時間、地點 ---------- */
  await sec('2',async()=>{ const S=id=>(SECT[id]||[]).join('\n'), M=(id,ym)=>PGDATE.sixMode(id,ym)||{}, h=(id,ym)=>M(id,ym).h, off=(id,ym)=>M(id,ym).off, pl=(id,ym)=>(PGDATE.MODE[M(id,ym).m]||{}).place;
    check('2. 以安：臺北「週六 15:00」總圖 B1 的長桌；2030-08-11 以後「臺灣時間週日 08:00」視訊（紐約）',/臺北：週六 15:00，在\*\*總圖 B1 的長桌\*\*/.test(S('heroine_01'))&&/臺灣時間週日 08:00/.test(S('heroine_01'))&&h('heroine_01','2029-06')===15&&off('heroine_01','2029-06')===0&&pl('heroine_01','2029-06')==='總圖 B1 的長桌'&&h('heroine_01','2030-09')===8&&off('heroine_01','2030-09')===1&&pl('heroine_01','2030-09')==='視訊（紐約）'&&/「視訊（紐約）」/.test(doc));
    check('2. 芷若：雙月「週六 22:00」Café 打烊以後；單月「週日早上 10:00」早場電影',/雙月（10、12、2、4……）：週六 22:00，\*\*Café 打烊以後\*\*/.test(S('heroine_02'))&&/單月（11、1、3……）：改週日早上 10:00，\*\*早場電影\*\*/.test(S('heroine_02'))&&h('heroine_02','2029-10')===22&&off('heroine_02','2029-10')===0&&h('heroine_02','2029-11')===10&&off('heroine_02','2029-11')===1&&pl('heroine_02','2029-11')==='早場電影'&&/Café 打烊以後/.test(pl('heroine_02','2029-10')||''));
    check('2. 語彤「週六 21:30，麵店打烊以後」；子晴「週六 23:00，公館宵夜」；學姊「週六 18:30，法圖旁邊那家」（稿上的地點字幕例子）',/週六 21:30，\*\*麵店打烊以後\*\*/.test(S('heroine_03'))&&h('heroine_03','2029-06')===21.5&&pl('heroine_03','2029-06')==='麵店打烊以後'
      &&/週六 23:00，\*\*公館宵夜\*\*/.test(S('heroine_04'))&&h('heroine_04','2029-06')===23&&pl('heroine_04','2029-06')==='公館宵夜'&&/週六 18:30，\*\*法圖旁邊那家\*\*/.test(S('heroine_05'))&&h('heroine_05','2029-06')===18.5&&pl('heroine_05','2029-06')==='法圖旁邊那家'&&/「法圖旁邊那家」/.test(doc));
    check('2. 沛珊：平常「週六 22:00 視訊」；2029-10、2030-03、2030-06、2030-10 去台南（週六當天來回、高鐵）',/週六 22:00 \*\*視訊\*\*/.test(S('classmate_peishan'))&&/（2029-10、2030-03、2030-06、2030-10）：週六當天來回，坐高鐵/.test(S('classmate_peishan'))&&h('classmate_peishan','2029-08')===22&&pl('classmate_peishan','2029-08')==='視訊'
      &&['2029-10','2030-03','2030-06','2030-10'].every(ym=>M('classmate_peishan',ym).m==='tn')&&(PGDATE.MODE.tn||{}).travel==='高鐵約一小時四十分鐘'&&(PGDATE.MODE.tn||{}).fare===2700);
    { const G=fresh('2029-06-03',10,{},'classmate_peishan'), sp=ym=>(PGDATE.sixSlot(G,'classmate_peishan',ym,D(ym+'-06'),M('classmate_peishan',ym))||{}).place;
      check('2. 沛珊去台南的地點字幕（AA_367 第 10 節 A3）：2029-10、2030-03、2030-06「台南・她的學校」；2030-10「台南・她實習的國小」',['2029-10','2030-03','2030-06'].every(ym=>sp(ym)==='台南・她的學校')&&sp('2030-10')==='台南・她實習的國小',JSON.stringify(['2029-10','2030-03','2030-06','2030-10'].map(sp))); } });
  /* ---------- 3 日子 ---------- */
  await sec('3',async()=>{
    { const P=plan(fresh('2029-06-03',10,{},'heroine_01')).heroine_01;
      check('3. 以安一個人：每月第一個週六 15:00；6/2 畢業典禮→6/9、8/4 一試→8/11、2/2 除夕→2/9；紐約（9 月起）＝那個週六的隔天、臺灣週日 08:00；12 月只有 12/7 那一格（12/8 視訊）',
        JSON.stringify(P)===JSON.stringify({'2029-06':'6/9（六）15:00','2029-07':'7/7（六）15:00','2029-08':'8/11（六）15:00','2029-10':'10/6（六）15:00','2029-11':'11/3（六）15:00','2030-02':'2/9（六）15:00','2030-04':'4/6（六）15:00','2030-05':'5/4（六）15:00','2030-06':'6/1（六）15:00','2030-07':'7/6（六）15:00','2030-09':'9/8（日）08:00','2030-10':'10/6（日）08:00','2030-11':'11/3（日）08:00','2030-12':'12/8（日）08:00'}),JSON.stringify(P)); }
    { const P=plan(fresh('2029-06-03',10,{},'heroine_04')).heroine_04||{};
      check('3. 子晴（每個月都排）：2030-08-03 一試→8/10；2029-09-01、2029-12-01、2030-06-01 是第一個週六就排在那天；2030-02 在 2/9（她生日 2/10 的前一天）',P['2030-08']==='8/10（六）23:00'&&P['2029-09']==='9/1（六）23:00'&&P['2029-12']==='12/1（六）23:00'&&P['2030-06']==='6/1（六）23:00'&&P['2030-02']==='2/9（六）23:00'&&Object.keys(P).length===19,JSON.stringify(P)); }
    { const G=fresh('2029-06-03',10,{},'heroine_01'); OUT.plan(G,{id:'t_other',ev:'ev_x',day:D('2029-07-07'),h:15,place:'x',title:'x',silent:true});
      const a=(plan(G).heroine_01||{})['2029-07']; G.outings=[];
      PG.STEPS.push({id:'t_step_1006',at:G=>T(D('2029-10-06'),12),until:G=>T(D('2029-10-07'),0),cond:G=>true,run:async()=>{}}); const b=(plan(G).heroine_01||{})['2029-10']; PG.STEPS.pop();
      PG.STEPS.push({id:'t_step_1006',at:G=>T(D('2029-10-06'),12),until:G=>T(D('2029-10-07'),0),cond:G=>false,run:async()=>{}}); const c=(plan(G).heroine_01||{})['2029-10']; PG.STEPS.pop();
      check('3. 那一天有別的出遊（7/7）→ 7/14；那一天有 PG 的場景（10/6）→ 10/13；場景的條件不成立＝不算',a==='7/14（六）15:00'&&b==='10/13（六）15:00'&&c==='10/6（六）15:00',JSON.stringify([a,b,c])); }
    { const P=plan(fresh('2029-06-03',10,{},['heroine_02','kexin'])).heroine_02||{}, P2=plan(fresh('2029-06-03',10,{KX_OUR_DAY:{day:'sun',mode:'mid'}},['heroine_02','kexin'])).heroine_02||{}, P3=plan(fresh('2029-06-03',10,{},'heroine_02')).heroine_02||{};
      check('3. 同時和可昕交往：芷若單月的週日撞到可昕的格子（2030-03-03、05-05、07-07、11-03）→ 往後一週；可昕 P3 週日 11/4 → 芷若 11 月 11/11；沒和可昕交往的照原本',
        P['2030-03']==='3/10（日）10:00'&&P['2030-05']==='5/12（日）10:00'&&P['2030-07']==='7/14（日）10:00'&&P['2030-11']==='11/10（日）10:00'&&P['2029-11']==='11/4（日）10:00'&&P2['2029-11']==='11/11（日）10:00'&&P3['2030-03']==='3/3（日）10:00'&&P3['2029-11']==='11/4（日）10:00',JSON.stringify([P,P2['2029-11'],P3])); }
    { const P=plan(fresh('2029-06-03',10,{},['heroine_01','heroine_05'])), A=P.heroine_01||{}, B=P.heroine_05||{};
      check('3. 同時和以安、學姊交往：同一天撞到兩位＝第二位（學姊）往後找下一個週六（6/9→6/16）；12 月只剩 12/7：以安在紐約是 12/8 視訊、學姊排 12/7',A['2029-06']==='6/9（六）15:00'&&B['2029-06']==='6/16（六）18:30'&&B['2030-12']==='12/7（六）18:30'&&A['2030-12']==='12/8（日）08:00',JSON.stringify([A['2029-06'],B['2029-06'],B['2030-12'],A['2030-12']])); }
    { const P=plan(fresh('2029-06-03',10,{},['heroine_02','heroine_03'])), Z=P.heroine_02||{}, Y=P.heroine_03||{};
      const G2=fresh('2029-06-03',10,{},'heroine_03'); OUT.plan(G2,{id:'t_1207',ev:'ev_x',day:D('2030-12-07'),h:12,place:'x',title:'x',silent:true}); const P2=plan(G2).heroine_03||{};
      check('3. 整個月都排不到就跳過：2030-12 只有 12/7 一個週六——芷若排了，語彤那個月沒有；12/7 有別的事＝語彤那個月沒有',Z['2030-12']==='12/7（六）22:00'&&!Y['2030-12']&&!P2['2030-12']&&P2['2030-11']==='11/2（六）21:30',JSON.stringify([Z['2030-12'],Y['2030-12'],P2['2030-12']])); } });
  /* ---------- 4 不排 ---------- */
  await sec('4',async()=>{
    { const all=id=>months(fresh('2029-06-03',10,{},id),id); const T1=all('heroine_01'), T2=all('heroine_02'), T3=all('heroine_03'), T6=all('classmate_peishan');
      check('4. 表上沒有的月份不排：以安 2029-09、12、2030-01、03、08；芷若 2029-06～09；語彤 2029-09；沛珊 2029-06、07',
        ['2029-09','2029-12','2030-01','2030-03','2030-08'].every(m=>!T1.includes(m))&&T1.length===14&&['2029-06','2029-07','2029-08','2029-09'].every(m=>!T2.includes(m))&&T2.length===15&&!T3.includes('2029-09')&&T3.length===18&&!T6.includes('2029-06')&&!T6.includes('2029-07')&&T6.length===17,JSON.stringify([T1,T2,T3,T6].map(x=>x.length))); }
    { const yt=(flags)=>months(fresh('2029-06-03',10,flags,'heroine_03'),'heroine_03');
      const a=yt({BAR_STUDY_GROUP:['yutong']}), b=yt({BAR_STUDY_GROUP:['kexin','yutong'],BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:15}), c=yt({BAR_STUDY_GROUP:['yutong'],BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:9}), d=yt({BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:9}), e=yt({BAR_STUDY_GROUP:['kexin']});
      check('4. 語彤：有讀書小組（有她）＝沒有 2029-06～08；2029 年上榜＋小組＝也沒有 2029-12；重考＋小組＝也沒有 2030-07、12；重考沒有小組、小組只有可昕＝照排',
        a.length>0&&!a.some(m=>m<'2029-09')&&a.includes('2029-12')&&!b.includes('2029-12')&&!b.some(m=>m<'2029-09')&&!c.includes('2030-07')&&!c.includes('2030-12')&&c.includes('2029-12')&&d.includes('2030-07')&&d.includes('2030-12')&&d.includes('2029-06')&&e.includes('2029-06')&&e.length===18,JSON.stringify({a,b,c,d,e})); }
    { const sis=flags=>months(fresh('2029-06-03',10,flags,'heroine_05'),'heroine_05');
      const none=sis({}), reg=sis({BAR_REG:true}), fail=sis({BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:9}), pass=sis({BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:14}), d30=sis({EXCHANGE_ROUTE:'US',BAR_REG_2030:true});
      check('4. 學姊：沒報國考＝19 個月都排；2029 年報了國考＝沒有 2029-08；沒考上要重考＝也沒有 2029-09、2030-08、2030-12；上榜＝沒有 2029-08、2029-12；2030 年才考（交換延畢）＝沒有 2030-08、12（還有大五上）',
        none.length===19&&!reg.includes('2029-08')&&reg.length===18&&!fail.includes('2029-09')&&!fail.includes('2030-08')&&!fail.includes('2030-12')&&fail.includes('2029-12')&&!pass.includes('2029-12')&&!pass.includes('2029-08')&&pass.includes('2029-09')&&!d30.includes('2030-08')&&!d30.includes('2030-12')&&d30.includes('2029-08'),JSON.stringify({reg,fail,pass,d30})); }
    { const P=plan(fresh('2029-06-03',10,{EXCHANGE_ROUTE:'JP'},SIX)); const bad=SIX.filter(id=>Object.keys(P[id]||{}).includes('2029-12'));
      const Z=months(fresh('2029-06-03',10,{EXCHANGE_ROUTE:'JP'},'heroine_04'),'heroine_04'), Zu=months(fresh('2029-06-03',10,{EXCHANGE_ROUTE:'US'},'heroine_04'),'heroine_04');
      check('4. 交換延畢（日本、美國路線）：大五上 2029-09～2030-01 照排，只有 2029-12 不排（12/21 延畢的期末約會；AA_367 第 10 節 A4，e6d4a198——原本「大五上都不排」作廢）；子晴 19-1＝18 個月',
        Object.keys(P).length>0&&!bad.length&&Z.length===18&&!Z.includes('2029-12')&&['2029-08','2029-09','2029-10','2029-11','2030-01','2030-02'].every(m=>Z.includes(m))&&JSON.stringify(Zu)===JSON.stringify(Z),bad.join(',')+' '+JSON.stringify(Z)); }
    { const yt={BAR_STUDY_GROUP:['heroine_03']}, Y1=months(fresh('2029-06-03',10,Object.assign({EXCHANGE_ROUTE:'JP',BAR_REG_2030:true},yt),'heroine_03'),'heroine_03'), Y2=months(fresh('2029-06-03',10,Object.assign({EXCHANGE_ROUTE:'JP',BAR_REG_2030:false},yt),'heroine_03'),'heroine_03');
      check('4. 語彤：交換延畢 2030 第一次考、讀書小組有她＝沒有 2030-07、12（7/11 總圖 B1、12/13 麵店會演；AA_367 第 10 節 A4）；2030 不考＝照排',
        !Y1.includes('2030-07')&&!Y1.includes('2030-12')&&Y2.includes('2030-07')&&Y2.includes('2030-12'),JSON.stringify({Y1,Y2})); } });
  /* ---------- 5 長跳停在格子上 ---------- */
  await sec('5',async()=>{
    { const G=fresh('2029-06-03',10,{},'heroine_05'); H.tick(); STORY.phoneRules(GM); PHONE.tick(G);   /* [前置] 測試存檔缺的舊訊息先送完 */
      const q=await untilOut(G,10), ask=T(D('2029-06-09'),18.5)-1/6-0.25;
      check('5. 學姊：跳到下一件事＝停在 6/9 18:05（18:30 減走路 10 分鐘、再減 15 分鐘；不是整點）、排成出遊 pg_date_heroine_05_2029-06、記 PG_DATE_heroine_05',!!q&&q.id==='pg_date_heroine_05_2029-06'&&Math.abs(G.day*24+G.hour-ask)<1e-6&&lab(G.day,G.hour)==='6/9（六）18:05'&&JSON.stringify(G.flags.PG_DATE_heroine_05)==='["2029-06"]',lab(G.day,G.hour)+' '+(q&&q.id));
      H.picks=[0]; H.said=[]; caps.length=0; H.opts=[]; if(q) await OUT.tick(GM);
      check('5. 出發：地點字幕「法圖旁邊那家」→ 她（交往中叫書瑀）說 2029-06 那一句；沒有選項',!!q&&caps.includes('法圖旁邊那家')&&H.said.length===1&&H.said[0].t===docLine('heroine_05','2029-06')&&H.said[0].who==='書瑀'&&H.opts.length===1&&q.state==='done',JSON.stringify(caps)+JSON.stringify(H.said)); }
    { const G=fresh('2029-10-06',8.5,{},'classmate_peishan'); H.tick(); const q=OUT.due(G); H.picks=[0]; H.said=[]; caps.length=0; H.opts=[]; if(q) await OUT.tick(GM);
      check('5. 沛珊 2029-10 去台南：10:30 到（08:30 就問「出發」：高鐵一小時四十分鐘）、票錢 2700、地點字幕「台南・她的學校」、她那一句；傍晚送上車、回到臺北 18:45',!!q&&q.title==='去台南找'+SOCIAL.displayName('classmate_peishan')&&caps.includes('台南・她的學校')&&H.said.length===1&&H.said[0].t===docLine('classmate_peishan','2029-10')&&paid.some(p=>p[0]===-2700)&&lab(G.day,G.hour)==='10/6（六）18:45'&&caps.includes('回到臺北。'),JSON.stringify([q&&q.title,caps,H.said,paid,lab(G.day,G.hour)])); }
    { const G=fresh('2030-09-08',7.8,{},'heroine_01'); H.tick(); const q=OUT.due(G); H.picks=[0]; H.opts=[]; H.said=[]; caps.length=0; if(q) await OUT.tick(GM);
      check('5. 以安在紐約：臺灣週日 07:45 問「接起來」、地點字幕「視訊（紐約）」、那一句（這邊晚上八點，你那邊早上八點……）、視訊結束',!!q&&(H.opts[0]||[])[0]==='接起來：和'+SOCIAL.displayName('heroine_01')+'：視訊（紐約）'&&caps.includes('視訊（紐約）')&&H.said.length===1&&H.said[0].t===docLine('heroine_01','2030-09')&&caps.includes('視訊結束。'),JSON.stringify([H.opts[0],caps,H.said])); }
    /* 一路跳：以安、芷若、沛珊同時交往，沒報國考 */
    { const W=['heroine_01','heroine_02','classmate_peishan'], G=fresh('2029-06-03',10,{MULTI_Y5:'none'},W); PHONE.join(G,'noodle_team','麵店團');   /* [前置] 2030-05-25 多段感情的那一題當作選了「（不選）」：三位都還在交往（選了一位的另見第 6 項）*/
      const seen={}, bad=[], warns=[], ow=console.warn; let it=0, err=null; const end=T(D('2030-12-13'),24); console.warn=(...a)=>{ warns.push(a.map(x=>x&&x.stack?x.stack.split('\n')[0]:String(x)).join(' ')); };
      try{ for(it=0;it<600&&G.day*24+G.hour<end;it++){ const before=G.day*24+G.hour;
          const y=await y4(GM); if(y) continue;
          const q=OUT.due(G); if(q){ H.picks=[0]; H.said=[]; await OUT.tick(GM); if(/^pg_date_/.test(q.id)) (seen[q.pgWho]||(seen[q.pgWho]=[])).push([q.pgKey,(H.said[0]||{}).t,lab(q.day,q.h)]); continue; }
          const s=PG.due(G); if(s){ H.picks=[]; await PG.runStep(GM,s); continue; }
          E.player.busy=false; if(!await PG.advance(GM)) break;
          if(G.day*24+G.hour<before-1e-6) bad.push('倒退 '+lab(G.day,G.hour)); } }catch(e){ err=e; } finally { console.warn=ow; }
      check('5. 一路跳的途中不丟例外、沒有警告（被吞掉的錯誤）',!err&&!warns.length,(err&&err.stack||'')+warns.slice(0,3).join('｜'));
      const want=id=>(DOC[id]||[]).map(r=>r.ym).filter(ym=>!(id==='classmate_peishan'&&ym==='2030-12'));   /* 2030-12 只有 12/7：芷若排了（以安在紐約是週日），沛珊排不到 */
      const got=id=>(seen[id]||[]).map(x=>x[0]);
      const okLines=W.every(id=>(seen[id]||[]).every(x=>x[1]===docLine(id,x[0])));
      check('5. 一路「跳到下一件事」到 2030-12-13（以安、芷若、沛珊同時交往）：每一位每個月都停一次（表上不排的、排不到的除外）、照順序、每一句照稿',!err&&!bad.length&&W.every(id=>want(id).length>0&&JSON.stringify(got(id))===JSON.stringify(want(id)))&&okLines,(err&&err.stack||'')+bad.join('、')+' '+W.map(id=>id+':'+got(id).length+'/'+want(id).length+(G.flags['dating_'+id]?'':'（不交往了）')).join(' ')+' it='+it);
      const days=new Set(); let clash=false; for(const id of W) for(const x of (seen[id]||[])){ const k=x[2].split(' ')[0]; if(days.has(k)) clash=true; days.add(k); }
      check('5. 三位沒有排在同一天；芷若 9/1 回 Café（那一天有她的出遊）：沛珊 9 月改 9/8',!clash&&(seen.classmate_peishan||[]).some(x=>x[0]==='2029-09'&&/^9\/8（六）/.test(x[2])),JSON.stringify(seen.classmate_peishan&&seen.classmate_peishan.find(x=>x[0]==='2029-09')));
      check('5. PG_DATE_<id>＝用過的月份（照排的順序）',W.every(id=>got(id).length>0&&JSON.stringify(G.flags['PG_DATE_'+id])===JSON.stringify(got(id))),W.map(id=>JSON.stringify(G.flags['PG_DATE_'+id])).join(' ')); } });
  /* ---------- 6 分手、AA_346 ---------- */
  await sec('6',async()=>{
    { const G=fresh('2029-06-09',14.6,{},['heroine_01','heroine_04']); H.tick(); const q=OUT.get(G,'pg_date_heroine_01_2029-06'); const was=q&&q.state;
      ROM.end(G,'heroine_01','apart_talk'); H.tick(); const u=PGDATE.upcoming(G).map(s=>s.who);
      check('6. 分手（ROM.end）：已經排好的那一格改成 skipped、之後沒有她的格子；另一位（子晴）照排',was==='planned'&&q.state==='skipped'&&!u.includes('heroine_01')&&u.includes('heroine_04'),was+'→'+(q&&q.state)+' '+JSON.stringify(u)); }
    { const G=fresh('2030-05-26',10,{},['heroine_03','heroine_05']); G.flags.MULTI_Y5='pick:heroine_05'; G.flags.CHOICE_APART30={y:2030,keep:'heroine_05',day:D('2030-05-25'),list:['heroine_03'],at:{heroine_03:{d:D('2030-05-26'),h:21,n:0,st:'plan'}}};
      const u=PGDATE.upcoming(G).map(s=>s.who+'@'+s.key);
      check('6. 2030-05-25 選了學姊（AA_346）：語彤（還沒談、還是交往中）那天起就停；學姊照排（6 月）',!u.some(x=>/^heroine_03/.test(x))&&u.includes('heroine_05@2030-06')&&PGDATE.wants(G,'heroine_05')&&!PGDATE.wants(G,'heroine_03'),JSON.stringify(u)); } });
  /* ---------- 7 舊存檔 ---------- */
  await sec('7',async()=>{
    { const G=fresh('2029-11-20',10,{},'heroine_01'); H.tick(); const none=!(G.outings||[]).length; STORY.phoneRules(GM); PHONE.tick(G); const q=await untilOut(G,20);
      check('7. 舊存檔 2029-11-20 讀檔：從讀檔那個月開始（11/3 過了＝同月下一個週六 11/24），6～10 月不補；讀檔當下不排、PG_DATE 只有 11 月',none&&!!q&&q.id==='pg_date_heroine_01_2029-11'&&lab(q.day,q.h)==='11/24（六）15:00'&&(G.outings||[]).filter(x=>/^pg_date_/.test(x.id)).length===1&&JSON.stringify(G.flags.PG_DATE_heroine_01)==='["2029-11"]',(q&&q.id)+' '+(q&&lab(q.day,q.h))+' '+JSON.stringify(G.flags.PG_DATE_heroine_01)); }
    { const G=fresh('2029-11-25',10,{},'heroine_01'); const u=PGDATE.upcoming(G);
      check('7. 11 月的週六都過了才讀檔：11 月不補、下一格是表上的下一個月（以安 12、1 月不排＝2030-02-09）',u.length===1&&u[0].key==='2030-02'&&lab(u[0].day,u[0].h)==='2/9（六）15:00',JSON.stringify(u.map(s=>s.key))); } });
  /* ---------- 8 沒交往 ---------- */
  await sec('8',async()=>{ const G=fresh('2029-06-03',10,{},[]), G2=fresh('2029-06-03',10,{},'heroine_04');
    check('8. 沒交往：沒有格子、沒有停點（對照組：和子晴交往有）',PGDATE.upcoming(G).length===0&&PGDATE.stop(G)==null&&PGDATE.upcoming(G2).length===1); });
  H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
