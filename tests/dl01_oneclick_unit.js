// DL-01 一鍵上課（AA_160 第 1 節；AA-B 定案）——不需要瀏覽器。
// 檢查：路程與出門時間（開始前 10 分鐘到教室）、提示「會遲到 N 分鐘」「進去會記缺席」；起床選單三個選項（期末考只有兩個、不能翹）；
//       翹課只記 plan_skip（G.flags 前後一樣）、手機寫「翹課」「反悔：直接去上課」；直接去上課：等到出門時間 → 進教室區域 → 選位子（老位子／坐中間、坐在認識的人旁邊、自己找）
//       → 坐下自動上課（seatMenu autoClass）；下課選單（空檔 60 分鐘以上四個選項、不到 60 分鐘三個）；在附近讀書讀到出門時間、記準備；小睡醒來排起床選單。
// 修改前：沒有 CLS.goClass／wakeMenu（第 1 項就失敗）。用法：node tests/dl01_oneclick_unit.js
const vm=require('vm'), fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.location={search:''}; global.document={getElementById:()=>null,addEventListener(){}};
global.SOCIAL={displayName:id=>(CHARACTERS[id]&&CHARACTERS[id].name)||id,stage:id=>id==='heroine_01'?'ACQUAINTANCE':'STRANGER'};
for(const f of ['src/data/characters.js','src/data/places.js','src/data/calendar.js','src/data/courses.js','src/classes3d.js']) vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (CHARACTERS|PLACES|SOCIAL_GRAPH|UNFAMILIAR_POOL|PORTRAITS|CALENDAR|COURSES|CLS)\s*=/mg,'global.$1='),{filename:f});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
check('有 CLS.goClass、wakeMenu、afterMenu、skipClass、goPlan',['goClass','wakeMenu','afterMenu','skipClass','goPlan','seatChoices','oneTick','queueWake'].every(k=>typeof CLS[k]==='function'));
if(fails){ console.log('FAILED '+fails); process.exit(1); }
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
function mkGM(zone,day,hour,answers){ const said=[], menus=[], toasts=[], seatCalls=[], enters=[];
  const E={npcs:[],interactables:[],zone:{},player:{obj:{position:{x:0,y:0,z:0}},busy:false,lv:0,riding:false}};
  const G={day,hour,weekday:CALENDAR.dateOf(day).wd%7,zone,flags:{keep:1},courses:{},money:5000,stats:{study:0},invites:[]};
  const q=(answers||[]).slice(); let depth=0;
  const gm={E,G,D:{active:false},S:{},said,menus,toasts,seatCalls,enters,
    sceneBegin(){ depth++; E.player.busy=true; },sceneEnd(){ depth=Math.max(0,depth-1); if(!depth) E.player.busy=false; },
    say:async(n,t)=>{ said.push(t); },choose:async o=>{ menus.push(o.map(x=>x.t+(x.hint?'〔'+x.hint+'〕':''))); return q.length?q.shift():0; },
    fade:async()=>{},sleep:async()=>{},advance(h){ G.hour+=h; },caption(a,t){ said.push('〔'+t+'〕'); },toast(t){ toasts.push(t); },money(d){ G.money+=d; },autosave(){},setGoal(){},
    enter:async z=>{ enters.push(z); G.zone=z; E.zone={}; },seatMenu:async(it,so)=>{ seatCalls.push({seat:it.seat,so}); }};
  return gm; }
// 9/25 週四：09:10 大一英文（共同 102）、13:20 民法總則（霖澤館 201）
const THU=dayOf('2025-09-25');
{ const its=CLS.dayItems({day:THU,hour:7,flags:{},courses:{}}).map(it=>it.c.id+'@'+it.t0); check('前提：9/25 週四有大一英文、民法總則',its.some(s=>s.startsWith('english_y1'))&&its.some(s=>s.startsWith('civ_general')),its.join(','));
}
// ---------- 1. 路程與出門時間 ----------
{ const gm=mkGM('dorm',THU,12,[]); const it=CLS.dayItems(gm.G).find(q=>q.c.id==='civ_general'); const pl=CLS.goPlan(gm,it);
  const m=CLS.travelMinutes(gm.G,'dorm','linze')+3;
  check('1. 宿舍 → 霖澤館 201：路程＝宿舍到霖澤館＋3 分鐘；出門時間＝13:10 減路程',pl.mins===m&&Math.abs(pl.depart-(it.t0-1/6-m/60))<1e-6,JSON.stringify({mins:pl.mins,m,depart:CLS.hhmm(pl.depart)}));
  check('1. 提示寫「走路 N 分鐘，13:10 到教室」',/^走路 \d+ 分鐘，13:10 到教室$/.test(CLS.planHint(gm,it,pl)),CLS.planHint(gm,it,pl));
  gm.G.hour=it.t0-m/60+8/60; const h2=CLS.planHint(gm,it); check('1. 出門時已經來不及（到教室是 13:28）：「現在出門會遲到 8 分鐘」',/現在出門會遲到 8 分鐘/.test(h2),h2);
  gm.G.hour=it.t0+20/60; const h3=CLS.planHint(gm,it); check('1. 已經開始 20 分鐘：「已經開始 20 分鐘，進去會記缺席」',/已經開始 20 分鐘，進去會記缺席/.test(h3),h3);
  gm.G.zone='linze'; gm.G.hour=12; check('1. 人在霖澤館：3 分鐘',CLS.goPlan(gm,it).mins===3); }
