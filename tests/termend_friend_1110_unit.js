// 朋友版的期末飯給玩家選項（TERMEND-OPTS-1110；使用者 X324）——不需要瀏覽器（D131）。
// 稿：企劃線 AA_749_termend_friend_v2_{Y1S1,Y1S2,Y2S1,Y2S2,Y3S1,Y3S2_Y4S1}.json @5ffd725b8；
//     tools/story/import_termend_opts.py → src/data/termend_opts.js（TERMEND_OPTS.FRIEND[學期][人]），播放 src/termend3d.js。
//   1. 匯入：--check 通過；七個學期、各學期的人數；沒有沛珊；和企劃線的稿逐字一樣（只照 import_guard 換名）
//   2. 每一頓（72 頓）：開頭照稿 → 一組選項（每個玩家三個）→ 選了以後的回答照稿 → then；祐廷不自動回「嗯。」；不抽話題池
//   3. 條件：芷若大二下前兩個選項照 6/3 最後一個班去了沒二選一；Alison 大三上第三個選項日本路線不出；學姊大三下第三個選項美國路線不出；
//      學姊大四上 sayUS／say；阿凱 {子晴學姊|一個學姊} 照 Q6
//   4. 效果走共用上限、選項順序洗過（同一天一樣）
//   5. 鉤子：柏翰大三下、女朋友版以安大二上不念 say、直接出選項；其他鉤子照念
//   6. 心意的飯不再抽朋友的話題池；沛珊（沒匯入）朋友版、心意的飯照原本；沒有 TERMEND_OPTS.FRIEND（舊資料）＝照原本的話題池；存檔沒有新欄位
// 修改前（開發分支 a5651ccc7）：沒有 TERMEND_OPTS.FRIEND——第 1～5 節 FAIL。用法：node tests/termend_friend_1110_unit.js [--hooks]（--hooks：印出「鉤子的句子／那一頓的開頭」對照表給 AA）
const H=require('./pg_harness.js');
const {check,GM}=H; const J=JSON.stringify;
const cp=require('child_process');
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); } };
let WANT=[], CH=[];
GM.choose=async o=>{ const T=o.map(q=>q.t||q.text); CH.push(T); for(const w of WANT){ const k=T.indexOf(w); if(k>=0) return k; } return 0; };
const TOx=typeof TERMEND_OPTS!=='undefined'?TERMEND_OPTS:null, Lx=TERMEND_LINES, FR=(TOx&&TOx.FRIEND)||null, ok0=!!FR&&typeof TERMEND.frEntry==='function';
const DAY={Y1S1:'2026-01-16',Y1S2:'2026-06-20',Y2S1:'2027-01-15',Y2S2:'2027-06-19',Y3S1:'2028-01-14',Y3S2:'2028-06-17',Y4S1:'2028-12-24'};
const said=()=>H.said.map(s=>s.t), idx=t=>said().indexOf(t), has=t=>idx(t)>=0;
const flat=a=>[].concat(...(a||[]).map(x=>typeof x==='string'?[x]:(x&&x.narr?[x.narr]:[])));
const kindOf=who=>Lx.FRIEND[who]?'friend':'fallback';
const dinner=async(who,term,kind,want,flags,pre)=>{ const G=H.fresh(DAY[term],18.5,null,flags); H.rel(who,65,50,45); if(kind==='gf') G.flags['dating_'+who]=true; if(pre) pre(G); H.said=[]; CH=[]; WANT=want||[];
  const r0=Object.assign({},SOCIAL.rel(who)); await TERMEND.dinner(GM,{te:{term,who,kind}}); const r1=SOCIAL.rel(who); return {G,dl:(+r1.npcRom||0)-(+r0.npcRom||0)}; };
