const fs=require('fs'),vm=require('vm'),path=require('path'); const W=process.argv[2], J=process.argv[3];
vm.runInThisContext(fs.readFileSync(path.join(W,'src/door3d.js'),'utf8').replace(/^const DOOR\s*=/m,'global.DOOR='));
const d=JSON.parse(fs.readFileSync(J,'utf8')); const E={};
for(const [z,l] of Object.entries(d)){ if(!Array.isArray(l)) continue; for(const q of l){ const k=DOOR.kind({label:q.label,exit:{to:q.to,door:q.door}},z)||'none'; E[z+'>'+q.to]=(E[z+'>'+q.to]||[]).concat([[q.label,k,q.kind||'none']]); } }
const out=[]; for(const [key,v] of Object.entries(E)){ const [a,b]=key.split('>'); for(const [lb,k,old] of v){ const back=E[b+'>'+a]; const bk=back?back.map(x=>x[1]).join('/'):'-'; const asym=back&&back.some(x=>(x[1]==='push')!==(k==='push'))?'  ←不對稱':''; out.push(`${a.padEnd(16)} ${lb.slice(0,22).padEnd(24)} →${b.padEnd(16)} ${String(old).padEnd(5)}→ ${k.padEnd(5)} 回程 ${bk}${asym}${old!==k?'  ★改':''}`); } }
console.log(out.join('\n'));
