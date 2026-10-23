// DL-03 時段次數制（AA_160 第 2 節；取代體力）——不需要瀏覽器。
// 檢查：DEC-SLOTS-1018（使用者 10-23 選擇題 ③：每個時段一件主要的事）上午 1、下午 1、晚上 1（過了午夜還是晚上）；上課、活動、出遊填滿那個時段（slotFillSpan，照樣能去）；考試週每個時段多 1 次、只給自習；跨進下一個時段 30 分鐘以上兩個時段都扣；用完變灰「這個下午已經排滿了（2／2）」；
//       自習長度選單（1～3 小時、讀到下一件事前；閉館前讀不完變灰；寫會錯過的課）；約好的打工用 slotFill 填滿那個時段；換日歸零、舊存檔沒有 G.slots、第一二天不算；手機「今天」最上面一行。
// 修改前：沒有 CLS.slotPlan（第 1 項就失敗）。用法：node tests/dl03_slots_unit.js
const vm=require('vm'), fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.location={search:''}; global.document={getElementById:()=>null,addEventListener(){}};
for(const f of ['src/data/characters.js','src/data/places.js','src/data/calendar.js','src/data/courses.js','src/classes3d.js']) vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (CHARACTERS|PLACES|SOCIAL_GRAPH|UNFAMILIAR_POOL|PORTRAITS|CALENDAR|COURSES|CLS)\s*=/mg,'global.$1='),{filename:f});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
check('有 CLS.slotPlan、slotUse、slotFill、studyLengths、chooseStudy、slotLine',['slotPlan','slotUse','slotFill','studyLengths','chooseStudy','slotLine','slotHTML'].every(k=>typeof CLS[k]==='function'));
if(fails){ console.log('FAILED '+fails); process.exit(1); }
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
const mkG=(day,hour,zone)=>({day,hour,weekday:CALENDAR.dateOf(day).wd%7,zone:zone||'dorm',flags:{},courses:{},invites:[]});
const mkGM=(G,ans)=>{ const q=(ans||[]).slice(), menus=[], toasts=[]; return {G,E:{player:{obj:{position:{x:0,y:0,z:0}},riding:false}},menus,toasts,choose:async o=>{ menus.push(o.map(x=>x.t+(x.dim?'〔灰〕':'')+(x.hint?'〔'+x.hint+'〕':''))); return q.length?q.shift():0; },toast(t){ toasts.push(t); }}; };
const SAT=dayOf('2025-10-04');   // 大一上第 5 週週六（沒有課）
(async()=>{
  { const G=mkG(SAT,9); const p=CLS.slotPlan(G,1,'study'); check('1. 上午 1 次：週六 09:00 讀 1 小時＝用掉上午 1 次（還剩 0）',p.ok&&p.uses.join()==='am'&&p.hint==='用掉上午 1 次（還剩 0）',JSON.stringify(p));
    CLS.slotUse(G,p.uses); const p2=CLS.slotPlan(G,1,'study'); check('1. 上午用完：「這個上午已經排滿了（1／1）」',!p2.ok&&p2.why==='這個上午已經排滿了（1／1）',JSON.stringify(p2));
    G.hour=13; const p3=CLS.slotPlan(G,1,'study'); check('1. 下午還有 1 次（③：每個時段一件）',p3.ok&&p3.hint==='用掉下午 1 次（還剩 0）',p3.hint);
    G.hour=11; const p4=CLS.slotPlan(G,1,'study'); check('1. 11:00 讀 1 小時（不跨進下午 30 分鐘）：只看上午 → 已經排滿',!p4.ok); }
  { const G=mkG(SAT,17); const p=CLS.slotPlan(G,2,'study'); check('2. 17:00 讀 2 小時（跨進晚上 1 小時）：下午、晚上各扣 1 次',p.ok&&p.uses.join()==='pm,ev'&&p.hint==='用掉下午、晚上各 1 次',JSON.stringify(p));
    const q=CLS.slotPlan(G,1.4,'study'); check('2. 17:00 讀 1.4 小時（跨進 24 分鐘，不到 30 分鐘）：只扣下午',q.uses.join()==='pm',JSON.stringify(q));
    G.slots={day:SAT,used:{am:0,pm:0,ev:1}}; const r=CLS.slotPlan(G,2,'study'); check('2. 晚上已經滿了：跨進晚上的長度變灰「晚上已經排滿了」',!r.ok&&r.why==='晚上已經排滿了',JSON.stringify(r));
    G.hour=25; G.slots={day:SAT,used:{am:0,pm:0,ev:0}}; check('2. 過了午夜（01:00）還是晚上',CLS.slotPlan(G,1,'study').uses.join()==='ev'); }
  { let ex=null; for(let d=SAT;d<SAT+120&&!ex;d++){ const t=CALENDAR.termOf(d); if(t&&t.exam) ex=d; } const G=mkG(ex,9);
    check('3. 考試週：自習每個時段多 1 次（上午 2 次）',CLS.slotCap(G,'am','study')===2&&CLS.slotCap(G,'am','trip')===1);
    CLS.slotUse(G,['am']); check('3. 考試週上午用過 1 次：自習還可以、其他主要活動不行',CLS.slotPlan(G,1,'study').ok&&!CLS.slotPlan(G,1,'trip').ok);
    check('3. 手機那一行：考試週多一格（上午 ●○、下午 ○○、晚上 ○○）',CLS.slotLine(G)==='上午 ●○　下午 ○○　晚上 ○○',CLS.slotLine(G)); }
  { const G=mkG(SAT,9); G.slots={day:SAT-1,used:{am:1,pm:2,ev:2}}; check('4. 換日歸零（G.slots.day 是昨天）',CLS.slotPlan(G,1,'study').ok&&CLS.slotRec(G).used.pm===0);
    const G2=mkG(SAT,9); delete G2.slots; check('4. 舊存檔沒有 G.slots：今天都還沒用',CLS.slotPlan(G2,1,'study').ok&&CLS.slotLine(G2)==='上午 ○　下午 ○　晚上 ○',CLS.slotLine(G2));
    const G3=mkG(2,15); check('4. 第一、二天（開場劇情）不算次數',CLS.slotPlan(G3,3,'study').ok&&CLS.slotPlan(G3,3,'study').uses.length===0&&CLS.slotLine(G3)===''); }
  { const G=mkG(SAT,19); CLS.slotFill(G,'ev'); check('5. 約好的打工（家教）去了以後：那天晚上不能再開始別的主要活動',!CLS.slotPlan(G,1,'study').ok); }
  { const G=mkG(SAT,9); CLS.slotFillSpan(G,9+10/60,12+10/60); check('5b. ③ 上過一堂 09:10～12:10 的課（跨進下午 10 分鐘）：上午填滿、下午還在',!CLS.slotPlan(G,1,'study').ok&&(G.hour=13,CLS.slotPlan(G,1,'study').ok),JSON.stringify(G.slots));
    const G2=mkG(SAT,13); CLS.slotFillSpan(G2,13+20/60,16+20/60); check('5b. ③ 下午的課：下午不能再自習、自由出行',!CLS.slotPlan(G2,1,'study').ok&&!CLS.slotPlan(G2,1,'trip').ok);
    const G3=mkG(SAT,17); CLS.slotFillSpan(G3,17,21); check('5b. ③ 17:00～21:00 的出遊（跨進晚上）：下午、晚上都填滿',CLS.slotRec(G3).used.pm===1&&CLS.slotRec(G3).used.ev===1,JSON.stringify(G3.slots));
    const G4=mkG(SAT,9); CLS.slotUse(G4,['am']); CLS.slotFillSpan(G4,10,11); check('5b. ③ 時段已經用過再去上課：照樣能去（不擋）、次數不會超過上限',CLS.slotRec(G4).used.am===1);
    const src=fs.readFileSync(path.join(ROOT,'src/classes3d.js'),'utf8'), out=fs.readFileSync(path.join(ROOT,'src/outings3d.js'),'utf8');
    check('5b. ③ 接線：CLS.attend 上完一堂、attendActivity 活動結束、OUT.go 出遊與校外約會結束都 slotFillSpan',/S\.slotFillSpan\(G,it\.t0,Math\.max\(it\.t1,hr\(G\)\)\)/.test(src)&&/S\.slotFillSpan\(G,a\.t0,a\.t1\)/.test(src)&&(out.match(/fill\(\);/g)||[]).length===2&&/CLS\.slotFillSpan\(G,h0,/.test(out)); }
  // 自習長度選單
  { const THU=dayOf('2025-09-25'); const G=mkG(THU,10.6,'dorm'); const L=CLS.studyLengths(mkGM(G)); const t=L.map(q=>q.t+(q.dim?'〔灰〕':''));
    check('6. 週四 10:36 在宿舍：讀 1／2／3 小時＋讀到民法總則前',t.length===4&&t[0]==='讀 1 小時'&&t[3].startsWith('讀到民法總則前（'),JSON.stringify(t));
    check('6. 讀 1 小時（10:36～11:36）：上午 1 次',L[0].hint.startsWith('用掉上午 1 次'),L[0].hint);
    check('6. 讀 3 小時（到 13:36）會錯過 13:20 民法總則：提示寫出來（R1）',/會錯過：13:20 民法總則/.test(L[2].hint),L[2].hint);
    const G2=mkG(SAT,20.5,'library_hall'); const L2=CLS.studyLengths(mkGM(G2)); check('6. 總圖 20:30（22:00 閉館）：讀 2、3 小時變灰「閉館前讀不完」',!L2[0].dim&&L2[1].dim&&L2[2].dim&&L2[1].hint==='閉館前讀不完',JSON.stringify(L2.map(q=>q.t+':'+q.hint)));
    const gm=mkGM(G2,[1]); const r=await CLS.chooseStudy(gm); check('6. 選了變灰的長度：不讀、提示原因',r===null&&gm.toasts[0]==='閉館前讀不完',JSON.stringify(gm.toasts));
    const gm2=mkGM(mkG(SAT,9),[0]); const r2=await CLS.chooseStudy(gm2); check('6. 選「讀 1 小時」：回傳 1 小時、上午',r2&&r2.hours===1&&r2.uses.join()==='am'); }
  { const G=mkG(SAT,13); CLS.slotUse(G,['pm']); const h=CLS.slotHTML(G); check('7. 手機「今天」最上面：「上午 ○　下午 ●　晚上 ○」＋說明（每個時段一件主要的事）',/今天的時間/.test(h)&&/上午 ○　下午 ●　晚上 ○/.test(h)&&/每個時段一件主要的事/.test(h),h.slice(0,160)); }
  /* 8. 時段次數用完就到下一個時段（使用者 2026-10-16「下午還剩 0 次，就應該跳晚上」）*/
  { const GMx=(G)=>{ const caps=[]; const gm={G,E:{player:{obj:{position:{x:0,y:0,z:0}},busy:false}},caps,toast(){},setGoal(){},sceneBegin(){},sceneEnd(){},fade:async()=>{},sleep:async()=>{},advance(h){ G.hour+=h; },caption(w,t){ caps.push(t); },choose:async()=>0,autosave(){}}; return gm; };
    const G=mkG(SAT,13); CLS._jump=null; CLS.queueJump(G); check('8. 下午還沒用：不跳',CLS._jump===null);
    G.hour=15; CLS.slotUse(G,['pm']); CLS.queueJump(G); check('8. 下午 1／1 用完（週六 15:00）：排「到下一個時段」',CLS._jump&&CLS._jump.p==='pm'&&CLS.jumpTarget(G,'pm')===18,JSON.stringify(CLS._jump));
    const gm=GMx(G); const ok=await CLS.afterSlot(gm); check('8. 跳到 18:00、字幕寫「下午的時間用完了」',ok&&Math.abs(G.hour-18)<1e-6&&/下午的時間用完了/.test(gm.caps[0]||''),G.hour+' '+JSON.stringify(gm.caps));
    const G2=mkG(SAT,19); G2.slots={day:SAT,used:{am:0,pm:0,ev:1}}; CLS._jump=null; CLS.queueJump(G2); check('8. 晚上用完：不跳（照舊去睡）',CLS._jump===null);
    const G3=mkG(SAT,10.5); CLS.slotUse(G3,['am']); CLS.queueJump(G3); const gm3=GMx(G3); await CLS.afterSlot(gm3); check('8. 上午 1／1 用完（10:30）：跳到 12:00',Math.abs(G3.hour-12)<1e-6,String(G3.hour));
    let wd=null, it0=null; for(let d=SAT+2;d<SAT+7&&!wd;d++){ const Gt=mkG(d,13); const its=CLS.dayItems(Gt).filter(it=>it.t0>=12.5&&it.t0<17.5); if(its.length){ wd=d; it0=its[0]; } }
    if(wd){ const G4=mkG(wd,12.1); G4.slots={day:wd,used:{am:0,pm:0,ev:0}}; CLS.slotUse(G4,['pm']); CLS.queueJump(G4); const t=CLS.jumpTarget(G4,'pm'); check('8. 今天下午還有課（'+it0.c.name+' '+it0.t0.toFixed(2)+'）：只跳到上課前 10 分鐘',Math.abs(t-(it0.t0-1/6))<1e-6,String(t)); }
    else check('8. 找得到下午有課的平日（測試資料）',false);
    const G5=mkG(SAT,15); G5.slots={day:SAT,used:{am:0,pm:1,ev:0}}; CLS._jump={day:SAT-1,p:'pm'}; check('8. 排的是昨天的：不跳',!(await CLS.afterSlot(GMx(G5)))&&G5.hour===15); }
  { const g3=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8'); check('8. 座位選單：這個時段排滿了，多一個「待到晚上（18:00）／待到中午」選項（照 jumpTarget，選了走 skipTo）',/待到晚上/.test(g3)&&/jumpTo:jt/.test(g3)&&/CLS\.skipTo\(GM,opts\[i\]\.jumpTo/.test(g3));
    const st=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'); check('8. 讀完書、運動完排的跳轉在 STORY.tick 執行（不在對話、劇情中）',/CLS\._jump&&!S\._jumping/.test(st)&&/CLS\.afterSlot\(GM\)/.test(st)); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
