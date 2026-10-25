// AA_461 法律系大二下讀一遍（企劃線 2afc82609，AA-B 2026-10-25 12:0x；D109）——不需要瀏覽器。台詞逐字對 AA_461（從企劃線 git show 讀稿、解析表格與引述）。
//   0 讀稿（第 1 節的表三列＋沒選那一句、第 2 節 Kevin、第 3 節芷若都讀得到）；新檔載得到
//   1 春假（group3d.js 的 springChoose／springPick）：麵店團群組 3/30 21:00 @ 了你「誰開車」以後，在 3D 裡選了麵店團／和可昕／留在宿舍＝祐廷在群組傳一句、有人回（第 1 節的表；
//     跟大一下的 spring_pick_msg 不一樣、tag y2s2_spring_pick）；4/1 以前沒回（'none'，silent）＝4/2 21:00 柏翰「祐廷沒回。我租車了。」（玩家的名字；4/4 的海邊照片照舊）；
//     不在群組（只和可昕交往）：群組什麼都沒有；大一下已經傳過 spring_pick_msg 不影響；舊存檔（已經選過 SPRING_Y2）不補發
//   2 Kevin 的「今天溫學姊生日🎂」（sis_y2y3_3d.js）：2026 照舊；2027 換第 2 節那一句；舊存檔已經收過 2027 那一則（舊句）不重發
//   3 芷若的試譯稿費（r3_3d.js ZR_FEE_SHOTS）：兩張截圖第二張換第 3 節那一句（第一張照舊）
// 修改前（開發分支 661423a71）：1～3 每一節至少一項 FAIL。用法：node tests/aa461_y2s2_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
const loadErr=[];
const L3=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)){ loadErr.push(f+'：沒有這個檔'); return false; } try{ let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); return true; }catch(e){ loadErr.push(f+'：'+e.message); return false; } };
for(const f of ['src/data/msg_pool.js','src/data/msg2_pool.js','src/data/msg_kx_y0.js','src/msg3d.js','src/data/hometown_lines.js','src/hometown3d.js','src/data/y2b_events.js','src/y2b3d.js','src/data/group_events.js','src/group3d.js',
  'src/data/r3_events.js','src/r3_3d.js','src/data/sis_y2y3_events.js','src/sis_y2y3_3d.js']) L3(f);   /* index.html 的順序（照 group_events_unit.js、r3_events_unit.js、aa379_sis_y2y3_unit.js 載的檔）*/
GM.toast=()=>{}; GM.caption=()=>{};
const D=k=>STORY.dayOfKey(k), keyOf=d=>CALENDAR.dateOf(d).key, wdOf=d=>CALENDAR.dateOf(d).wd%7;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const fresh=(k,h,flags,zone)=>{ const G=H.fresh(typeof k==='number'?keyOf(k):k,h,zone||'dorm',Object.assign({introDone:true,afternoonDone:true,classDone:true,metAn:true,MET_ZHE:true,ROOM_Y2:true},flags||{})); G.outings=[]; G.acts={att:{}}; G.contacts=G.contacts||{}; PHONE.rec(G); E.player.busy=false; E.paused=false; return G; };
const at=(d,h)=>{ const G=H.G; G.day=d; G.hour=h; G.weekday=wdOf(d); };
const rules=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const run=(d,h0,h1,st)=>{ st=st||0.25; for(let h=h0;h<=h1+1e-9;h+=st){ at(d,+h.toFixed(3)); rules(); } };
const byTag=tag=>(H.G.msgs||[]).filter(m=>m.tag===tag);
const TH=th=>(H.G.msgs||[]).filter(m=>m.th===th);
const NG='g:noodle_team';
const join=()=>PHONE.join(H.G,'noodle_team','麵店團');

