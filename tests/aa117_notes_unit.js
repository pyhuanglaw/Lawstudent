// 朋友的案子：手機筆記畫面（AA117-CASE-NOTES-1031；AA_117 第 1 節「畫面上是祐廷的手機筆記，四行」，照 C1 阿凱的鍵盤的做法）——不需要瀏覽器。
//   0 讀稿：AA_117 第 1 節四行、C1 的四行（BB_154）、C2 自動填好的三格（BB_70 8b-1）、C3 誰／向誰（AA_325 旁白）
//   1 C2 芷若的試譯稿費（手機）：11/11 那一則的回覆帶手機筆記四行「誰：芷若」「向誰：出版社」「依據什麼：」「請求什麼：照用的部分付稿費，或不要用」；
//     回覆選項照舊（沒有 U_CONTRACT 一個、有兩個）；選了以後照舊
//   2 game3d.js 的 noteHint：回覆按鈕上面放「手機筆記」和那幾行（從 game3d.js 抽那一行跑；沒有 note 的訊息＝空字串）；threadHTML 有接
//   3 C3 押金（當面）：旁白照舊，接著「手機筆記」說「誰：阿哲的學長」「向誰：房東」「依據什麼：」→ 依據的選項（三個／兩個照舊）→ … →「請求什麼：」→ 請求的選項；其他台詞、旗標照舊
//   4 C1 照舊（四行在、字不變）
// 其他六件（C0、C4～C8）稿沒有四格的內容：不做，列給 AA（見回報）。
// 修改前（開發分支 bfafd1a62）：1、2、3 FAIL。用法：node tests/aa117_notes_unit.js
//   （稿用 git show 讀；在沒有 .git 的目錄跑時，設環境變數 XC_GIT_DIR＝這個 repo 的目錄）
'use strict';
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H, J=JSON.stringify;
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
const PG_FILES=new Set(['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js',
  'src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/data/syllabus.js','src/data/exam_bank.js','src/data/legal_qbank.js','src/classes3d.js','src/data/postgrad_lines.js','src/postgrad3d.js']);
const SKIP=new Set(['src/character3d.js','src/engine3d.js','src/townkit3d.js','src/zones3d.js','src/bike3d.js','src/adv3d.js','src/game3d.js']);
const loadErr=[];
{ const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'); const files=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>f.startsWith('src/')&&!PG_FILES.has(f)&&!SKIP.has(f));
  for(const f of files){ try{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }catch(e){ loadErr.push(f+'：'+String(e.message).slice(0,100)); } } }
GM.toast=()=>{}; GM.caption=()=>{}; GM.spawnNPC=()=>null; GM.spawnCharacter=()=>null; GM.phoneBadge=()=>{};
const GITDIR=process.env.XC_GIT_DIR||H.ROOT;
const doc=(refs,f)=>{ for(const r of refs){ try{ const t=cp.execSync('git -c core.quotepath=false show "'+r+':docs/story_planning/'+f+'"',{cwd:GITDIR,encoding:'utf8',maxBuffer:8<<20,stdio:['ignore','pipe','ignore']}); if(t) return t; }catch(e){} } return ''; };
const B='origin/claude/cool-heisenberg-o8kuqx';
const DOC117=doc(['4618aed21',B],'AA_117_朋友的案子_四個問題.md'), DOC70=doc(['4618aed21',B],'BB_70_日常與邀約_芷若_子晴_溫學姊_配角.md'),
  DOC154=doc(['968473469',B],'BB_154_AB27_大一下缺口_學姊傳書_阿凱鍵盤.md'), DOC325=doc([B],'AA_325_事件包_第2輪之一_大二.md');
const D=k=>STORY.dayOfKey(k);
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
/* 照順序記下台詞和選項（看「依據什麼：」是不是緊接在那一組選項前面）*/
let LOG=[]; const say0=GM.say, choose0=GM.choose;
GM.say=async(who,t)=>{ LOG.push({who:who?(who.name||String(who)):null,t:String(t)}); return say0(who,t); };
GM.choose=async o=>{ LOG.push({choice:o.map(q=>q.t||q.text)}); return choose0(o); };
const NOTE_C2=['誰：芷若','向誰：出版社','依據什麼：','請求什麼：照用的部分付稿費，或不要用'];
const C3_NARR='（你打開手機的筆記，先寫了兩行：誰——阿哲的學長；向誰——房東。）';

