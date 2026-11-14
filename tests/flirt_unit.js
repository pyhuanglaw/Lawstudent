// 說點不一樣的（撩妹選項；GIFT-FLIRT-1107，USER_WANTS X262；台詞 AA_711 09e3a8d03）——不需要瀏覽器（D131）。
// 使用者 11-07 試玩：「也沒有撩妹對話可以選」
// 檢查：0 匯入一致；1 當面說話多「（說點不一樣的）」（STORY.TALK_OPTS）；2 階段夠＝ok、不夠＝early，好感照稿；3 一天一次；4 說過的那句這學期不再出現、學期換了又可以；5 舊存檔不丟例外
// 修改前全部 FAIL（沒有 FLIRT）。用法：node tests/flirt_unit.js
const H=require('./pg_harness.js');
const {check,GM}=H;
const fs=require('fs'), path=require('path'), vm=require('vm'), cp=require('child_process');
const loadG=(f,names)=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let s=fs.readFileSync(p,'utf8'); for(const n of names) s=s.replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'='); vm.runInThisContext(s,{filename:f}); return true; };
const ok1=loadG('src/data/flirt_lines.js',['FLIRT_LINES']), ok2=loadG('src/flirt3d.js',['FLIRT']);
const said=()=>H.said.map(s=>s.t); const J=JSON.stringify;
const stageOf={}; const DS=DATE.stageNum; DATE.stageNum=id=>stageOf[id]!=null?stageOf[id]:DS(id);
(async()=>{
  { let out='', ok=false; try{ out=cp.execFileSync('python3',[path.join(H.ROOT,'tools/story/import_flirt.py'),'--check'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}); ok=/^OK/.test(out); }catch(e){ out=String(e.stderr||e.message); }
    check('0. src/data/flirt_lines.js 和 AA_711@09e3a8d03 一致（import_flirt.py --check）；七位各 5 則',ok1&&ok2&&ok&&Object.values(FLIRT_LINES.people).every(L=>L.length===5),out.trim().slice(0,200)); }
  if(!ok2){ H.done(); return; }
  const id='heroine_01', T=FLIRT_LINES.people[id], who={name:'沈以安',charId:id};
  { const G=H.fresh('2025-10-15',15,'campus'); stageOf[id]=4;
    const O=FLIRT.talkOpts(G,id); check('1. 當面說話：多「（說點不一樣的）」',O.length===1&&O[0].t==='（說點不一樣的）',J(O.map(x=>x.t)));
    check('1. 掛在 STORY.TALK_OPTS',STORY.TALK_OPTS.some(f=>{ try{ return (f(G,id,GM)||[]).some(x=>x.t==='（說點不一樣的）'); }catch(e){ return false; } }));
    H.said=[]; H.opts=[]; H.picks=[0]; const r0=Object.assign({},SOCIAL.rel(id)); const res=await FLIRT.run(GM,who,id); const r1=SOCIAL.rel(id), e=T[0];
    check('2. 列這學期還沒說過的前 3 句＋算了；選第 1 句（need '+e.need+'，現在階段 4）＝ok、祐廷先說那一句、好感照稿',J([...H.opts[0]])===J(T.slice(0,3).map(x=>x.t).concat('算了'))&&res==='ok'&&said()[0]===e.t&&said().includes(e.ok.lines[0])&&Object.keys(e.ok.rel).every(k=>((r1[k]||0)-(r0[k]||0))===e.ok.rel[k]),J({res,said:said(),opts:H.opts[0]}));
    check('3. 同一天：不再出現',FLIRT.talkOpts(G,id).length===0);
    G.day+=1; H.picks=[0]; H.opts=[]; await FLIRT.run(GM,who,id); check('4. 隔天：第 1 句不再列（這學期說過）',!H.opts[0].includes(T[0].t)&&H.opts[0].includes(T[1].t),J(H.opts[0]));
    const t0=CALENDAR.termOf(G.day).id; let d=G.day; while(CALENDAR.termOf(d)&&CALENDAR.termOf(d).id===t0) d++; while(!CALENDAR.termOf(d)) d++; G.day=d; H.opts=[]; H.picks=['算了'];
    await FLIRT.run(GM,who,id); check('4. 下一個學期：又從第 1 句列；選「算了」不算一天一次',H.opts[0][0]===T[0].t&&FLIRT.talkOpts(G,id).length===1,J(H.opts[0])); }
  { const G=H.fresh('2025-10-15',15,'campus'); stageOf[id]=1; const k=T.findIndex(x=>x.need>=5); H.said=[]; H.picks=[T[k].t]; const r0=Object.assign({},SOCIAL.rel(id));
    for(let i=0;i<k&&i<2;i++) FLIRT.used(G,id).push(i);   /* 讓 need 5 那則出現在前 3 句 */
    const res=await FLIRT.run(GM,who,id); const e=T[k], r1=SOCIAL.rel(id);
    check('2. 太早說（階段 1、need '+e.need+'）＝early、好感照 early 那一格',res==='early'&&said().includes(e.early.lines[0])&&Object.keys(e.early.rel).every(k2=>((r1[k2]||0)-(r0[k2]||0))===Math.max(-(r0[k2]||0),e.early.rel[k2])),J({res,said:said(),rel:e.early.rel})); }
  { const G=H.fresh('2025-10-15',15,'campus'); delete G.flags.FLIRT; let err=null; try{ FLIRT.talkOpts(G,'heroine_02'); }catch(x){ err=x; } check('5. 舊存檔不丟例外',!err,String(err)); }
  { const G=H.fresh('2025-10-15',15,'campus'); const KX=FLIRT_LINES.people.kexin||[], gone=KX.filter(e=>e.gone);   /* CANON-NO-ECON-1112（AA_897）：AA 拿掉的那兩句留位置、不給選 */
    check('6. 可昕：AA_897 拿掉的兩句，第 4 句 AA 補了新句（2026-11-12 CANON-NO-ECON-1112 第五批，AA_711@6dbfe10d7e：「期末那幾天，有妳傳的「還沒睡？」，我才撐下去的。」），剩一句標 gone、不在可以選的句子裡；其他人的句子沒有 gone（舊期望兩句 gone）',gone.length===1&&!!KX[4]&&!KX[4].gone&&KX[4].t==='期末那幾天，有妳傳的「還沒睡？」，我才撐下去的。'&&!FLIRT.left(G,'kexin').some(([e])=>e.gone)&&FLIRT.left(G,'kexin').length===KX.length-1&&Object.keys(FLIRT_LINES.people).filter(k=>k!=='kexin').every(k=>!FLIRT_LINES.people[k].some(e=>e.gone)),J(gone.map(e=>e.need))); }
  H.done();
})().catch(e=>{ console.error(e); console.log('FAILED (exception)'); process.exit(1); });
