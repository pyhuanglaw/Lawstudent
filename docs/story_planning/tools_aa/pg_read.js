// AA-B 2026-10-25：畢業以後篇（含大五上）像玩家一樣「跳到下一件事」跑一遍，記下每一場的台詞、每一則訊息、日期卡。
// 用法：LW=<開發分支工作樹> P=<profile> node pg_read.js out.txt
'use strict';
const fs=require('fs'), vm=require('vm'), path=require('path');
const LW=process.env.LW; const H=require(path.join(LW,'tests','pg_harness.js')); const ROOT=H.ROOT; const GM=H.GM; GM.spawnCharacter=()=>null;
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
const HAVE=new Set(fs.readFileSync(path.join(LW,'tests','pg_harness.js'),'utf8').match(/src\/[^']+\.js/g));
const SKIP=/(people3d|assets3d|character3d|props3d|world3d|engine3d|townkit3d|campuskit3d|zones3d|building3d|wancai3d|library3d|library_b1_3d|library_upper3d|dorm3d|lawlib3d|soclib3d|gym3d|teach3d|audio3d|adv3d|game3d|guide3d|placemap3d|crowd3d|bike3d|us3d|us_traffic3d|jp_dorm3d|rooms_glb3d|l118_shops3d|linze_upper3d|lane118\.js|_layouts?\.js|portrait_manifest)/;
const loadErr=[]; { const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'); const L=[...html.matchAll(/src="(src\/[^"?]+)/g)].map(m=>m[1]);
  for(const f of L){ if(HAVE.has(f)||SKIP.test(f)||!fs.existsSync(path.join(ROOT,f))) continue; try{ let s=fs.readFileSync(path.join(ROOT,f),'utf8'); s=s.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); }catch(e){ loadErr.push(f+'：'+String(e.message).slice(0,60)); } } }
const warns=[]; console.warn=(...a)=>{ warns.push(a.map(String).join(' ').slice(0,160)); };
const FRIENDS=['zhe','yu','classmate_bohan','classmate_xinci','classmate_mingxuan','classmate_peishan','npc_fangyt','heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','kexin'];
const NM={heroine_01:'以安',heroine_02:'芷若',heroine_03:'語彤',heroine_04:'子晴',heroine_05:'學姊',classmate_peishan:'沛珊',kexin:'可昕',zhe:'阿哲',yu:'Alison',classmate_bohan:'柏翰',classmate_xinci:'芯慈',classmate_mingxuan:'明軒',npc_fangyt:'方奕廷',kevin:'Kevin',mom:'媽媽',dad:'爸爸',sis:'姊姊',player:'祐廷'};
const P={
  jp:{flags:{EXCHANGE_ROUTE:'JP',EXCH_RULE:1,LAWCLUB_SAT_VISITS:10},date:'heroine_01'},
  us:{flags:{EXCHANGE_ROUTE:'US',EXCH_RULE:1,LAWCLUB_SAT_VISITS:10},date:'heroine_05'},
  fd:{flags:{FAIL_DELAY:true,LAWCLUB_SAT_VISITS:10},date:null},
  tw_single:{flags:{BAR_REG:true,LAWCLUB_SAT_VISITS:10,dating_kexin:false},date:null},
  tw_kexin:{flags:{BAR_REG:true,LAWCLUB_SAT_VISITS:10},date:'kexin'},
  tw_sis:{flags:{BAR_REG:true,LAWCLUB_SAT_VISITS:10,dating_kexin:false},date:'heroine_05'},
  tw_an:{flags:{BAR_REG:true,LAWCLUB_SAT_VISITS:10,dating_kexin:false},date:'heroine_01'},
  tw_zr:{flags:{BAR_REG:true,LAWCLUB_SAT_VISITS:10,dating_kexin:false},date:'heroine_02'},
  tw_yt:{flags:{BAR_REG:true,LAWCLUB_SAT_VISITS:10,dating_kexin:false},date:'heroine_03'},
  tw_zq:{flags:{BAR_REG:true,LAWCLUB_SAT_VISITS:10,dating_kexin:false},date:'heroine_04'},
  tw_ps:{flags:{BAR_REG:true,LAWCLUB_SAT_VISITS:10,dating_kexin:false},date:'classmate_peishan'},
  jp_ex:{flags:{EXCHANGE_ROUTE:'JP',EXCH_RULE:1,LAWCLUB_SAT_VISITS:10,dating_kexin:false,EX_heroine_01:true},date:null},
  us_ex:{flags:{EXCHANGE_ROUTE:'US',EXCH_RULE:1,LAWCLUB_SAT_VISITS:10,dating_kexin:false,EX_heroine_05:true},date:null},
  tw_sis_ex:{flags:{BAR_REG:true,LAWCLUB_SAT_VISITS:10,dating_kexin:false,EX_heroine_05:true},date:null},
};
const pk=process.env.P||'jp', prof=P[pk]; const out=[]; const W=s=>out.push(s);
const y4=async GM=>{ const G=GM.G; if(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G)) return null;
  if(STORY.packDue(G)){ await STORY.packY4(GM); return 'pack'; } if(STORY.gradMorningDue(G)){ await STORY.gradFamily(GM); return 'family'; } if(STORY.gradLunchDue(G)){ await STORY.gradLunch(GM); return 'lunch'; }
  if(G.zone==='dorm'&&STORY.gradEnvelopeDue(G)){ await STORY.gradEnvelope(GM); return 'envelope'; } if(STORY.moveOutDue(G)){ await STORY.moveOutY4(GM); return 'moveout'; } return null; };
(async()=>{
  const G=H.fresh('2029-06-02',8,'dorm',Object.assign({PACKED_Y4:PG.gradDay()-1},prof.flags)); FRIENDS.forEach(H.FRIEND); if(prof.date) H.date(prof.date);
  if(pk!=='fd'){ G.flags.FAIL_DELAY_COURSES=[]; try{ CLS.rec(G).grades.Y4S2={sim:'大四下全部通過（模擬前置）'}; }catch(e){} }   /* [前置] 模擬沒去考大四下：不讓它變成被當延畢 */
  for(const [g,n] of [['noodle_team','麵店團'],['home','家人'],['family_law','法律系直屬家族'],['law_class','法律系（全班）']]) try{ PHONE.join(G,g,n); }catch(e){}
  const seen=new WeakSet(); for(const m of (G.msgs||[])) seen.add(m);
  let si=0, ci=0; const lab=()=>PG.dateLabel?PG.dateLabel(G.day,G.hour):(G.day+' '+G.hour);
  const flush=tag=>{ const said=H.said.slice(si); si=H.said.length; const cards=H.cards.slice(ci); ci=H.cards.length; const nm=(G.msgs||[]).filter(m=>!seen.has(m)); nm.forEach(m=>seen.add(m));
    if(!said.length&&!cards.length&&!nm.length&&!tag) return; W('\n### '+lab()+(tag?'　【'+tag+'】':''));
    for(const c of cards) W('  〔字卡〕'+c.filter(Boolean).join('｜'));
    for(const s of said) W('  '+(s.who?s.who+'：':'')+s.t);
    for(const m of nm) W('  📱'+(m.th||'')+'｜'+(NM[m.from]||m.name||m.from||'')+'：'+String(m.text||'')); };
  const answer=()=>{ let n=0; try{ for(const m of PHONE.pending(G)){ const id=m.ask&&m.ask.id; if(!id) continue; const o=(m.ask.opts||[])[0]; if(PHONE.answer(G,id,0)!=null){ n++; W('  ↳（回）'+(o?o.t:'')); } } }catch(e){} if(n){ try{ STORY.phoneRules(GM); PG.rules(GM); }catch(e){} } return n; };
  let it=0;
  try{ for(it=0; it<500&&!G.flags.EPILOGUE_DONE; it++){
      const y=await y4(GM); if(y){ flush('y4:'+y); continue; }
      if(OUT.due(G)){ const q=OUT.due(G); H.picks=[0]; await OUT.tick(GM); flush('出遊 '+(q&&(q.title||q.id))); continue; }
      const s=PG.due(G); if(s){ await PG.runStep(GM,s); flush('場景 '+s.id); continue; }
      if(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G)){ if(!await PG.sleepJump(GM)){ await HOME.sleep(GM); } flush('睡覺'); answer(); continue; }
      if(!await PG.advance(GM)){ W('（跳不下去：'+lab()+'）'); break; } flush(null); answer(); }
  }catch(e){ W('例外：'+(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); }
  W('\n== '+pk+' 結束：'+it+' 次；EPILOGUE_DONE='+!!G.flags.EPILOGUE_DONE+'；warn '+warns.length+(warns.length?'（'+warns.slice(0,3).join('｜')+'）':'')+'；載不進來 '+loadErr.length+(loadErr.length?'（'+loadErr.slice(0,3).join('｜')+'）':''));
  fs.writeFileSync(process.argv[2]||'/dev/stdout',out.join('\n')); console.log(pk,'done',it,'iterations; lines',out.length,'warns',warns.length,'loadErr',loadErr.length);
})();