// ---------- 2. 起床選單 ----------
(async()=>{
  { const gm=mkGM('dorm',THU,7.5,[2]); await CLS.wakeMenu(gm); const m=gm.menus[0]||[];
    check('2. 起床選單：第一行「早安。今天的課：09:10　大一英文…／13:20　民法總則…」',/^早安。今天的課：09:10　大一英文.*13:20　民法總則/.test(gm.said[0]||''),gm.said[0]);
    check('2. 三個選項：直接去上課：大一英文／翹這堂課／先起床再說',m.length===3&&m[0].startsWith('直接去上課：大一英文')&&m[1].startsWith('翹這堂課')&&m[2].startsWith('先起床再說'),JSON.stringify(m));
    check('2. 選「先起床再說」：什麼都不變（沒有翹課紀錄、沒有進區域）',!Object.keys(gm.G.courses.note||{}).some(k=>k.startsWith('plan_skip'))&&!gm.enters.length); }
  { const gm=mkGM('dorm',THU,7.5,[1,0,1]); const f0=JSON.stringify(gm.G.flags); await CLS.wakeMenu(gm); const it=CLS.dayItems(gm.G).find(q=>q.c.id==='english_y1');
    check('2. 翹這堂課 →「翹掉大一英文（上）？記「沒去」，不扣分。」→ 翹 → 記 plan_skip',CLS.planSkip(gm.G,it)&&gm.said.some(t=>/^翹掉大一英文（上）？記「沒去」，不扣分。$/.test(t)),gm.said.join(' / '));
    check('2. 翹了以後問「再睡一下（睡到 10:30）／起床」',(gm.menus[2]||[]).some(t=>t.startsWith('再睡一下（睡到 10:30）')),JSON.stringify(gm.menus[2]));
    check('2. 翹課不改任何旗標（G.flags 前後一樣）',JSON.stringify(gm.G.flags)===f0);
    const html=CLS.todayHTML(gm.G); check('2. 手機「今天」：大一英文寫「翹課」、按鈕「反悔：直接去上課」',/大一英文[\s\S]*?翹課[\s\S]*?反悔：直接去上課/.test(html));
    gm.G.hour=10; const w=CLS.goList(gm.G).filter(q=>!CLS.planSkip(gm.G,q)); check('2. 翹掉以後，下一次起床選單從民法總則開始',w[0]&&w[0].c.id==='civ_general'); }
  { const gm=mkGM('dorm',THU,7.5,[1,0,0]); await CLS.wakeMenu(gm); check('2. 選「再睡一下」：睡到 10:30、排了下一次起床選單',Math.abs(gm.G.hour-10.5)<0.01&&!!CLS.pending().wake,JSON.stringify({h:gm.G.hour,p:CLS.pending()})); CLS.clearPending(); }
  { const gm=mkGM('dorm',THU,7.5,[1,1]); await CLS.wakeMenu(gm); const it=CLS.dayItems(gm.G).find(q=>q.c.id==='english_y1');
    check('2. 翹課確認選「還是去」：照常直接去（進共同教學館），沒有翹課紀錄',!CLS.planSkip(gm.G,it)&&gm.enters[0]==='gongtong',JSON.stringify(gm.enters)); }
  // ---------- 3. 期末考 ----------
  { let fd=null; for(let d=THU;d<THU+140&&!fd;d++){ const its=CLS.dayItems({day:d,hour:7,flags:{},courses:{}}); if(its.some(q=>q.exam==='final'&&q===its[0])) fd=d; }
    check('3. 前提：找得到第一堂是期末考的日子',!!fd,String(fd));
    if(fd){ const gm=mkGM('dorm',fd,7,[1]); await CLS.wakeMenu(gm); const m=gm.menus[0]||[];
      check('3. 期末考那天：只有「直接去考場」「先起床（考試前 10 分鐘會自動帶你進考場）」，沒有翹',m.length===2&&m[0].startsWith('直接去考場：')&&/考試前 10 分鐘會自動帶你進考場/.test(m[1])&&!m.some(t=>t.includes('翹')),JSON.stringify(m));
      const it=CLS.dayItems(gm.G)[0]; check('3. 期末考不能翹（skipClass 回 false、不記）',!(await CLS.skipClass(gm,it))&&!CLS.planSkip(gm.G,it)); } }
  // ---------- 4. 直接去上課：等到出門 → 進 201 → 選位子 → 自動上課 ----------
  { const gm=mkGM('dorm',THU,11,[0]); const it=CLS.dayItems(gm.G).find(q=>q.c.id==='civ_general'); const pl=CLS.goPlan(gm,it);
    // 進 201 時放座位（3 排 × 4）、以安坐在第 2 排第 2 個
    gm.enter=async z=>{ gm.enters.push(z); gm.G.zone=z; gm.E.zone={}; const its=[]; for(let r=0;r<3;r++) for(let c=0;c<4;c++){ const seat={x:c*0.8,z:r*1.2,yaw:Math.PI,lv:0,row:r+1,col:c+1}; its.push({x:seat.x,z:seat.z,seat}); } gm.E.interactables=its; gm.E.npcs=[{charId:'heroine_01',seat:its[5].seat}]; };
    await CLS.goClass(gm,it); const m=gm.menus[0]||[];
    check('4. 等到出門時間（'+CLS.hhmm(pl.depart)+'）再出門，13:10 左右到教室',Math.abs(gm.G.hour-(it.t0-1/6))<0.02,CLS.hhmm(gm.G.hour));
    check('4. 進的是 classroom（201）',gm.enters[0]==='classroom',JSON.stringify(gm.enters));
    check('4. 坐哪裡：坐中間的位子（第一次）／坐在沈以安旁邊／自己找位子',m.length===3&&m[0].startsWith('坐中間的位子')&&/^坐在.+旁邊/.test(m[1])&&m[2].startsWith('自己找位子'),JSON.stringify(m));
    check('4. 選了以後：坐下（seatMenu autoClass）＝自動上課',gm.seatCalls.length===1&&gm.seatCalls[0].so&&gm.seatCalls[0].so.autoClass===true);
    CLS.rememberSeat(gm.G,it,gm.seatCalls[0].seat); const ch=CLS.seatChoices(gm,it); check('4. 坐過一次以後第一個選項是「老位子」',ch[0]&&ch[0].t==='老位子'&&ch[0].it.seat===gm.seatCalls[0].seat,ch.map(q=>q.t).join(','));
    check('4. 一鍵上課本身不寫出席（紀錄由 CLS.attend 寫）',!Object.keys((gm.G.courses.done)||{}).length&&!Object.keys((gm.G.courses.attend)||{}).length); }
  // ---------- 5. 下課選單 ----------
  { const gm=mkGM('gongtong',THU,10.2,[1]); const nx=CLS.dayItems(gm.G).find(q=>q.c.id==='civ_general'); const en=CLS.dayItems(gm.G).find(q=>q.c.id==='english_y1'); CLS.rec(gm.G).done[en.key]=1;
    gm.enter=async z=>{ gm.enters.push(z); gm.G.zone=z; gm.E.interactables=[]; };
    await CLS.afterMenu(gm,en.key); const m=gm.menus[0]||[]; const pl=CLS.goPlan(mkGM('gongtong',THU,10.2),nx);
    check('5. 空檔 60 分鐘以上：先去吃飯／在附近讀書／先自由活動／下一堂不去',m.length===4&&m[0].startsWith('先去吃飯')&&m[1].startsWith('在附近讀書')&&m[2].startsWith('先自由活動')&&m[3].startsWith('下一堂不去'),JSON.stringify(m));
    check('5. 在附近讀書：讀到出門時間、民法總則的準備＋（每小時一份）、接著直接去',Math.abs(gm.G.hour-(pl.depart+pl.mins/60))<0.05&&(CLS.rec(gm.G).prep.civ_general||0)>=2&&gm.enters.includes('classroom'),JSON.stringify({h:CLS.hhmm(gm.G.hour),prep:CLS.rec(gm.G).prep,enters:gm.enters})); }
  { const gm=mkGM('linze',THU,12.9,[1]); const en=CLS.dayItems(gm.G).find(q=>q.c.id==='english_y1'); CLS.rec(gm.G).done[en.key]=1; await CLS.afterMenu(gm,en.key); const m=gm.menus[0]||[];
    check('5. 空檔不到 60 分鐘：直接去下一堂：民法總則／先自由活動／下一堂不去',m.length===3&&m[0].startsWith('直接去下一堂：民法總則')&&m[1].startsWith('先自由活動')&&m[2].startsWith('下一堂不去'),JSON.stringify(m)); }
  { const gm=mkGM('classroom',THU,15.2,[]); for(const q of CLS.dayItems(gm.G)) CLS.rec(gm.G).done[q.key]=1; await CLS.afterMenu(gm,'x'); check('5. 今天沒有下一堂：只出一行「今天的課上完了。」',!gm.menus.length&&gm.said.some(t=>/今天的課上完了/.test(t))); }
  // ---------- 6. 手機的按鈕 ----------
  { const gm=mkGM('dorm',THU,8,[]); const html=CLS.todayHTML(gm.G); check('6. 手機「今天」：按鈕是「直接去上課」（原本「去教室」）',/直接去上課/.test(html)&&!/>去教室</.test(html));
    gm.G.hour=9+10/60+20/60; const h2=CLS.todayHTML(gm.G); check('6. 開始超過 15 分鐘：按鈕「去聽後半堂（記缺席）」',/去聽後半堂（記缺席）/.test(h2)); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
