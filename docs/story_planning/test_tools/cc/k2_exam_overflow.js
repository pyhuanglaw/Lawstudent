#!/usr/bin/env node
/* CC K2：考題在手機上會不會溢出（估算，不是實測）
   用法：
     node docs/story_planning/test_tools/cc/k2_exam_overflow.js <src 所在的根目錄> [--json out.json]
     例：git archive <SHA> src index.html | tar -x -C /tmp/x ; node k2_exam_overflow.js /tmp/x
   做什麼：
     讀 <root>/src/data/exam_bank.js（EXAM_BANK）、<root>/src/data/legal_qbank.js（QBANK），
     照 index.html／adv3d.js 的 CSS 與 game3d.js renderChoose 的「留著上一句」邏輯，模擬每一題在
     手機直向 390×844、橫向 844×390（以及有 safe-area、Safari 工具列的版本）上：
       題幹（#dlgText 16px／行高 1.6，寬＝#dlg 寬−34）幾行、多高；
       選項按鈕（#choices button 15px／行高 1.4，padding 10/14，min-height 46）幾行、多高；
       1) 留著題目（keep）時選單的 max-height 放不放得下 → 放不下＝題目被收掉（只剩選項）；
       2) 題目收掉以後選單 max-height 放不放得下 → 放不下＝要捲動（底部淡出提示）。
   假設：中文、全形標點寬＝font-size；ASCII 字母數字≈0.55em、空白≈0.28em；英文單字不斷字、中文任意斷行；
         行首禁則（，。、；：？！）」』）不能在行首）＝把前一字帶下去。字型：iPhone 用 PingFang TC（Noto Sans TC 載不到時的 fallback）。
   輸出：stdout 的 Markdown 摘要；--json 輸出每題明細。 */
'use strict';
const fs=require('fs'), vm=require('vm'), path=require('path');
const root=process.argv[2]; if(!root){ console.error('用法：node k2_exam_overflow.js <root> [--json out.json]'); process.exit(2); }
const jsonOut=(()=>{ const i=process.argv.indexOf('--json'); return i>0?process.argv[i+1]:null; })();
const ctx={}; vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root,'src/data/exam_bank.js'),'utf8')+';this.EB=EXAM_BANK;',ctx);
vm.runInContext(fs.readFileSync(path.join(root,'src/data/legal_qbank.js'),'utf8')+';this.QB=QBANK;',ctx);
const EB=ctx.EB, QB=ctx.QB;
const NAMES={crimpro:'刑事訴訟法',company_law:'公司法',negotiable:'票據法',civpro_1:'民事訴訟法（上）',civpro_2:'民事訴訟法（下）'};
for(const k in EB.courseMap) NAMES[k]=EB.courseMap[k].name||NAMES[k];
const cname=id=>NAMES[id]||id;

// ---------- 字寬與斷行 ----------
const NOSTART='，。、；：？！）」』〕】》〉…‥,.;:?!)';
function cw(ch,fs){ const c=ch.codePointAt(0); if(c<0x80){ if(ch===' ') return 0.28*fs; return 0.55*fs; } if(c>=0xFF61&&c<=0xFF9F) return 0.5*fs; return fs; }
function tokens(s){ const out=[]; let i=0; while(i<s.length){ const ch=s[i]; if(/[A-Za-z0-9'’\-]/.test(ch)){ let j=i; while(j<s.length&&/[A-Za-z0-9'’\-.,;:?!)]/.test(s[j])) j++; out.push(s.slice(i,j)); i=j; } else { out.push(ch); i++; } } return out; }
function lines(s,width,fs){ if(!s) return 1; let n=1, cur=0, last=null; for(const t of tokens(s)){ let w=0; for(const ch of t) w+=cw(ch,fs);
    if(cur+w<=width+0.01){ cur+=w; last=t; continue; }
    if(t===' '){ cur=0; n++; last=null; continue; }
    if(t.length===1&&NOSTART.includes(t)&&last&&last.length===1){ n++; cur=cw(last,fs)+w; last=t; continue; }   /* 行首禁則：前一字一起帶下去 */
    if(w>width){ // 超長英文字：硬斷
      let rem=w; n++; while(rem>width){ rem-=width; n++; } cur=rem; last=t; continue; }
    n++; cur=w; last=t; }
  return n; }

