// CC M7 重驗（BB 09:40）：188412f3b 的 Q1（不及格／缺考的通識不加分）、Q2（重修同一課號只算一次）、Q6（postgrad 讀 pathTop）
// 用法：WT=<受測工作樹> node m7b_recheck.js   （修改前 5b40dad61 應 FAIL R1、R2、R4；修改後應 PASS）
'use strict';
const WT=process.env.WT||process.cwd();
const H=require(WT+'/tests/pg_harness.js');
const fs=require('fs'), {check}=H, J=JSON.stringify;
const L=G=>STORY.careerLean(G);
const ge1=(t,cid,v)=>{ const G=H.fresh('2027-09-01',10,'dorm'); CLS.rec(G).grades={[t]:{[cid]:v}}; return L(G).C; };
(async()=>{
  /* R1 不及格／缺考的通識不加分（各種字串）*/
  const bad=['不及格','不及格（下學期重修）','缺考','缺考（不及格）','0 分（不及格）','45 分（不及格，下學期重修）','未開考',''];
  const r1=bad.map(v=>[v,ge1('Y1S1','ge_film_y1s1',v)]);
  check('R1. 不及格／缺考／未開考／空字串的通識 → C＝0',r1.every(x=>x[1]===0),J(r1));
  /* R3 及格的字串照算 1 */
  const good=['及格','通過','85 分','及格（補考）','及格（期末考補登）','很好','不錯','過了'];
  const r3=good.map(v=>[v,ge1('Y1S1','ge_film_y1s1',v)]);
  check('R3. 及格類字串 → C＝1（不能因為修 Q1 把及格的也拿掉）',r3.every(x=>x[1]===1),J(r3));
  /* R2 重修同一課號只算一次 */
  { const G=H.fresh('2027-09-01',10,'dorm'); CLS.rec(G).grades={Y1S1:{chinese_y1:'不及格（下學期重修）',ge_film_y1s1:'及格'},Y1S2:{chinese_y1:'及格'},Y2S1:{chinese_y1:'及格'}}; const c=L(G);
    check('R2a. 國文 Y1S1 被當、Y1S2 及格、Y2S1 又寫一次及格＋通識 1 門 → C＝2（國文只算一次）',c.C===2,J(c)); }
  { const G=H.fresh('2027-09-01',10,'dorm'); CLS.rec(G).grades={Y1S1:{ge_film_y1s1:'及格',chinese_y1:'及格'}}; const a=L(G).C;
    CLS.rec(G).grades={Y1S1:{ge_film_y1s1:'及格',chinese_y1:'不及格（下學期重修）'},Y1S2:{chinese_y1:'及格'}}; const b=L(G).C;
    check('R2b. 被當再重修過，不會比一次就過多分（一次過 '+a+'、重修過 '+b+'）',b<=a,J({a,b})); }
  /* R4 postgrad：所有讀傾向的地方都走 pathTop（靜態）＋ytEnd 功能（原始 top B、pathTop A）*/
  { const src=fs.readFileSync(WT+'/src/postgrad3d.js','utf8'); const raw=(src.match(/S\.lean\(G\)\.top|careerLean\(G\)\.top/g)||[]).length;
    check('R4a. postgrad3d.js 沒有直接讀原始 top（S.lean(G).top）的地方',raw===0,'raw='+raw);
    const fns=['ytEnd','epiAlways','path','zqLine']; const nopt=fns.filter(f=>typeof PG[f]==='function'&&!/pathTop/.test(PG[f].toString()));
    check('R4b. ytEnd、epiAlways、path、zqLine 都呼叫 pathTop',nopt.length===0,J(nopt));
    const real=STORY.careerLean; STORY.careerLean=()=>({A:3,B:5,C:1,top:'B'});   /* 原始 top B、沒報研究所 → pathTop A */
    const G=H.fresh('2029-08-01',10,'dorm'); ['RENT_CONSULTATION','LAW_MEETS_LIFE','APOLOGIZED'].forEach(t=>SOCIAL.remember('heroine_03',t,''));
    const pt=PG.pathTop(G), y=PG.ytEnd(G);
    STORY.careerLean=()=>({A:3,B:5,C:1,top:'A'}); const yA=PG.ytEnd(G); STORY.careerLean=real;
    check('R4c. 原始 top B、pathTop A：ytEnd 和原始 top A 的結果相同（讀 pathTop）',pt==='A'&&J(y)===J(yA),J({pt,y,yA})); }
  H.done();
})();
