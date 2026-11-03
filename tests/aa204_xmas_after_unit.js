// AA_204 第 1-4 節（企劃線 4618aed21；2026-10-17 AA-C，AA_215／AA_216 大一上 #3）：大一 2025-12-24 聖誕交換禮物（ev_xmas_exchange，18:30 麵店）散場以後，
// 和以安（heroine_01）或語彤（heroine_03）兩個人的那一段（單身＝第 5、6 階／交往中）。台詞一字照稿（D109，AA 是劇情總監）。不需要瀏覽器。
// LAWWW-B 11-01 定的做法：
//   - 條件：玩家事先用節日系統約了她 2025-12-24 的晚上場（FEST 的 eligible），而且玩家去了群戲（xmas_y1）、她也在群戲裡（XMAS_HERE）。
//   - 只對這兩位、這一天：晚上場和 xmas_y1 群戲的時間重疊允許（這一場從群戲散場開始，不另外選地點）；別天、別人、和別的約重疊照舊擋。
//   - 群戲演完（OUT.AFTER，q＝xmas_y1）接著演 1-4，取代 S.play 開頭的節日台詞；其餘照 AA_416：好感（day）、記憶 HOL_XMAS_2025、玩家送禮（1-8）。
//   - 語彤單身選「今天不行。」：「嗯，沒關係。」這一場結束——不扣分、不給節日好感、不記節日記憶、不送禮；FEST 的 done 記 'declined'（不再重排）。
//   - 演完時間到 21:30（「好。」剝蒜頭、以安走溫州街回學校、交往中）；「今天不行。」照群戲散場（20:30）。
//   - 沒去群戲、不在群戲的：照原本的節日系統（晚上場選地點、AA_416 原本的台詞）。中午場照舊可以約別人。舊存檔（G.fest 沒有 grp）照舊。
// 檢查：0 讀稿（1-4 的四段 code block 逐行對；選項、剝蒜頭的旁白、「嗯，沒關係。」）
//   1 以安單身  2 以安交往中  3 語彤單身「好。」  4 語彤單身「今天不行。」  5 語彤交往中
//   6 重疊：2025-12-24 這兩位允許、芷若照舊擋、和別的約重疊照舊擋、別天（2026）照舊擋、中午場照舊
//   7 沒去群戲：不在麵店團＝原本的晚上場（選地點、原本的台詞）；約了散場以後卻沒去群戲＝不演、不給好感（記 miss）；去了群戲沒約她＝不演
//   8 舊存檔、中午場約別人、晚上場只能一位
// 修改前（開發分支 69585927c）：FEST_DATA 沒有 xmas.grp、晚上場和群戲重疊被擋（「那段時間已經有別的約了」）——0～5、7 的「約了散場以後卻沒去群戲」、8 的「晚上場只能一位」FAIL（FAILED 23；6 的「照舊擋」、7 的「原本的晚上場」修改前就是 PASS）。用法：node tests/aa204_xmas_after_unit.js
//   （稿用 git show 讀；在沒有 .git 的目錄跑時，設環境變數 AA204_GIT_DIR＝這個 repo 的目錄）
'use strict';
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H, J=JSON.stringify, AN='heroine_01', YT='heroine_03', ZR='heroine_02';
global.CG_REGISTRY=global.CG_REGISTRY||{};
const load=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); return true; };
try{ load('src/data/invite_replies.js'); }catch(e){ console.log('（載入 invite_replies.js 失敗：'+e.message+'）'); }
let err=''; try{ load('src/data/fest_events.js'); load('src/fest3d.js'); }catch(e){ err=String(e); }
const X=()=>typeof FEST!=='undefined'?FEST:null;
const GITDIR=process.env.AA204_GIT_DIR||H.ROOT;
const git=(refs,f)=>{ for(const r of refs){ try{ const t=cp.execSync('git -c core.quotepath=false show "'+r+':docs/story_planning/'+f+'"',{cwd:GITDIR,encoding:'utf8',stdio:['ignore','pipe','ignore']}); if(t) return t; }catch(e){} } return ''; };
const doc=git(['4618aed21','origin/claude/story-planning'],'AA_204_大一寒假_AA場景台詞_16週制.md');
const s14=(doc.split('### 1-4.')[1]||'').split('\n## 2.')[0];
/* 1-4 的四段 code block：以安單身、以安交往中、語彤單身、語彤交往中（「旁白：」＝旁白） */
const BL=s14.split('```').filter((b,i)=>i%2===1).map(b=>b.trim().split('\n').map(l=>{ const m=/^([^：]+)：(.*)$/.exec(l.trim()); return m?{who:m[1]==='旁白'?null:m[1],t:m[2]}:{who:'?',t:l}; }));
const exp=i=>(BL[i]||[]).map(x=>x.t);
const D=k=>H.D(k);
const lv=(id,n)=>{ const r=SOCIAL.rel(id); Object.assign(r,{fam:n>=4?65:(n>=3?45:25),trust:n>=4?50:(n>=3?30:0),comf:n>=4?45:0,npcRom:n>=6?60:(n>=5?35:0),rom:n>=6?35:0}); SOCIAL.remember(id,'FIRST_MET',''); };
const date=id=>{ H.G.flags['dating_'+id]=true; ROM.get(H.G,id).status='dating'; };
const at=(key,h)=>{ const G=H.G; G.day=D(key); G.hour=h; const w=CALENDAR.dateOf(G.day).wd; G.weekday=w===7?0:w; };
/* group：在麵店團（12/22 21:00 阿哲揪 → 排 xmas_y1，照 story3d.js 真正的規則）*/
const setup=(o)=>{ o=o||{}; const G=H.fresh('2025-12-22',21.05,'dorm',{introDone:true,classDone:true,afternoonDone:true}); G.outings=[]; G.contacts=G.contacts||{};
  for(const [id,n] of Object.entries(o.lv||{})){ lv(id,n==='dt'?6:n); if(n==='dt') date(id); G.contacts[id]=G.day-60; }
  if(STORY._bindGM) STORY._bindGM(GM); if(o.group!==false){ PHONE.join(G,'noodle_team','麵店團'); STORY.phoneRules(GM); PHONE.tick(G); STORY.phoneRules(GM); }
  at(o.key||'2025-12-23',o.h!=null?o.h:10); return G; };
