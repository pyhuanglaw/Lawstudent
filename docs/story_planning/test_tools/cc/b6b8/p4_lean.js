// 用法：node p4_lean.js <worktree>　careerLean v2：Q3 通識、Q4 上限、舊存檔、平手、律師家族
const WT=process.argv[2]; const H=require(WT+'/tests/pg_harness.js');
const o=(k,v)=>console.log(k.padEnd(46),JSON.stringify(v));
const base=f=>{ const G=H.fresh('2029-07-01',10,'dorm',Object.assign({},f||{})); G.courses=G.courses||{}; G.courses.grades={}; G.acts={att:{}}; G.vac={reg:{}}; return G; };
const CL=G=>{ const c=STORY.careerLean(G); return {A:c.A,B:c.B,C:c.C,top:c.top}; };
// Q3
{ const G=base(); const g=G.courses.grades; g.Y0S1={ge_y0s1:'及格',chinese_y0:'及格'}; g.Y1S1={ge_film_y1s1:'及格',chinese_y1:'及格',english_y1:'85 分',pe_y1s1:'及格'}; g.Y1S2={ge_y1s2:'不及格'}; g.Y2S1={ge_y2s1:'缺考'}; g.Y2S2={ge_y2s2:'及格'}; g.Y3S1={ge_y2s2:'及格（補考）',ge_y1s2:'及格'};
  o('Q3 期望 C=3（ge_film_y1s1, ge_y2s2, ge_y1s2 重修過）',CL(G)); }
{ const G=base(); const g=G.courses.grades; g.Y1S1={chinese_y1:'及格',english_y1:'及格',pe_y1s1:'及格'}; g.Y1S2={chinese_y1_2:'及格',english_y1_2:'及格',pe_y1s2:'及格'}; o('Q3 國英體全及格 期望 C=0',CL(G)); }
{ const G=base(); const g=G.courses.grades; g.Y1S1={ge_unknown_x:'及格'}; o('Q3 課表裡沒有的 ge_ 課號 期望 C=0',CL(G)); }
// Q4
for(const n of [0,1,3,4,30]){ const G=base({LAWCLUB_SAT_VISITS:n}); o('Q4 法服週六 '+n+' 次（無 FAFU_STORY_SEEN、未入社）A',CL(G).A); }
for(const n of [3,4,9]){ const G=base({LAWCLUB_SAT_VISITS:30,FAFU_STORY_SEEN:n}); o('Q4 FAFU_STORY_SEEN '+n+' A',CL(G).A); }
{ const G=base({lawclub:true}); o('Q4 加入法服（lawclub）A=2',CL(G).A); const G2=base({CLUB_lawclub_study:true,lawclub:true,LAWCLUB_SAT_VISITS:5}); o('Q4 入社+週六5 A=5',CL(G2).A); }
for(const n of [2,3,4,12]){ const G=base(); for(let i=0;i<n;i++) G.acts.att['public_law_group@'+(100+i)]={end:'full'}; G.acts.att['public_law_group@999']={end:'left'}; o('Q4 讀書會 full '+n+' ＋中途離開1 B',CL(G).B); }
{ const G=base(); G.stats.study=500; G.flags.STUDY_AT_LAW=0; o('Q4 自習 500h 不算 B=0',CL(G).B); }
// 平手
{ const G=base({LAWCLUB_SAT_VISITS:2}); for(let i=0;i<2;i++) G.acts.att['public_law_group@'+i]={end:'full'}; o('tie A=B=2 無 base → B',CL(G));
  G.flags.CAREER_Y4_BASE={A:0,B:2,C:0}; o('tie 舊 base 無 v（應跳過）→ B',CL(G));
  G.flags.CAREER_Y4_BASE={A:0,B:2,C:0,v:2}; o('tie v2 base：大四 A+2 B+0 → A',CL(G));
  G.flags.CAREER_Y4_BASE='junk'; let e=null; try{ CL(G); }catch(x){ e=x.message; } o('CAREER_Y4_BASE 字串不丟例外',e); }
{ const G=base(); o('全 0 → B；pathTop（沒報研究所）→',[CL(G).top,PG.pathTop(G)]); }
{ const G=base({LAWCLUB_SAT_VISITS:1}); G.courses.grades.Y1S1={ge_film_y1s1:'及格'}; o('tie A=C=1，B=0 → A（順序 B,A,C）',CL(G)); }
// 舊存檔 careerTick
{ const G=base({CAREER_Y4_BASE:{A:5,B:5,C:5}}); delete G.flags.CAREER_LEAN_V; let e=null; try{ STORY.careerTick(G); }catch(x){ e=x.message; } o('careerTick 舊存檔(2029-07) 不丟例外、base 不重記',{e,base:G.flags.CAREER_Y4_BASE,v:G.flags.CAREER_LEAN_V}); }
{ // 找大四上第 1 週
  let d=null; for(let k=PG.DK('2028-08-25');k<PG.DK('2028-10-01');k++){ const t=CALENDAR.termOf(k); if(t&&t.id==='Y4S1'&&t.week===1){ d=k; break; } }
  const G=base({CAREER_Y4_BASE:{A:5,B:5,C:5}}); G.day=d; STORY.careerTick(G); o('careerTick 舊 base 在 Y4S1 w1 → 重記 v2',G.flags.CAREER_Y4_BASE);
  const G2=base({}); G2.day=d+7; STORY.careerTick(G2); o('careerTick 沒有 base、Y4S1 w2 → 不補',G2.flags.CAREER_Y4_BASE); }
// 律師家族
const fam=['A_bar','C_zq','B_grad','L_firm'];
const cases=[['A',{LAWCLUB_SAT_VISITS:3}],['B grad applied no admit',{Y4_PATH:'grad'},G=>{for(let i=0;i<3;i++) G.acts.att['public_law_group@'+i]={end:'full'};}],['B admit',{Y4_PATH:'grad',GRAD_ADMIT:'exam'},G=>{for(let i=0;i<3;i++) G.acts.att['public_law_group@'+i]={end:'full'};}],['B no apply C>A',{},G=>{for(let i=0;i<3;i++) G.acts.att['public_law_group@'+i]={end:'full'}; G.courses.grades.Y1S1={ge_film_y1s1:'及格'};}],['C no zq',{},G=>{G.courses.grades.Y1S1={ge_film_y1s1:'及格'};}],['C zq contract no friend',{ZQ_CONTRACT:'lawyer'},G=>{G.courses.grades.Y1S1={ge_film_y1s1:'及格'};}]];
for(const [n,f,s] of cases){ for(const by of [null,2029]){ const G=base(Object.assign({},f,by?{BAR_YEAR:by}:{})); if(s) s(G); const p=PG.path(G); o('path '+n+' BAR_YEAR='+by,[CL(G).top,PG.pathTop(G),p,by?fam.includes(p):'-']); } }
{ const G=base({BAR_YEAR:2029,JUDGE_YEAR:2030}); o('BAR+JUDGE_YEAR, ROLE null → J_judge',PG.path(G)); G.flags.JUDGE_ROLE='pros'; o('ROLE pros',PG.path(G)); }
process.exit(0);
