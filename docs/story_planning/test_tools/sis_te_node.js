// BB 10-22：學姊交往版學期末飯排在哪天（Y2S1、Y3S1 避開 12/24；Y4S1 3-3 的 12/24），臺灣／美國路線（不需要瀏覽器）。用法：cd <開發分支> && node <這個檔>（L 改成那個開發分支的 tests/）
const L=require('path').resolve(process.cwd(),'tests')+'/';
require(L+'alison.js'); const H=require(L+'pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const load=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); return true; };
for(const f of ['src/data/sis_y2y3_events.js','src/sis_y2y3_3d.js','src/data/sis_b4_events.js','src/sis_b4_3d.js']) load(f);
const ID='heroine_05', K=d=>d==null?null:(d<0?d:CALENDAR.dateOf(d).key);
for(const [term,key,route,h] of [['Y2S1','2026-12-23',null,8.5],['Y3S1','2027-12-23','US',8.5],['Y3S1','2027-12-23','TW',8.5],['Y4S1','2028-12-24','TW',8.5],['Y4S1','2028-12-24','US',8.5],['Y4S1','2028-12-21','TW',8.5]]){
  const fl={met_sis:true,SIS_W1:true}; if(route){ fl.EXCHANGE_ROUTE=route; fl.EXCH_RULE=1; }
  const G=H.fresh(key,h,'dorm',fl); H.rel(ID,70,60,60); G.flags['dating_'+ID]=true; try{ ROM.start(G,ID); }catch(e){}
  const w=TERMEND.windowOf(term); const P=TERMEND.plan(G,w); const g=TERMEND.gf(ID,term);
  let a=null,b=null; try{ a=TERMEND.dinnerDay(G,w,Object.assign({},g,{h:g.h||18.5,gf:true}),ID); b=TERMEND.dinnerDay(G,w,Object.assign({},g,{h:g.h||18.5}),ID); }catch(e){ a='ERR '+e; }
  let ex=null; try{ ex=K(TERMEND.examStart(G,w)); }catch(e){}
  console.log(term, route||'-', 'now', key, '| window', K(w.from),'~',K(w.to), '| back', K(P.back), 'examStart', ex, '| gf', JSON.stringify(P.gf), '| dinner(gf)', K(a), ' dinner(不避開)', K(b), '| abroad', STORY.abroad?STORY.abroad(G):null);
}
