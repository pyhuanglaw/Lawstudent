// CC（帳號 A）11-02：cc_bar_b8_probe.py 的【前置】——用遊戲自己的程式（tests/pg_harness.js，不需要瀏覽器）把畢業後篇從某一天一路「跳到下一件事」，
// 停在指定場景（STOP，例如 exam_2032）開演之前，把整個 G 存成 JSON，給瀏覽器探針用 GAME.applySave 讀進去，之後照玩家在瀏覽器裡演。
// 路線照 tests/d118_b8b_unit.js（r11）、d118_b8d_unit.js（a1）的 sim（複製；一試／二試照 plan 答對幾題，其他選項選第一個）。
// 用法：WT=<受測工作樹> node cc_bar_b8_prefix.js <路線 trainee|judge2033> <輸出 json>
'use strict';
const WT=process.env.WT||process.cwd();
const H=require(WT+'/tests/pg_harness.js');
const fs=require('fs');
const warns=[]; console.warn=(...a)=>{ warns.push(a.map(x=>x&&x.stack?x.stack.split('\n').slice(0,3).join(' / '):String(x)).join(' ')); };
const GM=H.GM; GM.spawnCharacter=()=>null;
const graduated=G=>{ G.flags.GRADUATED=PG.gradDay(); PG.rec(G).done.grad=1; if(G.flags.MOVED_OUT==null) G.flags.MOVED_OUT=PG.DK('2029-06-28'); };
const answerK=(qs,k)=>qs.map((q,i)=>{ const o=PG.opts(q); const right=o.findIndex(x=>String(x.v)===String(q.answer)); return i<k?right:(right===0?1:0); });
const FRIENDS=['zhe','yu','classmate_bohan','heroine_01','heroine_03','classmate_peishan'];
const ROUTES={
  /* r11：2029 一試 18（both）、二試 4（應屆一定沒上）→ 二選一「再考」→ 2030、2031 一試 17、二試 3 → 停在 2032 一試（瀏覽器：一試 17、二試 9＝2033 錄取＝受訓中）*/
  trainee:{key:'2029-08-04',h:7,flags:{},plan:{exam:{2029:18,2030:17,2031:17},judge:{2029:4,2030:3,2031:3},retake:true},stop:'exam_2032',setup:G=>{ H.FRIEND('heroine_03'); H.date('heroine_03'); }},
  /* a1：2029、2030 一試 5（沒過）→ 2031、2032 一試 5 → 停在 2033 一試（瀏覽器：一試 17＝第一次到 both、二試 3＝沒上，沒有下一年）*/
  judge2033:{key:'2031-05-01',h:10,flags:{BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:5,BAR_STAGE_2029:'none',BAR_SIT_2030:true,BAR_SCORE_2030:5,BAR_STAGE_2030:'none',FIRST_DAY_SEEN:true},
    plan:{exam:{2031:5,2032:5}},stop:'exam_2033',setup:G=>{ const d=PG.rec(G).done; for(const id of ['exam_2029','r1_2029','exam_2030','r1_2030','first','reg_2030']) d[id]=1; }},
};
(async()=>{
  const name=process.argv[2], out=process.argv[3], RT=ROUTES[name]; if(!RT||!out){ console.log('用法：node cc_bar_b8_prefix.js <'+Object.keys(ROUTES).join('|')+'> <輸出 json>'); process.exit(2); }
  const G=H.fresh(RT.key,RT.h,'dorm',Object.assign({BAR_REG:true,Y4_PATH:'bar'},RT.flags)); graduated(G); FRIENDS.forEach(H.FRIEND); if(RT.setup) RT.setup(G);
  PHONE.join(G,'noodle_team','麵店團'); PHONE.join(G,'home','家人');
  const plan=RT.plan, order=[]; let it=0, stopped=false, err=null;
  const orun=PG.runStep; PG.runStep=async function(GM,s){ let set=false, m; if(s.id===RT.stop){ stopped=true; return false; }   /* 停在這一場開演之前（PG.advance 會自己叫 runStep）*/
    if(!PG.done(G,s.id)){
      if((m=/^exam_(\d{4})$/.exec(s.id))){ H.picks=answerK(PG.draw(G,+m[1]),(plan.exam||{})[m[1]]|0); set=true; }
      else if((m=/^e2b_(\d{4})$/.exec(s.id))&&PG.stage(G,+m[1])==='both'){ H.picks=answerK(PG.drawJudge(G,+m[1]),(plan.judge||{})[m[1]]|0); set=true; }
      else if((m=/^jretake_(\d{4})$/.exec(s.id))){ H.picks=[plan.retake?0:1]; set=true; }
      else if((m=/^j?reg_(\d{4})$/.exec(s.id))){ H.picks=['報名']; set=true; } }
    const r=await orun.call(PG,GM,s); if(set) H.picks=[]; if(r) order.push(s.id); return r; };
  try{ for(it=0; it<220&&!stopped; it++){
      if(OUT.due(G)){ H.picks=[0]; await OUT.tick(GM); H.picks=[]; continue; }
      const s=PG.due(G);
      if(s) await PG.runStep(GM,s);
      else if(typeof HOME!=='undefined'&&HOME.at&&HOME.at(G)){ if(!await PG.sleepJump(GM)){ const t0=G.day*24+G.hour; await HOME.sleep(GM); if(G.day*24+G.hour<=t0) break; } }
      else if(!await PG.advance(GM)) break; }
  }catch(e){ err=e; } finally { PG.runStep=orun; }
  const F=G.flags, info={route:name,stopped,stop:RT.stop,it,err:err?String(err.stack||err):null,warns:warns.slice(0,5),at:PG.dateLabel(G.day,G.hour),day:G.day,hour:G.hour,zone:G.zone,order,
    flags:Object.fromEntries(Object.keys(F).filter(k=>/^(BAR_|JUDGE_|FIRST_DAY_SEEN|MOVED_OUT|GRADUATED)/.test(k)).map(k=>[k,F[k]])),path:PG.path(G)};
  fs.writeFileSync(out,JSON.stringify({info,G},(k,v)=>v===Infinity?1e15:v));
  console.log(JSON.stringify(info)); process.exit(stopped&&!err?0:1);
})();
