// DL-07 自由出行的偶遇第一批（AA_160 第 5 節、BB_144、AA_162）——不需要瀏覽器。
// 檢查：人物表 35 列（沛珊大三起的 D06 美術館、D20 烏來拿掉：AA_282 第 5 節第 1 點、AA_342 C2）和作息（characters.js 的 away 有 enc 那一筆）一致；劇情事件不讀 ENC_（R7）；
//       誰會出現（星期、時段、學期、單雙週、多熟、旗標、下雨的戶外、期末考週、今天有約、今天遇過、作息不在、經濟系那一年、前任、可昕的走向）；
//       擲一次就固定（同一天同一時段一樣、60%、前任權重一半）；到達／散步後才遇到；打招呼（聊天 +、記憶、紀錄）／不打擾（什麼都沒有）／前任（不加數值）；
//       之後在學校說一句、手機那兩則（隔天以後、一次）。
// 修改前：沒有 ENC（第 1 項就失敗）。用法：node tests/dl07_enc_unit.js
const vm=require('vm'), fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.location={search:''}; global.document={getElementById:()=>null,addEventListener(){}};
global.THREE={Vector3:function(x,y,z){this.x=x;this.y=y;this.z=z;}}; global.P3={CAST:new Proxy({},{get:(t,k)=>({name:String(k)})})};
global.CHAR={build:()=>({position:{x:0,y:0,z:0,set(){}},rotation:{y:0},userData:{}}),setExpr(){}};
let GG=null; const STAGE={}, ACTS=[];
global.SOCIAL={STAGES:['STRANGER','ACQUAINTANCE','FAMILIAR','FRIEND','CLOSE_FRIEND','POSSIBLE_ROMANTIC_INTEREST','ROMANTIC_TENSION','RELATIONSHIP'],MEMORY_LABEL:{},
  stage:id=>GG.flags['dating_'+id]?'RELATIONSHIP':(STAGE[id]||'ACQUAINTANCE'),displayName:id=>(CHARACTERS[id]&&CHARACTERS[id].name)||id,
  has:(id,tag)=>!!(GG.social.mem[id]&&GG.social.mem[id].some(m=>m.tag===tag)),remember:(id,tag)=>{ (GG.social.mem[id]||(GG.social.mem[id]=[])).push({tag,day:GG.day}); },activity:(id,k)=>{ ACTS.push(id+':'+k); return {}; }};
global.EVENTS={cond:c=>(c.flags||[]).every(f=>GG.flags[f]),npcOf:()=>null,onEnter(){},tick(){}};
for(const f of ['src/data/calendar.js','src/data/characters.js','src/data/places.js','src/story3d.js','src/outings3d.js','src/home3d.js','src/data/free_trips.js','src/freetrip3d.js','src/data/encounters.js','src/encounter3d.js'])
  vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (CALENDAR|CHARACTERS|STORY|PLACES|SOCIAL_GRAPH|UNFAMILIAR_POOL|PORTRAITS|OUT|HOME|FREE_TRIPS|TRIP|ENCOUNTERS|ENC)\s*=/mg,'global.$1='),{filename:f});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
check('1. 有 ENC（eligible、decide、check、meet、schoolLine、phoneReady），人物表 35 列（第三批 AA_271 加 6、BB_213 加 5；第二批 AA_162 第 8 節加 6、BB_150 加 5；沛珊 D06、D20 兩列拿掉，AA_282）',typeof ENC!=='undefined'&&['eligible','decide','check','meet','schoolLine','phoneReady','afterWalk','atArrive'].every(k=>typeof ENC[k]==='function')&&ENCOUNTERS.rows.length===35,String(ENCOUNTERS.rows.length));
if(fails){ console.log('FAILED '+fails); process.exit(1); }
// 1. 資料一致
{ const bad=[]; for(const r of ENCOUNTERS.rows){ if(r.kexin) continue; const e=(CHARACTERS[r.who].daily_schedule||[]).find(q=>q.enc===r.spot&&q.from===r.from&&q.to===r.to); if(!e||e.zone!==null||e.act!=='out'||e.away!==r.away||e.days.join()!==r.days.join()||(r.terms||null)&&JSON.stringify(e.terms)!==JSON.stringify(r.terms)&&!(e.terms&&r.terms==null)) bad.push(r.who+'@'+r.spot); }
  check('1. 每一列（可昕以外）在 characters.js 有同一個時段的 away（enc、星期、學期一樣）',!bad.length,bad.join(' '));
  const n={D04:0,D06:0,D12:0,D13:0}; for(const r of ENCOUNTERS.rows) n[r.spot]++; check('1. 四個景點：西門町 6、北美館 3（沛珊大三起那一列拿掉，AA_282）、大稻埕 3、淡水 2（AA_160 5-6）',n.D04===6&&n.D06===3&&n.D12===3&&n.D13===2,JSON.stringify(n));
  const memos=ENCOUNTERS.rows.map(r=>r.memo).filter(Boolean); check('1. 每個 memo 都有人物頁的字和之後的一句（沛珊 D20 那一列拿掉＝30 個，AA_282）',memos.length===30&&memos.every(m=>ENCOUNTERS.labels[m]&&ENCOUNTERS.school[m]&&ENCOUNTERS.school[m].who===ENCOUNTERS.rows.find(r=>r.memo===m).who),memos.join(' '));
  check('1. 記憶的字接進 SOCIAL.MEMORY_LABEL',SOCIAL.MEMORY_LABEL.ENC_D06_AN==='在美術館遇到她');
  const ev=fs.readFileSync(path.join(ROOT,'src/data/events.js'),'utf8'); const se=ev.slice(0,ev.indexOf('const SMALLTALK'));
  check('2. R7：劇情事件（STORY_EVENTS）不讀 ENC_',se.indexOf('ENC_')<0); }
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
const mk=(day,hour,o)=>{ const G=Object.assign({day,hour,weekday:CALENDAR.dateOf(day).wd%7,zone:'gongguan',flags:{dating_kexin:true},social:{mem:{}},courses:{},invites:[],money:5000,weather:'clear',stage:'law'},o||{}); GG=G; return G; };
const SAT=STORY.termDay('Y1S1',5,6), SUN=STORY.termDay('Y1S1',5,7), SUN6=STORY.termDay('Y1S1',6,7);
const whoAt=(G,spot)=>ENC.candidates(G,spot).map(c=>c.row.who+(c.tier.t==='acq'?'':':'+c.tier.t)).sort().join(',');
// 3. 誰會出現
{ let G=mk(SAT,19.5); check('3. 大一上第 5 週週六 19:30 西門町：芷若、子晴、阿哲、小語、可昕（交往中）',whoAt(G,'D04')==='heroine_02,heroine_04,kexin:dating,yu,zhe',whoAt(G,'D04'));
  G=mk(SAT,20.5); check('3. 20:30：小語走了（17～20）、芯慈來了（20～23）',whoAt(G,'D04')==='classmate_xinci,heroine_02,heroine_04,kexin:dating,zhe',whoAt(G,'D04'));
  STAGE.zhe='STRANGER'; G=mk(SAT,19.5); check('3. 還不認識的（阿哲 STRANGER）不出現：第一次見面只在原本的劇情事件',!/zhe/.test(whoAt(G,'D04'))); delete STAGE.zhe;
  G=mk(STORY.termDay('Y3S1',5,6),19.5); check('3. 芷若大三上（英國交換）不在西門町',!/heroine_02/.test(whoAt(G,'D04')),whoAt(G,'D04'));
  G=mk(STORY.termDay('Y1S1',16,6),19.5); check('3. 期末考週（第 16 週，16 週制）沒有人',whoAt(G,'D04')==='',whoAt(G,'D04'));
  G=mk(SUN,16.5); check('3. 單週週日 16:30 大稻埕：子晴、語彤（子晴的華山是雙週 4、10，BB_213 0544a147，不撞）',whoAt(G,'D12')==='heroine_03,heroine_04',whoAt(G,'D12'));
  G=mk(SUN6,16.5); check('3. 雙週週日：大稻埕沒有人（子晴回公館、語彤心願以前不在淡水）',whoAt(G,'D12')===''&&whoAt(G,'D13')==='kexin:dating',whoAt(G,'D12')+'|'+whoAt(G,'D13'));
  G=mk(SUN,16.5,{weather:'rain'}); check('3. 下雨：大稻埕、淡水（戶外）都沒有人',whoAt(G,'D12')===''&&whoAt(G,'D13')==='');
  G=mk(SUN6,16.5); G.flags.WISH_DONE_heroine_03=true; check('3. 語彤心願以後、還不是朋友：淡水不出現（要朋友以上）',!/heroine_03/.test(whoAt(G,'D13')));
  STAGE.heroine_03='FRIEND'; check('3. 朋友以上＋心願以後＋雙週：淡水有語彤',/heroine_03:friend/.test(whoAt(G,'D13')),whoAt(G,'D13'));
  G.flags.EX_heroine_03=true; G.flags.ROMANCE_HISTORY=[{id:'heroine_03',from:'Y1S1W1',to:'Y1S1W3',how:'apart_life'}]; check('3. 前任不出現在淡水（AA_162 第 3 節）',!/heroine_03/.test(whoAt(G,'D13'))); delete STAGE.heroine_03;
  G=mk(SUN,10.5); check('3. 週日 10:30 北美館：以安（大一）；柏翰大一不在',whoAt(G,'D06')==='heroine_01',whoAt(G,'D06'));
  G=mk(STORY.termDay('Y3S1',5,7),10.5); STAGE.classmate_bohan='FAMILIAR'; check('3. 大三上：柏翰（有點熟以上）也在',whoAt(G,'D06')==='classmate_bohan,heroine_01',whoAt(G,'D06')); delete STAGE.classmate_bohan;
  G=mk(STORY.termDay('Y3S2',5,7),10.5); check('3. 大三下以安在日本：北美館沒有她',!/heroine_01/.test(whoAt(G,'D06')),whoAt(G,'D06'));
  G=mk(STORY.termDay('Y3S1',5,7),10); STAGE.classmate_peishan='FRIEND'; check('3. 沛珊北美館：心願事件演過以前不出現',!/peishan/.test(whoAt(G,'D06')));
  G.flags.WISH_DONE_classmate_peishan=true; check('3. 心願以後也不出現：大三起她在台南、不來臺北（AA_282 第 5 節第 1 點；原本「週日早上在兒童區」那一列拿掉）',!/peishan/.test(whoAt(G,'D06')),whoAt(G,'D06')); delete STAGE.classmate_peishan;
  G=mk(SUN,10.5); G.flags.EX_heroine_01=true; G.flags.ROMANCE_HISTORY=[{id:'heroine_01',to:'Y1S1W4',how:'apart_drift'}]; check('3. 前任（以安，淡掉）：照樣出現、標前任',whoAt(G,'D06')==='heroine_01:ex');
  G=mk(SAT,19.5); G.flags.dating_kexin=false; G.flags.EX_kexin=true; G.flags.ROMANCE_HISTORY=[{id:'kexin',to:'Y1S1W4',how:'kx_c'}]; check('3. 可昕分開（走向 C）：西門町沒有她（這一列只有 B 的台詞）',!/kexin/.test(whoAt(G,'D04')));
  G=mk(SUN,17); G.flags.dating_kexin=false; G.flags.EX_kexin=true; G.flags.ROMANCE_HISTORY=[{id:'kexin',to:'Y1S1W4',how:'kx_c'}]; check('3. 走向 C：淡水有她（「好久不見。……夕陽還是一樣。」）',/kexin:ex/.test(whoAt(G,'D13')));
  G=mk(SAT,19.5); G.flags.dating_kexin=false; check('3. 沒有交往、也沒分開的可昕不出現',!/kexin/.test(whoAt(G,'D04')));
  G=mk(SAT,19.5); OUT.rec(G).push({id:'kx_tour',day:SAT,h:14,state:'planned'}); check('3. 今天和可昕有約（去政大）：偶遇表沒有她',!/kexin/.test(whoAt(G,'D04')));
  G=mk(SAT,19.5); ENC.rec(G).encMet.who.push('zhe'); check('3. 今天已經遇過阿哲：不再遇到',!/zhe/.test(whoAt(G,'D04')));
  G=mk(SAT,19.5,{stage:'econ'}); check('3. 經濟系那一年（v0）先不排',whoAt(G,'D04')==='');
  { const c=CHARACTERS.zhe, keep=c.daily_schedule; c.daily_schedule=keep.filter(e=>!e.enc); G=mk(SAT,19.5); const why=[]; ENC.candidates(G,'D04',why); check('3. 作息上沒有那一筆（例：劇情把他排在別的地方）：不出現',!/zhe/.test(whoAt(G,'D04'))&&why.includes('zhe@D04:作息不在這裡'),why.join(' ')); c.daily_schedule=keep; }
  G=mk(SAT,19.5); G.flags.afternoonDone=true; const w=STORY.whereIs({G},'zhe'); check('3. 朋友頁的位置照 away：阿哲「在西門町」',JSON.stringify(w).indexOf('在西門町')>=0,JSON.stringify(w)); }
