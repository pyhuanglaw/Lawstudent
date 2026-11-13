// 校外約會選項的效果（友情／愛情）照 AA 的稿進遊戲（X324 最後一塊；AA 11-11 19:03 交，企劃線 52c3ee258）——不需要瀏覽器（D131）。
// 使用者 11-10 20:0x（對 AA）：「每次約會都要有選擇性的對話選項，依據選項內容增加友情或者愛情」；機制在 tests/dlg_fx_mech_1110_unit.js（AA_746 第 2 節 S.optFx）。
// AA 19:03：「請照 AA_746 第 2 節 S.optFx 重匯；date_rewrite 那層只換字，fx 不會被蓋掉，匯完麻煩確認一下以安 D01 選了以後友情／愛情有動。」
// 檢查：
//   1. 白名單 D01～D33 都是 C.ALLOW_SHA（52c3ee258）、approved；加 fx 以前那一版 C.FX_PREV（248c8e390）在 history；date_lines.js 的來源寫著 @ALLOW_SHA
//   2. 稿裡每一個 fx（33 個地點、七位）都在遊戲資料同一個位置、值一樣；遊戲資料沒有稿以外的 fx；至少 1765 個
//   3. 稿把 fx 拿掉＝加 fx 以前那一版（248c8e390）一字不差（AA 只加 fx、沒改字）
//   4. 以安 D01 展覽區（第一次）：選「妳猜什麼？」（fx love 1）＝她的戀愛比不加 fx 多 1、熟悉信任不變；選「錯了也好。」（fx fr 1）＝熟悉、信任各多 1、戀愛不變
// 稿讀 git show；讀不到（淺層複本）＝第 1、4 項照做，第 2、3 項跳過並印出來。用法：node tests/date_fx_x324_1111_unit.js
const H=require('./pg_harness.js');
const {check,GM}=H; const J=JSON.stringify;
const fs=require('fs'), path=require('path'), cp=require('child_process');
const C=require('./date_src_sha.js'), SP='docs/story_planning/';
const read=f=>fs.readFileSync(path.join(H.ROOT,f),'utf8');
const show=(sha,f)=>{ try{ return cp.execFileSync('git',['-C',H.ROOT,'show',sha+':'+f],{encoding:'utf8',maxBuffer:64<<20,stdio:['ignore','pipe','ignore']}); }catch(e){ return null; } };
const DL=t=>JSON.parse(t.slice(t.indexOf('const DATE_LINES=')+17,t.lastIndexOf(';')));
const NOW=DL(read('src/data/date_lines.js'));
const LOCS=Array.from({length:33},(_,i)=>'D'+String(i+1).padStart(2,'0'));
const walk=(o,p,out)=>{ if(o&&typeof o==='object') for(const k of Object.keys(o)){ if(k==='fx') out.push([p,o.fx]); else walk(o[k],p+'/'+k,out); } return out; };
const get=(o,p)=>{ for(const k of p.split('/').filter(Boolean)) o=o==null?o:o[k]; return o; };
let WANT=[]; GM.choose=async o=>{ const T=o.map(q=>q.t||q.text); for(const w of WANT){ const k=T.findIndex((t,i)=>t===w&&!o[i].dim); if(k>=0) return k; } return 0; };
GM.money=d=>{ H.G.money+=d; };
let ADJ=[]; { const a0=SOCIAL.adjust; SOCIAL.adjust=function(id,d){ ADJ.push([id,Object.assign({},d)]); return a0.apply(this,arguments); }; }
const sum=(id,k)=>ADJ.filter(([w,d])=>w===id&&d[k]!=null).reduce((a,[,d])=>a+d[k],0);
(async()=>{
  // 1
  const allow=JSON.parse(read('docs/handoff/story_import_allow.json')).files;
  const bad=LOCS.filter(k=>{ const e=allow.filter(x=>x.path===SP+'date_system/lines/'+k+'.json'); return !(e.length===1&&e[0].sha===C.ALLOW_SHA&&e[0].status==='approved'&&!!e[0].approvedBy&&(e[0].history||[]).some(h=>h.sha===C.FX_PREV)); });
  check('1. 白名單 D01～D33 都是 '+C.ALLOW_SHA+'、approved；加 fx 以前的 '+C.FX_PREV+' 在 history',C.ALLOW_SHA==='4539b2ebaf'&&C.KX938_1113_PREV==='e622a59148'&&C.KX932_1112_PREV==='6dbfe10d7e'&&C.KX921_1112_PREV==='dce2f8c08b'&&C.PS914_1112_PREV==='f561545f38'&&C.PS913_1112_PREV==='6221c8e80f'&&C.ZQ909_1112_PREV==='417c5cb9ce'&&C.ZR904_1112_PREV==='5afc5c0e3'&&C.KXNL_1112_PREV==='f6aa917593'&&C.D158_1112_PREV==='3cb2939d0'&&C.HAO3_1112_PREV==='d7d818f8a8'&&C.HAO2_1112_PREV==='41f77eab53'&&C.HAO_1112_PREV==='a573a50dca'&&C.SIS_1112_PREV==='b22e4d1277'&&C.AN_1112_SHA==='b84e779563'&&C.KX_1112_FIX_SHA==='74e0421b8'&&C.KX_1112_SHA==='07d50af2f7'&&C.KX_1112_PREV==='52c3ee258'&&C.FX_PREV==='248c8e390'&&bad.length===0,J(bad));   /* 2026-11-12 再換 6d503411c1（AA_834 以安第三批：再改以安 27 格的字、fx 沒動；b84e779563＝C.AN_1112_SHA）。舊期望：C.ALLOW_SHA==='b84e779563' */   /* 2026-11-12 再換 b84e779563（AA_832 以安第一批：只改以安 32 格的字、fx 沒動，見 date_src_sha.js AN_1112；74e0421b8＝C.KX_1112_FIX_SHA）。舊期望：C.ALLOW_SHA==='74e0421b8' */   /* 2026-11-12 再換 74e0421b8（AA 06:57：只改 D23 海堤可昕一句的字、fx 沒動；07d50af2f7＝C.KX_1112_SHA）。舊期望：C.ALLOW_SHA==='07d50af2f7' */   /* 2026-11-12（X324 可昕續改，AA_819＋AA_822）：白名單 D01～D33 換 07d50af2f7（只改可昕 72 格的字、fx 沒動）；加 fx 的那一版 52c3ee258＝C.KX_1112_PREV。舊期望：C.ALLOW_SHA==='52c3ee258' */   /* 2026-11-12（X324 學姊續改 AA_837＋AA_838@a573a50dca）：白名單再換 a573a50dca（學姊 78 格換字＋D01 交往到達多一套、沒有 fx；fx 沒動）。舊期望：C.ALLOW_SHA==='b22e4d1277' */   /* 2026-11-12（X324「好」開頭回話 AA_842～845@41f77eab53）：白名單再換 41f77eab53（只動學姊、語彤、沛珊、芷若第一次選項的回話 259 格，見 date_src_sha.js HAO_1112）；a573a50dca＝C.HAO_1112_PREV。舊期望：C.ALLOW_SHA==='a573a50dca' */   /* 2026-11-12（X324 第三次重匯 AA_846～848@d7d818f8a8，date_src_sha.js HAO2_1112）：白名單再換 d7d818f8a8（子晴 81、可昕 83 格選項回話、語彤 66 格再訪句、學姊 5／芷若 2／沛珊 1 格再改，共 238 格）；41f77eab53＝C.HAO2_1112_PREV。舊期望：C.ALLOW_SHA==='41f77eab53' */   /* 2026-11-12（X324 第四次重匯 3cb2939d0，date_src_sha.js HAO3_1112）：白名單再換 3cb2939d0（沛珊「今天」開頭 31 格、以安 D24.station 1 格、子晴 D06.cafe 1 格、可昕 D13.drink／D24.street 2 格，共 35 格）；d7d818f8a8＝C.HAO3_1112_PREV。舊期望：C.ALLOW_SHA==='d7d818f8a8' */   /* 2026-11-12（D158 約會台詞重匯 AA_860@f6aa917593，date_src_sha.js D158_1112）：白名單再換 f6aa917593（可昕 45 格、沛珊 4 格重寫，逐格在 tests/d158_dates_1112_unit.js）；3cb2939d0＝C.D158_1112_PREV。舊期望：C.ALLOW_SHA==='3cb2939d0' */   /* 2026-11-12（可昕不靠記帳 AA_869～871@5afc5c0e3，date_src_sha.js KXNL_1112）：白名單再換 5afc5c0e3（只動可昕 137 格，逐格在 tests/kxnl_dates_1112_unit.js）；f6aa917593＝C.KXNL_1112_PREV。舊期望：C.ALLOW_SHA==='f6aa917593' */   /* 2026-11-12（芷若再去一次 AA_904@417c5cb9ce，date_src_sha.js ZR904_1112）：白名單再換 417c5cb9ce（只動芷若 remember 58 格，逐格在 tests/zr904_dates_1112_unit.js）；5afc5c0e3＝C.ZR904_1112_PREV。舊期望：C.ALLOW_SHA==='5afc5c0e3' */   /* 2026-11-12（子晴到達句 AA_909@6221c8e80f，date_src_sha.js ZQ909_1112）：白名單再換 6221c8e80f（只動子晴 8 格）；417c5cb9ce＝C.ZQ909_1112_PREV。舊期望：C.ALLOW_SHA==='417c5cb9ce' */   /* 2026-11-12（沛珊收尾 AA_913@f561545f38，date_src_sha.js PS913_1112）：白名單再換 f561545f38（只動沛珊 42 格）；6221c8e80f＝C.PS913_1112_PREV。舊期望：C.ALLOW_SHA==='6221c8e80f' */   /* 2026-11-12（沛珊再訪 AA_914@dce2f8c08b，date_src_sha.js PS914_1112）：白名單再換 dce2f8c08b（只動沛珊 53 格）；f561545f38＝C.PS914_1112_PREV。舊期望：C.ALLOW_SHA==='f561545f38' */
  check('1. date_lines.js 的來源寫著 33 個地點 @'+C.ALLOW_SHA,LOCS.every(k=>NOW.source.includes(k+'.json@'+C.ALLOW_SHA)),NOW.source.slice(0,200));
  // 2、3
  const SRC={}, OLD={}; for(const k of LOCS){ const t=show(C.ALLOW_SHA,SP+'date_system/lines/'+k+'.json'), u=show(C.FX_PREV,SP+'date_system/lines/'+k+'.json'); if(t) SRC[k]=JSON.parse(t); if(u) OLD[k]=JSON.parse(u); }
  if(Object.keys(SRC).length===33&&Object.keys(OLD).length===33){
    let n=0; const miss=[], diff=[];
    for(const k of LOCS) for(const [p,fx] of walk(SRC[k].lines,'',[])){ n++; const g=get(NOW.loc[k]&&NOW.loc[k].lines,p+'/fx'); if(g===undefined) miss.push(k+p); else if(J(g)!==J(fx)) diff.push(k+p+'：'+J(fx)+' → '+J(g)); }
    const all=walk(NOW,'',[]);
    check('2. 稿裡的 fx（'+n+' 個）每一個都在遊戲資料同一個位置、值一樣；遊戲資料的 fx 一共也是 '+n+' 個（沒有稿以外的）；至少 1765 個',n>=1765&&!miss.length&&!diff.length&&all.length===n,J({n,all:all.length,miss:miss.slice(0,5),diff:diff.slice(0,5)}));
    const txt=LOCS.filter(k=>J(C.src248(k,SRC[k]))!==J(OLD[k]));   /* 2026-11-12（AA_819＋AA_822@07d50af2f7）：可昕 72 格之後換了字——src248 還原那 72 格再比（date_src_sha.js KX_1112）。舊寫法：C.noFx(SRC[k]) */
    check('3. 稿把 fx 拿掉（可昕 11-12 續改的 72 格、以安 AA_832＋AA_834 的 59 格還原）＝'+C.FX_PREV+' 一字不差（只加 fx、沒改字）',!txt.length,J(txt));
    const kinds=new Set(all.map(([,fx])=>Object.keys(fx).filter(x=>fx[x]).sort().join('+')));
    check('2. fx 只有 fr、love 兩種鍵（S.optFx／SOCIAL.applyFx 認得的）',all.every(([,fx])=>Object.keys(fx).every(x=>x==='fr'||x==='love')&&Object.values(fx).every(v=>Number.isInteger(v))),J([...kinds]));
  } else console.log('（跳過第 2、3 項：讀不到 '+C.ALLOW_SHA+'／'+C.FX_PREV+' 的源稿，企劃線沒 fetch）');
  // 4. 以安 D01 展覽區第一次的兩個選項
  const who='heroine_01', loc='D01', pid='D01.expo', LN=DATE_LINES.loc[loc].lines[who], F=LN.hotspots[pid].first, keep=J(F.choice);
  const c0=F.choice[0], c1=F.choice[1], pn=DATE.points(loc).find(p=>p.id===pid).name;
  check('4. 以安 D01 展覽區第一次：「妳猜什麼？」fx love 1、「錯了也好。」fx fr 1（照稿）',c0.t==='「妳猜什麼？」'&&J(c0.fx)===J({love:1})&&c1.t==='「錯了也好。」'&&J(c1.fx)===J({fr:1}),J([c0.t,c0.fx,c1.t,c1.fx]));
  const day=STORY.termDay('Y1S2',5,6);
  const go=async want=>{ const G=H.fresh('2026-03-01',9); G.day=day; G.weekday=6; G.money=50000; H.rel(who,65,50,45);
    const b=DATE.book(G,{who,locs:[loc],transport:'mrt',day:G.day,depart:15}); const q=OUT.get(G,'date_'+b.trip); G.hour=15; H.said=[]; ADJ=[];
    WANT=['出發','自己選',pn,want,'差不多了，回去吧']; await OUT.prompt(GM,q);
    return {rom:sum(who,'npcRom'),fam:sum(who,'fam'),trust:sum(who,'trust'),said:H.said.some(s=>s.t===(want===c0.t?'我猜是在講等待。他說是在講被打斷。':'嗯。下次我先看說明。'))}; };
  try{
    const a=await go(c0.t), b=await go(c1.t);
    delete c0.fx; delete c1.fx; const a0=await go(c0.t), b0=await go(c1.t);
    check('4. 選「妳猜什麼？」：她的戀愛比沒有 fx 多 1；熟悉、信任不變；她回的那句有說',a.said&&a.rom===a0.rom+1&&a.fam===a0.fam&&a.trust===a0.trust,J({a,a0}));
    check('4. 選「錯了也好。」：熟悉、信任各比沒有 fx 多 1；戀愛不變；她回的那句有說',b.said&&b.fam===b0.fam+1&&b.trust===b0.trust+1&&b.rom===b0.rom,J({b,b0}));
  } finally { F.choice=JSON.parse(keep); }
  H.done();
})().catch(e=>{ console.log('FAIL 例外：'+(e&&e.stack||e)); process.exit(1); });
