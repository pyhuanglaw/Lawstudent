// AA_539 學姊重讀（SIS-LEAD-1021；企劃線 claude/cool-heisenberg-o8kuqx c9f6dd6cb → 第 5 節更正 90d0a41d0，AA-B 2026-10-30；USER_WANTS C25「學姊才是真正的女主角」）——不需要瀏覽器。
//   0   讀稿（90d0a41d0）：遊戲裡新的句子都在稿裡（一字不差）、輪流的順序和稿的編號一樣（總圖第五句＝5-1 的慢讀）、208 的表、私訊與群組的表逐則對（7/20 照 5-1）；白名單 AA_539＝90d0a41d0；index.html 載入新的兩支
//   1-1 美國路線交往中 2028-12-24 期末飯（te_gf_Y4S1_heroine_05）：「時差還沒調回來。……今天晚上，法圖旁邊那家？」；臺灣、日本路線照原句「我回來了。……」
//   1-2 交往中、有研究室以前（約的那一天 ≦ 9/21）：晨跑不說「研究室」（「……之後我回家念書。」）；9/22 起原句回來
//   5-1 1-3 作廢：2026 暑假照樣約總圖（沒有 noCard）；慢讀那兩句是總圖輪流的第五句——慢讀有開、她那個時間可以的日子才出（週二店休、平日 9～17 照舊不約），不行就輪下一句
//   1-4 美國 208 那一場沒演、每週六再傳：3-1、3-3、3-6 第二、三次換句；5-2 第 6 點：每一句最多傳一次——其他四場第二次起不傳（快轉也不停）、週日那一句「今天也在 208。」也算；舊存檔照手機裡傳過的
//   1-5 日本路線 5/29（sisjp_m_4）：「讀書會還在。Kevin 說要讀到考前一個月。」
//   2   通用邀約輪流（朋友版總圖五句、交往版總圖五句、交往版晨跑四句）：一學期（大二下）裡同一句四週內不重複、照稿的順序輪（只有慢讀那一句那天不行可以跳過）；都在四週內傳過＝這次不約那個地方
//   3-1 朋友版六則私訊（2026-07-20、12-20、2028-02-27、04-12、06-20、2029-02-14）：朋友以上、有聯絡方式、交往中／不熟／前任不發；7/20 照 5-1——
//       12-1 還沒演：「學生證停了。今天想借書，機器不讓我借。」「……我在總圖三樓。你如果在附近。」＋選項；「我在附近。」＝「好。三樓靠窗。」、當天 15:30 總圖、見面直接演 12-1；
//       「今天不行。」＝「好。」、12-1 照原規則；12-1 演過了＝「你借我的那三本，第一本讀完了。」不用回；人在國外只收前兩則、沒有選項
//   3-2 沒認識的玩家：家族群組 2026-07-05 畢業照、12-24、2027-07-15（在群組就收到；不在群組沒有；交往中也收到）
// 修改前：第一版（c9f6dd6cb）在開發分支 ca5f3381c 50 項 FAIL 45 項；這一版（90d0a41d0）在開發分支 fe3cee955（第一版已經合進去）59 項 FAIL 24 項——
//   0 的新句／第五句／5-1／7/20／白名單 6、5-1 的 5、1-4 的 5-2 四項、2 的輪流順序 2、3-1 的 7/20 七項；其他（第一版做好的）修改前就通過。
// 用法：node tests/aa539_sis_reread_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, ID='heroine_05', J=JSON.stringify, ROOT=H.ROOT;
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
const loadErr=[];
const L3=f=>{ const p=path.join(ROOT,f); if(!fs.existsSync(p)){ loadErr.push(f+'：沒有這個檔'); return false; } try{ let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); return true; }catch(e){ loadErr.push(f+'：'+e.message); return false; } };
GM.caption=()=>{}; GM.toast=()=>{}; GM.studySession=async()=>{};
GM.spawnCharacter=(id,x,z,o)=>{ const n={id,charId:id,obj:{position:{x,y:0,z},rotation:{y:0}},seat:(o&&o.seat)||null,pose:(o&&o.pose)||'idle'}; GM.npc[id]=n; return n; }; GM.removeNPC=id=>{ delete GM.npc[id]; };
GM.sitAt=(P,s)=>{ P.seat=s; }; GM.standUp=P=>{ P.seat=null; };
/* index.html 的順序（同 tests/aa454_us_unit.js、aa490_sis_b12_fix_unit.js 用到的那幾支）；sis_b12（12-1 學生證）給 7/20 見面演；新的兩支 src/data/sis_aa539_lines.js、src/sis_aa539_3d.js */
for(const f of ['src/data/msg_pool.js','src/data/msg2_pool.js','src/data/msg_kx_y0.js','src/msg3d.js','src/exchange3d.js','src/data/us_layouts.js','src/us3d.js',
  'src/holff3d.js','src/noodle_closed3d.js','src/group3d.js','src/y34b3d.js','src/sis_grad3d.js','src/data/r2y3b_events.js','src/r2y3b3d.js','src/data/r2y4a_events.js','src/r2y4a3d.js',
  'src/data/us_life_events.js','src/us_life3d.js','src/us208_3d.js','src/data/us_blank_lines.js','src/us_blank3d.js',
  'src/data/sis_y2y3_events.js','src/sis_y2y3_3d.js','src/data/sis_b4_events.js','src/sis_b4_3d.js','src/data/sis_qixi_events.js','src/sis_qixi3d.js','src/data/sis_jp_events.js','src/sis_jp3d.js',
  'src/data/sis_b12_events.js','src/sis_b12_3d.js','src/data/sis_aa539_lines.js','src/sis_aa539_3d.js','src/data/heroine_asks.js','src/heroine_asks3d.js']) L3(f);