/* ---- 讀稿（企劃線 2afc82609）---- */
let doc=''; try{ doc=cp.execSync('git show 2afc82609:"docs/story_planning/AA_461_法律系大二下讀一遍_春假群組沒人回_Kevin的生日貼文.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc=''; }
const part=(a,b)=>{ const i=doc.indexOf(a); if(i<0) return ''; const j=b?doc.indexOf(b,i+1):-1; return doc.slice(i,j<0?doc.length:j); };
const rows=t=>t.split('\n').filter(l=>/^\|/.test(l.trim())&&!/^\|\s*-/.test(l.trim())).map(l=>l.trim().replace(/^\||\|$/g,'').split('|').map(c=>c.trim()));
const quotes=t=>t.split('\n').map(l=>l.trim().match(/^> (\S+?)：(.+)$/)).filter(Boolean).map(m=>({who:m[1],t:m[2]}));
const WHO={阿哲:'zhe',柏翰:'classmate_bohan'};
const KMAP={麵店團:'noodle',可昕:'kexin',留在宿舍:'dorm'};
const S1=part('## 1.','## 2.'), T1={}; for(const r of rows(S1)) if(KMAP[r[0]]){ const [w,t]=r[2].split('：'); T1[KMAP[r[0]]]={me:r[1],who:WHO[w],t}; }
const Q1=quotes(S1), Q2=quotes(part('## 2.','## 3.')), Q3=quotes(part('## 3.','## 4.'));
const NONE=Q1.find(q=>q.who==='柏翰'), KV27=Q2.find(q=>q.who==='Kevin'), ZR2=Q3.find(q=>q.who==='芷若');
const OLD_KV='今天溫學姊生日🎂', OLD_SHOT='📷（對話的截圖）';

(async()=>{
/* ---- 0 ---- */
await sec(0,()=>{
  check('0. 讀得到稿、檔都載得到（GROUP、R3、SISY23）',!!doc&&!loadErr.length&&typeof GROUP!=='undefined'&&typeof R3!=='undefined'&&typeof SISY23!=='undefined',J(loadErr));
  check('0. 稿裡讀得到：第 1 節的表三列（麵店團／可昕／留在宿舍）＋沒選那一句、第 2 節 Kevin、第 3 節芷若',Object.keys(T1).length===3&&Object.values(T1).every(x=>x.me&&x.who&&x.t)&&!!NONE&&/^祐廷/.test(NONE.t)&&!!KV27&&!!ZR2,J({T1,NONE,KV27,ZR2}));
});

/* ---- 1 春假 ---- */
const SP=GROUP.springDays();
/* 收到 3/30 21:00 群組那一則（和交往中 21:30 可昕那一則）→ 該問了 → 選 */
const toAsk=(kx)=>{ fresh(SP.inv,20,{}); join(); if(kx){ H.FRIEND('kexin'); H.date('kexin'); H.G.flags.dating_kexin=true; } run(SP.inv,20.5,21.75); };
const choose=async(want)=>{ H.picks=[want]; H.opts=[]; await GROUP.springPrompt(GM); at(H.G.day,H.G.hour+0.25); rules(); };   /* 祐廷那一則排在選完的三分鐘後（同大一下）：選完過一下再看 */
const grpPick=()=>byTag('y2s2_spring_pick').map(m=>(m.from==='player'?'player':m.from)+':'+m.text);
const want=k=>['player:'+T1[k].me,T1[k].who+':'+T1[k].t];
await sec(1,async()=>{
  toAsk(false); const pend=GROUP.springPending(H.G), ats=TH(NG).filter(m=>/^@/.test(m.text)).length;
  check('1. 3/30 21:00 群組（柏翰「誰開車？」、阿哲「@祐廷」）→ 該問三選一了',pend&&ats===1&&byTag('y2s2_spring_grp').some(m=>m.text==='誰開車？'),J(TH(NG).map(m=>m.text)));
  await choose('跟麵店團出去');
  check('1. 選「跟麵店團出去」：祐廷在群組「'+T1.noodle.me+'」→ 阿哲「'+T1.noodle.t+'」（第 1 節的表；祐廷那一則是玩家傳的）',H.G.flags.SPRING_Y2==='noodle'&&J(grpPick())===J(want('noodle'))&&byTag('y2s2_spring_pick').every(m=>m.th===NG)&&byTag('y2s2_spring_pick')[0].who===null,J(grpPick()));
  check('1. 跟大一下的句子不一樣（沒有「我去。」「收到。行程表多一個人。」，大一下的 tag spring_pick_msg 沒有用到）',!byTag('spring_pick_msg').length&&!TH(NG).some(m=>m.text==='我去。'));
  toAsk(false); await choose('留在宿舍');
  check('1. 選「留在宿舍」：祐廷「'+T1.dorm.me+'」→ 柏翰「'+T1.dorm.t+'」',H.G.flags.SPRING_Y2==='dorm'&&J(grpPick())===J(want('dorm')),J(grpPick()));
  toAsk(true); await choose('和可昕開車旅行');
  check('1. 交往中選「和可昕開車旅行」：祐廷在群組「'+T1.kexin.me+'」→ 柏翰「'+T1.kexin.t+'」',H.G.flags.SPRING_Y2==='kexin'&&J(grpPick())===J(want('kexin')),J(grpPick()));
  /* 晚一點再決定 → 隔天再問，選了才傳 */
  toAsk(false); await choose('晚一點再決定'); const later=!byTag('y2s2_spring_pick').length&&H.G.flags.SPRING_Y2==null;
  at(SP.inv+1,22.5); const p2=GROUP.springPending(H.G); await choose('跟麵店團出去');
  check('1. 「晚一點再決定」：當下不傳；隔天再問、選了才傳',later&&p2&&J(grpPick())===J(want('noodle')));
  /* 4/1 以前沒回 */
  toAsk(false); for(const d of [SP.inv+1,SP.dl]) run(d,8,23.5,0.5); const before=byTag('y2s2_spring_none').length;
  const d2=D('2027-04-02'); run(d2,8,20.75,0.25); const at2045=byTag('y2s2_spring_none').length, sp=H.G.flags.SPRING_Y2; run(d2,21,21.5,0.25); const M=byTag('y2s2_spring_none');
  check('1. 4/1 以前沒回（none）：4/2 21:00 柏翰「'+NONE.t+'」（照稿；4/1 以前、4/2 20:45 都還沒有；沒有祐廷的回覆）',before===0&&at2045===0&&sp==='none'&&M.length===1&&M[0].from==='classmate_bohan'&&M[0].th===NG&&M[0].text===NONE.t&&Math.abs(M[0].h-21)<0.26&&M[0].day===d2&&!byTag('y2s2_spring_pick').length,J(M.map(m=>[keyOf(m.day),m.h,m.text])));
  run(SP.trip,21.25,21.75,0.25); check('1. 接得上 4/4 21:30 的海邊照片（照舊）',byTag('y2s2_spring_photo').length===1);
  /* 睡過頭：4/1 晚上睡到 4/3 早上 → 照原本的時間補在 4/2 21:00 */
  toAsk(false); at(SP.dl,22); rules(); at(SP.d0,9); rules(); const M2=byTag('y2s2_spring_none');
  check('1. 4/1 睡到 4/3（跳過時間）：那一則照原本的時間補在 4/2 21:00',M2.length===1&&M2[0].day===d2&&Math.abs(M2[0].h-21)<0.02,J(M2.map(m=>[keyOf(m.day),m.h])));
  /* 玩家改過名字 */
  toAsk(false); H.G.name='柏宇'; for(const d of [SP.inv+1,SP.dl,d2]) run(d,8,23.5,0.5);
  check('1. 柏翰那一句說的是玩家的名字（同 @'+'名字的做法）',byTag('y2s2_spring_none').map(m=>m.text).join()===NONE.t.replace(/^祐廷/,'柏宇'),J(byTag('y2s2_spring_none').map(m=>m.text)));
  /* 不在群組：只和可昕交往 */
  fresh(SP.inv,20,{}); H.FRIEND('kexin'); H.date('kexin'); H.G.flags.dating_kexin=true; run(SP.inv,20.5,21.75); await choose('和可昕開車旅行');
  check('1. 不在群組（只有可昕的邀約）：選了也不傳群組那一句',H.G.flags.SPRING_Y2==='kexin'&&!byTag('y2s2_spring_pick').length&&!TH(NG).length);
  fresh(SP.inv,20,{}); H.FRIEND('kexin'); H.date('kexin'); H.G.flags.dating_kexin=true; for(const d of [SP.inv,SP.inv+1,SP.dl,d2]) run(d,8,23.5,0.5);
  check('1. 不在群組、沒回（none）：沒有柏翰那一句',H.G.flags.SPRING_Y2==='none'&&!byTag('y2s2_spring_none').length);
  /* 大一下已經傳過 spring_pick_msg（同一個存檔）*/
  toAsk(false); H.G.msgs.push({day:D('2026-03-25'),h:21.05,th:NG,from:'player',who:null,text:'我去。',tag:'spring_pick_msg'}); await choose('跟麵店團出去');
  check('1. 大一下已經傳過（spring_pick_msg）：大二下照傳',J(grpPick())===J(want('noodle')));
  /* 舊存檔：更新以前就選過（SPRING_Y2 有值）＝不補發 */
  toAsk(false); H.G.flags.SPRING_Y2='noodle'; run(SP.inv,22,23.5); for(const d of [SP.inv+1,SP.dl,d2]) run(d,8,23.5,0.5);
  check('1. 舊存檔（已經選過）：不補發祐廷那一句、也沒有柏翰那一句',!byTag('y2s2_spring_pick').length&&!byTag('y2s2_spring_none').length&&!GROUP.springPending(H.G));
});

/* ---- 2 Kevin 的生日貼文 ---- */
const kv=()=>TH('g:family_law').filter(m=>m.from==='kevin').map(m=>m.text);
await sec(2,()=>{
  fresh('2026-06-02',9,{met_sis:true,SIS_W1:true}); PHONE.join(H.G,'family_law','法律系直屬家族'); run(D('2026-06-02'),11.5,12.5);
  check('2. 2026-06-02 12:10 家族群組 Kevin「'+OLD_KV+'」（照舊）',J(kv())===J([OLD_KV])&&byTag('sisy23_bday_kevin_y1').length===1&&Math.abs(byTag('sisy23_bday_kevin_y1')[0].h-(12+10/60))<0.26,J(kv()));
  fresh('2027-06-02',9,{met_sis:true,SIS_W1:true}); PHONE.join(H.G,'family_law','法律系直屬家族'); run(D('2027-06-02'),11.5,12.5);
  check('2. 2027-06-02 12:10 換成「'+KV27.t+'」（第 2 節；tag sisy23_bday_kevin_y2 不變）',J(kv())===J([KV27.t])&&byTag('sisy23_bday_kevin_y2').length===1&&Math.abs(byTag('sisy23_bday_kevin_y2')[0].h-(12+10/60))<0.26,J(kv()));
  check('2. 兩年不再一字不差',KV27.t!==OLD_KV);
  fresh('2027-06-02',13,{met_sis:true,SIS_W1:true}); PHONE.join(H.G,'family_law','法律系直屬家族'); H.G.msgs.push({day:D('2027-06-02'),h:12+10/60,th:'g:family_law',from:'kevin',name:'Kevin',text:OLD_KV,tag:'sisy23_bday_kevin_y2'}); run(D('2027-06-02'),13,13.5); run(D('2027-06-03'),9,9.5);
  check('2. 舊存檔：2027 那一則已經用舊句收過＝不重發',J(kv())===J([OLD_KV]),J(kv()));
  fresh('2027-06-02',9,{SIS_W1:true}); PHONE.join(H.G,'family_law','法律系直屬家族'); run(D('2027-06-02'),11.5,12.5);
  check('2. 不認識學姊（met_sis 沒有）：照舊不發',!kv().length);
});

/* ---- 3 芷若的兩張截圖 ---- */
await sec(3,()=>{
  const f11=D('2026-11-11'); fresh(f11,21,{}); H.FAMILIAR('heroine_02'); H.G.contacts.heroine_02=0; run(f11,21,22.5);
  const m=PHONE.byAsk(H.G,'r3_zr_fee'); const r=m?PHONE.answer(H.G,'r3_zr_fee',0):null; const sh=TH('p:heroine_02').filter(x=>/^📷（對話的截圖/.test(x.text)).map(x=>x.text);
  check('3. 11/11 回「妳先把你們的對話拍給我看。」：兩張截圖，第一張「'+OLD_SHOT+'」、第二張「'+ZR2.t+'」（第 3 節）',!!r&&J(sh)===J([OLD_SHOT,ZR2.t])&&sh[0]!==sh[1],J(sh));
  check('3. R3.ZR_FEE_SHOTS 兩張不再一字不差（另一個選項、二十分鐘後的時間表都用同一組）',R3.ZR_FEE_SHOTS[0].text===OLD_SHOT&&R3.ZR_FEE_SHOTS[1].text===ZR2.t,J(R3.ZR_FEE_SHOTS.map(x=>x.text)));
});

H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });
