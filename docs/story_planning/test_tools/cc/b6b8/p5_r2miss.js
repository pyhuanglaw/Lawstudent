// 用法：node p5_r2miss.js <worktree>　2029 一試 18（both）、二試考完；12/14 放榜那兩天沒演到（例：讀很久以前的存檔、或被別的場景占住）→ BAR_YEAR？
const WT=process.argv[2]; const H=require(WT+'/tests/pg_harness.js');
for(const [st,sc] of [['both',18],['lawyer',14]]){
const G=H.fresh('2029-12-17',10,'dorm',{BAR_REG:true,Y4_PATH:'bar',BAR_SIT_2029:true,BAR_SCORE_2029:sc,BAR_STAGE_2029:st}); G.flags.GRADUATED=PG.gradDay(); const d=PG.rec(G).done; for(const id of ['grad','exam_2029','r1_2029','e2a_2029','e2b_2029']) d[id]=1;
let e=null; try{ PG.pending(G); }catch(x){ e=x.message; }
console.log(st+' r2_2029='+d.r2_2029+' BAR_YEAR='+G.flags.BAR_YEAR+' JUDGE_PASS_2029='+G.flags.JUDGE_PASS_2029+' path='+PG.path(G)+' pendingExam='+PG.pendingExam(G)+' sits2030='+PG.sits(G,2030)+' err='+e); }
process.exit(0);