// ---------- 版面參數（index.html 第 32–43 行、adv3d.js 第 39–44 行）----------
const DLG={fs:16,lh:16*1.6,minText:52,padV:12+14,border:2,padH:16*2};
const BTN={fs:15,lh:15*1.4,padV:20,padH:28,border:2,min:46,gap:8};
const PROFILES=[
  {id:'P0',name:'直向 390×844（Playwright，safe-area 0）',W:390,H:844,st:0,sb:0,sl:0,sr:0},
  {id:'L0',name:'橫向 844×390（Playwright，safe-area 0）',W:844,H:390,st:0,sb:0,sl:0,sr:0},
  {id:'Pr',name:'直向 390×844（iPhone 瀏海機 safe-area 上47 下34，全螢幕）',W:390,H:844,st:47,sb:34,sl:0,sr:0},
  {id:'Lr',name:'橫向 844×390（iPhone safe-area 左右47 下21，全螢幕）',W:844,H:390,st:0,sb:21,sl:47,sr:47},
  {id:'Ls',name:'橫向 844×340（Safari 有網址列的估計高度，safe-area 左右47 下21）',W:844,H:340,st:0,sb:21,sl:47,sr:47},
];
const portrait=p=>p.H>p.W;
function dlgBox(p,text,named){ const w=Math.min(760,p.W-28); const tw=w-DLG.padH-DLG.border; const n=lines(text,tw,DLG.fs); const th=Math.max(DLG.minText,n*DLG.lh); return {w,tw,n,h:DLG.padV+DLG.border+th+(named?24:0)}; }
/* 選項區：mode 'seat'（3D 座位上考＝不是 ADV）、'adv'（門口上課、研究所考試、讀書會＝ADV）*/
function choicesBox(p,mode,opts){ const grid=mode==='adv'&&!portrait(p)&&opts.length>=4;
  let w; if(mode==='adv') w=portrait(p)?p.W-28:(grid?Math.min(p.W-28,860):Math.min(400,p.W-28)); else w=Math.min(400,p.W-28);
  const colW=grid?(w-BTN.gap)/2:w, tw=colW-BTN.padH-BTN.border;
  const hs=opts.map(t=>{ const n=lines(t,tw,BTN.fs); return {n,h:Math.max(BTN.min,n*BTN.lh+BTN.padV+BTN.border)}; });
  let h; if(grid){ h=0; for(let i=0;i<hs.length;i+=2) h+=Math.max(hs[i].h,(hs[i+1]||{h:0}).h); h+=BTN.gap*(Math.ceil(hs.length/2)-1); } else h=hs.reduce((a,b)=>a+b.h,0)+BTN.gap*(hs.length-1);
  /* 水平：ADV 橫向 grid 的 left=max(14,safe-left)、width=100%−28 → 右緣可能超出畫面 */
  let left; if(mode==='adv'&&!portrait(p)&&grid) left=Math.max(14,p.sl); else if(mode==='adv') left=Math.max(14,p.sl); else left=p.W-Math.max(14,p.sr)-w;
  const right=left+w, hOver=Math.max(0,right-(p.W-p.sr)), offScreen=Math.max(0,right-p.W);
  return {w,tw,grid,hs,h,maxLines:Math.max(...hs.map(x=>x.n)),left,right,hOver,offScreen}; }
