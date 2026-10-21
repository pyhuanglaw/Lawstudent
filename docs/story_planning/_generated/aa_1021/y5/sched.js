const fs=require('fs'),vm=require('vm');const R=process.argv[2];
const ctx={console};vm.createContext(ctx);
for(const f of ['src/data/calendar.js','src/data/characters.js']) vm.runInContext(fs.readFileSync(R+'/'+f,'utf8')+'\n;this.CALENDAR=typeof CALENDAR!=="undefined"?CALENDAR:undefined;this.CHARACTERS=typeof CHARACTERS!=="undefined"?CHARACTERS:undefined;',ctx);
const C=ctx.CHARACTERS;
const ids=process.argv.slice(3);
for(const id of ids){ const c=C[id]; if(!c){console.log('NO',id);continue;}
  console.log('=== '+id+' '+(c.name||''));
  console.log(' presence:',JSON.stringify(c.presence));
  console.log(' partner:',JSON.stringify(c.partner||null));
  const L=c.daily_schedule||[];
  L.forEach((e,i)=>{ const noT=!e.terms; const blocked=(e.act==='class'||e.noHoliday||e.weeks);
    let datesHit=null; if(e.dates){ datesHit=e.dates.some(([a,b])=>a<='2029-12-23'&&b>='2029-09-03'); }
    if(noT&&!blocked&&(e.dates?datesHit:true)) console.log('  [Y5可能]',i,JSON.stringify({days:e.days,from:e.from,to:e.to,zone:e.zone,act:e.act,away:e.away,dates:e.dates,if:e.if,taipei:e.taipei,vacation:e.vacation,activity:e.activity,note:(e.note||'').slice(0,80)}));
  });
  console.log(' schedule total',L.length,' terms-only',L.filter(e=>e.terms).length);
}
