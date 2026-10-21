const WT=process.env.WT; const H=require(WT+'/tests/pg_harness.js');
const IDS=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan','kexin','zhe','classmate_bohan','kai','classmate_mingxuan','yu','classmate_xinci','npc_fangyt','npc_huangxh','classmate_youchen','npc_ta_chen'];
const G=H.fresh('2029-10-16',10,'campus',{EXCHANGE_ROUTE:'JP',EXCH_RULE:1,GRAD_DONE:true,GRADUATED:1,introDone:true});
for(const id of IDS) H.FRIEND(id);
const WD='日一二三四五六';
const show=(key,h)=>{ H.at(key,h); G.weekday=CALENDAR.dateOf(G.day).wd%7; const out=[];
  for(const id of IDS){ const c=CHARACTERS[id]; if(!c){ out.push(id+':無資料'); continue; } const p=STORY.presence(id,G); let e=null; try{ e=STORY.schedEnt(c,G); }catch(err){ e={err:err.message}; }
    out.push(id+'｜presence '+(p.here?'here':('不在:'+p.kind+':'+(p.away||'')))+'｜作息 '+(e?((e.zone||'(場景外)')+' '+(e.act||'')+(e.away?' '+e.away:'')+(e.note?' 〔'+String(e.note).slice(0,30)+'〕':'')):'—')+'｜tag '+SOCIAL.yearTag(id)); }
  console.log('=== '+key+'（'+WD[G.weekday]+'）'+h+':00　termAt='+STORY.termAt(G.day)+' playerYear='+SOCIAL.playerYear()); for(const l of out) console.log('  '+l); };
for(const [k,h] of (process.env.TIMES||'2029-10-16 10,2029-10-16 15,2029-10-16 19,2029-10-19 14.5,2029-10-20 10,2029-12-18 15,2029-12-20 15,2030-01-08 15').split(',').map(s=>s.split(' '))) show(k,+h);
