const WT=process.argv[2]; const H=require(WT+'/tests/pg_harness.js');
const m=EXAM_BANK.courseMap; const ids=Object.keys(m).filter(k=>m[k].exam==='mc5');
const kinds={}; for(const id of ids){ const c=COURSES.list.find(x=>x.id===id); const k=c?c.kind:'(none)'; (kinds[k]=kinds[k]||[]).push(id+(c?'@'+c.term:'')); }
console.log(JSON.stringify(kinds,null,0));
