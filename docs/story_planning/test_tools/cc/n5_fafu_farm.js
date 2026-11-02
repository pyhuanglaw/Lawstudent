// N5 法服能不能刷（CC，2026-11-02）——不需要瀏覽器、不改遊戲。
// 需要同一個資料夾的 n56_loadall.js。輸出另存在腳本旁邊的 n5_out.md（不要 commit）。不讀任何存檔。
// 用法：node n5_fafu_farm.js <repo 根目錄>   （例：node docs/story_planning/test_tools/cc/n5_fafu_farm.js .）
// 做法：照 index.html 順序載入 src/（game3d.js 和 3D 繪圖模組除外；包含 pool_more3d.js、y2b3d.js 對 STORY.fafuShift/fafuWatch 的包裝），
//   假的 GM（記錄 say/choose/rel/money/advance），四年每一個值班週六都去（大一旁觀、大二起社員做紀錄），外加同一天重複、讀檔重來、換時間再按。
//   每一次記：所有 SOCIAL 關係 fam/trust/comf 總和、G.rel、G.stats、G.study、G.money、LEGAL 狀態、記憶數、LAWCLUB_SAT_VISITS、FAFU_SHIFT_N、careerLean。
const path=require('path'), ROOT=path.resolve(process.argv[2]||'.');
const L=require(path.join(__dirname,"n56_loadall.js"))(ROOT);
const out=[]; const log=s=>{ out.push(s); console.log(s); };
let G=null; const calls={rel:[],money:[],advance:0,activity:[],adjust:[]};
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
let picks=[];
const GM={get G(){ return G; },E,D:{active:false},npc:{},running:true,
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},syncWeekday(){},standUp(){},
  titleCard:async()=>{},enter:async z=>{ G.zone=z; },advance(h){ G.hour+=h; calls.advance+=h; },fade:()=>Promise.resolve(),walkTo:()=>Promise.resolve(true),sitAt(){},phoneThread:async()=>{},openPhone(){},
  rel(id,d){ calls.rel.push([id,d]); }, money(d){ calls.money.push(d); G.money+=d; },
  say:async()=>{}, choose:async o=>{ const w=picks.shift(); if(typeof w==='string'){ const k=o.findIndex(q=>(q.t||q.text||'').includes(w)); return k<0?0:k; } return w||0; }};
if(SOCIAL.activity){ const a=SOCIAL.activity; SOCIAL.activity=function(id,k){ calls.activity.push([id,k]); return a.apply(this,arguments); }; }
if(SOCIAL.adjust){ const a=SOCIAL.adjust; SOCIAL.adjust=function(id,d){ calls.adjust.push([id,JSON.stringify(d)]); return a.apply(this,arguments); }; }
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const snapN=()=>{ let fam=0,tr=0,cf=0,mem=0; const so=G.social||{}; for(const id in (so.rel||{})){ const r=so.rel[id]; fam+=r.fam||0; tr+=r.trust||0; cf+=r.comf||0; } for(const id in (so.mem||{})) mem+=(so.mem[id]||[]).length;
  const F=G.flags, cl=STORY.careerLean?STORY.careerLean(G):{}; const st=G.study?Object.keys(G.study.u||{}).length:0;
  return {fam,tr,cf,mem,relOld:JSON.stringify(G.rel),stats:JSON.stringify(G.stats),study:st,money:G.money,V:F.LAWCLUB_SAT_VISITS|0,N:F.FAFU_SHIFT_N|0,A:cl.A,legal:JSON.stringify(G.legal||null).length}; };
const newG=(day)=>{ G={v:2,stage:'law',day,hour:8,zone:'wancai',weekday:wdOf(day),weather:'clear',energy:100,money:20000,flags:{KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,examSeed:1,dating_kexin:false,lawclub:true,CLUB_lawclub_study:true},choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{an:6,zhe:12,sis:2,kai:8,yu:3},social:null,stats:{steps:0,classes:0,study:0},legal:null};
  SOCIAL.bind(G); EVENTS.bind(GM); if(typeof INV!=='undefined'&&INV.rec) INV.rec(G); for(const id of ['classmate_bohan','heroine_03','heroine_05']) SOCIAL.remember(id,'FIRST_MET',''); return G; };
