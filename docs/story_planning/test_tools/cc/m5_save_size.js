// CC M5「存檔大小」——不需要瀏覽器（Node）。
// 用法：
//   nice -n 19 node docs/story_planning/test_tools/cc/m5_save_size.js <受測版本根目錄> [--json <輸出檔>]
//   （根目錄＝有 src/、tests/pg_harness.js 的乾淨 checkout）
//   延畢路線：[FAIL_ROUTE=retake|maritime] [RETAKE_COURSE=enforcement]（D124 690ac5f4d 起預設 retake＝大四上被當→大四下重修沒過；D124 以前的版本用 FAIL_ROUTE=maritime）
// 存檔怎麼寫（src/game3d.js，這支腳本會檢查原始碼確認）：snapshot()＝Object.assign({},G,{pos,hour,savedAt,v})；write(key,obj)＝localStorage.setItem(key,JSON.stringify(obj))，
//   沒有壓縮；寫不進去（超過配額）只回傳 false——autosave 不看回傳值（不提示），saveSlot 才 toast「存檔失敗」。
// 這裡把 game3d.js 的 snapshot 原始碼抽出來執行，序列化照 write 用 JSON.stringify；大小＝字元數×2（localStorage 以 UTF-16 計）。
// 模擬（分兩層，報告分開寫）：
//   A 真函式驅動：上課 CLS.attend（含課堂提問 CLS.classAsk）、自習 CLS.studyTopic＋game3d.js 的 addNote、總複習 STUDY.review、期末考 CLS.runExam、成績單 CLS.showGrades（重修）、
//     大四下 FD.check／FD.makeup（補考、延畢）、延畢那一學期 Y5.classItems＋Y5.attend；手機訊息 PHONE.post（真的 200 則上限）；人物記憶 SOCIAL.remember（真的每人 80 筆上限）；
//     習慣 EVENTS.habit（真的每個鍵 60 天上限）；研究所 SOCIAL.gradBump。
//   B 依程式上限與資料量填（推估，不是玩出來的）：事件 G.events.done／last（照 STORY_EVENTS 全部 id 依時間比例標成演過）、旗標（照原始碼裡出現過的旗標名稱依時間比例設成 true）、
//     邀約 G.invites、出遊 G.outings 等沒辦法在 Node 裡真的演的系統——見報告。
'use strict';
const path=require('path'), fs=require('fs'), vm=require('vm');
const SRC=path.resolve(process.argv[2]||'.');
const SAVE_OUT=process.env.SAVE_OUT||null, BIG={chars:0,json:null,lab:null};   /* BB 13:52：把最大的那一份存檔（snapshot＋B 層推估）寫出來給 LAWWW 分析 */
const JSON_OUT=(()=>{ const i=process.argv.indexOf('--json'); return i>0?process.argv[i+1]:null; })();
const H=require(path.join(SRC,'tests/pg_harness.js'));
const {GM}=H;
const load=f=>{ const p=path.join(SRC,f); if(!fs.existsSync(p)){ console.log('（沒有 '+f+'）'); return; } const src=fs.readFileSync(p,'utf8').replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/study_units.js','src/study3d.js','src/jp3d.js','src/data/r2y4b_events.js','src/r2y4b3d.js','src/y5s1_3d.js','src/faildelay3d.js']) try{ load(f); }catch(e){ console.log('載入失敗 '+f+'：'+e.message); }
GM.caption=()=>{}; GM.toast=()=>{};
CLS.attPass=()=>true;
const J=JSON.stringify;
const FAIL_ROUTE=process.env.FAIL_ROUTE||'retake', RT_COURSE=process.env.RETAKE_COURSE||'enforcement'; if(!['retake','maritime'].includes(FAIL_ROUTE)) throw new Error('FAIL_ROUTE 只能是 retake／maritime：'+FAIL_ROUTE);
const RT_NAME=(CLS.byId(RT_COURSE)||{}).name||RT_COURSE;
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; return ok; };