function evalQ(p,mode,qText,opts,named){ const d=dlgBox(p,qText,named), c=choicesBox(p,mode,opts); const sbm=Math.max(14,p.sb);
  const keepMax=p.H-58-p.st-(d.h+22);                                           /* game3d.js renderChoose：留著題目時的 maxHeight */
  const fullMax=mode==='adv'?p.H-sbm-8-58-p.st:p.H-40;                          /* 題目收掉以後：CSS 的 max-height */
  const keep=c.h<=keepMax+4;                                                    /* scrollHeight > clientHeight+4 才收 */
  const scroll=!keep&&c.h>fullMax+4;
  const sayFit=d.h<=p.H-sbm-58-p.st;                                            /* 題目那一句本身（點之前）放不放得下 */
  return {dl:d.n,dh:Math.round(d.h),cl:c.hs.map(x=>x.n),ch:Math.round(c.h),keepMax:Math.round(keepMax),fullMax:Math.round(fullMax),keep,hideQ:!keep,scroll,over:scroll?Math.round(c.h-fullMax):0,short:keep?0:Math.round(c.h-keepMax),sayFit,grid:c.grid,hOver:Math.round(c.hOver),offScreen:Math.round(c.offScreen)}; }

// ---------- 題目 ----------
const items=[];
for(const q of EB.questions) items.push({src:'EXAM_BANK',id:q.id,course:q.course,term:q.term,status:q.status,type:q.type,q:q.q,options:q.options});
for(const q of QB) if(q.complete!==false) items.push({src:'QBANK',id:q.id,course:'crimpro',term:'Y3S1',status:'USER(QBANK)',type:q.type,q:q.q,options:q.options});
const optTexts=q=>q.type==='tf'||!q.options?['對','錯']:Object.keys(q.options).map(k=>'（'+k+'）'+q.options[k]);
/* 場景：期末考（座位＝非 ADV／門口＝ADV）用「1／5　」前綴；研究所一試（ADV）「12／20　」；課堂提問（座位或門口）不加前綴 */
const SCEN=[{id:'exam_seat',mode:'seat',pre:'5／5　'},{id:'exam_adv',mode:'adv',pre:'5／5　'},{id:'bar_adv',mode:'adv',pre:'20／20　'}];
const rows=[];
for(const it of items){ const opts=optTexts(it); const qlen=[...it.q].length, olen=opts.map(o=>[...o].length);
  const r={...it,qlen,olen,maxOpt:Math.max(...olen),sumOpt:olen.reduce((a,b)=>a+b,0),res:{}};
  for(const p of PROFILES) for(const s of SCEN) r.res[p.id+'/'+s.id]=evalQ(p,s.mode,s.pre+it.q,opts,false);
  rows.push(r); }

// ---------- QBANK 讀書會／課堂／同學（legal3d.js L.ask：ADV、有說話者名字；選項 '「A，…。」'＋「……不確定。」；留在畫面上的是「選項列表」那一句或判斷題那一句）----------
const askRows=[];
for(const q of QB){ if(q.complete===false) continue; let kept, opts;
  if(q.type==='tf'){ kept='「'+q.q.replace(/。$/,'')+'——這句話對不對？祐廷，你說。」'; opts=['「對。」','「不對。」','「……我不確定。」']; }
  else { kept='「'+['A','B','C','D'].map(k=>k+'、'+q.options[k]).join('；')+'。祐廷，你選哪個？」'; opts=['A','B','C','D'].map(k=>'「'+k+'，'+q.options[k]+'。」').concat(['「……不確定。」']); }
  const res={}; for(const p of PROFILES) res[p.id]=evalQ(p,'adv',kept,opts,true); askRows.push({id:q.id,type:q.type,kept,res}); }

