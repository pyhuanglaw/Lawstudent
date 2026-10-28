// 2026-10-14 課程調整（使用者 16:15，企劃分支 AA_130；AA 轉達）——不需要瀏覽器。AA_130 第 6 節第 1、2、3、8、9 項：
//   1. 現行課表沒有 7 門刪掉的課（任何學期的課表、手機課表、成績單）；
//   2. 法學英文在大二下週四上午、大四下沒有；大二下沒有撞堂；
//   3. 大一下開學照樣播選課結果（通識那兩句）、沒有「要不要修」；大三下沒有選課（勞動法固定）；
//   8. 舊存檔（有法律與社會的出席與成績、選過公平交易法、在大四下上過法學英文）讀得進來：刪掉的課消失、其他進度不變（idv 3）；
//   9. 黃教授（週五）、陳教授（週四）13:20～15:10 在霖澤館大廳；陳教授的閒聊換新句子、黃教授那句沒有課程條件。
// 修改前：第 1 項就失敗（7 門課都還在）。用法：node tests/aa130_curriculum_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.THREE={Vector3:function(x,y,z){this.x=x;this.y=y;this.z=z;}};
global.P3={CAST:new Proxy({},{get:(t,k)=>({name:String(k)})})};
const mkObj=()=>({position:{x:0,y:0,z:0,set(x,y,z){this.x=x;this.y=y;this.z=z;}},rotation:{y:0},userData:{}});
global.CHAR={build:()=>mkObj(),setExpr(){}}; global.location={search:''};
global.SOCIAL={displayName:id=>(CHARACTERS[id]&&CHARACTERS[id].name)||id,stage:()=>'ACQ',noticed(){},reveal:()=>'ACQUAINTANCE',has:()=>true};
let GMx=null; global.EVENTS={npcOf:id=>GMx&&GMx.npc[id]||null,onEnter(){},tick(){}};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|CALENDAR|PLACES|COURSES|CLS|STORY|SYLLABUS|SMALLTALK|STORY_EVENTS|STORY_EVENTS_V11|LINZE_LAYOUT)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/characters.js','src/data/calendar.js','src/data/places.js','src/data/courses.js','src/data/syllabus.js','src/data/linze_layout.js','src/classes3d.js','src/story3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
const mkG=(day,hour)=>({day,hour,flags:{},weekday:CALENDAR.dateOf(day).wd%7,zone:'dorm'});
const DEL=['law_society','law_society_2','juris','intl_public','legal_history','fair_trade','conflict_laws'];
const DELN=['法律與社會','法律與社會（下）','法理學','國際公法','法律史','公平交易法','國際私法'];
const TERMS=['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'];
function mkGM(G,picks){ const log=[]; let k=0;
  return {G,log,D:{active:false},E:{player:{busy:false}},sceneBegin(){},sceneEnd(){},say:async(n,t)=>{ log.push('say:'+t); },toast:t=>log.push('toast:'+t),
    choose:async o=>{ log.push('choose:'+o.map(q=>q.t).join(' / ')); const i=(picks||[])[k++]; return i==null?0:i; },
    fade:async()=>{},advance(hh){ G.hour+=hh; },sleep:async()=>{},caption:(w,t)=>log.push('caption:'+t),autosave(){},setGoal(){} }; }
(async()=>{
  // 1. 課表、手機課表、成績單都沒有刪掉的 7 門
  { const inData=COURSES.list.filter(c=>DEL.includes(c.id)).map(c=>c.id);
    const G=mkG(dayOf('2026-03-03'),8); const anyTerm=TERMS.filter(t=>CLS.termCourses(G,t).some(c=>DEL.includes(c.id)));
    check('1. 課程資料與八學期的課表都沒有刪掉的 7 門課',!inData.length&&!anyTerm.length,JSON.stringify({inData,anyTerm}));
    const weeks=['2025-09-29','2026-03-02','2026-09-21','2027-02-22','2027-09-20','2028-02-21','2028-09-04','2029-02-26'].map(d=>{ const g=mkG(dayOf(d),8); return CLS.weekHTML(g); }).join('');
    check('1. 手機課表（八個學期各一週）沒有這 7 門課的名字',!DELN.some(n=>new RegExp('>'+n.replace(/[（）]/g,'.')+'<|'+n+'｜').test(weeks)),DELN.filter(n=>weeks.includes(n)).join('、'));
    const GM=mkGM(mkG(dayOf('2026-02-09'),8)); GM.G.courses={}; const lines=[]; GM.say=async(n,t)=>lines.push(t); await CLS.showGrades(GM,'Y1S1');
    check('1. 大一上的成績單沒有法律與社會',lines.length>0&&!lines.join('\n').includes('法律與社會'),lines.join(' / ')); }
  // 2. 法學英文：大二下週四上午；大四下沒有；大二下沒有撞堂
  { const le=COURSES.list.find(c=>c.id==='legal_english');
    check('2. 法學英文／英美法在大二下、週四上午（同一個時段）；大四下沒有',!!le&&le.term==='Y2S2'&&JSON.stringify(le.slots)==='[{"wd":4,"block":"am"}]'&&!COURSES.list.some(c=>c.term==='Y4S2'&&c.id==='legal_english'),JSON.stringify(le));
    const G=mkG(dayOf('2027-03-04'),8); const cs=CLS.termCourses(G,'Y2S2'); const seen={}, clash=[];
    for(const c of cs) for(const s of c.slots){ const k=s.wd+s.block; if(seen[k]) clash.push(seen[k]+'／'+c.id+'@'+k); seen[k]=c.id; }
    check('2. 大二下沒有撞堂（每個時段最多一門）',!clash.length,clash.join('、'));
    const items=CLS.dayItems(G).map(it=>CLS.hhmm(it.t0)+' '+it.c.name);
    check('2. 大二下的週四上午（2027-03-04）有法學英文／英美法',items.some(t=>/^09:10 法學英文/.test(t)),items.join('、'));
    const wk=(SYLLABUS.courses.legal_english||[]); check('2. syllabus 的法學英文是大二下的版本（BB 3ae2200 重新匯入：第 15 週「你們還有兩年。」）',wk.length>0&&JSON.stringify(wk).includes('你們還有兩年'),SYLLABUS.source); }
  // 3. 大一下照播選課結果、沒有選項；大三下沒有選課
  { const G=mkG(dayOf('2026-02-22'),7.5), GM=mkGM(G); await CLS.morning(GM);
    check('3. 大一下開學前一天：播「選課結果出來了：大一下。」和通識兩句，沒有任何選項',GM.log.includes('say:選課結果出來了：大一下。')&&GM.log.some(t=>t==='say:選上的是「天文與我們」。')&&!GM.log.some(t=>t.startsWith('choose:')),GM.log.join(' | '));
    const G3=mkG(dayOf('2028-02-20'),7.5), GM3=mkGM(G3); await CLS.morning(GM3);
    check('3. 大三下：沒有選課、勞動法固定在課表',!GM3.log.some(t=>t.startsWith('choose:'))&&CLS.termCourses(G3,'Y3S2').some(c=>c.id==='labor_law'),GM3.log.join(' | ')); }
  // 8. 舊存檔
  { const D=dayOf('2029-03-15'); const G=mkG(D,10);   /* 存檔在大四下、上過法學英文 */
    G.courses={idv:2,done:{'12:law_society:pm1':1,'20:civ_general:pm1':1,'300:fair_trade:am':1,'1270:legal_english:am':1},attend:{law_society:5,civ_general:9,fair_trade:3,legal_english:2},prep:{law_society:4,juris:2,civ_general:6},
      grades:{Y1S1:{law_society:'很好',civ_general:'不錯'},Y2S1:{juris:'過了',property:'很好'}},electives:{Y1S2_ls:'law_society_2',Y3S2_elec:'fair_trade',Y4S1_elec:'tax_law'},
      note:{'rem_12:law_society:pm1':1,'skip_13:law_society:pm1':1,'skipn_law_society_Y1S1':2,'rem_20:civ_general:pm1':1,sel_Y1S2:1},disc:{B_Y2S1_juris_w2:1,B_Y4S2_legal_english_w4:2,B_Y1S1_const_1_w11:1}};
    const before=JSON.stringify(G.flags);
    let err=null, R=null; try{ R=CLS.rec(G); }catch(e){ err=e; }
    const left=JSON.stringify(R||{}); const leftover=DEL.filter(id=>left.includes(id));
    check('8. 讀得進來（idv 3），刪掉的課的出席、準備、成績、上課紀錄、提醒、翹課、討論紀錄都消失',!err&&R.idv===3&&!leftover.length,err?String(err):'殘留：'+leftover.join('、'));
    check('8. 其他進度不變：民法總則的出席、準備、成績、上課紀錄、提醒照舊；大四上選的財稅法照舊',R.attend.civ_general===9&&R.prep.civ_general===6&&R.grades.Y1S1.civ_general==='不錯'&&R.grades.Y2S1.property==='很好'&&R.done['20:civ_general:pm1']===1&&R.note['rem_20:civ_general:pm1']===1&&R.electives.Y4S1_elec==='tax_law',JSON.stringify(R).slice(0,400));
    check('8. 選修群組 Y1S2_ls、Y3S2_elec 刪掉（選過公平交易法的人，大三下照勞動法）',R.electives.Y1S2_ls===undefined&&R.electives.Y3S2_elec===undefined&&CLS.termCourses(G,'Y3S2').some(c=>c.id==='labor_law'));
    check('8. 法學英文的討論紀錄 B_Y4S2_legal_english_w4 → B_Y2S2_legal_english_w4；其他課的討論紀錄不動',R.disc.B_Y2S2_legal_english_w4===2&&R.disc.B_Y4S2_legal_english_w4===undefined&&R.disc.B_Y1S1_const_1_w11===1&&R.disc.B_Y2S1_juris_w2===undefined,JSON.stringify(R.disc));
    check('8. 劇情旗標沒有被動到',JSON.stringify(G.flags)===before);
    const lines=[]; const GM=mkGM(G); GM.say=async(n,t)=>lines.push(t); await CLS.showGrades(GM,'Y4S2');
    check('8. 大四下已經上過法學英文：大四下的成績單照「已修」',lines.join('　').includes('法學英文／英美法：已修'),lines.join(' / '));
    const G2=mkG(dayOf('2028-03-15'),10); G2.courses={idv:2,attend:{civ_general:3}}; const R2=CLS.rec(G2); const l2=[]; const GM2=mkGM(G2); GM2.say=async(n,t)=>l2.push(t); await CLS.showGrades(GM2,'Y2S2');
    check('8. 存檔已經過了大二下（大三下）、沒上過法學英文：不補修，大二下的成績單寫「未修（2026-10-14 課程調整）」',R2.idv===3&&l2.join('　').includes('法學英文／英美法：未修（2026-10-14 課程調整）'),l2.join(' / '));
    const G3=mkG(dayOf('2026-10-01'),10); G3.courses={idv:2,attend:{civ_general:3}}; const R3=CLS.rec(G3);
    check('8. 存檔在大二下以前（大二上）：照新課表在大二下修（沒有「未修」的標記）',R3.idv===3&&!R3.leMoved&&CLS.termCourses(G3,'Y2S2').some(c=>c.id==='legal_english'));
    const back=JSON.parse(JSON.stringify(G)); const R4=CLS.rec(back); check('8. 再讀一次（JSON 來回）不會再遷移、資料一樣',R4.idv===3&&JSON.stringify(R4)===JSON.stringify(R)); }
  // 9. 黃教授、陳教授在霖澤館大廳
  { const hu=CHARACTERS.prof_huang, ch=CHARACTERS.prof_chen;
    check('9. 人物資料：黃教授週五、陳教授週四 13:20～15:10，在霖澤館大廳（lobby）；課程寫「目前沒有開課」',hu.lobby==='linze'&&hu.weekday===5&&ch.lobby==='linze'&&ch.weekday===4&&JSON.stringify(hu.time)===JSON.stringify([13.33,15.17])&&JSON.stringify(ch.time)===JSON.stringify([13.33,15.17])&&hu.course==='目前沒有開課'&&ch.course==='目前沒有開課');
    const spawned=(day,hour)=>{ const G=Object.assign(mkG(day,hour),{zone:'linze',social:{},goal:''}); const E={npcs:[],q:{level:'high'},zone:{seats:[],spawn:{x:6.6,z:4,lv:0}},levels:null,nav:null,indoor:true,player:{obj:{position:{x:6.6,y:0,z:4},rotation:{y:0}},busy:false,lv:0},addNPC(n){this.npcs.push(n);return n;},canStand:()=>true};
      const gm={E,G,npc:{},extras:[],D:{active:false}}; GMx=gm;
      gm.spawnCharacter=(id,x,z,o)=>{ const ob=mkObj(); ob.position.set(x,0,z); const n={obj:ob,id,charId:id,beh:'idle',pose:(o||{}).pose}; E.npcs.push(n); gm.npc[id]=n; return n; };
      gm.spawnNPC=(id,spec,x,z,o)=>gm.spawnCharacter(id,x,z,o); gm.removeNPC=id=>{ delete gm.npc[id]; }; gm.spawnExtra=()=>{}; gm.spawnRider=()=>{}; gm.knownIds=()=>[];
      STORY.populate('linze',gm); return Object.keys(gm.npc).filter(k=>k==='prof_huang'||k==='prof_chen'); };
    const FRI=dayOf('2025-10-17'), THU=dayOf('2025-10-16'), SAT=dayOf('2025-10-18');   /* 10/10 是國慶日（國定假日不在）*/
    check('9. 週五 14:00（上課期間）在霖澤館：看得到黃教授',JSON.stringify(spawned(FRI,14))==='["prof_huang"]',JSON.stringify(spawned(FRI,14)));
    check('9. 週四 14:00：看得到陳教授',JSON.stringify(spawned(THU,14))==='["prof_chen"]',JSON.stringify(spawned(THU,14)));
    check('9. 時段外（週五 16:00、週六 14:00）都不在',!spawned(FRI,16).length&&!spawned(SAT,14).length);
    const hol=(()=>{ for(let d=dayOf('2025-09-29');d<dayOf('2026-01-20');d++){ if(CALENDAR.holiday(d)&&CALENDAR.dateOf(d).wd===5) return d; } return null; })();
    check('9. 國定假日的週五不在',hol==null||!spawned(hol,14).length,String(hol)); }
  { const src=fs.readFileSync(path.join(ROOT,'src/data/events.js'),'utf8');
    check('9. 陳教授的閒聊換成「國際法的新聞，每天都有。有興趣可以來研究室聊。」；舊的 seminar 那句沒有了',src.includes("prof_chen:['「國際法的新聞，每天都有。有興趣可以來研究室聊。」']")&&!src.includes('國際法的 seminar 隨時歡迎旁聽'));
    check('9. 黃教授那句沒有課程條件（不再要修過法律與社會）',src.includes("prof_huang:['「最近在重讀《正義：一場思辨之旅》。每讀一次，我就換一邊站。」']")&&!/law_society/.test(src)); }
  { const m=CHARACTERS.classmate_mingxuan, p=CHARACTERS.classmate_peishan;
    check('人物資料：明軒 favorite_subjects 英美法、沛珊 憲法（BB 定，AA_130 第 2 節第 15 列）',JSON.stringify(m.favorite_subjects)==='["英美法"]'&&JSON.stringify(p.favorite_subjects)==='["憲法"]'); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