const said=()=>H.said.map(s=>s.t);
const relOf=id=>Object.assign({},SOCIAL.rel(id));
const dRel=(id,a)=>{ const b=relOf(id), o={}; for(const k of ['fam','trust','comf','npcRom','rom']) if((b[k]|0)!==(a[k]|0)) o[k]=(b[k]|0)-(a[k]|0); return o; };
const ask=async(id,picks)=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); const r=await X().ask(GM,id,null); return {r,L:said(),O:H.opts.slice()}; };
/* 群戲：Math.random 固定（誰抽到誰的每次一樣，好感的比較才準）；picks 的第一個＝你帶來的禮物（一本小筆記本）*/
const goOut=async(qid,picks)=>{ const q=OUT.get(H.G,qid); H.said=[]; H.opts=[]; H.bgs=[]; H.cgs=[]; H.cards=[]; H.picks=(picks||[]).slice(); const R0=Math.random; Math.random=()=>0.5; try{ await OUT.go(GM,q); } finally { Math.random=R0; } return {q,L:said(),S:H.said.slice(),O:H.opts.slice()}; };
let money=[]; GM.money=n=>{ money.push(n); H.G.money+=n; };
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（中斷這一節）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const GIFT_AN=['一支好寫的鋼筆','一本空白的手帳','一本商事法的書','一束花','（沒有準備）'], GIFT_YT=['一條髮圈','一把新的傘','一雙顧店穿的布鞋','一瓶香水','（沒有準備）'];
const ORIG_AN_S6='聖誕節。……這一天我本來沒排事情。', ORIG_YT_S6='聖誕節麵店照常。……打烊以後，你要不要來剝蒜頭。', ORIG_YT_DT='今天打烊早。阿姨說，聖誕節要給年輕人。', ORIG_AN_DT='字很少。回去再看。';
/* 群戲演完以後的那一段（從 1-4 的第一句起）*/
const tail=(g,first)=>{ const i=g.L.indexOf(first); return i<0?[]:g.L.slice(i); };
const whoAt=(g,first)=>{ const i=g.L.indexOf(first); return i<0?[]:g.S.slice(i).map(s=>s.who); };
/* 群戲本身（沒有約她）那一趟的好感變化：拿來扣掉 */
const baseline=async(id,dt)=>{ setup({lv:{[id]:dt?'dt':5}}); at('2025-12-24',18.2); const r0=relOf(id); await goOut('xmas_y1',[0]); return dRel(id,r0); };
const sub=(a,b)=>{ const o={}; for(const k of new Set(Object.keys(a).concat(Object.keys(b)))){ const v=(a[k]|0)-(b[k]|0); if(v) o[k]=v; } return J(o); };
const plus=(...xs)=>{ const o={}; for(const x of xs) for(const k in x) o[k]=(o[k]|0)+x[k]; const r={}; for(const k of ['fam','trust','comf','npcRom','rom']) if(o[k]) r[k]=o[k]; return J(r); };