(async()=>{
  check('0. 載入（index.html 上的 src 檔，game3d.js 另外讀）',!loadErr.length,loadErr.join(' / '));
  /* ======================= 0 讀稿 ======================= */
  check('0. AA_117 第 1 節：手機筆記四行（誰、向誰、依據什麼、請求什麼）、每件只有一到兩行要玩家選、其他自動填好',DOC117.includes('畫面上是祐廷的手機筆記，四行')&&['   - 誰：','   - 向誰：','   - 依據什麼：','   - 請求什麼：'].every(k=>DOC117.includes(k))&&DOC117.includes('每件只有一到兩行要玩家選'));
  check('0. C1 的四行（BB_154）：誰：阿凱／向誰：賣家／依據什麼：（還不知道。民總的課本？）／請求什麼：← 玩家選',['  - 誰：阿凱','  - 向誰：賣家','  - 依據什麼：（還不知道。民總的課本？）','  - 請求什麼：'].every(k=>DOC154.includes(k)));
  { const row=(DOC70.split('\n').find(l=>l.startsWith('| C2 芷若的試譯稿費'))||'');
    check('0. C2（BB_70 8b-1）：自動填好的「誰＝芷若；向誰＝出版社；請求什麼＝照用的部分付稿費，或不要用」、玩家選「依據什麼」；AA_117 C2 請求什麼同一句',row.includes('| 誰＝芷若；向誰＝出版社；請求什麼＝照用的部分付稿費，或不要用 | **依據什麼** |')&&DOC117.includes('- 請求什麼：照用的部分付稿費，或不要用。'),row.slice(0,120)); }
  check('0. C3（AA_325）：旁白「'+C3_NARR+'」；AA_117 C3 重點一依據什麼、重點二請求什麼',DOC325.includes('> '+C3_NARR)&&DOC117.includes('- 重點一：**依據什麼**。')&&DOC117.includes('- 重點二：**請求什麼**。'));

  /* ======================= 1 C2 芷若的試譯稿費（手機）======================= */
  await sec('1',async()=>{
  const run=(G,d,h0,h1)=>{ G.day=d; for(let h=h0;h<=h1+1e-9;h+=0.25){ G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(G); } };
  const setup=flags=>{ const d=D('2026-11-11'); const G=H.fresh('2026-11-11',21,'dorm',Object.assign({introDone:true},flags||{})); H.FAMILIAR('heroine_02'); G.contacts=G.contacts||{}; G.contacts.heroine_02=0; return {G,d}; };
  { const {G,d}=setup({}); run(G,d,21,22.5); const m=PHONE.byAsk(G,'r3_zr_fee');
    check('1. 沒有 U_CONTRACT：11/11 22:07 那一則的回覆帶手機筆記四行（字照 BB_70 8b-1）；選項照舊一個',!!m&&J(m.ask.note)===J(NOTE_C2)&&J(m.ask.opts.map(o=>o.t))===J(['妳先把你們的對話拍給我看。']),J(m&&m.ask)); }
  { const {G,d}=setup({U_CONTRACT:true}); run(G,d,21,22.5); const m=PHONE.byAsk(G,'r3_zr_fee');
    check('1. 有 U_CONTRACT：一樣四行；選項照舊兩個',!!m&&J(m.ask.note)===J(NOTE_C2)&&J(m.ask.opts.map(o=>o.t))===J(['妳先把你們的對話拍給我看。','先看你們說好了什麼。']),J(m&&m.ask));
    PHONE.answer(G,'r3_zr_fee',1); const T=(G.msgs||[]).filter(x=>x.th==='p:heroine_02').map(x=>(x.from||'')+':'+x.text);
    check('1. 選了以後照舊（祐廷接著傳「說好試譯不付錢，是試譯。……」、ZR_FEE contract）；筆記不是訊息（對話串裡沒有「誰：芷若」）',G.flags.ZR_FEE==='contract'&&T.includes('player:說好試譯不付錢，是試譯。拿去用，就不是試譯了。')&&!T.some(t=>/誰：|向誰：|依據什麼：|請求什麼：/.test(t)),J(T)); }
  });

  /* ======================= 2 game3d.js noteHint ======================= */
  await sec('2',async()=>{ const src=fs.readFileSync(path.join(H.ROOT,'src/game3d.js'),'utf8'); const mm=/\n  const noteHint=(m=>\{.*\});\n/.exec(src);
    check('2. game3d.js 有 noteHint、threadHTML 在回覆按鈕前面接（needHint→noteHint→askBtns）',!!mm&&src.includes('(needHint(m)+noteHint(m)+askBtns(m))'));
    if(!mm) return; const escH=s=>String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); const f=new Function('escH','return ('+mm[1]+');')(escH);
    const h=f({ask:{note:NOTE_C2.concat(['<b>'])}}), z=f({ask:{opts:[]}}), z2=f({text:'x'});
    check('2. noteHint：有 note＝「手機筆記」＋每一行（逐行、跳脫）；沒有 note＝空字串',h.includes('<b>手機筆記</b><br>誰：芷若<br>向誰：出版社<br>依據什麼：<br>請求什麼：照用的部分付稿費，或不要用<br>&lt;b&gt;')&&z===''&&z2==='',h); });

  /* ======================= 3 C3 押金（當面）======================= */
  await sec('3',async()=>{
  const dep=async(flags,picks)=>{ const G=H.fresh('2027-03-23',18,'noodle',Object.assign({introDone:true},flags||{})); SOCIAL.remember('zhe','FIRST_MET',''); LOG=[]; H.said=[]; H.opts=[]; H.picks=picks.slice(); await EVENTS.run(ev('ev_zhe_deposit')); return G; };
  { const G=await dep({U_LEASE:true},['押金是擔保','合理']); const i=LOG.findIndex(x=>x.t===C3_NARR), nt=LOG.filter(x=>x.who==='手機筆記').map(x=>x.t), c=LOG.map((x,k)=>x.choice?k:-1).filter(k=>k>=0);
    const iA=LOG.findIndex(x=>x.who==='手機筆記'&&x.t==='依據什麼：'), iR=LOG.findIndex(x=>x.who==='手機筆記'&&x.t==='請求什麼：');
    check('3. 旁白照舊，接著「手機筆記」：誰：阿哲的學長／向誰：房東／依據什麼：（緊接依據的選項）……請求什麼：（緊接請求的選項）',i>=0&&J(nt)===J(['誰：阿哲的學長','向誰：房東','依據什麼：','請求什麼：'])&&LOG[i+1].t==='誰：阿哲的學長'&&c.length===2&&iA===c[0]-1&&iR===c[1]-1,J(LOG.slice(Math.max(0,i),i+6)));
    check('3. 依據的選項（有 U_LEASE 三個）、請求的選項（兩個）照舊；其他台詞、旗標照舊（ZHE_DEPOSIT lease／fair、ZHE_PHOTOS）',J(LOG[c[0]].choice)===J(['「先把租約和搬進來的照片給我看。」','「押金是擔保，扣要說得出理由。」','「我不確定。週六去法服問。」'])&&J(LOG[c[1]].choice)===J(['「全部退。」','「退押金，牆要補就扣合理的錢。」'])&&H.has('押金是擔保。房東要扣，要說得出弄壞了什麼、修要多少。正常住的痕跡不一樣。')&&H.has('……好啦，那個洞是他掛球衣的。')&&H.has('好。你寫的那幾行傳給我，我轉給他。')&&G.flags.ZHE_DEPOSIT&&G.flags.ZHE_DEPOSIT.basis==='lease'&&G.flags.ZHE_DEPOSIT.ask==='fair'&&SOCIAL.has('zhe','ZHE_PHOTOS'),J(LOG.filter(x=>x.choice))); }
  { await dep({},[]); const c=LOG.filter(x=>x.choice); check('3. 沒有 U_LEASE：依據的選項照舊兩個；筆記一樣四行',c.length===2&&c[0].choice.length===2&&J(LOG.filter(x=>x.who==='手機筆記').map(x=>x.t))===J(['誰：阿哲的學長','向誰：房東','依據什麼：','請求什麼：']),J(c)); }
  });

  /* ======================= 4 C1 照舊 ======================= */
  { const e=ev('ev_kai_keyboard'), N=(e&&e.dialogue||[]).filter(l=>l&&l.speaker==='手機筆記').map(l=>l.text);
    check('4. C1 阿凱的鍵盤照舊：四行（誰：阿凱／向誰：賣家／依據什麼：（還不知道。民總的課本？）／請求什麼：）',J(N)===J(['誰：阿凱','向誰：賣家','依據什麼：（還不知道。民總的課本？）','請求什麼：']),J(N)); }
  H.done();
})();
