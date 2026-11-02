// 用法：node p1_static.js <worktree>　靜態探針：題池大小、五年連抽、判定門檻、路徑表、台詞鍵
const WT=process.argv[2]; const H=require(WT+'/tests/pg_harness.js');
const out=(k,v)=>console.log(k.padEnd(34),typeof v==='string'?v:JSON.stringify(v));
const pool=PG.judgePool(); const by={}; for(const q of pool){ const g=PG.judgeGroup(q); by[g]=(by[g]||0)+1; }
out('judgePool size / by group',{n:pool.length,by});
// 五年連抽（2029～2033），每年先抽一試
for(const seed of [12345,1,777,424242]){ const G=H.fresh('2029-10-21',8,'dorm',{BAR_REG:true,examSeed:seed}); G.flags.GRADUATED=PG.gradDay();
  const lens=[]; for(let y=2029;y<=2033;y++){ PG.draw(G,y); const j=PG.drawJudge(G,y); const c={}; for(const q of j){const g=PG.judgeGroup(q); c[g]=(c[g]||0)+1;} lens.push(y+':'+j.length+JSON.stringify(c)); }
  out('seed '+seed+' 5-year drawJudge',lens.join(' ')); }
// 判定邊界
{ const G=H.fresh('2030-12-13',15,'dorm',{JUDGE_SCORE2_2029:3}); const C=CLS.rec(G); C.exam=C.exam||{};
  const v=()=>[5,6,7].map(k=>k+':'+PG.judgeVerdict(G,2030,k)).join(' ');
  out('basis=null',PG.basis(G)+' '+v());
  C.exam['Y1S1:civ:final']={status:'done',correct:4}; out('basis=4 exactly',PG.basis(G)+' '+v());
  C.exam['Y1S2:civ:final']={status:'done',correct:3.99}; out('basis<4',PG.basis(G).toFixed(3)+' '+v());
  // 通識、Y4、Y5 的期末算不算進 basis
  delete C.exam['Y1S2:civ:final']; C.exam['Y2S1:ge_y2s1:final']={status:'done',correct:0}; out('basis incl ge_ final(0)?',PG.basis(G)+' '+v());
  C.exam['Y5S1:civ:final']={status:'done',correct:0}; out('basis incl Y5S1?',PG.basis(G));
  C.exam['Y1S1:civ:final:retake']={status:'done',correct:0}; out('basis keys sample',Object.keys(C.exam).join(','));
  out('verdict y=2029 no prior, k=10',PG.judgeVerdict(G,2029,10));
  const G2=H.fresh('2030-12-13',15,'dorm',{}); out('verdict 2030 w/o prior sit, k=10',PG.judgeVerdict(G2,2030,10));
}
// 路徑表：所有組合
const L=POSTGRAD_LINES; out('EPI.last keys',Object.keys(L.EPI.last)); out('FIRST.me keys',Object.keys(L.FIRST.me)); out('JUDGE.jobName',L.JUDGE&&L.JUDGE.jobName);
out('JUDGE keys',Object.keys(L.JUDGE||{}));
out('JUDGE.epiD',L.JUDGE.epiD); out('JUDGE.epiF',L.JUDGE.epiF); out('retake.noLic',L.JUDGE.retake&&L.JUDGE.retake.noLic);
out('JUDGE.no',L.JUDGE.no); out('R2.judgeNarr',L.R2.judgeNarr);
out('LATE.stop',L.LATE&&L.LATE.stop); out('LATE.card',L.LATE&&L.LATE.card);
out('Y reg dates',[2029,2030,2031,2032,2033].map(y=>y+':'+(PG.Y?PG.Y[y]&&PG.Y[y].reg:'?')).join(' '));
