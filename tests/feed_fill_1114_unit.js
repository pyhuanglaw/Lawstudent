// 動態補七則（HEROINE-LIFE-1028；AA_1027 大一下五則、AA_1028 大一上學姊兩則；AA-1025-1027-INTEG-1114）——不需要瀏覽器（D131）。
//   1 七則都在 FEED_Y1S2／FEED_Y1S1.posts，id、who、st、pic、say、cm、dm 和稿（企劃線那一版 git show）一字不差
//   2 t：稿寫「W5二 07:10」，遊戲寫成日期——那一天真的是那個學期第幾週、星期幾（大一上 W1＝2025-09-01 那週、大一下 W1＝2026-02-23 那週）
//   3 id 不和原本的重複；大一下第 1～12 週每一週至少一則動態（BB-B HL2 實玩的缺口）
// 用法：node tests/feed_fill_1114_unit.js
const H=require('./pg_harness.js'); const {check}=H;
const fs=require('fs'), path=require('path'), cp=require('child_process'); const J=JSON.stringify;
const load=(f,n)=>new Function(fs.readFileSync(path.join(H.ROOT,f),'utf8').replace("'use strict';",'')+';return '+n)();
const SRC=[['docs/story_planning/AA_1027_feed_y1s2_fill.json','1029d03d0e','src/data/feed_y1s2.js','FEED_Y1S2','2026-02-23',5],['docs/story_planning/AA_1028_feed_y1s1_sis.json','10ba78c99f','src/data/feed_y1s1.js','FEED_Y1S1','2025-09-01',2]];
const WD='一二三四五六日';
(async()=>{
  for(const [p,sha,f,n,w1,cnt] of SRC){ let doc=null; try{ doc=JSON.parse(cp.execFileSync('git',['show',sha+':'+p],{cwd:H.ROOT,encoding:'utf8'})); }catch(e){}
    const F=load(f,n), bad=[], badT=[];
    if(!doc){ check('1. 讀得到稿 '+p+'@'+sha,false,'git fetch origin claude/cool-heisenberg-o8kuqx'); continue; }
    for(const d of doc.posts){ const g=F.posts.find(x=>x.id===d.id); if(!g){ bad.push(d.id+' 不在'); continue; }
      for(const k of ['who','st','pic','say']) if(g[k]!==d[k]) bad.push(d.id+'.'+k); for(const k of ['cm','dm']) if(J(g[k])!==J(d[k])) bad.push(d.id+'.'+k);
      const m=/^W(\d+)(.) (\d\d:\d\d)$/.exec(d.t), t=/^(\d{4}-\d\d-\d\d) (\d\d:\d\d)$/.exec(g.t);
      if(!m||!t||t[2]!==m[3]){ badT.push(d.id+' t'); continue; }
      const days=Math.round((Date.parse(t[1]+'T00:00:00Z')-Date.parse(w1+'T00:00:00Z'))/864e5); if(Math.floor(days/7)+1!==+m[1]||WD[days%7]!==m[2]) badT.push(d.id+'：'+g.t+' 不是 '+d.t); }
    check('1. '+path.basename(p)+'：'+doc.posts.length+' 則都在 '+n+'.posts，who、st、pic、say、cm、dm 和稿一字不差',doc.posts.length===cnt&&!bad.length,J(bad));
    check('2. '+path.basename(p)+'：日期就是稿上的第幾週、星期幾、時間（W1＝'+w1+' 那週）',!badT.length,J(badT));
    check('3. '+n+'.posts 的 id 不重複',new Set(F.posts.map(x=>x.id)).size===F.posts.length); }
  { const F=load('src/data/feed_y1s2.js','FEED_Y1S2'), w1=Date.parse('2026-02-23T00:00:00Z'), wk=new Set();
    for(const p of F.posts){ const m=/^W(\d+)/.exec(p.t), t=/^(\d{4}-\d\d-\d\d)/.exec(p.t); if(m) wk.add(+m[1]); else if(t){ const w=Math.floor((Date.parse(t[1]+'T00:00:00Z')-w1)/864e5/7)+1; wk.add(w); } }
    const miss=[]; for(let w=1;w<=12;w++) if(!wk.has(w)) miss.push(w);
    check('3. 大一下第 1～12 週每一週至少一則動態（原本第 6、8、11、12 週是空的）',!miss.length,J(miss)); }
  H.done();
})().catch(e=>{ console.error(e); console.log('FAILED (exception)'); process.exit(1); });