(async()=>{
  /* ======================= 0 讀稿 ======================= */
  check('0. 讀稿（企劃線 4618aed21 AA_204 第 1-4 節：四段 code block，每段三行）',BL.length===4&&BL.every(b=>b.length===3)&&BL[0][0].who===null&&BL[0][1].who==='以安'&&BL[2][1].who==='語彤',J(BL.map(b=>b.length)));
  check('0. 新檔載得到：FEST、FEST_DATA',!!X()&&typeof FEST_DATA!=='undefined',err);
  if(!X()){ H.done(); return; }
  await sec('0',async()=>{
    const ga=((FEST_DATA.PEOPLE[AN].fest||{}).xmas||{}).grp, gy=((FEST_DATA.PEOPLE[YT].fest||{}).xmas||{}).grp;
    const txt=L=>(L||[]).filter(l=>l.text!==undefined).map(l=>l.text);
    check('0. 以安：FEST_DATA xmas.grp 的單身、交往中逐行照稿（旁白是旁白）',!!ga&&J(txt(ga.s6))===J(exp(0))&&J(txt(ga.dt))===J(exp(1))&&ga.s6[0].speaker===null&&ga.dt[0].speaker===null&&ga.s6[1].speaker===AN,J(ga));
    const ch=gy&&(gy.s6||[]).find(l=>l.choice);
    check('0. 語彤：單身前三行、交往中逐行照稿；單身的選項「好。」／「今天不行。」',!!gy&&J(txt(gy.s6).slice(0,3))===J(exp(2))&&J(txt(gy.dt))===J(exp(3))&&!!ch&&J(ch.choice.map(c=>c.text))===J(['「好。」','「今天不行。」']),J(gy));
    check('0. 稿裡有選項和兩個結果：「好。」→ 旁白「（剝到九點半，手上都是蒜味。）」；「今天不行。」→ 語彤「嗯，沒關係。」',s14.includes('選項：「好。」')&&s14.includes('「今天不行。」')&&s14.includes('旁白「（剝到九點半，手上都是蒜味。）」')&&s14.includes('語彤「嗯，沒關係。」')&&!!gy&&txt(gy.s6).includes('（剝到九點半，手上都是蒜味。）')&&txt(gy.s6).includes('嗯，沒關係。'));
    check('0. 只有 2025 年、接在 xmas_y1（ev_xmas_exchange）後面',!!ga&&!!gy&&J(ga.years)===J([2025])&&J(gy.years)===J([2025])&&ga.q==='xmas_y1'&&gy.q==='xmas_y1');
    check('0. OUT.AFTER 接了群戲散場以後那一段（FEST.grpAfter）',typeof X().grpAfter==='function'&&OUT.AFTER.length>=2);
  });

  /* ======================= 1 以安單身 ======================= */
  await sec('1',async()=>{
    const base=await baseline(AN,false);
    setup({lv:{[AN]:5}}); const q0=OUT.get(H.G,'xmas_y1');
    const a=await ask(AN,[1]); const R=X().rec(H.G), b=R.bk.find(x=>x.who===AN);
    check('1. 12/23 約以安：晚上場和 18:30 群戲重疊也可以約（小字「聖誕交換禮物散場以後」）、不另外選地點、不排邀約或另外的出遊',!!q0&&J(a.O[0].slice(0,2))===J(['中午場（11:30～14:30）','晚上場（18:00～21:30）'])&&a.O.length===1&&!!b&&b.slot==='eve'&&b.grp==='xmas_y1'&&!(H.G.invites||[]).some(iv=>iv.who===AN&&iv.state==='accepted')&&!OUT.get(H.G,'fest_heroine_01_xmas_2025')&&a.L.slice(-1)[0]==='約好 12/24（三），聖誕交換禮物散場以後。',J({O:a.O,b,L:a.L}));
    at('2025-12-24',18.2); money=[]; const r0=relOf(AN); const g=await goOut('xmas_y1',[0,0]);
    const T=tail(g,exp(0)[0]);
    check('1. 群戲演完接著演：（大家在麵店門口散了。以安沒有往女舍的方向走。）「剛剛那個是抽的。」「我另外有帶一個。走一段再給你。」→ 送她禮物（鋼筆：「……我的筆快沒水了。你怎麼知道。」）',g.L.includes('（禮物先疊在桌子中間，吃完再抽。）')&&J(T)===J(exp(0).concat(['……我的筆快沒水了。你怎麼知道。']))&&whoAt(g,exp(0)[0])[0]===null&&J(g.O.slice(-1)[0])===J(GIFT_AN),J({T,O:g.O}));
    check('1. 不演 AA_416 原本的聖誕台詞（「聖誕節。……這一天我本來沒排事情。」）',!g.L.includes(ORIG_AN_S6));
    check('1. 好感照 AA_416 1-7 聖誕（+4／+4／+4）＋禮物合適（+2 戀愛／+3 信任）；記憶 HOL_XMAS_2025；錢扣 800；done＝meet',sub(dRel(AN,r0),base)===plus(FEST_DATA.REL.day,FEST_DATA.REL.giftOk)&&SOCIAL.has(AN,'HOL_XMAS_2025')&&J(money)===J([-800])&&X().rec(H.G).done[AN+':xmas:2025']==='meet',J({d:dRel(AN,r0),base,money}));
    check('1. 時間：兩個人走溫州街回學校，到 21:30（12/24）',H.G.day===D('2025-12-24')&&Math.abs(H.G.hour-21.5)<1e-6,J([H.G.day,H.G.hour]));
    H.said=[]; const again=await X().grpAfter(GM,g.q,STORY_EVENTS.find(e=>e.id==='ev_xmas_exchange')); check('1. 只演一次',!again&&!H.said.length);
  });

  /* ======================= 2 以安交往中 ======================= */
  await sec('2',async()=>{
    const base=await baseline(AN,true);
    setup({lv:{[AN]:'dt'}}); const a=await ask(AN,[1]); at('2025-12-24',18.2); money=[]; const r0=relOf(AN); const g=await goOut('xmas_y1',[0,1]); const T=tail(g,exp(1)[0]);
    check('2. 交往中：（大家在麵店門口散了。以安從包包裡拿出一個小盒子。）「這個不是抽的。」「鋼筆。申論題寫比較快。」→ 送她禮物（手帳：「明年的。……我會從第一頁開始寫。」）',!!a.r&&J(T)===J(exp(1).concat(['明年的。……我會從第一頁開始寫。']))&&J(g.O.slice(-1)[0])===J(GIFT_AN),J({T,O:g.O}));
    check('2. 不演 AA_416 交往中那張卡片（「字很少。回去再看。」）',!g.L.includes(ORIG_AN_DT)&&!g.L.includes('（她遞過來一張卡片）'));
    check('2. 好感聖誕＋禮物；HOL_XMAS_2025；錢扣 250；21:30',sub(dRel(AN,r0),base)===plus(FEST_DATA.REL.day,FEST_DATA.REL.giftOk)&&SOCIAL.has(AN,'HOL_XMAS_2025')&&J(money)===J([-250])&&Math.abs(H.G.hour-21.5)<1e-6,J({d:dRel(AN,r0),base,money,h:H.G.hour}));
  });

  /* ======================= 3 語彤單身「好。」 ======================= */
  await sec('3',async()=>{
    const base=await baseline(YT,false);
    setup({lv:{[YT]:5}}); const a=await ask(YT,[1]); const b=X().rec(H.G).bk.find(x=>x.who===YT);
    check('3. 約語彤：晚上場散場以後（不是只能約麵店的 18:30）',!!b&&b.grp==='xmas_y1'&&b.slot==='eve',J({O:a.O,b}));
    at('2025-12-24',18.2); money=[]; const r0=relOf(YT); const g=await goOut('xmas_y1',[0,'「好。」',0]); const T=tail(g,exp(2)[0]);
    check('3. （大家走了以後，語彤還沒走。阿姨在櫃台後面喊她。）「阿姨說明天要用的蒜頭還沒剝。」「打烊以後，你要不要來幫忙。」→ 選項「好。」「今天不行。」',J(T.slice(0,3))===J(exp(2))&&g.O.some(o=>J(o)===J(['「好。」','「今天不行。」'])),J({T,O:g.O}));
    check('3. 「好。」→（剝到九點半，手上都是蒜味。）→ 送她禮物（髮圈：「……舊的那條鬆了。你有看到。」）',J(T.slice(3))===J(['（剝到九點半，手上都是蒜味。）','……舊的那條鬆了。你有看到。'])&&J(g.O.slice(-1)[0])===J(GIFT_YT)&&!g.L.includes('嗯，沒關係。')&&!g.L.includes(ORIG_YT_S6),J(T));
    check('3. 好感聖誕＋禮物；HOL_XMAS_2025；錢扣 120；時間到 21:30；done＝meet',sub(dRel(YT,r0),base)===plus(FEST_DATA.REL.day,FEST_DATA.REL.giftOk)&&SOCIAL.has(YT,'HOL_XMAS_2025')&&J(money)===J([-120])&&Math.abs(H.G.hour-21.5)<1e-6&&X().rec(H.G).done[YT+':xmas:2025']==='meet',J({d:dRel(YT,r0),base,money,h:H.G.hour}));
  });

  /* ======================= 4 語彤單身「今天不行。」 ======================= */
  await sec('4',async()=>{
    const base=await baseline(YT,false);
    setup({lv:{[YT]:6}}); await ask(YT,[1]); at('2025-12-24',18.2); money=[]; const r0=relOf(YT); const g=await goOut('xmas_y1',[0,'「今天不行。」',0]); const T=tail(g,exp(2)[0]);
    check('4. 「今天不行。」→ 語彤「嗯，沒關係。」，這一場結束（不送禮、沒有禮物選單）',J(T)===J(exp(2).concat(['嗯，沒關係。']))&&!g.O.some(o=>J(o)===J(GIFT_YT))&&!g.L.includes('（剝到九點半，手上都是蒜味。）'),J({T,O:g.O}));
    check('4. 不扣分、不給節日好感、不記節日記憶、不扣錢；done＝declined；時間照群戲散場（20:30）',sub(dRel(YT,r0),base)==='{}'&&!SOCIAL.has(YT,'HOL_XMAS_2025')&&!money.length&&X().rec(H.G).done[YT+':xmas:2025']==='declined'&&Math.abs(H.G.hour-20.5)<1e-6,J({d:dRel(YT,r0),base,money,h:H.G.hour,done:X().rec(H.G).done}));
    X().phone(H.G); H.said=[]; const p=await X().play(GM,{id:YT,k:'xmas',y:2025,mode:'meet'}); const c=await ask(YT,[1]);
    check('4. 不會再重排、不會 18:00 再開一場：沒有排節日的出遊、S.play 不演、再約＝「那天已經和她約好了」',!(H.G.outings||[]).some(q=>q.fest&&q.fest.id===YT)&&!p&&c.r==null&&c.L.slice(-1)[0]==='那天已經和'+SOCIAL.displayName(YT)+'約好了。',J({p,c:c.L,o:(H.G.outings||[]).map(q=>q.id)}));
  });

  /* ======================= 5 語彤交往中 ======================= */
  await sec('5',async()=>{
    const base=await baseline(YT,true);
    setup({lv:{[YT]:'dt'}}); await ask(YT,[1]); at('2025-12-24',18.2); money=[]; const r0=relOf(YT); const g=await goOut('xmas_y1',[0,2]); const T=tail(g,exp(3)[0]);
    check('5. 交往中：（大家走了以後，語彤從櫃台底下拿出一個紙袋。）「給你。圍巾。」「你騎車脖子都露在外面。」→ 送她禮物（布鞋：「店裡的地板很滑。……你怎麼知道。」）；沒有選項',J(T)===J(exp(3).concat(['店裡的地板很滑。……你怎麼知道。']))&&!g.O.some(o=>J(o)===J(['「好。」','「今天不行。」'])),J({T,O:g.O}));
    check('5. 不演 AA_416 交往中那兩句（「今天打烊早。……」「交換禮物我抽到一條圍巾。……」）',!g.L.includes(ORIG_YT_DT)&&!g.L.includes('交換禮物我抽到一條圍巾。……我換給你了。阿哲不知道。'));
    check('5. 好感聖誕＋禮物；HOL_XMAS_2025；錢扣 500；21:30',sub(dRel(YT,r0),base)===plus(FEST_DATA.REL.day,FEST_DATA.REL.giftOk)&&SOCIAL.has(YT,'HOL_XMAS_2025')&&J(money)===J([-500])&&Math.abs(H.G.hour-21.5)<1e-6,J({d:dRel(YT,r0),base,money,h:H.G.hour}));
  });

  /* ======================= 6 重疊 ======================= */
  await sec('6',async()=>{ const x=X(), d=D('2025-12-24');
    setup({lv:{[ZR]:5}}); const z=await ask(ZR,[1,'算了']);
    check('6. 芷若 2025-12-24 晚上場照舊被群戲擋（「那段時間已經有別的約了」）',J(z.O[0])===J(['中午場（11:30～14:30）','晚上場（18:00～21:30）','算了'])&&z.L.includes('那段時間已經有別的約了。')&&!x.bookedWith(H.G,ZR,d),J(z));
    setup({lv:{[AN]:5}}); INV.accept(H.G,'zhe','noodle',d,20.75,{by:'player'}); const a=await ask(AN,[1,'算了']);
    check('6. 以安：和群戲以外的約重疊（20:45 和阿哲吃麵）照舊擋',a.L.includes('那段時間已經有別的約了。')&&!x.bookedWith(H.G,AN,d),J(a));
    setup({lv:{[AN]:5},group:false}); at('2026-12-23',10); OUT.plan(H.G,{id:'xmas_y1',ev:'ev_xmas_exchange',day:D('2026-12-24'),h:18.5,late:0.25,place:'阿鳳麵店',title:'聖誕交換禮物',travel:'',travelH:1/6}); const c=await ask(AN,[1,'算了']);
    check('6. 別天（2026-12-24 也排一個 xmas_y1）的同一種重疊照舊擋',c.L.includes('那段時間已經有別的約了。')&&!x.bookedWith(H.G,AN,D('2026-12-24')),J(c));
    setup({lv:{[AN]:5}}); const n=await ask(AN,[0,'兩點半 Café']); const bn=x.rec(H.G).bk.find(b=>b.who===AN);
    check('6. 中午場照舊（選地點、排邀約；沒有 grp）',!!bn&&bn.slot==='noon'&&!bn.grp&&!!n.r&&n.r.fest&&n.r.fest.slot==='noon',J({bn,O:n.O}));
  });

  /* ======================= 7 沒去群戲 ======================= */
  await sec('7',async()=>{ const x=X(), d=D('2025-12-24');
    setup({lv:{[AN]:5},group:false}); const a=await ask(AN,[1,'兩點半 Café']); const iv=a.r;
    check('7. 不在麵店團（沒有 xmas_y1）：晚上場照舊選地點、排 18:30 的邀約（iv.fest）',!OUT.get(H.G,'xmas_y1')&&a.O.length===2&&a.O[1].includes('兩點半 Café')&&!!iv&&iv.h===18.5&&iv.fest&&iv.fest.slot==='eve'&&!x.rec(H.G).bk.find(b=>b.who===AN).grp,J({O:a.O,iv}));
    at('2025-12-24',18.5); H.said=[]; H.opts=[]; H.picks=[4]; await x.meet(GM,iv,{name:'以安'});
    check('7. 見面照 AA_416 原本的台詞（「聖誕節。……這一天我本來沒排事情。」「現在有了。」）',J(said().slice(0,2))===J([ORIG_AN_S6,'現在有了。']),J(said()));
    setup({lv:{[AN]:5}}); await ask(AN,[1]); at('2025-12-24',18.2); H.picks=[2]; const q=OUT.get(H.G,'xmas_y1'); const r0=relOf(AN); await OUT.prompt(GM,q); x.phone(H.G);
    check('7. 約了散場以後、群戲選「不去了」：不演、不給好感、不記記憶；記 miss（不扣分）',q.state==='missed'&&!x.rec(H.G).done[AN+':xmas:2025']&&J(dRel(AN,r0))==='{}'&&!SOCIAL.has(AN,'HOL_XMAS_2025')&&x.rec(H.G).miss[AN+':xmas:2025']==='missed',J({st:q.state,R:x.rec(H.G)}));
    setup({lv:{[AN]:5}}); at('2025-12-24',18.2); const g=await goOut('xmas_y1',[0]);
    check('7. 去了群戲、沒有約她：散場以後不演 1-4、沒有禮物選單',!g.L.includes(exp(0)[0])&&!g.O.some(o=>J(o)===J(GIFT_AN))&&!x.rec(H.G).done[AN+':xmas:2025']&&Math.abs(H.G.hour-20.5)<1e-6,J(g.L.slice(-3)));
  });

  /* ======================= 8 舊存檔、中午場、晚上場只能一位 ======================= */
  await sec('8',async()=>{ const x=X(), d=D('2025-12-24');
    setup({lv:{[AN]:5,[YT]:5}}); await ask(AN,[1]); const y=await ask(YT,[1,'算了']); const n=await ask(YT,[0]);
    check('8. 晚上場已經約了以安（散場以後）：語彤的晚上場灰掉（「晚上場已經約了以安」）；中午場照舊可以約語彤',y.L.includes('晚上場已經約了'+SOCIAL.displayName(AN)+'。')&&!!n.r&&n.r.fest&&n.r.fest.slot==='noon',J({y:y.L,n:n.O}));
    setup({lv:{[AN]:5}}); delete H.G.fest; H.G.fest={bk:[{d,who:AN,k:'xmas',y:2025,slot:'eve',mode:'meet',ref:'iv_old'}],done:{},gifts:{},miss:{}}; at('2025-12-24',18.2); const g=await goOut('xmas_y1',[0]);
    check('8. 舊存檔（G.fest 的約沒有 grp）：群戲散場以後照舊不演',!g.L.includes(exp(0)[0])&&!x.rec(H.G).done[AN+':xmas:2025'],J(g.L.slice(-3)));
    setup({lv:{[AN]:5}}); delete H.G.fest; at('2025-12-24',18.2); const g2=await goOut('xmas_y1',[0]); check('8. 舊存檔（沒有 G.fest）：群戲照演、不出錯',g2.L.includes('（禮物先疊在桌子中間，吃完再抽。）')&&!g2.L.includes(exp(0)[0]));
  });
  H.done();
})();