/* ---- 確認存檔的寫法（原始碼）---- */
const g3=fs.readFileSync(path.join(SRC,'src/game3d.js'),'utf8');
const grab=(src,name)=>{ const i=src.indexOf('function '+name+'('); if(i<0) return null; let d=0; for(let j=src.indexOf('{',i);j<src.length;j++){ if(src[j]==='{') d++; else if(src[j]==='}'){ d--; if(!d) return src.slice(i,j+1); } } return null; };
const wSrc=grab(g3,'write'), sSrc=grab(g3,'snapshot');
check('0a game3d.js write()＝setItem(key,JSON.stringify(obj))，沒有壓縮',!!wSrc&&/st\.setItem\(key,JSON\.stringify\(obj\)\)/.test(wSrc)&&!/LZString|compress|deflate|gzip|CompressionStream/i.test(wSrc+(grab(g3,'read')||'')+(sSrc||'')),wSrc);
check('0b autosave 寫入失敗不提示（write 的回傳值沒人看）——只是記錄現況',/write\(KEY_AUTO,snapshot\(\)\); GM\.lastAuto/.test(g3),'');
const KEYS=(g3.match(/const SAVE_VER=2;[^\n]*/)||[''])[0];
console.log('INFO 存檔 key：'+KEYS.replace(/\s+/g,' ').slice(0,260));
const snapshotFn=new Function('G','E','STORY','SAVE_VER','GM',sSrc+'\nreturn snapshot;');
const snap=G=>snapshotFn(G,H.E,typeof STORY!=='undefined'?STORY:undefined,2,GM)();
const sizeOf=G=>JSON.stringify(snap(G)).length;

const addSrc=g3.match(/function addNote\(id,title,body\)\{[\s\S]*?return true; \}/);
GM.addNote=new Function('H','toast','A3','return function(id,title,body){ const G=H.G; return ('+addSrc[0]+')(id,title,body); };')(H,()=>{},{blip(){}});
GM.hasNote=id=>!!H.G.notes.find(n=>n.id===id);

/* ---- 亂數、作答 ---- */
const rngOf=seed=>()=>{ seed|=0; seed=seed+0x6D2B79F5|0; let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };
let rnd=Math.random, pRight=0.7, curQs=null, forceWrong=false;
const QRE=/^(\d)／5　/;
GM.choose=async o=>{ const last=H.said[H.said.length-1]; const m=last&&QRE.exec(last.t);
  if(m&&curQs){ const q=curQs[+m[1]-1]; if(q){ const ok=x=>{ const t=x.t||x.text; return t===String(q.answer)||t.startsWith('（'+q.answer+'）'); }; const right=!forceWrong&&rnd()<pRight; const k=o.findIndex(x=>right?ok(x):!ok(x)); if(k>=0) return k; } }
  const idx=o.map((q,i)=>q.dim?-1:i).filter(i=>i>=0); return idx.length?idx[Math.floor(rnd()*idx.length)]:0; };
H.said=[]; GM.say=async(who,t)=>{ H.said.push({who:null,t:String(t)}); if(H.said.length>50) H.said.splice(0,25); };   /* 只留最後幾句（作答要看「n／5」那一句）*/
const origRun=CLS.runExam;
CLS.runExam=async function(gm,it){ const d=CLS.drawExam(gm.G,it.c.id,it.term,it.exam); curQs=d.ok?d.qs:null; try{ return await origRun.call(this,gm,it); } finally { curQs=null; } };