const setDay=(d,h)=>{ G.day=d; G.hour=h; G.weekday=wdOf(d); G.zone='wancai'; };
const terms=['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'];
(async()=>{
  log('載入 '+L.loaded.length+'/'+L.files.length+' 支（失敗的只有 3D 繪圖：'+L.failed.map(f=>f[0].replace('src/','')).join('、')+'）');
  // ---- 1. 四年每一個值班週六 ----
  const t0=CALENDAR.termDays('Y1S1').from; newG(t0); const base=snapN();
  log('\n## 1. 四年每個值班週六都去（社員；大一＝旁觀、大二起＝做紀錄＋「再待到十二點」）');
  log('| 學期 | 值班週六數 | 這學期去成 | 累計 VISITS | 累計 SHIFT_N | careerLean.A | 關係 fam/trust/comf 總和（起點 '+[base.fam,base.tr,base.cf].join('/')+'） | 記憶數 | G.stats | G.study 卡數 | 金錢 | G.rel |');
  log('|---|---|---|---|---|---|---|---|---|---|---|---|');
  const perTerm={};
  for(const tid of terms){ const T=CALENDAR.termDays(tid); let n=0, ok=0;
    for(let d=T.from; d<=T.to; d++){ setDay(d,9); if(!STORY.fafuDuty(G)) continue; n++;
      const before=G.flags.LAWCLUB_SAT_VISITS|0; picks=['從頭講','再待到十二點'];
      if(STORY.fafuShiftable(G)) await STORY.fafuShift(GM); else if(STORY.fafuWatchable(G)) await STORY.fafuWatch(GM);
      if((G.flags.LAWCLUB_SAT_VISITS|0)>before) ok++; }
    const s=snapN(); perTerm[tid]=n; log('| '+tid+' | '+n+' | '+ok+' | '+s.V+' | '+s.N+' | '+s.A+' | '+[s.fam,s.tr,s.cf].join('/')+' | '+s.mem+' | '+s.stats+' | '+s.study+' | '+s.money+' | '+s.relOld+' |'); }
  log('\nGM.rel 呼叫 '+calls.rel.length+' 次、GM.money 呼叫 '+calls.money.length+' 次、SOCIAL.activity '+calls.activity.length+' 次、SOCIAL.adjust '+calls.adjust.length+' 次；時間推進合計 '+calls.advance.toFixed(2)+' 小時');
  if(calls.activity.length) log('activity：'+JSON.stringify(calls.activity.slice(0,10)));
  if(calls.adjust.length) log('adjust：'+JSON.stringify(calls.adjust.slice(0,10)));
  // ---- 2. 同一天重複 ----
  log('\n## 2. 同一個值班週六重複按');
  const rows=[];
  { const d=STORY.termDay('Y2S2',5,6); newG(d); setDay(d,9); const s0=snapN(); picks=['時候','先走']; const r1=await STORY.fafuShift(GM); const s1=snapN(); const r2=await STORY.fafuShift(GM); const r3=await STORY.fafuWatch(GM); const s2=snapN();
    rows.push(['社員（大二下）做紀錄後「先走」→ 同一天再按「坐到圓桌」、再按「在旁邊看」',r1+' / '+r2+' / '+r3,s0.V+'→'+s1.V+'→'+s2.V,s0.N+'→'+s1.N+'→'+s2.N,G.hour.toFixed(2)]);
    setDay(d,11.9); const r4=STORY.fafuShiftable(G); rows.push(['同一天換時間（11:54）再看 fafuShiftable',String(r4),'','','']); }
  { const d=STORY.termDay('Y1S2',5,6); newG(d); setDay(d,9); const s0=snapN(); const res=[]; for(let i=0;i<10;i++) res.push(await STORY.fafuWatch(GM)); const s1=snapN();
    rows.push(['大一旁觀：同一天連按「在旁邊看」10 次（每次 +30 分鐘，到 12:00 停）',res.filter(Boolean).length+' 次演出',s0.V+'→'+s1.V,s0.N+'→'+s1.N,G.hour.toFixed(2)+'；關係 '+[s0.fam,s0.tr,s0.cf].join('/')+'→'+[s1.fam,s1.tr,s1.cf].join('/')+'；stats '+s1.stats]); }
  { const d=STORY.termDay('Y3S1',7,6); newG(d); setDay(d,9); const save=JSON.parse(JSON.stringify(G)); const vs=[];
    for(let i=0;i<5;i++){ G=JSON.parse(JSON.stringify(save)); SOCIAL.bind(G); picks=['從頭講','再待到十二點']; await STORY.fafuShift(GM); vs.push(G.flags.LAWCLUB_SAT_VISITS|0); }
    rows.push(['讀檔重來：值班前的存檔讀回來、再做一次（5 輪）','每輪都演',vs.join(','),'每輪 1','（讀檔＝回到值班前，數字不累積）']); }
  { const d=STORY.termDay('Y3S1',7,6); newG(d); setDay(d,9); picks=['從頭講','再待到十二點']; await STORY.fafuShift(GM); const sv=JSON.parse(JSON.stringify(G)); G=sv; SOCIAL.bind(G); setDay(d,10); const r=await STORY.fafuShift(GM);
    rows.push(['值班後的自動存檔讀回來（同一天 10:00）再按',String(r),String(G.flags.LAWCLUB_SAT_VISITS),String(G.flags.FAFU_SHIFT_N),'LAWCLUB_SAT_LAST 存在存檔裡']); }
  { // 非值班日
    const d=STORY.termDay('Y2S1',4,6); newG(d); setDay(d,9); rows.push(['非值班週六（雙週）/考試週/國慶日：fafuShiftable',[STORY.fafuShiftable(G), (setDay(STORY.termDay('Y2S1',9,6),9),STORY.fafuShiftable(G)), (setDay(STORY.termDay('Y2S1',5,6),9),STORY.fafuShiftable(G))].join(' / '),'','','']); }
  log('| 情境 | 結果 | VISITS | SHIFT_N | 其他 |'); log('|---|---|---|---|---|'); for(const r of rows) log('| '+r.join(' | ')+' |');
  // ---- 3. 每學期上限 ----
  log('\n## 3. 每學期值班週（STORY.fafuDuty）');
  log('值班週六數：'+terms.map(t=>t+' '+perTerm[t]).join('、')+'；合計 '+terms.reduce((a,t)=>a+perTerm[t],0)+'（單週、第 3 週起、考試週與國定假日停；一天最多算一次）');
  // ---- 4. wzlines 同一天 ----
  log('\n## 4. 讀程式碼的補充（不是模擬）');
  log('- wzlines3d.js:93 陪阿德／林太太（一次性事件）：LAWCLUB_SAT_VISITS 有同一天保護；FAFU_SHIFT_N 沒有（同一天先做紀錄再演陪同＝+2），FAFU_SHIFT_N 只被讀成 >0、===1。');
  require('fs').writeFileSync(path.join(__dirname,'n5_out.md'),out.join('\n'));
})().catch(e=>{ console.error('ERR',e); process.exit(1); });