// ---------- 輸出 ----------
const out=[]; const P=s=>out.push(s);
P('受測檔案根目錄：'+root); P('題目數：EXAM_BANK '+EB.questions.length+'、QBANK（complete）'+QB.filter(q=>q.complete!==false).length);
P('\n## 1. 各情境統計（題目被收掉＝留著題目時選項放不下；要捲動＝題目收掉後仍放不下）\n');
P('| 裝置 | 情境 | 題目被收掉 | 要捲動 | 選項右緣出畫面 | 題目那一句本身放不下 |'); P('|---|---|---|---|---|---|');
for(const p of PROFILES) for(const s of SCEN){ const k=p.id+'/'+s.id; const a=rows.filter(r=>r.res[k].hideQ).length, b=rows.filter(r=>r.res[k].scroll).length, c=rows.filter(r=>r.res[k].offScreen>0).length, d=rows.filter(r=>!r.res[k].sayFit).length; P('| '+p.name+' | '+s.id+' | '+a+'／'+rows.length+' | '+b+' | '+c+' | '+d+' |'); }
P('\n## 2. 各科統計（橫向 L0 期末考座位版 exam_seat；Lr、Ls 同情境）\n');
P('| 科目 | 題數 | 題幹平均／最長字數 | 選項最長字數 | L0 題目被收掉 | Lr 題目被收掉 | Ls 題目被收掉 | Ls 要捲動 | P0 題目被收掉 |'); P('|---|---|---|---|---|---|---|---|---|');
const bycourse={}; for(const r of rows){ (bycourse[r.course]=bycourse[r.course]||[]).push(r); }
for(const c of Object.keys(bycourse).sort()){ const a=bycourse[c]; const f=k=>a.filter(r=>r.res[k].hideQ).length; P('| '+cname(c)+'（'+c+'） | '+a.length+' | '+Math.round(a.reduce((x,r)=>x+r.qlen,0)/a.length)+'／'+Math.max(...a.map(r=>r.qlen))+' | '+Math.max(...a.map(r=>r.maxOpt))+' | '+f('L0/exam_seat')+' | '+f('Lr/exam_seat')+' | '+f('Ls/exam_seat')+' | '+a.filter(r=>r.res['Ls/exam_seat'].scroll).length+' | '+f('P0/exam_seat')+' |'); }
const fmtL=x=>x.dl+'行/'+x.cl.join('+')+'行';
P('\n## 3. 題幹最長前 20 題\n'); P('| # | 題號 | 科目 | 題幹字數 | 選項最長 | P0 題幹行數／選項行數 | L0 | L0 選單高／留題上限 | L0 收題 | Ls 收題／捲動 |'); P('|---|---|---|---|---|---|---|---|---|---|');
rows.slice().sort((a,b)=>b.qlen-a.qlen).slice(0,20).forEach((r,i)=>{ const p0=r.res['P0/exam_seat'], l0=r.res['L0/exam_seat'], ls=r.res['Ls/exam_seat']; P('| '+(i+1)+' | '+r.id+' | '+cname(r.course)+' | '+r.qlen+' | '+r.maxOpt+' | '+fmtL(p0)+' | '+fmtL(l0)+' | '+l0.ch+'/'+l0.keepMax+' | '+(l0.hideQ?'是':'否')+' | '+(ls.hideQ?'是':'否')+'／'+(ls.scroll?'是(+'+ls.over+'px)':'否')+' |'); });
P('\n## 4. 選項最長前 20 個（單一選項字數）\n'); P('| # | 題號 | 科目 | 選項字數 | 選項（前 40 字） | P0 行數 | L0 座位版行數 | L0 ADV grid 行數 |'); P('|---|---|---|---|---|---|---|---|');
const optRows=[]; for(const r of rows){ const opts=optTexts(r); opts.forEach((o,i)=>optRows.push({r,i,o,len:[...o].length})); }
optRows.sort((a,b)=>b.len-a.len).slice(0,20).forEach((x,i)=>{ P('| '+(i+1)+' | '+x.r.id+' | '+cname(x.r.course)+' | '+x.len+' | '+[...x.o].slice(0,40).join('')+([...x.o].length>40?'…':'')+' | '+x.r.res['P0/exam_seat'].cl[x.i]+' | '+x.r.res['L0/exam_seat'].cl[x.i]+' | '+x.r.res['L0/exam_adv'].cl[x.i]+' |'); });
P('\n## 5. 要捲動的題目（任一情境）\n');
const sc=[]; for(const r of rows) for(const k in r.res) if(r.res[k].scroll) sc.push({r,k,x:r.res[k]});
if(!sc.length) P('（無）'); else { P('| 題號 | 科目 | 情境 | 選單高 | 可用高 | 超出 px | 選項行數 |'); P('|---|---|---|---|---|---|---|'); sc.sort((a,b)=>b.x.over-a.x.over).slice(0,40).forEach(s=>P('| '+s.r.id+' | '+cname(s.r.course)+' | '+s.k+' | '+s.x.ch+' | '+s.x.fullMax+' | '+s.x.over+' | '+s.x.cl.join('+')+' |')); if(sc.length>40) P('（另有 '+(sc.length-40)+' 筆）'); }
P('\n## 6. 留題餘裕最差前 15 題（L0 座位版：選單高−留題上限，正值＝題目被收掉）\n'); P('| 題號 | 科目 | 題幹字數 | 選項字數 | 題幹行數 | 選項行數 | 選單高 | 留題上限 | 差 |'); P('|---|---|---|---|---|---|---|---|---|');
rows.slice().sort((a,b)=>(b.res['L0/exam_seat'].ch-b.res['L0/exam_seat'].keepMax)-(a.res['L0/exam_seat'].ch-a.res['L0/exam_seat'].keepMax)).slice(0,15).forEach(r=>{ const x=r.res['L0/exam_seat']; P('| '+r.id+' | '+cname(r.course)+' | '+r.qlen+' | '+r.olen.join('/')+' | '+x.dl+' | '+x.cl.join('+')+' | '+x.ch+' | '+x.keepMax+' | '+(x.ch-x.keepMax)+' |'); });
P('\n## 7. QBANK 讀書會／課堂／同學（LEGAL.ask，ADV，有名字列）\n'); P('| 裝置 | 留的那一句被收掉 | 要捲動 | 最多選項行數 |'); P('|---|---|---|---|');
for(const p of PROFILES){ const a=askRows.filter(r=>r.res[p.id].hideQ).length, b=askRows.filter(r=>r.res[p.id].scroll).length, m=Math.max(...askRows.map(r=>Math.max(...r.res[p.id].cl))); P('| '+p.name+' | '+a+'／'+askRows.length+' | '+b+' | '+m+' |'); }
P('\n## 8. 直向容量參考\n');
for(const p of PROFILES){ const d=dlgBox(p,'',false), c=choicesBox(p,'seat',['x']); P('- '+p.name+'：題幹文字寬 '+Math.round(d.tw)+' px≈'+(d.tw/16).toFixed(1)+' 全形字／行；選項（座位版）文字寬 '+Math.round(c.tw)+' px≈'+(c.tw/15).toFixed(1)+' 全形字／行'+(!portrait(p)?'；ADV grid 欄文字寬 '+Math.round(choicesBox(p,'adv',['a','b','c','d']).tw)+' px≈'+(choicesBox(p,'adv',['a','b','c','d']).tw/15).toFixed(1)+' 字；ADV grid 右緣 '+Math.round(choicesBox(p,'adv',['a','b','c','d']).right)+' px（畫面 '+p.W+'、safe 右界 '+(p.W-p.sr)+'）':'')); }
console.log(out.join('\n'));
if(jsonOut){ fs.writeFileSync(jsonOut,JSON.stringify({profiles:PROFILES,rows:rows.map(r=>({id:r.id,course:r.course,term:r.term,status:r.status,qlen:r.qlen,olen:r.olen,res:r.res})),ask:askRows.map(r=>({id:r.id,res:r.res}))},null,1)); console.error('JSON → '+jsonOut); }
