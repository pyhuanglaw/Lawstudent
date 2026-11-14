// 女主角「講她自己」的訊息 30 則（HEROINE-LIFE-1028；AA_1029～AA_1032；AA-1025-1027-INTEG-1114）——不需要瀏覽器（D131）。
// src/data/self_msgs.js（tools/story/import_self_msgs.py 產生）、src/selfmsgs3d.js（SELFMSG）。
//   0 接線：index.html 載入兩個檔（y1fill3d.js 之後）；匯入工具 --check 和稿一致；30 則、id 不重複
//   1 每一則的字和稿一字不差（稿從白名單那一版 git show）；t 的學期、週次、星期、時間；有日期的那一天真的是那個學期那一週那個星期
//   2 家族群組 12 則：在群組裡＝那一天排進手機、時間照稿、帳號名稱 Kevin／溫學姊；不在群組＝不排
//   3 學姊的橘子（sis_self_y1s1_2）：最後一則帶兩個選項、到隔天 12:00；回了她照稿回
//   4 私訊 18 則：階段不夠／沒有聯絡方式＝不排；到了階段＝排；AA_1032 四則和 zr_self_y1s1_1 是 FAMILIAR，其他 FRIEND
//   5 只發一次；晚兩天以上不補；子晴 zq_self_y2s2_2 在大二下第 13 週週五
// 用法：node tests/self_msgs_1114_unit.js
const H=require('./pg_harness.js');
const {check}=H; const fs=require('fs'), path=require('path'), vm=require('vm'), cp=require('child_process');
const J=JSON.stringify;
for(const [f,n] of [['src/data/self_msgs.js','SELF_MSGS'],['src/selfmsgs3d.js','SELFMSG']]) vm.runInThisContext(fs.readFileSync(path.join(H.ROOT,f),'utf8').replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'='),{filename:f});
const L=SELF_MSGS.msgs, by=id=>L.find(m=>m.id===id);
const q=G=>PHONE.rec(G).q, tagged=(G,tag)=>q(G).filter(x=>x.tag===tag||String(x.tag).startsWith(tag+'_'));
const put=(m,off,hour)=>{ const d=SELFMSG.dayOf(m); const G=H.fresh('2025-09-01',hour==null?8:hour,'dorm'); G.day=d+(off||0); G.hour=hour==null?8:hour; if(!G.flags) G.flags={}; return G; };
const WD='日一二三四五六日';   /* 行事曆的星期日＝7 */
(async()=>{
  const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
  check('0. index.html 載入 data/self_msgs.js、selfmsgs3d.js（y1fill3d.js 之後）',/src\/y1fill3d\.js[^\n]*\n<script src="src\/data\/self_msgs\.js[^\n]*\n<script src="src\/selfmsgs3d\.js/.test(html));
  let chk=''; try{ chk=cp.execFileSync('python3',['tools/story/import_self_msgs.py','--check'],{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ chk=String(e.stdout||e.message); }
  check('0. 匯入工具 --check：遊戲檔和白名單那一版的稿一致',/^OK 30 則/.test(chk),chk.slice(0,200));
  check('0. 30 則、id 不重複；家族群組 12、私訊 18',L.length===30&&new Set(L.map(m=>m.id)).size===30&&L.filter(m=>m.need==='group').length===12&&L.filter(m=>m.need!=='group').length===18,J([L.length]));
  /* ---- 1 ---- */
  { const bad=[]; let n=0;
    for(const s of SELF_MSGS.src){ const [p,sha]=s.split('@'); const doc=JSON.parse(cp.execFileSync('git',['show',sha+':'+p],{cwd:H.ROOT,encoding:'utf8',maxBuffer:1<<26}));
      for(const d of doc.msgs){ const m=by(d.id); n++; if(!m){ bad.push(d.id+' 不在'); continue; }
        const want=d.ms.map(x=>Array.isArray(x)?x:[d.who,x]); if(J(m.ms)!==J(want)) bad.push(d.id+' 字不一樣');
        const t=/^(Y\dS\d) W(\d+)(.) (\d\d):(\d\d)/.exec(d.t); if(!t||m.term!==t[1]||m.week!==+t[2]||WD[m.wd]!==t[3]||Math.abs(m.h-(+t[4]+(+t[5])/60))>1e-3) bad.push(d.id+' t');
        if(d.ask&&J(m.ask.opts.map(o=>[o.t,o.r]))!==J(d.ask.opts.map(o=>[o.t,o.r]))) bad.push(d.id+' ask'); } }
    check('1. 每一則的字、學期週次星期時間、回覆選項和稿一字不差（'+n+' 則）',n===30&&!bad.length,J(bad.slice(0,6))); }
  { const bad=[]; for(const m of L){ const d=SELFMSG.dayOf(m); if(d==null){ bad.push(m.id+' 沒有日子'); continue; } const t=CALENDAR.termOf(d), wd=CALENDAR.dateOf(d).wd;
      if(!t||t.id!==m.term||t.week!==m.week||wd!==m.wd) bad.push(m.id+'：'+J([t&&t.id,t&&t.week,wd])+' 稿 '+J([m.term,m.week,m.wd])); }
    check('1. 每一則的那一天（有日期的照日期、沒有的照學期週次星期）真的在那個學期、那一週、那個星期',!bad.length,J(bad.slice(0,6))); }
  /* ---- 2 ---- */
  { const bad=[]; for(const m of L.filter(x=>x.need==='group')){ const d=SELFMSG.dayOf(m);
      { const G=put(m); PHONE.join(G,'family_law','法律系家族'); SELFMSG.phone(G); const Q=tagged(G,'self_'+m.id), items=Q.flatMap(x=>x.items);
        if(items.length!==m.ms.length||J(items.map(i=>[i.from,i.text]))!==J(m.ms)) bad.push(m.id+' 排的句子不對');
        if(!Q.every(x=>x.day===d)||Math.abs(Q[0].h-m.h)>1e-6||!Q.every((x,k)=>k===0||x.h>Q[k-1].h)) bad.push(m.id+' 時間');
        if(!items.every(i=>i.th==='g:family_law'&&i.name===({kevin:'Kevin',heroine_05:'溫學姊'})[i.from])) bad.push(m.id+' 群組／帳號名稱'); }
      { const G=put(m); SELFMSG.phone(G); if(tagged(G,'self_'+m.id).length) bad.push(m.id+' 不在群組也排了'); } }
    check('2. 家族群組 12 則：在群組裡＝那一天排進手機（字、時間照稿、一則接一則、帳號名稱 Kevin／溫學姊）；不在群組＝不排',!bad.length,J(bad.slice(0,6))); }
  /* ---- 3 ---- */
  { const m=by('sis_self_y1s1_2'), d=SELFMSG.dayOf(m), G=put(m); PHONE.join(G,'family_law','法律系家族'); SELFMSG.phone(G); const items=tagged(G,'self_'+m.id).flatMap(x=>x.items), a=items[items.length-1].ask;
    check('3. 學姊的橘子：最後一則帶兩個選項「橘子甜嗎？」「謝謝學姊。」、到隔天 12:00、別則沒有選項',!!a&&a.id==='self_sis_self_y1s1_2'&&J(a.opts.map(o=>o.t))===J(['橘子甜嗎？','謝謝學姊。'])&&a.until===(d+1)*24+12&&items.slice(0,-1).every(i=>!i.ask),J(a));
    check('3. 回「橘子甜嗎？」她回「很酸。」「奶奶說酸的才提神。」；回「謝謝學姊。」她回「謝奶奶。」（一字照稿；沒有加減好感）',!!a&&J(a.opts[0].say.map(s=>[s.from,s.text]))===J([['heroine_05','很酸。'],['heroine_05','奶奶說酸的才提神。']])&&J(a.opts[1].say.map(s=>[s.from,s.text]))===J([['heroine_05','謝奶奶。']])&&a.opts.every(o=>!o.fx&&!o.rel&&!o.set)); }
  /* ---- 4 ---- */
  { const bad=[], lv={}; for(const m of L.filter(x=>x.need!=='group')){ lv[m.id]=m.need;
      { const G=put(m); SELFMSG.phone(G); if(tagged(G,'self_'+m.id).length) bad.push(m.id+' 不認識也排了'); }
      { const G=put(m); (m.need==='FRIEND'?H.FRIEND:H.FAMILIAR)(m.who); if(G.contacts) G.contacts[m.who]=G.day-3; SELFMSG.phone(G); const Q=tagged(G,'self_'+m.id), items=Q.flatMap(x=>x.items);
        if(J(items.map(i=>[i.from,i.text]))!==J(m.ms)||!items.every(i=>i.th==='p:'+m.who)||Math.abs(Q[0].h-m.h)>1e-6) bad.push(m.id+' 到了階段沒排好：'+items.length); }
      if(m.need==='FRIEND'){ const G=put(m); H.FAMILIAR(m.who); if(G.contacts) G.contacts[m.who]=G.day-3; SELFMSG.phone(G); if(tagged(G,'self_'+m.id).length) bad.push(m.id+' 只有 FAMILIAR 也排了'); } }
    const fam=Object.keys(lv).filter(k=>lv[k]==='FAMILIAR').sort();
    check('4. 私訊 18 則：不認識＝不排；到了階段、有聯絡方式＝排（字、時間照稿）；FRIEND 的只到 FAMILIAR 不排',!bad.length,J(bad.slice(0,6)));
    check('4. FAMILIAR 就收得到的＝AA_1032 四則＋zr_self_y1s1_1（AA_1032 _meta.change）；其他 13 則 FRIEND',J(fam)===J(['ya_self_y1s1_w6','yt_self_y1s1_w7','zq_self_y1s1_w9','zr_self_y1s1_1','zr_self_y1s1_w9'].sort()),J(fam)); }
  /* ---- 5 ---- */
  { const m=by('sis_self_y1s1_1'); const G=put(m); PHONE.join(G,'family_law','法律系家族'); SELFMSG.phone(G); const n1=tagged(G,'self_'+m.id).length; SELFMSG.phone(G); const n2=tagged(G,'self_'+m.id).length;
    const G2=put(m,2); PHONE.join(G2,'family_law','法律系家族'); SELFMSG.phone(G2); const G3=put(m,-1); PHONE.join(G3,'family_law','法律系家族'); SELFMSG.phone(G3);
    check('5. 只排一次；晚兩天才輪到的不補；前一天還不排',n1===m.ms.length&&n2===n1&&!tagged(G2,'self_'+m.id).length&&!tagged(G3,'self_'+m.id).length,J([n1,n2]));
    const z=by('zq_self_y2s2_2'); check('5. 子晴「成發下禮拜五」在大二下第 13 週週五（成發在第 14 週週五）',z.term==='Y2S2'&&z.week===13&&z.wd===5); }
  H.done();
})().catch(e=>{ console.error(e); console.log('FAILED (exception)'); process.exit(1); });
