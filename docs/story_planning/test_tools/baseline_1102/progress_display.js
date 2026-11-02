require('/tmp/claude-0/-home-user-Lawstudent/a08a2075-8dd6-5be2-9e44-b63f69067248/scratchpad/lw/tests/alison.js');
const H=require('/tmp/claude-0/-home-user-Lawstudent/a08a2075-8dd6-5be2-9e44-b63f69067248/scratchpad/lw/tests/pg_harness.js');
// 期末考週前一天（大一上第 15 週）都沒上課、都沒讀過：要讀幾小時（幾段自習）才能把這學期考五題的課的筆記讀完
let d0=null; for(let d=0;d<400;d++){ const t=CALENDAR.termOf(d); if(t&&t.id==='Y1S1'&&t.week===15){ d0=d; break; } }
const G=H.fresh('2025-09-01',9,'library'); G.day=d0; G.notes=[];
const has=id=>G.notes.some(n=>n.id===id);
const cs=CLS.termCourses(G,'Y1S1').filter(c=>CLS.isExamCourse(c));
let total=0; const per={};
for(const c of cs){ let n=0; for(;;){ const st=CLS.studyTopic(G,c,has); if(!st) break; G.notes.push({id:st.id,title:st.title,body:st.body,day:G.day}); n++; } per[c.id]=n; total+=n; }
console.log('大一上第 15 週、考五題的課：',cs.map(c=>c.id).join(','));
console.log('每門課自習筆記數（一小時一份）：',JSON.stringify(per),'合計',total,'小時；一段最多 3 小時、一天平時 3 段（考試週 6 段）→ 至少',Math.ceil(total/3),'段');
console.log('筆記樣本：',JSON.stringify(G.notes.slice(0,3)));
// 法律頁（CLS.legalCourses）只看 R.done（上過的課）：讀了這些筆記以後
console.log('自習筆記',G.notes.length,'份以後，法律頁列出的課數：',CLS.legalCourses(G).length);
// 上過一堂民總第 3 週（模擬 R.done）
let dW3=null; for(let d=0;d<400;d++){ const t=CALENDAR.termOf(d); if(t&&t.id==='Y1S1'&&t.week===3&&CALENDAR.dateOf(d).wd===CLS.byId('civ_general').slots[0].wd){ dW3=d; break; } }
CLS.rec(G).done[dW3+':civ_general:'+CLS.byId('civ_general').slots[0].block]=1;
const LC=CLS.legalCourses(G); console.log('上過一堂以後法律頁：',JSON.stringify(LC.map(e=>({c:e.c.id,topics:e.topics.length}))));
// studyUntil（讀到上課前）只加 prep，不加筆記：看程式（classes3d.js:1073）
process.exit(0);