// 4. 擲一次就固定
{ let G=mk(SAT,19.5); const a=ENC.decide(G,'D04'); G.hour=21; const b=ENC.decide(G,'D04'); check('4. 同一天同一時段（晚上）再進來：結果一樣（存在 G.daily.enc）',a===b&&!!a&&G.daily.enc[SAT+':D04:ev']===a,JSON.stringify(a));
  G.hour=15.5; const c=ENC.decide(G,'D04'); check('4. 沒有符合條件的人（下午三點半的西門町）：先不定',c===null);
  let hit=0, tot=0; for(let k=0;k<12;k++) for(let wk=1;wk<=16;wk++){ const d=STORY.termDay(['Y1S1','Y1S2','Y2S1','Y2S2'][k%4],wk,6)+0; const G2=mk(d,19.5); G2.daily={enc:{}}; const r=ENC.decide(G2,'D04'); if(r){ tot++; if(r.who) hit++; } }
  const rate=hit/tot; check('4. 有人符合條件時大約 60% 遇到（'+hit+'/'+tot+'）',tot>=40&&rate>0.45&&rate<0.75,rate.toFixed(2));
  let exN=0, n2=0; for(let s=0;s<600;s++){ const [r1,r2]=ENC.rand('x'+s); if(r1>=0.6) continue; n2++; if(r2*1.5<0.5) exN++; } check('4. 前任權重一半：兩人（一個前任）時前任約 1/3',Math.abs(exN/n2-1/3)<0.08,(exN/n2).toFixed(2)); }
// 5. 實際走一趟（TRIP → ENC）
const mkGM=(G,ans)=>{ const q=(ans||[]).slice(); const L={says:[],menus:[]}; return {G,L,sceneBegin(){},sceneEnd(){},fade:async()=>{},titleCard:async()=>{},say:async(w,t)=>{ L.says.push((w?(w.name||w)+'：':'')+t); },toast(){},advance(h){ G.hour+=h; },money(d){ G.money+=d; },autosave(){},enter:async(z)=>{ G.zone=z; },
  choose:async o=>{ L.menus.push(o.map(x=>x.t)); if(!q.length) return o.length-1; const a=q.shift(); return typeof a==='string'?o.findIndex(x=>x.t===a):a; } }; };
const findDay=(spot,h,m,o)=>{ for(let k=0;k<4;k++) for(let wk=1;wk<=16;wk++){ const t=['Y1S1','Y1S2','Y2S1','Y2S2'][k]; const wd=spot==='D04'?6:7; const d=STORY.termDay(t,wk,wd); const G=mk(d,h+0.25,o); const r=ENC.decide(G,spot); if(r&&r.who&&r.m===m&&(!o||!o.pick||o.pick(r))) return {d,r}; } return null; };
(async()=>{
  { const f=findDay('D04',18,0); if(!f){ check('5. 找得到到達時就遇到的週六',false); } else {
      const G=mk(f.d,18); ACTS.length=0; const gm=mkGM(G,[0,'打招呼','回去','回公館']); await TRIP.menu(gm); const row=ENCOUNTERS.rows.find(r=>r.who===f.r.who&&r.spot==='D04');
      check('5. 到達西門町就遇到（'+f.r.who+'）：先一句旁白（她在做什麼）',gm.L.says.includes(row.why),JSON.stringify(gm.L.says));
      check('5. 選單「打招呼」「不打擾」',gm.L.menus.some(m=>m.join()==='打招呼,不打擾'));
      const tr=ENC.tier(G,f.r.who).t, L=ENC.linesFor(row,tr); check('5. 打招呼：照關係說那兩句（'+tr+'）',L.length>0&&L.every(t=>gm.L.says.some(s=>s.endsWith('：'+t))),JSON.stringify(L));
      check('5. 打招呼＝今天第一次聊天（SOCIAL.activity chat）',ACTS.includes(f.r.who+':chat'),ACTS.join());
      check('5. 紀錄：G.daily.encLog 一筆、今天遇過、這一趟遇過',G.daily.encLog.length===1&&G.daily.encLog[0].who===f.r.who&&G.daily.encMet.who.includes(f.r.who)&&!G.trip);
      check('5. 有 memo 的第一次留一筆 ENC_ 記憶（可昕在西門町沒有）',row.memo?SOCIAL.has(f.r.who,row.memo):true,row.memo||'—');
      G.hour=19; const gm2=mkGM(G,[0,'回去','回公館']); await TRIP.menu(gm2); check('5. 同一天再去一次：同一個人不會再遇到',!gm2.L.says.includes(row.why)&&G.daily.encLog.length===1); } }
  { const f=findDay('D04',18,0,{pick:r=>r.who!=='kexin'}); const G=mk(f.d,18); ACTS.length=0; const gm=mkGM(G,[0,'不打擾','回去','回公館']); await TRIP.menu(gm);
    check('6. 不打擾：沒有台詞、沒有聊天、沒有記憶、沒有紀錄',ACTS.length===0&&(G.daily.encLog||[]).length===0&&!Object.keys(G.social.mem).length,JSON.stringify(gm.L.says)); }
  { const f=findDay('D04',18,1); if(!f) check('7. 找得到「第一次散步後」才遇到的週六',false); else { const G=mk(f.d,18); const row=ENCOUNTERS.rows.find(r=>r.who===f.r.who&&r.spot==='D04'); const gm=mkGM(G,[0]); let arrivedSays=null;
      const ans=[0,'在徒步區走走','打招呼','回去','回公館']; gm.choose=async o=>{ gm.L.menus.push(o.map(x=>x.t)); if(arrivedSays===null&&o.some(x=>x.t==='在徒步區走走')) arrivedSays=gm.L.says.slice(); const a=ans.shift(); return a==null?o.length-1:(typeof a==='string'?o.findIndex(x=>x.t===a):a); };
      await TRIP.menu(gm); check('7. 到達時沒遇到、第一次散步以後才遇到（'+f.r.who+'）',arrivedSays&&!arrivedSays.includes(row.why)&&gm.L.says.includes(row.why),JSON.stringify(gm.L.says)); } }
  // 8. 前任
  { const f=findDay('D06',10,0); const G=mk(f?f.d:SUN,10); G.flags.EX_heroine_01=true; G.flags.ROMANCE_HISTORY=[{id:'heroine_01',to:'Y1S1W4',how:'apart_drift'}]; G.hour=10.5; G.daily={enc:{}};
    const row=ENCOUNTERS.rows.find(r=>r.who==='heroine_01'&&r.spot==='D06'); ACTS.length=0; const gm=mkGM(G,['打招呼']); const r=await ENC.meet(gm,row,ENC.tier(G,'heroine_01'));
    check('8. 前任：選單「點頭」「走過去」「打招呼」',gm.L.menus[0].join()==='點頭,走過去,打招呼');
    check('8. 以安（淡掉、沒說清楚）打招呼：「……{name}。」「我十二點半要走。」',r==='ex'&&gm.L.says.includes('沈以安：……{name}。')&&gm.L.says.includes('沈以安：我十二點半要走。'),JSON.stringify(gm.L.says));
    check('8. 前任：不加任何關係數值、不留記憶、不留紀錄',ACTS.length===0&&!SOCIAL.has('heroine_01','ENC_D06_AN')&&!(G.daily.encLog||[]).length);
    const G2=mk(SUN,10.5); G2.flags.EX_heroine_01=true; G2.flags.ROMANCE_HISTORY=[{id:'heroine_01',to:'Y1S1W4',how:'apart_talk'}]; const gm2=mkGM(G2,['打招呼']); await ENC.meet(gm2,row,ENC.tier(G2,'heroine_01'));
    check('8. 沒有寫到的分開方式：點頭的旁白（BB_144 第 2 節），不另外編台詞',gm2.L.says.join()===row.why+','+ENCOUNTERS.NOD,JSON.stringify(gm2.L.says));
    const G3=mk(SUN,17); G3.flags.dating_kexin=false; G3.flags.EX_kexin=true; G3.flags.ROMANCE_HISTORY=[{id:'kexin',to:'Y1S1W4',how:'kx_b'}]; const krow=ENCOUNTERS.rows.find(r=>r.who==='kexin'&&r.spot==='D13'); const gm3=mkGM(G3,['打招呼']); await ENC.meet(gm3,krow,ENC.tier(G3,'kexin'));
    check('8. 可昕走向 B：「……今天就當沒遇到，好不好。」（AA_295）＋旁白她跟予樂走了',gm3.L.says.includes('杜可昕：……今天就當沒遇到，好不好。')&&gm3.L.says.includes('（她笑了一下，跟予樂走了。）'),JSON.stringify(gm3.L.says));
    const G4=mk(SUN,17); const gm4=mkGM(G4,['打招呼']); await ENC.meet(gm4,krow,ENC.tier(G4,'kexin'));
    check('8. 可昕交往中（淡水）：兩句＋予樂那句；留 ENC_D13_KX',gm4.L.says.includes('予樂：我們什麼都沒看到。邵鈞，走。')&&SOCIAL.has('kexin','ENC_D13_KX'),JSON.stringify(gm4.L.says)); }
  // 9. 之後在學校、手機
  { const G=mk(SUN,12,{zone:'campus'}); SOCIAL.remember('heroine_01','ENC_D06_AN'); check('9. 遇到的那一天：不說',ENC.schoolLine(G,'heroine_01')===null);
    G.day=SUN+1; G.weekday=1; const q=ENC.schoolLine(G,'heroine_01'); check('9. 隔天以後聊天：以安「上次在美術館。……你後來有看完那一區嗎？」',q&&q.lines[0]==='上次在美術館。……你後來有看完那一區嗎？');
    const said=[]; const ok=await ENC.schoolTalk({G,say:async(w,t)=>said.push(t)},{name:'沈以安'},'heroine_01'); check('9. 說過一次以後不再說',ok&&said.length===1&&ENC.schoolLine(G,'heroine_01')===null);
    SOCIAL.remember('heroine_02','ENC_D04_ZR'); G.day+=1; G.zone='campus'; check('9. 芷若那一句只在 Café 說',ENC.schoolLine(G,'heroine_02')===null&&(G.zone='cafe',!!ENC.schoolLine(G,'heroine_02')));
    SOCIAL.remember('classmate_peishan','ENC_D12_PS'); G.day+=1; check('9. 沛珊：還沒去課輔班的玩家，說「我送給鄰居的小孩了」',ENC.schoolLine(G,'classmate_peishan').lines[0]==='上次那本繪本，我送給鄰居的小孩了。');
    SOCIAL.remember('classmate_peishan','SAW_HER_TEACH'); check('9. 看過她教課（SAW_HER_TEACH）：「課輔班的小孩很喜歡」',ENC.schoolLine(G,'classmate_peishan').lines[0]==='上次你選的那本繪本，課輔班的小孩很喜歡。');
    const d0=G.day; SOCIAL.remember('heroine_03','ENC_D12_YT'); check('9. 語彤的照片：遇到的那天不傳',!ENC.phoneReady(G,'ENC_D12_YT')); G.day=d0+1; check('9. 隔天以後可以傳；傳了一次就不再傳',ENC.phoneReady(G,'ENC_D12_YT')&&(ENC.markSaid(G,'ENC_D12_YT'),!ENC.phoneReady(G,'ENC_D12_YT')));
    check('9. 語彤不是聊天時說（是手機）',ENC.schoolLine(G,'heroine_03')===null);
    const st=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'); check('9. story3d：聊天在閒聊階梯之前先問 ENC.schoolTalk；手機小事有 enc_yt_photo、enc_kx_d13',/ENC\.schoolTalk\(GM,who,id\)\)\{\}[^\n]*\n\s*else if\(await S\.ladderTalk/.test(st)&&/enc_yt_photo/.test(st)&&/enc_kx_d13/.test(st));
    const ih=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'); check('9. index.html：encounters.js、encounter3d.js 在 social3d 之後、story3d 之前',ih.indexOf('src/social3d.js')<ih.indexOf('src/encounter3d.js')&&ih.indexOf('src/data/encounters.js')<ih.indexOf('src/encounter3d.js')&&ih.indexOf('src/encounter3d.js')<ih.indexOf('src/story3d.js')); }
  { const sat=STORY.dayOfKey('2026-07-11'); let G=mk(sat,19.5); check('AA_278 2-2. 暑假（可昕在高雄）週六 19:30 西門町：沒有可昕',!/kexin/.test(whoAt(G,'D04')),whoAt(G,'D04')); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
