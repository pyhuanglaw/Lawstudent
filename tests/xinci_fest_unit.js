// 芯慈交往中的五個節日（XINCI-EPI-FEST-1031 後半；AA_548 第 9 節「交往中的五個節日：照 AA_537b 第 5 節，句子不改」）——不需要瀏覽器。台詞一字照稿。
//   0 讀稿（AA_537b 第 5 節、AA_548 第 9 節）：每一句都在第 5 節那一格裡；資料、FEST_EVENTS 有她；大一上的「十二部。看完跟我說。」照舊
//   1 她的生日 3/28：沒交往＝邀約選單沒有「約她過節」；交往中＝前一天、當天都有 → 中午場 → 地點 → 到了演「（她收到禮物……）」「我會留著。包裝紙也是。」；沒有禮物選單、不扣錢；只演一次
//   2 聖誕：交往中＝玩家約、到了演「今年是十三部。最後一部，我想跟你一起看。」；她不先約（12/23 21:00 沒有私訊）；沒交往＝沒有
//   3 情人節：交往中＝前一天 21:00 她私訊「我不太會過這種節。……可是我提前一天約你了。」（20:59 還沒有）、「好。」「那天不行。」；
//     「好。」＝隔天 18:00 巷口家常菜、到了好感＋記憶 HOL_VDAY；邀約選單沒有「約她過節：情人節」（她約）；只傳一次；沒交往＝沒有
//   4 跨年：交往中＝12/31 23:58「我在家。我媽在看晚會。」、1/1 00:01「新年快樂。這是今年第一則。」（23:57 還沒有、00:00 只有第一則）；睡過去＝照原本的時間補；只一次；沒交往＝沒有
//   5 你的生日：PLAYER_BDAY 還沒定（null）＝不發；定了（測試暫時填）＝那天 00:00「生日快樂。我設了鬧鐘。……我本來就醒著，鬧鐘是保險。」，只一次、交往中才有
//   6 XCROM.ON 關著＝都沒有
// 修改前（開發分支 bfafd1a62）：FEST_DATA 沒有芯慈——「0. 載得到」FAIL、後面不跑（FAILED 1）。用法：node tests/xinci_fest_unit.js
//   （稿用 git show 讀；在沒有 .git 的目錄跑時，設環境變數 XC_GIT_DIR＝這個 repo 的目錄）
'use strict';
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H, J=JSON.stringify, XC='classmate_xinci';
global.CG_REGISTRY=global.CG_REGISTRY||{};
const load=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); return true; };
try{ load('src/data/invite_replies.js'); }catch(e){ console.log('（載入 invite_replies.js 失敗：'+e.message+'）'); }
let err=''; try{ load('src/data/fest_events.js'); load('src/fest3d.js'); }catch(e){ err=String(e); }
let xcErr=''; try{ load('src/xcrom3d.js'); }catch(e){ xcErr=String(e).slice(0,160); }
const X=()=>typeof FEST!=='undefined'?FEST:null;
const GITDIR=process.env.XC_GIT_DIR||H.ROOT;
const git=(refs,f)=>{ for(const r of refs){ try{ const t=cp.execSync('git -c core.quotepath=false show "'+r+':docs/story_planning/'+f+'"',{cwd:GITDIR,encoding:'utf8',stdio:['ignore','pipe','ignore']}); if(t) return t; }catch(e){} } return ''; };
const doc537=git(['b3df9c4e9','origin/claude/story-planning'],'AA_537b_吳芯慈_第二份_約會台詞_校外地點_期末飯_節日.md');
const doc548=git(['d145b889a','origin/claude/story-planning'],'AA_548_芯慈戀愛線重寫_門檻與半夜訊息.md');
const sec5=(doc537.split('## 5. 節日')[1]||'').split('\n## ')[0], sec9=(doc548.split('## 9.')[1]||'').split('\n## ')[0];
const row=k=>(sec5.split('\n').find(l=>l.startsWith('| '+k+' |'))||'');
const D=k=>H.D(k);
const lv=(id,n)=>{ const r=SOCIAL.rel(id); Object.assign(r,{fam:n>=4?65:(n>=3?45:25),trust:n>=4?50:(n>=3?30:0),comf:n>=4?45:0,npcRom:n>=6?60:(n>=5?35:0),rom:n>=6?35:0}); SOCIAL.remember(id,'FIRST_MET',''); };
const date=id=>{ H.G.flags['dating_'+id]=true; ROM.get(H.G,id).status='dating'; };
/* dt＝交往中；f＝朋友（第 6 階、沒交往）。兩種都有聯絡方式 */
const setup=(key,h,mode)=>{ const G=H.fresh(key,h,'dorm',{}); G.outings=[]; G.contacts=G.contacts||{}; lv(XC,6); G.contacts[XC]=G.day-60; if(mode==='dt') date(XC); if(STORY._bindGM) STORY._bindGM(GM); return G; };
const at=(key,h)=>{ const G=H.G; G.day=D(key); G.hour=h; const w=CALENDAR.dateOf(G.day).wd; G.weekday=w===7?0:w; };
const rules=()=>{ const x=X(); if(x) x.phone(H.G); PHONE.tick(H.G); };
const dms=()=>H.msgs('p:'+XC);
const said=()=>H.said.map(s=>s.t);
const relOf=id=>Object.assign({},SOCIAL.rel(id));
const ask=async(picks,n)=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); const r=await X().ask(GM,XC,n||null); return {r,L:said(),O:H.opts.slice()}; };
const goOut=async(qid,picks)=>{ const q=OUT.get(H.G,qid); H.said=[]; H.opts=[]; H.bgs=[]; H.cgs=[]; H.cards=[]; H.picks=(picks||[]).slice(); await OUT.go(GM,q); return {q,L:said()}; };
const meet=async(iv)=>{ H.said=[]; H.opts=[]; H.picks=[]; const ok=await X().meet(GM,iv,{name:'芯慈'}); return {ok,L:said(),O:H.opts.slice()}; };
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（中斷這一節）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
let money=[]; GM.money=n=>{ money.push(n); H.G.money+=n; };
const VDAY='我不太會過這種節。……可是我提前一天約你了。', BD_N='（她收到禮物，拆得很慢，包裝紙摺好才放進包包。）', BD_L='我會留著。包裝紙也是。', XMAS='今年是十三部。最後一部，我想跟你一起看。',
  NYE1='我在家。我媽在看晚會。', NYE2='新年快樂。這是今年第一則。', MYBD='生日快樂。我設了鬧鐘。……我本來就醒著，鬧鐘是保險。';

