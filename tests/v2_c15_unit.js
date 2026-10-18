// v2 C15：演講後回到課堂（交接包 v2 C15；AA-B 2026-10-16：要匯入）＋AA_140 G07（聽過 B4 演講記 B4_ATTENDED）——不需要瀏覽器。
// 大一下憲法二第 12 週（憲法訴訟）：教授那一句之後，聽過 B4 演講的玩家多一句旁白「那場演講最後，講者問……」；沒去的沒有。
// 修改前（import_syllabus.py 沒留 recall、content 沒帶 recall）：第 1、3 項失敗。用法：node tests/v2_c15_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|CALENDAR|PLACES|COURSES|SYLLABUS|CLS|INV|ACTIVITIES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/characters.js','src/data/calendar.js','src/data/places.js','src/data/courses.js','src/data/syllabus.js','src/data/activities.js','src/invites3d.js','src/classes3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.SOCIAL={has:()=>false,displayName:id=>(CHARACTERS[id]||{}).name||id};
const said=[]; let G;
const GM={get G(){ return G; },E:{zone:null,interactables:[],player:{busy:false,obj:{position:{x:0,z:0}}}},D:{active:false},S:{},npc:{},
  sceneBegin(){},sceneEnd(){},say:async(n,t)=>{ said.push(t); },toast(){},caption(){},autosave(){},setGoal(){},enter:async()=>{},
  choose:async()=>0,fade:async()=>{},sleep:async()=>{},advance(h){ G.hour+=h; },energy(){},money(){}};
const fresh=()=>{ G={day:1,hour:8,weekday:3,zone:'campus',flags:{},energy:80,goal:'',goalDest:null,msgs:[],courses:{}}; return G; };
const itemOf=(term,week,cid)=>{ for(let d=1;d<1700;d++){ const t=CALENDAR.termOf(d); if(!t||t.id!==term||t.week!==week) continue; const it=CLS.dayItems(G,d).find(q=>q.c.id===cid); if(it) return it; } return null; };
const W=SYLLABUS.courses.const_2&&SYLLABUS.courses.const_2.find(q=>q.w===12);
const REC='演講最後，講者問：『被限制的人，最後可以去哪裡？』今天的黑板寫著一部分答案。';   // 口語審改字（AA 7abe189a，_generated/README）；原本交接包_v2 L199「那場演講最後，講者問：『被限制的那個人……』今天的黑板寫著答案的一部分。」
check('1. 憲法二第 12 週有回想（activity B4、在教授那一句之後）；那一週法律審查通過',!!W&&Array.isArray(W.recall)&&W.recall[0].activity==='B4'&&W.recall[0].full===true&&W.recall[0].say===REC&&SYLLABUS.reviewed.includes('const_2|12'),JSON.stringify(W&&W.recall));
(async()=>{
  fresh(); const it=itemOf('Y1S2',12,'const_2');
  check('2. 找得到大一下第 12 週的憲法二',!!it);
  if(it){
    // 沒去 B4
    G.day=it.day; G.hour=it.t0; said.length=0; await CLS.attend(GM,it,{door:true});
    check('3a. 沒聽 B4：沒有回想那一句',!said.some(t=>t===REC),said.slice(0,3).join('｜'));
    // 去過 B4（照 activities 的 B4：大一下第 11 週週四 19:00）
    fresh(); const it2=itemOf('Y1S2',12,'const_2');
    let b4day=null; for(let d=1;d<1700;d++){ const t=CALENDAR.termOf(d); if(t&&t.id==='Y1S2'&&t.week===11){ b4day=d; break; } }   /* 第 11 週那一週去過（attendedAny 只看有沒有到場紀錄）*/
    G.day=b4day; G.hour=19; ACTIVITIES.markAttended(G,{id:'B4'}); G.flags.B4_ATTENDED=true;
    G.day=it2.day; G.hour=it2.t0; said.length=0; await CLS.attend(GM,it2,{door:true});
    const iLine=said.findIndex(t=>t.includes(W.line)), iRec=said.indexOf(REC);
    check('3b. 聽過 B4：教授那一句之後多一句回想（在同學反應之前）',iLine>=0&&iRec===iLine+1,said.slice(0,4).join('｜'));
    // 中途離開 B4（交接包_v2 L200：中途離開、沒去的玩家沒有這一句；AA-B 10-16 full:true）
    fresh(); const it3=itemOf('Y1S2',12,'const_2'); G.day=b4day; G.hour=19; ACTIVITIES.rec(G).att['B4@'+b4day]={h:19,end:'left',lh:19.5};
    G.day=it3.day; G.hour=it3.t0; said.length=0; await CLS.attend(GM,it3,{door:true});
    check('3c. 中途離開 B4：沒有回想那一句（要聽完，full:true）',!said.some(t=>t===REC),said.slice(0,3).join('｜'));
  }
  // G07：attendActivity 記 B4_ATTENDED
  const src=fs.readFileSync(path.join(ROOT,'src/classes3d.js'),'utf8');
  check('4. 聽演講（attendActivity）B4：記 B4_ATTENDED（AA_140 G07）',/a\.id==='B4'&&G\.flags\)\s*G\.flags\.B4_ATTENDED=true/.test(src));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})();