/* ---- 真的文字（手機訊息、記憶備註的長度用遊戲裡的句子）---- */
const poolTexts=[]; for(const f of ['src/data/msg_pool.js','src/data/msg2_pool.js','src/data/needed_msgs.js']){ const p=path.join(SRC,f); if(!fs.existsSync(p)) continue; const t=fs.readFileSync(p,'utf8'); for(const m of t.matchAll(/'([^'\\\n]{4,120})'/g)) if(/[一-鿿]/.test(m[1])) poolTexts.push(m[1]); }
const avgMsg=poolTexts.reduce((a,t)=>a+t.length,0)/Math.max(1,poolTexts.length);
console.log('INFO 手機訊息取樣句子 '+poolTexts.length+' 句，平均 '+avgMsg.toFixed(1)+' 字');
const PEOPLE=Object.keys(CHARACTERS).filter(id=>CHARACTERS[id]&&CHARACTERS[id].social_layer&&CHARACTERS[id].social_layer!=='P');
const MEMTAGS=Object.keys(SOCIAL.MEMORY_LABEL||{}).length?Object.keys(SOCIAL.MEMORY_LABEL):['FIRST_MET','TALKED','STUDIED_TOGETHER','ATE_TOGETHER'];
const ZONES=['campus','linze','wancai','library','library_hall','cafe','conv','noodle','bookstore','dorm','gongguan','wenzhou','lane118','gym','soclib','lawlib','home','pool','putong','boya','gongtong','classroom','teahouse','wzpark','library_b1','linze3','socsci'];
const TOD=['morning','noon','afternoon','evening','night'];
/* 習慣的鍵照真的存檔（docs/story_planning/試玩存檔/ day 7：place:<區域>:<時段>、place:<區域>:with:<人>、seat:<區域>:@x,z、seat:<區域>:with:<人>、meal:<區域>、meal:<區域>:with:<人>）*/
const SEATS={}; for(const z of ZONES){ SEATS[z]=[]; for(let i=0;i<10;i++) SEATS[z].push('@'+(((i*7)%23)-11)+','+(((i*5)%17)-8)); }
/* 訊息 tag：遊戲裡有 tag 的訊息是有限的（原始碼字面 tag 約 335 個＋帶年份、id 的動態 tag）——這裡用 600 個名字輪流 */
const TAGS=[]; for(let i=0;i<600;i++) TAGS.push('msgtag_'+(i<335?'lit':'dyn')+'_'+i);
/* 旗標名稱（原始碼裡出現過的 G.flags.X／F.X）——B 層推估用 */
const FLAGNAMES=(()=>{ const s=new Set(); for(const f of fs.readdirSync(path.join(SRC,'src'))){ if(!/\.js$/.test(f)) continue; const t=fs.readFileSync(path.join(SRC,'src',f),'utf8'); for(const m of t.matchAll(/\bflags\.([A-Za-z_][A-Za-z0-9_]*)/g)) s.add(m[1]); for(const m of t.matchAll(/\bF\.([A-Z][A-Z0-9_]{2,})\b/g)) s.add(m[1]); } return [...s]; })();
const EVIDS=(typeof STORY_EVENTS!=='undefined'?STORY_EVENTS:[]).map(e=>e.id);
console.log('INFO 人物 '+PEOPLE.length+' 位（social_layer 非 P）、記憶 tag '+MEMTAGS.length+' 種、旗標名稱 '+FLAGNAMES.length+' 個、STORY_EVENTS '+EVIDS.length+' 個');

/* ---- B 層（推估）：在存檔的複本上加，不寫進 G（不然旗標會改到遊戲邏輯）---- */
const EVALL=(()=>{ const s=new Set(EVIDS); for(const f of fs.readdirSync(path.join(SRC,'src/data'))){ const t=fs.readFileSync(path.join(SRC,'src/data',f),'utf8'); for(const m of t.matchAll(/\bid:'(ev_[A-Za-z0-9_]+)'/g)) s.add(m[1]); } return [...s]; })();
function bLayer(S0,frac,opt){ const S=JSON.parse(JSON.stringify(S0)); S.events=S.events||{done:{},last:{},count:0}; S.events.done=S.events.done||{}; S.events.last=S.events.last||{};
  const nE=Math.floor(EVALL.length*frac*(opt.evFrac||0.6)); for(let i=0;i<nE;i++){ const id=EVALL[i]; if(!S.events.done[id]){ S.events.done[id]=1; S.events.last[id]=S.day-Math.floor((1-i/nE)*1300); S.events.count=(S.events.count|0)+1; } }
  const nF=Math.floor(FLAGNAMES.length*frac*(opt.flagFrac||0.5)); for(let i=0;i<nF;i++){ const k=FLAGNAMES[i]; if(S.flags[k]==null) S.flags[k]=(i%5===0)?S.day:true; }
  return S; }
/* ---- 欄位大小 ---- */
function fieldSizes(G){ const s=snap(G), o={}; for(const k in s){ const v=s[k]; o[k]=v===undefined?0:JSON.stringify(v).length; } return o; }
function subSizes(obj){ const o={}; if(!obj||typeof obj!=='object') return o; for(const k in obj) o[k]=JSON.stringify(obj[k]===undefined?null:obj[k]).length; return o; }

/* ---- 模擬 ---- */
const D0=1, END=PG.DK('2029-06-30'), END5=PG.DK('2030-01-31');
async function sim(name,opt){ rnd=rngOf(opt.seed); pRight=opt.pRight!=null?opt.pRight:0.7;
  const fl={examSeed:3000+opt.seed}; if(opt.route) fl.EXCHANGE_ROUTE=opt.route;
  const G=H.fresh('2025-09-01',8,'dorm',fl); G.notes=[]; G.memo=[]; CLS.rec(G); G.courses.rollSince=-9999; G.day=D0; G.hour=8;
  const meet=PEOPLE.slice(0,opt.people||30);
  const marks=[]; const fullEnd=opt.delay?END5:END; let ev=0, fg=0;
  const doTerm=async T=>{ if(CLS.termAway(G,T)) return; const r=CALENDAR.termDays(T); const exams=CLS.examList(G,T).slice().sort((a,b)=>a.day-b.day||a.t0-b.t0); return {T,r,exams,last:exams.length?exams[exams.length-1].day:r.to}; };
  const TP={}; for(const T of CLS.LAW_TERMS) TP[T]=await doTerm(T);
  const termEnds={}; for(const T in TP) if(TP[T]) termEnds[TP[T].last+1]=T;
  for(let d=D0; d<=fullEnd; d++){ G.day=d; G.hour=8; G.weekday=CALENDAR.dateOf(d).wd%7; SOCIAL.bind(G);
    const t=CALENDAR.termOf(d); const T=t&&t.id; const tp=T&&TP[T];
    /* 上課、提問 */
    if(tp&&d<=tp.last) for(const it of CLS.dayItems(G,d)){ if(it.exam||rnd()>=0.8) continue; G.hour=it.t0; try{ await CLS.attend(GM,it,{inScene:true}); }catch(e){} }
    /* 延畢那一學期 */
    if(opt.delay&&typeof Y5!=='undefined'&&Y5.classItems) for(const it of Y5.classItems(G,d)){ if(rnd()>=0.8) continue; G.hour=it.t0-0.2; try{ await Y5.attend(GM,it); }catch(e){} }
    if(opt.delay&&typeof FD!=='undefined'&&FD.items) for(const it of FD.items(G,d)){ G.hour=it.t0-0.2; try{ await (Y5.attend||(()=>0))(GM,it); }catch(e){} }
    /* 自習 */
    if(tp&&rnd()<0.3){ const cs=CLS.termCourses(G,T).filter(c=>CLS.isExamCourse(c)); if(cs.length){ const c=cs[Math.floor(rnd()*cs.length)]; const st=CLS.studyTopic(G,c,id=>GM.hasNote(id)); if(st) GM.addNote(st.id,st.title,st.body); } }
    /* 總複習 */
    if(tp&&rnd()<0.5){ const info=STUDY.reviewInfo(G,'final'); if(info){ G.hour=9; try{ await STUDY.review(GM,'final',{home:true}); }catch(e){} } }
    /* 期末考 */
    if(tp) for(const e of tp.exams.filter(e=>e.day===d)){ G.hour=e.t0; forceWrong=!!((opt.failY4S2&&T==='Y4S2'&&e.c.id===opt.failY4S2)||(opt.failY4S1&&T==='Y4S1'&&e.c.id===opt.failY4S1)); try{ await CLS.runExam(GM,{c:e.c,exam:'final',term:T}); } finally { forceWrong=false; } }
    /* 學期末成績單 */
    if(termEnds[d]){ G.hour=9; await CLS.showGrades(GM,termEnds[d],{inScene:true}); }
    if(d===PG.DK('2029-06-18')&&typeof FD!=='undefined'){ try{ await FD.check(GM,{inScene:true}); }catch(e){ console.log('  FD.check 例外 '+e.message); } }
    if(typeof FD!=='undefined'&&FD.mkPending&&FD.mkPending(G)&&d===FD.mkDay()){ G.hour=9.5; forceWrong=!!opt.delay; try{ await FD.makeup(GM); }catch(e){ console.log('  FD.makeup 例外 '+e.message); } finally { forceWrong=false; } }
    /* 手機訊息（每天平均 3 則；真的 PHONE.post：200 則上限、刪掉的 tag 記 cut）*/
    const nMsg=Math.floor(rnd()*7*(opt.msgMul||1)); for(let k=0;k<nMsg;k++){ const who=meet[Math.floor(rnd()*meet.length)]; G.hour=8+rnd()*15; PHONE.post(G,{who,from:rnd()<0.5?who:'me',text:poolTexts[Math.floor(rnd()*poolTexts.length)]||'嗯',tag:rnd()<0.4?TAGS[Math.floor(rnd()*TAGS.length)]:undefined}); }
    /* 人物記憶（每天平均 1 筆；真的 SOCIAL.remember：同一天同 tag 不重複、每人 80 筆）*/
    const nMem=Math.floor(rnd()*4*(opt.memMul||1)); for(let k=0;k<nMem;k++){ const who=meet[Math.floor(rnd()*meet.length)]; SOCIAL.remember(who,MEMTAGS[Math.floor(rnd()*MEMTAGS.length)],rnd()<0.3?poolTexts[Math.floor(rnd()*poolTexts.length)].slice(0,20):''); }
    /* 習慣（每天 3～6 個鍵）*/
    { const zs=meet.length?ZONES.slice(0,opt.zones||ZONES.length):ZONES; for(let k=0;k<3+Math.floor(rnd()*3);k++){ const z=zs[Math.floor(rnd()*zs.length)], tod=TOD[Math.min(4,k)], who=rnd()<0.3?meet[Math.floor(rnd()*Math.min(meet.length,opt.companions||8))]:null;
        EVENTS.habit('place:'+z+':'+tod); if(who) EVENTS.habit('place:'+z+':with:'+who);
        if(rnd()<0.5){ EVENTS.habit('seat:'+z+':'+SEATS[z][Math.floor(rnd()*SEATS[z].length)]); if(who) EVENTS.habit('seat:'+z+':with:'+who); }
        if(rnd()<0.3){ EVENTS.habit('meal:'+z); if(who) EVENTS.habit('meal:'+z+':with:'+who); } } }
    if(opt.grad&&rnd()<0.05) SOCIAL.gradBump('準備研究所：讀書會','civil');
    /* 量測點：每學期成績單那天、畢業、延畢後 */
    const lab=termEnds[d]?termEnds[d]+' 成績單後':d===PG.DK('2029-06-02')?'畢業典禮（2029-06-02）':d===END?'2029-06-30':d===END5?'延畢學期後（2030-01-31）':null;
    if(lab){ const frac=Math.min(1,(d-D0)/(END-D0)); const S0=bLayer(snap(G),frac,opt); const fs_={}; for(const k in S0) fs_[k]=S0[k]===undefined?0:JSON.stringify(S0[k]).length; const chars=JSON.stringify(S0).length; if(SAVE_OUT&&chars>BIG.chars){ BIG.chars=chars; BIG.json=JSON.stringify(S0); BIG.lab=lab; } const realChars=sizeOf(G); marks.push({lab,day:d,date:CALENDAR.dateOf(d).key,chars,realChars,fields:fs_,
        detail:{courses:subSizes(G.courses),social:subSizes(G.social),notesN:(G.notes||[]).length,notesKinds:(G.notes||[]).reduce((a,n)=>{ const k=/^examfix_/.test(n.id)?'examfix':/^ask_/.test(n.id)?'ask':/_w\d+$/.test(n.id)?'study':'other'; a[k]=(a[k]||0)+1; a[k+'_chars']=(a[k+'_chars']||0)+JSON.stringify(n).length; return a; },{}),
          doneKeys:Object.keys(G.courses.done||{}).length,examKeys:Object.keys(G.courses.exam||{}).length,msgs:(G.msgs||[]).length,memN:Object.values(G.social.mem||{}).reduce((a,x)=>a+x.length,0),habitKeys:Object.keys(G.habits||{}).length,flagsN:Object.keys(G.flags).length,cut:((G.phone||{}).cut||[]).length}}); }
  }
  return {name,G,marks}; }

(async()=>{
  const SHA=(()=>{ try{ return require('child_process').execSync('git -C '+J(SRC)+' rev-parse --short HEAD').toString().trim(); }catch(e){ return '?'; } })();
  console.log('受測：'+SRC+'（'+SHA+'）');
  console.log('INFO 事件 id（STORY_EVENTS＋src/data 裡的 ev_ id）'+EVALL.length+' 個');
  const ROUTES=[
    ['TW 一般',{seed:1}],
    ['JP 交換',{seed:2,route:'JP'}],
    ['US 交換',{seed:3,route:'US'}],
    /* D124（690ac5f4d 起）：海商法改選修、被當不延畢。預設 FAIL_ROUTE=retake：大四上 RETAKE_COURSE（預設 enforcement）期末全錯 → 真的 showGrades／planRetakes 排進大四下 → 大四下重修期末全錯＋補考全錯；
       FAIL_ROUTE=maritime＝舊路線（大四下海商法全錯＋補考全錯；D124 以前的版本用）*/
    FAIL_ROUTE==='maritime'?['延畢一學期（大四下海商法全錯＋補考全錯）',{seed:4,failY4S2:'maritime',delay:true}]
      :['延畢一學期（大四上'+RT_NAME+'全錯→大四下重修全錯＋補考全錯）',{seed:4,failY4S1:RT_COURSE,failY4S2:RT_COURSE,delay:true}],
    ['研究所路線',{seed:5,grad:true,pRight:0.85}],
    ['重度玩家（記憶×3、全部人物、同行對象 58 位、事件全演、旗標 80%）',{seed:6,msgMul:2,memMul:3,people:999,companions:999,evFrac:1,flagFrac:0.8,pRight:0.5}]];
  const out=[];
  for(const [n,o] of ROUTES){ const t0=Date.now(); const r=await sim(n,o); out.push(r);
    console.log('== '+n+'（'+((Date.now()-t0)/1000).toFixed(0)+' 秒；FAIL_DELAY='+J(r.G.flags.FAIL_DELAY_COURSES)+'、FD_MAKEUP='+J(r.G.flags.FD_MAKEUP&&r.G.flags.FD_MAKEUP.status)+'、y5.cls='+Object.keys((r.G.y5||{}).cls||{}).length+'）');
    let prev=0; for(const m of r.marks){ const top=Object.entries(m.fields).sort((a,b)=>b[1]-a[1]).slice(0,6).map(([k,v])=>k+' '+v).join('、'); console.log('  '+m.date+' '+m.lab.padEnd(14)+' '+String(m.chars).padStart(7)+' 字（'+(m.chars*2/1024).toFixed(0)+' KB；A 層 '+m.realChars+'）＋'+(m.chars-prev)+'　最大：'+top); prev=m.chars; }
    const L=r.marks[r.marks.length-1]; console.log('  細項：'+J(L.detail).slice(0,900)); }
  /* 總量 */
  const worst=Math.max(...out.map(r=>Math.max(...r.marks.map(m=>m.chars))));
  const settings=JSON.stringify({quality:'medium',joystick:true,volume:0.6,textSpeed:1,fps:false,glbChar:true,mdbg:false,guide:true,classRemind:true,wakeMenu:true}).length;
  const stuck=5*JSON.stringify({at:'2029-06-18T10:00',v:'v9.5.x 2029',day:1400,hour:10.25,zone:'library_hall',depth:2,by:['xxxxxxxx','yyyyyyyy','zzzz','wwww'],cover:'xxxxxxxx',ff:false,evr:'ev_xxxxxxxx_yyyy'}).length;
  const y0=Math.round(worst*0.15);   /* fatiao3d_backup_y0end：舊序章系所那一年最後一天（還沒有法律系的紀錄）——量不到，用 15% 估 */
  const copies={auto:1,quick:1,slot:3,backup:1,'backup_new_（最多 3）':3,'backup_y0end（小）':0,'backup_fm120（只有舊存檔）':1};
  const nFull=1+1+3+1+3+1;
  const keyChars=('fatiao3d_auto'+'fatiao3d_quick'+'fatiao3d_slot_1'.repeat(3)+'fatiao3d_backup'+'fatiao3d_backup_new_1730000000000'.repeat(3)+'fatiao3d_backup_y0end'+'fatiao3d_backup_fm120_1730000000000'+'fatiao3d_settings'+'fatiao3d_stuck').length;
  const total=worst*nFull+y0+settings+stuck+keyChars;
  const LIMIT=5*1024*1024;
  console.log('== 總量（最壞：全部格子都是最大的那一份）');
  console.log('  單一存檔最大 '+worst+' 字＝'+(worst*2/1024).toFixed(0)+' KB；完整大小的份數 '+nFull+'（auto、quick、slot×3、backup、backup_new_×3、backup_fm120）＋y0end 約 '+y0+' 字＋settings '+settings+'＋stuck '+stuck+'＋key '+keyChars);
  console.log('  合計 '+total+' 字＝'+(total*2/1024/1024).toFixed(2)+' MB（以 5 MB＝'+LIMIT+' bytes 計，剩 '+((LIMIT-total*2)/1024/1024).toFixed(2)+' MB）');
  const typical=worst*(1+1+3+1)+settings;   /* 一般玩家：auto、quick、三格、backup */
  console.log('  一般情況（auto＋quick＋三格＋backup）'+(typical*2/1024/1024).toFixed(2)+' MB');
  const perSave=Math.floor(LIMIT/2/nFull); console.log('  要塞得下 '+nFull+' 份，單一存檔上限約 '+perSave+' 字（'+(perSave*2/1024).toFixed(0)+' KB）＝目前最大的 '+(perSave/worst).toFixed(1)+' 倍');
  check('1 最壞情況總量 < 5 MB',total*2<LIMIT,(total*2/1024/1024).toFixed(2)+' MB');
  check('2 最壞情況總量 < 5 MB 的 80%（留給之後的內容成長）',total*2<LIMIT*0.8,(total*2/1024/1024).toFixed(2)+' MB');
  if(SAVE_OUT&&BIG.json){ fs.writeFileSync(SAVE_OUT,BIG.json); console.log('  最大一份存檔寫到 '+SAVE_OUT+'：'+BIG.chars+' 字（'+(BIG.chars*2/1048576).toFixed(2)+' MB UTF-16）時點 '+BIG.lab); }
  if(JSON_OUT) fs.writeFileSync(JSON_OUT,J({sha:SHA,routes:out.map(r=>({name:r.name,marks:r.marks})),worst,total,nFull,settings,stuck,y0,keyChars}));
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });
