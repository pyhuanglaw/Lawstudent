/* CC-C 11-04（BB-C 23:14：可昕「沒測到」）：法律系四年（2025-08-29～2029-06-30）每天 07:00～23:30 每 30 分鐘問 STORY.whereIs，列出某個人在 3D 裡出現的區域／活動（陌生、朋友、交往三種關係）。用法：LW_ROOT=<checkout> [WHO=kexin] node cc_who_3d_scan.js */
const path=require('path'),fs=require('fs'),vm=require('vm'); const ROOT=process.env.LW_ROOT; require(path.join(ROOT,'tests','alison.js')); const H=require(path.join(ROOT,'tests','pg_harness.js'));
global.Z3={ZONES:{}}; global.CG_REGISTRY={}; global.ZRUK={W_FROM:'2028-09-01',playW:async()=>'orig'};
const PGF=new Set(['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js','src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/data/syllabus.js','src/data/exam_bank.js','src/data/legal_qbank.js','src/classes3d.js','src/data/postgrad_lines.js','src/postgrad3d.js']);
const SK=new Set(['src/character3d.js','src/engine3d.js','src/townkit3d.js','src/zones3d.js','src/bike3d.js','src/adv3d.js']);
const O=[...fs.readFileSync(path.join(ROOT,'index.html'),'utf8').matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>f.startsWith('src/'));
for(const f of O.filter(f=>!PGF.has(f)&&!SK.has(f))){ try{ let s=fs.readFileSync(path.join(ROOT,f),'utf8'); s=s.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); }catch(e){} }
const {GM}=H, K=d=>CALENDAR.dateOf(d).key, DK=k=>STORY.dayOfKey(k);
const res={}; const WHO=process.env.WHO||'kexin';
for(const [label,setup] of [['陌生',()=>{}],['朋友',()=>{ H.FRIEND(WHO); }],['交往',()=>{ H.CLOSE(WHO); ROM.start(H.G,WHO); H.G.flags['dating_'+WHO]=true; }]]){
  H.fresh('2025-09-01',9,'dorm',{}); H.G.stage='law'; setup(); const hits={}; let n=0, err=null;
  for(let d=DK('2025-08-29'); d<=DK('2029-06-30'); d++){ for(let h=7; h<=23.5; h+=0.5){ H.G.day=d; H.G.hour=h; H.G.weekday=CALENDAR.dateOf(d).wd%7; let w=null; try{ w=STORY.whereIs(GM,WHO); }catch(e){ err=String(e).slice(0,120); }
      if(w&&w.zone&&!w.away){ const k=w.zone+'｜'+(w.act||''); (hits[k]||(hits[k]=[])).push(K(d)+' '+h); n++; } } }
  res[label]={n, err, zones:Object.fromEntries(Object.entries(hits).map(([k,v])=>[k,[v.length,v.slice(0,4)]]))};
}
console.log(JSON.stringify(Object.fromEntries(Object.entries(res).map(([k,v])=>[k,{n:v.n,err:v.err,zones:Object.fromEntries(Object.entries(v.zones).slice(0,12))}])),null,1));