const poolOf=(term,who)=>[].concat(...((Lx.POOL[term]||{})[who]||[]).map(x=>typeof x==='string'?[x]:[]));
/* 2026-11-11 改期望（PEISHAN-VOICE-1110，使用者 X327 沛珊重寫；AA_751@33a1769f8 的 friend_v2 五頓接進朋友版）：大一上、大一下、大三上、大三下、大四上各多沛珊一頓（原本 10、12、11、12、10、8、9＝72 頓；現在 77 頓）*/
const N={Y1S1:11,Y1S2:13,Y2S1:11,Y2S2:12,Y3S1:11,Y3S2:9,Y4S1:10};
const q6=G=>{ G.events.done.ev_ziqing_secret_game=G.day-30; };

(async()=>{
  await sec(1,async()=>{ let out=''; try{ out=cp.execFileSync('python3',['tools/story/import_termend_opts.py','--check'],{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','pipe']}); }catch(e){ out=String(e.stderr||e.message); }
    check('1. 匯入工具 --check：src/data/termend_opts.js 和白名單的稿一樣',/^OK /.test(out),out.slice(0,200));
    check('1. 朋友版七個學期、人數照稿（大一上 11、大一下 13、大二上 11、大二下 12、大三上 11、大三下 9、大四上 10＝77 頓；含沛珊五頓）',ok0&&J(Object.keys(FR))===J(Object.keys(N))&&Object.keys(N).every(t=>Object.keys(FR[t]).length===N[t]),ok0?J(Object.keys(FR).map(t=>[t,Object.keys(FR[t]).length])):'沒有 TERMEND_OPTS.FRIEND');
    /* 2026-11-11 改期望（PEISHAN-VOICE-1110，使用者 X327 沛珊重寫；AA_751@33a1769f8 的 friend_v2 五頓接進朋友版）：原本期望「沒有沛珊」*/
    check('1. 沛珊只在大一上、大一下、大三上、大三下、大四上（大二她在重考、聯絡不到）；每一頓至少三個選項、有開頭；沒有帶進 note',ok0&&J(Object.keys(FR).filter(t=>!!FR[t].classmate_peishan))===J(['Y1S1','Y1S2','Y3S1','Y3S2','Y4S1'])&&Object.keys(FR).every(t=>Object.values(FR[t]).every(e=>e.opts.length>=3&&e.says.length>=1&&flat(e.says[e.says.length-1].say).length>=1))&&!/"note"/.test(J(FR)));
    /* 逐字對企劃線的稿（git 讀得到才比；讀不到＝--check 已經比過） */
    let n=0, bad=[]; const IG=t=>t;
    for(const src of (ok0?TOx.src.friend:[])){ const [p,sha]=src.split('@'); let d=null; try{ d=JSON.parse(cp.execFileSync('git',['show',sha+':'+p],{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','pipe'],maxBuffer:1<<24})); }catch(e){ d=null; } if(!d) continue;
      for(const t of Object.keys(d)){ if(t==='_meta') continue; for(const who of Object.keys(d[t])){ const a=d[t][who], b=FR[t][who]; n++;
        const same=b&&J(a.say)===J(b.says[b.says.length-1].say)&&a.opts.length===b.opts.length&&a.opts.every((o,i)=>o.t===b.opts[i].t&&J(o.re)===J(b.opts[i].re)&&J(o.fx||null)===J(b.opts[i].fx||null))&&J(a.then||null)===J(b.then||null)&&(!a.sayUS||J(a.sayUS)===J(b.says[0].say));
        if(!same) bad.push([t,who]); } } }
    check('1. 和企劃線的稿逐字一樣（say、選項、回答、fx、then、sayUS；比了 '+n+' 頓）',ok0&&(n===0||(n===72&&bad.length===0)),J(bad.slice(0,6))); });

  await sec(2,async()=>{ if(!ok0){ check('2. 每一頓都有選項',false,'沒有 TERMEND_OPTS.FRIEND'); return; }
    const bad=[]; let n=0;
    for(const term of Object.keys(FR)) for(const who of Object.keys(FR[term])){ const kind=kindOf(who), E0=FR[term][who]; n++;
      const {G}=await dinner(who,term,kind); const E=TERMEND.alt(G,E0), S0=said();
      const vis=E.opts.filter(o=>TERMEND.optIf(G,o.if,term)), grp=CH.find(c=>c.length===vis.length&&vis.every(o=>c.includes(o.t)));
      const say=(E.says.find(s=>TERMEND.optIf(G,s.if,term))||{}).say, sayOk=flat(say).every(t=>S0.includes(t.replace('{name}','祐廷')));
      const picked=grp&&vis.find(o=>o.t===grp[0]), reOk=picked&&flat(picked.re).every(t=>S0.includes(t.replace('{name}','祐廷'))), thenOk=flat(E.then).every(t=>S0.includes(t));
      const order=picked&&flat(say).length&&flat(picked.re).length?S0.indexOf(flat(say)[0].replace('{name}','祐廷'))<S0.lastIndexOf(flat(picked.re)[0].replace('{name}','祐廷')):true;
      const auto=H.said.some(s=>s.who==='祐廷'&&Lx.REPLY.includes(s.t)), all=flat(say).concat(...E.opts.map(o=>flat(o.re)),flat(E.then)), pool=poolOf(term,who).filter(t=>S0.includes(t)&&!all.includes(t)&&!(((Lx.HOOK[term]||{})[who])&&TERMEND.flat(Lx.HOOK[term][who].say,G).includes(t)));   /* 鉤子自己念的那一句不算 */
      if(!grp||vis.length!==3||!sayOk||!reOk||!thenOk||!order||auto||pool.length||/[{}|]/.test(S0.join(''))) bad.push([term,who,{grp:!!grp,n:vis.length,sayOk,reOk:!!reOk,thenOk,order,auto,pool}]); }
    check('2. 朋友版 '+n+' 頓：開頭照稿 → 三個選項 → 選了以後的回答照稿 → then；祐廷不自動回「嗯。」；不抽話題池；畫面上沒有 {甲|乙}',n===77&&bad.length===0,J(bad.slice(0,4)));
    const z=FR.Y1S1.zhe; await dinner('zhe','Y1S1','friend',[z.opts[1].t]); const i={s:idx(flat(z.says[0].say)[0]),r:idx(flat(z.opts[1].re)[0]),t:idx('我二號回高雄，欸二十九號去海邊啦，趁我還沒回去。')};
    /* 2026-11-11 改期望（AA 改斷句、意思不變；企劃線 bd1a6fda3：芷若、可昕、Alison、阿哲說的字改成一口氣講的寫法，113 處）：then 原本「我二號回高雄。二十九號去海邊啦，我回去之前。」*/
    check('2. 阿哲大一上逐字：開頭 → 選第二個 → 它的回答 → then「我二號回高雄，欸二十九號去海邊啦，趁我還沒回去。」',i.s>=0&&i.r>i.s&&i.t>i.r,J({i,said:said()}));
    await dinner('kai','Y1S1','fallback'); const k=FR.Y1S1.kai; check('2. 阿凱（保底的宵夜）：他的開場（open）照舊 → 新稿的開頭和選項 → 收尾照舊',idx('考完了就好。')>=0&&idx(flat(k.says[0].say)[0])>idx('考完了就好。')&&CH.length>=1&&CH[0].length===3&&has('這次我請。'),J(said())); });

  await sec(3,async()=>{ if(!ok0){ check('3. 條件',false,'沒有 TERMEND_OPTS.FRIEND'); return; }
    const A='「最後一個班那天，妳做的那杯我還記得。」', B='「最後一個班那天，我應該去的。」';
    await dinner('heroine_02','Y2S2','friend',[],null,G=>{ G.events.done.ev_zhiruo_last_shift=G.day-16; }); const g1=CH[0];
    await dinner('heroine_02','Y2S2','friend'); const g2=CH[0];
    check('3. 芷若大二下（稿上四個選項）：6/3 去過＝「…妳做的那杯我還記得。」、沒去＝「…我應該去的。」，每個玩家都是三個',FR.Y2S2.heroine_02.opts.length===4&&g1.length===3&&g1.includes(A)&&!g1.includes(B)&&g2.length===3&&g2.includes(B)&&!g2.includes(A),J([g1,g2]));
    const y3=FR.Y3S1.yu.opts[2].t; await dinner('yu','Y3S1','friend',[],{EXCHANGE_ROUTE:'JP'}); const j=CH[0]; await dinner('yu','Y3S1','friend',[],{EXCHANGE_ROUTE:'US'}); const u=CH[0]; await dinner('yu','Y3S1','friend',[],{EXCHANGE_ROUTE:'TW'}); const w=CH[0];
    check('3. Alison 大三上第三個選項：日本路線不出（兩個）；美國、臺灣路線出（三個）',j.length===2&&!j.includes(y3)&&u.length===3&&u.includes(y3)&&w.length===3&&w.includes(y3),J([j,u,w]));
    const s3='「學姊去了就不回來了嗎？」'; await dinner('heroine_05','Y3S2','friend',[],{EXCHANGE_ROUTE:'US'}); const a=CH[0]; await dinner('heroine_05','Y3S2','friend',[],{EXCHANGE_ROUTE:'TW'}); const b=CH[0];
    check('3. 學姊大三下第三個選項「學姊去了就不回來了嗎？」：美國路線不出、其他路線出',a.length===2&&!a.includes(s3)&&b.length===3&&b.includes(s3),J([a,b]));
    await dinner('heroine_05','Y4S1','friend',[],{EXCHANGE_ROUTE:'US'}); const us=has('回來那班飛機，你睡得比我好。')&&has('論文寫到第四章。美國的資料還在整理。'), usG=CH[0];
    await dinner('heroine_05','Y4S1','friend',[],{EXCHANGE_ROUTE:'TW'}); const tw=!has('回來那班飛機，你睡得比我好。')&&flat(FR.Y4S1.heroine_05.says[1].say).every(has);
    check('3. 學姊大四上：美國路線（US4P）＝sayUS 那兩句、其他路線＝say；選項一樣三個',us&&tw&&usG.length===3&&J(usG.slice().sort())===J(CH[0].slice().sort()),J({us,tw,said:said().slice(0,5)}));
    const T1='幫子晴學姊測東西。同一個動作按一千次，看會不會壞。', T2='幫一個學姊測東西。同一個動作按一千次，看會不會壞。', all=J(FR);
    const pick=(term)=>{ const E=FR[term].kai; for(const o of E.opts) if(/\{子晴學姊\|一個學姊\}/.test(J(o.re))) return o.t; return null; };
    const p2=pick('Y2S1'), p4=pick('Y4S1'); const inSay=/\{子晴學姊\|一個學姊\}/.test(J(FR.Y2S1.kai.says));
    await dinner('kai','Y2S1','fallback',p2?[p2]:[],null,q6); const k1=has(T1)&&!has(T2); await dinner('kai','Y2S1','fallback',p2?[p2]:[]); const k2=has(T2)&&!has(T1);
    await dinner('kai','Y4S1','fallback',[p4],null,G=>{ G.events.done.ev_ziqing_secret_game=null; }); const k4=has('他們叫我寫測試。就是之前幫子晴學姊做的那種。這次有錢。');   /* 大四上那天已經過了 2027-10-06＝Q6 一定成立 */
    check('3. 阿凱 {子晴學姊|一個學姊}：大二上玩過子晴的遊戲（Q6）＝「子晴學姊」、沒有＝「一個學姊」；大四上（2027-10-06 以後 Q6 都成立）＝「子晴學姊」',(p2||inSay)&&k1&&k2&&!!p4&&k4,J({p2,p4,inSay,k1,k2,k4,said:said()})); });

  await sec(4,async()=>{ if(!ok0){ check('4. 效果、順序',false,'沒有 TERMEND_OPTS.FRIEND'); return; }
    const E=FR.Y1S1.heroine_01, lv=E.opts.find(o=>o.fx&&o.fx.love), f2=E.opts.find(o=>o.fx&&o.fx.fr===2);
    const fam=id=>+SOCIAL.rel(id).familiarity||0;
    if(lv){ const r=await dinner('heroine_01','Y1S1','friend',[lv.t]); check('4. 以安大一上有 love 的那個選項：她的戀愛 +'+lv.fx.love+'（一頓最多 +2）',r.dl===Math.min(2,lv.fx.love),J({dl:r.dl,fx:lv.fx})); }
    const mx=Math.max(...[].concat(...Object.values(FR).map(t=>[].concat(...Object.values(t).map(e=>e.opts.map(o=>(o.fx&&o.fx.love)||0)))))), mf=Math.max(...[].concat(...Object.values(FR).map(t=>[].concat(...Object.values(t).map(e=>e.opts.map(o=>(o.fx&&o.fx.fr)||0))))));
    check('4. 稿上的 fx：love 最多 +1、fr 最多 +2（朋友版規則）',mx<=1&&mf<=2,J({mx,mf}));
    const O=FR.Y2S2.zhe.opts; const p1=TERMEND.shuffled({day:600},'zhe',O,'Y2S2|friend'), p2=TERMEND.shuffled({day:600},'zhe',O,'Y2S2|friend'); const seen=new Set(); for(let d=600;d<640;d++) seen.add(TERMEND.shuffled({day:d},'zhe',O,'Y2S2|friend').map(o=>O.indexOf(o)).join(''));
    check('4. 選項順序洗過：同一天一樣、不同天會不一樣；效果跟著選項走',J(p1)===J(p2)&&seen.size>=4,[...seen].join(' '));
    await dinner('zhe','Y2S2','friend'); const g1=CH[0].slice(); const f0=fam('zhe'); await dinner('zhe','Y2S2','friend',[g1[1]]); const o=O.find(x=>x.t===g1[1]);
    check('4. 同一天演兩次順序一樣；選顯示的第二個＝它自己的回答',J(g1)===J(CH[0])&&flat(o.re).every(has),J({g1,g2:CH[0]}));
    const k0=TERMEND.SHUFFLE; TERMEND.SHUFFLE=false; try{ await dinner('zhe','Y2S2','friend'); } finally{ TERMEND.SHUFFLE=k0; } check('4. TERMEND.SHUFFLE=false＝照稿的順序',J(CH[0])===J(O.map(o=>o.t))); });

  await sec(5,async()=>{ if(!ok0){ check('5. 鉤子',false,'沒有 TERMEND_OPTS.FRIEND'); return; }
    await dinner('classmate_bohan','Y3S2','friend'); const hk=CH.find(c=>c.includes(Lx.HOOK_NO));
    check('5. 柏翰大三下：鉤子「七月開始補習，國考。」不念、直接出選項「我也想去聽一堂。」',FR.Y3S2.classmate_bohan.hookNoSay===true&&!has('七月開始補習，國考。')&&!!hk&&hk[0]==='「我也想去聽一堂。」'&&CH.length===2,J({ch:CH,said:said()}));
    await dinner('heroine_01','Y2S1','gf'); const hg=CH.find(c=>c.includes(Lx.HOOK_NO));
    check('5. 女朋友版以安大二上：鉤子「寒假我報了東京的冬季課。」不念、直接出選項「我也想報。」',has('寒假我去東京兩個禮拜。')&&!has('寒假我報了東京的冬季課。')&&!!hg&&hg[0]==='「我也想報。」',J({ch:CH,said:said()}));
    await dinner('heroine_01','Y2S1','friend'); const hf=CH.find(c=>c.includes(Lx.HOOK_NO));
    check('5. 其他鉤子照念（朋友版以安大二上：飯桌 → then →「寒假我報了東京的冬季課。」→ 選項）',has('寒假我報了東京的冬季課。')&&idx('寒假我報了東京的冬季課。')>idx('讀書會下學期的題目，我寒假會排好。')&&!!hf,J(said()));
    await dinner('heroine_02','Y2S1','friend',['「我想去。」']); check('5. 芷若大二上的鉤子照舊（say、選項、then「放映完隔天，我就回台中了。」）',has('店裡寒假想排一部老電影的放映。')&&has('放映完隔天，我就回台中了。'),J(said()));
    if(process.argv.includes('--hooks')){ const G={day:0,flags:{},events:{done:{}}}; console.log('\n鉤子的句子／那一頓的開頭（給 AA 對）');
      for(const term of Object.keys(Lx.HOOK)) for(const who of Object.keys(Lx.HOOK[term])){ const h=Lx.HOOK[term][who], e=(FR[term]||{})[who], g=TOx.GF[who]&&(TOx.GF[who].tableByTerm[term]||TOx.GF[who].table); const hs=TERMEND.flat(typeof h.say==='function'?h.say(G):h.say,G).join('');
        console.log([term,who,'鉤子：'+hs,'朋友版：'+(e?flat(e.says[e.says.length-1].say).concat(flat(e.then)).join('｜'):'（沒有）'),'女朋友版：'+(g?flat(g.says[g.says.length-1].say).join('｜'):'（沒有）')].join('\t')); } } });

  await sec(6,async()=>{ const ps='classmate_peishan';
    if(ok0){ const G=H.fresh(DAY.Y1S2,18.5); H.rel('heroine_01',65,50,45); SOCIAL.adjust('heroine_01',{npcRom:40}); H.said=[]; CH=[]; WANT=['（先不說）']; await TERMEND.dinner(GM,{te:{term:'Y1S2',who:'heroine_01',kind:'heart'}});
      const pl=poolOf('Y1S2','heroine_01').filter(has), auto=H.said.some(s=>s.who==='祐廷'&&Lx.REPLY.includes(s.t));
      check('6. 心意的飯（以安大一下）不再抽朋友的話題池、祐廷不自動回「嗯。」；飯桌那一句和選項照舊',pl.length===0&&!auto&&CH.some(c=>c.includes('（先不說）')),J({pl,auto,said:said().slice(0,6)})); }
    await dinner(ps,'Y1S2','friend'); const a=poolOf('Y1S2',ps).filter(has).length;
    /* 2026-11-11 改期望（PEISHAN-VOICE-1110，使用者 X327 沛珊重寫；AA_751@33a1769f8 的 friend_v2 五頓接進朋友版）：原本期望「沛珊（沒匯入）照原本：話題池的句子、沒有三個選項」*/
    check('6. 沛珊朋友版（AA_751）：三個選項、不抽話題池',a===0&&CH.some(c=>c.length===3)&&has('我報了營隊隊輔。'),J({a,ch:CH}));
    { const G=H.fresh(DAY.Y1S2,18.5); H.rel(ps,65,50,45); SOCIAL.adjust(ps,{npcRom:40}); H.said=[]; CH=[]; WANT=['（先不說）']; await TERMEND.dinner(GM,{te:{term:'Y1S2',who:ps,kind:'heart'}});
      /* 2026-11-11 改期望（SHE-FIRST-1110／PEISHAN-VOICE-1110，AA_751@33a1769f8）：沛珊心意的飯桌句換成兩句（原本 Lx.HEART[沛珊].table 那一句）；她的朋友版匯入以後，心意的飯也不再抽話題池（原本「話題池還在」）*/
      check('6. 沛珊心意的飯：飯桌兩句換成重寫的、不再抽話題池',poolOf('Y1S2',ps).filter(has).length===0&&has('你今天話好少。')&&has('平常這個時候，你已經被我鬧到翻白眼了。'),J(said().slice(0,6))); }
    const keep=globalThis.TERMEND_OPTS; globalThis.TERMEND_OPTS=keep?Object.assign({},keep,{FRIEND:undefined}):keep;
    try{ await dinner('zhe','Y1S1','friend'); const p=poolOf('Y1S1','zhe').filter(has).length, auto=H.said.some(s=>s.who==='祐廷'&&Lx.REPLY.includes(s.t));
      check('6. 沒有 TERMEND_OPTS.FRIEND（舊資料）：朋友版照原本的話題池、祐廷照回',p>=2&&auto&&!CH.some(c=>c.length===3),J({p,auto,ch:CH}));
      await dinner('classmate_bohan','Y3S2','friend'); check('6. 沒有 TERMEND_OPTS.FRIEND：柏翰大三下的鉤子照念',has('七月開始補習，國考。')); } finally { globalThis.TERMEND_OPTS=keep; }
    const G=H.fresh(DAY.Y2S2,18.5); delete G.termend; H.rel('zhe',65,50,45); H.said=[]; CH=[]; WANT=[]; let err=null; try{ await TERMEND.dinner(GM,{te:{term:'Y2S2',who:'zhe',kind:'friend'}}); }catch(e){ err=String(e); }
    const back=JSON.parse(J(G)); check('6. 舊存檔（沒有 G.termend）照演、可以序列化；存檔沒有新欄位（只有原本的 done）',!err&&J(Object.keys(back.termend.Y2S2))===J(['done']),err||J(Object.keys(back.termend.Y2S2))); });
  /* thenIf（企劃線 1cf434dee）：學姊大三上朋友版——選項演完以後，朋友以上（SIS_FU）才補「收到信那天，我打給你。」*/
  await sec(7,async()=>{ if(!ok0){ check('7. thenIf',false,'沒有 TERMEND_OPTS.FRIEND'); return; }
    const E=FR.Y3S1.heroine_05, L='收到信那天，我打給你。'; let doc=null; try{ doc=JSON.parse(cp.execFileSync('git',['show','bd1a6fda3:docs/story_planning/AA_749_termend_friend_v2_Y3S1.json'],{cwd:H.ROOT,encoding:'utf8'})); }catch(e){ doc=null; }
    /* 2026-11-11 改期望：白名單的來源換成 bd1a6fda3（AA 改斷句的那一版；學姊這一格的字沒有動）——原本 1cf434dee */
    check('7. 資料：學姊大三上 thenIf｛if SIS_FU, lines 照稿｝；來源 bd1a6fda3；其他人沒有 thenIf',!!doc&&J(E.thenIf)===J({if:'SIS_FU',lines:doc.Y3S1.heroine_05.thenIf.lines})&&J(E.thenIf.lines)===J([L])&&TOx.src.friend.includes('docs/story_planning/AA_749_termend_friend_v2_Y3S1.json@bd1a6fda3')&&Object.keys(FR).every(t=>Object.keys(FR[t]).every(w=>(t==='Y3S1'&&w==='heroine_05')||FR[t][w].thenIf===undefined)),J(E.thenIf));
    const keep=Lx.COND.SIS_FU; const last=()=>{ const g=CH[0]||[], o=E.opts.find(x=>x.t===g[0]); return o?flat(o.re).slice(-1)[0]:null; };
    try{ Lx.COND.SIS_FU=()=>true; await dinner('heroine_05','Y3S1','friend'); const r=last();
      check('7. 朋友以上（SIS_FU）：選項、她的回答之後補「收到信那天，我打給你。」（只說一次、在收尾之前）',has('面試的事，今天不講。')&&CH[0].length===3&&said().filter(t=>t===L).length===1&&!!r&&idx(L)===idx(r)+1,J(said()));
      Lx.COND.SIS_FU=()=>false; await dinner('heroine_05','Y3S1','friend'); check('7. 還沒到朋友：不補那一句',has('面試的事，今天不講。')&&CH[0].length===3&&!has(L),J(said())); } finally{ Lx.COND.SIS_FU=keep; }
    const G=H.fresh(DAY.Y3S1,18.5); H.rel('heroine_05',65,50,45); const st=SOCIAL.stage('heroine_05'), fu=SOCIAL.STAGES.indexOf(st)>=SOCIAL.STAGES.indexOf('FRIEND');
    check('7. 條件＝termend_lines.js 原本那一句的 SIS_FU（朋友以上；交往中也算）',typeof keep==='function'&&TERMEND.optIf(G,'SIS_FU','Y3S1')===fu&&(G.flags.dating_heroine_05=true,TERMEND.optIf(G,'SIS_FU','Y3S1'))===true,J({st,fu})); });
  H.done();
})();