const git=(ref,p)=>{ try{ return cp.execSync('git -c core.quotepath=false show '+ref+':"'+p+'"',{cwd:ROOT,encoding:'utf8',maxBuffer:1<<26}); }catch(e){ return ''; } };
const A539='docs/story_planning/AA_539_學姊重讀_AA470之後_空白與重複.md', SHA='4fe297d9c';   /* 10-30 09:1x 換 4fe297d9c：只多 5-1 的見面前旁白（AA-B 補稿）*/
const doc=git(SHA,A539), docLines=doc.split('\n');
const D=k=>STORY.dayOfKey(k), T=(d,h)=>d*24+h, keyOf=d=>CALENDAR.dateOf(d).key, wdOf=d=>CALENDAR.dateOf(d).wd%7;
const at=(d,h)=>{ const G=H.G; G.day=typeof d==='number'?d:D(d); G.hour=h; G.weekday=wdOf(G.day); };
const rules=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const byTag=tag=>(H.G.msgs||[]).filter(m=>m.tag===tag);
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const HA=()=>typeof HASK!=='undefined'?HASK:null, P5=()=>(typeof HASK_DATA!=='undefined'&&HASK_DATA.people[ID])||{daily:[]}, entry=pl=>P5().daily.find(e=>e.place===pl)||{};
const lineOf=x=>{ const K=HA(); if(!K) return null; if(K.lineOf) return K.lineOf(x); const ev=K.entryOf(x); return ev&&ev.v?ev.v.line:null; };   /* 修改前沒有 lineOf：照 entryOf */
/* 存檔：kind＝'none'（沒認識）／'fam'（熟悉）／'friend'（朋友）／'dating'（交往中）／'ex'（前任）；o.grp＝在家族群組 */
const fresh=(key,h,kind,flags,o)=>{ o=o||{}; const met=kind!=='none';
  const G=H.fresh(key,h,o.zone||'dorm',Object.assign({EXCHANGE_ROUTE:o.route||'TW',EXCH_RULE:1,introDone:true,afternoonDone:true,classDone:true},met?{met_sis:true,SIS_W1:true}:{},flags||{}));
  G.outings=[]; G.acts={att:{}}; G.msgs=G.msgs||[]; G.contacts=G.contacts||{}; G.trips=G.trips||[]; G.vac=G.vac||{reg:{}}; G.visited=G.visited||{}; INV.rec(G); PHONE.rec(G); ROM.rec(G);
  if(o.grp) PHONE.join(G,'family_law','法律系直屬家族');
  if(met) G.contacts[ID]=G.day-30;
  if(kind==='fam') H.FAMILIAR(ID); else if(kind==='friend') H.FRIEND(ID); else if(kind==='dating'){ H.CLOSE(ID); H.date(ID); } else if(kind==='ex'){ H.FRIEND(ID); H.date(ID); ROM.end(G,ID,'test'); }
  E.player.busy=false; E.paused=false; return G; };
/* 她們主動約你：從 k0 到 k1 每天跑（12:00 決定、23:55 傳），回傳學姊的每一則（傳出去的：{day 傳的那天, inv 約的那天, place, h, text}）*/
const simHask=(k0,k1,kind,o)=>{ fresh(k0,9,kind,{},o||{});
  const K=HA(); if(!K) return []; for(let d=D(k0);d<=D(k1);d++){ at(d,12); K.phone(H.G); at(d,23.95); K.phone(H.G); PHONE.tick(H.G); }
  return K.rec(H.G).sent.filter(x=>x.id===ID&&x.state!=='dropped'&&x.state!=='planned').map(x=>({day:x.send.day,inv:x.day,k:x.k,place:x.place||x.loc,from:x.from||x.place||x.loc,h:x.h,vk:x.vk,text:lineOf(x)})); };
const dupIn28=L=>{ const bad=[]; for(let i=0;i<L.length;i++) for(let j=i+1;j<L.length;j++) if(L[i].text===L[j].text&&Math.abs(L[j].day-L[i].day)<28) bad.push([keyOf(L[i].day),keyOf(L[j].day),L[i].text]); return bad; };
const show=L=>L.map(x=>keyOf(x.day)+'→'+keyOf(x.inv)+' '+x.place+'@'+x.h+' '+x.text);
/* 稿：第 2 節的編號清單（標題下面的 1.～4.；去掉「（原句…）」）*/
const docList=head=>{ const i=docLines.findIndex(l=>l.trim()===head); if(i<0) return []; const out=[]; for(let j=i+1;j<docLines.length;j++){ const m=docLines[j].match(/^\d\.\s+(.+)$/); if(m) out.push(m[1].replace(/（原句[^）]*）$/,'').trim()); else if(out.length) break; } return out; };
const tbl=hd=>{ const i=docLines.findIndex(l=>l.indexOf(hd)>=0), out=[]; for(let j=i+1;i>=0&&j<docLines.length&&/^\|/.test(docLines[j]);j++){ if(/^\|\s*-/.test(docLines[j])) continue; out.push(docLines[j].split('|').slice(1,-1).map(x=>x.trim())); } return out; };
const LN=()=>typeof SIS539_LINES!=='undefined'?SIS539_LINES:{friendDm:[],famGrp:[]};
const NEW_TE='時差還沒調回來。……今天晚上，法圖旁邊那家？', OLD_TE='我回來了。今天晚上，法圖旁邊那家。';
const NO_LAB='明天六點半。跑完一起去吃早餐。……之後我回家念書。', SR_PRE='明天下午三點，慢讀。你帶要問的題目。', SR_DAT='明天下午三點，慢讀。今天不問題目。';
const JP0529=['（照片：法圖討論室的白板，寫滿了字）','讀書會還在。Kevin 說要讀到考前一個月。'];
const C720=['學生證停了。今天想借書，機器不讓我借。','……我在總圖三樓。你如果在附近。'], C720_YES='好。三樓靠窗。', C720_CARD='你借我的那三本，第一本讀完了。';   /* 5-1 */
const LV=v=>[v&&v.line].concat(((v&&v.alt)||[]).map(a=>a.line));
/* 輪流的順序：下一句＝上一句的下一句；只有慢讀那一句（那天不行）可以跳過 */
const cycOk=(L,pool)=>{ const ix=L.map(x=>pool.indexOf(x.text)); if(ix.some(i=>i<0)) return false; const n=pool.length, sr=pool.findIndex(t=>t===SR_PRE||t===SR_DAT);
  return (ix[0]===0)&&ix.every((b,k)=>{ if(!k) return true; const a=ix[k-1], nx=(a+1)%n; return b===nx||(nx===sr&&b===(sr+1)%n); }); };