(async()=>{
  /* ======================= 0 讀稿、資料 ======================= */
  check('0. 讀稿：AA_537b 第 5 節（企劃線 b3df9c4e9）五列、AA_548 第 9 節（d145b889a）「交往中的五個節日：照 `AA_537b` 第 5 節，句子不改」',sec5.length>100&&['她的生日 3/28','你的生日','聖誕節','情人節','跨年'].every(k=>!!row(k))&&sec9.includes('交往中的五個節日：照 `AA_537b` 第 5 節，句子不改'),J([sec5.length,sec9.length]));
  check('0. 每一句都在第 5 節自己那一列（一字不差）',row('她的生日 3/28').includes(BD_N)&&row('她的生日 3/28').includes('「'+BD_L+'」')&&row('你的生日').includes('「'+MYBD+'」')&&row('你的生日').includes('00:00')&&row('聖誕節').includes('「'+XMAS+'」')&&row('情人節').includes('「'+VDAY+'」')&&row('跨年').includes('23:58')&&row('跨年').includes('「'+NYE1+'」')&&row('跨年').includes('00:01：「'+NYE2+'」'));
  check('0. 載得到：FEST、FEST_DATA 有芯慈（只有交往中、生日 03-28）、FEST_EVENTS 有 ev_fest_classmate_xinci（出遊事件）',!err&&!!X()&&!!(FEST_DATA.PEOPLE||{})[XC]&&FEST_DATA.PEOPLE[XC].datingOnly===true&&FEST_DATA.BDAY[XC]==='03-28'&&FEST_EVENTS.some(e=>e.id==='ev_fest_'+XC&&e.trigger==='outing')&&STORY_EVENTS.some(e=>e.id==='ev_fest_'+XC),err);
  if(!X()||!(FEST_DATA.PEOPLE||{})[XC]){ H.done(); return; }
  { const P=FEST_DATA.PEOPLE[XC], txt=[].concat(...['vday','bday','xmas'].map(k=>((P.fest[k]||{}).dt||[]).map(l=>l.text)),P.ask.lines,...Object.values(P.dm).map(a=>[].concat(...a.map(x=>x.lines))));
    check('0. 資料裡的台詞＝稿裡的七句（不多不少）',J(txt.slice().sort())===J([BD_N,BD_L,XMAS,VDAY,NYE1,NYE2,MYBD].sort()),J(txt)); }
  { const ev=fs.readFileSync(path.join(H.ROOT,'src/data/events.js'),'utf8'); check('0. 大一上她送筆記本那段照舊（events.js「十二部。看完跟我說。」）',/XMAS_FROM:'classmate_xinci'\}\},speaker:'classmate_xinci',expression:'smile',text:'十二部。看完跟我說。'/.test(ev)); }
  check('0. xcrom3d.js 載得到（線開關 XCROM.ON）',!xcErr&&typeof XCROM!=='undefined',xcErr);

  /* ======================= 1 她的生日 3/28 ======================= */
  await sec('1',async()=>{ const x=X();
  { setup('2029-03-27',10,'f'); const a=x.flowOpt(H.G,XC,null,false); check('1. 沒交往（第 6 階）：3/27 邀約選單沒有「約她過節」',!a,J(a)); }
  { setup('2029-03-26',10,'dt'); const a0=x.flowOpt(H.G,XC,null,false); at('2029-03-27',10); const a=x.flowOpt(H.G,XC,null,false), b=x.flowOpt(H.G,XC,{obj:null},true); at('2029-03-28',10); const c=x.flowOpt(H.G,XC,null,false);
    check('1. 交往中：前一天（3/27）、當天（3/28）有「約她過節：生日」（手機、當面都有）；3/26 還沒有',!a0&&!!a&&a.t==='約她過節：生日'&&!!b&&b.t===a.t&&!!c&&c.t===a.t,J({a0,a,b,c})); }
  { setup('2029-03-27',10,'dt'); money=[]; const m0=H.G.money; const a=await ask([0,0]); const iv=a.r;
    check('1. 約：中午場 → 地點 → 排好 3/28（INV 的邀約，iv.fest＝生日）',!!iv&&iv.who===XC&&iv.day===D('2029-03-28')&&!!iv.fest&&iv.fest.k==='bday'&&iv.fest.y===2029&&x.bookedWith(H.G,XC,D('2029-03-28'))!=null,J({iv,O:a.O,L:a.L}));
    at('2029-03-28',12); const r0=relOf(XC); const m=await meet(iv); const m2=await meet(iv);
    check('1. 到了：「'+BD_N+'」「'+BD_L+'」（字照稿）；沒有禮物選單、沒扣錢',m.ok&&J(m.L)===J([BD_N,BD_L])&&!m.O.length&&!money.length&&H.G.money===m0,J({m,money}));
    check('1. 生日的好感 +4／+4／+4、記憶 HOL_BDAY_2029；同一年只演一次',J(Object.fromEntries(['fam','comf','npcRom'].map(k=>[k,(SOCIAL.rel(XC)[k]|0)-(r0[k]|0)])))===J({fam:4,comf:4,npcRom:4})&&SOCIAL.has(XC,'HOL_BDAY_2029')&&m2.ok===false&&!m2.L.length,J(m2)); }
  });

  /* ======================= 2 聖誕 ======================= */
  await sec('2',async()=>{ const x=X();
  { setup('2028-12-23',10,'dt'); const a=x.flowOpt(H.G,XC,null,false); const r=await ask([1,0]); const iv=r.r; at('2028-12-24',18.5); const m=await meet(iv);
    check('2. 交往中：12/23 有「約她過節：聖誕節」→ 晚上場 → 到了「'+XMAS+'」；沒有禮物選單',!!a&&a.t==='約她過節：聖誕節'&&!!iv&&iv.fest&&iv.fest.k==='xmas'&&m.ok&&J(m.L)===J([XMAS])&&!m.O.length,J({a,iv,L:m.L,O:m.O})); }
  { setup('2028-12-23',20.9,'dt'); rules(); at('2028-12-23',21.05); rules(); check('2. 聖誕她不先約（12/23 21:00 沒有私訊）',!dms().length&&!PHONE.byAsk(H.G,'fest_ask_'+XC+'_xmas_2028'),J(dms())); }
  { setup('2028-12-23',10,'f'); check('2. 沒交往：聖誕沒有「約她過節」',!x.flowOpt(H.G,XC,null,false)); }
  });

  /* ======================= 3 情人節：她提前一天約 ======================= */
  await sec('3',async()=>{ const x=X();
  { setup('2029-02-13',20.95,'dt'); rules(); const pre=dms().length; at('2029-02-13',21.05); rules(); const m=PHONE.byAsk(H.G,'fest_ask_'+XC+'_vday_2029');
    check('3. 交往中：2/13 21:00 她私訊「'+VDAY+'」（20:59 還沒有）；回覆「好。」「那天不行。」',pre===0&&J(dms())===J([VDAY])&&!!m&&J(m.ask.opts.map(o=>o.t))===J(['好。','那天不行。']),J({pre,d:dms()}));
    const fo=x.flowOpt(H.G,XC,null,false); check('3. 邀約選單沒有「約她過節：情人節」（她提前一天約，玩家不另外約）',!fo,J(fo));
    PHONE.answer(H.G,'fest_ask_'+XC+'_vday_2029',0); rules(); const q=OUT.get(H.G,'fest_'+XC+'_vday_2029');
    check('3. 「好。」＝出遊 2/14 18:00 巷口家常菜（深色底）',!!q&&q.day===D('2029-02-14')&&q.h===18&&q.place==='巷口家常菜'&&q.fest&&q.fest.bg==='dark'&&q.ev==='ev_fest_'+XC,J(q));
    at('2029-02-14',17.9); const r0=relOf(XC); const g=await goOut(q.id);
    check('3. 到了：只有地點字幕（見面那一場稿沒有台詞，沒有多出來的字）；情人節（交往中）+3／+6／+5、記憶 HOL_VDAY_2029',!g.L.length&&J(Object.fromEntries(['fam','comf','npcRom'].map(k=>[k,(SOCIAL.rel(XC)[k]|0)-(r0[k]|0)])))===J({fam:3,comf:6,npcRom:5})&&SOCIAL.has(XC,'HOL_VDAY_2029')&&x.rec(H.G).done[XC+':vday:2029']==='meet',J({L:g.L,r:SOCIAL.rel(XC)}));
    at('2029-02-13',21.5); rules(); check('3. 只傳一次',dms().filter(t=>t===VDAY).length===1); }
  { setup('2029-02-13',21.05,'dt'); rules(); PHONE.answer(H.G,'fest_ask_'+XC+'_vday_2029',1); rules();
    check('3. 「那天不行。」＝不排（稿沒有她的回話：不多一句）',!OUT.get(H.G,'fest_'+XC+'_vday_2029')&&J(dms())===J([VDAY,'那天不行。']),J(dms())); }
  { setup('2029-02-13',21.05,'f'); rules(); check('3. 沒交往：沒有私訊',!dms().length,J(dms())); }
  });

  /* ======================= 4 跨年 ======================= */
  await sec('4',async()=>{
  { setup('2028-12-31',23.95,'dt'); rules(); const a=dms().slice(); at('2028-12-31',23+58/60+0.001); rules(); const b=dms().slice(); H.G.hour=24.0; rules(); const c=dms().slice(); H.G.hour=24+1/60+0.001; rules(); const d=dms().slice();
    const m2=(H.G.msgs||[]).find(m=>m.text===NYE2);
    check('4. 交往中：23:57 沒有；23:58「'+NYE1+'」；00:00 還是只有一則；00:01「'+NYE2+'」（那一則在 1/1）',!a.length&&J(b)===J([NYE1])&&J(c)===J([NYE1])&&J(d)===J([NYE1,NYE2])&&!!m2&&m2.day===D('2029-01-01')&&m2.h<0.05,J({a,b,c,d,m2}));
    H.G.hour=26; rules(); check('4. 只一次',J(dms())===J([NYE1,NYE2])); }
  { setup('2028-12-31',22,'dt'); at('2029-01-01',8); rules(); const L=(H.G.msgs||[]).filter(m=>m.th==='p:'+XC);
    check('4. 睡過去（隔天 08:00 才醒）：兩則照原本的時間補進去（12/31 23:58、1/1 00:01）',J(L.map(m=>m.text))===J([NYE1,NYE2])&&L[0].day===D('2028-12-31')&&Math.abs(L[0].h-23.97)<0.02&&L[1].day===D('2029-01-01')&&L[1].h<0.05,J(L)); }
  { setup('2028-12-31',23.99,'f'); H.G.hour=24.5; rules(); check('4. 沒交往：沒有',!dms().length,J(dms())); }
  });

  /* ======================= 5 你的生日 ======================= */
  await sec('5',async()=>{
  check('5. 祐廷的生日 11-26（AA_639；使用者 11-01 選「交給 AA 挑」）',FEST_DATA.PLAYER_BDAY==='11-26');
  { let n=0; for(const k of ['2029-01-15','2029-03-28','2029-04-20','2029-05-01']){ setup(k,0.5,'dt'); rules(); n+=dms().length; } check('5. 沒定＝不發（隨便幾天的 00:30 都沒有）',n===0); }
  const keep=FEST_DATA.PLAYER_BDAY; FEST_DATA.PLAYER_BDAY='04-20';
  try{
    { setup('2029-04-19',23.9,'dt'); rules(); const a=dms().slice(); H.G.hour=24.0; rules(); const b=dms().slice(); const m=(H.G.msgs||[]).find(x=>x.text===MYBD); H.G.hour=25; rules();
      check('5. 定了（測試暫時填 04-20）：4/20 00:00 準時「'+MYBD+'」（23:54 還沒有）；只一次',!a.length&&J(b)===J([MYBD])&&!!m&&m.day===D('2029-04-20')&&m.h===0&&J(dms())===J([MYBD]),J({a,b,m})); }
    { setup('2029-04-19',23.9,'f'); H.G.hour=24.1; rules(); check('5. 沒交往：沒有',!dms().length); }
  } finally { FEST_DATA.PLAYER_BDAY=keep; }
  });

  /* ======================= 6 線開關 ======================= */
  await sec('6',async()=>{ const x=X(); if(typeof XCROM==='undefined'||!XCROM.setOn){ check('6. XCROM 沒載到',false); return; }
    const was=XCROM.ON; XCROM.setOn(false);
    try{ setup('2029-03-27',10,'dt'); const a=x.flowOpt(H.G,XC,null,false); at('2029-02-13',21.05); rules(); const b=dms().length; at('2028-12-31',24.1); rules(); const c=dms().length;
      check('6. XCROM.ON 關著：生日沒有「約她過節」、情人節不約、跨年不傳',!a&&!b&&!c,J({a,b,c})); }
    finally { XCROM.setOn(was); }
  });
  H.done();
})();
