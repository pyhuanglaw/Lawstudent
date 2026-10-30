// BB-B 10-25：找「CG 是最後一個畫面步驟」的事件（events3d.js 的 CG 步驟不等點擊；ADV.cg 的圖載完才設 'on image cg'，事件已經結束＝那一層留在畫面上）
const path=require('path'), fs=require('fs'), vm=require('vm');
const ROOT=process.argv[2]; process.chdir(ROOT);
const H=require(path.join(ROOT,'tests/pg_harness.js'));
const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
const files=[...html.matchAll(/<script src="(src\/[^"?]+)/g)].map(m=>m[1]);
const loaded=new Set(['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js','src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/data/syllabus.js','src/data/exam_bank.js','src/data/legal_qbank.js','src/classes3d.js','src/data/postgrad_lines.js','src/postgrad3d.js']);
let err=0;
for(const f of files){ if(loaded.has(f)) continue; try{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>'globalThis.'+n+'='); vm.runInThisContext(src,{filename:f}); }catch(e){ err++; } }
const isShow=s=>s&&typeof s==='object'&&(s.text!==undefined||s.choice!==undefined||s.say!==undefined);
const out=[];
for(const e of STORY_EVENTS){ const D=e.dialogue; if(!Array.isArray(D)) continue;
  let lastShow=-1; D.forEach((s,i)=>{ if(isShow(s)) lastShow=i; });
  D.forEach((s,i)=>{ if(s&&typeof s==='object'&&s.cg!==undefined&&s.text===undefined&&i>lastShow) out.push(e.id+'｜'+s.cg+'｜CG 在第 '+i+' 步、最後一句在第 '+lastShow+' 步｜後面：'+JSON.stringify(D.slice(i+1)).slice(0,120)); }); }
console.log('事件 '+STORY_EVENTS.length+' 個（載入失敗的檔 '+err+' 個）；CG 在最後一句之後：'+out.length);
for(const x of out) console.log(' - '+x);