(async()=>{
/* ================= 0 讀稿 ================= */
await sec(0,()=>{
  check('0. 讀得到稿（AA_539 '+SHA+'，有第 5 節）、檔都載得到（含 sis_aa539_lines.js、sis_aa539_3d.js）',doc.length>3000&&doc.indexOf('## 4. 給 LAWWW-B')>0&&doc.indexOf('## 5. 更正與實作問答')>0&&!loadErr.length&&typeof SIS539!=='undefined',loadErr.join('；')||'git fetch origin claude/cool-heisenberg-o8kuqx');
  const idx=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'), i1=idx.indexOf('src/data/sis_aa539_lines.js'), i2=idx.indexOf('src/sis_aa539_3d.js'), i0=idx.indexOf('src/sis_b16_3d.js'), i3=idx.indexOf('src/heroine_asks3d.js');
  check('0. index.html 載入 src/data/sis_aa539_lines.js → src/sis_aa539_3d.js（學姊第十六批之後）',i0>0&&i1>i0&&i2>i1&&i3>0,J([i0,i1,i2]));
  const L=[NEW_TE,NO_LAB,JP0529[1]];
  for(const pl of ['library','run_avenue']) for(const vk of ['pre','dat']){ const v=entry(pl)[vk]; if(v&&v.alt) for(const a of v.alt) L.push(a.line); }
  if(typeof US208!=='undefined') for(const s of US208.SCENES) for(const t of (s.dmMore||[])) L.push(t);
  for(const a of LN().friendDm){ L.push(...a.L); if(a.yes) L.push(a.yes,a.noT,a.no,a.yesRe); if(a.card) L.push(...a.card); } for(const a of LN().famGrp) for(const [,t] of a.L) L.push(t);
  const bad=L.filter(t=>!t||!doc.includes(t));
  check('0. 遊戲裡新的句子都在稿裡（一字不差；'+L.length+' 句：改字 3、輪流 11、208 四、私訊 8＋7/20 的選項回覆 4＋演過 12-1 那一則 1、群組 9）',L.length===40&&!bad.length,J(bad));
  const want={'**朋友版（總圖）**':[LV(entry('library').pre),SR_PRE],'**交往版（總圖）**':[LV(entry('library').dat),SR_DAT],'**交往版（晨跑）**':[LV(entry('run_avenue').dat),null]};
  for(const hd in want){ const dl=docList(hd), [g,sr]=want[hd], exp=sr?dl.concat([sr]):dl;
    check('0. 第 2 節 '+hd.replace(/\*/g,'')+'：順序和稿一樣（第 1 句是原句）'+(sr?'；第五句＝5-1 的慢讀「'+sr+'」':'；晨跑四句'),dl.length===4&&J(g)===J(exp),J({doc:exp,game:g})); }
  const lib=entry('library'), run=entry('run_avenue'), s5=v=>((v&&v.alt)||[])[3]||{};
  check('0. 5-1：慢讀那一句的地點是慢讀、下午三點（15:00）；1-3 的 noCard 拿掉了；1-2 研究室以前的晨跑照舊',s5(lib.pre).place==='slowread'&&J(s5(lib.pre).h)==='[15]'&&s5(lib.dat).place==='slowread'&&J(s5(lib.dat).h)==='[15]'&&!lib.pre.noCard&&!lib.dat.noCard&&!!run.dat&&!!run.dat.noLab&&run.dat.noLab.line===NO_LAB&&doc.includes('> 學姊：'+NO_LAB)&&doc.includes('**1-3 作廢**')&&doc.includes('加進第 2 節的輪流，當第五句'),J({pre:s5(lib.pre),dat:s5(lib.dat)}));
  /* 1-4 的表 */
  const got4=tbl('| 原句（第一次） |').map(r=>{ const first=r[0].replace(/（`[^`]*`）$/,''), s=typeof US208!=='undefined'?US208.SCENES.find(x=>x.dm===first):null; return {first,want:[first].concat(r.slice(1).filter(c=>c&&c!=='—')),game:s?[s.dm].concat(s.dmMore||[]):null}; });
  check('0. 1-4 的表三列：每一場第一次、第二次、第三次＝US208.SCENES 的 dm＋dmMore；其他四場沒有 dmMore',got4.length===3&&got4.every(x=>J(x.want)===J(x.game))&&typeof US208!=='undefined'&&US208.SCENES.filter(s=>(s.dmMore||[]).length).length===3&&doc.includes('**每一句最多傳一次**'),J(got4));
  /* 3-1、3-2 的表（7/20 照 5-1）*/
  const R1=tbl('| 日子（21:00） | 學姊 |').map(c=>({day:c[0],L:c[1].split('／')})), g1=LN().friendDm.map(a=>({day:a.day,L:a.L}));
  check('0. 3-1 的表 12/20 以後五列（日子、句子、「／」分開的兩則）＝SIS539_LINES.friendDm',R1.length===6&&J(R1.slice(1))===J(g1.slice(1))&&!!g1[0]&&g1[0].day===R1[0].day,J({doc:R1.slice(1),game:g1.slice(1)}));
  const a0=LN().friendDm[0]||{};
  check('0. 5-1 7/20 換句：12-1 還沒演「'+C720.join('／')+'」、選項「我在附近。」→「'+C720_YES+'」、「今天不行。」→「好。」；12-1 演過了「'+C720_CARD+'」',J(a0.L)===J(C720)&&a0.yes==='我在附近。'&&a0.yesRe===C720_YES&&a0.noT==='今天不行。'&&a0.no==='好。'&&J(a0.card)===J([C720_CARD])&&C720.every(t=>doc.includes('> 學姊：'+t))&&doc.includes('> 學姊：'+C720_YES)&&doc.includes('> 學姊：'+C720_CARD)&&doc.includes('「我在附近。」→')&&doc.includes('「今天不行。」→')&&doc.includes('約當天 15:30 總圖'),J(a0));
  const R2=tbl('| 日子 | 群組 |').map(c=>({at:c[0],L:c[1].split('／')}));
  const NM={s:'學姊',k:'Kevin'}, g2=LN().famGrp.map(a=>({at:a.day+' '+String(a.h).padStart(2,'0')+':00',L:a.L.map(([w,t])=>NM[w]+'：'+t)}));
  check('0. 3-2 的表三列（日子、時間、誰說、句子）＝SIS539_LINES.famGrp',R2.length===3&&J(R2)===J(g2),J({doc:R2,game:g2}));
  const A=JSON.parse(fs.readFileSync(path.join(ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files.find(e=>e.path===A539);
  check('0. 白名單有 AA_539（'+SHA+'、approved、AA-B 定稿（D109）、任務 SIS-LEAD-1021）',!!A&&A.sha===SHA&&A.status==='approved'&&A.approvedBy==='AA-B 定稿（D109）'&&A.task==='SIS-LEAD-1021'&&!!A.note,J(A)); });

/* ================= 1-1 美國路線 12/24 期末飯 ================= */
await sec('1-1',()=>{
  const flow=route=>{ fresh('2028-12-21',20,'dating',{},{route,zone:'campus'}); H.G.termend={contact:{Y4S1:{}},think:{}};
    for(let h=20;h<=21;h+=0.05){ H.G.hour=+h.toFixed(3); rules(); } at('2028-12-24',11.8); for(let h=11.8;h<=12.1;h+=0.05){ H.G.hour=+h.toFixed(3); rules(); } return byTag('te_gf_Y4S1_heroine_05'); };
  const us=flow('US'), tw=flow('TW');
  check('1-1. 美國路線交往中：12/24 12:00 那一則「'+NEW_TE+'」（tag te_gf_Y4S1_heroine_05 不變）',us.length===1&&us[0].text===NEW_TE&&keyOf(us[0].day)==='2028-12-24',J(us.map(m=>[keyOf(m.day),m.h,m.text])));
  check('1-1. 臺灣路線照原句「'+OLD_TE+'」',tw.length===1&&tw[0].text===OLD_TE,J(tw.map(m=>m.text)));
  const g=TERMEND.gf(ID,'Y4S1'); fresh('2028-12-24',12,'dating',{},{route:'JP'}); const jp=typeof g.invite==='function'?g.invite(H.G):g.invite;
  check('1-1. 日本路線（8/5 就回來）也照原句',jp===OLD_TE,J(jp)); });

/* ================= 1-2 有研究室以前的晨跑 ================= */
await sec('1-2',()=>{
  const L=simHask('2026-06-15','2026-09-21','dating');
  const run=L.filter(x=>x.from==='run_avenue'), lab=L.filter(x=>/研究室/.test(x.text||''));
  check('1-2. 交往中 2026-06-15～09-21（約的那一天 ≦ 9/22 以前）：學姊傳的邀約沒有一則說「研究室」',L.length>=5&&!lab.length,J(show(lab)));
  check('1-2. 晨跑有約、第一句是「'+NO_LAB+'」（研究室以前的原句位置）',run.length>=1&&run.some(x=>x.text===NO_LAB)&&!run.some(x=>x.text==='明天六點半。跑完一起去吃早餐，再去研究室。'),J(show(run)));
  const K=HA(), e=entry('run_avenue'); fresh('2026-09-21',12,'dating'); const a=K&&K.pickVar?K.pickVar(H.G,ID,e,'dat',e.dat,false,D('2026-09-22'),D('2026-09-21')):null, b=K&&K.pickVar?K.pickVar(H.G,ID,e,'dat',e.dat,false,D('2026-09-21'),D('2026-09-20')):null;
  check('1-2. 9/21 21:00「研究室分到位子了。」以後（約 9/22 起）：輪到第一句＝原句「…再去研究室。」；約 9/21 的照舊換句',!!a&&a.v.line==='明天六點半。跑完一起去吃早餐，再去研究室。'&&!!b&&b.v.line===NO_LAB,J([a&&a.v.line,b&&b.v.line])); });

/* ================= 5-1 1-3 作廢；慢讀是總圖的第五句 ================= */
await sec('5-1',()=>{
  const K=HA();
  check('5-1. 學生證停掉的那段（noCard、HASK.noCard）拿掉了',!!K&&K.noCard===undefined&&K.NOCARD===undefined&&!entry('library').pre.noCard,'');
  const F=simHask('2026-06-22','2026-09-27','friend'), Fp=F.filter(x=>x.inv>=D('2026-06-30')&&x.inv<=D('2026-09-20'));
  check('5-1. 朋友版 2026-06-22～09-27：暑假照樣約總圖（平日 17:00／17:30 的句子；學生證停了是不能借書）',Fp.some(x=>x.place==='library'&&/總圖/.test(x.text||'')),J(show(Fp)));
  check('5-1. 那段也是四週內不重複',!dupIn28(F).length,J(dupIn28(F)));
  /* 輪到第五句（上一句是第四句、四週以前）：週六＝慢讀 15:00；週二（慢讀店休）、平日（她 9～17 不約）＝跳過、輪回第一句 */
  const e=entry('library'), pool=LV(e.pre);
  const hist=(G,d0,ix)=>{ const R=K.rec(G); R.sent.push({sid:900,id:ID,k:'d',vk:'pre',place:'library',h:17,day:d0-29,send:{day:d0-30,h:22.5},state:'sent',alt:ix||undefined,line:pool[ix]}); };
  const pick=(k0)=>{ fresh(k0,12,'friend'); hist(H.G,H.G.day,3); return K.candidates(H.G,H.G.day).filter(x=>x.id===ID&&x.from==='library'); };
  const sat=pick('2027-03-26'), tue=pick('2027-03-29'), thu=pick('2027-03-31');   /* 3/27 週六、3/30 週二、4/1 週四 */
  check('5-1. 輪到第五句、約週六（3/27）：慢讀咖啡 15:00「'+SR_PRE+'」',sat.length===1&&sat[0].place==='slowread'&&sat[0].h===15&&sat[0].v.line===SR_PRE&&sat[0].alt===4,J(sat.map(x=>[x.place,x.h,x.v.line,x.alt])));
  check('5-1. 輪到第五句、約週二（慢讀店休）、約平日（她 9～17 不約）：跳過，輪回第一句（總圖 17:30）',tue.length===1&&tue[0].place==='library'&&tue[0].v.line===pool[0]&&thu.length===1&&thu[0].place==='library'&&thu[0].v.line===pool[0],J([tue.map(x=>[x.place,x.h,x.v.line]),thu.map(x=>[x.place,x.h,x.v.line])]));
  fresh('2027-03-26',12,'dating'); { const R=K.rec(H.G), pd=LV(e.dat); R.sent.push({sid:901,id:ID,k:'d',vk:'dat',place:'library',h:17,day:H.G.day-29,send:{day:H.G.day-30,h:22.5},state:'sent',alt:3,line:pd[3]}); }
  const sd=K.candidates(H.G,H.G.day).filter(x=>x.id===ID&&x.from==='library');
  check('5-1. 交往版輪到第五句、約週六：慢讀 15:00「'+SR_DAT+'」',sd.length===1&&sd[0].place==='slowread'&&sd[0].h===15&&sd[0].v.line===SR_DAT,J(sd.map(x=>[x.place,x.h,x.v.line])));
  /* 真的傳出去：INV 的邀約地點是慢讀、時間 15:00、她傳的是第五句 */
  fresh('2027-03-26',12,'friend'); hist(H.G,H.G.day,3); let iv=null, m=null; K.phone(H.G); at(H.G.day,23.95); K.phone(H.G); PHONE.tick(H.G); { const rec=K.rec(H.G).sent.find(x=>x.id===ID&&x.sid!==900); iv=rec&&rec.iv?INV.byId(H.G,rec.iv):null; m=(H.G.msgs||[]).find(x=>x.iv&&iv&&x.iv===iv.id&&x.who===ID); }
  check('5-1. 3/26（五）傳、約 3/27（六）：INV 的邀約＝慢讀咖啡 15:00、她傳的是「'+SR_PRE+'」',!!iv&&iv.place==='slowread'&&iv.h===15&&keyOf(iv.day)==='2027-03-27'&&!!m&&m.text===SR_PRE,J({iv,m:m&&m.text}));
  fresh('2026-09-21',13,'friend'); const c=K.candidates(H.G,H.G.day).filter(x=>x.id===ID);
  check('5-1. 沒有紀錄的第一則照原句：9/21 傳、約 9/22 總圖 17:30「明天五點以後，總圖三樓。你帶要問的題目。」',c.length===1&&c[0].place==='library'&&c[0].h===17.5&&c[0].v.line===pool[0],J(c.map(x=>[x.place,x.h,x.v.line]))); });

/* ================= 1-4 美國 208：每一句最多傳一次 ================= */
await sec('1-4',()=>{
  const US=f=>Object.assign({EXCHANGE_ROUTE:'US',EXCH_RULE:1,US_DEPARTED:true,US_ARRIVED:true,US_ARRIVED_DAY:D('2028-08-02'),US1:'together',Y4_PATH:'bar',Y4_PATH_DAY:D('2028-06-08'),US2:'there'},f||{});
  const w208=(key,h)=>{ const G=H.fresh(key,h,'us_apartment',US()); G.contacts=G.contacts||{}; G.msgs=G.msgs||[]; G.visited=G.visited||{}; G.vac=G.vac||{reg:{}}; ROM.rec(G); E.player.busy=false; E.paused=false; E.player.seat=null; ADV.active=false;
    SOCIAL.remember(ID,'FIRST_MET',''); PHONE.join(G,'us_exchange','交換生'); G.flags.dating_heroine_05=true; G.flags.CALLED_SHUYU=true; const r=ROM.get(G,ID); r.status='dating'; return G; };
  const md=d=>keyOf(d).slice(5).replace('-','');
  const runW=(k0,k1,pre)=>{ w208(k0,13.9); if(pre) pre(H.G); const got={}; for(let d=D(k0);d<=D(k1);d++){ const w=wdOf(d); if(w!==6&&w!==0) continue; at(d,14.05); H.G.zone='us_apartment'; rules(); const m=byTag('us208_dm_'+md(d)); if(m.length) got[keyOf(d).slice(5)]=m.map(x=>x.text).join('｜'); } return got; };
  const got=runW('2028-09-16','2028-12-10');
  const want={'09-16':'我在 208。門沒鎖。','09-23':'今天也在 208。','10-14':'臺灣寄來的東西到了。','10-21':'東西還在客廳。你哪天過來拿。','11-18':'客廳那盆植物，我在救它。','11-25':'植物多長了一片葉子。','12-02':'它好像要放棄了。我還沒。'};
  const bad=Object.keys(want).filter(k=>got[k]!==want[k]);
  check('1-4. 交往中、208 一場都沒演、每個週末 14:00 都沒回：3-1 第二次「今天也在 208。」、3-3 第二次換句、3-6 第二、三次換句',!bad.length,J({bad,got}));
  const all=Object.values(got), dupe=all.filter((t,i)=>all.indexOf(t)!==i);
  check('1-4. 一路下來（9/16～12/10）她週末的私訊每句只傳一次',!dupe.length&&all.length>=10,J(got));
  /* 5-2 第 6 點：其他四場第二次起不傳 */
  const g2=runW('2028-09-16','2028-10-01',G=>{ G.events.done.ev_us208_memo=1; });   /* 3-1 演過了：9/23、9/30 都是 3-2 */
  check('1-4. 5-2：3-2 沒有換句——9/23 傳過「我在煮東西。……」，9/30 不再傳（也不停）',g2['09-23']==='我在煮東西。……第一次煮這個。'&&!g2['09-30']&&!g2['10-01']&&US208.stopAt(H.G,D('2028-09-30'))===false,J({got:g2,stop:US208.stopAt(H.G,D('2028-09-30'))}));
  const g3=runW('2028-10-14','2028-10-29',G=>{ G.events.done.ev_us208_clipping=1; });   /* 3-3 演過了：10/21、10/28 都是 3-4 */
  check('1-4. 5-2：3-4 沒有換句——10/21 傳過，10/28 不再傳',g3['10-21']==='下午在 208。你來的時候先敲門。'&&!g3['10-28']&&!g3['10-29'],J(g3));
  /* 週日那一句也算：週六、週日都回「今天不行。」以後，3-1 的第二句（同一句）不再傳 */
  w208('2028-09-16',13.9); at('2028-09-16',14.05); rules(); PHONE.answer(H.G,'us208_ask_0916',1); rules(); at('2028-09-17',14.05); rules(); const sun=byTag('us208_dm_0917').map(m=>m.text); PHONE.answer(H.G,'us208_ask_0917',1); rules();
  at('2028-09-23',14.05); rules(); at('2028-09-24',14.05); rules(); const n23=byTag('us208_dm_0923').length+byTag('us208_dm_0924').length;
  check('1-4. 5-2：週日那一句「今天也在 208。」傳過了，9/23～24 3-1 不再傳（第二句是同一句）；9/30 3-2 照傳',J(sun)===J(['今天也在 208。'])&&n23===0&&(()=>{ at('2028-09-30',14.05); rules(); return byTag('us208_dm_0930').map(m=>m.text).join()==='我在煮東西。……第一次煮這個。'; })(),J({sun,n23,m30:byTag('us208_dm_0930').map(m=>m.text)}));
  check('1-4. 快轉的停點跟著（S.stopAt）：第二次還有句子的停、沒有的不停；US208_SAID 記傳過的',(()=>{ w208('2028-10-20',20); at('2028-10-20',20); H.G.flags.US208_SAID=['臺灣寄來的東西到了。']; const a=US208.stopAt(H.G,D('2028-10-21')); H.G.flags.US208_SAID.push('東西還在客廳。你哪天過來拿。'); return a===true&&US208.stopAt(H.G,D('2028-10-21'))===false; })());
  /* 舊存檔：沒有 US208_SAID、手機裡已經有 10/14 那一則原句 */
  w208('2028-10-21',13.9); H.G.msgs.push({day:D('2028-10-14'),h:14,th:'p:'+ID,from:ID,text:'臺灣寄來的東西到了。',tag:'us208_dm_1014'}); at('2028-10-21',14.05); rules(); const o=byTag('us208_dm_1021');
  check('1-4. 舊存檔（沒有 US208_SAID、10/14 收過原句）：10/21 換第二句「東西還在客廳。你哪天過來拿。」',o.length===1&&o[0].text==='東西還在客廳。你哪天過來拿。',J(o.map(m=>m.text))); });

/* ================= 1-5 日本路線 5/29 ================= */
await sec('1-5',()=>{
  const m=(typeof SISJP_LINES!=='undefined'&&SISJP_LINES.msgs||[]).find(x=>x.day==='2028-05-29');
  check('1-5. SISJP_LINES 5/29：照片那一則照舊、第二句「'+JP0529[1]+'」',!!m&&J(m.L)===J(JP0529),J(m));
  fresh('2028-05-27',10,'friend',{},{route:'JP'}); for(let d=D('2028-05-27');d<=D('2028-05-30');d++){ at(d,20); rules(); at(d,22.5); rules(); }
  const M=(H.G.msgs||[]).filter(x=>x.th==='p:'+ID&&keyOf(x.day)==='2028-05-29');
  check('1-5. 日本路線朋友版 5/29 她的私訊（sisjp_m_4）：兩則照新的字',J(M.map(x=>x.text))===J(JP0529)&&M.every(x=>x.tag==='sisjp_m_4'),J(M.map(x=>[x.tag,x.text])));
  const src=fs.readFileSync(path.join(ROOT,'src/data/sis_jp_events.js'),'utf8');
  check('1-5. 舊句「Kevin 說考完國考才算結束。」不在遊戲裡（註解以外）',!/'讀書會還在。Kevin 說考完國考才算結束。'/.test(src)); });

/* ================= 2 通用邀約輪流 ================= */
await sec('2',()=>{
  const term=['2027-02-22','2027-06-13'];
  const F=simHask(term[0],term[1],'friend'), Fl=F.filter(x=>x.from==='library');
  check('2. 朋友版大二下（2027-02-22～06-13）：同一句四週內不重複（原本同一句一學期 7～10 次）',F.length>=4&&!dupIn28(F).length,J({dup:dupIn28(F),L:show(F)}));
  const fl=LV(entry('library').pre);
  check('2. 朋友版總圖照稿的順序輪（1→2→3→4→5→1…；第五句慢讀那天不行可以跳過），至少四句用到',fl.length===5&&Fl.length>=4&&cycOk(Fl,fl)&&new Set(Fl.map(x=>x.text)).size>=4,J(show(Fl)));
  const Dt=simHask(term[0],term[1],'dating'), Dl=Dt.filter(x=>x.from==='library'), Dr=Dt.filter(x=>x.from==='run_avenue');
  check('2. 交往版大二下：同一句四週內不重複（總圖、晨跑、其他地點）',Dt.length>=6&&!dupIn28(Dt).length,J({dup:dupIn28(Dt),L:show(Dt)}));
  const dl=LV(entry('library').dat), dr=LV(entry('run_avenue').dat);
  check('2. 交往版總圖（五句）、晨跑（四句）各照稿的順序輪（大二下已經有研究室：晨跑第一句是原句）',dl.length===5&&dr.length===4&&Dl.length>=3&&cycOk(Dl,dl)&&Dr.length>=3&&cycOk(Dr,dr),J({lib:show(Dl),run:show(Dr)}));
  check('2. 輪流的時間照句子：「五點」17:00、「五點以後」17:30、慢讀 15:00',new Set(Fl.map(x=>x.h)).size>=2&&Fl.concat(Dl).every(x=>x.h===(x.place==='slowread'?15:(/五點以後/.test(x.text)?17.5:17))),J(Fl.concat(Dl).map(x=>[x.h,x.text])));
  /* 都在四週內傳過＝這次不約那個地方 */
  const K=HA(), e=entry('library'); fresh('2027-03-29',12,'friend'); const R=K?K.rec(H.G):{sent:[]}, d0=D('2027-03-29');
  fl.forEach((t,i)=>R.sent.push({sid:100+i,id:ID,k:'d',vk:'pre',place:i===4?'slowread':'library',from:i===4?'library':undefined,h:17,day:d0-20+i*5+1,send:{day:d0-20+i*5,h:22.5},state:'sent',alt:i||undefined,line:t}));
  const x=K&&K.pickVar?K.pickVar(H.G,ID,e,'pre',e.pre,false,d0+1,d0):'?';
  R.sent.splice(0,1); const y=K&&K.pickVar?K.pickVar(H.G,ID,e,'pre',e.pre,false,d0+1,d0):null;
  check('2. 五句都在四週內傳過＝這次不約總圖（null）；第一句的紀錄拿掉＝輪回第一句',x===null&&!!y&&y.v.line===fl[0],J([x,y&&y.v.line]));
  /* 改天：3 天後同一個地點、換下一句 */
  fresh('2027-03-02',12,'friend'); let r1=null, r2=null; if(K){ K.phone(H.G); at(H.G.day,23.95); K.phone(H.G); PHONE.tick(H.G); r1=K.rec(H.G).sent.find(z=>z.id===ID); if(r1&&r1.iv) INV.answer(H.G,r1.iv,'later');
    for(let d=D('2027-03-03');d<=D('2027-03-12')&&!r2;d++){ at(d,12); K.phone(H.G); at(d,23.95); K.phone(H.G); PHONE.tick(H.G); r2=K.rec(H.G).sent.find(z=>z.id===ID&&z.redo===r1.sid&&z.state!=='dropped'); } }
  check('2. 回「改天」：3 天後同一個地點再約一次、換下一句（不四週內重複）',!!r1&&!!r2&&(r2.from||r2.place)===(r1.from||r1.place)&&lineOf(r2)!==lineOf(r1),J([r1&&[r1.place,lineOf(r1)],r2&&[r2.place,lineOf(r2),keyOf(r2.send.day)]])); });

/* ================= 3-1 朋友版六則私訊 ================= */
await sec('3-1',async()=>{
  const run1=(key,kind,o,h)=>{ const d=D(key); fresh(keyOf(d-1),9,kind,{},o); for(let x=d-1;x<=d+1;x++){ at(x,9); rules(); at(x,h||21.05); rules(); at(x,23.9); rules(); } };   /* PHONE.tick：15 分鐘內送到的記現在的時間（21.05）*/
  const near=(a,b)=>Math.abs(a-b)<0.1;
  const tags=()=>(H.G.msgs||[]).filter(m=>/^sis539_fdm_/.test(m.tag||''));
  const A=LN().friendDm, got=[];
  for(let i=1;i<A.length;i++){ run1(A[i].day,'friend'); const M=byTag('sis539_fdm_'+i); got.push({day:A[i].day,ok:J(M.map(m=>m.text))===J(A[i].L)&&M.every(m=>keyOf(m.day)===A[i].day&&near(m.h,21)&&m.th==='p:'+ID&&m.from===ID&&!m.ask),M:M.map(m=>[keyOf(m.day),m.h,m.text])}); }
  check('3-1. 朋友版 12/20、2028-02-27、04-12、06-20、2029-02-14：21:00 她私訊（照表、不用回）',got.length===5&&got.every(x=>x.ok),J(got));
  check('3-1. 朋友版大二上 12 月有 12/20 那則「研究所的期末考完了。……你們的還沒吧。加油。」',got[0]&&got[0].ok&&got[0].M[0][2]==='研究所的期末考完了。……你們的還沒吧。加油。',J(got[0]));
  run1('2028-04-12','friend',{route:'JP'}); const jp=byTag('sis539_fdm_3');
  check('3-1. 日本路線（4/12 人在日本）：照收、當地時間 22:00',jp.length===1&&near(jp[0].h,22),J(jp.map(m=>[m.h,m.text])));
  const no={};
  for(const [n,kind] of [['交往中','dating'],['熟悉（還不是朋友）','fam'],['前任','ex'],['沒認識','none']]){ run1('2026-12-20',kind); no[n]=tags().length; }   /* 學姊的聯絡方式一開始就有（invites.js contacts0），沒有「沒聯絡方式」的情況 */
  check('3-1. 交往中、熟悉、前任、沒認識：都不發',Object.values(no).every(x=>x===0),J(no));
  /* 7/20（5-1）：12-1 還沒演＝14:00 兩則＋選項 */
  run1('2026-07-20','friend',{},14.05); const m0=byTag('sis539_fdm_0'), last=m0[m0.length-1];
  check('3-1. 5-1 7/20 12-1 還沒演：14:00「'+C720[0]+'」「'+C720[1]+'」；最後一則有選項「我在附近。」「今天不行。」',J(m0.map(m=>m.text))===J(C720)&&m0.every(m=>keyOf(m.day)==='2026-07-20'&&near(m.h,14))&&!!last&&!!last.ask&&J(last.ask.opts.map(o=>o.t))===J(['我在附近。','今天不行。']),J(m0.map(m=>[keyOf(m.day),m.h,m.text,m.ask&&m.ask.opts.map(o=>o.t)])));
  /* 「我在附近。」＝「好。三樓靠窗。」、15:30 總圖、見面直接演 12-1 */
  fresh('2026-07-20',9,'friend'); at('2026-07-20',9); rules(); at('2026-07-20',14.2); rules(); PHONE.answer(H.G,'sis539_fdm_0',0); rules();
  const th0=(H.G.msgs||[]).filter(m=>m.th==='p:'+ID).map(m=>(m.from==='player'?'你':'她')+'：'+m.text), iv=(H.G.invites||[]).find(q=>q.who===ID&&q.place==='library');
  check('3-1. 回「我在附近。」：她「'+C720_YES+'」；當天 15:30 總圖的邀約（她約的 by npc、已答應），見面那一次是 12-1（iv.ev）',th0.slice(-2).join('｜')==='你：我在附近。｜她：'+C720_YES&&!!iv&&keyOf(iv.day)==='2026-07-20'&&iv.h===15.5&&iv.by==='npc'&&iv.state==='accepted'&&iv.ev==='ev_sis_borrowed_card'&&H.G.flags.SIS539_SR===iv.id,J({th:th0.slice(-3),iv}));
  let L1=[]; if(iv){ at('2026-07-20',15.5); H.G.zone='library_hall'; H.said=[]; H.opts=[]; H.picks=[0,0]; await INV.meet(GM,iv,null); L1=H.said.map(s=>s.t); rules(); }
  check('3-1. 見面：先「（你走上三樓。她坐在靠窗的位子。）」（AA_539 5-1，4fe297d9c；見面在總圖大廳那一層；稿裡有這句：'+String(doc.includes('（你走上三樓。她坐在靠窗的位子。）'))+'），再直接演 12-1（「（總圖三樓靠窗的位子。…）」「…你的學生證，借我一下。」），不演一般的總圖見面；演完記 12-1、補 SIS_CARD_DAY（第 21 天的私訊）',doc.includes('（你走上三樓。她坐在靠窗的位子。）')&&L1[0]==='（你走上三樓。她坐在靠窗的位子。）'&&L1[1]==='（總圖三樓靠窗的位子。她面前疊著五本書，最上面夾著一張手寫的書單。）'&&L1.some(t=>/你的學生證，借我一下。$/.test(t))&&!L1.some(t=>/^你和.*在總圖/.test(t))&&!!(H.G.events.done.ev_sis_borrowed_card)&&H.G.flags.SIS_CARD_DAY===D('2026-07-20')&&!!iv&&iv.state==='done',J({L:L1.slice(0,3),card:H.G.flags.SIS_CARD_DAY,st:iv&&iv.state}));
  /* 約好以後、見面以前 12-1 自己先演了＝照一般的見面 */
  fresh('2026-07-20',9,'friend'); at('2026-07-20',9); rules(); at('2026-07-20',14.2); rules(); PHONE.answer(H.G,'sis539_fdm_0',0); const iv2=(H.G.invites||[]).find(q=>q.who===ID&&q.place==='library');
  H.G.events.done.ev_sis_borrowed_card=1; H.G.flags.SIS_CARD_DAY=H.G.day; at('2026-07-20',14.5); rules();
  check('3-1. 約好以後、見面以前 12-1 在總圖先演了：那一次照一般的總圖見面（拿掉 iv.ev，不演第二次）',!!iv2&&iv2.ev===undefined&&iv2.preNarr===undefined&&iv2.state==='accepted',J(iv2));
  /* 「今天不行。」＝「好。」；12-1 照原規則 */
  fresh('2026-07-20',9,'friend'); at('2026-07-20',9); rules(); at('2026-07-20',14.2); rules(); PHONE.answer(H.G,'sis539_fdm_0',1); const th=(H.G.msgs||[]).filter(m=>m.th==='p:'+ID).map(m=>(m.from==='player'?'你':'她')+'：'+m.text);
  H.G.zone='library'; at('2026-07-21',10); const due=typeof SISB12!=='undefined'&&SISB12.cardDue?SISB12.cardDue(H.G):'?';
  check('3-1. 回「今天不行。」：她「好。」；沒有總圖的邀約；12-1 照原規則（7/21 平日上午在總圖閱覽區還是會演）',th.slice(-2).join('｜')==='你：今天不行。｜她：好。'&&!(H.G.invites||[]).some(q=>q.who===ID&&q.place==='library')&&due===true,J({th:th.slice(-3),due}));
  /* 12-1 演過了＝「你借我的那三本，第一本讀完了。」不用回 */
  fresh('2026-07-19',9,'friend',{SIS_CARD_DAY:D('2026-07-08')}); H.G.events.done.ev_sis_borrowed_card=1; for(let x=D('2026-07-19');x<=D('2026-07-21');x++){ at(x,9); rules(); at(x,14.05); rules(); }
  const mc=byTag('sis539_fdm_0');
  check('3-1. 12-1 演過了（7/8）：7/20 14:00 只有「'+C720_CARD+'」、不用回',J(mc.map(m=>m.text))===J([C720_CARD])&&mc.every(m=>!m.ask&&near(m.h,14)),J(mc.map(m=>[m.h,m.text,!!m.ask])));
  /* 排好（9:00）、還沒送到以前 12-1 演了（10:00）＝換成演過了的那一則 */
  fresh('2026-07-20',9,'friend'); at('2026-07-20',9); rules(); H.G.events.done.ev_sis_borrowed_card=1; H.G.flags.SIS_CARD_DAY=H.G.day; at('2026-07-20',10); rules(); at('2026-07-20',14.05); rules(); const mq=byTag('sis539_fdm_0');
  check('3-1. 早上排好、14:00 以前 12-1 演了：送到的是「'+C720_CARD+'」（不是借書那兩則）',J(mq.map(m=>m.text))===J([C720_CARD]),J(mq.map(m=>m.text)));
  /* 人在國外：只收前兩則、沒有選項 */
  { const away0=SIS539.away; SIS539.away=()=>true; try{ run1('2026-07-20','friend',{},14.05); } finally { SIS539.away=away0; } const ma=byTag('sis539_fdm_0');
    check('3-1. 人在國外（寒暑假出國）：12-1 還沒演的只收前兩則、沒有選項',J(ma.map(m=>m.text))===J(C720)&&ma.every(m=>!m.ask),J(ma.map(m=>[m.text,!!m.ask]))); }
  fresh('2026-07-20',15.5,'friend'); at('2026-07-20',15.5); rules(); PHONE.tick(H.G);
  check('3-1. 7/20 過了回覆期限（15:15）才跑到：不補',!byTag('sis539_fdm_0').length,J(byTag('sis539_fdm_0').map(m=>m.text))); });

/* ================= 3-2 家族群組三則 ================= */
await sec('3-2',()=>{
  const run1=(key,kind,o)=>{ const d=D(key); fresh(keyOf(d-1),9,kind,{},o); for(let x=d-1;x<=d+1;x++){ at(x,9); rules(); at(x,23.9); rules(); } };
  const A=LN().famGrp, NM={s:ID,k:'kevin'}, got=[];
  for(let i=0;i<A.length;i++){ run1(A[i].day,'none',{grp:true}); const M=byTag('sis539_grp_'+i);
    got.push({day:A[i].day,ok:M.length===A[i].L.length&&M.every((m,j)=>m.text===A[i].L[j][1]&&m.from===NM[A[i].L[j][0]]&&m.th==='g:family_law'&&keyOf(m.day)===A[i].day&&Math.abs(m.h-A[i].h)<0.05&&!m.ask),M:M.map(m=>[m.from,m.h,m.text])}); }
  check('3-2. 沒認識的玩家（在家族群組）：2026-07-05 20:00、12-24 21:00、2027-07-15 20:00 三段照表（誰說、時間；不用回）',got.length===3&&got.every(x=>x.ok),J(got));
  check('3-2. 沒認識的 2026-07 有畢業照「📷（畢業照，五個人，她站在最邊邊）」',got[0]&&got[0].ok&&got[0].M[0][2]==='📷（畢業照，五個人，她站在最邊邊）',J(got[0]));
  run1('2026-07-05','none',{grp:false}); const n0=(H.G.msgs||[]).filter(m=>/^sis539_grp_/.test(m.tag||'')).length;
  run1('2026-12-24','dating',{grp:true}); const n1=byTag('sis539_grp_1').length;
  run1('2027-07-15','friend',{grp:true}); const n2=byTag('sis539_grp_2').length;
  check('3-2. 不在家族群組：沒有；交往中、朋友版在群組：照樣收到',n0===0&&n1===3&&n2===3,J([n0,n1,n2])); });

H.done();
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); console.log('FAILED '+(H.fails+1)); process.exit(1); });
