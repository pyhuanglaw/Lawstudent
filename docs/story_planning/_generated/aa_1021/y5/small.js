const fs=require('fs'),vm=require('vm');const R=process.argv[2];
const ctx={console};vm.createContext(ctx);
const src=fs.readFileSync(R+'/src/data/events.js','utf8');
try{ vm.runInContext(src+'\n;this.SMALLTALK=SMALLTALK;',ctx);}catch(e){console.log('ERR',e.message);}
const S=ctx.SMALLTALK||{};
for(const id of process.argv.slice(3)){ const L=S[id]||[]; console.log('=== '+id+' total '+L.length);
  L.forEach((e,i)=>{ if(typeof e==='string') console.log('  [無條件]',e); else if(!e.term&&!e.week&&!e.midterm) console.log('  [無學期條件]',JSON.stringify(e).slice(0,220)); }); }
